/**
 * `pnpm tsx scripts/geo/flower-and-seed/build-chapters.ts` — writes the
 * frontmatter (state, beats, index, try-it cards) of
 * src/content/topics/flower-and-seed/chapters/*.mdx (docs/41 §5 with the
 * §0.3 revisions: four cups, chapter 07 has five beats). Chapter and beat
 * cameras come from the table layout (./layout.ts), captions and summaries
 * from ./captions.json. The body of each file (the text below the
 * frontmatter) is kept as it is; a chapter file that does not exist yet
 * takes its body from `$BODY_DIR/<file>` when that is given.
 */
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { at, CELLS, CUPBOARD, FIG, frame, frameAt, FRIDGE, FRUITS, HERO, mid, PRESET_CAMERAS, SIDE, SILL, STRIP, VISIT } from './layout';
import CAPTIONS from './captions.json';

type T = { en: string; zh: string };
const t = (en: string, zh: string): T => ({ en, zh });
const DIR = join(import.meta.dirname, '../../../src/content/topics/flower-and-seed/chapters');
const CAP = CAPTIONS as Record<string, { summary: T; note?: T; beats: T[] }>;

type Beat = Record<string, unknown>;
interface Chapter {
  id: string;
  order: number;
  title: T;
  kind?: 'background';
  state: Record<string, unknown>;
  beats: Beat[];
}

const ALL_LAYERS = ['fern', 'spore-close', 'flower-parts', 'pollen-close', 'visitors', 'fig', 'cells', 'fruits', 'seed-inside', 'germination', 'spore-drift', 'pollination', 'seed-travel', 'cycle'];
const base = { view: 'assembled', explode: 0, part: null, cutaway: 'none' };

// Cups A (windowsill), D (cupboard) and E (fridge), roughly at their middles.
const CUP_A = at(SILL, [-0.08, 0.12, 0.01]);
const CUP_D = at(CUPBOARD, [0, 0.06, 0]);
const CUP_E = at(FRIDGE, [0, 0.2, 0.02]);
// Close cameras used by single beats.
const C = {
  underside: frame(SIDE, [0.02, 0.01, 0.12], 0.8, 50, 40),
  sorus: frame(SIDE, [0.19, 0.05, 0.0], 0.52, 24, 40),
  moss: frame(SIDE, [0.15, 0.045, -0.17], 0.5, 18, 60),
  bird: frame(VISIT, [-0.16, 0.2, 0.02], 0.62, 8, -18),
  bat: frame(VISIT, [0.0, 0.2, -0.05], 1.05, 10, 0),
  fig: frame(FIG, [0, 0.055, 0], 0.55, 12, 0),
  plantCells: frame(CELLS, [-0.12, 0.2, 0], 0.5, 6, 0),
  humanCells: frame(CELLS, [0.1, 0.2, 0], 0.55, 6, 0),
  cells: frame(CELLS, [-0.005, 0.2, 0], 0.95, 8, 0),
  chillies: frame(FRUITS, [0.125, 0.015, 0.05], 0.5, 58, 25),
  strip: frame(STRIP, [-0.05, 0.01, 0.03], 0.6, 50, 38),
  sill: frame(SILL, [0, 0.13, 0.01], 0.95, 18, 0),
  dark: frameAt(mid(CUP_A, CUP_D), [0.98, 0.36, 0.25], 1.55),
  coldDark: frameAt(mid(CUP_D, CUP_E), [0.98, 0.4, -0.15], 1.45),
};

const chapters: Chapter[] = [
  {
    id: 'before-you-start',
    order: 0,
    kind: 'background',
    title: t('Before you start', '开始之前'),
    state: { ...base, run: true, layers: ALL_LAYERS, hide: ['pick-ring', 'ref-ring', 'day-strip', 'day-marker', 'half-flag', 'towel-dish', 'fig-wasp', 'pollen-grains', 'ovules'], labels: ['flower', 'sunbird', 'angsana-pod', 'cup-a'], camera: HERO, sim: { set: {} }, index: { parts: ['fern-fronds', 'moss-capsules', 'flower', 'bee', 'sunbird', 'nectar-bat', 'angsana-pod', 'cup-a'] } },
    beats: [
      { labels: ['flower', 'sunbird', 'nectar-bat', 'angsana-pod', 'cup-a'] },
      { camera: 'spores-view', labels: ['fern-fronds', 'moss-capsules'] },
      { camera: 'flower-view', labels: ['stamens', 'pistil', 'bee'] },
      { camera: C.sill, sim: { set: { day: 7 } }, labels: ['seedlings-a', 'cup-a', 'cup-b'] },
    ],
  },
  {
    id: 'spores-and-seeds',
    order: 1,
    title: t('Spores and seeds', '孢子与种子'),
    state: { ...base, run: false, layers: ['fern', 'spore-close', 'spore-drift', 'seed-inside'], labels: ['fern-fronds', 'fern-underside'], camera: PRESET_CAMERAS['spores-view'], index: { parts: ['fern-fronds', 'fern-underside', 'sorus-close', 'moss-cushion', 'moss-capsules', 'bean-cut'] } },
    beats: [
      { labels: ['fern-fronds'] },
      { camera: C.underside, labels: ['fern-underside'] },
      { camera: C.sorus, run: true, labels: ['sorus-close'] },
      { camera: C.moss, labels: ['moss-cushion', 'moss-capsules'] },
      { camera: 'seed-view', labels: ['bean-cut', 'bean-whole'] },
    ],
  },
  {
    id: 'flowers-and-pollination',
    order: 2,
    title: t('Flowers and pollination', '花与传粉'),
    state: { ...base, run: false, layers: ['flower-parts', 'pollen-close', 'pollination'], labels: ['flower', 'stamens', 'pistil'], camera: PRESET_CAMERAS['flower-view'], index: { parts: ['flower', 'sepals', 'stamens', 'pistil', 'flower-section', 'ovules', 'pollen-grains', 'bee'] } },
    beats: [
      { labels: ['flower', 'sepals'] },
      { pose: 'flower-open', labels: ['stamens', 'pistil', 'flower-section'] },
      { pose: 'flower-open', labels: ['stamens', 'pollen-grains', 'ovules'] },
      { run: true, labels: ['bee', 'pistil'] },
      { run: true, labels: ['flower', 'bee'] },
    ],
  },
  {
    id: 'who-carries-pollen',
    order: 3,
    title: t('Who carries pollen', '谁在搬花粉'),
    state: { ...base, run: true, layers: ['visitors', 'fig'], labels: ['sunbird', 'nectar-bat'], camera: PRESET_CAMERAS['visitors-view'], index: { parts: ['sunbird', 'red-flower', 'nectar-bat', 'durian-flowers', 'fig-cut', 'fig-wasp'] } },
    beats: [
      { camera: C.bird, labels: ['sunbird', 'red-flower'] },
      { camera: C.bird, labels: ['sunbird'] },
      { camera: C.bat, labels: ['nectar-bat', 'durian-flowers'] },
      { camera: C.bat, labels: ['nectar-bat'] },
      { camera: C.fig, labels: ['fig-cut', 'fig-wasp'] },
    ],
  },
  {
    id: 'fertilisation',
    order: 4,
    title: t('Fertilisation', '受精'),
    state: { ...base, run: false, layers: ['cells', 'flower-parts', 'fruits'], labels: ['male-cell', 'female-cell'], camera: C.cells, index: { parts: ['male-cell', 'female-cell', 'ovules', 'pistil', 'chilli-young', 'chilli-cut', 'sperm', 'egg'] } },
    beats: [
      { camera: C.plantCells, labels: ['male-cell', 'female-cell'] },
      { camera: C.plantCells, pose: 'cells-fused', labels: ['female-cell'] },
      { camera: 'flower-view', pose: 'flower-open', labels: ['ovules', 'pistil'] },
      { camera: C.chillies, labels: ['chilli-young', 'chilli-cut'] },
      { camera: C.humanCells, pose: 'cells-fused', labels: ['sperm', 'egg'] },
      { camera: C.cells, pose: 'cells-fused', labels: ['male-cell', 'female-cell', 'sperm', 'egg'] },
    ],
  },
  {
    id: 'seed-dispersal',
    order: 5,
    title: t('Seed dispersal', '种子传播'),
    state: {
      ...base,
      run: true,
      layers: ['fruits', 'seed-travel'],
      labels: ['angsana-pod'],
      camera: PRESET_CAMERAS['fruits-view'],
      sim: {
        set: { fruit: 'angsana' },
        try: {
          vary: 'fruit',
          keep: [t('Ripe fruits of plants that grow in Singapore', '新加坡植物的成熟果实')],
          observe: ['method', 'feature'],
          record: true,
          predict: {
            prompt: t('A rubber tree’s fruit has no wing and is not juicy. How do you think its seeds travel?', '橡胶树的果实没有翅，也不多汁。你猜它的种子怎样传播？'),
            start: { fruit: 'angsana' },
            change: { fruit: 'rubber' },
            observe: 'method',
            options: [
              { id: 'wind', label: t('By the wind', '靠风'), means: 'wind' },
              { id: 'water', label: t('By water', '靠水'), means: 'water' },
              { id: 'animals', label: t('By animals', '靠动物'), means: 'animals' },
              { id: 'splitting', label: t('It bursts or splits open', '爆开或裂开'), means: 'splitting' },
            ],
          },
        },
      },
      index: { parts: ['angsana-pod', 'sea-almond', 'sea-almond-cut', 'coconut', 'chilli-cut', 'ripe-figs', 'rubber-capsule', 'rubber-valves', 'rubber-seeds', 'balsam-pod', 'balsam-valves'] },
    },
    beats: [
      { sim: { set: { fruit: 'angsana' } }, labels: ['angsana-pod'] },
      { sim: { set: { fruit: 'sea-almond' } }, labels: ['sea-almond', 'sea-almond-cut'] },
      { sim: { set: { fruit: 'coconut' } }, labels: ['coconut'] },
      { sim: { set: { fruit: 'chilli' } }, labels: ['chilli-cut'] },
      { sim: { set: { fruit: 'rubber' } }, labels: ['rubber-valves', 'rubber-seeds'] },
      { sim: { set: { fruit: 'balsam' } }, labels: ['balsam-valves'] },
    ],
  },
  {
    id: 'inside-a-seed',
    order: 6,
    title: t('Inside a seed', '种子的里面'),
    state: {
      ...base,
      run: false,
      layers: ['seed-inside', 'germination'],
      labels: ['bean-whole', 'bean-cut'],
      camera: PRESET_CAMERAS['seed-view'],
      sim: {
        set: { temp: 20, 'count-day': 0 },
        try: {
          vary: 'temp',
          also: ['count-day'],
          keep: [t('The same kind of seed: mung beans', '同一种种子：绿豆'), t('On damp paper towels', '放在湿纸巾上'), t('Counted every day', '每天数一次')],
          observe: ['half-day', 'half'],
          record: { chart: { y: 'half-day' } },
          predict: {
            prompt: t(
              'At 20 °C, half of the seeds that went on to germinate had done so by about day 4.3. At 14 °C, will it take fewer days, about the same, or more days?',
              '20 °C 时，最终发芽的种子里，大约到第 4.3 天已有一半发芽。14 °C 时，天数会更少、差不多，还是更多？',
            ),
            start: { temp: 20 },
            change: { temp: 14 },
            observe: 'half-day',
            options: [
              { id: 'less', label: t('Fewer days', '更少'), means: 'less' },
              { id: 'same', label: t('About the same', '差不多'), means: 'same' },
              { id: 'more', label: t('More days', '更多'), means: 'more' },
            ],
          },
        },
      },
      index: { parts: ['bean-whole', 'bean-cut', 'bean-sprout', 'towel-dish', 'day-strip', 'day-marker', 'half-flag', 'bean-seedling-close'] },
    },
    beats: [
      { labels: ['bean-whole'] },
      { labels: ['bean-cut'] },
      { labels: ['bean-sprout', 'bean-seedling-close'] },
      { camera: C.strip, sim: { set: { temp: 20, 'count-day': 5 } }, labels: ['half-flag', 'day-marker', 'towel-dish'] },
      { camera: C.strip, sim: { set: { temp: 14, 'count-day': 5 } }, labels: ['half-flag', 'day-marker'] },
    ],
  },
  {
    id: 'a-fair-test-with-seeds',
    order: 7,
    title: t('A fair test with seeds', '种子的公平测试'),
    state: {
      ...base,
      run: false,
      layers: ['germination', 'cycle'],
      labels: ['cup-a', 'cup-b', 'cup-d', 'cup-e'],
      camera: PRESET_CAMERAS['cups-view'],
      sim: {
        set: { cup: 'a', against: 'a', day: 0 },
        try: {
          vary: 'cup',
          also: ['against', 'day'],
          keep: [t('Five green beans in each cup', '每杯五粒绿豆'), t('The same cups and cotton wool', '同样的杯子和棉花'), t('Checked on the same day', '同一天看结果')],
          observe: ['cup-result', 'changed', 'seedlings', 'day-now'],
          record: true,
          predict: {
            prompt: t('Cup D is in a dark cupboard; everything else is the same as cup A. After a week, will its seeds have germinated?', 'D 杯放在黑暗的柜子里，其他都和 A 杯一样。一星期后，它的种子会发芽吗？'),
            start: { cup: 'd', against: 'a', day: 0 },
            change: { day: 7 },
            observe: 'cup-result',
            options: [
              { id: 'yes', label: t('Yes, they germinate', '会发芽'), means: 'germinated' },
              { id: 'no', label: t('No, they need light', '不会，要有光'), means: 'not-germinated' },
            ],
          },
        },
      },
      index: { parts: ['cup-a', 'cup-b', 'cup-d', 'cup-e', 'seeds-b', 'seeds-e', 'seedlings-a', 'seedlings-d', 'pick-ring', 'ref-ring'] },
    },
    beats: [
      { labels: ['cup-a', 'cup-b', 'cup-d', 'cup-e'] },
      { camera: C.sill, sim: { set: { day: 7, cup: 'b', against: 'a' } }, labels: ['seedlings-a', 'seeds-b'] },
      { camera: C.dark, sim: { set: { day: 7, cup: 'd', against: 'a' } }, labels: ['seedlings-d', 'seedlings-a'] },
      { sim: { set: { day: 7, cup: 'e', against: 'a' } }, labels: ['cup-e', 'seeds-e', 'cup-a'] },
      { camera: C.coldDark, run: true, sim: { set: { day: 7, cup: 'e', against: 'd' } }, labels: ['cup-e', 'cup-d'] },
    ],
  },
];

/* ============================================================ write */

const file = (c: Chapter) => `${String(c.order).padStart(2, '0')}-${c.id}.mdx`;
const bodyOf = (name: string): string => {
  const path = join(DIR, name);
  if (existsSync(path)) {
    const src = readFileSync(path, 'utf8');
    const end = src.indexOf('\n---\n', 4);
    return src.slice(end + 5).replace(/^\n+/, '');
  }
  const from = process.env.BODY_DIR ? join(process.env.BODY_DIR, name) : '';
  if (from && existsSync(from)) return readFileSync(from, 'utf8').replace(/^\n+/, '');
  throw new Error(`no body for ${name}: set BODY_DIR`);
};

const keep = new Set(chapters.map(file));
for (const c of chapters) {
  const cap = CAP[c.id];
  if (!cap) throw new Error(`no captions for ${c.id}`);
  if (cap.beats.length !== c.beats.length) throw new Error(`${c.id}: ${c.beats.length} beats, ${cap.beats.length} captions`);
  const state = {
    ...c.state,
    summary: cap.summary,
    ...(c.kind === 'background' && cap.note ? { note: cap.note } : {}),
    beats: c.beats.map((b, i) => ({ ...b, caption: cap.beats[i] })),
  };
  const front = { id: c.id, order: c.order, title: c.title, ...(c.kind ? { kind: c.kind } : {}), sensitive: false, state };
  const body = bodyOf(file(c));
  writeFileSync(join(DIR, file(c)), `---\n${JSON.stringify(front, null, 2)}\n---\n\n${body}`);
}
for (const f of readdirSync(DIR)) if (!keep.has(f)) rmSync(join(DIR, f));
console.log(`flower-and-seed: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + c.beats.length, 0)} beats`);
