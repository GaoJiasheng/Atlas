/**
 * The tray of a chart check (docs/77 §3.2, docs/78 §3.1). `fill-table`: a
 * box for each "?" of the table, named by its row and column, in reading
 * order (Tab or Enter to the next, the keypad writes into the one in use);
 * what is written shows in the table on the stage. `even-out`: how many
 * blocks have moved and "Start again" (the towers themselves are buttons on
 * the stage), then the average's box below.
 */
import type { KeyboardEvent } from 'react';
import { tx } from '../../../i18n';
import { Keypad, tr, useBoxes, type InputProps } from './inputs/boxes';
import { CELL_DIGITS, blocksMoved, fillBlanks, level } from '../lib/data-tasks';
import { taskChart } from '../lib/diagnose/data';

export function TableInput(p: InputProps) {
  const { task, locale, locked } = p;
  const T = tr(locale);
  const c = taskChart(task);
  const blanks = task.kind === 'fill-table' ? fillBlanks(task) : [];
  const fields = blanks.map((b) => b.key);
  const b = useBoxes(p, fields, () => CELL_DIGITS, { rolling: true });
  if (!c?.table) return null;
  const name = (row: string, col: string) => {
    const r = c.table!.rows.find((x) => x.id === row);
    const k = c.table!.cols.find((x) => x.id === col);
    return T('math.chart.cell', { row: r ? tx(r.label, locale) : row, col: k ? tx(k.label, locale) : col });
  };
  // Enter in a cell that is not the last goes on to the next one (the last checks, as everywhere).
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || !(e.target instanceof HTMLInputElement)) return;
    const i = fields.indexOf(e.target.dataset.field ?? '');
    if (i < 0 || i === fields.length - 1) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget.querySelector(`[data-field="${fields[i + 1]}"]`) as HTMLInputElement | null)?.focus();
  };
  return (
    <div className="ms-input ms-input--table" data-keys="own" onKeyDown={onKey}>
      <div className="ms-input__rows ms-input__rows--table">
        {blanks.map((x) => (
          <label key={x.key} className="ms-input__cell">
            <span className="ms-input__eq">{name(x.row, x.col)}</span>
            {b.box(x.key, { label: name(x.row, x.col), digits: CELL_DIGITS, className: 'ms-box--whole' })}
          </label>
        ))}
      </div>
      <Keypad press={b.press} locked={locked} locale={locale} />
    </div>
  );
}

export function EvenOutControls(p: InputProps) {
  const { task, state, ctl, locale, locked } = p;
  const T = tr(locale);
  if (task.kind !== 'even-out' || !state.towers) return null;
  const held = state.held;
  const c = taskChart(task);
  const heldName = held !== null && c?.cats?.[held] ? tx(c.cats[held]!.label, locale) : null;
  return (
    <div className="ms-tray__row ms-tray__row--wrap ms-evenout">
      <p className="ms-tray__help">{heldName ? T('math.chart.held', { name: heldName }) : T('math.chart.towersHelp')}</p>
      <span className="ms-tray__count" aria-live="polite">
        {T(level(state.towers) ? 'math.chart.levelMoved' : 'math.chart.moved', { n: blocksMoved(task, state.towers) })}
      </span>
      {!locked && (
        <button type="button" className="ms-btn ms-btn--ghost" data-evenout-reset="" disabled={blocksMoved(task, state.towers) === 0 && held === null} onClick={() => ctl.act({ do: 'ereset' })}>
          {T('math.chart.reset')}
        </button>
      )}
    </div>
  );
}
