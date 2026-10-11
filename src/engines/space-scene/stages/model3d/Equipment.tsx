/**
 * Exercise-mode equipment on the stage (lib/equipment.ts): held pieces
 * (barbell, dumbbells, cable handles) follow the rig's `hand.l` / `hand.r`
 * bones every frame (inside the body's root group, so they turn with it);
 * free-standing pieces (bench, parallel bars) stand at their `at` in the
 * scene. One draw call per material of a piece, the parts' own material
 * (so cut, theme and lighting match), never picked or labelled.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Quaternion, Vector3, type BufferGeometry, type Group, type Object3D } from 'three';
import type { EquipmentSpec } from '../../../../content/schema/fitness';
import { barbellShape, benchShape, cableHandleShape, dumbbellShape, HELD_EQUIPMENT, parallelBarsShape, type EquipmentShape } from '../../lib/equipment';
import { partMaterialSlots } from '../../lib/parts';
import type { Part } from '../../schema';
import { partPieces } from './geometry';
import { createPartMaterial, stylePartMaterial, type PartStyle } from './materials';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { damp } from '../../lib/math';

const X = new Vector3(1, 0, 0);
const _a = new Vector3();
const _b = new Vector3();
const _d = new Vector3();
const _q = new Quaternion();

function shapeOf(spec: EquipmentSpec, floor: number): EquipmentShape {
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
      return parallelBarsShape(spec.width ?? 0.5, Math.max(0.3, (spec.at?.[1] ?? 1.1) - floor));
  }
}

interface Piece {
  /** Placement: a hand, between the hands, or fixed. */
  at: 'hands' | 'hand.l' | 'hand.r' | 'fixed';
  spec: EquipmentSpec;
  geometries: { geometry: BufferGeometry; slot: number }[];
  slots: { color: string; tint?: string }[];
}

export function Equipment({
  specs,
  held,
  hands,
  styleFor,
  floor,
}: {
  specs: readonly EquipmentSpec[];
  /** Held pieces (inside the root group) or free-standing ones. */
  held: boolean;
  /** The rig's hand bones (`hand.l`, `hand.r`), when it has them. */
  hands: { l: Object3D | null; r: Object3D | null };
  styleFor(slot: { color: string; tint?: string }): PartStyle;
  floor: number;
}) {
  const runtime = useRuntime();
  const pieces = useMemo(() => {
    const out: Piece[] = [];
    for (const spec of specs) {
      const isHeld = HELD_EQUIPMENT.includes(spec.kind);
      if (isHeld !== held) continue;
      const shape = shapeOf(spec, floor);
      const part = { primitive: shape.primitive, ...(shape.extra ? { extra: shape.extra } : {}) } as Pick<Part, 'primitive' | 'repeat'> & { extra?: Part['extra'] };
      const geometries = partPieces(part).map((p) => ({ geometry: p.geometry, slot: p.slot ?? 0 }));
      const slots = partMaterialSlots(part);
      if (!isHeld) out.push({ at: 'fixed', spec, geometries, slots });
      else if (spec.kind === 'barbell') out.push({ at: 'hands', spec, geometries, slots });
      else
        for (const side of ['hand.l', 'hand.r'] as const)
          out.push({ at: side, spec, geometries: side === 'hand.l' ? geometries : geometries.map((g) => ({ ...g, geometry: g.geometry.clone() })), slots });
    }
    return out;
  }, [specs, held, floor]);
  useEffect(() => () => pieces.forEach((p) => p.geometries.forEach((g) => g.geometry.dispose())), [pieces]);

  const materials = useMemo(() => pieces.map((p) => p.slots.map(() => createPartMaterial())), [pieces]);
  useEffect(() => {
    pieces.forEach((p, i) => p.slots.forEach((slot, j) => stylePartMaterial(materials[i]![j]!, styleFor(slot))));
  }, [pieces, materials, styleFor]);
  useEffect(() => () => materials.forEach((list) => list.forEach((m) => m.material.dispose())), [materials]);

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
    materials.forEach((list) =>
      list.forEach(({ material }) => {
        material.opacity = fade.current;
        const transparent = fade.current < 0.999;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.needsUpdate = true;
        }
      }),
    );
    pieces.forEach((p, i) => {
      const g = groups.current[i];
      if (!g) return;
      if (p.at === 'fixed') {
        const at = p.spec.at ?? [0, 0, 0];
        g.position.set(at[0], at[1], at[2]);
        g.rotation.set(0, ((p.spec.turn ?? 0) * Math.PI) / 180, 0);
        return;
      }
      const l = hands.l;
      const r = hands.r;
      const one = p.at === 'hand.r' ? r : p.at === 'hand.l' ? l : null;
      if (p.at === 'hands' && l && r) {
        l.getWorldPosition(_a);
        r.getWorldPosition(_b);
        g.position.copy(_a).add(_b).multiplyScalar(0.5);
        _d.subVectors(_b, _a);
        g.quaternion.copy(_d.lengthSq() > 1e-8 ? _q.setFromUnitVectors(X, _d.normalize()) : _q.identity());
      } else {
        const hand = one ?? l ?? r;
        if (!hand) {
          g.visible = false;
          return;
        }
        hand.getWorldPosition(g.position);
        // A neutral grip turns the handle front to back.
        g.quaternion.setFromAxisAngle(_d.set(0, 1, 0), p.spec.grip === 'neutral' ? Math.PI / 2 : 0);
      }
      g.visible = true;
    });
    runtime.shadowDirty = true;
    if (fade.current < 1) keepAnimating(state.invalidate);
  });

  return (
    <>
      {pieces.map((p, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)}>
          {p.geometries.map((g, j) => (
            <mesh key={j} geometry={g.geometry} material={materials[i]![g.slot]!.material} castShadow raycast={() => {}} dispose={null} />
          ))}
        </group>
      ))}
    </>
  );
}
