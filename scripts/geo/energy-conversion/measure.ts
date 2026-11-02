/** Count generated triangles once per instance, excluding shadows, flows and ground. */
import { readFileSync } from 'node:fs';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partPieces, eachPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const filename = process.argv[2] ?? 'src/content/topics/energy-conversion/data/parts.json';
const raw = JSON.parse(readFileSync(filename, 'utf8'));
const each = new Set(raw.animations.filter((a: any) => a.each).map((a: any) => a.target));
const ids = new Set(['bicycle-frame', 'front-wheel', 'rear-wheel', 'crank-pedals', 'bicycle-dynamo', 'dynamo-magnet', 'dynamo-coil', 'dynamo-wires', 'headlamp']);
let all = 0, bike = 0, slots = 0, bikeSlots = 0;
for (const p of raw.parts) {
  const part = partSchema.parse(p);
  const pieces = each.has(p.id) ? eachPieces(part) : partPieces(part);
  const tris = pieces.reduce((n, piece) => n + (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1), 0);
  if (ids.has(p.id)) { bike += tris; bikeSlots += pieces.length; console.log(p.id, tris, pieces.length); }
  all += tris; slots += pieces.length;
  pieces.forEach((piece) => piece.geometry.dispose());
}
console.log(JSON.stringify({ parts: raw.parts.length, selectable: raw.parts.filter((p: any) => !p.context).length, bicycleParts: ids.size, allTriangles: all, bicycleTriangles: bike, allPieces: slots, bicyclePieces: bikeSlots }));
