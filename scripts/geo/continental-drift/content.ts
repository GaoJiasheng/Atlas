/**
 * continental-drift chapter states (docs/72 §2), the object texts the reader and the map placards
 * show, and the camera targets. `write-content.ts` turns this into chapter frontmatter (bodies are
 * edited in the MDX files) and public/geo/cd-points-text.json. Every caption was checked against
 * the model frame at its age (docs/72 §9).
 */
export interface Bi { en: string; zh: string }
/** A fixed 0 Ma view, or the objects to frame where they are at the beat's age (DS06). */
export type Cam = 'G0' | 'ATL0' | 'SEA0' | 'ICE0' | 'AUS0' | { fit: string[]; zoom?: number };
export interface BeatDef { ma: number; cam: Cam; layers: string[]; highlight: string[]; caption: Bi }
export interface ChapterDef { file: string; id: string; order: number; kind?: 'background'; title: Bi; summary: Bi; index: string[]; note?: Bi; beats: BeatDef[] }

export const PRESETS: Record<'G0' | 'ATL0' | 'SEA0' | 'ICE0' | 'AUS0', { center: [number, number]; zoom: number }> = {
  G0: { center: [20, 10], zoom: 2 },
  ATL0: { center: [-25, 15], zoom: 2.6 },
  SEA0: { center: [105, 3], zoom: 3.4 },
  ICE0: { center: [-22, 63], zoom: 3.6 },
  AUS0: { center: [134, -25], zoom: 3 },
};

/** Groups of plate-bound objects a beat may frame. */
export const FIT_GROUPS: Record<string, string[]> = {
  all: ['name-north-america', 'name-south-america', 'name-africa', 'name-europe', 'name-asia', 'name-india', 'name-australia', 'name-antarctica'],
  glacial: ['glacial-dwyka', 'glacial-itarare', 'glacial-talchir', 'glacial-wynyard', 'glacial-pagoda'],
  belts: ['belt-appalachians', 'belt-east-greenland', 'belt-scottish-highlands', 'belt-scandinavian-caledonides'],
  'south-atlantic': ['name-south-america', 'name-africa'],
  'central-atlantic': ['name-north-america', 'name-africa', 'name-europe'],
  'indian-ocean': ['name-india', 'name-africa', 'name-australia', 'name-antarctica'],
  'india-asia': ['name-india', 'name-asia'],
  'gondwana-north': ['name-africa', 'name-south-america', 'name-north-america', 'name-europe'],
};

const L = {
  land: ['base', 'cd-land', 'cd-names'],
};
const bi = (en: string, zh: string): Bi => ({ en, zh });

export const CHAPTERS: ChapterDef[] = [
  {
    file: '00-background.mdx', id: 'background', order: 0, kind: 'background',
    title: bi('A map that moves', '会动的地图'),
    summary: bi('See how this map turns today’s continents back in time.', '看这张地图怎样把今天的大陆沿时间往回转。'),
    note: bi(
      'The map turns today’s coastlines back in time with the Merdith et al. 2021 plate model. Outlines are today’s coasts, not ancient shorelines, and east–west positions are a model convention. Dots mark where evidence is found today. Numbers link to their sources.',
      '地图用 Merdith 等 2021 年的板块模型，把今天的海岸线沿时间往回转。轮廓是今天的海岸，不是古代海岸线；东西方向的位置是模型的约定。点表示证据今天的发现地。数字都可点开来源。',
    ),
    index: ['site-singapore'],
    beats: [
      { ma: 0, cam: 'G0', layers: L.land, highlight: [], caption: bi('Today: these are the continents as they look now. In this map they are cut into plates, and each plate can be turned back in time.', '今天：这是大陆现在的样子。地图把它们按板块切开，每一块都能沿时间往回转。') },
      { ma: 0, cam: 'ATL0', layers: [...L.land, 'cd-shelf'], highlight: [], caption: bi('Today: the pale band around each continent is its edge under the sea. It is part of the same continent, so the model moves it with the land.', '今天：大陆周围的浅色带是没在海里的大陆边缘。它和陆地属于同一块大陆，模型让它们一起移动。') },
      { ma: 0, cam: 'SEA0', layers: [...L.land, 'cd-shelf', 'cd-singapore'], highlight: ['site-singapore'], caption: bi('Today: Singapore is marked as a reference point. Drag the timeline and watch where the model carries it.', '今天：新加坡标成一个参照点。拖动时间轴，看模型把它带到哪里。') },
    ],
  },
  {
    file: '01-before-pangaea.mdx', id: 'before-pangaea', order: 1,
    title: bi('Before Pangaea', '盘古大陆之前'),
    summary: bi('Watch separate continents move towards each other.', '看分开的大陆怎样彼此靠近。'),
    index: ['name-gondwana'],
    beats: [
      { ma: 400, cam: { fit: ['all'] }, layers: L.land, highlight: ['name-gondwana'], caption: bi('400 million years ago: a large southern continent, Gondwana, lies apart from the northern continents. The outlines are today’s coasts carried back by the model.', '4 亿年前：南方的大陆冈瓦纳与北方的大陆隔着海洋。轮廓是模型带回去的今天的海岸。') },
      { ma: 370, cam: { fit: ['all'] }, layers: L.land, highlight: [], caption: bi('370 million years ago: the gap is narrower. Each plate turns about its own pole, so the pieces do not all move the same way.', '3.7 亿年前：缺口变窄了。每块板块绕自己的极转动，所以各块移动的方向不一样。') },
      { ma: 340, cam: { fit: ['all'] }, layers: L.land, highlight: [], caption: bi('340 million years ago: the continents are closing in. The ocean floor that lay between them has since sunk back into the Earth, so the model leaves the space empty.', '3.4 亿年前：大陆越来越近。它们之间的洋底后来沉回了地球内部，所以模型在那里留空。') },
      { ma: 330, cam: { fit: ['gondwana-north'] }, layers: L.land, highlight: ['name-gondwana'], caption: bi('330 million years ago: Gondwana is meeting the northern continents. Where they pushed together, mountain ranges rose.', '3.3 亿年前：冈瓦纳和北方的大陆相遇。挤在一起的地方隆起了山脉。') },
    ],
  },
  {
    file: '02-pangaea-and-ice.mdx', id: 'pangaea-and-ice', order: 2,
    title: bi('One supercontinent, one ice age', '一块超大陆，一场冰期'),
    summary: bi('Find rocks left by glaciers and see where they gather.', '找到冰川留下的岩石，看它们聚在哪里。'),
    index: ['name-pangaea', 'glacial-dwyka', 'glacial-itarare', 'glacial-talchir', 'glacial-wynyard', 'glacial-pagoda'],
    beats: [
      { ma: 310, cam: { fit: ['all'] }, layers: L.land, highlight: ['name-pangaea'], caption: bi('310 million years ago: most of the world’s land is joining into one supercontinent, Pangaea.', '3.1 亿年前：世界上大部分陆地正连成一块超大陆——盘古大陆。') },
      { ma: 300, cam: { fit: ['glacial'] }, layers: [...L.land, 'cd-glacial'], highlight: [], caption: bi('300 million years ago: each dot marks rocks left by glaciers, found today in South America, Africa, India, Australia and Antarctica. Here the dots lie close together in the far south.', '3 亿年前：每个点表示冰川留下的岩石，今天分布在南美、非洲、印度、澳大利亚和南极洲。在这里，这些点靠在一起，都在遥远的南方。') },
      { ma: 300, cam: { fit: ['glacial-dwyka'] }, layers: [...L.land, 'cd-glacial'], highlight: ['glacial-dwyka'], caption: bi('300 million years ago: in southern Africa, glaciers scratched the rock and left a layer of boulders mixed with mud. Its dot marks the region where these rocks were described.', '3 亿年前：在非洲南部，冰川刮花了岩石，留下石块和泥混在一起的地层。这个点标出记录这些岩石的地区。') },
      { ma: 300, cam: { fit: ['glacial'] }, layers: [...L.land, 'cd-glacial'], highlight: ['glacial-itarare', 'glacial-talchir'], caption: bi('300 million years ago: Wegener argued that one ice cap in the far south explained these rocks better than ice in five far-apart places.', '3 亿年前：魏格纳认为，一片在遥远南方的冰盖，比五个相隔很远的冰川更能解释这些岩石。') },
      { ma: 0, cam: 'G0', layers: [...L.land, 'cd-glacial'], highlight: [], caption: bi('Today: the same glacier rocks lie on five continents, some of them now close to the Equator.', '今天：同样的冰川岩石分散在五块大陆上，有些如今已靠近赤道。') },
    ],
  },
  {
    file: '03-shared-fossils.mdx', id: 'shared-fossils', order: 3,
    title: bi('Fossils on both sides of the ocean', '大洋两岸的化石'),
    summary: bi('Follow four fossils whose finds are now split by oceans.', '跟着四种化石，看它们的发现地怎样被大洋隔开。'),
    index: ['taxon-mesosaurus', 'taxon-glossopteris', 'taxon-lystrosaurus', 'taxon-cynognathus'],
    beats: [
      { ma: 285, cam: { fit: ['taxon-mesosaurus'] }, layers: [...L.land, 'cd-fossils'], highlight: ['taxon-mesosaurus'], caption: bi('285 million years ago: Mesosaurus fossils are found today in southern Africa and South America. On this map their sites lie close together.', '2.85 亿年前：中龙化石今天发现于非洲南部和南美洲。在这张图上，它们的发现地靠得很近。') },
      { ma: 270, cam: { fit: ['taxon-glossopteris'] }, layers: [...L.land, 'cd-fossils'], highlight: ['taxon-glossopteris'], caption: bi('270 million years ago: Glossopteris was a seed plant with tongue-shaped leaves. Most of its fossils come from the southern continents.', '2.7 亿年前：舌羊齿是一种种子植物，叶子像舌头。它的化石大多来自南方各块大陆。') },
      { ma: 250, cam: { fit: ['taxon-lystrosaurus'] }, layers: [...L.land, 'cd-fossils'], highlight: ['taxon-lystrosaurus'], caption: bi('250 million years ago: Lystrosaurus was a land animal that probably ate plants. Its fossils come from Africa, India and Antarctica, and also from parts of Asia.', '2.5 亿年前：水龙兽是一种陆地动物，很可能吃植物。它的化石来自非洲、印度和南极洲，也来自亚洲一些地方。') },
      { ma: 245, cam: { fit: ['taxon-cynognathus'] }, layers: [...L.land, 'cd-fossils'], highlight: ['taxon-cynognathus'], caption: bi('245 million years ago: Cynognathus was an extinct mammal-like reptile. Its fossils come from more than one southern continent.', '2.45 亿年前：犬颌兽是一种已灭绝的似哺乳爬行动物。它的化石来自不止一块南方大陆。') },
      { ma: 0, cam: 'G0', layers: [...L.land, 'cd-fossils'], highlight: [], caption: bi('Today: the same fossil sites are separated by oceans. Wegener argued that the land itself had once been joined.', '今天：同样的化石发现地被大洋隔开。魏格纳认为，是陆地本身曾经连在一起。') },
    ],
  },
  {
    file: '04-southeast-asia-assembles.mdx', id: 'southeast-asia-assembles', order: 4,
    title: bi('How Southeast Asia came together', '东南亚怎样拼到一起'),
    summary: bi('Follow the ground under Singapore as blocks join.', '跟着新加坡脚下的地块，看各地块怎样拼合。'),
    index: ['site-singapore'],
    beats: [
      { ma: 250, cam: { fit: ['site-singapore'], zoom: 2.8 }, layers: [...L.land, 'cd-singapore'], highlight: ['site-singapore'], caption: bi('250 million years ago: the ground under today’s Singapore is part of a smaller block at the edge of an ocean. The line shows the model’s path for it from here to today.', '2.5 亿年前：今天新加坡脚下的地块，是大洋边缘一块较小的陆块。线条显示模型给出的它从这时到今天的路径。') },
      { ma: 230, cam: { fit: ['site-singapore'], zoom: 2.8 }, layers: [...L.land, 'cd-singapore'], highlight: ['site-singapore'], caption: bi('230 million years ago: molten rock rose above a sinking ocean plate and cooled into granite. Singapore’s Bukit Timah granites formed between about 285 and 230 million years ago.', '2.3 亿年前：洋板块下沉，上方的岩浆上升、冷却成花岗岩。新加坡武吉知马的花岗岩形成于约 2.85 亿至 2.3 亿年前。') },
      { ma: 210, cam: { fit: ['site-singapore'], zoom: 2.8 }, layers: [...L.land, 'cd-singapore'], highlight: ['site-singapore'], caption: bi('210 million years ago: in the model, the block under Singapore has travelled far north with its neighbours. Its path is the model’s; east–west positions are a convention.', '2.1 亿年前：在模型里，新加坡脚下的地块和相邻地块一起向北移动了很远。路径来自模型；东西位置只是约定。') },
      { ma: 195, cam: { fit: ['site-singapore'], zoom: 2.8 }, layers: [...L.land, 'cd-singapore'], highlight: ['site-singapore'], caption: bi('195 million years ago: by about now, the blocks of the Malay Peninsula had joined. The joining zone runs about 50 to 100 kilometres west of where Singapore is today.', '1.95 亿年前：大约到这时，马来半岛的地块已经拼合。拼合带在今天新加坡以西约 50 至 100 公里。') },
    ],
  },
  {
    file: '05-atlantic-jigsaw.mdx', id: 'atlantic-jigsaw', order: 5,
    title: bi('A jigsaw across the Atlantic', '大西洋两岸的拼图'),
    summary: bi('Compare the coasts, the sea-covered edges and the old mountains.', '比较海岸、海下边缘和古老山脉。'),
    index: ['belt-appalachians', 'belt-east-greenland', 'belt-scottish-highlands', 'belt-scandinavian-caledonides'],
    beats: [
      { ma: 200, cam: { fit: ['south-atlantic'] }, layers: L.land, highlight: [], caption: bi('200 million years ago: South America and Africa are still joined. Their matching coasts made people ask whether continents could move.', '2 亿年前：南美洲和非洲还连在一起。两岸相合的海岸，让人想到大陆会不会移动。') },
      { ma: 200, cam: { fit: ['south-atlantic'] }, layers: [...L.land, 'cd-shelf'], highlight: [], caption: bi('200 million years ago: the fit is closer along the continents’ edges under the sea, which lie beyond today’s coasts.', '2 亿年前：沿着海下的大陆边缘拼，比沿今天的海岸拼得更合。') },
      { ma: 200, cam: { fit: ['belts'] }, layers: [...L.land, 'cd-belts'], highlight: ['belt-appalachians', 'belt-scottish-highlands', 'belt-scandinavian-caledonides'], caption: bi('200 million years ago: old mountain belts in North America, Greenland, Britain and Norway line up into one long chain.', '2 亿年前：北美、格陵兰、英国和挪威的古老山带，连成一条长长的山链。') },
      { ma: 200, cam: { fit: ['all'] }, layers: [...L.land, 'cd-belts'], highlight: [], caption: bi('200 million years ago: Wegener put this evidence together in 1915. Most geologists rejected the idea, because he could not explain what force moved the continents.', '2 亿年前：魏格纳在 1915 年把这些证据放在一起。多数地质学家不接受，因为他说不清是什么力推动了大陆。') },
    ],
  },
  {
    file: '06-breaking-apart.mdx', id: 'breaking-apart', order: 6,
    title: bi('Pangaea breaks apart', '盘古大陆分裂'),
    summary: bi('Watch the supercontinent split and new oceans open.', '看超大陆裂开、新的大洋张开。'),
    index: ['name-pangaea', 'name-gondwana'],
    beats: [
      { ma: 195, cam: { fit: ['central-atlantic'] }, layers: L.land, highlight: ['name-pangaea'], caption: bi('195 million years ago: a narrow sea is opening between North America and Africa. It is the start of the central Atlantic Ocean.', '1.95 亿年前：北美和非洲之间正张开一道窄海，这是中大西洋的开端。') },
      { ma: 155, cam: { fit: ['all'] }, layers: L.land, highlight: ['name-gondwana'], caption: bi('155 million years ago: the oldest sea floor between Africa and the eastern lands dates from about now. Gondwana is splitting into a western part and an eastern part.', '1.55 亿年前：非洲和东边陆地之间最老的洋底，大约形成于这时。冈瓦纳正分成西、东两部分。') },
      { ma: 130, cam: { fit: ['south-atlantic'] }, layers: L.land, highlight: [], caption: bi('130 million years ago: South America and Africa are starting to pull apart, beginning in the south.', '1.3 亿年前：南美洲和非洲开始分开，从南端开始。') },
      { ma: 80, cam: { fit: ['indian-ocean'] }, layers: L.land, highlight: [], caption: bi('80 million years ago: India has broken away from Antarctica and Australia, and from Madagascar too. It is moving north across the ocean.', '8000 万年前：印度已经和南极洲、澳大利亚分开，也离开了马达加斯加，正向北穿过大洋。') },
    ],
  },
  {
    file: '07-ocean-floor-record.mdx', id: 'ocean-floor-record', order: 7,
    title: bi('The ocean floor keeps a record', '海底留下的记录'),
    summary: bi('Read the age and magnetism of the ocean floor.', '读懂洋底的年龄和磁性。'),
    index: ['ridge-mid-atlantic', 'site-reykjanes'],
    beats: [
      { ma: 50, cam: { fit: ['india-asia'] }, layers: ['base', 'cd-land'], highlight: [], caption: bi('50 million years ago: India is close to Asia. The two collided between about 50 and 40 million years ago, and the collision helped raise the Himalayas.', '5000 万年前：印度已靠近亚洲。两者在约 5000 万至 4000 万年前相撞，这次碰撞抬升了喜马拉雅山。') },
      { ma: 0, cam: 'G0', layers: ['base', 'cd-land', 'cd-seafloor'], highlight: [], caption: bi('Today: colours show the age of the ocean floor. The youngest rock lies along the underwater ridges and gets older away from them.', '今天：颜色表示洋底的年龄。最年轻的岩石在海底山脊一带，离山脊越远越老。') },
      { ma: 0, cam: 'ATL0', layers: ['base', 'cd-land', 'cd-seafloor'], highlight: ['ridge-mid-atlantic'], caption: bi('Today: in 1952, Marie Tharp’s depth profiles showed a valley running along the middle of this underwater ridge.', '今天：1952 年，玛丽·撒普画出的海底剖面显示，这条海底山脊中央有一道裂谷。') },
      { ma: 0, cam: 'ICE0', layers: ['base', 'cd-land', 'cd-stripes'], highlight: ['site-reykjanes'], caption: bi('Today: south of Iceland, measured magnetism in the sea floor forms stripes that mirror each other on both sides of the ridge.', '今天：在冰岛以南，测得的洋底磁性形成条带，在洋脊两侧互为镜像。') },
      { ma: 0, cam: 'ICE0', layers: ['base', 'cd-land', 'cd-stripes'], highlight: ['site-reykjanes'], caption: bi('Today: cooling rock records Earth’s magnetic field, which has flipped many times. Matching stripes showed that new sea floor forms at the ridge and spreads both ways.', '今天：岩石冷却时记录下地磁场，而地磁场翻转过很多次。对称的条带说明，新的洋底在洋脊生成，向两侧扩张。') },
    ],
  },
  {
    file: '08-moving-today.mdx', id: 'moving-today', order: 8,
    title: bi('Still moving today', '今天仍在移动'),
    summary: bi('Compare GPS speeds with how fast your fingernails grow.', '把 GPS 测到的速度和指甲生长的速度比一比。'),
    index: ['gps-ntus', 'gps-australia', 'gps-reyk', 'gps-iceland-east'],
    beats: [
      { ma: 0, cam: 'G0', layers: ['base', 'cd-land', 'cd-gps'], highlight: [], caption: bi('Today: arrows show how far GPS stations move each year. Each region has its own speed and direction.', '今天：箭头表示 GPS 站每年移动多远。每个地区的速度和方向都不一样。') },
      { ma: 0, cam: 'SEA0', layers: ['base', 'cd-land', 'cd-gps', 'cd-singapore'], highlight: ['gps-ntus'], caption: bi('Today: the GPS station at Nanyang Technological University in Singapore moves about 2.8 centimetres a year, towards the east and slightly south.', '今天：新加坡南洋理工大学的 GPS 站每年移动约 2.8 厘米，方向朝东、略偏南。') },
      { ma: 0, cam: 'AUS0', layers: ['base', 'cd-land', 'cd-gps', 'cd-singapore'], highlight: ['gps-australia'], caption: bi('Today: Australia moves about 7 centimetres a year, towards the north-east. Its official map coordinates have been updated to keep up.', '今天：澳大利亚每年向东北移动约 7 厘米。它的官方地图坐标因此做了更新。') },
      { ma: 0, cam: 'ICE0', layers: ['base', 'cd-land', 'cd-gps', 'cd-singapore'], highlight: ['gps-reyk', 'gps-iceland-east'], caption: bi('Today: Iceland sits on the Atlantic ridge. Stations on its two sides move in different directions, so the island is slowly being pulled apart.', '今天：冰岛坐落在大西洋洋脊上。两侧的 GPS 站朝不同方向移动，这座岛正被慢慢拉开。') },
      { ma: 0, cam: 'G0', layers: ['base', 'cd-land', 'cd-gps', 'cd-singapore'], highlight: [], caption: bi('Today: fingernails grow about 4 centimetres a year. Plates move a few centimetres a year, about as slowly. Over 200 million years, that adds up to thousands of kilometres.', '今天：指甲每年长约 4 厘米，板块每年移动几厘米，差不多一样慢。2 亿年下来，就是几千公里。') },
    ],
  },
];

/** Reader and placard text for every object a chapter can highlight or index. */
export const OBJECTS: Record<string, { title: Bi; summary: Bi; sources: string[] }> = {
  'site-singapore': { title: bi('Singapore', '新加坡'), summary: bi('A reference point at today’s Singapore, carried with its plate. Today it lies on the Sunda plate in one plate model.', '今天新加坡位置上的参照点，随所在板块转动。在一个板块模型里，它今天位于巽他板块上。'), sources: ['S2', 'S37'] },
  'name-gondwana': { title: bi('Gondwana', '冈瓦纳'), summary: bi('The large southern continent: today’s South America, Africa, Madagascar, India, Antarctica and Australia.', '南方的大陆：今天的南美洲、非洲、马达加斯加、印度、南极洲和澳大利亚。'), sources: ['S4'] },
  'name-pangaea': { title: bi('Pangaea', '盘古大陆'), summary: bi('The supercontinent: it began to assemble about 320 million years ago and began to break apart about 200 million years ago.', '超大陆：约 3.2 亿年前开始拼合，约 2 亿年前开始分裂。'), sources: ['S4', 'S5'] },
  'glacial-dwyka': { title: bi('Dwyka glacial rocks', '德维卡冰川岩层'), summary: bi('Glacial deposits of the Dwyka Group, Karoo Basin, South Africa. The dot marks the region, not an exact site.', '南非卡鲁盆地德维卡群的冰川沉积。点只标出地区，不是精确地点。'), sources: ['S21', 'S6'] },
  'glacial-itarare': { title: bi('Itararé glacial rocks', '伊塔拉雷冰川岩层'), summary: bi('Glacial deposits of the Itararé Group, Paraná Basin, Brazil. The dot marks the region, not an exact site.', '巴西巴拉那盆地伊塔拉雷群的冰川沉积。点只标出地区，不是精确地点。'), sources: ['S21', 'S6'] },
  'glacial-talchir': { title: bi('Talchir glacial rocks', '塔尔切尔冰川岩层'), summary: bi('Glacial deposits of the Talchir Formation, Odisha, India. The dot marks the region, not an exact site.', '印度奥里萨邦塔尔切尔组的冰川沉积。点只标出地区，不是精确地点。'), sources: ['S21', 'S6'] },
  'glacial-wynyard': { title: bi('Wynyard glacial rocks', '温亚德冰川岩层'), summary: bi('Glacial deposits of the Wynyard Formation, Tasmania, Australia. The dot marks the region, not an exact site.', '澳大利亚塔斯马尼亚温亚德组的冰川沉积。点只标出地区，不是精确地点。'), sources: ['S21', 'S6'] },
  'glacial-pagoda': { title: bi('Pagoda glacial rocks', '帕戈达冰川岩层'), summary: bi('Glacial deposits of the Pagoda Formation, Beardmore Glacier area, Antarctica. The dot marks the region, not an exact site.', '南极洲比尔德莫尔冰川一带帕戈达组的冰川沉积。点只标出地区，不是精确地点。'), sources: ['S21', 'S6'] },
  'belt-appalachians': { title: bi('Appalachians', '阿巴拉契亚山脉'), summary: bi('Part of the old mountain belt that ran on through Newfoundland, Greenland, Britain and Scandinavia.', '古老山带的一段，这条山带一直延伸到纽芬兰、格陵兰、英国和斯堪的纳维亚。'), sources: ['S23', 'S6'] },
  'belt-east-greenland': { title: bi('East Greenland mountains', '格陵兰东部山带'), summary: bi('The Caledonian mountain belt of East Greenland.', '格陵兰东部的加里东山带。'), sources: ['S23', 'S4'] },
  'belt-scottish-highlands': { title: bi('Scottish Highlands', '苏格兰高地'), summary: bi('The Caledonian mountain belt of Scotland.', '苏格兰的加里东山带。'), sources: ['S23', 'S6'] },
  'belt-scandinavian-caledonides': { title: bi('Scandinavian mountains', '斯堪的纳维亚山带'), summary: bi('The Caledonian mountain belt of Norway and Sweden.', '挪威和瑞典的加里东山带。'), sources: ['S23', 'S4'] },
  'taxon-mesosaurus': { title: bi('Mesosaurus', '中龙'), summary: bi('A freshwater reptile of the early Permian, found in southern Africa and South America.', '早二叠世的淡水爬行动物，发现于非洲南部和南美洲。'), sources: ['S6', 'S18'] },
  'taxon-glossopteris': { title: bi('Glossopteris', '舌羊齿'), summary: bi('A seed-bearing shrub or tree with tongue-shaped leaves, common through the Permian.', '一种结种子的灌木或乔木，叶子像舌头，在整个二叠纪都很常见。'), sources: ['S6', 'S18'] },
  'taxon-lystrosaurus': { title: bi('Lystrosaurus', '水龙兽'), summary: bi('A land animal of the early Triassic that probably ate plants. Records include Africa, India, Antarctica, China and Russia.', '早三叠世的陆地动物，很可能吃植物。记录包括非洲、印度、南极洲、中国和俄罗斯。'), sources: ['S6', 'S18', 'S19', 'S20'] },
  'taxon-cynognathus': { title: bi('Cynognathus', '犬颌兽'), summary: bi('An extinct mammal-like reptile from the early to middle Triassic.', '早至中三叠世已灭绝的似哺乳爬行动物。'), sources: ['S6', 'S18'] },
  'ridge-mid-atlantic': { title: bi('Mid-Atlantic Ridge', '大西洋中脊'), summary: bi('The underwater mountain range down the Atlantic. The marker sits where the age grid is youngest along 30°N.', '贯穿大西洋的海底山脉。标记放在北纬 30° 线上洋底年龄最年轻的位置。'), sources: ['S7', 'S14'] },
  'site-reykjanes': { title: bi('Reykjanes Ridge', '雷恰内斯洋脊'), summary: bi('The ridge south-west of Iceland. A survey here showed magnetic stripes parallel to the ridge and mirrored on both sides.', '冰岛西南的洋脊。这里的测量显示，磁条带与洋脊平行，并在两侧对称。'), sources: ['S8', 'S16'] },
  'gps-ntus': { title: bi('NTUS · Singapore', 'NTUS · 新加坡'), summary: bi('GPS station at Nanyang Technological University. About 2.8 cm a year, relative to a global reference frame.', '南洋理工大学的 GPS 站。相对全球参考框架，每年约 2.8 厘米。'), sources: ['S27'] },
  'gps-australia': { title: bi('ALIC · Alice Springs', 'ALIC · 艾丽斯斯普林斯'), summary: bi('A GPS station in central Australia. Australia moves about 7 cm a year towards the north-east.', '澳大利亚中部的 GPS 站。澳大利亚每年向东北移动约 7 厘米。'), sources: ['S27', 'S28'] },
  'gps-reyk': { title: bi('REYK · Reykjavík', 'REYK · 雷克雅未克'), summary: bi('A GPS station in western Iceland. It moves north and west.', '冰岛西部的 GPS 站，向北、向西移动。'), sources: ['S27'] },
  'gps-iceland-east': { title: bi('HOFN · Höfn', 'HOFN · 赫本'), summary: bi('A GPS station in south-eastern Iceland. It moves north and east.', '冰岛东南部的 GPS 站，向北、向东移动。'), sources: ['S27'] },
};
