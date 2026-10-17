/**
 * The check tray's controls for the array, the whole-number line and the
 * blocks (docs/19 §3.1–3.2): the same moves as on the stage, as finger-sized
 * buttons that also work from the keyboard — deal one round or fill a box,
 * more or fewer plates, start again (groups); rows and columns steppers
 * (an array); the last jump lifted (skip counting); the cut moved after a row
 * or a column (a split); trade 10 for 1 (regroup); share a place, or trade
 * one of it down (share).
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { PlaceKey, Task, Trade } from '../schema';
import type { Controller } from '../controller';
import { looseOf, MAX_GROUPS, type TaskState } from '../lib/state';
import { parseArrayCut } from '../lib/array';
import { canTrade } from '../lib/blocks';
import { Stepper } from './GridControls';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export function WholeModelControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  if (locked) return null;
  const act = ctl.act;
  if (task.kind === 'group') {
    const loose = looseOf(task, state);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {task.by === 'share' ? (
          <>
            <button type="button" className="ms-btn" data-deal="" disabled={loose === 0 || state.groups.length === 0} onClick={() => act({ do: 'deal' })}>
              {T('math.tray.deal')}
            </button>
            <Stepper
              label={T('math.tray.plates')}
              value={String(state.groups.length)}
              less={() => act({ do: 'containers', count: state.groups.length - 1 })}
              more={() => act({ do: 'containers', count: state.groups.length + 1 })}
              lessLabel={T('math.tray.platesLess')}
              moreLabel={T('math.tray.platesMore')}
              lessOff={state.groups.length <= 1}
              moreOff={state.groups.length >= MAX_GROUPS}
            />
          </>
        ) : (
          <button type="button" className="ms-btn" data-pack="" disabled={loose < task.k || state.groups.length >= MAX_GROUPS} onClick={() => act({ do: 'pack' })}>
            {T('math.tray.pack', { k: task.k })}
          </button>
        )}
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.groups.every((g) => g === 0)} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.again')}
        </button>
        <span className="ms-tray__count">{T('math.array.left', { n: loose })}</span>
      </div>
    );
  }
  if (task.kind === 'arrange') {
    const [r, c] = state.arr ?? [0, 0];
    const set = (nr: number, nc: number) => act({ do: 'arrange', rows: Math.max(1, nr), cols: Math.max(1, nc) });
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <Stepper label={T('math.tray.rows')} value={state.arr ? String(r) : '—'} less={() => set(r - 1, c || 1)} more={() => set(r + 1, c || 1)} lessLabel={T('math.tray.rowsLess')} moreLabel={T('math.tray.rowsMore')} lessOff={r <= 1} moreOff={r >= 12} />
        <Stepper label={T('math.tray.cols')} value={state.arr ? String(c) : '—'} less={() => set(r || 1, c - 1)} more={() => set(r || 1, c + 1)} lessLabel={T('math.tray.colsLess')} moreLabel={T('math.tray.colsMore')} lessOff={c <= 1} moreOff={c >= 12} />
      </div>
    );
  }
  if (task.kind === 'skip-count') {
    const last = state.landings.at(-1);
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <button type="button" className="ms-btn ms-btn--ghost" disabled={last === undefined} onClick={() => last !== undefined && act({ do: 'land', at: last })}>
          {T('math.tray.unjump')}
        </button>
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.landings.length === 0} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.clear')}
        </button>
        <span className="ms-tray__count">{T('math.wline.jumps', { n: state.landings.length })}</span>
      </div>
    );
  }
  if (task.kind === 'split-array') {
    if (state.phase > 0) return null;
    const cut = parseArrayCut(state.cut);
    const move = (axis: 'rows' | 'cols', d: 1 | -1) => {
      const max = (axis === 'rows' ? task.rows : task.cols) - 1;
      if (max < 1) return;
      const from = cut && cut.axis === axis ? cut.at + d : d > 0 ? 1 : max;
      act({ do: 'arraycut', cut: `${axis === 'rows' ? 'r' : 'c'}${Math.min(max, Math.max(1, from))}` });
    };
    const at = (axis: 'rows' | 'cols') => (cut && cut.axis === axis ? String(cut.at) : '—');
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        <Stepper label={T('math.tray.cutRow')} value={at('rows')} less={() => move('rows', -1)} more={() => move('rows', 1)} lessLabel={T('math.tray.moveUp')} moreLabel={T('math.tray.moveDown')} lessOff={task.rows < 2} moreOff={task.rows < 2} />
        <Stepper label={T('math.tray.cutCol')} value={at('cols')} less={() => move('cols', -1)} more={() => move('cols', 1)} lessLabel={T('math.tray.moveLeft')} moreLabel={T('math.tray.moveRight')} lessOff={task.cols < 2} moreOff={task.cols < 2} />
      </div>
    );
  }
  if (task.kind === 'regroup') {
    const up: { trade: Trade; from: PlaceKey }[] = [
      { trade: 'O>T', from: 'O' },
      { trade: 'T>H', from: 'T' },
    ];
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {up.map(({ trade, from }) => (
          <button key={trade} type="button" className="ms-btn" data-trade={trade} disabled={state.mat[from] < 10} onClick={() => act({ do: 'trade', trade })}>
            {T(trade === 'O>T' ? 'math.tray.tradeOT' : 'math.tray.tradeTH')}
          </button>
        ))}
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.trades === 0} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.again')}
        </button>
        <span className="ms-tray__count">{T('math.tray.trades', { n: state.trades })}</span>
      </div>
    );
  }
  if (task.kind === 'share') {
    const places: PlaceKey[] = ['H', 'T', 'O'];
    const down: { trade: Trade; from: PlaceKey }[] = [
      { trade: 'H>T', from: 'H' },
      { trade: 'T>O', from: 'T' },
    ];
    return (
      <div className="ms-tray__row ms-tray__row--wrap">
        {places.map((pl) =>
          state.mat[pl] > 0 || pl === 'O' ? (
            <button key={pl} type="button" className="ms-btn" data-share={pl} disabled={state.mat[pl] < task.k} onClick={() => act({ do: 'share', place: pl })}>
              {T(`math.tray.share${pl}`)}
            </button>
          ) : null,
        )}
        {down.map(({ trade, from }) =>
          state.mat[from] > 0 ? (
            <button key={trade} type="button" className="ms-btn ms-btn--ghost" data-trade={trade} disabled={!canTrade(state.mat, trade)} onClick={() => act({ do: 'trade', trade })}>
              {T(trade === 'H>T' ? 'math.tray.tradeHT' : 'math.tray.tradeTO')}
            </button>
          ) : null,
        )}
        <button type="button" className="ms-btn ms-btn--ghost" disabled={state.dealt.H + state.dealt.T + state.dealt.O === 0 && state.trades === 0} onClick={() => act({ do: 'clear' })}>
          {T('math.tray.again')}
        </button>
      </div>
    );
  }
  return null;
}
