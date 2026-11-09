import type { Material } from 'three';

/** Exact-skin highlights use the same skinned vertices as the mannequin. A
 * negative polygon bias resolves coplanar depth at both beat and detail scales. */
export function applyExerciseMaskDepth(material: Material, mask: boolean): void {
  material.polygonOffset = mask;
  material.polygonOffsetFactor = mask ? -1 : 0;
  material.polygonOffsetUnits = mask ? -4 : 0;
}

/** Stabilisers and unused muscles must not leave context-grey skin patches. */
export function exerciseMaskVisible(mask: boolean, tint: string | null): boolean {
  return !mask || tint !== null;
}
