/**
 * TimeScene descriptor (client-safe, synchronous). The view is lazy-loaded.
 * Phase 2 replaces `./View` with GeoStage + Timeline; this file's contract
 * (extension fields and chapter-state mapping) should stay stable.
 */
import { defineEngine } from '../core/engine';
import type { ChapterState, TimePoint } from '../core/types';
import type { TimeSceneGeoData } from './schema';
import { isGeoTime } from '../../lib/time';
import { monthlyChapterFields } from './lib/climatology-state';

/** TimeScene's fields on top of SceneState. `t` is in the URL. */
export interface TimeSceneExt {
  /** Current time on the axis. */
  t: TimePoint | null;
  month?: number;
  beat: number | null;
  inset?: 'world' | 'southeast-asia' | 'mexico';
  insetVisible?: boolean;
  fossilMode?: 'age-window' | 'all-mesozoic';
  /** Ids (events, movements, entities) the current chapter emphasises. */
  highlight: string[];
}

function asTimePoint(value: unknown): TimePoint | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && isGeoTime(value as TimePoint)) return value as TimePoint;
  return null;
}

export const timeSceneEngine = defineEngine<TimeSceneExt, TimeSceneGeoData>({
  id: 'time-scene',
  defaults(topic, data) {
    if (topic.temporalMode === 'climatology') return { t: null, month: topic.climatology!.initialMonth, beat: 0, highlight: [], layers: ['base', 'sites'] };
    const first = data && 'control' in data ? data.control.keyframes[0]?.t : undefined;
    return { t: first ?? null, beat: null, highlight: [], layers: topic.basemap?.reconstruction ? ['base', 'fossils-modern'] : ['base', 'control', 'movements', 'battles'], ...(topic.modernInset ? { inset: topic.modernInset.defaultView, insetVisible: topic.modernInset.defaultVisible, fossilMode: 'age-window' as const } : {}) };
  },
  fromChapterState(state: ChapterState) {
    if (typeof state.month === 'number') return monthlyChapterFields(state);
    const out: Partial<TimeSceneExt> = {};
    const t = asTimePoint(state.time);
    if (t) out.t = t;
    out.beat = null;
    if (state.inset === 'world' || state.inset === 'southeast-asia' || state.inset === 'mexico') out.inset = state.inset;
    if (typeof state.insetVisible === 'boolean') out.insetVisible = state.insetVisible;
    if (state.fossilMode === 'age-window' || state.fossilMode === 'all-mesozoic') out.fossilMode = state.fossilMode;
    if (Array.isArray(state.highlight)) out.highlight = state.highlight.filter((h): h is string => typeof h === 'string');
    return out;
  },
  fromUrl(fields, topic) {
    if (topic?.temporalMode === 'climatology') return { t: null, ...(fields.month !== undefined ? {month: fields.month}: {}), ...(fields.beat !== undefined ? {beat: fields.beat} : {}), ...(fields.highlight !== undefined ? {highlight: fields.highlight}: {}) };
    const out: Partial<TimeSceneExt> = {};
    if (fields.beat !== undefined) out.beat = fields.beat;
    if (fields.inset !== undefined) out.inset = fields.inset;
    if (fields.insetVisible !== undefined) out.insetVisible = fields.insetVisible;
    if (fields.fossilMode !== undefined) out.fossilMode = fields.fossilMode;
    if (fields.t !== undefined) out.t = fields.t;
    if (fields.highlight !== undefined) out.highlight = fields.highlight;
    return out;
  },
  load: () => import('./View'),
});
