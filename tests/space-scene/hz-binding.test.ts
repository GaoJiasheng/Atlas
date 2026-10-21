/**
 * The `hz` binding and number `intensity` (docs/40 §4.3 E-HL2, §4.8): value →
 * Hz (clamped to 0–4), a clock whose phase is continuous across a change of
 * pace and eases to the new frequency in about 0.5 s, a sequence's time
 * scaled to cycles a second, several animations on one output in one phase,
 * reduced motion (and deep links) jumping straight to the bound frequency,
 * and one pace for every path of a flow from a number output.
 */
import { describe, expect, it } from 'vitest';
import { animationHz, MAX_ANIMATION_HZ, simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { clockPhase, clockTime, createClock, cycleLength, freeCycles, nativeHz, stepClock } from '../../src/engines/space-scene/lib/sim/hz';
import { animationScale } from '../../src/engines/space-scene/lib/animation';
import { sampleSequence } from '../../src/engines/space-scene/lib/pose';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import type { PartAnimation } from '../../src/engines/space-scene/schema';

const pulse = { id: 'heartbeat', target: 'heart', kind: 'pulse', scale: 1.04, hz: 1.5, whenRun: true } as unknown as PartAnimation;
const breathe = {
  id: 'breathe',
  target: 'lung-right',
  kind: 'sequence',
  loop: true,
  whenRun: true,
  keys: [{ t: 0 }, { t: 1.4, scale: [1.05, 1.07, 1.06] }, { t: 3 }],
} as unknown as PartAnimation;

/** Run a clock for `seconds` in 60 fps frames toward `hz`. */
function run(c: ReturnType<typeof createClock>, hz: number, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds - 1e-9; t += dt) stepClock(c, hz, dt, 1, 1, false);
  return c;
}

describe('value → Hz', () => {
  it('(value − origin) × per', () => {
    expect(animationHz(90, { per: 1 / 60, origin: 0 })).toBeCloseTo(1.5, 9);
    expect(animationHz(165, { per: 1 / 60, origin: 0 })).toBeCloseTo(2.75, 9);
    expect(animationHz(40, { per: 1 / 60, origin: 0 })).toBeCloseTo(0.6667, 4);
    expect(animationHz(30, { per: 0.1, origin: 10 })).toBeCloseTo(2, 9);
  });
  it('clamped to 0 … 4 Hz, NaN still', () => {
    expect(animationHz(1000, { per: 1, origin: 0 })).toBe(MAX_ANIMATION_HZ);
    expect(animationHz(-5, { per: 1, origin: 0 })).toBe(0);
    expect(animationHz(NaN, { per: 1, origin: 0 })).toBe(0);
  });
  it('a binding sets the hz of every animation it names', () => {
    const sim: SimData = simSchema.parse({
      kind: 'table',
      controls: [{ id: 'a', kind: 'choice', default: 'x', label: { en: 'A', zh: 'A' }, options: [{ id: 'x', label: { en: 'X', zh: 'X' } }, { id: 'y', label: { en: 'Y', zh: 'Y' } }] }],
      outputs: [{ id: 'beats', label: { en: 'B', zh: 'B' }, unit: '/min' }],
      bind: [{ output: 'beats', animation: ['one', 'two'], hz: { per: 1 / 60 } }],
      table: { experiments: { e: { keys: ['a'], rows: [{ when: { a: 'x' }, set: { beats: 90 }, source: ['S1'] }, { when: { a: 'y' }, set: { beats: 120 }, source: ['S1'] }] } } },
    });
    const fx = simEffects(sim, { a: 'y' }, { beats: 120 });
    expect(fx.animations.get('one')?.hz).toBeCloseTo(2, 9);
    expect(fx.animations.get('two')?.hz).toBeCloseTo(2, 9);
    expect(fx.animations.get('one')?.enabled).toBe(true);
  });
});

describe('the clock', () => {
  it('advances hz cycles a second at a steady pace', () => {
    const c = run(createClock(1.5), 1.5, 2);
    expect(c.cycles).toBeCloseTo(3, 6);
    expect(c.hz).toBe(1.5);
  });
  it('a change of pace keeps the phase continuous (no jump in one frame)', () => {
    const c = run(createClock(1.5), 1.5, 1.3);
    let prev = c.cycles;
    for (let i = 0; i < 120; i++) {
      stepClock(c, 2.75, 1 / 60, 1, 1, false);
      // Each frame moves at most the faster frequency's share.
      expect(c.cycles - prev).toBeLessThanOrEqual(2.75 / 60 + 1e-9);
      expect(c.cycles - prev).toBeGreaterThanOrEqual(1.5 / 60 - 1e-9);
      prev = c.cycles;
    }
  });
  it('eases to the new frequency in about 0.5 s', () => {
    const c = run(createClock(1.5), 2.75, 0.25);
    expect(c.hz).toBeGreaterThan(1.5);
    expect(c.hz).toBeLessThan(2.75);
    run(c, 2.75, 0.75);
    expect(c.hz).toBe(2.75);
    const d = run(createClock(1.5), 2.75, 0.5);
    expect(Math.abs(d.hz - 2.75) / 1.25).toBeLessThan(0.06);
  });
  it('stops with the run and keeps its phase', () => {
    const c = run(createClock(1), 1, 0.3);
    const at = c.cycles;
    stepClock(c, 1, 1 / 60, 0, 1, false);
    expect(c.cycles).toBe(at);
    expect(c.seconds).toBe(0);
  });
  it('switching off eases `on` down and counts no seconds once off', () => {
    const c = createClock(1);
    for (let i = 0; i < 90; i++) stepClock(c, 1, 1 / 60, 1, 0, false);
    expect(c.on).toBe(0);
    expect(c.seconds).toBe(0);
  });
  it('reduced motion and deep links (snap) jump to the bound frequency and on-ness', () => {
    const c = createClock(1.5);
    stepClock(c, 2.75, 1 / 60, 1, 0, true);
    expect(c.hz).toBe(2.75);
    expect(c.on).toBe(0);
  });
  it('two animations on one output stay in one phase', () => {
    const a = createClock(0.33);
    const b = createClock(0.33);
    for (const hz of [0.33, 0.43, 0.67, 0.43]) {
      run(a, hz, 0.7);
      run(b, hz, 0.7);
    }
    expect(clockPhase(a.cycles)).toBe(clockPhase(b.cycles));
  });
});

describe('the animation’s own time', () => {
  it('a pulse plays at the clock’s phase (cycles ÷ its own hz)', () => {
    expect(nativeHz(pulse)).toBe(1.5);
    const t = clockTime(pulse, 2.25);
    // A quarter into a cycle: half of the way to the peak scale, as the pulse sampler reads it.
    expect(animationScale(pulse, t)).toBeCloseTo(animationScale(pulse, 0.25 / 1.5), 9);
  });
  it('a sequence scales its time line: cycles × cycle length', () => {
    expect(cycleLength((breathe as Extract<PartAnimation, { kind: 'sequence' }>).keys)).toBe(3);
    expect(nativeHz(breathe)).toBeCloseTo(1 / 3, 9);
    // Half a cycle at any pace is the middle of the clip.
    expect(clockTime(breathe, 0.5)).toBeCloseTo(1.5, 9);
    const keys = (breathe as Extract<PartAnimation, { kind: 'sequence' }>).keys;
    const mid = sampleSequence(keys, clockTime(breathe, 10.5), true);
    expect(mid).toEqual(sampleSequence(keys, 1.5, true));
  });
  it('an unpaced animation reads the shared clock exactly as before', () => {
    expect(freeCycles(pulse, 2)).toBe(3);
    expect(clockTime(pulse, freeCycles(pulse, 2))).toBeCloseTo(2, 12);
  });
});

describe('number intensity', () => {
  const sim: SimData = simSchema.parse({
    kind: 'table',
    controls: [{ id: 'a', kind: 'choice', default: 'x', label: { en: 'A', zh: 'A' }, options: [{ id: 'x', label: { en: 'X', zh: 'X' } }, { id: 'y', label: { en: 'Y', zh: 'Y' } }] }],
    outputs: [{ id: 'pace', label: { en: 'P', zh: 'P' } }, { id: 'need', label: { en: 'N', zh: 'N' } }],
    bind: [
      { output: 'pace', flow: ['blood', 'food'], intensity: { full: 1 } },
      { output: 'need', flow: 'gas', intensity: { full: 1, mode: 'density' } },
    ],
    table: { experiments: { e: { keys: ['a'], rows: [{ when: { a: 'x' }, set: { pace: 1, need: 0.25 }, source: ['S1'] }, { when: { a: 'y' }, set: { pace: 3, need: 0.004 }, source: ['S1'] }] } } },
  });
  it('one pace for every path of every flow named', () => {
    const fx = simEffects(sim, { a: 'x' }, { pace: 1.83, need: 0.25 });
    expect(fx.flows.get('blood')?.uniform).toBeCloseTo(1.83, 9);
    expect(fx.flows.get('food')?.uniform).toBeCloseTo(1.83, 9);
    expect(fx.flows.get('blood')?.paths).toBeNull();
    expect(fx.flows.get('gas')).toMatchObject({ uniform: 0.25, mode: 'density' });
  });
  it('clamped at ±2 (speed) and 1 (density); below 1 % none', () => {
    const fx = simEffects(sim, { a: 'y' }, { pace: 3, need: 0.004 });
    expect(fx.flows.get('blood')?.uniform).toBe(2);
    expect(fx.flows.get('gas')?.uniform).toBe(0);
    const fy = simEffects(sim, { a: 'y' }, { pace: 0.5, need: 4 });
    expect(fy.flows.get('gas')?.uniform).toBe(1);
  });
});
