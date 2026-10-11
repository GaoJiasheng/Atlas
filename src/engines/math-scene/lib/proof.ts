/**
 * The proof a task is sound (docs/15 §4.8): its own solution checks right,
 * it does not start right, every planned wrong answer (`feedback.wrong[].sample`)
 * is diagnosed as the misconception it is filed under, and every wrong
 * `choose` option shows its declared one. Shared by the lesson's unit test
 * and `scripts/math/check-pool.ts` (authoring drafts). Pure.
 */
import type { Task } from '../schema';
import { check } from './check';
import { apply, sampleState, solve } from './solve';
import { initialState, phasesOf } from './state';

/** What is wrong with a task (empty = sound). */
export function proveTask(task: Task): string[] {
  const out: string[] = [];
  const solved = apply(task, solve(task));
  if (solved.phase !== phasesOf(task).length - 1) out.push('its solution does not reach the last phase');
  else if (!check(task, solved).ok) out.push('its solution does not check right');
  if (check(task, initialState(task)).ok) out.push('it starts already right');
  for (const w of task.feedback.wrong) {
    if (!w.sample) {
      out.push(`feedback.wrong "${w.when}" has no sample`);
      continue;
    }
    const state = sampleState(task, w.sample);
    if (!state) {
      out.push(`feedback.wrong "${w.when}": sample "${w.sample}" does not parse for a ${task.kind} task`);
      continue;
    }
    const r = check(task, state);
    if (r.ok) out.push(`feedback.wrong "${w.when}": sample "${w.sample}" checks right`);
    else if (r.code !== w.when) out.push(`feedback.wrong "${w.when}": sample "${w.sample}" is diagnosed as ${r.code ?? 'nothing'}`);
  }
  if (task.kind === 'choose') {
    const right = task.options.filter((o) => o.correct).map((o) => o.id);
    for (const o of task.options.filter((x) => !x.correct)) {
      const r = check(task, { ...initialState(task), chosen: [...(task.multi ? right.slice(0, -1) : []), o.id] });
      if (r.ok || r.code !== (o.misconception ?? null)) out.push(`option "${o.id}" is diagnosed as ${r.ok ? 'right' : (r.code ?? 'nothing')}, declared ${o.misconception ?? 'nothing'}`);
    }
  }
  return out;
}
