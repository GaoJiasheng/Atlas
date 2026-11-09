/** Small per-part helpers used even by scenes without a simulation. */
import type { Vec3 } from '../math';

/** Spherical interpolation, including coincident and opposite directions; writes into `out`. */
export function placeDirection(from: Vec3, to: Vec3, t: number, out: Vec3): void {
  const dot = Math.max(-1, Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]));
  if (dot > 0.999999) {
    for (let i = 0; i < 3; i++) out[i] = from[i]! + (to[i]! - from[i]!) * t;
  } else if (dot < -0.999999) {
    // Pick a stable perpendicular so a half-circle still stays on the sphere.
    const x = Math.abs(from[0]) < 0.9 ? 1 : 0;
    const y = x ? 0 : 1;
    const d = from[0] * x + from[1] * y;
    const px = x - d * from[0], py = y - d * from[1], pz = -d * from[2];
    const n = Math.hypot(px, py, pz);
    const c = Math.cos(Math.PI * t), k = Math.sin(Math.PI * t) / n;
    out[0] = from[0] * c + px * k;
    out[1] = from[1] * c + py * k;
    out[2] = from[2] * c + pz * k;
  } else {
    const angle = Math.acos(dot), den = Math.sin(angle);
    const a = Math.sin((1 - t) * angle) / den, b = Math.sin(t * angle) / den;
    for (let i = 0; i < 3; i++) out[i] = from[i]! * a + to[i]! * b;
  }
  const length = Math.hypot(...out);
  for (let i = 0; i < 3; i++) out[i] = out[i]! / length;
}


/**
 * The tint a material slot takes: a try-it tint (`tint` binding) colours the
 * part's own material only (slot 0, like `glow`: the iron core, not the
 * leads, stand or clips drawn with it); the chapter / exercise highlight
 * colours the other slots, and slot 0 too while no try-it tint is bound.
 */
export function slotTint<T>(slot: number, highlight: T, sim: T | null): T {
  return slot === 0 && sim !== null ? sim : highlight;
}


/** What an output's numbers are (docs/40 §4.2): `typical` (a sourced measurement) or `sim` (the default: "in this model"). */
export function outputTag(o: { tag?: 'sim' | 'typical' | undefined }): 'sim' | 'typical' {
  return o.tag ?? 'sim';
}

/** The PLATE status line's tag: TYPICAL when the card observes only typical outputs, else SIM. */
export function statusTag(observe: readonly string[], outputs: readonly { id: string; tag?: 'sim' | 'typical' | undefined }[]): 'SIM' | 'TYPICAL' {
  return observe.length > 0 && observe.every((id) => outputs.find((o) => o.id === id)?.tag === 'typical') ? 'TYPICAL' : 'SIM';
}

