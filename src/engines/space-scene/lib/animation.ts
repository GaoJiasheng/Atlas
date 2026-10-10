/**
 * Part animations played while the scene "runs" (pure, unit-tested).
 *
 *   rotate     continuous spin about `axis` at `rpm` turns per minute
 *   oscillate  sinusoidal swing about `axis`, `amplitude` degrees peak, `hz` swings/s
 *   pulse      scale "breathing" between 1 and `scale` (a number, or [sx, sy, sz]
 *              per axis), `hz` breaths/s
 *   sequence   keyframe clip (lib/pose.ts `sampleSequence`), looping or once
 *
 * The axis is in the part's parent frame and passes through the part centre,
 * or through `pivot` (scene coordinates: a jaw or knee joint).
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

/** Rotation angle (radians, about the animation's axis) at `phase`; 0 for `pulse`. Allocation-free. */
export function animationAngle(anim: PartAnimation, phase: number, energy = 1): number {
  if (anim.kind === 'rotate') return (anim.rpm / 60) * 2 * Math.PI * phase;
  if (anim.kind === 'oscillate') return anim.amplitude * DEG2RAD * Math.sin(2 * Math.PI * anim.hz * phase) * energy;
  return 0;
}

/** Peak scale of a pulse per axis. */
export function pulsePeak(anim: Extract<PartAnimation, { kind: 'pulse' }>): Vec3 {
  const s = anim.scale;
  return typeof s === 'number' ? [s, s, s] : [s[0], s[1], s[2]];
}

/** Breath (0..1..0) of a pulse at `phase`, weighted by `energy`; 0 unless `pulse`. Allocation-free. */
export function pulseBreath(anim: PartAnimation, phase: number, energy = 1): number {
  if (anim.kind !== 'pulse') return 0;
  return ((1 - Math.cos(2 * Math.PI * anim.hz * phase)) / 2) * energy;
}

/** Uniform scale at `phase` (a per-axis pulse: its mean); 1 unless `pulse`. Allocation-free. */
export function animationScale(anim: PartAnimation, phase: number, energy = 1): number {
  if (anim.kind !== 'pulse') return 1;
  const s = anim.scale;
  const peak = typeof s === 'number' ? s : (s[0] + s[1] + s[2]) / 3;
  return 1 + (peak - 1) * pulseBreath(anim, phase, energy);
}

/** Per-axis scale at `phase` (written into `out`); [1, 1, 1] unless `pulse`. */
export function animationScale3(anim: PartAnimation, phase: number, energy: number, out: Vec3): Vec3 {
  out[0] = out[1] = out[2] = 1;
  if (anim.kind !== 'pulse') return out;
  const b = pulseBreath(anim, phase, energy);
  const s = anim.scale;
  for (let i = 0; i < 3; i++) out[i] = 1 + ((typeof s === 'number' ? s : s[i]!) - 1) * b;
  return out;
}

/**
 * Pose of an animation at `phase` seconds of (energy-weighted) running time.
 * With `energy` = 1 and constant running, `phase` is plain elapsed time.
 */
export function animationPose(anim: PartAnimation, phase: number, energy = 1): AnimationPose {
  if (anim.kind === 'pulse') return { ...IDENTITY, scale: animationScale(anim, phase, energy) };
  if (anim.kind === 'sequence') return IDENTITY;
  return { axis: normalize3(anim.axis), angle: animationAngle(anim, phase, energy), scale: 1 };
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

