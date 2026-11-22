/**
 * Narration coverage (scripts/audio/README.md): which clips the current
 * content needs (extracted afresh, published topics) and which of them exist
 * in the audio folder; clips there that no topic (drafts included) asks for
 * any more (stale: their text changed); and whether `audio/manifest.json` is
 * current. Audio is optional, so this never fails: missing clips are spoken by the device.
 *
 *   pnpm tsx scripts/audio/check.ts            # summary + topics below 100 %
 *   pnpm tsx scripts/audio/check.ts --topics   # every topic
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NARRATION_DIR } from '../../src/lib/narration-clips';
import { AUDIO_DIR, buildManifest, loadTopics, MANIFEST_FILE, SHARED_DIR, TOPICS_DIR } from './lib';
import { coverage } from './coverage';

const everyTopic = process.argv.includes('--topics');
const topics = loadTopics(TOPICS_DIR, SHARED_DIR);
const manifest = buildManifest(topics.filter((t) => t.meta.status === 'published'));
// A draft's clips (generated with extract --all) are not stale: only files no topic asks for are.
const everything = buildManifest(topics);
const onDisk = (locale: string) => {
  const dir = join(AUDIO_DIR, NARRATION_DIR, locale);
  return existsSync(dir) ? readdirSync(dir).map((f) => `${NARRATION_DIR}/${locale}/${f}`) : [];
};
const files = new Set([...onDisk('en'), ...onDisk('zh')]);
const report = coverage(manifest, files);
const stale = coverage(everything, files).stale;

const pct = (have: number, need: number) => (need ? `${((100 * have) / need).toFixed(1)} %` : '—');
console.log(`narration: ${existsSync(AUDIO_DIR) ? AUDIO_DIR : `${AUDIO_DIR} (absent: every beat is spoken by the device)`}`);
for (const locale of ['en', 'zh'] as const) {
  const r = report.locales[locale];
  console.log(`  ${locale}: ${r.present}/${r.needed} clip(s) present (${pct(r.present, r.needed)}), ${r.needed - r.present} missing`);
}
console.log(`  stale: ${stale.length} file(s) no longer asked for (text changed or topic removed)`);
const manifestFile = join(AUDIO_DIR, MANIFEST_FILE);
if (!existsSync(manifestFile)) console.log('  manifest: none (run pnpm tsx scripts/audio/extract.ts)');
else {
  const current = (JSON.parse(readFileSync(manifestFile, 'utf8')) as { clips: { file: string }[] }).clips.map((c) => c.file).sort().join('\n');
  // Current either as the default extraction (published) or as one with --all.
  const fresh = [manifest, everything].map((m) => m.clips.map((c) => c.file).join('\n'));
  console.log(fresh.includes(current) ? '  manifest: current' : '  manifest: out of date (run pnpm tsx scripts/audio/extract.ts, then the generator)');
}
for (const t of report.topics) {
  if (!everyTopic && t.present === t.needed) continue;
  console.log(`  ${t.topic.padEnd(28)} ${String(t.present).padStart(4)}/${String(t.needed).padEnd(4)} ${pct(t.present, t.needed)}`);
}
