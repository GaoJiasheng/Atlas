/**
 * The check tray's controls for the instruments (docs/32 §3.4): the same
 * moves as on the stage, as finger-sized buttons that also work from the
 * keyboard — the reading tools (magnify the stretch the reading is in,
 * number the small parts as you count them: scratch, never checked); a
 * line, an arrow, a needle or a level a small part or a numbered gap on or
 * back ("add a little", "pour in a little"); the weights put on the pan, the
 * last taken off; the parts between two marks counted one more or one fewer.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskState } from '../lib/state';
import { countParts, setStart, setValue, taskScale } from '../lib/measure-tasks';
import { weightText } from '../lib/instrument';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

/** Does the task's phase have measuring controls in the tray? */
export function hasMeasureControls(task: Task, phase: string): boolean {
  return (task.kind === 'set-scale' && phase === 'model') || (task.kind === 'count-intervals' && phase === 'model') || (task.kind === 'read-scale' && (task.tools?.length ?? 0) > 0);
}

export function MeasureModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  if (locked) return null;
  const act = ctl.act;
  if (task.kind === 'read-scale') {
    const tools = task.tools ?? [];
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {tools.includes('zoom') && (
          <button type="button" className="ms-btn ms-btn--ghost" aria-pressed={state.mzoom} data-tool="zoom" onClick={() => act({ do: 'mtool', tool: 'zoom' })}>
            {T('math.tray.zoomTool')}
          </button>
        )}
        {tools.includes('count') && (
          <button type="button" className="ms-btn ms-btn--ghost" aria-pressed={state.mcount} data-tool="count" onClick={() => act({ do: 'mtool', tool: 'count' })}>
            {T('math.tray.countTool')}
          </button>
        )}
        {state.mcount && <span className="ms-tray__count">{T('math.measure.parts', { n: state.mparts.length })}</span>}
      </div>
    );
  }
  if (task.kind === 'count-intervals') {
    const parts = countParts(task);
    const next = parts.find((p) => !state.mparts.includes(p));
    const last = state.mparts.at(-1);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn ms-btn--ghost" data-part-more="" disabled={next === undefined} onClick={() => next !== undefined && act({ do: 'mpart', part: next })}>
          {T('math.tray.partMore')}
        </button>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={last === undefined} onClick={() => last !== undefined && act({ do: 'mpart', part: last })}>
          {T('math.tray.partLess')}
        </button>
        <span className="ms-tray__count">{T('math.measure.parts', { n: state.mparts.length })}</span>
      </div>
    );
  }
  if (task.kind !== 'set-scale') return null;
  if (task.mode === 'weights') {
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <div className="ms-chips" role="group" aria-label={T('math.tray.weights')}>
          {(task.weights ?? []).map((w) => (
            <button key={w} type="button" className="ms-chip" data-weight={w} aria-label={T('math.tray.weightAdd', { w: weightText(w) })} onClick={() => act({ do: 'weigh', w })}>
              {weightText(w)}
            </button>
          ))}
        </div>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.mweights.length === 0} onClick={() => act({ do: 'unweigh', at: state.mweights.length - 1 })}>
          {T('math.tray.weightLast')}
        </button>
      </div>
    );
  }
  const sc = taskScale(task);
  if (!sc) return null;
  const v = setValue(task, state);
  const lo = task.mode === 'line' ? setStart(task) : sc.from;
  const mode = task.mode;
  // A numbered gap: to the next (or the one before) numbered mark.
  const up = Math.min(sc.to, (Math.floor(v / sc.major) + 1) * sc.major);
  const down = Math.max(lo, v % sc.major === 0 ? v - sc.major : Math.floor(v / sc.major) * sc.major);
  return (
    <div className="ms-tray__row ms-tray__row--wrap ms-mset">
      <button type="button" className="ms-btn ms-btn--ghost" data-nudge="-1" disabled={v <= lo} onClick={() => act({ do: 'mnudge', by: -sc.minor })}>
        {T(`math.tray.less.${mode}`)}
      </button>
      <button type="button" className="ms-btn ms-btn--ghost" data-nudge="1" disabled={v >= sc.to} onClick={() => act({ do: 'mnudge', by: sc.minor })}>
        {T(`math.tray.more.${mode}`)}
      </button>
      {sc.per > 1 && (
        <>
          <button type="button" className="ms-btn ms-btn--ghost" data-nudge="-M" disabled={v <= lo} onClick={() => act({ do: 'mset', to: down })}>
            {T(`math.tray.lessBig.${mode}`)}
          </button>
          <button type="button" className="ms-btn ms-btn--ghost" data-nudge="M" disabled={v >= sc.to} onClick={() => act({ do: 'mset', to: up })}>
            {T(`math.tray.moreBig.${mode}`)}
          </button>
        </>
      )}
    </div>
  );
}
