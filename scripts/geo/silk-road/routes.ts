/**
 * G5–G7 (docs/73 §3.2): route layers (public/geo/sr-*.json) and the travellers'
 * journeys (data/movements.json), both from itineraries.json.
 *
 *   pnpm tsx scripts/geo/silk-road/points.ts    # first: places.json (Wikidata P625)
 *   pnpm tsx scripts/geo/silk-road/routes.ts
 *
 * Every stop is a place in places.json (Wikidata, CC0), in the order the
 * written source gives (`source` on each line says which text and chapter).
 * Nothing is traced from a map and no coordinate is typed by hand:
 * - a `land` leg is the great-circle line between the two stops (sampled
 *   every 25 km): the stops are recorded, the line between them is not;
 * - a `sea` leg is computed: the plate's land (public/geo/ancient-world-plate.json,
 *   Natural Earth 1:10m) is rasterised to a 0.025° water / land grid, each port is
 *   moved to the nearest cell of water connected to the open sea (within 15 km,
 *   or the place's `snapKm`; an `offshore` place, an island's inland point, is
 *   passed by at sea instead of entered), and an 8-neighbour A* search
 *   with great-circle step costs finds the shortest water path. It is then
 *   simplified (Douglas–Peucker, 3 km, halved until no leg crosses more than
 *   1 km of drawn land). It is a shortest path on today's coast, not a ship's track.
 * The run prints every leg's length and its length over land, and stops when a
 * sea leg cannot be found.
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
import { haversineKm, mapshaperApi } from '../lib/common';

const DIR = 'scripts/geo/silk-road';
const places = (JSON.parse(readFileSync(`${DIR}/places.json`, 'utf8')) as { places: Record<string, { at: [number, number]; offshore?: boolean; snapKm?: number }> }).places;
type Stop = { place: string; leg?: 'land' | 'sea' };
interface Line { id: string; source: string; stops: Stop[]; f?: number; u?: number }
interface LayerPlan { f: number; u: number; note: string; lines: Line[] }
interface MovementPlan { from: string; to: string; linger?: string; holder: string; kind: 'land' | 'sea'; label: { en: string; zh: string }; source: string; stops: Stop[] }
const plan = JSON.parse(readFileSync(`${DIR}/itineraries.json`, 'utf8')) as { layers: Record<string, LayerPlan>; movements: Record<string, MovementPlan> };

/* ---------- land raster ---------- */
const plate = JSON.parse(readFileSync('public/geo/ancient-world-plate.json', 'utf8')) as Parameters<typeof feature>[0] & { objects: Record<string, Parameters<typeof feature>[1]> };
const landFc = (feature(plate, Object.values(plate.objects)[0]!) as unknown as FeatureCollection).features.filter((f) => f.properties?.kind === 'land');
const rings: Position[][] = landFc.flatMap((f) => (f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.flat() : []));
const STEP = 0.025;
const W0 = -20, S0 = -20, E0 = 150, N0 = 66;
const NX = Math.round((E0 - W0) / STEP), NY = Math.round((N0 - S0) / STEP);
const land = new Uint8Array(NX * NY);
{
  // Even-odd scanline fill of every ring at each row's centre latitude.
  const rows: number[][] = Array.from({ length: NY }, () => []);
  for (const r of rings)
    for (let i = 0; i < r.length - 1; i++) {
      const [x1, y1] = r[i] as [number, number], [x2, y2] = r[i + 1] as [number, number];
      if (y1 === y2) continue;
      const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      const j0 = Math.max(0, Math.ceil((lo - S0) / STEP - 0.5)), j1 = Math.min(NY - 1, Math.floor((hi - S0) / STEP - 0.5));
      for (let j = j0; j <= j1; j++) {
        const y = S0 + (j + 0.5) * STEP;
        if (y < lo || y >= hi) continue;
        rows[j]!.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
  rows.forEach((xs, j) => {
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k]! - W0) / STEP - 0.5)), i1 = Math.min(NX - 1, Math.floor((xs[k + 1]! - W0) / STEP - 0.5));
      for (let i = i0; i <= i1; i++) land[j * NX + i] = 1;
    }
  });
}
// Water connected to the open sea: flood-filled from seed points in the oceans, so a port never snaps into an enclosed lagoon cell.
const SEA_SEEDS: Position[] = [[70, 0], [18, 34], [34, 43], [28, 40.75], [-15, 40], [125, 15]];
const sea = new Uint8Array(NX * NY);
{
  const stack: number[] = [];
  for (const p of SEA_SEEDS) {
    const k = Math.floor((p[1]! - S0) / STEP) * NX + Math.floor((p[0]! - W0) / STEP);
    if (!land[k] && !sea[k]) (sea[k] = 1), stack.push(k);
  }
  while (stack.length) {
    const k = stack.pop()!;
    const i = k % NX, j = (k - i) / NX;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
      const nk = nj * NX + ni;
      if (!land[nk] && !sea[nk]) (sea[nk] = 1), stack.push(nk);
    }
  }
}
const cell = (p: Position) => [Math.floor((p[0]! - W0) / STEP), Math.floor((p[1]! - S0) / STEP)] as const;
const centre = (i: number, j: number): Position => [W0 + (i + 0.5) * STEP, S0 + (j + 0.5) * STEP];
const isLand = (p: Position) => {
  const [i, j] = cell(p);
  return i < 0 || j < 0 || i >= NX || j >= NY ? false : land[j * NX + i] === 1;
};

function snap(id: string, maxKm: number): { i: number; j: number; km: number } {
  const p = places[id]!.at;
  const [ci, cj] = cell(p);
  if (sea[cj * NX + ci]) return { i: ci, j: cj, km: 0 };
  const r = Math.ceil(maxKm / 2.7) + 2;
  let best: { i: number; j: number; km: number } | null = null;
  for (let dj = -r; dj <= r; dj++)
    for (let di = -r; di <= r; di++) {
      const i = ci + di, j = cj + dj;
      if (i < 0 || j < 0 || i >= NX || j >= NY || !sea[j * NX + i]) continue;
      const km = haversineKm(p, centre(i, j));
      if (km <= maxKm && (!best || km < best.km)) best = { i, j, km };
    }
  if (!best) throw new Error(`${id}: no water within ${maxKm} km`);
  return best;
}

/** A* over water cells inside the two ports' box plus a margin. */
function seaPath(a: string, b: string): Position[] {
  const reach = (id: string) => (places[id]!.offshore ? 200 : places[id]!.snapKm ?? 15);
  const sa = snap(a, reach(a)), sb = snap(b, reach(b));
  const pad = Math.round(25 / STEP);
  const bi0 = Math.max(0, Math.min(sa.i, sb.i) - pad), bi1 = Math.min(NX - 1, Math.max(sa.i, sb.i) + pad);
  const bj0 = Math.max(0, Math.min(sa.j, sb.j) - pad), bj1 = Math.min(NY - 1, Math.max(sa.j, sb.j) + pad);
  const bw = bi1 - bi0 + 1, bh = bj1 - bj0 + 1;
  const g = new Float64Array(bw * bh).fill(Infinity);
  const prev = new Int32Array(bw * bh).fill(-1);
  const closed = new Uint8Array(bw * bh);
  const key = (i: number, j: number) => (j - bj0) * bw + (i - bi0);
  const kmPerDeg = 111.195;
  const h = (i: number, j: number) => haversineKm(centre(i, j), centre(sb.i, sb.j));
  // Binary heap of [f, key].
  const heap: [number, number][] = [];
  const push = (x: [number, number]) => { heap.push(x); let n = heap.length - 1; while (n > 0) { const p = (n - 1) >> 1; if (heap[p]![0] <= x[0]) break; heap[n] = heap[p]!; n = p; } heap[n] = x; };
  const pop = () => { const top = heap[0]!; const last = heap.pop()!; if (heap.length) { let n = 0; for (;;) { const l = 2 * n + 1, r = l + 1; let m = n; if (l < heap.length && heap[l]![0] < (m === n ? last[0] : heap[m]![0])) m = l; if (r < heap.length && heap[r]![0] < (m === n ? last[0] : heap[m]![0])) m = r; if (m === n) break; heap[n] = heap[m]!; n = m; } heap[n] = last; } return top; };
  const k0 = key(sa.i, sa.j);
  g[k0] = 0;
  push([h(sa.i, sa.j), k0]);
  const goal = key(sb.i, sb.j);
  while (heap.length) {
    const [, k] = pop();
    if (closed[k]) continue;
    closed[k] = 1;
    if (k === goal) break;
    const i = (k % bw) + bi0, j = Math.floor(k / bw) + bj0;
    const coslat = Math.cos(((S0 + (j + 0.5) * STEP) * Math.PI) / 180);
    for (let dj = -1; dj <= 1; dj++)
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = i + di, nj = j + dj;
        if (ni < bi0 || nj < bj0 || ni > bi1 || nj > bj1 || land[nj * NX + ni]) continue;
        const nk = key(ni, nj);
        if (closed[nk]) continue;
        const step = STEP * kmPerDeg * Math.hypot(di * coslat, dj);
        const ng = g[k]! + step;
        if (ng < g[nk]!) { g[nk] = ng; prev[nk] = k; push([ng + h(ni, nj), nk]); }
      }
  }
  if (!closed[goal]) throw new Error(`no sea path ${a} → ${b}`);
  const out: Position[] = [];
  for (let k = goal; k !== -1; k = prev[k]!) out.push(centre((k % bw) + bi0, Math.floor(k / bw) + bj0));
  out.reverse();
  // An offshore place (an island's inland point) is passed by at sea, not entered.
  return [...(places[a]!.offshore ? [] : [places[a]!.at]), ...out, ...(places[b]!.offshore ? [] : [places[b]!.at])];
}

function greatCircle(a: Position, b: Position): Position[] {
  const km = haversineKm(a, b);
  const n = Math.max(1, Math.ceil(km / 25));
  const rad = Math.PI / 180;
  const toV = (p: Position) => [Math.cos(p[1]! * rad) * Math.cos(p[0]! * rad), Math.cos(p[1]! * rad) * Math.sin(p[0]! * rad), Math.sin(p[1]! * rad)];
  const va = toV(a), vb = toV(b);
  const d = Math.acos(Math.min(1, va[0]! * vb[0]! + va[1]! * vb[1]! + va[2]! * vb[2]!));
  if (d < 1e-9) return [a, b];
  const out: Position[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n, s1 = Math.sin((1 - t) * d) / Math.sin(d), s2 = Math.sin(t * d) / Math.sin(d);
    const v = [s1 * va[0]! + s2 * vb[0]!, s1 * va[1]! + s2 * vb[1]!, s1 * va[2]! + s2 * vb[2]!];
    out.push([Math.atan2(v[1]!, v[0]!) / rad, Math.atan2(v[2]!, Math.hypot(v[0]!, v[1]!)) / rad]);
  }
  return out;
}

function dp(pts: Position[], tolDeg: number): Position[] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [x1, y1] = pts[s] as [number, number], [x2, y2] = pts[e] as [number, number];
    let best = -1, bi = -1;
    for (let i = s + 1; i < e; i++) {
      const [x, y] = pts[i] as [number, number];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1e-12;
      const dist = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
      if (dist > best) (best = dist), (bi = i);
    }
    if (best > tolDeg) { keep[bi] = 1; stack.push([s, bi], [bi, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const landKm = (pts: Position[]) => {
  let km = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const d = haversineKm(a, b), n = Math.max(1, Math.ceil(d / 0.5));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      if (isLand([a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t])) km += d / n;
    }
  }
  return km;
};
const lengthKm = (pts: Position[]) => pts.slice(1).reduce((s, p, i) => s + haversineKm(pts[i]!, p), 0);

const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
function build(owner: string, stops: Stop[], kind: 'land' | 'sea'): Position[] {
  const out: Position[] = [];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!.place, b = stops[i]!.place;
    if (!places[a] || !places[b]) throw new Error(`${owner}: unknown place ${places[a] ? b : a}`);
    const mode = stops[i]!.leg ?? kind;
    let pts: Position[];
    if (mode === 'land') pts = greatCircle(places[a]!.at, places[b]!.at);
    else {
      const raw = seaPath(a, b);
      // The ports' own short legs to the snapped water cell are kept; the water path is simplified until it stays off land.
      const head = places[a]!.offshore ? 0 : 1, tail = places[b]!.offshore ? 0 : 1;
      const inner = raw.slice(head, raw.length - tail);
      let tol = 3 / 111.195;
      for (;;) {
        pts = [...raw.slice(0, head), ...dp(inner, tol), ...raw.slice(raw.length - tail)];
        if (landKm(dp(inner, tol)) <= 1 || tol < 0.002) break;
        tol /= 2;
      }
    }
    console.log(`  ${owner} ${a} → ${b} (${mode}): ${lengthKm(pts).toFixed(0)} km, over drawn land ${landKm(pts).toFixed(1)} km`);
    out.push(...(out.length ? pts.slice(1) : pts));
  }
  return out.map((p) => [r5(p[0]!), r5(p[1]!)]);
}

/* ---------- layers ---------- */
const ms = mapshaperApi();
for (const [file, layer] of Object.entries(plan.layers)) {
  console.log(`${file} [${layer.f}, ${layer.u})`);
  const features = layer.lines.map((l) => ({ type: 'Feature', properties: { id: l.id, f: l.f ?? layer.f, u: l.u ?? layer.u, certainty: 'approximate', src: l.source }, geometry: { type: 'LineString', coordinates: build(l.id, l.stops, 'land') } }));
  const out = await ms.applyCommands(`-i lines.json name=${file} -o ${file}.json format=topojson quantization=100000`, { 'lines.json': { type: 'FeatureCollection', features } });
  writeFileSync(`public/geo/${file}.json`, out[`${file}.json`]!.toString());
  const kb = statSync(`public/geo/${file}.json`).size / 1024;
  console.log(`  → public/geo/${file}.json: ${features.length} lines, ${kb.toFixed(0)} KB`);
  if (kb > 150) throw new Error(`${file} over 150 KB`);
}

/* ---------- movements ---------- */
const movements = Object.entries(plan.movements).map(([id, m]) => ({
  id,
  from: m.from,
  to: m.to,
  ...(m.linger ? { linger: m.linger } : {}),
  holder: m.holder,
  kind: m.kind,
  certainty: 'approximate',
  label: m.label,
  path: { type: 'LineString', coordinates: (console.log(id), build(id, m.stops, m.kind)) },
}));
writeFileSync('src/content/topics/silk-road/data/movements.json', `[\n${movements.map((m) => `  ${JSON.stringify(m)}`).join(',\n')}\n]\n`);
console.log(`movements.json: ${movements.length} journeys`);
