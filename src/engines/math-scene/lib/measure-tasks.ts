/**
 * The measuring checks (docs/32 §3.4–3.6): what the new task kinds and the
 * kinds extended to quantities keep in the task state, how a move changes it,
 * how a phase is checked and diagnosed, the right way through (solve), the
 * state a wrong-answer sample stands for, and when enough is done to press
 * Check. `state.ts`, `check.ts` and `solve.ts` hand measuring tasks to this
 * module. Exact throughout (millionths of the unit); pure.
 *
 * Kinds: `read-scale` (read the instrument, write the reading; the tray's
 * magnifier and part-counting are scratch), `set-scale` (draw a line, move an
 * arrow, load a dial, fill a jug, put weights on a balance), `count-intervals`
 * (tap each small part between two marks, then write what a part stands for
 * or how long the stretch is), `compare` / `order` of quantities, `input` of
 * a quantity (a measure with its unit chip, a compound, a conversion).
 */
import type { InputSpec, InstrumentSpec, MisconceptionCode, Task, TaskOf } from '../schema';
import { SCALE, parseDecimal } from './decimal';
import { answerValues, compoundPairOf, readWritten, valueBoxes } from './forms';
import { breakdown, fewestWeights, loadMass, numText, PAN_MAX, partsBetween, partsOf, readingOf, scaleOf, snap, unitOf, type Reading, type Scale } from './instrument';
import { isInstrument, measureWorkOf } from './measure-kind';
import { baseOf, compareQty, FACTOR, FAMILY_UNITS, familyOf, fromSmall, isFracValue, isQty, PAIR, pairOf, parseQuantity, printedNumber, qtyBase, qtyIn, type AnswerValue, type QtyValue, type Unit } from './value';
import { compareShows, compoundReadShows, convertShows, decimalAsCompound, orderShows, partShows, readShows, setShows, toCompoundShows, toSmallShows, type Claim, type Side } from './diagnose/measure-reading';

/* ------------------------------------------------------------------ */
/* State and moves                                                     */
/* ------------------------------------------------------------------ */

export interface MeasureState {
  /** set-scale: the value set (millionths of the instrument's unit; `null`: not moved). */
  mset: number | null;
  /** set-scale (weights): the weights put on the right pan, grams, in order. */
  mweights: number[];
  /** count-intervals, and read-scale's counting tool: the small parts tapped (by the mark each starts at). */
  mparts: number[];
  /** read-scale: the tray's magnifier and part-counting tools. */
  mzoom: boolean;
  mcount: boolean;
}

export type MeasureAction =
  | { do: 'mset'; to: number }
  | { do: 'mnudge'; by: number }
  | { do: 'weigh'; w: number }
  | { do: 'unweigh'; at: number }
  | { do: 'mpart'; part: number }
  | { do: 'mtool'; tool: 'zoom' | 'count' };

export const MEASURE_ACTIONS = new Set(['mset', 'mnudge', 'weigh', 'unweigh', 'mpart', 'mtool']);

export const measureInitial = (): MeasureState => ({ mset: null, mweights: [], mparts: [], mzoom: false, mcount: false });

/** The instrument a task works on (the first of a pair). */
export function instrumentOf(task: Task): InstrumentSpec | null {
  return isInstrument(task.model) ? partsOf(task.model)[0]! : null;
}

/** The scale of a task's instrument. */
export const taskScale = (task: Task): Scale | null => {
  const s = instrumentOf(task);
  return s ? scaleOf(s) : null;
};

/** Where a set-scale starts: a line from nothing (its start), an arrow, a needle or a level where the model has it. */
export function setStart(task: TaskOf<'set-scale'>): number {
  const s = instrumentOf(task);
  const sc = s ? scaleOf(s) : null;
  if (!s || !sc) return 0;
  if (task.mode === 'line') return s.line?.from.units ?? sc.from;
  if (task.mode === 'arrow') return s.arrow?.units ?? sc.from;
  return s.value?.units ?? sc.from;
}

/** The value a set-scale shows now. */
export const setValue = (task: TaskOf<'set-scale'>, st: MeasureState): number => st.mset ?? setStart(task);

/** The target of a set-scale in millionths of its instrument's unit (`null`: another family or not exact). */
export function setTarget(task: TaskOf<'set-scale'>): number | null {
  const s = instrumentOf(task);
  if (!s) return null;
  const t = task.target;
  if (!isQty(t)) return t.units;
  const v = qtyIn(t, unitOf(s));
  return v ? v.units : null;
}

/** Apply a measuring move (meaningless moves leave the state as it is). */
export function measureReduce<S extends MeasureState>(task: Task, state: S, action: MeasureAction): S {
  const sc = taskScale(task);
  switch (action.do) {
    case 'mset':
    case 'mnudge': {
      if (task.kind !== 'set-scale' || task.mode === 'weights' || !sc) return state;
      const raw = action.do === 'mset' ? action.to : setValue(task, state) + action.by;
      const lo = task.mode === 'line' ? setStart(task) : sc.from;
      const v = Math.max(lo, snap(sc, raw));
      return v === state.mset ? state : { ...state, mset: v };
    }
    case 'weigh':
      if (task.kind !== 'set-scale' || task.mode !== 'weights' || !(task.weights ?? []).includes(action.w) || state.mweights.length >= PAN_MAX) return state;
      return { ...state, mweights: [...state.mweights, action.w] };
    case 'unweigh':
      if (task.kind !== 'set-scale' || action.at < 0 || action.at >= state.mweights.length) return state;
      return { ...state, mweights: state.mweights.filter((_, i) => i !== action.at) };
    case 'mpart': {
      if (!sc || action.part < 0 || action.part >= sc.parts) return state;
      if (task.kind === 'count-intervals' && !countParts(task).includes(action.part)) return state;
      if (task.kind !== 'count-intervals' && !(task.kind === 'read-scale' && state.mcount)) return state;
      const parts = state.mparts.includes(action.part) ? state.mparts.filter((p) => p !== action.part) : [...state.mparts, action.part];
      return { ...state, mparts: parts };
    }
    case 'mtool':
      if (task.kind !== 'read-scale') return state;
      if (action.tool === 'zoom') return { ...state, mzoom: !state.mzoom };
      return { ...state, mcount: !state.mcount, mparts: state.mcount ? [] : state.mparts };
  }
}

/** Clear the measuring work (the tray's "Start again"). */
export function measureClear<S extends MeasureState>(state: S): S {
  return { ...state, ...measureInitial(), mzoom: state.mzoom };
}

/** The parts between a count-intervals task's two marks. */
export function countParts(task: TaskOf<'count-intervals'>): number[] {
  const sc = taskScale(task);
  return sc ? partsBetween(sc, task.between[0].units, task.between[1].units) : [];
}

/* ------------------------------------------------------------------ */
/* Readings and answers                                                */
/* ------------------------------------------------------------------ */

/** A value of an instrument as a quantity in its unit (on a two-unit scale, a whole number of the small unit is a compound). */
export function readingQty(s: InstrumentSpec, value: number): QtyValue {
  const sc = scaleOf(s);
  if (sc?.sub && value % SCALE === 0) return { kind: 'cmp', ...fromSmall(value / SCALE, sc.sub.pair) };
  return { kind: 'meas', value: { units: value, dp: 0 }, unit: unitOf(s) };
}

/** The unit printed after a whole or decimal box: the spec's, or the instrument's (`null`: none). */
export function printedUnit(task: Task, spec: InputSpec): Unit | null {
  if (spec.unit && spec.unit !== 'dollar') return spec.unit;
  const w = measureWorkOf(spec);
  if (w && typeof w.into === 'string' && !w.into.includes('-')) return w.into as Unit;
  if (task.kind === 'count-intervals' || task.kind === 'read-scale') {
    const s = instrumentOf(task);
    return s ? unitOf(s) : null;
  }
  return null;
}

/** The unit chips a measure box offers: the spec's, else the answer's family. */
export function unitChips(spec: InputSpec): Unit[] {
  if (Array.isArray(spec.units)) return spec.units;
  const a = answerValues(spec)[0];
  const f = a && !isFracValue(a) && a.kind === 'meas' ? familyOf(a.unit) : null;
  return f ? FAMILY_UNITS[f] : ['cm', 'm'];
}

/** A written value in one unit: what the child wrote as a quantity (`null` while a box or the unit chip is empty). */
interface Wrote {
  /** Millionths of `unit`. */
  value: number;
  unit: Unit;
}

/** The answer a written part holds, as millionths of a unit (a whole number in the printed unit, a measure, a decimal). */
function answerAsWrote(task: Task, spec: InputSpec, a: AnswerValue): Wrote | null {
  const unit = printedUnit(task, spec);
  if (isFracValue(a)) return a.d === 1 && !a.w && unit ? { value: a.n * SCALE, unit } : null;
  if (a.kind === 'meas') return { value: a.value.units, unit: a.unit };
  if (a.kind === 'dec') return unit ? { value: a.units, unit } : null;
  if (a.kind === 'cmp') return { value: a.total * SCALE, unit: a.small };
  return null;
}

/** What the child wrote in a whole, measure or decimal box. */
function wroteOf(task: Task, spec: InputSpec, input: Readonly<Record<string, string>>): Wrote | null {
  if (spec.form === 'decimal') {
    const d = parseDecimal(input.x ?? '');
    const unit = printedUnit(task, spec);
    return d && unit ? { value: d.units, unit } : null;
  }
  const n = /^\d+$/.test(input.w ?? '') ? Number(input.w) : null;
  if (n === null) return null;
  if (spec.form === 'measure') {
    const u = input.u as Unit | undefined;
    return u && familyOf(u) ? { value: n * SCALE, unit: u } : null;
  }
  const unit = printedUnit(task, spec);
  return unit ? { value: n * SCALE, unit } : null;
}

const asQty = (w: Wrote): QtyValue => ({ kind: 'meas', value: { units: w.value, dp: 0 }, unit: w.unit });
/** Two written values the same quantity (1000 g = 1 kg)? */
const sameQty = (a: Wrote, b: Wrote): boolean => compareQty(asQty(a), asQty(b)) === 0;
/** A value in another unit of its family (`null`: not exact). */
function inUnit(w: Wrote, u: Unit): number | null {
  if (familyOf(w.unit) !== familyOf(u)) return null;
  const b = w.value * baseOf(w.unit);
  return b % baseOf(u) === 0 ? b / baseOf(u) : null;
}

/* ------------------------------------------------------------------ */
/* Checking                                                            */
/* ------------------------------------------------------------------ */

export interface MeasureCheck {
  ok: boolean;
  code: MisconceptionCode | null;
}
const OK: MeasureCheck = { ok: true, code: null };
const NOT_YET: MeasureCheck = { ok: false, code: null };
const pick = (codes: readonly MisconceptionCode[], test: (c: MisconceptionCode) => boolean): MeasureCheck => ({ ok: false, code: codes.find(test) ?? null });

/** The written part of a measuring task: a measure, a whole number or a decimal in a unit, or a compound. */
export function checkMeasureInput(task: Task, spec: InputSpec, input: Readonly<Record<string, string>>, codes: readonly MisconceptionCode[]): MeasureCheck {
  const a = answerValues(spec)[0];
  if (!a) return NOT_YET;
  if (spec.form === 'compound') {
    const w = readWritten(spec, input)?.[0];
    if (!w || w.kind !== 'cmp' || isFracValue(a) || a.kind !== 'cmp') return NOT_YET;
    const f = FACTOR[w.pair];
    if (w.small < f && w.big * f + w.small === a.total) return OK;
    return pick(codes, (c) => compoundShows(c, task, spec, a, w.big, w.small));
  }
  const want = answerAsWrote(task, spec, a);
  const got = wroteOf(task, spec, input);
  if (!want || !got) return NOT_YET;
  if (sameQty(got, want)) return OK;
  return pick(codes, (c) => wroteShows(c, task, spec, want, got));
}

/** The diagnosis context of an instrument reading, in the unit it is read in. */
function readCtx(task: Task): { r: Reading; length: boolean; unit: Unit } | null {
  const s = instrumentOf(task);
  if (!s) return null;
  if (task.kind === 'count-intervals') {
    const sc = scaleOf(s);
    if (!sc) return null;
    const [a, b] = [task.between[0].units, task.between[1].units];
    return { r: { ...breakdown(sc, b), value: b - a, a, b }, length: true, unit: unitOf(s) };
  }
  const r = readingOf(s);
  return r ? { r, length: r.a !== undefined, unit: unitOf(s) } : null;
}

/** Does a value written in one unit show `code` (an instrument read, a part counted, a measure changed, a unit chosen)? */
function wroteShows(code: MisconceptionCode, task: Task, spec: InputSpec, want: Wrote, got: Wrote): boolean {
  if (code === 'wrong-unit') return spec.form === 'measure' && got.value === want.value && got.unit !== want.unit;
  const w = measureWorkOf(spec);
  if (w) {
    const from = w.from;
    const into = w.into;
    if (from.kind === 'cmp' && !into.includes('-')) {
      const x = inUnit(got, from.small);
      return x !== null && x % SCALE === 0 && toSmallShows(code, from.bigPart, from.smallPart, FACTOR[pairOf(from.big, from.small)!], x / SCALE);
    }
    if (from.kind === 'meas' && !into.includes('-')) {
      const pair = pairOf(from.unit, into as Unit) ?? pairOf(into as Unit, from.unit);
      if (!pair) return false;
      const down = PAIR[pair].big === from.unit;
      return got.unit === into && convertShows(code, from.value.units, FACTOR[pair], down, got.value);
    }
    return false;
  }
  const ctx = readCtx(task);
  if (!ctx) return false;
  const x = inUnit(got, ctx.unit);
  if (x === null) return false;
  if (task.kind === 'count-intervals' && task.ask === 'part') return partShows(code, ctx.r, x);
  return readShows(code, { r: ctx.r, length: ctx.length }, x);
}

/** Does a compound written (`big`, `small`) show `code`? */
function compoundShows(code: MisconceptionCode, task: Task, spec: InputSpec, answer: Extract<AnswerValue, { kind: 'cmp' }>, big: number, small: number): boolean {
  const f = FACTOR[compoundPairOf(spec)];
  const w = measureWorkOf(spec);
  if (w) {
    const from = w.from;
    if (from.kind === 'meas' && from.value.units % SCALE !== 0 && from.unit === answer.big) return code === 'decimal-as-subunit' && decimalAsCompound(from.value.units, big, small, f);
    if (from.kind === 'meas') {
      const a = qtyIn(from, answer.small);
      return !!a && a.units % SCALE === 0 && toCompoundShows(code, a.units / SCALE, f, big, small);
    }
    return false;
  }
  const s = instrumentOf(task);
  const r = s ? readingOf(s) : null;
  if (!s || !r) return false;
  // A decimal scale in the big unit read as a compound (1.4 kg written 1 kg 4 g).
  if (unitOf(s) === answer.big) return code === 'decimal-as-subunit' && decimalAsCompound(r.value, big, small, f);
  if (unitOf(s) !== answer.small) return false;
  return compoundReadShows(code, { r, length: r.a !== undefined }, big, small, f);
}

/** Sides for the comparison rules: the value in the family's smallest unit, the number printed first, a compound's parts. */
export function sideOf(q: QtyValue): Side {
  const base = qtyBase(q).units;
  const printed = printedNumber(q).units;
  if (q.kind !== 'cmp') return { base, printed };
  return { base, printed, compound: { B: q.bigPart, s: q.smallPart, f: FACTOR[pairOf(q.big, q.small)!], per: baseOf(q.small) * SCALE } };
}

const SYM: Record<-1 | 0 | 1, Claim> = { [-1]: '<', 0: '=', 1: '>' };

/** The claim a compare answer amounts to. */
function claimOf(task: TaskOf<'compare'>, s: { symbol: Claim | null; pick: 'a' | 'b' | null }): Claim | null {
  if (task.ask === 'symbol') return s.symbol;
  if (s.pick === null) return null;
  return (task.ask === 'greater' ? s.pick === 'a' : s.pick === 'b') ? '>' : '<';
}

/** The items of a quantity order task in the right order (indices). */
export function qtyOrder(task: TaskOf<'order'>): number[] {
  const items = task.items as QtyValue[];
  return items.map((_, i) => i).sort((i, j) => (compareQty(items[i]!, items[j]!) ?? 0) * (task.direction === 'asc' ? 1 : -1));
}

type Full = MeasureState & { symbol: Claim | null; pick: 'a' | 'b' | null; order: number[] };

/** The model phase of a measuring task (`null`: not one of them: the generic check, e.g. a choice). */
export function checkMeasureModel(task: Task, s: Full, codes: readonly MisconceptionCode[]): MeasureCheck | null {
  switch (task.kind) {
    case 'set-scale': {
      if (task.mode === 'weights') {
        const s0 = instrumentOf(task);
        return s0 && s.mweights.reduce((x, y) => x + y, 0) === loadMass(s0) ? OK : NOT_YET;
      }
      const t = setTarget(task);
      const sc = taskScale(task);
      if (t === null || !sc || s.mset === null) return NOT_YET;
      const v = setValue(task, s);
      if (v === t) return OK;
      return pick(codes, (c) => setShows(c, t, sc.major, sc.minor, v));
    }
    case 'count-intervals': {
      const want = countParts(task);
      return want.length === s.mparts.length && want.every((p) => s.mparts.includes(p)) ? OK : NOT_YET;
    }
    case 'compare': {
      if (!isQty(task.a) || !isQty(task.b)) return null;
      const claim = claimOf(task, s);
      if (claim === null) return NOT_YET;
      const c = compareQty(task.a, task.b);
      if (c !== null && claim === SYM[c]) return OK;
      const a = sideOf(task.a);
      const b = sideOf(task.b);
      return pick(codes, (code) => compareShows(code, a, b, claim));
    }
    case 'order': {
      if (!task.items.every(isQty) || s.order.length !== task.items.length) return task.items.every(isQty) ? NOT_YET : null;
      const right = qtyOrder(task);
      if (s.order.every((v, i) => v === right[i])) return OK;
      const items = (task.items as QtyValue[]).map(sideOf);
      return pick(codes, (c) => orderShows(c, items, s.order, task.direction === 'asc' ? 1 : -1));
    }
    default:
      return null;
  }
}

/** Enough is done on a measuring model to press Check (`null`: not one of them). */
export function measureAnswered(task: Task, s: MeasureState): boolean | null {
  if (task.kind === 'set-scale') return task.mode === 'weights' ? s.mweights.length > 0 : s.mset !== null && s.mset !== setStart(task);
  if (task.kind === 'count-intervals') return s.mparts.length > 0;
  return null;
}

/** Is a written measuring part filled in (a measure's unit chip chosen, a compound's big box written)? */
export function measureInputAnswered(task: Task, spec: InputSpec, input: Readonly<Record<string, string>>): boolean {
  if (spec.form === 'compound') return readWritten(spec, input) !== null;
  return wroteOf(task, spec, input) !== null;
}

/* ------------------------------------------------------------------ */
/* Solving and samples                                                 */
/* ------------------------------------------------------------------ */

type Move = MeasureAction | { do: 'check' } | { do: 'symbol'; value: Claim } | { do: 'pick'; side: 'a' | 'b' } | { do: 'align' } | { do: 'order'; item: number } | { do: 'input'; field: string; value: string };

/** The boxes a measuring answer fills (solve, "Show me"). */
export function measureBoxes(task: Task, spec: InputSpec): Record<string, string> {
  const a = answerValues(spec)[0];
  if (!a) return {};
  if (spec.form === 'compound') return valueBoxes(spec, [a]);
  if (spec.form === 'decimal') {
    const w = answerAsWrote(task, spec, a);
    return w ? { x: numText(w.value) } : {};
  }
  const w = answerAsWrote(task, spec, a);
  if (!w) return {};
  const out: Record<string, string> = { w: String(Math.round(w.value / SCALE)) };
  if (spec.form === 'measure') out.u = w.unit;
  return out;
}

/** The moves of a measuring task's model phase, done right (`null`: not one of them). */
export function measureSolveModel(task: Task): Move[] | null {
  switch (task.kind) {
    case 'set-scale': {
      if (task.mode === 'weights') {
        const s = instrumentOf(task);
        const ws = s ? fewestWeights(loadMass(s), task.weights ?? []) : null;
        return (ws ?? []).map((w) => ({ do: 'weigh', w }));
      }
      const t = setTarget(task);
      return t === null ? [] : [{ do: 'mset', to: t }];
    }
    case 'count-intervals':
      return countParts(task).map((part) => ({ do: 'mpart', part }));
    case 'compare': {
      if (!isQty(task.a) || !isQty(task.b)) return null;
      const c = compareQty(task.a, task.b) ?? 0;
      const align: Move[] = task.align ? [{ do: 'align' }] : [];
      if (task.ask === 'symbol') return [...align, { do: 'symbol', value: SYM[c] }];
      return [...align, { do: 'pick', side: (task.ask === 'greater' ? c > 0 : c < 0) ? 'a' : 'b' }];
    }
    case 'order':
      return task.items.every(isQty) ? qtyOrder(task).map((item) => ({ do: 'order', item })) : null;
    default:
      return null;
  }
}

/** The boxes of a sample answer in a measuring form: whole `"13"`, measure `"350 kg"` (or `"350"`: the answer's unit), decimal `"1.05"` (a compound is `forms.ts sampleBoxes`: `"1,23"`). */
export function measureSampleBoxes(spec: InputSpec, text: string): Record<string, string> | null {
  const t = text.trim();
  if (spec.form === 'measure') {
    const q = parseQuantity(t);
    if (q && q.kind === 'meas' && q.value.units % SCALE === 0) return { w: String(q.value.units / SCALE), u: q.unit };
    const a = answerValues(spec)[0];
    if (/^\d{1,5}$/.test(t) && a && !isFracValue(a) && a.kind === 'meas') return { w: t, u: a.unit };
    return null;
  }
  if (spec.form === 'decimal') return parseDecimal(t) ? { x: t } : null;
  if (spec.form === 'whole') return /^\d{1,5}$/.test(t) ? { w: t } : null;
  return null;
}

/** The state of a wrong model answer in a measuring task's notation (`null`: not one of them, or it does not parse). */
export function measureSample<S extends Full>(task: Task, start: S, sample: string, apply: (from: S, moves: Move[]) => S): S | null | undefined {
  switch (task.kind) {
    case 'set-scale': {
      // `"6"`, `"550"`, `"1.4"` (the value set, in the instrument's unit) · `"weights:500,200"`.
      const w = /^weights:(\d+(?:,\d+)*)$/.exec(sample);
      if (task.mode === 'weights') return w ? apply(start, w[1]!.split(',').map((x) => ({ do: 'weigh', w: Number(x) }) as Move)) : null;
      const d = parseDecimal(sample);
      if (!d) return null;
      const out = apply(start, [{ do: 'mset', to: d.units }]);
      return out.mset === d.units ? out : null;
    }
    case 'count-intervals': {
      // `"parts:4"`: the first four parts tapped.
      const m = /^parts:(\d+)$/.exec(sample);
      return m ? apply(start, countParts(task).slice(0, Number(m[1])).map((part) => ({ do: 'mpart', part }) as Move)) : null;
    }
    default:
      return undefined;
  }
}

/** The weights "Show me" draws: the fewest that balance. */
export function ghostWeights(task: TaskOf<'set-scale'>): number[] {
  const s = instrumentOf(task);
  return (s && fewestWeights(loadMass(s), task.weights ?? [])) || [];
}
