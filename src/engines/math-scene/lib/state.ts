/**
 * The state of one sub-step while the child works on it (docs/15 §4.8–4.9):
 * the model (parts, the child's marks, cuts, folds, the marker …), the answer
 * controls (symbol, order, chosen options, input boxes) and the phase of a
 * multi-part task (shade, then write it). `reduce` applies one action; the
 * same actions drive the tap / key paths, `solve()` and the examples. Pure.
 * In memory only: never in the URL or storage.
 */
import type { InputSpec, Task, TaskKind } from '../schema';
import { lcm, toImproper, type Frac } from './fraction';

export type Sym = '<' | '=' | '>';
export type Phase = 'model' | 'convert' | 'mark' | 'input';

export type Action =
  | { do: 'shade'; part: number }
  /** Shade the first `count` free parts (the number-line view of a shading). */
  | { do: 'fill'; count: number }
  | { do: 'cross'; part: number }
  | { do: 'cut'; at: number }
  | { do: 'fold' }
  | { do: 'unfold' }
  | { do: 'factor'; k: number | null }
  | { do: 'place'; at: number }
  | { do: 'symbol'; value: Sym }
  | { do: 'pick'; side: 'a' | 'b' }
  | { do: 'align' }
  | { do: 'order'; item: number }
  | { do: 'unorder'; item: number }
  | { do: 'choose'; id: string }
  | { do: 'input'; field: string; value: string }
  /** Check the current phase: on success a multi-part task moves to its next phase. */
  | { do: 'check' };

export interface TaskState {
  /** Equal parts per whole (bar / circle), intervals per whole (number line); 0 = not cut yet. */
  parts: number;
  wholes: number;
  /** The child's marks (signal). */
  shaded: number[];
  /** Given by the task (cold). */
  given: number[];
  /** Given parts taken away (subtraction). */
  crossed: number[];
  /** Cut positions on the grid (cut task). */
  cuts: number[];
  folds: number;
  /** Split ×k / merge ÷k / convert ×k applied to the starting model. */
  factor: number | null;
  /** Number-line marker, in intervals from the start. */
  place: number | null;
  symbol: Sym | null;
  pick: 'a' | 'b' | null;
  /** Compare / bar model: cut into same-size parts. */
  aligned: boolean;
  /** Order task: item indices in the child's order. */
  order: number[];
  chosen: string[];
  /** Input boxes by field id (`n`, `d`, `w`, or `n0`, `d1` … with several fractions). */
  input: Record<string, string>;
  /** Index into `phasesOf(task)`. */
  phase: number;
}

/** The parts of a task, checked one after the other. */
export function phasesOf(task: Task): Phase[] {
  switch (task.kind) {
    case 'input':
      return ['input'];
    case 'build-sum':
      return [...(task.convert ? (['convert'] as const) : []), 'mark', 'input'];
    case 'shade':
    case 'fold':
    case 'split':
    case 'merge':
      return task.then ? ['model', 'input'] : ['model'];
    default:
      return ['model'];
  }
}

/** The input spec of a task's input phase (`null` = none). */
export function inputSpecOf(task: Task): InputSpec | null {
  if (task.kind === 'input') return task;
  if (task.kind === 'build-sum') return task.answer;
  if ('then' in task && task.then) return task.then;
  return null;
}

const indices = (set: number | number[] | undefined): number[] =>
  set === undefined ? [] : Array.isArray(set) ? [...set] : Array.from({ length: set }, (_, i) => i);

/** Parts per whole the task starts with. */
export function baseParts(task: Task): number {
  const m = task.model;
  if (m.kind === 'bar' || m.kind === 'circle') return m.parts ?? 0;
  if (m.kind === 'numberline') return m.intervals;
  return 0;
}

export function initialState(task: Task): TaskState {
  const m = task.model;
  const bar = m.kind === 'bar' || m.kind === 'circle';
  return {
    parts: baseParts(task),
    wholes: m.kind === 'bar' ? (m.wholes ?? 1) : m.kind === 'numberline' ? m.to - m.from : 1,
    shaded: bar ? indices(m.shaded) : [],
    given: bar ? indices(m.given) : [],
    crossed: [],
    cuts: [],
    folds: 0,
    factor: null,
    place: null,
    symbol: null,
    pick: null,
    aligned: false,
    order: [],
    chosen: [],
    input: {},
    phase: 0,
  };
}

const toggle = (list: readonly number[], i: number) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i].sort((a, b) => a - b));
const expand = (list: readonly number[], k: number) => list.flatMap((i) => Array.from({ length: k }, (_, j) => i * k + j));
const collapse = (list: readonly number[], k: number) => [...new Set(list.map((i) => Math.floor(i / k)))];
/** Merge ÷k: a new part is marked when all k old parts under it were. */
const join = (list: readonly number[], k: number, total: number) =>
  Array.from({ length: total / k }, (_, g) => g).filter((g) => Array.from({ length: k }, (_, j) => g * k + j).every((i) => list.includes(i)));

/** Merge ÷k is possible: the parts and the marked parts both group evenly (docs/15 8.1). */
export function canMerge(task: Task, k: number): { ok: boolean; reason: 'parts' | 'shaded' | null } {
  const start = initialState(task);
  const total = start.parts * start.wholes;
  if (start.parts % k !== 0) return { ok: false, reason: 'parts' };
  const groups = (list: number[]) => list.length % k === 0 && join(list, k, total).length * k === list.length;
  if (!groups(start.shaded) || !groups(start.given)) return { ok: false, reason: 'shaded' };
  return { ok: true, reason: null };
}

/** The model after split ×k / merge ÷k / convert ×k from the starting model (`null` = back to the start). */
function scaled(task: Task, state: TaskState, k: number | null): TaskState {
  const start = initialState(task);
  if (k === null) return { ...state, parts: start.parts, shaded: start.shaded, given: start.given, crossed: [], factor: null };
  if (task.kind === 'merge') {
    if (!canMerge(task, k).ok) return state;
    const total = start.parts * start.wholes;
    return { ...state, parts: start.parts / k, shaded: join(start.shaded, k, total), given: join(start.given, k, total), factor: k };
  }
  return { ...state, parts: start.parts * k, shaded: expand(start.shaded, k), given: expand(start.given, k), crossed: [], factor: k };
}

/** Upper bound of the marker on a number line (intervals). */
export function lineLength(state: TaskState): number {
  return state.parts * state.wholes;
}

/** Apply one action (unknown or meaningless actions leave the state as it is). */
export function reduce(task: Task, state: TaskState, action: Action): TaskState {
  switch (action.do) {
    case 'shade': {
      const total = state.parts * state.wholes;
      if (action.part < 0 || action.part >= total || state.given.includes(action.part)) return state;
      return { ...state, shaded: toggle(state.shaded, action.part) };
    }
    case 'fill': {
      const free = Array.from({ length: state.parts * state.wholes }, (_, i) => i).filter((i) => !state.given.includes(i));
      return { ...state, shaded: free.slice(0, Math.max(0, Math.min(free.length, Math.round(action.count)))) };
    }
    case 'cross':
      if (!state.given.includes(action.part)) return state;
      return { ...state, crossed: toggle(state.crossed, action.part) };
    case 'cut': {
      const snap = task.kind === 'cut' ? task.snap : 12;
      if (action.at <= 0 || action.at >= snap) return state;
      return { ...state, cuts: toggle(state.cuts, action.at) };
    }
    case 'fold':
      if (state.parts >= 16) return state;
      return { ...state, parts: state.parts * 2, folds: state.folds + 1, shaded: expand(state.shaded, 2), given: expand(state.given, 2), crossed: expand(state.crossed, 2) };
    case 'unfold':
      if (state.folds === 0) return state;
      return {
        ...state,
        parts: state.parts / 2,
        folds: state.folds - 1,
        shaded: collapse(state.shaded, 2),
        given: collapse(state.given, 2),
        crossed: collapse(state.crossed, 2),
      };
    case 'factor':
      return scaled(task, state, action.k);
    case 'place': {
      const max = lineLength(state);
      return { ...state, place: Math.min(max, Math.max(0, Math.round(action.at))) };
    }
    case 'symbol':
      return { ...state, symbol: action.value };
    case 'pick':
      return { ...state, pick: action.side };
    case 'align':
      return { ...state, aligned: true };
    case 'order':
      return state.order.includes(action.item) ? state : { ...state, order: [...state.order, action.item] };
    case 'unorder':
      return { ...state, order: state.order.filter((i) => i !== action.item) };
    case 'choose': {
      const multi = task.kind === 'choose' && task.multi;
      if (state.chosen.includes(action.id)) return { ...state, chosen: state.chosen.filter((id) => id !== action.id) };
      return { ...state, chosen: multi ? [...state.chosen, action.id] : [action.id] };
    }
    case 'input': {
      const value = action.value.replace(/\D/g, '').slice(0, 2);
      return { ...state, input: { ...state.input, [action.field]: value } };
    }
    case 'check':
      return state;
  }
}

/** The fraction the model shows: marked (and given, less taken away) parts over the parts per whole. */
export function modelValue(task: Task, state: TaskState): Frac | null {
  if (state.parts <= 0) return null;
  const kind: TaskKind = task.kind;
  if (task.model.kind === 'numberline') return state.place === null ? null : { n: state.place, d: state.parts };
  const count = kind === 'build-sum' ? state.given.length - state.crossed.length + state.shaded.length : state.shaded.length + (kind === 'shade' ? 0 : state.given.length);
  return { n: count, d: state.parts };
}

/** Parts that make `f` on a model with `parts` per whole (`null` when it does not fit evenly). */
export function partsFor(f: Frac, parts: number): number | null {
  const x = toImproper(f);
  const count = (x.n * parts) / x.d;
  return Number.isInteger(count) ? count : null;
}

/** Same-size parts for two fractions (the "line them up" denominator). */
export function commonParts(a: Frac, b: Frac): number {
  return lcm(a.d, b.d);
}
