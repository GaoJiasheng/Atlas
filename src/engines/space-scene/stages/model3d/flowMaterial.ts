/**
 * Particle material for flows: a hand-written ShaderMaterial. Each particle
 * carries a start offset along the path; the vertex shader advances it by
 * `uTime * uSpeed / uLength`, interpolates the baked arc-length samples of the
 * Catmull-Rom curve (64–512 of them in a 1-row float texture, read with
 * `texelFetch`), takes its colour from the flow's colour
 * stops at that fraction (linear RGB, up to MAX_STOPS) and attenuates point
 * size with distance. Open paths fade in / out at their ends unless the flow
 * is `ends: open` (segments laid end to end). Supports clipping planes
 * (cutaway) like the part materials.
 */
import { AdditiveBlending, Color, DataTexture, FloatType, NearestFilter, NormalBlending, RGBAFormat, ShaderMaterial } from 'three';
import type { BakedFlow } from '../../lib/flow-curve';

/** Colour stops the shader interpolates (schema MAX_FLOW_STOPS). */
export const MAX_STOPS = 6;

const vertexShader = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>

uniform sampler2D uPath;
uniform float uCount;
uniform float uTime;
uniform float uSpeed;
uniform float uLength;
uniform float uClosed;
uniform float uOpen;
uniform float uSize;
uniform float uScale;
uniform float uStopAt[MAX_STOPS];
uniform vec3 uStopColor[MAX_STOPS];
uniform float uStopCount;

attribute float aOffset;
attribute float aSeed;

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
  float u = fract(aOffset + uTime * uSpeed / max(uLength, 1e-4));
  float x = u * (uCount - 1.0);
  float fi = min(floor(x), uCount - 2.0);
  int i = int(fi);
  float f = x - fi;
  // \`position\` holds a small per-particle jitter around the centre line.
  vec3 p = mix(texelFetch(uPath, ivec2(i, 0), 0).xyz, texelFetch(uPath, ivec2(i + 1, 0), 0).xyz, f) + position;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * (0.7 + 0.6 * aSeed) * uScale / max(-mvPosition.z, 0.05);
  vAlpha = uClosed > 0.5 || uOpen > 0.5 ? 1.0 : smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
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
    uCount: { value: number };
    uTime: { value: number };
    uSpeed: { value: number };
    uLength: { value: number };
    uClosed: { value: number };
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

/** The baked samples as a `count` × 1 RGBA float texture (xyz, nearest: the shader interpolates). */
function pathTexture(baked: BakedFlow): DataTexture {
  const data = new Float32Array(baked.count * 4);
  for (let i = 0; i < baked.count; i++) data.set(baked.points.subarray(i * 3, i * 3 + 3), i * 4);
  const tex = new DataTexture(data, baked.count, 1, RGBAFormat, FloatType);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** Disposing the material also disposes its path texture. */
export function createFlowMaterial(baked: BakedFlow, speed: number, open: boolean): FlowMaterial {
  const path = pathTexture(baked);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: { MAX_STOPS },
    uniforms: {
      uPath: { value: path },
      uCount: { value: baked.count },
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uLength: { value: baked.length },
      uClosed: { value: baked.closed ? 1 : 0 },
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

/** Theme look; `size` multiplies the theme's particle size (flow `size`). */
export function styleFlowMaterial(material: FlowMaterial, cinema: boolean, size = 1): void {
  const blending = cinema ? AdditiveBlending : NormalBlending;
  if (material.blending !== blending) {
    material.blending = blending;
    material.needsUpdate = true;
  }
  material.uniforms.uCore.value = cinema ? 0.55 : 0;
  material.uniforms.uSize.value = (cinema ? 0.03 : 0.024) * size;
}
