import { describe, expect, it } from 'vitest';
import { centredOffset, pageStep, scrollCue } from '../src/engines/core/scroll-cue';

describe('scrollCue', () => {
  it('shows no cue when everything fits', () => {
    expect(scrollCue({ offset: 0, view: 200, content: 200 })).toEqual({ start: false, end: false });
  });
  it('marks the end at the top of a long list', () => {
    expect(scrollCue({ offset: 0, view: 157, content: 400 })).toEqual({ start: false, end: true });
  });
  it('marks both ends in the middle', () => {
    expect(scrollCue({ offset: 100, view: 157, content: 400 })).toEqual({ start: true, end: true });
  });
  it('clears the end at the bottom, allowing for sub-pixel rounding', () => {
    expect(scrollCue({ offset: 242, view: 157, content: 400 })).toEqual({ start: true, end: false });
    expect(scrollCue({ offset: 1, view: 157, content: 158.5 })).toEqual({ start: false, end: false });
  });
});

describe('centredOffset', () => {
  it('centres an item in the middle of a long list', () => {
    expect(centredOffset(480, 44, 300, 1000)).toBe(352);
  });
  it('stays at 0 near the start and at the far limit near the end', () => {
    expect(centredOffset(0, 44, 300, 1000)).toBe(0);
    expect(centredOffset(956, 44, 300, 1000)).toBe(700);
  });
  it('stays at 0 when the list fits', () => {
    expect(centredOffset(100, 44, 300, 300)).toBe(0);
  });
});

describe('pageStep', () => {
  it('keeps one line of context', () => {
    expect(pageStep(156, 26)).toBe(130);
  });
  it('always moves at least a line', () => {
    expect(pageStep(10, 26)).toBe(26);
  });
});
