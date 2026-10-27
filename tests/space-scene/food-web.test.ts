import { describe, expect, it } from 'vitest';
import fixture from '../../src/content/topics/sample-food-web/data/parts.json';
import { partsFile } from '../../src/engines/space-scene/schema';
import { simSchema, simIssues } from '../../src/engines/space-scene/sim-schema';
import { foodWebIssues, foodWebSchema, foodWebSourceIssues } from '../../src/engines/space-scene/food-web-schema';
import { foodEdgePath, foodWebModel } from '../../src/engines/space-scene/lib/sim/food-web';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';

const file = partsFile.parse(fixture);
const sim = file.sim!;
const web = sim.foodWeb!;
const controls = new Map(sim.controls.map((c) => [c.id, c]));
const parts = new Set(file.parts.map((p) => p.id));
const issues = (value = web, outputs = sim.outputs, c = controls, p = parts, context = new Set<string>()) => foodWebIssues(value, c, outputs, p, context, sim.table).map((x) => `${x.path.join('.')}: ${x.message}`);
const read = (remove = 'none', inspect = 'n-mudskipper', tide = 'low') => {
  const values = resolveSimValues(sim, { remove, inspect, tide });
  const outputs = evaluateSim(sim, values);
  return { outputs, model: foodWebModel(web, outputs, values, null) };
};
const copy = <T>(value: T): T => structuredClone(value);

describe('optional directed food-web table card', () => {
  it('has no new sim kind, solver, output kind or bindings; the complete draft fixture parses', () => {
    expect(sim.kind).toBe('table');
    expect(sim.outputs).toHaveLength(20);
    expect(Object.values(sim.table!.experiments).reduce((n, x) => n + x.rows.length, 0)).toBe(49);
    expect(issues()).toEqual([]);
    expect(foodWebSourceIssues(web, new Set(['S1', 'S2']))).toEqual([]);
    expect(simIssues(sim, { parts, partData: file.parts, contextParts: new Set(), flows: new Map(), animations: new Map(), poses: new Set(), countable: new Set() })).toEqual([]);
  });
  it.each([
    ['none', 'n-mudskipper', 6, 6, 6, 2, 'unchanged'],
    ['n-fiddlers', 'n-mudskipper', 5, 5, 4, 1, 'fewer-foods'],
    ['n-tree-crabs', 'n-mudskipper', 5, 5, 3, 1, 'fewer-foods'],
    ['n-algae', 'n-mudskipper', 5, 4, 3, 1, 'fewer-foods'],
    ['n-algae', 'n-fiddlers', 5, 4, 3, 0, 'no-shown-food'],
    ['n-mangrove', 'n-mudskipper', 5, 5, 5, 2, 'unchanged'],
    ['n-mudskipper', 'n-heron', 5, 4, 3, 0, 'no-shown-food'],
    ['n-heron', 'n-mudskipper', 5, 5, 5, 2, 'unchanged'],
    ['n-mudskipper', 'n-mudskipper', 5, 4, 3, 0, 'removed'],
  ])('reads the specified %s / %s row', (remove, inspect, present, supported, active, foods, status) => {
    const { outputs: o, model } = read(remove as string, inspect as string);
    expect([o['present-count'], o['supported-count'], o['active-links'], o.foods, o['food-status']]).toEqual([present, supported, active, foods, status]);
    expect(model.nodes.filter((n) => n.present)).toHaveLength(present as number);
    expect(model.nodes.filter((n) => n.supported)).toHaveLength(supported as number);
    expect(model.edges.filter((e) => e.active)).toHaveLength(active as number);
    expect(model.nodes.find((n) => n.inspect)?.id).toBe(inspect);
  });
  it('reads all 56 combinations deterministically; tide changes only pose outputs', () => {
    const removes = ['none', ...web.nodes.map((n) => n.id)];
    for (const remove of removes) for (const node of web.nodes.filter((n) => n.role === 'consumer')) {
      const low = read(remove, node.id, 'low');
      const high = read(remove, node.id, 'high');
      expect(read(remove, node.id, 'low')).toEqual(low);
      for (const id of ['present-count', 'supported-count', 'active-links', 'foods', 'food-status']) expect(high.outputs[id]).toEqual(low.outputs[id]);
      expect([high.outputs['water-rise'], high.outputs['crab-rise'], high.outputs['show-fiddlers']]).toEqual([.14, .16, 0]);
      expect([low.outputs['water-rise'], low.outputs['crab-rise'], low.outputs['show-fiddlers']]).toEqual([0, 0, remove === 'n-fiddlers' ? 0 : 1]);
    }
  });
  it('keeps unsupported consumers present; selecting and inspecting are independent', () => {
    const values = resolveSimValues(sim, { remove: 'n-algae', inspect: 'n-mudskipper' });
    const model = foodWebModel(web, evaluateSim(sim, values), values, 'fiddlers');
    expect(model.nodes.find((n) => n.id === 'n-fiddlers')).toMatchObject({ selected: true, present: true, supported: false, inspect: false });
    expect(model.nodes.find((n) => n.id === 'n-mudskipper')).toMatchObject({ selected: false, inspect: true, supported: true });
    expect(model.nodes.find((n) => n.id === 'n-mangrove')).toMatchObject({ supported: true });
  });
  it('crops fixed arrows to the node boxes without non-finite paths', () => {
    expect(foodEdgePath([.5, .1], [.5, .9])).toBe('M160,78L160,302');
    expect(foodEdgePath([.1, .5], [.9, .5])).toBe('M104,190L216,190');
    expect(foodEdgePath([.5, .5], [.5, .5])).not.toMatch(/NaN|Infinity/);
  });
});

describe('food-web validation paths', () => {
  it.each([
    ['duplicate node', (w: typeof web) => { w.nodes[1]!.id = w.nodes[0]!.id; }, 'nodes.1.id: duplicate node'],
    ['duplicate edge id', (w: typeof web) => { w.edges[1]!.id = w.edges[0]!.id; }, 'edges.1.id: duplicate edge'],
    ['duplicate endpoints', (w: typeof web) => { w.edges[1]!.from = w.edges[0]!.from; w.edges[1]!.to = w.edges[0]!.to; }, 'edges.1: duplicate edge endpoints'],
    ['self loop', (w: typeof web) => { w.edges[0]!.to = w.edges[0]!.from; }, 'edges.0: self-loop'],
    ['unknown endpoint', (w: typeof web) => { w.edges[0]!.from = 'unknown'; }, 'edges.0.from: unknown node'],
    ['cycle', (w: typeof web) => { w.edges.push({ ...w.edges[0]!, id: 'back', from: 'n-heron', to: 'n-tree-crabs' }); }, 'edges: cycle'],
    ['producer incoming', (w: typeof web) => { w.edges[0]!.to = 'n-algae'; }, 'edges.0.to: a producer'],
    ['consumer no source', (w: typeof web) => { w.edges = w.edges.filter((e) => e.to !== 'n-heron'); }, 'nodes.5: consumer'],
    ['unknown part', (w: typeof web) => { w.nodes[0]!.parts = ['unknown']; }, 'nodes.0.parts.0: unknown part'],
    ['shared part', (w: typeof web) => { w.nodes[1]!.parts = w.nodes[0]!.parts; }, 'nodes.1.parts.0: shared'],
    ['unknown inspect', (w: typeof web) => { w.inspect = 'unknown'; }, 'inspect:'],
    ['wrong inspect options', (w: typeof web) => { w.inspect = 'remove'; }, 'inspect: inspect options'],
    ['unknown output', (w: typeof web) => { w.nodes[0]!.output = 'unknown'; }, 'nodes.0.output:'],
    ['wrong node kind', (w: typeof web) => { w.nodes[0]!.output = 'foods'; }, 'nodes.0.output:'],
    ['wrong edge kind', (w: typeof web) => { w.edges[0]!.output = 'food-status'; }, 'edges.0.output:'],
  ])('rejects %s', (_name, mutate, expected) => {
    const w = copy(web); mutate(w);
    expect(issues(w).some((s) => s.includes(expected))).toBe(true);
  });
  it('rejects a context part, an incomplete state label set and non-binary edge rows', () => {
    expect(issues(web, sim.outputs, controls, parts, new Set(['mangrove']))).toContain('nodes.0.parts.0: "mangrove" is a context part and cannot be selected');
    const outputs = copy(sim.outputs); delete outputs.find((o) => o.id === web.nodes[0]!.output)!.states!['removed'];
    expect(issues(web, outputs).some((s) => s.includes('state label "removed"'))).toBe(true);
    const table = copy(sim.table!); table.experiments.web!.rows[0]!.set[web.edges[0]!.output] = 2;
    expect(foodWebIssues(web, controls, sim.outputs, parts, new Set(), table).some((x) => x.message.includes('only 0 or 1'))).toBe(true);
  });
  it('rejects non-choice inspection, incomplete bilingual labels and unknown edge outputs', () => {
    const changedControls = new Map(controls);
    changedControls.set('inspect', { id: 'inspect', kind: 'toggle', default: false, label: { en: 'Inspect', zh: '观察' } });
    expect(issues(web, sim.outputs, changedControls).some((s) => s.includes('existing choice control'))).toBe(true);
    const outputs = copy(sim.outputs); outputs.find((o) => o.id === web.nodes[0]!.output)!.states!['removed']!.zh = '';
    expect(issues(web, outputs).some((s) => s.includes('state label "removed"'))).toBe(true);
    const changed = copy(web); changed.edges[0]!.output = 'unknown';
    expect(issues(changed).some((s) => s.includes('edges.0.output'))).toBe(true);
  });
  it('rejects sources not in the topic source registry', () => {
    const w = copy(web); w.nodes[0]!.sources = ['S99']; w.edges[0]!.sources = ['S98'];
    expect(foodWebSourceIssues(w, new Set(['S1']))).toEqual([
      { path: ['nodes', 0, 'sources', 0], message: 'unknown source "S99" (not in data/sources.json)' },
      { path: ['edges', 0, 'sources', 0], message: 'unknown source "S98" (not in data/sources.json)' },
    ]);
  });
  it.each([
    ['outside x', (w: typeof web) => { w.nodes[0]!.d[0] = 1; }, 'nodes.0.d.0'],
    ['nonfinite y', (w: typeof web) => { w.nodes[0]!.d[1] = Infinity; }, 'nodes.0.d.1'],
    ['blank card note', (w: typeof web) => { w.note.zh = '  '; }, 'note.zh'],
    ['blank edge note', (w: typeof web) => { w.edges[0]!.note.en = ''; }, 'edges.0.note.en'],
    ['extra field', (w: typeof web) => { Object.assign(w.edges[0]!, { weight: .1 }); }, 'edges.0'],
  ])('rejects %s in strict schema', (_name, mutate, expected) => {
    const w = copy(web); mutate(w); const parsed = foodWebSchema.safeParse(w);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.some((x) => x.path.join('.') === expected)).toBe(true);
  });
  it('rejects foodWeb on another sim kind', () => {
    const changed = simSchema.parse({ ...fixture.sim, kind: 'sort' });
    expect(simIssues(changed, { parts, flows: new Map(), animations: new Map(), poses: new Set(), countable: new Set() }).some((x) => x.path.join('.') === 'foodWeb')).toBe(true);
  });
});
