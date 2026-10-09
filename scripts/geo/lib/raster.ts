/**
 * Raster maps (PNG / JPG) -> class polygons in pixel coordinates, for
 * georef-raster.ts. The maps we trace are flat-colour Commons maps (San Jose's
 * Second World War series, Gdr's Eastern Front maps): every area class has one
 * fill colour, and labels, arrows, rivers and borders are drawn over it.
 *
 * 1. Decode with sharp (already an app dependency) to RGBA.
 * 2. Classify: each pixel takes the palette class whose colour is nearest
 *    within `tolerance` (RGB distance); anything else (text, arrows, rivers,
 *    borders, anti-aliasing, legend boxes listed in `exclude`) is unknown.
 * 3. Fill: unknown pixels take the class of the nearest classified pixel
 *    (multi-source BFS), so a river or a label inside an area belongs to that
 *    area and the front line runs through the middle of the line drawn on it.
 * 4. Clean: a 3x3 majority filter removes anti-aliasing specks, then every
 *    connected patch smaller than `minRegionPx` (the white centre of a city
 *    ring, a river speck matched as sea) joins the class around it.
 * 5. Vectorise per class: one rectangle per horizontal run of pixels, unioned
 *    by mapshaper (dissolve2) and simplified by 0.75 px to remove the stair
 *    steps. Coordinates are pixel edges (pixel (i, j) covers [i, i+1) x [j, j+1)).
 */
import sharp from 'sharp';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { areaFeatures, mapshaper, toFc } from './common';

export interface Image {
  width: number;
  height: number;
  /** RGBA, row-major. */
  data: Uint8Array;
}

export async function readImage(file: string): Promise<Image> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8Array(data.buffer, data.byteOffset, data.length) };
}

export function hex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function rgb(h: string): [number, number, number] {
  const n = Number.parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Colour histogram (most frequent first). */
export function histogram(img: Image): [string, number][] {
  const m = new Map<string, number>();
  for (let i = 0; i < img.data.length; i += 4) {
    const k = hex(img.data[i]!, img.data[i + 1]!, img.data[i + 2]!);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1]);
}

const UNKNOWN = -1;

/**
 * Class grid: index into `names` per pixel. Palette colours map to class
 * names; several colours may share a class.
 */
export function classify(
  img: Image,
  palette: Record<string, string>,
  tolerance: number,
  exclude: [number, number, number, number][] = [],
): { grid: Int16Array; names: string[] } {
  const names = [...new Set(Object.values(palette))];
  const colours = Object.entries(palette).map(([h, cls]) => ({ c: rgb(h), k: names.indexOf(cls) }));
  const grid = new Int16Array(img.width * img.height).fill(UNKNOWN);
  const t2 = tolerance * tolerance;
  const cache = new Map<number, number>();
  for (let p = 0, i = 0; p < grid.length; p++, i += 4) {
    const key = (img.data[i]! << 16) | (img.data[i + 1]! << 8) | img.data[i + 2]!;
    let k = cache.get(key);
    if (k === undefined) {
      k = UNKNOWN;
      let best = t2 + 1;
      for (const col of colours) {
        const d = (col.c[0] - img.data[i]!) ** 2 + (col.c[1] - img.data[i + 1]!) ** 2 + (col.c[2] - img.data[i + 2]!) ** 2;
        if (d < best) {
          best = d;
          k = col.k;
        }
      }
      cache.set(key, k);
    }
    grid[p] = k;
  }
  for (const [x0, y0, x1, y1] of exclude) {
    for (let y = Math.max(0, y0); y < Math.min(img.height, y1); y++) for (let x = Math.max(0, x0); x < Math.min(img.width, x1); x++) grid[y * img.width + x] = UNKNOWN;
  }
  return { grid, names };
}

/** Unknown pixels take the class of the nearest classified pixel (4-neighbour BFS). */
export function fillUnknown(grid: Int16Array, width: number, height: number): void {
  const queue = new Int32Array(grid.length);
  let head = 0;
  let tail = 0;
  for (let p = 0; p < grid.length; p++) if (grid[p] !== UNKNOWN) queue[tail++] = p;
  while (head < tail) {
    const p = queue[head++]!;
    const x = p % width;
    const y = (p - x) / width;
    const k = grid[p]!;
    const visit = (q: number) => {
      if (grid[q] === UNKNOWN) {
        grid[q] = k;
        queue[tail++] = q;
      }
    };
    if (x > 0) visit(p - 1);
    if (x < width - 1) visit(p + 1);
    if (y > 0) visit(p - width);
    if (y < height - 1) visit(p + width);
  }
}

/** 3x3 majority filter: a pixel whose class has fewer than 3 of 9 votes takes the majority. */
export function majority(grid: Int16Array, width: number, height: number, classes: number): Int16Array {
  const out = new Int16Array(grid);
  const votes = new Int16Array(classes);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      votes.fill(0);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) votes[grid[(y + dy) * width + x + dx]!]!++;
      const own = grid[y * width + x]!;
      if (votes[own]! >= 3) continue;
      let best = own;
      for (let k = 0; k < classes; k++) if (votes[k]! > votes[best]!) best = k;
      out[y * width + x] = best;
    }
  }
  return out;
}

/** Connected patches (4-neighbour) of class k smaller than `minPx(k)` take the most common class on their border. */
export function absorbSmall(grid: Int16Array, width: number, height: number, minPxOf: (k: number) => number): void {
  const seen = new Uint8Array(grid.length);
  const stack: number[] = [];
  const patch: number[] = [];
  for (let start = 0; start < grid.length; start++) {
    if (seen[start]) continue;
    const k = grid[start]!;
    const minPx = minPxOf(k);
    patch.length = 0;
    stack.push(start);
    seen[start] = 1;
    const border = new Map<number, number>();
    while (stack.length) {
      const p = stack.pop()!;
      patch.push(p);
      const x = p % width;
      const y = (p - x) / width;
      const nb = [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1];
      for (const q of nb) {
        if (q < 0) continue;
        if (grid[q] === k) {
          if (!seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        } else border.set(grid[q]!, (border.get(grid[q]!) ?? 0) + 1);
      }
      if (patch.length >= minPx) break;
    }
    if (patch.length >= minPx) {
      // Large patch: finish marking it without recording (it stays).
      while (stack.length) {
        const p = stack.pop()!;
        const x = p % width;
        const y = (p - x) / width;
        for (const q of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1]) {
          if (q >= 0 && !seen[q] && grid[q] === k) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
      continue;
    }
    let best = k;
    let n = 0;
    for (const [c, m] of border) if (m > n) [best, n] = [c, m];
    for (const p of patch) grid[p] = best;
  }
}

/** Pixel units are scaled into a tiny lat/long box near (0, 0) so mapshaper's geometry stays planar. */
const SCALE = 1e-3;
/** Metres per pixel in that box (mapshaper measures intervals in metres on lat/long data). */
const PX_M = SCALE * 111_195;

/**
 * Polygons of one class in pixel coordinates (y down), unioned and simplified.
 * Parts smaller than `minPx` pixels are dropped.
 */
export async function vectorise(grid: Int16Array, width: number, height: number, k: number, minPx = 6): Promise<Position[][][]> {
  const rects: Feature[] = [];
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      if (grid[y * width + x] !== k) {
        x++;
        continue;
      }
      const x0 = x;
      while (x < width && grid[y * width + x] === k) x++;
      // Merge identical runs on following rows into one taller rectangle.
      let y1 = y + 1;
      const same = (yy: number) => {
        if (grid[yy * width + x0] !== k || (x < width && grid[yy * width + x] === k) || (x0 > 0 && grid[yy * width + x0 - 1] === k)) return false;
        for (let i = x0; i < x; i++) if (grid[yy * width + i] !== k) return false;
        return true;
      };
      while (y1 < height && same(y1)) {
        for (let i = x0; i < x; i++) grid[y1 * width + i] = -2 - k; // consumed (restored below)
        y1++;
      }
      const ring: Position[] = [
        [x0 * SCALE, -y * SCALE],
        [x * SCALE, -y * SCALE],
        [x * SCALE, -y1 * SCALE],
        [x0 * SCALE, -y1 * SCALE],
        [x0 * SCALE, -y * SCALE],
      ];
      rects.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } });
    }
  }
  for (let p = 0; p < grid.length; p++) if (grid[p] === -2 - k) grid[p] = k;
  if (!rects.length) return [];
  const out = await mapshaper(
    `-i r.json -dissolve2 -simplify dp interval=${(0.75 * PX_M).toFixed(1)} keep-shapes -filter-islands min-area=${(minPx * PX_M * PX_M).toFixed(0)}m2 -filter-slivers min-area=${(minPx * PX_M * PX_M).toFixed(0)}m2`,
    { r: toFc(rects) },
  );
  const polys: Position[][][] = [];
  for (const f of areaFeatures(out)) {
    const list = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const p of list) polys.push(p.map((r) => r.map(([u = 0, v = 0]) => [u / SCALE, -v / SCALE])));
  }
  return polys;
}

export type { FeatureCollection };
