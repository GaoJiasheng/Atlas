/** Export check-image colours from the authoritative shared CLI assignment.
 * First run: pnpm tsx scripts/geo/lib/colour-holders.ts --topic warring-states --write
 * This script verifies that assignment and never changes entities.json.
 */
import { readFileSync } from 'node:fs';
import { writeJson } from '../lib/common';
import { controlFile, entitiesFile } from '../../../src/engines/time-scene/schema';
import { colourConflicts, holderAdjacency, holderIndex } from '../../../src/engines/time-scene/lib/holders';
import { readJson, required } from './strict-input';
const dir = 'scripts/geo/warring-states', data = 'src/content/topics/warring-states/data';
const entities = entitiesFile.parse(readJson(`${data}/entities.json`));
const control = controlFile.parse(readJson(`${data}/control.json`));
const adjacency = holderAdjacency(control);
const assigned = new Map(entities.map((entity) => [entity.id, entity.color]));
const conflicts = colourConflicts(adjacency, (id) => assigned.get(id));
if (conflicts.length) throw new Error(`${conflicts.length} adjacency conflicts; run the shared colour-holders CLI with --write`);
const css = readFileSync('src/theme/tokens.css', 'utf8');
const palette: Record<string, string> = {};
const colors: Record<string, number> = {};
for (const entity of entities) {
  const color = holderIndex(entity.color);
  if (color === null) throw new Error(`${entity.id} needs a holder colour token`);
  colors[entity.id] = color;
  const match = required(new RegExp(`--holder-${color}:\\s*(#[0-9a-fA-F]+)`).exec(css) ?? undefined, `${entity.id} theme token`);
  palette[entity.id] = required(match[1], `${entity.id} theme colour`);
}
writeJson(`${dir}/check-colors.json`, palette, true);
writeJson(`${dir}/color-audit.json`, {
  method: 'Verified current entities.json assignment against the shared holderAdjacency/colourConflicts implementation; no entity colours changed',
  conflicts: conflicts.length,
  neighboringPairs: [...adjacency.values()].reduce((sum, neighbors) => sum + neighbors.size, 0) / 2,
  colors,
  adjacency: Object.fromEntries([...adjacency].map(([id, neighbors]) => [id, [...neighbors].sort()])),
}, true);
console.log(`${entities.length} entities; ${new Set(Object.values(colors)).size} holder tokens; adjacency conflicts ${conflicts.length}`);
