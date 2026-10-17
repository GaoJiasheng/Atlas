/**
 * The time diagnosis (docs/20 §2.1, §3.5; lib/diagnose/time.ts): every code
 * in the domain with at least two written answers that show it and one that
 * does not — reading a clock, am and pm, 12- and 24-hour time, working out
 * a start, an end or a length, and converting hours and minutes. Written
 * times stay raw (10:95, 1 h 75 min) so the base-100 answers can be seen.
 */
import { describe, expect, it } from 'vitest';
import { TIME_CODES, type MisconceptionCode } from '../../src/engines/math-scene/schema';
import { timeShows, type TimeContext } from '../../src/engines/math-scene/lib/diagnose/time';
import { parseClock, parseDuration } from '../../src/engines/math-scene/lib/value';
import type { Written } from '../../src/engines/math-scene/lib/forms';

const at = (s: string) => parseClock(s)!;
const len = (s: string) => parseDuration(s)!.t;
const c12 = (h: number, m: number, ap: 'am' | 'pm' = 'am'): Written => ({ kind: 'clock', mode: '12', h, m, s: 0, ap });
const face = (h: number, m: number): Written => ({ kind: 'clock', mode: 'face', h, m, s: 0, ap: null });
const c24 = (h: number, m: number): Written => ({ kind: 'clock', mode: '24', h, m, s: 0, ap: null });
const dur = (h: number, m: number): Written => ({ kind: 'dur', h, m, s: 0 });
const whole = (n: number): Written => ({ kind: 'whole', n });

const read = (form: TimeContext['form'], t: string): TimeContext => ({ form, answer: at(t) });

const cases: [MisconceptionCode, [TimeContext, Written][], [TimeContext, Written]][] = [
  ['hands-swapped', [[read('face', '07:20'), face(4, 36)], [read('face', '02:50'), face(10, 14)], [read('time12', '19:20'), c12(4, 36, 'pm')]], [read('face', '07:20'), face(7, 4)]],
  ['next-hour', [[read('face', '02:50'), face(3, 50)], [read('face', '11:45'), face(12, 45)], [read('time12', '14:50'), c12(3, 50, 'pm')]], [read('face', '03:00'), face(4, 0)]],
  ['numeral-as-minutes', [[read('face', '07:20'), face(7, 4)], [read('face', '03:45'), face(3, 9)]], [read('face', '07:05'), face(7, 1)]],
  ['five-count-slip', [[read('face', '07:28'), face(7, 33)], [read('face', '07:28'), face(7, 23)]], [read('face', '07:28'), face(7, 30)]],
  ['am-pm', [[read('time12', '19:00'), c12(7, 0, 'am')], [read('time12', '07:20'), c12(7, 20, 'pm')]], [read('time12', '12:30'), c12(12, 30, 'am')]],
  ['noon-midnight', [[read('time12', '12:30'), c12(12, 30, 'am')], [read('time12', '00:15'), c12(12, 15, 'pm')], [read('time24', '00:30'), c24(24, 30)]], [read('time12', '07:20'), c12(7, 20, 'pm')]],
  [
    'base-100',
    [
      [{ form: 'whole', answer: 135, convert: { from: len('2h15m'), to: 'min' } }, whole(215)],
      [{ form: 'duration', answer: len('2h30m'), convert: { from: len('150m'), to: 'h' }, pair: 'h-min' }, dur(1, 50)],
      [{ form: 'duration', answer: len('1h35m'), span: { start: at('09:40'), end: at('11:15'), ask: 'length' }, pair: 'h-min' }, dur(1, 75)],
      [{ form: 'time12', answer: at('11:35'), span: { start: at('10:45'), length: len('50m'), ask: 'end' } }, c12(10, 95)],
      [{ form: 'time24', answer: at('14:25'), span: { end: at('15:05'), length: len('40m'), ask: 'start' } }, c24(14, 65)],
    ],
    [{ form: 'whole', answer: 135, convert: { from: len('2h15m'), to: 'min' } }, whole(125)],
  ],
  [
    'count-endpoints',
    [
      [{ form: 'duration', answer: len('3h'), span: { start: at('09:00'), end: at('12:00'), ask: 'length' }, pair: 'h-min' }, dur(4, 0)],
      [{ form: 'duration', answer: len('1h35m'), span: { start: at('14:40'), end: at('16:15'), ask: 'length' }, pair: 'h-min' }, dur(2, 35)],
      [{ form: 'whole', answer: 3, span: { start: at('09:00'), end: at('12:00'), ask: 'length' } }, whole(4)],
    ],
    [{ form: 'duration', answer: len('20m'), span: { start: at('09:10'), end: at('09:30'), ask: 'length' }, pair: 'h-min' }, dur(1, 20)],
  ],
  [
    'wrong-direction',
    [
      [{ form: 'time12', answer: at('14:45'), span: { end: at('16:10'), length: len('1h25m'), ask: 'start' } }, c12(5, 35, 'pm')],
      [{ form: 'time24', answer: at('14:25'), span: { end: at('15:05'), length: len('40m'), ask: 'start' } }, c24(15, 45)],
      [{ form: 'time12', answer: at('11:35'), span: { start: at('10:45'), length: len('50m'), ask: 'end' } }, c12(9, 55)],
    ],
    [{ form: 'time24', answer: at('14:25'), span: { end: at('15:05'), length: len('40m'), ask: 'start' } }, c24(14, 35)],
  ],
  ['24h-offset', [[read('time24', '15:15'), c24(13, 15)], [read('time24', '15:15'), c24(3, 15)], [read('time12', '19:40'), c12(9, 40, 'pm')]], [read('time24', '15:15'), c24(15, 30)]],
];

describe('time diagnosis: every code shows on two answers and not on a third', () => {
  for (const [code, yes, no] of cases) {
    it(code, () => {
      for (const [c, x] of yes) expect(timeShows(code, c, x), `${code} on ${JSON.stringify(x)}`).toBe(true);
      expect(timeShows(code, no[0], no[1])).toBe(false);
    });
  }

  it('covers every code but the faulty-clock one (a choose option), and never the right answer', () => {
    expect(new Set([...cases.map((c) => c[0]), 'hour-hand-on-numeral'])).toEqual(new Set(TIME_CODES));
    for (const code of TIME_CODES) {
      expect(timeShows(code, read('face', '07:20'), face(7, 20))).toBe(false);
      expect(timeShows(code, read('time12', '19:20'), c12(7, 20, 'pm'))).toBe(false);
    }
    expect(timeShows('hour-hand-on-numeral', read('face', '04:30'), face(4, 30))).toBe(false);
  });
});
