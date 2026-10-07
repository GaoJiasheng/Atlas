/**
 * Build the GeoStage basemap from Natural Earth (via the `world-atlas`
 * TopoJSON redistribution) into `public/geo/`:
 *
 *   land-50m.json       FeatureCollection of land polygons
 *   countries-50m.json  FeatureCollection of country polygons with
 *                       properties { name, lx, ly, rank } — (lx, ly) is a label
 *                       point (centroid of the largest ring), rank 1 = largest
 *
 * Land keeps the 50m detail (3 decimals, ~110 m; light Douglas-Peucker).
 * Countries are an optional reference layer (borders + modern names), so they
 * are simplified harder (~2 km, 2 decimals) to stay inside the 2 MB GeoJSON
 * budget (docs/02). Run `pnpm tsx scripts/build-geo.ts` and commit the output.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';

type Topology = Parameters<typeof feature>[0];
type TopoObject = Parameters<typeof feature>[1];

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'geo');
const BUDGET_BYTES = 2 * 1024 * 1024;
/** Douglas-Peucker tolerances in degrees. */
const LAND_TOLERANCE = 0.004; // ~450 m: invisible below zoom 8
const COUNTRY_TOLERANCE = 0.02; // ~2 km: borders are an optional reference layer

function loadTopo(name: string): Topology {
  const path = require.resolve(`world-atlas/${name}`);
  return JSON.parse(readFileSync(path, 'utf8')) as Topology;
}

let precision = 1000;
const round = (n: number) => Math.round(n * precision) / precision;

/** Perpendicular distance from p to segment ab (planar degrees). */
function segDist(p: Position, a: Position, b: Position): number {
  const [px = 0, py = 0] = p;
  const [ax = 0, ay = 0] = a;
  const [bx = 0, by = 0] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const u = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
}

/** Douglas-Peucker on an open polyline (iterative). */
function simplify(points: Position[], tolerance: number): Position[] {
  if (tolerance <= 0 || points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let max = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = segDist(points[i]!, points[s]!, points[e]!);
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (idx >= 0 && max > tolerance) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

let tolerance = 0;

/** Simplify, round positions and drop consecutive duplicates created by rounding. */
function roundRing(input: Position[]): Position[] {
  const ring = simplify(input, tolerance);
  const out: Position[] = [];
  for (const p of ring) {
    const q = [round(p[0] ?? 0), round(p[1] ?? 0)];
    const last = out[out.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) out.push(q);
  }
  // Keep rings closed and valid (>= 4 positions).
  const first = out[0];
  const last = out[out.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) out.push([first[0] ?? 0, first[1] ?? 0]);
  return out;
}

function roundGeometry(g: Geometry | null): Polygon | MultiPolygon | null {
  if (!g) return null;
  if (g.type === 'Polygon') {
    const rings = g.coordinates.map(roundRing).filter((r) => r.length >= 4);
    return rings.length ? { type: 'Polygon', coordinates: rings } : null;
  }
  if (g.type === 'MultiPolygon') {
    const polys = g.coordinates
      .map((poly) => poly.map(roundRing).filter((r) => r.length >= 4))
      .filter((poly) => poly.length > 0);
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null;
  }
  return null;
}

/** Planar signed area and centroid of a ring (degrees; fine for ranking and labels). */
function ringStats(ring: Position[]): { area: number; cx: number; cy: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0 = 0, y0 = 0] = ring[j] ?? [];
    const [x1 = 0, y1 = 0] = ring[i] ?? [];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  a /= 2;
  if (a === 0) return { area: 0, cx: ring[0]?.[0] ?? 0, cy: ring[0]?.[1] ?? 0 };
  return { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a) };
}

function labelPoint(g: Polygon | MultiPolygon): { lx: number; ly: number; area: number } {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let best = { area: -1, cx: 0, cy: 0 };
  let total = 0;
  for (const poly of polys) {
    const outer = poly[0];
    if (!outer) continue;
    const s = ringStats(outer);
    total += s.area;
    if (s.area > best.area) best = s;
  }
  return { lx: round(best.cx), ly: round(best.cy), area: total };
}

function write(name: string, fc: FeatureCollection): number {
  const path = join(outDir, name);
  writeFileSync(path, JSON.stringify(fc));
  const size = statSync(path).size;
  console.log(`  ${name.padEnd(22)} ${(size / 1024).toFixed(0).padStart(6)} KB  (${fc.features.length} features)`);
  return size;
}

mkdirSync(outDir, { recursive: true });
console.log('build-geo: Natural Earth 1:50m via world-atlas');

/* land */
tolerance = LAND_TOLERANCE;
const landTopo = loadTopo('land-50m.json');
const landFc = feature(landTopo, landTopo.objects.land as TopoObject) as FeatureCollection;
const land: FeatureCollection = {
  type: 'FeatureCollection',
  features: landFc.features
    .map((f) => roundGeometry(f.geometry))
    .filter((g): g is Polygon | MultiPolygon => g !== null)
    .map((geometry) => ({ type: 'Feature', properties: {}, geometry })),
};

/* countries: borders are thin lines, 2 decimals (~1 km) is plenty */
precision = 100;
tolerance = COUNTRY_TOLERANCE;
const countriesTopo = loadTopo('countries-50m.json');
const countriesFc = feature(countriesTopo, countriesTopo.objects.countries as TopoObject) as FeatureCollection;
const countryFeatures: { f: Feature; area: number }[] = [];
for (const f of countriesFc.features) {
  const geometry = roundGeometry(f.geometry);
  if (!geometry) continue;
  const { lx, ly, area } = labelPoint(geometry);
  const name = String((f.properties as { name?: string } | null)?.name ?? '');
  countryFeatures.push({ f: { type: 'Feature', properties: { name, lx, ly }, geometry }, area });
}
countryFeatures.sort((a, b) => b.area - a.area);
countryFeatures.forEach((c, i) => ((c.f.properties as Record<string, unknown>).rank = i + 1));
const countries: FeatureCollection = { type: 'FeatureCollection', features: countryFeatures.map((c) => c.f) };

const total = write('land-50m.json', land) + write('countries-50m.json', countries);
console.log(`  total ${(total / 1024).toFixed(0)} KB (budget ${(BUDGET_BYTES / 1024).toFixed(0)} KB)`);
if (total > BUDGET_BYTES) {
  console.error('build-geo: over the 2 MB GeoJSON budget');
  process.exit(1);
}
