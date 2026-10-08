/**
 * Step 3 — georeference Wikimedia Commons vector maps: SVG paths -> GeoJSON.
 *
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts                  # every map in sources.json `svg`
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts china-1940        # one map
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts --fills china-1940              # fill colours + areas (pick classes)
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts --dots china-1940               # city dots + nearest label (control points)
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts --snap europe-1942 --at 2100,6200 --dir S --r 120
 *        # land vertex furthest in a direction near a point (capes as control points)
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts --snap-geo --at 22.48,36.39 --dir S --r 0.3
 *        # the same on the CShapes coastline, in degrees
 *   pnpm tsx scripts/geo/ww2/georef-svg.ts --propose europe-1942-10 --region europe [--r 25]
 *        # from the current fit, propose cape control points (see capes.ts)
 *
 * A map drawn on the same base as another (same viewBox and coastline, e.g. the
 * monthly San Jose series) names it in `controlPointsFrom` and reuses its
 * control points.
 *
 * For each map: fit SVG units -> [lng, lat] on >= 4 control points (model per
 * sources.json, or `auto` = lowest leave-one-out RMS), print residuals in km,
 * then convert every shape whose fill is a listed class into polygons
 * (even-odd holes; curves flattened; long edges densified so the projection
 * bends them), dissolve per class, and add `_land` (union of the land fills)
 * `_sea` (sea fills, or map frame minus land) and `_frame` (the georeferenced map frame). Output: work/svg-<id>.geojson with
 * features { class }, and work/svg-<id>-fit.json (the residual report).
 */
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature, Position } from 'geojson';
import { CAPES_ASIA, CAPES_EUROPE, dirVec, extreme, geoVertices, propose } from './capes';
import { candidates, evaluate, type FitReport, type Model } from './fit';
import { loadSources, log, mapshaper, multiPolygonFeature, rawFile, svgControlPoints, toFc, warn, workFile, writeJson, type SvgSource } from './lib';
import { readSvg, ringsToPolygons, type Pt, type SvgDoc } from './svg';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    fills: { type: 'boolean', default: false },
    dots: { type: 'boolean', default: false },
    snap: { type: 'boolean', default: false },
    'snap-geo': { type: 'boolean', default: false },
    propose: { type: 'boolean', default: false },
    region: { type: 'string', default: 'europe' },
    at: { type: 'string' },
    dir: { type: 'string', default: 'S' },
    r: { type: 'string', default: '50' },
  },
});

function loadDoc(src: SvgSource): SvgDoc {
  const sources = loadSources();
  const ds = sources.datasets[src.dataset];
  if (!ds) throw new Error(`unknown dataset ${src.dataset}`);
  return readSvg(readFileSync(rawFile(ds.file), 'utf8'));
}

function bbox(rings: Pt[][]): [number, number, number, number] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rings)
    for (const [x, y] of r) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return [x0, y0, x1, y1];
}

function ringArea(r: Pt[]): number {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j]![0] + r[i]![0]) * (r[j]![1] - r[i]![1]);
  return Math.abs(a / 2);
}

function* svgLandVertices(doc: SvgDoc, land: string[]): Generator<Pt> {
  for (const s of doc.shapes) if (land.includes(s.fill)) for (const r of s.rings) yield* r;
}

function densify(ring: Pt[], maxStep: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    out.push(a);
    const b = ring[i + 1];
    if (!b) continue;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.floor(d / maxStep);
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / (n + 1), a[1] + ((b[1] - a[1]) * k) / (n + 1)]);
  }
  return out;
}

function fit(id: string, src: SvgSource): { model: Model; report: FitReport } {
  const cps = svgControlPoints(loadSources(), id);
  if (src.controlPointsFrom) log(`\n${id}: control points of ${src.controlPointsFrom} (same base map)`);
  if (cps.length < 4) throw new Error(`${id}: needs >= 4 control points (has ${cps.length})`);
  const tried = candidates(src.projection, cps).map((c) => evaluate(c.proj, c.kind, cps));
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

async function georef(id: string, src: SvgSource): Promise<void> {
  const doc = loadDoc(src);
  const { model, report } = fit(id, src);
  const [vx, vy, vw, vh] = doc.viewBox;
  const step = Math.max(vw, vh) / 300;
  const toGeo = (ring: Pt[]): Position[] => densify(ring, step).map(([u, v]) => {
    const [lng, lat] = model.toLngLat(u, v);
    return [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5];
  });
  const byClass = new Map<string, Position[][][]>();
  const add = (cls: string, polys: Pt[][][]) => {
    const list = byClass.get(cls) ?? [];
    for (const p of polys) list.push(p.map(toGeo));
    byClass.set(cls, list);
  };
  const excluded = (rings: Pt[][]) => {
    const [x0, y0, x1, y1] = bbox(rings);
    return (src.exclude ?? []).some(([a, b, c, d]) => x0 >= a && y0 >= b && x1 <= c && y1 <= d);
  };
  for (const s of doc.shapes) {
    if (excluded(s.rings)) continue;
    const cls = src.classes[s.fill];
    const polys = ringsToPolygons(s.rings);
    if (cls) add(cls, polys);
    if (src.land.includes(s.fill)) add('_land', polys);
    if (src.sea?.includes(s.fill)) add('_seafill', polys);
  }
  const frame: Pt[] = [[vx, vy], [vx + vw, vy], [vx + vw, vy + vh], [vx, vy + vh], [vx, vy]];
  const features: Feature[] = [];
  const frameFc = toFc([multiPolygonFeature([[toGeo(frame)]], { class: '_frame' })]);
  for (const [cls, polys] of byClass) {
    // One feature per source polygon, then clean + dissolve (fixes self-touching rings).
    const parts = toFc(polys.map((p) => multiPolygonFeature([p], { class: cls })));
    const dissolved = await mapshaper('-i in.json -clean -dissolve2 class', { in: parts });
    features.push(...dissolved.features);
    log(`  class ${cls.padEnd(14)} ${polys.length} polygons`);
  }
  // Sea: the listed sea fills, or the frame minus land.
  const seaFill = features.filter((f) => f.properties?.class === '_seafill');
  const sea = seaFill.length
    ? toFc(seaFill)
    : await mapshaper('-i frame.json land.json combine-files -erase target=frame land', {
        frame: frameFc,
        land: toFc(features.filter((f) => f.properties?.class === '_land')),
      });
  const kept = features.filter((f) => f.properties?.class !== '_seafill');
  kept.push(...sea.features.map((f) => ({ ...f, properties: { class: '_sea' } })));
  kept.push(...frameFc.features);
  features.length = 0;
  features.push(...kept);
  writeJson(workFile(`svg-${id}.geojson`), toFc(features));
  writeJson(workFile(`svg-${id}-fit.json`), report, true);
  log(`  wrote work/svg-${id}.geojson (${features.length} features) and work/svg-${id}-fit.json`);
}

function listFills(id: string, src: SvgSource): void {
  const doc = loadDoc(src);
  const agg = new Map<string, { n: number; area: number }>();
  for (const s of doc.shapes) {
    const a = agg.get(s.fill) ?? { n: 0, area: 0 };
    a.n++;
    a.area += s.rings.reduce((t, r) => t + ringArea(r), 0);
    agg.set(s.fill, a);
  }
  const [, , vw, vh] = doc.viewBox;
  log(`${id}: viewBox ${doc.viewBox.join(' ')}`);
  for (const [fill, a] of [...agg].sort((x, y) => y[1].area - x[1].area)) {
    const tag = src.classes[fill] ? `class ${src.classes[fill]}` : src.land.includes(fill) ? 'land' : '';
    log(`  ${fill.padEnd(22)} ${String(a.n).padStart(4)} shapes  ${((100 * a.area) / (vw * vh)).toFixed(2).padStart(7)} % of frame  ${tag}`);
  }
}

function listDots(id: string, src: SvgSource): void {
  const doc = loadDoc(src);
  const [, , vw] = doc.viewBox;
  const maxSize = vw / 100;
  for (const s of doc.shapes) {
    const b = bbox(s.rings);
    if (b[2] - b[0] > maxSize || b[3] - b[1] > maxSize || s.rings.length !== 1) continue;
    const c: Pt = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    let near = '';
    let nd = Infinity;
    for (const t of doc.texts) {
      const d = Math.hypot(t.at[0] - c[0], t.at[1] - c[1]);
      if (d < nd) {
        nd = d;
        near = t.text;
      }
    }
    log(`${id}\t${s.fill}\t${c[0].toFixed(2)},${c[1].toFixed(2)}\t${near} (${nd.toFixed(0)})`);
  }
}

function parseAt(): Pt {
  const [x, y] = (values.at ?? '').split(',').map(Number);
  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) throw new Error('--at x,y is required');
  return [x, y];
}

const sources = loadSources();
if (values['snap-geo']) {
  const at = parseAt();
  const p = extreme(geoVertices(), at, Number(values.r), dirVec(values.dir ?? 'S', false));
  log(p ? `geo ${values.dir} extreme near ${at.join(',')}: ${p[0].toFixed(4)},${p[1].toFixed(4)}` : 'no vertex in range');
} else {
  const ids = positionals.length ? positionals : Object.keys(sources.svg);
  for (const id of ids) {
    const src = sources.svg[id];
    if (!src) {
      warn(`unknown svg source ${id}`);
      continue;
    }
    if (values.fills) listFills(id, src);
    else if (values.dots) listDots(id, src);
    else if (values.propose) {
      const doc = loadDoc(src);
      const { model } = fit(id, src);
      const [vx, vy, vw, vh] = doc.viewBox;
      propose(values.region === 'asia' ? CAPES_ASIA : CAPES_EUROPE, svgControlPoints(sources, id), model, [...svgLandVertices(doc, src.land)], [vx, vy, vx + vw, vy + vh], Number(values.r));
    }
    else if (values.snap) {
      const at = parseAt();
      const p = extreme(svgLandVertices(loadDoc(src), src.land), at, Number(values.r), dirVec(values.dir ?? 'S', true));
      log(p ? `svg ${values.dir} extreme near ${at.join(',')}: ${p[0].toFixed(2)},${p[1].toFixed(2)}` : 'no vertex in range');
    } else await georef(id, src);
  }
}
