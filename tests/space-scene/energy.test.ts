/**
 * The energy model (docs/31 §4.2, §4.8): every §2.4 table (A–H) at the shown
 * decimals, with the fact audit's corrections (the dynamo levels off at its
 * 3 W rating; the LED starts from a quarter of the filament lamp's energy so
 * both give the same light); every node of every chain gives out what it
 * takes in (rounded and exact, every combination of the controls); chains
 * switched off are 0; `paths` and `links` keys match the data; the three
 * timelines (fall time √(2h ÷ g), rebound top r h, the swing's AGM period
 * and 0.97⁸ left, the toy stopping at its run time, potential + kinetic +
 * lost = 100 at every moment); URL round trip; validation of the `energy`
 * data, the density intensity and the energy-bars overlay.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, encodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import {
  bounceRun,
  chainFlow,
  currentChain,
  dynamoAt,
  ENERGY_FORMS,
  pendulumPeriod,
  shareTables,
  solveEnergy,
  swingAmplitude,
  toyRun,
} from '../../src/engines/space-scene/lib/sim/energy';
import { channelValue, endValue, type Timeline } from '../../src/engines/space-scene/lib/sim/timeline';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { CHAINS, ENERGY_FLOWS, ENERGY_PARTS, energySim } from './fixtures/energy-block';

const run = (set: SimValues) => evaluateSim(energySim, resolveSimValues(energySim, set)) as Record<string, number | string | Timeline | Record<string, number>>;
const n = (v: unknown) => v as number;
const tl = (v: unknown) => v as Timeline;
const vec = (v: unknown) => v as Record<string, number>;
const shown = (x: number, d: number) => Number(x.toFixed(d));
const e = energySim.energy!;

const ctx = {
  parts: new Set(ENERGY_PARTS),
  flows: new Map(Object.entries(ENERGY_FLOWS).map(([id, paths]) => [id, { paths: paths.map((p) => ({ id: p })), own: true }])),
  animations: new Map(),
  poses: new Set<string>(),
  countable: new Set<string>(),
};

describe('A · solar panels (sky)', () => {
  it.each([
    ['clear', 4.43, 1],
    ['average', 3.15, 0.8],
    ['overcast', 0.74, 0.35],
    ['night', 0, 0],
  ] as const)('%s → %s kW, sun glow %s', (sky, kw, glow) => {
    const o = run({ chain: 'solar', sky });
    expect(shown(n(o['panel-power']), 2)).toBe(kw);
    expect(n(o['sun-glow'])).toBe(glow);
  });
  it('light 100 → electrical 21, heat 75, reflected light 4; inverter 20 + 1; lift motor 16 + 3 + 1', () => {
    const ground = vec(run({ chain: 'solar' }).links);
    expect(ground).toMatchObject({ 's-light': 100, 's-el': 21, 's-heat': 75, 's-reflect': 4, 'i-grid': 20, 'i-heat': 1, 'i-motor': 0, 'm-car': 0 });
    const top = vec(run({ chain: 'solar', 'lift-at': 'top' }).links);
    expect(top).toMatchObject({ 'i-motor': 20, 'i-grid': 0, 'm-car': 16, 'm-heat': 3, 'm-sound': 1 });
    const o = run({ chain: 'solar' });
    expect([n(o.useful), n(o.heat), n(o.sound)]).toEqual([21, 75, 0]);
  });
  it('night: the whole chain is 0 and the readings do not apply', () => {
    const o = run({ chain: 'solar', sky: 'night' });
    expect(Object.values(vec(o.links)).every((v) => v === 0)).toBe(true);
    expect(Number.isNaN(n(o.useful))).toBe(true);
    expect(Object.values(vec(o.paths)).every((v) => v === 0)).toBe(true);
  });
  it('panel power reads — outside the solar and whole chains', () => {
    expect(Number.isNaN(n(run({ chain: 'bounce' })['panel-power']))).toBe(true);
    expect(n(run({ chain: 'whole' })['panel-power'])).toBeGreaterThan(0);
  });
});

describe('B · appliances at home (% of the electrical energy into each)', () => {
  it.each([
    ['fan', 60, 38, 2],
    ['lamp', 40, 60, 0],
    ['speaker', 1, 99, 0],
    ['kettle', 85, 14, 1],
  ] as const)('%s → useful %i, heat %i, sound %i', (appliance, useful, heat, sound) => {
    const o = run({ chain: 'home', appliance });
    expect([n(o.useful), n(o.heat), n(o.sound)]).toEqual([useful, heat, sound]);
  });
  it('the lamp glows and the water warms only while chosen (in:<node>)', () => {
    expect(n(run({ chain: 'home', appliance: 'lamp' })['lamp-glow'])).toBe(100);
    expect(n(run({ chain: 'home', appliance: 'fan' })['lamp-glow'])).toBe(0);
    expect(n(run({ chain: 'home', appliance: 'kettle' })['water-warm'])).toBe(100);
  });
  it('the kettle (F-18, audit F-18-calc): 1 L from 30 °C to 100 °C takes 293.02 kJ, about 157 s at 2,200 W × 85 %', () => {
    const q = 1.0 * 4186 * 70;
    expect(q).toBe(293020);
    expect(Math.round(q / (2200 * 0.85))).toBe(157);
  });
});

describe('C · the dropped ball (drop × surface)', () => {
  const table: [number, number, number, number, number, number][] = [
    [25, 2.21, 14, 10, 6, 1],
    [50, 3.13, 28, 20, 13, 3],
    [75, 3.83, 41, 30, 19, 4],
    [100, 4.43, 55, 40, 25, 5],
  ];
  it.each(table)('%i cm → %s m/s; bounces %i / %i / %i / %i cm', (drop, speed, ...heights) => {
    (['tile', 'rubber', 'carpet', 'sand'] as const).forEach((surface, i) => {
      const o = run({ chain: 'bounce', drop, surface });
      expect(shown(n(o['impact-speed']), 2)).toBe(speed);
      expect(shown(n(o['bounce-height']), 0)).toBe(heights[i]);
    });
  });
  it.each([
    ['tile', 55, 45],
    ['rubber', 40, 60],
    ['carpet', 25, 75],
    ['sand', 5, 95],
  ] as const)('%s keeps %i %% and turns %i %% into heat and sound', (surface, kept, lost) => {
    const o = run({ chain: 'bounce', surface });
    expect([shown(n(o.kept), 0), shown(n(o.lost), 0)]).toEqual([kept, lost]);
    expect(n(o.useful)).toBe(kept);
    expect(n(o.heat) + n(o.sound)).toBe(lost);
  });
  it('the run: lands at √(2h ÷ g), tops out at r h (bottom of the ball), bars 55 / 0 / 45 at the end, slowed 2 times', () => {
    const r = tl(run({ chain: 'bounce' })['bounce-run']);
    const t1 = Math.sqrt(2 / 9.8);
    expect(r.slow).toBe(2);
    expect(channelValue(r, 'y', t1)).toBeCloseTo(0, 9);
    expect(endValue(r, 'y')).toBeCloseTo(0.55, 9);
    expect(r.duration).toBeCloseTo(t1 + Math.sqrt(2 * 0.55 / 9.8), 9);
    expect([endValue(r, 'pe'), endValue(r, 'ke'), endValue(r, 'lost')].map((x) => shown(x, 6))).toEqual([55, 0, 45]);
    expect(channelValue(r, 'pe', 0)).toBe(100);
  });
  it.each([25, 50, 75, 100])('potential + kinetic + lost = 100 all through a %i cm drop', (drop) => {
    for (const surface of ['tile', 'sand']) {
      const r = tl(run({ drop, surface })['bounce-run']);
      for (let i = 0; i <= 50; i++) {
        const t = (r.duration * i) / 50;
        expect(channelValue(r, 'pe', t) + channelValue(r, 'ke', t) + channelValue(r, 'lost', t)).toBeCloseTo(100, 9);
        expect(channelValue(r, 'pe', t)).toBeGreaterThanOrEqual(-1e-9);
        expect(channelValue(r, 'ke', t)).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });
  it('a different drop or floor is a new run (key); bounceRun of 0 cm is still', () => {
    expect(tl(run({ drop: 50 })['bounce-run']).key).not.toBe(tl(run({ drop: 100 })['bounce-run']).key);
    expect(tl(run({ surface: 'sand' })['bounce-run']).key).not.toBe(tl(run({})['bounce-run']).key);
    expect(bounceRun(9.8, 0, 0.5, 1, 'k').duration).toBe(0);
  });
});

describe('D · the swing (2.0 m, let go at 35°, 3 % per half-swing, 8 half-swings)', () => {
  it('the period is 2.906 s (AGM, audit F-24), 2.4 % longer than the small-angle 2.838 s', () => {
    const T = pendulumPeriod(2, 9.8, 35);
    expect(shown(T, 3)).toBe(2.906);
    expect(shown(2 * Math.PI * Math.sqrt(2 / 9.8), 3)).toBe(2.838);
    expect(shown((T / (2 * Math.PI * Math.sqrt(2 / 9.8)) - 1) * 100, 1)).toBe(2.4);
  });
  it('the top is 0.36 m above the bottom, the lowest point 2.66 m/s', () => {
    const h = 2 * (1 - Math.cos((35 * Math.PI) / 180));
    expect(shown(h, 2)).toBe(0.36);
    expect(shown(Math.sqrt(2 * 9.8 * h), 2)).toBe(2.66);
  });
  it('after 8 half-swings 0.97⁸ = 78.37 % is left, all potential, paused at a turning point (audit SIM-D-bars)', () => {
    const r = tl(run({ chain: 'swing' })['swing-run']);
    expect(shown(endValue(r, 'pe'), 2)).toBe(78.37);
    expect(shown(endValue(r, 'ke'), 6)).toBe(0);
    expect(shown(endValue(r, 'lost'), 2)).toBe(21.63);
    expect(Math.abs(endValue(r, 'angle'))).toBeCloseTo(swingAmplitude(35, Math.pow(0.97, 8)), 6);
    expect(r.duration).toBeGreaterThan(11.4);
    expect(r.duration).toBeLessThan(11.7);
    const o = run({ chain: 'swing' });
    expect([shown(n(o.useful), 0), shown(n(o.heat) + n(o.sound), 0)]).toEqual([78, 22]);
  });
  it('starts at 35° with all potential; every sample adds up to 100; the swing gets lower each time', () => {
    const r = tl(run({})['swing-run']);
    expect(channelValue(r, 'angle', 0)).toBeCloseTo(35, 9);
    expect(channelValue(r, 'pe', 0)).toBeCloseTo(100, 9);
    const c = r.channels.angle!;
    expect('samples' in c && c.samples.length <= 256).toBe(true);
    for (const name of ['pe', 'ke', 'lost']) expect('samples' in r.channels[name]!).toBe(true);
    const pe = (r.channels.pe as { samples: [number, number][] }).samples;
    const ke = (r.channels.ke as { samples: [number, number][] }).samples;
    const lost = (r.channels.lost as { samples: [number, number][] }).samples;
    pe.forEach(([, p], i) => {
      expect(p + ke[i]![1] + lost[i]![1]).toBeCloseTo(100, 9);
      expect(ke[i]![1]).toBeGreaterThanOrEqual(0);
    });
    // The turning points: |angle| shrinks half-swing after half-swing.
    const tops = (c as { samples: [number, number][] }).samples.filter(([, a], i, xs) => i === 0 || i === xs.length - 1 || (Math.abs(a) >= Math.abs(xs[i - 1]![1]) && Math.abs(a) >= Math.abs(xs[i + 1]![1])));
    for (let i = 1; i < tops.length; i++) expect(Math.abs(tops[i]![1])).toBeLessThan(Math.abs(tops[i - 1]![1]));
  });
});

describe('E · the wind-up toy', () => {
  it.each([
    [0, 0],
    [2, 3],
    [4, 6],
    [6, 9],
    [8, 12],
  ])('%i winds → runs %i s', (winds, s) => {
    const o = run({ chain: 'windup', winds });
    expect(n(o['run-time'])).toBe(s);
    expect(tl(o['toy-run']).duration).toBe(s);
  });
  it('wound: potential 100 at the start; stopped: 0 / 0 / 100; potential only falls, kinetic ≤ 8, the sum is always 100 (audit SIM-E-bars)', () => {
    for (const winds of [2, 4, 8]) {
      const r = tl(run({ winds })['toy-run']);
      expect([channelValue(r, 'pe', 0), channelValue(r, 'ke', 0), channelValue(r, 'lost', 0)]).toEqual([100, 0, 0]);
      expect([endValue(r, 'pe'), endValue(r, 'ke'), endValue(r, 'lost')].map((x) => shown(x, 6) + 0)).toEqual([0, 0, 100]);
      let last = Infinity;
      for (let i = 0; i <= 200; i++) {
        const t = (r.duration * i) / 200;
        const pe = channelValue(r, 'pe', t);
        const ke = channelValue(r, 'ke', t);
        expect(pe + ke + channelValue(r, 'lost', t)).toBeCloseTo(100, 9);
        expect(pe).toBeLessThanOrEqual(last + 1e-9);
        expect(pe).toBeGreaterThanOrEqual(-1e-9);
        expect(ke).toBeLessThanOrEqual(8 + 1e-9);
        last = pe;
      }
      // The wheels slow to a stop: the car is still at the end; the key has turned back `winds` turns.
      expect(channelValue(r, 'x', r.duration) - channelValue(r, 'x', r.duration - 0.01)).toBeLessThan(1e-5);
      expect(endValue(r, 'key')).toBeCloseTo(-360 * winds, 6);
    }
  });
  it('0 winds: no run, no chain', () => {
    const o = run({ chain: 'windup', winds: 0 });
    expect(tl(o['toy-run']).duration).toBe(0);
    expect(Object.values(vec(o.links)).every((v) => v === 0)).toBe(true);
    expect(toyRun(e.windup!, 0, 'k').duration).toBe(0);
  });
});

describe('F · the torch', () => {
  it('on: stored 100 → electrical 95 + heat 5 → light 38 + heat 57; off: 0', () => {
    expect(vec(run({ chain: 'torch', 'torch-on': true }).links)).toEqual({ 'c-el': 95, 'c-heat': 5, 'c-light': 38, 'c-led-heat': 57 });
    expect(Object.values(vec(run({ chain: 'torch', 'torch-on': false }).links)).every((v) => v === 0)).toBe(true);
  });
});

describe('G · the bicycle dynamo (speed → lamp power, levelling off at the 3 W rating)', () => {
  const table: [number, number, number, number][] = [
    [0, 0, 0, 0],
    [5, 1.23, 41, 40],
    [10, 2.21, 74, 81],
    [15, 2.59, 86, 121],
    [20, 2.75, 92, 161],
    [25, 2.84, 95, 201],
  ];
  it.each(table)('%i km/h → %s W, brightness %i %%, wheel %i rpm', (speed, w, b, rpm) => {
    const o = run({ chain: 'dynamo', speed });
    expect(shown(n(o['lamp-power']), 2)).toBe(w);
    expect(shown(n(o.brightness), 0)).toBe(b);
    expect(shown(n(o['wheel-rpm']), 0)).toBe(rpm);
    expect(n(o['crank-rpm'])).toBeCloseTo(n(o['wheel-rpm']) * 0.37, 9);
  });
  it('faster is brighter, by less each step, never past 3 W (audit SIM-G-limit)', () => {
    const p = [0, 5, 10, 15, 20, 25].map((speed) => n(run({ chain: 'dynamo', speed })['lamp-power']));
    for (let i = 1; i < p.length; i++) expect(p[i]!).toBeGreaterThan(p[i - 1]!);
    for (let i = 2; i < p.length; i++) expect(p[i]! - p[i - 1]!).toBeLessThan(p[i - 1]! - p[i - 2]!);
    expect(dynamoAt(e.dynamo!, 1e6, true).power).toBeLessThanOrEqual(3);
    expect(dynamoAt(e.dynamo!, 1e6, true).power).toBeGreaterThan(2.999);
  });
  it('dynamo off: the lamp gets nothing; the kinetic energy only warms the bearings', () => {
    const o = run({ chain: 'dynamo', speed: 15, 'dynamo-on': false });
    expect(n(o['lamp-power'])).toBe(0);
    expect(vec(o.links)).toMatchObject({ 'd-in': 0, 'd-free': 100, 'd-el': 0 });
  });
  it('pedalled: kinetic 100 → electrical 30 + heat 65 + sound 5 → light 3 + heat 27; useful 3, heat 92, sound 5; standing still: 0', () => {
    const o = run({ chain: 'dynamo', speed: 15 });
    expect(vec(o.links)).toMatchObject({ 'd-in': 100, 'd-el': 30, 'd-heat': 65, 'd-sound': 5, 'l-light': 3, 'l-heat': 27 });
    expect([n(o.useful), n(o.heat), n(o.sound)]).toEqual([3, 92, 5]);
    expect(Object.values(vec(run({ chain: 'dynamo', speed: 0 }).links)).every((v) => v === 0)).toBe(true);
  });
});

describe('H · from natural gas to a lamp (same light: LED vs filament, audit SIM-H-same-light)', () => {
  it('filament: gas 100 → station 55 + 45 → grid 53 + 2 → light 5 + heat 48', () => {
    expect(vec(run({ chain: 'gas-to-home', 'lamp-type': 'filament' }).links)).toMatchObject({ 'g-burn': 100, 'g-el': 55, 'g-heat': 45, 'g-home': 53, 'g-cable': 2, 'g-fil-light': 5, 'g-fil-heat': 48 });
  });
  it('LED: the same light from a quarter of the gas (start 25 %)', () => {
    const led = run({ chain: 'gas-to-home', 'lamp-type': 'led' });
    const fil = run({ chain: 'gas-to-home', 'lamp-type': 'filament' });
    expect([n(led['same-light']), n(fil['same-light'])]).toEqual([25, 100]);
    expect(vec(led.links)['g-led-light']).toBe(vec(fil.links)['g-fil-light']);
    // % of what goes into each lamp: the LED turns 40 % into light, the filament lamp 10 % (rounded through the chain).
    expect([n(led.useful), n(fil.useful)].map((x) => shown(x, 0))).toEqual([38, 9]);
    expect(vec(led.links)).toMatchObject({ 'g-burn': 25, 'g-el': 14, 'g-heat': 11, 'g-home': 13, 'g-cable': 1, 'g-led-light': 5, 'g-led-heat': 8 });
  });
});

describe('chains: conservation, switching off, paths', () => {
  const combos = (): SimValues[] => {
    const out: SimValues[] = [];
    for (const chain of CHAINS)
      for (const sky of ['clear', 'night'])
        for (const lift of ['ground', 'top'])
          for (const appliance of ['fan', 'lamp', 'speaker', 'kettle'])
            for (const surface of ['tile', 'sand'])
              for (const winds of [0, 4])
                for (const torch of [false, true])
                  for (const speed of [0, 15])
                    for (const dyn of [false, true])
                      for (const lamp of ['led', 'filament'])
                        out.push({ chain, sky, 'lift-at': lift, appliance, surface, winds, 'torch-on': torch, speed, 'dynamo-on': dyn, 'lamp-type': lamp });
    return out;
  };
  it('every node gives out what it takes in (rounded: exactly; exact: to 1e-9) in every chain and combination', () => {
    for (const set of combos()) {
      const values = resolveSimValues(energySim, set);
      const f = currentChain(e, values);
      const chain = f.chain!;
      for (const node of chain.nodes) {
        const outs = chain.links.filter((l) => l.from === node.id);
        if (outs.length === 0) continue;
        const ins = chain.links.filter((l) => l.to === node.id);
        const rIn = ins.length === 0 ? Math.round(f.start) : ins.reduce((a, l) => a + f.links[l.id]!, 0);
        const xIn = ins.length === 0 ? f.start : ins.reduce((a, l) => a + f.exact[l.id]!, 0);
        expect(outs.reduce((a, l) => a + f.links[l.id]!, 0)).toBe(rIn);
        expect(outs.reduce((a, l) => a + f.exact[l.id]!, 0)).toBeCloseTo(xIn, 9);
        for (const l of outs) expect(Number.isInteger(f.links[l.id])).toBe(true);
      }
    }
  });
  it('links: one entry per link of the chain on show; paths: only the flow paths the data has, 0–1', () => {
    for (const chain of CHAINS) {
      const o = run({ chain, 'torch-on': true, winds: 4, speed: 10 });
      expect(Object.keys(vec(o.links)).sort()).toEqual(e.chains[chain]!.links.map((l) => l.id).sort());
      for (const [k, v] of Object.entries(vec(o.paths))) {
        const [flow, path] = k.split(':');
        expect(ENERGY_FLOWS[flow!]).toContain(path);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
  it('a path several links light takes the largest; the whole block mixes solar and home at 0.6', () => {
    const o = vec(run({ chain: 'whole' }).paths);
    expect(o['light-energy:sun-roof-a']).toBeCloseTo(0.6, 9);
    expect(o['heat-energy:panel-heat']).toBeCloseTo(0.75 * 0.6, 9);
    expect(o['kinetic-energy:fan-air']).toBeCloseTo(0.6 * 0.6, 9);
    expect(o['sound-energy:speaker-out-a']).toBe(0);
    const fil = vec(run({ chain: 'gas-to-home', 'lamp-type': 'filament' }).paths);
    expect(fil['electrical-energy:grid-db']).toBeCloseTo(0.53, 9);
  });
  it('out:<node>:<form> and in:<node> read the chain on show (0 elsewhere)', () => {
    const o = solveEnergy(e, resolveSimValues(energySim, { chain: 'home', appliance: 'fan' }), energySim.controls) as Record<string, number>;
    expect(o['out:fan:kinetic']).toBe(60);
    expect(o['in:fan']).toBe(100);
    expect(o['in:panel']).toBe(0);
    for (const form of ENERGY_FORMS) expect(typeof o[`out:air:${form}`]).toBe('number');
  });
  it('density bindings: each flow takes its own paths, the share of particles = value ÷ full', () => {
    const values = resolveSimValues(energySim, { chain: 'solar' });
    const fx = simEffects(energySim, values, evaluateSim(energySim, values)).flows;
    const light = fx.get('light-energy')!;
    expect(light.mode).toBe('density');
    expect(light.paths!['sun-roof-a']).toBe(1);
    expect(light.paths!['panel-reflect']).toBeCloseTo(0.04, 9);
    expect(fx.get('heat-energy')!.paths!['panel-heat']).toBeCloseTo(0.75, 9);
    expect(Object.keys(fx.get('electrical-energy')!.paths!).every((k) => !k.includes(':'))).toBe(true);
  });
  it('deterministic: the same values give the same outputs', () => {
    expect(JSON.stringify(run({ chain: 'swing' }))).toBe(JSON.stringify(run({ chain: 'swing' })));
  });
  it('URL round trip: sim=chain.bounce~drop.50~surface.sand', () => {
    const values = decodeSimParam('chain.bounce~drop.50~surface.sand');
    expect(values).toEqual({ chain: 'bounce', drop: 50, surface: 'sand' });
    expect(encodeSimParam(values)).toBe('chain.bounce~drop.50~surface.sand');
    expect(shown(n(run(values)['bounce-height']), 0)).toBe(3);
  });
  it('chainFlow of a missing chain is empty', () => {
    expect(chainFlow('none', null, {}, shareTables(e, {})).order).toEqual([]);
  });
});

describe('validate: energy data, density, energy bars', () => {
  const issuesOf = (patch: (s: SimData) => unknown) => {
    const raw = JSON.parse(JSON.stringify(energySim));
    patch(raw);
    return simIssues(simSchema.parse(raw), ctx).map((x) => `${x.path.join('.')}: ${x.message}`);
  };
  it('the block is clean', () => {
    expect(simIssues(energySim, ctx)).toEqual([]);
  });
  it('a node that does not give out what it takes in', () => {
    const out = issuesOf((s) => {
      s.energy!.shares.fan = { kinetic: 60, heat: 30, sound: 2 };
    });
    expect(out.some((x) => x.includes('energy.shares.fan') && x.includes('add up to 92'))).toBe(true);
    const leak = issuesOf((s) => {
      s.energy!.chains.home!.links = s.energy!.chains.home!.links.filter((l) => l.id !== 'h-kettle');
    });
    expect(leak.some((x) => x.includes('energy.chains.home.nodes.db') && x.includes('appliance = kettle'))).toBe(true);
  });
  it('unknown parts, nodes, tables, flow paths; potential with paths; a loop; a sink with outputs; a chain per option', () => {
    const out = issuesOf((s) => {
      const c = s.energy!.chains.torch!;
      c.nodes.push({ id: 'ghost', part: 'no-such-part' });
      c.links.push({ id: 'x1', from: 'led', to: 'nowhere', form: 'heat', share: 'led.heat' });
      c.links.push({ id: 'x2', from: 'led', to: 'air', form: 'heat', share: 'nope.heat' });
      c.links.push({ id: 'x3', from: 'cells', to: 'air', form: 'potential', share: 'led.heat', paths: ['heat-energy:torch'] });
      c.links.push({ id: 'x4', from: 'cells', to: 'air', form: 'heat', share: 'led.heat', paths: ['heat-energy:nowhere', 'no-flow:torch'] });
      c.links.push({ id: 'x5', from: 'air', to: 'cells', form: 'heat', share: 'in' });
      delete s.energy!.chains.swing;
    });
    for (const m of ['unknown part "no-such-part"', 'unknown node "nowhere"', 'unknown share table "nope"', 'potential energy is stored', 'has no path "nowhere"', 'unknown flow "no-flow"', 'loop', '"air" is a sink', 'option "swing" of "chain" has no chain'])
      expect(out.some((x) => x.includes(m))).toBe(true);
  });
  it('the dynamo may not level off above its rating; the toy\'s kinetic share must leave the spring falling', () => {
    expect(issuesOf((s) => (s.energy!.dynamo!.imax = 0.55)).some((x) => x.includes('3.63 W'))).toBe(true);
    expect(issuesOf((s) => (s.energy!.windup!.kinetic = 49)).some((x) => x.includes('energy.windup.kinetic'))).toBe(true);
  });
  it('outputs: unknown nodes and sub-models; chain-state labels every chain', () => {
    const out = issuesOf((s) => {
      s.outputs.push({ id: 'x-in', label: { en: 'x', zh: '' }, from: 'in:no-node', kind: 'number' });
      s.outputs[0]!.states = { whole: { en: 'w', zh: '' } };
      delete s.energy!.solar;
    });
    expect(out.some((x) => x.includes('no quantity "in:no-node"'))).toBe(true);
    expect(out.some((x) => x.includes('"chain-state" can be "solar"'))).toBe(true);
    expect(out.some((x) => x.includes("needs the energy model's `solar` data"))).toBe(true);
  });
  it('energy bars: a timeline output with the channels, a known part, heat + sound = 1', () => {
    const out = issuesOf((s) => {
      s.overlays.push({ kind: 'energy-bars', timeline: 'useful', near: 'no-part', height: 0.6, width: 0.04, gap: 0.02, bars: { potential: 'pe', kinetic: 'ke', lost: 'lost' }, lostSplit: { heat: 0.5, sound: 0.2 } });
      s.overlays[0] = { ...s.overlays[0]!, bars: { potential: 'pe', kinetic: 'speed', lost: 'lost' } } as SimData['overlays'][number];
    });
    expect(out.some((x) => x.includes('"useful" is a number, not a timeline'))).toBe(true);
    expect(out.some((x) => x.includes('unknown part "no-part"'))).toBe(true);
    expect(out.some((x) => x.includes('heat + sound must be 1'))).toBe(true);
    expect(out.some((x) => x.includes('has no channel "speed"'))).toBe(true);
  });
});
