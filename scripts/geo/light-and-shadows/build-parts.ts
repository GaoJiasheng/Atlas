/**
 * `pnpm tsx scripts/geo/light-and-shadows/build-parts.ts` — writes
 * src/content/topics/light-and-shadows/data/parts.json (docs/35 §3–§4, §9).
 *
 * Two places at life size (1 scene unit = 1 m): a light bench on a classroom
 * table (torch, holder, screen on one track; the dark box at the back corner)
 * and, 10 m away, a courtyard with a 1 m pole. The bench parts that slide are
 * drawn at zero offset (torch lens and screen face at the holder, x = 0) and
 * moved by the sim's `offset` bindings. The mirror's angle and the dark box's
 * light paths are worked out here; the three Sun paths use the same NOAA code
 * as the model (src/engines/space-scene/lib/sim/sun.ts). Texts: ./text.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sunPosition, sunVector } from '../../../src/engines/space-scene/lib/sim/sun';
import { GROUP_TEXT, PART_TEXT } from './text';

type V3 = [number, number, number];
type Prim = Record<string, unknown> & { kind: string; at: V3 };

const OUT = join(import.meta.dirname, '../../../src/content/topics/light-and-shadows/data/parts.json');

const n4 = (n: number) => {
  const v = Number(n.toFixed(4));
  return Object.is(v, -0) ? 0 : v;
};
const r3 = (v: readonly number[]): V3 => [n4(v[0]!), n4(v[1]!), n4(v[2]!)];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addv = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => mul(a, 1 / len(a));
const t = (en: string, zh: string) => ({ en, zh });

/* ------------------------------------------------------------ dimensions */

/** Table top, track top, the light's axis (docs/35 §3.2; axis raised to 30 cm for the 50 cm screen, §9.2). */
const TABLE = 0.75;
const TRACK_TOP = 0.77;
const AXIS_Y = 1.05;
const AXIS_Z = 0.05;
const AXIS: V3 = [0, AXIS_Y, AXIS_Z];
/** The screen (cm in the model, m here). */
const SCREEN_W = 0.6;
const SCREEN_H = 0.5;
/** Cardboard colours: card shapes and the cardboard sheet. */
const CARD = '#b39a78';
const BOARD = '#a68b68';

/** A carriage that rides on the track at x. */
const carriage = (x: number, w = 0.05, d = 0.075): Prim => ({ kind: 'bevelBox', size: [w, 0.026, d], bevel: 0.003, at: [x, TRACK_TOP + 0.003, AXIS_Z], color: 'powder', tint: '#4a4d50' });
/** The carriage's locking knob, on its front face. */
const knob = (x: number, d = 0.075): Prim => ({ kind: 'cylinder', size: [0.007, 0.007, 0.012], at: [x, TRACK_TOP + 0.004, AXIS_Z + d / 2 + 0.006], rotation: [90, 0, 0], color: 'rubber' });
/** A ball as a lathe (docs/33 §9.2: no `sphere`), centred at `at`. */
function ball(r: number, at: V3, color: string, tint?: string, segments = 48): Prim {
  const profile: [number, number][] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    profile.push([n4(Math.max(0, r * Math.cos(a))), n4(r * Math.sin(a))]);
  }
  profile[0] = [0, -r];
  profile[n] = [0, r];
  return { kind: 'lathe', profile, segments, at, color, ...(tint ? { tint } : {}) };
}

/* ------------------------------------------------------------ the bench */

/** Torch: lens centre at the holder (x = 0) at zero offset, body towards −x. Profile y runs towards −x (rotation z 90°). */
const torchBody: Prim = {
  kind: 'lathe',
  profile: [
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
  ],
  segments: 48,
  at: [0, AXIS_Y, AXIS_Z],
  rotation: [0, 0, 90],
  color: 'powder',
  tint: '#3e4246',
};
const torch = {
  id: 'torch',
  group: 'source',
  primitive: { kind: 'lathe', profile: [[0, -0.0007], [0.0172, -0.0007], [0.0172, 0.0007], [0, 0.0007]], segments: 48, at: [-0.0007, AXIS_Y, AXIS_Z], rotation: [0, 0, 90], color: 'glass' },
  extra: [
    torchBody,
    // Reflector ring behind the lens.
    { kind: 'lathe', profile: [[0.006, 0.0035], [0.0168, 0.0016], [0.0168, 0.0022], [0.006, 0.0041]], segments: 48, at: [0, AXIS_Y, AXIS_Z], rotation: [0, 0, 90], color: 'stainless' },
    // Switch on top of the body, and the grip rings.
    { kind: 'bevelBox', size: [0.014, 0.005, 0.009], bevel: 0.002, at: [-0.075, AXIS_Y + 0.0158, AXIS_Z], color: 'rubber' },
    { kind: 'lathe', profile: [[0.0149, -0.012], [0.0154, -0.012], [0.0154, 0.012], [0.0149, 0.012]], segments: 48, at: [-0.112, AXIS_Y, AXIS_Z], rotation: [0, 0, 90], color: 'rubber' },
  ],
  explode: { dir: [0, 1, 0], dist: 0.12 },
  connects: ['torch-stand', 'object-holder'],
};
const STAND_X = -0.085;
const torchStand = {
  id: 'torch-stand',
  group: 'source',
  primitive: { kind: 'cylinder', size: [0.005, 0.005, AXIS_Y - 0.0185 - (TRACK_TOP + 0.016)], at: [STAND_X, (AXIS_Y - 0.0185 + TRACK_TOP + 0.016) / 2, AXIS_Z], color: 'steel' },
  extra: [
    carriage(STAND_X, 0.06),
    knob(STAND_X),
    // Ring clamp round the body, and its boss on the rod.
    { kind: 'lathe', profile: [[0.0149, -0.007], [0.0185, -0.007], [0.0185, 0.007], [0.0149, 0.007]], segments: 48, at: [STAND_X, AXIS_Y, AXIS_Z], rotation: [0, 0, 90], color: 'steel' },
    { kind: 'bevelBox', size: [0.014, 0.012, 0.014], bevel: 0.002, at: [STAND_X, AXIS_Y - 0.021, AXIS_Z], color: 'steel' },
    { kind: 'cylinder', size: [0.004, 0.004, 0.012], at: [STAND_X, AXIS_Y - 0.021, AXIS_Z + 0.012], rotation: [90, 0, 0], color: 'rubber' },
  ],
  explode: { dir: [0, 1, 0], dist: 0.06 },
  connects: ['torch', 'track'],
};

const track = {
  id: 'track',
  group: 'source',
  primitive: { kind: 'bevelBox', size: [1.5, TRACK_TOP - TABLE, 0.05], bevel: 0.002, at: [0, (TRACK_TOP + TABLE) / 2, AXIS_Z], color: 'casing' },
  extra: [
    // 1 cm marks (151) and longer 10 cm marks (16) along the front edge; no numbers.
    { kind: 'fins', size: [0.007, 0.0006, 0.0007], count: 151, gap: 0.0093, axis: 'x', at: [0, TRACK_TOP + 0.0003, AXIS_Z + 0.0175], color: 'powder' },
    { kind: 'fins', size: [0.014, 0.0007, 0.001], count: 16, gap: 0.099, axis: 'x', at: [0, TRACK_TOP + 0.00035, AXIS_Z + 0.014], color: 'powder' },
    // End stops.
    { kind: 'bevelBox', size: [0.012, 0.03, 0.056], bevel: 0.002, at: [-0.756, TABLE + 0.015, AXIS_Z], color: 'powder', tint: '#4a4d50' },
    { kind: 'bevelBox', size: [0.012, 0.03, 0.056], bevel: 0.002, at: [0.756, TABLE + 0.015, AXIS_Z], color: 'powder', tint: '#4a4d50' },
  ],
  connects: ['torch-stand', 'object-holder', 'screen-stand'],
};

/** Holder: rod to a clip whose jaws grip the cards and sheets; the tin and ball rest on the jaws. */
const CLIP_TOP = 1.018;
const CLIP_H = 0.022;
const ROD_TOP = CLIP_TOP - CLIP_H + 0.002;
/** The clip stands just behind the card's plane (x 0.5–8.5 mm), so the card hides its top from the torch and the ray past the card's lower edge is not stopped by it (docs/35 §9.2). */
const CLIP_X = 0.0045;
const holder = {
  id: 'object-holder',
  group: 'objects',
  primitive: { kind: 'cylinder', size: [0.002, 0.002, ROD_TOP - (TRACK_TOP + 0.016)], at: [CLIP_X, (ROD_TOP + TRACK_TOP + 0.016) / 2, AXIS_Z], color: 'steel' },
  extra: [
    carriage(0),
    knob(0),
    { kind: 'bevelBox', size: [0.008, CLIP_H, 0.014], bevel: 0.0015, at: [CLIP_X, CLIP_TOP - CLIP_H / 2, AXIS_Z], color: 'powder', tint: '#2f3134' },
  ],
  explode: { dir: [0, -1, 0], dist: 0.03 },
  connects: ['track', 'torch', 'screen-board'],
};

const objectExplode = { dir: [0, 1, 0], dist: 0.16 };
const disc = (r: number): Prim => ({ kind: 'lathe', profile: [[0, -0.001], [r, -0.001], [r, 0.001], [0, 0.001]], segments: 96, at: AXIS, rotation: [0, 0, 90], color: 'plastic', tint: CARD });
const flatShape = (shape: [number, number][]): Prim => ({ kind: 'extrude', shape: shape.map(([y, z]) => [n4(y), n4(z)]), depth: 0.002, at: AXIS, rotation: [0, 90, 0], color: 'plastic', tint: CARD });
/** Triangle card: equilateral, 8 cm high, centred on its bounding box so its base stands in the clip (docs/35 §9.2). */
const TRI: [number, number][] = [
  [-0.046188, -0.04],
  [0.046188, -0.04],
  [0, 0.04],
];

const objects = [
  { id: 'card-circle', group: 'objects', primitive: disc(0.04), explode: objectExplode, connects: ['object-holder'] },
  { id: 'card-square', group: 'objects', primitive: flatShape([[-0.04, -0.04], [0.04, -0.04], [0.04, 0.04], [-0.04, 0.04]]), explode: objectExplode, connects: ['object-holder'] },
  { id: 'card-triangle', group: 'objects', primitive: flatShape(TRI), explode: objectExplode, connects: ['object-holder'] },
  { id: 'card-circle-big', group: 'objects', primitive: disc(0.06), explode: objectExplode, connects: ['object-holder'] },
  {
    id: 'tin',
    group: 'objects',
    // Axis along z (across the track), rolled rims at both ends.
    primitive: {
      kind: 'lathe',
      profile: [
        [0, -0.0595],
        [0.0316, -0.0595],
        [0.033, -0.06],
        [0.0328, -0.0565],
        [0.032, -0.055],
        [0.0324, -0.04],
        [0.032, -0.038],
        [0.0324, 0.038],
        [0.032, 0.04],
        [0.0324, 0.055],
        [0.032, 0.0565],
        [0.0328, 0.0565],
        [0.033, 0.06],
        [0.0316, 0.0595],
        [0, 0.0595],
      ],
      segments: 64,
      at: AXIS,
      rotation: [90, 0, 0],
      color: 'stainless',
    },
    explode: objectExplode,
    connects: ['object-holder'],
  },
  {
    id: 'cone',
    group: 'objects',
    // Base at −z, point at +z (docs/35 §3.4).
    primitive: { kind: 'lathe', profile: [[0, -0.0498], [0.0396, -0.0498], [0.04, -0.05], [0, 0.05]], segments: 64, at: AXIS, rotation: [90, 0, 0], color: 'plastic', tint: '#e8e2d4' },
    explode: objectExplode,
    connects: ['object-holder'],
  },
  { id: 'ball', group: 'objects', primitive: ball(0.0325, AXIS, 'fabric', '#c9cf8e'), explode: objectExplode, connects: ['object-holder'] },
];

const sheetExplode = { dir: [0, 1, 0], dist: 0.16 };
const sheets = [
  { id: 'clear-glass', group: 'sheets', primitive: { kind: 'bevelBox', size: [0.004, 0.1, 0.1], bevel: 0.0008, at: AXIS, color: 'glass' }, explode: sheetExplode, connects: ['object-holder'] },
  { id: 'frosted-glass', group: 'sheets', primitive: { kind: 'bevelBox', size: [0.004, 0.1, 0.1], bevel: 0.0008, at: AXIS, color: 'enamel', tint: '#e4e6e3' }, shell: true, explode: sheetExplode, connects: ['object-holder'] },
  {
    id: 'tracing-paper',
    group: 'sheets',
    primitive: { kind: 'plane', size: [0.1, 0.1], at: AXIS, rotation: [0, 90, 0], color: 'membrane', tint: '#f1ebdc' },
    explode: sheetExplode,
    connects: ['object-holder'],
  },
  { id: 'cardboard-sheet', group: 'sheets', primitive: { kind: 'bevelBox', size: [0.003, 0.1, 0.1], bevel: 0.0006, at: AXIS, color: 'plastic', tint: BOARD }, explode: sheetExplode, connects: ['object-holder'] },
];

/** Screen: its face towards the torch at x = 0 at zero offset (the receiver's face). */
const SCREEN_T = 0.005;
const FRAME = 0.012;
const screenBoard = {
  id: 'screen-board',
  group: 'screen',
  primitive: { kind: 'bevelBox', size: [SCREEN_T, SCREEN_H, SCREEN_W], bevel: 0.0015, at: [SCREEN_T / 2, AXIS_Y, AXIS_Z], color: 'enamel', tint: '#f3f0e8' },
  explode: { dir: [1, 0, 0], dist: 0.1 },
  connects: ['screen-stand', 'light-sensor', 'object-holder'],
};
const frameX = 0.004;
const frameBottom = AXIS_Y - SCREEN_H / 2 - FRAME / 2;
const screenStand = {
  id: 'screen-stand',
  group: 'screen',
  primitive: { kind: 'bevelBox', size: [0.016, FRAME, SCREEN_W + 2 * FRAME], bevel: 0.002, at: [frameX, frameBottom, AXIS_Z], color: 'powder', tint: '#4a4d50' },
  extra: [
    { kind: 'bevelBox', size: [0.016, FRAME, SCREEN_W + 2 * FRAME], bevel: 0.002, at: [frameX, AXIS_Y + SCREEN_H / 2 + FRAME / 2, AXIS_Z], color: 'powder', tint: '#4a4d50' },
    { kind: 'bevelBox', size: [0.016, SCREEN_H, FRAME], bevel: 0.002, at: [frameX, AXIS_Y, AXIS_Z - SCREEN_W / 2 - FRAME / 2], color: 'powder', tint: '#4a4d50' },
    { kind: 'bevelBox', size: [0.016, SCREEN_H, FRAME], bevel: 0.002, at: [frameX, AXIS_Y, AXIS_Z + SCREEN_W / 2 + FRAME / 2], color: 'powder', tint: '#4a4d50' },
    carriage(frameX + 0.012, 0.07, 0.08),
    knob(frameX + 0.012, 0.08),
    // Shelf for the datalogger, behind the screen.
    { kind: 'bevelBox', size: [0.11, 0.006, 0.12], bevel: 0.0015, at: [0.085, TRACK_TOP + 0.019, AXIS_Z + 0.07], color: 'powder', tint: '#4a4d50' },
  ],
  explode: { dir: [1, 0, 0], dist: 0.06 },
  connects: ['screen-board', 'track', 'datalogger'],
};
const SENSOR: V3 = [0.016, AXIS_Y, AXIS_Z];
const LOGGER: V3 = [0.085, TRACK_TOP + 0.034, AXIS_Z + 0.075];
const lightSensor = {
  id: 'light-sensor',
  group: 'screen',
  primitive: { kind: 'cylinder', size: [0.008, 0.008, 0.022], at: SENSOR, rotation: [0, 0, 90], color: 'rubber' },
  extra: [
    // Window, flush with the screen's face through a hole in the board.
    { kind: 'cylinder', size: [0.0045, 0.0045, 0.006], at: [0.0025, AXIS_Y, AXIS_Z], rotation: [0, 0, 90], color: 'glass' },
    // Cable down the back of the screen to the datalogger.
    {
      kind: 'tube',
      path: [
        [0.027, 0, 0],
        [0.036, 0, 0],
        [0.036, -0.215, 0],
        [0.04, -0.236, 0.035],
        [LOGGER[0] - 0.035, LOGGER[1] - AXIS_Y, LOGGER[2] - AXIS_Z],
      ].map((p) => r3(p)),
      radius: 0.0018,
      bendRadius: 0.02,
      at: [0, AXIS_Y, AXIS_Z],
      color: 'rubber',
    },
  ],
  explode: { dir: [1, 0.3, 0], dist: 0.12 },
  connects: ['screen-board', 'datalogger'],
};
const datalogger = {
  id: 'datalogger',
  group: 'screen',
  primitive: { kind: 'bevelBox', size: [0.07, 0.024, 0.09], bevel: 0.004, at: LOGGER, color: 'plastic', tint: '#55585b' },
  extra: [
    { kind: 'bevelBox', size: [0.038, 0.002, 0.05], bevel: 0.0008, at: [LOGGER[0] - 0.006, LOGGER[1] + 0.012, LOGGER[2]], color: 'glass', tint: '#1c2326' },
    { kind: 'bevelBox', size: [0.012, 0.003, 0.012], bevel: 0.001, at: [LOGGER[0] + 0.022, LOGGER[1] + 0.012, LOGGER[2] - 0.02], color: 'rubber' },
    { kind: 'bevelBox', size: [0.012, 0.003, 0.012], bevel: 0.001, at: [LOGGER[0] + 0.022, LOGGER[1] + 0.012, LOGGER[2] + 0.02], color: 'rubber' },
  ],
  explode: { dir: [1, 0, 0.4], dist: 0.14 },
  connects: ['light-sensor'],
};

/** Cards with holes: 10 cm square, hole 1.2 cm, at −10 / 0 / +10 cm; the middle one in the holder's clip. */
function holeCard(id: string, x: number, stand: boolean) {
  const extra: Prim[] = stand
    ? [
        carriage(x, 0.04, 0.06),
        { kind: 'cylinder', size: [0.002, 0.002, AXIS_Y - 0.05 - (TRACK_TOP + 0.016)], at: [x, (AXIS_Y - 0.05 + TRACK_TOP + 0.016) / 2, AXIS_Z], color: 'steel' },
        { kind: 'bevelBox', size: [0.008, 0.014, 0.014], bevel: 0.0015, at: [x, AXIS_Y - 0.05, AXIS_Z], color: 'powder', tint: '#2f3134' },
      ]
    : [];
  return {
    id,
    group: 'hole-cards',
    primitive: { kind: 'panelHole', size: [0.1, 0.1, 0.002], hole: { r: 0.006, at: [0, 0] }, at: [x, AXIS_Y, AXIS_Z], rotation: [0, 90, 0], color: 'plastic', tint: CARD },
    ...(extra.length ? { extra } : {}),
    explode: { dir: [0, 1, 0], dist: 0.14 },
    connects: id === 'hole-card-2' ? ['object-holder', 'hole-card-1', 'hole-card-3'] : ['hole-card-2'],
  };
}

/* ------------------------------------------------------------ the dark box */

/** Box 30 × 18 × 20 cm (x × y × z) behind the track, viewing hole in the front (+z), torch through the left side (docs/35 §3.2). */
const BOX_C: V3 = [-0.45, TABLE + 0.09, -0.18];
const BOX: V3 = [0.3, 0.18, 0.2];
const W = 0.004;
const HOLE: V3 = [-0.45, 0.86, BOX_C[2] + BOX[2] / 2];
const BOX_LENS: V3 = [-0.585, 0.86, -0.18];
const BALL_C: V3 = [-0.42, TABLE + W + 0.0325, -0.2];
const MIRROR_C: V3 = [-0.36, 0.86, -0.18];
const KRAFT = '#a9875c';
const boxWall = (size: V3, at: V3): Prim => ({ kind: 'bevelBox', size, bevel: 0.0012, at: r3(at), color: 'plastic', tint: KRAFT });
const liner = (size: V3, at: V3): Prim => ({ kind: 'box', size, at: r3(at), color: 'powder', tint: '#151515' });
const box = {
  id: 'box',
  group: 'dark-box',
  primitive: { kind: 'panelHole', size: [BOX[0], BOX[1], W], hole: { r: 0.005, at: [0, n4(HOLE[1] - BOX_C[1])] }, at: r3([BOX_C[0], BOX_C[1], BOX_C[2] + BOX[2] / 2 - W / 2]), color: 'plastic', tint: KRAFT },
  extra: [
    boxWall([BOX[0], BOX[1], W], [BOX_C[0], BOX_C[1], BOX_C[2] - BOX[2] / 2 + W / 2]),
    boxWall([BOX[0], W, BOX[2]], [BOX_C[0], TABLE + W / 2, BOX_C[2]]),
    boxWall([W, BOX[1], BOX[2]], [BOX_C[0] + BOX[0] / 2 - W / 2, BOX_C[1], BOX_C[2]]),
    { kind: 'panelHole', size: [BOX[2], BOX[1], W], hole: { r: 0.0125, at: [0, n4(BOX_LENS[1] - BOX_C[1])] }, at: r3([BOX_C[0] - BOX[0] / 2 + W / 2, BOX_C[1], BOX_C[2]]), rotation: [0, 90, 0], color: 'plastic', tint: KRAFT },
    // The lid, a little larger, with a shallow rim.
    boxWall([BOX[0] + 0.01, 0.006, BOX[2] + 0.01], [BOX_C[0], TABLE + BOX[1] + 0.003, BOX_C[2]]),
    boxWall([BOX[0] + 0.01, 0.02, 0.003], [BOX_C[0], TABLE + BOX[1] - 0.007, BOX_C[2] + BOX[2] / 2 + 0.0035]),
    // Black inside.
    liner([BOX[0] - 2 * W, BOX[1] - 2 * W, 0.001], [BOX_C[0], BOX_C[1], BOX_C[2] - BOX[2] / 2 + W + 0.0005]),
    liner([BOX[0] - 2 * W, 0.001, BOX[2] - 2 * W], [BOX_C[0], TABLE + W + 0.0005, BOX_C[2]]),
    liner([BOX[0] - 2 * W, 0.001, BOX[2] - 2 * W], [BOX_C[0], TABLE + BOX[1] - 0.0005, BOX_C[2]]),
    liner([0.001, BOX[1] - 2 * W, BOX[2] - 2 * W], [BOX_C[0] + BOX[0] / 2 - W - 0.0005, BOX_C[1], BOX_C[2]]),
  ],
  shell: true,
  explode: { dir: [0, 1, 0], dist: 0.18 },
  connects: ['box-torch', 'box-ball', 'box-mirror'],
};
const boxTorch = {
  id: 'box-torch',
  group: 'dark-box',
  primitive: { kind: 'lathe', profile: [[0, -0.0006], [0.0095, -0.0006], [0.0095, 0.0006], [0, 0.0006]], segments: 48, at: r3([BOX_LENS[0] - 0.0006, BOX_LENS[1], BOX_LENS[2]]), rotation: [0, 0, 90], color: 'glass' },
  extra: [
    {
      kind: 'lathe',
      profile: [[0, 0.003], [0.0095, 0.003], [0.0095, 0.0004], [0.0122, 0.0004], [0.0124, 0.022], [0.0108, 0.03], [0.0108, 0.1], [0.0085, 0.104], [0, 0.104]],
      segments: 48,
      at: BOX_LENS,
      rotation: [0, 0, 90],
      color: 'powder',
      tint: '#3e4246',
    },
    { kind: 'bevelBox', size: [0.012, 0.004, 0.007], bevel: 0.0015, at: r3([BOX_LENS[0] - 0.07, BOX_LENS[1] + 0.011, BOX_LENS[2]]), color: 'rubber' },
  ],
  explode: { dir: [-1, 0, 0], dist: 0.1 },
  connects: ['box', 'box-ball', 'box-mirror'],
};
/** Drawn darkness filling the box while no light is inside (docs/35 D13, §9.2 review note ④): smoked glass over the ball. */
const boxInside = {
  id: 'box-inside',
  group: 'dark-box',
  primitive: { kind: 'box', size: [BOX[0] - 2 * W - 0.004, BOX[1] - 2 * W - 0.004, BOX[2] - 2 * W - 0.004], at: r3([BOX_C[0], BOX_C[1], BOX_C[2]]), color: 'membrane', tint: '#050505' },
  connects: ['box'],
};
const boxBall = { id: 'box-ball', group: 'dark-box', primitive: ball(0.0325, BALL_C, 'fabric', '#c9cf8e'), explode: { dir: [0, 1, 0], dist: 0.12 }, connects: ['box-torch', 'box'] };

/** Mirror normal: halfway between the reversed incoming light (from the torch) and the way out to the hole. */
const lightIn = norm(sub(MIRROR_C, BOX_LENS));
const lightOut = norm(sub(HOLE, MIRROR_C));
const mirrorNormal = norm(sub(lightOut, lightIn));
const mirrorYaw = (Math.atan2(mirrorNormal[0], mirrorNormal[2]) * 180) / Math.PI;
const boxMirror = {
  id: 'box-mirror',
  group: 'dark-box',
  primitive: { kind: 'bevelBox', size: [0.06, 0.06, 0.003], bevel: 0.001, at: MIRROR_C, rotation: [0, n4(mirrorYaw), 0], color: 'stainless', tint: '#e6e9ea' },
  extra: [
    { kind: 'cylinder', size: [0.003, 0.003, MIRROR_C[1] - 0.03 - TABLE - W], at: r3([MIRROR_C[0], (MIRROR_C[1] - 0.03 + TABLE + W) / 2, MIRROR_C[2]]), color: 'steel' },
    { kind: 'cylinder', size: [0.014, 0.016, 0.006], at: r3([MIRROR_C[0], TABLE + W + 0.003, MIRROR_C[2]]), color: 'powder', tint: '#2f3134' },
  ],
  explode: { dir: [0, 1, 0], dist: 0.12 },
  connects: ['box-torch', 'box'],
};

/** The dark box's light paths (static flows): straight lines, continued in the same direction out of the hole. */
const ballLight = norm(sub(BALL_C, BOX_LENS));
const ballHit = addv(BOX_LENS, mul(ballLight, len(sub(BALL_C, BOX_LENS)) - 0.0325));
const ballToHole = norm(sub(HOLE, BALL_C));
const ballOut = addv(BALL_C, mul(ballToHole, 0.0325));
/** The ray continued 16 cm beyond the hole, towards the reader. */
const outside = (dir: V3) => addv(HOLE, mul(dir, 0.16));
const scatter = (dir: V3): V3 => {
  const d = norm(dir);
  return addv(BALL_C, mul(d, 0.0325 + 0.055));
};
const scatterFrom = (dir: V3): V3 => addv(BALL_C, mul(norm(dir), 0.0325));
const flows = [
  {
    id: 'box-ball-light',
    group: 'dark-box',
    paths: [
      { id: 'in', path: [r3(BOX_LENS), r3(ballHit)] },
      { id: 'out', path: [r3(ballOut), r3(HOLE), r3(outside(ballToHole))] },
      { id: 'side-1', path: [r3(scatterFrom([0, 1, 0.1])), r3(scatter([0, 1, 0.1]))] },
      { id: 'side-2', path: [r3(scatterFrom([-0.3, 0.6, -0.8])), r3(scatter([-0.3, 0.6, -0.8]))] },
      { id: 'side-3', path: [r3(scatterFrom([1, 0.5, 0])), r3(scatter([1, 0.5, 0]))] },
    ],
    speed: 0.1,
    color: 'token:en-light',
    count: 160,
    size: 0.22,
    spread: 0,
    clip: false,
    whenRun: true,
  },
  {
    id: 'box-mirror-light',
    group: 'dark-box',
    paths: [
      { id: 'in', path: [r3(BOX_LENS), r3(addv(MIRROR_C, mul(lightIn, -0.002)))] },
      { id: 'out', path: [r3(MIRROR_C), r3(HOLE), r3(outside(lightOut))] },
    ],
    speed: 0.1,
    color: 'token:en-light',
    count: 120,
    size: 0.26,
    spread: 0,
    clip: false,
    whenRun: true,
  },
];

/* ------------------------------------------------------------ the courtyard */

const YARD: V3 = [10, 0.05, 0];
const SUN_R = 5.5;
const pole = {
  id: 'pole',
  group: 'outdoors',
  primitive: { kind: 'cylinder', size: [0.025, 0.025, 1.0], at: [YARD[0], YARD[1] + 0.5, YARD[2]], color: 'wood' },
  extra: [
    { kind: 'lathe', profile: [[0, 0], [0.1, 0], [0.1, 0.03], [0.07, 0.04], [0.02, 0.04], [0, 0.04]], segments: 48, at: YARD, color: 'powder', tint: '#4a4d50' },
    { kind: 'lathe', profile: [[0, 0], [0.0265, 0], [0.0265, 0.006], [0, 0.008]], segments: 32, at: [YARD[0], YARD[1] + 0.992, YARD[2]], color: 'powder', tint: '#4a4d50' },
  ],
  connects: ['courtyard', 'north-arrow'],
};
const northArrow = {
  id: 'north-arrow',
  group: 'outdoors',
  // Flat on the ground (shape y → −z, north), 0.6 m long.
  primitive: {
    kind: 'extrude',
    shape: [
      [-0.03, -0.3],
      [0.03, -0.3],
      [0.03, 0.12],
      [0.09, 0.12],
      [0, 0.3],
      [-0.09, 0.12],
      [-0.03, 0.12],
    ],
    depth: 0.002,
    at: [YARD[0], YARD[1] + 0.001, -4.6],
    rotation: [-90, 0, 0],
    color: 'powder', tint: '#2b2d2f',
  },
  extra: [{ kind: 'lathe', profile: [[0, 0], [0.12, 0], [0.12, 0.002], [0, 0.002]], segments: 48, at: [YARD[0], YARD[1], -4.2], color: 'powder', tint: '#2b2d2f' }],
  connects: ['pole'],
};
const sun = {
  id: 'sun',
  group: 'outdoors',
  primitive: ball(0.25, [YARD[0], YARD[1] + SUN_R, YARD[2]], 'token:en-light', undefined, 32),
  connects: ['pole'],
};
function sunPath(id: string, iso: string) {
  const pts: V3[] = [];
  for (let h = 6.5; h <= 19.5 + 1e-9; h += 0.25) {
    const { height, bearing } = sunPosition(iso, h, 1.3, 103.8, 8);
    if (height < 0.5) continue;
    const v = sunVector(height, bearing, [0, 0, -1]);
    pts.push(r3([v.x * SUN_R, v.y * SUN_R, v.z * SUN_R]));
  }
  return { id, group: 'outdoors', primitive: { kind: 'sweep', path: pts, radius: 0.012, at: YARD, color: 'token:en-light' }, connects: ['sun'] };
}
const courtyard = {
  id: 'courtyard',
  group: 'outdoors',
  primitive: { kind: 'lathe', profile: [[0, -0.025], [5.5, -0.025], [5.5, 0.025], [0, 0.025]], segments: 96, at: [YARD[0], 0.025, YARD[2]], color: 'plastic', tint: '#8f8b82' },
  connects: ['pole'],
};

const benchTable = {
  id: 'bench-table',
  group: 'source',
  context: true,
  primitive: { kind: 'bevelBox', size: [1.8, 0.03, 0.6], bevel: 0.004, at: [0, TABLE - 0.015, 0], color: 'wood' },
  extra: [
    ...[[-0.86, -0.26], [-0.86, 0.26], [0.86, -0.26], [0.86, 0.26]].map(([x, z]) => ({ kind: 'bevelBox', size: [0.04, TABLE - 0.03, 0.04], bevel: 0.003, at: [x, (TABLE - 0.03) / 2, z], color: 'powder', tint: '#5a5d60' })),
    { kind: 'bevelBox', size: [1.68, 0.06, 0.02], bevel: 0.002, at: [0, TABLE - 0.06, 0.27], color: 'powder', tint: '#5a5d60' },
    { kind: 'bevelBox', size: [1.68, 0.06, 0.02], bevel: 0.002, at: [0, TABLE - 0.06, -0.27], color: 'powder', tint: '#5a5d60' },
  ],
};

/* ------------------------------------------------------------ assemble */

const PARTS = [
  torch,
  torchStand,
  track,
  holder,
  ...objects,
  ...sheets,
  screenBoard,
  screenStand,
  lightSensor,
  datalogger,
  holeCard('hole-card-1', -0.1, true),
  holeCard('hole-card-2', 0, false),
  holeCard('hole-card-3', 0.1, true),
  box,
  boxTorch,
  boxBall,
  boxMirror,
  boxInside,
  pole,
  northArrow,
  sun,
  sunPath('sun-path-oct', '2026-10-20'),
  sunPath('sun-path-jun', '2026-06-21'),
  sunPath('sun-path-mar', '2026-03-24'),
  courtyard,
  benchTable,
].map((p) => {
  const text = PART_TEXT[p.id];
  if (!text) throw new Error(`no text for ${p.id}`);
  const { id, ...rest } = p as { id: string } & Record<string, unknown>;
  return { id, name: text.name, ...('group' in rest ? { group: rest.group } : {}), summary: text.summary, detail: text.detail, castShadow: false, ...Object.fromEntries(Object.entries(rest).filter(([k]) => k !== 'group')) };
});

const groups = [
  { id: 'source', color: 'token:ink-2' },
  { id: 'objects', color: 'token:ink-3' },
  { id: 'sheets', color: 'token:neutral', card: false },
  { id: 'screen', color: 'token:cold' },
  { id: 'hole-cards', color: 'token:accent-2', card: false },
  { id: 'dark-box', color: 'token:cut' },
  { id: 'outdoors', color: 'token:loop', card: false },
  { id: 'rays', color: 'token:en-light' },
].map((g) => ({ id: g.id, name: GROUP_TEXT[g.id], color: g.color, ...(g.card === false ? { card: false } : {}) }));

/* ------------------------------------------------------------ the model */

const OBJECTS: Record<string, { label: [string, string]; shape: Record<string, unknown>; names: [string, string, string] }> = {
  'card-circle': { label: ['Round card', '圆形卡片'], shape: { kind: 'disc', d: 8, thick: 0.2 }, names: ['circle', 'oval', 'thin-strip'] },
  'card-square': { label: ['Square card', '正方形卡片'], shape: { kind: 'polygon', points: [[-4, -4], [4, -4], [4, 4], [-4, 4]], thick: 0.2 }, names: ['square', 'four-sided', 'thin-strip'] },
  'card-triangle': { label: ['Triangle card', '三角形卡片'], shape: { kind: 'polygon', points: TRI.map(([y, z]) => [n4(y * 100), n4(z * 100)]), thick: 0.2 }, names: ['triangle', 'triangle', 'thin-strip'] },
  'card-circle-big': { label: ['Big round card', '大圆卡片'], shape: { kind: 'disc', d: 12, thick: 0.2 }, names: ['circle', 'oval', 'thin-strip'] },
  tin: { label: ['Tin', '罐子'], shape: { kind: 'cylinder', d: 6.6, length: 12, axis: 'z' }, names: ['rectangle', 'round-ends', 'circle'] },
  cone: { label: ['Paper cone', '纸圆锥'], shape: { kind: 'cone', d: 8, length: 10, axis: 'z', apex: '+' }, names: ['triangle', 'round-end', 'circle'] },
  ball: { label: ['Ball', '球'], shape: { kind: 'sphere', d: 6.5 }, names: ['circle', 'circle', 'circle'] },
};
const MATERIALS: Record<string, { label: [string, string]; part: string; straight: number; scattered: number }> = {
  'clear-glass': { label: ['Clear glass', '透明玻璃'], part: 'clear-glass', straight: 0.91, scattered: 0 },
  'frosted-glass': { label: ['Frosted glass', '磨砂玻璃'], part: 'frosted-glass', straight: 0, scattered: 0.83 },
  'tracing-paper': { label: ['Tracing paper', '描图纸'], part: 'tracing-paper', straight: 0, scattered: 0.65 },
  cardboard: { label: ['Cardboard', '硬纸板'], part: 'cardboard-sheet', straight: 0, scattered: 0 },
};
const SHAPES: Record<string, [string, string]> = {
  none: ['No shadow', '没有影子'],
  circle: ['Circle', '圆形'],
  oval: ['Oval', '椭圆形'],
  square: ['Square', '正方形'],
  'four-sided': ['Narrower four-sided shape', '变窄的四边形'],
  triangle: ['Triangle', '三角形'],
  'thin-strip': ['Thin strip', '细条'],
  rectangle: ['Rectangle', '长方形'],
  'round-ends': ['Rounded at both ends', '两头圆的形状'],
  'round-end': ['Rounded at one end', '一头圆的形状'],
};
const POINTS: Record<string, [string, string]> = {
  north: ['North', '北'],
  'north-east': ['North-east', '东北'],
  east: ['East', '东'],
  'south-east': ['South-east', '东南'],
  south: ['South', '南'],
  'south-west': ['South-west', '西南'],
  west: ['West', '西'],
  'north-west': ['North-west', '西北'],
};
const L = ([en, zh]: [string, string]) => t(en, zh);
const states = (m: Record<string, [string, string]>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, L(v)]));

const sim = {
  kind: 'light',
  controls: [
    { id: 'd-torch', kind: 'step', values: [15, 20, 30, 40, 60], default: 20, unit: 'cm', label: t('Torch to object', '手电筒到物体') },
    { id: 'd-screen', kind: 'step', values: [10, 20, 30, 40], default: 30, unit: 'cm', label: t('Object to screen', '物体到屏幕') },
    {
      id: 'object',
      kind: 'choice',
      default: 'card-circle',
      label: t('Object', '物体'),
      options: [{ id: 'none', label: t('Nothing', '不放') }, ...Object.entries(OBJECTS).map(([id, o]) => ({ id, label: L(o.label) }))],
      sets: Object.fromEntries(Object.keys(OBJECTS).map((id) => [id, { material: 'none' }])),
    },
    { id: 'turn', kind: 'step', values: [0, 45, 90], default: 0, unit: '°', label: t('Turned', '转过的角度') },
    {
      id: 'material',
      kind: 'choice',
      default: 'none',
      label: t('Sheet in the holder', '支架上的材料片'),
      options: [{ id: 'none', label: t('No sheet', '不放') }, ...Object.entries(MATERIALS).map(([id, m]) => ({ id, label: L(m.label) }))],
      sets: Object.fromEntries(Object.keys(MATERIALS).map((id) => [id, { object: 'none' }])),
    },
    { id: 'middle', kind: 'choice', default: 'in-line', label: t('Middle card', '中间那张卡片'), options: [{ id: 'in-line', label: t('In a line', '排成一直线') }, { id: 'moved', label: t('Moved 2 cm', '挪开 2 厘米') }] },
    { id: 'torch-on', kind: 'toggle', default: true, label: t('Torch on', '打开手电筒') },
    { id: 'box-torch', kind: 'toggle', default: true, label: t('Torch in the box on', '打开箱里的手电筒') },
    { id: 'in-box', kind: 'choice', default: 'ball', label: t('In the box', '箱里放'), options: [{ id: 'ball', label: t('Ball', '球') }, { id: 'mirror', label: t('Mirror', '镜子') }] },
    { id: 'time', kind: 'step', values: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], default: 10, unit: 'h', format: 'time', label: t('Time of day', '时间') },
    {
      id: 'date',
      kind: 'choice',
      default: 'oct-20',
      label: t('Date', '日期'),
      options: [
        { id: 'oct-20', label: t('20 Oct 2026', '2026 年 10 月 20 日') },
        { id: 'jun-21', label: t('21 Jun 2026', '2026 年 6 月 21 日') },
        { id: 'mar-24', label: t('24 Mar 2026', '2026 年 3 月 24 日') },
      ],
    },
  ],
  outputs: [
    { id: 'shadow-height', from: 'shadow:height', unit: 'cm', decimals: 0, label: t('Shadow height', '影子的高') },
    { id: 'shadow-width', from: 'shadow:width', unit: 'cm', decimals: 0, label: t('Shadow width', '影子的宽') },
    { id: 'shadow-shape', kind: 'state', from: 'shadow:shape', label: t('Shadow shape', '影子的形状'), states: states(SHAPES) },
    { id: 'gap-torch', from: 'control:d-torch', unit: 'cm', decimals: 0, label: t('Torch to object', '手电筒到物体') },
    { id: 'gap-screen', from: 'control:d-screen', unit: 'cm', decimals: 0, label: t('Object to screen', '物体到屏幕') },
    { id: 'light-behind', from: 'sheet:light', unit: '%', decimals: 0, label: t('Light on the screen', '照到屏幕的光') },
    {
      id: 'shadow-kind',
      kind: 'state',
      from: 'sheet:kind',
      label: t('Shadow', '影子'),
      states: { none: t('No sheet', '没有材料片'), hardly: t('Hardly any shadow', '几乎没有影子'), lighter: t('A lighter shadow', '较淡的影子'), dark: t('A dark shadow', '很深的影子') },
    },
    { id: 'sheet-dark', from: 'sheet:dark', label: t('Shadow darkness', '影子的深浅') },
    { id: 'dot', kind: 'state', from: 'holes:dot', label: t('Bright dot on the screen', '屏幕上的亮点'), states: { yes: t('A bright dot', '有亮点'), no: t('No dot', '没有亮点') } },
    {
      id: 'eye',
      kind: 'state',
      from: 'seeing:eye',
      label: t('Light out of the hole', '从小孔出来的光'),
      states: { none: t('None: nothing to see', '没有：什么也看不见'), some: t('Some: you see the ball', '有一些：看见球'), bright: t('Bright: a bright patch', '明亮：一片亮光') },
    },
    { id: 'box-dark', from: 'seeing:dark', label: t('Dark inside the box', '箱里黑暗') },
    { id: 'torch-lit', from: 'control:torch-on', label: t('Torch lit', '手电筒亮着') },
    { id: 'box-lit', from: 'control:box-torch', label: t('Box torch lit', '箱里的手电筒亮着') },
    { id: 'sun-height', from: 'sun:height', unit: '°', decimals: 0, label: t('Sun’s height', '太阳高度') },
    { id: 'shadow-length', from: 'sun:length', unit: 'm', decimals: 2, label: t('Shadow length', '影长') },
    { id: 'shadow-points', kind: 'state', from: 'sun:points', label: t('Shadow points', '影子指向'), states: states(POINTS) },
    { id: 'noon', from: 'sun:noon', unit: 'h', format: 'time', label: t('Sun highest at', '太阳最高的时刻') },
    { id: 'noon-length', from: 'sun:noon-length', unit: 'm', decimals: 2, label: t('Shortest shadow', '最短的影子') },
    { id: 'time-now', from: 'control:time', unit: 'h', format: 'time', label: t('Time', '时间') },
    { id: 'sun-at', kind: 'vector', from: 'sun:at', label: t('Sun direction', '太阳方向') },
  ],
  bind: [
    { control: 'd-torch', part: ['torch', 'torch-stand'], offset: { axis: [-1, 0, 0], per: 0.01, origin: 0 } },
    { control: 'd-screen', part: ['screen-board', 'screen-stand', 'light-sensor', 'datalogger'], offset: { axis: [1, 0, 0], per: 0.01, origin: 0 } },
    ...Object.keys(OBJECTS).map((id) => ({ control: 'object', part: id, visible: { eq: id } })),
    { control: 'turn', part: Object.keys(OBJECTS), rotate: { axis: [0, 1, 0], per: 1, pivot: AXIS } },
    ...Object.entries(MATERIALS).map(([id, m]) => ({ control: 'material', part: m.part, visible: { eq: id } })),
    { control: 'middle', part: 'hole-card-2', pose: { moved: 'hole-moved' } },
    { output: 'torch-lit', part: 'torch', glow: { color: 'token:lamp', full: 1, curve: 'linear' } },
    { output: 'box-lit', part: 'box-torch', glow: { color: 'token:lamp', full: 1, curve: 'linear' } },
    { control: 'in-box', part: 'box-ball', visible: { eq: 'ball' } },
    { control: 'in-box', part: 'box-mirror', visible: { eq: 'mirror' } },
    // Dark inside the box: a near-black tint that reads dark in both themes (docs/35 §9.2, review note ③).
    { output: 'box-dark', part: 'box-ball', tint: { color: '#0d0d0c', full: 1 } },
    { output: 'box-dark', part: 'box-inside', visible: true },
    { output: 'eye', flow: 'box-ball-light', visible: { eq: 'some' } },
    { output: 'eye', flow: 'box-mirror-light', visible: { eq: 'bright' } },
    { output: 'sun-at', part: 'sun', place: { centre: YARD, radius: SUN_R } },
    { control: 'date', part: 'sun-path-oct', visible: { eq: 'oct-20' } },
    { control: 'date', part: 'sun-path-jun', visible: { eq: 'jun-21' } },
    { control: 'date', part: 'sun-path-mar', visible: { eq: 'mar-24' } },
  ],
  overlays: [
    {
      kind: 'shadow-cast',
      source: { part: 'torch', point: AXIS, axis: [1, 0, 0], beam: 40, when: { control: 'torch-on' } },
      receiver: { part: 'screen-board', normal: [-1, 0, 0], size: [SCREEN_W, SCREEN_H] },
      casters: [
        { part: 'object-holder' },
        ...Object.keys(OBJECTS).map((part) => ({ part })),
        ...Object.values(MATERIALS).map((m) => ({ part: m.part, dark: { output: 'sheet-dark' } })),
        { part: 'hole-card-1' },
        { part: 'hole-card-2' },
        { part: 'hole-card-3' },
      ],
      spot: { color: 'token:en-light' },
      rays: { group: 'rays', edges: 'vertical', through: 'dark', extra: [[0, 0]] },
    },
    {
      kind: 'shadow-cast',
      source: { direction: { output: 'sun-at' } },
      receiver: { part: 'courtyard', normal: [0, 1, 0], radius: 5.5 },
      casters: [{ part: 'pole' }],
      trail: { control: 'time' },
      rays: { group: 'rays', edges: 'tip', parallel: [-0.4, 0.4] },
    },
  ],
  light: {
    bench: {
      source: { part: 'torch', point: AXIS, axis: [1, 0, 0], beam: 40 },
      power: 'torch-on',
      gaps: { torch: 'd-torch', screen: 'd-screen' },
      holder: AXIS,
      screen: { part: 'screen-board', size: [SCREEN_W * 100, SCREEN_H * 100] },
      object: 'object',
      turn: 'turn',
      objects: Object.fromEntries(Object.entries(OBJECTS).map(([id, o]) => [id, { part: id, shape: o.shape, names: { '0': o.names[0], '45': o.names[1], '90': o.names[2] } }])),
    },
    sheets: {
      control: 'material',
      size: [10, 10],
      kinds: { hardly: 85, dark: 5 },
      materials: Object.fromEntries(Object.entries(MATERIALS).map(([id, m]) => [id, { part: m.part, straight: m.straight, scattered: m.scattered }])),
    },
    holes: { control: 'middle', hole: 1.2, cards: [{ part: 'hole-card-1', at: -10 }, { part: 'hole-card-2', at: 0, moved: 2 }, { part: 'hole-card-3', at: 10 }] },
    seeing: { torch: 'box-torch', target: 'in-box', reflects: { ball: 'some', mirror: 'bright' } },
    sun: { lat: 1.3, lon: 103.8, zone: 8, time: 'time', date: 'date', dates: { 'oct-20': '2026-10-20', 'jun-21': '2026-06-21', 'mar-24': '2026-03-24' }, pole: 1.0, north: [0, 0, -1] },
  },
};

/* ------------------------------------------------------------ views, HUD */

// Torch-side three-quarter view: keep the screen face, both gaps and the
// edge rays visible, including the torch at its farthest 60 cm setting.
const BENCH_CAMERA = { position: [-1.6, 1.5, 1.25], target: [-0.13, 1.03, 0.05], fov: 30 };
const data = {
  parts: PARTS,
  groups,
  flows,
  views: {
    assembled: { camera: BENCH_CAMERA },
    exploded: { camera: { position: [-1.1, 1.75, 1.75], target: [0.06, 1.06, 0.02], fov: 30 } },
    cover: { position: [-0.86, 1.42, 1.25], target: [0.1, 1.02, 0.02], fov: 30 },
    section: { plane: 'xy' },
    shadows: 'none',
    reference: { fit: 'layers' },
  },
  poses: { 'hole-moved': { 'hole-card-2': { offset: [0, 0, 0.02] }, duration: 0.5 } },
  units: { modelUnit: 'cm', scale: 100 },
  spec: [
    { key: t('Track', '轨道'), value: t('150 CM · 1 CM MARKS', '150 厘米 · 1 厘米刻度'), tag: 'design' },
    { key: t('Torch', '手电筒'), value: t('LED · BEAM ±40°', 'LED · 光束 ±40°'), tag: 'design' },
    { key: t('Screen', '屏幕'), value: t('60 × 50 CM', '60 × 50 厘米'), tag: 'design' },
    { key: t('Sun', '太阳'), value: 'NOAA · 1.3° N 103.8° E · UTC+8', tag: 'typical' },
  ],
  telemetry: [
    { key: t('Shadow H · W', '影子 高 · 宽'), unit: 'cm', follow: ['shadow-height', 'shadow-width'], scope: 'observe' },
    { key: t('Gaps T · S', '距离 手 · 屏'), unit: 'cm', follow: ['gap-torch', 'gap-screen'] },
    { key: t('Light on screen', '屏上的光'), unit: '%', follow: 'light-behind', scope: 'observe' },
    { key: t('Sun height', '太阳高度'), unit: '°', follow: 'sun-height', scope: 'observe' },
    { key: t('Shadow length', '影长'), unit: 'm', follow: 'shadow-length', scope: 'observe' },
    { key: t('Time', '时间'), unit: 'h', follow: 'time-now', scope: 'observe' },
  ],
  sim,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`wrote ${OUT}: ${PARTS.length} parts, mirror yaw ${mirrorYaw.toFixed(2)}°`);
