/**
 * The written part of a check (docs/19 §3.0 G2): the boxes its answer form
 * needs — fraction boxes; whole numbers (a sentence, a fact, a measure's unit
 * chips, the grid's); a quotient and remainder; a time of day in 12-hour time
 * with am / pm, as a clock face reads it, or in 24-hour time; a duration.
 */
import { inputSpecOf } from '../../lib/state';
import { usesValueBoxes } from '../../lib/check';
import { isWholeForm } from '../../lib/forms';
import type { InputProps } from './boxes';
import { FractionInput } from './FractionInput';
import { WholeInput } from './WholeInput';
import { DurationInput, RemainderInput, TimeInput } from './ValueInputs';

export function AnswerInput(p: InputProps) {
  const spec = inputSpecOf(p.task);
  if (!spec) return null;
  if (p.task.model.kind === 'grid') return <WholeInput {...p} />;
  if (!usesValueBoxes(p.task, spec)) return <FractionInput {...p} />;
  if (isWholeForm(spec.form)) return <WholeInput {...p} />;
  if (spec.form === 'remainder') return <RemainderInput {...p} />;
  if (spec.form === 'duration') return <DurationInput {...p} />;
  return <TimeInput {...p} />;
}
