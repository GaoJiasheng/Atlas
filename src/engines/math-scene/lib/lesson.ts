/**
 * Where things are in the lesson (docs/15 §4.2, §4.3): the chapter a sub-step
 * belongs to, the tasks of a chapter, and the model views a sub-step can be
 * switched between in the VIEW group. Pure.
 */
import type { Lesson, ModelView, Question, Step, Task } from '../schema';

export type Place =
  | { kind: 'step'; step: Step; tasks: Task[] }
  | { kind: 'practice'; questions: Question[]; tasks: Task[] }
  | { kind: 'background' };

/** What a chapter is in the lesson. */
export function locate(lesson: Lesson, chapter: string | null, practice: boolean): Place {
  if (practice) return { kind: 'practice', questions: lesson.practice, tasks: lesson.practice.map((q) => q.task) };
  const step = lesson.steps.find((s) => s.id === chapter);
  return step ? { kind: 'step', step, tasks: step.tasks } : { kind: 'background' };
}

/** The chapter and 0-based index of a sub-step or practice question. */
export function findTask(lesson: Lesson, id: string, practiceChapter: string | null): { chapter: string; index: number } | null {
  for (const s of lesson.steps) {
    const index = s.tasks.findIndex((t) => t.id === id);
    if (index >= 0) return { chapter: s.id, index };
  }
  const q = lesson.practice.findIndex((x) => x.id === id);
  return q >= 0 && practiceChapter ? { chapter: practiceChapter, index: q } : null;
}

/** The view a task's own model is drawn in. */
export function ownView(task: Task): ModelView {
  return task.model.kind;
}

const SINGLE_KINDS = new Set(['shade', 'fold', 'split', 'merge', 'input', 'build-sum']);

/** Can `task` be drawn in `view` (same numbers, same marks)? */
export function canShow(task: Task, view: ModelView): boolean {
  const m = task.model;
  if (view === m.kind) return true;
  const singleBar = m.kind === 'bar' && !m.rows && (m.wholes ?? 1) === 1 && m.parts !== null && !m.cuts && !m.diagonal;
  if ((singleBar || m.kind === 'circle') && SINGLE_KINDS.has(task.kind)) {
    if (view === 'bar' || view === 'circle') return true;
    if (view === 'numberline') return task.kind === 'shade' || task.kind === 'input';
  }
  if (task.kind === 'place' && m.kind === 'numberline' && m.from === 0 && m.to === 1) return view === 'bar';
  if (task.kind === 'compare') {
    if (view === 'wall') return true;
    if (view === 'bar') return true;
  }
  return false;
}

/** The VIEW group of a sub-step: the step's views it can be drawn in, its own first when the step does not list it. */
export function viewsFor(step: Step | null, task: Task): ModelView[] {
  const own = ownView(task);
  const listed = (step?.views ?? [own]).filter((v) => canShow(task, v));
  return listed.includes(own) ? listed : [own, ...listed];
}
