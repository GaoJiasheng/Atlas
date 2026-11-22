/**
 * Caption extractor (scripts/audio/README.md): write `audio/manifest.json`,
 * every clip VOICE can say for the published topics, both locales, with the
 * exact text the page speaks and the file each clip goes in.
 *
 *   pnpm tsx scripts/audio/extract.ts                 # published topics
 *   pnpm tsx scripts/audio/extract.ts --all           # drafts too
 *   pnpm tsx scripts/audio/extract.ts --topic fractions --topic ww2
 *
 * `ATLAS_AUDIO_DIR` writes the manifest elsewhere (default `audio/`, gitignored).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AUDIO_DIR, buildManifest, loadTopics, MANIFEST_FILE, SHARED_DIR, TOPICS_DIR, totals } from './lib';

const args = process.argv.slice(2);
const all = args.includes('--all');
const only = args.flatMap((a, i) => (a === '--topic' && args[i + 1] ? [args[i + 1]!] : []));

const topics = loadTopics(TOPICS_DIR, SHARED_DIR).filter((t) => (only.length ? only.includes(t.slug) : all || t.meta.status === 'published'));
const missing = only.filter((slug) => !topics.some((t) => t.slug === slug));
if (missing.length) {
  console.error(`unknown topic(s): ${missing.join(', ')}`);
  process.exit(1);
}
const manifest = buildManifest(topics);
mkdirSync(AUDIO_DIR, { recursive: true });
writeFileSync(join(AUDIO_DIR, MANIFEST_FILE), `${JSON.stringify(manifest, null, 1)}\n`);

const sum = totals(manifest);
const narrated = new Set(manifest.entries.map((e) => e.topic)).size;
console.log(`extract: ${topics.length} topic(s), ${narrated} with a presentation → ${join(AUDIO_DIR, MANIFEST_FILE)}`);
for (const locale of ['en', 'zh'] as const)
  console.log(`  ${locale}: ${sum[locale].clips} clip(s) (${sum[locale].entries} entries), ${sum[locale].chars.toLocaleString('en')} characters`);
console.log(`  total: ${manifest.clips.length} clip file(s), ${(sum.en.chars + sum.zh.chars).toLocaleString('en')} characters`);
