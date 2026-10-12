/**
 * Where a foot meets the floor (docs/16 §6.5, standing exercises): the rig's
 * `ankle.l` / `ankle.r` bone carries two contact points — the back of the
 * heel and the ball of the foot — placed on the model's floor at rest and
 * turning with the ankle. Their sizes are a share of the ankle's height
 * above the floor (an adult foot: heel ~0.6 ×, ball ~1.6 × that height
 * behind / ahead of the ankle, along +Z, the way the body faces). Positions
 * are in the skeleton's frame (before the exercise's root turn).
 */
import { Vector3, type Object3D } from 'three';

export interface Foot {
  bone: Object3D;
  /** Heel and ball contact points in the bone's local frame. */
  heel: Vector3;
  ball: Vector3;
}

/** Heel behind and ball ahead of the ankle, as multiples of the ankle's height above the floor. */
export const HEEL_BACK = 0.6;
export const BALL_AHEAD = 1.6;

/** The foot of an ankle bone standing on the floor at `floor` (scene y, rest pose), or null. */
export function makeFoot(bone: Object3D | null, floor: number): Foot | null {
  if (!bone) return null;
  bone.updateWorldMatrix(true, false);
  const a = bone.getWorldPosition(new Vector3());
  const h = a.y - floor;
  if (!(h > 0.01)) return null;
  const heel = bone.worldToLocal(new Vector3(a.x, floor, a.z - HEEL_BACK * h));
  const ball = bone.worldToLocal(new Vector3(a.x, floor, a.z + BALL_AHEAD * h));
  return { bone, heel, ball };
}

/** The heel and ball now (skeleton frame). World matrices must be current. */
export function footPoints(f: Foot, heel: Vector3, ball: Vector3): void {
  heel.copy(f.heel).applyMatrix4(f.bone.matrixWorld);
  ball.copy(f.ball).applyMatrix4(f.bone.matrixWorld);
}
