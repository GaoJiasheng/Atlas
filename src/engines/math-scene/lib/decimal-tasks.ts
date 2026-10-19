/**
 * The decimal checks (docs/29 §3.6): what each new task kind and each kind
 * extended to decimals keeps in the task state, how a move changes it, how a
 * phase is checked and diagnosed, the right way through (solve), the state a
 * wrong-answer sample stands for, and when enough is done to press Check.
 * `state.ts`, `check.ts` and `solve.ts` hand decimal tasks to this module.
 * Exact throughout (`lib/decimal.ts`); pure.
 *
 * Kinds: `shade-decimal` (the grid), `place` on a decimal line (zoom, then a
 * tick), `compare` and `order` of decimals, `round-on-line` (the nearer end,
 * then the rounded number written), `align-add` (the second row slid onto
 * the point, then the sum or difference), `shift-digits` (× ÷ 10, 100,
 * 1000), `share` and `regroup` on the place-value chart, and `input` in the
 * `decimal` form.
 */
import type { DecimalGridModelSpec, DecimalLineSpec, DecimalWork, DPlace, DTrade, InputSpec, MisconceptionCode, Model, MoneySpec, PlaceValueSpec, Task, TaskOf } from '../schema';
import { DPLACES } from '../schema';
import { cmp, divWhole, eq, formatDecimal, parseDecimal, same, withPlaces, type Decimal } from './decimal';
import { decimalOf, isQty, qtyText, qtyToken, type AnswerValue, type DecValue, type QtyValue } from './value';
import { decimalWorkOf, isMeasureTask } from './measure-kind';
import type { Frac } from './fraction';
import { cellsPerWhole, cellTh, fillTo, levelPlaces, shadingTh, type GridLevel } from './dgrid';
import { levelsFor, pathTo, roundingEnds, valueAt } from './dline';
import { applyDTrade, below, canDTrade, dcounts, dregrouped, dsharePlace, dstandard, dtotal, DZERO, asDecimal, placesOf, PLACE_EXP, shiftedValue, type DCounts } from './placevalue';
import { compareShows, decimalShows, diagnoseDecimal, orderShows, placeShows, shadeShows, shiftShows, type Claim } from './diagnose/decimals';

/* ------------------------------------------------------------------ */
/* Which tasks                                                         */
/* ------------------------------------------------------------------ */

/** The decimal models (docs/29 A6): the grid, the chart, money, the decimal line. */
export type DecimalModelSpec = DecimalGridModelSpec | PlaceValueSpec | MoneySpec | DecimalLineSpec;
export const isDecimalModel = (m: Model): m is DecimalModelSpec => m.kind === 'decimal-grid' || m.kind === 'place-value' || m.kind === 'money' || (m.kind === 'numberline' && m.scale === 'decimal');
export const isDec = (v: Frac | DecValue | AnswerValue): v is DecValue => 'kind' in v && v.kind === 'dec';
/** A whole number written as a fraction (`"2"`) counts as a decimal on a decimal task. */
export const decOf = (v: Frac | DecValue | QtyValue): Decimal | null => (isDec(v) ? v : decimalOf(v));

/** The decimal line of a task's model (`null`: another model). */
export const decimalLine = (m: Model): DecimalLineSpec | null => (m.kind === 'numberline' && m.scale === 'decimal' ? m : null);

/** Is the task about decimals (its kind, its model, its numbers or its answer form)? Its misconceptions are the decimals domain's. */
export function isDecimalTask(task: Task): boolean {
  // A measure in decimals (docs/32 step 13) is read on an instrument: the measure-reading domain's.
  if (isMeasureTask(task)) return false;
  if (task.kind === 'shade-decimal' || task.kind === 'round-on-line' || task.kind === 'align-add' || task.kind === 'shift-digits') return true;
  const models = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  if (models.some(isDecimalModel)) return true;
  if (task.kind === 'compare' && (isDec(task.a) || isDec(task.b))) return true;
  if (task.kind === 'order' && task.items.some(isDec)) return true;
  if (task.kind === 'place' && isDec(task.target)) return true;
  if (task.kind === 'choose' && task.options.some((o) => o.value && isDec(o.value))) return true;
  if ((task.kind === 'share' || task.kind === 'regroup') && typeof task.value !== 'number') return true;
  const spec = task.kind === 'input' ? task : 'then' in task ? task.then : undefined;
  return !!spec && (spec.form === 'decimal' || !!decimalWorkOf(spec));
}

/** Share and regroup on the place-value chart (not the blocks). */
export const onChart = (task: Task): boolean => (task.kind === 'share' || task.kind === 'regroup') && task.model.kind === 'place-value';

/** A fraction, a decimal or a quantity as written: `3/4`, `0.35`, `900 g`, `1 ℓ 250 ml`. */
export const numText = (v: Frac | DecValue | QtyValue): string => (isQty(v) ? qtyText(v) : isDec(v) ? formatDecimal(v) : v.d === 1 && !v.w ? String(v.n) : `${v.w ? `${v.w} ` : ''}${v.n}/${v.d}`);
/** The same as rich text: a fraction token `{3/4}`, a decimal as it is, a quantity `{u:900 g}`. */
export const numToken = (v: Frac | DecValue | QtyValue): string => (isQty(v) ? qtyToken(v) : isDec(v) ? formatDecimal(v) : `{${numText(v)}}`);

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface DecimalState {
  /** shade-decimal: cells shaded (strips at level 10, squares otherwise) and slivers of the next free square. */
  dcells: number[];
  slivers: number;
  /** place on a decimal line: the segment zoomed into on each line, top first (`place` is the tick on the deepest). */
  zoomPath: number[];
  /** round-on-line: the end chosen. */
  end: 'lo' | 'hi' | null;
  /** align-add: places the second row sits moved left of the point-aligned place (0 = lined up on the point). */
  offset: number;
  /** align-add: the empty places filled with faint zeros. */
  padded: boolean;
  /** shift-digits: places the digits moved, left > 0. */
  shift: number;
  /** The place-value chart: discs on it, and on each plate. */
  pv: DCounts;
  pvDealt: DCounts;
}

/** The second row's offset when it is lined up on its last digit (right) or its first (left). */
export function alignStart(a: Decimal, b: Decimal, start: 'right' | 'left'): number {
  if (start === 'right') return b.dp - a.dp;
  return PLACE_EXP[placesOf(a)[0]!] - PLACE_EXP[placesOf(b)[0]!];
}

/** The places a number's digits run over, as powers of ten (top, bottom). */
function expSpan(d: Decimal): [number, number] {
  const ps = placesOf(d);
  return [PLACE_EXP[ps[0]!], PLACE_EXP[ps.at(-1)!]];
}

/** Where the second row of an align-add may go: from one place past point-aligned (0) to one past where it starts, on the chart. */
export function alignRange(a: Decimal, b: Decimal, start: 'right' | 'left'): [number, number] {
  const s = alignStart(a, b, start);
  const [top, bottom] = expSpan(b);
  return [Math.max(Math.min(0, s) - 1, -3 - bottom), Math.min(Math.max(0, s) + 1, 3 - top)];
}

/** How far the digits of a shift-digits may move (left > 0) and stay on the chart (thousands … thousandths). */
export function shiftRange(value: Decimal): [number, number] {
  const [top, bottom] = expSpan(value);
  return [Math.max(-MOVE_MAX, -3 - bottom), Math.min(MOVE_MAX, 3 - top)];
}

/** The locked cells and slivers of a shade-decimal task's starting amount. */
function startShading(task: TaskOf<'shade-decimal'>): { cells: number[]; slivers: number } {
  const level = task.level as GridLevel;
  const n = task.start ? Math.round(task.start.units / 1000) : 0;
  return fillTo(level, n, gridCells(task));
}

/** Cells a shade-decimal grid has (all its wholes). */
export const gridCells = (task: TaskOf<'shade-decimal'>): number => cellsPerWhole(task.level as GridLevel) * Math.max(task.wholes ?? 1, Math.ceil(Math.round(task.target.units / 1000) / 1000));

export function decimalInitial(task: Task): DecimalState {
  const s: DecimalState = { dcells: [], slivers: 0, zoomPath: [], end: null, offset: 0, padded: false, shift: 0, pv: { ...DZERO }, pvDealt: { ...DZERO } };
  if (task.kind === 'shade-decimal') {
    const st = startShading(task);
    return { ...s, dcells: st.cells, slivers: st.slivers };
  }
  if (task.kind === 'align-add') return { ...s, offset: alignStart(task.a, task.b, task.start) };
  if (task.kind === 'share' && typeof task.value !== 'number') return { ...s, pv: dstandard(task.value) };
  if (task.kind === 'regroup' && typeof task.value !== 'number') return { ...s, pv: dcounts(task.start) };
  return s;
}

export type DecimalAction =
  | { do: 'dcell'; cell: number }
  | { do: 'dstrip'; strip: number; on: boolean }
  | { do: 'dfill'; th: number }
  | { do: 'slivers'; n: number }
  | { do: 'zoom'; level: number; seg: number | null }
  | { do: 'dplace'; tick: number }
  | { do: 'end'; side: 'lo' | 'hi' }
  | { do: 'offset'; to: number }
  | { do: 'pad' }
  | { do: 'shift'; to: number }
  | { do: 'dtrade'; trade: DTrade }
  | { do: 'dshare'; place: DPlace };

export const DECIMAL_ACTIONS = new Set(['dcell', 'dstrip', 'dfill', 'slivers', 'zoom', 'dplace', 'end', 'offset', 'pad', 'shift', 'dtrade', 'dshare']);

/** Most places the second row of an align-add or the digits of a shift may move. */
export const MOVE_MAX = 3;

/** The decimal state with the shared fields it reads (the tick placed, the trades made). */
type Full = DecimalState & { place: number | null; trades: number };

/** Apply a decimal move (meaningless moves leave the state as it is). */
export function decimalReduce<S extends Full>(task: Task, state: S, action: DecimalAction): S {
  switch (action.do) {
    case 'dcell':
    case 'dstrip':
    case 'dfill':
    case 'slivers': {
      if (task.kind !== 'shade-decimal') return state;
      const level = task.level as GridLevel;
      const total = gridCells(task);
      const locked = startShading(task).cells;
      if (action.do === 'dfill') {
        const startTh = task.start ? Math.round(task.start.units / 1000) : 0;
        const st = fillTo(level, Math.max(startTh, Math.min(total * cellTh(level), action.th)), total);
        return { ...state, dcells: st.cells, slivers: st.slivers };
      }
      if (action.do === 'slivers') return level === 1000 ? { ...state, slivers: Math.max(0, Math.min(9, Math.round(action.n))) } : state;
      if (action.do === 'dcell') {
        if (action.cell < 0 || action.cell >= total || locked.includes(action.cell)) return state;
        const cells = state.dcells.includes(action.cell) ? state.dcells.filter((c) => c !== action.cell) : [...state.dcells, action.cell].sort((a, b) => a - b);
        return { ...state, dcells: cells };
      }
      const per = level === 10 ? 1 : 10;
      const strip = Array.from({ length: per }, (_, i) => action.strip * per + i).filter((c) => c < total && !locked.includes(c));
      if (strip.length === 0) return state;
      const rest = state.dcells.filter((c) => !strip.includes(c));
      return { ...state, dcells: action.on ? [...rest, ...strip].sort((a, b) => a - b) : rest };
    }
    case 'zoom': {
      const m = decimalLine(task.model);
      if (task.kind !== 'place' || !m) return state;
      const depth = task.zoom ?? 0;
      if (action.level < 0 || action.level > Math.min(depth - 1, state.zoomPath.length)) return state;
      const path = [...state.zoomPath.slice(0, action.level), ...(action.seg === null ? [] : [action.seg])];
      if (levelsFor(m, path).length !== path.length + 1) return state;
      return { ...state, zoomPath: path, place: null };
    }
    case 'dplace': {
      const m = decimalLine(task.model);
      if (task.kind !== 'place' || !m) return state;
      const deepest = levelsFor(m, state.zoomPath).at(-1);
      if (!deepest) return state;
      return { ...state, place: Math.max(0, Math.min(deepest.steps, Math.round(action.tick))) };
    }
    case 'end':
      return task.kind === 'round-on-line' ? { ...state, end: action.side } : state;
    case 'offset': {
      if (task.kind !== 'align-add') return state;
      const [lo, hi] = alignRange(task.a, task.b, task.start);
      return { ...state, offset: Math.max(lo, Math.min(hi, Math.round(action.to))) };
    }
    case 'pad':
      return task.kind === 'align-add' ? { ...state, padded: !state.padded } : state;
    case 'shift': {
      if (task.kind !== 'shift-digits') return state;
      const [lo, hi] = shiftRange(task.value);
      const to = Math.round(action.to);
      return to >= lo && to <= hi && shiftedValue(task.value, to) ? { ...state, shift: to } : state;
    }
    case 'dtrade': {
      if ((task.kind !== 'share' && task.kind !== 'regroup') || !onChart(task) || !canDTrade(state.pv, action.trade)) return state;
      return { ...state, pv: applyDTrade(state.pv, action.trade), trades: state.trades + 1 };
    }
    case 'dshare': {
      if (task.kind !== 'share' || !onChart(task)) return state;
      const next = dsharePlace(state.pv, state.pvDealt, action.place, task.k);
      return next.mat === state.pv ? state : { ...state, pv: next.mat, pvDealt: next.dealt };
    }
  }
}

/** Clear the work on a decimal model (the tray's "Start again"). */
export function decimalClear<S extends Full>(task: Task, state: S): S {
  const start = decimalInitial(task);
  return { ...state, dcells: start.dcells, slivers: start.slivers, pv: start.pv, pvDealt: start.pvDealt, trades: 0 };
}

/* ------------------------------------------------------------------ */
/* Reading the state                                                   */
/* ------------------------------------------------------------------ */

/** The amount shaded on a shade-decimal grid. */
export function shadedValue(task: TaskOf<'shade-decimal'>, s: DecimalState): Decimal {
  const level = task.level as GridLevel;
  return { units: shadingTh(level, { cells: s.dcells, slivers: s.slivers }) * 1000, dp: levelPlaces(level) };
}

/** The value placed on a decimal line (`null` while not placed). */
export function placedValue(task: Task, s: DecimalState & { place: number | null }): Decimal | null {
  const m = decimalLine(task.model);
  if (!m || s.place === null) return null;
  const deepest = levelsFor(m, s.zoomPath).at(-1);
  return deepest ? valueAt(deepest, s.place) : null;
}

/** The number the digits make after the child's shift. */
export const shiftResult = (task: TaskOf<'shift-digits'>, s: DecimalState): Decimal | null => shiftedValue(task.value, s.shift);
/** What a shift-digits task asks for. */
export const shiftTarget = (task: TaskOf<'shift-digits'>): Decimal => shiftedValue(task.value, (task.op === '×' ? 1 : -1) * (String(task.by).length - 1))!;

/** The work a written decimal is diagnosed against: the input's own, or the task's numbers (align-add, round-on-line, a share). */
export function workOf(task: Task, spec: InputSpec): DecimalWork | null {
  const own = decimalWorkOf(spec);
  if (own) return own;
  if (task.kind === 'align-add') return { do: task.op === '+' ? 'add' : 'subtract', a: task.a, b: task.b };
  if (task.kind === 'round-on-line') return { do: 'round', a: task.value, to: task.to };
  if (task.kind === 'share' && typeof task.value !== 'number') return { do: 'divide', a: task.value, b: { units: task.k * 1_000_000, dp: 0 } };
  return null;
}

/** The places an answer must be written with (`null`: judged by value): `places`, money 2. */
export const placesAsked = (spec: InputSpec): number | null => spec.places ?? (spec.unit === 'dollar' ? 2 : null);

/** The decimal answers of a written part (a whole number as a decimal). */
export const decimalAnswers = (spec: InputSpec): Decimal[] => (Array.isArray(spec.answer) ? spec.answer : [spec.answer]).map((a) => decimalOf(a) ?? { units: 0, dp: 0 });

/* ------------------------------------------------------------------ */
/* The decimal answer boxes                                            */
/* ------------------------------------------------------------------ */

/** The box ids of a decimal written part: `x`, or `x0`, `x1` … one per `?` of a sentence. */
export function decimalFields(spec: InputSpec): string[] {
  const n = Array.isArray(spec.answer) ? spec.answer.length : 1;
  return n > 1 ? Array.from({ length: n }, (_, i) => `x${i}`) : ['x'];
}

/** What a decimal box keeps of what is typed: digits and one point, a lone point read as 0. (`.35` → `0.35`). */
export function cleanDecimal(raw: string): string {
  let out = '';
  let point = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') out += ch;
    else if (ch === '.' && !point) {
      point = true;
      out += out === '' ? '0.' : '.';
    }
  }
  const [w = '', f] = out.split('.');
  return f === undefined ? w.slice(0, 5) : `${w.slice(0, 5)}.${f.slice(0, 6)}`;
}

/** The decimals written (`null` while a box is empty or holds only a point). */
export function readDecimals(spec: InputSpec, input: Readonly<Record<string, string>>): Decimal[] | null {
  const out: Decimal[] = [];
  for (const f of decimalFields(spec)) {
    const d = parseDecimal(input[f] ?? '');
    if (!d) return null;
    out.push(d);
  }
  return out;
}

/** The boxes the answers fill (solve, "Show me"), written with the places asked for. */
export function decimalBoxes(spec: InputSpec): Record<string, string> {
  const places = placesAsked(spec);
  const fields = decimalFields(spec);
  return Object.fromEntries(decimalAnswers(spec).map((a, i) => [fields[i]!, formatDecimal(places === null ? a : withPlaces({ units: a.units, dp: places }, places))]));
}

/** The boxes of a sample (`"0.43"`, `"3,5"`), as the child wrote them (`"0.10"` stays). */
export function decimalSampleBoxes(spec: InputSpec, text: string): Record<string, string> | null {
  const parts = text.split(',').map((x) => x.trim());
  const fields = decimalFields(spec);
  if (parts.length !== fields.length || !parts.every((p) => parseDecimal(p))) return null;
  return Object.fromEntries(fields.map((f, i) => [f, parts[i]!]));
}

/* ------------------------------------------------------------------ */
/* Checking                                                            */
/* ------------------------------------------------------------------ */

export interface DecimalCheck {
  ok: boolean;
  code: MisconceptionCode | null;
  near?: boolean;
}
const OK: DecimalCheck = { ok: true, code: null };
const NOT_YET: DecimalCheck = { ok: false, code: null };

/** A decimal written part: each box against its answer (value; with `places`, written with them). */
export function checkDecimalInput(task: Task, spec: InputSpec, written: readonly Decimal[], codes: readonly MisconceptionCode[]): DecimalCheck {
  const answers = decimalAnswers(spec);
  const places = placesAsked(spec);
  for (const [i, c] of answers.entries()) {
    const x = written[i];
    if (!x) return NOT_YET;
    if (eq(x, c) && (places === null || x.dp === places)) continue;
    if (places !== null && eq(x, c) && x.dp < places) return { ok: false, code: 'places-short', near: true };
    const ctx = { answer: c, places, work: answers.length === 1 ? workOf(task, spec) : null };
    return { ok: false, code: diagnoseDecimal(codes.filter((k) => k !== 'places-short'), ctx, x) };
  }
  return OK;
}

const SYM: Record<-1 | 0 | 1, Claim> = { [-1]: '<', 0: '=', 1: '>' };

/** The model phase of a decimal task. */
export function checkDecimalModel(task: Task, s: DecimalState & { place: number | null; symbol: Claim | null; pick: 'a' | 'b' | null; order: number[] }, codes: readonly MisconceptionCode[]): DecimalCheck {
  const find = (test: (c: MisconceptionCode) => boolean): DecimalCheck => ({ ok: false, code: codes.find(test) ?? null });
  switch (task.kind) {
    case 'shade-decimal': {
      const x = shadedValue(task, s);
      if (eq(x, task.target)) return OK;
      return find((c) => shadeShows(c, task.target, x));
    }
    case 'place': {
      const x = placedValue(task, s);
      const target = decOf(task.target);
      const m = decimalLine(task.model);
      if (!x || !target || !m) return NOT_YET;
      if (eq(x, target)) return OK;
      const step = levelsFor(m, s.zoomPath).at(-1)!.step;
      return find((c) => placeShows(c, target, x, step));
    }
    case 'compare': {
      const a = decOf(task.a);
      const b = decOf(task.b);
      if (!a || !b) return NOT_YET;
      const claim = task.ask === 'symbol' ? s.symbol : s.pick === null ? null : (task.ask === 'greater' ? s.pick === 'a' : s.pick === 'b') ? '>' : '<';
      if (claim === null) return NOT_YET;
      if (claim === SYM[cmp(a, b)]) return OK;
      return find((c) => compareShows(c, a, b, claim));
    }
    case 'order': {
      if (s.order.length !== task.items.length) return NOT_YET;
      const items = task.items.map((v) => decOf(v) ?? { units: 0, dp: 0 });
      const right = decimalOrder(task);
      if (s.order.every((v, i) => v === right[i])) return OK;
      return find((c) => orderShows(c, items, s.order, task.direction));
    }
    case 'round-on-line': {
      if (!s.end) return NOT_YET;
      const ends = roundingEnds(task.value, task.to);
      const chosen = s.end === 'lo' ? ends.lo : ends.hi;
      if (eq(chosen, ends.nearest)) return OK;
      const ctx = { answer: ends.nearest, places: null, work: { do: 'round' as const, a: task.value, to: task.to } };
      return find((c) => c !== 'places-short' && decimalShows(c, ctx, chosen));
    }
    case 'align-add': {
      if (s.offset === 0) return OK;
      return find((c) => c === 'aligned-right' && s.offset === alignStart(task.a, task.b, 'right'));
    }
    case 'shift-digits': {
      const x = shiftResult(task, s);
      if (!x) return NOT_YET;
      if (eq(x, shiftTarget(task))) return OK;
      return find((c) => shiftShows(c, task.value, task.op, task.by, x));
    }
    case 'share':
      return DPLACES.every((p) => s.pv[p] === 0) ? OK : NOT_YET;
    case 'regroup': {
      const goal = task.goal ? dcounts(task.goal) : null;
      return (goal ? DPLACES.every((p) => s.pv[p] === goal[p]) : dregrouped(s.pv)) ? OK : NOT_YET;
    }
    default:
      return NOT_YET;
  }
}

/** The items of a decimal order task in the right order (indices). */
export function decimalOrder(task: TaskOf<'order'>): number[] {
  const items = task.items.map((v) => decOf(v) ?? { units: 0, dp: 0 });
  return items.map((_, i) => i).sort((i, j) => cmp(items[i]!, items[j]!) * (task.direction === 'asc' ? 1 : -1));
}

/** Enough is done on a decimal model to press Check. */
export function decimalAnswered(task: Task, s: Full): boolean {
  switch (task.kind) {
    case 'shade-decimal':
      return shadedValue(task, s).units !== (task.start?.units ?? 0);
    case 'place':
      return s.place !== null;
    case 'round-on-line':
      return s.end !== null;
    case 'align-add':
      return true;
    case 'shift-digits':
      return s.shift !== 0;
    case 'share':
      return DPLACES.some((p) => s.pvDealt[p] > 0);
    case 'regroup':
      return s.trades > 0;
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ */
/* Solving and samples                                                 */
/* ------------------------------------------------------------------ */

type Move = DecimalAction | { do: 'check' } | { do: 'symbol'; value: Claim } | { do: 'pick'; side: 'a' | 'b' } | { do: 'align' } | { do: 'order'; item: number };

/** The zooms and the tick that place `x` on a task's line. */
function placeMoves(task: TaskOf<'place'>, x: Decimal): DecimalAction[] | null {
  const m = decimalLine(task.model);
  const at = m ? pathTo(m, x, task.zoom ?? 0) : null;
  if (!at) return null;
  return [...at.path.map((seg, level): DecimalAction => ({ do: 'zoom', level, seg })), { do: 'dplace', tick: at.tick }];
}

/** Sharing on the chart from the top place: share it, trade what is left down, on to the next place. */
function shareMoves(task: TaskOf<'share'>): DecimalAction[] {
  const out: DecimalAction[] = [];
  let pv = decimalInitial(task).pv;
  let dealt = { ...DZERO };
  for (const p of DPLACES) {
    if (pv[p] >= task.k) {
      out.push({ do: 'dshare', place: p });
      ({ mat: pv, dealt } = dsharePlace(pv, dealt, p, task.k));
    }
    const down = below(p);
    while (down && pv[p] > 0) {
      const trade = `${p}>${down}` as DTrade;
      out.push({ do: 'dtrade', trade });
      pv = applyDTrade(pv, trade);
    }
  }
  return out;
}

/** Trades that bring the chart to the goal (or every place under 10). */
function regroupMoves(task: TaskOf<'regroup'>): DecimalAction[] {
  const out: DecimalAction[] = [];
  let pv = dcounts(task.start);
  const goal = task.goal ? dcounts(task.goal) : null;
  const go = (trade: DTrade) => {
    out.push({ do: 'dtrade', trade });
    pv = applyDTrade(pv, trade);
  };
  if (goal) {
    for (const p of DPLACES) {
      const down = below(p);
      while (down && pv[p] > goal[p] && canDTrade(pv, `${p}>${down}` as DTrade)) go(`${p}>${down}` as DTrade);
    }
  }
  for (const p of [...DPLACES].reverse()) {
    const up = DPLACES[DPLACES.indexOf(p) - 1];
    while (up && pv[p] >= 10 && (!goal || pv[p] > goal[p])) go(`${p}>${up}` as DTrade);
  }
  return out;
}

/** The moves of a decimal task's model phase, done right. */
export function decimalSolveModel(task: Task): Move[] {
  switch (task.kind) {
    case 'shade-decimal':
      return [{ do: 'dfill', th: Math.round(task.target.units / 1000) }];
    case 'place': {
      const t = decOf(task.target);
      return (t && placeMoves(task, t)) ?? [];
    }
    case 'compare': {
      const a = decOf(task.a)!;
      const b = decOf(task.b)!;
      const c = cmp(a, b);
      const align: Move[] = task.align ? [{ do: 'align' }] : [];
      if (task.ask === 'symbol') return [...align, { do: 'symbol', value: SYM[c] }];
      return [...align, { do: 'pick', side: (task.ask === 'greater' ? c > 0 : c < 0) ? 'a' : 'b' }];
    }
    case 'order':
      return decimalOrder(task).map((item) => ({ do: 'order', item }));
    case 'round-on-line': {
      const e = roundingEnds(task.value, task.to);
      return [{ do: 'end', side: eq(e.nearest, e.lo) ? 'lo' : 'hi' }];
    }
    case 'align-add':
      return [{ do: 'offset', to: 0 }];
    case 'shift-digits':
      return [{ do: 'shift', to: (task.op === '×' ? 1 : -1) * (String(task.by).length - 1) }];
    case 'share':
      return shareMoves(task);
    case 'regroup':
      return regroupMoves(task);
    default:
      return [];
  }
}

/** The state of a wrong answer written in a decimal task's notation (`null` when it does not parse). */
export function decimalSample<S extends DecimalState & { place: number | null; order: number[] }>(task: Task, start: S, sample: string, apply: (from: S, moves: Move[]) => S): S | null {
  switch (task.kind) {
    case 'shade-decimal': {
      const d = parseDecimal(sample);
      return d ? apply(start, [{ do: 'dfill', th: Math.round(d.units / 1000) }]) : null;
    }
    case 'place': {
      const d = parseDecimal(sample);
      const moves = d ? placeMoves(task, d) : null;
      return moves ? apply(start, moves) : null;
    }
    case 'order': {
      const values = sample.split(',').map((x) => parseDecimal(x.trim()));
      if (values.some((v) => !v)) return null;
      const items = task.items.map((v) => decOf(v));
      const order = values.map((v) => items.findIndex((it) => !!it && same(it, v!))).map((i, k) => (i >= 0 ? i : items.findIndex((it) => !!it && eq(it, values[k]!))));
      return order.includes(-1) ? null : { ...start, order };
    }
    case 'round-on-line': {
      const m = /^end:(.+)$/.exec(sample);
      const d = m ? parseDecimal(m[1]!) : null;
      if (!d) return null;
      const e = roundingEnds(task.value, task.to);
      return eq(d, e.lo) ? { ...start, end: 'lo' } : eq(d, e.hi) ? { ...start, end: 'hi' } : null;
    }
    case 'align-add': {
      const m = /^align:(right|left|point)$/.exec(sample);
      if (!m) return null;
      return { ...start, offset: m[1] === 'point' ? 0 : alignStart(task.a, task.b, m[1] as 'right' | 'left') };
    }
    case 'shift-digits': {
      const d = parseDecimal(sample);
      if (!d) return null;
      for (let k = -MOVE_MAX; k <= MOVE_MAX; k++) {
        const v = shiftedValue(task.value, k);
        if (k !== 0 && v && eq(v, d)) return { ...start, shift: k };
      }
      return null;
    }
    case 'share':
    case 'regroup': {
      // A list of moves from the start: `t>h` a trade, `t` share that place (`O,O>t,t`).
      let s = start;
      for (const move of sample.split(',').map((x) => x.trim())) {
        const a: DecimalAction | null = /^(Th|H|T|O|t|h|th)>(Th|H|T|O|t|h|th)$/.test(move) ? { do: 'dtrade', trade: move as DTrade } : /^(Th|H|T|O|t|h|th)$/.test(move) && task.kind === 'share' ? { do: 'dshare', place: move as DPlace } : null;
        if (!a) return null;
        const next = apply(s, [a]);
        if (next === s) return null;
        s = next;
      }
      return s;
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* For the card, the plate and the sentence                            */
/* ------------------------------------------------------------------ */

/** The quotient a decimal share comes to. */
export function shareQuotient(task: TaskOf<'share'>): Decimal | null {
  if (typeof task.value === 'number') return null;
  const q = divWhole(task.value, task.k, 3);
  return q.exact ? q.q : null;
}

/** The discs on each plate as a decimal. */
export const dealtValue = (s: DecimalState): Decimal => asDecimal(dtotal(s.pvDealt));

/** The value the chart's discs make. */
export const chartValue = (s: DecimalState): Decimal => asDecimal(dtotal(s.pv));

/** Answers written as decimals for the "The answer" line: `0.35`, `$2.50`, `3.0`. */
export function decimalAnswerText(spec: InputSpec): string[] {
  const places = placesAsked(spec);
  return decimalAnswers(spec).map((a) => {
    const d = places === null ? a : withPlaces({ units: a.units, dp: places }, places);
    return spec.unit === 'dollar' ? `$${formatDecimal(d)}` : formatDecimal(d);
  });
}

