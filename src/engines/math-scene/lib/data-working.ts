/**
 * The sentence under a chart on a check (docs/77 §3.3, docs/78 §3.3): never
 * the answer first. A number to read or work out shows its worked sentence
 * once the check is done; a table being filled, how many cells are written;
 * towers being evened out, how many blocks have moved (and "level" once they
 * are), the average sentence when done. Pure.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { TaskState } from './state';
import { inputSpecOf } from './state';
import { blocksMoved, fillBlanks, level, dataSentence } from './data-tasks';
import { dataContextOf } from './diagnose/data';

export function dataLines(task: Task, state: TaskState, locale: Locale, done: boolean): string[] {
  if (task.kind === 'fill-table') {
    const blanks = fillBlanks(task);
    return [t(locale, 'math.chart.filled', { n: blanks.filter((b) => !!state.input[b.key]).length, m: blanks.length })];
  }
  const spec = inputSpecOf(task);
  const ctx = spec ? dataContextOf(task, spec) : null;
  const money = spec?.unit === 'dollar';
  const sentence = done && ctx ? dataSentence(ctx, money) : null;
  if (task.kind === 'even-out') {
    const moved = t(locale, level(state.towers) ? 'math.chart.levelMoved' : 'math.chart.moved', { n: blocksMoved(task, state.towers) });
    return sentence ? [moved, sentence] : [moved];
  }
  return sentence ? [sentence] : [];
}
