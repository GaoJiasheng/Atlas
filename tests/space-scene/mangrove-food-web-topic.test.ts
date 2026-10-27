import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';

const dir = join(import.meta.dirname, '../../src/content/topics/mangrove-food-web');
const file = partsFile.parse(JSON.parse(readFileSync(join(dir, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const chapters = readdirSync(join(dir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const s = readFileSync(join(dir, 'chapters', f), 'utf8');
  return { ...parseYaml(s.split(/^---$/m)[1]!), body: s.split(/^---$/m).slice(2).join('---') };
});
const at = (id: string, beat: number) => {
  const c = chapters.find((x) => x.id === id)!;
  return resolveSimValues(sim, { ...c.state.sim.set, ...c.state.beats[beat - 1].sim?.set });
};
const evaluate = (values: SimValues) => evaluateSim(sim, resolveSimValues(sim, values));
const oracle = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures/mangrove-table-oracle.json'), 'utf8')) as { input: SimValues; expected: Record<string, number | string> }[];

describe('mangrove-food-web: sourced finite table', () => {
  it.each(oracle)('matches preparation independently audited case $input', ({ input, expected }) => {
    const outputs = evaluate(input);
    for (const [key, value] of Object.entries(expected)) expect(outputs[key], key).toEqual(value);
  });
  it('tide changes only display poses, never food support; removed fiddlers stay hidden', () => {
    for (const remove of ['none', ...sim.foodWeb!.nodes.map((n) => n.id)]) {
      const low = evaluate({ remove, tide: 'low' }), high = evaluate({ remove, tide: 'high' });
      for (const k of ['present-count', 'supported-count', 'active-links', 'foods', ...sim.foodWeb!.edges.map((e) => e.output)]) expect(high[k]).toEqual(low[k]);
      expect([high['water-rise'], high['crab-rise'], high['show-fiddlers']]).toEqual([.14, .16, 0]);
      expect(low['show-fiddlers']).toBe(remove === 'n-fiddlers' ? 0 : 1);
    }
  });
  it('captions at removal beats agree with actual table readings', () => {
    const expected = [
      [2, 'unchanged', 6], [1, 'fewer-foods', 4], [0, 'no-shown-food', 3],
      [1, 'fewer-foods', 3], [2, 'unchanged', 5], [0, 'no-shown-food', 3],
    ];
    expected.forEach((numbers, i) => {
      const q = evaluateSim(sim, at('removing-a-species', i + 1));
      expect([q.foods, q['food-status'], q['active-links']]).toEqual(numbers);
    });
  });
  it('predict-first compares two to one, keeps the alternative route and preserves unsupported animals', () => {
    const c = chapters.find((x) => x.id === 'removing-a-species')!;
    const p = c.state.sim.try.predict;
    expect(evaluate(p.start).foods).toBe(2);
    expect(evaluate({ ...p.start, ...p.change }).foods).toBe(1);
    expect(p.options.find((o: { means: string }) => o.means === 'less')).toBeDefined();
    const values = resolveSimValues(sim, { remove: 'n-algae', tide: 'low' });
    const effects = simEffects(sim, values, evaluateSim(sim, values));
    expect(effects.hidden.has('fiddler-crabs')).toBe(false);
    expect(evaluate(values)['status-n-fiddlers']).toBe('no-shown-food');
    expect(effects.hidden.has('fallen-leaves')).toBe(false);
  });
  it('has the specified content shape and every selectable object is indexed', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([3, 4, 4, 5, 5, 5, 6, 4]);
    const selectable = file.parts.filter((p) => !p.context);
    expect(selectable).toHaveLength(18);
    expect(file.parts.filter((p) => p.context)).toHaveLength(2);
    const indexed = new Set(chapters.flatMap((c) => c.state.index.parts));
    for (const p of selectable) expect(indexed.has(p.id), p.id).toBe(true);
    expect(file.flows).toHaveLength(6);
    expect(file.flows.reduce((sum, f) => sum + f.count, 0)).toBeLessThanOrEqual(144);
    expect(sim.outputs).toHaveLength(20);
    expect(sim.table!.experiments.web!.rows).toHaveLength(7);
    expect(sim.table!.experiments.inspection!.rows).toHaveLength(28);
    expect(sim.table!.experiments['tide-pose']!.rows).toHaveLength(14);
  });
  it('never points a beat label at a hidden or removed object', () => {
    for (const c of chapters) for (const beat of c.state.beats) {
      const values = resolveSimValues(sim, { ...c.state.sim.set, ...beat.sim?.set });
      const effects = simEffects(sim, values, evaluateSim(sim, values));
      const hidden = new Set([...(beat.hide ?? c.state.hide ?? []), ...effects.hidden]);
      for (const label of beat.labels ?? c.state.labels ?? [])
        expect(hidden.has(label), `${c.id}: ${label}`).toBe(false);
    }
  });
  it('has separate connected root systems, paired fish eyes and anatomically complete crab appendages', () => {
    const by = (id: string) => file.parts.find((p) => p.id === id)!;
    expect(by('api-pencil').connects).toContain('api-lateral');
    expect(by('api-lateral').connects).toContain('api-tree');
    expect(by('bakau-prop').connects).toContain('bakau-tree');
    expect(by('fiddler-crabs').extra!.length).toBeLessThanOrEqual(16);
    expect(by('tree-crabs').extra!.length).toBeLessThanOrEqual(16);
    for (const id of ['fiddler-crabs', 'tree-crabs']) {
      const extras = by(id).extra!;
      expect(extras.slice(0, 8).every((p) => p.kind === 'sweep')).toBe(true);
      expect(extras.filter((p) => p.kind === 'extrude')).toHaveLength(2);
    }
    expect(by('giant-mudskipper').extra!.filter((p) => p.color === 'eye')).toHaveLength(2);
    const legs = by('heron').extra!.filter((p) => p.kind === 'sweep' && p.path.some((point) => p.at[1] + point[1] < .01) && p.path.some((point) => p.at[1] + point[1] > .2));
    expect(legs).toHaveLength(2);
  });
});
