import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { FeatureCollection, Position } from 'geojson';
import { createRotationModel, type RotationFile } from '../../src/engines/time-scene/lib/plateRotation';
import { closeRing, prepareLayer, rotateLayer, unwrapRing, validAt } from '../../src/engines/time-scene/lib/rotatedGeometry';
import { checkRotation } from '../../src/engines/time-scene/rotation-build';
import type { TopicMeta } from '../../src/content/schema/topic';

// TEST geometry and plates only: no scientific claim.
const still: RotationFile = { version: 1, modelId: 'test', anchorPlateId: 0, sequences: [
  { moving: 1, fixed: 0, poles: [[0, 90, 0, 0], [100, 90, 0, 0]] },
  { moving: 2, fixed: 0, poles: [[0, 90, 0, 0], [100, 90, 0, 90]] },
] };
const square = (lon: number, lat: number, d: number): Position[] => [[lon, lat], [lon + d, lat], [lon + d, lat + d], [lon, lat + d], [lon, lat]];
const fc = (rings: Position[][], props: Record<string, unknown>): FeatureCollection => ({ type: 'FeatureCollection', features: rings.map((r) => ({ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [r] } })) });

/** Signed planar area of a lon/lat ring (closed). */
const area = (r: Position[]) => r.slice(1).reduce((s, p, i) => s + (r[i]![0]! * p[1]! - p[0]! * r[i]![1]!), 0) / 2;

describe('rotated geometry (E-CD2)', () => {
  it('shows a feature only inside its valid time', () => {
    const p = { plateId: 1, from: 150, to: 50 };
    expect([151, 150, 100, 50, 49.9].map((t) => validAt(p, t))).toEqual([false, true, true, true, false]);
    const layer = prepareLayer(fc([square(0, 0, 10)], p));
    const model = createRotationModel(still);
    expect(rotateLayer(layer, model, 151).features).toBe(0);
    expect(rotateLayer(layer, model, 150).features).toBe(1);
    expect(rotateLayer(layer, model, 49.9).features).toBe(0);
  });

  it('unwraps a ring across the antimeridian instead of drawing a line across the map', () => {
    const ring: Position[] = [[175, 0], [-175, 0], [-175, 10], [175, 10]];
    expect(unwrapRing(ring)).toBe(0);
    const closed = closeRing(ring, 0.1);
    for (let i = 1; i < closed.length; i++) expect(Math.abs(closed[i]![0]! - closed[i - 1]![0]!)).toBeLessThan(180);
    expect(Math.abs(area(closed))).toBeCloseTo(100, 6);
  });

  it('closes a ring round a pole along that pole', () => {
    const ring: Position[] = [];
    for (let lon = -180; lon < 180; lon += 30) ring.push([lon, -70]);
    const closed = closeRing(ring.map((p) => [...p]), -0.9);
    expect(closed.filter((p) => p[1] === -90)).toHaveLength(5);
    for (let i = 1; i < closed.length; i++) expect(Math.abs(closed[i]![0]! - closed[i - 1]![0]!)).toBeLessThanOrEqual(180);
    // The polar cap from -70° to the pole, all the way round: 360° × 20°.
    expect(Math.abs(area(closed))).toBeCloseTo(360 * 20, 6);
  });

  it('closes a ring that crosses the antimeridian and circles a pole', () => {
    const ring: Position[] = [];
    for (let lon = 170; lon < 530; lon += 20) ring.push([lon > 180 ? lon - 360 : lon, 75]);
    const closed = closeRing(ring, 0.95);
    expect(closed.filter((p) => p[1] === 90)).toHaveLength(5);
    for (let i = 1; i < closed.length; i++) expect(Math.abs(closed[i]![0]! - closed[i - 1]![0]!)).toBeLessThanOrEqual(180);
    expect(Math.abs(area(closed))).toBeCloseTo(360 * 15, 6);
  });

  it('turns a plate by its rotation and keeps rings closed', () => {
    const layer = prepareLayer(fc([square(0, 0, 10)], { plateId: 2, from: 100, to: 0 }));
    const model = createRotationModel(still);
    const out = rotateLayer(layer, model, 100).collection.features[0]!.geometry.coordinates[0]![0]!;
    expect(out[0]![0]).toBeCloseTo(90, 9);
    expect(out[0]).toEqual(out.at(-1));
    expect(Math.abs(area(out))).toBeCloseTo(Math.abs(area(square(0, 0, 10))), 6);
  });

  it('keeps every rotated continental-drift ring closed and unwrapped at sample ages', () => {
    const rot = JSON.parse(readFileSync('public/geo/cd-rotations.json', 'utf8')) as RotationFile;
    const model = createRotationModel(rot);
    const topo = JSON.parse(readFileSync('public/geo/cd-land.json', 'utf8'));
    // decodeTopologyObject needs the browser-free topojson-client, which works in node.
    return import('../../src/engines/time-scene/lib/control').then(({ decodeTopologyObject }) => {
      const scrub = prepareLayer(decodeTopologyObject(topo, 'scrub'));
      const full = prepareLayer(decodeTopologyObject(topo, 'full'));
      expect(scrub.vertices).toBeLessThanOrEqual(12000);
      expect(full.vertices).toBeLessThanOrEqual(40000);
      for (const ma of [400, 333.3, 250.2, 123.4, 0]) {
        const f = rotateLayer(full, model, ma).collection;
        for (const feature of f.features) for (const poly of feature.geometry.coordinates) for (const ring of poly) {
          expect(ring[0]).toEqual(ring.at(-1));
          for (let i = 1; i < ring.length; i++) expect(Math.abs(ring[i]![0]! - ring[i - 1]![0]!)).toBeLessThanOrEqual(180);
        }
      }
    });
  });
});

describe('rotation map content checks', () => {
  const topic = { basemap: { rotation: { file: 'cd-manifest', projection: 'globe', layers: [
    'cd-land', 'cd-shelf', 'cd-names', 'cd-glacial', 'cd-fossils', 'cd-belts', 'cd-singapore', 'cd-seafloor', 'cd-stripes', 'cd-gps',
  ].map((id) => ({ id, label: { en: id, zh: id } })) } } } as unknown as TopicMeta;
  const read = (stem: string) => { try { return JSON.parse(readFileSync(`public/geo/${stem}.json`, 'utf8')); } catch { return undefined; } };
  it('accepts the published continental-drift files and lists their objects', () => {
    const check = checkRotation(topic, read);
    expect(check.issues).toEqual([]);
    expect(check.objects).toContain('site-singapore');
    expect(check.objects).toContain('taxon-lystrosaurus');
    expect(check.objects).toContain('gps-ntus');
  });
  it('rejects an unknown plate, a from < to window, a plate id on a present-only layer and a missing file', () => {
    const points = read('cd-points');
    const variant = (patch: (stem: string) => unknown) => checkRotation(topic, (stem) => { const v = patch(stem); return v === null ? read(stem) : v; }).issues.join('\n');
    expect(variant((stem) => stem === 'cd-points' ? { ...points, points: [{ ...points.points[0], plateId: 999999 }, ...points.points.slice(1)] } : null)).toMatch(/unknown plateId 999999/);
    expect(variant((stem) => stem === 'cd-points' ? { ...points, points: [{ ...points.points[1], from: 10, to: 20 }, ...points.points.slice(2)] } : null)).toMatch(/from must be >= to/);
    expect(variant((stem) => { if (stem !== 'cd-stripes') return null; const s = read(stem); s.features[0].properties.plateId = 701; return s; })).toMatch(/present-only feature must not carry a plateId/);
    expect(variant((stem) => stem === 'cd-seafloor' ? undefined : null)).toMatch(/cd-seafloor\.json: file not found/);
  });
  it('requires the manifest layers to match the topic rows', () => {
    const fewer = { basemap: { rotation: { ...topic.basemap!.rotation!, layers: topic.basemap!.rotation!.layers.slice(1) } } } as TopicMeta;
    expect(checkRotation(fewer, read).issues.join('\n')).toMatch(/layers must match/);
  });
});
