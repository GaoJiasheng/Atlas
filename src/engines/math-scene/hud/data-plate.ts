/**
 * The PLATE rows of a chart (docs/77 §3.3, docs/78 §3.3): MODEL CHART ·
 * TYPE · ITEMS · SCALE · TOTAL for a graph (TOTAL on a beat, on a check only
 * once done); MODEL BAR · ITEMS · TOTAL · LEVEL (· AVERAGE) for towers of
 * blocks and the strip — the level once the towers are the same height.
 */
import type { Model, Task } from '../schema';
import type { TaskState } from '../lib/state';
import type { PlateRow } from './PlateBlock';
import { chartTotal, pieParts } from '../lib/chart';
import { averageFacts, chartOf, scaleText } from './data-facts';
import { numText } from '../lib/data-tasks';

const UP = (s: string) => s.toLocaleUpperCase('en');
const dash = '—';

export function dataPlateRows(m: Model, task: Task | null, state: TaskState | null, done: boolean): PlateRow[] | null {
  const c = chartOf(m);
  if (!c) return null;
  const towers = (c.type === 'bar' && !!c.stack) || !!c.pooled || c.type === 'strip';
  if (towers) {
    const f = averageFacts(m, task, state, done)!;
    return [
      { key: 'math.plate.model', value: c.type === 'strip' ? 'MODEL' : 'BAR' },
      { key: 'math.plate.items', value: f.items },
      { key: 'math.plate.total', value: f.total },
      { key: 'math.plate.towerLevel', value: f.level, on: true },
    ];
  }
  const items = c.type === 'pie' ? pieParts(c).length : c.type === 'table' ? (c.table?.rows.filter((r) => !r.total).length ?? 0) : (c.cats?.length ?? 0);
  const reading = !!task && !done;
  const total = c.type === 'pie' ? (c.total ?? null) : c.type === 'table' ? null : chartTotal(c);
  return [
    { key: 'math.plate.model', value: 'CHART' },
    { key: 'math.plate.chartType', value: UP(c.type === 'picture' ? 'picture' : c.type) },
    { key: 'math.plate.items', value: String(items) },
    { key: 'math.plate.scale', value: UP(scaleText(c, 'en') ?? dash) },
    { key: 'math.plate.total', value: total === null || (reading && c.type !== 'pie') ? dash : numText(total), on: true },
  ];
}
