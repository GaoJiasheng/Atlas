/**
 * The check tray's controls for the square grid (docs/21 §3.2): the same
 * moves as on the stage, as finger-sized buttons that also work from the
 * keyboard — lay or lift a row at a time, "Walk round" (number the traced
 * sides in walking order) and Clear, the length and breadth steppers of a
 * drawn rectangle, the up-and-down / across cut movers — and the written
 * part: whole-number boxes with the unit printed after them, or a measure's
 * number box with its unit chips (cm, cm², m, m²), or a number sentence with
 * a box for each `?` (`? + ? = ?`), all with the on-screen keypad.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { Task } from '../schema';
import type { Controller } from '../controller';
import { boxDigits, figureRows, inputSpecOf, taskFigure, type TaskState } from '../lib/state';
import { inputFields } from '../lib/check';
import { parseCut } from '../lib/grid';
import { askOf } from '../lib/diagnose/measure';
import { squared, unitText, type Unit } from '../lib/value';

const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

function Stepper({ label, value, less, more, lessLabel, moreLabel, lessOff, moreOff }: { label: string; value: string; less(): void; more(): void; lessLabel: string; moreLabel: string; lessOff?: boolean; moreOff?: boolean }) {
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

/** Arrow keys inside a radio group move the choice (the host leaves arrows to radio groups). */
function radioKeys(e: KeyboardEvent<HTMLElement>) {
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (!dir || items.length === 0) return;
  e.preventDefault();
  const next = items[(i + dir + items.length) % items.length]!;
  next.focus();
  next.click();
}

/** A grid task's written part: whole-number boxes (unit printed), a measure (box + unit chips) or a sentence, with the keypad. */
export function WholeInput({ task, state, ctl, locale, locked }: { task: Task; state: TaskState; ctl: Controller; locale: Locale; locked: boolean }) {
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const fields = inputFields(spec);
  const digits = boxDigits(spec);
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  useEffect(() => setActive(null), [task.id, state.phase]);
  const m = task.model;
  const gridUnit = m.kind === 'grid' ? m.unit : 'unit';
  const ask = askOf(task, spec)?.ask;
  const printed: Unit = spec.unit ?? (ask === 'area' ? squared(gridUnit) : gridUnit);
  const write = (field: string, value: string) => ctl.act({ do: 'input', field, value });
  const first = fields[0];
  const press = (key: string) => {
    const field = active ?? first;
    if (!field || locked) return;
    const cur = state.input[field] ?? '';
    write(field, key === 'back' ? cur.slice(0, -1) : (cur + key).slice(-digits));
    refs.current[field]?.focus({ preventScroll: true });
    setActive(field);
  };
  const label = (i: number) => (ask ? t(locale, `math.grid.${ask}`) : T('math.input.w')) + (fields.length > 1 ? ` ${i + 1}` : '');
  const box = (field: string, i: number) => (
    <input
      key={field}
      ref={(el) => {
        refs.current[field] = el;
      }}
      className="ms-box ms-box--whole"
      data-field={field}
      data-active={(active ?? first) === field || undefined}
      inputMode="none"
      autoComplete="off"
      maxLength={digits}
      aria-label={label(i)}
      value={state.input[field] ?? ''}
      disabled={locked}
      onFocus={() => setActive(field)}
      onChange={(e) => write(field, e.currentTarget.value)}
    />
  );
  // A sentence prints its words and operators with a box for each `?`.
  const sentence = spec.sentence ?? (task.kind === 'split-figure' ? '? + ? = ?' : null);
  const parts = sentence ? sentence.split('?') : null;
  const units: Unit[] = gridUnit === 'unit' ? ['unit', 'unit2'] : ['cm', 'cm2', 'm', 'm2'];
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        {parts ? (
          parts.map((text, i) => (
            <span key={i} className="ms-input__part">
              {text && <span className="ms-input__eq">{text.trim()}</span>}
              {i < parts.length - 1 && fields[i] && box(fields[i]!, i)}
            </span>
          ))
        ) : (
          <span className="ms-input__row">
            {ask && <span className="ms-input__eq">{t(locale, `math.grid.${ask}`)} =</span>}
            {fields.map((f, i) => box(f, i))}
          </span>
        )}
        {spec.form !== 'measure' && <span className="ms-input__unit">{unitText(printed, locale)}</span>}
      </div>
      {spec.form === 'measure' && (
        <div className="ms-units" role="radiogroup" aria-label={T('math.tray.unit')} onKeyDown={radioKeys}>
          {units.map((u, i) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={state.input.u === u}
              tabIndex={state.input.u === u || (!state.input.u && i === 0) ? 0 : -1}
              className="ms-chip ms-unit"
              data-unit={u}
              disabled={locked}
              onClick={() => write('u', state.input.u === u ? '' : u)}
            >
              {unitText(u, locale)}
            </button>
          ))}
        </div>
      )}
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
