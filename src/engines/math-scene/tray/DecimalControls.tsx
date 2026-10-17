/**
 * The check tray's controls for the decimal models (docs/29 §3.6): the same
 * moves as on the stage, as finger-sized buttons that also work from the
 * keyboard — shade a tenth / hundredth / thousandth more or less, start
 * again (the grid); zoom into the step the mark is on, out again, the mark a
 * step left or right (the line); the nearer end (rounding); the second row
 * one place left or right and zeros filled in (lining up on the point); the
 * digits one place left or right (× ÷ 10, 100, 1000); share a place, trade
 * one down or ten up (the chart).
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { DPlace, DTrade, Task } from '../schema';
import { DPLACES } from '../schema';
import type { Controller } from '../controller';
import type { TaskState } from '../lib/state';
import { formatDecimal, withPlaces } from '../lib/decimal';
import { alignRange, decimalLine, onChart, placedValue, shadedValue, shiftRange, shiftResult } from '../lib/decimal-tasks';
import { levelsFor, roundingEnds } from '../lib/dline';
import { above, below, canDTrade } from '../lib/placevalue';
import { radioKeys } from './inputs/boxes';
import { Stepper } from './GridControls';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

/** Does the task's model phase have decimal controls in the tray? */
export function hasDecimalControls(task: Task): boolean {
  return task.kind === 'shade-decimal' || task.kind === 'round-on-line' || task.kind === 'align-add' || task.kind === 'shift-digits' || onChart(task) || (task.kind === 'place' && !!decimalLine(task.model));
}

export function DecimalModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  if (locked) return null;
  const act = ctl.act;
  if (task.kind === 'shade-decimal') {
    const now = Math.round(shadedValue(task, state).units / 1000);
    const steps = task.level === 10 ? [100] : task.level === 100 ? [100, 10] : [100, 10, 1];
    const fill = (th: number) => act({ do: 'dfill', th });
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {steps.map((s) => {
          const v = formatDecimal({ units: s * 1000, dp: s === 100 ? 1 : s === 10 ? 2 : 3 });
          return <Stepper key={s} label={v} value="" less={() => fill(now - s)} more={() => fill(now + s)} lessLabel={T('math.tray.stepLess', { v })} moreLabel={T('math.tray.stepMore', { v })} lessOff={now - s < Math.round((task.start?.units ?? 0) / 1000)} />;
        })}
        <button type="button" className="ms-btn ms-btn--ghost" disabled={now === Math.round((task.start?.units ?? 0) / 1000)} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.again')}
        </button>
        <span className="ms-tray__count">{T('math.tray.shadedValue', { v: formatDecimal(withPlaces({ units: now * 1000, dp: 0 }, 0)) })}</span>
      </div>
    );
  }
  if (task.kind === 'place') {
    const m = decimalLine(task.model);
    if (!m) return null;
    const levels = levelsFor(m, state.zoomPath);
    const deepest = levels.at(-1)!;
    const depth = task.zoom ?? 0;
    const canZoom = state.zoomPath.length < depth;
    const at = state.place ?? 0;
    const v = placedValue(task, state);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.left')} disabled={state.place === null || at <= 0} onClick={() => act({ do: 'dplace', tick: at - 1 })}>
          ◀
        </button>
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.right')} disabled={state.place !== null && at >= deepest.steps} onClick={() => act({ do: 'dplace', tick: state.place === null ? 0 : at + 1 })}>
          ▶
        </button>
        {canZoom && (
          <button type="button" className="ms-btn" data-zoom="" onClick={() => act({ do: 'zoom', level: state.zoomPath.length, seg: Math.min(at, deepest.steps - 1) })}>
            {T('math.tray.zoomIn')}
          </button>
        )}
        {state.zoomPath.length > 0 && (
          <button type="button" className="ms-btn ms-btn--ghost" onClick={() => act({ do: 'zoom', level: state.zoomPath.length - 1, seg: null })}>
            {T('math.tray.zoomOut')}
          </button>
        )}
        <span className="ms-tray__count">{v ? T('math.tray.placedValue', { v: formatDecimal(v) }) : `${formatDecimal(deepest.from)} – ${formatDecimal(deepest.to)}`}</span>
      </div>
    );
  }
  if (task.kind === 'round-on-line') {
    const e = roundingEnds(task.value, task.to);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <span className="ms-tray__note">{T('math.tray.nearer')}</span>
        <div className="ms-symbols" role="radiogroup" aria-label={T('math.tray.nearer')} onKeyDown={radioKeys}>
          {(['lo', 'hi'] as const).map((side) => (
            <button key={side} type="button" role="radio" aria-checked={state.end === side} tabIndex={state.end === side || (state.end === null && side === 'lo') ? 0 : -1} className="ms-symbol-btn ms-symbol-btn--wide" data-end={side} onClick={() => act({ do: 'end', side })}>
              {task.labels === 'hidden' ? (side === 'lo' ? '◀' : '▶') : formatDecimal(side === 'lo' ? e.lo : e.hi)}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (task.kind === 'align-add') {
    const [lo, hi] = alignRange(task.a, task.b, task.start);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.rowLeft')} disabled={state.offset >= hi} onClick={() => act({ do: 'offset', to: state.offset + 1 })}>
          ◀
        </button>
        <button type="button" className="ms-btn ms-btn--icon" aria-label={T('math.tray.rowRight')} disabled={state.offset <= lo} onClick={() => act({ do: 'offset', to: state.offset - 1 })}>
          ▶
        </button>
        <button type="button" className="ms-btn ms-btn--ghost" aria-pressed={state.padded} onClick={() => act({ do: 'pad' })}>
          {T('math.tray.zeros')}
        </button>
        <span className="ms-tray__count" data-on={state.offset === 0 || undefined}>
          {T(state.offset === 0 ? 'math.tray.onPoint' : 'math.tray.offPoint')}
        </span>
      </div>
    );
  }
  if (task.kind === 'shift-digits') {
    const [lo, hi] = shiftRange(task.value);
    const v = shiftResult(task, state);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn" data-shift="left" disabled={state.shift >= hi} onClick={() => act({ do: 'shift', to: state.shift + 1 })}>
          ◀ {T('math.tray.shiftLeft')}
        </button>
        <button type="button" className="ms-btn" data-shift="right" disabled={state.shift <= lo} onClick={() => act({ do: 'shift', to: state.shift - 1 })}>
          {T('math.tray.shiftRight')} ▶
        </button>
        <span className="ms-tray__count">{v ? T('math.tray.shiftValue', { v: formatDecimal(v) }) : ''}</span>
      </div>
    );
  }
  if ((task.kind === 'share' || task.kind === 'regroup') && onChart(task)) {
    const unit = (p: DPlace) => t(locale, `math.pvunit.${p}`);
    const present = DPLACES.filter((p) => state.pv[p] > 0);
    const down = (p: DPlace) => (below(p) ? (`${p}>${below(p)}` as DTrade) : null);
    const up = (p: DPlace) => (above(p) ? (`${p}>${above(p)}` as DTrade) : null);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {task.kind === 'share' &&
          present.map((p) => (
            <button key={`s${p}`} type="button" className="ms-btn" data-dshare={p} disabled={state.pv[p] < task.k} onClick={() => act({ do: 'dshare', place: p })}>
              {T('math.tray.dshare', { place: unit(p) })}
            </button>
          ))}
        {present.map((p) => {
          const d = down(p);
          if (!d || (task.kind === 'regroup' && !task.goal)) return null;
          return (
            <button key={`d${p}`} type="button" className="ms-btn ms-btn--ghost" data-dtrade={d} disabled={!canDTrade(state.pv, d)} onClick={() => act({ do: 'dtrade', trade: d })}>
              {T('math.tray.dtradeDown', { place: unit(below(p)!) })}
            </button>
          );
        })}
        {task.kind === 'regroup' &&
          present.map((p) => {
            const u = up(p);
            if (!u || state.pv[p] < 10) return null;
            return (
              <button key={`u${p}`} type="button" className="ms-btn" data-dtrade={u} onClick={() => act({ do: 'dtrade', trade: u })}>
                {T('math.tray.dtradeUp', { place: unit(above(p)!) })}
              </button>
            );
          })}
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.trades === 0 && DPLACES.every((p) => state.pvDealt[p] === 0)} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.again')}
        </button>
      </div>
    );
  }
  return null;
}
