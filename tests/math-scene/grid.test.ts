/**
 * Square-grid geometry and the grid task kinds (docs/21 §3): area,
 * perimeter, the boundary walked from the top-left corner, the squares along
 * the edge, half cells, cuts into two rectangles, the corner notch of an L
 * shape, U and L perimeters; then count-squares, trace-perimeter,
 * draw-rectangle and split-figure solved, started, checked by phase and
 * written in their sample notation.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type GridModelSpec, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { allSides, boundaryEdges, cornerOverlap, factsOf, labelledSum, piecesAfter, polyIssues, rectCuts, rectOf, walkPoints } from '../../src/engines/math-scene/lib/grid';
import { answered, check, cutPieces } from '../../src/engines/math-scene/lib/check';
import { apply, drawnSolution, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, phasesOf, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { workingLines } from '../../src/engines/math-scene/lib/working';
import { gridModelIssues } from '../../src/engines/math-scene/validate';
import { formatMeasure, parseMeasure } from '../../src/engines/math-scene/lib/value';

const T = { en: 'x', zh: 'x' };
const fig = (shape: Record<string, unknown>, id = 'a') => ({ id, ...shape });
const L8x6 = fig({ poly: [[0, 0], [8, 0], [8, 4], [5, 4], [5, 6], [0, 6]] });
/** A task with placeholder text; `codes` are planned misconceptions, `[code, sample]` with a wrong answer for the proof. */
function gridTask(fields: Record<string, unknown>, codes: (MisconceptionCode | [MisconceptionCode, string])[] = []): Task {
  const wrong = codes.map((c) => (Array.isArray(c) ? { when: c[0], say: T, sample: c[1] } : { when: c, say: T }));
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong }, ...fields });
}
const model = (m: Record<string, unknown>) => ({ kind: 'grid', unit: 'cm', ...m });
const facts = (shape: Record<string, unknown>) => factsOf((gridTask({ kind: 'input', answer: '1', form: 'whole', ask: 'area', model: model({ figures: [fig(shape)] }) }).model as GridModelSpec).figures[0]!);

describe('grid geometry', () => {
  it('a rectangle: area, perimeter, squares along the edge, walk from the top-left going right', () => {
    const f = facts({ rect: [0, 0, 4, 3] });
    expect([f.area, f.perimeter, f.border, f.rect, f.square]).toEqual([12, 14, 10, true, false]);
    expect(f.walk.slice(0, 4)).toEqual(['h0,3', 'h1,3', 'h2,3', 'h3,3']);
    expect(f.walk[4]).toBe('v4,2');
    expect(walkPoints(f.walk, 2)).toEqual([[0, 3], [1, 3], [2, 3]]);
    expect(walkPoints(f.walk, f.walk.length).at(-1)).toEqual([0, 3]);
  });

  it('an L shape: 42 squares, 28 round; two cuts leave two rectangles; the corner notch overlaps 20', () => {
    const f = facts(L8x6);
    expect([f.area, f.perimeter, f.rect]).toEqual([42, 28, false]);
    expect(rectCuts(f.cells)).toEqual([{ axis: 'x', at: 5 }, { axis: 'y', at: 4 }]);
    const [left, right] = piecesAfter(f.cells, { axis: 'x', at: 5 })!;
    expect([rectOf(left), rectOf(right)]).toEqual([{ x: 0, y: 0, w: 5, h: 6 }, { x: 5, y: 0, w: 3, h: 4 }]);
    expect(rectOf(piecesAfter(f.cells, { axis: 'x', at: 3 })![1])).toBeNull();
    expect(cornerOverlap(f.cells)).toBe(20);
  });

  it('a U shape is not its box: the notch in the middle adds two sides', () => {
    const f = facts({ poly: [[0, 0], [6, 0], [6, 4], [4, 4], [4, 2], [2, 2], [2, 4], [0, 4]] });
    expect([f.area, f.perimeter]).toEqual([20, 24]);
    expect(cornerOverlap(f.cells)).toBeNull();
    // The L's "push the step out" shortcut: an L has the perimeter of its box.
    expect(facts({ poly: [[0, 0], [7, 0], [7, 3], [4, 3], [4, 5], [0, 5]] }).perimeter).toBe(2 * (7 + 5));
  });

  it('half cells: two halves make one square; no perimeter in units', () => {
    const f = facts({ rect: [0, 0, 3, 2], halves: [[3, 0, 'sw'], [3, 1, 'nw']] });
    expect([f.whole, f.halfCount, f.area, f.perimeter]).toEqual([6, 2, 7, null]);
  });

  it('a composite of rectangles: the touching sides are inside', () => {
    const f = facts({ rects: [[0, 0, 4, 4], [4, 0, 4, 4]] });
    expect([f.area, f.perimeter, f.parts.length]).toEqual([32, 24, 2]);
    expect(allSides(f.cells).size).toBeGreaterThan(boundaryEdges(f.cells).size);
  });

  it('polygons must go across or up and must not cross', () => {
    expect(polyIssues([[0, 0], [4, 0], [4, 3], [0, 3]])).toEqual([]);
    expect(polyIssues([[0, 0], [4, 0], [4, 3], [1, 2]])[0]).toContain('not across or up');
    expect(polyIssues([[0, 0], [2, 0], [2, 4], [4, 4], [4, 2], [0, 2]])).toEqual(['the sides cross each other']);
  });

  it('labelled sides and the model rules', () => {
    const m = gridTask({ kind: 'input', ask: 'perimeter', answer: '30', form: 'whole', model: model({ show: 'none', notToScale: true, figures: [fig({ poly: [[0, 0], [9, 0], [9, 4], [5, 4], [5, 6], [0, 6]] })], dims: [{ side: 'bottom' }, { side: 'left' }, { from: [0, 6], to: [5, 6] }, { from: [9, 0], to: [9, 4] }] }) }).model as GridModelSpec;
    expect(labelledSum(m, m.figures[0]!)).toBe(24);
    expect(gridModelIssues(m)).toEqual([]);
    expect(gridModelIssues({ ...m, notToScale: false }).join()).toContain('notToScale');
    expect(gridModelIssues({ ...m, figures: [{ id: 'a', tone: 'cold', rect: [0, 0, 3, 2], halves: [[3, 0, 'sw']] }] }).join()).toContain('pairs');
  });

  it('measures are a number and a unit (whole on the grid, a decimal in the decimals lesson)', () => {
    const whole = (n: number) => ({ units: n * 1_000_000, dp: 0 });
    expect(parseMeasure('28 cm2')).toEqual({ value: whole(28), unit: 'cm2' });
    expect(parseMeasure('14 cm')).toEqual({ value: whole(14), unit: 'cm' });
    expect(parseMeasure('12 square units')).toEqual({ value: whole(12), unit: 'unit2' });
    expect(parseMeasure('1.5 l')).toEqual({ value: { units: 1_500_000, dp: 1 }, unit: 'l' });
    expect(parseMeasure('750 ml')).toEqual({ value: whole(750), unit: 'ml' });
    expect(parseMeasure('3/4')).toBeNull();
    expect(formatMeasure({ value: whole(9), unit: 'm2' })).toBe('9 m2');
    expect(formatMeasure({ value: { units: 1_500_000, dp: 1 }, unit: 'l' })).toBe('1.5 l');
  });
});

describe('grid tasks', () => {
  it('count-squares: lay every square (a row at a time), then write the area with its unit', () => {
    const t = gridTask({ kind: 'count-squares', model: model({ figures: [fig({ rect: [0, 0, 4, 3] })] }), then: { answer: '12', unit: 'cm2', form: 'measure' } }, [['unit-not-squared', '=12 cm']]);
    expect(phasesOf(t)).toEqual(['model', 'input']);
    const s0 = initialState(t);
    expect(answered(t, s0)).toBe(false);
    const rows2 = reduce(t, s0, { do: 'rows', count: 2 });
    expect(rows2.tiles).toHaveLength(8);
    expect(check(t, rows2).ok).toBe(false);
    const all = reduce(t, rows2, { do: 'row', y: 0, on: true });
    expect(check(t, all).ok).toBe(true);
    expect(reduce(t, all, { do: 'tile', key: '9,9' })).toBe(all);
    expect(proveTask(t)).toEqual([]);
    const written = sampleState(t, '=12 cm')!;
    expect(check(t, written)).toEqual({ ok: false, code: 'unit-not-squared' });
    expect(check(t, sampleState(t, '=12 cm2')!).ok).toBe(true);
    expect(workingLines(t, apply(t, solve(t)), 'en', true)).toEqual(['4 × 3 = 12 cm²']);
  });

  it('count-squares with cover row-col: one row and one column are enough', () => {
    const t = gridTask({ kind: 'count-squares', cover: 'row-col', model: model({ figures: [fig({ rect: [0, 0, 5, 3] })] }), then: { answer: '15', form: 'whole' } });
    const s = apply(t, solve(t).filter((a) => a.do === 'tile'));
    expect(s.tiles).toHaveLength(5 + 3 - 1);
    expect(check(t, s).ok).toBe(true);
    expect(proveTask(t)).toEqual([]);
  });

  it('trace-perimeter: every side round, none inside; then the perimeter', () => {
    const t = gridTask({ kind: 'trace-perimeter', model: model({ figures: [fig({ rect: [0, 0, 4, 3] })] }), then: { answer: '14', form: 'whole' } }, [['area-perimeter-swap', 'edges:14+1'], ['border-squares', '=10']]);
    expect(check(t, sampleState(t, 'edges:13')!)).toEqual({ ok: false, code: null });
    expect(check(t, sampleState(t, 'edges:14+1')!)).toEqual({ ok: false, code: 'area-perimeter-swap' });
    expect(check(t, sampleState(t, 'edges:14')!).ok).toBe(true);
    expect(check(t, sampleState(t, '=10')!).code).toBe('border-squares');
    expect(reduce(t, initialState(t), { do: 'edge', key: 'h9,9' }).edges).toEqual([]);
    expect(proveTask(t)).toEqual([]);
  });

  it('draw-rectangle: any rectangle that meets the area and the perimeter; exact puts the length across', () => {
    const t = gridTask({ kind: 'draw-rectangle', area: 12, perimeter: 16, model: model({ cols: 10, rows: 8 }) }, ['same-area-same-perimeter']);
    expect(drawnSolution(t as Extract<Task, { kind: 'draw-rectangle' }>)).toEqual([6, 2]);
    expect(check(t, sampleState(t, '2x6')!).ok).toBe(true);
    expect(check(t, sampleState(t, '3x4')!).code).toBe('same-area-same-perimeter');
    const exact = gridTask({ kind: 'draw-rectangle', area: 20, length: 5, accept: 'exact', model: model({ cols: 10, rows: 8 }) });
    expect(check(exact, sampleState(exact, '4x5')!).ok).toBe(false);
    expect(check(exact, sampleState(exact, '5x4')!).ok).toBe(true);
    expect(reduce(t, initialState(t), { do: 'rect', w: 40, h: 0 }).rect).toEqual([10, 1]);
  });

  it('split-figure: a cut that leaves two rectangles, then piece + piece = total for that cut', () => {
    const t = gridTask({ kind: 'split-figure', model: model({ unit: 'm', figures: [L8x6] }), then: { answer: ['30', '12', '42'], form: 'whole', sentence: '? + ? = ?' } }, [['overlap-counted', '=30,32,62']]);
    expect(check(t, sampleState(t, 'x:3')!).ok).toBe(false);
    expect(check(t, sampleState(t, 'y:4')!).ok).toBe(true);
    expect(cutPieces(t, 'y:4')).toEqual([32, 10]);
    // The child cut the other way: the sentence is checked against that cut.
    const across = { ...apply(t, [{ do: 'gridcut', cut: 'y:4' }, { do: 'check' }]) };
    expect(check(t, { ...across, input: { w0: '10', w1: '32', w2: '42' } }).ok).toBe(true);
    expect(check(t, { ...across, input: { w0: '30', w1: '12', w2: '42' } }).ok).toBe(false);
    expect(check(t, sampleState(t, '=30,32,62')!).code).toBe('overlap-counted');
    expect(proveTask(t)).toEqual([]);
  });
});
