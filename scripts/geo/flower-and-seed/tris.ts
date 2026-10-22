/**
 * `pnpm tsx scripts/geo/flower-and-seed/tris.ts [ids]` — triangles and draw
 * calls (material slots + vein lines) per part of the flower-and-seed table
 * (docs/41 §3.4 budget: hero ≤ 80 calls, each chapter ≤ 45, < 0.35 M
 * triangles), built with the stage's own geometry code. With a comma list of
 * part ids, only those; a group id prefixed `group:` sums one group.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const file = process.env.PARTS ?? join(import.meta.dirname, '../../../src/content/topics/flower-and-seed/data/parts.json');
const data = JSON.parse(readFileSync(file, 'utf8')) as { parts: { id: string; group?: string }[] };
const args = (process.argv[2] ?? '').split(',').filter(Boolean);
const pick = (p: { id: string; group?: string }) =>
  args.length === 0 || args.includes(p.id) || args.some((a) => a.startsWith('group:') && a.slice(6) === (p.group ?? 'context'));
let total = 0;
let calls = 0;
const byGroup = new Map<string, [number, number]>();
for (const raw of data.parts) {
  if (!pick(raw)) continue;
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
  console.log(`${part.id.padEnd(22)} ${String(Math.round(tris)).padStart(7)} tris  ${slots} calls`);
  total += tris;
  calls += slots;
  const g = raw.group ?? 'context';
  const [t0, c0] = byGroup.get(g) ?? [0, 0];
  byGroup.set(g, [t0 + tris, c0 + slots]);
}
for (const [g, [t, c]] of byGroup) console.log(`  group ${g.padEnd(14)} ${String(Math.round(t)).padStart(7)} tris  ${c} calls`);
console.log(`total ${Math.round(total)} triangles, ${calls} calls (before visibility)`);
