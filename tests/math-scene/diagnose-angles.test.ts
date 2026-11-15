/** The `angles` rules (docs/76 §3.4): each at least two cases it holds for and one it does not. */
import { describe, expect, it } from 'vitest';
import { angleShows, diagnoseAngle, ruleAnswer, segmentShows, type AngleContext } from '../../src/engines/math-scene/lib/diagnose/angles';

const ctx = (c: Partial<AngleContext>): AngleContext => ({ rule: 'read', known: [], rights: 0, equal: 1, offset: 0, drawn: null, ...c });

describe('angles diagnosis', () => {
  it('wrong-scale: the other row (180 − t)', () => {
    expect(angleShows('wrong-scale', 130, 50, ctx({}))).toBe(true);
    expect(angleShows('wrong-scale', 116, 65, ctx({ rule: 'draw' }))).toBe(true);
    expect(angleShows('wrong-scale', 90, 90, ctx({}))).toBe(false);
    expect(angleShows('wrong-scale', 115, 65, ctx({ rule: 'straight' }))).toBe(false);
  });
  it('read-end-mark: the other arm read when the first is not on 0', () => {
    expect(angleShows('read-end-mark', 75, 55, ctx({ offset: 20 }))).toBe(true);
    expect(angleShows('read-end-mark', 100, 70, ctx({ offset: 30 }))).toBe(true);
    expect(angleShows('read-end-mark', 75, 55, ctx({ offset: 0 }))).toBe(false);
  });
  it('angle-sum-swap: 360 on a line, 180 at a point', () => {
    expect(angleShows('angle-sum-swap', 320, 140, ctx({ rule: 'straight', known: [40] }))).toBe(true);
    expect(angleShows('angle-sum-swap', 20, 200, ctx({ rule: 'point', known: [70, 90] }))).toBe(true);
    expect(angleShows('angle-sum-swap', 140, 140, ctx({ rule: 'straight', known: [40] }))).toBe(false);
  });
  it('right-mark-missed: the 90 not taken away', () => {
    expect(angleShows('right-mark-missed', 230, 140, ctx({ rule: 'point', known: [130], rights: 1 }))).toBe(true);
    expect(angleShows('right-mark-missed', 145, 55, ctx({ rule: 'straight', known: [35], rights: 1 }))).toBe(true);
    expect(angleShows('right-mark-missed', 230, 140, ctx({ rule: 'point', known: [130] }))).toBe(false);
  });
  it('opposite-adjacent: 180 − t at a crossing', () => {
    expect(angleShows('opposite-adjacent', 110, 70, ctx({ rule: 'opposite', known: [70] }))).toBe(true);
    expect(angleShows('opposite-adjacent', 70, 110, ctx({ rule: 'adjacent', known: [70] }))).toBe(true);
    expect(angleShows('opposite-adjacent', 110, 70, ctx({ rule: 'straight', known: [70] }))).toBe(false);
  });
  it('measured-not-calculated: the size as drawn', () => {
    expect(angleShows('measured-not-calculated', 60, 48, ctx({ rule: 'straight', drawn: 60 }))).toBe(true);
    expect(angleShows('measured-not-calculated', 98, 125, ctx({ rule: 'point', drawn: 100 }))).toBe(true);
    expect(angleShows('measured-not-calculated', 60, 48, ctx({ rule: 'straight', drawn: null }))).toBe(false);
  });
  it('looks-parallel: a gap that changes by one square', () => {
    expect(segmentShows('looks-parallel', 'parallel', 1)).toBe(true);
    expect(segmentShows('looks-parallel', 'parallel', 0.5)).toBe(true);
    expect(segmentShows('looks-parallel', 'parallel', 0)).toBe(false);
    expect(segmentShows('looks-parallel', 'perpendicular', 1)).toBe(false);
  });
  it('finds only declared codes, in order, and works out the rule answers', () => {
    expect(diagnoseAngle(['wrong-scale'], 130, 50, ctx({}))).toBe('wrong-scale');
    expect(diagnoseAngle([], 130, 50, ctx({}))).toBeNull();
    expect(ruleAnswer({ rule: 'straight', known: [40, 75], rights: 0, equal: 1 })).toBe(65);
    expect(ruleAnswer({ rule: 'point', known: [120], rights: 1, equal: 2 })).toBe(75);
    expect(ruleAnswer({ rule: 'adjacent', known: [70], rights: 0, equal: 1 })).toBe(110);
  });
});
