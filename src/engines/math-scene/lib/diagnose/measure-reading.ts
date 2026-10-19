/**
 * Diagnosis in the measure-reading domain (docs/32 §2.1, §3.6): one pure rule
 * per misconception, each a test of one wrong answer against what the
 * instrument shows or what is being changed into other units. Values are
 * whole millionths of the unit read (`lib/decimal.ts` units, so 0.1 kg and
 * 100 g are both exact); compounds are their raw boxes (big, small), so a
 * child's `1 m 50 cm` for 1 m 5 cm can be seen. The domain also has rules of
 * its own for four codes registered elsewhere (`tick-counting`,
 * `interval-misread`, `unit-factor-wrong`, `decimal-as-subunit`, docs/29 X6):
 * a task is diagnosed by its own domain's rules. Only the codes a task
 * declares are looked for, in the order it declares them; where writing the
 * two parts side by side and using × 100 give the same number, it is
 * `compound-concatenated` (the side by side story), never both.
 */
import type { MisconceptionCode } from '../../schema';
import { SCALE } from '../decimal';
import type { Reading } from '../instrument';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Part sizes a child may take instead of the real one: 1, 10, a tenth, a hundredth of the unit, and a tenth of the numbered gap. */
export function wrongPartSizes(r: Pick<Reading, 'M' | 'i'>): number[] {
  const out = new Set([SCALE, 10 * SCALE, SCALE / 10, SCALE / 100]);
  if (r.M % 10 === 0) out.add(r.M / 10);
  out.delete(r.i);
  return [...out].filter((x) => x > 0 && Number.isInteger(x));
}

const digits = (n: number): number => String(n).length;
const zerosOf = (f: number): number => String(f).length - 1;

/** Small parts scaled by ten or a hundred, up or down, staying under one big unit (5 → 50, 500; 40 → 4, 400). */
export function placeSlips(s: number, f: number): number[] {
  const out: number[] = [];
  for (const k of [10, 100]) {
    if (s * k < f && s > 0) out.push(s * k);
    if (s % k === 0 && s > 0) out.push(s / k);
  }
  return [...new Set(out)].filter((x) => x !== s);
}

/** The other conversion factors (10, 100, 1000 but the real one). */
export const otherFactors = (f: number): number[] => [10, 100, 1000].filter((x) => x !== f);

/* ------------------------------------------------------------------ */
/* Reading an instrument (read-scale)                                  */
/* ------------------------------------------------------------------ */

/** What a reading task compares the child's number with: the instrument's reading and how it is made. */
export interface ReadCtx {
  r: Reading;
  /** The reading is a thing's (or a line's) length from `a` to `b`, not a pointer. */
  length: boolean;
}

/**
 * A number read off an instrument (millionths of the scale's unit), wrong: does it show `code`?
 *   tick-counting      a thing: (b − a) + i (both end marks counted) · a pointer: L + (k + 1)·i
 *   read-end-mark      a thing not from 0: x = b
 *   not-nearest        a thing's end between two marks: the farther mark − a
 *   interval-misread   a pointer: L + k·i′ for a part size i′ ≠ i (1, 10, a tenth, a hundredth, M/10)
 */
export function readShows(code: MisconceptionCode, c: ReadCtx, x: number): boolean {
  const { r } = c;
  if (x === r.value) return false;
  switch (code) {
    case 'tick-counting':
      return c.length ? x === r.value + r.i : x === r.L + (r.k + 1) * r.i;
    case 'read-end-mark':
      return c.length && r.a !== undefined && r.b !== undefined && r.a !== 0 && !r.nearest && x === r.b;
    case 'not-nearest': {
      if (!c.length || !r.nearest || r.a === undefined || r.b === undefined) return false;
      const lo = Math.floor(r.b / r.i) * r.i;
      const near = r.value + r.a;
      const far = near === lo ? lo + r.i : lo;
      return x === far - r.a;
    }
    case 'interval-misread':
      return !c.length && wrongPartSizes(r).some((j) => x === r.L + r.k * j);
    default:
      return false;
  }
}

/**
 * A compound reading written (`big`, `small`), wrong, on a two-unit scale whose reading is `B` and `s`:
 *   compound-place     (B, s′) with s′ = s × 10ⁿ or s ÷ 10ⁿ under one big unit (1 m 5 cm written 1 m 50 cm)
 *   interval-misread / tick-counting   its total read as above
 */
export function compoundReadShows(code: MisconceptionCode, c: ReadCtx, big: number, small: number, factor: number): boolean {
  const B = Math.floor(c.r.value / SCALE / factor);
  const s = Math.round(c.r.value / SCALE) % factor;
  if (big === B && small === s) return false;
  if (code === 'compound-place') return big === B && placeSlips(s, factor).includes(small);
  if (code === 'decimal-as-subunit') return false;
  return small < factor && readShows(code, c, (big * factor + small) * SCALE);
}

/**
 * A reading in decimals of the big unit (`d`, millionths: 1.4 kg) written as a compound (`big`, `small`):
 *   decimal-as-subunit   the decimal digits taken as the small unit's count (1.4 kg → 1 kg 4 g)
 */
export function decimalAsCompound(d: number, big: number, small: number, factor: number): boolean {
  const W = Math.floor(d / SCALE);
  const rest = d % SCALE;
  if (rest === 0) return false;
  const F = Number(String(rest).padStart(6, '0').replace(/0+$/, ''));
  const right = Math.round((rest / SCALE) * factor);
  return big === W && small === F && small !== right;
}

/* ------------------------------------------------------------------ */
/* Counting the parts (count-intervals)                                */
/* ------------------------------------------------------------------ */

/**
 * What each small part stands for, written wrong (between two numbered marks `M` apart with `n` parts of `i`):
 *   tick-counting      M ÷ (n − 1) or M ÷ (n + 1): the short marks or all the marks counted (a whole number)
 *   interval-misread   1, or a tenth of the gap (`M ÷ 10`): every part taken as 1, or as ten to a gap
 */
export function partShows(code: MisconceptionCode, r: Pick<Reading, 'M' | 'i' | 'n'>, x: number): boolean {
  if (x === r.i) return false;
  if (code === 'tick-counting') return x % SCALE === 0 && [r.n - 1, r.n + 1].some((d) => d > 0 && r.M % d === 0 && x === r.M / d);
  if (code === 'interval-misread') return x === SCALE || (r.M % 10 === 0 && x === r.M / 10);
  return false;
}

/* ------------------------------------------------------------------ */
/* Setting an instrument (set-scale)                                   */
/* ------------------------------------------------------------------ */

/**
 * A value set on an instrument (millionths), wrong, for a target `t` on a scale of parts `i`, numbers every `M`:
 *   tick-counting      t − i: the starting mark counted as a part
 *   interval-misread   L′ + ((t − L′) ÷ i′) × i: from the numbered mark below the target, as many parts as the
 *                      target needs if each were i′ (each part taken as 1, 10, a tenth …)
 */
export function setShows(code: MisconceptionCode, t: number, M: number, i: number, x: number): boolean {
  if (x === t) return false;
  if (code === 'tick-counting') return x === t - i;
  if (code !== 'interval-misread') return false;
  const L = Math.floor(t / M) * M;
  return wrongPartSizes({ M, i }).some((j) => (t - L) % j === 0 && x === L + ((t - L) / j) * i);
}

/* ------------------------------------------------------------------ */
/* Units: changing, comparing, ordering                                */
/* ------------------------------------------------------------------ */

/**
 * A compound (`B` big, `s` small, `f` to one) changed into the small unit, written `x`, wrong:
 *   compound-concatenated   the two numbers side by side (3 kg 40 g → 340), when that is not right by chance
 *   compound-place          B × f + s × 10ⁿ under one big unit (3 kg 40 g → 3400)
 *   unit-factor-wrong       B × f′ + s for another factor (3 ℓ 250 ml → 550), not the side-by-side number
 */
export function toSmallShows(code: MisconceptionCode, B: number, s: number, f: number, x: number): boolean {
  const right = B * f + s;
  if (x === right) return false;
  const side = digits(s) < zerosOf(f) ? Number(`${B}${s}`) : null;
  switch (code) {
    case 'compound-concatenated':
      return side !== null && x === side;
    case 'compound-place':
      return [10, 100].some((k) => s > 0 && s * k < f && x === B * f + s * k);
    case 'unit-factor-wrong':
      return x !== side && otherFactors(f).some((g) => x === B * g + s);
    default:
      return false;
  }
}

/**
 * A measure in the small unit (`a`, `f` to one big) changed into a compound, written (`big`, `small`), wrong:
 *   compound-split-wrong   split at another factor: (⌊a ÷ f′⌋, a mod f′) (1250 ml → 12 ℓ 50 ml)
 *   compound-place         the right big part, the small part × or ÷ 10ⁿ (3040 g → 3 kg 4 g)
 */
export function toCompoundShows(code: MisconceptionCode, a: number, f: number, big: number, small: number): boolean {
  const B = Math.floor(a / f);
  const s = a % f;
  if (big === B && small === s) return false;
  if (code === 'compound-split-wrong') return otherFactors(f).some((g) => big === Math.floor(a / g) && small === a % g);
  if (code === 'compound-place') return big === B && placeSlips(s, f).includes(small);
  return false;
}

/**
 * A measure in one unit (`a`, millionths) changed into another (`× f` to the smaller, `÷ f` to the bigger), written `x` (millionths), wrong:
 *   unit-factor-wrong    × or ÷ another factor (5 km → 500 m, 4 m → 4000 cm, 0.3 ℓ → 30 ml)
 *   decimal-as-subunit   to the smaller: the digits after the point as the small unit's count (1.4 kg → 1004 g)
 */
export function convertShows(code: MisconceptionCode, a: number, f: number, down: boolean, x: number): boolean {
  const right = down ? a * f : a / f;
  if (x === right) return false;
  if (code === 'unit-factor-wrong') return otherFactors(f).some((g) => x === (down ? a * g : a / g));
  if (code === 'decimal-as-subunit') {
    if (!down || a % SCALE === 0) return false;
    const rest = a % SCALE;
    const F = Number(String(rest).padStart(6, '0').replace(/0+$/, ''));
    return x === (Math.floor(a / SCALE) * f + F) * SCALE;
  }
  return false;
}

/** A comparison's claim: `<`, `=`, `>`. */
export type Claim = '<' | '=' | '>';
const sym = (c: number): Claim => (c < 0 ? '<' : c > 0 ? '>' : '=');

/** One side of a comparison as the rules see it: its value in the family's smallest unit, the number printed first, and a compound's parts. */
export interface Side {
  base: number;
  printed: number;
  compound?: { B: number; s: number; f: number; per: number };
}

/**
 * Two quantities compared, the child's claim wrong:
 *   ignored-unit     the claim the printed numbers give (900 g > 1 kg)
 *   compound-place   the claim with a compound's small part read × or ÷ 10ⁿ (1 m 5 cm = 1 m 50 cm)
 */
export function compareShows(code: MisconceptionCode, a: Side, b: Side, claim: Claim): boolean {
  if (claim === sym(a.base - b.base)) return false;
  if (code === 'ignored-unit') return claim === sym(a.printed - b.printed);
  if (code === 'compound-place') {
    const alt = (x: Side): number[] => (x.compound ? placeSlips(x.compound.s, x.compound.f).map((s2) => (x.compound!.B * x.compound!.f + s2) * x.compound!.per) : []);
    return alt(a).some((av) => claim === sym(av - b.base)) || alt(b).some((bv) => claim === sym(a.base - bv));
  }
  return false;
}

/**
 * Quantities ordered (`items`, as sides) in the child's order (indices), wrong:
 *   ignored-unit   the order the printed numbers give
 */
export function orderShows(code: MisconceptionCode, items: readonly Side[], order: readonly number[], dir: 1 | -1): boolean {
  if (code !== 'ignored-unit') return false;
  const right = order.every((v, k) => k === 0 || (items[v]!.base - items[order[k - 1]!]!.base) * dir >= 0);
  if (right) return false;
  return order.every((v, k) => k === 0 || (items[v]!.printed - items[order[k - 1]!]!.printed) * dir >= 0);
}
