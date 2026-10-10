/**
 * MathScene data (docs/15 §4.2): `data/lesson.json` — the syllabus lines the
 * lesson follows, the steps (one per chapter) with their sub-steps (tasks),
 * and the practice questions — plus the shared `sources.json` / `glossary.json`.
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

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

/** Misconceptions the feedback is designed around (docs/15 §2.2). `not-simplest` is the "one step short" case, not an error. */
export const MISCONCEPTIONS = [
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
export const misconception = z.enum(MISCONCEPTIONS);
export type MisconceptionCode = (typeof MISCONCEPTIONS)[number];

export const TASK_KINDS = ['shade', 'cut', 'fold', 'split', 'merge', 'place', 'compare', 'order', 'choose', 'input', 'build-sum'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/** Model views a step may switch between (the VIEW group). */
export const MODEL_VIEWS = ['bar', 'circle', 'numberline', 'wall', 'barmodel'] as const;
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

export const model = z.discriminatedUnion('kind', [barModel, circleModel, numberLineModel, wallModel, barModelDiagram]);
export type Model = z.output<typeof model>;
export type BarModelDiagramSpec = z.output<typeof barModelDiagram>;

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export const inputSpec = z
  .object({
    /** One answer, or one per written fraction (`blanks`). */
    answer: z.union([frac, z.array(frac).min(1).max(3)]),
    /** `equal`: these exact numbers · `equivalent`: any equal value · `simplest`: lowest terms · `mixed`: a mixed number · `whole`: a whole number. */
    form: z.enum(['equal', 'equivalent', 'simplest', 'mixed', 'whole']),
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

/** An example (the "watch" half of a sub-step): another model and other numbers, one caption line per beat. */
const exampleOf = <T extends z.ZodRawShape>(fields: z.ZodObject<T>) =>
  z.object({ model, say: z.array(bilingual).min(1).max(5) }).merge(fields.partial()).strict();

export const taskSchema = z.discriminatedUnion('kind', [
  base.extend({ kind: z.literal('shade') }).merge(shadeFields).extend({ example: exampleOf(shadeFields).optional() }).strict(),
  base.extend({ kind: z.literal('cut') }).merge(cutFields).extend({ example: exampleOf(cutFields).optional() }).strict(),
  base.extend({ kind: z.literal('fold') }).merge(foldFields).extend({ example: exampleOf(foldFields).optional() }).strict(),
  base.extend({ kind: z.literal('split') }).merge(scaleFields).extend({ example: exampleOf(scaleFields).optional() }).strict(),
  base.extend({ kind: z.literal('merge') }).merge(scaleFields).extend({ example: exampleOf(scaleFields).optional() }).strict(),
  base.extend({ kind: z.literal('place') }).merge(placeFields).extend({ example: exampleOf(placeFields).optional() }).strict(),
  base.extend({ kind: z.literal('compare') }).merge(compareFields).extend({ example: exampleOf(compareFields).optional() }).strict(),
  base.extend({ kind: z.literal('order') }).merge(orderFields).extend({ example: exampleOf(orderFields).optional() }).strict(),
  base.extend({ kind: z.literal('choose') }).merge(chooseFields).extend({ example: exampleOf(chooseFields).optional() }).strict(),
  base.extend({ kind: z.literal('input') }).merge(inputSpec).extend({ example: exampleOf(inputSpec).optional() }).strict(),
  base.extend({ kind: z.literal('build-sum') }).merge(buildSumFields).extend({ example: exampleOf(buildSumFields).optional() }).strict(),
]);
export type Task = z.output<typeof taskSchema>;
export type TaskOf<K extends TaskKind> = Extract<Task, { kind: K }>;

/* ------------------------------------------------------------------ */
/* Lesson                                                              */
/* ------------------------------------------------------------------ */

export const LESSON_LEVELS = ['P2', 'P3', 'P4', 'P5'] as const;

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

const step = z
  .object({
    /** = the chapter id (one chapter per step). */
    id: kebabId,
    /** Syllabus line ids. */
    lo: z.array(kebabId).min(1),
    /** P4 bridge step (the reader's eyebrow says BRIDGE · P4). */
    bridge: z.boolean().optional(),
    /** Model views the VIEW group offers in this step (default: the first task's model). */
    views: z.array(modelView).min(1).optional(),
    tasks: z.array(taskSchema).min(2).max(4),
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

/** A chapter's `state` (docs/15 §4.2): reader summary, default model view, the practice / background flags. */
export const mathChapterState = z
  .object({
    summary: bilingual.optional(),
    model: modelView.optional(),
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
  for (const s of data.lesson.steps) for (const t of s.tasks) out.push({ kind: 'task', id: t.id }, ...optionIds(t));
  for (const q of data.lesson.practice) out.push({ kind: 'question', id: q.id }, ...optionIds(q.task));
  return out;
}
