/**
 * Procedural surface maps (master-spec E): no image files, generated once per
 * stage on small canvases with a seeded PRNG (identical on every load).
 *
 *  - brushed       roughness streaks along U (turned / circumferential grain)
 *  - brushed-axial the same streaks along V (pipes, axial grain)
 *  - grain         fine roughness variation (machined steel, paint, rubber)
 *  - peel          orange-peel normal map (powder coat)
 *  - hex           domed hexagonal facets, normal map (compound eyes)
 *  - fibres        fine parallel fibres along U, normal map (muscle)
 *  - rings         sharp ridges across U, normal map (tracheal taenidia, along a sweep)
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

/** Normal map (tangent space) from a tileable height field `h(x, y)` on a `size` canvas. */
function normalCanvas(size: number, h: (x: number, y: number) => number, k: number): HTMLCanvasElement {
  const field = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) field[y * size + x] = h(x, y);
  const at = (x: number, y: number) => field[((y + size) % size) * size + ((x + size) % size)]!;
  const [c, g] = canvas(size);
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * k;
      const dy = (at(x, y + 1) - at(x, y - 1)) * k;
      const len = Math.hypot(dx, dy, 1);
      img.data.set(
        [Math.round((-dx / len) * 127.5 + 127.5), Math.round((-dy / len) * 127.5 + 127.5), Math.round((1 / len) * 127.5 + 127.5), 255],
        (y * size + x) * 4,
      );
    }
  g.putImageData(img, 0, 0);
  return c;
}

/** Domed facets on a staggered lattice (8 × 8 per tile, tileable). */
function hexCanvas(): HTMLCanvasElement {
  const size = 128;
  const n = 8;
  const d = size / n;
  const r = d * 0.62;
  return normalCanvas(
    size,
    (x, y) => {
      let best = Infinity;
      const j0 = Math.floor(y / d);
      for (let j = j0 - 1; j <= j0 + 1; j++) {
        const shift = (((j % 2) + 2) % 2) * 0.5 * d;
        const i0 = Math.floor((x - shift) / d);
        for (let i = i0 - 1; i <= i0 + 1; i++) best = Math.min(best, Math.hypot(x - (i * d + shift + d / 2), y - (j * d + d / 2)));
      }
      const q = Math.min(1, best / r);
      return Math.sqrt(1 - q * q) * 0.9;
    },
    5,
  );
}

/** Parallel fibres along U (height varies across V), with a little noise. */
function fibresCanvas(): HTMLCanvasElement {
  const size = 128;
  const rand = mulberry32(31);
  const noise = valueNoise(size, 16, rand);
  return normalCanvas(size, (x, y) => 0.5 + 0.5 * Math.sin((y / size) * Math.PI * 2 * 24 + noise[y * size + x]! * 2.5), 1.6);
}

/** Sharp ridges across U (height varies along U): spiral taenidia of a trachea. */
function ringsCanvas(): HTMLCanvasElement {
  const size = 128;
  return normalCanvas(size, (x) => Math.pow(0.5 + 0.5 * Math.cos((x / size) * Math.PI * 2 * 12), 6), 3);
}

export interface TextureKit {
  /** Roughness map for a finish (every finish has one: one shader program for all parts). */
  roughness(finish: SurfaceFinish): Texture;
  /** Normal map for a finish (orange peel unless it has its own; strength is set per family). */
  normal(finish?: SurfaceFinish): Texture;
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
  // Organism maps are built on first use (machine topics never pay for them).
  const extra = new Map<SurfaceFinish, Texture>();
  const own = (finish: SurfaceFinish): Texture | null => {
    if (finish !== 'hex' && finish !== 'fibres' && finish !== 'rings') return null;
    let t = extra.get(finish);
    if (!t) {
      t = finish === 'hex' ? wrap(hexCanvas(), 6) : finish === 'fibres' ? wrap(fibresCanvas(), 2) : wrap(ringsCanvas(), 1);
      if (finish === 'hex') t.repeat.set(6, 3);
      extra.set(finish, t);
    }
    return t;
  };
  return {
    roughness(finish) {
      if (finish === 'brushed') return brushed;
      if (finish === 'brushed-axial') return brushedAxial;
      return grain;
    },
    normal(finish) {
      return (finish && own(finish)) || peel;
    },
    dispose() {
      brushed.dispose();
      brushedAxial.dispose();
      grain.dispose();
      peel.dispose();
      extra.forEach((t) => t.dispose());
    },
  };
}
