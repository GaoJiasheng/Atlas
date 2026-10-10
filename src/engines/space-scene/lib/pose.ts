/**
 * Poses and keyframe clips (pure, unit-tested; docs/06 §SpaceScene
 * "organisms"). A transform moves a part about a `pivot` (scene
 * coordinates; default the part centre): scale, then rotate (XYZ Euler,
 * degrees), both about the pivot, then `offset`; `fan` opens (1) or folds
 * (0) a `wing` with a `fold`.
 *
 *  - poses: `parts.json` `poses.<name>.<part id>`; a chapter or beat names a
 *    pose (`pose: "<name>"`) and the stage eases every part from where it is to
 *    its entry (parts without one go back to rest) over the pose's
 *    `duration` (default 0.8 s); `pose: null` (or none) is rest.
 *  - sequence animations: `keys` `[{ t, rotation?, offset?, scale?, fan? }]`
 *    (t in seconds, ascending) eased key to key (smoothstep), looping
 *    (`loop`, default) or holding the last key.
 */
import type { Vec3 } from './math';

/** Default pose transition (s). */
export const POSE_DURATION = 0.8;
/** Most poses a topic may declare. */
export const MAX_POSES = 8;

export interface PartTransform {
  /** Scene coordinates; `null` = the part centre. */
  pivot: Vec3 | null;
  /** XYZ Euler, degrees. */
  rotation: Vec3;
  offset: Vec3;
  scale: Vec3;
  /** Wing fan 0..1, `null` = not driven (the wing's rest fan). */
  fan: number | null;
}

export interface TransformInput {
  pivot?: readonly number[] | undefined;
  rotation?: readonly number[] | undefined;
  offset?: readonly number[] | undefined;
  scale?: number | readonly number[] | undefined;
  fan?: number | undefined;
}

export const restTransform = (): PartTransform => ({ pivot: null, rotation: [0, 0, 0], offset: [0, 0, 0], scale: [1, 1, 1], fan: null });

const v3 = (v: readonly number[] | undefined, d: number): Vec3 => [v?.[0] ?? d, v?.[1] ?? d, v?.[2] ?? d];

export function toTransform(t: TransformInput | undefined): PartTransform {
  if (!t) return restTransform();
  const s = t.scale;
  return {
    pivot: t.pivot ? v3(t.pivot, 0) : null,
    rotation: v3(t.rotation, 0),
    offset: v3(t.offset, 0),
    scale: typeof s === 'number' ? [s, s, s] : v3(s, 1),
    fan: t.fan ?? null,
  };
}

export function isRest(t: PartTransform): boolean {
  return t.rotation.every((x) => x === 0) && t.offset.every((x) => x === 0) && t.scale.every((x) => x === 1) && t.fan === null;
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: Vec3, b: Vec3, k: number): Vec3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

/**
 * Transform `k` (0..1) of the way from `a` to `b`. The pivot is the target's
 * (or, going back to rest, the one being left); a fan driven at one end only
 * eases from / to `restFan`.
 */
export function lerpTransform(a: PartTransform, b: PartTransform, k: number, restFan = 1): PartTransform {
  const fan = a.fan === null && b.fan === null ? null : mix(a.fan ?? restFan, b.fan ?? restFan, k);
  return {
    pivot: b.pivot ?? a.pivot,
    rotation: mix3(a.rotation, b.rotation, k),
    offset: mix3(a.offset, b.offset, k),
    scale: mix3(a.scale, b.scale, k),
    fan: k >= 1 && b.fan === null ? null : fan,
  };
}

export const smoothstep01 = (x: number): number => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

export interface SequenceKey extends TransformInput {
  t: number;
}

/** Length of a clip (s): its last key's time. */
export function sequenceLength(keys: readonly SequenceKey[]): number {
  return keys[keys.length - 1]?.t ?? 0;
}

/** The clip's transform at `time` seconds (looping, or holding the last key). */
export function sampleSequence(keys: readonly SequenceKey[], time: number, loop: boolean, pivot?: readonly number[]): PartTransform {
  const n = keys.length;
  const at = (i: number) => {
    const t = toTransform(keys[i]);
    return pivot ? { ...t, pivot: v3(pivot, 0) } : t;
  };
  if (n === 0) return restTransform();
  const len = sequenceLength(keys);
  const first = keys[0]!.t;
  let t = time;
  if (loop && len > first) t = first + ((((time - first) % (len - first)) + (len - first)) % (len - first));
  if (t <= first) return at(0);
  if (t >= len) return at(n - 1);
  let i = 0;
  while (i < n - 2 && keys[i + 1]!.t <= t) i++;
  const a = keys[i]!;
  const b = keys[i + 1]!;
  const k = b.t > a.t ? smoothstep01((t - a.t) / (b.t - a.t)) : 1;
  return lerpTransform(at(i), at(i + 1), k);
}
