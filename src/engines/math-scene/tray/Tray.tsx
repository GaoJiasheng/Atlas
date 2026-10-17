/**
 * The check tray (docs/15 §4.4, §10): the answer controls of a step's check
 * or a practice question, in the reading panel under the beat line. Head:
 * where it is (`07 · CHECK`, `13 · 3 / 8`), the task in one sentence.
 * Middle: the controls this task needs (fraction boxes and an on-screen
 * keypad, the < = > symbols, option buttons, order slots, ×k / ÷k chips,
 * Fold, steppers). Then the feedback (`aria-live`), the child's attempts so
 * far, and the actions: Hint (I), Check (C), "Show me" after two tries,
 * "Another one" (a different task from the step's pool), "Skip" and Next.
 * Nothing is forced: Skip moves on, Another one draws again. The answer boxes
 * and keypad are `data-keys="own"`: digits and Enter belong to them (Enter =
 * Check). The presentation puts the same tray, without its head, in its
 * caption card (`compact`: the task's sentence under the caption, no place
 * label, no Next); Skip there lets the auto-play go on.
 */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskRun } from '../ui';
import { canMerge, commonParts, inputSpecOf, phasesOf, type TaskState } from '../lib/state';
import { answered, answersOf, segments, usesValueBoxes } from '../lib/check';
import { solvedState } from '../lib/solve';
import { denominatorEn, numberZh } from '../lib/words';
import { formatFrac } from '../lib/fraction';
import { GridModelControls } from './GridControls';
import { WholeModelControls } from './WholeControls';
import { HopChips, SetClockControls } from './TimeControls';
import { AnswerInput } from './inputs';
import { askOf } from '../lib/diagnose/measure';
import { squared, unitText } from '../lib/value';
import { answerTokens } from '../lib/working';

export interface TrayProps {
  ctl: Controller;
  task: Task | null;
  run: TaskRun | null;
  /** `07 · CHECK` or `13 · 3 / 8` */
  where: string | null;
  practice: boolean;
  /** Pool size of the step's check (Another one when > 1). */
  pool?: number;
  /** The last practice question (Next shows the results). */
  last?: boolean;
  /** Revisit buttons after a wrong practice answer. */
  revisit?: { id: string; number: string }[];
  /** Presentation card: no place label or Next; Skip lets the auto-play go on. */
  compact?: boolean;
  /** The caption already says the task (a practice question's beat): no sentence here. */
  captioned?: boolean;
  /** Parts narrower than a finger: show the −/+ stepper. */
  narrow?: boolean;
  locale: Locale;
}

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export function Tray(p: TrayProps) {
  const { ctl, task, run, locale } = p;
  const T = tr(locale);
  const rootRef = useRef<HTMLDivElement>(null);
  // Enter in an answer box checks; Escape leaves the box (the next Escape reaches the host).
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!(e.target instanceof HTMLInputElement) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      ctl.check();
    } else if (e.key === 'Escape') e.target.blur();
  };
  if (!task || !run) return null;
  const phase = phasesOf(task)[run.state.phase] ?? 'model';
  const locked = run.done;
  const fb = run.feedback;
  const ready = !locked && answered(task, run.state);
  const spec = inputSpecOf(task);
  return (
    <div ref={rootRef} className="ms-tray" data-hud-panel={p.compact ? undefined : 'task'} data-compact={p.compact || undefined} onKeyDown={onKey} role="group" aria-label={T('math.tray.label')}>
      {!p.captioned && (
        <div className="ms-tray__head">
          {p.where && <span className="ms-tray__where">{p.where}</span>}
          <p className="ms-tray__prompt">{renderRich(tx(task.prompt, locale), locale)}</p>
        </div>
      )}
      <Controls {...p} phase={phase} locked={locked} />
      <p className="ms-tray__feedback" aria-live="polite" data-tone={fb?.tone} data-empty={fb ? undefined : ''}>
        {fb && (
          <>
            <i aria-hidden="true">{fb.tone === 'correct' || fb.tone === 'phase' ? '✓' : fb.tone === 'hint' ? 'i' : '○'}</i>
            <span>{renderRich(tx(fb.text, locale), locale)}</span>
          </>
        )}
      </p>
      {run.revealed && spec && (
        <span className="ms-tray__answer">
          {T('math.tray.answer')}{' '}
          {task.model.kind === 'grid' ? gridAnswerText(task, locale) : usesValueBoxes(task, spec) ? renderRich(answerTokens(task), locale, { line: true }) : renderRich(answersOf(spec).map((f) => `{${f.w ? `${f.w} ` : ''}${f.n}/${f.d}}`).join(' = '), locale)}
        </span>
      )}
      {run.revealed && !p.practice && run.feedback?.tone !== 'reveal' && <p className="ms-tray__why">{renderRich(tx(task.feedback.reveal, locale), locale)}</p>}
      {run.attempts.length > 0 && (
        <p className="ms-attempts">
          <b>{T('math.check.attempts')}</b>
          {run.attempts.map((a, i) => (
            <span key={i} data-tone={a.tone}>
              <i aria-hidden="true">{a.tone === 'correct' || a.tone === 'phase' ? '✓' : '○'}</i> {a.label}
            </span>
          ))}
        </p>
      )}
      <div className="ms-tray__actions">
        <button type="button" className="ms-btn ms-btn--ghost" data-command="hint" disabled={!ctl.canHint()} title={`${T('math.cmd.hint')} (I)`} onClick={() => ctl.hint()}>
          {T('math.cmd.hint')}
          {!p.compact && <kbd>I</kbd>}
        </button>
        <button type="button" className="ms-btn" data-command="check" data-ready={ready || undefined} disabled={!ready} title={ready ? `${T('math.cmd.check')} (C)` : T('math.cmd.checkWhy')} onClick={() => ctl.check()}>
          {T('math.cmd.check')}
          {!p.compact && <kbd>C</kbd>}
        </button>
        {!p.practice && !locked && run.tries >= 2 && !run.revealed && (
          <button type="button" className="ms-btn ms-btn--ghost" data-show-me="" onClick={() => ctl.showMe()}>
            {T('math.tray.showMe')}
          </button>
        )}
        {!p.practice && (p.pool ?? 0) > 1 && (
          <button type="button" className="ms-btn ms-btn--ghost" data-another="" onClick={() => ctl.another()}>
            {T('math.check.another')}
          </button>
        )}
        {!locked && (
          <button type="button" className="ms-btn ms-btn--quiet" data-skip="" onClick={() => ctl.skip()}>
            {T('math.check.skip')}
          </button>
        )}
        {!p.compact &&
          p.revisit?.map((r) => (
            <button key={r.id} type="button" className="ms-btn ms-btn--ghost" onClick={() => ctl.goToBeat(r.id, 0)}>
              {T('math.practice.revisit', { n: r.number })}
            </button>
          ))}
        {!p.compact && locked && (
          <button type="button" className="ms-btn ms-tray__next" data-done="" onClick={() => ctl.next()}>
            {T(p.practice ? (p.last ? 'math.practice.results' : 'math.tray.nextQuestion') : 'math.tray.nextStep')} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controls for the phase                                              */
/* ------------------------------------------------------------------ */

function Controls(p: TrayProps & { phase: string; locked: boolean }) {
  const { task, run, ctl, locale, phase, locked } = p;
  const T = tr(locale);
  if (!task || !run) return null;
  const s = run.state;
  const parts: ReactNode[] = [];
  const unitName = (d: number) => (locale === 'zh' ? `${numberZh(d)}分之几` : denominatorEn(d, true));

  const wholeKind = task.kind === 'group' || task.kind === 'arrange' || task.kind === 'skip-count' || task.kind === 'split-array' || task.kind === 'regroup' || task.kind === 'share';
  if (phase === 'model' && task.model.kind === 'grid' && task.kind !== 'choose') {
    parts.push(<GridModelControls key="grid" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
  } else if (phase === 'model' && wholeKind) {
    parts.push(<WholeModelControls key="whole" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
  } else if (phase === 'model' && task.kind === 'set-clock') {
    parts.push(<SetClockControls key="clock" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
  } else if (phase === 'input') {
    if (task.kind === 'duration') parts.push(<HopChips key="hops" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
    parts.push(<AnswerInput key="input" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
    if (task.model.kind === 'barmodel' && task.model.units) {
      parts.push(
        <button key="units" type="button" className="ms-btn ms-btn--ghost" aria-pressed={s.aligned} disabled={locked || s.aligned} onClick={() => ctl.act({ do: 'align' })}>
          {T('math.tray.units', { name: unitName(task.model.units) })}
        </button>,
      );
    }
  } else if (phase === 'convert' && task.kind === 'build-sum') {
    parts.push(<FactorChips key="f" factors={[2, 3, 4].filter((k) => (task.model.kind === 'bar' ? (task.model.parts ?? 1) * k <= 12 : true))} sign="×" value={s.factor} onPick={(k) => ctl.act({ do: 'factor', k })} locked={locked} locale={locale} task={task} />);
  } else if (task.kind === 'fold') {
    parts.push(
      <div key="fold" className="ms-tray__row">
        <button type="button" className="ms-btn" disabled={locked || s.parts >= 16} onClick={() => ctl.act({ do: 'fold' })}>
          {T('math.tray.fold')}
        </button>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={locked || s.folds === 0} onClick={() => ctl.act({ do: 'unfold' })}>
          {T('math.tray.unfold')}
        </button>
        <span className="ms-tray__count">{T('math.tray.parts', { n: s.parts * s.wholes })}</span>
      </div>,
    );
  } else if (task.kind === 'split' || task.kind === 'merge') {
    parts.push(<FactorChips key="f" factors={task.factors} sign={task.kind === 'split' ? '×' : '÷'} value={s.factor} onPick={(k) => ctl.act({ do: 'factor', k })} locked={locked} locale={locale} task={task} />);
  } else if (task.kind === 'cut') {
    parts.push(
      <div key="cut" className="ms-tray__row">
        <button type="button" className="ms-btn ms-btn--ghost" disabled={locked} onClick={() => ctl.act({ do: 'cut', at: biggestMiddle(s.cuts, task.snap) })}>
          {T('math.tray.addCut')}
        </button>
        <span className="ms-tray__count">{T('math.tray.parts', { n: segments(s.cuts, task.snap).length })}</span>
      </div>,
    );
  } else if (task.kind === 'place') {
    const max = s.parts * s.wholes;
    parts.push(
      <div key="place" className="ms-tray__row">
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.left')} disabled={locked || (s.place ?? 0) <= 0} onClick={() => ctl.act({ do: 'place', at: (s.place ?? 1) - 1 })}>
          ◀
        </button>
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.right')} disabled={locked || (s.place ?? 0) >= max} onClick={() => ctl.act({ do: 'place', at: s.place === null ? 1 : s.place + 1 })}>
          ▶
        </button>
        <span className="ms-tray__count">{T('math.tray.jumps', { n: s.place ?? 0 })}</span>
      </div>,
    );
  } else if (task.kind === 'compare') {
    if (task.align) {
      parts.push(
        <button key="align" type="button" className="ms-btn ms-btn--ghost" aria-pressed={s.aligned} disabled={locked || s.aligned} onClick={() => ctl.act({ do: 'align' })}>
          {T('math.tray.align')}
          {s.aligned && <span className="ms-tray__count"> · {unitName(commonParts(task.a, task.b))}</span>}
        </button>,
      );
    }
    if (task.ask === 'symbol') parts.push(<SymbolPicker key="sym" value={s.symbol} onPick={(v) => ctl.act({ do: 'symbol', value: v })} locked={locked} locale={locale} ghost={run.revealed ? solvedState(task).symbol : null} task={task} />);
    else parts.push(<span key="tap" className="ms-tray__note">{T(task.ask === 'greater' ? 'math.tray.tapGreater' : 'math.tray.tapSmaller')}</span>);
  } else if (task.kind === 'order') {
    parts.push(<OrderSlots key="order" task={task} state={s} ctl={ctl} locale={locale} locked={locked} ghost={run.revealed} />);
  } else if (task.kind === 'choose') {
    const text = task.options.map((o, i) => ({ o, letter: 'ABCDEFG'[i]! })).filter(({ o }) => o.text && !o.model && !o.value);
    if (text.length > 0) {
      parts.push(
        <div key="choose" className="ms-choices" role={task.multi ? 'group' : 'radiogroup'} aria-label={T('math.tray.choices')}>
          {text.map(({ o, letter }) => (
            <button
              key={o.id}
              type="button"
              role={task.multi ? 'checkbox' : 'radio'}
              aria-checked={s.chosen.includes(o.id)}
              className="ms-choice"
              data-option={o.id}
              data-ghost={run.revealed && o.correct ? '' : undefined}
              disabled={locked}
              onClick={() => ctl.act({ do: 'choose', id: o.id })}
            >
              <b>{letter}</b> {renderRich(tx(o.text!, locale), locale)}
            </button>
          ))}
        </div>,
      );
    }
  }
  // Shading on parts narrower than a finger (or a touch screen): one more / one fewer, from the left.
  if (!locked && (phase === 'model' || phase === 'mark') && (task.kind === 'shade' || task.kind === 'build-sum') && p.narrow) {
    const cross = task.kind === 'build-sum' && task.op === '-';
    const count = cross ? s.crossed.length : s.shaded.length;
    const give = (delta: 1 | -1) => {
      if (cross) {
        const order = [...s.given].reverse();
        const part = delta > 0 ? order.find((i) => !s.crossed.includes(i)) : order.find((i) => s.crossed.includes(i));
        if (part !== undefined) ctl.act({ do: 'cross', part });
      } else ctl.act({ do: 'fill', count: count + delta });
    };
    parts.push(
      <div key="step" className="ms-tray__row ms-stepper">
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T(cross ? 'math.tray.lessCross' : 'math.tray.less')} disabled={count === 0} onClick={() => give(-1)}>
          −
        </button>
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T(cross ? 'math.tray.moreCross' : 'math.tray.more')} onClick={() => give(1)}>
          +
        </button>
        <span className="ms-tray__count">{T(cross ? 'math.tray.crossed' : 'math.tray.shaded', { n: count })}</span>
      </div>,
    );
  }
  if (parts.length === 0) return null;
  return <div className="ms-tray__controls">{parts}</div>;
}

/** A grid task's answer as written: `28 cm²`, `30 + 12 = 42 m²`. */
function gridAnswerText(task: Task, locale: Locale): string {
  const spec = inputSpecOf(task);
  const m = task.model;
  if (!spec || m.kind !== 'grid') return '';
  const ask = askOf(task, spec)?.ask;
  const unit = spec.unit ?? (ask === 'area' || task.kind === 'split-figure' ? squared(m.unit) : m.unit);
  const nums = answersOf(spec).map((f) => f.n);
  if (nums.length === 3) return `${nums[0]} + ${nums[1]} = ${nums[2]} ${unitText(unit, locale, nums[2])}`;
  return `${nums.join(', ')} ${unitText(unit, locale, nums[0])}`;
}

/** Where "Add a cut" cuts: the middle of the longest piece (on the grid). */
function biggestMiddle(cuts: readonly number[], snap: number): number {
  const at = [0, ...[...cuts].sort((a, b) => a - b), snap];
  let best = 0;
  for (let i = 1; i < at.length; i++) if (at[i]! - at[i - 1]! > at[best + 1]! - at[best]!) best = i - 1;
  return Math.round((at[best]! + at[best + 1]!) / 2);
}

/* ------------------------------------------------------------------ */
/* Symbols, factors, order                                             */
/* ------------------------------------------------------------------ */

function radioKeys(e: KeyboardEvent<HTMLElement>) {
  const items = [...(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'))];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (!dir || items.length === 0) return;
  e.preventDefault();
  const next = items[(i + dir + items.length) % items.length]!;
  next.focus();
  next.click();
}

function SymbolPicker({ value, onPick, locked, locale, ghost, task }: { value: string | null; onPick(v: '<' | '=' | '>'): void; locked: boolean; locale: Locale; ghost: string | null; task: Task }) {
  const T = tr(locale);
  const name = { '<': T('math.symbol.less'), '=': T('math.symbol.equal'), '>': T('math.symbol.greater') } as const;
  return (
    <div className="ms-symbols" role="radiogroup" aria-label={T('math.symbol.label')} onKeyDown={radioKeys}>
      {task.kind === 'compare' && <span className="ms-symbols__side">{renderRich(`{${formatFrac(task.a)}}`, locale)}</span>}
      {(['<', '=', '>'] as const).map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} aria-label={name[v]} tabIndex={value === v || (value === null && v === '<') ? 0 : -1} className="ms-symbol-btn" data-ghost={ghost === v ? '' : undefined} disabled={locked} onClick={() => onPick(v)}>
          {v}
        </button>
      ))}
      {task.kind === 'compare' && <span className="ms-symbols__side">{renderRich(`{${formatFrac(task.b)}}`, locale)}</span>}
    </div>
  );
}

function FactorChips({ factors, sign, value, onPick, locked, locale, task }: { factors: number[]; sign: '×' | '÷'; value: number | null; onPick(k: number): void; locked: boolean; locale: Locale; task: Task }) {
  const T = tr(locale);
  const [why, setWhy] = useState<string | null>(null);
  return (
    <div className="ms-chips-wrap">
      <div className="ms-chips" role="radiogroup" aria-label={T(sign === '×' ? 'math.chips.split' : 'math.chips.merge')} onKeyDown={radioKeys}>
        {factors.map((k) => {
          const check = sign === '÷' ? canMerge(task, k) : { ok: true, reason: null };
          const reason = check.ok ? null : T(check.reason === 'parts' ? 'math.chips.noParts' : 'math.chips.noShaded', { k });
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={value === k}
              aria-disabled={!check.ok || undefined}
              title={reason ?? undefined}
              tabIndex={value === k || (value === null && k === factors[0]) ? 0 : -1}
              className="ms-chip"
              data-blocked={!check.ok || undefined}
              disabled={locked}
              onFocus={() => setWhy(reason)}
              onBlur={() => setWhy(null)}
              onClick={() => (check.ok ? onPick(k) : setWhy(reason))}
            >
              {sign}
              {k}
            </button>
          );
        })}
      </div>
      {why && <span className="ms-tray__note" role="status">{why}</span>}
    </div>
  );
}

function OrderSlots({ task, state, ctl, locale, locked, ghost }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean; ghost: boolean }) {
  const T = tr(locale);
  if (task.kind !== 'order') return null;
  const right = ghost ? solvedState(task).order : null;
  return (
    <div className="ms-order">
      <div className="ms-order__cards" role="group" aria-label={T('math.order.cards')}>
        {task.items.map((f, i) =>
          state.order.includes(i) ? (
            <span key={i} className="ms-card ms-card--gone" aria-hidden="true" />
          ) : (
            <button key={i} type="button" className="ms-card" data-item={i} disabled={locked} onClick={() => ctl.act({ do: 'order', item: i })}>
              {renderRich(`{${formatFrac(f)}}`, locale)}
            </button>
          ),
        )}
      </div>
      <span className="ms-order__dir">{T(task.direction === 'asc' ? 'math.order.asc' : 'math.order.desc')}</span>
      <ol className="ms-order__slots" aria-label={T('math.order.slots')}>
        {task.items.map((_, k) => {
          const i = state.order[k];
          return (
            <li key={k} data-ghost={right ? formatFrac(task.items[right[k]!]!) : undefined}>
              {i !== undefined ? (
                <button type="button" className="ms-card ms-card--placed" data-item={i} disabled={locked} aria-label={T('math.order.back', { name: formatFrac(task.items[i]!) })} onClick={() => ctl.act({ do: 'unorder', item: i })}>
                  {renderRich(`{${formatFrac(task.items[i]!)}}`, locale)}
                </button>
              ) : (
                <span className="ms-slot" aria-label={T('math.order.empty', { n: k + 1 })} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Parts a bar shows narrower than a finger (44 px) once cut or renamed: the −/+ stepper appears. */
export function partsAreNarrow(task: Task | null, width: number): boolean {
  if (!task) return false;
  const m = task.model;
  const parts = m.kind === 'bar' || m.kind === 'circle' ? (m.parts ?? 1) : 1;
  const finest = task.kind === 'build-sum' && task.convert ? parts * task.convert : parts;
  return width / Math.max(1, finest) < 44;
}
