/**
 * The telling-time lesson (src/content/topics/telling-time/data/lesson.json,
 * docs/20): 11 steps of 3–5 beats on the clock face and the timeline, check
 * pools of 8–10, eight practice questions in five kinds; every task proved
 * (its solution checks right, it starts unsolved, every planned wrong answer
 * and wrong option is diagnosed as declared) and within its step's limits
 * (12-hour time only before the 24-hour step, 5-minute times in step 01,
 * durations capped, nothing across midnight from step 06 on); every time
 * misconception planned somewhere; times in the text only as tokens.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessonFile, TIME_CODES, type Task } from '../../src/engines/math-scene/schema';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { taskIssues } from '../../src/engines/math-scene/validate';

const FILE = join(import.meta.dirname, '../../src/content/topics/telling-time/data/lesson.json');
const raw: unknown = JSON.parse(readFileSync(FILE, 'utf8'));
const lesson = lessonFile.parse(raw);
const all: { where: string; task: Task; limits: (typeof lesson.steps)[number]['limits'] }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, limits: s.limits }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, limits: lesson.steps.find((s) => s.id === q.revisit[0])?.limits })),
];

/** Every string in the data, with its path. */
function strings(v: unknown, path = '', out: [string, string][] = []): [string, string][] {
  if (typeof v === 'string') out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}.${i}`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out);
  return out;
}

describe('telling-time lesson', () => {
  it('has 11 steps of 3–5 clock or timeline beats, pools of 8–10 and 8 practice questions in five kinds', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual([
      'the-clock-face',
      'hands-move-together',
      'to-the-minute',
      'am-and-pm',
      'hours-and-minutes',
      'how-long',
      'finishing-time',
      'starting-time',
      'seconds',
      'twenty-four-hour-clock',
      'timetables',
    ]);
    expect(lesson.steps.some((s) => s.bridge)).toBe(false);
    for (const s of lesson.steps) {
      expect(s.beats.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.beats.length, s.id).toBeLessThanOrEqual(5);
      expect(s.beats.every((b) => b.model.kind === 'clock' || b.model.kind === 'timeline'), s.id).toBe(true);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
    }
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind))).toEqual(new Set(['read-clock', 'set-clock', 'choose', 'input', 'duration']));
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('writes times the Singapore way: 7.20 am and four-digit 24-hour times', () => {
    expect(lesson.notation).toEqual({ clock12: 'h.mm am', clock24: 'HHMM' });
  });

  it('keeps to the step limits the spec sets (docs/20 §9.3)', () => {
    const at = (id: string) => lesson.steps.find((s) => s.id === id)!.limits!;
    for (const id of ['the-clock-face', 'hands-move-together', 'to-the-minute', 'am-and-pm']) expect(at(id).clock, id).toBe('12h');
    expect(at('the-clock-face').step).toBe(5);
    for (const id of ['how-long', 'finishing-time', 'starting-time', 'twenty-four-hour-clock', 'timetables']) expect(at(id).sameDay, id).toBe(true);
  });

  it('plans a check for every time misconception', () => {
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of TIME_CODES) expect(planned.has(code), code).toBe(true);
  });

  it('writes times in the text only as tokens, never as typed clock times', () => {
    // Prompts, feedback, captions and key facts: a typed "7.20 am" or "19:20" would not follow the notation.
    const typed = /\b\d{1,2}[.:]\d{2}\s?(?:am|pm|a\.m\.|p\.m\.)|\b\d{1,2}:\d{2}\b/i;
    const texts = strings(raw).filter(([p]) => /\.(en|zh)$/.test(p));
    expect(texts.length).toBeGreaterThan(1000);
    expect(texts.filter(([, s]) => typed.test(s.replace(/\{[^{}]*\}/g, '')))).toEqual([]);
    // No school level anywhere in what the child reads.
    expect(texts.filter(([, s]) => /\bP[1-6]\b|Primary [1-6]|小[一二三四五六]/.test(s))).toEqual([]);
  });

  for (const { where, task, limits } of all) {
    it(`${where} / ${task.id} (${task.kind}) passes the proof and the content rules (step limits included)`, () => {
      expect(proveTask(task)).toEqual([]);
      expect(taskIssues(task, task.id, { bridge: false, practice: where === 'practice', limits }).filter((i) => i.level === 'error')).toEqual([]);
    });
  }
});
