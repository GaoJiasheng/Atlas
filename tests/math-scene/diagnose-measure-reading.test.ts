/**
 * The measure-reading domain's rules (docs/32 §2.1, §3.6): each code with at
 * least two wrong answers that show it and one that does not, the four codes
 * shared with other domains by this domain's own rules, the side-by-side
 * number never also called × 100, and the choose-only codes found by their
 * options.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type Task } from '../../src/engines/math-scene/schema';
import { compareShows, compoundReadShows, convertShows, decimalAsCompound, orderShows, partShows, readShows, setShows, toCompoundShows, toSmallShows, type Side } from '../../src/engines/math-scene/lib/diagnose/measure-reading';
import { readingOf } from '../../src/engines/math-scene/lib/instrument';
import { model, type InstrumentSpec } from '../../src/engines/math-scene/schema';
import { check } from '../../src/engines/math-scene/lib/check';
import { initialState } from '../../src/engines/math-scene/lib/state';

const M = 1_000_000;
const inst = (spec: Record<string, unknown>) => model.parse({ kind: 'instrument', ...spec }) as InstrumentSpec;
const read = (spec: Record<string, unknown>) => {
  const r = readingOf(inst(spec))!;
  return { r, length: r.a !== undefined };
};
const key = read({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'key', from: 3, to: 8 } });
const prawns = read({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20, value: 280 });
const height = read({ type: 'tape', look: 'height-chart', unit: 'cm', from: 100, to: 150, major: 10, minor: 2, head: 128 });
const crayon = read({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'crayon', from: 0, to: '6.7' } });
const leaf = read({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'leaf', from: 0, to: '8.3' } });
const flour = read({ type: 'dial', unit: 'kg', from: 0, to: 3, major: 1, minor: '0.1', value: '2.6' });

describe('reading an instrument', () => {
  it('tick-counting: both end marks counted, or a part too many from the numbered mark', () => {
    expect(readShows('tick-counting', key, 6 * M)).toBe(true);
    expect(readShows('tick-counting', prawns, 300 * M)).toBe(true);
    expect(readShows('tick-counting', height, 130 * M)).toBe(true);
    expect(readShows('tick-counting', prawns, 204 * M)).toBe(false);
  });

  it('read-end-mark: the far end read when the thing does not start at 0', () => {
    expect(readShows('read-end-mark', key, 8 * M)).toBe(true);
    expect(readShows('read-end-mark', read({ type: 'ruler', unit: 'cm', from: 4, to: 15, major: 1, minor: 1, broken: true, object: { kind: 'ribbon', from: 6, to: 13 } }), 13 * M)).toBe(true);
    expect(readShows('read-end-mark', read({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'pencil', from: 0, to: 9 } }), 9 * M)).toBe(false);
  });

  it('not-nearest: the farther mark taken for an end between two marks', () => {
    expect(readShows('not-nearest', crayon, 6 * M)).toBe(true);
    expect(readShows('not-nearest', leaf, 9 * M)).toBe(true);
    expect(readShows('not-nearest', leaf, 7 * M)).toBe(false);
  });

  it('interval-misread: each part taken as 1, as 10, as a hundredth', () => {
    expect(readShows('interval-misread', prawns, 204 * M)).toBe(true);
    expect(readShows('interval-misread', height, 124 * M)).toBe(true);
    expect(readShows('interval-misread', flour, 2_060_000)).toBe(true);
    expect(readShows('interval-misread', prawns, 300 * M)).toBe(false);
    expect(readShows('interval-misread', key, 5 * M + 1)).toBe(false);
  });

  it('compound-place: the small part written ten times too big or too small', () => {
    const jug = read({ type: 'jug', unit: 'ml', sub: { unit: 'l' }, from: 0, to: 2000, major: 500, minor: 50, value: 1250 });
    const head = read({ type: 'tape', unit: 'cm', sub: { unit: 'm' }, from: 100, to: 200, major: 10, minor: 5, head: 105 });
    expect(compoundReadShows('compound-place', jug, 1, 25, 1000)).toBe(true);
    expect(compoundReadShows('compound-place', head, 1, 50, 100)).toBe(true);
    expect(compoundReadShows('compound-place', head, 1, 15, 100)).toBe(false);
    // The total of a compound diagnosed as a reading: 2 kg after 3 parts of 100 g written 2 kg 3 g.
    const fish = read({ type: 'dial', unit: 'g', sub: { unit: 'kg' }, from: 0, to: 4000, major: 1000, minor: 100, value: 2300 });
    expect(compoundReadShows('interval-misread', fish, 2, 3, 1000)).toBe(true);
  });

  it('decimal-as-subunit: the decimal digits taken as the small unit\'s count', () => {
    expect(decimalAsCompound(1_400_000, 1, 4, 1000)).toBe(true);
    expect(decimalAsCompound(1_300_000, 1, 3, 1000)).toBe(true);
    expect(decimalAsCompound(1_400_000, 1, 400, 1000)).toBe(false);
    expect(convertShows('decimal-as-subunit', 1_400_000, 1000, true, 1004 * M)).toBe(true);
    expect(convertShows('decimal-as-subunit', 1_300_000, 1000, true, 1003 * M)).toBe(true);
    expect(convertShows('decimal-as-subunit', 1_400_000, 1000, true, 140 * M)).toBe(false);
  });
});

describe('choosing the unit', () => {
  const reading = (spec: Record<string, unknown>, answer: string, units: string[]) =>
    taskSchema.parse({
      id: 'r',
      kind: 'read-scale',
      model: { kind: 'instrument', ...spec },
      answer: { answer, form: 'measure', units },
      prompt: { en: 'p', zh: 'p' },
      guide: { en: 'g', zh: 'g' },
      hints: [{ en: 'h', zh: 'h' }],
      feedback: { correct: { en: 'c', zh: 'c' }, fallback: { en: 'f', zh: 'f' }, reveal: { en: 'r', zh: 'r' }, wrong: [{ when: 'wrong-unit', say: { en: 's', zh: 's' } }] },
    }) as Task;
  const dial = reading({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20, value: 280 }, '280 g', ['g', 'kg']);
  const pencil = reading({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'pencil', from: 0, to: 9 } }, '9 cm', ['cm', 'm']);
  const write = (t: Task, w: string, u: string) => check(t, { ...initialState(t), input: { w, u } }).code;
  it('wrong-unit: the right number with another unit', () => {
    expect(write(dial, '280', 'kg')).toBe('wrong-unit');
    expect(write(pencil, '9', 'm')).toBe('wrong-unit');
    expect(write(dial, '300', 'kg')).toBeNull();
  });
});

describe('counting the parts', () => {
  const r = { M: 100 * M, i: 20 * M, n: 5 };
  it('tick-counting: the short marks counted (100 ÷ 4) or all the marks (a whole number only)', () => {
    expect(partShows('tick-counting', r, 25 * M)).toBe(true);
    expect(partShows('tick-counting', { M: 10 * M, i: 2 * M, n: 5 }, 2_500_000)).toBe(false);
    expect(partShows('tick-counting', { M: 120 * M, i: 20 * M, n: 6 }, 20 * M + 4 * M)).toBe(true);
    expect(partShows('tick-counting', r, 20 * M)).toBe(false);
  });
  it('interval-misread: every part taken as 1, or ten to a gap', () => {
    expect(partShows('interval-misread', r, M)).toBe(true);
    expect(partShows('interval-misread', r, 10 * M)).toBe(true);
    expect(partShows('interval-misread', r, 25 * M)).toBe(false);
  });
});

describe('setting an instrument', () => {
  it('tick-counting: one part short (the starting mark counted)', () => {
    expect(setShows('tick-counting', 160 * M, 100 * M, 20 * M, 140 * M)).toBe(true);
    expect(setShows('tick-counting', 7 * M, M, M, 6 * M)).toBe(true);
    expect(setShows('tick-counting', 160 * M, 100 * M, 20 * M, 180 * M)).toBe(false);
  });
  it('interval-misread: as many parts as the target needs if each were 1 or 10', () => {
    expect(setShows('interval-misread', 350 * M, 100 * M, 50 * M, 550 * M)).toBe(true);
    expect(setShows('interval-misread', 160 * M, 100 * M, 20 * M, 220 * M)).toBe(true);
    expect(setShows('interval-misread', 160 * M, 100 * M, 20 * M, 140 * M)).toBe(false);
  });
});

describe('changing units', () => {
  it('compound-concatenated: the two numbers side by side, when that is wrong', () => {
    expect(toSmallShows('compound-concatenated', 3, 40, 1000, 340)).toBe(true);
    expect(toSmallShows('compound-concatenated', 4, 6, 100, 46)).toBe(true);
    expect(toSmallShows('compound-concatenated', 2, 35, 1000, 235)).toBe(true);
    // 3 ℓ 250 ml side by side is 3250, which is right: not this misconception.
    expect(toSmallShows('compound-concatenated', 3, 250, 1000, 3250)).toBe(false);
  });

  it('compound-place: the small part in the wrong places', () => {
    expect(toSmallShows('compound-place', 3, 40, 1000, 3400)).toBe(true);
    expect(toSmallShows('compound-place', 4, 6, 100, 460)).toBe(true);
    expect(toSmallShows('compound-place', 5, 80, 1000, 5800)).toBe(true);
    expect(toSmallShows('compound-place', 3, 40, 1000, 340)).toBe(false);
    expect(toCompoundShows('compound-place', 3040, 1000, 3, 4)).toBe(true);
    expect(toCompoundShows('compound-place', 408, 100, 4, 80)).toBe(true);
    expect(toCompoundShows('compound-place', 408, 100, 40, 8)).toBe(false);
  });

  it('compound-split-wrong: split at another factor', () => {
    expect(toCompoundShows('compound-split-wrong', 1250, 1000, 12, 50)).toBe(true);
    expect(toCompoundShows('compound-split-wrong', 2350, 1000, 23, 50)).toBe(true);
    expect(toCompoundShows('compound-split-wrong', 1250, 1000, 1, 25)).toBe(false);
  });

  it('unit-factor-wrong: 10, 100 or 1000 for the real factor, never the side-by-side number', () => {
    expect(toSmallShows('unit-factor-wrong', 3, 250, 1000, 550)).toBe(true);
    expect(convertShows('unit-factor-wrong', 5 * M, 1000, true, 500 * M)).toBe(true);
    expect(convertShows('unit-factor-wrong', 4 * M, 100, true, 4000 * M)).toBe(true);
    expect(convertShows('unit-factor-wrong', 300_000, 1000, true, 30 * M)).toBe(true);
    expect(convertShows('unit-factor-wrong', 5 * M, 1000, true, 5000 * M)).toBe(false);
    // 3 kg 40 g → 340 is side by side and also 3 × 100 + 40: only the side-by-side story.
    expect(toSmallShows('unit-factor-wrong', 3, 40, 1000, 340)).toBe(false);
    expect(toSmallShows('compound-concatenated', 3, 40, 1000, 340)).toBe(true);
  });
});

describe('comparing and ordering', () => {
  const side = (base: number, printed: number, c?: Side['compound']): Side => ({ base: base * M, printed: printed * M, compound: c });
  it('ignored-unit: the printed numbers compared', () => {
    expect(compareShows('ignored-unit', side(900, 900), side(1000, 1), '>')).toBe(true);
    expect(compareShows('ignored-unit', side(100, 1), side(95, 95), '<')).toBe(true);
    expect(compareShows('ignored-unit', side(900, 900), side(1000, 1), '<')).toBe(false);
    const items = [side(85, 85), side(100, 1), side(120, 120)];
    expect(orderShows('ignored-unit', items, [1, 0, 2], 1)).toBe(true);
    expect(orderShows('ignored-unit', [side(850, 850), side(1000, 1), side(1200, 1)], [1, 2, 0], 1)).toBe(true);
    expect(orderShows('ignored-unit', items, [0, 1, 2], 1)).toBe(false);
  });
  it('compound-place: a compound\'s small part read ten times too big', () => {
    const a = side(105, 1, { B: 1, s: 5, f: 100, per: M });
    const b = side(150, 1, { B: 1, s: 50, f: 100, per: M });
    expect(compareShows('compound-place', a, b, '=')).toBe(true);
    expect(compareShows('compound-place', side(2050, 2, { B: 2, s: 50, f: 1000, per: M }), side(2500, 2500), '=')).toBe(true);
    expect(compareShows('compound-place', a, b, '<')).toBe(false);
  });
});

describe('codes only a choice diagnoses', () => {
  const choose = (code: string) =>
    taskSchema.parse({
      id: 'c',
      kind: 'choose',
      model: { kind: 'instrument', type: 'balance', left: [{ item: 'beach-ball', mass: 60 }], right: [{ item: 'stone', mass: 400 }] },
      prompt: { en: 'p', zh: 'p' },
      guide: { en: 'g', zh: 'g' },
      hints: [{ en: 'h', zh: 'h' }],
      feedback: { correct: { en: 'c', zh: 'c' }, fallback: { en: 'f', zh: 'f' }, reveal: { en: 'r', zh: 'r' }, wrong: [{ when: code, say: { en: 's', zh: 's' } }] },
      options: [
        { id: 'a', correct: true, text: { en: 'stone', zh: 'stone' } },
        { id: 'b', correct: false, misconception: code, text: { en: 'ball', zh: 'ball' } },
        { id: 'c', correct: false, text: { en: 'none', zh: 'none' } },
        { id: 'd', correct: false, misconception: code, text: { en: 'the raised side', zh: 'the raised side' } },
      ],
    }) as Task;
  for (const code of ['size-is-mass', 'balance-misread', 'taller-holds-more', 'unreasonable-estimate']) {
    it(`${code}: the options that show it, not another`, () => {
      const t = choose(code);
      expect(check(t, { ...initialState(t), chosen: ['b'] }).code).toBe(code);
      expect(check(t, { ...initialState(t), chosen: ['d'] }).code).toBe(code);
      expect(check(t, { ...initialState(t), chosen: ['c'] }).code).toBeNull();
    });
  }
});
