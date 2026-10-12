/**
 * Where a hand holds equipment (docs/16 §6.5): the palm's centre, from the
 * rig's `hand.l` / `hand.r` joint (the wrist) plus its `offset` — metres
 * along the forearm to the palm centre (a number: the elbow → wrist direction
 * at rest), or a vector in the scene's rest frame (`[x, y, z]`, the rig as
 * exported). Either way the offset turns with the hand joint, so a bent wrist
 * carries the palm with it. Positions are in the skeleton's frame (before the
 * exercise's root turn, which the held equipment and the body share).
 */
import { Quaternion, Vector3, type Object3D } from 'three';

export interface Grip {
  bone: Object3D;
  /** The wrist → palm-centre offset at rest (scene rest frame). */
  offset: Vector3;
  /** The inverse of the bone's world rotation at rest (the offset turns from there). */
  restInverse: Quaternion;
}

const _p = new Vector3();
const _q = new Quaternion();

/** The forearm's direction at a hand joint: its parent bone → the joint (unit), else straight down. */
function forearmAxis(bone: Object3D, out: Vector3): Vector3 {
  bone.getWorldPosition(out);
  const parent = bone.parent;
  if (parent && (parent as { isBone?: boolean }).isBone) out.sub(parent.getWorldPosition(_p));
  else out.set(0, -1, 0);
  if (out.lengthSq() < 1e-10) out.set(0, -1, 0);
  return out.normalize();
}

export function makeGrip(bone: Object3D | null, offset: number | readonly number[] | undefined): Grip | null {
  if (!bone) return null;
  bone.updateWorldMatrix(true, false);
  const o =
    offset === undefined
      ? new Vector3()
      : typeof offset === 'number'
        ? forearmAxis(bone, new Vector3()).multiplyScalar(offset)
        : new Vector3(offset[0] ?? 0, offset[1] ?? 0, offset[2] ?? 0);
  return { bone, offset: o, restInverse: bone.getWorldQuaternion(new Quaternion()).invert() };
}

/**
 * The grip point (`pos`, the palm centre) and the forearm direction (`axis`,
 * unit, elbow → wrist) now. World matrices must be current.
 */
export function gripPoint(g: Grip, pos: Vector3, axis: Vector3): void {
  forearmAxis(g.bone, axis);
  g.bone.getWorldPosition(pos);
  // The rest offset turned by the hand joint's rotation since rest.
  g.bone.getWorldQuaternion(_q).multiply(g.restInverse);
  pos.add(_p.copy(g.offset).applyQuaternion(_q));
}
