/**
 * Bake the original procedural surface atlas to local, compact WebP textures.
 * Run: pnpm tsx scripts/geo/solar-system/build-textures.ts
 *
 * Image top is north. Longitudes match THREE.SphereGeometry:
 * x=-cos(2πu)sin(theta), y=cos(theta), z=sin(2πu)sin(theta).
 * When storing SphereGeometry UVs in glTF, invert its V coordinate once so
 * north uses V=0 (glTF textures have flipY=false). Do not also flip the image.
 * RGB is encoded sRGB and belongs in a baseColorTexture, not a linear texture.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { surfaceColor } from './surfaces';

export interface SurfaceTexture {
  bytes: Buffer;
  width: number;
  height: number;
}

export const surfaceTextureIds = [
  'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon',
] as const;

const WIDTH = 1024, HEIGHT = 512, MAX_BYTES = 60_000;
// Build inputs only. The runtime reads these bytes from the GLB's embedded images.
export const surfaceTextureDirectory = resolve(dirname(fileURLToPath(import.meta.url)), 'textures');

/** Writes vendored textures and returns exactly the same compressed bytes. */
export async function generateSurfaceTextures(): Promise<Record<string, SurfaceTexture>> {
  await mkdir(surfaceTextureDirectory, { recursive: true });
  const result: Record<string, SurfaceTexture> = {};
  for (const id of surfaceTextureIds) {
    const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);
    for (let row = 0; row < HEIGHT; row++) {
      const theta = Math.PI * (row + .5) / HEIGHT;
      const y = Math.cos(theta), radial = Math.sin(theta);
      for (let column = 0; column < WIDTH; column++) {
        const phi = Math.PI * 2 * (column + .5) / WIDTH;
        const color = surfaceColor(id, -Math.cos(phi) * radial, y, Math.sin(phi) * radial);
        const offset = (row * WIDTH + column) * 3;
        for (let channel = 0; channel < 3; channel++) {
          pixels[offset + channel] = Math.round(Math.max(0, Math.min(1, color[channel]!)) * 255);
        }
      }
    }
    // Keep chroma at full resolution where the encoder judges it useful. Sharp's
    // high-quality WebP preset preserves coastal edges better than a JPEG atlas.
    let bytes: Buffer | undefined;
    for (const quality of [94, 90, 86, 82, 78, 74, 70, 66, 62, 58, 54, 50]) {
      bytes = await sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
        .webp({ quality, effort: 6, preset: 'picture', smartSubsample: true })
        .toBuffer();
      if (bytes.length <= MAX_BYTES) break;
    }
    if (!bytes || bytes.length > MAX_BYTES) throw new Error(`${id} surface exceeds ${MAX_BYTES} bytes`);
    await writeFile(resolve(surfaceTextureDirectory, `${id}.webp`), bytes);
    result[id] = { bytes, width: WIDTH, height: HEIGHT };
  }
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const textures = await generateSurfaceTextures();
  for (const [id, texture] of Object.entries(textures)) {
    console.log(`${id}: ${texture.width} × ${texture.height}, ${texture.bytes.length} bytes`);
  }
}
