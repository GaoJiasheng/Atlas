/**
 * Step 3b — georeference raster (PNG / JPG) Commons maps: colour classes -> GeoJSON.
 *
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts                       # every map in sources.json `raster`
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts europe-1943-1945       # one map
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts --colors <id>          # colour histogram (pick the palette)
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts --preview <id>         # work/raster-<id>-classes.png (classes after filling)
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts --circles <id>         # small ring symbols (city dots) for control points
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts --snap <id> --at 412,380 --dir S --r 15
 *        # land pixel furthest in a direction near a point (capes as control points)
 *   pnpm tsx scripts/geo/ww2/georef-raster.ts --propose <id> --region europe|asia [--r 12]
 *        # from the current fit, propose cape control points (see capes.ts)
 *
 * For each map: classify pixels by palette colour, fill labels / arrows /
 * rivers / legend boxes from the nearest classified pixel, vectorise each
 * class (raster.ts), fit pixel -> [lng, lat] on the control points (fit.ts,
 * same models and leave-one-out report as georef-svg.ts) and transform the
 * polygons (edges densified so the projection bends them). Output:
 * work/raster-<id>.geojson with features { class } plus `_land`, `_sea` and
 * `_frame`, as georef-svg.ts writes for SVG maps, and work/raster-<id>-fit.json.
 */
import { parseArgs } from 'node:util';
import type { Feature, Position } from 'geojson';
import sharp from 'sharp';
import { CAPES_ASIA, CAPES_EUROPE, dirVec, extreme, propose, type Pt } from './capes';
import { candidates, evaluate, type FitReport, type Model } from './fit';
import { loadSources, log, mapshaper, multiPolygonFeature, rawFile, toFc, warn, workFile, writeJson, type RasterSource } from './lib';
import { absorbSmall, classify, fillUnknown, histogram, majority, readImage, vectorise, type Image } from './raster';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    colors: { type: 'boolean', default: false },
    preview: { type: 'boolean', default: false },
    circles: { type: 'boolean', default: false },
    snap: { type: 'boolean', default: false },
    propose: { type: 'boolean', default: false },
    region: { type: 'string', default: 'europe' },
    at: { type: 'string' },
    dir: { type: 'string', default: 'S' },
    r: { type: 'string', default: '12' },
  },
});

async function load(src: RasterSource): Promise<Image> {
  const ds = loadSources().datasets[src.dataset];
  if (!ds) throw new Error(`unknown dataset ${src.dataset}`);
  return readImage(rawFile(ds.file));
}

/** Class grid after palette matching, filling and the majority filter. */
function classes(img: Image, src: RasterSource): { grid: Int16Array; names: string[] } {
  const { grid, names } = classify(img, src.palette, src.tolerance, src.exclude);
  fillUnknown(grid, img.width, img.height);
  const out = majority(grid, img.width, img.height, names.length);
  const min = src.minRegionPx ?? 12;
  absorbSmall(out, img.width, img.height, (k) => (typeof min === 'number' ? min : (min[names[k] ?? ''] ?? min.default ?? 12)));
  return { grid: out, names };
}

function landPixels(img: Image, src: RasterSource): Pt[] {
  const { grid, names } = classes(img, src);
  const land = new Set(src.land.map((c) => names.indexOf(c)));
  const out: Pt[] = [];
  for (let p = 0; p < grid.length; p++) {
    if (!land.has(grid[p]!)) continue;
    const x = p % img.width;
    out.push([x + 0.5, (p - x) / img.width + 0.5]);
  }
  return out;
}

function fit(id: string, src: RasterSource): { model: Model; report: FitReport } {
  if (src.controlPoints.length < 4) throw new Error(`${id}: needs >= 4 control points (has ${src.controlPoints.length})`);
  const tried = candidates(src.projection, src.controlPoints).map((c) => evaluate(c.proj, c.kind, src.controlPoints));
  const key = (r: FitReport) => (Number.isFinite(r.looRmsKm) ? r.looRmsKm : r.rmsKm);
  tried.sort((a, b) => key(a.report) - key(b.report));
  log(`\n${id}: models tried (leave-one-out RMS / fit RMS, km)`);
  for (const t of tried) log(`  ${t.report.model.padEnd(36)} ${t.report.looRmsKm.toFixed(1).padStart(7)} / ${t.report.rmsKm.toFixed(1)}`);
  const best = tried[0]!;
  log(`  -> ${best.report.model}: RMS ${best.report.rmsKm.toFixed(1)} km, max ${best.report.maxKm.toFixed(1)} km; leave-one-out RMS ${best.report.looRmsKm.toFixed(1)} km, max ${best.report.looMaxKm.toFixed(1)} km (budget ${src.maxResidualKm} km)`);
  for (const p of best.report.points) log(`     ${p.name.padEnd(28)} ${p.residualKm.toFixed(1).padStart(6)} km  (loo ${p.looKm.toFixed(1)})`);
  if (best.report.maxKm > src.maxResidualKm) warn(`${id}: max residual ${best.report.maxKm.toFixed(1)} km exceeds the ${src.maxResidualKm} km budget`);
  return best;
}

function densify(ring: Position[], maxStep: number): Position[] {
  const out: Position[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    out.push(a);
    const b = ring[i + 1];
    if (!b) continue;
    const d = Math.hypot(b[0]! - a[0]!, b[1]! - a[1]!);
    const n = Math.floor(d / maxStep);
    for (let k = 1; k <= n; k++) out.push([a[0]! + ((b[0]! - a[0]!) * k) / (n + 1), a[1]! + ((b[1]! - a[1]!) * k) / (n + 1)]);
  }
  return out;
}

async function georef(id: string, src: RasterSource): Promise<void> {
  const img = await load(src);
  const { model, report } = fit(id, src);
  const { grid, names } = classes(img, src);
  const step = Math.max(img.width, img.height) / 300;
  const toGeo = (ring: Position[]): Position[] =>
    densify(ring, step).map(([u = 0, v = 0]) => {
      const [lng, lat] = model.toLngLat(u, v);
      return [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5];
    });
  const features: Feature[] = [];
  const add = async (cls: string, ks: number[]) => {
    // Vectorise the union of the listed palette classes as one class.
    const merged = new Int16Array(grid.length).fill(-1);
    for (let p = 0; p < grid.length; p++) if (ks.includes(grid[p]!)) merged[p] = 0;
    const polys = await vectorise(merged, img.width, img.height, 0);
    if (!polys.length) return;
    const geo = toFc([multiPolygonFeature(polys.map((p) => p.map(toGeo)), { class: cls })]);
    const clean = await mapshaper('-i in.json -clean', { in: geo });
    features.push(...clean.features.map((f) => ({ ...f, properties: { class: cls } })));
    log(`  class ${cls.padEnd(14)} ${polys.length} polygons`);
  };
  for (const [k, cls] of names.entries()) if (!cls.startsWith('_')) await add(cls, [k]);
  await add('_land', src.land.map((c) => names.indexOf(c)).filter((k) => k >= 0));
  await add('_sea', src.sea.map((c) => names.indexOf(c)).filter((k) => k >= 0));
  const frame: Position[] = [[0, 0], [img.width, 0], [img.width, img.height], [0, img.height], [0, 0]];
  features.push(multiPolygonFeature([[toGeo(frame)]], { class: '_frame' }));
  writeJson(workFile(`raster-${id}.geojson`), toFc(features));
  writeJson(workFile(`raster-${id}-fit.json`), report, true);
  log(`  wrote work/raster-${id}.geojson (${features.length} features) and work/raster-${id}-fit.json`);
}

/** Small ring symbols: a dark (anti-aliased) ring around a light centre, 5–9 px across. */
function circles(img: Image): Pt[] {
  const lum = (x: number, y: number) => {
    const i = (y * img.width + x) * 4;
    return img.data[i]! + img.data[i + 1]! + img.data[i + 2]!;
  };
  const found: { p: Pt; score: number }[] = [];
  for (let y = 5; y < img.height - 5; y++) {
    for (let x = 5; x < img.width - 5; x++) {
      let light = true;
      for (let dy = -1; dy <= 1 && light; dy++) for (let dx = -1; dx <= 1; dx++) if (lum(x + dx, y + dy) < 600) light = false;
      if (!light) continue;
      for (const r of [2.5, 3, 3.5, 4]) {
        let ring = 0;
        for (let a = 0; a < 16; a++) {
          const t = (a * Math.PI) / 8;
          if (lum(Math.round(x + r * Math.cos(t)), Math.round(y + r * Math.sin(t))) < 500) ring++;
        }
        if (ring < 13) continue;
        const near = found.find((f) => Math.hypot(f.p[0] - x, f.p[1] - y) < 5);
        if (!near) found.push({ p: [x + 0.5, y + 0.5], score: ring });
        else if (ring > near.score) Object.assign(near, { p: [x + 0.5, y + 0.5], score: ring });
        break;
      }
    }
  }
  return found.map((f) => f.p);
}

async function preview(id: string, src: RasterSource): Promise<void> {
  const img = await load(src);
  const { grid, names } = classes(img, src);
  const colourOf = names.map((n) => Object.entries(src.palette).find(([, c]) => c === n)?.[0] ?? '#ff00ff');
  const out = Buffer.alloc(img.width * img.height * 3);
  for (let p = 0; p < grid.length; p++) {
    const n = Number.parseInt((colourOf[grid[p]!] ?? '#ff00ff').slice(1), 16);
    out[p * 3] = (n >> 16) & 255;
    out[p * 3 + 1] = (n >> 8) & 255;
    out[p * 3 + 2] = n & 255;
  }
  const file = workFile(`raster-${id}-classes.png`);
  await sharp(out, { raw: { width: img.width, height: img.height, channels: 3 } }).png().toFile(file);
  log(`wrote ${file}`);
}

function parseAt(): Pt {
  const [x, y] = (values.at ?? '').split(',').map(Number);
  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) throw new Error('--at x,y is required');
  return [x, y];
}

const sources = loadSources();
const ids = positionals.length ? positionals : Object.keys(sources.raster ?? {});
for (const id of ids) {
  const src = sources.raster?.[id];
  if (!src) {
    warn(`unknown raster source ${id}`);
    continue;
  }
  if (values.colors) {
    const img = await load(src);
    log(`${id}: ${img.width} x ${img.height}`);
    for (const [c, n] of histogram(img).slice(0, 30)) log(`  ${c}  ${((100 * n) / (img.width * img.height)).toFixed(2).padStart(6)} %  ${src.palette[c] ?? ''}`);
  } else if (values.preview) await preview(id, src);
  else if (values.circles) {
    for (const [x, y] of circles(await load(src))) log(`${id}\tcircle\t${x.toFixed(1)},${y.toFixed(1)}`);
  } else if (values.snap) {
    const img = await load(src);
    const p = extreme(landPixels(img, src), parseAt(), Number(values.r), dirVec(values.dir ?? 'S', true));
    log(p ? `pixel ${values.dir} extreme near ${values.at}: ${p[0].toFixed(1)},${p[1].toFixed(1)}` : 'no land pixel in range');
  } else if (values.propose) {
    const img = await load(src);
    const { model } = fit(id, src);
    propose(values.region === 'asia' ? CAPES_ASIA : CAPES_EUROPE, src.controlPoints, model, landPixels(img, src), [0, 0, img.width, img.height], Number(values.r));
  } else await georef(id, src);
}
