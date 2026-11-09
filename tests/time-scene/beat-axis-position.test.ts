import { describe, expect, it } from 'vitest';
import { createSegmentScale } from '../../src/engines/time-scene/lib/segmentScale';
import { toNumber } from '../../src/engines/time-scene/lib/time';

describe('Apollo week authored beat spacing', () => {
  it('spreads five beats in a seven-chapter axis without changing dates or seeking', () => {
    const dates = ['1969-07-16', '1969-07-16', '1969-07-20', '1969-07-21', '1969-07-24'].map(toNumber);
    const chapters = ['1957-10-04', '1961-04-12', '1965-12-15', '1967-01-27', '1969-07-16', '1970-04-17', '1973-01-01'];
    for (const width of [700, 1080, 1600]) {
      const segments = chapters.map((t, i) => ({
        id: `chapter-${i}`, time: toNumber(t), beats: i === 4 ? dates : [toNumber(t)],
      }));
      const baseline = createSegmentScale({ segments, max: toNumber('1975-07-17'), width });
      const scale = createSegmentScale({
        segments: segments.map((s, i) => i === 4 ? { ...s, positions: [0, .25, .5, .75, 1] } : s),
        max: toNumber('1975-07-17'), width,
      });
      const segment = scale.segments[4]!;
      expect(segment.ticks.map((tick) => tick.t)).toEqual(dates);
      segment.ticks.forEach((tick, i) => {
        expect(tick.x).toBeCloseTo(segment.x0 + i * (segment.x1 - segment.x0) / 4);
        expect(scale.x(tick.t, { segment: 4, tick: i })).toBe(tick.x);
        expect(scale.invert(tick.x).t).toBeCloseTo(dates[i]!);
        if (i > 0) expect(tick.x - segment.ticks[i - 1]!.x).toBeGreaterThan(23);
      });
      scale.segments.forEach((s, i) => { if (i !== 4) expect(s).toEqual(baseline.segments[i]); });
    }
  });
});
