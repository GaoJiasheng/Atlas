/**
 * The chapter axis's model (docs/08 §2 "全引擎 HUD 铁律" a, docs/06 "章节轴"):
 * one segment per chapter, one tick per beat (a chapter without beats of its
 * own is one tick), the beat on show, stepping through the beats across
 * chapters, and the counter at the axis's right end. Pure: no React, no DOM.
 */

/** A beat as the axis needs it: its chapter and its place inside that chapter (0-based). */
export interface AxisBeatRef {
  chapter: string;
  index: number;
}

/** Horizontal place of tick `i` of `n` inside its segment, 0..1 (evenly spaced, centred). */
export function tickPosition(i: number, n: number): number {
  return n <= 0 ? 0 : (i + 0.5) / n;
}

/** How far the current segment's track is filled, 0..1: up to the beat on show; nothing when no beat is on show. */
export function segmentFill(beat: number | null, n: number): number {
  return beat === null || n <= 0 ? 0 : tickPosition(Math.min(Math.max(beat, 0), n - 1), n);
}

/** Position in the flattened beat list of beat `beat` of `chapter` (`null` = its first beat); -1 when unknown. */
export function flatIndex(beats: readonly AxisBeatRef[], chapter: string | null, beat: number | null): number {
  return beats.findIndex((b) => b.chapter === chapter && b.index === (beat ?? 0));
}

/**
 * The beat one step from the scene on show, across chapters (`,` / `.`).
 * `beat === null` is the chapter's own state, before its first beat: next =
 * that first beat when the chapter has beats of its own (`own`), else the beat
 * after it; previous = the beat before its first. `null` past either end.
 */
export function stepBeat(
  beats: readonly AxisBeatRef[],
  chapter: string | null,
  beat: number | null,
  own: boolean,
  direction: 1 | -1,
): number | null {
  const at = flatIndex(beats, chapter, beat);
  if (at < 0) return beats.length > 0 ? (direction > 0 ? 0 : null) : null;
  const next = beat === null && own && direction > 0 ? at : at + direction;
  return next >= 0 && next < beats.length ? next : null;
}

/** The axis's right-end counter: `05 · 2/8` (`05 · –/8` when the chapter's own state is on show). */
export function axisCounter(number: string, beat: number | null, count: number): string {
  const n = Math.max(1, count);
  return `${number} · ${beat === null ? '–' : Math.min(beat, n - 1) + 1}/${n}`;
}
