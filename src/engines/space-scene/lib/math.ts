/**
 * Small, dependency-free maths for the SpaceScene engine (unit-tested).
 * Vectors are plain `[x, y, z]` tuples so these helpers run in node tests
 * without three.js.
 */
export type Vec3 = [number, number, number];

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function length3(v: readonly number[]): number {
  return Math.hypot(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);
}

/** Unit vector, or `[0, 0, 0]` for a zero-length input. */
export function normalize3(v: readonly number[]): Vec3 {
  const len = length3(v);
  if (len < 1e-9) return [0, 0, 0];
  return [(v[0] ?? 0) / len, (v[1] ?? 0) / len, (v[2] ?? 0) / len];
}

export function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export function lerp3(a: readonly number[], b: readonly number[], k: number): Vec3 {
  return [lerp(a[0] ?? 0, b[0] ?? 0, k), lerp(a[1] ?? 0, b[1] ?? 0, k), lerp(a[2] ?? 0, b[2] ?? 0, k)];
}

/**
 * Frame-rate independent exponential smoothing ("damp"): move `current`
 * towards `target` with rate `lambda` (1/s) over `dt` seconds.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function easeInOutCubic(k: number): number {
  const x = clamp01(k);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export const DEG2RAD = Math.PI / 180;
