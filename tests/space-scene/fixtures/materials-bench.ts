/**
 * Author template: docs/37 §4.2, the materials bench with its design
 * constants (§2.2: teak, steel, glazed tile, natural rubber, window glass,
 * HDPE, cotton; strips 30 × 3 cm × 2 mm, 500 g masses, 20 cm span, 25 cm
 * reach, 18 cm of fresh water), as corrected by the fact check pass 2
 * (art/research/materials/facts-pass2.md: glass 36 MPa as-cut edge, HDPE
 * flexural E 1.2 GPa and a 25 MPa yield guard, natural rubber E 0.005 GPa).
 * The constants belong to the topic's S1; materials.test.ts pins §2.5's
 * outcomes with those corrections (docs/37 §9).
 */
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
import { materialsSchema } from '../../../src/engines/space-scene/materials-schema';

const MATERIALS = [
  ['wood', 'Wood', '木'],
  ['metal', 'Metal', '金属'],
  ['ceramic', 'Ceramic', '陶瓷'],
  ['rubber', 'Rubber', '橡胶'],
  ['glass', 'Glass', '玻璃'],
  ['plastic', 'Plastic', '塑料'],
  ['fabric', 'Fabric', '布'],
] as const;
export const MATERIAL_IDS = MATERIALS.map(([id]) => id);

const label = (en: string, zh: string) => ({ en, zh });
const materialOptions = MATERIALS.map(([id, en, zh]) => ({ id, label: label(en, zh) }));
const states = (entries: [string, string, string][]) => Object.fromEntries(entries.map(([id, en, zh]) => [id, label(en, zh)]));

export const materialsBench = materialsSchema.parse({
  g: 9.8,
  samples: {
    wood: { E: 10.7, limit: 100.7, fails: 'snaps', density: 650, absorbs: true, light: 'none' },
    metal: { E: 200, limit: 250, fails: 'bends', density: 7820, absorbs: false, light: 'none' },
    ceramic: { E: 70, limit: 35, fails: 'snaps', density: 2400, absorbs: false, light: 'none' },
    rubber: { E: 0.005, fails: 'never', density: 920, absorbs: false, light: 'none' },
    glass: { E: 70, limit: 36, fails: 'snaps', density: 2500, absorbs: false, light: 'most' },
    plastic: { E: 1.2, limit: 25, fails: 'bends', density: 955, absorbs: false, light: 'some' },
    fabric: { limp: true, fails: 'never', density: 1540, absorbs: true, light: 'some' },
  },
  strip: { width: 0.03, thick: 0.002 },
  bridge: { strip: 'strip', masses: 'masses', mass: 0.5, span: 0.2, clearance: 0.06, bend: { little: 0.005, lot: 0.03 } },
  cantilever: { strip: 'strip', push: 'push', reach: 0.25, droop: 0.01, hang: 0.8 },
  tank: {
    block: 'block',
    water: 18,
    density: 1000,
    height: 25,
    blocks: {
      wood: { sample: 'wood', height: 3 },
      'wood-big': { sample: 'wood', height: 6 },
      metal: { sample: 'metal', height: 3 },
      ceramic: { sample: 'ceramic', height: 3 },
      rubber: { sample: 'rubber', height: 3 },
      glass: { sample: 'glass', height: 3 },
      plastic: { sample: 'plastic', height: 3 },
      bottle: { density: 40, height: 6.5 },
      fabric: { sample: 'fabric', height: 1 },
    },
  },
  drops: { square: 'square' },
  light: { square: 'square', dark: { most: 0.1, some: 0.6, none: 1 } },
  profile: { pick: 'pick', masses: 5, push: 2, block: 'same', square: 'same' },
});

export const MATERIALS_CONTROLS = [
  { id: 'strip', kind: 'choice', default: 'wood', label: label('Strip', '材料条'), options: materialOptions },
  { id: 'masses', kind: 'step', values: [0, 1, 2, 3, 4, 5], default: 0, label: label('500 g masses on the strip', '条上的 500 克槽码') },
  { id: 'push', kind: 'step', values: [0, 0.5, 1, 1.5, 2], default: 0, unit: 'cm', label: label('End pushed down', '末端压下') },
  {
    id: 'block',
    kind: 'choice',
    default: 'wood',
    label: label('Put into the water', '放进水里的'),
    options: [
      { id: 'wood', label: label('Wooden block', '木块') },
      { id: 'wood-big', label: label('Big wooden board', '大木板') },
      { id: 'metal', label: label('Steel block', '钢块') },
      { id: 'ceramic', label: label('Ceramic block', '陶瓷块') },
      { id: 'rubber', label: label('Rubber block', '橡胶块') },
      { id: 'glass', label: label('Glass block', '玻璃块') },
      { id: 'plastic', label: label('Plastic block', '塑料块') },
      { id: 'bottle', label: label('Capped empty bottle', '盖好的空瓶') },
      { id: 'fabric', label: label('Folded cotton', '叠好的棉布') },
    ],
  },
  { id: 'square', kind: 'choice', default: 'plastic', label: label('Sample', '样片'), options: materialOptions },
  { id: 'pick', kind: 'choice', default: 'wood', label: label('Material', '材料'), options: materialOptions },
];

const RESULT = states([['holds', 'Holds them', '托得住'], ['on-bench', 'Bends onto the bench', '弯到台面上'], ['snapped', 'Snaps', '断了']]);
const VIEW = states([...MATERIALS.map(([id, en, zh]): [string, string, string] => [id, en, zh]), ['glass-snapped', 'Glass, snapped', '玻璃，断了'], ['ceramic-snapped', 'Ceramic, snapped', '陶瓷，断了']]);
const FLEX = states([['bends', 'Bends without breaking', '弯而不断'], ['droops', 'Droops by itself', '自己垂下来'], ['snapped', 'Snaps', '断了']]);
const FLOAT = states([['floats', 'Floats', '浮'], ['sinks', 'Sinks', '沉']]);
const WATER = states([['stays-on-top', 'Stays on top', '停在上面'], ['soaks-in', 'Soaks in', '吸进去']]);
const LIGHT = states([['most', 'Most', '大部分'], ['some', 'Some', '一部分'], ['none', 'None', '没有']]);

export const MATERIALS_OUTPUTS = [
  { id: 'strength-result', kind: 'state', from: 'bridge:result', label: label('Strength test', '强度测试'), states: RESULT },
  { id: 'strength-bend', kind: 'state', from: 'bridge:bend', label: label('How much it bends', '弯得多少'), states: states([['hardly', 'Hardly bends', '几乎不弯'], ['a-little', 'Bends a little', '弯一点'], ['a-lot', 'Bends a lot', '弯很多'], ['none', 'Snapped', '断了']]) },
  { id: 'bridge-view', kind: 'state', from: 'bridge:view', label: label('On the supports', '架上的条'), states: VIEW },
  { id: 'bridge-sag', from: 'bridge:sag', unit: 'm', label: label('Sag (drawn)', '下垂（画面）') },
  { id: 'masses-on', from: 'control:masses-kg', unit: 'kg', decimals: 1, label: label('Masses on the strip', '条上的砝码') },
  { id: 'flex-result', kind: 'state', from: 'cantilever:result', label: label('Flexibility test', '柔韧测试'), states: { 'not-pushed': label('Not pushed yet', '还没压'), ...FLEX } },
  { id: 'bend-view', kind: 'state', from: 'cantilever:view', label: label('In the clamp', '夹着的条'), states: VIEW },
  { id: 'flex-tip', from: 'cantilever:tip', unit: 'm', label: label('End drop (drawn)', '末端下垂（画面）') },
  { id: 'push-down', from: 'control:push', unit: 'cm', decimals: 1, label: label('End pushed down', '末端压下') },
  { id: 'float-result', kind: 'state', from: 'tank:result', label: label('In the water', '放进水里'), states: FLOAT },
  { id: 'float-rise', from: 'tank:rise', unit: 'cm', label: label('Underside above the floor (drawn)', '底面离缸底（画面）') },
  { id: 'drop-result', kind: 'state', from: 'drops:result', label: label('The drop of water', '那滴水'), states: WATER },
  { id: 'light-result', kind: 'state', from: 'light:result', label: label('Light through', '透过的光'), states: LIGHT },
  { id: 'light-dark', from: 'light:dark', label: label('Shadow darkness (drawn)', '影子深浅（画面）') },
  { id: 'p-strength', kind: 'state', from: 'profile:strength', label: label('Strength', '强度'), states: RESULT },
  { id: 'p-flex', kind: 'state', from: 'profile:flex', label: label('Flexibility', '柔韧性'), states: FLEX },
  { id: 'p-float', kind: 'state', from: 'profile:float', label: label('Float or sink', '浮沉'), states: FLOAT },
  { id: 'p-water', kind: 'state', from: 'profile:water', label: label('Waterproof', '防水'), states: WATER },
  { id: 'p-light', kind: 'state', from: 'profile:light', label: label('Light through', '透光'), states: LIGHT },
];

export const materialsSim = () => simSchema.parse({ kind: 'materials', controls: MATERIALS_CONTROLS, outputs: MATERIALS_OUTPUTS, bind: [], materials: materialsBench });
