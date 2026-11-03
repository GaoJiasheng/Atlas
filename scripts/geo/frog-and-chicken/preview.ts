/** Offline CPU diagnostic of the actual shipped geometry, without a browser.
 * pnpm tsx scripts/geo/frog-and-chicken/preview.ts
 *   --input /tmp/frog-and-chicken-before.json --out /tmp/frog-chicken-before
 * Add --counts-only to audit inventory and authored visibility without images.
 * Smooth vertex lighting and a perspective-correct z-buffer; no PBR, shadows,
 * transparency, stage UI, or runtime performance claims are implied.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';
import { NodeIO, type Accessor } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Box3, BufferAttribute, BufferGeometry, Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const root = resolve(import.meta.dirname, '../../..');
const args = process.argv.slice(2);
const arg = (name: string, fallback: string) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]!; };
const input = resolve(arg('--input', resolve(root, 'src/content/topics/frog-and-chicken/data/parts.json')));
const output = resolve(arg('--out', '/tmp/frog-and-chicken-previews'));
const width = Number(arg('--width', '1200')), height = Number(arg('--height', '1000'));
if (![width, height].every(n => Number.isInteger(n) && n >= 320 && n <= 2400)) throw new Error('Preview sizes must be integers between 320 and 2400');
const decoded=(a:Accessor):Float32Array=>{
  const data=a.getArray()!;
  if(!a.getNormalized())return new Float32Array(data);
  const type=a.getComponentType(),limit=type===5120?127:type===5121?255:type===5122?32767:type===5123?65535:1;
  return Float32Array.from(data,v=>Math.max(type===5120||type===5122?-1:0,v/limit));
};
const file = partsFile.parse(JSON.parse(readFileSync(input, 'utf8')));
mkdirSync(output, { recursive: true });
const tokens = new Map<string, string>();
for (const m of readFileSync(resolve(root, 'src/theme/tokens.css'), 'utf8').matchAll(/--([\w-]+):\s*([^;]+);/g)) if (!tokens.has(m[1]!)) tokens.set(m[1]!, m[2]!.trim());
type RGB = [number, number, number];
function rgb(ref: string, depth = 0): RGB {
  if (depth > 8) throw new Error(`Circular color: ${ref}`);
  if (ref.startsWith('token:')) return rgb(tokens.get(ref.slice(6)) ?? '#898277', depth + 1);
  const alias = /^var\(--([\w-]+)\)$/.exec(ref);
  if (alias) return rgb(tokens.get(alias[1]!) ?? '#898277', depth + 1);
  if (!/^#[a-f\d]{6}$/i.test(ref)) return [137, 130, 119];
  return [1, 3, 5].map(i => parseInt(ref.slice(i, i + 2), 16)) as RGB;
}
type Shape = { geometry: BufferGeometry; matrix: Matrix4; color: RGB };
const geometry = new Map<string, Shape[]>();
const glb = file.model ? await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(resolve(root, `public${file.model}`)) : null;
for (const part of file.parts) {
  const shapes: Shape[] = [];
  if (part.mesh) {
    const target = glb?.getRoot().listNodes().find(n => n.getName() === part.mesh);
    if (!target) throw new Error(`GLB node missing: ${part.mesh}`);
    let meshNode = target.getMesh() ? target : null;
    target.traverse(n => { if (!meshNode && n.getMesh()) meshNode = n; });
    if (!meshNode) throw new Error(`GLB mesh missing: ${part.mesh}`);
    // SpaceScene draws the first Mesh under this node, with its world matrix
    // and the part material (rather than the authored GLB materials).
    for (const primitive of meshNode.getMesh()!.listPrimitives()) {
      const position = primitive.getAttribute('POSITION')!;
      const normal = primitive.getAttribute('NORMAL');
      const g = new BufferGeometry().setAttribute('position', new BufferAttribute(decoded(position), 3));
      if (normal) g.setAttribute('normal', new BufferAttribute(decoded(normal), 3));
      else g.computeVertexNormals();
      const indices = primitive.getIndices();
      if (indices) g.setIndex(new BufferAttribute(new Uint32Array(indices.getArray()!), 1));
      const material = part.material ?? { color: 'tissue', tint: '#898277' };
      shapes.push({ geometry: g, matrix: new Matrix4().fromArray(meshNode.getWorldMatrix()), color: rgb(material.tint ?? material.color) });
    }
  }
  if (part.primitive && !part.mesh) {
    const slots = partMaterialSlots(part);
    for (const piece of partPieces(part)) {
      if (piece.lines) { piece.geometry.dispose(); continue; }
      const slot = slots[piece.slot ?? 0]!;
      for (const instance of piece.matrices ?? [new Matrix4()]) shapes.push({ geometry: piece.geometry, matrix: new Matrix4().makeTranslation(...part.primitive.at).multiply(instance), color: rgb(slot.tint ?? slot.color) });
    }
  }
  geometry.set(part.id, shapes);
}
const triangleCounts = Object.fromEntries([...geometry].map(([id, shapes]) => [id, shapes.reduce((sum, s) => sum + (s.geometry.index?.count ?? s.geometry.getAttribute('position').count) / 3, 0)]));
const totalTriangles = Object.values(triangleCounts).reduce((a, b) => a + b, 0);
const baseline = '/tmp/frog-and-chicken-before.json';
type VisibilityState = { layers?: string[]; hide?: string[]; beats?: VisibilityState[] };
const chapterDirectory = resolve(root, 'src/content/topics/frog-and-chicken/chapters');
const visibleStates = readdirSync(chapterDirectory).filter(n => n.endsWith('.mdx')).flatMap(name => {
  const chapter = parseYaml(readFileSync(resolve(chapterDirectory, name), 'utf8').split('---')[1]!) as { state?: VisibilityState };
  const base = chapter.state ?? {};
  return [base, ...(base.beats ?? []).map(beat => ({ ...base, ...beat }))].map((state, index) => {
    const layers = state.layers ?? file.groups.map(g => g.id), hide = state.hide ?? [];
    const ids = file.parts.filter(p => (p.group === undefined || layers.includes(p.group)) && !hide.includes(p.id)).map(p => p.id);
    return { chapter: name.replace('.mdx', ''), state: index === 0 ? 'entry' : `beat-${index - 1}`, triangles: ids.reduce((n, id) => n + triangleCounts[id]!, 0), ids };
  });
});
const maxVisible = visibleStates.reduce((a, b) => b.triangles > a.triangles ? b : a);
const report = { input, totalTriangles, budget: 350000, withinBudget: maxVisible.triangles <= 350000, inventoryWithinBudget: totalTriangles <= 350000, maxAuthoredVisibleTriangles: maxVisible.triangles, maxAuthoredVisibleState: `${maxVisible.chapter}/${maxVisible.state}`, visibilityMethod: 'Conservative chapter and beat layers/hide; counts full geometry even when off-camera, occluded, transparent, or hidden by simulation. No runtime draw-pass multiplier.', authoredStates: visibleStates, perPart: triangleCounts, baselineAvailable: existsSync(baseline) };
writeFileSync(resolve(output, 'triangles.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, authoredStates: `${visibleStates.length} states (see triangles.json)` }));

type Shot = { name: string; ids: string[]; eye: [number, number, number]; crop?: [number, number, number, number, number, number]; open?: boolean };
const shots: Shot[] = [
  {name:'comparison-frog-row',ids:['compare-frog'],eye:[0,.7,1]},
  {name:'comparison-chicken-row',ids:['compare-chicken'],eye:[0,.35,1]},
  {name:'comparison-all',ids:['compare-frog','compare-chicken','compare-mosquito','compare-plant'],eye:[0,1,1]},
  { name: 'hen-side', ids: ['chicken-adult'], eye: [0, .20, 1] },
  { name: 'hen-quarter', ids: ['chicken-adult'], eye: [-.9, .45, 1] },
  { name: 'hen-rear', ids: ['chicken-adult'], eye: [1, .4, -.8] },
  { name: 'hen-head', ids: ['chicken-adult'], eye: [-.6, .15, 1], crop: [0, .58, 0, .43, 1, 1] },
  { name: 'hen-feet', ids: ['chicken-adult'], eye: [-.65, .8, 1], crop: [.25, 0, 0, .80, .30, 1] },
  { name: 'chick-quarter', ids: ['chicken-chick'], eye: [-.8, .35, 1] },
  { name: 'frog-quarter', ids: ['frog-adult'], eye: [-.75, .9, 1] },
  { name: 'frog-dorsal', ids: ['frog-adult'], eye: [0, 1, .02] },
  { name: 'frog-foot', ids: ['frog-adult'], eye: [0, 1, .22], crop: [.47, 0, .48, 1, .4, 1] },
  { name: 'froglet-quarter', ids: ['frog-froglet'], eye: [-.75, .9, 1] },
  { name: 'tadpole-side', ids: ['frog-tadpole'], eye: [0, .08, 1] },
  { name: 'tadpole-dorsal', ids: ['frog-tadpole'], eye: [0, 1, .03] },
  { name: 'hind-leg-stage', ids: ['frog-hind-legs'], eye: [0, 1, .8] },
  { name: 'jelly-eggs', ids: ['frog-eggs'], eye: [-.4, .7, 1] },
  { name: 'egg-closed', ids: ['chicken-egg', 'egg-shell-window'], eye: [-.4, .2, 1] },
  { name: 'egg-open', ids: ['chicken-egg', 'egg-shell-window', 'egg-yolk', 'egg-white', 'egg-embryo'], eye: [.7, .55, 1], open: true },
];
const key = new Vector3(-.45, .8, .9).normalize(), fill = new Vector3(.8, .35, -.4).normalize();
const point = new Vector3(), normal = new Vector3(), projected = new Vector3();
const footer = 44;
for (const shot of (args.includes('--counts-only') ? [] : shots.filter(s => !args.includes('--shot') || s.name === arg('--shot', '')))) {
  const selected = shot.ids.flatMap(id => (geometry.get(id) ?? []).map(s => ({ ...s, id })));
  const box = new Box3();
  for (const s of selected) {
    s.geometry.computeBoundingBox();
    const matrix = s.matrix.clone();
    if (shot.open && s.id === 'egg-shell-window') matrix.premultiply(new Matrix4().makeTranslation(.8, .25, -.41));
    box.union(s.geometry.boundingBox!.clone().applyMatrix4(matrix));
  }
  if (box.isEmpty()) continue;
  if (shot.crop) { const min = box.min.clone(), span = box.getSize(new Vector3()); box.min.set(min.x + span.x * shot.crop[0], min.y + span.y * shot.crop[1], min.z + span.z * shot.crop[2]); box.max.set(min.x + span.x * shot.crop[3], min.y + span.y * shot.crop[4], min.z + span.z * shot.crop[5]); }
  const center = box.getCenter(new Vector3()), span = box.getSize(new Vector3());
  const radius = Math.max(span.x, span.y, span.z) * .5;
  const camera = new PerspectiveCamera(30, width / (height - footer), .001, 100);
  camera.position.copy(center).addScaledVector(new Vector3(...shot.eye).normalize(), radius / Math.tan(Math.PI / 12) * 1.32);
  camera.lookAt(center); camera.updateMatrixWorld();
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) pixels.set([237, 231, 218], i * 3);
  const depth = new Float32Array(width * height).fill(Infinity);
  for (const shape of selected) {
    const { geometry: g, color } = shape;
    const matrix = shape.matrix.clone();
    if (shot.open && shape.id === 'egg-shell-window') matrix.premultiply(new Matrix4().makeTranslation(.8, .25, -.41));
    if (shot.open && shape.id === 'egg-white') continue; // Transparent albumen is omitted in opaque CPU diagnostic.
    const normalMatrix = new Matrix3().getNormalMatrix(matrix), pos = g.getAttribute('position'), nor = g.getAttribute('normal');
    const coords = new Float64Array(pos.count * 4);
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i).applyMatrix4(matrix);
      normal.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize();
      projected.copy(point).applyMatrix4(camera.matrixWorldInverse);
      const q = 1 / -projected.z;
      projected.applyMatrix4(camera.projectionMatrix);
      coords[i * 4] = (projected.x * .5 + .5) * width; coords[i * 4 + 1] = (.5 - projected.y * .5) * (height - footer); coords[i * 4 + 2] = q;
      coords[i * 4 + 3] = .48 + .49 * Math.max(0, normal.dot(key)) + .11 * Math.max(0, normal.dot(fill));
    }
    const count = g.index?.count ?? pos.count;
    for (let i = 0; i < count; i += 3) {
      const a = (g.index?.getX(i) ?? i) * 4, b = (g.index?.getX(i + 1) ?? i + 1) * 4, c = (g.index?.getX(i + 2) ?? i + 2) * 4;
      if (coords[a + 2]! <= 0 || coords[b + 2]! <= 0 || coords[c + 2]! <= 0) continue;
      const ax = coords[a]!, ay = coords[a + 1]!, bx = coords[b]!, by = coords[b + 1]!, cx = coords[c]!, cy = coords[c + 1]!;
      const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(det) < 1e-7) continue;
      const xmin = Math.max(0, Math.floor(Math.min(ax, bx, cx))), xmax = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
      const ymin = Math.max(0, Math.floor(Math.min(ay, by, cy))), ymax = Math.min(height - footer - 1, Math.ceil(Math.max(ay, by, cy)));
      for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
        const u = ((by - cy) * (x + .5 - cx) + (cx - bx) * (y + .5 - cy)) / det;
        const v = ((cy - ay) * (x + .5 - cx) + (ax - cx) * (y + .5 - cy)) / det, w = 1 - u - v;
        if (u < 0 || v < 0 || w < 0) continue;
        const q = u * coords[a + 2]! + v * coords[b + 2]! + w * coords[c + 2]!, z = 1 / q, at = y * width + x;
        if (z >= depth[at]!) continue;
        depth[at] = z;
        const light = (u * coords[a + 3]! * coords[a + 2]! + v * coords[b + 3]! * coords[b + 2]! + w * coords[c + 3]! * coords[c + 2]!) / q;
        for (let k = 0; k < 3; k++) pixels[at * 3 + k] = Math.min(255, Math.round(color[k]! * light));
      }
    }
  }
  const label = `<svg width="${width}" height="${height}"><text x="22" y="${height - 20}" font-family="sans-serif" font-size="17" fill="#524b41">${shot.name} · actual geometry · CPU diagnostic${shot.open ? ' · albumen omitted for visibility' : ''}</text></svg>`;
  const path = resolve(output, `${shot.name}.png`);
  await sharp(pixels, { raw: { width, height, channels: 3 } }).composite([{ input: Buffer.from(label) }]).png().toFile(path);
  console.log(path);
}
const beforePreviews = arg('--before-previews', '/tmp/frog-and-chicken-before-previews');
if (!args.includes('--counts-only') && resolve(beforePreviews) !== output && existsSync(resolve(beforePreviews, 'triangles.json'))) {
  const before = JSON.parse(readFileSync(resolve(beforePreviews, 'triangles.json'), 'utf8')) as typeof report;
  writeFileSync(resolve(output, 'comparison-triangles.json'), JSON.stringify({ before: before.totalTriangles, after: totalTriangles, delta: totalTriangles - before.totalTriangles, perPart: Object.fromEntries(Object.keys(triangleCounts).map(id => [id, { before: before.perPart[id] ?? 0, after: triangleCounts[id] }])) }, null, 2) + '\n');
  for (const name of ['hen-quarter', 'hen-head', 'hen-feet', 'frog-quarter', 'frog-dorsal', 'frog-foot', 'tadpole-side', 'egg-closed']) {
    const left = resolve(beforePreviews, `${name}.png`), right = resolve(output, `${name}.png`);
    if (!existsSync(left) || !existsSync(right)) continue;
    const label = `<svg width="${width * 2}" height="${height + 34}"><text x="20" y="25" font-family="sans-serif" font-size="20" fill="#524b41">BEFORE</text><text x="${width + 20}" y="25" font-family="sans-serif" font-size="20" fill="#524b41">AFTER</text></svg>`;
    await sharp({ create: { width: width * 2, height: height + 34, channels: 3, background: '#ede7da' } }).composite([{ input: await sharp(left).resize(width, height).toBuffer(), left: 0, top: 34 }, { input: await sharp(right).resize(width, height).toBuffer(), left: width, top: 34 }, { input: Buffer.from(label), top: 0, left: 0 }]).png().toFile(resolve(output, `comparison-${name}.png`));
  }
}
for (const [name, reference] of [['hen-side', 'hen.png'], ['frog-foot', 'frog-foot.jpg']]) {
  const photo = resolve(import.meta.dirname, 'refs', reference!), preview = resolve(output, `${name}.png`);
  if (args.includes('--counts-only') || !existsSync(photo) || !existsSync(preview)) continue;
  const label = `<svg width="${width * 2}" height="${height + 34}"><text x="20" y="25" font-family="sans-serif" font-size="20" fill="#524b41">REFERENCE PHOTO (source recorded with topic)</text><text x="${width + 20}" y="25" font-family="sans-serif" font-size="20" fill="#524b41">ACTUAL GENERATED GEOMETRY</text></svg>`;
  let photograph = sharp(photo);
  if (name === 'hen-side') photograph = photograph.flop();
  await sharp({ create: { width: width * 2, height: height + 34, channels: 3, background: '#ede7da' } }).composite([{ input: await photograph.flatten({ background: '#ede7da' }).resize(width, height, { fit: 'contain', background: '#ede7da' }).toBuffer(), left: 0, top: 34 }, { input: await sharp(preview).resize(width, height).toBuffer(), left: width, top: 34 }, { input: Buffer.from(label), top: 0, left: 0 }]).png().toFile(resolve(output, `reference-${name}.png`));
}
for (const g of new Set([...geometry.values()].flatMap(s => s.map(p => p.geometry)))) g.dispose();
