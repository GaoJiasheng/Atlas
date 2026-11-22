/**
 * Deploy staging for the website (scripts/audio/README.md, docs/07): build
 * `dist-pages/` = `dist/` + the recorded narration, and upload that, so
 * `dist/` (which `npx cap sync ios` copies into the iPad app) never holds a
 * single clip.
 *
 *   pnpm build && pnpm tsx scripts/audio/stage.ts && pnpm dlx wrangler@4.148.0 pages deploy dist-pages --project-name atlas --branch main
 *
 * Files are hard-linked where the file system allows (copied otherwise).
 * Every topic with a presentation gets `narration/<slug>.json` listing the
 * clips present for its current text (empty lists without an audio folder),
 * so the page never asks for a file that is not there. Fails (exit 1) when
 * the upload would break a Cloudflare Pages limit: 20,000 files per
 * deployment, 25 MiB per file.
 */
import { copyFileSync, existsSync, linkSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { indexPath, NARRATION_DIR } from '../../src/lib/narration-clips';
import { AUDIO_DIR, buildManifest, loadTopics, SHARED_DIR, TOPICS_DIR } from './lib';
import { indexes } from './coverage';

export const PAGES_MAX_FILES = 20_000;
export const PAGES_MAX_FILE_BYTES = 25 * 1024 * 1024;

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name);
  return resolve(i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback);
};
const DIST = arg('--dist', 'dist');
const OUT = arg('--out', 'dist-pages');

function place(from: string, to: string): void {
  mkdirSync(dirname(to), { recursive: true });
  try {
    linkSync(from, to);
  } catch {
    copyFileSync(from, to);
  }
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`stage: ${DIST} has no build (run pnpm build first)`);
  process.exit(1);
}
if (existsSync(join(DIST, NARRATION_DIR))) {
  console.error(`stage: ${join(DIST, NARRATION_DIR)} exists; narration must never be in dist/ (the iPad app copies it)`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
const site = walk(DIST);
for (const file of site) place(file, join(OUT, relative(DIST, file)));

// Every topic, drafts included (they are built and reachable): their indexes are simply empty until clips exist.
const manifest = buildManifest(loadTopics(TOPICS_DIR, SHARED_DIR));
const present = new Set(manifest.clips.filter((c) => existsSync(join(AUDIO_DIR, c.file))).map((c) => c.file));
const tooBig: string[] = [];
let bytes = 0;
for (const file of [...present]) {
  const from = join(AUDIO_DIR, file);
  const size = statSync(from).size;
  if (size > PAGES_MAX_FILE_BYTES) {
    tooBig.push(`${file} (${(size / 1024 / 1024).toFixed(1)} MiB)`);
    present.delete(file);
    continue;
  }
  bytes += size;
  place(from, join(OUT, file));
}
const index = indexes(manifest, present);
for (const [topic, value] of index) {
  const path = join(OUT, indexPath(topic));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value));
}

const total = site.length + present.size + index.size;
console.log(`stage: ${OUT}`);
console.log(`  site ${site.length} file(s) + narration ${present.size} clip(s) (${(bytes / 1024 / 1024).toFixed(1)} MiB) + ${index.size} index(es) = ${total} / ${PAGES_MAX_FILES.toLocaleString('en')} files`);
if (!existsSync(AUDIO_DIR)) console.log(`  no audio folder at ${AUDIO_DIR}: indexes are empty, every beat is spoken by the device`);
if (tooBig.length) console.error(`  over the 25 MiB per-file limit, left out: ${tooBig.join(', ')}`);
if (total > PAGES_MAX_FILES) {
  console.error(
    `  over the Cloudflare Pages limit of ${PAGES_MAX_FILES} files per deployment: serve the clips from an R2 bucket on a custom subdomain instead (docs/02 exception, scripts/audio/README.md)`,
  );
  process.exit(1);
}
if (tooBig.length) process.exit(1);
