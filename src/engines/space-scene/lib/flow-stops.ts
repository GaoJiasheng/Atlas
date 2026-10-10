/**
 * Colour along a flow (`stops`, pure, unit-tested): the two stops around a
 * path fraction and the mix between them. The particle shader does the same
 * per particle (flowMaterial.ts); the part-chain card uses it for its lines.
 */
import type { FlowStop } from '../schema';

export interface StopSpan {
  /** Colour refs on either side and the mix 0 (= a) .. 1 (= b). */
  a: string;
  b: string;
  k: number;
}

/** Stops around fraction `u` (clamped to 0..1); before the first / after the last stop the colour is flat. */
export function stopSpan(stops: readonly FlowStop[], u: number): StopSpan {
  const x = Math.min(1, Math.max(0, u));
  const first = stops[0]!;
  if (x <= first.at) return { a: first.color, b: first.color, k: 0 };
  for (let i = 1; i < stops.length; i++) {
    const s = stops[i]!;
    if (x <= s.at) {
      const p = stops[i - 1]!;
      const span = s.at - p.at;
      return { a: p.color, b: s.color, k: span > 1e-9 ? (x - p.at) / span : 1 };
    }
  }
  const last = stops[stops.length - 1]!;
  return { a: last.color, b: last.color, k: 0 };
}

/** A flow's colour at fraction `u`: its stops, else its single `color`. */
export function flowColorAt(flow: { color: string; stops?: readonly FlowStop[] | undefined }, u: number): StopSpan {
  return flow.stops && flow.stops.length > 0 ? stopSpan(flow.stops, u) : { a: flow.color, b: flow.color, k: 0 };
}
