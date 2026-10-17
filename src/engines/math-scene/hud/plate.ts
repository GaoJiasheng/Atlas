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

const dash = '—';

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
