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
 * (`"1h35m"`). Build time only (zod): client code imports types from this
 * file, never values.
 */
import { z } from 'zod';
import { bilingual, kebabId, theme } from '../../content/schema/common';
import { sourcesFile } from '../../content/schema/sources';
import { glossaryFile } from '../../content/schema/glossary';
import { parseFrac, type Frac } from './lib/fraction';
import { CLOCK12_NOTATIONS, CLOCK24_NOTATIONS, DAY, DEFAULT_NOTATION, parseClock, parseDuration, parseTagged, parseWhole, UNITS, WHOLE_MAX, type AnswerValue, type DurValue } from './lib/value';

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
/** The domains, each with its own codes (a task's codes come from one domain, validate). */
export const MISCONCEPTION_DOMAINS = { fractions: FRACTION_CODES, measure: MEASURE_CODES, 'whole-ops': WHOLE_OPS_CODES, time: TIME_CODES } as const;
export type MisconceptionDomain = keyof typeof MISCONCEPTION_DOMAINS;
/** Misconceptions the feedback is designed around, registered by domain (docs/19 §3.0 G5); one flat list, every code unique. */
export const MISCONCEPTIONS = [...FRACTION_CODES, ...MEASURE_CODES, ...WHOLE_OPS_CODES, ...TIME_CODES] as const;
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
  'read-clock',
  'set-clock',
  'duration',
] as const;
/** Task kinds on the square grid (docs/21 §3.2). */
export const GRID_KINDS = ['count-squares', 'trace-perimeter', 'draw-rectangle', 'split-figure'] as const;
/** Task kinds on the array and the whole-number line (docs/19 §3.1). */
export const ARRAY_KINDS = ['group', 'arrange', 'skip-count', 'split-array'] as const;
/** Task kinds on the place-value blocks (docs/19 §3.2). */
export const BLOCKS_KINDS = ['regroup', 'share'] as const;
/** Task kinds on the clock face and the timeline (docs/20 §3.4). */
export const TIME_KINDS = ['read-clock', 'set-clock', 'duration'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/** Model views a step may switch between (the VIEW group). `clock` and `timeline` are the time lesson's (docs/20 §3, model A3). */
export const MODEL_VIEWS = ['bar', 'circle', 'numberline', 'wall', 'barmodel', 'grid', 'array', 'blocks', 'clock', 'timeline'] as const;
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

/** An answer: a fraction or whole number (`"3/4"`, `"2"`, `56`), a remainder (`"3 r 2"`), a time of day (`"09:40"`) or a duration (`"1h35m"`). */
export const answerValue = z.union([z.number(), z.string()]).transform((v, ctx): AnswerValue => {
  if (typeof v === 'number') {
    const n = parseWhole(v);
    if (n !== null) return { n, d: 1 };
  } else {
    const f = parseFrac(v);
    if (f) return f;
    const tagged = parseTagged(v);
    if (tagged) return tagged;
  }
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${v}" is not an answer (a fraction "3/4", a whole number 56, "3 r 2", "09:40" or "1h35m")` });
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
    /** `fraction` (default): wholes cut in `intervals` · `whole`: a whole-number line from `from` to `to` (≤ 100) in steps of `step` (docs/19 §3.1). */
    scale: z.enum(['fraction', 'whole']).default('fraction'),
    from: z.number().int().min(0).default(0),
    /** Fraction line: 1–3 wholes · whole-number line: up to 100 (validate). */
    to: z.number().int().min(1).max(100).default(1),
    /** Fraction line: intervals per whole (required there, validate). */
    intervals: z.number().int().min(1).max(12).optional(),
    /** Whole-number line: the tick spacing. */
    step: z.union([z.literal(1), z.literal(2), z.literal(5), z.literal(10)]).optional(),
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
  /** Count braces: rows (left, "3 rows"), columns (top, "4 in each row"), both, or the groups' (true). */
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

export const model = z.discriminatedUnion('kind', [barModel, circleModel, numberLineModel, wallModel, barModelDiagram, gridModel, arrayModel, blocksModel, clockModel, timelineModel]);
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

export const INPUT_FORMS = ['equal', 'equivalent', 'simplest', 'mixed', 'whole', 'measure', 'remainder', 'time12', 'time24', 'face', 'duration'] as const;
/** Forms whose answer is a fraction (the fraction boxes). */
export const FRACTION_FORMS = ['equal', 'equivalent', 'simplest', 'mixed'] as const;
/** Forms whose answer is a time of day or a duration. */
export const TIME_FORMS = ['time12', 'time24', 'face', 'duration'] as const;

export const inputSpec = z
  .object({
    /** One answer, or one per written value (`blanks`, the `?` of a `sentence`). */
    answer: z.union([answerValue, z.array(answerValue).min(1).max(6)]),
    /**
     * Fractions — `equal`: these exact numbers · `equivalent`: any equal value · `simplest`: lowest terms · `mixed`: a mixed number.
     * Whole numbers — `whole`: 1–5 digits · `measure`: a whole number and a unit chip · `remainder`: quotient, "r", remainder.
     * Time — `time12`: hours : minutes and am / pm · `time24`: hh : mm · `face`: hours : minutes as a clock face reads (no am / pm) · `duration`: h + min or min + s.
     */
    form: z.enum(INPUT_FORMS),
    /** `measure`: the answer's unit (`cm2`, `m`, `unit2` …); `whole` on a grid: the unit printed after the box. */
    unit: z.enum(UNITS).optional(),
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
    /** `duration`: the two boxes (default from the answer: hours and minutes, or minutes and seconds). */
    units: z.enum(['h-min', 'min-s']).optional(),
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
const placeFields = z.object({ target: frac, snap: z.enum(['ticks', 'free']).default('ticks'), tolerance: z.number().positive().optional() });
const compareFields = z.object({
  a: frac,
  b: frac,
  ask: z.enum(['symbol', 'greater', 'smaller']).default('symbol'),
  /** `split`: a button cuts both bars into same-size parts; `stack`: the bars are lined up under one whole. */
  align: z.enum(['split', 'stack']).optional(),
});
const orderFields = z.object({
  items: z.array(frac).min(3).max(5),
  direction: z.enum(['asc', 'desc']),
  /** After ordering, the items appear as points on a number line (intervals per whole). */
  line: z.number().int().min(2).max(12).optional(),
});
const option = z
  .object({
    id: kebabId,
    value: frac.optional(),
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

/* Place-value tasks (docs/19 §3.2) */
const regroupFields = z.object({
  value: z.number().int().min(0).max(999),
  /** The blocks on the mat at the start (not in standard form: 14 tens). */
  start: placeCounts,
  then: inputSpec.optional(),
});
const shareFields = z.object({
  value: z.number().int().min(1).max(999),
  k: z.number().int().min(2).max(9),
  then: inputSpec,
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
  base.extend({ kind: z.literal('read-clock') }).merge(readClockFields).strict(),
  base.extend({ kind: z.literal('set-clock') }).merge(setClockFields).strict(),
  base.extend({ kind: z.literal('duration') }).merge(durationFields).strict(),
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
export const BEAT_MOVES = ['cut', 'shade', 'fold', 'split', 'merge', 'convert', 'place', 'cross', 'morph', 'tile', 'walk', 'arrange', 'group', 'deal', 'rotate', 'cover', 'jump', 'combine', 'trade', 'sweep'] as const;
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
  .strict();
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
