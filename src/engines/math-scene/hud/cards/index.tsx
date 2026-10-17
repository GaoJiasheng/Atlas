/**
 * The top-right card by the model on show (docs/19 §3.0 G3): FRACTION for
 * the fraction models, AREA · PERIMETER for the grid, PRODUCT for the array
 * and the whole-number line, PLACE VALUE for the blocks, TIME for the clock
 * and the timeline (and for any check written as a time or a duration),
 * DECIMAL for the hundred grid, the decimal chart and line, money and any
 * check on decimals (docs/29 X4). The
 * registry is by model kind, so a new model names its card here. Every card
 * keeps the rule: on a check it never says the answer first.
 */
import type { Locale } from '../../../core/types';
import type { UiKey } from '../../../../i18n';
import type { Beat, GridModelSpec, Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { inputSpecOf } from '../../lib/state';
import { isTimeForm } from '../../lib/forms';
import type { Frac } from '../../lib/fraction';
import { FractionCard } from './FractionCard';
import { AreaCard } from './AreaCard';
import { ProductCard } from './ProductCard';
import { PlaceValueCard } from './PlaceValueCard';
import { TimeCard, type TimeShown } from './TimeCard';
import { DecimalCard } from './DecimalCard';
import { isDecimalTask } from '../../lib/decimal-tasks';

export type CardKind = 'fraction' | 'area' | 'product' | 'placeValue' | 'time' | 'decimal';

/** Card by model kind (the time lesson's `clock` and `timeline` show the TIME card). */
export const CARD_BY_MODEL: Record<string, CardKind> = {
  bar: 'fraction',
  circle: 'fraction',
  numberline: 'fraction',
  wall: 'fraction',
  barmodel: 'fraction',
  grid: 'area',
  array: 'product',
  blocks: 'placeValue',
  clock: 'time',
  timeline: 'time',
  'decimal-grid': 'decimal',
  'place-value': 'decimal',
  money: 'decimal',
};

export const CARD_TITLE: Record<CardKind, UiKey> = {
  fraction: 'math.card.title',
  area: 'math.card.area',
  product: 'math.card.product',
  placeValue: 'math.card.placeValue',
  time: 'math.card.timeTitle',
  decimal: 'math.card.decimal',
};

/** The card for a model (and the check on show: a time or a duration written is the TIME card's). */
export function cardKindOf(model: Model | null, task: Task | null, fallback: CardKind): CardKind {
  const spec = task ? inputSpecOf(task) : null;
  if (spec && (isTimeForm(spec.form) || spec.span || spec.convert)) return 'time';
  if (task && isDecimalTask(task)) return 'decimal';
  if (!model) return fallback;
  if (model.kind === 'numberline' && model.scale === 'whole') return 'product';
  if (model.kind === 'numberline' && model.scale === 'decimal') return 'decimal';
  return CARD_BY_MODEL[model.kind] ?? fallback;
}

export interface CardProps {
  kind: CardKind;
  /** The model on show (a beat's, a check's, the specimen's). */
  model: Model | null;
  beat: Beat | null;
  task: Task | null;
  state: TaskState | null;
  done: boolean;
  /** FRACTION: the beat's fraction, the pair it compares, the expanded names. */
  fixed: Frac | null;
  pair: { a: Frac; b: Frac; open: boolean } | null;
  /** TIME: what a beat's (or the specimen's) clock or timeline shows. */
  time?: TimeShown | null;
  expanded: boolean;
  locale: Locale;
}

export function Card(p: CardProps) {
  switch (p.kind) {
    case 'area':
      return <AreaCard model={p.model?.kind === 'grid' ? (p.model as GridModelSpec) : null} task={p.task} state={p.state} done={p.done} locale={p.locale} />;
    case 'product':
      return <ProductCard model={p.model} task={p.task} state={p.state} done={p.done} locale={p.locale} />;
    case 'placeValue':
      return <PlaceValueCard model={p.model?.kind === 'blocks' ? p.model : null} task={p.task} state={p.state} done={p.done} locale={p.locale} />;
    case 'time':
      return <TimeCard task={p.task} state={p.state} done={p.done} time={p.time} locale={p.locale} />;
    case 'decimal':
      return <DecimalCard model={p.model} beat={p.beat} task={p.task} state={p.state} done={p.done} expanded={p.expanded} locale={p.locale} />;
    default:
      return <FractionCard task={p.task} state={p.state} done={p.done} fixed={p.fixed} pair={p.pair} expanded={p.expanded} locale={p.locale} />;
  }
}
