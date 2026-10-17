/**
 * The abstract line of the lesson (docs/15 §10: the number sentence under the model on a check, the "A" of
 * concrete–pictorial–abstract): the number sentences the child's moves amount
 * to, written with `{a/b}` tokens, e.g. `{1/8} + {1/8} + {1/8} = {3/8}`,
 * `{2/3} = {8/12} (× 4)`, `{1/2} + {1/4} = {2/4} + {1/4} = {3/4}`. Pure.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { InputSpec, Task } from '../schema';
import { answersOf, readInput, segments, splitAnswers, usesValueBoxes } from './check';
import { answerValues, durationBoxes, readWritten, type Written } from './forms';
import { formatClock, formatDuration, DEFAULT_NOTATION, sep12, sep24, ampmText, isFracValue, type AnswerValue, type Notation } from './value';
import { placeValueWords } from './words';
import { looseOf } from './state';
import { parseArrayCut } from './array';
import { splitArrayCut } from './solve';
import { total as blockTotal } from './blocks';
import { opResult } from './diagnose/whole-ops';
import { clockShown } from './clock';
import { formatFrac, lcm, over, toImproper, toMixed, type Frac } from './fraction';
import { inputSpecOf, modelValue, phasesOf, taskFigure, type TaskState } from './state';
import { askOf, measured } from './diagnose/measure';
import { cutPieces } from './check';
import { isHalfKey, parseCut, piecesAfter, rectOf } from './grid';
import { squared, unitText, type Unit } from './value';
import { asFrac } from './check';
import { isDecimalTask } from './decimal-tasks';
import { decimalLines } from './decimal-working';
import { formatDecimal } from './decimal';

const tok = (f: Frac) => `{${formatFrac(f)}}`;
const SYM = { '<': '<', '=': '=', '>': '>' } as const;

function counted(count: number, parts: number, wholes: number, done: boolean): string[] {
  if (count === 0 || parts <= 0) return [];
  const unit = tok({ n: 1, d: parts });
  const value = { n: count, d: parts };
  if (count > parts && wholes > 1) {
    // The mixed number is the child's to write (step 12): shown once the task is done.
    return [`${count} × ${unit} = ${tok(value)}`, ...(done ? [`${tok(value)} = ${tok(toMixed(value))}`] : [])];
  }
  if (count <= 4) return [`${Array.from({ length: count }, () => unit).join(' + ')}${count > 1 ? ` = ${tok(value)}` : ''}`];
  return [`${count} × ${unit} = ${tok(value)}`];
}

/** The written answer, when the boxes are full. */
function written(task: Task, state: TaskState): Frac[] | null {
  const spec = inputSpecOf(task);
  return spec ? readInput(spec, state.input) : null;
}

/**
 * A grid task's line (docs/21 §3): what the child has laid, traced, drawn or
 * cut, then the written answer (`area = ? cm²`); once done, the figure's
 * number sentence (`3 × 4 = 12 cm²`, `2 × (4 + 3) = 14 cm`). Never the answer first.
 */
function gridLines(task: Task, state: TaskState, locale: Locale, done: boolean): string[] {
  const m = task.model;
  if (m.kind !== 'grid') return [];
  const spec = inputSpecOf(task);
  const ctx = askOf(task, spec);
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const u = (unit: Unit, n = 2) => unitText(unit, locale, n);
  const len = m.unit;
  const sq = squared(m.unit);
  const v = written(task, state);
  if (done && ctx) {
    const f = ctx.facts;
    const value = measured(ctx);
    if (task.kind === 'split-figure') {
      const p = cutPieces(task, state.cut);
      if (p) return [`${p[0]} + ${p[1]} = ${p[0] + p[1]} ${u(sq)}`];
    }
    if (ctx.ask === 'area' && f.rect) return [`${f.box.w} × ${f.box.h} = ${f.area} ${u(sq, f.area)}`];
    if (ctx.ask === 'perimeter' && f.rect) return [f.square ? `4 × ${f.box.w} = ${f.perimeter} ${u(len)}` : `2 × (${f.box.w} + ${f.box.h}) = ${f.perimeter} ${u(len)}`];
    if (value !== null) return [`${t(locale, `math.grid.${ctx.ask}`)} = ${value} ${u(ctx.ask === 'area' ? sq : len, value)}`];
  }
  if (phase === 'input' && spec) {
    const unit: Unit = (spec.unit === 'dollar' ? undefined : spec.unit) ?? (ctx?.ask === 'area' ? sq : len);
    if (task.kind === 'split-figure') {
      const p = cutPieces(task, state.cut);
      const boxes = v ? v.map((x) => String(x.n)) : ['?', '?', '?'];
      return [...(p ? [`${pieceDims(task, state)} `] : []), `${boxes[0] ?? '?'} + ${boxes[1] ?? '?'} = ${boxes[2] ?? '?'} ${u(sq)}`];
    }
    const shown = v && v[0] ? `${v[0].n} ${spec.form === 'measure' ? u((state.input.u as Unit) || unit, v[0].n) : u(unit, v[0].n)}` : `? ${spec.form === 'measure' ? '' : u(unit)}`.trim();
    return ctx ? [`${t(locale, `math.grid.${ctx.ask}`)} = ${shown}`] : [];
  }
  switch (task.kind) {
    case 'count-squares': {
      const halves = state.tiles.filter(isHalfKey).length;
      const whole = state.tiles.length - halves;
      return state.tiles.length ? [t(locale, halves ? 'math.grid.laidHalves' : 'math.grid.laid', { n: whole, h: halves })] : [];
    }
    case 'trace-perimeter':
      return state.edges.length ? [t(locale, 'math.grid.traced', { n: state.edges.length })] : [];
    case 'draw-rectangle':
      return state.rect ? [`${state.rect[0]} ${u(len)} × ${state.rect[1]} ${u(len)}`] : [];
    case 'split-figure':
      return state.cut ? [cutPieces(task, state.cut) ? pieceDims(task, state) : t(locale, 'math.grid.notRects')] : [];
    default:
      return [];
  }
}

/** The two pieces of a cut, as `5 × 6 + 3 × 4`. */
function pieceDims(task: Task, state: TaskState): string {
  const fig = taskFigure(task);
  const cut = parseCut(state.cut);
  const pieces = fig && cut ? piecesAfter(fig.facts.cells, cut) : null;
  if (!pieces) return '';
  return pieces
    .map((p) => rectOf(p))
    .map((b) => (b ? `${b.w} × ${b.h}` : '?'))
    .join(' + ');
}

/* ------------------------------------------------------------------ */
/* Whole numbers, remainders, times (docs/19 §3, docs/20 §3)           */
/* ------------------------------------------------------------------ */

/** A value as a token (or plain text) for the number sentence: `56`, `3 r 2`, `{t:09:40}`, `{d:1h35m}`. */
function valueToken(spec: InputSpec, v: AnswerValue): string {
  if (isFracValue(v)) return spec.form === 'remainder' ? `${v.n} r 0` : String(v.n);
  if (v.kind === 'rem') return `${v.q} r ${v.r}`;
  if (v.kind === 'clock') return `{t:${formatClock(v.t)}${spec.form === 'time24' ? '|24' : spec.form === 'face' ? '|face' : ''}}`;
  if (v.kind === 'dec') return formatDecimal(v);
  return `{d:${formatDuration(v.t, durationBoxes(spec) === 'min-s' ? ['m', 's'] : ['h', 'm'])}}`;
}

/** What the child wrote, as written (`10.95`, `1 h 75 min` stay raw). */
function writtenText(spec: InputSpec, w: Written, notation: Notation): string {
  switch (w.kind) {
    case 'whole':
      return String(w.n);
    case 'rem':
      return `${w.q} r ${w.r}`;
    case 'clock': {
      const s = w.mode === '24' ? sep24(notation) || ':' : sep12(notation);
      const pad = (n: number) => String(n).padStart(2, '0');
      const hh = w.mode === '24' ? pad(w.h) : String(w.h);
      return `${hh}${s}${pad(w.m)}${w.s ? `${s}${pad(w.s)}` : ''}${w.ap ? ` ${ampmText(w.ap === 'pm', notation)}` : ''}`;
    }
    case 'dur':
      return durationBoxes(spec) === 'min-s' ? `${w.m} min ${w.s} s` : `${w.h} h ${w.m} min`;
  }
}

/** The sentence a written part fills: its own, the fact's, a span's or a conversion's (`?` for each box). */
function sentenceOf(task: Task, spec: InputSpec): string | null {
  if (spec.sentence) return spec.sentence;
  if (task.kind === 'split-array') return '? + ? = ?';
  const op = spec.op;
  if (op && !op.round) {
    if (op.kind === '÷') return `${op.a} ÷ ${op.b} = ?`;
    if (op.missing === 'a') return `? × ${op.b} = ${op.a * op.b}`;
    if (op.missing === 'b') return `${op.a} × ? = ${op.a * op.b}`;
    return `${op.a} × ${op.b} = ?`;
  }
  // A group or a share written as its quotient: the division it is.
  if ((task.kind === 'group' || (task.kind === 'share' && typeof task.value === 'number')) && (spec.form === 'whole' || spec.form === 'remainder')) {
    const a = task.kind === 'group' ? task.total : (task.value as number);
    const want = opResult({ kind: '÷', a, b: task.k });
    const v = answerValues(spec)[0];
    const fits = v && ('n' in want ? isFracValue(v) && v.n === want.n : !isFracValue(v) && v.kind === 'rem' && v.q === want.q && v.r === want.r);
    if (fits) return `${a} ÷ ${task.k} = ?`;
  }
  const sp = spec.span;
  if (sp) {
    const t = (v: number) => `{t:${formatClock(v)}${spec.form === 'time24' ? '|24' : ''}}`;
    const d = sp.length ? `{d:${formatDuration(sp.length.t, sp.length.units)}}` : '';
    if (sp.ask === 'end' && sp.start !== undefined) return `${t(sp.start)} + ${d} = ?`;
    if (sp.ask === 'start' && sp.end !== undefined) return `? + ${d} = ${t(sp.end)}`;
    if (sp.ask === 'length' && sp.start !== undefined && sp.end !== undefined) return `${t(sp.start)} → ${t(sp.end)} = ?`;
  }
  if (spec.convert) return `{d:${formatDuration(spec.convert.from.t, spec.convert.from.units)}} = ?${spec.form === 'whole' ? ` ${spec.convert.to ?? 'min'}` : ''}`;
  return null;
}

/** The answer written out (the tray's "The answer:" after Show me, the sentence once done). */
export function answerTokens(task: Task): string {
  const spec = inputSpecOf(task);
  if (!spec) return '';
  const values = task.kind === 'split-array' && !task.at ? (splitAnswers(task, splitArrayCut(task)) ?? []).map((n) => ({ n, d: 1 })) : answerValues(spec);
  const tokens = values.map((v) => valueToken(spec, v));
  const sentence = sentenceOf(task, spec);
  if (!sentence) return tokens.join(', ');
  let i = 0;
  return sentence.replace(/\?/g, () => tokens[i++] ?? '?');
}

/** The number sentence of a whole-number or time task: what the child made or wrote, never the answer before it is done. */
function valueLines(task: Task, state: TaskState, locale: Locale, done: boolean, notation: Notation): string[] {
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const spec = inputSpecOf(task);
  if (done && spec) return [answerTokens(task)];
  if ((phase === 'input' || task.kind === 'input') && spec && usesValueBoxes(task, spec)) {
    const written = readWritten(spec, state.input);
    const shown = written ? written.map((w) => writtenText(spec, w, notation)) : [];
    const sentence = sentenceOf(task, spec);
    if (!sentence) return shown.length ? [shown.join(', ')] : [];
    let i = 0;
    return [sentence.replace(/\?/g, () => shown[i++] ?? '?')];
  }
  switch (task.kind) {
    case 'group': {
      const g = state.groups.filter((n) => n > 0);
      if (g.length === 0) return [];
      const loose = looseOf(task, state);
      const equal = g.every((n) => n === g[0]);
      const head = equal && g.length > 1 ? `${g.length} × ${g[0]}` : g.join(' + ');
      return [loose ? t(locale, 'math.work.groupsLeft', { groups: head, n: loose }) : head];
    }
    case 'arrange':
      return state.arr ? [`${state.arr[0]} × ${state.arr[1]}`] : [];
    case 'skip-count':
      return state.landings.length ? [state.landings.join(', ')] : [];
    case 'split-array': {
      const c = parseArrayCut(state.cut);
      if (!c) return [`${task.rows} × ${task.cols}`];
      return [c.axis === 'rows' ? `${task.rows} × ${task.cols} = ${c.at} × ${task.cols} + ${task.rows - c.at} × ${task.cols}` : `${task.rows} × ${task.cols} = ${task.rows} × ${c.at} + ${task.rows} × ${task.cols - c.at}`];
    }
    case 'regroup':
      return [placeValueWords([state.mat.O, state.mat.T, state.mat.H], locale)];
    case 'share': {
      const d = state.dealt;
      if (d.H + d.T + d.O === 0) return [`${task.value} ÷ ${task.k}`];
      return [t(locale, 'math.work.eachPlate', { what: placeValueWords(d.H ? [d.O, d.T, d.H] : [d.O, d.T], locale) })];
    }
    default:
      return [];
  }
}

export function workingLines(task: Task, state: TaskState, locale: Locale, done = false, notation: Notation = DEFAULT_NOTATION): string[] {
  if (task.model.kind === 'grid') return gridLines(task, state, locale, done).filter(Boolean);
  if (isDecimalTask(task)) return decimalLines(task, state, locale, done).filter(Boolean);
  // A set clock: the time it shows once the hands have moved (the target is in the task's sentence already).
  if (task.kind === 'set-clock') return state.clock === null ? [] : [`{t:${formatClock(clockShown(task, state.clock))}${task.ampm ? '' : '|face'}}`];
  const spec = inputSpecOf(task);
  const wholeKind = task.kind === 'group' || task.kind === 'arrange' || task.kind === 'skip-count' || task.kind === 'split-array' || task.kind === 'regroup' || task.kind === 'share';
  if (wholeKind || (spec && usesValueBoxes(task, spec))) {
    // A task that is all model (arrange, skip-count), once done: the fact it shows.
    if (done && !spec) {
      if (task.kind === 'arrange' && state.arr) return [`${state.arr[0]} × ${state.arr[1]} = ${state.arr[0] * state.arr[1]}`];
      if (task.kind === 'skip-count') return [`${task.count} × ${task.size} = ${task.count * task.size}`];
      if (task.kind === 'group') return [`${task.total} ÷ ${task.k} = ${Math.floor(task.total / task.k)}${task.total % task.k ? ` r ${task.total % task.k}` : ''}`];
      if (task.kind === 'regroup') return [`${placeValueWords([state.mat.O, state.mat.T, state.mat.H], locale)} = ${blockTotal(state.mat)}`];
    }
    return valueLines(task, state, locale, done, notation).filter(Boolean);
  }
  const out: string[] = [];
  const v = written(task, state);
  switch (task.kind) {
    case 'shade':
      out.push(...counted(state.shaded.length, state.parts, state.wholes, done));
      break;
    case 'fold': {
      const base = state.parts / 2 ** state.folds;
      const g = state.given.length / 2 ** state.folds;
      if (g > 0) out.push(Array.from({ length: state.folds + 1 }, (_, f) => tok({ n: g * 2 ** f, d: base * 2 ** f })).join(' = '));
      else out.push(t(locale, 'math.work.parts', { n: state.parts, unit: tok({ n: 1, d: state.parts }) }));
      break;
    }
    case 'split':
    case 'merge': {
      const start = { n: task.model.kind === 'bar' ? (typeof task.model.given === 'number' ? task.model.given : (task.model.given?.length ?? 0)) : 0, d: task.model.kind === 'bar' ? (task.model.parts ?? 1) : 1 };
      out.push(tok(start));
      // With a written part to come, the new name is the child's to write: '?' until it is done.
      const renamed = task.then && !done ? '?' : tok({ n: state.given.length + state.shaded.length, d: state.parts });
      if (state.factor) out.push(`${tok(start)} = ${renamed}  (${task.kind === 'merge' ? '÷' : '×'} ${state.factor})`);
      break;
    }
    case 'cut': {
      const segs = segments(state.cuts, task.snap);
      if (state.cuts.length) out.push(t(locale, 'math.work.cut', { n: segs.length, lens: segs.join(' · ') }));
      if (segs.length > 1 && segs.every((s) => s === segs[0])) out.push(t(locale, 'math.work.each', { unit: tok({ n: 1, d: segs.length }) }));
      break;
    }
    case 'place':
      if (state.place !== null && state.parts > 0) {
        const f = { n: state.place, d: state.parts };
        out.push(t(locale, 'math.work.jumps', { n: state.place, unit: tok({ n: 1, d: state.parts }), value: tok(state.place > state.parts ? toMixed(f) : f) }));
      }
      break;
    case 'compare': {
      const A = asFrac(task.a);
      const B = asFrac(task.b);
      const L = lcm(A.d, B.d);
      const s = task.ask === 'symbol' ? state.symbol : null;
      out.push(`${tok(A)} ${s ? SYM[s] : '○'} ${tok(B)}`);
      if (state.aligned && A.d !== B.d) {
        const a = over(A, L)!;
        const b = over(B, L)!;
        out.push(`${tok(A)} = ${tok(a)} · ${tok(B)} = ${tok(b)}`);
        if (s) out.push(`${tok(a)} ${SYM[s]} ${tok(b)}`);
      }
      break;
    }
    case 'order':
      if (state.order.length) out.push(state.order.map((i) => tok(asFrac(task.items[i]!))).join(task.direction === 'asc' ? ' < ' : ' > '));
      break;
    case 'choose':
      break;
    case 'input': {
      const spec = task;
      if (spec.sum) out.push(`${tok(spec.sum.a)} ${spec.sum.op === '+' ? '+' : '−'} ${tok(spec.sum.b)} = ${v ? v.map(tok).join(' = ') : '?'}`);
      else if (spec.from) out.push(`${tok(spec.from)} = ${v ? v.map(tok).join(' = ') : '?'}`);
      else out.push(v ? v.map(tok).join(' = ') : `{?/?}`);
      break;
    }
    case 'count-squares':
    case 'trace-perimeter':
    case 'draw-rectangle':
    case 'split-figure':
      break;
    case 'build-sum': {
      const op = task.op === '+' ? '+' : '−';
      const line = [`${tok(task.a)} ${op} ${tok(task.b)}`];
      const L = state.parts;
      const a = over(task.a, L);
      const b = over(task.b, L);
      if (a && b && (a.d !== task.a.d || b.d !== task.b.d)) line.push(`${tok(a)} ${op} ${tok(b)}`);
      line.push(v ? v.map(tok).join(' = ') : '?');
      out.push(line.join(' = '));
      break;
    }
  }
  return out.filter(Boolean);
}

/**
 * The fraction the card, the status line and the plate block show. Where the child
 * still has to write the answer (an input phase, a sum), it is what the
 * child wrote, or nothing: the HUD never says the answer first. Where the
 * marks are the answer (shade, fold, split, merge, place), it is their value.
 */
export function cardValue(task: Task, state: TaskState, done = false): Frac | null {
  const m = task.model;
  if (m.kind === 'grid' || m.kind === 'array' || m.kind === 'blocks' || m.kind === 'clock' || m.kind === 'timeline' || (m.kind === 'numberline' && m.scale === 'whole') || isDecimalTask(task)) return null;
  const spec = inputSpecOf(task);
  if (spec && usesValueBoxes(task, spec)) return null;
  const phase = phasesOf(task)[state.phase];
  if (phase === 'input' || task.kind === 'input') {
    const v = written(task, state);
    return v && v.length === 1 && v[0]!.d > 0 ? v[0]! : done ? (answersOf(inputSpecOf(task)!)[0] ?? null) : null;
  }
  if (task.kind === 'build-sum' || task.kind === 'choose' || task.kind === 'order' || task.kind === 'compare' || task.kind === 'cut') return null;
  const value = modelValue(task, state);
  return value && value.n > 0 ? value : null;
}

/** Whether the read-outs may count the model's parts for the child (not while the child is to write that count). */
export function showsCounts(task: Task, state: TaskState): boolean {
  return phasesOf(task)[state.phase] !== 'input' && task.kind !== 'input';
}

/** Equivalent names of a value (expanded card): up to 12 parts. */
export function equivalentNames(f: Frac): Frac[] {
  const x = toImproper(f);
  const out: Frac[] = [];
  for (let d = 1; d <= 12; d++) {
    const g = over(x, d);
    if (g && g.n > 0) out.push(g);
  }
  return out;
}

