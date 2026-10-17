/**
 * The PLATE block's rows by model kind (docs/19 §3.0 G4): the array (groups ·
 * each · total), the whole-number line (jumps · size · end) and the blocks
 * (hundreds · tens · ones · trades); the fraction models and the grid keep
 * theirs (`PlateBlock.modelRows`, the grid rows in View). On a check the
 * rows are the child's work and the givens, never the answer before it is
 * done; the clock (time · hand · notation) and the timeline (from · to ·
 * jumped) the same way: a clock to read shows `?` until it is read.
 */
import type { Model, Task } from '../schema';
import type { TaskState } from '../lib/state';
import { looseOf } from '../lib/state';
import { factOf, layoutsOf, parseArrayCut, thingCount } from '../lib/array';
import { matOf, standard, tradeOf } from '../lib/blocks';
import type { PlateRow } from './PlateBlock';
import { digitAt, formatDecimal, withPlaces, type Decimal } from '../lib/decimal';
import { gridsOf, shadedTh, wholesOf } from '../lib/dgrid';
import { levelsFor, levelsOf } from '../lib/dline';
import { piecesOf, moneyText, totalCents } from '../lib/money';
import { placedValue, shadedValue, shiftResult } from '../lib/decimal-tasks';
import { clockShown, faceTime, facesOf } from '../lib/clock';
import { hopEnd, hopStart, rangeOf } from '../lib/timeline';
import { clockText, DEFAULT_NOTATION, durationText, naturalUnits, sep12, sep24, type ClockMode, type Notation } from '../lib/value';
import type { ClockFaceSpec } from '../schema';

const dash = '—';

const D = (d: Decimal) => formatDecimal(withPlaces(d, 0));

/**
 * Rows for the decimal models (docs/29 §3.9, X5): the grid (MODEL · WHOLES ·
 * TENTHS · HUNDREDTHS · THOUSANDTHS · SHADED), the chart (NUMBER · TRADES ·
 * SHIFT), the line (RANGE · STEP · ZOOM · MARK), money (COINS · TOTAL). On a
 * check they are the child's work (shaded, placed, moved) and the givens —
 * a picture to read keeps its value to itself.
 */
export function decimalPlateRows(m: Model, task: Task | null, state: TaskState | null, done: boolean): PlateRow[] | null {
  const reading = !!task && !done && (task.kind === 'input' || task.kind === 'choose');
  if (m.kind === 'decimal-grid') {
    const g = gridsOf(m)[0]!;
    const shaded: Decimal | null = task?.kind === 'shade-decimal' && state ? shadedValue(task, state) : reading || m.pair ? null : { units: shadedTh(g) * 1000, dp: 0 };
    const digit = (place: number) => (shaded ? String(digitAt(shaded, place)) : dash);
    return [
      { key: 'math.plate.model', value: g.level === 10 ? 'TENTHS' : g.level === 1000 ? 'THOUSAND GRID' : 'HUNDRED GRID' },
      { key: 'math.plate.wholes', value: String(task?.kind === 'shade-decimal' ? Math.max(task.wholes ?? 1, Math.ceil(Math.round(task.target.units / 1000) / 1000)) : wholesOf(g)) },
      { key: 'math.plate.tenths', value: digit(-1) },
      { key: 'math.plate.hundredths', value: g.level === 10 ? dash : digit(-2) },
      { key: 'math.plate.thousandths', value: g.level === 1000 ? digit(-3) : dash },
      { key: 'math.plate.shaded', value: shaded ? D(shaded) : dash, on: true },
    ];
  }
  if (m.kind === 'place-value') {
    const chart = task && state && (task.kind === 'share' || task.kind === 'regroup');
    const number = task?.kind === 'shift-digits' ? D(task.value) : task?.kind === 'align-add' ? `${D(task.a)} ${task.op} ${D(task.b)}` : chart && typeof task.value !== 'number' ? D(task.value) : reading ? dash : m.value ? D(m.value) : m.rows ? m.rows.map(D).join(' · ') : dash;
    const shift = task?.kind === 'shift-digits' && state ? (state.shift ? `${state.shift > 0 ? '×' : '÷'}${10 ** Math.abs(state.shift)}${shiftResult(task, state) ? ` → ${D(shiftResult(task, state)!)}` : ''}` : dash) : m.shift ? `${m.shift.dir === 'left' ? '×' : '÷'}${10 ** m.shift.by}` : dash;
    return [
      { key: 'math.plate.model', value: 'PLACE VALUE' },
      { key: 'math.plate.number', value: number },
      { key: 'math.plate.trades', value: chart && state ? String(state.trades) : m.trade ? m.trade.replace('>', ' → ') : dash },
      { key: 'math.plate.shift', value: shift, on: true },
    ];
  }
  if (m.kind === 'numberline' && m.scale === 'decimal') {
    const levels = task?.kind === 'place' && state ? levelsFor(m, state.zoomPath) : levelsOf(m).filter((l) => l !== null);
    const deepest = levels.at(-1);
    const mark = task?.kind === 'place' && state ? placedValue(task, state) : reading ? null : (m.marks?.at(-1) ?? null);
    return [
      { key: 'math.plate.model', value: 'NUMBER LINE' },
      { key: 'math.plate.range', value: `${formatDecimal(m.from)}–${formatDecimal(m.to)}` },
      { key: 'math.plate.step', value: deepest ? D(deepest.step) : dash },
      { key: 'math.plate.zoom', value: levels.length > 1 ? `×${10 ** (levels.length - 1)}` : dash },
      { key: 'math.plate.mark', value: mark ? D(mark) : dash, on: true },
    ];
  }
  if (m.kind === 'money') {
    const pieces = m.pair ? m.pair.flatMap((g) => piecesOf({ amount: g.amount })) : piecesOf(m);
    return [
      { key: 'math.plate.model', value: 'MONEY' },
      { key: 'math.plate.coins', value: String(pieces.length) },
      { key: 'math.plate.total', value: reading ? dash : m.pair ? m.pair.map((g) => `$${formatDecimal(withPlaces(g.amount, 2))}`).join(' · ') : moneyText(totalCents(pieces)), on: true },
    ];
  }
  return null;
}

/** Rows for an array, a whole-number line or the blocks (`null`: another model). */
export function valuePlateRows(m: Model, task: Task | null, state: TaskState | null, done: boolean, notation: Notation = DEFAULT_NOTATION): PlateRow[] | null {
  if (m.kind === 'clock') return clockRows(m, task, state, done, notation);
  if (m.kind === 'timeline') return timelineRows(m, task, state, notation);
  if (m.kind === 'array') {
    const rows = (groups: string, each: string, total: string): PlateRow[] => [
      { key: 'math.plate.model', value: 'ARRAY' },
      { key: 'math.plate.groups', value: groups },
      { key: 'math.plate.each', value: each },
      { key: 'math.plate.total', value: total, on: true },
    ];
    if (task && state) {
      if (task.kind === 'group') {
        const g = state.groups.filter((n) => n > 0);
        const equal = g.length > 0 && g.every((n) => n === g[0]);
        return rows(String(state.groups.length), equal ? String(g[0]) : dash, `${task.total}${looseOf(task, state) ? ` · ${looseOf(task, state)} LEFT` : ''}`);
      }
      if (task.kind === 'arrange') return rows(state.arr ? String(state.arr[0]) : dash, state.arr ? String(state.arr[1]) : dash, done && state.arr ? String(state.arr[0] * state.arr[1]) : dash);
      if (task.kind === 'split-array') {
        const c = parseArrayCut(state.cut);
        return rows(String(task.rows), String(task.cols), done ? String(task.rows * task.cols) : c ? `${c.axis === 'rows' ? 'R' : 'C'}${c.at} | ${dash}` : dash);
      }
      return rows(dash, dash, dash);
    }
    const first = layoutsOf(m)[0]!;
    const f = factOf(first);
    return f ? rows(first.cover?.rows ? '?' : String(f.groups), first.cover?.cols ? '?' : String(f.each), String(f.total)) : rows(dash, dash, String(thingCount(first)));
  }
  if (m.kind === 'numberline' && m.scale === 'whole') {
    const rows = (jumps: string, size: string, end: string): PlateRow[] => [
      { key: 'math.plate.model', value: 'LINE' },
      { key: 'math.plate.jumps', value: jumps },
      { key: 'math.plate.size', value: size },
      { key: 'math.plate.lands', value: end, on: true },
    ];
    if (task && state && task.kind === 'skip-count') return rows(String(state.landings.length), String(task.size), done ? String(task.size * task.count) : (state.landings.at(-1)?.toString() ?? dash));
    if (task) return rows(dash, dash, dash);
    if (!m.jumps) return rows(dash, dash, dash);
    return rows(String(m.jumps.count), String(m.jumps.size), String((m.jumps.from ?? m.from) + m.jumps.size * m.jumps.count));
  }
  if (m.kind === 'blocks') {
    const c = task && state && (task.kind === 'regroup' || task.kind === 'share') ? state.mat : m.copies && !m.combined && !m.left ? standard(m.value ?? 0) : matOf(m);
    const trades = task && state ? String(state.trades) : m.trade ? `${tradeOf(m.trade).take} ${tradeOf(m.trade).from} → ${tradeOf(m.trade).give} ${tradeOf(m.trade).to}` : dash;
    return [
      { key: 'math.plate.model', value: 'BLOCKS' },
      { key: 'math.plate.hundreds', value: String(c.H) },
      { key: 'math.plate.tens', value: String(c.T) },
      { key: 'math.plate.ones', value: String(c.O) },
      { key: 'math.plate.trades', value: trades, on: true },
    ];
  }
  return null;
}

const UP = (s: string) => s.toLocaleUpperCase('en');

/** How a face is read: 12-hour time with its plate, 24-hour time with its inner ring, else the face's own reading. */
const modeOf = (f: ClockFaceSpec): ClockMode => (f.ampm === 'show' ? '12' : f.inner24 ? '24' : 'face');

/** The notation a reading is written in: `H.MM`, `H.MM AM`, `HH:MM`. */
function notationText(mode: ClockMode | 'duration', n: Notation): string {
  if (mode === 'duration') return 'MIN · S';
  if (mode === '24') return `HH${sep24(n)}MM`;
  return `H${sep12(n)}MM${mode === '12' ? (n.clock12 === 'h.mm a.m.' ? ' A.M.' : ' AM') : ''}`;
}

function clockRows(m: Extract<Model, { kind: 'clock' }>, task: Task | null, state: TaskState | null, done: boolean, notation: Notation): PlateRow[] {
  const f = facesOf(m)[0]!;
  const rows = (time: string, hand: string, how: string): PlateRow[] => [
    { key: 'math.plate.model', value: 'CLOCK' },
    { key: 'math.plate.time', value: time, on: true },
    { key: 'math.plate.hand', value: hand },
    { key: 'math.plate.notation', value: how },
  ];
  const text = (t: number, mode: ClockMode) => UP(clockText(t, mode, notation, 'en', true));
  const hands = f.face === 'stopwatch' ? 'S · MIN' : f.lit === 'both' ? 'HOUR · MINUTE' : f.lit ? UP(f.lit) : f.second ? 'H · M · S' : 'H · M';
  if (task && state) {
    if (task.kind === 'set-clock') {
      const mode: ClockMode = task.ampm ? '12' : 'face';
      return rows(text(clockShown(task, state.clock), mode), 'H · M', notationText(mode, notation));
    }
    // A clock to read: its time is the answer.
    const mode: ClockMode | 'duration' = task.kind === 'read-clock' ? (task.form === 'time24' ? '24' : task.form === 'time12' ? '12' : task.form === 'duration' ? 'duration' : 'face') : modeOf(f);
    const time = f.face === 'stopwatch' ? durationText(faceTime(f), ['m', 's'], 'en', true) : text(faceTime(f), mode === 'duration' ? 'face' : mode);
    return rows(done ? UP(time) : '?', hands, notationText(mode, notation));
  }
  if (f.face === 'stopwatch') return rows(UP(durationText(faceTime(f), ['m', 's'], 'en', true)), hands, notationText('duration', notation));
  return rows(text(f.time, modeOf(f)), hands, notationText(modeOf(f), notation));
}

function timelineRows(m: Extract<Model, { kind: 'timeline' }>, task: Task | null, state: TaskState | null, notation: Notation): PlateRow[] {
  const r = rangeOf(m);
  const at = (t: number) => (r.duration ? durationText(t, naturalUnits(t), 'en', true) : UP(clockText(t, m.labels === '24h' ? '24' : '12', notation, 'en', true)));
  const span = (d: number) => (d > 0 ? durationText(d, naturalUnits(d), 'en', true) : dash);
  const rows = (from: string, to: string, jumped: string): PlateRow[] => [
    { key: 'math.plate.model', value: 'TIMELINE' },
    { key: 'math.plate.from', value: from },
    { key: 'math.plate.to', value: to },
    { key: 'math.plate.jumped', value: jumped, on: true },
  ];
  if (task && state && task.kind === 'duration') {
    const s = hopStart(task);
    const end = hopEnd(task, state.hops);
    const moved = state.hops.reduce((a, h) => a + Math.abs(h), 0);
    return rows(s ? at(s.at) : dash, end !== null && state.hops.length ? at(end) : dash, span(moved));
  }
  if (task) return rows(dash, dash, dash);
  const jumps = m.jumps ?? [];
  const from = jumps[0]?.[0] ?? m.marks?.[0]?.at ?? r.from;
  const to = jumps.at(-1)?.[1] ?? (m.marks && m.marks.length > 1 ? m.marks.at(-1)!.at : r.to);
  return rows(at(from), at(to), span(jumps.reduce((a, [x, y]) => a + Math.abs(y - x), 0)));
}
