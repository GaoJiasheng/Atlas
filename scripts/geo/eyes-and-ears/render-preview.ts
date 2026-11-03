/**
 * CPU GEOMETRY PREVIEW, not WebGL or browser QA. Uses the shipped geometry
 * builders and cameras, opaque z-buffering, perspective-correct smooth vertex
 * lighting and section hatching. It deliberately does not reproduce the
 * runtime PBR shader, shadows, transparency, interaction, or HUD.
 *
 * pnpm tsx scripts/geo/eyes-and-ears/render-preview.ts
 *   --input /tmp/atlas-eyes-and-ears-baseline/parts.json --out /tmp/atlas-eyes-and-ears-qa/before
 * Optional --width 1200 --height 900. No browser or GPU is used.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { BufferGeometry, BufferAttribute, Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
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
const input = resolve(arg('--input', join(ROOT, 'src/content/topics/eyes-and-ears/data/parts.json')));
const output = resolve(arg('--out', '/tmp/atlas-eyes-and-ears-qa'));
const width = Number(arg('--width', '1200')), height = Number(arg('--height', '900'));
if (![width, height].every((n) => Number.isInteger(n) && n >= 320 && n <= 2400)) throw new Error('Image dimensions must be integers from 320 to 2400');
const file = partsFile.parse(JSON.parse(readFileSync(input, 'utf8')));
mkdirSync(output, { recursive: true });

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

const meshGeometries = new Map<string, BufferGeometry>();
if (file.model) {
  const doc = await new NodeIO().read(join(ROOT, 'public', file.model));
  for (const node of doc.getRoot().listNodes()) {
    const p = node.getMesh()?.listPrimitives()[0]; if (!p) continue;
    const g = new BufferGeometry();
    for (const [name, semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']] as const) {
      const a = p.getAttribute(semantic); if (a) g.setAttribute(name, new BufferAttribute(new Float32Array(a.getArray()!), name==='uv'?2:3));
    }
    const indices=p.getIndices();if(indices) g.setIndex(new BufferAttribute(new Uint32Array(indices.getArray()!),1));
    meshGeometries.set(node.getName(),g);
  }
}
const ids=(names:string[]) => (p:Part) => names.includes(p.id);
const cam=(position:number[],target:number[],fov=32)=>({position,target,fov});
const views = [
  { name:'ear-front', camera:cam([2.1,.8,5.5],[2.0,.0,-.1]), accepts:(p:Part)=>['ear-transfer','ear-receiver'].includes(p.group??'')&&!['basilar-strip','hair-patch','signal-marker'].includes(p.id) },
  { name:'pinna-front',camera:cam([.8,.05,2.8],[.75,.02,-.10]),accepts:ids(['pinna']) },
  { name:'pinna-oblique',camera:cam([2.2,.4,2.5],[.78,.02,-.10]),accepts:ids(['pinna','canal']) },
  { name:'ossicles-front',camera:cam([1.98,.13,1.8],[1.97,.12,-.055],30),accepts:ids(['malleus','incus','stapes','oval-window']) },
  { name:'ossicles-oblique',camera:cam([2.8,.65,1.3],[1.97,.10,-.055],30),accepts:ids(['malleus','incus','stapes','oval-window']) },
  { name:'eardrum-canal',camera:cam([2.3,.65,1.6],[1.45,-.09,-.08],30),accepts:ids(['canal','eardrum','malleus','eustachian-tube']) },
  { name:'labyrinth-front',camera:cam([2.9,.3,2.7],[2.8,.25,-.1],34),accepts:ids(['cochlea-shell','balance-context','oval-window','stapes']) },
  { name:'labyrinth-oblique',camera:cam([4.4,1.4,2.2],[2.8,.25,-.1],34),accepts:ids(['cochlea-shell','balance-context','oval-window','stapes']) },
  { name:'labyrinth-top',camera:cam([2.8,3,.7],[2.8,.25,-.1],34),accepts:ids(['cochlea-shell','balance-context','oval-window','stapes']) },
  { name:'eye-section',camera:cam([-4.3,1.1,4.8],[-2,0,0],28),accepts:(p:Part)=>['eye-front','eye-receiver'].includes(p.group??'')&&!['cornea','vitreous','iris-aperture-large'].includes(p.id) },
  { name:'iris-close',camera:cam([-4.8,.0,.15],[-2.6,0,0],30),accepts:ids(['iris','iris-aperture-small','ciliary-ring']) },
  { name:'lens-close',camera:cam([-3.4,.4,1.3],[-2.47,0,0],35),accepts:ids(['lens','ciliary-ring']) },
  { name:'cornea-close',camera:cam([-3.8,.6,1.3],[-2.7,0,0],35),accepts:ids(['cornea']) },
  { name:'eye-front',camera:cam([-5.8,.35,1.5],[-2.4,0,0],30),accepts:ids(['cornea','sclera-shell','iris','iris-aperture-small','lens','ciliary-ring','optic-nerve']) },
  { name:'eye-optics',camera:cam([-3.5,.65,2.6],[-2.65,0,0],28),accepts:ids(['cornea','iris','iris-aperture-small','lens','ciliary-ring']) },
];
let totalTriangles=0;
const byPart:Record<string,number>={};
for(const part of file.parts) {
  const mesh=part.mesh?meshGeometries.get(part.mesh):null;
  const shapes=mesh?[{geometry:mesh,matrices:null}]:partPieces(part);
  const count=shapes.reduce((sum,p)=>sum+(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1),0);
  byPart[part.id]=count;totalTriangles+=count;
  if(!mesh) for(const p of shapes) p.geometry.dispose();
}
writeFileSync(join(output,'triangle-counts.json'),JSON.stringify({totalTriangles,byPart},null,2));
const summaries = [];
const selected = arg('--views', '').split(',').filter(Boolean);
for (const view of views.filter(v=>!selected.length || selected.includes(v.name))) {
  const setting = view.camera;
  const camera = new PerspectiveCamera(setting.fov ?? 34, width / (height - footer), 0.01, 100);
  camera.position.fromArray(setting.position);
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
    const mesh = part.mesh ? meshGeometries.get(part.mesh) : null;
    if (!part.primitive && !mesh) continue;
    const slots = partMaterialSlots(part);
    const each = file.animations.some((a) => a.target === part.id && 'each' in a && a.each);
    const shapes = mesh ? [{geometry:mesh,matrices:null,slot:0,lines:false}] : each ? eachPieces(part) : partPieces(part);
    pieces += shapes.length;
    for (const piece of shapes) {
      if (piece.lines) { if (!mesh) piece.geometry.dispose(); continue; }
      const pos = piece.geometry.getAttribute('position'), nor = piece.geometry.getAttribute('normal');
      const section = piece.geometry.getAttribute('atlasSection');
      const indices = piece.geometry.index;
      const slot = slots[piece.slot ?? 0] ?? part.material ?? {color:'tissue',tint:'token:bone'};
      const color = rgb(slot.tint ?? slot.color);
      const placement = new Matrix4().makeTranslation(...(part.primitive?.at ?? [0,0,0] as [number,number,number]));
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
      if (!mesh) piece.geometry.dispose();
    }
  }
  const caption = `<svg width="${width}" height="${height}"><text x="18" y="${height - 14}" fill="#555047" font-size="13" font-family="monospace">CPU GEOMETRY PREVIEW · ${view.name.toUpperCase()} · ${triangles.toLocaleString('en')} TRIANGLES · NOT WEBGL QA</text></svg>`;
  const path = join(output, `${view.name}.png`);
  await sharp(pixels, { raw: { width, height, channels: 3 } }).composite([{ input: Buffer.from(caption) }]).png().toFile(path);
  const summary = { view: view.name, path, triangles, geometryPieces: pieces, instances, camera: setting };
  summaries.push(summary);
  process.stdout.write(`${view.name}: ${triangles} triangles, ${pieces} geometry pieces → ${path}\n`);
}
writeFileSync(join(output, 'preview.json'), `${JSON.stringify({ kind: 'CPU GEOMETRY PREVIEW — NOT WEBGL QA', input, width, height, totalTriangles, limitations: ['Opaque rest geometry only', 'No runtime PBR, shadow, transparency, HUD, or interaction checks'], views: summaries }, null, 2)}\n`);
