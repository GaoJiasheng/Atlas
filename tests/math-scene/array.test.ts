/**
 * The array and the whole-number line (docs/19 §3.1, model A1;
 * lib/array.ts, lib/state.ts, lib/check.ts, lib/solve.ts): what a layout
 * holds, a quarter turn keeps the count, a split's parts, the scatter; the
 * group, arrange, skip-count and split-array checks — their moves, their
 * solutions, their wrong-answer samples — and an array's validation.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, model as modelSchema, type MisconceptionCode, type Task, type ArrayModelSpec } from '../../src/engines/math-scene/schema';
import { factOf, groupSizes, layoutOf, packOf, parseArrayCut, scatterPoints, splitParts, thingCount, thingsOf } from '../../src/engines/math-scene/lib/array';
import { answered, check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve, solvedState } from '../../src/engines/math-scene/lib/solve';
import { initialState, looseOf, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { valueModelIssues, valueTaskIssues } from '../../src/engines/math-scene/validate-values';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = []): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: wrong.map(([when, sample]) => ({ when, say: T, sample })) }, ...fields });
}
const array = (fields: Record<string, unknown>) => modelSchema.parse({ kind: 'array', ...fields }) as ArrayModelSpec;
const line = { kind: 'numberline', scale: 'whole', from: 0, to: 30, step: 5, labels: 'tens' };

describe('layouts', () => {
  it('counts what a layout holds and reads its fact', () => {
    expect(thingCount(array({ layout: 'scatter', count: 12 }))).toBe(12);
    expect(thingCount(array({ layout: 'groups', groups: 4, size: 3, extra: 2 }))).toBe(14);
    expect(thingCount(array({ layout: 'groups', sizes: [2, 5, 5] }))).toBe(12);
    expect(thingCount(array({ layout: 'rows', rows: 3, cols: 4, extra: 2 }))).toBe(14);
    expect(factOf(array({ layout: 'rows', rows: 3, cols: 4 }))).toEqual({ groups: 3, each: 4, extra: 0, total: 12 });
    expect(factOf(array({ layout: 'groups', sizes: [2, 5, 5] }))).toBeNull();
    expect(groupSizes(array({ layout: 'groups', groups: 4, size: 4, container: 'car', filled: [4, 4, 4, 2] }))).toEqual([4, 4, 4, 2]);
    expect(layoutOf(array({ rows: 2, cols: 3 }))).toBe('rows');
    expect(thingsOf(array({ pair: [{ layout: 'groups', groups: 3, size: 4 }, { layout: 'groups', groups: 4, size: 3 }] }))).toBe(24);
  });

  it('keeps the count through a quarter turn (rows × cols = cols × rows)', () => {
    for (const [r, c] of [
      [3, 4],
      [6, 7],
      [1, 9],
    ])
      expect(thingCount(array({ layout: 'rows', rows: r, cols: c }))).toBe(thingCount(array({ layout: 'rows', rows: c, cols: r })));
  });

  it('splits rows or columns into two parts and reads cuts', () => {
    expect(splitParts(array({ layout: 'rows', rows: 6, cols: 7, split: { rows: [5] } }))).toEqual({ axis: 'rows', first: 5, second: 1 });
    expect(splitParts(array({ layout: 'rows', rows: 4, cols: 9, split: { cols: [5] } }))).toEqual({ axis: 'cols', first: 5, second: 4 });
    expect(parseArrayCut('r5')).toEqual({ axis: 'rows', at: 5 });
    expect(parseArrayCut('c12')).toEqual({ axis: 'cols', at: 12 });
    expect(parseArrayCut('x:5')).toBeNull();
  });

  it('spreads a scatter the same way every time, inside the tray', () => {
    const a = scatterPoints(20);
    expect(scatterPoints(20)).toEqual(a);
    for (const [x, y] of a) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(1);
    }
    const close = a.flatMap((p, i) => a.slice(i + 1).map((q) => Math.hypot(p[0] - q[0], (p[1] - q[1]) * 0.5))).filter((d) => d < 0.05);
    expect(close).toEqual([]);
    expect(packOf(4)).toEqual({ cols: 2, rows: 2 });
    expect(packOf(6)).toEqual({ cols: 3, rows: 2 });
  });

  it('validates what can be drawn', () => {
    expect(valueModelIssues(array({ layout: 'rows', rows: 13, cols: 4, object: 'egg' }))).toContain('13 × 4 is over 12 × 12 (use the blocks or the grid)');
    expect(valueModelIssues(array({ layout: 'rows', rows: 13, cols: 4, object: 'dot' }))).toEqual([]);
    expect(valueModelIssues(array({ layout: 'scatter', count: 60 }))).toEqual([]);
    expect(valueModelIssues(array({ layout: 'groups', groups: 10, size: 7 }))).toContain('70 things (a scatter or groups draws ≤ 60; use rows or the blocks)');
    expect(valueModelIssues(array({ layout: 'rows', rows: 4, cols: 3, split: { rows: [4] } }))).toContain('the cut after row 4 is past the last row');
    expect(valueModelIssues(array({ layout: 'groups', groups: 3, size: 4, cover: { rows: true } }))).toContain('split, cover and crossed rows are for rows');
    expect(valueModelIssues(array({}))[0]).toMatch(/needs a layout/);
  });
});

describe('group', () => {
  const share = task({ kind: 'group', model: { kind: 'array', layout: 'scatter', count: 12 }, total: 12, by: 'share', k: 3 }, [
    ['groups-size-swapped', '4x3'],
    ['unequal-groups', '5,4,3'],
  ]);
  const pack = task(
    { kind: 'group', model: { kind: 'array', layout: 'scatter', count: 14 }, total: 14, by: 'pack', k: 4, then: { answer: '3 r 2', form: 'remainder', op: { kind: '÷', a: 14, b: 4 } } },
    [
      ['groups-size-swapped', '4x3+2'],
      ['remainder-too-big', '2x4+6'],
      ['remainder-dropped', '=3'],
    ],
  );

  it('deals one round at a time, fills a box, puts and takes one, changes the plates', () => {
    let s = initialState(share);
    expect(s.groups).toEqual([0, 0, 0]);
    expect(answered(share, s)).toBe(false);
    s = reduce(share, s, { do: 'deal' });
    expect(s.groups).toEqual([1, 1, 1]);
    s = reduce(share, s, { do: 'put', group: 0 });
    expect(s.groups).toEqual([2, 1, 1]);
    s = reduce(share, s, { do: 'take', group: 0 });
    expect(s.groups).toEqual([1, 1, 1]);
    s = reduce(share, s, { do: 'containers', count: 4 });
    expect(s.groups).toEqual([1, 1, 1, 0]);
    expect(looseOf(share, s)).toBe(9);
    let p = initialState(pack);
    expect(p.groups).toEqual([]);
    p = reduce(pack, p, { do: 'pack' });
    p = reduce(pack, p, { do: 'pack' });
    p = reduce(pack, p, { do: 'pack' });
    expect(p.groups).toEqual([4, 4, 4]);
    expect(reduce(pack, p, { do: 'pack' })).toBe(p);
    expect(reduce(pack, reduce(pack, p, { do: 'take', group: 3 }), { do: 'clear' }).groups).toEqual([]);
  });

  it('is right with the groups asked for (and the left-over less than a group), and proves', () => {
    expect(check(share, apply(share, solve(share))).ok).toBe(true);
    expect(apply(pack, solve(pack)).groups).toEqual([4, 4, 4]);
    expect(proveTask(share)).toEqual([]);
    expect(proveTask(pack)).toEqual([]);
    expect(sampleState(share, '4x3+1')).toBeNull();
  });
});

describe('arrange', () => {
  const t = task({ kind: 'arrange', model: { kind: 'array', layout: 'scatter', count: 15, object: 'egg' }, rows: 3, cols: 5 }, [['groups-size-swapped', '5x3']]);
  const any = task({ kind: 'arrange', model: { kind: 'array', layout: 'scatter', count: 12 }, rows: 3, cols: 4, accept: 'product' });
  it('lays out rows × columns from the corner; exact or any array of as many', () => {
    expect(reduce(t, initialState(t), { do: 'arrange', rows: 20, cols: 0 }).arr).toEqual([12, 0]);
    // From 0 × 0 the steppers set one count at a time: the first row, then the first column.
    const oneRow = reduce(t, initialState(t), { do: 'arrange', rows: 1, cols: 0 });
    expect(oneRow.arr).toEqual([1, 0]);
    expect(check(t, oneRow)).toEqual({ ok: false, code: null });
    expect(reduce(t, oneRow, { do: 'arrange', rows: 1, cols: 1 }).arr).toEqual([1, 1]);
    expect(reduce(t, oneRow, { do: 'arrange', rows: 0, cols: 0 }).arr).toBeNull();
    expect(check(t, sampleState(t, '3x5')!).ok).toBe(true);
    expect(check(t, sampleState(t, '5x3')!)).toEqual({ ok: false, code: 'groups-size-swapped' });
    expect(check(any, sampleState(any, '2x6')!).ok).toBe(true);
    expect(check(any, sampleState(any, '2x5')!).ok).toBe(false);
    expect(proveTask(t)).toEqual([]);
  });
});

describe('skip-count', () => {
  const t = task({ kind: 'skip-count', model: line, size: 5, count: 4 }, [['skip-count-slip', '5,10,15,20,25']]);
  it('lands jumps in order along the line, lifts one when tapped again', () => {
    let s = reduce(t, initialState(t), { do: 'land', at: 10 });
    s = reduce(t, s, { do: 'land', at: 5 });
    expect(s.landings).toEqual([5, 10]);
    expect(reduce(t, s, { do: 'land', at: 10 }).landings).toEqual([5]);
    expect(reduce(t, s, { do: 'land', at: 35 })).toBe(s);
    expect(solvedState(t).landings).toEqual([5, 10, 15, 20]);
    expect(proveTask(t)).toEqual([]);
    expect(valueTaskIssues(task({ kind: 'skip-count', model: line, size: 5, count: 7 }), undefined)).toContain('7 jumps of 5 go past 30');
    expect(valueTaskIssues(task({ kind: 'skip-count', model: line, size: 3, count: 4 }), undefined)).toContain('jumps of 3 do not land on ticks of 5');
  });
});

describe('split-array', () => {
  const fixed = task(
    { kind: 'split-array', model: { kind: 'array', layout: 'rows', rows: 6, cols: 7 }, rows: 6, cols: 7, at: { rows: [5] }, then: { answer: [35, 7, 42], form: 'whole', sentence: '5 × 7 = ?, 1 × 7 = ?, 6 × 7 = ?' } },
    [['split-slip', '=35,7,36']],
  );
  const free = task({ kind: 'split-array', model: { kind: 'array', layout: 'rows', rows: 7, cols: 8 }, rows: 7, cols: 8, then: { answer: [40, 16, 56], form: 'whole' } }, [['split-slip', '=40,16,41']]);

  it('takes a cut between rows or columns, inside the array', () => {
    expect(reduce(fixed, initialState(fixed), { do: 'arraycut', cut: 'r6' }).cut).toBeNull();
    expect(reduce(fixed, initialState(fixed), { do: 'arraycut', cut: 'c3' }).cut).toBe('c3');
    expect(check(fixed, sampleState(fixed, 'r2')!).ok).toBe(false);
    expect(check(fixed, sampleState(fixed, 'r5')!).ok).toBe(true);
  });

  it('checks the parts of the child’s own cut (either order) when no cut is given', () => {
    const cut2 = { ...apply(free, [{ do: 'arraycut', cut: 'r2' }, { do: 'check' }]) };
    expect(cut2.phase).toBe(1);
    const write = (a: string, b: string, c: string) => apply(free, [{ do: 'input', field: 'w0', value: a }, { do: 'input', field: 'w1', value: b }, { do: 'input', field: 'w2', value: c }], cut2);
    expect(check(free, write('16', '40', '56')).ok).toBe(true);
    expect(check(free, write('40', '16', '56')).ok).toBe(true);
    expect(check(free, write('16', '40', '55')).ok).toBe(false);
    expect(proveTask(fixed)).toEqual([]);
    expect(proveTask(free)).toEqual([]);
  });

  it('validates the answers against the array and the cut', () => {
    const bad = task({ kind: 'split-array', model: { kind: 'array', layout: 'rows', rows: 6, cols: 7 }, rows: 6, cols: 7, at: { rows: [5] }, then: { answer: [30, 12, 42], form: 'whole' } });
    expect(valueTaskIssues(bad, undefined).some((m) => m.startsWith('the parts are 30 and 12'))).toBe(true);
    const wrongModel = task({ kind: 'split-array', model: { kind: 'array', layout: 'rows', rows: 5, cols: 7 }, rows: 6, cols: 7, then: { answer: [35, 7, 42], form: 'whole' } });
    expect(valueTaskIssues(wrongModel, undefined)).toContain('the model must be the 6 × 7 array in rows');
  });
});
