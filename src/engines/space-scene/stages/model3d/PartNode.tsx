/**
 * One part on the stage: position (with damped explode), fade (visibility /
 * x-ray), animation pose, theme material, selection outline/glow, label and
 * pointer picking.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Group,
  type Plane,
} from 'three';
import type { Part, PartAnimation } from '../../schema';
import type { PartDisplay } from '../../lib/visibility';
import { animationPose } from '../../lib/animation';
import { explodedPosition } from '../../lib/explode';
import { resolveDataColor, resolveMaterialLook, parseCssColor } from '../../lib/color';
import { damp } from '../../lib/math';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';
import { r3f } from './extend';
import type { StageLook } from './look';

/** Geometry + rest transform of a part (from a primitive or a glb mesh). */
export interface PartShape {
  geometry: BufferGeometry;
  /** Part centre at rest (before explode). */
  position: [number, number, number];
  quaternion: Quaternion;
  scale: Vector3;
  /** Bounding radius in parent units (for labels and outline). */
  radius: number;
}

export interface PartNodeProps {
  part: Part;
  shape: PartShape;
  colorRef: string;
  display: PartDisplay;
  explodeTarget: number;
  animations: readonly PartAnimation[];
  look: StageLook;
  hovered: boolean;
  showLabel: boolean;
  label: string;
  clipping: Plane[] | null;
  /** Changes when the stage must jump without easing (instant transitions). */
  snapKey: number;
  onSelect(id: string): void;
  onHover(id: string | null): void;
}

const noRaycast = () => {};
const LONG_PRESS_MS = 400;
const OUTLINE_WORLD = 0.035;

const tmpQ = new Quaternion();
const tmpAxis = new Vector3();

function glowColor(look: StageLook): Color {
  const c = parseCssColor(look.tokens.glow);
  if (!c || c.a === 0) return new Color(resolveDataColor('token:accent', look.tokens, look.theme));
  return new Color().setRGB(c.r, c.g, c.b, 'srgb');
}

export function PartNode(props: PartNodeProps) {
  const { part, shape, display, look, clipping } = props;
  const runtime = useRuntime();
  const posRef = useRef<Group>(null);
  const animRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const hullRef = useRef<Mesh>(null);
  const motion = useRef({ amount: props.explodeTarget, fade: display.visible ? display.opacity : 0, snap: true });
  const press = useRef<{ timer: ReturnType<typeof setTimeout> | null; x: number; y: number }>({ timer: null, x: 0, y: 0 });

  const material = useMemo(() => new MeshStandardMaterial(), []);
  const hullMaterial = useMemo(
    () => new MeshBasicMaterial({ side: BackSide, transparent: true, depthWrite: false }),
    [],
  );
  useEffect(
    () => () => {
      material.dispose();
      hullMaterial.dispose();
    },
    [material, hullMaterial],
  );

  const cinema = look.theme === 'cinema';
  const [calm] = useState(prefersReducedMotion);
  const surface = useMemo(() => resolveMaterialLook(props.colorRef, look.tokens, look.theme), [props.colorRef, look]);
  const glow = useMemo(() => glowColor(look), [look]);
  const baseColor = useMemo(() => new Color(surface.color), [surface]);

  // Theme-driven material setup.
  useEffect(() => {
    material.color.set(surface.color);
    material.metalness = surface.metalness;
    material.roughness = surface.roughness;
    material.envMapIntensity = cinema ? 1 : 0.55;
    hullMaterial.color.copy(cinema ? glow : new Color(resolveDataColor('token:accent', look.tokens, look.theme)));
    hullMaterial.blending = cinema ? AdditiveBlending : NormalBlending;
    hullMaterial.needsUpdate = true;
  }, [material, hullMaterial, surface, cinema, glow, look]);

  // Cutaway: clip and show inner faces.
  useEffect(() => {
    material.clippingPlanes = clipping;
    hullMaterial.clippingPlanes = clipping;
    const side = clipping || part.primitive?.kind === 'plane' ? DoubleSide : FrontSide;
    if (material.side !== side) {
      material.side = side;
      material.needsUpdate = true;
    }
  }, [material, hullMaterial, clipping, part.primitive?.kind]);

  // Instant transitions snap motion.
  useEffect(() => {
    motion.current.snap = true;
  }, [props.snapKey]);

  // Hidden parts do not take part in picking.
  useEffect(() => {
    if (meshRef.current) meshRef.current.raycast = display.visible ? Mesh.prototype.raycast : noRaycast;
  }, [display.visible]);

  useEffect(() => () => {
    if (press.current.timer) clearTimeout(press.current.timer);
  }, []);

  const hullScale = 1 + OUTLINE_WORLD / Math.max(shape.radius, 0.05);

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const m = motion.current;
    const snap = m.snap;
    m.snap = false;

    // Explode.
    m.amount = snap ? props.explodeTarget : damp(m.amount, props.explodeTarget, 7, dt);
    const p = explodedPosition(shape.position, part.explode, m.amount);
    posRef.current?.position.set(p[0], p[1], p[2]);

    // Fade.
    const targetFade = display.visible ? display.opacity * surface.opacity : 0;
    m.fade = snap ? targetFade : damp(m.fade, targetFade, 9, dt);
    if (Math.abs(m.fade - targetFade) < 0.002) m.fade = targetFade;
    const mesh = meshRef.current;
    if (mesh) mesh.visible = m.fade > 0.004;
    material.opacity = m.fade;
    const transparent = m.fade < 0.999;
    if (material.transparent !== transparent) {
      material.transparent = transparent;
      material.needsUpdate = true;
    }
    material.depthWrite = !display.ghost && m.fade > 0.6;

    // Highlight: selected = brighter + outline (paper) / pulsing glow (cinema).
    const t = calm ? 0 : runtime.elapsed;
    if (display.selected) {
      if (cinema) {
        material.emissive.copy(glow);
        material.emissiveIntensity = 0.16 + 0.1 * Math.sin(t * 2 * Math.PI * 0.6);
      } else {
        material.emissive.copy(baseColor);
        material.emissiveIntensity = 0.18;
      }
    } else if (props.hovered && display.visible) {
      material.emissive.copy(cinema ? glow : baseColor);
      material.emissiveIntensity = cinema ? 0.12 : 0.1;
    } else {
      material.emissiveIntensity = 0;
    }
    const hull = hullRef.current;
    if (hull) {
      hull.visible = display.selected && m.fade > 0.5;
      hullMaterial.opacity = cinema ? 0.55 + 0.3 * Math.sin(t * 2 * Math.PI * 0.6) : 0.9;
    }

    // Animation pose.
    const anim = animRef.current;
    if (anim) {
      anim.quaternion.identity();
      let scale = 1;
      for (const a of props.animations) {
        const always = !a.whenRun;
        if (!always && runtime.energy === 0) continue;
        const pose = animationPose(a, always ? runtime.elapsed : runtime.phase, always ? 1 : runtime.energy);
        tmpAxis.set(pose.axis[0], pose.axis[1], pose.axis[2]);
        if (pose.angle !== 0) anim.quaternion.multiply(tmpQ.setFromAxisAngle(tmpAxis, pose.angle));
        scale *= pose.scale;
      }
      anim.scale.setScalar(scale);
    }

    const settling =
      Math.abs(m.amount - props.explodeTarget) > 5e-4 ||
      m.fade !== targetFade ||
      (display.selected && cinema && !calm);
    if (settling) keepAnimating(state.invalidate);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!display.visible) return;
    e.stopPropagation();
    props.onSelect(part.id);
  };
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!display.visible) return;
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
    if (e.pointerType !== 'touch' || !display.visible) return;
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

  return (
    <group ref={posRef} position={shape.position}>
      <group ref={animRef}>
        <mesh
          ref={meshRef}
          geometry={r3f(shape.geometry)}
          material={r3f(material)}
          quaternion={r3f(shape.quaternion)}
          scale={r3f(shape.scale)}
          dispose={null}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={cancelPress}
          onPointerCancel={cancelPress}
          onPointerLeave={cancelPress}
          userData={{ partId: part.id }}
        >
          <mesh
            ref={hullRef}
            geometry={r3f(shape.geometry)}
            material={r3f(hullMaterial)}
            scale={hullScale}
            visible={false}
            dispose={null}
            raycast={noRaycast}
          />
        </mesh>
      </group>
      {props.showLabel && display.visible && (
        <Html
          center
          position={[0, shape.radius + 0.18, 0]}
          zIndexRange={[4, 0]}
          pointerEvents="none"
          wrapperClass="space-label-wrap"
        >
          <div className="space-label" data-selected={display.selected || undefined}>
            {props.label}
          </div>
        </Html>
      )}
    </group>
  );
}
