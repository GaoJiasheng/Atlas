/**
 * Diagnosis in the measurement domain (docs/21 §2.1, §3.3): every grid
 * misconception code with at least two wrong answers that show it and one
 * that does not, on small hand-made tasks, in the tasks' sample notation.
 */
import { describe, expect, it } from 'vitest';
import { MEASURE_CODES, taskSchema, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { diagnose } from '../../src/engines/math-scene/lib/check';
import { sampleState } from '../../src/engines/math-scene/lib/solve';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, codes: MisconceptionCode[]): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: codes.map((when) => ({ when, say: T })) }, ...fields });
}
const grid = (figures: unknown[], extra: Record<string, unknown> = {}) => ({ kind: 'grid', unit: 'cm', figures, ...extra });
const rect = (w: number, h: number, id = 'a', x = 0) => ({ id, rect: [x, 0, w, h] });
const plan = (figures: unknown[], extra: Record<string, unknown> = {}) => grid(figures, { show: 'none', notToScale: true, ...extra });
const ask = (a: string, figures: unknown[], answer: number, codes: MisconceptionCode[], extra: Record<string, unknown> = {}, spec: Record<string, unknown> = {}) =>
  task({ kind: 'input', ask: a, answer: String(answer), form: 'whole', model: grid(figures, extra), ...spec }, codes);
const L8x6 = { id: 'a', poly: [[0, 0], [8, 0], [8, 4], [5, 4], [5, 6], [0, 6]] };
const L9x7 = { id: 'a', poly: [[0, 0], [9, 0], [9, 4], [5, 4], [5, 7], [0, 7]] };

const diag = (t: Task, sample: string) => {
  const s = sampleState(t, sample);
  expect(s, `sample ${sample}`).not.toBeNull();
  return diagnose(t, s!);
};

/** Per code: tasks with a wrong answer that shows it (two or more in all), and one answer that does not. */
const CASES: Record<(typeof MEASURE_CODES)[number], { yes: [() => Task, string][]; no: [() => Task, string] }> = {
  'unequal-units': {
    yes: [
      [() => task({ kind: 'choose', model: grid([rect(4, 3)]), options: [{ id: 'a', text: T, correct: true }, { id: 'b', text: T, correct: false, misconception: 'unequal-units' }] }, ['unequal-units']), 'b'],
      [() => task({ kind: 'choose', model: grid([rect(6, 2)]), options: [{ id: 'a', text: T, correct: false, misconception: 'unequal-units' }, { id: 'b', text: T, correct: true }] }, ['unequal-units']), 'a'],
    ],
    no: [() => task({ kind: 'choose', model: grid([rect(4, 3)]), options: [{ id: 'a', text: T, correct: true }, { id: 'b', text: T, correct: false, misconception: 'unequal-units' }] }, ['unequal-units']), 'a'],
  },
  'half-squares': {
    yes: [
      [() => task({ kind: 'count-squares', model: grid([{ id: 'a', rect: [0, 0, 3, 2], halves: [[3, 0, 'sw'], [3, 1, 'nw']] }]), then: { answer: '7', form: 'whole' } }, ['half-squares']), '=8'],
      [() => task({ kind: 'count-squares', model: grid([{ id: 'a', rect: [0, 0, 3, 2], halves: [[3, 0, 'sw'], [3, 1, 'nw']] }]), then: { answer: '7', form: 'whole' } }, ['half-squares']), '=6'],
    ],
    no: [() => task({ kind: 'count-squares', model: grid([{ id: 'a', rect: [0, 0, 3, 2], halves: [[3, 0, 'sw'], [3, 1, 'nw']] }]), then: { answer: '7', form: 'whole' } }, ['half-squares']), '=9'],
  },
  'unit-not-squared': {
    yes: [
      [() => ask('area', [rect(4, 3)], 12, ['unit-not-squared'], {}, { form: 'measure', unit: 'cm2' }), '12 cm'],
      [() => ask('perimeter', [rect(4, 3)], 14, ['unit-not-squared'], {}, { form: 'measure', unit: 'cm' }), '14 cm2'],
    ],
    no: [() => ask('area', [rect(4, 3)], 12, ['unit-not-squared'], {}, { form: 'measure', unit: 'cm2' }), '12 m2'],
  },
  'area-perimeter-swap': {
    yes: [
      [() => ask('area', [rect(4, 3)], 12, ['area-perimeter-swap']), '14'],
      [() => ask('perimeter', [rect(4, 3)], 14, ['area-perimeter-swap']), '12'],
      [() => task({ kind: 'input', ask: 'breadth', given: 'area', answer: '4', form: 'whole', model: plan([rect(6, 4)], { dims: [{ side: 'top' }, { side: 'left', unknown: true }] }) }, ['area-perimeter-swap']), '6'],
    ],
    no: [() => ask('area', [rect(4, 3)], 12, ['area-perimeter-swap']), '7'],
  },
  'border-squares': {
    yes: [
      [() => ask('perimeter', [rect(4, 3)], 14, ['border-squares']), '10'],
      [() => task({ kind: 'trace-perimeter', model: grid([rect(5, 3)]), then: { answer: '16', form: 'whole' } }, ['border-squares']), '=12'],
    ],
    no: [() => ask('perimeter', [rect(4, 3)], 14, ['border-squares']), '12'],
  },
  'two-sides-only': {
    yes: [
      [() => ask('perimeter', [rect(5, 3)], 16, ['two-sides-only'], { show: 'none', notToScale: true, dims: [{ side: 'top' }, { side: 'left' }] }), '8'],
      [() => ask('perimeter', [rect(4, 4)], 16, ['two-sides-only']), '8'],
    ],
    no: [() => ask('perimeter', [rect(5, 3)], 16, ['two-sides-only']), '15'],
  },
  'sides-added-for-area': {
    yes: [
      [() => ask('area', [rect(4, 3)], 12, ['sides-added-for-area']), '7'],
      [() => ask('area', [rect(5, 5)], 25, ['sides-added-for-area']), '10'],
      [() => task({ kind: 'draw-rectangle', area: 18, model: grid([], { cols: 12, rows: 10 }) }, ['sides-added-for-area']), '9x9'],
    ],
    no: [() => ask('area', [rect(4, 3)], 12, ['sides-added-for-area']), '8'],
  },
  'missing-side': {
    yes: [
      [() => ask('perimeter', [L9x7], 32, ['missing-side'], { show: 'none', notToScale: true, dims: [{ side: 'bottom' }, { side: 'left' }, { from: [0, 7], to: [5, 7] }, { from: [9, 0], to: [9, 4] }] }), '25'],
      [() => ask('perimeter', [L8x6], 28, ['missing-side'], { show: 'none', notToScale: true, dims: [{ side: 'bottom' }, { side: 'left' }, { from: [0, 6], to: [5, 6] }, { from: [8, 0], to: [8, 4] }] }), '23'],
    ],
    no: [() => ask('perimeter', [L8x6], 28, ['missing-side'], { show: 'none', notToScale: true, dims: [{ side: 'bottom' }, { side: 'left' }] }), '24'],
  },
  'same-area-same-perimeter': {
    yes: [
      [() => task({ kind: 'input', ask: 'perimeter', figure: 'b', answer: '20', form: 'whole', model: grid([rect(4, 4), rect(8, 2, 'b', 6)]) }, ['same-area-same-perimeter']), '16'],
      [() => task({ kind: 'draw-rectangle', area: 12, perimeter: 16, model: grid([], { cols: 10, rows: 8 }) }, ['same-area-same-perimeter']), '4x3'],
    ],
    no: [() => task({ kind: 'input', ask: 'perimeter', figure: 'b', answer: '20', form: 'whole', model: grid([rect(4, 4), rect(8, 2, 'b', 6)]) }, ['same-area-same-perimeter']), '18'],
  },
  'perimeter-not-halved': {
    yes: [
      [() => task({ kind: 'input', ask: 'breadth', given: 'perimeter', answer: '4', form: 'whole', model: plan([rect(6, 4)], { dims: [{ side: 'top' }, { side: 'left', unknown: true }] }) }, ['perimeter-not-halved']), '14'],
      [() => task({ kind: 'input', ask: 'breadth', given: 'perimeter', answer: '6', form: 'whole', model: plan([rect(9, 6)], { unit: 'm', dims: [{ side: 'top' }, { side: 'left', unknown: true }] }) }, ['perimeter-not-halved']), '21'],
      [() => task({ kind: 'draw-rectangle', perimeter: 12, length: 4, model: grid([], { cols: 12, rows: 10 }) }, ['perimeter-not-halved']), '4x8'],
    ],
    no: [() => task({ kind: 'input', ask: 'breadth', given: 'perimeter', answer: '4', form: 'whole', model: plan([rect(6, 4)], { dims: [{ side: 'top' }, { side: 'left', unknown: true }] }) }, ['perimeter-not-halved']), '10'],
  },
  'side-from-total': {
    yes: [
      [() => task({ kind: 'input', ask: 'side', given: 'perimeter', answer: '5', form: 'whole', model: plan([rect(5, 5)], { dims: [{ side: 'top', unknown: true }] }) }, ['side-from-total']), '10'],
      [() => task({ kind: 'input', ask: 'side', given: 'area', answer: '6', form: 'whole', model: plan([rect(6, 6)], { dims: [{ side: 'top', unknown: true }] }) }, ['side-from-total']), '9'],
      [() => task({ kind: 'input', ask: 'area', given: 'perimeter', answer: '49', form: 'whole', model: plan([rect(7, 7)]) }, ['side-from-total']), '196'],
      [() => task({ kind: 'draw-rectangle', area: 36, square: true, model: grid([], { cols: 12, rows: 10 }) }, ['side-from-total']), '9x9'],
    ],
    no: [() => task({ kind: 'input', ask: 'side', given: 'area', answer: '6', form: 'whole', model: plan([rect(6, 6)], { dims: [{ side: 'top', unknown: true }] }) }, ['side-from-total']), '8'],
  },
  'overlap-counted': {
    yes: [
      [() => ask('area', [L8x6], 42, ['overlap-counted'], { show: 'none', notToScale: true }), '62'],
      [() => ask('area', [L8x6], 42, ['overlap-counted'], { show: 'none', notToScale: true }), '48'],
      [() => task({ kind: 'split-figure', model: grid([L9x7], { unit: 'm' }), then: { answer: ['35', '16', '51'], form: 'whole', sentence: '? + ? = ?' } }, ['overlap-counted']), '=35,36,71'],
    ],
    no: [() => ask('area', [L8x6], 42, ['overlap-counted'], { show: 'none', notToScale: true }), '40'],
  },
  'inner-edge-counted': {
    yes: [
      [() => ask('perimeter', [{ id: 'a', rects: [[0, 0, 4, 4], [4, 0, 4, 4]] }], 24, ['inner-edge-counted']), '32'],
      [() => ask('perimeter', [{ id: 'a', rects: [[0, 0, 3, 2], [3, 0, 2, 2], [5, 0, 1, 2]] }], 16, ['inner-edge-counted']), '24'],
    ],
    no: [() => ask('perimeter', [{ id: 'a', rects: [[0, 0, 4, 4], [4, 0, 4, 4]] }], 24, ['inner-edge-counted']), '28'],
  },
};

describe('diagnosis on the grid', () => {
  for (const code of MEASURE_CODES) {
    it(`${code}: two answers that show it, one that does not`, () => {
      const c = CASES[code];
      expect(c.yes.length).toBeGreaterThanOrEqual(2);
      for (const [mk, sample] of c.yes) expect(diag(mk(), sample), `${code} ${sample}`).toBe(code);
      expect(diag(c.no[0](), c.no[1])).not.toBe(code);
    });
  }

  it('only names misconceptions the task plans for', () => {
    const t = ask('area', [rect(4, 3)], 12, ['sides-added-for-area']);
    expect(diag(t, '14')).toBeNull();
    expect(diag(t, '7')).toBe('sides-added-for-area');
  });
});
