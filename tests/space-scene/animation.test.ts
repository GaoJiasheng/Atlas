import { describe, expect, it } from 'vitest';
import { animationPose, animationsByPart } from '../../src/engines/space-scene/lib/animation';
import type { PartAnimation } from '../../src/engines/space-scene/schema';

const rotate: PartAnimation = { id: 'spin', target: 'fan', kind: 'rotate', axis: [0, 0, 2], rpm: 60, whenRun: true };
const oscillate: PartAnimation = {
  id: 'nod',
  target: 'cap',
  kind: 'oscillate',
  axis: [1, 0, 0],
  amplitude: 30,
  hz: 0.5,
  whenRun: true,
};
const pulse: PartAnimation = { id: 'beat', target: 'ball', kind: 'pulse', scale: 1.2, hz: 1, whenRun: true };

describe('animationPose', () => {
  it('rotate: rpm / 60 turns per second about the unit axis', () => {
    expect(animationPose(rotate, 0).angle).toBe(0);
    expect(animationPose(rotate, 0.25).angle).toBeCloseTo(Math.PI / 2);
    expect(animationPose(rotate, 1).angle).toBeCloseTo(2 * Math.PI);
    expect(animationPose(rotate, 1).axis).toEqual([0, 0, 1]);
    expect(animationPose(rotate, 1).scale).toBe(1);
  });

  it('oscillate: sinusoidal swing of `amplitude` degrees at `hz`', () => {
    expect(animationPose(oscillate, 0).angle).toBeCloseTo(0);
    expect(animationPose(oscillate, 0.5).angle).toBeCloseTo((30 * Math.PI) / 180); // quarter period
    expect(animationPose(oscillate, 1).angle).toBeCloseTo(0);
    expect(animationPose(oscillate, 1.5).angle).toBeCloseTo((-30 * Math.PI) / 180);
    // Energy scales the swing (spin-down when switched off).
    expect(animationPose(oscillate, 0.5, 0.5).angle).toBeCloseTo((15 * Math.PI) / 180);
  });

  it('pulse: breathes between 1 and `scale`', () => {
    expect(animationPose(pulse, 0).scale).toBeCloseTo(1);
    expect(animationPose(pulse, 0.5).scale).toBeCloseTo(1.2);
    expect(animationPose(pulse, 1).scale).toBeCloseTo(1);
    expect(animationPose(pulse, 0.25).scale).toBeCloseTo(1.1);
    expect(animationPose(pulse, 0.5, 0).scale).toBe(1);
    expect(animationPose(pulse, 0.5).angle).toBe(0);
  });

  it('groups animations by target part', () => {
    const map = animationsByPart([rotate, oscillate, { ...pulse, target: 'fan' }]);
    expect(map.get('fan')?.map((a) => a.id)).toEqual(['spin', 'beat']);
    expect(map.get('cap')?.map((a) => a.id)).toEqual(['nod']);
  });
});
