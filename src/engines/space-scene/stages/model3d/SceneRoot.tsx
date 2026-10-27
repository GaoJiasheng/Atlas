import { getOrbitSession } from '../../lib/sim/orbit-session';
import { OrbitClockDriver, OrbitDriver } from './OrbitDriver';
/**
 * The R3F scene graph of Model3DStage. Lives in its own reconciler root (see
 * Model3DStage.tsx), so it gets the scene store, engine UI store, bridge and
 * data as props rather than through React context.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Plane, Vector3, type Group, type SkinnedMesh } from 'three';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SceneStore } from '../../../core/store';
import type { Chapter } from '../../../core/types';
import { withBase } from '../../../../i18n';
import type { SpaceSceneExt } from '../../index';
import type { PartsFile } from '../../schema';
import type { FitnessBundle } from '../../../../content/schema/fitness';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import { resolveAllPartDisplays } from '../../lib/visibility';
import { explodeStages, targetExplodeAmount } from '../../lib/explode';
import { bendAxisIndex } from '../../lib/bend';
import { jointOf, musclePartIds } from '../../lib/rig';
import { activeSites } from '../../lib/sites';
import { animationsByPart } from '../../lib/animation';
import { resolveDataColor, resolveMaterialLook } from '../../lib/color';
import { damp, easeInOutCubic, normalize3, type Vec3 } from '../../lib/math';
import { POSE_DURATION, restTransform, toTransform, type PartTransform } from '../../lib/pose';
import { createRuntime, keepAnimating, MAX_DT, RuntimeContext, useRuntime, type StageRuntime } from './runtime';
import { PartNode, type PartHandle, type PartShape, type ShiftMove, type SimMove } from './PartNode';
import { Flows } from './Flows';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { GroundShadow } from './GroundShadow';
import { LabelProbe, ResolutionGovernor, ShadowUpdater, SitesProbe, StatsProbe, type GroupMembers } from './probes';
import { MotionDriver } from './MotionDriver';
import { Equipment } from './Equipment';
import { Mannequin } from './Mannequin';
import { WireBody, WIRE_FILL_OPACITY } from './WireBody';
import { Hands, type HandColors } from './Hands';
import { handPlan, RELAXED } from '../../lib/hands';
import type { ExerciseBody } from '../../../../lib/anatomy';
import type { GltfRig } from './GltfSource';
import { makeGrip } from './grip';
import { makeFoot } from './foot';
import { heldSpan } from '../../lib/equipment';
import { exercisePosture, EXERCISE_VIEWS } from '../../lib/camera';
import { partBounds, partMaterialSlots } from '../../lib/parts';
import { anchorHalf, anchorOffset, anchorPoint, anchorRadius, primitiveShape, stageBounds } from './shapes';
import { createTextureKit } from './textures';
import type { PartStyle } from './materials';
import type { Box3Like } from '../../lib/parts';
import type { StageLook } from './look';
import { stageDpr } from './dpr';
import { resolveSimValues } from '../../lib/sim/controls';
import type { SimOutputs } from '../../lib/sim';
import { evaluateSimOnStage } from '../../lib/sim/carrier';
import { frameKey, type MagnetFrames } from '../../lib/sim/frame';
import { simEffects, type SimEffects } from '../../lib/sim/bind';
import { shiftDelays } from '../../lib/sim/shift';
import { fieldLines, ironFilings, type Filing } from '../../lib/sim/field';
import { filingMatrices, filingsCard } from './geometry';
import { SimOverlays } from './SimOverlays';
import { TimelineClock } from './TimelineClock';
import { AnimClocks } from './AnimClocks';
import type { Matrix4 } from 'three';

const GltfSource = lazy(() => import('./GltfSource'));

export interface SceneRootProps {
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  bridge: StageBridge;
  data: PartsFile;
  /** Shared fitness data merged into the topic (muscle topics). */
  fitness: FitnessBundle | undefined;
  /** Exercise ids the topic can play (its training.json). */
  playable: ReadonlySet<string>;
  chapters: readonly Chapter[];
  look: StageLook;
}

const NO_IDS: readonly string[] = [];
/** The pipeline's separate skin hands (`skin-hand.l` / `.r`): the exercise body draws procedural hands instead. */
const isSkinHand = (mesh: string | undefined) => mesh !== undefined && mesh.startsWith('skin-hand');
const NO_EQUIPMENT: readonly never[] = [];

/** Label anchor fields from a glb part's measured rest bounds (relative to its centre). */
function boxAnchor(box: Box3Like, at: readonly number[]): { offset: Vec3; half: Vec3; radius: number } {
  const offset: Vec3 = [(box.min[0] + box.max[0]) / 2 - at[0]!, (box.min[1] + box.max[1]) / 2 - at[1]!, (box.min[2] + box.max[2]) / 2 - at[2]!];
  const half: Vec3 = [(box.max[0] - box.min[0]) / 2, (box.max[1] - box.min[1]) / 2, (box.max[2] - box.min[2]) / 2];
  return { offset, half, radius: Math.hypot(half[0], half[1], half[2]) * 0.75 };
}

/** FLOW fade-in (master-spec H: ~0.6 s). */
const RUN_RATE = 5;
/** EXPLODED toggle (master-spec H: ~2 s easeInOut); slider drags follow quickly. */
const EXPLODE_MS = 2000;
const EXPLODE_DRAG_MS = 220;
const NO_LAYERS: readonly string[] = [];
/** Zero offset / extent (stable identity for the part props). */
const NO_HALF: Vec3 = [0, 0, 0];
/** Ink of section hatching and wing veins on the dark plate (darker than the lit surfaces it marks). */
const CINEMA_INK = '#1f2124';
/** The toes' contact point above the model's floor (metres). */
const TOE_LIFT = 0.015;
/** Ink share of the outlined hands' edge: a single hull line, so a little darker than the figure's 55 % hairlines, which cross and double up. */
const HAND_LINE_INK = 0.7;
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

/** Keeps a failing glb from taking the whole stage down (primitives still render); the stage shows the failure note. */
class GltfBoundary extends Component<{ children: ReactNode; ui: SpaceUiStore }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.ui.setState({ model: { state: 'failed', progress: 0 } });
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneRoot({ store, ui, bridge, data, fitness, playable, chapters, look }: SceneRootProps) {
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
      ghosted: st.ghosted,
      solo: st.solo,
      pose: st.pose,
      exercise: st.exercise,
      tints: st.tints,
      sites: st.sites,
      demo: st.demo,
      sim: st.sim,
      transitionId: st.transition.id,
      instant: st.transition.instant,
    })),
  );
  const orbitSession = data.sim?.orbitRotation ? getOrbitSession(store,data.sim) : null;
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
    // Copies that move one by one: an `each` animation, or a try-it `play` turn with `each` (a car's wheels).
    const each = new Set([
      ...data.animations.filter((a) => 'each' in a && a.each).map((a) => a.target),
      ...(data.sim?.bind ?? []).flatMap((b) => ('part' in b && b.play?.each ? (Array.isArray(b.part) ? b.part : [b.part]) : [])),
    ]);
    // Strips a try-it `bend` bends: their main primitive is cut into slabs along the axis they bend about (lib/bend.ts).
    const bent = new Map<string, 0 | 2>();
    for (const b of data.sim?.bind ?? []) {
      if (!('part' in b) || !b.bend) continue;
      const axis = bendAxisIndex(b.bend.axis);
      if (axis) for (const id of Array.isArray(b.part) ? b.part : [b.part]) bent.set(id, axis.index);
    }
    for (const part of data.parts) {
      const shape = primitiveShape(part, each.has(part.id), bent.get(part.id));
      if (shape) out.set(part.id, shape);
    }
    return out;
  }, [data.parts, data.animations, data.sim]);
  useEffect(() => () => primitiveShapes.forEach((sh) => sh.pieces.forEach((p) => p.geometry.dispose())), [primitiveShapes]);

  const meshNames = useMemo(
    () => new Map(data.parts.filter((p) => p.mesh).map((p) => [p.id, p.mesh!] as [string, string])),
    [data.parts],
  );
  const [meshShapes, setMeshShapes] = useState<Map<string, PartShape> | null>(null);
  const [rig, setRig] = useState<GltfRig | null>(null);
  const onMeshShapes = useCallback((m: Map<string, PartShape>, r: GltfRig) => {
    setMeshShapes(m);
    setRig(r);
  }, []);
  const hasModel = data.model !== undefined && meshNames.size > 0;
  useEffect(() => {
    if (hasModel && ui.getState().model.state === 'none') ui.setState({ model: { state: 'loading', progress: 0 } });
  }, [hasModel, ui]);

  // A glb mesh wins over a primitive stand-in once loaded. The skin's hands, split from the skin outline in the glb
  // (`skin-hand.l` / `.r`) and not parts of their own, are drawn with it — except in exercise mode, where every
  // body style shows the procedural hands (Hands.tsx) instead.
  const exerciseOn = s.exercise !== null && playable.has(s.exercise.id) && fitness?.exercises.some((e) => e.id === s.exercise!.id && e.motion) === true;
  const shapes = useMemo(() => {
    const out = new Map(primitiveShapes);
    meshShapes?.forEach((shape, id) => out.set(id, shape));
    const skin = data.parts.find((p) => p.context && p.mesh !== undefined && !p.twinOf && !isSkinHand(p.mesh));
    const outline = skin ? out.get(skin.id) : undefined;
    const hands = ['skin-hand.l', 'skin-hand.r'].filter((n) => !data.parts.some((p) => p.mesh === n)).flatMap((n) => rig?.body.get(n)?.pieces ?? []);
    if (skin && outline && hands.length > 0 && !exerciseOn) out.set(skin.id, { ...outline, pieces: [...outline.pieces, ...hands] });
    return out;
  }, [primitiveShapes, meshShapes, rig, data.parts, exerciseOn]);
  const bounds = useMemo(() => stageBounds(data.parts, shapes), [data.parts, shapes]);
  // Label anchors: from the primitives, or a glb part's measured bounds once it has loaded.
  const glbAnchors = useMemo(() => {
    const out = new Map<string, { offset: Vec3; half: Vec3; radius: number }>();
    meshShapes?.forEach((shape, id) => {
      if (shape.box) out.set(id, boxAnchor(shape.box, shape.position));
    });
    return out;
  }, [meshShapes]);
  // The ARCHITECTURE elevation draws glb parts from their measured rest bounds.
  useEffect(() => {
    if (!meshShapes) return;
    const out = new Map<string, { min: readonly number[]; max: readonly number[] }>();
    meshShapes.forEach((shape, id) => {
      if (shape.box) out.set(id, shape.box);
    });
    ui.setState({ meshBounds: out });
  }, [meshShapes, ui]);
  const anchors = useMemo(() => new Map(data.parts.map((p) => [p.id, glbAnchors.get(p.id)?.offset ?? anchorOffset(p)] as [string, Vec3])), [data.parts, glbAnchors]);
  const points = useMemo(() => new Map(data.parts.map((p) => [p.id, glbAnchors.get(p.id)?.offset ?? anchorPoint(p)] as [string, Vec3])), [data.parts, glbAnchors]);
  const radii = useMemo(() => new Map(data.parts.map((p) => [p.id, glbAnchors.get(p.id)?.radius ?? anchorRadius(p)] as [string, number])), [data.parts, glbAnchors]);
  const halves = useMemo(() => new Map(data.parts.map((p) => [p.id, glbAnchors.get(p.id)?.half ?? anchorHalf(p)] as [string, Vec3])), [data.parts, glbAnchors]);
  const stages = useMemo(() => explodeStages(data.parts), [data.parts]);
  // Group labels: each group's non-context parts with the half extents of their bounds.
  const groupMembers = useMemo<GroupMembers>(() => {
    const out = new Map<string, { id: string; half: Vec3 }[]>();
    for (const p of data.parts) {
      if (p.context || p.group === undefined) continue;
      const b = partBounds(p) ?? shapes.get(p.id)?.box ?? null;
      const r = (shapes.get(p.id)?.radius ?? 0) / Math.sqrt(3);
      const half: Vec3 = b ? [(b.max[0] - b.min[0]) / 2, (b.max[1] - b.min[1]) / 2, (b.max[2] - b.min[2]) / 2] : [r, r, r];
      out.set(p.group, [...(out.get(p.group) ?? []), { id: p.id, half }]);
    }
    return out;
  }, [data.parts, shapes]);
  useEffect(() => {
    // Label budget by camera distance: the subject's radius, not the context around it (M12).
    bridge.modelRadius = bounds.fit.radius;
  }, [bridge, bounds]);
  // The camera frames the subject, not the context around it (M12).
  const sphere = useMemo(() => ({ center: bounds.fit.center, radius: bounds.fit.radius, half: bounds.fit.half }), [bounds]);

  /* ---------------- materials ---------------- */
  const kit = useMemo(() => createTextureKit(), []);
  useEffect(() => () => kit.dispose(), [kit]);
  const groupColors = useMemo(() => new Map(data.groups.map((g) => [g.id, g.color])), [data.groups]);
  const styles = useMemo(() => {
    const cinema = look.theme === 'cinema';
    const signal = resolveDataColor('token:signal', look.tokens, look.theme, '#cc6328');
    const cut = resolveDataColor('token:cut', look.tokens, look.theme, '#b8973c');
    const ink = resolveDataColor('token:ink', look.tokens, look.theme, '#2a2824');
    const cold = resolveDataColor('token:cold', look.tokens, look.theme, '#4f7f8c');
    const styleFor = (slot: { color: string; tint?: string | undefined }): PartStyle => ({
      look: resolveMaterialLook(slot.color, look.tokens, look.theme, slot.tint),
      kit,
      signal,
      cold,
      cut,
      ink: cinema ? CINEMA_INK : ink,
      rim: cinema ? 0.35 : 0.75,
      tint: cinema ? 0.03 : 0.02,
      hatchPx: Math.round(7 * dpr),
    });
    const out = new Map<string, PartStyle[]>();
    for (const part of data.parts) {
      const fallback = (part.group !== undefined ? groupColors.get(part.group) : undefined) ?? 'steel';
      // A glb part's own `material`; a primitive part's slots (a glb mesh replacing a primitive stand-in keeps its material).
      const slots = part.primitive ? partMaterialSlots(part) : [part.material ?? { color: fallback }];
      out.set(part.id, slots.map(styleFor));
    }
    return { parts: out, styleFor };
  }, [data.parts, groupColors, look, kit, dpr]);
  // Wing veins: ink hairlines; on the dark plate a dark ink too (veins read darker than the lit membrane).
  const lineColor = useMemo(
    () => (look.theme === 'cinema' ? CINEMA_INK : resolveDataColor('token:ink-2', look.tokens, look.theme, '#5a544b')),
    [look],
  );

  /* ---------------- explorer state -> display ---------------- */
  // Exercise mode (docs/16 §6.5): prime movers signal, synergists cold, the other muscles faint.
  const exerciseSheet = s.exercise ? fitness?.exercises.find((e) => e.id === s.exercise!.id) : undefined;
  const exerciseLook = useMemo(() => {
    if (!exerciseSheet) return null;
    const parentOf = new Map((fitness?.muscles ?? []).map((m) => [m.id, m.parent]));
    const of = (ids: readonly string[]) => ids.flatMap((m) => musclePartIds(data.parts, m, parentOf));
    const signal = of(exerciseSheet.primary);
    const cold = of(exerciseSheet.secondary);
    const used = new Set([...signal, ...cold, ...of(exerciseSheet.stabilisers)]);
    const faint = data.parts.filter((p) => p.muscle !== undefined && !p.context && !used.has(p.id)).map((p) => p.id);
    return { signal, cold, faint };
  }, [exerciseSheet, fitness, data.parts]);
  const highlight = useMemo(
    () =>
      exerciseLook
        ? { signal: [...exerciseLook.signal, ...(s.tints?.signal ?? NO_IDS)], cold: [...exerciseLook.cold, ...(s.tints?.cold ?? NO_IDS)], custom: s.tints?.custom }
        : s.tints,
    [exerciseLook, s.tints],
  );
  const ghosted = useMemo(() => (exerciseLook ? [...s.ghosted, ...exerciseLook.faint] : s.ghosted), [exerciseLook, s.ghosted]);
  // The skin outline (the topic's skinned context part): the exercise body (docs/06 动作模式数据手册 · body styles).
  const skinPart = useMemo(() => data.parts.find((p) => p.context && p.mesh !== undefined && !p.twinOf && !isSkinHand(p.mesh)) ?? null, [data.parts]);
  const skinShape = skinPart ? shapes.get(skinPart.id) : undefined;
  const skinned = skinShape?.pieces.some((p) => p.skin) === true;
  // The glb's low-poly wire figure (else the wire style decimates the skin outline).
  const wireShape = rig?.body.get('skin-wire') ?? null;
  const uiBody = useStore(ui, (u) => u.exerciseBody);
  const bodyStyle: ExerciseBody = uiBody ?? data.views.exerciseBody ?? (wireShape ? 'wire' : 'mannequin');
  const exercising = exerciseLook !== null && exerciseSheet?.motion !== undefined && playable.has(exerciseSheet.id);
  // The body drawn over the skin while an exercise plays: the wire figure or the mannequin (null: the ghost outline).
  const body = exercising && skinned && bodyStyle !== 'ghost' ? bodyStyle : null;
  const mannequin = body !== null;
  // The hands' look: the body's style (the ghost outline takes the wire's outlined hands).
  const lastBody = useRef<'wire' | 'mannequin'>('wire');
  if (body) lastBody.current = body;
  else if (exercising && bodyStyle === 'ghost') lastBody.current = 'wire';
  const bonesOn = s.exercise?.bones === true;
  // Try-it: the model's outputs for the values on show (the magnets where the pose and bindings put their parts), and what they do to the parts and flows (lib/sim).
  const simRun = useMemo<{ effects: SimEffects; outputs: SimOutputs; frames: MagnetFrames } | null>(() => {
    if (!data.sim) return null;
    const values = resolveSimValues(data.sim, s.sim);
    const { outputs, frames } = orbitSession ? {outputs:orbitSession.outputs,frames:new Map()} : evaluateSimOnStage(data.sim, data, values, s.pose);
    return { effects: simEffects(data.sim, values, outputs), outputs, frames };
  }, [data, s.sim, s.pose]);
  const sim = simRun?.effects ?? null;
  const displays = useMemo(() => {
    const out = resolveAllPartDisplays(data.parts, { view: s.view, part: s.part, layers: s.layers, hidden: s.hidden, ghosted, solo: s.solo, highlight });
    // A part a try-it binding hides fades out like a hidden layer (and is not picked).
    for (const id of sim?.hidden ?? []) {
      const d = out.get(id);
      if (d) out.set(id, { ...d, visible: false, selectable: false, selected: false });
    }
    if (!mannequin) return out;
    // With the mannequin: the skin is drawn by it, the bones (parts that are neither muscle nor context) step aside unless the beat keeps them.
    for (const p of data.parts) {
      const d = out.get(p.id);
      if (!d) continue;
      if (p.id === skinPart?.id || isSkinHand(p.mesh) || (!bonesOn && p.muscle === undefined && !p.context)) out.set(p.id, { ...d, visible: false, hidden: false, selectable: false });
    }
    return out;
  }, [data.parts, s.view, s.part, s.layers, s.hidden, ghosted, s.solo, highlight, mannequin, bonesOn, skinPart, sim]);
  const sitesOn = useMemo(() => activeSites(data.sites, s.part, s.sites), [data.sites, s.part, s.sites]);
  const equipment = useMemo(() => {
    const e = exerciseSheet && playable.has(exerciseSheet.id) ? exerciseSheet.motion?.equipment : undefined;
    return e === undefined ? NO_EQUIPMENT : Array.isArray(e) ? e : [e];
  }, [exerciseSheet, playable]);
  // The palms: the rig's hand bones plus their offset along the forearm (equipment sits there; planted palms stay put).
  const grips = useMemo(() => {
    const grip = (name: string) => {
      const j = data.rig?.joints[name];
      return makeGrip((j && rig?.node(j.node)) ?? null, j?.offset);
    };
    return { l: grip('hand.l'), r: grip('hand.r') };
  }, [rig, data.rig]);
  // The toe tips at rest (the model's floor, its front-most point: a standing body's toes): a push-up hinges there.
  const feet = useMemo<Vec3>(() => [0, bounds.min[1] + TOE_LIFT, bounds.max[2]], [bounds]);
  // The rig's feet on the model's floor (heel and ball under each ankle): standing exercises keep them planted.
  const footing = useMemo(() => {
    const foot = (name: string) => {
      const j = data.rig?.joints[name];
      return makeFoot((j && rig?.node(j.node)) ?? null, bounds.min[1]);
    };
    return { l: foot('ankle.l'), r: foot('ankle.r') };
  }, [rig, data.rig, bounds]);
  // Standing lifts with a long bar under an authored camera: the camera keeps its ends off the HUD side panels.
  const exerciseSpan = useCallback(
    (id: string) => (playable.has(id) ? heldSpan(fitness?.exercises.find((e) => e.id === id)?.motion) : null),
    [fitness, playable],
  );
  // The exercise camera's direction (the posture's default or `motion.camera`) and the body's turn.
  const exerciseView = useCallback(
    (id: string) => {
      const motion = playable.has(id) ? fitness?.exercises.find((e) => e.id === id)?.motion : undefined;
      if (!motion) return null;
      const view = motion.camera ?? EXERCISE_VIEWS[exercisePosture(motion)];
      return { azimuth: view.azimuth, elevation: view.elevation, fill: motion.camera?.fill, yaw: motion.root?.rotation[1] ?? 0 };
    },
    [fitness, playable],
  );
  // What the exercise camera frames: the skin outline's sweep, else the skinned muscles'.
  const sweepMeshes = useCallback((): SkinnedMesh[] => {
    const skin = skinPart ? handles.get(skinPart.id)?.skinned : null;
    if (skin) return [skin];
    return data.parts.filter((p) => !p.context).flatMap((p) => handles.get(p.id)?.skinned ?? []);
  }, [skinPart, handles, data.parts]);
  // The hand joints' bones: the skin's hands give way to the procedural ones.
  const handBones = useMemo(() => {
    const bone = (name: string) => {
      const j = data.rig?.joints[name];
      return (j && rig?.node(j.node)) ?? null;
    };
    return [bone('hand.l'), bone('hand.r')];
  }, [rig, data.rig]);
  // The hands of the exercise on show (kept while the body fades out after it).
  const lastPlans = useRef({ l: RELAXED, r: RELAXED });
  const handPlans = useMemo(() => {
    if (exercising && exerciseSheet?.motion) lastPlans.current = { l: handPlan(exerciseSheet.motion, 'l'), r: handPlan(exerciseSheet.motion, 'r') };
    return lastPlans.current;
  }, [exercising, exerciseSheet]);
  const trunkBone = useMemo(() => {
    const j = data.rig?.joints.trunk;
    return (j && rig?.node(j.node)) ?? null;
  }, [rig, data.rig]);
  const mannequinColor = useMemo(() => resolveDataColor('token:mannequin', look.tokens, look.theme, look.theme === 'cinema' ? '#6f7174' : '#bfb8ac'), [look]);
  // The wire figure's ink, and the outlined hands' fill (the figure's 8 %) and line mixed over the stage.
  const wireInk = useMemo(() => resolveDataColor('token:ink', look.tokens, look.theme, look.theme === 'cinema' ? '#e8e4dc' : '#2a2824'), [look]);
  const handColors = useMemo<HandColors>(() => {
    const stage = new Color(resolveDataColor('token:stage-bg', look.tokens, look.theme, look.theme === 'cinema' ? '#16181b' : '#efe9dc'));
    const over = (k: number) => '#' + stage.clone().lerp(new Color(wireInk), k).getHexString();
    return { solid: mannequinColor, fill: over(WIRE_FILL_OPACITY), line: over(HAND_LINE_INK) };
  }, [look, wireInk, mannequinColor]);
  // Equipment: one neutral matte dark grey, so the muscles stay the subject (docs/16 decision 13).
  const equipmentStyle = useMemo(() => styles.styleFor({ color: 'rubber', tint: 'token:neutral' }), [styles]);
  const rootRef = useRef<Group>(null);
  // Only topics with a rig, contraction or exercises run the MotionDriver (machines and insects never pay for it).
  const needsMotion = useMemo(
    () =>
      data.rig !== undefined ||
      fitness !== undefined ||
      data.animations.some((a) => a.kind === 'contract' || (a.kind === 'sequence' && (jointOf(a.target) !== null || a.keys.some((k) => k.contract !== undefined)))) ||
      Object.values(data.poses ?? {}).some((p) => Object.keys(p.contract).length > 0 || Object.keys(p.joints).length > 0),
    [data.rig, data.animations, data.poses, fitness],
  );

  /* ---------------- poses ---------------- */
  // One stable transform per (pose, part): PartNode eases whenever its target object changes.
  const rest = useMemo<PartTransform>(() => restTransform(), []);
  const poseTargets = useMemo(
    () =>
      new Map(
        Object.entries(data.poses ?? {}).map(([name, pose]) => [
          name,
          new Map(Object.entries(pose.parts).map(([id, entry]) => [id, toTransform(entry)] as [string, PartTransform])),
        ]),
      ),
    [data.poses],
  );
  const poseParts = s.pose ? poseTargets.get(s.pose) : undefined;
  const poseSeconds = s.pose ? (data.poses?.[s.pose]?.duration ?? POSE_DURATION) : POSE_DURATION;
  /** A part's pose: a try-it binding's own (its pose, or rest) over the chapter / beat pose. */
  const partPose = (id: string): { pose: PartTransform; seconds: number } => {
    if (sim?.poses.has(id)) {
      const name = sim.poses.get(id) ?? null;
      return { pose: (name ? poseTargets.get(name)?.get(id) : undefined) ?? rest, seconds: name ? (data.poses?.[name]?.duration ?? POSE_DURATION) : POSE_DURATION };
    }
    return { pose: poseParts?.get(id) ?? rest, seconds: poseSeconds };
  };
  // Try-it glow colours (theme tokens resolved for the stage).
  const glows = useMemo(() => {
    const out = new Map<string, { color: string; level: number }>();
    sim?.glow.forEach((g, id) => out.set(id, { color: resolveDataColor(g.color, look.tokens, look.theme, '#ffc96b'), level: g.level }));
    return out;
  }, [sim, look]);
  const simMoves = useMemo(() => {
    const out = new Map<string, SimMove>();
    for (const id of new Set([...(sim?.offset.keys() ?? []), ...(sim?.rotate.keys() ?? []), ...(sim?.place.keys() ?? [])])) {
      const r = sim?.rotate.get(id);
      out.set(id, { offset: sim?.offset.get(id) ?? [0, 0, 0], offsetSettle: sim?.offsetSettle.get(id), axis: r?.axis ?? [0, 1, 0], deg: r?.deg ?? 0, settle: r?.settle, pivot: r?.pivot, place: sim?.place.get(id) });
    }
    return out;
  }, [sim]);
  const referenceOn = useStore(ui, (u) => u.reference !== null);
  // Shifts (docs/38 §4.3): the parts whose slot changed move one after another in the vector's order; hidden ones (now or just before) stay out of the queue.
  const shiftLast = useRef<{ fx: SimEffects | null; moves: Map<string, ShiftMove>; targets: Map<string, Vec3>; hidden: Set<string> }>({ fx: null, moves: new Map(), targets: new Map(), hidden: new Set() });
  const shiftMoves = useMemo(() => {
    const last = shiftLast.current;
    if (!sim || sim.shift.size === 0) return last.moves.size === 0 ? last.moves : new Map<string, ShiftMove>();
    if (last.fx === sim) return last.moves;
    const delays = shiftDelays(last.targets, sim.shift, new Set([...sim.hidden, ...last.hidden]));
    const moves = new Map<string, ShiftMove>();
    for (const [id, sh] of sim.shift) moves.set(id, { target: sh.offset, shown: !sim.hidden.has(id), delay: delays.get(id) ?? 0, ease: sh.ease, lift: sh.lift });
    shiftLast.current = { fx: sim, moves, targets: new Map([...sim.shift].map(([id, sh]) => [id, sh.offset])), hidden: new Set([...sim.shift.keys()].filter((id) => sim.hidden.has(id))) };
    return moves;
  }, [sim]);
  const simTints = useMemo(() => {
    const out = new Map<string, { color: string; level: number }>();
    sim?.tint.forEach((g, id) => out.set(id, { color: resolveDataColor(g.color, look.tokens, look.theme, '#cc6328'), level: g.level }));
    return out;
  }, [sim, look]);
  // Where the magnets are, as one key: the field is laid out again only when one of them moves.
  const frames = simRun?.frames;
  const placeKey = frames ? [...frames].map(([id, f]) => `${id}:${frameKey(f)}`).join(';') : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `placeKey` stands for `frames`
  const place = useMemo(() => frames, [placeKey]);
  // Filings cards: the needles of the field state on show (laid out once per part, state and place, lib/sim/field.ts).
  const filingCache = useRef(new WeakMap<readonly Filing[], Matrix4[]>());
  const filingSets = useMemo(() => {
    const out = new Map<string, Matrix4[]>();
    sim?.states.forEach((state, id) => {
      const prim = data.parts.find((p) => p.id === id)?.primitive;
      if (prim?.kind !== 'filings') return;
      const filings = ironFilings(data.sim, state, id, filingsCard(prim), place);
      let list = filingCache.current.get(filings);
      if (!list) filingCache.current.set(filings, (list = filingMatrices(filings, prim, true)));
      out.set(id, list);
    });
    return out;
  }, [sim, data.parts, data.sim, place]);
  const linesOf = useCallback((state: string) => (data.sim ? fieldLines(data.sim, state, place) : []), [data.sim, place]);
  const explodeTarget = targetExplodeAmount(s.view, s.explode);
  const anims = useMemo(() => animationsByPart(data.animations), [data.animations]);
  const alwaysOn = useMemo(
    () => data.animations.some((a) => !a.whenRun) || data.flows.some((f) => !f.whenRun),
    [data.animations, data.flows],
  );

  // `half`: the default plane; a name: one of `views.cuts`; anything else: no cut.
  const clipping = useMemo(() => {
    const plane = s.cutaway === 'half' ? (data.views.cutaway ?? { normal: [-1, 0, 0], offset: 0 }) : data.views.cuts?.[s.cutaway];
    if (!plane) return null;
    const n = normalize3(plane.normal);
    return [new Plane(new Vector3(n[0], n[1], n[2]), plane.offset)];
  }, [s.cutaway, data.views]);

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
      {orbitSession && <OrbitClockDriver orbit={orbitSession} />}
      {!orbitSession && <RunClock run={s.run} alwaysOn={alwaysOn} />}
      <AnimClocks animations={data.animations} effects={sim?.animations} bridge={bridge} snapKey={snap.current.key} />
      <ExplodeClock target={explodeTarget} snapKey={snap.current.key} />
      <Lighting look={look} center={bounds.center} radius={bounds.modelRadius} runtime={runtime} shadows={data.views.shadows} />
      <GroundShadow floor={bounds.floor} radius={bounds.radius} look={look} runtime={runtime} shadows={data.views.shadows} />
      {needsMotion && (
        <MotionDriver
          data={data}
          fitness={fitness}
          rig={rig}
          input={{ pose: s.pose, exercise: s.exercise, demo: s.demo }}
          playable={playable}
          rootRef={rootRef}
          center={bounds.fit.center}
          grips={grips}
          feet={feet}
          footing={footing}
          modelFloor={bounds.min[1]}
          sweepMeshes={sweepMeshes}
          bridge={bridge}
          snapKey={snap.current.key}
        />
      )}
      {rig && <primitive object={rig.root} />}
      {equipment.length > 0 && (
        <Equipment specs={equipment} held={false} grips={grips} footing={footing} trunk={trunkBone} style={equipmentStyle} solid={mannequin} thin={body === 'wire'} />
      )}
      {simRun && !orbitSession && <TimelineClock outputs={simRun.outputs} ui={ui} bridge={bridge} snapKey={snap.current.key} still={s.view === 'exploded' || referenceOn} />}
      <group ref={rootRef} matrixAutoUpdate={false}>
      {equipment.length > 0 && <Equipment specs={equipment} held grips={grips} footing={footing} trunk={trunkBone} style={equipmentStyle} solid={mannequin} thin={body === 'wire'} />}
      {skinShape && skinned && <Mannequin shape={skinShape} color={mannequinColor} on={body === 'mannequin'} hands={handBones} />}
      {skinShape && skinned && (wireShape !== null || bodyStyle === 'wire') && (
        <WireBody shape={wireShape ?? skinShape} standIn={wireShape === null} color={wireInk} on={body === 'wire'} hands={handBones} />
      )}
      {skinned && (grips.l || grips.r) && (
        <Hands plans={handPlans} equipment={equipment} grips={grips} style={body ?? lastBody.current} colors={handColors} on={exercising && skinned} />
      )}
      {data.parts.map((part) => {
        const shape = shapes.get(part.id);
        const display = displays.get(part.id);
        const partStyles = styles.parts.get(part.id);
        if (!shape || !display || !partStyles) return null;
        return (
          <PartNode
            key={part.id}
            part={part}
            shape={shape}
            styles={partStyles}
            display={display}
            animations={anims.get(part.id) ?? []}
            {...(() => {
              const pp = partPose(part.id);
              return { pose: pp.pose, poseSeconds: pp.seconds };
            })()}
            glow={glows.get(part.id) ?? null}
            tintColor={display.tintRef ? resolveDataColor(display.tintRef, look.tokens, look.theme) : null}
            count={sim?.count.get(part.id) ?? null}
            simMove={simMoves.get(part.id) ?? null}
            play={sim?.play.get(part.id) ?? null}
            stretch={sim?.stretch.get(part.id) ?? null}
            bend={sim?.bend.get(part.id) ?? null}
            fill={sim?.fill.get(part.id) ?? null}
            fillBridge={bridge}
            fillStill={referenceOn}
            shift={shiftMoves.get(part.id) ?? null}
            simTint={simTints.get(part.id) ?? null}
            filings={filingSets.get(part.id) ?? null}
            animSim={sim?.animations}
            lineColor={lineColor}
            hovered={hovered === part.id}
            clipping={clipping}
            castShadow={
              part.castShadow ?? (!part.context && partStyles[0]!.look.opacity === 1 && shape.radius >= bounds.modelRadius * SHADOW_CASTER_RATIO)
            }
            anchorOffset={anchors.get(part.id) ?? NO_HALF}
            anchorPoint={points.get(part.id) ?? NO_HALF}
            anchorRadius={radii.get(part.id) ?? 0}
            anchorHalf={halves.get(part.id) ?? NO_HALF}
            handles={handles}
            snapKey={snap.current.key}
            stages={stages}
            tintLive={exerciseLook !== null}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}
      {data.sim && data.sim.overlays.length > 0 && simRun && (
        <SimOverlays
          overlays={data.sim.overlays}
          sim={data.sim}
          values={s.sim}
          outputs={simRun.outputs}
          handles={handles}
          displays={displays}
          layers={s.layers}
          exploded={s.view === 'exploded'}
          look={look}
          snapKey={snap.current.key}
          bridge={bridge}
        />
      )}
      </group>
      {/* Flow paths do not follow the parts apart: no particles while exploded (docs/12 §7.5, G16). */}
      {orbitSession && <OrbitDriver orbit={orbitSession} data={data} handles={handles} bridge={bridge} />}
      <Flows bridge={bridge} flows={data.flows} layers={s.view === 'exploded' ? NO_LAYERS : s.layers} look={look} clipping={clipping} effects={sim?.flows} fieldLines={linesOf} />
      <CameraRig
        orbitSession={orbitSession}
        store={store}
        ui={ui}
        bridge={bridge}
        chapters={chapters}
        views={data.views}
        sphere={sphere}
        minDistance={bounds.fit.radius * 0.9}
        span={exerciseSpan}
        exerciseView={exerciseView}
      />
      {hasModel && (
        <GltfBoundary ui={ui}>
          <Suspense fallback={null}>
            <GltfSource url={withBase(data.model!)} meshes={meshNames} ui={ui} onShapes={onMeshShapes} />
          </Suspense>
        </GltfBoundary>
      )}
      {data.sites && <SitesProbe bridge={bridge} handles={handles} sites={data.sites} active={sitesOn} clipping={clipping} />}
      <LabelProbe bridge={bridge} handles={handles} groups={groupMembers} clipping={clipping} xray={s.view === 'xray'} runtime={runtime} />
      <StatsProbe bridge={bridge} />
      <ShadowUpdater runtime={runtime} enabled={!data.views.shadows || data.views.shadows === 'auto'} bridge={bridge} />
      <ResolutionGovernor bridge={bridge} base={stageDpr} />
    </RuntimeContext.Provider>
  );
}
