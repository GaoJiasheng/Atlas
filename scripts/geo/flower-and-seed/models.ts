/**
 * The specimens built new for the flower-and-seed table (docs/41 §3.4): each
 * in its own frame — origin at the centre of its footprint on the table top,
 * +Y up, its front (the side the reader at the table's centre looks at)
 * towards +Z, the reader's right towards +X — then turned and placed by
 * build-parts.ts. Proportions follow the reference photographs listed in
 * docs/41 §3.3 and the sizes of §2.7 (fact-check pass 2): a female sunbird
 * about 10.5 cm long, a cave nectar bat with a 10 cm body and a wingspan of
 * about 42 cm, durian flowers 5–7 cm wide, a rubber-tree capsule 5 cm across
 * with three marbled seeds 2.5 cm wide, a sea almond 5.5 cm long, green beans
 * 4.7 mm long drawn ten times. Paths, profiles and outlines are relative to
 * each primitive's `at`; turning a model rewrites only `at` and `rotation`.
 */
import { blade, cone, cross, DEG, ellipsoid, eulerMatrix, fan, lathe, norm, orient, r2, r3, rng, sphere, sweep, type Model, type Prim, type V2, type V3 } from '../living-things/kit';
import { eulerOf, mulMM, mulMV, type M3 } from './reuse';

/* ------------------------------------------------------------ helpers */

export const add3 = (a: readonly number[], b: readonly number[]): V3 => r3([a[0]! + b[0]!, a[1]! + b[1]!, a[2]! + b[2]!]);
export const sub3 = (a: readonly number[], b: readonly number[]): V3 => r3([a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!]);

/** Turn a model about `origin` by rotation M (positions and each piece's rotation; paths stay in each piece's own frame). */
export function turnModel(m: Model, M: M3, origin: readonly number[] = [0, 0, 0]): Model {
  const one = (p: Prim): Prim => ({
    ...p,
    at: add3(origin, mulMV(M, sub3(p.at, origin))),
    rotation: eulerOf(mulMM(M, eulerMatrix((p.rotation as number[] | undefined) ?? [0, 0, 0]))),
  });
  return { primitive: one(m.primitive), extra: m.extra.map(one) };
}
export const shiftModel = (m: Model, d: readonly number[]): Model => ({
  primitive: { ...m.primitive, at: add3(m.primitive.at, d) },
  extra: m.extra.map((p) => ({ ...p, at: add3(p.at, d) })),
});
export const prims = (m: Model): Prim[] => [m.primitive, ...m.extra];
export const model = (ps: Prim[]): Model => ({ primitive: ps[0]!, extra: ps.slice(1) });

/** A flat outline (its XY) laid with outline +X along `x` and +Y towards `yHint`, a thin extrusion (`depth`). */
export function sheet(at: readonly number[], outline: readonly (readonly number[])[], x: readonly number[], yHint: readonly number[], depth: number, color: string, rest: Record<string, unknown> = {}): Prim {
  return { kind: 'extrude', shape: outline.map(r2), depth: r3([depth, 0, 0])[0], rotation: orient(x, yHint), color, ...rest, at: r3(at) };
}
const lowSweep = (pts: readonly (readonly number[])[], radius: number | readonly number[], color: string, rest: Record<string, unknown> = {}) =>
  sweep(pts, radius, color, { radial: 8, ...rest });


/* ============================================================ colours */
// Product colours of the specimens (fixed hex: the colour of the thing in both themes).
export const C = {
  frond: '#5f9a2c',
  frondUnder: '#86ad55',
  sorus: '#7a4f2c',
  bark: '#6e553d',
  moss: '#5b8a2c',
  stone: '#86837c',
  seta: '#9a6a32',
  bract: '#b8322a',
  costusFlower: '#e3832f',
  stem: '#4f7a32',
  olive: '#7c8a3c',
  yellow: '#ddb93a',
  beak: '#2b2620',
  batFur: '#6a4c33',
  batWing: '#3b2a20',
  pollen: '#e0b83a',
  branch: '#6e553d',
  durian: '#efe6c8',
  calyx: '#b5ad74',
  figSkin: '#6f8f3a',
  figFlesh: '#e9dfc0',
  floret: '#b0655a',
  wasp: '#2a2420',
  cellWarm: '#e9c29b',
  nucleus: '#8a5a3c',
  almond: '#b5523a',
  cork: '#cdb48a',
  airSpace: '#5a4a3a',
  kernel: '#e8dcc0',
  rubber: '#9a7a4a',
  rubberSeed: '#8a6a48',
  marble: '#4e3a28',
  balsam: '#8fa05a',
  balsamSeed: '#4a3a2a',
  ripeFig: '#a0644e',
  bean: '#5f8a3a',
  hilum: '#efe8cf',
  cotton: '#efebe1',
  cottonDry: '#f7f5ef',
  towel: '#dcdad3',
  soil: '#6b5440',
  card: '#f2efe7',
  sill: '#e9e4d8',
  cupboard: '#9a6a3e',
  fridge: '#f1efe9',
  table: '#d3b58b',
  water: '#6c919a',
  beeDark: '#2e2620',
  beeEye: '#2e2620',
  beeFur: '#b08a4a',
  beeAmber: '#c0893a',
  zona: '#d8b58c',
  husk: '#8c6240',
  shell: '#4e3a2a',
  flesh: '#f1ece0',
  sectionGreen: '#6f8a3e',
  petal: '#ece6d6',
  anther: '#6f6190',
  ovule: '#f2ead0',
} as const;

/* =========================================================== 01 fern */

/** A strap-shaped frond outline of length l, greatest width w (bird's nest fern: a narrow base, entire and slightly wavy margin, a pointed tip). */
function frondOutline(l: number, w: number): V2[] {
  const top: V2[] = [];
  const n = 22;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const body = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.55);
    const base = Math.min(1, 0.25 + t * 4);
    const wave = 1 + 0.04 * Math.sin(t * 30);
    top.push([l * t, (w / 2) * body * base * wave]);
  }
  const bottom = top.slice(1, -1).reverse().map(([x, y]): V2 => [x, -y * 0.97]);
  return [...top, ...bottom].map(r2);
}

/**
 * Bird's nest fern drawn a quarter of life size (fronds about 80 cm long →
 * 20 cm, up to 20 cm wide → 5 cm): twelve broad, bright green fronds rising
 * from a nest of brown roots and old frond bases and arching outwards round
 * a funnel. Each frond is two flat pieces, the outer one bent further out.
 */
export function fernFronds(): Model {
  const ps: Prim[] = [lathe([0, 0, 0], [[0, 0], [0.045, 0], [0.05, 0.012], [0.044, 0.028], [0.03, 0.036], [0.018, 0.032], [0, 0.026]], 'fabric', { tint: C.bark, segments: 20 })];
  const L = 0.22;
  const W = 0.052;
  const whole = frondOutline(L, W);
  const split = 0.42;
  const half = (x: number) => {
    // Half-width of the outline at x (top edge).
    const top = whole.filter(([, y]) => y >= 0);
    for (let i = 1; i < top.length; i++) if (top[i]![0] >= x) {
      const [x0, y0] = top[i - 1]!;
      const [x1, y1] = top[i]!;
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
    return 0;
  };
  const w0 = half(L * split);
  const inner = [...whole.filter(([x, y]) => x < L * split && y >= 0), [L * split, w0], [L * split, -w0 * 0.97], ...whole.filter(([x, y]) => x < L * split && y < 0)].map(r2);
  const outer = [[0, w0] as V2, ...whole.filter(([x, y]) => x > L * split && y >= 0).map(([x, y]): V2 => [x - L * split, y]), ...whole.filter(([x, y]) => x > L * split && y < 0).map(([x, y]): V2 => [x - L * split, y]), [0, -w0 * 0.97] as V2].map(r2);
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 + 9 + (k % 2) * 6) * DEG;
    const rise = (50 + (k % 3) * 7) * DEG;
    const droop = rise - 34 * DEG;
    const dir1: V3 = [Math.cos(a) * Math.cos(rise), Math.sin(rise), Math.sin(a) * Math.cos(rise)];
    const dir2: V3 = [Math.cos(a) * Math.cos(droop), Math.sin(droop), Math.sin(a) * Math.cos(droop)];
    const base: V3 = [Math.cos(a) * 0.014, 0.028, Math.sin(a) * 0.014];
    ps.push(sheet(base, inner, dir1, norm(cross([0, 1, 0], dir1)), 0.0012, 'tissue', { tint: C.frond }));
    ps.push(sheet(add3(base, dir1.map((x) => x * L * split)), outer, dir2, norm(cross([0, 1, 0], dir2)), 0.0012, 'tissue', { tint: C.frond }));
  }
  return model(ps);
}

/** One frond laid upside down (underside up): the brown lines of spore cases along the veins of its top half. */
export function fernUnderside(): Model {
  const L = 0.2;
  const W = 0.045;
  const ps: Prim[] = [sheet([-L / 2, 0.0012, 0], frondOutline(L, W), [1, 0, 0], [0, 0, -1], 0.0014, 'tissue', { tint: C.frondUnder })];
  ps.push(lowSweep([[-L / 2, 0.0028, 0], [L * 0.46, 0.0028, 0]], [0.0016, 0.0006], 'tissue', { tint: C.sorus, section: { flat: 0.4 }, caps: 'flat', radial: 6 }));
  // Sori on every vein of the top (outer) half: narrow lines from the midrib out towards the margin, angled to the tip.
  for (let i = 0; i < 12; i++) {
    const x0 = -L / 2 + L * (0.5 + i * 0.036);
    const t = (x0 + L / 2) / L;
    const half = (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.72) * 0.86;
    for (const s of [1, -1]) {
      ps.push(lowSweep([[x0, 0.0024, s * 0.002], [x0 + half * 0.55, 0.0024, s * half]], 0.0007, 'tissue', { tint: C.sorus, section: { flat: 0.5 }, caps: 'flat', radial: 6, segments: 4 }));
    }
  }
  return model(ps.slice(0, 26));
}

/* ===================================================== 02 spores close */

/** A piece of frond underside, enlarged: three raised lines of spore cases (sori) running obliquely, beaded. */
export function sorusClose(): Model {
  const ps: Prim[] = [{ kind: 'bevelBox', size: [0.09, 0.004, 0.05], bevel: 0.0015, at: [0, 0.012, 0], rotation: [0, 0, 0], color: 'tissue', tint: C.frondUnder }];
  // A little stand under the leaf piece (a slide block).
  for (let i = 0; i < 3; i++) {
    const z = -0.016 + i * 0.016;
    ps.push(sweep([[-0.036, 0.0145, z + 0.009], [0.036, 0.0145, z - 0.009]], 0.0034, 'tissue', { tint: C.sorus, rings: { every: 0.0042, depth: 0.45 }, section: { flat: 0.7 }, radial: 10, segments: 48 }));
  }
  return model(ps);
}

/** A cushion of moss on a stone, enlarged (not to scale). */
export function mossCushion(): Model {
  const ps: Prim[] = [ellipsoid([0, 0.011, 0], 0.04, [1.1, 0.3, 0.85], 'abrasive', { tint: C.stone, rotation: [0, -20, 0] })];
  const bumps: [number, number, number][] = [[-0.012, 0.004, 0.017], [0.012, -0.006, 0.018], [0.016, 0.012, 0.012], [-0.006, -0.014, 0.013], [-0.024, -0.004, 0.01]];
  for (const [x, z, r] of bumps) ps.push(ellipsoid([x, 0.021, z], r, [1, 0.55, 1], 'fabric', { tint: C.moss }));
  return model(ps);
}

/** Moss capsules on thin stalks above the cushion: each capsule releases spores (not to scale). */
export function mossCapsules(): Model {
  const ps: Prim[] = [];
  const stalks: [number, number, number, number][] = [[-0.01, 0.002, 0.04, 8], [0.006, -0.004, 0.046, -6], [0.014, 0.008, 0.036, 14], [-0.002, 0.012, 0.042, -12], [-0.018, -0.006, 0.034, 4]];
  stalks.forEach(([x, z, h, lean], i) => {
    const top: V3 = [x + Math.sin(lean * DEG) * h, 0.028 + h, z];
    const base: V3 = [x, 0.026, z];
    const stalk = lowSweep([base, [x + Math.sin(lean * DEG) * h * 0.5, 0.028 + h * 0.55, z], top], [0.0007, 0.0006, 0.0005], 'tissue', { tint: C.seta, radial: 6, segments: 12 });
    const capsule = lathe(top, [[0, -0.001], [0.0022, 0.0015], [0.0028, 0.0048], [0.0024, 0.0072], [0.0018, 0.0082], [0.0012, 0.0088], [0, 0.009]], 'tissue', { tint: C.seta, segments: 12, rotation: [0, 0, -lean - 70 + (i % 2) * 10] });
    if (i === 0) ps.push(capsule, stalk);
    else ps.push(stalk, capsule);
  });
  return model(ps);
}

/* ===================================================== 04 visitors */

/** Height of the red flower head's base above the table, and its two open flowers (height fraction t up the head, direction). */
const RED_HEAD_Y = 0.17;

const RED_FLOWERS = [
  { t: 0.42, dir: [0.15, 0.12, 1] as V3 },
  { t: 0.62, dir: [1, 0.25, -0.2] as V3 },
];

/**
 * Scarlet spiral flag (Costus woodsonii): a cone-shaped head about 8 cm tall
 * of tightly overlapping red bracts, like a pine cone, on a leafy stem; small
 * orange tubular flowers stick out from between the bracts. The stem stands
 * in a block.
 */
export function redFlower(): Model {
  const ps: Prim[] = [];
  const y0 = RED_HEAD_Y;
  const coneR = (t: number) => 0.019 * Math.sin(Math.PI * (0.18 + 0.72 * t)) + 0.003;
  const prof: V2[] = [];
  for (let i = 0; i <= 10; i++) prof.push([i === 10 ? 0 : coneR(i / 10) * 0.92, (i / 10) * 0.08]);
  ps.push(lathe([0, y0, 0], [[0, 0], ...prof], 'tissue', { tint: C.bract, segments: 24 }));
  // Bracts: rounded scales pressed to the cone in a spiral, overlapping, their tips just standing off.
  const scale = blade(0.02, 0.019, 0.6, 10, 0.75);
  for (let i = 0; i < 24; i++) {
    const t = 0.02 + (i / 24) * 0.86;
    const y = y0 + t * 0.08;
    const r = coneR(t);
    const slope = (coneR(Math.min(1, t + 0.05)) - coneR(Math.max(0, t - 0.05))) / (0.1 * 0.08);
    const a = i * 137.5;
    const out: V3 = [Math.cos(a * DEG), 0, -Math.sin(a * DEG)];
    const up = norm([out[0] * (slope + 0.12), 1, out[2] * (slope + 0.12)]);
    ps.push(sheet(add3([0, y, 0], out.map((x) => x * (r * 0.92 + 0.0006))), scale, up, norm(cross(up, out)), 0.0012, 'tissue', { tint: C.bract }));
  }
  // Two flowers: orange tubes standing out of the head, towards the front and the right.
  for (const f of RED_FLOWERS) {
    const o = norm(f.dir);
    const base = add3([0, y0 + f.t * 0.08, 0], [o[0] * coneR(f.t) * 0.7, 0, o[2] * coneR(f.t) * 0.7]);
    ps.push(lathe(base, [[0, 0], [0.0035, 0.003], [0.0038, 0.022], [0.0058, 0.029], [0.0075, 0.033], [0.007, 0.0345], [0.0026, 0.029], [0, 0.029]], 'tissue', { tint: C.costusFlower, segments: 16, rotation: orient(o, [0, 1, 0]).map((v, k) => (k === 2 ? v - 90 : v)) as V3 }));
  }
  ps.push(lowSweep([[0, 0.028, 0], [0.002, 0.09, 0.001], [0, y0 + 0.004, 0]], [0.0045, 0.0042, 0.004], 'tissue', { tint: C.stem, segments: 16 }));
  for (const [y, a] of [[0.07, 40], [0.11, 175]] as [number, number][]) {
    const dir: V3 = norm([Math.cos(a * DEG), 0.42, -Math.sin(a * DEG)]);
    ps.push(sheet([0, y, 0], blade(0.13, 0.042, 0.45, 14, 1.4), dir, norm(cross([0, 1, 0], dir)), 0.0012, 'tissue', { tint: C.stem }));
  }
  return model(ps);
}

/** The front flower's mouth (where the sunbird feeds), in the flower's frame. */
export const RED_FLOWER_MOUTH: V3 = (() => {
  const f = RED_FLOWERS[0]!;
  const o = norm(f.dir);
  const coneR = 0.019 * Math.sin(Math.PI * (0.18 + 0.72 * f.t)) + 0.003;
  return add3([0, RED_HEAD_Y + f.t * 0.08, 0], [o[0] * (coneR * 0.7 + 0.031), o[1] * 0.031, o[2] * (coneR * 0.7 + 0.031)]);
})();

/**
 * Female sunbird (olive-backed: olive-green above, yellow below; NParks
 * 2025), about 10.5 cm from beak to tail, perched. Frame: facing +X, left
 * side +Z, feet at the origin. The thin, down-curved beak is about a fifth
 * of its length.
 */
export function sunbird(): Model {
  const olive = { tint: C.olive };
  const yellow = { tint: C.yellow };
  const dark = { tint: C.beak };
  const ps: Prim[] = [
    ellipsoid([0, 0.021, 0], 0.0145, [1.55, 0.88, 0.86], 'feathers', { ...olive, rotation: [0, 0, 28] }),
    ellipsoid([0.002, 0.0175, 0], 0.0135, [1.45, 0.8, 0.84], 'feathers', { ...yellow, rotation: [0, 0, 28] }),
    sphere([0.0195, 0.0365, 0], 0.0088, 'feathers', olive),
    ellipsoid([0.0215, 0.0315, 0], 0.0062, [1.1, 0.9, 0.9], 'feathers', yellow),
    ...[0.0105, -0.0105].map((z) => sheet([0.012, 0.0285, z * 0.85], blade(0.04, 0.014, 0.32, 12, 1.2), [-1, -0.5, z > 0 ? 0.06 : -0.06], [0, -0.45, z > 0 ? 1 : -1], 0.0012, 'feathers', olive)),
    sheet([-0.017, 0.012, 0], fan(0.034, 26, 8), [-0.86, -0.5, 0], [0, 0, 1], 0.0012, 'feathers', olive),
    lowSweep([[0.0275, 0.037, 0], [0.036, 0.0365, 0], [0.043, 0.0335, 0], [0.0485, 0.028, 0]], [0.0019, 0.0014, 0.0009, 0.0003], 'chitin', { ...dark, segments: 16, radial: 8 }),
    ...[0.0032, -0.0032].flatMap((z) => [
      lowSweep([[0.002, 0.012, z], [0.0025, 0.005, z], [0.0015, 0.0012, z]], [0.0008, 0.0007, 0.0006], 'chitin', { ...dark, radial: 6, segments: 6 }),
      lowSweep([[0.0015, 0.0012, z], [0.006, -0.0005, z], [0.0068, -0.004, z]], 0.00045, 'chitin', { ...dark, radial: 6, segments: 6 }),
      lowSweep([[0.0015, 0.0012, z], [-0.003, -0.0005, z], [-0.0042, -0.004, z]], 0.00045, 'chitin', { ...dark, radial: 6, segments: 6 }),
    ]),
    ...[0.0062, -0.0062].map((z) => sphere([0.0232, 0.0388, z], 0.0013, 'chitin', dark)),
  ];
  return model(ps);
}

/** The bird's beak tip in its own frame. */
export const SUNBIRD_BEAK_TIP: V3 = [0.0485, 0.028, 0];

/**
 * The bat's left wing, outline in its own plane: x along the body (forward
 * +), y outwards along the span. Skin from the arm out along the long
 * finger bones, scalloped between the finger tips, back to the hind leg.
 */
const BAT_WING: V2[] = [
  [0.016, 0.0], [0.024, 0.03], [0.028, 0.07], [0.026, 0.09], [0.012, 0.14], [-0.004, 0.2], [-0.02, 0.17], [-0.036, 0.165], [-0.048, 0.13],
  [-0.064, 0.118], [-0.07, 0.085], [-0.08, 0.06], [-0.066, 0.034], [-0.062, 0.012], [-0.044, 0.004],
];

const WRIST: V2 = [0.026, 0.09];

/** Arm (shoulder → wrist) and the three long finger bones (wrist → tips), in the wing plane. */
const BAT_BONES: V2[][] = [
  [[0.016, 0.004], [0.026, 0.045], WRIST],
  [WRIST, [0.012, 0.14], [-0.004, 0.2]],
  [WRIST, [-0.012, 0.13], [-0.036, 0.165]],
  [WRIST, [-0.03, 0.105], [-0.064, 0.118]],
];

/**
 * Cave nectar bat, life size, hovering at a flower: a furry body about 10 cm
 * long, a long muzzle, small ears, skin wings on long finger bones raised
 * high in the upstroke (wingspan about 42 cm), legs trailing; yellow dots on
 * the muzzle and face stand for pollen (diagram). Frame: facing +X, left
 * wing towards +Z, body centre at the origin.
 */
export function nectarBat(): Model {
  const fur = { tint: C.batFur };
  const dark = { tint: C.beak };
  const lift = 62 * DEG;
  const ps: Prim[] = [
    ellipsoid([0, 0, 0], 0.024, [2.0, 0.9, 1.0], 'fabric', { ...fur, rotation: [0, 0, -6] }),
    ellipsoid([0.045, 0.006, 0], 0.0145, [1.1, 0.95, 0.95], 'fabric', fur),
    ellipsoid([0.066, 0.0035, 0], 0.0085, [1.8, 0.75, 0.8], 'fabric', fur),
    ...[0.0085, -0.0085].map((z) => ellipsoid([0.042, 0.02, z], 0.0042, [0.6, 1.4, 0.5], 'fabric', { ...fur, rotation: [z > 0 ? 18 : -18, 0, 12] })),
    ...[0.0058, -0.0058].map((z) => sphere([0.061, 0.0095, z], 0.0021, 'chitin', dark)),
    ...[0.01, -0.01].map((z) => lowSweep([[-0.035, -0.006, z], [-0.05, -0.012, z * 1.6], [-0.062, -0.016, z * 1.9]], [0.0028, 0.0022, 0.0016], 'fabric', { ...fur, radial: 6, segments: 8 })),
  ];
  for (const s of [1, -1]) {
    // The wing plane: x along the body, its span raised `lift` above the horizontal on its own side.
    const spanDir: V3 = [0, Math.sin(lift), s * Math.cos(lift)];
    const root: V3 = [0.004, 0.008, s * 0.012];
    ps.push(sheet(root, BAT_WING, [1, 0, 0], spanDir, 0.0008, 'membrane', { tint: C.batWing }));
    for (const bone of BAT_BONES) {
      const pts = bone.map(([x, y]) => add3(root, [x, spanDir[1] * y, spanDir[2] * y]));
      ps.push(lowSweep(pts, [0.0022, 0.0016, 0.0009].slice(0, pts.length), 'chitin', { ...dark, radial: 6, segments: 10 }));
    }
  }
  const rand = rng(7);
  for (let i = 0; i < 8; i++) {
    const a = rand() * Math.PI * 2;
    const x = 0.052 + rand() * 0.024;
    const rr = 0.0078 + rand() * 0.003;
    ps.push(sphere([x, 0.004 + Math.cos(a) * rr * 0.8, Math.sin(a) * rr], 0.0015, 'tissue', { tint: C.pollen }));
  }
  return model(ps);
}

/** The bat's muzzle tip in its own frame. */
export const BAT_MUZZLE: V3 = [0.081, 0.003, 0];

/**
 * A cut durian branch with three flowers hanging from it (each 5–7 cm wide,
 * NParks): a stalk, a bell-shaped calyx, five cream petals spreading and
 * curling back, and bundles of long stamens hanging below. Frame: the branch
 * runs along X at about 25 cm, held in a block at its right end.
 */
export function durianFlowers(): Model {
  const bark = { tint: C.branch };
  const cream = { tint: C.durian };
  const ps: Prim[] = [lowSweep([[0.14, 0.028, -0.02], [0.145, 0.14, -0.022], [0.12, 0.235, -0.02], [0.02, 0.255, -0.018], [-0.1, 0.25, -0.02]], [0.0075, 0.007, 0.0062, 0.0052, 0.004], 'wood', { ...bark, segments: 32, radial: 10 })];
  DURIAN_AT.forEach(([x, z, hang], i) => {
    const top: V3 = [x, 0.25, z];
    const c: V3 = [x + 0.003, 0.25 - hang, z + 0.004];
    ps.push(lowSweep([top, [x + 0.002, 0.25 - hang * 0.5, z + 0.002], c], 0.0017, 'wood', { ...bark, radial: 6, segments: 8 }));
    ps.push(lathe(c, [[0, 0.002], [0.006, 0], [0.0095, -0.008], [0.0105, -0.018], [0.0098, -0.021], [0, -0.019]], 'wood', { ...bark, segments: 14 }));
    for (let k = 0; k < 5; k++) {
      const a = (k * 72 + i * 20) * DEG;
      const o: V3 = [Math.cos(a), 0, Math.sin(a)];
      const dir = norm([o[0] * 0.75, -0.62, o[2] * 0.75]);
      ps.push(sheet(add3(c, [o[0] * 0.008, -0.019, o[2] * 0.008]), blade(0.03, 0.013, 0.65, 10, 0.9), dir, norm(cross(dir, [0, 1, 0])), 0.001, 'tissue', cream));
    }
    for (let k = 0; k < 3; k++) {
      const a = (k * 120 + 40 + i * 30) * DEG;
      const o: V3 = [Math.cos(a), 0, Math.sin(a)];
      ps.push(lowSweep([add3(c, [o[0] * 0.002, -0.018, o[2] * 0.002]), add3(c, [o[0] * 0.006, -0.038, o[2] * 0.006]), add3(c, [o[0] * 0.012, -0.056, o[2] * 0.012])], [0.0014, 0.0016, 0.0028], 'tissue', { ...cream, radial: 6, segments: 10 }));
    }
  });
  return model(ps);
}

/* ============================================================ 05 fig */

/** A fig cut in half, enlarged (not to scale): a thick green-skinned wall, its inside lined with tiny flowers, a small opening of scales at the top. The cut faces +Z. */
export function figCut(): Model {
  const outer: V2[] = [[0, -0.001], [0.022, 0.004], [0.036, 0.024], [0.038, 0.048], [0.03, 0.07], [0.016, 0.084], [0.007, 0.089], [0.004, 0.09]];
  const skin: V2[] = [...outer, ...outer.slice().reverse().map(([r, y]): V2 => [Math.max(0, r - 0.003), y + (y > 0.08 ? -0.002 : 0.0025)])];
  skin.push(skin[0]!);
  // The flesh: from just inside the skin to the cavity wall, which is scalloped where the tiny flowers stand.
  const flesh: V2[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = 0.006 + t * 0.074;
    const rOut = 0.036 * Math.sin(Math.PI * (0.12 + 0.8 * t)) + 0.0035;
    flesh.push([Math.max(0, rOut - 0.003), y]);
  }
  const cavity: V2[] = [];
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const y = 0.016 + t * 0.054;
    const r = 0.02 * Math.sin(Math.PI * (0.06 + 0.88 * t)) * (1 + 0.08 * Math.cos(i * 2.6));
    cavity.push([Math.max(0.002, r), y]);
  }
  const fleshProfile: V2[] = [...flesh, [0.004, 0.081], ...cavity, [0.004, 0.014]];
  fleshProfile.push(fleshProfile[0]!);
  const ps: Prim[] = [
    lathe([0, 0, 0], fleshProfile, 'tissue', { tint: C.figFlesh, segments: 28, arc: 180 }),
    lathe([0, 0, 0], skin, 'tissue', { tint: C.figSkin, segments: 28, arc: 180 }),
  ];
  // Tiny flowers lining the cavity, seen on the cut: short stalks with a bead, pointing inwards.
  const rand = rng(11);
  for (let i = 0; i < 26; i++) {
    const t = 0.08 + 0.84 * (i / 25);
    const y = 0.016 + t * 0.054;
    const r = 0.02 * Math.sin(Math.PI * (0.06 + 0.88 * t));
    const side = i % 2 === 0 ? 1 : -1;
    const a = (side > 0 ? 8 : 172) + (rand() - 0.5) * 10;
    const wall: V3 = [Math.cos(a * DEG) * r, y, -Math.sin(a * DEG) * r * 0.2 + 0.0004];
    const tip: V3 = [wall[0] * 0.72, y + (rand() - 0.5) * 0.004, wall[2]];
    ps.push(lowSweep([wall, tip], [0.0011, 0.0016], 'tissue', { tint: C.floret, radial: 6, segments: 4, caps: 'round' }));
  }
  // Scales closing the opening at the top.
  ps.push(cone([0, 0.093, -0.002], 0.0055, 0.006, 'tissue', { tint: C.floret }));
  return model(ps);
}
export const FIG_OPENING: V3 = [0, 0.096, 0];

/** A fig wasp (not to scale): a slim dark body, two clear wings, feelers. Frame: facing +X, origin under the body. */
export function figWasp(): Model {
  const d = { tint: C.wasp };
  return model([
    ellipsoid([0, 0.003, 0], 0.0024, [2.6, 0.9, 1], 'chitin', d),
    ellipsoid([0.0072, 0.0034, 0], 0.0018, [1.2, 1, 1], 'chitin', d),
    ellipsoid([-0.007, 0.0028, 0], 0.0026, [1.7, 0.95, 1], 'chitin', d),
    ...[1, -1].map((s) => lowSweep([[0.0085, 0.0044, s * 0.0008], [0.011, 0.0068, s * 0.0016], [0.0135, 0.0075, s * 0.0022]], 0.00028, 'chitin', { ...d, radial: 6, segments: 6 })),
    ...[1, -1].map((s) => lowSweep([[0.002, 0.0015, s * 0.0015], [0.003, -0.0005, s * 0.004], [0.004, -0.0028, s * 0.005]], 0.0003, 'chitin', { ...d, radial: 6, segments: 6 })),
    ...[1, -1].map((s) => sheet([0.002, 0.0052, s * 0.001], blade(0.011, 0.0042, 0.55, 10, 1.1), [-1, 0.12, s * 0.42], [0, 1, 0], 0.0002, 'membrane', {})),
  ]);
}

/* ========================================================== 06 cells */

/** Male reproductive cell (diagram): a small round cell, its nucleus showing as a dark spot. */
export function maleCell(): Model {
  return model([sphere([0, 0, 0], 0.014, 'tissue', { tint: 'token:signal' }), sphere([0.0025, 0.004, 0.0108], 0.0052, 'tissue', { tint: C.nucleus })]);
}

/** Female reproductive cell (diagram): a larger round cell, its nucleus showing as a dark spot. */
export function femaleCell(): Model {
  return model([sphere([0, 0, 0], 0.034, 'tissue', { tint: C.cellWarm }), sphere([0.0065, 0.008, 0.0255], 0.011, 'tissue', { tint: C.nucleus })]);
}

/** Sperm (diagram): a small oval head and a long thin tail, in the male cell's colour. Frame: head at the origin, tail towards −X. */
export function sperm(): Model {
  const pts: V3[] = [];
  for (let i = 0; i <= 10; i++) pts.push([-0.006 - i * 0.0055, Math.sin(i * 0.9) * 0.0036 * (i / 10), 0]);
  return model([ellipsoid([0, 0, 0], 0.006, [1.45, 1, 0.75], 'tissue', { tint: 'token:signal' }), lowSweep(pts, pts.map((_, i) => 0.0016 * (1 - i / 12) + 0.0004), 'tissue', { tint: 'token:signal', radial: 6, segments: 30 })]);
}
/** Egg (diagram): a large round cell inside a clear outer layer, its nucleus showing as a dark spot. */
export function egg(): Model {
  return model([
    sphere([0, 0, 0], 0.04, 'tissue', { tint: C.cellWarm }),
    sphere([0, 0, 0], 0.047, 'membrane', { tint: C.zona }),
    sphere([-0.008, 0.009, 0.0305], 0.0125, 'tissue', { tint: C.nucleus }),
  ]);
}

/* ========================================================= 07 fruits */

/** Sea almond (Terminalia catappa) fruit, life size: a flattened egg shape about 5.5 cm long with a narrow ridge round its edge. Frame: long axis along X, lying flat. */
export function seaAlmond(): Model {
  const prof: V2[] = [[0, -0.0275], [0.007, -0.025], [0.014, -0.016], [0.0175, -0.004], [0.017, 0.008], [0.013, 0.019], [0.006, 0.026], [0, 0.0275]];
  const ridge: V3[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * 2 * Math.PI;
    ridge.push([Math.sin(a) * 0.0275 * (Math.sin(a) < 0 ? 1 : 0.98), 0.0005, Math.cos(a) * 0.0185]);
  }
  return model([
    lathe([0, 0.011, 0], prof, 'tissue', { tint: C.almond, segments: 24, scale: [1, 1, 0.62], rotation: [0, 0, 90] }),
    sweep(ridge, 0.0016, 'tissue', { tint: C.almond, section: { flat: 0.4 }, closed: true, radial: 6, segments: 48, at: [0, 0.011, 0] } as never),
  ]);
}

/** A sea almond cut in half lengthwise, the cut facing the reader: a thick corky layer full of small air spaces round a hard stone with one seed. */
export function seaAlmondCut(): Model {
  const outline = (r: number, h: number): V2[] => {
    const pts: V2[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI;
      pts.push([Math.max(0, r * Math.sin(a) * (1 - 0.18 * Math.cos(a))), -h * Math.cos(a)]);
    }
    return pts;
  };
  const shell = (r: number, h: number, t: number): V2[] => {
    const o = outline(r, h);
    const inner = outline(r - t, h - t).slice().reverse();
    return [...o, ...inner, o[0]!];
  };
  const turn: V3 = [-90, 0, 90];
  const ps: Prim[] = [
    lathe([0, 0.009, 0], shell(0.0178, 0.0281, 0.0068), 'wood', { tint: C.cork, segments: 24, arc: 180, rotation: turn, scale: [1, 1, 0.62] }),
    lathe([0, 0.009, 0], outline(0.011, 0.0213), 'tissue', { tint: C.kernel, segments: 20, arc: 180, rotation: turn, scale: [1, 1, 0.62] }),
  ];
  const rand = rng(5);
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.0128 + rand() * 0.0025;
    ps.push(ellipsoid([Math.cos(a) * rr * 1.55 * 0.98, 0.0093, Math.sin(a) * rr * 0.98], 0.0011 + rand() * 0.0006, [1.4, 0.35, 1], 'tissue', { tint: C.airSpace }));
  }
  return model(ps);
}

/** Three ripe figs (Ficus variegata, about 3 cm) on a short twig, lying on the table. */
export function ripeFigs(): Model {
  const ps: Prim[] = [lowSweep([[-0.05, 0.006, 0.004], [-0.01, 0.007, -0.002], [0.04, 0.006, 0.004]], [0.0035, 0.003, 0.0026], 'wood', { tint: C.branch, radial: 8, segments: 12 })];
  const fig: V2[] = [[0, 0], [0.008, 0.002], [0.014, 0.009], [0.0155, 0.017], [0.012, 0.026], [0.006, 0.0305], [0.0015, 0.031], [0, 0.0312]];
  const spots: [number, number, number][] = [[-0.032, 0.02, -45], [0.002, 0.024, 20], [0.028, -0.018, 110]];
  spots.forEach(([x, z, yawDeg], i) => {
    const dir: V3 = [Math.cos(yawDeg * DEG), 0.22, -Math.sin(yawDeg * DEG)];
    ps.push(lathe([x, 0.014, z], fig, 'tissue', { tint: C.ripeFig, segments: 18, rotation: orient(dir, [0, 1, 0]).map((v, k) => (k === 2 ? v - 90 : v)) as V3 }));
    if (i < 3) ps.push(lowSweep([[x * 0.7, 0.007, z * 0.2], [x, 0.012, z * 0.85]], 0.0016, 'wood', { tint: C.branch, radial: 6, segments: 4 }));
  });
  return model(ps);
}

/** Rubber tree fruit (Hevea brasiliensis): a woody three-lobed capsule about 5 cm across on a short stalk. */
export function rubberCapsule(): Model {
  const ps: Prim[] = [];
  for (let k = 0; k < 3; k++) {
    const a = k * 120 + 30;
    const o: V3 = [Math.cos(a * DEG), 0, -Math.sin(a * DEG)];
    ps.push(ellipsoid([o[0] * 0.0112, 0.021, o[2] * 0.0112], 0.0158, [1.05, 0.98, 0.78], 'wood', { tint: C.rubber, rotation: [0, a, 0] }));
  }
  ps.push(lowSweep([[0, 0.038, 0], [0.002, 0.047, 0.001]], 0.0022, 'wood', { tint: C.rubber, radial: 6, segments: 4 }));
  return model(ps);
}

/** Three rubber seeds (about 2.5 cm wide), shiny and marbled: brown with darker blotches. Frame: the three side by side. */
export function rubberSeeds(): Model {
  const ps: Prim[] = [];
  const rand = rng(3);
  const at: V3[] = [[-0.03, 0.0085, 0], [0, 0.0085, 0.006], [0.03, 0.0085, -0.002]];
  at.forEach((c, i) => ps.push(ellipsoid(c, 0.0125, [1, 0.68, 0.8], 'tissue', { tint: C.rubberSeed, rotation: [0, i * 40 + 10, 0] })));
  at.forEach((c) => {
    for (let j = 0; j < 7; j++) {
      const a = rand() * Math.PI * 2;
      const b = 0.35 + rand() * 0.5;
      const p: V3 = [c[0] + Math.cos(a) * 0.0124 * Math.cos(b), c[1] + 0.0085 * Math.sin(b), c[2] + Math.sin(a) * 0.0099 * Math.cos(b)];
      ps.push(ellipsoid(p, 0.003 + rand() * 0.0015, [1.6, 0.25, 1], 'tissue', { tint: C.marble, rotation: [b * 30, a / DEG, 0] }));
    }
  });
  return model(ps.slice(0, 24));
}

/** Garden balsam pod: a small, hairy, pointed green capsule about 2 cm long on a short stalk. */
export function balsamPod(): Model {
  const prof: V2[] = [[0, 0], [0.004, 0.002], [0.006, 0.007], [0.0062, 0.012], [0.0048, 0.017], [0.002, 0.0205], [0, 0.022]];
  return model([
    lathe([0, 0.0065, 0], prof, 'fabric', { tint: C.balsam, segments: 18, rotation: [0, 0, -90] }),
    lowSweep([[-0.001, 0.0065, 0], [-0.008, 0.007, 0.001], [-0.014, 0.0048, 0.002]], 0.0011, 'fabric', { tint: C.balsam, radial: 6, segments: 6 }),
  ]);
}

/* ===================================================== 08 seed inside */

/** A green (mung) bean, ten times life size: about 4.7 cm long, oval, with a white scar (hilum) along one side. */
export function beanWhole(): Model {
  return model([
    ellipsoid([0, 0.0175, 0], 0.0235, [1, 0.75, 0.8], 'tissue', { tint: C.bean, segments: 20 } as never),
    lowSweep([[-0.008, 0.0318, 0.004], [0.008, 0.0318, 0.004]], 0.0014, 'tissue', { tint: C.hilum, section: { flat: 0.5 }, radial: 6, segments: 4 }),
  ]);
}

/* ======================================================= 09 the test */

export const CUP = { r: 0.035, h: 0.09, base: 0.029 };

/** A clear plastic cup 7 cm across and 9 cm high (open top, thin wall). */
export function cupShell(): Prim {
  const { r, h, base } = CUP;
  return lathe([0, 0, 0], [[0, 0], [base, 0], [base + 0.0005, 0.002], [r, h], [r + 0.0016, h + 0.0012], [r - 0.0004, h + 0.0012], [base - 0.0008, 0.0022], [0, 0.0022]], 'glass', { segments: 40 });
}
/** A pad of cotton wool on the bottom of a cup, 1 cm deep. */
export const cotton = (tint: string): Prim => lathe([0, 0.002, 0], [[0, 0], [0.0285, 0], [0.0298, 0.004], [0.028, 0.009], [0.02, 0.0108], [0, 0.0112]], 'fabric', { tint, segments: 24 });

/** Five green beans lying on the cotton wool (one bean; the part repeats it round the cup). */
export const beanInCup = (): Prim => ellipsoid([0.012, 0.0157, 0], 0.0024, [1.2, 0.85, 0.9], 'tissue', { tint: C.bean });

/**
 * A mung bean seedling about a week old, standing in the cotton wool: a pale
 * stem with a crook, the two seed leaves split open, and a first pair of
 * small leaves. One material (the stem and leaves go pale together).
 */
export function seedlingInCup(height = 0.055): Prim[] {
  const g = { tint: 'token:seedling' };
  const top: V3 = [0.012, 0.012 + height, 0.001];
  const stem = lowSweep([[0.012, 0.011, 0], [0.0128, 0.012 + height * 0.45, 0.0008], [0.0115, 0.012 + height * 0.85, 0.001], top], [0.0011, 0.001, 0.0009, 0.0008], 'tissue', { ...g, radial: 6, segments: 10 });
  const coty = [1, -1].map((s) => ellipsoid(add3(top, [s * 0.0028, -0.002, 0]), 0.0024, [1.15, 0.5, 0.8], 'tissue', { ...g, rotation: [0, 0, s * 35] }));
  const leaves = [1, -1].map((s) => sheet(add3(top, [0, 0.0005, 0]), blade(0.011, 0.0055, 0.4, 8, 1.3), [s * 0.88, 0.47, 0], [0, 0, 1], 0.0006, 'tissue', g));
  return [stem, ...coty, ...leaves];
}

/** Seeds on a damp paper towel in a glass dish (the laboratory study's set-up, schematic): a dish 9 cm across, ten beans. */
export function towelDish(): Model {
  const ps: Prim[] = [
    lathe([0, 0, 0], [[0, 0], [0.045, 0], [0.0458, 0.0006], [0.0462, 0.012], [0.0447, 0.012], [0.0443, 0.0016], [0, 0.0016]], 'glass', { segments: 40 }),
    { kind: 'cylinder', size: [0.042, 0.042, 0.0008], at: [0, 0.002, 0], color: 'fabric', tint: C.towel },
  ];
  const rand = rng(13);
  for (let i = 0; i < 10; i++) {
    const a = i * 36 + rand() * 18;
    const rr = 0.012 + (i % 3) * 0.009 + rand() * 0.004;
    ps.push(ellipsoid([Math.cos(a * DEG) * rr, 0.0042, -Math.sin(a * DEG) * rr], 0.0024, [1.2, 0.85, 0.9], 'tissue', { tint: C.bean, rotation: [0, a + 40, 0] }));
  }
  return model(ps);
}

/** The day strip: a white card 13 cm × 2 cm with 13 ticks 1 cm apart, the 0th, 5th and 10th long; no numbers. Frame: along +X from x = 0. */
export function dayStrip(): Model {
  const ps: Prim[] = [{ kind: 'bevelBox', size: [0.14, 0.0018, 0.02], bevel: 0.0006, at: [0.06, 0.0009, 0], color: 'enamel', tint: C.card }];
  for (let d = 0; d <= 12; d++) {
    const long = d % 5 === 0;
    ps.push({ kind: 'box', size: [0.0007, 0.0004, long ? 0.011 : 0.006], at: [d * 0.01, 0.002, -0.009 + (long ? 0.0055 : 0.003)], color: 'token:ink-2' });
  }
  return model(ps);
}


/* ===================================================== furniture */

/** A windowsill 40 cm wide and the window frame behind it (a section of a wall, schematic). Frame: sill top at y = h. */
export function windowsill(h: number): Model {
  const w = 0.4;
  return model([
    { kind: 'bevelBox', size: [w, 0.022, 0.1], bevel: 0.004, at: [0, h - 0.011, 0], color: 'enamel', tint: C.sill },
    { kind: 'bevelBox', size: [w, h - 0.022, 0.06], bevel: 0.004, at: [0, (h - 0.022) / 2, -0.02], color: 'enamel', tint: C.sill },
    { kind: 'extrude', shape: [[-w / 2, 0], [w / 2, 0], [w / 2, 0.26], [-w / 2, 0.26]], holes: [[[-w / 2 + 0.025, 0.025], [-0.01, 0.025], [-0.01, 0.235], [-w / 2 + 0.025, 0.235]], [[0.01, 0.025], [w / 2 - 0.025, 0.025], [w / 2 - 0.025, 0.235], [0.01, 0.235]]], depth: 0.026, at: [0, h, -0.04], color: 'enamel', tint: C.sill },
  ]);
}

/** A small wall cupboard (26 × 24 × 20 cm), one compartment; its door is drawn swung open on its left hinges so the cup inside shows. Frame: floor of the cupboard at y = 0. */
export function cupboard(): Model {
  const W = 0.26, H = 0.24, D = 0.2, t = 0.01;
  const open = 100 * DEG;
  const hinge: V3 = [-W / 2, H / 2, D / 2];
  const along: V3 = [Math.cos(open), 0, Math.sin(open)];
  return model([
    { kind: 'box', size: [W, t, D], at: [0, t / 2, 0], color: 'wood', tint: C.cupboard },
    { kind: 'box', size: [W, t, D], at: [0, H - t / 2, 0], color: 'wood', tint: C.cupboard },
    { kind: 'box', size: [t, H, D], at: [-W / 2 + t / 2, H / 2, 0], color: 'wood', tint: C.cupboard },
    { kind: 'box', size: [t, H, D], at: [W / 2 - t / 2, H / 2, 0], color: 'wood', tint: C.cupboard },
    { kind: 'box', size: [W, H, t], at: [0, H / 2, -D / 2 + t / 2], color: 'wood', tint: C.cupboard },
    { kind: 'box', size: [W - 0.002, H - 0.004, t], at: add3(hinge, [along[0] * W / 2 - along[2] * t / 2, 0, along[2] * W / 2 + along[0] * t / 2]), rotation: [0, -100, 0], color: 'wood', tint: C.cupboard },
    { kind: 'cylinder', size: [0.004, 0.004, 0.026], at: add3(hinge, [along[0] * (W - 0.025) - along[2] * (t + 0.004), 0, along[2] * (W - 0.025) + along[0] * (t + 0.004)]), color: 'wood', tint: C.cupboard },
  ]);
}

/** A small fridge (30 × 36 × 28 cm), its front drawn cut away; one shelf. Frame: floor at y = 0. */
export function fridge(): Model {
  const W = 0.3, H = 0.36, D = 0.28, t = 0.022;
  return model([
    { kind: 'bevelBox', size: [W, t, D], bevel: 0.005, at: [0, t / 2, 0], color: 'enamel', tint: C.fridge },
    { kind: 'bevelBox', size: [W, t, D], bevel: 0.005, at: [0, H - t / 2, 0], color: 'enamel', tint: C.fridge },
    { kind: 'bevelBox', size: [t, H, D], bevel: 0.005, at: [-W / 2 + t / 2, H / 2, 0], color: 'enamel', tint: C.fridge },
    { kind: 'bevelBox', size: [t, H, D], bevel: 0.005, at: [W / 2 - t / 2, H / 2, 0], color: 'enamel', tint: C.fridge },
    { kind: 'bevelBox', size: [W, H, t], bevel: 0.005, at: [0, H / 2, -D / 2 + t / 2], color: 'enamel', tint: C.fridge },
    { kind: 'box', size: [W - 2 * t, 0.004, D - t], at: [0, FRIDGE_SHELF - 0.002, 0.005], color: 'enamel', tint: C.fridge },
  ]);
}


/**
 * Honeybee at ×20 (a worker is about 10–13 mm long; drawn 22 cm): a dark head
 * with big compound eyes and two elbowed feelers, a furry thorax, a banded
 * abdomen drooping behind, two pairs of clear wings held back over the body
 * and six legs. Frame: facing +X, left side +Z, origin at the centre of the
 * thorax.
 */
export function honeybee(): Model {
  const dark = { tint: C.beeDark };
  // The abdomen's axis: backwards and a little down from the waist.
  const axis: V3 = [-Math.cos(14 * DEG), -Math.sin(14 * DEG), 0];
  const waist: V3 = [-0.03, -0.004, 0];
  const absProfile: V2[] = [[0, 0], [0.016, 0.004], [0.027, 0.016], [0.031, 0.034], [0.029, 0.054], [0.021, 0.074], [0.01, 0.088], [0, 0.093]];
  const rAt = (d: number) => {
    for (let i = 1; i < absProfile.length; i++) if (absProfile[i]![1] >= d) {
      const [r0, y0] = absProfile[i - 1]!;
      const [r1, y1] = absProfile[i]!;
      return r0 + ((r1 - r0) * (d - y0)) / (y1 - y0);
    }
    return 0;
  };
  const absRot: V3 = [0, 0, 90 + 14];
  const ps: Prim[] = [
    ellipsoid([0, 0, 0], 0.03, [1.12, 0.95, 0.95], 'fabric', { tint: C.beeFur }),
    ellipsoid([0.05, -0.004, 0], 0.019, [0.7, 1.08, 1.0], 'chitin', dark),
    ...[1, -1].map((s) => ellipsoid([0.052, 0.002, s * 0.0135], 0.011, [0.7, 1.45, 0.55], 'chitin', { tint: C.beeEye })),
    ...[1, -1].map((s) => lowSweep([[0.062, 0.006, s * 0.006], [0.074, 0.03, s * 0.01], [0.09, 0.028, s * 0.022], [0.104, 0.018, s * 0.03]], [0.0016, 0.0014, 0.0013, 0.0015], 'chitin', { ...dark, segments: 12, radial: 6 })),
    lathe(waist, absProfile, 'chitin', { tint: C.beeAmber, segments: 24, rotation: absRot }),
    ...[0.03, 0.046, 0.062, 0.077].map((d) => {
      const r = rAt(d);
      const c = add3(waist, axis.map((x) => x * d));
      return lathe(c, [[r - 0.002, -0.0045], [r + 0.0009, -0.004], [r + 0.0011, 0.004], [r - 0.002, 0.0045]], 'chitin', { ...dark, segments: 24, rotation: absRot });
    }),
    ...[1, -1].flatMap((s) => [
      sheet([0.012, 0.028, s * 0.012], blade(0.09, 0.03, 0.42, 14, 1.2), [-1, 0.16, s * 0.42], [0, 1, 0], 0.0006, 'membrane', { tint: '#e8e4dc' }),
      sheet([-0.002, 0.026, s * 0.014], blade(0.064, 0.022, 0.45, 12, 1.2), [-1, 0.1, s * 0.62], [0, 1, 0], 0.0006, 'membrane', { tint: '#e8e4dc' }),
    ]),
    ...[1, -1].flatMap((s) =>
      [[0.018, 0.01], [0.0, 0.004], [-0.018, -0.012]].map(([x, fwd]) =>
        lowSweep([[x!, -0.02, s * 0.012], [x! + fwd! * 0.6, -0.03, s * 0.034], [x! + fwd!, -0.058, s * 0.042], [x! + fwd! * 1.4, -0.068, s * 0.046]], [0.0024, 0.002, 0.0017, 0.0013], 'chitin', { ...dark, segments: 12, radial: 6 }),
      ),
    ),
  ];
  return model(ps);
}

/** The three flowers along the branch: x, z of the stalk and how far each hangs. */
export const DURIAN_AT: [number, number, number][] = [[-0.07, -0.018, 0.034], [-0.025, 0.0, 0.05], [0.025, -0.024, 0.038]];

/**
 * A coconut, life size (about 21 cm long), cut in half lengthwise with the
 * cut facing up: a thick fibrous husk, a thin hard shell, a layer of white
 * flesh and the cavity inside (which holds water in a whole nut, NParks).
 */
export function coconut(): Model {
  const ovoid = (a: number, b: number): V2[] => {
    const pts: V2[] = [];
    for (let i = 0; i <= 18; i++) {
      const t = (i / 18) * Math.PI;
      pts.push([a * Math.sin(t) * (1 - 0.1 * Math.cos(t)), -b * Math.cos(t)]);
    }
    return pts;
  };
  const shell = (a: number, b: number, t: number): V2[] => {
    const o = ovoid(a, b);
    return [...o, ...ovoid(a - t, b - t).slice().reverse(), o[0]!].map(r2);
  };
  const up: V3 = [-90, 0, 90];
  return model([
    lathe([0, 0.001, 0], shell(0.085, 0.105, 0.028), 'fabric', { tint: C.husk, segments: 28, arc: 180, rotation: up }),
    lathe([0, 0.001, 0], shell(0.057, 0.077, 0.0035), 'wood', { tint: C.shell, segments: 28, arc: 180, rotation: up }),
    lathe([0, 0.001, 0], shell(0.0535, 0.0735, 0.011), 'tissue', { tint: C.flesh, segments: 28, arc: 180, rotation: up }),
  ]);
}

/**
 * A green bean seedling, life size, a few days after it came up through the
 * soil (seed leaves lifted above the soil: germination is epigeal, Oplinger
 * 1990): a pale stem, the two thick seed leaves, the first pair of leaves
 * opening, standing in a block of soil. One material for the plant.
 */
export function seedlingClose(): Model {
  const g = { tint: 'token:seedling' };
  const top: V3 = [0.002, 0.075, 0];
  return model([
    { kind: 'bevelBox', size: [0.07, 0.022, 0.05], bevel: 0.003, at: [0, 0.011, 0], color: 'abrasive', tint: C.soil },
    lowSweep([[0, 0.02, 0], [0.003, 0.045, 0.001], [-0.001, 0.065, 0], top], [0.0019, 0.0018, 0.0017, 0.0015], 'tissue', { ...g, segments: 16 }),
    ...[1, -1].map((s) => ellipsoid(add3(top, [s * 0.006, -0.006, 0]), 0.0055, [1.25, 0.55, 0.8], 'tissue', { ...g, rotation: [0, 0, s * 28] })),
    ...[1, -1].map((s) => sheet(add3(top, [0, 0.001, 0]), blade(0.03, 0.017, 0.42, 12, 1.3), [s * 0.82, 0.57, 0.05], [0, 0, 1], 0.0008, 'tissue', g)),
  ]);
}

/** Height of the small fridge's shelf top. */
export const FRIDGE_SHELF = 0.15;

/**
 * A chilli flower cut in half lengthwise, ×20 (built for this table; the cut
 * faces +Z): the green calyx cup, the white petals joined at the base and
 * spreading, three of the five stamens (white stalks, purple anthers) round
 * the pistil — a rounded green ovary, the style and the knob of the stigma.
 * The ovary is hollow on the cut; the ovules are a separate part.
 */
export function flowerSection(): Model {
  const green = { tint: C.sectionGreen };
  const white = { tint: C.petal };
  const ovary: V2[] = [[0, 0.03], [0.018, 0.032], [0.026, 0.044], [0.025, 0.06], [0.016, 0.07], [0.006, 0.074], [0.004, 0.072], [0.012, 0.066], [0.019, 0.058], [0.02, 0.045], [0.014, 0.037], [0.004, 0.036], [0.004, 0.03]];
  const ps: Prim[] = [
    lathe([0, 0, 0], [[0, 0], [0.008, 0], [0.012, 0.012], [0.026, 0.026], [0.034, 0.036], [0.031, 0.038], [0.022, 0.03], [0.008, 0.02], [0, 0.02]], 'tissue', { ...green, segments: 24, arc: 180 }),
    lathe([0, 0, 0], ovary.map(r2), 'tissue', { ...green, segments: 24, arc: 180 }),
    lowSweep([[0, 0.073, -0.0004], [0.0004, 0.1, -0.0004], [0, 0.118, -0.0004]], [0.0022, 0.0019, 0.0018], 'tissue', { ...green, segments: 10 }),
    sphere([0, 0.121, -0.0004], 0.0048, 'tissue', green),
    // Corolla: the joined base (half of a shallow cup) and three spreading petals in the back half.
    lathe([0, 0, 0], [[0.012, 0.03], [0.022, 0.036], [0.034, 0.04], [0.036, 0.042], [0.024, 0.039], [0.013, 0.034]], 'tissue', { ...white, segments: 24, arc: 180 }),
    ...[-62, 0, 62].map((a) => {
      const o: V3 = [Math.sin(a * DEG), 0, -Math.cos(a * DEG)];
      const dir = norm([o[0] * 0.92, 0.38, o[2] * 0.92]);
      return sheet([o[0] * 0.03, 0.04, o[2] * 0.03], blade(0.075, 0.034, 0.42, 12, 1.25), dir, norm(cross([0, 1, 0], dir)), 0.0016, 'tissue', white);
    }),
    // Stamens: stalks from the petal base, anthers standing round the style.
    ...[-55, 0, 55].flatMap((a) => {
      const o: V3 = [Math.sin(a * DEG), 0, -Math.cos(a * DEG)];
      const foot: V3 = [o[0] * 0.016, 0.036, o[2] * 0.016];
      const top: V3 = [o[0] * 0.013, 0.09, o[2] * 0.013];
      return [
        lowSweep([foot, [o[0] * 0.018, 0.064, o[2] * 0.018], top], [0.0016, 0.0014, 0.0012], 'tissue', { ...white, segments: 10 }),
        { kind: 'capsule', size: [0.0042, 0.012], at: add3(top, [0, 0.009, 0]), color: 'tissue', tint: C.anther } as Prim,
      ];
    }),
  ];
  return model(ps);
}

/** Ovules ×20 on the cut face of the ovary: small cream beads in two rows either side of the middle. */
export function sectionOvules(): Model {
  const ps: Prim[] = [];
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) ps.push(ellipsoid([s * (0.008 + (i % 2) * 0.004), 0.041 + i * 0.0058, 0.0004], 0.0026, [1, 1.15, 0.6], 'tissue', { tint: C.ovule }));
  return model(ps);
}
