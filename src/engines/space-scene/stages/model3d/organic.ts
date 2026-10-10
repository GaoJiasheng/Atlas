/**
 * WebGL builders of the organic primitive kinds (maths in lib/sweep.ts and
 * lib/wing.ts):
 *
 *  - sweep: a lofted tube along its stations; elliptical or U section, an
 *    optional wall (inner surface, end rings / U edges), round / flat caps
 *  - wing: a thin membrane (top, bottom and edge faces, subdivided so a fold
 *    can pleat it) plus its veins as line segments on both faces; a folding
 *    wing is redrawn for its fan by `FanDeform` (CPU, a few thousand
 *    vertices, only while the fan changes)
 *
 * Everything is in the primitive's own frame; geometry.ts places it.
 */
import { BufferAttribute, BufferGeometry, Matrix4, ShapeUtils, Vector2, Vector3 } from 'three';
import { sweepLoops, sweepSection, sweepStations, sweepWall, type Sweep } from '../../lib/sweep';
import { fanFrame, fanPoint, outlineArea, restFan, type FanFrame, type Wing } from '../../lib/wing';

/* ------------------------------------------------------------------ */
/* sweep                                                               */
/* ------------------------------------------------------------------ */

interface Ring {
  c: readonly number[];
  t: readonly number[];
  n: readonly number[];
  b: readonly number[];
  r: number;
  /** Surface-normal tilt towards the tangent (radius slope, cap curvature). */
  tilt: number;
  /** Normal blend towards ±t (round caps): 0 = radial. */
  cap: number;
  s: number;
}

/** Radial vertices around a sweep (per surface). */
export function sweepRadial(p: Sweep): number {
  return p.radial ?? (sweepSection(p).open > 0 ? 20 : 16);
}

export function sweepGeometry(p: Sweep): BufferGeometry {
  const { stations, length, loop } = sweepStations(p);
  const { flat, open } = sweepSection(p);
  const wall = sweepWall(p);
  const R = sweepRadial(p);
  const caps = loop ? 'none' : p.caps;
  const rMean = stations.reduce((n, st) => n + st.r, 0) / Math.max(1, stations.length);
  const uScale = 1 / (2 * Math.PI * Math.max(rMean, 1e-4));
  const th0 = open > 0 ? -Math.PI / 2 + open / 2 : 0;
  const th1 = open > 0 ? (3 * Math.PI) / 2 - open / 2 : 2 * Math.PI;

  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const vtx = (p3: readonly number[], n3: readonly number[], u: number, v: number) => {
    pos.push(p3[0]!, p3[1]!, p3[2]!);
    const l = Math.hypot(n3[0]!, n3[1]!, n3[2]!) || 1;
    nor.push(n3[0]! / l, n3[1]! / l, n3[2]! / l);
    uv.push(u, v);
    return pos.length / 3 - 1;
  };
  const point = (g: Ring, th: number, r: number): number[] => {
    const cx = Math.cos(th) * r;
    const sy = Math.sin(th) * r * flat;
    return [0, 1, 2].map((i) => g.c[i]! + g.b[i]! * cx + g.n[i]! * sy);
  };
  const normal = (g: Ring, th: number, sign: number): number[] => {
    const rad = [0, 1, 2].map((i) => g.b[i]! * Math.cos(th) + (g.n[i]! * Math.sin(th)) / flat);
    const l = Math.hypot(rad[0]!, rad[1]!, rad[2]!) || 1;
    const k = Math.cos(g.cap);
    return [0, 1, 2].map((i) => sign * ((rad[i]! / l) * k - g.t[i]! * g.tilt) + g.t[i]! * Math.sin(g.cap));
  };

  // Outer surface rings: stations, plus dome rings for round caps (solid only).
  const base: Ring[] = stations.map((st) => ({ c: st.p, t: st.t, n: st.n, b: st.b, r: st.r, tilt: st.dr, cap: 0, s: st.s }));
  let outer = base;
  if (caps === 'round' && wall === 0) {
    const Q = 6;
    const dome = (g: Ring, dir: 1 | -1): Ring[] =>
      Array.from({ length: Q }, (_, q) => {
        const phi = ((q + 1) / Q) * (Math.PI / 2);
        const c = [0, 1, 2].map((i) => g.c[i]! + g.t[i]! * dir * g.r * Math.sin(phi));
        return { ...g, c, r: g.r * Math.cos(phi) + (q === Q - 1 ? 1e-6 : 0), tilt: 0, cap: dir * phi, s: g.s + dir * g.r * Math.sin(phi) };
      });
    outer = [...dome(base[0]!, -1).reverse(), ...base, ...dome(base[base.length - 1]!, 1)];
  }

  const grid = (rings: Ring[], inset: number, sign: 1 | -1, close: boolean) => {
    const start = pos.length / 3;
    rings.forEach((g) => {
      for (let j = 0; j <= R; j++) {
        const th = th0 + ((th1 - th0) * j) / R;
        const r = Math.max(g.r * 0.08, g.r - inset);
        vtx(point(g, th, r), normal(g, th, sign), g.s * uScale, j / R);
      }
    });
    const rows = rings.length;
    const last = close ? rows : rows - 1;
    for (let k = 0; k < last; k++) {
      const k1 = (k + 1) % rows;
      for (let j = 0; j < R; j++) {
        const a = start + k * (R + 1) + j;
        const b = start + k1 * (R + 1) + j;
        const c = b + 1;
        const d = a + 1;
        if (sign > 0) idx.push(a, b, d, b, c, d);
        else idx.push(a, d, b, b, d, c);
      }
    }
    return start;
  };

  const outerStart = grid(outer, 0, 1, loop);
  if (wall > 0) {
    const innerStart = grid(base, wall, -1, loop);
    const ring = (k: number, j: number, inner: boolean) => (inner ? innerStart : outerStart) + k * (R + 1) + j;
    // U edges: strips joining outer and inner along both lips of the opening.
    if (open > 0) {
      for (const [j, side] of [[0, -1], [R, 1]] as const) {
        const rows = base.length;
        const s0 = pos.length / 3;
        base.forEach((g, k) => {
          const th = th0 + ((th1 - th0) * j) / R;
          // Edge normal: along the arc direction, outward from the opening.
          const tn = [0, 1, 2].map((i) => side * (-g.b[i]! * Math.sin(th) + g.n[i]! * Math.cos(th) * flat));
          const o = pos.slice(ring(k, j, false) * 3, ring(k, j, false) * 3 + 3);
          const n = pos.slice(ring(k, j, true) * 3, ring(k, j, true) * 3 + 3);
          vtx(o, tn, g.s * uScale, 0);
          vtx(n, tn, g.s * uScale, 1);
        });
        for (let k = 0; k < rows - 1; k++) {
          const a = s0 + k * 2;
          const b = s0 + (k + 1) * 2;
          if (side > 0) idx.push(a, b, a + 1, b, b + 1, a + 1);
          else idx.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    // Ends: the wall's cross-section (a ring, or a U band).
    if (!loop && caps !== 'none') {
      for (const [k, dir] of [[0, -1], [base.length - 1, 1]] as const) {
        const g = base[k]!;
        const s0 = pos.length / 3;
        for (let j = 0; j <= R; j++) {
          const o = pos.slice(ring(k, j, false) * 3, ring(k, j, false) * 3 + 3);
          const n = pos.slice(ring(k, j, true) * 3, ring(k, j, true) * 3 + 3);
          const tn = g.t.map((x) => x * dir);
          vtx(o, tn, j / R, 0);
          vtx(n, tn, j / R, 1);
        }
        for (let j = 0; j < R; j++) {
          const a = s0 + j * 2;
          const b = s0 + (j + 1) * 2;
          if (dir > 0) idx.push(a, a + 1, b, b, a + 1, b + 1);
          else idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
  } else if (caps === 'flat') {
    for (const [k, dir] of [[0, -1], [base.length - 1, 1]] as const) {
      const g = base[k]!;
      const tn = g.t.map((x) => x * dir);
      const centre = vtx(g.c, tn, 0.5, 0.5);
      const s0 = pos.length / 3;
      for (let j = 0; j <= R; j++) {
        const th = th0 + ((th1 - th0) * j) / R;
        vtx(point(g, th, g.r), tn, 0.5 + Math.cos(th) / 2, 0.5 + Math.sin(th) / 2);
      }
      for (let j = 0; j < R; j++) {
        if (dir > 0) idx.push(centre, s0 + j, s0 + j + 1);
        else idx.push(centre, s0 + j + 1, s0 + j);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  g.userData.length = length;
  return g;
}

/** A sweep is a closed surface (its cut face fills) unless its ends are left open. */
export function sweepClosed(p: Sweep): boolean {
  return sweepLoops(p) || p.caps !== 'none';
}

/* ------------------------------------------------------------------ */
/* wing                                                                */
/* ------------------------------------------------------------------ */

/** Subdivision levels of the membrane: edges ≤ 1/20 of the wing's size (≤ 4 levels). */
function wingLevels(outline: readonly (readonly number[])[], tris: number[][]): number {
  let size = 0;
  let edge = 0;
  for (const a of outline) for (const b of outline) size = Math.max(size, Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!));
  for (const t of tris)
    for (let i = 0; i < 3; i++) {
      const a = outline[t[i]!]!;
      const b = outline[t[(i + 1) % 3]!]!;
      edge = Math.max(edge, Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!));
    }
  const target = size / 20;
  return target > 0 ? Math.min(4, Math.max(0, Math.ceil(Math.log2(edge / target)))) : 0;
}

type P2 = [number, number];

function subdivide(tris: [P2, P2, P2][], levels: number): [P2, P2, P2][] {
  let out = tris;
  const mid = (a: P2, b: P2): P2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  for (let l = 0; l < levels; l++) {
    out = out.flatMap(([a, b, c]) => {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      return [
        [a, ab, ca],
        [ab, b, bc],
        [ca, bc, c],
        [ab, bc, ca],
      ] as [P2, P2, P2][];
    });
  }
  return out;
}

/** Membrane (non-indexed: top, bottom, edge faces) in the wing's own frame, counter-clockwise outline. */
export function wingMembrane(p: Wing): BufferGeometry {
  const ccw = outlineArea(p.outline) >= 0;
  const outline = (ccw ? p.outline : [...p.outline].reverse()).map((q) => [q[0]!, q[1]!] as P2);
  const contour = outline.map(([x, y]) => new Vector2(x, y));
  const faces = ShapeUtils.triangulateShape(contour, []);
  const levels = wingLevels(outline, faces);
  const tris = subdivide(
    faces.map((f) => {
      const [a, b, c] = f as [number, number, number];
      // triangulateShape may return either winding: make every triangle counter-clockwise.
      const A = outline[a]!, B = outline[b]!, C = outline[c]!;
      const cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
      return (cross >= 0 ? [A, B, C] : [A, C, B]) as [P2, P2, P2];
    }),
    levels,
  );
  let minX = Infinity, minY = Infinity, size = 1e-6;
  for (const [x, y] of outline) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
  }
  for (const [x, y] of outline) size = Math.max(size, x - minX, y - minY);
  const h = p.thickness / 2;
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const v = (x: number, y: number, z: number, n: readonly number[]) => {
    pos.push(x, y, z);
    nor.push(n[0]!, n[1]!, n[2]!);
    uv.push((x - minX) / size, (y - minY) / size);
  };
  for (const [a, b, c] of tris) {
    v(a[0], a[1], h, [0, 0, 1]);
    v(b[0], b[1], h, [0, 0, 1]);
    v(c[0], c[1], h, [0, 0, 1]);
    v(a[0], a[1], -h, [0, 0, -1]);
    v(c[0], c[1], -h, [0, 0, -1]);
    v(b[0], b[1], -h, [0, 0, -1]);
  }
  const steps = 2 ** levels;
  for (let i = 0; i < outline.length; i++) {
    const p0 = outline[i]!;
    const p1 = outline[(i + 1) % outline.length]!;
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const l = Math.hypot(dx, dy) || 1;
    const n = [dy / l, -dx / l, 0];
    for (let k = 0; k < steps; k++) {
      const a: P2 = [p0[0] + (dx * k) / steps, p0[1] + (dy * k) / steps];
      const b: P2 = [p0[0] + (dx * (k + 1)) / steps, p0[1] + (dy * (k + 1)) / steps];
      v(a[0], a[1], h, n);
      v(a[0], a[1], -h, n);
      v(b[0], b[1], -h, n);
      v(a[0], a[1], h, n);
      v(b[0], b[1], -h, n);
      v(b[0], b[1], h, n);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  return g;
}

/** Families seen through (no depth write): their veins are drawn once, in the mid-plane, not on both faces. */
const SEE_THROUGH = new Set(['membrane', 'glass']);

/**
 * Vein hairlines (segment pairs), densified so a fold bends them with the
 * membrane: on both faces of an opaque wing, once in the mid-plane of a
 * see-through one (both faces would read as double lines).
 */
export function wingVeins(p: Wing): BufferGeometry | null {
  if (p.veins.length === 0) return null;
  let size = 1e-6;
  for (const a of p.outline) for (const b of p.outline) size = Math.max(size, Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!));
  const step = size / 40;
  const faces = SEE_THROUGH.has(p.color) ? [0] : [(p.thickness / 2) * 1.15, -(p.thickness / 2) * 1.15];
  const pos: number[] = [];
  for (const vein of p.veins) {
    for (let i = 1; i < vein.length; i++) {
      const a = vein[i - 1]!;
      const b = vein[i]!;
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let k = 0; k < n; k++) {
        const x0 = a[0] + ((b[0] - a[0]) * k) / n, y0 = a[1] + ((b[1] - a[1]) * k) / n;
        const x1 = a[0] + ((b[0] - a[0]) * (k + 1)) / n, y1 = a[1] + ((b[1] - a[1]) * (k + 1)) / n;
        for (const zz of faces) pos.push(x0, y0, zz, x1, y1, zz);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  return g;
}

/**
 * Re-draws a folding wing's pieces for a fan value: keeps the open (as
 * drawn) positions in the wing's own frame and the placements of every copy
 * (part frame: repeat, `at`, rotation, scale), and writes the folded,
 * placed positions into the baked geometry (mirrored placements keep their
 * winding fixed). Mesh normals are recomputed (flat per triangle).
 */
export class FanDeform {
  readonly frame: FanFrame;
  readonly rest: number;
  fan = -1;
  private readonly local: Float32Array;
  private readonly flips: boolean[];
  private readonly v = new Vector3();

  constructor(
    wing: Wing,
    readonly geometry: BufferGeometry,
    readonly placements: readonly Matrix4[],
    readonly lines: boolean,
  ) {
    this.frame = fanFrame(wing.outline, wing.fold!);
    this.rest = restFan(wing);
    this.local = Float32Array.from(geometry.getAttribute('position').array);
    this.flips = placements.map((m) => m.determinant() < 0);
    const count = this.local.length / 3;
    const out = new BufferGeometry();
    out.setAttribute('position', new BufferAttribute(new Float32Array(count * 3 * placements.length), 3));
    if (!lines) {
      const uv = geometry.getAttribute('uv');
      const uvs = new Float32Array(count * 2 * placements.length);
      placements.forEach((_, i) => {
        for (let j = 0; j < count; j++) {
          const src = this.order(j, this.flips[i]!);
          uvs[(i * count + j) * 2] = uv.getX(src);
          uvs[(i * count + j) * 2 + 1] = uv.getY(src);
        }
      });
      out.setAttribute('normal', new BufferAttribute(new Float32Array(count * 3 * placements.length), 3));
      out.setAttribute('uv', new BufferAttribute(uvs, 2));
    }
    geometry.dispose();
    this.output = out;
    this.apply(this.rest);
  }

  /** The geometry drawn (placed, folded). */
  readonly output: BufferGeometry;

  /** Mirrored copies write each triangle as (0, 2, 1). */
  private order(j: number, flip: boolean): number {
    return flip && !this.lines ? j - (j % 3) + [0, 2, 1][j % 3]! : j;
  }

  /** Redraw for `fan` (0 folded … 1 open); false when nothing changed. */
  apply(fan: number): boolean {
    const k = Math.min(1, Math.max(0, fan));
    if (Math.abs(k - this.fan) < 1e-4) return false;
    this.fan = k;
    const attr = this.output.getAttribute('position') as BufferAttribute;
    const out = attr.array as Float32Array;
    const count = this.local.length / 3;
    const L = this.local;
    this.placements.forEach((m, i) => {
      const flip = this.flips[i]!;
      for (let j = 0; j < count; j++) {
        const src = this.order(j, flip);
        const [x, y, z] = fanPoint(this.frame, L[src * 3]!, L[src * 3 + 1]!, k);
        this.v.set(x, y, z + L[src * 3 + 2]!).applyMatrix4(m);
        out[(i * count + j) * 3] = this.v.x;
        out[(i * count + j) * 3 + 1] = this.v.y;
        out[(i * count + j) * 3 + 2] = this.v.z;
      }
    });
    attr.needsUpdate = true;
    if (!this.lines) this.output.computeVertexNormals();
    this.output.computeBoundingSphere();
    return true;
  }
}
