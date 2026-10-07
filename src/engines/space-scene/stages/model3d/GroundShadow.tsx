/**
 * Soft radial "contact" shadow under the object (a single quad with a tiny
 * shader; no shadow maps). Grounds the model in both themes.
 */
import { useEffect, useMemo } from 'react';
import { Color, PlaneGeometry, ShaderMaterial } from 'three';
import type { StageLook } from './look';
import { r3f } from './extend';
import { resolveDataColor } from '../../lib/color';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.0, 1.0, d));
  gl_FragColor = vec4(uColor, a * a * uStrength);
  #include <colorspace_fragment>
}
`;

export function GroundShadow({ y, radius, look }: { y: number; radius: number; look: StageLook }) {
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uColor: { value: new Color() }, uStrength: { value: 0.2 } },
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useEffect(() => {
    const cinema = look.theme === 'cinema';
    material.uniforms.uColor!.value = new Color(cinema ? '#000000' : resolveDataColor('token:ink', look.tokens, look.theme));
    material.uniforms.uStrength!.value = cinema ? 0.55 : 0.18;
  }, [material, look]);
  return (
    <mesh
      geometry={r3f(geometry)}
      material={r3f(material)}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, y, 0]}
      scale={[radius * 2.4, radius * 2.4, 1]}
      renderOrder={-1}
      dispose={null}
      raycast={() => {}}
    />
  );
}
