/** CPU geometry census, including every repeat, excluding renderer shadow passes. */
import { readFileSync } from 'node:fs';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const file = process.argv[2] ?? 'src/content/topics/steam-engine/data/parts.json';
const data = partsFile.parse(JSON.parse(readFileSync(file, 'utf8')));
let triangles = 0, pieces = 0;
const groups: Record<string, number> = {};
for (const part of data.parts) {
  let count = 0;
  for (const piece of partPieces(part)) {
    count += (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1);
    pieces++;
    piece.geometry.dispose();
  }
  groups[part.group ?? 'context'] = (groups[part.group ?? 'context'] ?? 0) + count;
  triangles += count;
}
console.log(JSON.stringify({ file, parts: data.parts.length, selectable: data.parts.filter(p => !p.context).length, triangles, materialPieces: pieces, groups }, null, 2));
