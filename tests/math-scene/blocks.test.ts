/**
 * Place-value blocks and the column method (docs/19 §3.2, model A2;
 * lib/blocks.ts): blocks make their number; a trade keeps the value; a share
 * deals each plate the same; the column method's every digit (carries,
 * products, the long division's quotient and working) and how far `show`
 * writes it; the regroup and share checks, solutions and samples.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, model as modelSchema, type BlocksModelSpec, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { applyTrade, canTrade, columnFocus, columnProgress, divideColumns, matOf, multiplyColumns, regrouped, sharePlace, standard, total, ZERO } from '../../src/engines/math-scene/lib/blocks';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve, solvedState } from '../../src/engines/math-scene/lib/solve';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { valueModelIssues, valueTaskIssues } from '../../src/engines/math-scene/validate-values';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = []): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: wrong.map(([when, sample]) => ({ when, say: T, sample })) }, ...fields });
}
const blocks = (fields: Record<string, unknown>) => modelSchema.parse({ kind: 'blocks', ...fields }) as BlocksModelSpec;

describe('blocks', () => {
  it('make their number; standard form; the mat a beat shows', () => {
    expect(standard(352)).toEqual({ H: 3, T: 5, O: 2 });
    expect(total({ H: 1, T: 14, O: 18 })).toBe(258);
    expect(matOf(blocks({ value: 26, copies: 3, combined: true }))).toEqual({ H: 0, T: 6, O: 18 });
    expect(matOf(blocks({ value: 26, left: { T: 7, O: 8 } }))).toEqual({ H: 0, T: 7, O: 8 });
    expect(matOf(blocks({ mat: false, column: { op: '×', a: 135, b: 4 } }))).toEqual({ H: 1, T: 3, O: 5 });
  });

  it('trade 10 for 1 and 1 for 10, keeping the value', () => {
    const c = { H: 0, T: 14, O: 18 };
    for (const t of ['O>T', 'T>H'] as const) {
      expect(canTrade(c, t)).toBe(true);
      expect(total(applyTrade(c, t))).toBe(total(c));
    }
    expect(applyTrade(c, 'O>T')).toEqual({ H: 0, T: 15, O: 8 });
    expect(applyTrade({ H: 1, T: 0, O: 2 }, 'H>T')).toEqual({ H: 0, T: 10, O: 2 });
    expect(canTrade({ H: 0, T: 0, O: 9 }, 'O>T')).toBe(false);
    expect(regrouped({ H: 1, T: 4, O: 0 })).toBe(true);
    expect(regrouped({ H: 0, T: 14, O: 0 })).toBe(false);
  });

  it('share one place as far as it goes', () => {
    expect(sharePlace(standard(72), ZERO, 'T', 3)).toEqual({ mat: { H: 0, T: 1, O: 2 }, dealt: { H: 0, T: 2, O: 0 } });
    const same = { mat: { H: 0, T: 1, O: 2 }, dealt: ZERO };
    expect(sharePlace(same.mat, same.dealt, 'T', 3)).toEqual(same);
  });

  it('validates what can be drawn', () => {
    expect(valueModelIssues(blocks({ value: 999, copies: 9 }))[0]).toMatch(/blocks on the stage/);
    expect(valueModelIssues(blocks({ value: 72, plates: 3, dealt: { T: 2 }, left: { T: 1, O: 2 } }))).toEqual([]);
    expect(valueModelIssues(blocks({ value: 72, plates: 3, dealt: { T: 2 }, left: { O: 2 } }))).toContain('the blocks on the mat and the plates make 62, not 72');
    expect(valueModelIssues(blocks({ value: 40, column: { op: '÷', a: 40, b: 12 } }))).toContain('the column method divides by one digit');
    expect(valueModelIssues(blocks({ mat: false }))).toContain('blocks without the mat need a column working');
  });
});

describe('the column method', () => {
  it('multiplies with the carries above (26 × 3, 213 × 4) and two rows for a two-digit multiplier', () => {
    const m = multiplyColumns(26, 3);
    expect(m.product).toEqual([8, 7]);
    expect(m.carries[1]).toBe(1);
    expect(multiplyColumns(213, 4).product).toEqual([2, 5, 8]);
    expect(multiplyColumns(23, 14).partials).toEqual([92, 230]);
  });

  it('divides from the top, a 0 kept in the quotient once it has started', () => {
    const d = divideColumns(412, 4);
    expect(d.q).toEqual([1, 0, 3]);
    expect(d.steps.map((s) => [s.have, s.q, s.take, s.left])).toEqual([
      [4, 1, 4, 0],
      [1, 0, 0, 1],
      [12, 3, 12, 0],
    ]);
    const e = divideColumns(125, 5);
    expect(e.q).toEqual([null, 2, 5]);
    expect(e.steps[0]!.have).toBe(12);
    expect(divideColumns(74, 3).remainder).toBe(2);
  });

  it('writes as far as `show` says and lights the place it is at', () => {
    expect(columnProgress({ op: '×', a: 26, b: 3, show: 'ones' })).toEqual({ places: 1, carry: false });
    expect(columnProgress({ op: '×', a: 26, b: 3, show: 'carry' })).toEqual({ places: 1, carry: true });
    expect(columnFocus({ op: '×', a: 26, b: 3, show: 'carry' })).toBe('T');
    expect(columnProgress({ op: '÷', a: 72, b: 3, show: 'tens' })).toEqual({ places: 1, carry: false });
    expect(columnFocus({ op: '÷', a: 72, b: 3, show: 'tens' })).toBe('T');
    expect(columnFocus({ op: '÷', a: 72, b: 3, show: 'carry' })).toBe('O');
    expect(columnFocus({ op: '÷', a: 412, b: 4, show: 'hundreds' })).toBe('H');
    expect(columnFocus({ op: '÷', a: 72, b: 3, show: 'all' })).toBeNull();
  });
});

describe('regroup', () => {
  const t = task({ kind: 'regroup', model: { kind: 'blocks', value: 140, left: { T: 14 } }, value: 140, start: { T: 14 }, then: { answer: 140, form: 'whole' } }, [
    ['tens-as-ones', '=14'],
    ['extra-zero', '=1400'],
  ]);
  it('trades until every place is under 10, then writes the number', () => {
    expect(initialState(t).mat).toEqual({ H: 0, T: 14, O: 0 });
    expect(solve(t).filter((a) => a.do === 'trade')).toHaveLength(1);
    expect(solvedState(t).mat).toEqual({ H: 1, T: 4, O: 0 });
    expect(check(t, sampleState(t, 'T>H')!).ok).toBe(true);
    expect(check(t, initialState(t)).ok).toBe(false);
    expect(proveTask(t)).toEqual([]);
    expect(valueTaskIssues(task({ kind: 'regroup', model: { kind: 'blocks', value: 140 }, value: 140, start: { H: 1, T: 4 } }), undefined)).toContain('the blocks start with every place under 10: nothing to trade');
  });
});

describe('share', () => {
  const t = task({ kind: 'share', model: { kind: 'blocks', value: 412, plates: 4 }, value: 412, k: 4, then: { answer: 103, form: 'whole' } }, [
    ['zero-in-quotient', '=13'],
    ['not-traded', 'H'],
  ]);
  it('shares from the top place, trading what is left down, each plate the same', () => {
    const s = apply(t, solve(t).filter((a) => a.do !== 'check' && a.do !== 'input'));
    expect(s.dealt).toEqual({ H: 1, T: 0, O: 3 });
    expect(s.mat).toEqual({ H: 0, T: 0, O: 0 });
    expect(reduce(t, initialState(t), { do: 'share', place: 'T' }).dealt).toEqual(ZERO);
    expect(proveTask(t)).toEqual([]);
    expect(sampleState(t, 'O>T')).toBeNull();
  });

  it('checks the quotient (and remainder) against the share', () => {
    const r = task({ kind: 'share', model: { kind: 'blocks', value: 74, plates: 3 }, value: 74, k: 3, then: { answer: '24 r 2', form: 'remainder' } }, [['remainder-too-big', '=23 r 5']]);
    expect(proveTask(r)).toEqual([]);
    const wrong = task({ kind: 'share', model: { kind: 'blocks', value: 74, plates: 3 }, value: 74, k: 3, then: { answer: 24, form: 'whole' } });
    expect(valueTaskIssues(wrong, undefined)).toContain('74 ÷ 3 is 24 r 2');
  });
});
