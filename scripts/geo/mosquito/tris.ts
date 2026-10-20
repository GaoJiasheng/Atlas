/** Triangle and material-slot count per part of the mosquito model (a budget check, docs/33 §3.4). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partSchema } from '../../../src/engines/space-scene/schema';

const data = JSON.parse(readFileSync(join(import.meta.dirname, '../../../src/content/topics/mosquito/data/parts.json'), 'utf8'));
let total = 0;
let calls = 0;
const rows: [string, number, number, number][] = [];
for (const raw of data.parts) {
  const p = partSchema.parse(raw);
  const pieces = partPieces(p);
  let tris = 0;
  for (const piece of pieces) {
    const g = piece.geometry;
    const n = g.index ? g.index.count / 3 : g.getAttribute('position').count / 3;
    tris += piece.lines ? 0 : n * (piece.matrices ? piece.matrices.length : 1);
  }
  const mult = p.bilateral ? 2 : 1;
  total += tris * mult;
  calls += pieces.length * mult;
  rows.push([p.id, Math.round(tris * mult), pieces.length * mult, partMaterialSlots(p).length]);
}
rows.sort((a, b) => b[1] - a[1]);
for (const r of rows) console.log(r[0].padEnd(20), String(r[1]).padStart(8), 'calls', r[2], 'slots', r[3]);
console.log('total', Math.round(total), 'calls', calls);
