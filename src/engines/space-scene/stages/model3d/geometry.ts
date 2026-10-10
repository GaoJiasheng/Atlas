/**
 * Geometry for `primitive` parts (docs/03 "搭积木", docs/08 §4).
 *
 * A part becomes one or more *pieces*: a geometry plus optional instance
 * matrices (a flange is a ring + N bolt heads; `fins` and `repeat` are
 * instances). Pieces are in the part's frame: centred on `at`, with the
 * part's `rotation` and `repeat` already applied. A piece drawn once has its
 * transform baked into the geometry (`matrices: null`); otherwise it is drawn
 * as one InstancedMesh.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  LatheGeometry,
  Matrix3,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Part, Primitive } from '../../schema';
import {
  BOLT_HEAD,
  boltHeadRadius,
  finOffsets,
  finPlateSize,
  flangeBore,
  materialSlotKey,
  partMaterialSlots,
  partPrimitives,
  repeatTransforms,
  tubeBendRadius,
} from '../../lib/parts';
import { DEG2RAD } from '../../lib/math';
import { primitiveScale } from '../../lib/parts';
import type { Wing } from '../../lib/wing';
import { shapedPieces } from './shaped';
import { FanDeform, sweepClosed, sweepGeometry, wingMembrane, wingVeins } from './organic';

export interface ShapePiece {
  geometry: BufferGeometry;
  /** Instance transforms in the part frame; `null` = drawn once, transform baked in. */
  matrices: Matrix4[] | null;
  /** Index into the part's material slots (`partMaterialSlots`): 0 = the main primitive's material. */
  slot?: number;
  /** Hairlines (wing veins): drawn as line segments in the part's line material, never picked. */
  lines?: boolean;
  /** A folding wing's piece: redrawn for the part's fan (`geometry` is `fan.output`). */
  fan?: FanDeform;
}

/** A piece of one primitive before placement: geometry, instances, and a material other than the primitive's own. */
export interface BasePiece {
  geometry: BufferGeometry;
  instances: Matrix4[];
  /** Material ref of this piece when it differs from the primitive's `color` (a coil's copper tubes). */
  color?: string;
  /** Line segments (wing veins), kept out of the merged meshes. */
  lines?: boolean;
  /** The folding wing this piece belongs to (kept out of the merged meshes, redrawn for its fan). */
  wing?: Wing;
}

/** Kinds whose surface is closed, so back faces only show through a cut (cut face fill). */
export function isClosedKind(kind: Primitive['kind']): boolean {
  return !['plane', 'tube', 'blades', 'coilBank', 'grille'].includes(kind);
}

/** Closed surface of a whole primitive (a lathe is closed only when its profile starts and ends on the axis). */
export function isClosedPrimitive(p: Primitive): boolean {
  if (p.kind === 'lathe') return p.profile[0]![0] < 1e-9 && p.profile[p.profile.length - 1]![0] < 1e-9;
  if (p.kind === 'sweep') return sweepClosed(p);
  return isClosedKind(p.kind);
}

/* ------------------------------------------------------------------ */
/* Engineered shapes                                                   */
/* ------------------------------------------------------------------ */

/** Lathe with crisp edges at every interior profile point (points are duplicated). */
function crispLathe(profile: readonly [number, number][], segments: number): LatheGeometry {
  const pts: Vector2[] = [];
  profile.forEach(([x, y], i) => {
    pts.push(new Vector2(x, y));
    if (i > 0 && i < profile.length - 1) pts.push(new Vector2(x, y));
  });
  return new LatheGeometry(pts, segments);
}

/** Box with every edge rounded by `bevel` (a real radius, not a chamfer). */
export function bevelBoxGeometry(size: readonly [number, number, number], bevel: number): BufferGeometry {
  return new RoundedBoxGeometry(size[0], size[1], size[2], 3, bevel);
}

/**
 * Polyline with every corner replaced by a circular arc of radius `bend`
 * (shortened where segments are too short), sampled densely enough that a
 * centripetal Catmull-Rom through the samples keeps straight runs straight.
 */
export function filletPath(path: readonly (readonly number[])[], bend: number): Vector3[] {
  const P = path.map((p) => new Vector3(p[0], p[1], p[2]));
  const out: Vector3[] = [P[0]!.clone()];
  const pushLine = (from: Vector3, to: Vector3) => {
    const n = Math.max(1, Math.ceil(from.distanceTo(to) / Math.max(bend * 0.75, 0.02)));
    for (let k = 1; k <= n; k++) out.push(from.clone().lerp(to, k / n));
  };
  let cursor = P[0]!.clone();
  for (let i = 1; i < P.length - 1; i++) {
    const prev = P[i - 1]!;
    const cur = P[i]!;
    const next = P[i + 1]!;
    const a = prev.clone().sub(cur);
    const b = next.clone().sub(cur);
    const la = a.length();
    const lb = b.length();
    a.normalize();
    b.normalize();
    const theta = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
    if (theta > Math.PI - 1e-3 || theta < 1e-3) {
      pushLine(cursor, cur);
      cursor = cur.clone();
      continue;
    }
    let d = bend / Math.tan(theta / 2);
    d = Math.min(d, la * 0.5, lb * 0.5);
    const r = d * Math.tan(theta / 2);
    const t1 = cur.clone().addScaledVector(a, d);
    const t2 = cur.clone().addScaledVector(b, d);
    const c = cur.clone().addScaledVector(a.clone().add(b).normalize(), r / Math.sin(theta / 2));
    pushLine(cursor, t1);
    const u = t1.clone().sub(c);
    const v = t2.clone().sub(c);
    const sweep = u.angleTo(v);
    const steps = Math.max(3, Math.ceil(sweep / (Math.PI / 16)));
    const axis = u.clone().cross(v).normalize();
    for (let k = 1; k <= steps; k++) out.push(c.clone().add(u.clone().applyAxisAngle(axis, (sweep * k) / steps)));
    cursor = t2;
  }
  pushLine(cursor, P[P.length - 1]!);
  return out;
}

export function tubeGeometry(p: Extract<Primitive, { kind: 'tube' }>): BufferGeometry {
  const pts = filletPath(p.path, tubeBendRadius(p));
  const curve = new CatmullRomCurve3(pts, false, 'centripetal');
  const segments = Math.min(480, Math.max(24, Math.ceil(curve.getLength() / (p.radius * 0.6))));
  return new TubeGeometry(curve, segments, p.radius, 18, false);
}

function flangePieces(p: Extract<Primitive, { kind: 'flange' }>): { geometry: BufferGeometry; instances: Matrix4[] }[] {
  const t = p.thickness;
  const bore = flangeBore(p.radius, p.boltRadius);
  const c = Math.min(t * 0.22, (p.radius - bore) * 0.1);
  const ring = crispLathe(
    [
      [bore, -t / 2],
      [p.radius - c, -t / 2],
      [p.radius, -t / 2 + c],
      [p.radius, t / 2 - c],
      [p.radius - c, t / 2],
      [bore, t / 2],
      [bore, -t / 2],
    ],
    72,
  );
  const hr = boltHeadRadius(p);
  const hh = t * BOLT_HEAD.height;
  const head = new CylinderGeometry(hr, hr, hh, 6, 1);
  const instances = Array.from({ length: p.boltCount }, (_, k) => {
    const a = ((k + 0.5) / p.boltCount) * Math.PI * 2;
    return new Matrix4().compose(
      new Vector3(Math.cos(a) * p.boltRadius, t / 2 + hh / 2, Math.sin(a) * p.boltRadius),
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -a),
      new Vector3(1, 1, 1),
    );
  });
  return [
    { geometry: ring, instances: [new Matrix4()] },
    { geometry: head, instances },
  ];
}

/** Vessel profile: domed (semi-ellipsoidal) heads of depth radius × headRatio on a straight shell. */
export function vesselGeometry(p: Extract<Primitive, { kind: 'vessel' }>): BufferGeometry {
  const r = p.radius;
  const half = p.length / 2;
  const h = r * p.headRatio;
  if (h < 1e-6) {
    return crispLathe([[0, -half], [r, -half], [r, half], [0, half]], 64);
  }
  const steps = 14;
  const pts: Vector2[] = [];
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * (Math.PI / 2);
    pts.push(new Vector2(r * Math.sin(a), -half - h * Math.cos(a)));
  }
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * (Math.PI / 2);
    pts.push(new Vector2(r * Math.cos(a), half + h * Math.sin(a)));
  }
  pts[0]!.x = 1e-5;
  pts[pts.length - 1]!.x = 1e-5;
  return new LatheGeometry(pts, 64);
}

/** Segments around the hole of a `panelHole` (the four corners are added on top). */
export const PANEL_HOLE_SEGMENTS = 64;

/**
 * Flat panel w × h (XY), thickness t (Z), with a round through-hole: front
 * and back faces as a ring of quads between the hole and the rectangle (rays
 * from the hole centre, the four corners inserted so the outline stays
 * exact), four outer edge walls and the inner wall of the hole. Built by hand
 * (no Shape / ExtrudeGeometry in the bundle); closed, so a cut fills.
 */
export function panelHoleGeometry(p: Extract<Primitive, { kind: 'panelHole' }>): BufferGeometry {
  const [w, h, t] = p.size;
  const { r } = p.hole;
  const [cx, cy] = p.hole.at;
  const hx = w / 2;
  const hy = h / 2;
  const z = t / 2;

  // Ray angles: even steps plus the four corners, sorted.
  const corners: [number, number][] = [[hx, hy], [-hx, hy], [-hx, -hy], [hx, -hy]];
  const angles = Array.from({ length: PANEL_HOLE_SEGMENTS }, (_, k) => (k / PANEL_HOLE_SEGMENTS) * Math.PI * 2);
  for (const [x, y] of corners) angles.push((Math.atan2(y - cy, x - cx) + Math.PI * 2) % (Math.PI * 2));
  angles.sort((a, b) => a - b);
  const ring = angles.filter((a, i) => i === 0 || a - angles[i - 1]! > 1e-7);

  // Where a ray from the hole centre leaves the rectangle.
  const outer = (a: number): [number, number] => {
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const tx = dx > 1e-12 ? (hx - cx) / dx : dx < -1e-12 ? (-hx - cx) / dx : Infinity;
    const ty = dy > 1e-12 ? (hy - cy) / dy : dy < -1e-12 ? (-hy - cy) / dy : Infinity;
    const k = Math.min(tx, ty);
    return [cx + dx * k, cy + dy * k];
  };
  const inner = (a: number): [number, number] => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const vtx = (x: number, y: number, zz: number, n: [number, number, number], u: number, v: number) => {
    pos.push(x, y, zz);
    nor.push(...n);
    uv.push(u, v);
  };
  const faceUv = (x: number, y: number): [number, number] => [(x + hx) / w, (y + hy) / h];
  const n = ring.length;
  for (let k = 0; k < n; k++) {
    const a0 = ring[k]!;
    const a1 = ring[(k + 1) % n]!;
    const i0 = inner(a0);
    const i1 = inner(a1);
    const o0 = outer(a0);
    const o1 = outer(a1);
    // Front (+Z, counter-clockwise seen from +Z) and back (-Z, reversed).
    for (const [side, sign] of [[z, 1], [-z, -1]] as const) {
      const quad = sign > 0 ? [i0, o0, o1, i0, o1, i1] : [i0, o1, o0, i0, i1, o1];
      for (const [x, y] of quad) vtx(x, y, side, [0, 0, sign], ...faceUv(x, y));
    }
    // Hole wall, facing the hole axis.
    const n0: [number, number, number] = [-Math.cos(a0), -Math.sin(a0), 0];
    const n1: [number, number, number] = [-Math.cos(a1), -Math.sin(a1), 0];
    const u0 = k / n;
    const u1 = (k + 1) / n;
    vtx(i0[0], i0[1], z, n0, u0, 1);
    vtx(i1[0], i1[1], z, n1, u1, 1);
    vtx(i1[0], i1[1], -z, n1, u1, 0);
    vtx(i0[0], i0[1], z, n0, u0, 1);
    vtx(i1[0], i1[1], -z, n1, u1, 0);
    vtx(i0[0], i0[1], -z, n0, u0, 0);
  }
  // Outer edge walls (one quad per side, normals outward).
  const edges: [[number, number], [number, number], [number, number, number]][] = [
    [[hx, -hy], [hx, hy], [1, 0, 0]],
    [[hx, hy], [-hx, hy], [0, 1, 0]],
    [[-hx, hy], [-hx, -hy], [-1, 0, 0]],
    [[-hx, -hy], [hx, -hy], [0, -1, 0]],
  ];
  for (const [a, b, nn] of edges) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    vtx(a[0], a[1], -z, nn, 0, 0);
    vtx(b[0], b[1], -z, nn, len, 0);
    vtx(b[0], b[1], z, nn, len, t);
    vtx(a[0], a[1], -z, nn, 0, 0);
    vtx(b[0], b[1], z, nn, len, t);
    vtx(a[0], a[1], z, nn, 0, t);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  g.computeBoundingSphere();
  return g;
}

/* ------------------------------------------------------------------ */
/* Part -> pieces                                                      */
/* ------------------------------------------------------------------ */

function basePieces(p: Primitive): BasePiece[] {
  let pieces = kindPieces(p);
  if (p.mirror) pieces = pieces.map((piece) => ({ ...piece, geometry: piece.lines ? mirrorLines(piece.geometry, p.mirror!) : mirrorGeometry(piece.geometry, p.mirror!) }));
  // Own-axis scale (a bilateral twin's flip is a negative component): on the instances, so mirrored bakes fix their winding.
  const [sx, sy, sz] = primitiveScale(p);
  if (sx === 1 && sy === 1 && sz === 1) return pieces;
  const S = new Matrix4().makeScale(sx, sy, sz);
  return pieces.map((piece) => ({ ...piece, instances: piece.instances.map((m) => S.clone().multiply(m)) }));
}

/** Reflect line segments (no winding to fix). */
function mirrorLines(g: BufferGeometry, axis: 'x' | 'y' | 'z'): BufferGeometry {
  return g.applyMatrix4(new Matrix4().makeScale(axis === 'x' ? -1 : 1, axis === 'y' ? -1 : 1, axis === 'z' ? -1 : 1));
}

/** Reflect a geometry in the plane normal to `axis` (winding fixed so faces still face out). */
export function mirrorGeometry(g: BufferGeometry, axis: 'x' | 'y' | 'z'): BufferGeometry {
  const s = new Vector3(axis === 'x' ? -1 : 1, axis === 'y' ? -1 : 1, axis === 'z' ? -1 : 1);
  const out = g.index ? g.toNonIndexed() : g;
  if (out !== g) g.dispose();
  out.applyMatrix4(new Matrix4().makeScale(s.x, s.y, s.z));
  flipWinding(out);
  return out;
}

/** Swap the 2nd and 3rd vertex of every triangle of a non-indexed geometry. */
function flipWinding(g: BufferGeometry): void {
  for (const name of Object.keys(g.attributes)) {
    const a = g.getAttribute(name) as BufferAttribute;
    const n = a.itemSize;
    const arr = a.array as Float32Array;
    for (let i = 0; i + 2 < a.count; i += 3) {
      for (let k = 0; k < n; k++) {
        const t = arr[(i + 1) * n + k]!;
        arr[(i + 1) * n + k] = arr[(i + 2) * n + k]!;
        arr[(i + 2) * n + k] = t;
      }
    }
    a.needsUpdate = true;
  }
}

function kindPieces(p: Primitive): BasePiece[] {
  const one = (geometry: BufferGeometry) => [{ geometry, instances: [new Matrix4()] }];
  switch (p.kind) {
    case 'box':
      return one(new BoxGeometry(p.size[0], p.size[1], p.size[2]));
    case 'cylinder':
      return one(new CylinderGeometry(p.size[0], p.size[1], p.size[2], 48, 1));
    case 'cone':
      return one(new ConeGeometry(p.size[0], p.size[1], 48, 1));
    case 'sphere':
      return one(new SphereGeometry(p.size[0], 48, 32));
    case 'torus':
      return one(new TorusGeometry(p.size[0], p.size[1], 24, 72));
    case 'capsule':
      return one(new CapsuleGeometry(p.size[0], p.size[1], 8, 32));
    case 'plane':
      return one(new PlaneGeometry(p.size[0], p.size[1]));
    case 'bevelBox':
      return one(bevelBoxGeometry(p.size, p.bevel));
    case 'tube':
      return one(tubeGeometry(p));
    case 'flange':
      return flangePieces(p);
    case 'fins': {
      const [x, y, z] = finPlateSize(p);
      return [
        {
          geometry: new BoxGeometry(x, y, z),
          instances: finOffsets(p).map((o) => new Matrix4().makeTranslation(o[0], o[1], o[2])),
        },
      ];
    }
    case 'vessel':
      return one(vesselGeometry(p));
    case 'panelHole':
      return one(panelHoleGeometry(p));
    case 'lathe':
    case 'extrude':
    case 'curvedPanel':
    case 'blades':
    case 'coilBank':
    case 'grille':
      return shapedPieces(p);
    case 'sweep':
      return one(sweepGeometry(p));
    case 'wing': {
      const fold = p.fold ? { wing: p } : {};
      const veins = wingVeins(p);
      return [
        { geometry: wingMembrane(p), instances: [new Matrix4()], ...fold },
        ...(veins ? [{ geometry: veins, instances: [new Matrix4()], lines: true, ...fold }] : []),
      ];
    }
  }
}

function eulerMatrix(rotation: readonly number[] | undefined): Matrix4 {
  const [rx = 0, ry = 0, rz = 0] = rotation ?? [0, 0, 0];
  return new Matrix4().makeRotationFromEuler(new Euler(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD, 'XYZ'));
}

function repeatMatrices(part: Pick<Part, 'repeat'>): Matrix4[] {
  return repeatTransforms(part.repeat).map((t) => {
    const m = t.rotation;
    return new Matrix4().set(m[0], m[1], m[2], t.offset[0], m[3], m[4], m[5], t.offset[1], m[6], m[7], m[8], t.offset[2], 0, 0, 0, 1);
  });
}

/** Vertices a part may bake into one merged mesh per material before it stays instanced. */
const MERGE_BUDGET = 400_000;

/**
 * Pieces of a whole part: the main primitive and every `extra` (placed
 * relative to the main `at`), repeated with the part. All pieces that share a
 * material slot are baked into one merged geometry (one draw call per
 * material); a slot that would exceed the vertex budget stays instanced.
 */
export function partPieces(part: Pick<Part, 'primitive' | 'repeat'> & { extra?: Part['extra'] }): ShapePiece[] {
  const main = part.primitive;
  if (!main) return [];
  const slots = partMaterialSlots(part);
  const keys = slots.map((s) => materialSlotKey(s.color, s.tint));
  const reps = repeatMatrices(part);
  const bySlot = new Map<number, { geometry: BufferGeometry; matrices: Matrix4[] }[]>();
  const out: ShapePiece[] = [];
  for (const p of partPrimitives(part)) {
    const place = new Matrix4()
      .makeTranslation(p.at[0] - main.at[0], p.at[1] - main.at[1], p.at[2] - main.at[2])
      .multiply(eulerMatrix(p.rotation));
    for (const piece of basePieces(p)) {
      const slot = keys.indexOf(materialSlotKey(piece.color ?? p.color, piece.color ? undefined : p.tint));
      const matrices = reps.flatMap((r) => piece.instances.map((m) => r.clone().multiply(place).multiply(m)));
      // Folding wings and vein lines stay their own pieces.
      if (piece.wing) {
        const fan = new FanDeform(piece.wing, piece.geometry, matrices, piece.lines === true);
        out.push({ geometry: fan.output, matrices: null, slot, fan, ...(piece.lines ? { lines: true } : {}) });
        continue;
      }
      if (piece.lines) {
        out.push({ geometry: bakeLines(piece.geometry, matrices), matrices: null, slot, lines: true });
        continue;
      }
      bySlot.set(slot, [...(bySlot.get(slot) ?? []), { geometry: piece.geometry, matrices }]);
    }
  }
  const merged: ShapePiece[] = [];
  for (const [slot, list] of [...bySlot.entries()].sort((a, b) => a[0] - b[0])) {
    const verts = list.reduce((n, l) => n + l.geometry.getAttribute('position').count * l.matrices.length, 0);
    if (verts <= MERGE_BUDGET || list.some((l) => l.matrices.some((m) => m.determinant() < 0))) {
      merged.push({ geometry: mergeBaked(list), matrices: null, slot });
      continue;
    }
    for (const l of list) {
      if (l.matrices.length === 1) {
        l.geometry.applyMatrix4(l.matrices[0]!);
        merged.push({ geometry: l.geometry, matrices: null, slot });
      } else merged.push({ geometry: l.geometry, matrices: l.matrices, slot });
    }
  }
  // Meshes first (slot order), then wing membranes, then lines.
  return [...merged, ...out.filter((p) => !p.lines), ...out.filter((p) => p.lines)];
}

/** Line segments copied once per placement into one geometry. Disposes the input. */
function bakeLines(g: BufferGeometry, matrices: Matrix4[]): BufferGeometry {
  const src = g.getAttribute('position');
  const pos = new Float32Array(src.count * 3 * matrices.length);
  const v = new Vector3();
  matrices.forEach((m, i) => {
    for (let j = 0; j < src.count; j++) {
      v.fromBufferAttribute(src, j).applyMatrix4(m);
      pos.set([v.x, v.y, v.z], (i * src.count + j) * 3);
    }
  });
  g.dispose();
  const out = new BufferGeometry();
  out.setAttribute('position', new BufferAttribute(pos, 3));
  out.computeBoundingSphere();
  return out;
}

/**
 * Bake every instance of every geometry into one non-indexed geometry with
 * position, normal and uv (missing uvs are zero; mirrored transforms get
 * their winding fixed). Disposes the inputs.
 */
export function mergeBaked(list: { geometry: BufferGeometry; matrices: Matrix4[] }[]): BufferGeometry {
  const flat = list.map((l) => {
    const g = l.geometry.index ? l.geometry.toNonIndexed() : l.geometry;
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    return { g, src: l.geometry, matrices: l.matrices };
  });
  const total = flat.reduce((n, f) => n + f.g.getAttribute('position').count * f.matrices.length, 0);
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const v = new Vector3();
  const nm = new Matrix3();
  let o = 0;
  for (const { g, src, matrices } of flat) {
    const P = g.getAttribute('position');
    const N = g.getAttribute('normal');
    const U = g.getAttribute('uv');
    for (const m of matrices) {
      nm.getNormalMatrix(m);
      const flip = m.determinant() < 0;
      for (let i = 0; i < P.count; i++) {
        // Mirrored: write each triangle as (0, 2, 1).
        const j = flip ? i - (i % 3) + [0, 2, 1][i % 3]! : i;
        v.fromBufferAttribute(P, j).applyMatrix4(m);
        pos.set([v.x, v.y, v.z], (o + i) * 3);
        v.fromBufferAttribute(N, j).applyMatrix3(nm).normalize();
        nor.set([v.x, v.y, v.z], (o + i) * 3);
        if (U) uv.set([U.getX(j), U.getY(j)], (o + i) * 2);
      }
      o += P.count;
    }
    if (g !== src) g.dispose();
    src.dispose();
  }
  const out = new BufferGeometry();
  out.setAttribute('position', new BufferAttribute(pos, 3));
  out.setAttribute('normal', new BufferAttribute(nor, 3));
  out.setAttribute('uv', new BufferAttribute(uv, 2));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

/** Pieces of a primitive part (rotation and repeat applied; see module doc). */
export function primitivePieces(part: Pick<Part, 'primitive' | 'repeat'>): ShapePiece[] {
  const p = part.primitive;
  if (!p) return [];
  const [rx = 0, ry = 0, rz = 0] = p.rotation ?? [0, 0, 0];
  const rot = new Matrix4().makeRotationFromEuler(new Euler(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD, 'XYZ'));
  const reps = repeatTransforms(part.repeat).map((t) => {
    const m = t.rotation;
    return new Matrix4()
      .set(m[0], m[1], m[2], t.offset[0], m[3], m[4], m[5], t.offset[1], m[6], m[7], m[8], t.offset[2], 0, 0, 0, 1)
      .multiply(rot);
  });
  return basePieces(p).map(({ geometry, instances }) => {
    const matrices = reps.flatMap((r) => instances.map((m) => r.clone().multiply(m)));
    if (matrices.length === 1) {
      geometry.applyMatrix4(matrices[0]!);
      return { geometry, matrices: null };
    }
    return { geometry, matrices };
  });
}
