/**
 * Animation clocks for the `hz` binding and tidal flows (docs/40 §4.3–§4.4;
 * pure, unit-tested). An animation paced by a number output keeps its own
 * clock: its frequency eases to the bound value over about 0.5 s and its
 * phase is integrated frame by frame (in cycles), so a change of pace never
 * jumps. Several animations bound to one output step identically and stay in
 * phase. The stage turns cycles back into the animation's own time
 * (`clockTime`), so the existing samplers (pulse, oscillate, contract,
 * sequence keys) play it unchanged. An animation nothing paces reads the
 * shared run clock (`freeCycles`), exactly as before.
 */
import type { PartAnimation } from '../../schema';
import { damp } from '../math';

export interface AnimClock {
  /** Cycles played so far (the phase is its fractional part). */
  cycles: number;
  /** Frequency now (Hz), easing toward the bound value. */
  hz: number;
  /** How far the animation is switched on (an `enabled` binding eases it, 0..1). */
  on: number;
  /** Cycles the last step advanced (a tidal flow follows them). */
  advance: number;
  /** Seconds of the cycle's own time the last step played, × `on` (dt × run × on: 0 while it is stopped). */
  seconds: number;
  /** Paced by an `hz` binding (its own integrated phase), else the shared run clock. */
  paced: boolean;
}

/** Ease rate of a new frequency (≈ 95 % in 0.5 s). */
export const HZ_RATE = 6;
/** Ease rate of an `enabled` binding switching the animation on / off (PartNode's own). */
export const ON_RATE = 6;

/** A sequence's cycle length (s): its last key's `t`. */
export function cycleLength(keys: readonly { t: number }[]): number {
  return keys.length ? keys[keys.length - 1]!.t : 0;
}

/** The frequency an animation plays at by itself (Hz): its `hz`, a sequence's 1 ÷ cycle length, a rotate's turns per second. */
export function nativeHz(a: PartAnimation): number {
  if (a.kind === 'sequence') {
    const len = cycleLength(a.keys);
    return len > 0 ? 1 / len : 0;
  }
  if (a.kind === 'rotate') return Math.abs(a.rpm) / 60;
  return a.hz;
}

/** The animation's own time (s) that `cycles` cycles correspond to (what its sampler reads). */
export function clockTime(a: PartAnimation, cycles: number): number {
  const hz = nativeHz(a);
  return hz > 0 ? cycles / hz : 0;
}

/** Cycles of an animation nothing paces: the shared clock (run-weighted or wall time) × its own frequency. */
export function freeCycles(a: PartAnimation, time: number): number {
  return time * nativeHz(a);
}

/** A clock that starts at cycle 0 at frequency `hz` (deep links start at the end value). */
export function createClock(hz: number, on = 1, paced = true): AnimClock {
  return { cycles: 0, hz, on, advance: 0, seconds: 0, paced };
}

/**
 * One frame of a paced clock: the frequency eases toward `target` (jumps with
 * `snap`: deep links, instant transitions, reduced motion), `on` eases toward
 * `onTarget`, and the phase advances by dt × hz × `run` (the scene's run
 * energy; 1 for an always-on animation).
 */
export function stepClock(c: AnimClock, target: number, dt: number, run: number, onTarget: number, snap: boolean): AnimClock {
  c.hz = snap ? target : damp(c.hz, target, HZ_RATE, dt);
  if (Math.abs(c.hz - target) <= Math.abs(target) * 5e-3 + 1e-6) c.hz = target;
  c.on = snap ? onTarget : damp(c.on, onTarget, ON_RATE, dt);
  if (Math.abs(c.on - onTarget) < 0.003) c.on = onTarget;
  c.advance = dt * c.hz * run;
  c.cycles += c.advance;
  c.seconds = dt * run * c.on;
  return c;
}

/** The fractional phase of a clock (0 ≤ φ < 1). */
export function clockPhase(cycles: number): number {
  return cycles - Math.floor(cycles);
}

/** Whether a clock still eases (its frequency or its on-ness has not arrived). */
export function clockEasing(c: AnimClock, target: number, onTarget: number): boolean {
  return c.hz !== target || c.on !== onTarget;
}
