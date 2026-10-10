/**
 * Checks and the diagnosis (docs/15 §2.2, §4.8) on small hand-made tasks: each
 * task kind right / wrong / near, and every misconception code with at least
 * two answers that show it and one that does not.
 */
import { describe, expect, it } from 'vitest';
import { MISCONCEPTIONS, taskSchema, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { answered, check, diagnose, inputFields, inputRows } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { canMerge, initialState, inputSpecOf, reduce } from '../../src/engines/math-scene/lib/state';

const T = { en: 'x', zh: 'x' };
/** A task of `kind` with placeholder text, planning feedback for `codes`. */
function task(fields: Record<string, unknown>, codes: MisconceptionCode[] = []): Task {
  return taskSchema.parse({
    id: 'probe',
    prompt: T,
    guide: T,
    hints: [T],
    feedback: { correct: T, fallback: T, reveal: T, wrong: codes.map((when) => ({ when, say: T })) },
    ...fields,
  });
}
const bar = (parts: number | null, extra: Record<string, unknown> = {}) => ({ kind: 'bar', parts, ...extra });
const line = (intervals: number, extra: Record<string, unknown> = {}) => ({ kind: 'numberline', from: 0, to: 1, intervals, labels: 'ends', ...extra });

/** The diagnosis of a sample answer. */
const diag = (t: Task, sample: string) => {
  const s = sampleState(t, sample);
  expect(s, `sample ${sample}`).not.toBeNull();
  return diagnose(t, s!);
};

describe('checks per kind', () => {
  it('shade: right count, wrong count, not answered', () => {
    const t = task({ kind: 'shade', model: bar(8), target: '3/8' });
    expect(answered(t, initialState(t))).toBe(false);
    expect(check(t, sampleState(t, '3')!).ok).toBe(true);
    expect(check(t, sampleState(t, '4')!)).toEqual({ ok: false, code: null });
  });

  it('cut: three equal parts on a 12 grid; 24 grid allows one mark', () => {
    const t = task({ kind: 'cut', model: bar(null), parts: 3, snap: 12 });
    expect(check(t, sampleState(t, '4,8')!).ok).toBe(true);
    expect(check(t, sampleState(t, '4')!).ok).toBe(false);
    const fine = task({ kind: 'cut', model: bar(null), parts: 3, snap: 24 });
    expect(check(fine, sampleState(fine, '9,16')!).ok).toBe(true);
    expect(check(fine, sampleState(fine, '6,16')!).ok).toBe(false);
  });

  it('fold: doubles parts, keeps given parts; unfold undoes', () => {
    const t = task({ kind: 'fold', model: bar(2, { given: 1 }), parts: 8, then: { answer: '4/8', form: 'equal' } });
    let s = reduce(t, initialState(t), { do: 'fold' });
    expect(s.parts).toBe(4);
    expect(s.given).toEqual([0, 1]);
    s = reduce(t, s, { do: 'unfold' });
    expect(s.parts).toBe(2);
    const solved = apply(t, solve(t));
    expect(solved.parts).toBe(8);
    expect(check(t, solved).ok).toBe(true);
  });

  it('split and merge: factors, and merges that do not come out evenly', () => {
    const split = task({ kind: 'split', model: bar(3, { given: 2 }), factors: [2, 3, 4], target: '8/12' });
    expect(check(split, reduce(split, initialState(split), { do: 'factor', k: 4 })).ok).toBe(true);
    expect(check(split, reduce(split, initialState(split), { do: 'factor', k: 2 })).ok).toBe(false);
    const merge = task({ kind: 'merge', model: bar(8, { given: 6 }), factors: [2, 3, 4], target: '3/4' });
    expect(canMerge(merge, 2)).toEqual({ ok: true, reason: null });
    expect(canMerge(merge, 3)).toEqual({ ok: false, reason: 'parts' });
    expect(canMerge(merge, 4)).toEqual({ ok: false, reason: 'shaded' });
    expect(check(merge, reduce(merge, initialState(merge), { do: 'factor', k: 2 })).ok).toBe(true);
    expect(reduce(merge, initialState(merge), { do: 'factor', k: 3 }).factor).toBeNull();
  });

  it('place: ticks exact, free within tolerance', () => {
    const t = task({ kind: 'place', model: line(8), target: '3/4' });
    expect(check(t, sampleState(t, '6')!).ok).toBe(true);
    const free = task({ kind: 'place', model: line(8), target: '3/4', snap: 'free', tolerance: 1 });
    expect(check(free, sampleState(free, '7')!).ok).toBe(true);
    expect(check(free, sampleState(free, '8')!).ok).toBe(false);
  });

  it('compare by symbol and by picking the greater / smaller one', () => {
    const sym = task({ kind: 'compare', model: bar(null), a: '2/3', b: '3/4' });
    expect(check(sym, sampleState(sym, '<')!).ok).toBe(true);
    const greater = task({ kind: 'compare', model: bar(null), a: '1/3', b: '1/5', ask: 'greater' });
    expect(check(greater, sampleState(greater, 'a')!).ok).toBe(true);
    const smaller = task({ kind: 'compare', model: bar(null), a: '1/3', b: '1/5', ask: 'smaller' });
    expect(check(smaller, sampleState(smaller, 'b')!).ok).toBe(true);
  });

  it('order and choose', () => {
    const o = task({ kind: 'order', model: bar(null), items: ['1/2', '3/8', '3/4'], direction: 'asc' });
    expect(check(o, sampleState(o, '3/8,1/2,3/4')!).ok).toBe(true);
    expect(answered(o, sampleState(o, '3/8,1/2')!)).toBe(false);
    const c = task({ kind: 'choose', multi: true, model: bar(null), options: [{ id: 'a', value: '1/2', correct: true }, { id: 'b', value: '2/4', correct: true }, { id: 'c', value: '1/3', correct: false }] });
    expect(check(c, sampleState(c, 'a,b')!).ok).toBe(true);
    expect(check(c, sampleState(c, 'a')!).ok).toBe(false);
  });

  it('input forms: equal, equivalent, simplest (near), mixed, whole, blanks', () => {
    const eq = task({ kind: 'input', model: bar(8, { given: 4 }), answer: '4/8', form: 'equal' });
    expect(check(eq, sampleState(eq, '4/8')!).ok).toBe(true);
    expect(check(eq, sampleState(eq, '1/2')!).ok).toBe(false);
    const ev = task({ kind: 'input', model: bar(8), answer: '4/8', form: 'equivalent' });
    expect(check(ev, sampleState(ev, '1/2')!).ok).toBe(true);
    const simp = task({ kind: 'input', model: bar(12), answer: '1/3', form: 'simplest' });
    expect(check(simp, sampleState(simp, '2/6')!)).toEqual({ ok: false, code: 'not-simplest', near: true });
    expect(check(simp, sampleState(simp, '1/3')!).ok).toBe(true);
    const mixed = task({ kind: 'input', model: bar(4, { wholes: 3 }), answer: '2 3/4', form: 'mixed' });
    expect(check(mixed, sampleState(mixed, '2 3/4')!).ok).toBe(true);
    expect(check(mixed, sampleState(mixed, '11/4')!).ok).toBe(false);
    const whole = task({ kind: 'input', model: bar(4), answer: '1', form: 'whole' });
    expect(inputFields(inputSpecOf(whole)!)).toEqual(['w']);
    expect(check(whole, sampleState(whole, '1')!).ok).toBe(true);
    const blanks = task({ kind: 'input', model: bar(3), answer: ['8/12', '8/12'], blanks: ['n', 'd'], form: 'equal' });
    expect(inputFields(inputSpecOf(blanks)!)).toEqual(['n0', 'd1']);
    expect(inputRows(inputSpecOf(blanks)!)[0]!.slots.map((s) => s.printed)).toEqual([null, 12]);
    expect(check(blanks, sampleState(blanks, '8/12,8/12')!).ok).toBe(true);
  });

  it('build-sum: convert, mark, then write', () => {
    const t = task({ kind: 'build-sum', model: bar(2, { given: 1 }), op: '+', a: '1/2', b: '1/4', convert: 2, answer: { answer: '3/4', form: 'equivalent' } });
    let s = initialState(t);
    expect(check(t, reduce(t, s, { do: 'factor', k: 3 })).ok).toBe(false);
    s = apply(t, [{ do: 'factor', k: 2 }, { do: 'check' }]);
    expect(s.phase).toBe(1);
    expect(s.given).toEqual([0, 1]);
    s = apply(t, [{ do: 'shade', part: 2 }, { do: 'check' }], s);
    expect(s.phase).toBe(2);
    expect(check(t, apply(t, solve(t))).ok).toBe(true);
  });
});

/** Two answers that show the code and one that does not, per misconception. */
const CASES: Record<MisconceptionCode, { task: () => Task; yes: string[]; no: string }> = {
  'unequal-parts': { task: () => task({ kind: 'cut', model: bar(null), parts: 3 }, ['unequal-parts']), yes: ['3,8', '2,10'], no: '4' },
  'equal-area-not-same-shape': {
    task: () => task({ kind: 'choose', multi: true, model: bar(null), options: [{ id: 'a', value: '1/2', correct: true }, { id: 'b', value: '2/4', correct: true, misconception: 'equal-area-not-same-shape' }, { id: 'c', value: '1/3', correct: false, misconception: 'unequal-parts' }] }),
    yes: ['a'],
    no: 'a,b',
  },
  'part-part': { task: () => task({ kind: 'input', model: bar(6, { given: 1 }), answer: '1/6', form: 'equal' }, ['part-part']), yes: ['1/5'], no: '1/7' },
  swapped: { task: () => task({ kind: 'input', model: bar(8, { given: 3 }), answer: '3/8', form: 'equal' }, ['swapped']), yes: ['8/3'], no: '3/5' },
  'bigger-denominator-bigger': { task: () => task({ kind: 'compare', model: bar(null), a: '1/3', b: '1/5' }, ['bigger-denominator-bigger']), yes: ['<'], no: '=' },
  'different-wholes': {
    task: () => task({ kind: 'choose', model: bar(null), options: [{ id: 'a', value: '1/3', correct: true }, { id: 'b', value: '1/5', correct: false, misconception: 'different-wholes' }] }),
    yes: ['b'],
    no: 'a',
  },
  'gap-thinking': { task: () => task({ kind: 'compare', model: bar(null), a: '2/3', b: '3/4' }, ['gap-thinking']), yes: ['='], no: '>' },
  'compare-numerators-only': { task: () => task({ kind: 'compare', model: bar(null), a: '3/8', b: '1/2' }, ['compare-numerators-only']), yes: ['>'], no: '=' },
  'added-denominators': {
    task: () => task({ kind: 'input', model: bar(4), answer: '3/4', form: 'equivalent', sum: { op: '+', a: '1/2', b: '1/4' } }, ['added-denominators']),
    yes: ['2/6'],
    no: '2/4',
  },
  'not-converted': {
    task: () => task({ kind: 'input', model: bar(8), answer: '3/8', form: 'equivalent', sum: { op: '-', a: '7/8', b: '1/2' } }, ['not-converted']),
    yes: ['6/8'],
    no: '6/6',
  },
  'additive-equivalence': {
    task: () => task({ kind: 'input', model: bar(3), answer: '8/12', from: '2/3', form: 'equal' }, ['additive-equivalence']),
    yes: ['11/12'],
    no: '2/12',
  },
  'scaled-one-part': {
    task: () => task({ kind: 'input', model: bar(12), answer: '2/3', from: '8/12', form: 'simplest' }, ['scaled-one-part']),
    yes: ['4/12', '8/6'],
    no: '5/7',
  },
  'not-simplest': { task: () => task({ kind: 'input', model: bar(12), answer: '1/3', form: 'simplest' }, ['not-simplest']), yes: ['2/6', '4/12'], no: '1/4' },
  'tick-counting': { task: () => task({ kind: 'input', model: line(8, { arrow: '5/8' }), answer: '5/8', form: 'equal' }, ['tick-counting']), yes: ['6/9'], no: '5/9' },
  'whole-changed': { task: () => task({ kind: 'input', model: bar(4, { wholes: 3 }), answer: '2 3/4', form: 'mixed' }, ['whole-changed']), yes: ['2 3/11', '2 3/8'], no: '1 3/4' },
};

/** More positives where one task kind gives a second example. */
const MORE: [MisconceptionCode, () => Task, string][] = [
  ['part-part', () => task({ kind: 'input', model: bar(6, { given: 5 }), answer: '5/6', form: 'equal' }, ['part-part']), '5/1'],
  ['swapped', () => task({ kind: 'input', model: bar(6, { given: 5 }), answer: '5/6', form: 'equal' }, ['swapped']), '6/5'],
  ['bigger-denominator-bigger', () => task({ kind: 'order', model: bar(null), items: ['1/2', '1/8', '1/4'], direction: 'desc' }, ['bigger-denominator-bigger']), '1/8,1/4,1/2'],
  ['different-wholes', () => task({ kind: 'choose', multi: true, model: bar(null), options: [{ id: 'a', value: '1/3', correct: true }, { id: 'b', value: '1/5', correct: false, misconception: 'different-wholes' }] }), 'a,b'],
  ['gap-thinking', () => task({ kind: 'compare', model: bar(null), a: '4/5', b: '5/6' }, ['gap-thinking']), '='],
  ['compare-numerators-only', () => task({ kind: 'order', model: bar(null), items: ['1/2', '3/8', '3/4'], direction: 'asc' }, ['compare-numerators-only']), '1/2,3/4,3/8'],
  ['added-denominators', () => task({ kind: 'build-sum', model: bar(9, { given: 7 }), op: '-', a: '7/9', b: '4/9', answer: { answer: '3/9', form: 'equivalent' } }, ['added-denominators']), '=3/0'],
  ['not-converted', () => task({ kind: 'build-sum', model: bar(8, { given: 7 }), op: '-', a: '7/8', b: '1/2', answer: { answer: '3/8', form: 'equivalent' } }, ['not-converted']), '=6/8'],
  ['additive-equivalence', () => task({ kind: 'input', model: bar(3), answer: ['8/12', '8/12'], blanks: ['n', 'd'], from: '2/3', form: 'equal' }, ['additive-equivalence']), '8/12,8/9'],
  ['tick-counting', () => task({ kind: 'place', model: line(4), target: '1/4' }, ['tick-counting']), '2'],
  ['unequal-parts', () => task({ kind: 'choose', model: bar(null), options: [{ id: 'a', value: '1/3', correct: true }, { id: 'b', value: '1/3', correct: false, misconception: 'unequal-parts' }] }), 'b'],
  ['equal-area-not-same-shape', () => task({ kind: 'choose', multi: true, model: bar(null), options: [{ id: 'a', value: '1/2', correct: true }, { id: 'b', value: '1/2', correct: true, misconception: 'equal-area-not-same-shape' }, { id: 'c', value: '1/3', correct: false }] }), 'a,c'],
];

describe('diagnosis', () => {
  for (const code of MISCONCEPTIONS) {
    it(`${code}: two answers that show it, one that does not`, () => {
      const c = CASES[code];
      const t = c.task();
      const positives = [...c.yes.map((s) => diag(t, s)), ...MORE.filter(([k]) => k === code).map(([, mk, s]) => diag(mk(), s))];
      expect(positives.length).toBeGreaterThanOrEqual(2);
      for (const p of positives) expect(p).toBe(code);
      expect(diag(t, c.no)).not.toBe(code);
    });
  }

  it('only names misconceptions the task plans for', () => {
    const t = task({ kind: 'input', model: bar(6, { given: 1 }), answer: '1/6', form: 'equal' }, ['swapped']);
    expect(diag(t, '1/5')).toBeNull();
    expect(diag(t, '6/1')).toBe('swapped');
  });
});
