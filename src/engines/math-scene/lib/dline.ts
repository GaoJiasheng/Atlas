/**
 * The decimal number line and its zoom (docs/29 §3.4, model A6c): a line
 * from `from` to `to` in steps of `step` (at most 20), and under it up to two
 * lines that each blow one step of the line above up into ten — tenths,
 * then hundredths, then thousandths. A place on a line is a tick (steps from
 * its start); a zoom is the step (segment) opened. Rounding reads the two
 * ends of a line and its halfway mark. Exact (decimals); pure.
 */
import type { DecimalLineSpec } from '../schema';
import { add, atStep, cmp, eq, round, stepsBetween, truncate, type Decimal } from './decimal';

export interface LineLevel {
  from: Decimal;
  to: Decimal;
  step: Decimal;
  /** Steps from end to end. */
  steps: number;
}

/** Most steps on one line. */
export const LINE_MAX_STEPS = 20;

/** The line itself (`null` when its ends are not a whole number of steps apart). */
export function baseLevel(m: DecimalLineSpec): LineLevel | null {
  const steps = stepsBetween(m.from, m.to, m.step);
  return steps !== null && steps > 0 ? { from: m.from, to: m.to, step: m.step, steps } : null;
}

/** A tenth of a step (`null` past six places). */
function tenth(step: Decimal): Decimal | null {
  return step.units % 10 === 0 ? { units: step.units / 10, dp: step.dp + 1 } : null;
}

/** Segment `seg` of a line blown up into ten steps. */
export function zoomLevel(l: LineLevel, seg: number): LineLevel | null {
  const step = tenth(l.step);
  if (!step || seg < 0 || seg >= l.steps) return null;
  const from = atStep(l.from, l.step, seg);
  return { from, to: add(from, l.step), step, steps: 10 };
}

/** The value at a tick of a line. */
export const valueAt = (l: LineLevel, tick: number): Decimal => atStep(l.from, l.step, tick);
/** The tick a value sits on (`null` between ticks or off the line). */
export function tickOf(l: LineLevel, x: Decimal): number | null {
  const k = stepsBetween(l.from, x, l.step);
  return k !== null && k >= 0 && k <= l.steps ? k : null;
}
/** The segment a value lies in (its last step: the end of the line counts as the last segment). */
export function segmentOf(l: LineLevel, x: Decimal): number | null {
  if (cmp(x, l.from) < 0 || cmp(x, l.to) > 0) return null;
  const k = Math.floor((x.units - l.from.units) / l.step.units);
  return Math.min(k, l.steps - 1);
}

/** The lines a beat model draws: the line and its zoom levels as written (`null` where one is not one step of the line above). */
export function levelsOf(m: DecimalLineSpec): (LineLevel | null)[] {
  const out: (LineLevel | null)[] = [baseLevel(m)];
  for (const z of m.zoom ?? []) {
    const up = out.at(-1);
    const seg = up ? tickOf(up, z.from) : null;
    const next = up && seg !== null ? zoomLevel(up, seg) : null;
    out.push(next && eq(next.to, z.to) ? next : null);
  }
  return out;
}

/** The lines open on a check: the line, then each segment the child zoomed into. */
export function levelsFor(m: DecimalLineSpec, path: readonly number[]): LineLevel[] {
  const base = baseLevel(m);
  if (!base) return [];
  const out = [base];
  for (const seg of path) {
    const next = zoomLevel(out.at(-1)!, seg);
    if (!next) break;
    out.push(next);
  }
  return out;
}

/** The zooms and the tick that put `x` on the deepest of `depth` zoom levels (`null` when it is not on a tick there). */
export function pathTo(m: DecimalLineSpec, x: Decimal, depth: number): { path: number[]; tick: number } | null {
  const base = baseLevel(m);
  if (!base) return null;
  let level = base;
  const path: number[] = [];
  for (let k = 0; k < depth; k++) {
    const seg = segmentOf(level, x);
    const next = seg === null ? null : zoomLevel(level, seg);
    if (seg === null || !next) return null;
    path.push(seg);
    level = next;
  }
  const tick = tickOf(level, x);
  return tick === null ? null : { path, tick };
}

/* ------------------------------------------------------------------ */
/* Rounding on the line                                                */
/* ------------------------------------------------------------------ */

/** The two neighbours of `v` with `to` places (the ends of the rounding line) and the one it rounds to. */
export function roundingEnds(v: Decimal, to: number): { lo: Decimal; hi: Decimal; nearest: Decimal } {
  const lo = truncate(v, to);
  const one: Decimal = { units: 10 ** (6 - to), dp: to };
  const hi = { units: lo.units + one.units, dp: to };
  return { lo, hi, nearest: round(v, to) };
}

/** The line a rounding task stands on: its two neighbours, ten steps between them. */
export function roundingLine(v: Decimal, to: number): LineLevel {
  const { lo, hi } = roundingEnds(v, to);
  return { from: lo, to: hi, step: { units: (hi.units - lo.units) / 10, dp: to + 1 }, steps: 10 };
}
