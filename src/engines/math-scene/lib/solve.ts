/**
 * The model's correct way through a task (docs/15 §4.8): `solve(task)` is the
 * list of actions the "Show me" ghost, `__atlas.engine.solve()` and the
 * unit tests all replay with `apply`.
 * `sampleState` builds the state of a wrong answer written in a task's
 * answer notation (the `sample` of a `feedback.wrong` entry, docs/06 MathScene).
 */
import type { Task, TaskOf } from '../schema';
import { parseFrac, valueOnLine, type Frac } from './fraction';
import { answersOf, check, inputValues, sortedOrder } from './check';
import { baseParts, figureRows, initialState, inputSpecOf, partsFor, phasesOf, reduce, taskFigure, tileKeys, type Action, type Sym, type TaskState } from './state';
import { allSides, boundaryEdges, cellKey, cutKey, rectCuts } from './grid';
import { drawnRight } from './diagnose/measure';
import { parseMeasure } from './value';

const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** Actions that fill the input phase with the right answer. */
function inputActions(task: Task): Action[] {
  const spec = inputSpecOf(task);
  if (!spec) return [];
  const boxes = Object.entries(inputValues(spec, answersOf(spec))).map(([field, value]) => ({ do: 'input', field, value }) as Action);
  return spec.form === 'measure' && spec.unit ? [...boxes, { do: 'input', field: 'u', value: spec.unit }] : boxes;
}

/** The rectangle a draw task's solution draws: the first that meets it, length across. */
export function drawnSolution(task: TaskOf<'draw-rectangle'>): [number, number] | null {
  const m = task.model;
  const cols = m.kind === 'grid' ? (m.cols ?? 12) : 12;
  const rows = m.kind === 'grid' ? (m.rows ?? 10) : 10;
  for (let w = cols; w >= 1; w--) for (let h = 1; h <= Math.min(rows, w); h++) if (drawnRight(task, w, h)) return [w, h];
  for (let w = 1; w <= cols; w++) for (let h = 1; h <= rows; h++) if (drawnRight(task, w, h)) return [w, h];
  return null;
}

/** Factor that turns the starting model into the target (split ×k / merge ÷k). */
function scaleFactor(task: TaskOf<'split'> | TaskOf<'merge'>): number | null {
  const start = baseParts(task);
  const k = task.kind === 'split' ? task.target.d / start : start / task.target.d;
  return Number.isInteger(k) && task.factors.includes(k) ? k : null;
}

/** Marks for the model phase, then (multi-part tasks) a check and the input. */
function withInput(task: Task, model: Action[]): Action[] {
  return phasesOf(task).includes('input') && task.kind !== 'input' ? [...model, { do: 'check' }, ...inputActions(task)] : model;
}

/** The actions that answer `task` correctly, in the order a child would do them. */
export function solve(task: Task): Action[] {
  const start = initialState(task);
  switch (task.kind) {
    case 'shade': {
      const free = range(0, start.parts * start.wholes).filter((i) => !start.given.includes(i));
      const count = partsFor(task.target, start.parts) ?? 0;
      return withInput(task, free.slice(0, count).map((part) => ({ do: 'shade', part })));
    }
    case 'cut':
      return range(1, task.parts - 1).map((i) => ({ do: 'cut', at: (i * task.snap) / task.parts }));
    case 'fold':
      return withInput(task, range(0, Math.max(0, Math.round(Math.log2(task.parts / Math.max(1, start.parts))))).map(() => ({ do: 'fold' }) as Action));
    case 'split':
    case 'merge':
      return withInput(task, [{ do: 'factor', k: scaleFactor(task) }]);
    case 'place': {
      const m = task.model;
      const at = valueOnLine(task.target, m.kind === 'numberline' ? m : { from: 0, intervals: start.parts }) ?? 0;
      return [{ do: 'place', at }];
    }
    case 'compare': {
      const align: Action[] = task.align ? [{ do: 'align' }] : [];
      const c = task.a.n * task.b.d - task.b.n * task.a.d;
      if (task.ask === 'symbol') return [...align, { do: 'symbol', value: (c < 0 ? '<' : c > 0 ? '>' : '=') as Sym }];
      const aWins = task.ask === 'greater' ? c > 0 : c < 0;
      return [...align, { do: 'pick', side: aWins ? 'a' : 'b' }];
    }
    case 'order':
      return sortedOrder(task).map((item) => ({ do: 'order', item }));
    case 'choose':
      return task.options.filter((o) => o.correct).map((o) => ({ do: 'choose', id: o.id }));
    case 'input':
      return inputActions(task);
    case 'count-squares': {
      if (task.cover === 'all') return withInput(task, [{ do: 'rows', count: figureRows(task).length }]);
      // One full row (the top) and one full column (the left).
      const box = taskFigure(task)?.facts.box;
      if (!box) return withInput(task, []);
      const keys = new Set<string>();
      for (let i = 0; i < box.w; i++) keys.add(cellKey(box.x + i, box.y + box.h - 1));
      for (let j = 0; j < box.h; j++) keys.add(cellKey(box.x, box.y + j));
      return withInput(task, [...keys].map((key) => ({ do: 'tile', key }) as Action));
    }
    case 'trace-perimeter': {
      const fig = taskFigure(task);
      return withInput(task, fig ? fig.facts.walk.map((key) => ({ do: 'edge', key }) as Action) : []);
    }
    case 'draw-rectangle': {
      const r = drawnSolution(task);
      return r ? [{ do: 'rect', w: r[0], h: r[1] }] : [];
    }
    case 'split-figure': {
      const fig = taskFigure(task);
      const cut = fig ? rectCuts(fig.facts.cells)[0] : undefined;
      return withInput(task, cut ? [{ do: 'gridcut', cut: cutKey(cut) }] : []);
    }
    case 'build-sum': {
      const out: Action[] = [];
      let parts = start.parts;
      let given = start.given;
      if (task.convert) {
        out.push({ do: 'factor', k: task.convert }, { do: 'check' });
        parts *= task.convert;
        given = given.flatMap((i) => range(i * task.convert!, task.convert!));
      }
      const count = partsFor(task.b, parts) ?? 0;
      if (task.op === '+') {
        const free = range(0, parts * start.wholes).filter((i) => !given.includes(i));
        out.push(...free.slice(0, count).map((part) => ({ do: 'shade', part }) as Action));
      } else {
        out.push(...given.slice(given.length - count).map((part) => ({ do: 'cross', part }) as Action));
      }
      return [...out, { do: 'check' }, ...inputActions(task)];
    }
  }
}

/** Replay actions from the task's starting state; a `check` moves a multi-part task on when its phase is right. */
export function apply(task: Task, actions: readonly Action[], from: TaskState = initialState(task)): TaskState {
  return actions.reduce((state, action) => step(task, state, action), from);
}

/** One action, phases included (the UI's Check does the same plus feedback). */
export function step(task: Task, state: TaskState, action: Action): TaskState {
  if (action.do !== 'check') return reduce(task, state, action);
  const phases = phasesOf(task);
  if (state.phase >= phases.length - 1) return state;
  return check(task, state).ok ? { ...state, phase: state.phase + 1 } : state;
}

/** The solved state (what "Show me" draws, and where a finished sub-step is shown again). */
export function solvedState(task: Task): TaskState {
  return apply(task, solve(task));
}

/* ------------------------------------------------------------------ */
/* Wrong-answer samples                                                */
/* ------------------------------------------------------------------ */

const fracs = (text: string): Frac[] | null => {
  const out = text.split(',').map((s) => parseFrac(s));
  return out.every((f): f is Frac => f !== null) ? out : null;
};

/** Raw `n/d` (a zero denominator kept, unlike `parseFrac`): `3/0` is a wrong answer worth diagnosing. */
const rawFracs = (text: string): Frac[] | null => {
  const out: Frac[] = [];
  for (const part of text.split(',')) {
    const m = /^\s*(?:(\d+)\s+)?(\d+)(?:\s*\/\s*(\d+))?\s*$/.exec(part);
    if (!m) return null;
    const [, w, n, d] = m;
    out.push(w ? { w: Number(w), n: Number(n), d: Number(d ?? 1) } : { n: Number(n), d: Number(d ?? 1) });
  }
  return out;
};

/**
 * The state of a wrong answer written in the task's notation (docs/06 MathScene):
 * `input` and input phases `"5/14"`, `"1 3/11"`, `"11/12,8/9"` (one per written
 * fraction); `shade` `"3"` (parts marked from the left); `place` `"5"` (intervals);
 * `compare` `"<"` or `"a"` / `"b"` (the pick); `order` `"1/2,3/4,3/8"`; `cut`
 * `"4,9"` (grid positions); `choose` `"b"` or `"a,c"`; `split` / `merge` `"x2"`;
 * grid: `count-squares` `"tiles:6"` (squares laid in reading order),
 * `trace-perimeter` `"edges:12"` / `"edges:14+2"` (sides of the walk, + sides
 * inside), `draw-rectangle` `"3x4"` (across × up), `split-figure` `"x:5"`;
 * a measure `"28 cm"` (number and unit) or `"28"` (the answer's unit).
 * In a multi-part task a sample starting with `=` is the written answer after
 * the earlier parts were done right (`"=9 cm2"`, `"=35,36,71"`).
 */
export function sampleState(task: Task, sample: string): TaskState | null {
  const phases = phasesOf(task);
  const inputPhase = phases.indexOf('input');
  const writeInput = (from: TaskState, text: string): TaskState | null => {
    const spec = inputSpecOf(task);
    if (!spec) return null;
    if (spec.form === 'measure') {
      // `"28 cm"` (the unit written), or `"28"` (the answer's own unit).
      const m = parseMeasure(text) ?? (/^\s*\d+\s*$/.test(text) && spec.unit ? { value: Number(text), unit: spec.unit } : null);
      if (!m) return null;
      return { ...from, input: { ...inputValues(spec, [{ n: m.value, d: 1 }]), u: m.unit }, phase: inputPhase };
    }
    const values = rawFracs(text);
    if (!values) return null;
    return { ...from, input: inputValues(spec, values), phase: inputPhase };
  };
  if (task.kind === 'input') return writeInput(initialState(task), sample);
  if (sample.startsWith('=') && inputPhase >= 0) {
    const actions = solve(task);
    const cut = actions.findLastIndex((a) => a.do === 'check');
    return writeInput(apply(task, actions.slice(0, cut + 1)), sample.slice(1));
  }
  const start = initialState(task);
  switch (task.kind) {
    case 'shade': {
      const n = Number(sample);
      if (!Number.isInteger(n)) return null;
      const free = range(0, start.parts * start.wholes).filter((i) => !start.given.includes(i));
      return { ...start, shaded: free.slice(0, n) };
    }
    case 'place':
      return Number.isFinite(Number(sample)) ? reduce(task, start, { do: 'place', at: Number(sample) }) : null;
    case 'compare':
      if (sample === 'a' || sample === 'b') return { ...start, pick: sample };
      return ['<', '=', '>'].includes(sample) ? { ...start, symbol: sample as Sym } : null;
    case 'order': {
      const values = fracs(sample);
      if (!values) return null;
      const order = values.map((v) => task.items.findIndex((it) => it.n === v.n && it.d === v.d && (it.w ?? 0) === (v.w ?? 0)));
      return order.includes(-1) ? null : { ...start, order };
    }
    case 'cut': {
      const cuts = sample.split(',').map(Number);
      return cuts.every(Number.isInteger) ? { ...start, cuts: [...cuts].sort((a, b) => a - b) } : null;
    }
    case 'choose':
      return { ...start, chosen: sample.split(',').map((s) => s.trim()) };
    case 'split':
    case 'merge':
    case 'build-sum': {
      const m = /^x(\d+)$/.exec(sample);
      return m ? reduce(task, start, { do: 'factor', k: Number(m[1]) }) : null;
    }
    case 'fold':
      return null;
    case 'count-squares': {
      // `tiles:6`: the first 6 squares laid in reading order.
      const m = /^tiles:(\d+)$/.exec(sample);
      return m ? { ...start, tiles: tileKeys(task).slice(0, Number(m[1])) } : null;
    }
    case 'trace-perimeter': {
      // `edges:12`: the first 12 sides of the walk; `edges:14+2`: all 14 and 2 sides inside.
      const m = /^edges:(\d+)(?:\+(\d+))?$/.exec(sample);
      const fig = taskFigure(task);
      if (!m || !fig) return null;
      const boundary = boundaryEdges(fig.facts.cells);
      const inner = [...allSides(fig.facts.cells)].filter((e) => !boundary.has(e)).sort();
      return { ...start, edges: [...fig.facts.walk.slice(0, Number(m[1])), ...inner.slice(0, Number(m[2] ?? 0))] };
    }
    case 'draw-rectangle': {
      const m = /^(\d+)x(\d+)$/.exec(sample);
      return m ? reduce(task, start, { do: 'rect', w: Number(m[1]), h: Number(m[2]) }) : null;
    }
    case 'split-figure':
      return /^[xy]:\d+$/.test(sample) ? { ...start, cut: sample } : null;
  }
}
