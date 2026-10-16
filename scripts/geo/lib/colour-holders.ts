/**
 * Holder colours for a many-state map (`topic.yaml` `colorBy: entity`; docs/06
 * "TimeScene" · 按国配色): find every pair of holders that share a frontier in
 * any keyframe of `control.json` and give each entity one of the eight
 * `--holder-N` tokens so that neighbours always differ.
 *
 *   pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug>           # print the assignment and the conflicts of entities.json
 *   pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug> --write   # write `color: token:holder-N` into entities.json
 *   pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug> --keep --write   # keep the colours already there when they fit
 *
 * Colouring: DSatur (src/engines/time-scene/lib/holders.ts), the least-used
 * free colour first, so the palette stays balanced. Exit code 1 when the
 * graph needs more than eight colours (the conflicts are listed) or, without
 * `--write`, when entities.json has neighbours of one colour.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { controlFile, entitiesFile } from '../../../src/engines/time-scene/schema';
import { assignHolderColours, colourConflicts, holderAdjacency, holderIndex, holderToken } from '../../../src/engines/time-scene/lib/holders';
import { ROOT, log, warn } from './common';

const { values } = parseArgs({ options: { topic: { type: 'string' }, write: { type: 'boolean', default: false }, keep: { type: 'boolean', default: false } } });
const slug = values.topic;
const dataDir = slug ? join(ROOT, 'src/content/topics', slug, 'data') : '';
if (!slug || !existsSync(join(dataDir, 'control.json')) || !existsSync(join(dataDir, 'entities.json'))) {
  process.stderr.write(`ERROR ${slug ? `src/content/topics/${slug}/data needs control.json and entities.json` : '--topic is required'}\nusage: pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug> [--keep] [--write]\n`);
  process.exit(2);
}
const entitiesPath = join(dataDir, 'entities.json');
const rawEntities = JSON.parse(readFileSync(entitiesPath, 'utf8')) as Record<string, unknown>[];
const entities = entitiesFile.parse(rawEntities);
const control = controlFile.parse(JSON.parse(readFileSync(join(dataDir, 'control.json'), 'utf8')));

const adj = holderAdjacency(control);
const pairs = [...adj].reduce((n, [, set]) => n + set.size, 0) / 2;
log(`${slug}: ${adj.size} holders, ${pairs} neighbouring pairs across ${control.keyframes.length} keyframes`);

const current = new Map(entities.map((e) => [e.id, e.color]));
const before = colourConflicts(adj, (id) => current.get(id));
const keep = new Map<string, number>();
if (values.keep) for (const e of entities) {
  const n = holderIndex(e.color);
  if (n !== null) keep.set(e.id, n);
}
const { colours, conflicts } = assignHolderColours(adj, { keep });

const name = new Map(entities.map((e) => [e.id, e.name.en]));
for (const [id, n] of [...colours].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))) {
  const neighbours = [...(adj.get(id) ?? [])].sort().join(', ');
  log(`  ${holderToken(n).padEnd(16)} ${id.padEnd(20)} ${(name.get(id) ?? '').padEnd(22)} neighbours: ${neighbours || '—'}`);
}
const unused = entities.filter((e) => !adj.has(e.id)).map((e) => e.id);
if (unused.length) log(`  not in any keyframe (colour unchanged): ${unused.join(', ')}`);
if (conflicts.length) warn(`more than eight colours needed: ${conflicts.map((p) => p.join(' / ')).join('; ')}`);

if (values.write) {
  const out = rawEntities.map((e) => {
    const n = colours.get(String(e.id));
    return n === undefined ? e : { ...e, color: holderToken(n) };
  });
  writeFileSync(entitiesPath, `${JSON.stringify(out, null, 2)}\n`);
  log(`wrote ${colours.size} colours to src/content/topics/${slug}/data/entities.json`);
} else if (before.length) {
  warn(`entities.json: neighbours with one colour: ${before.map((p) => p.join(' / ')).join('; ')} (run with --write)`);
} else {
  log('entities.json: no two neighbours share a colour');
}
process.exitCode = conflicts.length || (!values.write && before.length) ? 1 : 0;
