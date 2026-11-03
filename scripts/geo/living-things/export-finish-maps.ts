/** Export the actual runtime finish generators for CPU-only texture QA.
 * Run: pnpm tsx scripts/geo/living-things/export-finish-maps.ts
 * No DOM, browser, image downloads or runtime texture changes are required.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { Texture } from 'three';
import { MATERIAL_FAMILIES, type SurfaceFinish } from '../../../src/engines/space-scene/lib/color';
import { createTextureKit } from '../../../src/engines/space-scene/stages/model3d/textures';

interface CpuImageData { width: number; height: number; data: Uint8ClampedArray }

/** The small subset of Canvas2D used by textures.ts; pixels are straight RGBA.
 * Exported grain/scales/pile fields use putImageData, so their bytes come
 * directly from the shared generators without a second implementation.
 */
class CpuCanvas {
  private canvasWidth = 300;
  private canvasHeight = 150;
  private pixels = new Uint8ClampedArray(this.canvasWidth * this.canvasHeight * 4);
  private readonly context = new CpuContext(this);
  get width(): number { return this.canvasWidth; }
  set width(value: number) { this.canvasWidth = value; this.reset(); }
  get height(): number { return this.canvasHeight; }
  set height(value: number) { this.canvasHeight = value; this.reset(); }
  get data(): Uint8ClampedArray { return this.pixels; }
  private reset(): void { this.pixels = new Uint8ClampedArray(this.width * this.height * 4); }
  getContext(kind: string): CpuContext {
    if (kind !== '2d') throw new Error(`Unsupported CPU canvas context: ${kind}`);
    return this.context;
  }
}

class CpuContext {
  fillStyle = '#000000';
  constructor(private readonly canvas: CpuCanvas) {}
  createImageData(width: number, height: number): CpuImageData {
    return { width, height, data: new Uint8ClampedArray(width * height * 4) };
  }
  putImageData(image: CpuImageData, dx: number, dy: number): void {
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || xx >= this.canvas.width || yy < 0 || yy >= this.canvas.height) continue;
      const source = (y * image.width + x) * 4, target = (yy * this.canvas.width + xx) * 4;
      this.canvas.data.set(image.data.subarray(source, source + 4), target);
    }
  }
  fillRect(x: number, y: number, width: number, height: number): void {
    const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(this.fillStyle);
    const hex = /^#([\da-f]{6})$/i.exec(this.fillStyle);
    const color = match ? [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4] ?? 1)]
      : hex ? [0, 2, 4].map(i => parseInt(hex[1]!.slice(i, i + 2), 16)).concat(1) : null;
    if (!color) throw new Error(`Unsupported CPU fillStyle: ${this.fillStyle}`);
    const left = Math.min(x, x + width), right = Math.max(x, x + width);
    const top = Math.min(y, y + height), bottom = Math.max(y, y + height);
    for (let yy = Math.max(0, Math.floor(top)); yy < Math.min(this.canvas.height, Math.ceil(bottom)); yy++) {
      for (let xx = Math.max(0, Math.floor(left)); xx < Math.min(this.canvas.width, Math.ceil(right)); xx++) {
        const coverage = Math.max(0, Math.min(right, xx + 1) - Math.max(left, xx)) * Math.max(0, Math.min(bottom, yy + 1) - Math.max(top, yy));
        const sourceAlpha = color[3]! * coverage, offset = (yy * this.canvas.width + xx) * 4;
        const targetAlpha = this.canvas.data[offset + 3]! / 255, alpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
        for (let channel = 0; channel < 3; channel++) this.canvas.data[offset + channel] = alpha
          ? (color[channel]! * sourceAlpha + this.canvas.data[offset + channel]! * targetAlpha * (1 - sourceAlpha)) / alpha : 0;
        this.canvas.data[offset + 3] = alpha * 255;
      }
    }
  }
}

interface MapRecord {
  file: string;
  width: number;
  height: number;
  repeat: [number, number];
  flipY: boolean;
  colorSpace: string;
}

const output = '/tmp/atlas-living-round3/maps';
mkdirSync(output, { recursive: true });
const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: {
  createElement(tag: string): CpuCanvas {
    if (tag !== 'canvas') throw new Error(`Unsupported CPU document element: ${tag}`);
    return new CpuCanvas();
  },
} });
const kit = createTextureKit();
try {
  const exportMap = async (name: string, texture: Texture): Promise<MapRecord> => {
    const image = texture.image as CpuCanvas;
    if (!(image instanceof CpuCanvas)) throw new Error(`Unexpected texture image: ${name}`);
    const file = `${name}.png`;
    await sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } }).png().toFile(join(output, file));
    return { file, width: image.width, height: image.height, repeat: [texture.repeat.x, texture.repeat.y], flipY: texture.flipY, colorSpace: texture.colorSpace };
  };
  const finishes: Record<string, { albedo: MapRecord | null; normal: MapRecord; roughness: MapRecord }> = {};
  for (const finish of ['pile', 'scales', 'grain', 'sand', 'feathers'] satisfies SurfaceFinish[]) {
    const albedo = kit.albedo(finish);
    finishes[finish] = {
      albedo: albedo ? await exportMap(`${finish}-albedo`, albedo) : null,
      normal: await exportMap(`${finish}-normal`, kit.normal(finish)),
      roughness: await exportMap(`${finish}-roughness`, kit.roughness(finish)),
    };
  }
  const materialFamilies = Object.fromEntries(Object.entries(MATERIAL_FAMILIES)
    .filter(([, family]) => family.finish in finishes)
    .map(([name, family]) => [name, {
      finish: family.finish, normalStrength: family.normal ?? (family.finish === 'peel' ? .1 : 0), roughness: family.roughness,
    }]));
  writeFileSync(join(output, 'manifest.json'), `${JSON.stringify({
    source: 'src/engines/space-scene/stages/model3d/textures.ts createTextureKit()',
    pixels: 'RGBA8; PNG row 0 is canvas row 0; apply flipY and repeat when sampling',
    finishes, materialFamilies,
  }, null, 2)}\n`);
  console.log(`Exported exact runtime pile/scales/grain finish fields to ${output}`);
} finally {
  kit.dispose();
  if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
  else Reflect.deleteProperty(globalThis, 'document');
}
