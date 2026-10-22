/**
 * The table model (docs/40 §4.2 E-HL1, §4.8) on the heart-and-lungs author
 * template: every cell of §2.9 (breath, air, route, effort), one row per
 * combination, NaN for outputs no experiment sets, a cell's own decimals
 * (0.04 %, 4 %), the SIM / TYPICAL tags and the sources the card cites,
 * determinism and speed, the URL round trip, the bindings it drives, and
 * every validation case of §4.8 (rows missing / doubled, `set` keys, state
 * ids, sources, design / measured sources, balls enough, hz on a flow,
 * tidal sync and stops).
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';
import { cellValue, solveTable, tableCombinations, tableExperimentOf, tableQuantity, tableSources, tableStates, outputTag, statusTag } from '../../src/engines/space-scene/lib/sim/table';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { chapterSimIssues, quantityKind, simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { partsFile as partsFileSchema } from '../../src/engines/space-scene/schema';
import { HEART_LUNGS_ANIMATIONS, HEART_LUNGS_FLOWS, HEART_LUNGS_PARTS, HEART_LUNGS_SIM, HEART_LUNGS_SOURCES } from './fixtures/heart-lungs-table';
import { msPerCall } from '../timing';

const sim: SimData = simSchema.parse(HEART_LUNGS_SIM);
const table = sim.table!;
const ctx = {
  parts: new Set(HEART_LUNGS_PARTS.map((p) => p.id)),
  partData: HEART_LUNGS_PARTS as never,
  flows: new Map(HEART_LUNGS_FLOWS.map((id) => [id, { paths: [{ id: 'main' }], own: true }])),
  animations: new Map(Object.entries(HEART_LUNGS_ANIMATIONS)),
  poses: new Set(['breathe-in']),
  countable: new Set(['n2-balls', 'o2-balls', 'co2-balls', 'h2o-balls']),
};
const out = (set: SimValues) => evaluateSim(sim, resolveSimValues(sim, set));
const issues = (input: unknown, c = ctx) => simIssues(simSchema.parse(input), c).map((x) => `${x.path.join('.')}: ${x.message}`);
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
type Mutable = { controls: { id: string }[]; outputs: Record<string, unknown>[]; bind: Record<string, unknown>[]; table: { experiments: Record<string, { keys: string[]; rows: { when: Record<string, unknown>; set: Record<string, unknown>; source: string[] }[] }> } };
const edit = (f: (s: Mutable) => void) => {
  const s = clone(HEART_LUNGS_SIM) as unknown as Mutable;
  f(s);
  return s;
};

describe('the template is valid', () => {
  it('parses with no issues and no source issues', () => {
    expect(simIssues(sim, ctx)).toEqual([]);
    expect(tableSourceIssues(table, sim.outputs, HEART_LUNGS_SOURCES)).toEqual([]);
  });
  it('is registered: separate experiments, no timeline, kinds from the cells', () => {
    expect(SEPARATE_EXPERIMENTS.table).toBe(true);
    expect(quantityKind(sim, 'o2')).toBe('number');
    expect(quantityKind(sim, 'where')).toBe('state');
    expect(quantityKind(sim, 'nope')).toBeNull();
    expect(tableQuantity(table, 'muscles')).toBe('state');
    expect(tableStates(table, 'blood')).toEqual(['both', 'poor', 'poor-to-rich', 'rich', 'rich-to-poor']);
  });
});

describe('T1 breath (§2.9)', () => {
  it.each([
    ['auto', 'cycle', 'cycle', 'cycle'],
    ['in', 'down', 'bigger', 'in'],
    ['out', 'up', 'smaller', 'out'],
  ])('%s', (phase, diaphragm, chest, airflow) => {
    const o = out({ phase });
    expect([o.diaphragm, o.chest, o.airflow]).toEqual([diaphragm, chest, airflow]);
  });
});

describe('T2 air (§2.9, typical)', () => {
  it.each([
    ['in', 78, 21, 0.04, 1],
    ['out', 78, 16, 4, 6],
  ])('%s', (sample, n2, o2, co2, h2o) => {
    const o = out({ sample });
    expect([o.n2, o.o2, o.co2, o.h2o]).toEqual([n2, o2, co2, h2o]);
  });
  it('shows 0.04 % with two decimals and 4 % with none', () => {
    const co2 = sim.outputs.find((o) => o.id === 'co2')!;
    expect(co2.decimalsAt).toEqual({ '0.04': 2 });
    expect(outputText(co2, out({ sample: 'in' }).co2, 'en')).toBe('0.04');
    expect(outputText(co2, out({ sample: 'out' }).co2, 'en')).toBe('4');
  });
  it('balls: one per 1 %, rounded (0.04 % is none)', () => {
    const fx = simEffects(sim, resolveSimValues(sim, { sample: 'in' }), out({ sample: 'in' }));
    expect(['n2-balls', 'o2-balls', 'co2-balls', 'h2o-balls'].map((p) => fx.count.get(p))).toEqual([78, 21, 0, 1]);
    const fy = simEffects(sim, resolveSimValues(sim, { sample: 'out' }), out({ sample: 'out' }));
    expect(['n2-balls', 'o2-balls', 'co2-balls', 'h2o-balls'].map((p) => fy.count.get(p))).toEqual([78, 16, 4, 6]);
  });
  it('cites the row the values come from', () => {
    expect(tableSources(table, resolveSimValues(sim, { sample: 'in' })).o2).toEqual(['S3', 'S4']);
    expect(tableSources(table, resolveSimValues(sim, { sample: 'out' })).co2).toEqual(['S5', 'S6', 'S8']);
  });
});

describe('T4 the round (§2.9)', () => {
  const T4: [number, string, string][] = [
    [0, 'whole', 'both'],
    [1, 'heart-to-lungs', 'poor'],
    [2, 'in-lungs', 'poor-to-rich'],
    [3, 'lungs-to-heart', 'rich'],
    [4, 'heart-to-body', 'rich'],
    [5, 'in-body', 'rich-to-poor'],
    [6, 'body-to-heart', 'poor'],
  ];
  it.each(T4)('step %i', (stop, where, blood) => {
    const o = out({ stop });
    expect([o.where, o.blood]).toEqual([where, blood]);
  });
  // Step k shows segment k and the one before it (step 1: segment 6); step 0 all six.
  const SEGMENTS = [['heart-right', 'to-lungs'], ['exchange-lungs', 'oxygen-lungs', 'co2-lungs'], ['from-lungs', 'heart-left'], ['to-body'], ['exchange-body', 'oxygen-muscle', 'co2-muscle'], ['from-body']];
  it.each([0, 1, 2, 3, 4, 5, 6])('step %i shows its segment and the one before', (stop) => {
    const fx = simEffects(sim, resolveSimValues(sim, { stop }), out({ stop }));
    SEGMENTS.forEach((flows, j) => {
      const seg = j + 1;
      const shown = stop === 0 || stop === seg || stop === (seg === 6 ? 1 : seg + 1);
      for (const f of flows) expect(fx.flows.get(f)?.visible, `${f} at ${stop}`).toBe(shown);
    });
  });
});

describe('T5 effort (§2.9, sim)', () => {
  const T5: [string, number, number, string, number, number, number][] = [
    ['rest', 20, 90, 'little', 1, 1, 0.25],
    ['walk', 26, 115, 'more', 1.28, 1.3, 0.5],
    ['run', 40, 165, 'most', 1.83, 2, 1],
  ];
  it.each(T5)('%s', (activity, breaths, beats, muscles, blood, air, need) => {
    const o = out({ activity });
    expect([o.breaths, o.beats, o.muscles, o['blood-pace'], o['air-pace'], o['muscle-need']]).toEqual([breaths, beats, muscles, blood, air, need]);
  });
  it.each(T5)('%s paces the animations in Hz and the flows', (activity, breaths, beats, _m, blood, air, need) => {
    const fx = simEffects(sim, resolveSimValues(sim, { activity }), out({ activity }));
    for (const a of ['breathe', 'breathe-left', 'diaphragm-breathe', 'ribs-breathe']) expect(fx.animations.get(a)?.hz).toBeCloseTo(breaths / 60, 4);
    expect(fx.animations.get('heartbeat')?.hz).toBeCloseTo(beats / 60, 4);
    for (const f of ['heart-right', 'to-lungs', 'from-lungs', 'heart-left', 'to-body', 'from-body', 'food-route']) expect(fx.flows.get(f)?.uniform).toBeCloseTo(blood, 6);
    for (const f of ['air-right', 'air-left']) expect(fx.flows.get(f)?.uniform).toBeCloseTo(Math.min(2, air), 6);
    for (const f of ['oxygen-muscle', 'co2-muscle']) {
      expect(fx.flows.get(f)?.uniform).toBeCloseTo(need, 6);
      expect(fx.flows.get(f)?.mode).toBe('density');
    }
  });
  it('a chapter without a card still beats at the default activity', () => {
    const fx = simEffects(sim, resolveSimValues(sim, {}), out({}));
    expect(fx.animations.get('heartbeat')?.hz).toBeCloseTo(1.5, 4);
    expect(fx.animations.get('breathe')?.enabled).toBe(true);
  });
  it('breathing in or out stops the breathing animations and holds the pose', () => {
    const fx = simEffects(sim, resolveSimValues(sim, { phase: 'in' }), out({ phase: 'in' }));
    expect(fx.animations.get('ribs-breathe')?.enabled).toBe(false);
    expect(fx.poses.get('lung-left')).toBe('breathe-in');
    const fo = simEffects(sim, resolveSimValues(sim, { phase: 'out' }), out({ phase: 'out' }));
    expect(fo.poses.get('diaphragm')).toBeNull();
  });
});

describe('rows and combinations', () => {
  it('each experiment has exactly one row for every combination of its keys', () => {
    for (const exp of Object.values(table.experiments)) {
      const combos = tableCombinations(exp.keys.map((k) => sim.controls.find((c) => c.id === k)!));
      expect(exp.rows.length).toBe(combos.length);
      for (const v of combos) expect(exp.rows.filter((r) => exp.keys.every((k) => r.when[k] === v[k])).length).toBe(1);
    }
  });
  it('all experiments are evaluated at once', () => {
    const o = out({ sample: 'out', activity: 'run', stop: 3, phase: 'in' });
    expect([o.co2, o.beats, o.where, o.chest]).toEqual([4, 165, 'lungs-to-heart', 'bigger']);
  });
  it('an output no experiment sets is NaN, shown —', () => {
    const extra = { ...sim, outputs: [...sim.outputs, { id: 'spare', label: { en: 'Spare', zh: '备用' }, kind: 'number' as const }] };
    const o = evaluateSim(extra, resolveSimValues(extra, {}));
    expect(o.spare).toBeNaN();
    expect(outputText(extra.outputs.at(-1)!, o.spare, 'en')).toBe('—');
    expect(solveTable(table, {}, [{ id: 'o2' }]).o2).toBeNaN();
  });
  it('knows which experiment sets an output', () => {
    expect(tableExperimentOf(table, 'h2o')).toBe('air');
    expect(tableExperimentOf(table, 'muscle-need')).toBe('effort');
    expect(tableExperimentOf(table, 'spare')).toBeNull();
    expect(cellValue({ value: 0.04, decimals: 2 })).toBe(0.04);
  });
  it('is deterministic and fast (< 0.05 ms)', () => {
    const v = resolveSimValues(sim, { sample: 'out', activity: 'walk', stop: 5 });
    expect(solveTable(table, v, sim.outputs)).toEqual(solveTable(table, v, sim.outputs));
    expect(msPerCall(() => solveTable(table, v, sim.outputs), 50)).toBeLessThan(0.05);
  });
  it('round-trips the URL (sim=sample.out~activity.run)', () => {
    const set = { sample: 'out', activity: 'run' };
    expect(encodeSimParam(set)).toBe('activity.run~sample.out');
    expect(decodeSimParam('sample.out~activity.run')).toEqual(set);
    const o = out(decodeSimParam('sample.out~activity.run'));
    expect([o.o2, o.beats]).toEqual([16, 165]);
  });
});

describe('SIM and TYPICAL', () => {
  const byId = (id: string) => sim.outputs.find((o) => o.id === id)!;
  it('a typical output says TYPICAL, a sim output (the default) SIM', () => {
    expect(outputTag(byId('o2'))).toBe('typical');
    expect(outputTag(byId('beats'))).toBe('sim');
    expect(outputTag(byId('where'))).toBe('sim');
  });
  it('the status line says TYPICAL only when the card observes typical outputs alone', () => {
    expect(statusTag(['o2', 'co2', 'h2o'], sim.outputs)).toBe('TYPICAL');
    expect(statusTag(['o2', 'beats'], sim.outputs)).toBe('SIM');
    expect(statusTag([], sim.outputs)).toBe('SIM');
  });
});

describe('validation (§4.8)', () => {
  it('a row missing', () => {
    expect(issues(edit((s) => s.table.experiments.route!.rows.pop()))).toContainEqual(expect.stringContaining('no row for stop = 6'));
  });
  it('a row too many', () => {
    expect(issues(edit((s) => s.table.experiments.air!.rows.push(clone(s.table.experiments.air!.rows[0]!))))).toContainEqual(expect.stringContaining('more than one row for sample = "in"'));
  });
  it('a `set` key that is not an output', () => {
    expect(issues(edit((s) => { s.table.experiments.air!.rows[0]!.set.argon = 1; }))).toContainEqual(expect.stringContaining('unknown output "argon"'));
  });
  it('a state id that does not exist', () => {
    expect(issues(edit((s) => { s.table.experiments.route!.rows[2]!.set.blood = 'purple'; }))).toContainEqual(expect.stringContaining('has no state "purple"'));
  });
  it('a key that is not a control, a value that is not one of its values', () => {
    expect(issues(edit((s) => { s.table.experiments.air!.keys = ['jar']; }))).toContainEqual(expect.stringContaining('unknown control "jar"'));
    expect(issues(edit((s) => { s.table.experiments.air!.rows[1]!.when.sample = 'held'; }))).toContainEqual(expect.stringContaining('"held" is not a value of "sample"'));
  });
  it('an output in two experiments; rows that set different outputs', () => {
    expect(issues(edit((s) => { s.table.experiments.effort!.rows.forEach((r) => (r.set.o2 = 1)); }))).toContainEqual(expect.stringContaining('"o2" is set by "air" already'));
    expect(issues(edit((s) => { delete s.table.experiments.effort!.rows[1]!.set['muscle-need']; }))).toContainEqual(expect.stringContaining('missing muscle-need'));
  });
  it('a source not in sources.json', () => {
    const t = simSchema.parse(edit((s) => { s.table.experiments.air!.rows[0]!.source = ['S99']; })).table!;
    expect(tableSourceIssues(t, sim.outputs, HEART_LUNGS_SOURCES).map((x) => x.message)).toContainEqual(expect.stringContaining('unknown source "S99"'));
  });
  it('a sim row without the design study; a typical row with only the design study', () => {
    const noDesign = simSchema.parse(edit((s) => { s.table.experiments.effort!.rows[1]!.source = ['S9']; })).table!;
    expect(tableSourceIssues(noDesign, sim.outputs, HEART_LUNGS_SOURCES).map((x) => x.message)).toContainEqual(expect.stringContaining('cite the design study'));
    const onlyDesign = simSchema.parse(edit((s) => { s.table.experiments.air!.rows[1]!.source = ['S37']; })).table!;
    expect(tableSourceIssues(onlyDesign, sim.outputs, HEART_LUNGS_SOURCES).map((x) => x.message)).toContainEqual(expect.stringContaining('cite a source that is not the design study'));
  });
  it('a row of balls too short for the table', () => {
    const c = { ...ctx, partData: HEART_LUNGS_PARTS.map((p) => (p.id === 'o2-balls' ? { id: p.id, repeat: { count: 20 } } : p)) as never };
    expect(issues(HEART_LUNGS_SIM, c)).toContainEqual(expect.stringContaining('"o2-balls" has 20 copies, but "o2" asks for up to 21'));
  });
  it('hz on a flow, from a control, on a rotate', () => {
    expect(() => simSchema.parse(edit((s) => s.bind.push({ output: 'beats', flow: 'to-body', hz: { per: 1 } })))).toThrow();
    expect(issues(edit((s) => s.bind.push({ control: 'stop', animation: 'heartbeat', hz: { per: 1 } })))).toContainEqual(expect.stringContaining('hz needs a number output'));
    const c = { ...ctx, animations: new Map([...ctx.animations, ['spin', { kind: 'rotate', target: 'heart' }]]) };
    expect(issues(edit((s) => s.bind.push({ output: 'beats', animation: 'spin', hz: { per: 1 } })), c)).toContainEqual(expect.stringContaining('bind its speed with `rpm`'));
  });
  it('a number intensity and a vector intensity on one flow', () => {
    const c = { ...ctx };
    const s = edit((x) => {
      x.outputs.push({ id: 'paths', label: { en: 'Paths', zh: '路径' }, kind: 'vector' });
      x.bind.push({ output: 'paths', flow: 'to-body', intensity: { full: 1 } });
    });
    expect(issues(s, c)).toContainEqual(expect.stringContaining('already takes a number intensity'));
  });
  it('`tag` outside the table model, on a state', () => {
    expect(issues(edit((s) => { s.outputs[0]!.tag = 'typical'; }))).toContainEqual(expect.stringContaining('SIM / TYPICAL tag numbers'));
  });
  it('predict-then-observe changes a key of the observed output\'s experiment', () => {
    const card = { try: { vary: 'activity', observe: ['beats'], predict: { prompt: { en: 'p', zh: 'p' }, change: { sample: 'out' }, observe: 'beats', options: [{ id: 'a', label: { en: 'a', zh: 'a' }, means: 'more' }, { id: 'b', label: { en: 'b', zh: 'b' }, means: 'less' }] } } };
    expect(chapterSimIssues('', card as never, sim)).toContainEqual(expect.stringContaining('"sample" does not change "beats"'));
    const ok = { try: { ...card.try, predict: { ...card.try.predict, change: { activity: 'run' } } } };
    expect(chapterSimIssues('', ok as never, sim)).toEqual([]);
  });
});

describe('tidal flows in the parts file (§4.4)', () => {
  const file = (flow: Record<string, unknown>) => ({
    parts: [{ id: 'lung', name: { en: 'Lung', zh: '肺' }, group: 'g', summary: { en: 's', zh: 's' }, detail: { en: 'd', zh: 'd' }, primitive: { kind: 'sphere', size: [0.1], at: [0, 0, 0], color: 'tissue' } }],
    groups: [{ id: 'g', name: { en: 'G', zh: 'G' }, color: 'token:muscle-1' }, { id: 'air', name: { en: 'Air', zh: '空气' }, color: 'token:air' }],
    animations: [{ id: 'breathe', target: 'lung', kind: 'pulse', scale: 1.05, hz: 0.33 }],
    flows: [{ id: 'air-in', group: 'air', speed: 0.1, color: 'token:air', path: [[0, 0, 0], [0, 1, 0]], ...flow }],
  });
  const errors = (flow: Record<string, unknown>) => {
    const r = partsFileSchema.safeParse(file(flow));
    return r.success ? [] : r.error.issues.map((x) => `${x.path.join(".")} ${x.message}`.trim());
  };
  it('syncs to an animation that exists, or keeps its own hz', () => {
    expect(errors({ tidal: { sync: 'breathe' } })).toEqual([]);
    expect(errors({ tidal: { hz: 0.4 } })).toEqual([]);
    expect(errors({ tidal: { sync: 'cough' } })).toContainEqual(expect.stringContaining('unknown animation "cough"'));
  });
  it('is not used with colour stops or open ends', () => {
    expect(errors({ tidal: { sync: 'breathe' }, stops: [{ at: 0, color: 'token:air' }, { at: 1, color: 'token:oxygen' }] })).toContainEqual(expect.stringContaining('no `stops`'));
    expect(errors({ tidal: { sync: 'breathe' }, ends: 'open' })).toContainEqual(expect.stringContaining('no `ends: open`'));
  });
});
