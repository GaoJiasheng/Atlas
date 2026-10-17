/**
 * What every answer form shares (docs/19 §3.0 G2): the digit boxes and the
 * on-screen keypad. A box is an `<input inputMode="none">` (the physical
 * keyboard types into it, Tab moves between boxes, Enter checks — the tray
 * handles that), the keypad writes into the box last used (or the first),
 * and in the multi-box forms (times, durations, remainders) a box that is
 * full hands on to the next. Keys ≥ 44 px; the region is `data-keys="own"`.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { Task } from '../../schema';
import type { Controller } from '../../controller';
import type { TaskState } from '../../lib/state';

export interface InputProps {
  task: Task;
  state: TaskState;
  ctl: Controller;
  locale: Locale;
  locked: boolean;
}

export const tr = (locale: Locale) => (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

export interface Boxes {
  /** The box the keypad writes into. */
  current: string | undefined;
  box(field: string, opts: { label: string; digits: number; className?: string; placeholder?: string }): ReactNode;
  press(key: string): void;
}

/**
 * Boxes for `fields`: `digits(field)` digits each. `rolling` (fractions, whole
 * numbers): a full box keeps its last digits as you type on; otherwise a full
 * box moves on to the next one.
 */
export function useBoxes(p: InputProps, fields: readonly string[], digits: (field: string) => number, opts: { first?: string; rolling?: boolean } = {}): Boxes {
  const { task, state, ctl, locked } = p;
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  // A new sub-step (or phase) starts in its first box.
  useEffect(() => setActive(null), [task.id, state.phase]);
  const current = active ?? opts.first ?? fields[0];
  const focus = (field: string) => {
    refs.current[field]?.focus({ preventScroll: true });
    setActive(field);
  };
  const write = (field: string, raw: string) => {
    const max = digits(field);
    const value = opts.rolling ? raw.slice(-max) : raw.slice(0, max);
    ctl.act({ do: 'input', field, value });
    // A full box hands on to the next (times, durations, remainders).
    if (!opts.rolling && value.length >= max && raw.length > (state.input[field] ?? '').length) {
      const next = fields[fields.indexOf(field) + 1];
      if (next) focus(next);
    }
  };
  const press = (key: string) => {
    const field = current;
    if (!field || locked) return;
    const cur = state.input[field] ?? '';
    if (key === 'back') {
      write(field, cur.slice(0, -1));
      focus(field);
      return;
    }
    if (!opts.rolling && cur.length >= digits(field)) {
      const next = fields[fields.indexOf(field) + 1];
      if (next) {
        focus(next);
        ctl.act({ do: 'input', field: next, value: ((state.input[next] ?? '') + key).slice(0, digits(next)) });
      }
      return;
    }
    focus(field);
    write(field, cur + key);
  };
  const box = (field: string, o: { label: string; digits: number; className?: string; placeholder?: string }) => (
    <input
      key={field}
      ref={(el) => {
        refs.current[field] = el;
      }}
      className={o.className ? `ms-box ${o.className}` : 'ms-box'}
      data-field={field}
      data-active={current === field || undefined}
      inputMode="none"
      autoComplete="off"
      maxLength={o.digits}
      placeholder={o.placeholder}
      aria-label={o.label}
      value={state.input[field] ?? ''}
      disabled={locked}
      onFocus={() => setActive(field)}
      onChange={(e) => write(field, e.currentTarget.value.replace(/\D/g, ''))}
    />
  );
  return { current, box, press };
}

/** The on-screen keypad: 1–9, 0 and delete. */
export function Keypad({ press, locked, locale }: { press(key: string): void; locked: boolean; locale: Locale }) {
  const T = tr(locale);
  return (
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
  );
}

/** Arrow keys inside a radio group move the choice (the host leaves arrows to radio groups). */
export function radioKeys(e: React.KeyboardEvent<HTMLElement>) {
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (!dir || items.length === 0) return;
  e.preventDefault();
  const next = items[(i + dir + items.length) % items.length]!;
  next.focus();
  next.click();
}

/** A row of choice chips (`role="radiogroup"`): the unit of a measure, am / pm. */
export function Chips({ label, items, value, onPick, locked, kind }: { label: string; items: { id: string; text: string }[]; value: string | undefined; onPick(id: string): void; locked: boolean; kind: 'unit' | 'ampm' }) {
  return (
    <div className="ms-units" role="radiogroup" aria-label={label} onKeyDown={radioKeys}>
      {items.map((it, i) => (
        <button
          key={it.id}
          type="button"
          role="radio"
          aria-checked={value === it.id}
          tabIndex={value === it.id || (!value && i === 0) ? 0 : -1}
          className="ms-chip ms-unit"
          {...{ [`data-${kind}`]: it.id }}
          disabled={locked}
          onClick={() => onPick(value === it.id ? '' : it.id)}
        >
          {it.text}
        </button>
      ))}
    </div>
  );
}
