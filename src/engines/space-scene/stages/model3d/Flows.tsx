/**
 * Flow particles ("air", "refrigerant", "current"): ~200 points per flow that
 * travel along the flow's Catmull-Rom path while the scene runs and the flow's
 * group layer is on. All motion happens in the vertex shader (flowMaterial.ts).
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, type PerspectiveCamera, type Plane, type Points } from 'three';
import type { Flow } from '../../schema';
import { bakeFlowPath } from '../../lib/flow-curve';
import { resolveDataColor } from '../../lib/color';
import { damp } from '../../lib/math';
import { createFlowMaterial, styleFlowMaterial } from './flowMaterial';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import type { StageLook } from './look';

export const PARTICLES_PER_FLOW = 200;

/** Deterministic PRNG so every load looks the same (screenshots, tests). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function particleGeometry(count: number, seed: number, spread: number): BufferGeometry {
  const rand = mulberry32(seed);
  const jitter = new Float32Array(count * 3);
  const offset = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Uniform-ish point in a small ball around the centre line.
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const r = spread * Math.cbrt(rand());
    const s = Math.sqrt(1 - u * u);
    jitter.set([r * s * Math.cos(phi), r * s * Math.sin(phi), r * u], i * 3);
    offset[i] = (i + rand() * 0.8) / count;
    seeds[i] = rand();
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(jitter, 3));
  g.setAttribute('aOffset', new BufferAttribute(offset, 1));
  g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  return g;
}

function FlowParticles({
  flow,
  index,
  layerOn,
  look,
  clipping,
}: {
  flow: Flow;
  index: number;
  layerOn: boolean;
  look: StageLook;
  clipping: Plane[] | null;
}) {
  const runtime = useRuntime();
  const ref = useRef<Points>(null);
  const fade = useRef(0);
  const baked = useMemo(() => bakeFlowPath(flow.path), [flow.path]);
  const material = useMemo(() => createFlowMaterial(baked, flow.speed), [baked, flow.speed]);
  const geometry = useMemo(() => particleGeometry(PARTICLES_PER_FLOW, 1013 + index * 7919, 0.035), [index]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    material.uniforms.uColor.value = new Color(resolveDataColor(flow.color, look.tokens, look.theme));
    styleFlowMaterial(material, look.theme === 'cinema');
  }, [material, flow.color, look]);

  useEffect(() => {
    material.clippingPlanes = clipping;
  }, [material, clipping]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const strength = layerOn ? (flow.whenRun ? runtime.energy : 1) : 0;
    fade.current = damp(fade.current, strength, 6, dt);
    if (fade.current < 0.003 && strength === 0) fade.current = 0;
    const u = material.uniforms;
    u.uOpacity.value = Math.min(1, fade.current);
    u.uTime.value = flow.whenRun ? runtime.phase : runtime.elapsed;
    const cam = state.camera as unknown as PerspectiveCamera;
    const fov = ((cam.fov ?? 40) * Math.PI) / 180;
    u.uScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan(fov / 2));
    if (ref.current) ref.current.visible = fade.current > 0;
    if (fade.current > 0 || strength > 0) keepAnimating(state.invalidate);
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} dispose={null} visible={false} />;
}

export function Flows({
  flows,
  layers,
  look,
  clipping,
}: {
  flows: readonly Flow[];
  layers: readonly string[];
  look: StageLook;
  clipping: Plane[] | null;
}) {
  return (
    <>
      {flows.map((flow, i) => (
        <FlowParticles
          key={flow.id}
          flow={flow}
          index={i}
          layerOn={layers.includes(flow.group)}
          look={look}
          clipping={clipping}
        />
      ))}
    </>
  );
}
