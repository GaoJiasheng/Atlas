/**
 * Tidal flows (docs/40 §4.4, E-HL3; pure, unit-tested): particles that go in
 * and out with a breathing animation instead of running round. The velocity
 * along the path is `speed` × pace × sin(2π φ), φ the cycle phase of the
 * animation the flow follows (`tidal.sync`) or of its own clock
 * (`tidal.hz`): toward the end of the path in the first half of the cycle
 * (the lungs fill), back in the second. Flows.tsx integrates it into each
 * path's phase uniform, so the shader is unchanged and a change of pace
 * never jumps; both ends fade (the flow's `ends: fade`).
 */

/** Signed velocity factor at phase φ: sin(2π φ) (positive: along the path). */
export function tidalVelocity(phase: number): number {
  return Math.sin(2 * Math.PI * phase);
}

/**
 * How far (scene units) a particle moves in one frame: `speed` × `pace` ×
 * sin(2π φ) over `seconds` of the cycle's own time (dt × run × on: zero while
 * the animation is stopped, so the particles stop with it). `phase` is the
 * phase at the start of the frame and `cycles` how far the clock moved; the
 * velocity is taken at the middle of the step.
 */
export function tidalStep(phase: number, cycles: number, seconds: number, speed: number, pace: number): number {
  return speed * pace * tidalVelocity(phase + cycles / 2) * seconds;
}

/** Peak-to-peak distance a particle travels in one breath (scene units): speed × pace ÷ (π × hz). */
export function tidalAmplitude(speed: number, pace: number, hz: number): number {
  return hz > 0 ? (speed * Math.abs(pace)) / (Math.PI * hz) : 0;
}
