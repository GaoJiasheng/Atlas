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
    detail: p(
      [
        'The long body of the generic airliner: the wings, the tail and the cockpit are all attached to it, and the passengers and cargo ride inside. It is on the stage in the background chapter and in chapters 01, 04, 06 and 07; the four-force arrows of chapter 01 start from its outline.',
        'The design airliner is nominally about 40 m long, 36 m across the wings and 12 m high, drawn ten times smaller [S58]. Everything the fuselage carries, including the fuel and the load, adds to the weight that the wings must balance in level flight [S1].',
        'It is a generic shape with no windows of any real type, and no maker, model or airline is meant [S58].',
      ],
      [
        '通用客机的长条形机体：机翼、尾翼和驾驶舱都装在它上面，乘客和货物在里面。背景章和第 01、04、06、07 章的舞台上都有它；第 01 章的四力箭头从它的轮廓画出。',
        '设计中的客机名义尺寸约长 40 米、翼展 36 米、高 12 米，按十分之一画出 [S58]。机身所载的一切，包括燃油和人与货物，都计入重力；水平飞行时，机翼的升力要与它平衡 [S1]。',
        '这是通用外形，不对应任何制造商、型号或航空公司 [S58]。',
      ],
    ),
  },
  'cockpit-glazing': {
    name: t('Cockpit', '驾驶舱'),
    summary: t('Marks the nose, where the crew sit.', '标出机头，机组坐在这里。'),
    detail: p(
      [
        'The windows at the front of the fuselage, where the flight crew sit. On the stage they mark which end is the nose: the airliner flies towards −X, into the incoming air.',
        'The glazing is drawn as a simple band; real window frames and their number are not modelled [S58].',
      ],
      [
        '机身前端的窗户，机组坐在后面。在舞台上，它标出哪一头是机头：客机朝 −X 方向飞，迎着来流。',
        '风挡只画成一条简单的带子，没有画真实的窗框和窗的数目 [S58]。',
      ],
    ),
  },
  'wing-left': {
    name: t('Left wing', '左翼'),
    summary: t('Gives most of the lift on the left side.', '在左侧提供大部分升力。'),
    detail: p(
      [
        'The left wing as the pilot sees it. On a conventional airliner the wings provide most of the lift, while the engines supply thrust [S1]. It carries the left aileron, flap, slat and spoiler, and the left engine hangs below it.',
        'Its cross-section is an airfoil, and the angle between its chord and the incoming air, the angle of attack, sets how much lift it gives [S3]. Chapter 02 opens up a wing to show the spars and ribs inside [S43]; the wing on the airliner is drawn as a solid shape.',
        'Lift acts across the incoming airflow, so when the aircraft banks the lift of both wings tilts with it [S1, S5].',
      ],
      [
        '飞行员视角的左侧机翼。常规客机的大部分升力来自机翼，推力由发动机提供 [S1]。它上面装着左副翼、襟翼、缝翼和扰流板，左发动机挂在它下面。',
        '机翼的剖面是翼型；翼弦与来流之间的角，也就是迎角，决定它产生多少升力 [S3]。第 02 章剖开一段机翼，展示里面的翼梁和翼肋 [S43]；客机上的机翼画成实心外形。',
        '升力垂直于来流，所以飞机倾斜时，两侧机翼的升力也跟着倾斜 [S1, S5]。',
      ],
    ),
  },
  'wing-right': {
    name: t('Right wing', '右翼'),
    summary: t('Gives most of the lift on the right side.', '在右侧提供大部分升力。'),
    detail: p(
      [
        'The right wing as the pilot sees it, the mirror of the left. It carries the right aileron, flap and slat, and the right engine hangs below it. In chapter 04 the banked pose drops this wing, and the lift arrow leans towards it [S5].',
        'The wings provide most of an airliner’s lift [S1]. The shape and size are a generic design drawn ten times smaller [S58].',
        'In a bank, the sideways part of the lift curves the flight path; the stage shows one fixed bank, not a calculated turn [S5, S58].',
      ],
      [
        '飞行员视角的右侧机翼，与左翼对称。它上面装着右副翼、襟翼和缝翼，右发动机挂在它下面。第 04 章的倾斜姿态让这一侧机翼向下，升力箭头也朝它这边倾斜 [S5]。',
        '客机的大部分升力来自机翼 [S1]。外形和尺寸是通用设计，按十分之一画出 [S58]。',
        '倾斜时，升力的侧向部分让航迹弯曲；舞台上只画一个固定的倾斜姿态，不是计算出来的转弯 [S5, S58]。',
      ],
    ),
  },
  'wing-tip-left': {
    name: t('Left wing tip', '左翼尖'),
    summary: t('Closes off the outer end of the left wing.', '收住左翼的外端。'),
    detail: p(
      [
        'The outermost piece of the left wing, finishing its outline. It is part of the airliner seen in the background chapter and chapters 01, 04, 06 and 07.',
        'It is drawn as a small upturned tip. The model makes no claim that its shape saves fuel or reduces drag by any amount [S58].',
      ],
      [
        '左翼最外端的一块，收住机翼的轮廓。它属于背景章和第 01、04、06、07 章里的客机。',
        '这里画成一个向上翘起的小翼尖。模型不声称这个形状能省多少油或减少多少阻力 [S58]。',
      ],
    ),
  },
  'wing-tip-right': {
    name: t('Right wing tip', '右翼尖'),
    summary: t('Closes off the outer end of the right wing.', '收住右翼的外端。'),
    detail: p(
      [
        'The outermost piece of the right wing, the mirror of the left tip. It is part of the airliner seen in the background chapter and chapters 01, 04, 06 and 07.',
        'It is drawn as a small upturned tip, with no claim about fuel or drag savings [S58].',
      ],
      [
        '右翼最外端的一块，与左翼尖对称。它属于背景章和第 01、04、06、07 章里的客机。',
        '这里画成一个向上翘起的小翼尖，不声称能省油或减阻 [S58]。',
      ],
    ),
  },
  'wing-box-skin': {
    name: t('Wing skin', '翼蒙皮'),
    summary: t('Covers the frame and closes the wing box.', '包住骨架，封闭翼盒。'),
    detail: p(
      [
        'The outer skin of a separate wing-box model, shown only in chapter 02, beat 1, where it is drawn faint so that the spars and ribs show through. It forms the wing’s smooth surface.',
        'Two spars, the skin panels and the ribs at their ends together make a closed box, one common way of building a wing; real structures vary with the design [S43]. This short piece is a generic example drawn for structure, not at the airliner’s scale [S58].',
        'The skin is the surface the air flows over; its shape comes from the ribs underneath [S43].',
      ],
      [
        '一个独立翼盒模型的外层蒙皮，只在第 02 章第 1 拍出现；那一拍把它画得很淡，透出里面的翼梁和翼肋。它构成机翼平滑的表面。',
        '两根翼梁、蒙皮板和两端的翼肋合成一个封闭的盒，这是机翼常见的一种做法；真实结构随设计而不同 [S43]。这一小段是为说明结构画的通用样件，不按客机的比例 [S58]。',
        '空气流过的就是蒙皮的表面；它的形状由下面的翼肋撑出来 [S43]。',
      ],
    ),
  },
  'front-spar': {
    name: t('Front spar', '前翼梁'),
    summary: t('Runs along the span and carries bending loads.', '沿翼展延伸，承担弯曲载荷。'),
    detail: p(
      [
        'The forward of the two beams inside the wing-box model, seen in chapter 02, beat 1. It runs along the span, from the root of the wing towards the tip.',
        'Spars carry the bending loads of the wing [S43]. This one is drawn as a web with flanges along its top and bottom edges; its position near the front of the section is a drawing choice for this generic example [S58].',
        'With the rear spar, the skin and the ribs it forms a closed box [S43].',
      ],
      [
        '翼盒模型里两根梁中靠前的一根，见第 02 章第 1 拍。它沿翼展方向，从翼根伸向翼尖。',
        '翼梁承担机翼的弯曲载荷 [S43]。这里画成一块腹板，上下边缘带缘条；它靠近剖面前部的位置是这个通用样件的绘图选择 [S58]。',
        '它和后翼梁、蒙皮、翼肋一起构成封闭的盒 [S43]。',
      ],
    ),
  },
  'rear-spar': {
    name: t('Rear spar', '后翼梁'),
    summary: t('Runs along the span and carries bending loads.', '沿翼展延伸，承担弯曲载荷。'),
    detail: p(
      [
        'The rear of the two beams inside the wing-box model, seen in chapter 02, beat 1. It runs along the span behind the front spar.',
        'Spars carry the wing’s bending loads [S43]. Behind the rear spar of a real wing there is room for the flaps and ailerons; this short model piece does not draw them [S58].',
        'With the front spar, the skin and the ribs it closes the box [S43].',
      ],
      [
        '翼盒模型里两根梁中靠后的一根，见第 02 章第 1 拍。它在前翼梁后面沿翼展延伸。',
        '翼梁承担机翼的弯曲载荷 [S43]。真实机翼后翼梁的后面留着装襟翼和副翼的位置；这一小段模型没有画出它们 [S58]。',
        '它和前翼梁、蒙皮、翼肋一起封闭这个盒 [S43]。',
      ],
    ),
  },
  'wing-ribs': {
    name: t('Ribs', '翼肋'),
    summary: t('Hold the wing in its airfoil shape.', '保持机翼的翼型。'),
    detail: p(
      [
        'The plates that run from the front of the wing to the back inside the wing-box model, seen in chapter 02, beat 1. Each one has the outline of the wing’s cross-section, with holes cut to save weight.',
        'Ribs give the wing its airfoil shape and tie the spars and skin together [S43]. The model has three; that number is a drawing choice, not the count for any real wing [S58].',
        'The rib outline is a generic curved section drawn for this structure; it is not the symmetric shape of the wing experiment [S58].',
      ],
      [
        '翼盒模型里从机翼前部排到后部的板，见第 02 章第 1 拍。每一块都是机翼剖面的轮廓，上面开了减重孔。',
        '翼肋给机翼以翼型，并把翼梁和蒙皮连在一起 [S43]。模型里有三道；这个数目是绘图选择，不是任何真实机翼的数目 [S58]。',
        '翼肋的轮廓是为这个结构画的通用弯曲剖面，不是机翼实验里的对称形状 [S58]。',
      ],
    ),
  },
  'aileron-left': {
    name: t('Left aileron', '左副翼'),
    summary: t('Rolls the aircraft, moving opposite to the right one.', '与右副翼反向偏转，让飞机滚转。'),
    detail: p(
      [
        'A hinged surface near the outer back edge of the left wing. Chapter 04, beat 1 moves it.',
        'The two ailerons deflect in opposite directions, one up and one down, which rolls the aircraft into a bank [S5]. In the model each moves 12°, a design angle chosen to be visible [S58].',
        'Banking tilts the lift, and its sideways part curves the flight path [S5].',
      ],
      [
        '左翼外侧后缘一块可偏转的翼面。第 04 章第 1 拍让它动起来。',
        '两侧副翼朝相反方向偏转，一上一下，使飞机滚转、倾斜 [S5]。模型里每块偏 12°，这是为了看得清而选的设计角度 [S58]。',
        '倾斜使升力倾斜，升力的侧向部分让航迹弯曲 [S5]。',
      ],
    ),
  },
  'aileron-right': {
    name: t('Right aileron', '右副翼'),
    summary: t('Rolls the aircraft, moving opposite to the left one.', '与左副翼反向偏转，让飞机滚转。'),
    detail: p(
      [
        'A hinged surface near the outer back edge of the right wing. Chapter 04, beat 1 moves it the opposite way to the left aileron.',
        'Opposite aileron deflections roll the aircraft [S5]. The 12° on the model is a design angle, not a value from any aircraft [S58].',
        'Once banked, the aircraft’s lift has a sideways part that curves its path [S5].',
      ],
      [
        '右翼外侧后缘一块可偏转的翼面。第 04 章第 1 拍让它朝与左副翼相反的方向偏转。',
        '两侧副翼反向偏转使飞机滚转 [S5]。模型上的 12° 是设计角度，不取自任何飞机 [S58]。',
        '飞机倾斜以后，升力有了侧向部分，让航迹弯曲 [S5]。',
      ],
    ),
  },
  'spoiler-left': {
    name: t('Spoiler', '扰流板'),
    summary: t('Rises from the top of the wing to cut lift and add drag.', '从机翼上表面抬起，减升增阻。'),
    detail: p(
      [
        'A panel on the upper surface of the left wing, ahead of the flap; it rises in chapter 04’s last pose, independently of the flaps.',
        'Spoilers reduce lift and add drag; they are different from flaps [S8]. Only one panel is drawn, on the left wing, to keep the picture clear; this says nothing about how many a real wing has [S58].',
      ],
      [
        '左翼上表面、襟翼前方的一块板，在第 04 章最后一个姿态中抬起，与襟翼分开。',
        '扰流板减少升力、增加阻力，与襟翼不同 [S8]。为了画面清楚，只在左翼画了一块，这并不说明真实机翼上有几块 [S58]。',
      ],
    ),
  },
  'flap-left': {
    name: t('Left flap', '左襟翼'),
    summary: t('Slides back and down to help the wing at low speed.', '向后、向下伸出，帮助机翼低速飞行。'),
    detail: p(
      [
        'A movable surface on the inner trailing edge of the left wing. Chapter 04, beat 5 extends it.',
        'Flaps change the shape of the wing, and those that slide out also add area, so the wing gives more lift at lower speed; deployed flaps also add drag [S8]. In the model it slides back 0.04 m and turns down 20°, on a model ten times smaller than the design airliner [S58].',
        'Flaps are not spoilers: a raised spoiler cuts lift, while an extended flap lets the wing keep enough lift at a lower speed [S8].',
      ],
      [
        '左翼内侧后缘一块可以活动的翼面。第 04 章第 5 拍把它放出来。',
        '襟翼改变机翼形状，向外滑出的襟翼还增加面积，让机翼在较低速度下产生更多升力；放下的襟翼也增加阻力 [S8]。模型里它向后移 0.04 米、向下转 20°，这是在缩小十倍的模型上画的 [S58]。',
        '襟翼不是扰流板：扰流板抬起会减少升力，襟翼放出则让机翼在较低速度下仍有足够的升力 [S8]。',
      ],
    ),
  },
  'flap-right': {
    name: t('Right flap', '右襟翼'),
    summary: t('Slides back and down to help the wing at low speed.', '向后、向下伸出，帮助机翼低速飞行。'),
    detail: p(
      [
        'The movable surface on the inner trailing edge of the right wing, the mirror of the left flap. Chapter 04, beat 5 extends both together.',
        'Extended flaps let the wing give enough lift at a lower speed and add drag [S8]. The 0.04 m slide and 20° turn are design values for the model [S58].',
      ],
      [
        '右翼内侧后缘可以活动的翼面，与左襟翼对称。第 04 章第 5 拍把两侧一起放出来。',
        '放出的襟翼让机翼在较低速度下仍有足够的升力，同时增加阻力 [S8]。后移 0.04 米、下转 20° 是模型的设计值 [S58]。',
      ],
    ),
  },
  'slat-left': {
    name: t('Left slat', '左缝翼'),
    summary: t('Moves forward from the leading edge for low speed.', '从前缘向前伸出，帮助低速飞行。'),
    detail: p(
      [
        'A curved strip along the leading edge of the left wing. Chapter 04, beat 5 moves it forward, opening a narrow gap in front of the wing.',
        'Slats on the leading edge, like flaps on the trailing edge, change the wing so that it can fly more slowly [S8]. In the model it moves forward 0.025 m [S58].',
      ],
      [
        '沿左翼前缘的一条弯曲翼片。第 04 章第 5 拍让它向前伸出，在机翼前面留出一道窄缝。',
        '前缘缝翼和后缘襟翼一样，改变机翼，让飞机能飞得更慢 [S8]。模型里它向前移 0.025 米 [S58]。',
      ],
    ),
  },
  'slat-right': {
    name: t('Right slat', '右缝翼'),
    summary: t('Moves forward from the leading edge for low speed.', '从前缘向前伸出，帮助低速飞行。'),
    detail: p(
      [
        'The curved strip along the leading edge of the right wing, the mirror of the left slat. Chapter 04, beat 5 moves both forward.',
        'Leading-edge slats help the wing at lower speed [S8]; the 0.025 m movement is a design value for the model [S58].',
      ],
      [
        '沿右翼前缘的弯曲翼片，与左缝翼对称。第 04 章第 5 拍让两侧一起向前伸出。',
        '前缘缝翼帮助机翼低速飞行 [S8]；前移 0.025 米是模型的设计值 [S58]。',
      ],
    ),
  },
  'tailplane-left': {
    name: t('Left tailplane', '左水平尾翼'),
    short: t('L. tailplane', '左平尾'),
    summary: t('Horizontal tail surface that carries the left elevator.', '承载左升降舵的水平尾面。'),
    detail: p(
      [
        'The left half of the horizontal tail, at the back of the fuselage. The left elevator is hinged to its back edge; see chapter 04, beat 2.',
        'This airliner has a conventional rear tail, with the elevator on the horizontal tail; the Wright brothers’ first aircraft had its elevator in front instead [S6].',
      ],
      [
        '水平尾翼的左半边，在机身后部。左升降舵铰接在它的后缘，见第 04 章第 2 拍。',
        '这架客机是常规的后置尾翼，升降舵装在水平尾翼上；莱特兄弟的第一架飞机则把升降舵装在前面 [S6]。',
      ],
    ),
  },
  'tailplane-right': {
    name: t('Right tailplane', '右水平尾翼'),
    short: t('R. tailplane', '右平尾'),
    summary: t('Horizontal tail surface that carries the right elevator.', '承载右升降舵的水平尾面。'),
    detail: p(
      [
        'The right half of the horizontal tail, the mirror of the left. The right elevator is hinged to its back edge; see chapter 04, beat 2.',
        'On a conventional tail the elevator is part of the horizontal tail [S6]. The shape is a generic design [S58].',
      ],
      [
        '水平尾翼的右半边，与左半边对称。右升降舵铰接在它的后缘，见第 04 章第 2 拍。',
        '常规尾翼的升降舵是水平尾翼的一部分 [S6]。外形是通用设计 [S58]。',
      ],
    ),
  },
  'elevator-left': {
    name: t('Left elevator', '左升降舵'),
    summary: t('Pitches the nose up or down.', '让机头向上或向下转。'),
    detail: p(
      [
        'The hinged back part of the left tailplane. Chapter 04, beat 2 raises both elevators.',
        'The elevator is a hinged part of the horizontal tail and changes the aircraft’s pitch, turning the nose up or down [S6]. On the model it moves 10° up, a design angle [S58].',
      ],
      [
        '左水平尾翼后部可以偏转的部分。第 04 章第 2 拍让两侧升降舵一起上偏。',
        '升降舵是水平尾翼上可偏转的部分，改变飞机的俯仰，让机头向上或向下转 [S6]。模型上它上偏 10°，这是设计角度 [S58]。',
      ],
    ),
  },
  'elevator-right': {
    name: t('Right elevator', '右升降舵'),
    summary: t('Pitches the nose up or down.', '让机头向上或向下转。'),
    detail: p(
      [
        'The hinged back part of the right tailplane, moving together with the left elevator in chapter 04, beat 2.',
        'The elevators change pitch [S6]; the 10° on the model is a design angle, not a value from any aircraft [S58].',
      ],
      [
        '右水平尾翼后部可以偏转的部分，第 04 章第 2 拍和左升降舵一起动。',
        '升降舵改变俯仰 [S6]；模型上的 10° 是设计角度，不取自任何飞机 [S58]。',
      ],
    ),
  },
  fin: {
    name: t('Vertical fin', '垂直尾翼'),
    summary: t('Upright tail surface that carries the rudder.', '承载方向舵的竖直尾面。'),
    detail: p(
      [
        'The upright surface at the back of the fuselage. The rudder is hinged to its back edge; it appears with the rudder in chapter 04, beat 3, and on the airliner in the background chapter.',
        'The rudder hinged to the vertical tail controls yaw [S7]. The fin’s shape is a generic design [S58].',
      ],
      [
        '机身后部竖立的尾面。方向舵铰接在它的后缘；第 04 章第 3 拍和方向舵一起出现，背景章的客机上也能看到。',
        '铰接在垂直尾翼上的方向舵控制偏航 [S7]。垂直尾翼的外形是通用设计 [S58]。',
      ],
    ),
  },
  rudder: {
    name: t('Rudder', '方向舵'),
    summary: t('Yaws the nose left or right.', '让机头向左或向右偏。'),
    detail: p(
      [
        'The hinged back part of the vertical fin. Chapter 04, beat 3 turns it.',
        'The rudder controls yaw, turning the nose left or right; in a coordinated turn it helps keep the aircraft lined up with its curving path [S7]. On the model it turns 10°, a design angle [S58].',
        'The turn itself comes mainly from banking, which tilts the lift [S5].',
      ],
      [
        '垂直尾翼后部可以偏转的部分。第 04 章第 3 拍让它偏转。',
        '方向舵控制偏航，让机头向左或向右偏；协调转弯时，它帮助飞机对准弯曲的航迹 [S7]。模型上它偏 10°，这是设计角度 [S58]。',
        '转弯本身主要靠倾斜，让升力倾斜 [S5]。',
      ],
    ),
  },
  'nacelle-left': {
    name: t('Left nacelle', '左发动机舱'),
    summary: t('Encloses the left engine and its fan.', '包住左发动机和它的风扇。'),
    detail: p(
      [
        'The streamlined casing of the left engine, hung below the left wing. Seen on the airliner throughout; chapter 01, beat 4 hides both engines for the glider comparison.',
        'The engines supply the thrust, while the wings provide most of the lift [S1]. What is inside an engine like this is shown in the separate cutaway of chapter 05 [S9].',
        'Higher up the air is thinner, but the engines still need enough of it: the thrust available is one of the limits on how high an aircraft cruises [S12].',
      ],
      [
        '左发动机流线形的外罩，挂在左翼下面。客机出现时都能看到；第 01 章第 4 拍为了和滑翔机对照，把两台发动机都藏了起来。',
        '发动机提供推力，大部分升力来自机翼 [S1]。这类发动机里面是什么样，见第 05 章单独的剖面模型 [S9]。',
        '越往高处空气越稀薄，但发动机仍然需要足够的空气：可用推力是限制巡航高度的因素之一 [S12]。',
      ],
    ),
  },
  'nacelle-right': {
    name: t('Right nacelle', '右发动机舱'),
    summary: t('Encloses the right engine and its fan.', '包住右发动机和它的风扇。'),
    detail: p(
      [
        'The casing of the right engine, below the right wing. In chapter 03, beat 5 it stands beside the wing experiment, its fan still turning while the wing section stalls.',
        'A wing stall concerns the airflow over the wing and its lift, not an engine stopping [S3]. The engine supplies thrust [S1].',
      ],
      [
        '右发动机的外罩，在右翼下面。第 03 章第 5 拍里它出现在机翼实验旁边：翼段失速时，它的风扇照样在转。',
        '机翼失速说的是机翼上方的气流和升力，不是发动机停转 [S3]。发动机提供推力 [S1]。',
      ],
    ),
  },
  'fan-left': {
    name: t('Left fan', '左风扇'),
    summary: t('Turns at the front of the left engine, moving air back.', '在左发动机前端转动，把空气推向后方。'),
    detail: p(
      [
        'The fan at the front of the left engine, seen through the intake whenever the airliner runs.',
        'In a turbofan the front fan feeds air both into the core and around it, and both streams help to produce thrust [S9]. It turns at 30 rpm on screen, slowed down for reading; this is not a real engine speed [S58].',
      ],
      [
        '左发动机前端的风扇，客机运转时从进气口能看到。',
        '涡扇发动机前方的风扇把空气送进核心，也送到核心外面绕过去，两股气流都帮助产生推力 [S9]。画面里它每分钟转 30 转，是为了看得清而放慢的，不是真实转速 [S58]。',
      ],
    ),
  },
  'fan-right': {
    name: t('Right fan', '右风扇'),
    summary: t('Turns at the front of the right engine, moving air back.', '在右发动机前端转动，把空气推向后方。'),
    detail: p(
      [
        'The fan at the front of the right engine. In chapter 03, beat 5 it keeps turning beside the stalled wing section: a stall is about airflow and lift, not about the engine [S3].',
        'The fan sends air into and around the core [S9]. It turns at 30 rpm on screen, slowed down for reading [S58].',
      ],
      [
        '右发动机前端的风扇。第 03 章第 5 拍里，它在失速的翼段旁边照样转动：失速说的是气流和升力，与发动机无关 [S3]。',
        '风扇把空气送进核心，也送到核心外面 [S9]。画面里每分钟转 30 转，是为了看得清而放慢的 [S58]。',
      ],
    ),
  },
  'engine-shell': {
    name: t('Engine case', '发动机外壳'),
    summary: t('Surrounds the fan and the outer air stream.', '围住风扇和外圈气流。'),
    detail: p(
      [
        'The outer casing of the separate turbofan cutaway, seen in chapter 05 and in beat 3 of the background chapter. The half facing you is cut away so the inside shows; the fixed guide vanes behind the fan belong to it.',
        'Air enters through the inlet at the front, and the fan splits it between the core and the bypass stream around it [S9]. The cutaway is drawn for structure; its size has no common scale with the airliner [S58].',
      ],
      [
        '独立涡扇剖面模型的外壳，见第 05 章和背景章第 3 拍。朝向你的一半被剖掉，露出里面；风扇后面固定不动的导向叶片也属于它。',
        '空气从前方的进气口进入，风扇把它分成穿过核心的一股和绕过核心的外涵气流 [S9]。这个剖面只用来说明结构，尺寸与客机没有共同比例尺 [S58]。',
      ],
    ),
  },
  'fan-disc': {
    name: t('Fan', '风扇'),
    summary: t('Pushes air into both the bypass and the core.', '把空气推进外涵和核心两路。'),
    detail: p(
      [
        'The large bladed disc at the front of the turbofan cutaway, chapter 05 and background beat 3. It is fixed to the fan shaft and turns with the fan turbine at the back.',
        'The fan draws air in and sends part of it through the core and part around it; the fan-driven bypass air contributes thrust [S9]. In this two-spool example the fan turbine drives it through the inner shaft [S9]. It turns at 30 rpm on screen, slowed down; the number of blades is a drawing choice [S58].',
      ],
      [
        '涡扇剖面模型前方带叶片的大圆盘，见第 05 章和背景章第 3 拍。它固定在风扇轴上，和后部的风扇涡轮一起转。',
        '风扇把空气吸进来，一部分送进核心，一部分绕过核心；风扇推动的外涵空气也产生推力 [S9]。在这个两转子例子里，风扇涡轮经内轴带动它 [S9]。画面里每分钟转 30 转，已放慢；叶片数是绘图选择 [S58]。',
      ],
    ),
  },
  'bypass-duct': {
    name: t('Bypass duct', '外涵道'),
    summary: t('Guides the outer air stream around the core.', '引导外圈气流绕过核心。'),
    detail: p(
      [
        'The ring-shaped channel between the core and the engine case, chapter 05, beat 2. Air pushed by the outer part of the fan flows through it.',
        'Bypass air goes around the combustor and turbines and never passes through them; it leaves through the bypass outlet and adds to the thrust [S9].',
        'Engineers compare the two streams with the bypass ratio, a ratio of air mass flows; the dots on the stage show the route, not the amount [S9, S58].',
      ],
      [
        '核心与发动机外壳之间的环形通道，见第 05 章第 2 拍。风扇外圈推动的空气从这里流过。',
        '外涵空气绕过燃烧室和涡轮，从不穿过它们；它从外涵出口排出，也贡献推力 [S9]。',
        '工程师用涵道比比较两股气流，那是空气质量流量之比；舞台上的点只表示路线，不表示流量 [S9, S58]。',
      ],
    ),
  },
  'compressor-bank': {
    name: t('Compressor stators', '压气机静子'),
    short: t('Comp. stators', '压气机静子'),
    summary: t('Fixed blade rows that guide air through the compressor.', '固定叶排，引导空气穿过压气机。'),
    detail: p(
      [
        'The fixed rows of blades between the compressor’s rotating rows, chapter 05, beats 2 and 3. They hang from the core casing and do not turn.',
        'In the core, the air is compressed before fuel is added and burned [S9]. The rotating compressor blades do the squeezing; these fixed rows between them guide the air. The number of rows is a drawing choice, not a real stage count [S58].',
      ],
      [
        '压气机转动叶排之间固定的叶排，见第 05 章第 2、3 拍。它们装在核心机匣上，不转。',
        '在核心里，空气先被压缩，然后才加入燃料燃烧 [S9]。压缩靠转动的压气机叶片；夹在中间的这些固定叶排负责引导气流。叶排数是绘图选择，不是真实级数 [S58]。',
      ],
    ),
  },
  'compressor-rotor': {
    name: t('Compressor rotor', '压气机转子'),
    short: t('Comp. rotor', '压气机转子'),
    summary: t('Rotating blades that squeeze the core air.', '转动的叶片，压缩核心气流。'),
    detail: p(
      [
        'The rotating blade rows of the compressor, chapter 05, beat 3. They are fixed to the hollow core shaft.',
        'The core turbine drives the compressor through a shaft [S9]. Here it turns with the core shaft and core turbine at 45 rpm on screen, faster than the fan spool but slowed down for reading [S58].',
        'The order inside the core is fixed: compress first, then burn, then the turbines [S9].',
      ],
      [
        '压气机转动的叶排，见第 05 章第 3 拍。它们固定在空心的核心轴上。',
        '核心涡轮经轴带动压气机 [S9]。在这里它和核心轴、核心涡轮一起，画面上每分钟转 45 转，比风扇转子快，但仍是放慢的 [S58]。',
        '核心里的顺序是固定的：先压缩，再燃烧，然后经过涡轮 [S9]。',
      ],
    ),
  },
  'combustor-ring': {
    name: t('Combustor', '燃烧室'),
    summary: t('Burns fuel in the compressed air.', '在压缩后的空气里燃烧燃料。'),
    detail: p(
      [
        'The ring-shaped chamber between the compressor and the turbines, chapter 05, beat 3, and background beat 3. The shafts pass through the hole in its middle.',
        'Fuel is added to the compressed air and burned here; the hot gas then flows through the turbines and towards the nozzle [S9]. The bypass air never passes through it [S9].',
        'The model draws no flame outside the engine; the colour of the hot-gas dots marks hot gas, not a temperature scale [S58].',
      ],
      [
        '压气机和涡轮之间的环形腔，见第 05 章第 3 拍和背景章第 3 拍。两根轴从它中间的孔穿过。',
        '燃料加进压缩后的空气，在这里燃烧；热气随后流过涡轮，流向喷口 [S9]。外涵空气从不经过这里 [S9]。',
        '模型不在发动机外面画火焰；热气点的颜色只表示热气，不是温度刻度 [S58]。',
      ],
    ),
  },
  'turbine-bank': {
    name: t('Turbine stators', '涡轮静子'),
    short: t('Turb. stators', '涡轮静子'),
    summary: t('Fixed blade rows that guide hot gas onto the turbines.', '固定叶排，把热气引向涡轮。'),
    detail: p(
      [
        'The fixed blade rows between the turbines’ rotating rows, chapter 05, beats 3 and 4, and background beat 3. They hang from the core casing and do not turn.',
        'After the combustor, the hot gas passes through the turbines, which take energy from it to drive the compressor and fan [S9]. These fixed rows guide the gas between the rotating ones. Row counts are a drawing choice [S58].',
      ],
      [
        '涡轮转动叶排之间固定的叶排，见第 05 章第 3、4 拍和背景章第 3 拍。它们装在核心机匣上，不转。',
        '热气离开燃烧室后流过涡轮，涡轮从中取出能量，带动压气机和风扇 [S9]。这些固定叶排在转动的叶排之间引导气流。叶排数是绘图选择 [S58]。',
      ],
    ),
  },
  'hp-turbine-rotor': {
    name: t('Core turbine', '核心涡轮转子'),
    summary: t('Turns in the hot gas and drives the compressor.', '在热气中转动，带动压气机。'),
    detail: p(
      [
        'The first rotating turbine, just behind the combustor, chapter 05, beat 4. It is fixed to the hollow core shaft.',
        'Turbines take energy from the hot gas and drive the compressor through a shaft [S9]. This one turns with the compressor rotor at 45 rpm on screen, slowed down [S58].',
      ],
      [
        '紧接在燃烧室后面的第一个转动涡轮，见第 05 章第 4 拍。它固定在空心的核心轴上。',
        '涡轮从热气中取出能量，经轴带动压气机 [S9]。它和压气机转子一起，画面上每分钟转 45 转，已放慢 [S58]。',
      ],
    ),
  },
  'lp-turbine-rotor': {
    name: t('Fan turbine', '风扇涡轮转子'),
    summary: t('Turns in the hot gas and drives the fan.', '在热气中转动，带动风扇。'),
    detail: p(
      [
        'The rotating turbine rows behind the core turbine, chapter 05, beat 4. They are fixed to the inner fan shaft.',
        'In the two-spool example, the fan is driven through a shaft that runs inside the core shaft [S9]. This turbine turns with the fan at 30 rpm on screen, slowed down [S58]. Other engines can have more spools [S9].',
      ],
      [
        '核心涡轮后面转动的涡轮叶排，见第 05 章第 4 拍。它们固定在里面的风扇轴上。',
        '在两转子例子里，带动风扇的轴从核心轴内部穿过 [S9]。这个涡轮和风扇一起，画面上每分钟转 30 转，已放慢 [S58]。其他发动机可能有更多转子 [S9]。',
      ],
    ),
  },
  'lp-shaft': {
    name: t('Fan shaft', '风扇轴'),
    summary: t('Inner shaft carrying work from the fan turbine to the fan.', '内轴，把风扇涡轮的功传给风扇。'),
    detail: p(
      [
        'The inner shaft of the turbofan cutaway, chapter 05, beat 4. It runs the whole length of the core, from the fan at the front to the fan turbine at the back.',
        'In this two-spool example the fan shaft runs inside the hollow core shaft [S9]. A shaft carries turning work, not air. It turns at 30 rpm on screen, slowed down [S58].',
      ],
      [
        '涡扇剖面模型里的内轴，见第 05 章第 4 拍。它贯穿整个核心，从前面的风扇一直通到后面的风扇涡轮。',
        '在这个两转子例子里，风扇轴从空心的核心轴里面穿过 [S9]。轴传递的是转动的功，不是空气。画面上每分钟转 30 转，已放慢 [S58]。',
      ],
    ),
  },
  'hp-shaft': {
    name: t('Core shaft', '核心轴'),
    summary: t('Hollow shaft carrying work from core turbine to compressor.', '空心轴，把核心涡轮的功传给压气机。'),
    detail: p(
      [
        'The hollow outer shaft of the turbofan cutaway, chapter 05, beat 4. It joins the core turbine to the compressor rotor, and the fan shaft runs through its middle with a small gap.',
        'Turbines drive the compressor through shafts; in the two-spool example the core shaft surrounds the fan shaft [S9]. The two spools turn separately: 45 rpm here against 30 rpm for the fan, both slowed down for reading [S58].',
      ],
      [
        '涡扇剖面模型里空心的外轴，见第 05 章第 4 拍。它把核心涡轮和压气机转子连起来，风扇轴从它中间穿过，两者之间留有间隙。',
        '涡轮经轴带动压气机；在两转子例子里，核心轴套在风扇轴外面 [S9]。两个转子各转各的：这里每分钟 45 转，风扇是 30 转，都已为便于观看而放慢 [S58]。',
      ],
    ),
  },
  'core-nozzle': {
    name: t('Core nozzle', '核心喷口'),
    summary: t('Lets the hot core stream out at the back.', '让核心热气从后方排出。'),
    detail: p(
      [
        'The narrowing exit at the back of the core, chapter 05, beat 5, with a cone in its middle behind the end of the shafts.',
        'After the turbines, the hot gas leaves through the nozzle, and the core exhaust contributes to thrust together with the bypass air [S9]. The shape is a generic drawing [S58].',
      ],
      [
        '核心后部逐渐收窄的出口，见第 05 章第 5 拍；中间有一个锥体，位于两根轴的末端后面。',
        '热气流过涡轮后从喷口排出，核心排气和外涵空气一起贡献推力 [S9]。外形是通用画法 [S58]。',
      ],
    ),
  },
  'bypass-nozzle': {
    name: t('Bypass outlet', '外涵出口'),
    summary: t('Lets the outer bypass stream out.', '让外圈的外涵气流排出。'),
    detail: p(
      [
        'The ring-shaped exit at the back of the bypass duct, chapter 05, beat 5.',
        'The bypass air pushed by the fan leaves here and adds to the thrust; it has not passed through the combustor or turbines [S9]. The shape is a generic drawing [S58].',
      ],
      [
        '外涵道后部的环形出口，见第 05 章第 5 拍。',
        '风扇推动的外涵空气从这里排出，贡献推力；它没有经过燃烧室和涡轮 [S9]。外形是通用画法 [S58]。',
      ],
    ),
  },
  'foil-sample': {
    name: t('Airfoil', '翼型'),
    summary: t('The wing section the model calculates airflow around.', '模型为它计算周围气流的翼段。'),
    detail: p(
      [
        'The wing experiment, a short slice of wing beside the airliner, in chapters 02, 03 and 06 and the background chapter. Its cross-section is a symmetric Joukowski airfoil, a shape made by a mathematical mapping of a circle [S57]; it turns about a point a quarter of the way back from its front edge as the angle of attack changes.',
        'Design values: chord 1 m, reference area 2 m², the 0.12 m thickness on the stage only a slice of it [S58]. Up to 12° the model uses ideal attached flow; beyond that a teaching rule takes over and the stage shows separation as a dashed diagram [S58]. At 4° and 40 m/s near sea level, in this simulation, lift is about 924 N [S58].',
        'It is not the wing of any real aircraft, and its readings are simulation results, not measurements [S58]. In ideal flow a symmetric section has no lift at zero angle of attack but does at other angles [S3]. The way it is shown, with streamlines, surface pressure and a lift curve, follows NASA’s student airfoil program, but none of its code is used [S10].',
      ],
      [
        '机翼实验：客机旁边的一小段机翼，见第 02、03、06 章和背景章。它的剖面是对称的茹科夫斯基翼型，是把一个圆经过数学映射得到的形状 [S57]；迎角改变时，它绕着离前缘四分之一弦长的点转动。',
        '设计值：弦长 1 米，参考面积 2 平方米；舞台上 0.12 米的厚度只是截取的一段 [S58]。12° 以内模型用附着的理想流；超过 12° 改用教学规则，舞台用虚线画出分离示意 [S58]。在这个模拟里，迎角 4°、速度 40 米每秒、接近海平面时，升力约 924 牛 [S58]。',
        '它不是任何真实飞机的机翼，读数是模拟结果，不是测量值 [S58]。在理想流里，对称翼型零迎角时没有升力，其他迎角时有 [S3]。用流线、表面气压和升力曲线来展示的做法，参照了 NASA 的学生翼型程序，但没有用它的任何代码 [S10]。',
      ],
    ),
  },
  'chord-marker': {
    name: t('Chord', '翼弦'),
    summary: t('Straight line used to measure the angle of attack.', '用来量迎角的直线。'),
    detail: p(
      [
        'The thin line from the front edge of the airfoil to its back edge, in chapters 02, 03 and 06. It turns with the section.',
        'The chord is the straight line joining the leading and trailing edges [S13]. The angle of attack is measured between the chord and the incoming air [S3]. In the model the chord is 1 m long [S58].',
      ],
      [
        '从翼型前缘连到后缘的细线，见第 02、03、06 章。它跟着翼段一起转。',
        '翼弦是连接前缘和后缘的直线 [S13]。迎角就是翼弦与来流之间的角 [S3]。模型里的翼弦长 1 米 [S58]。',
      ],
    ),
  },
  'inflow-reference': {
    name: t('Incoming air', '来流'),
    summary: t('Fixed line showing the direction of the oncoming air.', '固定的线，表示迎面来流的方向。'),
    detail: p(
      [
        'The fixed line in front of the airfoil, showing the direction of the air flowing towards it, in chapters 01, 02, 03 and 06. Unlike the chord, it never turns.',
        'Lift acts across the incoming air and drag along it [S1, S2]; the angle of attack is measured from this direction, not from the horizon [S3].',
      ],
      [
        '翼型前面固定不动的线，表示流向翼型的空气的方向，见第 01、02、03、06 章。它不像翼弦那样会转。',
        '升力垂直于来流，阻力沿着来流 [S1, S2]；迎角从这个方向量起，而不是从地平线量起 [S3]。',
      ],
    ),
  },
  'angle-marker': {
    name: t('Angle', '迎角'),
    summary: t('Marks where the angle of attack is measured.', '标出迎角在哪里量。'),
    detail: p(
      [
        'A small marker at the point a quarter of the way back along the chord, where the arc of the angle of attack is drawn, chapter 03.',
        'The arc runs from the incoming-air direction to the chord, and its size is the angle of attack [S3]. The model allows angles from −20° to 20° in steps of 4° [S58]; at zero angle no arc is drawn.',
      ],
      [
        '翼弦上离前缘四分之一处的小标记，迎角的弧就画在这里，见第 03 章。',
        '弧从来流方向画到翼弦，它的大小就是迎角 [S3]。模型的迎角范围是 −20° 到 20°，每档 4° [S58]；迎角为零时不画弧。',
      ],
    ),
  },
  'display-plinth': {
    name: t('Display stand', '展台'),
    summary: t('Holds the wing experiment in place.', '托住机翼实验件。'),
    detail: p(
      [
        'A plain stand that holds the wing experiment, like a museum exhibit. It is scenery, not part of any aircraft, and is shown only with the experiment.',
        'It is not to scale with the airliner or the engine, and it does not touch the airflow the model calculates [S58].',
      ],
      [
        '一个朴素的展台，像博物馆展品那样托住机翼实验件。它是场景，不属于任何飞机，只和实验件一起出现。',
        '它和客机、发动机不按同一比例，也不影响模型计算的气流 [S58]。',
      ],
    ),
  },
};
