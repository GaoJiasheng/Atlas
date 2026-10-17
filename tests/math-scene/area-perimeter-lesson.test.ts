/**
 * The area-and-perimeter lesson (src/content/topics/area-perimeter/data/lesson.json,
 * docs/21): 11 steps of 3–5 beats on the grid, check pools of 8–10, eight
 * practice questions in six kinds; every task proved (its solution checks
 * right, it starts unsolved, every planned wrong answer and wrong option is
 * diagnosed as declared), every written answer equal to the figure's own
 * measure, every task within its step's number limits, and no task asking
 * for a cm² ↔ m² conversion.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessonFile, MEASURE_CODES, type Task } from '../../src/engines/math-scene/schema';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { answersOf, gridAnswer } from '../../src/engines/math-scene/lib/check';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';
import { askOf } from '../../src/engines/math-scene/lib/diagnose/measure';
import { isAreaUnit, squared } from '../../src/engines/math-scene/lib/value';
import { taskIssues } from '../../src/engines/math-scene/validate';

const FILE = join(import.meta.dirname, '../../src/content/topics/area-perimeter/data/lesson.json');
const lesson = lessonFile.parse(JSON.parse(readFileSync(FILE, 'utf8')));
const all: { where: string; task: Task; limits: (typeof lesson.steps)[number]['limits'] }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, limits: s.limits }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, limits: lesson.steps.find((s) => s.id === q.revisit[0])?.limits })),
];

describe('area and perimeter lesson', () => {
  it('has 11 steps (the last four going further) of 3–5 grid beats, pools of 8–10 and 8 practice questions', () => {
    expect(lesson.steps).toHaveLength(11);
    expect(lesson.steps.filter((s) => s.bridge).map((s) => s.id)).toEqual(['missing-side', 'square-side', 'composite-area', 'composite-perimeter']);
    for (const s of lesson.steps) {
      expect(s.beats.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.beats.length, s.id).toBeLessThanOrEqual(5);
      expect(s.beats.every((b) => b.model.kind === 'grid'), s.id).toBe(true);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
    }
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind))).toEqual(new Set(['count-squares', 'trace-perimeter', 'input', 'draw-rectangle', 'choose', 'split-figure']));
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('plans a beat or a check for every misconception of the domain', () => {
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of MEASURE_CODES) expect(planned.has(code), code).toBe(true);
  });

  for (const { where, task, limits } of all) {
    describe(`${where} / ${task.id} (${task.kind})`, () => {
      it('passes the proof and the content rules (step limits included)', () => {
        expect(proveTask(task)).toEqual([]);
        expect(taskIssues(task, task.id, { bridge: false, practice: where === 'practice', limits }).filter((i) => i.level === 'error')).toEqual([]);
      });

      it('writes the figure’s own measure, in its own kind of unit', () => {
        const spec = inputSpecOf(task);
        const ctx = askOf(task, spec);
        if (!spec || !ctx || task.kind === 'split-figure') return;
        expect(answersOf(spec)[0]!.n).toBe(gridAnswer(task));
        if (spec.unit && spec.unit !== 'dollar' && task.model.kind === 'grid') {
          expect(isAreaUnit(spec.unit)).toBe(ctx.ask === 'area');
          expect(spec.unit === task.model.unit || spec.unit === squared(task.model.unit)).toBe(true);
        }
      });
    });
  }
});
