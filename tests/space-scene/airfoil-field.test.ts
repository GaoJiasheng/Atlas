import { describe, it, expect } from 'vitest';
import {
  airfoilField,
  airfoilOutline,
  airfoilProbe,
  boundaryVelocity,
  surfacePoint,
  pressureSamples,
  streamFunction,
  segmentClear,
  traceAirfoil,
  sampleTau,
} from '../../src/engines/space-scene/lib/sim/airfoil-field';
import { AirfoilCache } from '../../src/engines/space-scene/lib/sim/airfoil-cache';
import {
  AIRFOIL_DATA as d,
  AIRFOIL_DEFAULTS as v,
} from './fixtures/airfoil-bench';
describe('analytic Joukowski field', () => {
  it('128 unrotated vertices, LE0 TE1, boundary velocity and TE limit', () => {
    expect(airfoilOutline().length).toBe(256);
    expect(surfacePoint(0)[0]).toBeCloseTo(1, 12);
    expect(surfacePoint(Math.PI)[0]).toBeCloseTo(0, 12);
    const p = boundaryVelocity(Math.PI / 2, 0);
    expect(p.uOverV).toBeCloseTo(1.0799623152564328, 7);
    expect(p.vOverV).toBeCloseTo(-0.07360301477948536, 7);
    expect(p.cp).toBeCloseTo(-0.1717360061586639, 7);
    const te = boundaryVelocity(0, 8);
    expect(te.uOverV).toBeCloseTo(0.9079915258973699, 7);
    expect(te.vOverV).toBeCloseTo(-0.12760988695231443, 7);
  });
  it.each([0, 4, 8, 12])(
    'independent dense pressure integration α%s',
    (angle) => {
      let fx = 0,
        fy = 0;
      const n = 4096,
        dt = (2 * Math.PI) / n;
      for (const p of pressureSamples(angle, n)) {
        const a = surfacePoint(p.theta - dt / 2, angle),
          b = surfacePoint(p.theta + dt / 2, angle);
        fx -= p.cp * (b[1] - a[1]);
        fy += p.cp * (b[0] - a[0]);
      }
      const want = [
        0, 0.47075898801417243, 0.9392244855592677, 1.4031141758212335,
      ][[0, 4, 8, 12].indexOf(angle)]!;
      expect(Math.abs(fx)).toBeLessThan(0.001);
      expect(Math.abs(fy - want)).toBeLessThan(
        want === 0 ? 0.0001 : Math.abs(want) * 0.01,
      );
    },
  );
  it('normal velocity vanishes over the boundary', () => {
    for (let j = 1; j < 256; j++) {
      const t = (2 * Math.PI * j) / 256,
        p = boundaryVelocity(t, 8),
        a = surfacePoint(t - 1e-5, 8),
        b = surfacePoint(t + 1e-5, 8),
        dx = b[0] - a[0],
        dy = b[1] - a[1];
      expect(
        Math.abs(p.uOverV * dy - p.vOverV * dx) / Math.hypot(dx, dy),
      ).toBeLessThan(1e-4);
    }
  });
  it('inside/invalid/unavailable never leak Cp', () => {
    expect(airfoilProbe(0.5, 0, 0).status).toBe('inside');
    expect(airfoilProbe(NaN, 0, 0).status).toBe('invalid');
    for (const mode of ['still', 'separated-illustration'] as const)
      expect(airfoilProbe(2, 0, 16, mode)).toEqual({
        status: 'unavailable',
        uOverV: null,
        vOverV: null,
        cp: null,
      });
  });
  it.each([0, 4, 8, 12, -4, -8, -12])(
    'complete paths, entire segments and streamfunction α%s',
    (angle) => {
      const f = airfoilField(d, { ...v, 'angle-deg': angle });
      expect(f.pressure).toHaveLength(64);
      expect(f.paths).toHaveLength(16);
      for (const p of f.paths) {
        expect(p.status).toBe('complete');
        let low = Infinity,
          high = -Infinity;
        for (let j = 0; j < p.tau.length; j++) {
          if (j) expect(p.tau[j]!).toBeGreaterThan(p.tau[j - 1]!);
          const x = p.xy[j * 2]!,
            y = p.xy[j * 2 + 1]!,
            psi = streamFunction(x, y, angle);
          low = Math.min(low, psi);
          high = Math.max(high, psi);
          if (j)
            expect(
              segmentClear([p.xy[j * 2 - 2]!, p.xy[j * 2 - 1]!], [x, y], angle),
            ).toBe(true);
        }
        expect(high - low).toBeLessThan(0.001);
      }
    },
    30000,
  );
  it('negative-angle mirror and still/stall output', () => {
    const f = airfoilField(d, { ...v, 'angle-deg': 4 }),
      g = airfoilField(d, { ...v, 'angle-deg': -4 });
    for (let k = 0; k < 16; k++) {
      const a = f.paths[k]!,
        b = g.paths[15 - k]!;
      for (let j = 0; j < 5; j++) {
        const t = (a.tau[a.tau.length - 1]! * j) / 4,
          p = sampleTau(a, t),
          q = sampleTau(b, t);
        expect(p[0]).toBeCloseTo(q[0], 5);
        expect(p[1]).toBeCloseTo(-q[1], 5);
      }
    }
    for (const angle of [16, -16]) {
      const field = airfoilField(d, { ...v, 'angle-deg': angle });
      expect(field.paths).toEqual([]);
      expect(field.pressure).toBeNull();
      expect(field.separation?.side).toBe(angle < 0 ? 'lower' : 'upper');
    }
    expect(
      airfoilField(d, { ...v, 'airspeed-mps': 0, 'angle-deg': 16 }).mode,
    ).toBe('still');
  }, 30000);
  it('same-release seed07/seed10 arrival differs and converges under refinement', () => {
    const arrive = (step: number) => {
      const g = traceAirfoil(4, step);
      let r = g.next();
      while (!r.done) r = g.next();
      return [6, 9].map((k) => {
        const p = r.value.paths[k]!;
        for (let j = 1; j < p.tau.length; j++)
          if (p.xy[j * 2]! >= 1.2) {
            const f =
              (1.2 - p.xy[(j - 1) * 2]!) / (p.xy[j * 2]! - p.xy[(j - 1) * 2]!);
            return p.tau[j - 1]! + f * (p.tau[j]! - p.tau[j - 1]!);
          }
        return NaN;
      });
    };
    const a = arrive(0.008),
      b = arrive(0.004);
    expect(Math.abs(a[0]! - a[1]!)).toBeGreaterThan(0.001);
    expect(a[0]).toBeCloseTo(b[0]!, 3);
    expect(a[1]).toBeCloseTo(b[1]!, 3);
  }, 30000);
  it('stale async 4→16→−4 rejected; speed/density reuse paths; dispose', async () => {
    const cache = new AirfoilCache(),
      accepted: number[] = [];
    const read = (s: any) => {
      if (s.fieldReady) accepted.push(s.version);
    };
    const first = cache.request(d, v, read);
    await cache.request(d, { ...v, 'angle-deg': 16 }, read);
    await cache.request(d, { ...v, 'angle-deg': -4 }, read);
    await first;
    expect(accepted).toEqual([2, 3]);
    let f: any;
    await cache.request(
      d,
      { ...v, 'angle-deg': -4, 'airspeed-mps': 20 },
      (s) => {
        f = s.field;
      },
    );
    const before = f;
    await cache.request(
      { ...d, atmosphere: { kind: 'constant', density: 1 } },
      { ...v, 'angle-deg': -4 },
      (s) => {
        f = s.field;
      },
    );
    expect(f).toBe(before);
    cache.dispose();
  }, 30000);
});
