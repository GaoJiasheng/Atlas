/**
 * `sweep` primitive maths (pure, unit-tested): a lofted tube along a
 * centripetal Catmull-Rom curve through `path` (relative to `at`, in the
 * primitive's own frame), sampled by arc length into stations. Each station
 * has a frame (T tangent, N "up", B = T × N): N is the frame's `up`
 * (default +Y) made perpendicular to T, carried over from the previous
 * station where T runs along `up` (no twist jumps). The section is an ellipse
 * of half-width r along B and half-height r × `flat` along N (`flat`
 * squashes the section along `up`); a `u` section leaves an opening of
 * `open`° centred on −N (a U open on the side away from `up`). `radius` is one
 * number or one per path point (smoothly interpolated); `rings` cut a groove
 * every `every` scene units (segment joints of an antenna, a trachea's
 * spiral, an abdomen's segments) `depth` × r deep.
 */
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Primitive } from '../schema';
import type { Vec3 } from './math';

export type Sweep = Extract<Primitive, { kind: 'sweep' }>;

export interface SweepSection {
  /** Half-height along N as a fraction of the half-width (1 = round). */
  flat: number;
  /** Opening angle (radians) of a U section, centred on −N; 0 = closed ring. */
  open: number;
}

/** Default U opening (degrees) and wall (fraction of the radius) of a `u` section. */
export const SWEEP_U_OPEN = 120;
export const SWEEP_U_WALL = 0.14;
/** Default `flat` ratio of `section: "flat"`. */
export const SWEEP_FLAT = 0.5;
/** Width of a ring groove as a fraction of the ring spacing (each side of the joint). */
export const RING_GROOVE = 0.16;

export function sweepSection(p: Pick<Sweep, 'section'>): SweepSection {
  const s = p.section;
  if (s === 'u') return { flat: 1, open: (SWEEP_U_OPEN * Math.PI) / 180 };
  if (s === 'flat') return { flat: SWEEP_FLAT, open: 0 };
  if (typeof s === 'object') {
    if ('u' in s) return { flat: s.flat ?? 1, open: (s.u * Math.PI) / 180 };
    return { flat: s.flat, open: 0 };
  }
  return { flat: 1, open: 0 };
}

/** Wall thickness: `hollow`, else a U section's default wall; 0 = solid. */
export function sweepWall(p: Pick<Sweep, 'hollow' | 'section' | 'radius'>): number {
  if (p.hollow !== undefined) return p.hollow;
  if (sweepSection(p).open > 0) return SWEEP_U_WALL * Math.min(...radii(p.radius));
  return 0;
}

const radii = (r: Sweep['radius']): number[] => (typeof r === 'number' ? [r] : r);

/** Whether the path is a closed loop (`closed`, or the last point repeats the first). */
export function sweepLoops(p: Pick<Sweep, 'path' | 'closed'>): boolean {
  if (p.closed) return true;
  const a = p.path[0]!;
  const b = p.path[p.path.length - 1]!;
  return p.path.length > 2 && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1e-9;
}

export function sweepCurve(p: Pick<Sweep, 'path' | 'closed'>): CatmullRomCurve3 {
  const loop = sweepLoops(p);
  const pts = p.path.map((q) => new Vector3(q[0], q[1], q[2]));
  if (loop && !p.closed) pts.pop();
  return new CatmullRomCurve3(pts, loop, 'centripetal');
}

/** Radius at curve parameter t (0..1, Catmull-Rom parameter: path point i at i / (n − 1)), before rings. */
export function sweepRadiusAt(p: Pick<Sweep, 'radius' | 'path' | 'closed'>, t: number): number {
  const rs = radii(p.radius);
  if (rs.length === 1) return rs[0]!;
  const loop = sweepLoops(p);
  const list = loop && !p.closed ? rs.slice(0, -1) : rs;
  const n = list.length;
  const x = loop ? t * n : t * (n - 1);
  const i = Math.floor(x);
  const f = x - i;
  const at = (k: number) => (loop ? list[((k % n) + n) % n]! : list[Math.min(n - 1, Math.max(0, k))]!);
  // Catmull-Rom on the radii (uniform), clamped so a profile never dips below its smaller neighbour by much.
  const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
  const f2 = f * f, f3 = f2 * f;
  const v = 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
  const lo = Math.min(p1, p2) * 0.85;
  return Math.max(lo, Math.max(1e-5, v));
}

/** Groove factor (0..1) at arc length `s` of a sweep with rings every `every`. */
export function ringGroove(s: number, every: number): number {
  const f = ((s / every) % 1 + 1) % 1;
  const d = Math.min(f, 1 - f) / RING_GROOVE;
  return d >= 1 ? 0 : (1 - d) * (1 - d);
}

export interface SweepStation {
  /** Centre, tangent, up (N) and side (B) in the primitive's frame. */
  p: Vec3;
  t: Vec3;
  n: Vec3;
  b: Vec3;
  /** Section half-width (rings applied). */
  r: number;
  /** d r / d s (for the surface normal). */
  dr: number;
  /** Arc length from the start. */
  s: number;
}

export interface SweepSamples {
  stations: SweepStation[];
  length: number;
  loop: boolean;
}

/** Stations along the sweep: `segments` (default from the length, the radius and the rings) + 1, or `segments` for a loop. */
export function sweepStations(p: Sweep): SweepSamples {
  const curve = sweepCurve(p);
  const loop = sweepLoops(p);
  const length = curve.getLength();
  const rmax = Math.max(...radii(p.radius));
  const ringSteps = p.rings ? Math.ceil(length / p.rings.every) * 10 : 0;
  const auto = Math.ceil(length / Math.max(rmax * 0.5, 1e-4));
  const segments = p.segments ?? Math.min(512, Math.max(16, auto, ringSteps));
  const count = loop ? segments : segments + 1;
  const up = new Vector3(...(p.up ?? [0, 1, 0])).normalize();
  const stations: SweepStation[] = [];
  let prevN: Vector3 | null = null;
  const T = new Vector3();
  const N = new Vector3();
  const B = new Vector3();
  const U = new Vector3();
  const raw: { u: number; r: number }[] = [];
  for (let k = 0; k < count; k++) {
    const u = k / segments;
    const t = curve.getUtoTmapping(u, 0);
    const pt = curve.getPoint(t);
    curve.getTangent(t, T).normalize();
    // N: `up` made perpendicular to T where the curve runs across `up`; the previous N carried
    // over (parallel transport) where it runs along it, blended in between, never flipping.
    U.copy(up).addScaledVector(T, -up.dot(T));
    const upLen = U.length();
    if (prevN) {
      N.copy(prevN).addScaledVector(T, -prevN.dot(T));
      if (N.lengthSq() < 1e-12) N.copy(prevN);
      N.normalize();
      if (upLen > 1e-6) {
        U.divideScalar(upLen);
        if (U.dot(N) < 0) U.negate();
        const w = Math.min(1, Math.max(0, (0.97 - Math.abs(T.dot(up))) / 0.27));
        N.multiplyScalar(1 - w).addScaledVector(U, w).normalize();
      }
    } else if (upLen > 1e-6) N.copy(U).divideScalar(upLen);
    else N.set(1, 0, 0).addScaledVector(T, -T.x).normalize();
    prevN = (prevN ?? new Vector3()).copy(N);
    B.crossVectors(T, N).normalize();
    const s = u * length;
    let r = sweepRadiusAt(p, t);
    if (p.rings) r *= 1 - p.rings.depth * ringGroove(s, p.rings.every);
    raw.push({ u, r });
    stations.push({ p: [pt.x, pt.y, pt.z], t: [T.x, T.y, T.z], n: [N.x, N.y, N.z], b: [B.x, B.y, B.z], r, dr: 0, s });
  }
  // Radius slope for the normals (central differences).
  for (let k = 0; k < count; k++) {
    const a = loop ? raw[(k - 1 + count) % count]! : raw[Math.max(0, k - 1)]!;
    const b = loop ? raw[(k + 1) % count]! : raw[Math.min(count - 1, k + 1)]!;
    let du = b.u - a.u;
    if (loop && du <= 0) du += 1;
    stations[k]!.dr = du > 0 ? (b.r - a.r) / (du * length) : 0;
  }
  return { stations, length, loop };
}

/** Bounds of a sweep in its own frame (before `scale`, `mirror`, `rotation`): stations ± their largest half-extent. */
export function sweepBox(p: Sweep): { min: Vec3; max: Vec3 } {
  const { stations } = sweepStations(p);
  const { flat } = sweepSection(p);
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const st of stations) {
    // Extent of the ellipse along each axis: r·|B_i| and r·flat·|N_i| combined.
    for (let i = 0; i < 3; i++) {
      const e = Math.hypot(st.r * st.b[i]!, st.r * flat * st.n[i]!);
      min[i] = Math.min(min[i]!, st.p[i]! - e);
      max[i] = Math.max(max[i]!, st.p[i]! + e);
    }
  }
  if (!sweepLoops(p) && p.caps === 'round' && sweepWall(p) === 0) {
    // A round cap stays within one radius of its end centre.
    for (const st of [stations[0]!, stations[stations.length - 1]!]) {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i]!, st.p[i]! - st.r);
        max[i] = Math.max(max[i]!, st.p[i]! + st.r);
      }
    }
  }
  return { min, max };
}
