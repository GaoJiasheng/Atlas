/**
 * Diagnosis in the decimals domain (docs/29 §2.1, §3.8). Every rule is a
 * pure test of one wrong answer — a decimal the child wrote (as written:
 * `0.10` is not `0.1` here), a symbol, an order, a place on the line, the
 * digits moved, a fraction — against what is being worked out (`work`, or
 * the task's own numbers). Only the codes a task declares are looked for, in
 * the order it declares them. The domain also has rules of its own for
 * three codes registered elsewhere (`tick-counting`, `carry-not-added`,
 * `zero-in-quotient`): a code's rules are the union over its domains, and a
 * task is diagnosed by its own domain's. All arithmetic is `lib/decimal.ts`
 * (no floats).
 */
import type { ConvertUnit, DecimalWork, MisconceptionCode } from '../../schema';
import type { Frac } from '../fraction';
import { add, digitAt, divWhole, eq, formatDecimal, fracDigits, fromWhole, minPlaces, parseDecimal, round, scale, sub, truncate, wholePart, withPlaces, type Decimal } from '../decimal';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** The shortest way a value is written (2.50 → "2.5"). */
const short = (d: Decimal): string => formatDecimal(withPlaces({ units: d.units, dp: 0 }, 0));
const text = (d: Decimal): string => formatDecimal(d);
const int = (s: string): number => (s === '' ? 0 : Number(s));
const parse = (s: string): Decimal | null => parseDecimal(s);
const is = (x: Decimal, s: string | null): boolean => s !== null && parse(s) !== null && eq(x, parse(s)!);
const pow10 = (n: number): number => 10 ** n;

/** Texts made from `c` by leaving out one placeholder 0 after the point, or putting one in (0.07 → 0.7; 0.7 → 0.07; 4.035 → 4.35). */
export function placeholderSlips(c: Decimal): string[] {
  const s = short(c);
  const [w, f = ''] = s.split('.');
  const out: string[] = [];
  for (let i = 0; i < f.length; i++) if (f[i] === '0' && /[1-9]/.test(f.slice(i + 1))) out.push(`${w}.${f.slice(0, i)}${f.slice(i + 1)}`);
  for (let i = 0; i < f.length; i++) if (/[1-9]/.test(f.slice(i))) out.push(`${w}.${f.slice(0, i)}0${f.slice(i)}`);
  return out;
}

/** Each place's digits of two numbers lined up on the point (`places` after it), lowest place first. */
function columnsOf(a: Decimal, b: Decimal): { A: number[]; B: number[]; places: number } {
  const places = Math.max(a.dp, b.dp);
  const digits = (d: Decimal) => String(Math.round(d.units / pow10(6 - places))).split('').reverse().map(Number);
  const A = digits(a);
  const B = digits(b);
  // Down to the ones place at least (0.47 is 0 . 4 7): the top place is the highest place written.
  const n = Math.max(A.length, B.length, places + 1);
  while (A.length < n) A.push(0);
  while (B.length < n) B.push(0);
  return { A, B, places };
}

/**
 * `a + b` worked place by place, each place keeping only its ones digit and the carries never added; the
 * top place (the ones at least) is written whole, as a child writes it: 0.68 + 0.57 → 0.15, 4.7 + 8.5 → 12.2.
 */
export function carryDroppedSum(a: Decimal, b: Decimal): Decimal {
  const { A, B, places } = columnsOf(a, b);
  const top = A.length - 1;
  return fromColumns(A.map((d, i) => (i === top ? d + B[i]! : (d + B[i]!) % 10)), places);
}

/**
 * `a × k` (one-digit k) worked place by place, each place keeping only its product's ones digit; the top
 * place (the ones at least) keeps its whole product, as for whole numbers (47 × 3 → 121): 2.35 × 3 → 6.95,
 * 4.7 × 3 → 12.1, 0.47 × 3 → 0.21.
 */
export function carryDroppedProduct(a: Decimal, k: number): Decimal {
  const { A, places } = columnsOf(a, a);
  const top = A.length - 1;
  return fromColumns(A.map((d, i) => (i === top ? d * k : (d * k) % 10)), places);
}

/** Digits lowest place first back into a decimal with `places` places. */
function fromColumns(digits: number[], places: number): Decimal {
  const n = digits.reduceRight((s, d) => s * 10 + d, 0);
  return { units: n * pow10(6 - places), dp: places };
}

/** The factor and direction of a conversion (`null`: not one the lesson makes). */
const FACTORS: Record<string, number> = { 'km>m': 1000, 'm>cm': 100, 'kg>g': 1000, 'l>ml': 1000, 'dollar>cent': 100 };
export function conversionOf(from: ConvertUnit, into: ConvertUnit): { factor: number; down: boolean } | null {
  if (FACTORS[`${from}>${into}`]) return { factor: FACTORS[`${from}>${into}`]!, down: true };
  if (FACTORS[`${into}>${from}`]) return { factor: FACTORS[`${into}>${from}`]!, down: false };
  return null;
}

/** The zeros of a power of ten (1000 → 3). */
const zerosOf = (k: number): number => String(k).length - 1;

/** × or ÷ a whole number, written with the places it needs (`null` when ÷ leaves more than six places). */
function times(a: Decimal, k: number, down: boolean): Decimal | null {
  if (down) return withPlaces({ units: a.units * k, dp: 0 }, 0);
  const q = divWhole(a, k);
  return q.exact ? q.q : null;
}

/* ------------------------------------------------------------------ */
/* What the work comes to                                              */
/* ------------------------------------------------------------------ */

/** The value a piece of work comes to (validate checks it is the answer); `null` when it is not worked out from numbers. */
export function workResult(w: DecimalWork): Decimal | null {
  const { a, b } = w;
  switch (w.do) {
    case 'add':
      return a && b ? add(a, b) : null;
    case 'subtract':
      return a && b ? sub(a, b) : null;
    case 'multiply':
      return a && b ? { units: a.units * wholePart(b), dp: a.dp } : null;
    case 'divide':
      return a && b ? divWhole(a, wholePart(b), w.to ?? 6).q : null;
    case 'round':
      return a && w.to !== undefined ? round(a, w.to) : null;
    case 'scale':
      return a && w.op && w.by ? times(a, w.by, w.op === '×') : null;
    case 'convert': {
      const c = a && w.from && w.into ? conversionOf(w.from, w.into) : null;
      return a && c ? times(a, c.factor, c.down) : null;
    }
    case 'compose': {
      if (!w.parts) return null;
      const PLACE: Record<string, number> = { Th: 3, H: 2, T: 1, O: 0, t: -1, h: -2, th: -3 };
      return w.parts.reduce<Decimal>((s, p) => add(s, { units: p.digit * pow10(6 + PLACE[p.place]!), dp: Math.max(0, -PLACE[p.place]!) }), fromWhole(0));
    }
    case 'read':
      return w.line && w.tick !== undefined ? { units: w.line.from.units + w.tick * w.line.step.units, dp: Math.max(w.line.from.dp, w.line.step.dp) } : null;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* A written decimal                                                   */
/* ------------------------------------------------------------------ */

export interface DecimalContext {
  /** The right answer as the data writes it. */
  answer: Decimal;
  /** The places the answer must be written with (`null`: judged by value). */
  places: number | null;
  /** What is worked out (`null`: only the right value is known). */
  work: DecimalWork | null;
}

/** The number rounded and the places, for the rounding rules: `round` work, or a division to be rounded. */
function rounding(c: DecimalContext): { v: Decimal; n: number } | null {
  const w = c.work;
  if (w?.do === 'round' && w.a && w.to !== undefined) return { v: w.a, n: w.to };
  if (w?.do === 'divide' && w.a && w.b && c.places !== null) return { v: divWhole(w.a, wholePart(w.b), 6).q, n: c.places };
  return null;
}

/** The digit just after the `n`th place. */
const nextDigit = (v: Decimal, n: number): number => digitAt(v, -(n + 1));

/** Does a written decimal show the misconception? */
export function decimalShows(code: MisconceptionCode, c: DecimalContext, x: Decimal): boolean {
  const w = c.work;
  const right = c.answer;
  if (code === 'places-short') return c.places !== null && eq(x, right) && x.dp < c.places;
  if (eq(x, right)) return false;
  const { a, b } = w ?? {};
  switch (code) {
    case 'point-separator': {
      if (!w || !a || !b) return false;
      const fa = fracDigits(a);
      const fb = fracDigits(b);
      if (w.do === 'add' && (fa || fb)) return text(x) === `${wholePart(a) + wholePart(b)}.${int(fa) + int(fb)}`;
      if (w.do === 'subtract' && fa && fb && wholePart(a) >= wholePart(b) && int(fa) >= int(fb)) return text(x) === `${wholePart(a) - wholePart(b)}.${int(fa) - int(fb)}`;
      if (w.do === 'multiply' && fa) return text(x) === `${wholePart(a) * wholePart(b)}.${int(fa) * wholePart(b)}`;
      return false;
    }
    case 'zero-placeholder': {
      if (w?.do === 'convert' && a && w.from && w.into) {
        const conv = conversionOf(w.from, w.into);
        if (!conv?.down) return false;
        return placeholderSlips(a).some((s) => {
          const slipped = parse(s);
          const value = slipped ? times(slipped, conv.factor, true) : null;
          return !!value && eq(x, value);
        });
      }
      if (w && !['compose', 'read', 'to-decimal'].includes(w.do)) return false;
      return placeholderSlips(right).some((s) => is(x, s));
    }
    case 'place-order': {
      if (w?.do !== 'compose' || !w.parts) return false;
      const PLACE: Record<string, number> = { Th: 3, H: 2, T: 1, O: 0, t: -1, h: -2, th: -3 };
      const wholeParts = w.parts.filter((p) => PLACE[p.place]! >= 0);
      const whole = wholeParts.reduce((s, p) => s + p.digit * pow10(PLACE[p.place]!), 0);
      const fracs = w.parts.filter((p) => PLACE[p.place]! < 0).map((p) => p.digit).join('');
      const listed = w.parts.map((p) => p.digit).join('');
      const k = wholeParts.length;
      const all = k === 0 ? `0.${listed}` : `${listed.slice(0, k)}.${listed.slice(k)}`;
      return is(x, `${whole}.${fracs}`) || is(x, all);
    }
    case 'fraction-as-digits': {
      const f = w?.do === 'to-decimal' && w.of && !('kind' in w.of) ? w.of : null;
      if (!f) return false;
      const head = f.w ?? 0;
      return [`${head}.${f.n}`, `${head}.${f.d}`, `${head}.${f.n}${f.d}`, `${head}.${f.d}${f.n}`].some((s) => is(x, s));
    }
    case 'place-denominator': {
      const f = w?.do === 'to-decimal' && w.of && !('kind' in w.of) ? w.of : null;
      if (!f) return false;
      const n = (f.w ?? 0) * f.d + f.n;
      // n/d as N/10^m, then N over the wrong power of ten.
      for (let m = 0; m <= 3; m++) {
        const N = (n * pow10(m)) / f.d;
        if (!Number.isInteger(N)) continue;
        return [1, 2, 3].filter((k) => k !== m).some((k) => eq(x, { units: N * pow10(6 - k), dp: k }));
      }
      return false;
    }
    case 'interval-misread': {
      if (w?.do !== 'read' || !w.line || w.tick === undefined) return false;
      const { from, step } = w.line;
      const big = { units: from.units + w.tick * step.units * 10, dp: 0 };
      const small = step.units % 10 === 0 ? { units: from.units + (w.tick * step.units) / 10, dp: 0 } : null;
      return eq(x, big) || (!!small && eq(x, small));
    }
    case 'tick-counting': {
      if (w?.do !== 'read' || !w.line) return false;
      return eq(x, add(right, w.line.step));
    }
    case 'round-truncated': {
      const r = rounding(c);
      if (!r) return false;
      const next = nextDigit(r.v, r.n);
      return next >= 6 && eq(x, truncate(r.v, r.n));
    }
    case 'round-carry-slip': {
      const r = rounding(c);
      if (!r) return false;
      const kept = digitAt(r.v, r.n === 0 ? 1 : -r.n);
      if (kept !== 9 || nextDigit(r.v, r.n) < 5) return false;
      const cut = text(truncate(r.v, r.n));
      return text(x) === `${cut.slice(0, -1)}10`;
    }
    case 'round-wrong-place': {
      const r = rounding(c);
      if (!r) return false;
      return [0, 1, 2, 3].filter((m) => m !== r.n).some((m) => eq(x, round(r.v, m)));
    }
    case 'round-chain': {
      const r = rounding(c);
      if (!r || minPlaces(r.v) < r.n + 2) return false;
      const twice = round(round(r.v, r.n + 1), r.n);
      return !eq(twice, round(r.v, r.n)) && eq(x, twice);
    }
    case 'round-half-down': {
      const r = rounding(c);
      if (!r) return false;
      const step = pow10(6 - r.n);
      return r.v.units % step === step / 2 && eq(x, truncate(r.v, r.n));
    }
    case 'aligned-right': {
      if (!w || !a || !b || (w.do !== 'add' && w.do !== 'subtract')) return false;
      const A = Number(`${wholePart(a)}${fracDigits(a)}`);
      const B = Number(`${wholePart(b)}${fracDigits(b)}`);
      const n = w.do === 'add' ? A + B : A - B;
      if (n < 0) return false;
      return eq(x, { units: n * pow10(6 - Math.max(a.dp, b.dp)), dp: 0 });
    }
    case 'carry-not-added': {
      if (!w || !a || !b) return false;
      if (w.do === 'add') return eq(x, carryDroppedSum(a, b));
      if (w.do === 'multiply') {
        const k = wholePart(b);
        return k < 10 && eq(x, carryDroppedProduct(a, k));
      }
      return false;
    }
    case 'smaller-from-larger': {
      if (w?.do !== 'subtract' || !a || !b) return false;
      const { A, B, places } = columnsOf(a, b);
      return eq(x, fromColumns(A.map((d, i) => Math.abs(d - B[i]!)), places));
    }
    case 'empty-place-brought-down': {
      if (w?.do !== 'subtract' || !a || !b || a.dp >= b.dp) return false;
      const cut = truncate(b, a.dp);
      const head = sub(a, cut);
      const tail = sub(b, cut);
      return !!head && !!tail && eq(x, add(head, tail));
    }
    case 'point-misplaced': {
      if (w?.do !== 'multiply' && w?.do !== 'divide') return false;
      return [-3, -2, -1, 1, 2, 3].some((k) => {
        const moved = scale(right, k);
        return !!moved && eq(x, moved);
      });
    }
    case 'zero-in-quotient': {
      if (w?.do !== 'divide') return false;
      const s = short(right);
      const [wh, f = ''] = s.split('.');
      for (let i = 0; i < f.length; i++) if (f[i] === '0' && /[1-9]/.test(f[i + 1] ?? '') && is(x, `${wh}.${f.slice(0, i)}${f.slice(i + 1)}`)) return true;
      return false;
    }
    case 'remainder-as-decimal': {
      if (w?.do !== 'divide' || !a || !b || fracDigits(a) !== '' || fracDigits(b) !== '') return false;
      const A = wholePart(a);
      const B = wholePart(b);
      const r = A % B;
      return r > 0 && is(x, `${Math.floor(A / B)}.${r}`);
    }
    case 'shift-wrong-way': {
      if (!a) return false;
      if (w?.do === 'scale' && w.op && w.by) {
        const other = times(a, w.by, w.op === '÷');
        return !!other && eq(x, other);
      }
      if (w?.do === 'convert' && w.from && w.into) {
        const conv = conversionOf(w.from, w.into);
        const other = conv ? times(a, conv.factor, !conv.down) : null;
        return !!other && eq(x, other);
      }
      return false;
    }
    case 'shift-count-wrong': {
      if (w?.do !== 'scale' || !a || !w.op || !w.by) return false;
      return [10, 100, 1000].filter((k) => k !== w.by).some((k) => {
        const moved = times(a, k, w.op === '×');
        return !!moved && eq(x, moved);
      });
    }
    case 'zero-appended': {
      if (w?.do !== 'scale' || w.op !== '×' || !a || !w.by || a.dp === 0 || ![10, 100, 1000].includes(w.by)) return false;
      return text(x) === `${text(a)}${'0'.repeat(zerosOf(w.by))}`;
    }
    case 'decimal-as-subunit': {
      if (w?.do !== 'convert' || !a || !w.from || !w.into) return false;
      const conv = conversionOf(w.from, w.into);
      if (!conv) return false;
      if (conv.down) return fracDigits(a) !== '' && eq(x, fromWhole(wholePart(a) * conv.factor + int(fracDigits(a))));
      const whole = wholePart(a);
      return a.dp === 0 && text(x) === `${Math.floor(whole / conv.factor)}.${whole % conv.factor}` && text(x) !== short(right);
    }
    case 'unit-factor-wrong': {
      if (w?.do !== 'convert' || !a || !w.from || !w.into) return false;
      const conv = conversionOf(w.from, w.into);
      if (!conv) return false;
      return [10, 100, 1000].filter((k) => k !== conv.factor).some((k) => {
        const other = times(a, k, conv.down);
        return !!other && eq(x, other);
      });
    }
    default:
      return false;
  }
}

/** The first declared code a written decimal shows. */
export function diagnoseDecimal(codes: readonly MisconceptionCode[], c: DecimalContext, x: Decimal): MisconceptionCode | null {
  return codes.find((code) => decimalShows(code, c, x)) ?? null;
}

/* ------------------------------------------------------------------ */
/* A decimal written as a fraction                                     */
/* ------------------------------------------------------------------ */

/** Does a written fraction (as written, not simplified) show the misconception, for a decimal turned into a fraction? */
export function fractionShows(code: MisconceptionCode, work: DecimalWork | null, x: Frac): boolean {
  const d = work?.do === 'to-fraction' && work.of && 'kind' in work.of ? work.of : null;
  if (!d) return false;
  const f = fracDigits(withPlaces({ units: d.units, dp: 0 }, 0));
  const x0 = x.w ? { n: x.w * x.d + x.n, d: x.d } : x;
  switch (code) {
    case 'place-denominator': {
      const N = Number(`${wholePart(d)}${f}`);
      return x0.n === N && [10, 100, 1000].filter((k) => k !== pow10(f.length)).includes(x0.d);
    }
    case 'fraction-as-digits':
      return wholePart(d) === 0 && f !== '' && x0.n === 1 && x0.d === int(f) && x0.d > 1;
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ */
/* Comparing and ordering                                              */
/* ------------------------------------------------------------------ */

export type Claim = '<' | '=' | '>';

/** Does the symbol claimed between `a` and `b` show the misconception? */
export function compareShows(code: MisconceptionCode, a: Decimal, b: Decimal, claim: Claim): boolean {
  const truth: Claim = a.units < b.units ? '<' : a.units > b.units ? '>' : '=';
  if (claim === truth) return false;
  if (code === 'trailing-zero-changes') return eq(a, b) && a.dp !== b.dp && claim !== '=';
  if (eq(a, b) || wholePart(a) !== wholePart(b)) return false;
  const [s, g] = a.units < b.units ? [a, b] : [b, a];
  const claimsSmallBigger = s === a ? claim === '>' : claim === '<';
  if (!claimsSmallBigger) return false;
  const fs = fracDigits(s);
  const fg = fracDigits(g);
  if (code === 'longer-is-larger') return fs.length > fg.length && int(fs) > int(fg);
  if (code === 'shorter-is-larger') return fs.length < fg.length;
  return false;
}

/** The order a rule would give (indices), ascending or descending. */
function orderBy(items: readonly Decimal[], key: (d: Decimal) => number[], dir: 'asc' | 'desc'): number[] {
  const sign = dir === 'asc' ? 1 : -1;
  return items
    .map((d, i) => ({ k: key(d), i }))
    .sort((p, q) => {
      for (let j = 0; j < p.k.length; j++) if (p.k[j] !== q.k[j]) return (p.k[j]! - q.k[j]!) * sign;
      return 0;
    })
    .map((x) => x.i);
}

/** Does the child's order show the misconception? */
export function orderShows(code: MisconceptionCode, items: readonly Decimal[], order: readonly number[], dir: 'asc' | 'desc'): boolean {
  const right = orderBy(items, (d) => [d.units], dir);
  if (order.every((v, i) => v === right[i])) return false;
  const same = (o: number[]) => o.length === order.length && o.every((v, i) => v === order[i]);
  // The digits after the point read as a whole number.
  if (code === 'longer-is-larger') return same(orderBy(items, (d) => [wholePart(d), int(fracDigits(d))], dir));
  // Fewer places first counts as larger; numbers with as many places by their value.
  if (code === 'shorter-is-larger') return same(orderBy(items, (d) => [wholePart(d), -d.dp, d.units], dir));
  return false;
}

/* ------------------------------------------------------------------ */
/* On the stage: the line, the grid, the digits moved                  */
/* ------------------------------------------------------------------ */

/** A place on a decimal line (`step`: the deepest line's step). */
export function placeShows(code: MisconceptionCode, target: Decimal, x: Decimal, step: Decimal): boolean {
  if (eq(x, target)) return false;
  if (code === 'tick-counting') return target.units >= step.units && eq(x, { units: target.units - step.units, dp: 0 });
  if (code === 'zero-placeholder') return placeholderSlips(target).some((s) => is(x, s));
  if (code === 'place-order') {
    const [w, f = ''] = short(target).split('.');
    for (let i = 0; i + 1 < f.length; i++) if (f[i] !== f[i + 1] && is(x, `${w}.${f.slice(0, i)}${f[i + 1]}${f[i]}${f.slice(i + 2)}`)) return true;
  }
  return false;
}

/** An amount shaded on the grid. */
export function shadeShows(code: MisconceptionCode, target: Decimal, x: Decimal): boolean {
  return code === 'zero-placeholder' && !eq(x, target) && placeholderSlips(target).some((s) => is(x, s));
}

/** The digits moved: the result against `value op by`. */
export function shiftShows(code: MisconceptionCode, value: Decimal, op: '×' | '÷', by: number, x: Decimal): boolean {
  return decimalShows(code, { answer: times(value, by, op === '×') ?? value, places: null, work: { do: 'scale', a: value, op, by } }, x);
}
