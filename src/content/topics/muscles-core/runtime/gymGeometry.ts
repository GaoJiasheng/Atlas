import { Float32BufferAttribute, type BufferGeometry, type Mesh } from 'three';

/** Expand KHR_mesh_quantization before baking world transforms. Writing metres
 * back into normalized Int16 attributes wraps tall uprights at ±1. */
export function gymGeometry(mesh: Mesh): BufferGeometry {
  mesh.updateWorldMatrix(true, false);
  const geometry = mesh.geometry.clone();
  for (const name of ['position', 'normal']) {
    const source = geometry.getAttribute(name);
    if (!source) continue;
    const values = new Float32Array(source.count * 3);
    for (let i = 0; i < source.count; i++) {
      values[i * 3] = source.getX(i);
      values[i * 3 + 1] = source.getY(i);
      values[i * 3 + 2] = source.getZ(i);
    }
    geometry.setAttribute(name, new Float32BufferAttribute(values, 3));
  }
  return geometry.applyMatrix4(mesh.matrixWorld);
}

/** Fit only the upper tower above the stack. Plates, selector pin, shoes and
 * seat retain their authored dimensions; the output wheel meets the cable. */
export function fitLatTower(geometry: BufferGeometry, pulleyHeight: number): BufferGeometry {
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const weight = Math.max(0, Math.min(1, (y - .70) / (2.05 - .70)));
    position.setY(i, y + (pulleyHeight - 2.11) * weight);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
