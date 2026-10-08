/**
 * Step 4 — compose each keyframe's control areas.
 *
 *   pnpm tsx scripts/geo/ww2/compose.ts          # every keyframe in sources.json
 *   pnpm tsx scripts/geo/ww2/compose.ts K6       # one keyframe
 *
 * 1. Base: CShapes 2.0 polygons valid on the keyframe date, each mapped to a
 *    holder entity by its GW code (`keyframes[].base`). Unmapped states (not
 *    an entity in this topic) are left out.
 * 2. Steps, in order, each painted over everything before it (later wins):
 *    geometry = `from` ∩ `clip` − `minus`, with `holder`, optional `label`,
 *    and source ids `src`. Selectors (lib.ts GeomSpec) read CShapes
 *    (optionally only the polygons containing given points: one island of an
 *    archipelago; optionally on another date), OpenHistoricalMap relations
 *    (ohm-export.ts; optionally from another keyframe's set), Natural Earth
 *    provinces, georeferenced SVG and raster classes (georef-svg.ts,
 *    georef-raster.ts; `coastFillKm` extends a class into the source map's sea
 *    within that distance so the coast follows the base data, not the source
 *    map's coastline), boxes, and `parts` (keep or drop the single polygons of
 *    a geometry that contain given points).
 * 3. Dissolve by holder + label. Output: work/<K>.geojson with properties
 *    { holder, label_en, label_zh, src[] }.
 *
 * Nothing is drawn by hand: every edge comes from one of the datasets.
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import {
  areaFeatures,
  emptyFc,
  loadSources,
  log,
  mapshaper,
  pointInPolygon,
  rawFile,
  readJson,
  toFc,
  warn,
  workFile,
  writeJson,
  type GeomSpec,
  type Keyframe,
  type Sources,
} from './lib';

const { positionals } = parseArgs({ allowPositionals: true });

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

/** Light pre-simplification of large inputs (≈300 m) so the overlay stays fast. */
async function light(a: FeatureCollection): Promise<FeatureCollection> {
  if (isEmpty(a)) return a;
  return mapshaper('-i a.json -simplify interval=300 keep-shapes', { a });
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
    const path = rawFile(ds.file);
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

  ohm(rel: number, set = this.kf.ohm): FeatureCollection {
    const fc = this.file(`ohm-${set}`, () => {
      const path = workFile(`ohm-${set}.geojson`);
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

  /** A georeferenced map: `svg` (georef-svg.ts) or `raster` (georef-raster.ts). */
  map(kind: 'svg' | 'raster', id: string): FeatureCollection {
    return this.file(`${kind}-${id}`, () => {
      const path = workFile(`${kind}-${id}.geojson`);
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

async function resolve(spec: GeomSpec, inp: Inputs, kf: Keyframe): Promise<FeatureCollection> {
  if ('cshapes' in spec) {
    const date = spec.at ?? kf.t;
    const feats = inp.cshapesAt(date).filter((f) => spec.cshapes.includes(f.properties.gwcode));
    const missing = spec.cshapes.filter((g) => !feats.some((f) => f.properties.gwcode === g));
    if (missing.length) warn(`${kf.id}: CShapes has no polygon for GW ${missing.join(', ')} on ${date}`);
    if (!spec.partsAt) return toFc(feats);
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
  if ('ohm' in spec) return inp.ohm(spec.ohm, spec.set);
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
  const t0 = Date.now();
  // Base.
  const base: Feature[] = [];
  const unmapped: string[] = [];
  for (const f of inp.cshapesAt()) {
    const entry = kf.base[String(f.properties.gwcode)];
    if (!entry) {
      unmapped.push(`${f.properties.gwcode} ${f.properties.cntry_name}`);
      continue;
    }
    const holder = typeof entry === 'string' ? entry : entry.holder;
    const label = typeof entry === 'string' ? undefined : entry.label;
    base.push({ type: 'Feature', geometry: f.geometry, properties: props(holder, label, ['G1'], `CShapes GW ${f.properties.gwcode} ${f.properties.cntry_name}`) });
  }
  log(`${kf.id} ${kf.t}: base ${base.length} CShapes polygons (${unmapped.length} states not in this topic left out)`);
  let acc = await light(toFc(base));
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
  const out = await mapshaper(`-i a.json -dissolve2 holder,label_en,label_zh calc='src=collect(src)' -filter-slivers min-area=5km2`, { a: acc });
  out.features = out.features.filter((f) => f.geometry);
  for (const f of out.features) {
    const raw = f.properties?.src as unknown;
    const list = Array.isArray(raw) ? raw : [raw];
    const ids = [...new Set(list.flatMap((s) => String(s ?? '').split(',')).filter(Boolean))].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    f.properties = { ...f.properties, src: ids };
  }
  writeJson(workFile(`${kf.id}.geojson`), out);
  log(`  wrote work/${kf.id}.geojson: ${out.features.length} features in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

const sources = loadSources();
const wanted = positionals.length ? positionals : sources.keyframes.map((k) => k.id);
for (const id of wanted) {
  const kf = sources.keyframes.find((k) => k.id === id);
  if (!kf) warn(`unknown keyframe ${id}`);
  else await compose(sources, kf);
}
