import { describe, expect, it } from 'vitest';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { frameAt } from '../../src/engines/time-scene/lib/frame';
import { areaAt, controlAreas, frameStats, referencePair } from '../../src/engines/time-scene/lib/stats';
import { areaKm2, metresPerPixel, ringAreaKm2, scaleBar, unwrapRing } from '../../src/engines/time-scene/lib/geo';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import entities from '../../src/content/topics/sample-time/data/entities.json';
import control from '../../src/content/topics/sample-time/data/control.json';
import movements from '../../src/content/topics/sample-time/data/movements.json';
import events from '../../src/content/topics/sample-time/data/events.json';
import sources from '../../src/content/topics/sample-time/data/sources.json';

const data = timeSceneGeoData.parse({ entities, control, movements, events, sources });
const model = buildTimeModel(data, [
  { id: 'first-look', t: '2000-01-15' },
  { id: 'second-look', t: '2000-03-11' },
  { id: 'third-look', t: '2000-07-01' },
]);

describe('areas', () => {
  it('measures a 1°×1° cell at the equator (~12,300 km²)', () => {
    const ring = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ];
    expect(ringAreaKm2(ring)).toBeGreaterThan(12_250);
    expect(ringAreaKm2(ring)).toBeLessThan(12_400);
    // Holes are subtracted.
    const hole = [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.75, 0.75],
      [0.25, 0.75],
      [0.25, 0.25],
    ];
    expect(areaKm2({ type: 'Polygon', coordinates: [ring, hole] })).toBeCloseTo(ringAreaKm2(ring) * 0.75, -1);
  });

  it('gives each entity an area per keyframe and interpolates between them', () => {
    const areas = controlAreas(model);
    expect(areas.get('east-sample')![0]).toBe(0);
    expect(areas.get('east-sample')![1]).toBeGreaterThan(0);
    expect(areaAt(model, areas, 'north-sample', toNumber('1999-06-01'))).toBe(0);
    const a = areas.get('north-sample')!;
    const mid = (model.keyframes[0]!.t + model.keyframes[1]!.t) / 2;
    expect(areaAt(model, areas, 'north-sample', mid)).toBeCloseTo((a[0]! + a[1]!) / 2, 3);
    expect(areaAt(model, areas, 'north-sample', model.max + 1)).toBe(a[a.length - 1]);
  });
});

describe('frame stats', () => {
  it('counts participants, battles, movements and the keyframe blend', () => {
    const s = frameStats(model, frameAt(model, toNumber('2000-03-11')));
    expect(s).toMatchObject({ participants: 2, entities: 3, activeBattles: 1, activeMovements: 1, prevIndex: 0, nextIndex: 1 });
    expect(s.blend).toBeGreaterThan(0);
    expect(s.blend).toBeLessThan(1);
  });

  it('pairs the dominant keyframe with the previous one (or the next at the start)', () => {
    expect(referencePair(model, frameAt(model, toNumber('2000-01-15')))).toEqual({ current: 0, other: 1 });
    expect(referencePair(model, frameAt(model, toNumber('2000-04-10')))).toEqual({ current: 1, other: 0 });
    expect(referencePair(model, frameAt(model, toNumber('2000-07-30')))).toEqual({ current: 2, other: 1 });
  });
});

describe('antimeridian', () => {
  it('unwraps a ring that jumps from 180 to -180 (the stray-line sliver)', () => {
    const fiji = [
      [-180, -16.49],
      [180, -16.54],
      [179.986, -16.542],
      [179.986, -16.523],
      [-180, -16.49],
    ];
    const out = unwrapRing(fiji);
    for (let i = 1; i < out.length; i++) expect(Math.abs(out[i]![0] - out[i - 1]![0])).toBeLessThanOrEqual(180);
    expect(Math.min(...out.map((p) => p[0]))).toBeGreaterThan(179);
  });

  it('closes a ring that winds around the south pole along the pole', () => {
    const ring = [
      [-180, -84],
      [-60, -70],
      [60, -70],
      [179.6, -84.2],
      [-180, -84],
    ];
    const out = unwrapRing(ring);
    expect(out.slice(-3)).toEqual([
      [180, -90],
      [-180, -90],
      [-180, -84],
    ]);
  });

  it('leaves ordinary rings alone', () => {
    const ring = [
      [10, 10],
      [20, 10],
      [20, 20],
      [10, 10],
    ];
    expect(unwrapRing(ring)).toEqual(ring);
  });
});

describe('scale bar', () => {
  it('picks a round length that fits', () => {
    const mpp = metresPerPixel(3.6, 13);
    const bar = scaleBar(mpp, 120);
    expect(bar.label).toBe('500 km');
    expect(bar.px).toBeLessThanOrEqual(120);
    expect(bar.px).toBeGreaterThan(40);
    expect(scaleBar(10, 120).label).toBe('1 km');
    expect(scaleBar(0.5, 120).label).toBe('50 m');
  });
});
