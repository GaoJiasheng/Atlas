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
import { clockShown, faceTime, facesOf } from '../lib/clock';
import { hopEnd, hopStart, rangeOf } from '../lib/timeline';
import { clockText, DEFAULT_NOTATION, durationText, naturalUnits, sep12, sep24, type ClockMode, type Notation } from '../lib/value';
import type { ClockFaceSpec } from '../schema';

const dash = '—';

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
