/**
 * Which tasks belong to the graphs and averages (`data` domain, docs/77
 * §3.4, docs/78 §3.2): a chart on the stage or in an option, a table to fill,
 * towers to even out, or a number worked out from data (`data` on the written
 * part). Kept free of the heavier modules so `decimal-tasks`, `validate-values`
 * and the cards can ask without import cycles. Pure.
 */
import type { ChartModelSpec, Model, Task } from '../schema';

export const isChartModel = (m: Model): m is ChartModelSpec => m.kind === 'chart';

/** Is the task in the `data` domain? */
export function isDataTask(task: Task): boolean {
  if (task.kind === 'fill-table' || task.kind === 'even-out') return true;
  if (isChartModel(task.model)) return true;
  if (task.kind === 'choose' && task.options.some((o) => !!o.model && isChartModel(o.model))) return true;
  return task.kind === 'input' && !!task.data;
}
