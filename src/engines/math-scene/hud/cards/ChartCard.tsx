/**
 * The CHART card (docs/77 §3.3) and the AVERAGE card (docs/78 §3.3).
 * CHART: TYPE · SCALE · READ (a beat: what it reads off the chart; a check:
 * the bars the child drew reading lines from, never their values) · TOTAL
 * (a pie's whole). AVERAGE: TOTAL · ITEMS · AVERAGE (· MOVED on an even-out
 * check): a beat's numbers as far as they are known, a check's givens and
 * the child's work, the answer only once it is done.
 */
import type { Locale } from '../../../core/types';
import { t, tx } from '../../../../i18n';
import type { Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { CardRows, type CardRow } from './CardRows';
import { averageFacts, beatReading, chartOf, scaleText, typeText } from '../data-facts';

function Empty({ locale }: { locale: Locale }) {
  return (
    <div className="ms-card-body">
      <p className="ms-card-body__empty">{t(locale, 'math.chart.none')}</p>
    </div>
  );
}

export function ChartCard({ model, task, state, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  const c = chartOf(model);
  if (!c) return <Empty locale={locale} />;
  const rows: CardRow[] = [{ key: 'math.plate.chartType', value: typeText(c, locale), big: true }];
  const scale = scaleText(c, locale);
  if (scale) rows.push({ key: 'math.plate.scale', value: scale });
  if (task && state) {
    const names = state.guides.map((id) => c.cats?.find((x) => x.id === id)).filter((x) => !!x).map((x) => tx(x!.label, locale));
    if (names.length) rows.push({ key: 'math.plate.read', value: names.join(' · '), tone: 'signal' });
  } else {
    const read = beatReading(c, locale);
    if (read) rows.push({ key: 'math.plate.read', value: read, tone: 'signal' });
  }
  if (c.type === 'pie' && c.total) rows.push({ key: 'math.plate.total', value: String(c.total) });
  return <CardRows rows={rows} />;
}

export function AverageCard({ model, task, state, done, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  const f = averageFacts(model, task, state, done);
  if (!f) return <Empty locale={locale} />;
  const rows: CardRow[] = [
    { key: 'math.plate.average', value: f.average, big: true, tone: 'signal' },
    { key: 'math.plate.total', value: f.total },
    { key: 'math.plate.items', value: f.items },
  ];
  if (f.moved !== null) rows.push({ key: 'math.plate.moved', value: f.moved });
  return <CardRows rows={rows} />;
}
