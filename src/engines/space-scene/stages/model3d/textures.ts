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
 *  - wood          long-grain streaks along U, a grey colour map the family colour tints
 *  - pile          dense short tufts, normal map and a grey colour map (carpet)
 *  - sand          packed rounded grains, normal map and a grey colour map (sandpaper, sand)
 *  - scales        rows of overlapping rounded scales along U, normal map and a grey colour map
 *                  with a dark seam at each free edge (fish, reptiles; 14 round a sweep)
 *  - feathers      overlapping long vanes along U, each with a raised shaft, normal map (birds)
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
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

/** Long grain along U: wavy late-wood lines over a lighter ground, light to mid grey (the tint gives the colour). */
function woodCanvas(): HTMLCanvasElement {
  const size = 256;
  const rand = mulberry32(41);
  const wave = valueNoise(size, 4, rand);
  const fleck = valueNoise(size, 32, rand);
  const [c, g] = canvas(size);
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const ring = 0.5 + 0.5 * Math.sin(((y + wave[i]! * 40) / size) * Math.PI * 2 * 18);
      const v = 0.93 + 0.07 * (1 - Math.pow(ring, 6)) * (0.5 + fleck[i]!) - 0.03 * fleck[i]!;
      const n = Math.round(255 * Math.min(1, v));
      img.data.set([n, n, n, 255], i * 4);
    }
  g.putImageData(img, 0, 0);
  return c;
}

/** Short carpet pile: many small round tufts, each a soft dome with a darker gap between (height 0..1). */
function pileField(size: number): Float32Array {
  const rand = mulberry32(53);
  const field = new Float32Array(size * size);
  for (let i = 0; i < 420; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 2.2 + rand() * 1.6;
    const h = 0.6 + rand() * 0.4;
    stamp(field, size, cx, cy, rad, (d) => h * Math.sqrt(1 - d * d));
  }
  return field;
}

/** Abrasive grit: packed small grains of mixed size, sharp-edged domes (height 0..1). */
function sandField(size: number): Float32Array {
  const rand = mulberry32(67);
  const field = new Float32Array(size * size);
  for (let i = 0; i < 900; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 0.9 + rand() * 1.7;
    const h = 0.5 + rand() * 0.5;
    stamp(field, size, cx, cy, rad, (d) => h * (1 - d * d));
  }
  return field;
}

/** Raise a tileable height field by a round bump (max with what is there). */
function stamp(field: Float32Array, size: number, cx: number, cy: number, rad: number, height: (d: number) => number): void {
  const r = Math.ceil(rad);
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.hypot(dx, dy) / rad;
      if (d >= 1) continue;
      const x = (Math.floor(cx) + dx + size) % size;
      const y = (Math.floor(cy) + dy + size) % size;
      field[y * size + x] = Math.max(field[y * size + x]!, height(d));
    }
}

/** A grey colour map from a height field: high ground light, gaps dark (the family colour tints it). */
function shadeCanvas(field: Float32Array, size: number, low: number): HTMLCanvasElement {
  const [c, g] = canvas(size);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = Math.round(255 * (low + (1 - low) * field[i]!));
    img.data.set([n, n, n, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  return c;
}

/**
 * Overlapping rounded scales (height 0..1): 8 columns along U × 7 rows across
 * V per tile, every other column half a row down; where discs overlap, the
 * one of the earlier column lies on top (roof tiles), so each scale shows a
 * crescent ending in its rounded free edge. High in the middle, 0 at the edge.
 */
function scaleField(size: number): Float32Array {
  const cols = 8;
  const rows = 7;
  const dx = size / cols;
  const dy = size / rows;
  const r = dy * 0.78;
  const field = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let h = 0;
      // Columns from the earliest that can reach x: the first disc that covers the pixel is on top.
      const c0 = Math.floor((x - r) / dx);
      for (let c = c0; c <= c0 + Math.ceil((2 * r) / dx) + 1 && h === 0; c++) {
        const cx = c * dx;
        const shift = (((c % 2) + 2) % 2) * 0.5 * dy;
        const j0 = Math.floor((y - shift) / dy);
        for (let j = j0 - 1; j <= j0 + 1; j++) {
          const d = Math.hypot(x - cx, y - (j * dy + shift)) / r;
          if (d < 1 && x >= cx - r * 0.2) {
            h = 0.25 + 0.75 * (1 - d * d);
            break;
          }
        }
      }
      field[y * size + x] = h;
    }
  return field;
}

/**
 * Overlapping vanes (height 0..1): 4 columns along U × 8 rows across V, each
 * a long leaf shape pointing along U with a raised shaft down its middle;
 * the earlier column's vane lies on top.
 */
function featherField(size: number): Float32Array {
  const cols = 4;
  const rows = 8;
  const dx = size / cols;
  const dy = size / rows;
  const a = dx * 0.95;
  const b = dy * 0.62;
  const field = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let h = 0;
      for (let c = Math.floor(x / dx) - 2; c <= Math.floor(x / dx) + 1 && h === 0; c++) {
        const cx = c * dx + dx * 0.5;
        const shift = (((c % 2) + 2) % 2) * 0.5 * dy;
        const j0 = Math.floor((y - shift) / dy);
        for (let j = j0 - 1; j <= j0 + 1; j++) {
          // Leaf: wide behind the middle, narrowing to a tip at +U.
          const u = (x - cx) / a;
          if (u < -1 || u > 1) continue;
          const half = b * Math.sqrt(Math.max(0, 1 - u * u)) * (u > 0 ? 1 - 0.45 * u : 1);
          const v = y - (j * dy + shift);
          if (Math.abs(v) >= half) continue;
          const across = Math.abs(v) / half;
          h = 0.3 + 0.55 * (1 - across * across) + 0.25 * Math.exp(-((v / (0.07 * b)) ** 2));
          break;
        }
      }
      field[y * size + x] = Math.min(1, h);
    }
  return field;
}

const BENCH_SIZE = 128;
/** Tiles per UV unit: carpet tufts a few millimetres across, sandpaper grit finer. */
const PILE_REPEAT = 8;
const SAND_REPEAT = 10;
/** Tiles per UV unit (a sweep's U and V: one round the section): 2 × 7 = 14 scales round a body. */
const SCALE_REPEAT = 2;
const FEATHER_REPEAT = 2;

export interface TextureKit {
  /** Roughness map for a finish (every finish has one: one shader program for all parts). */
  roughness(finish: SurfaceFinish): Texture;
  /** Normal map for a finish (orange peel unless it has its own; strength is set per family). */
  normal(finish?: SurfaceFinish): Texture;
  /** Colour map for a finish that has one (wood, pile, sand, scales), else null. */
  albedo(finish: SurfaceFinish): Texture | null;
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
  // Organism and bench maps are built on first use (other topics never pay for them).
  const extra = new Map<SurfaceFinish, Texture>();
  const colour = new Map<SurfaceFinish, Texture>();
  // The pile and grit height fields, shared by each finish's normal and colour maps.
  let pileHeights: Float32Array | null = null;
  let sandHeights: Float32Array | null = null;
  let scaleHeights: Float32Array | null = null;
  const pile = () => (pileHeights ??= pileField(BENCH_SIZE));
  const sand = () => (sandHeights ??= sandField(BENCH_SIZE));
  const scale = () => (scaleHeights ??= scaleField(BENCH_SIZE));
  const own = (finish: SurfaceFinish): Texture | null => {
    if (finish !== 'hex' && finish !== 'fibres' && finish !== 'rings' && finish !== 'pile' && finish !== 'sand' && finish !== 'scales' && finish !== 'feathers') return null;
    let t = extra.get(finish);
    if (!t) {
      t =
        finish === 'hex'
          ? wrap(hexCanvas(), 6)
          : finish === 'fibres'
            ? wrap(fibresCanvas(), 2)
            : finish === 'pile'
              ? wrap(normalCanvas(BENCH_SIZE, (x, y) => pile()[y * BENCH_SIZE + x]!, 1.6), PILE_REPEAT)
              : finish === 'sand'
                ? wrap(normalCanvas(BENCH_SIZE, (x, y) => sand()[y * BENCH_SIZE + x]!, 2.4), SAND_REPEAT)
                : finish === 'scales'
                  ? wrap(normalCanvas(BENCH_SIZE, (x, y) => scale()[y * BENCH_SIZE + x]!, 2.2), SCALE_REPEAT)
                  : finish === 'feathers'
                    ? wrap(normalCanvas(BENCH_SIZE, (() => { const f = featherField(BENCH_SIZE); return (x: number, y: number) => f[y * BENCH_SIZE + x]!; })(), 1.8), FEATHER_REPEAT)
                    : wrap(ringsCanvas(), 1);
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
    albedo(finish) {
      if (finish !== 'wood' && finish !== 'pile' && finish !== 'sand' && finish !== 'scales') return null;
      let t = colour.get(finish);
      if (!t) {
        t =
          finish === 'wood'
            ? wrap(woodCanvas(), 1)
            : finish === 'pile'
              ? wrap(shadeCanvas(pile(), BENCH_SIZE, 0.55), PILE_REPEAT)
              : finish === 'scales'
                ? wrap(shadeCanvas(scale(), BENCH_SIZE, 0.5), SCALE_REPEAT)
                : wrap(shadeCanvas(sand(), BENCH_SIZE, 0.62), SAND_REPEAT);
        t.colorSpace = SRGBColorSpace;
        colour.set(finish, t);
      }
      return t;
    },
    dispose() {
      brushed.dispose();
      brushedAxial.dispose();
      grain.dispose();
      peel.dispose();
      extra.forEach((t) => t.dispose());
      colour.forEach((t) => t.dispose());
    },
  };
}
