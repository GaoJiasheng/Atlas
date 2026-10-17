/**
 * The clock face (docs/20 §3.1, model A3a; lib/clock.ts): the hands point as
 * on a real clock (hour = 30h + 0.5m + s/120, minute = 6m + 0.1s, second =
 * 6s), dragging the minute hand past 12 moves the hour on or back (and with
 * am / pm, past noon flips it), the hour hand moves in whole hours, a tapped
 * number puts the minute hand there, `faulty` draws a clock wrong on purpose
 * and only where validate allows it; the `read-clock` and `set-clock` checks,
 * their solutions, samples and diagnoses; the PLATE rows and the TIME card.
 */
import { describe, expect, it } from 'vitest';
import { model as modelSchema, taskSchema, type MisconceptionCode, type Model, type Task } from '../../src/engines/math-scene/schema';
import { clockSetRight, dial, dragHour, dragMinute, handAngles, hourAngle, minuteAngle, nudge, onDial, pointerAngle, secondAngle, sweepMs, toNumeral, turn } from '../../src/engines/math-scene/lib/clock';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, inputSpecOf, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { valueModelIssues, valueTaskIssues } from '../../src/engines/math-scene/validate-values';
import { valuePlateRows } from '../../src/engines/math-scene/hud/plate';
import { setClockRows } from '../../src/engines/math-scene/hud/cards/TimeCard';
import { workingLines } from '../../src/engines/math-scene/lib/working';
import { cardKindOf } from '../../src/engines/math-scene/hud/cards';
import { DEFAULT_NOTATION, parseClock } from '../../src/engines/math-scene/lib/value';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = []): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: wrong.map(([when, sample]) => ({ when, say: T, sample })) }, ...fields });
}
const m = (fields: Record<string, unknown>) => modelSchema.parse({ kind: 'clock', ...fields }) as Model;
const at = (s: string) => parseClock(s)!;
const values = (rows: { value: string }[]) => rows.map((r) => r.value).join(' | ');

describe('the hands', () => {
  it('point as on a real clock', () => {
    const cases: [string, number, number][] = [
      ['00:00', 0, 0],
      ['03:30', 105, 180],
      ['02:45', 82.5, 270],
      ['11:59', 359.5, 354],
      ['12:00', 0, 0],
    ];
    for (const [time, hour, minute] of cases) {
      expect(dial(hourAngle(at(time))), time).toBeCloseTo(hour, 6);
      expect(dial(minuteAngle(at(time))), time).toBeCloseTo(minute, 6);
    }
    // 23:59:59: the hour hand 1/120° short of 12, the minute hand 0.1° short, the second hand on 354°.
    const t = at('23:59:59');
    expect(dial(hourAngle(t))).toBeCloseTo(360 - 1 / 120, 6);
    expect(dial(minuteAngle(t))).toBeCloseTo(359.9, 6);
    expect(dial(secondAngle(t))).toBeCloseTo(354, 6);
  });

  it('keeps unbounded angles, so a sweep turns the right way round', () => {
    expect(minuteAngle(at('03:30')) - minuteAngle(at('03:00'))).toBe(180);
    expect(minuteAngle(at('02:45')) - minuteAngle(at('03:40'))).toBe(-330);
    expect(sweepMs(at('03:00'), at('03:00'))).toBe(0);
    expect(sweepMs(at('03:00'), at('09:00'))).toBe(900);
    expect(sweepMs(at('03:00'), at('03:05'))).toBeLessThan(sweepMs(at('03:00'), at('04:00')));
  });

  it('draws a faulty clock wrong on purpose', () => {
    const t = at('04:30');
    expect(dial(handAngles(t, 'hour-on-numeral').hour)).toBe(120);
    expect(dial(handAngles(t).hour)).toBe(135);
    expect(handAngles(t, 'hands-swapped').swapped).toBe(true);
  });
});

describe('moving the hands', () => {
  it('reads the pointer clockwise from 12 and turns the short way', () => {
    expect(pointerAngle(0, -10)).toBe(0);
    expect(pointerAngle(10, 0)).toBe(90);
    expect(pointerAngle(0, 10)).toBe(180);
    expect(pointerAngle(-10, 0)).toBe(270);
    expect(turn(350, 10)).toBe(20);
    expect(turn(10, 350)).toBe(-20);
  });

  it('drags the minute hand past 12: the hour moves on or back, the hour hand follows', () => {
    // 3:55 → the minute hand dragged to 3 minutes past: 4:03 (snap 1), 4:05 (snap 5).
    expect(dragMinute(at('03:55'), 18, 1, false)).toBe(at('04:03'));
    expect(dragMinute(at('03:55'), 18, 5, false)).toBe(at('04:05'));
    // Back past 12: 4:02 → 57 minutes: 3:57.
    expect(dragMinute(at('04:02'), 342, 1, false)).toBe(at('03:57'));
    // Without am / pm the clock stays on its 12 hours; with it, noon flips am to pm.
    expect(dragMinute(at('11:55'), 30, 5, false)).toBe(at('00:05'));
    expect(dragMinute(at('11:55'), 30, 5, true)).toBe(at('12:05'));
    expect(dragMinute(at('00:05'), 330, 5, true)).toBe(at('23:55'));
  });

  it('drags the hour hand in whole hours, the minutes kept', () => {
    expect(dragHour(at('03:20'), 120, false)).toBe(at('04:20'));
    expect(dragHour(at('03:20'), 300, false)).toBe(at('10:20'));
    expect(dragHour(at('11:20'), 10, true)).toBe(at('12:20'));
  });

  it('puts the minute hand on a tapped number; steps by the snap; wraps on the dial', () => {
    expect(toNumeral(at('07:42'), 4, false)).toBe(at('07:20'));
    expect(toNumeral(at('07:42'), 12, false)).toBe(at('07:00'));
    expect(nudge(at('09:10'), 5 * 60, 5, false)).toBe(at('09:15'));
    expect(nudge(at('11:59'), 60, 1, false)).toBe(at('00:00'));
    expect(onDial(at('14:50'), false)).toBe(at('02:50'));
    expect(onDial(-60, true)).toBe(at('23:59'));
  });
});

describe('set-clock', () => {
  const t = task({ kind: 'set-clock', model: { kind: 'clock', time: '12:00' }, target: '09:15', snap: 5 }, [
    ['next-hour', '10:15'],
    ['five-count-slip', '9:20'],
  ]);
  it('starts unset at the model’s time and checks the 12-hour position', () => {
    const s = initialState(t);
    expect(s.clock).toBeNull();
    expect(check(t, s).ok).toBe(false);
    expect(check(t, reduce(t, s, { do: 'clock', t: at('21:15') })).ok).toBe(true);
    expect(clockSetRight(t, at('09:15'))).toBe(true);
    // The minute hand snaps to 5 minutes.
    expect(reduce(t, s, { do: 'clock', t: at('09:17') }).clock).toBe(at('09:15'));
  });
  it('diagnoses through diagnoseTime; proves', () => {
    expect(check(t, sampleState(t, '10:15')!).code).toBe('next-hour');
    expect(check(t, sampleState(t, '9:20')!).code).toBe('five-count-slip');
    expect(proveTask(t)).toEqual([]);
    expect(solve(t)).toEqual([{ do: 'clock', t: at('09:15') }]);
  });
  it('with am / pm the plate counts', () => {
    const pm = task({ kind: 'set-clock', model: { kind: 'clock', time: '12:00', ampm: 'show' }, target: '14:50', snap: 1, ampm: true }, [['am-pm', '2:50 am']]);
    expect(check(pm, sampleState(pm, '2:50 am')!).code).toBe('am-pm');
    expect(check(pm, sampleState(pm, '2:50 pm')!).ok).toBe(true);
    expect(proveTask(pm)).toEqual([]);
  });
  it('writes the clock’s time on the line and the card once the hands move; PLATE TIME · HAND · NOTATION', () => {
    const s = reduce(t, initialState(t), { do: 'clock', t: at('10:15') });
    expect(workingLines(t, initialState(t), 'en')).toEqual([]);
    expect(workingLines(t, s, 'en')).toEqual(['{t:10:15|face}']);
    expect(values(setClockRows(t, s, 'en', DEFAULT_NOTATION))).toBe('9.15 | 10.15 | quarter past ten');
    expect(values(valuePlateRows(t.model, t, s, false)!)).toBe('CLOCK | 10.15 | H · M | H.MM');
    expect(cardKindOf(t.model, t, 'fraction')).toBe('time');
  });
  it('validate: one plain face, the target on the snap, not set already', () => {
    expect(valueTaskIssues(task({ kind: 'set-clock', model: { kind: 'clock', time: '09:15' }, target: '09:15' }), undefined)).toContain('the clock starts at the time to set');
    expect(valueTaskIssues(task({ kind: 'set-clock', model: { kind: 'clock' }, target: '09:17', snap: 5 }), undefined)).toContain('09:17 is not on a 5-minute step');
    expect(valueTaskIssues(task({ kind: 'set-clock', model: { kind: 'clock', faulty: 'hands-swapped' }, target: '09:15' }), undefined).join()).toMatch(/faulty clocks are for beats/);
    expect(valueTaskIssues(task({ kind: 'set-clock', model: { kind: 'clock' }, target: '09:15' }, [['am-pm', '9:15 pm']]), undefined).join()).toMatch(/am-pm.*cannot be diagnosed/);
  });
});

describe('read-clock', () => {
  const t = task({ kind: 'read-clock', model: { kind: 'clock', time: '07:20' }, answer: '07:20', form: 'face' }, [
    ['numeral-as-minutes', '7:04'],
    ['hands-swapped', '4:36'],
  ]);
  it('reads in its form, diagnoses, proves; the plate keeps the time back until it is read', () => {
    expect(inputSpecOf(t)?.form).toBe('face');
    expect(inputSpecOf(t)).toBe(inputSpecOf(t));
    expect(proveTask(t)).toEqual([]);
    expect(check(t, apply(t, solve(t))).ok).toBe(true);
    expect(values(valuePlateRows(t.model, t, initialState(t), false)!)).toBe('CLOCK | ? | H · M | H.MM');
    expect(values(valuePlateRows(t.model, t, apply(t, solve(t)), true)!)).toBe('CLOCK | 7.20 | H · M | H.MM');
  });
  it('a stopwatch is read as a duration', () => {
    const sw = task({ kind: 'read-clock', model: { kind: 'clock', face: 'stopwatch', elapsed: '75s' }, answer: '1m15s', form: 'duration' });
    expect(proveTask(sw)).toEqual([]);
    expect(valueTaskIssues(sw, undefined)).toEqual([]);
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', face: 'stopwatch', elapsed: '75s' }, answer: '1m25s', form: 'duration' }), undefined).join()).toMatch(/stopwatch shows/);
  });
  it('validate: the answer is the clock’s time; a face reading asks no am / pm', () => {
    expect(valueTaskIssues(t, undefined)).toEqual([]);
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', time: '07:25' }, answer: '07:20', form: 'face' }), undefined)).toContain('the clock shows 07:25, the answer is 07:20');
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', time: '19:20' }, answer: '07:20', form: 'face' }), undefined)).toEqual([]);
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', time: '19:20' }, answer: '07:20', form: 'time12' }), undefined).join()).toMatch(/clock shows 19:20/);
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', time: '07:20', ampm: 'ask' }, answer: '07:20', form: 'face' }), undefined).join()).toMatch(/does not ask am or pm/);
    expect(valueTaskIssues(task({ kind: 'read-clock', model: { kind: 'clock', time: '07:20', faulty: 'hour-on-numeral' }, answer: '07:20', form: 'face' }), undefined).join()).toMatch(/faulty/);
  });
  it('a 12-hour step reads no 24-hour clock', () => {
    const t24 = task({ kind: 'read-clock', model: { kind: 'clock', time: '19:20', inner24: true }, answer: '19:20', form: 'time24' });
    expect(valueTaskIssues(t24, { clock: '12h' }).join()).toMatch(/12-hour time only/);
  });
});

describe('choose: a faulty clock among the options', () => {
  it('is allowed in an option and diagnoses hour-hand-on-numeral', () => {
    const t = task(
      {
        kind: 'choose',
        model: { kind: 'clock', time: '04:30' },
        options: [
          { id: 'a', correct: true, model: { kind: 'clock', time: '04:30' } },
          { id: 'b', correct: false, misconception: 'hour-hand-on-numeral', model: { kind: 'clock', time: '04:30', faulty: 'hour-on-numeral' } },
        ],
      },
      [['hour-hand-on-numeral', 'b']],
    );
    expect(valueTaskIssues(t, undefined)).toEqual([]);
    expect(proveTask(t)).toEqual([]);
  });
});

describe('the clock model', () => {
  it('validate: a stopwatch has its elapsed time and nothing of a clock; arcs go forwards; pairs are labelled', () => {
    expect(valueModelIssues(m({ face: 'stopwatch' }))).toContain('a stopwatch needs elapsed');
    expect(valueModelIssues(m({ face: 'stopwatch', elapsed: '75s', ampm: 'show' })).join()).toMatch(/draws its own dial/);
    expect(valueModelIssues(m({ arc: { from: '04:30', to: '04:00' } })).join()).toMatch(/must end after it starts/);
    expect(valueModelIssues(m({ time: '03:00', hourTrack: { from: '04:00' } })).join()).toMatch(/hourTrack/);
    expect(valueModelIssues(m({ pair: [{ time: '04:30' }, { time: '04:30', faulty: 'hour-on-numeral' }] }))).toContain('each face of a pair needs a label');
    expect(valueModelIssues(m({ time: '03:40', minuteLabels: true, hourTrack: { from: '03:00' }, arc: { from: '03:10', to: '03:55' }, ampm: 'show' }))).toEqual([]);
  });
  it('PLATE rows of a beat: the time as the face reads it, the lit hands, the notation', () => {
    expect(values(valuePlateRows(m({ time: '19:40', ampm: 'show', lit: 'hour' }), null, null, false)!)).toBe('CLOCK | 7.40 PM | HOUR | H.MM AM');
    expect(values(valuePlateRows(m({ time: '19:40', inner24: true }), null, null, false)!)).toBe('CLOCK | 19:40 | H · M | HH:MM');
    expect(values(valuePlateRows(m({ face: 'stopwatch', elapsed: '75s' }), null, null, false)!)).toBe('CLOCK | 1 MIN 15 S | S · MIN | MIN · S');
  });
});
