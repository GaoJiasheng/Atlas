/**
 * The check tray's controls for the clock and the timeline (docs/20 §3.4):
 * the same moves as on the stage as finger-sized buttons that also work from
 * the keyboard. `set-clock`: the hour −/+ and the minutes −/+ by the snap
 * (and by 1 when the snap is 5 minutes, five at a time), the am / pm plate
 * when it is set too. `duration`: the jump chips (+1 h, +10 min, +5 min,
 * +1 min — back, when the start is asked) and "Take back the last jump"
 * (Backspace on a chip does the same); the jumps are a help, only the answer
 * written under them is checked.
 */
import { useContext, type KeyboardEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { NotationContext } from '../../../lib/rich-text';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskState } from '../lib/state';
import { clockShown, HALF_DAY, nudge } from '../lib/clock';
import { canHop, hopStart, HOP_CHIPS } from '../lib/timeline';
import { ampmText, clockParts, durationText, HOUR, MINUTE } from '../lib/value';
import { Stepper } from './GridControls';
import { Chips } from './inputs/boxes';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export function SetClockControls({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  const notation = useContext(NotationContext);
  if (task.kind !== 'set-clock' || locked) return null;
  const now = clockShown(task, state.clock);
  const p = clockParts(now);
  const ampm = !!task.ampm;
  const set = (by: number) => ctl.act({ do: 'clock', t: nudge(now, by, task.snap, ampm) });
  return (
    <div className="ms-tray__row ms-tray__row--wrap">
      <Stepper label={T('math.tray.hour')} value={String(p.h12)} less={() => set(-HOUR)} more={() => set(HOUR)} lessLabel={T('math.tray.hourLess')} moreLabel={T('math.tray.hourMore')} />
      <Stepper
        label={T('math.tray.minute')}
        value={String(p.m).padStart(2, '0')}
        less={() => set(-task.snap * MINUTE)}
        more={() => set(task.snap * MINUTE)}
        lessLabel={T('math.tray.minuteLess', { n: task.snap })}
        moreLabel={T('math.tray.minuteMore', { n: task.snap })}
      />
      {task.snap === 1 && (
        <Stepper label="" value={durationText(5 * MINUTE, ['m'], locale, true)} less={() => set(-5 * MINUTE)} more={() => set(5 * MINUTE)} lessLabel={T('math.tray.minuteLess', { n: 5 })} moreLabel={T('math.tray.minuteMore', { n: 5 })} />
      )}
      {ampm && (
        <Chips
          kind="ampm"
          label={T('math.input.ampm')}
          items={[
            { id: 'am', text: ampmText(false, notation) },
            { id: 'pm', text: ampmText(true, notation) },
          ]}
          value={p.pm ? 'pm' : 'am'}
          onPick={(v) => (v === 'pm') !== p.pm && ctl.act({ do: 'clock', t: now + (p.pm ? -HALF_DAY : HALF_DAY) })}
          locked={locked}
        />
      )}
    </div>
  );
}

export function HopChips({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  const start = hopStart(task);
  if (task.kind !== 'duration' || !start || locked) return null;
  const back = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Backspace' || state.hops.length === 0) return;
    e.preventDefault();
    ctl.act({ do: 'unhop' });
  };
  return (
    <div className="ms-hops" role="group" aria-label={T('math.tray.hops')} onKeyDown={back}>
      <div className="ms-chips">
        {HOP_CHIPS.map((c) => {
          const by = start.dir * c;
          const text = durationText(c, c >= HOUR ? ['h'] : ['m'], locale, true);
          return (
            <button key={c} type="button" className="ms-chip ms-chip--hop" data-hop={by} disabled={!canHop(task, state.hops, by)} aria-label={T(by > 0 ? 'math.tray.hopOn' : 'math.tray.hopBack', { d: durationText(c, c >= HOUR ? ['h'] : ['m'], locale) })} onClick={() => ctl.act({ do: 'hop', by })}>
              {by > 0 ? '+' : '−'}
              {text}
            </button>
          );
        })}
        <button type="button" className="ms-btn ms-btn--ghost" data-unhop="" disabled={state.hops.length === 0} onClick={() => ctl.act({ do: 'unhop' })}>
          {T('math.tray.unhop')}
        </button>
      </div>
      <span className="ms-tray__note">{T('math.tray.hopsNote')}</span>
    </div>
  );
}
