/**
 * Presentation beats of the lesson (docs/15 §4.7), derived from the data so
 * authors keep one copy: every sub-step gives one beat per line of its
 * example (`example.say`: the engine plays a share of the example's solution)
 * and then one "your turn" beat (the sub-step's own model; the caption is its
 * prompt; the child answers on the stage, auto-play waits). The practice
 * chapter gives one beat per question and a summary beat; the background
 * chapter keeps the core's default beat (its summary). Pure.
 */
import type { BilingualText } from '../../../i18n';
import type { Lesson, Task } from '../schema';

export interface LessonBeat {
  caption: BilingualText;
  /** `example`: watch a line of the example · `try`: the child's turn · `summary`: the practice summary. */
  kind: 'example' | 'try' | 'summary';
  /** The sub-step (or question) the beat belongs to (`null` for the summary). */
  task: string | null;
  /** 0-based position of the sub-step in its step (or of the question). */
  index: number;
  /** Example line (0-based) for `example` beats. */
  line?: number;
}

/** The steps' and the practice's tasks by chapter id. */
export function chapterTasks(lesson: Lesson, chapter: string): Task[] | null {
  const step = lesson.steps.find((s) => s.id === chapter);
  if (step) return step.tasks;
  return null;
}

/** Beats of one chapter: a step, the practice (when `practice` is set), else none (the core's default beat). */
export function lessonBeats(lesson: Lesson, chapter: string, practice: boolean, summaryCaption: BilingualText): LessonBeat[] | undefined {
  if (practice) {
    return [
      ...lesson.practice.map((q, index): LessonBeat => ({ caption: q.task.prompt, kind: 'try', task: q.id, index })),
      { caption: summaryCaption, kind: 'summary', task: null, index: lesson.practice.length },
    ];
  }
  const tasks = chapterTasks(lesson, chapter);
  if (!tasks) return undefined;
  return tasks.flatMap((task, index): LessonBeat[] => [
    ...(task.example?.say ?? []).map((caption, line): LessonBeat => ({ caption, kind: 'example', task: task.id, index, line })),
    { caption: task.prompt, kind: 'try', task: task.id, index },
  ]);
}
