/**
 * The PLATE block's rows by model kind (docs/19 §3.0 G4): the array (groups ·
 * each · total), the whole-number line (jumps · size · end) and the blocks
 * (hundreds · tens · ones · trades); the fraction models and the grid keep
 * theirs (`PlateBlock.modelRows`, the grid rows in View). On a check the
 * rows are the child's work and the givens, never the answer before it is
 * done. The clock and the timeline add their rows here.
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
export function valuePlateRows(m: Model, task: Task | null, state: TaskState | null, done: boolean): PlateRow[] | null {
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
