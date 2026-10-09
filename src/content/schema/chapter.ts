import { z } from 'zod';
import { bilingual, kebabId, level } from './common';

/** One quiz question at the end of a chapter. No scoring. */
export const quizItem = z
  .object({
    q: bilingual,
    options: z.array(bilingual).min(2).max(4),
    /** Zero-based index into `options`. */
    answer: z.number().int().nonnegative(),
    /** Shown after a wrong answer. */
    explain: bilingual.optional(),
  })
  .strict()
  .refine((item) => item.answer < item.options.length, {
    message: 'answer must index into options',
    path: ['answer'],
  });
export type QuizItem = z.output<typeof quizItem>;

/**
 * Chapter `state` is engine-specific. Core reads `layers`, `camera` and `theme`;
 * each engine validates the rest with its own `chapterStateSchema`.
 */
export const chapterState = z.record(z.string(), z.unknown());

/**
 * `chapter` (default): a story node with its own time. `background`: the
 * topic's prologue (at most one, `order: 0`): no timeline node, no number
 * (doc id `00`, the rail says "Background"), the reader opens on first entry.
 */
export const CHAPTER_KINDS = ['chapter', 'background'] as const;
export type ChapterKind = (typeof CHAPTER_KINDS)[number];

/** Frontmatter of `src/content/topics/<slug>/chapters/<nn>-<id>.mdx` (docs/02). */
export const chapterSchema = z
  .object({
    id: kebabId,
    order: z.number().int().nonnegative(),
    title: bilingual,
    /** Omitted = `chapter`. */
    kind: z.enum(CHAPTER_KINDS).optional(),
    /** Content-planning metadata (lowest school level the chapter targets); never rendered. */
    level: level.optional(),
    /** Optional metadata only; nothing is hidden or gated on it. */
    sensitive: z.boolean().default(false),
    state: chapterState.default({}),
    quiz: z.array(quizItem).default([]),
  })
  .strict();

export type ChapterFrontmatter = z.output<typeof chapterSchema>;
