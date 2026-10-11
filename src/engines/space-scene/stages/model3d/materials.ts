/**
 * Part material: MeshStandardMaterial with a small shader patch shared by
 * every part. Every family uses the same feature set (roughness map + normal
 * map), so all parts share one shader program per render state (opaque /
 * x-ray transparent / cut): few compiles, also on software WebGL.
 *
 *  - selection edge: a fresnel rim plus a faint tint in the signal colour,
 *    driven by `uSel` (0..1). Works for instanced pieces, costs no draw call.
 *  - machined cut face (perf-lessons §9): with a cutaway plane the material is
 *    double-sided; back faces (only visible through the cut on closed parts)
 *    are flat-filled in the `--cut` ochre with a 45° screen-space hatch in
 *    ink, so the section reads like a museum cutaway, not a deleted half.
 *  - muscle contraction (docs/16 §6.4, lib/rig.ts): glb muscles carry `_U`
 *    (0 at the origin → 1 at the insertion) and `_FIBRE` (unit fibre
 *    direction) per vertex; `uContract` shortens the muscle along its fibres
 *    toward the middle and swells its belly along the normal, before skinning
 *    (three adds the skinning chunks itself for skinned meshes, after ours, so
 *    the cut, x-ray fade and selection work on skinned parts unchanged); faint
 *    signal stripes (`uStripe` ≤ .35) move along `_U` while it works.
 *  - highlight tint (`uHi`): the base colour mixed toward the signal or cold
 *    colour (exercise mode's prime movers / synergists).
 */
import { Color, DoubleSide, FrontSide, MeshStandardMaterial, type Plane } from 'three';
import type { MaterialLook } from '../../lib/color';
import type { TextureKit } from './textures';
import { DEFAULT_BULGE, MAX_SHORTEN } from '../../lib/rig';

export interface PartUniforms {
  uContract: { value: number };
  /** Muscle length (origin → insertion, local units) and belly thickness. */
  uLen: { value: number };
  uThick: { value: number };
  uShorten: { value: number };
  uBulge: { value: number };
  uStripe: { value: number };
  uTime: { value: number };
  uHi: { value: number };
  uHiColor: { value: Color };
  uSel: { value: number };
  uSelColor: { value: Color };
  uSelRim: { value: number };
  uSelTint: { value: number };
  uCut: { value: number };
  uCutColor: { value: Color };
  uHatchColor: { value: Color };
  uHatchPx: { value: number };
}

const VERTEX_DECLS = /* glsl */ `
uniform float uContract;
uniform float uLen;
uniform float uThick;
uniform float uShorten;
uniform float uBulge;
attribute float atlasU;
attribute vec3 atlasFibre;
varying float vAtlasU;
`;

const CONTRACT = /* glsl */ `
#include <begin_vertex>
vAtlasU = atlasU;
if (uContract > 0.0001) {
  float u = clamp(atlasU, 0.0, 1.0);
  transformed -= atlasFibre * (u - 0.5) * uLen * uShorten * uContract;
  transformed += normal * sin(3.14159265 * u) * uThick * uBulge * uContract;
}
`;

const FRAGMENT_DECLS = /* glsl */ `
uniform float uStripe;
uniform float uTime;
uniform float uHi;
uniform vec3 uHiColor;
varying float vAtlasU;
uniform float uSel;
uniform vec3 uSelColor;
uniform float uSelRim;
uniform float uSelTint;
uniform float uCut;
uniform vec3 uCutColor;
uniform vec3 uHatchColor;
uniform float uHatchPx;
`;

const CUT_FACE = /* glsl */ `
#include <clipping_planes_fragment>
if (uCut > 0.5 && !gl_FrontFacing) {
  float d = (gl_FragCoord.x + gl_FragCoord.y) / uHatchPx;
  float f = abs(fract(d) - 0.5) * uHatchPx * 0.7071;
  float line = 1.0 - smoothstep(0.35, 1.1, f);
  gl_FragColor = vec4(mix(uCutColor, uHatchColor, line * 0.55), opacity);
  #include <colorspace_fragment>
  return;
}
`;

const TINT = /* glsl */ `
#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, uHiColor, uHi);
if (uStripe > 0.001) {
  float w = fract(vAtlasU * 7.0 - uTime * 0.8);
  float band = smoothstep(0.0, 0.16, w) * (1.0 - smoothstep(0.2, 0.42, w));
  diffuseColor.rgb = mix(diffuseColor.rgb, uSelColor, band * uStripe);
}
`;

const SELECTION = /* glsl */ `
#include <emissivemap_fragment>
if (uSel > 0.001) {
  float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
  float rim = pow(1.0 - facing, 2.5);
  totalEmissiveRadiance += uSelColor * uSel * (uSelRim * rim + uSelTint);
}
`;

export interface PartMaterial {
  material: MeshStandardMaterial;
  uniforms: PartUniforms;
}

export function createPartMaterial(): PartMaterial {
  const uniforms: PartUniforms = {
    uContract: { value: 0 },
    uLen: { value: 0 },
    uThick: { value: 0 },
    uShorten: { value: MAX_SHORTEN },
    uBulge: { value: DEFAULT_BULGE },
    uStripe: { value: 0 },
    uTime: { value: 0 },
    uHi: { value: 0 },
    uHiColor: { value: new Color() },
    uSel: { value: 0 },
    uSelColor: { value: new Color() },
    uSelRim: { value: 1 },
    uSelTint: { value: 0.05 },
    uCut: { value: 0 },
    uCutColor: { value: new Color() },
    uHatchColor: { value: new Color() },
    uHatchPx: { value: 7 },
  };
  // Single pass also when double-sided + transparent (x-ray), perf-lessons §4.
  const material = new MeshStandardMaterial({ clipShadows: true, forceSinglePass: true });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = VERTEX_DECLS + shader.vertexShader.replace('#include <begin_vertex>', CONTRACT);
    shader.fragmentShader = FRAGMENT_DECLS + shader.fragmentShader
      .replace('#include <clipping_planes_fragment>', CUT_FACE)
      .replace('#include <color_fragment>', TINT)
      .replace('#include <emissivemap_fragment>', SELECTION);
  };
  material.customProgramCacheKey = () => 'atlas-part-2';
  return { material, uniforms };
}

export interface PartStyle {
  look: MaterialLook;
  kit: TextureKit;
  /** Theme accent for the selection edge, cut ochre, hatch ink (sRGB hex); `cold` tints synergists. */
  signal: string;
  cold: string;
  cut: string;
  ink: string;
  /** Selection rim strength (paper: crisp ink-like edge; dark plate: ≤ .35 glow). */
  rim: number;
  tint: number;
  /** Device pixels between hatch lines. */
  hatchPx: number;
}

/** Apply a family look and the theme colours (flags a recompile only when the feature set changes). */
export function stylePartMaterial({ material, uniforms }: PartMaterial, s: PartStyle): void {
  const { look, kit } = s;
  material.color.set(look.color);
  material.metalness = look.metalness;
  material.roughness = look.roughness;
  material.envMapIntensity = look.envIntensity;
  const rough = kit.roughness(look.finish);
  const normal = kit.normal(look.finish);
  const changed = material.roughnessMap !== rough || material.normalMap !== normal;
  material.roughnessMap = rough;
  material.normalMap = normal;
  // Orange peel on powder coat (and a trace on chitin), facets / fibres / rings on organisms; the rest keep the map at zero strength.
  material.normalScale.set(look.normal, look.normal);
  // Soft tissue: a little self-light in its own colour reads as light scattered under the surface.
  material.emissive.set(look.color).multiplyScalar(look.glow);
  uniforms.uSelColor.value.set(s.signal);
  uniforms.uSelRim.value = s.rim;
  uniforms.uSelTint.value = s.tint;
  uniforms.uCutColor.value.set(s.cut);
  uniforms.uHatchColor.value.set(s.ink);
  uniforms.uHatchPx.value = s.hatchPx;
  if (changed) material.needsUpdate = true;
}

/** Clip by the cutaway plane; closed parts fill their cut face (double-sided membranes never: their back is a face, not a section). */
export function setPartClipping({ material, uniforms }: PartMaterial, clipping: Plane[] | null, closed: boolean, twoSided: boolean): void {
  material.clippingPlanes = clipping;
  const side = clipping || twoSided ? DoubleSide : FrontSide;
  if (material.side !== side) {
    material.side = side;
    material.needsUpdate = true;
  }
  uniforms.uCut.value = clipping && closed ? 1 : 0;
}
