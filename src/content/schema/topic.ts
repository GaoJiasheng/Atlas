import { z } from 'zod';
import { bilingual, kebabId, level, theme } from './common';

/** The six fixed top-level categories, in display order. */
export const SUBJECTS = [
  'science',
  'math',
  'history',
  'geography',
  'biology',
  'computer',
] as const;
export const subject = z.enum(SUBJECTS);
export type Subject = z.infer<typeof subject>;

export const ENGINES = ['time-scene', 'space-scene', 'simulation'] as const;
export const engineId = z.enum(ENGINES);
export type EngineId = z.infer<typeof engineId>;

/** Stages each engine knows how to render (docs/03). */
export const ENGINE_STAGES = {
  'time-scene': ['geo', 'diagram'],
  'space-scene': ['model3d', 'layer2d'],
  simulation: ['chart', 'diagram'],
} as const satisfies Record<EngineId, readonly string[]>;

/** Bloc names a topic may override; each needs both languages (the site-wide `time.bloc.*` strings are the fallback). */
export const BLOC_LABEL_KEYS = ['axis', 'allied', 'neutral', 'out'] as const;
export const blocLabels = z
  .object({
    axis: bilingual.optional(),
    allied: bilingual.optional(),
    neutral: bilingual.optional(),
    out: bilingual.optional(),
  })
  .strict();
export type BlocLabels = z.output<typeof blocLabels>;

/** `src/content/topics/<slug>/topic.yaml` (docs/02). */
export const topicSchema = z
  .object({
    id: kebabId,
    title: bilingual,
    subtitle: bilingual,
    subject,
    /** Content-planning metadata (school levels the topic targets); never rendered. */
    levels: z.array(level).min(1).optional(),
    /** Planning metadata (e.g. `beyond-syllabus`, `singapore`); never rendered. */
    tags: z.array(kebabId).optional(),
    moe: z.array(z.string().min(1)).default([]),
    mode: z.enum(['time', 'space', 'both']),
    engine: engineId,
    stage: z.string().min(1),
    theme: theme.default('paper'),
    /** Optional metadata only; nothing is hidden or gated on it. */
    sensitivity: z.enum(['open', 'guarded']).default('open'),
    status: z.enum(['draft', 'ready', 'published']).default('draft'),
    /** Path relative to the topic directory, e.g. `./cover.jpg`. */
    cover: z.string().min(1).optional(),
    /**
     * TimeScene: per-topic names of the engine's blocs (legend, entity inspector, leader notes),
     * overriding the site-wide `time.bloc.*` strings. `out` = "no longer at war".
     */
    blocLabels: blocLabels.optional(),
  })
  .strict()
  .superRefine((topic, ctx) => {
    const stages: readonly string[] = ENGINE_STAGES[topic.engine];
    if (!stages.includes(topic.stage)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stage'],
        message: `engine "${topic.engine}" has no stage "${topic.stage}" (expected ${stages.join(' | ')})`,
      });
    }
  });

export type TopicInput = z.input<typeof topicSchema>;
export type TopicMeta = z.output<typeof topicSchema>;
