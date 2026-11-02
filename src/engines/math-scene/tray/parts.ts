/** Whether the fraction check needs finger-sized stepper controls. */
import type { Task } from '../schema';

export function partsAreNarrow(task: Task | null, width: number): boolean {
  if (!task) return false;
  const m = task.model;
  const parts = m.kind === 'bar' || m.kind === 'circle' ? (m.parts ?? 1) : 1;
  const finest = task.kind === 'build-sum' && task.convert ? parts * task.convert : parts;
  return width / Math.max(1, finest) < 44;
}
