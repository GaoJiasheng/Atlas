/** Pure geometry for a Y-axis unit-height cylinder between two points. */
import type { Vec3 } from './math';

export interface SpanGeometry {
  from: Vec3;
  to: Vec3;
  centre: Vec3;
  quaternion: [number, number, number, number];
  /** Column-major cylinder-local → model matrix (radial scale stays 1). */
  matrix: number[];
  length: number;
  shown: boolean;
}

export function createSpanGeometry(): SpanGeometry {
  return { from: [0, 0, 0], to: [0, 0, 0], centre: [0, 0, 0], quaternion: [0, 0, 0, 1], matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], length: 0, shown: false };
}

/** Mutates the supplied output, so the rendered frame allocates nothing. */
export function spanGeometry(from: readonly number[], to: readonly number[], minLength: number, out = createSpanGeometry()): SpanGeometry {
  for (let i = 0; i < 3; i++) {
    out.from[i] = from[i]!;
    out.to[i] = to[i]!;
    out.centre[i] = (from[i]! + to[i]!) / 2;
  }
  const dx = to[0]! - from[0]!, dy = to[1]! - from[1]!, dz = to[2]! - from[2]!;
  const length = Math.hypot(dx, dy, dz);
  out.length = Number.isFinite(length) ? length : 0;
  out.shown = Number.isFinite(length) && length >= minLength && length > 0;
  const q = out.quaternion;
  q[0] = q[1] = q[2] = 0; q[3] = 1;
  if (out.shown) {
    const x = dx / length, y = dy / length, z = dz / length;
    // +Y × direction, with a stable half-turn for the antiparallel case.
    const horizontal = Math.hypot(x, z);
    if (y < 0 && horizontal === 0) { q[0] = 1; q[3] = 0; }
    else if (y < 0) {
      // Near −Y, computing 1+y loses the small horizontal component.
      const sinHalf = Math.sqrt((1 - y) / 2);
      q[0] = z / horizontal * sinHalf; q[2] = -x / horizontal * sinHalf; q[3] = horizontal / (2 * sinHalf);
    } else {
      const norm = Math.hypot(z, -x, 1 + y);
      q[0] = z / norm; q[2] = -x / norm; q[3] = (1 + y) / norm;
    }
  }
  const [x, y, z, w] = q;
  const xx = 2 * x * x, yy = 2 * y * y, zz = 2 * z * z, xy = 2 * x * y, xz = 2 * x * z, yz = 2 * y * z, wx = 2 * w * x, wy = 2 * w * y, wz = 2 * w * z;
  const m = out.matrix, s = out.shown ? length : 0;
  m[0] = 1 - yy - zz; m[1] = xy + wz; m[2] = xz - wy; m[3] = 0;
  m[4] = (xy - wz) * s; m[5] = (1 - xx - zz) * s; m[6] = (yz + wx) * s; m[7] = 0;
  m[8] = xz + wy; m[9] = yz - wx; m[10] = 1 - xx - yy; m[11] = 0;
  m[12] = out.centre[0]; m[13] = out.centre[1]; m[14] = out.centre[2]; m[15] = 1;
  return out;
}
