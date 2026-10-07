/**
 * Part animations played while the scene "runs" (pure, unit-tested).
 *
 *   rotate     continuous spin about `axis` at `rpm` turns per minute
 *   oscillate  sinusoidal swing about `axis`, `amplitude` degrees peak, `hz` swings/s
 *   pulse      scale "breathing" between 1 and `scale`, `hz` breaths/s
 *
 * The axis is in the part's parent frame and passes through the part centre.
 * `energy` (0..1) eases runs in and out: the stage integrates time as
 * `phase += dt * energy` and scales swings/breaths by `energy`, so switching
 * off spins down instead of freezing mid-swing.
 */
import type { PartAnimation } from '../schema';
import { DEG2RAD, normalize3, type Vec3 } from './math';

export interface AnimationPose {
  /** Rotation about a unit axis, radians. */
  axis: Vec3;
  angle: number;
  /** Uniform scale factor. */
  scale: number;
}

const IDENTITY: AnimationPose = { axis: [0, 1, 0], angle: 0, scale: 1 };

/**
 * Pose of an animation at `phase` seconds of (energy-weighted) running time.
 * With `energy` = 1 and constant running, `phase` is plain elapsed time.
 */
export function animationPose(anim: PartAnimation, phase: number, energy = 1): AnimationPose {
  switch (anim.kind) {
    case 'rotate':
      return { axis: normalize3(anim.axis), angle: (anim.rpm / 60) * 2 * Math.PI * phase, scale: 1 };
    case 'oscillate':
      return {
        axis: normalize3(anim.axis),
        angle: anim.amplitude * DEG2RAD * Math.sin(2 * Math.PI * anim.hz * phase) * energy,
        scale: 1,
      };
    case 'pulse': {
      const breath = (1 - Math.cos(2 * Math.PI * anim.hz * phase)) / 2; // 0..1..0
      return { ...IDENTITY, scale: 1 + (anim.scale - 1) * breath * energy };
    }
  }
}

/** Animations grouped by target part id. */
export function animationsByPart(animations: readonly PartAnimation[]): Map<string, PartAnimation[]> {
  const out = new Map<string, PartAnimation[]>();
  for (const a of animations) {
    const list = out.get(a.target);
    if (list) list.push(a);
    else out.set(a.target, [a]);
  }
  return out;
}

/** Whether an animation plays for the current `run` flag. */
export function animationActive(anim: Pick<PartAnimation, 'whenRun'>, run: boolean): boolean {
  return anim.whenRun ? run : true;
}
