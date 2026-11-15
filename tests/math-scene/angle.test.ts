/** Angle geometry and tasks (docs/76 §3.1–3.2): the protractor's two scales, laying it, arcs, shapes, dot paper, the checks and their samples. */
import { describe, expect, it } from 'vitest';
import { taskSchema, type Task } from '../../src/engines/math-scene/schema';
import { between, corners, gapChange, layings, reading, scaleDir, zeroRow } from '../../src/engines/math-scene/lib/angle';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { check } from '../../src/engines/math-scene/lib/check';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { laid } from '../../src/engines/math-scene/lib/angle-tasks';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { angleModelIssues } from '../../src/engines/math-scene/validate-angles';

const b = { en: 'x', zh: 'x' };
const fb = (wrong: unknown[] = []) => ({ correct: b, fallback: b, reveal: b, wrong });
const task = (t: Record<string, unknown>): Task => taskSchema.parse({ id: 't', prompt: b, guide: b, hints: [b], feedback: fb(), ...t });

describe('protractor', () => {
  it('reads like a real one: outer 0 on the left, inner 0 on the right', () => {
    expect(reading(0, 0, 'inner')).toBe(0);
    expect(reading(0, 50, 'inner')).toBe(50);
    expect(reading(0, 50, 'outer')).toBe(130);
    expect(reading(0, 180, 'outer')).toBe(0);
    expect(reading(0, 115, 'outer')).toBe(65);
    expect(scaleDir(0, 30, 'outer')).toBe(150);
    expect(zeroRow(0, 180)).toBe('outer');
  });
  it('can be laid both ways on an angle, with the other arm on its curve', () => {
    const l = layings(0, 50);
    expect(l.map((x) => [x.rot, x.row])).toEqual([[0, 'inner'], [230, 'outer']]);
    expect(between(350, 10)).toBe(20);
  });
});

describe('shapes and dot paper', () => {
  it('finds interior corners either way round', () => {
    const sq = corners([[0, 0], [2, 0], [2, 2], [0, 2]]);
    expect(sq.map((c) => Math.round(c.size))).toEqual([90, 90, 90, 90]);
    const cw = corners([[0, 0], [0, 2], [3, 0]]);
    expect(Math.round(cw.reduce((s, c) => s + c.size, 0))).toBe(180);
  });
  it('measures how far a gap changes', () => {
    expect(gapChange([3, 2], [3, 1])).toBe(1);
    expect(gapChange([6, 2], [3, 1])).toBe(0);
  });
  it('flags a not-to-scale drawing drawn true and a square that is not 90°', () => {
    expect(angleModelIssues({ kind: 'angle', rays: [{ dir: 0 }, { dir: 60 }], arcs: [{ from: 0, to: 60, value: 62 }], notToScale: true } as never).length).toBeGreaterThan(0);
    expect(angleModelIssues({ kind: 'angle', rays: [{ dir: 0 }, { dir: 80 }], square: [[0, 80]] } as never).length).toBeGreaterThan(0);
  });
});

describe('measure-angle', () => {
  const t = task({ kind: 'measure-angle', model: { kind: 'angle', rays: [{ dir: 0 }, { dir: 50 }] }, answer: 50, feedback: fb([{ when: 'wrong-scale', say: b, sample: '=130' }]) });
  it('snaps onto the vertex and an arm, then opens the box', () => {
    let s = initialState(t);
    s = reduce(t, s, { do: 'aput', x: 0.05, y: 0.04 });
    expect(s.apos).toEqual([0, 0]);
    s = reduce(t, s, { do: 'aturn', to: 3 });
    expect(s.arot).toBe(0);
    expect(laid(t, s)).toBe(true);
    expect(s.phase).toBe(1);
  });
  it('is proved (solution, samples)', () => {
    expect(proveTask(t)).toEqual([]);
    expect(check(t, sampleState(t, '=51')!).ok).toBe(true);
  });
});

describe('draw-angle and draw-segment', () => {
  it('draws on the side asked and diagnoses the other row', () => {
    const t = task({ kind: 'draw-angle', model: { kind: 'angle', rays: [{ dir: 180, label: 'C' }] }, target: 65, open: 'cw', feedback: fb([{ when: 'wrong-scale', say: b, sample: '115' }]) });
    expect(proveTask(t)).toEqual([]);
    expect(apply(t, solve(t)).adir).toBe(115);
  });
  it('checks a parallel line through a dot', () => {
    const t = task({
      kind: 'draw-segment',
      relation: 'parallel',
      from: [1, 4],
      model: { kind: 'angle', paper: { cols: 9, rows: 7, segments: [{ from: [1, 1], to: [4, 2], labels: ['A', 'B'] }] } },
      feedback: fb([{ when: 'looks-parallel', say: b, sample: '(4,6)' }]),
    });
    expect(proveTask(t)).toEqual([]);
    expect(check(t, sampleState(t, '(7,6)')!).ok).toBe(true);
  });
});

describe('drawings not to scale keep their order (Gavin 2026-11-16)', () => {
  it('flags a bigger angle drawn smaller, a changed kind, unequal equals', async () => {
    const { orderIssues, angleBeatIssues } = await import('../../src/engines/math-scene/validate-angles');
    expect(orderIssues([{ value: 65, span: 100, name: 'a' }, { value: 115, span: 80, name: 'b' }]).length).toBeGreaterThan(0);
    expect(orderIssues([{ value: 85, span: 105, name: 'a' }]).length).toBeGreaterThan(0);
    expect(orderIssues([{ value: 75, span: 83, name: 'p' }, { value: 75, span: 70, name: 'q' }]).length).toBeGreaterThan(0);
    expect(orderIssues([{ value: 48, span: 60, name: 'a' }, { value: 132, span: 120, name: 'b' }])).toEqual([]);
    const beat = { model: { kind: 'angle', lines: [{ dir: 0 }], rays: [{ dir: 100 }], arcs: [{ from: 0, to: 100, value: 115 }, { from: 100, to: 180, value: 65 }], notToScale: true }, caption: b } as never;
    expect(angleBeatIssues(beat)).toContain('an explanation beat is drawn to scale (no notToScale)');
  });
});
