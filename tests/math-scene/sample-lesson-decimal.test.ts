/**
 * The engine fixture for decimals (src/content/topics/sample-lesson-decimal,
 * a draft placeholder topic like sample-lesson-whole): it passes the lesson
 * rules, every task proves (solved by its solution, starts unsolved, every
 * planned wrong answer and wrong option diagnosed as declared), and between
 * its beats and checks it shows each new model, move, task kind and answer form.
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

const ROOT = join(import.meta.dirname, '../../src/content/topics/sample-lesson-decimal');
const json = (f: string) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const data = mathSceneData.parse({ lesson: json('lesson.json'), sources: json('sources.json') });
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const tasks: Task[] = data.lesson.steps.flatMap((s) => s.pool);

describe('sample-lesson-decimal (engine fixture)', () => {
  it('is a draft placeholder topic with no lesson errors', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: draft$/m);
    expect(lessonIssues(data, chapters).filter((i) => i.level === 'error')).toEqual([]);
  });

  for (const t of tasks) it(`proves ${t.id} (${t.kind})`, () => expect(proveTask(t)).toEqual([]));

  it('files every task under the decimals domain', () => {
    expect(tasks.filter((t) => domainOf(t) !== 'decimals').map((t) => t.id)).toEqual([]);
  });

  it('shows every new model, move, kind and form', () => {
    const beats = data.lesson.steps.flatMap((s) => s.beats);
    const models = new Set([...beats.flatMap((b) => [b.model, ...(b.under ? [b.under] : [])]), ...tasks.map((t) => t.model)].map((m) => (m.kind === 'numberline' ? `${m.kind}-${m.scale}` : m.kind)));
    expect([...models].sort()).toEqual(['decimal-grid', 'money', 'numberline-decimal', 'place-value']);
    const moves = new Set(beats.map((b) => b.move).filter(Boolean));
    for (const move of ['zoom', 'slide', 'align', 'round', 'arrange', 'trade', 'combine', 'deal', 'morph']) expect(moves.has(move as never), move).toBe(true);
    expect(new Set(tasks.map((t) => t.kind))).toEqual(new Set(['shade-decimal', 'round-on-line', 'align-add', 'shift-digits', 'place', 'compare', 'order', 'share', 'regroup', 'input', 'choose']));
    const forms = new Set(tasks.map((t) => inputSpecOf(t)?.form).filter(Boolean));
    for (const form of ['decimal', 'simplest']) expect(forms.has(form as never), form).toBe(true);
    const works = new Set(tasks.map((t) => inputSpecOf(t)?.work?.do).filter(Boolean));
    for (const w of ['add', 'multiply', 'divide', 'round', 'convert', 'scale', 'to-fraction', 'read']) expect(works.has(w as never), w).toBe(true);
    expect(tasks.some((t) => inputSpecOf(t)?.unit === 'dollar')).toBe(true);
    expect(tasks.some((t) => inputSpecOf(t)?.places !== undefined)).toBe(true);
  });
});
