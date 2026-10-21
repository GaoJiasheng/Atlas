/**
 * G4 (docs/43 §3.4): the four Southeast Asian "spheres" as dated area layers
 * (topic.yaml `datedLayers`, docs/06 「按年份出现的图层」).
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/inventory.ts   # first: raw/cliopatria-spheres.geojson
 *   pnpm tsx scripts/geo/ancient-civilisations/build-spheres.ts
 *
 * Every Cliopatria v0.2.1 record of Srivijaya, the Khmer Empire, Majapahit
 * and the Sultanate of Malacca up to the year in keyframes.json `spheres`
 * becomes one geometry with `{ f: FromYear, u: ToYear + 1, certainty:
 * "approximate" }` (the README's years are inclusive; the engine's `[f, u)`
 * is not). Each is clipped to the plate's land (Natural Earth 1:10m, so the
 * tint stops at the one drawn coast), simplified (mapshaper DP 1 km,
 * keep-shapes; no -clean, which would merge records that overlap in place) and written as TopoJSON `public/geo/<file>.json` with
 * one object named like the file. Records overlap in time only where
 * Cliopatria's own do not (they are consecutive); the layers overlap each
 * other freely (docs/43 §0-7).
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import type { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { mapshaperApi } from '../lib/common';
import { ringIssues } from '../lib/rings';

const DIR = 'scripts/geo/ancient-civilisations';
const LAND = 'public/geo/ancient-world-plate.json';
const plan = JSON.parse(readFileSync(`${DIR}/keyframes.json`, 'utf8')) as { spheres: { file: string }[] };
const all = JSON.parse(readFileSync(`${DIR}/raw/cliopatria-spheres.geojson`, 'utf8')) as FeatureCollection;
const ms = mapshaperApi();
const plate = JSON.parse(readFileSync(LAND, 'utf8')) as Parameters<typeof feature>[0] & { objects: Record<string, Parameters<typeof feature>[1]> };
const plateFc = feature(plate, Object.values(plate.objects)[0]!) as unknown as FeatureCollection;
const land: FeatureCollection = { type: 'FeatureCollection', features: plateFc.features.filter((f) => f.properties?.kind === 'land') };

for (const s of plan.spheres) {
  const fc: FeatureCollection = { type: 'FeatureCollection', features: all.features.filter((f) => f.properties?.file === s.file).map((f) => ({ ...f, properties: { f: f.properties!.f, u: f.properties!.u, certainty: 'approximate' } })) };
  const out = await ms.applyCommands(
    `-i land.json spheres.json combine-files -rename-layers land,${s.file} -clip land target=${s.file} -simplify dp interval=1000 keep-shapes target=${s.file} -o ${s.file}.json format=topojson quantization=100000 target=${s.file}`,
    { 'land.json': land, 'spheres.json': fc },
  );
  const text = out[`${s.file}.json`]!.toString();
  const topo = JSON.parse(text) as { objects: Record<string, { geometries: { properties: { f: number; u: number } }[] }> };
  const geoms = topo.objects[s.file]!.geometries;
  const decoded = feature(topo as unknown as Parameters<typeof feature>[0], topo.objects[s.file] as unknown as Parameters<typeof feature>[1]) as unknown as FeatureCollection;
  const rings = ringIssues(decoded.features.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [])));
  if (rings.zeroArea || rings.selfCrossing) throw new Error(`${s.file}: bad rings ${JSON.stringify(rings)}`);
  writeFileSync(`public/geo/${s.file}.json`, text);
  console.log(`public/geo/${s.file}.json: ${geoms.length} dated areas (${geoms.map((g) => `${g.properties.f}–${g.properties.u}`).join(', ')}), ${(statSync(`public/geo/${s.file}.json`).size / 1024).toFixed(0)} KB; rings: ${rings.rings}, zero-area 0, self-crossing 0`);
}
