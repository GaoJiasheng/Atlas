import { Box3, Matrix4, Vector3, type SkinnedMesh } from 'three';
import type { Vec3 } from '../../lib/math';

const box = new Box3();
const toModel = new Matrix4();
const vertex = new Vector3();

/** Sampled bounds in the model frame, relative to the part's outer position.
 * The label probe runs before PartNode: even the final, snapped pose needs a
 * following demand frame to project these newly measured coordinates. */
export function updateSkinAnchor(
  mesh: SkinnedMesh,
  samples: readonly number[],
  root: Matrix4,
  position: Vector3,
  anchor: { point: Vec3; offset: Vec3; half: Vec3 },
  invalidate: () => void,
): void {
  mesh.updateWorldMatrix(true, false);
  box.makeEmpty();
  toModel.copy(root).invert().multiply(mesh.matrixWorld);
  for (const i of samples) box.expandByPoint(mesh.getVertexPosition(i, vertex).applyMatrix4(toModel));
  if (box.isEmpty()) return;
  for (let i = 0; i < 3; i++) {
    anchor.point[i] = anchor.offset[i] = (box.min.getComponent(i) + box.max.getComponent(i)) / 2 - position.getComponent(i);
    anchor.half[i] = (box.max.getComponent(i) - box.min.getComponent(i)) / 2;
  }
  invalidate();
}
