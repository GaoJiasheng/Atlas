// Builds src/content/topics/refrigerator/data/parts.json from the geometry below and the texts in part-text.json.
// Spec: docs/74-refrigerator-content-spec.md §3–§9. Units metres, Y up, +Z towards the viewer, hinge on the right.
// Run: node scripts/geo/refrigerator/build-parts.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../../src/content/topics/refrigerator/data/parts.json');
const text = JSON.parse(readFileSync(join(here, 'part-text.json'), 'utf8'));

const r = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;
const R = (p) => p.map((x) => r(x));
const box = (x0, x1, y0, y1, z0, z1) => ({ size: R([x1 - x0, y1 - y0, z1 - z0]), at: R([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]) });
const bevel = (b, bevelR, color, tint) => ({ kind: 'bevelBox', size: b.size, bevel: bevelR, at: b.at, color, ...(tint ? { tint } : {}) });
const plain = (b, color, tint) => ({ kind: 'box', size: b.size, at: b.at, color, ...(tint ? { tint } : {}) });

/** Tube from absolute points: `at` = bounding-box centre, path relative to it. */
function tube(points, radius, bendRadius, color, tint) {
  const lo = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i])));
  const hi = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const at = R(lo.map((v, i) => (v + hi[i]) / 2));
  return { kind: 'tube', path: points.map((p) => R(p.map((v, i) => v - at[i]))), radius, bendRadius, at, color, ...(tint ? { tint } : {}) };
}
const len = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]), 0);
const join2 = (...segs) => segs.reduce((a, s) => (a.length && s.length && a[a.length - 1].every((v, i) => Math.abs(v - s[0][i]) < 1e-9) ? a.concat(s.slice(1)) : a.concat(s)), []);

// ---------- colours ----------
const ENAMEL = '#8e9290'; // light silver-grey enamel (0.1-11), not a brand colour
const LINER = '#ecebe6';
const FOAM = '#d8c58e';
const GASKET = '#7e807c';
const DARK = '#55585a';
const TRIM = '#2f3133'; // dark plastic: handles, hinge covers, kick plate, shelf trims, feet
const GLASS = '#a3b3b2'; // tinted shelf glass so it reads against the white liner
const FOODC = '#8f8574';

// ---------- refrigerant tubing (absolute points) ----------
const XS = 0.2895; // condenser tube plane, just inside each side panel
const runsZ = [-0.30, -0.17, -0.04, 0.09, 0.22];
const yLo = 0.30, yHi = 1.62;
const discharge = [[0.03, 0.19, -0.235], [0.03, 0.245, -0.235], [0.03, 0.245, -0.30], [XS, 0.245, -0.30], [XS, yLo, -0.30]];
const rightRuns = runsZ.flatMap((z, i) => (i % 2 === 0 ? [[XS, yLo, z], [XS, yHi, z]] : [[XS, yHi, z], [XS, yLo, z]]));
const crossover = [[XS, yHi, 0.22], [XS, 1.665, 0.22], [-XS, 1.665, 0.22], [-XS, yHi, 0.22]];
const leftRuns = [...runsZ].reverse().flatMap((z, i) => (i % 2 === 0 ? [[-XS, yHi, z], [-XS, yLo, z]] : [[-XS, yLo, z], [-XS, yHi, z]]));
const condenserPts = join2(rightRuns, crossover, leftRuns); // ends at left, bottom, rear
const FZ = 0.268; // front flange plane
const framePts = [
  [-XS, yLo, -0.30], [-0.272, 0.045, -0.30], [-0.272, 0.045, FZ], [-0.272, 1.675, FZ], [0.272, 1.675, FZ], [0.272, 1.185, FZ],
  [-0.24, 1.185, FZ], [-0.24, 1.175, FZ], [0.272, 1.175, FZ], [0.272, 0.045, FZ], [0.272, 0.045, -0.15], [0.20, 0.06, -0.31], [0.20, 0.10, -0.31],
];
const drier = { x: 0.20, y0: 0.10, y1: 0.20, z: -0.31 };
// Suction line: evaporator outlet (top right) -> back foam -> down -> compressor.
const evapOut = [0.215, 1.496, -0.242];
const suctionPts = [evapOut, [0.215, 1.496, -0.31], [0.15, 1.44, -0.31], [0.15, 0.30, -0.31], [0.15, 0.15, -0.31], [0.15, 0.15, -0.25], [0.09, 0.15, -0.25]];
// Capillary: drier -> up beside the suction line (soldered, with a short wrap) -> across behind the freezer -> evaporator inlet (bottom left).
const capX = 0.157;
const helix = [];
for (let i = 0; i <= 36; i++) {
  const a = (i / 12) * 2 * Math.PI; // 3 turns, 12 points per turn
  helix.push([0.15 + 0.0075 * Math.cos(a), 0.70 + (0.24 * i) / 36, -0.31 + 0.0075 * Math.sin(a)]);
}
const evapIn = [-0.215, 1.29, -0.25];
const capillaryPts = [[drier.x, drier.y1, drier.z], [drier.x, 0.26, -0.31], [capX, 0.32, -0.31], [capX, 0.70, -0.31], ...helix.slice(1), [capX, 0.98, -0.31], [capX, 1.29, -0.31], [-0.215, 1.29, -0.31], evapIn];
// Evaporator passes (for the flow only): 3 passes up the coil.
const evapPts = [evapIn, [-0.21, 1.304, -0.242], [0.21, 1.304, -0.242], [0.21, 1.40, -0.242], [-0.21, 1.40, -0.242], [-0.21, 1.496, -0.242], evapOut];
const drainPts = [[-0.12, 1.222, -0.242], [-0.12, 1.20, -0.315], [-0.12, 0.30, -0.315], [-0.06, 0.255, -0.26]];

// ---------- parts ----------
const P = [];
const part = (id, group, primitive, more = {}) => P.push({ id, group, primitive, ...more });

// 01 cabinet
part('outer-case', 'cabinet', bevel(box(-0.3, 0.3, 1.692, 1.70, -0.34, 0.28), 0.0035, 'enamel', ENAMEL), {
  extra: [
    bevel(box(-0.3, -0.292, 0.02, 1.692, -0.34, 0.28), 0.0038, 'enamel', ENAMEL),
    bevel(box(-0.292, 0.292, 0.27, 1.692, -0.34, -0.334), 0.002, 'enamel', ENAMEL),
    // front flange round the two openings (steel face the door seals close against)
    bevel(box(-0.292, -0.25, 0.02, 1.692, 0.272, 0.28), 0.001, 'enamel', ENAMEL), bevel(box(0.25, 0.292, 0.02, 1.692, 0.272, 0.28), 0.001, 'enamel', ENAMEL),
    bevel(box(-0.25, 0.25, 1.632, 1.692, 0.272, 0.28), 0.001, 'enamel', ENAMEL), bevel(box(-0.25, 0.25, 0.02, 0.07, 0.272, 0.28), 0.001, 'enamel', ENAMEL),
    bevel(box(-0.25, -0.235, 1.21, 1.632, 0.272, 0.28), 0.001, 'enamel', ENAMEL), bevel(box(0.235, 0.25, 1.21, 1.632, 0.272, 0.28), 0.001, 'enamel', ENAMEL),
    // hinge covers (top, middle, bottom), kick plate with its vent grille, levelling feet: one dark plastic
    bevel(box(0.215, 0.300, 1.700, 1.716, 0.255, 0.345), 0.006, 'plastic', TRIM),
    bevel(box(0.250, 0.300, 1.166, 1.174, 0.27, 0.338), 0.002, 'plastic', TRIM),
    bevel(box(0.240, 0.300, 0.072, 0.080, 0.25, 0.338), 0.002, 'plastic', TRIM),
    bevel(box(-0.292, 0.292, 0.022, 0.072, 0.272, 0.286), 0.004, 'plastic', TRIM),
    { kind: 'grille', style: 'slats', size: [0.50, 0.034, 0.004], count: 24, bar: 0.004, at: [0, 0.047, 0.288], rotation: [90, 0, 0], color: 'plastic', tint: TRIM },
    ...[[-0.25, 0.22], [0.25, 0.22], [-0.25, -0.30], [0.25, -0.30]].map(([x, z]) => ({ kind: 'cylinder', size: [0.016, 0.018, 0.022], at: [x, 0.011, z], color: 'plastic', tint: TRIM })),
  ],
  explode: { dir: [-1, 0.3, 0], dist: 0.2 }, connects: ['foam', 'side-panel-right'], shell: true, castShadow: true,
});
part('side-panel-right', 'cabinet', bevel(box(0.292, 0.3, 0.02, 1.692, -0.34, 0.28), 0.0038, 'enamel', ENAMEL), {
  explode: { dir: [1, 0, 0], dist: 0.25 }, connects: ['side-condenser'], shell: true, castShadow: true,
});
const foamBoxes = [
  box(-0.287, -0.25, 0.02, 1.692, -0.334, 0.272),
  box(0.25, 0.287, 0.02, 1.692, -0.334, 0.272),
  box(-0.25, -0.235, 1.21, 1.632, -0.275, 0.272),
  box(0.235, 0.25, 1.21, 1.632, -0.275, 0.272),
  box(-0.25, 0.25, 0.32, 1.632, -0.334, -0.29),
  box(-0.235, 0.235, 1.21, 1.632, -0.29, -0.275),
  box(-0.25, 0.25, 1.632, 1.692, -0.334, 0.272),
  box(-0.25, 0.25, 0.02, 0.07, -0.07, 0.272),
  box(-0.25, 0.25, 0.27, 0.32, -0.334, -0.07),
  box(-0.25, 0.25, 0.02, 0.27, -0.12, -0.07),
];
part('foam', 'cabinet', bevel(foamBoxes[0], 0.002, 'plastic', FOAM), {
  extra: foamBoxes.slice(1).map((b) => bevel(b, 0.002, 'plastic', FOAM)), connects: ['outer-case', 'freezer-liner', 'fresh-liner'], shell: true, castShadow: false,
});
const T = 0.004;
part('freezer-liner', 'cabinet', bevel(box(-0.235, 0.235, 1.632 - T, 1.632, -0.275, 0.272), 0.0015, 'plastic', LINER), {
  extra: [
    box(-0.235, -0.235 + T, 1.21, 1.632, -0.275, 0.272), box(0.235 - T, 0.235, 1.21, 1.632, -0.275, 0.272),
    box(-0.235, 0.235, 1.21, 1.632, -0.275, -0.275 + T), box(-0.235, 0.235, 1.21, 1.21 + T, -0.275, 0.272),
  ].map((b) => bevel(b, 0.0015, 'plastic', LINER)),
  connects: ['foam'], shell: true, castShadow: false,
});
part('fresh-liner', 'cabinet', bevel(box(-0.25, -0.25 + T, 0.07, 1.15, -0.29, 0.272), 0.0015, 'plastic', LINER), {
  extra: [
    box(0.25 - T, 0.25, 0.07, 1.15, -0.29, 0.272), box(-0.25, 0.25, 0.32, 1.15, -0.29, -0.29 + T),
    box(-0.25, 0.25, 0.32, 0.32 + T, -0.29, -0.07), box(-0.25, 0.25, 0.07, 0.32, -0.07, -0.07 + T), box(-0.25, 0.25, 0.07, 0.07 + T, -0.07, 0.272),
  ].map((b) => bevel(b, 0.0015, 'plastic', LINER)),
  connects: ['foam', 'air-duct'], shell: true, castShadow: false,
});
part('mullion', 'cabinet', {
  kind: 'extrude', shape: [[-0.25, -0.29], [0.25, -0.29], [0.25, 0.28], [-0.25, 0.28]],
  holes: [[[-0.20, 0.17], [0.20, 0.17], [0.20, 0.20], [-0.20, 0.20]], [[-0.04, -0.27], [0.04, -0.27], [0.04, -0.23], [-0.04, -0.23]]],
  depth: 0.06, bevel: 0.002, rotation: [90, 0, 0], at: [0, 1.18, 0], color: 'plastic', tint: LINER,
}, {
  extra: [
    // damper frame sitting in the rear supply opening
    bevel(box(-0.04, -0.034, 1.15, 1.21, -0.27, -0.23), 0.001, 'plastic', LINER), bevel(box(0.034, 0.04, 1.15, 1.21, -0.27, -0.23), 0.001, 'plastic', LINER),
  ],
  connects: ['damper', 'freezer-liner', 'fresh-liner'], castShadow: false,
});
const DZ0 = 0.29, DZ1 = 0.34;
const handle = (y0, y1) => [
  bevel(box(-0.272, -0.252, y0, y1, DZ1 + 0.018, DZ1 + 0.034), 0.006, 'plastic', TRIM),
  bevel(box(-0.268, -0.256, y0 + 0.01, y0 + 0.03, DZ1, DZ1 + 0.02), 0.003, 'plastic', TRIM),
  bevel(box(-0.268, -0.256, y1 - 0.03, y1 - 0.01, DZ1, DZ1 + 0.02), 0.003, 'plastic', TRIM),
];
part('freezer-door', 'cabinet', bevel(box(-0.3, 0.3, 1.178, 1.698, DZ0, DZ1), 0.012, 'enamel', ENAMEL), {
  extra: [
    bevel(box(-0.25, 0.25, 1.21, 1.66, 0.279, DZ0), 0.004, 'plastic', LINER),
    ...handle(1.24, 1.44),
    tube([[0, 1.188, 0.282], [0.285, 1.188, 0.282], [0.285, 1.683, 0.282], [-0.285, 1.683, 0.282], [-0.285, 1.188, 0.282], [0.0, 1.188, 0.282]], 0.009, 0.02, 'rubber', GASKET),
  ],
  explode: { dir: [0, 0, 1], dist: 0.25 }, connects: ['door-gaskets'], shell: true, castShadow: true,
});
part('fresh-door', 'cabinet', bevel(box(-0.3, 0.3, 0.084, 1.162, DZ0, DZ1), 0.012, 'enamel', ENAMEL), {
  extra: [
    bevel(box(-0.25, 0.25, 0.12, 1.12, 0.279, DZ0), 0.004, 'plastic', LINER),
    ...handle(0.80, 1.10),
  ],
  explode: { dir: [0, 0, 1], dist: 0.25 }, connects: ['door-gaskets', 'lamp'], shell: true, castShadow: true,
});
const gasketLoop = [[0, 0.099, 0.282], [0.285, 0.099, 0.282], [0.285, 1.148, 0.282], [-0.285, 1.148, 0.282], [-0.285, 0.099, 0.282], [0.0, 0.099, 0.282]];
part('door-gaskets', 'cabinet', tube(gasketLoop, 0.009, 0.02, 'rubber', GASKET), {
  explode: { dir: [0, 0, 1], dist: 0.32 }, connects: ['freezer-door', 'fresh-door', 'magnet-strips'], shell: true, castShadow: false,
});
part('magnet-strips', 'cabinet', tube(gasketLoop.map(([x, y]) => [x, y, 0.277]), 0.003, 0.02, 'powder'), {
  explode: { dir: [0, 0, 1], dist: 0.32 }, connects: ['door-gaskets', 'outer-case'], castShadow: false,
});
part('shelves', 'cabinet', plain(box(-0.248, 0.248, 0.6075, 0.6125, -0.262, 0.17), 'glass', GLASS), {
  extra: [
    plain(box(-0.248, 0.248, 0.3275, 0.3325, -0.262, 0.17), 'glass', GLASS), plain(box(-0.248, 0.248, 0.8875, 0.8925, -0.262, 0.17), 'glass', GLASS), plain(box(-0.233, 0.233, 1.4175, 1.4225, -0.19, 0.20), 'glass', GLASS),
    ...[0.33, 0.61, 0.89].map((y) => bevel(box(-0.248, 0.248, y - 0.009, y + 0.006, 0.164, 0.176), 0.002, 'plastic', TRIM)),
    bevel(box(-0.233, 0.233, 1.411, 1.426, 0.194, 0.206), 0.002, 'plastic', TRIM),
  ],
  connects: ['fresh-liner'], castShadow: false,
});
const CR = { x: 0.235, y0: 0.075, y1: 0.30, z0: -0.065, z1: 0.175 };
part('crisper', 'cabinet', bevel(box(-CR.x, CR.x, CR.y0, CR.y1 - 0.02, CR.z1 - 0.005, CR.z1), 0.002, 'glass', '#8fa3a3'), {
  extra: [
    box(-CR.x, CR.x, CR.y0, CR.y1, CR.z0, CR.z0 + 0.005), box(-CR.x, -CR.x + 0.005, CR.y0, CR.y1, CR.z0, CR.z1), box(CR.x - 0.005, CR.x, CR.y0, CR.y1, CR.z0, CR.z1),
    box(-CR.x, CR.x, CR.y0, CR.y0 + 0.005, CR.z0, CR.z1),
  ].map((b) => bevel(b, 0.002, 'glass', '#8fa3a3')),
  explode: { dir: [0, 0, 1], dist: 0.2 }, connects: ['fresh-liner'], castShadow: false,
});
const binY = 0.65;
part('door-bins', 'cabinet', bevel(box(-0.23, 0.23, binY - 0.035, binY + 0.035, 0.196, 0.201), 0.002, 'glass', GLASS), {
  extra: [box(-0.23, 0.23, binY - 0.035, binY - 0.03, 0.196, 0.279), box(-0.23, -0.225, binY - 0.035, binY + 0.02, 0.196, 0.279), box(0.225, 0.23, binY - 0.035, binY + 0.02, 0.196, 0.279)].map((b) => bevel(b, 0.002, 'glass', GLASS)),
  repeat: { count: 3, axis: [0, 1, 0], spacing: 0.30 },
  explode: { dir: [0, 0, 1], dist: 0.3 }, connects: ['fresh-door'], castShadow: false,
});
part('lamp', 'cabinet', bevel(box(-0.05, 0.05, 1.135, 1.147, 0.08, 0.12), 0.003, 'glass', '#f1f0ea'), {
  extra: [{ kind: 'cylinder', size: [0.006, 0.006, 0.02], at: [-0.235, 1.05, 0.27], rotation: [90, 0, 0], color: 'glass', tint: '#f1f0ea' }],
  connects: ['fresh-door', 'control-board'], castShadow: false,
});

// 02 cold side
part('evaporator', 'cold-side', { kind: 'coilBank', rows: 2, cols: 7, pitch: 0.032, tubeRadius: 0.004, length: 0.42, finPitch: 0.007, finDepth: 0.05, bends: 'both', tubeColor: 'casing', at: [0, 1.40, -0.242], color: 'casing' }, {
  explode: { dir: [0, 0.4, -1], dist: 0.22 }, connects: ['capillary-tube', 'suction-line', 'defrost-heater'], castShadow: false,
});
part('frost', 'cold-side', plain(box(-0.212, 0.212, 1.285, 1.515, -0.218, -0.212), 'glass', '#f2f4f3'), {
  extra: [plain(box(-0.212, 0.212, 1.285, 1.515, -0.272, -0.266), 'glass', '#f2f4f3'), plain(box(-0.212, 0.212, 1.509, 1.517, -0.266, -0.218), 'glass', '#f2f4f3')],
  explode: { dir: [0, 0.4, -1], dist: 0.22 }, connects: ['evaporator'], castShadow: false,
});
part('evap-cover', 'cold-side', bevel(box(-0.233, 0.233, 1.25, 1.555, -0.209, -0.197), 0.003, 'plastic', LINER), {
  explode: { dir: [0, 0, 1], dist: 0.2 }, connects: ['evap-fan', 'freezer-liner'], shell: true, castShadow: false,
});
part('evap-fan', 'cold-side', { kind: 'blades', count: 5, radius: 0.042, hub: 0.014, chord: 0.03, twist: 10, sweep: 20, pitch: 30, thickness: 0.002, rotation: [90, 0, 0], at: [0, 1.585, -0.226], color: 'plastic', tint: '#8d8f8c' }, {
  extra: [{ kind: 'cylinder', size: [0.02, 0.02, 0.028], at: [0, 1.585, -0.248], rotation: [90, 0, 0], color: 'plastic', tint: '#8d8f8c' }],
  explode: { dir: [0, 0, 1], dist: 0.15 }, connects: ['evaporator', 'damper', 'control-board'], castShadow: false,
});
part('air-duct', 'cold-side', bevel(box(-0.05, 0.05, 0.36, 1.15, -0.286, -0.262), 0.003, 'plastic', LINER), {
  extra: [1.0, 0.76, 0.52].map((y) => bevel(box(-0.035, 0.035, y - 0.01, y + 0.01, -0.262, -0.256), 0.002, 'plastic', DARK)),
  explode: { dir: [0, 0, 1], dist: 0.15 }, connects: ['damper', 'fresh-liner'], shell: true, castShadow: false,
});
part('damper', 'cold-side', plain(box(-0.033, 0.033, 1.179, 1.181, -0.268, -0.232), 'plastic', DARK), {
  explode: { dir: [0, 0, 1], dist: 0.18 }, connects: ['evap-fan', 'air-duct', 'control-board'], castShadow: false,
});
part('defrost-heater', 'cold-side', tube([[-0.225, 1.45, -0.242], [-0.225, 1.262, -0.242], [0.225, 1.262, -0.242], [0.225, 1.45, -0.242]], 0.005, 0.015, 'stainless'), {
  explode: { dir: [0, 0.4, -1], dist: 0.22 }, connects: ['evaporator', 'sensors', 'control-board'], castShadow: false,
});
part('drain-trough', 'cold-side', bevel(box(-0.23, 0.23, 1.219, 1.222, -0.272, -0.212), 0.001, 'plastic', LINER), {
  extra: [bevel(box(-0.23, 0.23, 1.219, 1.247, -0.215, -0.212), 0.001, 'plastic', LINER), bevel(box(-0.23, 0.23, 1.219, 1.247, -0.272, -0.269), 0.001, 'plastic', LINER)],
  explode: { dir: [0, -1, 0], dist: 0.12 }, connects: ['drain-tube'], castShadow: false,
});
part('drain-tube', 'cold-side', tube(drainPts, 0.006, 0.02, 'rubber'), { connects: ['drain-trough', 'drain-tray'], shell: true, castShadow: false });
part('sensors', 'cold-side', { kind: 'capsule', size: [0.004, 0.02], at: [-0.229, 1.50, -0.10], color: 'rubber' }, {
  extra: [{ kind: 'capsule', size: [0.004, 0.02], at: [-0.244, 0.95, -0.15], color: 'rubber' }, { kind: 'capsule', size: [0.004, 0.02], at: [0.20, 1.52, -0.242], rotation: [0, 0, 90], color: 'rubber' }],
  explode: { dir: [-1, 0, 0], dist: 0.1 }, connects: ['control-board'], castShadow: false,
});

// 03 machine and warm side
const CC = [0, 0.12, -0.225];
part('compressor', 'machine', {
  kind: 'lathe', profile: [[0, -0.075], [0.05, -0.075], [0.068, -0.062], [0.075, -0.035], [0.075, -0.002], [0.078, 0], [0.078, 0.005], [0.075, 0.007], [0.074, 0.035], [0.064, 0.062], [0.04, 0.074], [0, 0.077]],
  segments: 40, scale: [1.2, 1, 1], at: CC, color: 'powder',
}, {
  extra: [
    bevel(box(-0.13, 0.13, 0.035, 0.043, -0.31, -0.14), 0.002, 'powder'), // base tray with the rubber-mounted feet
    bevel(box(-0.125, -0.085, 0.07, 0.12, -0.25, -0.20), 0.004, 'powder'), // terminal box
    // inside the shell: frame block and the cylinder the piston runs in (seen when cut open)
    bevel(box(-0.06, 0.06, 0.128, 0.142, -0.27, -0.18), 0.002, 'steel'),
    { kind: 'lathe', profile: [[0.0135, -0.025], [0.018, -0.025], [0.018, 0.025], [0.0135, 0.025], [0.0135, -0.025]], segments: 24, at: [0, 0.165, -0.185], rotation: [90, 0, 0], color: 'steel' },
  ],
  explode: { dir: [0, 0, -1], dist: 0.25 }, connects: ['discharge-line', 'suction-line', 'compressor-motor', 'control-board'], castShadow: false,
});
part('compressor-piston', 'machine', { kind: 'cylinder', size: [0.0125, 0.0125, 0.02], at: [0, 0.165, -0.19], rotation: [90, 0, 0], color: 'steel' }, {
  extra: [plain(box(-0.004, 0.004, 0.161, 0.169, -0.228, -0.198), 'steel')],
  explode: { dir: [0, 0, -1], dist: 0.25 }, connects: ['compressor-motor'], castShadow: false,
});
part('compressor-motor', 'machine', { kind: 'lathe', profile: [[0.03, -0.025], [0.058, -0.025], [0.058, 0.025], [0.03, 0.025], [0.03, -0.025]], segments: 32, at: [0, 0.09, -0.225], color: 'steel' }, {
  extra: [
    { kind: 'lathe', profile: [[0.034, -0.008], [0.054, -0.008], [0.054, 0.008], [0.034, 0.008], [0.034, -0.008]], segments: 32, at: [0, 0.123, -0.225], color: 'copper' },
    { kind: 'lathe', profile: [[0.034, -0.008], [0.054, -0.008], [0.054, 0.008], [0.034, 0.008], [0.034, -0.008]], segments: 32, at: [0, 0.057, -0.225], color: 'copper' },
    { kind: 'cylinder', size: [0.027, 0.027, 0.05], at: [0, 0.09, -0.225], color: 'steel' },
    { kind: 'cylinder', size: [0.006, 0.006, 0.07], at: [0, 0.135, -0.225], color: 'steel' },
  ],
  explode: { dir: [0, 0, -1], dist: 0.25 }, connects: ['compressor-piston'], castShadow: false,
});
part('discharge-line', 'machine', tube(discharge, 0.0024, 0.012, 'copper'), { explode: { dir: [0, 0, -1], dist: 0.2 }, connects: ['compressor', 'side-condenser'], castShadow: false });
part('side-condenser', 'machine', tube(condenserPts, 0.0024, 0.03, 'copper'), { connects: ['discharge-line', 'frame-pipe'], shell: true, castShadow: false });
part('frame-pipe', 'machine', tube(framePts, 0.0024, 0.0045, 'copper'), { connects: ['side-condenser', 'filter-drier'], shell: true, castShadow: false });
part('filter-drier', 'machine', { kind: 'cylinder', size: [0.009, 0.009, 0.07], at: [drier.x, 0.15, drier.z], color: 'copper' }, {
  extra: [{ kind: 'cone', size: [0.009, 0.015], at: [drier.x, 0.1925, drier.z], color: 'copper' }, { kind: 'cone', size: [0.009, 0.015], at: [drier.x, 0.1075, drier.z], rotation: [180, 0, 0], color: 'copper' }],
  explode: { dir: [0, 0, -1], dist: 0.15 }, connects: ['frame-pipe', 'capillary-tube'], castShadow: false,
});
part('capillary-tube', 'machine', tube(capillaryPts, 0.0012, 0.004, 'copper'), { connects: ['filter-drier', 'evaporator', 'suction-line'], shell: true, castShadow: false });
part('suction-line', 'machine', tube(suctionPts, 0.0032, 0.015, 'copper'), { connects: ['evaporator', 'compressor', 'capillary-tube'], shell: true, castShadow: false });
part('drain-tray', 'machine', bevel(box(-0.10, 0.10, 0.2, 0.203, -0.295, -0.155), 0.001, 'plastic', '#9fa29e'), {
  extra: [
    box(-0.10, 0.10, 0.2, 0.232, -0.295, -0.292), box(-0.10, 0.10, 0.2, 0.232, -0.158, -0.155), box(-0.10, -0.097, 0.2, 0.232, -0.295, -0.155), box(0.097, 0.10, 0.2, 0.232, -0.295, -0.155),
  ].map((b) => bevel(b, 0.001, 'plastic', '#9fa29e')),
  explode: { dir: [0, 1, 0], dist: 0.12 }, connects: ['drain-tube', 'compressor'], castShadow: false,
});
part('control-board', 'machine', bevel(box(-0.23, -0.07, 1.50, 1.64, -0.362, -0.34), 0.003, 'steel'), {
  explode: { dir: [-1, 0, -0.5], dist: 0.2 }, connects: ['compressor', 'evap-fan', 'damper', 'sensors', 'defrost-heater', 'lamp'], castShadow: false,
});
part('bay-grille', 'machine', { kind: 'grille', style: 'slats', size: [0.584, 0.25, 0.004], count: 18, bar: 0.0034, at: [0, 0.145, -0.342], rotation: [90, 0, 0], color: 'powder', tint: '#4a4c4a' }, {
  explode: { dir: [0, 0, -1], dist: 0.25 }, connects: ['compressor'], shell: true, castShadow: false,
});

// context: unlabelled food (shown when the try-it says "full")
const bottle = (x, y0, z, rr, h) => ({ kind: 'lathe', profile: [[0, 0], [rr, 0], [rr, h * 0.62], [rr * 0.45, h * 0.8], [rr * 0.4, h], [0, h]], segments: 16, at: [x, y0, z], color: 'plastic', tint: FOODC });
part('food-items', 'cabinet', bevel(box(0.02, 0.16, 0.3325, 0.4125, -0.12, -0.02), 0.004, 'plastic', FOODC), {
  extra: [
    bottle(-0.15, 0.3325, -0.12, 0.04, 0.24),
    bevel(box(0.03, 0.17, 0.3325, 0.3925, 0.03, 0.15), 0.004, 'plastic', FOODC),
    { kind: 'lathe', profile: [[0, 0], [0.05, 0], [0.05, 0.11], [0.045, 0.12], [0, 0.12]], segments: 16, at: [-0.12, 0.6125, -0.02], color: 'plastic', tint: FOODC },
    bevel(box(0.02, 0.20, 0.6125, 0.7125, -0.20, -0.06), 0.004, 'plastic', FOODC),
    { kind: 'sphere', size: [0.035], at: [0.0, 0.6475, 0.10], color: 'plastic', tint: FOODC },
    { kind: 'sphere', size: [0.035], at: [0.075, 0.6475, 0.11], color: 'plastic', tint: FOODC },
    bottle(0.15, 0.8925, -0.15, 0.035, 0.20),
    bevel(box(-0.18, -0.02, 0.8925, 0.9625, -0.16, -0.04), 0.004, 'plastic', FOODC),
    { kind: 'sphere', size: [0.04], at: [-0.12, 0.12, 0.05], color: 'plastic', tint: FOODC },
    { kind: 'sphere', size: [0.04], at: [0.10, 0.12, 0.06], color: 'plastic', tint: FOODC },
    bevel(box(-0.18, 0.02, 1.214, 1.29, -0.12, 0.08), 0.004, 'plastic', FOODC),
  ],
  context: true, castShadow: false,
});

// ---------- texts ----------
for (const p of P) {
  const t = text.parts[p.id];
  if (!t) throw new Error(`no text for ${p.id}`);
  Object.assign(p, { name: t.name, summary: t.summary, detail: t.detail }, text.chainName?.[p.id] ? { chainName: text.chainName[p.id] } : {});
  if (p.group === undefined) delete p.group;
}
const order = ['id', 'name', 'chainName', 'group', 'summary', 'detail', 'primitive', 'extra', 'repeat', 'explode', 'connects', 'shell', 'context', 'castShadow'];
const parts = P.map((p) => Object.fromEntries(order.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])));

// ---------- flows ----------
const hot = 'token:hot', neutral = 'token:neutral', cold = 'token:cold';
const hotGas = join2(discharge, condenserPts.slice(0, rightRuns.length + crossover.length - 1));
const liquid = join2(condenserPts.slice(rightRuns.length + crossover.length - 2), framePts.slice(1), [[drier.x, drier.y1, drier.z]]);
const coldMix = join2(capillaryPts, evapPts);
const coolGas = join2(suctionPts, [[0.03, 0.19, -0.235]]);
const flows = [
  { id: 'ref-hot-gas', group: 'refrigerant', path: hotGas, speed: 0.9, color: hot, stops: [{ at: 0, color: hot }, { at: 0.75, color: hot }, { at: 1, color: neutral }], ends: 'open', count: 450, size: 0.45, spread: 0.002, parts: ['compressor', 'discharge-line', 'side-condenser'] },
  { id: 'ref-warm-liquid', group: 'refrigerant', path: liquid, speed: 0.6, color: neutral, stops: [{ at: 0, color: neutral }, { at: 1, color: neutral }], ends: 'open', count: 1024, size: 0.45, spread: 0.002, parts: ['side-condenser', 'frame-pipe', 'filter-drier'] },
  { id: 'ref-cold-mix', group: 'refrigerant', path: coldMix, speed: 0.2, color: cold, stops: [{ at: 0, color: neutral }, { at: 0.55, color: cold }, { at: 1, color: cold }], ends: 'open', count: 860, size: 0.45, spread: 0.002, parts: ['filter-drier', 'capillary-tube', 'evaporator'] },
  { id: 'ref-cool-gas', group: 'refrigerant', path: coolGas, speed: 0.75, color: cold, stops: [{ at: 0, color: cold }, { at: 0.5, color: cold }, { at: 1, color: neutral }], ends: 'open', count: 120, size: 0.45, spread: 0.002, parts: ['evaporator', 'suction-line', 'compressor'] },
  { id: 'air-freezer', group: 'air-water', path: [[0, 1.585, -0.215], [0, 1.60, -0.10], [0, 1.59, 0.15], [0, 1.45, 0.20], [0, 1.27, 0.18], [0, 1.235, -0.05], [0, 1.232, -0.19], [0, 1.27, -0.242], [0, 1.40, -0.242], [0, 1.53, -0.238], [0, 1.585, -0.215]], speed: 0.35, color: cold, count: 300, size: 0.5, spread: [0.18, 0.02, 0.02], parts: ['evap-fan', 'evaporator'] },
  {
    id: 'air-fresh', group: 'air-water', speed: 0.35, color: cold, count: 420, size: 0.5, spread: [0.16, 0.015, 0.015], parts: ['evap-fan', 'damper', 'air-duct', 'mullion', 'evaporator'],
    paths: [1.0, 0.76, 0.52].map((y, i) => ({
      id: `outlet-${i + 1}`,
      path: [[0, 1.585, -0.232], [0, 1.56, -0.272], [0, 1.25, -0.272], [0, 1.18, -0.25], [0, 1.12, -0.274], [0, y + 0.02, -0.274], [0, y, -0.24], [0, y - 0.02, 0.0], [0, y + 0.02, 0.15], [0, 1.10, 0.19], [0, 1.18, 0.185], [0, 1.235, 0.10], [0, 1.235, -0.15], [0, 1.27, -0.242], [0, 1.40, -0.242]],
    })),
  },
  {
    id: 'air-kitchen', group: 'kitchen-air', speed: 0.25, color: neutral, stops: [{ at: 0, color: neutral }, { at: 0.3, color: hot }, { at: 1, color: hot }], ends: 'fade', count: 480, size: 0.55, spread: [0.02, 0.05, 0.12], clip: false,
    paths: [{ id: 'side', path: [[0.33, 0.08, -0.05], [0.33, 0.9, -0.05], [0.34, 1.75, -0.05]] }, { id: 'side-l', path: [[-0.33, 0.08, -0.05], [-0.33, 0.9, -0.05], [-0.34, 1.75, -0.05]] }, { id: 'back', path: [[0, 0.08, -0.375], [0, 0.9, -0.38], [0, 1.78, -0.39]] }],
  },
  { id: 'air-door-out', group: 'kitchen-air', path: [[0, 0.40, 0.0], [0, 0.20, 0.22], [0, 0.07, 0.40], [0, 0.03, 0.75]], speed: 0.3, color: cold, ends: 'fade', count: 150, size: 0.6, spread: [0.2, 0.03, 0.05], clip: false, whenRun: false },
  { id: 'air-door-in', group: 'kitchen-air', path: [[0, 1.05, 0.75], [0, 1.08, 0.40], [0, 1.05, 0.20], [0, 0.95, -0.10]], speed: 0.3, color: hot, stops: [{ at: 0, color: hot }, { at: 0.5, color: neutral }, { at: 1, color: cold }], ends: 'fade', count: 150, size: 0.6, spread: [0.2, 0.03, 0.05], clip: false, whenRun: false },
  { id: 'meltwater', group: 'air-water', path: join2([[-0.12, 1.24, -0.242]], drainPts, [[-0.06, 0.215, -0.225]]), speed: 0.2, color: neutral, ends: 'fade', count: 80, size: 0.6, spread: 0.002, whenRun: false, parts: ['drain-trough', 'drain-tube', 'drain-tray'] },
].map((f) => (f.path ? { ...f, path: f.path.map(R) } : { ...f, paths: f.paths.map((p) => ({ ...p, path: p.path.map(R) })) }));

// ---------- the rest ----------
const cam = (position, target, fov) => ({ position, target, fov });
const hero = cam([2.57, 1.65, 4.19], [0, 0.7, 0], 30);
const L = (k) => text.telemetry[k];
const C = text.controls, O = text.outputs;
const data = {
  parts,
  groups: [
    { id: 'cabinet', name: text.groups.cabinet, color: 'token:ink-2' },
    { id: 'cold-side', name: text.groups['cold-side'], color: 'token:cold' },
    { id: 'machine', name: text.groups.machine, color: 'token:neutral' },
    { id: 'refrigerant', name: text.groups.refrigerant, color: 'token:hot' },
    { id: 'air-water', name: text.groups['air-water'], color: 'token:cold' },
    { id: 'kitchen-air', name: { en: 'Kitchen air', zh: '厨房空气' }, color: 'token:hot' },
  ],
  flows,
  animations: [
    { id: 'piston-stroke', target: 'compressor-piston', kind: 'sequence', loop: true, keys: [{ t: 0, offset: [0, 0, 0] }, { t: 0.4, offset: [0, 0, -0.012] }, { t: 0.8, offset: [0, 0, 0] }] },
    { id: 'motor-spin', target: 'compressor-motor', kind: 'rotate', axis: [0, 1, 0], rpm: 75 },
    { id: 'fan-spin', target: 'evap-fan', kind: 'rotate', axis: [0, 0, 1], rpm: 40 },
  ],
  views: {
    assembled: { camera: hero },
    xray: { camera: hero },
    exploded: { camera: cam([2.3, 1.8, 3.7], [0, 0.85, 0], 30) },
    cutaway: { normal: [-1, 0, 0], offset: 0 },
    cuts: { centre: { normal: [-1, 0, 0], offset: 0, label: { en: 'Centre section', zh: '中线剖面' } } },
    section: { plane: 'zy' },
    cover: cam([2.16, 1.65, 3.52], [0, 0.86, 0], 30),
  },
  spec: text.spec,
  telemetry: [
    { key: L('compressor'), unit: 'rpm', idle: 0, run: 3100, lag: 6, decimals: 0 },
    { key: L('high-side'), unit: 'MPa abs', idle: 0.079, run: 0.531, lag: 12, decimals: 3 },
    { key: L('low-side'), unit: 'MPa abs', idle: 0.079, run: 0.058, lag: 12, decimals: 3 },
    { key: L('power'), unit: 'W', idle: 0, run: 60, lag: 4, decimals: 0 },
    { key: L('heat-out'), unit: 'W', idle: 0, run: 168, lag: 20, decimals: 0 },
    { key: L('fridge-air'), unit: '°C', follow: 'fridge-c', scope: 'observe', lag: 0, decimals: 1 },
  ],
  presets: [
    { id: 'hero', label: { en: 'Hero', zh: '全景' }, camera: hero },
    { id: 'inside', label: { en: 'Inside', zh: '箱内' }, camera: cam([-0.95, 1.19, 4.82], [0.1, 0.74, 0.15], 32) },
    { id: 'section', label: { en: 'Section', zh: '剖面' }, camera: cam([4.9, 0.95, -0.03], [0, 0.8, -0.03], 28) },
    { id: 'back', label: { en: 'Back', zh: '背面' }, camera: cam([2.53, 2.37, -4.11], [0, 0.7, -0.2], 30) },
    { id: 'bay', label: { en: 'Machine bay', zh: '机械仓' }, camera: cam([0.95, 0.55, -1.25], [0.0, 0.15, -0.23], 30) },
    { id: 'coldspot', label: { en: 'Cold spot', zh: '蒸发器' }, camera: cam([0.9, 1.75, -1.2], [0, 1.40, -0.25], 30), view: 'xray' },
  ],
  poses: {
    'doors-open': { 'freezer-door': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'fresh-door': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'door-gaskets': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'magnet-strips': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'door-bins': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, duration: 0.8 },
    'fresh-door-open': { 'fresh-door': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'door-gaskets': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'magnet-strips': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, 'door-bins': { pivot: [0.295, 0.86, 0.335], rotation: [0, 100, 0] }, duration: 0.8 },
    'damper-open': { damper: { pivot: [0, 1.18, -0.232], rotation: [70, 0, 0] }, duration: 0.8 },
    'frost-thin': { frost: { scale: [1, 1, 0.5] }, duration: 0.8 },
    'frost-thick': { frost: { scale: [1, 1, 1] }, duration: 0.8 },
  },
  sim: {
    kind: 'heat',
    controls: [
      { id: 'elapsed-s', kind: 'step', values: [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600], default: 0, unit: 's', label: C['elapsed-s'].label },
      { id: 'setup', kind: 'choice', default: 'closed', label: C.setup.label, options: ['closed', 'open', 'thin'].map((id) => ({ id, label: C.setup.options[id] })) },
      { id: 'contents', kind: 'choice', default: 'full', label: C.contents.label, options: ['full', 'empty'].map((id) => ({ id, label: C.contents.options[id] })) },
      { id: 'heater-w', kind: 'step', values: [0, 250], default: 0, unit: 'W', label: C['heater-w'].label },
    ],
    outputs: [
      { id: 'fridge-c', from: 'temperature:fridge', label: O['fridge-c'].label, unit: '°C', decimals: 1 },
      { id: 'baseline-c', from: 'temperature:baseline', label: O['baseline-c'].label, unit: '°C', decimals: 1 },
      { id: 'fridge-change', from: 'change:fridge', label: O['fridge-change'].label, unit: 'K', decimals: 1 },
      { id: 'fridge-rate', from: 'rate:fridge', label: O['fridge-rate'].label, unit: 'W', decimals: 0 },
      { id: 'fridge-direction', from: 'direction:fridge', kind: 'state', label: O['fridge-direction'].label, states: O['fridge-direction'].states },
      { id: 'vs-baseline', from: 'compare:vs-baseline', kind: 'state', label: O['vs-baseline'].label, states: O['vs-baseline'].states },
    ],
    bind: [
      { control: 'setup', part: ['fresh-door', 'door-gaskets', 'magnet-strips', 'door-bins'], pose: { open: 'fresh-door-open' } },
      { control: 'setup', flow: ['air-door-out', 'air-door-in'], visible: { eq: 'open' } },
      { control: 'contents', part: 'food-items', visible: { eq: 'full' } },
      { control: 'heater-w', part: 'defrost-heater', glow: { color: 'token:hot', full: 250, curve: 'linear' } },
      { control: 'heater-w', flow: 'meltwater', visible: { gte: 250 } },
    ],
    heat: {
      time: 'elapsed-s',
      lumps: {
        fridge: { initial: 4, capacity: { mass: { control: 'contents', values: { full: 12000, empty: 2000 } }, specific: 4.2 }, reservoir: { temperature: 28, conductance: { control: 'setup', values: { closed: 1.6, open: 20, thin: 4.8 } } } },
        baseline: { initial: 4, capacity: 50400, reservoir: { temperature: 28, conductance: 1.6 } },
      },
      compare: { 'vs-baseline': { first: 'fridge', second: 'baseline', epsilon: 0.05 } },
    },
  },
};
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
const L2 = (f) => (f.path ? len(f.path) : f.paths.reduce((s, p) => s + len(p.path), 0));
for (const f of flows) console.log(f.id.padEnd(16), 'len', L2(f).toFixed(2), 'flux', ((f.count / L2(f)) * f.speed).toFixed(0), 'per m', (f.count / L2(f)).toFixed(0));
console.log('parts', parts.length, 'tube points', { condenser: condenserPts.length, frame: framePts.length, capillary: capillaryPts.length });
