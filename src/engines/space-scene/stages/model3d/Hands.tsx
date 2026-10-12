/**
 * Procedural hands for the exercise body styles (lib/hands.ts plans each
 * hand; handShapes.ts builds it): a fist closed round the held bar, handle or
 * dumbbell, a flat palm on the floor or a bench, a relaxed hand when free —
 * instead of the skin's splayed hands, which the wire figure and the
 * mannequin leave out.
 *
 * Each hand sits in its frame every frame: a fist on the grip point (the
 * rig's `hand.*` joint plus its offset, where the equipment is held) with the
 * forearm along y and the thumb set by the grip; a free hand turned with its
 * joint (pronation, a bent wrist) from its rest frame; a palm from the wrist along
 * the forearm, flat on the surface under it (the floor, a bench top); a
 * relaxed hand on the wrist joint — or flat, when the palm comes within 2 cm
 * of a surface.
 * A short wrist link runs from the joint to the hand's heel. Drawn inside
 * the body's root group (skeleton frame).
 *
 * Mannequin: solid, in the mannequin's colour and matte finish, casting the
 * key light's shadow. Wire: an outlined shape — an opaque fill at the
 * silhouette's 8 % ink over the stage, with a back-face hull (offset 3 mm
 * along the normals) at 70 % ink (one line, where the figure's 55 % hairlines
 * cross and double up).
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Matrix4, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3, type BufferGeometry, type Group, type Material, type Mesh } from 'three';
import type { EquipmentSpec } from '../../../../content/schema/fitness';
import { PALM_LIFT } from '../../lib/equipment';
import { handFrame, PALM, surfaceHeights, surfaceUnder, type HandPlan } from '../../lib/hands';
import { damp } from '../../lib/math';
import { gripPoint, type Grip } from './grip';
import { handGeometry, heelPoint, palmGeometry, WRIST_RADIUS, wristCapGeometry, wristLinkGeometry } from './handShapes';
import { FADE_RATE } from './Mannequin';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';

/** Outline hull width (metres along the normals). */
const HULL = 0.003;
/** A wrist link shorter than this is not drawn (metres). */
const MIN_LINK = 0.004;

const Y = new Vector3(0, 1, 0);
const _g = new Vector3();
const _w = new Vector3();
const _u = new Vector3();
const _o = new Vector3();
const _t = new Vector3();
const _h = new Vector3();
const _d = new Vector3();
const _up = new Vector3();
const _z = new Vector3();
const _x = new Vector3();
const _y = new Vector3();
const _zz = new Vector3();
const _s = new Vector3();
const _q = new Quaternion();
const _m = new Matrix4();
const _mi = new Matrix4();

type Side = 'l' | 'r';
const SIDES: Side[] = ['l', 'r'];
const tuple = (v: Vector3) => [v.x, v.y, v.z] as const;

/** A back-face hull: the mesh grown along its view-space normals, drawn behind the fill as its outline. */
function hullMaterial(): MeshBasicMaterial {
  const m = new MeshBasicMaterial({ side: BackSide, toneMapped: false });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      /* glsl */ `
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
mvPosition.xyz += normalize( normalMatrix * normal ) * ${HULL.toFixed(4)};
gl_Position = projectionMatrix * mvPosition;
`,
    );
  };
  m.customProgramCacheKey = () => 'atlas-hand-hull';
  return m;
}

export interface HandColors {
  /** Mannequin: its colour. */
  solid: string;
  /** Wire: the silhouette fill and the outline, mixed over the stage. */
  fill: string;
  line: string;
}

export function Hands({
  plans,
  equipment,
  grips,
  style,
  colors,
  on,
}: {
  plans: Record<Side, HandPlan>;
  /** The exercise's equipment (the surfaces a palm lies on). */
  equipment: readonly EquipmentSpec[];
  grips: Record<Side, Grip | null>;
  style: 'wire' | 'mannequin';
  colors: HandColors;
  on: boolean;
}) {
  const runtime = useRuntime();
  const geos = useMemo(
    () => ({
      l: handGeometry(plans.l.kind, plans.l.radius),
      r: plans.r.kind === plans.l.kind && plans.r.radius === plans.l.radius ? null : handGeometry(plans.r.kind, plans.r.radius),
      palm: palmGeometry(),
      link: wristLinkGeometry(),
      cap: wristCapGeometry(),
    }),
    [plans],
  );
  useEffect(() => () => [geos.l, geos.r, geos.palm, geos.link, geos.cap].forEach((g) => g?.dispose()), [geos]);
  const handGeo = (side: Side): BufferGeometry => (side === 'r' ? (geos.r ?? geos.l) : geos.l);

  const mats = useMemo(
    () => ({
      solid: new MeshStandardMaterial({ roughness: 0.85, metalness: 0, envMapIntensity: 0.35 }),
      fill: new MeshBasicMaterial({ toneMapped: false }),
      hull: hullMaterial(),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  useEffect(() => {
    mats.solid.color.set(colors.solid);
    mats.fill.color.set(colors.fill);
    mats.hull.color.set(colors.line);
  }, [mats, colors]);
  const passes: { material: Material; shadow: boolean }[] =
    style === 'mannequin' ? [{ material: mats.solid, shadow: true }] : [{ material: mats.fill, shadow: false }, { material: mats.hull, shadow: false }];

  const hands = useRef<Record<Side, Group | null>>({ l: null, r: null });
  /** A free hand laid flat on a surface it comes near. */
  const flats = useRef<Record<Side, Group | null>>({ l: null, r: null });
  const links = useRef<Record<Side, Group | null>>({ l: null, r: null });
  const caps = useRef<Record<Side, Group | null>>({ l: null, r: null });
  const root = useRef<Group>(null);
  const fade = useRef(0);
  const placedAt = useRef(-1);
  useEffect(() => {
    placedAt.current = -1;
  }, [plans, grips, style, equipment]);

  useFrame((state, delta) => {
    const target = on ? 1 : 0;
    fade.current = damp(fade.current, target, FADE_RATE, Math.min(delta, MAX_DT));
    if (Math.abs(fade.current - target) < 0.004) fade.current = target;
    // The solid hands fade with the mannequin; the outlined ones appear with the wire figure.
    const alpha = style === 'mannequin' ? fade.current : fade.current > 0.5 ? 1 : 0;
    for (const m of [mats.solid, mats.fill, mats.hull]) {
      m.opacity = alpha;
      const transparent = alpha < 0.999;
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
    }
    if (root.current) root.current.visible = fade.current > 0.004;
    if (fade.current !== target) {
      runtime.shadowDirty = true;
      keepAnimating(state.invalidate);
    }
    if (fade.current <= 0.004 || placedAt.current === runtime.bonesMoved) return;
    placedAt.current = runtime.bonesMoved;
    // The scene's up and +Z in the body's frame (the root turn undone).
    _q.setFromRotationMatrix(runtime.root).invert();
    _up.set(0, 1, 0).applyQuaternion(_q);
    _z.set(0, 0, 1).applyQuaternion(_q);
    _mi.copy(runtime.root).invert();
    const ex = runtime.exercise;
    const heights = ex ? surfaceHeights(equipment, { trunkY: ex.trunk.y, floor: ex.floor, modelFloor: ex.modelFloor }) : [];
    for (const side of SIDES) {
      const grip = grips[side];
      const base = hands.current[side];
      const flat = flats.current[side];
      const link = links.current[side];
      const cap = caps.current[side];
      if (!base || !flat || !link || !cap) continue;
      if (!grip) {
        base.visible = flat.visible = link.visible = cap.visible = false;
        continue;
      }
      let plan = plans[side];
      gripPoint(grip, _g, _u);
      // The surface under the palm (scene y): a contact palm's (else its own height), or one a free hand comes near.
      _s.copy(_g).applyMatrix4(runtime.root);
      let surface: number | null = null;
      if (plan.kind === 'palm') surface = surfaceUnder(_s.y, heights, 0.1, 0.1) ?? _s.y - PALM_LIFT;
      else if (plan.kind === 'relaxed') {
        surface = surfaceUnder(_s.y, heights);
        if (surface !== null) plan = PALM;
      }
      const hand = plan === plans[side] ? base : flat;
      (hand === base ? flat : base).visible = false;
      grip.bone.getWorldPosition(_w);
      const other = grips[side === 'l' ? 'r' : 'l'];
      let toOther: readonly [number, number, number] | null = null;
      if (other) {
        gripPoint(other, _o, _t);
        toOther = tuple(_o.sub(_g));
      }
      let f = handFrame(side, plan, { forearm: tuple(_u), toOther, sceneZ: tuple(_z), sceneUp: tuple(_up) });
      if (plan.kind === 'relaxed') {
        // A free hand turns with its joint (and so with the forearm's pronation): its rest frame, the arm hanging
        // (along the rest wrist → palm offset, thumb forward), carried by the joint's rotation since rest.
        const rest = handFrame(side, plan, { forearm: tuple(_t.copy(grip.offset).lengthSq() > 1e-8 ? _t.normalize() : _t.set(0, -1, 0)) });
        grip.bone.getWorldQuaternion(_q).multiply(grip.restInverse);
        const turn = (v: readonly number[]) => tuple(_t.set(v[0]!, v[1]!, v[2]!).applyQuaternion(_q));
        f = { x: [...turn(rest.x)], y: [...turn(rest.y)], z: [...turn(rest.z)] };
      }
      // Origin: on the grip axis (fist), under the wrist on the surface (palm), at the wrist (relaxed).
      if (plan.kind === 'fist') _h.copy(_g);
      else if (plan.kind === 'palm' && surface !== null) {
        // A point of the surface in the body's frame, and the wrist dropped onto it along the scene's up.
        _t.set(_s.x, surface, _s.z).applyMatrix4(_mi);
        _h.copy(_w).addScaledVector(_up, _t.dot(_up) - _w.dot(_up));
      } else _h.copy(_w);
      _x.set(...f.x);
      _y.set(...f.y);
      _zz.set(...f.z);
      _m.makeBasis(_x, _y, _zz).setPosition(_h);
      hand.matrix.copy(_m);
      hand.matrixWorldNeedsUpdate = true;
      hand.visible = true;
      // Wrist joint, and the link from it to the hand's heel.
      cap.position.copy(_w);
      cap.scale.setScalar(WRIST_RADIUS);
      cap.visible = true;
      const heel = heelPoint(plan.kind, plan.radius);
      _t.set(...heel).applyMatrix4(_m);
      _d.subVectors(_t, _w);
      const len = _d.length();
      link.visible = len > MIN_LINK;
      if (link.visible) {
        link.position.copy(_w);
        link.quaternion.setFromUnitVectors(Y, _d.multiplyScalar(1 / len));
        link.scale.set(WRIST_RADIUS, len, WRIST_RADIUS);
      }
    }
    runtime.shadowDirty = true;
  });

  const meshes = (geometry: BufferGeometry) =>
    passes.map((p, i) => (
      <mesh key={i} geometry={geometry} material={p.material} castShadow={p.shadow} raycast={() => {}} dispose={null} ref={(m: Mesh | null) => void (m && (m.frustumCulled = false))} />
    ));
  return (
    <group ref={root} visible={false}>
      {SIDES.map((side) => (
        <group key={side}>
          <group ref={(g) => void (hands.current[side] = g)} matrixAutoUpdate={false} visible={false}>
            {meshes(handGeo(side))}
          </group>
          <group ref={(g) => void (flats.current[side] = g)} matrixAutoUpdate={false} visible={false}>
            {meshes(geos.palm)}
          </group>
          <group ref={(g) => void (links.current[side] = g)} visible={false}>
            {meshes(geos.link)}
          </group>
          <group ref={(g) => void (caps.current[side] = g)} visible={false}>
            {meshes(geos.cap)}
          </group>
        </group>
      ))}
    </group>
  );
}
