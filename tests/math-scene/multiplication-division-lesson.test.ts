/**
 * The multiplication-and-division lesson (src/content/topics/multiplication-division/data/lesson.json,
 * docs/19): 12 steps of 3–5 beats (the last one going further), check pools
 * of 8–10, eight practice questions in six kinds; every task proved (its
 * solution checks right, it starts unsolved, every planned wrong answer and
 * wrong option is diagnosed as declared) and within its step's number limits;
 * every whole-number misconception planned by a check; the steps of the
 * 2, 3, 4, 5 and 10 tables use only those tables; remainders only where the
 * syllabus has them; the column method up to 3 digits by 1 digit (2 digits
 * only in the step that goes further).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { mathSceneData, WHOLE_OPS_CODES, type Model, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, taskIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';

const ROOT = join(import.meta.dirname, '../../src/content/topics/multiplication-division');
const json = (f: string) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const data = mathSceneData.parse({ lesson: json('lesson.json'), sources: json('sources.json'), glossary: json('glossary.json') });
const lesson = data.lesson;
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: { where: string; task: Task; limits: (typeof lesson.steps)[number]['limits'] }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, limits: s.limits }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, limits: lesson.steps.find((s) => s.id === q.revisit[0])?.limits })),
];

/** Steps of the 2, 3, 4, 5 and 10 tables (the first six). */
const EARLY = ['equal-groups', 'skip-counting', 'arrays', 'known-facts', 'sharing-and-grouping', 'fact-families'];
const TABLES = new Set([1, 2, 3, 4, 5, 10]);

/** Every multiplication or division fact a task works with: [a, b] where one of them must be a table number. */
function factsOf(task: Task): [number, number][] {
  const out: [number, number][] = [];
  const fromModel = (m: Model) => {
    if (m.kind !== 'array') return;
    for (const s of m.pair ?? [m]) {
      if (s.rows && s.cols) out.push([s.rows, s.cols]);
      if (s.groups && s.size) out.push([s.groups, s.size]);
    }
  };
  fromModel(task.model);
  if (task.kind === 'choose') task.options.forEach((o) => o.model && fromModel(o.model));
  if (task.kind === 'group') out.push([Math.ceil(task.total / task.k), task.k]);
  if (task.kind === 'arrange' || task.kind === 'split-array') out.push([task.rows, task.cols]);
  if (task.kind === 'skip-count') out.push([task.count, task.size]);
  const op = inputSpecOf(task)?.op;
  if (op) out.push(op.kind === '×' ? [op.a, op.b] : [op.b, Math.floor(op.a / op.b)]);
  return out;
}

describe('multiplication and division lesson', () => {
  it('has no lesson errors or warnings', () => {
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  it('has 12 steps (the last going further) of 3–5 beats, pools of 8–10 and 8 practice questions in six kinds', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual([...EARLY, 'tables-6-to-9', 'remainders', 'multiplying-tens', 'multiplying-in-columns', 'dividing-in-columns', 'two-digit-by-two-digit']);
    expect(lesson.steps.filter((s) => s.bridge).map((s) => s.id)).toEqual(['two-digit-by-two-digit']);
    for (const s of lesson.steps) {
      expect(s.beats.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.beats.length, s.id).toBeLessThanOrEqual(5);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
      expect(s.limits, `${s.id} limits`).toBeDefined();
    }
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind))).toEqual(new Set(['group', 'arrange', 'split-array', 'choose', 'input', 'share']));
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('plans a check for every whole-number misconception', () => {
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of WHOLE_OPS_CODES) expect(planned.has(code), code).toBe(true);
  });

  it('keeps the first six steps to the 2, 3, 4, 5 and 10 tables', () => {
    for (const { where, task } of all.filter((x) => EARLY.includes(x.where)))
      for (const [a, b] of factsOf(task)) expect(TABLES.has(a) || TABLES.has(b), `${where} / ${task.id}: ${a} and ${b}`).toBe(true);
  });

  it('has remainders only in the remainder and column-division steps and the practice', () => {
    for (const { where, task } of all) {
      const spec = inputSpecOf(task);
      const remainder = spec?.form === 'remainder' || !!spec?.op?.round || (task.model.kind === 'array' && !!task.model.extra) || (task.kind === 'group' && task.by === 'pack' && task.total % task.k !== 0);
      if (remainder) expect(['remainders', 'dividing-in-columns', 'practice'], `${where} / ${task.id}`).toContain(where);
    }
  });

  it('works in columns up to 3 digits by 1 digit, by 2 digits only going further', () => {
    for (const { where, task } of all.filter((x) => x.task.model.kind === 'blocks')) {
      const op = inputSpecOf(task)?.op;
      const columns = task.model.kind === 'blocks' ? task.model.column : undefined;
      for (const c of [op, columns ? { kind: columns.op, a: columns.a, b: columns.b } : undefined]) {
        if (!c) continue;
        expect(c.a, `${where} / ${task.id}`).toBeLessThanOrEqual(999);
        if (where !== 'two-digit-by-two-digit') expect(c.b, `${where} / ${task.id}`).toBeLessThanOrEqual(c.kind === '÷' ? 9 : 10);
      }
    }
  });

  for (const { where, task, limits } of all) {
    it(`${where} / ${task.id} (${task.kind}) passes the proof and the content rules, within its step's limits`, () => {
      expect(proveTask(task)).toEqual([]);
      const bridge = lesson.steps.find((s) => s.id === where)?.bridge ?? false;
      expect(taskIssues(task, task.id, { bridge, practice: where === 'practice', limits }).filter((i) => i.level === 'error')).toEqual([]);
    });
  }
});
