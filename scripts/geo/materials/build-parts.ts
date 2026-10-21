/**
 * `pnpm tsx scripts/geo/materials/build-parts.ts` — writes
 * src/content/topics/materials/data/parts.json (docs/37 §3–§4).
 *
 * A primary-school materials bench drawn life size (1 scene unit = 1 m, bench
 * top y = 0) with five fair-test stations — strength (a strip across two
 * blocks, 500 g masses at the middle), flexibility (a strip clamped at one
 * end, a peg pushes the free end down), float or sink (a tank of fresh
 * water), waterproof (one drop from a dropper) and light through (torch,
 * sample, white screen) — and, to its left, a kitchen corner: counter, tiled
 * wall, casement window, wall cabinet, saucepan, bowl, glass, food box and
 * tea towel. Each station shows one sample at a time (`visible` bindings); the
 * bends, breaks and float levels come from the `materials` model with the
 * constants of S1 (docs/37 §2.2, as corrected by fact-check pass 2). Texts
 * come from ./text.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTROL_TEXT, GROUP_TEXT, OUTPUT_TEXT, PART_TEXT, PRESET_TEXT, SPEC_TEXT, STATE_TEXT, TELEMETRY_TEXT } from './text';

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

const OUT = join(import.meta.dirname, '../../../src/content/topics/materials/data/parts.json');

const n5 = (n: number) => {
  const v = Number(n.toFixed(5));
  return Object.is(v, -0) ? 0 : v;
};
const r3 = (v: readonly number[]): V3 => [n5(v[0]!), n5(v[1]!), n5(v[2]!)];
const r2 = (v: readonly number[]): V2 => [n5(v[0]!), n5(v[1]!)];
const DEG = Math.PI / 180;

const prim = (kind: string, at: V3, rest: Record<string, unknown>): Prim => ({ kind, ...rest, at: r3(at) });
const lathe = (at: V3, profile: V2[], color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('lathe', at, { profile: profile.map(r2), segments: 48, color, ...rest });
const box = (at: V3, size: V3, color: string, rest: Record<string, unknown> = {}): Prim => prim('box', at, { size: r3(size), color, ...rest });
const bevel = (at: V3, size: V3, b: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('bevelBox', at, { size: r3(size), bevel: b, color, ...rest });
const cyl = (at: V3, r: number, h: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('cylinder', at, { size: r3([r, r, h]), color, ...rest });
const sphere = (at: V3, r: number, color: string, rest: Record<string, unknown> = {}): Prim => prim('sphere', at, { size: [n5(r)], color, ...rest });
const tube = (at: V3, path: V3[], radius: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('tube', at, { path: path.map((p) => r3([p[0] - at[0], p[1] - at[1], p[2] - at[2]])), radius, color, ...rest });
/** An outline in the part's XY plane extruded `depth` along its Z, centred on `at`. */
const extrude = (at: V3, shape: V2[], depth: number, color: string, rest: Record<string, unknown> = {}): Prim =>
  prim('extrude', at, { shape: shape.map(r2), depth: n5(depth), color, ...rest });

/*
 * Euler angles (degrees, three.js order XYZ: matrix Rx·Ry·Rz) for a plan
 * outline drawn in XY and extruded along Z: `flat(yaw)` lays it on the bench
 * (plan y → scene −z, thickness → scene y) turned `yaw` about the vertical;
 * `tilted(a)` lays it flat and then tips its +x end down by `a` about the
 * scene's z axis. Derivation: Rz(−a)·Rx(−90) = Rx(−90)·Ry(a); Ry(ψ)·Rx(−90) = Rx(−90)·Rz(ψ).
 */
const flat = (yaw = 0): V3 => [-90, 0, yaw];
const tilted = (a: number): V3 => [-90, a, 0];

/* ------------------------------------------------------------- colours */
// Product colours (fixed hex, not tokens: they are the colour of the thing in both themes).
const TEAK = '#9a6a3e';
const BLOCK_PINE = '#d1ad78';
const GLAZE = '#f2efe7';
const TILE_BODY = '#b9ad98';
const RUBBER_GREY = '#3b3936';
const GLASS_GREEN = '#5f9a8e'; // window glass seen edge-on; drawn with the translucent membrane family so 2 mm pieces stay visible
const HDPE_MILK = '#ece9e0';
const COTTON = '#e6dfcd';
const WATER = '#6c919a'; // as in the water and states-of-matter topics
const WET = '#4b3e31'; // a damp patch darkens whatever it is on
const BENCH_TOP = '#d3b58b';

/** The seven materials: id = the model's sample id = the option id of strip / square / pick. */
const MATERIALS = ['wood', 'metal', 'ceramic', 'rubber', 'glass', 'plastic', 'fabric'] as const;
type Material = (typeof MATERIALS)[number];
const LOOK: Record<Material, { color: string; tint?: string }> = {
  wood: { color: 'wood', tint: TEAK },
  metal: { color: 'steel' },
  ceramic: { color: 'enamel', tint: GLAZE },
  rubber: { color: 'rubber', tint: RUBBER_GREY },
  glass: { color: 'membrane', tint: GLASS_GREEN },
  plastic: { color: 'membrane', tint: HDPE_MILK },
  fabric: { color: 'fabric', tint: COTTON },
};
const look = (m: Material) => ({ ...(LOOK[m].tint ? { tint: LOOK[m].tint } : {}) });

const parts: Part[] = [];
const add1 = (p: Part) => {
  parts.push(p);
  return p;
};

/* ======================================================== shared sizes */

const STRIP: V3 = [0.3, 0.002, 0.03]; // 30 × 3 cm, 2 mm thick (docs/37 §2.2)
const HALF_T = STRIP[1] / 2;
const SQUARE = 0.08; // samples 8 × 8 cm, 2 mm thick

/** A plan outline of a strip piece `len` long and 3 cm wide, its +x end broken (`jag` = offsets along x down the end). */
function brokenPiece(len: number, jag: number[], at: 'plus' | 'minus' = 'plus'): V2[] {
  const w = STRIP[2] / 2;
  const s = at === 'plus' ? 1 : -1;
  const end = (s * len) / 2;
  const back = -end;
  const pts: V2[] = [[back, -w], [back, w]];
  // Along the broken end from +w to −w.
  jag.forEach((dx, i) => {
    const y = w - (2 * w * i) / (jag.length - 1);
    pts.push([end + s * dx, y]);
  });
  return s > 0 ? pts : pts.reverse();
}
const GLASS_JAG = [0, -0.003, -0.006, -0.004, 0.001, 0.004, 0.003, -0.002];
const CERAMIC_JAG = [0, 0.002, -0.001, 0.0025, -0.002, 0.001, -0.0015, 0.002, 0];

/* ============================================================ 01 strength */

const SX = -0.9;
const SZ = 0.05;
const SPAN = 0.2;
const BLOCK = 0.06;
const STRIP_Y = BLOCK + HALF_T; // the strip lies on the blocks' top

// The blocks' inner faces stand exactly on the two supports (±span / 2), so a strip that bends down
// clears the wood and its overhangs lift off the tops (the `bend` pivots, docs/06 「弯曲」).
const blockAt = (side: -1 | 1): V3 => [SX + side * (SPAN / 2 + BLOCK / 2), BLOCK / 2, SZ];
add1({
  id: 'bridge-blocks',
  group: 'strength-rig',
  primitive: bevel(blockAt(-1), [BLOCK, BLOCK, BLOCK], 0.002, 'wood', { tint: BLOCK_PINE }),
  extra: [bevel(blockAt(1), [BLOCK, BLOCK, BLOCK], 0.002, 'wood', { tint: BLOCK_PINE })],
  explode: { dir: [0, 1, 0], dist: 0 },
});

for (const m of MATERIALS) {
  add1({
    id: `bridge-${m}`,
    group: 'strength-rig',
    primitive: box([SX, STRIP_Y, SZ], STRIP, LOOK[m].color, look(m)),
    explode: { dir: [0, 1, 0], dist: 0 },
    connects: ['bridge-blocks', 'bridge-hanger'],
    ...(m === 'glass' || m === 'plastic' ? { shell: true } : {}),
  });
}

/**
 * Snapped strips: two 15 cm pieces in a V. Each rests on its block's inner top edge (x = ±10 cm,
 * 6 cm up) with 4 cm beyond it, and its broken end on the bench near the middle.
 */
function snappedV(jag: number[], color: string, tint: string | undefined, extraEnd?: (end: V3, tiltDeg: number, side: number) => Prim): { primitive: Prim; extra: Prim[] } {
  const L = 0.15;
  const beyond = 0.04;
  const inner = L - beyond;
  const th = Math.asin(BLOCK / inner);
  const pieces: Prim[] = [];
  for (const side of [-1, 1] as const) {
    const edgeX = SX + side * (SPAN / 2);
    const innerX = edgeX - side * inner * Math.cos(th); // the broken end's foot on the bench
    // Centre of the piece's centre line: halfway along, lifted by half the thickness off the contact line.
    const dirX = side * Math.cos(th); // from the broken end towards the block
    const cx = innerX + dirX * (L / 2) - side * Math.sin(th) * HALF_T;
    const cy = (L / 2) * Math.sin(th) + Math.cos(th) * HALF_T;
    const shape = brokenPiece(L, jag, side < 0 ? 'plus' : 'minus');
    // Left piece: +x (its broken end) points right and down; right piece: −x end broken, points left and down.
    const rot = tilted(side < 0 ? th / DEG : -th / DEG);
    pieces.push(extrude([cx, cy, SZ], shape, STRIP[1], color, { rotation: rot, ...(tint ? { tint } : {}) }));
    if (extraEnd) pieces.push(extraEnd([innerX, 0, SZ], th / DEG, side));
  }
  return { primitive: pieces[0]!, extra: pieces.slice(1) };
}
add1({
  id: 'bridge-glass-snapped',
  group: 'strength-rig',
  ...snappedV(GLASS_JAG, 'membrane', GLASS_GREEN),
  explode: { dir: [0, 1, 0], dist: 0 },
  shell: true,
  connects: ['bridge-blocks', 'bridge-hanger'],
});
// Ceramic: the broken faces show the tile's unglazed body.
const bodyFace = (end: V3, tiltDeg: number, side: number): Prim =>
  box([end[0] + side * 0.0004, end[1] + 0.0012, end[2]], [0.0012, 0.0021, 0.029], 'abrasive', { tint: TILE_BODY, rotation: [0, 0, side < 0 ? -tiltDeg : tiltDeg] });
add1({
  id: 'bridge-ceramic-snapped',
  group: 'strength-rig',
  ...snappedV(CERAMIC_JAG, 'enamel', GLAZE, bodyFace),
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['bridge-blocks', 'bridge-hanger'],
});

// Mass carrier: a 6 cm disc on the strip's middle and a rod for the slotted masses.
const CARRIER_Y = BLOCK + STRIP[1]; // underside on the strip's top
const ROD_TOP = 0.155;
add1({
  id: 'bridge-hanger',
  group: 'strength-rig',
  primitive: lathe([SX, CARRIER_Y, SZ], [[0, 0], [0.03, 0], [0.03, 0.0035], [0.0045, 0.0045], [0.0032, 0.005], [0.0032, ROD_TOP - CARRIER_Y], [0.0022, ROD_TOP - CARRIER_Y + 0.002], [0, ROD_TOP - CARRIER_Y + 0.002]], 'steel'),
  explode: { dir: [0, 1, 0], dist: 0.06 },
  connects: ['bridge-masses'],
});

// Slotted 500 g masses: brass discs 7 cm across, 1.5 cm thick, hole 11 mm, slot 8 mm wide towards the viewer.
const MASS_T = 0.015;
const MASS_R = 0.035;
function slottedDisc(): V2[] {
  const pts: V2[] = [];
  const hole = 0.0055;
  const slot = 0.004; // half width
  const a0 = Math.asin(slot / MASS_R);
  const b0 = Math.asin(slot / hole);
  // Outer arc from the slot's right edge round to its left edge (slot along −y = scene +z).
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + a0 + ((2 * Math.PI - 2 * a0) * i) / n;
    pts.push([MASS_R * Math.cos(a), MASS_R * Math.sin(a)]);
  }
  // Down the slot's left wall, round the hole the other way, up the right wall.
  const m = 16;
  for (let i = 0; i <= m; i++) {
    const a = -Math.PI / 2 - b0 - ((2 * Math.PI - 2 * b0) * i) / m;
    pts.push([hole * Math.cos(a), hole * Math.sin(a)]);
  }
  return pts;
}
const MASS_BASE = CARRIER_Y + 0.0035;
add1({
  id: 'bridge-masses',
  group: 'strength-rig',
  primitive: extrude([SX, MASS_BASE + MASS_T / 2 + 0.0002, SZ], slottedDisc(), MASS_T - 0.0004, 'brass', { rotation: flat(), bevel: 0.0008 }),
  repeat: { count: 5, axis: [0, 1, 0], spacing: MASS_T },
  explode: { dir: [0, 1, 0], dist: 0.08 },
  connects: ['bridge-hanger'],
});

/* ======================================================== 02 flexibility */

const CLAMP_X = -0.51; // the clamp's edge: the strip sticks out 25 cm from here
const BZ = 0.05;
const CLAMP_H = 0.15;
const BEND_Y = CLAMP_H + HALF_T;
const BEND_CX = CLAMP_X + 0.1; // strip centre: 5 cm in the clamp, 25 cm out
const TIP_X = BEND_CX + STRIP[0] / 2;
const PLATE_Y = CLAMP_H + STRIP[1] + 0.004;
const wingScrew = (z: number): Prim[] => [
  lathe([CLAMP_X - 0.035, PLATE_Y + 0.004, z], [[0, 0], [0.0032, 0], [0.0032, 0.012], [0.006, 0.013], [0.006, 0.018], [0, 0.018]], 'steel', { segments: 6 }),
  bevel([CLAMP_X - 0.035, PLATE_Y + 0.02, z], [0.026, 0.008, 0.004], 0.0015, 'steel'),
];
add1({
  id: 'bend-clamp',
  group: 'bend-rig',
  primitive: bevel([CLAMP_X - 0.04, CLAMP_H / 2, BZ], [0.08, CLAMP_H, 0.08], 0.003, 'wood', { tint: BLOCK_PINE }),
  extra: [
    // A steel clamping plate across the strip's end, held by two wing screws either side of it.
    bevel([CLAMP_X - 0.035, PLATE_Y, BZ], [0.064, 0.008, 0.07], 0.0015, 'steel'),
    ...wingScrew(BZ - 0.026),
    ...wingScrew(BZ + 0.026),
  ],
  explode: { dir: [0, 1, 0], dist: 0 },
});

for (const m of MATERIALS) {
  add1({
    id: `bend-${m}`,
    group: 'bend-rig',
    primitive: box([BEND_CX, BEND_Y, BZ], STRIP, LOOK[m].color, look(m)),
    explode: { dir: [0, 1, 0], dist: 0 },
    connects: ['bend-clamp', 'push-peg'],
    ...(m === 'glass' || m === 'plastic' ? { shell: true } : {}),
  });
}

/** Snapped in the clamp: a 5 cm stub (broken at the clamp's edge) and the 25 cm piece fallen flat on the bench. */
function snappedClamp(jag: number[], color: string, tint: string | undefined, face?: (x: number, y: number, z: number, yaw: number) => Prim): { primitive: Prim; extra: Prim[] } {
  const t = tint ? { tint } : {};
  const stubLen = 0.05;
  const stub = extrude([CLAMP_X - stubLen / 2, BEND_Y, BZ], brokenPiece(stubLen, jag.map((d) => d * 0.6), 'plus'), STRIP[1], color, { rotation: flat(), ...t });
  const yaw = 7;
  const longLen = 0.25;
  const cx = CLAMP_X + 0.005 + longLen / 2;
  const cz = BZ + 0.03;
  const fallen = extrude([cx, HALF_T, cz], brokenPiece(longLen, jag, 'minus'), STRIP[1], color, { rotation: flat(yaw), ...t });
  const extra = [fallen];
  if (face) {
    extra.push(face(CLAMP_X - 0.0006, BEND_Y, BZ, 0));
    const ex = cx - (longLen / 2) * Math.cos(yaw * DEG);
    const ez = cz + (longLen / 2) * Math.sin(yaw * DEG);
    extra.push(face(ex + 0.0006, HALF_T, ez, yaw));
  }
  return { primitive: stub, extra };
}
add1({
  id: 'bend-glass-snapped',
  group: 'bend-rig',
  ...snappedClamp(GLASS_JAG, 'membrane', GLASS_GREEN),
  explode: { dir: [0, 1, 0], dist: 0 },
  shell: true,
  connects: ['bend-clamp', 'push-peg'],
});
add1({
  id: 'bend-ceramic-snapped',
  group: 'bend-rig',
  ...snappedClamp(CERAMIC_JAG, 'enamel', GLAZE, (x, y, z, yaw) => box([x, y, z], [0.0012, 0.0021, 0.029], 'abrasive', { tint: TILE_BODY, rotation: [0, yaw, 0] })),
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['bend-clamp', 'push-peg'],
});

// Push stand: a rod just behind the strip's free end, a scale plate with a line every 0.5 cm (no numbers).
const PEG_X = TIP_X - 0.005;
const ROD_Z = BZ - 0.06;
const POINTER_Y = 0.17;
const scaleTicks: Prim[] = [0, 1, 2, 3, 4].map((k) =>
  box([PEG_X + 0.0135 + (k % 2 ? 0.002 : 0.004), POINTER_Y - k * 0.005, ROD_Z + 0.0052], [k % 2 ? 0.006 : 0.01, 0.0006, 0.0005], 'powder'),
);
add1({
  id: 'push-stand',
  group: 'bend-rig',
  primitive: bevel([PEG_X, 0.006, ROD_Z], [0.06, 0.012, 0.05], 0.003, 'powder', { tint: '#3d4245' }),
  extra: [
    lathe([PEG_X, 0.012, ROD_Z], [[0, 0], [0.0045, 0], [0.0045, 0.2], [0.003, 0.203], [0, 0.203]], 'steel', { segments: 24 }),
    // Scale plate on a bracket beside the rod.
    bevel([PEG_X + 0.018, POINTER_Y - 0.011, ROD_Z + 0.004], [0.016, 0.04, 0.002], 0.0006, 'enamel', { tint: '#f1eee6' }),
    box([PEG_X + 0.008, POINTER_Y - 0.03, ROD_Z + 0.002], [0.012, 0.004, 0.004], 'steel'),
    ...scaleTicks,
  ],
  explode: { dir: [0, 1, 0], dist: 0 },
});

// Push peg: slider on the rod, an arm forward over the strip, a rubber foot across the strip's end.
// At push 0 the foot's underside is at the strip's top (y = clamp height + 2 mm).
const FOOT_R = 0.004;
const FOOT_Y = CLAMP_H + STRIP[1] + FOOT_R;
const ARM_Y = FOOT_Y + 0.009;
add1({
  id: 'push-peg',
  group: 'bend-rig',
  primitive: bevel([PEG_X, POINTER_Y, ROD_Z], [0.016, 0.024, 0.016], 0.002, 'plastic', { tint: '#46505a' }),
  extra: [
    box([PEG_X, ARM_Y, (ROD_Z + BZ) / 2 + 0.004], [0.008, 0.008, BZ - ROD_Z + 0.006], 'plastic', { tint: '#46505a' }),
    box([PEG_X, (POINTER_Y + ARM_Y) / 2, ROD_Z + 0.009], [0.008, POINTER_Y - ARM_Y, 0.006], 'plastic', { tint: '#46505a' }),
    cyl([PEG_X, FOOT_Y, BZ], FOOT_R, 0.036, 'rubber', { rotation: [90, 0, 0], tint: '#2c2b29' }),
    box([PEG_X, ARM_Y - 0.0045, BZ], [0.004, 0.006, 0.004], 'steel'),
    // Pointer towards the scale.
    box([PEG_X + 0.011, POINTER_Y, ROD_Z + 0.003], [0.008, 0.0012, 0.002], 'brass'),
  ],
  explode: { dir: [0, 1, 0], dist: 0.04 },
});

/* ======================================================= 03 float or sink */

const TX = 0.0;
const TZ = -0.02;
const TANK: V3 = [0.4, 0.25, 0.25];
const PANE = 0.005;
const FLOOR_Y = PANE; // inner floor
const WATER_D = 0.18;
const trim = (at: V3, size: V3): Prim => box(at, size, 'powder', { tint: '#384043' });
{
  const [w, h, d] = TANK;
  const x0 = TX - w / 2;
  const x1 = TX + w / 2;
  const z0 = TZ - d / 2;
  const z1 = TZ + d / 2;
  const T = 0.009;
  add1({
    id: 'tank',
    group: 'float-tank',
    primitive: box([TX, h / 2, z1 - PANE / 2], [w, h, PANE], 'glass'),
    extra: [
      box([TX, h / 2, z0 + PANE / 2], [w, h, PANE], 'glass'),
      box([x0 + PANE / 2, h / 2, TZ], [PANE, h, d - 2 * PANE], 'glass'),
      box([x1 - PANE / 2, h / 2, TZ], [PANE, h, d - 2 * PANE], 'glass'),
      box([TX, PANE / 2, TZ], [w - 2 * PANE, PANE, d - 2 * PANE], 'glass'),
      // Plastic edge trim round the rim and the base, and up the four corners.
      trim([TX, h - T / 2, z1], [w + 0.004, T, 0.004]),
      trim([TX, h - T / 2, z0], [w + 0.004, T, 0.004]),
      trim([x0, h - T / 2, TZ], [0.004, T, d + 0.004]),
      trim([x1, h - T / 2, TZ], [0.004, T, d + 0.004]),
      trim([TX, T / 2, z1], [w + 0.004, T, 0.004]),
      trim([TX, T / 2, z0], [w + 0.004, T, 0.004]),
      trim([x0, T / 2, TZ], [0.004, T, d + 0.004]),
      trim([x1, T / 2, TZ], [0.004, T, d + 0.004]),
      ...[[x0, z0], [x0, z1], [x1, z0], [x1, z1]].map(([x, z]) => trim([x!, h / 2, z!], [0.006, h, 0.006])),
    ],
    shell: true,
    explode: { dir: [0, 1, 0], dist: 0 },
  });
}
add1({
  id: 'tank-water',
  group: 'float-tank',
  primitive: box([TX, FLOOR_Y + WATER_D / 2, TZ], [TANK[0] - 2 * PANE - 0.001, WATER_D, TANK[2] - 2 * PANE - 0.001], 'membrane', { tint: WATER }),
  explode: { dir: [0, 1, 0], dist: 0 },
});

// Things put into the water, standing on the inner floor at rise 0 (the `float-rise` offset lifts them).
const onFloor = (h: number): V3 => [TX, FLOOR_Y + h / 2, TZ];
const floatBlock = (m: Material): Prim => bevel(onFloor(0.03), [0.06, 0.03, 0.06], 0.0015, LOOK[m].color, look(m));
for (const m of ['wood', 'metal', 'ceramic', 'rubber', 'glass', 'plastic'] as const) {
  add1({
    id: `float-${m}`,
    group: 'float-tank',
    primitive: m === 'plastic' ? bevel(onFloor(0.03), [0.06, 0.03, 0.06], 0.0015, 'plastic', { tint: HDPE_MILK }) : floatBlock(m),
    explode: { dir: [0, 1, 0], dist: 0 },
    ...(m === 'glass' ? { shell: true } : {}),
  });
  if (m === 'wood') {
    add1({
      id: 'float-wood-big',
      group: 'float-tank',
      primitive: bevel(onFloor(0.06), [0.24, 0.06, 0.1], 0.002, 'wood', { tint: TEAK }),
      explode: { dir: [0, 1, 0], dist: 0 },
    });
  }
}
// A capped, empty 500 ml bottle lying down: 6.5 cm across, 20 cm long, ribs round the body.
{
  const R = 0.0325;
  const L = 0.2;
  const ribs: V2[] = [];
  for (const y of [0.05, 0.075, 0.1]) ribs.push([R, y - 0.006], [R - 0.0025, y - 0.003], [R - 0.0025, y + 0.003], [R, y + 0.006]);
  const body: V2[] = [
    [0, 0],
    [R - 0.006, 0.001],
    [R - 0.001, 0.005],
    [R, 0.012],
    ...ribs,
    [R, 0.13],
    [R - 0.004, 0.142],
    [0.021, 0.158],
    [0.0135, 0.168],
    [0.0135, 0.176],
    [0, 0.176],
  ];
  const y0 = -L / 2;
  add1({
    id: 'float-bottle',
    group: 'float-tank',
    // Lathe profile y runs along +x (rotation z −90°): base at x −10 cm, cap at +10 cm.
    primitive: lathe([TX + y0, FLOOR_Y + R, TZ], body, 'membrane', { rotation: [0, 0, -90], tint: '#d3e4e8' }),
    extra: [
      lathe([TX + y0 + 0.176, FLOOR_Y + R, TZ], [[0, 0], [0.0152, 0], [0.0152, 0.022], [0.014, 0.024], [0, 0.024]], 'plastic', { rotation: [0, 0, -90], tint: '#4f7591', segments: 32 }),
      lathe([TX + y0 + 0.173, FLOOR_Y + R, TZ], [[0.0135, 0], [0.019, 0], [0.019, 0.0018], [0.0135, 0.0018]], 'plastic', { rotation: [0, 0, -90], tint: '#4f7591', segments: 32 }),
    ],
    shell: true,
    explode: { dir: [0, 1, 0], dist: 0 },
  });
}
// Folded cotton cloth: a 6 × 6 cm pad 1 cm thick with one corner turned back.
add1({
  id: 'float-fabric',
  group: 'float-tank',
  primitive: bevel(onFloor(0.01), [0.06, 0.009, 0.06], 0.003, 'fabric', { tint: COTTON }),
  extra: [extrude([TX + 0.018, FLOOR_Y + 0.0098, TZ + 0.018], [[-0.012, 0.012], [0.012, 0.012], [0.012, -0.012]], 0.0014, 'fabric', { rotation: flat(), tint: '#ddd5c1' })],
  explode: { dir: [0, 1, 0], dist: 0 },
});

/* ========================================================== 04 waterproof */

const DX = 0.45;
const DZ = 0.08;
const BASE_H = 0.02;
const SQUARE_Y = BASE_H + HALF_T;
const SQUARE_TOP = BASE_H + STRIP[1];
const DROP_TIP = SQUARE_TOP + 0.05;
const DROP_ROD_Z = DZ - 0.085;
add1({
  id: 'drop-stand',
  group: 'drop-tray',
  primitive: bevel([DX, BASE_H / 2, DZ], [0.12, BASE_H, 0.12], 0.003, 'wood', { tint: BLOCK_PINE }),
  extra: [
    bevel([DX, 0.005, DROP_ROD_Z], [0.06, 0.01, 0.04], 0.002, 'powder', { tint: '#3d4245' }),
    lathe([DX, 0.01, DROP_ROD_Z], [[0, 0], [0.004, 0], [0.004, 0.17], [0, 0.17]], 'steel', { segments: 24 }),
    // Boss on the rod and an arm forward to the dropper.
    bevel([DX, 0.13, DROP_ROD_Z], [0.016, 0.016, 0.016], 0.002, 'steel'),
    cyl([DX, 0.13, (DROP_ROD_Z + DZ) / 2], 0.003, DZ - DROP_ROD_Z, 'steel', { rotation: [90, 0, 0] }),
    lathe([DX, 0.123, DZ], [[0.0052, 0], [0.008, 0], [0.008, 0.014], [0.0052, 0.014]], 'steel', { segments: 24 }),
    // Dropper: glass tube with a narrow tip, rubber bulb on top.
    lathe([DX, DROP_TIP, DZ], [[0, 0], [0.0011, 0], [0.0016, 0.012], [0.0042, 0.03], [0.0042, 0.085], [0, 0.085]], 'glass', { tint: '#b7cfd0', segments: 24 }),
    lathe([DX, DROP_TIP + 0.083, DZ], [[0, 0], [0.0055, 0], [0.0062, 0.006], [0.0072, 0.016], [0.0066, 0.028], [0.004, 0.034], [0, 0.035]], 'rubber', { tint: '#7d3a2e', segments: 24 }),
  ],
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['water-bead'],
});
for (const m of MATERIALS) {
  add1({
    id: `square-${m}`,
    group: 'drop-tray',
    primitive: box([DX, SQUARE_Y, DZ], [SQUARE, STRIP[1], SQUARE], m === 'plastic' ? 'plastic' : LOOK[m].color, m === 'plastic' ? { tint: HDPE_MILK } : look(m)),
    ...(m === 'glass'
      ? {
          // A glass square shows its green cut edge.
          extra: [
            box([DX, SQUARE_Y, DZ + SQUARE / 2 - 0.0006], [SQUARE, STRIP[1], 0.0012], 'plastic', { tint: '#5e8f86' }),
            box([DX, SQUARE_Y, DZ - SQUARE / 2 + 0.0006], [SQUARE, STRIP[1], 0.0012], 'plastic', { tint: '#5e8f86' }),
            box([DX + SQUARE / 2 - 0.0006, SQUARE_Y, DZ], [0.0012, STRIP[1], SQUARE - 0.0024], 'plastic', { tint: '#5e8f86' }),
            box([DX - SQUARE / 2 + 0.0006, SQUARE_Y, DZ], [0.0012, STRIP[1], SQUARE - 0.0024], 'plastic', { tint: '#5e8f86' }),
          ],
          shell: true,
        }
      : {}),
    explode: { dir: [0, 1, 0], dist: 0 },
  });
}
add1({
  id: 'water-bead',
  group: 'drop-tray',
  primitive: sphere([DX, SQUARE_TOP, DZ], 0.0055, 'glass', { scale: [1, 0.55, 1], tint: '#8fbcc6' }),
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['drop-stand'],
});
function blob(r: number, n = 40): V2[] {
  const pts: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    const k = 1 + 0.16 * Math.sin(3 * a + 0.6) + 0.09 * Math.sin(5 * a + 1.9) + 0.05 * Math.sin(8 * a);
    pts.push([r * k * Math.cos(a), r * k * Math.sin(a)]);
  }
  return pts;
}
add1({
  id: 'wet-patch',
  group: 'drop-tray',
  primitive: extrude([DX + 0.002, SQUARE_TOP + 0.00015, DZ - 0.002], blob(0.017), 0.0003, 'membrane', { rotation: flat(), tint: WET }),
  explode: { dir: [0, 1, 0], dist: 0 },
});

/* ======================================================== 05 light through */

const AXIS_Y = 0.1;
const LZ = 0.0;
const LENS_X = 0.7;
const HOLDER_X = 0.9;
const SCREEN_X = 1.0;
const SCREEN_W = 0.3;
const SCREEN_H = 0.22;
const SCREEN_Y = 0.12;
// Torch (as in light-and-shadows): profile y runs towards −x from the lens.
const torchProfile: V2[] = [
  [0, 0.004],
  [0.0172, 0.004],
  [0.0172, 0.0006],
  [0.0215, 0.0006],
  [0.0222, 0.002],
  [0.0222, 0.028],
  [0.0158, 0.05],
  [0.0148, 0.054],
  [0.0148, 0.132],
  [0.0157, 0.134],
  [0.0157, 0.152],
  [0.0125, 0.158],
  [0, 0.158],
];
const TORCH_STAND_X = LENS_X - 0.085;
add1({
  id: 'torch',
  group: 'light-bench',
  primitive: lathe([LENS_X - 0.0007, AXIS_Y, LZ], [[0, -0.0007], [0.0172, -0.0007], [0.0172, 0.0007], [0, 0.0007]], 'glass', { rotation: [0, 0, 90] }),
  extra: [
    lathe([LENS_X, AXIS_Y, LZ], torchProfile, 'powder', { rotation: [0, 0, 90], tint: '#3e4246' }),
    lathe([LENS_X, AXIS_Y, LZ], [[0.006, 0.0035], [0.0168, 0.0016], [0.0168, 0.0022], [0.006, 0.0041]], 'stainless', { rotation: [0, 0, 90] }),
    bevel([LENS_X - 0.075, AXIS_Y + 0.0158, LZ], [0.014, 0.005, 0.009], 0.002, 'rubber'),
    lathe([LENS_X - 0.112, AXIS_Y, LZ], [[0.0149, -0.012], [0.0154, -0.012], [0.0154, 0.012], [0.0149, 0.012]], 'rubber', { rotation: [0, 0, 90] }),
    // Stand: base, rod and a ring clamp round the body.
    bevel([TORCH_STAND_X, 0.005, LZ], [0.05, 0.01, 0.05], 0.002, 'powder', { tint: '#3d4245' }),
    cyl([TORCH_STAND_X, (0.01 + AXIS_Y - 0.0185) / 2, LZ], 0.004, AXIS_Y - 0.0185 - 0.01, 'steel'),
    lathe([TORCH_STAND_X, AXIS_Y, LZ], [[0.0149, -0.007], [0.0185, -0.007], [0.0185, 0.007], [0.0149, 0.007]], 'steel', { rotation: [0, 0, 90] }),
  ],
  explode: { dir: [0, 1, 0], dist: 0.06 },
  connects: ['sheet-holder'],
});
add1({
  id: 'sheet-holder',
  group: 'light-bench',
  primitive: bevel([HOLDER_X, 0.0075, LZ], [0.03, 0.015, 0.12], 0.002, 'wood', { tint: BLOCK_PINE }),
  extra: [
    ...[-1, 1].flatMap((s) => [
      cyl([HOLDER_X, 0.07, LZ + s * 0.0445], 0.0025, 0.11, 'steel'),
      bevel([HOLDER_X, AXIS_Y, LZ + s * 0.0425], [0.008, 0.012, 0.007], 0.0015, 'steel'),
    ]),
  ],
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['torch', 'screen'],
});
for (const m of MATERIALS) {
  add1({
    id: `sheet-${m}`,
    group: 'light-bench',
    primitive: box([HOLDER_X, AXIS_Y, LZ], [STRIP[1], SQUARE, SQUARE], m === 'plastic' ? 'plastic' : LOOK[m].color, m === 'plastic' ? { tint: HDPE_MILK } : look(m)),
    ...(m === 'glass'
      ? {
          extra: [
            box([HOLDER_X, AXIS_Y + SQUARE / 2 - 0.0006, LZ], [STRIP[1], 0.0012, SQUARE], 'plastic', { tint: '#5e8f86' }),
            box([HOLDER_X, AXIS_Y - SQUARE / 2 + 0.0006, LZ], [STRIP[1], 0.0012, SQUARE], 'plastic', { tint: '#5e8f86' }),
          ],
          shell: true,
        }
      : {}),
    explode: { dir: [0, 1, 0], dist: 0 },
    connects: ['sheet-holder'],
  });
}
add1({
  id: 'screen',
  group: 'light-bench',
  primitive: bevel([SCREEN_X + 0.0025, SCREEN_Y, LZ], [0.005, SCREEN_H, SCREEN_W], 0.0012, 'enamel', { tint: '#f3f1ea' }),
  extra: [-1, 1].map((s) => bevel([SCREEN_X + 0.004, 0.005, LZ + s * 0.12], [0.05, 0.01, 0.03], 0.002, 'powder', { tint: '#3d4245' })),
  explode: { dir: [0, 1, 0], dist: 0 },
  connects: ['sheet-holder'],
});

/* ======================================================== 06 kitchen corner */

const WALL_Z = -0.35; // front face of the back wall
const FLOOR = -0.78;
const K_X0 = -2.5;
const K_X1 = -1.4;
const WIN = { x0: -2.43, x1: -1.95, y0: 0.45, y1: 1.35 };
const WIN_Z = WALL_Z - 0.05; // the frame sits in the middle of the 10 cm wall
const CAB = { x0: -1.9, x1: -1.4, y0: 0.55, y1: 1.1, z0: WALL_Z, z1: WALL_Z + 0.3 };
const SHELF_Y = 0.82;
const P = 0.016; // cabinet board thickness

// Wall cabinet: sides, top, bottom, back, a middle shelf and the door open 100° on the right.
{
  const cx = (CAB.x0 + CAB.x1) / 2;
  const cz = (CAB.z0 + CAB.z1) / 2;
  const w = CAB.x1 - CAB.x0;
  const h = CAB.y1 - CAB.y0;
  const d = CAB.z1 - CAB.z0;
  const cy = (CAB.y0 + CAB.y1) / 2;
  const t = { tint: '#c9a678' };
  const hingeX = CAB.x1;
  const hingeZ = CAB.z1;
  const open = 100;
  const dir: V3 = [-Math.cos(open * DEG), 0, Math.sin(open * DEG)];
  const doorW = w;
  const doorC: V3 = [hingeX + dir[0] * (doorW / 2) + 0.004, cy, hingeZ + dir[2] * (doorW / 2) + 0.004];
  add1({
    id: 'wall-cabinet',
    group: 'corner-wood',
    primitive: bevel([cx, cy, CAB.z0 + 0.005], [w, h, 0.01], 0.002, 'wood', t),
    extra: [
      bevel([CAB.x0 + P / 2, cy, cz], [P, h, d], 0.002, 'wood', t),
      bevel([CAB.x1 - P / 2, cy, cz], [P, h, d], 0.002, 'wood', t),
      bevel([cx, CAB.y1 - P / 2, cz], [w - 2 * P, P, d], 0.002, 'wood', t),
      bevel([cx, CAB.y0 + P / 2, cz], [w - 2 * P, P, d], 0.002, 'wood', t),
      bevel([cx, SHELF_Y, cz + 0.01], [w - 2 * P, P, d - 0.03], 0.002, 'wood', t),
      bevel(doorC, [doorW, h, 0.018], 0.003, 'wood', { ...t, rotation: [0, open, 0] }),
    ],
    explode: { dir: [0, 1, 0], dist: 0.05 },
    connects: ['cabinet-hinges'],
  });
  // Two cup hinges on the inside of the right-hand side, their arms reaching the door.
  const hinge = (y: number): Prim[] => [
    bevel([CAB.x1 - P - 0.004, y, CAB.z1 - 0.03], [0.008, 0.03, 0.05], 0.0015, 'stainless'),
    bevel([CAB.x1 - 0.004, y, CAB.z1 - 0.006], [0.012, 0.012, 0.03], 0.0015, 'stainless'),
  ];
  add1({
    id: 'cabinet-hinges',
    group: 'corner-metal',
    primitive: lathe([CAB.x1 + 0.0035, CAB.y0 + 0.08, CAB.z1 + 0.012], [[0, 0], [0.0175, 0], [0.0175, 0.012], [0, 0.012]], 'stainless', { rotation: [0, 0, -90], segments: 24 }),
    extra: [
      lathe([CAB.x1 + 0.0035, CAB.y1 - 0.08, CAB.z1 + 0.012], [[0, 0], [0.0175, 0], [0.0175, 0.012], [0, 0.012]], 'stainless', { rotation: [0, 0, -90], segments: 24 }),
      ...hinge(CAB.y0 + 0.08),
      ...hinge(CAB.y1 - 0.08),
    ],
    explode: { dir: [0, 1, 0], dist: 0.05 },
    connects: ['wall-cabinet'],
  });
}

// Upper shelf: saucepan and bowl. Lower shelf: tumbler and food box.
const UPPER = SHELF_Y + P / 2;
const LOWER = CAB.y0 + P;
const PAN = { x: -1.805, z: -0.2, r: 0.07, h: 0.085 };
add1({
  id: 'saucepan',
  group: 'corner-metal',
  primitive: lathe([PAN.x, UPPER, PAN.z], [[0, 0], [PAN.r - 0.006, 0], [PAN.r, 0.006], [PAN.r, PAN.h], [PAN.r - 0.0015, PAN.h], [PAN.r - 0.0015, 0.007], [PAN.r - 0.007, 0.0015], [0, 0.0015]], 'stainless'),
  extra: [
    // Glass-and-steel lid seated in the rim, with a loop handle.
    lathe([PAN.x, UPPER + PAN.h - 0.004, PAN.z], [[0, 0.012], [0.03, 0.01], [PAN.r - 0.003, 0.002], [PAN.r + 0.002, 0], [PAN.r + 0.002, 0.003], [PAN.r - 0.003, 0.005], [0.03, 0.013], [0, 0.015]], 'stainless'),
    tube([PAN.x - 0.02, UPPER + PAN.h + 0.011, PAN.z], [[PAN.x - 0.02, UPPER + PAN.h + 0.011, PAN.z], [PAN.x - 0.017, UPPER + PAN.h + 0.026, PAN.z], [PAN.x + 0.017, UPPER + PAN.h + 0.026, PAN.z], [PAN.x + 0.02, UPPER + PAN.h + 0.011, PAN.z]], 0.0025, 'stainless'),
    // Long handle, riveted to the side and rising slightly.
    tube([PAN.x + PAN.r, UPPER + PAN.h - 0.02, PAN.z], [[PAN.x + PAN.r - 0.002, UPPER + PAN.h - 0.022, PAN.z], [PAN.x + PAN.r + 0.025, UPPER + PAN.h - 0.012, PAN.z + 0.004], [PAN.x + PAN.r + 0.115, UPPER + PAN.h + 0.012, PAN.z + 0.022]], 0.0045, 'stainless'),
  ],
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
add1({
  id: 'bowl',
  group: 'corner-ceramic',
  primitive: lathe([-1.53, UPPER, -0.205], [[0, 0], [0.026, 0], [0.027, 0.006], [0.034, 0.008], [0.058, 0.03], [0.07, 0.062], [0.067, 0.064], [0.055, 0.034], [0.032, 0.012], [0, 0.011]], 'enamel', { tint: '#f4f1ea' }),
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
// Tumbler: an eight-sided glass, 7 cm across, 10 cm tall, thick base.
add1({
  id: 'tumbler',
  group: 'corner-glass',
  primitive: lathe([-1.815, LOWER, -0.19], [[0, 0], [0.03, 0], [0.034, 0.1], [0.0315, 0.1], [0.028, 0.012], [0, 0.012]], 'glass', { segments: 8, tint: '#cfe3e1' }),
  extra: [lathe([-1.815, LOWER, -0.19], [[0, 0], [0.0296, 0], [0.0296, 0.011], [0, 0.011]], 'glass', { segments: 8, tint: '#a9c9c5' })],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.06 },
});
const FB = { x: -1.6, z: -0.19, w: 0.18, h: 0.075, d: 0.12 };
const FB_TOP = LOWER + FB.h;
add1({
  id: 'food-box',
  group: 'corner-plastic',
  primitive: bevel([FB.x, LOWER + FB.h / 2, FB.z], [FB.w, FB.h, FB.d], 0.012, 'membrane', { tint: '#e6ece9' }),
  extra: [
    // Lid and its four snap clips.
    bevel([FB.x, FB_TOP + 0.009, FB.z], [FB.w + 0.008, 0.01, FB.d + 0.008], 0.004, 'plastic', { tint: '#dfe5e2' }),
    ...[
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ].map(([sx, sz]) =>
      bevel(
        [FB.x + sx! * (FB.w / 2 + 0.006), FB_TOP - 0.004, FB.z + sz! * (FB.d / 2 + 0.006)],
        sx ? [0.003, 0.026, 0.04] : [0.05, 0.026, 0.003],
        0.001,
        'plastic',
        { tint: '#d7dedb' },
      ),
    ),
  ],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.08 },
  connects: ['box-seal'],
});
// The lid's rubber seal: a rounded-rectangle ring showing between box and lid.
{
  const hw = FB.w / 2 - 0.003;
  const hd = FB.d / 2 - 0.003;
  const rr = 0.012;
  const path: V3[] = [];
  const corners: [number, number, number][] = [
    [hw - rr, hd - rr, 0],
    [-(hw - rr), hd - rr, 90],
    [-(hw - rr), -(hd - rr), 180],
    [hw - rr, -(hd - rr), 270],
  ];
  for (const [cx, cz, a0] of corners) {
    for (let k = 0; k <= 4; k++) {
      const a = (a0 + (90 * k) / 4) * DEG;
      path.push([FB.x + cx + rr * Math.cos(a), FB_TOP + 0.003, FB.z + cz + rr * Math.sin(a)]);
    }
  }
  add1({
    id: 'box-seal',
    group: 'corner-rubber',
    primitive: prim('sweep', r3([FB.x, FB_TOP + 0.003, FB.z]), { path: path.map((p) => r3([p[0] - FB.x, p[1] - FB_TOP - 0.003, p[2] - FB.z])), radius: 0.0028, closed: true, color: 'rubber', tint: '#33302d' }),
    explode: { dir: [0, 1, 0], dist: 0.1 },
    connects: ['food-box'],
  });
}

// Window: aluminium frame in a 48 × 90 cm opening, a casement sash hinged on the left and opened 35° outwards,
// a friction stay along the bottom with two rivets at each end.
const SASH_OPEN = 35;
const FR = 0.035; // frame member width
{
  const { x0, x1, y0, y1 } = WIN;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const depth = 0.06;
  const members: Prim[] = [
    box([cx, y1 - FR / 2, WIN_Z], [x1 - x0, FR, depth], 'casing'),
    box([cx, y0 + FR / 2, WIN_Z], [x1 - x0, FR, depth], 'casing'),
    box([x0 + FR / 2, cy, WIN_Z], [FR, y1 - y0 - 2 * FR, depth], 'casing'),
    box([x1 - FR / 2, cy, WIN_Z], [FR, y1 - y0 - 2 * FR, depth], 'casing'),
    // Sill in front of the wall.
    bevel([cx, y0 - 0.012, WALL_Z + 0.015], [x1 - x0 + 0.06, 0.024, 0.05], 0.003, 'enamel', { tint: '#e2ded5' }),
  ];
  // The sash: hinged on the inner edge of the left frame member, outer face flush with the frame's back.
  const hx = x0 + FR;
  const hz = WIN_Z - depth / 2 + 0.012;
  const sw = x1 - x0 - 2 * FR - 0.004;
  const sh = y1 - y0 - 2 * FR - 0.004;
  const d: V3 = [Math.cos(SASH_OPEN * DEG), 0, -Math.sin(SASH_OPEN * DEG)];
  const along = (s: number, y: number, n = 0): V3 => [hx + d[0] * s + d[2] * -n, y, hz + d[2] * s + d[0] * n];
  const rot: V3 = [0, SASH_OPEN, 0];
  const SF = 0.028;
  members.push(
    box(along(sw / 2, y1 - FR - 0.002 - SF / 2), [sw, SF, 0.022], 'casing', { rotation: rot }),
    box(along(sw / 2, y0 + FR + 0.002 + SF / 2), [sw, SF, 0.022], 'casing', { rotation: rot }),
    box(along(SF / 2, (y0 + y1) / 2), [SF, sh - 2 * SF, 0.022], 'casing', { rotation: rot }),
    box(along(sw - SF / 2, (y0 + y1) / 2), [SF, sh - 2 * SF, 0.022], 'casing', { rotation: rot }),
  );
  // Friction stay: a flat steel arm from the bottom frame member to the sash's bottom rail.
  const stayY = y0 + FR + 0.004;
  const A: V3 = [x0 + FR + 0.2, stayY, WIN_Z - 0.006];
  const B = along(0.12, stayY, 0);
  members.push(box([(A[0] + B[0]) / 2, stayY, (A[2] + B[2]) / 2], [Math.hypot(A[0] - B[0], A[2] - B[2]), 0.003, 0.014], 'stainless', { rotation: [0, (Math.atan2(-(B[2] - A[2]), B[0] - A[0]) / DEG), 0] }));
  add1({
    id: 'window-frame',
    group: 'corner-metal',
    primitive: members[0]!,
    extra: members.slice(1),
    explode: { dir: [0, 0, 1], dist: 0.04 },
    connects: ['window-pane', 'window-rivets'],
  });
  add1({
    id: 'window-pane',
    group: 'corner-glass',
    primitive: box(along(sw / 2, (y0 + y1) / 2), [sw - 2 * SF + 0.006, sh - 2 * SF + 0.006, 0.005], 'glass', { rotation: rot, tint: '#86aeab' }),
    shell: true,
    explode: { dir: [0, 0, 1], dist: 0.04 },
    connects: ['window-frame'],
  });
  // Rivets: two round heads at each end of the stay.
  const dome: V2[] = [[0, 0], [0.0042, 0], [0.004, 0.0012], [0.003, 0.0024], [0, 0.003]];
  const ux = (B[0] - A[0]) / Math.hypot(B[0] - A[0], B[2] - A[2]);
  const uz = (B[2] - A[2]) / Math.hypot(B[0] - A[0], B[2] - A[2]);
  const heads: V3[] = [
    [A[0] + ux * 0.004, stayY + 0.0015, A[2] + uz * 0.004],
    [A[0] + ux * 0.018, stayY + 0.0015, A[2] + uz * 0.018],
    [B[0] - ux * 0.004, stayY + 0.0015, B[2] - uz * 0.004],
    [B[0] - ux * 0.018, stayY + 0.0015, B[2] - uz * 0.018],
  ];
  add1({
    id: 'window-rivets',
    group: 'corner-metal',
    primitive: lathe(heads[0]!, dome, 'stainless', { segments: 16 }),
    extra: heads.slice(1).map((h) => lathe(h, dome, 'stainless', { segments: 16 })),
    explode: { dir: [0, 0, 1], dist: 0.04 },
    connects: ['window-frame'],
  });
}

// Wall tiles: a 10 cm grid of glazed tiles from the counter up to the window sill.
{
  const x0 = K_X0 - 0.05;
  const x1 = K_X1 + 0.05;
  const top = WIN.y0 - 0.025;
  const grout: Prim[] = [];
  for (let y = 0.1; y < top - 0.01; y += 0.1) grout.push(box([(x0 + x1) / 2, y, WALL_Z + 0.0046], [x1 - x0, 0.0025, 0.0008], 'powder', { tint: '#a9a397' }));
  for (let x = x0 + 0.1; x < x1 - 0.01; x += 0.1) grout.push(box([x, top / 2, WALL_Z + 0.0046], [0.0025, top, 0.0008], 'powder', { tint: '#a9a397' }));
  add1({
    id: 'wall-tiles',
    group: 'corner-ceramic',
    primitive: box([(x0 + x1) / 2, top / 2, WALL_Z + 0.002], [x1 - x0, top, 0.004], 'enamel', { tint: '#e4ecea' }),
    extra: grout,
    explode: { dir: [0, 0, 1], dist: 0.03 },
  });
}

// Tea towel over the front edge of the cabinet's bottom board (as in the cover drawing): a fold on the board,
// the rest hanging below the cabinet, two stripes near the hem.
{
  const x = -1.79;
  const w = 0.16;
  const top = LOWER;
  const hang = 0.26;
  const front = CAB.z1;
  add1({
    id: 'tea-towel',
    group: 'corner-fabric',
    primitive: bevel([x, top + 0.0015, front - 0.04], [w, 0.003, 0.08], 0.0012, 'fabric', { tint: '#ece7da' }),
    extra: [
      cyl([x, top - 0.003, front + 0.003], 0.0055, w, 'fabric', { rotation: [0, 0, 90], tint: '#ece7da' }),
      bevel([x, top - 0.007 - hang / 2, front + 0.008], [w, hang, 0.003], 0.0012, 'fabric', { tint: '#ece7da' }),
      box([x, top - hang + 0.03, front + 0.0098], [w - 0.002, 0.012, 0.0006], 'fabric', { tint: '#8f8d86' }),
      box([x, top - hang + 0.05, front + 0.0098], [w - 0.002, 0.006, 0.0006], 'fabric', { tint: '#8f8d86' }),
    ],
    explode: { dir: [0, 1, 0], dist: 0.04 },
  });
}

/* ============================================================== context */

const legs = (cx: number, cz: number, hx: number, hz: number, tint: string): Prim[] =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => box([cx + sx! * hx, (FLOOR - 0.04) / 2, cz + sz! * hz], [0.045, -FLOOR - 0.04, 0.045], 'wood', { tint }));
add1({
  id: 'bench',
  clip: false,
  primitive: bevel([0, -0.02, 0], [2.4, 0.04, 0.7], 0.006, 'wood', { tint: BENCH_TOP }),
  extra: [...legs(0, 0, 1.12, 0.3, '#c7a77c'), box([0, -0.68, 0], [2.24, 0.03, 0.03], 'wood', { tint: '#c7a77c' })],
  context: true,
  castShadow: true,
});
{
  const cx = (K_X0 + K_X1) / 2;
  const w = K_X1 - K_X0;
  const z0 = WALL_Z;
  const z1 = 0.25;
  const doorW = w / 3;
  add1({
    id: 'counter',
    clip: false,
    primitive: bevel([cx, -0.015, (z0 + z1) / 2 + 0.01], [w + 0.02, 0.03, z1 - z0 + 0.02], 0.004, 'enamel', { tint: '#cfccc4' }),
    extra: [
      // Base cupboard, plinth, three doors and their handles.
      box([cx, (FLOOR + 0.1 - 0.03) / 2, (z0 + z1) / 2 - 0.02], [w, -0.03 - FLOOR - 0.1, z1 - z0 - 0.04], 'wood', { tint: '#e3dccd' }),
      box([cx, FLOOR + 0.05, (z0 + z1) / 2 - 0.06], [w, 0.1, z1 - z0 - 0.12], 'powder', { tint: '#4a4e50' }),
      ...[0, 1, 2].map((i) => bevel([K_X0 + doorW * (i + 0.5), (FLOOR + 0.1 - 0.035) / 2, z1 - 0.03], [doorW - 0.006, -0.035 - FLOOR - 0.1 - 0.006, 0.018], 0.003, 'wood', { tint: '#ebe5d8' })),
      ...[0, 1, 2].map((i) => bevel([K_X0 + doorW * (i + 0.5), -0.07, z1 - 0.017], [0.12, 0.012, 0.012], 0.003, 'stainless')),
    ],
    context: true,
    castShadow: true,
  });
}
{
  // Back wall, 10 cm thick, with the window opening cut out.
  const x0 = K_X0 - 0.05;
  const x1 = K_X1 + 0.05;
  const y0 = FLOOR;
  const y1 = 1.62;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const shape: V2[] = [[x0 - cx, y0 - cy], [x1 - cx, y0 - cy], [x1 - cx, y1 - cy], [x0 - cx, y1 - cy]];
  const hole: V2[] = [[WIN.x0 - cx, WIN.y0 - cy], [WIN.x0 - cx, WIN.y1 - cy], [WIN.x1 - cx, WIN.y1 - cy], [WIN.x1 - cx, WIN.y0 - cy]];
  add1({
    id: 'corner-wall',
    clip: false,
    primitive: extrude([cx, cy, WALL_Z - 0.05], shape, 0.1, 'enamel', { holes: [hole], tint: '#cdc6b6' }),
    context: true,
  });
}

/* ================================================================ poses */

// Masses fallen: when a strip snaps, the carrier and its masses drop onto the bench behind the pieces, leaning a little.
const poses = {
  'masses-fallen': {
    'bridge-hanger': { pivot: r3([SX - 0.03, CARRIER_Y, SZ]), rotation: [0, 0, 6] as V3, offset: r3([0, -CARRIER_Y + 0.0032, -0.055]) },
    'bridge-masses': { pivot: r3([SX - 0.03, CARRIER_Y, SZ]), rotation: [0, 0, 6] as V3, offset: r3([0, -CARRIER_Y + 0.0032, -0.055]) },
    duration: 0.5,
  },
};

/* ================================================================== sim */

const label = (id: keyof typeof CONTROL_TEXT) => CONTROL_TEXT[id].label;
const materialOptions = MATERIALS.map((m) => ({ id: m, label: CONTROL_TEXT.strip.options[m] }));
const state = (id: string, from: string) => ({ id, label: OUTPUT_TEXT[id]!, kind: 'state', from, states: STATE_TEXT[id]! });
const num = (id: string, from: string, unit?: string, decimals?: number) => ({ id, label: OUTPUT_TEXT[id]!, from, ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) });

const BLOCKS = ['wood', 'wood-big', 'metal', 'ceramic', 'rubber', 'glass', 'plastic', 'bottle', 'fabric'] as const;
const sim = {
  kind: 'materials',
  controls: [
    { id: 'strip', kind: 'choice', default: 'wood', label: label('strip'), options: materialOptions },
    { id: 'masses', kind: 'step', values: [0, 1, 2, 3, 4, 5], default: 0, label: label('masses') },
    { id: 'push', kind: 'step', values: [0, 0.5, 1, 1.5, 2], default: 0, unit: 'cm', label: label('push') },
    { id: 'block', kind: 'choice', default: 'wood', label: label('block'), options: BLOCKS.map((b) => ({ id: b, label: CONTROL_TEXT.block.options[b] })) },
    { id: 'square', kind: 'choice', default: 'plastic', label: label('square'), options: materialOptions.map((o) => ({ id: o.id, label: CONTROL_TEXT.square.options[o.id as Material] })) },
    { id: 'pick', kind: 'choice', default: 'wood', label: label('pick'), options: materialOptions },
  ],
  outputs: [
    state('strength-result', 'bridge:result'),
    state('strength-bend', 'bridge:bend'),
    state('bridge-view', 'bridge:view'),
    num('bridge-sag', 'bridge:sag', 'm'),
    num('masses-on', 'control:masses-kg', 'kg', 1),
    state('flex-result', 'cantilever:result'),
    state('bend-view', 'cantilever:view'),
    num('flex-tip', 'cantilever:tip', 'm'),
    num('push-down', 'control:push', 'cm', 1),
    state('float-result', 'tank:result'),
    num('float-rise', 'tank:rise', 'cm'),
    state('drop-result', 'drops:result'),
    state('light-result', 'light:result'),
    num('light-dark', 'light:dark'),
    state('p-strength', 'profile:strength'),
    state('p-flex', 'profile:flex'),
    state('p-float', 'profile:float'),
    state('p-water', 'profile:water'),
    state('p-light', 'profile:light'),
  ],
  bind: [
    ...[...MATERIALS, 'glass-snapped', 'ceramic-snapped'].map((v) => ({ output: 'bridge-view', part: `bridge-${v}`, visible: { eq: v } })),
    { output: 'bridge-sag', part: MATERIALS.map((m) => `bridge-${m}`), bend: { mode: 'bridge', axis: [1, 0, 0], span: SPAN, per: 1, ease: 0.5 } },
    { control: 'masses', part: 'bridge-masses', count: { per: 1 } },
    { output: 'bridge-sag', part: ['bridge-hanger', 'bridge-masses'], offset: { axis: [0, -1, 0], per: 1, origin: 0 } },
    { output: 'bridge-view', part: ['bridge-hanger', 'bridge-masses'], pose: { 'glass-snapped': 'masses-fallen', 'ceramic-snapped': 'masses-fallen' } },
    ...[...MATERIALS, 'glass-snapped', 'ceramic-snapped'].map((v) => ({ output: 'bend-view', part: `bend-${v}`, visible: { eq: v } })),
    { output: 'flex-tip', part: MATERIALS.map((m) => `bend-${m}`), bend: { mode: 'cantilever', axis: [1, 0, 0], clamp: -0.1, reach: 0.25, per: 1, ease: 0.5 } },
    { control: 'push', part: 'push-peg', offset: { axis: [0, -1, 0], per: 0.01, origin: 0 } },
    ...BLOCKS.map((b) => ({ control: 'block', part: `float-${b}`, visible: { eq: b } })),
    { output: 'float-rise', part: BLOCKS.map((b) => `float-${b}`), offset: { axis: [0, 1, 0], per: 0.01, origin: 0 } },
    ...MATERIALS.map((m) => ({ control: 'square', part: `square-${m}`, visible: { eq: m } })),
    { output: 'drop-result', part: 'water-bead', visible: { eq: 'stays-on-top' } },
    { output: 'drop-result', part: 'wet-patch', visible: { eq: 'soaks-in' } },
    ...MATERIALS.map((m) => ({ control: 'square', part: `sheet-${m}`, visible: { eq: m } })),
  ],
  overlays: [
    {
      kind: 'shadow-cast',
      source: { part: 'torch', point: [LENS_X, AXIS_Y, LZ], axis: [1, 0, 0], beam: 20 },
      receiver: { part: 'screen', normal: [-1, 0, 0], size: [SCREEN_W, SCREEN_H] },
      casters: [{ part: 'sheet-holder' }, ...MATERIALS.map((m) => ({ part: `sheet-${m}`, dark: { output: 'light-dark' } }))],
      spot: { color: 'token:en-light' },
    },
  ],
  // The design constants (S1, docs/37 §2.2 with fact-check pass 2): E in GPa, limit in MPa, density in kg/m³; lengths in m, tank in cm.
  materials: {
    g: 9.8,
    samples: {
      wood: { E: 10.7, limit: 100.7, fails: 'snaps', density: 650, absorbs: true, light: 'none' },
      metal: { E: 200, limit: 250, fails: 'bends', density: 7820, absorbs: false, light: 'none' },
      ceramic: { E: 70, limit: 35, fails: 'snaps', density: 2400, absorbs: false, light: 'none' },
      rubber: { E: 0.005, fails: 'never', density: 920, absorbs: false, light: 'none' },
      glass: { E: 70, limit: 36, fails: 'snaps', density: 2500, absorbs: false, light: 'most' },
      plastic: { E: 1.2, limit: 25, fails: 'bends', density: 955, absorbs: false, light: 'some' },
      fabric: { limp: true, fails: 'never', density: 1540, absorbs: true, light: 'some' },
    },
    strip: { width: STRIP[2], thick: STRIP[1] },
    bridge: { strip: 'strip', masses: 'masses', mass: 0.5, span: SPAN, clearance: BLOCK, bend: { little: 0.005, lot: 0.03 } },
    cantilever: { strip: 'strip', push: 'push', reach: 0.25, droop: 0.01, hang: 0.8 },
    tank: {
      block: 'block',
      water: WATER_D * 100,
      density: 1000,
      height: TANK[1] * 100,
      blocks: {
        wood: { sample: 'wood', height: 3 },
        'wood-big': { sample: 'wood', height: 6 },
        metal: { sample: 'metal', height: 3 },
        ceramic: { sample: 'ceramic', height: 3 },
        rubber: { sample: 'rubber', height: 3 },
        glass: { sample: 'glass', height: 3 },
        plastic: { sample: 'plastic', height: 3 },
        bottle: { density: 40, height: 6.5 },
        fabric: { sample: 'fabric', height: 1 },
      },
    },
    drops: { square: 'square' },
    light: { square: 'square', dark: { most: 0.1, some: 0.6, none: 1 } },
    profile: { pick: 'pick', masses: 5, push: 2, block: 'same', square: 'same' },
  },
};

/* ============================================================== presets */

const cam = (position: V3, target: V3, fov = 30) => ({ position: r3(position), target: r3(target), fov });
export const PRESET_CAMERAS: Record<string, ReturnType<typeof cam>> = {
  'strength-view': cam([-0.8, 0.25, 1.15], [-0.84, 0.07, 0.05]),
  'bend-view': cam([-0.35, 0.25, 1.14], [-0.35, 0.1, 0.05]),
  'tank-view': cam([0.27, 0.4, 1.29], [0.09, 0.12, -0.02]),
  'drops-view': cam([0.79, 0.35, 0.71], [0.5, 0.07, 0.08]),
  'light-view': cam([0.38, 0.32, 0.56], [0.84, 0.1, 0], 32),
  'corner-view': cam([-2.2, 1.15, 3.1], [-1.75, 0.5, -0.2]),
};

/* ============================================================= assemble */

const GROUPS: { id: string; color: string; card?: false }[] = [
  { id: 'strength-rig', color: 'token:ink-2' },
  { id: 'bend-rig', color: 'token:accent-2' },
  { id: 'float-tank', color: 'token:cold', card: false },
  { id: 'drop-tray', color: 'token:ink-3', card: false },
  { id: 'light-bench', color: 'token:en-light' },
  ...['wood', 'metal', 'ceramic', 'rubber', 'glass', 'plastic', 'fabric'].map((m) => ({ id: `corner-${m}`, color: 'token:loop', card: false as const })),
];
const groups = GROUPS.map((g) => ({ id: g.id, name: GROUP_TEXT[g.id]!, color: g.color, scale: { unit: 'cm', magnification: 1 }, ...(g.card === false ? { card: false } : {}) }));

const outParts = parts.map((p) => {
  const tx = PART_TEXT[p.id];
  if (!tx) throw new Error(`no text for part ${p.id}`);
  const { id, group, primitive, extra, ...rest } = p;
  if ((extra?.length ?? 0) > 32) throw new Error(`${id}: ${extra!.length} extra primitives (max 32)`);
  return { id, name: tx.name, ...(group ? { group } : {}), summary: tx.summary, detail: tx.detail, primitive, ...(extra?.length ? { extra } : {}), ...rest };
});
const missing = Object.keys(PART_TEXT).filter((id) => !parts.some((p) => p.id === id));
if (missing.length) throw new Error(`text for parts that are not built: ${missing.join(', ')}`);
outParts.sort((a, b) => Number(Boolean((a as { context?: boolean }).context)) - Number(Boolean((b as { context?: boolean }).context)));

const data = {
  parts: outParts,
  groups,
  views: {
    assembled: { camera: cam([-0.3, 1.9, 5.2], [-0.72, 0.3, -0.1]) },
    exploded: { camera: cam([-0.3, 2.05, 5.5], [-0.72, 0.35, -0.1]) },
    section: { plane: 'xy' },
    shadows: 'contact',
    cover: cam([0.8, 1.05, 2.7], [-0.12, 0.08, -0.02]),
  },
  units: { modelUnit: 'cm', scale: 100 },
  presets: Object.entries(PRESET_CAMERAS).map(([id, camera]) => ({ id, label: PRESET_TEXT[id]!, camera })),
  spec: SPEC_TEXT,
  telemetry: [
    { key: TELEMETRY_TEXT['masses-on'], unit: 'kg', follow: 'masses-on' },
    { key: TELEMETRY_TEXT['push-down'], unit: 'cm', follow: 'push-down' },
  ],
  poses,
  sim,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
const ctx = outParts.filter((p) => (p as { context?: boolean }).context).length;
console.log(`materials parts.json: ${outParts.length - ctx} parts + ${ctx} context, ${groups.length} groups, ${sim.bind.length} bindings`);
