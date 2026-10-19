/**
 * The compound answer form (docs/32 §3.5 M6): a box for each unit of a
 * compound measure with the unit printed after it (`? m ? cm`, `? ℓ ? ml`),
 * like a duration's hours and minutes — a full box hands on to the next,
 * the small box left empty is 0 (`3 kg` = `3 kg 0 g`). A conversion prints
 * what is converted first (`{u:1250 ml} =`). With the keypad.
 */
import { renderRich } from '../../../../lib/rich-text';
import { inputSpecOf } from '../../lib/state';
import { compoundPairOf, fieldDigits } from '../../lib/forms';
import { convertSentence } from '../../lib/measure-working';
import { PAIR, unitText } from '../../lib/value';
import { Keypad, tr, useBoxes, type InputProps } from './boxes';

export function CompoundInput(p: InputProps) {
  const { task, locale, locked } = p;
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const pair = PAIR[compoundPairOf(spec)];
  const b = useBoxes(p, ['b', 's'], (f) => fieldDigits(spec, f));
  const head = convertSentence(spec)?.split('?')[0]?.trim();
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows ms-input__rows--whole">
        <span className="ms-input__row">
          {head && <span className="ms-input__eq">{renderRich(head, locale, { line: true })}</span>}
          {b.box('b', { label: `${T('math.input.big')} (${unitText(pair.big, locale)})`, digits: fieldDigits(spec, 'b'), className: 'ms-box--whole' })}
          <span className="ms-input__unit">{unitText(pair.big, locale)}</span>
          {b.box('s', { label: `${T('math.input.small')} (${unitText(pair.small, locale)})`, digits: fieldDigits(spec, 's'), className: 'ms-box--whole' })}
          <span className="ms-input__unit">{unitText(pair.small, locale)}</span>
        </span>
      </div>
      <Keypad press={b.press} locked={locked} locale={locale} />
    </div>
  );
}
