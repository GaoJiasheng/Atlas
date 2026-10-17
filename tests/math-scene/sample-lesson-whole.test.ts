/**
 * The engine fixture for whole numbers and time (src/content/topics/sample-lesson-whole,
 * a draft placeholder topic like sample-region): it passes the lesson rules,
 * every task proves (solved by its solution, starts unsolved, every planned
 * wrong answer and wrong option diagnosed as declared), and between its
 * beats and checks it shows each new model, move, task kind and answer form
 * (the clock and the timeline with their layers since docs/20 A3).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { mathSceneData, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';

const ROOT = join(import.meta.dirname, '../../src/content/topics/sample-lesson-whole');
const json = (f: string) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const data = mathSceneData.parse({ lesson: json('lesson.json'), sources: json('sources.json') });
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const tasks: Task[] = data.lesson.steps.flatMap((s) => s.pool);

describe('sample-lesson-whole (engine fixture)', () => {
  it('is a draft placeholder topic with no lesson errors', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: draft$/m);
    expect(lessonIssues(data, chapters).filter((i) => i.level === 'error')).toEqual([]);
  });

  for (const t of tasks) it(`proves ${t.id} (${t.kind})`, () => expect(proveTask(t)).toEqual([]));

  it('shows every new model, move, kind and form', () => {
    const beats = data.lesson.steps.flatMap((s) => s.beats);
    const models = new Set([...beats.flatMap((b) => [b.model, ...(b.under ? [b.under] : [])]), ...tasks.map((t) => t.model)].map((m) => (m.kind === 'numberline' ? `${m.kind}-${m.scale}` : m.kind)));
    expect([...models].sort()).toEqual(['array', 'blocks', 'clock', 'numberline-whole', 'timeline']);
    const moves = new Set(beats.map((b) => b.move).filter(Boolean));
    for (const move of ['deal', 'arrange', 'rotate', 'jump', 'cross', 'cover', 'group', 'combine', 'trade', 'sweep']) expect(moves.has(move as never), move).toBe(true);
    expect(new Set(tasks.map((t) => t.kind))).toEqual(new Set(['group', 'arrange', 'skip-count', 'split-array', 'input', 'choose', 'regroup', 'share', 'read-clock', 'set-clock', 'duration']));
    // The clock's layers and the timeline's scales, each drawn once somewhere.
    const all = [...beats.flatMap((b) => [b.model, ...(b.under ? [b.under] : [])]), ...tasks.flatMap((t) => [t.model, ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.model ? [o.model] : [])) : [])])];
    const faces = all.flatMap((m) => (m.kind === 'clock' ? (m.pair ?? [m]) : []));
    for (const f of ['minuteLabels', 'inner24', 'highlightTicks', 'hourTrack', 'zoom', 'faulty', 'ampm', 'lit', 'elapsed'] as const) expect(faces.some((x) => x[f] !== undefined), f).toBe(true);
    const lines = all.flatMap((m) => (m.kind === 'timeline' ? [m] : []));
    for (const scale of ['day', 'span', 'duration']) expect(lines.some((l) => l.scale === scale), scale).toBe(true);
    expect(lines.some((l) => l.labels === 'both') && lines.some((l) => l.bands) && lines.some((l) => l.clock)).toBe(true);
    const forms = new Set(tasks.map((t) => inputSpecOf(t)?.form).filter(Boolean));
    for (const form of ['whole', 'remainder', 'time12', 'time24', 'face', 'duration']) expect(forms.has(form as never), form).toBe(true);
    expect(tasks.some((t) => inputSpecOf(t)?.sentence)).toBe(true);
  });
});
