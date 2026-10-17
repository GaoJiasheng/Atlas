import { describe, expect, it } from 'vitest';
import { clockPastWords, clockWords, durationWords, fractionWords, numberEn, numberZh, placeName, placeValueWords } from '../../src/engines/math-scene/lib/words';
import { badTokens, parseRich, plainText, speakable } from '../../src/lib/rich-text';
import { DEFAULT_NOTATION, parseClock } from '../../src/engines/math-scene/lib/value';

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

describe('whole numbers, place values, times and durations in words (docs/19 G7)', () => {
  it('reads whole numbers to 99 999 the British way', () => {
    expect(numberEn(0)).toBe('zero');
    expect(numberEn(42)).toBe('forty-two');
    expect(numberEn(100)).toBe('one hundred');
    expect(numberEn(305)).toBe('three hundred and five');
    expect(numberEn(1020)).toBe('one thousand and twenty');
    expect(numberEn(4120)).toBe('four thousand one hundred and twenty');
    expect(numberEn(20_000)).toBe('twenty thousand');
    expect(numberEn(99_999)).toBe('ninety-nine thousand nine hundred and ninety-nine');
    expect(numberEn(100_000)).toBe('100000');
  });

  it('reads whole numbers to 99 999 in Chinese, with 零 for the gaps', () => {
    expect(numberZh(10)).toBe('十');
    expect(numberZh(15)).toBe('十五');
    expect(numberZh(105)).toBe('一百零五');
    expect(numberZh(110)).toBe('一百一十');
    expect(numberZh(1020)).toBe('一千零二十');
    expect(numberZh(1005)).toBe('一千零五');
    expect(numberZh(10_010)).toBe('一万零一十');
    expect(numberZh(23_000)).toBe('二万三千');
    expect(numberZh(99_999)).toBe('九万九千九百九十九');
  });

  it('names place values', () => {
    expect(placeValueWords([0, 2, 1], 'en')).toBe('1 hundred, 2 tens and 0 ones');
    expect(placeValueWords([8, 1], 'en')).toBe('1 ten and 8 ones');
    expect(placeValueWords([0, 14], 'zh')).toBe('14 个十和 0 个一');
    expect(placeName(1, 'zh')).toBe('十位');
    expect(placeName(0, 'en', 1)).toBe('one');
  });

  it('reads times of day: 12-hour, a face, 24-hour, the "past" reading', () => {
    const t = (s: string) => parseClock(s)!;
    expect(clockWords(t('19:20'), '12', 'en')).toBe('seven twenty p.m.');
    expect(clockWords(t('07:00'), '12', 'en')).toBe("seven o'clock a.m.");
    expect(clockWords(t('07:05'), 'face', 'en')).toBe('seven oh five');
    expect(clockWords(t('19:20'), '24', 'en')).toBe('nineteen twenty');
    expect(clockWords(t('19:00'), '24', 'en')).toBe('nineteen hundred');
    expect(clockWords(t('19:20'), '12', 'zh')).toBe('晚上七点二十分');
    expect(clockWords(t('07:05'), 'face', 'zh')).toBe('七点零五分');
    expect(clockWords(t('19:20'), '24', 'zh')).toBe('十九时二十分');
    expect(clockPastWords(t('07:20'), 'en')).toBe('twenty past seven');
    expect(clockPastWords(t('03:30'), 'en')).toBe('half past three');
    expect(clockPastWords(t('03:15'), 'en')).toBe('quarter past three');
    expect(clockPastWords(t('03:11'), 'en')).toBe('eleven minutes past three');
    expect(clockPastWords(t('03:40'), 'en')).toBe('three forty');
    expect(clockPastWords(t('07:20'), 'zh')).toBe('七点二十分');
    expect(clockPastWords(t('03:30'), 'zh')).toBe('三点半');
    expect(clockPastWords(t('03:00'), 'zh')).toBe('三点整');
  });

  it('reads durations in the units written', () => {
    expect(durationWords(5700, ['h', 'm'], 'en')).toBe('one hour thirty-five minutes');
    expect(durationWords(5700, ['m'], 'en')).toBe('ninety-five minutes');
    expect(durationWords(75, ['s'], 'en')).toBe('seventy-five seconds');
    expect(durationWords(5700, ['h', 'm'], 'zh')).toBe('一小时三十五分钟');
    expect(durationWords(60, ['m'], 'en')).toBe('one minute');
  });

  it('finds {t:}, {d:} and {u:} tokens, writes and speaks them, flags bad ones', () => {
    expect(parseRich('At {t:19:20} for {d:95m}.')).toEqual([{ text: 'At ' }, { time: 69_600, mode: '12' }, { text: ' for ' }, { dur: 5700, units: ['m'] }, { text: '.' }]);
    expect(parseRich('{t:7:20|face} {t:19:20|24}')).toEqual([{ time: 26_400, mode: 'face' }, { text: ' ' }, { time: 69_600, mode: '24' }]);
    expect(plainText('At {t:19:20}, {d:1h35m}, {u:28 cm2}.', 'en')).toBe('At 7.20 pm, 1 h 35 min, 28 cm².');
    expect(plainText('{t:19:20}', 'zh')).toBe('晚上 7.20');
    expect(plainText('{t:19:20}', 'zh', DEFAULT_NOTATION, true)).toBe('7.20 pm');
    expect(speakable('Leave at {t:19:20|24}.', 'en')).toBe('Leave at nineteen twenty.');
    expect(speakable('{d:1h35m}', 'zh')).toBe('一小时三十五分钟');
    expect(speakable('{u:28 cm2}', 'en')).toBe('twenty-eight square centimetres');
    expect(speakable('14 ÷ 4 = 3 r 2', 'en')).toBe('14 ÷ 4 = 3 remainder 2');
    expect(speakable('14 ÷ 4 = 3 r 2', 'zh')).toBe('14 ÷ 4 = 3 余 2');
    expect(badTokens('{t:25:00} {d:soon} {u:3 mi} {3/x} {t:09:40} {here}')).toEqual(['{t:25:00}', '{d:soon}', '{u:3 mi}', '{3/x}']);
    expect(badTokens('{t:13:20|face}')).toEqual(['{t:13:20|face}']);
  });
});
