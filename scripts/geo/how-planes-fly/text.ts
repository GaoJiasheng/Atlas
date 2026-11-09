/**
 * Names, leader lines (summary) and details of every part of how-planes-fly
 * (docs/45 §3.2). build-parts.ts reads this file. Details cite
 * data/sources.json with [S#]; design values cite the design study [S58].
 */
export type T = { en: string; zh: string };
export interface PartText {
  name: T;
  /** Card and leader name when `name` is long. */
  short?: T;
  summary: T;
  detail: T;
}
const t = (en: string, zh: string): T => ({ en, zh });
/** Paragraphs joined with blank lines. */
const p = (en: string[], zh: string[]): T => ({ en: en.join('\n\n'), zh: zh.join('\n\n') });

export const PART_TEXT: Record<string, PartText> = {
  'fuselage-shell': {
    name: t('Fuselage', '机身'),
    summary: t('Joins the wings, tail and cabin into one body.', '把机翼、尾翼和客舱连成一体。'),
    detail: {
      "en": "The fuselage joins the wings, tail and cockpit. Passengers and cargo travel inside. The four-force arrows start around this long body.\n\nThis model represents an airliner about 40 m long, with a 36 m wingspan and a height of 12 m. It is drawn ten times smaller [S58]. The aircraft, fuel and everything it carries contribute to its weight. Lift balances that weight in level flight [S1].\n\nThe simple outline and windows represent a general airliner, without a particular maker, model or airline [S58].",
      "zh": "机身连接机翼、尾翼和驾驶舱，里面载着乘客和货物。四力箭头从这段长条形机体周围画出。\n\n模型代表一架约长 40 米、翼展 36 米、高 12 米的客机，画面缩小十倍 [S58]。飞机、燃油和所载的一切都计入重量。水平飞行时，升力与重力平衡 [S1]。\n\n简化的外形和窗户代表一般客机，没有指定厂家、型号或航空公司 [S58]。"
    },
  },
  'cockpit-glazing': {
    name: t('Cockpit', '驾驶舱'),
    summary: t('Marks the nose, where the crew sit.', '标出机头，机组坐在这里。'),
    detail: p(
      [
        'The flight crew sit behind these windows at the front of the fuselage. They mark the nose, which faces into the incoming air.',
        'Six windscreen panes sit in frames set into the curved nose. The shape is generic, not one particular aircraft type [S58].',
      ],
      [
        '机组坐在机身前端的窗户后面。窗户标出机头的位置，机头朝向迎面而来的空气。',
        '六块风挡玻璃装在窗框里，嵌进弯曲的机头。外形是通用设计，不是某一种机型 [S58]。',
      ],
    ),
  },
  'wing-left': {
    name: t('Left wing', '左翼'),
    summary: t('Gives most of the lift on the left side.', '在左侧提供大部分升力。'),
    detail: {
      "en": "This is the left wing from the pilot’s viewpoint. An airliner’s wings provide most of its lift, while the engines provide thrust [S1]. The left aileron, flap, slat and spoiler sit on this wing, with an engine below.\n\nThe wing’s cross-sectional shape is its airfoil. The angle between its chord and the incoming air is the angle of attack, which affects lift [S3]. The separate wing-box cutaway reveals the spars and ribs inside [S43]. Here the wing is shown as a solid shape.\n\nLift acts at right angles to the incoming air. When the aircraft banks, lift tilts with the wings [S1, S5].",
      "zh": "这是飞行员视角的左翼。客机的机翼提供大部分升力，发动机提供推力 [S1]。左副翼、襟翼、缝翼和扰流板装在这边，发动机挂在下面。\n\n机翼的剖面形状叫翼型。翼弦与来流之间的角叫迎角，会影响升力 [S3]。独立的翼盒剖面展示了里面的翼梁和翼肋 [S43]，这里的机翼则画成实心外形。\n\n升力垂直于来流。飞机倾斜时，升力也随机翼倾斜 [S1, S5]。"
    },
  },
  'wing-right': {
    name: t('Right wing', '右翼'),
    summary: t('Gives most of the lift on the right side.', '在右侧提供大部分升力。'),
    detail: {
      "en": "This is the right wing from the pilot’s viewpoint, mirroring the left. It carries the right aileron, flap and slat, with an engine below. In the banked pose this wing lowers, and the lift arrow leans towards it [S5].\n\nThe wings provide most of the airliner’s lift [S1]. This general example is drawn ten times smaller [S58].\n\nDuring a bank, lift’s sideways part curves the flight path. The model holds one banked position to show this direction [S5, S58].",
      "zh": "这是飞行员视角的右翼，与左翼对称。右副翼、襟翼和缝翼装在这边，发动机挂在下面。倾斜姿态中，这侧机翼降低，升力箭头朝它倾斜 [S5]。\n\n机翼提供客机的大部分升力 [S1]。这个一般客机模型缩小了十倍 [S58]。\n\n倾斜时，升力的侧向部分让航迹弯曲。模型固定在一个倾斜姿态，展示这个方向 [S5, S58]。"
    },
  },
  'wing-tip-left': {
    name: t('Left wing tip', '左翼尖'),
    summary: t('Closes off the outer end of the left wing.', '收住左翼的外端。'),
    detail: {
      "en": "The outermost piece completes the left wing’s outline.\n\nThis model has a small upturned tip. Its effect on fuel use and drag is not calculated [S58].",
      "zh": "左翼最外端的一块，接成完整的机翼轮廓。\n\n这里画成向上翘起的小翼尖，模型没有计算它对耗油和阻力的影响 [S58]。"
    },
  },
  'wing-tip-right': {
    name: t('Right wing tip', '右翼尖'),
    summary: t('Closes off the outer end of the right wing.', '收住右翼的外端。'),
    detail: {
      "en": "The outermost piece completes the right wing’s outline and mirrors the left tip.\n\nThis model has a small upturned tip. Its effect on fuel use and drag is not calculated [S58].",
      "zh": "右翼最外端的一块，与左翼尖对称，接成完整的机翼轮廓。\n\n这里画成向上翘起的小翼尖，模型没有计算它对耗油和阻力的影响 [S58]。"
    },
  },
  'wing-box-skin': {
    name: t('Wing skin', '翼蒙皮'),
    summary: t('Covers the frame and closes the wing box.', '包住骨架，封闭翼盒。'),
    detail: {
      "en": "The skin forms the smooth outer surface of the wing box. It is drawn faintly so you can see the spars and ribs inside.\n\nTwo spars, skin panels and end ribs make a closed box. This is one common wing structure; other designs vary [S43]. This short section has its own scale, separate from the airliner [S58].\n\nAir flows over the skin, whose shape is held by the ribs beneath it [S43].",
      "zh": "蒙皮构成翼盒平滑的外表面。画面把它淡化，方便看见里面的翼梁和翼肋。\n\n两根翼梁、蒙皮板和两端的翼肋围成封闭的盒子。这是常见的机翼结构之一，其他设计会有所不同 [S43]。这小段翼盒有自己的比例，与整架客机分开 [S58]。\n\n空气流过蒙皮表面，下面的翼肋撑出它的形状 [S43]。"
    },
  },
  'front-spar': {
    name: t('Front spar', '前翼梁'),
    summary: t('Runs along the span and carries bending loads.', '沿翼展延伸，承担弯曲载荷。'),
    detail: {
      "en": "The front spar is the forward beam inside the wing box. It runs along the span, from the wing root towards the tip.\n\nSpars carry loads that bend the wing [S43]. This one has a central web with flanges along its top and bottom edges. Its position near the front is chosen for this model [S58].\n\nTogether with the rear spar, skin and ribs, it forms a closed box [S43].",
      "zh": "前翼梁是翼盒里靠前的一根梁，沿翼展从翼根伸向翼尖。\n\n翼梁承受使机翼弯曲的力 [S43]。这里的梁中间是一块腹板，上下边缘带缘条。靠近前部的位置是模型选用的布局 [S58]。\n\n它与后翼梁、蒙皮和翼肋一起围成封闭的盒子 [S43]。"
    },
  },
  'rear-spar': {
    name: t('Rear spar', '后翼梁'),
    summary: t('Runs along the span and carries bending loads.', '沿翼展延伸，承担弯曲载荷。'),
    detail: {
      "en": "The rear spar runs along the span behind the front spar.\n\nSpars carry loads that bend the wing [S43]. A real wing leaves room behind the rear spar for flaps and ailerons. This short section leaves those parts out [S58].\n\nTogether with the front spar, skin and ribs, it closes the wing box [S43].",
      "zh": "后翼梁位于前翼梁后方，也沿翼展延伸。\n\n翼梁承受使机翼弯曲的力 [S43]。真实机翼在后翼梁后方留出位置，安装襟翼和副翼。这段短翼盒省略了这些零件 [S58]。\n\n它与前翼梁、蒙皮和翼肋一起封闭翼盒 [S43]。"
    },
  },
  'wing-ribs': {
    name: t('Ribs', '翼肋'),
    summary: t('Hold the wing in its airfoil shape.', '保持机翼的翼型。'),
    detail: {
      "en": "Each rib is a plate running from the wing’s front edge to its back edge. Its outline follows the airfoil shape. Holes reduce its weight.\n\nRibs hold the airfoil shape and join the spars to the skin [S43]. This model uses three ribs as a simple example [S58].\n\nThe ribs have a curved outline, different from the symmetric section used in the airflow experiment [S58].",
      "zh": "每道翼肋是一块从机翼前缘伸向后缘的板，轮廓沿着翼型。板上的孔可以减轻重量。\n\n翼肋保持翼型，把翼梁和蒙皮连接起来 [S43]。这个简化例子用了三道翼肋 [S58]。\n\n这里的翼肋是弯曲剖面，与气流实验里的对称翼型不同 [S58]。"
    },
  },
  'aileron-left': {
    name: t('Left aileron', '左副翼'),
    summary: t('Rolls the aircraft, moving opposite to the right one.', '与右副翼反向偏转，让飞机滚转。'),
    detail: {
      "en": "This hinged surface sits near the outer back edge of the left wing.\n\nThe two ailerons move in opposite directions, one up and one down, to roll the aircraft into a bank [S5]. Each turns 12° in this model so the movement is easy to see [S58].\n\nBanking tilts lift. Its sideways part curves the flight path [S5].",
      "zh": "左副翼装在左翼外侧的后缘，可以绕铰链偏转。\n\n两侧副翼一上一下，让飞机滚转、倾斜 [S5]。模型中每块偏转 12°，方便看清动作 [S58]。\n\n飞机倾斜时，升力也倾斜。升力的侧向部分让航迹弯曲 [S5]。"
    },
  },
  'aileron-right': {
    name: t('Right aileron', '右副翼'),
    summary: t('Rolls the aircraft, moving opposite to the left one.', '与左副翼反向偏转，让飞机滚转。'),
    detail: {
      "en": "This hinged surface sits near the outer back edge of the right wing. It moves opposite to the left aileron.\n\nOpposite aileron movements roll the aircraft [S5]. Each turns 12° in this model so the movement is easy to see [S58].\n\nOnce the aircraft banks, lift’s sideways part curves its flight path [S5].",
      "zh": "右副翼装在右翼外侧的后缘，偏转方向与左副翼相反。\n\n两侧副翼反向偏转，让飞机滚转 [S5]。模型中每块偏转 12°，方便看清动作 [S58]。\n\n飞机倾斜以后，升力的侧向部分让航迹弯曲 [S5]。"
    },
  },
  'spoiler-left': {
    name: t('Spoiler', '扰流板'),
    summary: {
      "en": "Rises to reduce lift and add drag.",
      "zh": "抬起时减少升力、增加阻力。"
    },
    detail: {
      "en": "This panel sits on top of the left wing, ahead of the flap. It rises in the final control-surface pose as the flap lowers.\n\nA raised spoiler reduces lift and adds drag [S8]. The model shows one panel for clarity; real wings can have different numbers [S58].",
      "zh": "这块板装在左翼上方、襟翼前面。最后一个操纵面姿态中，襟翼放下，扰流板则抬起。\n\n扰流板抬起会减少升力、增加阻力 [S8]。模型只画一块，方便看清；真实机翼上的数量各有不同 [S58]。"
    },
  },
  'flap-left': {
    name: t('Left flap', '左襟翼'),
    summary: t('Slides back and down to help the wing at low speed.', '向后、向下伸出，帮助机翼低速飞行。'),
    detail: {
      "en": "The left flap sits on the inner part of the wing’s trailing edge and slides back and down.\n\nFlaps change the wing’s shape. Sliding flaps also increase its area, helping it produce more lift at lower speed. Extended flaps add drag [S8]. This flap slides back 0.04 m and turns down 20° on the model, which is ten times smaller than the aircraft it represents [S58].\n\nCompare the extended flap with the raised spoiler: the flap helps maintain low-speed lift, while the spoiler reduces lift [S8].",
      "zh": "左襟翼位于机翼后缘靠近机身的一段，向后、向下伸出。\n\n襟翼改变机翼形状，滑出的襟翼还增加面积，让机翼在较低速度下产生更多升力。放出的襟翼也增加阻力 [S8]。模型中，它后移 0.04 米、下转 20°；这是缩小十倍的模型上的距离 [S58]。\n\n对比放出的襟翼和抬起的扰流板：襟翼帮助维持低速升力，扰流板则减少升力 [S8]。"
    },
  },
  'flap-right': {
    name: t('Right flap', '右襟翼'),
    summary: t('Slides back and down to help the wing at low speed.', '向后、向下伸出，帮助机翼低速飞行。'),
    detail: {
      "en": "The right flap mirrors the left one on the inner trailing edge. Both extend together.\n\nExtended flaps help the wing maintain enough lift at lower speed and also add drag [S8]. This model’s flap slides back 0.04 m and turns down 20° [S58].",
      "zh": "右襟翼位于机翼内侧后缘，与左襟翼对称，两侧一起伸出。\n\n放出的襟翼帮助机翼在较低速度下维持足够的升力，同时增加阻力 [S8]。模型中，襟翼后移 0.04 米、下转 20° [S58]。"
    },
  },
  'slat-left': {
    name: t('Left slat', '左缝翼'),
    summary: t('Moves forward from the leading edge for low speed.', '从前缘向前伸出，帮助低速飞行。'),
    detail: {
      "en": "The left slat is a curved strip along the wing’s leading edge. Moving forwards opens a narrow gap ahead of the wing.\n\nLeading-edge slats and trailing-edge flaps change the wing for slower flight [S8]. This slat moves forwards 0.025 m in the model [S58].",
      "zh": "左缝翼是沿机翼前缘的一条弯曲翼片。向前伸出时，它与机翼之间留下一道窄缝。\n\n前缘缝翼和后缘襟翼都能改变机翼，帮助慢速飞行 [S8]。这块缝翼在模型中前移 0.025 米 [S58]。"
    },
  },
  'slat-right': {
    name: t('Right slat', '右缝翼'),
    summary: t('Moves forward from the leading edge for low speed.', '从前缘向前伸出，帮助低速飞行。'),
    detail: {
      "en": "The right slat mirrors the left one along the wing’s leading edge. Both move forwards together.\n\nLeading-edge slats help the wing at lower speed [S8]. This slat moves forwards 0.025 m in the model [S58].",
      "zh": "右缝翼沿右翼前缘延伸，与左缝翼对称，两侧一起向前伸出。\n\n前缘缝翼帮助机翼低速飞行 [S8]。模型中，这块缝翼前移 0.025 米 [S58]。"
    },
  },
  'tailplane-left': {
    name: t('Left tailplane', '左水平尾翼'),
    short: t('L. tailplane', '左平尾'),
    summary: {
      "en": "Carries the left elevator at the back.",
      "zh": "后缘装着左升降舵。"
    },
    detail: {
      "en": "This is the left half of the horizontal tail at the back of the fuselage. The left elevator is hinged to its back edge.\n\nThis airliner has a conventional rear tail. The Wright brothers’ first aircraft placed its elevator at the front instead [S6].",
      "zh": "这是机身后方水平尾翼的左半边。左升降舵铰接在它的后缘。\n\n这架客机采用常规的后置尾翼。莱特兄弟的第一架飞机则把升降舵装在前面 [S6]。"
    },
  },
  'tailplane-right': {
    name: t('Right tailplane', '右水平尾翼'),
    short: t('R. tailplane', '右平尾'),
    summary: {
      "en": "Carries the right elevator at the back.",
      "zh": "后缘装着右升降舵。"
    },
    detail: {
      "en": "The right half of the horizontal tail mirrors the left. The right elevator is hinged to its back edge.\n\nOn a conventional tail, the elevator forms part of the horizontal tail [S6]. This model uses a general tail shape [S58].",
      "zh": "水平尾翼的右半边与左半边对称。右升降舵铰接在它的后缘。\n\n常规尾翼的升降舵是水平尾翼的一部分 [S6]。这里采用一般的尾翼外形 [S58]。"
    },
  },
  'elevator-left': {
    name: t('Left elevator', '左升降舵'),
    summary: t('Pitches the nose up or down.', '让机头向上或向下转。'),
    detail: {
      "en": "The left elevator is hinged to the back of the horizontal tail. Both elevators rise together in the demonstration.\n\nElevators change pitch, turning the aircraft’s nose up or down [S6]. This one turns 10° up in the model [S58].",
      "zh": "左升降舵铰接在水平尾翼后缘。演示中，两侧升降舵一起上偏。\n\n升降舵改变俯仰，让机头向上或向下转 [S6]。模型中，这块舵面上偏 10° [S58]。"
    },
  },
  'elevator-right': {
    name: t('Right elevator', '右升降舵'),
    summary: t('Pitches the nose up or down.', '让机头向上或向下转。'),
    detail: {
      "en": "The right elevator is hinged to the back of the horizontal tail and moves together with the left one.\n\nElevators change pitch [S6]. This model shows a 10° upward movement [S58].",
      "zh": "右升降舵铰接在水平尾翼后缘，与左升降舵一起运动。\n\n升降舵改变飞机的俯仰 [S6]。模型演示的是向上偏转 10° [S58]。"
    },
  },
  fin: {
    name: t('Vertical fin', '垂直尾翼'),
    summary: {
      "en": "Carries the rudder on its back edge.",
      "zh": "后缘装着方向舵。"
    },
    detail: {
      "en": "The fin is the upright surface at the back of the fuselage. The rudder is hinged to its back edge.\n\nThe rudder on the vertical tail controls yaw [S7]. This model uses a general fin shape [S58].",
      "zh": "垂直尾翼是机身后方竖立的翼面。方向舵铰接在它的后缘。\n\n垂直尾翼上的方向舵控制偏航 [S7]。模型采用一般的垂直尾翼外形 [S58]。"
    },
  },
  rudder: {
    name: t('Rudder', '方向舵'),
    summary: t('Yaws the nose left or right.', '让机头向左或向右偏。'),
    detail: {
      "en": "The rudder is hinged to the back of the vertical fin.\n\nIt controls yaw, turning the nose left or right. In a coordinated turn, it helps the aircraft line up with its curving path [S7]. This model shows a 10° movement [S58].\n\nBanking provides the main turning force by tilting the lift sideways [S5].",
      "zh": "方向舵铰接在垂直尾翼的后缘。\n\n它控制偏航，让机头向左或向右转。协调转弯时，它帮助飞机对准弯曲的航迹 [S7]。模型中的偏转幅度是 10° [S58]。\n\n飞机主要靠倾斜来转弯，倾斜让升力的一部分指向侧面 [S5]。"
    },
  },
  'nacelle-left': {
    name: t('Left nacelle', '左发动机舱'),
    summary: t('Encloses the left engine and its fan.', '包住左发动机和它的风扇。'),
    detail: {
      "en": "This streamlined casing surrounds the left engine below the wing. Both engines briefly disappear during the comparison with a glider.\n\nEngines provide thrust, while wings provide most of the lift [S1]. The separate cutaway reveals the machinery inside a turbofan [S9].\n\nAt greater height, engines still need enough air. Available thrust helps limit an aircraft’s cruising height [S12].",
      "zh": "流线形的左发动机外罩挂在机翼下面。比较滑翔机时，画面暂时隐藏两台发动机。\n\n发动机提供推力，机翼提供大部分升力 [S1]。独立的剖面展示涡扇里面的机械 [S9]。\n\n飞得更高时，发动机仍需足够的空气。可用推力是限制巡航高度的因素之一 [S12]。"
    },
  },
  'nacelle-right': {
    name: t('Right nacelle', '右发动机舱'),
    summary: t('Encloses the right engine and its fan.', '包住右发动机和它的风扇。'),
    detail: {
      "en": "This casing surrounds the right engine below the wing. During the stall demonstration, it appears beside the wing experiment with its fan still turning.\n\nA wing stall concerns airflow and lift [S3]. The engine can keep running and supplying thrust [S1].",
      "zh": "右发动机外罩挂在右翼下面。演示失速时，它出现在机翼实验旁边，风扇继续转动。\n\n机翼失速描述的是气流和升力的变化 [S3]。发动机仍可运转，提供推力 [S1]。"
    },
  },
  'fan-left': {
    name: t('Left fan', '左风扇'),
    summary: t('Turns at the front of the left engine, moving air back.', '在左发动机前端转动，把空气推向后方。'),
    detail: {
      "en": "Look through the left engine’s inlet to see the fan turning at the front.\n\nThe fan sends air through the core and around it. Both streams help produce thrust [S9]. On screen, the fan turns at 30 rpm, slowed down for viewing [S58].",
      "zh": "从左发动机的进气口看进去，就能看到前方转动的风扇。\n\n风扇把空气送进核心，也送到核心外圈。两路气流都帮助产生推力 [S9]。画面转速是每分钟 30 转，已放慢，方便观察 [S58]。"
    },
  },
  'fan-right': {
    name: t('Right fan', '右风扇'),
    summary: t('Turns at the front of the right engine, moving air back.', '在右发动机前端转动，把空气推向后方。'),
    detail: {
      "en": "The right engine’s fan keeps turning beside the wing during the stall demonstration. Wing stall concerns airflow and lift, while an engine can keep running [S3].\n\nThe fan sends air into and around the core [S9]. It turns at 30 rpm on screen, slowed down for viewing [S58].",
      "zh": "失速演示中，右发动机的风扇在翼段旁继续转动。机翼失速描述的是气流和升力，发动机仍可运转 [S3]。\n\n风扇把空气送进核心，也送到核心外圈 [S9]。画面转速是每分钟 30 转，已放慢，方便观察 [S58]。"
    },
  },
  'engine-shell': {
    name: t('Engine case', '发动机外壳'),
    summary: t('Surrounds the fan and the outer air stream.', '围住风扇和外圈气流。'),
    detail: {
      "en": "The near half of this engine case is cut away to reveal the inside. Fixed guide vanes behind the fan are attached to the case.\n\nAir enters at the front. Behind the fan it splits into the core stream and the bypass stream around the core [S9]. This cutaway has its own scale, separate from the airliner [S58].",
      "zh": "发动机外壳靠近你的半边已被剖开，露出内部。风扇后面固定的导向叶片连在外壳上。\n\n空气从前方进入，经过风扇后分成核心气流和外圈的外涵气流 [S9]。这个剖面有自己的比例，与整架客机分开 [S58]。"
    },
  },
  'fan-disc': {
    name: t('Fan', '风扇'),
    summary: t('Pushes air into both the bypass and the core.', '把空气推进外涵和核心两路。'),
    detail: {
      "en": "The large bladed fan sits at the front. It shares a shaft with the fan turbine at the back, so both turn together.\n\nThe fan draws air in, then sends it through and around the core. Fan-driven bypass air contributes thrust [S9]. In this two-spool engine, the inner shaft connects the fan to its turbine [S9]. The fan turns at 30 rpm on screen, slowed down for viewing. The blade count is simplified [S58].",
      "zh": "大风扇位于发动机前端。它和后方的风扇涡轮连在同一根轴上，一起转动。\n\n风扇吸入空气，送往核心内外两路。风扇推动的外涵空气贡献推力 [S9]。这台两转子发动机由内轴连接风扇和风扇涡轮 [S9]。画面中风扇每分钟转 30 转，已放慢，叶片数量也经过简化 [S58]。"
    },
  },
  'bypass-duct': {
    name: t('Bypass duct', '外涵道'),
    summary: t('Guides the outer air stream around the core.', '引导外圈气流绕过核心。'),
    detail: {
      "en": "This ring-shaped passage lies between the core and the outer case. Air pushed by the fan’s outer part flows through it.\n\nBypass air goes around the combustor and turbines. It leaves through the bypass outlet and contributes thrust [S9].\n\nThe bypass ratio compares the mass of air passing around and through the core each second. Dots show the route, so their number does not give this ratio [S9, S58].",
      "zh": "这条环形通道位于核心和外壳之间。风扇外圈推动的空气从这里流过。\n\n外涵空气绕过燃烧室和涡轮，从外涵出口排出，贡献推力 [S9]。\n\n涵道比比较每秒绕过核心与穿过核心的空气质量。画面中的点表示路线，不能靠数点得出这个比值 [S9, S58]。"
    },
  },
  'compressor-bank': {
    name: t('Compressor stators', '压气机静子'),
    short: t('Comp. stators', '压气机静子'),
    summary: t('Fixed blade rows that guide air through the compressor.', '固定叶排，引导空气穿过压气机。'),
    detail: {
      "en": "Fixed rows of compressor blades sit between the rotating rows. They are attached to the core case and stay still.\n\nCore air is compressed before fuel is added and burned [S9]. Rotating blades compress it, while these fixed rows guide it onwards. The number of rows is simplified [S58].",
      "zh": "压气机固定的叶排夹在转动叶排之间，装在核心机匣上，保持不动。\n\n核心空气先被压缩，再加入燃料燃烧 [S9]。转动叶片负责压缩，固定叶排引导气流继续前进。叶排数量经过简化 [S58]。"
    },
  },
  'compressor-rotor': {
    name: t('Compressor rotor', '压气机转子'),
    short: t('Comp. rotor', '压气机转子'),
    summary: t('Rotating blades that squeeze the core air.', '转动的叶片，压缩核心气流。'),
    detail: {
      "en": "The compressor’s rotating blade rows are attached to the hollow core shaft.\n\nThe core turbine drives the compressor through this shaft [S9]. In the model, the compressor rotor, core shaft and core turbine turn together at 45 rpm. They turn faster than the fan spool, but both speeds are slowed for viewing [S58].\n\nCore air passes through compression, combustion and then the turbines, in that order [S9].",
      "zh": "压气机的转动叶排连在空心核心轴上。\n\n核心涡轮通过轴带动压气机 [S9]。模型中，压气机转子、核心轴和核心涡轮一起以每分钟 45 转转动，比风扇那一组快。两组都已放慢，方便观察 [S58]。\n\n核心气流依次经过压缩、燃烧和涡轮 [S9]。"
    },
  },
  'combustor-ring': {
    name: t('Combustor', '燃烧室'),
    summary: t('Burns fuel in the compressed air.', '在压缩后的空气里燃烧燃料。'),
    detail: {
      "en": "The combustor is a ring-shaped chamber between the compressor and turbines. The shafts pass through its central opening.\n\nFuel burns in the compressed air here. Hot gas then flows through the turbines towards the nozzle [S9]. Bypass air travels around this chamber [S9].\n\nThe coloured dots mark hot gas inside the engine. Their colour does not measure temperature [S58].",
      "zh": "燃烧室是压气机和涡轮之间的环形腔，两根轴从中央的孔穿过。\n\n燃料在压缩后的空气中燃烧，热气随后流过涡轮，前往喷口 [S9]。外涵空气绕过这个腔体 [S9]。\n\n彩色的点表示发动机内部的热气，颜色没有标出温度高低 [S58]。"
    },
  },
  'turbine-bank': {
    name: t('Turbine stators', '涡轮静子'),
    short: t('Turb. stators', '涡轮静子'),
    summary: t('Fixed blade rows that guide hot gas onto the turbines.', '固定叶排，把热气引向涡轮。'),
    detail: {
      "en": "Fixed turbine blade rows sit between the rotating rows. They are attached to the core case and stay still.\n\nHot gas flows from the combustor through the turbines, transferring energy to drive the compressor and fan [S9]. These fixed rows guide gas towards the rotating blades. The row count is simplified [S58].",
      "zh": "固定的涡轮叶排夹在转动叶排之间，装在核心机匣上，保持不动。\n\n热气从燃烧室流过涡轮，把能量传给涡轮，带动压气机和风扇 [S9]。固定叶排把热气引向转动叶片，叶排数量经过简化 [S58]。"
    },
  },
  'hp-turbine-rotor': {
    name: t('Core turbine', '核心涡轮转子'),
    summary: t('Turns in the hot gas and drives the compressor.', '在热气中转动，带动压气机。'),
    detail: {
      "en": "The core turbine is the first rotating turbine behind the combustor. It is attached to the hollow core shaft.\n\nIt takes energy from hot gas and drives the compressor through the shaft [S9]. In the model, both turn together at 45 rpm, slowed down for viewing [S58].",
      "zh": "核心涡轮紧接在燃烧室后面，是第一组转动的涡轮，连在空心核心轴上。\n\n它从热气取得能量，通过轴带动压气机 [S9]。模型中，两者一起以每分钟 45 转转动，已放慢，方便观察 [S58]。"
    },
  },
  'lp-turbine-rotor': {
    name: t('Fan turbine', '风扇涡轮转子'),
    summary: t('Turns in the hot gas and drives the fan.', '在热气中转动，带动风扇。'),
    detail: {
      "en": "The fan turbine’s rotating rows sit behind the core turbine. They are attached to the inner fan shaft.\n\nIn this two-spool engine, that shaft runs inside the core shaft to drive the fan [S9]. This turbine and the fan turn together at 30 rpm on screen, slowed down for viewing [S58]. Other engines can have more spools [S9].",
      "zh": "风扇涡轮的转动叶排位于核心涡轮后面，连在内侧的风扇轴上。\n\n这台两转子发动机的风扇轴穿过核心轴内部，带动风扇 [S9]。风扇涡轮和风扇在画面中一起以每分钟 30 转转动，已放慢 [S58]。其他发动机也可能有更多转子 [S9]。"
    },
  },
  'lp-shaft': {
    name: t('Fan shaft', '风扇轴'),
    summary: {
      "en": "Transfers turning energy from the turbine to the fan.",
      "zh": "把涡轮转动的能量传给风扇。"
    },
    detail: {
      "en": "This inner shaft extends from the front fan to the fan turbine at the back.\n\nIn this two-spool engine, it runs inside the hollow core shaft [S9]. It carries turning energy along the engine. It turns at 30 rpm on screen, slowed down for viewing [S58].",
      "zh": "这根内轴从前方风扇一直延伸到后方的风扇涡轮。\n\n这台两转子发动机的风扇轴穿过空心核心轴内部 [S9]。它沿发动机传递转动的能量，画面中每分钟转 30 转，已放慢 [S58]。"
    },
  },
  'hp-shaft': {
    name: t('Core shaft', '核心轴'),
    summary: {
      "en": "Transfers turning energy to the compressor.",
      "zh": "把转动的能量传给压气机。"
    },
    detail: {
      "en": "This hollow outer shaft joins the core turbine to the compressor rotor. The fan shaft passes through the middle, with a small gap between them.\n\nIn this two-spool engine, the core shaft surrounds the fan shaft [S9]. The two sets turn independently: this one at 45 rpm and the fan at 30 rpm on screen. Both are slowed down for viewing [S58].",
      "zh": "这根空心外轴连接核心涡轮和压气机转子。风扇轴从中间穿过，两根轴之间留有小间隙。\n\n这台两转子发动机的核心轴套在风扇轴外面 [S9]。两组各自转动：核心组每分钟 45 转，风扇组每分钟 30 转，都已放慢，方便观察 [S58]。"
    },
  },
  'core-nozzle': {
    name: t('Core nozzle', '核心喷口'),
    summary: t('Lets the hot core stream out at the back.', '让核心热气从后方排出。'),
    detail: {
      "en": "This narrowing outlet sits at the back of the core. A cone fills its centre, behind the ends of the shafts.\n\nAfter passing through the turbines, hot gas leaves through this nozzle. Core exhaust and bypass air both contribute thrust [S9]. The outlet has a simplified shape [S58].",
      "zh": "核心后方的出口逐渐收窄，中间有一个锥体，位于两根轴的末端后面。\n\n流过涡轮后，热气从这个喷口排出。核心排气和外涵空气都贡献推力 [S9]。出口外形经过简化 [S58]。"
    },
  },
  'bypass-nozzle': {
    name: t('Bypass outlet', '外涵出口'),
    summary: t('Lets the outer bypass stream out.', '让外圈的外涵气流排出。'),
    detail: {
      "en": "This ring-shaped outlet sits at the back of the bypass duct.\n\nFan-driven air leaves here and contributes thrust. It has travelled around the combustor and turbines [S9]. The outlet has a simplified shape [S58].",
      "zh": "这个环形出口位于外涵道后方。\n\n风扇推动的空气绕过燃烧室和涡轮，从这里排出，贡献推力 [S9]。出口外形经过简化 [S58]。"
    },
  },
  'foil-sample': {
    name: t('Airfoil', '翼型'),
    summary: {
      "en": "Turns the air in the wing experiment.",
      "zh": "在机翼实验中让气流转向。"
    },
    detail: {
      "en": "The experiment uses a short slice of wing. Its symmetric Joukowski airfoil is made by mapping a circle into a wing shape mathematically [S57]. As its angle changes, the section turns about a point a quarter of the way back from the front edge.\n\nThe chosen chord is 1 m and the reference area is 2 m². The visible slice is 0.12 m thick [S58]. Up to 12°, the calculation uses ideal attached flow. Beyond that, a simple teaching rule gives the curve and dashed lines show separated air [S58]. At 4° and 40 m/s near sea level, simulated lift is about 924 N [S58].\n\nThe readings are calculated examples, rather than measurements of a real aircraft wing [S58]. In ideal flow, this symmetric shape has zero lift at zero angle and lift at other angles [S3]. NASA’s student airfoil program also uses streamlines, surface pressures and lift curves; this experiment has its own code [S10].",
      "zh": "实验使用一小段机翼。对称的茹科夫斯基翼型，由一个圆经过数学映射变成机翼剖面形状 [S57]。迎角改变时，翼段绕前缘后方四分之一弦长处转动。\n\n这里选用 1 米弦长、2 平方米参考面积，眼前这段厚 0.12 米 [S58]。12° 以内，计算采用贴着翼面的理想流；之后改用简单教学规则，虚线示意分离气流 [S58]。接近海平面、迎角 4°、速度 40 米每秒时，模拟升力约 924 牛 [S58]。\n\n读数是计算出的例子，并非真实机翼的测量结果 [S58]。理想流中，这个对称翼型零迎角时升力为零，其他迎角时有升力 [S3]。NASA 的学生翼型程序也用流线、表面气压和升力曲线来展示；这里的实验程序另外编写 [S10]。"
    },
  },
  'chord-marker': {
    name: t('Chord', '翼弦'),
    summary: {
      "en": "Joins front and back edges to help measure the angle.",
      "zh": "连接前后缘，帮助量迎角。"
    },
    detail: {
      "en": "This thin line joins the airfoil’s front and back edges and turns with the section.\n\nThe chord is the straight line between the leading and trailing edges [S13]. Its angle to the incoming air is the angle of attack [S3]. Here the chord is 1 m long [S58].",
      "zh": "这条细线连接翼型的前缘和后缘，随翼段一起转动。\n\n翼弦就是连接前缘和后缘的直线 [S13]。它与来流之间的角叫迎角 [S3]。这里的翼弦长 1 米 [S58]。"
    },
  },
  'inflow-reference': {
    name: t('Incoming air', '来流'),
    summary: {
      "en": "Shows the fixed direction of the incoming air.",
      "zh": "标出来流的固定方向。"
    },
    detail: {
      "en": "This fixed line ahead of the airfoil shows the direction of the incoming air. The chord turns, while this line stays still.\n\nLift acts at right angles to the incoming air, and drag acts along it [S1, S2]. Angle of attack is measured from this airflow direction [S3].",
      "zh": "翼型前方这条固定的线表示来流方向。翼弦会转，这条线保持不动。\n\n升力垂直于来流，阻力沿着来流 [S1, S2]。迎角从这个气流方向量起 [S3]。"
    },
  },
  'angle-marker': {
    name: t('Angle', '迎角'),
    summary: t('Marks where the angle of attack is measured.', '标出迎角在哪里量。'),
    detail: {
      "en": "The small marker sits a quarter of the way back along the chord. The angle arc starts here.\n\nThe arc runs between the incoming-air line and the chord, marking the angle of attack [S3]. The model offers −20° to 20°, in steps of 4° [S58]. At zero angle the arc disappears.",
      "zh": "小标记位于前缘后方四分之一弦长处，迎角的弧画在这里。\n\n弧从来流线画到翼弦，标出迎角 [S3]。模型的迎角范围是 −20° 到 20°，每档 4° [S58]。迎角为零时，弧就消失。"
    },
  },
  'display-plinth': {
    name: t('Display stand', '展台'),
    summary: t('Holds the wing experiment in place.', '托住机翼实验件。'),
    detail: {
      "en": "The stand supports the wing experiment like a museum exhibit. It appears with the experiment and is separate from the aircraft.\n\nIt has its own scale and does not affect the calculated airflow [S58].",
      "zh": "展台像博物馆的底座一样托住机翼实验件，只随实验件出现，与飞机分开。\n\n它有自己的比例，不影响计算出的气流 [S58]。"
    },
  },
};
