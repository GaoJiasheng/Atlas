/**
 * Regional plate land (`topic.basemap.region`, docs/06 "TimeScene" · 区域底图):
 * Natural Earth 1:10m land clipped to the plate and written as one small
 * TopoJSON the GeoStage fills (`kind: land`) and strokes (`kind: coast`, the
 * real coastline only: the straight cuts along the plate's edge get no line).
 * Same method as `public/geo/land-10m-sea.json` (scripts/build-geo.ts): per
 * ring Douglas–Peucker, Sutherland–Hodgman clip to the box, split each clipped
 * ring into coast runs and box runs that become the topology's arcs, quantised
 * and delta-coded. Pure (no IO); the runner is region-land.ts, unit-tested in
 * tests/geo-region.test.ts.
 */
import type { FeatureCollection, Position } from 'geojson';
import { unwrapRing } from '../../../src/engines/time-scene/lib/geo';

export type Box = [number, number, number, number];

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

/** Douglas–Peucker on a polyline (a closed ring keeps its first = last vertex). */
export function simplifyLine(points: readonly Position[], tolerance: number): Position[] {
  if (tolerance <= 0 || points.length < 3) return [...points];
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

/** Sutherland–Hodgman clip of a closed ring to an axis-aligned box. Empty when nothing is inside. */
export function clipRing(ring: readonly Position[], [w, s, e, n]: Box): Position[] {
  type Edge = { inside: (p: Position) => boolean; cut: (a: Position, b: Position) => Position };
  const at = (a: Position, b: Position, t: number): Position => [(a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * t, (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * t];
  const edges: Edge[] = [
    { inside: (p) => (p[0] ?? 0) >= w, cut: (a, b) => { const q = at(a, b, (w - (a[0] ?? 0)) / ((b[0] ?? 0) - (a[0] ?? 0))); return [w, q[1]!]; } },
    { inside: (p) => (p[0] ?? 0) <= e, cut: (a, b) => { const q = at(a, b, (e - (a[0] ?? 0)) / ((b[0] ?? 0) - (a[0] ?? 0))); return [e, q[1]!]; } },
    { inside: (p) => (p[1] ?? 0) >= s, cut: (a, b) => { const q = at(a, b, (s - (a[1] ?? 0)) / ((b[1] ?? 0) - (a[1] ?? 0))); return [q[0]!, s]; } },
    { inside: (p) => (p[1] ?? 0) <= n, cut: (a, b) => { const q = at(a, b, (n - (a[1] ?? 0)) / ((b[1] ?? 0) - (a[1] ?? 0))); return [q[0]!, n]; } },
  ];
  let out = ring.slice(0, -1) as Position[];
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
 * A clipped ring split into runs: `coast: true` for real coastline, `false`
 * for stretches along the box. Consecutive runs share their end vertex.
 */
export function splitRing(ring: readonly Position[], [w, s, e, n]: Box): { coast: boolean; pts: Position[] }[] {
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

/** Planar area of a ring in square degrees. */
export function ringAreaDeg2(ring: readonly Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ((ring[j]![0] ?? 0) - (ring[i]![0] ?? 0)) * ((ring[j]![1] ?? 0) + (ring[i]![1] ?? 0));
  return Math.abs(a / 2);
}

const touches = ([w, s, e, n]: Box, ring: readonly Position[]) => {
  let bw = Infinity, bs = Infinity, be = -Infinity, bn = -Infinity;
  for (const [x = 0, y = 0] of ring) {
    bw = Math.min(bw, x);
    be = Math.max(be, x);
    bs = Math.min(bs, y);
    bn = Math.max(bn, y);
  }
  return bw <= e && be >= w && bs <= n && bn >= s;
};

export interface RegionLandOptions {
  /** Douglas–Peucker tolerance in degrees. */
  tolerance: number;
  /** Rings (islands, lakes) smaller than this many square degrees are dropped. */
  minAreaDeg2: number;
  /** Quantisation grid cells across the box. */
  quantization: number;
}

export interface RegionTopology {
  topology: {
    type: 'Topology';
    bbox: Box;
    transform: { scale: [number, number]; translate: [number, number] };
    objects: Record<string, { type: 'GeometryCollection'; geometries: { type: string; arcs: unknown; properties: { kind: string } }[] }>;
    arcs: number[][][];
  };
  polygons: number;
  vertices: number;
  coastArcs: number;
}

/**
 * Land polygons clipped to `box`, as one TopoJSON object `name` with a
 * `kind: land` MultiPolygon and a `kind: coast` MultiLineString (arcs shared).
 */
export function regionTopology(land: FeatureCollection, box: Box, name: string, options: RegionLandOptions): RegionTopology {
  const [bw, bs, be, bn] = box;
  const q = Math.max(2, Math.round(options.quantization));
  const scale: [number, number] = [(be - bw) / (q - 1), (bn - bs) / (q - 1)];
  // Snap to the grid first, so the box test in `splitRing` sees exact edge coordinates after decoding.
  const snap = ([x = 0, y = 0]: Position): Position => [bw + Math.round((x - bw) / scale[0]) * scale[0], bs + Math.round((y - bs) / scale[1]) * scale[1]];
  const arcs: number[][][] = [];
  const addArc = (pts: Position[]): number => {
    const coded: number[][] = [];
    let px = 0;
    let py = 0;
    for (const [x = 0, y = 0] of pts) {
      const ix = Math.round((x - bw) / scale[0]);
      const iy = Math.round((y - bs) / scale[1]);
      coded.push([ix - px, iy - py]);
      px = ix;
      py = iy;
    }
    arcs.push(coded);
    return arcs.length - 1;
  };
  const tidy = (ring: Position[]): Position[] => {
    const out: Position[] = [];
    for (const p of ring) {
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    }
    if (out.length && (out[0]![0] !== out[out.length - 1]![0] || out[0]![1] !== out[out.length - 1]![1])) out.push(out[0]!);
    return out;
  };
  const prep = (ring: Position[]): Position[] => {
    const simplified = simplifyLine(unwrapRing(ring), options.tolerance);
    // Clip, snap the vertices on the edge exactly onto it, drop repeats.
    return tidy(clipRing(simplified, box).map((p) => {
      const [x, y] = snap(p);
      return [Math.abs(x! - bw) < scale[0] / 2 ? bw : Math.abs(x! - be) < scale[0] / 2 ? be : x!, Math.abs(y! - bs) < scale[1] / 2 ? bs : Math.abs(y! - bn) < scale[1] / 2 ? bn : y!];
    }));
  };
  const landArcs: number[][][] = [];
  const coastArcs: number[][] = [];
  let vertices = 0;
  for (const f of land.features) {
    const g = f.geometry;
    const polys = g?.type === 'Polygon' ? [g.coordinates] : g?.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      const outer = poly[0];
      if (!outer || !touches(box, outer)) continue;
      const clipped = prep(outer);
      if (clipped.length < 4 || ringAreaDeg2(clipped) < options.minAreaDeg2) continue;
      const holes = poly
        .slice(1)
        .filter((r) => touches(box, r))
        .map(prep)
        .filter((r) => r.length >= 4 && ringAreaDeg2(r) >= options.minAreaDeg2);
      const rings: number[][] = [];
      for (const r of [clipped, ...holes]) {
        vertices += r.length;
        const ids: number[] = [];
        for (const run of splitRing(r, box)) {
          const id = addArc(run.pts);
          ids.push(id);
          if (run.coast) coastArcs.push([id]);
        }
        rings.push(ids);
      }
      landArcs.push(rings);
    }
  }
  return {
    topology: {
      type: 'Topology',
      bbox: box,
      transform: { scale, translate: [bw, bs] },
      objects: {
        [name]: {
          type: 'GeometryCollection',
          geometries: [
            { type: 'MultiPolygon', arcs: landArcs, properties: { kind: 'land' } },
            { type: 'MultiLineString', arcs: coastArcs, properties: { kind: 'coast' } },
          ],
        },
      },
      arcs,
    },
    polygons: landArcs.length,
    vertices,
    coastArcs: coastArcs.length,
  };
}

/** km per degree of latitude (tolerances are given in km). */
export const KM_PER_DEG = 111.195;
