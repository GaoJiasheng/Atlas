/**
 * WebGL builders of the shaped primitive kinds (layout maths in
 * lib/shaped.ts): lathe, extrude, curvedPanel, blades (axial and barrel
 * rotors), coilBank (finned-tube heat exchanger, flat or L) and grille
 * (wire rings or slats). Each returns pieces in the primitive's own frame;
 * pieces with many small solids are already merged into one geometry.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Matrix4,
  Path,
  Shape,
  TorusGeometry,
  Vector2,
} from 'three';
import type { Primitive } from '../../schema';
import {
  axialBladePoint,
  axialHub,
  barrelBladePoint,
  barrelDiscs,
  coilCorner,
  coilFaceHeight,
  coilLegs,
  coilRowOffsets,
  coilBendStart,
  coilStub,
  coilTubeHeights,
  grilleRings,
  grilleSlats,
  panelPoint,
  type Blades,
  type CoilBank,
} from '../../lib/shaped';
import { DEG2RAD } from '../../lib/math';
import { mergeBaked, type BasePiece } from './geometry';

type Kind<K extends Primitive['kind']> = Extract<Primitive, { kind: K }>;
const ID = () => [new Matrix4()];

/** Hand-built geometry from flat triangle lists. */
class TriBuilder {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  vertex(p: readonly number[], n: readonly number[], u = 0, v = 0): void {
    this.pos.push(p[0]!, p[1]!, p[2]!);
    this.nor.push(n[0]!, n[1]!, n[2]!);
    this.uv.push(u, v);
  }
  /** Quad a-b-c-d (counter-clockwise seen from its front), per-vertex normals. */
  quad(a: Vec, b: Vec, c: Vec, d: Vec, na: Vec, nb: Vec, nc: Vec, nd: Vec): void {
    this.vertex(a, na); this.vertex(b, nb); this.vertex(c, nc);
    this.vertex(a, na); this.vertex(c, nc); this.vertex(d, nd);
  }
  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('normal', new BufferAttribute(new Float32Array(this.nor), 3));
    g.setAttribute('uv', new BufferAttribute(new Float32Array(this.uv), 2));
    g.computeBoundingSphere();
    return g;
  }
}
type Vec = readonly [number, number, number];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const neg = (a: Vec): Vec => [-a[0], -a[1], -a[2]];

/**
 * Tube of radius `r` swept along `pts` whose bends all lie in planes
 * containing `up` (every coil tube and return bend): the circle frame is
 * (up, tangent × up), so no twisting. Open ends.
 */
function sweep(t: TriBuilder, pts: Vec[], up: Vec, r: number, seg = 8): void {
  const rings: { p: Vec; n: Vec }[][] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const tan = norm(sub(b, a));
    const side = norm(cross(tan, up));
    const u = norm(cross(side, tan));
    return Array.from({ length: seg + 1 }, (_, k) => {
      const ang = (k / seg) * Math.PI * 2;
      const n: Vec = [u[0] * Math.cos(ang) + side[0] * Math.sin(ang), u[1] * Math.cos(ang) + side[1] * Math.sin(ang), u[2] * Math.cos(ang) + side[2] * Math.sin(ang)];
      return { p: [p[0] + n[0] * r, p[1] + n[1] * r, p[2] + n[2] * r], n };
    });
  });
  for (let i = 0; i + 1 < rings.length; i++)
    for (let k = 0; k < seg; k++) {
      const a = rings[i]![k]!, b = rings[i]![k + 1]!, c = rings[i + 1]![k + 1]!, d = rings[i + 1]![k]!;
      t.quad(a.p, b.p, c.p, d.p, a.n, b.n, c.n, d.n);
    }
}

/* ------------------------------------------------------------------ */
/* lathe, extrude, curved panel                                        */
/* ------------------------------------------------------------------ */

function latheGeometry(p: Kind<'lathe'>): BufferGeometry {
  return new LatheGeometry(p.profile.map(([r, y]) => new Vector2(r, y)), p.segments);
}

function extrudeGeometry(p: Kind<'extrude'>): BufferGeometry {
  const shape = new Shape(p.shape.map(([x, y]) => new Vector2(x, y)));
  for (const h of p.holes ?? []) shape.holes.push(new Path(h.map(([x, y]) => new Vector2(x, y))));
  const b = p.bevel ?? 0;
  const g = new ExtrudeGeometry(shape, {
    depth: p.depth - 2 * b,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: -b,
    bevelSegments: 3,
    curveSegments: 8,
  });
  g.translate(0, 0, -(p.depth - 2 * b) / 2);
  return g;
}

/** Cylinder slice: outer and inner faces with radial normals, flat side edges and top / bottom caps. */
function curvedPanelGeometry(p: Kind<'curvedPanel'>): BufferGeometry {
  const t = new TriBuilder();
  const half = (p.angle / 2) * DEG2RAD;
  const n = p.segments;
  const R = p.radius;
  const r = p.radius - p.thickness;
  const h = p.height / 2;
  const at = (a: number, rr: number, y: number): Vec => {
    const [x, z] = panelPoint(R, a, rr);
    return [x, y, z];
  };
  for (let k = 0; k < n; k++) {
    const a0 = -half + (2 * half * k) / n;
    const a1 = -half + (2 * half * (k + 1)) / n;
    const n0: Vec = [Math.sin(a0), 0, Math.cos(a0)];
    const n1: Vec = [Math.sin(a1), 0, Math.cos(a1)];
    t.quad(at(a0, R, -h), at(a1, R, -h), at(a1, R, h), at(a0, R, h), n0, n1, n1, n0);
    t.quad(at(a1, r, -h), at(a0, r, -h), at(a0, r, h), at(a1, r, h), neg(n1), neg(n0), neg(n0), neg(n1));
    const up: Vec = [0, 1, 0];
    t.quad(at(a0, r, h), at(a0, R, h), at(a1, R, h), at(a1, r, h), up, up, up, up);
    const dn: Vec = [0, -1, 0];
    t.quad(at(a1, r, -h), at(a1, R, -h), at(a0, R, -h), at(a0, r, -h), dn, dn, dn, dn);
  }
  for (const [a, s] of [[-half, -1], [half, 1]] as const) {
    const nn: Vec = [Math.cos(a) * s, 0, -Math.sin(a) * s];
    const q = s > 0 ? [at(a, r, -h), at(a, R, -h), at(a, R, h), at(a, r, h)] : [at(a, R, -h), at(a, r, -h), at(a, r, h), at(a, R, h)];
    t.quad(q[0]!, q[1]!, q[2]!, q[3]!, nn, nn, nn, nn);
  }
  return t.build();
}

/* ------------------------------------------------------------------ */
/* blades                                                              */
/* ------------------------------------------------------------------ */

/** One thick axial blade: top and bottom surfaces offset along the surface normal, closed by edge walls. */
function axialBlade(p: Blades): BufferGeometry {
  const ns = 10;
  const nc = 8;
  const mid: Vec[][] = [];
  for (let i = 0; i <= ns; i++) {
    const row: Vec[] = [];
    for (let j = 0; j <= nc; j++) row.push(axialBladePoint(p, i / ns, j / nc - 0.5));
    mid.push(row);
  }
  const normalAt = (i: number, j: number): Vec => {
    const ds = sub(mid[Math.min(ns, i + 1)]![j]!, mid[Math.max(0, i - 1)]![j]!);
    const dc = sub(mid[i]![Math.min(nc, j + 1)]!, mid[i]![Math.max(0, j - 1)]!);
    const n = norm(cross(dc, ds));
    return n[1] < 0 ? neg(n) : n;
  };
  const top: Vec[][] = [];
  const bot: Vec[][] = [];
  const nrm: Vec[][] = [];
  for (let i = 0; i <= ns; i++) {
    top.push([]); bot.push([]); nrm.push([]);
    for (let j = 0; j <= nc; j++) {
      const n = normalAt(i, j);
      // Thinner towards the edges and the tip.
      const th = (p.thickness / 2) * (0.35 + 0.65 * Math.sqrt(1 - (2 * (j / nc) - 1) ** 2)) * (1 - 0.4 * (i / ns));
      const m = mid[i]![j]!;
      top[i]!.push([m[0] + n[0] * th, m[1] + n[1] * th, m[2] + n[2] * th]);
      bot[i]!.push([m[0] - n[0] * th, m[1] - n[1] * th, m[2] - n[2] * th]);
      nrm[i]!.push(n);
    }
  }
  const t = new TriBuilder();
  for (let i = 0; i < ns; i++)
    for (let j = 0; j < nc; j++) {
      t.quad(top[i]![j]!, top[i]![j + 1]!, top[i + 1]![j + 1]!, top[i + 1]![j]!, nrm[i]![j]!, nrm[i]![j + 1]!, nrm[i + 1]![j + 1]!, nrm[i + 1]![j]!);
      const a = neg(nrm[i]![j]!), b = neg(nrm[i]![j + 1]!), c = neg(nrm[i + 1]![j + 1]!), d = neg(nrm[i + 1]![j]!);
      t.quad(bot[i]![j]!, bot[i + 1]![j]!, bot[i + 1]![j + 1]!, bot[i]![j + 1]!, a, d, c, b);
    }
  // Edge walls: around the perimeter (root, tip, leading, trailing).
  const rim: [number, number][] = [];
  for (let j = 0; j <= nc; j++) rim.push([0, j]);
  for (let i = 1; i <= ns; i++) rim.push([i, nc]);
  for (let j = nc - 1; j >= 0; j--) rim.push([ns, j]);
  for (let i = ns - 1; i >= 1; i--) rim.push([i, 0]);
  rim.push([0, 0]);
  for (let k = 0; k + 1 < rim.length; k++) {
    const [i0, j0] = rim[k]!;
    const [i1, j1] = rim[k + 1]!;
    const a = top[i0]![j0]!, b = top[i1]![j1]!, c = bot[i1]![j1]!, d = bot[i0]![j0]!;
    const n = norm(cross(sub(d, a), sub(b, a)));
    t.quad(a, d, c, b, n, n, n, n);
  }
  return t.build();
}

function axialPieces(p: Blades): BasePiece[] {
  const blade = axialBlade(p);
  const hub = axialHub(p);
  const H = hub.height;
  const steps = 8;
  const profile: Vector2[] = [new Vector2(0, -H / 2), new Vector2(hub.radius, -H / 2), new Vector2(hub.radius, -H / 2)];
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * (Math.PI / 2);
    profile.push(new Vector2(hub.radius * Math.cos(a), H * 0.1 + H * 0.4 * Math.sin(a)));
  }
  profile[profile.length - 1]!.x = 1e-5;
  const hubGeo = new LatheGeometry(profile, 40);
  const blades = Array.from({ length: p.count }, (_, k) => new Matrix4().makeRotationY((k / p.count) * Math.PI * 2));
  return [{ geometry: mergeBaked([{ geometry: blade, matrices: blades }, { geometry: hubGeo, matrices: ID() }]), instances: ID() }];
}

/** Cross-flow rotor: forward-curved blades between discs, a shaft stub at each end. */
function barrelPieces(p: Blades): BasePiece[] {
  const len = p.length ?? 0;
  const n = 6;
  const centre: [number, number][] = Array.from({ length: n + 1 }, (_, i) => barrelBladePoint(p, i / n));
  // Section outline: offset both ways along the in-plane normal.
  const outline: [number, number][] = [];
  const side = (sgn: number) =>
    centre.map(([x, z], i) => {
      const a = centre[Math.max(0, i - 1)]!;
      const b = centre[Math.min(n, i + 1)]!;
      const tx = b[0] - a[0], tz = b[1] - a[1];
      const l = Math.hypot(tx, tz) || 1;
      return [x + (-tz / l) * (p.thickness / 2) * sgn, z + (tx / l) * (p.thickness / 2) * sgn] as [number, number];
    });
  outline.push(...side(1), ...side(-1).reverse());
  const shape = new Shape(outline.map(([x, z]) => new Vector2(x, z)));
  const blade = new ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 4 });
  // Extruded along Z with the section in XY: turn so the section lies in XZ and the length runs along Y.
  blade.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
  blade.translate(0, len / 2, 0);
  const blades = Array.from({ length: p.count }, (_, k) => new Matrix4().makeRotationY((k / p.count) * Math.PI * 2));
  const discT = Math.max(p.thickness * 2, p.radius * 0.04);
  const ends = barrelDiscs(p);
  const discs = ends.map((y, i) => {
    const inner = i === 0 || i === ends.length - 1 ? 0 : p.hub * 0.92;
    const g = new LatheGeometry(
      [new Vector2(inner || 1e-5, -discT / 2), new Vector2(p.radius * 1.03, -discT / 2), new Vector2(p.radius * 1.03, -discT / 2), new Vector2(p.radius * 1.03, discT / 2), new Vector2(p.radius * 1.03, discT / 2), new Vector2(inner || 1e-5, discT / 2)],
      48,
    );
    g.translate(0, y, 0);
    return { geometry: g, matrices: ID() };
  });
  return [{ geometry: mergeBaked([{ geometry: blade, matrices: blades }, ...discs]), instances: ID() }];
}

/* ------------------------------------------------------------------ */
/* coil bank                                                           */
/* ------------------------------------------------------------------ */

/** Centre-line of one tube (row offset `d`, height `y`) through the whole bank, end to end (stubs included). */
function tubeLine(p: CoilBank, d: number, y: number): Vec[] {
  const [a, b] = coilLegs(p);
  const s = coilStub(p);
  if (p.shape !== 'L') return [[-a / 2 - s, y, d], [a / 2 + s, y, d]];
  const rc = coilCorner(p);
  const rho = rc - d;
  const pts: Vec[] = [[a / 2 + s, y, d]];
  const steps = 10;
  for (let k = 0; k <= steps; k++) {
    const th = (k / steps) * (Math.PI / 2);
    pts.push([-a / 2 - rho * Math.sin(th), y, rc - rho * Math.cos(th)]);
  }
  pts.push([-a / 2 - rho, y, rc + b + s]);
  return pts;
}

/** Return bend (half circle) between two tube ends at heights y0 < y1, bulging along `out` from point `end`. */
function bendLine(end: (y: number) => Vec, y0: number, y1: number, out: Vec): Vec[] {
  const rr = (y1 - y0) / 2;
  const c = end((y0 + y1) / 2);
  return Array.from({ length: 11 }, (_, k) => {
    const th = (k / 10) * Math.PI;
    const o = Math.sin(th) * rr;
    return [c[0] + out[0] * o, c[1] - Math.cos(th) * rr, c[2] + out[2] * o] as Vec;
  });
}

function coilPieces(p: CoilBank): BasePiece[] {
  const [a, b] = coilLegs(p);
  const rows = coilRowOffsets(p);
  const out: BasePiece[] = [];
  if (p.bends !== 'only') {
    // Tubes.
    const tubes = new TriBuilder();
    rows.forEach((d, r) => coilTubeHeights(p, r).forEach((y) => sweep(tubes, tubeLine(p, d, y), [0, 1, 0], p.tubeRadius)));
    out.push({ geometry: tubes.build(), instances: ID(), color: p.tubeColor });
    // Fins: thin plates across the tubes, every finPitch along the legs and round the corner.
    const H = coilFaceHeight(p);
    const th = Math.min(0.0006, p.finPitch * 0.18);
    const plate = new BoxGeometry(th, H, p.finDepth);
    const mats: Matrix4[] = [];
    const n0 = Math.max(2, Math.floor(a / p.finPitch));
    for (let k = 0; k < n0; k++) mats.push(new Matrix4().makeTranslation(-a / 2 + (a * (k + 0.5)) / n0, 0, 0));
    if (p.shape === 'L') {
      const rc = coilCorner(p);
      const nArc = Math.max(1, Math.floor((rc * Math.PI) / 2 / p.finPitch));
      for (let k = 0; k < nArc; k++) {
        const t = ((k + 0.5) / nArc) * (Math.PI / 2);
        mats.push(new Matrix4().makeTranslation(-a / 2 - rc * Math.sin(t), 0, rc - rc * Math.cos(t)).multiply(new Matrix4().makeRotationY(-t)));
      }
      const n1 = Math.max(2, Math.floor(b / p.finPitch));
      for (let k = 0; k < n1; k++)
        mats.push(new Matrix4().makeTranslation(-a / 2 - rc, 0, rc + (b * (k + 0.5)) / n1).multiply(new Matrix4().makeRotationY(Math.PI / 2)));
    }
    out.push({ geometry: mergeBaked([{ geometry: plate, matrices: mats }]), instances: ID() });
  }
  if (p.bends !== 'none') {
    const bends = new TriBuilder();
    rows.forEach((d, r) => {
      const ys = coilTubeHeights(p, r);
      const line = tubeLine(p, d, 0);
      // A flat line runs −X → +X; an L line starts at the +X end of leg 0 and ends at the end of leg 1.
      const plusX = p.shape === 'L' ? line[0]! : line[line.length - 1]!;
      const far = p.shape === 'L' ? line[line.length - 1]! : line[0]!;
      // Serpentine circuits (coilBendStart): at the +X end even rows leave their bottom tube free, odd rows
      // their top tube (one row's inlet, the other's outlet); the far end takes the other pairs.
      const start = coilBendStart(p, r);
      const ends: { at: Vec; out: Vec; from: number }[] = [
        { at: plusX, out: [1, 0, 0], from: start },
        { at: far, out: p.shape === 'L' ? [0, 0, 1] : [-1, 0, 0], from: 1 - start },
      ];
      for (const e of ends)
        for (let k = e.from; k + 1 < ys.length; k += 2) {
          const up: Vec = e.out[0] !== 0 ? [0, 0, 1] : [1, 0, 0];
          sweep(bends, bendLine((y) => [e.at[0], y, e.at[2]], ys[k]!, ys[k + 1]!, e.out), up, p.tubeRadius);
        }
    });
    if (bends.pos.length > 0) out.push({ geometry: bends.build(), instances: ID(), color: p.tubeColor });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* grille                                                              */
/* ------------------------------------------------------------------ */

function grillePieces(p: Kind<'grille'>): BasePiece[] {
  const list: { geometry: BufferGeometry; matrices: Matrix4[] }[] = [];
  if (p.style === 'rings') {
    const radii = grilleRings(p);
    for (const r of radii) {
      const g = new TorusGeometry(r, p.bar, 6, Math.max(24, Math.round(r * 260)));
      g.rotateX(Math.PI / 2);
      list.push({ geometry: g, matrices: ID() });
    }
    if (p.spokes > 0) {
      const r0 = radii[0]!;
      const R = radii[radii.length - 1]!;
      const spoke = new CylinderGeometry(p.bar * 1.15, p.bar * 1.15, R - r0, 6, 1);
      spoke.rotateZ(Math.PI / 2);
      spoke.translate((R + r0) / 2, 0, 0);
      list.push({ geometry: spoke, matrices: Array.from({ length: p.spokes }, (_, k) => new Matrix4().makeRotationY((k / p.spokes) * Math.PI * 2 + Math.PI / p.spokes)) });
      // Centre badge where the spokes meet.
      const badge = new CylinderGeometry(r0 * 0.98, r0 * 0.98, p.bar * 2, 32, 1);
      list.push({ geometry: badge, matrices: ID() });
    }
  } else {
    const [w, d, h] = p.size!;
    const slat = new BoxGeometry(p.bar, h, d - p.bar * 2);
    list.push({ geometry: slat, matrices: grilleSlats(p).map((x) => new Matrix4().makeTranslation(x, 0, 0)) });
    const rail = new BoxGeometry(w, h, p.bar);
    list.push({ geometry: rail, matrices: [new Matrix4().makeTranslation(0, 0, d / 2 - p.bar / 2), new Matrix4().makeTranslation(0, 0, -d / 2 + p.bar / 2)] });
    const end = new BoxGeometry(p.bar, h, d);
    list.push({ geometry: end, matrices: [new Matrix4().makeTranslation(w / 2 - p.bar / 2, 0, 0), new Matrix4().makeTranslation(-w / 2 + p.bar / 2, 0, 0)] });
  }
  return [{ geometry: mergeBaked(list), instances: ID() }];
}

/* ------------------------------------------------------------------ */

export function shapedPieces(p: Kind<'lathe' | 'extrude' | 'curvedPanel' | 'blades' | 'coilBank' | 'grille'>): BasePiece[] {
  switch (p.kind) {
    case 'lathe':
      return [{ geometry: latheGeometry(p), instances: ID() }];
    case 'extrude':
      return [{ geometry: extrudeGeometry(p), instances: ID() }];
    case 'curvedPanel':
      return [{ geometry: curvedPanelGeometry(p), instances: ID() }];
    case 'blades':
      return p.layout === 'barrel' ? barrelPieces(p) : axialPieces(p);
    case 'coilBank':
      return coilPieces(p);
    case 'grille':
      return grillePieces(p);
  }
}

