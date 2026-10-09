/**
 * Control-point helper shared by georef-svg.ts and georef-raster.ts.
 *
 * Capes and island tips are the control points of maps without city dots.
 * Given a first fit (>= 4 control points), `propose()` predicts where each
 * cape below lies on the source map, snaps that prediction to the extreme
 * land vertex / pixel in the cape's direction, snaps the cape itself to the
 * extreme CShapes coastline vertex in the same direction, and prints the
 * pairs as control points. The reviewer keeps the ones whose residual under
 * the first fit is small and pastes them into sources.json; a cape that is
 * not on the map (or drawn too coarsely) is simply left out.
 */
import type { Feature } from 'geojson';
import { fitModel, laea, type Model } from './fit';
import { haversineKm, readJson } from './common';
import type { ControlPoint } from './manifest';
import type { Topic } from './topic';

export type Pt = [number, number];

export interface Cape {
  name: string;
  /** Approximate position [lng, lat]; the CShapes snap finds the exact tip. */
  at: Pt;
  /** Compass direction the cape points to (N, NE, E, …). */
  dir: string;
}

/** Capes, peninsula tips and island ends of Europe, North Africa and the Middle East. */
export const CAPES_EUROPE: Cape[] = [
  { name: 'Nordkinn', at: [27.65, 71.13], dir: 'N' },
  { name: 'Lindesnes', at: [7.05, 57.98], dir: 'S' },
  { name: 'Skagen', at: [10.6, 57.74], dir: 'NE' },
  { name: 'Cape Wrath', at: [-4.99, 58.62], dir: 'NW' },
  { name: 'Duncansby Head', at: [-3.03, 58.64], dir: 'NE' },
  { name: "Land's End", at: [-5.71, 50.07], dir: 'W' },
  { name: 'Lizard Point', at: [-5.21, 49.96], dir: 'S' },
  { name: 'North Foreland', at: [1.45, 51.38], dir: 'E' },
  { name: 'Mizen Head', at: [-9.82, 51.45], dir: 'SW' },
  { name: 'Malin Head', at: [-7.37, 55.38], dir: 'N' },
  { name: 'Pointe de Corsen', at: [-4.79, 48.41], dir: 'W' },
  { name: 'Cap de la Hague', at: [-1.94, 49.72], dir: 'NW' },
  { name: 'Cabo Ortegal', at: [-7.87, 43.77], dir: 'N' },
  { name: 'Cabo Finisterre', at: [-9.3, 42.88], dir: 'W' },
  { name: 'Cabo de São Vicente', at: [-8.99, 37.02], dir: 'SW' },
  { name: 'Punta de Tarifa', at: [-5.61, 36.0], dir: 'S' },
  { name: 'Cabo de Gata', at: [-2.19, 36.72], dir: 'SE' },
  { name: 'Cabo de la Nao', at: [0.23, 38.73], dir: 'E' },
  { name: 'Cap de Creus', at: [3.32, 42.32], dir: 'E' },
  { name: 'Cap Corse', at: [9.35, 43.01], dir: 'N' },
  { name: 'Capo Teulada', at: [8.64, 38.86], dir: 'S' },
  { name: 'Capo Passero', at: [15.13, 36.69], dir: 'S' },
  { name: 'Capo Lilibeo', at: [12.42, 37.8], dir: 'W' },
  { name: 'Santa Maria di Leuca', at: [18.36, 39.79], dir: 'S' },
  { name: 'Testa del Gargano', at: [16.18, 41.82], dir: 'E' },
  { name: 'Kamenjak (Istria)', at: [13.91, 44.77], dir: 'S' },
  { name: 'Cape Matapan', at: [22.48, 36.39], dir: 'S' },
  { name: 'Cape Sidero (Crete)', at: [26.32, 35.31], dir: 'E' },
  { name: 'Gramvousa (Crete)', at: [23.58, 35.62], dir: 'W' },
  { name: 'Cape Andreas (Cyprus)', at: [34.58, 35.69], dir: 'NE' },
  { name: 'Cape Bon', at: [11.05, 37.08], dir: 'NE' },
  { name: 'Cap Blanc (Bizerte)', at: [9.82, 37.35], dir: 'N' },
  { name: 'Cape Helles', at: [26.18, 40.05], dir: 'SW' },
  { name: 'Cape Sarych (Crimea)', at: [33.72, 44.38], dir: 'S' },
  { name: 'Cape Tarkhankut (Crimea)', at: [32.49, 45.35], dir: 'W' },
  { name: 'Cape Kaliakra', at: [28.47, 43.36], dir: 'E' },
  { name: 'Hel', at: [18.8, 54.6], dir: 'SE' },
  { name: 'Cape Kolka', at: [22.6, 57.76], dir: 'N' },
  { name: 'Hanko', at: [22.92, 59.82], dir: 'S' },
  { name: 'Hoburgen (Gotland)', at: [18.12, 56.92], dir: 'S' },
  { name: 'Smygehuk', at: [13.36, 55.34], dir: 'S' },
  { name: 'Sylt', at: [8.42, 55.05], dir: 'N' },
  { name: 'Reykjanes', at: [-22.7, 63.81], dir: 'SW' },
  { name: 'Langanes', at: [-14.53, 66.38], dir: 'NE' },
  { name: 'Hornbjarg', at: [-22.4, 66.46], dir: 'N' },
  { name: 'Kanin Nos', at: [43.3, 68.65], dir: 'N' },
  { name: 'Capo Peloro', at: [15.65, 38.27], dir: 'NE' },
];

/** The same for East and Southeast Asia and the western Pacific. */
export const CAPES_ASIA: Cape[] = [
  { name: 'Cape Lopatka', at: [156.66, 50.87], dir: 'S' },
  { name: 'Cape Soya', at: [141.94, 45.52], dir: 'N' },
  { name: 'Cape Erimo', at: [143.25, 41.92], dir: 'S' },
  { name: 'Cape Inubo', at: [140.87, 35.7], dir: 'E' },
  { name: 'Cape Muroto', at: [134.18, 33.25], dir: 'S' },
  { name: 'Cape Sata', at: [130.66, 30.99], dir: 'S' },
  { name: 'Cape Crillon (Sakhalin)', at: [141.95, 45.9], dir: 'S' },
  { name: 'Cape Elizavety (Sakhalin)', at: [142.75, 54.42], dir: 'N' },
  { name: 'Chengshan Cape', at: [122.7, 37.4], dir: 'E' },
  { name: 'Lüshun', at: [121.15, 38.72], dir: 'SW' },
  { name: 'Haenam', at: [126.52, 34.3], dir: 'S' },
  { name: 'Eluanbi (Taiwan)', at: [120.85, 21.9], dir: 'S' },
  { name: 'Fugui Cape (Taiwan)', at: [121.54, 25.3], dir: 'N' },
  { name: 'Hainan south', at: [109.5, 18.2], dir: 'S' },
  { name: 'Leizhou', at: [110.2, 20.2], dir: 'S' },
  { name: 'Ca Mau', at: [104.72, 8.6], dir: 'S' },
  { name: 'Mui Dinh', at: [109.46, 12.9], dir: 'E' },
  { name: 'Tanjung Piai', at: [103.51, 1.27], dir: 'S' },
  { name: 'Ujung Aceh', at: [95.22, 5.6], dir: 'NW' },
  { name: 'Lampung', at: [105.8, -5.9], dir: 'S' },
  { name: 'Ujung Kulon', at: [105.2, -6.75], dir: 'W' },
  { name: 'Banyuwangi', at: [114.6, -8.5], dir: 'E' },
  { name: 'Simpang Mengayau', at: [116.75, 7.03], dir: 'N' },
  { name: 'Tanjung Datu', at: [109.65, 2.08], dir: 'W' },
  { name: 'Tanjung Selatan', at: [114.6, -4.15], dir: 'S' },
  { name: 'Luzon north', at: [120.6, 18.6], dir: 'N' },
  { name: 'Tinaca Point', at: [125.4, 5.55], dir: 'S' },
  { name: 'Minahasa', at: [125.2, 1.6], dir: 'NE' },
  { name: 'Tanjung Bira', at: [120.5, -5.6], dir: 'S' },
  { name: 'Timor east', at: [127.3, -8.4], dir: 'E' },
  { name: 'Sorong', at: [130.9, -0.9], dir: 'W' },
  { name: 'East Cape (New Guinea)', at: [150.7, -10.25], dir: 'E' },
  { name: 'Cape York', at: [142.53, -10.69], dir: 'N' },
  { name: 'Cape Londonderry', at: [126.95, -13.75], dir: 'N' },
  { name: 'Ka Lae (Hawaii)', at: [-155.68, 18.91], dir: 'S' },
  { name: 'Dondra Head', at: [80.58, 5.92], dir: 'S' },
  { name: 'Kanyakumari', at: [77.54, 8.08], dir: 'S' },
];

/** Unit vector for a compass direction; `yDown` for SVG / raster space. */
export function dirVec(dir: string, yDown: boolean): Pt {
  const d = dir.toUpperCase();
  let x = 0;
  let y = 0;
  if (d.includes('N')) y += 1;
  if (d.includes('S')) y -= 1;
  if (d.includes('E')) x += 1;
  if (d.includes('W')) x -= 1;
  const n = Math.hypot(x, y) || 1;
  return [x / n, (yDown ? -y : y) / n];
}

/** The point furthest in `dir` among `points` within `r` of `at`. */
export function extreme(points: Iterable<Pt>, at: Pt, r: number, dir: Pt, metric: (a: Pt, b: Pt) => number = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])): Pt | null {
  let best: Pt | null = null;
  let bestScore = -Infinity;
  for (const p of points) {
    if (metric(p, at) > r) continue;
    const s = p[0] * dir[0] + p[1] * dir[1];
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return best;
}

let geoCache: Pt[] | null = null;
/** Every CShapes coastline vertex (the geo side of a cape): the topic's `cshapes` dataset. */
export function geoVertices(topic: Topic): Pt[] {
  if (geoCache) return geoCache;
  const ds = topic.sources.datasets.cshapes;
  const out: Pt[] = [];
  if (ds) {
    const fc = readJson<{ features: Feature[] }>(topic.rawFile(ds.file));
    for (const f of fc.features) {
      const g = f.geometry;
      if (!g) continue;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      for (const p of polys) for (const r of p) for (const v of r) out.push([v[0] ?? 0, v[1] ?? 0]);
    }
  }
  geoCache = out;
  return out;
}

/** Inverse of a fit: [lng, lat] -> source position, fitted on the same control points. */
export function inverseModel(cps: ControlPoint[]): (lng: number, lat: number) => Pt {
  const lng0 = cps.reduce((s, c) => s + c.lnglat[0], 0) / cps.length;
  const lat0 = cps.reduce((s, c) => s + c.lnglat[1], 0) / cps.length;
  const proj = laea(lng0, lat0);
  // Swap roles: fit "source = f(projected geo)" by treating projected geo as the input plane.
  const swapped: ControlPoint[] = cps.map((c) => {
    const [x, y] = proj.forward(c.lnglat[0], c.lnglat[1]);
    return { name: c.name, svg: [x, y], lnglat: [c.svg[0], c.svg[1]] };
  });
  const identity = { name: 'identity', forward: (a: number, b: number): Pt => [a, b], inverse: (a: number, b: number): Pt => [a, b] };
  const m = fitModel(identity, cps.length >= 9 ? 'poly2' : 'affine', swapped);
  return (lng, lat) => {
    const [x, y] = proj.forward(lng, lat);
    return m.toLngLat(x, y);
  };
}

/**
 * Propose cape control points: prediction on the source -> snap to the source
 * land, cape -> snap to CShapes; print the pair and its residual under `model`.
 */
export function propose(
  topic: Topic,
  capes: Cape[],
  cps: ControlPoint[],
  model: Model,
  sourceLand: Pt[],
  bounds: [number, number, number, number],
  srcRadius: number,
): void {
  const inv = inverseModel(cps);
  const geo = geoVertices(topic);
  const out: ControlPoint[] = [];
  for (const cape of capes) {
    const g = extreme(geo, cape.at, 0.35, dirVec(cape.dir, false));
    if (!g) continue;
    const guess = inv(g[0], g[1]);
    if (guess[0] < bounds[0] || guess[1] < bounds[1] || guess[0] > bounds[2] || guess[1] > bounds[3]) continue;
    const s = extreme(sourceLand, guess, srcRadius, dirVec(cape.dir, true));
    if (!s) continue;
    const res = haversineKm(model.toLngLat(s[0], s[1]), g);
    out.push({ name: cape.name, lnglat: [Math.round(g[0] * 1e4) / 1e4, Math.round(g[1] * 1e4) / 1e4], svg: [Math.round(s[0] * 100) / 100, Math.round(s[1] * 100) / 100] });
    process.stdout.write(`${cape.name.padEnd(28)} residual under current fit ${res.toFixed(1).padStart(6)} km\n`);
  }
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}
