/**
 * Author template for `flower-and-seed` (docs/41 §4.2, with the §0.3
 * revisions): the whole `sim` section of its parts.json — the six controls,
 * every output with draft labels, every binding (the fruits brought forward,
 * the rubber fruit bursting and the balsam pod splitting, the three travel
 * flows, the day strip's marker and half flag, the four cups' seeds,
 * seedlings and pale tint, the two rings) and the `seeds` data: seven fruits
 * (§2.6 T1), Silwal et al. 2026's three laboratory medians (§2.6 T2: the day
 * by which half of the seeds that finally germinated had germinated) and the
 * four cups A, B, D, E (§0.3: cup C, under boiled water, is dropped; cup E's
 * "no germination in a week" is a result of this model). Labels are drafts
 * for the content author; the unit tests pin every cell
 * (tests/space-scene/seeds.test.ts).
 */
const label = (en: string, zh: string) => ({ en, zh });

export const SEED_CUPS = ['a', 'b', 'd', 'e'] as const;
export const SEED_FRUITS = ['angsana', 'sea-almond', 'coconut', 'chilli', 'fig', 'rubber', 'balsam'] as const;
const CUP_NAME: Record<(typeof SEED_CUPS)[number], [string, string]> = { a: ['Cup A', 'A 杯'], b: ['Cup B', 'B 杯'], d: ['Cup D', 'D 杯'], e: ['Cup E', 'E 杯'] };
const cupOptions = SEED_CUPS.map((id) => ({ id, label: label(...CUP_NAME[id]) }));
const RESULT_STATES = {
  waiting: label('Just set up', '刚放好'),
  germinated: label('Germinated', '发芽了'),
  'not-germinated': label('Not germinated', '没有发芽'),
};

export const SEEDS_BENCH_SIM = {
  kind: 'seeds',
  controls: [
    {
      id: 'fruit',
      kind: 'choice',
      default: 'angsana',
      label: label('Fruit', '果实'),
      options: [
        { id: 'angsana', label: label('Angsana', '青龙木') },
        { id: 'sea-almond', label: label('Sea almond', '榄仁树') },
        { id: 'coconut', label: label('Coconut', '椰子') },
        { id: 'chilli', label: label('Chilli', '辣椒') },
        { id: 'fig', label: label('Fig', '榕果') },
        { id: 'rubber', label: label('Rubber tree', '橡胶树') },
        { id: 'balsam', label: label('Garden balsam', '凤仙花') },
      ],
    },
    { id: 'temp', kind: 'step', values: [14, 17, 20], default: 20, unit: '°C', label: label('Temperature (lab study)', '温度（实验室研究）') },
    { id: 'count-day', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], default: 0, unit: 'd', label: label('Day', '第几天') },
    { id: 'cup', kind: 'choice', default: 'a', label: label('Cup to look at', '看哪一杯'), options: cupOptions },
    { id: 'against', kind: 'choice', default: 'a', label: label('Compared with', '和哪一杯比'), options: cupOptions },
    { id: 'day', kind: 'step', values: [0, 7], default: 0, unit: 'd', label: label('Day', '第几天') },
  ],
  outputs: [
    {
      id: 'method',
      kind: 'state',
      from: 'dispersal:method',
      label: label('How the seeds travel', '种子怎样传播'),
      states: { wind: label('By the wind', '靠风'), water: label('By water', '靠水'), animals: label('By animals', '靠动物'), splitting: label('The fruit bursts or splits open', '果实爆开或裂开') },
    },
    {
      id: 'feature',
      kind: 'state',
      from: 'dispersal:feature',
      label: label('What helps', '帮了忙的结构'),
      states: { wing: label('A wing', '翅'), floats: label('Air spaces: it floats', '有空隙，能浮'), eaten: label('Juicy fruit animals eat', '动物吃的多汁果实'), bursts: label('A dry fruit that bursts', '干了会爆开的果') },
    },
    { id: 'half-day', from: 'timing:median', label: label('Half of those that germinate, by day', '发芽的种子一半发芽，在第几天'), unit: 'd', decimals: 1 },
    {
      id: 'half',
      kind: 'state',
      from: 'timing:half',
      label: label('By this day', '到这一天'),
      states: { fewer: label('Fewer than half of those that germinate', '发芽的种子里还不到一半'), 'half-or-more': label('Half or more of those that germinate', '发芽的种子里有一半或更多') },
    },
    { id: 'temp-now', from: 'control:temp', label: label('Temperature', '温度'), unit: '°C', decimals: 0 },
    { id: 'cup-result', kind: 'state', from: 'cups:result', label: label('This cup', '这一杯'), states: RESULT_STATES },
    { id: 'against-result', kind: 'state', from: 'cups:against-result', label: label('The cup it is compared with', '拿来比的那一杯'), states: RESULT_STATES },
    {
      id: 'changed',
      kind: 'state',
      from: 'cups:changed',
      label: label('What is different', '改了什么'),
      // No two of the four cups differ only in air (cup C is dropped, §0.3): `air` would be a state the model never gives.
      states: {
        'same-cup': label('Nothing: the same cup', '没有改：同一杯'),
        water: label('Only the water', '只改了水'),
        warmth: label('Only the warmth', '只改了温度'),
        light: label('Only the light', '只改了光'),
        'more-than-one': label('More than one thing: not a fair test', '不止一样：不是公平测试'),
      },
    },
    { id: 'seedlings', kind: 'state', from: 'cups:seedlings', label: label('Seedlings', '幼苗'), states: { none: label('None yet', '还没有'), green: label('Green', '绿色'), pale: label('Pale', '发白') } },
    { id: 'day-now', from: 'control:day', label: label('Day', '第几天'), unit: 'd', decimals: 0 },
    ...SEED_CUPS.map((k) => ({ id: `grown-${k}`, from: `cup:${k}:grown`, label: label(`Seedlings in ${CUP_NAME[k][0].toLowerCase()}`, `${CUP_NAME[k][1]}的幼苗`) })),
    ...SEED_CUPS.map((k) => ({ id: `pale-${k}`, from: `cup:${k}:pale`, label: label(`Pale seedlings in ${CUP_NAME[k][0].toLowerCase()}`, `${CUP_NAME[k][1]}的幼苗发白`) })),
  ],
  bind: [
    // A part takes one pose per binding pass: the rubber fruit's and the balsam pod's opening poses carry the move to the front as well.
    { control: 'fruit', part: 'angsana-pod', pose: { angsana: 'angsana-front' } },
    { control: 'fruit', part: ['sea-almond', 'sea-almond-cut'], pose: { 'sea-almond': 'sea-almond-front' } },
    { control: 'fruit', part: 'coconut', pose: { coconut: 'coconut-front' } },
    { control: 'fruit', part: 'chilli-cut', pose: { chilli: 'chilli-front' } },
    { control: 'fruit', part: 'ripe-figs', pose: { fig: 'fig-front' } },
    { control: 'fruit', part: ['rubber-capsule', 'rubber-seeds'], pose: { rubber: 'capsule-burst' } },
    { control: 'fruit', part: 'balsam-pod', pose: { balsam: 'pod-split' } },
    { output: 'method', flow: 'wind-drift', visible: { eq: 'wind' } },
    { output: 'method', flow: 'water-drift', visible: { eq: 'water' } },
    { output: 'method', flow: 'seed-burst', visible: { eq: 'splitting' } },
    { control: 'count-day', part: 'day-marker', offset: { axis: [1, 0, 0], per: 0.01, origin: 0 } },
    { output: 'half-day', part: 'half-flag', offset: { axis: [1, 0, 0], per: 0.01, origin: 0 } },
    ...SEED_CUPS.flatMap((k) => [
      { output: `grown-${k}`, part: `seeds-${k}`, visible: { eq: 0 } },
      { output: `grown-${k}`, part: `seedlings-${k}`, visible: true },
      { output: `pale-${k}`, part: `seedlings-${k}`, tint: { color: 'token:seedling-pale', full: 1, max: 0.85 } },
    ]),
    { control: 'cup', part: 'pick-ring', pose: Object.fromEntries(SEED_CUPS.map((k) => [k, `pick-${k}`])) },
    { control: 'against', part: 'ref-ring', pose: Object.fromEntries(SEED_CUPS.map((k) => [k, `ref-${k}`])) },
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

/** The parts, flows and poses the template's bindings name (for the unit tests' context). */
export const SEEDS_BENCH_PARTS = [
  'angsana-pod', 'sea-almond', 'sea-almond-cut', 'coconut', 'chilli-cut', 'ripe-figs', 'rubber-capsule', 'rubber-seeds', 'balsam-pod',
  'day-marker', 'half-flag', 'pick-ring', 'ref-ring',
  ...SEED_CUPS.flatMap((k) => [`cup-${k}`, `seeds-${k}`, `seedlings-${k}`]),
];
export const SEEDS_BENCH_FLOWS = ['wind-drift', 'water-drift', 'seed-burst'];
export const SEEDS_BENCH_POSES = [
  'angsana-front', 'sea-almond-front', 'coconut-front', 'chilli-front', 'fig-front', 'capsule-burst', 'pod-split',
  ...SEED_CUPS.flatMap((k) => [`pick-${k}`, `ref-${k}`]),
];

/** docs/41 §2.6 as first drafted (five cups, with C under boiled and cooled water): the engine still reproduces that table. */
export const FIVE_CUPS = {
  ...SEEDS_BENCH_SIM.seeds.cups,
  set: { ...SEEDS_BENCH_SIM.seeds.cups.set, c: { water: true, air: false, place: 'windowsill' } },
};
