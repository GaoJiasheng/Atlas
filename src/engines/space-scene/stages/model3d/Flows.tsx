/**
 * Flow particles ("air", "refrigerant", "current"): `count` points per flow
 * (default 360) that travel along the flow's Catmull-Rom path (or paths:
 * `paths`, spread by length, one draw call) while the scene runs and the
 * flow's group layer is on, coloured by the flow's `stops`. Motion and colour
 * happen in the vertex shader (flowMaterial.ts); this component keeps each
 * path's phase. A try-it binding (lib/sim/bind.ts) can stop a flow, run each
 * path at its own speed and direction (a circuit's current per edge; a path
 * with no current fades out) and recolour it while a state holds (a short
 * circuit runs hot). A flow with `clip: false` ignores the cutaway plane.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, type PerspectiveCamera, type Plane, type Points } from 'three';
import type { Flow } from '../../schema';
import { bakeFlowPath, particlesPerPath, type BakedFlow } from '../../lib/flow-curve';
import { resolveDataColor } from '../../lib/color';
import { damp } from '../../lib/math';
import type { SimFlowEffect } from '../../lib/sim/bind';
import { createFlowMaterial, setFlowStops, styleFlowMaterial } from './flowMaterial';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import type { StageLook } from './look';

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

/** `spread`: a ball radius, or box half-extents on the scene axes; `perPath`: particles on each path. */
function particleGeometry(perPath: readonly number[], seed: number, spread: Flow['spread']): BufferGeometry {
  const rand = mulberry32(seed);
  const count = perPath.reduce((a, b) => a + b, 0);
  const jitter = new Float32Array(count * 3);
  const offset = new Float32Array(count);
  const seeds = new Float32Array(count);
  const path = new Float32Array(count);
  let i = 0;
  perPath.forEach((n, k) => {
    for (let j = 0; j < n; j++, i++) {
      if (typeof spread === 'number') {
        // Uniform-ish point in a small ball around the centre line.
        const u = rand() * 2 - 1;
        const phi = rand() * Math.PI * 2;
        const r = spread * Math.cbrt(rand());
        const s = Math.sqrt(1 - u * u);
        jitter.set([r * s * Math.cos(phi), r * s * Math.sin(phi), r * u], i * 3);
      } else {
        jitter.set([(rand() * 2 - 1) * spread[0], (rand() * 2 - 1) * spread[1], (rand() * 2 - 1) * spread[2]], i * 3);
      }
      offset[i] = (j + rand() * 0.8) / n;
      seeds[i] = rand();
      path[i] = k;
    }
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(jitter, 3));
  g.setAttribute('aOffset', new BufferAttribute(offset, 1));
  g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  g.setAttribute('aPath', new BufferAttribute(path, 1));
  return g;
}

/** Fade rate of a path whose current starts or stops (~0.3 s). */
const PATH_FADE = 10;

function FlowParticles({
  flow,
  index,
  layerOn,
  look,
  clipping,
  effect,
}: {
  flow: Flow;
  index: number;
  layerOn: boolean;
  look: StageLook;
  clipping: Plane[] | null;
  effect: SimFlowEffect | undefined;
}) {
  const runtime = useRuntime();
  const ref = useRef<Points>(null);
  const fade = useRef(0);
  const paths = useMemo(() => flow.paths ?? [{ id: flow.id, path: flow.path }], [flow.paths, flow.id, flow.path]);
  const baked = useMemo<BakedFlow[]>(() => paths.map((p) => bakeFlowPath(p.path)), [paths]);
  const perPath = useMemo(() => particlesPerPath(baked.map((b) => b.length), flow.count), [baked, flow.count]);
  const material = useMemo(() => createFlowMaterial(baked, flow.ends === 'open'), [baked, flow.ends]);
  const geometry = useMemo(() => particleGeometry(perPath, 1013 + index * 7919, flow.spread), [index, perPath, flow.spread]);
  /** Each path's phase (fraction travelled) and fade, kept across speed changes. */
  const state = useRef(paths.map(() => ({ phase: 0, alpha: 1 })));
  useEffect(() => {
    state.current = paths.map(() => ({ phase: 0, alpha: 1 }));
  }, [paths]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const color = effect?.color ?? null;
  useEffect(() => {
    const hex = (ref: string) => resolveDataColor(ref, look.tokens, look.theme);
    setFlowStops(
      material,
      color ? [[0, hex(color)]] : flow.stops ? flow.stops.map((s) => [s.at, hex(s.color)] as const) : [[0, hex(flow.color)]],
    );
    styleFlowMaterial(material, look.theme === 'cinema', flow.size);
  }, [material, flow.color, flow.stops, flow.size, look, color]);

  useEffect(() => {
    material.clippingPlanes = flow.clip ? clipping : null;
  }, [material, clipping, flow.clip]);

  const visible = effect?.visible ?? true;
  const speeds = effect?.paths ?? null;
  useFrame((st, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const strength = layerOn && visible ? (flow.whenRun ? runtime.energy : 1) : 0;
    fade.current = damp(fade.current, strength, 6, dt);
    if (fade.current < 0.003 && strength === 0) fade.current = 0;
    const u = material.uniforms;
    u.uOpacity.value = Math.min(1, fade.current);
    const clock = flow.whenRun ? runtime.phase : runtime.elapsed;
    let easing = false;
    paths.forEach((p, k) => {
      const s = state.current[k];
      if (!s) return;
      const len = Math.max(baked[k]!.length, 1e-4);
      if (speeds) {
        // Bound: integrate this path's own speed (no jump when it changes); a path without current fades out.
        const factor = speeds[p.id] ?? 0;
        s.phase += (dt * (flow.whenRun ? runtime.energy : 1) * flow.speed * factor) / len;
        const target = factor === 0 ? 0 : 1;
        s.alpha = damp(s.alpha, target, PATH_FADE, dt);
        if (Math.abs(s.alpha - target) < 0.003) s.alpha = target;
        else easing = true;
      } else {
        s.phase = (clock * flow.speed) / len;
        s.alpha = 1;
      }
      u.uPhase.value[k] = s.phase - Math.floor(s.phase);
      u.uAlpha.value[k] = s.alpha;
    });
    const cam = st.camera as unknown as PerspectiveCamera;
    const fov = ((cam.fov ?? 40) * Math.PI) / 180;
    u.uScale.value = (st.size.height * st.viewport.dpr) / (2 * Math.tan(fov / 2));
    if (ref.current) ref.current.visible = fade.current > 0;
    if (fade.current > 0 || strength > 0 || easing) keepAnimating(st.invalidate);
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} dispose={null} visible={false} />;
}

export function Flows({
  flows,
  layers,
  look,
  clipping,
  effects,
}: {
  flows: readonly Flow[];
  layers: readonly string[];
  look: StageLook;
  clipping: Plane[] | null;
  /** Try-it bindings per flow id (lib/sim/bind.ts). */
  effects?: ReadonlyMap<string, SimFlowEffect>;
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
          effect={effects?.get(flow.id)}
        />
      ))}
    </>
  );
}
