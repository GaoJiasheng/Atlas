/**
 * Re-derives the coarse ("scrub") level of detail of cd-land / cd-shelf from their fine level, with the
 * same rules as build.py's simplify_rings (Visvalingam–Whyatt on a local azimuthal projection, one global
 * threshold to the vertex budget, rings under 100 km² of today's area dropped, a ring that would cross
 * itself keeps more). The fine level and every property are left untouched. Used for the scrub-performance
 * pass of 2026-11-16 (docs/72 §9.4), where the pyGPlates build venv was not at hand; build.py's budgets
 * match, so a full rebuild gives the same budget from the raw model.
 *
 *   pnpm tsx scripts/geo/continental-drift/rescrub.ts [--land 6000] [--shelf 4000] [--drop 100] [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Position } from 'geojson';
import { selfCrosses } from '../lib/rings';

const ROOT = resolve(import.meta.dirname, '../../..');
const arg = (name: string, d: number) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? Number(process.argv[i + 1]) : d; };
const BUDGET: Record<string, number> = { 'cd-land': arg('land', 6000), 'cd-shelf': arg('shelf', 4000) };
const DROP_KM2 = arg('drop', 100);
const R_EARTH = 6371.0088;
const RAD = Math.PI / 180;

type V = [number, number, number];
interface Topo { type: 'Topology'; transform: { scale: [number, number]; translate: [number, number] }; arcs: [number, number][][]; objects: Record<string, { type: 'GeometryCollection'; geometries: { type: 'MultiPolygon'; arcs: number[][][]; properties: Record<string, unknown> }[] }> }

const vec = ([lon, lat]: Position): V => [Math.cos(lat! * RAD) * Math.cos(lon! * RAD), Math.cos(lat! * RAD) * Math.sin(lon! * RAD), Math.sin(lat! * RAD)];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossV = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V): V => { const n = Math.hypot(...a); return [a[0] / n, a[1] / n, a[2] / n]; };

/** Ring area on the sphere (open ring), triangles from vertex 0. */
function areaKm2(ring: Position[]): number {
  const v = ring.map(vec);
  let total = 0;
  for (let i = 1; i < v.length - 1; i++) {
    const [a, b, c] = [v[0]!, v[i]!, v[i + 1]!];
    total += 2 * Math.atan2(dot(a, crossV(b, c)), 1 + dot(a, b) + dot(b, c) + dot(c, a));
  }
  return Math.abs(total) * R_EARTH ** 2;
}
/** Azimuthal equidistant projection about the ring's mean direction. */
function localXy(ring: Position[]): [number, number][] {
  const v = ring.map(vec);
  const c = norm(v.reduce<V>((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]));
  let e = crossV([0, 0, 1], c);
  if (Math.hypot(...e) < 1e-9) e = [1, 0, 0];
  e = norm(e);
  const n = crossV(c, e);
  return v.map((p) => {
    const ang = Math.acos(Math.max(-1, Math.min(1, dot(p, c))));
    const x = dot(p, e), y = dot(p, n), r = Math.hypot(x, y);
    return r > 1e-15 ? [(x / r) * ang, (y / r) * ang] : [0, 0];
  });
}
const orient = (a: number[], b: number[], c: number[]) => (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!);
/** Visvalingam–Whyatt effective areas (monotone) of an open ring. */
function vwAreas(ring: Position[]): number[] {
  const xy = localXy(ring);
  const n = xy.length;
  if (n <= 3) return new Array(n).fill(Infinity);
  const prev = xy.map((_, i) => (i - 1 + n) % n), next = xy.map((_, i) => (i + 1) % n);
  const tri = (i: number) => Math.abs(orient(xy[prev[i]!]!, xy[i]!, xy[next[i]!]!)) / 2;
  const area = xy.map((_, i) => tri(i));
  const eff = new Array<number>(n).fill(Infinity);
  const alive = new Array<boolean>(n).fill(true);
  // Binary heap of [area, index].
  const heap: [number, number][] = [];
  const push = (x: [number, number]) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p]![0] <= heap[i]![0]) break; [heap[p], heap[i]] = [heap[i]!, heap[p]!]; i = p; } };
  const pop = () => { const top = heap[0]!; const last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l]![0] < heap[m]![0]) m = l; if (r < heap.length && heap[r]![0] < heap[m]![0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i]!, heap[m]!]; i = m; } } return top; };
  area.forEach((a, i) => push([a, i]));
  let left = n, last = 0;
  while (heap.length && left > 3) {
    const [a, i] = pop();
    if (!alive[i] || a !== area[i]) continue;
    last = Math.max(last, a);
    eff[i] = last;
    alive[i] = false;
    left--;
    const p = prev[i]!, q = next[i]!;
    next[p] = q; prev[q] = p;
    for (const k of [p, q]) { area[k] = tri(k); push([area[k]!, k]); }
  }
  return eff;
}

function decodeArc(topo: Topo, i: number): Position[] {
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  let x = 0, y = 0;
  return topo.arcs[i]!.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
}
function encodeRing(topo: Topo, ring: Position[]): [number, number][] | null {
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const q = ring.map(([lon, lat]) => [Math.round((lon! - tx) / sx), Math.round((lat! - ty) / sy)] as [number, number]);
  q.push(q[0]!);
  const dedup = [q[0]!, ...q.slice(1).filter((p, i) => p[0] !== q[i]![0] || p[1] !== q[i]![1])];
  if (dedup.length < 4) return null;
  return dedup.map((p, i) => (i === 0 ? [p[0], p[1]] : [p[0] - dedup[i - 1]![0], p[1] - dedup[i - 1]![1]]));
}

const check = process.argv.includes('--check');
let stale = 0;
for (const stem of ['cd-land', 'cd-shelf']) {
  const file = join(ROOT, 'public/geo', `${stem}.json`);
  const topo = JSON.parse(readFileSync(file, 'utf8')) as Topo;
  const full = topo.objects.full!;
  // Every fine ring, open, with the feature / polygon / ring index it came from.
  const rings: { g: number; p: number; r: number; ring: Position[]; eff: number[] }[] = [];
  let dropped = 0;
  full.geometries.forEach((g, gi) => g.arcs.forEach((poly, pi) => poly.forEach(([a], ri) => {
    const ring = decodeArc(topo, a!).slice(0, -1);
    if (areaKm2(ring) < DROP_KM2) { dropped++; return; }
    rings.push({ g: gi, p: pi, r: ri, ring, eff: vwAreas(ring) });
  })));
  const count = (th: number) => rings.reduce((s, x) => s + x.eff.filter((e) => e >= th).length, 0);
  let lo = 0, hi = 1e-2;
  if (count(Infinity) > BUDGET[stem]!) throw new Error(`${stem}: ${rings.length} rings keep at least ${count(Infinity)} vertices, over the budget; raise --drop`);
  while (count(hi) > BUDGET[stem]!) hi *= 4;
  for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (count(mid) > BUDGET[stem]!) lo = mid; else hi = mid; }
  console.error(`${stem}: ${rings.length} rings, threshold ${hi}`);
  let fixed = 0;
  const kept = rings.map((x) => {
    let t = hi;
    for (;;) {
      const ring = x.ring.filter((_, i) => x.eff[i]! >= t);
      const xy = localXy(ring);
      if (ring.length >= 3 && !selfCrosses([...xy, xy[0]!])) return { ...x, ring };
      if (t === 0) return { ...x, ring };
      t = t > 1e-14 ? t / 4 : 0;
      fixed++;
    }
  });
  // Rebuild the arcs: the fine level's arcs as they are, then one new arc per coarse ring.
  const arcs: [number, number][][] = [];
  const keep = (i: number) => { arcs.push(topo.arcs[i]!); return arcs.length - 1; };
  const fullOut = { ...full, geometries: full.geometries.map((g) => ({ ...g, arcs: g.arcs.map((poly) => poly.map(([a]) => [keep(a!)])) })) };
  const byGeom = new Map<number, Map<number, { r: number; ring: Position[] }[]>>();
  for (const x of kept) {
    const polys = byGeom.get(x.g) ?? new Map(); byGeom.set(x.g, polys);
    const list = polys.get(x.p) ?? []; polys.set(x.p, list); list.push(x);
  }
  const geometries: Topo['objects'][string]['geometries'] = [];
  let vertices = 0;
  for (const [gi, polys] of [...byGeom].sort((a, b) => a[0] - b[0])) {
    const out: number[][][] = [];
    for (const [, list] of [...polys].sort((a, b) => a[0] - b[0])) {
      // A polygon whose outer ring was dropped goes with it.
      if (!list.some((x) => x.r === 0)) continue;
      const idx: number[][] = [];
      for (const x of list.sort((a, b) => a.r - b.r)) {
        const enc = encodeRing(topo, x.ring);
        if (!enc) continue;
        arcs.push(enc); idx.push([arcs.length - 1]); vertices += enc.length - 1;
      }
      if (idx.length && list[0]!.r === 0) out.push(idx);
    }
    if (out.length) geometries.push({ type: 'MultiPolygon', arcs: out, properties: full.geometries[gi]!.properties });
  }
  const next: Topo = { ...topo, objects: { scrub: { type: 'GeometryCollection', geometries }, full: fullOut }, arcs };
  const text = `${JSON.stringify(next)}\n`;
  const before = readFileSync(file, 'utf8');
  console.log(`${stem}: scrub ${vertices} vertices (budget ${BUDGET[stem]}), ${dropped} rings < ${DROP_KM2} km² dropped, ${fixed} rings kept more for crossing, ${geometries.length} features`);
  if (check) { if (text !== before) stale++; } else writeFileSync(file, text);
}
if (check && stale) { console.error('scrub levels differ from rescrub.ts output'); process.exit(1); }
