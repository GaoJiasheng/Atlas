/**
 * Magnet field states (docs/22 §4.2 items 3–4, §4.4 M1 / M3; pure,
 * unit-tested): for each field state of `magnet.fields` (the magnets in it,
 * the controls at their defaults ⊕ its `when`), worked out once when first
 * shown and cached for the loaded data:
 *
 * - field lines: a 2-D solve in the state's plane (the poles projected onto
 *   it, the 3-D 1/r² law in the plane). From each north pole, lines × moment
 *   seeds on a small circle, evenly spaced and symmetric about the magnet's
 *   axis; each is traced along B (RK4, a fixed step) until it reaches a south
 *   pole, leaves the plane's rectangle or meets a null point. Polylines in
 *   scene coordinates, ≤ 120 points, ≤ 16 lines a state.
 * - iron filings: on a `filings` card (the part's XZ plane), candidate needles
 *   on a jittered grid (twice the needle budget, one fixed seed, so a needle
 *   turns in place when the state changes) are kept with probability
 *   (|B| ÷ saturate)^exponent (1 at the poles, thinning away from them) and
 *   turned along the field's part in the card; where the field stands up
 *   out of the card (over a pole) a needle is drawn shorter. With no state
 *   (no magnet under the card) they lie sprinkled at random.
 */
import type { FieldPlane, MagnetData, SimData } from '../../sim-schema';
import { simDefaults } from './controls';
import { fieldAt, fieldMagnets, magnetCharges, magnetMoment, MAX_FIELD_LINES } from './magnet';
import type { Vec3 } from '../math';

export interface FieldLine {
  id: string;
  /** Scene coordinates, from a north pole. */
  path: Vec3[];
}

/** One filing in its card's frame: centre (x, z), turn about the card's +Y from its +X (radians), length scale. */
export interface Filing {
  x: number;
  z: number;
  angle: number;
  scale: number;
}

/** A `filings` card: the primitive's placement and parameters. */
export interface FilingsCard {
  at: readonly number[];
  /** Euler XYZ, degrees. */
  rotation?: readonly number[] | undefined;
  size: readonly [number, number];
  count: number;
  saturate: number;
  exponent: number;
}

interface Pole {
  at: Vec3;
  q: number;
}

/** Points a traced line keeps at most. */
export const MAX_LINE_POINTS = 120;
/** Steps across the plane's smaller side. */
const STEPS_ACROSS = 400;

/** Deterministic PRNG (one seed: every load and screenshot the same). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const norm = (v: readonly number[]): Vec3 => {
  const n = Math.hypot(v[0]!, v[1]!, v[2]!) || 1;
  return [v[0]! / n, v[1]! / n, v[2]! / n];
};
const dot = (a: readonly number[], b: readonly number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
const cross = (a: readonly number[], b: readonly number[]): Vec3 => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];

/** In-plane axes of a field plane: u (+X unless the plane faces X), v = normal × u. */
export function planeAxes(plane: FieldPlane): { n: Vec3; u: Vec3; v: Vec3 } {
  const n = norm(plane.normal ?? [0, 1, 0]);
  const ref: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
  const k = dot(ref, n);
  const u = norm([ref[0] - k * n[0], ref[1] - k * n[1], ref[2] - k * n[2]]);
  return { n, u, v: cross(n, u) };
}

/** The values a field state is worked out at: the controls' defaults ⊕ its `when`. */
export function stateValues(sim: SimData, state: string) {
  return { ...simDefaults(sim), ...(sim.magnet?.fields?.[state]?.when ?? {}) };
}

/** The poles (A·m) of a field state's magnets. */
export function statePoles(sim: SimData, state: string): Pole[] {
  const m = sim.magnet;
  if (!m) return [];
  const values = stateValues(sim, state);
  return fieldMagnets(m, state).flatMap((g) => magnetCharges(g, values));
}

/** 2-D field in the plane (poles already projected). */
function field2(poles: readonly { x: number; y: number; q: number }[], x: number, y: number): [number, number] {
  let bx = 0;
  let by = 0;
  for (const p of poles) {
    const dx = x - p.x;
    const dy = y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 1e-14) continue;
    const k = p.q / (d2 * Math.sqrt(d2));
    bx += k * dx;
    by += k * dy;
  }
  return [bx, by];
}

/**
 * Field lines of these poles in `plane`: from each start, `lines` seeds
 * round its north pole (projected), symmetric about the magnet's in-plane
 * axis (south → north).
 */
export function traceFieldLines(
  poles: readonly Pole[],
  starts: readonly { north: Vec3; south: Vec3; lines: number }[],
  plane: FieldPlane,
  prefix = 'line',
): FieldLine[] {
  const { u, v } = planeAxes(plane);
  const c = plane.center;
  const to2 = (p: readonly number[]) => {
    const r = [p[0]! - c[0], p[1]! - c[1], p[2]! - c[2]];
    return { x: dot(r, u), y: dot(r, v) };
  };
  const flat = poles.map((p) => ({ ...to2(p.at), q: p.q }));
  const [w, h] = plane.size;
  const step = Math.min(w, h) / STEPS_ACROSS;
  const maxSteps = Math.ceil((4 * (w + h)) / step);
  const inside = (x: number, y: number) => Math.abs(x) <= w / 2 && Math.abs(y) <= h / 2;
  const dir = (x: number, y: number): [number, number] | null => {
    const [bx, by] = field2(flat, x, y);
    const m = Math.hypot(bx, by);
    return m < 1e-12 ? null : [bx / m, by / m];
  };
  const out: FieldLine[] = [];
  for (const s of starts) {
    const n2 = to2(s.north);
    const s2 = to2(s.south);
    const axis = Math.atan2(n2.y - s2.y, n2.x - s2.x);
    const span = Math.hypot(n2.x - s2.x, n2.y - s2.y);
    const r0 = Math.max(step * 3, 0.06 * (span || Math.min(w, h) * 0.2));
    for (let k = 0; k < s.lines; k++) {
      const a = axis + ((k + 0.5) * 2 * Math.PI) / s.lines;
      let x = n2.x + r0 * Math.cos(a);
      let y = n2.y + r0 * Math.sin(a);
      if (!inside(x, y)) continue;
      const pts: [number, number][] = [[x, y]];
      for (let i = 0; i < maxSteps; i++) {
        const k1 = dir(x, y);
        if (!k1) break;
        const k2 = dir(x + (step / 2) * k1[0], y + (step / 2) * k1[1]) ?? k1;
        const k3 = dir(x + (step / 2) * k2[0], y + (step / 2) * k2[1]) ?? k2;
        const k4 = dir(x + step * k3[0], y + step * k3[1]) ?? k3;
        const nx = x + (step / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        const ny = y + (step / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        if (!inside(nx, ny)) {
          // End on the rectangle's edge.
          const t = Math.min(
            nx !== x ? ((Math.sign(nx - x) * w) / 2 - x) / (nx - x) : 1,
            ny !== y ? ((Math.sign(ny - y) * h) / 2 - y) / (ny - y) : 1,
          );
          pts.push([x + (nx - x) * Math.max(0, Math.min(1, t)), y + (ny - y) * Math.max(0, Math.min(1, t))]);
          break;
        }
        x = nx;
        y = ny;
        pts.push([x, y]);
        if (flat.some((p) => p.q < 0 && Math.hypot(x - p.x, y - p.y) < r0)) break;
        if (i > 4 && flat.some((p) => p.q > 0 && Math.hypot(x - p.x, y - p.y) < r0 * 0.9)) break;
      }
      if (pts.length < 3) continue;
      out.push({ id: `${prefix}-${out.length + 1}`, path: decimate(pts).map(([px, py]) => [c[0] + px * u[0] + py * v[0], c[1] + px * u[1] + py * v[1], c[2] + px * u[2] + py * v[2]]) });
    }
  }
  return out;
}

/** At most MAX_LINE_POINTS points, evenly spaced by arc length, the ends kept. */
function decimate(pts: readonly [number, number][]): [number, number][] {
  if (pts.length <= MAX_LINE_POINTS) return [...pts];
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  const gap = total / (MAX_LINE_POINTS - 1);
  const out: [number, number][] = [pts[0]!];
  let run = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    run += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
    if (run >= gap && out.length < MAX_LINE_POINTS - 1) {
      out.push(pts[i]!);
      run = 0;
    }
  }
  out.push(pts[pts.length - 1]!);
  return out;
}

/** Lines from each magnet's north pole: lines × moment (≥ 1 for a magnet that has a moment), ≤ 16 in all. */
export function linesPerMagnet(moments: readonly number[], lines: number): number[] {
  const want = moments.map((m) => (m > 1e-9 ? Math.max(1, Math.round(lines * m)) : 0));
  const total = want.reduce((a, b) => a + b, 0);
  if (total <= MAX_FIELD_LINES) return want;
  const k = MAX_FIELD_LINES / total;
  return want.map((n) => (n > 0 ? Math.max(1, Math.floor(n * k)) : 0));
}

const caches = new WeakMap<SimData, Map<string, unknown>>();
function cached<T>(sim: SimData, key: string, make: () => T): T {
  let c = caches.get(sim);
  if (!c) caches.set(sim, (c = new Map()));
  if (!c.has(key)) c.set(key, make());
  return c.get(key) as T;
}

/** A field state's field lines (traced once per loaded data, then cached). */
export function fieldLines(sim: SimData, state: string): FieldLine[] {
  return cached(sim, `lines|${state}`, () => {
    const m: MagnetData | undefined = sim.magnet;
    const f = m?.fields?.[state];
    const plane = f?.plane ?? m?.plane;
    if (!m || !f || !plane) return [];
    const values = stateValues(sim, state);
    const magnets = fieldMagnets(m, state);
    const counts = linesPerMagnet(
      magnets.map((g) => magnetMoment(g, values)),
      f.lines ?? m.lines,
    );
    const starts = magnets.map((g, i) => {
      const [n, s] = magnetCharges(g, values);
      return { north: n!.at, south: s!.at, lines: counts[i]! };
    });
    return traceFieldLines(statePoles(sim, state), starts, plane).slice(0, MAX_FIELD_LINES);
  });
}

/** Rotation matrix (row-major 3 × 3) of Euler XYZ degrees (three.js order). */
function eulerXYZ(deg: readonly number[] | undefined): number[] {
  const [x = 0, y = 0, z = 0] = (deg ?? [0, 0, 0]).map((d) => (d * Math.PI) / 180);
  const [a, b, c, d, e, f] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  const ae = a * e;
  const af = a * f;
  const be = b * e;
  const bf = b * f;
  return [c * e, -c * f, d, af + be * d, ae - bf * d, -b * c, bf - ae * d, be + af * d, a * c];
}

/** Filings on a card over these poles (null: no magnet under it, the filings lie at random). */
export function layFilings(poles: readonly Pole[] | null, card: FilingsCard, seed = 7): Filing[] {
  const rand = mulberry32(seed);
  const [w, d] = card.size;
  const candidates = card.count * 2;
  const nx = Math.max(1, Math.round(Math.sqrt((candidates * w) / d)));
  const nz = Math.max(1, Math.ceil(candidates / nx));
  const R = eulerXYZ(card.rotation);
  const kept: Filing[] = [];
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const x = ((i + rand()) / nx - 0.5) * w;
      const z = ((j + rand()) / nz - 0.5) * d;
      const keep = rand();
      const jitter = (rand() - 0.5) * 0.2;
      const size = 0.7 + rand() * 0.6;
      const loose = rand() * Math.PI;
      if (!poles) {
        if (keep < 0.5) kept.push({ x, z, angle: loose, scale: size });
        continue;
      }
      const p = [card.at[0]! + R[0]! * x + R[2]! * z, card.at[1]! + R[3]! * x + R[5]! * z, card.at[2]! + R[6]! * x + R[8]! * z];
      const b = fieldAt(poles, p);
      // Into the card's frame (Rᵀ · B).
      const bx = R[0]! * b[0] + R[3]! * b[1] + R[6]! * b[2];
      const bz = R[2]! * b[0] + R[5]! * b[1] + R[8]! * b[2];
      const total = Math.hypot(b[0], b[1], b[2]);
      const flat = Math.hypot(bx, bz);
      if (total < 1e-15 || keep >= Math.min(1, (total / card.saturate) ** card.exponent)) continue;
      kept.push({ x, z, angle: Math.atan2(-bz, bx) + jitter, scale: size * (0.35 + (0.65 * flat) / total) });
    }
  if (kept.length <= card.count) return kept;
  // Over budget: an even thinning across the card (never the far rows first).
  const out: Filing[] = [];
  for (let k = 0; k < card.count; k++) out.push(kept[Math.floor((k * kept.length) / card.count)]!);
  return out;
}

/** A filings part's layout for a field state (cached per part and state; '' = no state). */
export function ironFilings(sim: SimData | undefined, state: string, part: string, card: FilingsCard): Filing[] {
  if (!sim || !state || !sim.magnet?.fields?.[state]) return layFilings(null, card);
  return cached(sim, `filings|${part}|${state}`, () => layFilings(statePoles(sim, state), card));
}
