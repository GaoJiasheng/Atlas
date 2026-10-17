/**
 * Place-value blocks and the column method (docs/19 §3.2, model A2): blocks
 * by place (hundreds, tens, ones), trading 10 of a place for 1 of the next
 * (and back), sharing a place into equal plates, and the written column
 * method for × and ÷ digit by digit (the long-division layout: the quotient
 * above the dividend under the bracket bar, each step's product and what is
 * left below). The stage, the card, the plate, the checks and the tests all
 * read these. Pure.
 */
import type { BlocksModelSpec, ColumnSpec, PlaceCounts, PlaceKey, Trade } from '../schema';
import { placeDigits } from './value';

export interface Counts {
  H: number;
  T: number;
  O: number;
}

export const ZERO: Counts = { H: 0, T: 0, O: 0 };

export const counts = (c: PlaceCounts | undefined): Counts => ({ H: c?.H ?? 0, T: c?.T ?? 0, O: c?.O ?? 0 });
export const total = (c: Counts): number => c.H * 100 + c.T * 10 + c.O;
export const blockCount = (c: Counts): number => c.H + c.T + c.O;

/** The standard form of a number: 352 → 3 hundreds, 5 tens, 2 ones. */
export function standard(n: number): Counts {
  return { H: Math.floor(n / 100), T: Math.floor((n % 100) / 10), O: n % 10 };
}

/** The places a trade takes from and gives to, and how many go for how many. */
export function tradeOf(trade: Trade): { from: PlaceKey; to: PlaceKey; take: number; give: number } {
  switch (trade) {
    case 'O>T':
      return { from: 'O', to: 'T', take: 10, give: 1 };
    case 'T>H':
      return { from: 'T', to: 'H', take: 10, give: 1 };
    case 'T>O':
      return { from: 'T', to: 'O', take: 1, give: 10 };
    case 'H>T':
      return { from: 'H', to: 'T', take: 1, give: 10 };
  }
}

export const canTrade = (c: Counts, trade: Trade): boolean => c[tradeOf(trade).from] >= tradeOf(trade).take;

/** After one trade (the value stays the same). */
export function applyTrade(c: Counts, trade: Trade): Counts {
  if (!canTrade(c, trade)) return c;
  const t = tradeOf(trade);
  return { ...c, [t.from]: c[t.from] - t.take, [t.to]: c[t.to] + t.give };
}

/** Every place under 10 (the number can be read off the mat). */
export const regrouped = (c: Counts): boolean => c.H < 10 && c.T < 10 && c.O < 10;

/** Share one place into `k` plates as far as it goes: each plate gets ⌊count / k⌋, the rest stays on the mat. */
export function sharePlace(mat: Counts, dealt: Counts, place: PlaceKey, k: number): { mat: Counts; dealt: Counts } {
  const each = Math.floor(mat[place] / k);
  if (each === 0) return { mat, dealt };
  return { mat: { ...mat, [place]: mat[place] - each * k }, dealt: { ...dealt, [place]: dealt[place] + each } };
}

/** The blocks on the mat a beat shows: `left`, else the rows pushed together, else the value. */
export function matOf(m: BlocksModelSpec): Counts {
  if (m.left) return counts(m.left);
  // A column working alone (no blocks drawn): the number it works.
  const v = standard(m.value ?? m.column?.a ?? 0);
  if (m.combined && m.copies) return { H: v.H * m.copies, T: v.T * m.copies, O: v.O * m.copies };
  return v;
}

/** The highest place a number uses (`H`, `T`, `O`). */
export const topPlace = (n: number): PlaceKey => (n >= 100 ? 'H' : n >= 10 ? 'T' : 'O');

/* ------------------------------------------------------------------ */
/* The column method                                                   */
/* ------------------------------------------------------------------ */

export interface MulColumns {
  /** Digits of the number multiplied, ones first. */
  a: number[];
  b: number;
  /** The carry written above each place (index = place; 0 = none). */
  carries: number[];
  /** Digits of the product, ones first. */
  product: number[];
  /** Two-digit multiplier: the two rows added (a × ones, a × tens · 10). */
  partials: number[] | null;
}

/** `a × b` worked in columns. A one-digit `b` gives the carries; a two-digit `b` the two partial rows. */
export function multiplyColumns(a: number, b: number): MulColumns {
  const ad = placeDigits(a);
  if (b >= 10) {
    const rows = [a * (b % 10), a * Math.floor(b / 10) * 10];
    return { a: ad, b, carries: [], product: placeDigits(a * b), partials: rows };
  }
  const carries: number[] = [0];
  const product: number[] = [];
  let carry = 0;
  ad.forEach((d, i) => {
    const p = d * b + carry;
    product.push(p % 10);
    carry = Math.floor(p / 10);
    carries[i + 1] = carry;
  });
  if (carry) product.push(carry);
  return { a: ad, b, carries, product, partials: null };
}

export interface DivStep {
  /** The place worked on (0 = ones). */
  place: number;
  /** What is shared at this place: what was left from the place above, traded, and this place's digit. */
  have: number;
  /** The quotient digit at this place. */
  q: number;
  /** What the plates take (q × b), and what is left over. */
  take: number;
  left: number;
}

export interface DivColumns {
  /** Digits of the dividend, highest first. */
  a: number[];
  b: number;
  /** Digits of the quotient aligned under the dividend's (highest first; `null` before the first digit that is not 0). */
  q: (number | null)[];
  steps: DivStep[];
  remainder: number;
}

/** `a ÷ b` worked from the top place down, the long-division way: a 0 in the quotient is written once a digit has started. */
export function divideColumns(a: number, b: number): DivColumns {
  const digits = placeDigits(a).reverse();
  const q: (number | null)[] = [];
  const steps: DivStep[] = [];
  let left = 0;
  let started = false;
  digits.forEach((d, i) => {
    const have = left * 10 + d;
    const qd = Math.floor(have / b);
    const take = qd * b;
    left = have - take;
    if (qd > 0) started = true;
    const place = digits.length - 1 - i;
    q.push(started || place === 0 ? qd : null);
    if (started || place === 0) steps.push({ place, have, q: qd, take, left });
  });
  return { a: digits, b, q, steps, remainder: left };
}

/**
 * How far a column working is written. × from the ones up: `ones` (the ones
 * digit), `carry` (and the traded ten above the tens), `tens`, `hundreds`,
 * `all`. ÷ from the top place down: `hundreds`, `tens` (those quotient digits
 * and their working), `carry` (and what is left traded down beside the next
 * digit), `ones` / `all`. `carry` here is that bring-down for ÷, the small
 * carried digit for ×.
 */
export function columnProgress(c: ColumnSpec): { places: number; carry: boolean } {
  if (c.op === '×') {
    const len = Math.max(placeDigits(c.a * c.b).length, 1);
    const at = { none: 0, ones: 1, carry: 1, tens: 2, hundreds: 3, all: len }[c.show];
    return { places: Math.min(at, len), carry: c.show !== 'none' && c.show !== 'ones' };
  }
  const len = placeDigits(c.a).length;
  const at = { none: 0, hundreds: len - 2, tens: len - 1, carry: len - 1, ones: len, all: len }[c.show];
  return { places: Math.max(0, Math.min(at, len)), carry: c.show === 'carry' };
}

/** The place a column working is at (its digit lights up with the mat's column), `null` before it starts and once it is done. */
export function columnFocus(c: ColumnSpec): PlaceKey | null {
  if (c.show === 'none' || c.show === 'all') return null;
  const { places, carry } = columnProgress(c);
  const name = (place: number): PlaceKey => (place >= 2 ? 'H' : place === 1 ? 'T' : 'O');
  if (c.op === '×') return name(carry && places === 1 ? 1 : places - 1);
  const len = placeDigits(c.a).length;
  // ÷: the place just worked (or, with the bring-down, the place it goes to).
  return name(len - places - (carry ? 1 : 0));
}
