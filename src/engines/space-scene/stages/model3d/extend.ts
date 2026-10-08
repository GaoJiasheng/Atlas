/**
 * Register only the three.js classes the stage uses as JSX elements.
 * We drive R3F through `createRoot` (not `<Canvas>`), because `<Canvas>`
 * registers the entire THREE namespace and defeats tree-shaking (~50 KB gz).
 */
import { extend } from '@react-three/fiber';
import { DirectionalLight, Group, HemisphereLight, InstancedMesh, Mesh, Points } from 'three';

let done = false;

export function extendThree(): void {
  if (done) return;
  done = true;
  extend({ DirectionalLight, Group, HemisphereLight, InstancedMesh, Mesh, Points });
}
