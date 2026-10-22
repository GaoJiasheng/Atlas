/**
 * Every SIM outcome in docs/37 §2.5 (T1–T6) with the fact check pass 2
 * corrections (glass 36 MPa, HDPE E 1.2 GPa, rubber E 0.005 GPa: §9), the
 * model's invariants, its registration and the author checks (§4.3–§4.4).
 */
import { describe, expect, it } from 'vitest';
import { materialsIssues, materialsSchema, type MaterialsData } from '../../src/engines/space-scene/materials-schema';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { bridgeSolve, cantileverSolve, materialsQuantity, materialsShowable, materialsStates, solveMaterials, stripSection, stripWeight, tankSolve } from '../../src/engines/space-scene/lib/sim/materials';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { chapterSimIssues, quantityKind, simIssues, simSchema, type SimControl, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { MATERIAL_IDS, MATERIALS_CONTROLS, MATERIALS_OUTPUTS, materialsBench as m, materialsSim } from './fixtures/materials-bench';
import { msPerCall } from '../timing';

const sim = materialsSim();
const controls = new Map(sim.controls.map((c) => [c.id, c]));
const run = (set: SimValues = {}) => solveMaterials(m, { ...resolveSimValues(sim, {}), ...set }, sim.controls);
const ctx = { parts: new Set<string>(), flows: new Map(), animations: new Map(), poses: new Set<string>(), countable: new Set<string>() };
const cm = (metres: number) => metres * 100;
const MPa = (pa: number) => pa / 1e6;
const clone = (patch: (d: MaterialsData) => void): MaterialsData => {
  const d = structuredClone(m) as MaterialsData;
  patch(d);
  return d;
};
const issues = (d: MaterialsData, cs: ReadonlyMap<string, SimControl> = controls) => materialsIssues(d, cs).map((x) => `${x.path.join('.')}: ${x.message}`);

describe('the strips (§2.5 head)', () => {
  it('2 mm × 3 cm: I = 2.0 × 10⁻¹¹ m⁴, Z = 2.0 × 10⁻⁸ m³', () => {
    const { I, Z } = stripSection(m);
    expect(I).toBeCloseTo(2.0e-11, 20);
    expect(Z).toBeCloseTo(2.0e-8, 17);
    expect(stripWeight(m, 'wood')).toBeCloseTo(650 * 9.8 * 0.03 * 0.002, 12);
  });
});

describe('T1 strength on two supports (§2.5, 7 × 6)', () => {
  // [result, bend, sag cm (the table's, where it gives one)] per mass count 0…5.
  type Cell = [string, string, number?];
  const TABLE: Record<string, Cell[]> = {
    metal: [['holds', 'hardly'], ['holds', 'hardly'], ['holds', 'hardly'], ['holds', 'hardly'], ['holds', 'hardly'], ['holds', 'hardly', 0.1]],
    wood: [['holds', 'hardly'], ['holds', 'hardly', 0.38], ['holds', 'a-little', 0.76], ['holds', 'a-little', 1.15], ['holds', 'a-little', 1.53], ['holds', 'a-little', 1.91]],
    // Pass 2: glass (36 MPa) and ceramic (35 MPa) both snap at the third mass — no order between them.
    glass: [['holds', 'hardly'], ['holds', 'hardly', 0.06], ['holds', 'hardly', 0.12], ['snapped', 'none'], ['snapped', 'none'], ['snapped', 'none']],
    ceramic: [['holds', 'hardly'], ['holds', 'hardly', 0.06], ['holds', 'hardly', 0.12], ['snapped', 'none'], ['snapped', 'none'], ['snapped', 'none']],
    plastic: [['holds', 'hardly', 0.05], ['holds', 'a-lot', 3.45], ['on-bench', 'a-lot'], ['on-bench', 'a-lot'], ['on-bench', 'a-lot'], ['on-bench', 'a-lot']],
    rubber: Array.from({ length: 6 }, (): Cell => ['on-bench', 'a-lot']),
    fabric: Array.from({ length: 6 }, (): Cell => ['on-bench', 'a-lot']),
  };
  for (const [id, row] of Object.entries(TABLE))
    it.each(row.map((cell, n) => [n, ...cell] as const))(`${id} with %i masses → %s, %s`, (n, result, bend, sag) => {
      const r = bridgeSolve(m, id, n);
      expect(r.result).toBe(result);
      expect(r.bend).toBe(bend);
      expect(r.view).toBe(result === 'snapped' ? `${id}-snapped` : id);
      if (sag !== undefined) expect(Math.abs(cm(r.deflection) - sag)).toBeLessThan(0.01);
      expect(r.sag).toBe(result === 'snapped' ? 0 : result === 'on-bench' ? m.bridge!.clearance : r.deflection);
    });
  it.each([['glass', 2, 24.9], ['glass', 3, 37.1], ['ceramic', 2, 24.9], ['ceramic', 3, 37.1], ['plastic', 1, 12.4], ['metal', 5, 62.4]] as const)('%s with %i masses: σ %s MPa', (id, n, sigma) => {
    expect(MPa(bridgeSolve(m, id, n).stress)).toBeCloseTo(sigma, 1);
  });
  it('plastic reaches the bench under about 8.6 N, at 21.6 MPa (below the 25 MPa guard), and no more after', () => {
    const r = bridgeSolve(m, 'plastic', 2);
    expect(MPa(r.stress)).toBeCloseTo(21.6, 1);
    expect(bridgeSolve(m, 'plastic', 5).stress).toBe(r.stress);
    const { I } = stripSection(m);
    const P = ((0.06 - (5 * stripWeight(m, 'plastic') * 0.2 ** 4) / (384 * 1.2e9 * I)) * 48 * 1.2e9 * I) / 0.2 ** 3;
    expect(P).toBeCloseTo(8.6, 1);
  });
  it('end state with five masses: steel and wood hold; glass and ceramic snap; plastic and rubber on the bench; fabric lies on it', () => {
    expect(MATERIAL_IDS.map((id) => bridgeSolve(m, id, 5).result)).toEqual(['holds', 'holds', 'snapped', 'on-bench', 'snapped', 'on-bench', 'on-bench']);
  });
  it('sag never falls as masses go on; it stops at the bench; snapped stays snapped', () => {
    for (const id of MATERIAL_IDS) {
      let last = -1;
      let snapped = false;
      for (let n = 0; n <= 5; n++) {
        const r = bridgeSolve(m, id, n);
        if (snapped) expect(r.result).toBe('snapped');
        snapped ||= r.result === 'snapped';
        if (!snapped) {
          expect(r.sag).toBeGreaterThanOrEqual(last);
          expect(r.sag).toBeLessThanOrEqual(m.bridge!.clearance);
          last = r.sag;
        }
      }
    }
  });
  it('masses-kg is the apparatus reading: count × 0.5 kg', () => {
    expect(run({ masses: 3 })['control:masses-kg']).toBe(1.5);
    expect(run({ masses: 0 })['control:masses-kg']).toBe(0);
  });
});

describe('T2 flexibility, clamped (§2.5, 7 × 5)', () => {
  const ROWS: Record<string, string[]> = {
    metal: ['not-pushed', 'bends', 'bends', 'bends', 'bends'],
    wood: ['not-pushed', 'bends', 'bends', 'bends', 'bends'],
    glass: ['not-pushed', 'bends', 'bends', 'snapped', 'snapped'],
    ceramic: ['not-pushed', 'bends', 'bends', 'snapped', 'snapped'],
    plastic: ['droops', 'droops', 'droops', 'droops', 'droops'],
    rubber: ['droops', 'droops', 'droops', 'droops', 'droops'],
    fabric: ['droops', 'droops', 'droops', 'droops', 'droops'],
  };
  const PUSH = [0, 0.5, 1, 1.5, 2];
  for (const [id, row] of Object.entries(ROWS))
    it.each(row.map((r, i) => [PUSH[i]!, r] as const))(`${id} pushed %s cm → %s`, (push, result) => {
      const r = cantileverSolve(m, id, push);
      expect(r.result).toBe(result);
      expect(r.view).toBe(result === 'snapped' ? `${id}-snapped` : id);
      if (result === 'snapped') expect(r.tip).toBe(0);
      else expect(r.tip).toBeCloseTo(Math.min(Math.max(push / 100, r.droop), 0.8 * 0.25), 12);
    });
  it.each([['metal', 0.06], ['wood', 0.09], ['glass', 0.05], ['ceramic', 0.05], ['plastic', 1.14]] as const)('%s droops %s cm by itself', (id, droop) => {
    expect(Math.abs(cm(cantileverSolve(m, id, 0).droop) - droop)).toBeLessThan(0.01);
  });
  it.each([['metal', 2, 192], ['wood', 2, 10.3], ['glass', 0.5, 16.8], ['glass', 1, 33.6], ['glass', 1.5, 50.4], ['ceramic', 1, 33.6]] as const)('%s pushed %s cm: σ %s MPa', (id, push, sigma) => {
    expect(MPa(cantileverSolve(m, id, push).stress)).toBeCloseTo(sigma, 1);
  });
  it('rubber hangs down: its end at 0.8 × 25 cm = 20 cm', () => expect(cm(cantileverSolve(m, 'rubber', 2).tip)).toBeCloseTo(20, 10));
  it('plastic droops 1.14 cm by itself; the peg reaches it from 1.5 cm (pass 2 tips 1.14 / 1.14 / 1.14 / 1.50 / 2.00)', () => {
    expect([0, 0.5, 1, 1.5, 2].map((p) => Math.round(cm(cantileverSolve(m, 'plastic', p).tip) * 100) / 100)).toEqual([1.14, 1.14, 1.14, 1.5, 2]);
  });
  it('the stress at the clamp rises with every push', () => {
    for (const id of MATERIAL_IDS) {
      const s = PUSH.map((p) => cantileverSolve(m, id, p).stress);
      for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThanOrEqual(s[i - 1]!);
    }
  });
});

describe('T3 float or sink (§2.5, nine rows)', () => {
  it.each([
    ['wood', 'floats', 1.95, 16.05],
    ['wood-big', 'floats', 3.9, 14.1],
    ['metal', 'sinks', 3, 0],
    ['ceramic', 'sinks', 3, 0],
    ['rubber', 'floats', 2.76, 15.24],
    ['glass', 'sinks', 3, 0],
    ['plastic', 'floats', 2.865, 15.135],
    ['bottle', 'floats', 0.26, 17.74],
    ['fabric', 'sinks', 1, 0],
  ] as const)('%s → %s, %s cm in the water, underside %s cm up', (id, result, immersed, rise) => {
    const r = tankSolve(m, id);
    expect(r.result).toBe(result);
    expect(r.immersed).toBeCloseTo(immersed, 10);
    expect(r.rise).toBeCloseTo(rise, 10);
    expect(run({ block: id })['tank:rise']).toBe(r.rise);
  });
  it('rubber and plastic stay near the surface: only 2.4 and 1.35 mm above it', () => {
    expect((3 - tankSolve(m, 'rubber').immersed) * 10).toBeCloseTo(2.4, 9);
    expect((3 - tankSolve(m, 'plastic').immersed) * 10).toBeCloseTo(1.35, 9);
  });
  it('jumps across the boundary: just lighter than water floats near the top, just heavier lies on the floor', () => {
    const near = (density: number) => tankSolve(clone((d) => { d.tank!.blocks.bottle = { density, height: 3 }; }), 'bottle');
    expect(near(999.9).result).toBe('floats');
    expect(near(999.9).rise).toBeGreaterThan(14.9);
    expect(near(1000).result).toBe('sinks');
    expect(near(1000).rise).toBe(0);
  });
});

describe('T4 a drop of water, T5 light through (§2.5)', () => {
  it.each([['wood', 'soaks-in'], ['metal', 'stays-on-top'], ['ceramic', 'stays-on-top'], ['rubber', 'stays-on-top'], ['glass', 'stays-on-top'], ['plastic', 'stays-on-top'], ['fabric', 'soaks-in']] as const)('%s → %s', (id, r) => {
    expect(run({ square: id })['drops:result']).toBe(r);
  });
  it.each([['wood', 'none', 1], ['metal', 'none', 1], ['ceramic', 'none', 1], ['rubber', 'none', 1], ['glass', 'most', 0.1], ['plastic', 'some', 0.6], ['fabric', 'some', 0.6]] as const)('%s → %s light, shadow %s', (id, r, dark) => {
    const q = run({ square: id });
    expect(q['light:result']).toBe(r);
    expect(q['light:dark']).toBe(dark);
  });
});

describe('T6 the five tests together (§2.5, 7 × 5)', () => {
  it.each([
    ['wood', 'holds', 'bends', 'floats', 'soaks-in', 'none'],
    ['metal', 'holds', 'bends', 'sinks', 'stays-on-top', 'none'],
    ['ceramic', 'snapped', 'snapped', 'sinks', 'stays-on-top', 'none'],
    ['rubber', 'on-bench', 'droops', 'floats', 'stays-on-top', 'none'],
    ['glass', 'snapped', 'snapped', 'sinks', 'stays-on-top', 'most'],
    ['plastic', 'on-bench', 'droops', 'floats', 'stays-on-top', 'some'],
    ['fabric', 'on-bench', 'droops', 'sinks', 'soaks-in', 'some'],
  ] as const)('%s: %s · %s · %s · %s · %s', (pick, strength, flex, float, water, light) => {
    const q = run({ pick });
    expect([q['profile:strength'], q['profile:flex'], q['profile:float'], q['profile:water'], q['profile:light']]).toEqual([strength, flex, float, water, light]);
    // The same answers as the single tests at the profile's settings.
    const single = run({ strip: pick, masses: 5, push: 2, block: pick, square: pick });
    expect([single['bridge:result'], single['cantilever:result'], single['tank:result'], single['drops:result'], single['light:result']]).toEqual([strength, flex, float, water, light]);
  });
  it('never reads `not-pushed` in the profile (its push is above 0)', () => expect(materialsStates(m, 'profile:flex', sim.controls)).toEqual(['bends', 'snapped', 'droops']));
});

describe('registration and outputs', () => {
  it('is a separate-experiments bench with no timeline', () => {
    expect(SEPARATE_EXPERIMENTS.materials).toBe(true);
    expect(quantityKind(sim, 'bridge:result')).toBe('state');
    expect(quantityKind(sim, 'bridge:sag')).toBe('number');
    expect(quantityKind(sim, 'control:masses-kg')).toBe('number');
    expect(quantityKind(sim, 'control:strip')).toBe(null);
    expect(quantityKind(sim, 'bridge:nothing')).toBe(null);
    expect(materialsQuantity(m, 'profile:light', sim.controls)).toBe('state');
    // A test left out of the data gives none of its quantities.
    expect(materialsQuantity(clone((d) => { delete d.drops; }), 'drops:result', sim.controls)).toBe(null);
  });
  it('the fixture is a clean author template', () => expect(simIssues(sim, ctx)).toEqual([]));
  it('evaluates every declared output at the defaults', () => {
    const out = evaluateSim(sim, resolveSimValues(sim, {}));
    expect(out).toMatchObject({ 'strength-result': 'holds', 'strength-bend': 'hardly', 'bridge-view': 'wood', 'flex-result': 'not-pushed', 'float-result': 'floats', 'drop-result': 'stays-on-top', 'light-result': 'some', 'light-dark': 0.6, 'p-strength': 'holds', 'masses-on': 0, 'push-down': 0 });
  });
  it('lists only the states that can happen, in first-seen order', () => {
    expect(materialsStates(m, 'bridge:result', sim.controls)).toEqual(['holds', 'snapped', 'on-bench']);
    expect(materialsStates(m, 'bridge:view', sim.controls)?.sort()).toEqual([...MATERIAL_IDS, 'ceramic-snapped', 'glass-snapped'].sort());
    expect(materialsStates(m, 'cantilever:result', sim.controls)).toEqual(['not-pushed', 'bends', 'snapped', 'droops']);
    expect(materialsStates(m, 'bridge:sag', sim.controls)).toBeUndefined();
  });
  it('is deterministic and quick (< 0.05 ms an evaluation)', () => {
    const values = resolveSimValues(sim, { strip: 'plastic', masses: 3, push: 1.5, block: 'bottle', square: 'fabric', pick: 'glass' });
    expect(evaluateSim(sim, values)).toEqual(evaluateSim(sim, values));
    expect(msPerCall(() => evaluateSim(sim, values), 50)).toBeLessThan(0.05);
  });
  it('round-trips the URL sim=strip.glass~masses.5', () => {
    const decoded = decodeSimParam('strip.glass~masses.5');
    expect(decoded).toEqual({ strip: 'glass', masses: 5 });
    expect(encodeSimParam(decoded)).toBe('masses.5~strip.glass');
    const out = evaluateSim(sim, resolveSimValues(sim, decoded));
    expect(out['strength-result']).toBe('snapped');
    expect(out['bridge-view']).toBe('glass-snapped');
    expect(out['bridge-sag']).toBe(0);
  });
  it('shows only outcomes and apparatus readings (D9)', () => {
    const shown = MATERIALS_OUTPUTS.filter((o) => materialsShowable({ ...o, kind: (o.kind ?? 'number') as 'number' | 'state' })).map((o) => o.id);
    expect(shown).not.toContain('bridge-sag');
    expect(shown).not.toContain('light-dark');
    expect(shown).toContain('masses-on');
    expect(shown).toContain('strength-result');
  });
  it('drives visible / count / offset / pose and bend bindings', () => {
    const bound = simSchema.parse({
      ...sim,
      bind: [
        { output: 'bridge-view', part: 'bridge-glass', visible: { eq: 'glass' } },
        { output: 'bridge-view', part: 'bridge-glass-snapped', visible: { eq: 'glass-snapped' } },
        { control: 'masses', part: 'bridge-masses', count: { per: 1 } },
        { output: 'bridge-sag', part: 'bridge-hanger', offset: { axis: [0, -1, 0], per: 1 } },
        { output: 'bridge-sag', part: 'bridge-wood', bend: { mode: 'bridge', axis: [1, 0, 0], span: 0.2 } },
        { output: 'flex-tip', part: 'bend-wood', bend: { mode: 'cantilever', axis: [1, 0, 0], clamp: -0.1, reach: 0.25, ease: 0.3 } },
      ],
    });
    const values = resolveSimValues(bound, { strip: 'glass', masses: 5, push: 1 });
    const e = simEffects(bound, values, evaluateSim(bound, values));
    expect(e.hidden.has('bridge-glass')).toBe(true);
    expect(e.hidden.has('bridge-glass-snapped')).toBe(false);
    expect(e.count.get('bridge-masses')).toBe(5);
    expect(e.offset.get('bridge-hanger')?.[1]).toBeCloseTo(0, 12);
    expect(e.bend.get('bridge-wood')).toEqual({ target: 0, mode: 'bridge', axis: [1, 0, 0], span: 0.2, ease: 0.5 });
    expect(e.bend.get('bend-wood')).toEqual({ target: 0.01, mode: 'cantilever', axis: [1, 0, 0], clamp: -0.1, reach: 0.25, ease: 0.3 });
    const wood = resolveSimValues(bound, { strip: 'wood', masses: 5, push: 2 });
    const ew = simEffects(bound, wood, evaluateSim(bound, wood));
    expect(ew.bend.get('bridge-wood')!.target).toBeCloseTo(bridgeSolve(m, 'wood', 5).sag, 15);
    expect(ew.bend.get('bend-wood')!.target).toBeCloseTo(0.02, 15);
    expect(ew.offset.get('bridge-hanger')?.[1]).toBeCloseTo(-bridgeSolve(m, 'wood', 5).sag, 15);
  });
});

describe('author checks (§4.3, §4.4)', () => {
  const without = (id: string) => new Map([...controls].filter(([k]) => k !== id));
  it('a missing control or a control of the wrong kind', () => {
    expect(issues(m, without('masses'))).toContain('bridge.masses: unknown control "masses"');
    const swapped = new Map(controls);
    swapped.set('strip', { ...(controls.get('masses') as SimControl), id: 'strip' });
    expect(issues(m, swapped)).toContain('bridge.strip: "strip" is a step control, not a choice');
  });
  it('options that are not the samples, either way', () => {
    const fewer = new Map(controls);
    const strip = controls.get('strip') as Extract<SimControl, { kind: 'choice' }>;
    fewer.set('strip', { ...strip, options: strip.options.filter((o) => o.id !== 'fabric') });
    expect(issues(m, fewer)).toContain('bridge.strip: sample "fabric" is not an option of "strip"');
    const extra = clone((d) => { delete d.samples.fabric; });
    expect(issues(extra).some((x) => x.includes('option "fabric" of "strip" has no sample'))).toBe(true);
  });
  it('sample consistency: snaps needs a limit, limp has no E, never has no limit', () => {
    expect(issues(clone((d) => { delete d.samples.glass!.limit; }))).toContain('samples.glass.limit: a sample that snaps needs its breaking stress `limit` (MPa)');
    expect(issues(clone((d) => { d.samples.fabric!.E = 1; }))).toContain('samples.fabric.E: a limp sample has no E (it cannot hold itself up)');
    expect(issues(clone((d) => { delete d.samples.wood!.E; }))).toContain('samples.wood.E: give E (GPa), or `limp: true`');
    expect(issues(clone((d) => { d.samples.rubber!.limit = 5; }))).toContain('samples.rubber.limit: a sample that never fails has no `limit`');
  });
  it('a material that bends must never reach its limit (it would stay bent)', () => {
    const weak = issues(clone((d) => { d.samples.metal!.limit = 150; }));
    expect(weak.some((x) => x.startsWith('cantilever.push: "metal" reaches its limit pushed 2 cm'))).toBe(true);
    expect(issues(clone((d) => { d.samples.plastic!.limit = 14; })).some((x) => x.startsWith('bridge.masses: "plastic" reaches its limit with 2 masses'))).toBe(true);
  });
  it('a floating thing must not touch the floor; the water must fit the tank', () => {
    expect(issues(clone((d) => { d.tank!.water = 3; })).some((x) => x.includes('"wood-big" floats 3.90 cm deep in 3 cm of water'))).toBe(true);
    expect(issues(clone((d) => { d.tank!.height = 18; }))).toContain('tank.water: 18 cm of water does not fit a 18 cm tank');
    expect(issues(clone((d) => { d.tank!.blocks.wood = { sample: 'oak', height: 3 }; }))).toContain('tank.blocks.wood.sample: unknown sample "oak"');
    expect(issues(clone((d) => { d.tank!.blocks.cork = { density: 240, height: 3 }; }))).toContain('tank.blocks.cork: "cork" is not an option of "block"');
  });
  it('the light outcomes darken in order; the profile reads legal values of all five tests', () => {
    expect(issues(clone((d) => { d.light!.dark = { most: 0.6, some: 0.1, none: 1 }; }))).toContain('light.dark: shadows darken from most to some to none light through');
    expect(issues(clone((d) => { d.profile!.masses = 6; }))).toContain('profile.masses: 6 is not a value of "masses"');
    expect(issues(clone((d) => { delete d.drops; }))).toContain('profile: profile reads all five tests: give `drops`');
  });
  it('outputs: a quantity of this model, of the right kind, every state labelled and none that never happens', () => {
    const bad = (patch: (o: typeof MATERIALS_OUTPUTS) => void) => {
      const outputs = structuredClone(MATERIALS_OUTPUTS);
      patch(outputs);
      return simIssues(simSchema.parse({ kind: 'materials', controls: MATERIALS_CONTROLS, outputs, materials: m }), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);
    };
    expect(bad((o) => { o[3]!.from = 'bridge:stress'; })).toContain('outputs.3.from: the materials model has no quantity "bridge:stress"');
    expect(bad((o) => { o[0]!.kind = 'number'; delete (o[0] as { states?: unknown }).states; })).toContain('outputs.0.kind: "bridge:result" is a state, not a number');
    expect(bad((o) => { (o[2]!.states as Record<string, unknown>)['wood-snapped'] = { en: 'x', zh: 'x' }; }).some((x) => x.startsWith('outputs.2.states.wood-snapped: "bridge:view" is never "wood-snapped"'))).toBe(true);
    expect(bad((o) => { delete (o[0]!.states as Record<string, unknown>).snapped; })).toContain('outputs.0.states: "bridge:result" can be "snapped": give it a label');
    expect(simIssues(simSchema.parse({ kind: 'materials', controls: MATERIALS_CONTROLS, outputs: MATERIALS_OUTPUTS }), ctx).map((x) => x.message)).toContain('a materials sim needs `materials`');
  });
  it('a card shows outcomes and the apparatus, never the model\'s own numbers (D9)', () => {
    expect(chapterSimIssues('', { try: { vary: 'strip', observe: ['strength-result', 'masses-on'] } }, sim)).toEqual([]);
    expect(chapterSimIssues('', { try: { vary: 'strip', observe: ['bridge-sag'] } }, sim)).toEqual(['sim.try: "bridge-sag" is one of the model\'s own numbers: a materials card shows outcomes (states) and the apparatus (control readings)']);
    const predict = { prompt: { en: 'p', zh: 'p' }, change: { square: 'wood' }, observe: 'light-dark', options: [{ id: 'a', label: { en: 'a', zh: 'a' }, means: 'more' as const }, { id: 'b', label: { en: 'b', zh: 'b' }, means: 'less' as const }] };
    expect(chapterSimIssues('', { try: { vary: 'square', observe: ['light-result'], predict } }, sim)[0]).toContain('"light-dark" is one of the model\'s own numbers');
  });
  it('rejects unknown fields (strict data)', () => {
    expect(materialsSchema.safeParse({ ...m, extra: 1 }).success).toBe(false);
    expect(materialsSchema.safeParse({ ...m, samples: { ...m.samples, wood: { ...m.samples.wood, colour: 'brown' } } }).success).toBe(false);
  });
});

describe('the bend binding checks (§4.5)', () => {
  const part = (id: string, primitive: Record<string, unknown>, more: Record<string, unknown> = {}) => ({ id, primitive: { at: [0, 0, 0], color: 'wood', ...primitive }, ...more });
  const PARTS = [
    part('strip-a', { kind: 'box', size: [0.3, 0.002, 0.03] }),
    part('strip-b', { kind: 'bevelBox', size: [0.03, 0.002, 0.3], bevel: 0.0005 }),
    part('round', { kind: 'cylinder', size: [0.01, 0.01, 0.3] }),
    part('stack', { kind: 'box', size: [0.3, 0.002, 0.03] }, { repeat: { count: 3, step: [0, 0.01, 0] } }),
    part('turned', { kind: 'box', size: [0.3, 0.002, 0.03], rotation: [0, 30, 0] }),
  ] as never[];
  const check = (bind: unknown[]) =>
    simIssues(simSchema.parse({ ...sim, bind }), { ...ctx, parts: new Set(['strip-a', 'strip-b', 'round', 'stack', 'turned']), partData: PARTS }).map((x) => `${x.path.join('.')}: ${x.message}`);
  const bridge = { mode: 'bridge', axis: [1, 0, 0], span: 0.2 };
  it('accepts a box along X and a bevelBox along −Z', () => {
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: bridge }, { output: 'flex-tip', part: 'strip-b', bend: { mode: 'cantilever', axis: [0, 0, -1], clamp: -0.1, reach: 0.25 } }])).toEqual([]);
    expect(check([{ control: 'push', part: 'strip-a', bend: { ...bridge, per: 0.01 } }])).toEqual([]);
  });
  it('needs a box or bevelBox, one copy, not turned', () => {
    expect(check([{ output: 'bridge-sag', part: 'round', bend: bridge }])).toContain('bind.0.bend: "round" needs a box or bevelBox (three sizes) to bend');
    expect(check([{ output: 'bridge-sag', part: 'stack', bend: bridge }])).toContain('bind.0.bend: "stack" is repeated: a bent strip is one copy');
    expect(check([{ output: 'bridge-sag', part: 'turned', bend: bridge }])[0]).toContain('a bent strip is not turned');
  });
  it('one bend per part, never with a stretch', () => {
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: bridge }, { output: 'flex-tip', part: 'strip-a', bend: bridge }])).toContain('bind.1.bend: "strip-a" already bends (one bend per part)');
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: bridge }, { output: 'flex-tip', part: 'strip-a', stretch: { per: 1 } }])).toContain('bind: "strip-a" both bends and stretches: one or the other');
  });
  it('the shape fits the strip: span shorter, clamp on it, clamp + reach not past its end', () => {
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: { ...bridge, span: 0.3 } }])).toContain('bind.0.bend.span: the supports (0.3) must be closer than "strip-a" is long (0.3)');
    expect(check([{ output: 'flex-tip', part: 'strip-a', bend: { mode: 'cantilever', axis: [1, 0, 0], clamp: -0.1, reach: 0.26 } }])[0]).toContain('clamp + reach (0.16');
    expect(check([{ output: 'flex-tip', part: 'strip-a', bend: { mode: 'cantilever', axis: [1, 0, 0], clamp: -0.2, reach: 0.1 } }])).toContain('bind.0.bend.clamp: the clamp must be on "strip-a" (within ±0.15)');
  });
  it('axis ±X or ±Z, the fields of its mode, a number source', () => {
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: { ...bridge, axis: [0, 1, 0] } }])).toContain('bind.0.bend.axis: a strip lies along ±X or ±Z of its part');
    expect(check([{ output: 'bridge-sag', part: 'strip-a', bend: { mode: 'bridge', axis: [1, 0, 0], clamp: 0 } }])).toContain('bind.0.bend: a bridge gives `span` (no clamp or reach)');
    expect(check([{ output: 'flex-tip', part: 'strip-a', bend: { mode: 'cantilever', axis: [1, 0, 0], span: 0.2 } }])).toContain('bind.0.bend: a cantilever gives `clamp` and `reach` (no span)');
    expect(check([{ output: 'strength-result', part: 'strip-a', bend: bridge }])).toContain('bind.0.bend: bend needs a number output or a step control, "strength-result" is a state');
    expect(check([{ control: 'strip', part: 'strip-a', bend: bridge }])).toContain('bind.0.bend: bend needs a number output or a step control, "strip" is a choice');
  });
});
