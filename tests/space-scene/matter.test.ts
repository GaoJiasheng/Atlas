/** Every SIM number and invariant in docs/36 §2.4, plus the registration and author checks. */
import { describe, expect, it } from 'vitest';
import { matterIssues, matterSchema, matterWarnings, type MatterData, type MatterPart } from '../../src/engines/space-scene/matter-schema';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { matterLiquidShapes, matterLiquids, matterQuantity, matterQuantityRange, pumpPressure, solveCup, solveMatter, syringePressure } from '../../src/engines/space-scene/lib/sim/matter';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { capacity, fillBounds, levelForVolume } from '../../src/engines/space-scene/lib/fill';
import { quantityKind, simIssues, simSchema, type SimControl, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { formatReading } from '../../src/engines/space-scene/lib/telemetry';
import { MATTER_PARTS, matterBench as m, matterSim } from './fixtures/matter-bench';

const sim = matterSim();
const shapes = matterLiquidShapes(MATTER_PARTS);
const controls = new Map(sim.controls.map((c) => [c.id, c]));
const run = (set: SimValues = {}) => solveMatter(m, { ...resolveSimValues(sim, {}), ...set }, shapes);
const n = (v: unknown) => v as number;
const shown = (v: unknown, places = 1) => Number(formatReading(n(v), places).replaceAll(',', ''));
const issues = (data: MatterData = m, cs: ReadonlyMap<string, SimControl> = controls, ps: readonly MatterPart[] = MATTER_PARTS) => matterIssues(data, cs, ps);
const ctx = { parts: new Set(MATTER_PARTS.map((p) => p.id)), flows: new Map(), animations: new Map(), poses: new Set<string>(), countable: new Set<string>(), partData: MATTER_PARTS };

describe('T1 model specimens on the balance', () => {
  it.each([['stone', 66.3], ['sponge', 11.5], ['marble', 5.4], ['clay', 32.0], ['water', 199.4]] as const)('%s → %s g', (object, mass) => {
    expect(shown(run({ 'weigh-object': object })['weigh:mass'])).toBe(mass);
  });
  it('keeps the larger sponge lighter: volume ×15.4, mass ×0.17', () => {
    expect(shown(m.objects.sponge!.volume / m.objects.stone!.volume)).toBe(15.4);
    expect(shown(run({ 'weigh-object': 'sponge' })['weigh:mass'] as number / n(run()['weigh:mass']), 2)).toBe(0.17);
  });
});

describe('T2 displacement', () => {
  it.each([['nothing', 100, 0, 0], ['stone', 125, 25, 2.3], ['marble', 102, 2.145, 0.2], ['clay-ball', 120, 20, 1.9], ['clay-roll', 120, 20, 1.9]] as const)('%s → %s ml, %s cm³, rises %s cm', (object, reading, volume, rise) => {
    const q = run({ 'drop-object': object });
    expect(shown(q['displace:reading'], 0)).toBe(reading);
    expect(q['displace:volume']).toBe(volume);
    expect(q['volume:cyl-b-water']).toBe(q['displace:reading']);
    const shape = shapes.get('cyl-b-water')!;
    expect(shown((levelForVolume(shape, n(q['displace:reading']) * 1e-6) - levelForVolume(shape, 100e-6)) * 100)).toBe(rise);
  });
  it('preserves the marble full precision while showing 2.1 cm³', () => expect(shown(run({ 'drop-object': 'marble' })['displace:volume'])).toBe(2.1));
});

describe('T3 the same 200 ml in four cavities', () => {
  it.each([['cylinder', 18.6], ['glass', 7.1], ['flask', 5.0], ['bowl', 3.0]] as const)('%s → %s cm', (container, level) => {
    const q = run({ container });
    expect(shown(q['pour:level'])).toBe(level);
    expect(q['pour:volume']).toBe(200);
    const selected = m.pour!.liquids[container]!;
    for (const id of Object.values(m.pour!.liquids)) expect(q[`volume:${id}`]).toBe(id === selected ? 200 : 0);
    const shape = shapes.get(selected)!;
    expect(n(q['pour:level']) / 100 + fillBounds(shape).min).toBe(levelForVolume(shape, 200e-6));
    expect(capacity(shape)).toBeGreaterThanOrEqual(200e-6);
  });
  it('has four strictly different liquid heights and conserved total volume', () => {
    const rows = Object.keys(m.pour!.liquids).map((container) => run({ container }));
    expect(new Set(rows.map((q) => q['pour:level'])).size).toBe(4);
    for (const q of rows) expect(Object.values(m.pour!.liquids).reduce((sum, id) => sum + n(q[`volume:${id}`]), 0)).toBe(200);
  });
});

describe('T4 added air has mass', () => {
  it.each([[0, 600, 0, 0, 'flat'], [5, 601.2, 1.2, 14.5, 'soft'], [10, 602.4, 2.4, 29.0, 'soft'], [15, 603.5, 3.5, 43.4, 'soft'], [20, 604.7, 4.7, 57.9, 'firm']] as const)('%s strokes → %s g, air %s g, pressure %s kPa, %s', (pumps, mass, air, pressure, firmness) => {
    const q = run({ pumps });
    expect(shown(q['pump:mass'])).toBe(mass);
    expect(shown(q['pump:air'])).toBe(air);
    expect(shown(pumpPressure(m, m.pump!, pumps))).toBe(pressure);
    expect(q['pump:firmness']).toBe(firmness);
  });
  it('adds 0.236 g each stroke (0.24 g shown), producing a straight line', () => {
    for (let pumps = 0; pumps < 24; pumps++) {
      const delta = n(run({ pumps: pumps + 1 })['pump:mass']) - n(run({ pumps })['pump:mass']);
      expect(delta).toBeCloseTo(0.236, 12);
      expect(shown(delta, 2)).toBe(0.24);
    }
  });
  it('uses inclusive firmness bounds and reports too-hard above the upper bound', () => {
    const pressureAt = (p: number) => solveMatter(m, { pumps: p / m.p0 * m.pump!.inside / m.pump!.stroke })['pump:firmness'];
    expect(pressureAt(51.69)).toBe('soft');
    expect(pressureAt(51.7)).toBe('firm');
    expect(pressureAt(58.6)).toBe('firm');
    expect(pressureAt(58.61)).toBe('too-hard');
  });
});

describe('the inverted cup: above, submerged sealed, submerged vented', () => {
  it.each([['above', false, 14.0, 0, 0, 'dry', 'none'], ['pushed', false, 14.9, 8.9, 1.0, 'dry', 'none'], ['pushed', true, 14.1, 1.3, 90, 'wet', 'rising']] as const)('%s / hole %s → basin %s cm, rise %s mm, cup rise %s mm, %s / %s', (place, hole, level, basinRise, cupRise, tissue, bubbles) => {
    const q = run({ 'cup-place': place, 'cup-hole': hole });
    expect(shown(q['cup:basin-level'])).toBe(level);
    expect(shown(q['cup:basin-rise'])).toBe(basinRise);
    expect(shown(q['cup:cup-rise'])).toBe(cupRise);
    expect(q['cup:tissue']).toBe(tissue);
    expect(q['cup:wet']).toBe(tissue === 'wet' ? 1 : 0);
    expect(q['cup:bubbles']).toBe(bubbles);
    expect(n(q['volume:basin-water']) + n(q['volume:basin-water-cup']) + n(q['volume:cup-water'])).toBeCloseTo(Math.PI * 12 ** 2 * 14, 9);
  });
  it('compresses 346.4 ml to 342.5 ml by 1.1%, with both submerged surfaces above 12.4 cm', () => {
    const sealed = solveCup(m, m.cup!, true, false);
    expect(shown(sealed.initialAir)).toBe(346.4);
    expect(shown(sealed.air)).toBe(342.5);
    expect(shown(100 * (1 - sealed.air / sealed.initialAir))).toBe(1.1);
    for (const hole of [false, true]) expect(solveCup(m, m.cup!, true, hole).basinLevel).toBeGreaterThan(12.4);
    expect(shown(sealed.basinWater, 0)).toBe(6333);
  });
  it('satisfies Boyle’s law and conservation at its returned equilibrium', () => {
    const s = solveCup(m, m.cup!, true, false);
    const pressure = m.p0 + m.water.density * m.g * (s.basinLevel - m.cup!.cup.rim - s.rise) / 100;
    expect(s.air * pressure).toBeCloseTo(s.initialAir * m.p0, 5);
    expect(s.air + s.water).toBe(s.initialAir);
  });
  it('an open hole above the basin wets nothing and makes no bubbles', () => {
    const q = run({ 'cup-place': 'above', 'cup-hole': true });
    expect(q['cup:tissue']).toBe('dry');
    expect(q['cup:bubbles']).toBe('none');
  });
});

describe('T5 equal loads on gas, liquid and grains', () => {
  it.each([[0, 20], [1, 15.3], [2, 12.4], [3, 10.4], [4, 9.0]] as const)('%s kg → air %s ml, water and sand 20.0 ml', (load, air) => {
    const q = run({ load });
    expect(shown(q['squeeze:air'])).toBe(air);
    expect(shown(q['squeeze:water'])).toBe(20);
    expect(q['squeeze:sand']).toBe(20);
  });
  it('air decreases progressively more slowly; unloading restores 20 ml', () => {
    const air = [0, 1, 2, 3, 4].map((load) => n(run({ load })['squeeze:air']));
    const drops = air.slice(1).map((v, i) => air[i]! - v);
    drops.forEach((drop, i) => { expect(drop).toBeGreaterThan(0); if (i) expect(drop).toBeLessThan(drops[i - 1]!); });
    expect(run({ load: 0 })['squeeze:air']).toBe(20);
  });
  it('resolves the tiny water change and the 4 kg pressure sanity check', () => {
    expect(shown(syringePressure(m, m.squeeze!, 1))).toBe(31.2);
    expect(shown(syringePressure(m, m.squeeze!, 4) / m.p0)).toBe(1.2);
    expect(shown(20 - n(run({ load: 4 })['squeeze:water']), 3)).toBe(0.001);
    expect(shown(n(run({ load: 4 })['squeeze:air']) / 20 * 100, 0)).toBe(45);
  });
});

describe('T6 water enters 35 ml of sand pores first', () => {
  it.each([[0, 100, 35, 'equal', 'none'], [20, 100, 15, 'less', 'rising'], [40, 105, 0, 'less', 'none'], [60, 125, 0, 'less', 'none'], [80, 145, 0, 'less', 'none'], [100, 165, 0, 'less', 'none']] as const)('%s ml → reading %s ml, air %s ml, %s / %s', (water, reading, air, vs, bubbles) => {
    const q = run({ 'water-added': water });
    expect(q['pores:reading']).toBe(reading);
    expect(q['pores:air']).toBe(air);
    expect(q['pores:vs-sum']).toBe(vs);
    expect(q['pores:bubbles']).toBe(bubbles);
    expect(q['pores:wet']).toBe(Math.min(1, water / 35));
    expect(q['volume:water-over-sand']).toBe(reading - 100);
    expect(q['volume:jug-water']).toBe(100 - water);
  });
  it('turns exactly at 35 ml: bubbles stop at capacity and the next ml raises the level', () => {
    expect(run({ 'water-added': 34.999 })['pores:bubbles']).toBe('rising');
    const at = run({ 'water-added': 35 });
    expect(at['pores:reading']).toBe(100);
    expect(at['pores:bubbles']).toBe('none');
    expect(run({ 'water-added': 36 })['pores:reading']).toBe(101);
    expect(200 - n(run({ 'water-added': 100 })['pores:reading'])).toBe(35);
  });
});

describe('matter model contracts', () => {
  it('registers only present quantities, including named syringe fillings and liquid parts', () => {
    expect(SEPARATE_EXPERIMENTS.matter).toBe(true);
    for (const o of sim.outputs) expect(quantityKind(sim, o.from!)).toBe(o.kind);
    expect(matterQuantity(m, 'volume:missing')).toBeNull();
    expect(matterQuantity(m, 'squeeze:missing')).toBeNull();
    expect(matterQuantity(matterSchema.parse({}), 'weigh:mass')).toBeNull();
    expect(matterQuantity(m, 'pores:reading:extra')).toBeNull();
    expect(matterLiquids(m)).toHaveLength(10);
    expect(solveMatter(matterSchema.parse({}), {})).toEqual({});
  });
  it('is deterministic, maps declared outputs, and preserves a deep-link round trip', () => {
    const values = resolveSimValues(sim, { container: 'flask', load: 2 });
    const overrides = { container: 'flask', load: 2 };
    expect(encodeSimParam(overrides)).toBe('container.flask~load.2');
    expect(decodeSimParam(encodeSimParam(overrides))).toEqual(overrides);
    expect(solveMatter(m, values, shapes)).toEqual(solveMatter(m, values, shapes));
    const o = evaluateSim(sim, values, [], undefined, MATTER_PARTS);
    expect(shown(o.level)).toBe(5);
    expect(shown(o['v-air'])).toBe(12.4);
  });
  it('finds exact fill input maxima from local control domains, including the joint cup controls', () => {
    expect(matterQuantityRange(m, 'displace:reading', controls, shapes)).toEqual([100, 125]);
    expect(matterQuantityRange(m, 'volume:cyl-a-water', controls, shapes)).toEqual([0, 200]);
    expect(matterQuantityRange(m, 'volume:cup-water', controls, shapes)).toEqual([0, Math.PI * 3.5 ** 2 * 9]);
    expect(matterQuantityRange(m, 'volume:water-over-sand', controls, shapes)).toEqual([0, 65]);
    expect(matterQuantityRange(m, 'pump:firmness', controls, shapes)).toBeNull();
  });
  it('a box cavity reports height above its floor using the same fill inversion', () => {
    const box = new Map(shapes).set('flask-water', { kind: 'box' as const, size: [0.1, 0.1, 0.1] });
    expect(solveMatter(m, resolveSimValues(sim, { container: 'flask' }), box)['pour:level']).toBeCloseTo(2, 8);
  });
});

describe('matter author validation', () => {
  it('accepts the complete bench and has no unused objects', () => {
    expect(issues()).toEqual([]);
    expect(simIssues(sim, ctx)).toEqual([]);
    expect(matterWarnings(m, controls)).toEqual([]);
  });
  it('reports missing and mistyped controls', () => {
    expect(issues({ ...m, weigh: { ...m.weigh!, object: 'absent' } })).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('unknown control') })]));
    expect(issues({ ...m, weigh: { ...m.weigh!, object: 'pumps' } })).toEqual(expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('not a choice') })]));
  });
  it('requires specimen entries and rejects floating specimens in displacement', () => {
    const missing = { ...m.objects }; delete missing.marble;
    expect(issues({ ...m, objects: missing }).some((x) => x.message.includes('no objects entry'))).toBe(true);
    expect(issues({ ...m, objects: { ...m.objects, stone: { ...m.objects.stone!, floats: true } } }).some((x) => x.message.includes('floats'))).toBe(true);
    expect(matterWarnings({ ...m, objects: { ...m.objects, unused: { volume: 1, density: 1 } } }, controls)).toEqual([{ path: ['objects', 'unused'], message: 'object "unused" is not used by any experiment option' }]);
  });
  it('requires every pouring option, a distinct liquid part and enough capacity', () => {
    const liquids = { ...m.pour!.liquids }; delete liquids.flask;
    expect(issues({ ...m, pour: { ...m.pour!, liquids } }).some((x) => x.message.includes('flask'))).toBe(true);
    expect(issues({ ...m, pour: { ...m.pour!, volume: 400 } }).some((x) => x.message.includes('exceeds'))).toBe(true);
    expect(issues({ ...m, displace: { ...m.displace!, water: 260 } }).some((x) => x.message.includes('exceeds'))).toBe(true);
    expect(issues({ ...m, pour: { ...m.pour!, liquids: { ...m.pour!.liquids, glass: 'cyl-a-water' } } }).some((x) => x.message.includes('own liquid'))).toBe(true);
  });
  it('requires liquid parts that exist, are selectable, and use one fillable primitive', () => {
    for (const replacement of [undefined, { kind: 'sphere' as const, size: [1], at: [0, 0, 0] as [number, number, number], color: 'membrane' as const }]) {
      const ps = MATTER_PARTS.map((p) => p.id === 'glass-water' ? { ...p, primitive: replacement } : p);
      expect(issues(m, controls, ps).some((x) => x.message.includes('lathe or box'))).toBe(true);
    }
    expect(issues(m, controls, MATTER_PARTS.filter((p) => p.id !== 'glass-water')).some((x) => x.message.includes('unknown liquid'))).toBe(true);
    expect(issues(m, controls, MATTER_PARTS.map((p) => p.id === 'glass-water' ? { ...p, context: true, extra: [{}] } : p)).map((x) => x.message).join(' ')).toMatch(/context.*repeat or extra/);
  });
  it('requires a fully submerged cup with sensible dimensions and pressure bounds', () => {
    expect(issues({ ...m, cup: { ...m.cup!, cup: { ...m.cup!.cup, top: 20 } } }).some((x) => x.message.includes('fully submerged'))).toBe(true);
    expect(issues({ ...m, cup: { ...m.cup!, cup: { ...m.cup!.cup, top: 2 } } }).some((x) => x.message.includes('above its rim'))).toBe(true);
    expect(issues({ ...m, pump: { ...m.pump!, firm: [59, 51] } }).some((x) => x.message.includes('ascend'))).toBe(true);
  });
  it('bounds porosity and jug water, and requires three filling kinds', () => {
    for (const porosity of [0, 0.6, 1]) expect(matterSchema.safeParse({ ...m, pores: { ...m.pores!, porosity } }).success).toBe(false);
    expect(issues({ ...m, pores: { ...m.pores!, jug: 80 } }).some((x) => x.message.includes('exceeds the jug'))).toBe(true);
    expect(issues({ ...m, squeeze: { ...m.squeeze!, fillings: { air: 'gas', sand: 'grains' } } }).some((x) => x.message.includes('one gas'))).toBe(true);
  });
  it('rejects unknown quantities, wrong output kinds, and missing state labels through simIssues', () => {
    const bad = (patch: Partial<typeof sim.outputs[number]>) => simIssues({ ...sim, outputs: [{ ...sim.outputs[0]!, ...patch }] }, ctx);
    expect(bad({ from: 'pour:invented' }).some((x) => x.message.includes('no quantity'))).toBe(true);
    expect(bad({ from: 'pump:firmness', kind: 'number' }).some((x) => x.message.includes('not a number'))).toBe(true);
    expect(bad({ from: 'pump:firmness', kind: 'state', states: { flat: { en: 'Flat', zh: '瘪' } } }).some((x) => x.message.includes('give it a label'))).toBe(true);
  });
});

describe('fill and independent bubble-path bindings', () => {
  const filled = (bind: unknown[]) => simSchema.parse({ ...sim, bind });
  const fill = { per: 1e-6 };
  it('rejects state fill sources, duplicate fills, bad cavities, excessive below and excessive volumes', () => {
    const errors = (bind: unknown[], partData = MATTER_PARTS) => simIssues(filled(bind), { ...ctx, partData });
    const binding = { output: 'poured', part: 'glass-water', fill };
    expect(errors([{ ...binding, output: 'firmness' }]).some((x) => x.message.includes('number'))).toBe(true);
    expect(errors([binding, binding]).some((x) => x.message.includes('duplicate fill'))).toBe(true);
    expect(errors([{ ...binding, fill: { ...fill, below: 400 } }]).some((x) => x.message.includes('below'))).toBe(true);
    expect(errors([{ ...binding, fill: { per: 1e-5 } }]).some((x) => x.message.includes('maximum fill exceeds'))).toBe(true);
    const bad = MATTER_PARTS.map((p) => p.id === 'glass-water' ? { ...p, extra: [{}] } : p);
    expect(errors([binding], bad).some((x) => x.message.includes('no context, repeat or extra'))).toBe(true);
    const open = MATTER_PARTS.map((p) => p.id === 'glass-water' ? { ...p, primitive: { kind: 'lathe' as const, profile: [[0.03, 0], [0.03, 0.12], [0.02, 0.12]] as [number, number][], segments: 32, at: [0, 0, 0] as [number, number, number], color: 'membrane' as const } } : p);
    expect(errors([binding], open).some((x) => x.message.includes('closed'))).toBe(true);
  });
  it('validates each bubble path reference and preserves independent visibility', () => {
    const binds = [
      { output: 'cup-bubbles', flow: 'escaping-air', paths: ['cup-hole'], visible: { eq: 'rising' } },
      { output: 'sand-bubbles', flow: 'escaping-air', paths: ['sand-gaps'], visible: { eq: 'rising' } },
    ];
    const flowContext = { ...ctx, flows: new Map([['escaping-air', { paths: [{ id: 'cup-hole' }, { id: 'sand-gaps' }], own: true }]]) };
    const bound = filled(binds);
    expect(simIssues(bound, flowContext)).toEqual([]);
    const visibility = (set: SimValues) => {
      const values = resolveSimValues(bound, set);
      return simEffects(bound, values, evaluateSim(bound, values, [], undefined, MATTER_PARTS)).flows.get('escaping-air');
    };
    expect(visibility({ 'cup-place': 'pushed', 'cup-hole': true })?.visibility).toEqual({ 'cup-hole': true, 'sand-gaps': false });
    expect(visibility({ 'water-added': 20 })?.visibility).toEqual({ 'cup-hole': false, 'sand-gaps': true });
    expect(visibility({ 'water-added': 40 })?.visibility).toEqual({ 'cup-hole': false, 'sand-gaps': false });
    expect(visibility({ 'cup-place': 'pushed', 'cup-hole': true, 'water-added': 20 })?.visible).toBe(true);
    const invalid = filled([{ ...binds[0], paths: ['missing'] }]);
    expect(simIssues(invalid, flowContext).some((x) => x.message.includes('missing'))).toBe(true);
  });
});
