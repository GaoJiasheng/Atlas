/**
 * `pnpm tsx scripts/geo/living-things/build-parts.ts` — writes
 * src/content/topics/living-things/data/parts.json (docs/38 §3–§4).
 *
 * A classroom bench (1 scene unit = 1 m, bench top y = 0, +Z towards the
 * viewer): a specimen case of 9 × 4 compartments holding 32 model specimens,
 * not to scale with each other (each fits a 7 cm cell); a sorting tray whose
 * felt pads make two, three or six groups; a pad for "none of the six" beside
 * the case; and, in the back left corner, a microscope beside a plinth of
 * yeast cells and bacteria drawn 2,000 times life size. Where each specimen
 * goes is the sort model's output (sort-data.ts), never written here.
 * Texts come from ./text.ts. Prints each specimen's footprint and height, and
 * fails if one does not fit its cell.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { primitiveSchema } from '../../../src/engines/space-scene/schema';
import { partBounds, partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { r3, place, scaleModel, type Model, type Prim, type V3 } from './kit';
import { PAD_IDS, SIM, SPECIMENS, SPECIMEN_IDS } from './sort-data';
import { asianToad, beetle, dolphin, fruitBat, grasshopper, guppy, hawksbillTurtle, houseGecko, javanMyna, mudskipper, pangolin, penguin, plantainSquirrel, python, shark, snakehead, spider, treeFrog } from './specimens/animals';
import { bacteriaDish, bracketFungus, mouldyBread, mushroom, yeast } from './specimens/fungi-bacteria';
import { bacteriaCells, bench, caseCell, cellPlinth, LAYOUTS, MAGNIFICATION, microscope, padPrim, PLINTH, sortingTray, specimenCase, yeastCells } from './specimens/lab';
import { pebble, plasticFlower, toyCar } from './specimens/non-living';
import { birdsNestFern, chilliSeedling, ixora, moss, rhuSapling, staghornFern } from './specimens/plants';
import { GROUP_TEXT, PART_TEXT, PRESET_TEXT, SPEC_TEXT, TELEMETRY_TEXT } from './text';

const OUT = join(import.meta.dirname, '../../../src/content/topics/living-things/data/parts.json');

interface Part {
  id: string;
  group?: string;
  primitive: Prim;
  extra?: Prim[];
  explode?: { dir: V3; dist: number };
  context?: boolean;
  castShadow?: boolean;
  clip?: boolean;
}

/** Specimen models in case order (§3.2 #1–#32). */
const MODELS: Record<string, () => Model> = {
  'toy-car': toyCar,
  pebble,
  'plastic-flower': plasticFlower,
  ixora,
  'chilli-seedling': chilliSeedling,
  'rhu-sapling': rhuSapling,
  'birds-nest-fern': birdsNestFern,
  'staghorn-fern': staghornFern,
  moss,
  mushroom,
  'bracket-fungus': bracketFungus,
  'mouldy-bread': mouldyBread,
  yeast,
  'bacteria-dish': bacteriaDish,
  grasshopper,
  beetle,
  spider,
  'javan-myna': javanMyna,
  penguin,
  'plantain-squirrel': plantainSquirrel,
  'fruit-bat': fruitBat,
  dolphin,
  pangolin,
  snakehead,
  guppy,
  mudskipper,
  shark,
  'tree-frog': treeFrog,
  'asian-toad': asianToad,
  'house-gecko': houseGecko,
  python,
  'hawksbill-turtle': hawksbillTurtle,
};

/** The part group (LAYERS) of each true group of the sort model. */
const PART_GROUP: Record<string, string> = {
  'non-living': 'non-living',
  flowering: 'plants',
  'non-flowering': 'plants',
  fungus: 'fungi',
  bacteria: 'bacteria',
  insect: 'insects',
  bird: 'birds',
  mammal: 'mammals',
  fish: 'fish',
  amphibian: 'amphibians',
  reptile: 'reptiles',
  none: 'other-animals',
};

const REACH = 0.036;
const parts: Part[] = [];
const report: string[] = [];
let bad = false;
const box = (p: { primitive: Prim; extra?: Prim[] }) =>
  partBounds({ primitive: primitiveSchema.parse(p.primitive), extra: p.extra?.map((e) => primitiveSchema.parse(e)) } as never)!;

const missingModel = SPECIMEN_IDS.filter((id) => !MODELS[id]);
if (missingModel.length) throw new Error(`no model for ${missingModel.join(', ')}`);
for (const [i, id] of SPECIMEN_IDS.entries()) {
  // A model that reaches further than 3.6 cm from its home is scaled down to fit (§3.2: 8 cm pitch, about 1 cm apart).
  const reachOf = (m: Model) => {
    const bb = box(m);
    const [hx, , hz] = m.primitive.at;
    return Math.max(bb.max[0] - hx, hx - bb.min[0], bb.max[2] - hz, hz - bb.min[2]);
  };
  const drawn = MODELS[id]!();
  const fit = Math.min(1, REACH / reachOf(drawn));
  const raw = fit < 1 ? scaleModel(drawn, fit) : drawn;
  // Main primitive over the cell centre (the model's home), bottom on the cell floor.
  const local = place(raw, [-raw.primitive.at[0], -box(raw).min[1], -raw.primitive.at[2]]);
  const b = box(local);
  const reach = reachOf(local);
  const h = b.max[1] - b.min[1];
  const slots = partMaterialSlots({ primitive: primitiveSchema.parse(local.primitive), extra: local.extra.map((e) => primitiveSchema.parse(e)) } as never).length;
  // §3.2: within 3.7 cm of its home in x and z (8 cm grid pitch, 1 cm apart at the closest) and at most 12 cm high.
  const fits = reach <= REACH + 2e-4 && h <= 0.12;
  if (!fits) bad = true;
  report.push(
    `${String(i + 1).padStart(2)} ${id.padEnd(18)} ${((b.max[0] - b.min[0]) * 100).toFixed(1)} × ${((b.max[2] - b.min[2]) * 100).toFixed(1)} × ${(h * 100).toFixed(1)} cm  reach ${(reach * 100).toFixed(2)} cm${fit < 1 ? ` (drawn ×${fit.toFixed(2)})` : ''}  ${slots} slots${fits ? '' : '  <-- does not fit its cell'}`,
  );
  const placed = place(local, caseCell(i + 1));
  parts.push({ id, group: PART_GROUP[SPECIMENS[id]!.group]!, primitive: placed.primitive, ...(placed.extra.length ? { extra: placed.extra } : {}), explode: { dir: [0, 1, 0], dist: 0.04 }, castShadow: false });
}

parts.push({ id: 'yeast-cells', group: 'magnified', ...yeastCells(), castShadow: false });
parts.push({ id: 'bacteria-cells', group: 'magnified', ...bacteriaCells(), castShadow: false });
parts.push({ id: 'microscope', group: 'tray', ...microscope(), explode: { dir: [0, 1, 0], dist: 0.04 } });
for (const layout of Object.values(LAYOUTS)) {
  for (const g of Object.values(layout)) parts.push({ id: g.pad, group: 'tray', primitive: padPrim(g), castShadow: false });
}
const missingPads = PAD_IDS.filter((id) => !parts.some((p) => p.id === id));
if (missingPads.length) throw new Error(`pads not built: ${missingPads.join(', ')}`);

parts.push({ id: 'bench', context: true, clip: false, ...bench() });
parts.push({ id: 'specimen-case', context: true, clip: false, ...specimenCase() });
parts.push({ id: 'sorting-tray', context: true, clip: false, ...sortingTray() });
parts.push({ id: 'cell-plinth', group: 'magnified', context: true, clip: false, primitive: cellPlinth() });

/* ========================================================== presets */

const cam = (position: readonly number[], target: readonly number[], fov = 30) => ({ position: r3(position), target: r3(target), fov });
const presets = [
  { id: 'case-view', camera: cam([0.05, 0.9, 0.5], [0.0, 0.0, -0.32], 30) },
  { id: 'tray-view', camera: cam([0.4, 1.1, 1.5], [0.0, 0.0, 0.02], 30) },
  { id: 'back-row', camera: cam([0.08, 0.72, 0.72], [0.0, 0.0, -0.1], 30) },
  { id: 'front-row', camera: cam([0.1, 0.55, 0.95], [0.0, 0.0, 0.22], 30) },
  { id: 'lens-view', camera: cam([PLINTH[0] + 0.02, 0.36, PLINTH[2] + 0.28], [PLINTH[0], 0.02, PLINTH[2]], 28) },
];

/* ========================================================= assemble */

const groups = [
  { id: 'non-living', color: 'token:ink-2' },
  { id: 'plants', color: 'token:holder-8' },
  { id: 'fungi', color: 'token:accent-3' },
  { id: 'bacteria', color: 'token:holder-7' },
  { id: 'insects', color: 'token:holder-5' },
  { id: 'birds', color: 'token:holder-1' },
  { id: 'mammals', color: 'token:holder-3' },
  { id: 'fish', color: 'token:holder-6' },
  { id: 'amphibians', color: 'token:holder-4' },
  { id: 'reptiles', color: 'token:accent-1' },
  { id: 'other-animals', color: 'token:neutral' },
  { id: 'tray', color: 'token:ink-3', card: false },
  { id: 'magnified', color: 'token:accent-2', card: false, scale: { unit: 'um', magnification: MAGNIFICATION } },
].map((g) => ({ id: g.id, name: GROUP_TEXT[g.id]!, color: g.color, ...(g.card === false ? { card: false } : {}), ...(g.scale ? { scale: g.scale } : {}) }));

const outParts = parts.map((p) => {
  const tx = PART_TEXT[p.id];
  if (!tx) throw new Error(`no text for part ${p.id}`);
  const { id, group, primitive, extra, ...rest } = p;
  if ((extra?.length ?? 0) > 32) throw new Error(`${id}: ${extra!.length} extra primitives (max 32)`);
  return { id, name: tx.name, ...(group ? { group } : {}), summary: tx.summary, detail: tx.detail, primitive, ...(extra?.length ? { extra } : {}), ...rest };
});
const missing = Object.keys(PART_TEXT).filter((id) => !parts.some((p) => p.id === id));
if (missing.length) throw new Error(`text for parts that are not built: ${missing.join(', ')}`);
for (const [id, tx] of Object.entries(PART_TEXT)) {
  if (tx.summary.en.length > 60 || tx.summary.zh.length > 60) throw new Error(`${id}: summary longer than 60 characters`);
}

const hero = cam([0.55, 0.9, 1.15], [0.02, 0.0, -0.05], 30);
const data = {
  parts: outParts,
  groups,
  views: {
    assembled: { camera: hero },
    exploded: { camera: cam([1.0, 1.25, 1.95], [0.0, 0.04, -0.08], 30) },
    section: { plane: 'xz' },
    cover: cam([0.42, 0.66, 0.42], [0.0, 0.0, -0.3], 30),
  },
  presets: presets.map((p) => ({ id: p.id, label: PRESET_TEXT[p.id]!, camera: p.camera })),
  spec: SPEC_TEXT,
  telemetry: [
    { key: TELEMETRY_TEXT['on-tray'], unit: '', follow: 'on-tray' },
    { key: TELEMETRY_TEXT.abc, unit: '', follow: ['count-a', 'count-b', 'count-c'] },
    { key: TELEMETRY_TEXT.def, unit: '', follow: ['count-d', 'count-e', 'count-f'] },
    { key: TELEMETRY_TEXT.ux, unit: '', follow: ['count-u', 'count-x'] },
    { key: TELEMETRY_TEXT.wrong, unit: '', follow: 'wrong', scope: 'observe' },
    { key: TELEMETRY_TEXT.kinds, unit: '', follow: ['kinds-a', 'kinds-b'], scope: 'observe' },
  ],
  sim: SIM,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
console.log(report.join('\n'));
const ctx = outParts.filter((p) => (p as { context?: boolean }).context).length;
console.log(`living-things parts.json: ${outParts.length - ctx} parts + ${ctx} context`);
if (bad) {
  console.error('some specimens do not fit their cells (see above)');
  process.exitCode = 1;
}
