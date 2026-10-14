/**
 * Step 4 — compose each keyframe's control areas.
 *
 *   pnpm tsx scripts/geo/lib/compose.ts --topic <slug>          # every keyframe in sources.json
 *   pnpm tsx scripts/geo/lib/compose.ts --topic <slug> K6       # one keyframe
 *
 * 1. Base: CShapes 2.0 polygons (the `cshapes` dataset, cited by its `ref`)
 *    valid on the keyframe date, each mapped to a holder entity by its GW code
 *    (`keyframes[].base`). Unmapped states (not an entity in this topic) are
 *    left out. `admin1` selectors read the `ne-admin1` dataset.
 * 2. Steps, in order, each painted over everything before it (later wins):
 *    geometry = `from` ∩ `clip` − `minus`, with `holder`, optional `label`,
 *    and source ids `src`. Selectors (manifest.ts GeomSpec) read CShapes
 *    (optionally only the polygons containing given points: one island of an
 *    archipelago; optionally on another date), OpenHistoricalMap relations
 *    (ohm-export.ts; optionally from another keyframe's set), Natural Earth
 *    provinces, georeferenced SVG and raster classes (georef-svg.ts,
 *    georef-raster.ts; `coastFillKm` extends a class into the source map's sea
 *    within that distance so the coast follows the base data, not the source
 *    map's coastline), boxes, and `parts` (keep or drop the single polygons of
 *    a geometry that contain given points), and `geojson`: features of a
 *    preprocessed GeoJSON dataset filtered by attribute (URA Master Plan
 *    land use `LU_DESC`, OpenStreetMap `name`; fetch.ts downloads data.gov.sg
 *    and Overpass datasets), and `overlap`: the single polygons of one
 *    geometry lying mostly inside another (URA parcels inside an OSM outline). A topic without a sovereign base (no `cshapes`
 *    dataset, no `base`: an island-scale topic) is built from its steps only.
 * 3. Dissolve by holder + label. Output: work/<K>.geojson with properties
 *    { holder, label_en, label_zh, src[] }.
 *
 * Nothing is drawn by hand: every edge comes from one of the datasets.
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { areaFeatures, emptyFc, log, mapshaper, pointInPolygon, readJson, toFc, warn, writeJson } from './common';
import type { GeomSpec, Keyframe, Sources } from './manifest';
import { unwrapRing } from '../../../src/engines/time-scene/lib/geo';
import { openTopic } from './topic';

const { values, positionals } = parseArgs({ allowPositionals: true, options: { topic: { type: 'string' } } });
const topic = openTopic(values.topic);
/** Light pre-simplification interval (m) and final sliver filter (km²): `pipeline.compose` (ww2: 300 m, 5 km²). */
const LIGHT_M = topic.config.compose.lightM;
const SLIVER_KM2 = topic.config.compose.sliverKm2;

/* ------------------------------------------------------------------ */
/* Geometry ops (mapshaper)                                            */
/* ------------------------------------------------------------------ */

const isEmpty = (fc: FeatureCollection) => areaFeatures(fc).length === 0;

async function clip(a: FeatureCollection, b: FeatureCollection): Promise<FeatureCollection> {
  if (isEmpty(a) || isEmpty(b)) return emptyFc();
  return mapshaper('-i a.json b.json combine-files -clip target=a b', { a, b });
}

async function erase(a: FeatureCollection, b: FeatureCollection): Promise<FeatureCollection> {
  if (isEmpty(a)) return emptyFc();
  if (isEmpty(b)) return a;
  return mapshaper('-i a.json b.json combine-files -erase target=a b', { a, b });
}

async function dissolve(a: FeatureCollection): Promise<FeatureCollection> {
  if (isEmpty(a)) return emptyFc();
  return mapshaper('-i a.json -dissolve2', { a });
}

async function buffer(a: FeatureCollection, km: number): Promise<FeatureCollection> {
  if (isEmpty(a)) return emptyFc();
  return mapshaper(`-i a.json -buffer radius=${km}km`, { a });
}

/** Light pre-simplification of large inputs (`LIGHT_M`, ≈300 m) so the overlay stays fast. */
async function light(a: FeatureCollection): Promise<FeatureCollection> {
  if (isEmpty(a)) return a;
  return mapshaper(`-i a.json -simplify interval=${LIGHT_M} keep-shapes`, { a });
}

function bboxPolygon([w, s, e, n]: [number, number, number, number]): FeatureCollection {
  const ring: Position[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) ring.push([w + ((e - w) * i) / steps, s]);
  for (let i = 1; i <= steps; i++) ring.push([e, s + ((n - s) * i) / steps]);
  for (let i = 1; i <= steps; i++) ring.push([e - ((e - w) * i) / steps, n]);
  for (let i = 1; i <= steps; i++) ring.push([w, n - ((n - s) * i) / steps]);
  return toFc([{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }]);
}


/**
 * Rings that cross the antimeridian (longitude extent > 180°, e.g. an OHM
 * Pacific relation or Fiji written as -179.9 … 179.9) would be filled the long
 * way round the globe. Such a polygon is unwrapped to continuous longitudes
 * (engine `unwrapRing`) and cut at ±180 into the parts inside each world copy,
 * shifted back into [-180, 180]. Everything else passes through untouched.
 */
async function splitAntimeridian(fc: FeatureCollection): Promise<FeatureCollection> {
  const wide = (poly: Position[][]) => poly.some((r) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of r) {
      lo = Math.min(lo, p[0] ?? 0);
      hi = Math.max(hi, p[0] ?? 0);
    }
    return hi - lo > 180;
  });
  const out: Feature[] = [];
  let split = 0;
  for (const f of areaFeatures(fc)) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const keep = polys.filter((p) => !wide(p));
    const bad = polys.filter(wide);
    if (keep.length) out.push({ ...f, geometry: { type: 'MultiPolygon', coordinates: keep } as MultiPolygon });
    for (const poly of bad) {
      split++;
      const unwrapped = poly.map((r) => unwrapRing(r) as Position[]);
      const one = toFc([{ type: 'Feature', properties: f.properties, geometry: { type: 'Polygon', coordinates: unwrapped } }]);
      for (const shift of [-360, 0, 360]) {
        const w = -180 - shift;
        const piece = await mapshaper(`-i a.json -clip bbox=${w},-90,${w + 360},90`, { a: one });
        for (const g of areaFeatures(piece)) {
          const move = (r: Position[]) => r.map((p) => [(p[0] ?? 0) + shift, p[1] ?? 0]);
          const coords = g.geometry.type === 'Polygon' ? [g.geometry.coordinates.map(move)] : g.geometry.coordinates.map((pp) => pp.map(move));
          out.push({ type: 'Feature', properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: coords } as MultiPolygon });
        }
      }
    }
  }
  if (split) log(`  split ${split} polygon(s) across the antimeridian`);
  return split ? toFc(out) : fc;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

interface CShapesProps {
  gwcode: number;
  cntry_name: string;
  gwsyear: number;
  gwsmonth: number;
  gwsday: number;
  gweyear: number;
  gwemonth: number;
  gweday: number;
}

class Inputs {
  private cache = new Map<string, FeatureCollection>();
  constructor(
    private sources: Sources,
    private kf: Keyframe,
  ) {}

  private file<T>(key: string, load: () => T): T {
    if (!this.cache.has(key)) this.cache.set(key, load() as unknown as FeatureCollection);
    return this.cache.get(key) as unknown as T;
  }

  private dataset(id: string): string {
    const ds = this.sources.datasets[id];
    if (!ds) throw new Error(`unknown dataset ${id}`);
    const path = topic.rawFile(ds.file);
    if (!existsSync(path)) throw new Error(`missing raw/${ds.file}: run fetch.ts`);
    return path;
  }

  /** CShapes features valid on the keyframe date, or on `date` (start <= t < end). */
  cshapesAt(date = this.kf.t): Feature<Polygon | MultiPolygon, CShapesProps>[] {
    const all = this.file('cshapes', () => readJson<FeatureCollection>(this.dataset('cshapes')));
    const [y, m, d] = date.split('-').map(Number);
    const day = (y ?? 0) * 10000 + (m ?? 1) * 100 + (d ?? 1);
    return areaFeatures(all).filter((f) => {
      const p = f.properties as unknown as CShapesProps;
      const s = p.gwsyear * 10000 + p.gwsmonth * 100 + p.gwsday;
      const e = p.gweyear * 10000 + p.gwemonth * 100 + p.gweday;
      return s <= day && day < e;
    }) as Feature<Polygon | MultiPolygon, CShapesProps>[];
  }

  ohm(rel: number, set = this.kf.ohm ?? ''): FeatureCollection {
    const fc = this.file(`ohm-${set}`, () => {
      const path = topic.workFile(`ohm-${set}.geojson`);
      if (!existsSync(path)) throw new Error(`missing work/ohm-${set}.geojson: run ohm-export.ts`);
      return readJson<FeatureCollection>(path);
    });
    const hit = fc.features.filter((f) => f.properties?.ohm === rel);
    if (!hit.length) throw new Error(`OHM relation ${rel} not in set ${set}`);
    return toFc(hit);
  }

  admin1(admin: string, names: string[]): FeatureCollection {
    const fc = this.file('admin1', () => readJson<FeatureCollection>(this.dataset('ne-admin1')));
    const hit = fc.features.filter((f) => f.properties?.admin === admin && names.includes(String(f.properties?.name)));
    const found = new Set(hit.map((f) => String(f.properties?.name)));
    for (const n of names) if (!found.has(n)) warn(`${this.kf.id}: Natural Earth admin-1 "${n}" (${admin}) not found`);
    return toFc(hit);
  }

  /** A GeoJSON dataset in raw/ (URA Master Plan layers, an Overpass export), area features only. */
  geojson(id: string): FeatureCollection {
    return this.file(`geojson-${id}`, () => toFc(areaFeatures(readJson<FeatureCollection>(this.dataset(id)))));
  }

  /** A georeferenced map: `svg` (georef-svg.ts) or `raster` (georef-raster.ts). */
  map(kind: 'svg' | 'raster', id: string): FeatureCollection {
    return this.file(`${kind}-${id}`, () => {
      const path = topic.workFile(`${kind}-${id}.geojson`);
      if (!existsSync(path)) throw new Error(`missing work/${kind}-${id}.geojson: run georef-${kind}.ts`);
      return readJson<FeatureCollection>(path);
    });
  }
}

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

/** Single polygons of a FeatureCollection. */
function polygonsOf(fc: FeatureCollection): Position[][][] {
  const polys: Position[][][] = [];
  for (const f of areaFeatures(fc)) polys.push(...(f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates));
  return polys;
}

const polygonFc = (polys: Position[][][]) => toFc(polys.map((p) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: p } }) as Feature));

async function mapClass(kind: 'svg' | 'raster', id: string, cls: string | string[], coastFillKm: number | undefined, inp: Inputs, kf: Keyframe): Promise<FeatureCollection> {
  const all = inp.map(kind, id);
  const classes = Array.isArray(cls) ? cls : [cls];
  const sel = toFc(all.features.filter((f) => classes.includes(String(f.properties?.class))));
  if (isEmpty(sel)) warn(`${kf.id}: ${kind} ${id} has no class ${classes.join(', ')}`);
  if (!coastFillKm) return sel;
  const sea = toFc(all.features.filter((f) => f.properties?.class === '_sea'));
  const near = await clip(sea, await buffer(sel, coastFillKm));
  return toFc([...sel.features, ...near.features]);
}

/** `where` (equal to the value or one of the values) and `match` (case-insensitive regex) on a feature's properties. */
function attributeFilter(where: Record<string, string | number | (string | number)[]> = {}, match: Record<string, string> = {}) {
  const tests = [
    ...Object.entries(where).map(([k, v]) => {
      const allowed = (Array.isArray(v) ? v : [v]).map(String);
      return (p: Record<string, unknown>) => allowed.includes(String(p[k] ?? ''));
    }),
    ...Object.entries(match).map(([k, v]) => {
      const re = new RegExp(v, 'i');
      return (p: Record<string, unknown>) => re.test(String(p[k] ?? ''));
    }),
  ];
  return (f: Feature) => tests.every((test) => test((f.properties ?? {}) as Record<string, unknown>));
}

/** Planar ring area in km² (equirectangular at the ring's mean latitude). */
function ringKm2(ring: readonly Position[]): number {
  let a = 0;
  let lat = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ((ring[j]![0] ?? 0) - (ring[i]![0] ?? 0)) * ((ring[j]![1] ?? 0) + (ring[i]![1] ?? 0));
    lat += ring[i]![1] ?? 0;
  }
  const k = 111.195;
  return Math.abs((a / 2) * Math.cos(((lat / Math.max(1, ring.length)) * Math.PI) / 180) * k * k);
}
const polyKm2 = (poly: Position[][]) => ringKm2(poly[0] ?? []) - poly.slice(1).reduce((s, h) => s + ringKm2(h), 0);

const ringBox = (ring: readonly Position[]) => {
  const xs = ring.map((p) => p[0] ?? 0);
  const ys = ring.map((p) => p[1] ?? 0);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
};

/** `overlap`: the single polygons of `of` with at least `minShare` of their area inside `within`. */
async function overlapParts(of: FeatureCollection, within: FeatureCollection, minShare: number): Promise<FeatureCollection> {
  const target = polygonsOf(within);
  if (!target.length) return emptyFc();
  const boxes = target.map((p) => ringBox(p[0] ?? []));
  const [w, s, e, n] = [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))];
  const candidates = polygonsOf(of).filter((p) => {
    const b = ringBox(p[0] ?? []);
    return b[0] <= e && b[2] >= w && b[1] <= n && b[3] >= s;
  });
  if (!candidates.length) return emptyFc();
  const tagged = toFc(candidates.map((p, i) => ({ type: 'Feature', properties: { part: i }, geometry: { type: 'Polygon', coordinates: p } }) as Feature));
  const inside = await clip(tagged, polygonFc(target));
  const shareOf = new Map<number, number>();
  for (const f of areaFeatures(inside)) {
    const i = Number(f.properties?.part);
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    shareOf.set(i, (shareOf.get(i) ?? 0) + polys.reduce((sum, p) => sum + polyKm2(p), 0));
  }
  return polygonFc(candidates.filter((p, i) => (shareOf.get(i) ?? 0) >= minShare * polyKm2(p)));
}

async function resolve(spec: GeomSpec, inp: Inputs, kf: Keyframe): Promise<FeatureCollection> {
  if ('overlap' in spec) {
    const hit = await overlapParts(await resolve(spec.overlap, inp, kf), await resolve(spec.within, inp, kf), spec.minShare ?? 0.5);
    if (isEmpty(hit)) warn(`${kf.id}: no part overlaps its \`within\` geometry by ${spec.minShare ?? 0.5}`);
    return hit;
  }
  if ('geojson' in spec) {
    const hit = toFc(inp.geojson(spec.geojson).features.filter(attributeFilter(spec.where, spec.match)));
    if (isEmpty(hit)) warn(`${kf.id}: no feature of ${spec.geojson} matches ${JSON.stringify({ where: spec.where, match: spec.match })}`);
    return hit;
  }
  if ('cshapes' in spec) {
    const date = spec.at ?? kf.t;
    const feats = inp.cshapesAt(date).filter((f) => spec.cshapes.includes(f.properties.gwcode));
    const missing = spec.cshapes.filter((g) => !feats.some((f) => f.properties.gwcode === g));
    if (missing.length) warn(`${kf.id}: CShapes has no polygon for GW ${missing.join(', ')} on ${date}`);
    if (!spec.partsAt) return splitAntimeridian(toFc(feats));
    const polys: Position[][][] = [];
    for (const f of feats) polys.push(...(f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates));
    const keep: Feature[] = [];
    for (const pt of spec.partsAt) {
      const hit = polys.find((p) => pointInPolygon(pt, p));
      if (!hit) warn(`${kf.id}: no CShapes polygon of GW ${spec.cshapes.join(',')} contains ${pt.join(',')}`);
      else keep.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: hit } });
    }
    return toFc(keep);
  }
  if ('ohm' in spec) return splitAntimeridian(inp.ohm(spec.ohm, spec.set));
  if ('admin1' in spec) return inp.admin1(spec.admin1, spec.names);
  if ('svgFrame' in spec) return toFc(inp.map('svg', spec.svgFrame).features.filter((f) => f.properties?.class === '_frame'));
  if ('rasterFrame' in spec) return toFc(inp.map('raster', spec.rasterFrame).features.filter((f) => f.properties?.class === '_frame'));
  if ('svg' in spec) return mapClass('svg', spec.svg, spec.class, spec.coastFillKm, inp, kf);
  if ('raster' in spec) return mapClass('raster', spec.raster, spec.class, spec.coastFillKm, inp, kf);
  if ('parts' in spec) {
    const polys = polygonsOf(await dissolve(await resolve(spec.parts, inp, kf)));
    const hit = (p: Position[][]) => spec.at.some((pt) => pointInPolygon(pt, p));
    for (const pt of spec.at) if (!polys.some((p) => pointInPolygon(pt, p))) warn(`${kf.id}: no part contains ${pt.join(',')}`);
    return polygonFc(polys.filter((p) => (spec.drop ? !hit(p) : hit(p))));
  }
  if ('bbox' in spec) return bboxPolygon(spec.bbox);
  if ('union' in spec) {
    const parts = await Promise.all(spec.union.map((s) => resolve(s, inp, kf)));
    return toFc(parts.flatMap((p) => p.features));
  }
  if ('intersect' in spec) return clip(await resolve(spec.intersect[0], inp, kf), await resolve(spec.intersect[1], inp, kf));
  return erase(await resolve(spec.difference[0], inp, kf), await resolve(spec.difference[1], inp, kf));
}

/* ------------------------------------------------------------------ */
/* Compose                                                             */
/* ------------------------------------------------------------------ */

function props(holder: string, label: { en: string; zh: string } | undefined, src: string[], note: string) {
  return { holder, label_en: label?.en ?? '', label_zh: label?.zh ?? '', src: src.join(','), note };
}

async function compose(sources: Sources, kf: Keyframe): Promise<void> {
  const inp = new Inputs(sources, kf);
  const baseRef = sources.datasets.cshapes?.ref;
  const baseMap = kf.base ?? {};
  if (!baseRef && Object.keys(baseMap).length) throw new Error('sources.json has no `cshapes` dataset (the sovereign base)');
  const t0 = Date.now();
  // Base (none for a topic without a `cshapes` dataset).
  const base: Feature[] = [];
  const unmapped: string[] = [];
  for (const f of baseRef ? inp.cshapesAt() : []) {
    const entry = baseMap[String(f.properties.gwcode)];
    if (!entry) {
      unmapped.push(`${f.properties.gwcode} ${f.properties.cntry_name}`);
      continue;
    }
    const holder = typeof entry === 'string' ? entry : entry.holder;
    const label = typeof entry === 'string' ? undefined : entry.label;
    base.push({ type: 'Feature', geometry: f.geometry, properties: props(holder, label, [baseRef!], `CShapes GW ${f.properties.gwcode} ${f.properties.cntry_name}`) });
  }
  log(baseRef ? `${kf.id} ${kf.t}: base ${base.length} CShapes polygons (${unmapped.length} states not in this topic left out)` : `${kf.id} ${kf.t}: no sovereign base`);
  let acc = await light(await splitAntimeridian(toFc(base)));
  for (const step of kf.steps) {
    let geom = await resolve(step.from, inp, kf);
    if (step.clip) geom = await clip(geom, await resolve(step.clip, inp, kf));
    if (step.minus) geom = await erase(geom, await resolve(step.minus, inp, kf));
    geom = await light(await dissolve(geom));
    if (isEmpty(geom)) {
      warn(`${kf.id}: step "${step.note}" produced no area`);
      continue;
    }
    const layer = toFc(areaFeatures(geom).map((f) => ({ ...f, properties: props(step.holder, step.label, step.src, step.note) })));
    acc = await erase(acc, layer);
    acc = toFc([...acc.features, ...layer.features]);
    log(`  + ${step.holder.padEnd(14)} ${step.note}`);
  }
  // Dissolve by holder + label; keep the union of source ids.
  const out = await mapshaper(`-i a.json -dissolve2 holder,label_en,label_zh calc='src=collect(src)' -filter-slivers min-area=${SLIVER_KM2}km2`, { a: acc });
  out.features = out.features.filter((f) => f.geometry);
  for (const f of out.features) {
    const raw = f.properties?.src as unknown;
    const list = Array.isArray(raw) ? raw : [raw];
    const ids = [...new Set(list.flatMap((s) => String(s ?? '').split(',')).filter(Boolean))].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    f.properties = { ...f.properties, src: ids };
  }
  writeJson(topic.workFile(`${kf.id}.geojson`), out);
  log(`  wrote work/${kf.id}.geojson: ${out.features.length} features in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

const sources = topic.sources;
const wanted = positionals.length ? positionals : sources.keyframes.map((k) => k.id);
for (const id of wanted) {
  const kf = sources.keyframes.find((k) => k.id === id);
  if (!kf) warn(`unknown keyframe ${id}`);
  else await compose(sources, kf);
}
