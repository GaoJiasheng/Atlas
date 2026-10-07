/**
 * Theme lighting. paper: warm hemisphere + soft warm key (matte, studio-paper
 * look). cinema: dim cool fill, cool key, accent-coloured rim and a warm kick
 * from below (metallic, dramatic). A procedural RoomEnvironment (no network,
 * no HDR files) gives metals something to reflect.
 */
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator, type Scene, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { resolveDataColor } from '../../lib/color';
import type { StageLook } from './look';

function Environment({ intensity }: { intensity: number }) {
  const gl = useThree((s) => s.gl) as unknown as WebGLRenderer;
  const scene = useThree((s) => s.scene) as unknown as Scene;
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.traverse((o) => {
        const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } };
        m.geometry?.dispose();
        m.material?.dispose();
      });
    };
  }, [gl, scene, invalidate]);
  useEffect(() => {
    scene.environmentIntensity = intensity;
    invalidate();
  }, [scene, intensity, invalidate]);
  return null;
}

export function Lighting({ look }: { look: StageLook }) {
  const cinema = look.theme === 'cinema';
  const rim = useMemo(() => resolveDataColor('token:accent-2', look.tokens, look.theme, '#3dc6ff'), [look]);
  const warm = useMemo(() => resolveDataColor('token:accent-1', look.tokens, look.theme, '#ff6a3d'), [look]);
  return (
    <>
      <Environment intensity={cinema ? 0.9 : 0.45} />
      {cinema ? (
        <>
          <hemisphereLight args={['#8fb0d8', '#05070a', 0.35]} />
          <directionalLight color="#d8ecff" intensity={2.2} position={[4, 6, 5]} />
          <directionalLight color={rim} intensity={3.2} position={[-5, 2.5, -4]} />
          <directionalLight color={warm} intensity={0.7} position={[-2, -3, 4]} />
        </>
      ) : (
        <>
          <hemisphereLight args={['#fff3dc', '#b8a27a', 1.15]} />
          <directionalLight color="#ffe6bf" intensity={1.5} position={[3, 6, 4]} />
          <directionalLight color="#f3ead8" intensity={0.35} position={[-4, 2, -3]} />
        </>
      )}
    </>
  );
}
