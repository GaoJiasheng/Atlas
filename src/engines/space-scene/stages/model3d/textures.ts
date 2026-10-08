/**
 * Procedural surface maps (master-spec E): no image files, generated once per
 * stage on small canvases with a seeded PRNG (identical on every load).
 *
 *  - brushed       roughness streaks along U (turned / circumferential grain)
 *  - brushed-axial the same streaks along V (pipes, axial grain)
 *  - grain         fine roughness variation (machined steel, paint, rubber)
 *  - peel          orange-peel normal map (powder coat)
 */
import { CanvasTexture, RepeatWrapping, type Texture } from 'three';
import type { SurfaceFinish } from '../../lib/color';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

function wrap(c: HTMLCanvasElement, repeat: number): CanvasTexture {
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

function brushedCanvas(): HTMLCanvasElement {
  const size = 256;
  const rand = mulberry32(7);
  const [c, g] = canvas(size);
  g.fillStyle = 'rgb(205,205,205)';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i++) {
    const v = Math.round(120 + rand() * 135);
    g.fillStyle = `rgba(${v},${v},${v},0.42)`;
    const x = rand() * size;
    const y = Math.floor(rand() * size);
    const len = 24 + rand() * 200;
    g.fillRect(x, y, len, 1);
    if (x + len > size) g.fillRect(x - size, y, len, 1); // wrap seamlessly
  }
  return c;
}

/** Smooth tileable value noise in 0..1. */
function valueNoise(size: number, cells: number, rand: () => number): Float32Array {
  const grid = Array.from({ length: cells * cells }, () => rand());
  const out = new Float32Array(size * size);
  const at = (x: number, y: number) => grid[((y + cells) % cells) * cells + ((x + cells) % cells)]!;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const sx = (fx - x0) * (fx - x0) * (3 - 2 * (fx - x0));
      const sy = (fy - y0) * (fy - y0) * (3 - 2 * (fy - y0));
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      out[y * size + x] = a + (b - a) * sy;
    }
  return out;
}

function grainCanvas(): HTMLCanvasElement {
  const size = 128;
  const rand = mulberry32(11);
  const low = valueNoise(size, 8, rand);
  const [c, g] = canvas(size);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = Math.round(255 * (0.84 + 0.1 * low[i]! + 0.06 * rand()));
    img.data.set([v, v, v, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  return c;
}

function peelCanvas(): HTMLCanvasElement {
  const size = 128;
  const rand = mulberry32(23);
  const a = valueNoise(size, 32, rand);
  const b = valueNoise(size, 16, rand);
  const h = (x: number, y: number) => {
    const i = ((y + size) % size) * size + ((x + size) % size);
    return a[i]! * 0.65 + b[i]! * 0.35;
  };
  const [c, g] = canvas(size);
  const img = g.createImageData(size, size);
  const k = 2.2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * k;
      const dy = (h(x, y + 1) - h(x, y - 1)) * k;
      const len = Math.hypot(dx, dy, 1);
      img.data.set(
        [Math.round((-dx / len) * 127.5 + 127.5), Math.round((-dy / len) * 127.5 + 127.5), Math.round((1 / len) * 127.5 + 127.5), 255],
        (y * size + x) * 4,
      );
    }
  g.putImageData(img, 0, 0);
  return c;
}

export interface TextureKit {
  /** Roughness map for a finish (every finish has one: one shader program for all parts). */
  roughness(finish: SurfaceFinish): Texture;
  /** The shared normal map (orange peel; strength is set per family). */
  normal(): Texture;
  dispose(): void;
}

export function createTextureKit(): TextureKit {
  const brushedSource = brushedCanvas();
  const brushed = wrap(brushedSource, 2);
  const brushedAxial = wrap(brushedSource, 2);
  brushedAxial.center.set(0.5, 0.5);
  brushedAxial.rotation = Math.PI / 2;
  const grain = wrap(grainCanvas(), 3);
  const peel = wrap(peelCanvas(), 7);
  return {
    roughness(finish) {
      if (finish === 'brushed') return brushed;
      if (finish === 'brushed-axial') return brushedAxial;
      return grain;
    },
    normal() {
      return peel;
    },
    dispose() {
      brushed.dispose();
      brushedAxial.dispose();
      grain.dispose();
      peel.dispose();
    },
  };
}
