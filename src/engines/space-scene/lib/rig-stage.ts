/**
 * The rig rules every 3D stage reads (rig.ts re-exports them): joint references, the contraction scale and limits
 * the part materials use, and the parts showing a shared muscle.
 */
import type { Vec3 } from './math';

export const JOINT_PREFIX = 'joint:';

/** `joint:shoulder.l` → `shoulder.l`; anything else → null. */
export function jointOf(ref: string): string | null {
  return ref.startsWith(JOINT_PREFIX) ? ref.slice(JOINT_PREFIX.length) : null;
}

/** Most a muscle shortens along its fibres at contraction 1 (docs/16 §6.4). */
export const MAX_SHORTEN = 0.2;
/** Most any vertex moves toward the origin, as a fraction of the fibre length (soft cap). */
export const MAX_SHORTEN_CAP = 0.12;
/** Default belly swell at contraction 1, as a fraction of its thickness. */
export const DEFAULT_BULGE = 0.08;
/** Strongest the signal stripes get over the muscle colour (docs/16 §9 M7). */
export const STRIPE_OPACITY = 0.35;

/**
 * Fallback without fibre data: scale the part about its centre, shorter
 * along its longest axis and fatter across it (`half` = half extents).
 */
export function contractScale(half: readonly number[], c: number, bulge = DEFAULT_BULGE): Vec3 {
  const k = Math.min(1, Math.max(0, c));
  const long = [0, 1, 2].reduce((best, i) => ((half[i] ?? 0) > (half[best] ?? 0) ? i : best), 0);
  const out: Vec3 = [1 + bulge * k, 1 + bulge * k, 1 + bulge * k];
  out[long] = 1 - MAX_SHORTEN * 0.6 * k;
  return out;
}

interface MusclePart {
  id: string;
  muscle?: string | undefined;
  context?: boolean | undefined;
}

/**
 * Parts showing a shared muscle id: parts that link it, or a head of it (a
 * muscle whose parent chain reaches it); both sides of a pair.
 */
export function musclePartIds(parts: readonly MusclePart[], muscleId: string, parentOf: ReadonlyMap<string, string | undefined>): string[] {
  const covers = (m: string | undefined) => {
    for (let cur = m, n = 0; cur && n < 16; cur = parentOf.get(cur), n++) if (cur === muscleId) return true;
    return false;
  };
  return parts.filter((p) => !p.context && covers(p.muscle)).map((p) => p.id);
}
