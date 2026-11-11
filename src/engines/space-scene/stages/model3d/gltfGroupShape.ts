/**
 * Opt-in rigid multi-surface GLB parts: a node with `atlasSurfaceGroup: true`
 * gets one render item per source mesh, so each surface keeps its own
 * transparent sorting and depth policy. A source mesh drawn with
 * `EXT_mesh_gpu_instancing` stays one instanced item: its copies become the
 * piece's matrices (and colours), in the first mesh's frame. Every other node
 * is returned as is.
 */
import { Box3, Matrix4, Vector3, type InstancedMesh, type Mesh, type Object3D } from 'three';
import type { PartShape } from './PartNode';
import { gltfSurface } from './GltfSource';

export function gltfGroupShape(root: Object3D, first: Mesh, shape: PartShape): PartShape {
  if (root.userData.atlasSurfaceGroup !== true) return shape;
  const meshes: Mesh[] = [];
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh);
  });
  const surfaces = meshes.map((m) => gltfSurface(m));
  if (meshes.some((m) => (m as { isSkinnedMesh?: boolean }).isSkinnedMesh) || surfaces.some((s) => !s)) {
    throw new Error('atlasSurfaceGroup requires rigid atlasSurface meshes');
  }
  const inverse = first.matrixWorld.clone().invert();
  const bounds = new Box3();
  const box = new Box3();
  const pieces = meshes.map((mesh, slot) => {
    const matrix = inverse.clone().multiply(mesh.matrixWorld);
    const geometry = mesh.geometry.clone();
    geometry.userData.atlasGroupClone = true;
    if ((mesh as InstancedMesh).isInstancedMesh) {
      const copies = mesh as InstancedMesh;
      geometry.computeBoundingBox();
      const matrices = Array.from({ length: copies.count }, (_, i) => {
        const m = new Matrix4();
        copies.getMatrixAt(i, m);
        return matrix.clone().multiply(m);
      });
      for (const m of matrices) bounds.union(box.copy(geometry.boundingBox!).applyMatrix4(first.matrixWorld.clone().multiply(m)));
      const colors = copies.instanceColor ? Float32Array.from(copies.instanceColor.array as ArrayLike<number>) : undefined;
      return { geometry, matrices, slot, ...(colors ? { colors } : {}) };
    }
    // Meshes sharing a frame skip this: it would normalise and re-quantise integer normals.
    if (!matrix.elements.every((value, i) => Math.abs(value - (i % 5 === 0 ? 1 : 0)) < 1e-10)) geometry.applyMatrix4(matrix);
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox!.clone().applyMatrix4(first.matrixWorld));
    return { geometry, matrices: null, slot };
  });
  const size = bounds.getSize(new Vector3());
  return {
    ...shape,
    pieces,
    surfaces: surfaces as NonNullable<PartShape['surface']>[],
    radius: size.length() / 2,
    box: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  } as PartShape;
}
