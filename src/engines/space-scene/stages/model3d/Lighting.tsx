/**
 * Product-photography lighting (master-spec F, perf-lessons §11): one large
 * soft key (warm-neutral, the only shadow caster), a weak fill, a neutral rim,
 * hemisphere + procedural RoomEnvironment (no network, no HDR files), ACES
 * filmic tone mapping (renderer). paper: matte warm key, fog = paper colour so
 * the model prints on the sheet. Dark plate: cooler key and a stronger rim.
 * No coloured lights.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Fog, PMREMGenerator, type DirectionalLight, type Scene, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { resolveDataColor } from '../../lib/color';
import { normalize3, type Vec3 } from '../../lib/math';
import type { StageLook } from './look';
import type { StageRuntime } from './runtime';

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

interface Rig {
  hemi: [string, string, number];
  key: [string, number];
  fill: [string, number];
  rim: [string, number];
  env: number;
  exposure: number;
}

const RIGS: Record<'paper' | 'cinema', Rig> = {
  paper: {
    hemi: ['#fff6e8', '#c9bea6', 0.75],
    key: ['#fff0dc', 2.6],
    fill: ['#e9edf0', 0.55],
    rim: ['#ffffff', 0.9],
    env: 0.7,
    exposure: 1.05,
  },
  cinema: {
    hemi: ['#aab4be', '#17181a', 0.35],
    key: ['#e9eff5', 2.4],
    fill: ['#c9d1d9', 0.28],
    rim: ['#f2f2f2', 1.15],
    env: 0.8,
    exposure: 1.0,
  },
};

const KEY_DIR: Vec3 = normalize3([0.55, 1, 0.7]);
const FILL_DIR: Vec3 = normalize3([-1, 0.35, 0.45]);
const RIM_DIR: Vec3 = normalize3([-1, 0.45, -0.7]);

export function Lighting({
  look,
  center,
  radius,
  runtime,
}: {
  look: StageLook;
  /** Model centre and bounding radius (key light and shadow camera are fitted to them). */
  center: Vec3;
  radius: number;
  runtime: StageRuntime;
}) {
  const rig = RIGS[look.theme === 'cinema' ? 'cinema' : 'paper'];
  const gl = useThree((s) => s.gl) as unknown as WebGLRenderer;
  const key = useRef<DirectionalLight>(null);
  const far = radius * 5;
  const at = (dir: Vec3, d: number): Vec3 => [center[0] + dir[0] * d, center[1] + dir[1] * d, center[2] + dir[2] * d];

  useEffect(() => {
    gl.toneMappingExposure = rig.exposure;
  }, [gl, rig.exposure]);

  useLayoutEffect(() => {
    const light = key.current;
    if (!light) return;
    light.target.position.set(center[0], center[1], center[2]);
    light.target.updateMatrixWorld();
    const cam = light.shadow.camera;
    const r = radius * 1.7;
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = Math.max(0.05, far - radius * 3);
    cam.far = far + radius * 3;
    cam.updateProjectionMatrix();
    runtime.shadowDirty = true;
  }, [center, radius, far, runtime]);

  return (
    <>
      <Environment intensity={rig.env} />
      <hemisphereLight args={[rig.hemi[0], rig.hemi[1], rig.hemi[2]]} />
      <directionalLight
        ref={key}
        color={rig.key[0]}
        intensity={rig.key[1]}
        position={at(KEY_DIR, far)}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={7}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.015}
      />
      <directionalLight color={rig.fill[0]} intensity={rig.fill[1]} position={at(FILL_DIR, far)} />
      <directionalLight color={rig.rim[0]} intensity={rig.rim[1]} position={at(RIM_DIR, far)} />
      <Fogging look={look} radius={radius} center={center} />
    </>
  );
}

/** Fog in the paper colour: distant parts fade into the sheet. */
function Fogging({ look, radius, center }: { look: StageLook; radius: number; center: Vec3 }) {
  const scene = useThree((s) => s.scene) as unknown as Scene;
  const color = useMemo(() => new Color(resolveDataColor('token:paper', look.tokens, look.theme, '#e9e4d8')), [look]);
  const fog = useMemo(() => new Fog(color.getHex(), 10, 40), [color]);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      if (scene.fog === fog) scene.fog = null;
    };
  }, [scene, fog]);
  useFrame((state) => {
    const c = state.camera.position;
    const d = Math.hypot(c.x - center[0], c.y - center[1], c.z - center[2]);
    fog.near = d + radius * 1.2;
    fog.far = d + radius * 10;
  });
  return null;
}
