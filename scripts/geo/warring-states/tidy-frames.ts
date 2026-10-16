/**
 * Tidy the shoreline-clipped frames (run after shore-clip.ts, before finalize-control.ts).
 *
 * 1. Interior holes of a feature that no other feature of the same frame fills are
 *    tracing gaps between neighbouring source classes (the printed border line of the
 *    source map), not territory: they are closed. Holes occupied by another holder
 *    (Wey inside Wei, Lu inside Qi) are kept.
 * 2. Detached parts under DROP_KM2 of a feature that also has a larger part are
 *    pixel confetti left by class subtraction (the residual Jin of K6): dropped.
 *    A feature made only of small parts is kept whole.
 * 3. Labels say what the late frames are: K9 and K10 keep the 280 BCE source outlines
 *    ("QIN (280 BCE outline)"), K11 is the approximate union of the conquered states.
 * No edge is invented: every remaining outline is still a traced source edge.
 */
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { mapshaperApi, toFc, writeJson } from '../lib/common';
import { array, features, object, polygons, readJson, required, string, topology as narrowTopology } from './strict-input';

const path = 'src/content/topics/warring-states/data/control.json';
const DROP_KM2 = 150;
const control = object(readJson(path));
const topology = narrowTopology(control.topology);
const keyframes = array(control.keyframes).map((value) => ({ t: string(object(value).t), object: string(object(value).object) }));

const ringKm2 = (ring: Position[]): number => {
  let a = 0;
  let lat = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p = required(ring[i], 'ring vertex');
    const q = required(ring[i + 1], 'ring vertex');
    a += (p[0] ?? 0) * (q[1] ?? 0) - (q[0] ?? 0) * (p[1] ?? 0);
    lat += p[1] ?? 0;
  }
  lat /= Math.max(1, ring.length - 1);
  return Math.abs(a / 2) * 111.32 * 111.32 * Math.cos((lat * Math.PI) / 180);
};
const inside = (pt: Position, ring: Position[]): boolean => {
  const x = pt[0] ?? 0, y = pt[1] ?? 0;
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = required(ring[i], 'v'), b = required(ring[j], 'v');
    const ya = a[1] ?? 0, yb = b[1] ?? 0, xa = a[0] ?? 0, xb = b[0] ?? 0;
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) hit = !hit;
  }
  return hit;
};
const centroid = (ring: Position[]): Position => {
  const n = Math.max(1, ring.length - 1);
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) { const p = required(ring[i], 'v'); x += p[0] ?? 0; y += p[1] ?? 0; }
  return [x / n, y / n];
};

const ZH: Record<string, string> = { qin: '秦', chu: '楚', han: '韩', lu: '鲁', qi: '齐', wei: '魏', wey: '卫', yan: '燕', zhao: '赵' };
const relabel = (frame: string, holder: string): { en: string; zh: string } | undefined => {
  if (frame === 'K9' || frame === 'K10') return { en: `${holder.toUpperCase()} (280 BCE outline)`, zh: `${required(ZH[holder], holder)}（前280年轮廓）` };
  if (frame === 'K11') return { en: 'QIN EMPIRE (approximate)', zh: '秦帝国（示意）' };
  return undefined;
};
const files: Record<string, FeatureCollection> = {};
const report: Record<string, { filled: number; filledKm2: number; dropped: number; droppedKm2: number }> = {};
for (const frame of keyframes) {
  const raw = features(feature(topology, required(topology.objects[frame.object], frame.object)));
  const items: Feature<MultiPolygon, Record<string, unknown>>[] = raw.map((item) => ({
    type: 'Feature', properties: object(item.properties), geometry: { type: 'MultiPolygon', coordinates: polygons(item.geometry) },
  }));
  const stat = { filled: 0, filledKm2: 0, dropped: 0, droppedKm2: 0 };
  for (const item of items) {
    const others = items.filter((o) => o !== item).flatMap((o) => o.geometry.coordinates.map((poly) => required(poly[0], 'outer')));
    const parts = item.geometry.coordinates;
    const largest = Math.max(...parts.map((poly) => ringKm2(required(poly[0], 'outer'))));
    const kept: Position[][][] = [];
    for (const poly of parts) {
      const outer = required(poly[0], 'outer');
      const km2 = ringKm2(outer);
      if (km2 < DROP_KM2 && largest >= DROP_KM2) { stat.dropped++; stat.droppedKm2 += km2; continue; }
      const holes = poly.slice(1).filter((hole) => {
        const c = centroid(hole);
        const occupied = others.some((ring) => inside(c, ring));
        if (!occupied) { stat.filled++; stat.filledKm2 += ringKm2(hole); }
        return occupied;
      });
      kept.push([outer, ...holes]);
    }
    item.geometry.coordinates = kept;
  }
  report[frame.object] = { filled: stat.filled, filledKm2: Math.round(stat.filledKm2), dropped: stat.dropped, droppedKm2: Math.round(stat.droppedKm2) };
  for (const item of items) {
    const p = item.properties;
    const label = relabel(frame.object, string(p.holder)) ?? (p.label === undefined ? {} : object(p.label));
    item.properties = { holder: string(p.holder), label_en: label.en ?? '', label_zh: label.zh ?? '', src: array(p.src ?? []).map(string).join(',') };
  }
  files[`${frame.object}.json`] = toFc(items as Feature<Polygon | MultiPolygon, Record<string, unknown>>[]);
}
const ids = keyframes.map((frame) => frame.object);
const output = await mapshaperApi().applyCommands(`-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -clean target=* -o out.json format=topojson quantization=400000 target=*`, files);
const result = object(JSON.parse(required(output['out.json'], 'mapshaper topology output').toString()) as unknown);
for (const value of Object.values(object(result.objects))) {
  for (const item of array(object(value).geometries)) {
    const geometry = object(item), properties = object(geometry.properties);
    geometry.properties = { holder: properties.holder, label: { en: properties.label_en, zh: properties.label_zh }, src: [...new Set(String(properties.src ?? '').split(',').filter(Boolean))], certainty: 'approximate' };
  }
}
writeJson(path, { topology: result, keyframes });
writeJson('scripts/geo/warring-states/tidy-audit.json', { method: `Close holes no other holder fills; drop detached parts under ${DROP_KM2} km² of features that have a larger part`, frames: report }, true);
console.log('Tidied', ids.length, 'frames', JSON.stringify(report));
