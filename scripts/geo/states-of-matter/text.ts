/**
 * Texts for src/content/topics/states-of-matter/data/parts.json (docs/36 §3.5,
 * §3.8, §4.2): part names, the one-line summary that is also the leader label,
 * the detail (paragraphs, [S#] = data/sources.json), groups, presets, the spec
 * rows, the PLATE readings and the try-it controls and outputs. English edited
 * from the Codex fact pass; Chinese written on its own (Singapore usage,
 * docs/36 §1.6, §6.1).
 */
type T = { en: string; zh: string };
interface PartText {
  name: T;
  summary: T;
  detail: T;
}

const t = (en: string, zh: string): T => ({ en, zh });
const p = (name: T, summary: T, detail: T): PartText => ({ name, summary, detail });

export const GROUP_TEXT: Record<string, T> = {
  weighing: t('Weighing', '称质量'),
  measuring: t('Measuring volume', '量体积'),
  'air-bench': t('Air', '空气'),
  syringes: t('Squeezing', '压缩'),
  grains: t('Sand and sugar', '沙和糖'),
  'around-you': t('Around you', '身边的物质'),
  closer: t('Magnified grains', '放大的颗粒'),
  'air-flow': t('Air moving', '空气的流动'),
};

export const PRESET_TEXT: Record<string, T> = {
  'scales-view': t('Scales', '秤'),
  'cylinders-view': t('Volume', '体积'),
  'basin-view': t('Basin', '水盆'),
  'syringe-view': t('Syringes', '针筒'),
  'grains-view': t('Sand', '沙'),
  'table-view': t('Around you', '身边'),
};

export const SPEC_TEXT = [
  { key: t('Liquid', '液体'), value: t('200 ML WATER', '水 200 毫升'), tag: 'design' },
  { key: t('Syringes', '针筒'), value: t('3 × 20 ML · TIPS SEALED', '3 支 20 毫升 · 针口封住'), tag: 'design' },
  { key: t('Air', '空气'), value: t('≈ 1.2 G PER LITRE · 25 °C', '每升约 1.2 克 · 25 °C'), tag: 'typical' },
  { key: t('Ball', '篮球'), value: t('SIZE 7 · 600 G UNPUMPED', '7 号球 · 未打气 600 克'), tag: 'design' },
];

export const TELEMETRY_TEXT: Record<string, T> = {
  mass: t('Mass', '质量'),
  volume: t('Volume', '体积'),
  level: t('Water height', '液面高度'),
  syringes: t('Air · water · sand', '空气 · 水 · 沙'),
  basin: t('Basin level', '盆里水面'),
  air: t('Air pumped in', '打进的空气'),
};

export const CONTROL_TEXT = {
  'weigh-object': {
    label: t('On the balance', '秤上放的'),
    options: { stone: t('Stone', '石头'), sponge: t('Sponge', '海绵'), marble: t('Marble', '弹珠'), clay: t('Clay ball', '黏土球'), water: t('200 ml water', '200 毫升水') },
  },
  'drop-object': {
    label: t('Put into the water', '放进水里的'),
    options: { nothing: t('Nothing', '不放'), stone: t('Stone', '石头'), marble: t('Marble', '弹珠'), 'clay-ball': t('Clay ball', '黏土球'), 'clay-roll': t('Clay roll', '黏土长条') },
  },
  container: {
    label: t('Water poured into', '水倒进'),
    options: { cylinder: t('Cylinder', '量筒'), glass: t('Tall glass', '高玻璃杯'), flask: t('Conical flask', '锥形瓶'), bowl: t('Wide bowl', '宽碗') },
  },
  pumps: { label: t('Pumps of air', '打气的次数') },
  'cup-place': { label: t('Cup', '杯子'), options: { above: t('Above the water', '在水面上方'), pushed: t('Pushed down', '压进水里') } },
  'cup-hole': { label: t('Hole in the cup', '杯底开孔') },
  load: { label: t('Mass on each plunger', '每支柱塞上的砝码') },
  'water-added': { label: t('Water poured onto the sand', '倒进沙里的水') },
  beam: { label: t('Stone and sponge on the beam balance', '石头和海绵放上天平') },
  squeeze: { label: t('Squeeze the sponge', '捏海绵') },
};

export const OUTPUT_TEXT: Record<string, T> = {
  mass: t('Mass', '质量'),
  reading: t('Cylinder reading', '量筒读数'),
  'object-volume': t('Volume of the solid', '固体的体积'),
  level: t('Water height', '液面高度'),
  poured: t('Poured back', '倒回量筒'),
  'ball-mass': t('Ball on the balance', '秤上的球'),
  'air-added': t('Air pumped in', '打进的空气'),
  firmness: t('Ball', '球'),
  'basin-level': t('Basin level', '盆里水面'),
  'basin-rise': t('Basin rise', '盆里水面升高'),
  'cup-rise': t('Water inside the cup', '杯里的水高出杯口'),
  tissue: t('Tissue', '纸巾'),
  'cup-bubbles': t('Bubbles', '气泡'),
  'v-air': t('Air', '空气'),
  'v-water': t('Water', '水'),
  'v-sand': t('Sand', '沙'),
  'sand-reading': t('Cylinder reading', '量筒读数'),
  'air-gaps': t('Air left in the sand', '沙里剩下的空气'),
  'vs-sum': t('Compared with 200 ml', '和 200 毫升相比'),
  'sand-bubbles': t('Bubbles', '气泡'),
  wet: t('Wetness', '湿的程度'),
  'tissue-wet': t('Tissue wetness', '纸巾湿的程度'),
};

export const STATE_TEXT: Record<string, Record<string, T>> = {
  firmness: { flat: t('Not pumped', '未打气'), soft: t('Soft', '软'), firm: t('Firm', '鼓起来了'), 'too-hard': t('Too hard', '太硬') },
  tissue: { dry: t('Dry', '干'), wet: t('Wet', '湿') },
  'cup-bubbles': { none: t('None', '没有'), rising: t('Rising', '冒出来') },
  'vs-sum': { equal: t('Equal to the sum', '等于两者相加'), less: t('Less than the sum', '比两者相加少'), more: t('More than the sum', '比两者相加多') },
  'sand-bubbles': { none: t('None', '没有'), rising: t('Rising', '冒出来') },
};

export const PART_TEXT: Record<string, PartText> = {
  /* ------------------------------------------------------------ weighing */
  'balance-a': p(
    t('Electronic balance', '电子秤'),
    t('Measures mass, in grams.', '量质量，单位是克。'),
    t(
      'A flat body with a round pan and a display window; the reading appears in the Try it card and in the PLATE block, not on the model. Put an empty container on first and press zero (tare), and the balance then shows only what you add [S1].\n\nSchool balances that read to 0.1 g with a 2 kg capacity are made for classrooms and laboratories [S41]; this one is drawn to that example. The last digit of a display is not the same as its accuracy: a real reading can drift a little.\n\nA balance measures mass, how much matter something contains [S29]. Weight is a different quantity, the pull of gravity on that mass.',
      '扁平的机身、圆形秤盘和一块显示窗；读数出现在“试一试”卡片和 PLATE 块里，不画在模型上。先放上空容器，按“归零”，秤就只显示后来加进去的东西 [S1]。\n\n学校和实验室用的电子秤，有量程 2 千克、读到 0.1 克的型号 [S41]；这台就照这个例子画。显示屏的最后一位不等于准确度：真实的读数会有一点漂移。\n\n秤量的是质量，也就是东西里有多少物质 [S29]。重量是另一个量，是重力对这份质量的拉力。',
    ),
  ),
  'beam-balance': p(
    t('Beam balance', '天平'),
    t('Compares two masses side by side.', '并排比较两样东西的质量。'),
    t(
      'A beam rests on a pivot at the top of a column, with a pan hanging from each end and a pointer in the middle. The side with more mass goes down. You can compare two masses this way without reading any number.\n\nIn chapter 1 the big sponge goes in one pan and the small stone in the other, and the stone side goes down: a bigger thing is not always heavier. The tilt in the model is drawn at 6° to show which side is heavier; it is not a measurement [S1].',
      '横梁架在一根立柱顶上的支点上，两端各挂一只秤盘，中间一根指针。哪一边的质量大，哪一边就沉下去。这样比较两样东西的质量，不用读任何数字。\n\n第 1 章把大海绵放在一边，小石头放在另一边，石头那边沉了下去：大的东西不一定更重。模型里横梁倾斜 6°，只是为了看出哪边重，不是测量值 [S1]。',
    ),
  ),
  'object-tray': p(
    t('Tray', '托盘'),
    t('Holds the things waiting to be weighed.', '放着等着称的东西。'),
    t(
      'A shallow plastic tray beside the balance holds the stone, the sponge, the glass marble and the ball of clay. Choose one in the Try it card of chapter 1 and it moves onto the balance.',
      '电子秤旁边一只浅浅的塑料托盘，放着石头、海绵、玻璃弹珠和黏土球。在第 1 章的“试一试”卡片里选一样，它就会被放到秤上。',
    ),
  ),
  stone: p(
    t('Stone', '石头'),
    t('Small but heavy: 66.3 g for 25 cm³.', '个子小，却重：25 立方厘米有 66.3 克。'),
    t(
      'An oval pebble of 25 cm³. In this model it is granite-like rock at 2.65 g for every cubic centimetre, a value measured for granite [S15], so the balance reads 66.3 g [S1].\n\nThese are the numbers for this model stone. A stone you weigh will give its own reading: stones differ in size and in what they are made of.',
      '一块扁圆的卵石，体积 25 立方厘米。在这个模型里，它按花岗岩一类的岩石算，每立方厘米 2.65 克，这是花岗岩的一个实测值 [S15]，所以秤上读 66.3 克 [S1]。\n\n这些是这块模型石头的数。你称的石头会有自己的读数：石头大小不同，成分也不同。',
    ),
  ),
  sponge: p(
    t('Sponge', '海绵'),
    t('Big but light; its holes are full of air.', '个子大，却轻；孔里全是空气。'),
    t(
      'A block 12 × 8 × 4 cm, which is 384 cm³. Flexible foam is mostly air: most blocks are 15 to 60 kg per cubic metre [S17]. This model takes 30 kg per cubic metre, so the sponge reads 11.5 g, less than a fifth of the much smaller stone [S1].\n\nSqueeze it and it gets smaller, because the air is pushed out of its holes; the thin solid walls only fold. It floats and soaks up water, so you cannot find its volume by dropping it into a measuring cylinder.',
      '一块 12 × 8 × 4 厘米的海绵，体积 384 立方厘米。软泡沫里大部分是空气：大多数泡沫块每立方米 15 到 60 千克 [S17]。这个模型取每立方米 30 千克，所以海绵读 11.5 克，还不到那块小得多的石头的五分之一 [S1]。\n\n捏它，它会变小，那是因为孔里的空气被挤了出去；薄薄的固体孔壁只是被折弯了。它会浮在水上，还会吸水，所以不能把它丢进量筒里量体积。',
    ),
  ),
  marble: p(
    t('Glass marble', '玻璃弹珠'),
    t('A small glass ball: 5.4 g.', '一颗小玻璃球：5.4 克。'),
    t(
      'A marble 16 mm across, a common toy size [S42], has a volume of about 2.1 cm³. Soda-lime glass is about 2.5 g per cubic centimetre [S16], so in this model the marble reads 5.4 g [S1].',
      '直径 16 毫米的弹珠，是玩具弹珠常见的大小 [S42]，体积约 2.1 立方厘米。钠钙玻璃每立方厘米约 2.5 克 [S16]，所以在这个模型里弹珠读 5.4 克 [S1]。',
    ),
  ),
  'clay-ball': p(
    t('Clay ball', '黏土球'),
    t('20 cm³ of modelling clay: 32.0 g.', '20 立方厘米的模型黏土：32.0 克。'),
    t(
      'A ball of modelling clay of 20 cm³. One maker lists 1.60 g for every cubic centimetre for a soft modelling clay [S18]; other clays are lighter or heavier. At that value the ball reads 32.0 g in this model [S1].\n\nIn chapter 2 the same amount of clay is rolled into a long shape: its shape changes, its volume does not.',
      '一团 20 立方厘米的模型黏土球。有一家厂商给一种软模型黏土标的是每立方厘米 1.60 克 [S18]；别的黏土会轻一些或重一些。按这个值，在这个模型里黏土球读 32.0 克 [S1]。\n\n第 2 章把同样多的黏土搓成长条：形状变了，体积没变。',
    ),
  ),
  'water-beaker': p(
    t('Beaker of water', '一杯水'),
    t('200 ml of water has mass too: 199.4 g.', '200 毫升水也有质量：199.4 克。'),
    t(
      'A 250 ml beaker holding 200 ml of water. Put the empty beaker on the balance and zero it first; then the reading is only the water. Water at 25 °C is 0.997 g per millilitre [S7], so 200 ml reads 199.4 g in this model [S1].\n\nLiquids are matter: they have mass and take up space.',
      '一只 250 毫升的烧杯，装着 200 毫升水。先把空烧杯放上秤、归零，读数就只是水的质量。25 °C 的水每毫升 0.997 克 [S7]，所以在这个模型里 200 毫升水读 199.4 克 [S1]。\n\n液体也是物质：它有质量，也占据空间。',
    ),
  ),

  /* ---------------------------------------------------------- measuring */
  'cylinder-a': p(
    t('Measuring cylinder A', '量筒 A'),
    t('Measures the volume of a liquid, in ml.', '量液体的体积，单位是毫升。'),
    t(
      'A tall, narrow glass cylinder on a six-sided foot, with a pouring lip at the top and a scale of lines up its side. A 250 ml cylinder is commonly marked every 2 ml [S19]; the model draws a line every 10 ml, with no numbers [S1].\n\nRead it with your eye level with the water and read the bottom of the curved surface [S11]. A narrow cylinder makes a small change in volume easy to see, because the water rises a long way.',
      '一只细高的玻璃量筒，立在六角形的底座上，口上有倒水嘴，侧面一排刻度线。250 毫升的量筒常见每 2 毫升一格 [S19]；模型只画了每 10 毫升一条线，不写数字 [S1]。\n\n读数时，眼睛和水面平齐，读弯曲液面最低的地方 [S11]。量筒细，体积变一点，水面就升降一大段，所以容易看出变化。',
    ),
  ),
  'cyl-a-water': p(
    t('Water in cylinder A', '量筒 A 里的水'),
    t('The same 200 ml of water, in another shape.', '同样的 200 毫升水，换了一种形状。'),
    t(
      'In chapter 3 this water is poured from vessel to vessel. In the cylinder 200 ml stands 18.6 cm high in this model, because the inside is 1.85 cm in radius [S1]; that radius is a design choice for a 250 ml cylinder, not a value from the standard [S19].\n\nPoured back from any of the other vessels, it reads 200 ml again: a liquid keeps its volume.',
      '第 3 章把这些水在几个容器之间倒来倒去。在量筒里，200 毫升水高 18.6 厘米（在这个模型里），因为量筒内半径是 1.85 厘米 [S1]；这个半径是给 250 毫升量筒取的设计值，不是标准规定的 [S19]。\n\n不管从哪个容器倒回来，读数都还是 200 毫升：液体的体积不变。',
    ),
  ),
  'tall-glass': p(
    t('Tall glass', '高玻璃杯'),
    t('A straight-sided glass, wider than the cylinder.', '直身的玻璃杯，比量筒宽。'),
    t(
      'A drinking glass with straight sides, 3.0 cm in radius inside and 12 cm deep. In this model 200 ml of water stands 7.1 cm high in it [S1].',
      '一只直身的玻璃杯，内半径 3.0 厘米，深 12 厘米。在这个模型里，200 毫升水在杯里高 7.1 厘米 [S1]。',
    ),
  ),
  'glass-water': p(
    t('Water in the glass', '杯里的水'),
    t('Takes the shape of the glass.', '变成了杯子的形状。'),
    t(
      'The 200 ml from the cylinder, now shaped like the inside of the glass. The surface is flat and level; the glass leaves air above the water [S1].',
      '从量筒倒过来的 200 毫升水，现在是杯子里面的形状。水面平平的；水上面的杯子里是空气 [S1]。',
    ),
  ),
  flask: p(
    t('Conical flask', '锥形瓶'),
    t('Wide at the bottom, narrow at the neck.', '底宽、颈细的玻璃瓶。'),
    t(
      'A 250 ml conical flask: a flat bottom, sloping sides, a narrow neck and a rolled rim [S20]. The model draws its inside 4.2 cm in radius at the bottom, narrowing to 1.6 cm at 10 cm up, then a 4 cm neck; this outline is a design choice, not the standard\'s dimensions [S1].\n\nWater spreads over the wide bottom, so 200 ml stands only 5.0 cm high in this model.',
      '一只 250 毫升的锥形瓶：平底、斜壁、细颈，口上有一圈翻边 [S20]。模型把它的内部画成底部半径 4.2 厘米，往上 10 厘米收到 1.6 厘米，再接 4 厘米的瓶颈；这是设计取的形状，不是标准里的尺寸 [S1]。\n\n水铺满宽宽的瓶底，所以在这个模型里 200 毫升水只有 5.0 厘米高。',
    ),
  ),
  'flask-water': p(
    t('Water in the flask', '瓶里的水'),
    t('Spreads over the wide bottom of the flask.', '铺满宽宽的瓶底。'),
    t(
      'The same 200 ml, now shaped like the bottom of the flask, 5.0 cm deep in this model [S1].',
      '还是那 200 毫升水，现在是瓶底的形状，在这个模型里深 5.0 厘米 [S1]。',
    ),
  ),
  bowl: p(
    t('Wide bowl', '宽碗'),
    t('A round bowl: the water spreads out wide.', '一只圆碗：水摊得很开。'),
    t(
      'A china bowl shaped like half a ball, 8 cm in radius inside. Near the bottom it is narrow; higher up it widens fast [S1].',
      '一只半球形的瓷碗，内半径 8 厘米。碗底窄，往上很快就变宽 [S1]。',
    ),
  ),
  'bowl-water': p(
    t('Water in the bowl', '碗里的水'),
    t('Only about 3 cm deep, but still 200 ml.', '只有约 3 厘米深，但还是 200 毫升。'),
    t(
      'The same 200 ml spread across the bowl. In this model it is 3.0 cm deep at the middle [S1]. It looks like less water, but poured back into the cylinder it reads 200 ml.',
      '同样的 200 毫升水摊在碗里，在这个模型里中间深 3.0 厘米 [S1]。看起来少了，倒回量筒还是 200 毫升。',
    ),
  ),
  'cylinder-b': p(
    t('Measuring cylinder B', '量筒 B'),
    t('Starts with 100 ml of water for the solids.', '先装 100 毫升水，用来量固体。'),
    t(
      'The same kind of cylinder as A, filled to 100 ml. Lower a solid in until it is completely under the water and read the cylinder again. The rise, in millilitres, is the solid\'s volume in cubic centimetres, because 1 ml is the same as 1 cm³ [S11].\n\nThe solid must not float, dissolve, soak up water or trap bubbles [S11].',
      '和量筒 A 一样的量筒，装到 100 毫升。把固体放进去，让它整个没入水中，再读一次。水面升高了多少毫升，固体的体积就是多少立方厘米，因为 1 毫升和 1 立方厘米一样大 [S11]。\n\n这个固体不能浮、不能溶、不能吸水，也不能带着气泡 [S11]。',
    ),
  ),
  'cyl-b-water': p(
    t('Water in cylinder B', '量筒 B 里的水'),
    t('Rises when a solid takes up space in it.', '固体占据了空间，水面就升高。'),
    t(
      'The water level shows the water plus whatever is under it. In this model the stone raises it from 100 ml to 125 ml, the marble to 102 ml, and the clay ball or the clay roll to 120 ml [S1].',
      '水面读的是水加上没在水里的东西。在这个模型里，石头让它从 100 毫升升到 125 毫升，弹珠升到 102 毫升，黏土球或黏土长条都升到 120 毫升 [S1]。',
    ),
  ),
  'drop-stone': p(
    t('Stone for the cylinder', '放进量筒的石头'),
    t('Takes up space, so the water rises.', '它占据了空间，所以水面升高。'),
    t(
      'A second pebble of the same 25 cm³, long enough to stand upright in the cylinder. It raises the water from 100 ml to 125 ml in this model, so its volume is 125 − 100 = 25 cm³ [S1, S11].',
      '另一块同样 25 立方厘米的卵石，长长的，能竖着放进量筒。在这个模型里，它让水面从 100 毫升升到 125 毫升，所以它的体积是 125 − 100 = 25 立方厘米 [S1, S11]。',
    ),
  ),
  'drop-marble': p(
    t('Marble for the cylinder', '放进量筒的弹珠'),
    t('A small rise: about 2 ml.', '水面只升一点：约 2 毫升。'),
    t(
      'A 16 mm marble of about 2.1 cm³ [S42]. In this model the reading goes from 100 ml to about 102 ml [S1]. A rise this small is hard to read on a real cylinder marked every 2 ml.',
      '一颗直径 16 毫米、约 2.1 立方厘米的弹珠 [S42]。在这个模型里，读数从 100 毫升升到约 102 毫升 [S1]。在每 2 毫升一格的真实量筒上，这么小的升高很难读准。',
    ),
  ),
  'drop-clay-ball': p(
    t('Clay ball for the cylinder', '放进量筒的黏土球'),
    t('Same clay, two shapes, same volume.', '同一团黏土，两种形状，体积一样。'),
    t(
      'A ball of 20 cm³ of modelling clay. It raises the water to 120 ml in this model [S1].',
      '一团 20 立方厘米的黏土球。在这个模型里，它让水面升到 120 毫升 [S1]。',
    ),
  ),
  'drop-clay-roll': p(
    t('Clay roll', '黏土长条'),
    t('Rolled long, but the same 20 cm³.', '搓长了，还是 20 立方厘米。'),
    t(
      'The same 20 cm³ of clay rolled into a long shape, 1.6 cm thick and about 10.5 cm long with its rounded ends [S1]. It raises the water to 120 ml, the same as the ball: changing the shape of a solid does not change its volume.',
      '同样 20 立方厘米的黏土搓成长条，粗 1.6 厘米，连圆头约长 10.5 厘米 [S1]。它让水面升到 120 毫升，和黏土球一样：改变固体的形状，不会改变它的体积。',
    ),
  ),

  /* ------------------------------------------------------------- air */
  basin: p(
    t('Glass basin', '玻璃水盆'),
    t('Holds the water for the upside-down cup.', '装着水，给倒扣的杯子用。'),
    t(
      'A round glass basin 12 cm in radius inside, filled 14.0 cm deep: about 6.3 litres of water [S1]. Its level shows when something under the water takes up space.',
      '一只圆形玻璃水盆，内半径 12 厘米，水深 14.0 厘米，约 6.3 升水 [S1]。水里有东西占据了空间，盆里的水面就会显示出来。',
    ),
  ),
  'basin-water': p(
    t('Water in the basin', '盆里的水'),
    t('14.0 cm deep before the cup goes in.', '杯子放进去之前深 14.0 厘米。'),
    t(
      'The basin\'s water while the cup is held above it. Its surface is flat and level [S1].',
      '杯子还在上方时盆里的水。水面平平的 [S1]。',
    ),
  ),
  'basin-water-cup': p(
    t('Water round the cup', '杯子周围的水'),
    t('Rises when the cup and its air go under.', '杯子和里面的空气没入水中，水面升高。'),
    t(
      'With the cup pushed down and its air trapped, the water outside rises from 14.0 cm to 14.9 cm in this model, about 9 mm. With a hole in the cup the air escapes, water fills the cup and the level falls back to 14.1 cm, only 1.3 mm above the start: that is the space the glass itself takes up [S1].',
      '杯子压下去、空气关在里面时，在这个模型里外面的水面从 14.0 厘米升到 14.9 厘米，约升高 9 毫米。杯底开孔以后，空气跑掉，水灌满杯子，水面落回 14.1 厘米，只比原来高 1.3 毫米：那是玻璃杯本身占据的空间 [S1]。',
    ),
  ),
  cup: p(
    t('Upside-down cup', '倒扣的杯子'),
    t('Upside down, it traps air under the water.', '倒扣着，把空气关在水下。'),
    t(
      'A straight glass 3.5 cm in radius and 9 cm deep inside, turned upside down with a dry tissue pushed into its bottom. Pushed straight down, its air cannot get out, so the air stops the cup filling [S31].\n\nThe water pushes the trapped air into a slightly smaller space, so in this model water rises only about 1 mm above the rim inside the cup [S1]. Tilt the cup, or make a hole in it, and the air bubbles out and water comes in [S31].',
      '一只直身玻璃杯，内半径 3.5 厘米、深 9 厘米，杯底塞一团干纸巾，倒扣过来。把它竖直压下去，里面的空气出不去，空气挡住了水，杯子灌不满 [S31]。\n\n水把关在里面的空气压紧了一点，所以在这个模型里，杯里的水只比杯口高约 1 毫米 [S1]。把杯子倾斜，或者在杯底开个孔，空气就冒着泡出去，水跟着进来 [S31]。',
    ),
  ),
  'cup-hole-mark': p(
    t('Hole in the cup', '杯底的孔'),
    t('Lets the trapped air escape.', '让关在里面的空气跑出去。'),
    t(
      'A small hole in the base of the upturned cup, switched on in chapter 4. The model uses a hole instead of tilting the cup, so that the cup stays upright [S1].',
      '倒扣杯子底上的一个小孔，第 4 章打开它。模型用开孔代替倾斜杯子，这样杯子可以一直竖直 [S1]。',
    ),
  ),
  'trapped-air': p(
    t('Trapped air', '关住的空气'),
    t('Takes up the space inside the cup.', '占据了杯子里面的空间。'),
    t(
      'The air shut in the cup when it is pushed under water. It cannot get out, so the water cannot get in: in this model the air is squashed only from 346.4 ml to 342.5 ml and the water inside reaches 1.0 mm above the rim [S1, S5]. Air is invisible; the model draws it as a pale pocket so that you can see where it is.',
      '杯子压进水里时关在里面的空气。它出不去，水就进不来：在这个模型里，空气只从 346.4 毫升被压到 342.5 毫升，杯里的水只比杯口高 1.0 毫米 [S1, S5]。空气看不见；模型把它画成一团浅色，让你看得出它在哪里。',
    ),
  ),
  'cup-water': p(
    t('Water inside the cup', '杯里的水'),
    t('Barely enters while the air is trapped.', '空气关在里面时，水几乎进不去。'),
    t(
      'While the air is trapped, the water inside reaches only about 1 mm above the rim in this model. With the hole open, the cup fills with about 346 ml of water [S1].',
      '空气关在里面时，在这个模型里杯里的水只比杯口高约 1 毫米。开了孔，杯里灌进约 346 毫升水 [S1]。',
    ),
  ),
  tissue: p(
    t('Tissue', '纸巾'),
    t('Stays dry while air fills the cup.', '杯里有空气，它就不湿。'),
    t(
      'A crumpled dry tissue pushed into the bottom of the cup. While the cup holds its air, the tissue stays dry. When the air escapes and water fills the cup, it gets wet and turns darker [S31].',
      '一团揉皱的干纸巾，塞在杯底。杯里有空气，纸巾就是干的。空气跑掉、水灌满杯子，纸巾就湿了，颜色变深 [S31]。',
    ),
  ),
  'balance-b': p(
    t('Electronic balance B', '电子秤 B'),
    t('Weighs the basketball as air goes in.', '打气时称篮球。'),
    t(
      'A second balance like the first, with a ring on its pan so the ball cannot roll [S41]. It is set to read the ball and the air already inside it: 600.0 g before pumping, in this model [S1].',
      '和第一台一样的电子秤，秤盘上放一个圈，球不会滚走 [S41]。在这个模型里，它读的是球加上球里原有的空气：打气前 600.0 克 [S1]。',
    ),
  ),
  basketball: p(
    t('Basketball', '篮球'),
    t('Pumping in air makes it heavier.', '打进空气，它就变重。'),
    t(
      'A size 7 ball, 75 cm round. FIBA lists 750 to 770 mm round and 580 to 620 g for a size 7 ball [S38]. This model ball reads 600.0 g before pumping, with about 7 litres of space inside [S1].\n\nEach pump pushes in 0.2 litres of room air, which is 0.236 g at 1.18 g per litre [S6]. After 20 pumps the balance reads 604.7 g in this model: the extra 4.7 g is the air pumped in. The ball keeps its outside size, so the air around it pushes up on it just as before and the extra reading is the air alone [S1].\n\nThe NBA rule asks for 7.5 to 8.5 pounds pressure in a game ball [S10]. Do not pump a ball harder than its maker says.',
      '一只 7 号球，周长 75 厘米。国际篮联（FIBA）规定 7 号球周长 750 到 770 毫米、质量 580 到 620 克 [S38]。这只模型球打气前读 600.0 克，里面约有 7 升空间 [S1]。\n\n每打一下，压进 0.2 升室内空气，按每升 1.18 克算是 0.236 克 [S6]。在这个模型里，打 20 下以后秤读 604.7 克：多出来的 4.7 克就是打进去的空气。球的外面大小不变，周围空气托它的力和原来一样，所以多出来的读数只是空气 [S1]。\n\nNBA 的规则要求比赛用球的气压在 7.5 到 8.5 磅之间 [S10]。打气不要超过球上标的气压。',
    ),
  ),
  'ball-pump': p(
    t('Ball pump', '打气筒'),
    t('Pushes room air into the ball.', '把室内的空气压进球里。'),
    t(
      'A hand pump with a hose and a needle that fits the ball\'s valve. In this model each full stroke pushes in 0.2 litres of room air, with no leaks [S1]. Real pumps differ: one floor pump is sold as moving 318 cc a stroke [S43].',
      '一只手动打气筒，软管末端的气针插进球的气门。在这个模型里，每次推到底压进 0.2 升室内空气，不漏气 [S1]。真实的打气筒各不相同：有一款落地打气筒标的是每下 318 毫升 [S43]。',
    ),
  ),
  'balloon-pump': p(
    t('Balloon pump', '气球打气筒'),
    t('Blows air into the balloons.', '把空气打进气球。'),
    t(
      'A small pump for balloons. Using a pump instead of your breath keeps the moisture from your lungs out of the balloon [S30].',
      '一只小小的气球打气筒。用打气筒而不用嘴吹，可以不把肺里的水汽带进气球 [S30]。',
    ),
  ),
  'balloon-round': p(
    t('Round balloon', '圆气球'),
    t('Air pumped in takes a round shape.', '打进去的空气是圆的。'),
    t(
      'A red balloon on the pump. The air inside spreads out to fill it, so the air takes the round shape of the balloon [S1].',
      '套在打气筒上的红气球。里面的空气散开，充满整只气球，所以空气是气球的圆形 [S1]。',
    ),
  ),
  'balloon-long': p(
    t('Long balloon', '长气球'),
    t('The same air takes a long shape here.', '在这里，空气就是长条形。'),
    t(
      'A blue balloon that blows up long and thin. Air has no shape of its own: in this balloon it takes a long shape [S1].',
      '一只吹起来细长的蓝气球。空气没有自己的形状：在这只气球里，它就是长条形 [S1]。',
    ),
  ),

  /* ---------------------------------------------------------- syringes */
  'syringe-rack': p(
    t('Syringe press', '压针筒架'),
    t('Holds three sealed syringes upright.', '把三支封口的针筒竖直夹住。'),
    t(
      'A base plate, two posts and a clamp bar hold three syringes tip down, side by side, so that the same masses can be put on each plunger at the same time [S1]. In a classroom, pressing gently by hand does the same job; masses make the readings easy to compare [S32].',
      '一块底板、两根立柱和一根夹杆，把三支针筒并排竖直夹住，针口朝下，这样每支柱塞上可以同时放同样的砝码 [S1]。课堂上用手轻轻压也行；用砝码是为了读数好比较 [S32]。',
    ),
  ),
  'syringe-air': p(
    t('Air syringe', '装空气的针筒'),
    t('The air inside can be squashed smaller.', '里面的空气能被压小。'),
    t(
      'A 20 ml syringe 2.0 cm across inside, with 1 ml marks; its tip is sealed with a cap [S21]. It holds 20 ml of air.\n\nWith 2 kg on the plunger, the air is squashed to 12.4 ml in this model, and with 4 kg to 9.0 ml. Take the masses off and the plunger springs back to 20 ml [S1, S5]. The readings show 0.1 ml; a real syringe can only be read to about half a mark.',
      '一支 20 毫升的针筒，内径 2.0 厘米，每 1 毫升一格，针口用帽封住 [S21]。里面装 20 毫升空气。\n\n在这个模型里，柱塞上放 2 千克，空气被压到 12.4 毫升；放 4 千克，压到 9.0 毫升。拿走砝码，柱塞弹回 20 毫升 [S1, S5]。读数写到 0.1 毫升；真实的针筒只能估到半格左右。',
    ),
  ),
  'syringe-water': p(
    t('Water syringe', '装水的针筒'),
    t('The water inside is much harder to squash.', '里面的水难压得多。'),
    t(
      'The same kind of syringe holding 20 ml of water, with the air bubbles pushed out first [S32]. Water can be squashed, but only very slightly: with 4 kg on the plunger it loses about 0.001 ml in this model, far too little to see, so it still reads 20.0 ml [S1, S7].',
      '同样的针筒，装 20 毫升水，先把气泡排掉 [S32]。水也能被压缩，但只能压小一点点：在这个模型里柱塞上放 4 千克，水只少了约 0.001 毫升，小得根本看不出，所以读数还是 20.0 毫升 [S1, S7]。',
    ),
  ),
  'syringe-sand': p(
    t('Sand syringe', '装沙的针筒'),
    t('Sand grains push back; it stays put.', '沙粒互相顶住，柱塞不动。'),
    t(
      'The same kind of syringe holding 20 ml of dry sand. There is air between the grains, but the grains touch each other and hold up the plunger. In this model the sand stays at 20.0 ml [S1].\n\nReal loose sand can settle a little as its grains move closer together; the model keeps the grains where they are.',
      '同样的针筒，装 20 毫升干沙。沙粒之间有空气，但沙粒互相挨着，顶住了柱塞。在这个模型里，沙一直是 20.0 毫升 [S1]。\n\n真实的松沙，沙粒挤近一些时会稍微沉下去一点；模型让沙粒保持原位。',
    ),
  ),
  'plunger-air': p(
    t('Plunger (air)', '柱塞（空气）'),
    t('Moves down as the air is squashed.', '空气被压小，柱塞就往下走。'),
    t(
      'A plastic rod with a rubber seal and a small platform on top for the masses. Its seal moves 0.32 cm for every millilitre, so from 20 ml to 9 ml it moves down about 3.5 cm [S1].',
      '一根塑料杆，下端是橡胶塞，顶上一个小平台放砝码。橡胶塞每走 0.32 厘米是 1 毫升，所以从 20 毫升到 9 毫升，它往下走了约 3.5 厘米 [S1]。',
    ),
  ),
  'plunger-water': p(
    t('Plunger (water)', '柱塞（水）'),
    t('Stays where it is.', '停在原处不动。'),
    t(
      'The same plunger on the water syringe. The water hardly squashes, so the plunger does not move that you can see [S1].',
      '装水针筒上同样的柱塞。水几乎压不小，所以看不出柱塞在动 [S1]。',
    ),
  ),
  'plunger-sand': p(
    t('Plunger (sand)', '柱塞（沙）'),
    t('Held up by the sand grains.', '被沙粒顶住。'),
    t(
      'The same plunger on the sand syringe, held up by the grains underneath [S1].',
      '装沙针筒上同样的柱塞，被下面的沙粒顶住 [S1]。',
    ),
  ),
  'water-column': p(
    t('Water in the syringe', '针筒里的水'),
    t('20 ml of water, sealed in.', '封在里面的 20 毫升水。'),
    t('20 ml of water between the sealed tip and the plunger [S1].', '针口和柱塞之间的 20 毫升水 [S1]。'),
  ),
  'sand-column': p(
    t('Sand in the syringe', '针筒里的沙'),
    t('20 ml of dry sand: grains and air.', '20 毫升干沙：沙粒加空气。'),
    t('20 ml of dry sand. About a third of that space is air between the grains [S1, S12].', '20 毫升干沙。其中约三分之一的空间是沙粒之间的空气 [S1, S12]。'),
  ),
  'masses-air': p(
    t('Masses (air)', '砝码（空气）'),
    t('1 kg each, added one at a time.', '每块 1 千克，一块一块加。'),
    t(
      'Slotted masses of 1 kg each, stacked on the plunger platform; the Try it card adds 0 to 4. The same number goes on all three syringes at once, so the load is the same [S1]. Stack masses carefully, with an adult present.',
      '每块 1 千克的槽码，叠在柱塞顶的平台上；“试一试”卡片可以加 0 到 4 块。三支针筒同时放同样多，所以压的力一样 [S1]。砝码要放稳，要有大人在场。',
    ),
  ),
  'masses-water': p(
    t('Masses (water)', '砝码（水）'),
    t('The same load on the water.', '压在水上的同样的砝码。'),
    t('The same 1 kg masses, the same number as on the air syringe [S1].', '同样的 1 千克砝码，块数和空气那支一样 [S1]。'),
  ),
  'masses-sand': p(
    t('Masses (sand)', '砝码（沙）'),
    t('The same load on the sand.', '压在沙上的同样的砝码。'),
    t('The same 1 kg masses, the same number as on the air syringe [S1].', '同样的 1 千克砝码，块数和空气那支一样 [S1]。'),
  ),

  /* ------------------------------------------------------------ grains */
  'sand-heap': p(
    t('Heap of sand', '一堆沙'),
    t('Pours, but each grain is a solid.', '会倒，但每一粒都是固体。'),
    t(
      'Dry sand poured onto a dish piles into a cone. Its sides slope at about 33° in this model; one measured dry quartz sand settled at about 32.5° [S14]. Water poured onto a dish spreads out flat instead.\n\nSand pours because its grains can roll past each other. Each grain keeps its own shape and volume, so each grain is a solid [S28].',
      '干沙倒在碟子上，堆成一个圆锥。在这个模型里，沙堆的坡约 33°；有一种实测的干石英沙，坡约 32.5° [S14]。水倒在碟子上，却会摊平。\n\n沙会倒，是因为沙粒能互相滚过去。每一粒都保持自己的形状和体积，所以每一粒都是固体 [S28]。',
    ),
  ),
  'sugar-heap': p(
    t('Heap of sugar', '一堆糖'),
    t('Small crystals that pour like sand.', '一粒粒小晶体，像沙一样会倒。'),
    t(
      'Granulated sugar is made of small crystals; ordinary grades have grains about 0.4 to 1 mm across on average [S40]. It pours and piles up like sand, and each crystal is a solid.',
      '砂糖是一粒粒小晶体；普通规格的糖粒，平均大小约 0.4 到 1 毫米 [S40]。它会像沙一样倒出来、堆起来，每一粒晶体都是固体。',
    ),
  ),
  'water-dish': p(
    t('Dish of water', '一碟水'),
    t('Water spreads out with a flat surface.', '水摊开，表面是平的。'),
    t(
      'A dish of water beside the heaps. A liquid does not pile up: its surface settles flat and level [S1].',
      '沙堆旁边的一碟水。液体不会堆起来：它的表面是平平的 [S1]。',
    ),
  ),
  'cylinder-c': p(
    t('Measuring cylinder C', '量筒 C'),
    t('Holds 100 ml of dry sand.', '装着 100 毫升干沙。'),
    t(
      'The same kind of cylinder as A, filled with dry sand to the 100 ml line. The reading includes the grains and the air between them [S1].',
      '和量筒 A 一样的量筒，干沙装到 100 毫升的线。读数里既有沙粒，也有沙粒之间的空气 [S1]。',
    ),
  ),
  'sand-in-cylinder': p(
    t('Dry sand', '量筒里的干沙'),
    t('100 ml of sand: grains and air.', '100 毫升的沙：沙粒加空气。'),
    t(
      'Sand is grains of rock from 0.0625 to 2 mm across [S13]. Between the grains is air: in sand, 25 to 50 % of the space [S12]. This model takes 35 %, so 100 ml of dry sand holds 35 ml of air [S1].\n\nAs water soaks in, the air bubbles out and the sand turns darker. In this model the reading stays at 100 ml until 35 ml of water has filled the gaps [S1]. Real sand can also settle a little or keep a few bubbles.',
      '沙是 0.0625 到 2 毫米大小的岩石颗粒 [S13]。沙粒之间是空气：沙里有 25 % 到 50 % 的空间是空的 [S12]。这个模型取 35 %，所以 100 毫升干沙里有 35 毫升空气 [S1]。\n\n水渗进去，空气冒着泡出来，沙的颜色变深。在这个模型里，水填满 35 毫升的空隙之前，读数一直是 100 毫升 [S1]。真实的沙还可能沉下去一点，或者留住几个气泡。',
    ),
  ),
  'water-over-sand': p(
    t('Water above the sand', '沙上的水'),
    t('Rises above the sand once the gaps are full.', '空隙填满以后，水面才在沙上升起来。'),
    t(
      'Once the gaps are full, more water stands above the sand. With all 100 ml poured in, the cylinder reads 165 ml in this model, not 200 ml: 35 ml of the sand was air [S1].',
      '空隙填满以后，再倒的水就留在沙面上。100 毫升水全倒进去，在这个模型里量筒读 165 毫升，不是 200 毫升：沙里有 35 毫升原来是空气 [S1]。',
    ),
  ),
  'pour-cup': p(
    t('Beaker to pour from', '倒水用的烧杯'),
    t('Holds the 100 ml of water for the sand.', '装着要倒进沙里的 100 毫升水。'),
    t('A 250 ml beaker with a pouring lip [S1].', '一只带嘴的 250 毫升烧杯 [S1]。'),
  ),
  'jug-water': p(
    t('Water to pour', '准备倒的水'),
    t('Goes down as water is poured onto the sand.', '往沙里倒水，它就变少。'),
    t('100 ml of water at the start. Whatever is poured onto the sand leaves the beaker [S1].', '开始时是 100 毫升水。倒进沙里多少，烧杯里就少多少 [S1]。'),
  ),
  magnifier: p(
    t('Magnifying glass', '放大镜'),
    t('Shows each grain\'s own shape.', '看清每一粒自己的形状。'),
    t(
      'A hand lens for looking at single grains. Chapter 2 shows sand and sugar grains magnified 40 times, drawn separately from the bench [S1].',
      '一只放大镜，用来看单独的颗粒。第 2 章把沙粒和糖粒放大 40 倍，和实验台分开画 [S1]。',
    ),
  ),

  /* -------------------------------------------------------- around you */
  'bicycle-wheel': p(
    t('Bicycle wheel', '脚车轮'),
    t('More air is squeezed into the same tyre.', '同一条轮胎里压进更多空气。'),
    t(
      'A bicycle wheel in a low stand, with its tyre connected to a floor pump. Each stroke squeezes more air into the same tyre. The tyre hardly gets bigger, so the air inside is squashed closer together and the tyre feels harder [S5].\n\nPump a tyre only to the pressure marked on its side.',
      '一只装在矮架上的脚车轮，轮胎的气门接着落地打气筒。每打一下，就把更多空气压进同一条轮胎。轮胎几乎没有变大，所以里面的空气被压得更紧，轮胎摸起来更硬 [S5]。\n\n给轮胎打气，不要超过轮胎侧面标的气压。',
    ),
  ),
  'floor-pump': p(
    t('Floor pump', '落地打气筒'),
    t('Pushes air into the tyre, stroke by stroke.', '一下一下把空气压进轮胎。'),
    t(
      'A standing pump with a T-shaped handle and a hose to the tyre valve. Pumps differ in how much air one stroke moves; one is sold as 318 cc a stroke [S43].',
      '一只立式打气筒，T 形把手，软管接到轮胎气门。打气筒每下能压进多少空气各不相同；有一款标的是每下 318 毫升 [S43]。',
    ),
  ),
  'drink-can': p(
    t('Can of drink', '汽水罐'),
    t('Solid can, liquid drink, gas at the top.', '固体的罐、液体的汽水、顶上的气体。'),
    t(
      'An unopened can. The metal can is a solid, the drink is a liquid, and the small space above the drink holds gas. X-RAY shows inside [S1].\n\nA fizzy drink has carbon dioxide dissolved in it under pressure. Before the can is opened you do not see bubbles in the drink; open it and the gas comes out as bubbles [S35].',
      '一罐没开的汽水。金属罐是固体，汽水是液体，汽水上面的一小段空间里是气体。用 X-RAY 看得见里面 [S1]。\n\n汽水里在高压下溶进了二氧化碳。罐没打开时，汽水里看不到气泡；一打开，气体就变成气泡冒出来 [S35]。',
    ),
  ),
  'can-drink': p(
    t('Drink inside', '罐里的汽水'),
    t('A liquid: it takes the shape of the can.', '液体：它是罐子的形状。'),
    t(
      'The drink fills the can to just below the top. Above it is a small space of gas [S1]. The carbon dioxide dissolved in the drink comes out as bubbles when the can is opened [S35].',
      '汽水装到快到罐顶的地方，上面是一小段气体 [S1]。溶在汽水里的二氧化碳，要等罐子打开才变成气泡冒出来 [S35]。',
    ),
  ),
  'kaya-jar': p(
    t('Jar of kaya', '一瓶咖椰'),
    t('A thick spread that is hard to sort.', '一种不好分类的稠抹酱。'),
    t(
      'Kaya is a sweet, creamy spread made with coconut milk or cream, eggs and sugar [S36]. It is thick: it spreads and flows slowly, and a scoop can keep its shape for a while. Simple examples of solids and liquids do not describe it well, and scientists use more words for such materials [S36].',
      '咖椰是用椰浆、鸡蛋和糖做的甜抹酱 [S36]。它很稠：能抹开，也会慢慢流动，挖出来的一勺又能保持形状一阵子。固体、液体的简单例子描述不好它，科学家用更多的词来描述这类东西 [S36]。',
    ),
  ),
  'ice-cube': p(
    t('Ice cubes', '冰块'),
    t('Water as a solid.', '固体的水。'),
    t(
      'Two ice cubes on a dish. Ice is water as a solid: it keeps its own shape until it melts [S2]. How ice melts is in the topic on water.',
      '碟子里的两块冰。冰是固体的水：它在融化之前保持自己的形状 [S2]。冰怎样融化，在讲水的主题里。',
    ),
  ),
  'juice-glass': p(
    t('Glass of juice', '一杯果汁'),
    t('A liquid: shaped by the glass.', '液体：是杯子的形状。'),
    t('Juice is mostly water, a liquid. It takes the shape of the glass and keeps its volume [S1].', '果汁大部分是水，是液体。它是杯子的形状，体积不变 [S1]。'),
  ),
  torch: p(
    t('Torch', '手电筒'),
    t('Its light is not matter.', '它发出的光不是物质。'),
    t(
      'The torch is matter: it has mass and takes up space. The light it gives out is not: light has no mass and takes up no space. Light and heat are forms of energy [S2].',
      '手电筒是物质：它有质量，也占据空间。它发出的光不是物质：光没有质量，也不占据空间。光和热是能量的形式 [S2]。',
    ),
  ),
  'torch-beam': p(
    t('Light from the torch', '手电筒的光'),
    t('Energy, not matter.', '是能量，不是物质。'),
    t(
      'Drawn only to show where the light goes. Light carries energy; it is not matter [S2].',
      '画出来只是为了指出光走到哪里。光带着能量；它不是物质 [S2]。',
    ),
  ),

  /* ------------------------------------------------------------ closer */
  'sand-grains': p(
    t('Sand grains ×40', '放大的沙粒 ×40'),
    t('Each grain has its own shape.', '每一粒都有自己的形状。'),
    t(
      'Grains of sand drawn 40 times life size: real grains here are about 0.2 to 1 mm across, inside the sand range of 0.0625 to 2 mm [S13]. They differ in size and colour, their corners are worn round, and there are gaps of air between them [S1].',
      '放大 40 倍画的沙粒：这些沙粒实际约 0.2 到 1 毫米，在沙的大小范围 0.0625 到 2 毫米之内 [S13]。它们大小、颜色各不相同，棱角被磨圆了，彼此之间有空气的空隙 [S1]。',
    ),
  ),
  'sugar-crystals': p(
    t('Sugar crystals ×40', '放大的糖粒 ×40'),
    t('Small crystals with flat faces.', '有平面的小晶体。'),
    t(
      'Sugar grains drawn 40 times life size, about 0.5 mm across in real life [S40]. Each is a small crystal with flat faces and edges. Real sugar crystals vary in shape, and some stick together; these shapes are drawn to show the idea [S1].',
      '放大 40 倍画的糖粒，实际约 0.5 毫米 [S40]。每一粒是一颗有平面和棱的小晶体。真实的糖晶体形状各不一样，有的粘在一起；这里的形状是示意 [S1]。',
    ),
  ),

  /* ----------------------------------------------------------- context */
  bench: p(
    t('Science bench', '实验台'),
    t('A school science bench, drawn life size.', '按实物大小画的学校实验台。'),
    t('A wooden bench 1.8 m long. The layout of the five stations is a design for this topic [S1].', '一张 1.8 米长的木实验台。五个工位的摆放是本主题的设计 [S1]。'),
  ),
  'side-table': p(
    t('Side table', '小桌'),
    t('Holds things from home.', '放着家里常见的东西。'),
    t('A small table beside the bench, at the same height, for the things in chapter 6 [S1].', '实验台旁边一张一样高的小桌，放第 6 章的东西 [S1]。'),
  ),
  'balance-stand': p(
    t('Balance stand', '天平座'),
    t('Holds the beam balance\'s pivot.', '撑住天平的支点。'),
    t('The base and column of the beam balance; the beam rocks on the top of the column [S1].', '天平的底座和立柱；横梁在立柱顶上摆动 [S1]。'),
  ),
  'closer-plinth': p(
    t('Plinth for the grains', '颗粒台座'),
    t('Holds the magnified grains.', '放着放大的颗粒。'),
    t('A small plinth for the grains drawn 40 times life size; it is not on the bench [S1].', '放大 40 倍的颗粒所在的小台座；它不在实验台上 [S1]。'),
  ),
};
