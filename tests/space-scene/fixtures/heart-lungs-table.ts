/**
 * Author template for `heart-and-lungs` (docs/40 §4.2, §2.9): the whole
 * `sim` section of its parts.json — the four controls, every output with its
 * labels, every binding of §4.2 (poses, the breathing animations, the four
 * rows of balls, the six blood segments on the round, the paced heartbeat and
 * breathing, the paced flows) and the `table` with all of §2.9 (T1 breath, T2
 * air, T4 route, T5 effort). Source ids are the spec's (§6.2): S37 is the
 * design study (`design: true` in sources.json). Copy it into parts.json; the
 * unit tests pin every cell (tests/space-scene/table.test.ts).
 */
const label = (en: string, zh: string) => ({ en, zh });
const PER_MINUTE = 1 / 60;
const BREATHING = ['breathe', 'breathe-left', 'diaphragm-breathe', 'ribs-breathe'];
const BLOOD_FLOWS = ['heart-right', 'to-lungs', 'from-lungs', 'heart-left', 'to-body', 'from-body', 'food-route'];

/** The six segments of the round (§2.9 T4): segment j shows at step 0, at its own step j and at the next one (6 → 1). */
export const ROUND_SEGMENTS: readonly (readonly string[])[] = [
  ['heart-right', 'to-lungs'],
  ['exchange-lungs', 'oxygen-lungs', 'co2-lungs'],
  ['from-lungs', 'heart-left'],
  ['to-body'],
  ['exchange-body', 'oxygen-muscle', 'co2-muscle'],
  ['from-body'],
];

export const HEART_LUNGS_SIM = {
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
    { id: 'diaphragm', label: label('Diaphragm', '膈'), kind: 'state', states: { cycle: label('Down and up in turn', '一下一上'), down: label('Moves down', '往下移'), up: label('Moves up', '往上移') } },
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
        'lungs-to-heart': label('Lungs to heart', '从肺回到心脏'),
        'heart-to-body': label('Heart to the body', '从心脏到全身'),
        'in-body': label('In the body', '在身体各处'),
        'body-to-heart': label('Body to heart', '从身体回到心脏'),
      },
    },
    {
      id: 'blood',
      label: label('Oxygen in the blood', '血里的氧气'),
      kind: 'state',
      states: {
        both: label('Rich and poor', '多的和少的'),
        poor: label('Little oxygen', '含氧少'),
        'poor-to-rich': label('Takes in oxygen', '得到氧气'),
        rich: label('Much oxygen', '含氧多'),
        'rich-to-poor': label('Gives up oxygen', '交出氧气'),
      },
    },
    { id: 'breaths', label: label('Breaths', '呼吸'), unit: '/min', decimals: 0, tag: 'sim' },
    { id: 'beats', label: label('Heartbeats', '心跳'), unit: '/min', decimals: 0, tag: 'sim' },
    { id: 'muscles', label: label('What the muscles need', '肌肉需要'), kind: 'state', states: { little: label('A little', '少'), more: label('More', '多一些'), most: label('Most', '最多') } },
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
} as const;

/** What the sim names in the rest of the topic's parts.json (§3.5–§3.7): enough for `simIssues`. */
export const HEART_LUNGS_PARTS = [
  'lung-right', 'lung-left', 'diaphragm', 'ribcage', 'heart', 'trachea',
].map((id) => ({ id }))
  .concat([
    { id: 'n2-balls', repeat: { count: 80 } },
    { id: 'o2-balls', repeat: { count: 25 } },
    { id: 'co2-balls', repeat: { count: 6 } },
    { id: 'h2o-balls', repeat: { count: 8 } },
  ] as { id: string; repeat?: { count: number } }[]);

export const HEART_LUNGS_FLOWS = [
  'air-right', 'air-left', 'heart-right', 'to-lungs', 'exchange-lungs', 'from-lungs', 'heart-left', 'to-body', 'exchange-body', 'from-body',
  'oxygen-lungs', 'co2-lungs', 'oxygen-muscle', 'co2-muscle', 'food-in', 'food-route',
];

export const HEART_LUNGS_ANIMATIONS: Record<string, { kind: string; target: string; loop?: boolean }> = {
  breathe: { kind: 'sequence', target: 'lung-right', loop: true },
  'breathe-left': { kind: 'sequence', target: 'lung-left', loop: true },
  'diaphragm-breathe': { kind: 'sequence', target: 'diaphragm', loop: true },
  'ribs-breathe': { kind: 'sequence', target: 'ribcage', loop: true },
  heartbeat: { kind: 'pulse', target: 'heart' },
};

/** The spec's sources the rows cite (§6.2): S37 is the design study. */
export const HEART_LUNGS_SOURCES = new Map<string, { design?: boolean }>([
  ['S2', {}], ['S3', {}], ['S4', {}], ['S5', {}], ['S6', {}], ['S8', {}], ['S9', {}], ['S10', {}], ['S37', { design: true }],
]);
