/**
 * The nets controls (docs/39 §3.5): the "fold it and look" tool at the
 * stage's bottom right — the FOLD slider (`role="slider"`: ← → a tenth at a
 * time, Home flat, End folded; read as "folded half way") and the ↺ ↻
 * quarter turns. On a beat it is always there and goes back to the beat's
 * own fold on the next beat; on a check it is locked until the first check
 * (or the second hint), never opens in the practice, and is not there for
 * a net to complete (Check folds it); the turns always work (turning gives
 * nothing away). Not in the URL. And the check tray's row for completing a
 * net: undo, clear, how many placed (`3 / 5`).
 */
import type { CSSProperties, KeyboardEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskState } from '../lib/state';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

/** How far folded, in words ("folded half way"). */
export function foldWords(pct: number, locale: Locale): string {
  if (pct <= 0) return t(locale, 'math.net.foldFlat');
  if (pct >= 100) return t(locale, 'math.net.foldDone');
  if (pct === 50) return t(locale, 'math.net.foldHalf');
  return t(locale, 'math.net.foldPct', { n: pct });
}

export interface NetToolsProps {
  /** 0–100. */
  fold: number;
  /** `null`: the fold is locked (a check before its first try, the practice). */
  onFold: ((pct: number) => void) | null;
  /** Hidden: a net to complete folds on Check. */
  foldable: boolean;
  onTurn(by: 1 | -1): void;
  /** Little room (a narrow stage): the slider without its name and percentage. */
  compact?: boolean;
  style: CSSProperties;
  locale: Locale;
}

export function NetTools({ fold, onFold, foldable, onTurn, compact, style, locale }: NetToolsProps) {
  const T = tr(locale);
  const set = (v: number) => onFold?.(Math.max(0, Math.min(100, Math.round(v))));
  const keys = (e: KeyboardEvent<HTMLInputElement>) => {
    const step: Record<string, number> = { ArrowRight: 10, ArrowUp: 10, PageUp: 10, ArrowLeft: -10, ArrowDown: -10, PageDown: -10 };
    if (e.key in step) set(Math.round((fold + step[e.key]!) / 10) * 10);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(100);
    else return;
    e.preventDefault();
  };
  return (
    <div className="ms-net-tools" data-hud-panel="net-tools" data-compact={compact || undefined} role="group" aria-label={T('math.net.tools')} style={style}>
      {foldable && (
        <label className="ms-net-tools__fold" data-locked={onFold ? undefined : ''} title={onFold ? undefined : T('math.net.foldLocked')}>
          <span className="ms-net-tools__name">
            {t('en', 'math.net.foldLabel').toLocaleUpperCase('en')}
            <small lang="zh-Hans">{t('zh', 'math.net.foldLabel')}</small>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={fold}
            disabled={!onFold}
            aria-label={T('math.net.foldLabel')}
            aria-valuetext={foldWords(fold, locale)}
            onChange={(e) => set(Number(e.currentTarget.value))}
            onKeyDown={keys}
          />
          <span className="ms-net-tools__pct" aria-hidden="true">
            {fold} %
          </span>
        </label>
      )}
      <button type="button" className="ms-btn ms-btn--icon" data-turn="-1" aria-label={T('math.net.turnLeft')} title={T('math.net.turnLeft')} onClick={() => onTurn(-1)}>
        ↺
      </button>
      <button type="button" className="ms-btn ms-btn--icon" data-turn="1" aria-label={T('math.net.turnRight')} title={T('math.net.turnRight')} onClick={() => onTurn(1)}>
        ↻
      </button>
    </div>
  );
}

/** The tray's row for completing a net: undo, clear, how many faces placed. */
export function NetModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  if (task.kind !== 'complete-net' || locked) return null;
  return (
    <div className="ms-tray__row ms-tray__row--wrap">
      <button type="button" className="ms-btn ms-btn--ghost" data-command="undo" disabled={!ctl.canUndo()} onClick={() => ctl.undo()}>
        {T('math.cmd.undo')}
      </button>
      <button type="button" className="ms-btn ms-btn--ghost" data-net-clear="" disabled={state.nplaced.length === 0} onClick={() => ctl.act({ do: 'clear' })}>
        {T('math.tray.clear')}
      </button>
      <span className="ms-tray__count" aria-live="polite">
        {T('math.tray.placed', { n: state.nplaced.length, m: task.add })}
      </span>
    </div>
  );
}
