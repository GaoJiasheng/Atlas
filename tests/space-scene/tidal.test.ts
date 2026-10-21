/**
 * Tidal flows (docs/40 §4.4 E-HL3, §4.8): the phase gives the sign of the
 * velocity (toward the lungs in the first half of a breath, back in the
 * second), one cycle nets zero, a change of pace does not jump, the particles
 * stop with the animation, and both ends fade (a tidal flow is never `ends:
 * open`, so its material keeps the end fades); a `flat` flow keeps its colour
 * on the dark plate.
 */
import { describe, expect, it } from 'vitest';
import { tidalAmplitude, tidalStep, tidalVelocity } from '../../src/engines/space-scene/lib/sim/tidal';
import { clockPhase, createClock, stepClock } from '../../src/engines/space-scene/lib/sim/hz';
import { flowSchema } from '../../src/engines/space-scene/schema';
import { bakeFlowPath } from '../../src/engines/space-scene/lib/flow-curve';
import { createFlowMaterial, styleFlowMaterial } from '../../src/engines/space-scene/stages/model3d/flowMaterial';
import { AdditiveBlending, NormalBlending } from 'three';

/** Breathe `cycles` breaths at `hz` in 60 fps frames; return the displacement (scene units) of a particle. */
function breathe(hz: number, seconds: number, speed = 0.12, pace = 1, clock = createClock(hz), dt = 1 / 60): { x: number; max: number; min: number; clock: ReturnType<typeof createClock> } {
  let x = 0;
  let max = 0;
  let min = 0;
  for (let t = 0; t < seconds - 1e-9; t += dt) {
    const start = clockPhase(clock.cycles);
    stepClock(clock, hz, dt, 1, 1, false);
    x += tidalStep(start, clock.advance, clock.seconds, speed, pace);
    max = Math.max(max, x);
    min = Math.min(min, x);
  }
  return { x, max, min, clock };
}

describe('velocity from the phase', () => {
  it('forward in the first half, back in the second', () => {
    for (const p of [0.05, 0.25, 0.45]) expect(tidalVelocity(p)).toBeGreaterThan(0);
    for (const p of [0.55, 0.75, 0.95]) expect(tidalVelocity(p)).toBeLessThan(0);
    expect(tidalVelocity(0)).toBeCloseTo(0, 12);
    expect(tidalVelocity(0.5)).toBeCloseTo(0, 12);
  });
  it('one breath nets zero and the particle goes forward first', () => {
    const r = breathe(1 / 3, 3);
    expect(Math.abs(r.x)).toBeLessThan(1e-4);
    expect(r.max).toBeGreaterThan(0);
    expect(r.min).toBeGreaterThan(-1e-6);
  });
  it('travels speed × pace ÷ (π × hz) in a breath', () => {
    const r = breathe(1 / 3, 1.5);
    expect(r.max).toBeCloseTo(tidalAmplitude(0.12, 1, 1 / 3), 3);
    // The heart-and-lungs design: pace = breaths ÷ 20 and hz = breaths ÷ 60 keep the same reach at every activity.
    for (const b of [20, 26, 40]) expect(tidalAmplitude(0.12, b / 20, b / 60)).toBeCloseTo(tidalAmplitude(0.12, 1, 1 / 3), 9);
  });
  it('a change of pace does not jump', () => {
    const r = breathe(1 / 3, 1.1);
    let x = r.x;
    const c = r.clock;
    for (let i = 0; i < 90; i++) {
      const start = clockPhase(c.cycles);
      stepClock(c, 2 / 3, 1 / 60, 1, 1, false);
      const d = tidalStep(start, c.advance, c.seconds, 0.12, 2);
      // Never more than speed × pace in one frame (the fastest the particle can move).
      expect(Math.abs(d)).toBeLessThanOrEqual((0.12 * 2) / 60 + 1e-9);
      x += d;
    }
    expect(Number.isFinite(x)).toBe(true);
  });
  it('stops with the animation (no seconds played) and with the run', () => {
    expect(tidalStep(0.25, 0, 0, 0.12, 1)).toBe(0);
    const c = createClock(0.33);
    stepClock(c, 0.33, 1 / 60, 0, 1, false);
    expect(tidalStep(0.25, c.advance, c.seconds, 0.12, 1)).toBe(0);
  });
});

describe('flat flows (the two reds on the dark plate)', () => {
  it('a flat flow keeps its colour in cinema: normal blending, no white core', () => {
    const m = createFlowMaterial([bakeFlowPath([[0, 0, 0], [0, 1, 0]])], false);
    styleFlowMaterial(m, true, 1);
    expect(m.blending).toBe(AdditiveBlending);
    expect(m.uniforms.uCore.value).toBeGreaterThan(0);
    styleFlowMaterial(m, true, 1, true);
    expect(m.blending).toBe(NormalBlending);
    expect(m.uniforms.uCore.value).toBe(0);
    // Paper is the same either way.
    styleFlowMaterial(m, false, 1, true);
    expect(m.blending).toBe(NormalBlending);
    m.dispose();
  });
});

describe('ends', () => {
  it('a tidal flow fades at both ends (never open)', () => {
    const f = flowSchema.parse({ id: 'air-right', group: 'air', speed: 0.12, color: 'token:air', path: [[0, 0, 0], [0, 0.5, 0], [0, 1, 0]], tidal: { sync: 'breathe' } });
    expect(f.ends).toBe('fade');
    const m = createFlowMaterial([bakeFlowPath(f.path)], f.ends === 'open');
    expect(m.uniforms.uOpen.value).toBe(0);
    expect(m.uniforms.uClosed.value[0]).toBe(0);
    m.dispose();
    expect(flowSchema.safeParse({ ...f, ends: 'open' }).success).toBe(false);
  });
});
