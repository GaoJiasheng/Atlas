/**
 * The chart model A7 (docs/77 §3.1, docs/78 §3): the axis and its gridlines,
 * reading between gridlines, pictures for a value, a pie's parts from 12
 * o'clock, a table's blanks worked out from its totals, a line's rises,
 * towers levelled in the fewest moves, blocks that keep their key as they
 * move, and the chart rules validate runs.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type ChartModelSpec, type Task } from '../../src/engines/math-scene/schema';
import { axisOf, biggestRise, blockKeys, fewestMoves, gridValues, gridlinesAround, iconsOf, levelMoves, lineChanges, pieParts, pieSum, sliceValue, tableBlanks, tableSolution, tallyOf, valueOf } from '../../src/engines/math-scene/lib/chart';
import { chartModelIssues, dataTaskIssues } from '../../src/engines/math-scene/validate-charts';
import { initialState } from '../../src/engines/math-scene/lib/state';
import { apply, solve } from '../../src/engines/math-scene/lib/solve';
import { check } from '../../src/engines/math-scene/lib/check';
import { dataReduce, blocksMoved, level } from '../../src/engines/math-scene/lib/data-tasks';
import { proveTask } from '../../src/engines/math-scene/lib/proof';

const L = (en: string) => ({ en, zh: en });
const cat = (id: string, value?: number) => ({ id, label: L(id), ...(value === undefined ? {} : { value }) });
const base = (id: string) => ({ id, prompt: L('p'), guide: L('g'), hints: [L('h')], feedback: { correct: L('c'), fallback: L('f'), reveal: L('r'), wrong: [] as unknown[] } });
const parse = (t: unknown) => taskSchema.parse(t) as Task;
const chart = (extra: Record<string, unknown>): ChartModelSpec => parse({ ...base('m'), kind: 'input', answer: 1, form: 'whole', model: { kind: 'chart', ...extra } }).model as ChartModelSpec;

describe('axis and gridlines', () => {
  it('lists the gridlines and finds the two around a value between them', () => {
    const a = axisOf(chart({ type: 'bar', cats: [cat('a', 35)], axis: { to: 50, step: 10 } }));
    expect(gridValues(a)).toEqual([0, 10, 20, 30, 40, 50]);
    expect(gridlinesAround(a, 35)).toEqual([30, 40]);
    expect(gridlinesAround(a, 40)).toBeNull();
  });
  it('gives towers one block a gridline up to the tallest', () => {
    expect(axisOf(chart({ type: 'bar', stack: true, cats: [cat('a', 2), cat('b', 6)] }))).toMatchObject({ from: 0, to: 6, step: 1 });
  });
  it('counts pictures with half a picture', () => {
    expect(iconsOf(9, 2)).toEqual({ whole: 4, half: true });
    expect(iconsOf(8, 2)).toEqual({ whole: 4, half: false });
  });
});

describe('pie', () => {
  const pie = chart({ type: 'pie', total: 32, pie: [{ id: 'walk', label: L('w'), frac: '1/2' }, { id: 'bus', label: L('b'), frac: '1/4' }, { id: 'mrt', label: L('m'), frac: '1/8' }, { id: 'car', label: L('c'), frac: '1/8' }] });
  it('runs clockwise from 12 o\'clock and makes one whole', () => {
    expect(pieParts(pie).map((p) => [p.start, p.end])).toEqual([[0, 180], [180, 270], [270, 315], [315, 360]]);
    const sum = pieSum(pie)!;
    expect(sum.n).toBe(sum.d);
  });
  it('a part stands for its fraction of the total', () => {
    expect(sliceValue(pie, 'bus')).toBe(8);
    expect(valueOf(pie, 'walk')).toBe(16);
  });
  it('validate: parts that are not one whole, a total that does not divide, a square on a part that is not a right angle', () => {
    expect(chartModelIssues(chart({ type: 'pie', total: 30, pie: [{ id: 'a', label: L('a'), frac: '1/2' }, { id: 'b', label: L('b'), frac: '1/4' }], square: 'a' })).join(' ')).toMatch(/not one whole[\s\S]*not a multiple of 4[\s\S]*not a right angle/);
  });
});

describe('table', () => {
  const t = chart({ type: 'table', table: { cols: [{ id: 'n', label: L('n') }], rows: [{ id: 'a', label: L('a'), cells: [18] }, { id: 'b', label: L('b'), cells: ['?'] }, { id: 'c', label: L('c'), cells: [12], tally: 12 }, { id: 't', label: L('t'), cells: [60], total: true }] } });
  it('finds a missing row from the total', () => {
    expect(tableBlanks(t).map((b) => b.key)).toEqual(['b.n']);
    expect(tableSolution(t)).toEqual({ 'b.n': 30 });
  });
  it('works out a total column and row together', () => {
    const two = chart({ type: 'table', table: { cols: [{ id: 'x', label: L('x') }, { id: 'y', label: L('y') }, { id: 's', label: L('s'), total: true }], rows: [{ id: 'p', label: L('p'), cells: [1, 2, '?'] }, { id: 'q', label: L('q'), cells: [3, '?', 7] }, { id: 't', label: L('t'), cells: ['?', '?', '?'], total: true }] } });
    expect(tableSolution(two)).toEqual({ 'p.s': 3, 'q.y': 4, 't.x': 4, 't.y': 6, 't.s': 10 });
  });
  it('bundles tally marks in fives', () => {
    expect(tallyOf(17)).toEqual({ bundles: 3, rest: 2 });
  });
  it('validate: a column that does not add up', () => {
    expect(chartModelIssues(chart({ type: 'table', table: { cols: [{ id: 'n', label: L('n') }], rows: [{ id: 'a', label: L('a'), cells: [1] }, { id: 't', label: L('t'), cells: [5], total: true }] } })).join()).toMatch(/does not add up/);
  });
});

describe('line', () => {
  const line = chart({ type: 'line', cats: [cat('jan', 10), cat('feb', 25), cat('mar', 30), cat('apr', 30), cat('may', 25), cat('jun', 35)], axis: { to: 40, step: 5 } });
  it('rises and falls part by part; the biggest rise is the steepest, not the highest point', () => {
    expect(lineChanges(line).map((c) => c.change)).toEqual([15, 5, 0, -5, 10]);
    expect(biggestRise(line)).toMatchObject({ from: 'jan', to: 'feb', change: 15 });
  });
});

describe('the chart rules', () => {
  it('values on the axis, gridline steps from the limits, an axis from above 0 only in a pair', () => {
    const m = chart({ type: 'bar', cats: [cat('a', 55)], axis: { from: 20, to: 50, step: 5 } });
    const msgs = chartModelIssues(m, { chartSteps: [1, 2] }).join(' ');
    expect(msgs).toMatch(/off the axis/);
    expect(msgs).toMatch(/worth 5/);
    expect(msgs).toMatch(/does not start at 0/);
    expect(chartModelIssues(chart({ type: 'bar', pair: [{ type: 'bar', orient: 'vertical', cats: [cat('a', 24)], axis: { from: 20, to: 30, step: 2, labels: 1 } }, { type: 'bar', orient: 'vertical', cats: [cat('a', 24)], axis: { from: 0, to: 30, step: 2, labels: 1 } }] }))).toEqual([]);
  });
  it('pictures are whole or half (half only for an even key)', () => {
    expect(chartModelIssues(chart({ type: 'picture', key: { per: 5, icon: 'cup', unit: L('cups') }, cats: [cat('a', 12)] })).join()).toMatch(/not whole pictures/);
    expect(chartModelIssues(chart({ type: 'picture', key: { per: 4, icon: 'cup', unit: L('cups') }, cats: [cat('a', 14)] }))).toEqual([]);
  });
  it('towers keep their total and the average line sits at the average', () => {
    expect(chartModelIssues(chart({ type: 'bar', stack: true, cats: [cat('a', 4), cat('b', 4), cat('c', 4)], was: [2, 4, 5], mean: 4 })).join()).toMatch(/added or taken away/);
    expect(chartModelIssues(chart({ type: 'bar', stack: true, cats: [cat('a', 2), cat('b', 4), cat('c', 6)], mean: 5 })).join()).toMatch(/average is 4/);
  });
  it('a question\'s answer is what the chart says', () => {
    const t = parse({ ...base('q'), kind: 'input', answer: 9, form: 'whole', data: { ask: 'read', of: ['a'] }, model: { kind: 'chart', type: 'bar', cats: [cat('a', 8)], axis: { to: 10, step: 1 } } });
    expect(dataTaskIssues(t, undefined).join()).toMatch(/the read from the data is 8/);
  });
});

describe('towers (docs/78)', () => {
  it('levels whole-block towers tallest to shortest, in the fewest moves', () => {
    expect(levelMoves([2, 4, 6])).toEqual([[2, 0], [2, 0]]);
    expect(fewestMoves([1, 2, 9])).toBe(5);
    expect(levelMoves([7, 8])).toBeNull();
  });
  it('keeps each block\'s key as it moves from one tower to another', () => {
    const first = blockKeys(null, [2, 4, 6]);
    const next = blockKeys(first, [3, 4, 5]);
    expect(next[0]![2]).toBe(first[2]![5]);
    expect(next[1]).toEqual(first[1]);
    expect(new Set(next.flat()).size).toBe(12);
    const pooled = blockKeys(next, [0, 0, 0, 12]);
    expect(pooled[3]).toHaveLength(12);
    expect(new Set(pooled[3]).size).toBe(12);
  });
  it('even-out: tap lifts the top block, another tap puts it down; solving levels the towers', () => {
    const t = parse({ ...base('e'), kind: 'even-out', answer: { answer: 4, form: 'whole' }, model: { kind: 'chart', type: 'bar', stack: true, cats: [cat('a', 2), cat('b', 4), cat('c', 6)] } });
    let s = initialState(t);
    s = dataReduce(t, s, { do: 'etap', tower: 2 });
    expect(s.held).toBe(2);
    s = dataReduce(t, s, { do: 'etap', tower: 0 });
    expect(s.towers).toEqual([3, 4, 5]);
    expect(blocksMoved(t, s.towers)).toBe(1);
    const solved = apply(t, solve(t));
    expect(level(solved.towers)).toBe(true);
    expect(check(t, solved).ok).toBe(true);
    expect(proveTask(t)).toEqual([]);
  });
});
