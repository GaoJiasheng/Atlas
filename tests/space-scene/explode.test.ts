import { describe, expect, it } from 'vitest';
import { explodedPosition, explodeOffset, targetExplodeAmount } from '../../src/engines/space-scene/lib/explode';
import { damp } from '../../src/engines/space-scene/lib/math';

const close = (a: readonly number[], b: readonly number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 6));

describe('explodeOffset', () => {
  it('moves along the unit direction by dist * amount', () => {
    close(explodeOffset({ dir: [1, 0, 0], dist: 2 }, 0.5), [1, 0, 0]);
    close(explodeOffset({ dir: [0, 3, 4], dist: 1 }, 1), [0, 0.6, 0.8]); // normalised
  });
  it('is zero at amount 0 and for a zero direction', () => {
    close(explodeOffset({ dir: [1, 1, 0], dist: 3 }, 0), [0, 0, 0]);
    close(explodeOffset({ dir: [0, 0, 0], dist: 3 }, 1), [0, 0, 0]);
  });
  it('clamps the amount to 0..1', () => {
    close(explodeOffset({ dir: [0, -1, 0], dist: 0.8 }, 4), [0, -0.8, 0]);
    close(explodeOffset({ dir: [0, -1, 0], dist: 0.8 }, -1), [0, 0, 0]);
  });
  it('adds to the rest position', () => {
    close(explodedPosition([1, 0.6, 0], { dir: [1, 0, 0], dist: 1.2 }, 0.5), [1.6, 0.6, 0]);
  });
});

describe('targetExplodeAmount', () => {
  it('only explodes in the exploded view', () => {
    expect(targetExplodeAmount('exploded', 0.8)).toBe(0.8);
    expect(targetExplodeAmount('assembled', 0.8)).toBe(0);
    expect(targetExplodeAmount('xray', 1)).toBe(0);
    expect(targetExplodeAmount('isolate', 1)).toBe(0);
  });
});

describe('damp (explode easing)', () => {
  it('converges towards the target frame-rate independently', () => {
    const oneStep = damp(0, 1, 7, 0.1);
    let twoSteps = damp(0, 1, 7, 0.05);
    twoSteps = damp(twoSteps, 1, 7, 0.05);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(oneStep).toBeGreaterThan(0);
    expect(oneStep).toBeLessThan(1);
    let x = 0;
    for (let i = 0; i < 120; i++) x = damp(x, 1, 7, 1 / 60);
    expect(x).toBeGreaterThan(0.999);
  });
});
