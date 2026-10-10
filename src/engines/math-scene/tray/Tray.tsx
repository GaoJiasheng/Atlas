/**
 * The answer tray (docs/15 §4.4): a hairline paper card at the bottom of the
 * stage. First line: step · sub-step, the task in one sentence, "Watch an
 * example". Middle: the controls this sub-step needs (fraction boxes and an
 * on-screen keypad, the < = > symbols, option buttons, order slots, ×k / ÷k
 * chips, Fold, steppers). Last line: the feedback (`aria-live`), "Show me"
 * after two tries, "Next". The answer boxes and keypad are `data-keys="own"`:
 * digits and Enter belong to them (Enter = Check); elsewhere in the tray the
 * command keys (C, I, U, W) work as on the stage. The presentation puts the same controls, with Hint /
 * Check / Show me, in its caption card (`compact`).
 */
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Lesson, Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskRun } from '../ui';
import { canMerge, commonParts, inputSpecOf, modelValue, phasesOf, type TaskState } from '../lib/state';
import { answered, answersOf, inputRows, segments } from '../lib/check';
import { solvedState } from '../lib/solve';
import { denominatorEn, numberZh } from '../lib/words';
import { formatFrac } from '../lib/fraction';

export interface TrayProps {
  ctl: Controller;
  lesson: Lesson;
  task: Task | null;
  run: TaskRun | null;
  /** `07 · 2 / 3` */
  where: { step: string; index: number; count: number } | null;
  practice: boolean;
  /** The example being played: its caption line. */
  example: { line: number; lines: number; say: string } | null;
  /** Revisit buttons after a wrong practice answer. */
  revisit?: { id: string; number: string }[];
  /** Presentation card: controls, feedback and the Hint / Check / Show me buttons, no header. */
  compact?: boolean;
  /** Parts narrower than a finger: show the −/+ stepper. */
  narrow?: boolean;
  locale: Locale;
  /** Phone: the current value in the header (the card and panels are hidden). */
  readout?: boolean;
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
  const value = modelValue(task, run.state);
  return (
    <div ref={rootRef} className="ms-tray" data-hud-panel={p.compact ? undefined : 'task'} data-compact={p.compact || undefined} onKeyDown={onKey} role="group" aria-label={T('math.tray.label')}>
      {!p.compact && (
        <div className="ms-tray__head">
          {p.where && (
            <span className="ms-tray__where">
              {p.where.step} · {p.where.index} / {p.where.count}
            </span>
          )}
          {p.example ? (
            <p className="ms-tray__prompt ms-tray__prompt--example">
              <b>{T('math.example.title', { k: p.example.line + 1, n: p.example.lines })}</b> {renderRich(p.example.say, locale)}
            </p>
          ) : (
            <p className="ms-tray__prompt">{renderRich(tx(task.prompt, locale), locale)}</p>
          )}
          {p.readout && value && <span className="ms-tray__readout">{formatFrac(value)}</span>}
          {task.example && !p.practice && (
            <button type="button" className="ms-btn ms-btn--ghost" data-command="example" aria-pressed={!!p.example} onClick={() => ctl.example()}>
              {p.example ? T('math.example.stop') : T('math.example.watch')}
              <kbd>W</kbd>
            </button>
          )}
        </div>
      )}
      {!p.example && (
        <div className="ms-tray__body">
          <Controls {...p} phase={phase} locked={locked} />
          <p className="ms-tray__feedback" aria-live="polite" data-tone={fb?.tone} data-empty={fb ? undefined : ''}>
            {fb && (
              <>
                <i aria-hidden="true">{fb.tone === 'correct' ? '✓' : fb.tone === 'hint' ? 'i' : fb.tone === 'phase' ? '✓' : '○'}</i>
                <span>{renderRich(tx(fb.text, locale), locale)}</span>
              </>
            )}
          </p>
          {run.revealed && inputSpecOf(task) && <span className="ms-tray__answer">{T('math.tray.answer')} {renderRich(answersOf(inputSpecOf(task)!).map((f) => `{${f.w ? `${f.w} ` : ''}${f.n}/${f.d}}`).join(' = '), locale)}</span>}
          {!p.compact &&
            p.revisit?.map((r) => (
            <button key={r.id} type="button" className="ms-btn ms-btn--ghost" onClick={() => ctl.goTo(r.id, 0)}>
              {T('math.practice.revisit', { n: r.number })}
            </button>
            ))}
          {p.compact && (
            <>
              <button type="button" className="ms-btn ms-btn--ghost" data-command="hint" disabled={!ctl.canHint()} onClick={() => ctl.hint()}>
                {T('math.cmd.hint')}
              </button>
              <button type="button" className="ms-btn" data-command="check" data-ready={(!locked && answered(task, run.state)) || undefined} disabled={locked} onClick={() => ctl.check()}>
                {T('math.cmd.check')}
              </button>
            </>
          )}
          {!p.practice && !locked && run.tries >= 2 && !run.revealed && (
            <button type="button" className="ms-btn ms-btn--ghost" data-show-me="" onClick={() => ctl.showMe()}>
              {T('math.tray.showMe')}
            </button>
          )}
          {!p.compact && (
            <button type="button" className="ms-btn ms-tray__next" data-done={locked || undefined} onClick={() => ctl.next()}>
              {nextLabel(p, T)} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function nextLabel(p: TrayProps, T: ReturnType<typeof tr>): string {
  const last = p.where ? p.where.index >= p.where.count : false;
  if (p.practice) return last ? T('math.practice.results') : T('math.tray.nextQuestion');
  return last ? T('math.tray.nextStep') : T('math.tray.next');
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

  if (phase === 'input') {
    parts.push(<FractionInput key="input" task={task} state={s} ctl={ctl} locale={locale} locked={locked} />);
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

/** Where "Add a cut" cuts: the middle of the longest piece (on the grid). */
function biggestMiddle(cuts: readonly number[], snap: number): number {
  const at = [0, ...[...cuts].sort((a, b) => a - b), snap];
  let best = 0;
  for (let i = 1; i < at.length; i++) if (at[i]! - at[i - 1]! > at[best + 1]! - at[best]!) best = i - 1;
  return Math.round((at[best]! + at[best + 1]!) / 2);
}

/* ------------------------------------------------------------------ */
/* Fraction boxes + keypad                                             */
/* ------------------------------------------------------------------ */

function FractionInput({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const rows = inputRows(spec);
  const fields = rows.flatMap((r) => r.slots.flatMap((s) => (s.field ? [s.field] : [])));
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  // A new sub-step (or phase) starts in its first empty box; the denominator first for a plain fraction (count the whole first, S11).
  const first = fields.includes('d') && !fields.includes('w') ? 'd' : fields[0];
  useEffect(() => setActive(null), [task.id, state.phase]);
  const write = (field: string, value: string) => ctl.act({ do: 'input', field, value });
  const press = (key: string) => {
    const field = active ?? first;
    if (!field || locked) return;
    const cur = state.input[field] ?? '';
    write(field, key === 'back' ? cur.slice(0, -1) : (cur + key).slice(-2));
    refs.current[field]?.focus({ preventScroll: true });
    setActive(field);
  };
  const slotLabel = (slot: string, i: number) => T(`math.input.${slot as 'n' | 'd' | 'w'}`) + (rows.length > 1 ? ` ${i + 1}` : '');
  const box = (field: string | null, printed: number | null, slot: string, i: number) =>
    field ? (
      <input
        key={field}
        ref={(el) => {
          refs.current[field] = el;
        }}
        className="ms-box"
        data-field={field}
        data-active={(active ?? first) === field || undefined}
        inputMode="none"
        autoComplete="off"
        maxLength={2}
        aria-label={slotLabel(slot, i)}
        value={state.input[field] ?? ''}
        disabled={locked}
        onFocus={() => setActive(field)}
        onChange={(e) => write(field, e.currentTarget.value)}
      />
    ) : (
      <span key={`p${slot}${i}`} className="ms-box ms-box--printed" aria-label={`${slotLabel(slot, i)}: ${printed}`}>
        {printed}
      </span>
    );
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows">
        {spec.from && rows.length > 1 && (
          <>
            <span className="ms-input__given">{renderRich(`{${formatFrac(spec.from)}}`, locale)}</span>
            <span className="ms-input__eq">=</span>
          </>
        )}
        {rows.map((r, i) => {
          const w = r.slots.find((s) => s.slot === 'w');
          const n = r.slots.find((s) => s.slot === 'n');
          const d = r.slots.find((s) => s.slot === 'd');
          return (
            <span key={i} className="ms-input__row">
              {i > 0 && <span className="ms-input__eq">=</span>}
              {w && box(w.field, w.printed, 'w', i)}
              {n && d && (
                <span className="ms-input__frac">
                  {box(n.field, n.printed, 'n', i)}
                  <i aria-hidden="true" />
                  {box(d.field, d.printed, 'd', i)}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <div className="ms-keypad" role="group" aria-label={T('math.input.keypad')}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k) => (
          <button key={k} type="button" className="ms-key" disabled={locked} onPointerDown={(e) => e.preventDefault()} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button type="button" className="ms-key ms-key--back" aria-label={T('math.input.back')} disabled={locked} onPointerDown={(e) => e.preventDefault()} onClick={() => press('back')}>
          ⌫
        </button>
      </div>
    </div>
  );
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
