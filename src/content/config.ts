import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { topicSchema } from './schema/topic';
import { chapterSchema } from './schema/chapter';

const TOPICS_DIR = './src/content/topics';

/** `topics/<slug>/topic.yaml` -> entry id `<slug>`. */
const topics = defineCollection({
  loader: glob({
    pattern: '*/topic.yaml',
    base: TOPICS_DIR,
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: topicSchema,
});

/**
 * `topics/<slug>/chapters/<nn>-<id>.mdx` -> entry id `<slug>/<nn>-<id>`.
 * Use `chapterTopicSlug(entry)` (src/lib/content.ts) to get the topic slug.
 */
const chapters = defineCollection({
  loader: glob({
    pattern: '*/chapters/*.mdx',
    base: TOPICS_DIR,
    generateId: ({ entry }) => entry.replace(/\/chapters\//, '/').replace(/\.mdx$/, ''),
  }),
  schema: chapterSchema,
});

export const collections = { topics, chapters };
