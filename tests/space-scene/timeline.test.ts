/**
 * Timeline outputs and their playback (docs/30 F2, docs/31 E-EN5): segment
 * and sample interpolation, peaks, thinning, and the clock rules (a new key
 * plays from the start after 0.4 s, the same key keeps its place, instant
 * changes and still views show the end, "Run again" starts at once, `slow`).
 */
import { describe, expect, it } from 'vitest';
import {
  AUTO_PLAY_DELAY,
  channelPeak,
  channelValue,
  EMPTY_TIMELINE,
  endPlayback,
  endValue,
  MAX_SAMPLES,
  replayPlayback,
  seg,
  segmentValue,
  startPlayback,
  stepPlayback,
  thinSamples,
  updatePlayback,
  type Timeline,
} from '../../src/engines/space-scene/lib/sim/timeline';
import { cardStates, cardTimelines } from '../../src/engines/space-scene/lib/sim/replay';
import { forcesSim } from './fixtures/forces-bench';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';

const ramp: Timeline = {
  kind: 'timeline',
  key: 'a',
  duration: 3,
  slow: 1,
  channels: {
    // Speeds up from rest at 2 m/s² for 1 s, then slows at 1 m/s² to a stop at 3 s.
    x: { segments: [seg(0, 1, 0, 0, 2), seg(1, 3, 1, 2, -1)] },
    y: { samples: [[0, 0], [1, 10], [2, 0]] },
  },
};

describe('channel values', () => {
  it('segments: uniform acceleration inside, held before and after', () => {
    expect(channelValue(ramp, 'x', -1)).toBe(0);
    expect(channelValue(ramp, 'x', 0.5)).toBeCloseTo(0.25, 12);
    expect(channelValue(ramp, 'x', 1)).toBeCloseTo(1, 12);
    expect(channelValue(ramp, 'x', 2)).toBeCloseTo(1 + 2 - 0.5, 12);
    expect(channelValue(ramp, 'x', 3)).toBeCloseTo(3, 12);
    expect(channelValue(ramp, 'x', 10)).toBeCloseTo(3, 12);
    expect(segmentValue(seg(1, 2, 5, 1, 0), 0)).toBe(5);
  });
  it('a gap between segments holds the last value', () => {
    const t: Timeline = { ...ramp, channels: { x: { segments: [seg(0, 1, 0, 1), seg(2, 3, 5)] } } };
    expect(channelValue(t, 'x', 1.5)).toBe(5);
  });
  it('samples: linear between, held outside', () => {
    expect(channelValue(ramp, 'y', 0.25)).toBeCloseTo(2.5, 12);
    expect(channelValue(ramp, 'y', 1.5)).toBeCloseTo(5, 12);
    expect(channelValue(ramp, 'y', 9)).toBe(0);
    expect(channelValue(ramp, 'y', -2)).toBe(0);
  });
  it('a channel the timeline does not have reads 0; the end value is the value at the duration', () => {
    expect(channelValue(ramp, 'nope', 1)).toBe(0);
    expect(channelValue(null, 'x', 1)).toBe(0);
    expect(endValue(ramp, 'x')).toBeCloseTo(3, 12);
    expect(endValue(EMPTY_TIMELINE, 'x')).toBe(0);
  });
  it('peaks: segment turning points and sample maxima', () => {
    const t: Timeline = { ...ramp, channels: { v: { segments: [seg(0, 2, 0, 2, -2)] } } };
    expect(channelPeak(t, 'v')).toBeCloseTo(1, 12);
    expect(channelPeak(ramp, 'y')).toBe(10);
  });
  it('thinning keeps the ends and at most 256 samples', () => {
    const xs = Array.from({ length: 1001 }, (_, i) => [i / 1000, i] as [number, number]);
    const thin = thinSamples(xs);
    expect(thin.length).toBe(MAX_SAMPLES);
    expect(thin[0]).toEqual([0, 0]);
    expect(thin[thin.length - 1]).toEqual([1, 1000]);
  });
});

describe('playback', () => {
  it('first seen: at the end, still', () => {
    const p = startPlayback(ramp);
    expect(p.t).toBe(3);
    expect(p.playing).toBe(false);
  });
  it('a new key plays from the start after the delay; slow stretches it', () => {
    const p = updatePlayback(startPlayback(ramp), { ...ramp, key: 'b', slow: 2 }, false);
    expect(p).toMatchObject({ t: 0, playing: true, wait: AUTO_PLAY_DELAY });
    expect(stepPlayback(p, AUTO_PLAY_DELAY)).toBe(true);
    expect(p.t).toBe(0);
    stepPlayback(p, 1);
    expect(p.t).toBeCloseTo(0.5, 12);
    while (stepPlayback(p, 0.25));
    expect(p.t).toBe(3);
    expect(p.playing).toBe(false);
  });
  it('the same key keeps its place (another control changed); an instant change shows the end', () => {
    const p = updatePlayback(startPlayback(ramp), { ...ramp, key: 'b' }, false);
    stepPlayback(p, AUTO_PLAY_DELAY + 1);
    const q = updatePlayback(p, { ...ramp, key: 'b' }, false);
    expect(q.t).toBeCloseTo(1, 12);
    expect(q.playing).toBe(true);
    const r = updatePlayback(q, { ...ramp, key: 'c' }, true);
    expect(r).toMatchObject({ t: 3, playing: false });
  });
  it('Run again starts at once; an empty run does not play; end jumps to the end', () => {
    const p = replayPlayback(startPlayback(ramp));
    expect(p).toMatchObject({ t: 0, playing: true, wait: 0 });
    endPlayback(p);
    expect(p).toMatchObject({ t: 3, playing: false });
    expect(replayPlayback(startPlayback(EMPTY_TIMELINE)).playing).toBe(false);
    expect(updatePlayback(startPlayback(ramp), { ...EMPTY_TIMELINE, key: 'z' }, false).playing).toBe(false);
  });
});

describe('the timelines a card runs again', () => {
  it('`true`: the timelines its varied control changes', () => {
    const values = resolveSimValues(forcesSim, {});
    expect(cardTimelines(forcesSim, values, { vary: 'pair', observe: ['t-left'], replay: true })).toEqual(['drop-run']);
    expect(cardTimelines(forcesSim, values, { vary: 'lane', observe: ['f-start'], replay: true })).toEqual(['pull-run']);
    expect(cardTimelines(forcesSim, values, { vary: 'push', observe: ['effect'], replay: true })).toEqual(['push-run']);
    expect(cardTimelines(forcesSim, values, { vary: 'squeeze', observe: ['stop-time'], replay: ['wheel-run', 'car-run'] })).toEqual(['wheel-run', 'car-run']);
    expect(cardTimelines(forcesSim, values, { vary: 'squeeze', observe: ['stop-time'] })).toEqual([]);
  });
});

describe('the states a card (or its chapter) moves', () => {
  it('the push card moves the effect; the brake card none; the chapter\'s own settings count too', () => {
    const values = resolveSimValues(forcesSim, {});
    expect(cardStates(forcesSim, values, { vary: 'push', observe: ['speed-after'] })).toEqual(['effect']);
    expect(cardStates(forcesSim, values, { vary: 'squeeze', observe: ['stop-time'] })).toEqual([]);
    expect(cardStates(forcesSim, values, { vary: 'squeeze', observe: ['stop-time'] }, { pair: 'balls' })).toEqual(['landing']);
    expect(cardStates(forcesSim, values, { vary: 'spring-load', also: ['unload'], observe: ['extension'] })).toEqual(['returns']);
  });
});
