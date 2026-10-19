/**
 * The docs/33 §4.2 life cycle of Aedes aegypti as a sim: the controls, the
 * outputs and the `lifeCycle` data at the spec's numbers (S16 table 2: mean
 * days per larval stage and the pupa, male Ae. aegypti on the Khan diet at
 * constant 20 / 25 / 28 / 32 °C, `total` the study's own hatching-to-adult
 * mean). The unit tests run the model on it, and it is the template the
 * mosquito topic's author copies: part ids, the cycle flow `life-cycle`
 * with its paths `ring` / `out` / `lay`, the marker poses and the
 * grasshopper ring are the spec's §3–§4 names.
 */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';

const b = (en: string, zh: string) => ({ en, zh });

export const AEDES_PARTS = ['eggs', 'larva-l1', 'larva-l2', 'larva-l3', 'larva-l4', 'pupa', 'thorax', 'follow-marker', 'escaped-adults'];
export const AEDES_FLOWS: Record<string, string[]> = { 'life-cycle': ['ring', 'out', 'lay'] };
export const AEDES_POSES = ['marker-l1', 'marker-l2', 'marker-l3', 'marker-l4', 'marker-pupa', 'marker-adult'];

export const aedesSim: SimData = simSchema.parse({
  kind: 'life-cycle',
  controls: [
    { id: 'temp', kind: 'step', values: [20, 25, 28, 32], default: 28, unit: '°C', label: b('Water temperature', '水温') },
    { id: 'day', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6, 7, 8], default: 0, unit: 'd', label: b('Days after hatching', '孵化后第几天') },
    { id: 'every', kind: 'step', values: [2, 4, 6, 8, 10, 14], default: 14, unit: 'd', label: b('Water tipped out every', '每隔几天倒一次水') },
    { id: 'wipe', kind: 'toggle', default: false, label: b('Wall scrubbed too', '倒水后也刷壁') },
    { id: 'compare', kind: 'toggle', default: false, label: b("Show a grasshopper's cycle", '并排看蝗虫的生活史') },
  ],
  outputs: [
    {
      id: 'stage',
      kind: 'state',
      label: b('Stage', '阶段'),
      states: {
        egg: b('Egg', '卵'),
        l1: b('Larva 1', '一龄幼虫'),
        l2: b('Larva 2', '二龄幼虫'),
        l3: b('Larva 3', '三龄幼虫'),
        l4: b('Larva 4', '四龄幼虫'),
        pupa: b('Pupa', '蛹'),
        adult: b('Adult', '成虫'),
      },
    },
    { id: 'to-adult', label: b('Hatching to adult', '孵化到成虫'), unit: 'd', decimals: 1 },
    { id: 'larva-days', from: 'days:larva', label: b('As a larva', '幼虫期'), unit: 'd', decimals: 1 },
    { id: 'pupa-days', from: 'days:pupa', label: b('As a pupa', '蛹期'), unit: 'd', decimals: 1 },
    { id: 'days-left', label: b('Days to adult', '还有几天变成虫'), unit: 'd', decimals: 1 },
    { id: 'temp-now', from: 'control:temp', label: b('Water', '水温'), unit: '°C', decimals: 0 },
    { id: 'adults', kind: 'state', from: 'emptying:adults', label: b('Adults fly away', '有没有成虫飞走'), states: { none: b('None', '没有'), some: b('Some', '有') } },
    { id: 'eggs-left', kind: 'state', from: 'emptying:eggs', label: b('Eggs on the wall', '壁上还有卵'), states: { yes: b('Yes', '有'), none: b('None', '没有') } },
    { id: 'rate', kind: 'vector', label: b('Cycle speed', '环的速度') },
  ],
  bind: [
    {
      output: 'stage',
      part: 'follow-marker',
      pose: { l1: 'marker-l1', l2: 'marker-l2', l3: 'marker-l3', l4: 'marker-l4', pupa: 'marker-pupa', adult: 'marker-adult' },
    },
    { output: 'eggs-left', part: 'eggs', visible: { eq: 'yes' } },
    { output: 'adults', part: 'escaped-adults', visible: { eq: 'some' } },
    { output: 'rate', flow: 'life-cycle', intensity: { full: 1 } },
  ],
  lifeCycle: {
    temp: 'temp',
    day: 'day',
    start: 'l1',
    stages: [
      { id: 'egg', in: 'wall', part: 'eggs', label: b('Egg', '卵'), note: b('waits for water', '等水来') },
      { id: 'l1', in: 'water', part: 'larva-l1', label: b('Larva 1', '一龄') },
      { id: 'l2', in: 'water', part: 'larva-l2', label: b('Larva 2', '二龄') },
      { id: 'l3', in: 'water', part: 'larva-l3', label: b('Larva 3', '三龄') },
      { id: 'l4', in: 'water', part: 'larva-l4', label: b('Larva 4', '四龄') },
      { id: 'pupa', in: 'water', part: 'pupa', label: b('Pupa', '蛹') },
      { id: 'adult', in: 'air', part: 'thorax', label: b('Adult', '成虫') },
    ],
    groups: { larva: { stages: ['l1', 'l2', 'l3', 'l4'], label: b('Larva', '幼虫（孑孓）') } },
    days: {
      '20': { l1: 2.99, l2: 1.52, l3: 1.62, l4: 3.15, pupa: 4.04, total: 13.4 },
      '25': { l1: 2.53, l2: 1.17, l3: 1.08, l4: 2.77, pupa: 2.61, total: 10.18 },
      '28': { l1: 1.88, l2: 0.68, l3: 1.0, l4: 1.82, pupa: 1.86, total: 7.23 },
      '32': { l1: 1.55, l2: 0.95, l3: 0.7, l4: 1.63, pupa: 1.7, total: 6.4 },
    },
    emptying: { every: 'every', wipe: 'wipe' },
    rate: { flow: 'life-cycle', paths: ['ring', 'out', 'lay'], reference: 28 },
    card: {
      compare: {
        control: 'compare',
        label: b('Grasshopper', '蝗虫'),
        stages: [
          { id: 'egg', label: b('Egg', '卵') },
          { id: 'nymph', label: b('Nymph', '若虫') },
          { id: 'adult', label: b('Adult', '成虫') },
        ],
        link: { topic: 'grasshopper', chapter: 'nerves-and-growing-up' },
      },
    },
  },
});
