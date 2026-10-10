/**
 * Checking an answer (docs/15 §2.2, §4.8): one pure check per task kind and
 * phase, returning `{ ok, code }` where `code` names the misconception the
 * wrong answer shows. Diagnosis only looks for the misconceptions the task
 * declares (its `feedback.wrong` and, for `choose`, its options), so a wrong
 * answer is never explained with a story the task did not plan for; anything
 * else is `code: null` and gets the task's fallback. `not-simplest` is the
 * near miss: equal, but not in lowest terms (`near: true`, not counted as a try).
 */
import type { InputSpec, MisconceptionCode, Task, TaskOf } from '../schema';
import { compare, equal, equivalent, isSimplest, sign, toImproper, valueOnLine, type Frac } from './fraction';
import { inputSpecOf, partsFor, phasesOf, type Phase, type Sym, type TaskState } from './state';

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

export function answersOf(spec: InputSpec): Frac[] {
  return Array.isArray(spec.answer) ? spec.answer : [spec.answer];
}

/** The written fractions of an input phase, with their boxes. */
export function inputRows(spec: InputSpec): InputRow[] {
  const answers = answersOf(spec);
  const many = answers.length > 1;
  return answers.map((a, i) => {
    const id = (slot: Slot) => (many ? `${slot}${i}` : slot);
    const blank = spec.blanks?.[i];
    const slots: Slot[] = spec.form === 'whole' ? ['w'] : spec.form === 'mixed' || a.w ? ['w', 'n', 'd'] : ['n', 'd'];
    return {
      slots: slots.map((slot) => {
        const value = slot === 'w' ? (spec.form === 'whole' ? a.n : (a.w ?? 0)) : a[slot];
        const filled = blank === undefined || blank === slot;
        return { slot, field: filled ? id(slot) : null, printed: filled ? null : value };
      }),
    };
  });
}

/** Every box the child must fill. */
export function inputFields(spec: InputSpec): string[] {
  return inputRows(spec).flatMap((r) => r.slots.flatMap((s) => (s.field ? [s.field] : [])));
}

/** The fractions as written (`null` while a box is empty). A whole-number answer is `{ n, d: 1 }`. Zero denominators are kept raw for the diagnosis. */
export function readInput(spec: InputSpec, input: Readonly<Record<string, string>>): Frac[] | null {
  const out: Frac[] = [];
  for (const row of inputRows(spec)) {
    const v: Partial<Record<Slot, number>> = {};
    for (const s of row.slots) {
      const raw = s.field ? input[s.field] : String(s.printed);
      if (raw === undefined || raw === '') return null;
      v[s.slot] = Number(raw);
    }
    if (spec.form === 'whole') out.push({ n: v.w!, d: 1 });
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
      out[s.field] = String(s.slot === 'w' ? (spec.form === 'whole' ? v.n : (v.w ?? 0)) : v[s.slot]);
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
      if (m.kind !== 'numberline' || !m.arrow) return false;
      const k = valueOnLine(m.arrow, m);
      return k !== null && x.n === k + 1 && x.d === m.intervals + 1;
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
      case 'whole':
        right = v.n === answer.n && answer.d === 1;
        break;
    }
    if (right) continue;
    const code = codes.find((c) => c !== 'not-simplest' && inputRule(c, task, spec, v, answer)) ?? null;
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
  const line = m.kind === 'numberline' ? m : { from: 0, intervals: state.parts };
  const q = valueOnLine(task.target, line);
  if (q === null) return NOT_YET;
  const tol = task.snap === 'free' ? (task.tolerance ?? 0.5) : 0;
  if (Math.abs(state.place - q) <= tol) return OK;
  const t = toImproper(task.target);
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
  const right = SYMBOL[compare(task.a, task.b)];
  if (s === right) return OK;
  const { a, b } = task;
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
  return idx.sort((i, j) => compare(task.items[i]!, task.items[j]!) * (task.direction === 'asc' ? 1 : -1));
}

function checkOrder(task: TaskOf<'order'>, state: TaskState): CheckResult {
  if (state.order.length !== task.items.length) return NOT_YET;
  const right = sortedOrder(task);
  if (state.order.every((v, i) => v === right[i])) return OK;
  const dir = task.direction === 'asc' ? 1 : -1;
  const items = state.order.map((i) => task.items[i]!);
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

/** Check one phase of a task. */
export function checkPhase(task: Task, state: TaskState, phase: Phase): CheckResult {
  if (phase === 'input') {
    const spec = inputSpecOf(task);
    if (!spec) return NOT_YET;
    const values = readInput(spec, state.input);
    return values ? checkInputValues(task, spec, values) : NOT_YET;
  }
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
    case 'input':
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
  if (phase === 'input') {
    const spec = inputSpecOf(task);
    return !!spec && readInput(spec, state.input) !== null;
  }
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
    default:
      return false;
  }
}

