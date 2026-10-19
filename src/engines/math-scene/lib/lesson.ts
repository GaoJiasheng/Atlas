/**
 * Where things are in the lesson (docs/15 §4.2, §10): what a chapter is (a
 * step with its beats and check pool, the practice, or the background), what
 * a beat of it shows (an explanation beat, the check, a practice question),
 * where a pool task lives, and the model views a task can be switched between
 * in the VIEW group. Pure.
 */
import type { Beat, Lesson, ModelView, Question, Step, Task } from '../schema';
import { isDecimalTask } from './decimal-tasks';
import { decimalViewModel } from './decimal-views';

export type Place =
  | { kind: 'step'; step: Step }
  | { kind: 'practice'; questions: Question[] }
  | { kind: 'background' };

/** What a chapter is in the lesson. */
export function locate(lesson: Lesson, chapter: string | null, practice: boolean): Place {
  if (practice) return { kind: 'practice', questions: lesson.practice };
  const step = lesson.steps.find((s) => s.id === chapter);
  return step ? { kind: 'step', step } : { kind: 'background' };
}

/** The beats of a chapter on the axis: a step's explanation beats + its check, the practice questions, the background's one. */
export function beatCount(place: Place): number {
  if (place.kind === 'step') return place.step.beats.length + 1;
  if (place.kind === 'practice') return place.questions.length;
  return 1;
}

export type BeatSlot =
  | { kind: 'explain'; index: number; beat: Beat }
  | { kind: 'check'; index: number }
  | { kind: 'question'; index: number; question: Question }
  | { kind: 'background'; index: 0 };

/** What beat `i` (clamped) of a chapter shows. */
export function beatSlot(place: Place, i: number): BeatSlot {
  const n = beatCount(place);
  const index = Math.min(Math.max(0, Math.floor(i)), n - 1);
  if (place.kind === 'step') return index < place.step.beats.length ? { kind: 'explain', index, beat: place.step.beats[index]! } : { kind: 'check', index };
  if (place.kind === 'practice') return { kind: 'question', index, question: place.questions[index]! };
  return { kind: 'background', index: 0 };
}

/** The step and pool index of a pool task, or the practice index of a question. */
export function findTask(lesson: Lesson, id: string): { step: string; pool: number } | { practice: number } | null {
  for (const s of lesson.steps) {
    const pool = s.pool.findIndex((t) => t.id === id);
    if (pool >= 0) return { step: s.id, pool };
  }
  const q = lesson.practice.findIndex((x) => x.id === id);
  return q >= 0 ? { practice: q } : null;
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
  // A dial or a jug to read or to set: its scale straightened, the number line it is (docs/32 §3.7).
  if (view === 'straight') return m.kind === 'instrument' && (task.kind === 'read-scale' || task.kind === 'set-scale') && !m.pair && !m.set && (m.type === 'dial' || m.type === 'jug') && m.scale && !!m.to;
  if (m.kind === 'instrument') return false;
  // Two decimals compared: the grids, the chart or the line, as far as they can draw them (docs/29 X10).
  if (isDecimalTask(task)) return task.kind === 'compare' && decimalViewModel(task, view, false) !== null;
  if (m.kind === 'grid' || view === 'grid') return false;
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

/** The VIEW group of a task: the step's views it can be drawn in, its own first when the step does not list it. */
export function viewsFor(step: Step | null, task: Task): ModelView[] {
  const own = ownView(task);
  const listed = (step?.views ?? [own]).filter((v) => canShow(task, v));
  const views = listed.includes(own) ? listed : [own, ...listed];
  // A dial or a jug always offers its straightened scale.
  return canShow(task, 'straight') && !views.includes('straight') ? [...views, 'straight'] : views;
}
