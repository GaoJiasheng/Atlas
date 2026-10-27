/** Calendar-month scenes are discrete authored beats; no date/playhead conversion. */
import type { Chapter, ChapterState, SceneSnapshot } from '../../core/types';
import type { SceneStore } from '../../core/store';
import type { UrlState } from '../../core/url-state';
import type { ClimatologyBeat, ClimatologyChapterState } from '../schema';
import type { TimeSceneExt } from '../index';

export type ClimatologyExt = TimeSceneExt & {
  month: number;
  beat: number | null;
};
export const ownMonthlyBeats = (chapter?: Pick<Chapter, 'state'>): readonly ClimatologyBeat[] =>
  (chapter?.state as ClimatologyChapterState | undefined)?.beats ?? [];

/** Chapter targets themselves are the first authored beat, including its camera. */
export function monthlyChapterFields(raw: ChapterState): Partial<SceneSnapshot<ClimatologyExt>> {
  const state = raw as ClimatologyChapterState;
  const first = state.beats?.[0];
  return {
    t: null,
    beat: 0,
    month: first?.month ?? state.month,
    ...(first?.camera ? { camera: first.camera } : {}),
    ...(first?.layers ? { layers: first.layers } : {}),
    highlight: first?.highlight ?? state.highlight ?? [],
  };
}

export function monthlyBeatScene(
  store: SceneStore<TimeSceneExt>,
  chapters: readonly Chapter[],
  chapter: string,
  index: number,
): SceneSnapshot<ClimatologyExt> {
  const target = store.getState().chapterTarget(chapter) as SceneSnapshot<ClimatologyExt>;
  const spec = ownMonthlyBeats(chapters.find((c) => c.id === chapter))[index];
  return {
    ...target,
    chapter,
    beat: spec ? index : 0,
    t: null,
    month: spec?.month ?? target.month,
    camera: spec?.camera ?? target.camera,
    layers: spec?.layers ?? target.layers,
    highlight: spec?.highlight ?? target.highlight,
  };
}

/** Apply URL priority before exposing the scene: chapter → beat → explicit overrides. */
export function monthlyUrlPatch(
  store: SceneStore<TimeSceneExt>,
  chapters: readonly Chapter[],
  decoded: UrlState,
): Partial<SceneSnapshot<TimeSceneExt>> {
  const chapter = chapters.some((c) => c.id === decoded.chapter) ? decoded.chapter! : (chapters[0]?.id ?? store.getState().chapter);
  if (!chapter) return { ...decoded, t: null };
  const own = ownMonthlyBeats(chapters.find((c) => c.id === chapter));
  const index =
    decoded.beat !== null && decoded.beat !== undefined && Number.isInteger(decoded.beat) && decoded.beat >= 0 && decoded.beat < own.length
      ? decoded.beat
      : 0;
  const { beat: _beat, t: _time, ...overrides } = decoded;
  return {
    ...monthlyBeatScene(store, chapters, chapter, index),
    ...overrides,
    chapter,
    t: null,
    beat: index,
  };
}

export function cycleMonth(month: number, delta: -1 | 1): number {
  return ((month - 1 + delta + 12) % 12) + 1;
}
export function monthText(month: number, locale: 'en' | 'zh'): string {
  return locale === 'zh'
    ? `${month}月`
    : new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, month - 1, 1)));
}
export function exploringText(month: number, authoredMonth: number, locale: 'en' | 'zh'): string {
  return month === authoredMonth
    ? ''
    : locale === 'zh'
      ? `正在查看${monthText(month, locale)}；字幕指原拍${monthText(authoredMonth, locale)}`
      : `Exploring ${monthText(month, locale)}; caption refers to ${monthText(authoredMonth, locale)}`;
}
