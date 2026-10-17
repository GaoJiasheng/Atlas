/**
 * The decimals lesson (src/content/topics/decimals/data/lesson.json, docs/29):
 * 15 steps of 3–5 beats (the last two going further), check pools of 8–10,
 * eight practice questions in six kinds; every task proved (its solution
 * checks right, it starts unsolved, every planned wrong answer and wrong
 * option is diagnosed as declared) and within its step's number limits;
 * every decimal misconception (and the four shared codes) planned by a
 * check; decimals written as strings, never JSON numbers; fractions written
 * as decimals only with a denominator that is a factor of 10 or 100; adding
 * and subtracting to two places, × ÷ by a one-digit number of a decimal with
 * at most two places; × ÷ 10ⁿ and unit conversions only in the steps that go
 * further.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { DECIMAL_CODES, DECIMAL_SHARED_CODES, mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, taskIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';
import { minPlaces, wholePart } from '../../src/engines/math-scene/lib/decimal';

const ROOT = join(import.meta.dirname, '../../src/content/topics/decimals');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const all: { where: string; task: Task; limits: (typeof lesson.steps)[number]['limits'] }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, limits: s.limits }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, limits: lesson.steps.find((s) => s.id === q.revisit[0])?.limits })),
];
const BRIDGE = ['times-ten', 'measures-in-decimals'];
const workOf = (t: Task) => inputSpecOf(t)?.work;

describe('decimals lesson', () => {
  it('has no lesson errors or warnings', () => {
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  it('has 15 steps (the last two going further) of 3–5 beats, pools of 8–10 and 8 practice questions in six kinds', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual([
      'dollars-and-cents', 'tenths', 'hundredths', 'thousandths', 'place-value', 'comparing-decimals', 'decimals-and-fractions', 'rounding',
      'adding-decimals', 'subtracting-decimals', 'multiplying-decimals', 'dividing-decimals', 'whole-number-division', ...BRIDGE,
    ]);
    expect(lesson.steps.filter((s) => s.bridge).map((s) => s.id)).toEqual(BRIDGE);
    for (const s of lesson.steps) {
      expect(s.beats.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.beats.length, s.id).toBeLessThanOrEqual(5);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
      expect(s.limits, `${s.id} limits`).toBeDefined();
    }
    expect(lesson.steps.reduce((n, s) => n + s.beats.length, 0)).toBe(69);
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind))).toEqual(new Set(['shade-decimal', 'place', 'order', 'input', 'round-on-line', 'align-add']));
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('plans a check for every decimal misconception and the four shared codes', () => {
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of [...DECIMAL_CODES, ...DECIMAL_SHARED_CODES]) expect(planned.has(code), code).toBe(true);
  });

  it('writes every decimal as a string, never as a JSON number', () => {
    const numbers: number[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === 'number') numbers.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(JSON.parse(raw('lesson.json')));
    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers.filter((n) => !Number.isInteger(n))).toEqual([]);
  });

  it('writes fractions as decimals only from a denominator that is a factor of 10 or 100', () => {
    for (const { where, task } of all) {
      const w = workOf(task);
      if (w?.do !== 'to-decimal' || !w.of || 'kind' in w.of) continue;
      expect([1, 2, 4, 5, 10, 20, 25, 50, 100], `${where} / ${task.id}`).toContain(w.of.d);
    }
  });

  it('adds and subtracts to two places and multiplies or divides a decimal of at most two places by 2–9', () => {
    for (const { where, task } of all) {
      const w = workOf(task);
      const pairs = task.kind === 'align-add' ? [task.a, task.b] : w && (w.do === 'add' || w.do === 'subtract') ? [w.a!, w.b!] : [];
      for (const d of pairs) expect(minPlaces(d), `${where} / ${task.id}`).toBeLessThanOrEqual(2);
      if (w && (w.do === 'multiply' || w.do === 'divide')) {
        expect(minPlaces(w.a!), `${where} / ${task.id}`).toBeLessThanOrEqual(2);
        expect(wholePart(w.b!), `${where} / ${task.id}`).toBeGreaterThanOrEqual(2);
        expect(wholePart(w.b!), `${where} / ${task.id}`).toBeLessThanOrEqual(9);
      }
      if (task.kind === 'share' && typeof task.value !== 'number') expect(minPlaces(task.value), `${where} / ${task.id}`).toBeLessThanOrEqual(2);
    }
  });

  it('moves digits by 10, 100 and 1000 and converts units only in the steps that go further', () => {
    for (const { where, task } of all) {
      const w = workOf(task);
      const scaled = task.kind === 'shift-digits' || w?.do === 'scale' || (w?.do === 'convert' && w.from !== 'dollar' && w.from !== 'cent');
      if (scaled) expect(BRIDGE, `${where} / ${task.id}`).toContain(where);
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
