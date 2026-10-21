/**
 * The flowchart card (docs/38 §4.4 E-LT3) on the specimen tray: the four
 * keys' layouts (boxes, YES / NO lines, leaves that never overlap, hit
 * squares of 44 px on a card drawn at 82 % of 280 px), questions not asked
 * yet dashed, the selected specimen's way down, the classmate's ✗ and
 * "belongs in", the leaves' names and counts (= the model), the whole case
 * in words, and the screen-reader words in English and Chinese.
 */
import { describe, expect, it } from 'vitest';
import { t, type Locale, type UiKey } from '../../src/i18n';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { solveSort } from '../../src/engines/space-scene/lib/sim/sort';
import { KEY_HIT, KEY_W, keyLayout, keyModel, keySummary, wrapText, type KeyLayout, type KeyWords, type Rect } from '../../src/engines/space-scene/lib/sim/keycard';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';
import { specimenTraySim } from './fixtures/specimen-tray';

const sim = specimenTraySim;
const sort = sim.sort!;
const words = (locale: Locale): KeyWords => {
  const w = (k: string) => t(locale, `space.key.${k}` as UiKey);
  return {
    yes: w('yes'), no: w('no'), neither: w('neither'), pick: w('pick'), yesTo: w('yesTo'), group: w('group'), wrong: w('wrong'), belongs: w('belongs'),
    inCase: w('inCase'), leaf: w('leaf'), summary: w('summary'), wholeCase: w('wholeCase'), colon: w('colon'), comma: w('comma'), semicolon: w('semicolon'), stop: w('stop'),
  };
};
const card = (set: SimValues, part: string | null = null, locale: Locale = 'en') => {
  const v = resolveSimValues(sim, set);
  const m = keyModel(sort, v, part, words(locale), locale);
  return { m, lay: keyLayout(m, words(locale)), text: keySummary(m, words(locale)) };
};
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const sane = (lay: KeyLayout) => {
  for (let i = 0; i < lay.leaves.length; i++) {
    const l = lay.leaves[i]!;
    expect(l.hit.w).toBeGreaterThanOrEqual(KEY_HIT);
    expect(l.hit.h).toBeGreaterThanOrEqual(KEY_HIT);
    // 44 CSS px at 82 % of the 280-unit card.
    expect((l.hit.h * 0.82 * 280) / KEY_W).toBeGreaterThanOrEqual(44);
    expect(l.x).toBeGreaterThanOrEqual(0);
    expect(l.x + l.w).toBeLessThanOrEqual(KEY_W);
    for (let j = i + 1; j < lay.leaves.length; j++) expect(overlap(l, lay.leaves[j]!)).toBe(false);
    for (const b of lay.boxes) expect(overlap(l, b)).toBe(false);
  }
  for (let i = 0; i < lay.boxes.length; i++) for (let j = i + 1; j < lay.boxes.length; j++) expect(overlap(lay.boxes[i]!, lay.boxes[j]!)).toBe(false);
  expect(lay.height).toBeGreaterThan(Math.max(...lay.leaves.map((l) => l.y + l.h), 0));
};

describe('one question (ask)', () => {
  it('a box, YES to A, NO to B; counts from the model', () => {
    const { m, lay } = card({ tray: 'alive', 'q-alive': 'grows' });
    expect(m.key).toBe('ask');
    expect(lay.boxes).toHaveLength(1);
    expect(lay.lines.map((l) => `${l.kind}-${l.from}`)).toEqual(['yes-0', 'no-0']);
    expect(m.leaves.map((l) => [l.group, l.count])).toEqual([['a', 4], ['b', 3]]);
    expect(m.questions[0]!.text).toBe('Grows?');
    expect(m.leaves.map((l) => l.name)).toEqual(['Yes: Grows?', 'No']);
    expect(m.leaves.map((l) => l.pad)).toEqual(['pad-2a', 'pad-2b']);
    sane(lay);
  });
  it('no question yet: the box dashed, both leaves 0, all in the case', () => {
    const { m } = card({ tray: 'alive' });
    expect(m.questions[0]).toMatchObject({ pending: true, text: 'No question asked yet' });
    expect(m.leaves.map((l) => l.count)).toEqual([0, 0]);
    expect(m.inCase).toBe(7);
  });
});

describe('two questions (ask + no)', () => {
  it('box 1 YES → A; NO → box 2: YES → B, NO → C', () => {
    const { m, lay } = card({ tray: 'own-key', first: 'fins', second: 'hair' });
    expect(m.key).toBe('two');
    expect(lay.boxes).toHaveLength(2);
    expect(lay.lines.map((l) => `${l.kind}-${l.from}`).sort()).toEqual(['no-0', 'no-1', 'yes-0', 'yes-1']);
    expect(m.leaves.map((l) => [l.group, l.count, l.name])).toEqual([
      ['a', 5, 'Yes: Has fins?'],
      ['b', 2, 'Yes: Has hair?'],
      ['c', 11, 'Neither'],
    ]);
    sane(lay);
  });
  it('the dolphin: yes to fins, into A', () => {
    const { m } = card({ tray: 'own-key', first: 'fins' }, 'dolphin');
    expect(m.trail).toEqual({ boxes: [0], answers: ['yes'], leaf: 'a', belongs: null });
    const { m: m2 } = card({ tray: 'own-key', first: 'feathers', second: 'hair' }, 'dolphin');
    expect(m2.trail).toEqual({ boxes: [0, 1], answers: ['no', 'no'], leaf: 'c', belongs: null });
  });
});

describe('a chain, asked one at a time', () => {
  it('six boxes, a YES line to each group, NO lines down, the last NO to X', () => {
    const { m, lay } = card({ tray: 'animals', 'asked-animal': 4 });
    expect(m.key).toBe('chain');
    expect(lay.boxes).toHaveLength(6);
    expect(lay.leaves.map((l) => l.group)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'x']);
    expect(lay.lines.filter((l) => l.kind === 'yes')).toHaveLength(6);
    expect(lay.lines.filter((l) => l.kind === 'no')).toHaveLength(6);
    // Asked four: the fifth and sixth boxes dashed, their leaves still drawn (0), X not reached.
    expect(m.questions.map((q) => q.pending)).toEqual([false, false, false, false, true, true]);
    expect(m.leaves.map((l) => l.count)).toEqual([2, 2, 2, 5, 0, 0, 0]);
    expect(m.leaves.at(-1)).toMatchObject({ name: 'Not in these six groups', pending: true });
    expect(m.inCase).toBe(7);
    sane(lay);
  });
  it('counts equal the model for every step', () => {
    for (let k = 0; k <= 6; k++) {
      const q = solveSort(sort, resolveSimValues(sim, { tray: 'animals', 'asked-animal': k }));
      const { m } = card({ tray: 'animals', 'asked-animal': k });
      expect(m.leaves.map((l) => l.count)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'x'].map((g) => q[`count:${g}`]));
    }
  });
  it('the selected toad falls through every box to X', () => {
    const { m } = card({ tray: 'animals', 'asked-animal': 6 }, 'asian-toad');
    expect(m.trail).toEqual({ boxes: [0, 1, 2, 3, 4, 5], answers: ['no', 'no', 'no', 'no', 'no', 'no'], leaf: 'x', belongs: null });
    const { m: early } = card({ tray: 'animals', 'asked-animal': 2 }, 'asian-toad');
    expect(early.trail).toEqual({ boxes: [0, 1], answers: ['no', 'no'], leaf: null, belongs: null });
  });
  it('the big groups: D named after the bacteria', () => {
    const { m } = card({ tray: 'big', 'asked-big': 3 });
    expect(m.leaves.map((l) => [l.group, l.count, l.name])).toEqual([
      ['a', 4, 'Green and makes its own food'],
      ['b', 4, 'Takes in food through a mouth'],
      ['c', 4, 'A mushroom, mould or yeast'],
      ['d', 1, 'Bacteria'],
    ]);
  });
});

describe("a classmate's arrangement", () => {
  it('seven groups, a ✗ count where one is wrong; none once moved', () => {
    const { m, lay } = card({ tray: 'classmate' });
    expect(m.key).toBe('arrangement');
    expect(lay.boxes).toHaveLength(0);
    expect(m.leaves.map((l) => [l.group, l.name, l.count, l.wrong])).toEqual([
      ['a', 'Insects', 3, 1],
      ['b', 'Birds', 2, 1],
      ['c', 'Mammals', 1, 0],
      ['d', 'Fish', 5, 2],
      ['e', 'Reptiles', 5, 2],
      ['f', 'Amphibians', 2, 1],
      ['x', 'Not in these six groups', 0, 0],
    ]);
    sane(lay);
    const fixed = card({ tray: 'classmate', fix: true }).m;
    expect(fixed.leaves.every((l) => l.wrong === 0)).toBe(true);
    expect(fixed.leaves.map((l) => l.count)).toEqual([2, 2, 4, 4, 3, 2, 1]);
  });
  it('the selected bat: in B, belongs with the mammals', () => {
    const { m, lay } = card({ tray: 'classmate' }, 'fruit-bat');
    expect(m.trail).toEqual({ boxes: [], answers: [], leaf: 'b', belongs: 'Mammals' });
    expect(lay.leaves.find((l) => l.group === 'b')!.h).toBeGreaterThanOrEqual(KEY_HIT);
    expect(card({ tray: 'classmate' }, 'shark').m.trail!.belongs).toBeNull();
  });
});

describe('the whole case and words', () => {
  it('no key: one line of words', () => {
    const { m, lay, text } = card({ tray: 'all' });
    expect(m.key).toBe('none');
    expect(lay.text.join(' ')).toBe('32 specimens in the case. Pick a chapter to sort them.');
    expect(text).toBe('32 specimens in the case. Pick a chapter to sort them.');
  });
  it('screen readers: the chain in English', () => {
    expect(card({ tray: 'animals', 'asked-animal': 2 }).text).toBe(
      'Flowchart in this model: Six legs, three body parts? Yes: group A, 2. No: Has feathers? Yes: group B, 2. No: Has hair? Yes: group C, 0. No: Has fins? Yes: group D, 0. No: Has scales on its body? Yes: group E, 0. No: Moist skin, no scales? Yes: group F, 0. No: group X, 0.',
    );
  });
  it('screen readers: in Chinese', () => {
    expect(card({ tray: 'alive', 'q-alive': 'moves' }, null, 'zh').text).toBe('这个模型里的分类流程图：能自己走动？是：A 组，4 件。不是：B 组，3 件。');
    expect(card({ tray: 'classmate', fix: false }, null, 'zh').text.startsWith('这个模型里的分类流程图：A 组，3 件，昆虫，1 件放错；B 组，2 件，鸟类，1 件放错；')).toBe(true);
  });
  it('wraps words to the box', () => {
    expect(wrapText('Six legs, three body parts?', 132, 12)).toEqual(['Six legs, three body', 'parts?']);
    expect(wrapText('六条腿、身体分三部分？', 60, 12)).toEqual(['六条腿、身', '体分三部分', '？']);
    expect(wrapText('one two three four five six seven eight nine ten', 40, 12, 2).at(-1)!.endsWith('…')).toBe(true);
  });
});
