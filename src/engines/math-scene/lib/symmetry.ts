/**
 * Line symmetry on the square grid (docs/79 §3.1): a figure as convex pieces
 * (unit squares, half squares, free shapes), a line as two points, the fold —
 * the part on the line's left turned over onto its right — and where the two
 * halves do not match (the pieces' symmetric difference, its area by convex
 * clipping), whether a line is a line of symmetry, every line of symmetry of
 * a figure (all of them pass through its centre: up, across and the two
 * diagonals, and the lines to each corner and each side's middle), and the
 * partner of a square, a half square or a grid point across a line up or
 * across. Shaded squares are matched on their own (a pattern inside an
 * outline). Coordinates are grid units with y up, as in `grid.ts`. Pure.
 */
import type { GridFigure, GridModelSpec, SymLineSpec } from '../schema';
import { cellKey, factsOf, figureCells, figureHalves, parseCell, parseHalf, type Corner, type Half } from './grid';

export type Pt = readonly [number, number];
export type Poly = Pt[];
/** A line through `a` and `b`; its left is the side folded over (walking from `a` to `b`). */
export interface Line {
  a: Pt;
  b: Pt;
}
/** A convex piece of a figure; shaded pieces are matched among themselves. */
export interface Piece {
  poly: Poly;
  shade: boolean;
}

export const EPS = 1e-7;
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

/* ------------------------------------------------------------------ */
/* Lines                                                               */
/* ------------------------------------------------------------------ */

/** A line as data → two points (up: walking up, so its left is the left; across: walking right, so its left is the top). */
export function lineOf(spec: SymLineSpec): Line {
  if ('x' in spec) return { a: [spec.x, 0], b: [spec.x, 1] };
  if ('y' in spec) return { a: [0, spec.y], b: [1, spec.y] };
  return { a: spec.from, b: spec.to };
}

/** Up, across or slanted (the SYMMETRY card's LINE row). */
export function lineDirection(spec: SymLineSpec): 'upright' | 'across' | 'slanted' {
  if ('x' in spec) return 'upright';
  if ('y' in spec) return 'across';
  if (near(spec.from[0], spec.to[0])) return 'upright';
  if (near(spec.from[1], spec.to[1])) return 'across';
  return 'slanted';
}

/** A line up (`x`) or across (`y`) and where it is, else `null` (slanted). */
export function axisOf(spec: SymLineSpec): { axis: 'x' | 'y'; at: number } | null {
  if ('x' in spec) return { axis: 'x', at: spec.x };
  if ('y' in spec) return { axis: 'y', at: spec.y };
  if (near(spec.from[0], spec.to[0])) return { axis: 'x', at: spec.from[0] };
  if (near(spec.from[1], spec.to[1])) return { axis: 'y', at: spec.from[1] };
  return null;
}

/** > 0 on the left of the line, < 0 on its right, 0 on it. */
export function sideOf(l: Line, p: Pt): number {
  return (l.b[0] - l.a[0]) * (p[1] - l.a[1]) - (l.b[1] - l.a[1]) * (p[0] - l.a[0]);
}

/** The same line walked the other way when `p` is on its right (so `p`'s side is the one folded over). */
export function orientToward(l: Line, p: Pt): Line {
  return sideOf(l, p) < 0 ? { a: l.b, b: l.a } : l;
}

export function reflectPoint(l: Line, p: Pt): Pt {
  const dx = l.b[0] - l.a[0];
  const dy = l.b[1] - l.a[1];
  const d2 = dx * dx + dy * dy;
  const t = ((p[0] - l.a[0]) * dx + (p[1] - l.a[1]) * dy) / d2;
  const fx = l.a[0] + t * dx;
  const fy = l.a[1] + t * dy;
  return [2 * fx - p[0], 2 * fy - p[1]];
}

/* ------------------------------------------------------------------ */
/* Polygons                                                            */
/* ------------------------------------------------------------------ */

export function signedArea(poly: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}
export const area = (poly: readonly Pt[]) => Math.abs(signedArea(poly));

/** Is the polygon convex (corners turning one way)? */
export function isConvex(poly: readonly Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]!;
    const [bx, by] = poly[(i + 1) % poly.length]!;
    const [cx, cy] = poly[(i + 2) % poly.length]!;
    const z = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(z) < EPS) continue;
    if (sign === 0) sign = Math.sign(z);
    else if (Math.sign(z) !== sign) return false;
  }
  return sign !== 0;
}

/** The part of a polygon on one side of a line (`keep` +1 the left, −1 the right; Sutherland–Hodgman). */
export function clipHalf(poly: readonly Pt[], l: Line, keep: 1 | -1): Poly {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const sp = keep * sideOf(l, p);
    const sq = keep * sideOf(l, q);
    if (sp >= -EPS) out.push(p);
    if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return area(out) < EPS ? [] : out;
}

/** The overlap of two convex polygons. */
export function intersectConvex(a: readonly Pt[], b: readonly Pt[]): Poly {
  const clip = signedArea(b) < 0 ? [...b].reverse() : [...b];
  let out: Poly = [...a];
  for (let i = 0; i < clip.length && out.length; i++) out = clipHalf(out, { a: clip[i]!, b: clip[(i + 1) % clip.length]! }, 1);
  return out;
}

/* ------------------------------------------------------------------ */
/* Figures as pieces                                                   */
/* ------------------------------------------------------------------ */

const square = (x: number, y: number): Poly => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
/** A half square: the triangle with its square corner at `c`. */
export function halfPoly(h: Half): Poly {
  const { x, y, c } = h;
  if (c === 'sw') return [[x, y], [x + 1, y], [x, y + 1]];
  if (c === 'se') return [[x, y], [x + 1, y], [x + 1, y + 1]];
  if (c === 'ne') return [[x + 1, y], [x + 1, y + 1], [x, y + 1]];
  return [[x, y], [x + 1, y + 1], [x, y + 1]];
}

/** A figure's pieces (an open path has none). */
export function figurePieces(f: GridFigure): Piece[] {
  const shade = !!f.shade;
  const out: Piece[] = [];
  for (const k of figureCells(f)) out.push({ poly: square(...parseCell(k)), shade });
  for (const h of figureHalves(f)) out.push({ poly: halfPoly(h), shade });
  if (f.shape) out.push({ poly: f.shape.map((p) => [p[0], p[1]] as Pt), shade });
  return out;
}

/** Squares and half squares by key (`"3,2"`, `"3,2,ne"`) as pieces. */
export function keyPieces(keys: readonly string[], shade = false): Piece[] {
  return keys.map((k) => {
    const h = parseHalf(k);
    return { poly: h ? halfPoly(h) : square(...parseCell(k)), shade };
  });
}

/** Does a line (or a segment, for `from` / `to`) meet a figure's box? */
function meets(spec: SymLineSpec, f: GridFigure): boolean {
  const pieces = figurePieces(f);
  const pts = pieces.flatMap((p) => p.poly).concat((f.path ?? []).map((p) => [p[0], p[1]] as Pt));
  if (pts.length === 0) return false;
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  if ('x' in spec) return spec.x >= x0 - EPS && spec.x <= x1 + EPS;
  if ('y' in spec) return spec.y >= y0 - EPS && spec.y <= y1 + EPS;
  // Liang–Barsky: the segment clipped to the box is not empty.
  const [ax, ay] = spec.from;
  const dx = spec.to[0] - ax;
  const dy = spec.to[1] - ay;
  let lo = 0;
  let hi = 1;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]] as const) {
    if (Math.abs(p) < EPS) {
      if (q < -EPS) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) lo = Math.max(lo, r);
    else hi = Math.min(hi, r);
    if (lo > hi + EPS) return false;
  }
  return true;
}

/** The figures a line is about (ghosts left out), and the shaded squares inside them. */
export function figuresOnLine(m: GridModelSpec, spec: SymLineSpec): GridFigure[] {
  // A line up or across is about the whole drawing; a segment about the figures it passes through.
  const hit = m.figures.filter((f) => f.tone !== 'ghost' && !f.shade && ('from' in spec ? meets(spec, f) : figurePieces(f).length > 0 || !!f.path));
  const inside = (f: GridFigure) => {
    const b = factsOf(f).box;
    return hit.some((h) => {
      const c = factsOf(h).box;
      return b.x >= c.x && b.y >= c.y && b.x + b.w <= c.x + c.w && b.y + b.h <= c.y + c.h;
    });
  };
  return m.figures.filter((f) => hit.includes(f) || (f.shade && inside(f)));
}

/* ------------------------------------------------------------------ */
/* Folding                                                             */
/* ------------------------------------------------------------------ */

export interface Folded {
  /** The left part turned over (reflected), by class. */
  moved: Piece[];
  /** The right part, where it was. */
  stayed: Piece[];
  /** Area where the two do not match. */
  mismatch: number;
}

/** Fold the pieces along the line: the left part over onto the right. */
export function foldPieces(pieces: readonly Piece[], l: Line): Folded {
  const moved: Piece[] = [];
  const stayed: Piece[] = [];
  for (const p of pieces) {
    const left = clipHalf(p.poly, l, 1);
    const right = clipHalf(p.poly, l, -1);
    if (left.length) moved.push({ poly: left.map((q) => reflectPoint(l, q)), shade: p.shade });
    if (right.length) stayed.push({ poly: right, shade: p.shade });
  }
  let mismatch = 0;
  for (const shade of [false, true]) {
    const a = moved.filter((p) => p.shade === shade);
    const b = stayed.filter((p) => p.shade === shade);
    let both = 0;
    for (const p of a) for (const q of b) both += area(intersectConvex(p.poly, q.poly));
    mismatch += a.reduce((s, p) => s + area(p.poly), 0) + b.reduce((s, p) => s + area(p.poly), 0) - 2 * both;
  }
  return { moved, stayed, mismatch: Math.max(0, mismatch) };
}

/** Do the two halves match when folded along the line? (Something must lie on each side.) */
export function isSymmetric(pieces: readonly Piece[], l: Line): boolean {
  if (pieces.length === 0) return false;
  const f = foldPieces(pieces, l);
  return f.moved.length > 0 && f.stayed.length > 0 && f.mismatch < 1e-6;
}

/** The pieces of the figures a line is about, and whether it is a line of symmetry of them. */
export function lineMatches(m: GridModelSpec, spec: SymLineSpec): boolean {
  return isSymmetric(figuresOnLine(m, spec).flatMap(figurePieces), lineOf(spec));
}

/** The centre of the pieces (area-weighted; the unshaded ones, else all). */
function centreOf(pieces: readonly Piece[]): Pt | null {
  const use = pieces.some((p) => !p.shade) ? pieces.filter((p) => !p.shade) : pieces;
  let ax = 0;
  let ay = 0;
  let total = 0;
  for (const { poly } of use) {
    const a = area(poly);
    const sa = signedArea(poly);
    let gx = 0;
    let gy = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i]!;
      const [x2, y2] = poly[(i + 1) % poly.length]!;
      const c = x1 * y2 - x2 * y1;
      gx += (x1 + x2) * c;
      gy += (y1 + y2) * c;
    }
    if (Math.abs(sa) < EPS) continue;
    const px = gx / (6 * sa);
    const py = gy / (6 * sa);
    ax += px * a;
    ay += py * a;
    total += a;
  }
  return total > EPS ? [ax / total, ay / total] : null;
}

/**
 * Every line of symmetry of the pieces: each passes through the centre, so the lines tried are the four grid
 * directions through it and the lines from it to every corner and every side's middle.
 */
export function linesOfSymmetry(pieces: readonly Piece[]): Line[] {
  const c = centreOf(pieces);
  if (!c) return [];
  const dirs: Pt[] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const { poly } of pieces)
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]!;
      const q = poly[(i + 1) % poly.length]!;
      for (const t of [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Pt]) if (Math.hypot(t[0] - c[0], t[1] - c[1]) > 1e-6) dirs.push([t[0] - c[0], t[1] - c[1]]);
    }
  const seen: number[] = [];
  const out: Line[] = [];
  for (const [dx, dy] of dirs) {
    let ang = Math.atan2(dy, dx);
    if (ang < 0) ang += Math.PI;
    if (ang >= Math.PI - 1e-9) ang -= Math.PI;
    if (seen.some((s) => Math.abs(s - ang) < 1e-6)) continue;
    seen.push(ang);
    const l: Line = { a: c, b: [c[0] + Math.cos(ang), c[1] + Math.sin(ang)] };
    if (isSymmetric(pieces, l)) out.push(l);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Partners across a line up or across                                 */
/* ------------------------------------------------------------------ */

const FLIP_UP: Record<Corner, Corner> = { ne: 'nw', nw: 'ne', se: 'sw', sw: 'se' };
const FLIP_ACROSS: Record<Corner, Corner> = { ne: 'se', se: 'ne', nw: 'sw', sw: 'nw' };

/** The partner of a square or a half square (`"3,2"`, `"3,2,ne"`) across a line up (`x`) or across (`y`). */
export function partnerKey(key: string, ax: { axis: 'x' | 'y'; at: number }): string {
  const h = parseHalf(key);
  const [x, y] = h ? [h.x, h.y] : parseCell(key);
  const px = ax.axis === 'x' ? 2 * ax.at - 1 - x : x;
  const py = ax.axis === 'y' ? 2 * ax.at - 1 - y : y;
  if (!h) return cellKey(px, py);
  return `${px},${py},${(ax.axis === 'x' ? FLIP_UP : FLIP_ACROSS)[h.c]}`;
}

/** The half square at a square's place with its slant not turned over (how a half "not flipped" looks). */
export function unflippedKey(key: string, ax: { axis: 'x' | 'y'; at: number }): string {
  const h = parseHalf(key);
  if (!h) return key;
  return `${h.x},${h.y},${(ax.axis === 'x' ? FLIP_UP : FLIP_ACROSS)[h.c]}`;
}

/** The partner of a grid point. */
export function partnerPoint(p: Pt, ax: { axis: 'x' | 'y'; at: number }): [number, number] {
  return ax.axis === 'x' ? [2 * ax.at - p[0], p[1]] : [p[0], 2 * ax.at - p[1]];
}

/** A square or half square moved by `d` squares across the line (right / up for `d` > 0). */
export function shiftKey(key: string, axis: 'x' | 'y', d: number): string {
  const h = parseHalf(key);
  const [x, y] = h ? [h.x, h.y] : parseCell(key);
  const nx = axis === 'x' ? x + d : x;
  const ny = axis === 'y' ? y + d : y;
  return h ? `${nx},${ny},${h.c}` : cellKey(nx, ny);
}

/** Squares from a square (its near side) to the line; a point's distance. */
export function cellDistance(key: string, ax: { axis: 'x' | 'y'; at: number }): number {
  const h = parseHalf(key);
  const [x, y] = h ? [h.x, h.y] : parseCell(key);
  const v = ax.axis === 'x' ? x : y;
  return v + 1 <= ax.at ? ax.at - (v + 1) : v >= ax.at ? v - ax.at : 0;
}
