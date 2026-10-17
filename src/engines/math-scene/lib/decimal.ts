/**
 * Exact decimals (docs/29 §3.1, X1): a decimal is a whole number of
 * millionths (`units`) and the places it was written with (`dp`), so
 * `0.5` and `0.50` are equal in value but written differently. Every
 * operation is integer arithmetic on `units`: adding, subtracting,
 * multiplying by a whole number, moving the digits (× 10ⁿ) and long
 * division digit by digit. The data writes decimals as strings (`"0.50"`);
 * text is read digit by digit, never through a binary float. Pure.
 */
import { gcd, type Frac } from './fraction';

/** An exact decimal: `units` millionths (an integer ≥ 0) and the places it was written with. */
export interface Decimal {
  units: number;
  dp: number;
}

/** Millionths in one: six places inside; lessons write at most three, wrong answers may need more. */
export const SCALE = 1_000_000;
export const MAX_DP = 6;
/** The largest whole part (docs/29 §3.1: 0 ≤ x ≤ 99 999.999999). */
export const DECIMAL_MAX_WHOLE = 99_999;

const POW10 = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000];
const pow10 = (n: number): number => POW10[n] ?? 10 ** n;

const TEXT = /^(\d{1,5})?(?:\.(\d{1,6}))?$/;

/** `"0.50"` → `{ units: 500 000, dp: 2 }`; `".35"` → 0.35; `null` for anything else (`"1.2.3"`, `"-1"`, `""`). */
export function parseDecimal(text: string): Decimal | null {
  const t = text.trim();
  const m = TEXT.exec(t);
  if (!m || (m[1] === undefined && m[2] === undefined)) return null;
  let whole = 0;
  for (const ch of m[1] ?? '') whole = whole * 10 + (ch.charCodeAt(0) - 48);
  const frac = m[2] ?? '';
  let part = 0;
  for (const ch of frac) part = part * 10 + (ch.charCodeAt(0) - 48);
  return { units: whole * SCALE + part * pow10(MAX_DP - frac.length), dp: frac.length };
}

/** A whole number as a decimal (no places). */
export const fromWhole = (n: number): Decimal => ({ units: n * SCALE, dp: 0 });

/** Is this text a decimal with a point (`"0.5"`, `".5"`, not `"5"`)? */
export const hasPoint = (text: string): boolean => /\./.test(text) && parseDecimal(text) !== null;

const groupWhole = (n: number): string => (n >= 10_000 ? String(n).replace(/\B(?=(\d{3})+$)/g, ' ') : String(n));

/** The whole part (`W`). */
export const wholePart = (d: Decimal): number => Math.floor(d.units / SCALE);

/** The digits after the point as written (`F`): 2.50 → "50", 3 → "". */
export function fracDigits(d: Decimal): string {
  if (d.dp === 0) return '';
  const rest = d.units % SCALE;
  return String(rest).padStart(MAX_DP, '0').slice(0, d.dp);
}

/** Does the value need more places than it is written with (a value read wrong)? */
const exactAt = (d: Decimal, dp: number): boolean => d.units % pow10(MAX_DP - Math.min(MAX_DP, dp)) === 0;

/** The fewest places the value needs (2.50 → 1, 3.0 → 0). */
export function minPlaces(d: Decimal): number {
  for (let k = 0; k <= MAX_DP; k++) if (exactAt(d, k)) return k;
  return MAX_DP;
}

/** The text: `"0.50"` (as many places as `dp`); `"3"` with none. A whole part of 10 000 or more is grouped with a narrow space when `group` is set. */
export function formatDecimal(d: Decimal, group = false): string {
  const w = wholePart(d);
  const head = group ? groupWhole(w) : String(w);
  return d.dp > 0 ? `${head}.${fracDigits(d)}` : head;
}

/** Written with this many places (the value kept; places dropped only when they are zeros). */
export function withPlaces(d: Decimal, dp: number): Decimal {
  return { units: d.units, dp: Math.max(dp, minPlaces(d)) };
}

/** Equal in value (0.5 = 0.50). */
export const eq = (a: Decimal, b: Decimal): boolean => a.units === b.units;
/** Equal in value and written the same (0.5 ≠ 0.50): rounding and money answers. */
export const same = (a: Decimal, b: Decimal): boolean => a.units === b.units && a.dp === b.dp;
export const cmp = (a: Decimal, b: Decimal): -1 | 0 | 1 => (a.units < b.units ? -1 : a.units > b.units ? 1 : 0);

export const add = (a: Decimal, b: Decimal): Decimal => ({ units: a.units + b.units, dp: Math.max(a.dp, b.dp) });
/** `a − b`; `null` when it would be below zero (no negative numbers in the lesson). */
export function sub(a: Decimal, b: Decimal): Decimal | null {
  return a.units < b.units ? null : { units: a.units - b.units, dp: Math.max(a.dp, b.dp) };
}
/** `a × k` for a whole number `k` (the places of `a` kept). */
export const mulWhole = (a: Decimal, k: number): Decimal => ({ units: a.units * k, dp: a.dp });

/**
 * `a ÷ k` for a whole number `k` by long division, to at most `maxDp` places:
 * `exact` when nothing is left over. The quotient is written with the places
 * it needs (1.5 ÷ 4 = 0.375), or `maxDp` when it does not end (2 ÷ 3 = 0.666666).
 */
export function divWhole(a: Decimal, k: number, maxDp = MAX_DP): { q: Decimal; exact: boolean } {
  const cut = pow10(MAX_DP - Math.min(MAX_DP, maxDp));
  // Long division on millionths, then cut to maxDp places (truncated, as the written division stops there).
  const raw = Math.floor(a.units / k);
  const units = raw - (raw % cut);
  const exact = units * k === a.units;
  const q: Decimal = { units, dp: 0 };
  return { q: { units, dp: exact ? Math.max(a.dp, minPlaces(q)) : maxDp }, exact };
}

/** Rounded to `n` places, half up ("5 or more, round up"); written with exactly `n` places (2.96 → 3.0). */
export function round(a: Decimal, n: number): Decimal {
  const step = pow10(MAX_DP - n);
  const rest = a.units % step;
  const down = a.units - rest;
  return { units: rest * 2 >= step ? down + step : down, dp: n };
}

/** Cut to `n` places (the digits after it dropped), written with `n` places. */
export function truncate(a: Decimal, n: number): Decimal {
  const step = pow10(MAX_DP - Math.min(MAX_DP, n));
  return { units: a.units - (a.units % step), dp: n };
}

/** `a × 10^p` (`p` may be below zero): the digits move, the point stays; `null` when it would need more than six places. */
export function scale(a: Decimal, p: number): Decimal | null {
  if (p >= 0) return { units: a.units * pow10(p), dp: Math.max(0, a.dp - p) };
  const k = pow10(-p);
  if (a.units % k !== 0) return null;
  return { units: a.units / k, dp: Math.min(MAX_DP, a.dp - p) };
}

/** The digit in a place: 1 = ones, 2 = tens, 3 = hundreds, 4 = thousands; −1 = tenths, −2 = hundredths, −3 = thousandths. */
export function digitAt(a: Decimal, place: number): number {
  if (place >= 1) return Math.floor(wholePart(a) / pow10(place - 1)) % 10;
  const rest = a.units % SCALE;
  return Math.floor(rest / pow10(MAX_DP + place)) % 10;
}

/** As a fraction in lowest terms (0.35 → 7/20; 2.75 → 11/4). */
export function toFraction(a: Decimal): Frac {
  const g = gcd(a.units, SCALE);
  return { n: a.units / g, d: SCALE / g };
}

/** A fraction as a decimal, when its denominator has only the factors 2 and 5 and it needs at most `maxDp` places (`null` otherwise). */
export function fromFraction(f: Frac, maxDp = 3): Decimal | null {
  const n = (f.w ?? 0) * f.d + f.n;
  if (f.d <= 0) return null;
  let d = f.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d !== 1) return null;
  const units = (n * SCALE) / f.d;
  if (!Number.isInteger(units)) return null;
  const out: Decimal = { units, dp: 0 };
  const dp = minPlaces(out);
  return dp <= maxDp ? { units, dp } : null;
}

/** The value in thousandths when it has at most three places (`null` past them). */
export function thousandths(a: Decimal): number | null {
  return a.units % 1000 === 0 ? a.units / 1000 : null;
}

/** A decimal from a whole number of thousandths, written with `dp` places. */
export const fromThousandths = (n: number, dp: number): Decimal => ({ units: n * 1000, dp });

/** The position of `x` on `[from, to]` as a share of its length, for drawing (0 … 1); exact up to the drawing. */
export function share(x: Decimal, from: Decimal, to: Decimal): number {
  const span = to.units - from.units;
  return span === 0 ? 0 : (x.units - from.units) / span;
}

/** How many steps of `step` from `from` to `x` (`null` when `x` is not on a step). */
export function stepsBetween(from: Decimal, x: Decimal, step: Decimal): number | null {
  if (step.units <= 0) return null;
  const d = x.units - from.units;
  return d % step.units === 0 ? d / step.units : null;
}

/** `from + k × step`, written with the places of the step. */
export const atStep = (from: Decimal, step: Decimal, k: number): Decimal => ({ units: from.units + k * step.units, dp: Math.max(from.dp, step.dp) });

/** A power of ten as a decimal: 1 → 10, −2 → 0.01. */
export function power(p: number): Decimal {
  return p >= 0 ? { units: pow10(p) * SCALE, dp: 0 } : { units: pow10(MAX_DP + p), dp: -p };
}
