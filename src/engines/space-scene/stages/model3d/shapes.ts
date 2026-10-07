/**
 * Part shapes: geometry + rest transform for primitive parts, and helpers
 * for the overall bounds (ground shadow).
 */
import { Euler, Quaternion, Vector3 } from 'three';
import type { Part } from '../../schema';
import { explodedPosition } from '../../lib/explode';
import { DEG2RAD } from '../../lib/math';
import { primitiveGeometry } from './geometry';
import type { PartShape } from './PartNode';

export function primitiveShape(part: Part): PartShape | null {
  const p = part.primitive;
  if (!p) return null;
  const geometry = primitiveGeometry(p);
  geometry.computeBoundingSphere();
  const [rx = 0, ry = 0, rz = 0] = p.rotation ?? [0, 0, 0];
  const quaternion = new Quaternion().setFromEuler(new Euler(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD, 'XYZ'));
  return {
    geometry,
    position: [p.at[0], p.at[1], p.at[2]],
    quaternion,
    scale: new Vector3(1, 1, 1),
    radius: geometry.boundingSphere?.radius ?? 0.5,
  };
}

/** Floor height and footprint radius covering all parts, assembled and fully exploded. */
export function stageBounds(parts: readonly Part[], shapes: ReadonlyMap<string, PartShape>): { floor: number; radius: number } {
  let floor = Infinity;
  let radius = 0.5;
  for (const part of parts) {
    const shape = shapes.get(part.id);
    if (!shape) continue;
    for (const amount of [0, 1]) {
      const [x, y, z] = explodedPosition(shape.position, part.explode, amount);
      floor = Math.min(floor, y - shape.radius);
      radius = Math.max(radius, Math.hypot(x, z) + shape.radius);
    }
  }
  return { floor: Number.isFinite(floor) ? floor - 0.04 : -1, radius };
}
