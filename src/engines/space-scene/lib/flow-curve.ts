/**
 * Flow paths (unit-tested). A flow's `path` polyline becomes a centripetal
 * Catmull-Rom curve; if the last point equals the first the curve is closed
 * (a loop). The curve is baked into evenly spaced (arc-length) samples that
 * the particle shader interpolates, so particles move at constant speed.
 */
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from './math';

/** Number of baked samples per flow (uniform array size in the shader). */
export const FLOW_SAMPLES = 64;

export function isClosedPath(path: readonly (readonly number[])[]): boolean {
  if (path.length < 3) return false;
  const a = path[0]!;
  const b = path[path.length - 1]!;
  return Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0), (a[2] ?? 0) - (b[2] ?? 0)) < 1e-6;
}

export function buildFlowCurve(path: readonly (readonly number[])[]): CatmullRomCurve3 {
  const closed = isClosedPath(path);
  const pts = (closed ? path.slice(0, -1) : path).map((p) => new Vector3(p[0] ?? 0, p[1] ?? 0, p[2] ?? 0));
  return new CatmullRomCurve3(pts, closed, 'centripetal');
}

/** Point at arc-length fraction `u` (0..1; wraps for closed curves). */
export function samplePath(path: readonly (readonly number[])[], u: number): Vec3 {
  const curve = buildFlowCurve(path);
  const k = curve.closed ? ((u % 1) + 1) % 1 : Math.min(1, Math.max(0, u));
  const p = curve.getPointAt(k);
  return [p.x, p.y, p.z];
}

export interface BakedFlow {
  /** `count` evenly spaced points, xyz interleaved. For closed curves the last equals the first. */
  points: Float32Array;
  count: number;
  /** Curve length in scene units. */
  length: number;
  closed: boolean;
}

export function bakeFlowPath(path: readonly (readonly number[])[], count = FLOW_SAMPLES): BakedFlow {
  const curve = buildFlowCurve(path);
  const spaced = curve.getSpacedPoints(count - 1);
  const points = new Float32Array(count * 3);
  spaced.forEach((p, i) => points.set([p.x, p.y, p.z], i * 3));
  return { points, count, length: curve.getLength(), closed: curve.closed };
}

/**
 * Fraction along the path of a particle with start `offset` (0..1) after
 * `time` seconds at `speed` units/s on a path of `length` units. Wraps to 0..1.
 */
export function flowParticleU(offset: number, time: number, speed: number, length: number): number {
  const u = offset + (length > 0 ? (time * speed) / length : 0);
  return ((u % 1) + 1) % 1;
}

/** Linear interpolation into baked samples (what the vertex shader does). */
export function sampleBaked(baked: BakedFlow, u: number): Vec3 {
  const x = Math.min(1, Math.max(0, u)) * (baked.count - 1);
  const i = Math.min(baked.count - 2, Math.floor(x));
  const f = x - i;
  const p = baked.points;
  return [0, 1, 2].map((c) => p[i * 3 + c]! + (p[(i + 1) * 3 + c]! - p[i * 3 + c]!) * f) as Vec3;
}
