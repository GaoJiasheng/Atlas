/**
 * CPU GEOMETRY PREVIEW, not WebGL or browser QA. Uses the shipped geometry
 * builders and cameras, opaque z-buffering, perspective-correct smooth vertex
 * lighting and section hatching. It deliberately does not reproduce the
 * runtime PBR shader, shadows, transparency, interaction, or HUD.
 *
 * pnpm tsx scripts/geo/inside-the-earth/render-preview.ts
 *   --input /tmp/atlas-earth-baseline/parts.json --out /tmp/atlas-earth-qa/before
 * Optional --width 1200 --height 900. No browser or GPU is used.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadGeology } from './load-geology';
import { Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { eachPieces, partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2);
function arg(name: string, fallback: string): string {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} needs a value`);
  return value;
}
const input = resolve(arg('--input', join(ROOT, 'src/content/topics/inside-the-earth/data/parts.json')));
const output = resolve(arg('--out', '/tmp/atlas-earth-qa'));
const width = Number(arg('--width', '1200')), height = Number(arg('--height', '900'));
if (![width, height].every((n) => Number.isInteger(n) && n >= 320 && n <= 2400)) throw new Error('Image dimensions must be integers from 320 to 2400');
const file = partsFile.parse(JSON.parse(readFileSync(input, 'utf8')));
mkdirSync(output, { recursive: true });
const meshPath=arg('--mesh',file.model ? join(ROOT,'public',file.model) : '');
const meshPieces=meshPath ? await loadGeology(meshPath) : new Map();

// First definitions are the paper theme. Alias resolution uses those same
// definitions, so preview colours follow tokens.css rather than a second palette.
const tokens = new Map<string, string>();
for (const match of readFileSync(join(ROOT, 'src/theme/tokens.css'), 'utf8').matchAll(/--([\w-]+):\s*([^;]+);/g)) {
  if (!tokens.has(match[1]!)) tokens.set(match[1]!, match[2]!.trim());
}
type RGB = [number, number, number];
function rgb(value: string, depth = 0): RGB {
  if (depth > 8) throw new Error(`Circular colour alias: ${value}`);
  if (value.startsWith('token:')) return rgb(tokens.get(value.slice(6)) ?? '#857d70', depth + 1);
  const alias = /^var\(--([\w-]+)\)$/.exec(value);
  if (alias) return rgb(tokens.get(alias[1]!) ?? '#857d70', depth + 1);
  const hex = /^#([a-f\d]{6})$/i.exec(value)?.[1];
  if (!hex) return [133, 125, 112];
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as RGB;
}
const paper = rgb('token:paper');
const key = new Vector3(-0.55, 0.8, 0.9).normalize();
const fill = new Vector3(0.8, 0.25, -0.1).normalize();
const footer = 36;
type Screen = { x: number; y: number; q: number; light: number; section: number };
const cross = (a: Screen, b: Screen, x: number, y: number) => (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);

type View = { name: string; preset?: string; camera?: { position: number[]; target: number[]; fov?: number }; accepts: (p: Part) => boolean; pose?: string; explode?: boolean };
const idIs = (...ids: string[]) => (p: Part) => ids.includes(p.id);
const views: View[] = [
  { name:'earth',preset:'earth-view',accepts:p=>p.id.startsWith('earth-') },
  { name:'volcano',preset:'volcano-view',accepts:p=>p.group==='volcano-system' },
  { name:'boundaries',preset:'edge-view',accepts:p=>p.group==='boundary-blocks' },
  { name:'boundaries-open',preset:'edge-view',accepts:p=>p.group==='boundary-blocks',pose:'edge-open' },
  { name:'boundaries-slide',preset:'edge-view',accepts:p=>p.group==='boundary-blocks',pose:'edge-slide' },
  { name:'fault',preset:'fault-view',accepts:p=>p.group==='ground-and-waves' },
  { name:'plate-close',camera:{position:[1.6,-0.6,2.2],target:[0,-1.5,0]},accepts:p=>p.id.startsWith('plate-') },
  { name:'crater-close',camera:{position:[0.75,1.95,1.2],target:[0,1.16,0],fov:32},accepts:idIs('volcano-cone','volcano-conduit','volcano-vent','volcano-lava') },
  { name:'crater-front',camera:{position:[-0.18,1.42,1.3],target:[0,1.12,0],fov:32},accepts:idIs('volcano-cone','volcano-conduit','volcano-vent') },
  { name:'volcano-back',camera:{position:[-3.6,2.7,-5.5],target:[0,0.65,0]},accepts:p=>p.group==='volcano-system' },
  { name:'subduction-close',camera:{position:[2.5,2.4,3.1],target:[0.95,0.75,0]},accepts:p=>['edge-sub-left','edge-sub-right','edge-slab','edge-melt'].includes(p.id) },
  { name:'fault-close',camera:{position:[2.5,2.3,3.8],target:[0,0.98,0]},accepts:p=>p.id.startsWith('fault-') },
  { name:'fault-loaded',camera:{position:[2.5,2.3,3.8],target:[0,0.98,0]},accepts:p=>p.id.startsWith('fault-'),pose:'fault-loaded' },
  { name:'fault-slipped',camera:{position:[2.5,2.3,3.8],target:[0,0.98,0]},accepts:p=>p.id.startsWith('fault-'),pose:'fault-slipped' },
  { name:'earth-exploded',preset:'earth-view',accepts:p=>p.id.startsWith('earth-'),explode:true },
  { name:'volcano-exploded',preset:'volcano-view',accepts:p=>p.group==='volcano-system',explode:true },
  { name:'sea',preset:'sea-view',accepts:p=>p.id.startsWith('sea-') },
  { name:'sea-displaced',preset:'sea-view',accepts:p=>p.id.startsWith('sea-'),pose:'sea-snap-3' },
  { name:'building',preset:'building-view',accepts:p=>p.id.startsWith('building-') },
  { name:'building-sway',preset:'building-view',accepts:p=>p.id.startsWith('building-'),pose:'building-positive' },
];
const only=arg('--only','');
const summaries = [];
for (const view of views.filter(v=>!only || only.split(',').includes(v.name))) {
  const setting = view.camera ?? file.presets!.find((p) => p.id === view.preset)!.camera;
  const camera = new PerspectiveCamera(setting.fov ?? 34, width / (height - footer), 0.01, 100);
  camera.position.fromArray(setting.position);
  if(view.explode){const target=new Vector3().fromArray(setting.target);camera.position.sub(target).multiplyScalar(1.15).add(target);}
  camera.lookAt(new Vector3().fromArray(setting.target));
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 3] = paper[0]; pixels[i * 3 + 1] = paper[1]; pixels[i * 3 + 2] = paper[2];
  }
  const depth = new Float64Array(width * height).fill(Infinity);
  const point = new Vector3(), normal = new Vector3(), projected = new Vector3();
  let triangles = 0, pieces = 0, instances = 0;

  function triangle(a: Screen, b: Screen, c: Screen, color: RGB): void {
    if (a.q <= 0 || b.q <= 0 || c.q <= 0) return;
    const area = cross(a, b, c.x, c.y);
    // Counter-clockwise faces become clockwise when the screen Y axis flips.
    if (area >= -1e-8) return;
    const xmin = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const xmax = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const ymin = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const ymax = Math.min(height - footer - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
    const inv = 1 / area;
    for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
      const u = cross(b, c, x + 0.5, y + 0.5) * inv;
      const v = cross(c, a, x + 0.5, y + 0.5) * inv;
      const w = 1 - u - v;
      if (u < -1e-8 || v < -1e-8 || w < -1e-8) continue;
      const q = u * a.q + v * b.q + w * c.q, z = 1 / q;
      const i = y * width + x;
      if (z >= depth[i]!) continue;
      depth[i] = z;
      let light = (u * a.light * a.q + v * b.light * b.q + w * c.light * c.q) / q;
      const section = (u * a.section * a.q + v * b.section * b.q + w * c.section * c.q) / q;
      if (section > 0.5 && (x + y) % 10 < 1) light *= 0.72;
      for (let channel = 0; channel < 3; channel++) pixels[i * 3 + channel] = Math.min(255, Math.max(0, Math.round(color[channel]! * light)));
    }
  }

  for (const part of file.parts.filter(view.accepts)) {
    if (!part.primitive) continue;
    const slots = partMaterialSlots(part);
    const each = file.animations.some((a) => a.target === part.id && 'each' in a && a.each);
    const shapes = part.mesh ? meshPieces.get(part.mesh)!.map((piece: import('../../../src/engines/space-scene/stages/model3d/geometry').ShapePiece)=>({...piece,geometry:piece.geometry.clone()})) : each ? eachPieces(part) : partPieces(part);
    pieces += shapes.length;
    for (const piece of shapes) {
      if (piece.lines) { piece.geometry.dispose(); continue; }
      const pos = piece.geometry.getAttribute('position'), nor = piece.geometry.getAttribute('normal');
      const section = piece.geometry.getAttribute('atlasSection');
      const indices = piece.geometry.index;
      const slot = slots[piece.slot ?? 0]!;
      const color = rgb(slot.tint ?? slot.color);
      const placement = part.mesh ? new Matrix4() : new Matrix4().makeTranslation(...part.primitive.at);
      const pose = view.pose ? file.poses?.[view.pose]?.parts[part.id] : undefined;
      if(pose) {
        const pivot=new Vector3(...(pose.pivot ?? part.primitive.at));
        const transform=new Matrix4().makeTranslation(...(pose.offset ?? [0,0,0])).multiply(new Matrix4().makeTranslation(...pivot.toArray()));
        const rotation=pose.rotation ?? [0,0,0];
        transform.multiply(new Matrix4().makeRotationZ(rotation[2]*Math.PI/180)).multiply(new Matrix4().makeRotationY(rotation[1]*Math.PI/180)).multiply(new Matrix4().makeRotationX(rotation[0]*Math.PI/180));
        const scale=pose.scale ?? 1;
        transform.multiply(new Matrix4().makeScale(...(typeof scale==='number' ? [scale,scale,scale] as const : scale)));
        transform.multiply(new Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
        placement.premultiply(transform);
      }
      if(view.explode) {
        const dir=new Vector3(...part.explode.dir).normalize().multiplyScalar(part.explode.dist);
        placement.premultiply(new Matrix4().makeTranslation(dir.x,dir.y,dir.z));
      }
      for (const instance of piece.matrices ?? [new Matrix4()]) {
        instances++;
        const matrix = placement.clone().multiply(instance);
        const normalMatrix = new Matrix3().getNormalMatrix(matrix);
        const screen: Screen[] = Array.from({ length: pos.count }, (_, i) => {
          point.fromBufferAttribute(pos, i).applyMatrix4(matrix);
          normal.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize();
          const light = Math.min(1.2, 0.52 + Math.max(0, normal.dot(key)) * 0.49 + Math.max(0, normal.dot(fill)) * 0.13);
          projected.copy(point).applyMatrix4(camera.matrixWorldInverse);
          const q = 1 / -projected.z;
          projected.applyMatrix4(camera.projectionMatrix);
          return { x: (projected.x * 0.5 + 0.5) * width, y: (0.5 - projected.y * 0.5) * (height - footer), q, light, section: section?.getX(i) ?? 0 };
        });
        const count = indices?.count ?? pos.count;
        triangles += count / 3;
        for (let i = 0; i < count; i += 3) triangle(screen[indices?.getX(i) ?? i]!, screen[indices?.getX(i + 1) ?? i + 1]!, screen[indices?.getX(i + 2) ?? i + 2]!, color);
      }
      piece.geometry.dispose();
    }
  }
  const caption = `<svg width="${width}" height="${height}"><text x="18" y="${height - 14}" fill="#555047" font-size="13" font-family="monospace">CPU GEOMETRY PREVIEW · ${view.name.toUpperCase()} · ${triangles.toLocaleString('en')} TRIANGLES · NOT WEBGL QA</text></svg>`;
  const path = join(output, `${view.name}.png`);
  await sharp(pixels, { raw: { width, height, channels: 3 } }).composite([{ input: Buffer.from(caption) }]).png().toFile(path);
  const summary = { view: view.name, path, triangles, geometryPieces: pieces, instances, camera: {...setting,position:camera.position.toArray()} };
  summaries.push(summary);
  process.stdout.write(`${view.name}: ${triangles} triangles, ${pieces} geometry pieces → ${path}\n`);
}
const previous=only && existsSync(join(output,'preview.json')) ? JSON.parse(readFileSync(join(output,'preview.json'),'utf8')) as {input:string;views:typeof summaries} : null;
const summaryViews=previous?.input===input ? [...new Map([...previous.views,...summaries].map(v=>[v.view,v])).values()] : summaries;
writeFileSync(join(output, 'preview.json'), `${JSON.stringify({ kind: 'CPU GEOMETRY PREVIEW — NOT WEBGL QA', input, mesh:meshPath || null, width, height, limitations: ['Opaque geometry with authored static poses and exploded offsets', 'No runtime PBR, shadow, transparency, HUD, or interaction checks'], views: summaryViews }, null, 2)}\n`);

for(const pieces of meshPieces.values())for(const piece of pieces)piece.geometry.dispose();
