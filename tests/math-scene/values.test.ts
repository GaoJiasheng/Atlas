/**
 * The values beside fractions (docs/19 §3.0 G1, src/engines/math-scene/lib/value.ts):
 * whole numbers, remainders, times of day and durations — parsed from the
 * data, compared, and shown in the lesson's notation — and the answer
 * values the schema builds from them.
 */
import { describe, expect, it } from 'vitest';
import {
  clockParts,
  clockText,
  DEFAULT_NOTATION,
  durationParts,
  durationText,
  formatAnswer,
  formatClock,
  formatDuration,
  naturalUnits,
  onClock,
  parseClock,
  parseDuration,
  parseRemainder,
  parseTagged,
  parseWhole,
  periodZh,
  placeDigits,
  WHOLE_MAX,
} from '../../src/engines/math-scene/lib/value';
import { answerValue, clockTime, duration, whole } from '../../src/engines/math-scene/schema';

describe('whole numbers', () => {
  it('parses 0–99 999 from numbers and digit strings', () => {
    expect(parseWhole(56)).toBe(56);
    expect(parseWhole('56')).toBe(56);
    expect(parseWhole(0)).toBe(0);
    expect(parseWhole(WHOLE_MAX)).toBe(99_999);
    expect(parseWhole(100_000)).toBeNull();
    expect(parseWhole('5.5')).toBeNull();
    expect(parseWhole(-1)).toBeNull();
    expect(whole.parse('42')).toBe(42);
    expect(whole.safeParse('x').success).toBe(false);
  });

  it('splits a number into its places, ones first', () => {
    expect(placeDigits(352)).toEqual([2, 5, 3]);
    expect(placeDigits(0)).toEqual([0]);
    expect(placeDigits(1005)).toEqual([5, 0, 0, 1]);
  });
});

describe('remainders', () => {
  it('reads "3 r 2" and nothing else', () => {
    expect(parseRemainder('3 r 2')).toEqual({ kind: 'rem', q: 3, r: 2 });
    expect(parseRemainder('10r0')).toEqual({ kind: 'rem', q: 10, r: 0 });
    expect(parseRemainder('3 remainder 2')).toBeNull();
    expect(parseRemainder('3')).toBeNull();
  });
});

describe('times of day', () => {
  it('parses 24-hour data strings to seconds since midnight', () => {
    expect(parseClock('09:40')).toBe(9 * 3600 + 40 * 60);
    expect(parseClock('9:40')).toBe(9 * 3600 + 40 * 60);
    expect(parseClock('15:05:30')).toBe(15 * 3600 + 5 * 60 + 30);
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('10:60')).toBeNull();
    expect(parseClock('9.40')).toBeNull();
    expect(clockTime.parse('23:59:59')).toBe(86_399);
  });

  it('knows the 12-hour face of a time and wraps round the day', () => {
    expect(clockParts(parseClock('00:15')!)).toMatchObject({ h24: 0, h12: 12, m: 15, pm: false });
    expect(clockParts(parseClock('12:30')!)).toMatchObject({ h12: 12, pm: true });
    expect(clockParts(parseClock('19:20')!)).toMatchObject({ h24: 19, h12: 7, m: 20, pm: true });
    expect(onClock(86_400 + 60)).toBe(60);
    expect(onClock(-60)).toBe(86_340);
    expect(formatClock(parseClock('9:05')!)).toBe('09:05');
    expect(formatClock(parseClock('15:05:30')!)).toBe('15:05:30');
  });

  it('shows a time in 12-hour, face and 24-hour notation (default 7.20 pm / 19:20)', () => {
    const t = parseClock('19:20')!;
    expect(clockText(t, '12')).toBe('7.20 pm');
    expect(clockText(t, 'face')).toBe('7.20');
    expect(clockText(t, '24')).toBe('19:20');
    expect(clockText(parseClock('07:05')!, '24')).toBe('07:05');
    expect(clockText(t, '12', { clock12: 'h.mm a.m.', clock24: 'HHMM' })).toBe('7.20 p.m.');
    expect(clockText(t, '12', { clock12: 'h:mm am', clock24: 'HH MM' })).toBe('7:20 pm');
    expect(clockText(t, '24', { ...DEFAULT_NOTATION, clock24: 'HHMM' })).toBe('1920');
    expect(clockText(t, '24', { ...DEFAULT_NOTATION, clock24: 'HH MM' })).toBe('19 20');
    expect(clockText(parseClock('00:30')!, '12')).toBe('12.30 am');
    expect(clockText(parseClock('12:00')!, '12')).toBe('12.00 pm');
  });

  it('names the part of the day in Chinese prose, keeps am / pm in a number sentence', () => {
    const t = parseClock('19:20')!;
    expect(clockText(t, '12', DEFAULT_NOTATION, 'zh')).toBe('晚上 7.20');
    expect(clockText(t, '12', DEFAULT_NOTATION, 'zh', true)).toBe('7.20 pm');
    expect(periodZh(parseClock('09:00')!)).toBe('上午');
    expect(periodZh(parseClock('12:10')!)).toBe('中午');
    expect(periodZh(parseClock('15:00')!)).toBe('下午');
    expect(periodZh(parseClock('03:00')!)).toBe('凌晨');
  });
});

describe('durations', () => {
  it('parses the units written and keeps them', () => {
    expect(parseDuration('1h35m')).toEqual({ kind: 'dur', t: 5700, units: ['h', 'm'] });
    expect(parseDuration('95m')).toEqual({ kind: 'dur', t: 5700, units: ['m'] });
    expect(parseDuration('75s')).toEqual({ kind: 'dur', t: 75, units: ['s'] });
    expect(parseDuration('2m30s')).toEqual({ kind: 'dur', t: 150, units: ['m', 's'] });
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('1.5h')).toBeNull();
    expect(duration.parse('1h').t).toBe(3600);
  });

  it('splits seconds into units and shows them as written', () => {
    expect(durationParts(5700, ['h', 'm'])).toEqual({ h: 1, m: 35, s: 0 });
    expect(durationParts(5700, ['m'])).toEqual({ h: 0, m: 95, s: 0 });
    expect(durationText(5700, ['h', 'm'])).toBe('1 h 35 min');
    expect(durationText(5700, ['m'])).toBe('95 min');
    expect(durationText(3600, ['h', 'm'])).toBe('1 h');
    expect(durationText(75, ['s'])).toBe('75 s');
    expect(durationText(5700, ['h', 'm'], 'zh')).toBe('1 小时 35 分钟');
    expect(durationText(5700, ['h', 'm'], 'zh', true)).toBe('1 h 35 min');
  });

  it('writes a duration back in its natural units', () => {
    expect(naturalUnits(5700)).toEqual(['h', 'm']);
    expect(naturalUnits(7200)).toEqual(['h']);
    expect(naturalUnits(2400)).toEqual(['m']);
    expect(naturalUnits(75)).toEqual(['m', 's']);
    expect(naturalUnits(45)).toEqual(['s']);
    expect(formatDuration(5700)).toBe('1h35m');
    expect(formatDuration(5700, ['m'])).toBe('95m');
  });
});

describe('answers', () => {
  it('builds the right kind of value from the data', () => {
    expect(answerValue.parse(56)).toEqual({ n: 56, d: 1 });
    expect(answerValue.parse('3/4')).toEqual({ n: 3, d: 4 });
    expect(answerValue.parse('3 r 2')).toEqual({ kind: 'rem', q: 3, r: 2 });
    expect(answerValue.parse('19:20')).toEqual({ kind: 'clock', t: 69_600 });
    expect(answerValue.parse('1h35m')).toEqual({ kind: 'dur', t: 5700, units: ['h', 'm'] });
    expect(answerValue.safeParse('soon').success).toBe(false);
    expect(parseTagged('2')).toBeNull();
  });

  it('writes every kind back in its data notation', () => {
    for (const s of ['56', '3/4', '1 3/4', '3 r 2', '19:20', '1h35m', '95m']) expect(formatAnswer(answerValue.parse(s))).toBe(s);
  });
});
