/**
 * The `sim` section of heart-and-lungs parts.json: the `table` model of
 * docs/40 §4.2 with every cell of §2.9, copied from the engine's author
 * template (tests/space-scene/fixtures/heart-lungs-table.ts) with the state
 * labels written for the topic (docs/40 §9.2 item 14: labels may change, ids
 * may not). tests/space-scene/heart-and-lungs-topic.test.ts checks that the
 * table here and the template agree cell by cell.
 *
 * Sources (data/sources.json): S2 OpenStax A&P 2e (breathing, the two
 * circuits), S3 + S4 air breathed in, S5 + S6 + S8 air breathed out, S9 resting
 * rates, S10 children's maximum heart rate, S37 the design study (walk and run
 * values, display paces).
 */
const label = (en: string, zh: string) => ({ en, zh });
const PER_MINUTE = 1 / 60;
const BREATHING = ['breathe', 'breathe-left', 'diaphragm-breathe', 'ribs-breathe'];
const BLOOD_FLOWS = ['heart-right', 'to-lungs', 'from-lungs', 'heart-left', 'to-body', 'from-body', 'food-route'];

/** The six segments of the round (§2.9 T4): segment j shows at step 0, at its own step j and at the next (6 → 1). */
export const ROUND_SEGMENTS: readonly (readonly string[])[] = [
  ['heart-right', 'to-lungs'],
  ['exchange-lungs', 'oxygen-lungs', 'co2-lungs'],
  ['from-lungs', 'heart-left'],
  ['to-body'],
  ['exchange-body', 'oxygen-muscle', 'co2-muscle'],
  ['from-body'],
];

export const SIM = {
  kind: 'table',
  controls: [
    {
      id: 'phase',
      kind: 'choice',
      default: 'auto',
      label: label('Breathing', '呼吸'),
      options: [
        { id: 'auto', label: label('Breathing on its own', '自然呼吸') },
        { id: 'in', label: label('Breathe in', '吸气') },
        { id: 'out', label: label('Breathe out', '呼气') },
      ],
    },
    {
      id: 'sample',
      kind: 'choice',
      default: 'in',
      label: label('Air in the jar', '瓶里的气体'),
      options: [
        { id: 'in', label: label('Breathed in', '吸入的空气') },
        { id: 'out', label: label('Breathed out', '呼出的气体') },
      ],
    },
    { id: 'stop', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6], default: 0, label: label('Step on the round', '这一圈的第几步') },
    {
      id: 'activity',
      kind: 'choice',
      default: 'rest',
      label: label('Activity', '活动'),
      options: [
        { id: 'rest', label: label('Sitting at rest', '坐着休息') },
        { id: 'walk', label: label('Walking', '走路') },
        { id: 'run', label: label('Running', '跑步') },
      ],
    },
  ],
  outputs: [
    { id: 'diaphragm', label: label('Muscle under the lungs', '肺下面的肌肉'), kind: 'state', states: { cycle: label('Down and up in turn', '一下一上'), down: label('Moves down', '往下移'), up: label('Moves up', '往上移') } },
    { id: 'chest', label: label('Chest', '胸腔'), kind: 'state', states: { cycle: label('Bigger and smaller in turn', '一大一小'), bigger: label('Gets bigger', '变大'), smaller: label('Gets smaller', '变小') } },
    { id: 'airflow', label: label('Air', '空气'), kind: 'state', states: { cycle: label('In and out in turn', '一进一出'), in: label('Flows in', '流进来'), out: label('Flows out', '流出去') } },
    { id: 'n2', label: label('Nitrogen', '氮气'), unit: '%', decimals: 0, tag: 'typical' },
    { id: 'o2', label: label('Oxygen', '氧气'), unit: '%', decimals: 0, tag: 'typical' },
    { id: 'co2', label: label('Carbon dioxide', '二氧化碳'), unit: '%', decimals: 0, tag: 'typical' },
    { id: 'h2o', label: label('Water vapour', '水蒸气'), unit: '%', decimals: 0, tag: 'typical' },
    {
      id: 'where',
      label: label('Where the blood is', '血在哪里'),
      kind: 'state',
      states: {
        whole: label('The whole round', '整整一圈'),
        'heart-to-lungs': label('Heart to lungs', '从心脏到肺'),
        'in-lungs': label('In the lungs', '在肺里'),
        'lungs-to-heart': label('Lungs back to the heart', '从肺回到心脏'),
        'heart-to-body': label('Heart to the body', '从心脏到全身'),
        'in-body': label('In the body', '在身体各处'),
        'body-to-heart': label('Body back to the heart', '从身体回到心脏'),
      },
    },
    {
      id: 'blood',
      label: label('Oxygen in the blood', '血里的氧气'),
      kind: 'state',
      states: {
        both: label('Both kinds', '两种都有'),
        poor: label('Little oxygen', '含氧少'),
        'poor-to-rich': label('Takes in oxygen', '吸收氧气'),
        rich: label('Much oxygen', '含氧多'),
        'rich-to-poor': label('Gives oxygen away', '送出氧气'),
      },
    },
    { id: 'breaths', label: label('Breaths', '呼吸'), unit: '/min', decimals: 0, tag: 'sim' },
    { id: 'beats', label: label('Heartbeats', '心跳'), unit: '/min', decimals: 0, tag: 'sim' },
    { id: 'muscles', label: label('What the muscles need', '肌肉需要的'), kind: 'state', states: { little: label('A little', '少'), more: label('More', '多一些'), most: label('Most', '最多') } },
    { id: 'blood-pace', label: label('Blood pace', '血流快慢'), decimals: 2, tag: 'sim' },
    { id: 'air-pace', label: label('Air pace', '气流快慢'), decimals: 2, tag: 'sim' },
    { id: 'muscle-need', label: label('Exchange at the muscles', '肌肉旁的交换'), decimals: 2, tag: 'sim' },
  ],
  bind: [
    { control: 'phase', part: ['lung-right', 'lung-left', 'diaphragm', 'ribcage'], pose: { in: 'breathe-in', out: null } },
    { control: 'phase', animation: BREATHING, enabled: { eq: 'auto' } },
    { output: 'n2', part: 'n2-balls', count: true },
    { output: 'o2', part: 'o2-balls', count: true },
    { output: 'co2', part: 'co2-balls', count: true },
    { output: 'h2o', part: 'h2o-balls', count: true },
    ...ROUND_SEGMENTS.map((flows, j) => ({ control: 'stop', flow: [...flows], visible: { in: [0, j + 1, j === 5 ? 1 : j + 2] } })),
    { output: 'breaths', animation: BREATHING, hz: { per: PER_MINUTE } },
    { output: 'beats', animation: 'heartbeat', hz: { per: PER_MINUTE } },
    { output: 'blood-pace', flow: BLOOD_FLOWS, intensity: { full: 1 } },
    { output: 'air-pace', flow: ['air-right', 'air-left'], intensity: { full: 1 } },
    { output: 'muscle-need', flow: ['oxygen-muscle', 'co2-muscle'], intensity: { full: 1, mode: 'density' } },
  ],
  table: {
    experiments: {
      breath: {
        keys: ['phase'],
        rows: [
          { when: { phase: 'auto' }, set: { diaphragm: 'cycle', chest: 'cycle', airflow: 'cycle' }, source: ['S2'] },
          { when: { phase: 'in' }, set: { diaphragm: 'down', chest: 'bigger', airflow: 'in' }, source: ['S2'] },
          { when: { phase: 'out' }, set: { diaphragm: 'up', chest: 'smaller', airflow: 'out' }, source: ['S2'] },
        ],
      },
      air: {
        keys: ['sample'],
        rows: [
          { when: { sample: 'in' }, set: { n2: 78, o2: 21, co2: { value: 0.04, decimals: 2 }, h2o: 1 }, source: ['S3', 'S4'] },
          { when: { sample: 'out' }, set: { n2: 78, o2: 16, co2: 4, h2o: 6 }, source: ['S5', 'S6', 'S8'] },
        ],
      },
      route: {
        keys: ['stop'],
        rows: [
          { when: { stop: 0 }, set: { where: 'whole', blood: 'both' }, source: ['S2'] },
          { when: { stop: 1 }, set: { where: 'heart-to-lungs', blood: 'poor' }, source: ['S2'] },
          { when: { stop: 2 }, set: { where: 'in-lungs', blood: 'poor-to-rich' }, source: ['S2'] },
          { when: { stop: 3 }, set: { where: 'lungs-to-heart', blood: 'rich' }, source: ['S2'] },
          { when: { stop: 4 }, set: { where: 'heart-to-body', blood: 'rich' }, source: ['S2'] },
          { when: { stop: 5 }, set: { where: 'in-body', blood: 'rich-to-poor' }, source: ['S2'] },
          { when: { stop: 6 }, set: { where: 'body-to-heart', blood: 'poor' }, source: ['S2'] },
        ],
      },
      effort: {
        keys: ['activity'],
        rows: [
          { when: { activity: 'rest' }, set: { breaths: 20, beats: 90, muscles: 'little', 'blood-pace': 1.0, 'air-pace': 1.0, 'muscle-need': 0.25 }, source: ['S37', 'S9'] },
          { when: { activity: 'walk' }, set: { breaths: 26, beats: 115, muscles: 'more', 'blood-pace': 1.28, 'air-pace': 1.3, 'muscle-need': 0.5 }, source: ['S37'] },
          { when: { activity: 'run' }, set: { breaths: 40, beats: 165, muscles: 'most', 'blood-pace': 1.83, 'air-pace': 2.0, 'muscle-need': 1.0 }, source: ['S37', 'S10'] },
        ],
      },
    },
  },
};
