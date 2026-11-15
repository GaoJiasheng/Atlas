/**
 * The check tray's controls for angles (docs/76 §3.2): the same moves as on
 * the stage as finger-sized buttons (a touch screen and a screen reader can
 * finish every task with them) — "Centre on the vertex" and "0 line on an
 * arm" for the protractor, its turn ↺ ↻ 1° and 15°; the drawn arm −/+ 1° and
 * 10° and the protractor on or off; the dots picked and Clear on dot paper.
 * The written part (`?°`) is `inputs/WholeInput.tsx`.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskState } from '../lib/state';
import { baseDir, laid, protractorRest } from '../lib/angle-tasks';
import { norm } from '../lib/angle';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export const hasAngleControls = (task: Task, phase: string): boolean => phase === 'model' && (task.kind === 'measure-angle' || task.kind === 'draw-angle' || task.kind === 'draw-segment');

export function AngleModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  if (task.kind === 'measure-angle') {
    const pos = state.apos ?? protractorRest(task);
    const centred = Math.hypot(pos[0], pos[1]) < 1e-6;
    const turn = (by: number) => ctl.act({ do: 'aturn', to: state.arot + by });
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn" disabled={locked || centred} onClick={() => ctl.act({ do: 'acentre' })}>
          {T('math.angle.centre')}
        </button>
        <button type="button" className="ms-btn" disabled={locked || laid(task, state)} onClick={() => ctl.act({ do: 'aline' })}>
          {T('math.angle.lineUp')}
        </button>
        {[15, 1, -1, -15].map((by) => (
          <button key={by} type="button" className="ms-btn ms-btn--icon" aria-label={by > 0 ? T('math.angle.turnBy', { n: by }) : T('math.angle.turnBack', { n: -by })} disabled={locked} onClick={() => turn(by)}>
            {by > 0 ? `↺${by}°` : `↻${-by}°`}
          </button>
        ))}
      </div>
    );
  }
  if (task.kind === 'draw-angle') {
    const dir = state.adir ?? baseDir(task);
    const sign = task.open === 'ccw' ? 1 : -1;
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {[-10, -1, 1, 10].map((by) => (
          <button key={by} type="button" className="ms-btn ms-btn--icon" aria-label={(by * sign > 0 ? T('math.angle.turnBy', { n: Math.abs(by) }) : T('math.angle.turnBack', { n: Math.abs(by) }))} disabled={locked} onClick={() => ctl.act({ do: 'aarm', dir: norm(dir + by * sign) })}>
            {by > 0 ? `+${by}°` : `−${-by}°`}
          </button>
        ))}
        <button type="button" className="ms-btn ms-btn--ghost" aria-pressed={state.aprot} disabled={locked} onClick={() => ctl.act({ do: 'aprot' })}>
          {T('math.angle.protractorToggle')}
        </button>
      </div>
    );
  }
  if (task.kind === 'draw-segment') {
    const room = task.from ? 1 : 2;
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <span className="ms-tray__count">{T('math.angle.dotsPicked', { n: state.dpts.length, m: room })}</span>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={locked || state.dpts.length === 0} onClick={() => ctl.act({ do: 'clear' })}>
          {T('math.tray.clear')}
        </button>
      </div>
    );
  }
  return null;
}
