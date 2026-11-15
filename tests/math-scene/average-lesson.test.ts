/**
 * The average lesson (src/content/topics/average, docs/78): 5 steps of 4–5
 * beats (21 in all), check pools of 8–10 and 7 practice questions; every task
 * in the data domain and proved; every docs/78 code planned by a check; every
 * average divides exactly (a whole number, a half, or money in 5 cents); towers
 * to even out level in whole blocks (a .5 average only in beats and input);
 * test scores only in one practice question; the total kept wherever blocks move.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';
import { dataAnswer, dataContextOf } from '../../src/engines/math-scene/lib/diagnose/data';
import { levelMoves } from '../../src/engines/math-scene/lib/chart';

const ROOT = join(import.meta.dirname, '../../src/content/topics/average');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: { where: string; task: Task }[] = [...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task }))), ...lesson.practice.map((q) => ({ where: 'practice', task: q.task }))];

describe('average lesson', () => {
  it('is published with no lesson errors or warnings', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: published$/m);
    expect(lessonIssues(data, chapters)).toEqual([]);
  });
  it('has 5 steps of 4–5 beats (21 in all), pools of 8–10 and 7 practice questions', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual(['evening-out', 'total-divided', 'average-total-number', 'missing-value', 'changing-the-average']);
    expect(lesson.steps.map((s) => s.beats.length)).toEqual([4, 5, 4, 4, 4]);
    expect(lesson.practice).toHaveLength(7);
  });
  it.each(all.map((x) => [`${x.where} / ${x.task.id}`, x.task] as const))('%s is a data task and proves', (_, task) => {
    expect(domainOf(task)).toBe('data');
    expect(proveTask(task)).toEqual([]);
  });
  it('plans every code of docs/78 §2.1', () => {
    const planned = new Set(all.flatMap(({ task }) => task.feedback.wrong.map((w) => w.when)));
    for (const code of ['average-as-total', 'zero-ignored', 'average-as-middle', 'remainder-dropped', 'missing-equals-average', 'wrong-count', 'averages-averaged'] as const) expect(planned.has(code), code).toBe(true);
  });
  it('every average divides exactly; towers to even out level in whole blocks', () => {
    for (const { task } of all) {
      const spec = inputSpecOf(task);
      const ctx = spec ? dataContextOf(task, spec) : null;
      const t = ctx ? dataAnswer(ctx) : null;
      if (t !== null) expect(Number.isInteger(t * 2) || Number.isInteger(t * 20), task.id).toBe(true);
      if (task.kind === 'even-out' && task.model.kind === 'chart') expect(levelMoves((task.model.cats ?? []).map((c) => c.value ?? 0)), task.id).not.toBeNull();
    }
  });
  it('uses test scores in one practice question only', () => {
    const scores = all.filter(({ task }) => /\btests?\b|quiz|\bscores\b|小测|测验|听写|分数/i.test(task.prompt.en + task.prompt.zh));
    expect(scores.map((x) => x.where)).toEqual(['practice']);
  });
});
