/**
 * The answer forms beyond whole numbers (docs/19 §3.3, docs/20 §3.4):
 *   remainder  `14 ÷ 4 =` [q] r [r] (an empty remainder box is 0)
 *   time12     [h] . [mm] and am / pm (the notation's separator and am / pm)
 *   face       [h] . [mm] (as a clock face reads, no am / pm)
 *   time24     [hh] : [mm]
 *   duration   [h] h [min] min, or [min] min [s] s
 * Each with the keypad; a full box hands on to the next.
 */
import { useContext } from 'react';
import { NotationContext } from '../../../../lib/rich-text';
import { inputSpecOf } from '../../lib/state';
import { durationBoxes, fieldDigits, valueFields } from '../../lib/forms';
import { ampmText, sep12, sep24 } from '../../lib/value';
import { Chips, Keypad, tr, useBoxes, type InputProps } from './boxes';

export function RemainderInput(p: InputProps) {
  const T = tr(p.locale);
  const spec = inputSpecOf(p.task)!;
  const b = useBoxes(p, ['q', 'r'], (f) => fieldDigits(spec, f));
  const op = spec.op;
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        <span className="ms-input__row">
          {op && op.kind === '÷' && !op.round && <span className="ms-input__eq">{`${op.a} ÷ ${op.b} =`}</span>}
          {b.box('q', { label: T('math.input.q'), digits: fieldDigits(spec, 'q'), className: 'ms-box--whole' })}
          <span className="ms-input__eq ms-input__r" aria-hidden="true">
            r
          </span>
          {b.box('r', { label: T('math.input.r'), digits: fieldDigits(spec, 'r') })}
        </span>
      </div>
      <Keypad press={b.press} locked={p.locked} locale={p.locale} />
    </div>
  );
}

export function TimeInput(p: InputProps) {
  const T = tr(p.locale);
  const notation = useContext(NotationContext);
  const spec = inputSpecOf(p.task)!;
  const fields = valueFields(spec);
  const b = useBoxes(p, fields, (f) => fieldDigits(spec, f));
  const h24 = spec.form === 'time24';
  const sep = h24 ? sep24(notation) || '' : sep12(notation);
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        <span className="ms-input__row ms-input__time">
          {fields.map((f, i) => (
            <span key={f} className="ms-input__part">
              {i > 0 && (
                <span className="ms-input__eq ms-input__sep" aria-hidden="true">
                  {sep}
                </span>
              )}
              {b.box(f, { label: T(f === 'h' ? (h24 ? 'math.input.hh' : 'math.input.h') : f === 'm' ? 'math.input.m' : 'math.input.s'), digits: fieldDigits(spec, f), placeholder: f === 'h' ? (h24 ? 'hh' : 'h') : f === 'm' ? 'mm' : 'ss' })}
            </span>
          ))}
        </span>
      </div>
      {spec.form === 'time12' && (
        <Chips
          kind="ampm"
          label={T('math.input.ampm')}
          items={[
            { id: 'am', text: ampmText(false, notation) },
            { id: 'pm', text: ampmText(true, notation) },
          ]}
          value={p.state.input.ap}
          onPick={(v) => p.ctl.act({ do: 'input', field: 'ap', value: v })}
          locked={p.locked}
        />
      )}
      <Keypad press={b.press} locked={p.locked} locale={p.locale} />
    </div>
  );
}

export function DurationInput(p: InputProps) {
  const T = tr(p.locale);
  const spec = inputSpecOf(p.task)!;
  const pair = durationBoxes(spec);
  const fields = pair === 'min-s' ? ['m', 's'] : ['h', 'm'];
  const b = useBoxes(p, fields, (f) => fieldDigits(spec, f));
  const unit = (f: string) => T(f === 'h' ? 'math.input.unitH' : f === 'm' ? 'math.input.unitMin' : 'math.input.unitS');
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        <span className="ms-input__row">
          {fields.map((f) => (
            <span key={f} className="ms-input__part">
              {b.box(f, { label: T(f === 'h' ? 'math.input.hours' : f === 'm' ? 'math.input.minutes' : 'math.input.seconds'), digits: fieldDigits(spec, f) })}
              <span className="ms-input__unit">{unit(f)}</span>
            </span>
          ))}
        </span>
      </div>
      <Keypad press={b.press} locked={p.locked} locale={p.locale} />
    </div>
  );
}
