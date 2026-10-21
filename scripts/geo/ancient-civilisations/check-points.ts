/**
 * G5 check: every event and site point of the topic against the plate's land
 * (public/geo/ancient-world-plate.json, Natural Earth 1:10m, DP 2 km). A point
 * in the sea is listed with its distance to the nearest land vertex, so a
 * coastal city that the 2 km coast leaves offshore can be told from a wrong
 * coordinate.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/check-points.ts
 */
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
import { haversineKm, pointInPolygon } from '../lib/common';

const plate = JSON.parse(readFileSync('public/geo/ancient-world-plate.json', 'utf8')) as Parameters<typeof feature>[0] & { objects: Record<string, Parameters<typeof feature>[1]> };
const land = (feature(plate, Object.values(plate.objects)[0]!) as unknown as FeatureCollection).features.filter((f) => f.properties?.kind === 'land');
const polys: Position[][][] = land.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []));
const events = JSON.parse(readFileSync('src/content/topics/ancient-civilisations/data/events.json', 'utf8')) as { id: string; at: [number, number] }[];
let offshore = 0;
for (const e of events) {
  if (polys.some((p) => pointInPolygon(e.at, p))) continue;
  let best = Infinity;
  for (const p of polys) for (const r of p) for (const v of r) if (Math.abs(v[0]! - e.at[0]) < 1 && Math.abs(v[1]! - e.at[1]) < 1) best = Math.min(best, haversineKm(e.at, v));
  offshore++;
  console.log(`${e.id} [${e.at.join(', ')}]: in the sea, ${best.toFixed(1)} km from the drawn coast`);
}
console.log(`${events.length} points, ${offshore} offshore`);
