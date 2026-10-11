/**
 * Exploded-view maths. A part moves along its unit `explode.dir` by
 * `explode.dist * amount` scene units, where `amount` is the store's
 * `explode` (0..1) and only applies in the `exploded` view.
 *
 * Peel (docs/16 §6.1): parts with `explode.stage` move one layer after the
 * other: with n stages, stage s ramps over its own window of the slider
 * (three stages: 0–0.4, 0.3–0.7, 0.6–1.0), eased; parts without a stage
 * follow the whole slider.
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

/** Highest `explode.stage`. */
export const MAX_EXPLODE_STAGE = 3;
/** Width of one stage's window on the slider. */
export const STAGE_WINDOW = 0.4;

/** Number of peel stages in a part list (0 when no part has a stage). */
export function explodeStages(parts: readonly { explode: { stage?: number | undefined } }[]): number {
  let n = 0;
  for (const p of parts) if (p.explode.stage !== undefined) n = Math.max(n, p.explode.stage + 1);
  return n;
}

/**
 * How far a part of `stage` has moved (0..1) at slider `amount`, with
 * `stages` stages in the topic: windows of 0.4 starting evenly from 0 to 0.6.
 */
export function stagedAmount(amount: number, stage: number | undefined, stages: number): number {
  if (stage === undefined || stages <= 1) return clamp01(amount);
  const start = (Math.min(stage, stages - 1) * (1 - STAGE_WINDOW)) / (stages - 1);
  const k = clamp01((amount - start) / STAGE_WINDOW);
  return k * k * (3 - 2 * k);
}
