/**
 * Fair tests on the try-it card (docs/22 §4.3 S6, S7; pure, unit-tested):
 * the in-memory data table ("record a row": one row per value of the varied
 * control, the same value overwrites, at most 12) and the outcome a
 * predict-then-observe comparison reports (never marked right or wrong).
 */
import type { SimValue } from '../../sim-schema';
import type { SimOutputValue } from './index';

export const MAX_TABLE_ROWS = 12;

export interface TableRow {
  /** The varied control's value (the row key). */
  vary: SimValue;
  /** Observed outputs at that value. */
  values: Readonly<Record<string, SimOutputValue>>;
  /** Inputs copied when the reading was recorded; absent on legacy records. */
  controls?: Readonly<Record<string, SimValue>>;
}

/** Add a row: the same varied value replaces its row in place; past 12 rows the oldest goes. */
export function recordRow(rows: readonly TableRow[], row: TableRow): TableRow[] {
  const i = rows.findIndex((r) => r.vary === row.vary);
  if (i >= 0) return rows.map((r, j) => (j === i ? row : r));
  return [...rows, row].slice(-MAX_TABLE_ROWS);
}

export type Outcome = 'more' | 'less' | 'same' | 'zero' | 'positive' | 'negative';

/** Within this share of the larger value, two readings are "about the same". */
export const SAME_BAND = 0.05;
const EPS = 1e-6;

/**
 * What changed in an output between before and after: it stopped (`zero`),
 * turned to the other sign (`negative` / `positive`), stayed within 5 %
 * (`same`), or went up / down (`more` / `less`).
 */
export function outcomeOf(before: number, after: number): Outcome {
  if (Math.abs(after) < EPS && Math.abs(before) >= EPS) return 'zero';
  if (Math.sign(after) !== Math.sign(before) && Math.abs(after) >= EPS && Math.abs(before) >= EPS) return after < 0 ? 'negative' : 'positive';
  const scale = Math.max(Math.abs(before), Math.abs(after));
  if (scale < EPS || Math.abs(after - before) <= SAME_BAND * scale) return 'same';
  return after > before ? 'more' : 'less';
}

/** Conditions identify one fair-test record; only the varied value may differ between rows. */
export function tableContextKey(
  chapter: string,
  values: Readonly<Record<string, SimValue>>,
  vary: string,
): string {
  return JSON.stringify([
    chapter,
    Object.keys(values)
      .filter((id) => id !== vary)
      .sort()
      .map((id) => [id, values[id]]),
  ]);
}

/** A prediction belongs to the exact before/after conditions, including time. */
export function predictionContextKey(
  chapter: string,
  values: Readonly<Record<string, SimValue>>,
): string {
  return tableContextKey(chapter, values, "");
}

export interface PredictionSnapshot {
  chapter: string;
  guess: string;
  before: Record<string, SimValue>;
  after: Record<string, SimValue>;
  /** Values on show before the prediction applied its authored starting point. */
  restore?: Record<string, SimValue>;
  value: number | string | null;
}

export function predictionIsCurrent(
  answer: PredictionSnapshot | null,
  chapter: string,
  values: Readonly<Record<string, SimValue>>,
): boolean {
  return (
    answer !== null &&
    answer.chapter === chapter &&
    predictionContextKey(chapter, answer.after) ===
      predictionContextKey(chapter, values)
  );
}

export function predictionHidden(
  hasPrediction: boolean,
  revealed: boolean,
  answer: PredictionSnapshot | null,
  chapter: string,
  values: Readonly<Record<string, SimValue>>,
): boolean {
  return (
    hasPrediction && !revealed && !predictionIsCurrent(answer, chapter, values)
  );
}
