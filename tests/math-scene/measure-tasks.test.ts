/**
 * The measuring checks (docs/32 §3.4–3.6, M5 / M6 / M8 / M11): the three new
 * task kinds' states, moves, checks, solutions and samples; quantities
 * compared, ordered and written (a measure with its unit chip, a compound
 * with its two boxes, a conversion); the number sentence never saying the
 * answer first; the straightened view; and the validator's rules (the
 * reading is the answer, codes the task can diagnose, limits, bare text).
 */
import { describe, expect, it } from 'vitest';
import { stepLimits, taskSchema, type Task } from '../../src/engines/math-scene/schema';
import { answered, check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve, solvedState } from '../../src/engines/math-scene/lib/solve';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { workingLines } from '../../src/engines/math-scene/lib/working';
import { canShow, viewsFor } from '../../src/engines/math-scene/lib/lesson';
import { isMeasureTask } from '../../src/engines/math-scene/lib/measure-kind';
import { countParts, setTarget, setValue, unitChips } from '../../src/engines/math-scene/lib/measure-tasks';
import { taskIssues } from '../../src/engines/math-scene/validate';
import { bareQuantities } from '../../src/engines/math-scene/validate-measure';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { isDecimalTask } from '../../src/engines/math-scene/lib/decimal-tasks';
import { valueModelIssues } from '../../src/engines/math-scene/validate-values';
import { model } from '../../src/engines/math-scene/schema';

const M = 1_000_000;
const text = { en: 'x', zh: 'x' };
const mk = (t: Record<string, unknown>, wrong: [string, string][] = []): Task =>
  taskSchema.parse({ prompt: text, guide: text, hints: [text], feedback: { correct: text, fallback: text, reveal: text, wrong: wrong.map(([when, sample]) => ({ when, say: text, sample })) }, ...t }) as Task;
const dial = (extra: Record<string, unknown> = {}) => ({ kind: 'instrument', type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20, value: 0, ...extra });
const issues = (t: Task, limits?: Record<string, unknown>) => taskIssues(t, 'here', { bridge: false, practice: false, limits: limits ? stepLimits.parse(limits) : undefined }).map((i) => i.message.replace('here: ', ''));

describe('read-scale', () => {
  const t = mk({ id: 'r', kind: 'read-scale', model: dial({ value: 280, load: 'prawns' }), answer: { answer: '280 g', form: 'measure', units: ['g', 'kg'] }, tools: ['zoom', 'count'] }, [
    ['interval-misread', '204'],
    ['tick-counting', '300'],
    ['wrong-unit', '280 kg'],
  ]);

  it('is a measuring task, not a decimal one, and proves', () => {
    expect(isMeasureTask(t)).toBe(true);
    expect(isDecimalTask(t)).toBe(false);
    expect(domainOf(t)).toBe('measure-reading');
    expect(proveTask(t)).toEqual([]);
    expect(issues(t)).toEqual([]);
  });

  it('needs the unit chip before it can be checked, and takes an equal quantity in another unit', () => {
    let s = reduce(t, initialState(t), { do: 'input', field: 'w', value: '280' });
    expect(answered(t, s)).toBe(false);
    s = reduce(t, s, { do: 'input', field: 'u', value: 'g' });
    expect(answered(t, s)).toBe(true);
    expect(check(t, s).ok).toBe(true);
    expect(check(t, { ...s, input: { w: '280', u: 'kg' } }).code).toBe('wrong-unit');
  });

  it('keeps its tools as scratch: counting parts and the magnifier never check', () => {
    let s = reduce(t, initialState(t), { do: 'mtool', tool: 'count' });
    s = reduce(t, s, { do: 'mpart', part: 10 });
    s = reduce(t, s, { do: 'mtool', tool: 'zoom' });
    expect(s.mcount && s.mzoom).toBe(true);
    expect(s.mparts).toEqual([10]);
    expect(answered(t, s)).toBe(false);
    expect(reduce(t, s, { do: 'mtool', tool: 'count' }).mparts).toEqual([]);
  });

  it('never writes the answer in its sentence before it is done', () => {
    expect(workingLines(t, initialState(t), 'en').at(-1)).toBe('? g');
    expect(workingLines(t, sampleState(t, '204')!, 'en').at(-1)).toBe('{u:204 g}');
    expect(workingLines(t, solvedState(t), 'en', true).at(-1)).toBe('{u:280 g}');
  });

  it('offers the straightened scale on a dial (and not on a ruler)', () => {
    expect(canShow(t, 'straight')).toBe(true);
    expect(viewsFor(null, t)).toEqual(['instrument', 'straight']);
    const ruler = mk({ id: 'q', kind: 'read-scale', model: { kind: 'instrument', type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'key', from: 3, to: 8 } }, answer: { answer: 5, form: 'whole', unit: 'cm' } });
    expect(canShow(ruler, 'straight')).toBe(false);
  });

  it('defaults its unit chips to the answer\'s family', () => {
    const plain = mk({ id: 'p', kind: 'read-scale', model: dial({ value: 280 }), answer: { answer: '280 g', form: 'measure' } });
    expect(unitChips((plain as Extract<Task, { kind: 'read-scale' }>).answer)).toEqual(['g', 'kg']);
  });

  it('is refused when its answer is not what the instrument reads', () => {
    const bad = mk({ id: 'b', kind: 'read-scale', model: dial({ value: 280 }), answer: { answer: '300 g', form: 'measure' } });
    expect(issues(bad).some((m) => m.includes('should be 280 g'))).toBe(true);
  });

  it('reads a compound on a two-unit scale and diagnoses the small part misplaced', () => {
    const c = mk({ id: 'c', kind: 'read-scale', model: { kind: 'instrument', type: 'jug', unit: 'ml', sub: { unit: 'l' }, from: 0, to: 2000, major: 500, minor: 50, value: 1250 }, answer: { answer: '1 l 250 ml', form: 'compound' } }, [
      ['compound-place', '1,25'],
      ['interval-misread', '1,5'],
    ]);
    expect(proveTask(c)).toEqual([]);
    // The small box empty is 0: 1 ℓ is not 1 ℓ 250 ml.
    expect(check(c, { ...initialState(c), input: { b: '1' } }).ok).toBe(false);
    expect(workingLines(c, initialState(c), 'en').at(-1)).toBe('? ℓ ? ml');
  });
});

describe('set-scale', () => {
  const load = mk({ id: 'l', kind: 'set-scale', model: dial(), target: '160 g', mode: 'load' }, [
    ['tick-counting', '140'],
    ['interval-misread', '220'],
  ]);

  it('moves by small parts and numbered gaps, snapped to the marks, within the scale', () => {
    expect(setTarget(load as Extract<Task, { kind: 'set-scale' }>)).toBe(160 * M);
    let s = reduce(load, initialState(load), { do: 'mnudge', by: 20 * M });
    expect(setValue(load as Extract<Task, { kind: 'set-scale' }>, s)).toBe(20 * M);
    s = reduce(load, s, { do: 'mset', to: 167 * M });
    expect(s.mset).toBe(160 * M);
    s = reduce(load, s, { do: 'mset', to: 900 * M });
    expect(s.mset).toBe(500 * M);
    expect(proveTask(load)).toEqual([]);
  });

  it('puts weights on a balance until it is level, the fewest the answer', () => {
    const w = mk({ id: 'w', kind: 'set-scale', model: { kind: 'instrument', type: 'balance', left: [{ item: 'papaya', mass: 800 }] }, target: '800 g', mode: 'weights', weights: [500, 200, 100, 50] });
    expect(solve(w)).toEqual([
      { do: 'weigh', w: 500 },
      { do: 'weigh', w: 200 },
      { do: 'weigh', w: 100 },
    ]);
    const s = apply(w, [{ do: 'weigh', w: 500 }, { do: 'weigh', w: 50 }]);
    expect(check(w, s).ok).toBe(false);
    expect(check(w, reduce(w, s, { do: 'weigh', w: 30 })).ok).toBe(false);
    expect(reduce(w, s, { do: 'unweigh', at: 1 }).mweights).toEqual([500]);
    expect(sampleState(w, 'weights:500,200,100')!.mweights).toEqual([500, 200, 100]);
    expect(issues(w)).toEqual([]);
  });

  it('is refused for a mode its instrument does not have, or a target off the marks', () => {
    const bad = mk({ id: 'x', kind: 'set-scale', model: dial(), target: 170, mode: 'fill' });
    expect(issues(bad)).toEqual(expect.arrayContaining(['mode fill is for a jug', 'the target 170 is not on a mark']));
  });

  it('requires the weights target to agree with the object being weighed', () => {
    const t = mk({ id: 'mismatch', kind: 'set-scale', model: { kind: 'instrument', type: 'balance', left: [{ item: 'papaya', mass: 800 }] }, target: '700 g', mode: 'weights', weights: [500, 200, 100] });
    expect(issues(t)).toContain('the target must equal the mass on the left pan');
    const tooMany = mk({ id: 'too-many', kind: 'set-scale', model: { kind: 'instrument', type: 'balance', left: [{ item: 'papaya', mass: 800 }] }, target: '800 g', mode: 'weights', weights: [50] });
    expect(issues(tooMany)).toContain('the mass needs more than the 12 weights the pan can hold');
  });
});

describe('count-intervals', () => {
  const c = mk({ id: 'c', kind: 'count-intervals', model: dial(), between: [200, 300], ask: 'part', then: { answer: 20, form: 'whole', unit: 'g' } }, [
    ['tick-counting', '=25'],
    ['interval-misread', '=1'],
  ]);

  it('taps every part between the two marks, then writes what a part stands for', () => {
    expect(countParts(c as Extract<Task, { kind: 'count-intervals' }>)).toEqual([10, 11, 12, 13, 14]);
    const four = sampleState(c, 'parts:4')!;
    expect(check(c, four)).toEqual({ ok: false, code: null });
    expect(reduce(c, initialState(c), { do: 'mpart', part: 3 }).mparts).toEqual([]);
    expect(proveTask(c)).toEqual([]);
    const done = apply(c, solve(c).slice(0, 6));
    expect(done.phase).toBe(1);
    expect(workingLines(c, done, 'en').at(-1)).toBe('{u:300 g} − {u:200 g} = {u:100 g} · {u:100 g} ÷ 5 = ?');
  });

  it('is refused when ask part is not between two numbered marks next to each other', () => {
    const bad = mk({ id: 'b', kind: 'count-intervals', model: dial(), between: [200, 400], ask: 'part', then: { answer: 20, form: 'whole', unit: 'g' } });
    expect(issues(bad)).toContain('ask part: between two numbered marks next to each other');
  });
});

describe('quantities compared, ordered, converted', () => {
  const member = (extra: Record<string, unknown>) => {
    const { kind: _, ...rest } = dial(extra);
    return rest;
  };
  const pair = { kind: 'instrument', pair: [member({ label: text }), member({ label: text, value: 100 })] };

  it('compares by value in one unit and diagnoses the printed numbers compared', () => {
    const t = mk({ id: 'cmp', kind: 'compare', model: pair, a: '900 g', b: '1 kg', align: 'unit' }, [['ignored-unit', '>']]);
    expect(proveTask(t)).toEqual([]);
    const aligned = reduce(t, initialState(t), { do: 'align' });
    expect(workingLines(t, aligned, 'en')).toEqual(['{u:900 g} ○ {u:1 kg}', '{u:900 g} ○ {u:1000 g}']);
  });

  it('orders by value and diagnoses the printed numbers ordered', () => {
    const t = mk({ id: 'ord', kind: 'order', model: pair, items: ['1 kg', '850 g', '1 kg 200 g'], direction: 'asc' }, [['ignored-unit', '1 kg,1 kg 200 g,850 g']]);
    expect(proveTask(t)).toEqual([]);
    expect(solvedState(t).order).toEqual([1, 0, 2]);
  });

  it('converts a compound into the small unit (side by side, not × 100)', () => {
    const t = mk({ id: 'cv', kind: 'input', model: dial(), answer: 3040, form: 'whole', unit: 'g', work: { do: 'convert', from: '3 kg 40 g', into: 'g' } }, [
      ['compound-concatenated', '340'],
      ['compound-place', '3400'],
    ]);
    expect(proveTask(t)).toEqual([]);
    expect(workingLines(t, initialState(t), 'en').at(-1)).toBe('{u:3 kg 40 g} = ? g');
    const both = mk({ id: 'cv2', kind: 'input', model: dial(), answer: 3040, form: 'whole', unit: 'g', work: { do: 'convert', from: '3 kg 40 g', into: 'g' } }, [
      ['unit-factor-wrong', '340'],
    ]);
    expect(proveTask(both)).toEqual(['feedback.wrong "unit-factor-wrong": sample "340" is diagnosed as nothing']);
  });

  it('converts into a compound and refuses an answer that is not the conversion', () => {
    const t = mk({ id: 'cs', kind: 'input', model: dial(), answer: '1 l 250 ml', form: 'compound', work: { do: 'convert', from: '1250 ml', into: 'l-ml' } }, [['compound-split-wrong', '12,50']]);
    expect(proveTask(t)).toEqual([]);
    const bad = mk({ id: 'cb', kind: 'input', model: dial(), answer: '1 l 25 ml', form: 'compound', work: { do: 'convert', from: '1250 ml', into: 'l-ml' } });
    expect(issues(bad).some((m) => m.startsWith('the answer is 1 l 25 ml'))).toBe(true);
  });
});

describe('validation', () => {
  it('refuses a code the task cannot diagnose', () => {
    const t = mk({ id: 'u', kind: 'read-scale', model: dial({ value: 280 }), answer: { answer: 280, form: 'whole', unit: 'g' } }, [['read-end-mark', '300']]);
    expect(issues(t)).toContain('"read-end-mark" needs a thing read on a ruler or tape that does not start at 0');
  });

  it('keeps to the step\'s limits', () => {
    const t = mk({ id: 'v', kind: 'read-scale', model: dial({ value: 280 }), answer: { answer: '280 g', form: 'measure' } });
    expect(issues(t, { units: ['cm', 'm'], parts: [5, 10], partsPerLabel: [2, 2] })).toEqual(['unit g (this step: cm, m)', 'a small part of 20 (this step: 5, 10)', '5 parts between numbers (2–2)']);
  });

  it('refuses a scale whose marks are not the same parts, or a reading off the marks', () => {
    const t = mk({ id: 'w', kind: 'read-scale', model: dial({ to: 510, value: 290 }), answer: { answer: '290 g', form: 'measure' } });
    expect(issues(t)).toEqual(expect.arrayContaining(['from 0 to 510 is not a whole number of small parts of 20', 'the needle 290 is not on a mark (every 20)']));
  });

  it('requires compound reading brackets to start at zero', () => {
    const t = mk({ id: 'bracket', kind: 'read-scale', model: { kind: 'instrument', type: 'jug', unit: 'ml', from: 0, to: 1000, major: 100, minor: 50, value: 350, brackets: [{ from: 100, to: 350, label: text }] }, answer: { answer: 350, form: 'whole', unit: 'ml' } });
    expect(issues(t)).toContain('brackets for a reading start at 0');
  });

  it('takes a whole-number line to 10 000 in any step, numbered every major (a scale straightened)', () => {
    expect(valueModelIssues(model.parse({ kind: 'numberline', scale: 'whole', from: 0, to: 1000, step: 50, major: 100, labels: 'tens' }))).toEqual([]);
    expect(valueModelIssues(model.parse({ kind: 'numberline', scale: 'whole', from: 0, to: 1000, step: 50, major: 75 }))).toEqual(['numbered ticks every 75 are not on ticks of 50']);
    expect(valueModelIssues(model.parse({ kind: 'numberline', scale: 'whole', from: 0, to: 10000, step: 50 }))).toEqual(['more than 100 ticks']);
  });

  it('finds quantities written as bare text, not tokens', () => {
    expect(bareQuantities('The pencil is 9 cm long, the jug holds 1.5 ℓ and 2 m 35 cm.')).toEqual(['9 cm', '1.5 ℓ', '2 m', '35 cm']);
    expect(bareQuantities('The pencil is {u:9 cm} long, 3 more, 10 minutes, 2 groups, 28 cm²')).toEqual([]);
    const t = mk({ id: 'z', kind: 'read-scale', model: dial({ value: 280 }), answer: { answer: '280 g', form: 'measure' }, prompt: { en: 'Read 280 g.', zh: '读 {u:280 g}。' } });
    expect(issues(t)).toContain('task.prompt.en: "280 g" is a quantity written as text: write it {u:280 g}');
  });
});
