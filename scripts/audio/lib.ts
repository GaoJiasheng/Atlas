/**
 * Recorded narration, build side (scripts/audio/README.md): read every topic
 * the way the site build does, list exactly what VOICE says for each beat in
 * each locale, and name each clip. The spoken text comes from the runtime's
 * own functions (`buildBeats`, the engines' `beatsOf` / `captionOf`,
 * `chapterAnnouncement`, `narrationParts`), so a manifest entry is the string
 * the page speaks, character for character.
 *
 * Clips are keyed per chapter for the announcement (`chapter` = the number in
 * words or "Background", `title`) and per beat for the caption: whichever beat
 * opens a chapter (its first, or one jumped to) says the same announcement.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { chapterSchema } from '../../src/content/schema/chapter';
import { topicSchema, type TopicMeta } from '../../src/content/schema/topic';
import { withSharedFitness } from '../../src/content/schema/fitness';
import { parseEngineData } from '../../src/engines/schemas';
import { buildBeats, chapterBeats, plainCaption, type Beat, type BeatBase } from '../../src/engines/core/presentation/beats';
import { chapterAnnouncement, narrationParts } from '../../src/engines/core/presentation/narration';
import { lessonBeatsOf, lessonCaptionOf } from '../../src/engines/math-scene/lib/beats';
import type { MathSceneData } from '../../src/engines/math-scene/schema';
import type { Chapter, Locale } from '../../src/engines/core/types';
import { clipHash, clipPath, NARRATION_FORMAT, NARRATION_VOICES, type NarrationLocale } from '../../src/lib/narration-clips';
import type { SpeechPart } from '../../src/lib/speech';
import { readSharedFitness } from '../lib/shared-data';

export const LOCALES: readonly NarrationLocale[] = ['en', 'zh'];

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const TOPICS_DIR = join(ROOT, 'src/content/topics');
export const SHARED_DIR = join(ROOT, 'src/content/shared');
/** The generated clips and the manifest: gitignored, never in the build output or the app (`ATLAS_AUDIO_DIR` points elsewhere). */
export const AUDIO_DIR = process.env.ATLAS_AUDIO_DIR ? resolve(process.env.ATLAS_AUDIO_DIR) : join(ROOT, 'audio');
export const MANIFEST_FILE = 'manifest.json';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface LoadedTopic {
  slug: string;
  meta: TopicMeta;
  /** Sorted by `order`, as the page hands them to the engine. */
  chapters: Chapter[];
  /** Parsed engine data, read only where the beats come from it (MathScene's lesson). */
  data: unknown;
}

/** One topic folder (`src/content/topics/<slug>`), parsed with the site's schemas; throws on content the build would reject. */
export function loadTopic(dir: string, sharedDir: string): LoadedTopic {
  const slug = basename(dir);
  const meta = topicSchema.parse(parseYaml(readFileSync(join(dir, 'topic.yaml'), 'utf8')));
  const chaptersDir = join(dir, 'chapters');
  const chapters = readdirSync(chaptersDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const front = FRONTMATTER.exec(readFileSync(join(chaptersDir, f), 'utf8'));
      if (!front) throw new Error(`${slug}/chapters/${f}: no frontmatter`);
      return chapterSchema.parse(parseYaml(front[1] ?? '')) as Chapter;
    })
    .sort((a, b) => (a as { order: number }).order - (b as { order: number }).order);
  let data: unknown = null;
  if (meta.engine === 'math-scene') {
    const raw: Record<string, unknown> = {};
    const dataDir = join(dir, 'data');
    for (const name of readdirSync(dataDir).filter((f) => f.endsWith('.json'))) raw[name.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
    data = parseEngineData(meta.engine, meta.stage, withSharedFitness(raw, readSharedFitness(sharedDir)), `topic "${slug}"`, meta.temporalMode);
  }
  return { slug, meta, chapters, data };
}

/** Every topic folder under `topicsDir`, sorted by slug. */
export function loadTopics(topicsDir: string, sharedDir: string): LoadedTopic[] {
  return readdirSync(topicsDir)
    .sort()
    .map((name) => join(topicsDir, name))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'topic.yaml')))
    .map((d) => loadTopic(d, sharedDir));
}

/** The engine adapter's `beatsOf` / `captionOf` for a topic; `null` for an engine without a presentation (simulation). */
function narrationSource(topic: LoadedTopic): { beatsOf: (c: Chapter) => readonly BeatBase[] | undefined; captionOf: (b: Beat<BeatBase>, l: Locale) => string } | null {
  switch (topic.meta.engine) {
    case 'time-scene':
    case 'space-scene':
      return { beatsOf: (c) => chapterBeats(c), captionOf: plainCaption };
    case 'math-scene':
      return { beatsOf: lessonBeatsOf((topic.data as MathSceneData).lesson, topic.chapters), captionOf: lessonCaptionOf };
    default:
      return null;
  }
}

export interface ManifestEntry {
  /** Stable key: `<topic>/<locale>/<kind>/<chapter>` (+ `/<beat>` for a caption). */
  key: string;
  topic: string;
  locale: NarrationLocale;
  kind: SpeechPart;
  chapter: string;
  /** The beat's index in its chapter (0-based); `null` for the chapter announcement. */
  beat: number | null;
  hash: string;
}

export interface ManifestClip {
  hash: string;
  locale: NarrationLocale;
  voice: string;
  rate: string;
  /** Where the generator writes the clip, relative to the audio folder (and where the site serves it). */
  file: string;
  text: string;
  /** Characters (code points) of `text`. */
  chars: number;
}

export interface Manifest {
  version: 1;
  format: string;
  voices: typeof NARRATION_VOICES;
  /** One per distinct clip file (the same text in two topics is one clip): what the generator reads. */
  clips: ManifestClip[];
  /** One per (topic, locale, kind, chapter, beat): what the indexes and the coverage check read. */
  entries: ManifestEntry[];
}

/** What VOICE says in a topic: one entry per announcement part and per beat caption, both locales. */
export function topicEntries(topic: LoadedTopic): (Omit<ManifestEntry, 'hash' | 'key'> & { text: string })[] {
  const source = narrationSource(topic);
  if (!source) return [];
  const beats = buildBeats(topic.chapters, source.beatsOf);
  const out: (Omit<ManifestEntry, 'hash' | 'key'> & { text: string })[] = [];
  for (const locale of LOCALES) {
    topic.chapters.forEach((chapter, ci) => {
      const own = beats.filter((b) => b.chapterIndex === ci);
      const announcement = chapterAnnouncement(topic.chapters, ci, locale);
      let announced = false;
      for (const b of own) {
        // Announced on entering the chapter at any beat; the announcement is the same whichever beat it is.
        const parts = narrationParts(announcement, source.captionOf(b, locale), true);
        for (const p of parts) {
          if (p.part !== 'caption' && announced) continue;
          out.push({ topic: topic.slug, locale, kind: p.part, chapter: chapter.id, beat: p.part === 'caption' ? b.index : null, text: p.text });
        }
        if (parts.length) announced = true;
      }
    });
  }
  return out;
}

const keyOf = (e: Omit<ManifestEntry, 'hash' | 'key'>) => [e.topic, e.locale, e.kind, e.chapter, ...(e.beat === null ? [] : [e.beat])].join('/');

/** The manifest of `topics`: deterministic (same content, same bytes). */
export function buildManifest(topics: readonly LoadedTopic[]): Manifest {
  const entries: ManifestEntry[] = [];
  const clips = new Map<string, ManifestClip>();
  for (const topic of topics) {
    for (const e of topicEntries(topic)) {
      const hash = clipHash(e.locale, e.text);
      const { text, ...rest } = e;
      entries.push({ key: keyOf(e), ...rest, hash });
      const file = clipPath(e.locale, hash);
      if (!clips.has(file)) clips.set(file, { hash, locale: e.locale, voice: NARRATION_VOICES[e.locale].voice, rate: NARRATION_VOICES[e.locale].rate, file, text, chars: [...text].length });
    }
  }
  return {
    version: 1,
    format: NARRATION_FORMAT,
    voices: NARRATION_VOICES,
    clips: [...clips.values()].sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0)),
    entries,
  };
}

/** Clip and character totals per locale (distinct clips, i.e. what generation costs). */
export function totals(manifest: Manifest): Record<NarrationLocale, { clips: number; entries: number; chars: number }> {
  const out = { en: { clips: 0, entries: 0, chars: 0 }, zh: { clips: 0, entries: 0, chars: 0 } };
  for (const c of manifest.clips) {
    out[c.locale].clips++;
    out[c.locale].chars += c.chars;
  }
  for (const e of manifest.entries) out[e.locale].entries++;
  return out;
}
