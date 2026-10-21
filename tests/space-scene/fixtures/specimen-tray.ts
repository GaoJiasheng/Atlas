/**
 * The docs/38 §4.2 sort model of the living-things specimen bench as a sim:
 * the controls, the outputs, the bindings and the complete `sort` data — the
 * twelve true groups, the questions, all 32 specimens with the §3.4 feature
 * table, the three tray layouts (§3.2 coordinates: 1 scene unit = 1 m) and
 * the seven trays (T1–T6 and the whole case), the classmate's arrangement
 * of §2.8 T5 included. Parts: every specimen a stand-in sphere in its case
 * cell (§3.2: row by row from the back left, cell centre x = −0.36 + 0.09 c,
 * z = −0.465 + 0.09 r) and the twelve felt pads. The unit tests pin §2.8 on
 * it, and it is the template the living-things author copies (part ids,
 * control and output ids are the spec's).
 */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';
import type { SortCheckPart } from '../../../src/engines/space-scene/sort-schema';

const b = (en: string, zh: string) => ({ en, zh });

/** Questions (§3.4, §4.2): id → label. */
const QUESTIONS = {
  moves: b('Moves about by itself', '能自己走动'),
  responds: b('Responds to changes', '对变化有反应'),
  grows: b('Grows', '会生长'),
  reproduces: b('Reproduces', '会繁殖'),
  needs: b('Needs water, food and air', '需要水、食物和空气'),
  'makes-food': b('Green and makes its own food', '绿色、自己制造食物'),
  mouth: b('Takes in food through a mouth', '用嘴吃进食物'),
  fungus: b('A mushroom, mould or yeast', '是蘑菇、霉菌或酵母'),
  'flowers-now': b('Has flowers now', '现在有花'),
  'flowers-or-fruits': b('Has flowers, buds or fruits now', '现在有花、花苞或果实'),
  needles: b('Has thin, needle-like leaves', '叶子细得像针'),
  green: b('Is green', '是绿色的'),
  flowering: b('Bears flowers at some time', '某个时候会开花'),
  'six-legs': b('Six legs, three body parts', '六条腿、身体分三部分'),
  feathers: b('Has feathers', '有羽毛'),
  hair: b('Has hair', '有毛发'),
  fins: b('Has fins', '有鳍'),
  scales: b('Has scales on its body', '身上有鳞片'),
  'moist-skin': b('Moist skin, no scales', '皮肤湿润、没有鳞片'),
  'can-fly': b('Can fly', '会飞'),
} as const;
type Q = keyof typeof QUESTIONS;

/** True groups (§3.1, §4.2). */
const GROUPS = {
  'non-living': { label: b('Not alive', '非生物'), big: 'non-living' },
  flowering: { label: b('Flowering plants', '开花植物'), big: 'plant' },
  'non-flowering': { label: b('Non-flowering plants', '不开花植物'), big: 'plant' },
  fungus: { label: b('Fungi', '真菌'), big: 'fungus' },
  bacteria: { label: b('Bacteria', '细菌'), big: 'bacteria' },
  insect: { label: b('Insects', '昆虫'), big: 'animal' },
  bird: { label: b('Birds', '鸟类'), big: 'animal' },
  mammal: { label: b('Mammals', '哺乳动物'), big: 'animal' },
  fish: { label: b('Fish', '鱼类'), big: 'animal' },
  reptile: { label: b('Reptiles', '爬行动物'), big: 'animal' },
  amphibian: { label: b('Amphibians', '两栖动物'), big: 'animal' },
  none: { label: b('Not in these six groups', '不在这六类里'), big: 'animal' },
};

const ALIVE: Q[] = ['moves', 'responds', 'grows', 'reproduces', 'needs'];
const BIG: Q[] = ['makes-food', 'mouth', 'fungus'];
const PLANT: Q[] = ['flowers-now', 'flowers-or-fruits', 'needles', 'green', 'flowering'];
const ANIMAL: Q[] = ['six-legs', 'feathers', 'hair', 'fins', 'scales', 'moist-skin', 'can-fly'];

/** Answers to the columns `cols` of a tray: the ones listed are true, the rest false. */
const yes = (cols: readonly Q[], ...on: Q[]) => Object.fromEntries(cols.map((q) => [q, on.includes(q)]));

/** The 32 specimens in case order (§3.2 #1–32) with their true group and the §3.4 features of the trays they are on. */
export const SPECIMENS: Record<string, { group: keyof typeof GROUPS; traits: Record<string, boolean> }> = {
  'toy-car': { group: 'non-living', traits: yes(ALIVE, 'moves', 'responds') },
  pebble: { group: 'non-living', traits: yes(ALIVE) },
  'plastic-flower': { group: 'non-living', traits: yes(ALIVE) },
  ixora: { group: 'flowering', traits: { ...yes(BIG, 'makes-food'), ...yes(PLANT, 'flowers-now', 'flowers-or-fruits', 'green', 'flowering') } },
  'chilli-seedling': { group: 'flowering', traits: { ...yes(ALIVE, 'responds', 'grows', 'reproduces', 'needs'), ...yes(BIG, 'makes-food'), ...yes(PLANT, 'green', 'flowering') } },
  'rhu-sapling': { group: 'flowering', traits: yes(PLANT, 'flowers-or-fruits', 'needles', 'green', 'flowering') },
  'birds-nest-fern': { group: 'non-flowering', traits: { ...yes(BIG, 'makes-food'), ...yes(PLANT, 'green') } },
  'staghorn-fern': { group: 'non-flowering', traits: yes(PLANT, 'green') },
  moss: { group: 'non-flowering', traits: { ...yes(BIG, 'makes-food'), ...yes(PLANT, 'green') } },
  mushroom: { group: 'fungus', traits: yes(BIG, 'fungus') },
  'bracket-fungus': { group: 'fungus', traits: yes(BIG, 'fungus') },
  'mouldy-bread': { group: 'fungus', traits: yes(BIG, 'fungus') },
  yeast: { group: 'fungus', traits: yes(BIG, 'fungus') },
  'bacteria-dish': { group: 'bacteria', traits: yes(BIG) },
  grasshopper: { group: 'insect', traits: { ...yes(ALIVE, ...ALIVE), ...yes(BIG, 'mouth'), ...yes(ANIMAL, 'six-legs', 'can-fly') } },
  beetle: { group: 'insect', traits: yes(ANIMAL, 'six-legs', 'can-fly') },
  spider: { group: 'none', traits: yes(ANIMAL) },
  'javan-myna': { group: 'bird', traits: { ...yes(BIG, 'mouth'), ...yes(ANIMAL, 'feathers', 'can-fly') } },
  penguin: { group: 'bird', traits: yes(ANIMAL, 'feathers') },
  'plantain-squirrel': { group: 'mammal', traits: { ...yes(ALIVE, ...ALIVE), ...yes(BIG, 'mouth'), ...yes(ANIMAL, 'hair') } },
  'fruit-bat': { group: 'mammal', traits: yes(ANIMAL, 'hair', 'can-fly') },
  dolphin: { group: 'mammal', traits: yes(ANIMAL, 'fins') },
  pangolin: { group: 'mammal', traits: yes(ANIMAL, 'scales') },
  snakehead: { group: 'fish', traits: { ...yes(BIG, 'mouth'), ...yes(ANIMAL, 'fins', 'scales') } },
  guppy: { group: 'fish', traits: { ...yes(ALIVE, ...ALIVE), ...yes(ANIMAL, 'fins', 'scales') } },
  mudskipper: { group: 'fish', traits: yes(ANIMAL, 'fins', 'scales') },
  shark: { group: 'fish', traits: yes(ANIMAL, 'fins', 'scales') },
  'tree-frog': { group: 'amphibian', traits: yes(ANIMAL, 'moist-skin') },
  'asian-toad': { group: 'amphibian', traits: yes(ANIMAL) },
  'house-gecko': { group: 'reptile', traits: yes(ANIMAL, 'scales') },
  python: { group: 'reptile', traits: yes(ANIMAL, 'scales') },
  'hawksbill-turtle': { group: 'reptile', traits: yes(ANIMAL, 'scales') },
};
export const SPECIMEN_IDS = Object.keys(SPECIMENS);
export const ALIVE_TRAY = ['toy-car', 'pebble', 'plastic-flower', 'chilli-seedling', 'grasshopper', 'plantain-squirrel', 'guppy'];
export const BIG_TRAY = ['ixora', 'chilli-seedling', 'birds-nest-fern', 'moss', 'mushroom', 'bracket-fungus', 'mouldy-bread', 'yeast', 'bacteria-dish', 'grasshopper', 'javan-myna', 'plantain-squirrel', 'snakehead'];
export const PLANT_TRAY = ['ixora', 'chilli-seedling', 'rhu-sapling', 'birds-nest-fern', 'staghorn-fern', 'moss'];
export const ANIMAL_TRAY = SPECIMEN_IDS.slice(14);

const grid = (x: number, z: number, cols: number, rows: number, pad: string, pitch = 0.08, y = 0.011) => ({ at: [x, y, z], cols, rows, pitch, pad });

/** §3.2 layouts: pad centres, columns × rows, 8 cm pitch (X: 7 cm). */
export const LAYOUTS = {
  two: { a: grid(-0.32, 0.23, 7, 6, 'pad-2a'), b: grid(0.32, 0.23, 7, 6, 'pad-2b') },
  three: { a: grid(-0.43, 0.23, 5, 6, 'pad-3a'), b: grid(0, 0.23, 5, 6, 'pad-3b'), c: grid(0.43, 0.23, 5, 6, 'pad-3c') },
  six: {
    a: grid(-0.43, 0.09, 5, 3, 'pad-6a'),
    b: grid(0, 0.09, 5, 3, 'pad-6b'),
    c: grid(0.43, 0.09, 5, 3, 'pad-6c'),
    d: grid(-0.43, 0.37, 5, 3, 'pad-6d'),
    e: grid(0, 0.37, 5, 3, 'pad-6e'),
    f: grid(0.43, 0.37, 5, 3, 'pad-6f'),
    x: grid(0.62, -0.33, 3, 2, 'pad-x', 0.07, 0.005),
  },
};

/** §2.8 T5: the classmate's tray. */
export const CLASSMATE = {
  a: { heading: 'insect', members: ['grasshopper', 'beetle', 'spider'] },
  b: { heading: 'bird', members: ['javan-myna', 'fruit-bat'] },
  c: { heading: 'mammal', members: ['plantain-squirrel'] },
  d: { heading: 'fish', members: ['penguin', 'dolphin', 'snakehead', 'guppy', 'shark'] },
  e: { heading: 'reptile', members: ['pangolin', 'house-gecko', 'python', 'hawksbill-turtle', 'asian-toad'] },
  f: { heading: 'amphibian', members: ['tree-frog', 'mudskipper'] },
  x: { heading: 'none', members: [] as string[] },
};

const options = (ids: readonly string[], labels: Record<string, { en: string; zh: string }>) => ids.map((id) => ({ id, label: labels[id]! }));
const NONE = { none: b('Not sorted yet', '还没分') };
const SUSPECTS = ['fruit-bat', 'dolphin', 'penguin', 'spider', 'asian-toad', 'mudskipper', 'pangolin', 'shark'];
const NAMES: Record<string, { en: string; zh: string }> = {
  'fruit-bat': b('Fruit bat', '果蝠'),
  dolphin: b('Dolphin', '海豚'),
  penguin: b('Penguin', '企鹅'),
  spider: b('Spider', '蜘蛛'),
  'asian-toad': b('Toad', '蟾蜍'),
  mudskipper: b('Mudskipper', '弹涂鱼'),
  pangolin: b('Pangolin', '穿山甲'),
  shark: b('Shark', '鲨鱼'),
};
const FIRST = ['feathers', 'hair', 'six-legs', 'fins', 'scales', 'can-fly'];
const where = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, id === 'u' ? b('In the case', '在标本盒里') : id === 'off' ? b('Not on this tray', '不在这个托盘上') : b(`Group ${id.toUpperCase()}`, `${id.toUpperCase()} 组`)]));

const SIM_INPUT = {
  kind: 'sort',
  controls: [
    {
      id: 'tray',
      kind: 'choice',
      default: 'all',
      label: b('On the tray', '托盘上'),
      options: options(['all', 'alive', 'big', 'plants', 'animals', 'classmate', 'own-key'], {
        all: b('The whole case', '整盒标本'),
        alive: b('Living or not', '生物还是非生物'),
        big: b('Four big groups', '四大类'),
        plants: b('Plants', '植物'),
        animals: b('Animals', '动物'),
        classmate: b("A classmate's tray", '同学的分类盘'),
        'own-key': b('Your own flowchart', '自己的流程图'),
      }),
    },
    { id: 'q-alive', kind: 'choice', default: 'none', label: b('Sort by', '按什么分'), options: options(['none', ...ALIVE], { ...NONE, ...QUESTIONS }) },
    { id: 'asked-big', kind: 'step', values: [0, 1, 2, 3], default: 0, label: b('Questions asked', '问了几个问题') },
    { id: 'q-plant', kind: 'choice', default: 'none', label: b('Sort by', '按什么分'), options: options(['none', ...PLANT], { ...NONE, ...QUESTIONS }) },
    { id: 'asked-animal', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6], default: 0, label: b('Questions asked', '问了几个问题') },
    { id: 'suspect', kind: 'choice', default: 'fruit-bat', label: b('Check this animal', '检查这只动物'), options: options(SUSPECTS, NAMES) },
    { id: 'fix', kind: 'toggle', default: false, label: b('Move to the right groups', '放回正确的组') },
    { id: 'first', kind: 'choice', default: 'feathers', label: b('First question', '第一个问题'), options: options(FIRST, QUESTIONS) },
    { id: 'second', kind: 'choice', default: 'hair', label: b('Second question', '第二个问题'), options: options(FIRST, QUESTIONS) },
  ],
  outputs: [
    { id: 'slots', kind: 'vector', from: 'slots', label: b('Where each specimen goes', '每件标本放在哪里') },
    { id: 'layout', kind: 'state', from: 'layout', label: b('Groups on the tray', '盘上的组'), states: { none: b('None', '没有'), two: b('Two groups', '两组'), three: b('Three groups', '三组'), six: b('Six groups and X', '六组加 X') } },
    { id: 'on-tray', from: 'count:tray', label: b('On the tray', '托盘上') },
    { id: 'count-u', from: 'count:u', label: b('In the case', '盒里') },
    ...['a', 'b', 'c', 'd', 'e', 'f', 'x'].map((g) => ({ id: `count-${g}`, from: `count:${g}`, label: b(`Group ${g.toUpperCase()}`, `${g.toUpperCase()} 组`) })),
    { id: 'kinds-a', from: 'kinds:a', label: b('Kinds in A', 'A 组里的类群数') },
    { id: 'kinds-b', from: 'kinds:b', label: b('Kinds in B', 'B 组里的类群数') },
    { id: 'wrong', from: 'wrong', label: b('Wrongly placed', '放错的') },
    { id: 'verdict', kind: 'state', from: 'verdict', label: b('Placed', '放得'), states: { right: b('Right', '对'), wrong: b('Wrong', '错') } },
    {
      id: 'belongs',
      kind: 'state',
      from: 'belongs',
      label: b('Belongs in', '本该在'),
      states: { bird: GROUPS.bird.label, mammal: GROUPS.mammal.label, fish: GROUPS.fish.label, amphibian: GROUPS.amphibian.label, none: GROUPS.none.label },
    },
    { id: 'where-toy-car', kind: 'state', from: 'where:toy-car', label: b('The toy car is in', '玩具车在'), states: where('u', 'a', 'b', 'off') },
    { id: 'where-mushroom', kind: 'state', from: 'where:mushroom', label: b('The mushroom is in', '蘑菇在'), states: where('u', 'a', 'c', 'off'), predictOnly: ['a'] },
    { id: 'where-chilli', kind: 'state', from: 'where:chilli-seedling', label: b('The chilli plant is in', '辣椒幼苗在'), states: where('u', 'a', 'b', 'off') },
    { id: 'where-dolphin', kind: 'state', from: 'where:dolphin', label: b('The dolphin is in', '海豚在'), states: where('u', 'a', 'b', 'c', 'd', 'off') },
  ],
  bind: [
    { output: 'slots', part: SPECIMEN_IDS, shift: { ease: 0.8, stagger: 0.03, lift: 0.04 } },
    { output: 'layout', part: ['pad-2a', 'pad-2b'], visible: { eq: 'two' } },
    { output: 'layout', part: ['pad-3a', 'pad-3b', 'pad-3c'], visible: { eq: 'three' } },
    { output: 'layout', part: ['pad-6a', 'pad-6b', 'pad-6c', 'pad-6d', 'pad-6e', 'pad-6f', 'pad-x'], visible: { eq: 'six' } },
  ],
  sort: {
    groups: GROUPS,
    questions: Object.fromEntries(Object.entries(QUESTIONS).map(([id, label]) => [id, { label }])),
    specimens: SPECIMENS,
    layouts: LAYOUTS,
    trays: {
      all: { specimens: '*' },
      alive: { specimens: ALIVE_TRAY, layout: 'two', key: { ask: 'q-alive' } },
      big: { specimens: BIG_TRAY, layout: 'six', key: { chain: ['makes-food', 'mouth', 'fungus'], else: 'd', asked: 'asked-big', elseHeading: 'bacteria' } },
      plants: { specimens: PLANT_TRAY, layout: 'two', key: { ask: 'q-plant' } },
      animals: { specimens: ANIMAL_TRAY, layout: 'six', key: { chain: ['six-legs', 'feathers', 'hair', 'fins', 'scales', 'moist-skin'], else: 'x', asked: 'asked-animal', elseHeading: 'none' } },
      classmate: { specimens: ANIMAL_TRAY, layout: 'six', key: { arrangement: CLASSMATE, fix: 'fix', suspect: 'suspect' } },
      'own-key': { specimens: ANIMAL_TRAY, layout: 'three', key: { ask: 'first', no: { ask: 'second' } } },
    },
  },
};

/** The raw sim (copy and edit it to make a broken one in tests). */
export const specimenTrayInput = (): typeof SIM_INPUT => structuredClone(SIM_INPUT);
export const specimenTraySim: SimData = simSchema.parse(SIM_INPUT);

/** Case cell of specimen #n (1-based): §3.2, nine to a row from the back left. */
export function caseCell(n: number): [number, number, number] {
  const c = (n - 1) % 9;
  const r = Math.floor((n - 1) / 9);
  return [-0.36 + 0.09 * c, 0.015, -0.465 + 0.09 * r];
}

const pad = (id: string, x: number, z: number, w: number, d: number, y: number): SortCheckPart => ({ id, primitive: { kind: 'box', size: [w, 0.003, d], at: [x, y - 0.0015, z], color: 'fabric' } as never });

/** Stand-in parts: each specimen a 6 cm sphere resting in its case cell; the pads sized to their grids plus a 2 cm rim. */
export const SPECIMEN_PARTS: SortCheckPart[] = [
  ...SPECIMEN_IDS.map((id, i): SortCheckPart => {
    const [x, y, z] = caseCell(i + 1);
    return { id, primitive: { kind: 'sphere', size: [0.03], at: [x, y + 0.03, z], color: 'chitin' } as never };
  }),
  ...Object.values(LAYOUTS).flatMap((layout) =>
    Object.values(layout).map((g) => pad(g.pad, g.at[0]!, g.at[2]!, g.cols * g.pitch + 0.02, g.rows * g.pitch + 0.02, g.at[1]!)),
  ),
];

/** The simIssues context for these parts. */
export const specimenTrayContext = {
  parts: new Set(SPECIMEN_PARTS.map((p) => p.id)),
  partData: SPECIMEN_PARTS as never,
  flows: new Map(),
  animations: new Map(),
  poses: new Set<string>(),
  countable: new Set<string>(),
  contextParts: new Set<string>(),
};
