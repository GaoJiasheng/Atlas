/**
 * The number sentence of a decimal check (docs/29 §2.0: short lines,
 * `0.45 + 0.38 = 0.83`, `2.96 ≈ 3.0`, `7 ÷ 4 = 1.75`, `?` for what is not
 * written yet): what the child has shaded, placed, chosen, lined up, moved,
 * shared or written — never the answer before the check is done. Pure.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { DecimalWork, InputSpec, Task } from '../schema';
import { DPLACES } from '../schema';
import { formatDecimal, withPlaces, type Decimal } from './decimal';
import { formatFrac } from './fraction';
import { inputSpecOf, phasesOf, type TaskState } from './state';
import { readInput } from './check';

import { chartValue, dealtValue, decimalAnswerText, decimalOrder, decOf, numText, numToken, placedValue, readDecimals, shadedValue, shareQuotient, shiftResult, shiftTarget, workOf } from './decimal-tasks';
import { levelsFor, roundingEnds } from './dline';
import { discFace, type DCounts } from './placevalue';

const D = (d: Decimal) => formatDecimal(d);
const MEASURES = new Set(['km', 'm', 'cm', 'kg', 'g', 'l', 'ml']);

/** A number with its unit: a measure token (`{u:1.5 l}`), money `$2.35`, cents `235 cents` / `235 分`. */
function withUnit(v: string, unit: string | undefined, locale: Locale): string {
  if (!unit) return v;
  if (unit === 'dollar') return `$${v}`;
  if (unit === 'cent') return `${v} ${t(locale, 'math.money.cents')}`;
  return MEASURES.has(unit) ? `{u:${v} ${unit}}` : v;
}

/** The unit of the number written: the box's own, or a conversion's (`dollar`, `cent`, `ml` …). */
export const resultUnit = (spec: InputSpec, w: DecimalWork | null): string | undefined => spec.unit ?? (w?.do === 'convert' ? w.into : undefined);

/** A written or right number with the result's unit, for the line. */
export const withResultUnit = (v: string, spec: InputSpec, w: DecimalWork | null, locale: Locale): string => withUnit(v, resultUnit(spec, w), locale);

/** The sentence a piece of work fills, a bare `?` for each box (the box or the line adds the unit). */
export function workSentence(w: DecimalWork, spec: InputSpec, locale: Locale): string | null {
  const { a, b } = w;
  switch (w.do) {
    case 'add':
      return a && b ? `${withUnit(D(a), spec.unit, locale)} + ${withUnit(D(b), spec.unit, locale)} = ?` : null;
    case 'subtract':
      return a && b ? `${withUnit(D(a), spec.unit, locale)} − ${withUnit(D(b), spec.unit, locale)} = ?` : null;
    case 'multiply':
      return a && b ? `${withUnit(D(a), spec.unit, locale)} × ${D(b)} = ?` : null;
    case 'divide':
      return a && b ? `${withUnit(D(a), spec.unit, locale)} ÷ ${D(b)} ${spec.places !== undefined ? '≈' : '='} ?` : null;
    case 'round':
      return a ? `${D(a)} ≈ ?` : null;
    case 'scale':
      return a && w.op && w.by ? `${D(a)} ${w.op} ${w.by} = ?` : null;
    case 'convert':
      return a && w.from && w.into ? `${withUnit(D(a), w.from, locale)} = ?` : null;
    case 'to-decimal':
      return w.of && !('kind' in w.of) ? `{${formatFrac(w.of)}} = ?` : null;
    case 'to-fraction':
      return w.of && 'kind' in w.of ? `${D(w.of)} = ?` : null;
    default:
      return null;
  }
}

/** The discs on the chart by place, as a sum: `1 × 0.1 + 3 × 0.01`. */
function discSum(c: DCounts): string {
  return DPLACES.filter((p) => c[p] > 0)
    .map((p) => `${c[p]} × ${discFace(p, false)}`)
    .join(' + ');
}

/** The sentence of the written part: its own `sentence`, the work's, the task's (`?` for what is not written; the child's numbers as written). */
function writtenLine(task: Task, spec: InputSpec, state: TaskState, locale: Locale): string {
  const w = workOf(task, spec);
  const sentence = spec.sentence ?? (w ? workSentence(w, spec, locale) : null);
  const written = readDecimals(spec, state.input);
  const shown = written ? written.map((x) => withResultUnit(D(x), spec, w, locale)) : null;
  if (!sentence) return shown ? shown.join(', ') : '?';
  let i = 0;
  return sentence.replace(/\?/g, () => shown?.[i++] ?? '?');
}

/** The answer written in its sentence ("The answer:" after Show me, the line once done). */
export function decimalAnswerLine(task: Task, locale: Locale): string {
  const spec = inputSpecOf(task);
  if (!spec) return '';
  const w = workOf(task, spec);
  const sentence = spec.sentence ?? (w ? workSentence(w, spec, locale) : null);
  const answers = spec.form === 'decimal' ? decimalAnswerText(spec).map((a) => (spec.unit === 'dollar' ? a : withResultUnit(a, spec, w, locale))) : [];
  if (!sentence) return answers.join(', ');
  let i = 0;
  return sentence.replace(/\?/g, () => answers[i++] ?? '?');
}

/** The number sentence of a decimal check (`null`: not a decimal check). */
export function decimalLines(task: Task, state: TaskState, locale: Locale, done: boolean): string[] {
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const spec = inputSpecOf(task);
  if (spec?.form === 'decimal' && (phase === 'input' || task.kind === 'input')) return [done ? decimalAnswerLine(task, locale) : writtenLine(task, spec, state, locale)];
  if (spec && spec.work?.do === 'to-fraction' && task.kind === 'input') {
    const v = readInput(spec, state.input);
    return [`${spec.work.of ? numText(spec.work.of) : ''} = ${v ? v.map((f) => `{${formatFrac(f)}}`).join(' = ') : '{?/?}'}`];
  }
  switch (task.kind) {
    case 'shade-decimal': {
      const x = shadedValue(task, state);
      return x.units > (task.start?.units ?? 0) ? [D(withPlaces({ units: x.units, dp: 0 }, 0))] : [];
    }
    case 'place': {
      const m = task.model.kind === 'numberline' && task.model.scale === 'decimal' ? task.model : null;
      if (!m) return [];
      const x = placedValue(task, state);
      if (x) return [D(x)];
      const deepest = levelsFor(m, state.zoomPath).at(-1);
      return deepest && state.zoomPath.length ? [`${D(deepest.from)} < ? < ${D(deepest.to)}`] : [];
    }
    case 'compare': {
      const s = task.ask === 'symbol' ? state.symbol : null;
      const a = decOf(task.a);
      const b = decOf(task.b);
      if (state.aligned && a && b) {
        const dp = Math.max(a.dp, b.dp);
        return [`${D(withPlaces(a, dp))} ${s ?? '○'} ${D(withPlaces(b, dp))}`];
      }
      return [`${numToken(task.a)} ${s ?? '○'} ${numToken(task.b)}`];
    }
    case 'order': {
      const order = done ? decimalOrder(task) : state.order;
      return order.length ? [order.map((i) => numToken(task.items[i]!)).join(task.direction === 'asc' ? ' < ' : ' > ')] : [];
    }
    case 'round-on-line': {
      const e = roundingEnds(task.value, task.to);
      if (done) return [`${D(task.value)} ≈ ${D(e.nearest)}`];
      return [`${D(e.lo)} < ${D(task.value)} < ${D(e.hi)}`];
    }
    case 'align-add':
      return [`${D(task.a)} ${task.op} ${D(task.b)} = ?`];
    case 'shift-digits': {
      const x = done ? shiftTarget(task) : shiftResult(task, state);
      return [`${D(task.value)} ${task.op} ${task.by} = ${state.shift || done ? (x ? D(x) : '?') : '?'}`];
    }
    case 'share': {
      if (typeof task.value === 'number') return [];
      if (done) return [`${D(task.value)} ÷ ${task.k} = ${D(shareQuotient(task) ?? dealtValue(state))}`];
      const each = dealtValue(state);
      return each.units > 0 ? [t(locale, 'math.tray.eachValue', { v: D(each) })] : [`${D(task.value)} ÷ ${task.k}`];
    }
    case 'regroup':
      return typeof task.value === 'number' ? [] : [`${discSum(state.pv)}${done ? ` = ${D(chartValue(state))}` : ''}`];
    default:
      return [];
  }
}

