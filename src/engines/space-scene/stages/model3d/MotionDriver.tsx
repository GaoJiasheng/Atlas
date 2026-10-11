/**
 * MotionDriver: the stage's body motion (docs/16 §6.4–§6.5; lib/rig.ts).
 * Every frame it works out
 *
 *  - the rig's joint angles: the pose's `joint:<name>` entries, else the
 *    exercise on show (its keys held at `start` / `end`, or looped at its
 *    tempo), else the muscle sheet's action demo, plus joint clips while the
 *    scene runs; written to the glb bones (rest rotation × the angles about
 *    the joint's anatomical axes, which travel with the parent bone);
 *  - contraction per part (`runtime.contract`): the pose's `contract`, the
 *    exercise keys' (muscle ids → the parts that show them), the demo's, part
 *    clips' `contract` and `contract` animations;
 *  - the whole body's turn into the exercise position (`motion.root`), about
 *    the model centre, as the root group's matrix (`runtime.root`).
 *
 * A change of pose / exercise / phase / demo eases from wherever the body is
 * to the new target over the pose's duration (0.8 s by default; instant
 * transitions jump), and a loop starts once it has arrived.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3, type Group, type Object3D } from 'three';
import type { ExercisePhase, Movement } from '../../../../lib/anatomy';
import type { ExerciseSheet, FitnessBundle } from '../../../../content/schema/fitness';
import type { PartsFile } from '../../schema';
import type { SpaceSceneExt } from '../../index';
import { POSE_DURATION, smoothstep01 } from '../../lib/pose';
import { DEG2RAD, type Vec3 } from '../../lib/math';
import {
  anglesQuat,
  bothSides,
  canMove,
  contractLevel,
  DEFAULT_DEMO_ANGLE,
  DEMO_PERIOD,
  exerciseLoop,
  foldAngles,
  jointOf,
  lerpAngles,
  musclePartIds,
  sampleAngles,
  sampleContract,
  type Angles,
} from '../../lib/rig';
import { keepAnimating, useRuntime } from './runtime';
import type { GltfRig } from './GltfSource';

interface Joint {
  bone: Object3D;
  rest: Quaternion;
  /** Axes in the parent bone's rest frame, in the rig's order. */
  axes: Partial<Record<Movement, Vec3>>;
  /** Axes as written (scene frame): what the angles fold onto. */
  sceneAxes: Partial<Record<Movement, readonly number[]>>;
}

/** What the body is doing at one instant. */
interface Frame {
  joints: Map<string, Angles>;
  contract: Map<string, number>;
  root: { rotation: Vec3; offset: Vec3 };
}

const REST_ROOT = { rotation: [0, 0, 0] as Vec3, offset: [0, 0, 0] as Vec3 };
const emptyFrame = (): Frame => ({ joints: new Map(), contract: new Map(), root: REST_ROOT });

function mixFrames(a: Frame, b: Frame, k: number): Frame {
  const joints = new Map<string, Angles>();
  for (const name of new Set([...a.joints.keys(), ...b.joints.keys()])) joints.set(name, lerpAngles(a.joints.get(name) ?? {}, b.joints.get(name) ?? {}, k));
  const contract = new Map<string, number>();
  for (const id of new Set([...a.contract.keys(), ...b.contract.keys()])) contract.set(id, (a.contract.get(id) ?? 0) + ((b.contract.get(id) ?? 0) - (a.contract.get(id) ?? 0)) * k);
  const lerp3 = (x: Vec3, y: Vec3): Vec3 => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k];
  return { joints, contract, root: { rotation: lerp3(a.root.rotation, b.root.rotation), offset: lerp3(a.root.offset, b.root.offset) } };
}

export interface MotionInput {
  pose: string | null;
  exercise: SpaceSceneExt['exercise'];
  demo: SpaceSceneExt['demo'];
}

const _q = new Quaternion();
const _qa = new Quaternion();
const _m = new Matrix4();
const _t = new Matrix4();
const _e = new Euler();
const _v = new Vector3();

export function MotionDriver({
  data,
  fitness,
  rig,
  input,
  playable,
  rootRef,
  center,
  snapKey,
}: {
  data: PartsFile;
  fitness: FitnessBundle | undefined;
  rig: GltfRig | null;
  input: MotionInput;
  /** Exercise ids the topic can play (its training.json). */
  playable: ReadonlySet<string>;
  rootRef: React.RefObject<Group | null>;
  /** The assembled model's centre (the exercise turn's pivot). */
  center: Vec3;
  snapKey: number;
}) {
  const runtime = useRuntime();
  const rigJoints = useMemo(() => new Set(Object.keys(data.rig?.joints ?? {})), [data.rig]);

  // Bones of the rig joints, their rest rotation and axes in the parent's rest frame.
  const joints = useMemo(() => {
    const out = new Map<string, Joint>();
    if (!rig || !data.rig) return out;
    rig.root.updateMatrixWorld(true);
    for (const [name, spec] of Object.entries(data.rig.joints)) {
      const bone = rig.node(spec.node);
      if (!bone) continue;
      const parentRest = bone.parent ? bone.parent.getWorldQuaternion(new Quaternion()).invert() : new Quaternion();
      const axes: Partial<Record<Movement, Vec3>> = {};
      for (const [movement, axis] of Object.entries(spec.axes) as [Movement, Vec3][]) {
        _v.set(axis[0], axis[1], axis[2]).normalize().applyQuaternion(parentRest);
        axes[movement] = [_v.x, _v.y, _v.z];
      }
      out.set(name, { bone, rest: bone.quaternion.clone(), axes, sceneAxes: spec.axes });
    }
    return out;
  }, [rig, data.rig]);
  useEffect(
    () => () => {
      for (const j of joints.values()) j.bone.quaternion.copy(j.rest);
    },
    [joints],
  );

  const exercises = useMemo(() => new Map((fitness?.exercises ?? []).map((e) => [e.id, e])), [fitness]);
  const parentOf = useMemo(() => new Map((fitness?.muscles ?? []).map((m) => [m.id, m.parent])), [fitness]);
  // Exercise key contraction (muscle ids) → part ids, once per exercise.
  const muscleParts = useMemo(() => {
    const cache = new Map<string, string[]>();
    return (muscle: string) => {
      let ids = cache.get(muscle);
      if (!ids) cache.set(muscle, (ids = musclePartIds(data.parts, muscle, parentOf)));
      return ids;
    };
  }, [data.parts, parentOf]);
  const clips = useMemo(() => data.animations.filter((a) => a.kind === 'sequence' && (jointOf(a.target) !== null || a.keys.some((k) => k.contract !== undefined))), [data.animations]);
  const pulses = useMemo(() => data.animations.filter((a) => a.kind === 'contract'), [data.animations]);
  const poseFrames = useMemo(() => {
    const out = new Map<string, Frame>();
    for (const [name, pose] of Object.entries(data.poses ?? {}))
      out.set(name, { joints: new Map(Object.entries(pose.joints)), contract: new Map(Object.entries(pose.contract)), root: REST_ROOT });
    return out;
  }, [data.poses]);

  /** A key of an exercise as a frame (both sides, muscle contraction on its parts). */
  const keyFrame = (e: ExerciseSheet, i: number): Frame => {
    const key = e.motion!.keys[i]!;
    const contract = new Map<string, number>();
    for (const k of e.motion!.keys) for (const m of Object.keys(k.contract ?? {})) for (const id of muscleParts(m)) contract.set(id, 0);
    for (const [m, c] of Object.entries(key.contract ?? {})) for (const id of muscleParts(m)) contract.set(id, c);
    const root = e.motion!.root;
    return {
      joints: new Map(Object.entries(bothSides(key.joints, rigJoints))),
      contract,
      root: root ? { rotation: [...root.rotation] as Vec3, offset: [...(root.offset ?? [0, 0, 0])] as Vec3 } : REST_ROOT,
    };
  };

  /** The target frame of the current input `t` seconds after it began (and has eased in). */
  const target = (inp: MotionInput, t: number): { frame: Frame; moving: boolean } => {
    const ex = inp.exercise && playable.has(inp.exercise.id) ? exercises.get(inp.exercise.id) : undefined;
    const base = inp.pose ? poseFrames.get(inp.pose) : undefined;
    if (ex?.motion) {
      const phase: ExercisePhase = inp.exercise!.phase;
      const keys = ex.motion.keys;
      let frame: Frame;
      if (phase === 'start') frame = keyFrame(ex, 0);
      else if (phase === 'end') frame = keyFrame(ex, keys.length - 1);
      else {
        const at = exerciseLoop(keys.length, ex.motion.tempo, t);
        frame = at.from === at.to ? keyFrame(ex, at.from) : mixFrames(keyFrame(ex, at.from), keyFrame(ex, at.to), at.k);
      }
      // A pose's own joints stay where the exercise does not move them.
      if (base) for (const [name, angles] of base.joints) if (!frame.joints.has(name)) frame.joints.set(name, angles);
      return { frame, moving: phase === 'loop' };
    }
    if (inp.demo) {
      const frame: Frame = { joints: new Map(base?.joints ?? []), contract: new Map(base?.contract ?? []), root: REST_ROOT };
      const swing = (1 - Math.cos((2 * Math.PI * t) / DEMO_PERIOD)) / 2;
      const side = inp.demo.part.endsWith('-r') ? '.r' : '.l';
      const movement = inp.demo.movement as Movement;
      const amount = data.rig?.demo?.[inp.demo.joint as keyof NonNullable<NonNullable<PartsFile['rig']>['demo']>]?.[movement] ?? DEFAULT_DEMO_ANGLE;
      for (const name of [`${inp.demo.joint}${side}`, inp.demo.joint]) {
        const j = joints.get(name);
        if (!j || !canMove(j.sceneAxes, movement)) continue;
        frame.joints.set(name, { ...(frame.joints.get(name) ?? {}), [movement]: amount * swing });
        break;
      }
      frame.contract.set(inp.demo.part, swing * 0.8);
      return { frame, moving: true };
    }
    return { frame: base ?? emptyFrame(), moving: false };
  };

  const st = useRef({
    key: '',
    from: emptyFrame(),
    now: emptyFrame(),
    t0: 0,
    ms: 0,
    snap: true,
    wrote: false,
  });
  useEffect(() => {
    st.current.snap = true;
  }, [snapKey]);

  useFrame((state) => {
    const s = st.current;
    const nowMs = performance.now();
    const key = JSON.stringify([input.pose, input.exercise, input.demo]);
    if (key !== s.key) {
      s.key = key;
      s.from = s.now;
      s.t0 = nowMs;
      s.ms = (input.pose ? (data.poses?.[input.pose]?.duration ?? POSE_DURATION) : POSE_DURATION) * 1000;
    }
    if (s.snap) {
      s.snap = false;
      s.ms = 0;
    }
    const since = nowMs - s.t0;
    const k = s.ms > 0 ? smoothstep01(since / s.ms) : 1;
    const goal = target(input, Math.max(0, since - s.ms) / 1000);
    let frame = k < 1 ? mixFrames(s.from, goal.frame, k) : goal.frame;
    s.now = frame;

    // Clips and contraction pulses while the scene runs (always-on ones from load).
    let running = false;
    if (clips.length || pulses.length) {
      frame = { joints: new Map(frame.joints), contract: new Map(frame.contract), root: frame.root };
      for (const a of clips) {
        if (a.kind !== 'sequence') continue;
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) continue;
        running = true;
        const t = always ? runtime.elapsed : runtime.phase;
        const w = always ? 1 : runtime.energy;
        const joint = jointOf(a.target);
        if (joint !== null) {
          const add = sampleAngles(a.keys, t, a.loop);
          const sum = { ...(frame.joints.get(joint) ?? {}) };
          for (const [m, deg] of Object.entries(add) as [Movement, number][]) sum[m] = (sum[m] ?? 0) + deg * w;
          frame.joints.set(joint, sum);
        } else {
          const c = sampleContract(a.keys, t, a.loop);
          if (c !== null) frame.contract.set(a.target, Math.max(frame.contract.get(a.target) ?? 0, c * w));
        }
      }
      for (const a of pulses) {
        if (a.kind !== 'contract') continue;
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) continue;
        running = true;
        const c = contractLevel(a.amount, a.hz, always ? runtime.elapsed : runtime.phase, always ? 1 : runtime.energy);
        frame.contract.set(a.target, Math.max(frame.contract.get(a.target) ?? 0, c));
      }
    }

    // Bones.
    let moved = false;
    for (const [name, j] of joints) {
      const angles = frame.joints.get(name);
      const q = angles ? anglesQuat(j.axes, foldAngles(j.sceneAxes, angles)) : null;
      _q.copy(j.rest);
      if (q) _q.premultiply(_qa.set(q[0], q[1], q[2], q[3]));
      if (!_q.equals(j.bone.quaternion)) {
        j.bone.quaternion.copy(_q);
        moved = true;
      }
    }

    // The bones' world matrices now (sites, equipment and skinned anchors read them this frame).
    if (moved && rig) rig.root.updateMatrixWorld(true);

    // Contraction.
    runtime.contract.clear();
    for (const [id, c] of frame.contract) if (c > 0) runtime.contract.set(id, Math.min(1, c));

    // The body's turn (exercise position), about the model centre.
    const g = rootRef.current;
    if (g) {
      const { rotation: r, offset: o } = frame.root;
      _e.set(r[0] * DEG2RAD, r[1] * DEG2RAD, r[2] * DEG2RAD, 'XYZ');
      _m.makeTranslation(center[0] + o[0], center[1] + o[1], center[2] + o[2])
        .multiply(_t.makeRotationFromEuler(_e))
        .multiply(_t.makeTranslation(-center[0], -center[1], -center[2]));
      if (!_m.equals(g.matrix)) {
        g.matrix.copy(_m);
        g.matrixWorldNeedsUpdate = true;
        runtime.root.copy(_m);
        moved = true;
      }
    }
    // Bone motion re-projects the labels every frame but re-checks their occlusion (raycasts) only once it stops.
    if (moved) {
      runtime.bonesMoved++;
      runtime.shadowDirty = true;
    } else if (s.wrote) runtime.moved++;
    s.wrote = moved;
    if (k < 1 || goal.moving || running || moved) keepAnimating(state.invalidate);
  });
  return null;
}
