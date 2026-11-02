/** Shared ink-arrow geometry; no renderer or optional overlay dependencies. */
import type { Vec3 } from '../../lib/math';

/** Default arrow length at 100 % and lift above the parts (scene units). */
export const ARROW_LENGTH = 0.04;
export const ARROW_LIFT = 0.02;
/** Below this |value| no arrows are drawn. */
export const ARROW_FLOOR = 0.5;
/** Shaft radius, head radius and head length as shares of the 100 % length. */
const SHAFT = 0.035;
const HEAD_R = 0.09;
export const HEAD_L = 0.28;
/** Sides of the shaft and head. */
const SIDES = 6;
/** Vertices of one arrow: shaft rings (2 × SIDES), head ring, tip, head base centre. */
export const ARROW_VERTS = 3 * SIDES + 2;

/** Arrow length (scene units) for a relative value (%): ∝ √|value|, at most 1.6 × the 100 % length. */
export function arrowLength(value: number, length: number): number {
  return Math.min(1.6, Math.sqrt(Math.abs(value) / 100)) * length;
}

export function arrowIndex(count = 2): number[] {
  const idx: number[] = [];
  for (let a = 0; a < count; a++) {
    const o = a * ARROW_VERTS;
    for (let k = 0; k < SIDES; k++) {
      const k1 = (k + 1) % SIDES;
      // Shaft side.
      idx.push(o + k, o + k1, o + SIDES + k, o + k1, o + SIDES + k1, o + SIDES + k);
      // Head side to the tip, and its base disc.
      idx.push(o + 2 * SIDES + k, o + 2 * SIDES + k1, o + 3 * SIDES);
      idx.push(o + 2 * SIDES + k1, o + 2 * SIDES + k, o + 3 * SIDES + 1);
    }
  }
  return idx;
}

/** Write one arrow from `s` along unit `d`, `len` long, into `pos` at vertex `o` (its thickness and head scale with `full`). */
export function writeArrow(pos: Float32Array, o: number, s: Vec3, d: Vec3, len: number, full: number): void {
  // Two unit vectors across the arrow.
  const ref: Vec3 = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const e1: Vec3 = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]];
  const n1 = Math.hypot(...e1) || 1;
  e1[0] /= n1;
  e1[1] /= n1;
  e1[2] /= n1;
  const e2: Vec3 = [d[1] * e1[2] - d[2] * e1[1], d[2] * e1[0] - d[0] * e1[2], d[0] * e1[1] - d[1] * e1[0]];
  const head = Math.min(HEAD_L * full, 0.6 * len);
  const shaft = len - head;
  const put = (i: number, x: number, r: number, th: number) => {
    const c = Math.cos(th) * r;
    const sn = Math.sin(th) * r;
    pos[(o + i) * 3] = s[0] + d[0] * x + e1[0] * c + e2[0] * sn;
    pos[(o + i) * 3 + 1] = s[1] + d[1] * x + e1[1] * c + e2[1] * sn;
    pos[(o + i) * 3 + 2] = s[2] + d[2] * x + e1[2] * c + e2[2] * sn;
  };
  for (let k = 0; k < SIDES; k++) {
    const th = (k / SIDES) * Math.PI * 2;
    put(k, 0, SHAFT * full, th);
    put(SIDES + k, shaft, SHAFT * full, th);
    put(2 * SIDES + k, shaft, HEAD_R * full, th);
  }
  put(3 * SIDES, len, 0, 0);
  put(3 * SIDES + 1, shaft, 0, 0);
}

