/**
 * monsoon-and-weather: write each chapter's frontmatter from chapters.ts and keep its body.
 *
 *   pnpm tsx scripts/geo/monsoon-and-weather/build-chapters.ts [--check]
 *
 * The chapter state is the first beat (docs/50 §2): month, camera (from presets.json),
 * layers and highlight; summary = first caption unless the table gives one. With --check
 * nothing is written and the script fails if a file's frontmatter is out of date.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, LAYERS, type BeatRow, type ChapterRow } from './chapters';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TOPIC = join(ROOT, 'src', 'content', 'topics', 'monsoon-and-weather');

type Camera = { center: [number, number]; zoom: number; pitch: number; bearing: number };
const presets = new Map<string, Camera>(
  (JSON.parse(readFileSync(join(TOPIC, 'data', 'presets.json'), 'utf8')) as { presets: { id: string; camera: Camera }[] }).presets.map(
    (p) => [p.id, p.camera],
  ),
);

function camera(id: string): Camera {
  const c = presets.get(id);
  if (!c) throw new Error(`unknown preset ${id}`);
  return { center: [...c.center], zoom: c.zoom, pitch: c.pitch, bearing: c.bearing };
}

function beat(b: BeatRow) {
  return { month: b.month, camera: camera(b.preset), layers: LAYERS[b.layers], highlight: b.highlight, caption: b.caption };
}

export function frontmatter(ch: ChapterRow) {
  const first = ch.beats[0]!;
  const state: Record<string, unknown> = {
    month: first.month,
    camera: camera(first.preset),
    layers: LAYERS[first.layers],
    highlight: first.highlight,
    summary: ch.summary ?? first.caption,
    index: ch.index,
    beats: ch.beats.map(beat),
  };
  if (ch.note) state.note = ch.note;
  return {
    id: ch.id,
    order: ch.order,
    ...(ch.background ? { kind: 'background' } : {}),
    title: ch.title,
    sensitive: false,
    state,
  };
}

function body(text: string): string {
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('unterminated frontmatter');
  return text.slice(end + 5).replace(/^\n/, '');
}

function main() {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const ch of CHAPTERS) {
    const path = join(TOPIC, 'chapters', ch.file);
    const old = readFileSync(path, 'utf8');
    const next = `---\n${JSON.stringify(frontmatter(ch), null, 2)}\n---\n\n${body(old)}`;
    if (next === old) continue;
    stale++;
    if (check) console.error(`out of date: ${ch.file}`);
    else {
      writeFileSync(path, next);
      console.log(`wrote ${ch.file} (${ch.beats.length} beats)`);
    }
  }
  if (check && stale) process.exit(1);
  console.log(`${CHAPTERS.length} chapters, ${CHAPTERS.reduce((n, c) => n + c.beats.length, 0)} beats${check ? ', frontmatter current' : ''}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
