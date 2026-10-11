/**
 * The real lesson (src/content/topics/fractions/data/lesson.json, docs/15 §10):
 * every step explains in 3–5 beats whose models can be drawn and ends in a
 * check pool of 8–10 tasks; every pool task and practice question is solved
 * by its own `solve()`, every planned wrong answer (`feedback.wrong[].sample`)
 * is diagnosed as the misconception it is filed under, and every wrong
 * `choose` option shows its declared one (docs/15 §4.8: the automated proof
 * that each distractor gets the right feedback, whichever task is drawn).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessonFile, type Task } from '../../src/engines/math-scene/schema';
import { check } from '../../src/engines/math-scene/lib/check';
import { apply, sampleState, solve } from '../../src/engines/math-scene/lib/solve';
import { initialState, phasesOf } from '../../src/engines/math-scene/lib/state';
import { lessonBeats } from '../../src/engines/math-scene/lib/beats';
import { beatCount, beatSlot, locate } from '../../src/engines/math-scene/lib/lesson';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { add, sub, related, compare, toImproper, type Frac } from '../../src/engines/math-scene/lib/fraction';
import { badTokens } from '../../src/lib/rich-text';

const FILE = join(import.meta.dirname, '../../src/content/topics/fractions/data/lesson.json');
const lesson = lessonFile.parse(JSON.parse(readFileSync(FILE, 'utf8')));
const all: { where: string; task: Task; bridge: boolean }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task, bridge: !!s.bridge }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task, bridge: false })),
];
const captions = { check: { en: 'Your turn', zh: '轮到你' }, summary: { en: 'Summary', zh: '小结' } };

describe('fractions lesson', () => {
  it('has 12 steps of 3–5 beats with a check pool of 8–10, and 8 practice questions', () => {
    expect(lesson.steps).toHaveLength(12);
    for (const s of lesson.steps) {
      expect(s.beats.length, `${s.id} beats`).toBeGreaterThanOrEqual(3);
      expect(s.beats.length, `${s.id} beats`).toBeLessThanOrEqual(5);
      expect(s.pool.length, `${s.id} pool`).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, `${s.id} pool`).toBeLessThanOrEqual(10);
    }
    expect(lesson.practice).toHaveLength(8);
    expect(new Set(lesson.practice.map((q) => q.task.kind)).size).toBeGreaterThanOrEqual(5);
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('writes every beat caption and equation with valid fraction tokens', () => {
    for (const s of lesson.steps) {
      for (const b of s.beats) {
        expect(b.caption.en.length).toBeGreaterThan(0);
        expect(b.caption.zh.length).toBeGreaterThan(0);
        for (const text of [b.caption.en, b.caption.zh, b.equation ?? '']) expect(badTokens(text), `${s.id}: ${text}`).toEqual([]);
      }
    }
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

      it('passes the shared proof (scripts/math/check-pool.ts)', () => {
        expect(proveTask(task)).toEqual([]);
      });
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
      for (const t of s.pool) for (const [a, b] of sums(t)) expect(related(a, b) && a.d !== b.d, `${t.id}: related, different denominators`).toBe(true);
    }
  });

  it('derives the beats: explanation beats, then the check; the practice questions and a summary', () => {
    for (const s of lesson.steps) {
      const beats = lessonBeats(lesson, s.id, false, captions)!;
      expect(beats).toHaveLength(s.beats.length + 1);
      expect(beats.at(-1)!.kind).toBe('check');
      expect(beats.filter((b) => b.kind === 'explain')).toHaveLength(s.beats.length);
      const place = locate(lesson, s.id, false);
      expect(beatCount(place)).toBe(s.beats.length + 1);
      expect(beatSlot(place, s.beats.length).kind).toBe('check');
      expect(beatSlot(place, 99).kind).toBe('check');
      expect(beatSlot(place, 0).kind).toBe('explain');
    }
    const practice = lessonBeats(lesson, 'practice', true, captions)!;
    expect(practice).toHaveLength(lesson.practice.length + 1);
    expect(practice.filter((b) => b.kind === 'question')).toHaveLength(lesson.practice.length);
    expect(lessonBeats(lesson, 'before-you-start', false, captions)).toBeUndefined();
  });
});
