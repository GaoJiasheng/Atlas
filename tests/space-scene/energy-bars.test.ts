/**
 * Energy bars (docs/31 E-EN6, §4.8): the bars read the timeline's channels
 * — at any moment potential + kinetic + heat + sound = 100 (± 0.5), potential
 * 100 at the start, the end state equal to the run's last values, the lost
 * part split into heat and sound by `lostSplit`; a run with no channels (a
 * toy not wound up) shows no bars.
 */
import { describe, expect, it } from 'vitest';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { energyBarValues } from '../../src/engines/space-scene/lib/sim/bars';
import { endValue, type Timeline } from '../../src/engines/space-scene/lib/sim/timeline';
import type { SimOverlay, SimValues } from '../../src/engines/space-scene/sim-schema';
import { energySim } from './fixtures/energy-block';

type Bars = Extract<SimOverlay, { kind: 'energy-bars' }>;
const overlays = energySim.overlays.filter((o): o is Bars => o.kind === 'energy-bars');
const timeline = (id: string, set: SimValues = {}) => evaluateSim(energySim, resolveSimValues(energySim, set))[id] as Timeline;

describe('energyBarValues', () => {
  it.each(overlays.map((o) => [o.timeline, o] as const))('%s: the bars add up to 100 all through the run, potential 100 at the start', (id, o) => {
    const tl = timeline(id, { winds: 4, drop: 75, surface: 'rubber' });
    const start = energyBarValues(tl, o, 0)!;
    expect(start.potential).toBeCloseTo(100, 6);
    for (let i = 0; i <= 40; i++) {
      const v = energyBarValues(tl, o, (tl.duration * i) / 40)!;
      expect(v.potential + v.kinetic + v.lost).toBeCloseTo(100, 6);
      expect(Math.abs(v.potential + v.kinetic + v.heat + v.sound - 100)).toBeLessThan(0.5);
      for (const x of [v.potential, v.kinetic, v.lost, v.heat, v.sound]) expect(x).toBeGreaterThanOrEqual(0);
    }
  });
  it('the end state is the run\'s last values (no t: the end)', () => {
    const o = overlays[0]!;
    const tl = timeline('bounce-run');
    const v = energyBarValues(tl, o)!;
    expect(v.potential).toBeCloseTo(endValue(tl, 'pe'), 9);
    expect(v.kinetic).toBeCloseTo(0, 9);
    expect(v.lost).toBeCloseTo(45, 9);
    // lostSplit default 0.9 / 0.1: 40.5 % heat, 4.5 % sound.
    expect([v.heat, v.sound].map((x) => Number(x.toFixed(6)))).toEqual([40.5, 4.5]);
  });
  it('the swing ends with 78 % potential and nothing moving', () => {
    const v = energyBarValues(timeline('swing-run'), overlays[1]!)!;
    expect(Number(v.potential.toFixed(2))).toBe(78.37);
    expect(v.kinetic).toBeCloseTo(0, 9);
  });
  it('a toy not wound up shows no bars; the overlay is also switched off by its `when`', () => {
    expect(energyBarValues(timeline('toy-run', { winds: 0 }), overlays[2]!)).toBeNull();
    expect(overlays[2]!.when).toEqual({ control: 'winds', is: { ne: 0 } });
    expect(energyBarValues(undefined, overlays[0]!)).toBeNull();
  });
  it('a run with other channels draws nothing', () => {
    const tl = { ...timeline('bounce-run'), channels: { y: timeline('bounce-run').channels.y! } };
    expect(energyBarValues(tl, overlays[0]!)).toBeNull();
  });
});
