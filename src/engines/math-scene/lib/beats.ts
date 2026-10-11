/**
 * Presentation beats of the lesson (docs/15 §4.7, §10), from the data so
 * authors keep one copy: a step gives its explanation beats (the caption is
 * the beat's own) and then its check (the presentation stops there with the
 * answer controls open; auto-play waits until it is answered, shown or
 * skipped); the practice gives one beat per question and a summary beat; the
 * background chapter keeps the core's default beat (its summary). The same
 * list, without the summary, is the chapter axis's ticks. Pure.
 */
import type { BilingualText } from '../../../i18n';
import type { Lesson } from '../schema';

export interface LessonBeat {
  caption: BilingualText;
  /** `explain`: an explanation beat · `check`: the chapter's check · `question`: a practice question · `summary`: the practice summary. */
  kind: 'explain' | 'check' | 'question' | 'summary';
  /** Position in the chapter (= the store's `beat`; the summary is one past the last question). */
  index: number;
}

/** Beats of one chapter: a step, the practice (when `practice` is set), else none (the core's default beat). */
export function lessonBeats(lesson: Lesson, chapter: string, practice: boolean, captions: { check: BilingualText; summary: BilingualText }): LessonBeat[] | undefined {
  if (practice) {
    return [
      ...lesson.practice.map((q, index): LessonBeat => ({ caption: q.task.prompt, kind: 'question', index })),
      { caption: captions.summary, kind: 'summary', index: lesson.practice.length },
    ];
  }
  const step = lesson.steps.find((s) => s.id === chapter);
  if (!step) return undefined;
  return [...step.beats.map((b, index): LessonBeat => ({ caption: b.caption, kind: 'explain', index })), { caption: captions.check, kind: 'check', index: step.beats.length }];
}
