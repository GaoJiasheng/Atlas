/**
 * The chart checks (docs/77 §3.2, docs/78 §3.1): what `fill-table` and
 * `even-out` keep in the task state, how a move changes it, how they and the
 * numbers written about a chart are checked and diagnosed, the right way
 * through (solve), the state a wrong-answer sample stands for, the sentence
 * under the model and the way a question asks (the practice's "kinds").
 * `state.ts`, `check.ts`, `solve.ts` and `working.ts` hand chart tasks here.
 * Tapping a bar or a point on a question draws a reading hairline (`guide`):
 * a help, never checked. Pure.
 *
 * Samples: fill-table `"barley.cups=14"` (that cell written so, the others
 * right; several joined with `;`); even-out `"=5"` or `"5"` (the average
 * written); input as its form (`"8"`, `"7.5"`).
 */
import type { InputSpec, MisconceptionCode, Task, TaskOf } from '../schema';
import { chartItems, levelMoves, tableBlanks } from './chart';
import { isChartModel } from './data-kind';
import { cellShows, dataAnswer, dataContextOf, diagnoseData, same, taskChart, type DataCtx } from './diagnose/data';
import { answerValues, readWritten, sampleBoxes, valueBoxes } from './forms';
import { decimalBoxes, decimalSampleBoxes, readDecimals } from './decimal-tasks';
import { isFracValue, type AnswerValue } from './value';

export { isDataTask } from './data-kind';

/* ------------------------------------------------------------------ */
/* State and moves                                                      */
/* ------------------------------------------------------------------ */

export interface DataState {
  /** even-out: the towers' heights now (`null`: not an even-out task). */
  towers: number[] | null;
  /** even-out: the tower whose top block is lifted. */
  held: number | null;
  /** A question on a chart: the categories the child tapped (a reading hairline each). */
  guides: string[];
}

export type DataAction = { do: 'etap'; tower: number } | { do: 'ereset' } | { do: 'guide'; key: string };
export const DATA_ACTIONS = new Set(['etap', 'ereset', 'guide']);

/** The towers an even-out task starts with. */
export function startTowers(task: Task): number[] | null {
  if (task.kind !== 'even-out') return null;
  const c = taskChart(task);
  return c ? (c.cats ?? []).map((x) => x.value ?? 0) : null;
}

export const dataInitial = (task: Task): DataState => ({ towers: startTowers(task), held: null, guides: [] });

/** Digits a table cell takes. */
export const CELL_DIGITS = 4;

export function dataReduce<S extends DataState & { input: Record<string, string> }>(task: Task, s: S, action: DataAction | { do: 'input'; field: string; value: string }): S {
  switch (action.do) {
    case 'input': {
      // A table cell (fill-table): digits only.
      const c = taskChart(task);
      if (!c || !tableBlanks(c).some((b) => b.key === action.field)) return s;
      return { ...s, input: { ...s.input, [action.field]: action.value.replace(/\D/g, '').slice(0, CELL_DIGITS) } };
    }
    case 'etap': {
      const t = s.towers;
      if (!t || action.tower < 0 || action.tower >= t.length) return s;
      // Lift a tower's top block; tap it again to put it back; tap another tower to put it there.
      if (s.held === null) return t[action.tower]! >= 1 ? { ...s, held: action.tower } : s;
      if (s.held === action.tower) return { ...s, held: null };
      const next = [...t];
      next[s.held]! -= 1;
      next[action.tower]! += 1;
      return { ...s, towers: next, held: null };
    }
    case 'ereset':
      return { ...s, towers: startTowers(task), held: null };
    case 'guide':
      return { ...s, guides: s.guides.includes(action.key) ? s.guides.filter((k) => k !== action.key) : [...s.guides, action.key] };
  }
}

/** Blocks moved so far (each block counted once, however far it went). */
export function blocksMoved(task: Task, towers: readonly number[] | null): number {
  const start = startTowers(task);
  if (!start || !towers) return 0;
  return start.reduce((a, v, i) => a + Math.max(0, v - (towers[i] ?? 0)), 0);
}

/** Are the towers level? */
export const level = (towers: readonly number[] | null): boolean => !!towers && towers.length > 0 && towers.every((v) => v === towers[0]);

/* ------------------------------------------------------------------ */
/* Checking                                                             */
/* ------------------------------------------------------------------ */

export interface DataCheck {
  ok: boolean;
  code: MisconceptionCode | null;
}
const OK: DataCheck = { ok: true, code: null };
const NOT_YET: DataCheck = { ok: false, code: null };

const answerNumber = (a: AnswerValue | undefined): number | null => (!a ? null : isFracValue(a) ? a.n / a.d : 'kind' in a && a.kind === 'dec' ? a.units / 1_000_000 : null);

/** The number written in a data question's box (`null`: empty). */
export function writtenNumber(spec: InputSpec, input: Readonly<Record<string, string>>): number | null {
  if (spec.form === 'decimal') {
    const d = readDecimals(spec, input);
    return d?.[0] ? d[0].units / 1_000_000 : null;
  }
  const w = readWritten(spec, input);
  return w?.[0]?.kind === 'whole' ? w[0].n : null;
}

/** The task's answer as a number. */
export const dataAnswerOf = (spec: InputSpec): number | null => answerNumber(answerValues(spec)[0]);

/** A fill-table's blanks with their answers. */
export function fillBlanks(task: TaskOf<'fill-table'>) {
  const c = taskChart(task);
  return c ? tableBlanks(c).map((b) => ({ ...b, answer: task.cells[b.key] ?? null })) : [];
}

/** Check a chart task's phase (`null`: the generic check applies — a choice). */
export function checkDataPhase(task: Task, input: Readonly<Record<string, string>>, spec: InputSpec | null, codes: readonly MisconceptionCode[]): DataCheck | null {
  if (task.kind === 'fill-table') {
    const c = taskChart(task);
    const blanks = fillBlanks(task);
    if (!c || blanks.some((b) => !input[b.key])) return NOT_YET;
    for (const b of blanks) {
      const x = Number(input[b.key]);
      if (x === b.answer) continue;
      return { ok: false, code: codes.find((code) => cellShows(code, c, b.key, x)) ?? null };
    }
    return OK;
  }
  if (!spec) return null;
  const x = writtenNumber(spec, input);
  if (x === null) return NOT_YET;
  const t = dataAnswerOf(spec);
  if (t !== null && same(x, t)) return OK;
  const ctx = dataContextOf(task, spec);
  return { ok: false, code: ctx ? diagnoseData(codes, ctx, x) : null };
}

/** Enough is done to press Check (`null`: the generic rule). */
export function dataAnswered(task: Task, input: Readonly<Record<string, string>>): boolean | null {
  if (task.kind === 'fill-table') return fillBlanks(task).every((b) => !!input[b.key]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Solving and samples                                                  */
/* ------------------------------------------------------------------ */

type Act = DataAction | { do: 'input'; field: string; value: string };

/** The boxes holding a written answer. */
export function answerBoxes(spec: InputSpec): Record<string, string> {
  return spec.form === 'decimal' ? decimalBoxes(spec) : valueBoxes(spec, answerValues(spec));
}

/** The right way through a fill-table (each cell) or an even-out (level the towers, then write the average); `null`: the generic solve. */
export function dataSolve(task: Task): Act[] | null {
  if (task.kind === 'fill-table') return fillBlanks(task).map((b) => ({ do: 'input', field: b.key, value: String(b.answer ?? '') }));
  if (task.kind === 'even-out') {
    const moves = levelMoves(startTowers(task) ?? []) ?? [];
    const taps: Act[] = moves.flatMap(([from, to]) => [{ do: 'etap', tower: from } as Act, { do: 'etap', tower: to } as Act]);
    return [...taps, ...Object.entries(answerBoxes(task.answer)).map(([field, value]) => ({ do: 'input', field, value }) as Act)];
  }
  return null;
}

/** The state of a wrong-answer sample (`null`: does not parse; `undefined`: the generic notation). */
export function dataSample<S extends DataState & { input: Record<string, string> }>(task: Task, start: S, sample: string): S | null | undefined {
  if (task.kind === 'fill-table') {
    const input: Record<string, string> = {};
    for (const b of fillBlanks(task)) input[b.key] = String(b.answer ?? '');
    for (const part of sample.split(';')) {
      const m = /^\s*([a-z0-9-]+\.[a-z0-9-]+)\s*=\s*(\d{1,4})\s*$/.exec(part);
      if (!m || !(m[1]! in input)) return null;
      input[m[1]!] = m[2]!;
    }
    return { ...start, input };
  }
  if (task.kind === 'even-out') {
    const text = sample.replace(/^=/, '');
    const spec = task.answer;
    const boxes = spec.form === 'decimal' ? decimalSampleBoxes(spec, text) : sampleBoxes(spec, text);
    return boxes ? { ...start, input: boxes } : null;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* The sentence under the model, the way a question asks                */
/* ------------------------------------------------------------------ */

/** A number as written in a sentence (`7.5`, `4.5`; money with its cents: `4.50`). */
export function numText(v: number, money = false): string {
  if (money && !Number.isInteger(v)) return v.toFixed(2);
  return String(Math.round(v * 100) / 100);
}

/** The worked sentence of a data question (its answer at the end), `null` when there is none to write. */
export function dataSentence(ctx: DataCtx, money = false): string | null {
  const t = dataAnswer(ctx);
  if (t === null) return null;
  const N = (v: number) => numText(v, money);
  const c = ctx.chart;
  const vals = c ? ctx.of.map((k) => {
    const item = c.cats?.find((x) => x.id === k);
    return item?.value ?? null;
  }) : [];
  switch (ctx.ask) {
    case 'difference':
    case 'biggest-increase': {
      const [a, b] = vals;
      if (a === null || a === undefined || b === null || b === undefined) return `${N(t)}`;
      return `${N(Math.max(a, b))} − ${N(Math.min(a, b))} = ${N(t)}`;
    }
    case 'sum':
      return ctx.of.length > 1 && vals.every((v) => v !== null) ? `${vals.map((v) => N(v!)).join(' + ')} = ${N(t)}` : `${N(t)}`;
    case 'part': {
      const s = c?.pie?.find((x) => x.id === ctx.of[0]);
      return s?.frac && c?.total ? `{${s.frac.n}/${s.frac.d}} × ${c.total} = ${N(t)}` : `${N(t)}`;
    }
    case 'whole': {
      const s = c?.pie?.find((x) => x.id === ctx.of[0]);
      return s?.frac && ctx.value !== undefined ? `${N(ctx.value)} × ${s.frac.d} = ${N(t)}` : `${N(t)}`;
    }
    case 'average': {
      const total = ctx.values.reduce((a, b) => a + b, 0);
      return `${N(total)} ÷ ${ctx.values.length} = ${N(t)}`;
    }
    case 'total':
      return `${N(ctx.average!)} × ${ctx.count} = ${N(t)}`;
    case 'count':
      return `${N(ctx.total!)} ÷ ${N(ctx.average!)} = ${N(t)}`;
    case 'missing': {
      const known = ctx.values.reduce((a, b) => a + b, 0);
      return `${ctx.count} × ${N(ctx.average!)} − ${N(known)} = ${N(t)}`;
    }
    case 'join':
      return `(${ctx.count} × ${N(ctx.average!)} + ${N(ctx.value!)}) ÷ ${ctx.count! + 1} = ${N(t)}`;
    case 'leave':
      return `(${ctx.count} × ${N(ctx.average!)} − ${N(ctx.value!)}) ÷ ${ctx.count! - 1} = ${N(t)}`;
    case 'joined':
      return `${ctx.count! + 1} × ${N(ctx.after!)} − ${ctx.count} × ${N(ctx.average!)} = ${N(t)}`;
    default:
      return `${N(t)}`;
  }
}

/** The way a data question asks (the practice counts ways, not kinds): a table filled, towers evened out, a number of each kind, a choice. */
export function dataWay(task: Task): string {
  if (task.kind === 'input' && task.data) return `input:${task.data.ask}`;
  if (task.kind === 'choose') return `choose:${isChartModel(task.model) ? chartItems(task.model)[0]!.type : 'words'}`;
  return task.kind;
}
