/**
 * `pnpm tsx scripts/geo/states-of-matter/build-parts.ts` — writes
 * src/content/topics/states-of-matter/data/parts.json (docs/36 §3–§4).
 *
 * A school science bench drawn life size (1 scene unit = 1 m, bench top
 * y = 0): five stations (weighing, measuring volume, air, squeezing, sand and
 * sugar), a side table of things from home, and a plinth of sand and sugar
 * grains drawn 40 × life size away from the bench. Every liquid's fill
 * profile is the inside of its vessel, built from the same numbers as the
 * vessel and as the `matter` model (docs/36 §4.2–§4.3), so the drawn levels
 * are the model's readings. Texts come from ./text.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTROL_TEXT,
  GROUP_TEXT,
  OUTPUT_TEXT,
  PART_TEXT,
  PRESET_TEXT,
  SPEC_TEXT,
  STATE_TEXT,
  TELEMETRY_TEXT,
} from './text';

type V3 = [number, number, number];
type V2 = [number, number];
type Prim = Record<string, unknown> & { kind: string; at: V3 };
interface Part {
  id: string;
  group?: string;
  primitive: Prim;
  extra?: Prim[];
  repeat?: Record<string, unknown>;
  explode?: { dir: V3; dist: number };
  connects?: string[];
  shell?: boolean;
  context?: boolean;
  castShadow?: boolean;
  clip?: boolean;
}

const OUT = join(import.meta.dirname, '../../../src/content/topics/states-of-matter/data/parts.json');

const n5 = (n: number) => {
  const v = Number(n.toFixed(5));
  return Object.is(v, -0) ? 0 : v;
};
const r3 = (v: readonly number[]): V3 => [n5(v[0]!), n5(v[1]!), n5(v[2]!)];
const r2 = (v: readonly number[]): V2 => [n5(v[0]!), n5(v[1]!)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const DEG = Math.PI / 180;
const ML = 1e-6; // one millilitre in cubic metres

const prim = (kind: string, at: V3, rest: Record<string, unknown>): Prim => ({ kind, ...rest, at: r3(at) });
const lathe = (at: V3, profile: V2[], color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('lathe', at, { profile: profile.map(r2), segments: 48, color, ...rest });
const box = (at: V3, size: V3, color: string, rest: Record<string, unknown> = {}): Prim => prim('box', at, { size: r3(size), color, ...rest });
const bevel = (at: V3, size: V3, b: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('bevelBox', at, { size: r3(size), bevel: b, color, ...rest });
const cyl = (at: V3, r: number, h: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('cylinder', at, { size: r3([r, r, h]), color, ...rest });
const sphere = (at: V3, r: number, color: string, rest: Record<string, unknown> = {}): Prim => prim('sphere', at, { size: [n5(r)], color, ...rest });
const torus = (at: V3, r: number, tube: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('torus', at, { size: [n5(r), n5(tube)], color, ...rest });
const tube = (at: V3, path: V3[], radius: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('tube', at, { path: path.map((p) => r3(sub(p, at))), radius, color, ...rest });

/** A closed cylinder profile (a liquid that can fill to `h`). */
const column = (r: number, h: number): V2[] => [[0, 0], [r, 0], [r, h], [0, h]];

/* ------------------------------------------------------------- colours */

const WATER = '#6c919a'; // as in the water topic
const SAND = '#c8ab78';
const WET_SAND = '#3d2e1b'; // darker in both themes (a fixed product colour, not a token)
const WET_TISSUE = '#7f7c74';
const liquid = (at: V3, profile: V2[], tint = WATER): Prim => lathe(at, profile, 'membrane', { tint });

const parts: Part[] = [];
const add1 = (p: Part) => {
  parts.push(p);
  return p;
};

/* ======================================================= 01 weighing */

const BAL_A: V3 = [-0.7, 0, 0.13]; // centre of the balance's footprint
const PAN_TOP = 0.052; // top of the pan above the bench

/** An electronic balance: body, round pan, empty display window and two buttons. */
function balance(at: V3, ring = false): { primitive: Prim; extra: Prim[] } {
  const [x, , z] = at;
  const extra: Prim[] = [
    lathe([x, 0.04, z], [[0, 0], [0.012, 0], [0.012, 0.006], [0.06, 0.008], [0.062, 0.012], [0, 0.012]], 'stainless'),
    bevel([x, 0.022, z + 0.091], [0.07, 0.016, 0.004], 0.0015, 'powder'),
    cyl([x + 0.05, 0.022, z + 0.092], 0.005, 0.004, 'powder', { rotation: [90, 0, 0] }),
    cyl([x + 0.064, 0.022, z + 0.092], 0.005, 0.004, 'powder', { rotation: [90, 0, 0] }),
  ];
  if (ring) extra.push(torus([x, PAN_TOP + 0.005, z], 0.05, 0.005, 'rubber', { rotation: [90, 0, 0], tint: '#3a3633' }));
  return { primitive: bevel([x, 0.02, z], [0.16, 0.04, 0.18], 0.008, 'enamel', { tint: '#e6e2d8' }), extra };
}
add1({ id: 'balance-a', group: 'weighing', ...balance(BAL_A), explode: { dir: [0, 1, 0], dist: 0.06 } });

// Beam balance: the stand is a context part; the beam with its two pans is the part that tilts.
const PIVOT: V3 = [-0.62, 0.2, -0.17];
const ARM = 0.13;
const PAN_Y = 0.06;
const hanger = (end: V3, pan: V3): Prim[] =>
  [0, 120, 240].map((a) => tube(end, [end, [pan[0] + 0.045 * Math.cos(a * DEG), pan[1] + 0.006, pan[2] + 0.045 * Math.sin(a * DEG)]], 0.0007, 'brass'));
{
  const L: V3 = [PIVOT[0] - ARM, PIVOT[1] - 0.004, PIVOT[2]];
  const R: V3 = [PIVOT[0] + ARM, PIVOT[1] - 0.004, PIVOT[2]];
  const panL: V3 = [L[0], PAN_Y, L[2]];
  const panR: V3 = [R[0], PAN_Y, R[2]];
  const pan = (c: V3) => lathe(c, [[0, 0], [0.05, 0.004], [0.052, 0.009], [0.05, 0.009], [0.048, 0.006], [0, 0.002]], 'stainless');
  add1({
    id: 'beam-balance',
    group: 'weighing',
    primitive: bevel(PIVOT, [2 * ARM + 0.02, 0.008, 0.012], 0.002, 'stainless'),
    extra: [
      pan(panL),
      pan(panR),
      ...hanger(L, panL),
      ...hanger(R, panR),
      box([PIVOT[0], PIVOT[1] - 0.035, PIVOT[2] + 0.008], [0.002, 0.06, 0.002], 'brass'),
    ],
    explode: { dir: [0, 1, 0], dist: 0.08 },
  });
}

const TRAY: V3 = [-0.5, 0.0075, 0.12];
add1({ id: 'object-tray', group: 'weighing', primitive: bevel(TRAY, [0.22, 0.015, 0.13], 0.004, 'plastic', { tint: '#b9b2a4' }), explode: { dir: [0, 1, 0], dist: 0.02 } });
const TRAY_TOP = 0.015;

// Stone: an oval pebble of 25 cm³ (sphere scaled 1.7 × 0.8 × 1.0).
const STONE_SCALE: V3 = [1.7, 0.8, 1.0];
const STONE_R = Math.cbrt(25e-6 / ((4 / 3) * Math.PI * 1.7 * 0.8));
const stoneHalfY = STONE_R * 0.8;
const stone = (at: V3, rotation?: V3): Prim =>
  sphere(at, STONE_R, 'abrasive', { tint: '#8b8780', scale: STONE_SCALE, ...(rotation ? { rotation } : {}) });
const STONE_AT: V3 = [-0.555, TRAY_TOP + stoneHalfY, 0.09];
add1({ id: 'stone', group: 'weighing', primitive: stone(STONE_AT), explode: { dir: [0, 1, 0], dist: 0.05 } });

const SPONGE: V3 = [-0.45, TRAY_TOP + 0.02, 0.14];
add1({
  id: 'sponge',
  group: 'weighing',
  primitive: bevel(SPONGE, [0.12, 0.04, 0.08], 0.008, 'fabric', { tint: '#d6b44c' }),
  explode: { dir: [0, 1, 0], dist: 0.05 },
});

const MARBLE_R = 0.008;
const MARBLE_AT: V3 = [-0.585, TRAY_TOP + MARBLE_R, 0.16];
const marble = (at: V3): Prim => sphere(at, MARBLE_R, 'glass', { tint: '#b8d4d8' });
add1({ id: 'marble', group: 'weighing', primitive: marble(MARBLE_AT), explode: { dir: [0, 1, 0], dist: 0.05 } });

const CLAY_R = Math.cbrt(20e-6 / ((4 / 3) * Math.PI));
const CLAY = { color: 'rubber', tint: '#b0623c' };
const CLAY_AT: V3 = [-0.53, TRAY_TOP + CLAY_R, 0.165];
add1({ id: 'clay-ball', group: 'weighing', primitive: sphere(CLAY_AT, CLAY_R, CLAY.color, { tint: CLAY.tint }), explode: { dir: [0, 1, 0], dist: 0.05 } });

/** A 250 ml beaker (inner radius 3.3 cm, 9 cm deep inside) standing at `at` (its foot). */
const BEAKER_R = 0.033;
const BEAKER_BASE = 0.003;
const beakerProfile: V2[] = [[0, 0], [BEAKER_R + 0.0015, 0], [BEAKER_R + 0.0015, 0.093], [BEAKER_R + 0.003, 0.0945], [BEAKER_R, 0.0945], [BEAKER_R, BEAKER_BASE], [0, BEAKER_BASE]];
const BEAKER_AT: V3 = [-0.42, 0, -0.03];
add1({
  id: 'water-beaker',
  group: 'weighing',
  primitive: lathe(BEAKER_AT, beakerProfile, 'glass'),
  extra: [liquid([BEAKER_AT[0], BEAKER_BASE, BEAKER_AT[2]], column(BEAKER_R - 0.0002, (200 * ML) / (Math.PI * BEAKER_R ** 2)))],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.05 },
});

/* ======================================================== 02 measuring */

/** A 250 ml measuring cylinder: inner radius 1.85 cm, glass wall 1.5 mm, inner floor at y 0.012, six-sided foot, a line every 10 ml. */
const CYL_R = 0.0185;
const CYL_FLOOR = 0.012;
const CYL_TOP = 0.3;
const CYL_AREA = Math.PI * CYL_R ** 2;
function cylinder(at: V3): { primitive: Prim; extra: Prim[] } {
  const [x, , z] = at;
  const ticks: Prim[] = [];
  for (let v = 10; v <= 250; v += 10) {
    const y = CYL_FLOOR + (v * ML) / CYL_AREA;
    const long = v % 50 === 0;
    ticks.push(box([x - 0.004 + (long ? 0.002 : 0), y, z + CYL_R + 0.0016], [long ? 0.012 : 0.007, 0.0007, 0.0006], 'powder'));
  }
  return {
    primitive: lathe(at, [[0, 0.008], [CYL_R + 0.0015, 0.008], [CYL_R + 0.0015, CYL_TOP], [CYL_R + 0.0028, CYL_TOP + 0.002], [CYL_R, CYL_TOP + 0.002], [CYL_R, CYL_FLOOR], [0, CYL_FLOOR]], 'glass'),
    extra: [
      lathe([x, 0, z], [[0, 0], [0.042, 0], [0.042, 0.008], [0, 0.008]], 'powder', { segments: 6, tint: '#3d4245' }),
      ...ticks,
    ],
  };
}
const cylWater = (at: V3, h = 0.27) => liquid([at[0], CYL_FLOOR, at[2]], column(CYL_R, h));

const CYL_A: V3 = [-0.37, 0, -0.12];
add1({ id: 'cylinder-a', group: 'measuring', ...cylinder(CYL_A), shell: true, explode: { dir: [0, 1, 0], dist: 0.06 }, connects: ['tall-glass', 'flask', 'bowl'] });
add1({ id: 'cyl-a-water', group: 'measuring', primitive: cylWater(CYL_A), explode: { dir: [0, 1, 0], dist: 0 } });

const GLASS: V3 = [-0.29, 0, -0.12];
const GLASS_R = 0.03;
const GLASS_BASE = 0.01;
add1({
  id: 'tall-glass',
  group: 'measuring',
  primitive: lathe(GLASS, [[0, 0], [GLASS_R + 0.002, 0], [GLASS_R + 0.0025, GLASS_BASE + 0.12], [GLASS_R, GLASS_BASE + 0.12], [GLASS_R, GLASS_BASE], [0, GLASS_BASE]], 'glass'),
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({ id: 'glass-water', group: 'measuring', primitive: liquid([GLASS[0], GLASS_BASE, GLASS[2]], column(GLASS_R, 0.12)), explode: { dir: [0, 1, 0], dist: 0 } });

const FLASK: V3 = [-0.205, 0, -0.12];
const FLASK_BASE = 0.003;
const flaskInside: V2[] = [[0, 0], [0.042, 0], [0.016, 0.1], [0.016, 0.14], [0, 0.14]];
add1({
  id: 'flask',
  group: 'measuring',
  primitive: lathe(
    FLASK,
    [[0, 0], [0.0438, 0], [0.0438, 0.004], [0.0178, FLASK_BASE + 0.1008], [0.0178, FLASK_BASE + 0.14], [0.0205, FLASK_BASE + 0.141], [0.0205, FLASK_BASE + 0.145], [0.016, FLASK_BASE + 0.145], [0.016, FLASK_BASE + 0.1], [0.042, FLASK_BASE], [0, FLASK_BASE]],
    'glass',
  ),
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({ id: 'flask-water', group: 'measuring', primitive: liquid([FLASK[0], FLASK_BASE, FLASK[2]], flaskInside), explode: { dir: [0, 1, 0], dist: 0 } });

// Wide bowl: inside a half ball of radius 8 cm, inner bottom at y 0.012; china, on a foot ring.
const BOWL: V3 = [-0.075, 0, -0.12];
const BOWL_R = 0.08;
const BOWL_FLOOR = 0.012;
{
  const c = BOWL_FLOOR + BOWL_R; // sphere centre height (local)
  const outer: V2[] = [];
  const inner: V2[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * 90 * DEG;
    outer.push([(BOWL_R + 0.004) * Math.sin(a), c - (BOWL_R + 0.004) * Math.cos(a)]);
  }
  for (let i = 24; i >= 0; i--) {
    const a = (i / 24) * 90 * DEG;
    inner.push([BOWL_R * Math.sin(a), c - BOWL_R * Math.cos(a)]);
  }
  add1({
    id: 'bowl',
    group: 'measuring',
    primitive: lathe(BOWL, [...outer, ...inner], 'enamel', { tint: '#ece6d8' }),
    extra: [lathe(BOWL, [[0.03, 0], [0.036, 0], [0.036, 0.009], [0.03, 0.009], [0.03, 0]], 'enamel', { tint: '#ece6d8' })],
    explode: { dir: [0, 1, 0], dist: 0.06 },
  });
  const water: V2[] = [[0, 0]];
  for (let i = 0; i <= 90; i++) {
    const a = i * DEG;
    water.push([BOWL_R * Math.sin(a), BOWL_R * (1 - Math.cos(a))]);
  }
  water.push([0, BOWL_R]);
  add1({ id: 'bowl-water', group: 'measuring', primitive: liquid([BOWL[0], BOWL_FLOOR, BOWL[2]], water), explode: { dir: [0, 1, 0], dist: 0 } });
}

const CYL_B: V3 = [-0.25, 0, 0.1];
add1({ id: 'cylinder-b', group: 'measuring', ...cylinder(CYL_B), shell: true, explode: { dir: [0, 1, 0], dist: 0.06 } });
add1({ id: 'cyl-b-water', group: 'measuring', primitive: cylWater(CYL_B), explode: { dir: [0, 1, 0], dist: 0 } });

// The four solids for cylinder B wait on the bench in front of it; each pose stands it on the cylinder's floor.
const DROP_STONE: V3 = [-0.335, stoneHalfY, 0.21];
add1({ id: 'drop-stone', group: 'measuring', primitive: stone(DROP_STONE, [0, 30, 0]), explode: { dir: [0, 1, 0], dist: 0.04 } });
const DROP_MARBLE: V3 = [-0.292, MARBLE_R, 0.225];
add1({ id: 'drop-marble', group: 'measuring', primitive: marble(DROP_MARBLE), explode: { dir: [0, 1, 0], dist: 0.04 } });
const DROP_CLAY: V3 = [-0.255, CLAY_R, 0.215];
add1({ id: 'drop-clay-ball', group: 'measuring', primitive: sphere(DROP_CLAY, CLAY_R, CLAY.color, { tint: CLAY.tint }), explode: { dir: [0, 1, 0], dist: 0.04 } });
// 20 cm³ capsule of radius 0.8 cm: middle section 8.88 cm (three's CapsuleGeometry length is the middle section), 10.48 cm overall.
const ROLL_R = 0.008;
const ROLL_MID = (20e-6 - (4 / 3) * Math.PI * ROLL_R ** 3) / (Math.PI * ROLL_R ** 2);
const DROP_ROLL: V3 = [-0.195, ROLL_R, 0.215];
add1({
  id: 'drop-clay-roll',
  group: 'measuring',
  primitive: prim('capsule', DROP_ROLL, { size: [ROLL_R, n5(ROLL_MID)], color: CLAY.color, tint: CLAY.tint, rotation: [90, 0, 0] }),
  explode: { dir: [0, 1, 0], dist: 0.04 },
});

/* ============================================================= 03 air */

const BASIN: V3 = [0.19, 0, 0.12];
const BASIN_R = 0.12;
const BASIN_FLOOR = 0.005;
const BASIN_DEPTH = 0.14;
const CUP_R = 0.035;
const CUP_H = 0.09;
const CUP_WALL = 0.002;
const CUP_BASE = 0.004;
const CUP_OUT = CUP_R + CUP_WALL;
const CUP_RIM_PUSHED = 0.03; // above the basin floor
const CUP_TOP_PUSHED = CUP_RIM_PUSHED + CUP_H + CUP_BASE; // 12.4 cm
const CUP_RIM_ABOVE = 0.215; // held above the basin
const CUP_DROP = BASIN_FLOOR + CUP_RIM_PUSHED - CUP_RIM_ABOVE;
add1({
  id: 'basin',
  group: 'air-bench',
  primitive: lathe(BASIN, [[0, 0], [BASIN_R + 0.003, 0], [BASIN_R + 0.003, 0.185], [BASIN_R, 0.185], [BASIN_R, BASIN_FLOOR], [0, BASIN_FLOOR]], 'glass'),
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.04 },
});
add1({ id: 'basin-water', group: 'air-bench', primitive: liquid([BASIN[0], BASIN_FLOOR, BASIN[2]], column(BASIN_R, 0.18)), explode: { dir: [0, 1, 0], dist: 0 } });
add1({
  id: 'basin-water-cup',
  group: 'air-bench',
  primitive: liquid([BASIN[0], BASIN_FLOOR, BASIN[2]], [[0, 0], [BASIN_R, 0], [BASIN_R, 0.18], [0, 0.18], [0, CUP_TOP_PUSHED], [CUP_OUT, CUP_TOP_PUSHED], [CUP_OUT, CUP_RIM_PUSHED], [0, CUP_RIM_PUSHED]]),
  explode: { dir: [0, 1, 0], dist: 0 },
});
const CUP_AT: V3 = [BASIN[0], CUP_RIM_ABOVE, BASIN[2]];
add1({
  id: 'cup',
  group: 'air-bench',
  primitive: lathe(CUP_AT, [[CUP_R, 0], [CUP_OUT, 0], [CUP_OUT, CUP_H + CUP_BASE], [0, CUP_H + CUP_BASE], [0, CUP_H], [CUP_R, CUP_H], [CUP_R, 0]], 'glass'),
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({
  id: 'cup-hole-mark',
  group: 'air-bench',
  primitive: cyl([CUP_AT[0], CUP_RIM_ABOVE + CUP_H + CUP_BASE + 0.0003, CUP_AT[2]], 0.0028, 0.0012, 'powder', { tint: '#24262a' }),
  extra: [torus([CUP_AT[0], CUP_RIM_ABOVE + CUP_H + CUP_BASE + 0.0006, CUP_AT[2]], 0.0036, 0.0007, 'powder', { rotation: [90, 0, 0], tint: '#24262a' })],
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({ id: 'cup-water', group: 'air-bench', primitive: liquid(CUP_AT, column(CUP_R, CUP_H)), explode: { dir: [0, 1, 0], dist: 0 } });
// The trapped air, drawn as a pale pocket while the cup is under water with no hole (the model's 1.0 mm of water below it).
add1({
  id: 'trapped-air',
  group: 'air-bench',
  // An open outline (first point just off the axis), so a cutaway shows the inside of the pocket instead of a hatched solid.
  primitive: lathe([CUP_AT[0], CUP_RIM_ABOVE + 0.001, CUP_AT[2]], [[0.0005, 0], [CUP_R - 0.0004, 0], [CUP_R - 0.0004, CUP_H - 0.0012], [0, CUP_H - 0.0012]], 'plastic', { tint: '#f6f5ef' }),
  explode: { dir: [0, 1, 0], dist: 0 },
  castShadow: false,
});
{
  const ty = CUP_RIM_ABOVE + CUP_H - 0.0085;
  add1({
    id: 'tissue',
    group: 'air-bench',
    primitive: sphere([CUP_AT[0], ty, CUP_AT[2]], 0.026, 'fabric', { tint: '#f1eee6', scale: [1.25, 0.32, 1.25] }),
    extra: [
      sphere([CUP_AT[0] + 0.012, ty - 0.004, CUP_AT[2] + 0.008], 0.012, 'fabric', { tint: '#f1eee6', scale: [1, 0.55, 0.9] }),
      sphere([CUP_AT[0] - 0.011, ty - 0.003, CUP_AT[2] - 0.01], 0.011, 'fabric', { tint: '#f1eee6', scale: [1.1, 0.6, 1] }),
    ],
    explode: { dir: [0, 1, 0], dist: 0.06 },
  });
}

const BAL_B: V3 = [0.17, 0, -0.2];
add1({ id: 'balance-b', group: 'air-bench', ...balance(BAL_B, true), explode: { dir: [0, 1, 0], dist: 0.04 } });

// Basketball: 75 cm round, resting on the ring on balance B.
const BALL_R = 0.75 / (2 * Math.PI);
const RING_Y = PAN_TOP + 0.005;
const BALL_C: V3 = [BAL_B[0], RING_Y + Math.sqrt((BALL_R + 0.005) ** 2 - 0.05 ** 2), BAL_B[2]];
{
  const seam = (rot: V3, r: number, off: V3 = [0, 0, 0]) => torus(add(BALL_C, off), r, 0.0016, 'rubber', { rotation: rot, tint: '#2a211c' });
  const d = 0.072;
  const rc = Math.sqrt(BALL_R ** 2 - d ** 2) + 0.0004;
  add1({
    id: 'basketball',
    group: 'air-bench',
    primitive: sphere(BALL_C, BALL_R, 'rubber', { tint: '#b8622e' }),
    extra: [seam([0, 0, 0], BALL_R + 0.0004), seam([0, 90, 0], BALL_R + 0.0004), seam([0, 90, 0], rc, [d, 0, 0]), seam([0, 90, 0], rc, [-d, 0, 0])],
    explode: { dir: [0, 1, 0], dist: 0.08 },
    connects: ['balance-b'],
  });
}
// Valve on the ball, facing the front and a little down.
const VALVE_DIR: V3 = (() => {
  const v: V3 = [0.35, -0.35, 0.87];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();
const VALVE: V3 = add(BALL_C, [VALVE_DIR[0] * BALL_R, VALVE_DIR[1] * BALL_R, VALVE_DIR[2] * BALL_R]);
const PUMP_Y = 0.017;
const PUMP_Z = -0.04;
const PUMP_X0 = 0.085; // handle end
const PUMP_X1 = 0.27; // hose end
{
  const hoseStart: V3 = [PUMP_X1 + 0.012, PUMP_Y, PUMP_Z];
  const needle: V3 = add(VALVE, [VALVE_DIR[0] * 0.012, VALVE_DIR[1] * 0.012, VALVE_DIR[2] * 0.012]);
  add1({
    id: 'ball-pump',
    group: 'air-bench',
    primitive: cyl([(PUMP_X0 + PUMP_X1) / 2, PUMP_Y, PUMP_Z], 0.016, PUMP_X1 - PUMP_X0, 'plastic', { rotation: [0, 0, 90], tint: '#5f7f74' }),
    extra: [
      cyl([PUMP_X0 - 0.008, PUMP_Y, PUMP_Z], 0.006, 0.016, 'plastic', { rotation: [0, 0, 90], tint: '#5f7f74' }),
      bevel([PUMP_X0 - 0.02, PUMP_Y, PUMP_Z], [0.016, 0.018, 0.09], 0.004, 'rubber', { tint: '#2f2c2a' }),
      cyl([PUMP_X1 + 0.006, PUMP_Y, PUMP_Z], 0.009, 0.012, 'rubber', { rotation: [0, 0, 90], tint: '#2f2c2a' }),
      tube(hoseStart, [hoseStart, [hoseStart[0] + 0.03, 0.025, PUMP_Z - 0.01], [needle[0] + 0.03, needle[1] - 0.02, needle[2] + 0.02], needle], 0.004, 'rubber', { tint: '#2f2c2a', bendRadius: 0.012 }),
      tube(needle, [needle, VALVE], 0.0012, 'stainless'),
    ],
    explode: { dir: [0, 0, 1], dist: 0.06 },
    connects: ['basketball'],
  });
}

// Balloon pump with the round balloon on its nozzle; the long balloon lies beside it.
const BPUMP: V3 = [0.36, 0, -0.26];
const NOZZLE: V3 = [BPUMP[0], 0.16, BPUMP[2]];
add1({
  id: 'balloon-pump',
  group: 'air-bench',
  primitive: lathe(BPUMP, [[0, 0], [0.03, 0], [0.03, 0.01], [0.018, 0.012], [0.018, 0.14], [0.008, 0.148], [0.005, 0.16], [0, 0.16]], 'plastic', { tint: '#6a6d8c' }),
  extra: [bevel([BPUMP[0], 0.005, BPUMP[2]], [0.09, 0.01, 0.03], 0.003, 'plastic', { tint: '#6a6d8c' })],
  explode: { dir: [0, 1, 0], dist: 0.04 },
  connects: ['balloon-round'],
});
const BALLOON_R = 0.065;
// Drawn limp (scaled down about the neck); the pose `balloons-full` blows them up.
const LIMP_ROUND: V3 = [0.32, 0.4, 0.32];
const LIMP_LONG: V3 = [0.45, 0.38, 0.45]; // capsule local axes: y is its length
{
  // A teardrop outline: neck at y 0, widest at 0.6 of its height.
  const prof: V2[] = [[0, 0]];
  const H = BALLOON_R * 2.3;
  for (let i = 1; i <= 20; i++) {
    const s = i / 20;
    const y = s * H;
    const rr = s < 0.06 ? 0.006 + s * 0.15 : BALLOON_R * Math.sin(Math.PI * Math.pow((y / H), 0.85)) ** 0.8;
    prof.push([Math.max(0.004, rr), y]);
  }
  prof.push([0, H]);
  add1({
    id: 'balloon-round',
    group: 'air-bench',
    primitive: lathe(NOZZLE, prof, 'rubber', { tint: '#b4413a', scale: LIMP_ROUND }),
    explode: { dir: [0, 1, 0], dist: 0.05 },
  });
}
const LONG_R = 0.024;
const LONG_MID = 0.15;
const KNOT: V3 = [0.41, 0, -0.31];
const LONG: V3 = [KNOT[0] + (LONG_MID / 2 + LONG_R) * LIMP_LONG[1], LONG_R * LIMP_LONG[0], KNOT[2]];
add1({
  id: 'balloon-long',
  group: 'air-bench',
  primitive: prim('capsule', LONG, { size: [LONG_R, LONG_MID], color: 'rubber', tint: '#3d6a9e', rotation: [0, 0, 90], scale: LIMP_LONG }),
  explode: { dir: [0, 1, 0], dist: 0.05 },
});

/* ======================================================== 04 syringes */

const RACK: V3 = [0.52, 0, -0.05];
const SX = [0.43, 0.52, 0.61];
const SYR_R = 0.01; // 2.0 cm bore
const SYR_FLOOR = 0.038; // the 0 ml line
const ML_LEN = ML / (Math.PI * SYR_R ** 2); // 0.318 cm per ml
const SYR_20 = SYR_FLOOR + 20 * ML_LEN;
const SYR_TOP = 0.128;
add1({
  id: 'syringe-rack',
  group: 'syringes',
  primitive: bevel([RACK[0], 0.006, RACK[2]], [0.32, 0.012, 0.12], 0.004, 'powder', { tint: '#c9ccc8' }),
  extra: [
    lathe([RACK[0] - 0.145, 0.012, RACK[2] - 0.025], [[0, 0], [0.008, 0], [0.008, 0.19], [0, 0.19]], 'stainless', { segments: 24 }),
    lathe([RACK[0] + 0.145, 0.012, RACK[2] - 0.025], [[0, 0], [0.008, 0], [0.008, 0.19], [0, 0.19]], 'stainless', { segments: 24 }),
    bevel([RACK[0], 0.11, RACK[2] - 0.025], [0.3, 0.014, 0.014], 0.003, 'powder', { tint: '#c9ccc8' }),
    ...SX.map((x) => torus([x, 0.11, RACK[2]], SYR_R + 0.0035, 0.0022, 'powder', { rotation: [90, 0, 0], tint: '#c9ccc8' })),
    ...SX.map((x) => cyl([x, 0.0135, RACK[2]], 0.012, 0.003, 'rubber', { tint: '#2f2c2a' })),
  ],
  explode: { dir: [0, -1, 0], dist: 0.01 },
});
function syringe(x: number): { primitive: Prim; extra: Prim[] } {
  const at: V3 = [x, 0, RACK[2]];
  const ticks: Prim[] = [];
  for (let v = 0; v <= 20; v++) {
    const long = v % 5 === 0;
    ticks.push(box([x - (long ? 0.0 : 0.002), SYR_FLOOR + v * ML_LEN, RACK[2] + SYR_R + 0.0014], [long ? 0.009 : 0.005, 0.0005, 0.0005], 'rubber', { tint: '#2f2c2a' }));
  }
  return {
    primitive: lathe(
      at,
      [[0, 0.02], [0.0022, 0.02], [0.0022, 0.03], [SYR_R + 0.0012, SYR_FLOOR - 0.004], [SYR_R + 0.0012, SYR_TOP], [SYR_R, SYR_TOP], [SYR_R, SYR_FLOOR], [0.0012, 0.031], [0, 0.031]],
      'glass',
    ),
    extra: [
      cyl([x, 0.0185, RACK[2]], 0.004, 0.009, 'rubber', { tint: '#2f2c2a' }),
      bevel([x, SYR_TOP - 0.0015, RACK[2]], [0.046, 0.003, 0.018], 0.001, 'glass'),
      ...ticks,
    ],
  };
}
add1({ id: 'syringe-air', group: 'syringes', ...syringe(SX[0]!), shell: true, explode: { dir: [0, 1, 0], dist: 0.03 } });
add1({ id: 'syringe-water', group: 'syringes', ...syringe(SX[1]!), shell: true, explode: { dir: [0, 1, 0], dist: 0.03 } });
add1({ id: 'syringe-sand', group: 'syringes', ...syringe(SX[2]!), shell: true, explode: { dir: [0, 1, 0], dist: 0.03 } });

const ROD_TOP = 0.165;
const PLATFORM_TOP = ROD_TOP + 0.004;
function plunger(x: number): { primitive: Prim; extra: Prim[] } {
  const z = RACK[2];
  const rodMid = (SYR_20 + 0.008 + ROD_TOP) / 2;
  const rodLen = ROD_TOP - SYR_20 - 0.008;
  return {
    primitive: lathe([x, SYR_20, z], [[0, 0], [SYR_R - 0.0002, 0], [SYR_R - 0.0002, 0.003], [SYR_R - 0.001, 0.004], [SYR_R - 0.0002, 0.005], [SYR_R - 0.0002, 0.008], [0, 0.008]], 'rubber', { tint: '#26272b', segments: 32 }),
    extra: [
      box([x, rodMid, z], [0.014, rodLen, 0.0018], 'plastic', { tint: '#e3ddd0' }),
      box([x, rodMid, z], [0.0018, rodLen, 0.014], 'plastic', { tint: '#e3ddd0' }),
      lathe([x, ROD_TOP, z], [[0, 0], [0.035, 0], [0.035, 0.004], [0, 0.004]], 'plastic', { tint: '#e3ddd0' }),
    ],
  };
}
add1({ id: 'plunger-air', group: 'syringes', ...plunger(SX[0]!), explode: { dir: [0, 1, 0], dist: 0.05 } });
add1({ id: 'plunger-water', group: 'syringes', ...plunger(SX[1]!), explode: { dir: [0, 1, 0], dist: 0.05 } });
add1({ id: 'plunger-sand', group: 'syringes', ...plunger(SX[2]!), explode: { dir: [0, 1, 0], dist: 0.05 } });
add1({ id: 'water-column', group: 'syringes', primitive: liquid([SX[1]!, SYR_FLOOR, RACK[2]], column(SYR_R - 0.0002, 20 * ML_LEN)), explode: { dir: [0, 1, 0], dist: 0.03 } });
add1({ id: 'sand-column', group: 'syringes', primitive: lathe([SX[2]!, SYR_FLOOR, RACK[2]], column(SYR_R - 0.0002, 20 * ML_LEN), 'abrasive', { tint: SAND }), explode: { dir: [0, 1, 0], dist: 0.03 } });

// Slotted 1 kg masses (steel, 3.5 cm radius, 3.0 cm thick), four stacked from the platform up; `count` shows the first k.
const MASS_H = 0.03;
const MASS_GAP = 0.0015;
function masses(x: number): { primitive: Prim; repeat: Record<string, unknown> } {
  const pitch = MASS_H + MASS_GAP;
  const centre = PLATFORM_TOP + MASS_H / 2 + 1.5 * pitch;
  return {
    primitive: lathe([x, centre - MASS_H / 2, RACK[2]], [[0, 0], [0.035, 0], [0.035, MASS_H], [0.006, MASS_H], [0.006, MASS_H - 0.004], [0, MASS_H - 0.004]], 'powder', { segments: 40, tint: '#50545a' }),
    repeat: { count: 4, axis: [0, 1, 0], spacing: n5(pitch) },
  };
}
add1({ id: 'masses-air', group: 'syringes', ...masses(SX[0]!), explode: { dir: [0, 1, 0], dist: 0.07 } });
add1({ id: 'masses-water', group: 'syringes', ...masses(SX[1]!), explode: { dir: [0, 1, 0], dist: 0.07 } });
add1({ id: 'masses-sand', group: 'syringes', ...masses(SX[2]!), explode: { dir: [0, 1, 0], dist: 0.07 } });

/* ========================================================== 05 grains */

/** A shallow dish (inner radius 4.2 cm) with a heap or a water surface. */
const dish = (at: V3): Prim => lathe(at, [[0, 0], [0.038, 0], [0.046, 0.012], [0.048, 0.016], [0.045, 0.016], [0.04, 0.006], [0, 0.004]], 'enamel', { tint: '#e9e4d8' });
const REPOSE = 33 * DEG;
function heap(at: V3, r: number, tint: string, seed: number): Prim {
  const h = r * Math.tan(REPOSE);
  const prof: V2[] = [[0, 0.004]];
  for (let i = 0; i <= 10; i++) {
    const rr = r * (1 - i / 10);
    const wobble = i > 0 && i < 10 ? 0.0012 * Math.sin(i * 2.3 + seed) : 0;
    prof.push([Math.max(0, rr), 0.004 + h * (i / 10) + wobble]);
  }
  return lathe(at, prof, 'abrasive', { tint, segments: 40 });
}
const SAND_DISH: V3 = [0.55, 0, 0.245];
const SUGAR_DISH: V3 = [0.665, 0, 0.255];
const WATER_DISH: V3 = [0.78, 0, 0.245];
add1({ id: 'sand-heap', group: 'grains', primitive: heap(SAND_DISH, 0.036, SAND, 0.4), extra: [dish(SAND_DISH)], explode: { dir: [0, 1, 0], dist: 0.04 } });
add1({ id: 'sugar-heap', group: 'grains', primitive: heap(SUGAR_DISH, 0.034, '#f1eee6', 1.7), extra: [dish(SUGAR_DISH)], explode: { dir: [0, 1, 0], dist: 0.04 } });
add1({
  id: 'water-dish',
  group: 'grains',
  primitive: lathe([WATER_DISH[0], 0.0045, WATER_DISH[2]], [[0, 0], [0.04, 0], [0.0436, 0.007], [0, 0.007]], 'membrane', { tint: WATER }),
  extra: [dish(WATER_DISH)],
  explode: { dir: [0, 1, 0], dist: 0.04 },
});

const CYL_C: V3 = [0.8, 0, -0.06];
const SAND_ML = 100;
const SAND_H = (SAND_ML * ML) / CYL_AREA;
add1({ id: 'cylinder-c', group: 'grains', ...cylinder(CYL_C), shell: true, explode: { dir: [0, 1, 0], dist: 0.06 } });
add1({ id: 'sand-in-cylinder', group: 'grains', primitive: lathe([CYL_C[0], CYL_FLOOR, CYL_C[2]], column(CYL_R - 0.0002, SAND_H), 'abrasive', { tint: SAND }), explode: { dir: [0, 1, 0], dist: 0 } });
add1({ id: 'water-over-sand', group: 'grains', primitive: cylWater(CYL_C), explode: { dir: [0, 1, 0], dist: 0 } });
const POUR: V3 = [0.795, 0, 0.075];
add1({ id: 'pour-cup', group: 'grains', primitive: lathe(POUR, beakerProfile, 'glass'), shell: true, explode: { dir: [0, 1, 0], dist: 0.05 }, connects: ['cylinder-c'] });
add1({ id: 'jug-water', group: 'grains', primitive: liquid([POUR[0], BEAKER_BASE, POUR[2]], column(BEAKER_R, 0.09)), explode: { dir: [0, 1, 0], dist: 0 } });
{
  const at: V3 = [0.66, 0.0045, 0.11];
  add1({
    id: 'magnifier',
    group: 'grains',
    primitive: lathe(at, [[0, -0.0035], [0.03, -0.0008], [0.03, 0.0008], [0, 0.0035]], 'glass'),
    extra: [
      torus(at, 0.031, 0.0028, 'powder', { rotation: [90, 0, 0], tint: '#2e2b29' }),
      prim('capsule', [at[0] - 0.072, at[1], at[2] + 0.02], { size: [0.0055, 0.07], color: 'powder', tint: '#2e2b29', rotation: [0, 16, 90] }),
    ],
    explode: { dir: [0, 1, 0], dist: 0.03 },
  });
}

/* ====================================================== 06 around you */

const TABLE_X = -1.45;
const WHEEL_C: V3 = [TABLE_X, 0.345, -0.15];
const WHEEL_R = 0.31;
const TYRE = 0.022;
// Valve on the rim, low on the front-right of the wheel.
const VALVE_A = 35 * DEG; // from the bottom, towards +x
const RIM_R = WHEEL_R - TYRE - 0.004;
const TYRE_VALVE: V3 = [WHEEL_C[0] + (RIM_R - 0.012) * Math.sin(VALVE_A), WHEEL_C[1] - (RIM_R - 0.012) * Math.cos(VALVE_A), WHEEL_C[2]];
{
  const spokes: Prim[] = [];
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * 360 + 7.5;
    const mid = (0.03 + RIM_R) / 2;
    spokes.push(cyl([WHEEL_C[0] + mid * Math.cos(a * DEG), WHEEL_C[1] + mid * Math.sin(a * DEG), WHEEL_C[2] + (k % 2 ? 0.006 : -0.006)], 0.001, RIM_R - 0.03, 'steel', { rotation: [0, 0, a - 90] }));
  }
  add1({
    id: 'bicycle-wheel',
    group: 'around-you',
    primitive: torus(WHEEL_C, WHEEL_R - TYRE, TYRE, 'rubber', { tint: '#2c2a28' }),
    extra: [
      torus(WHEEL_C, RIM_R, 0.007, 'casing'),
      lathe(WHEEL_C, [[0, -0.035], [0.012, -0.035], [0.012, -0.03], [0.022, -0.03], [0.022, -0.026], [0.012, -0.022], [0.012, 0.022], [0.022, 0.026], [0.022, 0.03], [0.012, 0.03], [0.012, 0.035], [0, 0.035]], 'steel', { rotation: [90, 0, 0], segments: 24 }),
      ...spokes,
      cyl(TYRE_VALVE, 0.003, 0.03, 'brass', { rotation: [0, 0, -35] }),
      bevel([WHEEL_C[0], 0.008, WHEEL_C[2]], [0.18, 0.016, 0.14], 0.004, 'powder', { tint: '#3b3e42' }),
      tube([WHEEL_C[0] - 0.07, 0.016, WHEEL_C[2]], [[WHEEL_C[0] - 0.07, 0.016, WHEEL_C[2]], [WHEEL_C[0] - 0.012, WHEEL_C[1], WHEEL_C[2] - 0.045]], 0.007, 'powder', { tint: '#3b3e42' }),
      tube([WHEEL_C[0] + 0.07, 0.016, WHEEL_C[2]], [[WHEEL_C[0] + 0.07, 0.016, WHEEL_C[2]], [WHEEL_C[0] + 0.012, WHEEL_C[1], WHEEL_C[2] - 0.045]], 0.007, 'powder', { tint: '#3b3e42' }),
    ],
    explode: { dir: [0, 1, 0], dist: 0.1 },
  });
}
const FPUMP: V3 = [TABLE_X + 0.3, 0, -0.245];
{
  const hoseStart: V3 = [FPUMP[0] - 0.02, 0.035, FPUMP[2] + 0.004];
  const tip = add(TYRE_VALVE, [0.012 * Math.sin(VALVE_A) * -1, -0.03, 0]);
  add1({
    id: 'floor-pump',
    group: 'around-you',
    primitive: lathe(FPUMP, [[0, 0.02], [0.02, 0.02], [0.02, 0.52], [0.012, 0.53], [0, 0.53]], 'powder', { tint: '#4b6f8e' }),
    extra: [
      bevel([FPUMP[0], 0.01, FPUMP[2]], [0.16, 0.02, 0.05], 0.005, 'powder', { tint: '#2e3033' }),
      cyl([FPUMP[0], 0.56, FPUMP[2]], 0.005, 0.06, 'steel'),
      prim('capsule', [FPUMP[0], 0.592, FPUMP[2]], { size: [0.013, 0.14], color: 'rubber', tint: '#2a2827', rotation: [90, 0, 0] }),
      tube(hoseStart, [hoseStart, [FPUMP[0] - 0.03, 0.03, FPUMP[2] + 0.04], [tip[0] + 0.02, 0.05, tip[2] - 0.02], [tip[0], tip[1] - 0.03, tip[2]], tip], 0.004, 'rubber', { tint: '#2a2827', bendRadius: 0.014 }),
    ],
    explode: { dir: [1, 0, 0], dist: 0.06 },
    connects: ['bicycle-wheel'],
  });
}
const CAN: V3 = [TABLE_X + 0.27, 0, 0.13];
const CAN_R = 0.033;
const CAN_H = 0.115;
add1({
  id: 'drink-can',
  group: 'around-you',
  primitive: lathe(CAN, [[0, 0.003], [0.022, 0], [0.028, 0.0015], [CAN_R, 0.01], [CAN_R, CAN_H - 0.012], [0.027, CAN_H - 0.002], [0.0275, CAN_H], [0.026, CAN_H], [0.025, CAN_H - 0.006], [0, CAN_H - 0.006]], 'casing'),
  extra: [bevel([CAN[0] + 0.008, CAN_H - 0.005, CAN[2]], [0.022, 0.0015, 0.011], 0.0006, 'casing')],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({
  id: 'can-drink',
  group: 'around-you',
  primitive: lathe([CAN[0], 0.004, CAN[2]], [[0, 0], [0.026, 0], [CAN_R - 0.0006, 0.007], [CAN_R - 0.0006, 0.094], [0, 0.094]], 'membrane', { tint: '#5b4632' }),
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
const KAYA: V3 = [TABLE_X + 0.12, 0, 0.15];
{
  const kaya: V2[] = [[0, 0.004], [0.031, 0.004], [0.031, 0.058], [0.022, 0.061], [0.012, 0.055], [0.004, 0.05], [0, 0.05]];
  add1({
    id: 'kaya-jar',
    group: 'around-you',
    primitive: lathe(KAYA, [[0, 0], [0.034, 0], [0.035, 0.004], [0.035, 0.07], [0.03, 0.075], [0.03, 0.08], [0.0285, 0.08], [0.0285, 0.0755], [0.0325, 0.07], [0.0325, 0.004], [0, 0.004]], 'glass'),
    extra: [
      lathe(KAYA, kaya, 'tissue', { tint: '#8a7a36' }),
      lathe([KAYA[0] + 0.055, 0, KAYA[2] - 0.02], [[0, 0], [0.036, 0], [0.036, 0.016], [0.034, 0.018], [0, 0.018]], 'plastic', { tint: '#b8933e' }),
    ],
    shell: true,
    explode: { dir: [0, 1, 0], dist: 0.06 },
  });
}
const ICE: V3 = [TABLE_X - 0.03, 0, 0.14];
add1({
  id: 'ice-cube',
  group: 'around-you',
  primitive: bevel([ICE[0] - 0.012, 0.0185, ICE[2]], [0.025, 0.025, 0.025], 0.004, 'glass', { tint: '#a9d3e0', rotation: [0, 18, 0] }),
  extra: [
    bevel([ICE[0] + 0.016, 0.0185, ICE[2] + 0.006], [0.025, 0.025, 0.025], 0.004, 'glass', { tint: '#a9d3e0', rotation: [0, -25, 0] }),
    lathe(ICE, [[0, 0], [0.04, 0], [0.05, 0.006], [0.047, 0.006], [0.038, 0.004], [0, 0.004]], 'enamel', { tint: '#5f7d8c' }),
  ],
  explode: { dir: [0, 1, 0], dist: 0.05 },
});
const JUICE: V3 = [TABLE_X - 0.17, 0, 0.12];
add1({
  id: 'juice-glass',
  group: 'around-you',
  primitive: lathe(JUICE, [[0, 0], [0.032, 0], [0.034, 0.11], [0.0315, 0.11], [0.03, 0.008], [0, 0.008]], 'glass'),
  extra: [lathe([JUICE[0], 0.008, JUICE[2]], [[0, 0], [0.03, 0], [0.0313, 0.075], [0, 0.075]], 'membrane', { tint: '#c98a3c' })],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.05 },
});
// Torch on a small stand, pointing to +x along the front of the table.
const TORCH: V3 = [TABLE_X - 0.28, 0.05, 0.255];
const TORCH_LEN = 0.16;
const HEAD_X = TORCH[0] + TORCH_LEN / 2;
add1({
  id: 'torch',
  group: 'around-you',
  primitive: lathe([TORCH[0] - TORCH_LEN / 2, TORCH[1], TORCH[2]], [[0, 0], [0.013, 0], [0.013, 0.11], [0.02, 0.135], [0.02, TORCH_LEN], [0, TORCH_LEN]], 'powder', { rotation: [0, 0, -90], tint: '#38414a' }),
  extra: [
    cyl([HEAD_X + 0.001, TORCH[1], TORCH[2]], 0.018, 0.002, 'glass', { rotation: [0, 0, 90], tint: '#f4ecd2' }),
    box([TORCH[0] - 0.02, TORCH[1] + 0.014, TORCH[2]], [0.014, 0.004, 0.008], 'rubber', { tint: '#2a2827' }),
    bevel([TORCH[0], 0.0175, TORCH[2]], [0.05, 0.035, 0.05], 0.004, 'wood', { tint: '#b99c74' }),
  ],
  explode: { dir: [0, 1, 0], dist: 0.04 },
});
const BEAM_LEN = 0.34;
add1({
  id: 'torch-beam',
  group: 'around-you',
  primitive: prim('cone', [HEAD_X + 0.002 + BEAM_LEN / 2, TORCH[1], TORCH[2]], { size: [0.04, BEAM_LEN], color: 'membrane', tint: '#f3e3a8', rotation: [0, 0, 90] }),
  castShadow: false,
  explode: { dir: [0, 1, 0], dist: 0 },
});

/* ========================================================= 07 closer */

// Grains drawn 40 × life size on a plinth well behind the bench (only ever seen alone, docs/36 D4).
const PLINTH: V3 = [0, 0.006, -1.7];
const X40 = 40;
const rng = (() => {
  let s = 20261020;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
})();
{
  const grains: Prim[] = [];
  const tints = ['#c4a171', '#8f887e', '#e3dccb'];
  const placed: { x: number; z: number; r: number }[] = [];
  let tries = 0;
  while (grains.length < 33 && tries < 4000) {
    tries++;
    const d = (0.2 + rng() * 0.8) * 1e-3 * X40; // 0.2–1.0 mm across, drawn × 40
    const r = d / 2;
    const x = PLINTH[0] - 0.115 + rng() * 0.12;
    const z = PLINTH[2] - 0.055 + rng() * 0.11;
    if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < (p.r + r) * 1.05)) continue;
    placed.push({ x, z, r });
    const seg = 6 + Math.floor(rng() * 3);
    const prof: V2[] = [[0, -r * 0.62], [r * 0.7, -r * 0.5], [r, -r * 0.05], [r * 0.82, r * 0.42], [r * 0.3, r * 0.62], [0, r * 0.66]];
    grains.push(lathe([x, 0.012 + r * 0.6, z], prof, 'plastic', { segments: seg, tint: tints[grains.length % 3], scale: [1 + rng() * 0.35, 0.75 + rng() * 0.3, 0.8 + rng() * 0.3], rotation: [rng() * 30 - 15, rng() * 360, rng() * 30 - 15] }));
  }
  // Sort by tint so the three glass shades bake into three batches.
  grains.sort((a, b) => String(a.tint).localeCompare(String(b.tint)));
  add1({ id: 'sand-grains', group: 'closer', primitive: grains[0]!, extra: grains.slice(1), explode: { dir: [0, 1, 0], dist: 0 }, castShadow: true });
}
{
  const crystals: Prim[] = [];
  const placed: { x: number; z: number; r: number }[] = [];
  let tries = 0;
  while (crystals.length < 25 && tries < 4000) {
    tries++;
    const w = (0.4 + rng() * 0.25) * 1e-3 * X40; // about 0.5 mm, drawn × 40
    const x = PLINTH[0] + 0.02 + rng() * 0.095;
    const z = PLINTH[2] - 0.05 + rng() * 0.1;
    if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < (p.r + w * 0.75) * 1.05)) continue;
    placed.push({ x, z, r: w * 0.75 });
    const k = 0.25 + rng() * 0.15;
    const shape: V2[] = [[-w / 2, -w * 0.32], [w / 2 - w * k, -w * 0.32], [w / 2, w * 0.05], [w / 2, w * 0.32], [-w / 2 + w * k, w * 0.32], [-w / 2, -w * 0.05]];
    crystals.push(prim('extrude', [x, 0.012 + w * 0.32, z], { shape: shape.map(r2), depth: n5(w * (0.7 + rng() * 0.3)), color: 'plastic', tint: '#f3f1ea', rotation: [0, rng() * 360, 0] }));
  }
  add1({ id: 'sugar-crystals', group: 'closer', primitive: crystals[0]!, extra: crystals.slice(1), explode: { dir: [0, 1, 0], dist: 0 }, castShadow: true });
}

/* ========================================================== context */

const legs = (cx: number, cz: number, hx: number, hz: number): Prim[] =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => box([cx + sx! * hx, -0.4, cz + sz! * hz], [0.045, 0.76, 0.045], 'wood', { tint: '#c7a77c' }));
add1({
  id: 'bench',
  clip: false,
  primitive: bevel([0, -0.02, 0], [1.8, 0.04, 0.7], 0.006, 'wood', { tint: '#d3b58b' }),
  extra: [...legs(0, 0, 0.84, 0.3), box([0, -0.68, 0], [1.68, 0.03, 0.03], 'wood', { tint: '#c7a77c' })],
  context: true,
  castShadow: true,
});
add1({
  id: 'side-table',
  clip: false,
  group: 'around-you',
  primitive: bevel([TABLE_X, -0.02, 0], [0.8, 0.04, 0.6], 0.006, 'wood', { tint: '#c9a57a' }),
  extra: legs(TABLE_X, 0, 0.36, 0.26),
  context: true,
  castShadow: true,
});
add1({
  id: 'balance-stand',
  group: 'weighing',
  primitive: bevel([PIVOT[0], 0.006, PIVOT[2]], [0.12, 0.012, 0.08], 0.003, 'powder', { tint: '#4a4e52' }),
  extra: [
    lathe([PIVOT[0], 0.012, PIVOT[2]], [[0, 0], [0.008, 0], [0.008, PIVOT[1] - 0.02], [0.004, PIVOT[1] - 0.012], [0, PIVOT[1] - 0.012]], 'stainless', { segments: 24 }),
    box([PIVOT[0], PIVOT[1] - 0.006, PIVOT[2]], [0.012, 0.012, 0.03], 'stainless'),
  ],
  context: true,
});
add1({
  id: 'closer-plinth',
  group: 'closer',
  primitive: bevel([PLINTH[0], 0, PLINTH[2]], [0.26, 0.012, 0.14], 0.003, 'powder', { tint: '#3e4349' }),
  context: true,
  castShadow: true,
});

/* ============================================================= poses */

type PoseEntry = { pivot?: V3; rotation?: V3; offset?: V3; scale?: V3 };
const poses: Record<string, Record<string, PoseEntry | number>> = {};
const centre = (id: string) => parts.find((p) => p.id === id)!.primitive.at;
const onto = (id: string, target: V3): PoseEntry => ({ offset: r3(sub(target, centre(id))) });

// Onto the pan of balance A.
poses['pan-stone'] = { stone: onto('stone', [BAL_A[0], PAN_TOP + stoneHalfY, BAL_A[2]]), duration: 0.6 };
poses['pan-sponge'] = { sponge: onto('sponge', [BAL_A[0], PAN_TOP + 0.02, BAL_A[2]]), duration: 0.6 };
poses['pan-marble'] = { marble: onto('marble', [BAL_A[0], PAN_TOP + MARBLE_R, BAL_A[2]]), duration: 0.6 };
poses['pan-clay'] = { 'clay-ball': onto('clay-ball', [BAL_A[0], PAN_TOP + CLAY_R, BAL_A[2]]), duration: 0.6 };
poses['pan-water'] = { 'water-beaker': onto('water-beaker', [BAL_A[0], PAN_TOP, BAL_A[2]]), duration: 0.6 };
// Beam balance: sponge in the left pan, stone in the right, the beam turned 6° about its pivot so the stone side goes down.
{
  const tilt = -6 * DEG;
  const rot = (v: V3): V3 => [v[0] * Math.cos(tilt) - v[1] * Math.sin(tilt), v[0] * Math.sin(tilt) + v[1] * Math.cos(tilt), v[2]];
  const panTop = PAN_Y + 0.004;
  const inPan = (id: string, x: number, half: number): PoseEntry => {
    const target: V3 = [x, panTop + half, PIVOT[2]];
    return { pivot: r3(PIVOT), rotation: [0, 0, -6], offset: r3(rot(sub(target, centre(id)))) };
  };
  poses['beam-tilt'] = {
    'beam-balance': { pivot: r3(PIVOT), rotation: [0, 0, -6] },
    sponge: inPan('sponge', PIVOT[0] - ARM, 0.02),
    stone: inPan('stone', PIVOT[0] + ARM, stoneHalfY),
    duration: 0.8,
  };
}
// Into cylinder B, standing on its inner floor.
poses['in-cyl-stone'] = { 'drop-stone': { pivot: r3(DROP_STONE), rotation: [0, 0, 90], offset: r3(sub([CYL_B[0], CYL_FLOOR + STONE_R * 1.7 + 0.0005, CYL_B[2]], DROP_STONE)) }, duration: 0.8 };
poses['in-cyl-marble'] = { 'drop-marble': onto('drop-marble', [CYL_B[0], CYL_FLOOR + MARBLE_R + 0.0005, CYL_B[2]]), duration: 0.8 };
poses['in-cyl-clay-ball'] = { 'drop-clay-ball': onto('drop-clay-ball', [CYL_B[0], CYL_FLOOR + CLAY_R + 0.0005, CYL_B[2]]), duration: 0.8 };
poses['in-cyl-clay-roll'] = {
  'drop-clay-roll': { pivot: r3(DROP_ROLL), rotation: [-90, 0, 0], offset: r3(sub([CYL_B[0], CYL_FLOOR + ROLL_MID / 2 + ROLL_R + 0.0005, CYL_B[2]], DROP_ROLL)) },
  duration: 0.8,
};
poses['sponge-squeezed'] = { sponge: { pivot: r3([SPONGE[0], TRAY_TOP, SPONGE[2]]), scale: [1.06, 0.45, 1.04] }, duration: 0.8 };
poses['cup-pushed'] = {
  cup: { offset: [0, n5(CUP_DROP), 0] },
  'cup-hole-mark': { offset: [0, n5(CUP_DROP), 0] },
  'cup-water': { offset: [0, n5(CUP_DROP), 0] },
  tissue: { offset: [0, n5(CUP_DROP), 0] },
  'trapped-air': { offset: [0, n5(CUP_DROP), 0] },
  duration: 0.4,
};
// Blown up: the round balloon about its neck, the long one about its knot.
poses['balloons-full'] = {
  'balloon-round': { pivot: r3(NOZZLE), scale: r3([1 / LIMP_ROUND[0], 1 / LIMP_ROUND[1], 1 / LIMP_ROUND[2]]) },
  'balloon-long': { pivot: r3(KNOT), scale: r3([1 / LIMP_LONG[1], 1 / LIMP_LONG[0], 1 / LIMP_LONG[2]]) },
  duration: 1.2,
};

/* ============================================================== flows */

const flows = [
  {
    id: 'escaping-air',
    group: 'air-flow',
    paths: [
      { id: 'cup-hole', path: [[BASIN[0], BASIN_FLOOR + CUP_TOP_PUSHED + 0.002, BASIN[2]], [BASIN[0] + 0.004, BASIN_FLOOR + 0.13, BASIN[2] + 0.002], [BASIN[0] - 0.002, BASIN_FLOOR + 0.142, BASIN[2]], [BASIN[0] + 0.003, BASIN_FLOOR + 0.17, BASIN[2] - 0.002]].map(r3) },
      ...[-0.009, -0.003, 0.004, 0.01].map((dx, i) => ({
        id: `sand-gap-${i + 1}`,
        path: [[CYL_C[0] + dx, CYL_FLOOR + 0.012 + i * 0.012, CYL_C[2] + (i % 2 ? 0.006 : -0.006)], [CYL_C[0] + dx * 0.6, CYL_FLOOR + 0.05, CYL_C[2]], [CYL_C[0] + dx, CYL_FLOOR + SAND_H + 0.012, CYL_C[2] - (i % 2 ? 0.004 : -0.004)]].map(r3),
      })),
    ],
    speed: 0.03,
    color: 'token:cold',
    count: 60,
    size: 0.35,
    spread: 0.0015,
    clip: false,
    whenRun: false,
  },
  {
    id: 'pumped-air',
    group: 'air-bench',
    paths: [
      { id: 'ball', path: [[PUMP_X0 + 0.02, PUMP_Y, PUMP_Z], [PUMP_X1 + 0.012, PUMP_Y, PUMP_Z], [PUMP_X1 + 0.03, 0.03, PUMP_Z - 0.01], VALVE, add(BALL_C, [0.02, -0.02, 0.02]), BALL_C].map(r3) },
      { id: 'balloon', path: [[BPUMP[0], 0.04, BPUMP[2]], [BPUMP[0], 0.15, BPUMP[2]], NOZZLE, [NOZZLE[0], NOZZLE[1] + 0.09, NOZZLE[2]]].map(r3) },
    ],
    speed: 0.12,
    color: 'token:cold',
    count: 90,
    size: 0.4,
    spread: 0.002,
    clip: false,
    whenRun: true,
  },
  {
    id: 'tyre-air',
    group: 'around-you',
    path: [[FPUMP[0], 0.45, FPUMP[2]], [FPUMP[0], 0.04, FPUMP[2]], [FPUMP[0] - 0.03, 0.03, FPUMP[2] + 0.04], [TYRE_VALVE[0] + 0.02, 0.05, TYRE_VALVE[2] - 0.02], TYRE_VALVE, ...[10, 40, 70, 100].map((a) => [WHEEL_C[0] + (WHEEL_R - TYRE) * Math.sin((35 + a) * DEG), WHEEL_C[1] - (WHEEL_R - TYRE) * Math.cos((35 + a) * DEG), WHEEL_C[2]] as V3)].map(r3),
    speed: 0.18,
    color: 'token:cold',
    count: 90,
    size: 0.45,
    spread: 0.003,
    clip: false,
    whenRun: true,
  },
];

/* ================================================================ sim */

const label = (id: keyof typeof CONTROL_TEXT) => CONTROL_TEXT[id].label;
const options = (id: 'weigh-object' | 'drop-object' | 'container' | 'cup-place') =>
  Object.entries(CONTROL_TEXT[id].options).map(([o, l]) => ({ id: o, label: l }));
const out = (id: string, from: string, unit?: string, decimals?: number) => ({ id, label: OUTPUT_TEXT[id]!, from, ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) });
const state = (id: string, from: string) => ({ id, label: OUTPUT_TEXT[id]!, kind: 'state', from, states: STATE_TEXT[id]! });
const vol = (id: string, part: string) => ({ id, label: OUTPUT_TEXT.reading!, from: `volume:${part}`, unit: 'ml' });
const SETTLE = { period: 0.5, damping: 0.25 };
const plungerOffset = { axis: [0, 1, 0], per: n5(ML_LEN), origin: 20, settle: SETTLE };

const sim = {
  kind: 'matter',
  controls: [
    { id: 'weigh-object', kind: 'choice', default: 'stone', label: label('weigh-object'), options: options('weigh-object') },
    { id: 'drop-object', kind: 'choice', default: 'nothing', label: label('drop-object'), options: options('drop-object') },
    { id: 'container', kind: 'choice', default: 'cylinder', label: label('container'), options: options('container') },
    { id: 'pumps', kind: 'step', values: [0, 5, 10, 15, 20], default: 0, label: label('pumps') },
    { id: 'cup-place', kind: 'choice', default: 'above', label: label('cup-place'), options: options('cup-place') },
    { id: 'cup-hole', kind: 'toggle', default: false, label: label('cup-hole') },
    { id: 'load', kind: 'step', values: [0, 1, 2, 3, 4], default: 0, unit: 'kg', label: label('load') },
    { id: 'water-added', kind: 'step', values: [0, 20, 40, 60, 80, 100], default: 0, unit: 'ml', label: label('water-added') },
  ],
  outputs: [
    out('mass', 'weigh:mass', 'g', 1),
    out('reading', 'displace:reading', 'ml', 0),
    out('object-volume', 'displace:volume', 'cm³', 1),
    out('level', 'pour:level', 'cm', 1),
    out('poured', 'pour:volume', 'ml', 0),
    out('ball-mass', 'pump:mass', 'g', 1),
    out('air-added', 'pump:air', 'g', 1),
    state('firmness', 'pump:firmness'),
    out('basin-level', 'cup:basin-level', 'cm', 1),
    out('basin-rise', 'cup:basin-rise', 'mm', 1),
    out('cup-rise', 'cup:cup-rise', 'mm', 1),
    state('tissue', 'cup:tissue'),
    state('cup-bubbles', 'cup:bubbles'),
    out('tissue-wet', 'cup:wet'),
    out('v-air', 'squeeze:air', 'ml', 1),
    out('v-water', 'squeeze:water', 'ml', 1),
    out('v-sand', 'squeeze:sand', 'ml', 1),
    out('sand-reading', 'pores:reading', 'ml', 0),
    out('air-gaps', 'pores:air', 'ml', 0),
    state('vs-sum', 'pores:vs-sum'),
    state('sand-bubbles', 'pores:bubbles'),
    out('wet', 'pores:wet'),
    vol('v-cyl-a', 'cyl-a-water'),
    vol('v-glass', 'glass-water'),
    vol('v-flask', 'flask-water'),
    vol('v-bowl', 'bowl-water'),
    vol('v-cyl-b', 'cyl-b-water'),
    vol('v-basin', 'basin-water'),
    vol('v-basin-cup', 'basin-water-cup'),
    vol('v-cup', 'cup-water'),
    vol('water-above', 'water-over-sand'),
    vol('water-left', 'jug-water'),
  ],
  bind: [
    ...Object.entries({ stone: ['stone', 'pan-stone'], sponge: ['sponge', 'pan-sponge'], marble: ['marble', 'pan-marble'], clay: ['clay-ball', 'pan-clay'], water: ['water-beaker', 'pan-water'] }).map(([value, [part, pose]]) => ({ control: 'weigh-object', part, pose: { [value]: pose } })),
    { control: 'drop-object', part: ['drop-stone', 'drop-marble', 'drop-clay-ball', 'drop-clay-roll'], pose: { stone: 'in-cyl-stone', marble: 'in-cyl-marble', 'clay-ball': 'in-cyl-clay-ball', 'clay-roll': 'in-cyl-clay-roll' } },
    { output: 'v-cyl-a', part: 'cyl-a-water', fill: { per: ML, meniscus: 0.0015, ease: 1.2 } },
    { output: 'v-glass', part: 'glass-water', fill: { per: ML, ease: 1.2 } },
    { output: 'v-flask', part: 'flask-water', fill: { per: ML, ease: 1.2 } },
    { output: 'v-bowl', part: 'bowl-water', fill: { per: ML, ease: 1.2 } },
    { output: 'v-cyl-b', part: 'cyl-b-water', fill: { per: ML, meniscus: 0.0015 } },
    { output: 'v-basin', part: 'basin-water', fill: { per: ML } },
    { output: 'v-basin-cup', part: 'basin-water-cup', fill: { per: ML, ease: 1.0 } },
    { output: 'v-cup', part: 'cup-water', fill: { per: ML, ease: 1.0 } },
    { output: 'water-above', part: 'water-over-sand', fill: { per: ML, below: SAND_ML, meniscus: 0.0015 } },
    { output: 'water-left', part: 'jug-water', fill: { per: ML } },
    { control: 'cup-place', part: ['cup', 'cup-hole-mark', 'cup-water', 'tissue', 'trapped-air'], pose: { pushed: 'cup-pushed' } },
    { control: 'cup-place', part: 'trapped-air', visible: { eq: 'pushed' } },
    { control: 'cup-hole', part: 'trapped-air', visible: { eq: false } },
    { control: 'cup-hole', part: 'cup-hole-mark', visible: true },
    { control: 'cup-place', part: 'basin-water', visible: { eq: 'above' } },
    { control: 'cup-place', part: 'basin-water-cup', visible: { eq: 'pushed' } },
    { output: 'tissue-wet', part: 'tissue', tint: { color: WET_TISSUE, full: 1 } },
    { output: 'cup-bubbles', flow: 'escaping-air', paths: ['cup-hole'], visible: { eq: 'rising' } },
    { output: 'sand-bubbles', flow: 'escaping-air', paths: ['sand-gap-1', 'sand-gap-2', 'sand-gap-3', 'sand-gap-4'], visible: { eq: 'rising' } },
    { control: 'pumps', flow: 'pumped-air', paths: ['ball'], visible: { gte: 5 } },
    { control: 'pumps', flow: 'pumped-air', paths: ['balloon'], visible: { eq: 0 } },
    { control: 'load', flow: 'pumped-air', paths: ['balloon'], visible: { eq: 0 } },
    { output: 'v-air', part: ['plunger-air', 'masses-air'], offset: plungerOffset },
    { output: 'v-water', part: ['plunger-water', 'masses-water'], offset: plungerOffset },
    { output: 'v-sand', part: ['plunger-sand', 'masses-sand'], offset: plungerOffset },
    { control: 'load', part: ['masses-air', 'masses-water', 'masses-sand'], count: { per: 1 } },
    { output: 'wet', part: 'sand-in-cylinder', tint: { color: WET_SAND, full: 1 } },
  ],
  matter: {
    g: 9.8,
    p0: 101.325,
    air: 1.18,
    water: { density: 0.997, squash: 4.5e-7 },
    objects: {
      stone: { volume: 25, density: 2.65 },
      sponge: { volume: 384, density: 0.03, floats: true },
      marble: { volume: n5((4 / 3) * Math.PI * 0.8 ** 3), density: 2.5 },
      clay: { volume: 20, density: 1.6 },
      'clay-ball': { volume: 20, density: 1.6 },
      'clay-roll': { volume: 20, density: 1.6 },
      water: { volume: 200, density: 0.997 },
    },
    weigh: { object: 'weigh-object', step: 0.1 },
    displace: { object: 'drop-object', water: 100, liquid: 'cyl-b-water' },
    pour: { container: 'container', volume: 200, liquids: { cylinder: 'cyl-a-water', glass: 'glass-water', flask: 'flask-water', bowl: 'bowl-water' } },
    pump: { pumps: 'pumps', ball: 600.0, stroke: 0.2, inside: 7.0, firm: [51.7, 58.6] },
    cup: {
      place: 'cup-place',
      hole: 'cup-hole',
      basin: { radius: BASIN_R * 100, depth: BASIN_DEPTH * 100 },
      cup: { radius: CUP_R * 100, height: CUP_H * 100, glass: 57.9, rim: CUP_RIM_PUSHED * 100, top: n5(CUP_TOP_PUSHED * 100) },
      liquids: { basin: 'basin-water', around: 'basin-water-cup', inside: 'cup-water' },
    },
    squeeze: { load: 'load', volume: 20, bore: SYR_R * 200, fillings: { air: 'gas', water: 'liquid', sand: 'grains' } },
    pores: { water: 'water-added', sand: SAND_ML, porosity: 0.35, liquids: { above: 'water-over-sand', jug: 'jug-water' }, jug: 100 },
  },
};

/* ========================================================== presets */

const cam = (position: V3, target: V3, fov = 30) => ({ position: r3(position), target: r3(target), fov });
const presets = [
  { id: 'scales-view', camera: cam([-0.42, 0.45, 0.8], [-0.6, 0.03, 0.0]) },
  { id: 'cylinders-view', camera: cam([-0.12, 0.38, 0.78], [-0.22, 0.08, -0.02]) },
  { id: 'basin-view', camera: cam([0.5, 0.3, 0.72], [0.19, 0.12, 0.1]) },
  { id: 'syringe-view', camera: cam([0.62, 0.33, 0.66], [0.52, 0.14, -0.05]) },
  { id: 'grains-view', camera: cam([0.8, 0.3, 0.7], [0.67, 0.03, 0.22]) },
  { id: 'table-view', camera: cam([-1.1, 1.0, 1.3], [-1.45, 0.17, 0.0]) },
];

/* ========================================================= assemble */

const groups = [
  { id: 'weighing', color: 'token:ink-2', card: false },
  { id: 'measuring', color: 'token:accent-2' },
  { id: 'air-bench', color: 'token:cold' },
  { id: 'syringes', color: 'token:ink-3', card: false },
  { id: 'grains', color: 'token:cut' },
  { id: 'around-you', color: 'token:loop' },
  { id: 'closer', color: 'token:neutral', card: false, scale: { unit: 'mm', magnification: 40 } },
  { id: 'air-flow', color: 'token:cold' },
].map((g) => ({
  id: g.id,
  name: GROUP_TEXT[g.id]!,
  color: g.color,
  ...(g.id === 'air-flow' ? {} : { scale: g.scale ?? { unit: 'cm', magnification: 1 } }),
  ...(g.card === false ? { card: false } : {}),
}));

const outParts = parts.map((p) => {
  const tx = PART_TEXT[p.id];
  if (!tx) throw new Error(`no text for part ${p.id}`);
  const { id, group, primitive, extra, ...rest } = p;
  if ((extra?.length ?? 0) > 32) throw new Error(`${id}: ${extra!.length} extra primitives (max 32)`);
  return { id, name: tx.name, ...(group ? { group } : {}), summary: tx.summary, detail: tx.detail, primitive, ...(extra?.length ? { extra } : {}), ...rest };
});
const missing = Object.keys(PART_TEXT).filter((id) => !parts.some((p) => p.id === id));
if (missing.length) throw new Error(`text for parts that are not built: ${missing.join(', ')}`);
// Context parts go last (numbering = status line).
outParts.sort((a, b) => Number(Boolean((a as { context?: boolean }).context)) - Number(Boolean((b as { context?: boolean }).context)));

const data = {
  parts: outParts,
  groups,
  flows,
  views: {
    assembled: { camera: cam([0.66, 1.02, 1.9], [-0.06, 0.03, -0.02]) },
    exploded: { camera: cam([0.74, 1.16, 2.12], [-0.06, 0.07, -0.02]) },
    cuts: {
      'basin-section': { normal: [0, 0, -1], offset: n5(BASIN[2] + 0.005), label: { en: 'Basin section', zh: '水盆剖面' } },
    },
    section: { plane: 'xy' },
    cover: cam([0.52, 0.82, 1.5], [-0.04, 0.04, -0.03]),
  },
  units: { modelUnit: 'cm', scale: 100 },
  presets: presets.map((p) => ({ id: p.id, label: PRESET_TEXT[p.id]!, camera: p.camera })),
  spec: SPEC_TEXT,
  telemetry: [
    { key: TELEMETRY_TEXT.mass, unit: 'g', follow: ['mass', 'ball-mass'], scope: 'observe' },
    { key: TELEMETRY_TEXT.volume, unit: 'ml', follow: ['reading', 'poured', 'sand-reading'], scope: 'observe' },
    { key: TELEMETRY_TEXT.level, unit: 'cm', follow: 'level', scope: 'observe' },
    { key: TELEMETRY_TEXT.syringes, unit: 'ml', follow: ['v-air', 'v-water', 'v-sand'], scope: 'observe' },
    { key: TELEMETRY_TEXT.basin, unit: 'cm', follow: 'basin-level' },
    { key: TELEMETRY_TEXT.air, unit: 'g', follow: 'air-added', scope: 'observe' },
  ],
  poses,
  sim,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
const ctx = outParts.filter((p) => (p as { context?: boolean }).context).length;
console.log(`states-of-matter parts.json: ${outParts.length - ctx} parts + ${ctx} context, ${Object.keys(poses).length} poses, ${flows.length} flows`);
console.log(`stone r ${(STONE_R * 100).toFixed(3)} cm, clay r ${(CLAY_R * 100).toFixed(3)} cm, roll middle ${(ROLL_MID * 100).toFixed(3)} cm, ball r ${(BALL_R * 100).toFixed(3)} cm, ball centre y ${BALL_C[1].toFixed(3)}`);
