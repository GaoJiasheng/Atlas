/**
 * Particle material for flows: a hand-written ShaderMaterial. A flow has one
 * path or several (`paths`, ≤ MAX_FLOW_PATHS, one draw call): each path's
 * baked arc-length samples of its Catmull-Rom curve (64–512) are one row of a
 * float texture read with `texelFetch`. Each particle carries its path index
 * and a start offset along it; the vertex shader advances it by the path's
 * phase (`uPhase[k]`, the fraction of the path travelled so far, kept by
 * Flows.tsx so a path can change speed or direction without jumping),
 * interpolates the samples, takes its colour from the flow's colour stops at
 * that fraction (linear RGB, up to MAX_STOPS), fades with the path's
 * `uAlpha[k]`, shows only while its rank on the path (`aRank`, spread evenly
 * over the path) is below the path's `uShare[k]` (density: an energy share;
 * 1 otherwise) and attenuates point size with distance. Open paths fade in /
 * out at their ends unless the flow is `ends: open` (segments laid end to
 * end). Supports clipping planes (cutaway) like the part materials.
 */
import { AdditiveBlending, Color, DataTexture, FloatType, NearestFilter, NormalBlending, RGBAFormat, ShaderMaterial } from 'three';
import { MAX_FLOW_PATHS, type BakedFlow } from '../../lib/flow-curve';

/** Colour stops the shader interpolates (schema MAX_FLOW_STOPS). */
export const MAX_STOPS = 6;

const vertexShader = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>

uniform sampler2D uPath;
uniform float uCount[MAX_PATHS];
uniform float uPhase[MAX_PATHS];
uniform float uAlpha[MAX_PATHS];
uniform float uShare[MAX_PATHS];
uniform float uClosed[MAX_PATHS];
uniform float uOpen;
uniform float uSize;
uniform float uScale;
uniform float uStopAt[MAX_STOPS];
uniform vec3 uStopColor[MAX_STOPS];
uniform float uStopCount;

attribute float aOffset;
attribute float aSeed;
attribute float aPath;
attribute float aRank;

varying float vAlpha;
varying vec3 vColor;

// Stops ascend in \`at\`: walking them, every passed stop takes over and the next one mixes in.
vec3 stopColor(float u) {
  vec3 c = uStopColor[0];
  for (int k = 1; k < MAX_STOPS; k++) {
    if (float(k) >= uStopCount) break;
    float a0 = uStopAt[k - 1];
    float t = clamp((u - a0) / max(uStopAt[k] - a0, 1e-5), 0.0, 1.0);
    c = mix(c, uStopColor[k], t);
  }
  return c;
}

void main() {
  int k = int(aPath + 0.5);
  float u = fract(aOffset + uPhase[k]);
  float n = uCount[k];
  float x = u * (n - 1.0);
  float fi = min(floor(x), n - 2.0);
  int i = int(fi);
  float f = x - fi;
  // \`position\` holds a small per-particle jitter around the centre line.
  vec3 p = mix(texelFetch(uPath, ivec2(i, k), 0).xyz, texelFetch(uPath, ivec2(i + 1, k), 0).xyz, f) + position;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * (0.7 + 0.6 * aSeed) * uScale / max(-mvPosition.z, 0.05);
  // Density (an energy share): only the particles ranked below the path's share are on show.
  float shown = aRank < uShare[k] ? 1.0 : 0.0;
  vAlpha = (uClosed[k] > 0.5 || uOpen > 0.5 ? 1.0 : smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u))) * uAlpha[k] * shown;
  vColor = stopColor(u);
  #include <clipping_planes_vertex>
}
`;

const fragmentShader = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>

uniform float uOpacity;
uniform float uCore;

varying float vAlpha;
varying vec3 vColor;

void main() {
  #include <clipping_planes_fragment>
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, d);
  float core = smoothstep(0.25, 0.0, d) * uCore;
  gl_FragColor = vec4(mix(vColor, vec3(1.0), core), soft * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;

export type FlowMaterial = ShaderMaterial & {
  uniforms: {
    uPath: { value: DataTexture };
    uCount: { value: number[] };
    uPhase: { value: number[] };
    uAlpha: { value: number[] };
    uShare: { value: number[] };
    uClosed: { value: number[] };
    uOpen: { value: number };
    uSize: { value: number };
    uScale: { value: number };
    uStopAt: { value: number[] };
    uStopColor: { value: Color[] };
    uStopCount: { value: number };
    uOpacity: { value: number };
    uCore: { value: number };
  };
};

/** The baked samples, one path per row, as a (longest path) × paths RGBA float texture (xyz, nearest: the shader interpolates). */
function pathTexture(paths: readonly BakedFlow[]): DataTexture {
  const width = Math.max(...paths.map((b) => b.count));
  const data = new Float32Array(width * paths.length * 4);
  paths.forEach((baked, row) => {
    for (let i = 0; i < baked.count; i++) data.set(baked.points.subarray(i * 3, i * 3 + 3), (row * width + i) * 4);
  });
  const tex = new DataTexture(data, width, paths.length, RGBAFormat, FloatType);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** Disposing the material also disposes its path texture. Phases and fades start at 0 / 1 (Flows.tsx drives them). */
export function createFlowMaterial(paths: readonly BakedFlow[], open: boolean): FlowMaterial {
  const path = pathTexture(paths);
  const per = (f: (b: BakedFlow) => number) => Array.from({ length: MAX_FLOW_PATHS }, (_, k) => (paths[k] ? f(paths[k]!) : 0));
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: { MAX_STOPS, MAX_PATHS: MAX_FLOW_PATHS },
    uniforms: {
      uPath: { value: path },
      uCount: { value: per((b) => b.count) },
      uPhase: { value: per(() => 0) },
      uAlpha: { value: per(() => 1) },
      uShare: { value: per(() => 1) },
      uClosed: { value: per((b) => (b.closed ? 1 : 0)) },
      uOpen: { value: open ? 1 : 0 },
      uSize: { value: 0.06 },
      uScale: { value: 500 },
      uStopAt: { value: Array.from({ length: MAX_STOPS }, () => 0) },
      uStopColor: { value: Array.from({ length: MAX_STOPS }, () => new Color()) },
      uStopCount: { value: 1 },
      uOpacity: { value: 0 },
      uCore: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    clipping: true,
  }) as FlowMaterial;
  material.addEventListener('dispose', () => path.dispose());
  return material;
}

/** Colour stops as `[at, sRGB hex]` (one stop = a single colour). */
export function setFlowStops(material: FlowMaterial, stops: readonly (readonly [number, string])[]): void {
  const u = material.uniforms;
  const n = Math.max(1, Math.min(MAX_STOPS, stops.length));
  for (let i = 0; i < MAX_STOPS; i++) {
    const [at, hex] = stops[Math.min(i, n - 1)] ?? [0, '#888888'];
    u.uStopAt.value[i] = at;
    u.uStopColor.value[i]!.set(hex);
  }
  u.uStopCount.value = n;
}

/**
 * Theme look; `size` multiplies the theme's particle size (flow `size`).
 * `flat` (flow `flat`, docs/40 §4.5): no glow on the dark plate either —
 * normal blending and no white core, so a dark colour stays dark (the two
 * reds of the blood read apart in both themes).
 */
export function styleFlowMaterial(material: FlowMaterial, cinema: boolean, size = 1, flat = false): void {
  const glow = cinema && !flat;
  const blending = glow ? AdditiveBlending : NormalBlending;
  if (material.blending !== blending) {
    material.blending = blending;
    material.needsUpdate = true;
  }
  material.uniforms.uCore.value = glow ? 0.55 : 0;
  material.uniforms.uSize.value = (cinema ? 0.03 : 0.024) * size;
}
