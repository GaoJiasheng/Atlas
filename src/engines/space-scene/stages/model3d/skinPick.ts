/**
 * Picking and label occlusion on skinned parts. three's own skinned raycast
 * skins every vertex of every triangle it tests, per ray, and the plain mesh
 * raycast tests the unskinned (bind-space) geometry, which is in the wrong
 * place. Instead each skinned part keeps a proxy: its vertices skinned once
 * per bone pose (`epoch`, the stage's bone-motion counter) into a plain
 * geometry, raycast like any mesh with the part's current world matrix, hits
 * reported on the skinned mesh itself (so R3F's handlers fire on the part).
 */
import { BufferAttribute, BufferGeometry, Mesh, Vector3, type Intersection, type Raycaster, type SkinnedMesh } from 'three';

const _v = new Vector3();
const cache = new WeakMap<SkinnedMesh, (raycaster: Raycaster, intersects: Intersection[]) => void>();

export function skinnedRaycast(mesh: SkinnedMesh, epoch: () => number): (raycaster: Raycaster, intersects: Intersection[]) => void {
  const hit = cache.get(mesh);
  if (hit) return hit;
  const geometry = new BufferGeometry();
  if (mesh.geometry.index) geometry.setIndex(mesh.geometry.index);
  const proxy = new Mesh(geometry, mesh.material);
  let at = Number.NaN;
  const raycast = (raycaster: Raycaster, intersects: Intersection[]) => {
    const e = epoch();
    if (e !== at) {
      at = e;
      const src = mesh.geometry.getAttribute('position');
      let dst = geometry.getAttribute('position') as BufferAttribute | undefined;
      if (!dst || dst.count !== src.count) geometry.setAttribute('position', (dst = new BufferAttribute(new Float32Array(src.count * 3), 3)));
      for (let i = 0; i < src.count; i++) {
        mesh.getVertexPosition(i, _v);
        dst.setXYZ(i, _v.x, _v.y, _v.z);
      }
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
    }
    proxy.material = mesh.material;
    proxy.matrixWorld.copy(mesh.matrixWorld);
    const start = intersects.length;
    proxy.raycast(raycaster, intersects);
    for (let i = start; i < intersects.length; i++) intersects[i]!.object = mesh;
  };
  cache.set(mesh, raycast);
  return raycast;
}
