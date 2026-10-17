/**
 * Whole-number boxes (docs/19 §3.3, docs/21 §3.2): one box of 1–5 digits;
 * a number sentence printed with a box for each `?` (`2 × 8 = ?, 1 × 8 = ?`,
 * `? + ? = ?`), in order; the fact being worked printed round the box when
 * there is no sentence (`4 × 7 = ?`, `? × 6 = 42`); on the grid, what is
 * measured before the box (`area =`) and its unit after it, or a measure's
 * unit chips (cm, cm², m, m²). With the keypad.
 */
import { t } from '../../../../i18n';
import { boxDigits, inputSpecOf } from '../../lib/state';
import { inputFields } from '../../lib/check';
import { askOf } from '../../lib/diagnose/measure';
import { squared, unitText, type Unit } from '../../lib/value';
import type { InputSpec } from '../../schema';
import { Chips, Keypad, tr, useBoxes, type InputProps } from './boxes';

/** The number sentence an `op` prints round its box: `4 × 7 = ?`, `? × 6 = 42`, `35 ÷ 5 = ?` (a word problem's has none). */
export function opSentence(spec: InputSpec): string | null {
  const op = spec.op;
  if (!op || op.round) return null;
  if (op.kind === '÷') return `${op.a} ÷ ${op.b} = ?`;
  const c = op.a * op.b;
  if (op.missing === 'a') return `? × ${op.b} = ${c}`;
  if (op.missing === 'b') return `${op.a} × ? = ${c}`;
  return `${op.a} × ${op.b} = ?`;
}

export function WholeInput(p: InputProps) {
  const { task, state, locale, locked } = p;
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const fields = inputFields(spec);
  const b = useBoxes(p, fields, (f) => boxDigits(spec, f), { rolling: true });
  const m = task.model;
  const grid = m.kind === 'grid';
  const gridUnit = m.kind === 'grid' ? m.unit : 'unit';
  const ask = askOf(task, spec)?.ask;
  const printed: Unit | null = spec.unit ?? (grid ? (ask === 'area' ? squared(gridUnit) : gridUnit) : null);
  const label = (i: number) => (ask ? t(locale, `math.grid.${ask}`) : T('math.input.w')) + (fields.length > 1 ? ` ${i + 1}` : '');
  const box = (field: string, i: number) => b.box(field, { label: label(i), digits: boxDigits(spec, field), className: 'ms-box--whole' });
  // A sentence prints its words and operators with a box for each `?`.
  const sentence = spec.sentence ?? (task.kind === 'split-figure' || task.kind === 'split-array' ? '? + ? = ?' : (opSentence(spec) ?? null));
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
        {spec.form !== 'measure' && printed && <span className="ms-input__unit">{unitText(printed, locale)}</span>}
      </div>
      {spec.form === 'measure' && (
        <Chips kind="unit" label={T('math.tray.unit')} items={units.map((u) => ({ id: u, text: unitText(u, locale) }))} value={state.input.u} onPick={(u) => p.ctl.act({ do: 'input', field: 'u', value: u })} locked={locked} />
      )}
      <Keypad press={b.press} locked={locked} locale={locale} />
    </div>
  );
}
