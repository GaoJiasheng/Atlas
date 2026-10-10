/**
 * The presentation's beat model (docs/06 "演示系统（core）"): every chapter
 * contributes its own beats (the engine reads them from the chapter state,
 * `PresentationAdapter.beatsOf`), or one default beat whose caption is the
 * chapter's `summary`, else its `question`, else its title. Beats are
 * flattened across chapters in chapter order (the background chapter first),
 * each knowing its chapter position and its place inside the chapter. Pure:
 * no React, no DOM.
 */
import type { BilingualText } from '../../../i18n';
import type { BeatInfo } from '../controls';
import type { Chapter } from '../types';

/** What every engine's beat carries; the engine adds its own optional fields (camera, time, parts …). */
export interface BeatBase {
  caption: BilingualText;
  /** Site path of a narration clip, played on entering the beat (preloaded on entering the presentation). */
  audio?: string;
}

/** One presentation beat, flattened across chapters. */
export interface Beat<B extends BeatBase = BeatBase> extends BeatInfo {
  /** 0-based chapter position (in the topic's chapter list, the background chapter included). */
  chapterIndex: number;
  /** Beats in this chapter. */
  count: number;
  audio?: string;
  /** The engine's own beat; absent for a chapter's default beat (its state, `summary` as caption). */
  spec?: B;
}

/** First beat and beat count of one chapter (`first` = -1 when it has none). */
export interface ChapterSpan {
  first: number;
  count: number;
}

const isBilingual = (v: unknown): v is BilingualText => typeof v === 'object' && v !== null && typeof (v as { en?: unknown }).en === 'string';

/** Caption of a chapter's default beat: its `summary`, else its `question`, else its title. */
export function defaultCaption(chapter: Pick<Chapter, 'title' | 'state'>): BilingualText {
  const state = (chapter.state ?? {}) as { summary?: unknown; question?: unknown };
  if (isBilingual(state.summary)) return state.summary;
  if (isBilingual(state.question)) return state.question;
  return chapter.title;
}

/** Every beat of every chapter, in order. `beatsOf` returns the chapter's own beats (none or empty = one default beat). */
export function buildBeats<C extends Pick<Chapter, 'id' | 'title' | 'state'>, B extends BeatBase>(
  chapters: readonly C[],
  beatsOf: (chapter: C) => readonly B[] | undefined,
): Beat<B>[] {
  return chapters.flatMap((c, ci) => {
    const own = beatsOf(c);
    if (!own || own.length === 0) return [{ chapter: c.id, chapterIndex: ci, index: 0, count: 1, caption: defaultCaption(c) }];
    return own.map((b, i) => ({
      chapter: c.id,
      chapterIndex: ci,
      index: i,
      count: own.length,
      caption: b.caption,
      ...(b.audio ? { audio: b.audio } : {}),
      spec: b,
    }));
  });
}

/** First beat and beat count of every chapter (the progress bar's segments). */
export function chapterSpans(chapterCount: number, beats: readonly Pick<Beat, 'chapterIndex'>[]): ChapterSpan[] {
  return Array.from({ length: chapterCount }, (_, ci) => {
    const first = beats.findIndex((x) => x.chapterIndex === ci);
    return { first, count: first < 0 ? 0 : beats.filter((x) => x.chapterIndex === ci).length };
  });
}

/** Where entering the presentation starts: `requested` if given, else the current chapter's first beat, else beat 0 (clamped). */
export function startIndex(beats: readonly Pick<Beat, 'chapter'>[], currentChapter: string | null, requested: number | null): number {
  const here = beats.findIndex((b) => b.chapter === currentChapter);
  return Math.min(Math.max(requested ?? Math.max(0, here), 0), Math.max(0, beats.length - 1));
}

/** The beat one step from `index` in `dir`, or `null` past either end. */
export function stepIndex(index: number, dir: 1 | -1, total: number): number | null {
  const next = index + dir;
  return next >= 0 && next < total ? next : null;
}

/** What `__atlas.beats()` lists for each beat. */
export function beatInfos(beats: readonly Beat<BeatBase>[]): BeatInfo[] {
  return beats.map(({ chapter, index, caption }) => ({ chapter, index, caption }));
}

/** The beat on show as `__atlas.state().presentation` reports it; `null` outside the presentation. */
export function current(
  beats: readonly Pick<Beat, 'chapter' | 'index'>[],
  index: number | null,
  switches: { autoplay: boolean; voice: boolean },
): { chapter: string; beat: number; autoplay: boolean; voice: boolean } | null {
  const b = index !== null ? beats[index] : undefined;
  return b ? { chapter: b.chapter, beat: b.index, ...switches } : null;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Status-line text of the presentation mode: `PRESENTATION 03/40`, or `PRESENTATION` outside it. */
export function presentationStatus(index: number | null, total: number): string {
  return index === null ? 'PRESENTATION' : `PRESENTATION ${pad2(index + 1)}/${pad2(total)}`;
}
