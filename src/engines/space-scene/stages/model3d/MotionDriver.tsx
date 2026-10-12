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
 *  - the whole body's turn into the exercise position (`motion.root`: XYZ
 *    degrees about the trunk joint — the rig's `trunk`, else the centre of the
 *    non-context parts — then `offset` metres), as the root group's matrix
 *    (`runtime.root`). With equipment the hands push against (`floor`,
 *    `parallel-bars`) the palms stay where the first key puts them and the
 *    body moves instead (a push-up lowers the chest, a dip the whole body);
 *    standing (upright, no bench, floor or bars) the feet stay planted
 *    instead: the body drops and shifts so the lowest heel / ball stays on
 *    the floor and the weight-bearing feet where they stood (lib/stance.ts);
 *  - where that leaves the trunk, the planted palms and the floor
 *    (`runtime.exercise`), for the free-standing equipment and the ground.
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
  demoAngles,
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
import { gripPoint, type Grip } from './grip';
import { equipmentFloor, PLANTED_EQUIPMENT } from '../../lib/equipment';
import { footSlip, isStanding, standCorrection, type FootPair } from '../../lib/stance';
import { footPoints, type Foot } from './foot';
import type { StageBridge } from '../../bridge';

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
const _t2 = new Matrix4();
const _m0 = new Matrix4();
const _now = new Vector3();
const _ref = new Vector3();
const _feet = new Vector3();
const _e = new Euler();
const _v = new Vector3();
const _pl = new Vector3();
const _pr = new Vector3();
const _ax = new Vector3();
const _corr = new Vector3();
const _h = new Vector3();
const _b = new Vector3();

type V3 = [number, number, number];
const v3 = (v: Vector3): V3 => [v.x, v.y, v.z];

/** The exercise's equipment as a list. */
function equipmentOf(e: ExerciseSheet | undefined) {
  const eq = e?.motion?.equipment;
  return eq === undefined ? [] : Array.isArray(eq) ? eq : [eq];
}

export function MotionDriver({
  data,
  fitness,
  rig,
  input,
  playable,
  rootRef,
  center,
  grips,
  feet,
  footing,
  bridge,
  snapKey,
}: {
  data: PartsFile;
  fitness: FitnessBundle | undefined;
  rig: GltfRig | null;
  input: MotionInput;
  /** Exercise ids the topic can play (its training.json). */
  playable: ReadonlySet<string>;
  rootRef: React.RefObject<Group | null>;
  /** Centre of the non-context parts: the exercise turn's pivot when the rig has no `trunk` joint. */
  center: Vec3;
  /** The hands' grip points (planted palms in closed-chain exercises). */
  grips: { l: Grip | null; r: Grip | null };
  /** Where the toes meet the floor at rest (scene y, z; x is the trunk's): a push-up hinges there. */
  feet: Vec3;
  /** The rig's feet (ankle bones with heel and ball contacts): planted in standing exercises. */
  footing: { l: Foot | null; r: Foot | null };
  /** Where the planted feet slipped (QA readout). */
  bridge: StageBridge;
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
  // The exercise turn's pivot: the trunk joint at rest (it never moves with the limbs), else the subject's centre.
  const pivot = useMemo(() => {
    const trunk = joints.get('trunk')?.bone;
    if (trunk) {
      rig?.root.updateMatrixWorld(true);
      return trunk.getWorldPosition(new Vector3());
    }
    return new Vector3(center[0], center[1], center[2]);
  }, [joints, rig, center]);

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
        frame.joints.set(name, { ...(frame.joints.get(name) ?? {}), ...demoAngles(inp.demo.joint, movement, amount, swing) });
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
    /** Closed chain: the exercise whose start-key palms are cached, the palms (skeleton frame), and how planted the body is now (eased). */
    plantedId: '',
    palmRef: [new Vector3(), new Vector3()] as [Vector3, Vector3],
    plantFrom: 0,
    plant: 0,
    /** Standing: the exercise whose start-key feet are cached, the feet there (skeleton frame), and how planted they are now (eased). */
    standId: '',
    footRef: [] as FootPair[],
    standFrom: 0,
    stand: 0,
  });
  useEffect(() => {
    st.current.snap = true;
  }, [snapKey]);

  useFrame((state) => {
    const s = st.current;
    const nowMs = performance.now();
    const key = JSON.stringify([input.pose, input.exercise, input.demo]);
    const exSheet = input.exercise && playable.has(input.exercise.id) ? exercises.get(input.exercise.id) : undefined;
    const equipment = equipmentOf(exSheet);
    const planted = exSheet?.motion !== undefined && grips.l !== null && grips.r !== null && equipment.some((e) => PLANTED_EQUIPMENT.includes(e.kind));
    const soles = [footing.l, footing.r].filter((f): f is Foot => f !== null);
    // Which of them hold the body (`motion.feet`: both, or the standing one of a single-leg move).
    const side = exSheet?.motion?.feet;
    const holds = [footing.l, footing.r].filter((f) => f !== null).map((f) => (side === 'left' ? f === footing.l : side === 'right' ? f === footing.r : true));
    const standing = exSheet?.motion !== undefined && soles.length > 0 && exSheet.motion.feet !== 'free' && isStanding(exSheet.motion.root?.rotation, equipment);
    if (key !== s.key) {
      s.plantFrom = s.plant;
      s.standFrom = s.stand;
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

    // Closed chain / standing: where the palms or the feet are at the exercise's first key (skeleton frame), once per exercise.
    if ((planted && s.plantedId !== exSheet!.id) || (standing && s.standId !== exSheet!.id)) {
      const first = keyFrame(exSheet!, 0);
      for (const [name, j] of joints) {
        const angles = first.joints.get(name);
        const q = angles ? anglesQuat(j.axes, foldAngles(j.sceneAxes, angles)) : null;
        j.bone.quaternion.copy(j.rest);
        if (q) j.bone.quaternion.premultiply(_qa.set(q[0], q[1], q[2], q[3]));
      }
      rig?.root.updateMatrixWorld(true);
      if (planted) {
        gripPoint(grips.l!, s.palmRef[0], _ax);
        gripPoint(grips.r!, s.palmRef[1], _ax);
        s.plantedId = exSheet!.id;
      }
      if (standing) {
        s.footRef = soles.map((f) => {
          footPoints(f, _h, _b);
          return { heel: v3(_h), ball: v3(_b) };
        });
        s.standId = exSheet!.id;
      }
    }
    s.plant = s.plantFrom + ((planted ? 1 : 0) - s.plantFrom) * k;
    s.stand = s.standFrom + ((standing ? 1 : 0) - s.standFrom) * k;

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

    // The body's turn (exercise position), about the trunk joint; planted palms stay put.
    const g = rootRef.current;
    if (g) {
      const { rotation: r, offset: o } = frame.root;
      _e.set(r[0] * DEG2RAD, r[1] * DEG2RAD, r[2] * DEG2RAD, 'XYZ');
      // M0: the turn and offset as written.
      _m0.makeTranslation(pivot.x + o[0], pivot.y + o[1], pivot.z + o[2])
        .multiply(_t.makeRotationFromEuler(_e))
        .multiply(_t.makeTranslation(-pivot.x, -pivot.y, -pivot.z));
      _m.copy(_m0);
      let slip: number | null = null;
      if (s.stand > 0 && s.standId !== '' && s.footRef.length === soles.length) {
        // Standing: the feet now and at the first key, in the scene under M0; the body moves so they stay planted.
        const now = soles.map((f): FootPair => {
          footPoints(f, _h, _b);
          return { heel: v3(_h.applyMatrix4(_m0)), ball: v3(_b.applyMatrix4(_m0)) };
        });
        const ref = s.footRef.map((f): FootPair => ({
          heel: v3(_h.set(...f.heel).applyMatrix4(_m0)),
          ball: v3(_b.set(...f.ball).applyMatrix4(_m0)),
        }));
        const c = standCorrection(now, ref, holds);
        _m.premultiply(_t.makeTranslation(c[0] * s.stand, c[1] * s.stand, c[2] * s.stand));
        // QA: how far the weight-bearing feet still slide once moved (two feet share one correction).
        if (s.stand === 1) slip = footSlip(now, ref, c, holds);
      }
      bridge.footSlip = slip;
      if (s.plant > 0 && grips.l && grips.r && s.plantedId !== '') {
        // Palms now and at the first key, in the scene under M0.
        gripPoint(grips.l, _pl, _ax);
        gripPoint(grips.r, _pr, _ax);
        _now.addVectors(_pl, _pr).multiplyScalar(0.5).applyMatrix4(_m0);
        _ref.addVectors(s.palmRef[0], s.palmRef[1]).multiplyScalar(0.5).applyMatrix4(_m0);
        if (equipment.some((e) => e.kind === 'floor')) {
          // On the floor the body hinges about its feet (a push-up lowers the chest toward the hands).
          _feet.set(pivot.x, feet[1], feet[2]).applyMatrix4(_m0);
          const vy = _now.y - _feet.y;
          const vz = _now.z - _feet.z;
          const rho = Math.hypot(vy, vz);
          if (rho > 1e-6) {
            const beta = Math.atan2(vz, vy);
            const c = Math.acos(Math.min(1, Math.max(-1, (_ref.y - _feet.y) / rho)));
            const d1 = c - beta;
            const d2 = -c - beta;
            const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
            const delta = (Math.abs(wrap(d1)) < Math.abs(wrap(d2)) ? wrap(d1) : wrap(d2)) * s.plant;
            _m.makeTranslation(_feet.x, _feet.y, _feet.z)
              .multiply(_t.makeRotationX(delta))
              .multiply(_t2.makeTranslation(-_feet.x, -_feet.y, -_feet.z))
              .multiply(_m0);
          }
        } else {
          // On bars the body hangs from its hands: it moves, they stay.
          _corr.subVectors(_ref, _now).multiplyScalar(s.plant);
          _m.premultiply(_t.makeTranslation(_corr.x, _corr.y, _corr.z));
        }
      }
      if (!_m.equals(g.matrix)) {
        g.matrix.copy(_m);
        g.matrixWorldNeedsUpdate = true;
        runtime.root.copy(_m);
        moved = true;
      }
      // Where the free-standing equipment and the ground go (from M0: they do not ride on the correction).
      if (exSheet?.motion && equipment.length > 0) {
        const ex = runtime.exercise ?? { trunk: new Vector3(), palms: null, floor: null };
        ex.trunk.copy(pivot).applyMatrix4(_m0);
        if (planted) {
          const palms = ex.palms ?? [new Vector3(), new Vector3()];
          palms[0].copy(s.palmRef[0]).applyMatrix4(_m0);
          palms[1].copy(s.palmRef[1]).applyMatrix4(_m0);
          ex.palms = palms;
        } else ex.palms = null;
        ex.floor = equipmentFloor(
          equipment,
          [ex.trunk.x, ex.trunk.y, ex.trunk.z],
          ex.palms ? [[ex.palms[0].x, ex.palms[0].y, ex.palms[0].z], [ex.palms[1].x, ex.palms[1].y, ex.palms[1].z]] : null,
        );
        runtime.exercise = ex;
      } else runtime.exercise = null;
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
