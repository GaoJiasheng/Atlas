/**
 * Texts for src/content/topics/materials/data/parts.json (docs/37 §3.5, §3.8,
 * §4.2): part names, the one-line summary that is also the leader label, the
 * detail (paragraphs, [S#] = data/sources.json), groups, presets, the spec
 * rows, the PLATE readings and the try-it controls and outputs. Outcomes are
 * the model's (S1, after fact-check pass 2); no material-property numbers
 * (docs/37 D9). Chinese written on its own (Singapore usage; plastic = 塑料).
 */
type T = { en: string; zh: string };
interface PartText {
  name: T;
  summary: T;
  detail: T;
}

const t = (en: string, zh: string): T => ({ en, zh });
const p = (name: T, summary: T, detail: T): PartText => ({ name, summary, detail });
const para = (...xs: T[]): T => ({ en: xs.map((x) => x.en).join('\n\n'), zh: xs.map((x) => x.zh).join('\n\n') });

type Material = 'wood' | 'metal' | 'ceramic' | 'rubber' | 'glass' | 'plastic' | 'fabric';
const MATS: Material[] = ['wood', 'metal', 'ceramic', 'rubber', 'glass', 'plastic', 'fabric'];

export const GROUP_TEXT: Record<string, T> = {
  'strength-rig': t('Strength', '强度'),
  'bend-rig': t('Flexibility', '柔韧性'),
  'float-tank': t('Float or sink', '浮沉'),
  'drop-tray': t('Waterproof', '防水'),
  'light-bench': t('Light through', '透光'),
  'corner-wood': t('Wood', '木'),
  'corner-metal': t('Metal', '金属'),
  'corner-ceramic': t('Ceramic', '陶瓷'),
  'corner-rubber': t('Rubber', '橡胶'),
  'corner-glass': t('Glass', '玻璃'),
  'corner-plastic': t('Plastic', '塑料'),
  'corner-fabric': t('Fabric', '布'),
};

export const PRESET_TEXT: Record<string, T> = {
  'strength-view': t('Strength', '强度'),
  'bend-view': t('Bend', '弯曲'),
  'tank-view': t('Tank', '水缸'),
  'drops-view': t('Drops', '滴水'),
  'light-view': t('Light', '透光'),
  'corner-view': t('Kitchen', '厨房'),
};

export const SPEC_TEXT = [
  { key: t('Samples', '样品'), value: t('7 MATERIALS · SAME SIZE IN EACH TEST', '7 种材料 · 每个测试大小相同'), tag: 'design' },
  { key: t('Strips', '材料条'), value: t('30 × 3 CM · 2 MM THICK', '30 × 3 厘米 · 2 毫米厚'), tag: 'design' },
  { key: t('Masses', '砝码'), value: t('5 × 500 G', '5 个 500 克'), tag: 'design' },
  { key: t('Tank', '水缸'), value: t('FRESH WATER · 18 CM DEEP', '清水 · 18 厘米深'), tag: 'design' },
];

export const TELEMETRY_TEXT: Record<string, T> = {
  'masses-on': t('Masses on the strip', '条上的砝码'),
  'push-down': t('End pushed down', '末端压下'),
};

const NAMES: Record<Material, T> = {
  wood: t('Wood', '木'),
  metal: t('Metal', '金属'),
  ceramic: t('Ceramic', '陶瓷'),
  rubber: t('Rubber', '橡胶'),
  glass: t('Glass', '玻璃'),
  plastic: t('Plastic', '塑料'),
  fabric: t('Fabric', '布'),
};

export const CONTROL_TEXT = {
  strip: { label: t('Strip', '材料条'), options: NAMES },
  masses: { label: t('500 g masses on the strip', '条上的 500 克槽码') },
  push: { label: t('End pushed down', '末端压下') },
  block: {
    label: t('Put into the water', '放进水里的'),
    options: {
      wood: t('Wooden block', '木块'),
      'wood-big': t('Big wooden board', '大木板'),
      metal: t('Steel block', '钢块'),
      ceramic: t('Ceramic block', '陶瓷块'),
      rubber: t('Rubber block', '橡胶块'),
      glass: t('Glass block', '玻璃块'),
      plastic: t('Plastic block', '塑料块'),
      bottle: t('Capped empty bottle', '盖好的空瓶'),
      fabric: t('Folded cotton', '叠好的棉布'),
    } as Record<string, T>,
  },
  square: { label: t('Sample', '样片'), options: NAMES },
  pick: { label: t('Material', '材料') },
};

export const OUTPUT_TEXT: Record<string, T> = {
  'strength-result': t('Strength test', '强度测试'),
  'strength-bend': t('How much it bends', '弯得多少'),
  'bridge-view': t('On the supports', '架上的条'),
  'bridge-sag': t('Sag (drawn)', '下垂（画面）'),
  'masses-on': t('Masses on the strip', '条上的砝码'),
  'flex-result': t('Flexibility test', '柔韧测试'),
  'bend-view': t('In the clamp', '夹着的条'),
  'flex-tip': t('End drop (drawn)', '末端下垂（画面）'),
  'push-down': t('End pushed down', '末端压下'),
  'float-result': t('In the water', '放进水里'),
  'float-rise': t('Underside above the floor (drawn)', '底面离缸底（画面）'),
  'drop-result': t('The drop of water', '那滴水'),
  'light-result': t('Light through', '透过的光'),
  'light-dark': t('Shadow darkness (drawn)', '影子深浅（画面）'),
  'p-strength': t('Strength', '强度'),
  'p-flex': t('Flexibility', '柔韧性'),
  'p-float': t('Float or sink', '浮沉'),
  'p-water': t('Waterproof', '防水'),
  'p-light': t('Light through', '透光'),
};

const RESULT = { holds: t('Holds them', '托得住'), 'on-bench': t('Bends onto the bench', '弯到台面上'), snapped: t('Snaps', '断了') };
const VIEW: Record<string, T> = { ...NAMES, 'glass-snapped': t('Glass, snapped', '玻璃，断了'), 'ceramic-snapped': t('Ceramic, snapped', '陶瓷，断了') };
const FLEX = { bends: t('Bends without breaking', '弯而不断'), droops: t('Droops by itself', '自己垂下来'), snapped: t('Snaps', '断了') };
const FLOAT = { floats: t('Floats', '浮'), sinks: t('Sinks', '沉') };
const WATER = { 'stays-on-top': t('Stays on top', '停在上面'), 'soaks-in': t('Soaks in', '吸进去') };
const LIGHT = { most: t('Most', '大部分'), some: t('Some', '一部分'), none: t('None', '没有') };

export const STATE_TEXT: Record<string, Record<string, T>> = {
  'strength-result': RESULT,
  'strength-bend': { hardly: t('Hardly bends', '几乎不弯'), 'a-little': t('Bends a little', '弯一点'), 'a-lot': t('Bends a lot', '弯很多'), none: t('Snapped', '断了') },
  'bridge-view': VIEW,
  'flex-result': { 'not-pushed': t('Not pushed yet', '还没压'), ...FLEX },
  'bend-view': VIEW,
  'float-result': FLOAT,
  'drop-result': WATER,
  'light-result': LIGHT,
  'p-strength': RESULT,
  'p-flex': FLEX,
  'p-float': FLOAT,
  'p-water': WATER,
  'p-light': LIGHT,
};

/* ------------------------------------------------------------- samples */

/** What each sample is (docs/37 D5). */
const SAMPLE: Record<Material, T> = {
  wood: t('The wood is teak, a hardwood, left unvarnished [S7].', '木样品是柚木，一种硬木，没有上漆 [S7]。'),
  metal: t('The metal is steel [S9].', '金属样品是钢 [S9]。'),
  ceramic: t('The ceramic is cut from a glazed porcelain tile [S13].', '陶瓷样品切自上了釉的瓷砖 [S13]。'),
  rubber: t('The rubber is natural rubber with nothing mixed in, called pure gum [S8].', '橡胶样品是什么都没掺的天然橡胶，叫“纯胶” [S8]。'),
  glass: t('The glass is clear window glass [S14].', '玻璃样品是透明的窗玻璃 [S14]。'),
  plastic: t('The plastic is HDPE, a milky kind of polyethylene [S11].', '塑料样品是 HDPE，一种乳白色的聚乙烯 [S11]。'),
  fabric: t('The fabric is plain woven cotton [S1].', '布样品是平纹棉布 [S1]。'),
};

const STRIP_NAME: Record<Material, T> = {
  wood: t('Wooden strip', '木条'),
  metal: t('Steel strip', '钢条'),
  ceramic: t('Ceramic strip', '陶瓷条'),
  rubber: t('Rubber strip', '橡胶条'),
  glass: t('Glass strip', '玻璃条'),
  plastic: t('Plastic strip', '塑料条'),
  fabric: t('Cotton strip', '布条'),
};

/** Strength test, all five masses (S1 §2.5 T1 after pass 2). */
const BRIDGE: Record<Material, T> = {
  wood: t(
    'Across the 20 cm gap it bends a little under all five masses and holds them [S1].',
    '架在 20 厘米的间距上，五个槽码全放上去，它弯一点，全都托住 [S1]。',
  ),
  metal: t('It hardly bends under all five masses and holds them [S1].', '五个槽码全放上去，它几乎不弯，全都托住 [S1]。'),
  ceramic: t(
    'It hardly bends, then snaps before all five masses are on. A glazed tile is brittle: it breaks instead of bending [S1, S10].',
    '它几乎不弯，五个槽码还没放完就断了。上了釉的瓷砖是脆的：它不弯，而是断开 [S1, S10]。',
  ),
  rubber: t(
    'This soft rubber cannot hold itself up across the gap: it sags onto the bench before any mass goes on, so this test cannot measure its strength [S1, S26].',
    '这种软橡胶连自己都撑不起来，一个槽码都还没放，就垂到台面上了，所以这个测试测不出它的强度 [S1, S26]。',
  ),
  glass: t(
    'It hardly bends, then snaps before all five masses are on. Glass is brittle, and a cut edge is where it is weakest [S1, S22].',
    '它几乎不弯，五个槽码还没放完就断了。玻璃是脆的，切开的边是它最弱的地方 [S1, S22]。',
  ),
  plastic: t(
    'One mass bends it a lot; from two masses on it rests on the bench, but it does not break [S1, S11].',
    '放一个槽码，它就弯得很厉害；放到两个，它搭到了台面上，可是没有断 [S1, S11]。',
  ),
  fabric: t(
    'A cotton strip hangs down onto the bench by itself. Fabric is tested for strength by pulling it, not by loading it like this [S1, S3].',
    '棉布条自己就垂到了台面上。布的强度要用拉的办法来测，不能像这样压 [S1, S3]。',
  ),
};

/** Flexibility test, pushed down 2 cm (S1 §2.5 T2 after pass 2). */
const BEND: Record<Material, T> = {
  wood: t('Clamped with 25 cm sticking out and pushed down 2 cm, it bends without breaking [S1].', '夹住、伸出 25 厘米，末端压下 2 厘米，它弯了，没有断 [S1]。'),
  metal: t('Clamped with 25 cm sticking out and pushed down 2 cm, it bends without breaking [S1].', '夹住、伸出 25 厘米，末端压下 2 厘米，它弯了，没有断 [S1]。'),
  ceramic: t('It snaps at the clamp before the peg has pushed it down 2 cm: ceramic is not flexible [S1, S10].', '推杆还没压下 2 厘米，它就在夹口处断了：陶瓷不柔韧 [S1, S10]。'),
  rubber: t('It droops under its own weight before the peg reaches it, and bends any amount without breaking [S1, S26].', '推杆还没碰到，它就在自己的重量下垂了下来；怎么弯都不断 [S1, S26]。'),
  glass: t('It snaps at the clamp before the peg has pushed it down 2 cm: glass is not flexible [S1, S22].', '推杆还没压下 2 厘米，它就在夹口处断了：玻璃不柔韧 [S1, S22]。'),
  plastic: t(
    'It droops a little under its own weight, and the peg bends it further without breaking it [S1, S11].',
    '它在自己的重量下先垂下一点，推杆再往下压，它弯得更多，也没有断 [S1, S11]。',
  ),
  fabric: t('It hangs down from the clamp: cloth bends any way without breaking [S1].', '它从夹口垂下来：布怎么弯都不断 [S1]。'),
};

/** Waterproof test (S1 §2.5 T4). */
const DROP: Record<Material, T> = {
  wood: t('The drop slowly soaks in and leaves a damp patch: unvarnished wood absorbs water [S3].', '水慢慢吸了进去，留下一片湿印：没上漆的木头会吸水 [S3]。'),
  metal: t('The drop stays on top: steel does not absorb water [S3].', '水停在上面：钢不吸水 [S3]。'),
  ceramic: t('The drop stays on top: a glazed porcelain tile hardly absorbs any water [S13].', '水停在上面：上了釉的瓷砖几乎不吸水 [S13]。'),
  rubber: t('The drop stays on top: rubber does not absorb water [S15].', '水停在上面：橡胶不吸水 [S15]。'),
  glass: t('The drop stays on top: glass does not absorb water [S1].', '水停在上面：玻璃不吸水 [S1]。'),
  plastic: t('The drop stays on top: HDPE absorbs almost no water [S11].', '水停在上面：HDPE 几乎不吸水 [S11]。'),
  fabric: t('The drop soaks straight in and leaves a damp patch: cotton absorbs water [S3, S12].', '水一下子就吸了进去，留下一片湿印：棉布会吸水 [S3, S12]。'),
};

/** Light test (S1 §2.5 T5). */
const SHEET: Record<Material, T> = {
  wood: t('No light gets through: wood leaves a dark shadow on the screen [S30].', '光穿不过去：木头在屏上留下一块黑影 [S30]。'),
  metal: t('No light gets through: a metal sheet leaves a dark shadow [S30, S31].', '光穿不过去：金属片留下一块黑影 [S30, S31]。'),
  ceramic: t('No light gets through this thick, glazed tile; teaching sources describe thick materials as blocking light [S5].', '光穿不过这块厚厚的釉面瓷砖；教学资料说厚的材料挡光 [S5]。'),
  rubber: t('No light gets through this dark rubber; teaching sources describe thick, dark materials as blocking light [S5].', '光穿不过这块深色的橡胶；教学资料说厚的、深色的材料挡光 [S5]。'),
  glass: t('Most of the light gets through: the shadow on the screen is faint [S14].', '大部分光穿了过去：屏上的影子很淡 [S14]。'),
  plastic: t(
    'Some light gets through: the screen behind it is dimmer, and you cannot see clearly through it. Natural HDPE is sold as translucent [S29, S31].',
    '一部分光穿了过去：它后面的屏暗了一些，透过它也看不清后面。不加颜色的 HDPE 板，厂商说它是半透明的 [S29, S31]。',
  ),
  fabric: t('Some light gets through a single thin layer of cotton [S28].', '单层薄棉布让一部分光穿过 [S28]。'),
};

const MODEL_NOTE = t(
  'Every sample in a test is the same size, so only the material changes [S1, S3]. The bend and the result are worked out by the model from published values; they are drawn, not written as numbers [S1].',
  '同一个测试里样品大小都一样，只改变材料 [S1, S3]。弯多少、结果怎样，是模型按公开数据算出来的，只画出来，不写数字 [S1]。',
);

const sampleParts: Record<string, PartText> = {};
for (const m of MATS) {
  sampleParts[`bridge-${m}`] = p(
    STRIP_NAME[m],
    t(`${STRIP_NAME[m].en}, 30 × 3 cm, 2 mm thick.`, `${STRIP_NAME[m].zh}，30 × 3 厘米，2 毫米厚。`),
    para(t(`${SAMPLE[m].en} ${BRIDGE[m].en}`, `${SAMPLE[m].zh}${BRIDGE[m].zh}`), MODEL_NOTE),
  );
  sampleParts[`bend-${m}`] = p(
    STRIP_NAME[m],
    t('Same strips as the strength test.', '和强度测试是同一套条。'),
    para(t(`${SAMPLE[m].en} ${BEND[m].en}`, `${SAMPLE[m].zh}${BEND[m].zh}`), MODEL_NOTE),
  );
  sampleParts[`square-${m}`] = p(
    t(`${NAMES[m].en} sample`, `${m === 'metal' ? '钢' : NAMES[m].zh}样片`),
    t(`${NAMES[m].en} sample, 8 × 8 cm.`, `${m === 'metal' ? '钢' : NAMES[m].zh}样片，8 × 8 厘米。`),
    para(t(`${SAMPLE[m].en} ${DROP[m].en}`, `${SAMPLE[m].zh}${DROP[m].zh}`), MODEL_NOTE),
  );
  sampleParts[`sheet-${m}`] = p(
    t(`${NAMES[m].en} sample`, `${m === 'metal' ? '钢' : NAMES[m].zh}样片`),
    t(`${NAMES[m].en} sample, 8 × 8 cm.`, `${m === 'metal' ? '钢' : NAMES[m].zh}样片，8 × 8 厘米。`),
    para(t(`${SAMPLE[m].en} ${SHEET[m].en}`, `${SAMPLE[m].zh}${SHEET[m].zh}`), MODEL_NOTE),
  );
}

const SAFETY = t(
  'The pieces are drawn simply; real glass and ceramic can break into sharp splinters. Glass shards falling from height can cause serious injuries, Singapore’s Commissioner of Building Control has warned [S16]. This test is done only in the model.',
  '断开的样子是示意；真实的玻璃和陶瓷会碎出很利的碎片。新加坡的建筑管制专员提醒过：玻璃碎片从高处掉下，会造成严重的伤害 [S16]。这个测试只在模型里做。',
);

export const PART_TEXT: Record<string, PartText> = {
  /* ------------------------------------------------------------ strength */
  'bridge-blocks': p(
    t('Support blocks', '支撑木块'),
    t('Hold each strip up with the same gap.', '用同样的间距把每根条架起来。'),
    para(
      t(
        'Two wooden blocks 6 cm high. Their inner edges are 20 cm apart, and every strip rests across the same gap [S1]. Keeping the blocks and the gap the same, and changing only the strip, is what makes the test fair [S3].',
        '两块 6 厘米高的木块，内侧的边相距 20 厘米，每根条都架在同样的间距上 [S1]。木块和间距都不变、只换材料条，测试才公平 [S3]。',
      ),
      t(
        'The strip rests on the blocks’ inner edges. When it bends, its ends lift off the tops of the blocks, as a ruler does when you press on its middle.',
        '条搭在木块内侧的边上。条一弯，两端就离开木块的顶面翘起来，像压尺子中间时一样。',
      ),
    ),
  ),
  ...Object.fromEntries(Object.entries(sampleParts).filter(([id]) => id.startsWith('bridge-'))),
  'bridge-glass-snapped': p(
    t('Snapped glass strip', '断开的玻璃条'),
    t('Snapped: brittle, it hardly bent first.', '断了：它脆，断之前几乎没弯。'),
    para(
      t(
        'The glass strip bends so little that you can hardly see it, then breaks suddenly into two pieces, and the masses drop onto the bench [S1]. Glass is weakest at its cut edges [S22].',
        '玻璃条弯得少到几乎看不出来，接着突然断成两段，槽码掉到台面上 [S1]。玻璃切开的边是它最弱的地方 [S22]。',
      ),
      SAFETY,
    ),
  ),
  'bridge-ceramic-snapped': p(
    t('Snapped ceramic strip', '断开的陶瓷条'),
    t('Snapped: brittle, it hardly bent first.', '断了：它脆，断之前几乎没弯。'),
    para(
      t(
        'The ceramic strip hardly bends, then breaks suddenly into two pieces [S1]. Ceramics are hard and wear well, but they are brittle [S10]. The broken faces show the pale fired clay under the glaze.',
        '陶瓷条几乎不弯，接着突然断成两段 [S1]。陶瓷硬、耐磨，但是脆 [S10]。断面露出釉下面浅色的烧结陶土。',
      ),
      SAFETY,
    ),
  ),
  'bridge-hanger': p(
    t('Mass carrier', '砝码托'),
    t('Carries the masses at the middle of the strip.', '在条的中点托住槽码。'),
    para(
      t(
        'A steel disc with a rod, sitting at the middle of the strip; the slotted masses slide down the rod one at a time [S1]. The carrier’s own mass is left out of the model.',
        '一块带竖杆的钢盘，放在条的正中；开槽的槽码一个一个套到杆上 [S1]。模型不计托盘本身的质量。',
      ),
      t(
        'When a strip snaps, the carrier and its masses fall onto the bench.',
        '条一断，砝码托和槽码就掉到台面上。',
      ),
    ),
  ),
  'bridge-masses': p(
    t('Masses', '槽码'),
    t('500 g masses, added one at a time.', '500 克的槽码，一个一个加。'),
    para(
      t(
        'Up to five brass slotted masses of 500 g each, so the load goes up in equal steps [S1]. The slot lets each one slide onto the carrier’s rod. Each test uses a fresh strip [S1].',
        '最多五个黄铜槽码，每个 500 克，载荷一级一级同样地增加 [S1]。槽口让槽码能套到托杆上。每次测试都用一根新的条 [S1]。',
      ),
    ),
  ),
  /* --------------------------------------------------------- flexibility */
  'bend-clamp': p(
    t('Clamp block', '夹座'),
    t('Holds one end; 25 cm sticks out.', '夹住一端，伸出 25 厘米。'),
    para(
      t(
        'A wooden block 15 cm high. A steel plate, tightened by two wing screws, presses the first 5 cm of the strip onto it, and the other 25 cm sticks out [S1]. Every strip is clamped the same way, which keeps the test fair [S3].',
        '一块 15 厘米高的木块。两颗蝶形螺丝拧紧一块钢压板，把条的前 5 厘米压在木块上，其余 25 厘米伸出去 [S1]。每根条都这样夹，测试才公平 [S3]。',
      ),
      t(
        'A brittle strip breaks right at the edge of the clamp, where the bend is sharpest [S1].',
        '脆的条正好在夹口的边上断开，那里弯得最急 [S1]。',
      ),
    ),
  ),
  ...Object.fromEntries(Object.entries(sampleParts).filter(([id]) => id.startsWith('bend-'))),
  'bend-glass-snapped': p(
    t('Snapped glass strip', '断开的玻璃条'),
    t('Snapped at the clamp: glass is not flexible.', '在夹口断了：玻璃不柔韧。'),
    para(
      t(
        'Pushed down, the glass strip snaps at the edge of the clamp: a short stub stays in the clamp and the rest falls onto the bench [S1].',
        '往下一压，玻璃条在夹口的边上断开：一小截留在夹座里，其余的掉到台面上 [S1]。',
      ),
      SAFETY,
    ),
  ),
  'bend-ceramic-snapped': p(
    t('Snapped ceramic strip', '断开的陶瓷条'),
    t('Snapped at the clamp: ceramic is not flexible.', '在夹口断了：陶瓷不柔韧。'),
    para(
      t(
        'Pushed down, the ceramic strip snaps at the edge of the clamp before the peg has gone far [S1]. Ceramics are brittle [S10].',
        '推杆还没压下多少，陶瓷条就在夹口的边上断开了 [S1]。陶瓷是脆的 [S10]。',
      ),
      SAFETY,
    ),
  ),
  'push-stand': p(
    t('Push stand', '推杆架'),
    t('Holds the peg, with a line every 0.5 cm.', '架住推杆，每 0.5 厘米一条刻度。'),
    para(
      t(
        'A steel rod on a heavy base, just behind the strip’s free end. A small white scale beside it has a line every 0.5 cm and no numbers; the peg’s pointer shows how far the end has been pushed [S1].',
        '一根竖在重底座上的钢杆，就在条伸出那一端的后面。旁边一块小白板上每 0.5 厘米一条刻度线，不写数字；推杆的指针指出末端压下了多少 [S1]。',
      ),
    ),
  ),
  'push-peg': p(
    t('Push peg', '推杆头'),
    t('Pushes the free end down.', '把伸出的一端往下压。'),
    para(
      t(
        'The peg slides down the rod in steps of 0.5 cm, up to 2 cm, and its rubber foot presses across the end of the strip [S1]. Every strip is pushed down by the same distance; how hard the peg has to push is not shown.',
        '推杆沿着竖杆往下滑，每档 0.5 厘米，最多 2 厘米，橡胶脚压在条的末端上 [S1]。每根条都压下同样的距离；推杆要用多大的力，这里不显示。',
      ),
      t(
        'Another fair test hangs the same light weight on the end of each strip and measures how far it bends [S3].',
        '另一种公平测试是在每根条的末端挂同样轻的重物，量它弯下多少 [S3]。',
      ),
    ),
  ),
  /* ------------------------------------------------------- float or sink */
  tank: p(
    t('Water tank', '水缸'),
    t('Holds fresh water, 18 cm deep, for every test.', '装着清水，18 厘米深，每次都一样。'),
    para(
      t(
        'A glass tank 40 cm long, 25 cm wide and 25 cm high, with plastic trim on its edges [S1]. Each thing is put in gently, one at a time, as in a class test [S4].',
        '一只长 40 厘米、宽 25 厘米、高 25 厘米的玻璃缸，四边有塑料包边 [S1]。东西一样一样轻轻放进去，和课堂上的测试一样 [S4]。',
      ),
      t(
        'Use X-RAY to see through the glass to anything that has sunk to the bottom.',
        '用 X-RAY 透过玻璃，可以看到沉到缸底的东西。',
      ),
    ),
  ),
  'tank-water': p(
    t('Water', '水'),
    t('Fresh water, 18 cm deep: the same for every test.', '清水，18 厘米深：每次测试都一样。'),
    para(
      t(
        'Something floats if it stays on or near the surface of the water, and sinks if it goes to the bottom [S2]. The same tank of fresh water is used for every block, so only the thing put in changes [S1].',
        '东西停在水面上或接近水面，就是浮；沉到缸底，就是沉 [S2]。每一样都放进同一缸清水，只改变放进去的东西 [S1]。',
      ),
    ),
  ),
  'float-wood': p(
    t('Wooden block', '木块'),
    t('This wood floats, most of it under the water.', '这种木头浮着，大部分在水里。'),
    para(
      t(
        'A 6 × 6 × 3 cm block of teak [S1]. It floats, with most of the block below the surface [S1, S7]. Most woods float; a few very heavy woods, such as lignum vitae, sink [S34].',
        '一块 6 × 6 × 3 厘米的柚木 [S1]。它浮着，大部分在水面下 [S1, S7]。大多数木头都浮；也有很重的木头会沉，比如愈疮木 [S34]。',
      ),
    ),
  ),
  'float-wood-big': p(
    t('Big wooden board', '大木板'),
    t('Much bigger, same wood: still floats.', '大得多，同一种木：照样浮。'),
    para(
      t(
        'A board of the same teak, 24 × 10 × 6 cm: many times the size of the small block [S1]. It floats just as the small block does. A big, heavy thing does not always sink [S1, S18].',
        '同一种柚木做的木板，24 × 10 × 6 厘米，比小木块大好多倍 [S1]。它和小木块一样浮着。又大又重的东西，不一定沉 [S1, S18]。',
      ),
    ),
  ),
  'float-metal': p(
    t('Steel block', '钢块'),
    t('Sinks to the bottom.', '沉到缸底。'),
    para(
      t(
        'A 6 × 6 × 3 cm block of steel [S1]. It sinks to the bottom of the tank [S1, S8]. Steel is hard and so is the wooden block, yet one sinks and the other floats: being hard does not decide it.',
        '一块 6 × 6 × 3 厘米的钢 [S1]。它沉到缸底 [S1, S8]。钢硬，木块也硬，可是一个沉、一个浮：硬不硬，不决定浮沉。',
      ),
    ),
  ),
  'float-ceramic': p(
    t('Ceramic block', '陶瓷块'),
    t('Sinks to the bottom.', '沉到缸底。'),
    para(t('A 6 × 6 × 3 cm block of porcelain [S1]. It sinks to the bottom [S1, S8].', '一块 6 × 6 × 3 厘米的瓷 [S1]。它沉到缸底 [S1, S8]。')),
  ),
  'float-rubber': p(
    t('Rubber block', '橡胶块'),
    t('This rubber floats, low in the water.', '这种橡胶浮着，大部分在水里。'),
    para(
      t(
        'A 6 × 6 × 3 cm block of pure gum natural rubber [S1]. It floats with only a thin layer above the water, which still counts as floating [S1, S8, S2].',
        '一块 6 × 6 × 3 厘米的纯天然橡胶 [S1]。它浮着，只露出水面薄薄一层；这也算浮 [S1, S8, S2]。',
      ),
      t(
        'Not every rubber floats. Hard rubber and most rubber goods have other things mixed in and sink [S8]. Many school erasers are made of PVC with chalk mixed in, so they are very likely to sink too; that comes from what they are made of, not from a float test [S33, S6].',
        '不是每种橡胶都浮。硬橡胶和大多数橡胶制品掺了别的东西，会沉 [S8]。很多学校用的橡皮擦是 PVC 掺了白垩做的，所以多半也会沉；这是从它们的成分推出来的，不是放进水里试过的结果 [S33, S6]。',
      ),
    ),
  ),
  'float-glass': p(
    t('Glass block', '玻璃块'),
    t('Sinks to the bottom.', '沉到缸底。'),
    para(t('A 6 × 6 × 3 cm block of glass [S1]. It sinks to the bottom [S1, S8].', '一块 6 × 6 × 3 厘米的玻璃 [S1]。它沉到缸底 [S1, S8]。')),
  ),
  'float-plastic': p(
    t('Plastic block', '塑料块'),
    t('This plastic floats, only just.', '这种塑料浮着，只露出一点点。'),
    para(
      t(
        'A 6 × 6 × 3 cm block of HDPE [S1]. It floats with only a sliver above the water [S1, S6].',
        '一块 6 × 6 × 3 厘米的 HDPE [S1]。它浮着，只露出水面薄薄一层 [S1, S6]。',
      ),
      t(
        'Plastics differ: polypropylene and polyethylene float, while PET and PVC sink [S6].',
        '塑料不都一样：聚丙烯、聚乙烯浮；PET、PVC 沉 [S6]。',
      ),
    ),
  ),
  'float-bottle': p(
    t('Capped empty bottle', '盖好的空瓶'),
    t('Capped and empty: it floats high.', '盖好的空瓶：浮得很高。'),
    para(
      t(
        'A 500 ml drinks bottle, 6.5 cm across and 20 cm long, empty with its cap on [S1]. Drinks bottles are usually PET, a plastic that sinks when it is a solid lump [S6]. The capped bottle floats high because it holds so much air [S1].',
        '一只 500 毫升的饮料瓶，直径 6.5 厘米、长 20 厘米，空的，盖好了盖子 [S1]。饮料瓶多半是 PET 做的；PET 做成实心的一块会沉 [S6]。盖好的空瓶浮得很高，是因为里面有很多空气 [S1]。',
      ),
      t(
        'Having air inside does not always make a thing float: a sealed jar packed with stones still sinks [S18].',
        '里面有空气，不一定就会浮：装满石头的密封罐照样沉 [S18]。',
      ),
    ),
  ),
  'float-fabric': p(
    t('Folded cotton', '叠好的棉布'),
    t('Soaks up water, then sinks.', '吸了水，就沉下去。'),
    para(
      t(
        'A cotton cloth folded to 6 × 6 cm, about 1 cm thick [S1]. At first it floats on the air trapped in it [S32]. Cotton fibre itself is heavier than water for its size, so once the cloth has soaked up water it sinks; the model shows this end [S27, S4].',
        '一块叠成 6 × 6 厘米、约 1 厘米厚的棉布 [S1]。刚放进去时，布里夹着的空气让它浮一会儿 [S32]。棉纤维本身比同样大小的水重，布吸饱了水就沉下去；模型画的是这个结果 [S27, S4]。',
      ),
    ),
  ),
  /* ---------------------------------------------------------- waterproof */
  'drop-stand': p(
    t('Dropper stand', '滴管架'),
    t('Same dropper, same drop, same height.', '同一支滴管、同样一滴、同样高度。'),
    para(
      t(
        'A wooden base for the sample and a stand that holds a glass dropper with a rubber bulb, its tip 5 cm above the sample [S1]. Every sample gets one drop from the same height, and then you look at where the water is [S3].',
        '一块放样片的木座，和一个夹住玻璃滴管的架子，滴管上有橡胶头，管尖在样片上方 5 厘米 [S1]。每块样片都从同样的高度滴一滴水，再看水在哪里 [S3]。',
      ),
    ),
  ),
  ...Object.fromEntries(Object.entries(sampleParts).filter(([id]) => id.startsWith('square-'))),
  'water-bead': p(
    t('Water drop', '水珠'),
    t('Stays on top: not absorbed.', '停在上面：没有被吸进去。'),
    para(
      t(
        'The drop sits on the sample as a round bead [S1]. The surface is wet, but no water has gone into the material; a material that does not absorb water is waterproof [S2].',
        '水在样片上聚成一颗圆圆的水珠 [S1]。样片的表面湿了，可是水没有进到材料里面；不吸水的材料就是防水的 [S2]。',
      ),
    ),
  ),
  'wet-patch': p(
    t('Damp patch', '湿印'),
    t('Soaked in: the material absorbs water.', '吸进去了：这种材料吸水。'),
    para(
      t(
        'The drop has gone into the material and left a darker, damp patch [S1]. Cotton and unvarnished wood absorb water, so they are not waterproof [S3, S2].',
        '水进到材料里面，留下一片颜色深一些的湿印 [S1]。棉布和没上漆的木头会吸水，所以不防水 [S3, S2]。',
      ),
    ),
  ),
  /* ------------------------------------------------------- light through */
  torch: p(
    t('Torch', '手电筒'),
    t('Same torch, same distances, every time.', '同一支手电筒、同样的距离。'),
    para(
      t(
        'A torch on a stand, 20 cm in front of the sample, with the white screen 10 cm behind the sample [S1]: the same distances as the light bench in Light and Shadows. Only the sample changes.',
        '架在支架上的手电筒，离样片 20 厘米；白屏在样片后面 10 厘米 [S1]，和“光与影”主题里的光学实验台一样。只换样片。',
      ),
    ),
  ),
  'sheet-holder': p(
    t('Sample holder', '样片夹'),
    t('Holds each sample square to the light.', '把每块样片正对着光夹好。'),
    para(
      t(
        'A wooden base with two steel posts and clips that hold an 8 × 8 cm sample upright, facing the torch [S1].',
        '一块木底座，两根钢柱和夹子把 8 × 8 厘米的样片竖着夹住，正对手电筒 [S1]。',
      ),
    ),
  ),
  ...Object.fromEntries(Object.entries(sampleParts).filter(([id]) => id.startsWith('sheet-'))),
  screen: p(
    t('White screen', '白屏'),
    t('Shows how much light got through.', '显示有多少光穿过去。'),
    para(
      t(
        'A white board 30 cm wide and 22 cm high [S1]. The torch makes a bright spot on it; the sample’s shadow sits in the spot. The less light a sample lets through, the darker its shadow.',
        '一块宽 30 厘米、高 22 厘米的白板 [S1]。手电筒在屏上照出一块光斑，样片的影子就在光斑里。样片让穿过的光越少，影子越深。',
      ),
      t(
        'The darkness of each shadow is drawn from three levels: most, some or no light through. The darkness for “some” is a choice for the drawing [S1].',
        '影子的深浅按三档画：大部分、一部分、没有光穿过。“一部分”画多深，是画图时取的值 [S1]。',
      ),
    ),
  ),
  /* ------------------------------------------------------- kitchen corner */
  'wall-cabinet': p(
    t('Wall cabinet', '壁柜'),
    t('Wood: strong enough to hold the dishes.', '木：够强，托得住碗碟。'),
    para(
      t(
        'A wooden wall cabinet with one shelf, its door open. It is drawn as a common kind of kitchen cabinet, not the fittings of any particular flat [S1].',
        '一只木壁柜，中间一层隔板，柜门开着。它照常见的厨房壁柜画，不代表哪一种组屋的配件 [S1]。',
      ),
      t(
        'In the strength test the wooden strip held all five masses [S1]; the cabinet’s boards are much thicker than that strip. Choosing wood for the shelves is reasoned from that result.',
        '在强度测试里，木条托住了全部五个槽码 [S1]；柜子的木板比那根条厚得多。隔板用木头，是从这个结果推出来的。',
      ),
    ),
  ),
  'cabinet-hinges': p(
    t('Hinges', '铰链'),
    t('Metal hinges let the door swing.', '金属铰链让柜门能开关。'),
    para(
      t(
        'Two steel cup hinges join the door to the side of the cabinet [S1]. They have to bend at a joint every day without wearing out, which is a job for metal.',
        '两只钢做的杯形铰链把柜门连在柜身侧板上 [S1]。它们每天都要开合，不能磨坏，这件事交给金属。',
      ),
    ),
  ),
  saucepan: p(
    t('Saucepan', '锅'),
    t('Metal: waterproof and strong.', '金属：防水、结实。'),
    para(
      t(
        'A stainless steel saucepan with a lid and a long handle [S1]. Metal does not absorb water and does not break when it is knocked: a teaching worksheet lists a stainless steel sink as waterproof, strong and easy to clean [S3].',
        '一只带盖、带长柄的不锈钢锅 [S1]。金属不吸水，碰撞也不会断开：一份教学工作纸说不锈钢水槽防水、结实、容易清洗 [S3]。',
      ),
    ),
  ),
  'window-frame': p(
    t('Window frame', '窗框'),
    t('A light metal frame holds the glass.', '轻的金属框夹住玻璃。'),
    para(
      t(
        'An aluminium frame with a casement window: the window is hinged at the side and opens outwards, and a friction stay along the bottom holds it open [S1, S16]. The frame is metal so it stays rigid and does not absorb rain.',
        '铝做的窗框，配一扇外开窗：窗扇在侧边装铰链，往外开，下面一根摩擦撑杆把它撑住 [S1, S16]。窗框用金属，不变形，也不吸雨水。',
      ),
    ),
  ),
  'window-rivets': p(
    t('Rivets', '铆钉'),
    t('Stainless steel: stays strong for years.', '不锈钢：多年都结实。'),
    para(
      t(
        'Small rivets fix the window’s stay and hinges to the frame and the window. Since 2004, Singapore’s Building and Construction Authority has required home owners to replace all aluminium rivets in casement windows with stainless steel ones: aluminium rivets that corrode and weaken are a main cause of casement windows falling [S16].',
        '几颗小铆钉把窗的撑杆和铰链固定在窗框和窗扇上。从 2004 年起，新加坡建设局要求屋主把外开窗上所有的铝铆钉换成不锈钢铆钉：铝铆钉锈蚀、变弱，是外开窗掉落的主要原因 [S16]。',
      ),
      t(
        'In the first 11 months of 2023 there were 35 cases of fallen windows in Singapore, 19 of them casement windows [S16].',
        '2023 年头 11 个月，新加坡有 35 起窗户掉落，其中 19 起是外开窗 [S16]。',
      ),
    ),
  ),
  bowl: p(
    t('Bowl', '碗'),
    t('Glazed ceramic: does not absorb water.', '上釉的陶瓷：不吸水。'),
    para(
      t(
        'A glazed ceramic bowl [S1]. The glaze keeps water and food out of the bowl; glazed porcelain hardly absorbs any water [S13]. A teaching worksheet lists a ceramic teapot as rigid, waterproof and able to take hot liquids [S3].',
        '一只上了釉的陶瓷碗 [S1]。釉让水和食物渗不进碗里；上了釉的瓷几乎不吸水 [S13]。一份教学工作纸说陶瓷茶壶硬、防水、耐得住热的液体 [S3]。',
      ),
    ),
  ),
  'wall-tiles': p(
    t('Wall tiles', '墙砖'),
    t('Glazed tiles keep water off the wall.', '上釉的瓷砖让水沾不上墙。'),
    para(
      t(
        'Glazed ceramic tiles behind the counter, drawn 10 cm square [S1]. Splashes stay on the surface and wipe off, because glazed tiles hardly absorb water [S13]. Different kinds of tile absorb different amounts of water; the tiles on a kitchen wall are often a different kind from floor tiles [S13].',
        '台面后面的墙上贴着上了釉的瓷砖，画成 10 厘米见方 [S1]。溅上的水停在表面，一擦就掉，因为上了釉的瓷砖几乎不吸水 [S13]。不同种类的瓷砖吸水多少不一样；厨房墙上的砖和地砖常常不是同一种 [S13]。',
      ),
    ),
  ),
  'box-seal': p(
    t('Rubber seal', '密封圈'),
    t('Rubber seal: it bends to fit the lid.', '橡胶圈：能弯，贴紧盒盖。'),
    para(
      t(
        'A ring of rubber in the food box’s lid [S1]. Rubber bends easily without breaking and does not absorb water [S1, S15], so it can press into the gap between box and lid. That it seals the box is reasoned from those two properties, not tested here.',
        '保鲜盒盖子里的一圈橡胶 [S1]。橡胶很容易弯，不会断，也不吸水 [S1, S15]，所以能压进盒子和盖子之间的缝里。说它能封住盒子，是从这两个性质推出来的，这里没有测。',
      ),
    ),
  ),
  'window-pane': p(
    t('Window glass', '窗玻璃'),
    t('Lets most light in; keeps rain out.', '让大部分光进来，挡住雨水。'),
    para(
      t(
        'Glass is used for windows because you can see through it [S5]: clear glass lets most of the light through [S14], and it does not absorb rain [S1].',
        '窗用玻璃，是因为它透光，看得见外面 [S5]：透明玻璃让大部分光穿过 [S14]，也不吸雨水 [S1]。',
      ),
      t(
        'Glass is brittle. Glass shards falling from height can cause serious injuries [S16].',
        '玻璃是脆的。玻璃碎片从高处掉下，会造成严重的伤害 [S16]。',
      ),
    ),
  ),
  tumbler: p(
    t('Drinking glass', '玻璃杯'),
    t('Glass: you can see the drink inside.', '玻璃：看得见杯里的饮料。'),
    para(
      t(
        'An eight-sided drinking glass with a thick base [S1]. Glass lets most light through, so you can see what is in it, and it does not absorb the drink [S14, S1].',
        '一只八角形、底很厚的玻璃杯 [S1]。玻璃让大部分光穿过，看得见里面装着什么，也不吸饮料 [S14, S1]。',
      ),
    ),
  ),
  'food-box': p(
    t('Food box', '保鲜盒'),
    t('Plastic: waterproof, and it does not shatter.', '塑料：防水，摔了也不碎。'),
    para(
      t(
        'A milky plastic food box with a clip-on lid [S1]. In the tests, plastic did not absorb water and bent without breaking [S1, S11]. That it does not shatter when it is dropped is reasoned from those results, not tested here.',
        '一只乳白色的塑料保鲜盒，盖子有四个扣 [S1]。在测试里，塑料不吸水，弯了也不断 [S1, S11]。说它摔了不会碎，是从这些结果推出来的，这里没有测。',
      ),
    ),
  ),
  'tea-towel': p(
    t('Tea towel', '毛巾'),
    t('Cotton fabric: soaks up water.', '棉布：吸水。'),
    para(
      t(
        'A striped cotton tea towel over the edge of the cabinet’s bottom board [S1]. A towel has to soak up water, so it is made of a material that absorbs water: fabric is good for a mop because it is absorbent [S5]. Cotton takes up more moisture than polyester [S12].',
        '一条搭在壁柜底板边上、带条纹的棉毛巾 [S1]。毛巾要吸水，所以用会吸水的材料：布适合做拖把，因为它吸水 [S5]。棉比涤纶吸得多 [S12]。',
      ),
    ),
  ),
  /* -------------------------------------------------------------- context */
  bench: p(
    t('Science bench', '实验台'),
    t('A school bench, drawn life size.', '一张学校实验台，按实物大小画。'),
    para(
      t(
        'A wooden school bench 2.4 m long and 0.7 m deep; the five test stations stand on it [S1]. It is drawn as a common kind of science bench, not a particular school’s.',
        '一张 2.4 米长、0.7 米深的木实验台，五个测试工位都在上面 [S1]。它照常见的科学实验台画，不对应哪一所学校。',
      ),
    ),
  ),
  counter: p(
    t('Kitchen counter', '厨房台面'),
    t('A counter with cupboards below.', '台面，下面是柜子。'),
    para(
      t(
        'A kitchen counter at the same height as the bench, with cupboards below [S1]. It is drawn as a common kitchen, not the fittings of any particular flat.',
        '和实验台一样高的厨房台面，下面是柜子 [S1]。它照常见的厨房画，不代表哪一种组屋的配件。',
      ),
    ),
  ),
  'corner-wall': p(
    t('Wall', '墙'),
    t('The kitchen wall, with the window opening.', '厨房的墙，开着窗洞。'),
    para(
      t(
        'A plain wall 10 cm thick with an opening for the window [S1]. It sets the kitchen things in place; it is not part of any test.',
        '一面 10 厘米厚的墙，开一个窗洞 [S1]。它让厨房里的东西各就各位，不属于任何测试。',
      ),
    ),
  ),
};
