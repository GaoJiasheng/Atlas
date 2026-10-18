/**
 * The forces model (docs/30 §4.2, F9): every SIM table of §2 (F-10, F-12,
 * F-14, F-15, F-16, F-20, F-21) at the shown decimals and 3 significant
 * figures, the orderings the chapters teach, the elastic limit, the runs'
 * end states against the numbers, determinism, and validation of the
 * `force` data, the new bindings and the chapter card fields.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { fallRun, pushEffect, solveForces, springExtension } from '../../src/engines/space-scene/lib/sim/force';
import { endValue, isTimeline, type Timeline } from '../../src/engines/space-scene/lib/sim/timeline';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { arrowLength, arrowValue, FORCE_COLORS, forcesOnShow } from '../../src/engines/space-scene/lib/sim/arrows';
import { chapterSimIssues, simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { forcesSim, FORCES_PARTS } from './fixtures/forces-bench';

const run = (set: SimValues) => evaluateSim(forcesSim, resolveSimValues(forcesSim, set)) as Record<string, number | string | Timeline>;
const n = (v: unknown) => v as number;
const tl = (v: unknown) => v as Timeline;
const shown = (x: number, d: number) => Number(x.toFixed(d));
const sig3 = (x: number) => Number(x.toPrecision(3));

describe('slide (F-10): pull to start and to keep moving, N', () => {
  const table: [string, number, number, number][] = [
    ['glass', 0, 0.5, 0.4],
    ['wood', 0, 1.0, 0.6],
    ['sandpaper', 0, 1.8, 1.4],
    ['glass', 200, 1.0, 0.8],
    ['wood', 200, 2.0, 1.2],
    ['sandpaper', 200, 3.5, 2.7],
    ['glass', 400, 1.5, 1.2],
    ['wood', 400, 2.9, 1.8],
    ['sandpaper', 400, 5.3, 4.1],
  ];
  it.each(table)('%s, +%i g → %s / %s N', (lane, load, start, move) => {
    const o = run({ lane, 'block-load': load });
    expect(shown(n(o['f-start']), 1)).toBe(start);
    expect(shown(n(o['f-move']), 1)).toBe(move);
  });
  it('μ m g at 3 significant figures (wood, 200 g block)', () => {
    expect(sig3(n(run({})['f-start']))).toBe(0.98);
    expect(sig3(n(run({})['f-move']))).toBe(0.588);
  });
  it('starting always takes more than keeping it moving; rougher and heavier take more', () => {
    for (const lane of ['glass', 'wood', 'sandpaper'])
      for (const load of [0, 200, 400]) {
        const o = run({ lane, 'block-load': load });
        expect(n(o['f-start'])).toBeGreaterThan(n(o['f-move']));
      }
    const lanes = ['glass', 'wood', 'sandpaper'].map((lane) => n(run({ lane })['f-start']));
    expect(lanes[0]).toBeLessThan(lanes[1]!);
    expect(lanes[1]).toBeLessThan(lanes[2]!);
    const loads = [0, 200, 400].map((load) => n(run({ 'block-load': load })['f-start']));
    expect(loads[0]).toBeLessThan(loads[1]!);
    expect(loads[1]).toBeLessThan(loads[2]!);
  });
  it('pull-run: the pull rises to f-start while the block holds, then falls to f-move as it slides', () => {
    const o = run({ lane: 'wood' });
    const r = tl(o['pull-run']);
    const at = (c: string, t: number) => endValue({ ...r, duration: t }, c);
    expect(at('x', 1.1)).toBe(0);
    expect(at('pull', 0.6)).toBeCloseTo(n(o['f-start']) / 2, 6);
    expect(at('friction', 0.6)).toBeCloseTo(at('pull', 0.6), 9);
    expect(at('pull', 1.2)).toBeCloseTo(n(o['f-start']), 6);
    expect(endValue(r, 'pull')).toBeCloseTo(n(o['f-move']), 6);
    expect(endValue(r, 'friction')).toBeCloseTo(n(o['f-move']), 6);
    expect(endValue(r, 'x')).toBeCloseTo(0.25, 9);
    expect(r.duration).toBeCloseTo(1.2 + 0.25 / 0.15, 9);
  });
});

describe('roll (F-12): distance on the runway, cm', () => {
  const table: [string, number, number][] = [
    ['glass', 3, 40],
    ['glass', 6, 80],
    ['glass', 9, 120],
    ['wood', 3, 27],
    ['wood', 6, 53],
    ['wood', 9, 80],
    ['carpet', 3, 10],
    ['carpet', 6, 19],
    ['carpet', 9, 29],
  ];
  it.each(table)('%s at %i cm → %i cm', (runway, h, d) => {
    expect(shown(n(run({ runway, 'ramp-height': h }).distance), 0)).toBe(d);
  });
  it('distance ∝ release height; smoother goes further; every default combination stays on the runway', () => {
    for (const runway of ['glass', 'wood', 'carpet']) {
      const d = [3, 6, 9].map((h) => n(run({ runway, 'ramp-height': h }).distance));
      expect(d[1]! / d[0]!).toBeCloseTo(2, 9);
      expect(d[2]! / d[0]!).toBeCloseTo(3, 9);
      for (const h of [3, 6, 9]) expect(solveForces(forcesSim.force!, resolveSimValues(forcesSim, { runway, 'ramp-height': h }))['run-end']).toBe('stops');
    }
    const s = ['glass', 'wood', 'carpet'].map((runway) => n(run({ runway }).distance));
    expect(s[0]).toBeGreaterThan(s[1]!);
    expect(s[1]).toBeGreaterThan(s[2]!);
  });
  it('run-time = v0 ÷ (c g), v0 = √(2 g h · 0.8)', () => {
    const v0 = Math.sqrt(2 * 9.8 * 0.06 * 0.8);
    expect(n(run({ runway: 'glass' })['run-time'])).toBeCloseTo(v0 / (0.06 * 9.8), 9);
  });
  it('car-run ends where the car stops: dx = distance, dy = 0; it starts up the ramp at the release height', () => {
    for (const runway of ['glass', 'wood', 'carpet'])
      for (const h of [3, 6, 9]) {
        const o = run({ runway, 'ramp-height': h });
        const r = tl(o['car-run']);
        expect(endValue(r, 'dx')).toBeCloseTo(n(o.distance) / 100, 9);
        expect(endValue(r, 'dy')).toBe(0);
        expect(endValue({ ...r, duration: 0 }, 'dy')).toBeCloseTo(h / 100, 9);
        expect(endValue(r, 'pitch')).toBe(0);
        // The wheels turn through the whole path (ramp + runway) ÷ radius.
        const ramp = h / 100 / Math.sin((14 * Math.PI) / 180);
        expect(endValue(r, 'spin')).toBeCloseTo(((ramp + n(o.distance) / 100) / 0.011) * (180 / Math.PI), 6);
      }
  });
  it('a car that would pass the end stops there (off-end)', () => {
    const sim = simSchema.parse({ ...forcesSim, force: { ...forcesSim.force, roll: { ...forcesSim.force!.roll!, rolling: { glass: 0.02, wood: 0.09, carpet: 0.25 } } } });
    const o = solveForces(sim.force!, resolveSimValues(sim, { runway: 'glass', 'ramp-height': 9 }));
    expect(o['run-end']).toBe('off-end');
    expect(o.distance).toBeCloseTo(125, 9);
    expect(endValue(o['car-run'] as Timeline, 'dx')).toBeCloseTo(1.25, 9);
  });
});

describe('fall (F-14): fall times, s', () => {
  const table: [string, number, number, number][] = [
    ['balls', 0.5, 0.32, 0.32],
    ['balls', 1.0, 0.45, 0.45],
    ['balls', 1.5, 0.55, 0.55],
    ['papers', 0.5, 0.32, 0.54],
    ['papers', 1.0, 0.46, 1.0],
    ['papers', 1.5, 0.57, 1.47],
  ];
  it.each(table)('%s from %s m → %s / %s s', (pair, h, l, r) => {
    const o = run({ pair, 'drop-height': h });
    expect(shown(n(o['t-left']), 2)).toBe(l);
    expect(shown(n(o['t-right']), 2)).toBe(r);
  });
  it('the light and the heavy ball land together (|Δt| < 0.005 s); the crumpled sheet beats the flat one', () => {
    for (const h of [0.5, 1, 1.5]) {
      const b = run({ pair: 'balls', 'drop-height': h });
      expect(Math.abs(n(b['t-left']) - n(b['t-right']))).toBeLessThan(0.005);
      expect(b.landing).toBe('together');
      const p = run({ pair: 'papers', 'drop-height': h });
      expect(n(p['t-left'])).toBeLessThan(n(p['t-right']));
      expect(p.landing).toBe('left-first');
      expect(run({ pair: 'ball-paper', 'drop-height': h }).landing).toBe('left-first');
    }
  });
  it('without air every object falls in √(2h ÷ g); the flat sheet nears 1.1 m/s', () => {
    expect(fallRun({ m: 1, cd: 1, area: 1e-12 }, 1, 9.8, 1.21).time).toBeCloseTo(Math.sqrt(2 / 9.8), 3);
    const flat = fallRun({ m: 0.005, cd: 1.12, area: 6.237e-2 }, 1.5, 9.8, 1.21);
    const [[ta, ya], [tb, yb]] = flat.samples.slice(-4, -2) as [[number, number], [number, number]];
    expect((yb - ya) / (tb - ta)).toBeCloseTo(Math.sqrt(9.8 / ((0.5 * 1.21 * 1.12 * 6.237e-2) / 0.005)), 1);
  });
  it('drop-run: one sampled channel per object of the pair, ≤ 160 samples, every object on the sand at the end, slowed 4 times', () => {
    for (const h of [0.5, 1, 1.5]) {
      const o = run({ pair: 'papers', 'drop-height': h });
      const r = tl(o['drop-run']);
      expect(r.slow).toBe(4);
      expect(Object.keys(r.channels).sort()).toEqual(['crumpled', 'flat', 'flat-sway']);
      for (const id of ['crumpled', 'flat']) {
        const c = r.channels[id]!;
        expect('samples' in c && c.samples.length).toBeLessThanOrEqual(160);
        expect(endValue(r, id)).toBeCloseTo(h, 9);
      }
      expect(endValue(r, 'flat-sway')).toBe(0);
      expect(r.duration).toBeCloseTo(Math.max(n(o['t-left']), n(o['t-right'])), 9);
    }
  });
});

describe('weight (F-16), N', () => {
  it('balls and paper on the weighing balance', () => {
    expect(shown(n(run({ weigh: 'small-ball' }).weight), 1)).toBe(0.3);
    expect(shown(n(run({ weigh: 'large-ball' }).weight), 1)).toBe(2.2);
    expect(run({ weigh: 'large-ball' })['weigh-note']).toBe('reads');
    const paper = run({ weigh: 'paper' });
    expect(shown(n(paper.weight), 1)).toBe(0);
    expect(paper['weigh-note']).toBe('too-light');
    expect(run({})['weigh-note']).toBe('none');
  });
  it('slotted masses: 50 g 0.5 N … 300 g 2.9 N, 400 g 3.9 N', () => {
    const w = (g: number) => shown(n(run({ 'spring-load': g })['load-weight']), 1);
    expect([50, 100, 150, 200, 250, 300, 400].map(w)).toEqual([0.5, 1.0, 1.5, 2.0, 2.5, 2.9, 3.9]);
  });
});

describe('spring (F-15): extension and the elastic limit, cm', () => {
  it('1.0 cm per 50 g up to 300 g, then 7.3 and 9.2 cm; length = 8 cm + extension', () => {
    const e = (g: number) => shown(n(run({ 'spring-load': g }).extension), 1);
    expect([0, 50, 100, 150, 200, 250, 300, 350, 400].map(e)).toEqual([0, 1, 2, 3, 4, 5, 6, 7.3, 9.2]);
    expect(n(run({ 'spring-load': 400 })['spring-length'])).toBeCloseTo(17.2, 9);
  });
  it('linear inside the limit, faster past it (each 50 g adds more than the one before)', () => {
    const s = forcesSim.force!.spring!;
    const steps = [0, 50, 100, 150, 200, 250, 300].map((g) => springExtension(s, g + 50, false) - springExtension(s, g, false));
    for (const d of steps.slice(0, 6)) expect(d).toBeCloseTo(1, 9);
    expect(steps[6]!).toBeGreaterThan(1);
    expect(springExtension(s, 400, false) - springExtension(s, 350, false)).toBeGreaterThan(steps[6]!);
  });
  it('taken off: back to its length up to 300 g, 0.4 and 1.2 cm longer after 350 and 400 g', () => {
    for (const g of [0, 50, 300]) {
      const o = run({ 'spring-load': g, unload: true });
      expect(n(o.extension)).toBe(0);
      expect(o.returns).toBe('returns');
      expect(n(o['load-weight'])).toBe(0);
    }
    expect(n(run({ 'spring-load': 350, unload: true }).extension)).toBe(0.4);
    expect(n(run({ 'spring-load': 400, unload: true }).extension)).toBe(1.2);
    expect(run({ 'spring-load': 400, unload: true }).returns).toBe('stays-longer');
    expect(run({ 'spring-load': 400 }).returns).toBe('loaded');
  });
});

describe('brake (F-20): stop time and turns', () => {
  it('none ≈ 80 s and 80 turns, light 1.8 / 1.8, firm 0.6 / 0.6', () => {
    const o = (squeeze: string) => run({ squeeze });
    expect(shown(n(o('none')['stop-time']), 0)).toBe(80);
    expect(shown(n(o('none').turns), 0)).toBe(80);
    expect(shown(n(o('light')['stop-time']), 1)).toBe(1.8);
    expect(shown(n(o('light').turns), 1)).toBe(1.8);
    expect(shown(n(o('firm')['stop-time']), 1)).toBe(0.6);
    expect(shown(n(o('firm').turns), 1)).toBe(0.6);
    expect(sig3(n(o('light')['stop-time']))).toBe(1.82);
  });
  it('a firmer squeeze stops it sooner and in fewer turns; the run ends having turned `turns` turns', () => {
    const t = ['none', 'light', 'firm'].map((squeeze) => run({ squeeze }));
    for (let i = 1; i < 3; i++) {
      expect(n(t[i]!['stop-time'])).toBeLessThan(n(t[i - 1]!['stop-time']));
      expect(n(t[i]!.turns)).toBeLessThan(n(t[i - 1]!.turns));
    }
    for (const o of t) {
      const r = tl(o['wheel-run']);
      expect(endValue(r, 'spin')).toBeCloseTo(n(o.turns) * 360, 6);
      expect(r.duration).toBeCloseTo(n(o['stop-time']), 9);
    }
    expect(endValue(tl(t[2]!['wheel-run']), 'brake')).toBeCloseTo(2 * 0.6 * 3, 9);
  });
});

describe('push (F-21): what a push does', () => {
  it('speed after the push and its effect', () => {
    const table: [SimValues, string, number][] = [
      [{ push: 'behind' }, 'speeds-up', 0.9],
      [{ push: 'front' }, 'slows-down', 0.3],
      [{ push: 'front-firm' }, 'stops', 0],
      [{ push: 'side' }, 'turns', 0.67],
      [{ push: 'behind', 'car-start': 'rest' }, 'starts', 0.3],
    ];
    for (const [set, effect, after] of table) {
      const o = run(set);
      expect(o.effect).toBe(effect);
      expect(shown(n(o['speed-after']), 2)).toBe(after);
    }
    expect(n(run({}) ['speed-before'])).toBe(0.6);
    expect(n(run({ 'car-start': 'rest' })['speed-before'])).toBe(0);
  });
  it('the side push turns the car 27°', () => {
    const r = tl(run({ push: 'side' })['push-run']);
    expect(Math.round(endValue(r, 'heading'))).toBe(27);
  });
  it('the classification: none for a tiny change, turns over 10°', () => {
    expect(pushEffect([0.6, 0], [0.61, 0])).toBe('none');
    expect(pushEffect([0.6, 0], [0.6, 0.05])).toBe('none');
    expect(pushEffect([0.6, 0], [0.6, 0.2])).toBe('turns');
    expect(pushEffect([0, 0], [0, 0])).toBe('none');
  });
  it('after the push the car slows at 0.06 g on glass and stops: its x at the end = v1² ÷ 2a', () => {
    const r = tl(run({ push: 'behind' })['push-run']);
    expect(endValue(r, 'x')).toBeCloseTo((0.9 * 0.9) / (2 * 0.06 * 9.8), 9);
    expect(endValue({ ...r, duration: 0 }, 'x')).toBeCloseTo(-0.25, 9);
    expect(endValue(tl(run({ push: 'front-firm' })['push-run']), 'x')).toBeCloseTo(0, 9);
  });
  it('the magnet push moves the car instead of the rod', () => {
    const o = run({ 'magnet-push': true, 'car-start': 'rest' });
    expect(o.effect).toBe('starts');
    expect(tl(o['push-run']).duration).toBe(0);
    expect(tl(o['magnet-run']).duration).toBeGreaterThan(0);
    expect(tl(run({})['magnet-run']).duration).toBe(0);
  });
});

describe('determinism', () => {
  it('the same values give the same outputs, twice, to the last bit', () => {
    const set = { pair: 'papers', 'drop-height': 1.5, lane: 'sandpaper', squeeze: 'light', 'spring-load': 350, push: 'side' };
    expect(JSON.stringify(run(set))).toBe(JSON.stringify(run(set)));
  });
  it('a timeline key changes only with what that run depends on', () => {
    const a = run({});
    const b = run({ lane: 'glass' });
    expect(tl(a['car-run']).key).toBe(tl(b['car-run']).key);
    expect(tl(a['pull-run']).key).not.toBe(tl(b['pull-run']).key);
    expect(isTimeline(a['wheel-run'])).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const ctx = {
  parts: new Set([...FORCES_PARTS, 'spring', 'hanger', 'masses', 'car', 'wheels', 'block']),
  flows: new Map(),
  animations: new Map(),
  poses: new Set<string>(),
  countable: new Set(['masses']),
  primitives: new Set([...FORCES_PARTS, 'spring', 'hanger', 'masses', 'car', 'wheels', 'block']),
  coils: new Map([['spring', 1]]),
  repeated: new Set(['masses', 'wheels']),
  withExtra: new Set<string>(),
  groups: new Set(['forces']),
};
const issuesOf = (patch: Partial<SimData>) => simIssues(simSchema.parse({ ...forcesSim, ...patch }), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);

describe('force validation', () => {
  it('the fixture is clean', () => {
    expect(simIssues(forcesSim, ctx)).toEqual([]);
  });
  it('μ moving above μ starting, unknown controls, uncovered options, a limit that is not a load', () => {
    const f = forcesSim.force!;
    expect(issuesOf({ force: { ...f, slide: { ...f.slide!, surfaces: { ...f.slide!.surfaces, glass: [0.2, 0.25] } } } }).join('\n')).toMatch(/μ moving/);
    expect(issuesOf({ force: { ...f, roll: { ...f.roll!, height: 'nope' } } }).join('\n')).toMatch(/unknown control "nope"/);
    expect(issuesOf({ force: { ...f, brake: { ...f.brake!, force: { none: 0, light: 1 } } } }).join('\n')).toMatch(/option "firm"/);
    expect(issuesOf({ force: { ...f, spring: { ...f.spring!, limit: 275 } } }).join('\n')).toMatch(/elastic limit 275/);
    expect(issuesOf({ force: { ...f, spring: { ...f.spring!, set: { '350': 0.4 } } } }).join('\n')).toMatch(/after 400 g/);
    expect(issuesOf({ force: { ...f, fall: { ...f.fall!, pairs: { ...f.fall!.pairs, balls: ['small-ball', 'stone'] } } } }).join('\n')).toMatch(/unknown object "stone"/);
  });
  it('an output of a sub-model the data leaves out, a state without a label', () => {
    const { brake: _drop, ...rest } = forcesSim.force!;
    expect(issuesOf({ force: rest as SimData['force'] }).join('\n')).toMatch(/needs the force model's `brake` data/);
    const outputs = forcesSim.outputs.map((o) => (o.id === 'landing' ? { ...o, states: { together: { en: 't', zh: 't' } } } : o));
    expect(issuesOf({ outputs }).join('\n')).toMatch(/"landing" can be "left-first"/);
  });
  it('the car at the defaults must stop on the runway', () => {
    const f = forcesSim.force!;
    expect(issuesOf({ force: { ...f, roll: { ...f.roll!, rolling: { glass: 0.06, wood: 0.01, carpet: 0.25 } } } }).join('\n')).toMatch(/runs off the end/);
  });
  it('play, stretch and count bindings', () => {
    const bind = (b: unknown[]) => issuesOf({ bind: b as SimData['bind'] }).join('\n');
    expect(bind([{ output: 'car-run', part: 'car', play: { channel: 'dx', axis: [1, 0, 0] } }])).toBe('');
    expect(bind([{ output: 'car-run', part: 'car', play: { channel: 'nope', axis: [1, 0, 0] } }])).toMatch(/no channel "nope"/);
    expect(bind([{ output: 'car-run', part: 'car', play: { channel: 'dx' } }])).toMatch(/give `axis`/);
    expect(bind([{ output: 'distance', part: 'car', play: { channel: 'dx', axis: [1, 0, 0] } }])).toMatch(/play needs a timeline/);
    expect(bind([{ output: 'car-run', part: 'car', play: { channel: 'spin', turn: [0, 0, 1], each: true } }])).toMatch(/one copy/);
    expect(bind([{ output: 'car-run', part: 'wheels', play: { channel: 'spin', turn: [0, 0, 1], each: true } }])).toBe('');
    expect(bind([{ output: 'car-run', part: 'car', visible: true }])).toMatch(/is a timeline/);
    expect(bind([{ output: 'extension', part: 'spring', stretch: { per: 0.01, settle: { period: 0.7, damping: 0.15 } } }])).toBe('');
    expect(bind([{ output: 'extension', part: 'block', stretch: { per: 0.01 } }])).toMatch(/exactly one `coil`/);
    expect(bind([{ output: 'pull-run', part: 'spring', stretch: { per: 0.01, channel: 'pull' } }])).toBe('');
    expect(bind([{ output: 'pull-run', part: 'spring', stretch: { per: 0.01 } }])).toMatch(/stretch needs a number/);
    expect(bind([{ control: 'spring-load', part: 'masses', count: { per: 50, minus: 50 } }])).toBe('');
  });
  it('force arrows: channels, numbers, and no friction arrow on a wheel', () => {
    const arrows = (a: unknown[], bind: unknown[] = []) =>
      issuesOf({ overlays: [{ kind: 'force-vectors', arrows: a, group: 'forces' }] as SimData['overlays'], bind: bind as SimData['bind'] }).join('\n');
    expect(arrows([{ part: 'block', force: 'friction', dir: [-1, 0, 0], value: { output: 'pull-run', channel: 'friction' } }])).toBe('');
    expect(arrows([{ part: 'hanger', force: 'gravity', dir: [0, -1, 0], value: { output: 'load-weight' } }])).toBe('');
    expect(arrows([{ part: 'block', force: 'friction', dir: [-1, 0, 0], value: { output: 'pull-run' } }])).toMatch(/needs `channel`/);
    expect(arrows([{ part: 'block', force: 'push', dir: [1, 0, 0], value: { output: 'pull-run', channel: 'shove' } }])).toMatch(/no channel "shove"/);
    expect(arrows([{ part: 'wheels', force: 'friction', dir: [-1, 0, 0], value: 1 }], [{ output: 'car-run', part: 'wheels', play: { channel: 'spin', turn: [0, 0, 1], each: true } }])).toMatch(
      /frictional force on rolling things/,
    );
  });
});

describe('chapter cards: replay, chart, predict a state', () => {
  const card = (t: unknown) => chapterSimIssues('', { try: t as never }, forcesSim);
  it('accepts the docs/30 card fields', () => {
    expect(card({ vary: 'pair', observe: ['t-left', 't-right'], record: { chart: true }, replay: true })).toEqual([]);
    expect(card({ vary: 'spring-load', observe: ['extension'], record: { chart: { y: 'extension' } }, replay: ['drop-run'] })).toEqual([]);
    expect(
      card({
        vary: 'push',
        observe: ['effect', 'speed-after'],
        predict: {
          prompt: { en: 'p', zh: 'p' },
          change: { push: 'side' },
          observe: 'effect',
          options: [
            { id: 'a', label: { en: 'a', zh: 'a' }, means: 'turns' },
            { id: 'b', label: { en: 'b', zh: 'b' }, means: 'speeds-up' },
          ],
        },
      }),
    ).toEqual([]);
  });
  it('rejects a timeline observed, a chart of a state, mixed units, a replay of a number, a state means on a number', () => {
    expect(card({ vary: 'pair', observe: ['drop-run'] }).join('\n')).toMatch(/is a timeline/);
    expect(card({ vary: 'pair', observe: ['landing'], record: { chart: { y: 'landing' } } }).join('\n')).toMatch(/not a number/);
    expect(card({ vary: 'pair', observe: ['t-left'], record: { chart: { y: ['t-left', 'weight'] } } }).join('\n')).toMatch(/one unit/);
    expect(card({ vary: 'pair', observe: ['t-left'], replay: ['t-left'] }).join('\n')).toMatch(/not a timeline/);
    expect(
      card({
        vary: 'push',
        observe: ['speed-after'],
        predict: { prompt: { en: 'p', zh: 'p' }, change: { push: 'side' }, observe: 'speed-after', options: [{ id: 'a', label: { en: 'a', zh: 'a' }, means: 'turns' }, { id: 'b', label: { en: 'b', zh: 'b' }, means: 'more' }] },
      }).join('\n'),
    ).toMatch(/"turns" is not an outcome/);
  });
});

describe('bindings: count minus, offset settle, stretch, play', () => {
  const sim = simSchema.parse({
    ...forcesSim,
    bind: [
      { control: 'spring-load', part: 'masses', count: { per: 50, minus: 50 } },
      { output: 'extension', part: 'hanger', offset: { axis: [0, -1, 0], per: 0.01, settle: { period: 0.7, damping: 0.15 } } },
      { output: 'extension', part: 'spring', stretch: { per: 0.01, settle: { period: 0.7, damping: 0.15 } } },
      { output: 'car-run', part: 'wheels', play: { channel: 'spin', turn: [0, 0, 2], each: true } },
      { output: 'pull-run', part: 'spring', stretch: { per: 0.01, channel: 'pull', anchor: 'bottom' } },
    ],
  });
  it('turns the bindings into stage effects', () => {
    const values = resolveSimValues(sim, { 'spring-load': 350 });
    const e = simEffects(sim, values, evaluateSim(sim, values));
    expect(e.count.get('masses')).toBe(6);
    expect(e.offset.get('hanger')![1]).toBeCloseTo(-0.073, 9);
    expect(e.offsetSettle.get('hanger')).toEqual({ period: 0.7, damping: 0.15 });
    // The later stretch binding (a channel) wins for the same part.
    expect(e.stretch.get('spring')).toMatchObject({ output: 'pull-run', channel: 'pull', anchor: 'bottom', per: 0.01 });
    expect(e.play.get('wheels')).toEqual([{ output: 'car-run', channel: 'spin', turn: [0, 0, 1], per: 1, each: true }]);
    const at0 = simEffects(sim, resolveSimValues(sim, {}), evaluateSim(sim, resolveSimValues(sim, {})));
    expect(at0.count.get('masses')).toBe(0);
  });
});

describe('force arrows', () => {
  const sim = simSchema.parse({
    ...forcesSim,
    overlays: [
      {
        kind: 'force-vectors',
        group: 'forces',
        arrows: [
          { part: 'block', force: 'push', dir: [1, 0, 0], value: { output: 'pull-run', channel: 'pull' } },
          { part: 'block', force: 'friction', dir: [-1, 0, 0], value: { output: 'pull-run', channel: 'friction' } },
          { part: 'hanger', force: 'gravity', dir: [0, -1, 0], value: { output: 'load-weight' } },
          { part: 'hanger', force: 'elastic', dir: [0, 1, 0], value: { output: 'load-weight' } },
          { part: 'car', force: 'magnetic', dir: [1, 0, 0], value: 0.5, when: { control: 'magnet-push' } },
        ],
      },
    ],
  });
  const values = (set: SimValues) => resolveSimValues(sim, set);
  it('length ∝ newtons (1.0 N twice 0.5 N), capped at max; a channel read at a time, else at the end', () => {
    expect(arrowLength(1, 0.03, 0.25)).toBeCloseTo(2 * arrowLength(0.5, 0.03, 0.25), 12);
    expect(arrowLength(20, 0.03, 0.25)).toBe(0.25);
    const out = evaluateSim(sim, values({ lane: 'wood' }));
    const pull = sim.overlays[0]!.kind === 'force-vectors' ? sim.overlays[0]!.arrows[0]! : null;
    expect(arrowValue(pull!, out, 0.6)).toBeCloseTo(0.49, 6);
    expect(arrowValue(pull!, out)).toBeCloseTo(0.588, 6);
    expect(FORCE_COLORS.magnetic).toBe('token:pole-n');
  });
  it('the KEY lists the kinds on show: their part shown, `when` true, the layer on, a value at some point of the run', () => {
    const on = (set: SimValues, shown: (p: string) => boolean = () => true, layer = true) => {
      const v = values(set);
      return forcesOnShow(sim, v, evaluateSim(sim, v), shown, () => layer);
    };
    expect(on({})).toEqual(['friction', 'push']);
    expect(on({ 'spring-load': 100 })).toEqual(['gravity', 'friction', 'elastic', 'push']);
    expect(on({ 'spring-load': 100, 'magnet-push': true }, (p) => p !== 'block')).toEqual(['gravity', 'elastic', 'magnetic']);
    expect(on({ 'spring-load': 100 }, () => true, false)).toEqual([]);
  });
});
