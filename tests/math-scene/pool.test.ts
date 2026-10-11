/** Drawing a step's check from its pool (docs/15 §10): in range, never the task shown last, and every task reachable. */
import { describe, expect, it } from 'vitest';
import { drawIndex } from '../../src/engines/math-scene/lib/pool';

describe('drawIndex', () => {
  it('stays in the pool and avoids the task shown last', () => {
    for (let seed = 1; seed < 40; seed++) {
      let prev: number | null = null;
      for (let draw = 0; draw < 30; draw++) {
        const k = drawIndex(seed * 7919, 'equivalent-fractions', draw, 10, prev);
        expect(k).toBeGreaterThanOrEqual(0);
        expect(k).toBeLessThan(10);
        expect(k).not.toBe(prev);
        prev = k;
      }
    }
  });

  it('reaches every task of the pool', () => {
    const seen = new Set<number>();
    for (let draw = 0; draw < 200; draw++) seen.add(drawIndex(12345, 'simplest-form', draw, 9, null));
    expect(seen.size).toBe(9);
  });

  it('is fixed for a seed (the page view) and differs between steps', () => {
    expect(drawIndex(42, 'number-line', 3, 10, null)).toBe(drawIndex(42, 'number-line', 3, 10, null));
    const a = Array.from({ length: 8 }, (_, i) => drawIndex(42, 'number-line', i, 10, null));
    const b = Array.from({ length: 8 }, (_, i) => drawIndex(42, 'unit-fractions', i, 10, null));
    expect(a).not.toEqual(b);
  });

  it('has one choice in a pool of one', () => {
    expect(drawIndex(9, 'x', 0, 1, 0)).toBe(0);
  });
});
