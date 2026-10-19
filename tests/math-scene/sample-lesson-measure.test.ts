/**
 * The engine fixture for reading instruments (src/content/topics/sample-lesson-measure,
 * a draft placeholder topic like sample-lesson-decimal, docs/32 §3.8): it passes the
 * lesson rules, every task proves (solved by its solution, starts unsolved, every
 * planned wrong answer and wrong option diagnosed as declared), and between its beats
 * and checks it shows each instrument, overlay, move, task kind, answer form and
 * measure-reading code.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { MEASURE_READING_CODES, MEASURE_READING_SHARED_CODES, mathSceneData, type InstrumentSpec, type Task } from '../../src/engines/math-scene/schema';
import { lessonIssues, type ChapterInfo } from '../../src/engines/math-scene/validate';
import { domainOf } from '../../src/engines/math-scene/validate-values';
import { proveTask } from '../../src/engines/math-scene/lib/proof';
import { inputSpecOf } from '../../src/engines/math-scene/lib/state';
import { partsOf } from '../../src/engines/math-scene/lib/instrument';
import { isMeasureWork } from '../../src/engines/math-scene/lib/measure-kind';

const ROOT = join(import.meta.dirname, '../../src/content/topics/sample-lesson-measure');
const json = (f: string) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const data = mathSceneData.parse({ lesson: json('lesson.json'), sources: json('sources.json') });
const chapters: ChapterInfo[] = readdirSync(join(ROOT, 'chapters')).map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const tasks: Task[] = data.lesson.steps.flatMap((s) => s.pool);
const beats = data.lesson.steps.flatMap((s) => s.beats);
const instruments: InstrumentSpec[] = [...beats.map((b) => b.model), ...tasks.flatMap((t) => [t.model, ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.model ? [o.model] : [])) : [])])].flatMap((m) => (m.kind === 'instrument' ? partsOf(m) : []));

describe('sample-lesson-measure (engine fixture)', () => {
  it('is a draft placeholder topic with no lesson errors', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: draft$/m);
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  for (const t of tasks) it(`proves ${t.id} (${t.kind})`, () => expect(proveTask(t)).toEqual([]));

  it('files every task under the measure-reading domain', () => {
    expect(tasks.filter((t) => domainOf(t) !== 'measure-reading').map((t) => t.id)).toEqual([]);
  });

  it('inherits unit chips from the step while respecting explicit task units', () => {
    const lesson = json('lesson.json');
    const step = lesson.steps[0];
    step.limits.units = ['cm', 'm', 'km'];
    const height = step.pool.find((t: { id: string }) => t.id === 'rt-height');
    delete height.answer.units;
    const parsed = mathSceneData.parse({ lesson });
    const inherited = parsed.lesson.steps[0]!.pool.find((t) => t.id === 'rt-height')!;
    expect(inherited.kind === 'read-scale' && inherited.answer.units).toEqual(['cm', 'm', 'km']);
    height.answer.units = ['cm'];
    const explicit = mathSceneData.parse({ lesson }).lesson.steps[0]!.pool.find((t) => t.id === 'rt-height')!;
    expect(explicit.kind === 'read-scale' && explicit.answer.units).toEqual(['cm']);
  });

  it('shows every instrument, look and overlay', () => {
    const types = new Set(instruments.map((s) => s.type));
    expect([...types].sort()).toEqual(['balance', 'dial', 'jug', 'ruler', 'tape']);
    const looks = new Set(instruments.map((s) => s.look).filter(Boolean));
    for (const l of ['metre-rule', 'tape', 'height-chart', 'path']) expect(looks.has(l as never), l).toBe(true);
    const has = (f: (s: InstrumentSpec) => unknown) => instruments.some((s) => !!f(s));
    for (const [name, f] of [
      ['broken', (s: InstrumentSpec) => s.broken],
      ['inset', (s: InstrumentSpec) => s.inset],
      ['sub', (s: InstrumentSpec) => s.sub],
      ['dual', (s: InstrumentSpec) => s.dual],
      ['skip', (s: InstrumentSpec) => s.skip],
      ['count', (s: InstrumentSpec) => s.count],
      ['zoom', (s: InstrumentSpec) => s.zoom],
      ['brackets', (s: InstrumentSpec) => s.brackets],
      ['eye', (s: InstrumentSpec) => s.eye],
      ['highlight', (s: InstrumentSpec) => s.highlight],
      ['hidden number', (s: InstrumentSpec) => typeof s.labels === 'object'],
      ['no scale', (s: InstrumentSpec) => s.scale === false],
      ['straight', (s: InstrumentSpec) => s.straight],
      ['decimal scale', (s: InstrumentSpec) => s.minor && s.minor.units % 1_000_000 !== 0],
    ] as const)
      expect(has(f), name).toBe(true);
  });

  it('shows every new move, kind, mode, form and code', () => {
    const moves = new Set(beats.map((b) => b.move).filter(Boolean));
    for (const move of ['unroll', 'fill', 'tip', 'sweep', 'slide', 'jump', 'zoom', 'morph']) expect(moves.has(move as never), move).toBe(true);
    expect(new Set(tasks.map((t) => t.kind))).toEqual(new Set(['read-scale', 'set-scale', 'count-intervals', 'compare', 'order', 'choose', 'input']));
    const modes = new Set(tasks.flatMap((t) => (t.kind === 'set-scale' ? [t.mode] : [])));
    expect([...modes].sort()).toEqual(['arrow', 'fill', 'line', 'load', 'weights']);
    const forms = new Set(tasks.map((t) => inputSpecOf(t)?.form).filter(Boolean));
    for (const form of ['whole', 'measure', 'compound', 'decimal']) expect(forms.has(form as never), form).toBe(true);
    expect(tasks.some((t) => isMeasureWork(inputSpecOf(t)?.work))).toBe(true);
    expect(tasks.some((t) => t.kind === 'count-intervals' && t.ask === 'part') && tasks.some((t) => t.kind === 'count-intervals' && t.ask === 'length')).toBe(true);
    expect(tasks.some((t) => t.kind === 'compare' && t.align === 'unit')).toBe(true);
    const codes = new Set(tasks.flatMap((t) => [...t.feedback.wrong.map((w) => w.when), ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const c of [...MEASURE_READING_CODES, ...MEASURE_READING_SHARED_CODES]) expect(codes.has(c), c).toBe(true);
  });
});
