import { readFileSync } from 'node:fs';
import type { Point, Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import { decodeTopologyObject } from '../../src/engines/time-scene/lib/control';

const read = (file: string) => JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')) as unknown;
const blocks = decodeTopologyObject(read('public/geo/sample-dated-blocks.json'), 'sample-dated-blocks').features;
const land = decodeTopologyObject(read('public/geo/land-sg.json'), 'land-sg').features.find((f) => f.properties?.kind === 'land')!;
const area = (ring: Position[]) => Math.abs(ring.reduce((sum, p, i) => {
  const q = ring[(i + 1) % ring.length]!;
  return sum + p[0]! * q[1]! - q[0]! * p[1]!;
}, 0));
const mainland = land.geometry.type === 'MultiPolygon'
  ? [...land.geometry.coordinates].sort((a, b) => area(b[0]!) - area(a[0]!))[0]!
  : [];

function inRing(point: Position, ring: Position[]): boolean {
  const [x, y] = point as [number, number];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i] as [number, number], b = ring[j] as [number, number];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
const visible = (year: number) => blocks.filter((f) => f.properties!.f <= year && year < (f.properties!.u ?? Infinity));

describe('dated-layers synthetic fixture', () => {
  it('puts all 11,000 generated points on real Singapore mainland, outside water holes', () => {
    expect(blocks).toHaveLength(11000);
    expect(mainland.length).toBeGreaterThan(0);
    const outside = blocks.filter((f) => {
      if (f.geometry.type !== 'Point') return true;
      const p = f.geometry.coordinates;
      return !inRing(p, mainland[0]!) || mainland.slice(1).some((ring) => inRing(p, ring));
    });
    expect(outside.map((f) => f.properties!.id)).toEqual([]);
    expect(new Set(blocks.map((f) => (f.geometry as Point).coordinates.join(','))).size).toBe(11000);
  });

  it('reaches 10,000 simultaneously visible points and replaces identities at equal count', () => {
    expect([1958, 1959, 1965, 1966, 1970, 1979, 1980, 2019, 2020].map((t) => visible(t).length))
      .toEqual([0, 500, 2000, 2000, 5000, 5000, 5000, 10000, 10000]);
    const oldIds = new Set(visible(1979).map((f) => f.properties!.id));
    const newIds = new Set(visible(1980).map((f) => f.properties!.id));
    expect([...oldIds].filter((id) => !newIds.has(id))).toHaveLength(1000);
    expect([...newIds].filter((id) => !oldIds.has(id))).toHaveLength(1000);
    expect(blocks.every((f, i) => !i || blocks[i - 1]!.properties!.f <= f.properties!.f)).toBe(true);
  });
});
