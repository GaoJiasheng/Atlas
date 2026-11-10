/**
 * Regional plate land (scripts/geo/lib/region.ts, run by region-land.ts): the
 * clip keeps the land inside the box, the coast lines skip the straight cuts
 * along the box, and the written sample plate decodes cleanly.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection, MultiLineString, MultiPolygon } from 'geojson';
import { clipRing, regionTopology, simplifyLine, splitRing, unwrapDatelineRings, type Box } from '../scripts/geo/lib/region';
import { ringIssues } from '../scripts/geo/lib/rings';

const box: Box = [0, 0, 10, 10];

describe('region land', () => {
  it('clips a ring to the box and tells coast from cut', () => {
    // A square sticking out of the box's east side.
    const ring = [[5, 2], [14, 2], [14, 6], [5, 6], [5, 2]];
    const clipped = clipRing(ring, box);
    expect(clipped.every(([x = 0, y = 0]) => x >= 0 && x <= 10 && y >= 0 && y <= 10)).toBe(true);
    const runs = splitRing(clipped, box);
    expect(runs.filter((r) => !r.coast).map((r) => r.pts)).toEqual([[[10, 2], [10, 6]]]);
    expect(runs.filter((r) => r.coast)).toHaveLength(1);
    expect(clipRing([[20, 20], [30, 20], [30, 30], [20, 20]], box)).toEqual([]);
  });

  it('unwraps rings that cross the antimeridian twice and leaves polar rings alone', () => {
    // An island astride 180° (as Fiji in Natural Earth) and a ring round the South Pole.
    const island = [[179, -16], [-179, -16], [-179, -17], [179, -17], [179, -16]];
    const polar = [[-180, -70], [0, -68], [180, -70], [180, -90], [-180, -90], [-180, -70]];
    const land: FeatureCollection = { type: 'FeatureCollection', features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [island] } },
      { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[polar]] } },
    ] };
    const out = unwrapDatelineRings(land);
    const ring = (out.features[0]!.geometry as { coordinates: number[][][] }).coordinates[0]!;
    const xs = ring.map(([x = 0]) => x);
    expect(Math.max(...xs) - Math.min(...xs)).toBe(2);
    // Unwrapped, it lies wholly past ±179°: a box from -30° to 155° clips it away instead of keeping a band at -16°.
    expect(clipRing(ring, [-30, -60, 155, 72])).toEqual([]);
    expect((out.features[1]!.geometry as { coordinates: number[][][][] }).coordinates[0]![0]).toEqual(polar);
  });

  it('simplifies within tolerance and keeps the ends', () => {
    const line = [[0, 0], [1, 0.01], [2, 0], [3, 2], [4, 0]];
    expect(simplifyLine(line, 0.1)).toEqual([[0, 0], [2, 0], [3, 2], [4, 0]]);
  });

  it('writes land and coast in one topology', () => {
    const land: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[5, 2], [14, 2], [14, 6], [5, 6], [5, 2]]] } },
        { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[50, 50], [51, 50], [51, 51], [50, 50]]] } },
      ],
    };
    const { topology, polygons, coastArcs } = regionTopology(land, box, 'plate', { tolerance: 0, minAreaDeg2: 0.01, quantization: 1001 });
    expect(polygons).toBe(1);
    expect(coastArcs).toBe(1);
    const fc = feature(topology as never, topology.objects.plate as never) as unknown as FeatureCollection;
    const landGeom = fc.features.find((f) => f.properties?.kind === 'land')!.geometry as MultiPolygon;
    const coast = fc.features.find((f) => f.properties?.kind === 'coast')!.geometry as MultiLineString;
    expect(landGeom.coordinates[0]![0]!.every(([x = 0]) => x <= 10 + 1e-9)).toBe(true);
    // The coast never runs along the cut at x = 10.
    for (const line of coast.coordinates)
      for (let i = 1; i < line.length; i++) expect(line[i - 1]![0] === 10 && line[i]![0] === 10).toBe(false);
  });

  it('the sample plate (public/geo/sample-region-land.json) decodes to clean rings inside its box', () => {
    const topo = JSON.parse(readFileSync(join(import.meta.dirname, '../public/geo/sample-region-land.json'), 'utf8'));
    const fc = feature(topo, topo.objects['sample-region-land']) as unknown as FeatureCollection;
    const polys = fc.features.filter((f) => f.properties?.kind === 'land').flatMap((f) => (f.geometry as MultiPolygon).coordinates);
    expect(polys.length).toBeGreaterThan(0);
    const issues = ringIssues(polys);
    expect(issues.zeroArea).toBe(0);
    expect(issues.selfCrossing).toBe(0);
    const [w, s, e, n] = topo.bbox as Box;
    for (const poly of polys) for (const [x = 0, y = 0] of poly[0]!) expect(x >= w - 1e-6 && x <= e + 1e-6 && y >= s - 1e-6 && y <= n + 1e-6).toBe(true);
  });
});
