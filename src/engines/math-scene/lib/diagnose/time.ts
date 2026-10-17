/**
 * Diagnosis in the time domain (docs/20 §2.1, §3.5): reading a clock, am and
 * pm, 12- and 24-hour time, and working with durations. Every rule is a pure
 * test of what the child wrote (raw: `10:95` and `1 h 75 min` stay as written)
 * against the right time and what the task says about it: the span it works
 * across (`start`, `end`, `length`, the one asked) or the duration it converts.
 * The clock model adds its own kinds; they build the same `TimeContext` and
 * call `diagnoseTime`. Only the codes a task declares are looked for, in the
 * order it declares them; `hour-hand-on-numeral` is diagnosed by `choose`
 * options (a faulty clock face), as in the fractions and grid domains.
 */
import type { InputSpec, MisconceptionCode, Task } from '../../schema';
import { clockParts, DAY, HOUR, MINUTE, type AnswerValue } from '../value';
import { durationBoxes, writtenClock, writtenDuration, type Written } from '../forms';

export interface TimeContext {
  /** What the child writes: a time of day (12-hour, 24-hour, a face reading), a duration, or a whole number (a conversion). */
  form: 'time12' | 'time24' | 'face' | 'duration' | 'whole';
  /** The right answer: seconds (a time of day or a duration), or the whole number. */
  answer: number;
  /** A conversion: the duration converted (seconds) and the unit asked for. */
  convert?: { from: number; to: 'h' | 'min' | 's' };
  /** A span: its known ends and length (seconds), and the one asked for. */
  span?: { start?: number; end?: number; length?: number; ask: 'start' | 'end' | 'length' };
  /** The boxes of a duration. */
  pair?: 'h-min' | 'min-s';
}

type ClockW = Extract<Written, { kind: 'clock' }>;
type DurW = Extract<Written, { kind: 'dur' }>;

/** The clock-face position of a time: hour 1–12, minute, second. */
const face = (t: number) => clockParts(t);
const h12 = (h: number) => ((h % 12) + 12) % 12 || 12;

/** A time read on a clock face (hours 1–12) with the minutes as written. */
const readsAs = (w: ClockW, h: number, m: number) => h12(w.h) === h12(h) && w.m === m && (w.mode !== '24' || w.h === h);

/** Hours and minutes taken as a number in hundreds (9:40 → 940), the way a decimal sum treats them. */
const asHundreds = (t: number) => {
  const p = face(t);
  return p.h24 * 100 + p.m;
};

/** Is what the child wrote (time of day) the time `t`? */
function clockIs(w: ClockW, t: number): boolean {
  const at = writtenClock(w);
  if (at === null) return false;
  return w.mode === 'face' ? at % (12 * HOUR) === t % (12 * HOUR) : at === t;
}

/** Does the written answer show the misconception? */
export function timeShows(code: MisconceptionCode, c: TimeContext, x: Written): boolean {
  if (x.kind === 'clock') return clockShows(code, c, x);
  if (x.kind === 'dur') return durationShows(code, c, x);
  if (x.kind === 'whole') return wholeShows(code, c, x.n);
  return false;
}

function clockShows(code: MisconceptionCode, c: TimeContext, x: ClockW): boolean {
  if (c.form === 'duration' || c.form === 'whole') return false;
  if (clockIs(x, c.answer)) return false;
  const T = face(c.answer);
  const pm = x.ap === 'pm';
  switch (code) {
    case 'hands-swapped': {
      // The hour hand's place read as minutes, the minute hand's number as the hour (7:20 → 4:36).
      const h = Math.floor(T.m / 5) || 12;
      const m = Math.floor((T.h24 % 12) * 5 + T.m / 12);
      return readsAs(x, h, m) || (h12(x.h) === h && x.m === m);
    }
    case 'next-hour':
      return T.m > 0 && h12(x.h) === h12(T.h12 + 1) && x.m === T.m;
    case 'numeral-as-minutes':
      return T.m % 5 === 0 && T.m >= 10 && h12(x.h) === T.h12 && x.m === T.m / 5;
    case 'five-count-slip':
      return h12(x.h) === T.h12 && Math.abs(x.m - T.m) === 5;
    case 'am-pm':
      return c.form === 'time12' && T.h12 !== 12 && h12(x.h) === T.h12 && x.m === T.m && x.s === T.s && pm !== T.pm;
    case 'noon-midnight': {
      if (c.form === 'time12') return T.h12 === 12 && h12(x.h) === 12 && x.m === T.m && pm !== T.pm;
      // 24-hour midnight written 24:xx or 12:xx.
      return c.form === 'time24' && T.h24 === 0 && (x.h === 24 || x.h === 12) && x.m === T.m;
    }
    case '24h-offset': {
      if (x.m !== T.m) return false;
      // 12 → 24: the hour plus 10, or an afternoon hour without the 12 added (3.15 pm → 13:15, 03:15).
      if (c.form === 'time24') return T.pm && T.h24 !== 12 && (x.h === T.h12 + 10 || x.h === T.h12);
      // 24 → 12: the hour less 10 (19:40 → 9.40).
      return c.form === 'time12' && T.h24 >= 13 && h12(x.h) === T.h24 - 10;
    }
    case 'base-100': {
      const s = c.span;
      if (!s || s.length === undefined) return false;
      const L = s.length;
      const lh = Math.floor(L / HOUR);
      const lm = Math.floor((L % HOUR) / MINUTE);
      if (s.ask === 'end' && s.start !== undefined) {
        // Minutes added without carrying into the hour: 10:45 + 50 min → 10:95.
        const p = face(s.start);
        const m = p.m + lm;
        return m >= 60 && x.m === m && (x.mode === '24' ? x.h === p.h24 + lh : h12(x.h) === h12(p.h24 + lh));
      }
      if (s.ask === 'start' && s.end !== undefined) {
        // Minutes taken away borrowing 100: 15:05 − 40 min → 14:65.
        const p = face(s.end);
        let h = p.h24 - lh;
        let m = p.m - lm;
        if (m >= 0) return false;
        h -= 1;
        m += 100;
        return x.m === m && (x.mode === '24' ? x.h === h : h12(x.h) === h12(h));
      }
      return false;
    }
    case 'wrong-direction': {
      const s = c.span;
      if (!s || s.length === undefined) return false;
      if (s.ask === 'start' && s.end !== undefined) return clockIs(x, (s.end + s.length) % DAY);
      if (s.ask === 'end' && s.start !== undefined) return clockIs(x, (s.start - s.length + DAY) % DAY);
      return false;
    }
    default:
      return false;
  }
}

function durationShows(code: MisconceptionCode, c: TimeContext, x: DurW): boolean {
  if (c.form !== 'duration') return false;
  const pair = c.pair ?? 'h-min';
  const seconds = writtenDuration(x, pair);
  if (seconds === c.answer) return false;
  switch (code) {
    case 'base-100': {
      // A span worked out as hundreds (11:15 − 9:40 = 1.75 → 1 h 75 min).
      const s = c.span;
      if (s?.ask === 'length' && s.start !== undefined && s.end !== undefined) {
        const d = asHundreds(s.end) - asHundreds(s.start);
        return d > 0 && x.h === Math.floor(d / 100) && x.m === d % 100;
      }
      // Minutes into hours and minutes by hundreds (150 min → 1 h 50 min).
      if (c.convert) {
        const total = Math.round(c.convert.from / MINUTE);
        if (pair === 'h-min') return x.h === Math.floor(total / 100) && x.m === total % 100;
        const secs = Math.round(c.convert.from);
        return x.m === Math.floor(secs / 100) && x.s === secs % 100;
      }
      return false;
    }
    case 'count-endpoints': {
      const s = c.span;
      if (s?.ask !== 'length' || s.start === undefined || s.end === undefined) return false;
      return seconds === c.answer + HOUR && crossesHour(s.start, s.end);
    }
    default:
      return false;
  }
}

function wholeShows(code: MisconceptionCode, c: TimeContext, n: number): boolean {
  if (c.form !== 'whole' || n === c.answer) return false;
  switch (code) {
    case 'base-100': {
      if (!c.convert) return false;
      const t = Math.round(c.convert.from);
      // 2 h 15 min = 215 min; 1 min 15 s = 115 s.
      if (c.convert.to === 'min') return n === Math.floor(t / HOUR) * 100 + Math.floor((t % HOUR) / MINUTE);
      if (c.convert.to === 's') return n === Math.floor(t / MINUTE) * 100 + (t % MINUTE);
      return false;
    }
    case 'count-endpoints': {
      // Whole hours between two times, counted by the hour marks.
      const s = c.span;
      return s?.ask === 'length' && s.start !== undefined && s.end !== undefined && crossesHour(s.start, s.end) && n === c.answer + 1;
    }
    default:
      return false;
  }
}

/** Does a span pass at least one hour mark (counting the marks then counts one too many)? */
function crossesHour(start: number, end: number): boolean {
  const e = end < start ? end + DAY : end;
  return Math.floor(e / HOUR) > Math.floor(start / HOUR) || start % HOUR === 0;
}

/** The first declared code a written time shows. */
export function diagnoseTime(codes: readonly MisconceptionCode[], c: TimeContext, x: Written): MisconceptionCode | null {
  return codes.find((code) => timeShows(code, c, x)) ?? null;
}

/** The time context of a task's written part (its form, answer, `convert` and `span`). */
export function timeContextOf(_task: Task, spec: InputSpec, answer: AnswerValue): TimeContext | null {
  const form = spec.form;
  if (form !== 'time12' && form !== 'time24' && form !== 'face' && form !== 'duration' && form !== 'whole') return null;
  const value = 'kind' in answer ? (answer.kind === 'clock' || answer.kind === 'dur' ? answer.t : null) : answer.d === 1 ? answer.n : null;
  if (value === null) return null;
  const to = spec.convert?.to ?? (form === 'whole' ? 'min' : 'h');
  return {
    form,
    answer: value,
    convert: spec.convert ? { from: spec.convert.from.t, to } : undefined,
    span: spec.span ? { start: spec.span.start, end: spec.span.end, length: spec.span.length?.t, ask: spec.span.ask } : undefined,
    pair: form === 'duration' ? durationBoxes(spec) : undefined,
  };
}
