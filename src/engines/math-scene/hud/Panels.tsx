/**
 * MathScene's top-right card (docs/15 §4.5): the fraction on show, big and
 * stacked, with what its numbers count, and in words; a comparison as
 * `a ○ b`, a sum as its number sentence; expanded, its equivalent names and
 * simplest form. On a check it never says the answer first (`cardValue`).
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Task } from '../schema';
import { cardValue, equivalentNames, workingLines } from '../lib/working';
import { compare, formatFrac, simplify, toImproper, toMixed, type Frac } from '../lib/fraction';
import { fractionWords } from '../lib/words';
import type { TaskState } from '../lib/state';

const UP = (s: string) => s.toLocaleUpperCase('en');

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function FractionCard({ task, state, done, fixed, pair, expanded, locale }: { task: Task | null; state: TaskState | null; done: boolean; fixed: Frac | null; pair?: { a: Frac; b: Frac; open: boolean } | null; expanded: boolean; locale: Locale }) {
  // No task: an explanation beat (its fraction, the pair it compares, or none yet).
  const value: Frac | null = task && state ? cardValue(task, state, done) : fixed;
  if (!task && pair) {
    const c = compare(pair.a, pair.b);
    return (
      <div className="ms-card-body ms-card-body--compare">
        <BigFrac f={pair.a} tone="cold" />
        <span className="ms-card-body__sign">{pair.open ? '○' : c < 0 ? '<' : c > 0 ? '>' : '='}</span>
        <BigFrac f={pair.b} tone="hot" />
        <p className="ms-card-body__words">
          {fractionWords(pair.a, locale)} · {fractionWords(pair.b, locale)}
        </p>
      </div>
    );
  }
  if (task?.kind === 'compare' && state) {
    const s = task.ask === 'symbol' ? state.symbol : null;
    return (
      <div className="ms-card-body ms-card-body--compare">
        <BigFrac f={task.a} tone="cold" />
        <span className="ms-card-body__sign">{s ?? '○'}</span>
        <BigFrac f={task.b} tone="hot" />
        <p className="ms-card-body__words">
          {fractionWords(task.a, locale)} · {fractionWords(task.b, locale)}
        </p>
      </div>
    );
  }
  if (task && state && (task.kind === 'build-sum' || (task.kind === 'input' && task.sum))) {
    const line = workingLines(task, state, locale, done)[0];
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__expr">{line ? renderRich(line, locale) : null}</p>
        {value && <p className="ms-card-body__words">{fractionWords(value, locale)}</p>}
      </div>
    );
  }
  if (!value || value.d === 0) {
    return (
      <div className="ms-card-body">
        <p className="ms-card-body__empty">{t(locale, task ? 'math.card.empty' : 'math.card.none')}</p>
      </div>
    );
  }
  // A mixed number is what the child writes in the bridge step: the card shows it once the task is done.
  const shown = done && toImproper(value).n > value.d ? toMixed(value) : value;
  return (
    <div className="ms-card-body">
      <div className="ms-card-body__frac">
        <span className="ms-card-body__lead ms-card-body__lead--n">
          <b>{UP(t('en', 'math.card.numerator'))}</b> {t('zh', 'math.card.numerator')}
          <small>{t(locale, 'math.card.numeratorHint')}</small>
        </span>
        <BigFrac f={shown} />
        <span className="ms-card-body__lead ms-card-body__lead--d">
          <b>{UP(t('en', 'math.card.denominator'))}</b> {t('zh', 'math.card.denominator')}
          <small>{t(locale, 'math.card.denominatorHint')}</small>
        </span>
      </div>
      <p className="ms-card-body__words">{fractionWords(shown, locale)}</p>
      {expanded && (
        <dl className="ms-card-body__more">
          <dt>{t(locale, 'math.card.names')}</dt>
          <dd>{renderRich(equivalentNames(value).map((f) => `{${formatFrac(f)}}`).join(' = '), locale)}</dd>
          <dt>{t(locale, 'math.card.simplest')}</dt>
          <dd>{renderRich(`{${formatFrac(simplify(value))}}`, locale)}</dd>
        </dl>
      )}
    </div>
  );
}

function BigFrac({ f, tone }: { f: Frac; tone?: 'cold' | 'hot' }) {
  return (
    <span className="ms-big" data-tone={tone}>
      {f.w ? <span className="ms-big__w">{f.w}</span> : null}
      <span className="ms-big__f">
        <span>{f.n}</span>
        <span>{f.d}</span>
      </span>
    </span>
  );
}
