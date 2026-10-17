/**
 * The written part of a task in the forms beyond fractions (docs/19 §3.0 G2,
 * docs/20 §3.4): the boxes each form has, what the child wrote (`Written`,
 * raw: `10:95` and `1 h 75 min` are kept as written so the diagnosis can see
 * them), whether it equals the answer, the boxes an answer fills (solve) and
 * the boxes a sample answer fills (`sampleState`). Fractions keep their own
 * boxes (`inputRows` in check.ts). Pure.
 *
 * Boxes (field ids in `TaskState.input`):
 *   whole / measure  `w` (or `w0`, `w1` … one per `?` of a sentence); measure adds the unit chip `u`
 *   remainder        `q`, `r` (an empty remainder box is 0)
 *   time12           `h`, `m` (`s` when the answer has seconds) and the am / pm toggle `ap`
 *   face / time24    `h`, `m` (`s`)
 *   duration         `h`, `m` (hours and minutes) or `m`, `s` (minutes and seconds)
 */
import type { InputSpec } from '../schema';
import { clockParts, durationParts, isFracValue, MINUTE, HOUR, type AnswerValue, type ClockMode } from './value';

export type Written =
  | { kind: 'whole'; n: number }
  | { kind: 'rem'; q: number; r: number }
  | { kind: 'clock'; mode: ClockMode; h: number; m: number; s: number; ap: 'am' | 'pm' | null }
  | { kind: 'dur'; h: number; m: number; s: number };

export const isTimeForm = (form: InputSpec['form']): form is 'time12' | 'time24' | 'face' | 'duration' => form === 'time12' || form === 'time24' || form === 'face' || form === 'duration';
/** Forms with a whole number in each box (and the unit chip of a measure). */
export const isWholeForm = (form: InputSpec['form']): form is 'whole' | 'measure' => form === 'whole' || form === 'measure';
/** Forms this module writes (everything but the fraction boxes). */
export const isValueForm = (form: InputSpec['form']): boolean => isWholeForm(form) || form === 'remainder' || isTimeForm(form);

export const answerValues = (spec: InputSpec): AnswerValue[] => (Array.isArray(spec.answer) ? spec.answer : [spec.answer]);

/** Has the answer seconds (a box for them)? */
function withSeconds(spec: InputSpec): boolean {
  const a = answerValues(spec)[0];
  if (!a || isFracValue(a)) return false;
  if (a.kind === 'clock') return a.t % MINUTE !== 0;
  return false;
}

/** The two boxes of a duration: hours and minutes, or minutes and seconds. */
export function durationBoxes(spec: InputSpec): 'h-min' | 'min-s' {
  if (spec.units) return spec.units;
  const a = answerValues(spec)[0];
  return a && !isFracValue(a) && a.kind === 'dur' && a.units.includes('s') ? 'min-s' : 'h-min';
}

/** The digit boxes of a value form, in order (Tab order). */
export function valueFields(spec: InputSpec): string[] {
  const n = answerValues(spec).length;
  switch (spec.form) {
    case 'whole':
    case 'measure':
      return n > 1 ? Array.from({ length: n }, (_, i) => `w${i}`) : ['w'];
    case 'remainder':
      return ['q', 'r'];
    case 'time12':
    case 'time24':
    case 'face':
      return withSeconds(spec) ? ['h', 'm', 's'] : ['h', 'm'];
    case 'duration':
      return durationBoxes(spec) === 'min-s' ? ['m', 's'] : ['h', 'm'];
    default:
      return [];
  }
}

/** Digits a box takes. */
export function fieldDigits(spec: InputSpec, field: string): number {
  if (isWholeForm(spec.form) || field === 'q') return 5;
  if (field === 'r') return 3;
  if (spec.form === 'duration') return field === 'h' ? 2 : 3;
  return 2;
}

const num = (s: string | undefined): number | null => (s === undefined || s === '' || !/^\d+$/.test(s) ? null : Number(s));

/** What the child wrote (`null` while a box is empty or the am / pm is not chosen). */
export function readWritten(spec: InputSpec, input: Readonly<Record<string, string>>): Written[] | null {
  const fields = valueFields(spec);
  switch (spec.form) {
    case 'whole':
    case 'measure': {
      const out: Written[] = [];
      for (const f of fields) {
        const n = num(input[f]);
        if (n === null) return null;
        out.push({ kind: 'whole', n });
      }
      return out;
    }
    case 'remainder': {
      const q = num(input.q);
      if (q === null) return null;
      return [{ kind: 'rem', q, r: num(input.r) ?? 0 }];
    }
    case 'time12':
    case 'time24':
    case 'face': {
      const h = num(input.h);
      const m = num(input.m);
      const s = fields.includes('s') ? num(input.s) : 0;
      if (h === null || m === null || s === null) return null;
      const ap = spec.form === 'time12' ? (input.ap === 'am' || input.ap === 'pm' ? input.ap : null) : null;
      if (spec.form === 'time12' && !ap) return null;
      return [{ kind: 'clock', mode: spec.form === 'time24' ? '24' : spec.form === 'face' ? 'face' : '12', h, m, s, ap }];
    }
    case 'duration': {
      const pair = durationBoxes(spec);
      const a = num(input[pair === 'min-s' ? 'm' : 'h']);
      const b = num(input[pair === 'min-s' ? 's' : 'm']);
      if (a === null || b === null) return null;
      return [pair === 'min-s' ? { kind: 'dur', h: 0, m: a, s: b } : { kind: 'dur', h: a, m: b, s: 0 }];
    }
    default:
      return null;
  }
}

/** A written time of day in seconds since midnight, when it is a real time in its form (`null`: 10:95, 13 o'clock on a 12-hour clock …). */
export function writtenClock(w: Extract<Written, { kind: 'clock' }>): number | null {
  if (w.m > 59 || w.s > 59) return null;
  if (w.mode === '24') return w.h > 23 ? null : w.h * HOUR + w.m * MINUTE + w.s;
  if (w.h < 1 || w.h > 12) return null;
  const h24 = (w.h % 12) + (w.ap === 'pm' ? 12 : 0);
  return h24 * HOUR + w.m * MINUTE + w.s;
}

/** A written duration in seconds, when every box but the first is under 60 (`null`: 1 h 75 min). */
export function writtenDuration(w: Extract<Written, { kind: 'dur' }>, pair: 'h-min' | 'min-s'): number | null {
  if (pair === 'h-min' ? w.m > 59 : w.s > 59) return null;
  return w.h * HOUR + w.m * MINUTE + w.s;
}

/** Is what the child wrote the answer? (a face reading ignores am / pm). */
export function writtenEquals(spec: InputSpec, w: Written, answer: AnswerValue): boolean {
  if (isFracValue(answer)) return answer.d === 1 && !answer.w && ((w.kind === 'whole' && w.n === answer.n) || (w.kind === 'rem' && w.r === 0 && w.q === answer.n));
  if (answer.kind === 'rem') return w.kind === 'rem' && w.q === answer.q && w.r === answer.r;
  if (answer.kind === 'clock') {
    if (w.kind !== 'clock') return false;
    const t = writtenClock(w);
    if (t === null) return false;
    return w.mode === 'face' ? t % (12 * HOUR) === answer.t % (12 * HOUR) : t === answer.t;
  }
  return answer.kind === 'dur' && w.kind === 'dur' && writtenDuration(w, durationBoxes(spec)) === answer.t;
}

/** The boxes an answer fills (solve, "Show me"). */
export function valueBoxes(spec: InputSpec, values: readonly AnswerValue[]): Record<string, string> {
  const out: Record<string, string> = {};
  const fields = valueFields(spec);
  const a = values[0];
  if (!a) return out;
  if (isFracValue(a) && spec.form === 'remainder') return { q: String(a.n), r: '0' };
  if (isFracValue(a)) {
    fields.forEach((f, i) => {
      const v = values[i];
      if (v && isFracValue(v)) out[f] = String(v.n);
    });
    return out;
  }
  if (a.kind === 'rem') return { q: String(a.q), r: String(a.r) };
  if (a.kind === 'clock') {
    const p = clockParts(a.t);
    out.h = String(spec.form === 'time24' ? p.h24 : p.h12);
    out.m = String(p.m).padStart(2, '0');
    if (fields.includes('s')) out.s = String(p.s).padStart(2, '0');
    if (spec.form === 'time12') out.ap = p.pm ? 'pm' : 'am';
    return out;
  }
  if (a.kind !== 'dur') return out;
  const p = durationParts(a.t, durationBoxes(spec) === 'min-s' ? ['m', 's'] : ['h', 'm']);
  if (durationBoxes(spec) === 'min-s') return { m: String(p.m), s: String(p.s) };
  return { h: String(p.h), m: String(p.m) };
}

/**
 * The boxes of a sample answer in the form's notation (docs/06 MathScene):
 * whole `"56"` (a sentence `"35,7,42"`), remainder `"3 r 2"` or `"3"`,
 * time12 `"7:20 pm"`, face `"7:20"`, time24 `"19:20"`, duration `"1h75m"` /
 * `"2m15s"` — written as the child would, so `"10:95"` and `"1h75m"` stand.
 */
export function sampleBoxes(spec: InputSpec, text: string): Record<string, string> | null {
  const t = text.trim();
  switch (spec.form) {
    case 'whole':
    case 'measure': {
      const parts = t.split(',').map((x) => x.trim());
      const fields = valueFields(spec);
      if (parts.length !== fields.length || !parts.every((x) => /^\d{1,5}$/.test(x))) return null;
      return Object.fromEntries(fields.map((f, i) => [f, parts[i]!]));
    }
    case 'remainder': {
      const m = /^(\d{1,5})(?:\s*r\s*(\d{1,3}))?$/.exec(t);
      return m ? { q: m[1]!, r: m[2] ?? '' } : null;
    }
    case 'time12':
    case 'time24':
    case 'face': {
      const m = /^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i.exec(t);
      if (!m) return null;
      const out: Record<string, string> = { h: m[1]!, m: m[2]! };
      if (valueFields(spec).includes('s')) out.s = m[3] ?? '00';
      if (spec.form === 'time12') {
        if (!m[4]) return null;
        out.ap = m[4].toLowerCase().startsWith('p') ? 'pm' : 'am';
      }
      return out;
    }
    case 'duration': {
      const m = /^(?:(\d{1,2})h)?(?:(\d{1,3})m)?(?:(\d{1,3})s)?$/.exec(t.replace(/\s+/g, ''));
      if (!m || (m[1] === undefined && m[2] === undefined && m[3] === undefined)) return null;
      return durationBoxes(spec) === 'min-s' ? { m: m[2] ?? '0', s: m[3] ?? '0' } : { h: m[1] ?? '0', m: m[2] ?? '0' };
    }
    default:
      return null;
  }
}

/** What the child wrote, as a mono caption ("your attempts"): `56`, `3 R 2`, `7:20 PM`, `1 H 75 MIN`. */
export function writtenLabel(w: Written): string {
  switch (w.kind) {
    case 'whole':
      return String(w.n);
    case 'rem':
      return `${w.q} R ${w.r}`;
    case 'clock':
      return `${w.h}:${String(w.m).padStart(2, '0')}${w.s ? `:${String(w.s).padStart(2, '0')}` : ''}${w.ap ? ` ${w.ap.toUpperCase()}` : ''}`;
    case 'dur':
      return [w.h ? `${w.h} H` : '', w.m || (!w.h && !w.s) ? `${w.m} MIN` : '', w.s ? `${w.s} S` : ''].filter(Boolean).join(' ');
  }
}
