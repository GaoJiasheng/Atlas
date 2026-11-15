/**
 * The ANGLE card (docs/76 §3.3): on a beat, the angle the beat lights (its
 * size, or `?` for the unknown) and whether it is smaller than, equal to or
 * greater than a right angle; a step without degrees (01–04) gives the kind
 * only. On a check only what the task gives: the size to draw, the size
 * measured once it is done, the dots picked; never the answer first.
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { angleItems, kindOf } from '../../lib/angle';
import { angleSpecOf, drawnSegment, isAngleModel } from '../../lib/angle-tasks';
import { cardAngle, kindText, stepsText } from '../../lib/angle-description';
import { CardRows, type CardRow } from './CardRows';

export function AngleCard({ model, task, state, done, degrees, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; degrees: boolean; locale: Locale }) {
  const rows: CardRow[] = [];
  if (task && state) {
    if (task.kind === 'measure-angle') {
      rows.push({ key: 'math.plate.measured', value: done ? `${task.answer}°` : '?', big: true });
      if (done) rows.push({ key: 'math.plate.kind', value: kindText(kindOf(task.answer), locale) });
    } else if (task.kind === 'draw-angle') {
      rows.push({ key: 'math.plate.target', value: `${task.target}°`, big: true, tone: 'signal' });
      rows.push({ key: 'math.plate.kind', value: kindText(kindOf(task.target), locale) });
    } else if (task.kind === 'draw-segment') {
      const seg = drawnSegment(task, state);
      rows.push({ key: 'math.plate.line', value: seg ? stepsText(seg[1][0] - seg[0][0], seg[1][1] - seg[0][1], locale) : '—', big: true, tone: 'signal' });
    } else {
      const spec = angleSpecOf(task);
      const lit = spec ? cardAngle(spec) : null;
      rows.push({ key: 'math.plate.turn', value: done && lit?.size ? (degrees ? `${lit.size}°` : kindText(kindOf(lit.size), locale)) : '?', big: true });
    }
  } else if (model && isAngleModel(model)) {
    const spec = angleItems(model)[0];
    const lit = spec && !model.pair && !model.set ? cardAngle(spec) : null;
    if (lit && lit.size !== null) {
      rows.push({ key: 'math.plate.turn', value: lit.unknown ? '?' : degrees ? `${lit.size}°` : kindText(kindOf(lit.size), locale), big: true, tone: 'signal' });
      if (degrees && !lit.unknown) rows.push({ key: 'math.plate.kind', value: kindText(kindOf(lit.size), locale) });
    }
  }
  if (rows.length === 0)
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, 'math.angle.none')}</p>
      </div>
    );
  return <CardRows rows={rows} />;
}
