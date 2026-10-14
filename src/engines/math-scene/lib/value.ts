/**
 * Values with a unit (docs/19 §3.0 G1, docs/21 §3): a measure is a whole
 * number and a unit — a length (`unit`, `cm`, `m`) or an area (`unit2`,
 * `cm2`, `m2`). Data writes them as `"28 cm2"`, `"14 cm"`, `"12 unit2"`; the
 * page shows `28 cm²`, `14 cm`, `12 square units`. Pure: no DOM, no zod.
 */

export const LENGTH_UNITS = ['unit', 'cm', 'm'] as const;
export const AREA_UNITS = ['unit2', 'cm2', 'm2'] as const;
export const UNITS = [...LENGTH_UNITS, ...AREA_UNITS] as const;
export type LengthUnit = (typeof LENGTH_UNITS)[number];
export type AreaUnit = (typeof AREA_UNITS)[number];
export type Unit = (typeof UNITS)[number];

export interface Measure {
  value: number;
  unit: Unit;
}

/** Largest whole number an answer box takes (docs/19 G1). */
export const WHOLE_MAX = 99_999;

export const isUnit = (u: unknown): u is Unit => typeof u === 'string' && (UNITS as readonly string[]).includes(u);
export const isAreaUnit = (u: Unit): u is AreaUnit => (AREA_UNITS as readonly string[]).includes(u);

/** The area unit of a length unit (`cm` → `cm2`) and back. */
export const squared = (u: LengthUnit): AreaUnit => `${u}2` as AreaUnit;
export const lengthOf = (u: Unit): LengthUnit => (isAreaUnit(u) ? (u.slice(0, -1) as LengthUnit) : u);

const MEASURE_RE = /^\s*(\d{1,5})\s*(cm2|cm²|m2|m²|cm|m|unit2|units?|square units?)\s*$/;

/** `"28 cm2"` → `{ value: 28, unit: 'cm2' }`; `null` when it is not a whole number with a unit. */
export function parseMeasure(text: string): Measure | null {
  const m = MEASURE_RE.exec(text);
  if (!m) return null;
  const raw = m[2]!;
  const unit: Unit = raw.startsWith('square') || raw === 'unit2' ? 'unit2' : raw.startsWith('unit') ? 'unit' : (raw.replace('²', '2') as Unit);
  return { value: Number(m[1]), unit };
}

/** The data string: `"28 cm2"`. */
export const formatMeasure = (m: Measure): string => `${m.value} ${m.unit}`;

const SHOWN: Record<Unit, { en: [string, string]; zh: string }> = {
  unit: { en: ['unit', 'units'], zh: '单位' },
  cm: { en: ['cm', 'cm'], zh: 'cm' },
  m: { en: ['m', 'm'], zh: 'm' },
  unit2: { en: ['square unit', 'square units'], zh: '平方单位' },
  cm2: { en: ['cm²', 'cm²'], zh: 'cm²' },
  m2: { en: ['m²', 'm²'], zh: 'm²' },
};

/** The unit as printed: `cm²`, `square units` (en plural by the count). */
export function unitText(u: Unit, locale: 'en' | 'zh', count = 2): string {
  return locale === 'zh' ? SHOWN[u].zh : SHOWN[u].en[count === 1 ? 0 : 1];
}

/** `28 cm²`, `14 units`, `12 平方单位`. */
export function measureText(m: Measure, locale: 'en' | 'zh'): string {
  return `${m.value} ${unitText(m.unit, locale, m.value)}`;
}

const SPOKEN: Record<Unit, { en: [string, string]; zh: string }> = {
  unit: { en: ['unit', 'units'], zh: '单位' },
  cm: { en: ['centimetre', 'centimetres'], zh: '厘米' },
  m: { en: ['metre', 'metres'], zh: '米' },
  unit2: { en: ['square unit', 'square units'], zh: '平方单位' },
  cm2: { en: ['square centimetre', 'square centimetres'], zh: '平方厘米' },
  m2: { en: ['square metre', 'square metres'], zh: '平方米' },
};

/** The unit read aloud: "square centimetres" /「平方厘米」. */
export function unitWords(u: Unit, locale: 'en' | 'zh', count = 2): string {
  return locale === 'zh' ? SPOKEN[u].zh : SPOKEN[u].en[count === 1 ? 0 : 1];
}
