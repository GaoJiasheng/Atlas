/**
 * Texts for src/content/topics/mosquito/data/parts.json (docs/33 §3.5): part
 * names, the one-line summary that is also the leader label, and the detail
 * (paragraphs, [S#] = data/sources.json). English edited from the topic's
 * research; Chinese written on its own (Singapore usage, docs/33 §1.6).
 */
type T = { en: string; zh: string };
interface PartText {
  name: T;
  summary: T;
  detail: T;
}

const t = (en: string, zh: string): T => ({ en, zh });

export const GROUP_TEXT: Record<string, T> = {
  head: t('Head', '头'),
  'thorax-wings': t('Thorax, legs and wings', '胸、足和翅'),
  belly: t('Abdomen', '腹'),
  male: t('Male', '雄蚊'),
  'water-stages': t('Life in water', '水中的阶段'),
  home: t('Water at home', '家里的积水'),
  cycle: t('Life cycle', '生活史'),
  air: t('Air', '空气'),
  food: t('Food', '食物'),
};

export const PRESET_TEXT: Record<string, T> = {
  hero: t('Hero', '全景'),
  heads: t('Heads', '头部'),
  above: t('Above', '俯视'),
  'dish-view': t('Dish', '浅皿'),
  underwater: t('Water', '水下'),
  'home-corner': t('Home', '家居'),
};

export const TELEMETRY_TEXT: Record<string, T> = {
  'to-adult': t('Hatch → adult', '孵化到成虫'),
  'larva-days': t('Larva', '幼虫期'),
  'pupa-days': t('Pupa', '蛹期'),
  'temp-now': t('Water', '水温'),
};

export const SPEC_TEXT = [
  { key: t('Species', '物种'), value: t('Aedes aegypti · female', '埃及伊蚊 · 雌蚊'), tag: 'typical' },
  { key: t('Body', '体长'), value: '4.5 MM · ×200', tag: 'design' },
  { key: t('Stages', '阶段'), value: t('Egg → larva ×4 → pupa → adult', '卵 → 幼虫 4 龄 → 蛹 → 成虫'), tag: 'typical' },
  { key: t('Hatch → adult', '孵化 → 成虫'), value: t('≈ 7 d at 28 °C (lab)', '28 °C 约 7 天（实验室）'), tag: 'typical' },
];

export const SIM_TEXT = {
  controls: {
    temp: t('Water temperature', '水温'),
    day: t('Days after hatching', '孵化后第几天'),
    every: t('Water tipped out every', '每隔几天倒一次水'),
    wipe: t('Wall scrubbed too', '倒水后也刷壁'),
    compare: t("Show a grasshopper's life cycle", '并排看蝗虫的生活史'),
  },
  outputs: {
    stage: t('Stage', '阶段'),
    'to-adult': t('Hatching to adult', '孵化到成虫'),
    'larva-days': t('As a larva', '幼虫期'),
    'pupa-days': t('As a pupa', '蛹期'),
    'days-left': t('Days to adult', '还有几天变成虫'),
    'head-width': t('Head width', '头壳宽'),
    'temp-now': t('Water', '水温'),
    adults: t('Adults fly away', '有成虫飞走吗'),
    'eggs-left': t('Eggs on the wall', '壁上还有卵吗'),
    rate: t('Cycle speed', '环的速度'),
  },
  stageStates: {
    egg: t('Egg', '卵'),
    l1: t('Larva, 1st instar', '一龄幼虫'),
    l2: t('Larva, 2nd instar', '二龄幼虫'),
    l3: t('Larva, 3rd instar', '三龄幼虫'),
    l4: t('Larva, 4th instar', '四龄幼虫'),
    pupa: t('Pupa', '蛹'),
    adult: t('Adult', '成虫'),
  },
  adultStates: { none: t('None', '没有'), some: t('Some', '有') },
  eggStates: { yes: t('Still there', '还有'), none: t('None', '没有') },
  ring: {
    egg: t('Egg', '卵'),
    eggNote: t('waits for water', '等水来'),
    l1: t('Larva 1', '一龄'),
    l2: t('Larva 2', '二龄'),
    l3: t('Larva 3', '三龄'),
    l4: t('Larva 4', '四龄'),
    pupa: t('Pupa', '蛹'),
    adult: t('Adult', '成虫'),
    larva: t('Larva', '幼虫（孑孓）'),
  },
  compare: {
    label: t('Grasshopper', '蝗虫'),
    egg: t('Egg', '卵'),
    nymph: t('Nymph', '若虫'),
    adult: t('Adult', '成虫'),
    link: t('See the grasshopper', '看蝗虫'),
  },
};

const larvaDetail = (n: 1 | 2 | 3 | 4, mm: string, head: string, days: string, zhN: string): T =>
  t(
    `A larva in its ${['first', 'second', 'third', 'fourth'][n - 1]} instar. It hangs head down below the surface, the tip of its short siphon in the air, and gathers food with the brushes beside its mouth [S13].\n\nIn one measured sample, larvae of this instar averaged ${mm} mm long and their heads ${head} mm wide [S29]; this larva is drawn to those sizes, 200 × life size. In this model, at 28 °C, a larva spends about ${days} days in this instar [S1, S16].${n === 4 ? '\n\nAt the end of the body are the saddle and four small anal papillae, which help to keep the right balance of water and salts; breathing is through the siphon [S29, S14]. At its next moult the larva becomes a pupa [S13].' : ''}`,
    `${zhN}幼虫。它头朝下倒挂在水面下，短短的呼吸管尖端伸出水面，用嘴边的口刷收集食物 [S13]。\n\n在一份测量样本里，这一龄的幼虫平均长 ${mm} 毫米，头宽 ${head} 毫米 [S29]；这只幼虫就按这个大小、放大 200 倍画。在这个模型里，水温 28 °C 时，幼虫在这一龄大约过 ${days} 天 [S1, S16]。${n === 4 ? '\n\n身体末端有鞍板和四个小小的肛鳃，帮助调节体内的水分和盐分；呼吸靠的是呼吸管 [S29, S14]。再蜕一次皮，它就变成蛹 [S13]。' : ''}`,
  );

export const PART_TEXT: Record<string, PartText> = {
  'head-capsule': {
    name: t('Head', '头'),
    summary: t('Carries the eyes, feelers and mouthparts.', '长着眼睛、触角和口器。'),
    detail: t(
      'The head is small and round, and most of it is covered by the two compound eyes. At the front, between the eyes, are two small patches of white scales; the antennae, the palps and the proboscis start just below them [S13].\n\nLike every insect, the mosquito has a hard outer skeleton. The grasshopper topic looks at the insect body closely.',
      '头小而圆，大部分被两只复眼盖住。前面两眼之间有两小簇白色鳞片；触角、触须和喙都从它们下面长出来 [S13]。\n\n和所有昆虫一样，蚊子有坚硬的外骨骼。蝗虫主题仔细讲了昆虫的身体。',
    ),
  },
  'compound-eyes': {
    name: t('Compound eyes', '复眼'),
    summary: t('Two large eyes made of many tiny lenses.', '由许多小眼组成的两只大眼。'),
    detail: t(
      'Each compound eye is made of many small units, each with its own lens. The two eyes cover most of the head and almost meet on top [S13].\n\nAedes aegypti bites mostly in the daytime, and can also bite at night in well-lit places [S17].',
      '每只复眼由许多小单元组成，每个小单元都有自己的晶体。两只复眼盖住了头的大部分，在头顶几乎相接 [S13]。\n\n埃及伊蚊主要在白天叮人，在灯光明亮的地方，晚上也会叮人 [S17]。',
    ),
  },
  antennae: {
    name: t('Antennae', '触角'),
    summary: t('Feelers that pick up smells and warmth.', '感受气味和冷暖的触角。'),
    detail: t(
      'Each antenna has two short segments at its base and a long, thin part made of 13 small segments [S57]. The female\'s antennae have only short hairs; the male\'s are bushy [S13].\n\nThe antennae detect carbon dioxide from a person\'s breath and moving air [S18], and cells near the tip respond to warming and cooling [S54]. A female uses several such cues together to find someone to bite.',
      '每根触角基部有两节短的，后面是由 13 个小节组成的细长部分 [S57]。雌蚊的触角只有短毛，雄蚊的毛茸茸的 [S13]。\n\n触角能察觉人呼出的二氧化碳和空气的流动 [S18]，靠近尖端的细胞对变暖、变冷有反应 [S54]。雌蚊把好几种这样的线索合起来，找到要叮的人。',
    ),
  },
  palps: {
    name: t('Palps', '触须'),
    summary: t('Short feelers beside the mouthpart.', '喙旁边短短的触须。'),
    detail: t(
      'A pair of feelers beside the proboscis that sense smells [S18]. The female\'s palps are short and end in silvery white scales [S13]; the male\'s are about as long as his proboscis [S53].\n\nThe model draws the female\'s palps about a fifth as long as the proboscis. That is a drawing choice: no measurement of this ratio was found [S1].',
      '喙两旁的一对感觉器官，能闻到气味 [S18]。雌蚊的触须很短，末端是银白色的鳞片 [S13]；雄蚊的触须差不多和喙一样长 [S53]。\n\n模型把雌蚊的触须画成喙长的五分之一左右。这是画法上的选择，没有找到这个比例的测量 [S1]。',
    ),
  },
  proboscis: {
    name: t('Proboscis', '喙'),
    summary: t('The long mouthpart used for feeding.', '用来吸食的长喙。'),
    detail: t(
      'What looks like one long tube is a sheath, the labium, wrapped round a bundle of fine stylets [S38]. When a female feeds on blood, the stylets go into the skin while the sheath bends back and stays outside [S38].\n\nBoth males and females use the proboscis to drink nectar and other sugary plant juices [S10]. In the model the sheath shortens instead of bending in the middle, which a rigid model cannot do [S1].',
      '看起来像一根长管子的，其实是一个鞘（下唇），里面包着一束细细的口针 [S38]。雌蚊吸血时，口针刺进皮肤，鞘向后弯起，留在外面 [S38]。\n\n雄蚊和雌蚊都用喙吸花蜜和别的含糖植物汁液 [S10]。模型里的鞘是缩短而不是从中间弯起，因为硬的模型做不出弯折 [S1]。',
    ),
  },
  stylets: {
    name: t('Stylets', '口针'),
    summary: t('Fine, sharp parts that pierce skin.', '刺进皮肤的细口针。'),
    detail: t(
      'The bundle inside the sheath has six parts: the labrum, the hypopharynx, two mandibles and two maxillae [S38]. Blood is drawn up through the labrum, and saliva goes down through the hypopharynx [S38].\n\nOnly females pierce skin; males do not bite [S10]. The model draws three stylets and slides them forward together [S1].',
      '鞘里的这一束由六部分组成：上唇、舌、两根上颚和两根下颚 [S38]。血从上唇吸上去，唾液从舌流下去 [S38]。\n\n只有雌蚊刺穿皮肤，雄蚊不叮人 [S10]。模型只画了三根口针，并让它们一起向前伸出 [S1]。',
    ),
  },
  thorax: {
    name: t('Thorax', '胸'),
    summary: t('Holds the legs and wings; has a lyre pattern.', '足和翅都长在胸上，背上有竖琴纹。'),
    detail: t(
      'All six legs, the two wings and the two halteres are joined to the thorax [S18]. On its back, white scales make the shape of a lyre, a harp-like instrument: two curved stripes at the sides and two thin lines down the middle [S17].\n\nThe lyre is a mark of Aedes aegypti. Its close relative Aedes albopictus has a single white stripe down the middle instead [S17].',
      '六条足、两只翅和两根平衡棒都长在胸上 [S18]。胸背上的白色鳞片排成竖琴的形状：两侧两道弯弯的条纹，中间两条细线 [S17]。\n\n竖琴纹是埃及伊蚊的标志。它的近亲白纹伊蚊，这里只有正中一条白纹 [S17]。',
    ),
  },
  'fore-legs': {
    name: t('Front legs', '前足'),
    summary: t('The front pair of legs, banded white.', '前面一对带白环的足。'),
    detail: t(
      'Each leg has a femur, a tibia and a tarsus made of five small segments [S18, S52]. On the front legs the first two segments of the tarsus have a white band at their base [S52].\n\nThe white bands on the dark legs give an Aedes mosquito its striped look.',
      '每条足由股节、胫节和五小节的跗节组成 [S18, S52]。前足跗节的头两节，基部各有一道白环 [S52]。\n\n深色足上的白环，让伊蚊看起来一节黑一节白。',
    ),
  },
  'mid-legs': {
    name: t('Middle legs', '中足'),
    summary: t('The middle pair of legs, banded white.', '中间一对带白环的足。'),
    detail: t(
      'Like the front legs, the middle legs have white bands at the base of the first two segments of the tarsus [S52]. All six legs are joined to the thorax [S18].',
      '和前足一样，中足跗节的头两节基部也有白环 [S52]。六条足都长在胸上 [S18]。',
    ),
  },
  'hind-legs': {
    name: t('Hind legs', '后足'),
    summary: t('The longest pair, with the most white bands.', '最长的一对足，白环最多。'),
    detail: t(
      'On the hind legs the first four segments of the tarsus have white bands at their base, and the last segment is white all over [S52].\n\nIn the model the hind legs are raised behind the body while the mosquito rests on its other four legs.',
      '后足跗节的头四节基部都有白环，最末一节全是白色 [S52]。\n\n模型里，蚊子用另外四条足站着，后足向后翘起。',
    ),
  },
  wings: {
    name: t('Wings', '翅'),
    summary: t('One pair of narrow wings.', '一对窄长的翅。'),
    detail: t(
      'A mosquito flies with one pair of wings; behind them are the halteres [S18]. The wings are narrow, with scales along the veins and the edge [S13].\n\nAt rest the two wings lie flat over the abdomen, one over the other. A grasshopper has two pairs of wings.',
      '蚊子用一对翅飞行，翅后面是平衡棒 [S18]。翅窄而长，翅脉和翅边上都有鳞片 [S13]。\n\n停歇时，两只翅一只叠在另一只上，平放在腹部上面。蝗虫有两对翅。',
    ),
  },
  halteres: {
    name: t('Halteres', '平衡棒'),
    summary: t('Small knobs that help it balance in flight.', '帮助飞行时保持平衡的小棒。'),
    detail: t(
      'The halteres are the second pair of wings, changed into a thin stalk with a knob at the end [S14]. They help the mosquito keep its balance and steer while it flies [S18].\n\nFlies such as house flies have halteres too.',
      '平衡棒是第二对翅变来的，变成了一根末端带小球的细柄 [S14]。蚊子飞行时，它们帮助保持平衡、控制方向 [S18]。\n\n家蝇这类蝇也有平衡棒。',
    ),
  },
  'salivary-glands': {
    name: t('Salivary glands', '唾液腺'),
    summary: t('Make saliva; dengue virus can reach them.', '分泌唾液；骨痛热症病毒会到达这里。'),
    detail: t(
      'Three small lobes on each side at the front of the thorax, with a duct that runs forward to the mouthparts.\n\nIf a female takes in dengue virus from an infected person, the virus multiplies inside her and reaches these glands; after that her bites can pass it on. NEA gives about seven days for this [S4]; WHO gives 8–12 days at 25–28 °C, and says the time depends on temperature [S24]. Their shape and place here are drawn simply [S1].',
      '胸部前面两侧各有三个小叶，一条导管向前通到口器。\n\n雌蚊如果从受感染的人身上吸进骨痛热症病毒，病毒会在她体内繁殖，到达这里；之后她叮人就可能把病毒传出去。环境局说这大约要七天 [S4]；世界卫生组织说在 25–28 °C 时要 8–12 天，长短和温度有关 [S24]。这里的形状和位置是简化画法 [S1]。',
    ),
  },
  abdomen: {
    name: t('Abdomen', '腹'),
    summary: t('Holds the gut and eggs; stretches after feeding.', '装着肠和卵，进食后会撑大。'),
    detail: t(
      'A long, slim abdomen, with white bands at the base of its segments [S13]. The model draws eight segments [S1].\n\nAfter a blood meal the abdomen stretches. Otherwise an adult mosquito does not grow: once it has come out of the pupa, it stays the same size [S48].',
      '腹部细长，每节基部有白带 [S13]。模型画了八节 [S1]。\n\n吸过血以后，腹部会撑大。除此以外，成虫不再长大：从蛹里出来时多大，以后就一直多大 [S48]。',
    ),
  },
  midgut: {
    name: t('Midgut', '中肠'),
    summary: t('Where a meal is digested.', '消化食物的地方。'),
    detail: t(
      'Food passes along a thin tube from the mouth to the midgut, which lies mostly in the abdomen. After a blood meal it swells, and the protein in the blood is used to make eggs [S4].\n\nThe model draws the midgut in a pale ochre and does not draw the meal [S1].',
      '食物从口沿着一条细管来到中肠，中肠大部分在腹部里。吸血以后中肠胀大，血里的蛋白质用来制造卵 [S4]。\n\n模型把中肠画成浅赭色，不画吃进去的东西 [S1]。',
    ),
  },
  ovaries: {
    name: t('Ovaries', '卵巢'),
    summary: t('Where the eggs grow.', '卵在这里长成。'),
    detail: t(
      'Two ovaries lie in the abdomen. After a blood meal her eggs develop, and she lays them about three days later [S4].\n\nNEA says a female lays about 100 eggs at a time, about three times in her life [S4]. The model draws only a few eggs, and their size is schematic [S1].',
      '腹部里有两个卵巢。吸血以后卵开始发育，大约三天后产下 [S4]。\n\n环境局说，雌蚊每次产约 100 粒卵，一生大约产三次 [S4]。模型只画了几粒，大小是示意 [S1]。',
    ),
  },
  'male-body': {
    name: t('Male mosquito', '雄蚊'),
    summary: t('A male: a little smaller, with bushy antennae.', '雄蚊：个子小一点，触角毛茸茸。'),
    detail: t(
      'The male has the same body plan as the female: a head, a thorax with six legs, two wings and two halteres, and an abdomen [S18]. In a laboratory study of one Sri Lankan strain, females averaged 3.77 mm long and males 3.02 mm [S44]; the model draws the male at 0.85 of the female\'s size [S1].\n\nMales drink plant juices and do not bite [S10].',
      '雄蚊的身体结构和雌蚊一样：头、长着六条足、两只翅和两根平衡棒的胸，还有腹 [S18]。一项实验室研究测了斯里兰卡的一个品系：雌蚊平均长 3.77 毫米，雄蚊 3.02 毫米 [S44]；模型把雄蚊画成雌蚊的 0.85 倍 [S1]。\n\n雄蚊吸植物汁液，不叮人 [S10]。',
    ),
  },
  'male-antennae': {
    name: t('Bushy antennae', '羽状触角'),
    summary: t('A male\'s antennae: rings of long hairs.', '雄蚊的触角：一圈圈长毛。'),
    detail: t(
      'Long, fine hairs grow in a ring on each segment, so the male\'s antenna looks like a bottle brush [S13].\n\nSound makes the antenna vibrate, and a sense organ at its base picks the vibration up: males are drawn to the sound made by flying females [S49].',
      '每一节上都长着一圈细长的毛，所以雄蚊的触角像一把瓶刷 [S13]。\n\n声音会让触角振动，触角基部的感觉器官能察觉这种振动：雄蚊会被飞行中的雌蚊发出的声音吸引 [S49]。',
    ),
  },
  'male-palps': {
    name: t('Male palps', '雄蚊触须'),
    summary: t('Long palps beside the male\'s proboscis.', '雄蚊喙旁长长的触须。'),
    detail: t(
      'A male\'s palps are about as long as his proboscis, or a little longer [S53], with white bands and tufts of hair near the end. A female\'s palps are short.',
      '雄蚊的触须和喙差不多一样长，或者稍长一点 [S53]，上面有白环，末端附近有一簇簇毛。雌蚊的触须很短。',
    ),
  },
  'male-wings': {
    name: t('Male wings', '雄蚊的翅'),
    summary: t('The male\'s wings, folded over his back.', '雄蚊的翅，叠在背上。'),
    detail: t(
      'The male\'s wings are shaped like the female\'s. In one laboratory study, males reared at 28 °C had wings 2.16 mm long on average [S16].',
      '雄蚊的翅和雌蚊的形状一样。在一项实验室研究里，在 28 °C 下养大的雄蚊，翅平均长 2.16 毫米 [S16]。',
    ),
  },
  dish: {
    name: t('Glass dish', '玻璃皿'),
    summary: t('A shallow dish of still water, for display.', '一只盛着积水、用来展示的浅皿。'),
    detail: t(
      'A dish 40 mm across, drawn 200 × life size like the mosquitoes, with the stages of one life cycle set round it in order [S1].\n\nIn a real container there would be many eggs, larvae and pupae, all mixed together. The dish is only a way of showing them; it is not a suggestion to keep mosquitoes.',
      '一只直径 40 毫米的皿，和蚊子一样放大 200 倍画，一个生活史的各个阶段按顺序绕着它排开 [S1]。\n\n真实的容器里，会有很多卵、孑孓和蛹混在一起。这只皿只是为了展示它们，并不是建议养蚊子。',
    ),
  },
  'dish-water': {
    name: t('Still water', '积水'),
    summary: t('Still water: where the larvae and pupae live.', '积水：孑孓和蛹生活的地方。'),
    detail: t(
      'Larvae and pupae can live only in water, until the adult comes out; the eggs wait just above it. The water in the dish is about 9 mm deep [S1].\n\nNEA says Aedes prefers to breed in clean, still water, the kind easily found in homes [S43].',
      '孑孓和蛹只能生活在水里，直到成虫钻出来；卵就在水面上方等着。皿里的水深约 9 毫米 [S1]。\n\n环境局说，伊蚊喜欢在干净的积水里滋生，这样的水在家里很容易找到 [S43]。',
    ),
  },
  eggs: {
    name: t('Eggs', '卵'),
    summary: t('Laid one by one just above the water.', '一粒粒产在水面上方的壁上。'),
    detail: t(
      'The female lays her eggs one by one on the damp wall of a container, just above the water [S19]. Each egg is less than a millimetre long: 0.63 mm in one measurement [S22]. The model shows twelve [S1].\n\nIn a laboratory study at 28 °C, a young larva took about 62 hours to form inside a freshly laid egg [S21]. A formed egg can survive dry for months, up to about nine months according to NEA [S4]. When rising water covers it, the larva hatches [S19].',
      '雌蚊把卵一粒一粒产在容器潮湿的内壁上，就在水面上方 [S19]。每粒卵不到一毫米长：有一次测量是 0.63 毫米 [S22]。模型画了十二粒 [S1]。\n\n在一项 28 °C 的实验室研究里，刚产下的卵，里面的幼虫大约要 62 小时才成形 [S21]。成形以后的卵能干着活好几个月，据环境局说可长达约九个月 [S4]。水涨上来淹没它时，幼虫就孵出来 [S19]。',
    ),
  },
  'larva-l1': {
    name: t('Larva, 1st instar', '一龄幼虫'),
    summary: t('Just hatched; hangs from the surface by its siphon.', '刚孵出来，靠呼吸管倒挂在水面下。'),
    detail: larvaDetail(1, '1.75', '0.24', '1.9', '这是一只一龄'),
  },
  'larva-l2': {
    name: t('Larva, 2nd instar', '二龄幼虫'),
    summary: t('After its first moult: a little bigger.', '第一次蜕皮后，大了一些。'),
    detail: larvaDetail(2, '2.94', '0.39', '0.7', '这是一只二龄'),
  },
  'larva-l3': {
    name: t('Larva, 3rd instar', '三龄幼虫'),
    summary: t('After its second moult; eats and grows.', '第二次蜕皮后，边吃边长。'),
    detail: larvaDetail(3, '4.34', '0.64', '1.0', '这是一只三龄'),
  },
  'larva-l4': {
    name: t('Larva, 4th instar', '四龄幼虫'),
    summary: t('The last and largest larval instar.', '最后、也是最大的一龄幼虫。'),
    detail: larvaDetail(4, '7.20', '0.99', '1.8', '这是一只四龄'),
  },
  'moult-skins': {
    name: t('Shed skins', '蜕下的皮'),
    summary: t('Old skins left behind after moulting.', '蜕皮后留下的旧皮。'),
    detail: t(
      'A larva\'s hard head capsule cannot grow, so at each moult the larva sheds its old skin and the new head capsule is wider [S29, S46]. The softer body grows between moults as well [S46].\n\nEach moult ends one instar; after the fourth moult the larva is a pupa [S13]. Here a skin floats beside each larva that has moulted.',
      '孑孓坚硬的头壳长不大，所以每次蜕皮，它脱掉旧皮，新的头壳就宽一些 [S29, S46]。在两次蜕皮之间，柔软的身体也会长 [S46]。\n\n每蜕一次皮，就结束一个龄期；第四次蜕皮后，幼虫就变成蛹 [S13]。这里每只蜕过皮的孑孓旁边，都漂着一张旧皮。',
    ),
  },
  pupa: {
    name: t('Pupa', '蛹'),
    summary: t('Comma-shaped; breathes but does not eat.', '逗号形，会呼吸，但不吃东西。'),
    detail: t(
      'The head and thorax are joined in one rounded part, and the abdomen curls underneath it, ending in two paddles [S23]. Two breathing trumpets reach the surface. In one study they measured 0.61 mm, the abdomen 2.63 mm and the paddles 0.92 mm [S23].\n\nA pupa does not eat, but it moves: when the water is disturbed it tumbles down, then floats back up [S13]. In this model it lasts about 1.9 days at 28 °C [S1, S16]; NEA says about two days [S4].',
      '头和胸合成一个圆圆的部分，腹部卷在它下面，末端是两片游泳桨 [S23]。两根呼吸角伸到水面。一项研究测得呼吸角长 0.61 毫米，腹部 2.63 毫米，游泳桨 0.92 毫米 [S23]。\n\n蛹不吃东西，但会动：水一被搅动，它就翻滚着沉下去，然后再浮上来 [S13]。在这个模型里，水温 28 °C 时，蛹期约 1.9 天 [S1, S16]；环境局说约两天 [S4]。',
    ),
  },
  'developing-adult': {
    name: t('Adult forming inside', '正在成形的成虫'),
    summary: t('Adult legs, wings and mouthparts forming.', '成虫的足、翅和口器正在成形。'),
    detail: t(
      'Under the skin of the pupa lie the cases of the adult\'s legs, wings and mouthparts [S23]. The body of the larva is being rebuilt into an adult.\n\nThe model draws them as a few folded strokes, seen when the pupa is made see-through (X-RAY) [S1].',
      '蛹皮下面是成虫的足、翅和口器的鞘 [S23]。幼虫的身体正在被改造成成虫。\n\n模型用几道折起的线条表示它们，把蛹变透明（X-RAY）时看得见 [S1]。',
    ),
  },
  'pupal-case': {
    name: t('Pupal skin', '蛹壳'),
    summary: t('The skin left behind when the adult comes out.', '成虫钻出后留下的蛹壳。'),
    detail: t(
      'To come out, the adult takes in air. Its body swells and splits the pupal skin along the back, and the adult climbs out head first [S13]. The empty skin floats on the water.',
      '成虫要出来时，先吞进空气，身体胀大，把蛹皮从背上撑裂，然后头先钻出来 [S13]。空的蛹壳漂在水面上。',
    ),
  },
  'emerging-adult': {
    name: t('Emerging adult', '羽化中的成虫'),
    summary: t('A new adult climbing out onto the water.', '刚钻出来、站上水面的成虫。'),
    detail: t(
      'The new adult stands on the water surface and on its old skin. In one laboratory study, new adults left the surface of the water within minutes [S50].\n\nThe animation shows the order of the movements, not how long they take; the adult is drawn simply [S1].',
      '刚出来的成虫站在水面和旧皮上。一项实验室研究发现，新羽化的成虫几分钟内就离开了水面 [S50]。\n\n动画只表示动作的先后，不表示真实要多久；这只成虫是简化画法 [S1]。',
    ),
  },
  'escaped-adults': {
    name: t('Adults that flew off', '飞走的成虫'),
    summary: t('Adults that came out before the water was tipped out.', '倒水之前已经飞走的成虫。'),
    detail: t(
      'These appear when, in this model, some larvae had time to become adults before the water was tipped out [S1]. A female among them can bite and lay eggs, and the cycle goes on.\n\nThe model uses average times, so it draws a sharp line; in real water some mosquitoes grow a little faster or slower [S1].',
      '在这个模型里，倒水之前，如果已经有孑孓来得及长成成虫，就会出现它们 [S1]。其中的雌蚊会叮人、产卵，这一圈就继续转下去。\n\n模型用的是平均天数，所以界线很分明；真实的积水里，有的蚊子长得快一点，有的慢一点 [S1]。',
    ),
  },
  'flower-pot': {
    name: t('Flower pot', '花盆'),
    summary: t('A pot plant: its soil can hold water.', '盆栽：盆里的泥土会积水。'),
    detail: t(
      'The home corner is drawn life size, not 200 × like the mosquitoes [S1].\n\nIn 2024, plants, counting hardened soil and the places where leaves join the stem, were among the five most common places where NEA found Aedes breeding in homes [S5].',
      '家居一角按实物大小画，不像蚊子那样放大 200 倍 [S1]。\n\n2024 年，环境局在住家发现伊蚊滋生最多的五类地方里，就有植物，包括干硬的泥土和叶腋 [S5]。',
    ),
  },
  'soil-hardened': {
    name: t('Hardened soil', '干硬的泥土'),
    summary: t('Hard, dry soil: water lies on top in pools.', '又干又硬的泥土：水积在表面。'),
    detail: t(
      'When potting soil dries out and hardens, water lies on the surface in small pools instead of soaking in [S5].\n\nNEA\'s first step: break up hardened soil [S27].',
      '盆里的泥土干了、变硬以后，水不会渗下去，而是积在表面成了小水坑 [S5]。\n\n环境局的第一步：铲松干硬的泥土 [S6]。',
    ),
  },
  'soil-loosened': {
    name: t('Loosened soil', '铲松的泥土'),
    summary: t('Loosened soil lets the water sink in.', '铲松的泥土让水渗下去。'),
    detail: t(
      'Broken up, the soil lets water sink in, so no pool is left on top [S27].',
      '泥土铲松以后，水会渗下去，表面就不会积水 [S6]。',
    ),
  },
  'pot-plate': {
    name: t('Flower pot plate', '花盆底盘'),
    summary: t('Catches the water that drains from the pot.', '接住从花盆流下来的水。'),
    detail: t(
      'In 2025, flower pot plates and trays were the second most common place where NEA found Aedes breeding in homes [S5].\n\nThe step: lift and empty flowerpot plates [S27]. NEA\'s checklist asks for this every other day [S42].',
      '2025 年，环境局在住家发现伊蚊滋生的地方里，花盆底盘和托盘排第二 [S5]。\n\n要做的是：清除花盆底盘的积水 [S6]。环境局的清单建议隔天做一次 [S42]。',
    ),
  },
  'plate-water': {
    name: t('Water in the plate', '底盘积水'),
    summary: t('Water left standing in the plate.', '留在底盘里的积水。'),
    detail: t(
      'A thin layer of still water is enough for eggs to hatch and larvae to grow [S43].',
      '薄薄一层积水，就足够让卵孵化、孑孓长大 [S43]。',
    ),
  },
  pail: {
    name: t('Pail', '水桶'),
    summary: t('A pail collects rain and leftover water.', '水桶会积雨水和剩水。'),
    detail: t(
      'In 2025, household containers such as pails were the most common place where NEA found Aedes breeding in homes [S5].\n\nThe step: overturn pails and wipe their rims [S27]. Turned over, a pail cannot collect water, and wiping the rim takes off any eggs laid there.',
      '2025 年，环境局在住家发现伊蚊滋生最多的地方，是水桶这类家用容器 [S5]。\n\n要做的是：倒置存放水桶，并擦干水桶边缘 [S6]。水桶倒过来就积不了水，擦干桶边就能把产在那里的卵擦掉。',
    ),
  },
  'pail-water': {
    name: t('Water in the pail', '水桶积水'),
    summary: t('Water left standing in the pail.', '留在水桶里的积水。'),
    detail: t(
      'Rain or water left after cleaning can stand in a pail for days, long enough for larvae to grow [S5].',
      '雨水或用剩的水可以在水桶里放上好几天，足够孑孓长大 [S5]。',
    ),
  },
  vase: {
    name: t('Vase', '花瓶'),
    summary: t('Flowers stand in still water.', '插花的水是积水。'),
    detail: t(
      'In 2025, ornamental containers such as vases were third on NEA\'s list of places in homes where Aedes was found breeding [S5].\n\nThe step: change water in vases [S28]. NEA\'s checklist asks for this every other day, scrubbing the inside of the vase to remove eggs [S42].',
      '2025 年，在环境局住家滋生处的名单上，花瓶这类装饰容器排第三 [S5]。\n\n要做的是：更换花瓶里的水 [S6]。环境局的清单建议隔天换一次，并刷洗花瓶内壁，把卵刷掉 [S42]。',
    ),
  },
  'vase-water': {
    name: t('Water in the vase', '花瓶的水'),
    summary: t('Still water for the flowers.', '养花的积水。'),
    detail: t(
      'Fresh water, changed often, gives eggs laid on the inside of the vase no time to become adults [S42].',
      '常常换上清水，产在花瓶内壁的卵就来不及长成成虫 [S42]。',
    ),
  },
  'roof-gutter': {
    name: t('Roof gutter', '屋顶檐槽'),
    summary: t('A channel under the roof that can hold water.', '屋檐下会积水的水槽。'),
    detail: t(
      'Fallen leaves can block a gutter, and rain then stands in it.\n\nThe step: keep roof gutters clear and place BTI insecticide inside [S28]. Gutters are high up: this is a job for an adult.',
      '落叶会堵住檐槽，雨水就积在里面。\n\n要做的是：疏通阻塞的屋顶檐槽，并放置 BTI 杀蚊药 [S6]。檐槽在高处，这是大人做的事。',
    ),
  },
  'gutter-debris': {
    name: t('Fallen leaves', '落叶'),
    summary: t('Leaves that block the gutter.', '堵住檐槽的落叶。'),
    detail: t(
      'A small heap of leaves is enough to dam the gutter and hold back a stretch of water.',
      '一小堆落叶，就足以把檐槽堵住，挡住一段积水。',
    ),
  },
  'gutter-water': {
    name: t('Water in the gutter', '檐槽积水'),
    summary: t('Water held back by the leaves.', '被落叶挡住的积水。'),
    detail: t(
      'Still water in a gutter is hard to see from the ground, so it can be missed.',
      '檐槽里的积水从地面上不容易看见，所以常常被忽略。',
    ),
  },
  'bti-granules': {
    name: t('BTI insecticide', 'BTI 杀蚊药'),
    summary: t('BTI: acts on mosquito larvae in the water.', 'BTI：对付水里的孑孓。'),
    detail: t(
      'BTI is made from a bacterium that lives in soil. Larvae swallow it as they feed, and it damages their gut; it acts on the larvae of mosquitoes and of a few other small flies, such as black flies and fungus gnats [S45].\n\nNEA uses insecticides like this where water cannot be removed completely, such as in drains and roof gutters [S45].',
      'BTI 是用土壤里的一种细菌制成的。孑孓吃东西时把它吞下去，它会损坏孑孓的肠；它只对蚊子和另外几种小蝇（例如蚋和蕈蚊）的幼虫起作用 [S45]。\n\n在积水不能完全清除的地方，比如沟渠和屋顶檐槽，环境局就用这类杀幼虫的药 [S45]。',
    ),
  },
  'follow-marker': {
    name: t('Marker', '标记圈'),
    summary: t('Marks the stage the try-it is following.', '标出试一试正在跟着的阶段。'),
    detail: t(
      'A ring that moves from station to station as the day changes in the try-it card. It shows where one larva would be on that day in this model [S1].',
      '在试一试卡片里改变天数，这个圈就从一站移到另一站，标出在这个模型里，一只孑孓那天会在哪一站 [S1]。',
    ),
  },
  'dish-ruler': {
    name: t('Ruler', '尺'),
    summary: t('A 40 mm ruler, drawn 200 × like the dish.', '一把 40 毫米的尺，和皿一样放大 200 倍。'),
    detail: t(
      'Millimetre marks, a longer mark every 5 mm, drawn at the same enlargement as the mosquitoes and the dish [S1].',
      '每毫米一道刻度，每 5 毫米一道长的，和蚊子、浅皿按同样的倍数放大 [S1]。',
    ),
  },
  bench: {
    name: t('Specimen bench', '标本台'),
    summary: t('The bench the specimens stand on.', '放标本的台面。'),
    detail: t('A plain bench for the enlarged specimens; it is not to scale with them [S1].', '放大的标本放在这张台上；台本身不按标本的比例画 [S1]。'),
  },
  'home-floor': {
    name: t('Floor', '地面'),
    summary: t('A tiled floor in the home corner.', '家居一角的瓷砖地面。'),
    detail: t('Tiles 55 cm across, drawn life size [S1].', '瓷砖边长 55 厘米，按实物大小画 [S1]。'),
  },
  'home-wall': {
    name: t('Wall and eave', '墙与屋檐'),
    summary: t('The wall and the edge of the roof.', '墙和屋顶的边缘。'),
    detail: t('A plain wall and a roof edge to hang the gutter on, drawn life size [S1].', '一面素墙和一段挂着檐槽的屋檐，按实物大小画 [S1]。'),
  },
  'home-plinth': {
    name: t('Plinth', '台座'),
    summary: t('The base the home corner stands on.', '家居一角下面的台座。'),
    detail: t('The home corner stands on its own base, apart from the enlarged specimens, because it is drawn at a different scale [S1].', '家居一角放在自己的台座上，和放大的标本分开，因为它按不同的比例画 [S1]。'),
  },
};
