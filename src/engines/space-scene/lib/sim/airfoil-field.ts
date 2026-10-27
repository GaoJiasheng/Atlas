/** Analytic field, collision-checked RK4 paths and physical-time sampling. */
import type { AirfoilData } from '../../airfoil-schema';
import type { SimValues } from '../../sim-schema';
import { C, R, Z_LE, solveAirfoil, type AirfoilMode } from './airfoil';
type XY = [number, number];
type Complex = XY;
const mul = ([a, b]: Complex, [c, d]: Complex): Complex => [
  a * c - b * d,
  a * d + b * c,
];
const div = ([a, b]: Complex, [c, d]: Complex): Complex => {
  const n = c * c + d * d;
  return [(a * c + b * d) / n, (b * c - a * d) / n];
};
const rot = (p: XY, a: number): XY => [
  p[0] * Math.cos(a) - p[1] * Math.sin(a),
  p[0] * Math.sin(a) + p[1] * Math.cos(a),
];
const arg = (angle: number) => (angle * Math.PI) / 180;
export const AIRFOIL_SEEDS = [
  -0.85, -0.65, -0.5, -0.38, -0.28, -0.18, -0.1, -0.04, 0.04, 0.1, 0.18, 0.28,
  0.38, 0.5, 0.65, 0.85,
] as const;
export interface AirfoilPath {
  id: string;
  xy: Float32Array;
  tau: Float32Array;
  status: 'complete' | 'boundary-stop' | 'stagnation' | 'budget-stop';
}
export interface PressureSample {
  theta: number;
  xy: XY;
  cp: number;
}
export interface AirfoilField {
  mode: AirfoilMode;
  outline: Float32Array;
  paths: AirfoilPath[];
  pressure: PressureSample[] | null;
  separation: null | { side: 'upper' | 'lower'; illustrative: true };
}
export function surfacePoint(theta: number, angle = 0): XY {
  const z: Complex = [-0.08 + R * Math.cos(theta), R * Math.sin(theta)],
    inv = div([1, 0], z);
  const b: XY = [(z[0] + inv[0] - Z_LE) / C, (z[1] + inv[1]) / C];
  const p = rot([b[0] - 0.25, b[1]], -arg(angle));
  return [0.25 + p[0], p[1]];
}
export function airfoilOutline(): Float32Array {
  return new Float32Array(
    Array.from({ length: 128 }, (_, j) =>
      surfacePoint((2 * Math.PI * j) / 128),
    ).flat(),
  );
}
export function boundaryVelocity(theta: number, angle: number) {
  return zetaVelocity(
    [-0.08 + R * Math.cos(theta), R * Math.sin(theta)],
    angle,
  );
}
function zetaVelocity(z: Complex, angle: number) {
  const a = arg(angle),
    ep: Complex = [Math.cos(a), Math.sin(a)],
    em: Complex = [ep[0], -ep[1]];
  let w: Complex;
  if (Math.hypot(z[0] - 1, z[1]) < 1e-6)
    w = [(ep[0] * Math.cos(a)) / R, (ep[1] * Math.cos(a)) / R];
  else {
    const q: Complex = [z[0] + 0.08, z[1]],
      q2 = mul(q, q),
      term = div([R * R * ep[0], R * R * ep[1]], q2),
      circ = div([0, 2 * R * Math.sin(a)], q),
      inv = div([1, 0], mul(z, z));
    w = div(mul(ep, [em[0] - term[0] + circ[0], em[1] - term[1] + circ[1]]), [
      1 - inv[0],
      -inv[1],
    ]);
  }
  return { uOverV: w[0], vOverV: -w[1], cp: 1 - w[0] ** 2 - w[1] ** 2 };
}
export function inverseAirfoil(
  x: number,
  y: number,
  angle: number,
): { status: 'outside'; zeta: Complex } | { status: 'inside' | 'invalid' } {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(angle))
    return { status: 'invalid' };
  const p = rot([x - 0.25, y], arg(angle)),
    z: Complex = [Z_LE + C * (0.25 + p[0]), C * p[1]],
    z2 = mul(z, z),
    re = z2[0] - 4,
    im = z2[1],
    len = Math.hypot(re, im);
  const root: Complex = [
    Math.sqrt(Math.max(0, (len + re) / 2)),
    (im < 0 ? -1 : 1) * Math.sqrt(Math.max(0, (len - re) / 2)),
  ];
  const roots: Complex[] = [
    [(z[0] + root[0]) / 2, (z[1] + root[1]) / 2],
    [(z[0] - root[0]) / 2, (z[1] - root[1]) / 2],
  ];
  const outside = roots.filter(
    (q) => Math.hypot(q[0] + 0.08, q[1]) >= R - 1e-10,
  );
  if (!outside.length) return { status: 'inside' };
  if (
    outside.length === 2 &&
    Math.hypot(
      outside[0]![0] - outside[1]![0],
      outside[0]![1] - outside[1]![1],
    ) > 1e-7
  )
    return { status: 'invalid' };
  return { status: 'outside', zeta: outside[0]! };
}
export function airfoilProbe(
  x: number,
  y: number,
  angle: number,
  mode: AirfoilMode = 'ideal-attached',
) {
  if (mode !== 'ideal-attached')
    return {
      status: 'unavailable' as const,
      uOverV: null,
      vOverV: null,
      cp: null,
    };
  const inv = inverseAirfoil(x, y, angle);
  return inv.status === 'outside'
    ? { status: inv.status, ...zetaVelocity(inv.zeta, angle) }
    : { status: inv.status, uOverV: null, vOverV: null, cp: null };
}
export function streamFunction(x: number, y: number, angle: number): number {
  const inv = inverseAirfoil(x, y, angle);
  if (inv.status !== 'outside') return NaN;
  const a = arg(angle),
    q: Complex = [inv.zeta[0] + 0.08, inv.zeta[1]],
    first = mul([Math.cos(a), -Math.sin(a)], q),
    second = div([R * R * Math.cos(a), R * R * Math.sin(a)], q);
  return (
    (first[1] +
      second[1] +
      2 * R * Math.sin(a) * Math.log(Math.hypot(...q) / R)) /
    C
  );
}
/** Polygon intersections test whole segments, in addition to analytic RK intermediates. */
function cross(a: XY, b: XY, c: XY) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
const boundsCache = new WeakMap<readonly XY[], number[]>();
function boundsOf(poly: readonly XY[]): number[] {
  let bounds = boundsCache.get(poly);
  if (!bounds) {
    bounds = [
      Math.min(...poly.map((p) => p[0])),
      Math.max(...poly.map((p) => p[0])),
      Math.min(...poly.map((p) => p[1])),
      Math.max(...poly.map((p) => p[1])),
    ];
    boundsCache.set(poly, bounds);
  }
  return bounds;
}
export function segmentClear(
  a: XY,
  b: XY,
  angle: number,
  outline?: readonly XY[],
): boolean {
  const poly =
    outline ??
    Array.from({ length: 128 }, (_, j) =>
      surfacePoint((2 * Math.PI * j) / 128, angle),
    );
  if (!nearBody(a, b, boundsOf(poly))) return true;
  if (inverseAirfoil(b[0], b[1], angle).status !== 'outside') return false;
  return edgesClear(a, b, poly);
}
const nearBody = (a: XY, b: XY, bounds: readonly number[]) =>
  !(
    Math.max(a[0], b[0]) < bounds[0]! ||
    Math.min(a[0], b[0]) > bounds[1]! ||
    Math.max(a[1], b[1]) < bounds[2]! ||
    Math.min(a[1], b[1]) > bounds[3]!
  );
function edgesClear(a: XY, b: XY, poly: readonly XY[]): boolean {
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i]!,
      d = poly[(i + 1) % poly.length]!;
    if (
      cross(a, b, c) * cross(a, b, d) < 0 &&
      cross(c, d, a) * cross(c, d, b) < 0
    )
      return false;
  }
  return true;
}
type Probe = ReturnType<typeof airfoilProbe>;
/** The unit flow direction of a probe, or null where the field has none (inside, invalid, stagnation). */
function unitOf(v: Probe): XY | null {
  if (v.status !== 'outside') return null;
  const n = Math.hypot(v.uOverV!, v.vOverV!);
  return n < 1e-5 ? null : [v.uOverV! / n, v.vOverV! / n];
}
/**
 * segmentClear(a, b) followed by the unit direction at b, with one field
 * evaluation at b instead of two (the same tests, in an order that cannot
 * change the result: both are pure).
 */
function clearUnit(a: XY, b: XY, angle: number, poly: XY[], bounds: readonly number[]): XY | null {
  const v = airfoilProbe(b[0], b[1], angle);
  if (v.status !== 'outside') return null;
  if (nearBody(a, b, bounds) && !edgesClear(a, b, poly)) return null;
  return unitOf(v);
}
function rk(p: XY, h: number, angle: number, poly: XY[], k1: XY): XY | null {
  const bounds = boundsOf(poly);
  const at = (k: XY, s: number): XY => [
    p[0] + h * k[0] * s,
    p[1] + h * k[1] * s,
  ];
  const p2 = at(k1, 0.5);
  const k2 = clearUnit(p, p2, angle, poly, bounds);
  if (!k2) return null;
  const p3 = at(k2, 0.5);
  const k3 = clearUnit(p, p3, angle, poly, bounds);
  if (!k3) return null;
  const p4 = at(k3, 1);
  const k4 = clearUnit(p, p4, angle, poly, bounds);
  if (!k4) return null;
  const end: XY = [
    p[0] + (h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])) / 6,
    p[1] + (h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])) / 6,
  ];
  return segmentClear(p, end, angle, poly) ? end : null;
}
export function sampleTau(path: AirfoilPath, time: number): XY {
  const t = path.tau,
    n = t.length;
  let lo = 0,
    hi = n - 1;
  const v = Math.max(t[0]!, Math.min(time, t[hi]!));
  while (hi - lo > 1) {
    const m = (hi + lo) >> 1;
    if (t[m]! < v) lo = m;
    else hi = m;
  }
  const f = hi === lo ? 0 : (v - t[lo]!) / (t[hi]! - t[lo]!);
  return [
    path.xy[lo * 2]! + (path.xy[hi * 2]! - path.xy[lo * 2]!) * f,
    path.xy[lo * 2 + 1]! + (path.xy[hi * 2 + 1]! - path.xy[lo * 2 + 1]!) * f,
  ];
}
/** Resampling is linear in tau; reject any segment that shortcuts through the body. */
export function* resampleTauSteps(
  path: AirfoilPath,
  angle: number,
  count = 1024,
): Generator<void, AirfoilPath> {
  if (path.status !== 'complete') return path;
  const end = path.tau[path.tau.length - 1]!,
    xy = new Float32Array(count * 2),
    tau = new Float32Array(count);
  const poly = Array.from({ length: 128 }, (_, j) =>
    surfacePoint((2 * Math.PI * j) / 128, angle),
  );
  let prev = sampleTau(path, 0);
  for (let j = 0; j < count; j++) {
    if (j % 128 === 0) yield;
    const time = (end * j) / (count - 1),
      p = sampleTau(path, time);
    if (j && !segmentClear(prev, p, angle, poly))
      return { ...path, status: 'boundary-stop' };
    xy.set(p, j * 2);
    tau[j] = time;
    prev = p;
  }
  return { ...path, xy, tau };
}
export function resampleTau(
  path: AirfoilPath,
  angle: number,
  count = 1024,
): AirfoilPath {
  const work = resampleTauSteps(path, angle, count);
  let r = work.next();
  while (!r.done) r = work.next();
  return r.value;
}
/** Generator permits browser computation in bounded tasks without changing the pure implementation. */
export function* traceAirfoil(
  angle: number,
  step = 0.008,
): Generator<void, AirfoilField> {
  const outline = airfoilOutline(),
    paths: AirfoilPath[] = [],
    poly = Array.from({ length: 128 }, (_, j) =>
      surfacePoint((2 * Math.PI * j) / 128, angle),
    );
  for (let seed = 0; seed < 16; seed++) {
    let p: XY = [-1.5, AIRFOIL_SEEDS[seed]!],
      time = 0,
      status: AirfoilPath['status'] = 'budget-stop';
    const xy: number[] = [...p],
      tau: number[] = [0];
    // The field at the path's current point: each step's end probe is the next step's start.
    let v0 = airfoilProbe(...p, angle);
    for (let n = 0; n < 2048; n++) {
      if (n % 32 === 0) yield;
      const k1 = unitOf(v0);
      if (!k1) {
        status = 'stagnation';
        break;
      }
      let next: XY | null = null,
        h = step;
      for (let retry = 0; retry <= 8; retry++, h /= 2) {
        next = rk(p, h, angle, poly, k1);
        if (next) break;
      }
      if (!next) {
        status = 'boundary-stop';
        break;
      }
      let f = 1;
      const dx = next[0] - p[0],
        dy = next[1] - p[1];
      if (next[0] > 3) f = Math.min(f, (3 - p[0]) / dx);
      if (next[1] > 1.5) f = Math.min(f, (1.5 - p[1]) / dy);
      if (next[1] < -1.5) f = Math.min(f, (-1.5 - p[1]) / dy);
      if (f < 1) next = [p[0] + f * dx, p[1] + f * dy];
      const v1 = airfoilProbe(...next, angle);
      if (v1.status !== 'outside') {
        status = 'boundary-stop';
        break;
      }
      time +=
        (Math.hypot(next[0] - p[0], next[1] - p[1]) *
          (1 / Math.hypot(v0.uOverV!, v0.vOverV!) +
            1 / Math.hypot(v1.uOverV!, v1.vOverV!))) /
        2;
      xy.push(...next);
      tau.push(time);
      p = next;
      v0 = v1;
      if (f < 1 || p[0] >= 3) {
        status = 'complete';
        break;
      }
    }
    const path = {
      id: `seed-${String(seed + 1).padStart(2, '0')}`,
      xy: new Float32Array(xy),
      tau: new Float32Array(tau),
      status,
    };
    // Resampling is sliced too: one path per task boundary.
    yield;
    paths.push(yield* resampleTauSteps(path, angle));
    yield;
  }
  return {
    mode: 'ideal-attached',
    outline,
    paths,
    pressure: pressureSamples(angle),
    separation: null,
  };
}
export function pressureSamples(angle: number, count = 64): PressureSample[] {
  return Array.from({ length: count }, (_, j) => {
    const theta = (2 * Math.PI * (j + 0.5)) / count;
    return {
      theta,
      xy: surfacePoint(theta, angle),
      cp: boundaryVelocity(theta, angle).cp,
    };
  });
}
export function emptyField(mode: AirfoilMode, angle: number): AirfoilField {
  return {
    mode,
    outline: airfoilOutline(),
    paths: [],
    pressure: null,
    separation:
      mode === 'separated-illustration'
        ? { side: angle < 0 ? 'lower' : 'upper', illustrative: true }
        : null,
  };
}
export function airfoilField(d: AirfoilData, values: SimValues): AirfoilField {
  const s = solveAirfoil(d, values);
  if (s.mode !== 'ideal-attached') return emptyField(s.mode, s.angle);
  const gen = traceAirfoil(s.angle);
  let result = gen.next();
  while (!result.done) result = gen.next();
  return result.value;
}
export function separationLines(angle: number): XY[][] {
  return [1, 1.5, 2].map((k) =>
    Array.from({ length: 65 }, (_, i) => {
      const s = i / 64,
        p = rot(
          [
            0.35 + 1.25 * s - 0.25,
            Math.sign(angle) * k * (0.1 + 0.2 * Math.sin((Math.PI * s) / 2)),
          ],
          -arg(angle),
        );
      return [0.25 + p[0], p[1]] as XY;
    }),
  );
}
