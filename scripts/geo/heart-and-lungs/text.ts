/**
 * Texts of the heart-and-lungs parts.json (docs/40 §3): part names, summaries
 * (≤ 60 characters, also the leader-label line) and details with [S#] cites,
 * group names, preset labels, spec rows and telemetry. Sources: data/sources.json.
 * Main-line words follow the P5 syllabus (S1); names it does not ask for are
 * marked "further" and say so.
 */
type T = { en: string; zh: string };
const t = (en: string, zh: string): T => ({ en, zh });

export interface PartText {
  name: T;
  short?: T;
  chainName?: T;
  summary: T;
  detail: T;
}

export const PART_TEXT: Record<string, PartText> = {
  'nasal-cavity': {
    name: t('Nose (nasal cavity)', '鼻（鼻腔）'),
    short: t('Nose', '鼻'),
    chainName: t('Nose', '鼻'),
    summary: t('Air comes in here; it is warmed, moistened and cleaned.', '空气从这里进来，被加温、加湿、清洁。'),
    detail: t(
      'Air comes in through the two nostrils into the nasal cavity, the space behind the nose. Its lining warms and moistens the air and removes dust and germs [S2]; hairs and mucus in the nose trap small particles such as dust [S40].\n\nThis mesh is the lining of the nasal cavity of the adult reference body; the outside of the nose belongs to the body outline. In this model the dots of air follow a drawn path through it, not a measured airflow [S37].',
      '空气从两个鼻孔进入鼻腔，也就是鼻子后面的空间。鼻腔的内壁把空气加温、加湿，并清除灰尘和病菌 [S2]；鼻子里的毛和黏液能粘住灰尘这类小颗粒 [S40]。\n\n这个网格是成年参考身体鼻腔的内壁；鼻子的外形属于身体轮廓。在这个模型里，空气的点沿着一条画出来的路线穿过鼻腔，不是测量出来的气流 [S37]。',
    ),
  },
  pharynx: {
    name: t('Throat (pharynx)', '喉咙（咽）'),
    short: t('Throat', '咽'),
    chainName: t('Throat', '咽'),
    summary: t('A passage shared by air and food.', '空气和食物共用的通道。'),
    detail: t(
      'The throat runs down from the back of the nose and the mouth. Its middle part is a passageway for both air and food; at its lower end the two routes divide: air goes on into the windpipe, food into the gullet behind it [S2].\n\nSwallowing is told in the topic on the digestive system.',
      '咽从鼻腔和口腔的后面往下延伸。它的中段是空气和食物共用的通道；到了下端，两条路分开：空气进入气管，食物进入后面的食道 [S2]。\n\n吞咽在消化系统那个主题里讲。',
    ),
  },
  epiglottis: {
    name: t('Epiglottis · further', '会厌 · 再进一步'),
    short: t('Epiglottis', '会厌'),
    summary: t('A flap that closes the windpipe when you swallow.', '吞咽时盖住气管入口的一小片。'),
    detail: t(
      'A leaf-shaped flap of cartilage at the top of the larynx. When you swallow, it swings down and closes the opening to the windpipe, so food and drink do not go into it [S2].\n\nThe syllabus does not ask for this name [S1].',
      '喉顶上一片叶子形的软骨。吞咽时，它往下盖住气管的入口，食物和饮料就不会进入气管 [S2]。\n\n课纲不要求这个名称 [S1]。',
    ),
  },
  larynx: {
    name: t('Larynx · further', '喉 · 再进一步'),
    short: t('Larynx', '喉'),
    summary: t('Joins the throat to the windpipe; made of cartilage.', '连接咽和气管，由软骨构成。'),
    detail: t(
      'The larynx joins the throat to the windpipe and is built of pieces of cartilage [S2]. This model has two of them: the thyroid cartilage at the front and the ring-shaped cricoid cartilage below it [S33].\n\nThe syllabus does not ask for this name [S1].',
      '喉连接咽和气管，由几块软骨构成 [S2]。这个模型画了其中两块：前面的甲状软骨，和下面环形的环状软骨 [S33]。\n\n课纲不要求这个名称 [S1]。',
    ),
  },
  trachea: {
    name: t('Windpipe (trachea)', '气管'),
    short: t('Windpipe', '气管'),
    chainName: t('Windpipe', '气管'),
    summary: t('Carries air down to the lungs; rings keep it open.', '把空气送到肺；软骨环让它保持张开。'),
    detail: t(
      'A tube in the neck and upper chest that lies in front of the gullet [S40]. Sixteen to twenty C-shaped pieces of cartilage, stacked one above another, keep it open [S2]. At its lower end it divides into two tubes, one to each lung [S2].\n\nIn an adult it is about 10 to 12 cm long [S40]; this mesh measures about 10.5 cm [S37].',
      '气管是脖子和胸腔上部的一条管子，在食道前面 [S40]。十六到二十块 C 形的软骨一块叠一块，让它一直张开 [S2]。气管下端分成两条管，分别通到两个肺 [S2]。\n\n成年人的气管长约 10 到 12 厘米 [S40]；这个网格量得约 10.5 厘米 [S37]。',
    ),
  },
  'lung-right': {
    name: t('Right lung', '右肺'),
    chainName: t('R. lung', '右肺'),
    summary: t('Oxygen enters the blood here; carbon dioxide leaves.', '氧气在这里进入血液，二氧化碳离开血液。'),
    detail: t(
      "One of the two lungs that fill most of the chest on each side of the heart. It is on the body's right, which is your left when the body faces you, and has three lobes [S2]. Air reaches it through the windpipe; blood reaches it through blood vessels from the heart. In the lungs the blood picks up oxygen and gives up carbon dioxide [S2].\n\nThe lungs do not move by themselves: they follow the chest as it gets bigger and smaller [S2]. Some air always stays in them, even after breathing out hard [S2]. In this model the lungs swell more than in quiet breathing, so that you can see it [S37].",
      '两个肺之一，占满心脏两边胸腔的大部分空间。它在身体的右边，身体面向你时就在你的左边，分成三叶 [S2]。空气经过气管来到肺，血液经过从心脏来的血管来到肺。在肺里，血液得到氧气，交出二氧化碳 [S2]。\n\n肺自己不会动：胸腔变大、变小，肺就跟着变大、变小 [S2]。即使用力呼气，肺里也总留着一些空气 [S2]。在这个模型里，肺的胀缩比平静呼吸时明显，好让你看得出来 [S37]。',
    ),
  },
  'lung-left': {
    name: t('Left lung', '左肺'),
    chainName: t('L. lung', '左肺'),
    summary: t('Smaller than the right lung; it leaves room for the heart.', '比右肺小，给心脏留出位置。'),
    detail: t(
      'The left lung has two lobes and is smaller than the right; a notch in its inner side leaves space for the heart [S2]. Like the right lung, it takes oxygen into the blood and lets carbon dioxide out [S2].\n\nTogether the two lungs of this adult mesh are about 26 cm across and 26 cm tall [S37].',
      '左肺分成两叶，比右肺小；它的内侧有一个凹口，给心脏留出空间 [S2]。和右肺一样，它让氧气进入血液，让二氧化碳离开 [S2]。\n\n这个成人网格的两个肺合起来约 26 厘米宽、26 厘米高 [S37]。',
    ),
  },
  bronchi: {
    name: t('Air tubes (bronchi) · further', '支气管 · 再进一步'),
    short: t('Air tubes', '支气管'),
    summary: t('Branches of the windpipe that carry air into the lungs.', '气管的分支，把空气送进肺里。'),
    detail: t(
      'The windpipe divides into a right and a left tube, and inside the lungs these branch again and again into smaller and smaller tubes [S2]. This model shows the first few branches, 28 tubes from the Z-Anatomy model [S33]; beyond them the tubes are too fine to draw.\n\nThe syllabus does not ask for the name bronchi [S1].',
      '气管分成左右两条管，进入肺以后又一次次分支，越分越细 [S2]。这个模型只画了最初几级分支，取自 Z-Anatomy 模型的 28 段管 [S33]；再往下的管太细，没有画。\n\n课纲不要求“支气管”这个名称 [S1]。',
    ),
  },
  diaphragm: {
    name: t('Diaphragm · further', '膈 · 再进一步'),
    short: t('Diaphragm', '膈'),
    summary: t('A dome of muscle under the lungs; moves down to breathe in.', '肺下面圆顶形的肌肉；往下移时吸气。'),
    detail: t(
      'A dome-shaped sheet of muscle between the chest and the belly. When it contracts it moves down, the chest gets bigger and air flows in; when it relaxes it moves back up [S2].\n\nIn this model it moves down 2.5 cm, more than in quiet breathing, so that you can see it [S37]. The syllabus does not use the word diaphragm [S1].',
      '膈是胸腔和腹腔之间一片圆顶形的肌肉。它收缩时往下移，胸腔变大，空气就流进来；它放松时又往上移 [S2]。\n\n在这个模型里，膈往下移 2.5 厘米，比平静呼吸时明显，好让你看得出来 [S37]。课纲没有用“膈”这个词 [S1]。',
    ),
  },
  ribcage: {
    name: t('Ribs and breastbone', '肋骨与胸骨'),
    short: t('Ribs', '肋骨'),
    summary: t('Protect the heart and lungs; move up and out to breathe in.', '保护心和肺；吸气时往上、往外移。'),
    detail: t(
      'The 24 ribs of this model, joined at the front to the breastbone by cartilage, make a cage round the heart and lungs [S33]. When you breathe in, muscles between the ribs move them up and out, so the chest gets wider [S2].\n\nIn this model the ribcage widens more than in quiet breathing [S37]. The syllabus does not ask for the names of the bones [S1].',
      '这个模型的 24 根肋骨，前端由软骨连到胸骨，围成一个笼子，护住心和肺 [S33]。吸气时，肋骨之间的肌肉把肋骨往上、往外拉，胸腔就变宽 [S2]。\n\n在这个模型里，肋骨的移动比平静呼吸时明显 [S37]。课纲不要求骨头的名称 [S1]。',
    ),
  },
  heart: {
    name: t('Heart', '心脏'),
    chainName: t('Heart', '心脏'),
    summary: t('A pump made of muscle; each beat pushes blood out.', '由肌肉构成的泵；每跳一下就把血挤出去。'),
    detail: t(
      "The heart sits in the middle of the chest, between the lungs, with its tip just to the left of the breastbone [S2]. It is about the size of its owner's fist; an adult heart is about 12 cm long, 8 cm wide and 6 cm thick [S2]. Its wall is mostly muscle, and as the muscle contracts it pumps blood into the large blood vessels [S2].\n\nAt rest an adult heart pumps about 5.25 litres of blood a minute [S2]. The heart does not make blood: blood cells are made in the red bone marrow [S2]. In this model the heart beats at the pace on the try-it card in chapter 5 [S37].",
      '心脏在胸腔正中、两肺之间，尖端就在胸骨左边一点 [S2]。它大约有主人的拳头那么大；成年人的心脏约 12 厘米长、8 厘米宽、6 厘米厚 [S2]。心壁大部分是肌肉，肌肉收缩，就把血泵进大血管 [S2]。\n\n成年人休息时，心脏每分钟约泵出 5.25 升血 [S2]。心脏不造血：血细胞是在红骨髓里生成的 [S2]。在这个模型里，心脏按第 5 章试一试卡片上的快慢跳动 [S37]。',
    ),
  },
  'great-vessels': {
    name: t('Large blood vessels', '大血管'),
    short: t('Large vessels', '大血管'),
    chainName: t('Large', '大血管'),
    summary: t('The thickest blood vessels, next to the heart.', '心脏旁边最粗的几条血管。'),
    detail: t(
      'The largest blood vessels, joined to the top of the heart: the main vessel that carries blood out of the heart, arching over it and running down the body, and the two large vessels that bring blood back to the heart from above and from below [S2]. Branches from them reach the head, the arms, the belly and the legs.\n\nIn this model every blood vessel is drawn in the same neutral colour; the dots inside show whether the blood has much or little oxygen [S37].',
      '和心脏顶部相连的几条最大的血管：一条把血从心脏运出去，在心脏上方拱成弓形，再沿身体往下；另外两条把上半身和下半身的血运回心脏 [S2]。从它们分出去的血管通到头、手臂、腹部和腿。\n\n在这个模型里，所有血管都画成同一种中性的颜色；血管里的点才表示血含氧多还是含氧少 [S37]。',
    ),
  },
  'lung-vessels': {
    name: t('Blood vessels of the lungs', '往返肺的血管'),
    short: t('Lung vessels', '肺的血管'),
    chainName: t('To lungs', '肺血管'),
    summary: t('Carry blood from the heart to the lungs and back.', '把血从心脏送到肺，再送回心脏。'),
    detail: t(
      'These blood vessels join the heart and the lungs. Some carry blood from the heart into each lung; others bring it back from the lungs to the heart [S2]. It is these blood vessels, not the air tubes, that link the lungs and the heart.\n\nInside the lungs they branch into tiny blood vessels too fine to draw; there the dots in this model follow a drawn path [S37].',
      '这些血管连接心脏和肺。有的把血从心脏送进两个肺，有的把血从肺送回心脏 [S2]。连接肺和心脏的是这些血管，不是气管的分支。\n\n在肺里，它们分成很细的血管，细得画不出来；在那里，模型里的点沿着一条画出来的路线走 [S37]。',
    ),
  },
  'vessels-out': {
    name: t('Blood vessels from the heart', '从心脏出去的血管'),
    short: t('Vessels out', '出去的血管'),
    chainName: t('Out', '出'),
    summary: t('Carry blood from the heart to every part of the body.', '把血从心脏运到身体各处。'),
    detail: t(
      'Blood vessels that carry blood away from the heart branch again and again, reaching every part of the body [S2]. This model shows the main ones to the head, the arms, the belly and the legs [S33]. The many smaller ones, and those of organs such as the brain and the kidneys, are not drawn [S37].\n\nScientists call blood vessels like these arteries; the syllabus does not ask for the word [S1].',
      '把血从心脏运出去的血管一次次分支，通到身体的每个部分 [S2]。这个模型画了通到头、手臂、腹部和腿的主要血管 [S33]。许多更细的血管，以及脑、肾等器官的血管，都没有画 [S37]。\n\n科学家把这类血管叫作动脉；课纲不要求这个词 [S1]。',
    ),
  },
  'vessels-back': {
    name: t('Blood vessels to the heart', '回心脏的血管'),
    short: t('Vessels back', '回来的血管'),
    chainName: t('Back', '回'),
    summary: t('Bring blood back from the body to the heart.', '把血从身体各处运回心脏。'),
    detail: t(
      'Blood vessels that bring blood back to the heart join into larger and larger vessels on the way [S2]. This model shows the main ones from the head, the arms, the belly and the legs [S33]. Blood from the stomach and intestines passes through the liver before it goes back to the heart [S2]. Under the skin some of these vessels look bluish, because of the way skin scatters and takes in light; the blood in them is dark red, not blue [S2, S29].\n\nScientists call blood vessels like these veins; the syllabus does not ask for the word [S1].',
      '把血运回心脏的血管，一路汇合成越来越粗的血管 [S2]。这个模型画了从头、手臂、腹部和腿回来的主要血管 [S33]。从胃和肠回来的血，先经过肝，再回到心脏 [S2]。皮肤下的一些这类血管看起来发蓝，是因为皮肤散射、吸收光的方式；里面的血是暗红色的，不是蓝色 [S2, S29]。\n\n科学家把这类血管叫作静脉；课纲不要求这个词 [S1]。',
    ),
  },
  oesophagus: {
    name: t('Gullet (oesophagus)', '食道'),
    short: t('Gullet', '食道'),
    summary: t('Food goes down here; air goes down the windpipe in front.', '食物走这里；空气走前面的气管。'),
    detail: t(
      'The tube that carries swallowed food from the throat down to the stomach. It lies behind the windpipe [S2, S40]. It belongs to the digestive system, drawn faintly in this topic.',
      '把吞下的食物从咽送到胃的管子，在气管后面 [S2, S40]。它属于消化系统，在这个主题里画得很淡。',
    ),
  },
  stomach: {
    name: t('Stomach', '胃'),
    summary: t('Part of the digestive system, shown for comparison.', '消化系统的一部分，画出来作对照。'),
    detail: t(
      'Part of the digestive system, drawn faintly in this topic to show where it sits. The digestive system has a topic of its own.',
      '消化系统的一部分，在这个主题里画得很淡，用来显示它的位置。消化系统另有一个主题。',
    ),
  },
  'small-intestine': {
    name: t('Small intestine', '小肠'),
    summary: t('Digested food passes from here into the blood.', '消化后的食物从这里进入血液。'),
    detail: t(
      'Food is digested into simpler substances that pass into the blood, most of them through the wall of the small intestine [S2]. In this model the dots of digested food leave its long coiled part and join the blood in the vessels that drain it [S37].',
      '食物被消化成更简单的物质，再进入血液；大部分经过小肠的壁进入血液 [S2]。在这个模型里，消化后的食物的点从长长的盘曲部分出来，进入从小肠回来的血管里的血 [S37]。',
    ),
  },
  'large-intestine': {
    name: t('Large intestine', '大肠'),
    summary: t('Part of the digestive system, shown for comparison.', '消化系统的一部分，画出来作对照。'),
    detail: t(
      'Part of the digestive system, drawn faintly in this topic to show where it sits. Its work is told in the topic on the digestive system.',
      '消化系统的一部分，在这个主题里画得很淡，用来显示它的位置。它的工作在消化系统那个主题里讲。',
    ),
  },
  liver: {
    name: t('Liver · further', '肝 · 再进一步'),
    short: t('Liver', '肝'),
    summary: t('Blood from the gut passes through it on the way back.', '从肠回来的血，先经过这里。'),
    detail: t(
      'A large organ under the right side of the diaphragm. Blood from the stomach and intestines flows through the liver before it returns to the heart [S2]. In this model that part of the route is a drawn path [S37].',
      '肝是膈右侧下面一个很大的器官。从胃和肠回来的血，先流过肝，再回到心脏 [S2]。在这个模型里，这一段路线是画出来的 [S37]。',
    ),
  },
  'leg-muscles': {
    name: t('Leg muscles', '腿部肌肉'),
    summary: t('Use more oxygen and digested food when you run.', '跑步时用掉更多氧气和消化后的食物。'),
    detail: t(
      'The large muscles at the front of the thigh and the back of the calf. Like every part of the body, they use digested food and oxygen brought by the blood to carry out life processes, and they give out carbon dioxide [S1, S2]. When you run they work harder: more carbon dioxide is made and oxygen in the blood falls, and the heart beats faster and breathing gets faster and deeper [S2]. In children the heartbeat can rise much more during exercise than in adults [S13].\n\nThis model shows five muscles on each leg [S33].',
      '大腿前面和小腿后面的大块肌肉。和身体的每个部分一样，它们用血液送来的消化后的食物和氧气进行生命过程，并放出二氧化碳 [S1, S2]。跑步时它们更用力：产生的二氧化碳更多，血里的氧气变少，心跳就变快，呼吸也变快、变深 [S2]。运动时，孩子的心跳可以比成年人升得高得多 [S13]。\n\n这个模型每条腿画了五块肌肉 [S33]。',
    ),
  },
  skeleton: {
    name: t('Skeleton', '骨骼'),
    summary: t('Holds the body up and protects soft organs.', '支撑身体，保护柔软的器官。'),
    detail: t(
      'The bones of the adult reference body, drawn as context [S33]. The ribs and breastbone are a separate part in this topic so that they can move with breathing [S37].',
      '成年参考身体的骨骼，画出来作背景 [S33]。在这个主题里，肋骨和胸骨是单独的一个零件，好让它们跟着呼吸动 [S37]。',
    ),
  },
  'air-jar': {
    name: t('Jar of air', '空气瓶'),
    short: t('Jar of air', '空气瓶'),
    summary: t('A model: the gases of air, one ball for each per cent.', '模型：空气里的气体，每个小球代表百分之一。'),
    detail: t(
      'A teaching model, not to scale. The rack in front of the jar shows what the air in it is made of, one ball for each per cent by volume, in four rows from the top: nitrogen, oxygen, carbon dioxide and water vapour [S37]. Switch the sample on the try-it card in chapter 2 to see the air breathed out.\n\nThe numbers are typical values from the sources, rounded to whole per cents [S3, S5, S6, S8]. Argon and the other gases, together about 1 per cent of air, are not drawn [S3].',
      '教学模型，不按比例。瓶前的托架显示瓶里的空气由什么组成，按体积每个小球代表百分之一，从上到下四排：氮气、氧气、二氧化碳、水蒸气 [S37]。在第 2 章的试一试卡片上换样本，就能看到呼出的气体。\n\n这些数是来源给出的典型值，取到整数百分比 [S3, S5, S6, S8]。氩等其他气体合起来约占空气的百分之一，没有画 [S3]。',
    ),
  },
  'n2-balls': {
    name: t('Nitrogen', '氮气'),
    summary: t('Nitrogen: about 78 % of air, in and out.', '氮气：吸入和呼出都约占 78%。'),
    detail: t(
      'About 78 per cent of air is nitrogen [S3]. The body does not use it, so textbooks give the same value, about 78 per cent, for the air breathed out [S5, S6]. Measured breath has a little less, about 75 per cent, because the extra water vapour and carbon dioxide take up some of the space; the amount of nitrogen is the same [S8].',
      '空气里约 78% 是氮气 [S3]。身体不用氮气，所以课本里呼出的气体也写约 78% [S5, S6]。实际测量的呼出气体里氮气少一点，约 75%，因为多出来的水蒸气和二氧化碳占了一些位置；氮气的量没有变 [S8]。',
    ),
  },
  'o2-balls': {
    name: t('Oxygen', '氧气'),
    summary: t('Oxygen: about 21 % of air in, about 16 % out.', '氧气：吸入约 21%，呼出约 16%。'),
    detail: t(
      'About 21 per cent of air is oxygen [S3]. Breathed-out air still has about 16 per cent [S5, S6]. So only about a quarter of the oxygen goes into the blood, and about three quarters is breathed out again [S7].',
      '空气里约 21% 是氧气 [S3]。呼出的气体里仍有约 16% [S5, S6]。所以只有大约四分之一的氧气进入血液，大约四分之三又被呼了出来 [S7]。',
    ),
  },
  'co2-balls': {
    name: t('Carbon dioxide', '二氧化碳'),
    summary: t('Carbon dioxide: about 0.04 % of air in, about 4 % out.', '二氧化碳：吸入约 0.04%，呼出约 4%。'),
    detail: t(
      'Air has only about 0.04 per cent carbon dioxide, less than one ball [S3, S4]. Breathed-out air has about 4 per cent, about a hundred times more [S5, S6]. The extra comes out of the blood in the lungs [S2].',
      '空气里的二氧化碳只有约 0.04%，连一个球都不到 [S3, S4]。呼出的气体里约有 4%，大约多了一百倍 [S5, S6]。多出来的二氧化碳是在肺里从血液出来的 [S2]。',
    ),
  },
  'h2o-balls': {
    name: t('Water vapour', '水蒸气'),
    summary: t('Water vapour: varies in air; there is more in breath.', '水蒸气：空气里多少不定，呼出的更多。'),
    detail: t(
      "How much water vapour air holds changes with the weather; a typical value is about 1 per cent [S3]. Breathed-out air is warm and moist and has more, about 6 per cent [S8]. Singapore's air is often humid, so the difference there is probably smaller than these values suggest; we found no local measurement [S37].",
      '空气里有多少水蒸气，随天气变化；典型值约 1% [S3]。呼出的气体又暖又湿，水蒸气更多，约 6% [S8]。新加坡的空气常常很潮湿，所以那里的差别大概比这些数小；我们没有找到本地的测量 [S37]。',
    ),
  },
  'fish-body': {
    name: t('Fish', '鱼'),
    summary: t('Takes in oxygen dissolved in water through its gills.', '用鳃吸收溶在水里的氧气。'),
    detail: t(
      'A teaching model of a bony fish, not a particular kind and not to scale. A fish takes up the oxygen dissolved in water through its gills [S40]. Water that comes in through the mouth passes over the gills, which sit in a chamber on each side under a flap, the gill cover [S40].\n\nIn this model the left gill cover can be lifted to show the gills [S37].',
      '一条硬骨鱼的教学模型，不代表某一种鱼，也不按比例。鱼用鳃吸收溶在水里的氧气 [S40]。从口进来的水流过鳃；鳃在身体两侧的腔里，外面盖着一片鳃盖 [S40]。\n\n在这个模型里，左边的鳃盖可以掀开，露出鳃 [S37]。',
    ),
  },
  gills: {
    name: t('Gills', '鳃'),
    summary: t('Oxygen passes from water into blood; carbon dioxide out.', '氧气从水进入血液，二氧化碳从血液进入水。'),
    detail: t(
      'Gills are thin filaments, highly branched and folded, so they have a large surface [S40]. As water flows over them, oxygen passes into the blood in their tiny blood vessels, and carbon dioxide passes from the blood into the water [S40].\n\nThis model shows four arches with one row of filaments each, simplified [S37].',
      '鳃是很薄的细丝，分支多、褶皱多，所以表面很大 [S40]。水流过鳃时，氧气进入鳃里细小血管中的血液，二氧化碳从血液进入水中 [S40]。\n\n这个模型画了四道鳃弓，每道一排鳃丝，已经简化 [S37]。',
    ),
  },
  'gill-cover': {
    name: t('Gill cover', '鳃盖'),
    summary: t('A flap over the gills; water flows out from under it.', '盖住鳃的一片；水从它下面流出去。'),
    detail: t(
      'A protective flap over the gill chamber on each side of a bony fish [S40]. Water that has passed over the gills flows out from under its back edge [S40].\n\nIn this model the cover can be lifted to show the gills [S37].',
      '硬骨鱼身体两侧盖在鳃腔外面的保护片 [S40]。流过鳃的水，从鳃盖的后缘下面流出去 [S40]。\n\n在这个模型里，鳃盖可以掀开，露出鳃 [S37]。',
    ),
  },
  'plant-specimen': {
    name: t('Potted plant', '盆栽植物'),
    short: t('Plant', '植物'),
    summary: t('Takes in oxygen through tiny openings, mostly on its leaves.', '主要通过叶上的小孔吸进氧气。'),
    detail: t(
      'A model of a young chilli plant, not to scale. A plant has no lungs or gills: gases go in and out through tiny openings, most of them on the underside of the leaves [S41]. It takes in oxygen and gives out carbon dioxide by day and by night [S42]; in light its leaves also take in carbon dioxide and give out oxygen as they make food [S41].\n\nAlong the front of the stem the model shows two kinds of tube: one carries water up from the roots, the other carries food made in the leaves [S1, S41].',
      '一棵小辣椒苗的模型，不按比例。植物没有肺，也没有鳃：气体经过小孔进出，这些小孔大多在叶背 [S41]。植物白天黑夜都吸进氧气、放出二氧化碳 [S42]；有光时，叶子另外吸进二氧化碳、放出氧气来制造食物 [S41]。\n\n模型沿着茎的前面画出两种管：一种把水从根往上运，另一种运送叶子制造的食物 [S1, S41]。',
    ),
  },
  'skin-outline': {
    name: t('Body outline', '身体轮廓'),
    summary: t('Shows where the organs sit in the body.', '显示器官在身体里的位置。'),
    detail: t('The skin of the adult reference body, see-through so that the organs show [S33].', '成年参考身体的皮肤，画成透明的，好让器官露出来 [S33]。'),
  },
  'skin-wire': {
    name: t('Body outline · light', '身体轮廓 · 简化'),
    summary: t('Shows where the organs sit in the body.', '显示器官在身体里的位置。'),
    detail: t('A lighter copy of the skin of the adult reference body [S33].', '成年参考身体皮肤的简化版 [S33]。'),
  },
  'side-table': {
    name: t('Side table', '小桌'),
    summary: t('Holds the teaching models.', '放教学模型的桌子。'),
    detail: t('A table for the jar of air, the fish and the plant. It is not part of the body, and the models on it are not to scale [S37].', '放空气瓶、鱼和植物的桌子。它不是身体的一部分，桌上的模型也不按比例 [S37]。'),
  },
  'ball-rack': {
    name: t('Ball rack', '小球托架'),
    summary: t('Holds the rows of balls, one row for each gas.', '托着一排排小球，每种气体一排。'),
    detail: t('Each row starts on the same line, so the length of a row shows the per cent [S37].', '每一排都从同一条线开始，所以一排有多长，就表示占百分之几 [S37]。'),
  },
  'fish-tank': {
    name: t('Fish tank', '鱼缸'),
    summary: t('Water for the model fish.', '装着模型鱼的水。'),
    detail: t('A glass tank of water for the model fish [S37].', '一只装水的玻璃缸，放着模型鱼 [S37]。'),
  },
  'plant-pot': {
    name: t('Flower pot', '花盆'),
    summary: t('Soil for the model plant.', '装着模型植物的土。'),
    detail: t('A clay pot of soil for the model plant [S37].', '一只装土的陶盆，种着模型植物 [S37]。'),
  },
};

export const GROUP_TEXT: Record<string, T> = {
  airway: t('Nose, throat and windpipe', '鼻、咽和气管'),
  'lung-pair': t('Lungs', '肺'),
  'heart-group': t('Heart', '心脏'),
  'body-vessels': t('Blood vessels', '血管'),
  'air-tubes': t('Air tubes · further', '支气管 · 再进一步'),
  'breathing-movers': t('Breathing muscle and ribs · further', '膈与肋骨 · 再进一步'),
  digestion: t('Digestive system', '消化系统'),
  'leg-muscle-group': t('Leg muscles', '腿部肌肉'),
  'skeleton-context': t('Skeleton', '骨骼'),
  'air-sample': t('Jar of air', '空气瓶'),
  compare: t('Fish and plant', '鱼与植物'),
  'skin-context': t('Body outline', '身体轮廓'),
  'skin-light': t('Body outline · light', '身体轮廓 · 简化'),
  bench: t('Side table', '小桌'),
  air: t('Air', '空气'),
  'blood-rich': t('Oxygen-rich blood', '含氧多的血'),
  'blood-poor': t('Oxygen-poor blood', '含氧少的血'),
  gases: t('Oxygen and carbon dioxide', '氧气与二氧化碳'),
  'digested-food': t('Digested food', '消化后的食物'),
  'fish-water': t('Water and gases at the gills', '鳃旁的水和气体'),
  'plant-flow': t('Water and food in the plant', '植物里的水和食物'),
  'plant-gases': t('Gases at the leaves', '叶子的气体'),
};

export const PRESET_TEXT: Record<string, T> = {
  'whole-body': t('Body', '全身'),
  'head-neck': t('Head', '头颈'),
  chest: t('Chest', '胸腔'),
  'heart-inside': t('Inside · further', '心内 · 再进一步'),
  'side-bench': t('Bench', '小桌'),
  legs: t('Legs', '双腿'),
};

export const SPEC = [
  { key: t('Air breathed in', '吸入的空气'), value: 'N₂ 78 % · O₂ 21 % · CO₂ 0.04 %', tag: 'typical' },
  { key: t('Air breathed out', '呼出的气体'), value: 'O₂ ≈ 16 % · CO₂ ≈ 4 %', tag: 'typical' },
  { key: t('At rest, age 6–11', '6–11 岁休息时'), value: t('heart 75–118 · breaths 18–25 per min', '心跳 75–118 · 呼吸 18–25 次 / 分'), tag: 'typical' },
  { key: t('One round of the blood', '血液绕一圈'), value: t('≈ 1 min · adult at rest', '约 1 分钟 · 成人休息时'), tag: 'typical' },
];

export const TELEMETRY = [
  { key: t('Breaths', '呼吸'), follow: 'breaths', unit: '/min' },
  { key: t('Heartbeats', '心跳'), follow: 'beats', unit: '/min' },
  { key: t('Oxygen in the sample', '样本里的氧气'), follow: 'o2', unit: '%', scope: 'observe' },
  { key: t('Carbon dioxide in the sample', '样本里的二氧化碳'), follow: 'co2', unit: '%', scope: 'observe' },
];

export const EXPLODE_LABEL = t('Spread out', '摊开');
export const CUT_LABEL = t('Midline', '正中剖面');
