/**
 * What the stage draws of a net (docs/39 §3.2–3.4), pure so it can be
 * tested: a spec as a shape (a polyhedron's net, a cylinder's or a cone's,
 * a sphere), a pose (how far each face is folded, the view between top and
 * isometric, the turn), poses eased into each other (a staggered fold eases
 * its overall fold, so the layers go one after the other), the faces in the
 * world for a pose, the flat outline (the footprint), the pair colour of
 * each face, and the drawing's scale: for a transition, the union of the
 * start, the end and eight states between, reached in its first 30 % and
 * then held, so nothing jumps or shakes. Pure: no DOM.
 */
import type { CurvedNetSpec, Lesson, Model, NetModelSpec, NetSpec, SolidClass, SolidSpec } from '../schema';
import { buildNet, foldedPolys, layerFolds, outsideNormals, specFolds, type Net, type P2 } from './net';
import { curvedPieces, type CurvedPiece } from './curved';
import { boundsOf, camera, fitBounds, mixFit, project, unionBounds, viewIso, type Bounds, type Camera, type Fit } from './project';
import { isCurved, solidClass, sub, type Vec3 } from './solid';
import { foldResult } from './net';

export type NetShape =
  | { kind: 'poly'; solid: SolidSpec; net: Net }
  | { kind: 'curved'; solid: SolidSpec; curved: CurvedNetSpec | undefined }
  | { kind: 'sphere'; solid: SolidSpec };

/** A net spec with its solid (a set's items carry their own). */
export type SolidNet = NetSpec & { solid: SolidSpec };

/** The solids a lesson shows (its spec row), in the catalogue's order. */
export function lessonSolids(lesson: Lesson): SolidClass[] {
  const seen = new Set<SolidClass>();
  const visit = (m: Model | undefined) => {
    if (m?.kind === 'net') for (const s of netItems(m)) seen.add(solidClass(s.solid));
  };
  for (const st of lesson.steps) {
    for (const b of st.beats) visit(b.model);
    for (const t of st.pool) [t.model, ...(t.kind === 'choose' ? t.options.map((o) => o.model) : [])].forEach(visit);
  }
  return SOLID_ORDER.filter((c) => seen.has(c));
}
const SOLID_ORDER: SolidClass[] = ['cube', 'cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere'];

/** The pictures of a model: its set's items, or itself. */
export const netItems = (m: NetModelSpec): SolidNet[] => (m.set ?? [m]).filter((x): x is SolidNet => !!x.solid);

const shapes = new WeakMap<object, NetShape>();

/** The shape a spec draws (memoised per spec object). */
export function shapeOf(spec: SolidNet): NetShape {
  const hit = shapes.get(spec);
  if (hit) return hit;
  const s: NetShape = spec.solid.type === 'sphere' ? { kind: 'sphere', solid: spec.solid } : isCurved(spec.solid) ? { kind: 'curved', solid: spec.solid, curved: spec.curved } : { kind: 'poly', solid: spec.solid, net: buildNet(spec) };
  shapes.set(spec, s);
  return s;
}

/** The fold a spec shows when it does not say: folded without a layout, flat with one. */
export const defaultFold = (spec: SolidNet): number => (spec.layout || spec.curved ? 0 : 1);

/** The spec's fold as one number (per-face folds: the most folded). */
export function foldOf(spec: SolidNet): number {
  const f = spec.fold;
  if (typeof f === 'number') return f;
  if (f && Object.keys(f).length) return Math.max(...Object.values(f));
  return defaultFold(spec);
}

export interface Pose {
  /** The overall fold of a staggered (or a curved) net; `null`: per-face folds as given. */
  t: number | null;
  stagger: boolean;
  folds: number[];
  iso: number;
  view: 'auto' | 'top' | 'iso';
  /** How far an `auto` view tips over as it folds (1: to the isometric view; an open box is looked into from higher up). */
  tilt: number;
  turn: number;
  /** The point the views turn about (the flat net's centre on the ground): it stays put on the screen whichever way it is seen. */
  origin: Vec3;
}

/** The centre of a shape's flat net on the ground (a sphere: its foot). */
export function originOf(shape: NetShape): Vec3 {
  const pts: P2[] = shape.kind === 'poly' ? shape.net.nodes.flatMap((n) => n.poly) : shape.kind === 'curved' ? curvedPieces(shape.solid, shape.curved, 0).flatMap((p) => p.pts.map((v) => [v[0], v[1]] as P2)) : [[0, 0]];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, 0];
}
const origins = new WeakMap<NetShape, Vec3>();
const originFor = (shape: NetShape): Vec3 => {
  const hit = origins.get(shape);
  if (hit) return hit;
  const o = originOf(shape);
  origins.set(shape, o);
  return o;
};

/**
 * An open box seen from the isometric height hides its bottom behind its front walls (a cube's exactly): an `auto` view
 * of a net with an open face tips over only this far (about 60° down instead of 35°), so the inside shows.
 */
export const OPEN_TILT = 0.55;
const tiltedIso = (view: Pose['view'], fold: number, tilt: number): number => (view === 'auto' ? viewIso('auto', fold) * tilt : viewIso(view, fold));

/** A shape's folds for an overall fold `t`. */
export function foldsAt(shape: NetShape, t: number, stagger: boolean): number[] {
  if (shape.kind === 'poly') return layerFolds(shape.net, t, stagger);
  if (shape.kind === 'curved') return [t];
  return [];
}

/** The pose a spec asks for (`fold` and `turn` may be overridden: the FOLD slider, the turn buttons). */
export function specPose(shape: NetShape, spec: SolidNet, over: { fold?: number | null; turn?: number | null } = {}): Pose {
  const scalar = over.fold ?? (typeof spec.fold === 'object' ? null : (spec.fold ?? defaultFold(spec)));
  const t = scalar === null ? null : scalar;
  const folds = t !== null ? foldsAt(shape, t, spec.stagger) : shape.kind === 'poly' ? specFolds(shape.net, spec.fold, spec.stagger, defaultFold(spec)) : [foldOf(spec)];
  const view = shape.kind === 'sphere' ? 'iso' : spec.view;
  const tilt = spec.open ? OPEN_TILT : 1;
  return { t, stagger: spec.stagger, folds, iso: tiltedIso(view, t ?? foldOf(spec), tilt), view, tilt, turn: over.turn ?? spec.turn, origin: originFor(shape) };
}

/** A pose `k` of the way from `a` to `b` (an overall fold eases as one, so a staggered fold goes layer by layer). */
export function mixPose(shape: NetShape, a: Pose, b: Pose, k: number): Pose {
  const lerp = (x: number, y: number) => x + (y - x) * k;
  if (a.t !== null && b.t !== null) {
    const t = lerp(a.t, b.t);
    const tilt = lerp(a.tilt, b.tilt);
    return { ...b, t, folds: foldsAt(shape, t, b.stagger), iso: a.view === 'auto' && b.view === 'auto' ? tiltedIso('auto', t, tilt) : lerp(a.iso, b.iso), tilt, turn: lerp(a.turn, b.turn) };
  }
  return { ...b, t: null, folds: b.folds.map((v, i) => lerp(a.folds[i] ?? 0, v)), iso: lerp(a.iso, b.iso), tilt: lerp(a.tilt, b.tilt), turn: lerp(a.turn, b.turn) };
}

export interface WorldFace {
  pts: Vec3[];
  /** The side outside the folded solid. */
  outside: Vec3;
  /** A polyhedron's net: the piece; a curved net: `null`. */
  node: number | null;
  /** A curved net's piece: its face and strip. */
  piece: CurvedPiece | null;
  /** Edges drawn in ink. */
  outline: number[];
}

/** The faces in the world for a pose. */
export function worldFaces(shape: NetShape, pose: Pose): WorldFace[] {
  if (shape.kind === 'poly') {
    const polys = foldedPolys(shape.net, pose.folds);
    const normals = outsideNormals(shape.net, pose.folds);
    return polys.map((pts, i) => ({ pts, outside: normals[i]!, node: i, piece: null, outline: pts.map((_, k) => k) }));
  }
  if (shape.kind === 'curved') return curvedPieces(shape.solid, shape.curved, pose.folds[0] ?? 0).map((p) => ({ pts: p.pts, outside: p.outside, node: null, piece: p, outline: p.outline }));
  return [];
}

/** The flat outline of a shape: the edges no two flat faces share (a footprint, dashed). */
export function flatOutline(shape: NetShape): [Vec3, Vec3][] {
  const polys: P2[][] = shape.kind === 'poly' ? shape.net.nodes.map((n) => n.poly) : shape.kind === 'curved' ? curvedPieces(shape.solid, shape.curved, 0).map((p) => p.pts.map((v) => [v[0], v[1]] as P2)) : [];
  return outlineSegments(polys).map(([a, b]) => [
    [a[0], a[1], 0],
    [b[0], b[1], 0],
  ]);
}

/** The parts of polygon edges no other polygon has an edge along (the outline of a flat net). */
export function outlineSegments(polys: readonly (readonly P2[])[]): [P2, P2][] {
  const edges = polys.flatMap((poly, i) => poly.map((p, k) => ({ i, a: p, b: poly[(k + 1) % poly.length]! })));
  const out: [P2, P2][] = [];
  for (const e of edges) {
    const d: P2 = [e.b[0] - e.a[0], e.b[1] - e.a[1]];
    const L = Math.hypot(d[0], d[1]);
    if (L < 1e-9) continue;
    const along = (v: P2) => ((v[0] - e.a[0]) * d[0] + (v[1] - e.a[1]) * d[1]) / L;
    const off = (v: P2) => Math.abs((v[0] - e.a[0]) * d[1] - (v[1] - e.a[1]) * d[0]) / L;
    // Intervals of this edge covered by another polygon's edge on the same line.
    const covered: [number, number][] = [];
    for (const f of edges) {
      if (f.i === e.i || off(f.a) > 1e-7 || off(f.b) > 1e-7) continue;
      const lo = Math.max(0, Math.min(along(f.a), along(f.b)));
      const hi = Math.min(L, Math.max(along(f.a), along(f.b)));
      if (hi - lo > 1e-9) covered.push([lo, hi]);
    }
    covered.sort((x, y) => x[0] - y[0]);
    let at = 0;
    const point = (s: number): P2 => [e.a[0] + (d[0] * s) / L, e.a[1] + (d[1] * s) / L];
    for (const [lo, hi] of covered) {
      if (lo > at + 1e-9) out.push([point(at), point(lo)]);
      at = Math.max(at, hi);
    }
    if (at < L - 1e-9) out.push([point(at), point(L)]);
  }
  return out;
}

/** Squared paper under a flat net: the lines one square apart over its box and one square round it. */
export function gridLines(shape: NetShape, margin = 1): [Vec3, Vec3][] {
  if (shape.kind !== 'poly') return [];
  const pts = shape.net.nodes.flatMap((n) => n.poly);
  if (!pts.length) return [];
  const x0 = Math.floor(Math.min(...pts.map((p) => p[0]))) - margin;
  const x1 = Math.ceil(Math.max(...pts.map((p) => p[0]))) + margin;
  const y0 = Math.floor(Math.min(...pts.map((p) => p[1]))) - margin;
  const y1 = Math.ceil(Math.max(...pts.map((p) => p[1]))) + margin;
  const out: [Vec3, Vec3][] = [];
  for (let x = x0; x <= x1; x++) out.push([[x, y0, 0], [x, y1, 0]]);
  for (let y = y0; y <= y1; y++) out.push([[x0, y, 0], [x1, y, 0]]);
  return out;
}

/** A box of squared paper (a free complete-net task): cols × rows from the origin. */
export function boxLines(cols: number, rows: number): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  for (let x = 0; x <= cols; x++) out.push([[x, 0, 0], [x, rows, 0]]);
  for (let y = 0; y <= rows; y++) out.push([[0, y, 0], [cols, y, 0]]);
  return out;
}

/** The camera of a pose. */
export const poseCamera = (p: Pose): Camera => camera(p.iso, p.turn);

/** A point of the world as a pose sees it (about its origin). */
export const projectPose = (p: Vec3, pose: Pose, cam: Camera = poseCamera(pose)) => project(sub(p, pose.origin), cam);

/** A sphere's centre and radius (it sits on the ground). */
export const sphereOf = (s: SolidSpec): { c: Vec3; r: number } => ({ c: [0, 0, s.type === 'sphere' ? s.radius : 0], r: s.type === 'sphere' ? s.radius : 0 });

/** The projected bounds of a pose, with what is drawn on the ground (the footprint, squared paper). */
export function poseBounds(shape: NetShape, pose: Pose, ground: [Vec3, Vec3][] = []): Bounds | null {
  const cam = poseCamera(pose);
  if (shape.kind === 'sphere') {
    const { c, r } = sphereOf(shape.solid);
    const p = projectPose(c, pose, cam);
    return { minX: p.x - r, maxX: p.x + r, minY: p.y - r, maxY: p.y + r };
  }
  const pts = [...worldFaces(shape, pose).flatMap((f) => f.pts), ...ground.flat()];
  return boundsOf(pts.map((p) => projectPose(p, pose, cam)));
}

/** The bounds over a transition: the start, the end and eight states between. */
export function transitionBounds(shape: NetShape, from: Pose, to: Pose, ground: [Vec3, Vec3][] = []): Bounds | null {
  let b: Bounds | null = null;
  for (let i = 0; i <= 9; i++) b = unionBounds(b, poseBounds(shape, mixPose(shape, from, to, i / 9), ground));
  return b;
}

/** The share of a transition in which the scale moves to the transition's fit (then it holds). */
export const FIT_SHARE = 0.3;

/** The fit at `k` (0–1) of a transition from the fit on show `a` to the transition's fit `b`. */
export function transitionFit(a: Fit, b: Fit, k: number): Fit {
  const x = Math.min(1, Math.max(0, k / FIT_SHARE));
  return mixFit(a, b, x * x * (3 - 2 * x));
}

/** The fit of bounds in a box with room round them (a share of the box each side), the drawing at most `maxH` high. */
export function fitIn(b: Bounds, box: { x: number; y: number; w: number; h: number }, pad = 0.06, maxH = Infinity): Fit {
  const h = Math.min(box.h * (1 - 2 * pad), maxH);
  const inner = { x: box.x + box.w * pad, y: box.y + (box.h - h) / 2, w: box.w * (1 - 2 * pad), h };
  return fitBounds(b, inner);
}

/* ------------------------------------------------------------------ */
/* Pair colours                                                         */
/* ------------------------------------------------------------------ */

/** The pair a face's colour comes from (0–2, ● ▲ ■): a cuboid's three pairs, a prism's two ends; `null`: none. */
export function pairOf(solid: SolidSpec, face: string | null): 0 | 1 | 2 | null {
  if (!face) return null;
  if (solid.type === 'cuboid') {
    const pairs = [['bottom', 'top'], ['front', 'back'], ['left', 'right']];
    const k = pairs.findIndex((p) => p.includes(face));
    return k < 0 ? null : (k as 0 | 1 | 2);
  }
  if (solid.type === 'prism') return face === 'end-a' || face === 'end-b' ? 0 : null;
  return null;
}

/** The face each piece of a polyhedron's net lands on when folded (`null`: none). */
export function landedFaces(shape: NetShape): (string | null)[] {
  return shape.kind === 'poly' ? foldResult(shape.net).lands : [];
}
