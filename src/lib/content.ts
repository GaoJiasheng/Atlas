/**
 * Build-time content access (Astro server code only: uses astro:content and
 * import.meta.glob). Never import from client components.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { parseEngineData } from '../engines/schemas';
import { resolveChapterTargets } from '../engines/core/store';
import type { Chapter, SceneSnapshot, Theme } from '../engines/core/types';

export type TopicEntry = CollectionEntry<'topics'>;
export type ChapterEntry = CollectionEntry<'chapters'>;

/** `sample-time/01-intro` -> `sample-time`. */
export function chapterTopicSlug(entry: Pick<ChapterEntry, 'id'>): string {
  return entry.id.split('/')[0] ?? '';
}

const STATUS_ORDER = { published: 0, ready: 1, draft: 2 } as const;

/** All topics, published first, then by English title. */
export async function getTopics(): Promise<TopicEntry[]> {
  const topics = await getCollection('topics');
  return topics.sort(
    (a, b) =>
      STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status] || a.data.title.en.localeCompare(b.data.title.en),
  );
}

/** Chapters of one topic, sorted by `order`. */
export async function getTopicChapters(slug: string): Promise<ChapterEntry[]> {
  const chapters = await getCollection('chapters', (entry) => chapterTopicSlug(entry) === slug);
  return chapters.sort((a, b) => a.data.order - b.data.order);
}

/** Chapter counts per topic slug (for the index). */
export async function getChapterCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const entry of await getCollection('chapters')) {
    const slug = chapterTopicSlug(entry);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

// Every topic's data files, read at build time. Keys: /src/content/topics/<slug>/data/<name>.json
const DATA_FILES = import.meta.glob<unknown>('/src/content/topics/*/data/*.json', {
  eager: true,
  import: 'default',
});

/** Raw `data/*.json` of a topic keyed by file base name. */
export function rawTopicData(slug: string): Record<string, unknown> {
  const prefix = `/src/content/topics/${slug}/data/`;
  const out: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(DATA_FILES)) {
    if (!path.startsWith(prefix)) continue;
    const name = path.slice(prefix.length).replace(/\.json$/, '');
    out[name] = value;
  }
  return out;
}

/** Parsed engine data for a topic (throws on invalid data, failing the build). */
export function topicEngineData(topic: TopicEntry): unknown {
  return parseEngineData(topic.data.engine, topic.data.stage, rawTopicData(topic.id), `topic "${topic.id}"`);
}

/**
 * Theme each chapter resolves to (cumulative, same rule as the store), for
 * the pre-paint script so deep links into a cinema chapter don't flash.
 */
export function chapterThemeMap(chapters: readonly Chapter[]): Record<string, Theme> {
  const defaults: SceneSnapshot = { chapter: null, layers: [], camera: null, theme: undefined };
  const out: Record<string, Theme> = {};
  for (const [id, target] of resolveChapterTargets(chapters, defaults)) {
    if (target.theme) out[id] = target.theme;
  }
  return out;
}
