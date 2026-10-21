/**
 * Checking an answer (docs/15 §2.2, §4.8): one pure check per task kind and
 * phase, returning `{ ok, code }` where `code` names the misconception the
 * wrong answer shows. Diagnosis only looks for the misconceptions the task
 * declares (its `feedback.wrong` and, for `choose`, its options), so a wrong
 * answer is never explained with a story the task did not plan for; anything
 * else is `code: null` and gets the task's fallback. `not-simplest` is the
 * near miss: equal, but not in lowest terms (`near: true`, not counted as a try).
 */
import type { InputSpec, MisconceptionCode, Model, Task, TaskOf } from '../schema';
import { compare, equal, equivalent, isSimplest, sign, toImproper, valueOnLine, type Frac } from './fraction';
import { inputSpecOf, partsFor, phasesOf, taskFigure, tileKeys, type Phase, type Sym, type TaskState } from './state';
import { boundaryEdges, isHalfKey, parseCut, piecesAfter, rectOf } from './grid';
import { askOf, diagnoseNumber, drawnRight, drawnShows, measured, unitShows } from './diagnose/measure';
import { clockParts, isFracValue, isUnit, type AnswerValue, type Unit } from './value';
import { answerValues, isTimeForm, isValueForm, isWholeForm, readWritten, valueFields, writtenEquals, type Written } from './forms';
import { arrangedShows, diagnoseWhole, groupShows, groupsRight, landingsShow, opResult, skipTarget, wholeContextOf, type WholeWritten } from './diagnose/whole-ops';
import { diagnoseTime, timeContextOf } from './diagnose/time';
import { parseArrayCut } from './array';
import { regrouped } from './blocks';
import { fractionShows } from './diagnose/decimals';
import { toFraction } from './decimal';
import { checkDecimalInput, checkDecimalModel, decimalAnswered, decimalLine, isDec, isDecimalTask, onChart, readDecimals } from './decimal-tasks';
import { isQty, qtyBase, type DecValue, type QtyValue } from './value';
import { decimalWorkOf, isMeasureTask } from './measure-kind';
import { checkMeasureInput, checkMeasureModel, measureAnswered, measureInputAnswered } from './measure-tasks';
import { checkNetInput, checkNetModel, isNetTask, netAnswered } from './net-tasks';

/** A fraction, or a decimal (or a quantity, in its family's smallest unit) as the fraction it is (the fraction checks read decimals this way). */
export const asFrac = (v: Frac | DecValue | QtyValue): Frac => (isQty(v) ? toFraction(qtyBase(v)) : isDec(v) ? toFraction(v) : v);
import { clockSetRight, clockShown } from './clock';

export interface CheckResult {
  ok: boolean;
  code: MisconceptionCode | null;
  /** Equal but not in lowest terms where lowest terms were asked for: another go, not a mistake. */
  near?: boolean;
}

const OK: CheckResult = { ok: true, code: null };
const NOT_YET: CheckResult = { ok: false, code: null };
const SYMBOL: Record<-1 | 0 | 1, Sym> = { [-1]: '<', 0: '=', 1: '>' };

/** The misconceptions a task plans feedback for. */
export function declaredCodes(task: Task): MisconceptionCode[] {
  const codes = task.feedback.wrong.map((w) => w.when);
  if (task.kind === 'choose') for (const o of task.options) if (o.misconception) codes.push(o.misconception);
  return [...new Set(codes)];
}

/* ------------------------------------------------------------------ */
/* Input boxes                                                         */
/* ------------------------------------------------------------------ */

export type Slot = 'w' | 'n' | 'd';

/** One written fraction of an input phase: printed numbers and the boxes the child fills (`field` ids). */
export interface InputRow {
  slots: { slot: Slot; field: string | null; printed: number | null }[];
}

/** The answers of a fraction or whole-number input (other values are left out: see `answerValues`). */
export function answersOf(spec: InputSpec): Frac[] {
  return answerValues(spec).filter(isFracValue);
}

/** A model drawing fractions (a whole-number answer on one is read in the fraction boxes). */
export const isFractionModel = (m: Model): boolean => m.kind === 'bar' || m.kind === 'circle' || m.kind === 'wall' || m.kind === 'barmodel' || (m.kind === 'numberline' && m.scale === 'fraction');

/** Is the written part answered in the value boxes (`forms.ts`): whole numbers off the fraction models, remainders, times, durations? */
export function usesValueBoxes(task: Task, spec: InputSpec): boolean {
  if (!isValueForm(spec.form)) return false;
  if (task.model.kind === 'grid') return false;
  return !(isWholeForm(spec.form) && isFractionModel(task.model) && !spec.op);
}

/** The written fractions of an input phase, with their boxes. */
export function inputRows(spec: InputSpec): InputRow[] {
  const answers = answersOf(spec);
  const many = answers.length > 1;
  return answers.map((a, i) => {
    const id = (slot: Slot) => (many ? `${slot}${i}` : slot);
    const blank = spec.blanks?.[i];
    const whole = spec.form === 'whole' || spec.form === 'measure';
    const slots: Slot[] = whole ? ['w'] : spec.form === 'mixed' || a.w ? ['w', 'n', 'd'] : ['n', 'd'];
    return {
      slots: slots.map((slot) => {
        const value = slot === 'w' ? (whole ? a.n : (a.w ?? 0)) : a[slot];
        const filled = blank === undefined || blank === slot;
        return { slot, field: filled ? id(slot) : null, printed: filled ? null : value };
      }),
    };
  });
}

/** Every box the child must fill. */
export function inputFields(spec: InputSpec): string[] {
  if (isValueForm(spec.form) && !isWholeForm(spec.form)) return valueFields(spec);
  // A quantity written in its box (docs/32 M6): the box, the unit chip beside it.
  if (isWholeForm(spec.form) && answerValues(spec).some(isQty)) return valueFields(spec);
  return inputRows(spec).flatMap((r) => r.slots.flatMap((s) => (s.field ? [s.field] : [])));
}

/** The fractions as written (`null` while a box is empty, or a measure's unit is not chosen). A whole-number answer is `{ n, d: 1 }`. Zero denominators are kept raw for the diagnosis. */
export function readInput(spec: InputSpec, input: Readonly<Record<string, string>>): Frac[] | null {
  if (spec.form === 'measure' && !isUnit(input.u)) return null;
  if (isValueForm(spec.form) && !isWholeForm(spec.form)) return null;
  const out: Frac[] = [];
  for (const row of inputRows(spec)) {
    const v: Partial<Record<Slot, number>> = {};
    for (const s of row.slots) {
      const raw = s.field ? input[s.field] : String(s.printed);
      if (raw === undefined || raw === '') return null;
      v[s.slot] = Number(raw);
    }
    if (spec.form === 'whole' || spec.form === 'measure') out.push({ n: v.w!, d: 1 });
    else out.push(v.w ? { w: v.w, n: v.n!, d: v.d! } : { n: v.n!, d: v.d! });
  }
  return out;
}

/** The input boxes for these answers (solve, examples, samples). */
export function inputValues(spec: InputSpec, values: readonly Frac[]): Record<string, string> {
  const out: Record<string, string> = {};
  inputRows(spec).forEach((row, i) => {
    const v = values[i];
    if (!v) return;
    for (const s of row.slots) {
      if (!s.field) continue;
      out[s.field] = String(s.slot === 'w' ? (spec.form === 'whole' || spec.form === 'measure' ? v.n : (v.w ?? 0)) : v[s.slot]);
    }
  });
  return out;
}

/** The sum a task works out, for the diagnosis (build-sum, or an input task's `sum`). */
function sumOf(task: Task, spec: InputSpec): { op: '+' | '-'; a: Frac; b: Frac } | null {
  if (spec.sum) return spec.sum;
  if (task.kind === 'build-sum') return { op: task.op, a: task.a, b: task.b };
  return null;
}

/** Is `v` the one-sided renaming of `r` (only the top or only the bottom number scaled)? */
function oneSided(v: Frac, r: Frac): boolean {
  if (equivalent(v, r)) return false;
  const multiple = (x: number, y: number) => x > 0 && y > 0 && (x % y === 0 || y % x === 0);
  return (v.n === r.n && v.d !== r.d && multiple(v.d, r.d)) || (v.d === r.d && v.n !== r.n && multiple(v.n, r.n));
}

function inputRule(code: MisconceptionCode, task: Task, spec: InputSpec, v: Frac, answer: Frac): boolean {
  const a = toImproper(answer);
  const x = v.w ? v : toImproper(v);
  switch (code) {
    case 'swapped':
      return x.n === a.d && x.d === a.n && a.n !== a.d;
    case 'part-part':
      return x.n === a.n && x.d === a.d - a.n;
    case 'added-denominators': {
      const s = sumOf(task, spec);
      if (!s) return false;
      const p = toImproper(s.a);
      const q = toImproper(s.b);
      const k = s.op === '+' ? 1 : -1;
      return x.n === p.n + k * q.n && x.d === p.d + k * q.d;
    }
    case 'not-converted': {
      const s = sumOf(task, spec);
      if (!s) return false;
      const p = toImproper(s.a);
      const q = toImproper(s.b);
      if (p.d === q.d) return false;
      return x.n === p.n + (s.op === '+' ? q.n : -q.n) && x.d === Math.max(p.d, q.d);
    }
    case 'additive-equivalence': {
      const f = spec.from ? toImproper(spec.from) : null;
      return !!f && !equivalent(x, f) && x.n - f.n === x.d - f.d && x.d !== f.d;
    }
    case 'scaled-one-part':
      return [spec.from, answer].some((r) => !!r && oneSided(x, toImproper(r)));
    case 'tick-counting': {
      const m = task.model;
      if (m.kind !== 'numberline' || m.scale === 'decimal' || !m.arrow) return false;
      const k = valueOnLine(m.arrow, m);
      return k !== null && x.n === k + 1 && x.d === (m.intervals ?? 1) + 1;
    }
    case 'whole-changed': {
      const m = task.model;
      if (v.w !== undefined && answer.w !== undefined) return v.w === answer.w && v.n === answer.n && v.d !== answer.d;
      if (m.kind === 'bar' && (m.wholes ?? 1) > 1 && m.parts) return x.d === m.parts * (m.wholes ?? 1) && x.n === a.n;
      return answer.w !== undefined && x.d !== a.d && x.n === a.n;
    }
    default:
      return false;
  }
}

/** Check written fractions against an input spec. */
export function checkInputValues(task: Task, spec: InputSpec, values: readonly Frac[]): CheckResult {
  const answers = answersOf(spec);
  const codes = declaredCodes(task);
  for (const [i, answer] of answers.entries()) {
    const v = values[i];
    if (!v) return NOT_YET;
    let right: boolean;
    switch (spec.form) {
      case 'equal':
        right = equal(v, answer) || (!v.w && !answer.w && v.n === answer.n && v.d === answer.d);
        break;
      case 'equivalent':
        right = v.d > 0 && equivalent(v, answer);
        break;
      case 'simplest':
        right = v.d > 0 && equivalent(v, answer) && isSimplest(v);
        if (!right && v.d > 0 && equivalent(v, answer)) return { ok: false, code: 'not-simplest', near: true };
        break;
      case 'mixed':
        right = v.d > 0 && v.w !== undefined && v.n < v.d && equivalent(v, answer) && isSimplest({ n: v.n, d: v.d });
        break;
      default:
        right = v.n === answer.n && answer.d === 1;
        break;
    }
    if (right) continue;
    const code = codes.find((c) => c !== 'not-simplest' && (inputRule(c, task, spec, v, answer) || fractionShows(c, decimalWorkOf(spec), v))) ?? null;
    return { ok: false, code };
  }
  return OK;
}

/* ------------------------------------------------------------------ */
/* Model phases                                                        */
/* ------------------------------------------------------------------ */

/** Cut segments (grid units) from the cut positions. */
export function segments(cuts: readonly number[], snap: number): number[] {
  const at = [0, ...[...cuts].sort((a, b) => a - b), snap];
  return at.slice(1).map((x, i) => x - at[i]!);
}

function checkShade(task: TaskOf<'shade'>, state: TaskState): CheckResult {
  const total = state.parts * state.wholes;
  const want = partsFor(task.target, state.parts);
  const count = state.shaded.length;
  // The model's parts are fixed, so `accept` is a statement about the data (exact: the parts are the target's denominator), checked by the validator.
  if (want !== null && count === want) return OK;
  const t = toImproper(task.target);
  const codes = declaredCodes(task);
  const rules: Partial<Record<MisconceptionCode, boolean>> = {
    'scaled-one-part': count === t.n && state.parts !== t.d,
    'part-part': want !== null && count === total - want,
  };
  return { ok: false, code: codes.find((c) => rules[c]) ?? null };
}

function checkCut(task: TaskOf<'cut'>, state: TaskState): CheckResult {
  const segs = segments(state.cuts, task.snap);
  if (segs.length !== task.parts) return NOT_YET;
  // Each part within half a mark of a true share (12 grid: exact when the parts divide 12), within one mark on the fine 24 grid.
  const ideal = task.snap / task.parts;
  if (segs.every((s) => Math.abs(s - ideal) <= (task.snap === 24 ? 1 : 0.5))) return OK;
  return { ok: false, code: declaredCodes(task).includes('unequal-parts') ? 'unequal-parts' : null };
}

function checkPlace(task: TaskOf<'place'>, state: TaskState): CheckResult {
  if (state.place === null) return NOT_YET;
  const m = task.model;
  const target = asFrac(task.target);
  const line = m.kind === 'numberline' && m.scale !== 'decimal' ? m : { from: 0, intervals: state.parts };
  const q = valueOnLine(target, line);
  if (q === null) return NOT_YET;
  const tol = task.snap === 'free' ? (task.tolerance ?? 0.5) : 0;
  if (Math.abs(state.place - q) <= tol) return OK;
  const t = toImproper(target);
  const rules: Partial<Record<MisconceptionCode, boolean>> = {
    'tick-counting': Math.abs(state.place - q) === 1,
    'scaled-one-part': state.place === t.n && line.intervals !== t.d,
  };
  return { ok: false, code: declaredCodes(task).find((c) => rules[c]) ?? null };
}

/** The symbol a compare answer amounts to (a pick of the greater / smaller one becomes `>` or `<`). */
export function claimedSymbol(task: TaskOf<'compare'>, state: TaskState): Sym | null {
  if (task.ask === 'symbol') return state.symbol;
  if (state.pick === null) return null;
  const aBigger = task.ask === 'greater' ? state.pick === 'a' : state.pick === 'b';
  return aBigger ? '>' : '<';
}

function checkCompare(task: TaskOf<'compare'>, state: TaskState): CheckResult {
  const s = claimedSymbol(task, state);
  if (s === null) return NOT_YET;
  const a = asFrac(task.a);
  const b = asFrac(task.b);
  const right = SYMBOL[compare(a, b)];
  if (s === right) return OK;
  const rules: Partial<Record<MisconceptionCode, boolean>> = {
    'bigger-denominator-bigger': a.n === b.n && a.d !== b.d && s === SYMBOL[sign(a.d, b.d)],
    'compare-numerators-only': a.d !== b.d && s === SYMBOL[sign(a.n, b.n)],
    'gap-thinking': s === '=' && a.d - a.n === b.d - b.n,
  };
  return { ok: false, code: declaredCodes(task).find((c) => rules[c]) ?? null };
}

/** Items in the correct order (indices). */
export function sortedOrder(task: TaskOf<'order'>): number[] {
  const idx = task.items.map((_, i) => i);
  return idx.sort((i, j) => compare(asFrac(task.items[i]!), asFrac(task.items[j]!)) * (task.direction === 'asc' ? 1 : -1));
}

function checkOrder(task: TaskOf<'order'>, state: TaskState): CheckResult {
  if (state.order.length !== task.items.length) return NOT_YET;
  const right = sortedOrder(task);
  if (state.order.every((v, i) => v === right[i])) return OK;
  const dir = task.direction === 'asc' ? 1 : -1;
  const items = state.order.map((i) => asFrac(task.items[i]!));
  const monotone = (key: (f: Frac) => number) => items.every((f, i) => i === 0 || sign(key(f), key(items[i - 1]!)) * dir >= 0);
  const rules: Partial<Record<MisconceptionCode, boolean>> = {
    'compare-numerators-only': monotone((f) => toImproper(f).n),
    'bigger-denominator-bigger': monotone((f) => f.d),
  };
  return { ok: false, code: declaredCodes(task).find((c) => rules[c]) ?? null };
}

function checkChoose(task: TaskOf<'choose'>, state: TaskState): CheckResult {
  if (state.chosen.length === 0) return NOT_YET;
  const right = task.options.filter((o) => o.correct).map((o) => o.id);
  if (state.chosen.length === right.length && right.every((id) => state.chosen.includes(id))) return OK;
  const wrong = task.options.find((o) => !o.correct && o.misconception && state.chosen.includes(o.id));
  const missed = task.options.find((o) => o.correct && o.misconception && !state.chosen.includes(o.id));
  return { ok: false, code: (wrong ?? missed)?.misconception ?? null };
}

function checkScaled(task: TaskOf<'split'> | TaskOf<'merge'>, state: TaskState): CheckResult {
  const count = state.shaded.length + state.given.length;
  return state.parts === task.target.d && count === task.target.n ? OK : NOT_YET;
}

function checkBuildSum(task: TaskOf<'build-sum'>, state: TaskState, phase: Phase): CheckResult {
  if (phase === 'convert') {
    const start = task.model.kind === 'bar' ? (task.model.parts ?? 0) : 0;
    if (state.parts === start * (task.convert ?? 1)) return OK;
    return { ok: false, code: declaredCodes(task).includes('not-converted') ? 'not-converted' : null };
  }
  const want = partsFor(task.b, state.parts);
  const marked = task.op === '+' ? state.shaded.length : state.crossed.length;
  const other = task.op === '+' ? state.crossed.length : state.shaded.length;
  if (want !== null && marked === want && other === 0) return OK;
  // Marking b's own number of parts on a model cut in another size: b was not renamed.
  const unconverted = marked === toImproper(task.b).n && state.parts !== task.b.d;
  return { ok: false, code: unconverted && declaredCodes(task).includes('not-converted') ? 'not-converted' : null };
}

/* ------------------------------------------------------------------ */
/* Square grid (docs/21 §3.2–3.3)                                      */
/* ------------------------------------------------------------------ */

/** The two pieces of the figure a split task's cut makes, when both are rectangles (areas, in the order of the cut). */
export function cutPieces(task: Task, cutKey: string | null): [number, number] | null {
  const fig = taskFigure(task);
  const cut = parseCut(cutKey);
  if (!fig || !cut) return null;
  const pieces = piecesAfter(fig.facts.cells, cut);
  if (!pieces || !rectOf(pieces[0]) || !rectOf(pieces[1])) return null;
  return [pieces[0].size, pieces[1].size];
}

/** A written grid answer: the number (and unit) against the figure; a split's sentence against the pieces of the child's cut. */
function checkGridInput(task: Task, spec: InputSpec, values: readonly Frac[], state: TaskState): CheckResult {
  const codes = declaredCodes(task);
  const ctx = askOf(task, spec);
  const numbers = values.map((v) => v.n);
  if (task.kind === 'split-figure') {
    const pieces = cutPieces(task, state.cut);
    const total = numbers.at(-1)!;
    if (pieces && numbers.length === 3 && total === pieces[0] + pieces[1]) {
      const [p, q] = numbers;
      if ((p === pieces[0] && q === pieces[1]) || (p === pieces[1] && q === pieces[0])) return OK;
      return NOT_YET;
    }
    return { ok: false, code: ctx ? diagnoseNumber(codes, ctx, total) : null };
  }
  const answers = answersOf(spec).map((f) => f.n);
  if (numbers.length > 1 || !ctx) return numbers.every((x, i) => x === answers[i]) ? OK : NOT_YET;
  const x = numbers[0]!;
  const unit: Unit | null = spec.form === 'measure' ? ((state.input.u as Unit) ?? null) : null;
  if (x === answers[0] && (spec.form !== 'measure' || unit === spec.unit)) return OK;
  if (x === answers[0]) return { ok: false, code: codes.includes('unit-not-squared') && unitShows(ctx, unit, spec.unit === 'dollar' ? undefined : spec.unit) ? 'unit-not-squared' : null };
  return { ok: false, code: diagnoseNumber(codes, ctx, x) };
}

/** The model phase of a grid task: covered, traced, drawn, cut. */
function checkGridModel(task: Task, state: TaskState): CheckResult {
  const codes = declaredCodes(task);
  const fig = taskFigure(task);
  switch (task.kind) {
    case 'count-squares': {
      const keys = tileKeys(task);
      if (task.cover === 'all') return keys.every((k) => state.tiles.includes(k)) ? OK : NOT_YET;
      // A full row and a full column of the rectangle: rows × the squares in a row.
      if (!fig) return NOT_YET;
      const laid = new Set(state.tiles.filter((k) => !isHalfKey(k)));
      const { x, y, w, h } = fig.facts.box;
      const row = Array.from({ length: h }, (_, j) => y + j).some((yy) => Array.from({ length: w }, (_, i) => `${x + i},${yy}`).every((k) => laid.has(k)));
      const col = Array.from({ length: w }, (_, i) => x + i).some((xx) => Array.from({ length: h }, (_, j) => `${xx},${y + j}`).every((k) => laid.has(k)));
      return row && col ? OK : NOT_YET;
    }
    case 'trace-perimeter': {
      if (!fig) return NOT_YET;
      const boundary = boundaryEdges(fig.facts.cells);
      const inner = state.edges.some((e) => !boundary.has(e));
      if (!inner && state.edges.length === boundary.size) return OK;
      return { ok: false, code: inner && codes.includes('area-perimeter-swap') ? 'area-perimeter-swap' : null };
    }
    case 'draw-rectangle': {
      if (!state.rect) return NOT_YET;
      const [w, h] = state.rect;
      if (drawnRight(task, w, h)) return OK;
      return { ok: false, code: codes.find((c) => drawnShows(c, task, w, h)) ?? null };
    }
    case 'split-figure':
      return cutPieces(task, state.cut) ? OK : NOT_YET;
    default:
      return NOT_YET;
  }
}

/** The number a grid task's written part should hold (from the figure), `null` when it is not measured. */
export function gridAnswer(task: Task): number | null {
  const ctx = askOf(task, inputSpecOf(task));
  return ctx ? measured(ctx) : null;
}

/* ------------------------------------------------------------------ */
/* Whole numbers, remainders, times (docs/19 §3, docs/20 §3)           */
/* ------------------------------------------------------------------ */

const toWhole = (w: Written): WholeWritten | null => (w.kind === 'whole' ? { n: w.n } : w.kind === 'rem' ? { q: w.q, r: w.r } : null);
const wholeOfAnswer = (a: AnswerValue): WholeWritten | null => (isFracValue(a) ? (a.d === 1 ? { n: a.n } : null) : a.kind === 'rem' ? { q: a.q, r: a.r } : null);
const sameWhole = (x: WholeWritten, y: WholeWritten) => ('n' in x ? 'n' in y && x.n === y.n : 'q' in y && x.q === y.q && x.r === y.r);

/** The cut of a split-array task as the diagnosis's known part (the rows or columns before it). */
function splitOf(task: Task, state: TaskState) {
  if (task.kind !== 'split-array') return null;
  const c = parseArrayCut(state.cut);
  return c ? { first: c.at, of: c.axis === 'rows' ? ('a' as const) : ('b' as const) } : null;
}

/** The answers of a split-array's sentence for the child's cut: the two parts, then the whole (`null` while not cut). */
export function splitAnswers(task: TaskOf<'split-array'>, cut: string | null): [number, number, number] | null {
  const c = parseArrayCut(cut);
  if (!c) return null;
  const other = c.axis === 'rows' ? task.cols : task.rows;
  const whole = c.axis === 'rows' ? task.rows : task.cols;
  return [c.at * other, (whole - c.at) * other, task.rows * task.cols];
}

/** A written part in the value boxes: every box against its answer; the first wrong one is diagnosed in its domain. */
function checkValueInput(task: Task, spec: InputSpec, written: readonly Written[], state: TaskState): CheckResult {
  const codes = declaredCodes(task);
  let answers = answerValues(spec);
  // A split array cut anywhere: the sentence's parts are the child's cut's (in either order), the whole is fixed.
  if (task.kind === 'split-array' && !task.at && answers.length === 3) {
    const parts = splitAnswers(task, state.cut);
    if (parts) {
      const [p, q] = written.map((w) => (w.kind === 'whole' ? w.n : -1));
      const swap = p === parts[1] && q === parts[0];
      answers = (swap ? [parts[1], parts[0], parts[2]] : parts).map((n) => ({ n, d: 1 }));
    }
  }
  for (const [i, answer] of answers.entries()) {
    const w = written[i];
    if (!w) return NOT_YET;
    if (writtenEquals(spec, w, answer)) continue;
    if (isTimeForm(spec.form) || spec.convert || spec.span) {
      const ctx = timeContextOf(task, spec, answer);
      return { ok: false, code: ctx ? diagnoseTime(codes, ctx, w) : null };
    }
    const x = toWhole(w);
    const right = wholeOfAnswer(answer);
    if (!x || !right) return { ok: false, code: null };
    const ctx = wholeContextOf(task, spec, right, splitOf(task, state));
    // The fact applies to the box that holds its result (the whole of a split's sentence, the quotient).
    const op = ctx.op && sameWhole(opResult(ctx.op), right) ? ctx.op : null;
    return { ok: false, code: diagnoseWhole(codes, { ...ctx, op }, x) };
  }
  return OK;
}

/** The model phase of an array or blocks task. */
function checkWholeModel(task: Task, state: TaskState): CheckResult {
  const codes = declaredCodes(task);
  switch (task.kind) {
    case 'group': {
      if (groupsRight(task, state.groups)) return OK;
      return { ok: false, code: codes.find((c) => groupShows(c, task, state.groups)) ?? null };
    }
    case 'arrange': {
      if (!state.arr || state.arr[0] * state.arr[1] === 0) return NOT_YET;
      const [r, c] = state.arr;
      if (task.accept === 'product' ? r * c === task.rows * task.cols : r === task.rows && c === task.cols) return OK;
      return { ok: false, code: codes.find((code) => arrangedShows(code, task, r, c)) ?? null };
    }
    case 'skip-count': {
      const want = skipTarget(task);
      if (state.landings.length === want.length && state.landings.every((v, i) => v === want[i])) return OK;
      return { ok: false, code: codes.find((c) => landingsShow(c, task, state.landings)) ?? null };
    }
    case 'split-array': {
      const c = parseArrayCut(state.cut);
      if (!c) return NOT_YET;
      const at = task.at?.rows ? { axis: 'rows', at: task.at.rows[0] } : task.at?.cols ? { axis: 'cols', at: task.at.cols[0] } : null;
      return !at || (at.axis === c.axis && at.at === c.at) ? OK : NOT_YET;
    }
    case 'regroup':
      return regrouped(state.mat) ? OK : NOT_YET;
    case 'share': {
      const m = state.mat;
      if (m.H === 0 && m.T === 0 && m.O < task.k) return OK;
      // Stopped with a ten (or a hundred) left that cannot be shared as it is: it was not traded.
      if ((m.H > 0 && m.H < task.k) || (m.T > 0 && m.T < task.k && m.H === 0)) return { ok: false, code: codes.includes('not-traded') ? 'not-traded' : null };
      if (m.H === 0 && m.T === 0 && m.O >= task.k) return { ok: false, code: codes.includes('remainder-too-big') ? 'remainder-too-big' : null };
      return NOT_YET;
    }
    default:
      return NOT_YET;
  }
}

/** The model phase of a decimal task is checked in `decimal-tasks.ts` (the decimal kinds, a decimal line, decimals compared or ordered, the chart). */
function decimalModelPhase(task: Task): boolean {
  if (task.kind === 'shade-decimal' || task.kind === 'round-on-line' || task.kind === 'align-add' || task.kind === 'shift-digits') return true;
  if (onChart(task)) return true;
  if (task.kind === 'place') return !!decimalLine(task.model);
  return (task.kind === 'compare' || task.kind === 'order') && isDecimalTask(task);
}

/* ------------------------------------------------------------------ */
/* The clock (docs/20 §3.4)                                            */
/* ------------------------------------------------------------------ */

/** The time a set clock shows, as the child's written answer (its 12-hour position; with am / pm, the plate too). */
export function setClockWritten(task: TaskOf<'set-clock'>, set: number | null): Written {
  const p = clockParts(clockShown(task, set));
  return { kind: 'clock', mode: task.ampm ? '12' : 'face', h: p.h12, m: p.m, s: 0, ap: task.ampm ? (p.pm ? 'pm' : 'am') : null };
}

function checkSetClock(task: TaskOf<'set-clock'>, state: TaskState): CheckResult {
  if (state.clock === null) return NOT_YET;
  if (clockSetRight(task, state.clock)) return OK;
  const code = diagnoseTime(declaredCodes(task), { form: task.ampm ? 'time12' : 'face', answer: task.target }, setClockWritten(task, state.clock));
  return { ok: false, code };
}

/** Check one phase of a task. */
export function checkPhase(task: Task, state: TaskState, phase: Phase): CheckResult {
  // Nets (docs/39 §3.5–3.6): a net completed is folded, a face tapped found where it lands, a number about a net read against it; a choice is the generic one.
  if (isNetTask(task)) {
    const spec = inputSpecOf(task);
    if (phase === 'input' && spec) return checkNetInput(task, spec, state.input, declaredCodes(task));
    const r = checkNetModel(task, state, declaredCodes(task));
    if (r) return r;
  }
  // Reading instruments and quantities in units (docs/32 §3.4–3.6): their own checks, a choice the generic one.
  if (isMeasureTask(task)) {
    if (phase === 'input') {
      const spec = inputSpecOf(task);
      return spec ? checkMeasureInput(task, spec, state.input, declaredCodes(task)) : NOT_YET;
    }
    const r = checkMeasureModel(task, state, declaredCodes(task));
    if (r) return r;
  }
  if (phase === 'input') {
    const spec = inputSpecOf(task);
    if (!spec) return NOT_YET;
    if (spec.form === 'decimal') {
      const written = readDecimals(spec, state.input);
      return written ? checkDecimalInput(task, spec, written, declaredCodes(task)) : NOT_YET;
    }
    if (usesValueBoxes(task, spec)) {
      const written = readWritten(spec, state.input);
      return written ? checkValueInput(task, spec, written, state) : NOT_YET;
    }
    const values = readInput(spec, state.input);
    if (!values) return NOT_YET;
    return task.model.kind === 'grid' ? checkGridInput(task, spec, values, state) : checkInputValues(task, spec, values);
  }
  if (decimalModelPhase(task)) return checkDecimalModel(task, state, declaredCodes(task));
  if (task.kind === 'count-squares' || task.kind === 'trace-perimeter' || task.kind === 'draw-rectangle' || task.kind === 'split-figure') return checkGridModel(task, state);
  if (task.kind === 'group' || task.kind === 'arrange' || task.kind === 'skip-count' || task.kind === 'split-array' || task.kind === 'regroup' || task.kind === 'share') return checkWholeModel(task, state);
  if (task.kind === 'set-clock') return checkSetClock(task, state);
  switch (task.kind) {
    case 'shade':
      return checkShade(task, state);
    case 'cut':
      return checkCut(task, state);
    case 'fold':
      return state.parts === task.parts ? OK : NOT_YET;
    case 'split':
    case 'merge':
      return checkScaled(task, state);
    case 'place':
      return checkPlace(task, state);
    case 'compare':
      return checkCompare(task, state);
    case 'order':
      return checkOrder(task, state);
    case 'choose':
      return checkChoose(task, state);
    case 'build-sum':
      return checkBuildSum(task, state, phase);
    default:
      return NOT_YET;
  }
}

/** Check the phase the state is in. */
export function check(task: Task, state: TaskState): CheckResult {
  const phase = phasesOf(task)[state.phase] ?? 'model';
  return checkPhase(task, state, phase);
}

/** The misconception a wrong answer shows (`null`: none of the task's planned ones, or right). */
export function diagnose(task: Task, state: TaskState): MisconceptionCode | null {
  const r = check(task, state);
  return r.ok ? null : r.code;
}

/** Enough is done to press Check (a box empty, nothing marked, nothing chosen … = not yet). */
export function answered(task: Task, state: TaskState): boolean {
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const net = netAnswered(task, state);
  if (net !== null) return net;
  if (isMeasureTask(task)) {
    const spec = inputSpecOf(task);
    if (phase === 'input') return !!spec && measureInputAnswered(task, spec, state.input);
    const done = measureAnswered(task, state);
    if (done !== null) return done;
  }
  if (phase === 'input') {
    const spec = inputSpecOf(task);
    if (!spec) return false;
    if (spec.form === 'decimal') return readDecimals(spec, state.input) !== null;
    return usesValueBoxes(task, spec) ? readWritten(spec, state.input) !== null : readInput(spec, state.input) !== null;
  }
  if (decimalModelPhase(task) && task.kind !== 'compare' && task.kind !== 'order') return decimalAnswered(task, state);
  if (phase === 'convert') return state.factor !== null || state.parts !== (task.model.kind === 'bar' ? task.model.parts : 0);
  if (phase === 'mark') return state.shaded.length + state.crossed.length > 0;
  switch (task.kind) {
    case 'shade':
      return state.shaded.length > 0;
    case 'cut':
      return state.cuts.length > 0;
    case 'fold':
      return state.folds > 0;
    case 'split':
    case 'merge':
      return state.factor !== null;
    case 'place':
      return state.place !== null;
    case 'compare':
      return task.ask === 'symbol' ? state.symbol !== null : state.pick !== null;
    case 'order':
      return state.order.length === task.items.length;
    case 'choose':
      return state.chosen.length > 0;
    case 'count-squares':
      return state.tiles.length > 0;
    case 'trace-perimeter':
      return state.edges.length > 0;
    case 'draw-rectangle':
      return state.rect !== null;
    case 'split-figure':
    case 'split-array':
      return state.cut !== null;
    case 'group':
      return state.groups.some((g) => g > 0);
    case 'arrange':
      return state.arr !== null && state.arr[0] * state.arr[1] > 0;
    case 'skip-count':
      return state.landings.length > 0;
    case 'regroup':
      return state.trades > 0;
    case 'share':
      return state.dealt.H + state.dealt.T + state.dealt.O > 0;
    case 'set-clock':
      return state.clock !== null;
    default:
      return false;
  }
}

