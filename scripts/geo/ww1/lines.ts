/**
 * ww1 step 3c — front lines drawn as strokes on georeferenced maps -> areas.
 *
 *   pnpm tsx scripts/geo/ww1/lines.ts                       # every line in lines.json -> work/svg-lines.geojson
 *   pnpm tsx scripts/geo/ww1/lines.ts --crop <map> --box x0,y0,x1,y1 [--grid 50] [--scale 1]
 *        # work/lines-crop.png: the source map with a coordinate grid (pick `via` points)
 *   pnpm tsx scripts/geo/ww1/lines.ts --show <line> [--pad 40] [--scale 1]
 *        # work/lines-show-<line>.png: the traced line over its source map
 *
 * Most First World War front maps (the West Point atlas and its Commons
 * redraws) draw fronts as coloured lines, not as filled areas, so the class
 * tracer (georef-svg.ts / georef-raster.ts) has nothing to fill. For each
 * entry of `scripts/geo/ww1/lines.json`:
 *
 * 1. The source map is an entry of `maps` in lines.json (a sources.json
 *    dataset with its own control points, or `controlPointsFrom` another map
 *    drawn on the same base) or an `svg` / `raster` source of sources.json.
 *    SVGs are rendered with sharp at one pixel per SVG unit, or
 *    `renderWidth` pixels across for very large viewBoxes; via points are in
 *    pixels of that rendering, control points in SVG units.
 * 2. The line is followed on the map image between the `via` points (map
 *    units, each snapped to the nearest pixel of the line colour within
 *    `snapPx`): a least-cost path where pixels of the line colour cost 1 and
 *    any other pixel `gapCost`, so the path keeps to the drawn line and
 *    bridges only dash gaps and labels lying on it. The report gives the share
 *    of the path on line-coloured pixels.
 * 3. The pixel path is thinned (Douglas–Peucker 0.75 px) and transformed to
 *    [lng, lat] with the model georef-svg.ts / georef-raster.ts pick (lowest
 *    leave-one-out RMS on the same control points).
 * 4. The area on one side of the line is closed through `close` points
 *    ([lng, lat]) that run outside the land the step keeps: compose.ts always
 *    intersects the result with dataset borders (CShapes, OHM, Natural Earth),
 *    so every edge that reaches the map is either the traced front or a
 *    dataset border. `close` is a selection device, like the `bbox` selector.
 *
 * Several parts (each with its own map, colour and via points) are joined in
 * order before closing, for a front taken from two maps.
 *
 * Output: work/svg-lines.geojson, features { class: <line id> }, read by
 * compose.ts as `{ "svg": "lines", "class": "<line id>" }`; and
 * work/lines-fit.json (model and residuals per map).
 */
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature, Position } from 'geojson';
import sharp from 'sharp';
import { candidates, evaluate, type FitReport, type Model } from '../lib/fit';
import { log, mapshaper, readJson, toFc, warn, writeJson } from '../lib/common';
import { svgControlPoints, type ControlPoint } from '../lib/manifest';
import { openTopic } from '../lib/topic';

const { values } = parseArgs({
  options: {
    crop: { type: 'string' },
    box: { type: 'string' },
    grid: { type: 'string', default: '50' },
    show: { type: 'string' },
    pad: { type: 'string', default: '40' },
    scale: { type: 'string', default: '1' },
  },
});
const topic = openTopic('ww1');
const sources = topic.sources;

type Pt = [number, number];

interface Part {
  map: string;
  /** Line colour(s), #rrggbb. */
  color: string | string[];
  /** RGB distance within which a pixel counts as line colour (default 70). */
  tolerance?: number;
  /** Points on the line, in map units (SVG units or raster pixels), in order. */
  via: Pt[];
  /** Snap radius for the via points, map units (default 12). */
  snapPx?: number;
  /** Cost of a pixel that is not line colour (default 40). */
  gapCost?: number;
}

interface Line {
  note: string;
  parts: Part[];
  /** [lng, lat] points that close the area on the wanted side of the line. */
  close: Pt[];
}

interface LinesFile {
  maps: Record<string, LineMap>;
  lines: Record<string, Line>;
}

const spec = readJson<LinesFile>(`${topic.dir}/lines.json`);

/* ------------------------------------------------------------------ */
/* Map images and fits                                                 */
/* ------------------------------------------------------------------ */

interface MapImage {
  width: number;
  height: number;
  data: Uint8Array;
  /** Map units per pixel and the unit origin. */
  unit: number;
  origin: Pt;
  model: Model;
  report: FitReport;
}

const images = new Map<string, MapImage>();

/** A line-only map: a dataset of sources.json with its own control points (or another map's). */
interface LineMap {
  dataset: string;
  projection: string;
  maxResidualKm: number;
  controlPoints: ControlPoint[];
  /** Another map of lines.json drawn on the same base (same size and coastline). */
  controlPointsFrom?: string;
  /** SVG only: render this many pixels wide instead of one pixel per SVG unit (for very large viewBoxes). */
  renderWidth?: number;
}

function lineMapPoints(id: string): ControlPoint[] {
  const m = spec.maps[id];
  if (!m) throw new Error(`lines.json: unknown map ${id}`);
  return m.controlPointsFrom ? lineMapPoints(m.controlPointsFrom) : m.controlPoints;
}

function mapSource(id: string): { file: string; kind: 'svg' | 'raster'; cps: ControlPoint[]; projection: string; maxResidualKm: number } {
  const own = spec.maps[id];
  if (own) {
    const ds = sources.datasets[own.dataset];
    if (!ds) throw new Error(`unknown dataset ${own.dataset}`);
    return { file: topic.rawFile(ds.file), kind: ds.file.toLowerCase().endsWith('.svg') ? 'svg' : 'raster', cps: lineMapPoints(id), projection: own.projection, maxResidualKm: own.maxResidualKm };
  }
  const svg = sources.svg?.[id];
  if (svg) {
    const ds = sources.datasets[svg.dataset];
    if (!ds) throw new Error(`unknown dataset ${svg.dataset}`);
    return { file: topic.rawFile(ds.file), kind: 'svg', cps: svgControlPoints(sources, id), projection: svg.projection, maxResidualKm: svg.maxResidualKm };
  }
  const raster = sources.raster?.[id];
  if (raster) {
    const ds = sources.datasets[raster.dataset];
    if (!ds) throw new Error(`unknown dataset ${raster.dataset}`);
    return { file: topic.rawFile(ds.file), kind: 'raster', cps: raster.controlPoints, projection: raster.projection, maxResidualKm: raster.maxResidualKm };
  }
  throw new Error(`lines.json: map "${id}" is neither in lines.json maps nor an svg / raster source of sources.json`);
}

function bestFit(id: string, cps: ControlPoint[], projection: string, budget: number): { model: Model; report: FitReport } {
  if (cps.length < 4) throw new Error(`${id}: needs >= 4 control points (has ${cps.length})`);
  const tried = candidates(projection, cps).map((c) => evaluate(c.proj, c.kind, cps));
  const key = (r: FitReport) => (Number.isFinite(r.looRmsKm) ? r.looRmsKm : r.rmsKm);
  tried.sort((a, b) => key(a.report) - key(b.report));
  const best = tried[0]!;
  log(`${id}: ${best.report.model}, ${cps.length} control points, RMS ${best.report.rmsKm.toFixed(1)} km, max ${best.report.maxKm.toFixed(1)} km, leave-one-out RMS ${best.report.looRmsKm.toFixed(1)} km (budget ${budget} km)`);
  if (best.report.maxKm > budget) warn(`${id}: max residual ${best.report.maxKm.toFixed(1)} km exceeds the ${budget} km budget`);
  return best;
}

function svgViewBox(text: string): [number, number, number, number] {
  const vb = /<svg\b[^>]*\bviewBox="([^"]+)"/s.exec(text)?.[1];
  if (vb) {
    const v = vb.split(/[\s,]+/).map(Number);
    return [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, v[3] ?? 0];
  }
  const tag = /<svg\b([^>]*)>/s.exec(text)?.[1] ?? '';
  const w = parseFloat(/\bwidth="([^"]+)"/.exec(tag)?.[1] ?? '0');
  const h = parseFloat(/\bheight="([^"]+)"/.exec(tag)?.[1] ?? '0');
  return [0, 0, w, h];
}

/** SVG units per rendered pixel (1 unless sharp rounded the size). */
function svgUnit(text: string, width: number): number {
  return svgViewBox(text)[2] / width;
}

async function loadMap(id: string): Promise<MapImage> {
  const hit = images.get(id);
  if (hit) return hit;
  const src = mapSource(id);
  if (!existsSync(src.file)) throw new Error(`missing ${src.file}: run fetch.ts`);
  // Cropping (to pick via points) works before the map has control points.
  const { model, report } =
    src.cps.length >= 4
      ? bestFit(id, src.cps, src.projection, src.maxResidualKm)
      : { model: { name: 'none', toLngLat: (): [number, number] => { throw new Error(`${id}: needs >= 4 control points`); } }, report: { model: 'none', rmsKm: NaN, maxKm: NaN, looRmsKm: NaN, looMaxKm: NaN, points: [] } };
  let origin: Pt = [0, 0];
  let pipeline: ReturnType<typeof sharp>;
  if (src.kind === 'svg') {
    const [vx, vy, vw] = svgViewBox(readFileSync(src.file, 'utf8'));
    const meta = await sharp(src.file, { limitInputPixels: false }).metadata();
    const width = meta.width ?? vw;
    // Render so one pixel is one SVG unit (or `renderWidth` pixels across).
    const density = (72 * (spec.maps[id]?.renderWidth ?? vw)) / width;
    pipeline = sharp(src.file, { limitInputPixels: false, density }).flatten({ background: '#ffffff' });
    origin = [vx, vy];
  } else {
    pipeline = sharp(src.file, { limitInputPixels: false }).flatten({ background: '#ffffff' });
  }
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const unit = src.kind === 'svg' ? svgUnit(readFileSync(src.file, 'utf8'), info.width) : 1;
  const img: MapImage = { width: info.width, height: info.height, data: new Uint8Array(data.buffer, data.byteOffset, data.length), unit, origin, model, report };
  // via points and crops are in pixels of this rendering; control points stay in map units.
  if (Math.abs(unit - 1) > 0.01 || origin[0] !== 0 || origin[1] !== 0) log(`${id}: rendered ${img.width} x ${img.height} px, ${unit.toFixed(3)} map units per pixel: via points are in pixels`);
  images.set(id, img);
  return img;
}

/* ------------------------------------------------------------------ */
/* Tracing                                                             */
/* ------------------------------------------------------------------ */

function rgb(h: string): [number, number, number] {
  const n = Number.parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lineMask(img: MapImage, colors: string[], tolerance: number): Uint8Array {
  const cs = colors.map(rgb);
  const t2 = tolerance * tolerance;
  const mask = new Uint8Array(img.width * img.height);
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    const r = img.data[i]!;
    const g = img.data[i + 1]!;
    const b = img.data[i + 2]!;
    for (const c of cs) {
      if ((c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2 <= t2) {
        mask[p] = 1;
        break;
      }
    }
  }
  return mask;
}

function snap(img: MapImage, mask: Uint8Array, at: Pt, r: number): Pt | null {
  const [cx, cy] = [Math.round(at[0]), Math.round(at[1])];
  let best: Pt | null = null;
  let bd = Infinity;
  for (let y = Math.max(0, cy - r); y <= Math.min(img.height - 1, cy + r); y++)
    for (let x = Math.max(0, cx - r); x <= Math.min(img.width - 1, cx + r); x++) {
      if (!mask[y * img.width + x]) continue;
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < bd) {
        bd = d;
        best = [x, y];
      }
    }
  if (!best) warn(`no line pixel within ${r} px of ${at.join(',')}: via point skipped`);
  return best;
}

/** Binary min-heap of [cost, index]. */
class Heap {
  private a: [number, number][] = [];
  get size() {
    return this.a.length;
  }
  push(v: [number, number]) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]![0] <= a[i]![0]) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): [number, number] {
    const a = this.a;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]![0] < a[m]![0]) m = l;
        if (r < a.length && a[r]![0] < a[m]![0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

/** Least-cost 8-connected path from a to b inside their bounding box + margin. */
function leastCost(img: MapImage, mask: Uint8Array, a: Pt, b: Pt, gapCost: number): { path: Pt[]; onLine: number } {
  const margin = Math.max(30, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.35);
  const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0]) - margin));
  const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1]) - margin));
  const x1 = Math.min(img.width - 1, Math.ceil(Math.max(a[0], b[0]) + margin));
  const y1 = Math.min(img.height - 1, Math.ceil(Math.max(a[1], b[1]) + margin));
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const dist = new Float64Array(w * h).fill(Infinity);
  const prev = new Int32Array(w * h).fill(-1);
  const idx = (x: number, y: number) => (y - y0) * w + (x - x0);
  const start = idx(a[0], a[1]);
  const goal = idx(b[0], b[1]);
  dist[start] = 0;
  const heap = new Heap();
  heap.push([0, start]);
  const steps: [number, number, number][] = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
  ];
  while (heap.size) {
    const [d, i] = heap.pop();
    if (d > dist[i]!) continue;
    if (i === goal) break;
    const x = (i % w) + x0;
    const y = Math.floor(i / w) + y0;
    for (const [dx, dy, len] of steps) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < x0 || nx > x1 || ny < y0 || ny > y1) continue;
      const j = idx(nx, ny);
      const c = d + len * (mask[ny * img.width + nx] ? 1 : gapCost);
      if (c < dist[j]!) {
        dist[j] = c;
        prev[j] = i;
        heap.push([c, j]);
      }
    }
  }
  const path: Pt[] = [];
  let onLine = 0;
  for (let i = goal; i !== -1; i = prev[i]!) {
    const x = (i % w) + x0;
    const y = Math.floor(i / w) + y0;
    if (mask[y * img.width + x]) onLine++;
    path.push([x, y]);
    if (i === start) break;
  }
  return { path: path.reverse(), onLine };
}

function douglasPeucker(pts: Pt[], tol: number): Pt[] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [ax, ay] = pts[s]!;
    const [bx, by] = pts[e]!;
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let md = -1;
    let mi = -1;
    for (let i = s + 1; i < e; i++) {
      const [px, py] = pts[i]!;
      const d = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
      if (d > md) {
        md = d;
        mi = i;
      }
    }
    if (md > tol && mi > 0) {
      keep[mi] = 1;
      stack.push([s, mi], [mi, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

interface Traced {
  pixels: Pt[];
  geo: Position[];
  onLineShare: number;
}

async function tracePart(part: Part): Promise<Traced> {
  const img = await loadMap(part.map);
  const colors = Array.isArray(part.color) ? part.color : [part.color];
  const mask = lineMask(img, colors, part.tolerance ?? 70);
  const r = part.snapPx ?? 12;
  const via = part.via.map((p) => snap(img, mask, p, r)).filter((p): p is Pt => p !== null);
  const pixels: Pt[] = [];
  let on = 0;
  let total = 0;
  for (let k = 0; k + 1 < via.length; k++) {
    const { path, onLine } = leastCost(img, mask, via[k]!, via[k + 1]!, part.gapCost ?? 40);
    pixels.push(...(k ? path.slice(1) : path));
    on += onLine;
    total += path.length;
  }
  const thin = douglasPeucker(pixels, 0.75);
  const geo = thin.map(([x, y]) => {
    const [lng, lat] = img.model.toLngLat(img.origin[0] + (x + 0.5) * img.unit, img.origin[1] + (y + 0.5) * img.unit);
    return [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5];
  });
  return { pixels, geo, onLineShare: total ? on / total : 0 };
}

async function build(): Promise<void> {
  const features: Feature[] = [];
  const traces: Feature[] = [];
  for (const [id, line] of Object.entries(spec.lines)) {
    const ring: Position[] = [];
    const shares: string[] = [];
    for (const part of line.parts) {
      const t = await tracePart(part);
      ring.push(...t.geo);
      shares.push(`${part.map} ${(100 * t.onLineShare).toFixed(0)} %`);
      traces.push({ type: 'Feature', properties: { line: id, map: part.map }, geometry: { type: 'LineString', coordinates: t.geo } });
    }
    ring.push(...line.close, ring[0]!);
    const poly = toFc([{ type: 'Feature', properties: { class: id }, geometry: { type: 'Polygon', coordinates: [ring] } }]);
    const clean = await mapshaper('-i a.json -clean -dissolve2 class', { a: poly });
    features.push(...clean.features);
    log(`  line ${id.padEnd(22)} ${ring.length} vertices; on line colour: ${shares.join(', ')} — ${line.note}`);
  }
  writeJson(topic.workFile('svg-lines.geojson'), toFc(features));
  writeJson(topic.workFile('lines-traces.geojson'), toFc(traces));
  const fits: Record<string, FitReport> = {};
  for (const [id, img] of images) fits[id] = img.report;
  writeJson(topic.workFile('lines-fit.json'), fits, true);
  log(`wrote work/svg-lines.geojson (${features.length} areas), work/lines-traces.geojson, work/lines-fit.json`);
}

/* ------------------------------------------------------------------ */
/* Helpers for picking via points and checking traces                  */
/* ------------------------------------------------------------------ */

async function crop(mapId: string, box: number[], grid: number, overlay: Pt[] = [], out = 'lines-crop.png'): Promise<void> {
  const img = await loadMap(mapId);
  const [x0, y0, x1, y1] = box.map(Math.round) as [number, number, number, number];
  const w = Math.min(img.width, x1) - Math.max(0, x0);
  const h = Math.min(img.height, y1) - Math.max(0, y0);
  const ox = Math.max(0, x0);
  const oy = Math.max(0, y0);
  const raw = sharp(Buffer.from(img.data), { raw: { width: img.width, height: img.height, channels: 4 }, limitInputPixels: false }).extract({ left: ox, top: oy, width: w, height: h });
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  for (let gx = Math.ceil(ox / grid) * grid; gx < ox + w; gx += grid) svg += `<line x1="${gx - ox}" y1="0" x2="${gx - ox}" y2="${h}" stroke="#00a0ff" stroke-opacity="0.5" stroke-width="${1 / Number(values.scale)}"/><text x="${gx - ox + 2}" y="${12 / Number(values.scale)}" font-size="${11 / Number(values.scale)}" fill="#0060c0">${gx}</text>`;
  for (let gy = Math.ceil(oy / grid) * grid; gy < oy + h; gy += grid) svg += `<line x1="0" y1="${gy - oy}" x2="${w}" y2="${gy - oy}" stroke="#00a0ff" stroke-opacity="0.5" stroke-width="${1 / Number(values.scale)}"/><text x="2" y="${gy - oy - 2}" font-size="${11 / Number(values.scale)}" fill="#0060c0">${gy}</text>`;
  if (overlay.length) svg += `<polyline fill="none" stroke="#00ff00" stroke-width="${2 / Number(values.scale)}" points="${overlay.map(([x, y]) => `${x - ox},${y - oy}`).join(' ')}"/>`;
  svg += '</svg>';
  const composed = await raw.composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  const k = Number(values.scale);
  await sharp(composed).resize({ width: Math.round(w * k) }).png().toFile(topic.workFile(out));
  log(`wrote work/${out} (${w} x ${h})`);
}

if (values.crop) {
  const box = (values.box ?? '').split(',').map(Number);
  if (box.length !== 4 || box.some(Number.isNaN)) throw new Error('--box x0,y0,x1,y1 is required');
  await crop(values.crop, box, Number(values.grid));
} else if (values.show) {
  const line = spec.lines[values.show];
  if (!line) throw new Error(`unknown line ${values.show}`);
  for (const [k, part] of line.parts.entries()) {
    const t = await tracePart(part);
    const xs = t.pixels.map((p) => p[0]);
    const ys = t.pixels.map((p) => p[1]);
    const pad = Number(values.pad);
    await crop(part.map, [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad], 100, t.pixels, `lines-show-${values.show}-${k}.png`);
    log(`  part ${k} (${part.map}): ${(100 * t.onLineShare).toFixed(0)} % on line colour`);
  }
} else {
  await build();
}
