/**
 * Part shapes: pieces + rest transform for primitive parts, label anchors,
 * and the overall bounds (ground, shadow camera, label budget).
 */
import { Quaternion, Vector3 } from 'three';
import type { Part } from '../../schema';
import { explodedPosition } from '../../lib/explode';
import { partBounds } from '../../lib/parts';
import type { Vec3 } from '../../lib/math';
import { isClosedKind, primitivePieces } from './geometry';
import type { PartShape } from './PartNode';

export function primitiveShape(part: Part): PartShape | null {
  const p = part.primitive;
  if (!p) return null;
  const pieces = primitivePieces(part);
  const b = partBounds(part)!;
  const radius = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2;
  return {
    pieces,
    position: [p.at[0], p.at[1], p.at[2]],
    quaternion: new Quaternion(),
    scale: new Vector3(1, 1, 1),
    radius,
    closed: isClosedKind(p.kind),
    twoSided: p.kind === 'plane',
  };
}

/** Label anchor of a part relative to its centre: the centre of its bounds. */
export function anchorOffset(part: Part): Vec3 {
  const b = part.primitive ? partBounds(part) : null;
  if (!b || !part.primitive) return [0, 0, 0];
  const at = part.primitive.at;
  return [(b.min[0] + b.max[0]) / 2 - at[0], (b.min[1] + b.max[1]) / 2 - at[1], (b.min[2] + b.max[2]) / 2 - at[2]];
}

/** Leader-label clearance of a part: about the radius of its bounds (scene units). */
export function anchorRadius(part: Part): number {
  const b = part.primitive ? partBounds(part) : null;
  if (!b) return 0;
  return Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) * 0.375;
}

export interface StageBounds {
  /** Lowest point of the assembled model, and of the fully exploded one. */
  floor: [number, number];
  /** Footprint radius around the Y axis, assembled and fully exploded. */
  radius: number;
  /** Centre and bounding radius of the assembled model. */
  center: Vec3;
  modelRadius: number;
}

export function stageBounds(parts: readonly Part[], shapes: ReadonlyMap<string, PartShape>): StageBounds {
  const floor: [number, number] = [Infinity, Infinity];
  let radius = 0.5;
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const part of parts) {
    const shape = shapes.get(part.id);
    if (!shape) continue;
    const rest = partBounds(part);
    const r = shape.radius;
    for (const amount of [0, 1] as const) {
      const c = part.context ? shape.position : explodedPosition(shape.position, part.explode, amount);
      const dy = c[1] - shape.position[1];
      const low = rest ? rest.min[1] + dy : c[1] - r;
      floor[amount] = Math.min(floor[amount], low);
      radius = Math.max(radius, Math.hypot(c[0], c[2]) + r);
    }
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i]!, rest ? rest.min[i]! : shape.position[i]! - r);
      max[i] = Math.max(max[i]!, rest ? rest.max[i]! : shape.position[i]! + r);
    }
  }
  const ok = Number.isFinite(min[0]);
  return {
    floor: ok ? [floor[0] - 0.002, Math.min(floor[0], floor[1]) - 0.002] : [-1, -1],
    radius,
    center: ok ? [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2] : [0, 0, 0],
    modelRadius: ok ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 : 1,
  };
}
