/**
 * Specimens #15–#32 (docs/38 §3.2): eighteen model animals, each in its own
 * frame — footprint centre on the floor, facing +X, its left side towards +Z,
 * ≤ 7 cm square and ≤ 12 cm high. Small dark details (eyes, a blowhole, gill
 * slits, the toad's ridges, the frog's stripes) share the `eye` material, so
 * most animals are two or three draw calls. Proportions follow the reference
 * photographs listed in docs/38 §3.3; sizes are not to scale with each other.
 */
import { add, blade, cone, cross, DEG, ellipsoid, fan, leg, norm, orient, pair, sphere, sweep, sweepAt, wing, type Model, type Prim, type V2, type V3 } from '../kit';

import { buildBirdSculpture } from '../../kits/bird';
import { mesh } from '../sculpture';
import { sculptedFruitBat } from './bat';

const eyes = (at: V3, r: number): Prim[] => pair(sphere(at, r, 'eye'));
const both = (ps: Prim[]): Prim[] => ps.flatMap(pair);

/* ---------------------------------------------------------- insects */

const HOPPER = '#7f8a45';

/** #15 Grasshopper: big jumping hind legs, a saddle-shaped plate behind the head, wing covers along the back, six legs, two feelers. */
export function grasshopper(): Model {
  const c = { color: 'chitin', tint: HOPPER };
  const body = sweepAt([0, 0.017, 0], [[-0.031, 0.016, 0], [-0.016, 0.0165, 0], [0.0, 0.018, 0], [0.014, 0.019, 0], [0.022, 0.019, 0]], [0.0028, 0.0052, 0.0062, 0.0058, 0.005], c.color, { tint: c.tint, section: { flat: 0.85 }, up: [0, 0, 1], rings: { every: 0.004, depth: 0.12 } });
  const extra: Prim[] = [
    ellipsoid([0.027, 0.0205, 0], 0.0058, [1.05, 1.25, 0.9], c.color, { tint: c.tint, rotation: [0, 0, -18] }),
    ellipsoid([0.0135, 0.0232, 0], 0.0076, [1.25, 0.72, 0.95], c.color, { tint: c.tint }),
    ...pair(wing([0.011, 0.0245, 0.0035], blade(0.04, 0.0075, 0.35, 12, 1.4), [-1, -0.13, 0.02], [0, -0.55, 1], c.color, { tint: c.tint })),
    // Hind leg: thick femur up and back to the knee, thin tibia back down to the foot near the hip.
    ...both([
      sweep([[0.004, 0.015, 0.0055], [-0.01, 0.026, 0.0095], [-0.024, 0.031, 0.0115]], [0.0026, 0.0028, 0.0013], c.color, { tint: c.tint, segments: 16, radial: 8 }),
      sweep([[-0.024, 0.031, 0.0115], [-0.012, 0.014, 0.0145], [0.001, 0.0012, 0.0155], [0.008, 0.0009, 0.0158]], [0.0011, 0.0009, 0.0008, 0.0006], c.color, { tint: c.tint, segments: 16, radial: 6 }),
      leg([0.018, 0.0145, 0.0045], [0.025, 0.012, 0.0115], [0.031, 0.0008, 0.0135], 0.0009, c.color, { tint: c.tint }),
      leg([0.0105, 0.0135, 0.005], [0.011, 0.0115, 0.013], [0.006, 0.0008, 0.0175], 0.0009, c.color, { tint: c.tint }),
      sweep([[0.0305, 0.0255, 0.0018], [0.036, 0.032, 0.006], [0.039, 0.039, 0.0095]], 0.0005, c.color, { tint: c.tint, radial: 6, rings: { every: 0.0015, depth: 0.2 } }),
    ]),
    ...eyes([0.0285, 0.024, 0.0042], 0.0024),
  ];
  return { primitive: body, extra };
}

const BEETLE = '#263228';

/** #16 Beetle: a domed, glossy pair of hard wing cases meeting in a line down the back, six legs and two feelers. */
export function beetle(): Model {
  const c = { color: 'chitin', tint: BEETLE };
  const seam: V3[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -0.021 + (i / 8) * 0.037;
    const t = (x + 0.003) / 0.0215;
    seam.push([x, 0.0115 + 0.0102 * Math.sqrt(Math.max(0, 1 - t * t)) + 0.0002, 0]);
  }
  const legs: Prim[] = both([
    leg([0.017, 0.007, 0.006], [0.022, 0.01, 0.016], [0.03, 0.0008, 0.021], 0.0011, c.color, { tint: c.tint }),
    leg([0.006, 0.007, 0.008], [0.006, 0.0105, 0.02], [0.002, 0.0008, 0.027], 0.0011, c.color, { tint: c.tint }),
    leg([-0.005, 0.007, 0.008], [-0.012, 0.0105, 0.019], [-0.022, 0.0008, 0.025], 0.0011, c.color, { tint: c.tint }),
    sweep([[0.03, 0.0085, 0.002], [0.034, 0.011, 0.006], [0.036, 0.0095, 0.011]], 0.0005, c.color, { tint: c.tint, radial: 6 }),
  ]);
  return {
    primitive: ellipsoid([-0.003, 0.0115, 0], 0.016, [1.35, 0.64, 0.98], c.color, { tint: c.tint }),
    extra: [
      ellipsoid([0.0185, 0.0105, 0], 0.0085, [0.78, 0.62, 1.0], c.color, { tint: c.tint }),
      ellipsoid([0.0265, 0.0088, 0], 0.0052, [0.95, 0.75, 1.0], c.color, { tint: c.tint }),
      sweep(seam, 0.00045, 'eye', { radial: 6 }),
      ...legs,
      ...eyes([0.029, 0.0098, 0.0035], 0.0014),
    ],
  };
}

const SPIDER = '#6a4a31';

/** #17 Spider: two body parts and eight long legs, four on each side, bent up at the knees. */
export function spider(): Model {
  const c = { color: 'chitin', tint: SPIDER };
  const legs: Prim[] = [];
  const angles = [42, 78, 108, 142];
  for (const [i, deg] of angles.entries()) {
    const a = deg * DEG;
    const o: V3 = [Math.cos(a), 0, Math.sin(a)];
    const hip: V3 = [0.002 + o[0] * 0.005, 0.0095, o[2] * 0.005];
    const reach = i === 0 || i === 3 ? 0.031 : 0.027;
    const knee: V3 = [o[0] * reach * 0.5, 0.022 - i * 0.0006, o[2] * reach * 0.5];
    const ankle: V3 = [o[0] * reach * 0.85, 0.008, o[2] * reach * 0.85];
    const foot: V3 = [o[0] * reach, 0.0008, o[2] * reach];
    legs.push(...pair(sweep([hip, knee, ankle, foot], [0.0011, 0.0009, 0.0007, 0.0005], c.color, { tint: c.tint, segments: 18, radial: 6 })));
  }
  return {
    primitive: ellipsoid([0.0025, 0.0095, 0], 0.0072, [1.15, 0.62, 0.95], c.color, { tint: c.tint }),
    extra: [
      ellipsoid([-0.0125, 0.0115, 0], 0.0105, [1.25, 0.82, 0.95], c.color, { tint: c.tint }),
      ...legs,
      ...both([sweep([[0.009, 0.0095, 0.0025], [0.0125, 0.0105, 0.0045], [0.0145, 0.0055, 0.0055]], 0.0006, c.color, { tint: c.tint, radial: 6 })]),
      ...eyes([0.0095, 0.012, 0.0018], 0.0011),
    ],
  };
}

/* ---------------------------------------------------------- birds */

/** Opt-in smooth studies; the shared kit's legacy fossils preset is unchanged. */
function birdStudy(species:'myna'|'penguin'):Model {
  const pieces=buildBirdSculpture(species).pieces.map(p=>mesh(p.geometry,p.color,p.tint));
  return {primitive:pieces[0]!,extra:pieces.slice(1)};
}
export const javanMyna=():Model=>birdStudy('myna');
export const penguin=():Model=>birdStudy('penguin');

/* ---------------------------------------------------------- mammals */

const SQUIRREL = '#6f5237';

/** #20 Plantain squirrel: furry, with a big bushy tail curled up behind it. */
export function plantainSquirrel(): Model {
  const f = { color: 'fabric', tint: SQUIRREL };
  return {
    primitive: ellipsoid([0, 0.0165, 0], 0.0118, [1.5, 0.92, 0.84], f.color, { tint: f.tint, rotation: [0, 0, 12] }),
    extra: [
      ellipsoid([0.0205, 0.0245, 0], 0.0082, [1.25, 1, 0.92], f.color, { tint: f.tint, rotation: [0, 0, -14] }),
      ellipsoid([0.0285, 0.0225, 0], 0.0038, [1.2, 0.9, 0.9], f.color, { tint: f.tint }),
      ...pair(cone([0.018, 0.0335, 0.0042], 0.0021, 0.0055, f.color, { tint: f.tint, rotation: [12, 0, 10] })),
      sweep([[-0.014, 0.016, 0], [-0.024, 0.022, 0], [-0.0285, 0.036, 0], [-0.0245, 0.05, 0], [-0.0145, 0.0585, 0], [-0.0045, 0.057, 0]], [0.003, 0.0078, 0.0108, 0.0108, 0.0086, 0.0035], f.color, { tint: f.tint, segments: 26, section: { flat: 0.66 }, up: [0, 0, 1] }),
      ...both([
        leg([0.011, 0.012, 0.0045], [0.0145, 0.006, 0.0058], [0.017, 0.0009, 0.0062], 0.0022, f.color, { tint: f.tint }),
        ellipsoid([-0.009, 0.0125, 0.0068], 0.0068, [1.2, 1, 0.6], f.color, { tint: f.tint }),
        ellipsoid([-0.004, 0.0015, 0.0068], 0.0042, [1.6, 0.4, 0.75], f.color, { tint: f.tint }),
      ]),
      ...eyes([0.0255, 0.027, 0.0052], 0.0017),
    ],
  };
}

/** Jointed finger-supported membrane sculpture, with original fur geometry. */
export const fruitBat=sculptedFruitBat;

const DOLPHIN = '#b4a19b';

/** #22 Indo-Pacific humpback dolphin: streamlined, a long beak, a hump under the fin, flippers, a horizontal tail fluke and a blowhole on top of the head. */
export function dolphin(): Model {
  const e = { color: 'enamel', tint: DOLPHIN };
  const fluke: V2[] = [[0, 0], [-0.003, 0.003], [-0.008, 0.0095], [-0.0115, 0.0115], [-0.0105, 0.0065], [-0.0085, 0.0005], [-0.0085, -0.0005], [-0.0105, -0.0065], [-0.0115, -0.0115], [-0.008, -0.0095], [-0.003, -0.003]];
  return {
    primitive: sweepAt(
      [0, 0.0105, 0],
      [[-0.026, 0.0125, 0], [-0.017, 0.011, 0], [-0.004, 0.0105, 0], [0.01, 0.0105, 0], [0.019, 0.0108, 0], [0.0235, 0.0104, 0], [0.026, 0.0098, 0], [0.033, 0.0096, 0]],
      [0.0018, 0.0052, 0.0085, 0.0088, 0.0071, 0.0046, 0.0026, 0.0018],
      e.color,
      { tint: e.tint, section: { flat: 0.9 }, up: [0, 0, 1], segments: 40 },
    ),
    extra: [
      ellipsoid([-0.003, 0.0178, 0], 0.0048, [2.2, 0.7, 0.6], e.color, { tint: e.tint }),
      wing([-0.002, 0.0195, 0], [[-0.0085, 0], [0.0045, 0], [-0.003, 0.0058], [-0.0072, 0.0062], [-0.0065, 0.004]], [1, 0, 0], [0, 1, 0], e.color, { tint: e.tint }),
      ...pair(wing([0.011, 0.0065, 0.0052], blade(0.013, 0.0052, 0.3, 10, 1.2), [-0.55, -0.28, 1], [1, -0.2, 0.3], e.color, { tint: e.tint })),
      wing([-0.026, 0.0125, 0], fluke, [1, 0, 0], [0, 0, 1], e.color, { tint: e.tint }),
      ellipsoid([0.0165, 0.0186, 0], 0.0012, [1.4, 0.6, 1], 'eye'),
      ...eyes([0.0245, 0.0115, 0.0042], 0.0011),
    ],
  };
}

const PANGOLIN = '#86663f';

/** #23 Sunda pangolin: covered in large overlapping scales from head to the tip of its long tail, a small pointed head, short clawed legs (F-36). */
export function pangolin(): Model {
  const s = { color: 'scales', tint: PANGOLIN };
  return {
    primitive: sweepAt(
      [0, 0.016, 0],
      [[0.031, 0.0065, 0], [0.024, 0.0095, 0], [0.016, 0.0135, 0], [0.004, 0.017, 0], [-0.008, 0.0165, 0], [-0.017, 0.012, 0], [-0.023, 0.0065, 0.004], [-0.024, 0.0045, 0.014], [-0.017, 0.0035, 0.022], [-0.008, 0.003, 0.025]],
      [0.0016, 0.0042, 0.0068, 0.0098, 0.0098, 0.0076, 0.0058, 0.0044, 0.003, 0.0015],
      s.color,
      { tint: s.tint, section: { flat: 0.82 }, up: [0, 1, 0], segments: 48, rings: { every: 0.0045, depth: 0.16 } },
    ),
    extra: [
      ...both([
        leg([0.014, 0.0095, 0.0055], [0.016, 0.0045, 0.0085], [0.019, 0.0007, 0.0092], 0.0024, s.color, { tint: s.tint }),
        leg([-0.008, 0.0095, 0.006], [-0.008, 0.0045, 0.0092], [-0.0055, 0.0007, 0.0098], 0.0027, s.color, { tint: s.tint }),
      ]),
      ...eyes([0.0235, 0.0112, 0.0034], 0.001),
    ],
  };
}

/* ---------------------------------------------------------- fish */

const FIN_DARK = '#3b342a';

/** A fish body: a sweep pressed flat from side to side. */
const fishBody = (origin: V3, pts: V3[], radii: number[], color: string, tint: string, flat = 0.62): Prim =>
  sweepAt(origin, pts, radii, color, { tint, section: { flat }, up: [0, 0, 1], segments: 40 });

/** A vertical fin outline at `at` (in the fish's mid-plane). */
const finV = (at: V3, outline: V2[], color: string, tint: string, veins?: V2[][]): Prim => wing(at, outline, [1, 0, 0], [0, 1, 0], color, { tint, ...(veins ? { veins } : {}) });

/** #24 Common snakehead: a long, torpedo-shaped body, a flat snake-like head with large scales, a long fin along the back (F-41). */
export function snakehead(): Model {
  const tint = '#4d4433';
  const dorsal: V2[] = [[0.013, 0], [0.01, 0.0042], [-0.004, 0.0052], [-0.02, 0.0048], [-0.023, 0.0012], [-0.023, 0]];
  const anal: V2[] = [[0.0, 0], [-0.003, -0.0036], [-0.019, -0.0038], [-0.022, -0.001], [-0.022, 0]];
  const tail: V2[] = [[0, 0], ...fan(0.009, 110, 10).slice(1).map(([x, y]): V2 => [-x, y])];
  return {
    primitive: fishBody([0, 0.0115, 0], [[-0.024, 0.0118, 0], [-0.012, 0.0115, 0], [0.004, 0.0115, 0], [0.018, 0.0113, 0], [0.026, 0.0108, 0], [0.031, 0.0104, 0]], [0.0028, 0.0058, 0.0068, 0.0064, 0.0052, 0.0024], 'scales', tint, 0.78),
    extra: [
      finV([0, 0.0172, 0], dorsal, 'tissue', FIN_DARK),
      finV([0, 0.0058, 0], anal, 'tissue', FIN_DARK),
      finV([-0.0235, 0.0118, 0], tail, 'tissue', FIN_DARK),
      ...pair(wing([0.017, 0.0095, 0.0048], fan(0.0065, 80, 8), [-0.6, -0.2, 0.5], [0, 1, 0], 'tissue', { tint: FIN_DARK })),
      ...pair(sphere([0.0255, 0.0128, 0.0038], 0.0012, 'tissue', { tint: FIN_DARK })),
    ],
  };
}

const GUPPY_TAIL = '#e07a2f';

/** #25 Guppy: a small fish with a very large, fan-shaped coloured tail (F-42). */
export function guppy(): Model {
  const tail: V2[] = [[0, 0], ...fan(0.026, 66, 14).slice(1).map(([x, y]): V2 => [-x, y])];
  return {
    primitive: fishBody([0, 0.016, 0], [[-0.012, 0.0162, 0], [-0.004, 0.016, 0], [0.008, 0.0162, 0], [0.015, 0.0158, 0], [0.019, 0.0154, 0]], [0.0018, 0.0042, 0.0048, 0.0036, 0.0016], 'scales', '#9c9a88', 0.58),
    extra: [
      finV([-0.0115, 0.0162, 0], tail, 'tissue', GUPPY_TAIL),
      finV([-0.003, 0.0202, 0], [[0.003, 0], [-0.003, 0.0052], [-0.0085, 0.004], [-0.007, 0]], 'tissue', GUPPY_TAIL),
      ...pair(ellipsoid([-0.004, 0.0165, 0.0026], 0.0018, [1.4, 1, 0.3], 'tissue', { tint: GUPPY_TAIL })),
      ...eyes([0.0145, 0.0168, 0.0024], 0.0012),
    ],
  };
}

/** #26 Giant mudskipper: resting on a patch of mud, eyes on top of its head, propped up on fleshy front fins (F-40). */
export function mudskipper(): Model {
  const s = { color: 'scales', tint: '#7a6e57' };
  return {
    primitive: ellipsoid([0, 0.0028, 0], 0.031, [1.08, 0.09, 0.8], 'abrasive', { tint: '#5a4935' }),
    extra: [
      fishBody([0, 0.0098, 0], [[-0.027, 0.0082, 0], [-0.014, 0.0088, 0], [0.002, 0.0098, 0], [0.014, 0.0103, 0], [0.021, 0.0098, 0], [0.025, 0.0088, 0]], [0.0016, 0.004, 0.0056, 0.0066, 0.0058, 0.0036], s.color, s.tint, 0.85),
      ...pair(sphere([0.0175, 0.0165, 0.0026], 0.0026, 'eye')),
      ...both([
        sweep([[0.009, 0.0078, 0.0048], [0.012, 0.0052, 0.0098], [0.0155, 0.0042, 0.0122]], [0.0022, 0.0019, 0.0016], s.color, { tint: s.tint, radial: 7 }),
      ]),
      finV([0.004, 0.0158, 0], [[0.002, 0], [0, 0.0062], [-0.004, 0.0056], [-0.004, 0]], s.color, s.tint),
      finV([-0.004, 0.0152, 0], [[0.0, 0], [-0.003, 0.0034], [-0.016, 0.0028], [-0.019, 0]], s.color, s.tint),
      finV([-0.0265, 0.0083, 0], [[0, 0], ...fan(0.0068, 90, 8).slice(1).map(([x, y]): V2 => [-x, y])], s.color, s.tint),
    ],
  };
}

const SHARK = '#7b8389';

/** #27 Shark: a pointed snout, a triangular back fin, a row of gill slits on each side and an upright tail with a longer top half. */
export function shark(): Model {
  const e = { color: 'enamel', tint: SHARK };
  const tail: V2[] = [[0, 0], [-0.004, 0.0045], [-0.0105, 0.0135], [-0.0135, 0.0145], [-0.009, 0.0035], [-0.0072, -0.0005], [-0.0088, -0.0062], [-0.0068, -0.0068], [-0.0015, -0.0022]];
  const slits: Prim[] = [];
  for (let i = 0; i < 5; i++) {
    const x = 0.0105 + i * 0.0021;
    slits.push(...pair(sweep([[x, 0.0072, 0.0058], [x - 0.0004, 0.0118, 0.0059]], 0.00028, 'eye', { radial: 6 })));
  }
  return {
    primitive: fishBody([0, 0.0118, 0], [[-0.022, 0.0134, 0], [-0.012, 0.0124, 0], [0.002, 0.0118, 0], [0.016, 0.0116, 0], [0.026, 0.011, 0], [0.032, 0.0104, 0]], [0.0016, 0.0054, 0.0082, 0.0072, 0.0044, 0.0012], e.color, e.tint, 0.78),
    extra: [
      finV([0.003, 0.0195, 0], [[0.0045, 0], [-0.002, 0.0115], [-0.0048, 0.0112], [-0.0058, 0]], e.color, e.tint),
      finV([-0.0215, 0.0134, 0], tail, e.color, e.tint),
      finV([-0.0125, 0.0172, 0], [[0.0015, 0], [-0.001, 0.0028], [-0.0028, 0]], e.color, e.tint),
      ...pair(wing([0.0085, 0.0072, 0.0058], blade(0.014, 0.0065, 0.25, 10, 1.1), [-0.55, -0.4, 1], [1, -0.1, 0.3], e.color, { tint: e.tint })),
      ...slits,
      ...eyes([0.0235, 0.0128, 0.0039], 0.0011),
    ],
  };
}

/* ---------------------------------------------------------- amphibians */

const FROG = '#86663a';

/** #28 Four-lined tree frog: smooth, shiny skin, long thin legs with round pads on the toe tips, four dark lines down the back (F-31). */
export function treeFrog(): Model {
  const skin = { color: 'enamel', tint: FROG };
  const stripes: Prim[] = [];
  for (const z of [0.0028, 0.0072]) {
    stripes.push(...pair(sweep([[0.011, 0.0218 - z * 0.25, z * 0.85], [0.0, 0.0205 - z * 0.3, z], [-0.012, 0.0168 - z * 0.3, z * 0.95]], 0.0007, 'eye', { radial: 6 })));
  }
  const pads = (pts: V3[]): Prim[] => pts.map((p) => sphere(p, 0.0012, skin.color, { tint: skin.tint }));
  return {
    primitive: ellipsoid([0, 0.0125, 0], 0.0122, [1.42, 0.74, 0.92], skin.color, { tint: skin.tint, rotation: [0, 0, 16] }),
    extra: [
      ellipsoid([0.0165, 0.0178, 0], 0.0084, [1.0, 0.68, 1.1], skin.color, { tint: skin.tint }),
      ...stripes,
      ...both([
        sweep([[-0.008, 0.0098, 0.0082], [0.006, 0.0068, 0.0158], [-0.013, 0.0028, 0.0172], [-0.002, 0.001, 0.0235]], [0.0028, 0.0021, 0.0014, 0.0011], skin.color, { tint: skin.tint, segments: 22, radial: 8 }),
        sweep([[0.0105, 0.0098, 0.0068], [0.0168, 0.0052, 0.0118], [0.0215, 0.0012, 0.0128]], [0.0016, 0.0013, 0.001], skin.color, { tint: skin.tint, radial: 7 }),
        ...pads([[-0.002, 0.0012, 0.0235], [0.0225, 0.0012, 0.0128]]),
      ]),
      ...eyes([0.0175, 0.0218, 0.0066], 0.0034),
    ],
  };
}

const TOAD = '#6b5c3e';

/** #29 Asian toad: squat, with dry, bumpy skin, short legs and dark bony ridges behind the eyes (F-30). */
export function asianToad(): Model {
  const skin = { color: 'abrasive', tint: TOAD };
  const warts: Prim[] = [];
  for (const [x, z] of [[-0.006, 0.006], [0.002, 0.008], [-0.012, 0.002], [0.006, 0.004], [-0.002, 0.003]] as V2[]) {
    warts.push(...pair(sphere([x, 0.0205 - Math.abs(z) * 0.4 - Math.abs(x) * 0.15, z], 0.0014, skin.color, { tint: skin.tint })));
  }
  return {
    primitive: ellipsoid([0, 0.0122, 0], 0.0142, [1.25, 0.72, 1.05], skin.color, { tint: skin.tint }),
    extra: [
      ellipsoid([0.0165, 0.0142, 0], 0.0092, [1.0, 0.7, 1.12], skin.color, { tint: skin.tint }),
      ...warts,
      ...both([
        ellipsoid([0.008, 0.0192, 0.0068], 0.0042, [1.5, 0.6, 0.8], skin.color, { tint: skin.tint }),
        sweep([[0.0205, 0.0205, 0.0035], [0.0183, 0.0217, 0.0050], [0.0155, 0.0212, 0.0062], [0.0120, 0.0199, 0.0075]], [0.00018,0.00048,0.00044,0.00016], 'eye', { radial: 12, segments: 24 }),
        sweep([[-0.007, 0.0105, 0.0105], [0.001, 0.0058, 0.0145], [-0.006, 0.0018, 0.0168], [0.002, 0.001, 0.0195]], [0.0034, 0.0026, 0.0018, 0.0014], skin.color, { tint: skin.tint, radial: 8 }),
        leg([0.012, 0.0095, 0.0085], [0.0158, 0.005, 0.0125], [0.019, 0.0009, 0.0135], 0.002, skin.color, { tint: skin.tint }),
      ]),
      ...eyes([0.0192, 0.0185, 0.0062], 0.003),
    ],
  };
}

/* ---------------------------------------------------------- reptiles */

const GECKO = '#d4c1a2';

/** #30 Common house gecko: a flat little lizard with small scales, big eyes and wide pads on its toes (F-33). */
export function houseGecko(): Model {
  const s = { color: 'scales', tint: GECKO };
  const limb = (hip: V3, elbow: V3, foot: V3): Prim[] => [
    sweep([hip, elbow, foot], [0.0016, 0.0013, 0.001], s.color, { tint: s.tint, radial: 7 }),
    ...[-35, 0, 35].map((a) => {
      const dir = norm(add(norm([foot[0] - elbow[0], 0, foot[2] - elbow[2]]), [Math.sin(a * DEG), 0, Math.sin(a * DEG) * 0.5]));
      return ellipsoid(add(foot, [dir[0] * 0.0028, 0, dir[2] * 0.0028]), 0.0016, [1.1, 0.35, 0.9], s.color, { tint: s.tint });
    }),
  ];
  return {
    primitive: sweepAt(
      [0, 0.0045, 0],
      [[0.03, 0.0042, 0], [0.024, 0.0048, 0], [0.016, 0.0052, 0], [0.004, 0.0055, 0], [-0.008, 0.0052, 0], [-0.016, 0.0045, 0.002], [-0.024, 0.003, 0.008], [-0.027, 0.0022, 0.017], [-0.023, 0.0018, 0.025]],
      [0.0018, 0.0048, 0.0046, 0.0058, 0.005, 0.0036, 0.0026, 0.0018, 0.0008],
      s.color,
      { tint: s.tint, section: { flat: 0.55 }, up: [0, 1, 0], segments: 44 },
    ),
    extra: [
      ...limb([0.012, 0.0045, 0.0035], [0.016, 0.0045, 0.011], [0.022, 0.0012, 0.014]),
      ...limb([0.012, 0.0045, -0.0035], [0.016, 0.0045, -0.011], [0.022, 0.0012, -0.014]),
      ...limb([-0.007, 0.0045, 0.0035], [-0.006, 0.0045, 0.0125], [-0.012, 0.0012, 0.017]),
      ...limb([-0.007, 0.0045, -0.0035], [-0.006, 0.0045, -0.0125], [-0.002, 0.0012, -0.017]),
      ...eyes([0.0235, 0.0075, 0.003], 0.0021),
    ],
  };
}

const PYTHON = '#8a6f45';

/** #31 Reticulated python: a coiled snake with no legs, its head raised on top of the coil (F-38). */
export function python(): Model {
  const s = { color: 'scales', tint: PYTHON };
  const path: V3[] = [];
  const radii: number[] = [];
  // Tail tip outside, two turns spiralling inward and upward, then the neck rising to the head.
  const turns = 2.1;
  const n = 44;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (-30 + t * turns * 360) * DEG;
    const r = 0.026 - t * 0.014;
    const y = 0.005 + (t < 0.5 ? 0 : (t - 0.5) * 2 * 0.0085) + (t < 0.05 ? 0 : 0);
    path.push([r * Math.cos(a), y, r * Math.sin(a)]);
    radii.push(t < 0.08 ? 0.0012 + (t / 0.08) * 0.0035 : 0.0047 + 0.0008 * Math.sin(t * Math.PI));
  }
  const last = path[path.length - 1]!;
  const neck: V3 = [last[0] * 0.4, 0.026, last[2] * 0.4];
  path.push(neck);
  radii.push(0.0038);
  const head: V3 = [neck[0] + 0.006, 0.028, neck[2]];
  return {
    primitive: sweepAt([0, 0.005, 0], path, radii, s.color, { tint: s.tint, segments: 160, radial: 12 }),
    extra: [ellipsoid(head, 0.0042, [1.7, 0.75, 1.1], s.color, { tint: s.tint }), ...eyes([head[0] + 0.0035, 0.0298, head[2] + 0.003], 0.001)],
  };
}

const SHELL = '#9a6a2c';
const TURTLE_SKIN = '#7a5b39';

/** #32 Hawksbill turtle: a domed shell, four flippers, a narrow head with a pointed, hooked beak (F-39, F-94). */
export function hawksbillTurtle(): Model {
  const skin = { color: 'scales', tint: TURTLE_SKIN };
  const base = 0.0035;
  const profile: V2[] = [[0, 0], [0.0215, 0], [0.0232, 0.0022], [0.021, 0.006], [0.015, 0.0115], [0.007, 0.0142], [0, 0.0148]];
  const [sx, sz] = [1.18, 0.9];
  // Height of the shell's top at (x, z), from the dome part of the profile.
  const dome = profile.slice(2).reverse();
  const top = (x: number, z: number) => {
    const r = Math.hypot(x / sx, z / sz);
    for (let i = 0; i < dome.length - 1; i++) {
      const [r0, y0] = dome[i]!;
      const [r1, y1] = dome[i + 1]!;
      if (r <= r1) return base + y0 + ((y1 - y0) * (r - r0)) / (r1 - r0);
    }
    return base;
  };
  // Raised plates (scutes) on the shell: a row down the middle and a row each side, darker, as on a tortoiseshell.
  const plate = (x: number, z: number, rx: number, rz: number): Prim => {
    const e = 0.0008;
    const n = norm([-(top(x + e, z) - top(x - e, z)) / (2 * e), 1, -(top(x, z + e) - top(x, z - e)) / (2 * e)]);
    const t = norm(cross([0, 0, 1], n));
    return sphere([x, top(x, z) - 0.0002, z], 0.004, 'chitin', { tint: PLATE, scale: [rx, 0.22, rz], rotation: orient(t, n) });
  };
  const plates: Prim[] = [-0.014, -0.005, 0.004, 0.013].map((x) => plate(x, 0, 1.15, 0.95));
  for (const x of [-0.011, 0, 0.011]) plates.push(...pair(plate(x, 0.0098, 1.2, 1.05)));
  return {
    primitive: { kind: 'lathe', at: [0, base, 0], profile, segments: 40, scale: [sx, 1, sz], color: 'chitin', tint: SHELL },
    extra: [
      ...plates,
      ellipsoid([0.0305, 0.0072, 0], 0.0054, [1.5, 0.82, 0.88], skin.color, { tint: skin.tint }),
      cone([0.039, 0.0062, 0], 0.0022, 0.005, skin.color, { tint: skin.tint, rotation: [0, 0, -105] }),
      ...pair(wing([0.017, 0.0048, 0.0158], blade(0.026, 0.0085, 0.3, 10, 1.2), norm([-0.35, -0.12, 1]), [1, 0, 0.3], skin.color, { tint: skin.tint })),
      ...pair(wing([-0.019, 0.004, 0.0105], blade(0.012, 0.0065, 0.45, 8, 1.2), norm([-0.7, -0.15, 0.7]), [0.7, 0, 0.7], skin.color, { tint: skin.tint })),
      ...pair(sphere([0.034, 0.0088, 0.0034], 0.001, 'chitin', { tint: PLATE })),
    ],
  };
}
const PLATE = '#6e4318';

