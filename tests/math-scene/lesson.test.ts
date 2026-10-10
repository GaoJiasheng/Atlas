/**
 * The real lesson (src/content/topics/fractions/data/lesson.json): every sub-step
 * and practice question is solved by its own `solve()`, every planned wrong
 * answer (`feedback.wrong[].sample`) is diagnosed as the misconception it is
 * filed under, and every wrong `choose` option shows its declared one
 * (docs/15 §4.8: the automated proof that each distractor gets the right feedback).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessonFile, type Task } from '../../src/engines/math-scene/schema';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, exampleFrames, exampleTask, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, phasesOf } from '../../src/engines/math-scene/lib/state';
import { lessonBeats } from '../../src/engines/math-scene/lib/beats';
import { add, sub, related, compare, toImproper, type Frac } from '../../src/engines/math-scene/lib/fraction';

const FILE = join(import.meta.dirname, '../../src/content/topics/fractions/data/lesson.json');
const lesson = lessonFile.parse(JSON.parse(readFileSync(FILE, 'utf8')));
const all: { where: string; task: Task; bridge: boolean }[] = [
  ...lesson.steps.flatMap((s) => s.tasks.map((task) => ({ where: s.id, task, bridge: !!s.bridge }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, bridge: false })),
];

describe('fractions lesson', () => {
  it('has 12 steps, 35 sub-steps and 8 practice questions', () => {
    expect(lesson.steps).toHaveLength(12);
    expect(lesson.steps.reduce((n, s) => n + s.tasks.length, 0)).toBe(35);
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind)).size).toBeGreaterThanOrEqual(5);
  });

  for (const { where, task } of all) {
    describe(`${where} / ${task.id} (${task.kind})`, () => {
      it('is solved by its own solution', () => {
        const solved = apply(task, solve(task));
        expect(solved.phase).toBe(phasesOf(task).length - 1);
        expect(check(task, solved)).toEqual({ ok: true, code: null });
      });

      it('starts unsolved', () => {
        expect(check(task, initialState(task)).ok).toBe(false);
      });

      for (const w of task.feedback.wrong) {
        it(`diagnoses its ${w.when} sample`, () => {
          expect(w.sample, `feedback.wrong "${w.when}" needs a sample`).toBeDefined();
          const state = sampleState(task, w.sample!);
          expect(state, `sample "${w.sample}" does not parse`).not.toBeNull();
          const r = check(task, state!);
          expect(r.ok).toBe(false);
          expect(r.code).toBe(w.when);
        });
      }

      if (task.kind === 'choose') {
        it('diagnoses every wrong option as declared', () => {
          const right = task.options.filter((o) => o.correct).map((o) => o.id);
          for (const o of task.options.filter((x) => !x.correct)) {
            expect(o.misconception, `option ${o.id} needs a misconception`).toBeDefined();
            const r = check(task, { ...initialState(task), chosen: [...(task.multi ? right.slice(0, -1) : []), o.id] });
            expect(r).toEqual({ ok: false, code: o.misconception });
          }
        });
      }

      if (task.example) {
        it('has an example that ends solved', () => {
          const ex = exampleTask(task)!;
          const frames = exampleFrames(task);
          expect(frames).toHaveLength(task.example!.say.length);
          expect(check(ex, frames.at(-1)!).ok).toBe(true);
        });
      }
    });
  }

  it('keeps P2 / P3 denominators within 12 and sums within one whole', () => {
    const sums = (t: Task): [Frac, Frac, '+' | '-'][] => {
      if (t.kind === 'build-sum') return [[t.a, t.b, t.op]];
      if (t.kind === 'input' && t.sum) return [[t.sum.a, t.sum.b, t.sum.op]];
      return [];
    };
    for (const { task, bridge } of all) {
      if (bridge) continue;
      for (const [a, b, op] of sums(task)) {
        const r = op === '+' ? add(a, b) : sub(a, b);
        expect(compare(r, { n: 0, d: 1 }) >= 0 && compare(r, { n: 1, d: 1 }) <= 0, `${task.id}: result within one whole`).toBe(true);
        expect(toImproper(a).d <= 12 && toImproper(b).d <= 12).toBe(true);
      }
    }
    for (const s of lesson.steps.filter((x) => x.id === 'adding-related' || x.id === 'subtracting-related')) {
      for (const t of s.tasks) for (const [a, b] of sums(t)) expect(related(a, b), `${t.id}: related denominators`).toBe(true);
    }
  });

  it('derives one beat per example line plus one per sub-step', () => {
    for (const s of lesson.steps) {
      const beats = lessonBeats(lesson, s.id, false, { en: 'Summary', zh: '小结' })!;
      const lines = s.tasks.reduce((n, t) => n + (t.example?.say.length ?? 0), 0);
      expect(beats).toHaveLength(lines + s.tasks.length);
      expect(beats.filter((b) => b.kind === 'try').map((b) => b.task)).toEqual(s.tasks.map((t) => t.id));
    }
    expect(lessonBeats(lesson, 'practice', true, { en: 'Summary', zh: '小结' })).toHaveLength(lesson.practice.length + 1);
  });
});
