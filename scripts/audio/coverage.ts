/**
 * Pure narration bookkeeping shared by the coverage check and the deploy
 * staging: which manifest clips exist among `files` (audio-folder-relative
 * paths), which files are stale, and each topic's availability index.
 */
import { clipPath, type NarrationIndex, type NarrationLocale } from '../../src/lib/narration-clips';
import type { Manifest } from './lib';

export interface Coverage {
  locales: Record<NarrationLocale, { needed: number; present: number }>;
  /** Per topic, distinct clips over both locales. */
  topics: { topic: string; needed: number; present: number }[];
  /** Files in the folder that no manifest clip names. */
  stale: string[];
}

export function coverage(manifest: Manifest, files: ReadonlySet<string>): Coverage {
  const locales = { en: { needed: 0, present: 0 }, zh: { needed: 0, present: 0 } };
  for (const c of manifest.clips) {
    locales[c.locale].needed++;
    if (files.has(c.file)) locales[c.locale].present++;
  }
  const perTopic = new Map<string, Set<string>>();
  for (const e of manifest.entries) {
    const set = perTopic.get(e.topic) ?? new Set<string>();
    set.add(clipPath(e.locale, e.hash));
    perTopic.set(e.topic, set);
  }
  const topics = [...perTopic].map(([topic, set]) => ({ topic, needed: set.size, present: [...set].filter((f) => files.has(f)).length }));
  const wanted = new Set(manifest.clips.map((c) => c.file));
  return { locales, topics, stale: [...files].filter((f) => !wanted.has(f)).sort() };
}

/** `narration/<slug>.json` for every topic in the manifest: the hashes whose files exist (empty lists when none do). */
export function indexes(manifest: Manifest, files: ReadonlySet<string>): Map<string, NarrationIndex> {
  const out = new Map<string, { en: Set<string>; zh: Set<string> }>();
  for (const e of manifest.entries) {
    const index = out.get(e.topic) ?? { en: new Set<string>(), zh: new Set<string>() };
    if (files.has(clipPath(e.locale, e.hash))) index[e.locale].add(e.hash);
    out.set(e.topic, index);
  }
  return new Map([...out].map(([topic, i]) => [topic, { version: 1 as const, en: [...i.en].sort(), zh: [...i.zh].sort() }]));
}
