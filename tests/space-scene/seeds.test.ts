/**
 * The seeds model (docs/41 §4.2 E-S1, §4.6) on the flower-and-seed author
 * template: every cell of §2.6 — the seven fruits (T1), the three lab
 * temperatures × 13 days (T2, with the edges: 20 °C fewer on day 4, half or
 * more on day 5), the four cups of §0.3 on days 0 and 7 and every pair of
 * them (T3), and the five-cup table as first drafted (with cup C) — plus the
 * registration, determinism and speed, the URL round trip, the bindings it
 * drives and every validation case of §4.6.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects, tintLevel } from '../../src/engines/space-scene/lib/sim/bind';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';
import { cupChange, cupConditions, cupResult, cupSeedlings, germinates, halfState, seedsQuantity, seedsStates, solveSeeds } from '../../src/engines/space-scene/lib/sim/seeds';
import { seedsSchema, type SeedsCups } from '../../src/engines/space-scene/seeds-schema';
import { chapterSimIssues, quantityKind, simIssues, simSchema, simTimelineChannels, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { FIVE_CUPS, SEED_CUPS, SEED_FRUITS, SEEDS_BENCH_FLOWS, SEEDS_BENCH_PARTS, SEEDS_BENCH_POSES, SEEDS_BENCH_SIM } from './fixtures/seeds-bench';
import { msPerCall } from '../timing';

const sim: SimData = simSchema.parse(SEEDS_BENCH_SIM);
const seeds = sim.seeds!;
const ctx = {
  parts: new Set(SEEDS_BENCH_PARTS),
  flows: new Map(SEEDS_BENCH_FLOWS.map((id) => [id, { paths: [{ id: 'main' }], own: true }])),
  animations: new Map<string, { kind: string; target: string }>(),
  poses: new Set(SEEDS_BENCH_POSES),
  countable: new Set<string>(),
};
const out = (set: SimValues) => evaluateSim(sim, resolveSimValues(sim, set));
const issues = (input: unknown) => simIssues(simSchema.parse(input), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
type Mutable = {
  controls: Record<string, unknown>[];
  outputs: Record<string, unknown>[];
  bind: Record<string, unknown>[];
  seeds: {
    dispersal?: { fruit: string; fruits: Record<string, Record<string, unknown>> };
    timing?: { temp: string; day: string; medians: Record<string, number> };
    cups?: { cup: string; against: string; day: string; after: number; places: Record<string, Record<string, unknown>>; set: Record<string, Record<string, unknown>> };
  };
};
const edit = (f: (s: Mutable) => void) => {
  const s = clone(SEEDS_BENCH_SIM) as unknown as Mutable;
  f(s);
  return s;
};

describe('the template is valid', () => {
  it('parses with no issues', () => {
    expect(simIssues(sim, ctx)).toEqual([]);
  });
  it('is registered: separate experiments, no timeline, kinds by sub-model', () => {
    expect(SEPARATE_EXPERIMENTS.seeds).toBe(true);
    expect(simTimelineChannels(sim, 'timing:median')).toBeNull();
    expect(quantityKind(sim, 'dispersal:method')).toBe('state');
    expect(quantityKind(sim, 'timing:median')).toBe('number');
    expect(quantityKind(sim, 'timing:half')).toBe('state');
    expect(quantityKind(sim, 'cups:changed')).toBe('state');
    expect(quantityKind(sim, 'cup:d:pale')).toBe('number');
    expect(quantityKind(sim, 'cup:c:pale')).toBeNull();
    expect(quantityKind(sim, 'cup:d:colour')).toBeNull();
    expect(quantityKind(sim, 'control:temp')).toBe('number');
    expect(quantityKind(sim, 'control:cup')).toBeNull();
    expect(quantityKind(sim, 'cups:nope')).toBeNull();
    // A sub-model left out offers none of its quantities.
    const noTiming = seedsSchema.parse({ ...seeds, timing: undefined });
    expect(seedsQuantity(noTiming, 'timing:median', sim.controls)).toBeNull();
  });
});

describe('T1 dispersal (§2.6)', () => {
  it.each([
    ['angsana', 'wind', 'wing'],
    ['sea-almond', 'water', 'floats'],
    ['coconut', 'water', 'floats'],
    ['chilli', 'animals', 'eaten'],
    ['fig', 'animals', 'eaten'],
    ['rubber', 'splitting', 'bursts'],
    ['balsam', 'splitting', 'bursts'],
  ])('%s travels %s, helped by %s', (fruit, method, feature) => {
    const o = out({ fruit });
    expect([o.method, o.feature]).toEqual([method, feature]);
  });
  it('covers all seven fruits and labels every method and feature', () => {
    expect(Object.keys(seeds.dispersal!.fruits)).toEqual([...SEED_FRUITS]);
    expect(seedsStates(seeds, 'dispersal:method', sim.controls)).toEqual(['wind', 'water', 'animals', 'splitting']);
    expect(seedsStates(seeds, 'dispersal:feature', sim.controls)).toEqual(['wing', 'floats', 'eaten', 'bursts']);
  });
});

describe('T2 temperature and days (§2.6, Silwal et al. 2026)', () => {
  // Each temperature: its median, and the first day on which half or more of the seeds that germinate have germinated.
  const ROWS: [number, number, number][] = [
    [20, 4.3, 5],
    [17, 6.5, 7],
    [14, 9.4, 10],
  ];
  it.each(ROWS)('at %s °C half by day %s', (temp, median) => {
    const o = out({ temp });
    expect(o['half-day']).toBe(median);
    expect(o['temp-now']).toBe(temp);
  });
  it('every temperature × every day 0–12', () => {
    for (const [temp, median, first] of ROWS)
      for (let day = 0; day <= 12; day++) {
        const o = out({ temp, 'count-day': day });
        expect(o.half, `${temp} °C day ${day}`).toBe(day >= first ? 'half-or-more' : 'fewer');
        expect(o['half-day']).toBe(median);
      }
  });
  it('the §2.6 columns: days 4, 5, 7, 10', () => {
    const at = (temp: number, day: number) => out({ temp, 'count-day': day }).half;
    expect([4, 5, 7, 10].map((d) => at(20, d))).toEqual(['fewer', 'half-or-more', 'half-or-more', 'half-or-more']);
    expect([4, 5, 7, 10].map((d) => at(17, d))).toEqual(['fewer', 'fewer', 'half-or-more', 'half-or-more']);
    expect([4, 5, 7, 10].map((d) => at(14, d))).toEqual(['fewer', 'fewer', 'fewer', 'half-or-more']);
  });
  it('the median day itself counts as reached', () => {
    expect(halfState(4.3, 4.3)).toBe('half-or-more');
    expect(halfState(4.3, 4.29)).toBe('fewer');
  });
  it('the medians fall all the way as it warms (the T2 graph)', () => {
    const m = [14, 17, 20].map((temp) => out({ temp })['half-day'] as number);
    expect(m[0]).toBeGreaterThan(m[1]!);
    expect(m[1]).toBeGreaterThan(m[2]!);
  });
  it('shows the median to one decimal', () => {
    const o = sim.outputs.find((x) => x.id === 'half-day')!;
    expect([outputText(o, 9.4, 'en'), outputText(o, 4.3, 'zh')]).toEqual(['9.4', '4.3']);
  });
});

describe('T3 four cups (§2.6 with §0.3: cup C dropped)', () => {
  // cup: [day-7 result, day-7 seedlings]
  const DAY7: Record<string, [string, string]> = {
    a: ['germinated', 'green'],
    b: ['not-germinated', 'none'],
    d: ['germinated', 'pale'],
    e: ['not-germinated', 'none'],
  };
  it.each(SEED_CUPS.map((k) => [k]))('cup %s on day 0 and day 7', (cup) => {
    const d0 = out({ cup, day: 0 });
    expect([d0['cup-result'], d0.seedlings, d0[`grown-${cup}`], d0[`pale-${cup}`]]).toEqual(['waiting', 'none', 0, 0]);
    const d7 = out({ cup, day: 7 });
    const [result, seedlings] = DAY7[cup]!;
    expect([d7['cup-result'], d7.seedlings]).toEqual([result, seedlings]);
    expect(d7[`grown-${cup}`]).toBe(result === 'germinated' ? 1 : 0);
    expect(d7[`pale-${cup}`]).toBe(seedlings === 'pale' ? 1 : 0);
    expect(d7['day-now']).toBe(7);
  });
  it('the per-cup numbers do not depend on the cup looked at', () => {
    const o = out({ cup: 'b', against: 'e', day: 7 });
    expect(SEED_CUPS.map((k) => [o[`grown-${k}`], o[`pale-${k}`]])).toEqual([[1, 0], [0, 0], [1, 1], [0, 0]]);
  });
  it('what differs between every pair (4 × 4)', () => {
    const TABLE: Record<string, Record<string, string>> = {
      a: { a: 'same-cup', b: 'water', d: 'light', e: 'more-than-one' },
      b: { a: 'water', b: 'same-cup', d: 'more-than-one', e: 'more-than-one' },
      d: { a: 'light', b: 'more-than-one', d: 'same-cup', e: 'warmth' },
      e: { a: 'more-than-one', b: 'more-than-one', d: 'warmth', e: 'same-cup' },
    };
    for (const cup of SEED_CUPS)
      for (const against of SEED_CUPS) {
        const o = out({ cup, against, day: 7 });
        expect(o.changed, `${cup} vs ${against}`).toBe(TABLE[cup]![against]);
        expect(o['against-result']).toBe(DAY7[against]![0]);
      }
  });
  it('E against A is not a fair test; E against D is (warmth only)', () => {
    expect(out({ cup: 'e', against: 'a' }).changed).toBe('more-than-one');
    expect(out({ cup: 'e', against: 'd' }).changed).toBe('warmth');
    expect(out({ cup: 'b', against: 'd' }).changed).toBe('more-than-one');
  });
  it('the states the four cups can give (no `air`: no two differ only in air)', () => {
    expect(seedsStates(seeds, 'cups:changed', sim.controls)).toEqual(['same-cup', 'water', 'light', 'more-than-one', 'warmth']);
    expect(seedsStates(seeds, 'cups:result', sim.controls)).toEqual(['waiting', 'germinated', 'not-germinated']);
    expect(seedsStates(seeds, 'cups:seedlings', sim.controls)).toEqual(['none', 'green', 'pale']);
  });
  it('light is not in the germination rule', () => {
    expect(germinates({ water: true, air: true, warmth: true, light: false })).toBe(true);
    expect(germinates({ water: true, air: true, warmth: false, light: true })).toBe(false);
  });
});

describe('the five cups as first drafted (§2.6, with C)', () => {
  const five = FIVE_CUPS as unknown as SeedsCups;
  it('day 7: result and seedlings per cup', () => {
    const rows = ['a', 'b', 'c', 'd', 'e'].map((k) => [k, cupResult(five, k, 7), cupSeedlings(five, k, 7)]);
    expect(rows).toEqual([
      ['a', 'germinated', 'green'],
      ['b', 'not-germinated', 'none'],
      ['c', 'not-germinated', 'none'],
      ['d', 'germinated', 'pale'],
      ['e', 'not-germinated', 'none'],
    ]);
    for (const k of ['a', 'b', 'c', 'd', 'e']) expect([cupResult(five, k, 0), cupSeedlings(five, k, 0)]).toEqual(['waiting', 'none']);
  });
  it('what differs, 5 × 5', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const TABLE = [
      ['same-cup', 'water', 'air', 'light', 'more-than-one'],
      ['water', 'same-cup', 'more-than-one', 'more-than-one', 'more-than-one'],
      ['air', 'more-than-one', 'same-cup', 'more-than-one', 'more-than-one'],
      ['light', 'more-than-one', 'more-than-one', 'same-cup', 'warmth'],
      ['more-than-one', 'more-than-one', 'more-than-one', 'warmth', 'same-cup'],
    ];
    expect(ids.map((x) => ids.map((y) => cupChange(five, x, y)))).toEqual(TABLE);
    // The §2.6 columns: against A, against D.
    expect(ids.map((x) => cupChange(five, x, 'a'))).toEqual(['same-cup', 'water', 'air', 'light', 'more-than-one']);
    expect(ids.map((x) => cupChange(five, x, 'd'))).toEqual(['light', 'more-than-one', 'more-than-one', 'same-cup', 'warmth']);
    expect(cupConditions(five, 'c')).toEqual({ water: true, air: false, warmth: true, light: true });
  });
});

describe('the model', () => {
  it('is deterministic and fast (< 0.05 ms)', () => {
    const v = resolveSimValues(sim, { fruit: 'rubber', temp: 14, 'count-day': 9, cup: 'e', against: 'd', day: 7 });
    expect(solveSeeds(seeds, v, sim.controls)).toEqual(solveSeeds(seeds, v, sim.controls));
    expect(msPerCall(() => evaluateSim(sim, v), 50)).toBeLessThan(0.05);
  });
  it('round-trips the URL (sim=cup.e~against.d~day.7)', () => {
    const set = { cup: 'e', against: 'd', day: 7 };
    expect(encodeSimParam(set)).toBe('against.d~cup.e~day.7');
    expect(decodeSimParam('cup.e~against.d~day.7')).toEqual(set);
    const o = out(decodeSimParam('cup.e~against.d~day.7'));
    expect([o['cup-result'], o['against-result'], o.changed]).toEqual(['not-germinated', 'germinated', 'warmth']);
  });
});

describe('the bindings it drives', () => {
  const fx = (set: SimValues) => simEffects(sim, resolveSimValues(sim, set), out(set));
  it('cup D on day 7: seedlings shown and tinted pale, seeds hidden, rings on D and A', () => {
    const e = fx({ cup: 'd', against: 'a', day: 7 });
    expect(e.hidden.has('seeds-d')).toBe(true);
    expect(e.hidden.has('seedlings-d')).toBe(false);
    expect(e.tint.get('seedlings-d')).toEqual({ color: 'token:seedling-pale', level: 0.85 });
    expect(e.tint.get('seedlings-a')).toEqual({ color: 'token:seedling-pale', level: 0 });
    expect(e.hidden.has('seedlings-b')).toBe(true);
    expect(e.hidden.has('seeds-b')).toBe(false);
    expect(e.poses.get('pick-ring')).toBe('pick-d');
    expect(e.poses.get('ref-ring')).toBe('ref-a');
  });
  it('day 0: every cup shows its seeds, no seedlings', () => {
    const e = fx({ day: 0 });
    for (const k of SEED_CUPS) {
      expect(e.hidden.has(`seeds-${k}`)).toBe(false);
      expect(e.hidden.has(`seedlings-${k}`)).toBe(true);
    }
  });
  it('the rubber fruit bursts and its flow runs; the other fruits stay put', () => {
    const e = fx({ fruit: 'rubber' });
    expect(e.poses.get('rubber-capsule')).toBe('capsule-burst');
    expect(e.poses.get('rubber-seeds')).toBe('capsule-burst');
    expect(e.poses.has('angsana-pod')).toBe(false);
    expect(e.flows.get('seed-burst')?.visible).toBe(true);
    expect(e.flows.get('wind-drift')?.visible).toBe(false);
    const w = fx({ fruit: 'angsana' });
    expect(w.poses.get('angsana-pod')).toBe('angsana-front');
    expect(w.flows.get('wind-drift')?.visible).toBe(true);
  });
  it('the tint level the stage draws (and pnpm shoot checks)', () => {
    expect(tintLevel(1, { full: 1, curve: 'linear', max: 0.85 })).toBe(0.85);
    expect(tintLevel(0, { full: 1, curve: 'linear', max: 0.85 })).toBe(0);
    expect(tintLevel(0.25, { full: 1, curve: 'sqrt', max: 1 })).toBe(0.5);
    expect(tintLevel(3, { full: 2, curve: 'linear', max: 0.55 })).toBe(0.55);
    expect(tintLevel(NaN, { full: 1, curve: 'linear', max: 0.55 })).toBe(0);
  });
  it('the day marker and the half flag move along the strip', () => {
    const e = fx({ temp: 14, 'count-day': 5 });
    expect(e.offset.get('day-marker')![0]).toBeCloseTo(0.05, 9);
    expect(e.offset.get('half-flag')![0]).toBeCloseTo(0.094, 9);
  });
});

describe('validation (§4.3, §4.6)', () => {
  it('controls that do not exist or are the wrong kind', () => {
    expect(issues(edit((s) => { s.seeds.dispersal!.fruit = 'nope'; }))).toContain('seeds.dispersal.fruit: unknown control "nope"');
    expect(issues(edit((s) => { s.seeds.timing!.temp = 'cup'; }))).toContain('seeds.timing.temp: "cup" is a choice control, not a step');
    expect(issues(edit((s) => { s.seeds.cups!.cup = 'temp'; }))).toContain('seeds.cups.cup: "temp" is a step control, not a choice');
    expect(issues(edit((s) => { s.seeds.cups!.against = 'cup'; }))).toContain('seeds.cups.against: `against` is the cup it is compared with: a control of its own, not `cup`');
  });
  it('fruit options that do not match the fruits', () => {
    const extra = issues(edit((s) => { s.seeds.dispersal!.fruits['durian'] = { method: 'animals', feature: 'eaten' }; }));
    expect(extra).toContain('seeds.dispersal.fruits.durian: "durian" is not an option of "fruit"');
    const missing = issues(edit((s) => { delete s.seeds.dispersal!.fruits['fig']; }));
    expect(missing).toContain('seeds.dispersal.fruits: option "fig" of "fruit" has no entry in `fruits`');
  });
  it('a method or feature that is not one of the four', () => {
    expect(() => simSchema.parse(edit((s) => { s.seeds.dispersal!.fruits['fig']!.method = 'birds'; }))).toThrow();
    expect(() => simSchema.parse(edit((s) => { s.seeds.dispersal!.fruits['fig']!.feature = 'hooks'; }))).toThrow();
  });
  it('medians missing a temperature, with one too many, or not positive', () => {
    expect(issues(edit((s) => { delete s.seeds.timing!.medians['17']; }))).toContain('seeds.timing.medians: no median for 17 (a value of "temp")');
    expect(issues(edit((s) => { s.seeds.timing!.medians['25'] = 3; }))).toContain('seeds.timing.medians.25: "25" is not a value of "temp" (write the number as the control does: 14, 17, 20)');
    expect(issues(edit((s) => { s.seeds.timing!.medians['14.0'] = 9.4; delete s.seeds.timing!.medians['14']; }))).toEqual(
      expect.arrayContaining(['seeds.timing.medians: no median for 14 (a value of "temp")', 'seeds.timing.medians.14.0: "14.0" is not a value of "temp" (write the number as the control does: 14, 17, 20)']),
    );
    expect(() => simSchema.parse(edit((s) => { s.seeds.timing!.medians['14'] = 0; }))).toThrow();
    expect(() => simSchema.parse(edit((s) => { s.seeds.timing!.medians['14'] = -1; }))).toThrow();
  });
  it('a day control with negative days', () => {
    const bad = edit((s) => { s.controls[2]!['values'] = [-1, 0, 1]; s.controls[2]!['default'] = 0; });
    expect(issues(bad)).toContain('seeds.timing.day: "count-day" counts days: values must be 0 or more');
  });
  it('`after` that is not a value of `day`', () => {
    expect(issues(edit((s) => { s.seeds.cups!.after = 5; }))).toContain('seeds.cups.after: 5 is not a value of "day" (0, 7): the cups are checked on a day the reader can step to');
  });
  it('a cup whose place is not in `places`, cups that do not match the choices, two cups set up alike', () => {
    expect(issues(edit((s) => { s.seeds.cups!.set['b']!.place = 'garden'; }))).toContain('seeds.cups.set.b.place: unknown place "garden" (windowsill, cupboard, fridge)');
    const extra = issues(edit((s) => { s.seeds.cups!.set['f'] = { water: true, air: false, place: 'cupboard' }; }));
    expect(extra).toContain('seeds.cups.set.f: "f" is not an option of "cup"');
    expect(extra).toContain('seeds.cups.set.f: "f" is not an option of "against"');
    const twin = issues(edit((s) => { s.seeds.cups!.set['b'] = { water: true, air: true, place: 'windowsill' }; }));
    expect(twin).toContain('seeds.cups.set.b: "b" is set up like "a" (water, air, warmth, light): give each cup its own conditions');
  });
  it('a `changed` state the cups never give (air, with cup C dropped)', () => {
    const bad = edit((s) => {
      const o = s.outputs.find((x) => x['id'] === 'changed')!;
      (o['states'] as Record<string, unknown>)['air'] = { en: 'Only the air', zh: '只改了空气' };
    });
    expect(issues(bad)).toContain('outputs.7.states.air: "cups:changed" is never "air" (same-cup, water, light, more-than-one, warmth)');
  });
  it('a state the model can give that has no label', () => {
    const bad = edit((s) => {
      const o = s.outputs.find((x) => x['id'] === 'seedlings')!;
      delete (o['states'] as Record<string, unknown>)['pale'];
    });
    expect(issues(bad)).toContain('outputs.8.states: "cups:seedlings" can be "pale": give it a label');
  });
  it('an output `from` that is not a quantity of the model (or its sub-model is missing)', () => {
    expect(issues(edit((s) => { s.outputs.push({ id: 'colour', from: 'cups:colour', label: { en: 'x', zh: 'x' } }); }))).toContain('outputs.18.from: the seeds model has no quantity "cups:colour"');
    expect(issues(edit((s) => { s.outputs.push({ id: 'grown-c', from: 'cup:c:grown', label: { en: 'x', zh: 'x' } }); }))).toContain('outputs.18.from: the seeds model has no quantity "cup:c:grown"');
    const noTiming = edit((s) => { delete s.seeds.timing; });
    expect(issues(noTiming)).toContain('outputs.2.from: the seeds model has no quantity "timing:median"');
    expect(issues(edit((s) => { s.outputs[0]!['kind'] = 'number'; delete s.outputs[0]!['states']; }))).toContain('outputs.0.kind: "dispersal:method" is a state, not a number');
  });
  it('a seeds sim with no seeds data, or with none of the three sub-models', () => {
    expect(issues(edit((s) => { delete (s as { seeds?: unknown }).seeds; s.outputs = [s.outputs[4]!]; s.bind = []; }))).toContain('seeds: a seeds sim needs `seeds`');
    const empty = edit((s) => { s.seeds = {}; s.outputs = [s.outputs[4]!]; s.bind = []; });
    expect(issues(empty)).toContain('seeds: give at least one of `dispersal`, `timing`, `cups`');
  });
  it('a chapter card that names the model\'s controls and outputs passes', () => {
    const t3 = { set: { day: 0 }, try: { vary: 'cup', also: ['against', 'day'], keep: [{ en: 'Five beans', zh: '五粒' }], observe: ['cup-result', 'changed', 'seedlings', 'day-now'], record: true, predict: { prompt: { en: 'p', zh: 'p' }, start: { cup: 'd', against: 'a', day: 0 }, change: { day: 7 }, observe: 'cup-result', options: [{ id: 'yes', label: { en: 'y', zh: 'y' }, means: 'germinated' }, { id: 'no', label: { en: 'n', zh: 'n' }, means: 'not-germinated' }] } } };
    expect(chapterSimIssues('', t3 as never, sim)).toEqual([]);
    const t2 = { try: { vary: 'temp', also: ['count-day'], observe: ['half-day', 'half'], record: { chart: { y: 'half-day' } } } };
    expect(chapterSimIssues('', t2 as never, sim)).toEqual([]);
  });
});
