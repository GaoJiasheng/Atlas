/**
 * Where a hand holds equipment (docs/16 §6.5): the rig's `hand.l` / `hand.r`
 * bone plus its `offset` — metres along the parent → joint axis (the palm sits
 * ~8 cm past the wrist, along the forearm), or a rest-frame vector that turns
 * with the bone. Positions are in the skeleton's frame (before the exercise's
 * root turn, which the held equipment and the body share).
 */
import { Quaternion, Vector3, type Object3D } from 'three';

export interface Grip {
  bone: Object3D;
  offset: number | readonly [number, number, number];
  /** The inverse of the bone's world rotation at rest (a vector offset turns from there). */
  restInverse: Quaternion;
}

const _p = new Vector3();
const _q = new Quaternion();

export function makeGrip(bone: Object3D | null, offset: number | readonly number[] | undefined): Grip | null {
  if (!bone) return null;
  bone.updateWorldMatrix(true, false);
  const o = offset === undefined ? 0 : typeof offset === 'number' ? offset : ([offset[0] ?? 0, offset[1] ?? 0, offset[2] ?? 0] as const);
  return { bone, offset: o, restInverse: bone.getWorldQuaternion(new Quaternion()).invert() };
}

/**
 * The grip point (`pos`) and the forearm direction (`axis`, unit, elbow →
 * wrist: the bone's parent → the bone) now. World matrices must be current.
 */
export function gripPoint(g: Grip, pos: Vector3, axis: Vector3): void {
  g.bone.getWorldPosition(pos);
  const parent = g.bone.parent;
  if (parent && (parent as { isBone?: boolean }).isBone) axis.subVectors(pos, parent.getWorldPosition(_p));
  else axis.set(0, -1, 0);
  if (axis.lengthSq() < 1e-10) axis.set(0, -1, 0);
  axis.normalize();
  if (typeof g.offset === 'number') pos.addScaledVector(axis, g.offset);
  else {
    // Rest-frame vector turned by the bone's rotation since rest.
    g.bone.getWorldQuaternion(_q).multiply(g.restInverse);
    pos.add(_p.set(g.offset[0], g.offset[1], g.offset[2]).applyQuaternion(_q));
  }
}
