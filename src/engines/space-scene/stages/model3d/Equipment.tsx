/**
 * Exercise-mode equipment on the stage (lib/equipment.ts; docs/16 §6.5,
 * decision 13: restrained — the muscles are the subject). Held pieces
 * (barbell, dumbbells, cable handles) sit in the palms — the rig's `hand.l` /
 * `hand.r` bone plus its `offset` along the forearm (grip.ts) — inside the
 * body's root group, so they turn with it; the barbell runs palm to palm, a
 * dumbbell or handle across the forearm (side to side, front to back for a
 * neutral grip). Free-standing pieces (bench, floor, dip bars) stand in the
 * scene where the MotionDriver's placement puts them (`runtime.exercise`:
 * relative to the trunk joint, the planted palms, the floor).
 *
 * Every piece is drawn in one neutral matte dark grey (no highlights); the
 * free-standing ones are see-through (bench and bars 60 %, floor 25 %), and
 * none casts a shadow. One draw call per piece, never picked or labelled.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3, type BufferGeometry, type Group } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { EquipmentSpec } from '../../../../content/schema/fitness';
import { barbellShape, benchShape, cableHandleShape, dipBarShape, dumbbellShape, floorShape, HELD_EQUIPMENT, placeFixed, type EquipmentShape } from '../../lib/equipment';
import type { Part } from '../../schema';
import { partPieces } from './geometry';
import { createPartMaterial, stylePartMaterial, type PartMaterial, type PartStyle } from './materials';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { damp } from '../../lib/math';
import { gripPoint, type Grip } from './grip';

const X = new Vector3(1, 0, 0);
const _a = new Vector3();
const _b = new Vector3();
const _f = new Vector3();
const _f2 = new Vector3();
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();
const _m = new Matrix4();
const _q = new Quaternion();

/** See-through free-standing pieces (the body reads through them). */
const OPACITY: Partial<Record<EquipmentSpec['kind'], number>> = { bench: 0.6, 'parallel-bars': 0.6, floor: 0.25 };

function shapeOf(spec: EquipmentSpec): EquipmentShape {
  switch (spec.kind) {
    case 'barbell':
      return barbellShape();
    case 'dumbbell':
      return dumbbellShape();
    case 'cable-handle':
      return cableHandleShape();
    case 'bench':
      return benchShape(spec.incline ?? 0);
    case 'parallel-bars':
      return dipBarShape();
    case 'floor':
      return floorShape();
  }
}

interface Piece {
  /** Placement: between the palms, one palm, or free-standing (`side` picks a dip bar). */
  at: 'hands' | 'l' | 'r' | 'fixed';
  side: number;
  spec: EquipmentSpec;
  geometry: BufferGeometry;
  opacity: number;
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

export function Equipment({
  specs,
  held,
  grips,
  style,
}: {
  specs: readonly EquipmentSpec[];
  /** Held pieces (inside the root group) or free-standing ones. */
  held: boolean;
  /** The palms' grip points (`hand.l`, `hand.r` + offset), when the rig has them. */
  grips: { l: Grip | null; r: Grip | null };
  /** The equipment's neutral look. */
  style: PartStyle;
}) {
  const runtime = useRuntime();
  const pieces = useMemo(() => {
    const out: Piece[] = [];
    for (const spec of specs) {
      const isHeld = HELD_EQUIPMENT.includes(spec.kind);
      if (isHeld !== held) continue;
      const geometry = oneGeometry(shapeOf(spec));
      const opacity = OPACITY[spec.kind] ?? 1;
      if (!isHeld) {
        out.push({ at: 'fixed', side: 0, spec, geometry, opacity });
        if (spec.kind === 'parallel-bars') out.push({ at: 'fixed', side: 1, spec, geometry: geometry.clone(), opacity });
      } else if (spec.kind === 'barbell') out.push({ at: 'hands', side: 0, spec, geometry, opacity });
      else
        for (const side of ['l', 'r'] as const)
          out.push({ at: side, side: side === 'l' ? 0 : 1, spec, geometry: side === 'l' ? geometry : geometry.clone(), opacity });
    }
    return out;
  }, [specs, held]);
  useEffect(() => () => pieces.forEach((p) => p.geometry.dispose()), [pieces]);

  const materials = useMemo<PartMaterial[]>(() => pieces.map(() => createPartMaterial()), [pieces]);
  useEffect(() => {
    for (const m of materials) {
      stylePartMaterial(m, style);
      // Matte, no highlights, no rim.
      m.material.metalness = 0;
      m.material.roughness = 0.92;
      m.material.envMapIntensity = 0.25;
      m.material.emissive.setScalar(0);
      m.material.depthWrite = true;
    }
  }, [materials, style]);
  useEffect(() => () => materials.forEach((m) => m.material.dispose()), [materials]);

  const groups = useRef<(Group | null)[]>([]);
  const fade = useRef(0);
  const placedAt = useRef(-1);
  useFrame((state, delta) => {
    if (pieces.length === 0) return;
    // Nothing moved since the last placement: no work, no shadow update.
    if (fade.current === 1 && placedAt.current === runtime.bonesMoved) return;
    placedAt.current = runtime.bonesMoved;
    fade.current = damp(fade.current, 1, 6, Math.min(delta, MAX_DT));
    if (fade.current > 0.995) fade.current = 1;
    pieces.forEach((p, i) => {
      const { material } = materials[i]!;
      material.opacity = fade.current * p.opacity;
      const transparent = material.opacity < 0.999;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
    });
    const ex = runtime.exercise;
    pieces.forEach((p, i) => {
      const g = groups.current[i];
      if (!g) return;
      if (p.at === 'fixed') {
        if (!ex) {
          g.visible = false;
          return;
        }
        const palms = ex.palms ? ([ex.palms[0].toArray(), ex.palms[1].toArray()] as [[number, number, number], [number, number, number]]) : null;
        const at = placeFixed(p.spec, ex.trunk.toArray() as [number, number, number], palms, ex.floor, p.side);
        g.position.set(at[0], at[1], at[2]);
        g.rotation.set(0, ((p.spec.turn ?? 0) * Math.PI) / 180, 0);
        g.visible = true;
        return;
      }
      const { l, r } = grips;
      if (p.at === 'hands') {
        if (!l || !r) {
          g.visible = false;
          return;
        }
        gripPoint(l, _a, _f);
        gripPoint(r, _b, _f2);
        g.position.copy(_a).add(_b).multiplyScalar(0.5);
        // Palm to palm (the bar lies across both forearms in a pronated grip).
        _x.subVectors(_a, _b);
        g.quaternion.copy(_x.lengthSq() > 1e-8 ? _q.setFromUnitVectors(X, _x.normalize()) : _q.identity());
      } else {
        const grip = p.at === 'l' ? l : r;
        if (!grip) {
          g.visible = false;
          return;
        }
        gripPoint(grip, g.position, _f);
        // Across the forearm: side to side, or front to back for a neutral grip; the handle's ring toward the fingers.
        _x.set(p.spec.grip === 'neutral' ? 0 : 1, 0, p.spec.grip === 'neutral' ? 1 : 0);
        _x.addScaledVector(_f, -_x.dot(_f));
        if (_x.lengthSq() < 1e-6) _x.set(0, 1, 0).addScaledVector(_f, -_f.y);
        _x.normalize();
        _y.copy(_f).negate();
        _z.crossVectors(_x, _y);
        g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
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
          <mesh geometry={p.geometry} material={materials[i]!.material} raycast={() => {}} dispose={null} />
        </group>
      ))}
    </>
  );
}
