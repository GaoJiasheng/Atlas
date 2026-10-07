import { describe, expect, it } from 'vitest';
import {
  clamp,
  fromNumber,
  keyframeWindow,
  periodEnd,
  precisionFor,
  precisionOf,
  progressAlong,
  stepFor,
  toNumber,
} from '../../src/engines/time-scene/lib/time';

describe('toNumber', () => {
  it('maps ISO dates to decimal years at the start of the period', () => {
    expect(toNumber('1942')).toBe(1942);
    expect(toNumber('1942-01')).toBe(1942);
    expect(toNumber('1942-01-01')).toBe(1942);
    expect(toNumber('1942-02')).toBeCloseTo(1942 + 31 / 365, 10);
    expect(toNumber('1942-02-15')).toBeCloseTo(1942 + 45 / 365, 10);
    // Leap year: 2000 has 366 days.
    expect(toNumber('2000-07-01')).toBeCloseTo(2000 + 182 / 366, 10);
  });

  it('is monotonic across precisions', () => {
    expect(toNumber('1941-12-31')).toBeLessThan(toNumber('1942'));
    expect(toNumber('1942-02')).toBeLessThan(toNumber('1942-02-15'));
    expect(toNumber('1942-02-15')).toBeLessThan(toNumber('1942-03'));
  });

  it('handles BCE years', () => {
    expect(toNumber('-0221')).toBe(-221);
    expect(toNumber('-0221-07')).toBeGreaterThan(-221);
  });

  it('maps geological time to negative years', () => {
    expect(toNumber({ ma: 200 })).toBe(-200_000_000);
    expect(toNumber({ ma: 0.5 })).toBe(-500_000);
    expect(toNumber({ ma: 0 })).toBe(0);
    expect(toNumber({ ma: 66 })).toBeGreaterThan(toNumber({ ma: 200 }));
  });

  it('returns NaN for malformed dates', () => {
    expect(toNumber('1942-02-30')).toBeNaN();
    expect(toNumber('not a date')).toBeNaN();
  });
});

describe('fromNumber', () => {
  it('round-trips day-precision dates', () => {
    for (const d of ['1942-02-15', '2000-02-29', '2000-12-31', '1999-01-01', '0800-06-15', '-0221-03-04']) {
      expect(fromNumber(toNumber(d), 'date')).toBe(d);
    }
  });

  it('floors to the requested precision', () => {
    const n = toNumber('1942-02-15') + 0.3 / 365;
    expect(fromNumber(n, 'date')).toBe('1942-02-15');
    expect(fromNumber(n, 'date', { precision: 'month' })).toBe('1942-02');
    expect(fromNumber(n, 'date', { precision: 'year' })).toBe('1942');
  });

  it('converts geological numbers to { ma }', () => {
    expect(fromNumber(-200_000_000, 'ma')).toEqual({ ma: 200 });
    expect(fromNumber(-66_043_000, 'ma')).toEqual({ ma: 66.04 });
    expect(fromNumber(-66_043_000, 'ma', { maDigits: 0 })).toEqual({ ma: 66 });
    expect(fromNumber(10, 'ma')).toEqual({ ma: 0 });
  });
});

describe('periodEnd', () => {
  it('returns the start of the next period', () => {
    expect(periodEnd('1942')).toBe(1943);
    expect(periodEnd('1942-12')).toBe(1943);
    expect(periodEnd('1942-02')).toBeCloseTo(toNumber('1942-03-01'), 10);
    expect(periodEnd('1942-02-15')).toBeCloseTo(toNumber('1942-02-16'), 10);
    expect(periodEnd({ ma: 5 })).toBe(-5_000_000);
  });
});

describe('precision helpers', () => {
  it('detects ISO precision', () => {
    expect(precisionOf('1942')).toBe('year');
    expect(precisionOf('1942-02')).toBe('month');
    expect(precisionOf('1942-02-15')).toBe('day');
    expect(precisionOf({ ma: 3 })).toBeNull();
  });
  it('picks readout precision and nudge step by span', () => {
    expect(precisionFor(0.5)).toBe('day');
    expect(precisionFor(30)).toBe('month');
    expect(precisionFor(500)).toBe('year');
    expect(stepFor(6, 'date')).toBeCloseTo(1 / 365);
    expect(stepFor(50, 'date')).toBeCloseTo(1 / 12);
    expect(stepFor(400, 'date')).toBe(1);
    expect(stepFor(200e6, 'ma')).toBe(2e6);
  });
});

describe('clamp / progressAlong', () => {
  it('clamps', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
  it('measures progress between two times', () => {
    expect(progressAlong(10, 20, 15)).toBe(0.5);
    expect(progressAlong(10, 20, 5)).toBe(0);
    expect(progressAlong(10, 20, 25)).toBe(1);
    expect(progressAlong(10, 10, 9)).toBe(0);
    expect(progressAlong(10, 10, 10)).toBe(1);
  });
});

describe('keyframeWindow (docs/03 crossfade rule)', () => {
  const kfs = [{ t: 0 }, { t: 10 }, { t: 20 }];
  const at = (t: number) => keyframeWindow(kfs, t, (k) => k.t);

  it('shows nothing before the first keyframe', () => {
    const w = at(-1);
    expect(w.prev).toBeNull();
    expect(w.next).toBe(kfs[0]);
    expect(w.prevOpacity).toBe(0);
    expect(w.nextOpacity).toBe(0);
  });

  it('shows the previous keyframe alone until the last 30% of the interval', () => {
    for (const t of [0, 3, 7]) {
      const w = at(t);
      expect(w.prevIndex).toBe(0);
      expect(w.nextIndex).toBe(1);
      expect(w.blend).toBe(0);
      expect(w.prevOpacity).toBe(1);
      expect(w.nextOpacity).toBe(0);
    }
  });

  it('crossfades prev 1 -> 0.4 and next 0 -> 1 across the window', () => {
    const mid = at(8.5);
    expect(mid.blend).toBeCloseTo(0.5);
    expect(mid.prevOpacity).toBeCloseTo(0.7);
    expect(mid.nextOpacity).toBeCloseTo(0.5);
    const end = at(9.999999);
    expect(end.prevOpacity).toBeCloseTo(0.4, 4);
    expect(end.nextOpacity).toBeCloseTo(1, 4);
  });

  it('lands exactly on a keyframe with that keyframe alone', () => {
    const w = at(10);
    expect(w.prev).toBe(kfs[1]);
    expect(w.prevOpacity).toBe(1);
    expect(w.nextOpacity).toBe(0);
  });

  it('keeps the last keyframe after the end', () => {
    const w = at(99);
    expect(w.prev).toBe(kfs[2]);
    expect(w.next).toBeNull();
    expect(w.prevOpacity).toBe(1);
  });
});
