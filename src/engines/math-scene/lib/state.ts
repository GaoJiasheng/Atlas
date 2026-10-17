/**
 * The state of one sub-step while the child works on it (docs/15 §4.8–4.9):
 * the model (parts, the child's marks, cuts, folds, the marker …), the answer
 * controls (symbol, order, chosen options, input boxes) and the phase of a
 * multi-part task (shade, then write it). `reduce` applies one action; the
 * same actions drive the tap / key paths, `solve()` and the "Show me" ghost. Pure.
 * In memory only: never in the URL or storage.
 */
import type { InputSpec, PlaceKey, Task, TaskKind, Trade } from '../schema';
import { lcm, toImproper, type Frac } from './fraction';
import { allSides, factsOf, figureOf, halfKey, parseCell, parseCut, readingOrder, rowCells } from './grid';
import { isUnit } from './value';
import { fieldDigits, isValueForm } from './forms';
import { applyTrade, canTrade, counts, sharePlace, standard, ZERO, type Counts } from './blocks';
import { parseArrayCut } from './array';
import { cleanDecimal, DECIMAL_ACTIONS, decimalClear, decimalInitial, decimalReduce, onChart, type DecimalAction, type DecimalState } from './decimal-tasks';
import { onDial, snapTo } from './clock';
import { canHop } from './timeline';

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
  /** Grid: lay or lift the unit square on a cell (`"3,2"`) or a half cell (`"3,2,ne"`). */
  | { do: 'tile'; key: string }
  /** Grid: lay (or lift) every square of row `y` of the figure. */
  | { do: 'row'; y: number; on: boolean }
  /** Grid: the figure's squares laid in its top `count` rows (the −/+ row stepper). */
  | { do: 'rows'; count: number }
  /** Grid: trace or untrace one unit side (`"h3,2"`, `"v3,2"`). */
  | { do: 'edge'; key: string }
  /** Grid: lift every square, untrace every side. */
  | { do: 'clear' }
  /** Grid: "Walk round": number the traced sides in walking order (or stop). */
  | { do: 'walk' }
  /** Grid: the rectangle drawn from the fixed bottom-left corner, `w` across and `h` up. */
  | { do: 'rect'; w: number; h: number }
  /** Grid: the cut along a grid line (`"x:5"`, `"y:4"`, `null` = none). */
  | { do: 'gridcut'; cut: string | null }
  /** Groups (share): one more to each container, in turn, while any are left. */
  | { do: 'deal' }
  /** Groups (pack): a new container filled with `k`. */
  | { do: 'pack' }
  /** Groups: one loose thing into container `group` (one past the last: a new container). */
  | { do: 'put'; group: number }
  /** Groups: one thing out of container `group`, back with the loose ones. */
  | { do: 'take'; group: number }
  /** Groups: this many containers (the things in a removed one go back). */
  | { do: 'containers'; count: number }
  /** Array: `rows` × `cols` laid out from the fixed corner. */
  | { do: 'arrange'; rows: number; cols: number }
  /** Whole-number line: land a jump on `at` (or lift that landing). */
  | { do: 'land'; at: number }
  /** Array: the cut after a row (`"r5"`) or a column (`"c3"`), `null` = none. */
  | { do: 'arraycut'; cut: string | null }
  /** Blocks: trade 10 of a place for 1 of the next, or 1 for 10 of the one below. */
  | { do: 'trade'; trade: Trade }
  /** Blocks: share one place into the plates as far as it goes. */
  | { do: 'share'; place: PlaceKey }
  /** Clock: the hands set to `t` (seconds since midnight; the minute hand snaps, the hour hand follows). */
  | { do: 'clock'; t: number }
  /** Timeline: one jump of `by` seconds from where the jumps have got to (a chip; negative goes back). */
  | { do: 'hop'; by: number }
  /** Timeline: the last jump taken back. */
  | { do: 'unhop' }
  /** Check the current phase: on success a multi-part task moves to its next phase. */
  | { do: 'check' }
  /** Decimals (docs/29 §3.6): the grid, the line's zoom, the ends, the rows, the digits, the chart. */
  | DecimalAction;

export interface TaskState extends DecimalState {
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
  /** Grid: squares laid (cell keys, half-cell keys). */
  tiles: string[];
  /** Grid: unit sides traced. */
  edges: string[];
  /** Grid: the traced sides are numbered ("Walk round"). */
  walked: boolean;
  /** Grid: the rectangle drawn, `[across, up]`. */
  rect: [number, number] | null;
  /** Grid: the cut placed (`"x:5"`); array: the cut after a row or column (`"r5"`, `"c3"`). */
  cut: string | null;
  /** Groups: the things in each container. */
  groups: number[];
  /** Array: the rows × columns laid out. */
  arr: [number, number] | null;
  /** Whole-number line: where the jumps landed, in order along the line. */
  landings: number[];
  /** Blocks: on the mat, by place. */
  mat: Counts;
  /** Blocks: on each plate (a share). */
  dealt: Counts;
  /** Blocks: trades made. */
  trades: number;
  /** Clock: the time the child has set (`null`: not moved, the model's time). */
  clock: number | null;
  /** Timeline: the child's jumps (chip presses, signed seconds). */
  hops: number[];
  /** Index into `phasesOf(task)`. */
  phase: number;
}

/** The parts of a task, checked one after the other. */
export function phasesOf(task: Task): Phase[] {
  switch (task.kind) {
    case 'input':
    case 'read-clock':
    case 'duration':
      return ['input'];
    case 'build-sum':
      return [...(task.convert ? (['convert'] as const) : []), 'mark', 'input'];
    case 'shade':
    case 'fold':
    case 'split':
    case 'merge':
      return task.then ? ['model', 'input'] : ['model'];
    case 'count-squares':
    case 'trace-perimeter':
    case 'split-figure':
    case 'split-array':
    case 'share':
    case 'round-on-line':
    case 'align-add':
      return ['model', 'input'];
    case 'group':
    case 'regroup':
      return task.then ? ['model', 'input'] : ['model'];
    default:
      return ['model'];
  }
}

/** The written part of a clock or timeline task, as an input spec (one object per task, so it can be compared). */
const timeSpecs = new WeakMap<Task, InputSpec>();

/** The input spec of a task's input phase (`null` = none). */
export function inputSpecOf(task: Task): InputSpec | null {
  if (task.kind === 'input') return task;
  if (task.kind === 'build-sum') return task.answer;
  if (task.kind === 'read-clock' || task.kind === 'duration') {
    let spec = timeSpecs.get(task);
    if (!spec) {
      // A clock is read in its form; a duration task's span (what is known, what is asked) tells the diagnosis what to look for.
      spec =
        task.kind === 'read-clock'
          ? { answer: task.answer, form: task.form, units: task.units }
          : { ...task.answer, span: task.answer.span ?? { start: task.start, end: task.end, length: task.length, ask: task.ask } };
      timeSpecs.set(task, spec);
    }
    return spec;
  }
  if ('then' in task && task.then) return task.then;
  return null;
}

const indices = (set: number | number[] | undefined): number[] =>
  set === undefined ? [] : Array.isArray(set) ? [...set] : Array.from({ length: set }, (_, i) => i);

/** Parts per whole the task starts with. */
export function baseParts(task: Task): number {
  const m = task.model;
  if (m.kind === 'bar' || m.kind === 'circle') return m.parts ?? 0;
  if (m.kind === 'numberline' && m.scale !== 'decimal') return m.intervals ?? 1;
  return 0;
}

export function initialState(task: Task): TaskState {
  const m = task.model;
  const bar = m.kind === 'bar' || m.kind === 'circle';
  return {
    ...decimalInitial(task),
    parts: baseParts(task),
    wholes: m.kind === 'bar' ? (m.wholes ?? 1) : m.kind === 'numberline' && m.scale !== 'decimal' ? m.to - m.from : 1,
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
    tiles: [],
    edges: [],
    walked: false,
    rect: null,
    cut: null,
    groups: task.kind === 'group' && task.by === 'share' ? Array.from({ length: task.k }, () => 0) : [],
    arr: null,
    landings: [],
    mat: task.kind === 'regroup' && typeof task.value === 'number' ? counts(task.start) : task.kind === 'share' && typeof task.value === 'number' ? standard(task.value) : ZERO,
    dealt: ZERO,
    trades: 0,
    clock: null,
    hops: [],
    phase: 0,
  };
}

/** Things not yet in a container (a group task). */
export function looseOf(task: Task, state: TaskState): number {
  return task.kind === 'group' ? task.total - state.groups.reduce((a, b) => a + b, 0) : 0;
}

/** Most containers a group task's stage offers. */
export const MAX_GROUPS = 12;

/** The figure a grid task works on (count, trace, cut), with its cells and halves. */
export function taskFigure(task: Task) {
  const m = task.model;
  if (m.kind !== 'grid') return null;
  const id = 'figure' in task ? task.figure : task.kind === 'input' ? task.figure : undefined;
  const f = figureOf(m, id);
  return f ? { figure: f, facts: factsOf(f) } : null;
}

/** Squares of a grid figure that can be laid: cells, then half cells (keys). */
export function tileKeys(task: Task): string[] {
  const fig = taskFigure(task);
  if (!fig) return [];
  return [...readingOrder(fig.facts.cells), ...fig.facts.halves.map(halfKey)];
}

/** Rows of a grid figure, top first (the y of each), and the keys laid by "row y". */
export function figureRows(task: Task): { y: number; keys: string[] }[] {
  const fig = taskFigure(task);
  if (!fig) return [];
  const ys = [...new Set([...[...fig.facts.cells].map((k) => parseCell(k)[1]), ...fig.facts.halves.map((h) => h.y)])].sort((a, b) => b - a);
  return ys.map((y) => ({ y, keys: [...rowCells(fig.facts.cells, y), ...fig.facts.halves.filter((h) => h.y === y).map(halfKey)] }));
}

/** Digits an answer box takes: two for a fraction's numbers, five for a whole number or a measure, two for hours or minutes … (`forms.ts`). */
export function boxDigits(spec: InputSpec | null, field = 'w'): number {
  if (!spec) return 2;
  return isValueForm(spec.form) ? fieldDigits(spec, field) : 2;
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
  if (DECIMAL_ACTIONS.has(action.do)) return decimalReduce(task, state, action as DecimalAction);
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
      if (action.field === 'u') return isUnit(action.value) || action.value === '' ? { ...state, input: { ...state.input, u: action.value } } : state;
      if (action.field === 'ap') return action.value === 'am' || action.value === 'pm' || action.value === '' ? { ...state, input: { ...state.input, ap: action.value } } : state;
      // A decimal box keeps digits and one point (`.35` is written 0.35).
      if (action.field.startsWith('x')) return { ...state, input: { ...state.input, [action.field]: cleanDecimal(action.value) } };
      const value = action.value.replace(/\D/g, '').slice(0, boxDigits(inputSpecOf(task), action.field));
      return { ...state, input: { ...state.input, [action.field]: value } };
    }
    case 'tile': {
      if (!tileKeys(task).includes(action.key)) return state;
      return { ...state, tiles: state.tiles.includes(action.key) ? state.tiles.filter((k) => k !== action.key) : [...state.tiles, action.key] };
    }
    case 'row': {
      const row = figureRows(task).find((r) => r.y === action.y);
      if (!row) return state;
      const rest = state.tiles.filter((k) => !row.keys.includes(k));
      return { ...state, tiles: action.on ? [...rest, ...row.keys] : rest };
    }
    case 'rows': {
      const rows = figureRows(task);
      const n = Math.max(0, Math.min(rows.length, Math.round(action.count)));
      return { ...state, tiles: rows.slice(0, n).flatMap((r) => r.keys) };
    }
    case 'edge': {
      const fig = taskFigure(task);
      if (!fig || !allSides(fig.facts.cells).has(action.key)) return state;
      return { ...state, edges: state.edges.includes(action.key) ? state.edges.filter((k) => k !== action.key) : [...state.edges, action.key] };
    }
    case 'clear': {
      if (onChart(task) || task.kind === 'shade-decimal') return decimalClear(task, state);
      if (task.kind === 'duration') return state.hops.length ? { ...state, hops: [] } : state;
      if (task.kind === 'group' || task.kind === 'skip-count' || task.kind === 'regroup' || task.kind === 'share') {
        const start = initialState(task);
        return { ...state, groups: start.groups, landings: [], mat: start.mat, dealt: start.dealt, trades: 0 };
      }
      return state.tiles.length || state.edges.length ? { ...state, tiles: [], edges: [], walked: false } : state;
    }
    case 'walk':
      return { ...state, walked: !state.walked };
    case 'rect': {
      const m = task.model;
      if (m.kind !== 'grid') return state;
      const cols = m.cols ?? 12;
      const rows = m.rows ?? 10;
      const w = Math.min(cols, Math.max(1, Math.round(action.w)));
      const h = Math.min(rows, Math.max(1, Math.round(action.h)));
      return state.rect && state.rect[0] === w && state.rect[1] === h ? state : { ...state, rect: [w, h] };
    }
    case 'gridcut': {
      if (action.cut === null) return { ...state, cut: null };
      return parseCut(action.cut) ? { ...state, cut: action.cut } : state;
    }
    case 'deal': {
      if (task.kind !== 'group' || state.groups.length === 0) return state;
      let loose = looseOf(task, state);
      if (loose === 0) return state;
      const groups = state.groups.map((g) => (loose-- > 0 ? g + 1 : g));
      return { ...state, groups };
    }
    case 'pack': {
      if (task.kind !== 'group' || looseOf(task, state) < task.k || state.groups.length >= MAX_GROUPS) return state;
      return { ...state, groups: [...state.groups, task.k] };
    }
    case 'put': {
      if (task.kind !== 'group' || looseOf(task, state) === 0) return state;
      if (action.group === state.groups.length && state.groups.length < MAX_GROUPS) return { ...state, groups: [...state.groups, 1] };
      if (action.group < 0 || action.group >= state.groups.length) return state;
      return { ...state, groups: state.groups.map((g, i) => (i === action.group ? g + 1 : g)) };
    }
    case 'take': {
      if (task.kind !== 'group' || !(state.groups[action.group]! > 0)) return state;
      const groups = state.groups.map((g, i) => (i === action.group ? g - 1 : g));
      // A box emptied while packing goes away; a plate to share into stays.
      return { ...state, groups: task.by === 'pack' && groups[action.group] === 0 ? groups.filter((_, i) => i !== action.group) : groups };
    }
    case 'containers': {
      if (task.kind !== 'group') return state;
      const n = Math.max(1, Math.min(MAX_GROUPS, Math.round(action.count)));
      if (n === state.groups.length) return state;
      return { ...state, groups: n > state.groups.length ? [...state.groups, ...Array.from({ length: n - state.groups.length }, () => 0)] : state.groups.slice(0, n) };
    }
    case 'arrange': {
      if (task.kind !== 'arrange') return state;
      const r = Math.max(1, Math.min(12, Math.round(action.rows)));
      const c = Math.max(1, Math.min(12, Math.round(action.cols)));
      return state.arr && state.arr[0] === r && state.arr[1] === c ? state : { ...state, arr: [r, c] };
    }
    case 'land': {
      if (task.kind !== 'skip-count') return state;
      const m = task.model;
      const to = task.to ?? (m.kind === 'numberline' && m.scale !== 'decimal' ? m.to : 100);
      const at = Math.round(action.at);
      if (at < 0 || at > to) return state;
      const landings = state.landings.includes(at) ? state.landings.filter((x) => x !== at) : [...state.landings, at].sort((a, b) => a - b);
      return { ...state, landings };
    }
    case 'arraycut': {
      if (task.kind !== 'split-array') return state;
      if (action.cut === null) return { ...state, cut: null };
      const c = parseArrayCut(action.cut);
      if (!c || c.at < 1 || c.at >= (c.axis === 'rows' ? task.rows : task.cols)) return state;
      return state.cut === action.cut ? state : { ...state, cut: action.cut };
    }
    case 'trade': {
      if ((task.kind !== 'regroup' && task.kind !== 'share') || !canTrade(state.mat, action.trade)) return state;
      return { ...state, mat: applyTrade(state.mat, action.trade), trades: state.trades + 1 };
    }
    case 'share': {
      if (task.kind !== 'share') return state;
      const next = sharePlace(state.mat, state.dealt, action.place, task.k);
      return next.mat === state.mat ? state : { ...state, ...next };
    }
    case 'clock': {
      if (task.kind !== 'set-clock') return state;
      const t = onDial(snapTo(action.t, task.snap), !!task.ampm);
      return t === state.clock ? state : { ...state, clock: t };
    }
    case 'hop':
      if (task.kind !== 'duration' || action.by === 0 || !canHop(task, state.hops, action.by)) return state;
      return { ...state, hops: [...state.hops, action.by] };
    case 'unhop':
      return task.kind === 'duration' && state.hops.length ? { ...state, hops: state.hops.slice(0, -1) } : state;
    case 'check':
    default:
      // the decimal moves, handled above.
      return state;
  }
}

/** The fraction the model shows: marked (and given, less taken away) parts over the parts per whole. */
export function modelValue(task: Task, state: TaskState): Frac | null {
  if (state.parts <= 0) return null;
  const kind: TaskKind = task.kind;
  if (task.model.kind === 'numberline') return state.place === null || task.model.scale === 'decimal' ? null : { n: state.place, d: state.parts };
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
