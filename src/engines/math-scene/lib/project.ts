/**
 * Projection and occlusion for model A8 `net` (docs/39 §3.3): orthographic
 * views from straight above (`top`) and true isometric (`iso`: 45° round,
 * 35.264° down, so it lines up with an isometric grid later), the `auto`
 * view that goes from one to the other as the net folds, quarter turns
 * about the upright axis, which side of a face is seen, and the order to
 * paint the faces in (back to front) from pairwise plane tests — face A
 * goes before face B when their pictures overlap and A lies wholly behind
 * B's plane, or B wholly in front of A's — sorted topologically, depth
 * breaking ties and cycles. The order is checked against ray casting in
 * tests/math-scene/project.test.ts. Pure: no DOM.
 */
import { centroid, dot, polyNormal, scale, sub, type Vec3 } from './solid';
import { convexOverlap, type P2 } from './net';

/** The isometric camera's angle down from the horizontal: arctan(1/√2) ≈ 35.264°. */
export const ISO_PITCH = Math.atan(1 / Math.SQRT2);

export interface Camera {
  /** Screen right, screen up, and towards the viewer (unit, right-handed). */
  r: Vec3;
  u: Vec3;
  c: Vec3;
}

/** The camera for a blend `iso` (0 = from the top, 1 = isometric) and a turn in quarter turns (may be part way). */
export function camera(iso: number, turn: number): Camera {
  const k = Math.min(1, Math.max(0, iso));
  // From the top the net reads as drawn (x right, y up); isometric looks from the front right.
  const az = -Math.PI / 2 + (Math.PI / 4) * k - (Math.PI / 2) * turn;
  const el = Math.PI / 2 - (Math.PI / 2 - ISO_PITCH) * k;
  const [ca, sa, ce, se] = [Math.cos(az), Math.sin(az), Math.cos(el), Math.sin(el)];
  return { r: [-sa, ca, 0], u: [-se * ca, -se * sa, ce], c: [ce * ca, ce * sa, se] };
}

/** `auto`: from the top while flat, isometric once a quarter folded (smoothstep between). */
export function autoIso(fold: number): number {
  const x = Math.min(1, Math.max(0, fold / 0.25));
  return x * x * (3 - 2 * x);
}

/** The iso blend of a view at a fold. */
export const viewIso = (view: 'auto' | 'top' | 'iso', fold: number): number => (view === 'top' ? 0 : view === 'iso' ? 1 : autoIso(fold));

export interface Projected {
  /** Screen x right, y up (model units). */
  x: number;
  y: number;
  /** Towards the viewer (larger is nearer). */
  z: number;
}

export const project = (p: Vec3, cam: Camera): Projected => ({ x: dot(p, cam.r), y: dot(p, cam.u), z: dot(p, cam.c) });

/** Does the viewer see the side of a face its normal points out of? */
export const facesViewer = (normal: Vec3, cam: Camera): boolean => dot(normal, cam.c) > 0;

const EPS = 1e-7;

/** The order to paint convex faces in, back to front (indices). */
export function paintOrder(faces: readonly (readonly Vec3[])[], cam: Camera): number[] {
  const n = faces.length;
  const flat: P2[][] = faces.map((pts) => pts.map((p) => [dot(p, cam.r), dot(p, cam.u)] as P2));
  const depth = faces.map((pts) => dot(centroid([...pts]), cam.c));
  const planes = faces.map((pts) => {
    let nv = polyNormal(pts);
    if (dot(nv, cam.c) < 0) nv = scale(nv, -1);
    return { n: nv, p: pts[0]!, edgeOn: Math.abs(dot(nv, cam.c)) < 1e-9 || pts.length < 3 };
  });
  /** Every corner of `a` on the far side of `b`'s plane (or on it). */
  const behind = (a: number, b: number) => !planes[b]!.edgeOn && faces[a]!.every((v) => dot(sub(v, planes[b]!.p), planes[b]!.n) <= EPS);
  /** Every corner of `a` on the near side of `b`'s plane (or on it). */
  const before = (a: number, b: number) => !planes[b]!.edgeOn && faces[a]!.every((v) => dot(sub(v, planes[b]!.p), planes[b]!.n) >= -EPS);
  // Boxes first: most pairs do not overlap on the screen at all.
  const box = flat.map((pts) => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [x, y] of pts) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return [x0, x1, y0, y1] as const;
  });
  const apart = (i: number, j: number) => Math.min(box[i]![1], box[j]![1]) - Math.max(box[i]![0], box[j]![0]) < 1e-9 || Math.min(box[i]![3], box[j]![3]) - Math.max(box[i]![2], box[j]![2]) < 1e-9;
  const after: number[][] = faces.map(() => []);
  const incoming = faces.map(() => 0);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (apart(i, j) || !convexOverlap(flat[i]!, flat[j]!)) continue;
      const iFirst = behind(i, j) || before(j, i);
      const jFirst = behind(j, i) || before(i, j);
      if (iFirst === jFirst) continue;
      const [a, b] = iFirst ? [i, j] : [j, i];
      after[a]!.push(b);
      incoming[b]!++;
    }
  const left = new Set(faces.map((_, i) => i));
  const out: number[] = [];
  while (left.size) {
    const ready = [...left].filter((i) => incoming[i] === 0);
    // A cycle: the farthest face of what is left goes first.
    const pool = ready.length ? ready : [...left];
    const next = pool.reduce((a, b) => (depth[b]! < depth[a]! ? b : a));
    left.delete(next);
    out.push(next);
    for (const b of after[next]!) incoming[b]!--;
  }
  return out;
}

/** The nearest face a ray from the viewer through screen point (x, y) meets (`null`: none), and how near. */
export function rayHit(faces: readonly (readonly Vec3[])[], cam: Camera, x: number, y: number): { face: number; t: number; second: number } | null {
  let best: { face: number; t: number } | null = null;
  let second = -Infinity;
  faces.forEach((pts, i) => {
    const nv = polyNormal(pts);
    const dc = dot(nv, cam.c);
    if (Math.abs(dc) < 1e-12) return;
    const t = (dot(nv, pts[0]!) - x * dot(nv, cam.r) - y * dot(nv, cam.u)) / dc;
    const poly = pts.map((p) => [dot(p, cam.r), dot(p, cam.u)] as P2);
    if (!insideConvex(poly, [x, y])) return;
    if (!best || t > best.t) {
      if (best) second = Math.max(second, best.t);
      best = { face: i, t };
    } else second = Math.max(second, t);
  });
  const hit = best as { face: number; t: number } | null;
  return hit ? { ...hit, second } : null;
}

/** A point strictly inside a convex polygon (either winding), at least `margin` from its edges. */
export function insideConvex(poly: readonly P2[], p: P2, margin = 0): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-12) continue;
    const d = ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / L;
    if (Math.abs(d) <= margin) return false;
    const s = Math.sign(d);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return sign !== 0;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** The bounds of projected points. */
export function boundsOf(points: readonly { x: number; y: number }[]): Bounds | null {
  if (points.length === 0) return null;
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

export const unionBounds = (a: Bounds | null, b: Bounds | null): Bounds | null =>
  !a ? b : !b ? a : { minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX), minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY) };

/** Scale and centre so the bounds fill a box (screen y down), at most `maxScale` pixels per unit. */
export interface Fit {
  s: number;
  /** Screen position of the bounds' centre. */
  cx: number;
  cy: number;
  /** The bounds' centre in model units. */
  mx: number;
  my: number;
}

export function fitBounds(b: Bounds, box: { x: number; y: number; w: number; h: number }, maxScale = Infinity): Fit {
  const w = Math.max(1e-6, b.maxX - b.minX);
  const h = Math.max(1e-6, b.maxY - b.minY);
  return { s: Math.min(box.w / w, box.h / h, maxScale), cx: box.x + box.w / 2, cy: box.y + box.h / 2, mx: (b.minX + b.maxX) / 2, my: (b.minY + b.maxY) / 2 };
}

/** A model point on the screen (pixels, y down). */
export const toScreen = (p: { x: number; y: number }, f: Fit): P2 => [f.cx + (p.x - f.mx) * f.s, f.cy - (p.y - f.my) * f.s];

/** Blend two fits (the drawing's scale eased between two states). */
export const mixFit = (a: Fit, b: Fit, k: number): Fit => ({ s: a.s + (b.s - a.s) * k, cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, mx: a.mx + (b.mx - a.mx) * k, my: a.my + (b.my - a.my) * k });
