/**
 * The line symmetry lesson (src/content/topics/symmetry, docs/79): 5 steps of 4 beats, check pools
 * of 9–10 and 7 practice questions; every task filed under the symmetry domain and proved (its
 * solution checks right, it starts unsolved, every planned wrong answer and wrong option diagnosed
 * as declared); every `symmetry` misconception planned by a check and shown by a beat's model;
 * completions only on lines up or across (D8, Q1); no school level in the chapters.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { SYMMETRY_CODES, mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { declaredCodes } from '../../src/engines/math-scene/lib/check';
import { axisOf } from '../../src/engines/math-scene/lib/symmetry';
import { taskLine } from '../../src/engines/math-scene/lib/symmetry-tasks';

const ROOT = join(import.meta.dirname, '../../src/content/topics/symmetry');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapterFiles = readdirSync(join(ROOT, 'chapters'));
const chapters: ChapterInfo[] = chapterFiles.map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: Task[] = [...lesson.steps.flatMap((s) => s.pool), ...lesson.practice.map((q) => q.task)];

describe('line symmetry lesson', () => {
  it('has no lesson errors or warnings', () => {
    expect(lessonIssues(data, chapters).map((i) => i.message)).toEqual([]);
  });
  it('has 5 steps of 4 beats, pools of 9–10 and 7 practice questions', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual(['fold-and-match', 'testing-a-line', 'symmetric-figures', 'mirror-on-grid', 'completing-figures']);
    for (const s of lesson.steps) {
      expect(s.beats).toHaveLength(4);
      expect(s.pool.length).toBeGreaterThanOrEqual(9);
    }
    expect(lesson.practice).toHaveLength(7);
  });
  it('files every task under symmetry and proves it', () => {
    for (const t of all) {
      expect(domainOf(t), t.id).toBe('symmetry');
      expect(proveTask(t), t.id).toEqual([]);
    }
  });
  it('plans every symmetry misconception in a check', () => {
    const planned = new Set(all.flatMap(declaredCodes));
    for (const c of SYMMETRY_CODES) expect(planned.has(c), c).toBe(true);
  });
  it('completes figures only about lines up or across', () => {
    for (const t of all.filter((x) => x.kind === 'complete-symmetric')) expect(axisOf(taskLine(t)!), t.id).not.toBeNull();
  });
  it('names no school level in the chapters', () => {
    for (const f of chapterFiles) {
      const text = readFileSync(join(ROOT, 'chapters', f), 'utf8');
      expect(text, f).not.toMatch(/\bP[1-6]\b|Primary [1-6]/);
    }
  });
});
