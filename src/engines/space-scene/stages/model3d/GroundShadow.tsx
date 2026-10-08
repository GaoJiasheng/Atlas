/**
 * Ground under the model: a soft radial contact shadow (one quad, tiny
 * shader) plus a shadow-catcher plane for the key light's soft shadow. Both
 * are transparent so the paper shows through, and follow the model's floor
 * as it explodes.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, PlaneGeometry, ShaderMaterial, ShadowMaterial, type Group } from 'three';
import type { StageLook } from './look';
import type { StageRuntime } from './runtime';
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
  float a = 1.0 - smoothstep(0.0, 1.0, d);
  gl_FragColor = vec4(uColor, a * a * uStrength);
  #include <colorspace_fragment>
}
`;

export function GroundShadow({
  floor,
  radius,
  look,
  runtime,
}: {
  /** Floor height assembled / fully exploded. */
  floor: [number, number];
  radius: number;
  look: StageLook;
  runtime: StageRuntime;
}) {
  const group = useRef<Group>(null);
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const blob = useMemo(
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
  const catcher = useMemo(() => new ShadowMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(
    () => () => {
      geometry.dispose();
      blob.dispose();
      catcher.dispose();
    },
    [geometry, blob, catcher],
  );
  useEffect(() => {
    const cinema = look.theme === 'cinema';
    const ink = new Color(cinema ? '#000000' : resolveDataColor('token:ink', look.tokens, look.theme));
    blob.uniforms.uColor!.value = ink;
    blob.uniforms.uStrength!.value = cinema ? 0.6 : 0.26;
    catcher.color.copy(ink);
    catcher.opacity = cinema ? 0.42 : 0.16;
  }, [blob, catcher, look]);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const y = floor[0] + (floor[1] - floor[0]) * runtime.explode;
    if (g.position.y !== y) g.position.y = y;
  });
  return (
    <group ref={group} position={[0, floor[0], 0]}>
      <mesh
        geometry={geometry}
        material={blob}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[radius * 2.2, radius * 2.2, 1]}
        renderOrder={-2}
        dispose={null}
        raycast={() => {}}
      />
      <mesh
        geometry={geometry}
        material={catcher}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        scale={[radius * 5, radius * 5, 1]}
        renderOrder={-1}
        receiveShadow
        dispose={null}
        raycast={() => {}}
      />
    </group>
  );
}
