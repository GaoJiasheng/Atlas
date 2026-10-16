import { describe, expect, it } from 'vitest';
import type { Polygon, Position } from 'geojson';
import { aspectBounds, graticuleStep, regionFrame, regionGraticule, regionMaxBounds } from '../../src/engines/time-scene/lib/region';

const signed = (ring: Position[]) => {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j]![0]! - ring[i]![0]!) * (ring[j]![1]! + ring[i]![1]!);
  return a / 2;
};
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

describe('regional plate', () => {
  const region = { bounds: [100, 20, 125, 44] as [number, number, number, number] };

  it('camera limit: maxBounds, else the plate plus 8 % each side', () => {
    expect(regionMaxBounds(region)).toEqual([98, 18.08, 127, 45.92]);
    expect(regionMaxBounds({ ...region, maxBounds: [98, 18, 127, 45.5] })).toEqual([98, 18, 127, 45.5]);
  });

  it('widens the limit to the stage aspect (never narrows), so the whole plate fits zoomed out', () => {
    const box = regionMaxBounds(region);
    const wide = aspectBounds(box, 1920, 1080);
    // Wider than tall on screen: the plate is taller (Mercator) than 16:9, so only the width grows.
    expect(wide[1]).toBeCloseTo(box[1], 2);
    expect(wide[3]).toBeCloseTo(box[3], 2);
    expect(wide[0]).toBeLessThan(box[0]);
    expect(wide[2]).toBeGreaterThan(box[2]);
    const ratio = (wide[2] - wide[0]) / ((mercY(wide[3]) - mercY(wide[1])) * (180 / Math.PI));
    expect(ratio).toBeCloseTo(1920 / 1080, 2);
    // A phone in portrait: taller.
    const tall = aspectBounds(box, 375, 812);
    expect(tall[0]).toBeCloseTo(box[0], 2);
    expect(tall[1]).toBeLessThan(box[1]);
    expect(tall[3]).toBeGreaterThan(box[3]);
    expect(aspectBounds(box, 0, 0)).toEqual(box);
  });

  it('frame: the whole world with the plate cut out (RFC 7946 winding), and the neat line', () => {
    const fc = regionFrame(region);
    const frame = fc.features.find((f) => f.properties?.kind === 'frame')!.geometry as Polygon;
    expect(frame.coordinates).toHaveLength(2);
    expect(signed(frame.coordinates[0]!)).toBeGreaterThan(0);
    expect(signed(frame.coordinates[1]!)).toBeLessThan(0);
    expect(frame.coordinates[1]!.map((p) => p.join(','))).toContain('125,44');
    const edge = fc.features.find((f) => f.properties?.kind === 'edge')!;
    expect(edge.geometry.type).toBe('LineString');
  });

  it('graticule only inside the plate, 5° for a region', () => {
    expect(graticuleStep(region.bounds)).toBe(5);
    expect(graticuleStep([-180, -60, 180, 80])).toBe(10);
    const lines = regionGraticule(region.bounds).features.map((f) => (f.geometry as { coordinates: number[][] }).coordinates);
    for (const line of lines)
      for (const [x, y] of line) {
        expect(x).toBeGreaterThanOrEqual(100);
        expect(x).toBeLessThanOrEqual(125);
        expect(y).toBeGreaterThanOrEqual(20);
        expect(y).toBeLessThanOrEqual(44);
      }
    // Meridians 105 … 120, parallels 25 … 40 (the plate's own edges are the neat line).
    expect(lines.length).toBe(4 + 4);
  });
});
