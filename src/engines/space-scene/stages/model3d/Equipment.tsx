/**
 * Exercise-mode equipment on the stage (lib/equipment.ts; docs/16 §6.5,
 * decision 13: restrained — the muscles are the subject; docs/06 动作模式数据手册).
 *
 *  - Held pieces (barbell, dumbbells, kettlebells, cable handles, a lat bar)
 *    sit in the palms — the rig's `hand.l` / `hand.r` bone plus its `offset`
 *    along the forearm (grip.ts) — inside the body's root group, so they turn
 *    with it; a bar runs palm to palm, a dumbbell or handle across the forearm
 *    (side to side, front to back for a neutral grip); a barbell `on: back`
 *    rides on the trunk joint.
 *  - Lines (a cable from its pulley, a band from its anchor, the lat bar's
 *    cable) run from a fixed point in the scene to the palms (or the feet),
 *    stretched every frame.
 *  - Free-standing pieces (bench, seat, step, floor, pull-up bar, dip bars,
 *    cable column and pulley) stand where the MotionDriver's placement puts
 *    them (`runtime.exercise`: the trunk joint, the held palms, the feet,
 *    the floor).
 *
 * Every piece is drawn in one neutral matte grey (soft highlights only on the
 * chamfers); with the mannequin they are solid (the floor half see-through) and
 * drawn just before it; with the ghost outline the free-standing ones are
 * see-through. None casts a shadow. One draw call per piece, never picked or
 * labelled.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3, type BufferGeometry, type Group, type Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { EquipmentSpec } from '../../../../content/schema/fitness';
import {
  BAND,
  barbellShape,
  barYaw,
  benchShape,
  cableHandleShape,
  columnShape,
  dipBarShape,
  dumbbellShape,
  floorShape,
  heightOf,
  INCLINE_DEFAULT,
  kettlebellShape,
  LAT_BAR,
  lineShape,
  machineSeatShape,
  placeFixed,
  postShape,
  pullUpBarShape,
  stepShape,
  straightBarShape,
  wallShape,
  type EquipmentShape,
  type PlaceContext,
} from '../../lib/equipment';
import type { Part } from '../../schema';
import { partPieces } from './geometry';
import { createPartMaterial, stylePartMaterial, type PartMaterial, type PartStyle } from './materials';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { damp } from '../../lib/math';
import { gripPoint, type Grip } from './grip';
import { footPoints, type Foot } from './foot';

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const _a = new Vector3();
const _b = new Vector3();
const _f = new Vector3();
const _f2 = new Vector3();
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();
const _m = new Matrix4();
const _q = new Quaternion();

/** See-through free-standing pieces with the ghost outline (the body reads through them). */
const GHOST_OPACITY = 0.6;
const FLOOR_OPACITY = { ghost: 0.25, solid: 0.5 } as const;
/** Draw order with the mannequin: before it (Mannequin.tsx −1), so a bar in front of the body covers it. */
const EQUIPMENT_RENDER_ORDER = -2;
/** Cable diameter beside the wire figure (metres; LAT_BAR.cable otherwise). */
const THIN_CABLE = 0.003;
/** The lat bar's pulley sits this far above the bar at the first key when the data gives no `at` (metres). */
const LAT_PULLEY_RISE = 0.85;

type Place =
  /** Between the palms (a bar). */
  | { kind: 'hands' }
  /** In one palm. */
  | { kind: 'palm'; side: 'l' | 'r' }
  /** On the trunk joint (a barbell on the back), `at` in its rest frame. */
  | { kind: 'back' }
  /** Free-standing; `side` picks a dip bar. */
  | { kind: 'fixed'; side: number }
  /** A cable's pulley wheel, at the trunk + `at`. */
  | { kind: 'pulley' }
  /** A line from the pulley / anchor to a palm, the palms' midpoint, a foot's ball or an ankle (a cuff). */
  | { kind: 'line'; to: 'l' | 'r' | 'mid' | 'foot-l' | 'foot-r' | 'ankle-l' | 'ankle-r' }
  /** One held between both palms: on end (`vertical`) or along the arms (`both`: a pullover, a goblet). */
  | { kind: 'cupped' };

interface Piece {
  place: Place;
  spec: EquipmentSpec;
  geometry: BufferGeometry;
  /** Free-standing pieces only: opacity with the ghost outline / the mannequin. */
  see: boolean;
}

/**
 * A shape as one geometry in its own frame (one draw call: every primitive has
 * the same material, so `partPieces` merges them into one piece, placed
 * relative to the main primitive).
 */
function oneGeometry(shape: EquipmentShape): BufferGeometry {
  const part = { primitive: shape.primitive, ...(shape.extra ? { extra: shape.extra } : {}) } as Pick<Part, 'primitive'> & { extra?: Part['extra'] };
  const parts = partPieces(part).map((p) => {
    if (p.matrices?.length === 1) p.geometry.applyMatrix4(p.matrices[0]!);
    return p.geometry;
  });
  const geometry = parts.length === 1 ? parts[0]! : mergeGeometries(parts, false);
  const at = shape.primitive.at;
  geometry.translate(at[0], at[1], at[2]);
  return geometry;
}

const sides = (hand: EquipmentSpec['hand']): ('l' | 'r')[] => (hand === 'left' ? ['l'] : hand === 'right' ? ['r'] : ['l', 'r']);

/** The pieces one spec draws, held (in the body's frame) or not. */
function piecesOf(spec: EquipmentSpec, held: boolean, cable: number): Piece[] {
  const out: Piece[] = [];
  const add = (place: Place, shape: EquipmentShape, see = false) => out.push({ place, spec, geometry: oneGeometry(shape), see });
  const isHeld = (p: Place) => p.kind === 'hands' || p.kind === 'palm' || p.kind === 'back' || p.kind === 'cupped';
  const want = (p: Place) => isHeld(p) === held;
  const each = (place: Place, shape: () => EquipmentShape, see = false) => {
    if (want(place)) add(place, shape(), see);
  };
  switch (spec.kind) {
    case 'barbell':
      each(spec.on === 'back' ? { kind: 'back' } : { kind: 'hands' }, barbellShape);
      break;
    case 'dumbbell':
    case 'kettlebell':
    case 'cable-handle': {
      const shape = spec.kind === 'dumbbell' ? dumbbellShape : spec.kind === 'kettlebell' ? kettlebellShape : cableHandleShape;
      // On end in both hands: one, between the palms.
      if (spec.hold === 'both' || (spec.hold === 'vertical' && (spec.hand ?? 'both') === 'both')) each({ kind: 'cupped' }, shape);
      else for (const side of sides(spec.hand)) each({ kind: 'palm', side }, shape);
      break;
    }
    case 'lat-bar':
      each({ kind: 'hands' }, () => straightBarShape(LAT_BAR.length));
      each({ kind: 'line', to: 'mid' }, () => lineShape(cable));
      each({ kind: 'pulley' }, () => columnPulley());
      break;
    case 'cable':
      if (spec.to === 'ankle.l' || spec.to === 'ankle.r') each({ kind: 'line', to: spec.to === 'ankle.l' ? 'ankle-l' : 'ankle-r' }, () => lineShape(cable));
      else if (spec.handle === 'bar') {
        each({ kind: 'hands' }, () => straightBarShape(0.5));
        each({ kind: 'line', to: 'mid' }, () => lineShape(cable));
      } else
        for (const side of sides(spec.hand)) {
          each({ kind: 'palm', side }, cableHandleShape);
          each({ kind: 'line', to: side }, () => lineShape(cable));
        }
      each({ kind: 'fixed', side: 0 }, () => columnShape(0), true);
      each({ kind: 'pulley' }, () => columnPulley());
      break;
    case 'band':
      for (const side of sides(spec.hand)) each({ kind: 'line', to: spec.to === 'feet' ? (side === 'l' ? 'foot-l' : 'foot-r') : side }, () => lineShape(BAND.thick));
      break;
    case 'bench':
      each({ kind: 'fixed', side: 0 }, () => benchShape(spec.incline ?? 0), true);
      break;
    case 'incline-bench':
      each({ kind: 'fixed', side: 0 }, () => benchShape(spec.angle ?? INCLINE_DEFAULT), true);
      break;
    case 'machine-seat':
      each({ kind: 'fixed', side: 0 }, () => machineSeatShape(spec.angle, heightOf(spec), spec.thighPad ?? false), true);
      break;
    case 'pull-up-bar':
      each({ kind: 'fixed', side: 0 }, () => pullUpBarShape(heightOf(spec)), true);
      break;
    case 'dip-bars':
      each({ kind: 'fixed', side: 0 }, () => dipBarShape(heightOf(spec)), true);
      each({ kind: 'fixed', side: 1 }, () => dipBarShape(heightOf(spec)), true);
      break;
    case 'step':
      each({ kind: 'fixed', side: 0 }, () => stepShape(heightOf(spec)), true);
      break;
    case 'floor':
      each({ kind: 'fixed', side: 0 }, floorShape, true);
      break;
    case 'wall':
      each({ kind: 'fixed', side: 0 }, () => wallShape(heightOf(spec)), true);
      break;
    case 'post':
      each({ kind: 'fixed', side: 0 }, () => postShape(heightOf(spec)), true);
      break;
  }
  return out;
}

const _up = new Vector3();
const _qr = new Quaternion();
/**
 * The turn of a piece held in a palm (its handle along X, the ring or bell
 * along −Y toward the fingers): `across` the forearm (side to side, front to
 * back for a neutral grip; default), `along` it, or `vertical` (on end: the
 * handle along the scene's up). `forearm` is the elbow → wrist direction.
 */
function heldTurn(hold: EquipmentSpec['hold'], grip: EquipmentSpec['grip'], forearm: Vector3, root: Matrix4): Quaternion {
  if (hold === 'along' || hold === 'vertical') {
    if (hold === 'along') _x.copy(forearm);
    else _x.copy(_up.set(0, 1, 0).applyQuaternion(_qr.setFromRotationMatrix(root).invert()));
    // The ring / bell hangs across the handle, toward the body's front where it can.
    _y.set(0, 0, -1).addScaledVector(_x, _x.z);
    if (_y.lengthSq() < 1e-6) _y.set(0, -1, 0).addScaledVector(_x, _x.y);
    _y.normalize();
  } else {
    _x.set(grip === 'neutral' ? 0 : 1, 0, grip === 'neutral' ? 1 : 0);
    _x.addScaledVector(forearm, -_x.dot(forearm));
    if (_x.lengthSq() < 1e-6) _x.set(0, 1, 0).addScaledVector(forearm, -forearm.y);
    _x.normalize();
    _y.copy(forearm).negate();
  }
  _z.crossVectors(_x, _y);
  return _q.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
}

/** The pulley wheel (a short disc along X) on its own, at the pulley point. */
function columnPulley(): EquipmentShape {
  const shape = columnShape(0);
  const wheel = shape.extra![0]!;
  return { primitive: { ...wheel, at: [0, 0, 0] } };
}

export function Equipment({
  specs,
  held,
  grips,
  footing,
  trunk,
  style,
  solid,
  thin = false,
}: {
  specs: readonly EquipmentSpec[];
  /** Held pieces (inside the root group) or the rest (scene). */
  held: boolean;
  /** The palms' grip points (`hand.l`, `hand.r` + offset), when the rig has them. */
  grips: { l: Grip | null; r: Grip | null };
  /** The rig's feet (a band to the feet). */
  footing: { l: Foot | null; r: Foot | null };
  /** The trunk joint's bone (a barbell on the back). */
  trunk: Object3D | null;
  /** The equipment's neutral look. */
  style: PartStyle;
  /** With the mannequin or the wire figure: solid, drawn before the body. */
  solid: boolean;
  /** Beside the wire figure: the cables thinner. */
  thin?: boolean;
}) {
  const runtime = useRuntime();
  const pieces = useMemo(() => specs.flatMap((spec) => piecesOf(spec, held, thin ? THIN_CABLE : LAT_BAR.cable)), [specs, held, thin]);
  useEffect(() => () => pieces.forEach((p) => p.geometry.dispose()), [pieces]);

  const materials = useMemo<PartMaterial[]>(() => pieces.map(() => createPartMaterial()), [pieces]);
  useEffect(() => {
    for (const m of materials) {
      stylePartMaterial(m, style);
      // Matte, a soft sheen on the chamfers, no rim.
      m.material.metalness = 0;
      m.material.roughness = 0.68;
      m.material.envMapIntensity = 0.5;
      m.material.emissive.setScalar(0);
      m.material.depthWrite = true;
    }
  }, [materials, style]);
  useEffect(() => () => materials.forEach((m) => m.material.dispose()), [materials]);
  const opacity = (p: Piece) => (!p.see ? 1 : p.spec.kind === 'floor' ? FLOOR_OPACITY[solid ? 'solid' : 'ghost'] : solid ? 1 : GHOST_OPACITY);

  const groups = useRef<(Group | null)[]>([]);
  const fade = useRef(0);
  const placedAt = useRef(-1);
  useEffect(() => {
    placedAt.current = -1;
  }, [pieces, solid]);
  useFrame((state, delta) => {
    if (pieces.length === 0) return;
    // Nothing moved since the last placement: no work, no shadow update.
    if (fade.current === 1 && placedAt.current === runtime.bonesMoved) return;
    placedAt.current = runtime.bonesMoved;
    fade.current = damp(fade.current, 1, 6, Math.min(delta, MAX_DT));
    if (fade.current > 0.995) fade.current = 1;
    pieces.forEach((p, i) => {
      const { material } = materials[i]!;
      material.opacity = fade.current * opacity(p);
      const transparent = material.opacity < 0.999;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
    });
    const ex = runtime.exercise;
    const ctx: PlaceContext | null = ex
      ? {
          trunk: ex.trunk.toArray() as [number, number, number],
          palms: ex.palms ? [ex.palms[0].toArray() as [number, number, number], ex.palms[1].toArray() as [number, number, number]] : null,
          feet: ex.feet ? (ex.feet.toArray() as [number, number, number]) : null,
          modelFloor: ex.modelFloor,
        }
      : null;
    const { l, r } = grips;
    /** The pulley / anchor of a line or pulley piece (scene). */
    const anchor = (spec: EquipmentSpec, out: Vector3): boolean => {
      if (!ex) return false;
      if (spec.at) {
        out.set(ex.trunk.x + spec.at[0], ex.trunk.y + spec.at[1], ex.trunk.z + spec.at[2]);
        return true;
      }
      // A lat bar without `at`: straight above the bar where the first key holds it.
      if (!ex.hands) return false;
      out.addVectors(ex.hands[0], ex.hands[1]).multiplyScalar(0.5);
      out.y += LAT_PULLEY_RISE;
      return true;
    };
    pieces.forEach((p, i) => {
      const g = groups.current[i];
      if (!g) return;
      const place = p.place;
      g.visible = false;
      switch (place.kind) {
        case 'fixed': {
          if (!ctx) return;
          const at = placeFixed(p.spec, ctx, ex!.floor, place.side);
          g.position.set(at[0], at[1], at[2]);
          let yaw = p.spec.turn ?? 0;
          if (p.spec.kind === 'pull-up-bar') yaw += barYaw(ctx.palms);
          if (p.spec.kind === 'cable') yaw += (Math.atan2(ctx.trunk[0] - at[0], ctx.trunk[2] - at[2]) * 180) / Math.PI;
          g.rotation.set(0, (yaw * Math.PI) / 180, 0);
          break;
        }
        case 'pulley': {
          if (!anchor(p.spec, g.position)) return;
          if (ex) g.rotation.set(0, Math.atan2(ex.trunk.x - g.position.x, ex.trunk.z - g.position.z), 0);
          break;
        }
        case 'line': {
          if (!anchor(p.spec, _a)) return;
          // The body end: a palm, the palms' midpoint or a foot, in the scene (the root turn applied).
          if (place.to === 'foot-l' || place.to === 'foot-r') {
            const foot = place.to === 'foot-l' ? footing.l : footing.r;
            if (!foot) return;
            footPoints(foot, _f, _b);
          } else if (place.to === 'ankle-l' || place.to === 'ankle-r') {
            const foot = place.to === 'ankle-l' ? footing.l : footing.r;
            if (!foot) return;
            foot.bone.getWorldPosition(_b);
          } else if (place.to === 'mid') {
            if (!l || !r) return;
            gripPoint(l, _b, _f);
            gripPoint(r, _f2, _f);
            _b.add(_f2).multiplyScalar(0.5);
          } else {
            const grip = place.to === 'l' ? l : r;
            if (!grip) return;
            gripPoint(grip, _b, _f);
          }
          _b.applyMatrix4(runtime.root);
          _x.subVectors(_b, _a);
          const len = _x.length();
          if (len < 1e-4) return;
          g.position.copy(_a);
          g.quaternion.setFromUnitVectors(Y, _x.multiplyScalar(1 / len));
          g.scale.set(1, len, 1);
          break;
        }
        case 'back': {
          if (!trunk || !p.spec.at) return;
          g.position.set(p.spec.at[0], p.spec.at[1], p.spec.at[2]).applyMatrix4(trunk.matrixWorld);
          trunk.getWorldQuaternion(g.quaternion);
          break;
        }
        case 'hands': {
          if (!l || !r) return;
          gripPoint(l, _a, _f);
          gripPoint(r, _b, _f2);
          g.position.copy(_a).add(_b).multiplyScalar(0.5);
          // Palm to palm (the bar lies across both forearms in a pronated grip).
          _x.subVectors(_a, _b);
          g.quaternion.copy(_x.lengthSq() > 1e-8 ? _q.setFromUnitVectors(X, _x.normalize()) : _q.identity());
          break;
        }
        case 'palm': {
          const grip = place.side === 'l' ? l : r;
          if (!grip) return;
          gripPoint(grip, g.position, _f);
          g.quaternion.copy(heldTurn(p.spec.hold, p.spec.grip, _f, runtime.root));
          break;
        }
        case 'cupped': {
          if (!l || !r) return;
          gripPoint(l, _a, _f);
          gripPoint(r, _b, _f2);
          g.position.copy(_a).add(_b).multiplyScalar(0.5);
          _f.add(_f2).normalize();
          g.quaternion.copy(heldTurn(p.spec.hold === 'both' ? 'along' : 'vertical', p.spec.grip, _f, runtime.root));
          break;
        }
      }
      g.visible = true;
    });
    runtime.shadowDirty = true;
    if (fade.current < 1) keepAnimating(state.invalidate);
  });

  return (
    <>
      {pieces.map((p, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)} visible={false}>
          <mesh geometry={p.geometry} material={materials[i]!.material} raycast={() => {}} renderOrder={solid ? EQUIPMENT_RENDER_ORDER : 0} dispose={null} />
        </group>
      ))}
    </>
  );
}
