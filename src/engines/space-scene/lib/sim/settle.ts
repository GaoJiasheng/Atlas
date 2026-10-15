/**
 * A damped swing toward a target (a compass needle, a hanging magnet; schema
 * `settle`; pure, unit-tested): x'' = −ω²(x − target) − 2ζωx', ω = 2π ÷
 * period, stepped semi-implicitly in ≤ 1/120 s substeps. Angles take the short
 * way round (`nearestTurn`). Settled when within `SETTLE_EPS` degrees and
 * nearly still: it then snaps to the target and stops asking for frames.
 */
import type { SimSettle } from '../../sim-schema';

export interface Swing {
  x: number;
  v: number;
}

/** Degrees (and degrees per second) under which a swing counts as settled. */
export const SETTLE_EPS = 0.05;
const MAX_SUBSTEP = 1 / 120;

/** The target turned by whole turns to lie within 180° of `current` (350° → 10° is +20°). */
export function nearestTurn(current: number, target: number): number {
  return target + 360 * Math.round((current - target) / 360);
}

/** Advance a swing by `dt` seconds toward `target`; true while it is still moving. */
export function stepSwing(s: Swing, target: number, dt: number, p: SimSettle): boolean {
  const w = (2 * Math.PI) / p.period;
  let left = dt;
  while (left > 1e-9) {
    const h = Math.min(MAX_SUBSTEP, left);
    s.v += (-w * w * (s.x - target) - 2 * p.damping * w * s.v) * h;
    s.x += s.v * h;
    left -= h;
  }
  if (Math.abs(s.x - target) < SETTLE_EPS && Math.abs(s.v) < SETTLE_EPS * 10) {
    s.x = target;
    s.v = 0;
    return false;
  }
  return true;
}
