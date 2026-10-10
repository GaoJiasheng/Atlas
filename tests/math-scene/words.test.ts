import { describe, expect, it } from 'vitest';
import { fractionWords, numberZh } from '../../src/engines/math-scene/lib/words';
import { parseRich, speakable } from '../../src/lib/rich-text';

const w = (n: number, d: number, whole?: number) => (whole ? { w: whole, n, d } : { n, d });

describe('fractions in words', () => {
  it('reads English the Singapore way (quarters, not fourths)', () => {
    expect(fractionWords(w(1, 2), 'en')).toBe('one half');
    expect(fractionWords(w(1, 4), 'en')).toBe('one quarter');
    expect(fractionWords(w(3, 4), 'en')).toBe('three quarters');
    expect(fractionWords(w(5, 12), 'en')).toBe('five twelfths');
    expect(fractionWords(w(3, 4, 1), 'en')).toBe('one and three quarters');
    expect(fractionWords(w(2, 1), 'en')).toBe('two');
    expect(fractionWords({ n: null, d: 12 }, 'en')).toBe('how many twelfths');
    expect(fractionWords({ n: 8, d: null }, 'en')).toBe('eight over what');
  });

  it('reads Chinese', () => {
    expect(fractionWords(w(1, 2), 'zh')).toBe('二分之一');
    expect(fractionWords(w(1, 4), 'zh')).toBe('四分之一');
    expect(fractionWords(w(5, 12), 'zh')).toBe('十二分之五');
    expect(fractionWords(w(3, 4, 1), 'zh')).toBe('一又四分之三');
    expect(fractionWords(w(11, 4), 'zh')).toBe('四分之十一');
    expect(fractionWords({ n: null, d: 12 }, 'zh')).toBe('十二分之几');
    expect(fractionWords({ n: 8, d: null }, 'zh')).toBe('几分之八');
    expect(numberZh(20)).toBe('二十');
    expect(numberZh(35)).toBe('三十五');
  });

  it('finds {a/b} tokens and speaks them', () => {
    expect(parseRich('Shade {3/8} of {1 3/4}.')).toEqual([
      { text: 'Shade ' },
      { frac: { n: 3, d: 8 } },
      { text: ' of ' },
      { frac: { w: 1, n: 3, d: 4 } },
      { text: '.' },
    ]);
    expect(parseRich('{2/3} = {?/12}')).toEqual([{ frac: { n: 2, d: 3 } }, { text: ' = ' }, { frac: { n: null, d: 12 } }]);
    expect(parseRich('no tokens {here}')).toEqual([{ text: 'no tokens {here}' }]);
    expect(speakable('Shade {3/8}.', 'en')).toBe('Shade three eighths.');
    expect(speakable('涂出 {3/8}。', 'zh')).toBe('涂出 八分之三。');
  });
});
