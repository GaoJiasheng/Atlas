import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createRotationModel, poleQuat, slerp, type RotationFile } from '../../src/engines/time-scene/lib/plateRotation';

const RAD = Math.PI / 180;
const rotations = JSON.parse(readFileSync('public/geo/cd-rotations.json', 'utf8')) as RotationFile;
const golden = JSON.parse(readFileSync('tests/fixtures/continental-drift/golden.json', 'utf8')) as { cases: [number, number, number, number, number, number][] };

/** Great-circle distance in degrees. */
function gcd(a: readonly number[], b: readonly number[]): number {
  const [l1, p1, l2, p2] = [a[0]! * RAD, a[1]! * RAD, b[0]! * RAD, b[1]! * RAD];
  const s = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s)))) / RAD;
}

describe('plate rotation (E-CD1) against pyGPlates', () => {
  const model = createRotationModel(rotations);
  it('reproduces every golden position within 0.001°, including fixed-plate switch ages', () => {
    let worst = 0;
    const misses: string[] = [];
    for (const [plate, lon, lat, ma, gLon, gLat] of golden.cases) {
      const p = model.rotatePoint(plate, ma, [lon, lat])!;
      const d = gcd(p, [gLon, gLat]);
      worst = Math.max(worst, d);
      if (d > 0.001 && misses.length < 10) misses.push(`${plate} @${ma}: ${d.toFixed(5)}°`);
    }
    expect(misses).toEqual([]);
    expect(golden.cases.length).toBeGreaterThan(10000);
    expect(worst).toBeLessThanOrEqual(0.001);
  });
  it('leaves present-day positions in place at 0 Ma', () => {
    for (const [plate, lon, lat, ma] of golden.cases) if (ma === 0) expect(gcd(model.rotatePoint(plate, 0, [lon, lat])!, [lon, lat])).toBeLessThanOrEqual(0.001);
  });
  it('returns null for a non-finite age', () => {
    expect(model.rotation(701, Number.NaN)).toBeNull();
  });
});

describe('quaternion helpers (TEST values)', () => {
  it('slerp takes the short arc when the dot product is negative', () => {
    const a = poleQuat(90, 0, 10);
    const b = poleQuat(90, 0, 30).map((v) => -v) as typeof a;
    const mid = slerp(a, b, 0.5);
    const expected = poleQuat(90, 0, 20);
    const same = Math.abs(mid.reduce((s, v, i) => s + v * expected[i]!, 0));
    expect(same).toBeCloseTo(1, 12);
  });
  it('leaves a plate that no sequence links to the anchor in place (as GPlates), even in a loop', () => {
    const loop = createRotationModel({ version: 1, modelId: 'test', anchorPlateId: 0, sequences: [
      { moving: 1, fixed: 2, poles: [[0, 90, 0, 0], [10, 0, 0, 5]] },
      { moving: 2, fixed: 1, poles: [[0, 90, 0, 0], [10, 0, 0, 5]] },
    ] });
    expect(loop.rotation(1, 5)).toEqual([1, 0, 0, 0]);
  });
  it('switches fixed plate at the shared age by the depth-first tree order', () => {
    // TEST: plate 3 moves with plate 1 until 10 Ma and with plate 2 from 10 Ma.
    const m = createRotationModel({ version: 1, modelId: 'test', anchorPlateId: 0, sequences: [
      { moving: 1, fixed: 0, poles: [[0, 90, 0, 0], [20, 90, 0, 20]] },
      { moving: 2, fixed: 0, poles: [[0, 90, 0, 0], [20, 90, 0, -20]] },
      { moving: 3, fixed: 1, poles: [[0, 90, 0, 0], [10, 90, 0, 0]] },
      { moving: 3, fixed: 2, poles: [[10, 90, 0, 20], [20, 90, 0, 20]] },
    ] });
    expect(m.rotatePoint(3, 5, [0, 0])![0]).toBeCloseTo(5, 9);
    expect(m.rotatePoint(3, 15, [0, 0])![0]).toBeCloseTo(5, 9);
  });
});
