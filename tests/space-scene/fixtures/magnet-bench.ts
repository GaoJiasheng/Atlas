/**
 * A magnet bench at the scale of docs/22 §3 (metres; model north = −Z): bar
 * magnets A and B on a rail (gap 6 / 3 / 1.5 cm, B turned round for N–N /
 * S–S), a horseshoe, a vertical nail electromagnet (1 or 2 cells), the
 * compass ring round A, and the field states of §4.2 item 4. A hidden
 * `setup` choice picks what is on the bench (a chapter sets it).
 */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';

const label = (en: string) => ({ en, zh: en });

export const benchSim: SimData = simSchema.parse({
  kind: 'magnet',
  controls: [
    {
      id: 'setup',
      kind: 'choice',
      label: label('Bench'),
      options: [
        { id: 'pair', label: label('Two bar magnets') },
        { id: 'alone', label: label('One bar magnet') },
        { id: 'horseshoe', label: label('Horseshoe') },
        { id: 'electromagnet', label: label('Electromagnet') },
      ],
      default: 'pair',
    },
    { id: 'gap', kind: 'step', label: label('Gap'), unit: 'cm', values: [6, 3, 1.5], default: 6 },
    {
      id: 'facing',
      kind: 'choice',
      label: label('Facing poles'),
      options: [
        { id: 'ns', label: label('N–S') },
        { id: 'nn', label: label('N–N') },
        { id: 'ss', label: label('S–S') },
      ],
      default: 'ns',
    },
    { id: 'compass-at', kind: 'step', label: label('Compass position'), values: [1, 2, 3, 4, 5, 6, 7, 8], default: 1 },
    { id: 'cards', kind: 'step', label: label('Cards'), values: [0, 1, 2, 3, 4, 5, 6], default: 0 },
    { id: 'strokes', kind: 'step', label: label('Strokes'), values: [0, 10, 20, 30], default: 0 },
    { id: 'em-switch', kind: 'toggle', label: label('Switch'), default: false },
    { id: 'em-cells', kind: 'step', label: label('Cells'), values: [1, 2], default: 2 },
  ],
  outputs: [
    { id: 'force', label: label('Pull'), unit: '%', decimals: 0 },
    { id: 'needle-bearing', label: label('Needle'), unit: '°', decimals: 0 },
    { id: 'clips-cards', label: label('Through cards') },
    { id: 'clips-stroke', label: label('After stroking') },
    { id: 'clips-em', label: label('Electromagnet') },
    { id: 'clips', label: label('Clips held') },
    {
      id: 'field-state',
      kind: 'state',
      label: label('Pattern'),
      states: Object.fromEntries(
        ['ns-6', 'ns-3', 'ns-1.5', 'nn-6', 'nn-3', 'nn-1.5', 'ss-3', 'horseshoe', 'em-on-1', 'em-on-2', 'em-off', 'single'].map((s) => [s, label(s)]),
      ),
    },
  ],
  bind: [
    { control: 'gap', part: 'bar-magnet-b', offset: { axis: [1, 0, 0], per: 0.01, origin: 6 } },
    { control: 'compass-at', part: ['compass-case', 'compass-needle'], at: 'compass-ring' },
    { output: 'needle-bearing', part: 'compass-needle', rotate: { axis: [0, -1, 0], settle: { period: 1.2, damping: 0.3 } } },
    { output: 'clips-cards', part: 'clip-chain', count: true },
    { control: 'em-switch', part: 'em-nail', tint: { color: 'token:signal', full: 1 } },
    { output: 'field-state', part: 'iron-filings', state: true },
    { output: 'field-state', flow: 'field-lines', state: true },
  ],
  overlays: [{ kind: 'force-arrows', between: ['bar-magnet-n', 'bar-magnet-b'], output: 'force' }],
  magnet: {
    magnets: [
      { id: 'a', north: [-0.118, 0.005, 0], south: [-0.202, 0.005, 0] },
      {
        id: 'b',
        north: [0.042, 0.005, 0],
        south: [-0.042, 0.005, 0],
        move: { control: 'gap', axis: [1, 0, 0], per: 0.01, origin: 6 },
        flip: { control: 'facing', when: ['nn', 'ss'] },
      },
      { id: 'horseshoe', north: [-0.326, 0.006, 0.115], south: [-0.326, 0.006, 0.165], moment: 0.4 },
      { id: 'em', north: [0.29, 0.03, -0.05], south: [0.29, 0.11, -0.05], moment: 0.15, power: { switch: 'em-switch', cells: 'em-cells' } },
    ],
    reference: 1.5,
    clips: { cards: 'cards', strokes: 'strokes', switch: 'em-switch', cells: 'em-cells' },
    earth: { uT: 40, north: [0, 0, -1] },
    rings: { 'compass-ring': { center: [-0.16, 0.017, 0], radius: 0.085, count: 8 } },
    plane: { center: [-0.11, 0.012, 0], size: [0.36, 0.21] },
    fields: {
      'ns-6': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'ns', gap: 6 } },
      'ns-3': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'ns', gap: 3 } },
      'ns-1.5': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'ns', gap: 1.5 } },
      'nn-6': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'nn', gap: 6 } },
      'nn-3': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'nn', gap: 3 } },
      'nn-1.5': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'nn', gap: 1.5 } },
      'ss-3': { magnets: ['a', 'b'], when: { setup: 'pair', facing: 'ss' } },
      horseshoe: { magnets: ['horseshoe'], when: { setup: 'horseshoe' }, lines: 20, plane: { center: [-0.33, 0.012, 0.14], size: [0.16, 0.14] } },
      'em-on-1': { magnets: ['em'], when: { setup: 'electromagnet', 'em-switch': true, 'em-cells': 1 }, lines: 40, plane: { center: [0.29, 0.07, -0.05], size: [0.16, 0.16], normal: [0, 0, 1] } },
      'em-on-2': { magnets: ['em'], when: { setup: 'electromagnet', 'em-switch': true, 'em-cells': 2 }, lines: 40, plane: { center: [0.29, 0.07, -0.05], size: [0.16, 0.16], normal: [0, 0, 1] } },
      'em-off': { magnets: ['em'], when: { setup: 'electromagnet' }, lines: 40, plane: { center: [0.29, 0.07, -0.05], size: [0.16, 0.16], normal: [0, 0, 1] } },
      single: { magnets: ['a'] },
    },
  },
});

/** Parts, flows, poses the bench's bindings name (for `simIssues`). */
export const benchContext = {
  parts: new Set(['bar-magnet-n', 'bar-magnet-b', 'compass-case', 'compass-needle', 'clip-chain', 'em-nail', 'iron-filings']),
  flows: new Map([['field-lines', { own: false }]]),
  animations: new Map(),
  poses: new Set<string>(),
  countable: new Set(['clip-chain']),
  filings: new Set(['iron-filings']),
};
