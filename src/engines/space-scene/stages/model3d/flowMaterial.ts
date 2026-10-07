/**
 * Particle material for flows: a hand-written ShaderMaterial. Each particle
 * carries a start offset along the path; the vertex shader advances it by
 * `uTime * uSpeed / uLength`, interpolates the baked arc-length samples of the
 * Catmull-Rom curve (uniform array) and attenuates point size with distance.
 * Supports clipping planes (cutaway) like the part materials.
 */
import { AdditiveBlending, Color, NormalBlending, ShaderMaterial, Vector3 } from 'three';
import { FLOW_SAMPLES, type BakedFlow } from '../../lib/flow-curve';

const vertexShader = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>

uniform vec3 uPoints[SAMPLES];
uniform float uTime;
uniform float uSpeed;
uniform float uLength;
uniform float uClosed;
uniform float uSize;
uniform float uScale;

attribute float aOffset;
attribute float aSeed;

varying float vAlpha;

void main() {
  float u = fract(aOffset + uTime * uSpeed / max(uLength, 1e-4));
  float x = u * float(SAMPLES - 1);
  int i = int(min(floor(x), float(SAMPLES - 2)));
  float f = x - float(i);
  // \`position\` holds a small per-particle jitter around the centre line.
  vec3 p = mix(uPoints[i], uPoints[i + 1], f) + position;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * (0.7 + 0.6 * aSeed) * uScale / max(-mvPosition.z, 0.05);
  vAlpha = uClosed > 0.5 ? 1.0 : smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.92, 1.0, u));
  #include <clipping_planes_vertex>
}
`;

const fragmentShader = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>

uniform vec3 uColor;
uniform float uOpacity;
uniform float uCore;

varying float vAlpha;

void main() {
  #include <clipping_planes_fragment>
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, d);
  float core = smoothstep(0.25, 0.0, d) * uCore;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), soft * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;

export type FlowMaterial = ShaderMaterial & {
  uniforms: {
    uPoints: { value: Vector3[] };
    uTime: { value: number };
    uSpeed: { value: number };
    uLength: { value: number };
    uClosed: { value: number };
    uSize: { value: number };
    uScale: { value: number };
    uColor: { value: Color };
    uOpacity: { value: number };
    uCore: { value: number };
  };
};

export function createFlowMaterial(baked: BakedFlow, speed: number): FlowMaterial {
  const points = Array.from({ length: FLOW_SAMPLES }, (_, i) => {
    const j = Math.min(i, baked.count - 1) * 3;
    return new Vector3(baked.points[j], baked.points[j + 1], baked.points[j + 2]);
  });
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: { SAMPLES: FLOW_SAMPLES },
    uniforms: {
      uPoints: { value: points },
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uLength: { value: baked.length },
      uClosed: { value: baked.closed ? 1 : 0 },
      uSize: { value: 0.06 },
      uScale: { value: 500 },
      uColor: { value: new Color() },
      uOpacity: { value: 0 },
      uCore: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    clipping: true,
  }) as FlowMaterial;
}

export function styleFlowMaterial(material: FlowMaterial, cinema: boolean): void {
  const blending = cinema ? AdditiveBlending : NormalBlending;
  if (material.blending !== blending) {
    material.blending = blending;
    material.needsUpdate = true;
  }
  material.uniforms.uCore.value = cinema ? 0.55 : 0;
  material.uniforms.uSize.value = cinema ? 0.075 : 0.06;
}
