/**
 * Tiny 3×3 rotation helpers on plain arrays (row-major), so part bounds,
 * repeat layouts and the elevation drawing run in node tests without three.js.
 * Euler order is XYZ like three.js (`R = Rx · Ry · Rz`).
 */
import { DEG2RAD, normalize3, type Vec3 } from './math';

export type Mat3 = [number, number, number, number, number, number, number, number, number];

export const IDENTITY3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function mul3(a: Mat3, b: Mat3): Mat3 {
  const out = [0, 0, 0, 0, 0, 0, 0, 0, 0] as Mat3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) out[r * 3 + c] = a[r * 3]! * b[c]! + a[r * 3 + 1]! * b[3 + c]! + a[r * 3 + 2]! * b[6 + c]!;
  return out;
}

export function apply3(m: Mat3, v: readonly number[]): Vec3 {
  const x = v[0] ?? 0;
  const y = v[1] ?? 0;
  const z = v[2] ?? 0;
  return [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
}

/** Rotation from XYZ Euler angles in degrees (three.js order 'XYZ'). */
export function eulerDeg(rotation: readonly number[] | undefined): Mat3 {
  if (!rotation) return IDENTITY3;
  const [x = 0, y = 0, z = 0] = rotation.map((d) => d * DEG2RAD);
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  const rx: Mat3 = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const ry: Mat3 = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const rz: Mat3 = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  return mul3(mul3(rx, ry), rz);
}

/** Rotation of `angle` radians about a (not necessarily unit) axis. */
export function axisAngle(axis: readonly number[], angle: number): Mat3 {
  const [x, y, z] = normalize3(axis);
  const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c,
  ];
}

/** A unit vector perpendicular to `axis` (stable choice). */
export function perpendicular(axis: readonly number[]): Vec3 {
  const [x, y, z] = normalize3(axis);
  // Cross with the world axis least aligned with `axis`.
  const ref: Vec3 = Math.abs(y) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  return normalize3([y * ref[2] - z * ref[1], z * ref[0] - x * ref[2], x * ref[1] - y * ref[0]]);
}
