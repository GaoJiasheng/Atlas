/**
 * The R3F scene graph of Model3DStage. Lives in its own reconciler root (see
 * Model3DStage.tsx), so it gets the scene store, engine UI store, bridge and
 * data as props rather than through React context.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, Vector3 } from 'three';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SceneStore } from '../../../core/store';
import type { Chapter } from '../../../core/types';
import { withBase } from '../../../../i18n';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import { resolveAllPartDisplays } from '../../lib/visibility';
import { targetExplodeAmount } from '../../lib/explode';
import { animationsByPart } from '../../lib/animation';
import { resolveDataColor, resolveMaterialLook } from '../../lib/color';
import { damp, easeInOutCubic, normalize3, type Vec3 } from '../../lib/math';
import { createRuntime, keepAnimating, MAX_DT, RuntimeContext, useRuntime, type StageRuntime } from './runtime';
import { PartNode, type PartHandle, type PartShape } from './PartNode';
import { Flows } from './Flows';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { GroundShadow } from './GroundShadow';
import { LabelProbe, ResolutionGovernor, ShadowUpdater, StatsProbe, type GroupMembers } from './probes';
import { partBounds } from '../../lib/parts';
import { anchorHalf, anchorOffset, anchorPoint, anchorRadius, primitiveShape, stageBounds } from './shapes';
import { createTextureKit } from './textures';
import type { PartStyle } from './materials';
import type { StageLook } from './look';
import { stageDpr } from './dpr';

const GltfSource = lazy(() => import('./GltfSource'));

export interface SceneRootProps {
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  bridge: StageBridge;
  data: PartsFile;
  chapters: readonly Chapter[];
  look: StageLook;
}

/** FLOW fade-in (master-spec H: ~0.6 s). */
const RUN_RATE = 5;
/** EXPLODED toggle (master-spec H: ~2 s easeInOut); slider drags follow quickly. */
const EXPLODE_MS = 2000;
const EXPLODE_DRAG_MS = 220;
const NO_LAYERS: readonly string[] = [];
/** Zero offset / extent (stable identity for the part props). */
const NO_HALF: Vec3 = [0, 0, 0];
/** Parts at least this fraction of the model radius cast the key light's shadow. */
const SHADOW_CASTER_RATIO = 0.28;

/** Eases `run` in/out and advances the shared clocks. */
function RunClock({ run, alwaysOn }: { run: boolean; alwaysOn: boolean }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [run, invalidate]);
  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    runtime.elapsed += dt;
    runtime.energy = damp(runtime.energy, run ? 1 : 0, RUN_RATE, dt);
    if (run && runtime.energy > 0.995) runtime.energy = 1;
    if (!run && runtime.energy < 0.01) runtime.energy = 0;
    runtime.phase += dt * runtime.energy;
    if (runtime.energy > 0 || alwaysOn) keepAnimating(state.invalidate);
  });
  return null;
}

/** Eases the shared explode amount: 2 s for mode switches, quick for slider drags. */
function ExplodeClock({ target, snapKey }: { target: number; snapKey: number }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  const tw = useRef<{ from: number; to: number; start: number; ms: number } | null>(null);
  useEffect(() => {
    const from = runtime.explode;
    if (from === target) return;
    tw.current = { from, to: target, start: performance.now(), ms: Math.abs(target - from) > 0.15 ? EXPLODE_MS : EXPLODE_DRAG_MS };
    invalidate();
  }, [target, runtime, invalidate]);
  useEffect(() => {
    tw.current = null;
    runtime.explode = target;
    runtime.shadowDirty = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapKey]);
  useFrame((state) => {
    const t = tw.current;
    if (!t) return;
    const k = Math.min(1, (performance.now() - t.start) / t.ms);
    runtime.explode = t.from + (t.to - t.from) * easeInOutCubic(k);
    runtime.shadowDirty = true;
    if (k >= 1) tw.current = null;
    keepAnimating(state.invalidate);
  });
  return null;
}

/** Keeps a failing glb from taking the whole stage down (primitives still render). */
class GltfBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    console.warn('[atlas] space-scene: model failed to load', error);
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneRoot({ store, ui, bridge, data, chapters, look }: SceneRootProps) {
  const s = useStore(
    store,
    useShallow((st) => ({
      part: st.part,
      view: st.view,
      explode: st.explode,
      run: st.run,
      cutaway: st.cutaway,
      layers: st.layers,
      hidden: st.hidden,
      transitionId: st.transition.id,
      instant: st.transition.instant,
    })),
  );
  const invalidate = useThree((st) => st.invalidate);
  const gl = useThree((st) => st.gl);
  const dpr = useThree((st) => st.viewport.dpr);
  const [runtime] = useState<StageRuntime>(() =>
    createRuntime(store.getState().run, targetExplodeAmount(store.getState().view, store.getState().explode)),
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [handles] = useState(() => new Map<string, PartHandle>());

  useEffect(() => {
    bridge.invalidate = invalidate;
    return () => {
      bridge.invalidate = () => {};
    };
  }, [bridge, invalidate]);

  /* ---------------- shapes ---------------- */
  const primitiveShapes = useMemo(() => {
    const out = new Map<string, PartShape>();
    for (const part of data.parts) {
      const shape = primitiveShape(part);
      if (shape) out.set(part.id, shape);
    }
    return out;
  }, [data.parts]);
  useEffect(() => () => primitiveShapes.forEach((sh) => sh.pieces.forEach((p) => p.geometry.dispose())), [primitiveShapes]);

  const meshNames = useMemo(
    () => new Map(data.parts.filter((p) => p.mesh).map((p) => [p.id, p.mesh!] as [string, string])),
    [data.parts],
  );
  const [meshShapes, setMeshShapes] = useState<Map<string, PartShape> | null>(null);
  const onMeshShapes = useCallback((m: Map<string, PartShape>) => setMeshShapes(m), []);

  // A glb mesh wins over a primitive stand-in once loaded.
  const shapes = useMemo(() => {
    const out = new Map(primitiveShapes);
    meshShapes?.forEach((shape, id) => out.set(id, shape));
    return out;
  }, [primitiveShapes, meshShapes]);
  const bounds = useMemo(() => stageBounds(data.parts, shapes), [data.parts, shapes]);
  const anchors = useMemo(() => new Map(data.parts.map((p) => [p.id, anchorOffset(p)] as [string, Vec3])), [data.parts]);
  const points = useMemo(() => new Map(data.parts.map((p) => [p.id, anchorPoint(p)] as [string, Vec3])), [data.parts]);
  const radii = useMemo(() => new Map(data.parts.map((p) => [p.id, anchorRadius(p)] as [string, number])), [data.parts]);
  const halves = useMemo(() => new Map(data.parts.map((p) => [p.id, anchorHalf(p)] as [string, Vec3])), [data.parts]);
  // Group labels: each group's non-context parts with the half extents of their bounds.
  const groupMembers = useMemo<GroupMembers>(() => {
    const out = new Map<string, { id: string; half: Vec3 }[]>();
    for (const p of data.parts) {
      if (p.context || p.group === undefined) continue;
      const b = partBounds(p);
      const r = (shapes.get(p.id)?.radius ?? 0) / Math.sqrt(3);
      const half: Vec3 = b ? [(b.max[0] - b.min[0]) / 2, (b.max[1] - b.min[1]) / 2, (b.max[2] - b.min[2]) / 2] : [r, r, r];
      out.set(p.group, [...(out.get(p.group) ?? []), { id: p.id, half }]);
    }
    return out;
  }, [data.parts, shapes]);
  useEffect(() => {
    bridge.modelRadius = bounds.modelRadius;
  }, [bridge, bounds]);
  const sphere = useMemo(() => ({ center: bounds.center, radius: bounds.modelRadius }), [bounds]);

  /* ---------------- materials ---------------- */
  const kit = useMemo(() => createTextureKit(), []);
  useEffect(() => () => kit.dispose(), [kit]);
  const groupColors = useMemo(() => new Map(data.groups.map((g) => [g.id, g.color])), [data.groups]);
  const styles = useMemo(() => {
    const cinema = look.theme === 'cinema';
    const signal = resolveDataColor('token:signal', look.tokens, look.theme, '#cc6328');
    const cut = resolveDataColor('token:cut', look.tokens, look.theme, '#b8973c');
    const ink = resolveDataColor('token:ink', look.tokens, look.theme, '#2a2824');
    const out = new Map<string, PartStyle>();
    for (const part of data.parts) {
      const ref = part.primitive?.color ?? (part.group !== undefined ? groupColors.get(part.group) : undefined) ?? 'steel';
      out.set(part.id, {
        look: resolveMaterialLook(ref, look.tokens, look.theme, part.primitive?.tint),
        kit,
        signal,
        cut,
        ink: cinema ? '#1f2124' : ink,
        rim: cinema ? 0.35 : 0.75,
        tint: cinema ? 0.03 : 0.02,
        hatchPx: Math.round(7 * dpr),
      });
    }
    return out;
  }, [data.parts, groupColors, look, kit, dpr]);

  /* ---------------- explorer state -> display ---------------- */
  const displays = useMemo(
    () => resolveAllPartDisplays(data.parts, { view: s.view, part: s.part, layers: s.layers, hidden: s.hidden }),
    [data.parts, s.view, s.part, s.layers, s.hidden],
  );
  const explodeTarget = targetExplodeAmount(s.view, s.explode);
  const anims = useMemo(() => animationsByPart(data.animations), [data.animations]);
  const alwaysOn = useMemo(
    () => data.animations.some((a) => !a.whenRun) || data.flows.some((f) => !f.whenRun),
    [data.animations, data.flows],
  );

  const plane = data.views.cutaway;
  const clipping = useMemo(() => {
    if (s.cutaway !== 'half') return null;
    const n = normalize3(plane?.normal ?? [-1, 0, 0]);
    return [new Plane(new Vector3(n[0], n[1], n[2]), plane?.offset ?? 0)];
  }, [s.cutaway, plane]);

  // Instant transitions (deep links, first load, snap) jump instead of easing.
  const snap = useRef({ id: -1, key: 0 });
  if (snap.current.id !== s.transitionId) {
    snap.current.id = s.transitionId;
    if (s.instant) snap.current.key += 1;
  }

  const hoverVisible = hovered && displays.get(hovered)?.visible && displays.get(hovered)?.selectable ? hovered : null;
  useEffect(() => {
    gl.domElement.style.cursor = hoverVisible ? 'pointer' : '';
  }, [gl, hoverVisible]);

  useEffect(() => {
    runtime.shadowDirty = true;
    invalidate();
  }, [invalidate, runtime, s, look, hovered, shapes, clipping]);

  const onSelect = useCallback((id: string) => store.getState().patch({ part: id }), [store]);
  const onHover = useCallback((id: string | null) => setHovered(id), []);

  return (
    <RuntimeContext.Provider value={runtime}>
      <RunClock run={s.run} alwaysOn={alwaysOn} />
      <ExplodeClock target={explodeTarget} snapKey={snap.current.key} />
      <Lighting look={look} center={bounds.center} radius={bounds.modelRadius} runtime={runtime} />
      <GroundShadow floor={bounds.floor} radius={bounds.radius} look={look} runtime={runtime} />
      {data.parts.map((part) => {
        const shape = shapes.get(part.id);
        const display = displays.get(part.id);
        const style = styles.get(part.id);
        if (!shape || !display || !style) return null;
        return (
          <PartNode
            key={part.id}
            part={part}
            shape={shape}
            style={style}
            display={display}
            animations={anims.get(part.id) ?? []}
            hovered={hovered === part.id}
            clipping={clipping}
            castShadow={
              part.castShadow ?? (!part.context && style.look.opacity === 1 && shape.radius >= bounds.modelRadius * SHADOW_CASTER_RATIO)
            }
            anchorOffset={anchors.get(part.id) ?? NO_HALF}
            anchorPoint={points.get(part.id) ?? NO_HALF}
            anchorRadius={radii.get(part.id) ?? 0}
            anchorHalf={halves.get(part.id) ?? NO_HALF}
            handles={handles}
            snapKey={snap.current.key}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}
      {/* Flow paths do not follow the parts apart: no particles while exploded (docs/12 §7.5, G16). */}
      <Flows flows={data.flows} layers={s.view === 'exploded' ? NO_LAYERS : s.layers} look={look} clipping={clipping} />
      <CameraRig store={store} ui={ui} bridge={bridge} chapters={chapters} views={data.views} sphere={sphere} minDistance={bounds.modelRadius * 0.9} />
      {data.model && meshNames.size > 0 && (
        <GltfBoundary>
          <Suspense fallback={null}>
            <GltfSource url={withBase(data.model)} meshes={meshNames} onShapes={onMeshShapes} />
          </Suspense>
        </GltfBoundary>
      )}
      <LabelProbe bridge={bridge} handles={handles} groups={groupMembers} clipping={clipping} xray={s.view === 'xray'} runtime={runtime} />
      <StatsProbe bridge={bridge} />
      <ShadowUpdater runtime={runtime} />
      <ResolutionGovernor bridge={bridge} base={stageDpr} />
    </RuntimeContext.Provider>
  );
}
