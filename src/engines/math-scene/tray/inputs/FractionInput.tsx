/**
 * Fraction boxes (docs/15 §4.4): a numerator over a denominator (and a whole
 * number for a mixed number), one written fraction per answer joined by `=`,
 * the printed parts of a renaming (`2/3 = ?/12`), with the keypad. A plain
 * fraction starts in its denominator (count the whole first, S11).
 */
import { renderRich } from '../../../../lib/rich-text';
import { inputSpecOf } from '../../lib/state';
import { inputRows } from '../../lib/check';
import { formatFrac } from '../../lib/fraction';
import { Keypad, tr, useBoxes, type InputProps } from './boxes';

export function FractionInput(p: InputProps) {
  const { task, locale } = p;
  const T = tr(locale);
  const spec = inputSpecOf(task)!;
  const rows = inputRows(spec);
  const fields = rows.flatMap((r) => r.slots.flatMap((s) => (s.field ? [s.field] : [])));
  const first = fields.includes('d') && !fields.includes('w') ? 'd' : fields[0];
  const b = useBoxes(p, fields, () => 2, { first, rolling: true });
  const slotLabel = (slot: string, i: number) => T(`math.input.${slot as 'n' | 'd' | 'w'}`) + (rows.length > 1 ? ` ${i + 1}` : '');
  const cell = (field: string | null, printed: number | null, slot: string, i: number) =>
    field ? (
      b.box(field, { label: slotLabel(slot, i), digits: 2 })
    ) : (
      <span key={`p${slot}${i}`} className="ms-box ms-box--printed" aria-label={`${slotLabel(slot, i)}: ${printed}`}>
        {printed}
      </span>
    );
  return (
    <div className="ms-input" data-keys="own">
      <div className="ms-input__rows">
        {spec.from && rows.length > 1 && (
          <>
            <span className="ms-input__given">{renderRich(`{${formatFrac(spec.from)}}`, locale)}</span>
            <span className="ms-input__eq">=</span>
          </>
        )}
        {rows.map((r, i) => {
          const w = r.slots.find((s) => s.slot === 'w');
          const n = r.slots.find((s) => s.slot === 'n');
          const d = r.slots.find((s) => s.slot === 'd');
          return (
            <span key={i} className="ms-input__row">
              {i > 0 && <span className="ms-input__eq">=</span>}
              {w && cell(w.field, w.printed, 'w', i)}
              {n && d && (
                <span className="ms-input__frac">
                  {cell(n.field, n.printed, 'n', i)}
                  <i aria-hidden="true" />
                  {cell(d.field, d.printed, 'd', i)}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <Keypad press={b.press} locked={p.locked} locale={locale} />
    </div>
  );
}
