import { describe, expect, it } from 'vitest';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { LINGER_OPACITY, frameAt } from '../../src/engines/time-scene/lib/frame';
import { frameStats } from '../../src/engines/time-scene/lib/stats';
import { lineLength, lineLengthKm, unwrapPath, unwrapPathCentred } from '../../src/engines/time-scene/lib/geo';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import entities from '../../src/content/topics/sample-time/data/entities.json';
import control from '../../src/content/topics/sample-time/data/control.json';
import sources from '../../src/content/topics/sample-time/data/sources.json';

/** Hitokappu Bay (147.7E, 44.9N) to north of Oahu (158W, 23N) via the dateline: the Pearl Harbor task force, as authors write it. */
const HITOKAPPU = [
  [147.7, 44.9],
  [165, 42],
  [179.5, 38],
  [-175, 33],
  [-165, 27],
  [-158, 23],
];

describe('antimeridian paths', () => {
  it('unwrapPath makes longitudes monotonic across the dateline', () => {
    const out = unwrapPath(HITOKAPPU);
    const lons = out.map((p) => p[0]);
    expect(lons).toEqual([147.7, 165, 179.5, 185, 195, 202]);
    for (let i = 1; i < lons.length; i++) expect(lons[i]!).toBeGreaterThan(lons[i - 1]!);
    expect(out.map((p) => p[1])).toEqual(HITOKAPPU.map((p) => p[1]));
  });

  it('measures the short way, not the long way round', () => {
    const direct = lineLengthKm([HITOKAPPU[0]!, HITOKAPPU[5]!]);
    const unwrapped = lineLengthKm(unwrapPath(HITOKAPPU));
    expect(unwrapped).toBeGreaterThan(5000);
    expect(unwrapped).toBeLessThan(6500);
    expect(direct).toBeGreaterThan(5000);
    expect(direct).toBeLessThan(6500);
    // The planar length (what slicing uses) sees the raw jump as a 360° detour: ~407° vs ~60°.
    expect(lineLength(HITOKAPPU)).toBeGreaterThan(400);
    expect(lineLength(unwrapPath(HITOKAPPU))).toBeLessThan(70);
  });

  it('unwraps eastbound and westbound crossings, and leaves ordinary paths alone', () => {
    expect(unwrapPath([[-179, 0], [179, 0], [178, 1]]).map((p) => p[0])).toEqual([-179, -181, -182]);
    expect(unwrapPath([[10, 0], [20, 5], [-30, 5]]).map((p) => p[0])).toEqual([10, 20, -30]);
    expect(unwrapPath([])).toEqual([]);
  });

  it('centres the whole path in the main world copy', () => {
    // Crossing from 170E to 150W (unwrapped 170..210, centre 190) moves by -360: -190..-150.
    const out = unwrapPathCentred([[170, 0], [-150, 0]]);
    expect(out.map((p) => p[0])).toEqual([-190, -150]);
    // A path whose centre is already inside keeps its copy: Hitokappu is 147.7..202, centre 175.
    expect(unwrapPathCentred(HITOKAPPU).map((p) => p[0])).toEqual([147.7, 165, 179.5, 185, 195, 202]);
  });
});

function modelWith(movement: Record<string, unknown>) {
  const raw = [
    {
      id: 'dateline-run',
      from: '2000-02-01',
      to: '2000-03-01',
      holder: 'north-sample',
      strength: 100,
      label: { en: 'Run', zh: '航行' },
      kind: 'sea',
      path: { type: 'LineString', coordinates: HITOKAPPU },
      ...movement,
    },
  ];
  return buildTimeModel(timeSceneGeoData.parse({ entities, control, movements: raw, events: [], sources }), []);
}

describe('movements in the model', () => {
  it('uses the unwrapped path for frames, heads and bounds', () => {
    const model = modelWith({});
    expect(model.movements[0]!.path.map((p) => p[0])).toEqual([147.7, 165, 179.5, 185, 195, 202]);
    const mid = frameAt(model, toNumber('2000-02-20')).movements[0]!;
    for (const [lng] of mid.coords) expect(lng).toBeGreaterThanOrEqual(147.7);
    expect(mid.head[0]).toBeGreaterThan(165);
    const done = frameAt(model, toNumber('2000-03-01')).movements[0]!;
    expect(done.head[0]).toBeCloseTo(202);
    expect(model.bounds![2]).toBeGreaterThanOrEqual(202);
  });
});

describe('linger', () => {
  const t = (d: string) => toNumber(d);

  it('is off by default: the line disappears once the movement is over', () => {
    const model = modelWith({});
    expect(frameAt(model, t('2000-03-01')).movements).toHaveLength(1);
    expect(frameAt(model, t('2000-03-02')).movements).toEqual([]);
  });

  it('keeps the finished line at 40% until `linger`, then fades it out', () => {
    const model = modelWith({ linger: '2000-05-01' });
    const during = frameAt(model, t('2000-02-15')).movements[0]!;
    expect(during.opacity).toBe(1);
    expect(during.lingering).toBe(false);
    const after = frameAt(model, t('2000-04-01')).movements[0]!;
    expect(after.lingering).toBe(true);
    expect(after.opacity).toBe(LINGER_OPACITY);
    expect(after.progress).toBe(1);
    expect(after.coords).toHaveLength(model.movements[0]!.path.length);
    expect(after.head).toEqual(model.movements[0]!.path[5]);
    // Past `linger` the opacity drops, then the line is gone.
    const fading = frameAt(model, t('2000-05-01') + model.span * 0.01).movements[0]!;
    expect(fading.opacity).toBeGreaterThan(0);
    expect(fading.opacity).toBeLessThan(LINGER_OPACITY);
    expect(frameAt(model, t('2000-05-01') + model.span * 0.05).movements).toEqual([]);
  });

  it('does not count a lingering line as an active movement', () => {
    const model = modelWith({ linger: '2000-05-01' });
    expect(frameStats(model, frameAt(model, t('2000-02-15'))).activeMovements).toBe(1);
    expect(frameStats(model, frameAt(model, t('2000-04-01'))).activeMovements).toBe(0);
  });

  it('must lie after `to` on the same time scale', () => {
    const parse = (linger: unknown) =>
      timeSceneGeoData.safeParse({
        entities,
        control,
        events: [],
        sources,
        movements: [{ id: 'm', from: '2000-02-01', to: '2000-03-01', holder: 'north-sample', strength: 1, label: { en: 'M', zh: 'M' }, kind: 'sea', path: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, linger }],
      });
    expect(parse('2000-04-01').success).toBe(true);
    expect(parse('2000-03-01').success).toBe(false);
    expect(parse('2000-01-01').success).toBe(false);
    expect(parse({ ma: 10 }).success).toBe(false);
  });
});
