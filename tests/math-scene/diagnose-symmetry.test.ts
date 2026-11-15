/**
 * Completing a symmetric figure (lib/symmetry-tasks.ts, lib/diagnose/symmetry.ts, docs/79 §3.2–3.3):
 * the partners asked for, the squares and corners a child may put down, the check, and the three
 * misconceptions worked out from the result — each with right answers that are not diagnosed and
 * wrong ones that are: slid across without turning over, partners at the wrong distance, a half
 * square's slant not turned over. Also the proof of a whole task (solve, samples).
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type Task, type TaskOf } from '../../src/engines/math-scene/schema';
import { completionShows } from '../../src/engines/math-scene/lib/diagnose/symmetry';
import { completionOf, planOf } from '../../src/engines/math-scene/lib/symmetry-tasks';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { check } from '../../src/engines/math-scene/lib/check';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { symTaskIssues } from '../../src/engines/math-scene/validate-symmetry';

const text = { en: 'x', zh: 'x' };
const feedback = (wrong: { when: string; sample: string }[] = []) => ({ correct: text, fallback: text, reveal: text, wrong: wrong.map((w) => ({ ...w, say: text })) });
const task = (model: object, mode: 'cells' | 'outline', wrong: { when: string; sample: string }[] = []) =>
  taskSchema.parse({ id: 't', kind: 'complete-symmetric', mode, model, prompt: text, guide: text, hints: [text], feedback: feedback(wrong) }) as TaskOf<'complete-symmetric'>;

// A step of three squares left of x = 6: (3,2) (4,2) (4,3) → partners (8,2) (7,2) (7,3).
const step = { kind: 'grid', cols: 12, rows: 6, mirror: [{ x: 6 }], figures: [{ id: 'g', cells: [[3, 2], [4, 2], [4, 3]] }] };
// Across y = 4: two squares and a half above → below.
const roof = { kind: 'grid', cols: 8, rows: 8, mirror: [{ y: 4 }], figures: [{ id: 'g', cells: [[2, 4], [3, 4]], halves: [[3, 5, 'sw']] }] };
// An outline: path from (5,0) out to the left and back to (5,4).
const outline = { kind: 'grid', cols: 10, rows: 6, show: 'dots', mirror: [{ x: 5 }], figures: [{ id: 'g', path: [[5, 0], [2, 0], [2, 2], [4, 4], [5, 4]] }] };

const shows = (t: TaskOf<'complete-symmetric'>, child: string[], code: Parameters<typeof completionShows>[0]) => completionShows(code, completionOf(t, child)!);

describe('the plan', () => {
  it('asks for the partners on the other side', () => {
    expect(new Set(planOf(task(step, 'cells'))!.right)).toEqual(new Set(['8,2', '7,2', '7,3']));
    expect(new Set(planOf(task(roof, 'cells'))!.right)).toEqual(new Set(['2,3', '3,3', '3,2,nw']));
    expect(planOf(task(outline, 'outline'))!.right).toEqual(['6,4', '8,2', '8,0']);
  });
  it('lets the child work on the other side only', () => {
    const t = task(step, 'cells');
    let s = initialState(t);
    s = reduce(t, s, { do: 'stile', key: '4,4' });
    expect(s.sym).toEqual([]);
    s = reduce(t, s, { do: 'stile', key: '7,2' });
    s = reduce(t, s, { do: 'stile', key: '7,2,ne' });
    expect(s.sym).toEqual(['7,2,ne']);
    s = reduce(t, s, { do: 'stile', key: '7,2,ne' });
    expect(s.sym).toEqual([]);
  });
});

describe('slid-not-flipped', () => {
  const t = task(step, 'cells');
  it('is a copy moved across, not turned over', () => {
    expect(shows(t, ['9,2', '10,2', '10,3'], 'slid-not-flipped')).toBe(true);
    expect(shows(t, ['7,2', '8,2', '8,3'], 'slid-not-flipped')).toBe(true);
  });
  it('is not the right answer, nor a turned-over copy in the wrong place', () => {
    expect(shows(t, ['8,2', '7,2', '7,3'], 'slid-not-flipped')).toBe(false);
    expect(shows(t, ['9,2', '8,2', '8,3'], 'slid-not-flipped')).toBe(false);
  });
  it('works for an outline too', () => {
    const o = task(outline, 'outline');
    expect(shows(o, ['6,0', '6,2', '8,4'], 'slid-not-flipped')).toBe(true);
    expect(shows(o, ['6,4', '8,2', '8,0'], 'slid-not-flipped')).toBe(false);
  });
});

describe('distance-not-kept', () => {
  const t = task(step, 'cells');
  it('is turned over but at the wrong distance (a line one or two squares off)', () => {
    expect(shows(t, ['9,2', '8,2', '8,3'], 'distance-not-kept')).toBe(true);
    expect(shows(t, ['10,2', '9,2', '9,3'], 'distance-not-kept')).toBe(true);
  });
  it('is not the right answer or a slide', () => {
    expect(shows(t, ['8,2', '7,2', '7,3'], 'distance-not-kept')).toBe(false);
    expect(shows(t, ['9,2', '10,2', '10,3'], 'distance-not-kept')).toBe(false);
  });
  it('works for an outline too', () => {
    const o = task(outline, 'outline');
    expect(shows(o, ['7,4', '9,2', '9,0'], 'distance-not-kept')).toBe(true);
    expect(shows(o, ['8,0', '8,2', '6,4'], 'distance-not-kept')).toBe(false);
  });
});

describe('half-not-flipped', () => {
  const t = task(roof, 'cells');
  it('every whole square right, the half square\'s slant not turned over', () => {
    expect(shows(t, ['2,3', '3,3', '3,2,sw'], 'half-not-flipped')).toBe(true);
    expect(shows(t, ['3,3', '2,3', '3,2,sw'], 'half-not-flipped')).toBe(true);
  });
  it('not when it is right, or when a whole square is out', () => {
    expect(shows(t, ['2,3', '3,3', '3,2,nw'], 'half-not-flipped')).toBe(false);
    expect(shows(t, ['2,2', '3,3', '3,2,sw'], 'half-not-flipped')).toBe(false);
  });
});

describe('a whole task', () => {
  it('is proved: solution right, start not, every sample diagnosed as declared', () => {
    const t = task(step, 'cells', [
      { when: 'slid-not-flipped', sample: 'cells:(9,2),(10,2),(10,3)' },
      { when: 'distance-not-kept', sample: 'cells:(9,2),(8,2),(8,3)' },
    ]);
    expect(proveTask(t as Task)).toEqual([]);
    const o = task(outline, 'outline', [{ when: 'distance-not-kept', sample: 'pts:(7,4),(9,2),(9,0)' }]);
    expect(proveTask(o as Task)).toEqual([]);
    const r = task(roof, 'cells', [{ when: 'half-not-flipped', sample: 'cells:(2,3),(3,3),(3,2,sw)' }]);
    expect(proveTask(r as Task)).toEqual([]);
  });
  it('accepts the corners joined either way round', () => {
    const o = task(outline, 'outline');
    const s = { ...initialState(o), sym: ['8,0', '8,2', '6,4'] };
    expect(check(o as Task, s).ok).toBe(true);
  });
  it('validate: one line, up or across, partners on the paper', () => {
    expect(symTaskIssues(task(step, 'cells') as Task, undefined)).toEqual([]);
    expect(symTaskIssues(task({ ...step, mirror: [{ from: [0, 0], to: [6, 6] }] }, 'cells') as Task, undefined).join()).toMatch(/up or across/);
    expect(symTaskIssues(task({ ...step, cols: 8 }, 'cells') as Task, undefined).join()).toMatch(/off the paper/);
  });
});
