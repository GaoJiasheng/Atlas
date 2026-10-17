/**
 * The TIME card (docs/19 §3.0 G3, docs/20 §3): a time of day as the lesson
 * writes it (the notation's 12-hour time with am / pm), its reading ("twenty
 * past seven" /「七点二十分」) and the other clock (24-hour, or 12-hour for a
 * 24-hour time); a duration in its units and in words. The clock and the
 * timeline (model A3) show their time here; on a check the card holds the
 * span's given times and what the child has written — never the answer
 * before the check is done.
 */
import { useContext } from 'react';
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import { NotationContext } from '../../../../lib/rich-text';
import type { Task } from '../../schema';
import { inputSpecOf, type TaskState } from '../../lib/state';
import { clockText, DEFAULT_NOTATION, durationText, type ClockMode, type DurUnit, type Notation } from '../../lib/value';
import { clockPastWords, clockWords, durationWords } from '../../lib/words';
import { answerValues, durationBoxes, readWritten, writtenClock, writtenDuration } from '../../lib/forms';
import { clockShown } from '../../lib/clock';
import { CardRows, type CardRow } from './CardRows';

/** The readings of a time of day: shown, in words (the "past" reading on a face), and on the other clock. */
export function timeRows(at: number, mode: ClockMode, locale: Locale, notation: Notation = DEFAULT_NOTATION): CardRow[] {
  const other: ClockMode = mode === '24' ? '12' : '24';
  return [
    { key: 'math.card.time', value: clockText(at, mode, notation, locale, true), big: true },
    { key: 'math.card.read', value: mode === 'face' ? clockPastWords(at, locale) : clockWords(at, mode, locale) },
    ...(mode === 'face' ? [] : [{ key: other === '24' ? ('math.card.clock24' as const) : ('math.card.clock12' as const), value: clockText(at, other, notation, locale, true) }]),
  ];
}

/** The readings of a duration. */
export function durationRows(seconds: number, units: DurUnit[], locale: Locale): CardRow[] {
  return [
    { key: 'math.card.duration', value: durationText(seconds, units, locale), big: true },
    { key: 'math.card.read', value: durationWords(seconds, units, locale) },
  ];
}

/** A check's rows: the span's given times, the conversion's duration, then what the child wrote (or, once done, the answer). */
export function timeTaskRows(task: Task, state: TaskState, done: boolean, locale: Locale, notation: Notation): CardRow[] {
  const spec = inputSpecOf(task);
  if (!spec) return [];
  const mode: ClockMode = spec.form === 'time24' ? '24' : spec.form === 'face' ? 'face' : '12';
  const rows: CardRow[] = [];
  const sp = spec.span;
  const shown = (v: number) => clockText(v, mode, notation, locale, true);
  const answer = answerValues(spec)[0];
  const at = answer && 'kind' in answer && (answer.kind === 'clock' || answer.kind === 'dur') ? answer.t : null;
  const units: DurUnit[] = durationBoxes(spec) === 'min-s' ? ['m', 's'] : ['h', 'm'];
  // The span's times: the one asked is ? until the check is done.
  const asked = (which: 'start' | 'end' | 'length', known: string | null) => (sp?.ask === which ? (done && at !== null ? (which === 'length' ? durationText(at, units, locale) : shown(at)) : '?') : known);
  if (sp && (sp.start !== undefined || sp.ask === 'start')) rows.push({ key: 'math.card.start', value: asked('start', sp.start !== undefined ? shown(sp.start) : null)!, tone: 'cold' });
  if (sp && (sp.length || sp.ask === 'length')) rows.push({ key: 'math.card.length', value: asked('length', sp.length ? durationText(sp.length.t, sp.length.units, locale) : null)! });
  if (sp && (sp.end !== undefined || sp.ask === 'end')) rows.push({ key: 'math.card.end', value: asked('end', sp.end !== undefined ? shown(sp.end) : null)!, tone: 'hot' });
  if (spec.convert) rows.push({ key: 'math.card.duration', value: durationText(spec.convert.from.t, spec.convert.from.units, locale) });
  if (done && at !== null && answer && 'kind' in answer) {
    // Done: the answer's readings (a span's asked time is already in its row).
    if (answer.kind === 'clock') return [...rows, ...timeRows(at, mode, locale, notation).filter((r) => !(sp && r.key === 'math.card.time'))];
    return [...rows, ...durationRows(at, units, locale).filter((r) => !(sp && r.key === 'math.card.duration'))];
  }
  const w = readWritten(spec, state.input)?.[0];
  if (w?.kind === 'clock') {
    const at = writtenClock(w);
    rows.push({ key: 'math.card.written', value: at === null ? '—' : clockText(at, mode, notation, locale, true), tone: 'signal' });
    if (at !== null && mode !== 'face') rows.push({ key: 'math.card.read', value: clockWords(at, mode, locale) });
  } else if (w?.kind === 'dur') {
    const s = writtenDuration(w, durationBoxes(spec));
    rows.push({ key: 'math.card.written', value: s === null ? '—' : durationText(s, durationBoxes(spec) === 'min-s' ? ['m', 's'] : ['h', 'm'], locale), tone: 'signal' });
  } else if (w?.kind === 'whole') rows.push({ key: 'math.card.written', value: String(w.n), tone: 'signal' });
  return rows;
}

/** A set-clock check: the time asked for (it is the task's sentence) and what the hands show. */
export function setClockRows(task: Task, state: TaskState, locale: Locale, notation: Notation): CardRow[] {
  if (task.kind !== 'set-clock') return [];
  const mode: ClockMode = task.ampm ? '12' : 'face';
  const rows: CardRow[] = [{ key: 'math.card.target', value: clockText(task.target, mode, notation, locale, true), tone: 'cold' }];
  if (state.clock === null) return rows;
  const at = clockShown(task, state.clock);
  return [...rows, { key: 'math.card.set', value: clockText(at, mode, notation, locale, true), tone: 'signal' }, { key: 'math.card.read', value: mode === 'face' ? clockPastWords(at, locale) : clockWords(at, mode, locale) }];
}

/** What a beat's clock or timeline shows: a time of day (in the face's way of reading), or a duration (a stopwatch, the jumps on a duration scale). */
export type TimeShown = { at: number; mode: ClockMode } | { seconds: number; units: DurUnit[] };

export function TimeCard({ task, state, done, time, locale }: { task: Task | null; state: TaskState | null; done: boolean; time?: TimeShown | null; locale: Locale }) {
  const notation = useContext(NotationContext);
  const rows =
    task && state
      ? task.kind === 'set-clock'
        ? setClockRows(task, state, locale, notation)
        : timeTaskRows(task, state, done, locale, notation)
      : time
        ? 'at' in time
          ? timeRows(time.at, time.mode, locale, notation)
          : durationRows(time.seconds, time.units, locale)
        : [];
  if (rows.length === 0)
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.timeNone')}</p>
      </div>
    );
  return <CardRows rows={rows} />;
}
