import { describe, it, expect } from 'vitest';
import {
  A,
  C,
  R,
  Z_LE,
  solveAirfoil,
  atmosphereAt,
  AirfoilInputError,
} from '../../src/engines/space-scene/lib/sim/airfoil';
import {
  evaluateSim,
  SEPARATE_EXPERIMENTS,
} from '../../src/engines/space-scene/lib/sim';
import {
  quantityKind,
  simTimelineChannels,
} from '../../src/engines/space-scene/sim-schema';
import {
  resolveSimValues,
  encodeSimParam,
  decodeSimParam,
} from '../../src/engines/space-scene/lib/sim/controls';
import {
  AIRFOIL_DATA as d,
  AIRFOIL_DEFAULTS as v,
  AIRFOIL_SIM as sim,
  NASA_AIRFOIL,
} from './fixtures/airfoil-bench';
describe('docs/45 §4.7 scalar table', () => {
  it('geometry constants', () => {
    expect(R).toBe(1.08);
    expect(Z_LE).toBeCloseTo(-2.0220689655172412, 14);
    expect(C).toBeCloseTo(4.022068965517241, 14);
    expect(A).toBeCloseTo(6.748606441044742, 14);
  });
  it.each([
    [0, 0, 0],
    [4, 0.47075898801417243, 922.687616507778],
    [8, 0.9392244855592677, 1840.8799916961648],
    [12, 1.4031141758212335, 2750.103784609618],
    [16, 1.1926470494480486, 2337.588216918175],
    [20, 0.8418685054927401, 1650.0622707657706],
    [-4, -0.47075898801417243, -922.687616507778],
    [-16, -1.1926470494480486, -2337.588216918175],
  ])('angle %s', (angle, cl, lift) => {
    const s = solveAirfoil(d, { ...v, 'angle-deg': angle });
    expect(s.cl).toBeCloseTo(cl!, 10);
    expect(s.lift).toBeCloseTo(lift!, 7);
    expect(s.q).toBeCloseTo(980, 10);
    expect(s.mode).toBe(
      Math.abs(angle!) <= 12 ? 'ideal-attached' : 'separated-illustration',
    );
  });
  it('zero velocity keeps theoretical Cl and returns still', () => {
    const s = solveAirfoil(d, { ...v, 'angle-deg': 16, 'airspeed-mps': 0 });
    expect(s.cl).toBeCloseTo(1.1926470494480486, 12);
    expect([s.q, s.lift, s.mode]).toEqual([0, 0, 'still']);
  });
  it('speed squared and density scaling', () => {
    expect(solveAirfoil(d, { ...v, 'airspeed-mps': 20 }).lift).toBeCloseTo(
      230.6719041269445,
      9,
    );
    expect(
      solveAirfoil(
        { ...d, atmosphere: { kind: 'constant', density: 0.6125 } },
        v,
      ).lift,
    ).toBeCloseTo(922.687616507778 / 2, 9);
  });
  it.each([
    [0, 1.22661378741097, 923.9031443933111],
    [5000, 0.7376745768470427, 555.6270996484747],
    [10000, 0.4140080791698312, 311.8368390074898],
  ])('S11 altitude %s', (h, rho, lift) => {
    const s = solveAirfoil(NASA_AIRFOIL, { ...v, 'altitude-m': h! });
    expect(s.rho).toBeCloseTo(rho!, 13);
    expect(s.lift).toBeCloseTo(lift!, 8);
  });
  it('S11 pressure and q at sea level', () => {
    expect(atmosphereAt(0).pressure).toBeCloseTo(101.40093090454886, 11);
    expect(solveAirfoil(NASA_AIRFOIL, v).q).toBeCloseTo(981.291029928776, 9);
  });
  it.each([
    ['angle-deg', 21],
    ['angle-deg', NaN],
    ['angle-deg', Infinity],
    ['airspeed-mps', -1],
  ])('direct invalid %s=%s', (id, value) =>
    expect(() => solveAirfoil(d, { ...v, [id]: value })).toThrow(
      AirfoilInputError,
    ),
  );
  it('invalid atmosphere fails directly', () => {
    expect(() =>
      solveAirfoil({ ...d, atmosphere: { kind: 'constant', density: 0 } }, v),
    ).toThrow('density');
    expect(() =>
      solveAirfoil(NASA_AIRFOIL, { ...v, 'altitude-m': 10001 }),
    ).toThrow('altitude-m');
  });
  it('registry and URL roundtrip, invalid URL fallback', () => {
    expect(SEPARATE_EXPERIMENTS.airfoil).toBe(true);
    expect(simTimelineChannels(sim, 'cl')).toBeNull();
    expect(quantityKind(sim, 'control:flow-view')).toBeNull();
    expect(evaluateSim(sim, v)['lift-n']).toBeCloseTo(922.687616507778, 9);
    const encoded = encodeSimParam({
      ...v,
      'angle-deg': 16,
      'flow-view': 'pressure',
    });
    expect(resolveSimValues(sim, decodeSimParam(encoded))['flow-view']).toBe(
      'pressure',
    );
    expect(resolveSimValues(sim, { 'angle-deg': 21 })['angle-deg']).toBe(4);
  });
});

import { msPerCall } from '../timing';
import fixture from '../../src/content/topics/sample-airfoil/data/parts.json';
import { partsFile } from '../../src/engines/space-scene/schema';
import { arrowWhen } from '../../src/engines/space-scene/lib/sim/arrows';
it('deterministic scalar cost remains below 1ms', () => {
  const before = JSON.stringify(d),
    want = solveAirfoil(d, v);
  for (let i = 0; i < 100; i++) expect(solveAirfoil(d, v)).toEqual(want);
  expect(JSON.stringify(d)).toBe(before);
  expect(msPerCall(() => solveAirfoil(d, v), 100)).toBeLessThan(1);
});
it('bank fixed vectors select just lift and gravity, with no horizontal arrows', () => {
  const file = partsFile.parse(fixture),
    s = file.sim!,
    values = { ...v, 'diagram-case': 'bank' },
    out = evaluateSim(s, values),
    overlay = s.overlays[1]!;
  expect(overlay.kind).toBe('force-vectors');
  if (overlay.kind !== 'force-vectors') return;
  const arrows = overlay.arrows.filter((a) => arrowWhen(a, s, values, out));
  expect(arrows.map((a) => a.force)).toEqual(['gravity', 'lift']);
  expect(arrows[0]!.dir).toEqual([0, -1, 0]);
  expect(arrows[1]!.dir[1]).toBeCloseTo(0.9396926208, 10);
  expect(arrows[1]!.dir[2]).toBeCloseTo(-0.3420201433, 10);
});

describe('force-vector arrow scale (browser acceptance, docs/45 §9.2)', () => {
  it('an overlay in thousands of newtons keeps a visible shaft; overlays in newtons keep their scale', async () => {
    const { vectorScale } = await import('../../src/engines/space-scene/lib/sim/arrows');
    // forces and sample-forces: unchanged (1.6 N's worth of length).
    expect(vectorScale(0.04, 0.25)).toBeCloseTo(0.064, 12);
    expect(vectorScale(0.03, 0.25)).toBeCloseTo(0.048, 12);
    // Airfoil lift (per 0.00015 m/N): was 0.00024 scene units, an invisible shaft.
    expect(vectorScale(0.00015, 0.5)).toBeCloseTo(0.08, 12);
    expect(vectorScale(0.0004, 0.55)).toBeCloseTo(0.088, 12);
  });
});
