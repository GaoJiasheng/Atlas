/**
 * The solids of model A8 `net` (docs/39 §3.1): a cuboid (a cube when its
 * three lengths are equal), a prism on a regular base of 3–6 sides, a
 * pyramid on a regular base (a regular tetrahedron with `regular`), and the
 * curved solids (cylinder, cone, sphere) with their sizes and the kinds of
 * face they have. A polyhedron is its vertices, its faces (an id each and a
 * polygon of vertex indices, counter-clockwise seen from outside), which
 * faces share which edge, and the angle inside the solid between them.
 * Lengths are grid squares; z is up. Pure: no DOM, no zod.
 */
import type { SolidClass, SolidSpec } from '../schema';

export type Vec3 = [number, number, number];

export interface SolidFace {
  id: string;
  /** Vertex indices, counter-clockwise seen from outside (the outward normal by the right-hand rule). */
  poly: number[];
  kind: 'flat';
}

export interface Adjacent {
  face: string;
  /** The shared edge's two vertex indices. */
  edge: [number, number];
  /** The angle between the two faces inside the solid (radians). */
  dihedral: number;
}

export interface Polyhedron {
  vertices: Vec3[];
  faces: SolidFace[];
  adjacency: Map<string, Adjacent[]>;
}

/* ------------------------------------------------------------------ */
/* Vectors                                                              */
/* ------------------------------------------------------------------ */

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const unit = (a: Vec3): Vec3 => {
  const n = norm(a);
  return n === 0 ? [0, 0, 0] : scale(a, 1 / n);
};
export const centroid = (pts: readonly Vec3[]): Vec3 => scale(pts.reduce<Vec3>((s, p) => add(s, p), [0, 0, 0]), 1 / Math.max(1, pts.length));

/** A polygon's normal (Newell's method, unit; counter-clockwise points it at the viewer). */
export function polyNormal(pts: readonly Vec3[]): Vec3 {
  const n: Vec3 = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    n[0] += (a[1] - b[1]) * (a[2] + b[2]);
    n[1] += (a[2] - b[2]) * (a[0] + b[0]);
    n[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return unit(n);
}

/* ------------------------------------------------------------------ */
/* The catalogue                                                        */
/* ------------------------------------------------------------------ */

/** The name a solid goes by (a cuboid with three equal lengths is a cube, docs/39 D9). */
export function solidClass(spec: SolidSpec): SolidClass {
  if (spec.type === 'cuboid') return spec.size[0] === spec.size[1] && spec.size[1] === spec.size[2] ? 'cube' : 'cuboid';
  return spec.type;
}

/** Does the solid have curved faces (no polygon net)? */
export const isCurved = (spec: SolidSpec): spec is Extract<SolidSpec, { type: 'cylinder' | 'cone' | 'sphere' }> => spec.type === 'cylinder' || spec.type === 'cone' || spec.type === 'sphere';

/** A regular n-gon's vertices in the plane z = h, edge `e`, centred on the z axis, the first edge's midpoint on −y. */
function ngon(n: number, e: number, h: number): Vec3[] {
  const R = e / (2 * Math.sin(Math.PI / n));
  const start = -Math.PI / 2 - Math.PI / n;
  return Array.from({ length: n }, (_, k) => [R * Math.cos(start + (2 * Math.PI * k) / n), R * Math.sin(start + (2 * Math.PI * k) / n), h] as Vec3);
}

/** A pyramid's height: given, or the regular tetrahedron's (edge × √(2/3)). */
export function pyramidHeight(spec: Extract<SolidSpec, { type: 'pyramid' }>): number {
  if (spec.regular) return spec.edge * Math.sqrt(2 / 3);
  return spec.height ?? spec.edge;
}

/** A cone's slant height (the radius of its curved face opened out). */
export const slant = (radius: number, height: number): number => Math.hypot(radius, height);

/** The polyhedron of a solid (`null`: a curved solid). */
export function solid(spec: SolidSpec): Polyhedron | null {
  let vertices: Vec3[];
  let faces: { id: string; poly: number[] }[];
  if (spec.type === 'cuboid') {
    const [l, w, h] = spec.size;
    vertices = [
      [0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0],
      [0, 0, h], [l, 0, h], [l, w, h], [0, w, h],
    ];
    faces = [
      { id: 'bottom', poly: [0, 1, 2, 3] },
      { id: 'top', poly: [4, 5, 6, 7] },
      { id: 'front', poly: [0, 1, 5, 4] },
      { id: 'back', poly: [3, 2, 6, 7] },
      { id: 'left', poly: [0, 3, 7, 4] },
      { id: 'right', poly: [1, 2, 6, 5] },
    ];
  } else if (spec.type === 'prism') {
    const n = spec.sides;
    vertices = [...ngon(n, spec.edge, 0), ...ngon(n, spec.edge, spec.length)];
    faces = [
      { id: 'end-a', poly: Array.from({ length: n }, (_, k) => k) },
      { id: 'end-b', poly: Array.from({ length: n }, (_, k) => n + k) },
      ...Array.from({ length: n }, (_, k) => ({ id: `side-${k + 1}`, poly: [k, (k + 1) % n, n + ((k + 1) % n), n + k] })),
    ];
  } else if (spec.type === 'pyramid') {
    const n = spec.sides;
    vertices = [...ngon(n, spec.edge, 0), [0, 0, pyramidHeight(spec)]];
    faces = [{ id: 'base', poly: Array.from({ length: n }, (_, k) => k) }, ...Array.from({ length: n }, (_, k) => ({ id: `side-${k + 1}`, poly: [k, (k + 1) % n, n] }))];
  } else return null;
  // Every polygon counter-clockwise seen from outside (the solid is convex: outside is away from its centre).
  const mid = centroid(vertices);
  const oriented: SolidFace[] = faces.map((f) => {
    const pts = f.poly.map((i) => vertices[i]!);
    const out = dot(polyNormal(pts), sub(centroid(pts), mid)) > 0;
    return { id: f.id, poly: out ? f.poly : [...f.poly].reverse(), kind: 'flat' };
  });
  const adjacency = new Map<string, Adjacent[]>(oriented.map((f) => [f.id, []]));
  for (const a of oriented) {
    for (const b of oriented) {
      if (a === b) continue;
      const edge = sharedEdge(a.poly, b.poly);
      if (!edge) continue;
      const na = polyNormal(a.poly.map((i) => vertices[i]!));
      const nb = polyNormal(b.poly.map((i) => vertices[i]!));
      adjacency.get(a.id)!.push({ face: b.id, edge, dihedral: Math.PI - Math.acos(Math.max(-1, Math.min(1, dot(na, nb)))) });
    }
  }
  return { vertices, faces: oriented, adjacency };
}

/** The edge two polygons share (consecutive in both), as the first one's order. */
function sharedEdge(a: readonly number[], b: readonly number[]): [number, number] | null {
  for (let i = 0; i < a.length; i++) {
    const p = a[i]!;
    const q = a[(i + 1) % a.length]!;
    const j = b.indexOf(q);
    if (j >= 0 && b[(j + 1) % b.length] === p) return [p, q];
  }
  return null;
}

/** The face of a polyhedron by id. */
export const faceOf = (p: Polyhedron, id: string): SolidFace | undefined => p.faces.find((f) => f.id === id);

/** The face ids of a solid, polyhedral or curved (`bottom` · `top` · `side` of a cylinder, `base` · `side` of a cone, `surface` of a sphere). */
export function faceIds(spec: SolidSpec): string[] {
  if (spec.type === 'cylinder') return ['bottom', 'top', 'side'];
  if (spec.type === 'cone') return ['base', 'side'];
  if (spec.type === 'sphere') return ['surface'];
  return solid(spec)!.faces.map((f) => f.id);
}

/** Two faces share an edge (they meet when folded). */
export function shareEdge(spec: SolidSpec, a: string, b: string): boolean {
  const p = solid(spec);
  return !!p?.adjacency.get(a)?.some((x) => x.face === b);
}

/** The face opposite a face (the parallel one, its outward normal reversed), if any. */
export function oppositeFace(spec: SolidSpec, id: string): string | null {
  const p = solid(spec);
  const f = p ? faceOf(p, id) : undefined;
  if (!p || !f) return null;
  const n = polyNormal(f.poly.map((i) => p.vertices[i]!));
  const o = p.faces.find((g) => dot(polyNormal(g.poly.map((i) => p.vertices[i]!)), n) < -1 + 1e-9);
  return o?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* What the faces are (the SOLID card, the face-count diagnosis)       */
/* ------------------------------------------------------------------ */

export type FaceShape = 'square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon' | 'circle' | 'curved';

/** The shape of each face of a solid, in the catalogue's order. */
export function faceShapes(spec: SolidSpec): FaceShape[] {
  if (spec.type === 'cylinder') return ['circle', 'circle', 'curved'];
  if (spec.type === 'cone') return ['circle', 'curved'];
  if (spec.type === 'sphere') return ['curved'];
  const p = solid(spec)!;
  return p.faces.map((f) => polygonShape(f.poly.map((i) => p.vertices[i]!)));
}

/** The name of a flat polygon (a four-sided face is a square when its sides are equal). */
export function polygonShape(pts: readonly Vec3[]): FaceShape {
  if (pts.length === 3) return 'triangle';
  if (pts.length === 5) return 'pentagon';
  if (pts.length === 6) return 'hexagon';
  const a = norm(sub(pts[1]!, pts[0]!));
  const b = norm(sub(pts[2]!, pts[1]!));
  return Math.abs(a - b) < 1e-9 ? 'square' : 'rectangle';
}

/** Faces by shape, the base's shape first (`2 triangles · 3 rectangles`, `1 square · 4 triangles`). */
export function faceCounts(spec: SolidSpec): { shape: FaceShape; n: number }[] {
  const shapes = faceShapes(spec);
  return [...new Set(shapes)].map((shape) => ({ shape, n: shapes.filter((s) => s === shape).length }));
}

/** Flat faces and curved faces. */
export function flatAndCurved(spec: SolidSpec): { flat: number; curved: number } {
  const shapes = faceShapes(spec);
  return { flat: shapes.filter((s) => s !== 'curved').length, curved: shapes.filter((s) => s === 'curved').length };
}

/** The lengths of a solid's edges, each once (`face-size` reads a length a child gives against these). */
export function edgeLengths(spec: SolidSpec): number[] {
  const p = solid(spec);
  if (!p) return [];
  const out = new Set<number>();
  for (const f of p.faces) for (let i = 0; i < f.poly.length; i++) out.add(Math.round(norm(sub(p.vertices[f.poly[(i + 1) % f.poly.length]!]!, p.vertices[f.poly[i]!]!)) * 1e6) / 1e6);
  return [...out].sort((a, b) => a - b);
}

/** Two solids the same up to turning and flipping (the same class and the same sizes). */
export function sameSolid(a: SolidSpec, b: SolidSpec): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'cuboid' && b.type === 'cuboid') return [...a.size].sort((x, y) => x - y).join() === [...b.size].sort((x, y) => x - y).join();
  if (a.type === 'prism' && b.type === 'prism') return a.sides === b.sides && a.edge === b.edge && a.length === b.length;
  if (a.type === 'pyramid' && b.type === 'pyramid') return a.sides === b.sides && a.edge === b.edge && Math.abs(pyramidHeight(a) - pyramidHeight(b)) < 1e-9;
  if (a.type === 'sphere' && b.type === 'sphere') return a.radius === b.radius;
  if ((a.type === 'cylinder' && b.type === 'cylinder') || (a.type === 'cone' && b.type === 'cone')) return a.radius === b.radius && a.height === b.height;
  return false;
}

/** Vertices, edges and faces of a polyhedron (a geometric self-check: V − E + F = 2; never shown in the lesson, docs/39 D7). */
export function eulerCounts(p: Polyhedron): { v: number; e: number; f: number } {
  const edges = new Set<string>();
  for (const f of p.faces) for (let i = 0; i < f.poly.length; i++) {
    const a = f.poly[i]!;
    const b = f.poly[(i + 1) % f.poly.length]!;
    edges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  }
  return { v: p.vertices.length, e: edges.size, f: p.faces.length };
}
