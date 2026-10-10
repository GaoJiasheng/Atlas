/**
 * Fraction arithmetic for the lesson (docs/15 §4.8): integers only, never a
 * float comparison. A `Frac` is `{ n, d }` or a mixed number `{ w, n, d }`;
 * whole numbers are `{ n, d: 1 }`. Parsed from the data strings `"3/4"`,
 * `"1 3/4"`, `"2"` (`parseFrac`). Pure: no DOM, no zod.
 */

export interface Frac {
  /** Whole part of a mixed number (omitted for proper / improper fractions). */
  w?: number;
  n: number;
  d: number;
}

const FRAC_RE = /^\s*(?:(\d+)\s+)?(\d+)(?:\s*\/\s*(\d+))?\s*$/;

/** `"3/4"` → `{ n: 3, d: 4 }`, `"1 3/4"` → `{ w: 1, n: 3, d: 4 }`, `"2"` → `{ n: 2, d: 1 }`; `null` when malformed or `d = 0`. */
export function parseFrac(text: string): Frac | null {
  const m = FRAC_RE.exec(text);
  if (!m) return null;
  const [, w, n, d] = m;
  if (w !== undefined && d === undefined) return null;
  const den = d === undefined ? 1 : Number(d);
  if (den === 0) return null;
  return w !== undefined ? { w: Number(w), n: Number(n), d: den } : { n: Number(n), d: den };
}

/** The data string of a fraction: `"3/4"`, `"1 3/4"`, `"2"`. */
export function formatFrac(f: Frac): string {
  const frac = f.d === 1 && !f.w ? String(f.n) : `${f.n}/${f.d}`;
  return f.w ? `${f.w} ${frac}` : frac;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);
}

/** Mixed → improper (`1 3/4` → `7/4`); others unchanged. */
export function toImproper(f: Frac): Frac {
  return f.w ? { n: f.w * f.d + f.n, d: f.d } : { n: f.n, d: f.d };
}

/** Improper → mixed (`7/4` → `1 3/4`, `8/4` → `{ w: 2, n: 0, d: 4 }`); proper fractions unchanged. */
export function toMixed(f: Frac): Frac {
  const { n, d } = toImproper(f);
  if (n < d) return { n, d };
  return { w: Math.floor(n / d), n: n % d, d };
}

/** Lowest terms of the value (improper result; `0/x` → `0/1`). */
export function simplify(f: Frac): Frac {
  const { n, d } = toImproper(f);
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/** Lowest terms (a mixed number is simplest when its fraction part is). */
export function isSimplest(f: Frac): boolean {
  return gcd(f.n, f.d) === 1 || f.n === 0;
}

/** Same numbers, same way of writing (`2/4` is not `equal` to `1/2`). */
export function equal(a: Frac, b: Frac): boolean {
  return (a.w ?? 0) === (b.w ?? 0) && a.n === b.n && a.d === b.d;
}

/** Same value: `a.n · b.d = b.n · a.d` on the improper forms. */
export function equivalent(a: Frac, b: Frac): boolean {
  const x = toImproper(a);
  const y = toImproper(b);
  return x.n * y.d === y.n * x.d;
}

export function compare(a: Frac, b: Frac): -1 | 0 | 1 {
  const x = toImproper(a);
  const y = toImproper(b);
  const diff = x.n * y.d - y.n * x.d;
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

/** Sum in lowest terms. */
export function add(a: Frac, b: Frac): Frac {
  const x = toImproper(a);
  const y = toImproper(b);
  return simplify({ n: x.n * y.d + y.n * x.d, d: x.d * y.d });
}

/** Difference in lowest terms (negative results keep the sign on `n`). */
export function sub(a: Frac, b: Frac): Frac {
  const x = toImproper(a);
  const y = toImproper(b);
  const n = x.n * y.d - y.n * x.d;
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, x.d * y.d);
  return { n: n / g, d: (x.d * y.d) / g };
}

/** One denominator is a multiple of the other (`1/2` and `3/8`; like fractions count too). */
export function related(a: Frac, b: Frac): boolean {
  return a.d % b.d === 0 || b.d % a.d === 0;
}

/** The value written over denominator `d` (`3/4` over 12 → `9/12`), or `null` when `d` is not a multiple of its lowest denominator. */
export function over(f: Frac, d: number): Frac | null {
  const s = simplify(f);
  if (d <= 0 || d % s.d !== 0) return null;
  return { n: (s.n * d) / s.d, d };
}

/** Where the fraction sits on a number line, in intervals from `from` (`intervals` per whole); `null` when it is between ticks. */
export function valueOnLine(f: Frac, line: { from: number; intervals: number }): number | null {
  const x = toImproper(f);
  const pos = (x.n * line.intervals) / x.d - line.from * line.intervals;
  return Number.isInteger(pos) ? pos : null;
}

/** `3/4` as a number (layout only, never for comparisons). */
export function toNumber(f: Frac): number {
  const x = toImproper(f);
  return x.n / x.d;
}

/** Sign of `a − b` for integers. */
export function sign(a: number, b: number): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}
