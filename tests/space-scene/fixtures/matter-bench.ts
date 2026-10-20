/** Author template: docs/36 §4.2, using its measured/design constants and cavity dimensions. */
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
import { matterSchema, type MatterPart } from '../../../src/engines/space-scene/matter-schema';
import type { Primitive } from '../../../src/engines/space-scene/schema';

const l = (en: string) => ({ en, zh: en });
const choice = (id: string, ids: string[]) => ({ id, kind: 'choice', default: ids[0], label: l(id), options: ids.map((id) => ({ id, label: l(id) })) });
const step = (id: string, values: number[], unit?: string) => ({ id, kind: 'step', values, default: values[0], label: l(id), ...(unit ? { unit } : {}) });

export const matterBench = matterSchema.parse({
  g: 9.8, p0: 101.325, air: 1.18, water: { density: 0.997, squash: 4.5e-7 },
  objects: {
    stone: { volume: 25, density: 2.65 }, sponge: { volume: 384, density: 0.030, floats: true },
    marble: { volume: 2.145, density: 2.5 }, clay: { volume: 20, density: 1.6 },
    'clay-ball': { volume: 20, density: 1.6 }, 'clay-roll': { volume: 20, density: 1.6 }, water: { volume: 200, density: 0.997 },
  },
  weigh: { object: 'weigh-object', step: 0.1 },
  displace: { object: 'drop-object', water: 100, liquid: 'cyl-b-water', step: 1 },
  pour: { container: 'container', volume: 200, liquids: { cylinder: 'cyl-a-water', glass: 'glass-water', flask: 'flask-water', bowl: 'bowl-water' } },
  pump: { pumps: 'pumps', ball: 600, stroke: 0.2, inside: 7, firm: [51.7, 58.6] },
  cup: { place: 'cup-place', hole: 'cup-hole', basin: { radius: 12, depth: 14 }, cup: { radius: 3.5, height: 9, glass: 57.9, rim: 3, top: 12.4 }, liquids: { basin: 'basin-water', around: 'basin-water-cup', inside: 'cup-water' } },
  squeeze: { load: 'load', volume: 20, bore: 2, fillings: { air: 'gas', water: 'liquid', sand: 'grains' } },
  pores: { water: 'water-added', sand: 100, porosity: 0.35, liquids: { above: 'water-over-sand', jug: 'jug-water' }, jug: 100 },
});

export const MATTER_CONTROLS = [
  choice('weigh-object', ['stone', 'sponge', 'marble', 'clay', 'water']),
  choice('drop-object', ['nothing', 'stone', 'marble', 'clay-ball', 'clay-roll']),
  choice('container', ['cylinder', 'glass', 'flask', 'bowl']),
  step('pumps', [0, 5, 10, 15, 20]),
  choice('cup-place', ['above', 'pushed']),
  { id: 'cup-hole', kind: 'toggle', default: false, label: l('Hole in cup') },
  step('load', [0, 1, 2, 3, 4], 'kg'),
  step('water-added', [0, 20, 40, 60, 80, 100], 'ml'),
];

const numeric = (id: string, from: string, unit?: string, decimals?: number) => ({ id, from, label: l(id), ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) });
const state = (id: string, from: string, ids: string[]) => ({ id, from, label: l(id), kind: 'state', states: Object.fromEntries(ids.map((id) => [id, l(id)])) });
export const MATTER_OUTPUTS = [
  numeric('mass', 'weigh:mass', 'g', 1), numeric('reading', 'displace:reading', 'ml', 0), numeric('object-volume', 'displace:volume', 'cm³', 1),
  numeric('level', 'pour:level', 'cm', 1), numeric('poured', 'pour:volume', 'ml', 0),
  numeric('ball-mass', 'pump:mass', 'g', 1), numeric('air-added', 'pump:air', 'g', 1), state('firmness', 'pump:firmness', ['flat', 'soft', 'firm', 'too-hard']),
  numeric('basin-level', 'cup:basin-level', 'cm', 1), numeric('basin-rise', 'cup:basin-rise', 'mm', 1), numeric('cup-rise', 'cup:cup-rise', 'mm', 1),
  state('tissue', 'cup:tissue', ['dry', 'wet']), state('cup-bubbles', 'cup:bubbles', ['none', 'rising']), numeric('tissue-wet', 'cup:wet'),
  numeric('v-air', 'squeeze:air', 'ml', 1), numeric('v-water', 'squeeze:water', 'ml', 1), numeric('v-sand', 'squeeze:sand', 'ml', 1),
  numeric('sand-reading', 'pores:reading', 'ml', 0), numeric('air-gaps', 'pores:air', 'ml', 0), state('vs-sum', 'pores:vs-sum', ['equal', 'less', 'more']),
  state('sand-bubbles', 'pores:bubbles', ['none', 'rising']), numeric('wet', 'pores:wet'),
  ...['cyl-a-water', 'glass-water', 'flask-water', 'bowl-water', 'cyl-b-water', 'basin-water', 'basin-water-cup', 'cup-water', 'water-over-sand', 'jug-water'].map((id, i) => numeric(`volume-${i}`, `volume:${id}`, 'ml')),
];

export const matterSim = () => simSchema.parse({ kind: 'matter', controls: MATTER_CONTROLS, outputs: MATTER_OUTPUTS, bind: [], matter: matterBench });

const lathe = (profile: [number, number][]): Primitive => ({ kind: 'lathe', profile, segments: 32, at: [0, 0, 0], color: 'membrane' });
const cylinder = (radius: number, height: number): Primitive => lathe([[0, 0], [radius, 0], [radius, height], [0, height]]);
// A one-degree arch respects the 96-point primitive budget and resolves the 0.1 cm textbook reading.
const bowl: [number, number][] = [[0, 0], ...Array.from({ length: 91 }, (_, i): [number, number] => {
  const a = i * Math.PI / 180;
  return [0.08 * Math.sin(a), 0.08 * (1 - Math.cos(a))];
}), [0, 0.08]];

export const MATTER_PARTS: MatterPart[] = [
  { id: 'cyl-a-water', primitive: cylinder(0.0185, 250e-6 / (Math.PI * 0.0185 ** 2)) },
  { id: 'glass-water', primitive: cylinder(0.03, 0.12) },
  { id: 'flask-water', primitive: lathe([[0, 0], [0.042, 0], [0.016, 0.10], [0.016, 0.14], [0, 0.14]]) },
  { id: 'bowl-water', primitive: lathe(bowl) },
  { id: 'cyl-b-water', primitive: cylinder(0.0185, 0.25) },
  { id: 'basin-water', primitive: cylinder(0.12, 0.18) },
  { id: 'basin-water-cup', primitive: lathe([[0, 0], [0.12, 0], [0.12, 0.18], [0, 0.18], [0, 0.124], [0.037, 0.124], [0.037, 0.03], [0, 0.03]]) },
  { id: 'cup-water', primitive: cylinder(0.035, 0.09) },
  { id: 'water-over-sand', primitive: cylinder(0.0185, 0.25) },
  { id: 'jug-water', primitive: cylinder(0.03, 0.12) },
];
