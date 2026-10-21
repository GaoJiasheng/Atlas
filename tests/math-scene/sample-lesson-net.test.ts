/**
 * The engine fixture for nets and solids (src/content/topics/sample-lesson-net, a
 * draft placeholder topic like sample-lesson-measure, docs/39 §3.8): it passes the
 * lesson rules, every pool task and practice question proves (solved by its
 * solution, starts unsolved, every planned wrong answer and wrong option diagnosed
 * as declared), and between its beats and checks it shows each solid, layout,
 * move, overlay, task kind and way of asking, and every `nets` code.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { NETS_CODES, mathSceneData, type NetSpec, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { netItems } from '../../src/engines/math-scene/lib/net-view';
import { solidClass } from '../../src/engines/math-scene/lib/solid';

const ROOT = join(import.meta.dirname, '../../src/content/topics/sample-lesson-net');
const json = (f: string) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const data = mathSceneData.parse({ lesson: json('lesson.json'), sources: json('sources.json') });
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const pool: Task[] = data.lesson.steps.flatMap((s) => s.pool);
const tasks: Task[] = [...pool, ...data.lesson.practice.map((q) => q.task)];
const beats = data.lesson.steps.flatMap((s) => s.beats);
const specs: NetSpec[] = [...beats.map((b) => b.model), ...tasks.flatMap((t) => [t.model, ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.model ? [o.model] : [])) : [])])].flatMap((m) => (m.kind === 'net' ? netItems(m) : []));

describe('sample-lesson-net (engine fixture)', () => {
  it('is a draft placeholder topic with no lesson errors or warnings', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: draft$/m);
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  for (const t of tasks) it(`proves ${t.id} (${t.kind})`, () => expect(proveTask(t)).toEqual([]));

  it('files every task under the nets domain', () => {
    expect(tasks.filter((t) => domainOf(t) !== 'nets').map((t) => t.id)).toEqual([]);
  });

  it('shows every solid, layout and overlay', () => {
    expect(new Set(specs.map((s) => solidClass(s.solid!)))).toEqual(new Set(['cube', 'cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere']));
    const layouts = new Set(specs.map((s) => (s.layout ? Object.keys(s.layout)[0] : s.curved ? 'curved' : 'standard')));
    expect([...layouts].sort()).toEqual(['cells', 'cubeNet', 'curved', 'rects', 'standard', 'tree']);
    for (const [name, f] of [
      ['pairs', (s: NetSpec) => s.pairs],
      ['dims', (s: NetSpec) => s.dims],
      ['footprint', (s: NetSpec) => s.footprint],
      ['grid', (s: NetSpec) => s.grid],
      ['tone', (s: NetSpec) => s.tone],
      ['letters', (s: NetSpec) => s.letters],
      ['mark', (s: NetSpec) => s.mark],
      ['open', (s: NetSpec) => s.open],
      ['turn', (s: NetSpec) => s.turn],
      ['part folded', (s: NetSpec) => typeof s.fold === 'number' && s.fold > 0 && s.fold < 1],
      ['a wrap', (s: NetSpec) => s.curved?.wrap],
      ['a triangle', (s: NetSpec) => s.curved?.lateral === 'triangle'],
    ] as const)
      expect(specs.some((s) => !!f(s)), name).toBe(true);
    expect(beats.some((b) => b.model.kind === 'net' && !!b.model.set)).toBe(true);
  });

  it('shows every move, kind, way of asking and code', () => {
    const moves = new Set(beats.map((b) => b.move).filter(Boolean));
    for (const move of ['fold', 'rotate', 'morph', 'shade']) expect(moves.has(move as never), move).toBe(true);
    expect(new Set(tasks.map((t) => t.kind))).toEqual(new Set(['complete-net', 'tap-face', 'choose', 'input']));
    const ways = new Set(tasks.map((t) => (t.kind === 'complete-net' ? `cn:${Array.isArray(t.candidates) ? 'list' : t.candidates}` : t.kind === 'tap-face' ? `tf:${t.ask}` : t.kind === 'choose' ? `ch:${t.multi ? 'multi' : t.options.some((o) => o.solid) ? 'solid' : t.options.some((o) => o.folds !== undefined) ? 'folds' : t.options.some((o) => o.model) ? 'pictures' : 'words'}` : `in:${t.kind === 'input' ? t.ask : ''}`)));
    for (const w of ['cn:free', 'cn:adjacent', 'cn:list', 'tf:opposite', 'tf:bottom', 'ch:multi', 'ch:solid', 'ch:folds', 'ch:pictures', 'ch:words', 'in:faces', 'in:length']) expect(ways.has(w), w).toBe(true);
    const codes = new Set(tasks.flatMap((t) => [...t.feedback.wrong.map((w) => w.when), ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const c of NETS_CODES) expect(codes.has(c), c).toBe(true);
  });
});
