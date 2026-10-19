/**
 * The words and number sentences of a measuring check or beat (docs/32 §2.0,
 * §3.7): the facts an instrument gives (its unit, a number every so many,
 * what each small part stands for, where it reads), the sentence under the
 * model on a check — what the child has set, counted, compared, ordered or
 * written, `?` for what is still to write, never the answer before it is
 * done — and the answer line after "Show me". Quantities are `{u:…}` tokens
 * (`src/lib/rich-text.ts` shows and reads them). Pure.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { InputSpec, InstrumentSpec, Task } from '../schema';
import { SCALE } from './decimal';
import { answerValues, readWritten } from './forms';
import { partsOf, scaleOf, unitOf, type Scale } from './instrument';
import { measureWorkOf } from './measure-kind';
import { countParts, instrumentOf, printedUnit, qtyOrder, readingQty, setTarget, setValue } from './measure-tasks';
import { inputSpecOf, phasesOf, type TaskState } from './state';
import { baseToken, isFracValue, isQty, PAIR, qtyText, qtyToken, unitText, type QtyValue, type Unit } from './value';

const asText = (units: number): string => {
  const whole = Math.floor(units / SCALE);
  const rest = units % SCALE;
  return rest ? `${whole}.${String(rest).padStart(6, '0').replace(/0+$/, '')}` : String(whole);
};

/** A value of an instrument (millionths of its unit) as a token: `{u:280 g}`, on a two-unit scale `{u:1 m 32 cm}`. */
export function instrumentToken(s: InstrumentSpec, v: number): string {
  const q = readingQty(s, v);
  return q ? qtyToken(q) : asText(v);
}

/** The same as plain text for the card and the plate: `280 g`, `1 m 32 cm`. */
export function instrumentText(s: InstrumentSpec, v: number, locale: Locale): string {
  const q = readingQty(s, v);
  return q ? qtyText(q, locale) : asText(v);
}

/** A gap or a small part of a scale as a measure (`100 g`, `2 cm`: on a two-unit scale, in the small unit). */
export function stepText(s: InstrumentSpec, units: number, locale: Locale): string {
  return `${asText(units)} ${unitText(unitOf(s), locale)}`;
}

/** The facts an instrument gives: its unit, a number every so many, a small part. */
export interface ScaleFacts {
  unit: Unit;
  every: string;
  part: string;
  sc: Scale;
}

export function scaleFacts(s: InstrumentSpec, locale: Locale): ScaleFacts | null {
  const sc = scaleOf(s);
  if (!sc) return null;
  return { unit: unitOf(s), every: stepText(s, sc.major, locale), part: stepText(s, sc.minor, locale), sc };
}


/* ------------------------------------------------------------------ */
/* The number sentence of a check                                      */
/* ------------------------------------------------------------------ */

/** The sentence a conversion fills (`{u:3 kg 40 g} = ?`); the box prints the unit after it. */
export function convertSentence(spec: InputSpec): string | null {
  const w = measureWorkOf(spec);
  return w ? `${qtyToken(w.from)} = ?` : null;
}

/** What the child wrote, as a token in the unit it was written in (`{u:350 kg}`, `{u:1 m 50 cm}`), or `null`. */
function writtenToken(task: Task, spec: InputSpec, state: TaskState): string | null {
  if (spec.form === 'compound') {
    const w = readWritten(spec, state.input)?.[0];
    if (!w || w.kind !== 'cmp') return null;
    const { big, small } = PAIR[w.pair];
    return w.small > 0 ? `{u:${w.big} ${big} ${w.small} ${small}}` : `{u:${w.big} ${big}}`;
  }
  const raw = spec.form === 'decimal' ? state.input.x : state.input.w;
  if (!raw) return null;
  const unit = spec.form === 'measure' ? (state.input.u as Unit | undefined) : printedUnit(task, spec);
  return unit ? `{u:${raw} ${unit}}` : raw;
}

/** The answer written out (after "Show me", and the sentence once done). */
export function measureAnswerToken(task: Task, spec: InputSpec): string {
  const a = answerValues(spec)[0];
  if (!a) return '';
  if (isQty(a)) return qtyToken(a);
  const unit = printedUnit(task, spec);
  const v = isFracValue(a) ? String(a.n) : a.kind === 'dec' ? asText(a.units) : '';
  return unit ? `{u:${v} ${unit}}` : v;
}

const SYM = { '<': '<', '=': '=', '>': '>' } as const;

/** The number sentence of a measuring check (`?` until written; the answer only once done). */
export function measureLines(task: Task, state: TaskState, locale: Locale, done: boolean): string[] {
  const spec = inputSpecOf(task);
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const s = instrumentOf(task);
  switch (task.kind) {
    case 'set-scale': {
      if (!s) return [];
      if (task.mode === 'weights') return state.mweights.length ? [state.mweights.map((w) => `{u:${w >= 1000 && w % 1000 === 0 ? `${w / 1000} kg` : `${w} g`}}`).join(' + ')] : [];
      const target = setTarget(task);
      if (state.mset === null || target === null) return [];
      return [instrumentToken(s, setValue(task, state))];
    }
    case 'count-intervals': {
      if (!s) return [];
      const sc = scaleOf(s);
      const n = phase === 'model' ? state.mparts.length : countParts(task).length;
      if (phase === 'model') return n ? [t(locale, 'math.measure.parts', { n })] : [];
      if (!sc || !spec) return [];
      const [a, b] = [task.between[0].units, task.between[1].units];
      const ans = done ? measureAnswerToken(task, spec) : (writtenToken(task, spec, state) ?? '?');
      if (task.ask === 'part') return [`${instrumentToken(s, b)} − ${instrumentToken(s, a)} = ${instrumentToken(s, b - a)} · ${instrumentToken(s, b - a)} ÷ ${n} = ${ans}`];
      return [`${instrumentToken(s, b)} − ${instrumentToken(s, a)} = ${ans}`];
    }
    case 'compare': {
      if (!isQty(task.a) || !isQty(task.b)) return [];
      const sym = task.ask === 'symbol' && state.symbol ? SYM[state.symbol] : '○';
      const head = `${qtyToken(task.a)} ${sym} ${qtyToken(task.b)}`;
      return state.aligned ? [head, `${baseToken(task.a)} ${sym} ${baseToken(task.b)}`] : [head];
    }
    case 'order': {
      if (!task.items.every(isQty)) return [];
      const order = done ? qtyOrder(task) : state.order;
      return order.length ? [order.map((i) => qtyToken(task.items[i] as QtyValue)).join(task.direction === 'asc' ? ' < ' : ' > ')] : [];
    }
    case 'choose':
      return [];
    default: {
      if (!spec) return [];
      const sentence = convertSentence(spec);
      const ans = done ? measureAnswerToken(task, spec) : writtenToken(task, spec, state);
      if (sentence) return [sentence.replace('?', ans ?? `? ${printedUnit(task, spec) ? unitText(printedUnit(task, spec)!, 'en') : ''}`.trim())];
      if (ans) return [ans];
      const unit = printedUnit(task, spec);
      if (spec.form === 'compound') {
        const a = answerValues(spec)[0];
        const pair = a && !isFracValue(a) && a.kind === 'cmp' ? a : null;
        return pair ? [`? ${unitText(pair.big, 'en')} ? ${unitText(pair.small, 'en')}`] : ['?'];
      }
      return [unit ? `? ${unitText(unit, 'en')}` : '?'];
    }
  }
}


/** The units a lesson's instruments and quantities use, in the lesson's order of the units (the spec table's UNITS row). */
export function lessonUnits(lesson: { steps: { beats: { model: Task['model'] }[]; pool: Task[] }[] }): string {
  const seen = new Set<Unit>();
  const visit = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (o.kind === 'instrument') for (const s of partsOf(o as Task['model'] & { kind: 'instrument' })) if (s.type !== 'balance') {
        seen.add(unitOf(s));
        if (s.sub) seen.add(s.sub.unit);
      }
      if (isQty(o)) {
        const q = o as unknown as QtyValue;
        if (q.kind === 'cmp') {
          seen.add(q.big);
          seen.add(q.small);
        } else seen.add(q.unit);
      }
      for (const x of Object.values(o)) visit(x);
    }
  };
  visit(lesson.steps);
  const order: Unit[] = ['cm', 'm', 'km', 'g', 'kg', 'l', 'ml'];
  return order.filter((u) => seen.has(u)).map((u) => unitText(u, 'en')).join(' · ');
}
