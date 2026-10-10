/**
 * Fractions read aloud (docs/15 §4.6, §4.7): en "three quarters", "one and
 * three quarters"; zh「四分之三」「一又四分之三」. Used for aria labels, the
 * presentation's spoken captions and `speakable()` (src/lib/rich-text.ts).
 * A `?` in a slot (`{?/12}`, `{8/?}`) reads as a question: "how many
 * twelfths", "eight over what"; zh「十二分之几」「几分之八」.
 */
import type { Frac } from './fraction';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** English cardinal for 0–99 (digits beyond that). */
export function numberEn(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n]!;
  const t = TENS[Math.floor(n / 10)]!;
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}

const ORDINAL: Record<number, [string, string]> = {
  2: ['half', 'halves'],
  3: ['third', 'thirds'],
  4: ['quarter', 'quarters'],
  5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'],
  7: ['seventh', 'sevenths'],
  8: ['eighth', 'eighths'],
  9: ['ninth', 'ninths'],
  10: ['tenth', 'tenths'],
  11: ['eleventh', 'elevenths'],
  12: ['twelfth', 'twelfths'],
  14: ['fourteenth', 'fourteenths'],
  15: ['fifteenth', 'fifteenths'],
  16: ['sixteenth', 'sixteenths'],
  18: ['eighteenth', 'eighteenths'],
  20: ['twentieth', 'twentieths'],
  24: ['twenty-fourth', 'twenty-fourths'],
};

/** "quarter" / "quarters" for a denominator (plural when the count is not one). */
export function denominatorEn(d: number, plural: boolean): string {
  const o = ORDINAL[d];
  if (o) return plural ? o[1] : o[0];
  return plural ? `${numberEn(d)}ths` : `${numberEn(d)}th`;
}

const ZH_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** Chinese numeral for 0–99（十、十二、二十、三十五）. */
export function numberZh(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 10) return ZH_DIGITS[n]!;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens === 1 ? '' : ZH_DIGITS[tens]}十${ones ? ZH_DIGITS[ones] : ''}`;
}

/** A slot of a written fraction: a number, or `null` for a `?` blank. */
export interface FracSlots {
  w?: number | null;
  n: number | null;
  d: number | null;
}

function fracEn({ n, d }: { n: number | null; d: number | null }): string {
  if (d === null) return n === null ? 'what over what' : `${numberEn(n)} over what`;
  if (n === null) return d === 1 ? 'how many' : `how many ${denominatorEn(d, true)}`;
  if (d === 1) return numberEn(n);
  return `${numberEn(n)} ${denominatorEn(d, n !== 1)}`;
}

function fracZh({ n, d }: { n: number | null; d: number | null }): string {
  if (d === 1 && n !== null) return numberZh(n);
  return `${d === null ? '几' : numberZh(d)}分之${n === null ? '几' : numberZh(n)}`;
}

/** The fraction in words: en "three quarters", "one and three quarters"; zh「四分之三」「一又四分之三」. */
export function fractionWords(f: Frac | FracSlots, locale: 'en' | 'zh'): string {
  const w = f.w ?? null;
  const part = { n: f.n, d: f.d };
  if (locale === 'zh') {
    if (w) return part.n === 0 ? numberZh(w) : `${numberZh(w)}又${fracZh(part)}`;
    return fracZh(part);
  }
  if (w) return part.n === 0 ? numberEn(w) : `${numberEn(w)} and ${fracEn(part)}`;
  return fracEn(part);
}

/** The part of a picture option a screen reader needs: a bar's cut and shading, the length of a shorter whole. */
export interface BarPicture {
  parts: number | null;
  cuts?: number[];
  diagonal?: boolean;
  shaded?: number | number[];
  given?: number | number[];
  length?: number;
  object?: string;
  wholes?: number;
}

const count = (v: number | number[] | undefined): number => (v === undefined ? 0 : Array.isArray(v) ? v.length : 1);

/** One picture option in words (docs/15 §4.7): "a kueh cut into 4 equal parts", "a bar cut into 3 parts of different sizes, 1 shaded". */
export function describePicture(rows: BarPicture[], locale: 'en' | 'zh'): string {
  const one = (r: BarPicture): string => {
    const unequal = r.cuts && r.cuts.length > 0;
    const n = unequal ? r.cuts!.length + 1 : (r.parts ?? 1);
    const shaded = count(r.shaded) + count(r.given);
    const kueh = r.object === 'kueh';
    const short = r.length !== undefined && r.length < 1;
    if (locale === 'zh') {
      const what = r.diagonal ? '沿对角线切开的方形千层糕' : kueh ? '千层糕' : short ? '较短的一条' : '一条';
      const cut = r.diagonal ? '，分成相等的 2 份' : unequal ? `，切成 ${n} 份，大小不同` : `，平均分成 ${n} 份`;
      return `${what}${cut}${shaded ? `，涂了 ${shaded} 份` : ''}`;
    }
    const what = r.diagonal ? 'a square kueh cut corner to corner' : kueh ? 'a kueh' : short ? 'a shorter bar' : 'a bar';
    const cut = r.diagonal ? ' into 2 equal parts' : unequal ? ` into ${n} parts of different sizes` : ` into ${n} equal parts`;
    return `${what}${r.diagonal ? '' : ' cut'}${cut}${shaded ? `, ${shaded} shaded` : ''}`;
  };
  if (rows.length === 1) return one(rows[0]!);
  return rows.map((r, i) => (locale === 'zh' ? `第 ${i + 1} 行：${one(r)}` : `Row ${i + 1}: ${one(r)}`)).join('; ');
}
