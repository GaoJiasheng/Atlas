/**
 * The timeline (docs/20 §3.2, model A3b; lib/timeline.ts): the range of a day,
 * a span or a duration scale and its marks; the child's jumps on a `duration`
 * check (chip presses, minute presses joined into one arc until an hour mark,
 * kept on the line), the solution's jumps (to the hour, whole hours, the
 * minutes left), the check, its samples and diagnoses, validate (the line
 * covers the span, the step stays within one day) and the PLATE rows.
 */
import { describe, expect, it } from 'vitest';
import { model as modelSchema, taskSchema, type MisconceptionCode, type Model, type Task, type TimelineSpec } from '../../src/engines/math-scene/schema';
import { canHop, hopArcs, hopEnd, hopsTo, hourMarks, jumpLabel, labelEvery, minorMarks, minorOf, rangeOf } from '../../src/engines/math-scene/lib/timeline';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, durationGoal, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, inputSpecOf, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { valueModelIssues, valueTaskIssues } from '../../src/engines/math-scene/validate-values';
import { valuePlateRows } from '../../src/engines/math-scene/hud/plate';
import { workingLines } from '../../src/engines/math-scene/lib/working';
import { DAY, HOUR, MINUTE, parseClock } from '../../src/engines/math-scene/lib/value';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = []): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: wrong.map(([when, sample]) => ({ when, say: T, sample })) }, ...fields });
}
const line = (fields: Record<string, unknown>) => modelSchema.parse({ kind: 'timeline', ...fields }) as TimelineSpec;
const at = (s: string) => parseClock(s)!;
const values = (rows: { value: string }[]) => rows.map((r) => r.value).join(' | ');

describe('the ruler', () => {
  it('covers a day, a span or a duration; hour and minor marks', () => {
    expect(rangeOf(line({ scale: 'day' }))).toEqual({ from: 0, to: DAY, duration: false });
    expect(rangeOf(line({ from: '09:00', to: '12:00' }))).toEqual({ from: at('09:00'), to: at('12:00'), duration: false });
    expect(rangeOf(line({ scale: 'duration', to: '120m' }))).toEqual({ from: 0, to: 2 * HOUR, duration: true });
    const r = rangeOf(line({ from: '09:30', to: '11:00' }));
    expect(hourMarks(r)).toEqual([at('10:00'), at('11:00')]);
    expect(minorMarks(r, 30)).toEqual([at('09:30'), at('10:30')]);
    expect(minorOf(line({ scale: 'day' }))).toBe(60);
    expect(minorOf(line({ from: '09:00', to: '12:00' }))).toBe(10);
    // 24 hours on 600 px: an hour is 25 px, labelled every 2nd (40 px) or every 3rd (58 px).
    expect(labelEvery(rangeOf(line({ scale: 'day' })), 600, 40)).toBe(2);
    expect(labelEvery(rangeOf(line({ scale: 'day' })), 600, 58)).toBe(3);
    expect(jumpLabel(at('09:40'), at('10:00'))).toBe('+ 20 min');
    expect(jumpLabel(at('16:10'), at('15:10'))).toBe('− 1 h');
    expect(jumpLabel(0, 95 * MINUTE)).toBe('+ 1 h 35 min');
  });

  it('validate: the range, marks and jumps on it', () => {
    expect(valueModelIssues(line({ scale: 'span', from: '09:00' }))).toContain('a span timeline needs from and to');
    expect(valueModelIssues(line({ from: '12:00', to: '09:00' })).join()).toMatch(/must go forwards/);
    expect(valueModelIssues(line({ from: '06:00', to: '13:00' })).join()).toMatch(/6 h at most/);
    expect(valueModelIssues(line({ scale: 'day', from: '00:00' })).join()).toMatch(/00:00–24:00/);
    expect(valueModelIssues(line({ from: '09:00', to: '12:00', marks: [{ at: '12:30' }] })).join()).toMatch(/off the line/);
    expect(valueModelIssues(line({ scale: 'duration', to: '120m', labels: 'both' })).join()).toMatch(/times of day/);
    expect(valueModelIssues(line({ scale: 'day', labels: 'both', bands: 'ampm', marks: [{ at: '07:00' }, { at: '19:00', tone: 'hot' }] }))).toEqual([]);
  });

  it('PLATE rows of a beat: from, to, jumped', () => {
    const jumps = line({ from: '09:00', to: '12:00', marks: [{ at: '09:40' }, { at: '11:15', tone: 'hot' }], jumps: [['09:40', '10:00'], ['10:00', '11:00'], ['11:00', '11:15']] });
    expect(values(valuePlateRows(jumps as Model, null, null, false)!)).toBe('TIMELINE | 9.40 AM | 11.15 AM | 1 h 35 min');
    expect(values(valuePlateRows(line({ scale: 'duration', to: '120m', jumps: [['0m', '60m'], ['60m', '95m']] }) as Model, null, null, false)!)).toBe('TIMELINE | 0 min | 1 h 35 min | 1 h 35 min');
  });
});

describe('the jumps of a duration check', () => {
  const length = task(
    { kind: 'duration', model: { kind: 'timeline', from: '09:00', to: '12:00' }, ask: 'length', start: '09:40', end: '11:15', answer: { answer: '1h35m', form: 'duration' } },
    [
      ['base-100', '1h75m'],
      ['count-endpoints', '2h35m'],
    ],
  );
  it('join minute presses until an hour mark; an hour press is its own arc', () => {
    const hops = [10 * MINUTE, 10 * MINUTE, HOUR, 10 * MINUTE, 5 * MINUTE];
    expect(hopArcs(length, hops)).toEqual([
      [at('09:40'), at('10:00')],
      [at('10:00'), at('11:00')],
      [at('11:00'), at('11:15')],
    ]);
    expect(hopEnd(length, hops)).toBe(at('11:15'));
  });
  it('stay on the line', () => {
    expect(canHop(length, [], HOUR)).toBe(true);
    expect(canHop(length, [HOUR, HOUR], HOUR)).toBe(false);
    expect(canHop(length, [], -HOUR)).toBe(false);
    const s = reduce(length, initialState(length), { do: 'hop', by: -HOUR });
    expect(s.hops).toEqual([]);
    const two = apply(length, [{ do: 'hop', by: HOUR }, { do: 'hop', by: 10 * MINUTE }, { do: 'unhop' }]);
    expect(two.hops).toEqual([HOUR]);
    expect(reduce(length, two, { do: 'clear' }).hops).toEqual([]);
  });
  it('the solution jumps to the hour, the whole hours, the minutes left, then writes the answer', () => {
    expect(hopsTo(at('09:40'), at('11:15'))).toEqual([10 * MINUTE, 10 * MINUTE, HOUR, 10 * MINUTE, 5 * MINUTE]);
    expect(hopsTo(at('16:10'), at('14:45'))).toEqual([-10 * MINUTE, -HOUR, -10 * MINUTE, -5 * MINUTE]);
    expect(hopsTo(at('10:45'), at('11:35'))).toEqual([10 * MINUTE, 5 * MINUTE, 10 * MINUTE, 10 * MINUTE, 10 * MINUTE, 5 * MINUTE]);
    const solved = apply(length, solve(length));
    expect(hopEnd(length, solved.hops)).toBe(at('11:15'));
    expect(check(length, solved).ok).toBe(true);
  });
  it('checks only the answer; diagnoses the span; proves', () => {
    expect(check(length, apply(length, [{ do: 'input', field: 'h', value: '1' }, { do: 'input', field: 'm', value: '35' }])).ok).toBe(true);
    expect(check(length, sampleState(length, '1h75m')!).code).toBe('base-100');
    expect(check(length, sampleState(length, '=2h35m')!).code).toBe('count-endpoints');
    expect(inputSpecOf(length)?.span).toEqual({ start: at('09:40'), end: at('11:15'), length: undefined, ask: 'length' });
    expect(proveTask(length)).toEqual([]);
    expect(workingLines(length, initialState(length), 'en')).toEqual(['{t:09:40} → {t:11:15} = ?']);
  });
  it('the start, found by jumping back', () => {
    const start = task(
      { kind: 'duration', model: { kind: 'timeline', from: '13:00', to: '16:00', labels: '24h' }, ask: 'start', end: '15:05', length: '40m', answer: { answer: '14:25', form: 'time24' } },
      [
        ['wrong-direction', '=15:45'],
        ['base-100', '=14:65'],
      ],
    );
    expect(durationGoal(start as Extract<Task, { kind: 'duration' }>)).toBe(at('14:25'));
    expect(proveTask(start)).toEqual([]);
    expect(values(valuePlateRows(start.model, start, apply(start, solve(start)), false)!)).toBe('TIMELINE | 15:05 | 14:25 | 40 min');
    expect(values(valuePlateRows(start.model, start, initialState(start), false)!)).toBe('TIMELINE | 15:05 | — | —');
  });
  it('validate: a timeline of times that covers the span; within one day', () => {
    expect(valueTaskIssues(length, undefined)).toEqual([]);
    const short = task({ kind: 'duration', model: { kind: 'timeline', from: '10:00', to: '11:00' }, ask: 'length', start: '09:40', end: '11:15', answer: { answer: '1h35m', form: 'duration' } });
    expect(valueTaskIssues(short, undefined).join()).toMatch(/off the timeline/);
    const wrong = task({ kind: 'duration', model: { kind: 'timeline', from: '09:00', to: '12:00' }, ask: 'length', start: '09:40', end: '11:15', answer: { answer: '1h25m', form: 'duration' } });
    expect(valueTaskIssues(wrong, undefined)).toContain('the answer is not the time from start to end');
    const night = task({ kind: 'duration', model: { kind: 'timeline', scale: 'day' }, ask: 'end', start: '23:30', length: '50m', answer: { answer: '00:20', form: 'time24' } });
    expect(valueTaskIssues(night, { sameDay: true }).join()).toMatch(/past midnight/);
    expect(valueTaskIssues(night, undefined).join()).not.toMatch(/past midnight/);
  });
});
