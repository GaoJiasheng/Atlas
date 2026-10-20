/**
 * Build real-data dated layers. Repro: layers-fetch.ts, then this file.
 * Python requirements: shapely, pyproj; optional matplotlib for review PNGs.
 * Point quantization 100000; polygons simplify 5 m in SVY21 then shared mapshaper
 * topology/clean. Reservoir arc integers and transform are copied unchanged.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { mapshaperApi } from '../lib/common';
import { feature } from 'topojson-client';
type Topology = Parameters<typeof feature>[0];
type GeometryCollection = Extract<Topology['objects'][string], { type: 'GeometryCollection' }>;

const base = dirname(fileURLToPath(import.meta.url));
const root = resolve(base, '../../..');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const python = process.env.ATLAS_GEO_PYTHON || [join(base, 'work/venv/bin/python'), join(base, 'work/layers-venv/bin/python')].find(existsSync) || 'python3';
execFileSync(python, [join(base, 'layers-build.py')], { stdio: ['ignore', 'ignore', 'inherit'] });
const budgets: Record<string, { features: number; bytes: number; gzipBytes: number }> = {};
for (const id of ['hdb-blocks', 'estates', 'farm-parks', 'reserves']) {
  const file = `sg-${id}`;
  const input = read(join(base, `work/layers-${id}.geojson`));
  const clean = id === 'hdb-blocks' ? '' : ' -clean';
  const out = await mapshaperApi().applyCommands(`-i input.geojson -rename-layers ${file}${clean} -o output.json format=topojson quantization=100000`, { 'input.geojson': input });
  let output = out['output.json'];
  if (output === undefined) throw new Error(`Mapshaper did not write ${file}`);
  if (id !== 'hdb-blocks') {
    const cleaned = await mapshaperApi().applyCommands('-i quantized.json -clean snap-interval=0.000005 -o output.json format=topojson quantization=100000', { 'quantized.json': output });
    output = cleaned['output.json'];
    if (output === undefined) throw new Error(`Mapshaper post-quantization clean failed for ${file}`);
  }
  const bytes = Buffer.from(output);
  writeFileSync(join(root, `public/geo/${file}.json`), bytes);
  const topology = JSON.parse(bytes.toString()) as Topology;
  const object = topology.objects[file];
  if (!object) throw new Error(`Mapshaper did not name its object ${file}`);
  writeFileSync(join(base, `work/layers-final-${id}.geojson`), JSON.stringify(feature(topology, object)));
  budgets[id] = { features: input.features.length, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
}
// Four-taps is the canonical water chronology: match labels to unchanged site events.
const water = read(join(root, 'src/content/topics/four-taps/data/control.json'));
const events = read(join(root, 'src/content/topics/four-taps/data/events.json')) as { id: string; t: string; title: { en: string; zh: string }; sources: string[] }[];
const canonical = water.topology as Topology;
const latest = Object.values(canonical.objects).at(-1) as GeometryCollection;
function decimal(t: string): number {
  const [year, month = '01', day = '01'] = t.split('-');
  const y = Number(year);
  return y + (Date.UTC(y, Number(month) - 1, Number(day)) - Date.UTC(y, 0, 1)) / (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1));
}
const manifest: unknown[] = [];
const geoms = latest.geometries.map(g => {
  const label = (g.properties as Record<string, unknown>)?.label as { en: string; zh: string };
  const event = events.find(e => e.title.en === label.en);
  if (!event) throw new Error(`No four-taps site event for ${label.en}`);
  const f = decimal(event.t);
  manifest.push({ id: event.id, label, originalT: event.t, f, sources: event.sources });
  return { ...g, properties: { id: event.id, label, f } };
}).sort((a,b) => a.properties.f - b.properties.f);
const reservoirs = { ...canonical, objects: { 'sg-reservoirs': { type: 'GeometryCollection', geometries: geoms } } };
// Preserve all arcs (also unused upstream arcs) so equality is simple and auditable.
const bytes = Buffer.from(JSON.stringify(reservoirs));
writeFileSync(join(root, 'public/geo/sg-reservoirs.json'), bytes);
budgets.reservoirs = { features: geoms.length, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
writeFileSync(join(base, 'work/layers-reservoir-manifest.json'), JSON.stringify(manifest, null, 2));
writeFileSync(join(base, 'work/layers-reservoirs.geojson'), JSON.stringify(feature(reservoirs as unknown as Topology, reservoirs.objects['sg-reservoirs'] as unknown as GeometryCollection)));
const statistics = read(join(base, 'work/layers-statistics.json'));
statistics.budgets = budgets;
writeFileSync(join(base, 'work/layers-statistics.json'), JSON.stringify(statistics, null, 2));
if (budgets['hdb-blocks']!.gzipBytes > 300000) throw new Error('HDB gzip budget exceeded');
if (Object.entries(budgets).filter(([id]) => id !== 'hdb-blocks').reduce((n,[,b]) => n+b.bytes,0) > 400000) throw new Error('Area layer budget exceeded');
process.stdout.write(`${JSON.stringify(budgets, null, 2)}\nHDB matched ${statistics.hdb.matched}/${statistics.hdb.residentialRows} (${(100*statistics.hdb.rate).toFixed(3)}%)\n`);
