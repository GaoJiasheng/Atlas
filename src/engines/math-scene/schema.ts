/**
 * MathScene data (docs/15 §4.2, §10): `data/lesson.json` — the syllabus lines
 * the lesson follows, the steps (one per chapter: explanation beats, a pool of
 * check tasks of which one is drawn per visit, key facts) and the practice
 * questions — plus the shared `sources.json` / `glossary.json`.
 *
 * Fractions are strings in the data (`"3/4"`, `"1 3/4"`, `"2"`) and parse into
 * `Frac` objects here, so `data.json` and the client get structured values;
 * so do the other values (docs/19 §3.0 G1, `lib/value.ts`): whole numbers
 * (`56`), remainders (`"3 r 2"`), times of day (`"09:40"`) and durations
 * (`"1h35m"`); so do decimals (`"0.35"`, docs/29 §3.1 X1: exact, never a
 * JSON number). Build time only (zod): client code imports types from this
 * file, never values.
 */
import { z } from 'zod';
import { bilingual, kebabId, theme } from '../../content/schema/common';
import { sourcesFile } from '../../content/schema/sources';
import { glossaryFile } from '../../content/schema/glossary';
import { parseFrac, type Frac } from './lib/fraction';
import { ANSWER_UNITS, CLOCK12_NOTATIONS, CLOCK24_NOTATIONS, COMPOUND_PAIRS, DAY, DEFAULT_NOTATION, parseClock, parseDuration, parseQuantity, parseTagged, parseWhole, UNITS, WHOLE_MAX, type AnswerValue, type DecValue, type DurValue, type QtyValue } from './lib/value';
import { DECIMAL_MAX_WHOLE, fromWhole, parseDecimal, wholePart, type Decimal } from './lib/decimal';

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

/** Fractions (docs/15 §2.2). `not-simplest` is the "one step short" case, not an error. */
export const FRACTION_CODES = [
  'unequal-parts',
  'equal-area-not-same-shape',
  'part-part',
  'swapped',
  'bigger-denominator-bigger',
  'different-wholes',
  'gap-thinking',
  'compare-numerators-only',
  'added-denominators',
  'not-converted',
  'additive-equivalence',
  'scaled-one-part',
  'not-simplest',
  'tick-counting',
  'whole-changed',
] as const;
/** Area and perimeter on the square grid (docs/21 §2.1; rules in lib/diagnose/measure.ts). */
export const MEASURE_CODES = [
  'unequal-units',
  'half-squares',
  'unit-not-squared',
  'area-perimeter-swap',
  'border-squares',
  'two-sides-only',
  'sides-added-for-area',
  'missing-side',
  'same-area-same-perimeter',
  'perimeter-not-halved',
  'side-from-total',
  'overlap-counted',
  'inner-edge-counted',
] as const;
/** Whole-number multiplication and division (docs/19 §2.1; rules in lib/diagnose/whole-ops.ts). */
export const WHOLE_OPS_CODES = [
  'unequal-groups',
  'added-not-multiplied',
  'groups-size-swapped',
  'skip-count-slip',
  'split-slip',
  'sharing-only',
  'divide-order',
  'operation-swapped',
  'remainder-too-big',
  'remainder-dropped',
  'remainder-context',
  'tens-as-ones',
  'extra-zero',
  'carry-not-added',
  'digits-concatenated',
  'partial-product-missed',
  'zero-in-quotient',
  'not-traded',
] as const;
/** Telling time and durations (docs/20 §2.1; rules in lib/diagnose/time.ts). */
export const TIME_CODES = [
  'hands-swapped',
  'next-hour',
  'hour-hand-on-numeral',
  'numeral-as-minutes',
  'five-count-slip',
  'am-pm',
  'noon-midnight',
  'base-100',
  'count-endpoints',
  'wrong-direction',
  '24h-offset',
] as const;
/** Decimals (docs/29 §2.1; rules in lib/diagnose/decimals.ts). `places-short` is the "one step short" case, like `not-simplest`. */
export const DECIMAL_CODES = [
  'longer-is-larger',
  'shorter-is-larger',
  'trailing-zero-changes',
  'point-separator',
  'zero-placeholder',
  'place-order',
  'fraction-as-digits',
  'place-denominator',
  'interval-misread',
  'round-truncated',
  'round-carry-slip',
  'places-short',
  'round-wrong-place',
  'round-chain',
  'round-half-down',
  'aligned-right',
  'smaller-from-larger',
  'empty-place-brought-down',
  'point-misplaced',
  'remainder-as-decimal',
  'shift-wrong-way',
  'shift-count-wrong',
  'zero-appended',
  'decimal-as-subunit',
  'unit-factor-wrong',
] as const;
/**
 * Codes registered in another domain that decimals use too (docs/29 D10): the same misconception, with a rule of
 * its own in lib/diagnose/decimals.ts. A code's rules are the union over the domains that list it; a task is
 * diagnosed by its own domain's rules.
 */
export const DECIMAL_SHARED_CODES = ['tick-counting', 'carry-not-added', 'zero-in-quotient', 'not-simplest'] as const;
/** Reading instruments and quantities in units (docs/32 §2.1; rules in lib/diagnose/measure-reading.ts). The grid's area and perimeter keep `measure`. */
export const MEASURE_READING_CODES = [
  'read-end-mark',
  'not-nearest',
  'wrong-unit',
  'unreasonable-estimate',
  'ignored-unit',
  'size-is-mass',
  'taller-holds-more',
  'balance-misread',
  'compound-concatenated',
  'compound-place',
  'compound-split-wrong',
] as const;
/** Codes registered elsewhere that reading instruments uses too (docs/32 D13), each with a rule of its own in lib/diagnose/measure-reading.ts. */
export const MEASURE_READING_SHARED_CODES = ['tick-counting', 'interval-misread', 'unit-factor-wrong', 'decimal-as-subunit'] as const;
/** The domains, each with the codes its tasks may use (a task's codes come from one domain, validate). */
export const MISCONCEPTION_DOMAINS = {
  fractions: FRACTION_CODES,
  measure: MEASURE_CODES,
  'whole-ops': WHOLE_OPS_CODES,
  time: TIME_CODES,
  decimals: [...DECIMAL_CODES, ...DECIMAL_SHARED_CODES],
  'measure-reading': [...MEASURE_READING_CODES, ...MEASURE_READING_SHARED_CODES],
} as const;
export type MisconceptionDomain = keyof typeof MISCONCEPTION_DOMAINS;
/** Misconceptions the feedback is designed around, each registered once in its home domain (docs/19 §3.0 G5); one flat list, every code unique. */
export const MISCONCEPTIONS = [...FRACTION_CODES, ...MEASURE_CODES, ...WHOLE_OPS_CODES, ...TIME_CODES, ...DECIMAL_CODES, ...MEASURE_READING_CODES] as const;
export const misconception = z.enum(MISCONCEPTIONS);
export type MisconceptionCode = (typeof MISCONCEPTIONS)[number];

export const TASK_KINDS = [
  'shade',
  'cut',
  'fold',
  'split',
  'merge',
  'place',
  'compare',
  'order',
  'choose',
  'input',
  'build-sum',
  'count-squares',
  'trace-perimeter',
  'draw-rectangle',
  'split-figure',
  'group',
  'arrange',
  'skip-count',
  'split-array',
  'regroup',
  'share',
  'shade-decimal',
  'round-on-line',
  'align-add',
  'shift-digits',
  'read-clock',
  'set-clock',
  'duration',
  'read-scale',
  'set-scale',
  'count-intervals',
] as const;
/** Task kinds on the square grid (docs/21 §3.2). */
export const GRID_KINDS = ['count-squares', 'trace-perimeter', 'draw-rectangle', 'split-figure'] as const;
/** Task kinds on the array and the whole-number line (docs/19 §3.1). */
export const ARRAY_KINDS = ['group', 'arrange', 'skip-count', 'split-array'] as const;
/** Task kinds on the place-value blocks (docs/19 §3.2). */
export const BLOCKS_KINDS = ['regroup', 'share'] as const;
/** Task kinds on the clock face and the timeline (docs/20 §3.4). */
export const TIME_KINDS = ['read-clock', 'set-clock', 'duration'] as const;
/** Task kinds on an instrument (docs/32 §3.4). */
export const MEASURE_KINDS = ['read-scale', 'set-scale', 'count-intervals'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/**
 * Model views a step may switch between (the VIEW group). `clock` and `timeline` are the time lesson's (docs/20 §3, model A3); `decimal-grid`, `place-value` and `money` the decimals' (docs/29 A6; their number line is `numberline`);
 * `instrument` the measuring lesson's and `straight` its dial or jug drawn as the straight number line it is (docs/32 §3.7).
 */
export const MODEL_VIEWS = ['bar', 'circle', 'numberline', 'wall', 'barmodel', 'grid', 'array', 'blocks', 'clock', 'timeline', 'decimal-grid', 'place-value', 'money', 'instrument', 'straight'] as const;
export const modelView = z.enum(MODEL_VIEWS);
export type ModelView = (typeof MODEL_VIEWS)[number];

/** `"3/4"`, `"1 3/4"`, `"2"` → `Frac`. */
export const frac = z.string().transform((text, ctx): Frac => {
  const f = parseFrac(text);
  if (!f) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a fraction (write "3/4", "1 3/4" or "2")` });
    return z.NEVER;
  }
  return f;
});

/** A whole number 0–99 999: `56` or `"56"`. */
export const whole = z.union([z.number(), z.string()]).transform((v, ctx): number => {
  const n = parseWhole(v);
  if (n === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${v}" is not a whole number (0–${WHOLE_MAX})` });
    return z.NEVER;
  }
  return n;
});

/** `"09:40"`, `"15:05:30"` (24-hour time) → seconds since midnight. */
export const clockTime = z.string().transform((text, ctx): number => {
  const t = parseClock(text);
  if (t === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a time of day (write 24-hour time: "09:40", "15:05:30")` });
    return z.NEVER;
  }
  return t;
});

/** `"1h35m"`, `"95m"`, `"75s"` → seconds and the units written. */
export const duration = z.string().transform((text, ctx): DurValue => {
  const d = parseDuration(text);
  if (!d) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a duration (write "1h35m", "95m", "75s")` });
    return z.NEVER;
  }
  return d;
});

const NOT_A_NUMBER = 'write decimals as strings, e.g. "0.5"';

/** A decimal 0–99 999.999999 written as a string (`"0.50"`, `"3"`); a whole JSON number is taken as it is, a JSON number with a point is refused (docs/29 §3.1). */
export const decimal = z.union([z.number(), z.string()]).transform((v, ctx): Decimal => {
  if (typeof v === 'number') {
    if (Number.isInteger(v) && v >= 0 && v <= DECIMAL_MAX_WHOLE) return fromWhole(v);
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: Number.isInteger(v) ? `${v} is out of range (0–${DECIMAL_MAX_WHOLE})` : NOT_A_NUMBER });
    return z.NEVER;
  }
  const d = parseDecimal(v);
  if (!d || wholePart(d) > DECIMAL_MAX_WHOLE) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${v}" is not a decimal (write "0.35", "2.5", "3")` });
    return z.NEVER;
  }
  return d;
});

/** A quantity with a space before its unit (`"900 g"`, `"1 m 5 cm"`, docs/32 §3.1). */
export const quantity = z.string().transform((text, ctx): QtyValue => {
  const q = parseQuantity(text);
  if (q) return q;
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a quantity (write "900 g", "1.4 kg", "2 m 35 cm", "1 l 250 ml": a space before each unit, the small part under one big unit)` });
  return z.NEVER;
});

/** A fraction (`"3/4"`, `"2"`) or a decimal with a point (`"0.35"`): what place takes, and a fraction or decimal worked on. */
export const numValue = z.string().transform((text, ctx): Frac | DecValue => {
  const f = parseFrac(text);
  if (f) return f;
  const d = /\./.test(text) ? parseDecimal(text) : null;
  if (d) return { kind: 'dec', ...d };
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a fraction ("3/4", "1 3/4", "2") or a decimal ("0.35")` });
  return z.NEVER;
});

/** A fraction, a decimal or a quantity (`"900 g"`, `"1 m 5 cm"`, docs/32 §3.4): what compare, order and choose take. */
export const numOrQty = z.string().transform((text, ctx): Frac | DecValue | QtyValue => {
  const q = parseQuantity(text);
  if (q) return q;
  const f = parseFrac(text);
  if (f) return f;
  const d = /\./.test(text) ? parseDecimal(text) : null;
  if (d) return { kind: 'dec', ...d };
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a fraction ("3/4", "1 3/4", "2"), a decimal ("0.35") or a quantity ("900 g")` });
  return z.NEVER;
});

/** A whole number (`26`) or a decimal (`"2.35"`, tagged): the value shared or regrouped on blocks or on the place-value chart. */
const wholeOrDecimal = z.union([z.number(), z.string()]).transform((v, ctx): number | DecValue => {
  if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 999) return v;
  if (typeof v === 'string' && /\./.test(v)) {
    const d = parseDecimal(v);
    if (d) return { kind: 'dec', ...d };
  }
  if (typeof v === 'string' && /^\d{1,3}$/.test(v)) return Number(v);
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: typeof v === 'number' && !Number.isInteger(v) ? NOT_A_NUMBER : `"${v}" is not a whole number 0–999 or a decimal ("2.35")` });
  return z.NEVER;
});

/** A point on a timeline: a time of day (`"09:40"`, `"24:00"` = the end of the day) or, on a duration scale, a duration (`"95m"`) → seconds. */
export const timePoint = z.string().transform((text, ctx): number => {
  if (/^\s*24:00\s*$/.test(text)) return DAY;
  const t = parseClock(text) ?? parseDuration(text)?.t ?? null;
  if (t === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${text}" is not a time ("09:40", "24:00") or a duration ("95m")` });
    return z.NEVER;
  }
  return t;
});

/** An answer: a fraction or whole number (`"3/4"`, `"2"`, `56`), a remainder (`"3 r 2"`), a time of day (`"09:40"`), a duration (`"1h35m"`) or a decimal (`"0.35"`). */
export const answerValue = z.union([z.number(), z.string()]).transform((v, ctx): AnswerValue => {
  if (typeof v === 'number') {
    const n = parseWhole(v);
    if (n !== null) return { n, d: 1 };
    if (!Number.isInteger(v)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: NOT_A_NUMBER });
      return z.NEVER;
    }
  } else {
    const f = parseFrac(v);
    if (f) return f;
    const tagged = parseTagged(v);
    if (tagged) return tagged;
  }
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${v}" is not an answer (a fraction "3/4", a whole number 56, "3 r 2", "09:40", "1h35m", a decimal "0.35" or a quantity "350 g", "1 l 250 ml")` });
  return z.NEVER;
});

/** Parts by count (the first n from the left) or by index. */
const partSet = z.union([z.number().int().nonnegative(), z.array(z.number().int().nonnegative())]);

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

const barRow = z
  .object({
    /** Equal parts per whole; `null` = not cut yet (cut task). */
    parts: z.number().int().min(1).max(24).nullable().default(null),
    /** Unequal cut positions as fractions of the length, e.g. `[0.3, 0.55]` (overrides equal parts; pictures only). */
    cuts: z.array(z.number().gt(0).lt(1)).optional(),
    /** A square cut corner to corner into two halves (the "same amount, different shape" picture). */
    diagonal: z.boolean().optional(),
    shaded: partSet.optional(),
    given: partSet.optional(),
    /** Whole bars side by side (2–3: more than one whole). */
    wholes: z.number().int().min(1).max(3).optional(),
    /** Length relative to the whole (default 1; a shorter bar = a smaller whole). */
    length: z.number().min(0.2).max(1).optional(),
    object: z.enum(['strip', 'toast', 'kueh', 'chocolate', 'ribbon', 'bottle', 'cake']).optional(),
    label: bilingual.optional(),
  })
  .strict();

const barModel = barRow.extend({ kind: z.literal('bar'), rows: z.array(barRow).min(2).max(4).optional() }).strict();
const circleModel = z
  .object({
    kind: z.literal('circle'),
    parts: z.number().int().min(1).max(12),
    shaded: partSet.optional(),
    given: partSet.optional(),
    object: z.enum(['plain', 'prata', 'cake']).optional(),
    label: bilingual.optional(),
  })
  .strict();
const numberLineModel = z
  .object({
    kind: z.literal('numberline'),
    /** `fraction` (default): wholes cut in `intervals` · `whole`: a whole-number line from `from` to `to` (≤ 10 000) in steps of `step` (docs/19 §3.1; docs/32 §3.7 widened it for a scale straightened). */
    scale: z.enum(['fraction', 'whole']).default('fraction'),
    from: z.number().int().min(0).default(0),
    /** Fraction line: 1–3 wholes · whole-number line: up to 10 000 (validate). */
    to: z.number().int().min(1).max(10_000).default(1),
    /** Fraction line: intervals per whole (required there, validate). */
    intervals: z.number().int().min(1).max(12).optional(),
    /** Whole-number line: the tick spacing (any whole number; at most 100 ticks, validate). */
    step: z.number().int().min(1).max(10_000).optional(),
    /** Whole-number line: a longer, numbered tick every so many (default every ten and the ends). */
    major: z.number().int().min(1).max(10_000).optional(),
    /** Fraction line: `ends` `wholes` `all` `none` · whole-number line: `ends` `tens` (or `wholes`: every ten and the ends) `steps` `all` `none`. */
    labels: z.enum(['ends', 'wholes', 'all', 'none', 'tens', 'steps']).default('wholes'),
    marks: z.array(frac).optional(),
    /** A pointer above the line at this value (read-the-line tasks). */
    arrow: frac.optional(),
    /** A strip the length of one whole, drawn above and aligned with the line. */
    withBar: z.boolean().optional(),
    /** Whole-number line: `count` arcs of `size` from `from` (default the line's start), "+5" on each, a ring where each lands. */
    jumps: z.object({ size: z.number().int().min(1).max(50), count: z.number().int().min(1).max(20), from: z.number().int().min(0).optional() }).strict().optional(),
    /** Whole-number line: the jumps numbered 1, 2, 3 … under the arcs (count the jumps, not the marks). */
    counter: z.boolean().optional(),
  })
  .strict();
const wallModel = z.object({ kind: z.literal('wall'), rows: z.array(z.number().int().min(1).max(12)).min(2).max(8) }).strict();
const barSegment = z
  .object({
    value: frac,
    tone: z.enum(['cold', 'hot', 'signal', 'ink']),
    label: bilingual.optional(),
    /** Drawn with "?" instead of its value. */
    unknown: z.boolean().optional(),
  })
  .strict();
const barModelDiagram = z
  .object({
    kind: z.literal('barmodel'),
    type: z.enum(['part-whole', 'comparison']),
    bars: z
      .array(
        z
          .object({
            id: kebabId,
            label: bilingual,
            length: frac,
            segments: z.array(barSegment).min(1),
          })
          .strict(),
      )
      .min(1)
      .max(2),
    brace: z.object({ bar: kebabId, from: frac, to: frac, label: bilingual }).strict().optional(),
    /** Unit parts the reader may show on every bar ("Split into tenths"). */
    units: z.number().int().min(2).max(12).optional(),
  })
  .strict();

/* The array: equal groups and rows (docs/19 §3.1, model A1) */
export const ARRAY_OBJECTS = ['dot', 'kueh', 'curry-puff', 'egg', 'chopsticks', 'seat', 'orange', 'pencil', 'sticker'] as const;
export const CONTAINERS = ['ring', 'plate', 'box', 'bag', 'car'] as const;
const markTone = z.enum(['cold', 'hot', 'signal', 'ink']);
const count = (max: number) => z.number().int().min(0).max(max);
const arrayLayout = z.object({
  object: z.enum(ARRAY_OBJECTS).default('dot'),
  /** `scatter`: `count` loose on a tray · `groups`: `groups` containers of `size` (or `sizes`) · `rows`: `rows` × `cols` in rows. */
  layout: z.enum(['scatter', 'groups', 'rows']).optional(),
  count: count(60).optional(),
  groups: z.number().int().min(1).max(12).optional(),
  size: count(12).optional(),
  /** Groups of different sizes (`[2, 5, 5]`: not equal groups). */
  sizes: z.array(count(12)).min(1).max(12).optional(),
  /** Left over outside the groups (or past the last full column of rows). */
  extra: count(20).optional(),
  /** Cars: seats taken in each car (`[4, 4, 4, 2]`). */
  filled: z.array(count(4)).min(1).max(12).optional(),
  container: z.enum(CONTAINERS).default('ring'),
  /** Scatter: empty containers beside the tray (to deal into: `count` of them; to pack in: their `size`). */
  containers: z.object({ kind: z.enum(CONTAINERS), count: z.number().int().min(1).max(12).optional(), size: z.number().int().min(1).max(12).optional() }).strict().optional(),
  rows: z.number().int().min(1).max(14).optional(),
  cols: z.number().int().min(1).max(14).optional(),
  /** Count braces: read by rows (true: "3 rows" left and "4 in each row" on top; "rows": the left one only), by columns ("cols": "4 columns" on top, "3 in each column" left), or the groups' (any). */
  braces: z.union([z.boolean(), z.enum(['rows', 'cols'])]).optional(),
  /** A cut after row k (or column k), the parts drawn a little apart, each with its own count. */
  split: z.object({ rows: z.array(z.number().int().min(1)).length(1).optional(), cols: z.array(z.number().int().min(1)).length(1).optional() }).strict().optional(),
  /** Tone of each part of a split (default cold, hot) or of each group (default cold). */
  tones: z.array(markTone).min(1).max(12).optional(),
  /** A paper strip over one count: the number of rows (or columns) is the question. */
  cover: z.object({ rows: z.literal(true).optional(), cols: z.literal(true).optional() }).strict().optional(),
  /** Taken away (ink slash): rows, columns or groups by index (0-based). */
  crossed: z.object({ rows: z.array(count(13)).optional(), cols: z.array(count(13)).optional(), groups: z.array(count(11)).optional() }).strict().optional(),
  /** The left-over ones circled in a dashed container (they would fill one more group). */
  another: z.boolean().optional(),
  label: bilingual.optional(),
});
const arrayModel = arrayLayout
  .extend({
    kind: z.literal('array'),
    /** Two layouts side by side, each with its label (two ways to divide). */
    pair: z.array(arrayLayout.strict()).length(2).optional(),
  })
  .strict();
export type ArrayLayoutSpec = z.output<typeof arrayLayout>;

/* Place-value blocks (docs/19 §3.2, model A2): hundreds, tens and ones on a mat */
export const PLACES = ['H', 'T', 'O'] as const;
export type PlaceKey = (typeof PLACES)[number];
export const TRADES = ['O>T', 'T>H', 'T>O', 'H>T'] as const;
export type Trade = (typeof TRADES)[number];
const placeCounts = z.object({ H: count(30).optional(), T: count(40).optional(), O: count(40).optional() }).strict();
export const COLUMN_SHOWS = ['none', 'ones', 'carry', 'tens', 'hundreds', 'all'] as const;
const columnWorking = z
  .object({
    op: z.enum(['×', '÷']),
    a: z.number().int().min(0).max(9999),
    b: z.number().int().min(1).max(99),
    /** What is written so far: × from the ones up (ones · carry · tens · hundreds · all), ÷ from the top place down (hundreds · tens · ones · all). */
    show: z.enum(COLUMN_SHOWS).default('all'),
  })
  .strict();
const blocksModel = z
  .object({
    kind: z.literal('blocks'),
    /** The number the blocks make (drawn in its standard form unless `left` says otherwise). */
    value: z.number().int().min(0).max(999).optional(),
    /** Blocks on the mat by place (still to share; or not in standard form: 18 ones). */
    left: placeCounts.optional(),
    /** × : the value drawn in `copies` equal rows (×1, ×2 …). */
    copies: z.number().int().min(1).max(9).optional(),
    /** The rows pushed together: each place's blocks in one column. */
    combined: z.boolean().optional(),
    /** ÷ : the plates shared into (each with H · T · O). */
    plates: z.number().int().min(2).max(9).optional(),
    /** Blocks on each plate. */
    dealt: placeCounts.optional(),
    /** The trade this beat shows: lit before it happens; with `move: trade`, the blocks after it, the trade animated. */
    trade: z.enum(TRADES).optional(),
    /** The place being worked on: its column on the mat and its digit in the column working light up. */
    focus: z.enum(PLACES).optional(),
    /** The written column method beside the mat. */
    column: columnWorking.optional(),
    /** The H · T · O mat (default on). */
    mat: z.boolean().default(true),
    label: bilingual.optional(),
  })
  .strict();
export type BlocksModelSpec = z.output<typeof blocksModel>;
export type ColumnSpec = z.output<typeof columnWorking>;
export type PlaceCounts = z.output<typeof placeCounts>;

/* The square grid (docs/21 §3.1, model A4): grid points with y up, cell (x, y) = [x, x+1] × [y, y+1]. */
const coord = z.number().int().min(0).max(99);
const point = z.tuple([coord, coord]);
const rect4 = z.tuple([coord, coord, z.number().int().min(1).max(99), z.number().int().min(1).max(99)]);
const gridFigure = z
  .object({
    id: kebabId,
    /** `[x, y, w, h]`: a rectangle of w × h cells with its bottom-left corner at (x, y). */
    rect: rect4.optional(),
    /** Rectangles put together (a composite figure; the joins are drawn as dashed seams). */
    rects: z.array(rect4).min(2).max(4).optional(),
    cells: z.array(point).min(1).optional(),
    /** Corners of a rectilinear figure, in order (sides across or up only). */
    poly: z.array(point).min(4).max(16).optional(),
    /** Half cells: `[x, y, corner]`, the triangle with its square corner at that corner of cell (x, y). */
    halves: z.array(z.tuple([coord, coord, z.enum(['ne', 'nw', 'se', 'sw'])])).optional(),
    /** `cold` = given (default), `hot` = a second figure to compare, `ghost` = a dashed outline (the box round it, a size tried). */
    tone: z.enum(['cold', 'hot', 'ghost']).default('cold'),
  })
  .strict()
  .refine((f) => [f.rect, f.rects, f.cells, f.poly].filter(Boolean).length === 1, { message: 'a figure needs exactly one of rect, rects, cells or poly' });
const gridDim = z
  .object({
    /** A whole side of a figure's box … */
    side: z.enum(['top', 'bottom', 'left', 'right']).optional(),
    figure: kebabId.optional(),
    /** … or any straight side, by its ends. */
    from: point.optional(),
    to: point.optional(),
    /** Labelled "?" (the length is the question). */
    unknown: z.boolean().optional(),
    /** Light the side and its dimension line (a pair of opposite sides, the side just found). */
    tone: z.enum(['cold', 'hot', 'signal']).optional(),
  })
  .strict()
  .refine((d) => !!d.side !== !!(d.from && d.to), { message: 'a dimension needs a side, or from and to' });
const tileSpec = z.union([
  z.number().int().min(0),
  z.literal('all'),
  z.object({ rows: z.number().int().min(1).optional(), count: z.number().int().min(1).optional(), size: z.number().int().min(2).max(4).optional() }).strict(),
]);
const gridModel = z
  .object({
    kind: z.literal('grid'),
    /** At least this many cells across and up (default: what the figures cover). */
    cols: z.number().int().min(1).max(60).optional(),
    rows: z.number().int().min(1).max(40).optional(),
    /** One cell is 1 unit, 1 cm or 1 m. */
    unit: z.enum(['unit', 'cm', 'm']).default('unit'),
    /** `cells`: grid lines · `dots`: grid points · `none`: no grid (only the lengths given; not drawn to scale). */
    show: z.enum(['cells', 'dots', 'none']).default('cells'),
    figures: z.array(gridFigure).max(4).default([]),
    /** Unit squares laid on a figure: a count (reading order), `all`, the top rows, or `count` big squares of `size`. */
    tiles: z.record(kebabId, tileSpec).optional(),
    /** Sides walked round a figure from its top-left corner (a count or `all`), with the running count. */
    walk: z.record(kebabId, z.union([z.number().int().min(0), z.literal('all')])).optional(),
    /** The squares along a figure's edge drawn dashed, each corner square's two outside sides marked. */
    border: kebabId.optional(),
    /** Opposite sides lit in pairs: the two lengths cold, the two breadths hot. */
    sides: z.literal('pairs').optional(),
    dims: z.array(gridDim).optional(),
    /** Cuts along grid lines: `{ "x": 5 }` (up and down) or `{ "y": 4 }` (across). */
    cuts: z.array(z.object({ x: coord.optional(), y: coord.optional() }).strict().refine((c) => (c.x === undefined) !== (c.y === undefined), { message: 'a cut is x or y' })).max(2).optional(),
    /** The pieces of a cut drawn a little apart. */
    apart: z.boolean().optional(),
    /** Parts taken away (ink hatch): the missing corner of a box. */
    crossed: z.array(rect4).optional(),
    /** One line under the drawing: what is known. */
    note: bilingual.optional(),
    /** A unit square with its name in the corner (1 cm², 1 m²). */
    legend: z.boolean().optional(),
    /** "Not drawn to scale" in the corner (required with `show: none`). */
    notToScale: z.boolean().optional(),
  })
  .strict();

/* Decimals (docs/29 §3.2–3.5, model A6) */
const decimalTone = z.enum(['cold', 'hot', 'signal']);
/** The places of a decimal place-value chart, highest first: thousands … ones, tenths, hundredths, thousandths. */
export const DPLACES = ['Th', 'H', 'T', 'O', 't', 'h', 'th'] as const;
export type DPlace = (typeof DPLACES)[number];
/** Trades on the chart: 10 of a place for 1 of the next (`h>t`), or 1 for 10 of the one below (`t>h`). */
export const DTRADES = ['th>h', 'h>t', 't>O', 'O>T', 'T>H', 'H>Th', 'Th>H', 'H>T', 'T>O', 'O>t', 't>h', 'h>th'] as const;
export type DTrade = (typeof DTRADES)[number];
const dcounts = z
  .object({ Th: count(99).optional(), H: count(99).optional(), T: count(99).optional(), O: count(99).optional(), t: count(99).optional(), h: count(99).optional(), th: count(99).optional() })
  .strict();
export type DCountsSpec = z.output<typeof dcounts>;
const decimalGridSpec = z.object({
  /** `10`: ten strips · `100`: 10 × 10 squares · `1000`: the hundred grid with a magnifier of ten slivers. */
  level: z.union([z.literal(10), z.literal(100), z.literal(1000)]).default(100),
  /** Wholes side by side (1–3). */
  wholes: z.number().int().min(1).max(3).optional(),
  /** One run in cold (the given amount). */
  given: decimal.optional(),
  /** Runs shaded in turn, each in its tone (given cold, added signal, a second amount hot). */
  runs: z.array(z.object({ value: decimal, tone: decimalTone }).strict()).min(1).max(4).optional(),
  /** Taken away from the end of what is shaded (ink slash). */
  crossed: decimal.optional(),
  /** The magnifier: the square starting at this value cut into ten slivers (the thousandths). */
  zoom: z.object({ at: decimal }).strict().optional(),
  /** Four equal blocks of 25 squares drawn over the grid (the quarters). */
  quarters: z.boolean().optional(),
  /** Under each strip its value (`tenths`), or the squares counted (`hundredths`). */
  labels: z.enum(['none', 'tenths', 'hundredths']).optional(),
  /** Ten of a place lit to be put together: ten strips a whole, ten squares a strip, ten slivers a square. */
  trade: z.enum(['t>O', 'h>t', 'th>h']).optional(),
  /** `ghost`: the whole drawing faint (to compare with); `hot` / `cold`: the given amount's tone (a pair). */
  tone: z.enum(['ghost', 'hot', 'cold']).optional(),
  label: bilingual.optional(),
});
const decimalGridModel = decimalGridSpec
  .extend({
    kind: z.literal('decimal-grid'),
    /** Two grids side by side (compare: the first cold, the second hot). */
    pair: z.array(decimalGridSpec.strict()).length(2).optional(),
  })
  .strict();
export type DecimalGridSpec = z.output<typeof decimalGridSpec>;
export type DecimalGridModelSpec = z.output<typeof decimalGridModel>;
const decimalColumn = z
  .object({
    op: z.enum(['+', '−', '×', '÷']),
    a: decimal,
    /** A decimal (+ −) or a one-digit whole number (× ÷). */
    b: decimal,
    show: z.enum(['none', 'all']).default('all'),
  })
  .strict();
export type DecimalColumnSpec = z.output<typeof decimalColumn>;
const placeValueModel = z
  .object({
    kind: z.literal('place-value'),
    /** A run of places, highest first (default: the value's own, from the ones). */
    columns: z.array(z.enum(DPLACES)).min(1).max(7).optional(),
    value: decimal.optional(),
    /** The digits written in the columns, place-value discs, or both. */
    show: z.enum(['digits', 'discs', 'both']).default('digits'),
    /** The order the discs go into their columns (a place-order beat). */
    fill: z.array(z.enum(DPLACES)).optional(),
    highlight: z.array(z.enum(DPLACES)).optional(),
    /** Two to four numbers, one under the other (compare, the column method), lined up on the point or on the last digit. */
    rows: z.array(decimal).min(2).max(4).optional(),
    align: z.enum(['point', 'right']).default('point'),
    /** The empty places filled with faint zeros (`true`), or the number written longer (`"1.500"`). */
    pad: z.union([z.boolean(), decimal]).optional(),
    /** × : the value in this many equal rows; `combined` pushes them together column by column. */
    copies: z.number().int().min(2).max(9).optional(),
    combined: z.boolean().optional(),
    /** ÷ : the plates shared into, with what each has (`dealt`) and what is still on the chart (`left`). */
    plates: z.number().int().min(2).max(9).optional(),
    dealt: dcounts.optional(),
    left: dcounts.optional(),
    trade: z.enum(DTRADES).optional(),
    /** The digits moved `by` places (× 10ⁿ to the left, ÷ to the right); the point does not move. */
    shift: z.object({ by: z.union([z.literal(1), z.literal(2), z.literal(3)]), dir: z.enum(['left', 'right']).default('left') }).strict().optional(),
    /** Discs printed $1 · 10¢ · 1¢ (money). */
    money: z.boolean().optional(),
    column: decimalColumn.optional(),
    label: bilingual.optional(),
  })
  .strict();
export type PlaceValueSpec = z.output<typeof placeValueModel>;
export const DECIMAL_LINE_UNITS = ['km', 'm', 'cm', 'kg', 'g', 'l', 'ml'] as const;
const decimalLineModel = z
  .object({
    kind: z.literal('numberline'),
    scale: z.literal('decimal'),
    from: decimal,
    to: decimal,
    /** The tick spacing (≤ 20 steps). */
    step: decimal,
    labels: z.enum(['ends', 'wholes', 'all', 'none']).default('ends'),
    marks: z.array(decimal).optional(),
    /** A pointer above the line (read-the-line tasks). */
    arrow: decimal.optional(),
    /** Lines under it, each one step of the line above cut into ten (at most two). */
    zoom: z.array(z.object({ from: decimal, to: decimal }).strict()).min(1).max(2).optional(),
    /** The halfway mark between the ends, dashed. */
    halfway: z.boolean().optional(),
    /** Rounding: the nearer end, bold, with an arrow from the mark to it. */
    nearest: decimal.optional(),
    unit: z.enum(DECIMAL_LINE_UNITS).optional(),
    /** A second scale under the line in a smaller unit (`factor` of them to one). */
    dual: z.object({ unit: z.enum(DECIMAL_LINE_UNITS), factor: z.union([z.literal(10), z.literal(100), z.literal(1000)]) }).strict().optional(),
    label: bilingual.optional(),
  })
  .strict();
export type DecimalLineSpec = z.output<typeof decimalLineModel>;
/** Singapore coins and notes (docs/29 §3.5): plain discs and plain notes, no 1-cent coin. */
export const COINS = ['0.05', '0.1', '0.2', '0.5', '1'] as const;
export const NOTES = ['2', '5', '10', '50'] as const;
export const MONEY_PIECES = [...COINS, ...NOTES] as const;
export type MoneyPiece = (typeof MONEY_PIECES)[number];
const moneyAmount = z.object({ amount: decimal, label: bilingual.optional() }).strict();
const moneyModel = z
  .object({
    kind: z.literal('money'),
    amount: decimal.optional(),
    /** The coins and notes (default: the amount in the fewest pieces). */
    pieces: z.array(z.enum(MONEY_PIECES)).min(1).max(30).optional(),
    /** Loose on a tray, or in columns: dollars · ten cents · cents. */
    layout: z.enum(['tray', 'by-place']).default('tray'),
    /** Ten 10¢ coins lit to make $1. */
    trade: z.literal('t>O').optional(),
    /** A $10 note paid (change). */
    note: z.boolean().optional(),
    pair: z.array(moneyAmount).length(2).optional(),
    label: bilingual.optional(),
  })
  .strict();
export type MoneySpec = z.output<typeof moneyModel>;

/* Instruments (docs/32 §3.2, model A11): a ruler, a tape (a height chart, a metre rule, a path), a dial scale, a measuring jug and a balance; every scale is a number line. */
export const INSTRUMENT_TYPES = ['ruler', 'tape', 'dial', 'jug', 'balance'] as const;
export type InstrumentType = (typeof INSTRUMENT_TYPES)[number];
/** The units an instrument is marked in (values are written in this unit; with `sub`, the small one). */
export const INSTRUMENT_UNITS = ['cm', 'm', 'km', 'g', 'kg', 'ml', 'l'] as const;
export type InstrumentUnit = (typeof INSTRUMENT_UNITS)[number];
/** Things laid along a ruler or a tape (outlines, docs/32 §3.2). */
export const LENGTH_THINGS = ['pencil', 'crayon', 'eraser', 'key', 'ribbon', 'leaf', 'straw', 'string', 'rope', 'book', 'whiteboard', 'corridor', 'door'] as const;
/** Things weighed: on a dial's pan or a balance's (outlines). */
export const LOADS = ['fish', 'prawns', 'kangkong', 'long-beans', 'pineapple', 'papaya', 'watermelon', 'mango', 'guava', 'onion', 'rice', 'flour', 'beans', 'paper-clip', 'beach-ball', 'stone'] as const;
export type LoadKind = (typeof LOADS)[number];
export const LIQUIDS = ['water', 'juice', 'milk'] as const;
export const JUG_SHAPES = ['beaker', 'cup', 'jug', 'pail', 'bottle', 'bowl', 'bottle-jug'] as const;
export const TAPE_LOOKS = ['ruler', 'metre-rule', 'tape', 'height-chart', 'path'] as const;
const mTone = z.enum(['cold', 'hot', 'signal']);
const span = z.object({ from: decimal, to: decimal }).strict();
/**
 * One thing in a balance's pan (docs/32 §3.2; built so the algebra balance, docs/17 A9, can put its own things in):
 * a load with its mass in grams, or a plain weight of so many grams.
 */
const panThing = z
  .object({
    item: z.enum(LOADS).optional(),
    weight: z.number().int().min(1).max(5000).optional(),
    /** The load's mass in grams (a weight's is its own). */
    mass: z.number().int().min(1).max(20_000).optional(),
    /** Drawn big or small (the big ball and the small stone: size is not mass). */
    size: z.enum(['small', 'big']).optional(),
  })
  .strict()
  .refine((t) => (t.item === undefined) !== (t.weight === undefined), { message: 'a thing in a pan is an item (with its mass) or a weight' })
  .refine((t) => t.item === undefined || t.mass !== undefined, { message: 'an item in a pan needs its mass (grams)' });
export type PanThing = z.output<typeof panThing>;
const instrumentSpec = z.object({
  type: z.enum(INSTRUMENT_TYPES).optional(),
  unit: z.enum(INSTRUMENT_UNITS).optional(),
  /** The printed range, a number every `major`, a mark every `minor` (in `unit`: with `sub`, the small unit). */
  from: decimal.optional(),
  to: decimal.optional(),
  major: decimal.optional(),
  minor: decimal.optional(),
  /** Numbers on every major mark, at the ends only, none, or every major mark but these (a box where they would be). */
  labels: z.union([z.enum(['major', 'ends', 'none']), z.object({ hide: z.array(decimal).min(1).max(12) }).strict()]).default('major'),
  /** A scale in two units: the values in the small unit (`unit`), each whole big unit printed "1 m", the numbers between as what is left in the small unit. */
  sub: z.object({ unit: z.enum(['km', 'm', 'kg', 'l']), per: z.number().int().optional() }).strict().optional(),
  /** The small unit's totals printed on the other side of the scale too (1 m 32 cm and 132 cm). */
  dual: z.boolean().optional(),
  /** A tape: this stretch drawn short between two break lines (a height chart need not be drawn from 0). */
  skip: span.optional(),
  orient: z.enum(['horizontal', 'vertical']).optional(),
  look: z.enum(TAPE_LOOKS).optional(),
  /** A ruler: how far the 0 mark is in from the ruler's end (in `unit`). */
  inset: decimal.optional(),
  /** A ruler with its left end broken off: it starts at `from`. */
  broken: z.boolean().optional(),
  /** A thing laid along a ruler or a tape, end to end (`to` may be off the marks: to the nearest centimetre). */
  object: z.object({ kind: z.enum(LENGTH_THINGS), from: decimal, to: decimal, tone: mTone.default('cold') }).strict().optional(),
  /** A line drawn along the ruler. */
  line: span.extend({ tone: mTone.default('signal') }).strict().optional(),
  /** A tape's arrow; a height chart's head board. */
  arrow: decimal.optional(),
  head: decimal.optional(),
  /** A dial's needle, a jug's level. */
  value: decimal.optional(),
  load: z.enum(LOADS).optional(),
  liquid: z.enum(LIQUIDS).optional(),
  shape: z.enum(JUG_SHAPES).optional(),
  /** `false`: the container alone, no marks (comparing by looking). */
  scale: z.boolean().default(true),
  /** A dial: the angle full scale takes, from 0 at the top clockwise (default 330°: a gap between full and 0). */
  sweep: z.number().int().min(180).max(345).optional(),
  /** A balance's pans. */
  left: z.array(panThing).max(8).optional(),
  right: z.array(panThing).max(8).optional(),
  /** A balance's beam: by the masses (`auto`), or as written (validate: the same as the masses). */
  tilt: z.enum(['auto', 'left', 'right', 'level']).default('auto'),
  /** The items' masses kept to themselves. */
  hideMass: z.boolean().optional(),
  /** Overlays: each small part numbered (count the parts), a magnifier on one stretch, dimension brackets under the scale, the eye-level line, marks drawn bold. */
  count: span.optional(),
  zoom: span.optional(),
  brackets: z.array(span.extend({ label: bilingual, tone: mTone.optional() }).strict()).min(1).max(3).optional(),
  eye: z.boolean().optional(),
  highlight: z.array(decimal).min(1).max(20).optional(),
  /** A dial or a jug drawn as the straight number line it is (an `unroll` beat moves between the two). */
  straight: z.boolean().optional(),
  /** The second of two compared (hot). */
  tone: z.enum(['cold', 'hot']).optional(),
  label: bilingual.optional(),
});
const instrumentModel = instrumentSpec
  .extend({
    kind: z.literal('instrument'),
    /** Two or three instruments side by side, each with its label, drawn to one scale. */
    pair: z.array(instrumentSpec.strict()).length(2).optional(),
    set: z.array(instrumentSpec.strict()).length(3).optional(),
  })
  .strict();
export type InstrumentSpec = z.output<typeof instrumentSpec>;
export type InstrumentModelSpec = z.output<typeof instrumentModel>;

/* The clock face and the timeline (docs/20 §3.1–3.2, model A3): times in 24-hour time, the face shows their 12-hour position. */
const clockFace = z.object({
  /** The time the hands show (default 12:00); am / pm follow from it. */
  time: clockTime.default('12:00'),
  /** `clock` (default) or a `stopwatch` (60-second dial, a small minute dial, `elapsed`). */
  face: z.enum(['clock', 'stopwatch']).default('clock'),
  /** Stopwatch: the time it shows. */
  elapsed: duration.optional(),
  /** The numbers 1–12 (default on). */
  numerals: z.boolean().default(true),
  /** The 60 minute marks (every fifth longer), only the fives, or none. */
  ticks: z.enum(['minutes', 'fives', 'none']).default('minutes'),
  /** `05 10 … 55` small outside the face (counting in fives). */
  minuteLabels: z.boolean().optional(),
  /** `13 … 24` small inside the numbers (the 24-hour clock). */
  inner24: z.boolean().optional(),
  /** Minute marks lit (counting the small marks: `[26, 27, 28]`). */
  highlightTicks: z.array(z.number().int().min(0).max(59)).max(60).optional(),
  /** The second hand. */
  second: z.boolean().optional(),
  /** The hour hand's sweep hatched: from the hour (`true`) or from a time. */
  hourTrack: z.union([z.literal(true), z.object({ from: clockTime }).strict()]).optional(),
  /** A duration as a band inside the rim, from one time to another (a ring for each full hour). */
  arc: z.object({ from: clockTime, to: clockTime }).strict().optional(),
  /** A lens beside the face: the hour hand's tip and the numbers either side, magnified. */
  zoom: z.literal('hour').optional(),
  /** A clock drawn wrong on purpose (beats and `choose` options only): the hour hand on the number, or the hands swapped. */
  faulty: z.enum(['hour-on-numeral', 'hands-swapped']).optional(),
  /** A small plate under the centre: `am` / `pm` (`show`) or `?` (`ask`). */
  ampm: z.enum(['show', 'ask']).optional(),
  /** Hands lit and named (`both`: the hour hand, then the minute hand). */
  lit: z.enum(['hour', 'minute', 'both']).optional(),
  label: bilingual.optional(),
});
const clockModel = clockFace
  .extend({
    kind: z.literal('clock'),
    /** Two faces side by side, each with its label (a right and a wrong one; a stopwatch and a clock). */
    pair: z.array(clockFace.strict()).length(2).optional(),
  })
  .strict();
export type ClockFaceSpec = z.output<typeof clockFace>;
export type ClockModelSpec = z.output<typeof clockModel>;

const timelineMark = z.object({ at: timePoint, tone: z.enum(['cold', 'hot', 'signal']).default('cold'), label: bilingual.optional() }).strict();
const timelineModel = z
  .object({
    kind: z.literal('timeline'),
    /** `day`: 00:00–24:00 · `span`: `from`–`to` (≤ 6 h) · `duration`: `0m`–`to`, labelled 0, 1 h, 2 h. */
    scale: z.enum(['day', 'span', 'duration']).default('span'),
    from: timePoint.optional(),
    to: timePoint.optional(),
    /** Minor marks every so many minutes (lines only). */
    minor: z.union([z.literal(1), z.literal(5), z.literal(10), z.literal(15), z.literal(30)]).optional(),
    /** Hour labels in 12-hour time, 24-hour time, or both (24-hour above the line, 12-hour below). */
    labels: z.enum(['12h', '24h', 'both']).default('12h'),
    /** The morning and the afternoon in two faint bands, noon and midnight marked. */
    bands: z.literal('ampm').optional(),
    /** Times marked with a small triangle and a label (cold = start, hot = end). */
    marks: z.array(timelineMark).max(6).optional(),
    /** Jumps as arcs, in order (to the right above the line, back below it), "+ 20 min" on each. */
    jumps: z.array(z.tuple([timePoint, timePoint])).max(8).optional(),
    /** A clock face beside the line showing the time at its last mark (on a duration check: where the child's jumps have got to). */
    clock: z.boolean().optional(),
    label: bilingual.optional(),
  })
  .strict();
export type TimelineSpec = z.output<typeof timelineModel>;

const baseModels = z.discriminatedUnion('kind', [barModel, circleModel, numberLineModel, wallModel, barModelDiagram, gridModel, arrayModel, blocksModel, clockModel, timelineModel, decimalGridModel, placeValueModel, moneyModel, instrumentModel]);
const isDecimalLine = (v: unknown): boolean => !!v && typeof v === 'object' && (v as { kind?: unknown }).kind === 'numberline' && (v as { scale?: unknown }).scale === 'decimal';
/** A model: by `kind`, the number line by `scale` too (a decimal line has decimal ends and a decimal step). */
export const model = z.unknown().transform((v, ctx): z.output<typeof baseModels> | DecimalLineSpec => {
  const r = isDecimalLine(v) ? decimalLineModel.safeParse(v) : baseModels.safeParse(v);
  if (r.success) return r.data;
  for (const issue of r.error.issues) ctx.addIssue(issue);
  return z.NEVER;
});
export type Model = z.output<typeof model>;
export type ArrayModelSpec = z.output<typeof arrayModel>;
export type NumberLineSpec = z.output<typeof numberLineModel>;
export type BarModelDiagramSpec = z.output<typeof barModelDiagram>;
export type GridModelSpec = z.output<typeof gridModel>;
export type GridFigure = z.output<typeof gridFigure>;
export type GridDim = z.output<typeof gridDim>;

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export const INPUT_FORMS = ['equal', 'equivalent', 'simplest', 'mixed', 'whole', 'measure', 'remainder', 'time12', 'time24', 'face', 'duration', 'decimal', 'compound'] as const;
/** Forms whose answer is a fraction (the fraction boxes). */
export const FRACTION_FORMS = ['equal', 'equivalent', 'simplest', 'mixed'] as const;
/** Forms whose answer is a time of day or a duration. */
export const TIME_FORMS = ['time12', 'time24', 'face', 'duration'] as const;

export const WORK_DOES = ['add', 'subtract', 'multiply', 'divide', 'round', 'convert', 'scale', 'to-fraction', 'to-decimal', 'compose', 'read'] as const;
export const CONVERT_UNITS = ['km', 'm', 'cm', 'kg', 'g', 'l', 'ml', 'dollar', 'cent'] as const;
export type ConvertUnit = (typeof CONVERT_UNITS)[number];
const decimalWork = z
  .object({
    do: z.enum(WORK_DOES),
    /** add · subtract · multiply (b a whole number) · divide (b a whole number) · round · scale · convert: the number worked on. */
    a: decimal.optional(),
    b: decimal.optional(),
    /** round: to this many places. */
    to: z.number().int().min(0).max(3).optional(),
    /** convert: from one unit into another. */
    from: z.enum(CONVERT_UNITS).optional(),
    into: z.enum(CONVERT_UNITS).optional(),
    /** scale: × or ÷ by 10, 100, 1000 or a multiple of them. */
    op: z.enum(['×', '÷']).optional(),
    by: z.number().int().min(2).max(9000).optional(),
    /** to-fraction (a decimal) · to-decimal (a fraction). */
    of: numValue.optional(),
    /** compose: the digits and their places, in the order the question names them. */
    parts: z.array(z.object({ digit: z.number().int().min(0).max(9), place: z.enum(DPLACES) }).strict()).min(1).max(7).optional(),
    /** read: the line the arrow is on, and its tick (steps from `from`). */
    line: z.object({ from: decimal, step: decimal }).strict().optional(),
    tick: z.number().int().min(0).max(20).optional(),
  })
  .strict();
export type DecimalWork = z.output<typeof decimalWork>;
/** A quantity changed into a unit (`"3 kg 40 g"` into `g`) or into a pair of units (`"1250 ml"` into `l-ml`): docs/32 §3.5. */
const measureWork = z
  .object({
    do: z.literal('convert'),
    from: quantity,
    into: z.union([z.enum(INSTRUMENT_UNITS), z.enum(COMPOUND_PAIRS)]),
  })
  .strict();
export type MeasureWork = z.output<typeof measureWork>;

export const inputSpec = z
  .object({
    /** One answer, or one per written value (`blanks`, the `?` of a `sentence`). */
    answer: z.union([answerValue, z.array(answerValue).min(1).max(6)]),
    /**
     * Fractions — `equal`: these exact numbers · `equivalent`: any equal value · `simplest`: lowest terms · `mixed`: a mixed number.
     * Whole numbers — `whole`: 1–5 digits · `measure`: a whole number and a unit chip · `remainder`: quotient, "r", remainder.
     * Time — `time12`: hours : minutes and am / pm · `time24`: hh : mm · `face`: hours : minutes as a clock face reads (no am / pm) · `duration`: h + min or min + s.
     * Decimals — `decimal`: one box with a point key (docs/29 X3).
     * Measures — `compound`: a box for each unit of a compound measure, the units printed (docs/32 §3.5; the small box empty is 0).
     */
    form: z.enum(INPUT_FORMS),
    /** `measure`: the answer's unit (`cm2`, `m`, `unit2` …); `whole` on a grid or an instrument: the unit printed after the box; `decimal`: `dollar` ($ before the box) or a unit printed after it. */
    unit: z.enum(ANSWER_UNITS).optional(),
    /** `decimal`: the places the answer must be written with (rounding, money; default: judged by value, money 2). */
    places: z.number().int().min(0).max(3).optional(),
    /** `decimal` (and a decimal written as a fraction): what is being worked out, for the diagnosis only (docs/29 §3.7); a quantity changed into other units (docs/32 §3.5). */
    work: z.union([decimalWork, measureWork]).optional(),
    /** Grid: what the number is, measured on the figure (checked against its geometry; tells the diagnosis what to look for). */
    ask: z.enum(['area', 'perimeter', 'length', 'breadth', 'side']).optional(),
    /** Grid: the figure asked about (default: the first that is not a ghost). */
    figure: kebabId.optional(),
    /** Grid, a missing side: what the length is found from. */
    given: z.enum(['area', 'perimeter']).optional(),
    /** A printed number sentence with a box for each `?`, in order: `"? + ? = ?"`. */
    sentence: z.string().min(1).optional(),
    /** Per written fraction, the box the child fills (the rest is printed): `2/3 = ?/12 = 8/?` → `["n", "d"]`. */
    blanks: z.array(z.enum(['n', 'd', 'w'])).optional(),
    /** The fraction the answer is renamed from (diagnoses additive / one-sided renaming). */
    from: frac.optional(),
    /** The sum or difference being worked out (diagnoses adding denominators, not converting). */
    sum: z.object({ op: z.enum(['+', '-']), a: frac, b: frac }).strict().optional(),
    /**
     * The whole-number fact being worked out (docs/19 §3.3; tells the diagnosis what to look for): `a × b` or `a ÷ b`;
     * `missing` names the number asked for (`a` in `? × 6 = 42`; default the result); `round` for a word problem's
     * remainder (`up`: one more group for what is left, `down`: what is left does not count); `split` the known part
     * a times table is worked from (5 in 6 × 7 = 5 × 7 + 1 × 7).
     */
    op: z
      .object({
        kind: z.enum(['×', '÷']),
        a: z.number().int().min(0).max(WHOLE_MAX),
        b: z.number().int().min(1).max(WHOLE_MAX),
        missing: z.enum(['a', 'b', 'c']).optional(),
        round: z.enum(['up', 'down']).optional(),
        split: z.number().int().min(1).max(99).optional(),
      })
      .strict()
      .optional(),
    /** Time: the duration being converted (`2h15m` → minutes: diagnoses counting 100 minutes to the hour). */
    convert: z.object({ from: duration, to: z.enum(['h', 'min', 's']).optional() }).strict().optional(),
    /** Time: the start, end and length of a span, and which one is asked (diagnoses going the wrong way, counting the marks). */
    span: z.object({ start: clockTime.optional(), end: clockTime.optional(), length: duration.optional(), ask: z.enum(['start', 'end', 'length']) }).strict().optional(),
    /** `duration`: the two boxes · `measure`: the unit chips (default step limits.units, otherwise the answer's family). */
    units: z.union([z.enum(['h-min', 'min-s']), z.array(z.enum(UNITS)).min(1).max(UNITS.length)]).optional(),
  })
  .strict();
export type InputSpec = z.output<typeof inputSpec>;

const wrongFeedback = z
  .object({
    when: misconception,
    say: bilingual,
    /** A wrong answer showing this misconception, in the task kind's answer notation (docs/06 MathScene): checked by tests/math-scene/lesson.test.ts. */
    sample: z.string().min(1).optional(),
  })
  .strict();

const feedback = z
  .object({
    correct: bilingual,
    wrong: z.array(wrongFeedback).default([]),
    fallback: bilingual,
    reveal: bilingual,
  })
  .strict();

const base = z.object({
  id: kebabId,
  model,
  /** The task in one sentence (tray; EN ≤ 120 characters, ZH ≤ 40). */
  prompt: bilingual,
  /** How to think about it (reader inspector, 2–3 sentences). */
  guide: bilingual,
  /** 1–3 levels: where to look, which method, almost the answer. */
  hints: z.array(bilingual).min(1).max(3),
  feedback,
  /** Time budget (acceptance sum, docs/15 §2.4). */
  minutes: z.number().positive().max(5).optional(),
});

const shadeFields = z.object({ target: frac, accept: z.enum(['exact', 'equivalent']).default('exact'), then: inputSpec.optional() });
const cutFields = z.object({ parts: z.number().int().min(2).max(12), snap: z.union([z.literal(12), z.literal(24)]).default(12) });
/** Parts after folding (the starting parts doubled once per fold). */
const foldFields = z.object({ parts: z.number().int().min(2).max(16), then: inputSpec.optional() });
const scaleFields = z.object({ factors: z.array(z.number().int().min(2).max(6)).min(1).max(4), target: frac, then: inputSpec.optional() });
const placeFields = z.object({
  target: numValue,
  snap: z.enum(['ticks', 'free']).default('ticks'),
  tolerance: z.number().positive().optional(),
  /** A decimal line: how many times the child zooms in (a segment opens a line of ten under it) before placing (docs/29 §3.6). */
  zoom: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});
const compareFields = z.object({
  a: numOrQty,
  b: numOrQty,
  ask: z.enum(['symbol', 'greater', 'smaller']).default('symbol'),
  /** Fractions — `split`: a button cuts both bars into same-size parts; `stack`: the bars are lined up under one whole. Decimals — `point`: a button lines the two numbers up on the point (zeros filled in). Quantities — `unit`: a button writes both in the same (smallest) unit. */
  align: z.enum(['split', 'stack', 'point', 'unit']).optional(),
});
const orderFields = z.object({
  items: z.array(numOrQty).min(3).max(5),
  direction: z.enum(['asc', 'desc']),
  /** After ordering, the items appear as points on a number line (fractions: intervals per whole; decimals: `true`, on the task's line). */
  line: z.union([z.number().int().min(2).max(12), z.literal(true)]).optional(),
});
const option = z
  .object({
    id: kebabId,
    value: numOrQty.optional(),
    model: model.optional(),
    text: bilingual.optional(),
    correct: z.boolean(),
    /** Wrong option: the misconception choosing it shows. Right option: the one leaving it out shows. */
    misconception: misconception.optional(),
  })
  .strict();
const chooseFields = z.object({ multi: z.boolean().optional(), options: z.array(option).min(2).max(6) });
const buildSumFields = z.object({
  op: z.enum(['+', '-']),
  a: frac,
  b: frac,
  /** Cut each of the given parts into this many first (related denominators). */
  convert: z.number().int().min(2).max(6).optional(),
  answer: inputSpec,
});

/* Square-grid tasks (docs/21 §3.2) */
const countSquaresFields = z.object({
  figure: kebabId.optional(),
  /** `all`: lay a square on every cell · `row-col`: one full row and one full column are enough (then multiply). */
  cover: z.enum(['all', 'row-col']).default('all'),
  then: inputSpec,
});
const traceFields = z.object({ figure: kebabId.optional(), then: inputSpec });
const drawRectFields = z.object({
  area: z.number().int().min(1).max(144).optional(),
  perimeter: z.number().int().min(4).max(60).optional(),
  length: z.number().int().min(1).max(12).optional(),
  breadth: z.number().int().min(1).max(12).optional(),
  square: z.boolean().optional(),
  /** `any`: either way round · `exact`: length across, breadth up. */
  accept: z.enum(['any', 'exact']).default('any'),
});
const splitFigureFields = z.object({ figure: kebabId.optional(), then: inputSpec });

/* Array tasks (docs/19 §3.1) */
const groupFields = z.object({
  /** Things to put into groups. */
  total: z.number().int().min(1).max(60),
  /** `share`: into `k` containers, the same in each · `pack`: `k` in each container. */
  by: z.enum(['share', 'pack']),
  k: z.number().int().min(1).max(12),
  then: inputSpec.optional(),
});
const arrangeFields = z.object({
  rows: z.number().int().min(1).max(12),
  cols: z.number().int().min(1).max(12),
  /** `exact`: these rows and columns · `product`: any array with as many (another way to make 12). */
  accept: z.enum(['exact', 'product']).default('exact'),
});
const skipCountFields = z.object({
  size: z.number().int().min(1).max(25),
  count: z.number().int().min(1).max(12),
  /** The end of the line (default the model's). */
  to: z.number().int().min(1).max(100).optional(),
});
const splitArrayFields = z.object({
  rows: z.number().int().min(2).max(12),
  cols: z.number().int().min(1).max(12),
  /** Where the cut must go (after row k, or column k); without it any cut works. */
  at: z.object({ rows: z.array(z.number().int().min(1)).length(1).optional(), cols: z.array(z.number().int().min(1)).length(1).optional() }).strict().optional(),
  then: inputSpec,
});

/* Place-value tasks (docs/19 §3.2; on the decimal chart, docs/29 §3.6) */
const regroupFields = z.object({
  /** A whole number on the blocks, or a decimal on the place-value chart. */
  value: wholeOrDecimal,
  /** The blocks (or discs) at the start (not in standard form: 14 tens, 13 hundredths). */
  start: dcounts,
  /** The chart: the discs to end with when that is not every place under 10 (a tenth traded for 10 hundredths to take away). */
  goal: dcounts.optional(),
  then: inputSpec.optional(),
});
const shareFields = z.object({
  /** A whole number on the blocks, or a decimal on the place-value chart (shared to at most three places). */
  value: wholeOrDecimal,
  k: z.number().int().min(2).max(9),
  then: inputSpec,
});

/* Decimal tasks (docs/29 §3.6) */
const shadeDecimalFields = z.object({
  target: decimal,
  level: z.union([z.literal(10), z.literal(100), z.literal(1000)]),
  wholes: z.number().int().min(1).max(3).optional(),
  /** Already shaded and locked (the given amount). */
  start: decimal.optional(),
  /** Only the amount shaded counts, not which squares. */
  accept: z.literal('value').default('value'),
});
const roundOnLineFields = z.object({
  value: decimal,
  /** Rounded to the nearest whole number (0), 1 or 2 decimal places. */
  to: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  /** `hidden`: the ends are not printed (the child names them in the written part). */
  labels: z.enum(['ends', 'hidden']).default('ends'),
  then: inputSpec,
});
const alignAddFields = z.object({
  op: z.enum(['+', '−']),
  a: decimal,
  b: decimal,
  /** Where the second row starts: under the last digit (`right`) or the first (`left`). */
  start: z.enum(['right', 'left']).default('right'),
  then: inputSpec,
});
const shiftDigitsFields = z.object({
  value: decimal,
  op: z.enum(['×', '÷']),
  by: z.union([z.literal(10), z.literal(100), z.literal(1000)]),
});

/* Clock and timeline tasks (docs/20 §3.4) */
const readClockFields = z.object({
  /** The time the clock shows (a stopwatch: the duration it shows). */
  answer: answerValue,
  /** How it is written: 12-hour time with am / pm, the clock face's reading, 24-hour time; a stopwatch's duration. */
  form: z.enum(TIME_FORMS),
  /** `duration`: the boxes (default from the answer). */
  units: z.enum(['h-min', 'min-s']).optional(),
});
const setClockFields = z.object({
  /** The time to set (24-hour; without `ampm` only its 12-hour position counts). */
  target: clockTime,
  /** The minute hand moves in 1-minute or 5-minute steps. */
  snap: z.union([z.literal(1), z.literal(5)]).default(5),
  /** The clock's am / pm plate is set too (crossing noon or midnight flips it). */
  ampm: z.boolean().optional(),
});
const durationFields = z.object({
  /** What is asked: the length of the span, its end or its start. */
  ask: z.enum(['length', 'end', 'start']),
  start: clockTime.optional(),
  end: clockTime.optional(),
  length: duration.optional(),
  /** How the answer is written (a duration, or a time of day); the span above tells the diagnosis what to look for. */
  answer: inputSpec,
});

/* Instrument tasks (docs/32 §3.4) */
const readScaleFields = z.object({
  /** The reading, written in its form: `whole` (the unit printed after the box), `measure` (unit chips), `compound`, `decimal`. */
  answer: inputSpec,
  /** The tray's tools: a magnifier on the stretch where the reading is, the small parts numbered as the child taps them (a scratch, not checked). */
  tools: z.array(z.enum(['zoom', 'count'])).min(1).max(2).optional(),
});
const setScaleFields = z.object({
  /** What to set: a number in the instrument's unit (with `sub`, the small unit) or a quantity (`"450 g"`, `"1 l 250 ml"`). */
  target: z.union([quantity, decimal]),
  /** Draw a line from 0, move a tape's arrow, load a dial, fill a jug, or put weights on a balance until it is level. */
  mode: z.enum(['line', 'arrow', 'load', 'fill', 'weights']),
  /** `weights`: the weights in the tray (grams). */
  weights: z.array(z.number().int().min(1).max(5000)).min(1).max(8).optional(),
});
const countIntervalsFields = z.object({
  /** Two marks: the small parts between them are tapped one by one. */
  between: z.tuple([decimal, decimal]),
  /** Then the written part: what each small part stands for (`part`), or how long the stretch is (`length`). */
  ask: z.enum(['part', 'length']),
  then: inputSpec,
});

export const taskSchema = z.discriminatedUnion('kind', [
  base.extend({ kind: z.literal('shade') }).merge(shadeFields).strict(),
  base.extend({ kind: z.literal('cut') }).merge(cutFields).strict(),
  base.extend({ kind: z.literal('fold') }).merge(foldFields).strict(),
  base.extend({ kind: z.literal('split') }).merge(scaleFields).strict(),
  base.extend({ kind: z.literal('merge') }).merge(scaleFields).strict(),
  base.extend({ kind: z.literal('place') }).merge(placeFields).strict(),
  base.extend({ kind: z.literal('compare') }).merge(compareFields).strict(),
  base.extend({ kind: z.literal('order') }).merge(orderFields).strict(),
  base.extend({ kind: z.literal('choose') }).merge(chooseFields).strict(),
  base.extend({ kind: z.literal('input') }).merge(inputSpec).strict(),
  base.extend({ kind: z.literal('build-sum') }).merge(buildSumFields).strict(),
  base.extend({ kind: z.literal('count-squares') }).merge(countSquaresFields).strict(),
  base.extend({ kind: z.literal('trace-perimeter') }).merge(traceFields).strict(),
  base.extend({ kind: z.literal('draw-rectangle') }).merge(drawRectFields).strict(),
  base.extend({ kind: z.literal('split-figure') }).merge(splitFigureFields).strict(),
  base.extend({ kind: z.literal('group') }).merge(groupFields).strict(),
  base.extend({ kind: z.literal('arrange') }).merge(arrangeFields).strict(),
  base.extend({ kind: z.literal('skip-count') }).merge(skipCountFields).strict(),
  base.extend({ kind: z.literal('split-array') }).merge(splitArrayFields).strict(),
  base.extend({ kind: z.literal('regroup') }).merge(regroupFields).strict(),
  base.extend({ kind: z.literal('share') }).merge(shareFields).strict(),
  base.extend({ kind: z.literal('shade-decimal') }).merge(shadeDecimalFields).strict(),
  base.extend({ kind: z.literal('round-on-line') }).merge(roundOnLineFields).strict(),
  base.extend({ kind: z.literal('align-add') }).merge(alignAddFields).strict(),
  base.extend({ kind: z.literal('shift-digits') }).merge(shiftDigitsFields).strict(),
  base.extend({ kind: z.literal('read-clock') }).merge(readClockFields).strict(),
  base.extend({ kind: z.literal('set-clock') }).merge(setClockFields).strict(),
  base.extend({ kind: z.literal('duration') }).merge(durationFields).strict(),
  base.extend({ kind: z.literal('read-scale') }).merge(readScaleFields).strict(),
  base.extend({ kind: z.literal('set-scale') }).merge(setScaleFields).strict(),
  base.extend({ kind: z.literal('count-intervals') }).merge(countIntervalsFields).strict(),
]);
export type Task = z.output<typeof taskSchema>;
export type TaskOf<K extends TaskKind> = Extract<Task, { kind: K }>;

/* ------------------------------------------------------------------ */
/* Lesson                                                              */
/* ------------------------------------------------------------------ */

export const LESSON_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5'] as const;

const syllabusLine = z
  .object({
    id: kebabId,
    level: z.enum(LESSON_LEVELS),
    /** `P3 1.3` */
    ref: z.string().min(1),
    /** The syllabus wording (EN verbatim) and its Chinese rendering. */
    text: bilingual,
    /** Source id in sources.json (`S1`). */
    source: z.string().regex(/^S[1-9]\d*$/),
    page: z.number().int().positive().optional(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Beats (the explanation, docs/15 §10)                                */
/* ------------------------------------------------------------------ */

/** How the stage gets from the previous beat to this one (a short eased transition; `morph` = another model kind). */
export const BEAT_MOVES = ['cut', 'shade', 'fold', 'split', 'merge', 'convert', 'place', 'cross', 'morph', 'tile', 'walk', 'arrange', 'group', 'deal', 'rotate', 'cover', 'jump', 'combine', 'trade', 'sweep', 'zoom', 'slide', 'align', 'round', 'unroll', 'fill', 'tip'] as const;
export type BeatMove = (typeof BEAT_MOVES)[number];

const beatOverlay = z
  .object({
    /** Finer equivalent cuts and their names under a bar (the E mode). */
    equivalent: z.boolean().optional(),
    /** An aligned number line under a bar (the N mode). */
    numberline: z.boolean().optional(),
    /** Every part named 1/n (the L mode). */
    labels: z.boolean().optional(),
    /** The fraction beside the model, big and stacked (the S mode). */
    symbol: z.boolean().optional(),
  })
  .strict();

export const beatSchema = z
  .object({
    /** What the stage shows: the same models as the tasks (`given` = cold, `shaded` = signal). */
    model,
    /** A second model drawn under the first, lined up with it (an array and its number line). */
    under: model.optional(),
    /** Bar / circle: given parts taken away (ink hatch). */
    crossed: partSet.optional(),
    /** Fraction wall: fractions lit on their rows (two = cold and hot, compared; more = cold, equivalents or an order). */
    highlight: z.array(frac).min(1).max(6).optional(),
    overlay: beatOverlay.optional(),
    /** The number sentence under the model, `{a/b}` tokens: `{3/4} = {6/8}`. */
    equation: z.string().min(1).optional(),
    /** A number sentence with words in it (`area = length × breadth`), one per language; instead of `equation`. */
    words: bilingual.optional(),
    /** The transition from the previous beat. */
    move: z.enum(BEAT_MOVES).optional(),
    /** One or two sentences (also the voice text): what to see on the model now. */
    caption: bilingual,
  })
  .strict();
export type Beat = z.output<typeof beatSchema>;

export const stepLimits = z
  .object({
    /** Longest side of any figure (in the model's unit). */
    maxSide: z.number().int().min(1).optional(),
    maxArea: z.number().int().min(1).optional(),
    maxPerimeter: z.number().int().min(1).optional(),
    /** Squares to lay (whole + half cells). */
    maxCells: z.number().int().min(1).optional(),
    /** A grid the child works on: at most this many cells across and up. */
    gridMax: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    /** Sides of a rectilinear figure. */
    sides: z.tuple([z.number().int().min(4), z.number().int().min(4)]).optional(),
    /* Whole numbers (docs/19 §1.3) */
    /** Both factors of a multiplication within `[lo, hi]` (groups and each, rows and columns, the numbers multiplied). */
    factors: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
    /** Largest product, total or number shared. */
    maxTotal: z.number().int().min(1).optional(),
    /** The number divided by within `[lo, hi]`. */
    divisor: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    maxQuotient: z.number().int().min(1).optional(),
    /** Largest whole number anywhere in the task (answers, values, the numbers worked with). */
    maxValue: z.number().int().min(1).max(WHOLE_MAX).optional(),
    /* Time (docs/20 §3.6) */
    /** `12h`: times are read and written in 12-hour time only (no 24-hour forms) · `24h`: both. */
    clock: z.enum(['12h', '24h']).optional(),
    /** Every time of day and duration a whole number of this many minutes. */
    step: z.number().int().min(1).max(60).optional(),
    /** Longest duration. */
    maxDuration: duration.optional(),
    /* Decimals (docs/29 §1.3, X9) */
    /** Places of the decimals a task gives, `[fewest, most]`. */
    dp: z.tuple([z.number().int().min(0).max(3), z.number().int().min(0).max(3)]).optional(),
    /** Most places an answer has. */
    resultDp: z.number().int().min(0).max(3).optional(),
    /** The whole number a decimal is multiplied or divided by, `[lo, hi]`. */
    factor: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    /** Denominators a fraction written as a decimal may have. */
    denominators: z.array(z.number().int().min(1).max(1000)).min(1).optional(),
    /** Rounding to `[fewest, most]` places. */
    roundTo: z.tuple([z.number().int().min(0).max(2), z.number().int().min(0).max(2)]).optional(),
    /** × ÷ by these (10, 100, 1000) and, with `multiples`, their multiples (20 … 900). */
    by: z.array(z.union([z.literal(10), z.literal(100), z.literal(1000)])).min(1).optional(),
    multiples: z.boolean().optional(),
    /** Decimals: the unit conversions allowed (`km-m` …) · measuring: the units a task may use (`cm`, `m` …; docs/32 §3.5). */
    units: z.array(z.enum([...COMPOUND_PAIRS, ...INSTRUMENT_UNITS])).min(1).optional(),
    /* Measuring (docs/32 §3.5, M9) */
    /** What each small part of an instrument may stand for. */
    parts: z.array(decimal).min(1).optional(),
    /** How many small parts may lie between two numbered marks. */
    partsPerLabel: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    /** A length to the nearest centimetre: an object's end may be off the marks. */
    nearest: z.boolean().optional(),
    /** The compound pairs a task may use (none: no compound measures). */
    compound: z.array(z.enum(COMPOUND_PAIRS)).min(1).optional(),
    /** Largest big part of a compound measure. */
    bigMax: z.number().int().min(1).max(99).optional(),
    /** The small part of a compound measure in g, ml or m is a multiple of this. */
    smallStep: z.number().int().min(1).optional(),
    /** The weights a balance may use (grams). */
    weights: z.array(z.number().int().min(1)).min(1).optional(),
    /** Amounts of money are whole numbers of 5 cents. */
    money: z.boolean().optional(),
    /** Most zoom levels of a decimal line (0–2). */
    zoomDepth: z.number().int().min(0).max(2).optional(),
    /** Every span stays within one day (no crossing midnight). */
    sameDay: z.boolean().optional(),
  })
  .strict();
export type StepLimits = z.output<typeof stepLimits>;

const step = z
  .object({
    /** = the chapter id (one chapter per step). */
    id: kebabId,
    /** Syllabus line ids. */
    lo: z.array(kebabId).min(1),
    /** A step past the main lesson (the reader says "Going further"; no school level is shown anywhere). */
    bridge: z.boolean().optional(),
    /** Number limits for every task and beat of the step (docs/19 §3.0 G11), checked by validate and check-pool. */
    limits: stepLimits.optional(),
    /** Model views the VIEW group offers on the check (default: the drawn task's model). */
    views: z.array(modelView).min(1).optional(),
    /** The explanation, 3–5 beats (validate). */
    beats: z.array(beatSchema).min(1),
    /** The check at the end of the chapter: 8–10 tasks on the same idea (validate); one is drawn per visit. */
    pool: z.array(taskSchema).min(1),
    /** The chapter index in the reading panel: 2–4 one-line facts. */
    keyFacts: z.array(bilingual).min(1).max(4).optional(),
  })
  .strict()
  .transform((s) => {
    const units = s.limits?.units?.filter((u): u is InstrumentUnit => (INSTRUMENT_UNITS as readonly string[]).includes(u));
    if (!units?.length) return s;
    for (const task of s.pool) {
      const spec = task.kind === 'input' ? task : task.kind === 'read-scale' ? task.answer : 'then' in task ? task.then : null;
      if (spec?.form === 'measure' && spec.units === undefined) spec.units = [...units];
    }
    return s;
  });
export type Step = z.output<typeof step>;

const question = z
  .object({
    /** = `task.id`. */
    id: kebabId,
    /** Steps to have another look at after a wrong answer. */
    revisit: z.array(kebabId).min(1),
    task: taskSchema,
  })
  .strict();
export type Question = z.output<typeof question>;

export const lessonFile = z
  .object({
    /** How times are written everywhere in the lesson (docs/20 §3.0): `7.20 am` / `7.20 a.m.` / `7:20 am`; `19:20` / `1920` / `19 20`. */
    notation: z
      .object({ clock12: z.enum(CLOCK12_NOTATIONS).default(DEFAULT_NOTATION.clock12), clock24: z.enum(CLOCK24_NOTATIONS).default(DEFAULT_NOTATION.clock24) })
      .strict()
      .default(DEFAULT_NOTATION),
    syllabus: z.array(syllabusLine).min(1),
    steps: z.array(step).min(1),
    practice: z.array(question).default([]),
  })
  .strict();
export type Lesson = z.output<typeof lessonFile>;

/** Everything in `data/`: the lesson plus the shared sources and glossary. */
export const mathSceneData = z
  .object({ lesson: lessonFile, sources: sourcesFile.optional(), glossary: glossaryFile.optional() })
  .strict();
export type MathSceneData = z.output<typeof mathSceneData>;

/** A chapter's `state` (docs/15 §4.2): reader summary, the practice / background flags. */
export const mathChapterState = z
  .object({
    summary: bilingual.optional(),
    practice: z.boolean().optional(),
    note: bilingual.optional(),
    theme: theme.optional(),
  })
  .strict();
export type MathChapterState = z.output<typeof mathChapterState>;

/** Every id the lesson declares (topic-wide uniqueness; step ids equal chapter ids by design and are not listed). */
export function mathSceneIds(data: MathSceneData): { kind: string; id: string }[] {
  const out: { kind: string; id: string }[] = [];
  for (const line of data.lesson.syllabus) out.push({ kind: 'syllabus line', id: line.id });
  const optionIds = (t: Task) => (t.kind === 'choose' ? t.options.map((o) => ({ kind: 'option', id: `${t.id}-${o.id}` })) : []);
  for (const s of data.lesson.steps) for (const t of s.pool) out.push({ kind: 'task', id: t.id }, ...optionIds(t));
  for (const q of data.lesson.practice) out.push({ kind: 'question', id: q.id }, ...optionIds(q.task));
  return out;
}
