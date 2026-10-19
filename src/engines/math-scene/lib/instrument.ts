/**
 * Model A11 `instrument` (docs/32 §3.2): the reading instruments as number
 * lines — a ruler or a tape straight, a dial bent into a circle, a jug
 * standing up — and the two-pan balance. One scale grammar for all of them:
 * `from` / `to` printed, a number every `major`, a mark every `minor`, every
 * small part the same size. Here: the scale's marks and numbers, where a
 * value sits (a share of the scale's length, a dial's angle, a jug's level),
 * the stretch a reading lies in, the reading itself and what it is made of
 * (the numbered mark below it, how many parts on), the balance's masses and
 * tilt, the weights that make a mass, and the points of the `unroll` between
 * the dial and its straight line. Values are exact millionths (`lib/decimal.ts`
 * units); only positions on the page are floats. Pure.
 */
import type { InstrumentSpec, InstrumentUnit, PanThing } from '../schema';
import { SCALE, type Decimal } from './decimal';
import { PAIR, pairOf, type BigUnit, type CompoundPair } from './value';

/* ------------------------------------------------------------------ */
/* The scale                                                           */
/* ------------------------------------------------------------------ */

/** A scale's marks in millionths of its unit. */
export interface Scale {
  from: number;
  to: number;
  major: number;
  minor: number;
  /** Small parts in all, and between two numbered marks. */
  parts: number;
  per: number;
  /** Places the numbers are printed with. */
  dp: number;
  unit: InstrumentUnit;
  /** A scale in two units: its big unit and the pair (the values are in the small unit). */
  sub: { big: BigUnit; pair: CompoundPair } | null;
}

const u = (d: Decimal | undefined): number | null => (d ? d.units : null);

/** The default unit of each instrument. */
export const DEFAULT_UNIT: Record<NonNullable<InstrumentSpec['type']>, InstrumentUnit> = { ruler: 'cm', tape: 'cm', dial: 'g', jug: 'l', balance: 'g' };

/** The instruments of a model: itself, or the two / three side by side. */
export function partsOf<T extends InstrumentSpec & { pair?: InstrumentSpec[]; set?: InstrumentSpec[] }>(m: T): InstrumentSpec[] {
  return m.pair ?? m.set ?? [m];
}

/** The unit an instrument is marked in. */
export const unitOf = (s: InstrumentSpec): InstrumentUnit => s.unit ?? DEFAULT_UNIT[s.type ?? 'ruler'];

/** The scale of an instrument (`null`: a balance, or the range is not written). */
export function scaleOf(s: InstrumentSpec): Scale | null {
  if (s.type === 'balance') return null;
  const from = u(s.from) ?? 0;
  const to = u(s.to);
  const minor = u(s.minor) ?? u(s.major) ?? SCALE;
  const major = u(s.major) ?? minor;
  if (to === null || to <= from || minor <= 0 || major <= 0) return null;
  const unit = unitOf(s);
  const pair = s.sub ? pairOf(s.sub.unit, unit) : null;
  const dp = Math.max(s.from?.dp ?? 0, s.to?.dp ?? 0, s.major?.dp ?? 0, s.minor?.dp ?? 0, placesOf(major), placesOf(from));
  return { from, to, major, minor, parts: Math.round((to - from) / minor), per: Math.round(major / minor), dp, unit, sub: s.sub && pair ? { big: s.sub.unit, pair } : null };
}

/** The fewest places a value in millionths needs (0.25 → 2). */
export function placesOf(units: number): number {
  for (let k = 0; k <= 6; k++) if (units % 10 ** (6 - k) === 0) return k;
  return 6;
}

/** The value of mark `i` (0 = `from`). */
export const markAt = (sc: Scale, i: number): number => sc.from + i * sc.minor;
/** The mark a value sits on (`null`: between two marks, or off the scale). */
export function markOf(sc: Scale, v: number): number | null {
  const d = v - sc.from;
  if (d < 0 || v > sc.to || d % sc.minor !== 0) return null;
  return d / sc.minor;
}
/** Is the value on the scale (on or between its marks)? */
export const onScale = (sc: Scale, v: number): boolean => v >= sc.from && v <= sc.to;
/** Numbered marks: every whole `major`, counted from 0. */
export const isMajor = (sc: Scale, v: number): boolean => v % sc.major === 0;
/** The half-way mark between two numbered marks ten parts apart (a little longer). */
export const isMid = (sc: Scale, v: number): boolean => sc.per === 10 && !isMajor(sc, v) && (v * 2) % sc.major === 0;

/** Is a numbered mark printed (labels: the major marks, the ends, none, or all but the hidden)? */
export function labelled(s: InstrumentSpec, sc: Scale, v: number): boolean {
  if (s.labels === 'none') return false;
  if (s.labels === 'ends') return v === sc.from || v === sc.to;
  if (!isMajor(sc, v)) return false;
  if (typeof s.labels === 'object') return !s.labels.hide.some((h) => h.units === v);
  return true;
}
/** A number hidden under a small empty box (`labels: { hide }`). */
export const hiddenLabel = (s: InstrumentSpec, v: number): boolean => typeof s.labels === 'object' && s.labels.hide.some((h) => h.units === v);

/** A number in millionths as printed with the scale's places (`2.5`, `0.25`, `400`). */
export function numText(units: number, dp = 0): string {
  const whole = Math.floor(units / SCALE);
  const rest = units % SCALE;
  const need = Math.max(dp, placesOf(units));
  if (need === 0) return String(whole);
  return `${whole}.${String(rest).padStart(6, '0').slice(0, need)}`;
}

/** The text of a numbered mark: its value; on a two-unit scale, each whole big unit `1 m` and the numbers between as what is over (`10`, `20`). */
export function markText(sc: Scale, v: number): string {
  // Each number with the places it needs (0.5, 1, 1.5 — the scale's 1 is not written 1.0).
  if (!sc.sub) return numText(v, 0);
  const { factor } = PAIR[sc.sub.pair];
  const small = Math.round(v / SCALE);
  if (small === 0) return '0';
  if (small % factor === 0) return `${small / factor} ${sc.sub.big === 'l' ? 'ℓ' : sc.sub.big}`;
  return String(small % factor);
}

/* ------------------------------------------------------------------ */
/* Positions                                                           */
/* ------------------------------------------------------------------ */

/** Parts a skipped stretch is drawn as (two break lines between). */
export const SKIP_PARTS = 2;

/** Where a value sits along the scale, 0 … 1 (a skipped stretch is drawn as two parts). */
export function shareOf(s: InstrumentSpec, sc: Scale, v: number): number {
  const skip = s.skip ? { a: s.skip.from.units, b: s.skip.to.units } : null;
  if (!skip || skip.b <= skip.a) return (v - sc.from) / (sc.to - sc.from);
  const short = SKIP_PARTS * sc.minor;
  const total = sc.to - sc.from - (skip.b - skip.a) + short;
  if (v <= skip.a) return (v - sc.from) / total;
  if (v >= skip.b) return (v - sc.from - (skip.b - skip.a) + short) / total;
  return (skip.a - sc.from + ((v - skip.a) / (skip.b - skip.a)) * short) / total;
}

/** The parts drawn (a skipped stretch counts as its two short parts). */
export function drawnParts(s: InstrumentSpec, sc: Scale): number {
  if (!s.skip) return sc.parts;
  return sc.parts - Math.round((s.skip.to.units - s.skip.from.units) / sc.minor) + SKIP_PARTS;
}

/** Is mark `v` inside a skipped stretch (not drawn)? */
export const skipped = (s: InstrumentSpec, v: number): boolean => !!s.skip && v > s.skip.from.units && v < s.skip.to.units;

/** The full-scale angle of a dial (0 at the top, clockwise; a gap between full and 0). */
export const dialSweep = (s: InstrumentSpec): number => s.sweep ?? 330;

/** A dial's angle for a value, degrees clockwise from the top. */
export const dialAngle = (s: InstrumentSpec, sc: Scale, v: number): number => dialSweep(s) * ((v - sc.from) / (sc.to - sc.from));

/** The value at a dial angle (degrees clockwise from the top), snapped to the marks. */
export function valueAtAngle(s: InstrumentSpec, sc: Scale, deg: number): number {
  const a = ((deg % 360) + 360) % 360;
  const sweep = dialSweep(s);
  // In the gap past full scale: the nearer end.
  const t = a > sweep ? (a - sweep < (360 - sweep) / 2 ? 1 : 0) : a / sweep;
  return snap(sc, sc.from + t * (sc.to - sc.from));
}

/** A value snapped to the nearest mark, within the scale. */
export function snap(sc: Scale, v: number): number {
  const k = Math.round((v - sc.from) / sc.minor);
  return sc.from + Math.max(0, Math.min(sc.parts, k)) * sc.minor;
}

/** A point on a dial's rim (radius `r` from the centre) at a value. */
export function rimPoint(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/**
 * The `unroll` (docs/32 §3.3): a point of the dial's rim on its way to the straight line under it, `t` from 0 (on the
 * dial) to 1 (on the line), with the mark's direction turning from the radius to straight down. Exact at both ends.
 */
export function unrollPoint(t: number, dial: { cx: number; cy: number; r: number }, line: { x: number; y: number; w: number }, deg: number, share: number): { x: number; y: number; angle: number } {
  const p = rimPoint(dial.cx, dial.cy, dial.r, deg);
  const q = { x: line.x + share * line.w, y: line.y };
  const k = Math.max(0, Math.min(1, t));
  // The mark points out along the radius on the dial (deg), straight up on the line (0).
  return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k, angle: deg * (1 - k) };
}

/* ------------------------------------------------------------------ */
/* Readings                                                            */
/* ------------------------------------------------------------------ */

/** What a reading is made of (docs/32 §3.6): the value, the numbered mark below it and the next, the parts on from it. */
export interface Reading {
  /** The reading in the scale's unit (with `sub`, the small unit), millionths. */
  value: number;
  /** The numbered mark at or below the value, the one after it, the gap between numbers and a small part. */
  L: number;
  U: number;
  M: number;
  i: number;
  /** Small parts between two numbered marks, and from `L` to the value. */
  n: number;
  k: number;
  /** A thing laid along the scale: its two ends (the value is their difference); `nearest`: its end is off the marks. */
  a?: number;
  b?: number;
  nearest?: boolean;
}

/** The numbered mark at or below a value. */
export const majorBelow = (sc: Scale, v: number): number => Math.floor(v / sc.major) * sc.major;

/** The reading's breakdown for a value on a scale. */
export function breakdown(sc: Scale, v: number): Reading {
  const L = Math.max(sc.from, majorBelow(sc, v));
  return { value: v, L, U: L + sc.major, M: sc.major, i: sc.minor, n: sc.per, k: Math.round((v - L) / sc.minor) };
}

/** The point being read on an instrument: a needle or a level, an arrow, a head board, a line's end, a thing's far end (`null`: none). */
export function pointerOf(s: InstrumentSpec): number | null {
  if (s.type === 'dial' || s.type === 'jug') return s.value?.units ?? null;
  if (s.object) return s.object.to.units;
  if (s.line) return s.line.to.units;
  if (s.head) return s.head.units;
  if (s.arrow) return s.arrow.units;
  return null;
}

/** The nearest mark to a value (the lower one at exactly half way). */
export function nearestMark(sc: Scale, v: number): number {
  const k = Math.round((v - sc.from) / sc.minor - 1e-9);
  return sc.from + k * sc.minor;
}

/**
 * What the instrument reads (`null`: nothing to read): a thing's length (far end − near end; off the marks, to the
 * nearest mark), a line's length, an arrow, a head board, a needle, a level; a balance, the mass of the weights.
 */
export function readingOf(s: InstrumentSpec): Reading | null {
  if (s.type === 'balance') {
    const w = panMass(s.right ?? []);
    return w > 0 ? { value: w * SCALE, L: 0, U: 0, M: 0, i: 0, n: 0, k: 0 } : null;
  }
  const sc = scaleOf(s);
  if (!sc) return null;
  if (s.object) {
    const a = s.object.from.units;
    const raw = s.object.to.units;
    const off = markOf(sc, raw) === null;
    const b = off ? nearestMark(sc, raw) : raw;
    return { ...breakdown(sc, b), value: b - a, a, b: raw, nearest: off };
  }
  if (s.line) return { ...breakdown(sc, s.line.to.units), value: s.line.to.units - s.line.from.units, a: s.line.from.units, b: s.line.to.units };
  const p = pointerOf(s);
  return p === null ? null : breakdown(sc, p);
}

/** The labelled stretch a value lies in, for the magnifier (`[L, L + M]`, kept on the scale). */
export function zoomStretch(sc: Scale, v: number): { from: number; to: number } {
  const L = Math.min(Math.max(sc.from, majorBelow(sc, v)), sc.to - sc.major);
  return { from: Math.max(sc.from, L), to: Math.min(sc.to, Math.max(sc.from, L) + sc.major) };
}

/** The small parts between two marks, by the mark each starts at (part `k` runs from mark `k` to `k + 1`). */
export function partsBetween(sc: Scale, from: number, to: number): number[] {
  const a = markOf(sc, from);
  const b = markOf(sc, to);
  if (a === null || b === null || b <= a) return [];
  return Array.from({ length: b - a }, (_, j) => a + j);
}



/* ------------------------------------------------------------------ */
/* The balance                                                         */
/* ------------------------------------------------------------------ */

/** A pan's mass in grams (its items and weights). */
export const panMass = (things: readonly PanThing[]): number => things.reduce((a, t) => a + (t.weight ?? t.mass ?? 0), 0);

/** Which way the beam goes: the heavier side down (−1 left down, 1 right down, 0 level). */
export function tiltOf(left: number, right: number): -1 | 0 | 1 {
  return left > right ? -1 : left < right ? 1 : 0;
}

/** The beam's tilt as drawn: by the masses, or as written. */
export function beamTilt(s: InstrumentSpec, right: readonly PanThing[] = s.right ?? []): -1 | 0 | 1 {
  if (s.tilt === 'left') return -1;
  if (s.tilt === 'right') return 1;
  if (s.tilt === 'level') return 0;
  return tiltOf(panMass(s.left ?? []), panMass(right));
}

/** The beam's angle in degrees (clockwise: the right end down), the heavier side 8° low. */
export const BEAM_DEG = 8;
export const beamAngle = (tilt: -1 | 0 | 1): number => tilt * BEAM_DEG;

/** The fewest weights from those given (any number of each) that make a mass, heaviest first (`null`: none do). */
export function fewestWeights(mass: number, weights: readonly number[]): number[] | null {
  const best: (number[] | null)[] = Array.from({ length: mass + 1 }, () => null);
  best[0] = [];
  for (let m = 1; m <= mass; m++) {
    for (const w of weights) {
      const prev = m - w >= 0 ? best[m - w] : null;
      if (prev && (!best[m] || prev.length + 1 < best[m]!.length)) best[m] = [...prev, w];
    }
  }
  const out = best[mass];
  return out ? [...out].sort((a, b) => b - a) : null;
}

/** The load on a balance's left pan the weights go against (its items' mass). */
export const loadMass = (s: InstrumentSpec): number => panMass(s.left ?? []);
