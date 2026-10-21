/**
 * Land of a regional plate (docs/06 "TimeScene" · 区域底图; skill
 * atlas-history-topic, geo-runbook「区域主题」): clip Natural Earth 1:10m land
 * (the `world-atlas` redistribution already in node_modules, public domain) to
 * the plate of `topic.yaml` `basemap.region` and write `public/geo/<land>.json`.
 *
 *   pnpm tsx scripts/geo/lib/region-land.ts --topic <slug> [--simplify <km>] [--budget <KB>]
 *
 * Reads `basemap.region.bounds` and `.land` from src/content/topics/<slug>/topic.yaml.
 * Optional knobs in scripts/geo/<slug>/sources.json `pipeline.regionLand`:
 * `{ padDeg 0.25, simplifyKm 1, minIslandKm2 4, quantization 50000, budgetKB 200 }`
 * (command-line flags win). The land is cut a little outside the plate
 * (`padDeg`; the GeoStage's paper frame covers it, so no seam shows at the
 * edge). When the file is over budget the tolerance grows by half until it
 * fits. Prints the size, polygon / vertex counts, the tolerance used and the
 * ring check (`rings: N, zero-area 0, self-crossing 0`) for SOURCES-GEO.md.
 *
 * `regionLand.mapshaper: true` (opt-in; docs/43 G1, a plate spanning a
 * continent): the land is first clipped to the padded plate and simplified by
 * mapshaper (`-simplify dp interval=<simplifyKm> keep-shapes`, then `-clean`,
 * which repairs the self-crossings a per-ring Douglas–Peucker leaves in long
 * coasts), and the plate is then cut without a second simplification. Plates
 * without the knob are built exactly as before.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';
import { feature as topoFeature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
import { topicSchema } from '../../../src/content/schema/topic';
import { GEO, ROOT, log, mapshaper, readJson, warn } from './common';
import type { RegionLand } from './manifest';
import { ringIssues } from './rings';
import { KM_PER_DEG, regionTopology, type Box } from './region';

const { values } = parseArgs({ options: { topic: { type: 'string' }, simplify: { type: 'string' }, budget: { type: 'string' } } });
const slug = values.topic;
const yamlFile = slug ? join(ROOT, 'src/content/topics', slug, 'topic.yaml') : '';
if (!slug || !existsSync(yamlFile)) {
  process.stderr.write(`ERROR ${slug ? `no topic "${slug}" (src/content/topics/${slug}/topic.yaml)` : '--topic is required'}\nusage: pnpm tsx scripts/geo/lib/region-land.ts --topic <slug> [--simplify <km>] [--budget <KB>]\n`);
  process.exit(2);
}
const topic = topicSchema.parse(parseYaml(readFileSync(yamlFile, 'utf8')));
const region = topic.basemap?.region;
if (!region) {
  process.stderr.write(`ERROR ${slug}: topic.yaml has no basemap.region\n`);
  process.exit(2);
}

const manifest = join(GEO, slug, 'sources.json');
const knobs: RegionLand = existsSync(manifest) ? (readJson<{ pipeline?: { regionLand?: RegionLand } }>(manifest).pipeline?.regionLand ?? {}) : {};
const padDeg = knobs.padDeg ?? 0.25;
const budgetKB = values.budget ? Number(values.budget) : (knobs.budgetKB ?? 200);
const minIslandKm2 = knobs.minIslandKm2 ?? 4;
const quantization = knobs.quantization ?? 50_000;
let simplifyKm = values.simplify ? Number(values.simplify) : (knobs.simplifyKm ?? 1);

const require = createRequire(import.meta.url);
type Topology = Parameters<typeof topoFeature>[0];
type TopoObject = Parameters<typeof topoFeature>[1];
const world = JSON.parse(readFileSync(require.resolve('world-atlas/land-10m.json'), 'utf8')) as Topology;
const land = topoFeature(world, world.objects.land as TopoObject) as unknown as FeatureCollection;

const [w, s, e, n] = region.bounds;
const box: Box = [Math.max(-180, w - padDeg), Math.max(-85, s - padDeg), Math.min(180, e + padDeg), Math.min(85, n + padDeg)];
const midLat = ((s + n) / 2) * (Math.PI / 180);
const km2PerDeg2 = KM_PER_DEG * KM_PER_DEG * Math.cos(midLat);
const file = join(ROOT, 'public/geo', `${region.land}.json`);

/** The opt-in mapshaper pass: clip to the padded plate, simplify keeping shapes, repair crossings. */
const preSimplified = async (km: number): Promise<FeatureCollection> =>
  mapshaper(`-i land.json -clip bbox=${box.join(',')} -simplify dp interval=${Math.round(km * 1000)} keep-shapes -clean`, { land });

for (let attempt = 0; ; attempt++) {
  const source = knobs.mapshaper ? await preSimplified(simplifyKm) : land;
  const built = regionTopology(source, box, region.land, { tolerance: knobs.mapshaper ? 0 : simplifyKm / KM_PER_DEG, minAreaDeg2: minIslandKm2 / km2PerDeg2, quantization });
  const text = JSON.stringify(built.topology);
  const kb = Buffer.byteLength(text) / 1024;
  if (kb > budgetKB && attempt < 8) {
    log(`  ${kb.toFixed(0)} KB at DP ${simplifyKm.toFixed(2)} km is over the ${budgetKB} KB budget: coarser`);
    simplifyKm *= 1.5;
    continue;
  }
  writeFileSync(file, text);
  const size = statSync(file).size;
  const decoded = topoFeature(built.topology as unknown as Topology, built.topology.objects[region.land] as unknown as TopoObject) as unknown as FeatureCollection;
  const polys: Position[][][] = [];
  for (const f of decoded.features) {
    if (f.properties?.kind !== 'land') continue;
    if (f.geometry.type === 'MultiPolygon') polys.push(...f.geometry.coordinates);
    else if (f.geometry.type === 'Polygon') polys.push(f.geometry.coordinates);
  }
  const rings = ringIssues(polys);
  log(`${slug}: Natural Earth 1:10m land (world-atlas land-10m.json, public domain) clipped to [${box.join(', ')}] (plate ${region.bounds.join(', ')} + ${padDeg}°)`);
  log(`${file}: ${(size / 1024).toFixed(0)} KB (budget ${budgetKB} KB), ${built.polygons} polygons, ${built.vertices} vertices, ${built.coastArcs} coast arcs, DP ${simplifyKm.toFixed(2)} km, islands >= ${minIslandKm2} km², grid ${quantization}`);
  log(`rings: ${rings.rings}, zero-area ${rings.zeroArea}, self-crossing ${rings.selfCrossing}`);
  if (size > budgetKB * 1024) warn(`${region.land}.json is over its ${budgetKB} KB budget`);
  if (rings.zeroArea || rings.selfCrossing) warn(`${region.land}.json has zero-area or self-crossing rings`);
  break;
}
