/**
 * Which tasks are about reading instruments and quantities in units (docs/32
 * §3.6, the `measure-reading` domain): an instrument model (the task's own or
 * an option's), a task kind on an instrument, quantities compared, ordered,
 * chosen or written, the compound answer form, or a quantity's conversion.
 * Kept apart so the decimal and value modules can ask without importing the
 * measuring checks. Pure.
 */
import type { DecimalWork, InputSpec, InstrumentModelSpec, MeasureWork, Model, Task } from '../schema';
import { isQty } from './value';

export const isInstrument = (m: Model): m is InstrumentModelSpec => m.kind === 'instrument';

/** Is the work a quantity's conversion (measuring), not a decimal's? */
export const isMeasureWork = (w: DecimalWork | MeasureWork | undefined | null): w is MeasureWork => !!w && typeof w.from === 'object';
/** The decimal work of a written part (`null`: none, or a quantity's conversion). */
export const decimalWorkOf = (spec: InputSpec | null | undefined): DecimalWork | null => (spec?.work && !isMeasureWork(spec.work) ? spec.work : null);
/** The quantity conversion of a written part (`null`: none). */
export const measureWorkOf = (spec: InputSpec | null | undefined): MeasureWork | null => (spec?.work && isMeasureWork(spec.work) ? spec.work : null);

/** The written part of a task, as far as this module needs it. */
function specOf(task: Task): InputSpec | null {
  if (task.kind === 'input') return task;
  if (task.kind === 'read-scale') return task.answer;
  if ('then' in task && task.then) return task.then;
  return null;
}

/** Is the task in the measure-reading domain? */
export function isMeasureTask(task: Task): boolean {
  if (task.kind === 'read-scale' || task.kind === 'set-scale' || task.kind === 'count-intervals') return true;
  if (isInstrument(task.model)) return true;
  if (task.kind === 'choose' && task.options.some((o) => (o.model && isInstrument(o.model)) || (o.value && isQty(o.value)))) return true;
  if (task.kind === 'compare' && (isQty(task.a) || isQty(task.b))) return true;
  if (task.kind === 'order' && task.items.some(isQty)) return true;
  const spec = specOf(task);
  if (!spec) return false;
  if (spec.form === 'compound' || isMeasureWork(spec.work)) return true;
  return (Array.isArray(spec.answer) ? spec.answer : [spec.answer]).some(isQty);
}
