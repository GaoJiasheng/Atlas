/**
 * The check tray's controls for the square grid (docs/21 §3.2): the same
 * moves as on the stage, as finger-sized buttons that also work from the
 * keyboard — lay or lift a row at a time, "Walk round" (number the traced
 * sides in walking order) and Clear, the length and breadth steppers of a
 * drawn rectangle, the up-and-down / across cut movers. The written part is
 * `inputs/WholeInput.tsx`.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import { figureRows, taskFigure, type TaskState } from '../lib/state';
import { parseCut } from '../lib/grid';
import { unitText } from '../lib/value';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export function Stepper({ label, value, less, more, lessLabel, moreLabel, lessOff, moreOff }: { label: string; value: string; less(): void; more(): void; lessLabel: string; moreLabel: string; lessOff?: boolean; moreOff?: boolean }) {
  return (
    <div className="ms-tray__row ms-gstep">
      <button type="button" className="ms-btn ms-btn--icon" aria-label={lessLabel} disabled={lessOff} onClick={less}>
        −
      </button>
      <button type="button" className="ms-btn ms-btn--icon" aria-label={moreLabel} disabled={moreOff} onClick={more}>
        +
      </button>
      <span className="ms-tray__count">
        {label} <b>{value}</b>
      </span>
    </div>
  );
}

/** The model phase of a grid task. */
export function GridModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  const m = task.model;
  if (m.kind !== 'grid' || locked) return null;
  if (task.kind === 'count-squares') {
    const rows = figureRows(task);
    let full = 0;
    while (full < rows.length && rows[full]!.keys.every((k) => state.tiles.includes(k))) full++;
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <Stepper
          label={T('math.tray.rowsLaid', { n: full, total: rows.length })}
          value=""
          less={() => ctl.act({ do: 'rows', count: full - 1 })}
          more={() => ctl.act({ do: 'rows', count: full + 1 })}
          lessLabel={T('math.tray.rowLess')}
          moreLabel={T('math.tray.rowMore')}
          lessOff={state.tiles.length === 0}
          moreOff={full >= rows.length}
        />
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.tiles.length === 0} onClick={() => ctl.act({ do: 'clear' })}>
          {T('math.tray.clear')}
        </button>
      </div>
    );
  }
  if (task.kind === 'trace-perimeter') {
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn ms-btn--ghost" aria-pressed={state.walked} disabled={state.edges.length === 0} onClick={() => ctl.act({ do: 'walk' })} data-walk="">
          {T('math.tray.walk')}
        </button>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.edges.length === 0} onClick={() => ctl.act({ do: 'clear' })}>
          {T('math.tray.clear')}
        </button>
        <span className="ms-tray__count">{T('math.grid.traced', { n: state.edges.length })}</span>
      </div>
    );
  }
  if (task.kind === 'draw-rectangle') {
    const [w, h] = state.rect ?? [0, 0];
    const cols = m.cols ?? 12;
    const rows = m.rows ?? 10;
    const u = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale)}`;
    const set = (nw: number, nh: number) => ctl.act({ do: 'rect', w: Math.max(1, nw), h: Math.max(1, nh) });
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <Stepper
          label={T('math.tray.length')}
          value={state.rect ? `${w}${u}` : '—'}
          less={() => set(w - 1, h || 1)}
          more={() => set(w + 1, h || 1)}
          lessLabel={T('math.tray.shorter', { what: T('math.tray.length') })}
          moreLabel={T('math.tray.longer', { what: T('math.tray.length') })}
          lessOff={w <= 1}
          moreOff={w >= cols}
        />
        <Stepper
          label={T('math.tray.breadth')}
          value={state.rect ? `${h}${u}` : '—'}
          less={() => set(w || 1, h - 1)}
          more={() => set(w || 1, h + 1)}
          lessLabel={T('math.tray.shorter', { what: T('math.tray.breadth') })}
          moreLabel={T('math.tray.longer', { what: T('math.tray.breadth') })}
          lessOff={h <= 1}
          moreOff={h >= rows}
        />
      </div>
    );
  }
  if (task.kind === 'split-figure') {
    const fig = taskFigure(task);
    if (!fig) return null;
    const b = fig.facts.box;
    const cut = parseCut(state.cut);
    const move = (axis: 'x' | 'y', d: 1 | -1) => {
      const lo = axis === 'x' ? b.x + 1 : b.y + 1;
      const hi = axis === 'x' ? b.x + b.w - 1 : b.y + b.h - 1;
      const from = cut && cut.axis === axis ? cut.at + d : d > 0 ? lo : hi;
      ctl.act({ do: 'gridcut', cut: `${axis}:${Math.min(hi, Math.max(lo, from))}` });
    };
    const at = (axis: 'x' | 'y') => (cut && cut.axis === axis ? String(cut.at - (axis === 'x' ? b.x : b.y)) : '—');
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <Stepper label={T('math.tray.cutUp')} value={at('x')} less={() => move('x', -1)} more={() => move('x', 1)} lessLabel={T('math.tray.moveLeft')} moreLabel={T('math.tray.moveRight')} lessOff={b.w < 2} moreOff={b.w < 2} />
        <Stepper label={T('math.tray.cutAcross')} value={at('y')} less={() => move('y', -1)} more={() => move('y', 1)} lessLabel={T('math.tray.moveDown')} moreLabel={T('math.tray.moveUp')} lessOff={b.h < 2} moreOff={b.h < 2} />
      </div>
    );
  }
  return null;
}
