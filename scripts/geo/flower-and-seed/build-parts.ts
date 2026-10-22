/**
 * `pnpm tsx scripts/geo/flower-and-seed/build-parts.ts` — writes
 * src/content/topics/flower-and-seed/data/parts.json (docs/41 §3–§4 with the
 * §0.3 and §9.1 revisions).
 *
 * A round specimen table 1.9 m across (1 scene unit = 1 m, table top y = 0)
 * laid out as a flowering plant's cycle, clockwise seen from above with the
 * flower at the back: ① a chilli flower ×20 with a bee, ② a sunbird at a red
 * flower spike and a cave nectar bat at durian flowers (life size), a fig cut
 * open with its fig wasp (not to scale), ③ two pairs of reproductive cells
 * (diagram), ④ fruits and seeds (life size) in front of a strip of sea, ⑤ a
 * green bean whole, split and sprouting ×10, ⑥ a
 * day strip and a dish of beans on a damp towel, and four cups A, B, D, E on
 * a windowsill, in a cupboard and in a small fridge. Every station faces the
 * table's centre, where the reader stands. A small table outside the ring
 * holds a bird's nest fern ×¼, a frond turned over and, enlarged, a piece of
 * frond underside and a moss. The `cycle` flow runs round the table between
 * the reader and the stations.
 *
 * The chilli flower (petals, sepals, stamens, pistil), the pollen grains,
 * the green and the cut chilli, the angsana pod, the split and the sprouting
 * green bean are the plant topic's own primitives moved here (./reuse.ts,
 * D13); everything else is built in ./models.ts (the flower cut in half, the
 * bee and the coconut too: the plant's versions are drawn at other sizes or
 * too sketchy at these). Texts come
 * from ./text.ts. The try-it `sim` follows tests/space-scene/fixtures/seeds-bench.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEG, eulerMatrix, lathe, n5, orient, r3, sphere, sweep, torus, type Prim, type V3 } from '../living-things/kit';
import { at, CELLS, COVER, CUPBOARD, dirIn, FIG, FLOWER, FRIDGE, FRUITS, HERO, place, polar, PRESET_CAMERAS, R_TABLE, RING, SEED, SIDE, SILL, STRIP, VISIT, type Station } from './layout';
import * as M from './models';
import { add3, prims, shiftModel, sub3, turnModel } from './models';
import { axisAngle, boundsOf, eulerOf, mulMM, mulMV, plantPrims, reuse, rotateOnto, scaleFor } from './reuse';
import { CONTROL_TEXT, GROUP_TEXT, OUTPUT_TEXT, PART_TEXT, PRESET_TEXT, SPEC_TEXT, STATE_TEXT, TELEMETRY_TEXT } from './text';

const OUT = join(import.meta.dirname, '../../../src/content/topics/flower-and-seed/data/parts.json');

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
const parts: Part[] = [];
const add = (id: string, group: string | undefined, ps: Prim[], rest: Omit<Part, 'id' | 'group' | 'primitive' | 'extra'> = {}) => {
  if (ps.length > 33) throw new Error(`${id}: ${ps.length - 1} extra primitives (max 32)`);
  parts.push({ id, ...(group ? { group } : {}), primitive: ps[0]!, ...(ps.length > 1 ? { extra: ps.slice(1) } : {}), ...rest });
};

/* ========================================================= context */

// The specimen table: a round top 1.9 m across, 4 cm thick, on a central column and a foot; small blocks hold the upright specimens.
const blocks: V3[] = [];
const holder = (p: V3) => blocks.push(p);
const tableProfile = (r: number): [number, number][] => [
  [0, -0.74], [r * 0.36, -0.74], [r * 0.37, -0.72], [r * 0.12, -0.7], [0.06, -0.66], [0.055, -0.07], [r * 0.3, -0.045], [r - 0.012, -0.04], [r, -0.028], [r, -0.006], [r - 0.006, 0], [0, 0],
];

/* =========================================================== ① fern */

const fern = M.fernFronds();
add('fern-fronds', 'fern', place(SIDE, fern, [-0.05, 0, -0.07], 10));
add('fern-underside', 'fern', place(SIDE, M.fernUnderside(), [0.02, 0, 0.13], -8));
add('sorus-close', 'spore-close', place(SIDE, M.sorusClose(), [0.19, 0, 0.0], -30));
add('moss-cushion', 'spore-close', place(SIDE, M.mossCushion(), [0.15, 0, -0.17], 20));
add('moss-capsules', 'spore-close', place(SIDE, M.mossCapsules(), [0.15, 0, -0.17], 20));

/* ========================================================= ② flower */

// One chilli flower of the plant topic (×1.7 there) at ×20 here: petals, sepals (without the plant's stalk), stamens, pistil.
const sF = scaleFor(1.7, 20);
const pistilR = plantPrims('pistil')[0]!.rotation as number[];
// The pistil lathe's own +Y: the way the flower faces in the plant topic (it nods there).
const plantAxis = (() => {
  const R = eulerMatrix(pistilR);
  return [R[0]![1]!, R[1]![1]!, R[2]![1]!];
})();
const FACE: V3 = r3(normalise([0, 0.42, 0.91]));
function normalise(v: readonly number[]): V3 {
  const l = Math.hypot(v[0]!, v[1]!, v[2]!);
  return [v[0]! / l, v[1]! / l, v[2]! / l];
}
const flowerM = mulMM(FLOWER.m, mulMM(axisAngle(FACE, 18), rotateOnto(plantAxis, FACE)));
const calyx = plantPrims('sepals')[1]!.at;
const FLOWER_AT = at(FLOWER, [-0.09, 0.2, -0.02]);
const flowerMove = { anchor: calyx, to: FLOWER_AT, s: sF, m: flowerM, boost: 2.5 };
const petals = reuse('flower', { ...flowerMove, pick: [0, 1, 2, 3, 4] });
const sepals = reuse('sepals', { ...flowerMove, pick: [1] });
const stamens = reuse('stamens', { ...flowerMove, pick: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
const pistil = reuse('pistil', { ...flowerMove });
// The flower stalk: from its block on the table up behind the calyx.
const faceWorld = r3(mulMV(FLOWER.m, FACE));
const calyxBack = add3(FLOWER_AT, faceWorld.map((x) => -x * 0.035));
const stalkBase = at(FLOWER, [-0.09, 0.03, -0.11]);
holder(at(FLOWER, [-0.09, 0, -0.11]));
const stalk = sweep([stalkBase, add3(stalkBase, [0.004, 0.09, 0.012]), add3(calyxBack, [0, -0.03, -0.035]), calyxBack], [0.0085, 0.0082, 0.0078, 0.0072], 'tissue', { tint: '#5b7735', segments: 32, radial: 12 });
add('flower', 'flower-parts', petals, { explode: { dir: dirIn(FLOWER, [0, 0.6, 1]), dist: 0.12 } });
add('sepals', 'flower-parts', [...sepals, stalk], { explode: { dir: dirIn(FLOWER, [0, -0.2, -1]), dist: 0.06 } });
add('stamens', 'flower-parts', stamens, { explode: { dir: dirIn(FLOWER, [0.3, 1, 0.6]), dist: 0.12 }, connects: ['pistil', 'bee'] });
add('pistil', 'flower-parts', pistil, { explode: { dir: dirIn(FLOWER, [-0.3, 1, 0.8]), dist: 0.15 }, connects: ['ovules'] });

// The flower cut in half, ×20 (built new: the plant topic's section is drawn at another size from its flower and is too
// schematic at this one); its cut faces the reader.
const sectionAt = at(FLOWER, [0.13, 0.0, 0.04]);
const SECTION_YAW = -12;
add('flower-section', 'flower-parts', place(FLOWER, M.flowerSection(), [0.13, 0.0, 0.04], SECTION_YAW), { connects: ['ovules'] });
add('ovules', 'flower-parts', place(FLOWER, M.sectionOvules(), [0.13, 0.0, 0.04], SECTION_YAW));
// Pollen grains (the plant's magnified grains), on the table in front of the section.
const pollenB = boundsOf(plantPrims('pollen-grains'));
const pollen = reuse('pollen-grains', { anchor: [pollenB.centre[0], pollenB.min[1], pollenB.centre[2]], to: at(FLOWER, [0.02, 0, 0.13]), s: 0.45, m: FLOWER.m, boost: 1.5 });
add('pollen-grains', 'pollen-close', pollen);

// The bee at ×20 (built new: the plant topic's bee is a 1 cm sketch that does not hold up at this size), hovering at the
// flower's right and heading for it.
const stamenCentre = boundsOf(stamens).centre;
const BEE_AT = add3(stamenCentre, dirIn(FLOWER, [-0.2, 0.06, 0.07]));
const beeHeading = normalise(sub3(stamenCentre, BEE_AT).map((x, i) => (i === 1 ? x * 0.3 : x)));
const beeM = mulMM(rotateOnto([1, 0, 0], beeHeading), axisAngle([1, 0, 0], 0));
const bee = prims(shiftModel(turnModel(M.honeybee(), beeM), BEE_AT));
add('bee', 'flower-parts', bee, { connects: ['stamens'] });

/* ===================================================== ③ visitors */

// Scarlet spiral flag with the sunbird; durian branch with the cave nectar bat.
const RED_AT: V3 = [-0.17, 0, 0.02];
holder(at(VISIT, RED_AT));
const redFlower = M.redFlower();
add('red-flower', 'visitors', place(VISIT, redFlower, RED_AT, 0));
const mouthWorld = at(VISIT, add3(RED_AT, M.RED_FLOWER_MOUTH));
// The bird perches on the stem below the flower head, facing the front flower; its beak tip at the flower's mouth.
const birdModel = M.sunbird();
const birdYaw = -48;
const birdTilt = axisAngle([0, 0, 1], 12);
const beakLocal = mulMV(mulMM(axisAngle([0, 1, 0], birdYaw), birdTilt), M.SUNBIRD_BEAK_TIP);
const birdFeetLocal = sub3(add3(RED_AT, M.RED_FLOWER_MOUTH), beakLocal);
const birdPrims = place(VISIT, birdModel, birdFeetLocal, birdYaw, birdTilt);
add('sunbird', 'visitors', birdPrims, { connects: ['red-flower'] });
const birdFeet = at(VISIT, birdFeetLocal);
// A short perch twig from the stem to the bird's feet.
const stemPoint = at(VISIT, add3(RED_AT, [0, birdFeetLocal[1] - 0.004, 0]));
redFlowerPerch(stemPoint, add3(birdFeet, [0, -0.0015, 0]));
function redFlowerPerch(a: V3, b: V3) {
  const p = parts.find((q) => q.id === 'red-flower')!;
  p.extra!.push(sweep([a, add3(a, sub3(b, a).map((x) => x * 0.6)), b], [0.0026, 0.0022, 0.002], 'tissue', { tint: M.C.stem, segments: 8, radial: 8 }));
}

const DUR_AT: V3 = [0.08, 0, -0.07];
holder(at(VISIT, add3(DUR_AT, [0.14, 0, -0.02])));
add('durian-flowers', 'visitors', place(VISIT, M.durianFlowers(), DUR_AT, 0));
// The bat hovers at the left of the flowers in side view, wings up, its muzzle at the first flower.
const durianCalyx = (i: number): V3 => {
  const [x, z, hang] = M.DURIAN_AT[i]!;
  return add3(DUR_AT, [x + 0.003, 0.25 - hang - 0.02, z + 0.004]);
};
const batYaw = 0;
const batTilt = axisAngle([0, 0, 1], 12);
const muzzleLocal = mulMV(batTilt, M.BAT_MUZZLE);
const batLocal = sub3(add3(durianCalyx(0), [-0.004, -0.012, 0.004]), muzzleLocal);
add('nectar-bat', 'visitors', place(VISIT, M.nectarBat(), batLocal, batYaw, batTilt), { connects: ['durian-flowers'] });
const batAt = at(VISIT, batLocal);

/* ========================================================== ④ fig */

const FIG_LOCAL: V3 = [0, 0.0, 0];
add('fig-cut', 'fig', place(FIG, M.figCut(), FIG_LOCAL, 0));
const figOpening = at(FIG, add3(FIG_LOCAL, M.FIG_OPENING));
const waspLocal = add3(FIG_LOCAL, add3(M.FIG_OPENING, [-0.016, 0.002, 0.01]));
add('fig-wasp', 'fig', place(FIG, M.figWasp(), waspLocal, -25, axisAngle([0, 0, 1], -28)), { connects: ['fig-cut'] });

/* ======================================================== ⑤ cells */

const CELL_Y = 0.2;
const maleAt: V3 = [-0.16, CELL_Y, 0];
const femaleAt: V3 = [-0.08, CELL_Y, 0];
const spermAt: V3 = [0.045, CELL_Y + 0.006, 0.01];
const eggAt: V3 = [0.145, CELL_Y, 0];
add('male-cell', 'cells', place(CELLS, M.maleCell(), maleAt), { connects: ['female-cell'], castShadow: false });
add('female-cell', 'cells', place(CELLS, M.femaleCell(), femaleAt), { castShadow: false });
add('sperm', 'cells', place(CELLS, M.sperm(), spermAt, 180), { connects: ['egg'], castShadow: false });
add('egg', 'cells', place(CELLS, M.egg(), eggAt), { castShadow: false });

/* ======================================================= ⑥ fruits */

// Local layout, left to right: angsana pod, sea almond (cut; the whole one floats in the sea strip behind), coconut half,
// green and cut chilli, ripe figs, rubber fruit and seeds, garden balsam pod.
const onTable = (ps: Prim[], local: readonly number[], s: Station = FRUITS): Prim[] => {
  // Shift so the lowest point rests on the table at `local`.
  const b = boundsOf(ps);
  const target = at(s, local);
  const d: V3 = [target[0] - b.centre[0], target[1] - b.min[1], target[2] - b.centre[2]];
  return ps.map((p) => ({ ...p, at: add3(p.at, d) }));
};
const plantCentre = (id: string, pick?: number[]) => {
  const ps = pick ? pick.map((i) => plantPrims(id)[i]!) : plantPrims(id);
  return boundsOf(ps).centre;
};
add('angsana-pod', 'fruits', onTable(reuse('winged-fruit', { anchor: plantCentre('winged-fruit'), to: [0, 0, 0], s: scaleFor(1.5, 1), m: mulMM(FRUITS.m, axisAngle([0, 1, 0], 20)), boost: 1.5, tints: { '#8e744a': '#a48b5c', '#7d6643': '#a48b5c' } }), [-0.21, 0, 0.05]));
const SEA_LOCAL: V3 = [-0.09, 0, -0.15];
const almondWhole = place(FRUITS, M.seaAlmond(), add3(SEA_LOCAL, [-0.06, 0.004, 0.005]), 15);
add('sea-almond', 'fruits', almondWhole);
add('sea-almond-cut', 'fruits', place(FRUITS, M.seaAlmondCut(), [-0.15, 0, 0.06], 10));
add('coconut', 'fruits', place(FRUITS, M.coconut(), [0.04, 0, -0.06], 75));
add('chilli-young', 'fruits', onTable(reuse('fruit-green', { anchor: plantCentre('fruit-green', [0, 2, 3]), to: [0, 0, 0], s: scaleFor(1, 1), m: mulMM(FRUITS.m, mulMM(axisAngle([0, 1, 0], 70), rotateOnto([0, -1, 0], [1, 0, 0]))), pick: [0, 2, 3], boost: 1.5 }), [0.12, 0, 0.085]));
add('chilli-cut', 'fruits', onTable(reuse('fruit-red-section', { anchor: plantCentre('fruit-red-section'), to: [0, 0, 0], s: scaleFor(2, 1), m: mulMM(FRUITS.m, axisAngle([0, 1, 0], -75)), boost: 1.3, tints: { '#e8dcc0': '#e2c66e' } }), [0.13, 0, 0.02]), { connects: ['chilli-young'] });
add('ripe-figs', 'fruits', place(FRUITS, M.ripeFigs(), [0.21, 0, 0.08], 15));
add('rubber-capsule', 'fruits', place(FRUITS, M.rubberCapsule(), [0.24, 0, -0.07], 0), { connects: ['rubber-seeds'] });
add('rubber-seeds', 'fruits', place(FRUITS, M.rubberSeeds(), [0.25, 0, -0.01], -10));
add('balsam-pod', 'fruits', place(FRUITS, M.balsamPod(), [0.31, 0, 0.04], 70));
const seaAt = at(FRUITS, SEA_LOCAL);

/* ===================================================== ⑦ seed inside */

add('bean-whole', 'seed-inside', place(SEED, M.beanWhole(), [-0.11, 0, 0.02], 10));
add('bean-cut', 'seed-inside', onTable(reuse('bean-seed', { anchor: plantCentre('bean-seed'), to: [0, 0, 0], s: scaleFor(10, 10), m: SEED.m, boost: 1.5, tints: { '#d8dca0': '#f3ecca' } }), [0, 0, 0.02], SEED));
add('bean-sprout', 'seed-inside', onTable(reuse('bean-sprouting', { anchor: plantCentre('bean-sprouting'), to: [0, 0, 0], s: scaleFor(5, 10), m: mulMM(SEED.m, axisAngle([0, 1, 0], 90)), boost: 1.5, tints: { '#e8dca6': '#efe8cf' } }), [0.12, 0, 0.03], SEED));

/* ====================================================== ⑧ the test */

// Day strip along the station's x; its marker and the half flag slide along it, 1 cm a day.
const STRIP_LOCAL: V3 = [-0.12, 0, -0.015];
const stripAxis = dirIn(STRIP, [1, 0, 0]);
add('day-strip', 'germination', place(STRIP, M.dayStrip(), STRIP_LOCAL));
const day0 = at(STRIP, STRIP_LOCAL);
add('day-marker', 'germination', [{ kind: 'cone', size: [0.0035, 0.008], at: add3(day0, dirIn(STRIP, [0, 0.0058, 0.0125])), rotation: eulerOf(mulMM(STRIP.m, axisAngle([1, 0, 0], -90))), color: 'token:signal' }]);
add('half-flag', 'germination', [
  sweep([add3(day0, dirIn(STRIP, [0, 0.002, -0.0125])), add3(day0, dirIn(STRIP, [0, 0.03, -0.0125]))], 0.0007, 'token:cold', { radial: 6, segments: 4 }),
  { kind: 'extrude', shape: [[0, 0], [0.014, -0.0045], [0, -0.009]], depth: 0.0008, at: add3(day0, dirIn(STRIP, [0.0004, 0.0295, -0.0125])), rotation: eulerOf(STRIP.m), color: 'token:cold' },
]);
add('towel-dish', 'germination', place(STRIP, M.towelDish(), [-0.04, 0, 0.085]));
// The seedling ×1 in a block of soil, seed leaves lifted above it.
add('bean-seedling-close', 'germination', place(STRIP, M.seedlingClose(), [0.1, 0, 0.0], -20));

// Furniture (household size, schematic) and the four cups.
const SILL_H = 0.07;
const sill = M.windowsill(SILL_H);
const cupboardM = M.cupboard();
const fridgeM = M.fridge();
const CUP_AT: Record<'a' | 'b' | 'd' | 'e', V3> = {
  a: at(SILL, [-0.08, SILL_H, 0.01]),
  b: at(SILL, [0.08, SILL_H, 0.01]),
  d: at(CUPBOARD, [0, 0.01, 0.0]),
  e: at(FRIDGE, [0, M.FRIDGE_SHELF, 0.02]),
};
const CUPS = ['a', 'b', 'd', 'e'] as const;
for (const k of CUPS) {
  const c = CUP_AT[k];
  add(`cup-${k}`, 'germination', [{ ...M.cupShell(), at: c }, { ...M.cotton(k === 'b' ? M.C.cottonDry : M.C.cotton), at: add3(c, [0, 0.002, 0]) }], { shell: true, connects: [`seeds-${k}`] });
}
for (const k of CUPS) {
  const c = CUP_AT[k];
  add(`seeds-${k}`, 'germination', [{ ...M.beanInCup(), at: add3(c, [0.012, 0.0157, 0]) }], { repeat: { count: 5, axis: [0, 1, 0], radius: 0.012 }, ...(k === 'a' || k === 'd' ? { connects: [`seedlings-${k}`] } : {}) });
}
for (const k of ['a', 'd'] as const) {
  const c = CUP_AT[k];
  const ps = M.seedlingInCup(k === 'd' ? 0.068 : 0.052).map((p) => ({ ...p, at: add3(p.at, c) }));
  add(`seedlings-${k}`, 'germination', ps, { repeat: { count: 5, axis: [0, 1, 0], radius: 0.012 } });
}
const ringAt = (k: 'a' | 'b' | 'd' | 'e', dy: number) => add3(CUP_AT[k], [0, dy, 0]);
add('pick-ring', 'germination', [torus(ringAt('a', 0.0015), 0.043, 0.0016, 'token:signal', { rotation: [90, 0, 0] })]);
const dashes: Prim[] = [];
for (let i = 0; i < 12; i++) {
  const a0 = i * 30 * DEG;
  const pts: V3[] = [0, 1, 2].map((j) => {
    const a = a0 + j * 9 * DEG;
    return add3(ringAt('a', 0.0045), [Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05]);
  });
  dashes.push(sweep(pts, 0.0014, 'token:cold', { radial: 6, segments: 6 }));
}
add('ref-ring', 'germination', dashes);

/* ========================================================= context */

add('table', undefined, [
  lathe([0, 0, 0], tableProfile(R_TABLE), 'wood', { tint: M.C.table, segments: 96 }),
  ...blocks.map((b) => ({ kind: 'bevelBox', size: [0.05, 0.03, 0.05], bevel: 0.004, at: add3(b, [0, 0.015, 0]), color: 'wood', tint: M.C.table })),
  // The small table for the fern and the moss, outside the ring.
  lathe(SIDE.o, tableProfile(0.3), 'wood', { tint: M.C.table, segments: 64 }),
], { context: true, clip: false });
add('sea-water', undefined, [{ kind: 'box', size: [0.3, 0.012, 0.1], at: add3(seaAt, [0, 0.006, 0]), rotation: eulerOf(FRUITS.m), color: 'membrane', tint: M.C.water }], { context: true });
add('windowsill', undefined, place(SILL, sill, [0, 0, -0.03]), { context: true });
add('cupboard', undefined, place(CUPBOARD, cupboardM, [0, 0, -0.02]), { context: true, shell: true });
add('fridge', undefined, place(FRIDGE, fridgeM, [0, 0, -0.02]), { context: true, shell: true });

/* =========================================================== flows */

const bezier = (a: V3, b: V3, c: V3, n = 10): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push(r3([0, 1, 2].map((k) => (1 - t) * (1 - t) * a[k]! + 2 * (1 - t) * t * b[k]! + t * t * c[k]!)));
  }
  return out;
};
const sorusTop = boundsOf(parts.find((p) => p.id === 'sorus-close')!.extra ? prims({ primitive: parts.find((p) => p.id === 'sorus-close')!.primitive, extra: parts.find((p) => p.id === 'sorus-close')!.extra! }) : []).centre;
const sporePaths = [-1, 0, 1].map((k, i) => ({
  id: `drift-${i + 1}`,
  path: bezier(add3(sorusTop, dirIn(SIDE, [k * 0.02, 0.006, k * 0.01])), add3(sorusTop, dirIn(SIDE, [k * 0.05, 0.12, 0.02 + k * 0.02])), add3(sorusTop, dirIn(SIDE, [k * 0.12 + 0.03, 0.22, 0.04 - k * 0.03])), 12),
}));
const anthers = stamenCentre;
const stigma = boundsOf(pistil).max;
const birdBeak = mouthWorld;
const secondTube = at(VISIT, add3(RED_AT, [0.012, 0.205, -0.006]));
const durianCentre = (i: number) => at(VISIT, add3(durianCalyx(i), [0, -0.012, 0]));
const pollenPaths = [
  { id: 'bee', path: [anthers, add3(anthers, faceWorld.map((x) => x * 0.03)), add3(BEE_AT, [0, 0.01, 0]), add3(BEE_AT, dirIn(FLOWER, [-0.04, 0.05, 0.02])), add3(stigma, faceWorld.map((x) => x * 0.04)), stigma] as V3[] },
  { id: 'bird', path: [add3(birdBeak, [0, -0.002, 0]), add3(birdFeet, [0.004, 0.035, 0.004]), add3(secondTube, [0.02, 0.03, 0.02]), secondTube] as V3[] },
  { id: 'bat', path: [durianCentre(0), add3(at(VISIT, add3(batLocal, mulMV(batTilt, [0.06, 0.012, 0]))), [0, 0.006, 0]), add3(durianCentre(1), dirIn(VISIT, [-0.01, 0.025, 0.02])), durianCentre(1)] as V3[] },
  { id: 'wasp', path: [add3(figOpening, dirIn(FIG, [-0.02, 0.03, 0.02])), add3(figOpening, [0, 0.006, 0]), add3(figOpening, [0, -0.02, 0]), add3(figOpening, [0, -0.045, 0])] as V3[] },
];
const angsana = boundsOf(parts.find((p) => p.id === 'angsana-pod')!.primitive ? [parts.find((p) => p.id === 'angsana-pod')!.primitive, ...(parts.find((p) => p.id === 'angsana-pod')!.extra ?? [])] : []).centre;
const windPath: V3[] = [];
for (let i = 0; i <= 14; i++) {
  const t = i / 14;
  windPath.push(add3(angsana, dirIn(FRUITS, [-0.26 * t + 0.03 * Math.sin(t * 9), 0.02 + 0.24 * Math.sin(t * 1.4) * (1 - 0.3 * t), -0.04 * t])));
}
const waterPath: V3[] = [];
for (let i = 0; i <= 12; i++) {
  const t = i / 12;
  waterPath.push(add3(seaAt, dirIn(FRUITS, [-0.12 + 0.26 * t, 0.014 + 0.003 * Math.sin(t * 12), 0.02 * Math.sin(t * 5)])));
}
const rubberAt = at(FRUITS, [0.24, 0.03, -0.07]);
const balsamAt = at(FRUITS, [0.31, 0.008, 0.04]);
const burst = (from: V3, local: readonly number[], h: number) => {
  const to = add3(from, dirIn(FRUITS, local));
  const mid = add3(from, add3(dirIn(FRUITS, local.map((x) => x * 0.5)), [0, h, 0]));
  return bezier(from, mid, add3(to, [0, -from[1] + 0.004, 0]), 10);
};
const burstPaths = [
  { id: 'rubber-1', path: burst(rubberAt, [-0.12, 0, 0.1], 0.16) },
  { id: 'rubber-2', path: burst(rubberAt, [0.06, 0, 0.16], 0.2) },
  { id: 'rubber-3', path: burst(rubberAt, [0.18, 0, 0.04], 0.14) },
  { id: 'balsam-1', path: burst(balsamAt, [0.06, 0, 0.08], 0.05) },
  { id: 'balsam-2', path: burst(balsamAt, [-0.05, 0, 0.1], 0.04) },
];
const cyclePath: V3[] = [];
for (let i = 0; i <= 64; i++) cyclePath.push(polar((i / 64) * 360, RING, 0.004));
cyclePath[64] = cyclePath[0]!;

const flows = [
  { id: 'spores-out', group: 'spore-drift', paths: sporePaths, speed: 0.05, color: 'token:ink-3', count: 140, size: 0.14, ends: 'fade', spread: 0.004, clip: false },
  { id: 'pollen', group: 'pollination', path: pollenPaths[0]!.path, speed: 0.05, color: 'token:cut', count: 50, size: 0.3, ends: 'fade', spread: 0.0025, parts: ['stamens', 'bee', 'pistil'] },
  { id: 'pollen-carried', group: 'visitors', paths: pollenPaths.slice(1), speed: 0.05, color: 'token:cut', count: 120, size: 0.18, ends: 'fade', spread: 0.0018 },
  { id: 'wind-drift', group: 'seed-travel', path: windPath, speed: 0.12, color: 'token:neutral', count: 60, size: 0.3, ends: 'fade', spread: 0.006, whenRun: false, clip: false },
  { id: 'water-drift', group: 'seed-travel', path: waterPath, speed: 0.04, color: 'token:cold', count: 60, size: 0.3, ends: 'fade', spread: 0.006, whenRun: false },
  { id: 'seed-burst', group: 'seed-travel', paths: burstPaths, speed: 0.16, color: 'token:neutral', count: 90, size: 0.3, ends: 'fade', spread: 0.002, whenRun: false, clip: false },
  { id: 'cycle-loop', group: 'cycle', path: cyclePath, speed: 0.05, color: 'token:loop', count: 220, size: 0.35, ends: 'open', spread: 0.003 },
];

/* ====================================================== animations */

const turnAbout = (axis: readonly number[], deg: number): V3 => eulerOf(axisAngle(axis, deg));
const landing = sub3(add3(stamenCentre, faceWorld.map((x) => x * 0.05)), BEE_AT).map((x) => n5(x * 0.75)) as V3;
const birdSide = dirIn(VISIT, mulMV(axisAngle([0, 1, 0], birdYaw), [0, 0, 1]));
const batAxis = dirIn(VISIT, mulMV(axisAngle([0, 1, 0], batYaw), [1, 0, 0]));
const animations = [
  {
    id: 'bee-visit', target: 'bee', kind: 'sequence', loop: true,
    keys: [
      { t: 0, offset: [0, 0.02, 0] },
      { t: 1.4, offset: [0, 0, 0] },
      { t: 2.8, offset: landing },
      { t: 4.4, offset: landing },
      { t: 5.6, offset: [0, 0.03, 0] },
      { t: 7, offset: [0, 0.02, 0] },
    ],
  },
  {
    id: 'sunbird-sip', target: 'sunbird', kind: 'sequence', loop: true, pivot: birdFeet,
    keys: [
      { t: 0, rotation: [0, 0, 0] },
      { t: 0.8, rotation: turnAbout(birdSide, -9) },
      { t: 2.3, rotation: turnAbout(birdSide, -9) },
      { t: 3.1, rotation: [0, 0, 0] },
      { t: 4, rotation: [0, 0, 0] },
    ],
  },
  { id: 'bat-hover', target: 'nectar-bat', kind: 'oscillate', axis: batAxis, amplitude: 7, hz: 1.2, pivot: batAt },
  {
    id: 'wasp-enter', target: 'fig-wasp', kind: 'sequence', loop: true,
    keys: [
      { t: 0, offset: [0, 0, 0] },
      { t: 1.6, offset: r3(sub3(figOpening, at(FIG, waspLocal)).map((x) => x * 0.7)) },
      { t: 3.2, offset: r3(sub3(figOpening, at(FIG, waspLocal)).map((x) => x * 0.7)) },
      { t: 5, offset: [0, 0, 0] },
    ],
  },
  { id: 'sea-almond-bob', target: 'sea-almond', kind: 'oscillate', axis: dirIn(FRUITS, [1, 0, 0]), amplitude: 4, hz: 0.4, pivot: add3(seaAt, [0, 0.006, 0]) },
];

/* =========================================================== poses */

const forward = (s: Station, d: number, up: number): V3 => r3(add3(dirIn(s, [0, 0, d]), [0, up, 0]));
const sectionPivot = sectionAt;
const femaleW = at(CELLS, femaleAt);
const maleW = at(CELLS, maleAt);
const eggW = at(CELLS, eggAt);
const spermW = at(CELLS, spermAt);
const spermToEgg = sub3(add3(eggW, dirIn(CELLS, [-0.045, 0.004, 0.006])), spermW);
const ringPose = (k: 'a' | 'b' | 'd' | 'e', dy: number) => r3(sub3(ringAt(k, dy), ringAt('a', dy)));
const poses: Record<string, Record<string, unknown>> = {
  'flower-open': {
    'flower-section': { pivot: sectionPivot, rotation: turnAbout(dirIn(FLOWER, [1, 0, 0]), -16), offset: forward(FLOWER, 0.05, 0) },
    ovules: { pivot: sectionPivot, rotation: turnAbout(dirIn(FLOWER, [1, 0, 0]), -16), offset: forward(FLOWER, 0.05, 0) },
    duration: 1.0,
  },
  'cells-fused': {
    'male-cell': { pivot: maleW, scale: 0.6, offset: sub3(add3(femaleW, dirIn(CELLS, [0.008, -0.006, 0.026])), maleW) },
    sperm: { pivot: spermW, offset: spermToEgg },
    duration: 1.4,
  },
  'capsule-burst': {
    'rubber-seeds': { pivot: at(FRUITS, [0.25, 0.008, -0.01]), rotation: turnAbout([0, 1, 0], 40), offset: forward(FRUITS, 0.11, 0) },
    duration: 0.6,
  },
  'angsana-front': { 'angsana-pod': { offset: forward(FRUITS, 0.07, 0.012) }, duration: 0.6 },
  'sea-almond-front': {
    'sea-almond': { offset: r3(dirIn(FRUITS, [0.06, 0, 0])) },
    'sea-almond-cut': { offset: forward(FRUITS, 0.06, 0.008) },
    duration: 0.8,
  },
  'coconut-front': { coconut: { offset: forward(FRUITS, 0.06, 0.01) }, duration: 0.6 },
  'chilli-front': { 'chilli-cut': { offset: forward(FRUITS, 0.07, 0.01) }, duration: 0.6 },
  'fig-front': { 'ripe-figs': { offset: forward(FRUITS, 0.06, 0.01) }, duration: 0.6 },
  ...Object.fromEntries(CUPS.map((k) => [`pick-${k}`, { 'pick-ring': { offset: ringPose(k, 0.0015) }, duration: 0.5 }])),
  ...Object.fromEntries(CUPS.map((k) => [`ref-${k}`, { 'ref-ring': { offset: ringPose(k, 0.0045) }, duration: 0.5 }])),
};

/* ===================================================== split fruits */

// The rubber fruit after it has burst and the balsam pod after it has split: shown in place of the closed fruit (a `visible`
// binding), at the front of the station (docs/41 §9.1-3: a part takes one pose, so the opened fruit is its own part).
const valves: Prim[] = [];
const vAt = at(FRUITS, [0.24, 0, 0.0]);
for (let k = 0; k < 3; k++) {
  const a = k * 120 + 30;
  const out = dirIn(FRUITS, [Math.cos(a * DEG), 0, -Math.sin(a * DEG)]);
  const c = add3(vAt, add3(out.map((x) => x * 0.03), [0, 0.008, 0]));
  valves.push(lathe(c, [[0.0002, -0.006], [0.012, -0.004], [0.017, 0.002], [0.016, 0.006], [0.0125, 0.0035], [0.008, -0.0005], [0.0002, -0.002]], 'wood', { tint: M.C.rubber, segments: 16, arc: 140, rotation: orient(out, [0, 1, 0]).map((v, i) => (i === 2 ? v + 25 : v)) as V3 }));
}
add('rubber-valves', 'fruits', valves, { connects: ['rubber-seeds'] });
const bAt = at(FRUITS, [0.31, 0, 0.1]);
const coils: Prim[] = [];
for (let k = 0; k < 5; k++) {
  const a = k * 72 + 10;
  const o = dirIn(FRUITS, [Math.cos(a * DEG), 0, -Math.sin(a * DEG)]);
  const pts: V3[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * 1.6 * Math.PI;
    const rr = 0.007 * (1 - i / 18);
    pts.push(add3(bAt, add3(o.map((x) => x * (0.004 + 0.006 * (i / 10))), [o[2] * rr * Math.sin(t), 0.004 + rr * (1 - Math.cos(t)), -o[0] * rr * Math.sin(t)])));
  }
  coils.push(sweep(pts, 0.0016, 'fabric', { tint: M.C.balsam, section: { flat: 0.4 }, up: [0, 1, 0], radial: 6, segments: 24 }));
}
for (let i = 0; i < 6; i++) {
  const a = i * 60 + 25;
  coils.push(sphere(add3(bAt, dirIn(FRUITS, [Math.cos(a * DEG) * (0.03 + (i % 2) * 0.015), 0.0018, -Math.sin(a * DEG) * (0.03 + (i % 2) * 0.015)])), 0.0018, 'tissue', { tint: M.C.balsamSeed }));
}
add('balsam-valves', 'fruits', coils);

/* ============================================================== sim */

const label = (id: keyof typeof CONTROL_TEXT) => CONTROL_TEXT[id].label;
const state = (id: string, from: string) => ({ id, label: OUTPUT_TEXT[id]!, kind: 'state', from, states: STATE_TEXT[id]! });
const num = (id: string, from: string, unit?: string, decimals?: number) => ({ id, label: OUTPUT_TEXT[id]!, from, ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) });
const FRUIT_IDS = ['angsana', 'sea-almond', 'coconut', 'chilli', 'fig', 'rubber', 'balsam'] as const;
const cupOptions = CUPS.map((id) => ({ id, label: CONTROL_TEXT.cup.options[id] }));
const sim = {
  kind: 'seeds',
  controls: [
    { id: 'fruit', kind: 'choice', default: 'angsana', label: label('fruit'), options: FRUIT_IDS.map((id) => ({ id, label: CONTROL_TEXT.fruit.options[id] })) },
    { id: 'temp', kind: 'step', values: [14, 17, 20], default: 20, unit: '°C', label: label('temp') },
    { id: 'count-day', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], default: 0, unit: 'd', label: label('count-day') },
    { id: 'cup', kind: 'choice', default: 'a', label: label('cup'), options: cupOptions },
    { id: 'against', kind: 'choice', default: 'a', label: label('against'), options: CUPS.map((id) => ({ id, label: CONTROL_TEXT.against.options[id] })) },
    { id: 'day', kind: 'step', values: [0, 7], default: 0, unit: 'd', label: label('day') },
  ],
  outputs: [
    state('method', 'dispersal:method'),
    state('feature', 'dispersal:feature'),
    num('half-day', 'timing:median', 'd', 1),
    state('half', 'timing:half'),
    num('temp-now', 'control:temp', '°C', 0),
    state('cup-result', 'cups:result'),
    state('against-result', 'cups:against-result'),
    state('changed', 'cups:changed'),
    state('seedlings', 'cups:seedlings'),
    num('day-now', 'control:day', 'd', 0),
    ...CUPS.map((k) => num(`grown-${k}`, `cup:${k}:grown`)),
    num('pale-a', 'cup:a:pale'),
    num('pale-d', 'cup:d:pale'),
  ],
  bind: [
    { control: 'fruit', part: 'angsana-pod', pose: { angsana: 'angsana-front' } },
    { control: 'fruit', part: ['sea-almond', 'sea-almond-cut'], pose: { 'sea-almond': 'sea-almond-front' } },
    { control: 'fruit', part: 'coconut', pose: { coconut: 'coconut-front' } },
    { control: 'fruit', part: 'chilli-cut', pose: { chilli: 'chilli-front' } },
    { control: 'fruit', part: 'ripe-figs', pose: { fig: 'fig-front' } },
    { control: 'fruit', part: 'rubber-seeds', pose: { rubber: 'capsule-burst' } },
    { control: 'fruit', part: 'rubber-capsule', visible: { ne: 'rubber' } },
    { control: 'fruit', part: 'rubber-valves', visible: { eq: 'rubber' } },
    { control: 'fruit', part: 'balsam-pod', visible: { ne: 'balsam' } },
    { control: 'fruit', part: 'balsam-valves', visible: { eq: 'balsam' } },
    { output: 'method', flow: 'wind-drift', visible: { eq: 'wind' } },
    { output: 'method', flow: 'water-drift', visible: { eq: 'water' } },
    { output: 'method', flow: 'seed-burst', visible: { eq: 'splitting' } },
    { control: 'count-day', part: 'day-marker', offset: { axis: stripAxis, per: 0.01, origin: 0 } },
    { output: 'half-day', part: 'half-flag', offset: { axis: stripAxis, per: 0.01, origin: 0 } },
    ...CUPS.map((k) => ({ output: `grown-${k}`, part: `seeds-${k}`, visible: { eq: 0 } })),
    { output: 'grown-a', part: 'seedlings-a', visible: true },
    { output: 'grown-d', part: 'seedlings-d', visible: true },
    { output: 'pale-a', part: 'seedlings-a', tint: { color: 'token:seedling-pale', full: 1, max: 0.85 } },
    { output: 'pale-d', part: 'seedlings-d', tint: { color: 'token:seedling-pale', full: 1, max: 0.85 } },
    { control: 'cup', part: 'pick-ring', pose: Object.fromEntries(CUPS.map((k) => [k, `pick-${k}`])) },
    { control: 'against', part: 'ref-ring', pose: Object.fromEntries(CUPS.map((k) => [k, `ref-${k}`])) },
  ],
  seeds: {
    dispersal: {
      fruit: 'fruit',
      fruits: {
        angsana: { method: 'wind', feature: 'wing' },
        'sea-almond': { method: 'water', feature: 'floats' },
        coconut: { method: 'water', feature: 'floats' },
        chilli: { method: 'animals', feature: 'eaten' },
        fig: { method: 'animals', feature: 'eaten' },
        rubber: { method: 'splitting', feature: 'bursts' },
        balsam: { method: 'splitting', feature: 'bursts' },
      },
    },
    timing: { temp: 'temp', day: 'count-day', medians: { '14': 9.4, '17': 6.5, '20': 4.3 } },
    cups: {
      cup: 'cup',
      against: 'against',
      day: 'day',
      after: 7,
      places: { windowsill: { warm: true, light: true }, cupboard: { warm: true, light: false }, fridge: { warm: false, light: false } },
      set: {
        a: { water: true, air: true, place: 'windowsill' },
        b: { water: false, air: true, place: 'windowsill' },
        d: { water: true, air: true, place: 'cupboard' },
        e: { water: true, air: true, place: 'fridge' },
      },
    },
  },
};

/* ========================================================== cameras */


/* ========================================================= assemble */

const GROUPS: { id: string; color: string; card?: false; scale?: { unit: string; magnification: number } }[] = [
  { id: 'fern', color: 'token:ink-2', card: false, scale: { unit: 'cm', magnification: 0.25 } },
  { id: 'spore-close', color: 'token:ink-3', card: false },
  { id: 'flower-parts', color: 'token:hot', scale: { unit: 'mm', magnification: 20 } },
  { id: 'pollen-close', color: 'token:cut', card: false },
  { id: 'visitors', color: 'token:accent-2', scale: { unit: 'cm', magnification: 1 } },
  { id: 'fig', color: 'token:accent-2', card: false },
  { id: 'cells', color: 'token:signal', card: false },
  { id: 'fruits', color: 'token:food', scale: { unit: 'cm', magnification: 1 } },
  { id: 'seed-inside', color: 'token:ink-3', card: false, scale: { unit: 'mm', magnification: 10 } },
  { id: 'germination', color: 'token:cold', scale: { unit: 'cm', magnification: 1 } },
  { id: 'spore-drift', color: 'token:ink-3' },
  { id: 'pollination', color: 'token:cut' },
  { id: 'seed-travel', color: 'token:neutral' },
  { id: 'cycle', color: 'token:loop' },
];
const groups = GROUPS.map((g) => ({ id: g.id, name: GROUP_TEXT[g.id]!, color: g.color, ...(g.card === false ? { card: false } : {}), ...(g.scale ? { scale: g.scale } : {}) }));

const outParts = parts.map((p) => {
  const tx = PART_TEXT[p.id];
  if (!tx) throw new Error(`no text for part ${p.id}`);
  const { id, group, primitive, extra, ...rest } = p;
  if ((extra?.length ?? 0) > 32) throw new Error(`${id}: ${extra!.length} extra primitives (max 32)`);
  return { id, name: tx.name, ...(group ? { group } : {}), summary: tx.summary, detail: tx.detail, primitive, ...(extra?.length ? { extra } : {}), ...rest };
});
const missing = Object.keys(PART_TEXT).filter((id) => !parts.some((p) => p.id === id));
if (missing.length) throw new Error(`text for parts that are not built: ${missing.join(', ')}`);
// Number the parts by group (the list order), context last.
const order = GROUPS.map((g) => g.id);
outParts.sort((a, b) => {
  const ca = Number(Boolean((a as { context?: boolean }).context));
  const cb = Number(Boolean((b as { context?: boolean }).context));
  if (ca !== cb) return ca - cb;
  return order.indexOf((a as { group?: string }).group ?? '') - order.indexOf((b as { group?: string }).group ?? '');
});

const data = {
  parts: outParts,
  groups,
  flows,
  animations,
  poses,
  views: {
    assembled: { camera: HERO },
    exploded: { camera: HERO },
    section: { plane: 'xz' },
    cover: COVER,
  },
  presets: Object.entries(PRESET_CAMERAS).map(([id, camera]) => ({ id, label: PRESET_TEXT[id]!, camera })),
  spec: SPEC_TEXT,
  telemetry: [
    { key: TELEMETRY_TEXT['day-now'], unit: 'd', follow: 'day-now', scope: 'observe' },
    { key: TELEMETRY_TEXT['temp-now'], unit: '°C', follow: 'temp-now', scope: 'observe' },
    { key: TELEMETRY_TEXT['half-day'], unit: 'd', follow: 'half-day', scope: 'observe' },
  ],
  sim,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
const ctx = outParts.filter((p) => (p as { context?: boolean }).context).length;
console.log(`flower-and-seed parts.json: ${outParts.length - ctx} parts + ${ctx} context, ${groups.length} groups, ${flows.length} flows, ${Object.keys(poses).length} poses, ${sim.bind.length} bindings`);
