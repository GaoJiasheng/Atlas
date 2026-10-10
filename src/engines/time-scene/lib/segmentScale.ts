/**
 * Timeline x mapping of the segmented bar (docs/06 "底部条"): one equal-width
 * segment per story chapter, a tick per presentation beat inside it. Pure and
 * unit-tested (tests/time-scene/segmentScale.test.ts).
 *
 * Segment i covers the time span [start_i, end_i]:
 *   start_i = the chapter's time, or its first beat's `t` if earlier
 *             (never before start_{i-1}, so starts are ordered)
 *   end_i   = start_{i+1}, or the chapter's last tick if that is later
 *             (the last segment: the last tick or the data maximum, whichever is later)
 * Inside a segment a tick sits at its beat's `t`, linear over the span, then
 * nudged apart to at least `minTickGap` px (as much as the segment allows).
 * x ↔ t is piecewise linear through the knots
 *   (start, x0) · the ticks (t, x) in time order · (end, x1)
 * so a segment maps its whole span onto its own width and inverts exactly.
 *
 * Chapters may overlap in time (a chapter's last beats can come after the
 * next chapter starts), so a time can sit in more than one segment. `x(t)`
 * then takes an anchor: the segment the playhead belongs to (the current
 * chapter, the beat just applied, the segment being scrubbed), and the tick
 * when the time is exactly a beat's. Without one (keyframes, swimlanes), the
 * first segment whose span holds `t`; that default is monotonic in `t`.
 */
import { clamp } from './time';

/** Gap between two segments (px). */
export const SEGMENT_GAP = 6;
/** Smallest distance between two beat ticks inside a segment (px), when the segment is wide enough. */
export const MIN_TICK_GAP = 10;

export interface SegmentSpec {
  id: string;
  /** The chapter's time (numeric, lib/time.ts). */
  time: number;
  /** Its beats' times in beat order; empty = one tick at `time`. */
  beats: readonly number[];
}

export interface SegmentScaleInput {
  segments: readonly SegmentSpec[];
  /** Data maximum: the last segment runs at least this far. */
  max: number;
  /** Bar width (px). */
  width: number;
  gap?: number;
  minTickGap?: number;
}

export interface ScaleTick {
  /** Beat index inside the chapter. */
  index: number;
  t: number;
  x: number;
}

export interface ScaleSegment {
  id: string;
  index: number;
  start: number;
  end: number;
  x0: number;
  x1: number;
  /** In beat order. */
  ticks: ScaleTick[];
  /** Piecewise-linear knots, ordered by both t and x. */
  knots: { t: number; x: number }[];
}

/** Where the playhead belongs: a segment, and the tick when the time is exactly that beat's. */
export interface Anchor {
  segment: number;
  tick?: number | null;
}

export interface SegmentScale {
  width: number;
  segments: ScaleSegment[];
  /** Segment whose span holds `t`: `prefer` when it does, else the first that does, else the nearer end. */
  locate(t: number, prefer?: number | null): number;
  /** Time → px. */
  x(t: number, anchor?: Anchor | null): number;
  /** Segment under `px` (the gap between two belongs to the nearer one). */
  segmentAt(px: number): number;
  /** px → time, and the segment it is in. */
  invert(px: number): { t: number; segment: number };
}

/** Ticks of one segment: linear positions in [x0, x1], pushed apart to `gap` px (less when the segment is too narrow). */
export function spreadTicks(linear: readonly number[], x0: number, x1: number, gap: number): number[] {
  const n = linear.length;
  if (n === 0) return [];
  const g = n > 1 ? Math.min(gap, (x1 - x0) / (n - 1)) : gap;
  const p = linear.map((x) => clamp(x, x0, x1));
  for (let k = 1; k < n; k++) p[k] = Math.max(p[k]!, p[k - 1]! + g);
  p[n - 1] = Math.min(p[n - 1]!, x1);
  for (let k = n - 2; k >= 0; k--) p[k] = Math.min(p[k]!, p[k + 1]! - g);
  return p;
}

export function createSegmentScale(input: SegmentScaleInput): SegmentScale {
  const { width, max } = input;
  const gap = input.gap ?? SEGMENT_GAP;
  const minTickGap = input.minTickGap ?? MIN_TICK_GAP;
  const specs = input.segments.map((s) => ({ ...s, ticks: s.beats.length ? [...s.beats] : [s.time] }));
  const n = specs.length;
  const slot = n > 0 ? width / n : width;

  const starts: number[] = [];
  for (const [i, s] of specs.entries()) {
    const own = Math.min(s.time, ...s.ticks);
    starts.push(i > 0 ? Math.max(own, starts[i - 1]!) : own);
  }

  const segments: ScaleSegment[] = specs.map((s, i) => {
    const start = starts[i]!;
    const last = Math.max(...s.ticks);
    const end = Math.max(last, i + 1 < n ? starts[i + 1]! : Math.max(max, s.time), start);
    const x0 = i * slot + (i > 0 ? gap / 2 : 0);
    const x1 = Math.max(x0, (i + 1) * slot - (i < n - 1 ? gap / 2 : 0));
    const span = end - start;
    const lin = (t: number) => (span > 0 ? x0 + ((t - start) / span) * (x1 - x0) : x0);
    // Time order (beat order breaks ties), positions spread, then back to beat order.
    const order = s.ticks.map((t, index) => ({ t, index })).sort((a, b) => a.t - b.t || a.index - b.index);
    const xs = spreadTicks(
      order.map((o) => lin(o.t)),
      x0,
      x1,
      minTickGap,
    );
    const placed = order.map((o, k) => ({ index: o.index, t: o.t, x: xs[k]! }));
    const knots = [{ t: start, x: x0 }, ...placed.map((p) => ({ t: clamp(p.t, start, end), x: p.x })), { t: end, x: x1 }];
    return { id: s.id, index: i, start, end, x0, x1, ticks: [...placed].sort((a, b) => a.index - b.index), knots };
  });

  const within = (seg: ScaleSegment, t: number) => {
    const v = clamp(t, seg.start, seg.end);
    const k = seg.knots;
    for (let i = 0; i < k.length - 1; i++) {
      const a = k[i]!;
      const b = k[i + 1]!;
      if (v > b.t) continue;
      return b.t > a.t ? a.x + ((v - a.t) / (b.t - a.t)) * (b.x - a.x) : a.x;
    }
    return seg.x1;
  };

  const locate = (t: number, prefer?: number | null) => {
    if (n === 0) return -1;
    const p = prefer !== null && prefer !== undefined ? segments[prefer] : undefined;
    if (p && t >= p.start && t <= p.end) return p.index;
    const hit = segments.find((s) => t >= s.start && t <= s.end);
    if (hit) return hit.index;
    return t < segments[0]!.start ? 0 : n - 1;
  };

  const x = (t: number, anchor?: Anchor | null) => {
    if (n === 0 || !Number.isFinite(t)) return 0;
    if (anchor && anchor.tick !== null && anchor.tick !== undefined) {
      const tick = segments[anchor.segment]?.ticks[anchor.tick];
      if (tick && tick.t === t) return tick.x;
    }
    return within(segments[locate(t, anchor?.segment)]!, t);
  };

  const segmentAt = (px: number) => (n === 0 ? -1 : clamp(Math.floor(px / slot), 0, n - 1));

  const invert = (px: number) => {
    const i = segmentAt(px);
    const seg = segments[i];
    if (!seg) return { t: max, segment: -1 };
    const v = clamp(px, seg.x0, seg.x1);
    const k = seg.knots;
    for (let j = 0; j < k.length - 1; j++) {
      const a = k[j]!;
      const b = k[j + 1]!;
      if (v > b.x) continue;
      return { t: b.x > a.x ? a.t + ((v - a.x) / (b.x - a.x)) * (b.t - a.t) : a.t, segment: i };
    }
    return { t: seg.end, segment: i };
  };

  return { width, segments, locate, x, segmentAt, invert };
}
