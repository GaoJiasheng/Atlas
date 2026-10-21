/**
 * The side table of the heart-and-lungs scene (docs/40 §3.2, §3.5): procedural
 * teaching models beside the body, on the body's left (scene +X), table top
 * at chest-to-waist height. Not to scale with each other or with the body
 * (topic.yaml `note`). Scene metres, +Y up, +Z towards the viewer.
 *
 *   - a jar of air and a rack of four rows of balls (one ball = 1 per cent):
 *     nitrogen, oxygen, carbon dioxide, water vapour, top to bottom, each row
 *     starting on the same vertical line, so the rows read as a bar chart;
 *   - a fish in a glass tank, its left gill cover hinged at the front edge so a
 *     pose can lift it off four gill arches with rows of filaments;
 *   - a potted plant (the living-things chilli seedling, scaled up) with the two
 *     kinds of tube showing along the front of the stem.
 *
 * Every function returns primitives in scene coordinates, plus the flow paths
 * that belong to the fish and the plant (the body's flows come from
 * scripts/anatomy/heart-lungs/routes.json).
 */
import { add, bevel, blade, box, cross, cyl, ellipsoid, fan, lathe, mul, norm, r3, scaleModel, sphere, sweep, wing, type Prim, type V3 } from '../living-things/kit';
import { chilliSeedling } from '../living-things/specimens/plants';

/** Top surface of the table. */
export const TABLE_TOP = 0.115;
const FLOOR = -1.018;
const TABLE = { x0: 0.44, x1: 1.36, z0: -0.24, z1: 0.12, t: 0.03 };

const WOOD_LIGHT = 'token:bone';

export function sideTable(): { primitive: Prim; extra: Prim[] } {
  const cx = (TABLE.x0 + TABLE.x1) / 2;
  const cz = (TABLE.z0 + TABLE.z1) / 2;
  const top = bevel([cx, TABLE_TOP - TABLE.t / 2, cz], [TABLE.x1 - TABLE.x0, TABLE.t, TABLE.z1 - TABLE.z0], 0.004, 'wood');
  const legH = TABLE_TOP - TABLE.t - FLOOR;
  const legs: Prim[] = [];
  for (const x of [TABLE.x0 + 0.04, TABLE.x1 - 0.04]) {
    for (const z of [TABLE.z0 + 0.04, TABLE.z1 - 0.04]) legs.push(bevel([x, FLOOR + legH / 2, z], [0.032, legH, 0.032], 0.004, 'wood'));
  }
  // A rail under the top, front and back, so the long legs read as one table.
  const rail = (z: number) => bevel([cx, TABLE_TOP - TABLE.t - 0.03, z], [TABLE.x1 - TABLE.x0 - 0.08, 0.05, 0.016], 0.003, 'wood');
  return { primitive: top, extra: [...legs, rail(TABLE.z0 + 0.04), rail(TABLE.z1 - 0.04)] };
}

/* ------------------------------------------------------------------ air */

/** One ball = 1 per cent. Rows start at the same x and run along +X. */
export const BALL = { r: 0.0023, spacing: 0.0052, x0: 0.495 };
export const ROWS = [
  { id: 'n2-balls', count: 80, y: TABLE_TOP + 0.083, tint: 'token:air' },
  { id: 'o2-balls', count: 25, y: TABLE_TOP + 0.064, tint: 'token:oxygen' },
  { id: 'co2-balls', count: 6, y: TABLE_TOP + 0.045, tint: 'token:carbon-dioxide' },
  { id: 'h2o-balls', count: 8, y: TABLE_TOP + 0.026, tint: 'token:cold' },
] as const;
const RACK_Z = -0.03;
const BALL_Z = RACK_Z + 0.0105;

/** A ball row: the first ball at BALL.x0, `repeat` centred on `at` (the engine centres a row on its `at`). */
export function ballRow(row: (typeof ROWS)[number]): { primitive: Prim; repeat: { count: number; axis: V3; spacing: number } } {
  const at: V3 = [BALL.x0 + ((row.count - 1) / 2) * BALL.spacing, row.y, BALL_Z];
  return {
    primitive: sphere(at, BALL.r, 'plastic', { tint: row.tint }),
    repeat: { count: row.count, axis: [1, 0, 0], spacing: BALL.spacing },
  };
}

/** The rack the rows sit on: an upright board with a ledge under each row and a blank tag at the start of each. */
export function ballRack(): { primitive: Prim; extra: Prim[] } {
  const len = 80 * BALL.spacing + 0.03;
  const cx = BALL.x0 - 0.018 + len / 2;
  const board = bevel([cx, TABLE_TOP + 0.05, RACK_Z], [len, 0.09, 0.006], 0.0015, 'wood');
  const extra: Prim[] = [bevel([cx, TABLE_TOP + 0.004, RACK_Z + 0.012], [len, 0.008, 0.036], 0.002, 'wood')];
  for (const row of ROWS) {
    extra.push(box([cx, row.y - BALL.r - 0.0007, BALL_Z - 0.001], [len - 0.004, 0.0014, 0.007], 'wood'));
    extra.push(bevel([BALL.x0 - 0.012, row.y, BALL_Z], [0.01, 0.009, 0.004], 0.001, 'wood', { tint: WOOD_LIGHT }));
  }
  return { primitive: board, extra };
}

/** The jar of air: a glass jar with a lid, behind the start of the rack. */
export const JAR_AT: V3 = [0.53, TABLE_TOP + 0.085, -0.15];
export function airJar(): { primitive: Prim; extra: Prim[] } {
  // A thin-walled glass jar (a closed profile: outside up, inside down), open at the neck under the lid.
  const R = 0.045;
  const H = 0.15;
  const wall = 0.0025;
  const base: V3 = [JAR_AT[0], TABLE_TOP, JAR_AT[2]];
  const jar = lathe(
    base,
    [
      [0, 0],
      [R - 0.006, 0],
      [R, 0.006],
      [R, H - 0.02],
      [R * 0.78, H - 0.006],
      [R * 0.74, H],
      [R * 0.74 - wall, H],
      [R * 0.78 - wall, H - 0.006],
      [R - wall, H - 0.02],
      [R - wall, 0.008],
      [R - 0.006 - wall, wall],
      [0, wall],
    ],
    'glass',
    { segments: 40 },
  );
  return {
    primitive: jar,
    extra: [cyl([base[0], TABLE_TOP + H + 0.007, base[2]], R * 0.8, R * 0.8, 0.014, 'plastic', { tint: 'token:ink-3' })],
  };
}

/* ----------------------------------------------------------------- fish */

/** Fish frame: origin at the middle of the body, head towards −X, left side (and the opened gill cover) towards +Z. */
export const FISH_AT: V3 = [1.07, TABLE_TOP + 0.085, -0.07];
const FISH_TINT = '#9ea6a7';
const FIN_TINT = '#7d8786';
const f = (p: readonly number[]): V3 => r3(add(FISH_AT, p));

/** Half-thickness of the body (z) at x, for placing pieces on its left surface. */
function bodyR(x: number): number {
  const xs = [-0.1, -0.085, -0.06, -0.03, 0, 0.03, 0.06, 0.08, 0.09];
  const rs = [0.004, 0.018, 0.03, 0.036, 0.035, 0.028, 0.017, 0.008, 0.007];
  for (let i = 0; i < xs.length - 1; i++) {
    if (x <= xs[i + 1]!) {
      const t = (x - xs[i]!) / (xs[i + 1]! - xs[i]!);
      return rs[i]! + (rs[i + 1]! - rs[i]!) * Math.max(0, Math.min(1, t));
    }
  }
  return rs[rs.length - 1]!;
}
const FLAT = 0.55;
/** z of the left surface at (x, y = 0). */
const surface = (x: number) => bodyR(x) * FLAT;

export function fishBody(): { primitive: Prim; extra: Prim[] } {
  const xs = [-0.1, -0.085, -0.06, -0.03, 0, 0.03, 0.06, 0.08, 0.09];
  const pts = xs.map((x) => f([x, 0, 0]));
  const body = sweep(pts, xs.map(bodyR), 'tissue', { tint: FISH_TINT, section: { flat: FLAT }, up: [0, 0, 1], radial: 16, segments: 48 });
  const tail = wing(f([0.087, 0, 0]), fan(0.05, 64, 12, 0.35), [1, 0, 0], [0, 1, 0], 'tissue', { tint: FIN_TINT });
  const dorsal = wing(f([-0.02, 0.033, 0]), [[0, 0], [0.012, 0.022], [0.035, 0.024], [0.055, 0.008], [0.06, -0.004], [0.0, -0.004]], [1, 0, 0], [0, 1, 0], 'tissue', { tint: FIN_TINT });
  const anal = wing(f([0.03, -0.024, 0]), [[0, 0.004], [0.006, -0.014], [0.032, -0.012], [0.04, 0.002]], [1, 0, 0], [0, 1, 0], 'tissue', { tint: FIN_TINT });
  const pectoral = wing(f([-0.04, -0.012, surface(-0.04) - 0.002]), blade(0.03, 0.012, 0.35, 8, 1.4), [0.85, -0.2, 0.5], [0, 1, 0], 'tissue', { tint: FIN_TINT });
  const pelvic = wing(f([-0.005, -0.028, 0.004]), blade(0.022, 0.008, 0.35, 8, 1.4), [0.8, -0.5, 0.3], [0, 1, 0], 'tissue', { tint: FIN_TINT });
  const eye = sphere(f([-0.078, 0.007, surface(-0.078) - 0.0005]), 0.0042, 'eye');
  const eyeR = sphere(f([-0.078, 0.007, -surface(-0.078) + 0.0005]), 0.0042, 'eye');
  const mouth = ellipsoid(f([-0.1, -0.002, 0]), 0.0035, [0.6, 0.7, 1.2], 'tissue', { tint: '#3d3a38' });
  // The gill chamber under the cover: a dark recess the arches sit in.
  const chamber = ellipsoid(f([-0.054, 0, surface(-0.054) - 0.003]), 0.022, [0.8, 1.1, 0.18], 'tissue', { tint: '#4a2a2c' });
  return { primitive: body, extra: [tail, dorsal, anal, pectoral, pelvic, eye, eyeR, mouth, chamber] };
}

/** Four gill arches (curved, front to back), each with a column of thin filaments. */
export const GILL_X = [-0.064, -0.058, -0.052, -0.046];
export function gills(): { primitive: Prim; extra: Prim[] } {
  const prims: Prim[] = [];
  for (const [i, x] of GILL_X.entries()) {
    const z = surface(-0.054) + 0.0005 + i * 0.0003;
    const h = 0.034 - i * 0.003;
    const arch = sweep(
      [f([x + 0.004, h / 2, z - 0.002]), f([x, h / 4, z]), f([x - 0.001, 0, z + 0.0005]), f([x, -h / 4, z]), f([x + 0.004, -h / 2, z - 0.002])],
      0.0014,
      'tissue',
      { tint: 'token:blood-poor', radial: 6, segments: 16 },
    );
    const filaments: Prim = {
      kind: 'fins',
      size: [0.0045, 0.0016, 0.0005],
      count: 26 - i * 2,
      gap: 0.0011,
      axis: 'y',
      at: f([x + 0.003, 0, z + 0.0004]),
      color: 'tissue',
      tint: 'token:blood-rich',
    };
    prims.push(arch, filaments);
  }
  const [primitive, ...extra] = prims;
  return { primitive: primitive!, extra };
}

/** The left gill cover: a thin D-shaped plate over the gill chamber, hinged on its straight front edge and tilted to lie along the body. */
export const GILL_HINGE: V3 = f([-0.073, 0, surface(-0.073) + 0.0045]);
const COVER_OUTLINE = [
  [0, -0.021],
  [0.012, -0.023],
  [0.024, -0.018],
  [0.03, -0.007],
  [0.031, 0.004],
  [0.026, 0.015],
  [0.014, 0.022],
  [0, 0.021],
];
export function gillCover(): Prim {
  return { kind: 'extrude', shape: COVER_OUTLINE, depth: 0.0014, rotation: [0, -9.5, 0], at: GILL_HINGE, color: 'tissue', tint: FISH_TINT };
}

/** The glass tank and the water in it (context, in the compare group). */
export function fishTank(): { primitive: Prim; extra: Prim[] } {
  const c: V3 = [FISH_AT[0], TABLE_TOP + 0.08, FISH_AT[2]];
  return {
    primitive: bevel(c, [0.32, 0.16, 0.16], 0.004, 'glass'),
    extra: [
      bevel([c[0], TABLE_TOP + 0.0705, c[2]], [0.31, 0.135, 0.15], 0.003, 'glass', { tint: 'token:cold' }),
      bevel([c[0], TABLE_TOP + 0.005, c[2]], [0.33, 0.01, 0.17], 0.002, 'plastic', { tint: 'token:ink-3' }),
    ],
  };
}

/** Water past the gills: in at the mouth, over the arches, out under the back edge of the cover (4 paths). */
export function fishWaterPaths(): { id: string; path: V3[] }[] {
  return [-0.011, -0.004, 0.004, 0.011].map((y, k) => ({
    id: `water-${k + 1}`,
    path: [
      f([-0.15, y * 1.4, 0.004]),
      f([-0.118, y * 0.5, 0.002]),
      f([-0.1, y * 0.2, 0.001]),
      f([-0.082, y, 0.008]),
      f([-0.066, y, surface(-0.06) + 0.004]),
      f([-0.05, y, surface(-0.05) + 0.006]),
      f([-0.032, y * 1.1, surface(-0.032) + 0.014]),
      f([-0.005, y * 1.2, surface(-0.005) + 0.03]),
    ],
  }));
}

/** Oxygen from the water into the arches, carbon dioxide back out (2 paths each). */
export function fishGasPaths(dir: 'in' | 'out'): { id: string; path: V3[] }[] {
  return [0.006, -0.008].map((y, k) => {
    const x = GILL_X[k + 1]!;
    const water = f([x + 0.006, y, surface(-0.054) + 0.012]);
    const arch = f([x + 0.001, y, surface(-0.054) + 0.0015]);
    const mid = f([x + 0.004, y + 0.002, surface(-0.054) + 0.007]);
    return { id: `gill-${k + 1}`, path: dir === 'in' ? [water, mid, arch] : [arch, mid, water] };
  });
}

/* ---------------------------------------------------------------- plant */

export const PLANT_AT: V3 = [1.29, TABLE_TOP, -0.07];
const PLANT_SCALE = 4.5;

/** The chilli seedling of living-things (#5), 4.5 times larger: pot (context) and plant. */
export function plant(): { pot: Prim; primitive: Prim; extra: Prim[] } {
  const m = scaleModel(chilliSeedling(), PLANT_SCALE);
  const move = (p: Prim): Prim => ({ ...p, at: r3(add(p.at, PLANT_AT)) });
  const [stem, ...rest] = m.extra.map(move);
  // The two kinds of tube, showing along the front of the stem: water (cold) and food (food).
  const tube = (dx: number, tint: string) =>
    sweep(
      STEM.map((p) => add(PLANT_AT, add(p, [dx, 0, STEM_R * 0.62]))),
      STEM_R * 0.26,
      'tissue',
      { tint, radial: 6, segments: 24 },
    );
  // Three more pairs of true leaves along the stem, so the young plant reads as a plant at the bench camera.
  const more: Prim[] = [];
  for (const [k, y] of [0.03, 0.036, 0.047].entries()) {
    const a = (k * 70 + 25) * (Math.PI / 180);
    for (const s of [1, -1]) {
      const dir: V3 = [Math.cos(a) * s, 0.42, Math.sin(a) * s];
      more.push(leaf(add(PLANT_AT, stemAt(y * PLANT_SCALE, 0, 0)), dir, (0.019 - k * 0.002) * PLANT_SCALE, (0.0085 - k * 0.0008) * PLANT_SCALE));
    }
  }
  return { pot: move(m.primitive), primitive: stem!, extra: [...rest, ...more, tube(-STEM_R * 0.34, 'token:cold'), tube(STEM_R * 0.34, 'token:food')] };
}
const LEAF_GREEN = '#5d8f35';
/** A leaf blade at `at` pointing along `dir`, its upper face towards the light (as the living-things seedling). */
function leaf(at: readonly number[], dir: readonly number[], l: number, w: number): Prim {
  const x = norm(dir);
  const across = norm(cross([0, 1, 0], x));
  return wing(at, blade(l, w, 0.4, 12, 1.5), x, across, 'tissue', { tint: LEAF_GREEN });
}
/** The stem centre line in the plant frame (the seedling's stem sweep, scaled). */
const STEM: V3[] = [
  [0, 0.018, 0],
  [0.0015, 0.04, 0],
  [0.001, 0.064, 0.001],
].map((p) => r3(mul(p, PLANT_SCALE)));
const STEM_R = 0.0016 * PLANT_SCALE;
const SOIL_Y = 0.02 * PLANT_SCALE - 0.003;

const pl = (p: readonly number[]): V3 => r3(add(PLANT_AT, p));
const lerp = (a: readonly number[], b: readonly number[], t: number): V3 => [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t, a[2]! + (b[2]! - a[2]!) * t];
/** Point on the stem at height y (plant frame), in front by `dz`, sideways by `dx`. */
function stemAt(y: number, dx: number, dz: number): V3 {
  const [a, b, c] = STEM as [V3, V3, V3];
  const p = y <= b[1] ? lerp(a, b, (y - a[1]) / (b[1] - a[1])) : lerp(b, c, (y - b[1]) / (c[1] - b[1]));
  return [p[0] + dx, y, p[2] + dz];
}
/** Leaves of the seedling (plant frame): base and direction (unit), length; from chilliSeedling. */
function leafLine(base: readonly number[], dir: readonly number[], len: number, t: number): V3 {
  const l = Math.hypot(dir[0]!, dir[1]!, dir[2]!);
  return add(mul(base, PLANT_SCALE), mul(dir, (len * PLANT_SCALE * t) / l));
}
const FRONT_LEAF = { base: [0.0014, 0.054, 0.0005], dir: [0.25, 0.45, 1], len: 0.022 };
const SIDE_LEAF = { base: [0.001, 0.062, 0.001], dir: [1, 0.7, -0.2], len: 0.016 };
const SEED_LEAF = { base: [0.0012, 0.042, 0], dir: [-1, 0.3, -0.15], len: 0.017 };

/** Water: from the soil up the water tube into two leaves. Food: from two leaves down the food tube into the soil (roots). */
export function plantPaths(kind: 'water' | 'food'): { id: string; path: V3[] }[] {
  const dx = kind === 'water' ? -STEM_R * 0.34 : STEM_R * 0.34;
  const dz = STEM_R * 0.62 + STEM_R * 0.3;
  const leaves = [FRONT_LEAF, SIDE_LEAF];
  return leaves.map((leaf, k) => {
    const top = leaf.base[1]! * PLANT_SCALE;
    const up: V3[] = [];
    const y0 = SOIL_Y - 0.03;
    for (let i = 0; i <= 8; i++) up.push(stemAt(y0 + ((top - y0) * i) / 8, dx, dz));
    const out = [0.25, 0.5, 0.75, 0.95].map((t) => leafLine(leaf.base, leaf.dir, leaf.len, t));
    const path = [...up, ...out].map(pl);
    return { id: `${kind}-${k + 1}`, path: kind === 'water' ? path : path.reverse() };
  });
}

/** Oxygen into the leaves through the tiny openings underneath, carbon dioxide out (3 paths each). */
export function plantGasPaths(dir: 'in' | 'out'): { id: string; path: V3[] }[] {
  const spots = [
    { leaf: FRONT_LEAF, t: 0.55 },
    { leaf: SIDE_LEAF, t: 0.6 },
    { leaf: SEED_LEAF, t: 0.6 },
  ];
  return spots.map(({ leaf, t }, k) => {
    const on = leafLine(leaf.base, leaf.dir, leaf.len, t);
    const under: V3 = add(on, [0, -0.006, 0]);
    const away: V3 = add(on, [0.012 * Math.sign(leaf.dir[0]!), -0.04, 0.01]);
    const path = [away, lerp(away, under, 0.6), under].map(pl);
    return { id: `leaf-${k + 1}`, path: dir === 'in' ? path : [...path].reverse().map((p) => r3(add(p, [0.004, 0, 0.003]))) };
  });
}

