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
 * Transform stack: position (rest centre + explode) → pose (matrix) →
 * animations (matrix) → the shape's own transform (glb meshes).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Euler, InstancedMesh, LineBasicMaterial, LineSegments, Matrix4, Mesh, Quaternion, Vector3, type Group, type Object3D, type Plane } from 'three';
import type { Part, PartAnimation } from '../../schema';
import type { PartDisplay } from '../../lib/visibility';
import { animationAngle, animationScale3 } from '../../lib/animation';
import { explodeOffset } from '../../lib/explode';
import { damp, DEG2RAD, easeInOutCubic, normalize3, type Vec3 } from '../../lib/math';
import { isRest, lerpTransform, restTransform, sampleSequence, sequenceLength, smoothstep01, type PartTransform } from '../../lib/pose';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { createPartMaterial, setPartClipping, stylePartMaterial, type PartStyle } from './materials';
import type { ShapePiece } from './geometry';

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
  onSelect(id: string): void;
  onHover(id: string | null): void;
}

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

const tmpQ = new Quaternion();
const tmpM = new Matrix4();
const tmpT = new Matrix4();
const tmpE = new Euler();
const tmpV = new Vector3();
const tmpS = new Vector3();
const tmpS3: Vec3 = [1, 1, 1];

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
}: {
  piece: ShapePiece;
  material: Mesh['material'];
  castShadow: boolean;
  register(o: Object3D | null, piece: ShapePiece): void;
  handlers: Record<string, unknown>;
}) {
  const ref = useRef<Mesh | InstancedMesh | LineSegments>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (mesh instanceof InstancedMesh && piece.matrices) {
      piece.matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    register(mesh, piece);
    return () => register(null, piece);
  }, [piece, register]);
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
    pms.forEach((pm, i) => stylePartMaterial(pm, styles[i] ?? style));
  }, [pms, styles, style]);
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
      half: props.anchorHalf,
      meshes: [],
      fade: 0,
      visible: false,
    }),
    [props.anchorOffset, props.anchorPoint, props.anchorRadius, props.anchorHalf],
  );
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
    },
    [handle],
  );

  // Hidden, faint and context parts do not take part in picking (clicks pass through).
  const pickable = display.visible && display.selectable;
  useEffect(() => {
    for (const o of pieces.current.values()) {
      if (o instanceof LineSegments) continue;
      const own = o instanceof InstancedMesh ? InstancedMesh.prototype.raycast : Mesh.prototype.raycast;
      o.raycast = pickable ? own : noRaycast;
    }
  }, [pickable, shape]);

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

    // Explode (eased centrally, see ExplodeClock).
    const e = runtime.explode + slide;
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

    // Pose: ease from where the part was to the target (instant transitions jump).
    if (snap || m.poseMs <= 0) {
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
      pr.matrix.identity();
      if (!isRest(m.poseNow)) applyTransform(pr.matrix, m.poseNow, shape.position);
      pr.matrixWorldNeedsUpdate = true;
      // The label anchor follows the pose.
      const move = (rest: readonly number[], out: Vec3) => {
        tmpV.set(rest[0]!, rest[1]!, rest[2]!).applyMatrix4(pr.matrix);
        out[0] = tmpV.x;
        out[1] = tmpV.y;
        out[2] = tmpV.z;
      };
      move(props.anchorPoint, handle.point);
      move(props.anchorOffset, handle.offset);
    }

    // Animations (about their pivots) and the fan they or the pose give a folding wing.
    let fan = m.poseNow.fan ?? shape.restFan;
    const anim = animRef.current;
    if (anim && props.animations.length > 0) {
      anim.matrix.identity();
      const running = runtime.energy > 0;
      if (running && !m.wasRunning) m.runStart = runtime.phase;
      m.wasRunning = running;
      props.animations.forEach((a, i) => {
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) return;
        const t = always ? runtime.elapsed : runtime.phase;
        const k = always ? 1 : runtime.energy;
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
        const angle = animationAngle(a, t, k);
        if (angle !== 0) aboutPivot(anim.matrix, tmpM.makeRotationFromQuaternion(tmpQ.setFromAxisAngle(axes[i]!, angle)), pivots[i]!);
      });
      anim.matrixWorldNeedsUpdate = true;
      if (props.castShadow && runtime.energy > 0) runtime.shadowDirty = true;
    }
    for (const f of fans) if (f.fan!.apply(fan) && props.castShadow) runtime.shadowDirty = true;
    if (moving) {
      runtime.moved++;
      if (props.castShadow) runtime.shadowDirty = true;
    }

    if (moving || m.fade !== targetFade || m.base !== targetBase || m.aside !== asideTarget || m.sel !== selTarget) keepAnimating(state.invalidate);
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
              />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
