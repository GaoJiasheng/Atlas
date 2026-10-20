/**
 * One part on the stage: position (shared eased explode), fade (visibility /
 * x-ray / faint), put-aside motion (`hide`: slide out along the explode
 * direction, then fade; back the same way), pose (eased into the chapter's /
 * beat's pose about its pivot), animations (about their pivots), a folding
 * wing's fan, family material with selection edge and cut face, vein
 * hairlines, and pointer picking (never for context or faint parts). A part
 * is one or more pieces (meshes or instanced meshes) sharing one material
 * per material slot (a coil's fins and copper tubes, a compressor's shell
 * and terminal cover).
 *
 * Transform stack: position (rest centre + explode) → pose (matrix) → the
 * try-it offset / turn (eased) → the played timeline moves / turns →
 * animations (matrix) → the shape's own transform (glb meshes).
 *
 * Try-it bindings (lib/sim/bind.ts) also give a part a glow (`uGlow` on its
 * own material, slot 0; eased: a dull red at a trace warming to the lamp
 * colour, brighter past full), a
 * count of its `repeat` copies on show, a tint (an iron core turned magnet;
 * its own material, slot 0, like the glow),
 * a turn that swings and settles (`settle`: a compass needle) about the part
 * centre or a pivot, an offset that bounces and settles (a hanger on its
 * spring), a coil stretched along its axis (the rings slide apart, the wire
 * keeps its thickness: lib/stretch.ts), the timeline channels it plays (moves
 * and turns after the offset, a car's wheels each about its own centre;
 * read from `runtime.play` every frame), a filings card's needles laid out
 * for the field state on show, and per animation a speed (a rotate's rpm,
 * integrated so a change never jumps) or an off switch (eased out).
 *
 * glb parts skinned to the model's skeleton draw as skinned meshes in
 * detached bind mode, so the explode / put-aside / pose transforms still
 * apply on top of the bones; their leader-label anchor follows the skinned
 * bounds (re-measured every few frames while the bones move). Contraction
 * (MotionDriver → `runtime.contract`) drives the material's fibre shader, or
 * scales a part without fibre data; `display.tint` mixes in the signal / cold
 * colour; a peel (`explode.stage`) moves the part in its layer's window.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  Box3,
  Color,
  DetachedBindMode,
  Euler,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  Quaternion,
  SkinnedMesh,
  Vector3,
  type Group,
  type Object3D,
  type Plane,
} from 'three';
import type { Part, PartAnimation } from '../../schema';
import type { PartDisplay } from '../../lib/visibility';
import type { Box3Like } from '../../lib/parts';
import { animationAngle, animationScale3 } from '../../lib/animation';
import { explodeOffset, stagedAmount } from '../../lib/explode';
import { contractScale, STRIPE_OPACITY } from '../../lib/rig';
import { damp, DEG2RAD, easeInOutCubic, normalize3, type Vec3 } from '../../lib/math';
import { isRest, lerpTransform, restTransform, sampleSequence, sequenceLength, smoothstep01, type PartTransform } from '../../lib/pose';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { createPartMaterial, setPartClipping, stylePartMaterial, styleFibreGrain, type PartStyle } from './materials';
import type { FibreMeasure } from './GltfSource';
import { skinnedRaycast } from './skinPick';
import type { ShapePiece } from './geometry';
import type { SimSettle } from '../../sim-schema';
import { nearestTurn, SETTLE_EPS_LENGTH, stepSwing } from '../../lib/sim/settle';
import { placeDirection, slotTint, type SimPlace, type SimPlay, type SimStretch } from '../../lib/sim/bind';
import { channelValue } from '../../lib/sim/timeline';
import { STRETCH_ATTRIBUTE, stretchPositions } from '../../lib/stretch';
import { partPrimitives } from '../../lib/parts';
import { apply3, eulerDeg } from '../../lib/xform';
import type { BufferAttribute } from 'three';

/** A try-it offset (scene units, eased or bouncing: `offsetSettle`) and turn about a unit axis through the part centre or `pivot` (eased or swinging: `settle`). */
export interface SimMove {
  place?: SimPlace | undefined;
  offset: Vec3;
  offsetSettle?: SimSettle | undefined;
  axis: Vec3;
  deg: number;
  settle?: SimSettle | undefined;
  pivot?: Vec3 | undefined;
}

/** Geometry + rest transform of a part (from a primitive or a glb mesh). */
export interface PartShape {
  pieces: ShapePiece[];
  /** Part centre at rest (before explode). */
  position: [number, number, number];
  /** Extra transform of the pieces (glb meshes; identity for primitives). */
  quaternion: Quaternion;
  scale: Vector3;
  /** Bounding radius in scene units. */
  radius: number;
  /** Closed surface: the cut face is filled when cut. */
  closed: boolean;
  /** Visible from both sides (planes). */
  twoSided: boolean;
  /** Fan of its folding wings at rest (1 without one). */
  restFan: number;
  /** Rest bounds in scene coordinates (glb parts, measured from the geometry): label anchor and stage bounds. */
  box?: Box3Like;
  /** A glb muscle's fibre data (`_U` / `_FIBRE`): length origin → insertion, belly thickness, dominant direction and centre (mesh units), metres per mesh unit. */
  fibre?: FibreMeasure;
}

/** What the label probe needs to know about a part (filled by PartNode). */
export interface PartHandle {
  object: Object3D;
  /** Bounds centre relative to the part centre (group boxes, the on-screen box). */
  offset: Vec3;
  /** Leader-label anchor relative to the part centre (the bounds centre; a pipe's path midpoint). */
  point: Vec3;
  /** Rough radius of the part's bounds (scene units): labels stay clear of it. */
  radius: number;
  /** Half extents of the part's bounds (scene units; zero: use `radius`): its on-screen box. */
  half: Vec3;
  meshes: Object3D[];
  /** Current fade (0 hidden .. 1 solid). */
  fade: number;
  visible: boolean;
  /** Inverse of the part's rest transform (scene ← its mesh frame): sites on a rigid part follow it. */
  restInverse: Matrix4;
  /** The skinned mesh of a skinned glb part (sites follow its bones) and its bones' rest world matrices. */
  skinned: SkinnedMesh | null;
  skinRest: Matrix4[] | null;
}

export interface PartNodeProps {
  part: Part;
  shape: PartShape;
  /** One style per material slot (`partMaterialSlots`); slot 0 is the part's own material. */
  styles: readonly PartStyle[];
  display: PartDisplay;
  animations: readonly PartAnimation[];
  /** The pose this part eases to (rest when the pose has no entry for it). */
  pose: PartTransform;
  /** Seconds the move into `pose` takes. */
  poseSeconds: number;
  /** Colour of vein hairlines (sRGB hex). */
  lineColor: string;
  hovered: boolean;
  clipping: Plane[] | null;
  castShadow: boolean;
  anchorOffset: Vec3;
  anchorPoint: Vec3;
  anchorRadius: number;
  anchorHalf: Vec3;
  handles: Map<string, PartHandle>;
  /** Changes when the stage must jump without easing (instant transitions). */
  snapKey: number;
  /** Peel stages of the topic (0: no part has `explode.stage`). */
  stages: number;
  /** Exercise mode: the highlight tint follows the part's contraction (stronger as it shortens). */
  tintLive?: boolean;
  /** A `custom` highlight's colour (sRGB hex; display.tint `custom`). */
  tintColor?: string | null;
  /** Try-it glow: colour (sRGB hex) and level (0 dark, 1 full, ≤ 2 brighter). */
  glow?: { color: string; level: number } | null;
  /** Try-it: copies of the part's `repeat` on show (null: all). */
  count?: number | null;
  /** Try-it offset (scene units) and turn about a unit axis through the part centre or `pivot` (a scene point at rest), eased or swinging (`settle`). */
  simMove?: SimMove | null;
  /** Try-it timeline channels the part plays (moves and turns). */
  play?: readonly SimPlay[] | null;
  /** Try-it stretch of the part's coil. */
  stretch?: SimStretch | null;
  /** Try-it tint: colour (sRGB hex) and level 0–1. */
  simTint?: { color: string; level: number } | null;
  /** Try-it: a filings card's needles for the field state on show (part frame; null: as built). */
  filings?: readonly Matrix4[] | null;
  /** Try-it animation overrides by animation id: a rotate's rpm, and whether it plays. */
  animSim?: ReadonlyMap<string, { rpm?: number; enabled: boolean }>;
  onSelect(id: string): void;
  onHover(id: string | null): void;
}

const placeQuaternion = new Quaternion();
const placeFacing = new Vector3();
const noRaycast = () => {};
const LONG_PRESS_MS = 400;
/** X-RAY fade rate: ~0.3 s to settle (master-spec H). */
const FADE_RATE = 11;
/** Put aside (`hide`): 0.6 s, sliding out a quarter of the explode distance, fading over the second half. */
const HIDE_S = 0.6;
const HIDE_SLIDE = 0.25;
/** Vein hairlines' opacity over a solid membrane. */
const LINE_OPACITY = 0.8;
const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

/** Re-measure a skinned part's label anchor every this many frames while the bones move. */
const SKIN_ANCHOR_EVERY = 6;
/** Vertices sampled for that measure. */
const SKIN_ANCHOR_SAMPLES = 256;
/** Highlight tint strength (mix toward the signal / cold colour). */
const TINT = 0.55;
/** In an exercise, the share of that tint a relaxed (lengthened) muscle keeps. */
const TINT_REST = 0.45;
const tmpQ = new Quaternion();
const tmpBox = new Box3();
const tmpInv = new Matrix4();
const tmpM = new Matrix4();
const tmpPose = new Matrix4();
const tmpTurn = new Matrix4();
const tmpT = new Matrix4();
const tmpE = new Euler();
const tmpV = new Vector3();
const tmpS = new Vector3();
const tmpS3: Vec3 = [1, 1, 1];
const tmpEach = new Matrix4();
const tmpInst = new Matrix4();
const tmpGlow = new Color();
const GLOW_DIM = new Color('#7a2410');
const GLOW_WHITE = new Color('#ffffff');
/** Emissive strength of a full glow (level 1). */
const GLOW_GAIN = 2.2;
/** Glow eases in ~0.2 s, a try-it move in ~0.5 s. */
const GLOW_RATE = 14;
const MOVE_RATE = 7;
/** Scratch state of a swinging turn (stepped in place each frame). */
const swing = { x: 0, v: 0 };
const tmpPlay = new Matrix4();
const tmpC: Vec3 = [0, 0, 0];

/** An animation that moves every copy of its part about the copy's own centre (schema `each`). */
const isEach = (a: PartAnimation) => (a.kind === 'rotate' || a.kind === 'oscillate' || a.kind === 'pulse') && a.each === true;

/** M ← M · T(pivot) · X · T(−pivot), for X already in `x`. */
function aboutPivot(m: Matrix4, x: Matrix4, pivot: Vec3): void {
  m.multiply(tmpT.makeTranslation(pivot[0], pivot[1], pivot[2])).multiply(x).multiply(tmpT.makeTranslation(-pivot[0], -pivot[1], -pivot[2]));
}

/** M ← M · (offset, then about the pivot: rotate · scale) — a pose or keyframe transform. */
function applyTransform(m: Matrix4, t: PartTransform, centre: readonly number[]): void {
  const pv: Vec3 = t.pivot ? [t.pivot[0] - centre[0]!, t.pivot[1] - centre[1]!, t.pivot[2] - centre[2]!] : [0, 0, 0];
  m.multiply(tmpT.makeTranslation(t.offset[0], t.offset[1], t.offset[2]));
  tmpE.set(t.rotation[0] * DEG2RAD, t.rotation[1] * DEG2RAD, t.rotation[2] * DEG2RAD, 'XYZ');
  tmpM.makeRotationFromEuler(tmpE).scale(tmpS.set(t.scale[0], t.scale[1], t.scale[2]));
  aboutPivot(m, tmpM.clone(), pv);
}

function Piece({
  piece,
  material,
  castShadow,
  register,
  handlers,
  instances,
}: {
  piece: ShapePiece;
  material: Mesh['material'];
  castShadow: boolean;
  register(o: Object3D | null, piece: ShapePiece): void;
  handlers: Record<string, unknown>;
  /** A filings piece's needles for the field state on show (null: as built). */
  instances: readonly Matrix4[] | null;
}) {
  const ref = useRef<Mesh | InstancedMesh | LineSegments | SkinnedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (mesh instanceof InstancedMesh && piece.matrices) {
      // Filings: at most the built budget of needles; the rest of the instances are not drawn.
      const list = instances ?? piece.matrices;
      const n = Math.min(list.length, piece.matrices.length);
      for (let i = 0; i < n; i++) mesh.setMatrixAt(i, list[i]!);
      if (piece.filings) mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      // Copies that turn about their own centres (`each`) can leave the rest bounds a little: never culled.
      if (piece.pivots) mesh.frustumCulled = false;
    }
    if (mesh instanceof SkinnedMesh && piece.skin) {
      // Detached: the bind matrix stays the rest one, so the part's own transform (explode, pose) applies on top of the bones.
      mesh.bindMode = DetachedBindMode;
      mesh.bind(piece.skin.skeleton, piece.skin.bindMatrix);
      // Bones move the vertices far from the rest bounds: never culled (a few dozen meshes at most).
      mesh.frustumCulled = false;
    }
    register(mesh, piece);
    return () => register(null, piece);
  }, [piece, register, instances]);
  if (piece.skin) {
    return <skinnedMesh ref={ref as Ref<SkinnedMesh>} geometry={piece.geometry} material={material} castShadow={castShadow} dispose={null} {...handlers} />;
  }
  if (piece.lines) {
    return <lineSegments ref={ref as Ref<LineSegments>} geometry={piece.geometry} material={material} raycast={noRaycast} dispose={null} />;
  }
  if (piece.matrices) {
    return (
      <instancedMesh
        ref={ref as Ref<InstancedMesh>}
        args={[piece.geometry, material, piece.matrices.length]}
        castShadow={castShadow}
        dispose={null}
        {...handlers}
      />
    );
  }
  return <mesh ref={ref as Ref<Mesh>} geometry={piece.geometry} material={material} castShadow={castShadow} dispose={null} {...handlers} />;
}

export function PartNode(props: PartNodeProps) {
  const { part, shape, display, clipping, styles } = props;
  const style = styles[0]!;
  const runtime = useRuntime();
  const posRef = useRef<Group>(null);
  const poseRef = useRef<Group>(null);
  const animRef = useRef<Group>(null);
  const pieces = useRef(new Map<ShapePiece, Object3D>());
  const motion = useRef({
    base: display.visible ? display.opacity : 0,
    fade: display.visible ? display.opacity : 0,
    aside: display.hidden ? 1 : 0,
    sel: 0,
    snap: true,
    cast: false,
    /** Pose: from, to, start (performance.now ms), duration (ms), and where it is now. */
    poseFrom: restTransform(),
    poseTo: props.pose,
    poseT0: 0,
    poseMs: 0,
    poseNow: props.pose,
    poseDone: true,
    /** Phase at which the current run started (one-shot clips play from here). */
    runStart: 0,
    wasRunning: false,
    /** Contraction and highlight tint now; the bone-motion count the skinned anchor was last measured at. */
    contract: 0,
    tint: 0,
    /** Try-it tint now (slot 0). */
    simTint: 0,
    skinMoved: -1,
    frame: 0,
    /** `each` animations moved the instances last frame (one more write puts them back at rest). */
    eachMoved: false,
    /** Try-it glow level now; offset and turn now. */
    glow: props.glow?.level ?? 0,
    move: [0, 0, 0] as Vec3,
    /** A bouncing offset's speed per axis (scene units per second). */
    moveV: [0, 0, 0] as Vec3,
    turn: 0,
    placeFrom: [0, 1, 0] as Vec3,
    placeNow: [0, 1, 0] as Vec3,
    placeTarget: null as SimPlace | null,
    placeStart: 0,
    /** A coil's stretch now (scene units) and its speed (a bounce); the stretch last written into the geometry. */
    stretch: 0,
    stretchV: 0,
    stretchShown: 0,
    /** The played moves and turns last frame (a change asks the labels and shadows to look again). */
    playKey: '',
    /** Turning speed of a swinging (`settle`) turn, degrees per second. */
    turnV: 0,
    /** Per animation: its integrated angle (a sim-driven rotate) and how far it is switched on. */
    angle: props.animations.map(() => 0),
    on: props.animations.map((a): number => (props.animSim?.get(a.id)?.enabled === false ? 0 : 1)),
  });
  const press = useRef<{ timer: ReturnType<typeof setTimeout> | null; x: number; y: number }>({ timer: null, x: 0, y: 0 });

  const slotCount = styles.length;
  const pms = useMemo(() => Array.from({ length: slotCount }, () => createPartMaterial()), [slotCount]);
  const hasLines = useMemo(() => shape.pieces.some((p) => p.lines), [shape]);
  const lineMat = useMemo(
    () => (hasLines ? new LineBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, clipShadows: true }) : null),
    [hasLines],
  );
  const fans = useMemo(() => shape.pieces.filter((p) => p.fan), [shape]);
  const glowHex = props.glow?.color ?? '#ffffff';
  const glowColor = useMemo(() => new Color(glowHex), [glowHex]);
  const eachPieces = useMemo(() => shape.pieces.filter((p) => p.pivots && p.matrices), [shape]);
  // A stretched coil: the pieces that carry each vertex's place along it, their rest positions, and the coil's axis (part frame).
  const stretchable = useMemo(() => {
    if (!props.stretch) return null;
    const coil = partPrimitives(part).find((q) => q.kind === 'coil');
    if (!coil) return null;
    const axis = apply3(eulerDeg(coil.rotation), [0, 1, 0]);
    const pieces = shape.pieces
      .filter((p) => !p.matrices && p.geometry.getAttribute(STRETCH_ATTRIBUTE))
      .map((p) => ({ piece: p, base: Float32Array.from((p.geometry.getAttribute('position') as BufferAttribute).array as Float32Array), t: (p.geometry.getAttribute(STRETCH_ATTRIBUTE) as BufferAttribute).array as Float32Array }));
    return pieces.length > 0 ? { axis, pieces } : null;
    // Only whether the part stretches matters here, not the value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, part, props.stretch !== null && props.stretch !== undefined]);
  // Per-frame maths without allocation: explode vector and unit animation axes, once. Context parts stay put.
  const push = useMemo(() => (part.context ? ([0, 0, 0] as Vec3) : explodeOffset(part.explode, 1)), [part.explode, part.context]);
  const axes = useMemo(
    () => props.animations.map((a) => (a.kind === 'rotate' || a.kind === 'oscillate' ? new Vector3(...normalize3(a.axis)) : new Vector3(0, 1, 0))),
    [props.animations],
  );
  // Animation pivots relative to the part centre.
  const pivots = useMemo(
    () =>
      props.animations.map((a): Vec3 =>
        a.pivot ? [a.pivot[0] - shape.position[0], a.pivot[1] - shape.position[1], a.pivot[2] - shape.position[2]] : [0, 0, 0],
      ),
    [props.animations, shape.position],
  );
  useEffect(() => () => pms.forEach((pm) => pm.material.dispose()), [pms]);
  useEffect(() => () => lineMat?.dispose(), [lineMat]);

  useEffect(() => {
    pms.forEach((pm, i) => {
      stylePartMaterial(pm, styles[i] ?? style);
      // glb muscles: the fibre grain follows `_FIBRE` (the UVs wrap around the belly).
      if (shape.fibre) styleFibreGrain(pm, shape.fibre, (styles[i] ?? style).look.normal);
    });
  }, [pms, styles, style, shape.fibre]);
  useEffect(() => {
    lineMat?.color.set(props.lineColor);
  }, [lineMat, props.lineColor]);

  useEffect(() => {
    pms.forEach((pm, i) => {
      // Membranes are double-sided and never cut-filled.
      const sheet = (styles[i] ?? style).look.doubleSided;
      setPartClipping(pm, clipping, shape.closed && !sheet, shape.twoSided || sheet);
    });
    if (lineMat) {
      lineMat.clippingPlanes = clipping;
      lineMat.needsUpdate = true;
    }
  }, [pms, lineMat, clipping, shape.closed, shape.twoSided, styles, style]);

  useEffect(() => {
    motion.current.snap = true;
  }, [props.snapKey]);

  // A new pose target: ease from wherever the part is now.
  useEffect(() => {
    const m = motion.current;
    if (m.poseTo === props.pose) return;
    m.poseFrom = m.poseNow;
    m.poseTo = props.pose;
    m.poseT0 = performance.now();
    m.poseMs = props.poseSeconds * 1000;
    m.poseDone = false;
  }, [props.pose, props.poseSeconds]);

  // Handle for leader labels / occlusion (its anchor follows the pose).
  const handle = useMemo<PartHandle>(
    () => ({
      object: null as unknown as Object3D,
      offset: [...props.anchorOffset] as Vec3,
      point: [...props.anchorPoint] as Vec3,
      radius: props.anchorRadius,
      half: [...props.anchorHalf] as Vec3,
      meshes: [],
      fade: 0,
      visible: false,
      restInverse: new Matrix4()
        .compose(new Vector3(...shape.position), shape.quaternion, shape.scale)
        .invert(),
      skinned: null,
      skinRest: shape.pieces.find((p) => p.skin)?.skin?.boneRest ?? null,
    }),
    [props.anchorOffset, props.anchorPoint, props.anchorRadius, props.anchorHalf, shape],
  );
  const skinSamples = useMemo(() => {
    const piece = shape.pieces.find((p) => p.skin);
    const count = piece?.geometry.getAttribute('position')?.count ?? 0;
    const step = Math.max(1, Math.ceil(count / SKIN_ANCHOR_SAMPLES));
    return Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step);
  }, [shape]);
  const { handles } = props;
  useLayoutEffect(() => {
    if (!posRef.current) return;
    handle.object = posRef.current;
    handle.meshes = [...pieces.current.values()].filter((o) => !(o instanceof LineSegments));
    handles.set(part.id, handle);
    return () => {
      if (handles.get(part.id) === handle) handles.delete(part.id);
    };
  }, [handles, handle, part.id, shape]);

  const register = useMemo(
    () => (o: Object3D | null, piece: ShapePiece) => {
      if (o) pieces.current.set(piece, o);
      else pieces.current.delete(piece);
      handle.meshes = [...pieces.current.values()].filter((x) => !(x instanceof LineSegments));
      handle.skinned = (handle.meshes.find((x) => x instanceof SkinnedMesh) as SkinnedMesh | undefined) ?? null;
    },
    [handle],
  );

  // Try-it count: the first k copies of the `repeat` (merged copies are contiguous, so a draw range; instances: the count).
  const copies = part.repeat?.count ?? 1;
  const shownCopies = props.count ?? null;
  useLayoutEffect(() => {
    for (const [piece, o] of pieces.current) {
      if (piece.filings) continue;
      if (o instanceof InstancedMesh) o.count = shownCopies === null ? (piece.matrices?.length ?? o.count) : Math.min(piece.matrices?.length ?? 0, Math.round(((piece.matrices?.length ?? 0) * shownCopies) / copies));
      else if (o instanceof Mesh && !(o instanceof SkinnedMesh)) {
        const total = piece.geometry.getAttribute('position').count;
        const per = total / copies;
        piece.geometry.setDrawRange(0, shownCopies === null ? Infinity : Math.round(per * Math.min(copies, shownCopies)));
      }
    }
    runtime.shadowDirty = true;
  }, [shownCopies, copies, shape, runtime]);


  // Hidden, faint and context parts do not take part in picking (clicks pass through).
  const pickable = display.visible && display.selectable;
  useEffect(() => {
    for (const o of pieces.current.values()) {
      if (o instanceof LineSegments) continue;
      const own =
        o instanceof InstancedMesh
          ? InstancedMesh.prototype.raycast
          : o instanceof SkinnedMesh
            ? skinnedRaycast(o, () => runtime.bonesMoved)
            : Mesh.prototype.raycast;
      o.raycast = pickable ? own : noRaycast;
    }
  }, [pickable, shape, runtime]);

  useEffect(
    () => () => {
      if (press.current.timer) clearTimeout(press.current.timer);
    },
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const m = motion.current;
    const snap = m.snap;
    m.snap = false;
    let moving = false;

    // Put aside: linear clock, eased slide, fade over the second half.
    const asideTarget = display.hidden ? 1 : 0;
    m.aside = snap ? asideTarget : m.aside + Math.sign(asideTarget - m.aside) * Math.min(Math.abs(asideTarget - m.aside), dt / HIDE_S);
    const slide = easeInOutCubic(m.aside) * HIDE_SLIDE;

    // Explode (eased centrally, see ExplodeClock; a peel stage moves in its own window).
    const e = (props.stages > 0 ? stagedAmount(runtime.explode, part.explode.stage, props.stages) : runtime.explode) + slide;
    const g = posRef.current;
    if (g) {
      const x = shape.position[0] + push[0] * e;
      const y = shape.position[1] + push[1] * e;
      const z = shape.position[2] + push[2] * e;
      if (g.position.x !== x || g.position.y !== y || g.position.z !== z) {
        g.position.set(x, y, z);
        if (props.castShadow) runtime.shadowDirty = true;
      }
    }

    // Fade (a part being put aside keeps its look until the aside fade takes it).
    const targetBase = display.visible || display.hidden ? display.opacity : 0;
    m.base = snap ? targetBase : damp(m.base, targetBase, FADE_RATE, dt);
    if (Math.abs(m.base - targetBase) < 0.002) m.base = targetBase;
    const prevFade = m.fade;
    m.fade = m.base * (1 - smooth(0.45, 1, m.aside));
    const targetFade = display.hidden ? 0 : targetBase;
    const shown = m.fade > 0.004;
    pms.forEach((pm, i) => {
      const mat = pm.material;
      mat.opacity = m.fade * (styles[i] ?? style).look.opacity;
      const transparent = mat.opacity < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.depthWrite = !display.ghost && mat.opacity > 0.6;
    });
    if (lineMat) lineMat.opacity = m.fade * LINE_OPACITY;
    const cast = props.castShadow && m.fade > 0.6;
    for (const o of pieces.current.values()) {
      o.visible = shown;
      o.castShadow = cast && !(o instanceof LineSegments);
    }
    if (cast !== m.cast || (props.castShadow && prevFade !== m.fade)) runtime.shadowDirty = true;
    m.cast = cast;
    // See-through families (membrane, glass) never hide what is behind them from the labels.
    handle.fade = m.fade * style.look.opacity;
    handle.visible = shown && display.visible;

    // Selection edge (hover: weaker).
    const selTarget = display.selected ? 1 : props.hovered && display.visible ? 0.45 : 0;
    m.sel = snap ? selTarget : damp(m.sel, selTarget, 12, dt);
    if (Math.abs(m.sel - selTarget) < 0.003) m.sel = selTarget;
    for (const pm of pms) pm.uniforms.uSel.value = m.sel;

    // Try-it glow: a dull red at a trace, warming to the lamp colour at full, whiter past it.
    const glowTarget = props.glow?.level ?? 0;
    m.glow = snap ? glowTarget : damp(m.glow, glowTarget, GLOW_RATE, dt);
    if (Math.abs(m.glow - glowTarget) < 0.002) m.glow = glowTarget;
    if (props.glow || m.glow > 0) {
      const l = m.glow;
      tmpGlow.copy(GLOW_DIM).lerp(glowColor, Math.min(1, l * 1.4));
      if (l > 1) tmpGlow.lerp(GLOW_WHITE, Math.min(1, (l - 1) * 0.6));
      tmpGlow.multiplyScalar(l * GLOW_GAIN);
      // The part's own material only (slot 0: a filament coil, not its support wires or the brass base).
      pms[0]!.uniforms.uGlow.value.copy(tmpGlow);
    }

    // Highlight tint (exercise mode, `highlight`): eased like the selection; in an exercise it follows the contraction.
    // A try-it tint (an iron core turned magnet) takes its place on the part's own material only (slot 0, like the glow).
    const c = runtime.contract.get(part.id) ?? 0;
    const st = props.simTint ?? null;
    const tintTarget = display.tint ? TINT * (props.tintLive ? TINT_REST + (1 - TINT_REST) * c : 1) : 0;
    m.tint = snap ? tintTarget : damp(m.tint, tintTarget, 8, dt);
    if (Math.abs(m.tint - tintTarget) < 0.003) m.tint = tintTarget;
    const simTarget = st ? TINT * st.level : 0;
    m.simTint = snap ? simTarget : damp(m.simTint, simTarget, 8, dt);
    if (Math.abs(m.simTint - simTarget) < 0.003) m.simTint = simTarget;
    const hiColor = display.tint === 'custom' && props.tintColor ? props.tintColor : display.tint === 'cold' ? style.cold : style.signal;
    pms.forEach((pm, i) => {
      pm.uniforms.uHi.value = slotTint(i, m.tint, st ? m.simTint : null);
      pm.uniforms.uHiColor.value.set(slotTint(i, hiColor, st ? st.color : null));
    });

    // Contraction (MotionDriver): along the fibres in the shader, else a scale below.
    const contractChanged = c !== m.contract;
    m.contract = c;
    if (shape.fibre) {
      for (const pm of pms) {
        const u = pm.uniforms;
        u.uContract.value = c;
        u.uLen.value = shape.fibre.length;
        u.uThick.value = shape.fibre.thickness;
        u.uStripe.value = STRIPE_OPACITY * Math.min(1, c * 3);
        u.uTime.value = runtime.elapsed;
      }
      if (c > 0) keepAnimating(state.invalidate);
    }
    if (contractChanged && props.castShadow) runtime.shadowDirty = true;

    // Pose: ease from where the part was to the target (instant transitions jump).
    if (snap || m.poseMs <= 0) {
      // A jump still moves the part: the label probes must re-check what it hides (an instant beat change).
      if (m.poseNow !== m.poseTo) moving = true;
      m.poseNow = m.poseTo;
      m.poseDone = true;
    } else if (!m.poseDone) {
      const k = (performance.now() - m.poseT0) / m.poseMs;
      m.poseNow = k >= 1 ? m.poseTo : lerpTransform(m.poseFrom, m.poseTo, smoothstep01(k), shape.restFan);
      if (k >= 1) m.poseDone = true;
      moving = true;
    }
    const pr = poseRef.current;
    if (pr) {
      // Try-it offset and turn, eased or swinging: applied after the pose, along the scene axes, about the posed centre or the pivot.
      const sm = props.simMove;
      const bounce = sm?.offsetSettle;
      for (let a = 0; a < 3; a++) {
        const to = sm?.offset[a] ?? 0;
        if (snap) {
          m.move[a] = to;
          m.moveV[a] = 0;
        } else if (bounce) {
          // A hanger on its spring: the same damped bounce as the spring's stretch, so the two stay joined.
          swing.x = m.move[a]!;
          swing.v = m.moveV[a]!;
          if (stepSwing(swing, to, dt, bounce, SETTLE_EPS_LENGTH)) moving = true;
          m.move[a] = swing.x;
          m.moveV[a] = swing.v;
        } else {
          m.move[a] = damp(m.move[a]!, to, MOVE_RATE, dt);
          m.moveV[a] = 0;
          if (Math.abs(m.move[a]! - to) < 1e-6) m.move[a] = to;
          else moving = true;
        }
      }
      const settle = sm?.settle;
      // A swinging turn goes the short way round to its target; a plain one eases straight there.
      const turnTo = settle ? nearestTurn(m.turn, sm!.deg) : (sm?.deg ?? 0);
      if (snap) {
        m.turn = turnTo;
        m.turnV = 0;
      } else if (settle) {
        swing.x = m.turn;
        swing.v = m.turnV;
        if (stepSwing(swing, turnTo, dt, settle)) moving = true;
        m.turn = swing.x;
        m.turnV = swing.v;
      } else {
        m.turn = damp(m.turn, turnTo, MOVE_RATE, dt);
        m.turnV = 0;
        if (Math.abs(m.turn - turnTo) < 0.01) m.turn = turnTo;
        else moving = true;
      }
      // pose matrix P; then the whole: T(move) · about c: R · P (c = the pivot, else P's own centre).
      tmpPose.identity();
      if (!isRest(m.poseNow)) applyTransform(tmpPose, m.poseNow, shape.position);
      pr.matrix.makeTranslation(m.move[0], m.move[1], m.move[2]);
      if (m.turn !== 0 && sm) {
        const e = tmpPose.elements;
        const c: Vec3 = sm.pivot ? [sm.pivot[0] - shape.position[0], sm.pivot[1] - shape.position[1], sm.pivot[2] - shape.position[2]] : [e[12]!, e[13]!, e[14]!];
        aboutPivot(pr.matrix, tmpTurn.makeRotationAxis(tmpV.set(sm.axis[0], sm.axis[1], sm.axis[2]), m.turn * DEG2RAD), c);
      }
      pr.matrix.multiply(tmpPose);
      const place = sm?.place;
      if (place) {
        if (m.placeTarget !== place) {
          m.placeFrom[0] = m.placeNow[0];
          m.placeFrom[1] = m.placeNow[1];
          m.placeFrom[2] = m.placeNow[2];
          m.placeStart = performance.now();
          m.placeTarget = place;
        }
        const t = snap ? 1 : Math.min(1, (performance.now() - m.placeStart) / 500);
        placeDirection(m.placeFrom, place.direction, smoothstep01(t), m.placeNow);
        if (t < 1) moving = true;
        // Absolute placement: the geometry is centred on shape.position inside this group.
        tmpTurn.identity();
        if (place.face === 'centre') {
          placeQuaternion.setFromUnitVectors(tmpV.set(0, 1, 0), placeFacing.set(-m.placeNow[0], -m.placeNow[1], -m.placeNow[2]));
          tmpTurn.makeRotationFromQuaternion(placeQuaternion);
        }
        pr.matrix.copy(tmpTurn).setPosition(
          place.centre[0] + place.radius * m.placeNow[0] - shape.position[0],
          place.centre[1] + place.radius * m.placeNow[1] - shape.position[1],
          place.centre[2] + place.radius * m.placeNow[2] - shape.position[2],
        );
      }
      // Played timeline channels: moves along their axes, then turns about the pivot or where the part's centre now is.
      const play = props.play;
      if (play && play.length > 0) {
        let key = '';
        tmpC[0] = pr.matrix.elements[12]!;
        tmpC[1] = pr.matrix.elements[13]!;
        tmpC[2] = pr.matrix.elements[14]!;
        tmpPlay.identity();
        let dx = 0;
        let dy = 0;
        let dz = 0;
        for (const p of play) {
          if (p.each) continue;
          const pb = runtime.play.get(p.output);
          const v = channelValue(pb?.timeline, p.channel, pb?.t ?? 0) * p.per;
          key += `${v},`;
          if (p.axis) {
            dx += p.axis[0] * v;
            dy += p.axis[1] * v;
            dz += p.axis[2] * v;
          } else if (p.turn && v !== 0) {
            const c: Vec3 = p.pivot ? [p.pivot[0] - shape.position[0], p.pivot[1] - shape.position[1], p.pivot[2] - shape.position[2]] : tmpC;
            aboutPivot(tmpPlay, tmpTurn.makeRotationAxis(tmpV.set(p.turn[0], p.turn[1], p.turn[2]), v * DEG2RAD), c);
          }
        }
        pr.matrix.premultiply(tmpPlay).premultiply(tmpT.makeTranslation(dx, dy, dz));
        if (key !== m.playKey) {
          m.playKey = key;
          moving = true;
        }
      }
      pr.matrixWorldNeedsUpdate = true;
      // The label anchor follows the pose.
      const move = (rest: readonly number[], out: Vec3) => {
        tmpV.set(rest[0]!, rest[1]!, rest[2]!).applyMatrix4(pr.matrix);
        out[0] = tmpV.x;
        out[1] = tmpV.y;
        out[2] = tmpV.z;
      };
      // (A skinned part measures its anchor from the skinned bounds below.)
      if (!handle.skinned) {
        move(props.anchorPoint, handle.point);
        move(props.anchorOffset, handle.offset);
      }
    }

    // Animations (about their pivots) and the fan they or the pose give a folding wing.
    let fan = m.poseNow.fan ?? shape.restFan;
    const anim = animRef.current;
    const scaled = !shape.fibre && (c > 0 || contractChanged);
    if (anim && (props.animations.length > 0 || scaled)) {
      anim.matrix.identity();
      const running = runtime.energy > 0;
      if (running && !m.wasRunning) m.runStart = runtime.phase;
      m.wasRunning = running;
      props.animations.forEach((a, i) => {
        if (isEach(a)) return; // per copy, below
        // Try-it: an animation switched off eases out; a rotate with a bound speed integrates its own angle.
        const sim = props.animSim?.get(a.id);
        const onTarget = sim?.enabled === false ? 0 : 1;
        m.on[i] = snap ? onTarget : damp(m.on[i] ?? 1, onTarget, 6, dt);
        if (Math.abs(m.on[i]! - onTarget) < 0.003) m.on[i] = onTarget;
        else moving = true;
        const always = !a.whenRun;
        if ((!always && runtime.energy === 0) || m.on[i] === 0) return;
        const t = always ? runtime.elapsed : runtime.phase;
        const k = (always ? 1 : runtime.energy) * m.on[i]!;
        if (a.kind === 'rotate' && sim?.rpm !== undefined) {
          m.angle[i] = (m.angle[i]! + dt * k * (sim.rpm / 60) * 2 * Math.PI) % (2 * Math.PI);
          aboutPivot(anim.matrix, tmpM.makeRotationFromQuaternion(tmpQ.setFromAxisAngle(axes[i]!, m.angle[i]!)), pivots[i]!);
          return;
        }
        if (a.kind === 'sequence') {
          // A one-shot clip plays from the start of each run (always-on ones from load) and holds its last key.
          const time = a.loop || always ? t : Math.min(t - m.runStart, sequenceLength(a.keys));
          const clip = sampleSequence(a.keys, time, a.loop, a.pivot);
          const eased = k < 1 ? lerpTransform(restTransform(), clip, k, shape.restFan) : clip;
          applyTransform(anim.matrix, eased, shape.position);
          if (eased.fan !== null) fan = eased.fan;
          return;
        }
        if (a.kind === 'pulse') {
          animationScale3(a, t, k, tmpS3);
          aboutPivot(anim.matrix, tmpM.makeScale(tmpS3[0], tmpS3[1], tmpS3[2]), pivots[i]!);
          return;
        }
        if (a.kind === 'contract') return; // MotionDriver: runtime.contract
        const angle = animationAngle(a, t, k);
        if (angle !== 0) aboutPivot(anim.matrix, tmpM.makeRotationFromQuaternion(tmpQ.setFromAxisAngle(axes[i]!, angle)), pivots[i]!);
      });
      if (scaled && c > 0) {
        contractScale(props.anchorHalf, c, undefined).forEach((v, i) => (tmpS3[i] = v));
        aboutPivot(anim.matrix, tmpM.makeScale(tmpS3[0], tmpS3[1], tmpS3[2]), props.anchorOffset);
      }
      anim.matrixWorldNeedsUpdate = true;
      if (props.castShadow && runtime.energy > 0) runtime.shadowDirty = true;
    }
    // `each` animations: every copy about its own centre, written into the instance matrices.
    if (eachPieces.length > 0) {
      tmpEach.identity();
      let active = false;
      // Played turns of every copy about its own centre (a car's wheels).
      for (const p of props.play ?? []) {
        if (!p.each || !p.turn) continue;
        const pb = runtime.play.get(p.output);
        const v = channelValue(pb?.timeline, p.channel, pb?.t ?? 0) * p.per;
        if (v !== 0) tmpEach.multiply(tmpM.makeRotationFromQuaternion(tmpQ.setFromAxisAngle(tmpV.set(p.turn[0], p.turn[1], p.turn[2]), v * DEG2RAD)));
        active = true;
      }
      props.animations.forEach((a, i) => {
        if (!isEach(a)) return;
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) return;
        const t = always ? runtime.elapsed : runtime.phase;
        const k = always ? 1 : runtime.energy;
        if (a.kind === 'pulse') {
          animationScale3(a, t, k, tmpS3);
          tmpEach.multiply(tmpM.makeScale(tmpS3[0], tmpS3[1], tmpS3[2]));
          active = true;
          return;
        }
        const angle = animationAngle(a, t, k);
        if (angle !== 0) tmpEach.multiply(tmpM.makeRotationFromQuaternion(tmpQ.setFromAxisAngle(axes[i]!, angle)));
        active = true;
      });
      if (active || m.eachMoved || snap) {
        for (const piece of eachPieces) {
          const mesh = pieces.current.get(piece);
          if (!(mesh instanceof InstancedMesh)) continue;
          piece.matrices!.forEach((rest, j) => {
            const c = piece.pivots![j]!;
            tmpInst.makeTranslation(c[0], c[1], c[2]).multiply(tmpEach);
            tmpInst.multiply(tmpT.makeTranslation(-c[0], -c[1], -c[2])).multiply(rest);
            mesh.setMatrixAt(j, tmpInst);
          });
          mesh.instanceMatrix.needsUpdate = true;
        }
        if (props.castShadow) runtime.shadowDirty = true;
      }
      m.eachMoved = active;
    }
    // A stretched coil: the rings slide apart along its axis (lib/stretch.ts); a bounce settles like the hanger's offset.
    const sc = props.stretch;
    if (stretchable) {
      const pb = sc?.channel !== undefined && sc.output !== undefined ? runtime.play.get(sc.output) : undefined;
      const to = !sc ? 0 : sc.channel !== undefined ? channelValue(pb?.timeline, sc.channel, pb?.t ?? 0) * sc.per : sc.target;
      if (snap || sc?.channel !== undefined) {
        m.stretch = to;
        m.stretchV = 0;
      } else if (sc?.settle) {
        swing.x = m.stretch;
        swing.v = m.stretchV;
        if (stepSwing(swing, to, dt, sc.settle, SETTLE_EPS_LENGTH)) moving = true;
        m.stretch = swing.x;
        m.stretchV = swing.v;
      } else {
        m.stretch = damp(m.stretch, to, MOVE_RATE, dt);
        if (Math.abs(m.stretch - to) < 1e-6) m.stretch = to;
        else moving = true;
      }
      if (m.stretch !== m.stretchShown || snap) {
        m.stretchShown = m.stretch;
        for (const { piece, base, t } of stretchable.pieces) {
          const pos = piece.geometry.getAttribute('position') as BufferAttribute;
          stretchPositions(base, t, stretchable.axis, sc?.anchor ?? 'top', m.stretch, pos.array as Float32Array);
          pos.needsUpdate = true;
          const o = pieces.current.get(piece);
          if (o) o.frustumCulled = false;
        }
        if (props.castShadow) runtime.shadowDirty = true;
      }
    }
    for (const f of fans) if (f.fan!.apply(fan) && props.castShadow) runtime.shadowDirty = true;
    if (moving) {
      runtime.moved++;
      if (props.castShadow) runtime.shadowDirty = true;
    }

    // A skinned part's anchor follows its skinned bounds while the bones move (sampled, every few frames).
    m.frame++;
    const sk = handle.skinned;
    if (sk && m.skinMoved !== runtime.bonesMoved && (m.frame % SKIN_ANCHOR_EVERY === 0 || runtime.bonesMoved === 0)) {
      m.skinMoved = runtime.bonesMoved;
      // Parents too: the root group's new matrix (exercise turn) reaches the mesh before the render does.
      sk.updateWorldMatrix(true, false);
      tmpBox.makeEmpty();
      tmpInv.copy(runtime.root).invert().multiply(sk.matrixWorld);
      for (const i of skinSamples) tmpBox.expandByPoint(sk.getVertexPosition(i, tmpV).applyMatrix4(tmpInv));
      if (!tmpBox.isEmpty() && g) {
        const cx = (tmpBox.min.x + tmpBox.max.x) / 2 - g.position.x;
        const cy = (tmpBox.min.y + tmpBox.max.y) / 2 - g.position.y;
        const cz = (tmpBox.min.z + tmpBox.max.z) / 2 - g.position.z;
        handle.point[0] = handle.offset[0] = cx;
        handle.point[1] = handle.offset[1] = cy;
        handle.point[2] = handle.offset[2] = cz;
        handle.half[0] = (tmpBox.max.x - tmpBox.min.x) / 2;
        handle.half[1] = (tmpBox.max.y - tmpBox.min.y) / 2;
        handle.half[2] = (tmpBox.max.z - tmpBox.min.z) / 2;
      }
    } else if (sk && m.skinMoved !== runtime.bonesMoved) keepAnimating(state.invalidate); // the last pose still needs measuring

    if (moving || m.fade !== targetFade || m.base !== targetBase || m.aside !== asideTarget || m.sel !== selTarget || m.tint !== tintTarget || m.simTint !== simTarget || m.glow !== glowTarget)
      keepAnimating(state.invalidate);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // A drag that ends over a part is an orbit, not a pick.
    if (!pickable || e.delta > 6) return;
    e.stopPropagation();
    props.onSelect(part.id);
  };
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!pickable) return;
    e.stopPropagation();
    if (e.pointerType !== 'touch') props.onHover(part.id);
  };
  const onPointerOut = () => {
    if (props.hovered) props.onHover(null);
  };
  const cancelPress = () => {
    if (press.current.timer) clearTimeout(press.current.timer);
    press.current.timer = null;
  };
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType !== 'touch' || !pickable) return;
    e.stopPropagation();
    cancelPress();
    press.current.x = e.nativeEvent.clientX;
    press.current.y = e.nativeEvent.clientY;
    press.current.timer = setTimeout(() => {
      press.current.timer = null;
      props.onSelect(part.id);
    }, LONG_PRESS_MS);
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!press.current.timer) return;
    const dx = e.nativeEvent.clientX - press.current.x;
    const dy = e.nativeEvent.clientY - press.current.y;
    if (dx * dx + dy * dy > 100) cancelPress();
  };
  const handlers = {
    onClick,
    onPointerOver,
    onPointerOut,
    onPointerDown,
    onPointerMove,
    onPointerUp: cancelPress,
    onPointerCancel: cancelPress,
    onPointerLeave: cancelPress,
    userData: { partId: part.id },
  };

  return (
    <group ref={posRef} position={shape.position}>
      <group ref={poseRef} matrixAutoUpdate={false}>
        <group ref={animRef} matrixAutoUpdate={false}>
          <group quaternion={shape.quaternion} scale={shape.scale}>
            {shape.pieces.map((piece, i) => (
              <Piece
                key={i}
                piece={piece}
                material={piece.lines && lineMat ? lineMat : (pms[piece.slot ?? 0] ?? pms[0]!).material}
                castShadow={props.castShadow && !piece.lines}
                register={register}
                handlers={handlers}
                instances={piece.filings ? (props.filings ?? null) : null}
              />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
