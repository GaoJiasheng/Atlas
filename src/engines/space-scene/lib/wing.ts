/**
 * `wing` primitive maths (pure, unit-tested): a thin membrane whose `outline`
 * lies in the primitive's XY plane (relative to `at`, thickness along Z),
 * with `veins` drawn as hairlines on both faces. With `fold`, the wing is a
 * fan hinged at `fold.hinge`: `fan` 1 is the outline as drawn (open), 0 is
 * folded — every point turns about the hinge towards the leading edge (the
 * ray to `fold.lead`, default the first outline point) until the whole fan
 * is `foldedWidth` of its open angle, and the membrane pleats into `segments`
 * accordion folds (radial creases) whose depth keeps each sector's width, so
 * a folded hind wing reads as a pleated bundle along the leading edge.
 */
import type { Primitive } from '../schema';
import type { Vec3 } from './math';

export type Wing = Extract<Primitive, { kind: 'wing' }>;
export type WingFold = NonNullable<Wing['fold']>;

/** Folded width (fraction of the open fan angle) when `fold.foldedWidth` is not given. */
export const WING_FOLDED_WIDTH = 0.12;

export interface FanFrame {
  hinge: [number, number];
  /** Angle of the leading edge (radians). */
  lead: number;
  /** Largest |angle from the lead| over the outline (radians): the open fan. */
  span: number;
  segments: number;
  foldedWidth: number;
}

const wrap = (a: number) => {
  let x = a;
  while (x <= -Math.PI) x += 2 * Math.PI;
  while (x > Math.PI) x -= 2 * Math.PI;
  return x;
};

export function fanFrame(outline: readonly (readonly number[])[], fold: WingFold): FanFrame {
  const [hx, hy] = fold.hinge;
  const leadPt = fold.lead ?? outline[0]!;
  const lead = Math.atan2(leadPt[1]! - hy, leadPt[0]! - hx);
  let span = 1e-6;
  for (const q of outline) {
    if (Math.hypot(q[0]! - hx, q[1]! - hy) < 1e-9) continue;
    span = Math.max(span, Math.abs(wrap(Math.atan2(q[1]! - hy, q[0]! - hx) - lead)));
  }
  return { hinge: [hx, hy], lead, span, segments: fold.segments, foldedWidth: fold.foldedWidth ?? WING_FOLDED_WIDTH };
}

/** Where wing point (x, y) goes at `fan` (0 folded … 1 open): [x, y, z pleat offset]. */
export function fanPoint(f: FanFrame, x: number, y: number, fan: number): Vec3 {
  const k = Math.min(1, Math.max(0, fan));
  if (k >= 1) return [x, y, 0];
  const dx = x - f.hinge[0];
  const dy = y - f.hinge[1];
  const r = Math.hypot(dx, dy);
  if (r < 1e-12) return [x, y, 0];
  const d = wrap(Math.atan2(dy, dx) - f.lead);
  const c = f.foldedWidth + (1 - f.foldedWidth) * k;
  const a = f.lead + d * c;
  // Accordion: a crease at every sector boundary, the membrane rising and falling so each sector keeps its width.
  const sector = f.span / f.segments;
  const u = Math.abs(d) / sector;
  const fr = u % 1;
  const depth = ((sector * r) / 2) * Math.sqrt(Math.max(0, 1 - c * c));
  // Zigzag between −depth and +depth with a crease at every sector boundary.
  const z = depth * (Math.floor(u) % 2 === 0 ? 2 * fr - 1 : 1 - 2 * fr);
  return [f.hinge[0] + r * Math.cos(a), f.hinge[1] + r * Math.sin(a), z];
}

/** The fan at rest (`fold.rest`, default 0 = folded); 1 without a fold. */
export function restFan(p: Pick<Wing, 'fold'>): number {
  return p.fold ? (p.fold.rest ?? 0) : 1;
}

/** Bounds of a wing in its own frame at fan `fan` (default: at rest), before `scale`, `mirror`, `rotation`. */
export function wingBox(p: Wing, fan = restFan(p)): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, -p.thickness / 2];
  const max: Vec3 = [-Infinity, -Infinity, p.thickness / 2];
  const f = p.fold ? fanFrame(p.outline, p.fold) : null;
  // The outline's points and points halfway in towards the hinge (pleats peak mid-sector).
  for (const q of p.outline) {
    const pts: [number, number][] = [[q[0]!, q[1]!]];
    if (f) for (const s of [0.5, 0.75]) pts.push([f.hinge[0] + (q[0]! - f.hinge[0]) * s, f.hinge[1] + (q[1]! - f.hinge[1]) * s]);
    for (const [x, y] of pts) {
      const [px, py, pz] = f ? fanPoint(f, x, y, fan) : [x, y, 0];
      min[0] = Math.min(min[0], px);
      max[0] = Math.max(max[0], px);
      min[1] = Math.min(min[1], py);
      max[1] = Math.max(max[1], py);
      min[2] = Math.min(min[2], pz - p.thickness / 2);
      max[2] = Math.max(max[2], pz + p.thickness / 2);
    }
  }
  if (f) {
    // Pleats are deepest mid-sector at the outer edge: allow their full depth.
    let rmax = 0;
    for (const q of p.outline) rmax = Math.max(rmax, Math.hypot(q[0]! - f.hinge[0], q[1]! - f.hinge[1]));
    const c = f.foldedWidth + (1 - f.foldedWidth) * Math.min(1, Math.max(0, fan));
    const depth = ((f.span / f.segments) * rmax / 2) * Math.sqrt(Math.max(0, 1 - c * c));
    min[2] = Math.min(min[2], -depth - p.thickness / 2);
    max[2] = Math.max(max[2], depth + p.thickness / 2);
  }
  return { min, max };
}

/** Signed area of an outline (positive = counter-clockwise). */
export function outlineArea(outline: readonly (readonly number[])[]): number {
  let a = 0;
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i]!;
    const q = outline[(i + 1) % outline.length]!;
    a += p[0]! * q[1]! - q[0]! * p[1]!;
  }
  return a / 2;
}
