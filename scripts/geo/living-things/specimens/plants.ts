/**
 * Specimens #4–#9 (docs/38 §3.2): three flowering plants (an ixora in flower,
 * a young chilli plant with no flowers yet, a young rhu tree that looks like a
 * pine) and three non-flowering plants (bird's nest fern, staghorn fern, moss).
 * Each in its own frame (footprint centre on the floor, ≤ 7 cm square).
 */
import { add, bevel, blade, cross, DEG, ellipsoid, lathe, mul, norm, sweep, wing, type Model, type Prim, type V2, type V3 } from '../kit';

const POT = '#b4683f';

/** A small terracotta pot: outer wall, rim, soil level `soil` below the rim. */
const pot = (r: number, h: number, colour = POT): Prim =>
  lathe([0, 0, 0], [[0, 0], [r * 0.78, 0], [r, h], [r * 1.07, h], [r * 1.07, h + 0.002], [r * 0.93, h + 0.002], [r * 0.9, h - 0.002], [0, h - 0.002]], 'enamel', { tint: colour });

/** A leaf blade on a stem at `at`, pointing along `dir`, lying with its upper face towards the light. */
function leaf(at: readonly number[], dir: readonly number[], l: number, w: number, tint: string, widest = 0.45, veins = false): Prim {
  const x = norm(dir);
  const across = norm(cross([0, 1, 0], x));
  const outline = blade(l, w, widest, 12, 1.5);
  return wing(at, outline, x, across, 'tissue', { tint, ...(veins ? { veins: [[[0, 0], [l * 0.92, 0]]] } : {}) });
}

/** A four-petalled ixora flower seen face on: one cross-shaped outline (four rounded petals). */
function crossFlower(r: number): V2[] {
  const pts: V2[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * 2 * Math.PI + Math.PI / 4;
    const lobe = Math.max(0, Math.cos(2 * (a - Math.PI / 4)));
    const rr = r * (0.28 + 0.72 * Math.pow(lobe, 0.55));
    pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  return pts;
}

const IXORA_LEAF = '#2f5a24';
const IXORA_FLOWER = '#d8512a';

/** #4 Ixora in flower: dark leathery leaves on three branches, each ending in a dome of small red-orange four-petalled flowers (F-45). */
export function ixora(): Model {
  const extra: Prim[] = [];
  const base: V3 = [0, 0.02, 0];
  const tops: V3[] = [
    [0.013, 0.086, 0.007],
    [-0.015, 0.079, 0.005],
    [0.002, 0.092, -0.015],
  ];
  for (const [i, top] of tops.entries()) {
    const mid = add(mul(add(base, top), 0.5), [top[0] * 0.15, 0, top[2] * 0.15]);
    extra.push(sweep([base, mid, top], [0.0017, 0.0014, 0.001], 'tissue', { tint: IXORA_LEAF, radial: 7 }));
    const out = norm([top[0], 0, top[2]]);
    const side = norm(cross([0, 1, 0], out));
    // Two pairs of opposite leaves on the branch, the upper pair turned a quarter turn (decussate).
    const p1 = add(mul(add(base, mid), 0.5), [0, 0.008, 0]);
    const p2 = add(mul(add(mid, top), 0.5), [0, -0.004, 0]);
    for (const s of [1, -1]) {
      extra.push(leaf(p1, add(mul(side, s), [0, 0.25, 0]), 0.024, 0.0095, IXORA_LEAF, 0.5));
      extra.push(leaf(p2, add(mul(out, s), [0, 0.35, 0]), 0.022, 0.009, IXORA_LEAF, 0.5));
    }
    // The flower head: a dome of florets, with four open flowers on top.
    const head: V3 = add(top, [0, 0.004, 0]);
    extra.push(ellipsoid(head, 0.0105, [1, 0.62, 1], 'tissue', { tint: IXORA_FLOWER }));
    for (let k = 0; k < 4; k++) {
      const a = (k * 90 + i * 25) * DEG;
      const n = norm([Math.cos(a) * 0.75, 0.66, Math.sin(a) * 0.75]);
      const at = add(head, [n[0] * 0.0105, n[1] * 0.0105 * 0.62 + 0.0006, n[2] * 0.0105]);
      const t1 = norm(cross(n, [0, 0, 1]));
      extra.push(wing(at, crossFlower(0.0042), t1, cross(n, t1), 'tissue', { tint: IXORA_FLOWER }));
    }
  }
  return { primitive: pot(0.017, 0.022), extra };
}

const CHILLI = '#6a9a3a';

/** #5 A young chilli plant: two narrow seed leaves and the first true leaves; no flowers and no fruit yet. */
export function chilliSeedling(): Model {
  const top: V3 = [0.001, 0.064, 0.001];
  const extra: Prim[] = [sweep([[0, 0.018, 0], [0.0015, 0.04, 0], top], [0.0016, 0.0014, 0.0011], 'tissue', { tint: CHILLI, radial: 7 })];
  // Seed leaves: long and narrow, opposite.
  for (const s of [1, -1]) extra.push(leaf([0.0012, 0.042, 0], [s * 1, 0.3, 0.15 * s], 0.017, 0.0042, CHILLI, 0.45, false));
  // True leaves: broader, pointed, in two pairs.
  for (const s of [1, -1]) extra.push(leaf([0.0014, 0.054, 0.0005], [0.25 * s, 0.45, s * 1], 0.022, 0.0095, CHILLI, 0.35));
  for (const s of [1, -1]) extra.push(leaf([0.001, 0.062, 0.001], [s * 1, 0.7, -0.2 * s], 0.016, 0.0075, CHILLI, 0.35));
  extra.push(ellipsoid(add(top, [0, 0.002, 0]), 0.0022, [1, 1.3, 1], 'tissue', { tint: CHILLI }));
  return { primitive: pot(0.015, 0.02), extra };
}

const RHU_SHOOT = '#71885a';
const RHU_WOOD = '#6b5039';

/** #6 A young rhu tree: a thin trunk with tiers of thin drooping green shoots, like a pine, and three small cone-like fruits (F-46, F-100). */
export function rhuSapling(): Model {
  const extra: Prim[] = [];
  const trunk = (y: number): V3 => [0.0015 * Math.sin(y * 40), y, 0.001 * Math.cos(y * 30)];
  extra.push(sweep([trunk(0.02), trunk(0.05), trunk(0.08), trunk(0.112)], [0.0024, 0.002, 0.0013, 0.0006], 'wood', { tint: RHU_WOOD, radial: 7 }));
  const tiers = [0.046, 0.06, 0.073, 0.085, 0.096, 0.106];
  for (const [i, y] of tiers.entries()) {
    const reach = 0.03 - i * 0.0036;
    for (let k = 0; k < 4; k++) {
      const a = (k * 90 + i * 37) * DEG;
      const o: V3 = [Math.cos(a), 0, Math.sin(a)];
      const start = trunk(y);
      extra.push(
        sweep(
          [start, add(start, [o[0] * reach * 0.45, 0.004, o[2] * reach * 0.45]), add(start, [o[0] * reach * 0.85, -0.004, o[2] * reach * 0.85]), add(start, [o[0] * reach, -0.016 + i * 0.0015, o[2] * reach])],
          [0.0011, 0.001, 0.0009, 0.0005],
          'tissue',
          { tint: RHU_SHOOT, radial: 6, segments: 12 },
        ),
      );
    }
  }
  for (const [k, y] of [0.058, 0.07, 0.082].entries()) {
    const a = (k * 130 + 20) * DEG;
    extra.push(ellipsoid(add(trunk(y), [Math.cos(a) * 0.009, -0.004, Math.sin(a) * 0.009]), 0.0024, [1, 1.15, 1], 'wood', { tint: RHU_WOOD }));
  }
  return { primitive: pot(0.016, 0.021), extra };
}

const BARK = '#6e553d';
const NEST_GREEN = '#5f9a2c';

/** #7 A bird's nest fern on a piece of bark: a rosette of broad, strap-shaped fronds around an empty centre; two fronds show the brown lines underneath (F-47). */
export function birdsNestFern(): Model {
  const extra: Prim[] = [];
  const l = 0.04;
  const w = 0.0115;
  const outline = blade(l, w, 0.6, 14, 1.3);
  for (let k = 0; k < 10; k++) {
    const a = (k * 36 + 8) * DEG;
    const up = (52 + (k % 3) * 6) * DEG;
    const x: V3 = [Math.cos(a) * Math.cos(up), Math.sin(up), Math.sin(a) * Math.cos(up)];
    const across = norm(cross([0, 1, 0], x));
    const veins: V2[][] = [];
    if (k === 2) {
      veins.push([[0, 0], [l * 0.95, 0]]);
      for (let t = 0.28; t < 0.86; t += 0.07) {
        veins.push([[l * t, 0.0012], [l * (t + 0.05), w * 0.36]]);
        veins.push([[l * t, -0.0012], [l * (t + 0.05), -w * 0.36]]);
      }
    }
    extra.push(wing(add([0, 0.013, 0], [Math.cos(a) * 0.003, 0, Math.sin(a) * 0.003]), outline, x, across, 'tissue', { tint: NEST_GREEN, veins }));
  }
  return { primitive: bevel([0, 0.006, 0], [0.058, 0.012, 0.044], 0.004, 'wood', { tint: BARK, rotation: [0, 12, 0] }), extra };
}

const STAG_GREEN = '#7d9c5a';

/** A staghorn frond: a stalk that widens and forks twice into blunt antler tips. */
function antler(l: number, w: number): V2[] {
  const top: V2[] = [
    [0, w * 0.14],
    [l * 0.3, w * 0.22],
    [l * 0.48, w * 0.5],
    [l * 0.66, w * 0.95],
    [l * 0.78, w * 1.25],
    [l * 0.8, w * 1.12],
    [l * 0.68, w * 0.7],
    [l * 0.82, w * 0.62],
    [l * 1.0, w * 0.66],
    [l * 1.0, w * 0.52],
    [l * 0.78, w * 0.42],
    [l * 0.6, w * 0.24],
    [l * 0.7, w * 0.08],
    [l * 0.86, w * 0.1],
  ];
  return [...top, ...top.slice().reverse().map(([x, y]): V2 => [x, -y])];
}

/** #8 A staghorn fern on a piece of bark: a round shield frond pressed to the bark and forked, antler-like fronds (F-48). */
export function staghornFern(): Model {
  const extra: Prim[] = [];
  const shield: V2[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * 2 * Math.PI;
    const r = 0.017 * (1 + 0.06 * Math.sin(5 * a));
    shield.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  extra.push(
    wing([-0.002, 0.0128, -0.001], shield, [1, 0.08, 0], [0, 0.12, 1], 'tissue', {
      tint: STAG_GREEN,
    }),
  );
  const fronds: [number, number, number][] = [
    [20, 34, 0.032],
    [75, 46, 0.03],
    [140, 30, 0.031],
    [210, 40, 0.028],
    [290, 36, 0.03],
  ];
  for (const [deg, elev, l] of fronds) {
    const a = deg * DEG;
    const e = elev * DEG;
    const x: V3 = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)];
    extra.push(wing([Math.cos(a) * 0.003, 0.014, Math.sin(a) * 0.003], antler(l, 0.0075), x, norm(cross([0, 1, 0], x)), 'tissue', { tint: STAG_GREEN }));
  }
  return { primitive: bevel([0, 0.006, 0], [0.06, 0.012, 0.042], 0.004, 'wood', { tint: BARK, rotation: [0, -8, 0] }), extra };
}

/** #9 Moss: low, soft green cushions on a flat stone. */
export function moss(): Model {
  const cushions: [number, number, number, number][] = [
    [-0.012, 0.004, 0.012, 0.5],
    [0.008, -0.006, 0.013, 0.45],
    [0.014, 0.01, 0.009, 0.5],
    [-0.004, -0.012, 0.009, 0.45],
    [-0.02, -0.006, 0.007, 0.5],
  ];
  return {
    primitive: ellipsoid([0, 0.0085, 0], 0.027, [1.12, 0.32, 0.88], 'abrasive', { tint: '#86837c', rotation: [0, -20, 0] }),
    extra: cushions.map(([x, z, r, s]) => ellipsoid([x, 0.0165, z], r, [1, s, 1], 'fabric', { tint: '#5b8a2c' })),
  };
}
