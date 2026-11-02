/** The time shown by a timeline's optional clock, without loading its drawing. */
import type { TimelineSpec, Task } from '../schema';
import type { TaskState } from '../lib/state';
import { hopEnd, rangeOf } from '../lib/timeline';

export function timelineNow(m: TimelineSpec, task: Task | null | undefined, state: TaskState | null | undefined): number {
  if (task && state && task.kind === 'duration') return hopEnd(task, state.hops) ?? rangeOf(m).from;
  // A beat's clock follows its latest jump to where it landed; without jumps, the last mark.
  return m.jumps?.at(-1)?.[1] ?? m.marks?.at(-1)?.at ?? rangeOf(m).from;
}
