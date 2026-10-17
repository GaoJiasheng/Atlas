/**
 * A decimal box (docs/29 X3): one box per answer (a `sentence` prints its
 * words and a box for each `?`; otherwise the work's sentence, `0.45 + 0.38
 * = ?`), `$` before the box for money, the unit after it for a measure, and
 * a keypad with a point key. The physical keyboard types digits and `.`
 * (`,` is ignored); a box starting with the point reads `0.` (`.35` is
 * written 0.35). Enter checks.
 */
import { renderRich } from '../../../../lib/rich-text';
import { inputSpecOf } from '../../lib/state';
import { decimalFields, workOf } from '../../lib/decimal-tasks';
import { resultUnit, workSentence } from '../../lib/decimal-working';
import { unitText, type Unit } from '../../lib/value';
import { t } from '../../../../i18n';
import { Keypad, tr, type InputProps } from './boxes';
import { useRef, useState } from 'react';

const DIGITS = 12;

export function DecimalInput(p: InputProps) {
  const { task, state, ctl, locale, locked } = p;
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const fields = decimalFields(spec);
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const current = active ?? fields[0]!;
  const write = (field: string, value: string) => ctl.act({ do: 'input', field, value });
  const press = (key: string) => {
    if (locked) return;
    const cur = state.input[current] ?? '';
    refs.current[current]?.focus({ preventScroll: true });
    if (key === 'back') write(current, cur.slice(0, -1));
    else if (cur.length < DIGITS) write(current, cur + key);
  };
  const w = workOf(task, spec);
  const unit = resultUnit(spec, w);
  const dollar = unit === 'dollar';
  const after = !unit || dollar ? null : unit === 'cent' ? t(locale, 'math.money.cents') : unitText(unit as Unit, locale);
  const box = (field: string, i: number) => (
    <span key={field} className="ms-input__dec">
      {dollar && <span className="ms-input__eq">$</span>}
      <input
        ref={(el) => {
          refs.current[field] = el;
        }}
        className="ms-box ms-box--decimal"
        data-field={field}
        data-active={current === field || undefined}
        inputMode="none"
        autoComplete="off"
        maxLength={DIGITS}
        aria-label={T('math.input.x') + (fields.length > 1 ? ` ${i + 1}` : '')}
        value={state.input[field] ?? ''}
        disabled={locked}
        onFocus={() => setActive(field)}
        onChange={(e) => write(field, e.currentTarget.value.replace(/,/g, ''))}
      />
      {after && <span className="ms-input__unit">{after}</span>}
    </span>
  );
  const sentence = spec.sentence ?? (w && task.kind === 'input' ? workSentence(w, spec, locale) : null);
  const parts = sentence ? sentence.split('?') : null;
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        {parts ? (
          parts.map((text, i) => (
            <span key={i} className="ms-input__part">
              {text.trim() && <span className="ms-input__eq">{renderRich(text.trim(), locale, { line: true })}</span>}
              {i < parts.length - 1 && fields[i] && box(fields[i]!, i)}
            </span>
          ))
        ) : (
          <span className="ms-input__row">{fields.map((f, i) => box(f, i))}</span>
        )}
      </div>
      <Keypad press={press} locked={locked} locale={locale} point />
    </div>
  );
}
