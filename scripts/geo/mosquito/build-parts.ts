/**
 * `pnpm tsx scripts/geo/mosquito/build-parts.ts` — writes
 * src/content/topics/mosquito/data/parts.json (docs/33 §3–§4).
 *
 * Geometry is procedural: a female and a male Aedes aegypti built from one
 * body description (the male placed by a frame: scaled 0.85, turned towards
 * the viewer), the dish with its seven stations (eggs on the wall, four larvae
 * hanging from the surface, the pupa, the emerging adult), the cycle flow's
 * three paths, the breathing and food flows, the marker poses, and the home
 * corner at life size. Texts (names, summaries, details) come from ./text.ts.
 *
 * Scale: the specimen groups are drawn 200 × life size, so 1 scene unit = 5 mm;
 * the home corner is life size, 1 scene unit = 1 m (group `scale`, docs/33 D4).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { GROUP_TEXT, PART_TEXT, SIM_TEXT, SPEC_TEXT, PRESET_TEXT, TELEMETRY_TEXT } from './text';

type V3 = [number, number, number];
type Prim = Record<string, unknown> & { kind: string; at: V3 };

const OUT = join(import.meta.dirname, '../../../src/content/topics/mosquito/data/parts.json');

const n4 = (n: number) => {
  const v = Number(n.toFixed(4));
  return Object.is(v, -0) ? 0 : v;
};
const r3 = (v: readonly number[]): V3 => [n4(v[0]!), n4(v[1]!), n4(v[2]!)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => mul(a, 1 / len(a));
const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const DEG = Math.PI / 180;

/** Point along a polyline at fraction t of its length. */
function along(pts: V3[], t: number): V3 {
  const segs = pts.slice(1).map((p, i) => len(sub(p, pts[i]!)));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]! || i === segs.length - 1) return lerp(pts[i]!, pts[i + 1]!, Math.min(1, d / segs[i]!));
    d -= segs[i]!;
  }
  return pts[pts.length - 1]!;
}

/* ------------------------------------------------------------------ frames */

/** Places a body drawn in "design" coordinates: world = T(target) · Ry(yaw) · S(scale) · T(-origin). */
class Frame {
  readonly m: Matrix4;
  readonly q: Quaternion;
  constructor(
    readonly s = 1,
    yawDeg = 0,
    origin: V3 = [0, 0, 0],
    target: V3 = [0, 0, 0],
    pitchDeg = 0,
  ) {
    this.q = new Quaternion().setFromEuler(new Euler(0, yawDeg * DEG, pitchDeg * DEG, 'YXZ'));
    this.m = new Matrix4()
      .makeTranslation(...target)
      .multiply(new Matrix4().makeRotationFromQuaternion(this.q))
      .multiply(new Matrix4().makeScale(s, s, s))
      .multiply(new Matrix4().makeTranslation(-origin[0], -origin[1], -origin[2]));
  }
  p(v: V3): V3 {
    const x = new Vector3(...v).applyMatrix4(this.m);
    return [x.x, x.y, x.z];
  }
  d(v: V3): V3 {
    const x = new Vector3(...v).applyQuaternion(this.q);
    return [x.x, x.y, x.z];
  }
  /** World rotation (degrees, XYZ) of a local rotation given as a quaternion. */
  rot(local?: Quaternion): V3 | undefined {
    const q = this.q.clone().multiply(local ?? new Quaternion());
    const e = new Euler().setFromQuaternion(q, 'XYZ');
    const out = r3([e.x / DEG, e.y / DEG, e.z / DEG]);
    return out.every((v) => Math.abs(v) < 1e-3) ? undefined : out;
  }
}
const WORLD = new Frame();

const qAxis = (axis: V3, deg: number) => new Quaternion().setFromAxisAngle(new Vector3(...axis).normalize(), deg * DEG);
/** Rotation taking the primitive's own +Y onto `dir`. */
const qY = (dir: V3) => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...norm(dir)));

interface Mat {
  color: string;
  tint?: string;
}
const withMat = (p: Record<string, unknown>, m: Mat): Prim => {
  const out = { ...p, color: m.color } as unknown as Prim;
  if (m.tint) out.tint = m.tint;
  return out;
};
const withRot = (p: Prim, rot: V3 | undefined): Prim => (rot ? { ...p, rotation: rot } : p);

/**
 * An ellipsoid as a low-poly lathe (a sphere primitive is ~3,000 triangles; the many small
 * eggs, knobs and scale patches here need a few hundred at most). `scale` stretches it.
 */
function sphere(f: Frame, c: V3, r: number, m: Mat, scale?: V3, local?: Quaternion, segments = 14, rings = 8): Prim {
  const rr = r * f.s;
  const profile: [number, number][] = [];
  for (let i = 0; i <= rings; i++) {
    const a = -Math.PI / 2 + (i / rings) * Math.PI;
    profile.push([n4(i === 0 || i === rings ? 0 : rr * Math.cos(a)), n4(rr * Math.sin(a))]);
  }
  const p: Prim = withMat({ kind: 'lathe', profile, segments, at: r3(f.p(c)) }, m);
  if (scale) p.scale = r3(scale);
  return withRot(p, f.rot(local));
}

function sweep(
  f: Frame,
  pts: V3[],
  radius: number | number[],
  m: Mat,
  opts: { section?: unknown; up?: V3; rings?: { every: number; depth: number }; caps?: string; radial?: number; segments?: number; scale?: V3 } = {},
): Prim {
  const world = pts.map((p) => f.p(p));
  const lo = world.reduce((a, p) => [Math.min(a[0], p[0]), Math.min(a[1], p[1]), Math.min(a[2], p[2])] as V3, [Infinity, Infinity, Infinity] as V3);
  const hi = world.reduce((a, p) => [Math.max(a[0], p[0]), Math.max(a[1], p[1]), Math.max(a[2], p[2])] as V3, [-Infinity, -Infinity, -Infinity] as V3);
  const at = r3(lerp(lo, hi, 0.5));
  const p: Prim = withMat(
    {
      kind: 'sweep',
      path: world.map((w) => r3(sub(w, at))),
      radius: typeof radius === 'number' ? n4(radius * f.s) : radius.map((r) => n4(r * f.s)),
      at,
    },
    m,
  );
  if (opts.section) p.section = opts.section;
  if (opts.up) p.up = r3(f.d(opts.up));
  if (opts.rings) p.rings = { every: n4(opts.rings.every * f.s), depth: opts.rings.depth };
  if (opts.caps) p.caps = opts.caps;
  if (opts.radial) p.radial = opts.radial;
  if (opts.segments) p.segments = opts.segments;
  if (opts.scale) p.scale = r3(opts.scale);
  return p;
}

/** A long, narrow egg shape along `dir` (a lathe about its own axis, rounder at one end). */
function spindle(c: V3, length: number, width: number, dir: V3, m: Mat): Prim {
  const profile: [number, number][] = [[0, -length / 2]];
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const y = -length / 2 + t * length;
    profile.push([n4((width / 2) * Math.sqrt(1 - (2 * t - 1) ** 2) * (1 + 0.08 * (1 - t))), n4(y)]);
  }
  profile.push([0, n4(length / 2)]);
  return withRot(withMat({ kind: 'lathe', profile, segments: 10, at: r3(c) }, m), WORLD.rot(qY(dir)));
}

function cone(f: Frame, c: V3, r: number, h: number, dir: V3, m: Mat, scale?: V3): Prim {
  const p: Prim = withMat({ kind: 'cone', size: [n4(r * f.s), n4(h * f.s)], at: r3(f.p(c)) }, m);
  if (scale) p.scale = r3(scale);
  return withRot(p, f.rot(qY(dir)));
}

function torus(f: Frame, c: V3, r: number, tube: number, axis: V3, m: Mat, scale?: V3): Prim {
  // A torus lies in its own XY plane (axis +Z): turn +Z onto `axis`.
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...norm(axis)));
  const p: Prim = withMat({ kind: 'torus', size: [n4(r * f.s), n4(tube * f.s)], at: r3(f.p(c)) }, m);
  if (scale) p.scale = r3(scale);
  return withRot(p, f.rot(q));
}

function lathe(f: Frame, c: V3, profile: [number, number][], m: Mat, opts: { segments?: number; local?: Quaternion; scale?: V3 } = {}): Prim {
  const p: Prim = withMat(
    { kind: 'lathe', profile: profile.map(([r, y]) => [n4(r * f.s), n4(y * f.s)]), at: r3(f.p(c)) },
    m,
  );
  if (opts.segments) p.segments = opts.segments;
  if (opts.scale) p.scale = r3(opts.scale);
  return withRot(p, f.rot(opts.local));
}

function wing(f: Frame, base: V3, outline: [number, number][], local: Quaternion, m: Mat, veins: [number, number][][] = [], thickness = 0.002): Prim {
  const p: Prim = withMat(
    {
      kind: 'wing',
      outline: outline.map(([x, y]) => [n4(x * f.s), n4(y * f.s)]),
      ...(veins.length ? { veins: veins.map((v) => v.map(([x, y]) => [n4(x * f.s), n4(y * f.s)])) } : {}),
      thickness: n4(thickness * f.s),
      at: r3(f.p(base)),
    },
    m,
  );
  return withRot(p, f.rot(local));
}

function box(c: V3, size: V3, m: Mat, bevel?: number, rotation?: V3): Prim {
  const p: Prim = withMat(bevel ? { kind: 'bevelBox', size: r3(size), bevel, at: r3(c) } : { kind: 'box', size: r3(size), at: r3(c) }, m);
  return rotation ? { ...p, rotation } : p;
}

/* --------------------------------------------------------------- materials */

const BLACK: Mat = { color: 'chitin', tint: '#2b2824' }; // Aedes body: near-black scales (a brown-black that still reads on the dark plate)
const WHITE: Mat = { color: 'chitin', tint: '#ebe6da' }; // white scale patches
const EYE: Mat = { color: 'eye' };
const HALTERE: Mat = { color: 'chitin', tint: '#8a7a62' };
const WING_M: Mat = { color: 'membrane', tint: '#8c877c' };
const SALIVA: Mat = { color: 'tissue', tint: '#dccb94' };
const GUT: Mat = { color: 'tissue', tint: '#a88c5e' }; // muted ochre, never blood red (docs/33 D8)
const OVARY: Mat = { color: 'tissue', tint: '#e3d8bc' };
const LARVA_BODY: Mat = { color: 'tissue', tint: '#463f33' };
const LARVA_DARK: Mat = { color: 'chitin', tint: '#352d25' };
const PUPA_M: Mat = { color: 'tissue', tint: '#4f4234' };
const INSIDE: Mat = { color: 'tissue', tint: '#d9c9a3' };
const SKIN: Mat = { color: 'membrane', tint: '#86775a' };
const EGG: Mat = { color: 'chitin', tint: '#1d1b19' };
const GLASS: Mat = { color: 'glass' };
const WATER: Mat = { color: 'glass', tint: '#7fa7ad' };
const PUDDLE: Mat = { color: 'glass', tint: '#86aab0' };

/* -------------------------------------------------------- the adult female */

/**
 * The female as drawn: midline on z = 0 (so `bilateral` mirrors about the
 * right plane), head towards -X, 0.9 scene units (4.5 mm) from the front of
 * the head to the tip of the abdomen.
 */
const F = {
  head: [-2.795, 0.575, 0] as V3,
  thoraxCentre: [-2.575, 0.62, 0] as V3,
  proboscis: [
    [-2.852, 0.538, 0],
    [-2.95, 0.497, 0],
    [-3.06, 0.452, 0],
    [-3.16, 0.41, 0],
    [-3.235, 0.375, 0],
  ] as V3[],
  thorax: [
    [-2.735, 0.585, 0],
    [-2.7, 0.612, 0],
    [-2.63, 0.632, 0],
    [-2.55, 0.632, 0],
    [-2.47, 0.615, 0],
    [-2.415, 0.585, 0],
  ] as V3[],
  thoraxR: [0.045, 0.074, 0.094, 0.098, 0.086, 0.056],
  abdomen: [
    [-2.44, 0.585, 0],
    [-2.37, 0.583, 0],
    [-2.3, 0.578, 0],
    [-2.22, 0.572, 0],
    [-2.14, 0.565, 0],
    [-2.06, 0.556, 0],
    [-2.0, 0.548, 0],
    [-1.945, 0.54, 0],
  ] as V3[],
  abdomenR: [0.055, 0.074, 0.081, 0.083, 0.079, 0.069, 0.054, 0.034],
  legs: {
    fore: [
      [-2.665, 0.51, 0.035],
      [-2.69, 0.5, 0.065],
      [-2.775, 0.553, 0.155],
      [-2.85, 0.595, 0.245],
      [-2.92, 0.46, 0.305],
      [-3.0, 0.3, 0.37],
      [-3.1, 0.12, 0.42],
      [-3.17, 0.03, 0.445],
      [-3.235, 0.009, 0.465],
    ] as V3[],
    mid: [
      [-2.565, 0.495, 0.045],
      [-2.56, 0.5, 0.08],
      [-2.545, 0.555, 0.2],
      [-2.53, 0.6, 0.315],
      [-2.5, 0.45, 0.41],
      [-2.47, 0.3, 0.5],
      [-2.42, 0.11, 0.62],
      [-2.39, 0.03, 0.7],
      [-2.355, 0.009, 0.785],
    ] as V3[],
    hind: [
      [-2.485, 0.505, 0.045],
      [-2.46, 0.51, 0.08],
      [-2.34, 0.57, 0.18],
      [-2.215, 0.625, 0.27],
      [-2.04, 0.565, 0.335],
      [-1.86, 0.5, 0.4],
      [-1.66, 0.53, 0.45],
      [-1.52, 0.62, 0.47],
      [-1.43, 0.76, 0.475],
    ] as V3[],
  },
  /** Index in each leg path where the femur ends (knee) and where the tibia ends (the tarsus begins). */
  knee: 3,
  ankle: 5,
  wingBase: [-2.47, 0.705, 0.032] as V3,
};

function surfaceY(path: V3[], radii: number[], x: number, z: number, flat: number): number {
  // Height of the thorax's upper surface at (x, z): the section is an ellipse, half-width flat × r.
  let i = 0;
  while (i < path.length - 2 && path[i + 1]![0] < x) i++;
  const t = Math.max(0, Math.min(1, (x - path[i]![0]) / (path[i + 1]![0] - path[i]![0])));
  const yc = path[i]![1] + (path[i + 1]![1] - path[i]![1]) * t;
  const r = radii[i]! + (radii[i + 1]! - radii[i]!) * t;
  const w = flat * r;
  const k = Math.min(0.98, Math.abs(z) / w);
  return yc + r * Math.sqrt(1 - k * k);
}

interface Body {
  head: Prim[];
  clypeus: Prim[];
  eyes: Prim[];
  antennae: Prim[];
  antennaHairs: Prim[];
  palps: Prim[];
  palpTips: Prim[];
  palpHairs: Prim[];
  proboscis: Prim[];
  stylets: Prim[];
  thorax: Prim[];
  lyre: Prim[];
  legs: Record<'fore' | 'mid' | 'hind', { dark: Prim[]; white: Prim[] }>;
  wings: Prim[];
  halteres: Prim[];
  saliva: Prim[];
  abdomen: Prim[];
  bands: Prim[];
  midgut: Prim[];
  ovaries: Prim[];
}

/** Basal white bands per tarsomere (Ae. aegypti: fore and mid legs on I–II, hind legs on I–IV and V all white; S52). */
const TARSOMERES = [0, 0.4, 0.6, 0.75, 0.87, 1];

function legPrims(f: Frame, path: V3[], kind: 'fore' | 'mid' | 'hind', side: 1 | -1, slim = 1): { dark: Prim[]; white: Prim[] } {
  const pts = path.map((p) => [p[0], p[1], p[2] * side] as V3);
  const rFem = 0.0135 * slim;
  const rTib = 0.0105 * slim;
  const radii = pts.map((_, i) => (i <= F.knee ? rFem : i <= F.ankle ? rTib : Math.max(0.005, rTib * (1 - ((i - F.ankle) / (pts.length - F.ankle)) * 0.45))));
  const dark = [sweep(f, pts, radii, BLACK, { radial: 8, segments: 40 })];
  const white: Prim[] = [];
  const tarsus = pts.slice(F.ankle);
  const banded = kind === 'hind' ? [0, 1, 2, 3] : [0, 1];
  for (const k of banded) {
    const a = along(tarsus, TARSOMERES[k]!);
    const b = along(tarsus, TARSOMERES[k]! + (TARSOMERES[k + 1]! - TARSOMERES[k]!) * 0.38);
    white.push(sweep(f, [a, b], [0.0098 * slim, 0.0088 * slim], WHITE, { radial: 8, segments: 4 }));
  }
  if (kind === 'hind') white.push(sweep(f, [along(tarsus, TARSOMERES[4]!), tarsus[tarsus.length - 1]!], [0.0078 * slim, 0.0062 * slim], WHITE, { radial: 8, segments: 6 }));
  // Pale knee spot at the femur–tibia joint.
  white.push(sphere(f, pts[F.knee]!, 0.0118 * slim, WHITE));
  return { dark, white };
}

function antennaPrims(f: Frame, side: 1 | -1, male: boolean): { shaft: Prim[]; hairs: Prim[] } {
  const base: V3 = [-2.858, 0.604, 0.021 * side];
  const tip: V3 = male ? [-3.19, 0.71, 0.115 * side] : [-3.2, 0.7, 0.105 * side];
  const dir = norm(sub(tip, base));
  const pedicelR = male ? 0.027 : 0.019;
  const start = add(base, mul(dir, pedicelR * 0.7));
  const shaft = [
    sphere(f, base, pedicelR, BLACK, undefined, undefined, 12, 6),
    sweep(f, [start, lerp(start, tip, 0.5), tip], [0.0058, 0.005, 0.0038], BLACK, { rings: { every: len(sub(tip, start)) / 13, depth: 0.32 }, radial: 8, segments: 52 }),
  ];
  const hairs: Prim[] = [];
  if (male) {
    // Thirteen flagellomeres, each with a whorl of long fine hairs: the bushy (plumose) male antenna (S13, S49).
    // Each whorl is one thin sweep that runs out to the tip of a hair and back, eight hairs round (one draw per material).
    const u = norm(Math.abs(dir[1]) < 0.9 ? [-dir[2], 0, dir[0]] : [1, 0, 0]);
    const v = norm([dir[1] * u[2] - dir[2] * u[1], dir[2] * u[0] - dir[0] * u[2], dir[0] * u[1] - dir[1] * u[0]]);
    for (let k = 0; k < 13; k++) {
      const t = (k + 0.3) / 13;
      const c = lerp(start, tip, t);
      const r = 0.07 * (1 - t * 0.6);
      const pts: V3[] = [c];
      for (let h = 0; h < 8; h++) {
        const a = (h / 8) * 2 * Math.PI + k * 0.4;
        pts.push(add(add(c, mul(dir, -r * 0.35)), add(mul(u, r * Math.cos(a)), mul(v, r * Math.sin(a)))));
        pts.push(c);
      }
      hairs.push(sweep(f, pts, 0.0016, BLACK, { radial: 6, segments: 52, caps: 'none' }));
    }
  }
  return { shaft, hairs };
}

function bodyPrims(f: Frame, opts: { male?: boolean; simple?: boolean } = {}): Body {
  const male = opts.male === true;
  const body: Body = {
    head: [],
    clypeus: [],
    eyes: [],
    antennae: [],
    antennaHairs: [],
    palps: [],
    palpTips: [],
    palpHairs: [],
    proboscis: [],
    stylets: [],
    thorax: [],
    lyre: [],
    legs: { fore: { dark: [], white: [] }, mid: { dark: [], white: [] }, hind: { dark: [], white: [] } },
    wings: [],
    halteres: [],
    saliva: [],
    abdomen: [],
    bands: [],
    midgut: [],
    ovaries: [],
  };
  body.head.push(sphere(f, F.head, 0.07, BLACK, [0.92, 1, 1], undefined, 20, 10));
  for (const s of [1, -1] as const) {
    body.clypeus.push(sphere(f, [-2.862, 0.566, 0.013 * s], 0.0135, WHITE, [1, 0.8, 1]));
    body.eyes.push(sphere(f, [-2.808, 0.588, 0.041 * s], 0.07, EYE, [0.82, 1.02, 0.6], qAxis([0, 0, 1], -12), 24, 12));
  }
  // Proboscis: the labium sheath, slightly swollen at the tip (the labella).
  body.proboscis.push(sweep(f, F.proboscis, [0.0096, 0.0086, 0.008, 0.008, 0.0098], BLACK, { radial: 10, segments: 30 }));
  // Stylets (drawn as three; the real bundle has six: S38).
  for (const dz of [-0.0035, 0, 0.0035]) {
    body.stylets.push(sweep(f, F.proboscis.map((p) => [p[0], p[1] + (dz === 0 ? 0.0035 : -0.001), dz] as V3).slice(0, 5), [0.0026, 0.0024, 0.0022, 0.002, 0.0012], { color: 'chitin', tint: '#6e5a42' }, { radial: 6, segments: 24 }));
  }
  // Palps: short with silvery tips in the female, as long as the proboscis and banded in the male (S13, S53).
  for (const s of [1, -1] as const) {
    if (male) {
      const pts: V3[] = [
        [-2.858, 0.545, 0.018 * s],
        [-2.97, 0.508, 0.03 * s],
        [-3.09, 0.47, 0.038 * s],
        [-3.19, 0.445, 0.042 * s],
        [-3.255, 0.452, 0.044 * s],
      ];
      body.palps.push(sweep(f, pts, [0.0105, 0.0098, 0.0092, 0.0085, 0.006], BLACK, { radial: 8, segments: 26 }));
      for (const t of [0.22, 0.45, 0.66]) body.palpTips.push(sweep(f, [along(pts, t), along(pts, t + 0.035)], 0.0112, WHITE, { radial: 8, segments: 4 }));
      for (const t of [0.8, 0.9, 0.98]) {
        const c = along(pts, t);
        const d = norm(sub(along(pts, Math.min(1, t + 0.02)), along(pts, t - 0.02)));
        body.palpHairs.push(cone(f, c, 0.016, 0.012, mul(d, -1), BLACK));
      }
    } else {
      const pts: V3[] = [
        [-2.86, 0.545, 0.016 * s],
        [-2.9, 0.53, 0.02 * s],
        [-2.945, 0.513, 0.023 * s],
      ];
      body.palps.push(sweep(f, pts, [0.0098, 0.0094, 0.0092], BLACK, { radial: 8, segments: 10 }));
      body.palpTips.push(sweep(f, [[-2.93, 0.518, 0.022 * s], [-2.958, 0.507, 0.024 * s]], [0.0098, 0.0082], WHITE, { radial: 8, segments: 4 }));
    }
    const a = antennaPrims(f, s, male);
    body.antennae.push(...a.shaft);
    body.antennaHairs.push(...a.hairs);
  }
  // Thorax: humped, deeper than wide (section compressed across the body).
  body.thorax.push(sweep(f, F.thorax, F.thoraxR, BLACK, { section: { flat: 0.76 }, up: [0, 0, 1], radial: 24, segments: 30 }));
  // The lyre: two curved lateral stripes and two fine median lines of white scales (S17, S13).
  const lyreSide = (s: 1 | -1): V3[] =>
    [
      [-2.69, 0.014],
      [-2.655, 0.03],
      [-2.61, 0.04],
      [-2.56, 0.042],
      [-2.51, 0.035],
      [-2.475, 0.022],
    ].map(([x, z]) => [x!, surfaceY(F.thorax, F.thoraxR, x!, z!, 0.76) + 0.009, z! * s] as V3);
  const median = (s: 1 | -1): V3[] =>
    [-2.67, -2.61, -2.55, -2.5].map((x) => [x, surfaceY(F.thorax, F.thoraxR, x, 0.006, 0.76) + 0.009, 0.006 * s] as V3);
  for (const s of [1, -1] as const) {
    body.lyre.push(sweep(f, lyreSide(s), 0.0075, WHITE, { section: { flat: 0.45 }, up: [0, 1, 0], radial: 8, segments: 22 }));
    body.lyre.push(sweep(f, median(s), 0.0035, WHITE, { section: { flat: 0.45 }, up: [0, 1, 0], radial: 6, segments: 12 }));
    // White patches on the side of the thorax.
    for (const [x, y] of [
      [-2.64, 0.575],
      [-2.53, 0.56],
    ] as const)
      body.lyre.push(sphere(f, [x, y, 0.064 * s], 0.011, WHITE, [1.7, 0.75, 0.3]));
  }
  // Abdomen: eight visible segments, slightly flattened top to bottom.
  body.abdomen.push(sweep(f, F.abdomen, F.abdomenR, BLACK, { section: { flat: 0.84 }, up: [0, 1, 0], rings: { every: 0.0625, depth: 0.1 }, radial: 20, segments: 48 }));
  // Basal white bands on the segments (S13).
  for (const x of [-2.373, -2.31, -2.248, -2.186, -2.123, -2.06]) {
    let i = 0;
    while (i < F.abdomen.length - 2 && F.abdomen[i + 1]![0] < x) i++;
    const t = (x - F.abdomen[i]![0]) / (F.abdomen[i + 1]![0] - F.abdomen[i]![0]);
    const y = F.abdomen[i]![1] + (F.abdomen[i + 1]![1] - F.abdomen[i]![1]) * t;
    const r = F.abdomenR[i]! + (F.abdomenR[i + 1]! - F.abdomenR[i]!) * t;
    body.bands.push(torus(f, [x + 0.006, y, 0], r * 0.99, 0.0055, [1, 0, 0], WHITE, [1, 0.84, 1]));
  }
  // Legs: femur, tibia and five tarsomeres; the data side is +Z (the mirrored twin is built by the engine).
  for (const k of ['fore', 'mid', 'hind'] as const) body.legs[k] = legPrims(f, F.legs[k], k, 1);
  // Wing at rest: lying back over the abdomen, its tip close to the midline.
  const outline: [number, number][] = [
    [0, 0],
    [0.03, 0.026],
    [0.1, 0.046],
    [0.24, 0.06],
    [0.4, 0.064],
    [0.52, 0.055],
    [0.575, 0.034],
    [0.592, 0.01],
    [0.582, -0.014],
    [0.535, -0.036],
    [0.42, -0.054],
    [0.26, -0.058],
    [0.12, -0.046],
    [0.05, -0.026],
    [0.012, -0.008],
  ];
  const veins: [number, number][][] = [
    [
      [0.005, 0.004],
      [0.24, 0.058],
      [0.5, 0.058],
      [0.585, 0.022],
    ],
    [
      [0.01, 0.0],
      [0.25, 0.03],
      [0.45, 0.044],
      [0.58, 0.03],
    ],
    [
      [0.25, 0.03],
      [0.45, 0.025],
      [0.588, 0.002],
    ],
    [
      [0.01, -0.004],
      [0.3, 0.0],
      [0.45, -0.004],
      [0.565, -0.022],
    ],
    [
      [0.3, 0.0],
      [0.48, -0.024],
      [0.535, -0.034],
    ],
    [
      [0.01, -0.01],
      [0.24, -0.03],
      [0.42, -0.05],
    ],
    [
      [0.01, -0.016],
      [0.14, -0.042],
    ],
  ];
  if (!opts.simple) {
    const q = qAxis([0, 1, 0], 3.2).multiply(qAxis([0, 0, 1], -7.5)).multiply(qAxis([1, 0, 0], 90));
    body.wings.push(wing(f, F.wingBase, outline, q, WING_M, male ? [] : veins));
  }
  // Halteres: a stalk and a knob behind each wing.
  body.halteres.push(sweep(f, [[-2.43, 0.645, 0.05], [-2.405, 0.632, 0.085], [-2.385, 0.622, 0.115]], [0.0045, 0.004, 0.0035], HALTERE, { radial: 6, segments: 10 }));
  body.halteres.push(sphere(f, [-2.38, 0.62, 0.123], 0.0155, HALTERE, [1.25, 1, 1]));
  // Inside: salivary glands (three lobes a side), the gut, the ovaries.
  for (const s of [1, -1] as const) {
    for (const [dy, dz] of [
      [0.012, 0.0],
      [0.0, 0.012],
      [-0.012, 0.004],
    ] as const)
      body.saliva.push(sweep(f, [[-2.7, 0.57 + dy, (0.025 + dz) * s], [-2.655, 0.565 + dy, (0.03 + dz) * s], [-2.61, 0.56 + dy, (0.034 + dz) * s]], [0.008, 0.009, 0.006], SALIVA, { radial: 8, segments: 10 }));
    body.saliva.push(sweep(f, [[-2.7, 0.57, 0.025 * s], [-2.76, 0.565, 0.012 * s], [-2.84, 0.548, 0]], 0.0022, SALIVA, { radial: 6, segments: 10 }));
    body.ovaries.push(sphere(f, [-2.18, 0.566, 0.03 * s], 0.032, OVARY, [1.7, 0.75, 0.75]));
    for (const dx of [-0.03, 0, 0.03]) body.ovaries.push(sphere(f, [-2.18 + dx, 0.574, 0.03 * s + 0.012 * s], 0.006, OVARY, [2.6, 1, 1]));
  }
  body.midgut.push(
    sweep(
      f,
      [
        [-2.84, 0.548, 0],
        [-2.73, 0.58, 0],
        [-2.6, 0.59, 0],
        [-2.46, 0.585, 0],
        [-2.36, 0.578, 0],
        [-2.26, 0.572, 0],
        [-2.15, 0.565, 0],
        [-2.05, 0.556, 0],
        [-1.97, 0.545, 0],
      ],
      [0.004, 0.006, 0.008, 0.012, 0.03, 0.038, 0.036, 0.018, 0.008],
      GUT,
      { radial: 12, segments: 40 },
    ),
  );
  return body;
}

/* ---------------------------------------------------------------- the dish */

const DISH: V3 = [3.4, 0, -0.4];
const DISH_IN = 4.0;
const DISH_OUT = 4.12;
const RIM = 2.1;
const SURFACE = 1.85;
const FLOOR = 0.12;
const STATION_R = 3.0;
/** Clock position (12 = far, -Z; 3 = +X; clockwise seen from above) → point on the circle of radius r at height y. */
const clock = (hours: number, r: number, y: number): V3 => {
  const a = (hours / 12) * 2 * Math.PI;
  return [DISH[0] + r * Math.sin(a), y, DISH[2] - r * Math.cos(a)];
};
const STATIONS = {
  eggs: 9,
  l1: 10.5,
  l2: 12,
  l3: 1.5,
  l4: 3,
  pupa: 4.5,
  emerge: 6,
} as const;
const station = (k: keyof typeof STATIONS) => clock(STATIONS[k], STATION_R, SURFACE);

/** Larval body lengths (head + thorax + abdomen, no siphon) and head widths, mm (Bar & Andrew 2013, S29), drawn 200 ×. */
const LARVAE = {
  l1: { body: 1.745, head: 0.235 },
  l2: { body: 2.935, head: 0.392 },
  l3: { body: 4.343, head: 0.64 },
  l4: { body: 7.202, head: 0.987 },
} as const;
const SU = (mm: number) => mm / 5;

/** Hanging axis of a larva: down, leaning 12° towards +X (so the side view reads), siphon tip at the surface. */
const HANG: V3 = norm([Math.sin(12 * DEG), -Math.cos(12 * DEG), 0]);

interface LarvaGeo {
  prims: Prim[];
  tip: V3;
  head: V3;
  mouth: V3;
  centre: V3;
  length: number;
}

function larva(id: keyof typeof LARVAE): LarvaGeo {
  const S = station(id);
  const L = SU(LARVAE[id].body);
  const hw = SU(LARVAE[id].head);
  const a = HANG;
  const side: V3 = [0, 0, 1];
  const out = norm([a[1], -a[0], 0]); // in the hanging plane, perpendicular to the axis (towards -X…+Y side)
  const a3 = a;
  const sL = 0.6 * hw;
  const at = (d: number, lateral = 0, z = 0): V3 => add(add(add(S, mul(a, d)), mul(out, lateral)), mul(side, z));
  const headL = 0.85 * hw;
  const thL = 0.21 * L;
  const abL = L - headL - thL;
  const ab0 = sL * 0.8; // siphon base
  const prims: Prim[] = [];
  // Abdomen (eight segments) from the siphon base down to the thorax.
  const abPts: V3[] = [0, 0.25, 0.5, 0.75, 1].map((t) => at(ab0 + t * abL));
  prims.push(sweep(WORLD, abPts, [0.3 * hw, 0.32 * hw, 0.35 * hw, 0.38 * hw, 0.42 * hw], LARVA_BODY, { rings: { every: abL / 8, depth: 0.14 }, radial: 14, segments: 40 }));
  // Thorax: broader than the head and the abdomen.
  const thC = at(ab0 + abL + thL * 0.45);
  prims.push(sphere(WORLD, thC, 0.82 * hw, LARVA_BODY, [1, (thL * 0.6) / (0.82 * hw), 1], qY(a)));
  // Head capsule.
  const hC = at(ab0 + abL + thL + headL * 0.45);
  prims.push(sphere(WORLD, hC, 0.5 * hw, LARVA_DARK, [1, (headL * 0.55) / (0.5 * hw), 0.92], qY(a)));
  // Siphon: short and stout in Aedes (S13), its tip at the surface.
  prims.push(sweep(WORLD, [at(0.004), at(sL * 0.5), at(sL)], [0.075 * hw, 0.11 * hw, 0.14 * hw], LARVA_DARK, { radial: 10, segments: 8, caps: 'flat' }));
  // Anal segment with its saddle and four anal papillae (S29), angled off the siphon.
  const segBase = at(ab0 + 0.02 * L);
  const segDir = norm(add(mul(a, -0.45), mul(out, -1)));
  const segEnd = add(segBase, mul(segDir, 0.42 * hw));
  prims.push(sweep(WORLD, [segBase, segEnd], [0.2 * hw, 0.16 * hw], LARVA_BODY, { radial: 10, segments: 6 }));
  prims.push(sweep(WORLD, [lerp(segBase, segEnd, 0.15), lerp(segBase, segEnd, 0.65)], 0.205 * hw, LARVA_DARK, { radial: 10, segments: 4, caps: 'flat' }));
  for (const [dz, tilt] of [
    [-0.09, -0.25],
    [-0.03, -0.08],
    [0.03, 0.08],
    [0.09, 0.25],
  ] as const) {
    const d = norm(add(segDir, [0, 0, tilt * 1.6]));
    prims.push(sphere(WORLD, add(add(segEnd, mul(d, 0.13 * hw)), [0, 0, dz * hw]), 0.045 * hw, LARVA_BODY, [1, 3.0, 1], qY(d)));
  }
  // Mouth brushes: two fans at the front of the head, which hangs lowest.
  const mouth = at(ab0 + abL + thL + headL * 0.98);
  for (const s of [1, -1] as const) {
    const d = norm(add(mul(a, 0.6), [0, 0, 0.8 * s]));
    prims.push(cone(WORLD, add(mouth, mul(d, 0.12 * hw)), 0.26 * hw, 0.24 * hw, mul(d, -1), LARVA_DARK, [1, 1, 0.35]));
  }
  // Short antennae.
  for (const s of [1, -1] as const) prims.push(sweep(WORLD, [at(ab0 + abL + thL + headL * 0.7, 0.15 * hw, 0.32 * hw * s), at(ab0 + abL + thL + headL * 1.05, 0.25 * hw, 0.42 * hw * s)], [0.045 * hw, 0.025 * hw], LARVA_DARK, { radial: 6, segments: 4 }));
  // Hair tufts: three fans a side on the thorax, smaller pairs along the abdomen (S29). One thin sweep per tuft,
  // out to the tip of each hair and back to its root.
  // Tufts stand out to the left and right of the hanging body (along `out`), fanned round the body's axis, tipped a little tailwards.
  const tuft = (root: V3, s: 1 | -1, length: number, spreadDeg: number, hairs: number, r: number): Prim => {
    const pts: V3[] = [root];
    for (let h = 0; h < hairs; h++) {
      const a = (-spreadDeg / 2 + (spreadDeg * h) / Math.max(1, hairs - 1)) * DEG;
      const outDir = norm(add(add(mul(out, s * Math.cos(a)), mul(side, Math.sin(a))), mul(a3, -0.25)));
      pts.push(add(root, mul(outDir, length)), root);
    }
    return sweep(WORLD, pts, r, LARVA_DARK, { radial: 6, segments: 8 * hairs, caps: 'none' });
  };
  for (const [d, lat] of [
    [ab0 + abL + thL * 0.2, 1],
    [ab0 + abL + thL * 0.5, 1.05],
    [ab0 + abL + thL * 0.8, 0.95],
  ] as const) {
    for (const s of [1, -1] as const) prims.push(tuft(at(d, 0.7 * hw * s * lat), s, 0.8 * hw, 70, 4, 0.016 * hw));
  }
  for (const t of [0.15, 0.4, 0.65, 0.88]) {
    for (const s of [1, -1] as const) prims.push(tuft(at(ab0 + t * abL, 0.32 * hw * s), s, 0.45 * hw, 40, 2, 0.013 * hw));
  }
  const head = at(ab0 + abL + thL + headL * 0.5);
  return { prims, tip: S, head, mouth, centre: at((ab0 + abL + thL + headL) / 2), length: ab0 + abL + thL + headL };
}

const LARVA_GEO = { l1: larva('l1'), l2: larva('l2'), l3: larva('l3'), l4: larva('l4') };

/* ----------------------------------------------------------------- the pupa */

const PUPA_S = station('pupa');
/** Pupal measurements, mm (S23): trumpet 0.61, abdomen 2.63, paddle 0.92; drawn 200 ×. */
const TRUMPET = SU(0.61);
const PUPA_ABDOMEN = SU(2.63);
const PADDLE = SU(0.92);
const CEPH_R: V3 = [0.17, 0.15, 0.14];
const CEPH: V3 = [PUPA_S[0], SURFACE - TRUMPET * 0.92 - CEPH_R[1] + 0.02, PUPA_S[2]];

function pupaPrims(c: V3, m: Mat): Prim[] {
  const out: Prim[] = [];
  out.push(sphere(WORLD, c, 1, m, CEPH_R));
  // Curled abdomen: back from the cephalothorax, down, and forward under it (eight segments), ending in two paddles.
  const ab: V3[] = [
    [c[0] + 0.1, c[1] - 0.03, c[2]],
    [c[0] + 0.2, c[1] - 0.1, c[2]],
    [c[0] + 0.235, c[1] - 0.22, c[2]],
    [c[0] + 0.185, c[1] - 0.33, c[2]],
    [c[0] + 0.08, c[1] - 0.395, c[2]],
    [c[0] - 0.04, c[1] - 0.39, c[2]],
    [c[0] - 0.12, c[1] - 0.355, c[2]],
  ];
  out.push(sweep(WORLD, ab, [0.072, 0.066, 0.06, 0.052, 0.043, 0.034, 0.025], m, { rings: { every: PUPA_ABDOMEN / 8, depth: 0.14 }, radial: 14, segments: 40, section: { flat: 0.85 }, up: [0, 0, 1] }));
  const end = ab[ab.length - 1]!;
  const tan = norm(sub(end, ab[ab.length - 2]!));
  for (const s of [1, -1] as const) {
    const d = norm(add(tan, [0, 0, 0.55 * s]));
    out.push(sphere(WORLD, add(end, mul(d, PADDLE * 0.45)), PADDLE * 0.5, m, [0.45, 1, 0.12], qY(d).multiply(qAxis([0, 1, 0], 90))));
  }
  return out;
}

function trumpets(c: V3, m: Mat): Prim[] {
  const out: Prim[] = [];
  for (const s of [1, -1] as const) {
    const base: V3 = [c[0] - 0.03, c[1] + CEPH_R[1] * 0.92, c[2] + 0.045 * s];
    out.push(
      lathe(WORLD, add(base, [0, TRUMPET / 2, 0]), [
        [0, -TRUMPET / 2],
        [0.016, -TRUMPET / 2],
        [0.016, TRUMPET * 0.15],
        [0.03, TRUMPET / 2],
        [0.024, TRUMPET / 2],
        [0.01, TRUMPET * 0.15],
        [0, TRUMPET * 0.15],
      ], m, { segments: 16 }),
    );
  }
  return out;
}

/* --------------------------------------------------------- the home corner */

const HOME: V3 = [-10, 0, -1];
const POT: V3 = [HOME[0] - 0.62, 0, HOME[2] + 0.28];
const PAIL: V3 = [HOME[0] + 0.05, 0, HOME[2] + 0.42];
const CABINET: V3 = [HOME[0] + 0.62, 0, HOME[2] - 0.38];
const GUTTER: V3 = [HOME[0] - 0.15, 2.36, HOME[2] - 0.39];

/* --------------------------------------------------------------- the parts */

interface PartData {
  id: string;
  group?: string;
  primitive: Prim;
  extra?: Prim[];
  explode?: { dir: V3; dist: number };
  connects?: string[];
  shell?: boolean;
  bilateral?: boolean;
  context?: boolean;
  castShadow?: boolean;
}

function part(id: string, group: string | undefined, prims: Prim[], more: Partial<PartData> = {}): PartData {
  if (prims.length === 0) throw new Error(`part ${id}: no primitives`);
  if (prims.length > 33) throw new Error(`part ${id}: ${prims.length} primitives (max 33)`);
  return { id, ...(group ? { group } : {}), primitive: prims[0]!, ...(prims.length > 1 ? { extra: prims.slice(1) } : {}), ...more };
}

const female = bodyPrims(WORLD);
const FEMALE_TC = F.thoraxCentre;
/** The male stands to the right of and behind the female, turned 20° towards the viewer, 0.85 of her size. */
const MALE_FRAME = new Frame(0.85, 12, [FEMALE_TC[0], 0, 0], [-2.2, 0, -1.25]);
const male = bodyPrims(MALE_FRAME, { male: true });
const maleWingsFrame = MALE_FRAME;
const maleWings = (() => {
  const outline = [
    [0, 0],
    [0.03, 0.024],
    [0.1, 0.042],
    [0.24, 0.054],
    [0.4, 0.058],
    [0.52, 0.05],
    [0.57, 0.03],
    [0.585, 0.01],
    [0.575, -0.012],
    [0.53, -0.032],
    [0.42, -0.048],
    [0.26, -0.052],
    [0.12, -0.042],
    [0.05, -0.024],
    [0.012, -0.007],
  ] as [number, number][];
  const out: Prim[] = [];
  for (const s of [1, -1] as const) {
    const q = qAxis([0, 1, 0], 3.2 * s).multiply(qAxis([0, 0, 1], -7.5)).multiply(qAxis([1, 0, 0], 90 * s));
    out.push(wing(maleWingsFrame, [F.wingBase[0], F.wingBase[1], F.wingBase[2] * s], outline, q, WING_M));
  }
  return out;
})();

/** The emerging adult stands on the surface beside its pupal skin; a simplified, smaller adult (docs/33 §3.4 #31). */
const EMERGE_S = station('emerge');
const EMERGE_FRAME = new Frame(0.85, 0, [FEMALE_TC[0], 0, 0], [EMERGE_S[0] - 0.42, SURFACE + 0.004, EMERGE_S[2] + 0.05]);
function simpleAdult(fr: Frame, spread: number): { dark: Prim[]; wings: Prim[] } {
  const b = bodyPrims(fr, { simple: true });
  const dark: Prim[] = [...b.head, ...b.eyes.map((e) => ({ ...e, color: 'chitin', tint: '#2b2824' }) as Prim), b.proboscis[0]!, b.thorax[0]!, b.abdomen[0]!];
  for (const k of ['fore', 'mid', 'hind'] as const) {
    for (const s of [1, -1] as const) {
      const leg = legPrims(fr, F.legs[k], k, s, 0.9);
      dark.push(...leg.dark);
    }
  }
  for (const s of [1, -1] as const) dark.push(...antennaPrims(fr, s, false).shaft.slice(1));
  const wings: Prim[] = [];
  const outline: [number, number][] = [
    [0, 0],
    [0.1, 0.046],
    [0.3, 0.062],
    [0.5, 0.056],
    [0.59, 0.012],
    [0.54, -0.036],
    [0.3, -0.058],
    [0.1, -0.044],
  ];
  for (const s of [1, -1] as const) {
    const q = qAxis([0, 1, 0], -spread * s).multiply(qAxis([0, 0, 1], -7.5)).multiply(qAxis([1, 0, 0], 90 * s));
    wings.push(wing(fr, [F.wingBase[0], F.wingBase[1], F.wingBase[2] * s], outline, q, WING_M));
  }
  return { dark, wings };
}
const emerging = simpleAdult(EMERGE_FRAME, 8);
const FLYERS = [new Frame(0.95, -35, [FEMALE_TC[0], 0, 0], [2.3, 3.05, -1.5]), new Frame(0.95, 150, [FEMALE_TC[0], 0, 0], [4.7, 3.35, 0.4])];
const flyers = FLYERS.map((fr) => simpleAdult(fr, 62));

/* ----- parts list (array order = numbering: by group, in the order of work) ----- */

const parts: PartData[] = [];

// 01 head
parts.push(part('head-capsule', 'head', [...female.head, ...female.clypeus], { shell: true, explode: { dir: [-1, 0.25, 0], dist: 0.35 }, connects: ['compound-eyes', 'antennae', 'palps', 'proboscis', 'thorax'] }));
parts.push(part('compound-eyes', 'head', female.eyes, { explode: { dir: [-1, 0.5, 0], dist: 0.42 }, connects: ['head-capsule'] }));
parts.push(part('antennae', 'head', female.antennae, { explode: { dir: [-1, 0.9, 0], dist: 0.45 }, connects: ['head-capsule'] }));
parts.push(part('palps', 'head', [...female.palps, ...female.palpTips], { explode: { dir: [-1, -0.2, 0], dist: 0.42 }, connects: ['head-capsule', 'proboscis'] }));
parts.push(part('proboscis', 'head', female.proboscis, { explode: { dir: [-1, -0.45, 0], dist: 0.5 }, connects: ['head-capsule', 'stylets'] }));
parts.push(part('stylets', 'head', female.stylets, { explode: { dir: [-1, -0.45, 0], dist: 0.5 }, connects: ['proboscis', 'salivary-glands', 'midgut'] }));
// 02 thorax, legs and wings
parts.push(part('thorax', 'thorax-wings', [...female.thorax, ...female.lyre], { shell: true, connects: ['head-capsule', 'fore-legs', 'mid-legs', 'hind-legs', 'wings', 'halteres', 'abdomen'] }));
parts.push(part('fore-legs', 'thorax-wings', [...female.legs.fore.dark, ...female.legs.fore.white, ...legPrims(WORLD, F.legs.fore, 'fore', -1).dark, ...legPrims(WORLD, F.legs.fore, 'fore', -1).white], { explode: { dir: [-0.3, -0.2, 1], dist: 0.4 }, connects: ['thorax'] }));
parts.push(part('mid-legs', 'thorax-wings', [...female.legs.mid.dark, ...female.legs.mid.white, ...legPrims(WORLD, F.legs.mid, 'mid', -1).dark, ...legPrims(WORLD, F.legs.mid, 'mid', -1).white], { explode: { dir: [0, -0.2, 1], dist: 0.42 }, connects: ['thorax'] }));
parts.push(part('hind-legs', 'thorax-wings', [...female.legs.hind.dark, ...female.legs.hind.white, ...legPrims(WORLD, F.legs.hind, 'hind', -1).dark, ...legPrims(WORLD, F.legs.hind, 'hind', -1).white], { explode: { dir: [0.3, -0.1, 1], dist: 0.44 }, connects: ['thorax'] }));
parts.push(part('wings', 'thorax-wings', female.wings, { bilateral: true, explode: { dir: [0.1, 1, 0.6], dist: 0.45 }, connects: ['thorax'] }));
parts.push(part('halteres', 'thorax-wings', female.halteres, { bilateral: true, explode: { dir: [0.2, 0.6, 1], dist: 0.38 }, connects: ['thorax'] }));
parts.push(part('salivary-glands', 'thorax-wings', female.saliva, { explode: { dir: [0, -1, 0], dist: 0.35 }, connects: ['stylets', 'thorax'] }));
// 03 abdomen
parts.push(part('abdomen', 'belly', [...female.abdomen, ...female.bands], { shell: true, explode: { dir: [1, 0.15, 0], dist: 0.42 }, connects: ['thorax', 'midgut', 'ovaries'] }));
parts.push(part('midgut', 'belly', female.midgut, { explode: { dir: [0.6, -0.6, 0], dist: 0.32 }, connects: ['stylets', 'abdomen'] }));
parts.push(part('ovaries', 'belly', female.ovaries, { explode: { dir: [0.5, -1, 0], dist: 0.42 }, connects: ['abdomen', 'eggs'] }));
// 04 male
const maleDark: Prim[] = [...male.head, male.proboscis[0]!, male.thorax[0]!, male.abdomen[0]!, ...male.halteres.map((h) => ({ ...h, color: 'chitin', tint: '#2b2824' }) as Prim)];
// White marks on the male: clypeus, the lyre's stripes, every other abdominal band and the hind-leg bands (the part is capped at 33 pieces).
const maleWhite: Prim[] = [...male.clypeus, ...male.lyre.filter((_, i) => i % 5 < 2), ...male.bands.filter((_, i) => i % 2 === 0)];
for (const k of ['fore', 'mid', 'hind'] as const) {
  for (const s of [1, -1] as const) {
    const leg = legPrims(MALE_FRAME, F.legs[k], k, s, 0.95);
    maleDark.push(...leg.dark);
    if (k === 'hind') maleWhite.push(...leg.white.slice(0, 5));
  }
}
parts.push(part('male-body', 'male', [...maleDark, ...male.eyes, ...maleWhite], { connects: ['male-antennae', 'male-palps', 'male-wings'] }));
parts.push(part('male-antennae', 'male', [...male.antennae, ...male.antennaHairs], { connects: ['male-body'] }));
parts.push(part('male-palps', 'male', [...male.palps, ...male.palpTips, ...male.palpHairs], { connects: ['male-body'] }));
parts.push(part('male-wings', 'male', maleWings, { connects: ['male-body'] }));
// 05 life in water
parts.push(
  part(
    'dish',
    'water-stages',
    [
      lathe(WORLD, DISH, [
        [0, 0],
        [DISH_OUT - 0.08, 0],
        [DISH_OUT, 0.08],
        [DISH_OUT, RIM - 0.03],
        [DISH_OUT - 0.03, RIM],
        [DISH_IN + 0.03, RIM],
        [DISH_IN, RIM - 0.03],
        [DISH_IN, FLOOR],
        [0, FLOOR],
      ], GLASS, { segments: 128 }),
      // The damp band on the inside of the wall just above the water, where the eggs are laid.
      lathe(WORLD, DISH, [
        [DISH_IN - 0.003, SURFACE + 0.004],
        [DISH_IN - 0.003, SURFACE + 0.25],
      ], { color: 'membrane', tint: '#aebdb8' }, { segments: 128 }),
    ],
    { castShadow: true },
  ),
);
// The water: its surface and the meniscus at the wall (a full volume of tinted glass would veil the larvae).
parts.push(
  part('dish-water', 'water-stages', [
    lathe(WORLD, DISH, [
      [0, SURFACE - 0.008],
      [DISH_IN - 0.012, SURFACE - 0.008],
      [DISH_IN - 0.012, SURFACE - 0.002],
      [DISH_IN - 0.05, SURFACE],
      [0, SURFACE],
    ], WATER, { segments: 128 }),
    torus(WORLD, [DISH[0], SURFACE - 0.004, DISH[2]], DISH_IN - 0.022, 0.016, [0, 1, 0], WATER),
  ]),
);
// Eggs: twelve, one by one on the wall just above the waterline, round 9 o'clock (S12 CDC; 0.63 mm long, S22).
const EGG_L = SU(0.634);
const EGG_W = SU(0.169);
const eggs: Prim[] = [];
for (let i = 0; i < 12; i++) {
  const h = STATIONS.eggs - 0.6 + (1.2 * i) / 11 + (i % 2 ? 0.02 : -0.02);
  const y = SURFACE + 0.07 + ((i * 7) % 5) * 0.03;
  const c = clock(h, DISH_IN - EGG_W * 0.55, y);
  const a = (h / 12) * 2 * Math.PI;
  const tangent: V3 = [Math.cos(a), 0, Math.sin(a)];
  const tilt = ((i * 5) % 7) / 7 - 0.5;
  eggs.push(spindle(c, EGG_L, EGG_W, add(tangent, [0, tilt * 0.4, 0]), EGG));
}
parts.push(part('eggs', 'water-stages', eggs, { connects: ['dish', 'larva-l1'] }));
parts.push(part('larva-l1', 'water-stages', LARVA_GEO.l1.prims, { connects: ['eggs', 'larva-l2'] }));
parts.push(part('larva-l2', 'water-stages', LARVA_GEO.l2.prims, { connects: ['larva-l1', 'larva-l3', 'moult-skins'] }));
parts.push(part('larva-l3', 'water-stages', LARVA_GEO.l3.prims, { connects: ['larva-l2', 'larva-l4', 'moult-skins'] }));
parts.push(part('larva-l4', 'water-stages', LARVA_GEO.l4.prims, { connects: ['larva-l3', 'pupa', 'moult-skins'] }));
// Shed skins: a crumpled skin and an empty head capsule floating beside each larva after a moult.
const skins: Prim[] = [];
for (const [k, prev] of [
  ['l2', 'l1'],
  ['l3', 'l2'],
  ['l4', 'l3'],
] as const) {
  const hours = STATIONS[k] - 0.42;
  const c = clock(hours, STATION_R + 0.2, SURFACE - 0.012);
  const L = SU(LARVAE[prev].body) * 0.8;
  const hw = SU(LARVAE[prev].head);
  const a = (hours / 12) * 2 * Math.PI;
  const tangent: V3 = [Math.cos(a), 0, Math.sin(a)];
  const p0 = add(c, mul(tangent, -L / 2));
  const p1 = add(add(c, mul(tangent, -L / 6)), [0, -0.01, 0.03]);
  const p2 = add(add(c, mul(tangent, L / 6)), [0, 0.0, -0.025]);
  const p3 = add(c, mul(tangent, L / 2));
  skins.push(sweep(WORLD, [p0, p1, p2, p3], [0.25 * hw, 0.32 * hw, 0.3 * hw, 0.2 * hw], SKIN, { section: { flat: 0.35 }, up: [0, 1, 0], rings: { every: L / 7, depth: 0.25 }, radial: 10, segments: 24 }));
  skins.push(sphere(WORLD, add(p3, mul(tangent, 0.45 * hw)), 0.45 * hw, SKIN, [1, 0.55, 0.9]));
}
parts.push(part('moult-skins', 'water-stages', skins, { connects: ['larva-l2', 'larva-l3', 'larva-l4'] }));
parts.push(part('pupa', 'water-stages', [...pupaPrims(CEPH, PUPA_M), ...trumpets(CEPH, PUPA_M)], { shell: true, connects: ['larva-l4', 'developing-adult', 'pupal-case'] }));
// Inside the pupa (seen in X-RAY): the adult's legs, wings and mouthparts folded under the pupal skin (S23 sheaths).
const dev: Prim[] = [];
for (const s of [1, -1] as const) {
  dev.push(sweep(WORLD, [add(CEPH, [-0.08, 0.05, 0.05 * s]), add(CEPH, [-0.02, -0.04, 0.07 * s]), add(CEPH, [0.06, -0.06, 0.06 * s])], 0.018, INSIDE, { radial: 8, segments: 12 }));
  dev.push(sphere(WORLD, add(CEPH, [0.02, 0.03, 0.07 * s]), 0.05, INSIDE, [1.3, 0.75, 0.3]));
  for (const k of [0, 1, 2]) dev.push(sweep(WORLD, [add(CEPH, [-0.07 + k * 0.025, -0.02, 0.03 * s]), add(CEPH, [0.0 + k * 0.025, -0.09, 0.045 * s]), add(CEPH, [0.08 + k * 0.015, -0.08, 0.035 * s])], 0.01, INSIDE, { radial: 6, segments: 10 }));
}
dev.push(sweep(WORLD, [add(CEPH, [-0.1, -0.02, 0]), add(CEPH, [-0.05, -0.09, 0]), add(CEPH, [0.05, -0.1, 0])], 0.012, INSIDE, { radial: 6, segments: 10 }));
parts.push(part('developing-adult', 'water-stages', dev, { connects: ['pupa'] }));
// Pupal skin left behind at the emergence station: split along the back, two flaps turned out.
const CASE_C: V3 = [EMERGE_S[0] + 0.02, SURFACE - CEPH_R[1] * 0.62, EMERGE_S[2] + 0.02];
const caseP: Prim[] = pupaPrims(CASE_C, SKIN);
for (const s of [1, -1] as const) {
  caseP.push(wing(WORLD, [CASE_C[0] - 0.12, CASE_C[1] + CEPH_R[1] * 0.85, CASE_C[2]], [[0, 0], [0.22, 0], [0.2, 0.07], [0.1, 0.1], [0.02, 0.06]], qAxis([1, 0, 0], 55 * s), SKIN, [], 0.006));
}
parts.push(part('pupal-case', 'water-stages', caseP, { connects: ['pupa', 'emerging-adult'] }));
parts.push(part('emerging-adult', 'water-stages', [...emerging.dark, ...emerging.wings], { connects: ['pupal-case', 'thorax'] }));
parts.push(part('escaped-adults', 'water-stages', [...flyers[0]!.dark.slice(0, 14), ...flyers[0]!.wings, ...flyers[1]!.dark.slice(0, 14), ...flyers[1]!.wings], { connects: ['emerging-adult'] }));
// 06 home (life size)
parts.push(
  part('flower-pot', 'home', [
    lathe(WORLD, [POT[0], 0.03, POT[2]], [
      [0, 0],
      [0.085, 0],
      [0.12, 0.2],
      [0.13, 0.205],
      [0.13, 0.225],
      [0.115, 0.225],
      [0.108, 0.205],
      [0.074, 0.015],
      [0, 0.015],
    ], { color: 'plastic', tint: '#b5704f' }, { segments: 48 }),
    sweep(WORLD, [[POT[0], 0.21, POT[2]], [POT[0] + 0.01, 0.34, POT[2] + 0.01], [POT[0] - 0.01, 0.46, POT[2]]], [0.008, 0.007, 0.005], { color: 'tissue', tint: '#6d7a4c' }, { radial: 8 }),
    ...[0, 72, 144, 216, 288].map((deg, i) =>
      wing(
        WORLD,
        [POT[0] + (i % 2 ? 0.005 : -0.004), 0.3 + i * 0.03, POT[2]],
        [[0, 0], [0.06, 0.03], [0.14, 0.035], [0.2, 0], [0.14, -0.035], [0.06, -0.03]],
        qAxis([0, 1, 0], deg).multiply(qAxis([0, 0, 1], 28 - i * 4)).multiply(qAxis([1, 0, 0], 90)),
        { color: 'tissue', tint: '#6d7a4c' },
        [],
        0.003,
      ),
    ),
  ], { connects: ['pot-plate', 'soil-hardened', 'soil-loosened'] }),
);
parts.push(
  part('soil-hardened', 'home', [
    lathe(WORLD, [POT[0], 0.215, POT[2]], [
      [0, -0.012],
      [0.04, -0.012],
      [0.07, -0.004],
      [0.112, 0.0],
      [0.112, -0.02],
      [0, -0.02],
    ], { color: 'abrasive', tint: '#5a4636' }, { segments: 40 }),
    lathe(WORLD, [POT[0], 0.204, POT[2]], [
      [0, 0],
      [0.045, 0],
      [0.045, 0.0015],
      [0, 0.0015],
    ], PUDDLE, { segments: 32 }),
  ], { connects: ['flower-pot'] }),
);
parts.push(
  part('soil-loosened', 'home', [
    lathe(WORLD, [POT[0], 0.215, POT[2]], [
      [0, 0.004],
      [0.02, 0.008],
      [0.035, 0.002],
      [0.055, 0.009],
      [0.075, 0.001],
      [0.095, 0.007],
      [0.112, 0.0],
      [0.112, -0.02],
      [0, -0.02],
    ], { color: 'abrasive', tint: '#6b5442' }, { segments: 24 }),
  ], { connects: ['flower-pot'] }),
);
parts.push(
  part('pot-plate', 'home', [
    lathe(WORLD, [POT[0], 0, POT[2]], [
      [0, 0],
      [0.115, 0],
      [0.135, 0.03],
      [0.128, 0.03],
      [0.11, 0.006],
      [0, 0.006],
    ], { color: 'plastic', tint: '#b5704f' }, { segments: 48 }),
  ], { connects: ['flower-pot', 'plate-water'] }),
);
parts.push(
  part('plate-water', 'home', [
    lathe(WORLD, [POT[0], 0.006, POT[2]], [
      [0.074, 0],
      [0.112, 0],
      [0.118, 0.012],
      [0.074, 0.012],
    ], PUDDLE, { segments: 48 }),
  ], { connects: ['pot-plate'] }),
);
parts.push(
  part('pail', 'home', [
    lathe(WORLD, [PAIL[0], 0, PAIL[2]], [
      [0, 0],
      [0.12, 0],
      [0.155, 0.3],
      [0.162, 0.305],
      [0.15, 0.305],
      [0.143, 0.29],
      [0.11, 0.012],
      [0, 0.012],
    ], { color: 'plastic', tint: '#7d8b93' }, { segments: 48 }),
    // The bail handle, resting down against the side of the pail (so it stays clear of the floor when the pail is turned over).
    sweep(WORLD, [[PAIL[0] - 0.158, 0.28, PAIL[2]], [PAIL[0] - 0.15, 0.2, PAIL[2] + 0.075], [PAIL[0], 0.15, PAIL[2] + 0.158], [PAIL[0] + 0.15, 0.2, PAIL[2] + 0.075], [PAIL[0] + 0.158, 0.28, PAIL[2]]], 0.005, { color: 'plastic', tint: '#7d8b93' }, { radial: 8 }),
  ], { connects: ['pail-water'] }),
);
parts.push(
  part('pail-water', 'home', [
    lathe(WORLD, [PAIL[0], 0.012, PAIL[2]], [
      [0, 0],
      [0.11, 0],
      [0.128, 0.13],
      [0, 0.13],
    ], PUDDLE, { segments: 40 }),
  ], { connects: ['pail'] }),
);
parts.push(
  part('vase', 'home', [
    lathe(WORLD, [CABINET[0], 0.5, CABINET[2]], [
      [0, 0],
      [0.06, 0],
      [0.075, 0.08],
      [0.06, 0.2],
      [0.045, 0.26],
      [0.05, 0.28],
      [0.044, 0.28],
      [0.039, 0.26],
      [0.054, 0.2],
      [0.068, 0.08],
      [0.055, 0.008],
      [0, 0.008],
    ], GLASS, { segments: 40 }),
    ...[-1, 0, 1].flatMap((k) => {
      const top: V3 = [CABINET[0] + k * 0.07, 0.95 + (k === 0 ? 0.06 : 0), CABINET[2] + (k === 0 ? 0.02 : -0.02)];
      return [
        sweep(WORLD, [[CABINET[0], 0.55, CABINET[2]], [CABINET[0] + k * 0.02, 0.78, CABINET[2]], top], 0.004, { color: 'tissue', tint: '#6d7a4c' }, { radial: 6 }),
        sphere(WORLD, top, 0.035, { color: 'tissue', tint: '#c9a35c' }, [1, 0.7, 1]),
      ];
    }),
    box([CABINET[0], 0.25, CABINET[2]], [0.52, 0.5, 0.36], { color: 'wood', tint: '#a07b52' }, 0.008),
  ], { connects: ['vase-water'] }),
);
parts.push(
  part('vase-water', 'home', [
    lathe(WORLD, [CABINET[0], 0.508, CABINET[2]], [
      [0, 0],
      [0.054, 0],
      [0.066, 0.08],
      [0.058, 0.15],
      [0, 0.15],
    ], PUDDLE, { segments: 32 }),
  ], { connects: ['vase'] }),
);
// Roof gutter: a U channel under the edge of the roof, with two brackets.
const gutterShape: [number, number][] = [];
for (let i = 0; i <= 12; i++) {
  const a = Math.PI + (i / 12) * Math.PI;
  gutterShape.push([0.06 * Math.cos(a), 0.06 * Math.sin(a)]);
}
for (let i = 12; i >= 0; i--) {
  const a = Math.PI + (i / 12) * Math.PI;
  gutterShape.push([0.054 * Math.cos(a), 0.054 * Math.sin(a)]);
}
parts.push(
  part('roof-gutter', 'home', [
    { kind: 'extrude', shape: gutterShape.map(([x, y]) => [n4(x), n4(y)]), depth: 1.3, at: r3(GUTTER), rotation: [0, 90, 0], color: 'powder', tint: '#c4c6c2' } as Prim,
    box(add(GUTTER, [-0.4, 0.02, -0.07]), [0.03, 0.03, 0.1], { color: 'powder', tint: '#c4c6c2' }),
    box(add(GUTTER, [0.4, 0.02, -0.07]), [0.03, 0.03, 0.1], { color: 'powder', tint: '#c4c6c2' }),
  ], { connects: ['gutter-debris', 'gutter-water', 'bti-granules'] }),
);
parts.push(
  part('gutter-debris', 'home', [0, 1, 2, 3, 4, 5].map((i) =>
    wing(WORLD, add(GUTTER, [0.06 + i * 0.035, -0.035 + (i % 2) * 0.012, (i % 3) * 0.015 - 0.015]), [[0, 0], [0.04, 0.018], [0.09, 0.012], [0.11, 0], [0.09, -0.014], [0.04, -0.018]], qAxis([0, 1, 0], i * 47).multiply(qAxis([0, 0, 1], (i % 2 ? 1 : -1) * 35)).multiply(qAxis([1, 0, 0], 90)), { color: 'tissue', tint: '#8a6b45' }, [], 0.003),
  ), { connects: ['roof-gutter'] }),
);
parts.push(
  part('gutter-water', 'home', [box(add(GUTTER, [-0.28, -0.032, 0]), [0.62, 0.012, 0.09], PUDDLE)], { connects: ['roof-gutter'] }),
);
const bti: Prim[] = [];
for (let i = 0; i < 14; i++) bti.push(sphere(WORLD, add(GUTTER, [-0.36 + (i % 7) * 0.025, -0.044 + (i > 6 ? 0.008 : 0), (i % 3) * 0.012 - 0.012 + (i > 6 ? 0.006 : 0)]), 0.0075, { color: 'abrasive', tint: '#a8875a' }));
parts.push(part('bti-granules', 'home', bti, { connects: ['roof-gutter'] }));
// The marker: the ring the try-it moves from station to station (posed per stage).
const MARK: V3 = [station('l1')[0], SURFACE + 0.012, station('l1')[2]];
parts.push(part('follow-marker', 'water-stages', [torus(WORLD, MARK, 0.45, 0.02, [0, 1, 0], { color: 'token:signal' })], { context: true }));
// Ruler in front of the dish: 40 mm drawn 200 × (8 scene units), millimetre ticks, longer every 5 mm.
const RULER: V3 = [DISH[0] - 4, 0.012, DISH[2] + 4.45];
parts.push(
  part('dish-ruler', 'water-stages', [
    box([RULER[0] + 4, 0.012, RULER[2]], [8.24, 0.024, 0.5], { color: 'plastic', tint: '#d9d2bf' }, 0.006),
    { kind: 'fins', size: [0.12, 0.004, 0.018], count: 41, gap: 0.2, axis: 'x', at: r3([RULER[0] + 4, 0.026, RULER[2] - 0.17]), color: 'token:ink' } as Prim,
    { kind: 'fins', size: [0.22, 0.004, 0.022], count: 9, gap: 1, axis: 'x', at: r3([RULER[0] + 4, 0.0265, RULER[2] - 0.12]), color: 'token:ink' } as Prim,
  ], { context: true }),
);
// Context: the bench, the home corner's floor, wall and plinth.
parts.push(part('bench', undefined, [box([1.75, -0.1, -0.2], [12.6, 0.2, 9.8], { color: 'wood', tint: '#d6bf96' }, 0.03)], { context: true }));
parts.push(
  part('home-floor', 'home', [
    box([HOME[0], 0.01, HOME[2]], [2.2, 0.02, 1.6], { color: 'enamel', tint: '#cfcbc2' }, 0.004),
    ...[-0.825, -0.275, 0.275, 0.825].map((dx) => box([HOME[0] + dx, 0.0205, HOME[2]], [0.006, 0.002, 1.6], { color: 'enamel', tint: '#aaa59b' })),
    ...[-0.55, 0, 0.55].map((dz) => box([HOME[0], 0.0205, HOME[2] + dz], [2.2, 0.002, 0.006], { color: 'enamel', tint: '#aaa59b' })),
  ], { context: true }),
);
parts.push(
  part('home-wall', 'home', [
    box([HOME[0], 1.22, HOME[2] - 0.84], [2.2, 2.44, 0.08], { color: 'enamel' }, 0.006),
    box([HOME[0], 2.46, HOME[2] - 0.66], [2.3, 0.06, 0.44], { color: 'enamel', tint: '#bdb6a8' }, 0.006),
  ], { context: true, castShadow: true }),
);
parts.push(part('home-plinth', 'home', [box([HOME[0], -0.07, HOME[2]], [2.5, 0.14, 1.9], { color: 'wood', tint: '#d6bf96' }, 0.02)], { context: true }));

/* --------------------------------------------------------------- flows */

const ring = (): V3[] => {
  const pts: V3[] = [[DISH[0] - DISH_IN + 0.12, SURFACE + 0.16, DISH[2]]];
  for (let h = 9; h <= 18.0001; h += 0.25) pts.push(r3(clock(h, STATION_R, SURFACE + 0.25)));
  return pts.map(r3);
};
const lifeFlow = {
  id: 'life-cycle',
  group: 'cycle',
  color: 'token:ink-3',
  speed: 0.5,
  count: 260,
  size: 0.5,
  clip: false,
  whenRun: false,
  paths: [
    { id: 'ring', path: ring() },
    {
      id: 'out',
      path: [r3(clock(6, STATION_R, SURFACE + 0.25)), [3.3, 2.75, 3.25], [2.2, 2.85, 3.5], [0.4, 2.3, 2.6], [-1.3, 1.45, 1.2], [-2.3, 0.98, 0.35], [-2.55, 0.86, 0.02]].map((p) => r3(p as V3)),
    },
    {
      id: 'lay',
      path: [[-1.93, 0.54, 0], [-1.5, 0.95, -0.15], [-1.0, 2.0, -0.3], [-0.62, 2.35, -0.4], [-0.25, 2.05, -0.4], [DISH[0] - DISH_IN + 0.12, SURFACE + 0.16, DISH[2]]].map((p) => r3(p as V3)),
    },
  ],
};
const airPaths: { id: string; path: V3[] }[] = [];
for (const k of ['l1', 'l2', 'l3', 'l4'] as const) {
  const g = LARVA_GEO[k];
  airPaths.push({ id: `air-${k}`, path: [add(g.tip, [-0.06, 0.32, 0]), add(g.tip, [-0.02, 0.1, 0]), g.tip, add(g.tip, mul(HANG, Math.min(0.25, g.length * 0.35)))].map(r3) });
}
for (const s of [1, -1] as const) {
  const top: V3 = [CEPH[0] - 0.03, SURFACE, CEPH[2] + 0.045 * s];
  airPaths.push({ id: `air-pupa-${s > 0 ? 'l' : 'r'}`, path: [add(top, [0.05, 0.3, 0]), add(top, [0.01, 0.1, 0]), top, add(top, [0, -TRUMPET - 0.05, 0])].map(r3) });
}
const airFlow = { id: 'breathing-air', group: 'air', color: 'token:cold', speed: 0.15, count: 120, size: 0.3, spread: 0.012, clip: false, whenRun: true, paths: airPaths };
const foodPaths: { id: string; path: V3[] }[] = [];
for (const k of ['l3', 'l4'] as const) {
  const m = LARVA_GEO[k].mouth;
  foodPaths.push({ id: `food-${k}-a`, path: [add(m, [-0.42, -0.25, 0.12]), add(m, [-0.2, -0.12, 0.05]), add(m, [-0.03, -0.01, 0])].map(r3) });
  foodPaths.push({ id: `food-${k}-b`, path: [add(m, [0.38, -0.3, -0.1]), add(m, [0.18, -0.12, -0.03]), add(m, [0.03, -0.01, 0])].map(r3) });
  foodPaths.push({ id: `food-${k}-c`, path: [add(m, [0.02, -0.5, 0.25]), add(m, [0.01, -0.22, 0.1]), add(m, [0, -0.02, 0])].map(r3) });
}
const foodFlow = { id: 'larval-food', group: 'food', color: 'token:food', speed: 0.08, count: 160, size: 0.3, spread: 0.035, clip: false, whenRun: true, paths: foodPaths };

/* --------------------------------------------------------------- animations */

const animations: Record<string, unknown>[] = [];
(['l1', 'l2', 'l3', 'l4'] as const).forEach((k, i) => {
  animations.push({ id: `wriggle-${k}`, target: `larva-${k}`, kind: 'oscillate', axis: [0, 0, 1], amplitude: 6, hz: [0.5, 0.42, 0.38, 0.35][i], pivot: r3(LARVA_GEO[k].tip) });
});
animations.push({ id: 'pupa-bob', target: 'pupa', kind: 'oscillate', axis: [0, 0, 1], amplitude: 3, hz: 0.2, pivot: r3([CEPH[0] - 0.03, SURFACE, CEPH[2]]) });
const EMERGE_PIVOT = r3([EMERGE_S[0] + 0.3, SURFACE, EMERGE_S[2]]);
animations.push({
  id: 'emerge',
  target: 'emerging-adult',
  kind: 'sequence',
  loop: false,
  pivot: EMERGE_PIVOT,
  keys: [
    { t: 0, offset: [-0.12, -0.3, 0], rotation: [0, 0, -50] },
    { t: 2.5, offset: [-0.05, -0.08, 0], rotation: [0, 0, -25] },
    { t: 4.5, offset: [0, 0, 0], rotation: [0, 0, 0] },
    { t: 6, offset: [0, 0, 0], rotation: [0, 0, 0] },
  ],
});
animations.push({ id: 'hover', target: 'escaped-adults', kind: 'oscillate', axis: [0, 0, 1], amplitude: 4, hz: 1.2 });

/* --------------------------------------------------------------- poses */

const poses: Record<string, unknown> = {};
const proBase = r3(F.proboscis[0]!);
const proDir = norm(sub(F.proboscis[4]!, F.proboscis[0]!));
poses['wings-spread'] = { wings: { pivot: r3(F.wingBase), rotation: [0, -50, 0] }, duration: 0.8 };
poses['bite-parts'] = {
  proboscis: { pivot: proBase, scale: [0.72, 0.72, 1.25] },
  stylets: { offset: r3(mul(proDir, 0.12)) },
  duration: 0.9,
};
const abBase = r3(F.abdomen[0]!);
poses.fed = { abdomen: { pivot: abBase, scale: [1.05, 1.35, 1.4] }, midgut: { pivot: abBase, scale: [1.02, 1.8, 1.8] }, ovaries: { pivot: abBase, scale: [1.05, 1.35, 1.4] }, duration: 1.0 };
poses.gravid = { abdomen: { pivot: abBase, scale: [1.03, 1.2, 1.25] }, ovaries: { pivot: [-2.18, 0.566, 0], scale: [1.35, 1.6, 1.6] }, midgut: { pivot: abBase, scale: [1, 1.15, 1.15] }, duration: 1.0 };
const markerTo = (p: V3) => r3(sub(p, MARK));
poses['marker-l1'] = { 'follow-marker': { offset: [0, 0, 0] } };
poses['marker-l2'] = { 'follow-marker': { offset: markerTo([station('l2')[0], MARK[1], station('l2')[2]]) } };
poses['marker-l3'] = { 'follow-marker': { offset: markerTo([station('l3')[0], MARK[1], station('l3')[2]]) } };
poses['marker-l4'] = { 'follow-marker': { offset: markerTo([station('l4')[0], MARK[1], station('l4')[2]]) } };
poses['marker-pupa'] = { 'follow-marker': { offset: markerTo([CEPH[0], MARK[1], CEPH[2]]) } };
poses['marker-adult'] = { 'follow-marker': { scale: [2.7, 1, 2.7], offset: markerTo([-2.55, 0.012, 0.0]) } };
poses['pupa-dive'] = { pupa: { pivot: r3(CEPH), rotation: [0, 0, 100], offset: [0, -0.5, 0] }, 'developing-adult': { pivot: r3(CEPH), rotation: [0, 0, 100], offset: [0, -0.5, 0] }, duration: 1.4 };
const drained: Record<string, unknown> = {
  'dish-water': { offset: [0, -(SURFACE - FLOOR - 0.012), 0] },
  duration: 1.2,
};
for (const k of ['l1', 'l2', 'l3', 'l4'] as const) {
  const g = LARVA_GEO[k];
  // Lie flat on the floor of the dish: turn 85° about the surface point, then drop.
  // Turn inwards (towards the middle of the dish): +78° lays the body along +X, -102° along -X.
  const inward = k === 'l3' || k === 'l4' ? -102 : 78;
  drained[`larva-${k}`] = { pivot: r3(g.tip), rotation: [0, 0, inward], offset: [0, -(SURFACE - FLOOR - SU(LARVAE[k].head) * 0.82), 0] };
}
drained.pupa = { pivot: r3(CEPH), rotation: [0, 0, 70], offset: [0, -(CEPH[1] - FLOOR - 0.2), 0] };
drained['developing-adult'] = drained.pupa;
drained['moult-skins'] = { offset: [0, -(SURFACE - FLOOR - 0.03), 0] };
drained['pupal-case'] = { offset: [0, -(CASE_C[1] - FLOOR - 0.12), 0] };
drained['emerging-adult'] = { offset: [0, -(SURFACE - FLOOR), 0] };
poses.drained = drained;
const plateLift = { pivot: r3([POT[0] + 0.135, 0, POT[2]]), rotation: [0, 0, -78], offset: [0.06, 0.0, 0.3] };
poses['home-bl'] = { 'pot-plate': plateLift, duration: 1.2 };
poses['home-oc'] = { 'pot-plate': plateLift, pail: { pivot: r3([PAIL[0], 0.155, PAIL[2]]), rotation: [180, 0, 0] }, duration: 1.2 };

/* --------------------------------------------------------------- cameras */

const cam = (position: V3, target: V3, fov = 30) => ({ position, target, fov });
const presets = [
  { id: 'hero', camera: cam([-7.5, 6.5, 8.5], [0.3, 0.9, -0.8]) },
  { id: 'heads', camera: cam([-4.6, 1.3, 1.5], [-2.55, 0.5, -0.6], 30) },
  { id: 'above', camera: cam([-2.35, 4.4, 1.5], [-2.35, 0.5, 0.1], 30) },
  { id: 'dish-view', camera: cam([3.2, 13.5, 14.5], [3.4, 0.9, -0.6], 32) },
  { id: 'underwater', camera: cam([5.0, 1.6, 6.4], [5.6, 1.25, 0.8], 30) },
  { id: 'home-corner', camera: cam([-7.3, 3.0, 3.7], [-10.0, 1.15, -1.0], 34) },
];

/* --------------------------------------------------------------- sim */

const sim = {
  kind: 'life-cycle',
  controls: [
    { id: 'temp', kind: 'step', values: [20, 25, 28, 32], default: 28, unit: '°C', label: SIM_TEXT.controls.temp },
    { id: 'day', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6, 7, 8], default: 0, unit: 'd', label: SIM_TEXT.controls.day },
    { id: 'every', kind: 'step', values: [2, 4, 6, 8, 10, 14], default: 6, unit: 'd', label: SIM_TEXT.controls.every },
    { id: 'wipe', kind: 'toggle', default: false, label: SIM_TEXT.controls.wipe },
    { id: 'compare', kind: 'toggle', default: false, label: SIM_TEXT.controls.compare },
  ],
  outputs: [
    { id: 'stage', kind: 'state', label: SIM_TEXT.outputs.stage, states: SIM_TEXT.stageStates },
    { id: 'to-adult', label: SIM_TEXT.outputs['to-adult'], unit: 'd', decimals: 1 },
    { id: 'larva-days', from: 'days:larva', label: SIM_TEXT.outputs['larva-days'], unit: 'd', decimals: 1 },
    { id: 'pupa-days', from: 'days:pupa', label: SIM_TEXT.outputs['pupa-days'], unit: 'd', decimals: 1 },
    { id: 'days-left', label: SIM_TEXT.outputs['days-left'], unit: 'd', decimals: 1 },
    { id: 'head-width', from: 'size:head', label: SIM_TEXT.outputs['head-width'], unit: 'mm', decimals: 2 },
    { id: 'temp-now', from: 'control:temp', label: SIM_TEXT.outputs['temp-now'], unit: '°C', decimals: 0 },
    { id: 'adults', kind: 'state', from: 'emptying:adults', label: SIM_TEXT.outputs.adults, states: SIM_TEXT.adultStates },
    { id: 'eggs-left', kind: 'state', from: 'emptying:eggs', label: SIM_TEXT.outputs['eggs-left'], states: SIM_TEXT.eggStates },
    { id: 'rate', kind: 'vector', label: SIM_TEXT.outputs.rate },
  ],
  bind: [
    { output: 'stage', part: 'follow-marker', pose: { l1: 'marker-l1', l2: 'marker-l2', l3: 'marker-l3', l4: 'marker-l4', pupa: 'marker-pupa', adult: 'marker-adult' } },
    { output: 'eggs-left', part: 'eggs', visible: { eq: 'yes' } },
    { output: 'adults', part: 'escaped-adults', visible: { eq: 'some' } },
    { output: 'rate', flow: 'life-cycle', intensity: { full: 1 } },
  ],
  lifeCycle: {
    temp: 'temp',
    day: 'day',
    start: 'l1',
    stages: [
      { id: 'egg', in: 'wall', part: 'eggs', label: SIM_TEXT.ring.egg, note: SIM_TEXT.ring.eggNote },
      { id: 'l1', in: 'water', part: 'larva-l1', label: SIM_TEXT.ring.l1 },
      { id: 'l2', in: 'water', part: 'larva-l2', label: SIM_TEXT.ring.l2 },
      { id: 'l3', in: 'water', part: 'larva-l3', label: SIM_TEXT.ring.l3 },
      { id: 'l4', in: 'water', part: 'larva-l4', label: SIM_TEXT.ring.l4 },
      { id: 'pupa', in: 'water', part: 'pupa', label: SIM_TEXT.ring.pupa },
      { id: 'adult', in: 'air', part: 'thorax', label: SIM_TEXT.ring.adult },
    ],
    groups: { larva: { stages: ['l1', 'l2', 'l3', 'l4'], label: SIM_TEXT.ring.larva } },
    // Measured mean durations, days: male Ae. aegypti, Khan's diet, constant temperatures (Sasmita et al. 2019, Table 2; S16, CC BY 4.0).
    days: {
      '20': { l1: 2.99, l2: 1.52, l3: 1.62, l4: 3.15, pupa: 4.04, total: 13.4 },
      '25': { l1: 2.53, l2: 1.17, l3: 1.08, l4: 2.77, pupa: 2.61, total: 10.18 },
      '28': { l1: 1.88, l2: 0.68, l3: 1.0, l4: 1.82, pupa: 1.86, total: 7.23 },
      '32': { l1: 1.55, l2: 0.95, l3: 0.7, l4: 1.63, pupa: 1.7, total: 6.4 },
    },
    // Mean head-capsule widths, mm, of each instar (Bar & Andrew 2013; S29): a different sample from the timed larvae.
    size: { head: { unit: 'mm', values: { l1: 0.235, l2: 0.392, l3: 0.64, l4: 0.987 } } },
    emptying: { every: 'every', wipe: 'wipe' },
    rate: { flow: 'life-cycle', paths: ['ring', 'out', 'lay'], reference: 28 },
    card: {
      compare: {
        control: 'compare',
        label: SIM_TEXT.compare.label,
        stages: [
          { id: 'egg', label: SIM_TEXT.compare.egg },
          { id: 'nymph', label: SIM_TEXT.compare.nymph },
          { id: 'adult', label: SIM_TEXT.compare.adult },
        ],
        link: { topic: 'grasshopper', chapter: 'nerves-and-growing-up', label: SIM_TEXT.compare.link },
      },
    },
  },
};

/* --------------------------------------------------------------- assemble */

const groups = [
  { id: 'head', color: 'token:ink-2', scale: { unit: 'mm', magnification: 200 } },
  { id: 'thorax-wings', color: 'token:ink-3', scale: { unit: 'mm', magnification: 200 } },
  { id: 'belly', color: 'token:cut', scale: { unit: 'mm', magnification: 200 } },
  { id: 'male', color: 'token:neutral', scale: { unit: 'mm', magnification: 200 } },
  { id: 'water-stages', color: 'token:accent-2', scale: { unit: 'mm', magnification: 200 } },
  { id: 'home', color: 'token:loop', scale: { unit: 'cm', magnification: 1 }, card: false },
  { id: 'cycle', color: 'token:ink-3' },
  { id: 'air', color: 'token:cold' },
  { id: 'food', color: 'token:food' },
].map((g) => ({ id: g.id, name: GROUP_TEXT[g.id]!, color: g.color, ...(g.scale ? { scale: g.scale } : {}), ...(g.card === false ? { card: false } : {}) }));

const outParts = parts.map((p) => {
  const t = PART_TEXT[p.id];
  if (!t) throw new Error(`no text for part ${p.id}`);
  const { id, group, primitive, extra, ...rest } = p;
  return { id, name: t.name, ...(group ? { group } : {}), summary: t.summary, detail: t.detail, primitive, ...(extra ? { extra } : {}), ...rest };
});
const missing = Object.keys(PART_TEXT).filter((id) => !parts.some((p) => p.id === id));
if (missing.length) throw new Error(`text for parts that are not built: ${missing.join(', ')}`);

const data = {
  parts: outParts,
  groups,
  flows: [lifeFlow, airFlow, foodFlow],
  animations,
  views: {
    assembled: { camera: presets[0]!.camera },
    xray: { camera: presets[3]!.camera },
    exploded: { camera: cam([-4.4, 1.9, 3.4], [-2.55, 0.55, 0], 30) },
    section: { plane: 'xz' },
    cover: cam([-6.2, 5.4, 7.2], [0.6, 0.9, -0.7]),
  },
  presets: presets.map((p) => ({ id: p.id, label: PRESET_TEXT[p.id]!, camera: p.camera })),
  spec: SPEC_TEXT,
  telemetry: [
    { key: TELEMETRY_TEXT['to-adult'], unit: 'd', follow: 'to-adult' },
    { key: TELEMETRY_TEXT['larva-days'], unit: 'd', follow: 'larva-days' },
    { key: TELEMETRY_TEXT['pupa-days'], unit: 'd', follow: 'pupa-days' },
    { key: TELEMETRY_TEXT['temp-now'], unit: '°C', follow: 'temp-now' },
  ],
  poses,
  sim,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
console.log(`mosquito parts.json: ${outParts.length} parts (${outParts.filter((p) => (p as { context?: boolean }).context).length} context), ${Object.keys(poses).length} poses`);
