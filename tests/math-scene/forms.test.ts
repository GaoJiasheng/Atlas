/**
 * The answer forms beyond fractions (docs/19 §3.0 G2, docs/20 §3.4;
 * lib/forms.ts, lib/check.ts): the boxes each form has, what a child's boxes
 * read as (kept raw), whether it is the answer, the boxes an answer and a
 * sample fill; whole numbers off the fraction models, sentences, remainders,
 * 12-hour, face and 24-hour times, durations; and the validation of forms,
 * facts, spans, conversions, diagnosable codes and the step's limits.
 */
import { describe, expect, it } from 'vitest';
import { taskSchema, type InputSpec, type MisconceptionCode, type Task } from '../../src/engines/math-scene/schema';
import { durationBoxes, readWritten, sampleBoxes, valueBoxes, valueFields, writtenEquals, answerValues } from '../../src/engines/math-scene/lib/forms';
import { answered, check, inputFields, usesValueBoxes } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, reduce } from '../../src/engines/math-scene/lib/state';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { answerTokens, workingLines } from '../../src/engines/math-scene/lib/working';
import { domainOf, valueTaskIssues } from '../../src/engines/math-scene/validate-values';
import { taskIssues } from '../../src/engines/math-scene/validate';

const T = { en: 'x', zh: 'x' };
function task(fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = []): Task {
  return taskSchema.parse({ id: 'probe', prompt: T, guide: T, hints: [T], feedback: { correct: T, fallback: T, reveal: T, wrong: wrong.map(([when, sample]) => ({ when, say: T, sample })) }, ...fields });
}
const line = { kind: 'numberline', scale: 'whole', from: 0, to: 60, step: 5 };
const rows = (r: number, c: number) => ({ kind: 'array', layout: 'rows', rows: r, cols: c });
const input = (fields: Record<string, unknown>, wrong: [MisconceptionCode, string][] = [], model: unknown = line) => task({ kind: 'input', model, ...fields }, wrong);
const spec = (t: Task) => t as unknown as InputSpec;

describe('boxes per form', () => {
  it('names the boxes of every form', () => {
    expect(valueFields(spec(input({ answer: 56, form: 'whole' })))).toEqual(['w']);
    expect(valueFields(spec(input({ answer: [16, 8, 24], form: 'whole', sentence: '? + ? = ?' })))).toEqual(['w0', 'w1', 'w2']);
    expect(valueFields(spec(input({ answer: '3 r 2', form: 'remainder' })))).toEqual(['q', 'r']);
    expect(valueFields(spec(input({ answer: '19:20', form: 'time12' })))).toEqual(['h', 'm']);
    expect(valueFields(spec(input({ answer: '15:05:30', form: 'time24' })))).toEqual(['h', 'm', 's']);
    expect(valueFields(spec(input({ answer: '1h35m', form: 'duration' })))).toEqual(['h', 'm']);
    expect(valueFields(spec(input({ answer: '2m15s', form: 'duration' })))).toEqual(['m', 's']);
    expect(durationBoxes(spec(input({ answer: '95m', form: 'duration', units: 'min-s' })))).toBe('min-s');
    expect(inputFields(spec(input({ answer: '3 r 2', form: 'remainder' })))).toEqual(['q', 'r']);
  });

  it('reads the boxes raw and compares them with the answer', () => {
    const t12 = spec(input({ answer: '19:20', form: 'time12' }));
    expect(readWritten(t12, { h: '7', m: '20' })).toBeNull();
    const w = readWritten(t12, { h: '7', m: '20', ap: 'pm' })![0]!;
    expect(writtenEquals(t12, w, answerValues(t12)[0]!)).toBe(true);
    expect(writtenEquals(t12, readWritten(t12, { h: '7', m: '20', ap: 'am' })![0]!, answerValues(t12)[0]!)).toBe(false);
    const face = spec(input({ answer: '19:20', form: 'face' }));
    expect(writtenEquals(face, readWritten(face, { h: '7', m: '20' })![0]!, answerValues(face)[0]!)).toBe(true);
    const raw = readWritten(spec(input({ answer: '11:35', form: 'time12' })), { h: '10', m: '95', ap: 'am' })![0]!;
    expect(raw).toEqual({ kind: 'clock', mode: '12', h: 10, m: 95, s: 0, ap: 'am' });
    const d = spec(input({ answer: '1h35m', form: 'duration' }));
    expect(writtenEquals(d, readWritten(d, { h: '0', m: '95' })![0]!, answerValues(d)[0]!)).toBe(false);
    expect(writtenEquals(d, readWritten(d, { h: '1', m: '35' })![0]!, answerValues(d)[0]!)).toBe(true);
    const rem = spec(input({ answer: '3 r 2', form: 'remainder' }));
    expect(readWritten(rem, { q: '3' })).toEqual([{ kind: 'rem', q: 3, r: 0 }]);
    const none = spec(input({ answer: 4, form: 'remainder' }));
    expect(writtenEquals(none, { kind: 'rem', q: 4, r: 0 }, answerValues(none)[0]!)).toBe(true);
  });

  it('fills the boxes of an answer and of a sample', () => {
    expect(valueBoxes(spec(input({ answer: '19:20', form: 'time12' })), answerValues(spec(input({ answer: '19:20', form: 'time12' }))))).toEqual({ h: '7', m: '20', ap: 'pm' });
    expect(valueBoxes(spec(input({ answer: '07:05', form: 'time24' })), answerValues(spec(input({ answer: '07:05', form: 'time24' }))))).toEqual({ h: '7', m: '05' });
    expect(valueBoxes(spec(input({ answer: '95m', form: 'duration' })), answerValues(spec(input({ answer: '95m', form: 'duration' }))))).toEqual({ h: '1', m: '35' });
    expect(sampleBoxes(spec(input({ answer: '19:20', form: 'time12' })), '7.20 p.m.')).toEqual({ h: '7', m: '20', ap: 'pm' });
    expect(sampleBoxes(spec(input({ answer: '19:20', form: 'time12' })), '7:20')).toBeNull();
    expect(sampleBoxes(spec(input({ answer: '1h35m', form: 'duration' })), '1h75m')).toEqual({ h: '1', m: '75' });
    expect(sampleBoxes(spec(input({ answer: '3 r 2', form: 'remainder' })), '3')).toEqual({ q: '3', r: '' });
    expect(sampleBoxes(spec(input({ answer: [16, 8], form: 'whole', sentence: '? ?' })), '16')).toBeNull();
  });

  it('keeps hours, minutes and remainders short; am / pm is a toggle', () => {
    const t = input({ answer: '19:20', form: 'time12' });
    let s = reduce(t, initialState(t), { do: 'input', field: 'h', value: '123' });
    expect(s.input.h).toBe('12');
    s = reduce(t, s, { do: 'input', field: 'ap', value: 'pm' });
    expect(s.input.ap).toBe('pm');
    expect(reduce(t, s, { do: 'input', field: 'ap', value: 'noon' })).toBe(s);
    expect(answered(t, s)).toBe(false);
  });
});

describe('checks and diagnoses in the new forms', () => {
  it('a whole number on a fraction model keeps the fraction boxes; elsewhere the value boxes', () => {
    expect(usesValueBoxes(input({ answer: 1, form: 'whole' }, [], { kind: 'circle', parts: 6, given: 6 }), spec(input({ answer: 1, form: 'whole' })))).toBe(false);
    expect(usesValueBoxes(input({ answer: 56, form: 'whole' }, [], rows(7, 8)), spec(input({ answer: 56, form: 'whole' })))).toBe(true);
  });

  it('proves tasks in every form', () => {
    const tasks = [
      input({ answer: 28, form: 'whole', op: { kind: '×', a: 4, b: 7 } }, [['added-not-multiplied', '11'], ['skip-count-slip', '24']], rows(4, 7)),
      input({ answer: '3 r 2', form: 'remainder', op: { kind: '÷', a: 14, b: 4 } }, [['remainder-too-big', '2 r 6'], ['remainder-dropped', '3']], rows(3, 4)),
      input({ answer: [5, 5], form: 'whole', sentence: '20 ÷ 4 = ?, ? × 4 = 20', op: { kind: '÷', a: 20, b: 4 } }, [['skip-count-slip', '6,5']], rows(4, 5)),
      input({ answer: '19:20', form: 'time12' }, [['am-pm', '7:20 am'], ['hands-swapped', '4:36 pm']]),
      input({ answer: '07:20', form: 'face' }, [['numeral-as-minutes', '7:04'], ['next-hour', '8:20']]),
      input({ answer: '15:15', form: 'time24' }, [['24h-offset', '13:15']]),
      input({ answer: '1h35m', form: 'duration', span: { start: '14:40', end: '16:15', ask: 'length' } }, [['base-100', '1h75m'], ['count-endpoints', '2h35m']]),
      input({ answer: '11:35', form: 'time12', span: { start: '10:45', length: '50m', ask: 'end' } }, [['base-100', '10:95 am'], ['wrong-direction', '9:55 am']]),
      input({ answer: 135, form: 'whole', convert: { from: '2h15m', to: 'min' } }, [['base-100', '215']]),
    ];
    for (const t of tasks) expect(proveTask(t), t.id).toEqual([]);
  });

  it('writes the number sentence: the fact with ?, then what is written, the answer once done', () => {
    const t = input({ answer: 28, form: 'whole', op: { kind: '×', a: 4, b: 7 } }, [], rows(4, 7));
    expect(workingLines(t, initialState(t), 'en')).toEqual(['4 × 7 = ?']);
    expect(workingLines(t, apply(t, [{ do: 'input', field: 'w', value: '27' }]), 'en')).toEqual(['4 × 7 = 27']);
    expect(answerTokens(t)).toBe('4 × 7 = 28');
    const e = input({ answer: '11:35', form: 'time12', span: { start: '10:45', length: '50m', ask: 'end' } });
    expect(workingLines(e, initialState(e), 'en')).toEqual(['{t:10:45} + {d:50m} = ?']);
    expect(workingLines(e, apply(e, solve(e)), 'en', true)).toEqual(['{t:10:45} + {d:50m} = {t:11:35}']);
    const m = input({ answer: '3 r 2', form: 'remainder', op: { kind: '÷', a: 14, b: 4 } }, [], rows(3, 4));
    expect(answerTokens(m)).toBe('14 ÷ 4 = 3 r 2');
    expect(check(m, sampleState(m, '3 r 2')!).ok).toBe(true);
  });
});

describe('validation of forms, facts and codes', () => {
  const issues = (t: Task, limits?: Record<string, unknown>) => valueTaskIssues(t, limits as never);
  it('puts every task in one domain', () => {
    expect(domainOf(input({ answer: 56, form: 'whole' }, [], rows(7, 8)))).toBe('whole-ops');
    expect(domainOf(input({ answer: '19:20', form: 'time12' }))).toBe('time');
    expect(domainOf(input({ answer: 1, form: 'whole' }, [], { kind: 'circle', parts: 6, given: 6 }))).toBe('fractions');
    const cross = input({ answer: 56, form: 'whole', op: { kind: '×', a: 7, b: 8 } }, [['am-pm', '55']], rows(7, 8));
    expect(taskIssues(cross, 'x', { bridge: false, practice: false }).map((i) => i.message)).toContain('x: "am-pm" is a time code, not one for whole-ops');
  });

  it('checks the answer against the form, the fact, the span and the conversion', () => {
    expect(issues(input({ answer: '19:20', form: 'duration' }))).toContain('answer 19:20 does not fit form "duration"');
    expect(issues(input({ answer: 29, form: 'whole', op: { kind: '×', a: 4, b: 7 } }, [], rows(4, 7)))).toContain('no answer is 28, the result of 4 × 7');
    expect(issues(input({ answer: '3 r 5', form: 'remainder', op: { kind: '÷', a: 14, b: 4 } }, [], rows(3, 4)))).toContain('remainder 5 is not less than 4');
    expect(issues(input({ answer: 3, form: 'whole', op: { kind: '÷', a: 14, b: 4 } }, [], rows(3, 4)))).toContain('14 ÷ 4 leaves 2: use form remainder, or round');
    expect(issues(input({ answer: '11:30', form: 'time12', span: { start: '10:45', length: '50m', ask: 'end' } }))).toContain('the answer is not the start plus the length');
    expect(issues(input({ answer: 125, form: 'whole', convert: { from: '2h15m', to: 'min' } }))).toContain('2h15m is 135 min, not 125');
  });

  it('rejects codes the task cannot diagnose', () => {
    expect(issues(input({ answer: 7, form: 'whole' }, [['carry-not-added', '6']], rows(7, 1)))).toContain('"carry-not-added" needs a multiplication (op ×)');
    expect(issues(input({ answer: '19:20', form: 'time24' }, [['am-pm', '7:20']]))).toContain('"am-pm" needs form time12');
    expect(issues(input({ answer: '19:20', form: 'time12' }, [['base-100', '7:20 am']]))).toContain('"base-100" needs a conversion (convert) or a span');
    expect(issues(input({ answer: 12, form: 'whole', op: { kind: '÷', a: 36, b: 3 } }, [['divide-order', '3']], rows(3, 12)))[0]).toMatch(/diagnosed by a choose option/);
  });

  it('keeps to the step’s limits', () => {
    const t = input({ answer: 28, form: 'whole', op: { kind: '×', a: 4, b: 7 } }, [], rows(4, 7));
    expect(issues(t, { factors: [2, 5] })).toContain('4 × 7: factors 2–5');
    expect(issues(t, { maxTotal: 20 })).toContain('a total of 28 (limit 20)');
    expect(issues(input({ answer: '3 r 2', form: 'remainder', op: { kind: '÷', a: 14, b: 4 } }, [], rows(3, 4)), { divisor: [5, 9] })).toContain('÷ 4: divisors 5–9');
    expect(issues(input({ answer: '19:22', form: 'time24' }), { step: 5, clock: '12h' })).toEqual(['this step reads 12-hour time only', '19:22 is not a whole number of 5 min']);
  });
});
