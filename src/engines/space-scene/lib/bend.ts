/**
 * A strip bent like a ruler (docs/37 §4.5, E-MT2; pure, unit-tested): on two
 * supports (`bridge`: the sag of its middle) or clamped at one end
 * (`cantilever`: the drop of its free end), always downward (−Y), keeping
 * its length.
 *
 * The shape is the textbook small-deflection one — a point load at the middle
 * of a simply supported span, f(a) = a (3L² − 4a²) ÷ L³ from a support, the
 * ends beyond the supports running straight along the tangent there; a point
 * load at the end of a cantilever, g(x) = x² (3L − x) ÷ 2L³ from the clamp —
 * but only its slopes are used: each slice of the strip turns by the angle of
 * that slope and the slices are laid end to end along the arc, so a large
 * bend never stretches the strip. The shape's size is solved (secant with a
 * bracket) so that the drawn sag / drop is exactly the value asked for. A
 * bridge strip stays on its supports (it slides in over them as it sags); a
 * cantilever is unmoved up to the clamp.
 *
 * Coordinates are the strip's own: `s` along its axis from its centre (the
 * part centre), `y` up. The stage writes the bent vertices straight into the
 * part's position and normal buffers (no new geometry).
 */
import type { Vec3 } from './math';

export const BEND_MODES = ['bridge', 'cantilever'] as const;
export type BendMode = (typeof BEND_MODES)[number];

/** The vertex attribute marking the vertices of the bent primitive (1; the part's `extra` pieces 0). */
export const BEND_ATTRIBUTE = 'atlasBend';
/** Slices the bent primitive is cut into along its axis (the stage builds it so). */
export const BEND_SLICES = 64;
/** Segments of the solved centre line. */
export const BEND_SEGMENTS = 64;
/** The largest bend drawn, as a share of the span / reach (a limp strip hanging down). */
export const BEND_MAX = 0.8;

export interface BendShape {
  mode: BendMode;
  /** The strip's length along its axis (m). */
  length: number;
  /** bridge: the supports' distance apart, about the strip's centre. */
  span?: number;
  /** cantilever: where the clamp lets go, along the axis from the centre; `reach` beyond it is free. */
  clamp?: number;
  reach?: number;
}

/** The index of a ±X / ±Z unit axis (0 or 2) and its sign; null for any other. */
export function bendAxisIndex(axis: readonly number[]): { index: 0 | 2; sign: 1 | -1 } | null {
  const [x = 0, y = 0, z = 0] = axis;
  if (Math.abs(y) > 1e-9) return null;
  if (Math.abs(Math.abs(x) - 1) < 1e-9 && Math.abs(z) < 1e-9) return { index: 0, sign: x > 0 ? 1 : -1 };
  if (Math.abs(Math.abs(z) - 1) < 1e-9 && Math.abs(x) < 1e-9) return { index: 2, sign: z > 0 ? 1 : -1 };
  return null;
}

/** The value a shape bends by: ≤ 0 straight, at most BEND_MAX of the span / reach. */
export function bendLimit(shape: BendShape, value: number): number {
  const room = shape.mode === 'bridge' ? (shape.span ?? 0) : (shape.reach ?? 0);
  return Math.min(Math.max(0, value), BEND_MAX * room);
}

/** dy/ds of the unit small-deflection shape (y up) at `s`. */
export function unitSlope(shape: BendShape, s: number): number {
  if (shape.mode === 'bridge') {
    const L = shape.span!;
    const a = Math.max(0, L / 2 - Math.abs(s));
    // f'(a) = (3L² − 12a²) ÷ L³; beyond a support (a = 0) the tangent there.
    return Math.sign(s) * (3 * L * L - 12 * a * a) / L ** 3;
  }
  const L = shape.reach!;
  const x = Math.min(L, s - shape.clamp!);
  return x <= 0 ? 0 : -(6 * L * x - 3 * x * x) / (2 * L ** 3);
}

/** The unit small-deflection shape itself (y up, 0 at the supports / clamp; −1 at the middle / free end). */
export function unitShape(shape: BendShape, s: number): number {
  if (shape.mode === 'bridge') {
    const L = shape.span!;
    const a = L / 2 - Math.abs(s);
    return a >= 0 ? -(a * (3 * L * L - 4 * a * a)) / L ** 3 : (-3 * a) / L;
  }
  const L = shape.reach!;
  const x = s - shape.clamp!;
  if (x <= 0) return 0;
  if (x <= L) return -(x * x * (3 * L - x)) / (2 * L ** 3);
  return -1 - (1.5 * (x - L)) / L;
}

/** A solved centre line: points and turns at `BEND_SEGMENTS + 1` places evenly along the strip. */
export interface BendCurve {
  /** Material place along the strip of each point (from −length ÷ 2). */
  s: Float64Array;
  /** Position along the axis and height of each point. */
  x: Float64Array;
  y: Float64Array;
  /** Turn of the strip at each point (radians, up positive) and its cosine and sine. */
  angle: Float64Array;
  cos: Float64Array;
  sin: Float64Array;
  /** The unit shape's slope over each slice (the same for every amplitude). */
  slope: Float64Array;
  /** The drawn sag (bridge) or drop (cantilever). */
  value: number;
  /** The shape's size: 0 straight. */
  amplitude: number;
}

/** Lay the slices for one amplitude (cos and sin of atan without trigonometry); returns the drawn value (NaN: the strip slipped off its supports). */
function lay(shape: BendShape, amplitude: number, c: BendCurve): number {
  const n = BEND_SEGMENTS;
  const ds = shape.length / n;
  const half = n / 2;
  if (shape.mode === 'bridge') {
    // From the middle out: the strip stays symmetric about it.
    c.x[half] = 0;
    c.y[half] = 0;
    for (let k = half; k < n; k++) {
      const u = amplitude * c.slope[k]!;
      const r = ds / Math.sqrt(1 + u * u);
      c.x[k + 1] = c.x[k]! + r;
      c.y[k + 1] = c.y[k]! + r * u;
      c.x[n - k - 1] = -c.x[k + 1]!;
      c.y[n - k - 1] = c.y[k + 1]!;
    }
    // Rest it on the supports: the place where it crosses x = span ÷ 2 sits at height 0.
    const edge = shape.span! / 2;
    let k = half;
    while (k < n && c.x[k + 1]! < edge) k++;
    if (k === n) return NaN;
    const t = (edge - c.x[k]!) / (c.x[k + 1]! - c.x[k]!);
    const lift = c.y[k]! + t * (c.y[k + 1]! - c.y[k]!);
    for (let i = 0; i <= n; i++) c.y[i] = c.y[i]! - lift;
    return -c.y[half]!;
  }
  // Unmoved up to the clamp; along the arc after it.
  c.x[0] = c.s[0]!;
  c.y[0] = 0;
  for (let k = 0; k < n; k++) {
    const u = amplitude * c.slope[k]!;
    const r = ds / Math.sqrt(1 + u * u);
    c.x[k + 1] = c.x[k]! + r;
    c.y[k + 1] = c.y[k]! + r * u;
  }
  const end = shape.clamp! + shape.reach!;
  const f = (end - c.s[0]!) / ds;
  const k = Math.min(n - 1, Math.floor(f));
  return -(c.y[k]! + (f - k) * (c.y[k + 1]! - c.y[k]!));
}

/** A curve with room for one shape (reuse it: `bendCurve` fills it in place). */
export function newBendCurve(): BendCurve {
  const n = BEND_SEGMENTS + 1;
  const f = () => new Float64Array(n);
  return { s: f(), x: f(), y: f(), angle: f(), cos: f(), sin: f(), slope: new Float64Array(BEND_SEGMENTS), value: 0, amplitude: 0 };
}

/** How far the drawn value is from the target for one amplitude (slipping off the supports: too far). */
function miss(shape: BendShape, a: number, target: number, c: BendCurve): number {
  const d = lay(shape, a, c) - target;
  return Number.isNaN(d) ? Infinity : d;
}

/**
 * The amplitude that draws `target`: secant steps from the curve's last
 * solution (an eased bend moves a little each frame), else Illinois false
 * position in a bracket (the drawn value grows with the amplitude).
 */
function solveAmplitude(shape: BendShape, target: number, c: BendCurve): number {
  let a0 = c.value > 1e-9 && c.amplitude > 0 ? (c.amplitude * target) / c.value : target;
  let f0 = miss(shape, a0, target, c);
  if (Number.isFinite(f0) && f0 + target > 0) {
    let a1 = (a0 * target) / (f0 + target);
    let f1 = miss(shape, a1, target, c);
    for (let i = 0; i < 12 && Number.isFinite(f1); i++) {
      if (Math.abs(f1) < 1e-11) return a1;
      const a2 = f1 !== f0 ? a1 - (f1 * (a1 - a0)) / (f1 - f0) : (a1 * target) / (f1 + target);
      if (!(a2 > 0)) break;
      a0 = a1;
      f0 = f1;
      a1 = a2;
      f1 = miss(shape, a1, target, c);
    }
  }
  let lo = 0;
  let flo = -target;
  let hi = target;
  let fhi = miss(shape, hi, target, c);
  while (fhi < 0 && hi < 1e3) {
    lo = hi;
    flo = fhi;
    hi *= 2;
    fhi = miss(shape, hi, target, c);
  }
  // Bisection while the far end slips off the supports.
  let side = 0;
  let a = hi;
  for (let i = 0; i < 100; i++) {
    a = Number.isFinite(fhi) ? hi - (fhi * (hi - lo)) / (fhi - flo) : (lo + hi) / 2;
    if (!(a > lo && a < hi)) a = (lo + hi) / 2;
    const fa = miss(shape, a, target, c);
    if (Math.abs(fa) < 1e-11 || hi - lo < 1e-14) break;
    if (fa > 0) {
      hi = a;
      fhi = fa;
      if (side === 1) flo /= 2;
      side = 1;
    } else {
      lo = a;
      flo = fa;
      if (side === -1 && Number.isFinite(fhi)) fhi /= 2;
      side = -1;
    }
  }
  return Number.isFinite(miss(shape, a, target, c)) ? a : lo;
}

/**
 * The centre line of `shape` bent by `value` (sag of the middle, or drop of
 * the free end; clamped by `bendLimit`), written into `out` (a fresh one if
 * not given). The drawn value matches to 1e-9 m unless the strip is too short
 * to sag that far on its supports (then as far as it can).
 */
export function bendCurve(shape: BendShape, value: number, out: BendCurve = newBendCurve()): BendCurve {
  const n = BEND_SEGMENTS;
  const ds = shape.length / n;
  for (let i = 0; i <= n; i++) out.s[i] = -shape.length / 2 + i * ds;
  for (let k = 0; k < n; k++) out.slope[k] = unitSlope(shape, out.s[k]! + ds / 2);
  const target = bendLimit(shape, value);
  const amplitude = target > 1e-9 ? solveAmplitude(shape, target, out) : 0;
  out.amplitude = amplitude;
  out.value = Math.max(0, lay(shape, amplitude, out));
  // Point turns: the mean of the slices on either side (the ends: their slice).
  const turn = (k: number) => Math.atan(amplitude * out.slope[k]!);
  let prev = turn(0);
  out.angle[0] = prev;
  for (let k = 1; k < n; k++) {
    const next = turn(k);
    out.angle[k] = (prev + next) / 2;
    prev = next;
  }
  out.angle[n] = prev;
  for (let i = 0; i <= n; i++) {
    out.cos[i] = Math.cos(out.angle[i]!);
    out.sin[i] = Math.sin(out.angle[i]!);
  }
  return out;
}

/** The centre line's own length (it equals the strip's: the slices are laid end to end). */
export function curveLength(c: BendCurve): number {
  let l = 0;
  for (let i = 1; i < c.x.length; i++) l += Math.hypot(c.x[i]! - c.x[i - 1]!, c.y[i]! - c.y[i - 1]!);
  return l;
}

/** Where the material place `s` of the strip is now: along the axis, height, and the cosine and sine of its turn (written into `out`). */
export function curveAt(c: BendCurve, s: number, out: [number, number, number, number]): [number, number, number, number] {
  const n = c.s.length - 1;
  const ds = c.s[1]! - c.s[0]!;
  const f = Math.min(n, Math.max(0, (s - c.s[0]!) / ds));
  const k = Math.min(n - 1, Math.floor(f));
  const t = f - k;
  out[0] = c.x[k]! + t * (c.x[k + 1]! - c.x[k]!);
  out[1] = c.y[k]! + t * (c.y[k + 1]! - c.y[k]!);
  const cos = c.cos[k]! + t * (c.cos[k + 1]! - c.cos[k]!);
  const sin = c.sin[k]! + t * (c.sin[k + 1]! - c.sin[k]!);
  const l = Math.sqrt(cos * cos + sin * sin);
  out[2] = cos / l;
  out[3] = sin / l;
  return out;
}

/** Each vertex's place on the centre line (the point before it and how far on to the next) and its height off the line, from the rest positions (part frame) of a strip `length` long. */
export interface BendFrame {
  k: Uint16Array;
  t: Float32Array;
  v: Float32Array;
}

export function bendFrame(base: ArrayLike<number>, axis: { index: 0 | 2; sign: 1 | -1 }, length: number): BendFrame {
  const count = base.length / 3;
  const n = BEND_SEGMENTS;
  const frame: BendFrame = { k: new Uint16Array(count), t: new Float32Array(count), v: new Float32Array(count) };
  for (let i = 0; i < count; i++) {
    const s = base[i * 3 + axis.index]! * axis.sign;
    const raw = Math.min(n, Math.max(0, ((s + length / 2) / length) * n));
    // On a slice (the builder cuts the strip at the centre line's points): exactly there.
    const f = Math.abs(raw - Math.round(raw)) < 1e-4 ? Math.round(raw) : raw;
    const k = Math.min(n - 1, Math.floor(f));
    frame.k[i] = k;
    frame.t[i] = f - k;
    frame.v[i] = base[i * 3 + 1]!;
  }
  return frame;
}

/**
 * Write the bent positions and normals of the vertices marked in `mask`
 * (1: bent; others copied from the rest): each one follows the centre line at
 * its place, its height off the line turned with the strip.
 */
export function bendVertices(
  c: BendCurve,
  axis: { index: 0 | 2; sign: 1 | -1 },
  frame: BendFrame,
  mask: Float32Array | null,
  base: Float32Array,
  baseNormal: Float32Array,
  pos: Float32Array,
  normal: Float32Array,
): void {
  const fk = frame.k;
  const ft = frame.t;
  const fv = frame.v;
  const count = fk.length;
  const a = axis.index;
  const lateral = 2 - a;
  const sign = axis.sign;
  const { x, y } = c;
  const cs = c.cos;
  const sn = c.sin;
  for (let i = 0, o = 0; i < count; i++, o += 3) {
    if (mask !== null && mask[i] === 0) {
      pos[o] = base[o]!;
      pos[o + 1] = base[o + 1]!;
      pos[o + 2] = base[o + 2]!;
      normal[o] = baseNormal[o]!;
      normal[o + 1] = baseNormal[o + 1]!;
      normal[o + 2] = baseNormal[o + 2]!;
      continue;
    }
    const k = fk[i]!;
    const t = ft[i]!;
    let px = x[k]!;
    let py = y[k]!;
    let cos = cs[k]!;
    let sin = sn[k]!;
    if (t !== 0) {
      px += t * (x[k + 1]! - px);
      py += t * (y[k + 1]! - py);
      cos += t * (cs[k + 1]! - cos);
      sin += t * (sn[k + 1]! - sin);
      const l = 1 / Math.sqrt(cos * cos + sin * sin);
      cos *= l;
      sin *= l;
    }
    const v = fv[i]!;
    pos[o + a] = (px - v * sin) * sign;
    pos[o + 1] = py + v * cos;
    pos[o + lateral] = base[o + lateral]!;
    const na = baseNormal[o + a]! * sign;
    const ny = baseNormal[o + 1]!;
    normal[o + a] = (na * cos - ny * sin) * sign;
    normal[o + 1] = na * sin + ny * cos;
    normal[o + lateral] = baseNormal[o + lateral]!;
  }
}

const tmp: [number, number, number, number] = [0, 0, 0, 1];

/** A point of the centre line in the part frame (the strip's place `s`; `out` xyz). */
export function curvePoint(c: BendCurve, axis: { index: 0 | 2; sign: 1 | -1 }, s: number, out: Vec3): Vec3 {
  curveAt(c, s, tmp);
  out[0] = 0;
  out[1] = tmp[1];
  out[2] = 0;
  out[axis.index] = tmp[0] * axis.sign;
  return out;
}
