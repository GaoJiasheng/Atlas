import { describe, expect, it } from 'vitest';
import { heatBench, heatSim } from './fixtures/heat-bench';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { solveHeatAt, heatQuantity } from '../../src/engines/space-scene/lib/sim/heat';
import { resolveSimValues, decodeSimParam, encodeSimParam } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { chapterSimIssues, chapterSimSchema, quantityKind, simIssues, simSchema, simTimelineChannels, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { msPerCall } from '../timing';
const sim = heatSim();
const ctx = { parts: new Set<string>(), flows: new Map(), animations: new Map(), poses: new Set<string>(), countable: new Set<string>() };
const out = (set: SimValues = {}) => evaluateSim(sim, resolveSimValues(sim, set));
const edit = (f: (s: SimData) => void) => { const s = structuredClone(sim); f(s); return s; };
const issues = (s: unknown) => simIssues(simSchema.parse(s), ctx).map((x) => `${x.path.join('.')}: ${x.message}`).join('\n');
const close = (actual: unknown, expected: number) => expect(Math.abs(Number(actual) - expected)).toBeLessThanOrEqual(1e-6);

describe('heat analytic design points (docs/55 §4.6)', () => {
  it.each([
    [0, 25, 85, 85, 25, 25],
    [60, 32.142857143, 77.012673985, 82.894956662, 62.927233530, 30.709754918],
    [120, 39.285714286, 70.088637585, 80.863766782, 76.879883006, 35.876154815],
    [300, 60.714285714, 54.372499573, 75.187858438, 84.595723180, 48.608160417],
  ])('at %s s all five temperatures match the full precision formula', (t, heater, bare, wrapped, metal, plastic) => {
    const q = out({ 'elapsed-s': t! });
    close(q['heated-c'], heater!); close(q['cool-c'], bare!); close(out({ 'elapsed-s': t!, cover: 'wrapped' })['cool-c'], wrapped!);
    close(q['metal-c'], metal!); close(q['plastic-c'], plastic!);
  });
  it('heating energy, power off and doubled mass', () => {
    const q = out({ 'elapsed-s': 120 });
    expect([q['heated-j'], q['heated-input-j'], q['heated-reservoir-j']]).toEqual([12000, 12000, 0]);
    expect(out({ 'elapsed-s': 300, 'heater-w': 0 })['heated-c']).toBe(25);
    close(out({ 'elapsed-s': 120, 'water-g': 400 })['heated-change-k'], 7.142857143);
  });
  it('cooling power and reverse reservoir exchange stay signed', () => {
    const q = out({ 'elapsed-s': 120 });
    close(q['cool-rate-w'], -90.177275169);
    close(Number(q['cool-energy-j']) + Number(q['cool-reservoir-j']), 0);
    const reverse = out({ 'elapsed-s': 120, 'cool-start-c': 5 });
    close(reverse['cool-c'], 9.970454138);
    expect(reverse['cool-direction']).toBe('warming');
    expect(Number(reverse['cool-energy-j'])).toBeGreaterThan(0);
    expect(Number(reverse['cool-reservoir-j'])).toBeLessThan(0);
    close(out({ 'elapsed-s': 120, 'cool-start-c': 5, cover: 'wrapped' })['cool-c'], 6.378744406);
  });
  it('a cold bath makes the better path cool faster', () => {
    const q = out({ 'bath-c': 5, 'elapsed-s': 60 });
    close(q['metal-c'], 12.357588823); close(q['plastic-c'], 23.096748361);
    expect([q['tip-comparison'], q['metal-direction'], q['plastic-direction']]).toEqual(['second-warmer', 'cooling', 'cooling']);
  });
  it('same temperature is steady; comparison band is absolute degrees', () => {
    const q = out({ 'bath-c': 25, 'elapsed-s': 300 });
    expect([q['metal-c'], q['plastic-c'], q['tip-comparison'], q['metal-direction'], q['metal-rate-w']]).toEqual([25, 25, 'same', 'steady', 0]);
    const h = structuredClone(heatBench); h.compare.tips!.epsilon = 100;
    expect(solveHeatAt(h, resolveSimValues(sim, {}), 60)['compare:tips']).toBe('same');
  });
  it.each([[85, 0.072, 100.072, 0.036], [5, -0.024, 99.976, -0.012], [25, 0, 100, 0]])('rod at %s °C has a signed length change and separate enlarged indicator', (temp, delta, length, offset) => {
    const q = out({ 'rod-c': temp! }); close(q['rod-delta-mm'], delta!); close(q['rod-length-mm'], length!);
    const s = { ...sim, bind: [{ output: 'rod-delta-mm', part: 'marker', offset: { axis: [1, 0, 0] as [number, number, number], per: 0.5, origin: 0 } }] };
    close(simEffects(s, resolveSimValues(sim, { 'rod-c': temp! }), q).offset.get('marker')![0], offset!);
  });
  it('supports simultaneous constant power and reservoir, with the same energy identity', () => {
    const h = structuredClone(heatBench); h.lumps.heater!.reservoir = { temperature: 25, conductance: 2 };
    const v = resolveSimValues(sim, {});
    for (const t of [0, 0.1, 60, 120, 300]) {
      const q = solveHeatAt(h, v, t);
      close(q['temperature:heater'], 75 - 50 * Math.exp(-2 * t / 840));
      close(Number(q['energy:heater']) + Number(q['reservoir-energy:heater']), Number(q['supplied:heater']));
    }
  });
  it('direct links, arbitrary sampling, reverse seeks and repeated inputs have no history', () => {
    const direct = out(decodeSimParam('elapsed-s.60~bath-c.5'));
    out({ 'elapsed-s': 300 }); out({ 'elapsed-s': 120 });
    expect(out({ 'elapsed-s': 60, 'bath-c': 5 })).toEqual(direct);
    expect(encodeSimParam({ 'elapsed-s': 60, 'bath-c': 5 })).toBe('bath-c.5~elapsed-s.60');
    const v = resolveSimValues(sim, {});
    for (const t of [0, 1.25, 60, 119.5, 300, 60]) {
      const q = solveHeatAt(heatBench, v, t);
      expect(q).toEqual(solveHeatAt(heatBench, v, t));
      expect(Number(q['temperature:cooler'])).toBeGreaterThanOrEqual(25);
      expect(Number(q['temperature:cooler'])).toBeLessThanOrEqual(85);
      for (const id of Object.keys(heatBench.lumps)) close(Number(q[`energy:${id}`]) + Number(q[`reservoir-energy:${id}`]), Number(q[`supplied:${id}`]));
    }
  });
});

describe('heat registration and strict author validation', () => {
  it('seven controls and twenty-four outputs are valid, separate, and independent of timeline playback', () => {
    expect(sim.controls).toHaveLength(7); expect(sim.outputs).toHaveLength(24); expect(simIssues(sim, ctx)).toEqual([]);
    expect(SEPARATE_EXPERIMENTS.heat).toBe(true); expect(simTimelineChannels(sim, 'temperature:heater')).toBeNull();
    for (const output of sim.outputs) expect(quantityKind(sim, output.from!)).toBe(output.kind);
    expect(heatQuantity(heatBench, 'temperature:constructor')).toBeNull(); expect(heatQuantity(heatBench, 'temperature:missing')).toBeNull(); expect(heatQuantity(heatBench, 'temperature:heater:extra')).toBeNull();
  });
  it('a single evaluation remains below one millisecond', () => expect(msPerCall(() => out({ 'elapsed-s': 120 }), 50)).toBeLessThan(1));
  it('rejects missing heat data, unknown quantity, wrong kind and wrong units', () => {
    expect(issues(edit((s) => { delete s.heat; }))).toContain('a heat sim needs `heat`');
    expect(issues(edit((s) => { s.outputs[0]!.from = 'temperature:typo'; }))).toContain('no quantity');
    expect(issues(edit((s) => { s.outputs[0]!.kind = 'state'; }))).toContain('is a number, not a state');
    expect(issues(edit((s) => { s.outputs[0]!.unit = 'J'; }))).toContain('needs unit °C');
    expect(issues(edit((s) => { delete s.outputs[0]!.unit; }))).toContain('needs unit °C');
    expect(issues(edit((s) => { s.outputs[7]!.unit = '°C'; }))).toContain('needs unit (none)');
  });
  it('checks physical units of referenced numeric step controls', () => {
    for (const [id, unit] of [['water-g', 'kg'], ['heater-w', 'J'], ['bath-c', 'K']]) {
      expect(issues(edit((s) => { const c = s.controls.find((c) => c.id === id); if (c?.kind === 'step') c.unit = unit; }))).toContain('needs unit');
    }
  });
  it('requires the exact state catalogue', () => {
    expect(issues(edit((s) => { delete s.outputs[7]!.states!.same; }))).toContain('can be "same"');
    expect(issues(edit((s) => { s.outputs[7]!.states!.hot = { en: 'Hot', zh: '热' }; }))).toContain('unknown heat state');
  });
  it.each([Infinity, NaN, -1])('rejects invalid numeric coefficients %s structurally', (bad) => {
    expect(() => simSchema.parse(edit((s) => { s.heat!.lumps.heater!.capacity = bad; }))).toThrow();
    expect(() => simSchema.parse(edit((s) => { s.heat!.expansions.rod!.alpha = bad; }))).toThrow();
  });
  it('rejects extra numeric source properties, negative mass and nonpositive conductance', () => {
    expect(() => simSchema.parse(edit((s) => { s.heat!.lumps.heater!.power = { control: 'heater-w', extra: 1 } as never; }))).toThrow();
    expect(issues(edit((s) => { s.heat!.lumps.heater!.capacity = { mass: -1, specific: 4.2 }; }))).toContain('mass and capacity must be positive');
    expect(issues(edit((s) => { s.heat!.lumps.cooler!.reservoir!.conductance = 0; }))).toContain('conductance must be positive');
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = -1; }))).toContain('power must be finite and nonnegative');
  });
  it('rejects temperature domain crossings at every control option, not just defaults', () => {
    expect(issues(edit((s) => { s.heat!.lumps.heater!.initial = -1; }))).toContain('within 0–95');
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = 1000; }))).toContain('no clipping');
    expect(issues(edit((s) => { s.heat!.expansions.rod!.temperature = 96; }))).toContain('within 0–95');
    expect(issues(edit((s) => { const c = s.controls.find((c) => c.id === 'heater-w'); if (c?.kind === 'step') c.values.push(1000); }))).toContain('no clipping');
  });
  it('checks time type, initial zero, ascending seconds and maximum domain', () => {
    expect(issues(edit((s) => { s.heat!.time = 'cover'; }))).toContain('time must name a step');
    for (const values of [[30, 60], [0, -1], [0, 601], [0, 30, 15]]) {
      expect(issues(edit((s) => { const c = s.controls[0]!; if (c.kind === 'step') c.values = values; }))).toContain('ascend from 0');
    }
    expect(() => simSchema.parse(edit((s) => { const c = s.controls[0]!; if (c.kind === 'step') c.values = [0, Infinity]; }))).toThrow();
    expect(issues(edit((s) => { const c = s.controls[0]!; if (c.kind === 'step') c.unit = 'h'; }))).toContain('unit s');
  });
  it('checks numeric references, choice coverage, and prohibits time-dependent parameters', () => {
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = { control: 'missing' }; }))).toContain('unknown control');
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = { control: 'cover' }; }))).toContain('must be a step');
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = { control: 'elapsed-s' }; }))).toContain('cannot also drive');
    expect(issues(edit((s) => { s.heat!.lumps.cooler!.reservoir!.conductance = { control: 'cover', values: { bare: 2 } }; }))).toContain('missing numeric mapping');
    expect(issues(edit((s) => { s.heat!.lumps.cooler!.reservoir!.conductance = { control: 'cover', values: { bare: 2, wrapped: 0.5, extra: 1 } }; }))).toContain('not an option');
    expect(issues(edit((s) => { s.heat!.lumps.heater!.power = { control: 'heater-w', values: { bare: 2 } }; }))).toContain('must be a choice');
  });
  it('checks comparison references, distinct objects, limits and collisions', () => {
    expect(issues(edit((s) => { s.heat!.compare.tips!.first = 'constructor'; }))).toContain('unknown lump');
    expect(issues(edit((s) => { s.heat!.compare.tips!.first = 'plastic-tip'; }))).toContain('two different lumps');
    expect(issues(edit((s) => { s.heat!.expansions.heater = s.heat!.expansions.rod!; }))).toContain('duplicate heat object id');
    expect(() => simSchema.parse(edit((s) => { s.heat!.lumps = {}; }))).toThrow();
    expect(() => simSchema.parse(edit((s) => { s.heat!.compare.tips!.epsilon = -0.1; }))).toThrow();
    expect(() => simSchema.parse(edit((s) => { s.heat!.expansions.rod!.length = 0; }))).toThrow();
  });
  it('validates temperature curves independently from the card vary and preserves old no-curve cards', () => {
    const state = chapterSimSchema.parse({ try: { vary: 'cover', observe: ['cool-c'], curve: { x: 'elapsed-s', y: ['cool-c'] } } });
    expect(state.try!.curve!.samples).toBe(101); expect(chapterSimIssues('', state, sim)).toEqual([]);
    expect(chapterSimIssues('', { try: { ...state.try!, curve: { x: 'cover', y: ['cool-c'], samples: 101 } } }, sim).join()).toContain('elapsed-time');
    expect(chapterSimIssues('', { try: { ...state.try!, curve: { x: 'water-g', y: ['cool-c'], samples: 101 } } }, sim).join()).toContain('elapsed-time');
    for (const y of [['heated-j'], ['rod-delta-mm'], ['tip-comparison'], ['missing']]) expect(chapterSimIssues('', { try: { ...state.try!, curve: { x: 'elapsed-s', y, samples: 101 } } }, sim)).not.toEqual([]);
    for (const samples of [32, 202, 100.1, Infinity]) expect(() => chapterSimSchema.parse({ try: { ...state.try, curve: { x: 'elapsed-s', y: ['heated-c'], samples } } })).toThrow();
    expect(chapterSimIssues('', { try: { vary: 'elapsed-s', observe: ['heated-c'] } }, sim)).toEqual([]);
  });
});
