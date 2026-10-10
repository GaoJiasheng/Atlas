import { describe, expect, it } from 'vitest';
import { createSegmentScale, MIN_TICK_GAP, SEGMENT_GAP, spreadTicks, type SegmentSpec } from '../../src/engines/time-scene/lib/segmentScale';
import { toNumber } from '../../src/engines/time-scene/lib/time';

const d = (s: string) => toNumber(s);
const spec = (id: string, time: string, beats: string[] = []): SegmentSpec => ({ id, time: d(time), beats: beats.map(d) });

/** A slice of the ww2 chapters: 07 and 08 overlap (08's beats run past 09's start), 03 starts with its first beat. */
const WW2: SegmentSpec[] = [
  spec('asia-1937', '1937-12-13', ['1931-09-18', '1937-08-10', '1937-11-12', '1937-12-13']),
  spec('world-1939', '1939-08-31', ['1938-01-15', '1938-02-14', '1938-10-05', '1939-08-31']),
  spec('poland-1939', '1939-09-17', ['1939-09-05', '1939-09-19', '1939-10-06']),
  spec('syonan', '1942-02-18', ['1942-02-18', '1942-02-28', '1943-01-01', '1943-06-01', '1943-10-10']),
  spec('turning-points', '1943-02-02', ['1942-06-04', '1942-08-07', '1942-11-08', '1943-02-02', '1943-07-05']),
  spec('end-and-home', '1945-09-12', ['1945-08-06', '1945-08-12', '1945-09-02', '1945-09-12']),
];
const MAX = d('1945-09-12');

describe('segmentScale', () => {
  it('gives every chapter an equal-width segment, starting at the chapter time or its first beat if earlier', () => {
    const s = createSegmentScale({ segments: WW2, max: MAX, width: 1200 });
    expect(s.segments).toHaveLength(WW2.length);
    const widths = s.segments.map((g) => g.x1 - g.x0);
    expect(widths[0]).toBeCloseTo(200 - SEGMENT_GAP / 2, 9);
    for (const w of widths.slice(1, -1)) expect(w).toBeCloseTo(200 - SEGMENT_GAP, 9);
    expect(s.segments[0]!.x0).toBe(0);
    expect(s.segments.at(-1)!.x1).toBe(1200);
    expect(s.segments[1]!.start).toBe(d('1938-01-15'));
    expect(s.segments[2]!.start).toBe(d('1939-09-05'));
    // A segment ends where the next starts, or at its last beat when that is later; the last one at the data maximum.
    expect(s.segments[1]!.end).toBe(d('1939-09-05'));
    expect(s.segments[3]!.end).toBe(d('1943-10-10'));
    expect(s.segments.at(-1)!.end).toBe(MAX);
  });

  it('is monotonic inside every segment, and the default (unanchored) mapping is monotonic in time', () => {
    const s = createSegmentScale({ segments: WW2, max: MAX, width: 1200 });
    for (const g of s.segments) {
      let prev = -1;
      for (let i = 0; i <= 400; i++) {
        const x = s.x(g.start + ((g.end - g.start) * i) / 400, { segment: g.index });
        expect(x).toBeGreaterThanOrEqual(prev);
        expect(x).toBeGreaterThanOrEqual(g.x0 - 1e-9);
        expect(x).toBeLessThanOrEqual(g.x1 + 1e-9);
        prev = x;
      }
      expect(s.x(g.start, { segment: g.index })).toBe(g.x0);
      expect(s.x(g.end, { segment: g.index })).toBeCloseTo(g.x1, 9);
    }
    const t0 = s.segments[0]!.start;
    const t1 = MAX;
    let prev = -1;
    for (let i = 0; i <= 4000; i++) {
      const x = s.x(t0 + ((t1 - t0) * i) / 4000);
      expect(x).toBeGreaterThanOrEqual(prev);
      prev = x;
    }
    // Outside the bar's span: clamped to the ends.
    expect(s.x(t0 - 3)).toBe(0);
    expect(s.x(MAX + 3)).toBe(1200);
  });

  it('inverts: pointer → time → pointer within the segment, and time → pointer → time', () => {
    const s = createSegmentScale({ segments: WW2, max: MAX, width: 1200 });
    for (let px = 0; px <= 1200; px += 3.7) {
      const { t, segment } = s.invert(px);
      const g = s.segments[segment]!;
      expect(segment).toBe(s.segmentAt(px));
      expect(s.x(t, { segment })).toBeCloseTo(Math.min(Math.max(px, g.x0), g.x1), 6);
    }
    for (const g of s.segments) {
      for (let i = 0; i <= 50; i++) {
        const t = g.start + ((g.end - g.start) * i) / 50;
        const x = s.x(t, { segment: g.index });
        // Exact where the mapping has width; where ticks were pushed together the time collapses onto the tick.
        const flat = g.knots.some((k, j) => j > 0 && k.x === g.knots[j - 1]!.x && t >= g.knots[j - 1]!.t && t <= k.t);
        if (!flat) expect(s.invert(x).t).toBeCloseTo(t, 9);
        expect(s.x(s.invert(x).t, { segment: g.index })).toBeCloseTo(x, 9);
      }
    }
  });

  it('keeps beat ticks at least the minimum gap apart when the segment has room, and in their segment always', () => {
    for (const width of [600, 1030, 1600]) {
      const s = createSegmentScale({ segments: WW2, max: MAX, width });
      for (const g of s.segments) {
        const xs = g.ticks.map((k) => k.x).sort((a, b) => a - b);
        const room = (g.x1 - g.x0) / Math.max(1, xs.length - 1);
        for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(Math.min(MIN_TICK_GAP, room) - 1e-9);
        for (const x of xs) {
          expect(x).toBeGreaterThanOrEqual(g.x0);
          expect(x).toBeLessThanOrEqual(g.x1);
        }
      }
    }
    // Beats on the same day (ww1 Versailles: three on 28 June 1919) still get their own ticks.
    const same = createSegmentScale({ segments: [spec('v', '1919-06-28', ['1919-01-18', '1919-06-28', '1919-06-28', '1919-06-28'])], max: d('1919-06-28'), width: 300 });
    const xs = same.segments[0]!.ticks.map((k) => k.x);
    for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(MIN_TICK_GAP - 1e-9);
    expect(spreadTicks([5, 5, 5], 0, 12, 10)).toEqual([0, 6, 12]);
  });

  it('puts the playhead on the anchored tick, and in the anchored segment where chapters overlap', () => {
    const s = createSegmentScale({ segments: WW2, max: MAX, width: 1200 });
    const syonan = s.segments[3]!;
    const turning = s.segments[4]!;
    const t = d('1942-08-07'); // in both spans
    expect(s.locate(t)).toBe(3);
    expect(s.locate(t, 4)).toBe(4);
    expect(s.x(t)).toBeLessThanOrEqual(syonan.x1);
    expect(s.x(t, { segment: 4, tick: 1 })).toBe(turning.ticks[1]!.x);
    // A preferred segment that does not hold the time falls back to the first that does.
    expect(s.locate(d('1939-01-01'), 4)).toBe(1);
    // Ticks are in beat order, each at its beat.
    expect(turning.ticks.map((k) => k.index)).toEqual([0, 1, 2, 3, 4]);
    expect(turning.ticks.map((k) => k.t)).toEqual(WW2[4]!.beats);
  });

  it('falls back to one tick at the chapter time for a chapter without beats', () => {
    const s = createSegmentScale({ segments: [spec('a', '2000-01-15'), spec('b', '2000-03-11'), spec('c', '2000-07-01')], max: d('2000-12-31'), width: 900 });
    expect(s.segments.map((g) => g.ticks.length)).toEqual([1, 1, 1]);
    expect(s.segments.map((g) => g.ticks[0]!.t)).toEqual([d('2000-01-15'), d('2000-03-11'), d('2000-07-01')]);
    // The tick sits at its segment's start, and the segment runs to the next chapter.
    for (const g of s.segments) expect(g.ticks[0]!.x).toBe(g.x0);
    expect(s.segments[0]!.end).toBe(d('2000-03-11'));
    expect(s.invert(450).segment).toBe(1);
    // No segments: everything at 0.
    const none = createSegmentScale({ segments: [], max: 5, width: 300 });
    expect(none.x(5)).toBe(0);
    expect(none.invert(100)).toEqual({ t: 5, segment: -1 });
  });
});
