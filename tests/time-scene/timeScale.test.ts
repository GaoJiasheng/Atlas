import { describe, expect, it } from 'vitest';
import { createTimeScale, fitAlpha, MIN_NODE_GAP, scaleKnots, thinTicks } from '../../src/engines/time-scene/lib/timeScale';
import { toNumber } from '../../src/engines/time-scene/lib/time';

/** The ww2 chapter times (chapter 08 at 1942-02-18) on a 1931–1945 span. */
const WW2 = ['1937-12-13', '1939-08-31', '1939-09-17', '1940-06-22', '1941-10-02', '1941-12-07', '1942-02-15', '1942-02-18', '1943-02-02', '1945-05-08', '1945-09-12'].map(
  (d) => toNumber(d),
);
const MIN = toNumber('1931-09-18');
const MAX = toNumber('1945-09-12');

const nodeGaps = (scale: ReturnType<typeof createTimeScale>, nodes: number[]) => {
  const xs = [...new Set(nodes)].sort((a, b) => a - b).map(scale.x);
  return xs.slice(1).map((x, i) => x - xs[i]!);
};

describe('timeScale', () => {
  it('is linear (α = 1) when every chapter gap already fits', () => {
    const nodes = [2000.1, 2000.5, 2000.9];
    expect(fitAlpha(2000, 2001, nodes, 1000)).toBe(1);
    const s = createTimeScale({ min: 2000, max: 2001, nodes, width: 1000 });
    expect(s.alpha).toBe(1);
    expect(s.x(2000.25)).toBeCloseTo(250, 6);
  });

  it('keeps adjacent chapter nodes at least the minimum gap apart', () => {
    for (const width of [900, 1030, 1400, 2400]) {
      const s = createTimeScale({ min: MIN, max: MAX, nodes: WW2, width });
      const even = width / (scaleKnots(MIN, MAX, WW2).length - 1);
      if (even > MIN_NODE_GAP) {
        expect(s.alpha).toBeGreaterThan(0);
        expect(s.alpha).toBeLessThan(1);
        for (const g of nodeGaps(s, WW2)) expect(g).toBeGreaterThanOrEqual(MIN_NODE_GAP - 1e-6);
        // Largest α: a hair more and the closest pair drops under the gap.
        const tighter = createTimeScale({ min: MIN, max: MAX, nodes: WW2, width, alpha: Math.min(1, s.alpha + 0.01) });
        expect(Math.min(...nodeGaps(tighter, WW2))).toBeLessThan(MIN_NODE_GAP);
      } else {
        // Too narrow even for evenly spaced nodes: α = 0 is the best effort.
        expect(s.alpha).toBe(0);
        for (const g of nodeGaps(s, WW2)) expect(g).toBeCloseTo(even, 6);
      }
    }
  });

  it('is monotonic and spans [0, width]', () => {
    const s = createTimeScale({ min: MIN, max: MAX, nodes: WW2, width: 1200 });
    expect(s.x(MIN)).toBe(0);
    expect(s.x(MAX)).toBeCloseTo(1200, 6);
    let prev = -1;
    for (let i = 0; i <= 2000; i++) {
      const x = s.x(MIN + ((MAX - MIN) * i) / 2000);
      expect(x).toBeGreaterThan(prev);
      prev = x;
    }
    expect(s.x(MIN - 5)).toBe(0);
    expect(s.x(MAX + 5)).toBeCloseTo(1200, 6);
  });

  it('inverts exactly (pointer → time → pointer and time → pointer → time)', () => {
    const s = createTimeScale({ min: MIN, max: MAX, nodes: WW2, width: 1200 });
    for (let px = 0; px <= 1200; px += 7.3) expect(s.x(s.invert(px))).toBeCloseTo(px, 6);
    for (const t of [...WW2, MIN, MAX, 1938.4, 1944.01]) expect(s.invert(s.x(t))).toBeCloseTo(t, 9);
  });

  it('handles chapters at the span ends and at the same time', () => {
    const nodes = [2000, 2000, 2000.001, 2001];
    expect(scaleKnots(2000, 2001, nodes)).toEqual([2000, 2000.001, 2001]);
    const s = createTimeScale({ min: 2000, max: 2001, nodes, width: 600 });
    expect(nodeGaps(s, nodes).every((g) => g >= MIN_NODE_GAP - 1e-6)).toBe(true);
    expect(s.invert(s.x(2000.5))).toBeCloseTo(2000.5, 9);
  });

  it('reuses a given α (band card) and degrades to a flat line for an empty span', () => {
    const s = createTimeScale({ min: MIN, max: MAX, nodes: WW2, width: 300, alpha: 0.4 });
    expect(s.alpha).toBe(0.4);
    const flat = createTimeScale({ min: 5, max: 5, nodes: [5], width: 300 });
    expect(flat.x(5)).toBe(0);
    expect(flat.invert(120)).toBe(5);
  });

  it('thins labels and minor ticks where the mapping compresses time', () => {
    const { major, minor } = thinTicks(
      [{ t: 0 }, { t: 1 }, { t: 2 }, { t: 3 }],
      [0.5, 0.52, 1.5, 2.5],
      (t) => (t < 2 ? t * 10 : 20 + (t - 2) * 100),
      30,
    );
    expect(major.map((m) => m.showLabel)).toEqual([true, false, false, true]);
    expect(minor).toEqual([5, 15, 70]);
  });
});
