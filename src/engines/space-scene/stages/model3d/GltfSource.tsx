/**
 * Loads a topic's glb (drei useGLTF) and hands back a PartShape per named
 * mesh. Lazy-loaded: only topics with `mesh` parts pay for the GLTF loader.
 * Draco/meshopt decoders are off on purpose: drei fetches the Draco decoder
 * from a CDN, and Atlas makes no runtime network requests (export glbs
 * uncompressed or quantised instead).
 */
import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { Mesh, Quaternion, Vector3, type Object3D } from 'three';
import type { PartShape } from './PartNode';

function findMesh(node: Object3D | undefined): Mesh | null {
  if (!node) return null;
  if ((node as Mesh).isMesh) return node as Mesh;
  let found: Mesh | null = null;
  node.traverse((o) => {
    if (!found && (o as Mesh).isMesh) found = o as Mesh;
  });
  return found;
}

export default function GltfSource({
  url,
  meshes,
  onShapes,
}: {
  url: string;
  /** part id -> mesh (node) name in the glb */
  meshes: ReadonlyMap<string, string>;
  onShapes(shapes: Map<string, PartShape>): void;
}) {
  const gltf = useGLTF(url, false, false) as unknown as { scene: Object3D };
  useEffect(() => {
    gltf.scene.updateMatrixWorld(true);
    const out = new Map<string, PartShape>();
    for (const [partId, name] of meshes) {
      const mesh = findMesh(gltf.scene.getObjectByName(name));
      if (!mesh) {
        console.warn(`[atlas] space-scene: mesh "${name}" (part "${partId}") not found in ${url}`);
        continue;
      }
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();
      mesh.matrixWorld.decompose(position, quaternion, scale);
      mesh.geometry.computeBoundingSphere();
      const sphere = mesh.geometry.boundingSphere;
      const maxScale = Math.max(scale.x, scale.y, scale.z);
      out.set(partId, {
        pieces: [{ geometry: mesh.geometry, matrices: null }],
        position: [position.x, position.y, position.z],
        quaternion,
        scale,
        radius: (sphere?.radius ?? 0.5) * maxScale,
        closed: true,
        twoSided: false,
      });
    }
    onShapes(out);
  }, [gltf, meshes, url, onShapes]);
  return null;
}
