/**
 * Texts for src/content/topics/living-things/data/parts.json (docs/38 §3.5,
 * §3.7, §4.2): part names, the one-line summary that is also the leader
 * label, the detail (paragraphs, [S#] = data/sources.json), groups, presets,
 * the spec rows, the PLATE readings and the try-it controls and outputs.
 * Chinese written on its own, in Singapore usage (docs/38 §1.6, §6.1).
 * Species names appear only in a part's name and the first sentence of its
 * detail (docs/38 D10); chapter text uses the plain names of the groups.
 */
type T = { en: string; zh: string };
export interface PartText {
  name: T;
  summary: T;
  detail: T;
}

const t = (en: string, zh: string): T => ({ en, zh });
const p = (name: T, summary: T, detail: T): PartText => ({ name, summary, detail });

export const GROUP_TEXT: Record<string, T> = {
  'non-living': t('Not alive', '非生物'),
  plants: t('Plants', '植物'),
  fungi: t('Fungi', '真菌'),
  bacteria: t('Bacteria', '细菌'),
  insects: t('Insects', '昆虫'),
  birds: t('Birds', '鸟类'),
  mammals: t('Mammals', '哺乳动物'),
  fish: t('Fish', '鱼类'),
  amphibians: t('Amphibians', '两栖动物'),
  reptiles: t('Reptiles', '爬行动物'),
  'other-animals': t('Other animals', '其他动物'),
  tray: t('Sorting tray', '分类盘'),
  magnified: t('Under the microscope', '显微镜下'),
};

export const PRESET_TEXT: Record<string, T> = {
  'case-view': t('Case', '标本盒'),
  'tray-view': t('Tray', '分类盘'),
  'back-row': t('A–C', 'A–C'),
  'front-row': t('D–F', 'D–F'),
  'lens-view': t('Microscope', '显微镜'),
};

export const SPEC_TEXT = [
  { key: t('Specimens', '标本'), value: t('32 MODELS · NOT TO SCALE', '32 件模型 · 不按比例'), tag: 'design' },
  { key: t('Big groups', '大类'), value: t('PLANTS · ANIMALS · FUNGI · BACTERIA', '植物 · 动物 · 真菌 · 细菌'), tag: 'typical' },
  { key: t('Animal groups', '动物类群'), value: '6', tag: 'typical' },
  { key: t('Sorted by', '分类依据'), value: t('WHAT YOU CAN SEE', '看得见的特征'), tag: 'design' },
];

export const TELEMETRY_TEXT: Record<string, T> = {
  'on-tray': t('On the tray', '托盘上'),
  abc: t('Groups A · B · C', 'A · B · C 组'),
  def: t('Groups D · E · F', 'D · E · F 组'),
  ux: t('In the case · none', '盒里 · 都不是'),
  wrong: t('Wrongly placed', '放错的'),
  kinds: t('Kinds in A · B', 'A、B 组里的类群数'),
};

/** Questions (docs/38 §3.4, §4.2): the flowchart's boxes and the group names of the leaves. */
export const QUESTION_TEXT: Record<string, T> = {
  moves: t('Moves about by itself', '能自己走动'),
  responds: t('Responds to changes', '对变化有反应'),
  grows: t('Grows', '会生长'),
  reproduces: t('Reproduces', '会繁殖'),
  needs: t('Needs water, food and air', '需要水、食物和空气'),
  'makes-food': t('Green and makes its own food', '绿色、自己制造食物'),
  mouth: t('Takes in food through a mouth', '用嘴吃进食物'),
  fungus: t('A mushroom, mould or yeast', '是蘑菇、霉菌或酵母'),
  'flowers-now': t('Has flowers now', '现在有花'),
  'flowers-or-fruits': t('Has flowers, buds or fruits now', '现在有花、花苞或果实'),
  needles: t('Has thin, needle-like shoots', '长着细针一样的枝叶'),
  green: t('Is green', '是绿色的'),
  flowering: t('Bears flowers at some time', '某个时候会开花'),
  'six-legs': t('Six legs, three body parts', '六条腿、身体分三部分'),
  feathers: t('Has feathers', '有羽毛'),
  hair: t('Has hair or fur', '有毛发'),
  fins: t('Has fins', '有鳍'),
  scales: t('Has scales on its body', '身上有鳞片'),
  'moist-skin': t('Moist skin, no scales', '皮肤湿润、没有鳞片'),
  'can-fly': t('Can fly', '会飞'),
};

/** True groups (docs/38 §3.1, §4.2): the labels the flowchart and the classmate's headings use. */
export const TRUE_GROUP_TEXT: Record<string, T> = {
  'non-living': t('Not alive', '非生物'),
  flowering: t('Flowering plants', '开花植物'),
  'non-flowering': t('Non-flowering plants', '不开花植物'),
  fungus: t('Fungi', '真菌'),
  bacteria: t('Bacteria', '细菌'),
  insect: t('Insects', '昆虫'),
  bird: t('Birds', '鸟类'),
  mammal: t('Mammals', '哺乳动物'),
  fish: t('Fish', '鱼类'),
  reptile: t('Reptiles', '爬行动物'),
  amphibian: t('Amphibians', '两栖动物'),
  none: t('Not in these six groups', '不在这六类里'),
};

export const TRAY_TEXT: Record<string, T> = {
  all: t('The whole case', '整盒标本'),
  alive: t('Living or not', '生物还是非生物'),
  big: t('Four big groups', '四大类'),
  plants: t('Plants', '植物'),
  animals: t('Animals', '动物'),
  classmate: t("A classmate's tray", '同学的分类盘'),
  'own-key': t('Your own flowchart', '自己的流程图'),
};

export const CONTROL_TEXT: Record<string, T> = {
  tray: t('On the tray', '托盘上'),
  'q-alive': t('Sort by', '按什么分'),
  'asked-big': t('Questions asked', '问了几个问题'),
  'q-plant': t('Sort by', '按什么分'),
  'asked-animal': t('Questions asked', '问了几个问题'),
  suspect: t('Check this animal', '检查这只动物'),
  fix: t('Move to the right groups', '放回正确的组'),
  first: t('First question', '第一个问题'),
  second: t('Second question', '第二个问题'),
};

export const NOT_SORTED = t('Not sorted yet', '还没分');

export const SUSPECT_TEXT: Record<string, T> = {
  'fruit-bat': t('Fruit bat', '果蝠'),
  dolphin: t('Dolphin', '海豚'),
  penguin: t('Penguin', '企鹅'),
  spider: t('Spider', '蜘蛛'),
  'asian-toad': t('Toad', '蟾蜍'),
  mudskipper: t('Mudskipper', '弹涂鱼'),
  pangolin: t('Pangolin', '穿山甲'),
  shark: t('Shark', '鲨鱼'),
};

export const OUTPUT_TEXT: Record<string, T> = {
  slots: t('Where each specimen goes', '每件标本放在哪里'),
  layout: t('Groups on the tray', '盘上的组'),
  'on-tray': t('On the tray', '托盘上'),
  'count-u': t('In the case', '盒里'),
  'count-a': t('Group A', 'A 组'),
  'count-b': t('Group B', 'B 组'),
  'count-c': t('Group C', 'C 组'),
  'count-d': t('Group D', 'D 组'),
  'count-e': t('Group E', 'E 组'),
  'count-f': t('Group F', 'F 组'),
  'count-x': t('None of the six', '都不是'),
  'kinds-a': t('Kinds in A', 'A 组里的类群数'),
  'kinds-b': t('Kinds in B', 'B 组里的类群数'),
  wrong: t('Wrongly placed', '放错的'),
  verdict: t('Placed', '放得'),
  belongs: t('Belongs in', '本该在'),
  'where-toy-car': t('The toy car is in', '玩具车在'),
  'where-mushroom': t('The mushroom is in', '蘑菇在'),
  'where-chilli': t('The chilli plant is in', '辣椒幼苗在'),
  'where-dolphin': t('The dolphin is in', '海豚在'),
};

export const LAYOUT_STATE_TEXT: Record<string, T> = {
  none: t('None', '没有'),
  two: t('Two groups', '两组'),
  three: t('Three groups', '三组'),
  six: t('Six groups and X', '六组加 X'),
};

export const VERDICT_TEXT: Record<string, T> = { right: t('Right', '对'), wrong: t('Wrong', '错') };

/** `where:<specimen>` states: the case, a group letter, off this tray. */
export function whereText(id: string): T {
  if (id === 'u') return t('In the case', '在标本盒里');
  if (id === 'off') return t('Not on this tray', '不在这个托盘上');
  return t(`Group ${id.toUpperCase()}`, `${id.toUpperCase()} 组`);
}

const PAD_DETAIL = t(
  'A felt pad on the sorting tray. Which specimens land on it, and what the group is called, depend on the question asked: the flowchart card at the top right names the group and counts what is on it. The groups and counts are worked out by the model from what each specimen looks like [S59].',
  '分类盘上的一块毡垫。哪些标本落到这块垫上、这一组叫什么，要看问的是什么问题：右上角的流程图卡写出组名，也数出垫上有几件。组和件数都是模型按每件标本的样子算出来的 [S59]。',
);
const padText = (letter: string): PartText => p(t(`Group ${letter}`, `${letter} 组`), t('One group on the sorting tray.', '分类盘上的一组。'), PAD_DETAIL);

export const PART_TEXT: Record<string, PartText> = {
  'toy-car': p(
    t('Toy car', '玩具车'),
    t('Moves, but does not grow or reproduce.', '会动，却不生长、不繁殖。'),
    t(
      'A small plastic toy car. It can move, and some toy cars even respond to changes around them, but non-living things cannot reproduce [S5].\n\nIt does not need water, food or air, it never grows and it cannot make more toy cars. So it is a non-living thing, even though it moves.',
      '一辆塑料小汽车。它会动，有的玩具车甚至会对周围的变化作出反应，可是非生物不能繁殖 [S5]。\n\n它不需要水、食物和空气，不会长大，也变不出更多的玩具车。所以它虽然会动，还是非生物。',
    ),
  ),
  pebble: p(
    t('Pebble', '石头'),
    t('Does not grow, reproduce or need food.', '不生长、不繁殖，也不需要食物。'),
    t(
      'A smooth, flat river pebble.\n\nIt does not need water, food or air, it does not grow and it does not reproduce. It is a non-living thing, and it has never been alive.',
      '一块扁平、光滑的河石。\n\n它不需要水、食物和空气，不会长大，也不会繁殖。它是非生物，而且从来没有活过。',
    ),
  ),
  'plastic-flower': p(
    t('Plastic flower', '塑料花'),
    t('Looks like a plant, but never grows.', '像植物，却从不生长。'),
    t(
      'A flower made of plastic, on a plastic stand. Its stem is perfectly straight, and its two leaves and six petals are exactly alike and have no veins, because they were made in a mould.\n\nIt looks like a plant, but it does not need water, food or air, it does not grow and it cannot make seeds. It is a non-living thing.',
      '一朵插在塑料座上的塑料花。花茎笔直，两片叶子、六片花瓣一模一样，也没有叶脉，因为它们是用模子做出来的。\n\n它看起来像植物，却不需要水、食物和空气，不会长大，也结不出种子。它是非生物。',
    ),
  ),
  ixora: p(
    t('Ixora', '龙船花'),
    t('A hedge shrub in flower.', '正在开花的绿篱灌木。'),
    t(
      'Ixora, here one of the many cultivated kinds, is a common hedge shrub in Singapore. Each small flower has exactly four petals arranged in a cross, on a long, thin tube [S46]. The flowers grow in clusters.\n\nIt is a flowering plant: a plant that can bear flowers [S3].',
      '龙船花（这里是栽培的品种之一）是新加坡常见的绿篱灌木。每一朵小花正好有四片花瓣，排成十字，连在一根细长的花管上 [S46]。花一簇一簇地开。\n\n它是开花植物，也就是会开花的植物 [S3]。',
    ),
  ),
  'chilli-seedling': p(
    t('Young chilli plant', '辣椒幼苗'),
    t('A flowering plant that has not flowered yet.', '还没开花的开花植物。'),
    t(
      'A young chilli plant with two long, narrow seed leaves and its first true leaves. It has no flowers yet. Flowering plants do not bear flowers all the time [S3]: this one will flower when it is older, and its flowers will become chillies with seeds inside [S71].\n\nThe topic A Plant follows a chilli plant from seed to fruit.',
      '一株辣椒幼苗，有两片又长又窄的子叶和第一批真叶，还没有开花。开花植物不是一直都有花 [S3]：这株长大以后就会开花，花会变成里面有种子的辣椒 [S71]。\n\n“一株植物”主题跟着一株辣椒从种子看到结果。',
    ),
  ),
  'rhu-sapling': p(
    t('Young rhu tree', '木麻黄幼树'),
    t('Looks like a pine, but it bears flowers.', '像松树，却会开花。'),
    t(
      'Rhu, Casuarina equisetifolia, is native to Singapore [S47]. Its thin, drooping green shoots make it look like a pine, but it is a flowering plant and not related to the non-flowering pines at all [S47].\n\nIts flowers are tiny and easy to miss: the male flowers are small spikes at the ends of the green twigs and the female flowers small brownish heads. The fruits form cone-like clusters [S47]; this model shows three.',
      '木麻黄（Casuarina equisetifolia）是新加坡的本地植物 [S47]。它细长、下垂的绿色枝条让它看起来像松树，其实它是开花植物，和不开花的松树完全不是一家 [S47]。\n\n它的花很小，不容易看到：雄花是绿色小枝末端的小穗，雌花是褐色的小球。果实聚成像小球果一样的一团 [S47]；这个模型画了三个。',
    ),
  ),
  'birds-nest-fern': p(
    t("Bird's nest fern", '鸟巢蕨'),
    t('A fern: it never bears flowers.', '一种蕨，从来不开花。'),
    t(
      "Asplenium nidus is native to Singapore [S49]. It grows on trees, and its broad fronds form a large rosette like a nest [S50, S45].\n\nIt is a non-flowering plant. On the underside of mature fronds are brown, fuzzy-looking lines where the fern produces its spores [S50]; in this model two fronds show them. Spores are studied in Primary 5 [S1].",
      '鸟巢蕨（Asplenium nidus）是新加坡的本地植物 [S49]。它长在树上，宽大的叶子围成一大圈，像一个鸟巢 [S50, S45]。\n\n它是不开花植物。成熟叶片的背面有一条条褐色、毛茸茸的平行线，蕨就在那里产生孢子 [S50]；这个模型有两片叶子画出了这些线。孢子到小五才学 [S1]。',
    ),
  ),
  'staghorn-fern': p(
    t('Staghorn fern', '鹿角蕨'),
    t('A fern that grows on tree branches.', '长在树枝上的蕨。'),
    t(
      'Platycerium coronarium is a large fern native to Singapore that grows on trees without harming them [S51]. In this model forked fronds, shaped like a stag’s antlers, rise from a round frond pressed against the bark.\n\nLike all ferns, it never bears flowers: it is a non-flowering plant [S3].',
      '鹿角蕨（Platycerium coronarium）是新加坡本地的大型蕨，长在树上，对树没有伤害 [S51]。在这个模型里，像鹿角一样分叉的叶子，从一片贴着树皮的圆叶中伸出来。\n\n和所有的蕨一样，它从来不开花，是不开花植物 [S3]。',
    ),
  ),
  moss: p(
    t('Moss', '苔藓'),
    t('A tiny non-flowering plant.', '很小的不开花植物。'),
    t(
      'Mosses are small, low plants that grow in soft green cushions, here on a stone. They never bear flowers: they are non-flowering plants, and they are green, like other plants [S3].\n\nMosses have no true roots; thin threads called rhizoids hold them in place [S76].',
      '苔藓是又小又矮的植物，长成一团团柔软的绿垫，这里长在一块石头上。它们从来不开花，是不开花植物；它们和别的植物一样，也是绿色的 [S3]。\n\n苔藓没有真正的根，是一些叫“假根”的细丝把它们固定住 [S76]。',
    ),
  ),
  mushroom: p(
    t('Mushroom', '蘑菇'),
    t('A fungus, not a plant.', '是真菌，不是植物。'),
    t(
      'A mushroom is the part of a fungus that bears spores [S42]; the spores form on the thin gills under the cap [S76].\n\nA mushroom is not a plant. It has no roots, stems or leaves, and it has no chlorophyll, so it cannot make its own food [S4]. In Singapore, the Botanic Gardens has run workshops on how mushrooms are grown [S58].',
      '蘑菇是真菌长出孢子的那一部分 [S42]；孢子长在菌盖下面一片片薄薄的菌褶上 [S76]。\n\n蘑菇不是植物。它没有根、茎、叶，也没有叶绿素，所以不能自己制造食物 [S4]。新加坡植物园办过教人怎样种蘑菇的工作坊 [S58]。',
    ),
  ),
  'bracket-fungus': p(
    t('Bracket fungus', '多孔菌'),
    t('A fungus that feeds on dead wood.', '靠朽木过活的真菌。'),
    t(
      'Bracket fungi grow out of wood in layers like shelves. Singapore Biodiversity Online features 38 species of this group of fungi [S55].\n\nFungi like these break down dead wood: fungi are decomposers [S4]. Some attack living trees too. A study by NParks, NTU and NUS scientists of 134 trees in Singapore linked wood-rotting fungi with diseased trees [S56].',
      '多孔菌一层层地从木头上长出来，像一排排架子。“新加坡生物多样性在线”收录了这一类真菌的 38 个物种 [S55]。\n\n这类真菌会分解朽木：真菌是分解者 [S4]。有的也侵害活着的树。国家公园局、南洋理工大学和新加坡国立大学的科学家研究了新加坡 134 棵树，发现腐朽木头的真菌和生病的树有关 [S56]。',
    ),
  ),
  'mouldy-bread': p(
    t('Mould on bread', '面包上的霉'),
    t('Mould: a fungus you can see.', '霉：看得见的真菌。'),
    t(
      'Mould is a fungus. A single mould cell is far too small to see, but on food it grows into patches big enough to see, with a fuzzy look [S76]. Not every fungus grows as a mould [S42].\n\nDo not eat bread that has mould on it.',
      '霉是一种真菌。单独一个霉菌细胞小得看不见，但它在食物上长成一片，就大到看得见了，样子毛茸茸的 [S76]。并不是每一种真菌都会长成霉 [S42]。\n\n发了霉的面包不要吃。',
    ),
  ),
  yeast: p(
    t('Yeast', '酵母'),
    t('A fungus made of tiny single cells.', '由单个小细胞组成的真菌。'),
    t(
      'A small dish of dried yeast granules. Yeast is a fungus that lives mostly as single cells, and it reproduces by budding: a small new cell grows out of the side of an older one [S42].\n\nOne yeast cell is about 5 to 10 micrometres across [S76], far too small to see. The plinth beside the microscope shows yeast cells drawn 2,000 times life size [S59].',
      '一小碟干酵母颗粒。酵母是一种真菌，大多是一个个单独的细胞，靠出芽繁殖：老细胞旁边长出一个新的小细胞 [S42]。\n\n一个酵母细胞宽约 5 到 10 微米 [S76]，小得根本看不见。显微镜旁边的台座上，酵母细胞放大了 2,000 倍来画 [S59]。',
    ),
  ),
  'bacteria-dish': p(
    t('Bacteria in a dish', '培养皿里的细菌'),
    t('Bacteria: one is too small to see.', '细菌：一个小到看不见。'),
    t(
      'A covered glass dish with a thin layer of jelly on which bacteria have grown. One bacterium is far too small to see with the eyes alone [S4]. Each round spot is a colony: millions of bacteria grown from a single cell, large enough to see [S75].\n\nSome bacteria are helpful, for example in helping us digest food; others are harmful [S4]. This dish is a model: do not grow bacteria at home.',
      '一只盖着的玻璃培养皿，里面一层薄薄的胶冻上长着细菌。一个细菌小到用眼睛根本看不见 [S4]。每一个小圆斑是一个菌落：由一个细菌长成的成百万个细菌，大到看得见 [S75]。\n\n有的细菌对人有益，比如帮助我们消化食物；有的细菌有害 [S4]。这只培养皿是模型，不要在家里培养细菌。',
    ),
  ),
  grasshopper: p(
    t('Grasshopper', '蝗虫'),
    t('Six legs, three body parts: an insect.', '六条腿、身体分三部分：昆虫。'),
    t(
      'A much simplified model of the Javanese grasshopper, Valanga nigricornis, the animal of the topic Inside a Grasshopper [S71]. An insect has three body parts, six legs and two feelers (antennae), and a hard covering called an exoskeleton [S2].\n\nInside a Grasshopper shows the whole animal, inside and out.',
      '黑角瓦兰蝗（Valanga nigricornis）的简化模型，也就是“一只蝗虫的身体”主题里的那只 [S71]。昆虫有三部分身体、六条腿、两根触角，身体外面有一层硬硬的外骨骼 [S2]。\n\n“一只蝗虫的身体”主题把整只蝗虫从外到里讲了一遍。',
    ),
  ),
  beetle: p(
    t('Beetle', '甲虫'),
    t('Six legs and hard wing cases.', '六条腿，硬硬的翅鞘。'),
    t(
      'A beetle in general, not one particular kind. Like every insect, it has six legs and three body parts [S2]. Its front wings are hard cases that protect the thin hind wings; a beetle flies with its hind wings [S81].\n\nBeetles are among the animals named in the Primary 3 life cycles topic [S1].',
      '这是一只一般的甲虫，不代表哪一个物种。它和别的昆虫一样，有六条腿、三部分身体 [S2]。它的前翅是一对硬壳，叫翅鞘，保护下面薄薄的后翅；甲虫飞的时候用的是后翅 [S81]。\n\n小三“生活周期”一课点名的动物里就有甲虫 [S1]。',
    ),
  ),
  spider: p(
    t('Spider', '蜘蛛'),
    t('Eight legs: not an insect.', '八条腿：不是昆虫。'),
    t(
      'A spider in general, not one particular kind. Spiders are not insects: they have eight legs instead of six [S40], and two body parts instead of three [S40, S82].\n\nA spider belongs to none of the six animal groups in this topic. Spiders are arachnids [S42].',
      '这是一只一般的蜘蛛，不代表哪一个物种。蜘蛛不是昆虫：它有八条腿，不是六条 [S40]；身体分两部分，不是三部分 [S40, S82]。\n\n本主题的六个动物类群里，没有一个是蜘蛛的。蜘蛛属于蛛形纲 [S42]。',
    ),
  ),
  'javan-myna': p(
    t('Javan myna', '林八哥'),
    t('Feathers: a bird.', '有羽毛：鸟。'),
    t(
      'Acridotheres javanicus was brought to Singapore, and it is now the most common bird here [S9, S73]. It has dark grey feathers, with white wing tips that show from below in flight, and a yellow beak and yellow feet [S9].\n\nA bird has feathers, a beak, a pair of wings and a pair of legs [S2].',
      '林八哥（Acridotheres javanicus）是从外地引进新加坡的，现在是新加坡最常见的鸟 [S9, S73]。它全身暗灰色的羽毛，飞的时候从下面可以看到白色的翅尖，喙和脚是黄色的 [S9]。\n\n鸟有羽毛、喙、一对翅膀和一对腿 [S2]。',
    ),
  ),
  penguin: p(
    t('Penguin', '企鹅'),
    t('Cannot fly, but has feathers.', '不会飞，却有羽毛。'),
    t(
      'A penguin in general, not one particular kind. Penguins are birds that cannot fly; their wings are flippers, used for swimming [S42]. They have feathers and lay eggs [S2].\n\nPenguins live almost only in the southern half of the world [S42].',
      '这是一只一般的企鹅，不代表哪一个物种。企鹅是不会飞的鸟，它的翅膀是鳍状肢，用来游泳 [S42]。它们有羽毛，会下蛋 [S2]。\n\n企鹅几乎都生活在地球的南半部 [S42]。',
    ),
  ),
  'plantain-squirrel': p(
    t('Plantain squirrel', '大蕉松鼠'),
    t('Fur and a bushy tail: a mammal.', '有毛、尾巴蓬松：哺乳动物。'),
    t(
      'Callosciurus notatus is native to Singapore, widespread and common [S15]. Its body is covered in fur, and it has a long, bushy tail [S14].\n\nMammals have hair or fur and feed their young on milk [S2]. Plantain squirrels usually have two or three young at a time, cared for in leafy nests high in the trees [S14].',
      '大蕉松鼠（Callosciurus notatus）是新加坡的本地动物，分布广、很常见 [S15]。它全身长着毛，有一条又长又蓬松的尾巴 [S14]。\n\n哺乳动物有毛发，用奶喂养幼仔 [S2]。大蕉松鼠一胎通常生两三只，养在高高的树上用叶子搭的窝里 [S14]。',
    ),
  ),
  'fruit-bat': p(
    t('Lesser dog-faced fruit bat', '短耳犬蝠'),
    t('Flies, but has fur: a mammal.', '会飞，却有毛：哺乳动物。'),
    t(
      'Cynopterus brachyotis is native to Singapore, widespread and common [S17]. It has a furry body, eats fruit, spreads seeds and roosts upside down [S16].\n\nBats are mammals, the only mammals that can truly fly [S42]. A bat’s wing is skin stretched between the arm, the long finger bones and the side of the body [S76]; this model draws the finger bones as lines.',
      '短耳犬蝠（Cynopterus brachyotis）是新加坡的本地动物，分布广、很常见 [S17]。它身上毛茸茸的，吃果实，帮植物传播种子，倒挂着休息 [S16]。\n\n蝙蝠是哺乳动物，也是唯一真正会飞的哺乳动物 [S42]。蝙蝠的翅膀是一层皮，从手臂、长长的指骨一直连到身体两侧 [S76]；这个模型用细线画出指骨。',
    ),
  ),
  dolphin: p(
    t('Indo-Pacific humpback dolphin', '印度太平洋驼背豚'),
    t('Fins, yet a mammal that breathes air.', '有鳍，却是呼吸空气的哺乳动物。'),
    t(
      'Sousa chinensis is seen in the Singapore Straits and in the Johor Straits, and Singapore’s Red Data Book lists it as critically endangered [S21].\n\nDolphins are mammals; sharks are fish [S22]. A dolphin has lungs and comes up to breathe air through the blowhole on top of its head; it has no gills [S22]. It feeds its young on milk [S23]. It has two flippers, a fin on its back and a tail fluke, which it moves up and down to swim [S76, S77].',
      '印度太平洋驼背豚（Sousa chinensis）在新加坡海峡和柔佛海峡都有人见过；《新加坡红皮书》把它列为极危物种 [S21]。\n\n海豚是哺乳动物，鲨鱼是鱼 [S22]。海豚用肺呼吸，要游到水面，用头顶的喷水孔吸进空气；它没有鳃 [S22]。它用奶喂养幼仔 [S23]。它有两片鳍状肢、背上一片鳍和一条尾鳍，游泳时尾巴上下摆动 [S76, S77]。',
    ),
  ),
  pangolin: p(
    t('Sunda pangolin', '马来穿山甲'),
    t('Scales, yet a mammal.', '有鳞片，却是哺乳动物。'),
    t(
      'Manis javanica is native to Singapore, widespread but rare [S19]. NParks describes it as an infrequently seen, scaly mammal and lists it as critically endangered [S18]. Its scales are made of keratin, the same material as fingernails [S76].\n\nScales are not what makes an animal a reptile: like other mammals, a pangolin feeds its young on milk [S2].',
      '马来穿山甲（Manis javanica）是新加坡的本地动物，分布广但很少见 [S19]。国家公园局说它是一种难得一见、全身鳞片的哺乳动物，并把它列为极危物种 [S18]。它的鳞片由角蛋白构成，和我们的指甲是同一种材料 [S76]。\n\n身上有鳞片，不等于就是爬行动物：穿山甲和别的哺乳动物一样，用奶喂养幼仔 [S2]。',
    ),
  ),
  snakehead: p(
    t('Common snakehead', '斑鳢'),
    t('Scales and fins: a fish.', '有鳞有鳍：鱼。'),
    t(
      'Channa striata is a freshwater fish native to Singapore [S30]. It has a torpedo-shaped body and a flattened, snake-like head covered in large scales, and a long fin along its back [S30].\n\nA fish has scales, fins and a tail, and breathes through gills [S2].',
      '斑鳢（Channa striata）是新加坡本地的淡水鱼 [S30]。它的身体像鱼雷，头扁平、像蛇头，盖着大片的鳞，背上有一条长长的鳍 [S30]。\n\n鱼有鳞片、鳍和尾巴，用鳃呼吸 [S2]。',
    ),
  ),
  guppy: p(
    t('Guppy', '孔雀鱼'),
    t('A small fish brought to Singapore.', '被引进新加坡的小鱼。'),
    t(
      'Poecilia reticulata is not native to Singapore; it was brought here and is now widespread and common [S32]. Female guppies do not lay eggs: they give birth to live young [S31]. The Primary 3 syllabus uses the guppy as its own example of a name, and a fact, that pupils do not need to recall [S1].\n\nGuppies were released in many places to control mosquitoes, but it is debatable whether this had much effect [S31].',
      '孔雀鱼（Poecilia reticulata）不是新加坡的本地鱼，是从外地带进来的，现在分布广、很常见 [S32]。雌孔雀鱼不下蛋，而是直接生出小鱼 [S31]。小三课纲正好拿孔雀鱼当例子，说明不要求学生记住生物的名字和这类特征 [S1]。\n\n很多地方放养孔雀鱼来控制蚊子，但效果到底有多大，还有争议 [S31]。',
    ),
  ),
  mudskipper: p(
    t('Giant mudskipper', '许氏齿弹涂鱼'),
    t('A fish that breathes on land.', '能在陆地上呼吸的鱼。'),
    t(
      'Periophthalmodon schlosseri [S72] lives on mudflats. To breathe on land, it stores seawater in its gill chambers and takes in oxygen through its skin [S29]. Unlike most fish, it has fleshy front fins [S29].\n\nIt spends much of its time out of the water, but it has fins, scales and gills: it is a fish [S2].',
      '许氏齿弹涂鱼（Periophthalmodon schlosseri）[S72] 生活在泥滩上。为了在陆地上呼吸，它把海水存在鳃腔里，还透过皮肤吸收氧气 [S29]。和大多数鱼不同，它的胸鳍是肉质的 [S29]。\n\n它常常离开水，但它有鳍、有鳞片、有鳃，是鱼 [S2]。',
    ),
  ),
  shark: p(
    t('Shark', '鲨鱼'),
    t('Gills and fins: a fish.', '有鳃有鳍：鱼。'),
    t(
      'A shark in general, not one particular kind. Sharks are fish, and they breathe with gills [S22]. Their skin is covered in tiny tooth-like scales [S79].\n\nA shark swims by moving its tail from side to side; a dolphin moves its tail up and down [S77]. Some sharks give birth to live young and others lay eggs, so giving birth does not tell a shark from a dolphin [S23].',
      '这是一条一般的鲨鱼，不代表哪一个物种。鲨鱼是鱼，用鳃呼吸 [S22]。它的皮肤上盖满了像小牙齿一样的细小鳞片 [S79]。\n\n鲨鱼游泳时尾巴左右摆动，海豚的尾巴却是上下摆动 [S77]。有的鲨鱼直接生出小鲨鱼，有的下蛋，所以看“是不是直接生小的”分不出鲨鱼和海豚 [S23]。',
    ),
  ),
  'tree-frog': p(
    t('Four-lined tree frog', '斑腿泛树蛙'),
    t('Moist, smooth skin: an amphibian.', '皮肤湿润光滑：两栖动物。'),
    t(
      'Polypedates leucomystax is native to Singapore [S35]. Its skin is fairly smooth, its legs are long and slender and its toe tips are widened into flat pads; it has four dark lines down its back [S35]. It whips up a frothy nest on plants or walls hanging over a pond or drain [S34].\n\nAmphibians have moist skin [S2].',
      '斑腿泛树蛙（Polypedates leucomystax）是新加坡的本地动物 [S35]。它的皮肤比较光滑，四肢细长，趾尖扩大成扁平的吸盘，背上有四道深色的纵纹 [S35]。它会在水塘或水沟上方的植物或墙上，搅出一团泡沫做巢 [S34]。\n\n两栖动物的皮肤是湿润的 [S2]。',
    ),
  ),
  'asian-toad': p(
    t('Asian toad', '黑眶蟾蜍'),
    t('Dry, bumpy skin, yet an amphibian.', '皮肤干而多疙瘩，仍是两栖动物。'),
    t(
      'Duttaphrynus melanostictus is widespread and common in Singapore [S8]. Its surest identifying feature is the bony ridges just behind its eyes, and toads have dry, bumpy skin [S6].\n\nAll toads are frogs, but not all frogs are toads [S6]. So a toad is an amphibian, even with dry skin.\n\nSources disagree on whether it is native to Singapore: NParks’ Flora & Fauna Web lists it as native [S7], while NParks’ BiodiversitySG calls it non-native [S6] and Singapore Biodiversity Online an introduced species [S8].',
      '黑眶蟾蜍（Duttaphrynus melanostictus）在新加坡分布广、很常见 [S8]。最可靠的辨认特征是眼睛后面的骨棱；蟾蜍的皮肤干燥、多疙瘩 [S6]。\n\n所有的蟾蜍都是蛙，但不是所有的蛙都是蟾蜍 [S6]。所以蟾蜍虽然皮肤干，仍是两栖动物。\n\n它是不是新加坡的本地动物，各方说法不一：国家公园局的“动植物网”说是本地的 [S7]，国家公园局的“新加坡生物多样性”网站说不是 [S6]，“新加坡生物多样性在线”说是引进的外来物种 [S8]。',
    ),
  ),
  'house-gecko': p(
    t('Common house gecko', '疣尾蜥虎'),
    t('Small scales: a reptile.', '细小的鳞片：爬行动物。'),
    t(
      'Hemidactylus frenatus is native to Singapore [S13] and about 13 cm long [S12]. Its skin is thin, with small scales that do not overlap; its eyes are large and have no eyelids; its toes are widened into sticky pads [S12].\n\nReptiles have dry skin with scales and breathe with lungs [S2].',
      '疣尾蜥虎（Hemidactylus frenatus）是新加坡的本地动物 [S13]，长约 13 厘米 [S12]。它的皮肤薄，鳞片细小、互不重叠；眼睛很大，没有眼睑；脚趾扩大成有黏性的趾垫 [S12]。\n\n爬行动物的皮肤干燥、有鳞片，用肺呼吸 [S2]。',
    ),
  ),
  python: p(
    t('Reticulated python', '网纹蟒'),
    t('Scales and no legs: a reptile.', '有鳞、没有腿：爬行动物。'),
    t(
      'Malayopython reticulatus. Its scales form a net-like pattern, and it lays large clutches of 15 to 80 eggs [S27].\n\nA snake has no legs, but its dry, scaly skin makes it a reptile [S2].',
      '网纹蟒（Malayopython reticulatus）身上的鳞片排成网一样的花纹，一窝能下 15 到 80 个蛋 [S27]。\n\n蛇没有腿，但它干燥、有鳞片的皮肤说明它是爬行动物 [S2]。',
    ),
  ),
  'hawksbill-turtle': p(
    t('Hawksbill turtle', '玳瑁'),
    t('A reptile that lives in the sea.', '住在海里的爬行动物。'),
    t(
      'Eretmochelys imbricata is one of the two kinds of sea turtle found in Singapore, and it is critically endangered. Between May and October it comes ashore at night to lay its eggs [S28].\n\nIts head tapers to a point, giving it a hawk-like look, and it has scales on its head [S78]. Its limbs are flippers [S76]. Some reptiles, such as turtles, have a shell [S2].',
      '玳瑁（Eretmochelys imbricata）是新加坡能见到的两种海龟之一，属于极危物种。每年五月到十月，它会在夜里上岸下蛋 [S28]。\n\n它的头向前收尖，样子像鹰，头上有鳞片 [S78]。它的四肢是鳍状肢 [S76]。有些爬行动物有壳，比如龟 [S2]。',
    ),
  ),
  'yeast-cells': p(
    t('Yeast cells, magnified', '放大的酵母细胞'),
    t('Drawn far larger than life.', '画得比实物大得多。'),
    t(
      'Cells of yeast drawn 2,000 times life size [S59]. Yeast cells are round to oval and 5 to 10 micrometres across [S76]: a hundred of the largest, side by side, would reach only one millimetre.\n\nFour of these cells are budding: a small new cell grows out of the side of an older one [S42].',
      '放大 2,000 倍画的酵母细胞 [S59]。酵母细胞是圆形到椭圆形的，宽 5 到 10 微米 [S76]：就算是最大的，一百个排成一行也只有一毫米长。\n\n其中四个细胞正在出芽：老细胞旁边长出一个新的小细胞 [S42]。',
    ),
  ),
  'bacteria-cells': p(
    t('Bacteria, magnified', '放大的细菌'),
    t('Drawn far larger than life.', '画得比实物大得多。'),
    t(
      'Bacteria drawn 2,000 times life size, at the same scale as the yeast cells beside them [S59]: some rod-shaped, some round. Most bacteria are a single cell [S42], typically 0.5 to 5 micrometres long [S76], several times smaller than a yeast cell.\n\nEach one is a whole living thing.',
      '放大 2,000 倍画的细菌，和旁边的酵母细胞按同一个比例画 [S59]：有的是杆状，有的是圆球状。大多数细菌只是一个细胞 [S42]，一般长 0.5 到 5 微米 [S76]，比酵母细胞还要小好几倍。\n\n每一个细菌都是一个完整的生物。',
    ),
  ),
  microscope: p(
    t('Microscope', '显微镜'),
    t('Makes very small things look larger.', '把很小的东西放大来看。'),
    t(
      'A school microscope, drawn life size. Through its lenses you can see things too small to see with the eyes alone.\n\nThe cells on the plinth beside it are not the view through this microscope: they are a separate model, drawn 2,000 times life size [S59].',
      '一台学校用的显微镜，按实物大小画。透过它的镜头，可以看到用眼睛看不见的小东西。\n\n旁边台座上的细胞不是从这台显微镜里看到的样子，而是另外做的模型，放大 2,000 倍来画 [S59]。',
    ),
  ),
  'pad-2a': padText('A'),
  'pad-2b': padText('B'),
  'pad-3a': padText('A'),
  'pad-3b': padText('B'),
  'pad-3c': padText('C'),
  'pad-6a': padText('A'),
  'pad-6b': padText('B'),
  'pad-6c': padText('C'),
  'pad-6d': padText('D'),
  'pad-6e': padText('E'),
  'pad-6f': padText('F'),
  'pad-x': p(
    t('Not in these six groups', '不在这六类里'),
    t('Animals in none of the six groups.', '不属于这六类的动物。'),
    t(
      'A felt pad beside the specimen case, for animals that answer “no” to every question of the animal flowchart, or that a classmate’s tray puts in none of the six groups. The model decides what lands here [S59].',
      '标本盒旁边的一块毡垫。动物流程图的每个问题都答“不是”的动物，或者同学的分类盘没有放进六类里的动物，就放在这里。落到这里的是哪几只，由模型决定 [S59]。',
    ),
  ),
  bench: p(
    t('Bench', '长桌'),
    t('A classroom bench, 1.9 by 1.1 metres.', '课室里的长桌，1.9 × 1.1 米。'),
    t('A classroom bench, drawn life size: 1.9 × 1.1 m [S59]. The specimens on it are not to scale.', '课室里的长桌，按实物大小画：1.9 × 1.1 米 [S59]。桌上的标本不按比例。'),
  ),
  'specimen-case': p(
    t('Specimen case', '标本盒'),
    t('Thirty-two specimens, one to a compartment.', '32 件标本，一格放一件。'),
    t(
      'A shallow wooden case with 9 × 4 compartments, each 9 cm square [S59]. Every specimen has its own compartment and goes back to it when it is not on the tray.',
      '一只浅浅的木盒，分成 9 × 4 个格子，每格 9 厘米见方 [S59]。每件标本有自己的格子，不在分类盘上的时候就回到格子里。',
    ),
  ),
  'sorting-tray': p(
    t('Sorting tray', '分类盘'),
    t('Felt pads on it mark the groups.', '盘上的毡垫标出各组。'),
    t(
      'A wooden tray, 1.0 × 0.5 m [S59]. Felt pads on it mark two, three or six groups, depending on the chapter’s questions.',
      '一只木盘，1.0 × 0.5 米 [S59]。盘上的毡垫按本章的问题，分成两组、三组或六组。',
    ),
  ),
  'cell-plinth': p(
    t('Plinth', '台座'),
    t('Cells drawn 2,000 times life size.', '放大 2,000 倍画的细胞。'),
    t('A dark plinth for the cells drawn 2,000 times life size [S59], kept apart from the specimens on the bench.', '一块深色台座，放着放大 2,000 倍画的细胞 [S59]，和桌上的标本分开。'),
  ),
};
