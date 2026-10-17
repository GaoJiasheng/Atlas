/**
 * The views two decimals compared can be drawn in (docs/29 X10, the VIEW
 * group): the two hundred grids side by side (at most two places, three
 * wholes), the two numbers on the place-value chart lined up on the point
 * (zeros filled in), or both as marks on one number line (tenths or
 * hundredths, at most 20 steps). The engine offers only the views a task can
 * be drawn in. Pure.
 */
import type { DecimalGridModelSpec, DecimalLineSpec, ModelView, PlaceValueSpec, Task } from '../schema';
import { cmp, minPlaces, type Decimal } from './decimal';
import { decOf, isDecimalModel, type DecimalModelSpec } from './decimal-tasks';

const ONE = 1_000_000;

function gridPair(a: Decimal, b: Decimal): DecimalGridModelSpec | null {
  const dp = Math.max(minPlaces(a), minPlaces(b));
  if (dp > 2 || cmp(a, { units: 3 * ONE, dp: 0 }) > 0 || cmp(b, { units: 3 * ONE, dp: 0 }) > 0) return null;
  const level = dp <= 1 ? 10 : 100;
  return { kind: 'decimal-grid', level, pair: [{ level, given: a, tone: 'cold' }, { level, given: b, tone: 'hot' }] };
}

const chartPair = (a: Decimal, b: Decimal): PlaceValueSpec => ({ kind: 'place-value', show: 'digits', rows: [a, b], align: 'point', pad: true });

/** A line in tenths over the wholes the two lie in, or in hundredths over their tenths (at most 20 steps). */
function linePair(a: Decimal, b: Decimal): DecimalLineSpec | null {
  const dp = Math.max(minPlaces(a), minPlaces(b));
  if (dp > 2) return null;
  const unit = dp <= 1 ? ONE : ONE / 10;
  const step: Decimal = dp <= 1 ? { units: ONE / 10, dp: 1 } : { units: ONE / 100, dp: 2 };
  const lo = Math.floor(Math.min(a.units, b.units) / unit);
  const hi = Math.max(lo + 1, Math.ceil(Math.max(a.units, b.units) / unit));
  if (hi - lo > 2) return null;
  return { kind: 'numberline', scale: 'decimal', from: { units: lo * unit, dp: dp <= 1 ? 0 : 1 }, to: { units: hi * unit, dp: dp <= 1 ? 0 : 1 }, step, labels: 'all', marks: [a, b] };
}

/** The model a decimal check is drawn with in a view (`null`: the view cannot draw it). Lined up on the point (a compare's button): the chart. */
export function decimalViewModel(task: Task, view: ModelView, aligned: boolean): DecimalModelSpec | null {
  if (task.kind === 'compare') {
    const a = decOf(task.a);
    const b = decOf(task.b);
    if (!a || !b) return null;
    if (aligned && task.align === 'point') return chartPair(a, b);
    if (view === task.model.kind && isDecimalModel(task.model)) return task.model;
    if (view === 'decimal-grid') return gridPair(a, b);
    if (view === 'place-value') return chartPair(a, b);
    if (view === 'numberline') return linePair(a, b);
    return null;
  }
  return isDecimalModel(task.model) ? task.model : null;
}
