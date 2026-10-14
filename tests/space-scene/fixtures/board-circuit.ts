/** The circuits topic's board and torch (docs/23 §4.2), as the solver tests use it. */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';

const bi = (en: string) => ({ en, zh: en });
const opt = (id: string) => ({ id, label: bi(id) });

export const boardSim: SimData = simSchema.parse({
  kind: 'circuit',
  controls: [
    { id: 'main', kind: 'toggle', default: true, label: bi('Switch') },
    { id: 'cells', kind: 'step', values: [1, 2, 3], default: 2, label: bi('Batteries') },
    { id: 'flip-2', kind: 'toggle', default: false, label: bi('Battery 2 reversed') },
    {
      id: 'arrangement',
      kind: 'choice',
      default: 'single',
      label: bi('Arrangement'),
      options: ['single', 'series', 'parallel', 'free'].map(opt),
      sets: { single: { x: false, y: false, z: true }, series: { x: true, y: false, z: false }, parallel: { x: false, y: true, z: true } },
    },
    { id: 'x', kind: 'toggle', default: false, label: bi('X') },
    { id: 'y', kind: 'toggle', default: false, label: bi('Y') },
    { id: 'z', kind: 'toggle', default: true, label: bi('Z') },
    {
      id: 'gap',
      kind: 'choice',
      default: 'link',
      label: bi('Gap'),
      options: ['link', 'paper-clip', 'copper-wire', 'foil-strip', 'pencil-lead', 'plastic-straw', 'wooden-stick', 'rubber-band', 'empty'].map(opt),
    },
    { id: 'load-a', kind: 'choice', default: 'bulb', label: bi('At A'), options: ['bulb', 'buzzer', 'motor'].map(opt) },
    { id: 'bulb-a-in', kind: 'toggle', default: true, label: bi('Bulb A') },
    { id: 'bulb-b-in', kind: 'toggle', default: true, label: bi('Bulb B') },
    { id: 'torch-switch', kind: 'toggle', default: false, label: bi('Torch') },
  ],
  outputs: [
    { id: 'i-cells', label: bi('Current'), from: 'current:cells', unit: 'A' },
    { id: 'volts', label: bi('Batteries'), from: 'volts:cells', unit: 'V' },
    { id: 'bright-a', label: bi('Bulb A'), from: 'brightness:a' },
    { id: 'bright-b', label: bi('Bulb B'), from: 'brightness:b' },
    { id: 'bright-torch', label: bi('Torch'), from: 'brightness:t-bulb' },
    { id: 'i-a', label: bi('A'), from: 'current:a', unit: 'A' },
    { id: 'i-b', label: bi('B'), from: 'current:b', unit: 'A' },
    { id: 'motor-speed', label: bi('Motor'), from: 'speed:a', unit: 'rpm' },
    { id: 'buzz', label: bi('Buzzer'), kind: 'state', from: 'sound:a', states: { off: bi('Off'), on: bi('On') } },
    {
      id: 'status',
      label: bi('Status'),
      kind: 'state',
      from: 'status:cells',
      states: { open: bi('Open'), closed: bi('Closed'), short: bi('Short'), 'over-rating': bi('Over rating') },
    },
    { id: 'edge-currents', label: bi('Currents'), kind: 'vector', from: 'edges' },
  ],
  circuit: {
    nodes: { bn: {}, bp: {}, s1: {}, n1: {}, n2: {}, n3: {}, n4: {}, tn: {}, tp: {}, ts: {}, tm: {} },
    edges: [
      { id: 'cells', from: 'bn', to: 'bp', kind: 'battery', cells: 'cells', flip: { '2': 'flip-2' }, emf: 1.5, r: 0.15 },
      { id: 'main', from: 'bp', to: 's1', kind: 'switch', control: 'main' },
      { id: 'gap', from: 's1', to: 'n1', kind: 'gap', control: 'gap' },
      { id: 'a', from: 'n1', to: 'n2', kind: 'load', control: 'load-a', present: 'bulb-a-in' },
      { id: 'x', from: 'n2', to: 'n3', kind: 'switch', control: 'x' },
      { id: 'b', from: 'n3', to: 'n4', kind: 'load', load: 'bulb', present: 'bulb-b-in' },
      { id: 'y', from: 'n1', to: 'n3', kind: 'switch', control: 'y' },
      { id: 'z', from: 'n2', to: 'n4', kind: 'switch', control: 'z' },
      { id: 'ret', from: 'n4', to: 'bn', kind: 'wire', r: 0.05 },
      { id: 't-cells', from: 'tn', to: 'tp', kind: 'battery', cells: 2, r: 0.15 },
      { id: 't-bulb', from: 'tp', to: 'ts', kind: 'load', load: 'bulb' },
      { id: 't-switch', from: 'ts', to: 'tm', kind: 'switch', control: 'torch-switch' },
      { id: 't-strip', from: 'tm', to: 'tn', kind: 'wire', r: 0.05 },
    ],
    materials: { link: 0.001, 'paper-clip': 0.05, 'copper-wire': 0.01, 'foil-strip': 0.02, 'pencil-lead': 20 },
    loads: { bulb: { kind: 'lamp', r: 12.5, rated: 0.5 }, buzzer: { kind: 'buzzer', r: 100, on: 0.01 }, motor: { kind: 'motor', r: 6, rpm: 40, at: 3 } },
    reference: { power: 0.68 },
  },
});
