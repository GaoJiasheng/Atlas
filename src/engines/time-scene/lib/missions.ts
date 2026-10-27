/** Mission location semantics shared by the map, inspector and read-only QA API. */
import type { SceneEvent } from '../schema';
import type { TimeModel } from './model';
import type { Locale } from '../../core/types';

const SETTINGS = {
  suborbital: { en: 'Suborbital flight', zh: '亚轨道飞行' },
  'earth-surface': { en: 'Earth surface', zh: '地表任务' },
  'earth-orbit': { en: 'Earth orbit', zh: '地球轨道任务' },
  'lunar-orbit': { en: 'Lunar orbit', zh: '月球轨道任务' },
  'moon-surface': { en: 'Moon surface', zh: '月面任务' },
  cislunar: { en: 'Cislunar space', zh: '地月空间任务' },
};
export function missionSetting(event: SceneEvent, locale: Locale): string | null {
  return event.missionContext ? SETTINGS[event.missionContext.setting][locale] : null;
}
export function missionBadge(event: SceneEvent, locale: Locale): string | null {
  const setting = missionSetting(event, locale);
  return setting ? `${setting} · ${locale === 'zh' ? '关联发射中心' : 'associated launch centre'}` : null;
}
/** No separate state: each call reads the immutable normalised event. */
export function missionContext(model: TimeModel, id: string) {
  const item = model.events.find((item) => item.event.id === id);
  const m = item?.missionContext;
  if (!item || !m) return null;
  return { setting: m.setting, anchorRole: m.anchorRole, anchorSite: m.anchorSite, relatedSites: [...(m.relatedSites ?? [])], occurredAt: m.occurredAt ?? null, at: item.event.at ? [...item.event.at] : null };
}
/** Never let unlocated evidence enter any map geometry or camera bounds. */
export function hasMapAnchor(event: SceneEvent): event is SceneEvent & { at: [number, number] } {
  return event.mapVisibility !== 'timeline-only' && event.at !== undefined;
}

/** Explicit chapter/beat highlights are the index; mission facilities follow their evidence. */
export function missionChapterIndex(events: readonly SceneEvent[], state: { highlight?: string[]; beats?: { highlight?: string[] }[] } | undefined): SceneEvent[] {
  const ids = new Set([...(state?.highlight ?? []), ...(state?.beats ?? []).flatMap((beat) => beat.highlight ?? [])]);
  for (const id of [...ids]) {
    const context = events.find((event) => event.id === id)?.missionContext;
    if (context) {
      ids.add(context.anchorSite);
      for (const site of context.relatedSites ?? []) ids.add(site);
    }
  }
  return [...ids].flatMap((id) => {
    const event = events.find((event) => event.id === id);
    return event ? [event] : [];
  });
}
