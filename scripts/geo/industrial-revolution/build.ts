/** Reproducible, licence-isolated industrial-revolution layers. No downloads.
 * pnpm tsx scripts/geo/industrial-revolution/build.ts [--out /private/tmp/ir-geo]
 * ATLAS_GEO_TOOLS may identify an existing scripts/geo/.tools directory.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { feature } from 'topojson-client';
import type { FeatureCollection, MultiPolygon, Position } from 'geojson';
import { ringIssues } from '../lib/rings';

const root = resolve(import.meta.dirname, '../../..');
const research = process.env.ATLAS_IR_RESEARCH ?? '/Users/gavin/work/atlas/art/research/industrial-revolution/data';
const tools = process.env.ATLAS_GEO_TOOLS ?? '/Users/gavin/work/atlas/scripts/geo/.tools';
const requireTool = createRequire(join(tools, 'package.json'));
const ms = requireTool('mapshaper') as { applyCommands(cmd: string, inputs: Record<string, string>): Promise<Record<string, string | Buffer>> };
type CRS = object;
const proj = requireTool('mproj') as { pj_init(s: string): CRS; pj_transform_point(a: CRS, b: CRS, p: Position): void };
const version = (name: string) => (requireTool(`${name}/package.json`) as { version: string }).version;
const staging = process.argv.includes('--out');
const dest = resolve(staging ? process.argv[process.argv.indexOf('--out') + 1]! : join(root, 'public/geo'));
mkdirSync(dest, { recursive: true });
const hashes: Record<string, string> = {
  'rshapes-1.0.geojson': 'c1e52458c7b325153ce079d0d4f3a129fd3549ed21cb8cfce67bb8bf031fde68',
  'rshapes-through-1914-continent.geojson': '92e50dcb6fb7cd7bae8370928eaf57174b5beeb8380da022f191e575f8f051ac',
  'ne-50m-land.geojson': 'e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b',
  'industrial-places.geojson': '392d6cecadb432dfdf6ac07d624c834e4c03dcb793f3e1a7a5cbd5c5d2dcd285',
  'Coal Resources For New Technologies/Coal_Resources_For_New_Technologies_GB.gpkg': 'a4e08896ffd4f25f907494a62d3158ce6a9c9eea974e61df3f806d9d34d80a86',
};
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
for (const [name, expected] of Object.entries(hashes)) {
  if (hash(readFileSync(join(research, name))) !== expected) throw new Error(`Changed research input: ${name}`);
}
function read(name: string): FeatureCollection { return JSON.parse(readFileSync(join(research, name), 'utf8')) as FeatureCollection; }
function points(value: unknown): Position[] {
  if (!Array.isArray(value) || !value.length) return [];
  return typeof value[0] === 'number' ? [value as Position] : value.flatMap(points);
}
function inside([x = 0, y = 0]: Position, ring: Position[]) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [a = 0, b = 0] = ring[i]!, [c = 0, d = 0] = ring[j]!;
    if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) hit = !hit;
  }
  return hit;
}
function assert(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
const raw = read('rshapes-1.0.geojson');
const outer = read('ne-50m-land.geojson').features.flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates[0]!] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.map(p => p[0]!) : []);
const islands = outer.filter(r => inside([-0.13, 51.5], r) || inside([-6.26, 53.35], r));
assert(islands.length === 2, 'Expected two main-island masks');
let removed = 0;
const railway: FeatureCollection = { type: 'FeatureCollection', features: raw.features.filter(f => {
  const ps = points('coordinates' in f.geometry ? f.geometry.coordinates : []);
  assert(ps.every(([x = NaN, y = NaN]) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 180 && Math.abs(y) <= 90), 'Invalid RShapes coordinates');
  const island = ps.some(p => p[0]! > -11 && p[0]! < 2 && p[1]! > 49 && p[1]! < 61 && islands.some(r => inside(p, r)));
  if (island) removed++;
  return !island && Number(f.properties?.year) <= 1914;
}).map(f => {
  const { lid, year, spliced } = f.properties!;
  return { ...f, properties: { id: `rail-seg-${lid}`, f: year, lid, year, spliced, src: ['G4'], licence: 'CC-BY-NC-SA-4.0' } };
}) };
assert(removed === 1061 && railway.features.length === 18804, 'RShapes extraction count changed');
const counts = Object.fromEntries([1760, 1830, 1834, 1840, 1850, 1869, 1871, 1890, 1914].map(y => [y, railway.features.filter(f => Number(f.properties?.f) <= y).length]));
assert(JSON.stringify(Object.values(counts)) === JSON.stringify([0, 0, 35, 428, 1925, 7355, 8339, 15577, 18804]), 'RShapes dated counts changed');
type Topology = Parameters<typeof feature>[0] & { objects: Record<string, { type: string; geometries: { type: string | null; arcs?: unknown; properties: Record<string, unknown> }[] }> };
const restoredRailLids = new Set<number>();
async function topology(fc: FeatureCollection, name: string, interval: number, clean: boolean) {
  const result = await ms.applyCommands(`-i input.geojson -simplify dp interval=${interval} keep-shapes ${clean ? '-clean allow-overlaps rewind' : ''} -o format=topojson quantization=1000000 ${name}.json`, { 'input.geojson': JSON.stringify(fc) });
  const topo = JSON.parse(String(result[`${name}.json`])) as Topology;
  const obj = topo.objects.input!;
  delete topo.objects.input;
  topo.objects[name] = obj;
  // Mapshaper reduces a one-part multi-geometry. Preserve this source contract.
  for (const g of obj.geometries) {
    if (g.type === 'LineString') { g.type = 'MultiLineString'; g.arcs = [g.arcs]; }
    if (g.type === 'Polygon') { g.type = 'MultiPolygon'; g.arcs = [g.arcs]; }
    // Mapshaper serialises property arrays as JSON strings.
    if (typeof g.properties.src === 'string') g.properties.src = JSON.parse(g.properties.src);
  }
  if (!clean) {
    restoredRailLids.clear();
    const originals = new Map(fc.features.map(f => [f.properties?.id, f]));
    for (const g of obj.geometries) {
      const original = originals.get(g.properties.id)!;
      if (original.geometry.type !== 'MultiLineString') continue;
      const arcs = g.arcs as unknown[] | undefined;
      if (g.type !== null && arcs?.length === original.geometry.coordinates.length) continue;
      // DP collapses some small closed railway loops. Restore their actual
      // source coordinates, quantized to the same grid, without inventing a line.
      const { scale, translate } = topo.transform!;
      const restored = original.geometry.coordinates.map(line => {
        let px = 0, py = 0;
        const delta = line.map(p => {
          const x = Math.round((p[0]! - translate[0]!) / scale[0]!), y = Math.round((p[1]! - translate[1]!) / scale[1]!);
          const d = [x - px, y - py]; px = x; py = y; return d;
        });
        topo.arcs.push(delta); return [topo.arcs.length - 1];
      });
      g.type = 'MultiLineString'; g.arcs = restored;
      restoredRailLids.add(Number(g.properties.lid));
    }
  }
  return topo;
}
let railTopo: Topology | undefined;
let railInterval = 750;
const railCandidates: { intervalMetres: number; bytes: number }[] = [];
for (const interval of [750, 1000, 1250, 1500]) {
  railTopo = await topology(railway, 'industrial-rail-rshapes', interval, false);
  railInterval = interval;
  const bytes = Buffer.byteLength(JSON.stringify(railTopo));
  railCandidates.push({ intervalMetres: interval, bytes });
  if (bytes <= 1_500_000) break;
}
assert(railTopo, 'Missing rail topology');
assert(railTopo.objects['industrial-rail-rshapes']!.geometries.length === 18804, 'Rail features lost');
const coalNative = JSON.parse(execFileSync('python3', [join(import.meta.dirname, 'read-bgs.py'), research], { maxBuffer: 30_000_000, encoding: 'utf8' })) as FeatureCollection<MultiPolygon>;
const coal = structuredClone(coalNative);
const src = proj.pj_init('+init=epsg:27700'), dst = proj.pj_init('+proj=longlat +datum=WGS84');
let roundTripMetres = 0;
for (const f of coal.features) for (const p of points(f.geometry.coordinates)) {
  const native = [...p];
  proj.pj_transform_point(src, dst, p);
  assert(p[0]! > -9 && p[0]! < 3 && p[1]! > 49 && p[1]! < 61, 'GB reprojection out of sanity box');
  const back = [...p]; proj.pj_transform_point(dst, src, back);
  roundTripMetres = Math.max(roundTripMetres, Math.hypot(back[0]! - native[0]!, back[1]! - native[1]!));
}
// Treat each ring as a protected shape while simplifying, then restore the
// source's polygon/hole membership. This retains narrow or tiny geological
// exclusions instead of dropping 206 holes under ordinary keep-shapes.
const protectedRings: FeatureCollection = { type: 'FeatureCollection', features: coal.features.flatMap(f => f.geometry.coordinates.flatMap((poly, p) => poly.map((ring, r) => ({ type: 'Feature' as const, properties: { ...f.properties, id: `${f.properties!.id}-p${p}-r${r}`, parent: f.properties!.id, p, r }, geometry: { type: 'Polygon' as const, coordinates: [ring] } })))) };
const coalTopo = await topology(protectedRings, 'industrial-coal-strata', 500, true);
const protectedGeometries = coalTopo.objects['industrial-coal-strata']!.geometries;
coalTopo.objects['industrial-coal-strata']!.geometries = coal.features.map(f => {
  const members = protectedGeometries.filter(g => g.properties.parent === f.properties!.id);
  const arcs = f.geometry.coordinates.map((poly, p) => poly.map((_, r) => {
    const member = members.find(g => g.properties.p === p && g.properties.r === r)!;
    assert(member?.type === 'MultiPolygon', 'Protected coal ring lost');
    const arc = (member.arcs as number[][][])[0]![0]!;
    return r === 0 ? arc : [...arc].reverse().map(i => ~i);
  }));
  return { type: 'MultiPolygon', arcs, properties: { ...f.properties! } };
});
let coalDecoded = feature(coalTopo, coalTopo.objects['industrial-coal-strata']! as Parameters<typeof feature>[1]) as unknown as FeatureCollection<MultiPolygon>;
const signedArea = (r: Position[]) => r.reduce((sum, p, i) => { const q = r[(i + 1) % r.length]!; return sum + p[0]! * q[1]! - q[0]! * p[1]!; }, 0);
function ringsCross(poly: Position[][]) {
  const turn = (a: Position, b: Position, c: Position) => (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!);
  for (let i = 0; i < poly.length; i++) for (let j = i + 1; j < poly.length; j++) {
    const a = poly[i]!, b = poly[j]!;
    for (let m = 1; m < a.length; m++) for (let n = 1; n < b.length; n++) {
      if (turn(a[m - 1]!, a[m]!, b[n - 1]!) * turn(a[m - 1]!, a[m]!, b[n]!) < -1e-20 && turn(b[n - 1]!, b[n]!, a[m - 1]!) * turn(b[n - 1]!, b[n]!, a[m]!) < -1e-20) return true;
    }
  }
  return false;
}
const restoredCoalPolygons: string[] = [];
const holeOutside = (poly: Position[][]) => poly.slice(1).some(ring => !ring.some(p => inside(p, poly[0]!)));
for (const [fi, f] of coalDecoded.features.entries()) for (const [pi, poly] of f.geometry.coordinates.entries()) if (ringsCross(poly) || holeOutside(poly)) {
  const original = coal.features[fi]!.geometry.coordinates[pi]!;
  const arcs = original.map((ring, ri) => {
    const line = (signedArea(ring) > 0) === (ri > 0) ? ring : [...ring].reverse();
    const { scale, translate } = coalTopo.transform!; let px = 0, py = 0;
    const delta = line.map(p => { const x = Math.round((p[0]! - translate[0]!) / scale[0]!), y = Math.round((p[1]! - translate[1]!) / scale[1]!); const d = [x - px, y - py]; px = x; py = y; return d; });
    coalTopo.arcs.push(delta); return [coalTopo.arcs.length - 1];
  });
  (coalTopo.objects['industrial-coal-strata']!.geometries[fi]!.arcs as number[][][])[pi] = arcs;
  restoredCoalPolygons.push(`${f.properties!.id}/polygon-${pi}`);
}
coalDecoded = feature(coalTopo, coalTopo.objects['industrial-coal-strata']! as Parameters<typeof feature>[1]) as unknown as FeatureCollection<MultiPolygon>;
assert(coalDecoded.features.length === 622, 'Coal features lost');
const polygons = coalDecoded.features.flatMap(f => f.geometry.coordinates);
const rings = ringIssues(polygons);
assert(rings.zeroArea === 0 && rings.selfCrossing === 0, `Invalid coal rings: ${JSON.stringify(rings)}`);
for (const r of polygons.flat()) assert(JSON.stringify(r[0]) === JSON.stringify(r.at(-1)), 'Unclosed coal ring');
assert(polygons.every(p => !ringsCross(p)), 'Coal rings cross each other');
assert(polygons.every(p => !holeOutside(p)), 'Coal hole lies outside exterior');
const wrongWinding = polygons.filter(p => p.slice(1).some(r => signedArea(r) * signedArea(p[0]!) >= 0)).length;
assert(wrongWinding === 0, 'Hole/exterior winding mismatch');
const nativePolygons = coalNative.features.flatMap(f => f.geometry.coordinates);
assert(nativePolygons.length === polygons.length, 'Coal polygon components lost');
function deviation(source: FeatureCollection, decoded: FeatureCollection) {
  const distances: number[] = [];
  const byId = new Map(decoded.features.map(f => [String(f.properties?.id), f]));
  for (const f of source.features) {
    const target = byId.get(String(f.properties?.id))!;
    const coords = 'coordinates' in target.geometry ? target.geometry.coordinates : [];
    const lines: Position[][] = [];
    function collect(v: unknown) {
      if (!Array.isArray(v) || !v.length) return;
      if (Array.isArray(v[0]) && typeof v[0][0] === 'number') lines.push(v as Position[]);
      else v.forEach(collect);
    }
    collect(coords);
    const segs = lines.flatMap(r => r.slice(1).map((p, i) => [r[i]!, p]));
    for (const p of points('coordinates' in f.geometry ? f.geometry.coordinates : [])) {
      const cos = Math.cos(p[1]! * Math.PI / 180), scale = 111195;
      let best = Infinity;
      for (const [a, b] of segs) {
        const ax = (a![0]! - p[0]!) * cos * scale, ay = (a![1]! - p[1]!) * scale;
        const bx = (b![0]! - p[0]!) * cos * scale, by = (b![1]! - p[1]!) * scale;
        const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
      }
      distances.push(best);
    }
  }
  distances.sort((a, b) => a - b);
  return { vertices: distances.length, method: 'Every source vertex to nearest output boundary/line of the same source id; local equirectangular metres. Not positional accuracy or a strict Hausdorff bound.', p50Metres: distances[Math.floor(distances.length * .5)], p95Metres: distances[Math.floor(distances.length * .95)], p99Metres: distances[Math.floor(distances.length * .99)], maxMetres: distances.at(-1) };
}
const railDecoded = feature(railTopo, railTopo.objects['industrial-rail-rshapes']! as Parameters<typeof feature>[1]) as unknown as FeatureCollection;
const railDeviation = deviation(railway, railDecoded), coalDeviation = deviation(coal, coalDecoded);
const outputs: Record<string, string> = {
  'industrial-rail-rshapes.json': JSON.stringify(railTopo),
  'industrial-coal-strata.json': JSON.stringify(coalTopo),
  'industrial-places.geojson': readFileSync(join(research, 'industrial-places.geojson'), 'utf8'),
  'control.json': JSON.stringify({ keyframes: [{ t: '1760', features: { type: 'FeatureCollection', features: [] } }, { t: '1914', features: { type: 'FeatureCollection', features: [] } }] }),
  'entities.json': '[]', 'movements.json': '[]',
};
const size = Object.fromEntries(Object.entries(outputs).map(([name, data]) => [name, { bytes: Buffer.byteLength(data), gzipBytes: gzipSync(data).length, sha256: hash(data) }]));
for (const [name, data] of Object.entries(outputs)) {
  const outputDir = staging ? dest : name === 'industrial-places.geojson' ? import.meta.dirname : name.startsWith('industrial-') ? dest : join(root, 'src/content/topics/industrial-revolution/data');
  mkdirSync(outputDir, { recursive: true }); writeFileSync(join(outputDir, name), data);
}
const report = {
  inputs: hashes, tools: { mapshaper: version('mapshaper'), mproj: version('mproj') },
  rail: { rawFeatures: raw.features.length, removedTouchingMainIslands: removed, features: railway.features.length, counts, simplifyMetres: railInterval, candidates: railCandidates, sourceGeometryRestoredLids: [...restoredRailLids], deviation: railDeviation, quantization: 1000000, licence: 'CC-BY-NC-SA-4.0' },
  coal: { features: 622, nativeRings: coalNative.features.flatMap(f => f.geometry.coordinates.flat()).length, nativePolygonComponents: nativePolygons.length, outputPolygonComponents: polygons.length, wrongWinding, interRingCrossingPolygons: 0, holesOutsideExteriors: 0, sourceGeometryRestoredPolygons: restoredCoalPolygons, ...rings, deviation: coalDeviation, simplifyMetres: 500, quantization: 1000000, crsFrom: 'EPSG:27700', crsTo: 'EPSG:4326', transform: 'mproj EPSG registry OSGB36 seven-parameter Helmert → WGS84; no OSTN15 grid supported', maxNumericalRoundTripMetres: roundTripMetres, positionalAccuracy: 'Not independently measured; numerical round trip is not positional accuracy. No survey-level accuracy claim.' },
  sizes: size,
};
writeFileSync(join(import.meta.dirname, 'build-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
