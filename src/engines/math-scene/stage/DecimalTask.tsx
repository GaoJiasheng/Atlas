/**
 * A decimal check on the stage (docs/29 §3.6): the task's own model — the
 * hundred grid (shade-decimal), the place-value chart (share, regroup,
 * align-add, shift-digits), the decimal line (place with zoom, round-on-line,
 * an order shown on the line) or money — or, for two decimals compared, the
 * view the VIEW group asks for: the two grids side by side, the two numbers
 * on the chart lined up on the point, or both on one number line. "Show me"
 * draws the right answer dashed.
 */
import type { Locale } from '../../core/types';
import type { Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import type { TaskRun } from '../ui';
import { solvedState } from '../lib/solve';
import type { Decimal } from '../lib/decimal';
import { decimalOrder, decOf, type DecimalModelSpec } from '../lib/decimal-tasks';
import { DecimalGrid } from './DecimalGrid';
import { PlaceValueChart } from './PlaceValueChart';
import { DecimalLine } from './DecimalLine';
import { MoneyModel } from './MoneyModel';
import type { Rect } from './layout';

export function DecimalTask({ task, state, run, model, box, defs, locale, label, editable, act }: { task: Task; state: TaskState; run: TaskRun | null; model: DecimalModelSpec; box: Rect; defs: string; locale: Locale; label: string; editable: boolean; act(a: Action): void }) {
  const ghost = run?.revealed ? solvedState(task) : null;
  if (model.kind === 'decimal-grid') {
    const target = task.kind === 'shade-decimal' ? Math.round(task.target.units / 1000) : null;
    return <DecimalGrid defs={defs} box={box} model={model} locale={locale} label={label} task={task.kind === 'shade-decimal' ? task : null} state={state} editable={editable} act={act} ghost={ghost && target !== null ? target : null} />;
  }
  if (model.kind === 'place-value') {
    const live = task.kind === 'share' || task.kind === 'regroup' || task.kind === 'align-add' || task.kind === 'shift-digits';
    return <PlaceValueChart box={box} model={model} locale={locale} label={label} task={live ? task : null} state={live ? state : null} editable={editable} act={act} ghost={ghost} />;
  }
  if (model.kind === 'money') return <MoneyModel box={box} model={model} locale={locale} label={label} />;
  // An order on the line: the items as marks once done (or shown).
  const shown = task.kind === 'order' && task.line === true && (run?.done || run?.revealed) ? { ...model, marks: decimalOrder(task).map((i) => decOf(task.items[i]!)).filter((d): d is Decimal => !!d) } : model;
  const live = task.kind === 'place' || task.kind === 'round-on-line';
  return <DecimalLine defs={defs} box={box} model={shown} locale={locale} label={label} task={live ? task : null} state={live ? state : null} editable={editable} act={act} ghost={ghost} />;
}
