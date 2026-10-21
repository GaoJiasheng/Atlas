/**
 * The sort model's data for the living-things bench (docs/38 §3.4, §4.2 with
 * the §9.1 engine record): which features each specimen has, the questions,
 * the true groups, the three tray layouts, the seven trays (the whole case and
 * T1–T6) and the classmate's arrangement of T5. Nothing here says where a
 * specimen lands: the model works that out from the features and the question
 * (docs/30 D2). The feature table is a design choice of this topic (S59): each
 * entry follows what the model shows and the sources cited in its detail.
 */
import { LAYOUTS } from './specimens/lab';
import {
  CONTROL_TEXT,
  LAYOUT_STATE_TEXT,
  NOT_SORTED,
  OUTPUT_TEXT,
  QUESTION_TEXT,
  SUSPECT_TEXT,
  TRAY_TEXT,
  TRUE_GROUP_TEXT,
  VERDICT_TEXT,
  whereText,
} from './text';

type Q = keyof typeof QUESTION_TEXT;

export const ALIVE: Q[] = ['moves', 'responds', 'grows', 'reproduces', 'needs'];
export const BIG: Q[] = ['makes-food', 'mouth', 'fungus'];
export const PLANT: Q[] = ['flowers-now', 'flowers-or-fruits', 'needles', 'green', 'flowering'];
export const ANIMAL: Q[] = ['six-legs', 'feathers', 'hair', 'fins', 'scales', 'moist-skin', 'can-fly'];

/** Answers to the columns `cols`: the ones listed are true, the rest false. */
const yes = (cols: readonly Q[], ...on: Q[]) => Object.fromEntries(cols.map((q) => [q, on.includes(q)]));

/** The 32 specimens in case order (§3.2 #1–#32): true group and the §3.4 features of the trays they sit on. */
export const SPECIMENS: Record<string, { group: string; traits: Record<string, boolean> }> = {
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

/** §2.8 T5: the classmate's tray (seven animals in the wrong group). */
export const CLASSMATE = {
  a: { heading: 'insect', members: ['grasshopper', 'beetle', 'spider'] },
  b: { heading: 'bird', members: ['javan-myna', 'fruit-bat'] },
  c: { heading: 'mammal', members: ['plantain-squirrel'] },
  d: { heading: 'fish', members: ['penguin', 'dolphin', 'snakehead', 'guppy', 'shark'] },
  e: { heading: 'reptile', members: ['pangolin', 'house-gecko', 'python', 'hawksbill-turtle', 'asian-toad'] },
  f: { heading: 'amphibian', members: ['tree-frog', 'mudskipper'] },
  x: { heading: 'none', members: [] as string[] },
};

const SUSPECTS = ['fruit-bat', 'dolphin', 'penguin', 'spider', 'asian-toad', 'mudskipper', 'pangolin', 'shark'];
const FIRST: Q[] = ['feathers', 'hair', 'six-legs', 'fins', 'scales', 'can-fly'];

const opt = (ids: readonly string[], labels: Record<string, { en: string; zh: string }>) => ids.map((id) => ({ id, label: labels[id]! }));
const where = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, whereText(id)]));
const count = (id: string, from: string) => ({ id, from, label: OUTPUT_TEXT[id]! });

export const PAD_IDS = Object.values(LAYOUTS).flatMap((l) => Object.values(l).map((g) => g.pad));

export const SIM = {
  kind: 'sort',
  controls: [
    { id: 'tray', kind: 'choice', default: 'all', label: CONTROL_TEXT.tray, options: opt(Object.keys(TRAY_TEXT), TRAY_TEXT) },
    { id: 'q-alive', kind: 'choice', default: 'none', label: CONTROL_TEXT['q-alive'], options: opt(['none', ...ALIVE], { none: NOT_SORTED, ...QUESTION_TEXT }) },
    { id: 'asked-big', kind: 'step', values: [0, 1, 2, 3], default: 0, label: CONTROL_TEXT['asked-big'] },
    { id: 'q-plant', kind: 'choice', default: 'none', label: CONTROL_TEXT['q-plant'], options: opt(['none', ...PLANT], { none: NOT_SORTED, ...QUESTION_TEXT }) },
    { id: 'asked-animal', kind: 'step', values: [0, 1, 2, 3, 4, 5, 6], default: 0, label: CONTROL_TEXT['asked-animal'] },
    { id: 'suspect', kind: 'choice', default: 'fruit-bat', label: CONTROL_TEXT.suspect, options: opt(SUSPECTS, SUSPECT_TEXT) },
    { id: 'fix', kind: 'toggle', default: false, label: CONTROL_TEXT.fix },
    { id: 'first', kind: 'choice', default: 'feathers', label: CONTROL_TEXT.first, options: opt(FIRST, QUESTION_TEXT) },
    { id: 'second', kind: 'choice', default: 'hair', label: CONTROL_TEXT.second, options: opt(FIRST, QUESTION_TEXT) },
  ],
  outputs: [
    { id: 'slots', kind: 'vector', from: 'slots', label: OUTPUT_TEXT.slots },
    { id: 'layout', kind: 'state', from: 'layout', label: OUTPUT_TEXT.layout, states: LAYOUT_STATE_TEXT },
    count('on-tray', 'count:tray'),
    count('count-u', 'count:u'),
    ...['a', 'b', 'c', 'd', 'e', 'f', 'x'].map((g) => count(`count-${g}`, `count:${g}`)),
    count('kinds-a', 'kinds:a'),
    count('kinds-b', 'kinds:b'),
    count('wrong', 'wrong'),
    { id: 'verdict', kind: 'state', from: 'verdict', label: OUTPUT_TEXT.verdict, states: VERDICT_TEXT },
    {
      id: 'belongs',
      kind: 'state',
      from: 'belongs',
      label: OUTPUT_TEXT.belongs,
      states: { bird: TRUE_GROUP_TEXT.bird, mammal: TRUE_GROUP_TEXT.mammal, fish: TRUE_GROUP_TEXT.fish, amphibian: TRUE_GROUP_TEXT.amphibian, none: TRUE_GROUP_TEXT.none },
    },
    { id: 'where-toy-car', kind: 'state', from: 'where:toy-car', label: OUTPUT_TEXT['where-toy-car'], states: where('u', 'a', 'b', 'off') },
    { id: 'where-mushroom', kind: 'state', from: 'where:mushroom', label: OUTPUT_TEXT['where-mushroom'], states: where('u', 'a', 'c', 'off'), predictOnly: ['a'] },
    { id: 'where-chilli', kind: 'state', from: 'where:chilli-seedling', label: OUTPUT_TEXT['where-chilli'], states: where('u', 'a', 'b', 'off') },
    { id: 'where-dolphin', kind: 'state', from: 'where:dolphin', label: OUTPUT_TEXT['where-dolphin'], states: where('u', 'a', 'b', 'c', 'd', 'off') },
  ],
  bind: [
    { output: 'slots', part: SPECIMEN_IDS, shift: { ease: 0.8, stagger: 0.03, lift: 0.04 } },
    { output: 'layout', part: ['pad-2a', 'pad-2b'], visible: { eq: 'two' } },
    { output: 'layout', part: ['pad-3a', 'pad-3b', 'pad-3c'], visible: { eq: 'three' } },
    { output: 'layout', part: ['pad-6a', 'pad-6b', 'pad-6c', 'pad-6d', 'pad-6e', 'pad-6f', 'pad-x'], visible: { eq: 'six' } },
  ],
  sort: {
    groups: Object.fromEntries(
      Object.entries(TRUE_GROUP_TEXT).map(([id, label]) => [
        id,
        { label, big: id === 'flowering' || id === 'non-flowering' ? 'plant' : ['non-living', 'fungus', 'bacteria'].includes(id) ? id : 'animal' },
      ]),
    ),
    questions: Object.fromEntries(Object.entries(QUESTION_TEXT).map(([id, label]) => [id, { label }])),
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
