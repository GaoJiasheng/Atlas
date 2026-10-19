/**
 * The life-cycle model (docs/33 §2.4, §4.2, §4.6): the stage on every day
 * 0–8 at every temperature, hatching-to-adult, the larval and pupal days and
 * the days left at the shown decimals (the spec's table pinned), the scaling
 * to the study's total (and Σ without one), orderings (warmer is faster, a
 * later day is never an earlier stage), the tipping-out cut-off at every
 * step value with the wall switch (and the 7-day borderline near the 7.23-day
 * mean), the cycle's speed, `on:` / `size:` / `control:` quantities, the
 * bindings it drives, determinism, the URL round trip, and the validation
 * of the `lifeCycle` data and its outputs.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim, simQuantities, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { lifeCycleQuantity, stageOnDay, stageSpans, timedStages } from '../../src/engines/space-scene/lib/sim/lifecycle';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { chapterSimIssues, simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { formatReading } from '../../src/engines/space-scene/lib/telemetry';
import { AEDES_FLOWS, AEDES_PARTS, AEDES_POSES, aedesSim } from './fixtures/aedes-cycle';

const run = (set: SimValues = {}) => evaluateSim(aedesSim, resolveSimValues(aedesSim, set));
const n = (v: unknown) => v as number;
const shown = (v: number, d = 1) => Number(formatReading(v, d));
const lc = aedesSim.lifeCycle!;

const ctx = {
  parts: new Set([...AEDES_PARTS, 'bench']),
  flows: new Map(Object.entries(AEDES_FLOWS).map(([id, paths]) => [id, { paths: paths.map((p) => ({ id: p })), own: true }])),
  animations: new Map(),
  poses: new Set(AEDES_POSES),
  countable: new Set<string>(),
  contextParts: new Set(['bench']),
};

/** docs/33 §2.4 (28 °C given in the spec; the other rows by the same rule: stages scaled to the study's total, [from, to)). */
const STAGES: Record<number, string[]> = {
  20: ['l1', 'l1', 'l1', 'l1', 'l2', 'l3', 'l3', 'l4', 'l4'],
  25: ['l1', 'l1', 'l1', 'l2', 'l3', 'l4', 'l4', 'l4', 'pupa'],
  28: ['l1', 'l1', 'l2', 'l3', 'l4', 'l4', 'pupa', 'pupa', 'adult'],
  32: ['l1', 'l1', 'l2', 'l3', 'l4', 'pupa', 'pupa', 'adult', 'adult'],
};
const TABLE = [
  // temp, to-adult, larva-days, pupa-days, rate (shown to 2 places)
  [20, 13.4, 9.3, 4.1, 0.54],
  [25, 10.2, 7.6, 2.6, 0.71],
  [28, 7.2, 5.4, 1.9, 1],
  [32, 6.4, 4.7, 1.7, 1.13],
] as const;

describe('stage on day d, days at each temperature (docs/33 §2.4)', () => {
  it.each(Object.entries(STAGES))('%s °C: the stage on days 0–8', (temp, stages) => {
    stages.forEach((st, day) => expect(run({ temp: Number(temp), day }).stage, `day ${day}`).toBe(st));
  });
  it.each(TABLE)('%s °C → %s d to adult, larva %s d, pupa %s d, cycle ×%s', (temp, total, larva, pupa, rate) => {
    const o = run({ temp });
    expect(shown(n(o['to-adult']))).toBe(total);
    expect(shown(n(o['larva-days']))).toBe(larva);
    expect(shown(n(o['pupa-days']))).toBe(pupa);
    expect(n(o['larva-days']) + n(o['pupa-days'])).toBeCloseTo(n(o['to-adult']), 9);
    const r = o.rate as Record<string, number>;
    expect(Object.keys(r).sort()).toEqual(['life-cycle:lay', 'life-cycle:out', 'life-cycle:ring']);
    for (const v of Object.values(r)) expect(shown(v, 2)).toBe(rate);
  });
  it('28 °C boundaries: L1 [0, 1.877), L2 [1.877, 2.556), L3 [2.556, 3.555), L4 [3.555, 5.372), pupa [5.372, 7.23)', () => {
    const s = stageSpans(lc, 28)!;
    expect(s.total).toBe(7.23);
    expect(s.spans.map((x) => [x.id, +x.from.toFixed(3), +x.to.toFixed(3)])).toEqual([
      ['l1', 0, 1.877],
      ['l2', 1.877, 2.556],
      ['l3', 2.556, 3.555],
      ['l4', 3.555, 5.373],
      ['pupa', 5.373, 7.23],
    ]);
    // The spec rounds 5.3726 down to 5.372; the boundary is 1.82 × 0.99862 past 3.5551.
    expect(s.spans[3]!.to).toBeCloseTo(5.3726, 4);
  });
  it('days left: max(0, total − day), one decimal', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map((day) => shown(n(run({ temp: 28, day })['days-left'])))).toEqual([7.2, 6.2, 5.2, 4.2, 3.2, 2.2, 1.2, 0.2, 0]);
    expect([0, 4, 7, 8].map((day) => shown(n(run({ temp: 32, day })['days-left'])))).toEqual([6.4, 2.4, 0, 0]);
  });
  it('the stages are scaled to the total; without a total they add up to Σ', () => {
    for (const t of [20, 25, 28, 32]) {
      const s = stageSpans(lc, t)!;
      expect(s.spans.reduce((a, x) => a + x.days, 0)).toBeCloseTo(s.total, 12);
      expect(s.total).toBe(lc.days[String(t)]!.total);
    }
    const raw = JSON.parse(JSON.stringify(lc));
    delete raw.days['28'].total;
    const s = stageSpans(raw, 28)!;
    expect(s.total).toBeCloseTo(7.24, 12);
    expect(s.spans.map((x) => +x.days.toFixed(2))).toEqual([1.88, 0.68, 1.0, 1.82, 1.86]);
  });
  it('a stage covers [from, to): the boundary day belongs to the next stage; on or after the total, the adult', () => {
    const s = stageSpans(lc, 28)!;
    expect(stageOnDay(s.spans, s.total, 'adult', s.spans[1]!.from)).toBe('l2');
    expect(stageOnDay(s.spans, s.total, 'adult', s.spans[1]!.from - 1e-9)).toBe('l1');
    expect(stageOnDay(s.spans, s.total, 'adult', 7.23)).toBe('adult');
    expect(stageOnDay(s.spans, s.total, 'adult', 7.2299)).toBe('pupa');
  });
  it('the egg takes no days: the stage is never the egg, and there is no days:egg', () => {
    for (const temp of [20, 25, 28, 32]) for (let day = 0; day <= 8; day++) expect(run({ temp, day }).stage).not.toBe('egg');
    expect(timedStages(lc)).toEqual(['l1', 'l2', 'l3', 'l4', 'pupa']);
    expect(simQuantities(aedesSim, resolveSimValues(aedesSim, {}))['days:egg']).toBeUndefined();
  });
});

describe('orderings', () => {
  const ORDER = lc.stages.map((s) => s.id);
  it('warmer water: every total shorter, the cycle faster', () => {
    const totals = [20, 25, 28, 32].map((temp) => n(run({ temp })['to-adult']));
    const rates = [20, 25, 28, 32].map((temp) => (run({ temp }).rate as Record<string, number>)['life-cycle:ring']!);
    totals.slice(1).forEach((v, i) => expect(v).toBeLessThan(totals[i]!));
    rates.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(rates[i]!));
  });
  it('a later day is never an earlier stage; the days left never go up', () => {
    for (const temp of [20, 25, 28, 32]) {
      let stage = -1;
      let left = Infinity;
      for (let day = 0; day <= 8; day++) {
        const o = run({ temp, day });
        const k = ORDER.indexOf(String(o.stage));
        expect(k).toBeGreaterThanOrEqual(stage);
        expect(n(o['days-left'])).toBeLessThanOrEqual(left);
        stage = k;
        left = n(o['days-left']);
      }
    }
  });
  it('on any given day, warmer water is at the same stage or further on', () => {
    for (let day = 0; day <= 8; day++) {
      const ks = [20, 25, 28, 32].map((temp) => ORDER.indexOf(String(run({ temp, day }).stage)));
      ks.slice(1).forEach((k, i) => expect(k).toBeGreaterThanOrEqual(ks[i]!));
    }
  });
});

describe('tipping the water out (emptying)', () => {
  it.each([
    [2, 'none'],
    [4, 'none'],
    [6, 'none'],
    [8, 'some'],
    [10, 'some'],
    [14, 'some'],
  ] as const)('28 °C, every %s days → adults %s', (every, adults) => {
    expect(run({ temp: 28, every }).adults).toBe(adults);
  });
  it('the wall switch: eggs stay unless the wall is scrubbed too', () => {
    for (const every of [2, 4, 6, 8, 10, 14]) {
      expect(run({ every, wipe: false })['eggs-left']).toBe('yes');
      expect(run({ every, wipe: true })['eggs-left']).toBe('none');
    }
  });
  it('the borderline: 7 days is under the 7.23-day mean at 28 °C (none), over the 6.40-day mean at 32 °C (some)', () => {
    const raw = JSON.parse(JSON.stringify(aedesSim));
    raw.controls.find((c: { id: string }) => c.id === 'every').values = [2, 4, 6, 7, 8, 10, 14];
    const sim = simSchema.parse(raw);
    const at = (temp: number, every: number) => evaluateSim(sim, resolveSimValues(sim, { temp, every })).adults;
    expect(at(28, 7)).toBe('none');
    expect(at(28, 8)).toBe('some');
    expect(at(32, 6)).toBe('none');
    expect(at(32, 7)).toBe('some');
    expect(at(20, 10)).toBe('none');
    expect(at(20, 14)).toBe('some');
    expect(simIssues(sim, ctx)).toEqual([]);
  });
});

describe('quantities, bindings, URL', () => {
  const extra = () => {
    const raw = JSON.parse(JSON.stringify(aedesSim));
    raw.lifeCycle.size = { head: { unit: 'mm', values: { l1: 0.3, l2: 0.45, l3: 0.65, l4: 0.95 } } };
    raw.outputs.push(
      { id: 'head', from: 'size:head', label: { en: 'Head', zh: '头' }, unit: 'mm', decimals: 2 },
      { id: 'on-pupa', from: 'on:pupa', label: { en: 'Pupa', zh: '蛹' } },
      { id: 'day-now', from: 'control:day', label: { en: 'Day', zh: '天' } },
      { id: 'wiped', from: 'control:wipe', label: { en: 'Wiped', zh: '刷' } },
      { id: 'l3-days', from: 'days:l3', label: { en: 'L3', zh: '三龄' }, unit: 'd', decimals: 2 },
    );
    return simSchema.parse(raw);
  };
  it('size:, on:, control:, days:<stage> (placeholder sizes)', () => {
    const sim = extra();
    expect(simIssues(sim, ctx)).toEqual([]);
    const o = (set: SimValues) => evaluateSim(sim, resolveSimValues(sim, set));
    expect(o({ day: 3 }).head).toBe(0.65);
    expect(Number.isNaN(n(o({ day: 7 }).head))).toBe(true);
    expect(o({ day: 6 })['on-pupa']).toBe(1);
    expect(o({ day: 5 })['on-pupa']).toBe(0);
    expect(o({ day: 5 })['day-now']).toBe(5);
    expect(o({ wipe: true }).wiped).toBe(1);
    expect(shown(n(o({ temp: 28 })['l3-days']), 2)).toBe(1.0);
    expect(run({ temp: 32 })['temp-now']).toBe(32);
  });
  it('bindings: the marker pose per stage, eggs and escaped adults by state, the cycle flow by rate', () => {
    const fx = (set: SimValues) => {
      const values = resolveSimValues(aedesSim, set);
      return simEffects(aedesSim, values, evaluateSim(aedesSim, values));
    };
    expect(fx({ day: 4 }).poses.get('follow-marker')).toBe('marker-l4');
    expect(fx({ day: 8 }).poses.get('follow-marker')).toBe('marker-adult');
    expect(fx({ every: 6 }).hidden.has('escaped-adults')).toBe(true);
    expect(fx({ every: 8 }).hidden.has('escaped-adults')).toBe(false);
    expect(fx({ wipe: false }).hidden.has('eggs')).toBe(false);
    expect(fx({ wipe: true }).hidden.has('eggs')).toBe(true);
    const flow = fx({ temp: 32 }).flows.get('life-cycle')!;
    expect(Object.keys(flow.paths!).sort()).toEqual(['lay', 'out', 'ring']);
    expect(flow.paths!.ring).toBeCloseTo(7.23 / 6.4, 9);
    expect(flow.mode).toBe('speed');
  });
  it('one system: the PLATE block names the stage (not separate experiments)', () => {
    expect(SEPARATE_EXPERIMENTS['life-cycle']).toBe(false);
  });
  it('deterministic', () => {
    expect(JSON.stringify(run({ temp: 25, day: 6, every: 10 }))).toBe(JSON.stringify(run({ temp: 25, day: 6, every: 10 })));
  });
  it('URL round trip: sim=temp.32~day.4', () => {
    const values = decodeSimParam('temp.32~day.4');
    expect(values).toEqual({ temp: 32, day: 4 });
    expect(decodeSimParam(encodeSimParam(values))).toEqual(values);
    expect(run(values).stage).toBe('l4');
  });
  it('quantity names', () => {
    expect(lifeCycleQuantity('stage')).toEqual({ kind: 'state' });
    expect(lifeCycleQuantity('days:larva')).toEqual({ kind: 'number', prefix: 'days', ref: 'larva' });
    expect(lifeCycleQuantity('emptying:adults')?.needs).toBe('emptying');
    expect(lifeCycleQuantity('size:head')?.needs).toBe('size');
    expect(lifeCycleQuantity('speed')).toBeNull();
  });
});

describe('validate: life-cycle data and outputs', () => {
  const issuesOf = (patch: (s: SimData & { lifeCycle: Record<string, unknown> }) => void) => {
    const raw = JSON.parse(JSON.stringify(aedesSim));
    patch(raw);
    return simIssues(simSchema.parse(raw), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);
  };
  const lcOf = (s: SimData) => s.lifeCycle! as unknown as {
    days: Record<string, Record<string, number>>;
    stages: { id: string; part?: string }[];
    start: string;
    rate: { flow: string; paths: string[]; reference: number };
    card: { compare: { control: string } };
    emptying: { every: string; wipe?: string };
    groups: Record<string, unknown>;
  };
  it('the Aedes data are clean', () => {
    expect(simIssues(aedesSim, ctx)).toEqual([]);
  });
  it('a temperature without a row, a row that is not a temperature', () => {
    expect(issuesOf((s) => void delete lcOf(s).days['25'])).toContain('lifeCycle.days: no measured row for 25 °C (a value of "temp")');
    expect(issuesOf((s) => void (lcOf(s).days['30'] = { ...lcOf(s).days['28']! }))).toContain('lifeCycle.days.30: 30 is not a value of "temp"');
  });
  it('a stage without days, days for the egg or the adult, a negative length, a total 5 % off', () => {
    expect(issuesOf((s) => void delete lcOf(s).days['28']!.l3)).toContain('lifeCycle.days.28.l3: no days for stage "l3"');
    expect(issuesOf((s) => void (lcOf(s).days['28']!.egg = 2.6)).some((x) => x.startsWith('lifeCycle.days.28.egg: "egg" takes no days'))).toBe(true);
    expect(issuesOf((s) => void (lcOf(s).days['28']!.adult = 20)).some((x) => x.includes('the last stage, the adult'))).toBe(true);
    expect(issuesOf((s) => void (lcOf(s).days['28']!.l2 = -0.68))).toContain('lifeCycle.days.28.l2: -0.68: a stage lasts more than 0 days');
    expect(issuesOf((s) => void (lcOf(s).days['28']!.total = 8.0)).some((x) => x.startsWith('lifeCycle.days.28.total: total 8 is more than 5 %'))).toBe(true);
    expect(issuesOf((s) => void (lcOf(s).days['28']!.total = 7.5))).toEqual([]);
  });
  it('start not a stage, start the last stage; the adult not last', () => {
    expect(issuesOf((s) => void (lcOf(s).start = 'hatchling')).some((x) => x.startsWith('lifeCycle.start: unknown stage "hatchling"'))).toBe(true);
    expect(issuesOf((s) => void (lcOf(s).start = 'adult')).some((x) => x.startsWith('lifeCycle.start: "adult" is the last stage'))).toBe(true);
    const moved = issuesOf((s) => {
      const st = lcOf(s).stages;
      st.push(st.splice(5, 1)[0]!); // pupa after the adult
    });
    expect(moved.some((x) => x.includes('"adult"') && x.includes('no days'))).toBe(true);
    expect(moved.some((x) => x.includes('"pupa" takes no days'))).toBe(true);
  });
  it('unknown or context parts, duplicate stages, groups', () => {
    expect(issuesOf((s) => void (lcOf(s).stages[2]!.part = 'nope'))).toContain('lifeCycle.stages.2.part: unknown part "nope"');
    const c = issuesOf((s) => void (lcOf(s).stages[2]!.part = 'bench'));
    expect(c.length).toBe(1);
    expect(c[0]).toContain('context part');
    expect(issuesOf((s) => void (lcOf(s).stages[3]!.id = 'l2')).some((x) => x.includes('duplicate stage "l2"'))).toBe(true);
    expect(issuesOf((s) => void (lcOf(s).groups.larva = ['l1', 'l3']))).toContain('lifeCycle.groups.larva: a group is stages next to each other, in order');
    expect(issuesOf((s) => void (lcOf(s).groups.larva = ['egg', 'l1']))).toContain('lifeCycle.groups.larva: "egg" is not a stage that takes days');
  });
  it('control kinds: temp / day / every steps, wipe and compare toggles', () => {
    expect(issuesOf((s) => void (lcOf(s).emptying.wipe = 'every'))).toContain('lifeCycle.emptying.wipe: "every" is a step control, not a toggle');
    expect(issuesOf((s) => void (lcOf(s).card.compare.control = 'temp'))).toContain('lifeCycle.card.compare.control: "temp" is a step control, not a toggle');
    expect(issuesOf((s) => void ((s.lifeCycle as unknown as { temp: string }).temp = 'wipe'))).toContain('lifeCycle.temp: "wipe" is a toggle control, not a step');
    expect(issuesOf((s) => void ((s.lifeCycle as unknown as { day: string }).day = 'missing'))).toContain('lifeCycle.day: unknown control "missing"');
  });
  it('the rate: a flow with these paths, every path listed, a reference temperature', () => {
    expect(issuesOf((s) => void (lcOf(s).rate.flow = 'other'))).toContain('lifeCycle.rate.flow: unknown flow "other"');
    expect(issuesOf((s) => void (lcOf(s).rate.paths = ['ring', 'out']))).toContain('lifeCycle.rate.paths: list path "lay" of flow "life-cycle" too (a path left out stops)');
    expect(issuesOf((s) => void (lcOf(s).rate.paths = ['ring', 'out', 'lay', 'back']))).toContain('lifeCycle.rate.paths: flow "life-cycle" has no path "back"');
    expect(issuesOf((s) => void (lcOf(s).rate.reference = 30))).toContain('lifeCycle.rate.reference: 30 is not a value of "temp"');
    const pathless = simIssues(aedesSim, { ...ctx, flows: new Map([['life-cycle', { own: true }]]) }).map((x) => x.message);
    expect(pathless).toContain('flow "life-cycle" has no `paths` (the rate is a speed per path)');
  });
  it('outputs: a quantity of this model, its kind, its data, every state labelled', () => {
    expect(issuesOf((s) => void s.outputs.push({ id: 'x', label: { en: 'x', zh: 'x' }, kind: 'number', from: 'days:egg' }))).toContain('outputs.9.from: the life-cycle model has no quantity "days:egg"');
    expect(issuesOf((s) => void s.outputs.push({ id: 'x', label: { en: 'x', zh: 'x' }, kind: 'number', from: 'speed' }))).toContain('outputs.9.from: the life-cycle model has no quantity "speed"');
    expect(issuesOf((s) => void s.outputs.push({ id: 'x', label: { en: 'x', zh: 'x' }, kind: 'number', from: 'stage' }))).toContain('outputs.9.kind: "stage" is a state, not a number');
    expect(issuesOf((s) => void s.outputs.push({ id: 'x', label: { en: 'x', zh: 'x' }, kind: 'number', from: 'size:head' }))).toContain('outputs.9.from: "size:head" needs the life-cycle model\'s `size` data');
    const noEmptying = issuesOf((s) => void delete (s.lifeCycle as unknown as { emptying?: unknown }).emptying);
    expect(noEmptying).toContain('outputs.6.from: "emptying:adults" needs the life-cycle model\'s `emptying` data');
    expect(issuesOf((s) => void delete (s.outputs[0]!.states as Record<string, unknown>).pupa)).toContain('outputs.0.states: "stage" can be "pupa": give it a label');
    expect(issuesOf((s) => void ((s.outputs[0]!.states as Record<string, unknown>).nymph = { en: 'N', zh: 'N' }))).toContain('outputs.0.states.nymph: "stage" is never "nymph" (egg, l1, l2, l3, l4, pupa, adult)');
    expect(issuesOf((s) => void ((s.outputs[6]!.states as Record<string, unknown>).many = { en: 'M', zh: 'M' }))).toContain('outputs.6.states.many: "emptying:adults" is never "many" (none, some)');
    const noModel = simIssues(simSchema.parse({ ...JSON.parse(JSON.stringify(aedesSim)), lifeCycle: undefined }), ctx).map((x) => x.message);
    expect(noModel).toContain('a life-cycle sim needs `lifeCycle`');
  });
  it('"total" is not a stage id', () => {
    const raw = JSON.parse(JSON.stringify(aedesSim));
    raw.lifeCycle.stages[1].id = 'total';
    expect(simSchema.safeParse(raw).success).toBe(false);
  });
  it('chapter settings: values of the controls', () => {
    expect(chapterSimIssues('', { set: { temp: 30 } }, aedesSim)).toEqual(['sim.set: 30 is not a value of "temp"']);
    expect(chapterSimIssues('', { set: { temp: 32, day: 4, compare: true }, try: { vary: 'day', observe: ['stage', 'days-left'] } }, aedesSim)).toEqual([]);
  });
});
