/** The dynamic-resolution stepper and its return to full resolution when the stage comes to rest. */
import { describe, expect, it } from 'vitest';
import { governorFrame, governorIdle, governorState, RESOLUTION_STEPS } from '../../src/engines/space-scene/stages/model3d/probes';

function run(st: ReturnType<typeof governorState>, t0: number, dt: number, n: number): { t: number; steps: number[] } {
  const steps: number[] = [];
  let t = t0;
  for (let i = 0; i < n; i++) {
    t += dt;
    const s = governorFrame(st, t);
    if (s !== null) steps.push(s);
  }
  return { t, steps };
}

describe('resolution governor', () => {
  it('steps down after six slow back-to-back frames, at most to the last step', () => {
    const st = governorState();
    governorFrame(st, 1000);
    const a = run(st, 1000, 60, 6);
    expect(a.steps).toEqual([1]);
    const b = run(st, a.t, 60, 12);
    expect(b.steps).toEqual([2]);
    expect(run(st, b.t, 60, 30).steps).toEqual([]);
    expect(RESOLUTION_STEPS[st.step]).toBe(0.5);
  });

  it('idle gaps of the demand frameloop are not slow frames', () => {
    const st = governorState();
    governorFrame(st, 1000);
    expect(run(st, 1000, 2000, 10).steps).toEqual([]);
    expect(st.step).toBe(0);
  });

  it('occasional redraws of a still stage (about once a second) are not slow frames', () => {
    const st = governorState();
    governorFrame(st, 1000);
    expect(run(st, 1000, 400, 20).steps).toEqual([]);
    expect(run(st, 9000, 1000, 20).steps).toEqual([]);
    expect(st.step).toBe(0);
  });

  it('a still stage returns to full resolution when its frames stop', () => {
    const st = governorState();
    governorFrame(st, 1000);
    run(st, 1000, 60, 6);
    expect(st.step).toBe(1);
    expect(governorIdle(st)).toBe(true);
    expect(st.step).toBe(0);
    expect(governorIdle(st)).toBe(false);
  });

  it('a long fast run steps back up while animating', () => {
    const st = governorState();
    governorFrame(st, 1000);
    const a = run(st, 1000, 60, 6);
    expect(run(st, a.t, 16, 240).steps).toEqual([0]);
  });
});
