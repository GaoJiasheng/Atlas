/**
 * The nets checks (docs/39 §3.5–3.6): what `complete-net` and `tap-face`
 * keep in the task state, how a move changes it, how they are checked — a
 * completed net by folding the child's net all the way, a tapped face by
 * where it lands — and diagnosed, the right way through (solve), the state a
 * wrong-answer sample stands for, and the numbers written about a net (how
 * many faces, how long an edge). `state.ts`, `check.ts` and `solve.ts` hand
 * net tasks to this module. Pure.
 *
 * Samples: `"cells:3,1"` / `"cells:3,1;4,2"` (squares placed), `"rects:2"`,
 * `"faces:1"`, `"pick:0,2"` (candidates by their place in the list, from 0);
 * `"face:2,1"`, `"face:end-a"`, `"face:3"` (the face tapped).
 */
import type { InputSpec, MisconceptionCode, NetLayout, NetModelSpec, Task, TaskOf } from '../schema';
import { buildNet, cubeNetPlacements, cubeNetName, foldResult, layoutOf, netCells, nodeIndex, pieceShapes, type FoldResult, type Net, type P2 } from './net';
import { curvedCloses, curvedFaceCount } from './curved';
import { dot, edgeLengths, faceIds, faceShapes, isCurved, polyNormal, shareEdge } from './solid';
import { netItems, type SolidNet } from './net-view';
import { diagnoseFolded, tappedShows, writtenShows, type Folded } from './diagnose/nets';
import { answerValues } from './forms';
import { isFracValue } from './value';

/* ------------------------------------------------------------------ */
/* Which tasks                                                          */
/* ------------------------------------------------------------------ */

export const isNetModel = (m: Task['model']): m is NetModelSpec => m.kind === 'net';

/** Is the task in the `nets` domain (a net on the stage or in an option, or a net task)? */
export function isNetTask(task: Task): boolean {
  if (task.kind === 'complete-net' || task.kind === 'tap-face') return true;
  if (isNetModel(task.model)) return true;
  return task.kind === 'choose' && task.options.some((o) => !!o.model && isNetModel(o.model));
}

/**
 * The way a nets task asks (docs/39 §2.3: four kinds, seven ways): a net completed on free paper, next to the faces or
 * from a list; the opposite face or a box's bottom tapped; a name, a "does it fold", several, a picture chosen; a number.
 * The practice counts ways, not kinds, for its "at least 5 kinds of task".
 */
export function netWay(task: Task): string {
  if (task.kind === 'complete-net') return `complete-net:${Array.isArray(task.candidates) ? 'list' : task.candidates}`;
  if (task.kind === 'tap-face') return `tap-face:${task.ask}`;
  if (task.kind === 'choose') return `choose:${task.multi ? 'multi' : task.options.some((o) => o.solid) ? 'name' : task.options.some((o) => o.folds !== undefined) ? 'folds' : 'picture'}`;
  return task.kind;
}

/** The task's own net (its model's first picture). */
export function taskNetSpec(task: Task): SolidNet | null {
  return isNetModel(task.model) ? (netItems(task.model)[0] ?? null) : null;
}

const nets = new WeakMap<object, Net>();
/** The net of a polyhedron's spec (memoised). */
export function netOfSpec(spec: SolidNet): Net | null {
  if (isCurved(spec.solid)) return null;
  const hit = nets.get(spec);
  if (hit) return hit;
  const n = buildNet(spec);
  nets.set(spec, n);
  return n;
}

/** What a net spec folds into, for the rules: closes, pieces, faces, overlaps, pieces the wrong size. */
export function foldedOf(spec: SolidNet): Folded & { r: FoldResult | null; cross: boolean; curvedWrong: boolean } {
  const s = spec.solid;
  if (s.type === 'cylinder' || s.type === 'cone') {
    const closes = curvedCloses(s, spec.curved);
    const pieces = curvedFaceCount(s, spec.curved);
    const faces = faceIds(s).length;
    const curvedWrong = (spec.curved?.wrap ?? 1) !== 1 || spec.curved?.lateral === 'triangle';
    // Two circles on one long edge: as many faces as a cylinder has, one end covered twice and the other open.
    const caps = spec.curved?.caps ?? [];
    const sameEdge = s.type === 'cylinder' && caps.length === 2 && caps.every((c) => typeof c === 'object' && c.edge === (typeof caps[0] === 'object' ? caps[0].edge : 'top'));
    return { closes, pieces, faces, overlaps: sameEdge ? 1 : 0, sizeMismatch: 0, r: null, cross: false, curvedWrong };
  }
  if (s.type === 'sphere') return { closes: false, pieces: 0, faces: 1, overlaps: 0, sizeMismatch: 0, r: null, cross: false, curvedWrong: false };
  const net = netOfSpec(spec)!;
  const r = foldResult(net);
  const faces = faceIds(s).length - (spec.open ? 1 : 0);
  const cells = netCells(net);
  return { closes: r.closes, pieces: net.nodes.length, faces, overlaps: r.overlaps.length, sizeMismatch: r.sizeMismatch.length, r, cross: !!cells && cubeNetName(cells) === '141-e', curvedWrong: false };
}

/* ------------------------------------------------------------------ */
/* State and moves                                                      */
/* ------------------------------------------------------------------ */

export interface NetState {
  /** complete-net: the candidates placed, in order (`"x,y"` a square on the paper, `"2"` a candidate by index). */
  nplaced: string[];
  /** tap-face: the face tapped (its piece's index). */
  ntapped: number | null;
}

export type NetAction = { do: 'nplace'; key: string } | { do: 'ntap'; node: number };
export const NET_ACTIONS = new Set(['nplace', 'ntap']);
export const netInitial = (): NetState => ({ nplaced: [], ntapped: null });

/** A candidate place: a square on the paper, a rectangle, a face hung on a face. */
export interface Candidate {
  key: string;
  cell?: P2;
  rect?: [number, number, number, number];
  pair?: [string, string];
}

/** The squared paper of a free or adjacent task (columns × rows). */
export function paperOf(task: TaskOf<'complete-net'>): [number, number] {
  if (task.box) return task.box;
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  const pts = net?.nodes.flatMap((n) => n.poly) ?? [];
  return [Math.max(6, ...pts.map((p) => p[0] + 1)), Math.max(5, ...pts.map((p) => p[1] + 1))];
}

const cellKey = (c: P2) => `${c[0]},${c[1]}`;

/** The given layout's cells (a cube net on squares). */
function givenCells(task: TaskOf<'complete-net'>): P2[] {
  const spec = taskNetSpec(task);
  if (!spec) return [];
  const l = layoutOf(spec);
  return 'cells' in l ? l.cells.map((c) => [c[0], c[1]] as P2) : [];
}

/** Where the child may place a face now. */
export function candidatesOf(task: TaskOf<'complete-net'>, placed: readonly string[]): Candidate[] {
  if (Array.isArray(task.candidates)) {
    return task.candidates.map((c, i) => {
      const key = String(i);
      if (typeof c[0] === 'string') return { key, pair: [c[0], c[1] as string] };
      return c.length === 4 ? { key, rect: [c[0] as number, c[1] as number, c[2] as number, c[3] as number] } : { key, cell: [c[0] as number, c[1] as number] };
    });
  }
  const [cols, rows] = paperOf(task);
  const taken = new Set([...givenCells(task).map(cellKey), ...placed]);
  const out: Candidate[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      if (placed.includes(key)) {
        out.push({ key, cell: [x, y] });
        continue;
      }
      if (taken.has(key)) continue;
      const next = [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`].some((k) => taken.has(k));
      if (task.candidates === 'free' || next) out.push({ key, cell: [x, y] });
    }
  return out;
}

/** Where each candidate lies flat (a face on a face: where the net with it added puts it). */
export function candidatePolys(task: TaskOf<'complete-net'>, placed: readonly string[]): { key: string; poly: P2[] }[] {
  return candidatesOf(task, placed).map((c) => {
    if (c.cell) return { key: c.key, poly: [[c.cell[0], c.cell[1]], [c.cell[0] + 1, c.cell[1]], [c.cell[0] + 1, c.cell[1] + 1], [c.cell[0], c.cell[1] + 1]] as P2[] };
    if (c.rect) {
      const [x, y, w, h] = c.rect;
      return { key: c.key, poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as P2[] };
    }
    const spec = childSpec(task, [...placed.filter((x) => x !== c.key), c.key]);
    return { key: c.key, poly: (spec && netOfSpec(spec)?.nodes.at(-1)?.poly) || [] };
  });
}

/** The child's net: the given faces and the ones placed. */
export function childSpec(task: TaskOf<'complete-net'>, placed: readonly string[]): SolidNet | null {
  const spec = taskNetSpec(task);
  if (!spec) return null;
  const l = layoutOf(spec);
  const all = candidatesOf(task, placed);
  const chosen = placed.map((k) => all.find((c) => c.key === k)).filter((c): c is Candidate => !!c);
  let layout: NetLayout;
  if ('cells' in l) layout = { cells: [...l.cells.map((c) => [c[0], c[1]] as P2), ...chosen.flatMap((c) => (c.cell ? [c.cell] : []))] };
  else if ('rects' in l) layout = { rects: [...l.rects.map((r) => [...r] as [number, number, number, number]), ...chosen.flatMap((c) => (c.rect ? [c.rect] : []))] };
  else if ('tree' in l) layout = { tree: [...l.tree, ...chosen.flatMap((c) => (c.pair ? [c.pair] : []))] };
  else return null;
  return { ...spec, layout, fold: 0 };
}

/** Apply a net move (meaningless moves leave the state as it is). */
export function netReduce<S extends NetState>(task: Task, state: S, action: NetAction): S {
  if (action.do === 'nplace') {
    if (task.kind !== 'complete-net') return state;
    if (state.nplaced.includes(action.key)) return { ...state, nplaced: state.nplaced.filter((k) => k !== action.key) };
    if (state.nplaced.length >= task.add || !candidatesOf(task, state.nplaced).some((c) => c.key === action.key)) return state;
    return { ...state, nplaced: [...state.nplaced, action.key] };
  }
  if (task.kind !== 'tap-face') return state;
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  if (!net || action.node < 0 || action.node >= net.nodes.length || action.node === markOf(task)) return state;
  return action.node === state.ntapped ? state : { ...state, ntapped: action.node };
}

/** Clear the net work (the tray's "Clear"). */
export const netClear = <S extends NetState>(state: S): S => ({ ...state, ...netInitial() });

/** The face a tap-face task gives (its `mark`). */
export function markOf(task: Task): number | null {
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  return net && spec?.mark !== undefined ? nodeIndex(net, spec.mark) : null;
}

/* ------------------------------------------------------------------ */
/* Checking                                                             */
/* ------------------------------------------------------------------ */

export interface NetCheck {
  ok: boolean;
  code: MisconceptionCode | null;
}
const OK: NetCheck = { ok: true, code: null };
const NOT_YET: NetCheck = { ok: false, code: null };

/** The face a tap-face task asks for: the one opposite the marked face, or the bottom of the box with no lid (opposite the face left open). */
export function tapAnswer(task: TaskOf<'tap-face'>): number | null {
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  if (!net) return null;
  const r = foldResult(net);
  if (task.ask === 'opposite') {
    const m = markOf(task);
    return m === null ? null : r.opposite(m);
  }
  // The bottom of a box with no lid: the piece on the face opposite the one left open.
  const open = net.target.find((f) => f.id === (net.open ?? r.missing[0]));
  if (!open) return null;
  const n = polyNormal(open.pts);
  const bottom = net.target.find((f) => dot(polyNormal(f.pts), n) < -1 + 1e-9);
  const i = r.lands.findIndex((l, k) => !!bottom && l === bottom.id && r.exact[k]);
  return i >= 0 ? i : null;
}

/** The model phase of a net task (`null`: not one of them). */
export function checkNetModel(task: Task, s: NetState, codes: readonly MisconceptionCode[]): NetCheck | null {
  if (task.kind === 'complete-net') {
    if (s.nplaced.length < task.add) return NOT_YET;
    const spec = childSpec(task, s.nplaced);
    if (!spec) return NOT_YET;
    const f = foldedOf(spec);
    if (f.closes) return OK;
    return { ok: false, code: diagnoseFolded(codes, f) };
  }
  if (task.kind === 'tap-face') {
    if (s.ntapped === null) return NOT_YET;
    if (s.ntapped === tapAnswer(task)) return OK;
    const spec = taskNetSpec(task)!;
    const net = netOfSpec(spec)!;
    const m = markOf(task);
    const lands = foldResult(net).lands;
    const tapped = lands[s.ntapped];
    const marked = m === null ? null : lands[m];
    const adjacent = task.ask === 'opposite' && !!tapped && !!marked && touching(net, tapped, marked);
    return { ok: false, code: codes.find((c) => tappedShows(c, adjacent)) ?? null };
  }
  return null;
}

/** Two faces of the folded solid share an edge. */
function touching(net: Net, a: string, b: string): boolean {
  if (net.layout === 'tree') return shareEdge(net.solid, a, b);
  const fa = net.target.find((f) => f.id === a);
  const fb = net.target.find((f) => f.id === b);
  if (!fa || !fb || a === b) return false;
  const near = (p: number[], q: number[]) => Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!) < 1e-6;
  return fa.pts.filter((p) => fb.pts.some((q) => near(p, q))).length >= 2;
}

/** Enough is done on a net to press Check (`null`: not a net task). */
export function netAnswered(task: Task, s: NetState): boolean | null {
  if (task.kind === 'complete-net') return s.nplaced.length === task.add;
  if (task.kind === 'tap-face') return s.ntapped !== null;
  return null;
}

/** The number a net's written question is about: how many faces (pieces of the net on show, else the solid's), or an edge's length. */
export function netNumberCtx(task: Task, spec: InputSpec): { ask: 'faces' | 'length'; shapeCounts: number[]; edgeLengths: number[]; faces: number } | null {
  const n = taskNetSpec(task);
  if (!n || (spec.ask !== 'faces' && spec.ask !== 'length')) return null;
  const net = n.layout ? netOfSpec(n) : null;
  const shapes: string[] = net ? pieceShapes(net) : faceShapes(n.solid);
  const counts = [...new Set(shapes)].map((k) => shapes.filter((x) => x === k).length);
  return { ask: spec.ask, shapeCounts: counts, edgeLengths: edgeLengths(n.solid), faces: net ? net.nodes.length : faceIds(n.solid).length };
}

/** A written number about a net: right, or the misconception it shows. */
export function checkNetInput(task: Task, spec: InputSpec, input: Readonly<Record<string, string>>, codes: readonly MisconceptionCode[]): NetCheck {
  const a = answerValues(spec)[0];
  const raw = input.w ?? '';
  if (!a || !isFracValue(a) || !/^\d+$/.test(raw)) return NOT_YET;
  const x = Number(raw);
  if (x === a.n) return OK;
  const ctx = netNumberCtx(task, spec);
  return { ok: false, code: ctx ? (codes.find((c) => writtenShows(c, ctx.ask, x, a.n, ctx)) ?? null) : null };
}

/* ------------------------------------------------------------------ */
/* Solving and samples                                                  */
/* ------------------------------------------------------------------ */

/** The first set of `add` candidates that makes the net close (in candidate order; free paper: the first cube net that holds the given squares). */
export function completeSolution(task: TaskOf<'complete-net'>): string[] | null {
  const closes = (placed: string[]) => {
    const spec = childSpec(task, placed);
    return !!spec && foldedOf(spec).closes;
  };
  if (task.candidates === 'free') {
    const [cols, rows] = paperOf(task);
    const given = new Set(givenCells(task).map(cellKey));
    for (const p of cubeNetPlacements(cols, rows)) {
      const keys = p.cells.map(cellKey);
      if (![...given].every((k) => keys.includes(k))) continue;
      const placed = keys.filter((k) => !given.has(k));
      if (placed.length === task.add && closes(placed)) return placed;
    }
    return null;
  }
  const search = (placed: string[]): string[] | null => {
    if (placed.length === task.add) return closes(placed) ? placed : null;
    const options = candidatesOf(task, placed).filter((c) => !placed.includes(c.key));
    const start = Array.isArray(task.candidates) ? Math.max(-1, ...placed.map(Number)) + 1 : 0;
    for (const c of options) {
      if (Array.isArray(task.candidates) && Number(c.key) < start) continue;
      const found = search([...placed, c.key]);
      if (found) return found;
    }
    return null;
  };
  return search([]);
}

/** Every set of candidates that closes the net (validate: the task has an answer; the feedback says when there are several). */
export function completeSolutions(task: TaskOf<'complete-net'>, limit = 12): string[][] {
  const out: string[][] = [];
  const closes = (placed: string[]) => {
    const spec = childSpec(task, placed);
    return !!spec && foldedOf(spec).closes;
  };
  const seen = new Set<string>();
  const search = (placed: string[]) => {
    if (out.length >= limit) return;
    if (placed.length === task.add) {
      const key = [...placed].sort().join('|');
      if (!seen.has(key) && closes(placed)) {
        seen.add(key);
        out.push(placed);
      }
      return;
    }
    for (const c of candidatesOf(task, placed)) if (!placed.includes(c.key)) search([...placed, c.key]);
  };
  if (task.candidates === 'free' && task.add > 2) {
    const one = completeSolution(task);
    return one ? [one] : [];
  }
  search([]);
  return out;
}

/** The moves of a net task done right (`null`: not a net task). */
export function netSolveModel(task: Task): NetAction[] | null {
  if (task.kind === 'complete-net') return (completeSolution(task) ?? []).map((key) => ({ do: 'nplace', key }));
  if (task.kind === 'tap-face') {
    const a = tapAnswer(task);
    return a === null ? [] : [{ do: 'ntap', node: a }];
  }
  return null;
}

/** The state of a wrong answer in a net task's notation (`null`: it does not parse; `undefined`: not a net task). */
export function netSample<S extends NetState>(task: Task, start: S, sample: string, apply: (from: S, moves: NetAction[]) => S): S | null | undefined {
  if (task.kind === 'complete-net') {
    const m = /^(cells|rects|faces|pick):(.+)$/.exec(sample.trim());
    if (!m) return null;
    const keys = m[1] === 'cells' ? m[2]!.split(';').map((c) => c.trim()) : m[2]!.split(',').map((c) => c.trim());
    // Cells named on a list of candidates: the candidate at that square.
    const resolved = keys.map((k) => {
      if (m[1] !== 'cells' || !Array.isArray(task.candidates)) return k;
      const [x, y] = k.split(',').map(Number);
      const at = task.candidates.findIndex((c) => c.length === 2 && c[0] === x && c[1] === y);
      return at >= 0 ? String(at) : k;
    });
    const out = apply(start, resolved.map((key) => ({ do: 'nplace', key })));
    return out.nplaced.length === resolved.length ? out : null;
  }
  if (task.kind === 'tap-face') {
    const m = /^face:(.+)$/.exec(sample.trim());
    const spec = taskNetSpec(task);
    const net = spec ? netOfSpec(spec) : null;
    const i = m && net ? nodeIndex(net, m[1]!) : null;
    if (i === null) return null;
    const out = apply(start, [{ do: 'ntap', node: i }]);
    return out.ntapped === i ? out : null;
  }
  return undefined;
}
