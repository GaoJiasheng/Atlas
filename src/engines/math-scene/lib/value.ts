/**
 * The lesson's values besides fractions (docs/19 §3.0 G1, docs/20 §3, docs/21
 * §3). Each has a data notation, a parse, a compare and the text the page
 * shows; the words they are read in live in `words.ts`. Pure: no DOM, no zod.
 *
 * - Whole: a whole number 0–99 999 (`56`, `"56"`).
 * - Remainder: a quotient and a remainder (`"3 r 2"`).
 * - ClockTime: seconds since midnight, written in 24-hour time (`"09:40"`,
 *   `"15:05:30"`); shown in 12-hour time with am / pm, as a clock face reads
 *   it (no am / pm), or in 24-hour time, by the lesson's `notation`.
 * - Duration: seconds (`"1h35m"`, `"95m"`, `"75s"`); shown in the units it
 *   was written in (`95 min`, `1 h 35 min`).
 * - Measure: a number and a unit (`"28 cm2"` → `28 cm²`, `"1.5 l"` → `1.5 ℓ`);
 *   the number is an exact decimal (docs/29 X2), whole on the grid.
 * - Decimal: an exact decimal written with a point (`"0.35"`, docs/29 X1,
 *   `lib/decimal.ts`).
 * - Quantity (docs/32 §3.1): a measure of length, mass or volume in one unit
 *   (`"900 g"`) or in two (`"2 m 35 cm"`: a `Compound`, kept as 235 cm and
 *   how it was written), compared and ordered in the family's smallest unit.
 *
 * The answer types of `input` (`AnswerValue`) are a fraction (`Frac`, which
 * also carries a whole number as `{ n, d: 1 }`) or one of the tagged values
 * below.
 */
import type { Frac } from './fraction';
import { formatDecimal, hasPoint, parseDecimal, type Decimal } from './decimal';

/* ------------------------------------------------------------------ */
/* Whole numbers                                                       */
/* ------------------------------------------------------------------ */

/** Largest whole number an answer box takes (docs/19 G1). */
export const WHOLE_MAX = 99_999;

/** `56` or `"56"` → 56; `null` when it is not a whole number 0–99 999. */
export function parseWhole(v: string | number): number | null {
  const n = typeof v === 'number' ? v : /^\s*\d{1,5}\s*$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) && n >= 0 && n <= WHOLE_MAX ? n : null;
}

/** The digits of a whole number by place, ones first: 352 → [2, 5, 3]. */
export function placeDigits(n: number): number[] {
  const out: number[] = [];
  let x = Math.floor(Math.abs(n));
  do {
    out.push(x % 10);
    x = Math.floor(x / 10);
  } while (x > 0);
  return out;
}

/* ------------------------------------------------------------------ */
/* Remainders                                                          */
/* ------------------------------------------------------------------ */

export interface RemValue {
  kind: 'rem';
  q: number;
  r: number;
}

const REM_RE = /^\s*(\d{1,5})\s*[rR]\s*(\d{1,5})\s*$/;

/** `"3 r 2"` → `{ kind: 'rem', q: 3, r: 2 }`. */
export function parseRemainder(text: string): RemValue | null {
  const m = REM_RE.exec(text);
  return m ? { kind: 'rem', q: Number(m[1]), r: Number(m[2]) } : null;
}

export const formatRemainder = (v: { q: number; r: number }): string => `${v.q} r ${v.r}`;

/* ------------------------------------------------------------------ */
/* Clock times                                                         */
/* ------------------------------------------------------------------ */

export const DAY = 86_400;
export const HOUR = 3_600;
export const MINUTE = 60;

export interface ClockValue {
  kind: 'clock';
  /** Seconds since midnight, 0 … 86 399. */
  t: number;
}

const CLOCK_RE = /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;

/** `"09:40"`, `"9:40"`, `"15:05:30"` (24-hour time) → seconds since midnight; `null` when it is not a time of day. */
export function parseClock(text: string): number | null {
  const m = CLOCK_RE.exec(text);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const s = m[3] === undefined ? 0 : Number(m[3]);
  if (h > 23 || min > 59 || s > 59) return null;
  return h * HOUR + min * MINUTE + s;
}

/** Wrap any number of seconds onto the clock (a day later is the same time). */
export const onClock = (t: number): number => ((Math.round(t) % DAY) + DAY) % DAY;

export interface ClockParts {
  /** 0–23 */
  h24: number;
  /** 1–12 */
  h12: number;
  m: number;
  s: number;
  pm: boolean;
}

export function clockParts(t: number): ClockParts {
  const x = onClock(t);
  const h24 = Math.floor(x / HOUR);
  return { h24, h12: h24 % 12 === 0 ? 12 : h24 % 12, m: Math.floor((x % HOUR) / MINUTE), s: x % MINUTE, pm: h24 >= 12 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The data string: `"09:40"`, `"15:05:30"`. */
export function formatClock(t: number): string {
  const p = clockParts(t);
  return `${pad(p.h24)}:${pad(p.m)}${p.s ? `:${pad(p.s)}` : ''}`;
}

/** How a time of day is shown: 12-hour with am / pm, a clock face's reading (no am / pm), 24-hour. */
export type ClockMode = '12' | 'face' | '24';

/** The lesson's way of writing times (docs/20 D5 / D6, `lesson.json` `notation`). */
export const CLOCK12_NOTATIONS = ['h.mm am', 'h.mm a.m.', 'h:mm am'] as const;
export const CLOCK24_NOTATIONS = ['HH:MM', 'HHMM', 'HH MM'] as const;
export interface Notation {
  clock12: (typeof CLOCK12_NOTATIONS)[number];
  clock24: (typeof CLOCK24_NOTATIONS)[number];
}
export const DEFAULT_NOTATION: Notation = { clock12: 'h.mm am', clock24: 'HH:MM' };

/** The separator between hours and minutes in 12-hour time (`.` or `:`). */
export const sep12 = (n: Notation): string => (n.clock12 === 'h:mm am' ? ':' : '.');
/** The separator between hours and minutes in 24-hour time (`:`, none, or a space). */
export const sep24 = (n: Notation): string => (n.clock24 === 'HH:MM' ? ':' : n.clock24 === 'HH MM' ? ' ' : '');
/** `am` / `pm` as the notation writes them. */
export const ampmText = (pm: boolean, n: Notation): string => (n.clock12 === 'h.mm a.m.' ? (pm ? 'p.m.' : 'a.m.') : pm ? 'pm' : 'am');

/** The part of the day a Chinese reading names: 凌晨 / 上午 / 中午 / 下午 / 晚上. */
export function periodZh(t: number): string {
  const h = clockParts(t).h24;
  if (h < 5) return '凌晨';
  if (h < 12) return '上午';
  if (h < 13) return '中午';
  if (h < 18) return '下午';
  return '晚上';
}

/**
 * A time as shown: 12-hour `7.20 pm`, face `7.20`, 24-hour `19:20`.
 * In Chinese prose the 12-hour time names the part of the day instead of
 * am / pm (`晚上 7.20`); a number sentence (`line`) keeps the notation in both languages.
 */
export function clockText(t: number, mode: ClockMode, notation: Notation = DEFAULT_NOTATION, locale: 'en' | 'zh' = 'en', line = false): string {
  const p = clockParts(t);
  if (mode === '24') {
    const s = sep24(notation);
    return `${pad(p.h24)}${s}${pad(p.m)}${p.s ? `${s || ':'}${pad(p.s)}` : ''}`;
  }
  const s = sep12(notation);
  const face = `${p.h12}${s}${pad(p.m)}${p.s ? `${s}${pad(p.s)}` : ''}`;
  if (mode === 'face') return face;
  if (locale === 'zh' && !line) return `${periodZh(t)} ${face}`;
  return `${face} ${ampmText(p.pm, notation)}`;
}

/* ------------------------------------------------------------------ */
/* Durations                                                           */
/* ------------------------------------------------------------------ */

export type DurUnit = 'h' | 'm' | 's';

export interface DurValue {
  kind: 'dur';
  /** Seconds. */
  t: number;
  /** The units it is written in, largest first (`95m` → `['m']`, `1h35m` → `['h', 'm']`). */
  units: DurUnit[];
}

const DUR_RE = /^\s*(?:(\d{1,3})h)?\s*(?:(\d{1,4})m(?:in)?)?\s*(?:(\d{1,5})s)?\s*$/;

/** `"1h35m"`, `"95m"`, `"75s"`, `"2m30s"` → seconds and the units written; `null` when it is not a duration. */
export function parseDuration(text: string): DurValue | null {
  const m = DUR_RE.exec(text);
  if (!m || (m[1] === undefined && m[2] === undefined && m[3] === undefined)) return null;
  const units: DurUnit[] = [];
  if (m[1] !== undefined) units.push('h');
  if (m[2] !== undefined) units.push('m');
  if (m[3] !== undefined) units.push('s');
  return { kind: 'dur', t: Number(m[1] ?? 0) * HOUR + Number(m[2] ?? 0) * MINUTE + Number(m[3] ?? 0), units };
}

/** Seconds split into the given units (the largest unit takes the rest): 5700 s in h, m → { h: 1, m: 35, s: 0 }. */
export function durationParts(t: number, units: readonly DurUnit[]): { h: number; m: number; s: number } {
  let rest = Math.max(0, Math.round(t));
  const out = { h: 0, m: 0, s: 0 };
  if (units.includes('h')) {
    out.h = Math.floor(rest / HOUR);
    rest -= out.h * HOUR;
  }
  if (units.includes('m')) {
    out.m = Math.floor(rest / MINUTE);
    rest -= out.m * MINUTE;
  }
  out.s = rest;
  // Seconds that are not a unit of the value round into the smallest unit written.
  if (!units.includes('s') && out.s) {
    if (units.includes('m')) out.m += Math.round(out.s / MINUTE);
    else out.h += Math.round(out.s / HOUR);
    out.s = 0;
  }
  return out;
}

/** The units a duration is best written in: hours and minutes, minutes and seconds, or one of them. */
export function naturalUnits(t: number): DurUnit[] {
  if (t % MINUTE) return t >= HOUR ? ['h', 'm', 's'] : t >= MINUTE ? ['m', 's'] : ['s'];
  if (t >= HOUR) return t % HOUR ? ['h', 'm'] : ['h'];
  return ['m'];
}

/** The data string, in the given units (default: the natural ones): `"1h35m"`, `"95m"`. */
export function formatDuration(t: number, units: readonly DurUnit[] = naturalUnits(t)): string {
  const p = durationParts(t, units);
  return units.map((u) => `${p[u]}${u}`).join('');
}

const DUR_SHOWN: Record<DurUnit, { en: string; zh: string }> = {
  h: { en: 'h', zh: '小时' },
  m: { en: 'min', zh: '分钟' },
  s: { en: 's', zh: '秒' },
};

/** A duration as shown: `1 h 35 min` / `1 小时 35 分钟`; a number sentence (`line`) writes h / min / s in both languages. */
export function durationText(t: number, units: readonly DurUnit[], locale: 'en' | 'zh' = 'en', line = false): string {
  const p = durationParts(t, units);
  const shown = units.filter((u) => p[u] > 0);
  return (shown.length ? shown : units.slice(-1)).map((u) => `${p[u]} ${locale === 'zh' && !line ? DUR_SHOWN[u].zh : DUR_SHOWN[u].en}`).join(' ');
}

/* ------------------------------------------------------------------ */
/* Measures (docs/21 §3)                                               */
/* ------------------------------------------------------------------ */

export const LENGTH_UNITS = ['unit', 'cm', 'm'] as const;
export const AREA_UNITS = ['unit2', 'cm2', 'm2'] as const;
/** The units of the measures written in decimals (docs/29 X2): length, mass, volume of liquid (`l` is shown ℓ). */
export const DECIMAL_UNITS = ['km', 'g', 'kg', 'l', 'ml'] as const;
export const UNITS = [...LENGTH_UNITS, ...AREA_UNITS, ...DECIMAL_UNITS] as const;
/** What an answer box may print beside it: a unit, or `dollar` (`$` before the box). */
export const ANSWER_UNITS = [...UNITS, 'dollar'] as const;
export type LengthUnit = (typeof LENGTH_UNITS)[number];
export type AreaUnit = (typeof AREA_UNITS)[number];
export type Unit = (typeof UNITS)[number];

export interface Measure {
  value: Decimal;
  unit: Unit;
}

export const isUnit = (u: unknown): u is Unit => typeof u === 'string' && (UNITS as readonly string[]).includes(u);
export const isAreaUnit = (u: Unit): u is AreaUnit => (AREA_UNITS as readonly string[]).includes(u);

/** The area unit of a length unit (`cm` → `cm2`) and back. */
export const squared = (u: LengthUnit): AreaUnit => `${u}2` as AreaUnit;
/** The length unit of a grid unit (`cm2` → `cm`). */
export const lengthOf = (u: LengthUnit | AreaUnit): LengthUnit => (isAreaUnit(u) ? (u.slice(0, -1) as LengthUnit) : u);

const MEASURE_RE = /^\s*(\d{0,5}(?:\.\d{1,6})?)\s*(cm2|cm²|m2|m²|km|cm|ml|m|kg|g|ℓ|l|unit2|units?|square units?)\s*$/;

/** `"28 cm2"` → 28 cm²; `"1.5 l"` → 1.5 ℓ; `null` when it is not a number with a unit. */
export function parseMeasure(text: string): Measure | null {
  const m = MEASURE_RE.exec(text);
  const value = m ? parseDecimal(m[1]!) : null;
  if (!m || !value) return null;
  const raw = m[2]!;
  const unit: Unit = raw.startsWith('square') || raw === 'unit2' ? 'unit2' : raw.startsWith('unit') ? 'unit' : raw === 'ℓ' ? 'l' : (raw.replace('²', '2') as Unit);
  return { value, unit };
}

/** The data string: `"28 cm2"`, `"1.5 l"`. */
export const formatMeasure = (m: Measure): string => `${formatDecimal(m.value)} ${m.unit}`;

const SHOWN: Record<Unit, { en: [string, string]; zh: string }> = {
  unit: { en: ['unit', 'units'], zh: '单位' },
  cm: { en: ['cm', 'cm'], zh: 'cm' },
  m: { en: ['m', 'm'], zh: 'm' },
  unit2: { en: ['square unit', 'square units'], zh: '平方单位' },
  cm2: { en: ['cm²', 'cm²'], zh: 'cm²' },
  m2: { en: ['m²', 'm²'], zh: 'm²' },
  km: { en: ['km', 'km'], zh: 'km' },
  g: { en: ['g', 'g'], zh: 'g' },
  kg: { en: ['kg', 'kg'], zh: 'kg' },
  l: { en: ['ℓ', 'ℓ'], zh: 'ℓ' },
  ml: { en: ['ml', 'ml'], zh: 'ml' },
};

/** The unit as printed: `cm²`, `square units` (en plural by the count). */
export function unitText(u: Unit, locale: 'en' | 'zh', count = 2): string {
  return locale === 'zh' ? SHOWN[u].zh : SHOWN[u].en[count === 1 ? 0 : 1];
}

/** The count a unit's English name agrees with: 1 (singular) or more. */
const countOf = (d: Decimal): number => (d.units === 1_000_000 && d.dp === 0 ? 1 : 2);

/** `28 cm²`, `14 units`, `1.5 ℓ`, `12 平方单位`. */
export function measureText(m: Measure, locale: 'en' | 'zh'): string {
  return `${formatDecimal(m.value)} ${unitText(m.unit, locale, countOf(m.value))}`;
}

const SPOKEN: Record<Unit, { en: [string, string]; zh: string }> = {
  unit: { en: ['unit', 'units'], zh: '单位' },
  cm: { en: ['centimetre', 'centimetres'], zh: '厘米' },
  m: { en: ['metre', 'metres'], zh: '米' },
  unit2: { en: ['square unit', 'square units'], zh: '平方单位' },
  cm2: { en: ['square centimetre', 'square centimetres'], zh: '平方厘米' },
  m2: { en: ['square metre', 'square metres'], zh: '平方米' },
  km: { en: ['kilometre', 'kilometres'], zh: '千米' },
  g: { en: ['gram', 'grams'], zh: '克' },
  kg: { en: ['kilogram', 'kilograms'], zh: '千克' },
  l: { en: ['litre', 'litres'], zh: '升' },
  ml: { en: ['millilitre', 'millilitres'], zh: '毫升' },
};

/** The unit read aloud: "square centimetres" /「平方厘米」. */
export function unitWords(u: Unit, locale: 'en' | 'zh', count = 2): string {
  return locale === 'zh' ? SPOKEN[u].zh : SPOKEN[u].en[count === 1 ? 0 : 1];
}

/* ------------------------------------------------------------------ */
/* Quantities: a measure in one unit or in two (docs/32 §3.1, M1)       */
/* ------------------------------------------------------------------ */

/** The pairs a compound measure is written in: big unit, small unit, how many small make one big. */
export const COMPOUND_PAIRS = ['km-m', 'm-cm', 'kg-g', 'l-ml'] as const;
export type CompoundPair = (typeof COMPOUND_PAIRS)[number];
export type BigUnit = 'km' | 'm' | 'kg' | 'l';
export type SmallUnit = 'm' | 'cm' | 'g' | 'ml';
export const PAIR: Record<CompoundPair, { big: BigUnit; small: SmallUnit; factor: number }> = {
  'km-m': { big: 'km', small: 'm', factor: 1000 },
  'm-cm': { big: 'm', small: 'cm', factor: 100 },
  'kg-g': { big: 'kg', small: 'g', factor: 1000 },
  'l-ml': { big: 'l', small: 'ml', factor: 1000 },
};
/** The factor between a pair's units, by the pair's id. */
export const FACTOR: Record<CompoundPair, number> = { 'km-m': 1000, 'm-cm': 100, 'kg-g': 1000, 'l-ml': 1000 };

/** A measurement in two units, kept as a whole count of the small unit plus how it was written (`2 m 35 cm`: 235 cm). */
export interface Compound {
  big: BigUnit;
  small: SmallUnit;
  /** The whole measurement in the small unit. */
  total: number;
  bigPart: number;
  smallPart: number;
}

/** The pair of two units (`m`, `cm` → `m-cm`), `null` when they are not one. */
export function pairOf(big: Unit, small: Unit): CompoundPair | null {
  return COMPOUND_PAIRS.find((p) => PAIR[p].big === big && PAIR[p].small === small) ?? null;
}

/** The pair a unit is the big one of (`m` → `m-cm`, `kg` → `kg-g`), else the one it is the small one of. */
export function pairWithBig(u: Unit): CompoundPair | null {
  return COMPOUND_PAIRS.find((p) => PAIR[p].big === u) ?? null;
}

const UNIT_TEXT = '(km|cm|ml|m|kg|g|ℓ|l)';
const COMPOUND_RE = new RegExp(`^\\s*(\\d{1,2})\\s*${UNIT_TEXT}(?:\\s+(\\d{1,4})\\s*${UNIT_TEXT})?\\s*$`);
const normUnit = (u: string): Unit => (u === 'ℓ' ? 'l' : (u as Unit));

/** A compound made from its parts (`null`: not a pair, or the small part is a whole big unit or more). */
export function makeCompound(pair: CompoundPair, bigPart: number, smallPart: number): Compound | null {
  const { big, small, factor } = PAIR[pair];
  if (!Number.isInteger(bigPart) || !Number.isInteger(smallPart) || bigPart < 0 || smallPart < 0 || smallPart >= factor || bigPart > 99) return null;
  return { big, small, total: bigPart * factor + smallPart, bigPart, smallPart };
}

/** `"2 m 35 cm"`, `"1 l 250 ml"`, `"2 ℓ 250 ml"`, `"2 m"` (no small part) → a compound; `null` for `"2 m 135 cm"`, `"2 kg 35 cm"`. */
export function parseCompound(text: string): Compound | null {
  const m = COMPOUND_RE.exec(text);
  if (!m) return null;
  const big = normUnit(m[2]!);
  if (m[3] === undefined) {
    const pair = pairWithBig(big);
    return pair ? makeCompound(pair, Number(m[1]), 0) : null;
  }
  const pair = pairOf(big, normUnit(m[4]!));
  return pair ? makeCompound(pair, Number(m[1]), Number(m[3])) : null;
}

/** A compound from a total in the small unit (`1250 ml` in ℓ and ml → 1 ℓ 250 ml). */
export function fromSmall(total: number, pair: CompoundPair): Compound {
  const { big, small, factor } = PAIR[pair];
  return { big, small, total, bigPart: Math.floor(total / factor), smallPart: total % factor };
}

/** The compound's pair. */
export const compoundPair = (c: Compound): CompoundPair => pairOf(c.big, c.small)!;

/** The compound as one measure in its small unit (`2 m 35 cm` → 235 cm). */
export const toSmall = (c: Compound): Measure => ({ value: { units: c.total * 1_000_000, dp: 0 }, unit: c.small });

/** The data string: `"2 m 35 cm"`, `"1 l 250 ml"` (a small part of 0 is left out: `"3 kg"`). */
export const formatCompound = (c: Compound): string => `${c.bigPart} ${c.big}${c.smallPart ? ` ${c.smallPart} ${c.small}` : ''}`;

/** As shown, in both languages with the symbols (`l` is shown ℓ): `2 m 35 cm`, `1 ℓ 250 ml`. */
export function compoundText(c: Compound, locale: 'en' | 'zh' = 'en'): string {
  const big = `${c.bigPart} ${unitText(c.big, locale)}`;
  return c.smallPart ? `${big} ${c.smallPart} ${unitText(c.small, locale)}` : big;
}

/** Read aloud: "2 metres 35 centimetres" /「2 米 35 厘米」(docs/32 §3.1). */
export function compoundWords(c: Compound, locale: 'en' | 'zh'): string {
  const part = (n: number, u: Unit) => (locale === 'zh' ? `${n} ${unitWords(u, 'zh')}` : `${n} ${unitWords(u, 'en', n === 1 ? 1 : 2)}`);
  return c.smallPart ? `${part(c.bigPart, c.big)} ${part(c.smallPart, c.small)}` : part(c.bigPart, c.big);
}

/** What a measure measures: length, mass or volume of liquid (the area units and the grid's `unit` are not quantities here). */
export type Family = 'length' | 'mass' | 'volume';
/** Each unit's family and its size in the family's smallest unit (cm, g, ml). */
const IN_BASE: Partial<Record<Unit, { family: Family; base: number }>> = {
  km: { family: 'length', base: 100_000 },
  m: { family: 'length', base: 100 },
  cm: { family: 'length', base: 1 },
  kg: { family: 'mass', base: 1000 },
  g: { family: 'mass', base: 1 },
  l: { family: 'volume', base: 1000 },
  ml: { family: 'volume', base: 1 },
};
export const familyOf = (u: Unit): Family | null => IN_BASE[u]?.family ?? null;
/** The units of a family, smallest first. */
export const FAMILY_UNITS: Record<Family, Unit[]> = { length: ['cm', 'm', 'km'], mass: ['g', 'kg'], volume: ['ml', 'l'] };
/** How many of the family's smallest unit one `u` is (km → 100 000 cm). */
export const baseOf = (u: Unit): number => IN_BASE[u]?.base ?? 1;

/** A measure in one unit (`"900 g"`, `"1.4 kg"`), tagged. */
export interface MeasValue extends Measure {
  kind: 'meas';
}
/** A measure in two units (`"1 m 5 cm"`), tagged. */
export interface CmpValue extends Compound {
  kind: 'cmp';
}
/** A quantity compared, ordered, chosen or written: one unit or two. */
export type QtyValue = MeasValue | CmpValue;

const QTY_RE = new RegExp(`^\\s*\\d{1,5}(?:\\.\\d{1,6})?\\s+${UNIT_TEXT}\\s*$`);

/**
 * A quantity as the data writes it, always with a space before the unit (`"350 g"`, `"1.4 kg"`,
 * `"2 m 35 cm"`, `"1 l 250 ml"`); `"50m"` stays a duration. `null` for anything else.
 */
export function parseQuantity(text: string): QtyValue | null {
  if (QTY_RE.test(text)) {
    const m = parseMeasure(text);
    if (m && familyOf(m.unit)) return { kind: 'meas', ...m };
  }
  if (/\d\s+\D+\s+\d/.test(text)) {
    const c = parseCompound(text);
    if (c) return { kind: 'cmp', ...c };
  }
  return null;
}

export const isQty = (v: unknown): v is QtyValue => !!v && typeof v === 'object' && ((v as { kind?: unknown }).kind === 'meas' || (v as { kind?: unknown }).kind === 'cmp');

/** The quantity's unit family. */
export const qtyFamily = (q: QtyValue): Family => familyOf(q.kind === 'cmp' ? q.small : q.unit)!;

/** The quantity in its family's smallest unit (an exact decimal: 1.4 kg → 1400 g, 2 m 5 cm → 205 cm). */
export function qtyBase(q: QtyValue): Decimal {
  if (q.kind === 'cmp') return { units: q.total * baseOf(q.small) * 1_000_000, dp: 0 };
  return { units: q.value.units * baseOf(q.unit), dp: 0 };
}

/** The quantity in a unit of its family (`null`: another family, or not a whole number of millionths). */
export function qtyIn(q: QtyValue, u: Unit): Decimal | null {
  if (familyOf(u) !== qtyFamily(q)) return null;
  const b = qtyBase(q).units;
  const per = baseOf(u);
  return b % per === 0 ? { units: b / per, dp: 0 } : null;
}

/** Compare two quantities of one family by value (`null`: different families). */
export function compareQty(a: QtyValue, b: QtyValue): -1 | 0 | 1 | null {
  if (qtyFamily(a) !== qtyFamily(b)) return null;
  const x = qtyBase(a).units;
  const y = qtyBase(b).units;
  return x < y ? -1 : x > y ? 1 : 0;
}

/** The number printed first (`900` of 900 g, `1` of 1 m 5 cm): what a child compares who ignores the units. */
export const printedNumber = (q: QtyValue): Decimal => (q.kind === 'cmp' ? { units: q.bigPart * 1_000_000, dp: 0 } : q.value);

/** The data string: `"900 g"`, `"1 m 5 cm"`. */
export const formatQty = (q: QtyValue): string => (q.kind === 'cmp' ? formatCompound(q) : formatMeasure(q));
/** As rich text (`{u:900 g}`), shown and read by `src/lib/rich-text.ts`. */
export const qtyToken = (q: QtyValue): string => `{u:${formatQty(q)}}`;
/** As shown: `900 g`, `1 m 5 cm`, `1 ℓ 250 ml`. */
export const qtyText = (q: QtyValue, locale: 'en' | 'zh' = 'en'): string => (q.kind === 'cmp' ? compoundText(q, locale) : measureText(q, locale));
/** The measure in its family's smallest unit, as a token (`{u:1000 g}`): "change to the same unit". */
export function baseToken(q: QtyValue): string {
  const unit = FAMILY_UNITS[qtyFamily(q)][0]!;
  return `{u:${formatDecimal(qtyBase(q))} ${unit}}`;
}

/* ------------------------------------------------------------------ */
/* Answers                                                             */
/* ------------------------------------------------------------------ */

/** A decimal written with a point (`"0.35"`, `"3.0"`). */
export interface DecValue extends Decimal {
  kind: 'dec';
}

/** The value an `input` answer holds: a fraction or whole number, or a tagged value (a quantity: docs/32 §3.1). */
export type AnswerValue = Frac | RemValue | ClockValue | DurValue | DecValue | QtyValue;
export type TaggedValue = RemValue | ClockValue | DurValue | DecValue | QtyValue;

/** A decimal answer (or a whole number, as a decimal with no places); `null` for a fraction, a time … */
export function decimalOf(v: AnswerValue): Decimal | null {
  if (isFracValue(v)) return v.d === 1 && !v.w ? { units: v.n * 1_000_000, dp: 0 } : null;
  return v.kind === 'dec' ? { units: v.units, dp: v.dp } : null;
}

export const isTagged = (v: AnswerValue): v is TaggedValue => 'kind' in v;
export const isFracValue = (v: AnswerValue): v is Frac => !('kind' in v);

/**
 * An answer as the data writes it: `56` · `"56"` · `"3/4"` (a fraction, parsed
 * by the caller) · `"3 r 2"` · `"09:40"` · `"1h35m"` · `"0.35"` · a quantity `"350 g"`, `"1 l 250 ml"`. Returns the tagged value,
 * or `null` for text that is not one (a fraction or a whole number then).
 */
export function parseTagged(text: string): TaggedValue | null {
  const qty = parseQuantity(text);
  if (qty) return qty;
  if (hasPoint(text)) return { kind: 'dec', ...parseDecimal(text)! };
  const rem = parseRemainder(text);
  if (rem) return rem;
  const clock = parseClock(text);
  if (clock !== null) return { kind: 'clock', t: clock };
  return parseDuration(text);
}

/** The data string of an answer (tests, check-pool messages). */
export function formatAnswer(v: AnswerValue): string {
  if (!isTagged(v)) return v.d === 1 && !v.w ? String(v.n) : `${v.w ? `${v.w} ` : ''}${v.n}/${v.d}`;
  if (v.kind === 'rem') return formatRemainder(v);
  if (v.kind === 'clock') return formatClock(v.t);
  if (v.kind === 'dec') return formatDecimal(v);
  if (v.kind === 'meas' || v.kind === 'cmp') return formatQty(v);
  return formatDuration(v.t, v.units);
}
