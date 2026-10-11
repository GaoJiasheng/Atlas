import { describe, expect, it } from 'vitest';
import { axisCounter, flatIndex, segmentFill, stepBeat, tickPosition } from '../../src/engines/core/axis/axis';

// Three chapters: a (3 beats of its own), b (none: one default beat), c (2).
const beats = [
  { chapter: 'a', index: 0 },
  { chapter: 'a', index: 1 },
  { chapter: 'a', index: 2 },
  { chapter: 'b', index: 0 },
  { chapter: 'c', index: 0 },
  { chapter: 'c', index: 1 },
];

describe('chapter axis model', () => {
  it('spaces ticks evenly and centred, and fills the current segment up to the beat on show', () => {
    expect([0, 1, 2].map((i) => tickPosition(i, 3))).toEqual([1 / 6, 0.5, 5 / 6]);
    expect(tickPosition(0, 1)).toBe(0.5);
    expect(segmentFill(null, 3)).toBe(0);
    expect(segmentFill(2, 3)).toBe(5 / 6);
    expect(segmentFill(9, 3)).toBe(5 / 6);
  });
  it('finds a beat in the flat list (null = the chapter first beat)', () => {
    expect(flatIndex(beats, 'a', 2)).toBe(2);
    expect(flatIndex(beats, 'c', null)).toBe(4);
    expect(flatIndex(beats, 'x', 0)).toBe(-1);
  });
  it('steps across chapters; from a chapter own state, next is its first beat', () => {
    expect(stepBeat(beats, 'a', 2, true, 1)).toBe(3);
    expect(stepBeat(beats, 'b', 0, false, 1)).toBe(4);
    expect(stepBeat(beats, 'c', 0, true, -1)).toBe(3);
    expect(stepBeat(beats, 'c', null, true, 1)).toBe(4);
    expect(stepBeat(beats, 'c', null, true, -1)).toBe(3);
    expect(stepBeat(beats, 'b', null, false, 1)).toBe(4);
    expect(stepBeat(beats, 'a', 0, true, -1)).toBeNull();
    expect(stepBeat(beats, 'c', 1, true, 1)).toBeNull();
  });
  it('writes the right-end counter', () => {
    expect(axisCounter('05', 1, 8)).toBe('05 · 2/8');
    expect(axisCounter('05', null, 8)).toBe('05 · –/8');
    expect(axisCounter('BG', 0, 1)).toBe('BG · 1/1');
  });
});
