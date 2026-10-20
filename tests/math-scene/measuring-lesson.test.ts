/**
 * The measuring lesson (src/content/topics/measuring/data/lesson.json, docs/32):
 * 13 steps of 4–5 beats (the last going further), check pools of 8–10, eight
 * practice questions in six kinds; every task draws an instrument and is filed
 * under the measure-reading domain; every task proved (its solution checks
 * right, it starts unsolved, every planned wrong answer and wrong option is
 * diagnosed as declared) and within its step's number limits; every
 * measure-reading misconception (and the four shared codes) planned by a check;
 * km and ml only from step 10, two-unit measures only from step 11, decimals only
 * in the step that goes further; placeholder zeros in the conversion step; the
 * fixed phrases in the beats; no school level in the chapters.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { MEASURE_READING_CODES, MEASURE_READING_SHARED_CODES, mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, taskIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';

const ROOT = join(import.meta.dirname, '../../src/content/topics/measuring');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapterFiles = readdirSync(join(ROOT, 'chapters'));
const chapters: ChapterInfo[] = chapterFiles.map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const STEPS = [
  'using-a-ruler', 'not-from-zero', 'reading-scales', 'metres', 'mass-and-balances', 'weighing-scales', 'volume-and-litres',
  'choosing-units', 'comparing-measures', 'millilitres', 'compound-units', 'converting-units', 'scales-in-decimals',
];
const all: { where: string; task: Task; limits: (typeof lesson.steps)[number]['limits'] }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, limits: s.limits }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, limits: lesson.steps.find((s) => s.id === q.revisit[0])?.limits })),
];
const stepIndex = (where: string) => STEPS.indexOf(where);

describe('measuring lesson', () => {
  it('has no lesson errors or warnings', () => {
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  it('has 13 steps (the last going further) of 4–5 beats, pools of 8–10 and 8 practice questions in six kinds', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual(STEPS);
    expect(lesson.steps.filter((s) => s.bridge).map((s) => s.id)).toEqual(['scales-in-decimals']);
    for (const s of lesson.steps) {
      expect(s.beats.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.beats.length, s.id).toBeLessThanOrEqual(5);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
      expect(s.limits, `${s.id} limits`).toBeDefined();
    }
    expect(lesson.steps.reduce((n, s) => n + s.beats.length, 0)).toBe(58);
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind))).toEqual(new Set(['read-scale', 'count-intervals', 'set-scale', 'choose', 'order', 'input']));
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('draws an instrument on every beat and every task, all filed under the measure-reading domain', () => {
    for (const s of lesson.steps) for (const [i, b] of s.beats.entries()) expect(b.model.kind, `${s.id} beat ${i + 1}`).toBe('instrument');
    for (const { where, task } of all) {
      expect(task.model.kind, `${where} / ${task.id}`).toBe('instrument');
      expect(domainOf(task), `${where} / ${task.id}`).toBe('measure-reading');
    }
  });

  it('plans a check for every measure-reading misconception and the four shared codes', () => {
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of [...MEASURE_READING_CODES, ...MEASURE_READING_SHARED_CODES]) expect(planned.has(code), code).toBe(true);
  });

  it('keeps kilometres and millilitres from step 10, two units from step 11 and decimals to the step that goes further', () => {
    for (const s of lesson.steps) {
      const i = stepIndex(s.id);
      const units = (s.limits?.units ?? []) as string[];
      if (i < 9) expect(units.filter((u) => u === 'km' || u === 'ml'), s.id).toEqual([]);
      if (i < 10) expect(s.limits?.compound, s.id).toBeUndefined();
      if (!s.bridge) expect(s.limits?.dp, s.id).toBeUndefined();
    }
    for (const { where, task } of all) {
      if (where === 'practice' || stepIndex(where) >= 9) continue;
      expect(JSON.stringify(task), `${where} / ${task.id}`).not.toMatch(/\d\s?(km|ml)\b/);
    }
  });

  it('has at least three conversions with a zero holding a place', () => {
    const step = lesson.steps.find((s) => s.id === 'converting-units')!;
    const zero = step.pool.filter((t) => {
      const w = inputSpecOf(t)?.work;
      const from = w && 'from' in w && typeof w.from === 'object' && w.from && 'kind' in w.from ? w.from : null;
      if (!from) return false;
      const small = from.kind === 'cmp' ? from.smallPart : null;
      const big = from.kind === 'cmp' ? from.big : null;
      // 2 km 35 m, 4 m 6 cm, 5 kg 80 g: the small part has fewer digits than the factor's zeros.
      return small !== null && big !== null && String(small).length < (big === 'm' ? 2 : 3);
    });
    expect(zero.length).toBeGreaterThanOrEqual(3);
  });

  it('uses the fixed phrases in the beats', () => {
    const captions = lesson.steps.flatMap((s) => s.beats.map((b) => b.caption));
    expect(captions.filter((c) => c.en.includes('each small part stands for') || c.en.includes('Each small part stands for')).length).toBeGreaterThanOrEqual(7);
    expect(captions.filter((c) => c.zh.includes('每一小格表示')).length).toBeGreaterThanOrEqual(7);
    expect(captions.some((c) => c.en.includes('Count the parts, not the marks.') && c.zh.includes('数格子，不数刻度线。'))).toBe(true);
    expect(captions.some((c) => c.en.includes('Start at 0') && c.zh.includes('从 0 量起'))).toBe(true);
  });

  it('shows no school level in the chapters and writes litres as ℓ, never L or mL', () => {
    for (const f of chapterFiles) {
      const text = readFileSync(join(ROOT, 'chapters', f), 'utf8');
      expect(text, f).not.toMatch(/\bP[1-6]\b|Primary [1-6]|[一二三四五六]年级|小[一二三四五六]\b/);
      expect(text, f).not.toMatch(/\d\s?(mL|L|mℓ)\b/);
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
