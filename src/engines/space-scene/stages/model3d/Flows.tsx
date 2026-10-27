/**
 * Flow particles ("air", "refrigerant", "current"): `count` points per flow
 * (default 360) that travel along the flow's Catmull-Rom path (or paths:
 * `paths`, spread by length, one draw call) while the scene runs and the
 * flow's group layer is on, coloured by the flow's `stops`. Motion and colour
 * happen in the vertex shader (flowMaterial.ts); this component keeps each
 * path's phase. A try-it binding (lib/sim/bind.ts) can stop a flow, run each
 * path at its own speed and direction (a circuit's current per edge; a path
 * with no current fades out) or show a share of its particles at the flow's
 * own speed (`density`: an energy share, eased over ~0.3 s), and recolour it
 * while a state holds (a short
 * circuit runs hot); a `visible` binding with `paths` shows or hides only
 * those paths (each fades on its own alpha). A flow with `clip: false` ignores the cutaway plane.
 * A field-line flow (a `state` binding, lib/sim/field.ts) runs along the
 * lines of the magnet field state on show, drawn under the particles as
 * hairlines in the flow's colour (one more draw call); a new state fades in.
 * A number output's `intensity` (docs/40 §4.3) runs every path at one pace.
 * A tidal flow (docs/40 §4.4, lib/sim/tidal.ts) goes in and out with the
 * phase of the animation it follows (or its own `hz`) and stops with it;
 * with reduced motion its particles stay put.
 */
import { AirfoilFlow } from './AirfoilFlow';
import type { PartsFile } from '../../schema';
import type { SpaceUiStore } from '../../ui';
import type { SimValues } from '../../sim-schema';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, type LineSegments, type PerspectiveCamera, type Plane, type Points } from 'three';
import type { Flow } from '../../schema';
import type { StageBridge } from '../../bridge';
import { bakeFlowPath, particlesPerPath, type BakedFlow } from '../../lib/flow-curve';
import { resolveDataColor } from '../../lib/color';
import { damp } from '../../lib/math';
import type { SimFlowEffect } from '../../lib/sim/bind';
import { createFlowMaterial, setFlowStops, styleFlowMaterial } from './flowMaterial';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';
import { clockPhase } from '../../lib/sim/hz';
import { tidalStep } from '../../lib/sim/tidal';
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

/** Base-2 radical inverse (van der Corput): ranks that spread any first share of a path's particles evenly along it. */
function radicalInverse(n: number): number {
  let x = 0;
  let f = 0.5;
  for (let k = n; k > 0; k >>= 1, f /= 2) if (k & 1) x += f;
  return x;
}

/** `spread`: a ball radius, or box half-extents on the scene axes; `perPath`: particles on each path; `aRank`: the order a density binding shows them in. */
function particleGeometry(perPath: readonly number[], seed: number, spread: Flow['spread']): BufferGeometry {
  const rand = mulberry32(seed);
  const count = perPath.reduce((a, b) => a + b, 0);
  const jitter = new Float32Array(count * 3);
  const offset = new Float32Array(count);
  const seeds = new Float32Array(count);
  const path = new Float32Array(count);
  const rank = new Float32Array(count);
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
      rank[i] = radicalInverse(j);
    }
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(jitter, 3));
  g.setAttribute('aOffset', new BufferAttribute(offset, 1));
  g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  g.setAttribute('aPath', new BufferAttribute(path, 1));
  g.setAttribute('aRank', new BufferAttribute(rank, 1));
  return g;
}

/** Fade rate of a path whose current starts or stops (~0.3 s). */
const PATH_FADE = 10;
/** Field lines' hairline opacity under their particles. */
const FIELD_LINE_OPACITY = 0.45;

type FlowPath = { id: string; path: readonly (readonly number[])[] };

/** Line segments of polylines (one geometry: one draw call). */
function hairlines(paths: readonly FlowPath[]): BufferGeometry {
  const n = paths.reduce((k, p) => k + Math.max(0, p.path.length - 1), 0);
  const pos = new Float32Array(n * 6);
  let o = 0;
  for (const p of paths)
    for (let i = 1; i < p.path.length; i++) {
      const a = p.path[i - 1]!;
      const b = p.path[i]!;
      pos.set([a[0]!, a[1]!, a[2]!, b[0]!, b[1]!, b[2]!], o);
      o += 6;
    }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.computeBoundingSphere();
  return g;
}

function FlowParticles({
  flow,
  index,
  layerOn,
  look,
  clipping,
  effect,
  fieldLines,
  bridge,
}: {
  flow: Flow;
  index: number;
  layerOn: boolean;
  look: StageLook;
  clipping: Plane[] | null;
  effect: SimFlowEffect | undefined;
  fieldLines: ((state: string) => readonly FlowPath[]) | undefined;
  bridge?: StageBridge;
}) {
  const field = effect?.state ?? null;
  const paths = useMemo<readonly FlowPath[]>(
    () => (field !== null && fieldLines ? fieldLines(field) : (flow.paths ?? (flow.path.length >= 2 ? [{ id: flow.id, path: flow.path }] : []))),
    [field, fieldLines, flow.paths, flow.id, flow.path],
  );
  if (paths.length === 0) return null;
  return <FlowPaths bridge={bridge} flow={flow} index={index} layerOn={layerOn} look={look} clipping={clipping} effect={effect} paths={paths} lines={field !== null} />;
}

function FlowPaths({
  flow,
  index,
  layerOn,
  look,
  clipping,
  effect,
  paths,
  lines,
  bridge,
}: {
  flow: Flow;
  index: number;
  layerOn: boolean;
  look: StageLook;
  clipping: Plane[] | null;
  effect: SimFlowEffect | undefined;
  paths: readonly FlowPath[];
  /** Draw the paths as hairlines too (field lines). */
  lines: boolean;
  bridge?: StageBridge;
}) {
  const runtime = useRuntime();
  const ref = useRef<Points>(null);
  const lineRef = useRef<LineSegments>(null);
  const fade = useRef(0);
  const baked = useMemo<BakedFlow[]>(() => paths.map((p) => bakeFlowPath(p.path)), [paths]);
  const perPath = useMemo(() => particlesPerPath(baked.map((b) => b.length), flow.count), [baked, flow.count]);
  const material = useMemo(() => createFlowMaterial(baked, flow.ends === 'open'), [baked, flow.ends]);
  const geometry = useMemo(() => particleGeometry(perPath, 1013 + index * 7919, flow.spread), [index, perPath, flow.spread]);
  /** Each path's phase (fraction travelled) and fade, kept across speed changes. */
  const state = useRef(paths.map((p) => ({ phase: 0, alpha: 1, share: 1, visibility: effect?.visibility?.[p.id] === false ? 0 : 1 })));
  useEffect(() => {
    state.current = paths.map((p) => ({ phase: 0, alpha: 1, share: 1, visibility: effect?.visibility?.[p.id] === false ? 0 : 1 }));
    // A new set of field lines fades in.
    if (lines) fade.current = 0;
  }, [paths, lines]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const lineGeometry = useMemo(() => (lines ? hairlines(paths) : null), [lines, paths]);
  const lineMaterial = useMemo(() => (lines ? new LineBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }) : null), [lines]);
  useEffect(() => () => lineGeometry?.dispose(), [lineGeometry]);
  useEffect(() => () => lineMaterial?.dispose(), [lineMaterial]);
  useEffect(() => {
    lineMaterial?.color.set(resolveDataColor(flow.color, look.tokens, look.theme));
  }, [lineMaterial, flow.color, look]);

  const visibility = useMemo(() => Object.fromEntries(paths.map((p) => [p.id, { visible: false }])), [paths]);
  useEffect(() => {
    bridge?.flowPaths.set(flow.id, visibility);
    return () => { bridge?.flowPaths.delete(flow.id); };
  }, [bridge, flow.id, visibility]);
  const color = effect?.color ?? null;
  useEffect(() => {
    const hex = (ref: string) => resolveDataColor(ref, look.tokens, look.theme);
    setFlowStops(
      material,
      color ? [[0, hex(color)]] : flow.stops ? flow.stops.map((s) => [s.at, hex(s.color)] as const) : [[0, hex(flow.color)]],
    );
    styleFlowMaterial(material, look.theme === 'cinema', flow.size, flow.flat === true);
  }, [material, flow.color, flow.stops, flow.size, flow.flat, look, color]);

  useEffect(() => {
    material.clippingPlanes = flow.clip ? clipping : null;
    if (lineMaterial) {
      lineMaterial.clippingPlanes = flow.clip ? clipping : null;
      lineMaterial.needsUpdate = true;
    }
  }, [material, lineMaterial, clipping, flow.clip]);

  const visible = effect?.visible ?? true;
  const speeds = effect?.paths ?? null;
  const uniform = effect?.uniform;
  const density = effect?.mode === 'density';
  const tidal = flow.tidal;
  // QA (`flow(id).pace`): the pace a number intensity gives every path.
  useEffect(() => {
    if (uniform === undefined) return;
    bridge?.flowPace.set(flow.id, uniform);
    return () => { bridge?.flowPace.delete(flow.id); };
  }, [bridge, flow.id, uniform]);
  /** A tidal flow's own clock (`tidal.hz`), in cycles. */
  const own = useRef(0);
  useFrame((st, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const strength = layerOn && visible ? (flow.whenRun ? runtime.energy : 1) : 0;
    fade.current = damp(fade.current, strength, 6, dt);
    if (fade.current < 0.003 && strength === 0) fade.current = 0;
    const u = material.uniforms;
    u.uOpacity.value = Math.min(1, fade.current);
    const clock = flow.whenRun ? runtime.phase : runtime.elapsed;
    const run = flow.whenRun ? runtime.energy : 1;
    // Tidal: where the cycle is at the start of this frame, how far it moves and how many seconds of it play (0 while the animation stops).
    let tide: { phase: number; cycles: number; seconds: number } | null = null;
    if (tidal) {
      if ('sync' in tidal) {
        const c = runtime.clocks.get(tidal.sync);
        tide = c ? { phase: clockPhase(c.cycles - c.advance), cycles: c.advance, seconds: c.seconds } : { phase: 0, cycles: 0, seconds: 0 };
      } else {
        const advance = dt * run * tidal.hz;
        tide = { phase: clockPhase(own.current), cycles: advance, seconds: dt * run };
        own.current += advance;
      }
      if (prefersReducedMotion()) tide.seconds = 0;
    }
    let easing = false;
    paths.forEach((p, k) => {
      const s = state.current[k];
      if (!s) return;
      const len = Math.max(baked[k]!.length, 1e-4);
      if (speeds || uniform !== undefined || tide) {
        // Bound: integrate this path's own speed (no jump when it changes); a path without current fades out.
        const value = speeds ? (speeds[p.id] ?? 0) : (uniform ?? 1);
        // Density: the flow's own speed (its sign: the way along the path), the value is the share of particles on show.
        const factor = density ? Math.sign(value) : value;
        if (tide) s.phase += tidalStep(tide.phase, tide.cycles, tide.seconds, flow.speed, factor) / len;
        else s.phase += (dt * run * flow.speed * factor) / len;
        const target = value === 0 ? 0 : 1;
        s.alpha = damp(s.alpha, target, PATH_FADE, dt);
        if (Math.abs(s.alpha - target) < 0.003) s.alpha = target;
        else easing = true;
        if (!density) s.share = 1;
        else if (value !== 0) {
          // A path fading out keeps its share: its particles fade together rather than drop out one by one.
          const share = Math.min(1, Math.abs(value));
          s.share = damp(s.share, share, PATH_FADE, dt);
          if (Math.abs(s.share - share) < 0.002) s.share = share;
          else easing = true;
        }
      } else {
        s.phase = (clock * flow.speed) / len;
        s.alpha = 1;
        s.share = 1;
      }
      const targetVisibility = effect?.visibility?.[p.id] === false ? 0 : 1;
      s.visibility = damp(s.visibility, targetVisibility, PATH_FADE, dt);
      if (Math.abs(s.visibility - targetVisibility) < 0.003) s.visibility = targetVisibility;
      else easing = true;
      u.uPhase.value[k] = s.phase - Math.floor(s.phase);
      u.uAlpha.value[k] = s.alpha * s.visibility;
      visibility[p.id]!.visible = fade.current * s.alpha * s.visibility > 0.003;
      u.uShare.value[k] = s.share;
    });
    const cam = st.camera as unknown as PerspectiveCamera;
    const fov = ((cam.fov ?? 40) * Math.PI) / 180;
    u.uScale.value = (st.size.height * st.viewport.dpr) / (2 * Math.tan(fov / 2));
    if (ref.current) ref.current.visible = fade.current > 0;
    if (lineRef.current && lineMaterial) {
      lineRef.current.visible = fade.current > 0;
      lineMaterial.opacity = Math.min(1, fade.current) * FIELD_LINE_OPACITY;
    }
    if (fade.current > 0 || strength > 0 || easing) keepAnimating(st.invalidate);
  });

  return (
    <>
      {lineGeometry && lineMaterial && <lineSegments ref={lineRef} geometry={lineGeometry} material={lineMaterial} dispose={null} visible={false} />}
      <points ref={ref} geometry={geometry} material={material} frustumCulled={false} dispose={null} visible={false} />
    </>
  );
}

export function Flows({
  airfoil,
  flows,
  layers,
  look,
  clipping,
  effects,
  fieldLines,
  bridge,
}: {
  airfoil?: {file:PartsFile;ui:SpaceUiStore;values:SimValues;on:boolean;run:boolean};
  flows: readonly Flow[];
  layers: readonly string[];
  look: StageLook;
  clipping: Plane[] | null;
  /** Try-it bindings per flow id (lib/sim/bind.ts). */
  effects?: ReadonlyMap<string, SimFlowEffect>;
  /** A field state's lines (a field-line flow's paths). */
  fieldLines?: (state: string) => readonly FlowPath[];
  bridge?: StageBridge;
}) {
  return (
    <>
      {flows.map((flow, i) => airfoil && bridge && airfoil.file.sim?.bind.some(b => 'flow' in b && b.flow === flow.id && b.airfoilFlow) ? <AirfoilFlow key={flow.id} {...airfoil} flow={flow} bridge={bridge} look={look} on={airfoil.on && layers.includes(flow.group)} linesOn={effects?.get(flow.id)?.visible !== false} /> : (
        <FlowParticles
          key={flow.id}
          flow={flow}
          index={i}
          layerOn={layers.includes(flow.group)}
          look={look}
          clipping={clipping}
          effect={effects?.get(flow.id)}
          fieldLines={fieldLines}
          bridge={bridge}
        />
      ))}
    </>
  );
}
