import { describe, expect, it } from 'vitest';
import { circle, createMechanismFrame, solveMechanism } from '../../src/engines/space-scene/lib/mechanism';
import { mechanismGeometrySchema } from '../../src/engines/space-scene/mechanism-schema';

export const geometry = mechanismGeometrySchema.parse({ beamPivot: [0, 0], shaftCentre: [2.5, -3], radiusPivot: [-2.5, -0.8],
  beamHalfM: 2.5, connectingRodM: 3, orbitM: 0.6092838281609874, shortLinkM: 0.8, radiusRodM: 1.25,
  innerFraction: 0.5, beamBranch: 1, parallelBranch: 1, pistonRodM: 2.4, cylinderX: -2.5,
  radialDisplayClearanceM: 0.003, nominalStrokeM: 1.2192, pump: { beamFraction: -0.4, sliderX: -1, rodM: 4.5 } });
const tau = 2 * Math.PI;
const distance = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!);

describe('beam-steam closed geometry', () => {
  it('keeps all ten bars rigid over 4096 angles and reuses the supplied cache', () => {
    const f = createMechanismFrame(), pts = f.points;
    for (let n = 0; n < 4096; n++) {
      expect(solveMechanism(n * tau / 4096, geometry, f)).toBe(f);
      expect(f.points).toBe(pts);
      const p = f.points;
      for (const [a, b, length] of [['A', 'K', 2.5], ['A', 'C', 1.25], ['C', 'B', 1.25], ['E', 'D', 1.25], ['F', 'E', 1.25], ['C', 'E', 0.8], ['B', 'D', 0.8], ['K', 'P', 3], ['O', 'P', geometry.orbitM], ['Q', 'W', 4.5]] as const)
        expect(Math.abs(distance(p[a], p[b]) - length)).toBeLessThan(1e-9);
      expect(f.linkResidualM).toBeLessThan(1e-9);
      expect(f.circleHeights.every((h) => h > 1e-6)).toBe(true);
      expect(f.pumpMarginM2).toBeGreaterThan(1e-9);
      expect(Math.abs(f.planetAngleRad)).toBeLessThan(Math.PI - 1e-4);
      expect(Math.abs(f.sunAngleRad + f.planetAngleRad - 2 * f.thetaRad)).toBeLessThan(1e-10);
    }
  });
  it('reproduces the 32768-point stroke, lateral wander and clearance', () => {
    const f = createMechanismFrame(); let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, clearance = Infinity;
    for (let n = 0; n < 32768; n++) {
      solveMechanism(n * tau / 32768, geometry, f);
      minX = Math.min(minX, f.points.D[0]); maxX = Math.max(maxX, f.points.D[0]);
      minY = Math.min(minY, f.points.D[1]); maxY = Math.max(maxY, f.points.D[1]); clearance = Math.min(clearance, f.clearanceMarginM);
    }
    expect(maxY - minY).toBeCloseTo(1.2192000154, 6);
    expect(minX).toBeCloseTo(-2.500931896, 8); expect(maxX).toBeCloseTo(-2.499137005, 8);
    expect(clearance).toBeGreaterThan(0.002);
  });
  it('keeps the planet fixed to its rod and gives the shaft two net turns per cycle', () => {
    const a = solveMechanism(0, geometry), b = solveMechanism(tau, geometry);
    expect(a.planetAngleRad).toBe(0); expect(b.planetAngleRad).toBeCloseTo(0, 13);
    expect(b.sunAngleRad).toBeCloseTo(4 * Math.PI, 12); expect(b.shaftTurns).toBeCloseTo(2, 12);
    expect(b.cycles).toBe(1); expect(b.phaseDeg).toBe(0);
    for (const theta of [-10 * tau + 0.2, 0.2, 10 * tau + 0.2]) {
      const f = solveMechanism(theta, geometry);
      expect(f.points.D[0]).toBeCloseTo(solveMechanism(0.2, geometry).points.D[0], 12);
      expect(f.sunAngleRad).toBeCloseTo(2 * theta - f.planetAngleRad, 12);
    }
  });
  it('reproduces the two midpoint piston coordinates and all four valve gates', () => {
    const a = solveMechanism(0, geometry), b = solveMechanism(Math.PI, geometry);
    expect(a.points.D[0]).toBeCloseTo(-2.50000000969, 8); expect(a.points.D[1]).toBeCloseTo(-0.73731382482, 8);
    expect(b.points.D[0]).toBeCloseTo(-2.50000000944, 8); expect(b.points.D[1]).toBeCloseTo(-0.73763822232, 8);
    expect(a.pistonDirection).toBe('down'); expect(a.ports).toEqual({ upperIn: true, lowerOut: true, lowerIn: false, upperOut: false });
    expect(b.pistonDirection).toBe('up'); expect(b.ports).toEqual({ upperIn: false, lowerOut: false, lowerIn: true, upperOut: true });
  });
  it('finds real non-quadrant dead centres and shuts all gates there', () => {
    expect(solveMechanism(Math.PI / 2, geometry).derivativeM).toBeCloseTo(-0.0148262, 6);
    expect(solveMechanism(3 * Math.PI / 2, geometry).derivativeM).toBeCloseTo(0.0158473, 6);
    for (const midpoint of [Math.PI / 2, 3 * Math.PI / 2]) {
      let lo = midpoint - 0.1, hi = midpoint + 0.1;
      const sign = Math.sign(solveMechanism(lo, geometry).derivativeM);
      for (let n = 0; n < 45; n++) {
        const mid = (lo + hi) / 2;
        if (Math.sign(solveMechanism(mid, geometry).derivativeM) === sign) lo = mid; else hi = mid;
      }
      const f = solveMechanism((lo + hi) / 2, geometry);
      expect(Math.abs(f.thetaRad - midpoint)).toBeGreaterThan(1e-4);
      expect(Math.abs(f.derivativeM)).toBeLessThanOrEqual(1e-7); expect(f.pistonDirection).toBe('switch');
      expect(Object.values(f.ports)).toEqual([false, false, false, false]);
    }
  });
  it('rejects invalid circles, illegal phases and unreachable pump sliders', () => {
    for (const fn of [() => circle([0, 0], 1, [0, 0], 1, 1), () => circle([0, 0], 1, [5, 0], 1, 1),
      () => circle([0, 0], 1, [1, 0], 1, 0), () => solveMechanism(NaN, geometry), () => solveMechanism(0, { ...geometry, pistonRodM: NaN }),
      () => solveMechanism(0, { ...geometry, pump: { ...geometry.pump, rodM: 0.01, sliderX: 10 } })]) expect(fn).toThrow();
  });
});
