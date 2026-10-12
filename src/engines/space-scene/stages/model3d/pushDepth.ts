/**
 * Pushed depth for the exercise body (Mannequin.tsx, WireBody.tsx): a
 * material that writes / tests its depth `metres` further from the camera
 * than it is drawn (colour and outline stay where they are). The figure's
 * near-side muscles, a few centimetres under the skin, then pass the depth
 * test and draw over it, while what lies behind the body stays hidden.
 */
import type { Material } from 'three';

/** How far the figure's depth is pushed back (metres): deeper than the region's muscles lie under the skin, shallower than a limb. */
export const PUSH = 0.06;

/** Patch `material` to push its depth `metres` back (one program per distance). */
export function pushDepth<T extends Material>(material: T, metres: number = PUSH): T {
  const chunk = /* glsl */ `
#include <project_vertex>
{
  vec4 atlasPushed = projectionMatrix * vec4(mvPosition.xy, mvPosition.z - ${metres.toFixed(4)}, 1.0);
  gl_Position.z = atlasPushed.z / atlasPushed.w * gl_Position.w;
}
`;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', chunk);
  };
  material.customProgramCacheKey = () => `atlas-push-${metres.toFixed(4)}`;
  return material;
}
