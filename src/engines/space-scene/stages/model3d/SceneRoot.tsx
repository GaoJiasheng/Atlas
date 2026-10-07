/**
 * The R3F scene graph of Model3DStage. Lives in its own reconciler root (see
 * Model3DStage.tsx), so it gets the scene store and data as props rather than
 * through React context.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, Vector3 } from 'three';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SceneStore } from '../../../core/store';
import type { Chapter, Locale } from '../../../core/types';
import { tx, withBase } from '../../../../i18n';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import { resolveAllPartDisplays } from '../../lib/visibility';
import { targetExplodeAmount } from '../../lib/explode';
import { animationsByPart } from '../../lib/animation';
import { damp, normalize3 } from '../../lib/math';
import { createRuntime, keepAnimating, MAX_DT, RuntimeContext, useRuntime } from './runtime';
import { PartNode, type PartShape } from './PartNode';
import { Flows } from './Flows';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { GroundShadow } from './GroundShadow';
import { primitiveShape, stageBounds } from './shapes';
import type { StageLook } from './look';

const GltfSource = lazy(() => import('./GltfSource'));

export interface SceneRootProps {
  store: SceneStore<SpaceSceneExt>;
  data: PartsFile;
  chapters: readonly Chapter[];
  locale: Locale;
  look: StageLook;
}

/** Eases `run` in/out and advances the shared clocks. */
function RunClock({ run, alwaysOn }: { run: boolean; alwaysOn: boolean }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [run, invalidate]);
  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    runtime.elapsed += dt;
    runtime.energy = damp(runtime.energy, run ? 1 : 0, 2.5, dt);
    if (run && runtime.energy > 0.999) runtime.energy = 1;
    if (!run && runtime.energy < 0.002) runtime.energy = 0;
    runtime.phase += dt * runtime.energy;
    if (runtime.energy > 0 || alwaysOn) keepAnimating(state.invalidate);
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

/** A part whose rest centre is cut away by the cutaway plane gets no label. */
function isClipped(at: readonly number[], clipping: Plane[] | null): boolean {
  if (!clipping) return false;
  const p = new Vector3(at[0], at[1], at[2]);
  return clipping.some((plane) => plane.distanceToPoint(p) < 0);
}

export function SceneRoot({ store, data, chapters, locale, look }: SceneRootProps) {
  const s = useStore(
    store,
    useShallow((st) => ({
      part: st.part,
      view: st.view,
      explode: st.explode,
      run: st.run,
      cutaway: st.cutaway,
      layers: st.layers,
      transitionId: st.transition.id,
      instant: st.transition.instant,
    })),
  );
  const invalidate = useThree((st) => st.invalidate);
  const gl = useThree((st) => st.gl);
  const [runtime] = useState(() => createRuntime(store.getState().run));
  const [hovered, setHovered] = useState<string | null>(null);

  /* ---------------- shapes ---------------- */
  const primitiveShapes = useMemo(() => {
    const out = new Map<string, PartShape>();
    for (const part of data.parts) {
      const shape = primitiveShape(part);
      if (shape) out.set(part.id, shape);
    }
    return out;
  }, [data.parts]);
  useEffect(() => () => primitiveShapes.forEach((sh) => sh.geometry.dispose()), [primitiveShapes]);

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

  /* ---------------- explorer state -> display ---------------- */
  const displays = useMemo(
    () => resolveAllPartDisplays(data.parts, { view: s.view, part: s.part, layers: s.layers }),
    [data.parts, s.view, s.part, s.layers],
  );
  const explodeTarget = targetExplodeAmount(s.view, s.explode);
  const groupColors = useMemo(() => new Map(data.groups.map((g) => [g.id, g.color])), [data.groups]);
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

  // Instant transitions (deep links, first load) jump instead of easing.
  const snap = useRef({ id: -1, key: 0 });
  if (snap.current.id !== s.transitionId) {
    snap.current.id = s.transitionId;
    if (s.instant) snap.current.key += 1;
  }

  const selected = s.part && displays.get(s.part)?.visible ? s.part : null;
  const hoverVisible = hovered && displays.get(hovered)?.visible ? hovered : null;
  const labelFor = selected ?? hoverVisible;

  useEffect(() => {
    gl.domElement.style.cursor = hoverVisible ? 'pointer' : '';
  }, [gl, hoverVisible]);

  useEffect(() => {
    invalidate();
  }, [invalidate, s, look, hovered, shapes, clipping]);

  const onSelect = useCallback((id: string) => store.getState().patch({ part: id }), [store]);
  const onHover = useCallback((id: string | null) => setHovered(id), []);

  return (
    <RuntimeContext.Provider value={runtime}>
      <RunClock run={s.run} alwaysOn={alwaysOn} />
      <Lighting look={look} />
      <GroundShadow y={bounds.floor} radius={bounds.radius} look={look} />
      {data.parts.map((part) => {
        const shape = shapes.get(part.id);
        const display = displays.get(part.id);
        if (!shape || !display) return null;
        return (
          <PartNode
            key={part.id}
            part={part}
            shape={shape}
            colorRef={part.primitive?.color ?? groupColors.get(part.group) ?? 'metal'}
            display={display}
            explodeTarget={explodeTarget}
            animations={anims.get(part.id) ?? []}
            look={look}
            hovered={hovered === part.id}
            showLabel={labelFor === part.id && !isClipped(shape.position, clipping)}
            label={tx(part.name, locale)}
            clipping={clipping}
            snapKey={snap.current.key}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}
      <Flows flows={data.flows} layers={s.layers} look={look} clipping={clipping} />
      <CameraRig store={store} chapters={chapters} views={data.views} />
      {data.model && meshNames.size > 0 && (
        <GltfBoundary>
          <Suspense fallback={null}>
            <GltfSource url={withBase(data.model)} meshes={meshNames} onShapes={onMeshShapes} />
          </Suspense>
        </GltfBoundary>
      )}
    </RuntimeContext.Provider>
  );
}
