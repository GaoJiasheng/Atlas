/**
 * Rig, joint angles, contraction and the exercise clock (pure, unit-tested;
 * docs/06 §SpaceScene "Real meshes and human muscles", docs/16 §6.4–§6.5).
 *
 *  - A rig joint drives one bone of the glb skeleton. Its `axes` give, per
 *    movement, the rotation axis in scene coordinates at rest (positive angle
 *    = that movement on that side of the body); the opposite movement uses
 *    the same axis negated (extension 20° = flexion −20°). Angles turn the bone
 *    about its own origin, in the order the rig lists the axes, relative to
 *    its parent (so the elbow's axes travel with the upper arm). A right
 *    joint's axes are signed against its left counterpart's mirror
 *    (`mirrorSignedAxes`), whichever way the rig exported them.
 *  - Poses, keyframe clips, the action demo and exercises name joints as
 *    `joint:<name>` / by name with `{ movement: degrees }`.
 *  - Contraction 0..1 (0 = lengthened or at rest, 1 = shortest): the part
 *    shortens along its fibres toward its origin (the origin end stays on the
 *    bone; up to 20 % × contraction, softly capped at 12 % of the fibre
 *    length) and its belly swells (`bulge` × its thickness), with signal
 *    stripes moving along the fibres; parts without fibre data scale instead.
 */
import { OPPOSITE_MOVEMENTS, type Movement } from '../../../lib/anatomy';
import { smoothstep01 } from './pose';
import type { Vec3 } from './math';

export const JOINT_PREFIX = 'joint:';

/** `joint:shoulder.l` → `shoulder.l`; anything else → null. */
export function jointOf(ref: string): string | null {
  return ref.startsWith(JOINT_PREFIX) ? ref.slice(JOINT_PREFIX.length) : null;
}

export type Angles = Partial<Record<Movement, number>>;

/** Quaternion [x, y, z, w]. */
export type Quat = [number, number, number, number];

export const IDENTITY_QUAT: Quat = [0, 0, 0, 1];

export function quatFromAxisAngle(axis: readonly number[], rad: number): Quat {
  const len = Math.hypot(axis[0] ?? 0, axis[1] ?? 0, axis[2] ?? 0) || 1;
  const s = Math.sin(rad / 2) / len;
  return [(axis[0] ?? 0) * s, (axis[1] ?? 0) * s, (axis[2] ?? 0) * s, Math.cos(rad / 2)];
}

export function quatMul(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
}

/** Rotate a vector by a unit quaternion. */
export function quatApply(q: Quat, v: readonly number[]): Vec3 {
  const p: Quat = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, 0];
  const r = quatMul(quatMul(q, p), [-q[0], -q[1], -q[2], q[3]]);
  return [r[0], r[1], r[2]];
}

/**
 * The axis (in the joint's own reference frame) and sign that drive
 * `movement`: its own axis, else its opposite's negated; null when the rig
 * has neither.
 */
export function movementAxis(axes: Readonly<Partial<Record<Movement, readonly number[]>>>, movement: Movement): { axis: readonly number[]; sign: number } | null {
  const own = axes[movement];
  if (own) return { axis: own, sign: 1 };
  const opp = OPPOSITE_MOVEMENTS[movement];
  const other = opp ? axes[opp] : undefined;
  return other ? { axis: other, sign: -1 } : null;
}

/** Whether the rig axes can show `movement`. */
export function canMove(axes: Readonly<Partial<Record<Movement, readonly number[]>>>, movement: Movement): boolean {
  return movementAxis(axes, movement) !== null;
}

/**
 * Angles folded onto the rig's own axes (`{ extension: 20 }` with a flexion
 * axis → `{ flexion: -20 }`), keyed in the rig's axis order; movements the
 * rig cannot show are dropped.
 */
export function foldAngles(axes: Readonly<Partial<Record<Movement, readonly number[]>>>, angles: Angles): Angles {
  const out: Angles = {};
  for (const [movement, deg] of Object.entries(angles) as [Movement, number][]) {
    const hit = movementAxis(axes, movement);
    if (!hit) continue;
    const key = (axes[movement] ? movement : OPPOSITE_MOVEMENTS[movement])!;
    out[key] = (out[key] ?? 0) + hit.sign * deg;
  }
  return out;
}

/**
 * The rig joints a muscle sheet's joint can mean, in order (side `l` / `r`):
 * the sided joint, the unsided one; `wrist` falls back to the `hand` joint
 * (the rigs pivot the hand at the wrist), pronation / supination on `forearm`
 * to the `elbow`. The ACTIONS demo, the contraction plan and validate share it.
 */
export function jointCandidates(joint: string, movement: string, side: 'l' | 'r'): string[] {
  const names = [`${joint}.${side}`, joint];
  if (joint === 'wrist') names.push(`hand.${side}`);
  if (joint === 'forearm' && (movement === 'pronation' || movement === 'supination')) names.push(`elbow.${side}`);
  return names;
}

/** Movements turned about the parent's fixed axis after the others: a horizontal sweep carries the arm (or thigh) wherever flexion and abduction have lifted it. */
const SWEEPS: ReadonlySet<Movement> = new Set(['horizontal-adduction', 'horizontal-abduction']);

/**
 * Rotation of a joint for angles already folded onto its axes (degrees),
 * about the parent's rest axes. The rig's order applies, except that a
 * horizontal ab/adduction comes last: flexion and abduction lift the limb,
 * then the sweep turns it about the trunk's vertical, so it moves the hand
 * forward and across instead of twisting the arm about itself.
 */
export function anglesQuat(axes: Readonly<Partial<Record<Movement, readonly number[]>>>, folded: Angles): Quat {
  let q: Quat = IDENTITY_QUAT;
  let sweep: Quat = IDENTITY_QUAT;
  for (const [movement, axis] of Object.entries(axes) as [Movement, readonly number[]][]) {
    const deg = folded[movement];
    if (!deg) continue;
    const r = quatFromAxisAngle(axis, (deg * Math.PI) / 180);
    if (SWEEPS.has(movement)) sweep = quatMul(sweep, r);
    else q = quatMul(q, r);
  }
  return quatMul(sweep, q);
}

/** Angles `k` of the way from `a` to `b` (missing movements are 0). */
export function lerpAngles(a: Angles, b: Angles, k: number): Angles {
  const out: Angles = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<Movement>) out[key] = (a[key] ?? 0) + ((b[key] ?? 0) - (a[key] ?? 0)) * k;
  return out;
}

/* ------------------------------------------------------------------ */
/* Contraction                                                         */
/* ------------------------------------------------------------------ */

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

/** A `contract` animation's level at `phase` (0..amount..0 at `hz`), weighted by the run energy. */
export function contractLevel(amount: number, hz: number, phase: number, energy = 1): number {
  return amount * ((1 - Math.cos(2 * Math.PI * hz * phase)) / 2) * energy;
}

/* ------------------------------------------------------------------ */
/* Exercise clock                                                      */
/* ------------------------------------------------------------------ */

/** Default tempo: start → end 2 s, no hold, end → start 1 s, no hold. */
export const DEFAULT_TEMPO: readonly [number, number, number, number] = [2, 0, 1, 0];

/**
 * Where an exercise loop is at `time` seconds: between keys `from` and `to`
 * (indices into the keys), `k` 0..1 eased. Start → end takes tempo[0] split
 * evenly over the segments, a hold of tempo[1] at the end, back to the start
 * in tempo[2], a hold of tempo[3].
 */
export function exerciseLoop(keyCount: number, tempo: readonly number[] | undefined, time: number): { from: number; to: number; k: number } {
  const [down, holdEnd, up, holdStart] = (tempo ?? DEFAULT_TEMPO) as [number, number, number, number];
  const last = Math.max(1, keyCount - 1);
  const cycle = down + holdEnd + up + holdStart;
  let t = cycle > 0 ? ((time % cycle) + cycle) % cycle : 0;
  const along = (span: number, forward: boolean) => {
    const x = (t / span) * last;
    const seg = Math.min(last - 1, Math.floor(x));
    const k = smoothstep01(x - seg);
    return forward ? { from: seg, to: seg + 1, k } : { from: last - seg, to: last - seg - 1, k };
  };
  if (t < down) return along(down, true);
  t -= down;
  if (t < holdEnd) return { from: last, to: last, k: 1 };
  t -= holdEnd;
  if (t < up) return along(up, false);
  return { from: 0, to: 0, k: 1 };
}

/* ------------------------------------------------------------------ */
/* Muscle ↔ part links                                                 */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Joint clips                                                         */
/* ------------------------------------------------------------------ */

export interface AngleKey {
  t: number;
  angles?: Angles | undefined;
  contract?: number | undefined;
}

/** Bracketing keys of a clip at `time` (looping or holding the last key), eased: `k` of the way from `a` to `b`. */
export function clipAt<K extends { t: number }>(keys: readonly K[], time: number, loop: boolean): { a: K; b: K; k: number } | null {
  const n = keys.length;
  if (n === 0) return null;
  const first = keys[0]!.t;
  const len = keys[n - 1]!.t;
  let t = time;
  if (loop && len > first) t = first + ((((time - first) % (len - first)) + (len - first)) % (len - first));
  if (t <= first) return { a: keys[0]!, b: keys[0]!, k: 0 };
  if (t >= len) return { a: keys[n - 1]!, b: keys[n - 1]!, k: 0 };
  let i = 0;
  while (i < n - 2 && keys[i + 1]!.t <= t) i++;
  const a = keys[i]!;
  const b = keys[i + 1]!;
  return { a, b, k: b.t > a.t ? smoothstep01((t - a.t) / (b.t - a.t)) : 1 };
}

/** A joint clip's angles at `time`. */
export function sampleAngles(keys: readonly AngleKey[], time: number, loop: boolean): Angles {
  const at = clipAt(keys, time, loop);
  return at ? lerpAngles(at.a.angles ?? {}, at.b.angles ?? {}, at.k) : {};
}

/** A part clip's contraction at `time` (keys without `contract` count as 0); null when no key sets one. */
export function sampleContract(keys: readonly AngleKey[], time: number, loop: boolean): number | null {
  if (!keys.some((k) => k.contract !== undefined)) return null;
  const at = clipAt(keys, time, loop);
  return at ? (at.a.contract ?? 0) + ((at.b.contract ?? 0) - (at.a.contract ?? 0)) * at.k : null;
}

/**
 * Joint angles of one exercise key for the rig: a left joint's angles also
 * drive its right counterpart (when the rig has it and the key does not name
 * it); the stage signs the right axes with `mirrorSignedAxes`, so the same
 * angles give the mirror pose.
 */
export function bothSides(joints: Readonly<Record<string, Angles>>, rigJoints: ReadonlySet<string>): Record<string, Angles> {
  const out: Record<string, Angles> = { ...joints };
  for (const [name, angles] of Object.entries(joints)) {
    if (!name.endsWith('.l')) continue;
    const right = `${name.slice(0, -2)}.r`;
    if (rigJoints.has(right) && out[right] === undefined) out[right] = angles;
  }
  return out;
}

/**
 * Unit normal of the body's midline plane from a left / right joint pair at
 * rest (scene coordinates): left minus right, else +X.
 */
export function midlineNormal(left: readonly number[], right: readonly number[]): Vec3 {
  const d: Vec3 = [(left[0] ?? 0) - (right[0] ?? 0), (left[1] ?? 0) - (right[1] ?? 0), (left[2] ?? 0) - (right[2] ?? 0)];
  const len = Math.hypot(...d);
  return len > 1e-9 ? [d[0] / len, d[1] / len, d[2] / len] : [1, 0, 0];
}

/**
 * A left joint's rotation axis reflected in the midline plane (unit normal
 * `n`) as an axial vector: −M·a = 2(n·a)n − a. A rotation about `a` by θ
 * mirrors to one about this axis by the same θ, so it is the right-side axis
 * whose positive angle makes the mirror image of the left movement.
 */
export function mirrorRigAxis(axis: readonly number[], n: readonly number[]): Vec3 {
  const d = 2 * ((axis[0] ?? 0) * (n[0] ?? 0) + (axis[1] ?? 0) * (n[1] ?? 0) + (axis[2] ?? 0) * (n[2] ?? 0));
  return [d * (n[0] ?? 0) - (axis[0] ?? 0), d * (n[1] ?? 0) - (axis[1] ?? 0), d * (n[2] ?? 0) - (axis[2] ?? 0)];
}

/**
 * A right joint's axes signed so that the same angles as on its left
 * counterpart make the mirror-image movement (`bothSides`; docs/06 ".l joint
 * angles also drive .r"). A rig may export a right axis as the left one's
 * axial mirror (x kept, y and z negated: already right) or as a plain mirrored
 * direction (x negated: the opposite way round for every axis not normal to
 * the midline, e.g. rotation or horizontal adduction): each right axis keeps
 * its own direction (the two sides need not be exactly symmetric) and flips
 * when it points away from the left axis's mirror. Movements the left joint
 * cannot show stay as written.
 */
export function mirrorSignedAxes(
  left: Readonly<Partial<Record<Movement, readonly number[]>>>,
  right: Readonly<Partial<Record<Movement, readonly number[]>>>,
  n: readonly number[],
): Partial<Record<Movement, readonly number[]>> {
  const out: Partial<Record<Movement, readonly number[]>> = {};
  for (const [movement, axis] of Object.entries(right) as [Movement, readonly number[]][]) {
    const hit = movementAxis(left, movement);
    if (!hit) {
      out[movement] = axis;
      continue;
    }
    const want = mirrorRigAxis(hit.axis, n);
    const dot = hit.sign * ((axis[0] ?? 0) * want[0] + (axis[1] ?? 0) * want[1] + (axis[2] ?? 0) * want[2]);
    out[movement] = dot < 0 ? [-(axis[0] ?? 0), -(axis[1] ?? 0), -(axis[2] ?? 0)] : axis;
  }
  return out;
}

/** Hinges that stand straight at rest: their extension demo swings back from flexion, never past straight. */
export const STRAIGHT_AT_REST: ReadonlySet<string> = new Set(['knee', 'elbow']);

/**
 * The demo's angle on a joint at `swing` (0 → 1 → 0 over `DEMO_PERIOD`):
 * the movement through `amount` degrees from rest, or for the extension of a
 * hinge straight at rest (knee, elbow), from `amount` degrees of flexion back
 * to straight (the muscle shortens as the joint straightens).
 */
export function demoAngles(joint: string, movement: Movement, amount: number, swing: number): Angles {
  if (movement === 'extension' && STRAIGHT_AT_REST.has(joint)) return { flexion: amount * (1 - swing) };
  return { [movement]: amount * swing };
}

/** Default demo swing of a movement (degrees) when the rig gives none. */
export const DEFAULT_DEMO_ANGLE = 60;
/** Smallest demo swing (degrees) a muscle sheet's demo button may have (validate). */
export const MIN_DEMO_ANGLE = 5;
/** One demo swing there and back (s). */
export const DEMO_PERIOD = 3;
