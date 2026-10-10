import { describe, expect, it } from 'vitest';
import { groupRuns, splitGlue } from '../../src/lib/frac-glue';
import { describePicture } from '../../src/engines/math-scene/lib/words';

describe('fraction operator groups stay on one line', () => {
  it('glues an operator (and the number it works with) to the fraction beside it', () => {
    expect(splitGlue(' = ', true, true)).toEqual([{ text: ' = ', glue: true }]);
    expect(splitGlue(' = 1. Whenever the top', true, false)).toEqual([
      { text: ' = 1', glue: true },
      { text: '. Whenever the top', glue: false },
    ]);
    expect(splitGlue('Add 2 + ', false, true)).toEqual([
      { text: 'Add ', glue: false },
      { text: '2 + ', glue: true },
    ]);
    expect(splitGlue(' = 1。分子和分母相同', true, false)[0]).toEqual({ text: ' = 1', glue: true });
  });

  it('leaves words, commas and full stops alone', () => {
    expect(splitGlue(', because 3 parts are not shaded', true, false)).toEqual([{ text: ', because 3 parts are not shaded', glue: false }]);
    expect(splitGlue(' 比 ', true, true)).toEqual([{ text: ' 比 ', glue: false }]);
    expect(splitGlue(' = 1', false, false)).toEqual([{ text: ' = 1', glue: false }]);
  });

  it('groups consecutive glued items into one run, singletons pass through', () => {
    const items = ['a', 'f1', '+', 'f2', '=', 'f3', 'b', 'f4'].map((node) => ({ node, glued: /^f|[+=]/.test(node) }));
    expect(groupRuns(items)).toEqual(['a', ['f1', '+', 'f2', '=', 'f3'], 'b', 'f4']);
  });
});

describe('picture options in words', () => {
  it('describes cuts and shading without a picture', () => {
    expect(describePicture([{ parts: 4, object: 'kueh' }], 'en')).toBe('a kueh cut into 4 equal parts');
    expect(describePicture([{ parts: 2, diagonal: true, object: 'kueh' }], 'en')).toBe('a square kueh cut corner to corner into 2 equal parts');
    expect(describePicture([{ parts: null, cuts: [0.22, 0.6], object: 'kueh' }], 'en')).toBe('a kueh cut into 3 parts of different sizes');
    expect(describePicture([{ parts: 3, given: 1 }], 'en')).toBe('a bar cut into 3 equal parts, 1 shaded');
    expect(describePicture([{ parts: 3, given: 1 }, { parts: 5, given: 1, length: 0.5 }], 'en')).toBe('Row 1: a bar cut into 3 equal parts, 1 shaded; Row 2: a shorter bar cut into 5 equal parts, 1 shaded');
    expect(describePicture([{ parts: 4, object: 'kueh' }], 'zh')).toBe('千层糕，平均分成 4 份');
  });
});
