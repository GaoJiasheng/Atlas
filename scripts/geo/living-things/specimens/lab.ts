/**
 * The bench around the specimens (docs/38 §3.2), in scene coordinates
 * (1 unit = 1 m, bench top y = 0, +Z towards the viewer): the long bench,
 * the specimen case with its 9 × 4 compartments, the sorting tray, the felt
 * pads of the three tray layouts, and the microscope corner — a plinth with
 * yeast cells and bacteria drawn 2,000 times life size (F-91, F-92) beside a
 * school microscope.
 */
import { bevel, box, capsule, cyl, ellipsoid, lathe, rng, sphere, sweep, type Prim, type V3 } from '../kit';

/* ------------------------------------------------------------ layout */

/** §3.2: case cells, nine to a row from the back left; the specimen stands on the case floor. */
export const CASE_FLOOR = 0.015;
export function caseCell(n: number): V3 {
  const c = (n - 1) % 9;
  const r = Math.floor((n - 1) / 9);
  return [-0.36 + 0.09 * c, CASE_FLOOR, -0.465 + 0.09 * r];
}

export interface Grid {
  at: V3;
  cols: number;
  rows: number;
  pitch: number;
  pad: string;
}
const grid = (x: number, z: number, cols: number, rows: number, pad: string, pitch = 0.08, y = 0.011): Grid => ({ at: [x, y, z], cols, rows, pitch, pad });

/**
 * Tray layouts (the sort model's `layouts`): pad centres, columns × rows, 8 cm pitch (X: 7 cm).
 * Packed tighter than docs/38 §3.2 (a 1.0 × 0.5 m tray instead of 1.32 × 0.58 m) so the 7 cm
 * specimens read at the tray camera; each grid still holds the most a group ever gets (two: 6 of
 * 12, three: 16 of 16, six: 5 of 6, X: 2 of 6), which `pnpm validate` checks for every question.
 */
export const LAYOUTS: Record<string, Record<string, Grid>> = {
  two: { a: grid(-0.24, 0.19, 4, 3, 'pad-2a'), b: grid(0.24, 0.19, 4, 3, 'pad-2b') },
  three: { a: grid(-0.34, 0.19, 4, 4, 'pad-3a'), b: grid(0, 0.19, 4, 4, 'pad-3b'), c: grid(0.34, 0.19, 4, 4, 'pad-3c') },
  six: {
    a: grid(-0.32, 0.1, 3, 2, 'pad-6a'),
    b: grid(0, 0.1, 3, 2, 'pad-6b'),
    c: grid(0.32, 0.1, 3, 2, 'pad-6c'),
    d: grid(-0.32, 0.29, 3, 2, 'pad-6d'),
    e: grid(0, 0.29, 3, 2, 'pad-6e'),
    f: grid(0.32, 0.29, 3, 2, 'pad-6f'),
    x: grid(0.58, -0.33, 3, 2, 'pad-x', 0.07, 0.005),
  },
};

/** A felt pad under one group's grid, 3 cm beyond the outer cell centres all round; its top is the grid's floor. */
export function padPrim(g: Grid): Prim {
  return bevel([g.at[0], g.at[1] - 0.0015, g.at[2]], [g.cols * g.pitch - 0.01, 0.003, g.rows * g.pitch - 0.01], 0.0012, 'plastic', { tint: '#aeb0a2' });
}

/* ----------------------------------------------------------- context */

const BENCH_TOP = '#c8a77c';
export const bench = (): { primitive: Prim; extra: Prim[] } => ({
  primitive: bevel([0, -0.015, -0.05], [1.9, 0.03, 1.1], 0.006, 'wood', { tint: BENCH_TOP }),
  extra: [
    ...[[-0.9, -0.55], [0.9, -0.55], [-0.9, 0.45], [0.9, 0.45]].map(([x, z]) => bevel([x!, -0.39, z!], [0.05, 0.72, 0.05], 0.004, 'wood', { tint: BENCH_TOP })),
    bevel([0, -0.05, 0.47], [1.75, 0.04, 0.02], 0.003, 'wood', { tint: BENCH_TOP }),
  ],
});

const CASE_WOOD = '#b48d60';
/** The specimen case: a shallow tray of pale wood, 84 × 38 cm, with low dividers making 9 × 4 compartments 9 cm square. */
export function specimenCase(): { primitive: Prim; extra: Prim[] } {
  const x0 = -0.42;
  const x1 = 0.42;
  const z0 = -0.52;
  const z1 = -0.14;
  const h = 0.032;
  const wall = 0.008;
  const extra: Prim[] = [
    box([0, h / 2, z0 + wall / 2], [x1 - x0, h, wall], 'wood', { tint: CASE_WOOD }),
    box([0, h / 2, z1 - wall / 2], [x1 - x0, h, wall], 'wood', { tint: CASE_WOOD }),
    box([x0 + wall / 2, h / 2, (z0 + z1) / 2], [wall, h, z1 - z0], 'wood', { tint: CASE_WOOD }),
    box([x1 - wall / 2, h / 2, (z0 + z1) / 2], [wall, h, z1 - z0], 'wood', { tint: CASE_WOOD }),
  ];
  for (let c = 1; c < 9; c++) extra.push(box([-0.405 + 0.09 * c, CASE_FLOOR + 0.007, (z0 + z1) / 2], [0.003, 0.014, z1 - z0 - 2 * wall], 'wood', { tint: CASE_WOOD }));
  for (let r = 1; r < 4; r++) extra.push(box([0, CASE_FLOOR + 0.007, -0.51 + 0.09 * r], [x1 - x0 - 2 * wall, 0.014, 0.003], 'wood', { tint: CASE_WOOD }));
  return { primitive: box([0, CASE_FLOOR / 2, (z0 + z1) / 2], [x1 - x0, CASE_FLOOR, z1 - z0], 'wood', { tint: CASE_WOOD }), extra };
}

const TRAY_WOOD = '#8c6b49';
/** The sorting tray: a flat board 1.0 × 0.5 m, top at y = 0.008, with a low rim. */
export function sortingTray(): { primitive: Prim; extra: Prim[] } {
  const x0 = -0.5;
  const x1 = 0.5;
  const z0 = -0.06;
  const z1 = 0.44;
  const rim = 0.014;
  const t = 0.012;
  return {
    primitive: box([0, 0.004, (z0 + z1) / 2], [x1 - x0, 0.008, z1 - z0], 'wood', { tint: TRAY_WOOD }),
    extra: [
      box([0, rim / 2, z0 + t / 2], [x1 - x0, rim, t], 'wood', { tint: TRAY_WOOD }),
      box([0, rim / 2, z1 - t / 2], [x1 - x0, rim, t], 'wood', { tint: TRAY_WOOD }),
      box([x0 + t / 2, rim / 2, (z0 + z1) / 2], [t, rim, z1 - z0], 'wood', { tint: TRAY_WOOD }),
      box([x1 - t / 2, rim / 2, (z0 + z1) / 2], [t, rim, z1 - z0], 'wood', { tint: TRAY_WOOD }),
    ],
  };
}

/* -------------------------------------------------- microscope corner */

export const PLINTH: V3 = [-0.74, 0, -0.36];
const PLINTH_TOP = 0.024;
export function cellPlinth(): Prim {
  return bevel([PLINTH[0], PLINTH_TOP / 2, PLINTH[2]], [0.22, PLINTH_TOP, 0.2], 0.004, 'powder', { tint: '#4c5053' });
}

/** The magnification of the plinth's cells: yeast 5–10 µm across drawn 1.2–1.8 cm (F-91), bacteria 0.5–5 µm long drawn 2–5 mm (F-92). */
export const MAGNIFICATION = 2000;
const um = (micrometres: number) => (micrometres * 1e-6 * MAGNIFICATION) / 2; // radius in metres for a diameter in µm

/** Yeast cells, magnified: a cluster of round to oval cells, four with a small bud (F-53, F-91). */
export function yeastCells(): { primitive: Prim; extra: Prim[] } {
  const r = rng(91);
  const centre: V3 = [PLINTH[0] - 0.048, PLINTH_TOP, PLINTH[2] - 0.004];
  const cells: [number, number, number][] = [];
  let guard = 0;
  while (cells.length < 13 && guard++ < 600) {
    const rad = um(6 + r() * 3);
    const a = r() * 2 * Math.PI;
    const d = Math.sqrt(r()) * 0.042;
    const x = centre[0] + Math.cos(a) * d;
    const z = centre[2] + Math.sin(a) * d;
    if (cells.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < (pr + rad) * 1.04)) continue;
    cells.push([x, z, rad]);
  }
  const prims = cells.map(([x, z, rad], i) => ellipsoid([x, PLINTH_TOP + rad * 0.85, z], rad, [1.12, 0.85, 1], 'tissue', { tint: '#ebe0c2', rotation: [0, i * 47, 0] }));
  const buds = cells.slice(0, 4).map(([x, z, rad], i) => {
    const a = (i * 97 + 30) * (Math.PI / 180);
    const b = rad * 0.42;
    return sphere([x + Math.cos(a) * (rad * 1.08 + b * 0.6), PLINTH_TOP + b * 0.95, z + Math.sin(a) * (rad + b * 0.6)], b, 'tissue', { tint: '#ebe0c2' });
  });
  const [main, ...rest] = [...prims, ...buds];
  return { primitive: main!, extra: rest };
}

/** Bacteria, magnified: rod-shaped and round cells, far smaller than the yeast cells beside them (F-53, F-92). */
export function bacteriaCells(): { primitive: Prim; extra: Prim[] } {
  const r = rng(92);
  const centre: V3 = [PLINTH[0] + 0.058, PLINTH_TOP, PLINTH[2] + 0.002];
  const prims: Prim[] = [];
  const spots: [number, number][] = [];
  let guard = 0;
  while (prims.length < 30 && guard++ < 900) {
    const a = r() * 2 * Math.PI;
    const d = Math.sqrt(r()) * 0.042;
    const x = centre[0] + Math.cos(a) * d;
    const z = centre[2] + Math.sin(a) * d;
    if (spots.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.0068)) continue;
    spots.push([x, z]);
    if (prims.length % 3 === 2) {
      prims.push(sphere([x, PLINTH_TOP + um(1.1), z], um(1.1), 'tissue', { tint: '#b2a7bd' }));
    } else {
      // A rod about 2–3 µm long and 0.9 µm thick, lying flat in a random direction.
      const length = 2 + r();
      prims.push(capsule([x, PLINTH_TOP + um(0.9), z], um(0.9), (length - 0.9) * 1e-6 * MAGNIFICATION, 'tissue', { tint: '#b2a7bd', rotation: [0, r() * 180, 90] }));
    }
  }
  const [main, ...rest] = prims;
  return { primitive: main!, extra: rest };
}

/** A school microscope beside the plinth: base, curved arm, stage, tube, eyepiece, objectives and focus knobs. */
export function microscope(): { primitive: Prim; extra: Prim[] } {
  const [x, , z] = [-0.74, 0, -0.16];
  const steel = { tint: '#c9ccc9' };
  const body = { tint: '#30353a' };
  return {
    primitive: bevel([x, 0.009, z], [0.075, 0.018, 0.1], 0.006, 'powder', body),
    extra: [
      sweep([[x, 0.016, z - 0.036], [x, 0.07, z - 0.04], [x, 0.135, z - 0.024], [x, 0.15, z - 0.004]], [0.0085, 0.0085, 0.0075, 0.007], 'powder', { ...body, radial: 10, section: { flat: 0.6 }, up: [1, 0, 0] }),
      bevel([x, 0.072, z + 0.008], [0.064, 0.005, 0.06], 0.002, 'powder', body),
      cyl([x, 0.148, z + 0.012], 0.0095, 0.0095, 0.06, 'powder', body),
      cyl([x, 0.188, z + 0.012], 0.0065, 0.0072, 0.022, 'stainless', steel),
      cyl([x, 0.115, z + 0.012], 0.012, 0.012, 0.008, 'stainless', steel),
      cyl([x + 0.005, 0.1, z + 0.016], 0.0035, 0.0045, 0.022, 'stainless', steel),
      cyl([x - 0.006, 0.101, z + 0.009], 0.003, 0.004, 0.018, 'stainless', steel),
      cyl([x, 0.05, z - 0.036], 0.011, 0.011, 0.034, 'stainless', { ...steel, rotation: [0, 0, 90] }),
      lathe([x, 0.0745, z + 0.012], [[0, 0], [0.008, 0], [0.008, 0.001], [0, 0.001]], 'stainless', steel),
    ],
  };
}

