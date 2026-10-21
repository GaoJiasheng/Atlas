/**
 * Building kit for the living-things specimens (docs/38 §3.2): every specimen
 * is modelled in its own frame — origin at the centre of its footprint on the
 * floor of its cell, +Y up, animals facing +X with their left side towards +Z —
 * and then placed in its cell of the specimen case. Paths, profiles and
 * outlines are relative to a primitive's `at`, so placing only moves `at`.
 */
export type V3 = [number, number, number];
export type V2 = [number, number];
export type Prim = Record<string, unknown> & { kind: string; at: V3 };

/** A specimen in its own frame: the main primitive (its `at` x, z must be 0: the sort model's "home") and the rest. */
export interface Model {
  primitive: Prim;
  extra: Prim[];
}

export const n5 = (n: number) => {
  const v = Number(n.toFixed(5));
  return Object.is(v, -0) ? 0 : v;
};
export const r3 = (v: readonly number[]): V3 => [n5(v[0]!), n5(v[1]!), n5(v[2]!)];
export const r2 = (v: readonly number[]): V2 => [n5(v[0]!), n5(v[1]!)];
export const add = (a: readonly number[], b: readonly number[]): V3 => [a[0]! + b[0]!, a[1]! + b[1]!, a[2]! + b[2]!];
export const sub = (a: readonly number[], b: readonly number[]): V3 => [a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!];
export const mul = (a: readonly number[], k: number): V3 => [a[0]! * k, a[1]! * k, a[2]! * k];
export const len = (a: readonly number[]) => Math.hypot(a[0]!, a[1]!, a[2]!);
export const norm = (a: readonly number[]): V3 => mul(a, 1 / len(a));
export const cross = (a: readonly number[], b: readonly number[]): V3 => [
  a[1]! * b[2]! - a[2]! * b[1]!,
  a[2]! * b[0]! - a[0]! * b[2]!,
  a[0]! * b[1]! - a[1]! * b[0]!,
];
export const dot = (a: readonly number[], b: readonly number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
export const DEG = Math.PI / 180;

/**
 * Euler XYZ angles (degrees, three.js order: R = Rx · Ry · Rz) of the rotation
 * that takes the primitive's own X axis to `x` and its own Y axis as close to
 * `yHint` as possible (Z = X × Y). For a `wing` this lays the outline's length
 * along `x` and its width along `yHint`; Z is the membrane normal.
 */
export function orient(x: readonly number[], yHint: readonly number[]): V3 {
  const X = norm(x);
  const Z = norm(cross(X, yHint));
  const Y = cross(Z, X);
  // Matrix columns are the images of the local axes.
  const m11 = X[0], m12 = Y[0], m13 = Z[0];
  const m22 = Y[1], m23 = Z[1];
  const m32 = Y[2], m33 = Z[2];
  const ry = Math.asin(Math.max(-1, Math.min(1, m13)));
  let rx: number;
  let rz: number;
  if (Math.abs(m13) < 0.9999999) {
    rx = Math.atan2(-m23, m33);
    rz = Math.atan2(-m12, m11);
  } else {
    rx = Math.atan2(m32, m22);
    rz = 0;
  }
  return r3([rx / DEG, ry / DEG, rz / DEG]);
}

const prim = (kind: string, at: readonly number[], rest: Record<string, unknown>): Prim => ({ kind, ...rest, at: r3(at) });
type Rest = Record<string, unknown>;

export const box = (at: readonly number[], size: readonly number[], color: string, rest: Rest = {}): Prim => prim('box', at, { size: r3(size), color, ...rest });
export const bevel = (at: readonly number[], size: readonly number[], b: number, color: string, rest: Rest = {}): Prim =>
  prim('bevelBox', at, { size: r3(size), bevel: n5(b), color, ...rest });
/**
 * A ball drawn as a low-poly lathe (the engine's sphere is 48 × 32 segments,
 * about 3,000 triangles: far too many for 32 small specimens). Small pieces
 * (eyes, colonies) are lighter still.
 */
function ballProfile(r: number, rings: number): V2[] {
  const pts: V2[] = [];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * Math.PI;
    pts.push([i === 0 || i === rings ? 0 : n5(r * Math.sin(a)), n5(-r * Math.cos(a))]);
  }
  return pts;
}
export const sphere = (at: readonly number[], r: number, color: string, rest: Rest = {}): Prim => {
  const small = r < 0.0035;
  return prim('lathe', at, { profile: ballProfile(r, small ? 6 : 9), segments: small ? 10 : 16, color, ...rest });
};
export const ellipsoid = (at: readonly number[], r: number, scale: readonly number[], color: string, rest: Rest = {}): Prim =>
  sphere(at, r, color, { scale: r3(scale), ...rest });
export const cyl = (at: readonly number[], rTop: number, rBottom: number, h: number, color: string, rest: Rest = {}): Prim =>
  prim('cylinder', at, { size: r3([rTop, rBottom, h]), color, ...rest });
export const cone = (at: readonly number[], r: number, h: number, color: string, rest: Rest = {}): Prim => prim('cone', at, { size: [n5(r), n5(h)], color, ...rest });
/** A capsule (radius r, straight middle `mid`, along its own Y) as a low-poly lathe. */
export const capsule = (at: readonly number[], r: number, mid: number, color: string, rest: Rest = {}): Prim => {
  const n = 4;
  const pts: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * (Math.PI / 2);
    pts.push([i === 0 ? 0 : n5(r * Math.sin(a)), n5(-mid / 2 - r * Math.cos(a))]);
  }
  for (let i = 0; i <= n; i++) {
    const a = Math.PI / 2 + (i / n) * (Math.PI / 2);
    pts.push([i === n ? 0 : n5(r * Math.sin(a)), n5(mid / 2 - r * Math.cos(a))]);
  }
  return prim('lathe', at, { profile: pts, segments: 8, color, ...rest });
};
export const torus = (at: readonly number[], r: number, tube: number, color: string, rest: Rest = {}): Prim =>
  prim('torus', at, { size: [n5(r), n5(tube)], color, ...rest });
export const lathe = (at: readonly number[], profile: readonly (readonly number[])[], color: string, rest: Rest = {}): Prim =>
  prim('lathe', at, { profile: profile.map(r2), segments: 24, color, ...rest });

/** A sweep through scene points `pts` (converted to `at`-relative), radius per point or one radius. */
export function sweep(pts: readonly (readonly number[])[], radius: number | readonly number[], color: string, rest: Rest = {}): Prim {
  const at = pts[0]!;
  return prim('sweep', at, {
    path: pts.map((p) => r3(sub(p, at))),
    radius: typeof radius === 'number' ? n5(radius) : radius.map(n5),
    radial: 10,
    color,
    ...rest,
  });
}

/** A sweep whose `at` is `origin` (not its first point): the main primitive of an animal, so the sort model's home is the footprint centre. */
export function sweepAt(origin: readonly number[], pts: readonly (readonly number[])[], radius: number | readonly number[], color: string, rest: Rest = {}): Prim {
  return prim('sweep', origin, {
    path: pts.map((p) => r3(sub(p, origin))),
    radius: typeof radius === 'number' ? n5(radius) : radius.map(n5),
    radial: 14,
    color,
    ...rest,
  });
}

/** A flat `wing` with its outline (in its own XY) laid so that outline +X runs along `x` and +Y along `yHint`, outline origin at `at`. */
export function wing(at: readonly number[], outline: readonly (readonly number[])[], x: readonly number[], yHint: readonly number[], color: string, rest: Rest = {}): Prim {
  const veins = rest.veins as unknown[] | undefined;
  if (veins?.length) return prim('wing', at, { outline: outline.map(r2), thickness: 0.0008, rotation: orient(x, yHint), color, ...rest });
  // Without veins a thin extrusion of the same outline: the wing membrane subdivides long, thin outlines
  // (petals, fronds) up to 256 times, which 32 specimens cannot afford.
  const { veins: _none, ...plain } = rest;
  void _none;
  return prim('extrude', at, { shape: outline.map(r2), depth: 0.0008, rotation: orient(x, yHint), color, ...plain });
}

/** A leaf / petal / fin outline: a pointed blade of length `l` and greatest width `w` (at `widest` of the length), base at the origin, along +X. */
export function blade(l: number, w: number, widest = 0.4, n = 10, tip = 1.6): V2[] {
  const top: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const half = (w / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, Math.log(0.5) / Math.log(widest))), 1 / tip);
    top.push([l * t, half]);
  }
  const bottom = top.slice(1, -1).reverse().map(([x, y]): V2 => [x, -y]);
  return [...top, ...bottom].map(r2);
}

/** A rounded fan (tail fin, flipper) of radius `r` opening through `angle` degrees about +X, hinge at the origin. */
export function fan(r: number, angle: number, n = 12, notch = 0): V2[] {
  const pts: V2[] = [[0, 0]];
  for (let i = 0; i <= n; i++) {
    const a = (-angle / 2 + (angle * i) / n) * DEG;
    const rr = r * (1 - notch * Math.exp(-((a / (angle * DEG * 0.12)) ** 2)));
    pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  return pts.map(r2);
}

/** Mirror a primitive in the specimen's mid-plane (z → −z): position, path, `up`, rotation (−rx, −ry, rz). */
export function mirrorZ(p: Prim): Prim {
  const q: Prim = { ...p, at: r3([p.at[0], p.at[1], -p.at[2]]) };
  if (Array.isArray(p.path)) q.path = (p.path as V3[]).map((v) => r3([v[0], v[1], -v[2]]));
  if (Array.isArray(p.up)) q.up = r3([(p.up as V3)[0], (p.up as V3)[1], -(p.up as V3)[2]]);
  if (Array.isArray(p.rotation)) {
    const [a, b, c] = p.rotation as V3;
    q.rotation = r3([-a, -b, c]);
  }
  return q;
}
/** A primitive and its mirror image. */
export const pair = (p: Prim): Prim[] => [p, mirrorZ(p)];

/** Translate a model from its own frame to scene position `to` (footprint centre on the cell floor). */
export function place(m: Model, to: readonly number[]): Model {
  const move = (p: Prim): Prim => ({ ...p, at: r3(add(p.at, to)) });
  return { primitive: move(m.primitive), extra: m.extra.map(move) };
}

/** Rotate a model about its own vertical axis by `deg` (positions, paths and the yaw of each piece), for case presentation. */
export function yaw(m: Model, deg: number): Model {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  const rot = (v: readonly number[]): V3 => [c * v[0]! + s * v[2]!, v[1]!, -s * v[0]! + c * v[2]!];
  const turn = (p: Prim): Prim => {
    const q: Prim = { ...p, at: r3(rot(p.at)) };
    if (Array.isArray(p.path)) q.path = (p.path as V3[]).map((v) => r3(rot(v)));
    if (Array.isArray(p.up)) q.up = r3(rot(p.up as V3));
    // Pre-multiply the piece's rotation by a turn about Y: recompute from its rotated axes.
    const R = eulerMatrix((p.rotation as V3 | undefined) ?? [0, 0, 0]);
    const X = rot([R[0]![0]!, R[1]![0]!, R[2]![0]!]);
    const Y = rot([R[0]![1]!, R[1]![1]!, R[2]![1]!]);
    q.rotation = orient(X, Y);
    return q;
  };
  return { primitive: turn(m.primitive), extra: m.extra.map(turn) };
}

/** Rotation matrix (rows) of Euler XYZ degrees, three.js order. */
export function eulerMatrix(e: readonly number[]): number[][] {
  const [a, b, c] = e.map((d) => d! * DEG) as [number, number, number];
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
  // three.js Matrix4.makeRotationFromEuler, order XYZ
  return [
    [cb * cc, -cb * sc, sb],
    [ca * sc + sa * sb * cc, ca * cc - sa * sb * sc, -sa * cb],
    [sa * sc - ca * sb * cc, sa * cc + ca * sb * sc, ca * cb],
  ];
}

/** A seeded pseudo-random generator (mulberry32), so the scatter of colonies and cells is fixed. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Points along a circle arc in the XZ plane (centre c, radius r, angles a0 → a1 degrees, y from y0 to y1). */
export function arc(c: readonly number[], r: number, a0: number, a1: number, n: number, y0: number, y1 = y0): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (a0 + (a1 - a0) * t) * DEG;
    pts.push([c[0]! + r * Math.cos(a), y0 + (y1 - y0) * t, c[2]! + r * Math.sin(a)]);
  }
  return pts;
}

/** The leg of a small animal: hip → knee (raised) → foot on the floor, as a tapering sweep. */
export function leg(hip: readonly number[], knee: readonly number[], foot: readonly number[], r: number, color: string, rest: Rest = {}): Prim {
  return sweep([hip, knee, foot], [r, r * 0.85, r * 0.6], color, { segments: 14, radial: 7, ...rest });
}

/** Scale a model uniformly about its own origin (positions, sizes, paths, radii, profiles, outlines): fitting a specimen to its cell. */
export function scaleModel(m: Model, k: number): Model {
  const s = (v: unknown) => (typeof v === 'number' ? n5(v * k) : v);
  const s2 = (v: unknown) => (Array.isArray(v) ? (v as number[][]).map((q) => q.map((x) => n5(x * k))) : v);
  const one = (p: Prim): Prim => {
    const q: Prim = { ...p, at: r3(mul(p.at, k)) };
    if (Array.isArray(p.size)) q.size = (p.size as number[]).map((x) => n5(x * k));
    for (const f of ['bevel', 'thickness', 'depth', 'hollow']) if (f in p) q[f] = s(p[f]);
    if (Array.isArray(p.radius)) q.radius = (p.radius as number[]).map((x) => n5(x * k));
    else if (typeof p.radius === 'number') q.radius = s(p.radius);
    for (const f of ['path', 'profile', 'outline', 'shape']) if (f in p) q[f] = s2(p[f]);
    if (Array.isArray(p.veins)) q.veins = (p.veins as number[][][]).map((v) => s2(v));
    if (p.rings && typeof p.rings === 'object') q.rings = { ...(p.rings as object), every: s((p.rings as { every: number }).every) };
    return q;
  };
  return { primitive: one(m.primitive), extra: m.extra.map(one) };
}
