/**
 * One part on the stage: position (shared eased explode), fade (visibility /
 * x-ray), put-aside motion (`hide`: slide out along the explode direction,
 * then fade; back the same way), animation pose, family material with
 * selection edge and cut face, and pointer picking (never for context
 * parts). A part is one or more pieces (meshes or instanced meshes) sharing
 * one material per material slot (a coil's fins and copper tubes, a
 * compressor's shell and terminal cover).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { InstancedMesh, Mesh, Quaternion, Vector3, type Group, type Object3D, type Plane } from 'three';
import type { Part, PartAnimation } from '../../schema';
import type { PartDisplay } from '../../lib/visibility';
import { animationAngle, animationScale } from '../../lib/animation';
import { explodeOffset } from '../../lib/explode';
import { damp, easeInOutCubic, normalize3, type Vec3 } from '../../lib/math';
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
const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

const tmpQ = new Quaternion();

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
  const ref = useRef<Mesh | InstancedMesh>(null);
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
  const animRef = useRef<Group>(null);
  const pieces = useRef(new Map<ShapePiece, Object3D>());
  const motion = useRef({
    base: display.visible ? display.opacity : 0,
    fade: display.visible ? display.opacity : 0,
    aside: display.hidden ? 1 : 0,
    sel: 0,
    snap: true,
    cast: false,
  });
  const press = useRef<{ timer: ReturnType<typeof setTimeout> | null; x: number; y: number }>({ timer: null, x: 0, y: 0 });

  const slotCount = styles.length;
  const pms = useMemo(() => Array.from({ length: slotCount }, () => createPartMaterial()), [slotCount]);
  // Per-frame maths without allocation: explode vector and unit animation axes, once. Context parts stay put.
  const push = useMemo(() => (part.context ? ([0, 0, 0] as Vec3) : explodeOffset(part.explode, 1)), [part.explode, part.context]);
  const axes = useMemo(
    () => props.animations.map((a) => (a.kind === 'pulse' ? new Vector3(0, 1, 0) : new Vector3(...normalize3(a.axis)))),
    [props.animations],
  );
  useEffect(() => () => pms.forEach((pm) => pm.material.dispose()), [pms]);

  useEffect(() => {
    pms.forEach((pm, i) => stylePartMaterial(pm, styles[i] ?? style));
  }, [pms, styles, style]);

  useEffect(() => {
    pms.forEach((pm) => setPartClipping(pm, clipping, shape.closed, shape.twoSided));
  }, [pms, clipping, shape.closed, shape.twoSided]);

  useEffect(() => {
    motion.current.snap = true;
  }, [props.snapKey]);

  // Handle for leader labels / occlusion.
  const handle = useMemo<PartHandle>(
    () => ({
      object: null as unknown as Object3D,
      offset: props.anchorOffset,
      point: props.anchorPoint,
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
    handle.meshes = [...pieces.current.values()];
    handles.set(part.id, handle);
    return () => {
      if (handles.get(part.id) === handle) handles.delete(part.id);
    };
  }, [handles, handle, part.id, shape]);

  const register = useMemo(
    () => (o: Object3D | null, piece: ShapePiece) => {
      if (o) pieces.current.set(piece, o);
      else pieces.current.delete(piece);
      handle.meshes = [...pieces.current.values()];
    },
    [handle],
  );

  // Hidden and context parts do not take part in picking (clicks pass through scenery).
  const pickable = display.visible && display.selectable;
  useEffect(() => {
    for (const o of pieces.current.values()) {
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
    const cast = props.castShadow && m.fade > 0.6;
    for (const o of pieces.current.values()) {
      o.visible = shown;
      o.castShadow = cast;
    }
    if (cast !== m.cast || (props.castShadow && prevFade !== m.fade)) runtime.shadowDirty = true;
    m.cast = cast;
    handle.fade = m.fade;
    handle.visible = shown && display.visible;

    // Selection edge (hover: weaker).
    const selTarget = display.selected ? 1 : props.hovered && display.visible ? 0.45 : 0;
    m.sel = snap ? selTarget : damp(m.sel, selTarget, 12, dt);
    if (Math.abs(m.sel - selTarget) < 0.003) m.sel = selTarget;
    for (const pm of pms) pm.uniforms.uSel.value = m.sel;

    // Animation pose.
    const anim = animRef.current;
    if (anim && props.animations.length > 0) {
      anim.quaternion.identity();
      let scale = 1;
      props.animations.forEach((a, i) => {
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) return;
        const t = always ? runtime.elapsed : runtime.phase;
        const k = always ? 1 : runtime.energy;
        const angle = animationAngle(a, t, k);
        if (angle !== 0) anim.quaternion.multiply(tmpQ.setFromAxisAngle(axes[i]!, angle));
        scale *= animationScale(a, t, k);
      });
      anim.scale.setScalar(scale);
      if (props.castShadow && runtime.energy > 0) runtime.shadowDirty = true;
    }

    if (m.fade !== targetFade || m.base !== targetBase || m.aside !== asideTarget || m.sel !== selTarget) keepAnimating(state.invalidate);
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
      <group ref={animRef}>
        <group quaternion={shape.quaternion} scale={shape.scale}>
          {shape.pieces.map((piece, i) => (
            <Piece
              key={i}
              piece={piece}
              material={(pms[piece.slot ?? 0] ?? pms[0]!).material}
              castShadow={props.castShadow}
              register={register}
              handlers={handlers}
            />
          ))}
        </group>
      </group>
    </group>
  );
}
