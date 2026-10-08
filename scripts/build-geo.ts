/**
 * Build the GeoStage basemap from Natural Earth (via the `world-atlas`
 * TopoJSON redistribution) into `public/geo/`:
 *
 *   land-50m.json       FeatureCollection of land polygons
 *   countries-50m.json  FeatureCollection of country polygons with
 *                       properties { name, lx, ly, rank } — (lx, ly) is a label
 *                       point (centroid of the largest ring), rank 1 = largest
 *   land-10m-sea.json   TopoJSON: Natural Earth 1:10m land for Southeast Asia
 *                       only (bbox 95,-9 -> 125,22), for close-ups (zoom >= 7.5)
 *                       where the 50m coastline is too coarse (Singapore, Johor,
 *                       the Riau islands). One object `sea` with geometries
 *                       { kind: 'frame' } the bbox (the GeoStage paints it in the
 *                       water colour to hide the 50m land underneath),
 *                       { kind: 'land' } the land clipped to the bbox and
 *                       { kind: 'coast' } the coastline without the straight
 *                       clip edges; land and coast share their arcs.
 *
 * Land keeps the 50m detail (3 decimals, ~110 m; light Douglas-Peucker).
 * Countries are an optional reference layer (borders + modern names), so they
 * are simplified harder (~2 km, 2 decimals) to stay inside the 2 MB GeoJSON
 * budget (docs/02). Run `pnpm tsx scripts/build-geo.ts` and commit the output.
 *
 * Antimeridian: world-atlas rings that cross ±180° jump from 180 to -180 in a
 * single segment (Fiji, Chukotka, Wrangel Island, Antarctica). Planar
 * renderers draw such a segment as a line across the whole world (the stray
 * horizontal line on the TimeScene map). `unwrapRing` makes every ring
 * longitude-continuous (|Δlon| ≤ 180, so a ring may extend past ±180; MapLibre
 * wraps that into the neighbouring world copy) and closes rings that wind
 * around a pole (Antarctica) along that pole.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import { unwrapRing } from '../src/engines/time-scene/lib/geo';

type Topology = Parameters<typeof feature>[0];
type TopoObject = Parameters<typeof feature>[1];

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'geo');
const BUDGET_BYTES = 2 * 1024 * 1024;
/** Regional 1:10m land (Southeast Asia): bbox [west, south, east, north] and size budget. */
const SEA_BBOX: [number, number, number, number] = [95, -9, 125, 22];
const SEA_BUDGET_BYTES = 300 * 1024;
/** Douglas–Peucker tolerance (~90 m: about a pixel at zoom 10.5; Natural Earth 10m has little finer detail) and the smallest island kept (~0.5 km²). */
const SEA_TOLERANCE = 0.0008;
const SEA_MIN_ISLAND_DEG2 = 0.00004;
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

function roundRing(input: Position[]): Position[] {
  const ring = simplify(unwrapRing(input), tolerance);
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
  // Rings may extend past ±180 (see unwrapRing); labels go back into range.
  const lx = ((((best.cx + 180) % 360) + 360) % 360) - 180;
  return { lx: round(lx), ly: round(best.cy), area: total };
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

/* ------------------------------------------------------------------ */
/* Regional 1:10m land for Southeast Asia                              */
/* ------------------------------------------------------------------ */

/** Sutherland–Hodgman clip of a ring to an axis-aligned box (convex window; holes clip the same way). */
function clipRing(ring: Position[], [w, s, e, n]: [number, number, number, number]): Position[] {
  type Edge = { inside: (p: Position) => boolean; cut: (a: Position, b: Position) => Position };
  const at = (a: Position, b: Position, t: number): Position => [(a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * t, (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * t];
  const edges: Edge[] = [
    { inside: (p) => (p[0] ?? 0) >= w, cut: (a, b) => at(a, b, (w - (a[0] ?? 0)) / ((b[0] ?? 0) - (a[0] ?? 0))) },
    { inside: (p) => (p[0] ?? 0) <= e, cut: (a, b) => at(a, b, (e - (a[0] ?? 0)) / ((b[0] ?? 0) - (a[0] ?? 0))) },
    { inside: (p) => (p[1] ?? 0) >= s, cut: (a, b) => at(a, b, (s - (a[1] ?? 0)) / ((b[1] ?? 0) - (a[1] ?? 0))) },
    { inside: (p) => (p[1] ?? 0) <= n, cut: (a, b) => at(a, b, (n - (a[1] ?? 0)) / ((b[1] ?? 0) - (a[1] ?? 0))) },
  ];
  let out = ring.slice(0, -1);
  for (const edge of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]!;
      const prev = input[(i + input.length - 1) % input.length]!;
      if (edge.inside(cur)) {
        if (!edge.inside(prev)) out.push(edge.cut(prev, cur));
        out.push(cur);
      } else if (edge.inside(prev)) out.push(edge.cut(prev, cur));
    }
    if (!out.length) return [];
  }
  return [...out, out[0]!];
}

/**
 * Split a clipped ring into runs: coastline, and straight stretches along the
 * clip box. Consecutive runs share their end vertex, so the runs can be used
 * directly as TopoJSON arcs of the ring.
 */
function splitRing(ring: Position[], [w, s, e, n]: [number, number, number, number]): { coast: boolean; pts: Position[] }[] {
  const on = (p: Position, side: number) => [p[0] === w, p[0] === e, p[1] === s, p[1] === n][side];
  const boxSeg = (a: Position, b: Position) => [0, 1, 2, 3].some((side) => on(a, side) && on(b, side));
  const runs: { coast: boolean; pts: Position[] }[] = [];
  for (let i = 0; i + 1 < ring.length; i++) {
    const coast = !boxSeg(ring[i]!, ring[i + 1]!);
    const last = runs[runs.length - 1];
    if (last && last.coast === coast) last.pts.push(ring[i + 1]!);
    else runs.push({ coast, pts: [ring[i]!, ring[i + 1]!] });
  }
  // The ring's start is arbitrary: merge a coast run that wraps through it.
  const first = runs[0];
  const last = runs[runs.length - 1];
  if (runs.length > 1 && first && last && first.coast && last.coast) {
    runs.pop();
    runs[0] = { coast: true, pts: [...last.pts, ...first.pts.slice(1)] };
  }
  return runs;
}

const inBox = ([w, s, e, n]: [number, number, number, number], ring: Position[]) =>
  ring.some((p) => (p[0] ?? 0) >= w && (p[0] ?? 0) <= e && (p[1] ?? 0) >= s && (p[1] ?? 0) <= n);

precision = 1000;
tolerance = SEA_TOLERANCE;
const land10Topo = loadTopo('land-10m.json');
const land10 = feature(land10Topo, land10Topo.objects.land as TopoObject) as FeatureCollection;
const [bw, bs, be, bn] = SEA_BBOX;
/** Quantisation grid: ~30 m cells across the box. */
const Q = 100_000;
const scale: [number, number] = [(be - bw) / (Q - 1), (bn - bs) / (Q - 1)];
const arcs: number[][][] = [];
const addArc = (pts: Position[]): number => {
  const q = pts.map(([x = 0, y = 0]) => [Math.round((x - bw) / scale[0]), Math.round((y - bs) / scale[1])] as [number, number]);
  const coded: number[][] = [];
  let px = 0;
  let py = 0;
  for (const [x, y] of q) {
    coded.push([x - px, y - py]);
    px = x;
    py = y;
  }
  arcs.push(coded);
  return arcs.length - 1;
};
const landArcs: number[][][] = [];
const coastArcs: number[][] = [];
let vertices = 0;
for (const f of land10.features) {
  const g = f.geometry;
  const polys = g?.type === 'Polygon' ? [g.coordinates] : g?.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of polys) {
    const outer = poly[0];
    if (!outer || !inBox(SEA_BBOX, outer)) continue;
    const clipped = roundRing(clipRing(unwrapRing(outer), SEA_BBOX));
    if (clipped.length < 4 || ringStats(clipped).area < SEA_MIN_ISLAND_DEG2) continue;
    const holes = poly.slice(1).map((r) => roundRing(clipRing(unwrapRing(r), SEA_BBOX))).filter((r) => r.length >= 4);
    const rings: number[][] = [];
    for (const r of [clipped, ...holes]) {
      vertices += r.length;
      const ids: number[] = [];
      for (const run of splitRing(r, SEA_BBOX)) {
        const id = addArc(run.pts);
        ids.push(id);
        if (run.coast) coastArcs.push([id]);
      }
      rings.push(ids);
    }
    landArcs.push(rings);
  }
}
const frameArc = addArc([[bw, bs], [be, bs], [be, bn], [bw, bn], [bw, bs]]);
const seaTopo = {
  type: 'Topology',
  transform: { scale, translate: [bw, bs] },
  objects: {
    sea: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Polygon', arcs: [[frameArc]], properties: { kind: 'frame' } },
        { type: 'MultiPolygon', arcs: landArcs, properties: { kind: 'land' } },
        { type: 'MultiLineString', arcs: coastArcs, properties: { kind: 'coast' } },
      ],
    },
  },
  arcs,
};
const seaPath = join(outDir, 'land-10m-sea.json');
writeFileSync(seaPath, JSON.stringify(seaTopo));
const seaSize = statSync(seaPath).size;
console.log(`  ${'land-10m-sea.json'.padEnd(22)} ${(seaSize / 1024).toFixed(0).padStart(6)} KB  (TopoJSON, ${landArcs.length} polygons, ${vertices} vertices)`);
if (seaSize > SEA_BUDGET_BYTES) {
  console.error(`build-geo: land-10m-sea.json over its ${(SEA_BUDGET_BYTES / 1024).toFixed(0)} KB budget`);
  process.exit(1);
}
