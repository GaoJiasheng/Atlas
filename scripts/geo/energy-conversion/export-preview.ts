/** Offline geometry QA when a sandbox cannot start Chromium. No runtime assets. */
import { readFileSync, writeFileSync } from 'node:fs';
import { Matrix3, Matrix4, Vector3 } from 'three';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces, eachPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const raw = JSON.parse(readFileSync(process.argv[2] ?? 'src/content/topics/energy-conversion/data/parts.json', 'utf8'));
const ids = new Set(['bicycle-frame', 'front-wheel', 'rear-wheel', 'crank-pedals', 'bicycle-dynamo', 'dynamo-magnet', 'dynamo-coil', 'dynamo-wires', 'headlamp', 'kettle', 'kettle-water', 'kettle-element', 'speaker', 'speaker-cone', 'fan-blades', 'fan-motor']);
const each = new Set(raw.animations.filter((a: any) => a.each).map((a: any) => a.target));
const out = [];
for (const p of raw.parts) {
  if (!ids.has(p.id)) continue;
  const part = partSchema.parse(p);
  const pieces = each.has(p.id) ? eachPieces(part) : partPieces(part);
  const slots = partMaterialSlots(part);
  for (const piece of pieces) {
    const positions: number[][] = [], normals: number[][] = [], faces: number[][] = [];
    const pos = piece.geometry.getAttribute('position');
    const nor = piece.geometry.getAttribute('normal');
    const index = piece.geometry.index;
    for (const matrix of piece.matrices ?? [new Matrix4()]) {
      const at = part.primitive!.at;
      const m = new Matrix4().makeTranslation(at[0], at[1], at[2]).multiply(matrix);
      const normal = new Matrix3().getNormalMatrix(m);
      const offset = positions.length;
      for (let i = 0; i < pos.count; i++) {
        const v = new Vector3().fromBufferAttribute(pos, i).applyMatrix4(m);
        const n = new Vector3().fromBufferAttribute(nor, i).applyMatrix3(normal).normalize();
        positions.push([v.x, -v.z, v.y]); normals.push([n.x, -n.z, n.y]);
      }
      const count = index?.count ?? pos.count;
      for (let k = 0; k < count; k += 3) faces.push([0, 1, 2].map((j) => offset + (index?.getX(k + j) ?? k + j)));
    }
    out.push({ id: p.id, material: slots[piece.slot ?? 0], positions, normals, faces });
    piece.geometry.dispose();
  }
}
writeFileSync(process.argv[3] ?? '/tmp/energy-preview.json', JSON.stringify(out));
