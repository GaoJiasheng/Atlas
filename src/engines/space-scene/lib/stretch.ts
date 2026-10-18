/**
 * A coil stretched along its own axis (docs/30 F4; pure, unit-tested): every
 * vertex of a stretched part has a place `t` along the coil (0 at its −Y
 * end, 1 at +Y): the coil's own vertices the helix parameter of their ring,
 * the part's other pieces (hooks, a hanger drawn with it) the place of their
 * centre, clamped to the ends. Stretching by ΔL moves each vertex along the
 * coil's axis by (t − t_anchor) · ΔL: the rings slide apart rigidly, so the
 * turns spread while the wire keeps its thickness, the anchored end stays
 * put and a hook at the free end rides with it.
 */
import type { Vec3 } from './math';
import type { STRETCH_ANCHORS } from '../sim-schema';

export type StretchAnchor = (typeof STRETCH_ANCHORS)[number];

/** The vertex attribute holding each vertex's place along the coil. */
export const STRETCH_ATTRIBUTE = 'atlasStretch';

/** The place along the coil that stays put. */
export function anchorT(anchor: StretchAnchor): number {
  return anchor === 'top' ? 1 : anchor === 'bottom' ? 0 : 0.5;
}

/** The place along a coil of `length` of a point `along` its axis from the coil's centre (clamped to the ends). */
export function placeAlong(along: number, length: number): number {
  return Math.min(1, Math.max(0, along / length + 0.5));
}

/**
 * Write the stretched positions: out = base + axis · (t − t_anchor) · ΔL for
 * every vertex (`base`, `out`: xyz triples; `t`: one place per vertex).
 */
export function stretchPositions(base: ArrayLike<number>, t: ArrayLike<number>, axis: Vec3, anchor: StretchAnchor, dL: number, out: { [i: number]: number }): void {
  const a = anchorT(anchor);
  const n = t.length;
  for (let i = 0; i < n; i++) {
    const d = (t[i]! - a) * dL;
    out[i * 3] = base[i * 3]! + axis[0] * d;
    out[i * 3 + 1] = base[i * 3 + 1]! + axis[1] * d;
    out[i * 3 + 2] = base[i * 3 + 2]! + axis[2] * d;
  }
}
