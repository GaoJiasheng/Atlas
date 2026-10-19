/**
 * The model's correct way through a task (docs/15 §4.8): `solve(task)` is the
 * list of actions the "Show me" ghost, `__atlas.engine.solve()` and the
 * unit tests all replay with `apply`.
 * `sampleState` builds the state of a wrong answer written in a task's
 * answer notation (the `sample` of a `feedback.wrong` entry, docs/06 MathScene).
 */
import type { PlaceKey, Task, TaskOf, Trade } from '../schema';
import { parseFrac, valueOnLine, type Frac } from './fraction';
import { answersOf, asFrac, check, inputValues, sortedOrder, usesValueBoxes } from './check';
import { baseParts, figureRows, initialState, inputSpecOf, partsFor, phasesOf, reduce, taskFigure, tileKeys, type Action, type Sym, type TaskState } from './state';
import { allSides, boundaryEdges, cellKey, cutKey, rectCuts } from './grid';
import { drawnRight } from './diagnose/measure';
import { HOUR, MINUTE, parseMeasure } from './value';
import { answerValues, sampleBoxes, valueBoxes } from './forms';
import { groupTarget, skipTarget } from './diagnose/whole-ops';
import { applyTrade, canTrade, type Counts } from './blocks';
import { decimalBoxes, decimalSample, decimalSampleBoxes, decimalSolveModel, isDecimalTask, onChart } from './decimal-tasks';
import { wholePart } from './decimal';
import { HALF_DAY } from './clock';
import { hopStart, hopsTo } from './timeline';
import { isMeasureTask } from './measure-kind';
import { measureBoxes, measureSample, measureSampleBoxes, measureSolveModel } from './measure-tasks';
import { formatQty, isQty, parseQuantity } from './value';

const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** Actions that fill the input phase with the right answer. */
function inputActions(task: Task): Action[] {
  const spec = inputSpecOf(task);
  if (!spec) return [];
  if (isMeasureTask(task)) return Object.entries(measureBoxes(task, spec)).map(([field, value]) => ({ do: 'input', field, value }) as Action);
  const filled = spec.form === 'decimal' ? decimalBoxes(spec) : usesValueBoxes(task, spec) ? valueBoxes(spec, splitArrayAnswers(task) ?? answerValues(spec)) : inputValues(spec, answersOf(spec));
  const boxes = Object.entries(filled).map(([field, value]) => ({ do: 'input', field, value }) as Action);
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

/** A split array's cut for its solution: the one its answer's parts belong to (else after 5 rows, or half way). */
export function splitArrayCut(task: TaskOf<'split-array'>): string {
  if (task.at?.rows) return `r${task.at.rows[0]}`;
  if (task.at?.cols) return `c${task.at.cols[0]}`;
  const a = answersOf(task.then).map((f) => f.n);
  for (let p = 1; p < task.rows; p++) if (a[0] === p * task.cols && a[1] === (task.rows - p) * task.cols) return `r${p}`;
  for (let p = 1; p < task.cols; p++) if (a[0] === p * task.rows && a[1] === (task.cols - p) * task.rows) return `c${p}`;
  return `r${task.rows > 5 ? 5 : Math.max(1, Math.floor(task.rows / 2))}`;
}

/** A split array without a fixed cut: the solution writes the parts of its own cut. */
function splitArrayAnswers(task: Task): Frac[] | null {
  if (task.kind !== 'split-array' || task.at) return null;
  const c = splitArrayCut(task);
  const p = Number(c.slice(1));
  const [other, whole] = c.startsWith('r') ? [task.cols, task.rows] : [task.rows, task.cols];
  return [p * other, (whole - p) * other, task.rows * task.cols].map((n) => ({ n, d: 1 }));
}

/** Trades that bring every place under 10 (ones first). */
function regroupTrades(start: Counts): Trade[] {
  const out: Trade[] = [];
  let c = start;
  for (const t of ['O>T', 'T>H'] as const) {
    while (canTrade(c, t) && c[t === 'O>T' ? 'O' : 'T'] >= 10) {
      c = applyTrade(c, t);
      out.push(t);
    }
  }
  return out;
}

/** Sharing from the top place: share it, trade what is left down, and on to the next place. */
function shareActions(task: TaskOf<'share'>): Action[] {
  const out: Action[] = [];
  let st = initialState(task);
  const go = (a: Action) => {
    out.push(a);
    st = reduce(task, st, a);
  };
  const places: [PlaceKey, Trade | null][] = [
    ['H', 'H>T'],
    ['T', 'T>O'],
    ['O', null],
  ];
  for (const [place, down] of places) {
    if (st.mat[place] >= task.k) go({ do: 'share', place });
    if (down) while (st.mat[place] > 0) go({ do: 'trade', trade: down });
  }
  return out;
}

/** Where a duration task's jumps end up: the end of the span, or the time asked. */
export function durationGoal(task: TaskOf<'duration'>): number | null {
  if (task.ask === 'length') return task.end ?? null;
  if (task.ask === 'end') return task.start !== undefined && task.length ? task.start + task.length.t : null;
  return task.end !== undefined && task.length ? task.end - task.length.t : null;
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

/** Decimal tasks whose model phase `decimal-tasks.ts` solves. */
const decimalModel = (task: Task): boolean =>
  task.kind === 'shade-decimal' || task.kind === 'round-on-line' || task.kind === 'align-add' || task.kind === 'shift-digits' || onChart(task) || ((task.kind === 'place' || task.kind === 'compare' || task.kind === 'order') && isDecimalTask(task));

/** The actions that answer `task` correctly, in the order a child would do them. */
export function solve(task: Task): Action[] {
  const start = initialState(task);
  if (decimalModel(task)) return withInput(task, decimalSolveModel(task) as Action[]);
  const measured = isMeasureTask(task) ? measureSolveModel(task) : null;
  if (measured) return withInput(task, measured as Action[]);
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
      const at = valueOnLine(asFrac(task.target), m.kind === 'numberline' && m.scale !== 'decimal' ? m : { from: 0, intervals: start.parts }) ?? 0;
      return [{ do: 'place', at }];
    }
    case 'compare': {
      const align: Action[] = task.align ? [{ do: 'align' }] : [];
      const a = asFrac(task.a);
      const b = asFrac(task.b);
      const c = a.n * b.d - b.n * a.d;
      if (task.ask === 'symbol') return [...align, { do: 'symbol', value: (c < 0 ? '<' : c > 0 ? '>' : '=') as Sym }];
      const aWins = task.ask === 'greater' ? c > 0 : c < 0;
      return [...align, { do: 'pick', side: aWins ? 'a' : 'b' }];
    }
    case 'order':
      return sortedOrder(task).map((item) => ({ do: 'order', item }));
    case 'choose':
      return task.options.filter((o) => o.correct).map((o) => ({ do: 'choose', id: o.id }));
    case 'input':
    case 'read-clock':
    case 'read-scale':
      return inputActions(task);
    case 'set-clock':
      return [{ do: 'clock', t: task.target }];
    case 'duration': {
      // The jumps a child would make on the timeline (to the hour mark, whole hours, the minutes left), then the answer.
      const s = hopStart(task);
      const goal = durationGoal(task);
      const hops = s && goal !== null ? hopsTo(s.at, goal) : [];
      return [...hops.map((by) => ({ do: 'hop', by }) as Action), ...inputActions(task)];
    }
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
    case 'group': {
      const t = groupTarget(task);
      return withInput(task, Array.from({ length: task.by === 'share' ? t.each : t.groups }, () => ({ do: task.by === 'share' ? 'deal' : 'pack' }) as Action));
    }
    case 'arrange':
      return [{ do: 'arrange', rows: task.rows, cols: task.cols }];
    case 'skip-count':
      return skipTarget(task).map((at) => ({ do: 'land', at }) as Action);
    case 'split-array':
      return withInput(task, [{ do: 'arraycut', cut: splitArrayCut(task) }]);
    case 'regroup':
      return withInput(task, regroupTrades(start.mat).map((trade) => ({ do: 'trade', trade }) as Action));
    case 'share':
      return withInput(task, shareActions(task));
    case 'shade-decimal':
    case 'round-on-line':
    case 'align-add':
    case 'shift-digits':
    case 'set-scale':
    case 'count-intervals':
      return [];
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
    if (isMeasureTask(task) && spec.form !== 'compound') {
      const boxes = measureSampleBoxes(spec, text);
      return boxes ? { ...from, input: boxes, phase: inputPhase } : null;
    }
    if (spec.form === 'decimal') {
      const boxes = decimalSampleBoxes(spec, text);
      return boxes ? { ...from, input: boxes, phase: inputPhase } : null;
    }
    if (usesValueBoxes(task, spec) && spec.form !== 'measure') {
      const boxes = sampleBoxes(spec, text);
      return boxes ? { ...from, input: boxes, phase: inputPhase } : null;
    }
    if (spec.form === 'measure') {
      // `"28 cm"` (the unit written), or `"28"` (the answer's own unit).
      const m = parseMeasure(text);
      const n = m ? wholePart(m.value) : /^\s*\d+\s*$/.test(text) ? Number(text) : null;
      const unit = m ? m.unit : spec.unit !== 'dollar' ? spec.unit : undefined;
      if (n === null || !unit) return null;
      return { ...from, input: { ...inputValues(spec, [{ n, d: 1 }]), u: unit }, phase: inputPhase };
    }
    const values = rawFracs(text);
    if (!values) return null;
    return { ...from, input: inputValues(spec, values), phase: inputPhase };
  };
  if (task.kind === 'input') return writeInput(initialState(task), sample);
  // A clock or a scale read, a span worked out: only the answer is checked (`"7:20"`, `"1h75m"`, `"=11:35 am"`, `"350 kg"`).
  if (task.kind === 'read-clock' || task.kind === 'duration' || task.kind === 'read-scale') return writeInput(initialState(task), sample.replace(/^=/, ''));
  if (sample.startsWith('=') && inputPhase >= 0) {
    const actions = solve(task);
    const cut = actions.findLastIndex((a) => a.do === 'check');
    return writeInput(apply(task, actions.slice(0, cut + 1)), sample.slice(1));
  }
  const start = initialState(task);
  if (decimalModel(task) && task.kind !== 'compare') return decimalSample(task, start, sample, (from, moves) => apply(task, moves as Action[], from));
  if (isMeasureTask(task)) {
    const m = measureSample(task, start, sample, (from, moves) => apply(task, moves as Action[], from));
    if (m !== undefined) return m;
    // Quantities in an order: `"1 kg,1 kg 200 g,850 g"` (as written in the task).
    if (task.kind === 'order' && task.items.every(isQty)) {
      const names = task.items.map((v) => (isQty(v) ? formatQty(v) : ''));
      const order = sample.split(',').map((x) => {
        const q = parseQuantity(x.trim());
        return q ? names.indexOf(formatQty(q)) : -1;
      });
      return order.includes(-1) || order.length !== task.items.length ? null : { ...start, order };
    }
  }
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
      const order = values.map((v) => task.items.map(asFrac).findIndex((it) => it.n === v.n && it.d === v.d && (it.w ?? 0) === (v.w ?? 0)));
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
    case 'group': {
      // `4x3`: 4 groups of 3 (`4x3+2`: and 2 left, which must be what is left); `2,5,5`: groups of those sizes.
      const m = /^(\d+)x(\d+)(?:\+(\d+))?$/.exec(sample);
      const groups = m ? Array.from({ length: Number(m[1]) }, () => Number(m[2])) : /^\d+(,\d+)*$/.test(sample) ? sample.split(',').map(Number) : null;
      if (!groups) return null;
      const used = groups.reduce((a, b) => a + b, 0);
      if (used > task.total || (m?.[3] !== undefined && task.total - used !== Number(m[3]))) return null;
      return { ...start, groups };
    }
    case 'arrange': {
      const m = /^(\d+)x(\d+)$/.exec(sample);
      return m ? reduce(task, start, { do: 'arrange', rows: Number(m[1]), cols: Number(m[2]) }) : null;
    }
    case 'skip-count':
      return /^\d+(,\d+)*$/.test(sample) ? { ...start, landings: sample.split(',').map(Number) } : null;
    case 'split-array': {
      const s = reduce(task, start, { do: 'arraycut', cut: sample });
      return s.cut === sample ? s : null;
    }
    case 'shade-decimal':
    case 'round-on-line':
    case 'align-add':
    case 'shift-digits':
    case 'set-scale':
    case 'count-intervals':
      return null;
    case 'set-clock': {
      // `"3:50"` (the 12-hour position the hands are set to), `"3:50 pm"` with the am / pm plate.
      const m = /^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i.exec(sample.trim());
      if (!m || Number(m[1]) < 1 || Number(m[1]) > 12 || Number(m[2]) > 59) return null;
      const t = (Number(m[1]) % 12) * HOUR + Number(m[2]) * MINUTE + (m[3]?.toLowerCase() === 'pm' ? HALF_DAY : 0);
      return reduce(task, start, { do: 'clock', t });
    }
    case 'regroup':
    case 'share': {
      // A list of moves from the start: `T>H` a trade, `T` share that place (`T,T>O,O`).
      let s = start;
      for (const move of sample.split(',').map((x) => x.trim())) {
        const a: Action | null = /^[HTO]>[HTO]$/.test(move) ? { do: 'trade', trade: move as Trade } : /^[HTO]$/.test(move) && task.kind === 'share' ? { do: 'share', place: move as PlaceKey } : null;
        if (!a) return null;
        const next = reduce(task, s, a);
        if (next === s) return null;
        s = next;
      }
      return s;
    }
  }
}
