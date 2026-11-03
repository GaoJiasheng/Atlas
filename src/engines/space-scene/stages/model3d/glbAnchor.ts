import { Vector3, type Object3D } from 'three';
import type { Box3Like } from '../../lib/parts';
import type { Vec3 } from '../../lib/math';

/**
 * A glb node's opt-in leader-label point: `extras.labelPoint`, three numbers in
 * the node's local frame, returned at rest in scene coordinates. The extras sit
 * on the mesh, or on its parent node when the glb node holds several
 * primitives (the same two places `extras.closed` is read from). Null without
 * a well-formed point: the leader keeps the bounds centre.
 */
export function glbLabelPoint(mesh: Object3D): [number, number, number] | null {
  const owner = [mesh, mesh.parent].find((o) => o && o.userData.labelPoint !== undefined);
  const p = owner?.userData.labelPoint as unknown;
  if (!owner || !Array.isArray(p) || p.length !== 3 || !p.every((v) => typeof v === 'number' && Number.isFinite(v))) return null;
  owner.updateWorldMatrix(true, false);
  const v = new Vector3(p[0], p[1], p[2]).applyMatrix4(owner.matrixWorld);
  return [v.x, v.y, v.z];
}

/**
 * Label anchor fields from a glb part's measured rest bounds, relative to its
 * centre `at`: the bounds centre (`offset`, the on-screen box), the leader's
 * end (`point`: the bounds centre, or the node's `labelPoint`), half extents
 * and a rough radius.
 */
export function boxAnchor(
  box: Box3Like,
  at: readonly number[],
  labelPoint?: readonly number[],
): { offset: Vec3; point: Vec3; half: Vec3; radius: number } {
  const offset: Vec3 = [(box.min[0] + box.max[0]) / 2 - at[0]!, (box.min[1] + box.max[1]) / 2 - at[1]!, (box.min[2] + box.max[2]) / 2 - at[2]!];
  const half: Vec3 = [(box.max[0] - box.min[0]) / 2, (box.max[1] - box.min[1]) / 2, (box.max[2] - box.min[2]) / 2];
  const point: Vec3 = labelPoint ? [labelPoint[0]! - at[0]!, labelPoint[1]! - at[1]!, labelPoint[2]! - at[2]!] : offset;
  return { offset, point, half, radius: Math.hypot(half[0], half[1], half[2]) * 0.75 };
}
