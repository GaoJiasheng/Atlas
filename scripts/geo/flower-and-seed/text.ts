/**
 * Texts for src/content/topics/flower-and-seed/data/parts.json (docs/41 §3.5,
 * §3.8, §4.2 with the §0.3 and §9.1 revisions): part names, the one-line
 * summary that is also the leader label, the detail (paragraphs, [S#] =
 * data/sources.json), groups, presets, the spec rows, the PLATE readings and
 * the try-it controls, outputs and states. Results are the `seeds` model's
 * (S1): four cups A, B, D, E; cup E's result is an inference of this model.
 * Chinese written on its own (Singapore usage; plant names as NParks prints
 * them; 洞穴花蜜蝠 is an editorial translation).
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

/** The design values the model is drawn with (S1). */
export const DESIGN = {
  tableDiameterM: 1.9,
  cupDiameterCm: 7,
  cupHeightCm: 9,
  beansPerCup: 5,
  dayStripCm: 13,
  dayStripTicks: 13,
  dishBeans: 10,
  fernFrondCm: 80,
  magnification: { fern: 0.25, flower: 20, seedInside: 10, lifeSize: 1 },
} as const;

export const NOTE_TEXT = t(
  'Model study · a specimen table arranged as a cycle · each station has its own scale bar · reproductive cells are diagrams, not to scale · seed-test results combine published classroom and laboratory findings; cup E’s result is this model’s inference',
  '模型研究 · 标本台按循环排成一圈 · 每个工位各有比例尺 · 生殖细胞是示意图，不按比例 · 种子测试的结果按公开的课堂与实验室研究组合给出；E 杯的结果是本模型的推断',
);

export const GROUP_TEXT: Record<string, T> = {
  fern: t('Fern', '蕨'),
  'spore-close': t('Spores up close (not to scale)', '孢子特写（不按比例）'),
  'flower-parts': t('Flower', '花'),
  'pollen-close': t('Pollen up close (not to scale)', '花粉特写（不按比例）'),
  visitors: t('Other pollinators', '别的传粉者'),
  fig: t('Fig and fig wasp (not to scale)', '榕果与榕小蜂（不按比例）'),
  cells: t('Reproductive cells (diagram)', '生殖细胞（示意）'),
  fruits: t('Fruits and seeds', '果实与种子'),
  'seed-inside': t('Inside a seed', '种子的里面'),
  germination: t('Seed test', '萌发测试'),
  'spore-drift': t('Spores', '孢子'),
  pollination: t('Pollen', '花粉'),
  'seed-travel': t('Seeds on the move', '种子的旅程'),
  cycle: t('The cycle', '循环'),
};

export const PRESET_TEXT: Record<string, T> = {
  'spores-view': t('Spores', '孢子'),
  'flower-view': t('Flower', '花'),
  'visitors-view': t('Visitors', '访花者'),
  'fruits-view': t('Fruits', '果实'),
  'seed-view': t('Seed', '种子'),
  'cups-view': t('Cups', '杯子'),
};

export const SPEC_TEXT = [
  { key: t('Flower', '花'), value: t('CHILLI ×20 · 5 PETALS · 5 STAMENS · 1 PISTIL', '辣椒 ×20 · 5 瓣 · 5 雄蕊 · 1 雌蕊'), tag: 'design' },
  { key: t('Pollinators', '传粉者'), value: t('BEE · SUNBIRD · CAVE NECTAR BAT · FIG WASP', '蜜蜂 · 太阳鸟 · 洞穴花蜜蝠 · 榕小蜂'), tag: 'typical' },
  { key: t('Seed test', '种子测试'), value: t('4 CUPS × 5 GREEN BEANS · CHECKED ON DAY 7', '4 杯 × 5 粒绿豆 · 第 7 天看'), tag: 'design' },
  { key: t('Germination needs', '萌发需要'), value: t('WATER · AIR · WARMTH', '水 · 空气 · 适宜的温度'), tag: 'typical' },
];

export const TELEMETRY_TEXT: Record<string, T> = {
  'day-now': t('Seed test day', '测试第几天'),
  'temp-now': t('Lab temperature', '实验室温度'),
  'half-day': t('Half germinated by', '一半发芽在'),
};

const CUP_OPTIONS = { a: t('Cup A', 'A 杯'), b: t('Cup B', 'B 杯'), d: t('Cup D', 'D 杯'), e: t('Cup E', 'E 杯') };

export const CONTROL_TEXT = {
  fruit: {
    label: t('Fruit', '果实'),
    options: {
      angsana: t('Angsana', '青龙木'),
      'sea-almond': t('Sea almond', '榄仁树'),
      coconut: t('Coconut', '椰子'),
      chilli: t('Chilli', '辣椒'),
      fig: t('Fig', '榕果'),
      rubber: t('Rubber tree', '橡胶树'),
      balsam: t('Garden balsam', '凤仙花'),
    },
  },
  temp: { label: t('Temperature (lab study)', '温度（实验室研究）') },
  'count-day': { label: t('Day', '第几天') },
  cup: { label: t('Cup to look at', '看哪一杯'), options: CUP_OPTIONS },
  against: { label: t('Compared with', '和哪一杯比'), options: CUP_OPTIONS },
  day: { label: t('Day', '第几天') },
};

export const OUTPUT_TEXT: Record<string, T> = {
  method: t('How the seeds travel', '种子怎样传播'),
  feature: t('What helps', '帮了忙的结构'),
  'half-day': t('Half of those that germinate, by day', '发芽的种子一半已发芽，在第几天'),
  half: t('By this day', '到这一天'),
  'temp-now': t('Temperature', '温度'),
  'cup-result': t('This cup', '这一杯'),
  'against-result': t('The cup it is compared with', '拿来比的那一杯'),
  changed: t('What is different', '改了什么'),
  seedlings: t('Seedlings', '幼苗'),
  'day-now': t('Day', '第几天'),
  'grown-a': t('Seedlings in cup A', 'A 杯的幼苗'),
  'grown-b': t('Seedlings in cup B', 'B 杯的幼苗'),
  'grown-d': t('Seedlings in cup D', 'D 杯的幼苗'),
  'grown-e': t('Seedlings in cup E', 'E 杯的幼苗'),
  'pale-a': t('Pale seedlings in cup A', 'A 杯的幼苗发白'),
  'pale-d': t('Pale seedlings in cup D', 'D 杯的幼苗发白'),
};

const RESULT = {
  waiting: t('Just set up', '刚放好'),
  germinated: t('Germinated', '发芽了'),
  'not-germinated': t('Not germinated', '没有发芽'),
};

export const STATE_TEXT: Record<string, Record<string, T>> = {
  method: {
    wind: t('By the wind', '靠风'),
    water: t('By water', '靠水'),
    animals: t('By animals', '靠动物'),
    splitting: t('The fruit bursts or splits open', '果实爆开或裂开'),
  },
  feature: {
    wing: t('A wing', '翅'),
    floats: t('Air spaces: it floats', '有空隙，能浮'),
    eaten: t('Juicy fruit that animals eat', '动物吃的多汁果实'),
    bursts: t('A dry fruit that bursts open', '干了会爆开的果'),
  },
  half: {
    fewer: t('Fewer than half of those that germinate', '发芽的种子里还不到一半'),
    'half-or-more': t('Half or more of those that germinate', '发芽的种子里有一半或更多'),
  },
  'cup-result': RESULT,
  'against-result': RESULT,
  changed: {
    'same-cup': t('Nothing: the same cup', '没有改：同一杯'),
    water: t('Only the water: a fair test', '只改了水：公平测试'),
    warmth: t('Only the warmth: a fair test', '只改了温度：公平测试'),
    light: t('Only the light: a fair test', '只改了光：公平测试'),
    'more-than-one': t('More than one thing: not a fair test', '不止一样：不是公平测试'),
  },
  seedlings: {
    none: t('None', '没有'),
    green: t('Green', '绿色'),
    pale: t('Pale', '发白'),
  },
};

/* ------------------------------------------------------------- parts */

const cupDetail = (en: string, zh: string, resultEn: string, resultZh: string): T =>
  para(
    t(
      `A clear plastic cup 7 cm across and 9 cm high with five green beans on cotton wool [S1]. ${en}`,
      `一只直径 7 厘米、高 9 厘米的透明塑料杯，棉花上放着五粒绿豆 [S1]。${zh}`,
    ),
    t(resultEn, resultZh),
  );

export const PART_TEXT: Record<string, PartText> = {
  /* ① fern and spores */
  'fern-fronds': p(
    t('Bird’s nest fern ×¼', '巢蕨 ×¼'),
    t('No flowers, no seeds: it reproduces by spores.', '不开花，也不结种子：它靠孢子繁殖。'),
    para(
      t(
        'The bird’s nest fern is a large fern that is commonly seen on many trees in Singapore [S25]. Its broad, strap-shaped fronds spread out from the centre like a nest, and a frond can be up to 150 cm long or more [S23]. The model is drawn at a quarter of life size, with fronds about 80 cm long, a design value [S1].',
        '巢蕨是一种大型的蕨，在新加坡的许多树上都能见到 [S25]。宽带状的叶片从中心向四周张开，像个鸟巢；一片叶可以长到 150 厘米或更长 [S23]。模型缩小到真实大小的四分之一，叶长约 80 厘米，这是设计值 [S1]。',
      ),
      t(
        'Ferns do not flower; they reproduce by spores on the undersides of their leaves [S25]. Look at one in a park without picking its fronds.',
        '蕨类植物不开花，靠叶背上的孢子繁殖 [S25]。在公园里看巢蕨，只看，不摘叶子。',
      ),
    ),
  ),
  'fern-underside': p(
    t('Frond, turned over ×¼', '翻过来的叶片 ×¼'),
    t('Brown lines underneath: where the spores form.', '叶背的褐色线：孢子在这里形成。'),
    para(
      t(
        'On the underside of this fern’s frond the spore cases sit in narrow lines along every vein of the top half [S23]. Each line is a group of spore cases, called a sorus [S32].',
        '巢蕨叶背的上半部，沿着每一条叶脉都有一条窄窄的线，那是聚在一起的孢子囊 [S23]，叫孢子囊群 [S32]。',
      ),
      t('NParks describes the spores as light brown [S23].', 'NParks 说巢蕨的孢子是浅褐色的 [S23]。'),
    ),
  ),
  'sorus-close': p(
    t('Spore lines up close (enlarged, not to scale)', '孢子囊群特写（放大，不按比例）'),
    t('Each line holds many tiny spore cases.', '每条线里有许多细小的孢子囊。'),
    para(
      t(
        'A short piece of a frond’s underside, drawn much larger than life. The raised lines are groups of tiny spore cases [S32].',
        '叶背的一小段，画得比实物大得多。隆起的线是一群群细小的孢子囊 [S32]。',
      ),
      t(
        'When the spores are ripe they are released from the spore cases into the air [S32].',
        '孢子成熟后，从孢子囊里放出来，散到空气中 [S32]。',
      ),
    ),
  ),
  'moss-cushion': p(
    t('Moss (enlarged, not to scale)', '苔藓（放大，不按比例）'),
    t('A small plant with no flowers and no seeds.', '矮小的植物，不开花，也不结种子。'),
    para(
      t(
        'Mosses are small plants, typically 0.2–10 cm tall [S75]. Like ferns they have no flowers and make no seeds; they reproduce by spores [S72]. They belong to a group of more than 25,000 kinds of plants that live mostly in damp places [S33].',
        '苔藓是矮小的植物，一般高 0.2–10 厘米 [S75]。它和蕨一样不开花、不结种子，靠孢子繁殖 [S72]。苔藓所属的这一类植物有 25,000 多种，大多长在潮湿的地方 [S33]。',
      ),
      t(
        'No size was found for a particular moss in Singapore, so this cushion is drawn larger than life with no scale bar [S1].',
        '没有找到新加坡某一种苔藓的尺寸，所以这一丛画得比实物大，不标比例尺 [S1]。',
      ),
    ),
  ),
  'moss-capsules': p(
    t('Moss capsules (enlarged, not to scale)', '苔藓的小囊（放大，不按比例）'),
    t('Each capsule on a thin stalk releases spores.', '细柄顶端的每个小囊放出孢子。'),
    para(
      t(
        'Each thin stalk ends in a small capsule where the spores form. A ring of tiny teeth round the capsule’s mouth opens and closes with the moisture in the air and releases spores from time to time [S33].',
        '每根细柄的顶端是一个小囊，孢子在里面形成。囊口有一圈细齿，随空气的干湿张开、合上，不时放出孢子 [S33]。',
      ),
    ),
  ),

  /* ② flower ×20 */
  flower: p(
    t('Chilli flower ×20', '辣椒花 ×20'),
    t('The part of the plant that makes seeds.', '植物产生种子的部分。'),
    para(
      t(
        'A chilli flower is white and about 1 cm across, with purple anthers [S26]; here it is drawn 20 times life size [S1]. Chilli flowers have their parts in fives to sevens [S64]; the model has 5 petals and 5 stamens, like the chilli in the plant topic [S1].',
        '辣椒花是白色的，宽约 1 厘米，花药紫色 [S26]；这里放大 20 倍 [S1]。辣椒花的各部分是五到七个一组 [S64]；模型画 5 片花瓣、5 枚雄蕊，和“植物”主题里的辣椒一样 [S1]。',
      ),
      t(
        'A flower is not just for show. After pollination and fertilisation, its ovary develops into the fruit and its ovules into the seeds [S31].',
        '花不只是好看。经过传粉和受精，花的子房发育成果实，胚珠发育成种子 [S31]。',
      ),
    ),
  ),
  sepals: p(
    t('Sepals ×20', '萼片 ×20'),
    t('Green parts round the base of the flower.', '花基部一圈绿色的部分。'),
    para(
      t(
        'The sepals form a small green cup at the base of the petals, on the flower stalk. On a chilli plant the flower stalk is bent at the tip, so the flower often hangs down [S61]; the model stands it on a straight stalk, turned towards the reader [S1].',
        '萼片在花瓣基部围成一个绿色的小杯，连着花梗。辣椒的花梗顶端是弯的，所以花常常朝下 [S61]；模型把它立在一根直的花梗上，朝向读者 [S1]。',
      ),
    ),
  ),
  stamens: p(
    t('Stamens ×20', '雄蕊 ×20'),
    t('Anthers on thin stalks make pollen.', '细丝顶端的花药产生花粉。'),
    para(
      t(
        'A stamen is a thin stalk, the filament, topped by an anther, where pollen forms [S30]. Chilli anthers are purple [S26].',
        '雄蕊由细细的花丝和顶端的花药组成，花粉在花药里形成 [S30]。辣椒的花药是紫色的 [S26]。',
      ),
      t('The stamens stand in a ring round the pistil in the middle of the flower.', '雄蕊围成一圈，中间是雌蕊。'),
    ),
  ),
  pistil: p(
    t('Pistil ×20', '雌蕊 ×20'),
    t('Stigma catches pollen; ovary holds ovules.', '柱头接住花粉，子房里有胚珠。'),
    para(
      t(
        'The pistil has three parts: the stigma at the top, which receives the pollen; the style, a stalk; and the ovary at the bottom, which holds one or more ovules [S30]. Some books call it the carpel [S30].',
        '雌蕊有三部分：顶端接住花粉的柱头、中间的花柱，以及底部装着一个或多个胚珠的子房 [S30]。有些书把它叫作心皮 [S30]。',
      ),
      t(
        'After fertilisation the ovules develop into seeds and the ovary into the fruit [S31].',
        '受精以后，胚珠发育成种子，子房发育成果实 [S31]。',
      ),
    ),
  ),
  'flower-section': p(
    t('Flower cut in half ×20', '剖开的花 ×20'),
    t('Shows the ring of stamens round the pistil.', '看得见一圈雄蕊围着雌蕊。'),
    para(
      t(
        'The same kind of flower cut down the middle, also 20 times life size. It shows a ring of stamens round one pistil and the ovules inside the ovary [S30].',
        '同一种花从中间剖开，同样放大 20 倍。看得见一圈雄蕊围着一个雌蕊，子房里有胚珠 [S30]。',
      ),
      t('A chilli’s ovary has two, sometimes three, chambers [S61]. The cut shows three of the five stamens and three of the five petals; the rest were in the half that was cut away [S1].', '辣椒的子房有两室，有时三室 [S61]。剖面上看得见五枚雄蕊中的三枚、五片花瓣中的三片，其余的在剖掉的那一半里 [S1]。'),
    ),
  ),
  ovules: p(
    t('Ovules ×20', '胚珠 ×20'),
    t('Each one becomes a seed after fertilisation.', '受精以后，每个胚珠发育成一粒种子。'),
    para(
      t(
        'The small pale beads inside the ovary. After fertilisation each ovule develops into a seed [S31].',
        '子房里一粒粒浅色的小珠。受精以后，每个胚珠发育成一粒种子 [S31]。',
      ),
      t(
        'A chilli flower has many ovules, and a ripe chilli holds many seeds: NParks gives more than 20 [S26].',
        '辣椒花的胚珠很多，成熟的辣椒里种子也多：NParks 写的是 20 粒以上 [S26]。',
      ),
    ),
  ),
  'pollen-grains': p(
    t('Pollen grains (magnified)', '花粉粒（放大）'),
    t('Fine grains made in the anthers.', '花药里产生的细小颗粒。'),
    para(
      t(
        'Pollen grains form in the anthers [S30] and bring the male reproductive cells to the flower’s female parts [S31].',
        '花粉粒在花药里形成 [S30]，把雄性生殖细胞带到花的雌性部分 [S31]。',
      ),
      t(
        'They are drawn very much larger than life. No size for chilli pollen was found, so no scale is given [S1].',
        '这里画得比实物大很多。没有找到辣椒花粉的大小，所以不标比例 [S1]。',
      ),
    ),
  ),
  bee: p(
    t('Honeybee ×20', '蜜蜂 ×20'),
    t('Carries pollen on its hairy body.', '毛茸茸的身体带着花粉。'),
    para(
      t(
        'A bee visiting the flower; it is not part of the plant. Hairs on its body pick up pollen, which rubs off on the stigma of the next flower it visits [S31]. NParks lists bees as the chilli’s pollinators [S26] and calls bees the main pollinator for many food crops today [S17].',
        '来访的蜜蜂，不是植物的一部分。身上的毛沾上花粉，到下一朵花时蹭到柱头上 [S31]。NParks 写明辣椒靠蜜蜂传粉 [S26]，还说蜜蜂是今天许多粮食作物的主要传粉者 [S17]。',
      ),
      t(
        'Asian honeybee workers are about 10–13 mm long [S74]; the model’s bee is drawn at the flower’s scale, 20 times life size [S1].',
        '东方蜜蜂的工蜂长约 10–13 毫米 [S74]；模型里的蜜蜂和花用同一个倍数，放大 20 倍 [S1]。',
      ),
    ),
  ),

  /* ③ other pollinators, life size */
  sunbird: p(
    t('Sunbird', '太阳鸟'),
    t('A thin, down-curved beak reaches the nectar.', '细长、向下弯的喙伸到花蜜。'),
    para(
      t(
        'Sunbirds have thin, downward-curving beaks [S17] and feed at flowers; as they feed they also pollinate the flowers they visit [S18]. There are seven kinds of sunbird in Singapore [S18].',
        '太阳鸟的喙细长、向下弯 [S17]，在花间取食，取食时也给所访的花传粉 [S18]。新加坡有七种太阳鸟 [S18]。',
      ),
      t(
        'The model is a female: olive-green above and yellow below, as NParks describes the female olive-backed sunbird; the male has an iridescent blue forehead, throat and upper breast [S18]. It is drawn life size, about 10–11 cm long [S69].',
        '模型画的是雌鸟：上身橄榄绿、下身黄色，和 NParks 对 Olive-backed Sunbird 雌鸟的描述一致；雄鸟的额、喉和上胸有闪亮的蓝色 [S18]。按实物大小画，长约 10–11 厘米 [S69]。',
      ),
    ),
  ),
  'red-flower': p(
    t('Red flower spike', '红色穗状花'),
    t('A sunbird sips nectar from its small flowers.', '太阳鸟从它的小花里吸食花蜜。'),
    para(
      t(
        'A spike of red bracts with small tube-shaped flowers, drawn after the scarlet spiral flag, a plant on which an olive-backed sunbird was photographed sipping nectar [S19]. Birds often pollinate brightly coloured flowers that have no scent and are open during the day [S31].',
        '一枝红色苞片和小管状花组成的花穗，照 Scarlet Spiral Flag 画，有人拍到一只太阳鸟（Olive-backed Sunbird）在这种花上吸食花蜜 [S19]。颜色鲜艳、没有气味、白天开的花，常常由鸟传粉 [S31]。',
      ),
      t('Its size is a design value, drawn life size [S1].', '它的大小是设计值，按实物大小画 [S1]。'),
    ),
  ),
  'nectar-bat': p(
    t('Cave nectar bat', '洞穴花蜜蝠'),
    t('Feeds on nectar and pollen; pollinates durians.', '吃花蜜和花粉，给榴莲传粉。'),
    para(
      t(
        'The cave nectar bat (Eonycteris spelaea) feeds on nectar and pollen and is an important pollinator of many forest trees, including durians [S4]. It roosts in large colonies in caves, old buildings and under concrete bridges [S4]. In Singapore it is uncommon; the 1994 Singapore Red Data Book listed it as Vulnerable [S4].',
        '洞穴花蜜蝠（Eonycteris spelaea）吃花蜜和花粉，是许多森林树木的重要传粉者，榴莲也是其中之一 [S4]。它们成群栖息在山洞、旧建筑和混凝土桥下 [S4]。在新加坡并不常见，1994 年的《新加坡红皮书》把它列为易危 [S4]。中文名是编辑按英文名直译的。',
      ),
      t(
        'Its body is 85–125 mm long [S68]; the model is life size, with its wings spread. The yellow dots on its face stand for pollen: as bats feed, their faces and heads become covered with pollen, which is carried to the next flower [S31].',
        '它的身长 85–125 毫米 [S68]；模型按实物大小画，翅膀张开。脸上的黄点表示花粉：蝙蝠吃花蜜时，脸和头上沾满花粉，又带到下一朵花 [S31]。',
      ),
    ),
  ),
  'durian-flowers': p(
    t('Durian flowers', '榴莲花'),
    t('Open at night, with a strong smell.', '夜里开花，气味很浓。'),
    para(
      t(
        'Durian flowers bloom at night and give off a strong smell; bats are their main pollinators [S5]. Each flower is 5–7 cm wide [S5]; the model shows three, hanging from a branch, life size, each with its petals and long stamens [S1].',
        '榴莲花在夜里开，气味很浓，蝙蝠是它们主要的传粉者 [S5]。每朵花宽 5–7 厘米 [S5]；模型按实物大小画了垂在枝上的三朵，每朵有花瓣和长长的雄蕊 [S1]。',
      ),
      t(
        'A field study on Tioman Island, Malaysia, found that island flying foxes, a different and larger bat, raised the durian’s fruit set [S36].',
        '马来西亚刁曼岛的一项野外研究发现，另一种更大的蝙蝠——岛狐蝠——让榴莲结的果更多 [S36]。',
      ),
    ),
  ),

  /* ④ fig, not to scale */
  'fig-cut': p(
    t('Fig, cut open (enlarged, not to scale)', '剖开的榕果（放大，不按比例）'),
    t('Its tiny flowers are inside the fig.', '它细小的花长在榕果里面。'),
    para(
      t(
        'A fig of the common red-stem fig tree (Ficus variegata), cut in half. Its flowers are tiny and develop inside the fig [S15], lining its inner wall. The tree’s figs are up to 5 cm wide [S15]; this one is drawn larger and not to scale [S1].',
        '青果榕（Ficus variegata）的一个榕果，剖成两半。它的花很小，长在榕果里面 [S15]，铺满内壁。青果榕的榕果宽可达 5 厘米 [S15]；这一个画得更大，不按比例 [S1]。',
      ),
      t(
        'Only fig wasps can pollinate fig trees [S17]. This tree’s pollinator is a fig wasp called Ceratosolen appendiculatus [S15].',
        '只有榕小蜂能给榕树传粉 [S17]。青果榕的传粉者是一种叫 Ceratosolen appendiculatus 的榕小蜂 [S15]。',
      ),
    ),
  ),
  'fig-wasp': p(
    t('Fig wasp (not to scale)', '榕小蜂（不按比例）'),
    t('The only insect that can pollinate a fig.', '唯一能给榕树传粉的昆虫。'),
    para(
      t(
        'Only fig wasps can pollinate fig trees, and female fig wasps reproduce by entering a fig and laying their eggs in it [S17].',
        '只有榕小蜂能给榕树传粉；雌榕小蜂钻进榕果里产卵繁殖 [S17]。',
      ),
      t(
        'No body size was found for this species, so the wasp is drawn without a scale [S1].',
        '没有找到这种榕小蜂的体长，所以不标比例 [S1]。',
      ),
    ),
  ),

  /* ⑤ reproductive cells, diagrams */
  'male-cell': p(
    t('Male reproductive cell (diagram)', '雄性生殖细胞（示意）'),
    t('Diagram: it fuses with a female reproductive cell.', '示意图：它与雌性生殖细胞融合。'),
    para(
      t(
        'A diagram, not to scale. Fertilisation occurs when a male reproductive cell fuses with a female reproductive cell [S2]. The pollen brings the male reproductive cell [S31].',
        '示意图，不按比例。雄性生殖细胞与雌性生殖细胞融合，就是受精 [S2]。雄性生殖细胞由花粉带来 [S31]。',
      ),
      t(
        'Where and how in the flower the two cells meet is not part of the P5 syllabus [S2], so the diagram shows the cells on their own.',
        '两个细胞在花的哪里、怎样相遇，不在小五课纲之内 [S2]，所以示意图只画细胞本身。',
      ),
    ),
  ),
  'female-cell': p(
    t('Female reproductive cell (diagram)', '雌性生殖细胞（示意）'),
    t('Diagram: it fuses with a male reproductive cell.', '示意图：它与雄性生殖细胞融合。'),
    para(
      t(
        'A diagram, not to scale, drawn larger with its nucleus. Fertilisation is the process that leads to the development of fruits and seeds [S2]: afterwards the ovule develops into a seed and the ovary into the fruit [S31].',
        '示意图，不按比例，画得较大，带着细胞核。受精是让果实和种子形成的过程 [S2]：受精以后，胚珠发育成种子，子房发育成果实 [S31]。',
      ),
    ),
  ),
  sperm: p(
    t('Sperm (diagram)', '精子（示意）'),
    t('Diagram: made in the testes; fuses with an egg.', '示意图：睾丸产生，与卵子融合。'),
    para(
      t(
        'In humans, fertilisation occurs when a sperm fuses with an egg. Sperms are produced in the testes [S2].',
        '人的受精是精子与卵子融合。精子由睾丸产生 [S2]。',
      ),
      t('A diagram, not to scale: a head and a long tail.', '示意图，不按比例：一个头和一条长尾。'),
    ),
  ),
  egg: p(
    t('Egg (diagram)', '卵子（示意）'),
    t('Diagram: made in the ovaries; develops in the womb.', '示意图：卵巢产生，受精卵在子宫里发育。'),
    para(
      t(
        'Eggs are produced in the ovaries, and the fertilised egg develops in the womb [S2]. In flowering plants and in humans, fertilisation is similar: one male reproductive cell fuses with one female reproductive cell [S2].',
        '卵子由卵巢产生，受精卵在子宫里发育 [S2]。开花植物和人的受精相似：都是一个雄性生殖细胞与一个雌性生殖细胞融合 [S2]。',
      ),
      t(
        'In English “ovary” has two meanings: the ovary of a flower and a woman’s ovaries. A diagram, not to scale.',
        '英文 ovary 一词两义：花的叫子房，人的叫卵巢。示意图，不按比例。',
      ),
    ),
  ),

  /* ⑥ fruits and seeds, life size */
  'chilli-young': p(
    t('Young green chilli', '青辣椒'),
    t('Grew from the ovary of a flower.', '由花的子房长成。'),
    para(
      t(
        'A chilli grows from the ovary of the flower [S31]; this one is still green. Chillies can be green, orange, purple, red or yellow, and grow up to 15 cm long [S26].',
        '辣椒由花的子房长成 [S31]；这一只还是绿的。辣椒有绿、橙、紫、红、黄几种颜色，长可达 15 厘米 [S26]。',
      ),
    ),
  ),
  'chilli-cut': p(
    t('Ripe chilli, cut open', '剖开的红辣椒'),
    t('Animals: birds eat it and pass the seeds whole.', '动物：鸟吃了它，种子完好地排出。'),
    para(
      t(
        'Cut open, the ripe chilli shows its pale, flat seeds [S61]; each grew from an ovule [S31]. So a chilli is a fruit: it grew from the ovary of a flower [S31].',
        '剖开成熟的辣椒，看得见里面扁平的浅色种子 [S61]，每粒都由一个胚珠长成 [S31]。所以辣椒是果实：它由花的子房长成 [S31]。',
      ),
      t(
        'Birds eat ripe chillies and pass the seeds whole and able to germinate [S38]. The hot taste of capsaicin discourages animals that would destroy the seeds but not the birds that spread them [S37].',
        '鸟吃成熟的辣椒，种子完好地排出，还能萌发 [S38]。辣椒素的辣味挡住会毁掉种子的动物，却挡不住传播种子的鸟 [S37]。',
      ),
    ),
  ),
  'angsana-pod': p(
    t('Angsana pod', '青龙木翅果'),
    t('Wind: a thin wing all round carries it away.', '风：四周的薄翅让它被风带走。'),
    para(
      t(
        'The angsana’s fruit is a flat, disc-like pod 3–5 cm across, with a flattened wing round its centre, and it is dispersed by the wind [S6].',
        '青龙木的果实是直径 3–5 厘米的扁圆荚，中间四周是一圈扁平的翅，靠风传播 [S6]。',
      ),
      t('Its flowers often last only a day [S6].', '青龙木的花常常只开一天 [S6]。'),
    ),
  ),
  'sea-almond': p(
    t('Sea almond fruit', '榄仁树果'),
    t('Water: corky and full of air spaces, it floats.', '水：外层像软木，有空隙，能浮。'),
    para(
      t(
        'The sea almond’s fruit is a flattened egg shape, about 3.5–7 cm long and 2–5.5 cm wide [S8]. It has a corky rind with tiny air cavities that let it float, so currents and waves can carry it to new shores [S7].',
        '榄仁树的果实是压扁的卵形，长约 3.5–7 厘米，宽 2–5.5 厘米 [S8]。它的外层像软木，有细小的空隙，所以能浮，被海流和海浪带到新的岸边 [S7]。',
      ),
      t(
        'Fruit bats and monkeys also eat the fruits, which helps to spread the seeds too [S7]: one fruit, two ways.',
        '果蝠和猴子也吃这种果实，帮着传播种子 [S7]：一种果实，两种方式。',
      ),
    ),
  ),
  'sea-almond-cut': p(
    t('Sea almond, cut open', '剖开的榄仁树果'),
    t('Shows the corky layer and its air spaces.', '看得见软木般的外层和里面的空隙。'),
    para(
      t(
        'Cut in half, the fruit shows its corky rind full of tiny air cavities [S7] round a single seed [S8]. The air spaces are drawn larger than life so that they show [S1].',
        '剖成两半，看得见外层像软木，布满细小的空隙 [S7]，中间是一粒种子 [S8]。空隙画得比实物大，好让人看清 [S1]。',
      ),
    ),
  ),
  coconut: p(
    t('Coconut, cut open', '剖开的椰子'),
    t('Water: thick husk and the cavity help it float.', '水：厚纤维外皮和果核里的腔帮它浮起。'),
    para(
      t(
        'A coconut has a fibrous husk round a hard, woody shell [S12]. Inside, the seed has a thin white layer of flesh and a large cavity filled with water [S12]. Coconuts grow up to 30 cm long [S12].',
        '椰子坚硬的木质壳外包着一层纤维 [S12]。里面的种子有一层薄薄的白色果肉和一个装满水的大腔 [S12]。椰子长可达 30 厘米 [S12]。',
      ),
      t(
        'One paper proposes that the cavity within the nut adds to the buoyancy given by the thick husk [S13]. It is put forward as a hypothesis, not as a measurement.',
        '一篇论文提出，果核里的腔加上厚厚的纤维外皮，让椰子更容易浮起来 [S13]。这是作者提出的假说，不是测量结果。',
      ),
    ),
  ),
  'ripe-figs': p(
    t('Ripe figs', '成熟的榕果'),
    t('Animals: eaten by birds, squirrels and monkeys.', '动物：鸟、松鼠和猴子吃。'),
    para(
      t(
        'The ripe figs of the common red-stem fig tree are eaten by birds [S15] and are food for plantain squirrels and long-tailed macaques [S15].',
        '青果榕成熟的榕果被鸟吃 [S15]，也是蕉松鼠和长尾猕猴的食物 [S15]。',
      ),
      t(
        'The same tree needs fig wasps to pollinate its flowers [S17]. Pollination moves pollen from flower to flower; seed dispersal moves seeds away from the parent plant.',
        '同一棵树要靠榕小蜂传粉 [S17]。传粉是把花粉从一朵花带到另一朵花；种子传播是把种子带离母株。',
      ),
    ),
  ),
  'rubber-capsule': p(
    t('Rubber tree fruit', '橡胶树果'),
    t('Bursts when dry; seeds fly more than 20 m.', '干了就爆开，种子飞出 20 米以外。'),
    para(
      t(
        'The fruit of the para rubber tree is a hard, woody capsule with three lobes, about 5 cm across [S9]. When it dries it explodes with a loud sound like a gunshot and fires its three seeds away [S9], more than 20 m from the parent tree [S10].',
        '橡胶树的果实是一个硬的木质蒴果，分三瓣，直径约 5 厘米 [S9]。它干了以后会爆开，声音像枪响，把三粒种子弹出去 [S9]，落到离母树 20 米以外的地方 [S10]。',
      ),
      t(
        'Choose the rubber tree in the try-it card and the three parts open and the seeds fly out [S1].',
        '在试一试卡片里选橡胶树，三瓣就会裂开，种子飞出去 [S1]。',
      ),
    ),
  ),
  'rubber-seeds': p(
    t('Rubber seeds', '橡胶树种子'),
    t('Three marbled seeds, thrown out when it bursts.', '三粒带斑纹的种子，爆开时被弹出。'),
    para(
      t(
        'Each seed is about 2.5 cm wide and has a marbled pattern [S9]. Each capsule holds three [S9].',
        '每粒种子宽约 2.5 厘米，有大理石一样的花纹 [S9]。一个蒴果里有三粒 [S9]。',
      ),
    ),
  ),
  'balsam-pod': p(
    t('Garden balsam pod', '凤仙花果荚'),
    t('Splits open easily and scatters its seeds.', '很容易裂开，把种子撒出去。'),
    para(
      t(
        'Garden balsam fruits split open easily to scatter small seeds [S11]. The plant’s Latin name, Impatiens, refers to the explosive release of the seeds from the pod [S11].',
        '凤仙花的果实很容易裂开，撒出小小的种子 [S11]。它的属名 Impatiens 说的就是种子从果荚里爆出来 [S11]。',
      ),
      t('Garden balsam flowers are pollinated by bees [S11].', '凤仙花靠蜜蜂传粉 [S11]。'),
    ),
  ),

  'rubber-valves': p(
    t('Rubber tree fruit, burst open', '爆开的橡胶树果'),
    t('The three woody parts after the fruit bursts.', '果实爆开后的三片木质果瓣。'),
    para(
      t(
        'When the dry capsule explodes it fires its three seeds away [S9]; what is left are the three hard, woody parts of its wall [S9]. The model shows them in place of the closed fruit when the rubber tree is chosen in the try-it card [S1].',
        '干了的蒴果爆开时把三粒种子弹出去 [S9]，剩下的是果壁硬硬的三片木质果瓣 [S9]。在试一试卡片里选橡胶树时，模型用它们代替没有裂开的果 [S1]。',
      ),
    ),
  ),
  'balsam-valves': p(
    t('Garden balsam pod, split open', '裂开的凤仙花果荚'),
    t('The pod’s parts curl back; small seeds scatter.', '果荚裂成几片向后卷，小种子撒开。'),
    para(
      t(
        'A ripe garden balsam pod splits open easily and scatters its small seeds [S11]. The model shows the split pod in place of the closed one when garden balsam is chosen in the try-it card; how far the seeds land is drawn, not measured [S1].',
        '成熟的凤仙花果荚很容易裂开，把小种子撒出去 [S11]。在试一试卡片里选凤仙花时，模型用裂开的果荚代替没有裂开的；种子落得多远是画出来的，不是量出来的 [S1]。',
      ),
    ),
  ),

  /* ⑦ inside a seed ×10 */
  'bean-whole': p(
    t('Green bean ×10', '绿豆 ×10'),
    t('A seed: a hard coat round a tiny plant and food.', '一粒种子：硬硬的种皮包着胚和养分。'),
    para(
      t(
        'The green bean, also called mung bean (Vigna radiata), is a seed [S27]. A seed is about 4.3–5.1 mm long [S71]; here it is drawn 10 times life size [S1].',
        '绿豆（Vigna radiata），英文也叫 mung bean，是一粒种子 [S27]。一粒绿豆长约 4.3–5.1 毫米 [S71]；这里放大 10 倍 [S1]。',
      ),
      t('Its outer seed coat protects the seed [S39].', '外面的种皮保护着种子 [S39]。'),
    ),
  ),
  'bean-cut': p(
    t('Green bean, split open ×10', '剖开的绿豆 ×10'),
    t('Coat, two seed leaves and a tiny plant.', '种皮、两片子叶和小小的胚。'),
    para(
      t(
        'Inside the coat are two thick seed leaves and a tiny plant, the embryo, with a root tip and a shoot tip [S39]. In beans the seed’s food store is in the seed leaves [S31].',
        '种皮里面是两片厚厚的子叶，还有一个带着根尖和芽尖的小小的胚 [S39]。豆类种子的养分储存在子叶里 [S31]。',
      ),
      t(
        'The seed is alive: respiration takes place in every living seed [S39].',
        '种子是活的：每一粒活的种子都在呼吸 [S39]。',
      ),
    ),
  ),
  'bean-sprout': p(
    t('Sprouting green bean ×10', '发芽的绿豆 ×10'),
    t('Water taken in; coat split; a root grows out.', '吸了水，种皮裂开，长出根来。'),
    para(
      t(
        'Germination starts when the seed takes in water [S39]. The seed swells and its coat splits, and in beans the first part to come out is the root [S70].',
        '萌发从种子吸水开始 [S39]。种子胀大、种皮裂开；豆类种子最先长出来的是根 [S70]。',
      ),
      t(
        'No source gives the day on which the root appears, so the model shows no day for this stage [S1].',
        '没有来源说根在第几天长出来，所以模型不给这一步标天数 [S1]。',
      ),
    ),
  ),

  /* ⑧ seed test, life size */
  'cup-a': p(
    t('Cup A', 'A 杯'),
    t('Damp cotton wool on a warm, bright windowsill.', '湿棉花，放在温暖明亮的窗台上。'),
    cupDetail(
      'The cotton wool is damp and the cup stands on a windowsill: water, air, warmth and light. The other cups are compared with it.',
      '棉花是湿的，杯子放在窗台上：有水、有空气、温暖、有光。其他几杯都拿来和它比。',
      'In this model its seeds have germinated by day 7, and the seedlings are green [S1]. Mung bean sprouts can be grown in 3–4 days [S42]; in a laboratory at 20 °C, 86 % of the seeds had germinated by day 7 [S44].',
      '在这个模型里，到第 7 天它的种子已经发芽，幼苗是绿色的 [S1]。绿豆芽 3–4 天就能长成 [S42]；在 20 °C 的实验室里，到第 7 天有 86 % 的种子发了芽 [S44]。',
    ),
  ),
  'cup-b': p(
    t('Cup B', 'B 杯'),
    t('Dry cotton wool on the same windowsill: no water.', '干棉花，放在同一个窗台上：没有水。'),
    cupDetail(
      'It is the same as cup A except that the cotton wool is dry.',
      '它和 A 杯只差一样：棉花是干的。',
      'The first step in germination is taking in water [S39], so in this model its seeds have not germinated by day 7 [S1]. Comparing B with A changes only the water: a fair test.',
      '萌发的第一步是吸水 [S39]，所以在这个模型里，到第 7 天它的种子还没有发芽 [S1]。B 杯和 A 杯比，只改了水：这是公平测试。',
    ),
  ),
  'cup-d': p(
    t('Cup D', 'D 杯'),
    t('Damp cotton wool in a closed, dark cupboard.', '湿棉花，放在关着门的黑暗柜子里。'),
    cupDetail(
      'It is the same as cup A except that it is kept in a cupboard with the door shut; the model draws the door open so that you can see in [S1].',
      '它和 A 杯只差一样：放在关着门的柜子里；模型把柜门画成打开的，好让人看见里面 [S1]。',
      'Its seeds germinate all the same: mung bean sprouts are often grown in a dark place such as a cupboard [S42], and a seed’s food store gives the energy to form a root and a stem, even in the absence of light [S40]. By day 7 its seedlings are pale [S66].',
      '它的种子照样发芽：绿豆芽本来就常放在柜子这类暗处培育 [S42]，种子储存的养分在没有光的时候也能供它长出根和茎 [S40]。到第 7 天，它的幼苗是发白的 [S66]。',
    ),
  ),
  'cup-e': p(
    t('Cup E', 'E 杯'),
    t('Damp cotton wool in a fridge: cold and dark.', '湿棉花，放在冰箱里：又冷又暗。'),
    para(
      t(
        'A clear plastic cup 7 cm across and 9 cm high with five green beans on damp cotton wool, kept in a small fridge, about 4 °C or colder: food chillers are kept at 0–4 °C [S67]. The fridge’s front is drawn cut away [S1].',
        '一只直径 7 厘米、高 9 厘米的透明塑料杯，湿棉花上放着五粒绿豆，放进小冰箱，温度约 4 °C 或更低：冷藏食物的冰箱保持在 0–4 °C [S67]。冰箱的前面画成剖开的 [S1]。',
      ),
      t(
        'In this model its seeds have not germinated by day 7. That is the model’s inference, not a measurement: mung beans are estimated to need a temperature above about 9–10 °C to germinate [S44], and no test of mung beans at fridge temperature was found.',
        '在这个模型里，到第 7 天它的种子没有发芽。这是模型的推断，不是测量结果：据估计，绿豆要在大约 9–10 °C 以上才会萌发 [S44]；没有找到在冰箱温度下测试绿豆的研究。',
      ),
      t(
        'A fridge is cold and also dark, so cup E differs from cup A in two ways. Compare it with cup D, which is dark too.',
        '冰箱里又冷又暗，所以 E 杯和 A 杯差了两样。要拿它和同样在暗处的 D 杯比。',
      ),
    ),
  ),
  'seeds-a': p(
    t('Seeds in cup A', 'A 杯里的种子'),
    t('Five green beans, put in on day 0.', '五粒绿豆，第 0 天放进去。'),
    t(
      'Five green beans on damp cotton wool [S1]. In this model they have germinated by day 7, so on day 7 the cup shows seedlings instead [S1].',
      '湿棉花上的五粒绿豆 [S1]。在这个模型里，到第 7 天它们已经发芽，所以第 7 天杯里画的是幼苗 [S1]。',
    ),
  ),
  'seeds-b': p(
    t('Seeds in cup B', 'B 杯里的种子'),
    t('Still dry seeds on day 7: no water.', '第 7 天仍是干种子：没有水。'),
    t(
      'Five green beans on dry cotton wool. Without water they do not start to germinate [S39], so in this model they are still seeds on day 7 [S1].',
      '干棉花上的五粒绿豆。没有水，它们不会开始萌发 [S39]，所以在这个模型里，第 7 天它们还是种子 [S1]。',
    ),
  ),
  'seeds-d': p(
    t('Seeds in cup D', 'D 杯里的种子'),
    t('Five beans in the dark; by day 7, seedlings.', '暗处的五粒绿豆；到第 7 天长成幼苗。'),
    t(
      'Five green beans on damp cotton wool in the dark cupboard. In this model they have germinated by day 7, so on day 7 the cup shows pale seedlings instead [S1].',
      '黑暗柜子里湿棉花上的五粒绿豆。在这个模型里，到第 7 天它们已经发芽，所以第 7 天杯里画的是发白的幼苗 [S1]。',
    ),
  ),
  'seeds-e': p(
    t('Seeds in cup E', 'E 杯里的种子'),
    t('Still seeds on day 7 in this model: too cold.', '在这个模型里第 7 天仍是种子：太冷。'),
    t(
      'Five green beans on damp cotton wool in the fridge. In this model they are still seeds on day 7, an inference from the temperature that mung beans need [S44], [S1].',
      '冰箱里湿棉花上的五粒绿豆。在这个模型里，第 7 天它们还是种子；这是根据绿豆萌发所需的温度推断的 [S44]，[S1]。',
    ),
  ),
  'seedlings-a': p(
    t('Seedlings in cup A', 'A 杯里的幼苗'),
    t('Green seedlings: they grew in the light.', '绿色的幼苗：它们在有光处长大。'),
    para(
      t(
        'The seedlings in cup A on day 7, in this model [S1]. They grew on the bright windowsill, so they are green.',
        '在这个模型里，第 7 天 A 杯里的幼苗 [S1]。它们长在明亮的窗台上，所以是绿的。',
      ),
      t(
        'A seed germinates on its own food store; after that the seedling needs light. Pea seedlings kept warm in the dark show signs of light deficiency [S40].',
        '种子靠自己储存的养分萌发；萌发以后，幼苗要有光。放在温暖暗处的豌豆幼苗，会出现缺光的样子 [S40]。',
      ),
    ),
  ),
  'seedlings-d': p(
    t('Seedlings in cup D', 'D 杯里的幼苗'),
    t('Germinated in the dark; the seedlings are pale.', '在暗处萌发，幼苗发白。'),
    para(
      t(
        'The seedlings in cup D on day 7, in this model [S1]. They germinated without light, but they are pale, not green.',
        '在这个模型里，第 7 天 D 杯里的幼苗 [S1]。它们没有光也发了芽，可是颜色发白，不是绿的。',
      ),
      t(
        'In a study of sprouts grown under different light, those grown in darkness had the least green and yellow pigment, and mung beans had the least of all [S66]. Plants grown in the dark are pale yellow [S76].',
        '一项研究让几种芽菜在不同的光下生长：在黑暗中长的，绿色和黄色色素最少，绿豆芽又是其中最少的 [S66]。在暗处长大的植物呈淡黄色 [S76]。',
      ),
    ),
  ),
  'pick-ring': p(
    t('Looking at', '正在看'),
    t('Marks the cup you are looking at.', '标出正在看的那一杯。'),
    t(
      'A ring under the cup chosen in the try-it card. It moves when you choose another cup [S1].',
      '放在试一试卡片里选中的那只杯子底下的环。换一杯，它就跟着移过去 [S1]。',
    ),
  ),
  'ref-ring': p(
    t('Compared with', '拿来比的'),
    t('Marks the cup it is compared with.', '标出拿来比的那一杯。'),
    t(
      'A dashed ring under the second cup. Two cups make a fair test only when one thing is changed and everything else is kept the same [S2], [S46].',
      '放在第二只杯子底下的虚线环。两杯之间只改变一样东西、其余都保持不变，才是公平测试 [S2]，[S46]。',
    ),
  ),
  'day-strip': p(
    t('Day strip', '天数卡'),
    t('Counts the days of the lab study, one tick a day.', '数实验室研究的天数，一天一道刻度。'),
    t(
      'A card 13 cm long with 13 ticks, one for each day from day 0 to day 12, and longer ticks at days 0, 5 and 10 [S1]. It goes with the laboratory study in the chapter on the inside of a seed [S44].',
      '一张长 13 厘米的卡，有 13 道刻度，从第 0 天到第 12 天一天一道，第 0、5、10 天的刻度长一些 [S1]。它配合“种子的里面”一章讲的那项实验室研究 [S44]。',
    ),
  ),
  'day-marker': p(
    t('Today', '今天'),
    t('Moves along the strip to the day chosen.', '沿着天数卡移到所选的那一天。'),
    t('A small marker that moves 1 cm along the day strip for each day [S1].', '一个小标记，每过一天沿天数卡移动 1 厘米 [S1]。'),
  ),
  'half-flag': p(
    t('Half germinated', '一半发芽'),
    t('Day by which half the seeds that germinate have.', '发芽的种子里有一半已发芽的那一天。'),
    para(
      t(
        'In a laboratory study in Victoria, Australia, mung beans of 32 kinds were kept on damp paper towels at 14, 17 and 20 °C, with 10 hours of light a day [S44]. The median germination time is the day by which half of the seeds that went on to germinate had germinated: about 4.3 days at 20 °C, 6.5 days at 17 °C and 9.4 days at 14 °C [S44]. The flag stands on that day.',
        '澳大利亚维多利亚州的一项实验室研究，把 32 个品种的绿豆放在湿纸巾上，分别放在 14、17、20 °C 下，每天照光 10 小时 [S44]。中位萌发时间，是最终发芽的种子里有一半已经发芽的那一天：20 °C 约 4.3 天，17 °C 约 6.5 天，14 °C 约 9.4 天 [S44]。小旗就插在那一天。',
      ),
      t(
        'That is not half of all the seeds: by day 21 about 94 % of the seeds had germinated at 20 °C, but only about 61 % at 14 °C [S44].',
        '这不是全部种子的一半：到第 21 天，20 °C 下约 94 % 的种子发了芽，14 °C 下只有约 61 % [S44]。',
      ),
    ),
  ),
  'towel-dish': p(
    t('Seeds on a damp paper towel', '湿纸巾上的种子'),
    t('The lab study’s way: beans on a damp towel.', '实验室研究的做法：绿豆放在湿纸巾上。'),
    t(
      'The study put 10 seeds on each damp paper towel and counted a seed as germinated once its root was at least 3 mm long [S44]. This dish is a simple picture of that set-up, not the laboratory’s own equipment [S1].',
      '那项研究每张湿纸巾上放 10 粒种子，根长到 3 毫米以上才算发芽 [S44]。这个培养皿只是那种做法的简单示意，不是实验室的设备 [S1]。',
    ),
  ),
  'bean-seedling-close': p(
    t('Green bean seedling', '绿豆幼苗'),
    t('The seed leaves are lifted above the soil.', '子叶被举出土面。'),
    para(
      t(
        'Mung beans germinate with the seed leaves and the stem coming up out of the soil [S45]. The food stored in the seed leaves gives the energy for the first root and stem [S40].',
        '绿豆萌发时，子叶和茎一起钻出土面 [S45]。子叶里储存的养分，供它长出最初的根和茎 [S40]。',
      ),
    ),
  ),

  /* context */
  table: p(
    t('Specimen tables', '标本台'),
    t('Hold the stations in the order of the cycle.', '按循环的顺序摆放各个工位。'),
    t(
      'A round table 1.9 m across, a design for this model study. The stations go round it in the order of a flowering plant’s life: flower, pollinators, fertilisation, fruits and seeds, germination, and back to the flower. A small table beside it holds the fern and the moss, which stand apart because they reproduce by spores, not seeds [S1].',
      '一张直径 1.9 米的圆台，是这个模型研究的设计。工位按开花植物一生的顺序绕台一圈：花、传粉者、受精、果实与种子、萌发，再回到花。旁边的小圆台放着蕨和苔藓：它们靠孢子繁殖，不靠种子，所以单独摆放 [S1]。',
    ),
  ),
  'sea-water': p(
    t('Sea water', '海水'),
    t('Stands for the sea that carries floating fruits.', '代表把漂浮的果实带走的大海。'),
    t('A strip of sea water behind the fruits, a reminder of the fruits carried by currents and waves [S1].', '果实后面的一条海水，表示那些靠海流和海浪带走的果实 [S1]。'),
  ),
  windowsill: p(
    t('Windowsill', '窗台'),
    t('Warm and bright: cups A and B.', '温暖明亮：A 杯和 B 杯。'),
    t('A windowsill with its window frame, where cups A and B stand in the warmth and the light [S1].', '一个带窗框的窗台，A 杯和 B 杯放在这里，温暖、有光 [S1]。'),
  ),
  cupboard: p(
    t('Cupboard', '柜子'),
    t('Dark: cup D. The door is drawn open.', '黑暗：D 杯。柜门画成打开的。'),
    t(
      'A kitchen cupboard, warm but dark when its door is shut. The door is drawn open so that cup D can be seen [S1].',
      '厨房的柜子，关上门时温暖但黑暗。柜门画成打开的，好让人看见 D 杯 [S1]。',
    ),
  ),
  fridge: p(
    t('Small fridge', '小冰箱'),
    t('Cold and dark: cup E. Front drawn cut away.', '又冷又暗：E 杯。前面画成剖开的。'),
    t(
      'A small fridge, about 4 °C or colder inside [S67] and dark when shut. Its front is drawn cut away so that cup E can be seen [S1].',
      '一台小冰箱，里面约 4 °C 或更低 [S67]，关上门就是黑的。前面画成剖开的，好让人看见 E 杯 [S1]。',
    ),
  ),
};
