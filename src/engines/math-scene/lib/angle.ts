/**
 * Angle geometry (docs/76 §3.1, model A5): directions in degrees anticlockwise
 * from pointing right, y up. The arms of a drawing (rays, and both ends of a
 * line through the vertex), the size between two arms, a protractor's two
 * scales (the inner reads 0 at its turn `rot` and counts anticlockwise, the
 * outer reads 0 at rot + 180 and counts clockwise, as on a real one), the
 * ways a protractor can be laid on an angle, the corners of a shape, a line
 * on dot paper against another (parallel, perpendicular, how far the gap
 * changes), and where everything lies for the drawing. Pure.
 */
import type { AngleArc, AngleModelSpec, AngleSpec, DotPaper } from '../schema';

export type P2 = [number, number];

/** A direction brought into [0, 360). */
export const norm = (d: number): number => ((d % 360) + 360) % 360;
const rad = (d: number) => (d * Math.PI) / 180;
/** The point at a direction and distance from the vertex (y up). */
export const at = (dir: number, r: number): P2 => [Math.cos(rad(dir)) * r, Math.sin(rad(dir)) * r];

/** How far an arc turns (drawn). */
export const arcSpan = (a: Pick<AngleArc, 'from' | 'to'>): number => a.to - a.from;
/** The size an arc stands for: its `value` (a drawing not to scale), else as drawn. */
export const arcValue = (a: AngleArc): number => a.value ?? Math.round(arcSpan(a));

/** Every arm of a drawing: each ray, both ends of each line. */
export function armsOf(spec: AngleSpec): number[] {
  return [...(spec.rays ?? []).map((r) => norm(r.dir)), ...(spec.lines ?? []).flatMap((l) => [norm(l.dir), norm(l.dir + 180)])];
}

/** The size of the angle between two directions (0–180). */
export function between(a: number, b: number): number {
  const d = norm(b - a);
  return d <= 180 ? d : 360 - d;
}

/** A two-arm angle's size (its first two rays). */
export function twoArmSize(spec: AngleSpec): number | null {
  const r = spec.rays ?? [];
  return r.length >= 2 ? between(r[0]!.dir, r[1]!.dir) : null;
}

/* ------------------------------------------------------------------ */
/* The protractor                                                      */
/* ------------------------------------------------------------------ */

export type Row = 'inner' | 'outer';

/** How far anticlockwise a direction lies from the protractor's inner 0 (a hair under 360 counts as 0). */
const fromInnerZero = (rot: number, dir: number): number => {
  const v = norm(dir - rot);
  return v > 360 - 1e-6 ? 0 : v;
};

/** A direction meets the protractor's curve (not behind its flat edge). */
export function onCurve(rot: number, dir: number): boolean {
  return fromInnerZero(rot, dir) <= 180 + 1e-6;
}

/** The number a scale shows at a direction on the curve. */
export function reading(rot: number, dir: number, row: Row): number {
  const v = Math.min(180, fromInnerZero(rot, dir));
  return row === 'inner' ? v : 180 - v;
}

/** The direction a scale's number lies at. */
export const scaleDir = (rot: number, value: number, row: Row): number => norm(row === 'inner' ? rot + value : rot + 180 - value);

/** The scale whose 0 lies on the arm (`null`: the arm is on neither end of the flat edge). */
export function zeroRow(rot: number, arm: number, tol = 1e-6): Row | null {
  if (between(rot, arm) <= tol) return 'inner';
  if (between(rot + 180, arm) <= tol) return 'outer';
  return null;
}

/** The turns that put a 0 on one arm with the other arm on the curve (the protractor laid right), the arm and the row. */
export function layings(a: number, b: number): { rot: number; arm: number; row: Row }[] {
  const out: { rot: number; arm: number; row: Row }[] = [];
  for (const [arm, other] of [
    [a, b],
    [b, a],
  ] as const) {
    // Inner 0 on the arm: the curve runs anticlockwise from it.
    if (onCurve(arm, other)) out.push({ rot: norm(arm), arm, row: 'inner' });
    // Outer 0 on the arm: the curve runs clockwise from it.
    if (onCurve(norm(arm - 180), other)) out.push({ rot: norm(arm - 180), arm, row: 'outer' });
  }
  return out;
}

/** The laying nearest a turn (for "Line up with an arm"). */
export function nearestLaying(a: number, b: number, rot: number) {
  const all = layings(a, b);
  return all.reduce((best, l) => (between(l.rot, rot) < between(best.rot, rot) ? l : best), all[0]!);
}

/** The vertex the protractor's centre snaps to, in arm units. */
export const CENTRE_SNAP = 0.1;
/** Degrees within which the protractor's flat edge snaps onto an arm. */
export const TURN_SNAP = 5;

/* ------------------------------------------------------------------ */
/* Shapes                                                              */
/* ------------------------------------------------------------------ */

/** The corners of a shape: each corner's interior angle (degrees) and the directions of its two sides (anticlockwise order). */
export function corners(points: readonly P2[]): { at: P2; from: number; to: number; size: number }[] {
  const n = points.length;
  // Signed area: positive = anticlockwise.
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    const q = points[(i + 1) % n]!;
    area += p[0] * q[1] - q[0] * p[1];
  }
  const ccw = area > 0;
  return points.map((p, i) => {
    const prev = points[(i - 1 + n) % n]!;
    const next = points[(i + 1) % n]!;
    const toNext = norm((Math.atan2(next[1] - p[1], next[0] - p[0]) * 180) / Math.PI);
    const toPrev = norm((Math.atan2(prev[1] - p[1], prev[0] - p[0]) * 180) / Math.PI);
    // Inside a shape traced anticlockwise, the interior turns anticlockwise from the next side to the previous one.
    const [from, to0] = ccw ? [toNext, toPrev] : [toPrev, toNext];
    const to = to0 < from ? to0 + 360 : to0;
    return { at: p, from, to, size: to - from };
  });
}

/* ------------------------------------------------------------------ */
/* Dot paper                                                           */
/* ------------------------------------------------------------------ */

export const vec = (a: P2, b: P2): P2 => [b[0] - a[0], b[1] - a[1]];
export const cross = (v: P2, w: P2): number => v[0] * w[1] - v[1] * w[0];
export const dotProduct = (v: P2, w: P2): number => v[0] * w[0] + v[1] * w[1];

/** How many squares the gap between two lines changes along a drawn segment (0: parallel), measured across the given line's main direction. */
export function gapChange(drawn: P2, given: P2): number {
  const main = Math.abs(given[0]) >= Math.abs(given[1]) ? Math.abs(given[0]) : Math.abs(given[1]);
  return main === 0 ? Infinity : Math.abs(cross(drawn, given)) / main;
}

/** The two points lie on the given segment's line. */
export function onLine(p: P2, a: P2, b: P2): boolean {
  return cross(vec(a, b), vec(a, p)) === 0;
}

/** A segment's run as steps ("3 right, 1 up"): [across, up]. */
export const steps = (from: P2, to: P2): P2 => vec(from, to);

/** A dot is on the paper. */
export const onPaper = (p: P2, paper: Pick<DotPaper, 'cols' | 'rows'>): boolean => p[0] >= 0 && p[1] >= 0 && p[0] < paper.cols && p[1] < paper.rows;

/* ------------------------------------------------------------------ */
/* Items and sizes for the drawing                                     */
/* ------------------------------------------------------------------ */

/** The drawings of a model: one, or the pair or set in a row. */
export function angleItems(m: AngleModelSpec): AngleSpec[] {
  return m.pair ?? m.set ?? [m];
}

/** The arm length a ray or a line is drawn at (units). */
export function armLen(spec: AngleSpec, len: number | undefined): number {
  return len ?? (spec.protractor && !spec.protractor.away ? 1.18 : 1);
}

/** The protractor's radius (units). */
export const PROTRACTOR_R = 0.9;

/** The bounds of a drawing in its own units (y up), with room for labels. */
export function boundsOf(spec: AngleSpec): { x0: number; y0: number; x1: number; y1: number } {
  const pts: P2[] = [];
  if (spec.paper) {
    pts.push([0, 0], [spec.paper.cols - 1, spec.paper.rows - 1]);
    return { x0: -0.6, y0: -0.6, x1: spec.paper.cols - 0.4, y1: spec.paper.rows - 0.4 };
  }
  if (spec.polygon) {
    for (const p of spec.polygon.points) pts.push(p);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const pad = 0.12 * Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    return { x0: Math.min(...xs) - pad, y0: Math.min(...ys) - pad, x1: Math.max(...xs) + pad, y1: Math.max(...ys) + pad };
  }
  pts.push([0, 0]);
  const label = 0.16;
  for (const r of spec.rays ?? []) pts.push(at(r.dir, armLen(spec, r.len) + label));
  for (const l of spec.lines ?? []) pts.push(at(l.dir, armLen(spec, l.len) + label), at(l.dir + 180, armLen(spec, l.len) + label));
  const p = spec.protractor;
  if (p && !p.away) for (let d = 0; d <= 180; d += 15) pts.push(at(p.rot + d, PROTRACTOR_R * 1.06));
  if (p && !p.away) pts.push(at(p.rot - 90, 0.1));
  if (spec.ring) for (let d = 0; d < 360; d += 30) pts.push(at(d, 1.12));
  if (spec.tester && !spec.tester.away) pts.push(at(spec.tester.dir, 0.62), at(spec.tester.dir + 90, 0.62), at(spec.tester.dir + 45, 0.62));
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  return { x0: Math.min(...xs) - 0.08, y0: Math.min(...ys) - 0.08, x1: Math.max(...xs) + 0.08, y1: Math.max(...ys) + 0.08 };
}

/** The arc radius of a drawing: a fraction of its shorter arm (docs/76 §3.1). */
export function arcRadius(spec: AngleSpec): number {
  const lens = [...(spec.rays ?? []).map((r) => armLen(spec, r.len)), ...(spec.lines ?? []).map((l) => armLen(spec, l.len))];
  const short = lens.length ? Math.min(...lens) : 1;
  return Math.max(0.16, Math.min(0.3, short * 0.28));
}

/* ------------------------------------------------------------------ */
/* What the angle is (cards, plate, screen readers)                    */
/* ------------------------------------------------------------------ */

export type Kind = 'smaller' | 'right' | 'greater' | 'straight' | 'full';

/** An angle's size compared with a right angle. */
export function kindOf(size: number): Kind {
  if (Math.abs(size - 90) < 0.5) return 'right';
  if (Math.abs(size - 180) < 0.5) return 'straight';
  if (size >= 359.5) return 'full';
  return size < 90 ? 'smaller' : 'greater';
}

/** The arc on show a beat is about: the first signal one, else the first one, else a two-arm angle. */
export function litAngle(spec: AngleSpec): { size: number | null; unknown: boolean } | null {
  const arcs = spec.arcs ?? [];
  const lit = arcs.find((a) => a.tone === 'signal') ?? arcs[0];
  if (lit) return { size: arcValue(lit), unknown: lit.label === '?' };
  const s = twoArmSize(spec);
  if (s !== null) return { size: s, unknown: false };
  if (spec.square?.length) return { size: 90, unknown: false };
  return null;
}

/** The largest scale (px per unit) at which every drawing fits a w × h box: option pictures share it, so long arms look long. */
export function fitScale(specs: readonly AngleSpec[], w: number, h: number, pad = 6): number {
  return Math.min(...specs.map((s) => {
    const b = boundsOf(s);
    return Math.min((w - 2 * pad) / Math.max(0.2, b.x1 - b.x0), (h - 2 * pad) / Math.max(0.2, b.y1 - b.y0));
  }));
}
