/**
 * The top-right cards and PLATE rows of the new models (docs/19 §3.0 G3, G4):
 * the card follows the model on show (or a time written); a beat reads its
 * fact; a check shows the givens and the child's work and never the answer
 * before it is done.
 */
import { describe, expect, it } from 'vitest';
import { model as modelSchema, taskSchema, type Model, type Task } from '../../src/engines/math-scene/schema';
import { cardKindOf } from '../../src/engines/math-scene/hud/cards';
import { productBeatRows, productTaskRows } from '../../src/engines/math-scene/hud/cards/ProductCard';
import { timeRows, timeTaskRows } from '../../src/engines/math-scene/hud/cards/TimeCard';
import { valuePlateRows } from '../../src/engines/math-scene/hud/plate';
import { initialState } from '../../src/engines/math-scene/lib/state';
import { apply, solve } from '../../src/engines/math-scene/lib/solve';
import { DEFAULT_NOTATION, parseClock } from '../../src/engines/math-scene/lib/value';

const T = { en: 'x', zh: 'x' };
const task = (fields: Record<string, unknown>): Task => taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T }, ...fields });
const m = (fields: Record<string, unknown>) => modelSchema.parse(fields) as Model;
const values = (rows: { value: string }[]) => rows.map((r) => r.value).join(' | ');

describe('the card by the model on show', () => {
  it('picks FRACTION, AREA, PRODUCT, PLACE VALUE or TIME', () => {
    expect(cardKindOf(m({ kind: 'bar', parts: 4 }), null, 'fraction')).toBe('fraction');
    expect(cardKindOf(m({ kind: 'array', layout: 'rows', rows: 3, cols: 4 }), null, 'fraction')).toBe('product');
    expect(cardKindOf(m({ kind: 'numberline', scale: 'whole', from: 0, to: 20 }), null, 'fraction')).toBe('product');
    expect(cardKindOf(m({ kind: 'blocks', value: 26 }), null, 'fraction')).toBe('placeValue');
    expect(cardKindOf(m({ kind: 'grid', figures: [] }), null, 'fraction')).toBe('area');
    const time = task({ kind: 'input', model: { kind: 'numberline', scale: 'whole', from: 0, to: 60, step: 5 }, answer: '19:20', form: 'time12' });
    expect(cardKindOf(time.model, time, 'fraction')).toBe('time');
  });
});

describe('PRODUCT', () => {
  it('reads a beat: the fact, groups of, rows of, jumps of; a covered count as ?', () => {
    expect(values(productBeatRows(m({ kind: 'array', layout: 'rows', rows: 3, cols: 4 }), 'en'))).toBe('3 × 4 = 12 | 3 rows of 4 | twelve');
    expect(values(productBeatRows(m({ kind: 'array', layout: 'groups', groups: 4, size: 3, extra: 2 }), 'en'))).toBe('4 × 3 + 2 = 14 | 4 groups of 3 | fourteen');
    expect(values(productBeatRows(m({ kind: 'array', layout: 'groups', sizes: [2, 5, 5] }), 'en'))).toBe('2 + 5 + 5 = 12 | twelve');
    expect(values(productBeatRows(m({ kind: 'array', layout: 'rows', rows: 3, cols: 5, cover: { rows: true } }), 'en'))).toBe('? × 5 = 15 | 5 in each row');
    expect(values(productBeatRows(m({ kind: 'array', layout: 'rows', rows: 6, cols: 7, split: { rows: [5] } }), 'zh'))).toBe('6 × 7 = 5 × 7 + 1 × 7 = 42 | 6 行，每行 7 个 | 四十二');
    expect(values(productBeatRows(m({ kind: 'numberline', scale: 'whole', from: 0, to: 20, jumps: { size: 2, count: 6 } }), 'en'))).toBe('6 × 2 = 12 | 6 jumps of 2 | twelve');
  });

  it('on a check: the fact with ?, the child’s groups, never the total asked for', () => {
    const input = task({ kind: 'input', model: { kind: 'array', layout: 'rows', rows: 4, cols: 7 }, answer: 28, form: 'whole', op: { kind: '×', a: 4, b: 7 } });
    expect(values(productTaskRows(input, initialState(input), false, 'en'))).toBe('4 × 7 = ? | 4 rows of 7');
    const div = task({ kind: 'input', model: { kind: 'array', layout: 'groups', groups: 3, size: 4 }, answer: 4, form: 'whole', op: { kind: '÷', a: 12, b: 3 } });
    expect(values(productTaskRows(div, initialState(div), false, 'en'))).toBe('12 ÷ 3 = ?');
    const group = task({ kind: 'group', model: { kind: 'array', layout: 'scatter', count: 12 }, total: 12, by: 'share', k: 3 });
    expect(values(productTaskRows(group, initialState(group), false, 'en'))).toBe('— | 12 | 0 · 0 · 0 | 12');
    expect(values(productTaskRows(group, apply(group, solve(group)), true, 'en'))).toBe('12 ÷ 3 = 4 | 12 | 4 · 4 · 4 | 0');
  });
});

describe('TIME', () => {
  it('reads a time: as the notation writes it, in words, on the other clock', () => {
    expect(values(timeRows(parseClock('19:20')!, '12', 'en'))).toBe('7.20 pm | seven twenty p.m. | 19:20');
    expect(values(timeRows(parseClock('07:20')!, 'face', 'en'))).toBe('7.20 | twenty past seven');
    expect(values(timeRows(parseClock('19:20')!, '24', 'zh'))).toBe('19:20 | 十九时二十分 | 7.20 pm');
  });

  it('on a check: the span’s known times, ? for the one asked, then what is written', () => {
    const end = task({ kind: 'input', model: { kind: 'numberline', scale: 'whole', from: 0, to: 60, step: 5 }, answer: '11:35', form: 'time12', span: { start: '10:45', length: '50m', ask: 'end' } });
    expect(values(timeTaskRows(end, initialState(end), false, 'en', DEFAULT_NOTATION))).toBe('10.45 am | 50 min | ?');
    expect(values(timeTaskRows(end, apply(end, [{ do: 'input', field: 'h', value: '10' }, { do: 'input', field: 'm', value: '95' }, { do: 'input', field: 'ap', value: 'am' }]), false, 'en', DEFAULT_NOTATION))).toBe('10.45 am | 50 min | ? | —');
    expect(values(timeTaskRows(end, apply(end, solve(end)), true, 'en', DEFAULT_NOTATION))).toBe('10.45 am | 50 min | 11.35 am | eleven thirty-five a.m. | 11:35');
  });
});

describe('PLATE rows', () => {
  it('array, whole-number line and blocks; the total waits on a check', () => {
    expect(values(valuePlateRows(m({ kind: 'array', layout: 'rows', rows: 3, cols: 4 }), null, null, false)!)).toBe('ARRAY | 3 | 4 | 12');
    const input = task({ kind: 'input', model: { kind: 'array', layout: 'rows', rows: 4, cols: 7 }, answer: 28, form: 'whole', op: { kind: '×', a: 4, b: 7 } });
    expect(values(valuePlateRows(input.model, input, initialState(input), false)!)).toBe('ARRAY | — | — | —');
    expect(values(valuePlateRows(m({ kind: 'numberline', scale: 'whole', from: 0, to: 20, jumps: { size: 2, count: 6 } }), null, null, false)!)).toBe('LINE | 6 | 2 | 12');
    expect(values(valuePlateRows(m({ kind: 'blocks', value: 26, left: { T: 7, O: 8 }, trade: 'O>T' }), null, null, false)!)).toBe('BLOCKS | 0 | 7 | 8 | 10 O → 1 T');
    expect(valuePlateRows(m({ kind: 'bar', parts: 4 }), null, null, false)).toBeNull();
  });
});
