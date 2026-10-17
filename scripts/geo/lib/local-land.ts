/**
 * Island-scale basemap (docs/17 C1, docs/24 §4.6): dissolve a polygon dataset
 * (URA Master Plan 2019 planning areas) into one land layer and write it to
 * public/geo/<id>.json, which the GeoStage draws above zoom 9 for topics that
 * set `basemap: { local: <id> }` in topic.yaml (docs/06 "TimeScene").
 *
 *   pnpm tsx scripts/geo/lib/local-land.ts --topic <slug>
 *
 * Recipe: sources.json `pipeline.localLand` (manifest.ts `LocalLand`):
 *   1. dissolve every polygon of `dataset` (raw/) into one land, cut out the
 *      inland water of `water` (rivers, canals, bays; reservoirs are kept as
 *      land because the keyframes tint them by year), simplify it
 *      (Douglas–Peucker, `simplifyM`), drop detached parts under
 *      `minIslandKm2`;
 *   2. mask: the polygons of the coarser basemap `replaces` (TopoJSON or
 *      GeoJSON; the 1:10m Southeast Asia land) that lie inside `replaceBox`
 *      and touch the new land, buffered by `maskBufferM` and minus every other
 *      coarse polygon, so the old coastline disappears under the water colour
 *      without hiding the neighbours' land (Johor, the Riau islands);
 *   3. write one TopoJSON object `<id>` with geometries `{ kind: "mask" }` and
 *      `{ kind: "land" }` (the engine strokes the land's outline as the coast);
 *      with `coastToday`, also `{ kind: "coast-today" }`, today's coastline as
 *      lines (the engine's dashed reference).
 *
 * The island coast by date (`eras`, docs/28 §3.3): instead of one land, one
 * whole coast per era, `{ kind: "land", id, from?, to?, src? }` (`[from, to)`;
 * the eras must tile time once, checked before anything is built). Each era
 * starts from today's unsimplified land (step 1 before the DP), is clipped to
 * its traced `outline`, has its `minus` (land reclaimed later) erased and its
 * `plus` (land gone since) added; then the mask, every era and today's
 * coastline are simplified as one dataset so the shoreline the eras share is
 * one arc. Every era is also decoded back to `work/coast-<era>.geojson`
 * (exactly what was published, for compose's `geojson` / `intersect`), and the
 * area of each era against today's land is printed for SOURCES-GEO.md.
 *
 * Prints the size (budget `budgetKB`), ring sanity (`rings: N, zero-area 0,
 * self-crossing 0`) and the deviation of the original boundary vertices from
 * the written coast (p50 / p95 / max, m) for SOURCES-GEO.md.
 */
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature, FeatureCollection, Polygon, Position } from 'geojson';
import { feature as topoFeature } from 'topojson-client';
import { areaFeatures, log, mapshaper, mapshaperApi, readJson, toFc, warn, writeJson } from './common';
import { coastTodayLines, eraInputPath, eraProperties, eraRecipeIssues, foldTopology } from './local-eras';
import type { LocalLandEra } from './manifest';
import { ringIssues } from './rings';
import { openTopic, repoPath } from './topic';

const { values } = parseArgs({ options: { topic: { type: 'string' } } });
const topic = openTopic(values.topic);
const spec = topic.config.localLand;
if (!spec) {
  process.stderr.write(`ERROR scripts/geo/${topic.slug}/sources.json has no pipeline.localLand\n`);
  process.exit(2);
}

type Topology = Parameters<typeof topoFeature>[0];
type TopoObject = Parameters<typeof topoFeature>[1];

/** Land polygons of a basemap file (TopoJSON objects decoded; `kind`-tagged files keep `kind: land`). */
function readLand(file: string): Feature<Polygon>[] {
  const data = readJson<FeatureCollection | Topology>(file);
  const all =
    data.type === 'Topology'
      ? Object.values(data.objects).flatMap((o) => (topoFeature(data, o as TopoObject) as unknown as FeatureCollection).features)
      : data.features;
  const tagged = all.some((f) => f.properties?.kind !== undefined);
  const polys: Feature<Polygon>[] = [];
  for (const f of areaFeatures(toFc(tagged ? all.filter((g) => g.properties?.kind === 'land') : all))) {
    const parts = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const p of parts) polys.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: p } });
  }
  return polys;
}

const bboxOf = (ring: readonly Position[]) => {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const [x = 0, y = 0] of ring) {
    w = Math.min(w, x);
    e = Math.max(e, x);
    s = Math.min(s, y);
    n = Math.max(n, y);
  }
  return [w, s, e, n] as const;
};
const overlaps = (a: readonly number[], b: readonly number[]) => a[0]! <= b[2]! && a[2]! >= b[0]! && a[1]! <= b[3]! && a[3]! >= b[1]!;

/** km per degree of latitude; longitude scaled by cos(lat). */
const KM_LAT = 111.195;

/** Distance (m) from each sampled original vertex to the nearest segment of the written coast (`written`: its rings or lines). */
function deviation(original: FeatureCollection, written: readonly Position[][]): { p50: number; p95: number; max: number; n: number } {
  const segs: number[][] = [];
  for (const ring of written) for (let i = 0; i + 1 < ring.length; i++) segs.push([ring[i]![0]!, ring[i]![1]!, ring[i + 1]![0]!, ring[i + 1]![1]!]);
  const cell = 0.01;
  const grid = new Map<string, number[][]>();
  for (const s of segs) {
    for (let cx = Math.floor(Math.min(s[0]!, s[2]!) / cell); cx <= Math.floor(Math.max(s[0]!, s[2]!) / cell); cx++)
      for (let cy = Math.floor(Math.min(s[1]!, s[3]!) / cell); cy <= Math.floor(Math.max(s[1]!, s[3]!) / cell); cy++) {
        const key = `${cx},${cy}`;
        (grid.get(key) ?? grid.set(key, []).get(key)!).push(s);
      }
  }
  const dev: number[] = [];
  for (const f of areaFeatures(original)) {
    for (const poly of f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) {
      const ring = poly[0]!;
      for (let i = 0; i < ring.length; i += 3) {
        const [px = 0, py = 0] = ring[i]!;
        const kx = Math.cos((py * Math.PI) / 180) * KM_LAT;
        let best = Infinity;
        const cx = Math.floor(px / cell);
        const cy = Math.floor(py / cell);
        for (let ix = cx - 1; ix <= cx + 1; ix++)
          for (let iy = cy - 1; iy <= cy + 1; iy++)
            for (const s of grid.get(`${ix},${iy}`) ?? []) {
              const ax = (s[0]! - px) * kx, ay = (s[1]! - py) * KM_LAT, bx = (s[2]! - px) * kx, by = (s[3]! - py) * KM_LAT;
              const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
              const u = l2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2));
              best = Math.min(best, Math.hypot(ax + u * dx, ay + u * dy) * 1000);
            }
        if (Number.isFinite(best)) dev.push(best);
      }
    }
  }
  dev.sort((a, b) => a - b);
  const q = (p: number) => dev[Math.min(dev.length - 1, Math.floor(p * dev.length))] ?? 0;
  return { p50: q(0.5), p95: q(0.95), max: dev[dev.length - 1] ?? 0, n: dev.length };
}

/** Planar polygon area in km² (equirectangular at the ring's mean latitude). */
function polyKm2(poly: Position[][]): number {
  const ring = (r: Position[]) => {
    let a = 0;
    let lat = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      a += ((r[j]![0] ?? 0) - (r[i]![0] ?? 0)) * ((r[j]![1] ?? 0) + (r[i]![1] ?? 0));
      lat += r[i]![1] ?? 0;
    }
    return Math.abs((a / 2) * Math.cos(((lat / Math.max(1, r.length)) * Math.PI) / 180) * KM_LAT * KM_LAT);
  };
  return ring(poly[0] ?? []) - poly.slice(1).reduce((sum, h) => sum + ring(h), 0);
}

const partsOf = (fc: FeatureCollection): Position[][][] =>
  areaFeatures(fc).flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates));

/**
 * `localLand.water`: cut inland water out of the land, except the parcels that
 * lie mostly inside a `keep` feature (valley reservoirs: the keyframes tint them
 * by year, so before their year they must read as the land they were).
 */
async function cutWater(land: FeatureCollection, water: NonNullable<NonNullable<typeof spec>['water']>): Promise<FeatureCollection> {
  const ds = topic.sources.datasets[water.dataset];
  if (!ds) throw new Error(`pipeline.localLand.water.dataset: unknown dataset ${water.dataset}`);
  const tests = Object.entries(water.where).map(([k, v]) => {
    const allowed = (Array.isArray(v) ? v : [v]).map(String);
    return (f: Feature) => allowed.includes(String(f.properties?.[k] ?? ''));
  });
  const all = readJson<FeatureCollection>(topic.rawFile(ds.file));
  const parts = partsOf(toFc(all.features.filter((f) => tests.every((t) => t(f))))).filter((p) => polyKm2(p) >= water.minKm2);
  let cut = parts;
  if (water.keep) {
    const keepDs = topic.sources.datasets[water.keep];
    if (!keepDs) throw new Error(`pipeline.localLand.water.keep: unknown dataset ${water.keep}`);
    const keepTests = Object.entries(water.keepMatch ?? {}).map(([k, v]) => {
      const re = new RegExp(v, 'i');
      return (f: Feature) => re.test(String(f.properties?.[k] ?? ''));
    });
    const keepFeatures = areaFeatures(readJson<FeatureCollection>(topic.rawFile(keepDs.file))).filter((f) => keepTests.every((t) => t(f)));
    const keep = toFc(keepFeatures.map((f) => ({ ...f, properties: {} })));
    const tagged = toFc(parts.map((p, i) => ({ type: 'Feature', properties: { part: i }, geometry: { type: 'Polygon', coordinates: p } }) as Feature));
    const inside = await mapshaper('-i a.json b.json combine-files -clip target=a b', { a: tagged, b: keep });
    const share = new Map<number, number>();
    for (const f of areaFeatures(inside)) {
      const i = Number(f.properties?.part);
      share.set(i, (share.get(i) ?? 0) + partsOf(toFc([f])).reduce((sum, p) => sum + polyKm2(p), 0));
    }
    const minShare = water.keepShare ?? 0.5;
    cut = parts.filter((p, i) => (share.get(i) ?? 0) < minShare * polyKm2(p));
  }
  log(`  water: ${cut.length} of ${parts.length} ${ds.file} polygons >= ${water.minKm2} km² cut out of the land${water.keep ? ` (the rest lie inside ${water.keep})` : ''}`);
  const holes = toFc(cut.map((p) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: p } }) as Feature));
  return mapshaper('-i a.json b.json combine-files -erase target=a b', { a: land, b: holes });
}

/** The coarse polygons the local land replaces (inside `replaceBox`, touching `land`), buffered, minus their neighbours. */
async function maskFor(land: FeatureCollection): Promise<FeatureCollection> {
  const coarse = readLand(repoPath(spec!.replaces));
  const landBox = bboxOf(areaFeatures(land).flatMap((f) => (f.geometry.type === 'Polygon' ? f.geometry.coordinates[0]! : f.geometry.coordinates.flatMap((p) => p[0]!))));
  const replaced: Feature<Polygon>[] = [];
  const others: Feature<Polygon>[] = [];
  for (const f of coarse) {
    const box = bboxOf(f.geometry.coordinates[0]!);
    if (!overlaps(box, spec!.replaceBox) || !overlaps(box, landBox)) continue;
    const touches = areaFeatures(await mapshaper('-i a.json b.json combine-files -clip target=a b', { a: toFc([f]), b: land })).length > 0;
    // Wholly inside the replace box and touching the new land: Singapore's own coarse polygons.
    const inside = box[0] >= spec!.replaceBox[0] && box[2] <= spec!.replaceBox[2] && box[1] >= spec!.replaceBox[1] && box[3] <= spec!.replaceBox[3];
    (touches && inside ? replaced : others).push(f);
  }
  const buffered = await mapshaper(`-i a.json -buffer radius=${spec!.maskBufferM}m -dissolve2`, { a: toFc(replaced) });
  const mask = others.length ? await mapshaper('-i a.json b.json combine-files -erase target=a b', { a: buffered, b: toFc(others) }) : buffered;
  log(`  mask: ${replaced.length} coarse polygon(s) of ${spec!.replaces} replaced (buffer ${spec!.maskBufferM} m, minus ${others.length} neighbouring polygon(s))`);
  return mask;
}

/** Polygons of an era input (GeoJSON, or TopoJSON with every object decoded), properties dropped. */
function readPolygons(path: string): FeatureCollection {
  const file = eraInputPath(topic.dir, path);
  if (!existsSync(file)) throw new Error(`pipeline.localLand.eras: ${path} not found (${file}); trace it from a source map first`);
  const data = readJson<FeatureCollection | Topology>(file);
  const all = data.type === 'Topology' ? Object.values(data.objects).flatMap((o) => (topoFeature(data, o as TopoObject) as unknown as FeatureCollection).features) : data.features;
  const polys = areaFeatures(toFc(all)).map((f) => ({ ...f, properties: {} }));
  if (!polys.length) throw new Error(`pipeline.localLand.eras: ${path} has no polygons`);
  return toFc(polys);
}

/** TopoJSON grid of the written file (cells across its extent, as the undated land), and the snap of the clean after quantising (about a grid cell). */
const QUANTIZATION = 100000;
const SNAP_DEG = 0.00001;

const kmOf = (fc: FeatureCollection) => partsOf(fc).reduce((sum, p) => sum + polyKm2(p), 0);

/**
 * The island coast by date (`eras`): each era from today's unsimplified land
 * (`outline`, water cut out), clipped / erased / added per its recipe; all
 * eras, the mask and (with `coastToday`) today's coastline simplified as one
 * dataset, so a shoreline two eras share is one arc, simplified once, stored
 * once; written as one object `<id>`. Each era is also decoded back to
 * `work/coast-<era>.geojson` (exactly the published coast, for compose).
 */
async function writeEras(eras: LocalLandEra[], outline: FeatureCollection, land: FeatureCollection, mask: FeatureCollection): Promise<void> {
  const issues = eraRecipeIssues(eras);
  if (issues.length) throw new Error(`pipeline.localLand.eras: ${issues.join('; ')}`);
  const layers: Record<string, FeatureCollection> = { 'mask.json': toFc(areaFeatures(mask).map((f) => ({ ...f, properties: { kind: 'mask' } }))) };
  for (const [i, era] of eras.entries()) {
    let a = outline;
    if (era.outline) a = await mapshaper('-i a.json b.json combine-files -clip target=a b', { a, b: readPolygons(era.outline) });
    for (const p of era.minus ?? []) a = await mapshaper('-i a.json b.json combine-files -erase target=a b', { a, b: readPolygons(p) });
    for (const p of era.plus ?? []) a = await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2', { a, b: readPolygons(p) });
    a = await mapshaper(`-i a.json -dissolve2 -filter-islands min-area=${spec!.minIslandKm2}km2`, { a: toFc(areaFeatures(a).map((f) => ({ ...f, properties: {} }))) });
    const parts = partsOf(a);
    if (!parts.length) throw new Error(`pipeline.localLand.eras: ${era.id} has no land left`);
    layers[`era-${i}.json`] = toFc([{ type: 'Feature', properties: eraProperties(era), geometry: { type: 'MultiPolygon', coordinates: parts } }]);
  }
  if (spec!.coastToday) {
    layers['today.json'] = toFc([{ type: 'Feature', properties: { kind: 'coast-today' }, geometry: { type: 'MultiLineString', coordinates: coastTodayLines(partsOf(outline)) } }]);
  }
  const names = Object.keys(layers);
  const ms = mapshaperApi();
  const first = await ms.applyCommands(
    `-i ${names.join(' ')} combine-files -simplify dp interval=${spec!.simplifyM} keep-shapes target=* -clean target=* -o out.json format=topojson quantization=${QUANTIZATION} target=*`,
    layers,
  );
  const quantised = first['out.json'] ?? Object.values(first)[0];
  if (quantised === undefined) throw new Error('mapshaper wrote no topology');
  // Quantisation can fold a DP vertex back over its neighbour (a few-metre spike that crosses the next segment):
  // clean the quantised topology once more, snapping within one grid cell, and export on the same grid.
  const second = await ms.applyCommands(`-i topo.json -clean snap-interval=${SNAP_DEG} target=* -o out.json format=topojson quantization=${QUANTIZATION} target=*`, {
    'topo.json': JSON.parse(quantised.toString()) as unknown,
  });
  const text = (second['out.json'] ?? Object.values(second)[0])?.toString();
  if (!text) throw new Error('mapshaper wrote no topology');
  const topo = foldTopology(JSON.parse(text) as Topology, names.map((n) => n.replace(/\.json$/, '')), spec!.id);
  const file = repoPath(`public/geo/${spec!.id}.json`);
  writeFileSync(file, JSON.stringify(topo));
  const size = statSync(file).size;
  log(`${file}: ${(size / 1024).toFixed(0)} KB (budget ${spec!.budgetKB} KB), ${eras.length} eras${spec!.coastToday ? ' + coast-today' : ''}, DP ${spec!.simplifyM} m, islands >= ${spec!.minIslandKm2} km²`);
  if (size > spec!.budgetKB * 1024) warn(`${spec!.id}.json is over its ${spec!.budgetKB} KB budget`);
  // Decode what was written: per-era areas against today's land, the compose inputs, ring sanity.
  const decoded = (topoFeature(topo, topo.objects[spec!.id] as TopoObject) as unknown as FeatureCollection).features;
  const eraFeatures = decoded.filter((f) => f.properties?.kind === 'land');
  const today = kmOf(land);
  for (const [i, era] of eras.entries()) {
    const f = eraFeatures[i];
    if (!f) throw new Error(`topology lost era ${era.id}`);
    const km2 = kmOf(toFc([f]));
    log(`  ${era.id} [${era.from ?? '…'}, ${era.to ?? '…'}): ${km2.toFixed(2)} km², ${(km2 - today).toFixed(2)} km² against today's ${today.toFixed(2)} km²`);
    writeJson(topic.workFile(`coast-${era.id}.geojson`), toFc([f]));
  }
  const rings = ringIssues(areaFeatures(toFc(eraFeatures)).flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)));
  log(`rings: ${rings.rings}, zero-area ${rings.zeroArea}, self-crossing ${rings.selfCrossing}`);
  if (rings.zeroArea || rings.selfCrossing) warn(`${spec!.id}.json has zero-area or self-crossing rings`);
  log(`  work/coast-<era>.geojson: ${eras.map((e) => e.id).join(', ')} (the decoded published coasts)`);
  const todayLines = decoded.flatMap((f) => (f.properties?.kind === 'coast-today' && f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : []));
  if (todayLines.length) {
    const d = deviation(outline, todayLines);
    log(`deviation of today's outline vertices from the written coast-today line (m): p50 ${d.p50.toFixed(1)}, p95 ${d.p95.toFixed(1)}, max ${d.max.toFixed(1)} (${d.n} vertices sampled)`);
  }
}

async function main(): Promise<void> {
  const ds = topic.sources.datasets[spec!.dataset];
  if (!ds) throw new Error(`pipeline.localLand.dataset: unknown dataset ${spec!.dataset}`);
  const source = readJson<FeatureCollection>(topic.rawFile(ds.file));
  log(`${spec!.id}: ${source.features.length} polygons of ${ds.file} [${ds.ref}] -> one land`);
  // Original outline (dissolved, unsimplified) for the deviation report.
  let outline = await mapshaper('-i a.json -dissolve2', { a: toFc(areaFeatures(source).map((f) => ({ ...f, properties: {} }))) });
  if (spec!.water) outline = await cutWater(outline, spec!.water);
  const land = await mapshaper(
    `-i a.json -simplify dp interval=${spec!.simplifyM} keep-shapes -filter-islands min-area=${spec!.minIslandKm2}km2 -clean`,
    { a: outline },
  );
  const mask = await maskFor(land);
  if (spec!.eras?.length) {
    await writeEras(spec!.eras, outline, land, mask);
    return;
  }
  const tagged = toFc([
    ...areaFeatures(mask).map((f) => ({ ...f, properties: { kind: 'mask' } })),
    ...areaFeatures(land).map((f) => ({ ...f, properties: { kind: 'land' } })),
    ...(spec!.coastToday ? [{ type: 'Feature', properties: { kind: 'coast-today' }, geometry: { type: 'MultiLineString', coordinates: coastTodayLines(partsOf(land)) } } as Feature] : []),
  ]);
  const out = await mapshaperApi().applyCommands(`-i layer.json -rename-layers ${spec!.id} -o out.json format=topojson quantization=100000`, { 'layer.json': tagged });
  const text = (out['out.json'] ?? Object.values(out)[0])?.toString();
  if (!text) throw new Error('mapshaper wrote no topology');
  const file = repoPath(`public/geo/${spec!.id}.json`);
  writeFileSync(file, text);
  const size = statSync(file).size;
  const decoded = readLand(file);
  const rings = ringIssues(decoded.map((f) => f.geometry.coordinates));
  const landParts = areaFeatures(land).reduce((n, f) => n + (f.geometry.type === 'Polygon' ? 1 : f.geometry.coordinates.length), 0);
  log(`${file}: ${(size / 1024).toFixed(0)} KB (budget ${spec!.budgetKB} KB), ${landParts} land polygons, DP ${spec!.simplifyM} m, islands >= ${spec!.minIslandKm2} km²`);
  if (size > spec!.budgetKB * 1024) warn(`${spec!.id}.json is over its ${spec!.budgetKB} KB budget`);
  log(`rings: ${rings.rings}, zero-area ${rings.zeroArea}, self-crossing ${rings.selfCrossing}`);
  if (rings.zeroArea || rings.selfCrossing) warn(`${spec!.id}.json has zero-area or self-crossing rings`);
  const d = deviation(outline, decoded.flatMap((f) => f.geometry.coordinates));
  log(`deviation of the original outline vertices from the written coast (m): p50 ${d.p50.toFixed(1)}, p95 ${d.p95.toFixed(1)}, max ${d.max.toFixed(1)} (${d.n} vertices sampled)`);
}

await main();
