/**
 * Exploded-view maths. A part moves along its unit `explode.dir` by
 * `explode.dist * amount` scene units, where `amount` is the store's
 * `explode` (0..1) and only applies in the `exploded` view.
 */
import type { SpaceView } from '../schema';
import { clamp01, normalize3, type Vec3 } from './math';

export interface ExplodeSpec {
  dir: readonly number[];
  dist: number;
}

/** Offset of a part for an explode amount (0..1). `dir` is normalised. */
export function explodeOffset(explode: ExplodeSpec, amount: number): Vec3 {
  const k = clamp01(amount) * explode.dist;
  const [x, y, z] = normalize3(explode.dir);
  return [x * k, y * k, z * k];
}

/** Explode amount the stage should animate towards for a view. */
export function targetExplodeAmount(view: SpaceView, explode: number): number {
  return view === 'exploded' ? clamp01(explode) : 0;
}

/** Part centre after exploding. */
export function explodedPosition(at: readonly number[], explode: ExplodeSpec, amount: number): Vec3 {
  const [dx, dy, dz] = explodeOffset(explode, amount);
  return [(at[0] ?? 0) + dx, (at[1] ?? 0) + dy, (at[2] ?? 0) + dz];
}
