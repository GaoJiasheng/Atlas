/**
 * Timeline x mapping: a minimum-gap hybrid of linear time and evenly spaced
 * chapters (docs/06 "时间轴标尺"). Pure and unit-tested.
 *
 *   x(t) = α · lin(t) + (1 − α) · chap(t)
 *
 *   lin(t)   linear over the data span: (t − min) / span · width
 *   chap(t)  piecewise linear through the knots {min, chapter times…, max}
 *            (distinct, sorted) placed evenly: knot k sits at k · width / (K − 1)
 *
 * α ∈ [0, 1] is the largest value that keeps every pair of adjacent (distinct)
 * chapter nodes at least `minGap` px apart. Both terms are linear between two
 * knots and the chapter term spaces knots evenly (Δc = width / (K − 1)), so
 * for a pair whose linear gap Δl is too small the constraint
 * α·Δl + (1 − α)·Δc ≥ minGap gives α ≤ (Δc − minGap) / (Δc − Δl); the
 * answer is the smallest of these (1 when every pair already fits). When even
 * evenly spaced nodes are closer than `minGap` (Δc < minGap) the best that can
 * be done is α = 0. Chapters at the same time share one knot and are skipped.
 *
 * x is strictly increasing and linear between knots, so its inverse (pointer
 * → time, for scrubbing) is exact per segment.
 */
import { clamp } from './time';

/** Smallest distance between two adjacent chapter nodes on the rule (px). */
export const MIN_NODE_GAP = 56;

export interface TimeScaleInput {
  min: number;
  max: number;
  /** Chapter node times (any order, duplicates allowed). */
  nodes: readonly number[];
  /** Rule width in px. */
  width: number;
  minGap?: number;
  /** Use this α instead of fitting one (e.g. the band card reuses the rule's α). */
  alpha?: number;
}

export interface TimeScale {
  alpha: number;
  width: number;
  /** Time → px in [0, width]. */
  x(t: number): number;
  /** px → time in [min, max]. */
  invert(px: number): number;
}

/** Distinct sorted knot times: the span ends plus every chapter time inside the span. */
export function scaleKnots(min: number, max: number, nodes: readonly number[]): number[] {
  const inner = nodes.filter((n) => Number.isFinite(n)).map((n) => clamp(n, min, max));
  return [...new Set([min, ...inner, max])].sort((a, b) => a - b);
}

/** The largest α that keeps adjacent chapter nodes `minGap` px apart (see the module comment). */
export function fitAlpha(min: number, max: number, nodes: readonly number[], width: number, minGap = MIN_NODE_GAP): number {
  const span = max - min;
  if (!(span > 0) || !(width > 0)) return 1;
  const knots = scaleKnots(min, max, nodes);
  const distinct = [...new Set(nodes.filter((n) => Number.isFinite(n)).map((n) => clamp(n, min, max)))].sort((a, b) => a - b);
  if (distinct.length < 2 || knots.length < 2) return 1;
  const dc = width / (knots.length - 1);
  let alpha = 1;
  for (let i = 1; i < distinct.length; i++) {
    const dl = ((distinct[i]! - distinct[i - 1]!) / span) * width;
    if (dl >= minGap) continue;
    if (dc <= minGap) return 0;
    alpha = Math.min(alpha, (dc - minGap) / (dc - dl));
  }
  return clamp(alpha, 0, 1);
}

export function createTimeScale(input: TimeScaleInput): TimeScale {
  const { min, max, nodes, width } = input;
  const span = max - min;
  const knots = scaleKnots(min, max, nodes);
  const segments = Math.max(1, knots.length - 1);
  const alpha = input.alpha ?? fitAlpha(min, max, nodes, width, input.minGap);
  const lin = (t: number) => (span > 0 ? ((t - min) / span) * width : 0);
  /** px of each knot under the hybrid mapping. */
  const knotX = knots.map((k, i) => alpha * lin(k) + (1 - alpha) * (i / segments) * width);

  const segmentOf = (t: number) => {
    let lo = 0;
    let hi = knots.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (knots[mid]! <= t) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  const x = (t: number) => {
    if (!(span > 0) || knots.length < 2) return 0;
    const v = clamp(t, min, max);
    const k = segmentOf(v);
    const a = knots[k]!;
    const b = knots[k + 1]!;
    const f = b > a ? (v - a) / (b - a) : 0;
    return knotX[k]! + f * (knotX[k + 1]! - knotX[k]!);
  };

  const invert = (px: number) => {
    if (!(span > 0) || knots.length < 2 || !(width > 0)) return min;
    const v = clamp(px, 0, width);
    let k = 0;
    while (k < knots.length - 2 && knotX[k + 1]! < v) k++;
    const x0 = knotX[k]!;
    const x1 = knotX[k + 1]!;
    const f = x1 > x0 ? (v - x0) / (x1 - x0) : 0;
    return knots[k]! + f * (knots[k + 1]! - knots[k]!);
  };

  return { alpha, width, x, invert };
}

/**
 * Tick thinning for a non-linear rule: keep a major tick's label only when it
 * is at least `labelGap` px from the last kept label, and drop minor ticks
 * closer than `minorGap` px to the previous tick drawn. Minor ticks come back
 * as px positions.
 */
export function thinTicks<T extends { t: number }>(
  major: readonly T[],
  minor: readonly number[],
  x: (t: number) => number,
  labelGap: number,
  minorGap = 3,
): { major: (T & { x: number; showLabel: boolean })[]; minor: number[] } {
  let lastLabel = -Infinity;
  const majors = major.map((m) => {
    const px = x(m.t);
    const showLabel = px - lastLabel >= labelGap;
    if (showLabel) lastLabel = px;
    return { ...m, x: px, showLabel };
  });
  const majorX = majors.map((m) => m.x);
  const minors: number[] = [];
  let last = -Infinity;
  for (const t of minor) {
    const px = x(t);
    if (px - last < minorGap || majorX.some((mx) => Math.abs(mx - px) < minorGap)) continue;
    minors.push(px);
    last = px;
  }
  return { major: majors, minor: minors };
}
