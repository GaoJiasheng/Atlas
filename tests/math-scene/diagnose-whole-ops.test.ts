/**
 * The whole-number diagnosis (docs/19 §2.1, §3.4; lib/diagnose/whole-ops.ts):
 * every code in the domain with at least two answers that show it and one
 * that does not, on the written number (with the fact it is about) or on
 * what the child made (groups, an array, the jumps, the shared blocks).
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, WHOLE_OPS_CODES, type MisconceptionCode, type Task, type TaskOf } from '../../src/engines/math-scene/schema';
import {
  arrangedShows,
  carryDropped,
  groupShows,
  landingsShow,
  notTradedQuotient,
  opResult,
  partialProducts,
  placeProductsJoined,
  wholeShows,
  zerosDropped,
  type WholeContext,
  type WholeOp,
  type WholeWritten,
} from '../../src/engines/math-scene/lib/diagnose/whole-ops';
import { check } from '../../src/engines/math-scene/lib/check';
import { sampleState } from '../../src/engines/math-scene/lib/solve';

const T = { en: 'x', zh: 'x' };
function task<K extends Task['kind']>(fields: Record<string, unknown>, codes: MisconceptionCode[] = []): TaskOf<K> {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: codes.map((when) => ({ when, say: T })) }, ...fields }) as TaskOf<K>;
}
const ctx = (op: WholeOp, split?: WholeContext['split']): WholeContext => ({ op, answer: opResult(op), split });
const n = (v: number): WholeWritten => ({ n: v });
const rem = (q: number, r: number): WholeWritten => ({ q, r });
const shows = (code: MisconceptionCode, c: WholeContext, x: WholeWritten) => wholeShows(code, c, x);

const times = (a: number, b: number, extra: Partial<WholeOp> = {}): WholeOp => ({ kind: '×', a, b, ...extra });
const div = (a: number, b: number, extra: Partial<WholeOp> = {}): WholeOp => ({ kind: '÷', a, b, ...extra });

describe('worked digits', () => {
  it('works partial products, dropped carries, joined place products, untraded quotients and missing zeros', () => {
    expect(partialProducts(135, 4).map((p) => p.value)).toEqual([20, 120, 400]);
    expect(carryDropped(26, 3)).toBe(68);
    expect(carryDropped(135, 4)).toBe(420);
    expect(placeProductsJoined(26, 3)).toBe(618);
    expect(placeProductsJoined(135, 4)).toBe(41_220);
    expect(notTradedQuotient(72, 3)).toEqual({ q: 20, r: 2 });
    expect(zerosDropped(103)).toBe(13);
    expect(zerosDropped(120)).toBe(120);
    expect(opResult(div(14, 4))).toEqual({ q: 3, r: 2 });
    expect(opResult(div(50, 8, { round: 'up' }))).toEqual({ n: 7 });
    expect(opResult(times(7, 6, { missing: 'a' }))).toEqual({ n: 7 });
  });
});

describe('written numbers: every code shows on two answers and not on a third', () => {
  const cases: [MisconceptionCode, [WholeContext, WholeWritten][], [WholeContext, WholeWritten]][] = [
    ['added-not-multiplied', [[ctx(times(5, 4)), n(9)], [ctx(times(4, 7)), n(11)]], [ctx(times(4, 7)), n(27)]],
    ['skip-count-slip', [[ctx(times(7, 5)), n(30)], [ctx(times(7, 5)), n(40)], [ctx(times(4, 7, { missing: 'a' })), n(5)]], [ctx(times(7, 5)), n(36)]],
    ['split-slip', [[ctx(times(6, 7, { split: 5 })), n(36)], [ctx(times(9, 6, { split: 10 })), n(59)], [ctx(times(7, 8), { first: 5, of: 'a' }), n(41)]], [ctx(times(6, 7, { split: 5 })), n(48)]],
    ['operation-swapped', [[ctx(div(35, 5)), n(175)], [ctx(times(7, 6, { missing: 'a' })), n(252)], [ctx(times(20, 4)), n(5)]], [ctx(div(35, 5)), n(8)]],
    ['remainder-too-big', [[ctx(div(14, 4)), rem(2, 6)], [ctx(div(29, 5)), rem(4, 9)]], [ctx(div(14, 4)), rem(2, 3)]],
    ['remainder-dropped', [[ctx(div(14, 4)), rem(3, 0)], [ctx(div(14, 4)), n(3)]], [ctx(div(12, 4)), n(3)]],
    ['remainder-context', [[ctx(div(50, 8, { round: 'up' })), n(6)], [ctx(div(26, 4, { round: 'down' })), n(7)]], [ctx(div(50, 8, { round: 'up' })), n(8)]],
    ['tens-as-ones', [[ctx(times(30, 4)), n(12)], [ctx(times(23, 14)), n(115)], [{ op: null, answer: n(140) }, n(14)]], [ctx(times(30, 4)), n(1200)]],
    ['extra-zero', [[ctx(times(30, 4)), n(1200)], [{ op: null, answer: n(140) }, n(1400)]], [ctx(times(30, 4)), n(12)]],
    ['carry-not-added', [[ctx(times(26, 3)), n(68)], [ctx(times(135, 4)), n(420)]], [ctx(times(26, 3)), n(618)]],
    ['digits-concatenated', [[ctx(times(26, 3)), n(618)], [ctx(times(135, 4)), n(41_220)]], [ctx(times(26, 3)), n(68)]],
    ['partial-product-missed', [[ctx(times(135, 4)), n(520)], [ctx(times(23, 4)), n(83)], [ctx(times(23, 14)), n(212)]], [ctx(times(135, 4)), n(41_220)]],
    ['zero-in-quotient', [[ctx(div(412, 4)), n(13)], [ctx(div(824, 4)), n(26)], [ctx(div(415, 4)), rem(13, 3)]], [ctx(div(412, 4)), n(103)]],
    ['not-traded', [[ctx(div(72, 3)), rem(20, 2)], [ctx(div(54, 4)), rem(11, 0)]], [ctx(div(72, 3)), rem(24, 0)]],
  ];
  for (const [code, yes, no] of cases) {
    it(code, () => {
      for (const [c, x] of yes) expect(shows(code, c, x), `${code} on ${JSON.stringify(x)}`).toBe(true);
      expect(shows(code, no[0], no[1])).toBe(false);
    });
  }

  it('never diagnoses the right answer, and the choose-only codes never show on a number', () => {
    for (const code of WHOLE_OPS_CODES) expect(shows(code, ctx(times(6, 7)), n(42))).toBe(false);
    for (const code of ['unequal-groups', 'sharing-only', 'divide-order'] as const) expect(shows(code, ctx(times(6, 7)), n(13))).toBe(false);
  });
});

describe('what the child made', () => {
  const share = task<'group'>({ kind: 'group', model: { kind: 'array', layout: 'scatter', count: 12 }, total: 12, by: 'share', k: 3 });
  const pack = task<'group'>({ kind: 'group', model: { kind: 'array', layout: 'scatter', count: 14 }, total: 14, by: 'pack', k: 4 });
  it('groups-size-swapped: as many groups as there should be in each', () => {
    expect(groupShows('groups-size-swapped', share, [3, 3, 3, 3])).toBe(true);
    expect(groupShows('groups-size-swapped', pack, [3, 3, 3, 3])).toBe(true);
    expect(groupShows('groups-size-swapped', share, [4, 4, 4])).toBe(false);
    const arrange = task<'arrange'>({ kind: 'arrange', model: { kind: 'array', layout: 'scatter', count: 15 }, rows: 3, cols: 5 });
    expect(arrangedShows('groups-size-swapped', arrange, 5, 3)).toBe(true);
    expect(arrangedShows('groups-size-swapped', arrange, 3, 5)).toBe(false);
  });

  it('unequal-groups: groups of different sizes with nothing more to share', () => {
    expect(groupShows('unequal-groups', share, [4, 4, 3])).toBe(true);
    expect(groupShows('unequal-groups', share, [5, 5, 2])).toBe(true);
    expect(groupShows('unequal-groups', share, [4, 4, 4])).toBe(false);
  });

  it('remainder-too-big: stopped with enough left for another group or round', () => {
    expect(groupShows('remainder-too-big', pack, [4, 4])).toBe(true);
    expect(groupShows('remainder-too-big', share, [3, 3, 3])).toBe(true);
    expect(groupShows('remainder-too-big', pack, [4, 4, 4])).toBe(false);
  });

  it('skip-count-slip: a jump too many or too few, 0 counted as a jump, one landing off by one', () => {
    const skip = task<'skip-count'>({ kind: 'skip-count', model: { kind: 'numberline', scale: 'whole', from: 0, to: 30, step: 5 }, size: 5, count: 4 });
    expect(landingsShow('skip-count-slip', skip, [5, 10, 15, 20, 25])).toBe(true);
    expect(landingsShow('skip-count-slip', skip, [5, 10, 15])).toBe(true);
    expect(landingsShow('skip-count-slip', skip, [0, 5, 10, 15])).toBe(true);
    expect(landingsShow('skip-count-slip', skip, [5, 10, 15, 21])).toBe(true);
    expect(landingsShow('skip-count-slip', skip, [5, 10, 15, 20])).toBe(false);
    expect(landingsShow('skip-count-slip', skip, [2, 4, 6, 8])).toBe(false);
  });

  it('not-traded: a ten (or hundred) left on the mat that could not be shared as it is', () => {
    const t72 = task<'share'>({ kind: 'share', model: { kind: 'blocks', value: 72, plates: 3 }, value: 72, k: 3, then: { answer: 24, form: 'whole' } }, ['not-traded', 'remainder-too-big']);
    expect(check(t72, sampleState(t72, 'T')!)).toEqual({ ok: false, code: 'not-traded' });
    const t412 = task<'share'>({ kind: 'share', model: { kind: 'blocks', value: 412, plates: 4 }, value: 412, k: 4, then: { answer: 103, form: 'whole' } }, ['not-traded']);
    expect(check(t412, sampleState(t412, 'H')!)).toEqual({ ok: false, code: 'not-traded' });
    expect(check(t72, sampleState(t72, 'T,T>O,O')!).ok).toBe(true);
  });
});
