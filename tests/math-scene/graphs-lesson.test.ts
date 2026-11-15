/**
 * The graphs lesson (src/content/topics/graphs, docs/77): 7 steps of 4–5 beats
 * (30 in all), check pools of 8–10 and 8 practice questions; every task in the
 * data domain and proved (its solution checks right, it starts unsolved, every
 * planned wrong answer and wrong option diagnosed as declared); every docs/77
 * code planned by a check and shown in a beat's step; the truncated axis only
 * in step 03 (its beat and one choose) and never in the practice; pie fractions
 * ½ ¼ ⅛ (⅓ ⅙ only in a choose); no school level in the chapters' prose.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { mathSceneData, type ChartSpec, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { chartItems } from '../../src/engines/math-scene/lib/chart';

const ROOT = join(import.meta.dirname, '../../src/content/topics/graphs');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapterFiles = readdirSync(join(ROOT, 'chapters'));
const chapters: ChapterInfo[] = chapterFiles.map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: { where: string; task: Task }[] = [...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task }))), ...lesson.practice.map((q) => ({ where: 'practice', task: q.task }))];
const charts = (m: Task['model']): ChartSpec[] => (m.kind === 'chart' ? chartItems(m) : []);

describe('graphs lesson', () => {
  it('is published with no lesson errors or warnings', () => {
    expect(readFileSync(join(ROOT, '..', 'graphs', 'topic.yaml'), 'utf8')).toMatch(/^status: published$/m);
    expect(lessonIssues(data, chapters)).toEqual([]);
  });
  it('has 7 steps of 4–5 beats (30 in all), pools of 8–10 and 8 practice questions', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual(['picture-graphs', 'reading-bar-graphs', 'scales', 'tables', 'line-graphs', 'changes-on-line-graphs', 'pie-charts']);
    expect(lesson.steps.map((s) => s.beats.length)).toEqual([4, 4, 5, 4, 4, 4, 5]);
    for (const s of lesson.steps) expect(s.pool.length, s.id).toBeGreaterThanOrEqual(8);
    expect(lesson.practice).toHaveLength(8);
  });
  it.each(all.map((x) => [`${x.where} / ${x.task.id}`, x.task] as const))('%s is a data task and proves', (_, task) => {
    expect(domainOf(task)).toBe('data');
    expect(proveTask(task)).toEqual([]);
  });
  it('plans every code of docs/77 §2.1', () => {
    const planned = new Set(all.flatMap(({ task }) => task.feedback.wrong.map((w) => w.when)));
    for (const code of ['key-ignored', 'interval-misread', 'between-gridlines', 'value-for-difference', 'scale-ignored-compare', 'truncated-axis', 'tally-misread', 'total-misused', 'height-for-change', 'fraction-as-count', 'unequal-parts'] as const) expect(planned.has(code), code).toBe(true);
  });
  it('shows a truncated axis only in step 03 (one beat, one choose), never in the practice', () => {
    const truncated = (m: Task['model']) => charts(m).some((c) => (c.axis?.from ?? 0) > 0);
    expect(lesson.steps.flatMap((s) => s.beats.filter((b) => truncated(b.model)).map(() => s.id))).toEqual(['scales']);
    expect(all.filter(({ task }) => truncated(task.model)).map((x) => `${x.where}/${x.task.kind}`)).toEqual(['scales/choose']);
  });
  it('cuts pies in halves, quarters and eighths (thirds and sixths only in a choose)', () => {
    const fracs = (m: Task['model']) => charts(m).flatMap((c) => (c.pie ?? []).flatMap((p) => (p.frac ? [`${p.frac.n}/${p.frac.d}`] : [])));
    for (const { task } of all) {
      const f = fracs(task.model);
      if (task.kind !== 'choose') expect(f.every((x) => ['1/2', '1/4', '1/8'].includes(x)), task.id).toBe(true);
    }
  });
  it('names no school level in the chapters\' prose', () => {
    for (const f of chapterFiles) {
      const body = readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---').slice(2).join('---');
      const prose = body.replace(/<More[\s\S]*?<\/More>/g, '').replace(/P3 row|P4 row|P4 pupils|四年级/g, '');
      expect(prose, f).not.toMatch(/\bP[1-6]\b|Primary [1-6]|小[一二三四五六]/);
    }
  });
});
