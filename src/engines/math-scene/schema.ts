/**
 * MathScene data (docs/15 §4.2, §10): `data/lesson.json` — the syllabus lines
 * the lesson follows, the steps (one per chapter: explanation beats, a pool of
 * check tasks of which one is drawn per visit, key facts) and the practice
 * questions — plus the shared `sources.json` / `glossary.json`.
 *
 * Fractions are strings in the data (`"3/4"`, `"1 3/4"`, `"2"`) and parse into
 * `Frac` objects here, so `data.json` and the client get structured values.
 * Build time only (zod): client code imports types from this file, never values.
 */
import { z } from 'zod';
import { bilingual, kebabId, theme } from '../../content/schema/common';
import { sourcesFile } from '../../content/schema/sources';
import { glossaryFile } from '../../content/schema/glossary';
import { parseFrac, type Frac } from './lib/fraction';
import { UNITS } from './lib/value';

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
/** Misconceptions the feedback is designed around, registered by domain (docs/19 §3.0 G5); one flat list, every code unique. */
export const MISCONCEPTIONS = [...FRACTION_CODES, ...MEASURE_CODES] as const;
export const misconception = z.enum(MISCONCEPTIONS);
export type MisconceptionCode = (typeof MISCONCEPTIONS)[number];

export const TASK_KINDS = ['shade', 'cut', 'fold', 'split', 'merge', 'place', 'compare', 'order', 'choose', 'input', 'build-sum', 'count-squares', 'trace-perimeter', 'draw-rectangle', 'split-figure'] as const;
/** Task kinds on the square grid (docs/21 §3.2). */
export const GRID_KINDS = ['count-squares', 'trace-perimeter', 'draw-rectangle', 'split-figure'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/** Model views a step may switch between (the VIEW group). */
export const MODEL_VIEWS = ['bar', 'circle', 'numberline', 'wall', 'barmodel', 'grid'] as const;
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
    from: z.number().int().min(0).default(0),
    to: z.number().int().min(1).max(3).default(1),
    /** Intervals per whole. */
    intervals: z.number().int().min(1).max(12),
    labels: z.enum(['ends', 'wholes', 'all', 'none']).default('wholes'),
    marks: z.array(frac).optional(),
    /** A pointer above the line at this value (read-the-line tasks). */
    arrow: frac.optional(),
    /** A strip the length of one whole, drawn above and aligned with the line. */
    withBar: z.boolean().optional(),
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

export const model = z.discriminatedUnion('kind', [barModel, circleModel, numberLineModel, wallModel, barModelDiagram, gridModel]);
export type Model = z.output<typeof model>;
export type BarModelDiagramSpec = z.output<typeof barModelDiagram>;
export type GridModelSpec = z.output<typeof gridModel>;
export type GridFigure = z.output<typeof gridFigure>;
export type GridDim = z.output<typeof gridDim>;

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export const inputSpec = z
  .object({
    /** One answer, or one per written fraction (`blanks`). */
    answer: z.union([frac, z.array(frac).min(1).max(3)]),
    /** `equal`: these exact numbers · `equivalent`: any equal value · `simplest`: lowest terms · `mixed`: a mixed number · `whole`: a whole number (1–5 digits) · `measure`: a whole number and a unit chip. */
    form: z.enum(['equal', 'equivalent', 'simplest', 'mixed', 'whole', 'measure']),
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
export const BEAT_MOVES = ['cut', 'shade', 'fold', 'split', 'merge', 'convert', 'place', 'cross', 'morph', 'tile', 'walk', 'arrange'] as const;
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

const stepLimits = z
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
