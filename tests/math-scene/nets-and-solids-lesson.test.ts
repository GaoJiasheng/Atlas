/**
 * The nets and solids lesson (src/content/topics/nets-and-solids, docs/39): 8 steps
 * of 4–5 beats (37 in all), check pools of 8–10 and 8 practice questions; every
 * task filed under the nets domain and proved (its solution checks right, it starts
 * unsolved, every planned wrong answer and wrong option diagnosed as declared);
 * every `nets` misconception planned by a check; the answers that validate does
 * not fold (how many flat faces a curved solid has) checked against the solid;
 * the candidate places of a net to complete apart from each other and from the
 * faces given (the engine does not keep them apart, docs/39 §9.1); curved solids
 * only named (docs/39 D3); the hard nets in steps 03 and 04 (docs/39 §2.1); the
 * fixed phrases; no school level and no unsourced count in the chapters.
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
import { candidatePolys, netOfSpec, taskNetSpec } from '../../src/engines/math-scene/lib/net-tasks';
import { convexOverlap, layoutOf } from '../../src/engines/math-scene/lib/net';
import { flatAndCurved, isCurved } from '../../src/engines/math-scene/lib/solid';

const ROOT = join(import.meta.dirname, '../../src/content/topics/nets-and-solids');
const raw = (f: string) => readFileSync(join(ROOT, 'data', f), 'utf8');
const data = mathSceneData.parse({ lesson: JSON.parse(raw('lesson.json')), sources: JSON.parse(raw('sources.json')), glossary: JSON.parse(raw('glossary.json')) });
const lesson = data.lesson;
const chapterFiles = readdirSync(join(ROOT, 'chapters'));
const chapters: ChapterInfo[] = chapterFiles.map((f) => {
  const front = parseYaml(readFileSync(join(ROOT, 'chapters', f), 'utf8').split('---')[1]!) as { id: string; order: number; kind?: 'chapter' | 'background'; state: unknown };
  return { id: front.id, order: front.order, kind: front.kind, state: front.state };
});
const STEPS = ['solids-and-faces', 'opening-a-cube', 'many-nets', 'fold-to-test', 'opposite-faces', 'cuboid-nets', 'prisms-and-pyramids', 'cylinders-and-cones'];
const all: { where: string; task: Task }[] = [
  ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: s.id, task }))),
  ...lesson.practice.map((q) => ({ where: 'practice', task: q.task })),
];
const netsOf = (t: Task): NetSpec[] => [t.model, ...(t.kind === 'choose' ? t.options.flatMap((o) => (o.model ? [o.model] : [])) : [])].flatMap((m) => (m.kind === 'net' ? netItems(m) : []));

/** The longest straight run of squares in a cube net, either way (docs/39 §2.1: 2 or 3 is the hard kind). */
function longestRow(spec: NetSpec): number | null {
  if (!spec.solid || spec.solid.type !== 'cuboid' || spec.solid.size.some((v) => v !== 1) || isCurved(spec.solid)) return null;
  const l = layoutOf({ ...spec, solid: spec.solid });
  if (!('cells' in l)) return null;
  const has = new Set(l.cells.map(([x, y]) => `${x},${y}`));
  let best = 0;
  for (const [x, y] of l.cells)
    for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
      let n = 1;
      while (has.has(`${x + dx * n},${y + dy * n}`)) n++;
      best = Math.max(best, n);
    }
  return best;
}

describe('nets and solids lesson', () => {
  it('is published with no lesson errors or warnings', () => {
    expect(readFileSync(join(ROOT, 'topic.yaml'), 'utf8')).toMatch(/^status: published$/m);
    expect(lessonIssues(data, chapters)).toEqual([]);
  });

  it('has 8 steps of 4–5 beats (37 in all), pools of 8–10 and 8 practice questions', () => {
    expect(lesson.steps.map((s) => s.id)).toEqual(STEPS);
    expect(lesson.steps.map((s) => s.beats.length)).toEqual([4, 4, 5, 5, 4, 5, 5, 5]);
    for (const s of lesson.steps) {
      expect(s.pool.length, s.id).toBeGreaterThanOrEqual(8);
      expect(s.pool.length, s.id).toBeLessThanOrEqual(10);
      expect(s.limits?.solids, s.id).toBeDefined();
    }
    expect(lesson.practice).toHaveLength(8);
    const ids = all.map((x) => x.task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const { where, task } of all) it(`proves ${where} / ${task.id} (${task.kind})`, () => expect(proveTask(task)).toEqual([]));

  it('files every task under the nets domain and plans a check for every nets misconception', () => {
    expect(all.filter(({ task }) => domainOf(task) !== 'nets').map(({ task }) => task.id)).toEqual([]);
    const planned = new Set(all.flatMap(({ task }) => [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]));
    for (const code of NETS_CODES) expect(planned.has(code), code).toBe(true);
  });

  it('counts the flat faces of a curved solid right', () => {
    const counts = all.filter(({ task }) => task.kind === 'choose' && task.model.kind === 'net' && task.options.every((o) => o.text && /^\d$/.test(o.text.en)));
    expect(counts.length).toBe(2);
    for (const { task } of counts) {
      if (task.kind !== 'choose' || task.model.kind !== 'net' || !task.model.solid) throw new Error(task.id);
      const flat = flatAndCurved(task.model.solid).flat;
      for (const o of task.options) expect(o.correct, `${task.id} / ${o.id}`).toBe(Number(o.text!.en) === flat);
    }
  });

  it('keeps the candidate places of a net to complete apart', () => {
    for (const { task } of all) {
      if (task.kind !== 'complete-net' || !Array.isArray(task.candidates)) continue;
      const places = candidatePolys(task, []).map((c) => c.poly);
      const given = netOfSpec(taskNetSpec(task)!)!.nodes.map((n) => n.poly);
      places.forEach((p, i) => {
        places.slice(i + 1).forEach((q, j) => expect(convexOverlap(p, q), `${task.id}: places ${i} and ${i + 1 + j}`).toBe(false));
        given.forEach((g, k) => expect(convexOverlap(p, g), `${task.id}: place ${i} on face ${k}`).toBe(false));
      });
    }
  });

  it('only names curved solids, in their own step', () => {
    for (const { where, task } of all) {
      const curved = netsOf(task).some((s) => s.solid && isCurved(s.solid) && s.solid.type !== 'sphere');
      if (!curved) continue;
      expect(task.kind, task.id).toBe('choose');
      expect(['solids-and-faces', 'cylinders-and-cones', 'practice'], task.id).toContain(where);
    }
  });

  it('uses the hard nets (longest row of 2 or 3) in at least three tenths of the checks in steps 03 and 04', () => {
    for (const id of ['many-nets', 'fold-to-test']) {
      const pool = lesson.steps.find((s) => s.id === id)!.pool;
      const hard = pool.filter((t) => netsOf(t).some((s) => {
        const n = longestRow(s);
        return n !== null && n <= 3;
      }));
      expect(hard.length / pool.length, id).toBeGreaterThanOrEqual(0.3);
    }
  });

  it('asks for the bottom of a box with the bottom at one end', () => {
    const bottoms = all.filter(({ task }) => task.kind === 'tap-face' && task.ask === 'bottom');
    expect(bottoms.some(({ task }) => longestRow(taskNetSpec(task)!) === 4)).toBe(true);
  });

  it('says the fixed phrases in the beats', () => {
    const captions = lesson.steps.flatMap((s) => s.beats.map((b) => b.caption));
    const has = (en: string, zh: string) => captions.some((c) => c.en.includes(en) && c.zh.includes(zh));
    expect(has('A net is a flat shape that folds up into a solid.', '展开图是能折成立体的平面图形。')).toBe(true);
    expect(has('Fold it and look.', '折一折，看一看。')).toBe(true);
    expect(has('Opposite faces never touch.', '相对的两个面不相挨。')).toBe(true);
    expect(has('choose a bottom, fold up the sides, then close the top.', '先选一个底，把四周折起来，最后盖上顶。')).toBe(true);
  });

  it('shows no school level, no unsourced count and no other names for the solids in the chapters', () => {
    for (const f of chapterFiles) {
      const text = readFileSync(join(ROOT, 'chapters', f), 'utf8');
      expect(text, f).not.toMatch(/\bP[1-6]\b|Primary [1-6]|[一二三四五六]年级|小[一二三四五六]\b/);
      expect(text, f).not.toMatch(/\b(29|384|723)\b/);
      expect(text, f).not.toMatch(/立方体|角柱|角锥|摺纸图样/);
    }
  });
});
