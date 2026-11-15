/**
 * The angles lesson (src/content/topics/angles, docs/76): 11 steps of 4–5 beats (45 in all), pools of 9–10 and 8
 * practice questions; every task filed under the angles domain and proved; every `angles` code planned by a check
 * and named by a beat's step; no degrees in steps 01–04; drawings not to scale drawn at least 12° off.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { ANGLES_CODES, mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { declaredCodes } from '../../src/engines/math-scene/lib/check';

const ROOT = join(import.meta.dirname, '../../src/content/topics/angles');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const files = readdirSync(join(ROOT, 'chapters'));
const chapters: ChapterInfo[] = files.map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: { where: string; task: Task }[] = [...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task }))), ...lesson.practice.map((q) => ({ where: 'practice', task: q.task }))];

describe('angles lesson', () => {
  it('has no lesson errors or warnings', () => {
    expect(lessonIssues(data, chapters)).toEqual([]);
  });
  it('has 11 steps, 45 beats, pools of 9–10 and 8 practice questions', () => {
    expect(lesson.steps).toHaveLength(11);
    expect(lesson.steps.reduce((n, s) => n + s.beats.length, 0)).toBe(45);
    for (const s of lesson.steps) expect(s.pool.length).toBeGreaterThanOrEqual(9);
    expect(lesson.practice).toHaveLength(8);
  });
  it('proves every task, all in the angles domain', () => {
    for (const { where, task } of all) {
      expect(domainOf(task), `${where}/${task.id}`).toBe('angles');
      expect(proveTask(task), `${where}/${task.id}`).toEqual([]);
    }
  });
  it('plans every angles code in some check', () => {
    const planned = new Set(all.flatMap(({ task }) => declaredCodes(task)));
    for (const c of [...ANGLES_CODES, 'read-end-mark']) expect(planned.has(c as never), c).toBe(true);
  });
  it('writes no degrees in steps 01–04 (beats and chapters)', () => {
    for (const s of lesson.steps.slice(0, 4)) expect(JSON.stringify(s)).not.toContain('°');
    for (const f of files.filter((x) => /^0[1-4]-/.test(x))) expect(readFileSync(join(ROOT, 'chapters', f), 'utf8')).not.toContain('°');
  });
  it('names no school level in the chapters', () => {
    for (const f of files) expect(readFileSync(join(ROOT, 'chapters', f), 'utf8')).not.toMatch(/\bP[1-6]\b|Primary (One|Two|Three|Four|Five|Six)|小[一二三四五六]/);
  });
});
