/**
 * G6 (docs/43 §3.5): the schematic sea routes in data/movements.json.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/routes.ts
 *
 * Ports come from places.json (Wikidata P625); between them only sea
 * waypoints from route-waypoints.json, each written to keep the line at sea
 * (never a recorded track). Every leg is sampled every 1 km against the
 * plate's land (public/geo/ancient-world-plate.json) and its length over
 * land is printed: legs into river ports (Óc Eo, Guangzhou, Palembang) cross
 * land by design and say so; any other leg over 5 km stops the run.
 * Not drawn (docs/43 §3.5, notes-D): the Belitung ship's voyage (port of
 * departure unknown) and the Chola raid of 1025 (no source names the port or
 * the route).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
import { haversineKm, pointInPolygon } from '../lib/common';

const DIR = 'scripts/geo/ancient-civilisations';
const places = (JSON.parse(readFileSync(`${DIR}/places.json`, 'utf8')) as { places: Record<string, { at: [number, number] }> }).places;
type Stop = { place?: string; at?: [number, number]; note?: string };
const plan = JSON.parse(readFileSync(`${DIR}/route-waypoints.json`, 'utf8')) as { routes: Record<string, Stop[]> };

const plate = JSON.parse(readFileSync('public/geo/ancient-world-plate.json', 'utf8')) as Parameters<typeof feature>[0] & { objects: Record<string, Parameters<typeof feature>[1]> };
const land = (feature(plate, Object.values(plate.objects)[0]!) as unknown as FeatureCollection).features.filter((f) => f.properties?.kind === 'land');
const polys: Position[][][] = land.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []));
const bbox = polys.map((p) => {
  const xs = p[0]!.map((q) => q[0]!), ys = p[0]!.map((q) => q[1]!);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
});
const onLand = (pt: Position) => polys.some((p, i) => {
  const b = bbox[i]!;
  return pt[0]! >= b[0] && pt[0]! <= b[2] && pt[1]! >= b[1] && pt[1]! <= b[3] && pointInPolygon(pt, p);
});

const coords: Record<string, Position[]> = {};
let bad = 0;
for (const [id, stops] of Object.entries(plan.routes)) {
  const pts = stops.map((s) => (s.place ? places[s.place]!.at : s.at!) as Position);
  coords[id] = pts;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const km = haversineKm(a, b);
    const n = Math.max(1, Math.ceil(km));
    let landKm = 0;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      if (onLand([a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t])) landKm += km / n;
    }
    const allowed = Boolean(stops[i]!.note || stops[i - 1]!.note) || stops[i]!.place !== undefined || stops[i - 1]!.place !== undefined;
    const flag = landKm > 5 && !(allowed && (stops[i]!.note || stops[i - 1]!.note)) ? (bad++, '  OVER 5 km') : '';
    if (landKm > 0.5 || flag) console.log(`${id} leg ${i}: ${km.toFixed(0)} km, ${landKm.toFixed(1)} km over land${flag}${stops[i]!.note ? ` (${stops[i]!.note})` : stops[i - 1]!.note ? ` (${stops[i - 1]!.note})` : ''}`);
  }
}

const label = {
  'monsoon-routes': { en: 'Monsoon sea routes (schematic)', zh: '季风海路（示意）' },
  'yijing-voyage-671': { en: 'Yijing sails to Srivijaya, 671 (schematic)', zh: '义净航往室利佛逝，671 年（示意）' },
} as Record<string, { en: string; zh: string }>;
const timing = {
  'monsoon-routes': { from: '-0200', to: '-0200', persist: true },
  'yijing-voyage-671': { from: '0671-01', to: '0671-12', linger: '0700' },
} as Record<string, Record<string, unknown>>;
const movements = Object.keys(plan.routes).map((id) => ({
  id,
  ...timing[id],
  holder: 'traders',
  kind: 'sea',
  label: label[id],
  path: { type: 'LineString', coordinates: coords[id] },
}));
writeFileSync('src/content/topics/ancient-civilisations/data/movements.json', `[\n${movements.map((m) => `  ${JSON.stringify(m)}`).join(',\n')}\n]\n`);
console.log(`movements.json: ${movements.length} routes`);
if (bad) {
  console.error(`${bad} leg(s) cross more than 5 km of land without a note`);
  process.exit(1);
}
