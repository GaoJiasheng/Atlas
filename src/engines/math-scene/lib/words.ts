/**
 * Numbers read aloud (docs/15 §4.6, §4.7; docs/19 §3.0 G7): fractions en
 * "three quarters", "one and three quarters", zh「四分之三」「一又四分之三」;
 * whole numbers to 99 999 ("three hundred and five" /「三百零五」); place
 * values ("1 hundred 2 tens 0 ones"); times of day ("seven twenty p.m.",
 * "twenty past seven" /「晚上七点二十分」「十九时二十分」) and durations
 * ("one hour thirty-five minutes" /「一小时三十五分钟」); decimals digit by digit
 * after the point ("zero point three five" /「零点三五」, docs/29 D9) and money
 * ("2 dollars 35 cents" /「2 元 35 分」). Used for aria labels,
 * the presentation's spoken captions and `speakable()` (src/lib/rich-text.ts).
 * A `?` in a slot (`{?/12}`, `{8/?}`) reads as a question: "how many
 * twelfths", "eight over what"; zh「十二分之几」「几分之八」.
 */
import type { Frac } from './fraction';
import { clockParts, compoundWords, durationParts, periodZh, unitWords, type ClockMode, type DurUnit, type QtyValue } from './value';
import { fracDigits, wholePart, type Decimal } from './decimal';

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function under100En(n: number): string {
  if (n < 20) return ONES[n]!;
  const t = TENS[Math.floor(n / 10)]!;
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}

function under1000En(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (!h) return under100En(rest);
  return rest ? `${ONES[h]} hundred and ${under100En(rest)}` : `${ONES[h]} hundred`;
}

/** English cardinal for 0–99 999, the British way ("three hundred and five", "one thousand and twenty"); digits beyond that. */
export function numberEn(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99_999) return String(n);
  const k = Math.floor(n / 1000);
  const rest = n % 1000;
  if (!k) return under1000En(rest);
  const head = `${under100En(k)} thousand`;
  if (!rest) return head;
  return rest < 100 ? `${head} and ${under100En(rest)}` : `${head} ${under1000En(rest)}`;
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
const ZH_PLACES = ['', '十', '百', '千', '万'];

/** Chinese numeral for 0–99 999（十、十二、一百零五、一千零二十、二万三千）; digits beyond that. */
export function numberZh(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99_999) return String(n);
  if (n < 10) return ZH_DIGITS[n]!;
  const digits = String(n).split('').map(Number);
  const top = digits.length - 1;
  let out = '';
  let zero = false;
  digits.forEach((d, i) => {
    const place = top - i;
    if (d === 0) {
      zero = out !== '';
      return;
    }
    if (zero) out += '零';
    zero = false;
    // 10–19 read 十, 十一 … (not 一十一).
    out += (d === 1 && place === 1 && i === 0 ? '' : ZH_DIGITS[d]!) + ZH_PLACES[place]!;
  });
  return out;
}

/** A whole number in words. */
export const wholeWords = (n: number, locale: 'en' | 'zh'): string => (locale === 'zh' ? numberZh(n) : numberEn(n));

/**
 * A decimal read aloud, the digits after the point one by one as written
 * (docs/29 D9): "zero point three five", "thirty-four point five zero six",
 * "three point zero"; zh「零点三五」「三十四点五零六」. `more`: a decimal that
 * goes on (`0.666…`): "…, and so on" /「……，一直下去」.
 */
export function decimalWords(d: Decimal, locale: 'en' | 'zh', more = false): string {
  const f = [...fracDigits(d)].map(Number);
  if (locale === 'zh') return `${numberZh(wholePart(d))}${f.length ? `点${f.map((x) => ZH_DIGITS[x]).join('')}` : ''}${more ? '，一直下去' : ''}`;
  return `${numberEn(wholePart(d))}${f.length ? ` point ${f.map((x) => ONES[x]).join(' ')}` : ''}${more ? ', and so on' : ''}`;
}

/** An amount of money read aloud: "2 dollars 35 cents", "35 cents", "3 dollars"; zh「2 元 35 分」「35 分」「3 元」. */
export function moneyWords(cents: number, locale: 'en' | 'zh'): string {
  const dollars = Math.floor(cents / 100);
  const c = cents % 100;
  if (locale === 'zh') return [dollars || !c ? `${dollars} 元` : '', c ? `${c} 分` : ''].filter(Boolean).join(' ');
  return [dollars || !c ? `${dollars} dollar${dollars === 1 ? '' : 's'}` : '', c ? `${c} cent${c === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ');
}

/** The name of a decimal place: `tenths` /「十分位」 (1 = tenths … 3 = thousandths). */
export function decimalPlaceName(place: number, locale: 'en' | 'zh'): string {
  if (locale === 'zh') return ['', '十分位', '百分位', '千分位'][place] ?? '';
  return ['', 'tenths', 'hundredths', 'thousandths'][place] ?? '';
}

const PLACE_NAMES = {
  en: [
    ['one', 'ones'],
    ['ten', 'tens'],
    ['hundred', 'hundreds'],
    ['thousand', 'thousands'],
    ['ten thousand', 'ten thousands'],
  ],
  zh: ['一', '十', '百', '千', '万'],
} as const;

/** The name of a place: `ones`, `tens` /「个位」「十位」… (`count` picks en singular / plural). */
export function placeName(place: number, locale: 'en' | 'zh', count = 2): string {
  if (locale === 'zh') return `${['个', '十', '百', '千', '万'][place] ?? ''}位`;
  const p = PLACE_NAMES.en[place] ?? PLACE_NAMES.en[0];
  return count === 1 ? p[0] : p[1];
}

/** Counts by place, highest first: `{ H: 1, T: 2, O: 0 }` → "1 hundred, 2 tens and 0 ones" /「1 个百、2 个十和 0 个一」. */
export function placeValueWords(counts: readonly number[], locale: 'en' | 'zh'): string {
  // `counts` are ones first (index = place).
  const parts = counts
    .map((c, place) => ({ c, place }))
    .reverse()
    .map(({ c, place }) => (locale === 'zh' ? `${c} 个${PLACE_NAMES.zh[place]}` : `${c} ${placeName(place, 'en', c)}`));
  if (parts.length === 1) return parts[0]!;
  const last = parts.pop()!;
  return locale === 'zh' ? `${parts.join('、')}和 ${last}` : `${parts.join(', ')} and ${last}`;
}

/* ------------------------------------------------------------------ */
/* Times of day and durations                                          */
/* ------------------------------------------------------------------ */

const twoEn = (m: number) => (m === 0 ? '' : m < 10 ? `oh ${ONES[m]}` : under100En(m));

/**
 * A time of day read aloud (docs/20 §3.3): 12-hour "seven twenty p.m.",
 * "seven o'clock a.m."; a face reading "seven twenty"; 24-hour "nineteen
 * twenty", "nineteen hundred". zh「晚上七点二十分」「七点二十分」「十九时二十分」.
 */
export function clockWords(t: number, mode: ClockMode, locale: 'en' | 'zh'): string {
  const p = clockParts(t);
  const sec = (en: boolean) => (p.s ? (en ? ` and ${under100En(p.s)} second${p.s === 1 ? '' : 's'}` : `${numberZh(p.s)}秒`) : '');
  if (locale === 'zh') {
    if (mode === '24') return `${numberZh(p.h24)}时${p.m ? `${numberZh(p.m)}分` : p.s ? '零分' : ''}${sec(false)}`;
    const face = `${numberZh(p.h12)}点${p.m ? `${p.m < 10 ? '零' : ''}${numberZh(p.m)}分` : p.s ? '零分' : ''}${sec(false)}`;
    return mode === 'face' ? face : `${periodZh(t)}${face}`;
  }
  if (mode === '24') {
    const h = p.h24 < 10 ? `zero ${ONES[p.h24]}` : under100En(p.h24);
    return `${h} ${p.m ? twoEn(p.m) : 'hundred'}${sec(true)}`;
  }
  const face = p.m ? `${ONES[p.h12]} ${twoEn(p.m)}` : `${ONES[p.h12]} o'clock`;
  return mode === 'face' ? `${face}${sec(true)}` : `${face} ${p.pm ? 'p.m.' : 'a.m.'}${sec(true)}`;
}

/**
 * The "past" reading of a clock face (docs/20 D7, no "to"): "seven o'clock",
 * "quarter past seven", "half past seven", "twenty past seven", "eleven
 * minutes past seven"; past the half hour, the digital reading ("seven forty").
 * zh「七点整」「七点半」「七点二十分」.
 */
export function clockPastWords(t: number, locale: 'en' | 'zh'): string {
  const p = clockParts(t);
  if (locale === 'zh') {
    if (p.m === 0) return `${numberZh(p.h12)}点整`;
    if (p.m === 30) return `${numberZh(p.h12)}点半`;
    return `${numberZh(p.h12)}点${p.m < 10 ? '零' : ''}${numberZh(p.m)}分`;
  }
  const h = ONES[p.h12]!;
  if (p.m === 0) return `${h} o'clock`;
  if (p.m === 15) return `quarter past ${h}`;
  if (p.m === 30) return `half past ${h}`;
  if (p.m < 30) return p.m % 5 === 0 ? `${under100En(p.m)} past ${h}` : `${under100En(p.m)} minute${p.m === 1 ? '' : 's'} past ${h}`;
  return `${h} ${under100En(p.m)}`;
}

const DUR_WORDS = { h: ['hour', 'hours', '小时'], m: ['minute', 'minutes', '分钟'], s: ['second', 'seconds', '秒'] } as const;

/** A duration read aloud, in the units it is written in: "one hour thirty-five minutes" /「一小时三十五分钟」. */
export function durationWords(t: number, units: readonly DurUnit[], locale: 'en' | 'zh'): string {
  const p = durationParts(t, units);
  const shown = units.filter((u) => p[u] > 0);
  const list = shown.length ? shown : units.slice(-1);
  if (locale === 'zh') return list.map((u) => `${numberZh(p[u])}${DUR_WORDS[u][2]}`).join('');
  return list.map((u) => `${numberEn(p[u])} ${DUR_WORDS[u][p[u] === 1 ? 0 : 1]}`).join(' ');
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

/**
 * A quantity read aloud (docs/32 §3.1): one unit with the number in words ("three hundred and fifty grams" /
 * 「三百五十克」, a decimal digit by digit); two units "2 metres 35 centimetres" /「2 米 35 厘米」.
 */
export function qtyWords(q: QtyValue, locale: 'en' | 'zh'): string {
  if (q.kind === 'cmp') return compoundWords(q, locale);
  const whole = q.value.units % 1_000_000 === 0;
  const n = q.value.units / 1_000_000;
  const number = whole ? (locale === 'zh' ? numberZh(n) : numberEn(n)) : decimalWords(q.value, locale);
  return `${number}${locale === 'zh' ? '' : ' '}${unitWords(q.unit, locale, whole && n === 1 ? 1 : 2)}`;
}
