/**
 * `pnpm tsx scripts/geo/living-things/tris.ts` — triangles and material slots
 * per part of the living-things bench (docs/38 §3.2 budget: all 32 specimens
 * in the case ≤ 85 draw calls, < 0.5 M triangles), built with the stage's own
 * geometry code.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const data = JSON.parse(readFileSync(join(import.meta.dirname, '../../../src/content/topics/living-things/data/parts.json'), 'utf8')) as { parts: unknown[] };
let total = 0;
let calls = 0;
const rows: [string, number, number][] = [];
for (const raw of data.parts) {
  const part = partSchema.parse(raw);
  let tris = 0;
  let lines = 0;
  for (const piece of partPieces(part as never)) {
    const g = piece.geometry;
    const n = g.index ? g.index.count : g.getAttribute('position').count;
    const copies = piece.matrices ? piece.matrices.length : 1;
    if ((piece as { lines?: boolean }).lines) lines += 1;
    else tris += (n / 3) * copies;
  }
  const slots = partMaterialSlots(part as never).length + lines;
  rows.push([part.id, Math.round(tris), slots]);
  total += tris;
  calls += slots;
}
rows.sort((a, b) => b[1] - a[1]);
for (const [id, t, s] of rows) console.log(`${id.padEnd(20)} ${String(t).padStart(7)} tris  ${s} calls`);
console.log(`total ${Math.round(total)} triangles, ${calls} calls (all parts, before visibility)`);
