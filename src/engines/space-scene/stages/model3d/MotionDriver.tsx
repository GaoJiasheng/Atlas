/**
 * MotionDriver: the stage's body motion (docs/16 §6.4–§6.5; docs/06
 * 动作模式数据手册; lib/rig.ts). Every frame it works out
 *
 *  - the rig's joint angles: the pose's `joint:<name>` entries, else the
 *    exercise on show (its keys held at `start` / `end`, or looped at its
 *    tempo), else the muscle sheet's action demo, plus joint clips while the
 *    scene runs; written to the glb bones (rest rotation × the angles about
 *    the joint's anatomical axes, which travel with the parent bone);
 *  - contraction per part (`runtime.contract`): in an exercise, computed from
 *    the joint angles and the muscle sheets' actions (lib/contraction.ts),
 *    a key's hand-typed `contract` overriding it per muscle; the pose's
 *    `contract`, the demo's, part clips' `contract` and `contract` animations;
 *  - the whole body's turn into the exercise position (`motion.root`: XYZ
 *    degrees about the trunk joint — the rig's `trunk`, else the centre of the
 *    non-context parts — then `offset` metres), as the root group's matrix
 *    (`runtime.root`), corrected by the contact solver (lib/contact.ts): the
 *    first of `motion.contacts` stays where the first key put it — the palms
 *    on a pull-up bar, dip bars or the floor (the body translates, or pivots
 *    about the feet on the floor), or the planted feet (lib/stance.ts);
 *  - where that leaves the trunk, the palms, the feet and the floor
 *    (`runtime.exercise`), for the free-standing equipment and the ground;
 *  - once per exercise, the points the mannequin sweeps over its keys
 *    (`bridge.exerciseFrame`): the exercise camera frames them.
 *
 * A change of pose / exercise / phase / demo eases from wherever the body is
 * to the new target over the pose's duration (0.8 s by default; instant
 * transitions jump), and a loop starts once it has arrived.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3, type Group, type Object3D, type SkinnedMesh } from 'three';
import { equipmentList, otherSideJoint, type ExercisePhase, type Movement } from '../../../../lib/anatomy';
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
  jointCandidates,
  jointOf,
  lerpAngles,
  midlineNormal,
  mirrorSignedAxes,
  musclePartIds,
  sampleAngles,
  sampleContract,
  type Angles,
} from '../../lib/rig';
import { contractionAt, contractionPlan, type ContractionPlan } from '../../lib/contraction';
import { contactPlan, handsCorrection, hingeAngle, NO_CONTACT, type ContactPlan } from '../../lib/contact';
import { keepAnimating, useRuntime } from './runtime';
import type { GltfRig } from './GltfSource';
import { gripPoint, type Grip } from './grip';
import { defaultContacts, equipmentFloor, EQUIPMENT_INFO, PRESS_SURFACES } from '../../lib/equipment';
import { footSlip, standCorrection, type FootPair } from '../../lib/stance';
import { footPoints, type Foot } from './foot';
import type { StageBridge } from '../../bridge';

interface Joint {
  bone: Object3D;
  rest: Quaternion;
  /** Axes in the parent bone's rest frame, in the rig's order. */
  axes: Partial<Record<Movement, Vec3>>;
  /** Axes in the scene frame (a right joint's signed against its left one's mirror): what the angles fold onto. */
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

/** What an exercise needs, worked out once (contraction plan, contacts). */
interface ExercisePrep {
  sheet: ExerciseSheet;
  plan: ContractionPlan;
  /** Parts whose contraction a key types by hand. */
  keyed: Set<string>;
  contacts: ContactPlan;
}

/** Skinned-mesh vertices sampled per pose when measuring an exercise's sweep. */
const EXTENT_SAMPLES = 600;

const _q = new Quaternion();
const _qa = new Quaternion();
const _m = new Matrix4();
const _t = new Matrix4();
const _t2 = new Matrix4();
const _m0 = new Matrix4();
const _mx = new Matrix4();
const _c = new Matrix4();
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
  modelFloor,
  sweepMeshes,
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
  /** The hands' grip points (palms held still by bars or the floor). */
  grips: { l: Grip | null; r: Grip | null };
  /** Where the toes meet the floor at rest (scene y, z; x is the trunk's): a push-up pivots there when the rig has no feet. */
  feet: Vec3;
  /** The rig's feet (ankle bones with heel and ball contacts): planted in standing exercises. */
  footing: { l: Foot | null; r: Foot | null };
  /** The model's floor at rest (scene y). */
  modelFloor: number;
  /** Skinned meshes whose sweep the exercise camera frames (the skin outline, else the muscles). */
  sweepMeshes: () => SkinnedMesh[];
  /** Planted-feet slip and the exercise sweep (QA, camera). */
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
      // A right joint: its axes signed so its left counterpart's angles make the mirror movement.
      const left = name.endsWith('.r') ? data.rig.joints[otherSideJoint(name)] : undefined;
      const leftBone = left ? rig.node(left.node) : null;
      const sceneAxes =
        left && leftBone
          ? mirrorSignedAxes(left.axes, spec.axes, midlineNormal(v3(leftBone.getWorldPosition(_pl)), v3(bone.getWorldPosition(_pr))))
          : spec.axes;
      const axes: Partial<Record<Movement, Vec3>> = {};
      for (const [movement, axis] of Object.entries(sceneAxes) as [Movement, readonly number[]][]) {
        _v.set(axis[0]!, axis[1]!, axis[2]!).normalize().applyQuaternion(parentRest);
        axes[movement] = [_v.x, _v.y, _v.z];
      }
      out.set(name, { bone, rest: bone.quaternion.clone(), axes, sceneAxes });
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
  const muscleSheets = useMemo(() => new Map((fitness?.muscles ?? []).map((m) => [m.id, m])), [fitness]);
  // Exercise key contraction (muscle ids) → part ids, once per exercise.
  const muscleParts = useMemo(() => {
    const cache = new Map<string, string[]>();
    return (muscle: string) => {
      let ids = cache.get(muscle);
      if (!ids) cache.set(muscle, (ids = musclePartIds(data.parts, muscle, parentOf)));
      return ids;
    };
  }, [data.parts, parentOf]);
  const hasHands = grips.l !== null && grips.r !== null;
  // The knees (kneeling contacts, a hinge about them).
  const kneeBones = useMemo(() => ['knee.l', 'knee.r'].flatMap((n) => joints.get(n)?.bone ?? []), [joints]);
  const soles = useMemo(() => [footing.l, footing.r].filter((f): f is Foot => f !== null), [footing]);
  // Per exercise: the contraction plan from the muscle sheets' actions and the contacts the rig can keep.
  const preps = useMemo(() => {
    const cache = new Map<string, ExercisePrep>();
    return (sheet: ExerciseSheet): ExercisePrep => {
      let p = cache.get(sheet.id);
      if (p) return p;
      const motion = sheet.motion!;
      const keys = motion.keys.map((k) => bothSides(k.joints, rigJoints));
      const plan = contractionPlan({ exercise: sheet, muscles: muscleSheets, parts: data.parts, rigJoints, keys });
      const keyed = new Set(motion.keys.flatMap((k) => Object.keys(k.contract ?? {})).flatMap((m) => muscleParts(m)));
      const equipment = equipmentList(motion.equipment);
      const onFloor = equipment.some((e) => PRESS_SURFACES.has(e.kind));
      const contacts = contactPlan(
        defaultContacts(motion),
        { hands: hasHands, handL: grips.l !== null, handR: grips.r !== null, feet: soles.length > 0 && motion.feet !== 'free', knees: kneeBones.length === 2 },
        onFloor,
        motion.contacts !== undefined,
      );
      p = { sheet, plan, keyed, contacts };
      cache.set(sheet.id, p);
      return p;
    };
  }, [rigJoints, muscleSheets, data.parts, muscleParts, hasHands, grips, soles, kneeBones]);

  const clips = useMemo(() => data.animations.filter((a) => a.kind === 'sequence' && (jointOf(a.target) !== null || a.keys.some((k) => k.contract !== undefined))), [data.animations]);
  const pulses = useMemo(() => data.animations.filter((a) => a.kind === 'contract'), [data.animations]);
  const poseFrames = useMemo(() => {
    const out = new Map<string, Frame>();
    for (const [name, pose] of Object.entries(data.poses ?? {}))
      out.set(name, { joints: new Map(Object.entries(pose.joints)), contract: new Map(Object.entries(pose.contract)), root: REST_ROOT });
    return out;
  }, [data.poses]);

  /** A key of an exercise as a frame (both sides; a key's hand-typed contraction on the parts showing that muscle). */
  const keyFrame = (e: ExerciseSheet, i: number): Frame => {
    const key = e.motion!.keys[i]!;
    const contract = new Map<string, number>();
    for (const k of e.motion!.keys) for (const m of Object.keys(k.contract ?? {})) for (const id of muscleParts(m)) contract.set(id, 0);
    for (const [m, c] of Object.entries(key.contract ?? {})) for (const id of muscleParts(m)) contract.set(id, c);
    // The key's own body turn (a curl-up tilts between keys), else the motion's.
    const root = key.root ?? e.motion!.root;
    return {
      joints: new Map(Object.entries(bothSides(key.joints, rigJoints))),
      contract,
      root: root ? { rotation: [...root.rotation] as Vec3, offset: [...(root.offset ?? [0, 0, 0])] as Vec3 } : REST_ROOT,
    };
  };

  /** An exercise frame with its contraction: computed from the joints, a key's hand-typed value where it gives one. */
  const withContraction = (prep: ExercisePrep, frame: Frame): Frame => {
    for (const [id, c] of contractionAt(prep.plan, frame.joints)) if (!prep.keyed.has(id)) frame.contract.set(id, c);
    return frame;
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
      return { frame: withContraction(preps(ex), frame), moving: phase === 'loop' };
    }
    if (inp.demo) {
      const frame: Frame = { joints: new Map(base?.joints ?? []), contract: new Map(base?.contract ?? []), root: REST_ROOT };
      const swing = (1 - Math.cos((2 * Math.PI * t) / DEMO_PERIOD)) / 2;
      const side = inp.demo.part.endsWith('-r') ? '.r' : '.l';
      const movement = inp.demo.movement as Movement;
      const amount = data.rig?.demo?.[inp.demo.joint as keyof NonNullable<NonNullable<PartsFile['rig']>['demo']>]?.[movement] ?? DEFAULT_DEMO_ANGLE;
      for (const name of jointCandidates(inp.demo.joint, movement, side === '.r' ? 'r' : 'l')) {
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
    /** Hands held still: the exercise whose start-key palms are cached, the palms (skeleton frame), translate or hinge, and how held the body is now (eased). */
    plantedId: '',
    /** The held point at the first key (skeleton frame): the palms' midpoint, one palm, or the knees' midpoint. */
    heldRef: new Vector3(),
    held: 'both' as 'both' | 'l' | 'r' | 'knees',
    pivotKnees: false,
    hinge: false,
    plantFrom: 0,
    plant: 0,
    /** Feet planted: the exercise whose start-key feet are cached, the feet there (skeleton frame), and how planted they are now (eased). */
    standId: '',
    footRef: [] as FootPair[],
    standFrom: 0,
    stand: 0,
    /** The exercise whose start-key palms / feet (skeleton frame) the equipment is placed from. */
    startId: '',
    palmStart: null as [Vector3, Vector3] | null,
    ballStart: null as Vector3 | null,
    kneeStart: null as Vector3 | null,
    /** The first key's root matrix (M0): with per-key root turns, the contacts and the equipment stay where it put them. */
    rootStart: new Matrix4(),
    rootVaries: false,
    /** The exercise whose sweep the camera has (`bridge.exerciseFrame`). */
    sweepId: '',
  });
  useEffect(() => {
    st.current.snap = true;
  }, [snapKey]);

  /** Write a frame's joint angles to the bones (true when any bone turned). */
  const writeBones = (frameJoints: ReadonlyMap<string, Angles>): boolean => {
    let moved = false;
    for (const [name, j] of joints) {
      const angles = frameJoints.get(name);
      const q = angles ? anglesQuat(j.axes, foldAngles(j.sceneAxes, angles)) : null;
      _q.copy(j.rest);
      if (q) _q.premultiply(_qa.set(q[0], q[1], q[2], q[3]));
      if (!_q.equals(j.bone.quaternion)) {
        j.bone.quaternion.copy(_q);
        moved = true;
      }
    }
    return moved;
  };

  /** M0: the root turn and offset as written, about the pivot. */
  const rootMatrix = (root: Frame['root'], out: Matrix4): Matrix4 => {
    const { rotation: r, offset: o } = root;
    _e.set(r[0] * DEG2RAD, r[1] * DEG2RAD, r[2] * DEG2RAD, 'XYZ');
    return out
      .makeTranslation(pivot.x + o[0], pivot.y + o[1], pivot.z + o[2])
      .multiply(_t.makeRotationFromEuler(_e))
      .multiply(_t.makeTranslation(-pivot.x, -pivot.y, -pivot.z));
  };

  /** The held point now (skeleton frame; world matrices current): the palms' midpoint, one palm or the knees' midpoint; false when the rig lacks it. */
  const heldPoint = (held: 'both' | 'l' | 'r' | 'knees', out: Vector3): boolean => {
    if (held === 'knees') {
      if (kneeBones.length < 2) return false;
      kneeBones[0]!.getWorldPosition(out);
      out.add(kneeBones[1]!.getWorldPosition(_pr)).multiplyScalar(0.5);
      return true;
    }
    const one = held === 'l' ? grips.l : held === 'r' ? grips.r : null;
    if (one) {
      gripPoint(one, out, _ax);
      return true;
    }
    if (held !== 'both' || !grips.l || !grips.r) return false;
    gripPoint(grips.l, _pl, _ax);
    gripPoint(grips.r, _pr, _ax);
    out.addVectors(_pl, _pr).multiplyScalar(0.5);
    return true;
  };

  /**
   * The contact solver on the bones as they are now (world matrices current):
   * `out` = the correction (planted feet: weight `stand`; held palms: weight
   * `plant`, translating or pivoting about the feet) applied over `m0`.
   * Returns the planted feet's slip when fully planted (QA), else null.
   */
  const solveRoot = (m0: Matrix4, out: Matrix4, plant: number, stand: number, wantSlip: boolean): number | null => {
    const s = st.current;
    out.copy(m0);
    let slip: number | null = null;
    if (stand > 0 && s.standId !== '' && s.footRef.length === soles.length) {
      // The feet now and at the first key, in the scene under M0; the body moves so they stay planted.
      const now = soles.map((f): FootPair => {
        footPoints(f, _h, _b);
        return { heel: v3(_h.applyMatrix4(m0)), ball: v3(_b.applyMatrix4(m0)) };
      });
      const fixed = s.rootVaries ? s.rootStart : m0;
      const ref = s.footRef.map((f): FootPair => ({ heel: v3(_h.set(...f.heel).applyMatrix4(fixed)), ball: v3(_b.set(...f.ball).applyMatrix4(fixed)) }));
      const holds = holdsOf(s.standId);
      // On a step the balls of the feet hold and the heels may drop below it.
      const onStep = equipmentList(exercises.get(s.standId)?.motion?.equipment).some((e) => e.kind === 'step');
      const c = standCorrection(now, ref, holds, onStep);
      out.premultiply(_t.makeTranslation(c[0] * stand, c[1] * stand, c[2] * stand));
      // QA: how far the weight-bearing feet still slide once moved (two feet share one correction).
      if (wantSlip && stand === 1) slip = footSlip(now, ref, c, holds, onStep);
    }
    if (plant > 0 && s.plantedId !== '' && heldPoint(s.held, _now)) {
      // The held point now and at the first key, in the scene (the reference under the first key's turn when the turn varies).
      _now.applyMatrix4(m0);
      const fixed = s.rootVaries ? s.rootStart : m0;
      _ref.copy(s.heldRef).applyMatrix4(fixed);
      if (s.hinge) {
        // On the floor the body pivots about its feet or knees (a push-up lowers the chest toward the hands).
        if (s.pivotKnees && s.kneeStart) _feet.copy(s.kneeStart).applyMatrix4(fixed);
        else if (s.ballStart) _feet.copy(s.ballStart).applyMatrix4(fixed);
        else _feet.set(pivot.x, feet[1], feet[2]).applyMatrix4(fixed);
        const delta = hingeAngle(v3(_now), v3(_ref), v3(_feet)) * plant;
        out
          .makeTranslation(_feet.x, _feet.y, _feet.z)
          .multiply(_t.makeRotationX(delta))
          .multiply(_t2.makeTranslation(-_feet.x, -_feet.y, -_feet.z))
          .multiply(m0);
      } else {
        // On a bar the body hangs from its hands (kneeling: rests on its knees): it moves, they stay.
        const c = handsCorrection(v3(_now), v3(_ref));
        _corr.set(c[0], c[1], c[2]).multiplyScalar(plant);
        out.premultiply(_t.makeTranslation(_corr.x, _corr.y, _corr.z));
      }
    }
    return slip;
  };

  /** Which feet of an exercise hold the body (`motion.feet`: both, or the standing one of a single-leg move). */
  const holdsOf = (id: string): boolean[] => {
    const side = exercises.get(id)?.motion?.feet;
    return [footing.l, footing.r].filter((f) => f !== null).map((f) => (side === 'left' ? f === footing.l : side === 'right' ? f === footing.r : true));
  };

  useFrame((state) => {
    const s = st.current;
    const nowMs = performance.now();
    const key = JSON.stringify([input.pose, input.exercise, input.demo]);
    const exSheet = input.exercise && playable.has(input.exercise.id) ? exercises.get(input.exercise.id) : undefined;
    const prep = exSheet?.motion ? preps(exSheet) : null;
    const equipment = equipmentList(exSheet?.motion?.equipment);
    const contacts = prep?.contacts ?? NO_CONTACT;
    const planted = contacts.hands !== null || contacts.knees;
    const standing = contacts.feet;
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

    // Where the palms and the feet are at the exercise's first key (skeleton frame), once per exercise.
    if (exSheet?.motion && joints.size > 0 && s.startId !== exSheet.id) {
      writeBones(keyFrame(exSheet, 0).joints);
      rig?.root.updateMatrixWorld(true);
      if (grips.l && grips.r) {
        const palms = s.palmStart ?? [new Vector3(), new Vector3()];
        gripPoint(grips.l, palms[0], _ax);
        gripPoint(grips.r, palms[1], _ax);
        s.palmStart = palms;
      } else s.palmStart = null;
      const refs = soles.map((f) => {
        footPoints(f, _h, _b);
        return { heel: v3(_h), ball: v3(_b) };
      });
      s.ballStart = refs.length > 0 ? new Vector3(...refs.reduce<V3>((a, f) => [a[0] + f.ball[0] / refs.length, a[1] + f.ball[1] / refs.length, a[2] + f.ball[2] / refs.length], [0, 0, 0])) : null;
      s.kneeStart = kneeBones.length === 2 ? (s.kneeStart ?? new Vector3()).copy(kneeBones[0]!.getWorldPosition(_pl)).add(kneeBones[1]!.getWorldPosition(_pr)).multiplyScalar(0.5) : null;
      s.rootVaries = exSheet.motion.keys.some((key) => key.root !== undefined);
      rootMatrix(keyFrame(exSheet, 0).root, s.rootStart);
      const held = contacts.knees ? 'knees' : contacts.grip;
      if (planted && heldPoint(held, s.heldRef)) {
        s.held = held;
        s.hinge = contacts.hands === 'hinge';
        s.pivotKnees = contacts.pivot === 'knees';
        s.plantedId = exSheet.id;
      }
      if (standing) {
        s.footRef = refs;
        s.standId = exSheet.id;
      }
      s.startId = exSheet.id;
    }
    s.plant = s.plantFrom + ((planted ? 1 : 0) - s.plantFrom) * k;
    s.stand = s.standFrom + ((standing ? 1 : 0) - s.standFrom) * k;

    // The exercise's sweep (every key, and halfway between two), once per exercise: the camera frames it.
    const g = rootRef.current;
    if (exSheet?.motion && g && joints.size > 0 && s.sweepId !== exSheet.id && s.startId === exSheet.id) {
      const meshes = sweepMeshes();
      if (meshes.length > 0) {
        s.sweepId = exSheet.id;
        const keys = exSheet.motion.keys.map((_, i) => keyFrame(exSheet, i));
        const poses = keys.length === 2 ? [keys[0]!, mixFrames(keys[0]!, keys[1]!, 0.5), keys[1]!] : keys;
        const pts: number[] = [];
        g.updateWorldMatrix(true, false);
        const rootInverse = _c.copy(g.matrixWorld).invert();
        for (const pose of poses) {
          writeBones(pose.joints);
          rig?.root.updateMatrixWorld(true);
          solveRoot(rootMatrix(pose.root, _mx), _m, planted ? 1 : 0, standing ? 1 : 0, false);
          for (const sk of meshes) {
            sk.updateWorldMatrix(true, false);
            _t2.multiplyMatrices(rootInverse, sk.matrixWorld).premultiply(_m);
            const count = sk.geometry.getAttribute('position')?.count ?? 0;
            const step = Math.max(1, Math.ceil((count * meshes.length) / EXTENT_SAMPLES));
            for (let i = 0; i < count; i += step) {
              sk.getVertexPosition(i, _v).applyMatrix4(_t2);
              pts.push(_v.x, _v.y, _v.z);
            }
          }
          // Held equipment: the palms.
          if (grips.l && grips.r && equipment.some((e) => EQUIPMENT_INFO[e.kind].place !== 'fixed')) {
            for (const grip of [grips.l, grips.r]) {
              gripPoint(grip, _v, _ax);
              _v.applyMatrix4(_m);
              pts.push(_v.x, _v.y, _v.z);
            }
          }
        }
        bridge.exerciseFrame = { id: exSheet.id, points: new Float32Array(pts) };
      }
    }

    // Bones.
    let moved = writeBones(frame.joints);

    // The bones' world matrices now (sites, equipment and skinned anchors read them this frame).
    if (moved && rig) rig.root.updateMatrixWorld(true);

    // Contraction.
    runtime.contract.clear();
    for (const [id, c] of frame.contract) if (c > 0) runtime.contract.set(id, Math.min(1, c));

    // The body's turn (exercise position), about the trunk joint, corrected so its contacts hold.
    if (g) {
      rootMatrix(frame.root, _m0);
      bridge.footSlip = solveRoot(_m0, _m, s.plant, s.stand, true);
      if (!_m.equals(g.matrix)) {
        g.matrix.copy(_m);
        g.matrixWorldNeedsUpdate = true;
        runtime.root.copy(_m);
        moved = true;
      }
      // Where the free-standing equipment and the ground go (from M0: they do not ride on the correction).
      if (exSheet?.motion && equipment.length > 0) {
        const ex = runtime.exercise ?? { trunk: new Vector3(), palms: null, hands: null, feet: null, floor: null, modelFloor };
        // With per-key turns the equipment stays where the first key's turn puts it.
        if (s.rootVaries && s.startId === exSheet.id) _m0.copy(s.rootStart);
        ex.trunk.copy(pivot).applyMatrix4(_m0);
        if (s.palmStart) {
          const hands = ex.hands ?? [new Vector3(), new Vector3()];
          hands[0].copy(s.palmStart[0]).applyMatrix4(_m0);
          hands[1].copy(s.palmStart[1]).applyMatrix4(_m0);
          ex.hands = hands;
        } else ex.hands = null;
        if (s.palmStart && (planted || equipment.some((e) => EQUIPMENT_INFO[e.kind].holdsHands))) {
          const palms = ex.palms ?? [new Vector3(), new Vector3()];
          palms[0].copy(s.palmStart[0]).applyMatrix4(_m0);
          palms[1].copy(s.palmStart[1]).applyMatrix4(_m0);
          ex.palms = palms;
        } else ex.palms = null;
        if (s.ballStart) ex.feet = (ex.feet ?? new Vector3()).copy(s.ballStart).applyMatrix4(_m0);
        else ex.feet = null;
        ex.modelFloor = modelFloor;
        ex.floor = equipmentFloor(equipment, {
          trunk: v3(ex.trunk),
          palms: ex.palms ? [v3(ex.palms[0]), v3(ex.palms[1])] : null,
          feet: ex.feet ? v3(ex.feet) : null,
          modelFloor,
        });
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
