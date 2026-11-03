/**
 * CPU GEOMETRY PREVIEW, not WebGL or browser QA. Uses the shipped geometry
 * builders and cameras, opaque z-buffering, perspective-correct smooth vertex
 * lighting and section hatching. It deliberately does not reproduce the
 * runtime PBR shader, shadows, transparency, interaction, or HUD.
 *
 * pnpm tsx scripts/geo/sound/render-preview.ts
 *   --input /tmp/atlas-sound-baseline/parts.json --out /tmp/atlas-sound-qa/before
 * Optional --width 1200 --height 900. No browser or GPU is used.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
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
const input = resolve(arg('--input', join(ROOT, 'src/content/topics/sound/data/parts.json')));
const output = resolve(arg('--out', '/tmp/atlas-sound-qa'));
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

const views = [
  { name: 'hero', camera: { position: [8,6.2,10],target:[0,.55,0],fov:36 }, accepts: (p: Part) => !['water-cell','solid-bar','reflector-near','reflector-far','bridge-short'].includes(p.id) },
  { name: 'drum', camera: { position: [-.95,1.85,2.45],target:[-1.95,.91,1.04],fov:34 }, accepts: (p: Part) => p.id.startsWith('drum') },
  { name: 'drum-bottom', camera: { position: [-1.1,.17,2.2],target:[-1.95,.84,1.04],fov:34 }, accepts: (p: Part) => p.id.startsWith('drum') },
  { name: 'drum-rear', camera: { position: [-2.95,1.5,-.27],target:[-1.95,.92,1.04],fov:34 }, accepts: (p: Part) => p.id.startsWith('drum') },
  { name: 'drum-hardware', camera: { position: [-1.48,1.14,1.86],target:[-1.767,.995,1.357],fov:24 }, accepts: (p: Part) => p.id.startsWith('drum') },
  { name: 'speaker', camera: { position: [2.17,1.47,.08],target:[1.45,.97,-.91],fov:34 }, accepts: (p: Part) => p.id==='speaker-case' },
  { name: 'speaker-side', camera: { position: [2.65,1.35,-.56],target:[1.45,.97,-.91],fov:34 }, accepts: (p: Part) => p.id==='speaker-case' },
  { name: 'bench', camera: { position: [7,4,8],target:[0,-.18,0],fov:36 }, accepts: (p: Part) => p.id==='laboratory-bench' },
  { name: 'bench-top', camera: { position: [4,3.5,4.8],target:[0,.59,0],fov:42 }, accepts: (p: Part) => p.id==='laboratory-bench' },
];
const summaries = [];
for (const view of views) {
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
    if (!part.primitive) continue;
    const slots = partMaterialSlots(part);
    const each = file.animations.some((a) => a.target === part.id && 'each' in a && a.each);
    const shapes = each ? eachPieces(part) : partPieces(part);
    pieces += shapes.length;
    for (const piece of shapes) {
      if (piece.lines) { piece.geometry.dispose(); continue; }
      const pos = piece.geometry.getAttribute('position'), nor = piece.geometry.getAttribute('normal');
      const section = piece.geometry.getAttribute('atlasSection');
      const indices = piece.geometry.index;
      const slot = slots[piece.slot ?? 0]!;
      const palette: Record<string, string> = {wood:'#96734e',steel:'#969892',stainless:'#b4b8b5',casing:'#adb1ab',powder:'#555751',plastic:'#c5c0b1',rubber:'#343631',membrane:'#d3cbb8',enamel:'#ddd9cb',brass:'#a58c57',copper:'#b3764c',glass:'#a8bab5'};
      const color = rgb(slot.tint ?? palette[slot.color] ?? slot.color);
      const placement = new Matrix4().makeTranslation(...part.primitive.at);
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
  const summary = { view: view.name, path, triangles, geometryPieces: pieces, instances, camera: setting };
  summaries.push(summary);
  process.stdout.write(`${view.name}: ${triangles} triangles, ${pieces} geometry pieces → ${path}\n`);
}
writeFileSync(join(output, 'preview.json'), `${JSON.stringify({ kind: 'CPU GEOMETRY PREVIEW — NOT WEBGL QA', input, width, height, limitations: ['Opaque rest geometry only', 'No runtime PBR, shadow, transparency, HUD, or interaction checks'], views: summaries }, null, 2)}\n`);
