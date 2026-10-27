import { describe, expect, it } from 'vitest';
import { sensesMotionBlocked, stepRunTime } from '../../src/engines/space-scene/lib/run-clock';
import { targetExplodeAmount } from '../../src/engines/space-scene/lib/explode';
import { createClock, stepClock } from '../../src/engines/space-scene/lib/sim/hz';
describe('senses transmission stops while separated', () => {
  it.each([['exploded', 0], ['assembled', .001], ['xray', 1]])('immediately stops both shared and paced clocks for %s / %s', (view, explode) => {
    const runtime = { elapsed: 7, phase: 3, energy: 1 };
    const paced = createClock(2); paced.cycles = .375;
    const blocked = sensesMotionBlocked('senses', view as string, explode as number);
    expect(blocked).toBe(true);
    for (let i = 0; i < 30; i++) { stepRunTime(runtime, true, 1 / 60, blocked); stepClock(paced, 2, 1 / 60, runtime.energy, 1, true); }
    expect(runtime).toEqual({ elapsed: 7, phase: 3, energy: 0 });
    expect(paced.cycles).toBe(.375); expect(paced.advance).toBe(0);
    stepRunTime(runtime, true, 1 / 60, false);
    expect(runtime.phase).toBeGreaterThan(3);
    expect(runtime.elapsed).toBeGreaterThan(7);
  });
  it('resumes after E exit although the remembered slider remains .55', () => {
    const remembered = .55, runtime = {elapsed: 7, phase: 3, energy: 1};
    stepRunTime(runtime, true, .1, sensesMotionBlocked('senses', 'exploded', targetExplodeAmount('exploded', remembered)));
    expect(runtime.energy).toBe(0);
    // Exit easing remains blocked until the displayed separation actually reaches zero.
    stepRunTime(runtime, true, .1, sensesMotionBlocked('senses', 'assembled', .01));
    expect(runtime.phase).toBe(3);
    const displayed = targetExplodeAmount('assembled', remembered);
    expect(displayed).toBe(0);
    stepRunTime(runtime, true, .1, sensesMotionBlocked('senses', 'assembled', displayed));
    expect(runtime.phase).toBeGreaterThan(3);
  });
  it('keeps other simulations and assembled senses running under the existing ease rule', () => {
    for (const kind of [undefined, 'table', 'light', 'energy']) expect(sensesMotionBlocked(kind, 'exploded', 1)).toBe(false);
    expect(sensesMotionBlocked('senses', 'assembled', 0)).toBe(false);
    const runtime = { elapsed: 0, phase: 0, energy: 0 };
    stepRunTime(runtime, true, .1);
    expect(runtime.elapsed).toBe(.1); expect(runtime.energy).toBeCloseTo(1 - Math.exp(-.5), 12); expect(runtime.phase).toBeCloseTo(.1 * runtime.energy, 12);
    stepRunTime(runtime, false, .1); expect(runtime.energy).toBeGreaterThan(0);
  });
});
