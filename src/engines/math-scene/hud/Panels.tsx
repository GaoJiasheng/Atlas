/**
 * MathScene's HUD content (docs/15 §4.5): the top-right card (the fraction,
 * big and stacked, with what its numbers count, and in words), panel 01
 * HISTORY (the child's moves as small models; tap one to look at it on the
 * stage), panel 02 WORKING (the number sentences), panel 03 STATE (the
 * read-outs) and the reader's inspector (how to think about it, the hints
 * shown, the latest feedback, "Show me", the syllabus line).
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Lesson, Step, Task } from '../schema';
import type { MathUiStore, TaskRun } from '../ui';
import { cardValue, equivalentNames, showsCounts, workingLines } from '../lib/working';
import { formatFrac, isSimplest, simplify, toImproper, toMixed, type Frac } from '../lib/fraction';
import { fractionWords } from '../lib/words';
import type { TaskState } from '../lib/state';

const UP = (s: string) => s.toLocaleUpperCase('en');

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function FractionCard({ task, state, done, specimen, expanded, locale }: { task: Task | null; state: TaskState | null; done: boolean; specimen: boolean; expanded: boolean; locale: Locale }) {
  const value: Frac | null = task && state ? cardValue(task, state, done) : specimen ? { n: 3, d: 4 } : null;
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
        <p className="ms-card-body__empty">{t(locale, 'math.card.empty')}</p>
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

/* ------------------------------------------------------------------ */
/* 01 HISTORY                                                          */
/* ------------------------------------------------------------------ */

function Thumb({ s }: { s: TaskState }) {
  const total = Math.max(1, s.parts * s.wholes);
  const w = 64;
  return (
    <svg viewBox={`0 0 ${w} 14`} className="ms-thumb" aria-hidden="true">
      {s.parts > 0 &&
        Array.from({ length: Math.min(total, 24) }, (_, i) => (
          <rect key={i} x={(i * w) / total} y={1} width={w / total} height={12} data-mark={s.crossed.includes(i) ? 'taken' : s.given.includes(i) ? 'cold' : s.shaded.includes(i) ? 'mine' : undefined} />
        ))}
      {s.parts === 0 && <rect x={0} y={1} width={w} height={12} />}
      {s.cuts.map((c) => (
        <line key={c} x1={(c / 12) * w} x2={(c / 12) * w} y1={0} y2={14} />
      ))}
    </svg>
  );
}

export function HistoryPanel({ run, ui, locale }: { run: TaskRun | null; ui: MathUiStore; locale: Locale }) {
  const log = run?.log ?? [];
  const shown = log.slice(-6);
  const offset = log.length - shown.length;
  if (shown.length === 0) return <p className="ms-panel__empty">{t(locale, 'math.history.empty')}</p>;
  return (
    <ol className="ms-history">
      {shown.map((e, i) => (
        <li key={offset + i}>
          <button type="button" className="ms-history__item" title={t(locale, 'math.history.look')} onClick={() => ui.setState((u) => ({ preview: u.preview === offset + i ? null : offset + i }))} aria-pressed={ui.getState().preview === offset + i}>
            <Thumb s={e.state} />
            <span>{e.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* 02 WORKING                                                          */
/* ------------------------------------------------------------------ */

export function WorkingPanel({ task, state, done, locale }: { task: Task | null; state: TaskState | null; done: boolean; locale: Locale }) {
  const lines = task && state ? workingLines(task, state, locale, done) : ['{3/4} = {6/8} = {9/12}'];
  if (lines.length === 0) return <p className="ms-panel__empty">{t(locale, 'math.working.empty')}</p>;
  return (
    <ol className="ms-working" data-done={done || undefined}>
      {lines.map((l, i) => (
        <li key={i}>{renderRich(l, locale)}</li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* 03 STATE                                                            */
/* ------------------------------------------------------------------ */

export function StatePanel({ task, state, done, practice, lesson, answered }: { task: Task | null; state: TaskState | null; done: boolean; practice: { index: number; total: number } | null; lesson: Lesson; answered: number }) {
  const row = (key: Parameters<typeof t>[1], value: string, on?: boolean) => (
    <div className="ms-state__row" data-on={on || undefined}>
      <dt>
        {UP(t('en', key))}
        <small lang="zh-Hans">{t('zh', key)}</small>
      </dt>
      <dd>{value}</dd>
    </div>
  );
  if (practice) {
    return (
      <dl className="ms-state">
        {row('math.state.question', `${practice.index}/${practice.total}`, true)}
        {row('math.state.answered', `${answered}/${lesson.practice.length}`)}
        {row('math.state.assists', UP(t('en', 'math.state.off')))}
      </dl>
    );
  }
  const value = task && state ? cardValue(task, state, done) : { n: 3, d: 4 };
  const counts = !task || !state || done || showsCounts(task, state);
  const parts = state ? state.parts * state.wholes : 4;
  const pos = value && value.d > 0 ? Math.min(1, toImproper(value).n / toImproper(value).d / Math.max(1, state?.wholes ?? 1)) : 0;
  return (
    <dl className="ms-state">
      {row('math.state.parts', counts && parts > 0 ? String(parts) : '—')}
      {row('math.state.marked', !counts ? '—' : state ? String(state.shaded.length + state.given.length - state.crossed.length) : '3')}
      {row('math.state.value', value && value.d > 0 ? formatFrac(value) : '—', true)}
      {row('math.state.simplest', value && value.d > 0 ? `${formatFrac(simplify(value))}${isSimplest(value) ? ' ✓' : ''}` : '—')}
      <div className="ms-state__bar" aria-hidden="true">
        <span style={{ width: `${pos * 100}%` }} />
        <i>0</i>
        <i>1</i>
      </div>
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Reader inspector                                                    */
/* ------------------------------------------------------------------ */

export function TaskInspector({ task, run, step, lesson, where, practice, locale }: { task: Task | null; run: TaskRun | null; step: Step | null; lesson: Lesson; where: string; practice: boolean; locale: Locale }) {
  const lines = step ? lesson.syllabus.filter((l) => step.lo.includes(l.id)) : [];
  return (
    <section className="ms-inspector" aria-label={t(locale, 'math.inspector.label')}>
      {lines.length > 0 && (
        <p className="ms-inspector__lo">
          {step?.bridge && (
            <span>
              <b className="atlas-chip">{t(locale, 'math.bridge')}</b>
            </span>
          )}
          {lines.map((l) => (
            <span key={l.id}>
              <b>{t(locale, 'math.syllabus', { ref: l.ref })}</b> {tx(l.text, locale)}{' '}
              <button type="button" className="atlas-src" data-source={l.source}>
                {l.source}
              </button>
            </span>
          ))}
        </p>
      )}
      {task && run && (
        <>
          <h3 className="ms-inspector__head">
            {where} · {renderRich(tx(task.prompt, locale), locale)}
          </h3>
          {(!practice || run.done) && <p className="ms-inspector__guide">{renderRich(tx(task.guide, locale), locale)}</p>}
          {run.hints > 0 && (
            <ol className="ms-inspector__hints" aria-label={t(locale, 'math.inspector.hints')}>
              {task.hints.slice(0, run.hints).map((h, i) => (
                <li key={i}>{renderRich(tx(h, locale), locale)}</li>
              ))}
            </ol>
          )}
          {run.feedback && run.feedback.tone !== 'hint' && (
            <p className="ms-inspector__feedback" data-tone={run.feedback.tone}>
              {renderRich(tx(run.feedback.text, locale), locale)}
            </p>
          )}
          {run.revealed && run.feedback?.tone !== 'reveal' && <p className="ms-inspector__reveal">{renderRich(tx(task.feedback.reveal, locale), locale)}</p>}
        </>
      )}
    </section>
  );
}
