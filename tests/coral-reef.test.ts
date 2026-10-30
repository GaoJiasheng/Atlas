import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { partsFile } from '../src/engines/space-scene/schema';
import { evaluateSim } from '../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../src/engines/space-scene/lib/sim/bind';
import { resolveAllPartDisplays } from '../src/engines/space-scene/lib/visibility';
import type { SimValues } from '../src/engines/space-scene/sim-schema';

const dir = join(import.meta.dirname, '../src/content/topics/coral-reef');
const file = partsFile.parse(JSON.parse(readFileSync(join(dir, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const chapters = readdirSync(join(dir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(join(dir, 'chapters', f), 'utf8');
  return { ...parseYaml(text.split(/^---$/m)[1]!), body: text.split(/^---$/m).slice(2).join('---') };
});
const evaluate = (values: SimValues = {}) => evaluateSim(sim, resolveSimValues(sim, values));
const effects = (values: SimValues) => simEffects(sim, resolveSimValues(sim, values), evaluate(values));
const at = (chapter: string, beat: number) => {
  const c = chapters.find((c) => c.id === chapter)!;
  return resolveSimValues(sim, { ...c.state.sim.set, ...c.state.beats[beat - 1].sim?.set });
};

// Independent curriculum graph, deliberately not read from the table or its foodWeb metadata.
// A work-list reachability oracle catches indirect support loss and disconnected components.
const producers = ['n-symbionts', 'n-phytoplankton', 'n-turf-algae'];
const consumers = ['n-zooplankton', 'n-coral', 'n-parrotfish'];
const nodes = [...producers, ...consumers];
const edges = [
  ['e-symbionts-coral', 'n-symbionts', 'n-coral'],
  ['e-phyto-zoo', 'n-phytoplankton', 'n-zooplankton'],
  ['e-zoo-coral', 'n-zooplankton', 'n-coral'],
  ['e-algae-parrotfish', 'n-turf-algae', 'n-parrotfish'],
] as const;
function graphOracle(remove: string, inspect: string): Record<string, number | string> {
  const present = new Set(nodes.filter((id) => id !== remove));
  const supported = new Set(producers.filter((id) => present.has(id)));
  const queue = [...supported];
  while (queue.length) {
    const source = queue.shift()!;
    for (const [, from, to] of edges) if (from === source && present.has(to) && !supported.has(to)) {
      supported.add(to); queue.push(to);
    }
  }
  const active = edges.filter(([, from, to]) => present.has(from) && present.has(to) && supported.has(from));
  const count = (id: string) => active.filter(([, , to]) => to === id).length;
  const status = (id: string) => !present.has(id) ? 'removed' : producers.includes(id) ? 'unchanged'
    : count(id) === 0 ? 'no-shown-food' : count(id) < edges.filter(([, , to]) => to === id).length ? 'fewer-foods' : 'unchanged';
  return {
    'present-count': present.size, 'supported-count': supported.size, 'active-links': active.length,
    ...Object.fromEntries(nodes.map((id) => [`status-${id}`, status(id)])),
    ...Object.fromEntries(edges.map(([id]) => [`active-${id}`, Number(active.some(([edge]) => edge === id))])),
    foods: count(inspect), 'food-status': status(inspect),
  };
}
const evidence = ['partnered', 'bleached-alive', 'dead-skeleton'];
const combinations = ['none', ...nodes].flatMap((remove) => consumers.flatMap((inspect) =>
  [1, 3, 7].flatMap((depth) => ['less-turbid', 'more-turbid'].flatMap((water) => evidence.map((state) => ({
    remove, inspect, 'depth-m': depth, 'water-case': water, 'evidence-state': state,
  }))))));

describe('coral-reef: finite model and independent science-content oracle', () => {
  it.each(combinations)('all outputs and isolation: $remove / $inspect / $depth-m / $water-case / $evidence-state', (values) => {
    const output = evaluate(values);
    const expected = {
      ...graphOracle(values.remove, values.inspect),
      'light-index': 100 * Math.exp(-(values['water-case'] === 'less-turbid' ? .1 : .5) * values['depth-m']),
      'haze-shown': Number(values['water-case'] === 'more-turbid'),
      'tissue-shown': Number(values['evidence-state'] !== 'dead-skeleton'),
      'partners-shown': Number(values['evidence-state'] === 'partnered'),
      'tissue-evidence': values['evidence-state'],
    };
    expect(Object.keys(output).sort()).toEqual(Object.keys(expected).sort());
    for (const [id, value] of Object.entries(expected)) {
      if (id === 'light-index') expect(output[id], id).toBeCloseTo(value as number, 10);
      else expect(output[id], id).toBe(value);
    }
  });

  it('has exactly 378 combinations, 20 outputs and 37 uniquely keyed, sourced rows', () => {
    expect(combinations).toHaveLength(378);
    expect(sim.kind).toBe('table');
    expect(sim.controls.map((c) => [c.id, c.kind, c.kind === 'step' ? c.values : c.kind === 'choice' ? c.options.map((o) => o.id) : [false, true]])).toEqual([
      ['remove', 'choice', ['none', 'n-symbionts', 'n-phytoplankton', 'n-zooplankton', 'n-coral', 'n-turf-algae', 'n-parrotfish']],
      ['inspect', 'choice', consumers], ['depth-m', 'step', [1, 3, 7]],
      ['water-case', 'choice', ['less-turbid', 'more-turbid']], ['evidence-state', 'choice', evidence],
    ]);
    expect(resolveSimValues(sim, {})).toEqual({ remove: 'none', inspect: 'n-coral', 'depth-m': 3, 'water-case': 'more-turbid', 'evidence-state': 'partnered' });
    expect(sim.outputs).toHaveLength(20);
    const experiments = Object.values(sim.table!.experiments);
    expect(experiments.map((e) => e.rows.length).sort((a, b) => a - b)).toEqual([3, 6, 7, 21]);
    expect(experiments.flatMap((e) => e.rows)).toHaveLength(37);
    for (const experiment of experiments) {
      for (const values of combinations) {
        expect(experiment.rows.filter((r) => experiment.keys.every((k) => r.when[k] === values[k as keyof typeof values]))).toHaveLength(1);
      }
      for (const row of experiment.rows) expect(row.source).toEqual(['S50']);
    }
    for (const output of sim.outputs.filter((o) => o.kind === 'number')) expect(output.tag).toBe('sim');
  });

  it.each([
    ['none', 6, 6, 4, 2, 'unchanged'], ['n-symbionts', 5, 5, 3, 1, 'fewer-foods'],
    ['n-phytoplankton', 5, 4, 2, 1, 'fewer-foods'], ['n-zooplankton', 5, 5, 2, 1, 'fewer-foods'],
    ['n-coral', 5, 5, 2, 0, 'removed'], ['n-turf-algae', 5, 4, 3, 2, 'unchanged'],
    ['n-parrotfish', 5, 5, 3, 2, 'unchanged'],
  ])('matches audited numerical case: removing %s', (remove, present, supported, links, foods, status) => {
    const o = evaluate({ remove, inspect: 'n-coral' });
    expect([o['present-count'], o['supported-count'], o['active-links'], o.foods, o['food-status']]).toEqual([present, supported, links, foods, status]);
  });

  it.each([
    [1, 'less-turbid', 90.48374180359595], [3, 'less-turbid', 74.08182206817179], [7, 'less-turbid', 49.65853037914095],
    [1, 'more-turbid', 60.653065971263345], [3, 'more-turbid', 22.313016014842983], [7, 'more-turbid', 3.0197383422318502],
  ])('retains full precision for illustrative light at %sm / %s', (depth, water, expected) => {
    expect(evaluate({ 'depth-m': depth, 'water-case': water })['light-index']).toBeCloseTo(expected as number, 10);
  });

  it('foodWeb metadata agrees with the independent food-to-consumer graph and its distinct specimens', () => {
    const web = sim.foodWeb!;
    expect(web.nodes).toHaveLength(6); expect(web.edges).toHaveLength(4);
    expect(web.nodes.map((n) => n.id).sort()).toEqual([...nodes].sort());
    expect(web.edges.map((e) => [e.id, e.from, e.to])).toEqual(edges);
    const specimens = web.nodes.flatMap((n) => n.parts);
    expect(new Set(specimens).size).toBe(6);
    for (const node of web.nodes) {
      expect(node.role).toBe(producers.includes(node.id) ? 'producer' : 'consumer');
      expect(node.output).toBe(`status-${node.id}`);
      expect(node.parts).toEqual([node.id.replace('n-', 'web-')]);
      expect(file.parts.find((p) => p.id === node.parts[0])?.context).not.toBe(true);
    }
    for (const edge of web.edges) {
      expect(edge.output).toBe(`active-${edge.id}`); expect(edge.evidence).toBe('general');
      expect(edge.sources.length).toBeGreaterThan(0); expect(edge.note.en).toBeTruthy(); expect(edge.note.zh).toBeTruthy();
    }
    const partner = web.edges.find((e) => e.id === 'e-symbionts-coral')!;
    expect(partner.note.en).toMatch(/food|product/i); expect(partner.note.en).toMatch(/swallow|eat|consum|ingest/i);
  });

  it('removal hides only its web specimen, keeps unsupported animals and drives matching flow intensity', () => {
    for (const remove of ['none', ...nodes]) {
      const o = evaluate({ remove }); const fx = effects({ remove });
      for (const node of sim.foodWeb!.nodes) expect(fx.hidden.has(node.parts[0]!)).toBe(node.id === remove);
      expect(fx.hidden.has('polyp-tissue')).toBe(false); expect(fx.hidden.has('polyp-symbionts')).toBe(false);
      for (const [id] of edges) expect(fx.flows.get(id)?.uniform, id).toBe(o[`active-${id}`]);
    }
    expect(evaluate({ remove: 'n-phytoplankton', inspect: 'n-zooplankton' })['food-status']).toBe('no-shown-food');
    expect(effects({ remove: 'n-phytoplankton' }).hidden.has('web-zooplankton')).toBe(false);
    expect(evaluate({ remove: 'n-turf-algae', inspect: 'n-parrotfish' })['food-status']).toBe('no-shown-food');
  });

  it.each(evidence)('uses tissue evidence rather than whiteness, with skeleton retained: %s', (state) => {
    const fx = effects({ 'evidence-state': state });
    for (const id of ['polyp-tissue', 'polyp-mouth', 'polyp-tentacles']) expect(fx.hidden.has(id)).toBe(state === 'dead-skeleton');
    expect(fx.hidden.has('polyp-symbionts')).toBe(state !== 'partnered');
    expect(fx.hidden.has('polyp-skeleton')).toBe(false);
    expect(fx.hidden.has('web-symbionts')).toBe(false);
  });

  it('binds the light index only to a marker and haze to visibility', () => {
    for (const water of ['less-turbid', 'more-turbid']) {
      const v = { 'water-case': water, 'depth-m': 7 };
      expect(effects(v).hidden.has('water-haze')).toBe(water === 'less-turbid');
      expect(effects(v).offset.get('light-marker')).toEqual([0, Number(evaluate(v)['light-index']) * .01, 0]);
    }
    const bindings = sim.bind.filter((b) => b.output === 'light-index');
    expect(bindings).toHaveLength(1);
    expect(bindings[0]).toMatchObject({ part: 'light-marker', offset: { axis: [0, 1, 0], per: .01, origin: 0 } });
  });

  it('has BG + 7 chapters / 39 beats, and indexes all 26 selectable parts without context', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 5, 5, 5, 5, 5]);
    expect(file.parts.filter((p) => !p.context)).toHaveLength(26);
    expect(file.parts.filter((p) => p.context)).toHaveLength(2);
    expect(file.views.hudFrame?.parts).toEqual(file.parts.filter((p) => !p.context).map((p) => p.id));
    const indexed = new Set<string>(chapters.flatMap((c) => c.state.index.parts));
    expect([...indexed].sort()).toEqual(file.parts.filter((p) => !p.context).map((p) => p.id).sort());
    expect(file.flows.map((f) => f.id).sort()).toEqual(edges.map(([id]) => id).sort());
    expect(file.flows.reduce((n, f) => n + f.count, 0)).toBeLessThanOrEqual(80);
  });

  it('models twelve smooth tentacles around one mouth and one matching oral-disc aperture', () => {
    const tentacles = file.parts.find((p) => p.id === 'polyp-tentacles')!;
    const sweeps = [tentacles.primitive!, ...tentacles.extra!];
    expect(sweeps).toHaveLength(12);
    const roots: number[] = [];
    for (const shape of sweeps) {
      expect(shape.kind).toBe('sweep');
      if (shape.kind !== 'sweep') throw new Error('Tentacle must be a single unbranched sweep');
      expect(shape.path).toHaveLength(4);
      expect(Array.isArray(shape.radius)).toBe(true);
      const radii = shape.radius as number[];
      expect(radii.at(-1)!).toBeLessThan(radii[0]!);
      roots.push(Math.atan2(shape.path[0]![2], shape.path[0]![0]));
    }
    roots.sort((a, b) => a - b);
    for (let i = 1; i < roots.length; i++) expect(roots[i]! - roots[i - 1]!).toBeCloseTo(Math.PI / 6, 8);
    const mouth = file.parts.find((p) => p.id === 'polyp-mouth')!;
    expect(mouth.extra ?? []).toHaveLength(0); expect(mouth.repeat).toBeUndefined();
    expect(mouth.primitive!.kind).toBe('sweep');
    if (mouth.primitive!.kind !== 'sweep') throw new Error('Mouth must have one continuous rim');
    expect(mouth.primitive.closed).toBe(true);
    const tissue = file.parts.find((p) => p.id === 'polyp-tissue')!;
    const discs = tissue.extra!.filter((p) => p.kind === 'extrude');
    expect(discs).toHaveLength(1);
    const disc = discs[0]!;
    if (disc.kind !== 'extrude') throw new Error('Oral disc must have an aperture');
    expect(disc.holes).toHaveLength(1);
    for (const [rimAxis, holeAxis] of [[0, 0], [2, 1]] as const) {
      const rim = Math.max(...mouth.primitive.path.map((p) => Math.abs(p[rimAxis])));
      const aperture = Math.max(...disc.holes![0]!.map((p) => Math.abs(p[holeAxis])));
      expect(aperture).toBeCloseTo(rim, 5);
    }
  });

  it('places whole algal-partner spheres inside the tissue wall rather than the cavity or seawater', () => {
    const wall = file.parts.find((p) => p.id === 'polyp-tissue')!.primitive!;
    if (wall.kind !== 'lathe') throw new Error('Tissue wall requires an annular profile');
    const partners = file.parts.find((p) => p.id === 'polyp-symbionts')!;
    const radiiAt = (y: number) => wall.profile.flatMap((p, i) => {
      const q = wall.profile[(i + 1) % wall.profile.length]!;
      return (y >= Math.min(p[1], q[1]) && y < Math.max(p[1], q[1]))
        ? [p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1])] : [];
    }).sort((a, b) => a - b);
    const spheres = [partners.primitive!, ...partners.extra!];
    expect(spheres.length).toBeGreaterThan(1);
    for (const sphere of spheres) {
      if (sphere.kind !== 'sphere') throw new Error('Algal partners must be contained cell markers');
      const r = sphere.size[0]!;
      const centre = Math.hypot(sphere.at[0] - wall.at[0], sphere.at[2] - wall.at[2]);
      // Cross-sections through each sphere check the whole dot, not just its centre.
      for (let i = -8; i <= 8; i++) {
        const dy = r * i / 8;
        const radius = Math.sqrt(Math.max(0, r * r - dy * dy));
        const boundary = radiiAt(sphere.at[1] - wall.at[1] + dy);
        expect(boundary).toHaveLength(2);
        expect(centre - radius + 1e-8).toBeGreaterThanOrEqual(boundary[0]!);
        expect(centre + radius - 1e-8).toBeLessThanOrEqual(boundary[1]!);
      }
    }
  });

  it('resets every chapter and never labels an object hidden by its beat or evidence', () => {
    for (const c of chapters) {
      expect(c.state).toMatchObject({ view: 'assembled', run: false, explode: 0, cutaway: 'none' });
      expect(c.state.sim.set).toEqual({ remove: 'none', inspect: 'n-coral', 'depth-m': 3, 'water-case': 'more-turbid', 'evidence-state': 'partnered' });
      for (const beat of c.state.beats) {
        expect(beat.caption.en).toBeTruthy(); expect(beat.caption.zh).toBeTruthy();
        const hidden = new Set([...(beat.hide ?? c.state.hide ?? []), ...effects({ ...c.state.sim.set, ...beat.sim?.set }).hidden]);
        for (const id of beat.labels ?? c.state.labels ?? []) expect(hidden.has(id), `${c.id}/${beat.id}: ${id}`).toBe(false);
      }
    }
  });

  it('keeps every named camera target stage available from each chapter and beat', () => {
    const groups: Record<string, string> = { hero: 'reef-habitat', reef: 'reef-habitat', polyp: 'polyp-closeup', web: 'web-specimens', evidence: 'evidence-tools', conservation: 'evidence-tools' };
    expect(file.presets?.map((p) => p.id).sort()).toEqual(Object.keys(groups).sort());
    for (const c of chapters) for (const beat of [null, ...c.state.beats]) {
      const state = { ...c.state, ...beat };
      const fx = effects({ ...c.state.sim.set, ...beat?.sim?.set });
      const display = resolveAllPartDisplays(file.parts, {
        view: state.view, part: state.part ?? null, layers: state.layers,
        hidden: [...(state.hide ?? []), ...fx.hidden], ghosted: state.ghost ?? [],
      });
      for (const preset of file.presets!) {
        const candidates = file.parts.filter((p) => p.group === groups[preset.id] && !p.context);
        expect(candidates.some((p) => display.get(p.id)?.visible), `${c.id}/${beat?.id ?? 'base'} → ${preset.id}`).toBe(true);
      }
    }
  });

  it('chapter food captions, prediction and record agree with actual counts', () => {
    for (const [beat, count, status] of [[1, 2, 'unchanged'], [2, 1, 'fewer-foods'], [3, 0, 'no-shown-food'], [4, 1, 'fewer-foods']] as const) {
      const o = evaluate(at('changing-one-node', beat));
      expect([o.foods, o['food-status']]).toEqual([count, status]);
    }
    const card = chapters.find((c) => c.id === 'changing-one-node')!.state.sim.try;
    expect(card.record).toBe(true);
    expect(evaluate(card.predict.start).foods).toBe(2);
    expect(evaluate({ ...card.predict.start, ...card.predict.change }).foods).toBe(1);
    expect(card.predict.change).toMatchObject({ remove: 'n-symbionts' });
    expect(card.predict.options.find((o: { means: string }) => o.means === 'less')).toBeDefined();
    expect(chapters.find((c) => c.id === 'reef-zones')!.state.sim.try).toMatchObject({ vary: 'depth-m', also: ['water-case'], observe: ['light-index'] });
    expect(chapters.find((c) => c.id === 'bleaching-and-pressures')!.state.sim.try).toMatchObject({ vary: 'evidence-state', observe: ['tissue-evidence'] });
  });

  it('bleaching captions retain living tissue in the bleached state and never automatically restore partners', () => {
    for (const [beat, tissue, partners] of [[1, 1, 1], [2, 1, 0], [3, 0, 0], [5, 1, 0]]) {
      const o = evaluate(at('bleaching-and-pressures', beat!));
      expect([o['tissue-shown'], o['partners-shown']]).toEqual([tissue, partners]);
    }
  });
});
