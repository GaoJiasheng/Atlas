/**
 * Specimens #10–#14 (docs/38 §3.2): four fungi (a mushroom, a bracket fungus
 * on dead wood, mould on bread, dried yeast in a dish) and bacteria grown in a
 * dish. Each in its own frame (footprint centre on the floor, ≤ 7 cm square).
 */
import { bevel, capsule, cyl, DEG, ellipsoid, lathe, rng, type Model, type Prim } from '../kit';

const CREAM = '#e6dac2';
const GILLS = '#8b6c5a';

/** #10 A mushroom: cap, the gills under it (where the spores form), a ring on the stalk. */
export function mushroom(): Model {
  const capY = 0.04;
  const gills: Prim[] = [];
  for (let k = 0; k < 26; k++) {
    gills.push(bevel([Math.cos(k * (360 / 26) * DEG) * 0.0165, capY - 0.0012, -Math.sin(k * (360 / 26) * DEG) * 0.0165], [0.0195, 0.0042, 0.0006], 0.0002, 'tissue', { tint: GILLS, rotation: [0, k * (360 / 26), 0] }));
  }
  return {
    primitive: lathe([0, 0, 0], [[0, 0], [0.0068, 0], [0.0072, 0.003], [0.0058, 0.012], [0.0052, 0.03], [0.005, capY + 0.002], [0, capY + 0.002]], 'tissue', { tint: CREAM }),
    extra: [
      lathe([0, capY, 0], [[0, 0.003], [0.006, 0.0005], [0.026, 0.0005], [0.0292, 0.0035], [0.0284, 0.009], [0.022, 0.0158], [0.012, 0.0205], [0, 0.0218]], 'tissue', { tint: CREAM, segments: 48 }),
      lathe([0, 0.031, 0], [[0.0052, 0.002], [0.0085, -0.0025], [0.0088, -0.0032], [0.0052, 0.0]], 'tissue', { tint: CREAM }),
      ...gills,
    ],
  };
}

const LOG = '#6b5440';
const BRACKET = '#9a6b3d';

/** #11 A bracket fungus: shelves growing in tiers out of the side of a piece of dead wood. */
export function bracketFungus(): Model {
  const shelf = (x: number, y: number, r: number): Prim =>
    lathe([x, y, 0.0105], [[0, -0.0018], [r * 0.85, -0.0012], [r, 0.0008], [r * 0.97, 0.0026], [r * 0.6, 0.0036], [0, 0.004]], 'tissue', { tint: BRACKET, arc: 180, rotation: [0, 180, 0], segments: 32 });
  return {
    primitive: cyl([0, 0.016, 0], 0.016, 0.016, 0.064, 'wood', { tint: LOG, rotation: [0, 0, 90] }),
    extra: [shelf(-0.012, 0.012, 0.017), shelf(0.006, 0.02, 0.019), shelf(-0.004, 0.029, 0.014), shelf(0.018, 0.009, 0.012)],
  };
}

const BREAD = '#d6ad74';

/** #12 A slice of bread with patches of fuzzy mould: blue-green centres ringed with white. */
export function mouldyBread(): Model {
  const slice: [number, number][] = [[-0.026, -0.026], [0.026, -0.026], [0.027, 0.004]];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    slice.push([0.027 * Math.cos(a) * (1 + 0.06 * Math.sin(a)), 0.006 + 0.019 * Math.sin(a)]);
  }
  slice.push([-0.026, 0.004]);
  const patches: [number, number, number][] = [
    [-0.01, -0.008, 0.007],
    [0.011, 0.006, 0.0055],
    [0.004, -0.014, 0.004],
    [-0.012, 0.012, 0.0045],
  ];
  const extra: Prim[] = [];
  for (const [x, z, r] of patches) {
    extra.push(ellipsoid([x, 0.0122, z], r * 1.45, [1, 0.18, 1], 'fabric', { tint: '#ebebe0' }));
    extra.push(ellipsoid([x, 0.0128, z], r, [1, 0.32, 1], 'fabric', { tint: '#4f7f72' }));
  }
  return {
    primitive: { kind: 'extrude', shape: slice.map(([x, y]) => [Number(x.toFixed(5)), Number(y.toFixed(5))]), depth: 0.011, bevel: 0.0012, at: [0, 0.0055, 0], rotation: [-90, 0, 0], color: 'enamel', tint: BREAD },
    extra,
  };
}

/** #13 Dried yeast: a small dish of pale granules. */
export function yeast(): Model {
  const r = rng(13);
  const grains: Prim[] = [];
  for (let i = 0; i < 16; i++) {
    const a = r() * 2 * Math.PI;
    const d = 0.004 + r() * 0.018;
    const y = 0.0035 + Math.max(0, 0.0095 * (1 - d / 0.022));
    grains.push(capsule([Math.cos(a) * d, y, Math.sin(a) * d], 0.0011, 0.0018, 'abrasive', { tint: '#d9c18c', rotation: [r() * 180, r() * 180, 90] }));
  }
  return {
    primitive: lathe([0, 0, 0], [[0, 0], [0.024, 0], [0.03, 0.007], [0.0305, 0.0085], [0.029, 0.0085], [0.0235, 0.0022], [0, 0.0022]], 'enamel', { tint: '#efebe2' }),
    extra: [lathe([0, 0.0022, 0], [[0, 0], [0.0225, 0], [0.019, 0.0025], [0.012, 0.0065], [0.005, 0.0092], [0, 0.0098]], 'abrasive', { tint: '#d9c18c' }), ...grains],
  };
}

/** #14 Bacteria in a covered glass dish: a thin layer of jelly with round colonies of different sizes. */
export function bacteriaDish(): Model {
  const r = rng(14);
  const colonies: Prim[] = [];
  const placed: [number, number, number][] = [];
  let guard = 0;
  while (placed.length < 13 && guard++ < 400) {
    const rad = 0.0012 + r() * r() * 0.0032;
    const a = r() * 2 * Math.PI;
    const d = Math.sqrt(r()) * (0.022 - rad);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (placed.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + rad + 0.0012)) continue;
    placed.push([x, z, rad]);
    colonies.push(ellipsoid([x, 0.0049, z], rad, [1, 0.3, 1], 'enamel', { tint: '#efe5cc' }));
  }
  return {
    primitive: lathe([0, 0, 0], [[0, 0], [0.028, 0], [0.028, 0.0072], [0.0272, 0.0072], [0.0272, 0.0008], [0, 0.0008]], 'glass', { segments: 48 }),
    extra: [
      lathe([0, 0, 0], [[0.0296, 0.0042], [0.0296, 0.0098], [0, 0.0098], [0, 0.0092], [0.029, 0.0092], [0.029, 0.0042]], 'glass', { segments: 48 }),
      lathe([0, 0.0008, 0], [[0, 0], [0.0271, 0], [0.0271, 0.0038], [0, 0.0038]], 'tissue', { tint: '#e2d197' }),
      ...colonies,
    ],
  };
}
