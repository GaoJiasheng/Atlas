/**
 * Net geometry (docs/39 §3.2, model A8): a flat layout of faces — unit
 * squares on the grid, rectangles on the grid, or faces each hung on
 * another (a tree) — turned into a hinge tree; where every face lies flat;
 * where it is when the net is folded part way (each face turns about its
 * hinge, in layers: the bottom first, the sides, then the top); and what
 * folding all the way gives: the solid closes, or two faces land on the
 * same face, a face is left open, a rectangle is the wrong size. The solid
 * is placed on the face left on the ground. Also the names of the 11 nets of
 * a cube, the overlap test of a flat layout and the standard net of each
 * solid. Pure: no DOM, no zod.
 */
import type { NetLayout, NetSpec, SolidSpec } from '../schema';
import { add, cross, dot, norm, polyNormal, scale, solid, sub, unit, type Polyhedron, type Vec3 } from './solid';

export type P2 = [number, number];
type Rect = [number, number, number, number];

/* ------------------------------------------------------------------ */
/* The 11 nets of a cube                                                */
/* ------------------------------------------------------------------ */

export const CUBE_NET_NAMES = ['141-a', '141-b', '141-c', '141-d', '141-e', '141-f', '231-a', '231-b', '231-c', '33', '222'] as const;
export type CubeNetName = (typeof CUBE_NET_NAMES)[number];

const ROW: P2[] = [
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];
/** The 11 nets of a cube (docs/39 §3.2): y up; a row of 4 lies on y = 1, x = 0–3. */
export const CUBE_NETS: Record<CubeNetName, P2[]> = {
  '141-a': [...ROW, [0, 2], [0, 0]],
  '141-b': [...ROW, [1, 2], [0, 0]],
  '141-c': [...ROW, [2, 2], [0, 0]],
  '141-d': [...ROW, [3, 2], [0, 0]],
  '141-e': [...ROW, [1, 2], [1, 0]],
  '141-f': [...ROW, [2, 2], [1, 0]],
  '231-a': [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]],
  '231-b': [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  '231-c': [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
  '33': [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
  '222': [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
};

/** The 8 ways to turn and flip a set of cells, each moved to start at (0, 0). */
export function cellImages(cells: readonly P2[]): P2[][] {
  const out: P2[][] = [];
  for (let k = 0; k < 8; k++) {
    const q = cells.map(([x0, y0]) => {
      let x = x0;
      let y = y0;
      for (let r = 0; r < k % 4; r++) [x, y] = [-y, x];
      return (k >= 4 ? [-x, y] : [x, y]) as P2;
    });
    const mx = Math.min(...q.map((p) => p[0]));
    const my = Math.min(...q.map((p) => p[1]));
    out.push(q.map(([x, y]) => [x - mx, y - my] as P2).sort((a, b) => a[0] - b[0] || a[1] - b[1]));
  }
  return out;
}

/** A set of cells written the same whichever way it is turned or flipped (free polyomino). */
export function canonicalCells(cells: readonly P2[]): string {
  return cellImages(cells)
    .map((c) => c.map((p) => p.join(',')).join(' '))
    .sort()[0]!;
}

const NAME_BY_SHAPE = new Map(CUBE_NET_NAMES.map((n) => [canonicalCells(CUBE_NETS[n]), n]));

/** The cube net a set of cells is, turned or flipped (`null`: none of the 11). */
export const cubeNetName = (cells: readonly P2[]): CubeNetName | null => NAME_BY_SHAPE.get(canonicalCells(cells)) ?? null;

/** Every position of every cube net in a box of `cols` × `rows` cells (turned, flipped, moved), in CUBE_NETS order. */
export function cubeNetPlacements(cols: number, rows: number): { name: CubeNetName; cells: P2[] }[] {
  const out: { name: CubeNetName; cells: P2[] }[] = [];
  for (const name of CUBE_NET_NAMES) {
    const seen = new Set<string>();
    for (const img of cellImages(CUBE_NETS[name])) {
      const key = img.map((p) => p.join(',')).join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      const w = Math.max(...img.map((p) => p[0])) + 1;
      const h = Math.max(...img.map((p) => p[1])) + 1;
      for (let dy = 0; dy + h <= rows; dy++) for (let dx = 0; dx + w <= cols; dx++) out.push({ name, cells: img.map(([x, y]) => [x + dx, y + dy] as P2) });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* The net                                                              */
/* ------------------------------------------------------------------ */

export interface NetNode {
  /** The face flat on the ground, in the layout's coordinates (squares, y up). */
  poly: P2[];
  /** `"x,y"` (a cell), the rectangle's index, the face id (a tree; a second piece of a face `face#2`). */
  key: string;
  /** A tree: the face it is. */
  face: string | null;
  parent: number | null;
  /** The edge it turns about (flat coordinates), shared with its parent. */
  hinge: [P2, P2] | null;
  /** The angle it turns through when folded all the way (π − the angle between the two faces inside the solid). */
  angle: number;
  /** Steps from the face on the ground (0: that face). */
  depth: number;
}

export interface TargetFace {
  id: string;
  /** The face of the folded solid, in the world (the solid on the ground face, z up). */
  pts: Vec3[];
}

export interface Net {
  solid: SolidSpec;
  layout: 'cells' | 'rects' | 'tree';
  nodes: NetNode[];
  root: number;
  /** The solid's faces where the folded net should put them. */
  target: TargetFace[];
  /** A face left out on purpose. */
  open: string | null;
}

/** The layout of a net spec: its own, the named cube net's cells, or the solid's standard net. */
export function layoutOf(spec: NetSpec & { solid: SolidSpec }): NetLayout {
  const l = spec.layout;
  if (l && 'cubeNet' in l) return { cells: CUBE_NETS[l.cubeNet].map((p) => [...p] as P2) };
  return l ?? standardLayout(spec.solid);
}

/** A solid's standard net: the cross of a cube or a cuboid, a prism's sides in a row with its ends on the first, a pyramid's star. */
export function standardLayout(s: SolidSpec): NetLayout {
  if (s.type === 'cuboid') {
    const [l, w, h] = s.size;
    if (l === 1 && w === 1 && h === 1) return { cells: CUBE_NETS['141-e'].map((p) => [...p] as P2) };
    return {
      rects: [
        [h, h, l, w],
        [h, 0, l, h],
        [h, h + w, l, h],
        [0, h, h, w],
        [h + l, h, h, w],
        [h, 2 * h + w, l, w],
      ],
    };
  }
  if (s.type === 'prism') {
    const sides = Array.from({ length: s.sides }, (_, k) => `side-${k + 1}`);
    if (s.sides === 3) return { tree: [['side-1', null], ...sides.slice(1).map((f, k) => [f, sides[k]!] as [string, string]), ['end-a', 'side-1'], ['end-b', 'side-1']] };
    return { tree: [['end-a', null], ...sides.map((f) => [f, 'end-a'] as [string, string]), ['end-b', 'side-1']] };
  }
  if (s.type === 'pyramid') return { tree: [['base', null], ...Array.from({ length: s.sides }, (_, k) => [`side-${k + 1}`, 'base'] as [string, string])] };
  return { tree: [] };
}

const rectPoly = ([x, y, w, h]: Rect): P2[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** The part of an edge two grid rectangles share (positive length), or `null`. */
export function sharedSegment(a: Rect, b: Rect): [P2, P2] | null {
  const [ax, ay, aw, ah] = a;
  const [bx, by, bw, bh] = b;
  if (ax + aw === bx || bx + bw === ax) {
    const x = ax + aw === bx ? bx : ax;
    const lo = Math.max(ay, by);
    const hi = Math.min(ay + ah, by + bh);
    if (hi > lo) return [
      [x, lo],
      [x, hi],
    ];
  }
  if (ay + ah === by || by + bh === ay) {
    const y = ay + ah === by ? by : ay;
    const lo = Math.max(ax, bx);
    const hi = Math.min(ax + aw, bx + bw);
    if (hi > lo) return [
      [lo, y],
      [hi, y],
    ];
  }
  return null;
}

/** Resolve a net's base (the face on the ground) among grid rectangles: a cell, an index, else the one with most neighbours. */
function gridBase(rects: Rect[], base: NetSpec['base'], cells: boolean): number {
  if (Array.isArray(base)) {
    const i = rects.findIndex((r) => r[0] === base[0] && r[1] === base[1]);
    if (i >= 0) return i;
  }
  if (typeof base === 'number' && base < rects.length && !cells) return base;
  let best = 0;
  let most = -1;
  rects.forEach((r, i) => {
    const n = rects.filter((q, j) => j !== i && sharedSegment(r, q)).length;
    if (n > most) {
      most = n;
      best = i;
    }
  });
  return best;
}

/** The box a grid net folds into, standing on its root rectangle: the root is the bottom, its sides front (y−), back, left (x−), right. */
function gridTarget(root: Rect, s: SolidSpec): TargetFace[] {
  const size = s.type === 'cuboid' ? [...s.size] : [1, 1, 1];
  const [x, y, w, h] = root;
  for (const v of [w, h]) {
    const k = size.indexOf(v);
    if (k >= 0) size.splice(k, 1);
  }
  const H = size.length === 1 ? size[0]! : (size.at(-1) ?? 1);
  const X = x + w;
  const Y = y + h;
  return [
    { id: 'bottom', pts: [[x, y, 0], [x, Y, 0], [X, Y, 0], [X, y, 0]] },
    { id: 'top', pts: [[x, y, H], [X, y, H], [X, Y, H], [x, Y, H]] },
    { id: 'front', pts: [[x, y, 0], [X, y, 0], [X, y, H], [x, y, H]] },
    { id: 'back', pts: [[x, Y, 0], [x, Y, H], [X, Y, H], [X, Y, 0]] },
    { id: 'left', pts: [[x, y, 0], [x, y, H], [x, Y, H], [x, Y, 0]] },
    { id: 'right', pts: [[X, y, 0], [X, Y, 0], [X, Y, H], [X, y, H]] },
  ];
}

/** Breadth-first hinge tree of grid rectangles from `root` (neighbours in list order). */
function gridTree(rects: Rect[], root: number): { parent: (number | null)[]; hinge: ([P2, P2] | null)[]; depth: number[] } {
  const parent: (number | null)[] = rects.map(() => null);
  const hinge: ([P2, P2] | null)[] = rects.map(() => null);
  const depth = rects.map(() => -1);
  depth[root] = 0;
  const queue = [root];
  while (queue.length) {
    const i = queue.shift()!;
    rects.forEach((r, j) => {
      if (depth[j]! >= 0) return;
      const seg = sharedSegment(rects[i]!, r);
      if (!seg) return;
      parent[j] = i;
      hinge[j] = seg;
      depth[j] = depth[i]! + 1;
      queue.push(j);
    });
  }
  return { parent, hinge, depth };
}

/** The map from the solid to the world that puts face `rootId` on the ground (z = 0), the solid above it. */
function placement(p: Polyhedron, rootId: string): (v: Vec3) => Vec3 {
  const f = p.faces.find((x) => x.id === rootId) ?? p.faces[0]!;
  const v0 = p.vertices[f.poly[0]!]!;
  const e1 = unit(sub(p.vertices[f.poly[1]!]!, v0));
  const n = polyNormal(f.poly.map((i) => p.vertices[i]!));
  const e2 = cross(e1, n);
  return (v) => {
    const d = sub(v, v0);
    return [dot(d, e1), dot(d, e2), -dot(d, n)];
  };
}

/** A net from its spec (a polyhedron's: a curved solid's net is `lib/curved.ts`). */
export function buildNet(spec: NetSpec & { solid: SolidSpec }): Net {
  const layout = layoutOf(spec);
  const open = spec.open ?? null;
  if ('cells' in layout || 'rects' in layout) {
    const cells = 'cells' in layout;
    const rects: Rect[] = cells ? layout.cells.map(([x, y]) => [x, y, 1, 1] as Rect) : layout.rects.map((r) => [...r] as Rect);
    const root = gridBase(rects, spec.base, cells);
    const { parent, hinge, depth } = gridTree(rects, root);
    const nodes: NetNode[] = rects.map((r, i) => ({ poly: rectPoly(r), key: cells ? `${r[0]},${r[1]}` : String(i), face: null, parent: parent[i]!, hinge: hinge[i]!, angle: Math.PI / 2, depth: Math.max(0, depth[i]!) }));
    return { solid: spec.solid, layout: cells ? 'cells' : 'rects', nodes, root, target: gridTarget(rects[root]!, spec.solid), open };
  }
  if (!('tree' in layout)) throw new Error('a net needs a layout');
  const p = solid(spec.solid);
  const entries = layout.tree;
  if (!p || entries.length === 0) return { solid: spec.solid, layout: 'tree', nodes: [], root: 0, target: [], open };
  const rootAt = Math.max(0, entries.findIndex(([, par]) => par === null));
  const rootFace = entries[rootAt]![0];
  const place = placement(p, rootFace);
  const world = p.vertices.map(place);
  const target: TargetFace[] = p.faces.map((f) => ({ id: f.id, pts: f.poly.map((i) => world[i]!) }));
  // Keys: the face id, a second piece of the same face `face#2`.
  const count = new Map<string, number>();
  const keys = entries.map(([face]) => {
    const n = (count.get(face) ?? 0) + 1;
    count.set(face, n);
    return n === 1 ? face : `${face}#${n}`;
  });
  const nodes: NetNode[] = entries.map(([face], i) => ({ poly: [], key: keys[i]!, face, parent: null, hinge: null, angle: 0, depth: 0 }));
  const flatOf: Map<number, P2>[] = entries.map(() => new Map());
  const rootPoly = p.faces.find((f) => f.id === rootFace)?.poly ?? [];
  for (const vi of rootPoly) flatOf[rootAt]!.set(vi, [world[vi]![0], world[vi]![1]]);
  nodes[rootAt]!.poly = rootPoly.map((vi) => flatOf[rootAt]!.get(vi)!);
  // Hang each face on the first piece of its parent face that is already laid out.
  const placed = new Set([rootAt]);
  for (let pass = 0; pass < entries.length && placed.size < entries.length; pass++) {
    entries.forEach(([face, par], i) => {
      if (placed.has(i) || par === null) return;
      const pi = [...placed].find((j) => entries[j]![0] === par);
      if (pi === undefined) return;
      const adj = p.adjacency.get(par)?.find((a) => a.face === face);
      const poly = p.faces.find((f) => f.id === face)?.poly;
      if (!adj || !poly) return;
      const [a, b] = adj.edge;
      const fa = flatOf[pi]!.get(a)!;
      const fb = flatOf[pi]!.get(b)!;
      const u: P2 = (() => {
        const d: P2 = [fb[0] - fa[0], fb[1] - fa[1]];
        const L = Math.hypot(d[0], d[1]);
        return [d[0] / L, d[1] / L];
      })();
      let n2: P2 = [-u[1], u[0]];
      const cp = centroid2(nodes[pi]!.poly);
      if ((cp[0] - fa[0]) * n2[0] + (cp[1] - fa[1]) * n2[1] > 0) n2 = [-n2[0], -n2[1]];
      const Wa = world[a]!;
      const eab = unit(sub(world[b]!, Wa));
      for (const vi of poly) {
        const rv = sub(world[vi]!, Wa);
        const along = dot(rv, eab);
        const perp = norm(sub(rv, scale(eab, along)));
        flatOf[i]!.set(vi, [fa[0] + u[0] * along + n2[0] * perp, fa[1] + u[1] * along + n2[1] * perp]);
      }
      nodes[i] = { ...nodes[i]!, poly: poly.map((vi) => flatOf[i]!.get(vi)!), parent: pi, hinge: [fa, fb], angle: Math.PI - adj.dihedral, depth: nodes[pi]!.depth + 1 };
      placed.add(i);
    });
  }
  return { solid: spec.solid, layout: 'tree', nodes, root: rootAt, target, open };
}

const centroid2 = (pts: readonly P2[]): P2 => [pts.reduce((s, p) => s + p[0], 0) / Math.max(1, pts.length), pts.reduce((s, p) => s + p[1], 0) / Math.max(1, pts.length)];

/* ------------------------------------------------------------------ */
/* Folding                                                              */
/* ------------------------------------------------------------------ */

/** A rigid motion: p ↦ R p + t (R row-major 3 × 3). */
export interface Rigid {
  R: number[];
  t: Vec3;
}
const IDENTITY: Rigid = { R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };
const mulR = (A: number[], B: number[]): number[] => {
  const out: number[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push(A[3 * r]! * B[c]! + A[3 * r + 1]! * B[3 + c]! + A[3 * r + 2]! * B[6 + c]!);
  return out;
};
const rotV = (R: number[], v: Vec3): Vec3 => [R[0]! * v[0] + R[1]! * v[1] + R[2]! * v[2], R[3]! * v[0] + R[4]! * v[1] + R[5]! * v[2], R[6]! * v[0] + R[7]! * v[1] + R[8]! * v[2]];
export const applyRigid = (M: Rigid, p: Vec3): Vec3 => add(rotV(M.R, p), M.t);
const compose = (A: Rigid, B: Rigid): Rigid => ({ R: mulR(A.R, B.R), t: add(rotV(A.R, B.t), A.t) });
/** The turn by θ about the line through `a` along `u` (unit). */
function turnAbout(a: Vec3, u: Vec3, theta: number): Rigid {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const [x, y, z] = u;
  const R = [c + x * x * (1 - c), x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, y * x * (1 - c) + z * s, c + y * y * (1 - c), y * z * (1 - c) - x * s, z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, c + z * z * (1 - c)];
  return { R, t: sub(a, rotV(R, a)) };
}

/** How far each face is folded (0–1) for a net fold of `t`: in layers when staggered (each layer's window half over the next one's). */
export function layerFolds(net: Net, t: number, stagger = true): number[] {
  const D = Math.max(0, ...net.nodes.map((n) => n.depth));
  return net.nodes.map((n) => {
    if (n.parent === null) return 0;
    if (!stagger || D <= 1) return clamp01(t);
    const start = (n.depth - 1) / (D + 1);
    const end = (n.depth + 1) / (D + 1);
    return clamp01((t - start) / (end - start));
  });
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The per-face folds a spec asks for (`fold` a number, or by face key). */
export function specFolds(net: Net, fold: NetSpec['fold'], stagger: boolean, fallback: number): number[] {
  if (fold === undefined || typeof fold === 'number') return layerFolds(net, fold ?? fallback, stagger);
  const out = net.nodes.map(() => 0);
  for (const [key, v] of Object.entries(fold)) {
    const i = nodeIndex(net, key);
    if (i !== null) out[i] = v;
  }
  return out;
}

/** Each face's motion from flat to where it is, for per-face folds. */
export function nodeMotions(net: Net, folds: readonly number[]): Rigid[] {
  const out: (Rigid | null)[] = net.nodes.map(() => null);
  const of = (i: number): Rigid => {
    const done = out[i];
    if (done) return done;
    const n = net.nodes[i]!;
    if (n.parent === null || !n.hinge) return (out[i] = IDENTITY);
    const [a2, b2] = n.hinge;
    const a: Vec3 = [a2[0], a2[1], 0];
    let u = unit([b2[0] - a2[0], b2[1] - a2[1], 0]);
    const c = centroid2(n.poly);
    const away: Vec3 = [c[0] - a2[0], c[1] - a2[1], 0];
    // Turning by +θ lifts the face (z up): u × (the way to the face) points up.
    if (cross(u, away)[2] < 0) u = scale(u, -1);
    return (out[i] = compose(of(n.parent), turnAbout(a, u, n.angle * (folds[i] ?? 0))));
  };
  return net.nodes.map((_, i) => of(i));
}

/** Each face's corners in the world for these folds. */
export function foldedPolys(net: Net, folds: readonly number[]): Vec3[][] {
  const motions = nodeMotions(net, folds);
  return net.nodes.map((n, i) => n.poly.map(([x, y]) => applyRigid(motions[i]!, [x, y, 0])));
}

/** The outward normal of each face (the side that is outside the folded solid; flat, it faces the ground). */
export function outsideNormals(net: Net, folds: readonly number[]): Vec3[] {
  return nodeMotions(net, folds).map((M) => rotV(M.R, [0, 0, -1]));
}

/* ------------------------------------------------------------------ */
/* What folding all the way gives                                       */
/* ------------------------------------------------------------------ */

export interface FoldResult {
  /** The solid closes: every face covered exactly once by a face the right size, nothing on the open face. */
  closes: boolean;
  /** The solid face each piece lands on (`null`: none, a piece the wrong size inside or outside). */
  lands: (string | null)[];
  /** The piece is the face exactly (not too short, too long, off its place). */
  exact: boolean[];
  covered: string[];
  /** Pieces that land on the same face. */
  overlaps: [number, number][];
  /** Faces nothing lands on (the open face aside). */
  missing: string[];
  /** Pieces the wrong size or in the wrong place on their face. */
  sizeMismatch: number[];
  /** The piece on the face opposite piece `i`'s (`null`: none). */
  opposite(i: number): number | null;
}

const EPS = 1e-6;

/** Fold the net all the way and see what it makes. */
export function foldResult(net: Net): FoldResult {
  const polys = foldedPolys(net, net.nodes.map(() => 1));
  const planes = net.target.map((f) => ({ id: f.id, n: polyNormal(f.pts), p: f.pts[0]! }));
  const lands = polys.map((pts) => planes.find((pl) => pts.every((v) => Math.abs(dot(sub(v, pl.p), pl.n)) < EPS))?.id ?? null);
  const exact = polys.map((pts, i) => {
    const f = net.target.find((x) => x.id === lands[i]);
    return !!f && f.pts.length === pts.length && pts.every((v) => f.pts.some((w) => norm(sub(v, w)) < EPS));
  });
  const overlaps: [number, number][] = [];
  for (let i = 0; i < polys.length; i++)
    for (let j = i + 1; j < polys.length; j++) {
      if (lands[i] === null || lands[i] !== lands[j]) continue;
      const pl = planes.find((x) => x.id === lands[i])!;
      if (convexOverlap(inPlane(polys[i]!, pl.n), inPlane(polys[j]!, pl.n))) overlaps.push([i, j]);
    }
  const covered = [...new Set(lands.filter((l, i): l is string => l !== null && exact[i]!))];
  const missing = net.target.map((f) => f.id).filter((id) => id !== net.open && !lands.includes(id));
  const sizeMismatch = polys.map((_, i) => i).filter((i) => !exact[i]);
  const onOpen = net.open !== null && lands.includes(net.open);
  const once = net.target.every((f) => f.id === net.open || lands.filter((l, i) => l === f.id && exact[i]).length === 1);
  const closes = net.nodes.length > 0 && missing.length === 0 && overlaps.length === 0 && sizeMismatch.length === 0 && !onOpen && once;
  const opposite = (i: number): number | null => {
    const id = lands[i];
    const pl = planes.find((x) => x.id === id);
    if (!pl) return null;
    const o = planes.find((x) => dot(x.n, pl.n) < -1 + 1e-9);
    if (!o) return null;
    const j = lands.findIndex((l, k) => l === o.id && exact[k]);
    return j >= 0 ? j : null;
  };
  return { closes, lands, exact, covered, overlaps, missing, sizeMismatch, opposite };
}

/** A polygon on a plane, in two coordinates of that plane. */
function inPlane(pts: readonly Vec3[], n: Vec3): P2[] {
  const a: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = unit(cross(n, a));
  const e2 = cross(n, e1);
  return pts.map((p) => [dot(p, e1), dot(p, e2)]);
}

/** Two convex polygons overlap with positive area (touching along an edge does not count). */
export function convexOverlap(a: readonly P2[], b: readonly P2[]): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]!;
      const q = poly[(i + 1) % poly.length]!;
      const nx = q[1] - p[1];
      const ny = p[0] - q[0];
      const L = Math.hypot(nx, ny);
      if (L < 1e-12) continue;
      let aMin = Infinity;
      let aMax = -Infinity;
      let bMin = Infinity;
      let bMax = -Infinity;
      for (const v of a) {
        const d = (v[0] * nx + v[1] * ny) / L;
        if (d < aMin) aMin = d;
        if (d > aMax) aMax = d;
      }
      for (const v of b) {
        const d = (v[0] * nx + v[1] * ny) / L;
        if (d < bMin) bMin = d;
        if (d > bMax) bMax = d;
      }
      if (Math.min(aMax, bMax) - Math.max(aMin, bMin) < 1e-9) return false;
    }
  }
  return true;
}

/** Faces of a flat layout that lie over each other (validate refuses a net that overlaps before it is folded). */
export function flatOverlap(net: Net): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < net.nodes.length; i++) for (let j = i + 1; j < net.nodes.length; j++) if (convexOverlap(net.nodes[i]!.poly, net.nodes[j]!.poly)) out.push([i, j]);
  return out;
}

/** Faces not joined to the face on the ground (a layout in two pieces, or a tree face hung on a face it does not share an edge with). */
export function looseNodes(net: Net): number[] {
  return net.nodes.map((n, i) => (i !== net.root && n.parent === null ? i : -1)).filter((i) => i >= 0);
}

/** A node by key: `"[1,1]"` / `"1,1"` (a cell), `"2"` (a piece's index), a face id (a tree's face, else the face a piece lands on). */
export function nodeIndex(net: Net, key: string): number | null {
  const k = key.replace(/[[\]\s]/g, '');
  if (/^\d+,\d+$/.test(k)) {
    const i = net.nodes.findIndex((n) => n.key === k);
    return i >= 0 ? i : null;
  }
  if (/^\d+$/.test(k)) return Number(k) < net.nodes.length ? Number(k) : null;
  const byKey = net.nodes.findIndex((n) => n.key === k);
  if (byKey >= 0) return byKey;
  if (net.layout === 'tree') return null;
  const lands = foldResult(net).lands;
  const i = lands.indexOf(k);
  return i >= 0 ? i : null;
}

/** The flat net's cells (a cell layout), for the names and the quick signs. */
export function netCells(net: Net): P2[] | null {
  if (net.layout !== 'cells') return null;
  return net.nodes.map((n) => n.key.split(',').map(Number) as P2);
}

/** The faces a net is cut from, in the layout's order: how many and of which shape (a piece the wrong size is still a rectangle). */
export function pieceShapes(net: Net): ('square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon')[] {
  return net.nodes.map((n) => {
    if (n.poly.length === 3) return 'triangle';
    if (n.poly.length === 5) return 'pentagon';
    if (n.poly.length === 6) return 'hexagon';
    const a = Math.hypot(n.poly[1]![0] - n.poly[0]![0], n.poly[1]![1] - n.poly[0]![1]);
    const b = Math.hypot(n.poly[2]![0] - n.poly[1]![0], n.poly[2]![1] - n.poly[1]![1]);
    return Math.abs(a - b) < 1e-9 ? 'square' : 'rectangle';
  });
}

/** The flat net's bounding box (layout squares). */
export function flatBox(net: Net): { x: number; y: number; w: number; h: number } {
  const pts = net.nodes.flatMap((n) => n.poly);
  if (pts.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
