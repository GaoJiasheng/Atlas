/**
 * The MEASURE card (docs/32 §3.7): on a beat, the instrument's reading large
 * (`350 g`, `1 m 32 cm`; with the second scale or brackets `= 132 cm`), how
 * it is read aloud, and what each small part stands for; a balance says
 * whether it is level. On a check it gives only what the task gives — the
 * unit, a number every so many — with `?` for the reading, the part asked
 * for or the quantity to write; a set-scale shows its target and the
 * child's own setting; the answer only once the check is done.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import { plainText, renderRich } from '../../../../lib/rich-text';
import type { Model, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { inputSpecOf } from '../../lib/state';
import { beamTilt, panMass, partsOf, readingOf } from '../../lib/instrument';
import { isInstrument, measureWorkOf } from '../../lib/measure-kind';
import { instrumentOf, readingQty, setTarget, setValue } from '../../lib/measure-tasks';
import { instrumentText, measureAnswerToken, measureLines, scaleFacts } from '../../lib/measure-working';
import { qtyWords } from '../../lib/words';
import { qtyText } from '../../lib/value';
import { CardRows, type CardRow } from './CardRows';

const qtyLine = (text: string, locale: Locale) => plainText(text, locale, undefined, true);

/** The rows of a beat's (or the specimen's) instrument. */
function beatRows(m: Model, locale: Locale): { rows: CardRow[]; note: string | null } {
  if (!isInstrument(m)) return { rows: [], note: null };
  const members = partsOf(m);
  const rows: CardRow[] = [];
  let note: string | null = null;
  members.forEach((s, i) => {
    if (s.type === 'balance') {
      const tilt = beamTilt(s);
      rows.push({ key: 'math.plate.beam', value: t(locale, tilt === 0 ? 'math.measure.level' : tilt < 0 ? 'math.measure.leftHeavier' : 'math.measure.rightHeavier'), big: i === 0 });
      const w = panMass(s.right ?? []);
      if (tilt === 0 && w > 0) rows.push({ key: 'math.measure.reading', value: w >= 1000 && w % 1000 === 0 ? `${w / 1000} kg` : `${w} g` });
      return;
    }
    const r = readingOf(s);
    const q = r ? readingQty(s, r.value) : null;
    if (q) {
      rows.push({ key: 'math.measure.reading', value: `${r?.nearest ? '≈ ' : ''}${qtyText(q, locale)}`, big: i === 0, tone: s.tone === 'hot' ? 'hot' : undefined });
      if (members.length === 1) rows.push({ key: 'math.card.read', value: qtyWords(q, locale) });
      // A two-unit reading in the small unit too (the second scale, the brackets of a conversion).
      if (q.kind === 'cmp' && (s.dual || s.brackets)) rows.push({ key: 'math.measure.sameUnit', value: `= ${q.total} ${q.small}` });
    }
    const f = scaleFacts(s, locale);
    if (f && i === 0 && s.scale !== false) note = t(locale, 'math.measure.each', { v: f.part });
  });
  return { rows, note };
}

/** The rows of a check: what it gives, `?` for what it asks, the child's own setting, the answer once done. */
function checkRows(task: Task, state: TaskState, done: boolean, locale: Locale): CardRow[] {
  const s = instrumentOf(task);
  const f = s ? scaleFacts(s, locale) : null;
  const rows: CardRow[] = [];
  const spec = inputSpecOf(task);
  if (f && s?.type !== 'balance' && s?.scale !== false) rows.push({ key: 'math.plate.every', value: f.every });
  if (task.kind === 'set-scale' && s) {
    const target = setTarget(task);
    if (task.mode === 'weights') {
      rows.push({ key: 'math.measure.onPan', value: state.mweights.length ? state.mweights.map((w) => (w >= 1000 && w % 1000 === 0 ? `${w / 1000} kg` : `${w} g`)).join(' + ') : '—', tone: 'signal' });
      return rows;
    }
    if (target !== null) rows.unshift({ key: 'math.measure.setTo', value: instrumentText(s, target, locale), tone: 'cold', big: true });
    if (state.mset !== null) rows.push({ key: 'math.measure.onScale', value: instrumentText(s, setValue(task, state), locale), tone: 'signal' });
    return rows;
  }
  if (task.kind === 'count-intervals' && s) {
    rows.push({ key: 'math.plate.part', value: done && f ? f.part : '?', big: true });
    rows.push({ key: 'math.plate.counted', value: String(state.mparts.length), tone: 'signal' });
    return rows;
  }
  if (task.kind === 'read-scale' && s && spec) {
    const r = readingOf(s);
    rows.unshift({ key: 'math.measure.reading', value: done && r ? instrumentText(s, r.value, locale) : '?', big: true });
    return rows;
  }
  // Quantities compared, ordered, written: the sentence the child is working on (its answer `?` until done).
  const line = measureLines(task, state, locale, done).at(-1);
  if (line) rows.unshift({ key: 'math.measure.reading', value: qtyLine(line, locale), big: true });
  if (spec && measureWorkOf(spec) && done) rows.push({ key: 'math.card.read', value: qtyLine(measureAnswerToken(task, spec), locale) });
  return rows;
}

export function MeasureCard({ model, task, state, done, locale }: { model: Model | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  let rows: CardRow[] = [];
  let note: ReactNode = null;
  if (task && state) rows = checkRows(task, state, done, locale);
  else if (model) {
    const b = beatRows(model, locale);
    rows = b.rows;
    note = b.note ? <p className="ms-card-body__note">{renderRich(b.note, locale)}</p> : null;
  }
  if (rows.length === 0)
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.measure.none')}</p>
      </div>
    );
  return <CardRows rows={rows} after={note} />;
}
