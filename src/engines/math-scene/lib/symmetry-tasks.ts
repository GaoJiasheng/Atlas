/**
 * The line-symmetry checks (docs/79 §3.2–3.3): which tasks are in the
 * `symmetry` domain, what `complete-symmetric` keeps in the task state (the
 * squares and half squares, or the corners in order, the child put on the
 * other side of the line; "Fold it" on or off), how a move changes it, how
 * it is checked and diagnosed, the right way through (solve) and the state a
 * wrong-answer sample stands for. `state.ts`, `check.ts` and `solve.ts` hand
 * these tasks to this module. Pure.
 *
 * Samples: `"cells:(7,2),(8,2),(7,3,ne)"` (squares and half squares put down),
 * `"pts:(7,1),(9,1),(9,3)"` (corners, in the order put down).
 *
 * A line of symmetry drawn on the grid (`draw-segment`, relation `symmetry`,
 * docs/79 §2.2) picks two grid corners the same way a line on dot paper does
 * (the dots are kept in the angle state, `dpts`); it is checked here: right
 * when the line through them folds the figures onto themselves.
 */
import type { GridFigure, GridModelSpec, MisconceptionCode, Model, SymLineSpec, Task, TaskOf } from '../schema';
import { cellKey, extentOf, figureCells, figureHalves, figureOf, halfKey, parseCell, parseHalf, readingOrder } from './grid';
import { axisOf, figurePieces, isSymmetric, linesOfSymmetry, partnerKey, partnerPoint, type Line, type Piece } from './symmetry';
import { diagnoseCompletion, diagnoseDrawnLine, isRight, type Completion } from './diagnose/symmetry';

/* ------------------------------------------------------------------ */
/* Which tasks                                                          */
/* ------------------------------------------------------------------ */

/** A grid drawn for line symmetry: a line of symmetry, a line to test, a fold, partners, or a figure only this lesson draws. */
export function isSymmetryModel(m: Model): m is GridModelSpec {
  return m.kind === 'grid' && (!!m.mirror || !!m.candidates || !!m.fold || !!m.pairs || m.figures.some((f) => !!f.shape || !!f.path || !!f.shade || f.tone === 'signal'));
}

/** The same test as a plain flag (no narrowing of the model where it is already known to be a grid). */
export const drawsSymmetry = (m: Model): boolean => isSymmetryModel(m);

/** Is the task in the `symmetry` domain? */
export function isSymmetryTask(task: Task): boolean {
  if (task.kind === 'complete-symmetric') return true;
  if (task.kind === 'draw-segment') return task.model.kind === 'grid';
  if (isSymmetryModel(task.model)) return true;
  return task.kind === 'choose' && task.options.some((o) => (!!o.model && isSymmetryModel(o.model)) || o.symmetric !== undefined || o.lines !== undefined);
}

/**
 * The way a symmetry task asks (docs/79 §2.3): a completion with squares or with corners; a yes / no about a line,
 * a count, several pictures, one picture. The practice counts ways, not kinds, for its "at least 5 kinds of task".
 */
export function symWay(task: Task): string {
  if (task.kind === 'complete-symmetric') return `complete-symmetric:${task.mode}`;
  if (task.kind !== 'choose') return task.kind;
  if (task.options.some((o) => o.lines !== undefined)) return 'choose:lines';
  if (task.multi) return 'choose:multi';
  return task.options.some((o) => o.model) ? 'choose:picture' : 'choose:line';
}

/** The line a task works on: a completion's line of symmetry, else the line being tested, else the first line of symmetry. */
export function taskLine(task: Task): SymLineSpec | null {
  const m = task.model;
  if (m.kind !== 'grid' || (task.kind === 'choose' && task.options.some((o) => o.model))) return null;
  if (task.kind === 'complete-symmetric') return m.mirror?.[0] ?? null;
  return m.candidates?.[0] ?? m.mirror?.[0] ?? null;
}

/** The given half of a completion. */
export function givenOf(task: TaskOf<'complete-symmetric'>): GridFigure | null {
  return task.model.kind === 'grid' ? figureOf(task.model, task.figure) : null;
}

/* ------------------------------------------------------------------ */
/* The completion's geometry                                            */
/* ------------------------------------------------------------------ */

export interface Plan {
  ax: { axis: 'x' | 'y'; at: number };
  mode: 'cells' | 'outline';
  /** The given squares and half squares (cells), or the given line's points in order (outline). */
  given: string[];
  /** The partners to put down (cells: reading order; outline: the order that carries the line on from its last point). */
  right: string[];
  /** The side the child works on: +1 right of / above the line, −1 left of / below it. */
  side: 1 | -1;
  /** The paper: columns × rows. */
  cols: number;
  rows: number;
  /** The given line's two ends (outline). */
  ends: [string, string] | null;
}

const plans = new WeakMap<object, Plan | null>();

/** What a completion asks for (memoised; `null` when it cannot be worked out: validate says why). */
export function planOf(task: TaskOf<'complete-symmetric'>): Plan | null {
  if (plans.has(task)) return plans.get(task)!;
  const plan = makePlan(task);
  plans.set(task, plan);
  return plan;
}

function makePlan(task: TaskOf<'complete-symmetric'>): Plan | null {
  const m = task.model;
  const line = taskLine(task);
  const ax = line ? axisOf(line) : null;
  const f = givenOf(task);
  if (m.kind !== 'grid' || !ax || !f) return null;
  const ext = extentOf(m);
  const coord = (x: number, y: number) => (ax.axis === 'x' ? x : y);
  if (task.mode === 'outline') {
    const path = f.path;
    if (!path || path.length < 3) return null;
    const pts = path.map(([x, y]) => `${x},${y}`);
    const inner = path.slice(1, -1);
    const right = [...inner].reverse().map((p) => partnerPoint(p, ax).join(','));
    const mid = inner.reduce((s, p) => s + coord(p[0], p[1]), 0) / Math.max(1, inner.length);
    return { ax, mode: 'outline', given: pts, right, side: mid < ax.at ? 1 : -1, cols: ext.w, rows: ext.h, ends: [pts[0]!, pts.at(-1)!] };
  }
  const cells = [...figureCells(f)];
  const halves = figureHalves(f).map(halfKey);
  const given = [...cells, ...halves];
  const right = readingOrder([...cells.map((k) => partnerKey(k, ax)).filter((k) => !cells.includes(k))]).concat(halves.map((k) => partnerKey(k, ax)).filter((k) => !halves.includes(k)));
  const centres = given.map((k) => {
    const h = parseHalf(k);
    const [x, y] = h ? [h.x, h.y] : parseCell(k);
    return coord(x + 0.5, y + 0.5);
  });
  const mid = centres.reduce((s, v) => s + v, 0) / Math.max(1, centres.length);
  return { ax, mode: 'cells', given, right, side: mid < ax.at ? 1 : -1, cols: ext.w, rows: ext.h, ends: null };
}

/** May the child put a square (or half square) at cell (x, y)? Wholly on the other side, on the paper. */
export function cellOpen(plan: Plan, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= plan.cols || y >= plan.rows) return false;
  const lo = plan.ax.axis === 'x' ? x : y;
  return plan.side > 0 ? lo >= plan.ax.at : lo + 1 <= plan.ax.at;
}

/** May the child put a corner at grid point (x, y)? Strictly on the other side, on the paper. */
export function pointOpen(plan: Plan, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > plan.cols || y > plan.rows) return false;
  const v = plan.ax.axis === 'x' ? x : y;
  return plan.side > 0 ? v > plan.ax.at : v < plan.ax.at;
}

/** The completion to diagnose. */
export function completionOf(task: TaskOf<'complete-symmetric'>, child: readonly string[]): Completion | null {
  const plan = planOf(task);
  if (!plan) return null;
  const given = plan.mode === 'outline' ? plan.given.slice(1, -1) : plan.given;
  return { ax: plan.ax, mode: plan.mode, given, right: plan.right, child: [...child] };
}

/* ------------------------------------------------------------------ */
/* State and moves                                                      */
/* ------------------------------------------------------------------ */

export interface SymState {
  /** complete-symmetric: squares and half squares put down (`"7,2"`, `"7,3,ne"`), or corners in order (`"7,1"`). */
  sym: string[];
  /** "Fold it" is on: the given half (or the stage's figure) is folded over to look (not checked). */
  sfold: boolean;
}

export type SymAction = { do: 'stile'; key: string } | { do: 'spoint'; key: string } | { do: 'sfold' };
export const SYM_ACTIONS = new Set(['stile', 'spoint', 'sfold']);
export const symInitial = (): SymState => ({ sym: [], sfold: false });
/** Corners a child may put down beyond the ones asked for (a slip to undo, not an endless line). */
const SPARE = 3;

/** Apply a symmetry move (meaningless moves leave the state as it is). */
export function symReduce<S extends SymState>(task: Task, state: S, action: SymAction): S {
  if (action.do === 'sfold') return isSymmetryTask(task) && (taskLine(task) || task.kind === 'draw-segment') ? { ...state, sfold: !state.sfold } : state;
  if (task.kind !== 'complete-symmetric') return state;
  const plan = planOf(task);
  if (!plan) return state;
  if (action.do === 'stile') {
    if (plan.mode !== 'cells') return state;
    if (state.sym.includes(action.key)) return { ...state, sym: state.sym.filter((k) => k !== action.key) };
    const h = parseHalf(action.key);
    const [x, y] = h ? [h.x, h.y] : parseCell(action.key);
    if (!Number.isInteger(x) || !Number.isInteger(y) || !cellOpen(plan, x, y)) return state;
    // One thing per square: a half square replaces the square there, and the other way round.
    const at = cellKey(x, y);
    const rest = state.sym.filter((k) => {
      const o = parseHalf(k);
      return (o ? cellKey(o.x, o.y) : k) !== at;
    });
    return { ...state, sym: [...rest, action.key] };
  }
  if (plan.mode !== 'outline') return state;
  if (state.sym.includes(action.key)) return { ...state, sym: state.sym.filter((k) => k !== action.key) };
  const [x, y] = action.key.split(',').map(Number) as [number, number];
  if (!Number.isInteger(x) || !Number.isInteger(y) || !pointOpen(plan, x, y) || state.sym.length >= plan.right.length + SPARE) return state;
  return { ...state, sym: [...state.sym, `${x},${y}`] };
}

/** Clear the completion (the tray's "Clear"); the fold stays as it is. */
export const symClear = <S extends SymState>(state: S): S => (state.sym.length ? { ...state, sym: [] } : state);

/* ------------------------------------------------------------------ */
/* Checking                                                             */
/* ------------------------------------------------------------------ */

export interface SymCheck {
  ok: boolean;
  code: MisconceptionCode | null;
}

/* A line of symmetry drawn on the grid */

/** The figures a line drawn on the grid is about (ghosts left out). */
export function segmentPieces(task: TaskOf<'draw-segment'>): Piece[] {
  return task.model.kind === 'grid' ? task.model.figures.filter((f) => f.tone !== 'ghost').flatMap(figurePieces) : [];
}

/** The two corners picked (the given start first), else `null`. */
function pickedLine(task: TaskOf<'draw-segment'>, dpts: readonly (readonly [number, number])[]): Line | null {
  const pts = task.from ? [task.from, ...dpts] : dpts;
  return pts.length >= 2 ? { a: pts[0]!, b: pts[1]! } : null;
}

/** The child's line on a symmetry grid, as a segment (`null`: not a line drawn there, or not both corners yet). */
export function drawnLine(task: Task, s: { dpts: readonly (readonly [number, number])[] }): SymLineSpec | null {
  if (task.kind !== 'draw-segment' || task.model.kind !== 'grid') return null;
  const l = pickedLine(task, s.dpts);
  return l ? { from: [l.a[0], l.a[1]], to: [l.b[0], l.b[1]] } : null;
}

/** A line drawn is a line of symmetry: at least 2 squares long, and folding along it matches. */
export function symSegmentRight(task: TaskOf<'draw-segment'>, l: Line): boolean {
  if (Math.max(Math.abs(l.b[0] - l.a[0]), Math.abs(l.b[1] - l.a[1])) < 2) return false;
  return isSymmetric(segmentPieces(task), l);
}

/** A line of symmetry up or across through grid corners, drawn across the whole paper (`null`: none). */
export function symSegmentSolution(task: TaskOf<'draw-segment'>): [[number, number], [number, number]] | null {
  if (task.model.kind !== 'grid') return null;
  const e = extentOf(task.model);
  const whole = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;
  for (const l of linesOfSymmetry(segmentPieces(task))) {
    if (Math.abs(l.a[0] - l.b[0]) < 1e-9 && whole(l.a[0])) return [[Math.round(l.a[0]), 0], [Math.round(l.a[0]), e.h]];
    if (Math.abs(l.a[1] - l.b[1]) < 1e-9 && whole(l.a[1])) return [[0, Math.round(l.a[1])], [e.w, Math.round(l.a[1])]];
  }
  return null;
}

/** The model phase of a completion or of a line of symmetry drawn (`null`: neither). */
export function checkSymModel(task: Task, s: SymState & { dpts?: readonly (readonly [number, number])[] }, codes: readonly MisconceptionCode[]): SymCheck | null {
  if (task.kind === 'draw-segment' && task.model.kind === 'grid') {
    const l = pickedLine(task, s.dpts ?? []);
    if (!l) return { ok: false, code: null };
    if (symSegmentRight(task, l)) return { ok: true, code: null };
    return { ok: false, code: diagnoseDrawnLine(codes, segmentPieces(task), l) };
  }
  if (task.kind !== 'complete-symmetric') return null;
  const c = completionOf(task, s.sym);
  if (!c || s.sym.length === 0) return { ok: false, code: null };
  if (isRight(c)) return { ok: true, code: null };
  return { ok: false, code: diagnoseCompletion(codes, c) };
}

/** Enough is done to press Check (`null`: not a completion). */
export const symAnswered = (task: Task, s: SymState): boolean | null => (task.kind === 'complete-symmetric' ? s.sym.length > 0 : null);

/* ------------------------------------------------------------------ */
/* Solving and samples                                                  */
/* ------------------------------------------------------------------ */

/** The moves of a completion done right (`null`: not a completion). */
export function symSolveModel(task: Task): SymAction[] | null {
  if (task.kind !== 'complete-symmetric') return null;
  const plan = planOf(task);
  if (!plan) return [];
  return plan.right.map((key) => (plan.mode === 'cells' ? { do: 'stile', key } : { do: 'spoint', key }));
}

/** The state of a wrong answer in a completion's notation (`null`: it does not parse; `undefined`: not a completion). */
export function symSample<S extends SymState>(task: Task, start: S, sample: string, apply: (from: S, moves: SymAction[]) => S): S | null | undefined {
  if (task.kind !== 'complete-symmetric') return undefined;
  const m = /^(cells|pts):(.+)$/.exec(sample.trim());
  if (!m || (m[1] === 'cells') !== (task.mode === 'cells')) return null;
  const keys = [...m[2]!.matchAll(/\(([^)]*)\)/g)].map((g) => g[1]!.replace(/\s+/g, ''));
  if (keys.length === 0) return null;
  const out = apply(start, keys.map((key) => (task.mode === 'cells' ? { do: 'stile', key } : { do: 'spoint', key })));
  return out.sym.length === keys.length && keys.every((k) => out.sym.includes(k)) ? out : null;
}
