/**
 * The angle checks (docs/76 §3.2–3.4): what `measure-angle`, `draw-angle` and
 * `draw-segment` keep in the task state, how a move changes it (the protractor
 * dragged and turned, snapping onto the vertex and onto an arm; the second arm
 * turned a degree at a time; dots picked on dot paper), how they are checked
 * and diagnosed, the right way through (solve), the state a wrong-answer
 * sample stands for, and the sizes written about an angle (`input` with an
 * `angle` rule). `state.ts`, `check.ts` and `solve.ts` hand angle tasks to
 * this module. Pure.
 *
 * Samples: measure-angle `"=130"` (the size written once the protractor is
 * laid); draw-angle `"115"` (the size drawn, on the side asked); draw-segment
 * `"(2,1)-(5,2)"` (both ends) or `"(5,2)"` (the other end when the line
 * starts at a given dot); an `input` writes the number (`"115"`).
 */
import type { AngleModelSpec, AngleSpec, InputSpec, MisconceptionCode, Task, TaskOf } from '../schema';
import { answerValues } from './forms';
import { isFracValue } from './value';
import { angleItems, arcSpan, arcValue, at, between, CENTRE_SNAP, cross, dotProduct, gapChange, layings, nearestLaying, norm, onLine, onPaper, reading, TURN_SNAP, twoArmSize, vec, type P2 } from './angle';
import { diagnoseAngle, segmentShows, type AngleContext } from './diagnose/angles';

/* ------------------------------------------------------------------ */
/* Which tasks                                                          */
/* ------------------------------------------------------------------ */

export const isAngleModel = (m: Task['model']): m is AngleModelSpec => m.kind === 'angle';

/** Is the task in the `angles` domain (an angle drawing on the stage or in an option, or an angle task)? */
export function isAngleTask(task: Task): boolean {
  if (task.kind === 'measure-angle' || task.kind === 'draw-angle' || task.kind === 'draw-segment') return true;
  if (isAngleModel(task.model)) return true;
  return task.kind === 'choose' && task.options.some((o) => !!o.model && isAngleModel(o.model));
}

/** The stage's drawing (the first of a pair or a set). */
export const angleSpecOf = (task: Task): AngleSpec | null => (isAngleModel(task.model) ? (angleItems(task.model)[0] ?? null) : null);

/* ------------------------------------------------------------------ */
/* State and moves                                                      */
/* ------------------------------------------------------------------ */

export interface AngleState {
  /** measure-angle: the protractor's centre (arm units from the vertex; `null`: where it lies at the start). */
  apos: P2 | null;
  /** measure-angle: the protractor's turn. */
  arot: number;
  /** draw-angle: the second arm's direction (`null`: not turned yet, it lies on the first). */
  adir: number | null;
  /** draw-angle: the protractor is shown. */
  aprot: boolean;
  /** draw-segment: the dots picked. */
  dpts: P2[];
}

export type AngleAction =
  | { do: 'aput'; x: number; y: number }
  | { do: 'aturn'; to: number }
  | { do: 'acentre' }
  | { do: 'aline' }
  | { do: 'aarm'; dir: number }
  | { do: 'aprot' }
  | { do: 'dot'; x: number; y: number };
export const ANGLE_ACTIONS = new Set(['aput', 'aturn', 'acentre', 'aline', 'aarm', 'aprot', 'dot']);

/** The two arms of a task's angle (measure-angle: its two rays). */
function armsOfTask(task: Task): [number, number] | null {
  const r = angleSpecOf(task)?.rays ?? [];
  return r.length >= 2 ? [norm(r[0]!.dir), norm(r[1]!.dir)] : null;
}

/** Where the protractor lies at the start: off the angle, away from its opening. */
export function protractorRest(task: Task): P2 {
  const arms = armsOfTask(task);
  if (!arms) return [0, -1.4];
  const half = norm(arms[1] - arms[0]) <= 180 ? arms[0] + norm(arms[1] - arms[0]) / 2 : arms[1] + norm(arms[0] - arms[1]) / 2;
  return at(half + 180, 0.6);
}

export const angleInitial = (task?: Task): AngleState => ({ apos: null, arot: 0, adir: null, aprot: task?.kind === 'draw-angle' ? task.protractor : false, dpts: [] });

const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/** The protractor is laid: centre on the vertex, a 0 on one arm and the other arm on its curve. */
export function laid(task: Task, s: AngleState): boolean {
  const arms = armsOfTask(task);
  if (!arms || !s.apos || dist(s.apos, [0, 0]) > 1e-6) return false;
  return layings(arms[0], arms[1]).some((l) => between(l.rot, s.arot) < 1e-6);
}

/** The row the laid protractor is read on (the one whose 0 is on an arm). */
export function laidRow(task: Task, s: AngleState): 'inner' | 'outer' | null {
  const arms = armsOfTask(task);
  if (!arms || !laid(task, s)) return null;
  return layings(arms[0], arms[1]).find((l) => between(l.rot, s.arot) < 1e-6)?.row ?? null;
}

/** The side a draw-angle's second arm turns, and its size drawn (`null`: not turned yet). */
export function drawnSize(task: TaskOf<'draw-angle'>, s: AngleState): number | null {
  if (s.adir === null) return null;
  const base = baseDir(task);
  return task.open === 'ccw' ? norm(s.adir - base) : norm(base - s.adir);
}

/** A draw-angle's first arm. */
export const baseDir = (task: Task): number => norm(angleSpecOf(task)?.rays?.[0]?.dir ?? 0);

/** The protractor of a draw-angle, laid on its first arm (the scale from 0 on it). */
export function drawProtractor(task: TaskOf<'draw-angle'>): { rot: number; row: 'inner' | 'outer' } {
  const b = baseDir(task);
  return task.open === 'ccw' ? { rot: b, row: 'inner' } : { rot: norm(b - 180), row: 'outer' };
}

/** The dots a draw-segment's line runs between (`null`: not both picked). */
export function drawnSegment(task: TaskOf<'draw-segment'>, s: AngleState): [P2, P2] | null {
  const pts = task.from ? [task.from as P2, ...s.dpts] : s.dpts;
  return pts.length >= 2 ? [pts[0]!, pts[1]!] : null;
}

/** Apply an angle move (meaningless moves leave the state as it is). */
export function angleReduce<S extends AngleState & { phase: number }>(task: Task, state: S, action: AngleAction): S {
  if (task.kind === 'measure-angle') {
    if (state.phase > 0 && task.place) return state;
    const arms = armsOfTask(task);
    let next: S = state;
    if (action.do === 'aput') {
      const from = state.apos ?? protractorRest(task);
      const to: P2 = [action.x, action.y];
      // Snap onto the vertex when the move brings it close.
      const snap = dist(to, [0, 0]) <= CENTRE_SNAP && dist(to, [0, 0]) <= dist(from, [0, 0]);
      next = { ...state, apos: snap ? [0, 0] : to };
    } else if (action.do === 'aturn') {
      const to = norm(action.to);
      const best = arms ? nearestLaying(arms[0], arms[1], to) : null;
      const snap = !!best && between(best.rot, to) <= TURN_SNAP && between(best.rot, to) <= between(best.rot, state.arot) && between(best.rot, state.arot) > 1e-6;
      next = { ...state, arot: snap && best ? best.rot : to };
    } else if (action.do === 'acentre') next = { ...state, apos: [0, 0] };
    else if (action.do === 'aline' && arms) next = { ...state, arot: nearestLaying(arms[0], arms[1], state.arot).rot };
    else return state;
    // Laid: the written part opens (laying it is the scaffold, not judged).
    return task.place && laid(task, next) ? { ...next, phase: 1 } : next;
  }
  if (task.kind === 'draw-angle') {
    if (action.do === 'aarm') return { ...state, adir: norm(Math.round(action.dir)) };
    if (action.do === 'aprot') return { ...state, aprot: !state.aprot };
    return state;
  }
  if (task.kind === 'draw-segment' && action.do === 'dot') {
    const paper = angleSpecOf(task)?.paper;
    const p: P2 = [action.x, action.y];
    if (!paper || !onPaper(p, paper)) return state;
    const same = (q: P2) => q[0] === p[0] && q[1] === p[1];
    if (state.dpts.some(same)) return { ...state, dpts: state.dpts.filter((q) => !same(q)) };
    if (task.from && same(task.from as P2)) return state;
    const room = task.from ? 1 : 2;
    return state.dpts.length >= room ? { ...state, dpts: [...state.dpts.slice(0, room - 1), p] } : { ...state, dpts: [...state.dpts, p] };
  }
  return state;
}

/** Clear the angle work (the tray's "Clear"). */
export const angleClear = <S extends AngleState>(task: Task, state: S): S => ({ ...state, ...angleInitial(task), aprot: state.aprot });

/* ------------------------------------------------------------------ */
/* Input specs and the diagnosis context                                */
/* ------------------------------------------------------------------ */

const measureSpecs = new WeakMap<Task, InputSpec>();
/** The written part of a measure-angle task: one box and a degree sign. */
export function measureInputSpec(task: TaskOf<'measure-angle'>): InputSpec {
  let spec = measureSpecs.get(task);
  if (!spec) {
    spec = { answer: { n: task.answer, d: 1 }, form: 'whole', sentence: '?°', angle: { rule: 'read' } };
    measureSpecs.set(task, spec);
  }
  return spec;
}

/** The size a not-to-scale drawing gives its unknown (the arc marked ?, else the first arc with a value). */
function drawnUnknown(spec: AngleSpec | null): number | null {
  if (!spec?.notToScale) return null;
  const arcs = spec.arcs ?? [];
  const a = arcs.find((x) => x.label === '?') ?? arcs.find((x) => x.value !== undefined && x.label && /^[a-z]$/.test(x.label));
  return a ? Math.round(arcSpan(a)) : null;
}

/** The number the first arm lies on, on the scale the drawn protractor is read on (0 when lined up). */
function protractorOffset(spec: AngleSpec | null): number | null {
  const p = spec?.protractor;
  const r = spec?.rays ?? [];
  if (!p || r.length < 2) return null;
  const row = p.row ?? 'inner';
  return Math.round(Math.min(reading(p.rot, r[0]!.dir, row), reading(p.rot, r[1]!.dir, row)));
}

/** What a size written or drawn is diagnosed against. */
export function angleContext(task: Task, spec: InputSpec | null): AngleContext {
  const s = angleSpecOf(task);
  const a = spec?.angle;
  const rule: AngleContext['rule'] = task.kind === 'draw-angle' ? 'draw' : (a?.rule ?? 'count');
  return {
    rule,
    known: a?.known ?? [],
    rights: a?.rights ?? 0,
    equal: a?.equal ?? 1,
    offset: task.kind === 'measure-angle' ? 0 : rule === 'read' ? protractorOffset(s) : null,
    drawn: drawnUnknown(s),
  };
}

/* ------------------------------------------------------------------ */
/* Checking                                                             */
/* ------------------------------------------------------------------ */

export interface AngleCheck {
  ok: boolean;
  code: MisconceptionCode | null;
}
const OK: AngleCheck = { ok: true, code: null };
const NOT_YET: AngleCheck = { ok: false, code: null };

/** Degrees either side a written size is still right: a protractor reading ±1 (docs/76 D7), a worked-out size exact. */
export function inputTolerance(task: Task, spec: InputSpec): number {
  if (task.kind === 'measure-angle') return task.tolerance;
  return spec.angle?.rule === 'read' ? 1 : 0;
}

/** A size written about an angle: right, or the misconception it shows. */
export function checkAngleInput(task: Task, spec: InputSpec, input: Readonly<Record<string, string>>, codes: readonly MisconceptionCode[]): AngleCheck {
  const a = answerValues(spec)[0];
  const raw = input.w ?? '';
  if (!a || !isFracValue(a) || !/^\d+$/.test(raw)) return NOT_YET;
  const x = Number(raw);
  const t = a.n;
  if (Math.abs(x - t) <= inputTolerance(task, spec)) return OK;
  return { ok: false, code: diagnoseAngle(codes, x, t, angleContext(task, spec)) };
}

/** The model phase of an angle task (`null`: not one of them). */
export function checkAngleModel(task: Task, s: AngleState, codes: readonly MisconceptionCode[]): AngleCheck | null {
  if (task.kind === 'measure-angle') return laid(task, s) ? OK : NOT_YET;
  if (task.kind === 'draw-angle') {
    const x = drawnSize(task, s);
    if (x === null) return NOT_YET;
    if (Math.abs(x - task.target) <= task.tolerance) return OK;
    return { ok: false, code: x <= 180 ? diagnoseAngle(codes, x, task.target, angleContext(task, null)) : null };
  }
  if (task.kind === 'draw-segment') {
    const seg = drawnSegment(task, s);
    const paper = angleSpecOf(task)?.paper;
    const given = paper?.segments[task.to];
    if (!seg || !given) return NOT_YET;
    const v = vec(seg[0], seg[1]);
    const w = vec(given.from as P2, given.to as P2);
    if (segmentRight(task.relation, seg, given.from as P2, given.to as P2)) return OK;
    const g = gapChange(v, w);
    return { ok: false, code: codes.find((c) => segmentShows(c, task.relation, g)) ?? null };
  }
  return null;
}

/** A line drawn is right: parallel (not on the given line) or perpendicular, at least 2 squares long. */
export function segmentRight(relation: 'parallel' | 'perpendicular', seg: [P2, P2], a: P2, b: P2): boolean {
  const v = vec(seg[0], seg[1]);
  const w = vec(a, b);
  if (Math.max(Math.abs(v[0]), Math.abs(v[1])) < 2) return false;
  if (relation === 'perpendicular') return dotProduct(v, w) === 0;
  return cross(v, w) === 0 && !onLine(seg[0], a, b);
}

/** Enough is done to press Check (`null`: not an angle task's model phase). */
export function angleAnswered(task: Task, s: AngleState & { phase: number }): boolean | null {
  if (task.kind === 'measure-angle' && s.phase === 0 && task.place) return laid(task, s);
  if (task.kind === 'draw-angle') return s.adir !== null;
  if (task.kind === 'draw-segment') return drawnSegment(task, s) !== null;
  return null;
}

/* ------------------------------------------------------------------ */
/* Solving and samples                                                  */
/* ------------------------------------------------------------------ */

/** A draw-angle's arm direction for a size drawn on the side asked. */
export const armFor = (task: TaskOf<'draw-angle'>, size: number): number => norm(task.open === 'ccw' ? baseDir(task) + size : baseDir(task) - size);

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** The line a draw-segment wants: from its start (given, or the first dot off the given line that fits) along the direction asked. */
export function segmentSolution(task: TaskOf<'draw-segment'>): [P2, P2] | null {
  const paper = angleSpecOf(task)?.paper;
  const given = paper?.segments[task.to];
  if (!paper || !given) return null;
  const w = vec(given.from as P2, given.to as P2);
  const g = gcd(Math.abs(w[0]), Math.abs(w[1])) || 1;
  const dir: P2 = task.relation === 'parallel' ? [w[0] / g, w[1] / g] : [-w[1] / g, w[0] / g];
  const starts: P2[] = task.from ? [task.from as P2] : Array.from({ length: paper.cols * paper.rows }, (_, i) => [i % paper.cols, Math.floor(i / paper.cols)] as P2);
  for (const p of starts) {
    for (const k of [2, -2, 3, -3, 1, -1, 4, -4]) {
      const q: P2 = [p[0] + dir[0] * k, p[1] + dir[1] * k];
      if (onPaper(q, paper) && segmentRight(task.relation, [p, q], given.from as P2, given.to as P2)) return [p, q];
    }
  }
  return null;
}

/** The moves of an angle task's model phase done right (`null`: not an angle task). */
export function angleSolveModel(task: Task): AngleAction[] | null {
  if (task.kind === 'measure-angle') return task.place ? [{ do: 'acentre' }, { do: 'aline' }] : [];
  if (task.kind === 'draw-angle') return [{ do: 'aarm', dir: armFor(task, task.target) }];
  if (task.kind === 'draw-segment') {
    const seg = segmentSolution(task);
    if (!seg) return [];
    return (task.from ? [seg[1]] : seg).map((p) => ({ do: 'dot', x: p[0], y: p[1] }));
  }
  return null;
}

/** The state of a wrong answer in an angle task's notation (`null`: it does not parse; `undefined`: not handled here). */
export function angleSample<S extends AngleState & { phase: number }>(task: Task, start: S, sample: string, apply: (from: S, moves: AngleAction[]) => S): S | null | undefined {
  if (task.kind === 'draw-angle') {
    const n = Number(sample.trim());
    return Number.isFinite(n) ? apply(start, [{ do: 'aarm', dir: armFor(task, n) }]) : null;
  }
  if (task.kind === 'draw-segment') {
    const pts = [...sample.matchAll(/\((\d+),\s*(\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])] as P2);
    const want = task.from ? 1 : 2;
    if (pts.length !== want) return null;
    const out = apply(start, pts.map((p) => ({ do: 'dot', x: p[0], y: p[1] })));
    return out.dpts.length === want ? out : null;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Sizes for validate and the cards                                     */
/* ------------------------------------------------------------------ */

/** The size a measure-angle's arms make. */
export const measuredSize = (task: TaskOf<'measure-angle'>): number | null => {
  const s = angleSpecOf(task);
  return s ? twoArmSize(s) : null;
};

/** Sizes on show in a drawing (arcs' values), for the limits. */
export function sizesOf(spec: AngleSpec): number[] {
  return (spec.arcs ?? []).map(arcValue);
}
