/**
 * `pnpm tsx scripts/geo/heart-and-lungs/build-parts.ts` — writes
 * src/content/topics/heart-and-lungs/data/parts.json (docs/40 §3–§4).
 *
 * The body is public/models/heart-and-lungs.glb (Z-Anatomy, CC BY-SA 4.0;
 * scripts/anatomy/heart-lungs): one adult male reference body, umbilicus at the
 * origin, metres, +Y up, +Z forward, the body's left = +X. The pivots of the
 * breathing animations come from landmarks.json and the paths of the body's
 * sixteen flows from routes.json (both CC BY-SA 4.0 with the glb). Beside the
 * body stands a side table of procedural teaching models (bench.ts). Texts:
 * text.ts; the try-it model: sim.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { airJar, ballRack, ballRow, fishBody, fishGasPaths, fishTank, fishWaterPaths, gillCover, gills, GILL_HINGE, plant, plantGasPaths, plantPaths, ROWS, sideTable } from './bench';
import { SIM } from './sim';
import { CUT_LABEL, EXPLODE_LABEL, GROUP_TEXT, PART_TEXT, PRESET_TEXT, SPEC, TELEMETRY } from './text';

type V3 = [number, number, number];
const ROOT = join(import.meta.dirname, '../../..');
const OUT = join(ROOT, 'src/content/topics/heart-and-lungs/data/parts.json');
const ANATOMY = join(ROOT, 'scripts/anatomy/heart-lungs');

const landmarks = (JSON.parse(readFileSync(join(ANATOMY, "landmarks.json"), "utf8")) as { landmarks: Record<string, { point: number[] }> }).landmarks;
const routes = (JSON.parse(readFileSync(join(ANATOMY, 'routes.json'), 'utf8')) as { flows: Record<string, { paths: { id: string; path: number[][] }[] }> }).flows;
const r = (v: number) => Number(v.toFixed(4));
const lm = (id: string): V3 => {
  const p = landmarks[id]?.point;
  if (!p) throw new Error(`landmark ${id} missing`);
  return [r(p[0]!), r(p[1]!), r(p[2]!)];
};

/* ---------------------------------------------------------------- groups */

const GROUPS: { id: string; color: string; card?: false }[] = [
  { id: 'airway', color: 'token:muscle-1' },
  { id: 'lung-pair', color: 'token:bone' },
  { id: 'heart-group', color: 'token:muscle-3' },
  { id: 'body-vessels', color: 'token:muscle-2' },
  { id: 'air-tubes', color: 'token:muscle-1', card: false },
  { id: 'breathing-movers', color: 'token:ink-3', card: false },
  { id: 'digestion', color: 'token:food', card: false },
  { id: 'leg-muscle-group', color: 'token:muscle-1', card: false },
  { id: 'skeleton-context', color: 'token:bone', card: false },
  { id: 'air-sample', color: 'token:ink-2', card: false },
  { id: 'compare', color: 'token:ink-2', card: false },
  { id: 'skin-context', color: 'token:mannequin', card: false },
  { id: 'skin-light', color: 'token:mannequin', card: false },
  { id: 'bench', color: 'token:ink-3', card: false },
  // Flow-only groups (LAYERS and KEY; not in the part chain).
  { id: 'air', color: 'token:air' },
  { id: 'blood-rich', color: 'token:blood-rich' },
  { id: 'blood-poor', color: 'token:blood-poor' },
  { id: 'gases', color: 'token:oxygen' },
  { id: 'digested-food', color: 'token:food' },
  { id: 'fish-water', color: 'token:cold' },
  { id: 'plant-flow', color: 'token:cold' },
  { id: 'plant-gases', color: 'token:oxygen' },
];

/* ----------------------------------------------------------------- parts */

const tissue = (tint: string) => ({ color: 'tissue', tint });
const muscle = (tint: string) => ({ color: 'muscle', tint });
const VESSEL = tissue('token:neutral');

interface MeshPart {
  id: string;
  group: string;
  mesh: string;
  material: { color: string; tint: string };
  explode?: { dir: V3; dist: number };
  connects?: string[];
  shell?: true;
  bilateral?: { axis: 'x'; mesh: string };
  castShadow?: false;
}

const MESH_PARTS: MeshPart[] = [
  { id: 'nasal-cavity', group: 'airway', mesh: 'nasal-cavity', material: tissue('token:muscle-1'), explode: { dir: [0, 0, 1], dist: 0.03 }, connects: ['pharynx'] },
  { id: 'pharynx', group: 'airway', mesh: 'pharynx', material: tissue('token:muscle-2'), explode: { dir: [0, 0, -1], dist: 0.03 }, connects: ['trachea'] },
  { id: 'epiglottis', group: 'airway', mesh: 'epiglottis', material: tissue('token:muscle-1'), explode: { dir: [0, 0, -1], dist: 0.02 } },
  { id: 'larynx', group: 'airway', mesh: 'larynx', material: tissue('token:bone'), explode: { dir: [0, 0, 1], dist: 0.02 }, connects: ['trachea'] },
  { id: 'trachea', group: 'airway', mesh: 'trachea', material: tissue('token:bone'), connects: ['lung-right', 'lung-left'] },
  { id: 'lung-right', group: 'lung-pair', mesh: 'lung-right', material: tissue('token:muscle-1'), explode: { dir: [-1, 0, 0], dist: 0.08 }, connects: ['lung-vessels'] },
  { id: 'lung-left', group: 'lung-pair', mesh: 'lung-left', material: tissue('token:muscle-1'), explode: { dir: [1, 0, 0], dist: 0.08 }, connects: ['lung-vessels'] },
  { id: 'bronchi', group: 'air-tubes', mesh: 'bronchi', material: tissue('token:bone') },
  { id: 'diaphragm', group: 'breathing-movers', mesh: 'diaphragm', material: muscle('token:muscle-3'), explode: { dir: [0, -1, 0], dist: 0.04 } },
  { id: 'ribcage', group: 'breathing-movers', mesh: 'ribcage', material: tissue('token:bone'), shell: true, castShadow: false },
  { id: 'heart', group: 'heart-group', mesh: 'heart', material: muscle('token:muscle-3'), explode: { dir: [0, 0, 1], dist: 0.06 }, connects: ['great-vessels'] },
  { id: 'great-vessels', group: 'heart-group', mesh: 'great-vessels', material: VESSEL, connects: ['vessels-out'] },
  { id: 'lung-vessels', group: 'heart-group', mesh: 'lung-vessels', material: VESSEL, connects: ['heart'] },
  { id: 'vessels-out', group: 'body-vessels', mesh: 'vessels-out', material: VESSEL, connects: ['vessels-back'] },
  { id: 'vessels-back', group: 'body-vessels', mesh: 'vessels-back', material: VESSEL, connects: ['heart'] },
  { id: 'oesophagus', group: 'digestion', mesh: 'oesophagus', material: tissue('token:muscle-2'), connects: ['stomach'] },
  { id: 'stomach', group: 'digestion', mesh: 'stomach', material: tissue('token:muscle-2'), connects: ['small-intestine'] },
  { id: 'small-intestine', group: 'digestion', mesh: 'small-intestine', material: tissue('token:muscle-1'), connects: ['large-intestine'] },
  { id: 'large-intestine', group: 'digestion', mesh: 'large-intestine', material: tissue('token:muscle-3') },
  { id: 'liver', group: 'digestion', mesh: 'liver', material: tissue('token:muscle-3') },
  { id: 'leg-muscles', group: 'leg-muscle-group', mesh: 'leg-muscles.l', material: muscle('token:muscle-1'), explode: { dir: [1, 0, 0], dist: 0.03 }, bilateral: { axis: 'x', mesh: 'leg-muscles.r' } },
  { id: 'skeleton', group: 'skeleton-context', mesh: 'skeleton', material: tissue('token:bone'), shell: true, castShadow: false },
];

function text(id: string) {
  const t = PART_TEXT[id];
  if (!t) throw new Error(`no text for ${id}`);
  return { name: t.name, ...(t.short ? { short: t.short } : {}), ...(t.chainName ? { chainName: t.chainName } : {}), summary: t.summary, detail: t.detail };
}

const parts: Record<string, unknown>[] = MESH_PARTS.map((p) => {
  const { id, group, mesh, material, ...rest } = p;
  return { id, ...text(id), group, mesh, material, ...rest };
});

const jar = airJar();
parts.push({ id: 'air-jar', ...text('air-jar'), group: 'air-sample', primitive: jar.primitive, extra: jar.extra, clip: false });
for (const row of ROWS) {
  const b = ballRow(row);
  parts.push({ id: row.id, ...text(row.id), group: 'air-sample', primitive: b.primitive, repeat: b.repeat, clip: false });
}
const fish = fishBody();
parts.push({ id: 'fish-body', ...text('fish-body'), group: 'compare', primitive: fish.primitive, extra: fish.extra, connects: ['gills'], clip: false });
const g = gills();
parts.push({ id: 'gills', ...text('gills'), group: 'compare', primitive: g.primitive, extra: g.extra, connects: ['gill-cover'], clip: false });
parts.push({ id: 'gill-cover', ...text('gill-cover'), group: 'compare', primitive: gillCover(), explode: { dir: [0, 0, 1], dist: 0.03 }, clip: false });
const pl = plant();
parts.push({ id: 'plant-specimen', ...text('plant-specimen'), group: 'compare', primitive: pl.primitive, extra: pl.extra, clip: false });

// Context: the body outline, then the bench pieces (they follow their group's layer).
for (const [id, group] of [['skin-outline', 'skin-context'], ['skin-wire', 'skin-light']] as const) {
  parts.push({ id, ...text(id), group, mesh: id, material: { color: 'membrane', tint: 'token:mannequin' }, context: true, shell: true, castShadow: false });
}
const table = sideTable();
parts.push({ id: 'side-table', ...text('side-table'), group: 'bench', primitive: table.primitive, extra: table.extra, context: true, clip: false, castShadow: true });
const rack = ballRack();
parts.push({ id: 'ball-rack', ...text('ball-rack'), group: 'air-sample', primitive: rack.primitive, extra: rack.extra, context: true, clip: false });
const tank = fishTank();
parts.push({ id: 'fish-tank', ...text('fish-tank'), group: 'compare', primitive: tank.primitive, extra: tank.extra, context: true, clip: false });
parts.push({ id: 'plant-pot', ...text('plant-pot'), group: 'compare', primitive: pl.pot, context: true, clip: false });

/* ----------------------------------------------------------------- flows */

interface FlowDef {
  id: string;
  group: string;
  speed: number;
  color: string;
  count: number;
  size: number;
  spread?: number;
  ends?: 'open';
  flat?: true;
  tidal?: { sync: string };
  stops?: { at: number; color: string }[];
  clip?: false;
  parts?: string[];
}

const routePaths = (id: string) => {
  const f = routes[id];
  if (!f) throw new Error(`route ${id} missing`);
  return f.paths.map((p) => ({ id: p.id, path: p.path.map((q) => q.map(r)) }));
};

/** Blood segments: about the same particle flux (count / length × speed) in every segment (docs/06 flows). */
const BLOOD_FLUX = 18;
const lengthOf = (paths: { path: number[][] }[]) =>
  paths.reduce((s, p) => s + p.path.slice(1).reduce((t, q, i) => t + Math.hypot(q[0]! - p.path[i]![0]!, q[1]! - p.path[i]![1]!, q[2]! - p.path[i]![2]!), 0), 0);

const BLOOD = { size: 0.3, spread: 0.0012, ends: 'open' as const, flat: true as const };
const bloodFlow = (id: string, group: 'blood-rich' | 'blood-poor', speed: number, parts: string[], stops?: FlowDef['stops']): FlowDef => {
  const len = lengthOf(routePaths(id));
  const count = Math.min(1024, Math.max(4 * routePaths(id).length, Math.round((BLOOD_FLUX * len) / speed)));
  return { id, group, speed, color: `token:${group}`, count, ...BLOOD, ...(stops ? { stops } : {}), parts };
};

const HUMAN_FLOWS: FlowDef[] = [
  { id: 'air-right', group: 'air', speed: 0.12, color: 'token:air', count: 300, size: 0.24, spread: 0.0015, tidal: { sync: 'breathe' }, parts: ['nasal-cavity', 'pharynx', 'larynx', 'trachea', 'bronchi', 'lung-right'] },
  { id: 'air-left', group: 'air', speed: 0.12, color: 'token:air', count: 270, size: 0.24, spread: 0.0015, tidal: { sync: 'breathe' }, parts: ['nasal-cavity', 'pharynx', 'larynx', 'trachea', 'bronchi', 'lung-left'] },
  bloodFlow('heart-right', 'blood-poor', 0.1, ['great-vessels', 'heart']),
  bloodFlow('to-lungs', 'blood-poor', 0.1, ['lung-vessels', 'lung-right', 'lung-left']),
  bloodFlow('exchange-lungs', 'blood-poor', 0.05, ['lung-right', 'lung-left'], [
    { at: 0, color: 'token:blood-poor' },
    { at: 1, color: 'token:blood-rich' },
  ]),
  bloodFlow('from-lungs', 'blood-rich', 0.1, ['lung-vessels', 'heart']),
  bloodFlow('heart-left', 'blood-rich', 0.1, ['heart', 'great-vessels']),
  bloodFlow('to-body', 'blood-rich', 0.14, ['great-vessels', 'vessels-out']),
  bloodFlow('exchange-body', 'blood-rich', 0.05, ['vessels-out', 'vessels-back', 'leg-muscles'], [
    { at: 0, color: 'token:blood-rich' },
    { at: 1, color: 'token:blood-poor' },
  ]),
  bloodFlow('from-body', 'blood-poor', 0.14, ['vessels-back', 'great-vessels', 'liver']),
  { id: 'oxygen-lungs', group: 'gases', speed: 0.03, color: 'token:oxygen', count: 60, size: 0.22, spread: 0.0012, parts: ['lung-right', 'lung-left'] },
  { id: 'co2-lungs', group: 'gases', speed: 0.03, color: 'token:carbon-dioxide', count: 40, size: 0.22, spread: 0.0012, parts: ['lung-right', 'lung-left'] },
  { id: 'oxygen-muscle', group: 'gases', speed: 0.03, color: 'token:oxygen', count: 40, size: 0.22, spread: 0.0015 },
  { id: 'co2-muscle', group: 'gases', speed: 0.03, color: 'token:carbon-dioxide', count: 30, size: 0.22, spread: 0.0015 },
  { id: 'food-in', group: 'digested-food', speed: 0.03, color: 'token:food', count: 60, size: 0.22, spread: 0.0012, parts: ['small-intestine', 'vessels-back'] },
  { id: 'food-route', group: 'digested-food', speed: 0.1, color: 'token:food', count: 120, size: 0.22, spread: 0.001, parts: ['small-intestine', 'vessels-back', 'liver', 'heart', 'lung-right', 'vessels-out', 'leg-muscles'] },
];

const BENCH_FLOWS: (FlowDef & { paths: { id: string; path: V3[] }[] })[] = [
  { id: 'gill-water', group: 'fish-water', speed: 0.06, color: 'token:cold', count: 120, size: 0.07, spread: 0.0015, clip: false, parts: ['fish-body', 'gills', 'gill-cover'], paths: fishWaterPaths() },
  { id: 'fish-o2', group: 'fish-water', speed: 0.012, color: 'token:oxygen', count: 24, size: 0.06, spread: 0.0006, clip: false, paths: fishGasPaths('in') },
  { id: 'fish-co2', group: 'fish-water', speed: 0.012, color: 'token:carbon-dioxide', count: 16, size: 0.06, spread: 0.0006, clip: false, paths: fishGasPaths('out') },
  { id: 'plant-water', group: 'plant-flow', speed: 0.04, color: 'token:cold', count: 60, size: 0.07, spread: 0.0006, clip: false, paths: plantPaths('water') },
  { id: 'plant-food', group: 'plant-flow', speed: 0.03, color: 'token:food', count: 40, size: 0.07, spread: 0.0006, clip: false, paths: plantPaths('food') },
  { id: 'plant-o2', group: 'plant-gases', speed: 0.02, color: 'token:oxygen', count: 24, size: 0.08, spread: 0.001, clip: false, paths: plantGasPaths('in') },
  { id: 'plant-co2', group: 'plant-gases', speed: 0.02, color: 'token:carbon-dioxide', count: 18, size: 0.08, spread: 0.001, clip: false, paths: plantGasPaths('out') },
];

const withPaths = (def: FlowDef, paths: { id: string; path: number[][] }[]) => {
  const { parts: through, ...rest } = def;
  const geometry = paths.length === 1 ? { path: paths[0]!.path } : { paths };
  return { ...rest, ...geometry, ...(through ? { parts: through } : {}) };
};
const flows = [...HUMAN_FLOWS.map((f) => withPaths(f, routePaths(f.id))), ...BENCH_FLOWS.map(({ paths, ...f }) => withPaths(f, paths))];

/* ----------------------------------------------------- animations, poses */

const LUNG_SWELL: V3 = [1.05, 1.07, 1.06];
const RIB_SWELL: V3 = [1.03, 1.01, 1.04];
const DIAPHRAGM_DROP: V3 = [0, -0.025, 0];
const seq = (id: string, target: string, at: Record<string, unknown>, pivot?: V3) => ({
  id,
  target,
  kind: 'sequence',
  loop: true,
  ...(pivot ? { pivot } : {}),
  keys: [{ t: 0 }, { t: 1.4, ...at }, { t: 3 }],
});

const animations = [
  seq('breathe', 'lung-right', { scale: LUNG_SWELL }, lm('hilum.r')),
  seq('breathe-left', 'lung-left', { scale: LUNG_SWELL }, lm('hilum.l')),
  seq('diaphragm-breathe', 'diaphragm', { offset: DIAPHRAGM_DROP }),
  seq('ribs-breathe', 'ribcage', { scale: RIB_SWELL }, lm('thoracic-spine-front')),
  { id: 'heartbeat', target: 'heart', kind: 'pulse', scale: 1.04, hz: 1.5, pivot: lm('heart') },
  { id: 'gill-flap', target: 'gill-cover', kind: 'oscillate', axis: [0, 1, 0], amplitude: 4, hz: 0.8, pivot: GILL_HINGE },
];

const poses = {
  'breathe-in': {
    'lung-right': { pivot: lm('hilum.r'), scale: LUNG_SWELL },
    'lung-left': { pivot: lm('hilum.l'), scale: LUNG_SWELL },
    diaphragm: { offset: DIAPHRAGM_DROP },
    ribcage: { pivot: lm('thoracic-spine-front'), scale: RIB_SWELL },
    duration: 0.8,
  },
  'lungs-aside': {
    'lung-right': { offset: [-0.06, 0, 0.02] },
    'lung-left': { offset: [0.06, 0, 0.02] },
    duration: 1,
  },
  'gills-open': {
    'gill-cover': { pivot: GILL_HINGE, rotation: [0, -45, 0] },
    duration: 1,
  },
};

/* ------------------------------------------------- views, presets, HUD */

const cam = (position: V3, target: V3, fov = 30) => ({ position, target, fov });
const PRESETS: Record<string, { camera: ReturnType<typeof cam>; view?: string }> = {
  'whole-body': { camera: cam([0.65, 0.2, 3.5], [0, -0.15, -0.09]), view: 'xray' },
  'head-neck': { camera: cam([0.42, 0.6, 0.44], [0, 0.49, -0.07]) },
  chest: { camera: cam([0.34, 0.44, 1.0], [0.01, 0.28, -0.1]), view: 'xray' },
  'heart-inside': { camera: cam([0.1, 0.33, 0.45], [0.02, 0.27, -0.09]), view: 'xray' },
  'side-bench': { camera: cam([1.02, 0.62, 1.32], [0.9, 0.17, -0.07]) },
  legs: { camera: cam([0.5, -0.3, 1.55], [0, -0.45, -0.12]), view: 'xray' },
};

const data = {
  model: '/models/heart-and-lungs.glb',
  units: { modelUnit: 'm', scale: 1 },
  parts,
  groups: GROUPS.map(({ id, color, card }) => ({ id, name: GROUP_TEXT[id], color, ...(card === false ? { card } : {}) })),
  flows,
  animations,
  poses,
  views: {
    assembled: { camera: cam([0.62, 0.55, 1.35], [0, 0.33, -0.09]) },
    xray: { camera: cam([0.62, 0.55, 1.35], [0, 0.33, -0.09]) },
    exploded: { camera: cam([0.62, 0.55, 1.55], [0.02, 0.3, -0.08]) },
    cover: cam([0.3, 0.36, 0.86], [0.03, 0.28, -0.1]),
    reference: { camera: cam([0, -0.15, 5.5], [0, -0.15, -0.1], 20) },
    cutaway: { normal: [0, 0, -1], offset: -0.09 },
    cuts: { midline: { normal: [-1, 0, 0], offset: 0.008, label: CUT_LABEL } },
    section: { plane: 'xy' },
    explodeLabel: EXPLODE_LABEL,
  },
  presets: Object.entries(PRESETS).map(([id, p]) => ({ id, label: PRESET_TEXT[id], camera: p.camera, ...(p.view ? { view: p.view } : {}) })),
  spec: SPEC,
  telemetry: TELEMETRY,
  sim: SIM,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
console.log(`wrote ${OUT}: ${parts.length} parts, ${flows.length} flows`);
for (const f of flows) {
  const ps = 'paths' in f ? (f.paths as { path: number[][] }[]) : [{ path: (f as { path: number[][] }).path }];
  const len = lengthOf(ps);
  console.log(`  ${f.id.padEnd(15)} ${String(ps.length).padStart(2)} paths ${len.toFixed(3)} m  count ${f.count}  flux ${((f.count / len) * f.speed).toFixed(1)}`);
}
