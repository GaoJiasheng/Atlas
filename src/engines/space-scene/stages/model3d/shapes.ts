/**
 * Part shapes: pieces + rest transform for primitive parts, label anchors,
 * and the overall bounds (ground, shadow camera, label budget).
 */
import { Quaternion, Vector3 } from 'three';
import type { Part } from '../../schema';
import { explodedPosition } from '../../lib/explode';
import { mainBounds, partBounds, primitiveScale, tubeMidpoint } from '../../lib/parts';
import { apply3, eulerDeg } from '../../lib/xform';
import type { Vec3 } from '../../lib/math';
import { eachPieces, isClosedPrimitive, partPieces } from './geometry';
import { partPrimitives } from '../../lib/parts';
import { restFan } from '../../lib/wing';
import { latheArcStart, latheProfileClosed } from '../../lib/shaped';
import type { PartShape } from './PartNode';

/**
 * `each`: an `each` animation targets the part, so its copies are drawn
 * instanced and move one by one; `bend`: a try-it bend bends it along this
 * axis (0 = X, 2 = Z), so its main primitive is cut into slabs along it.
 */
export function primitiveShape(part: Part, each = false, bend?: 0 | 2): PartShape | null {
  const p = part.primitive;
  if (!p) return null;
  const pieces = each ? eachPieces(part) : partPieces(part, bend);
  const b = partBounds(part)!;
  const radius = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2;
  return {
    pieces,
    position: [p.at[0], p.at[1], p.at[2]],
    quaternion: new Quaternion(),
    scale: new Vector3(1, 1, 1),
    radius,
    closed: isClosedPrimitive(p),
    // Planes, and open shells turned only part of the way (half a bulb's glass): their inside shows.
    twoSided: partPrimitives(part).some((q) => q.kind === 'plane' || (q.kind === 'lathe' && q.arc !== undefined && !latheProfileClosed(q.profile))),
    restFan: partRestFan(part),
  };
}

/** Rest fan of a part's (first) folding wing; 1 without one. */
export function partRestFan(part: Part): number {
  const wing = partPrimitives(part).find((q) => q.kind === 'wing' && q.fold);
  return wing && wing.kind === 'wing' ? restFan(wing) : 1;
}

/** Label anchor of a part relative to its centre: the centre of its bounds. */
export function anchorOffset(part: Part): Vec3 {
  const b = part.primitive ? partBounds(part) : null;
  if (!b || !part.primitive) return [0, 0, 0];
  const at = part.primitive.at;
  return [(b.min[0] + b.max[0]) / 2 - at[0], (b.min[1] + b.max[1]) / 2 - at[1], (b.min[2] + b.max[2]) / 2 - at[2]];
}

/**
 * Where a part's leader label points, relative to its centre: the bounds
 * centre, except a single tube (a pipe run), whose bounds centre is often in
 * mid air: the point halfway along its path. A part with `extra` points at
 * its main primitive.
 */
export function anchorPoint(part: Part): Vec3 {
  const p = part.primitive;
  // An annular cutaway's bounds centre lies in its hole. Put its leader on
  // the actual section face instead; keep bounds/occlusion extents intact.
  if (p?.kind === 'lathe' && p.arc !== undefined && !part.repeat && latheProfileClosed(p.profile)) {
    const y = (Math.min(...p.profile.map((v) => v[1])) + Math.max(...p.profile.map((v) => v[1]))) / 2;
    const crossings: number[] = [];
    for (let i = 0; i < p.profile.length; i++) {
      const a = p.profile[i]!, b = p.profile[(i + 1) % p.profile.length]!;
      // Half-open scanline intersections count a vertex once, not twice.
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
        crossings.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    crossings.sort((a, b) => a - b);
    // Only one unambiguous annular interval; solid profiles touch the axis.
    if (crossings.length === 2 && crossings[0]! > 1e-9 && crossings[1]! - crossings[0]! > 1e-9) {
      const r = (crossings[0]! + crossings[1]!) / 2, phi = latheArcStart(p.arc), s = primitiveScale(p);
      const point: Vec3 = [r * Math.sin(phi) * s[0], y * s[1], r * Math.cos(phi) * s[2]];
      if (p.mirror) point[p.mirror === 'x' ? 0 : p.mirror === 'y' ? 1 : 2] *= -1;
      return apply3(eulerDeg(p.rotation), point);
    }
  }
  if (p?.kind === 'tube' && !part.repeat) {
    const m = tubeMidpoint(p);
    const k = primitiveScale(p);
    return apply3(eulerDeg(p.rotation), [m[0] * k[0], m[1] * k[1], m[2] * k[2]]);
  }
  if (!p || !part.extra) return anchorOffset(part);
  const b = mainBounds(part)!;
  return [(b.min[0] + b.max[0]) / 2 - p.at[0], (b.min[1] + b.max[1]) / 2 - p.at[1], (b.min[2] + b.max[2]) / 2 - p.at[2]];
}

/** Half extents of a part's bounds (scene units; zero without a primitive): its on-screen box for the leader labels. */
export function anchorHalf(part: Part): Vec3 {
  const b = part.primitive ? partBounds(part) : null;
  if (!b) return [0, 0, 0];
  return [(b.max[0] - b.min[0]) / 2, (b.max[1] - b.min[1]) / 2, (b.max[2] - b.min[2]) / 2];
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
  /** The camera's fit sphere: the non-context parts (all parts when every part is context). */
  fit: { center: Vec3; radius: number; half: Vec3 };
  /** Assembled bounds of all parts. */
  min: Vec3;
  max: Vec3;
}

/**
 * Floor, footprint and the assembled model's centre and radius (all parts),
 * plus the camera's fit sphere (minimum distance, cover camera), which counts
 * only non-context parts when there are any (docs/16 M12: a body outline
 * around a chest must not push the camera back).
 */
export function stageBounds(parts: readonly Part[], shapes: ReadonlyMap<string, PartShape>): StageBounds {
  const floor: [number, number] = [Infinity, Infinity];
  let radius = 0.5;
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  const subject = parts.some((p) => !p.context && shapes.has(p.id));
  const fmin: Vec3 = [Infinity, Infinity, Infinity];
  const fmax: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const part of parts) {
    const shape = shapes.get(part.id);
    if (!shape) continue;
    const rest = partBounds(part) ?? shape.box ?? null;
    const r = shape.radius;
    for (const amount of [0, 1] as const) {
      const c = part.context ? shape.position : explodedPosition(shape.position, part.explode, amount);
      const dy = c[1] - shape.position[1];
      const low = rest ? rest.min[1] + dy : c[1] - r;
      floor[amount] = Math.min(floor[amount], low);
      radius = Math.max(radius, Math.hypot(c[0], c[2]) + r);
    }
    for (let i = 0; i < 3; i++) {
      const lo = rest ? rest.min[i]! : shape.position[i]! - r;
      const hi = rest ? rest.max[i]! : shape.position[i]! + r;
      min[i] = Math.min(min[i]!, lo);
      max[i] = Math.max(max[i]!, hi);
      if (subject && part.context) continue;
      fmin[i] = Math.min(fmin[i]!, lo);
      fmax[i] = Math.max(fmax[i]!, hi);
    }
  }
  const ok = Number.isFinite(min[0]);
  const fitOk = Number.isFinite(fmin[0]);
  return {
    floor: ok ? [floor[0] - 0.002, Math.min(floor[0], floor[1]) - 0.002] : [-1, -1],
    radius,
    center: ok ? [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2] : [0, 0, 0],
    modelRadius: ok ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 : 1,
    fit: fitOk
      ? { center: [(fmin[0] + fmax[0]) / 2, (fmin[1] + fmax[1]) / 2, (fmin[2] + fmax[2]) / 2], radius: Math.hypot(fmax[0] - fmin[0], fmax[1] - fmin[1], fmax[2] - fmin[2]) / 2, half: [(fmax[0] - fmin[0]) / 2, (fmax[1] - fmin[1]) / 2, (fmax[2] - fmin[2]) / 2] }
      : { center: [0, 0, 0], radius: 1, half: [1, 1, 1] },
    min: ok ? min : [-1, -1, -1],
    max: ok ? max : [1, 1, 1],
  };
}
