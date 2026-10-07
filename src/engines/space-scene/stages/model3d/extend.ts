/**
 * Register only the three.js classes the stage uses as JSX elements.
 * We drive R3F through `createRoot` (not `<Canvas>`), because `<Canvas>`
 * registers the entire THREE namespace and defeats tree-shaking (~50 KB gz).
 */
import { extend } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, Group, HemisphereLight, LineSegments, Mesh, Points } from 'three';

let done = false;

export function extendThree(): void {
  if (done) return;
  done = true;
  extend({ AmbientLight, DirectionalLight, Group, HemisphereLight, LineSegments, Mesh, Points });
}

/**
 * Type bridge for three.js objects handed to R3F JSX props / taken from
 * `useThree()`. R3F's element types come from whichever `@types/three`
 * TypeScript resolves next to `@react-three/fiber`; the current install has a
 * stale hoisted copy (0.186) there while the app uses 0.180, so identical
 * runtime objects have incompatible static types. Remove once a clean
 * `pnpm install` hoists a single @types/three.
 */
export const r3f = (value: unknown): never => value as never;
