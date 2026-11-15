/**
 * The `data` domain (docs/77 §3.4, docs/78 §3.2): every rule finds its
 * misconception in at least two wrong answers and leaves another wrong
 * answer (and the right one) alone; the answer a question's data stand for.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type ChartSpec, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { dataAnswer, dataShows, type DataCtx } from '../../src/engines/math-scene/lib/diagnose/data';
import { chartItems } from '../../src/engines/math-scene/lib/chart';

const L = (en: string) => ({ en, zh: en });
const cat = (id: string, value: number) => ({ id, label: L(id), value });
const chart = (extra: Record<string, unknown>): ChartSpec => {
  const t = taskSchema.parse({ id: 'x', kind: 'input', answer: 1, form: 'whole', prompt: L('p'), guide: L('g'), hints: [L('h')], feedback: { correct: L('c'), fallback: L('f'), reveal: L('r') }, model: { kind: 'chart', ...extra } }) as Task;
  return chartItems(t.model as never)[0]!;
};
const ctx = (c: Partial<DataCtx>): DataCtx => ({ ask: 'read', chart: null, of: [], values: [], ...c });

const pic = chart({ type: 'picture', key: { per: 2, icon: 'pupil', unit: L('pupils') }, cats: [cat('mango', 8), cat('rambutan', 9)] });
const bar5 = chart({ type: 'bar', cats: [cat('soya', 35), cat('barley', 20), cat('lime', 45)], axis: { to: 50, step: 5 } });
const bar10 = chart({ type: 'bar', cats: [cat('soya', 35)], axis: { to: 50, step: 10 } });
const tally = chart({ type: 'table', table: { cols: [{ id: 'n', label: L('n') }], rows: [{ id: 'a', label: L('a'), cells: [17], tally: 17 }] } });
const sports = chart({ type: 'table', table: { cols: [{ id: 'n', label: L('n') }], rows: [{ id: 'f', label: L('f'), cells: [18] }, { id: 'b', label: L('b'), cells: [15] }, { id: 's', label: L('s'), cells: ['?'] }, { id: 'k', label: L('k'), cells: [12] }, { id: 't', label: L('t'), cells: [60], total: true }] } });
const line = chart({ type: 'line', cats: [cat('jan', 10), cat('feb', 25), cat('mar', 30), cat('jun', 35)], axis: { to: 40, step: 5 } });
const pie = chart({ type: 'pie', total: 32, pie: [{ id: 'walk', label: L('w'), frac: '1/2' }, { id: 'bus', label: L('b'), frac: '1/4' }, { id: 'rest', label: L('r'), frac: '1/4' }] });

const cases: [MisconceptionCode, DataCtx, number[], number][] = [
  ['key-ignored', ctx({ chart: pic, of: ['rambutan'] }), [4, 5], 8],
  ['interval-misread', ctx({ chart: bar5, of: ['soya'] }), [7], 30],
  ['interval-misread', ctx({ ask: 'difference', chart: bar5, of: ['lime', 'barley'] }), [5], 20],
  ['between-gridlines', ctx({ chart: bar10, of: ['soya'] }), [30, 40], 36],
  ['value-for-difference', ctx({ ask: 'difference', chart: bar5, of: ['lime', 'barley'] }), [45, 65], 20],
  ['tally-misread', ctx({ chart: tally, of: ['a'] }), [14, 20], 15],
  ['total-misused', ctx({ ask: 'missing-row', chart: sports, of: ['s'] }), [105, 33], 14],
  ['height-for-change', ctx({ ask: 'biggest-increase', chart: line }), [35], 25],
  ['fraction-as-count', ctx({ ask: 'part', chart: pie, of: ['bus'] }), [4, 1], 16],
  ['average-as-total', ctx({ ask: 'average', values: [2, 4, 6] }), [12], 6],
  ['average-as-total', ctx({ ask: 'total', average: 6, count: 4 }), [6], 18],
  ['zero-ignored', ctx({ ask: 'average', values: [3, 5, 4, 8, 0] }), [5], 20],
  ['average-as-middle', ctx({ ask: 'average', values: [1, 2, 9] }), [2], 12],
  ['average-as-middle', ctx({ ask: 'average', values: [3, 3, 9] }), [3], 15],
  ['remainder-dropped', ctx({ ask: 'average', values: [7, 8] }), [7], 8],
  ['remainder-dropped', ctx({ ask: 'join', average: 5, count: 3, value: 6 }), [5], 6],
  ['missing-equals-average', ctx({ ask: 'missing', average: 6, count: 4, values: [5, 7, 4] }), [6], 16],
  ['wrong-count', ctx({ ask: 'missing', average: 6, count: 4, values: [5, 7, 4] }), [2, 14], 6],
  ['wrong-count', ctx({ ask: 'total', average: 6, count: 4 }), [18, 30], 6],
  ['averages-averaged', ctx({ ask: 'join', average: 5, count: 4, value: 10 }), [7.5], 30],
  ['averages-averaged', ctx({ ask: 'join', average: 6, count: 4, value: 11 }), [8.5], 7],
];

describe('data diagnosis', () => {
  it.each(cases)('%s', (code, c, yes, no) => {
    for (const x of yes) expect(dataShows(code, c, x), `${code} ${x}`).toBe(true);
    expect(dataShows(code, c, no), `${code} ${no}`).toBe(false);
    expect(dataShows(code, c, dataAnswer(c)!)).toBe(false);
  });
  it('every rule has a case, two of them for the rules with one wrong answer each', () => {
    const covered = new Set(cases.map((c) => c[0]));
    for (const code of ['key-ignored', 'interval-misread', 'between-gridlines', 'value-for-difference', 'tally-misread', 'total-misused', 'height-for-change', 'fraction-as-count', 'average-as-total', 'zero-ignored', 'average-as-middle', 'remainder-dropped', 'missing-equals-average', 'wrong-count', 'averages-averaged'] as const) expect(covered.has(code), code).toBe(true);
  });
  it('works out the answer each kind of question stands for', () => {
    expect(dataAnswer(ctx({ chart: pic, of: ['rambutan'] }))).toBe(9);
    expect(dataAnswer(ctx({ ask: 'sum', chart: bar5 }))).toBe(100);
    expect(dataAnswer(ctx({ ask: 'missing-row', chart: sports, of: ['s'] }))).toBe(15);
    expect(dataAnswer(ctx({ ask: 'whole', chart: pie, of: ['bus'], value: 8 }))).toBe(32);
    expect(dataAnswer(ctx({ ask: 'count', average: 9, total: 45 }))).toBe(5);
    expect(dataAnswer(ctx({ ask: 'leave', average: 5, count: 4, value: 2 }))).toBe(6);
    expect(dataAnswer(ctx({ ask: 'joined', average: 8, count: 3, after: 9 }))).toBe(12);
  });
});
