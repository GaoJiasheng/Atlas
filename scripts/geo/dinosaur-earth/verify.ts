/** Independent decoder/topology acceptance, separate from the Python producer. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { feature } from 'topojson-client';
type Topology = Parameters<typeof feature>[0];
import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { ringIssues } from '../lib/rings.js';
const dir = 'public/geo/';
const manifest = JSON.parse(readFileSync(dir + 'de-reconstruction.json', 'utf8'));
let total = 0;
for (const frame of manifest.frames) {
  const topo = JSON.parse(readFileSync(dir + frame.file + '.json', 'utf8')) as Topology;
  const obj = topo.objects[frame.file]!;
  if (!obj) throw Error('Wrong topology object');
  const fc = feature(topo, obj) as unknown as FeatureCollection;
  const polys = fc.features.flatMap(f => f.geometry.type === 'MultiPolygon' ? (f.geometry as MultiPolygon).coordinates : f.geometry.type === 'Polygon' ? [(f.geometry as Polygon).coordinates] : []);
  const issues = ringIssues(polys);
  if (issues.zeroArea || issues.selfCrossing) throw Error(JSON.stringify({ frame: frame.file, issues }));
  for (const f of fc.features) {
    if (f.properties?.kind === 'coast' && f.geometry.type === 'MultiLineString') {
      const east = frame.sampleBounds[2];
      for (const line of f.geometry.coordinates) for (let i = 1; i < line.length; i++) {
        const a = line[i - 1]!, b = line[i]!;
        if ((a[0] === b[0] && (a[0] === -180 || a[0] === east)) || (a[1] === b[1] && Math.abs(a[1]!) === 85.051129)) throw Error('Frame cut drawn as coast');
        if (Math.abs(a[0]! - b[0]!) > 180) throw Error('Dateline bridge');
      }
    }
    if (f.properties?.modelId !== manifest.modelId || f.properties?.frameMa !== frame.t.ma) throw Error('Frame properties');
    const walk = (c: unknown): void => {
      if (!Array.isArray(c)) return;
      if (typeof c[0] === 'number') {
        const p = c as Position;
        if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]!) > 180 || Math.abs(p[1]!) > 85.051129) throw Error('Bad coordinates');
      } else for (const x of c) walk(x);
    };
    if ('coordinates' in f.geometry) walk(f.geometry.coordinates);
  }
  total += issues.rings;
}
for (const stem of ['de-modern-land', 'de-modern-countries']) {
  const fc = JSON.parse(readFileSync(dir + stem + '.json', 'utf8')) as FeatureCollection<MultiPolygon>;
  const issues = ringIssues(fc.features.flatMap(f => f.geometry.coordinates));
  if (issues.zeroArea || issues.selfCrossing) throw Error('Invalid modern topology');
}
const cards = JSON.parse(readFileSync(dir + 'de-reference-cards.json', 'utf8')).cards;
for (const card of cards) for (const key of ['at', 'geometry', 'coordinates', 'centroid']) if (key in card) throw Error('Coordinate in reference card');
const payloadNames = readdirSync(dir).filter(x => /^de-.*\.json$/.test(x));
const publicBytes = payloadNames.reduce((s, f) => s + statSync(dir + f).size, 0);
const points = JSON.parse(readFileSync(dir + 'de-modern-points.json', 'utf8')).points;
const ids = new Set<string>(), occs = new Set<string>();
for (const p of points) {
  if (p.countryCode === 'MY' || ids.has(p.id)) throw Error('Protection/dedup violation');
  ids.add(p.id);
  for (const a of p.occurrenceAges) { if (occs.has(a.pbdbOccurrenceId)) throw Error('Duplicate occurrence'); occs.add(a.pbdbOccurrenceId); }
}
if (ids.size !== 1274 || occs.size !== 2103) throw Error('PBDB counts');
if (publicBytes > 2_000_000) throw Error('2 MB all-payload budget exceeded: ' + publicBytes);
console.log(JSON.stringify({ frames: manifest.frames.length, rings: total, zeroArea: 0, selfCrossing: 0, collections: ids.size, occurrences: occs.size, publicBytes }, null, 2));
