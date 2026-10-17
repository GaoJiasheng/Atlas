/**
 * The PLACE VALUE card (docs/19 §3.0 G3): three cells — hundreds, tens, ones
 * — with how many blocks each place holds (12 tens is written 12: it is still
 * to be traded), their names, and the number they make, in words. A × beat
 * names the rows (`26 × 3`), a ÷ beat the share and what each plate has. On a
 * check the number is not given first: the cells are the child's blocks, the
 * number waits until the check is done.
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import { renderRich } from '../../../../lib/rich-text';
import type { BlocksModelSpec, PlaceKey, Task } from '../../schema';
import type { TaskState } from '../../lib/state';
import { counts, matOf, standard, total, type Counts } from '../../lib/blocks';
import { placeValueWords, wholeWords } from '../../lib/words';
import { workingLines } from '../../lib/working';

const UP = (s: string) => s.toLocaleUpperCase('en');
const PLACES: PlaceKey[] = ['H', 'T', 'O'];

function Cells({ c, lit }: { c: Counts; lit?: PlaceKey | null }) {
  return (
    <div className="ms-pv" role="presentation">
      {PLACES.map((p) => (
        <div key={p} className="ms-pv__cell" data-lit={lit === p || undefined}>
          <span className="ms-pv__digit">{c[p]}</span>
          <span className="ms-pv__name">
            <b>{UP(t('en', `math.blocks.${p}`))}</b> {t('zh', `math.blocks.${p}`)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** What the beat's blocks make (`null`: plates, the number is in the share). */
function beatNumber(m: BlocksModelSpec): number | null {
  if (m.plates) return null;
  if (m.copies && !m.combined && !m.left) return (m.value ?? 0) * m.copies;
  return total(matOf(m));
}

export function PlaceValueCard({ model, task, state, done, locale }: { model: BlocksModelSpec | null; task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  if (!model) {
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.blocksNone')}</p>
      </div>
    );
  }
  const live = task && state && (task.kind === 'regroup' || task.kind === 'share');
  const c: Counts = live ? state.mat : model.copies && !model.combined && !model.left ? standard(model.value ?? 0) : matOf(model);
  const lines: { key: Parameters<typeof t>[1]; value: string }[] = [];
  if (task && state) {
    if (task.kind === 'share') lines.push({ key: 'math.card.fact', value: `${task.value} ÷ ${task.k}` });
    const line = workingLines(task, state, locale, done).at(-1);
    if (line && !(task.kind === 'share' && !done)) lines.push({ key: 'math.card.fact', value: line });
    if (task.kind === 'share' && !done) {
      const d = state.dealt;
      lines.push({ key: 'math.card.eachPlate', value: d.H + d.T + d.O > 0 ? placeValueWords(d.H ? [d.O, d.T, d.H] : [d.O, d.T], locale) : '—' });
    }
    if (done && task.kind === 'regroup') lines.push({ key: 'math.card.number', value: `${total(state.mat)} · ${wholeWords(total(state.mat), locale)}` });
  } else {
    if (model.copies) lines.push({ key: 'math.card.fact', value: `${model.value ?? 0} × ${model.copies}${model.combined || model.left ? '' : ` = ${(model.value ?? 0) * model.copies}`}` });
    if (model.plates) {
      lines.push({ key: 'math.card.fact', value: `${model.value ?? total(c)} ÷ ${model.plates}` });
      const d = counts(model.dealt);
      if (d.H + d.T + d.O > 0) lines.push({ key: 'math.card.eachPlate', value: placeValueWords(d.H ? [d.O, d.T, d.H] : [d.O, d.T], locale) });
    }
    const n = beatNumber(model);
    if (n !== null) lines.push({ key: 'math.card.number', value: `${n} · ${wholeWords(n, locale)}` });
  }
  return (
    <div className="ms-card-body ms-card-body--grid">
      <Cells c={c} lit={model.focus ?? null} />
      <dl className="ms-areacard">
        {lines.map((r, i) => (
          <div key={i} className="ms-areacard__row">
            <dt>
              <b>{UP(t('en', r.key))}</b> {t('zh', r.key)}
            </dt>
            <dd>{renderRich(r.value, locale, { line: true })}</dd>
          </div>
        ))}
      </dl>
      <p className="ms-card-body__words">{placeValueWords([c.O, c.T, c.H], locale)}</p>
    </div>
  );
}
