/** Deterministic straight-line projection, in metres; receiver readings are centimetres. */
import type { Vec3 } from "../math";

export type ShadowPlane = readonly [number, number, number, number];
export type ShadowLight = readonly [number, number, number, number];
export interface ReceiverFrame {
  centre: Vec3;
  normal: Vec3;
  u: Vec3;
  v: Vec3;
}
export interface ShadowBounds {
  min: [number, number];
  max: [number, number];
}
const dot = (a: readonly number[], b: readonly number[]) =>
  a.reduce((s, x, i) => s + x * b[i]!, 0);
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a: Vec3): Vec3 => {
  const n = Math.hypot(...a);
  return a.map((x) => x / n) as Vec3;
};

/** Column-major M = (plane · light) I − light planeᵀ. */
export function shadowMatrix(plane: ShadowPlane, light: ShadowLight): number[] {
  const d = dot(plane, light);
  return Array.from(
    { length: 16 },
    (_, k) => (k % 5 === 0 ? d : 0) - light[k % 4]! * plane[Math.floor(k / 4)]!,
  );
}
export function projectShadow(
  point: Vec3,
  plane: ShadowPlane,
  light: ShadowLight,
): Vec3 {
  const d = dot(plane, light),
    side =
      plane[0] * point[0] +
      plane[1] * point[1] +
      plane[2] * point[2] +
      plane[3];
  const w = d - light[3] * side;
  return [
    (d * point[0] - light[0] * side) / w,
    (d * point[1] - light[1] * side) / w,
    (d * point[2] - light[2] * side) / w,
  ];
}
/** Screen u runs across its width, v upward; ground v points north (−z). */
export function receiverFrame(centre: Vec3, normal: Vec3): ReceiverFrame {
  const n = unit(normal);
  const u =
    Math.abs(n[1]) > 0.99 ? ([1, 0, 0] as Vec3) : unit(cross([0, 1, 0], n));
  return { centre, normal: n, u, v: unit(cross(n, u)) };
}
export function receiverPlane(f: ReceiverFrame): ShadowPlane {
  return [...f.normal, -dot(f.normal, f.centre)];
}
export function receiverUV(point: Vec3, f: ReceiverFrame): [number, number] {
  const x = point[0] - f.centre[0],
    y = point[1] - f.centre[1],
    z = point[2] - f.centre[2];
  return [
    x * f.u[0] + y * f.u[1] + z * f.u[2],
    x * f.v[0] + y * f.v[1] + z * f.v[2],
  ];
}
export function receiverPoint(
  uv: readonly [number, number],
  f: ReceiverFrame,
  bias = 0,
): Vec3 {
  return f.centre.map(
    (x, i) => x + f.u[i]! * uv[0] + f.v[i]! * uv[1] + f.normal[i]! * bias,
  ) as Vec3;
}
export function shadowBounds(
  points: readonly Vec3[],
  frame: ReceiverFrame,
): ShadowBounds {
  const min: [number, number] = [Infinity, Infinity],
    max: [number, number] = [-Infinity, -Infinity];
  for (const p of points) {
    const x = p[0] - frame.centre[0],
      y = p[1] - frame.centre[1],
      z = p[2] - frame.centre[2];
    const u = (x * frame.u[0] + y * frame.u[1] + z * frame.u[2]) * 100,
      v = (x * frame.v[0] + y * frame.v[1] + z * frame.v[2]) * 100;
    min[0] = Math.min(min[0], u);
    min[1] = Math.min(min[1], v);
    max[0] = Math.max(max[0], u);
    max[1] = Math.max(max[1], v);
  }
  return { min, max };
}
export function inReceiver(
  uv: readonly [number, number],
  size?: readonly [number, number],
  radius?: number,
): boolean {
  return (
    (!size ||
      (Math.abs(uv[0]) <= size[0] / 2 && Math.abs(uv[1]) <= size[1] / 2)) &&
    (radius === undefined || Math.hypot(...uv) <= radius)
  );
}
export function inBeam(
  point: Vec3,
  source: Vec3,
  axis: Vec3,
  halfAngle: number,
): boolean {
  const d = point.map((x, i) => x - source[i]!) as Vec3;
  return (
    dot(d, unit(axis)) >=
    Math.hypot(...d) * Math.cos((halfAngle * Math.PI) / 180) - 1e-12
  );
}
/** A perpendicular screen receives a circular spot. General oblique planes are clipped by the cone itself. */
export function spotRadius(distance: number, halfAngle: number): number {
  return distance * Math.tan((halfAngle * Math.PI) / 180);
}
export function spotOpacity(distance: number): number {
  return Math.max(0.12, Math.min(0.45, 0.35 * (0.4 / distance) ** 2));
}
/** First intersection of a segment with a triangle; null for a miss. Möller–Trumbore, double-sided. */
export function segmentTriangle(
  start: Vec3,
  end: Vec3,
  a: Vec3,
  b: Vec3,
  c: Vec3,
): number | null {
  const sub = (p: Vec3, q: Vec3) => p.map((x, i) => x - q[i]!) as Vec3;
  const d = sub(end, start),
    e1 = sub(b, a),
    e2 = sub(c, a),
    h = cross(d, e2),
    det = dot(e1, h);
  if (Math.abs(det) < 1e-12) return null;
  const s = sub(start, a),
    u = dot(s, h) / det;
  if (u < 0 || u > 1) return null;
  const q = cross(s, e1),
    v = dot(d, q) / det,
    t = dot(e2, q) / det;
  return v < 0 || u + v > 1 || t < 0 || t > 1 ? null : t;
}
