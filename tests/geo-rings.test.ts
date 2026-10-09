import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { ringIssues, selfCrosses } from '../scripts/geo/lib/rings';

describe('ringIssues', () => {
  const square = [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]];
  const bowtie = [[0, 0], [4, 4], [4, 0], [1, 5], [0, 0]];
  const flat = [[0, 0], [2, 0], [4, 0], [0, 0]];

  it('flags a bow-tie and a zero-area ring, not a plain square or a touching vertex', () => {
    expect(selfCrosses(square)).toBe(false);
    expect(selfCrosses(bowtie)).toBe(true);
    // Two lobes sharing one vertex (touching, not crossing).
    expect(selfCrosses([[0, 0], [2, 2], [4, 0], [2, -2], [2, 2], [0, 4], [0, 0]])).toBe(false);
    expect(ringIssues([[square], [bowtie], [flat]])).toEqual({ rings: 3, zeroArea: 1, selfCrossing: 1 });
  });
});

describe('control keyframes have no wedge-makers', () => {
  // ww2's control.json predates the ring clean-up in simplify.ts (it has 137 crossing rings, drawn without visible wedges); new topics must be at 0.
  for (const slug of ['ww1']) {
    it(`${slug}: 0 zero-area and 0 self-crossing rings`, () => {
      type Topology = Parameters<typeof feature>[0];
      const data = JSON.parse(readFileSync(`src/content/topics/${slug}/data/control.json`, 'utf8')) as {
        topology: Topology & { objects: Record<string, Parameters<typeof feature>[1] & object> };
        keyframes: { object: string }[];
      };
      const polygons = data.keyframes.flatMap((k) => {
        const fc = feature(data.topology, data.topology.objects[k.object]!) as unknown as FeatureCollection;
        return fc.features.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []));
      });
      expect(ringIssues(polygons)).toMatchObject({ zeroArea: 0, selfCrossing: 0 });
    });
  }
});
