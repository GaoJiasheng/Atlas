/**
 * The check tray's row for line symmetry (docs/79 §3.2): "Fold it" — the
 * given half (a completion) or the figure on the stage line (a choice) folded
 * over to look, not checked (a line drawn: the figure folded along the
 * child's line); open after the first check or the second hint,
 * never in the practice — and, on a completion, Clear and how many squares
 * or corners are down (never how many are wanted).
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskRun } from '../ui';
import { taskLine } from '../lib/symmetry-tasks';

export function SymmetryControls({ task, run, ctl, locale, practice }: { task: Task; run: TaskRun; ctl: Controller; locale: Locale; practice: boolean }) {
  const s = run.state;
  const locked = run.done;
  const foldOpen = !practice && (run.attempts.length > 0 || run.hints >= 2 || run.done);
  const completion = task.kind === 'complete-symmetric';
  // A line drawn is folded along the child's line, once there is one.
  const drawing = task.kind === 'draw-segment';
  const drawn = drawing && (task.from ? 1 : 0) + s.dpts.length >= 2;
  // Pictures to choose from have no stage line to fold (taskLine is null for them).
  if ((!taskLine(task) && !drawing) || (!completion && practice)) return null;
  return (
    <div className="ms-tray__row ms-tray__row--wrap">
      {!practice && (
        <button type="button" className="ms-btn ms-btn--ghost" data-sym-fold="" aria-pressed={s.sfold} disabled={!foldOpen || (drawing && !drawn)} title={foldOpen ? undefined : t(locale, 'math.sym.foldLocked')} onClick={() => ctl.act({ do: 'sfold' })}>
          {t(locale, s.sfold ? 'math.sym.unfold' : 'math.sym.fold')}
        </button>
      )}
      {completion && !locked && (
        <button type="button" className="ms-btn ms-btn--ghost" disabled={s.sym.length === 0} onClick={() => ctl.act({ do: 'clear' })}>
          {t(locale, 'math.tray.clear')}
        </button>
      )}
      {completion && <span className="ms-tray__count">{t(locale, task.mode === 'cells' ? 'math.sym.squaresDown' : 'math.sym.cornersDown', { n: s.sym.length })}</span>}
    </div>
  );
}
