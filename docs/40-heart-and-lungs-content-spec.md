# 40 · 心与肺 · 内容施工 spec（`heart-and-lungs`，SpaceScene + 真实网格 + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体（按系统分区），**真实网格**：Z-Anatomy（CC BY-SA 4.0）的呼吸道、肺、心、血管，与 `digestive-system`（docs/25）和六个肌肉主题（docs/16）**同一个成年男性参考身体、同一个坐标系**（脐为原点），走 `scripts/anatomy` 的静态器官管线（新 region `heart-lungs`，§4.9），产出新的 `public/models/heart-and-lungs.glb`。身体旁边一张小桌放三样程序化教具：一只"空气瓶"（每个小球 = 1 % 的空气，第 02 章）、一条剖开鳃盖的鱼和一盆植物（第 06 章）。本主题的任务：**P5 学生看完能说出空气由氮气、氧气、二氧化碳、水蒸气等气体组成，呼出的气体和吸入的空气哪里不同（氧气少了一些但没有用完，二氧化碳多了约一百倍，水蒸气多了）；能沿着鼻 → 气管 → 肺说清空气的路，知道吸气时是胸腔变大、肺跟着胀开；能说出心脏是由肌肉构成的泵，血液在血管里把消化后的食物、氧气和二氧化碳运到全身；能说清血液每绕一圈先到肺、回心脏、再到全身、再回心脏，在肺里变成鲜红、在身体各处变回暗红（两种都是红色）；能说出消化、呼吸、循环三个系统怎样一起让身体各部分进行生命过程，跑步时为什么呼吸和心跳都变快；能比较人、鱼、植物怎样吸进氧气、放出二氧化碳，以及植物和人怎样运送物质。**

`subject: biology`（与 `digestive-system` 一致）；对应 2023 课纲 P5 *Human System (Respiratory and circulatory systems) (P5 Standard)*（S1 印第 54 页）。docs/17 §3 P5 行（"`heart-and-lungs`：心肺 + 一棵简化的血管树，血流两色沿两个回路；呼吸时肺的胀缩；末章把消化、呼吸、循环三条流同屏"，网格 B3 / B4，双回路流 + 节律形变 B6）。

2026-10-21 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/36、docs/38（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象、网格与零件 → §4 引擎与网格管线 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕与正文要点是**草稿**，用来定节拍和模型状态：EN 施工时由 Sonnet 起草全文、Opus 逐句核对；ZH 是本文的草稿，施工时 Opus 独立定稿。事实来自 Sonnet 的研究 `art/research/heart-and-lungs/`（`heart-lungs-research.md` §1–§6 与 `facts.json`：118 条，111 条逐字核过摘录，2026-10-21 完成）；下文 **R:** 后面是 `facts.json` 的条目 id（如 R: `air-09`），**S#** 是本文 §6.2 给的来源号。研究没有覆盖的事实标"待核"（§2.8），施工代理读原文核对后才能用，核不到按该行写的退路处理。课纲第 52–57 页起草时本人用 `pdftotext -layout` 读过（仓库里的 `art/codex-research/states-of-matter/sources/moe-primary-science-2023-jan2026.pdf`，PDF 第 n + 1 页 = 印的第 n 页）。

**本主题不用 Codex**：没有新图（只用 `art/planned/heart-and-lungs/` 里已审的草稿，§7），研究已由 Sonnet 做完；网格管线要 native Blender 5.1，由主会话或一个 Opus 代理在本机跑（§4.9）；施工分工见 §8.1（Opus / Sonnet / Haiku）。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **形式 = SpaceScene 真实网格 + 四张试一试**，同 `digestive-system` 的做法：一个半透明的成年人身体，里面是呼吸道、肺、心、主要血管，消化道画得很淡作对照；血、空气、氧气、二氧化碳、消化后的食物都是**流**。课纲的动词是 *recognise / identify … describe / compare*，看得见"空气走哪条路、血走哪条路、在哪里换气"正是 3D + 流的长处（docs/17 §3：Systems 是 SpaceScene 的拿手戏）。不做 MathScene 小测（科学主题默认不做测验，docs/36 D6、docs/38 D1） | 同意 | 定稿 |
| D2 | **网格只用 Z-Anatomy 一个来源**（与 `digestive-system`、肌肉系列同一身体、同一坐标、同一许可链；R: `mesh-01`–`mesh-05`）。缓存里已有全部需要的结构（R: `mesh-05`–`mesh-12`）：五个肺叶、气管、28 段支气管、鼻腔黏膜、鼻咽 / 口咽 / 喉咽、会厌、甲状软骨与环状软骨、四个心腔（没有整颗心的网格，`Heart.g` 是空组）、11 段大血管与肺血管、88 个具名的体循环血管、膈、肋骨与胸骨。**退路只有一条**：四个心腔合并后的心脏外壳在 hero 距离上若看得见洞（源网格约 800 条边界边，R: `mesh-08`），改用 **BodyParts3D 4.0 的整颗心**（FMA7088，CC BY 4.0，可并入 BY-SA 作品，R: `mesh-15`、`mesh-19`）只替换 `heart` 一个节点，署名加 BP3D 4.0 那一行；HRA / NIH 3D 的血管树**不用**（质量没看过、三角形数对不上文件大小，R: `mesh-16`、`mesh-17`） | 同意 | 定稿 |
| D3 | **新建 `public/models/heart-and-lungs.glb`，不改 `digestive-system.glb`**。一个主题只有一个 `model`（docs/25 §0-6），已发布的消化主题字节不动；新 glb 自带本主题要的消化道低模（食道、胃、小肠、大肠、肝，作对照，§3.4）。管线：`scripts/anatomy` 新 region `heart-lungs`（`rig: false` 走静态路径，与 `digestive` 同一套 build / optimize / audit / preview），同一个脐中心坐标（`static_region.py` 已固定），所以两个主题的镜头数字可以互相对照 | 同意 | 定稿 |
| D4 | **血液两种红色，绝不画蓝色**（R: `circ-06`、`mis-12`）：含氧多的血 = 鲜红（新 token `--blood-rich`），含氧少的血 = 暗红（新 token `--blood-poor`）；两者明度差 ≥ 20（L\*），灰度打印也分得开。血管网格本身一律同一种中性组织色（不按"动脉红 / 静脉蓝"染），颜色的意思全部由流的粒子讲。第 03 章细看 `Why veins look blue`（为什么皮肤下的血管看起来发蓝：皮肤对不同颜色的光散射、吸收不同，血本身是红的，R: `mis-12`） | 同意 | 定稿 |
| D5 | **课纲边界**（§1.1 原文）。主线 = 课纲词：nose / 鼻、windpipe / 气管、lungs / 肺、heart / 心脏、blood / 血液、blood vessels / 血管、digested food / 消化后的食物、oxygen / 氧气、carbon dioxide / 二氧化碳、life processes / 生命过程。**课纲明说不要求**的（R: `moe-09`、`moe-13`）：肺泡、心腔与瓣膜、artery / vein / capillary 这几个词（以及 xylem、phloem、stomata）——**主线不出现**，只在标"再进一步"的细看里出现一次、写明"课纲不要求"。**课纲根本没写**的（R: `moe-28`）：支气管、膈、肋骨、心率、呼吸频率、脉搏、鳃、肺活量——主线用描述代替（"气管下端分成两条管""肺下面那块圆顶形的肌肉"），名字放在细看与名词表（标"再进一步"）；**鳃**例外：课纲要求比较鱼怎样吸氧，"鳃 / gills"是说这件事最短的词，第 06 章主线用。**P6 的"呼吸作用 = 从食物中释放能量"不提前讲**（R: `moe-19`、`zh-12`）：只写"身体各部分用消化后的食物和氧气进行生命过程"（课纲第 54 页的原话），不写"释放能量"；中文只用"呼吸系统""呼吸"，不用"呼吸作用" | 同意 | 定稿 |
| D6 | **再进一步的细节层**（R: 研究 §6"Decisions needed"第 2 条）：气管的分支（支气管）、心脏里的四个空腔、artery / vein / capillary、肺泡、膈与肋间肌的名字——**只在细看里**，配一个镜头预设（`heart-inside` 剖开心脏、X-RAY 下看得见支气管）；对应的零件组在 LAYERS 里写"· 再进一步 / · further"（与 `digestive-system` 的"肝与胰 · 再进一步"同一写法）、`card: false`。节拍、字幕、本章索引的前几项不依赖它们 | 同意 | 定稿 |
| D7 | **数字**：一律带来源、带条件，范围照写，**模型读数写"在这个模型里"**。① 空气成分用研究建议的四舍五入值（R: `air-09`）：吸入 N₂ 78 %、O₂ 21 %、CO₂ 0.04 %；呼出 O₂ 约 16 %、CO₂ 约 4 %（约 100 倍）、水蒸气更多；**氮气卡片写 78 %（教科书的写法）**，细看讲实测呼出约 75 % 的原因（水蒸气和二氧化碳把它"冲淡"了，氮气的量没变，R: `air-07`、`air-08`；§0.1-2）。② 休息时的心跳与呼吸：6–11 岁心跳每分钟 75–118 次、呼吸 18–25 次（PALS 2015 指南范围，R: `hr-01`、`rr-02`），OpenStax 给约 10 岁 18–30 次（R: `rr-01`），并在同一处写 2011 年《柳叶刀》系统综述的提醒：这些范围出自没有来源的教科书，很多健康孩子落在外面（R: `hr-03`）。③ **运动后的数没有来源**（R: `rr-04`）：第 05 章试一试的"走路 / 跑步"读数是**设计值**（§2.9，S37），只为显示"变快多少"的方向，写"在这个模型里"，并在细看请读者量自己的（课纲 VEA"用数据检验"，R: `moe-14`）。④ 血量：成年男子 5–6 L、女子 4–5 L（R: `bv-03`）；十岁孩子"约 2.2–2.4 L"是**我们按每千克 70–75 mL × WHO 十岁体重中位数算的**，照写"粗略估算"（R: `bv-01`、`bv-04`）。⑤ 血液绕全身一圈"成人休息时约一分钟"（由血量 ÷ 每分钟心输出量推得，R: `circ-01`、`circ-02`），只写"大约一分钟"。⑥ **不写"血管连起来有 10 万千米"**（R: `circ-03`：1929 年的旧估算，2024 年核查认为不可靠） | 同意 | 定稿 |
| D8 | **鱼：第 06 章两拍的比较**（课纲 Practice 1 点名 plants, fish and humans，R: `moe-11`）。一条程序化的鱼（`sweep` 身体、鳍用 `wing`、一侧鳃盖用姿态掀开，露出四道鳃弓，每道上一排 `repeat` 的鳃丝），放在小桌上的一只玻璃水箱里；水从口进、流过鳃、从鳃盖下出，鳃里有血的鲜红 / 暗红换色与氧气、二氧化碳粒子。只讲"鱼用鳃吸收溶在水里的氧气"，不讲逆流交换、鱼的心脏与单循环（细看一句也不写，免得和人的两个回路混）。**鱼的事实研究没覆盖**，全部待核（§2.8 F-70–F-72），核不到按退路改成一句课纲层面的话 | 同意 | 定稿 |
| D9 | **植物：链 `plant`，不重讲**。小桌上一盆简化的植物（从 `plant` 主题抄辣椒的几何、缩小、只留茎与叶，`plant-specimen` 一个零件 + 盆 context），第 06 章一拍讲"植物主要通过叶上的小孔吸进氧气、放出二氧化碳，白天黑夜都这样；有光时叶子另外吸进二氧化碳、放出氧气来制造食物"（与 `plant` 第 `leaves-make-food` 章一致，后半句标 P6），一拍讲"植物用管子运水和食物，人用血管运消化后的食物、氧气和二氧化碳"（课纲 Practice 2 原话，链 `plant` 第 `the-stem` 章）。"气孔 / stomata"只在细看说"课纲不要求这个词"，同 `plant` 的写法 | 同意 | 定稿 |
| D10 | **引擎：一个新的通用模型 `kind: 'table'` + 三个小件**（§4，约 2 天，一个 Opus 引擎代理）：**E-HL1** `table`：按控件取值的表——每一行写明来源（S#）或标"设计"，validate 核对每种控件组合恰好一行、每个数都有来源、设计值只能引 S37；输出可带 `tag: typical` 让卡片和 PLATE 的芯片写 TYPICAL / 典型值而不是 SIM（教科书的空气成分不是模拟值）。**E-HL2** 绑定两件：动画 `hz`（心跳、呼吸动画的频率跟着模型的每分钟次数走）、`intensity` 读数输出（整条流的粒子速度按一个数）。**E-HL3** 潮汐流 `tidal`：流的粒子跟着呼吸动画一进一出（吸气时向肺、呼气时向鼻），不画成"一条管进、一条管出"。**E-HL4** 五个颜色 token：`--blood-rich`、`--blood-poor`、`--oxygen`、`--carbon-dioxide`、`--air`。**为什么不只用节拍**：吸气 / 呼气、吸入 / 呼出、休息 / 走 / 跑、"跟着血走"都是"改一个量、看另一个量"，试一试卡片的改变 / 不变 / 观察、记一行、条形图、先猜后看全都现成；但没有一个现有模型能出这些值（`circuit`、`magnet`、`force`、`energy`、`life-cycle`、`matter`、`light` 都是物理），而这些值本来就是**有来源的数据或写明的设计值**，不是要算的物理，所以做一个可复用、来源强制的表模型，而不是一个只给本主题用的 `body` 模型。**与 docs/30 D2"不做查表模型"的关系**：那一条防的是手写编出来的数字；`table` 的每个数必须挂来源（或挂设计研究 S37 并在卡片上带 SIM），validate 强制——docs/37 D2 已用同样的理由区分过 | 新 `kind: 'table'` + `hz` / 数值 `intensity` 绑定 + `tidal` + 5 个 token，约 2 天 | 定稿 |
| D11 | **试一试四张**（编号跟章号：T1、T2、T4、T5；每张写明改变 / 不变 / 观察，可记一行，都有先猜后看、不判对错）：**T1 吸气、呼气**（01）：切换吸气 / 呼气，看膈往哪里移、胸腔变大还是变小、空气流进还是流出；**T2 一瓶空气**（02）：切换吸入的空气 / 呼出的气体，看四排小球与 O₂ / CO₂ / N₂ / 水蒸气读数，记两行、条形图；**T4 跟着血走**（04）：一步步走血的一圈，看"现在在哪、含氧多还是少"；**T5 休息、走路、跑步**（05）：看每分钟呼吸、心跳的次数（模型）与"肌肉需要多少"，心跳和呼吸动画按读数实时变快，记三行、条形图。第 03、06 章不设卡片（第 03 章的"量自己的脉搏"在细看里，是读者自己做的事，不是模拟） | 同意 | 定稿 |
| D12 | **章数 6 + 背景章 00**（§5）：00 开始之前 / 01 鼻、气管和肺 / 02 空气有什么变化 / 03 心脏、血液和血管 / 04 先到肺，再到全身 / 05 三个系统一起工作 / 06 植物、鱼和人。顺序照课纲第 54 页：Core Ideas 1–3、Practices 1–2；第 02 章（空气成分）放在第 01 章之后，因为"呼出的气体"要先认识肺 | 同意 | 定稿 |
| D13 | **身体是成年男性参考解剖**（R: `mesh-14`），P5 学生比它小。标题块 `note` 写明；正文说大小只用"约有主人的拳头那么大"这种不依赖年龄的说法（R: `circ-04`）；成人的数（肺活量、心输出量）写明"成人"，孩子的同类数研究没找到就不写（R: `resp-05`、`circ-02`）。标题块 `note`：EN "Male reference anatomy · meshes Z-Anatomy / BodyParts3D, CC BY-SA 4.0 · organs simplified · main blood vessels only · jar, fish and plant are models, not to scale" / ZH "男性参考解剖 · 网格 Z-Anatomy / BodyParts3D，CC BY-SA 4.0 · 器官已简化 · 只画主要血管 · 空气瓶、鱼和植物是模型，不按比例" | 同意 | 定稿 |
| D14 | **必须讲对的十二处**（§1.4 误解目录逐条对应）：① 吸进的不只是氧气、呼出的不只是二氧化碳，大约四分之三的氧气又被呼出来（R: `mis-04`、`air-09`）；② 吸进的空气有用处：氧气进了血液（R: `mis-01`、`mis-11`）；③ 连接肺和心脏的是**血管**，不是气管的分支（R: `mis-01`、`mis-05`）；④ 空气一直到肺，肺很大、占满胸腔两侧，有两个（R: `mis-06`、`mis-10`）；⑤ 肺自己不会动，是胸腔变大把空气"吸"进来；肺从来不会完全排空（R: `resp-03`、`resp-04`）；⑥ 心脏是泵，不造血、不"洗"血（R: `mis-03`）；⑦ 血每绕一圈都要先经过肺（R: `mis-07`、`mis-08`）；⑧ 血总是红的（R: `circ-06`、`mis-12`）；⑨ 心脏在胸腔正中、尖端偏左（R: `mis-02`；"尖端偏左"待核 F-41）；⑩ 运动时心跳变快，是因为肌肉需要更多氧气和消化后的食物、产生更多二氧化碳（R: `mis-02`）；⑪ 呼吸系统是鼻、**气管**、肺，不是食道（R: `mis-14`）；⑫ 植物也吸进氧气、放出二氧化碳，白天黑夜都这样（假设，§1.4 M-13） | 同意 | 定稿 |
| D15 | **流的颜色一色一义**（§3.6）：空气 `--air`；氧气 `--oxygen`；二氧化碳 `--carbon-dioxide`；含氧多的血 `--blood-rich`；含氧少的血 `--blood-poor`；消化后的食物 `--food`（与 `digestive-system` 同一色）；植物里的水 `--cold`、食物 `--food`（与 `plant` 同一色）；鱼缸里的水 `--cold`。图例在第一次用到的那一拍的字幕里说（00 第 3 拍说两种红，02 第 4 拍说氧气与二氧化碳） | 同意 | 定稿 |
| D16 | **背景章 00**：这个身体模型是什么（成年男性、半透明皮肤、器官已简化、只画主要血管）；两种红；"在这个模型里"的读数与有来源的范围怎么区分；课纲要什么、哪些是"再进一步"；P4 学过的五个系统（链 `digestive-system` 第 `five-systems` 章）；"呼吸系统"和 P6 要学的内容不是一回事（一句，不展开）；小桌上的三样教具 | 同意 | 定稿 |
| D17 | **不做**：照片贴图、手术或疾病（哮喘、心脏病、吸烟的危害——课纲不要求，且容易吓人）、CPR / AED（docs/17 提到 PE P6，留给以后）、肺活量与孩子的心输出量（没有来源，R: `resp-05`、`circ-02`）、"10 万千米血管"、石灰水检验二氧化碳（课纲没有、研究没查）、心电图、血型、血细胞的种类、肾与肝的血液功能、鱼的心脏与单循环、读者拖动或自定义运动强度（v2）、测验与计分 | 同意 | 定稿 |
| D18 | **图：只用 `art/planned/heart-and-lungs/` 里已审的三张草稿，不出新图**（§7）：封面 `heart-and-lungs.png`（正面：带软骨环的气管分成两条管，右肺三叶、左肺两叶、心切迹，心脏在两肺之间偏左，主动脉弓）；配图 1 `heart-and-lungs-airway-tree.png` 放第 01 章；配图 2 `heart-and-lungs-heart-vessels.png` 放第 03 章 | 同意 | 定稿 |
| D19 | **中文术语**（研究 §5；**没有找到 MOE 或新加坡出版社的中文科学词表**，R: `zh-11`；多数来自香港教育局英汉科学词汇（繁转简）与中文维基，呼吸系统、肺、心脏有新加坡报章与医院用法，R: `zh-13`）：呼吸系统、循环系统、鼻 / 鼻孔、气管（windpipe 与 trachea 中文同一个词，R: `zh-04`）、肺、心脏、血液、血管、氧气、二氧化碳、氮气、水蒸气、吸气 / 呼气（名词）、吸入 / 呼出（动词）、含氧多的血 / 含氧少的血、生命过程、鳃；再进一步：支气管、肺泡、横膈膜、肋骨、动脉 / 静脉 / 毛细血管、心率 / 脉搏。**需要 Gavin 看的写在 §0.1** | 同意（待 Gavin 过目） | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。下面是"按惯例代定、Gavin 想改随时改"的：

1. **中文术语**（D19）。最想请 Gavin（或女儿的课本）确认的五处：
   - 题名 **心与肺**（`shortTitle` 心肺）；
   - **含氧多的血 / 含氧少的血**（本文用）还是 含氧血 / 缺氧血（"缺氧"在中文里常指身体缺氧，容易误会）；
   - diaphragm 写 **横膈膜**（本文用，香港词汇 p.13）——已发布的 `digestive-system` 写的是"膈"，Gavin 认可后另开小任务统一；
   - heart rate 在主线写 **心跳（每分钟几次）**，"心率""脉搏"只在细看；breathing rate 写 **呼吸（每分钟几次）**；
   - gills 写 **鳃**、gill cover 写 **鳃盖**（研究没有核到新加坡课本用词）。
2. **呼出气体里的氮气写多少**（D7 ①）：卡片默认写 **78 %**（教科书、补习讲义的写法，R: `air-05`、`air-06`），第 02 章细看讲"实测约 75 %，因为水蒸气和二氧化碳多了，把它冲淡了；氮气的量没有变"（R: `air-07`、`air-08`）。如果 Gavin 更想让卡片直接显示实测值 75 %，只改 `table` 一格和一条字幕。
3. **运动后的读数是设计值**（D7 ③、§2.9）：研究找不到 10–12 岁孩子走路、跑步后的心跳与呼吸次数（R: `rr-04`）。模型取休息 20 / 90、走路 26 / 115、跑步 40 / 165（每分钟呼吸 / 心跳），休息值在指南范围中间，跑步心跳低于孩子平均最大心跳"190 多"（R: `hr-06`）；卡片带 SIM、字幕写"在这个模型里"，细看请读者量自己的。另一条路：卡片只显示"变快 / 快很多"的状态、不出数（同 docs/37 D9 的做法）——条形图就没了。默认出数。
4. **心脏外壳**（D2）：四个心腔合并后若在封面距离看得见洞，换 BodyParts3D 4.0 的整颗心（多一行署名）。施工时主会话看了 preview 再定，§9 记录。
5. **鱼的事实待核**（D8）：研究没覆盖鱼。施工时 Sonnet 读 OpenStax *Biology 2e* 第 39.1 节核对；核不到就把第 06 章鱼的两拍合成一拍，只说"鱼用鳃从水里吸收氧气"并引一条核到的来源。
6. **请读者量自己的脉搏和呼吸**（第 05 章细看）：只写"坐着数 30 秒、乘 2；原地轻轻跳一分钟再数一次；身体不舒服就不要做"——这是价值陈述，不当事实引来源。Gavin 若不想让页面请孩子做运动，删掉后半句。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；2026-10-21 起草时从 PDF 抄录，页码是页脚印的数字）

**S1**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"（R: `moe-01`；URL 见 §6.2）。

**Human System (Respiratory and circulatory systems) (P5 Standard)**（第 54 页，全文）

> **Learning Outcomes**
>
> **Core Ideas**
> • Recognise that air is made up of gases such as nitrogen, carbon dioxide, oxygen and water vapour.
>
> • Identify the parts of the human respiratory (nose, windpipe, lungs) and circulatory systems (heart, blood, blood vessels) and describe their functions.
>
> Note:
> - Detailed knowledge of respiratory system (e.g., alveoli) and circulatory system (e.g., heart chambers and valves) is not required.
>
> • Recognise the integration of the different systems (digestive, respiratory and circulatory) in carrying out life processes.
>
> **Practices**
> • Compare how plants, fish and humans take in oxygen and give out carbon dioxide.
>
> • Compare the ways in which substances are transported within plants and humans.
>   - Plants: Tubes that transport food and water
>   - Humans: Blood vessels that transport digested food, oxygen and carbon dioxide
>
> Note:
> - The use of specific terms (xylem, phloem, stomata, artery, vein, capillary) is not required.
>
> **Values, Ethics and Attitudes**
> • Show objectivity by seeking data and information to validate observations and explanations about the human body.

**P5 Foundation**（第 55 页）与 Standard 的差别（R: `moe-15`）：同样的空气成分与部分；"state their functions"（不是 describe）；Practice 只有 "Compare how plants and humans take in oxygen and give out carbon dioxide."（**没有鱼**）；**没有**运输比较，**没有**三系统协同。Table 2（第 20 页）的规则是"Topics which are underlined are not required for students taking Foundation Science"，Human system P5 没有下划线（R: `moe-16`）。**本主题按 Standard 做，不标 Foundation**（同 docs/36、docs/38）；第 06 章的鱼与运输比较、第 05 章的三系统协同是 Standard 的内容，00 细看一句说明。

**相邻的条目（只作边界，不引全文）**：

| 页 | 条目 | 与本主题的关系 |
|---|---|---|
| 52 | About Systems："A system is a whole consisting of parts that work together to perform function(s)."；Essential Takeaways："Different parts of a system influence and work together to perform function(s)."（R: `moe-17`） | 00 正文、05 正文 |
| 53 | P4 Human System (Digestive System)："Identify the human systems in the body and state their functions (digestive, respiratory, circulatory, skeletal and muscular)."；"Identify the parts in the human digestive system (mouth, gullet, stomach, small intestine and large intestine) and describe their functions."（R: `moe-02`、`moe-05`） | 00 链 `digestive-system` 第 `five-systems` 章；05 链 `small-intestine-chapter` |
| 57 | P5 Plant System (Respiratory and circulatory systems)："Identify the parts of the plant transport system and describe their functions."；Practice "Investigate how food and water are transported in the plant."；Note 不要求 xylem / phloem、两种管的相对位置、蒸腾拉力（R: `moe-21`） | 06 链 `plant` 第 `the-stem` 章 |
| 14、78 | Energy："All living things obtain energy and use it to carry out life processes."；P6："Recognise that living things need energy from respiration to carry out life processes."（重点是"the release of energy from food"，R: `moe-18`、`moe-19`） | **不提前讲**（D5）；00 细看一句 |
| 15–18 | Ways of Thinking and Doing（P4 末）：多种表示（图、表、图解）、简单分析表与条形 / 折线图、用感官与器材收集数据、认出公平测试、清楚地说明与推理（R: `moe-22`–`moe-27`） | T2、T5 的表和条形图；05 细看"量自己的" |

- 课纲**没有**写（R: `moe-28`，研究对全文 grep 过）：heart rate、breathing rate、pulse、exercise（作为学习内容）、diaphragm、ribcage、air sac、gills、lung capacity；也没有 bronchi、aorta、atrium、pulmonary。它们出现在补习讲义里（R: `resp-07`、`rr-05`），可能出现在考题里，所以放细看与名词表（D5、D6）。
- **PSLE**：P5 内容进 PSLE 范围；题型只描述、不抄题（§1.5）。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 空气由氮气、氧气、二氧化碳、水蒸气等组成；吸入与呼出的差别 | 主线（02、T2） |
| 呼出气体里氮气 78 % 还是 75 % | 卡片 78 %；细看讲 75 %（§0.1-2） |
| 鼻、气管、肺各做什么；空气的路 | 主线（01） |
| 吸气时胸腔变大、肺跟着胀开；肺不会完全排空 | 主线（01 第 5 拍、T1）；"膈""肋间肌"的名字在细看 |
| 气管的分支（支气管） | 再进一步：细看 + X-RAY |
| 肺泡 | 再进一步：细看一句，写明"课纲不要求" |
| 心脏是肌肉构成的泵、在哪、多大 | 主线（03） |
| 血液运送消化后的食物、氧气、二氧化碳 | 主线（03、05） |
| 血管把血运出、运回；artery / vein / capillary 三个词 | 主线只说"从心脏出去的血管 / 回心脏的血管"；三个词在细看，写明"课纲不要求" |
| 心脏里的四个空腔、瓣膜 | 再进一步：细看 + `heart-inside` 预设 |
| 两个回路（先到肺、回心脏、再到全身）；两种红 | 主线（04、T4） |
| 休息时的心跳、呼吸次数（范围 + 提醒） | 规格行、03 正文与细看出范围；字幕不出数；05 的卡片出模型值（SIM） |
| 运动时变快、为什么 | 主线（05、T5） |
| 三系统协同 | 主线（05） |
| 人、鱼、植物怎样吸氧排二氧化碳 | 主线（06） |
| 植物与人的运输 | 主线（06 第 5 拍 + 正文的比较表） |
| 光合作用（P6）、呼吸作用释放能量（P6） | 不讲；06 一句"有光时叶子另外……制造食物"链 `plant`，标 P6 |
| 疾病、吸烟、急救 | 不讲（D17） |

### 1.3 读者学到什么（P5 用词）

1. 空气是几种气体混合在一起的：大约 78 % 是氮气、21 % 是氧气，二氧化碳只有大约 0.04 %，还有水蒸气，多少随天气变化。
2. 呼出的气体不是"全是二氧化碳"：氧气从约 21 % 降到约 16 %，大约四分之三的氧气又被呼了出来；二氧化碳从约 0.04 % 升到约 4 %，多了约一百倍；水蒸气也更多。
3. 空气从鼻孔进来，在鼻子里被加温、变湿，灰尘被挡住；经过喉咙进入气管——气管在食道前面；气管下端分成两条管，通到两个肺。
4. 两个肺很大，占满胸腔两侧，心脏夹在中间。吸气时，肺下面那块圆顶形的肌肉往下移、肋骨往上往外移，胸腔变大，空气流进来；呼气时反过来。肺自己不会动，也从来不会完全排空。
5. 心脏是由肌肉构成的泵，在胸腔正中、尖端偏左，大约有主人的拳头那么大；每跳一下就把血挤进血管。血管通到身体每个部分，有的把血运出去，有的运回来。
6. 血液在血管里把消化后的食物和氧气送到身体各处，把二氧化碳带走。血先到肺，在那里吸收氧气、放出二氧化碳，变成鲜红色；回到心脏；再被送到全身，在身体各处送出氧气、带走二氧化碳，变成暗红色；再回到心脏。两种血都是红的。
7. 消化系统让消化后的食物进入血液，呼吸系统让氧气进入血液、让二氧化碳离开，循环系统把它们运到各处；身体各部分用消化后的食物和氧气进行生命过程。跑步时肌肉需要更多氧气和消化后的食物、产生更多二氧化碳，所以呼吸和心跳都变快。
8. 人用肺从空气中吸氧；鱼用鳃吸收溶在水里的氧气；植物没有肺也没有鳃，主要通过叶上的小孔吸进氧气、放出二氧化碳。植物用管子运水和食物，人用血管运消化后的食物、氧气和二氧化碳。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

依据：研究 §4。**这些研究都不是新加坡 P5 学生**（印度八年级 34 人、北卡罗来纳 5 年级到大学 495 人、土耳其五至七年级、里斯本六年级、教师用书里的轶事），不能写"很多新加坡孩子以为……"；标"假设"的没有研究来源，正文只正面讲正确说法，细看里也不说"常见误解"。SCIMAP 转录的条目（Allen、Ozgur）研究没读到原书，照研究的标注写。

| # | 说法 | 正确的说法 | 哪里纠正 | 依据（R:） |
|---|---|---|---|---|
| M-1 | 吸进的只有氧气，呼出的只有二氧化碳；氧气全用完了 | 空气是混合物；呼出的气体里氧气约 16 %，约四分之三又被呼了出来 | 02 第 1–3 拍、T2 先猜后看 | `mis-04`（Mohapatra & Mukharjee 2022 第 87–88 页）、`mis-01`（Allen 2010 第 35–40 页） |
| M-2 | 空气吸进来又呼出去，没有什么用 | 氧气在肺里进了血液，二氧化碳从血液里出来 | 02 第 4 拍、04 第 2 拍 | `mis-01`、`mis-11`（Silva & Almeida 2017 第 1205–1210 页） |
| M-3 | 气管的分支把肺和心脏连起来；心脏把氧气送到肺 | 连接肺和心脏的是血管；空气只到肺 | 04 第 1、3 拍；右上零件链（肺 → 往返肺的血管 → 心脏） | `mis-01`、`mis-05`（Mohapatra 第 89–90 页）、`mis-11` |
| M-4 | 吸进的空气留在头或脖子里；肺画得太小、太高；只有一个肺；胃也是呼吸系统 | 空气一直到肺；两个大肺占满胸腔两侧 | 01 第 3–4 拍 | `mis-06`（Fokides & Mastrokoukou 2018 第 155 页）、`mis-10`（Ahi & Balci 2017） |
| M-5 | 肺像袋子，自己鼓起来、吸满再倒空 | 肺自己不会动，胸腔变大才把空气吸进来；肺从不完全排空 | 01 第 5 拍、T1 | **假设**（研究没找到这条文献，R: `mis-13`）；事实：`resp-03`、`resp-04` |
| M-6 | 心脏造血、"洗"血；静脉里是"脏血" | 心脏是泵；血在全身各处送出氧气、带走二氧化碳 | 03 第 2 拍 + 细看 | `mis-03`（Ozgur 2013，SCIMAP 转录）、`mis-05` |
| M-7 | 血从心脏到身体再回心脏，不经过肺（"心—肺—脚趾—心"） | 每绕一圈先到肺、回心脏、再到全身 | 04 全章、T4 先猜后看 | `mis-08`（Arnaudin & Mintzes 1985，经 ERIC 摘要）、`mis-07`（Fokides 第 156 页） |
| M-8 | 静脉里的血是蓝的 | 血总是红的，只是鲜红和暗红；血管在皮肤下看起来发蓝另有原因 | 00 第 3 拍、03 细看 | `mis-02`（Allen 第 29–34 页）、`mis-12`（Kienle et al. 1996） |
| M-9 | 心脏在胸的左边 | 在胸腔正中、两肺之间，尖端偏左 | 03 第 1 拍 | `mis-02`；位置 `circ-04`，"尖端偏左"待核 F-41 |
| M-10 | 运动时心跳加快是"为了让肌肉动起来" | 肌肉更用力，需要更多氧气和消化后的食物、产生更多二氧化碳 | 05 第 4 拍、T5 | `mis-02`（Allen） |
| M-11 | 呼吸系统是鼻、食道、肺 | 是鼻、**气管**、肺；气管在食道前面 | 01 第 2 拍 | `mis-14`（Geniebook 练习题，商业补习） |
| M-12 | 心脏"只泵氧气" | 心脏泵的是血，血运送氧气、消化后的食物和二氧化碳 | 03 第 4 拍 | `mis-14` |
| M-13 | 植物不吸氧气，只放出氧气 | 植物白天黑夜都吸进氧气、放出二氧化碳；有光时另外制造食物 | 06 第 4 拍 | **假设**；事实见 `plant` 第 `leaves-make-food` 章（F-73、F-74） |
| M-14 | 鱼"呼吸水" | 鱼用鳃吸收溶在水里的氧气 | 06 第 2–3 拍 | **假设**；事实待核 F-70 |

### 1.5 PSLE 题型 → 本主题哪里支持

只描述题型，不抄题；来源是新加坡补习讲义里的练习形式（R: `rr-05`、`mis-14`，商业补习，不是 SEAB 的统计）。

| 题型 | 支持 |
|---|---|
| 读休息 / 走路 / 跑步时呼吸次数或心跳的折线图、条形图 | T5 的表与条形图；05 正文 |
| 比较吸入的空气与呼出的气体（表） | T2 的表与条形图；02 正文 |
| 读血流图，判断血从肺出来先到哪里 | 04、T4 先猜后看 |
| "呼吸系统由鼻、食道、肺组成"这类陷阱 | 01 第 2 拍 |
| 人、鱼、植物怎样吸氧排二氧化碳 | 06、正文比较表 |
| 植物和人怎样运送物质 | 06 第 5 拍、正文比较表 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md` 生物版：通俗不幼稚，先看到再说为什么；不拟人（"心脏在努力工作"不写）、不目的论（"肺很大**是为了**……"→"肺很大，所以……"）、不喊"小朋友"、无感叹号、无问句标题。英文用新加坡 / 英式拼写（colour、litre、centre）。中文用新加坡用法（§6.1），引号只用"“ ”"。**解剖如实、用词克制**：不写疾病、不写血腥；血、心跳照实写。**数字**照 D7：范围照写，模型读数写"在这个模型里"。**安全与价值**：量脉搏、原地轻跳只在细看、带"身体不舒服就不要做"（§0.1-6，价值陈述，不当事实引来源）。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 五个人体系统总览、消化道五部分、小肠吸收 | `digestive-system`（`five-systems`、`small-intestine-chapter`） | 00 正文链 `five-systems`；05 第 1 拍链 `small-intestine-chapter`；消化道在模型里只作淡色对照 |
| 吞咽与会厌 | `digestive-system`（`mouth-and-gullet-chapter`） | 01 细看 `Air and food share the throat` 链过去 |
| 植物的运输管、叶上的小孔、植物日夜都呼吸 | `plant`（`the-stem`、`leaves-make-food`） | 06 第 4–5 拍 + 正文链过去；植物标本从 `plant` 抄几何 |
| 空气是物质、有质量占空间（P4） | `states-of-matter`（`air-is-matter`） | 02 正文一句链过去 |
| 冷镜子上的水珠（凝结） | `water`（`the-water-cycle`） | 02 细看 `Misty breath` 链过去 |
| 肋骨之间的肌肉 | `muscles-chest`（`under-the-pecs`） | 01 细看 `The muscles that move the ribs` 链过去 |
| 昆虫怎样呼吸、运血 | `grasshopper`（`breathing-and-blood`） | 06 细看 `Insects do it differently` 链过去 |

**谁后发布谁补链接**：本主题发布时，主会话在 `digestive-system` 第 `five-systems` 章与 `small-intestine-chapter` 章、`plant` 第 `the-stem` 章的末段各加一句回链（内容代理不碰那两个目录）。

---

## 2. 事实表

`R:` = 研究条目（`facts.json`，摘录 ≤ 25 词、逐字核过）；**S#** = 来源号（§6.2）；可信度照研究：high（课纲、OpenStax、NASA、NOAA、同行评审）、medium（大学课程页、医院科普、临床规程、补习之外的二手整理）、low（维基、问答、商业补习）。"推得"= 由有来源的数相除得到，照写"推得 / 估算"。待核的在 §2.8。

### 2.1 课纲（S1，high）

| # | 事实 | R: | 页 |
|---|---|---|---|
| F-1 | 空气由氮气、二氧化碳、氧气、水蒸气等气体组成 | `moe-07` | 54 |
| F-2 | 呼吸系统：鼻、气管、肺；循环系统：心脏、血液、血管；描述功能 | `moe-08` | 54 |
| F-3 | 不要求肺泡、心腔与瓣膜 | `moe-09` | 54 |
| F-4 | 消化、呼吸、循环三系统协同进行生命过程 | `moe-10` | 54 |
| F-5 | 比较植物、鱼、人怎样吸进氧气、放出二氧化碳 | `moe-11` | 54 |
| F-6 | 比较植物和人体内物质的运输（植物：运食物和水的管；人：运消化后的食物、氧气、二氧化碳的血管） | `moe-12` | 54 |
| F-7 | 不要求 xylem、phloem、stomata、artery、vein、capillary 这些词 | `moe-13` | 54 |
| F-8 | VEA：用数据和信息客观地检验对人体的观察与解释 | `moe-14` | 54 |
| F-9 | P4：五个人体系统及功能；消化道五部分 | `moe-02`、`moe-05` | 53 |
| F-10 | 系统 = 各部分一起完成功能 | `moe-17` | 52 |
| F-11 | P6：生物需要呼吸作用释放的能量（本主题不讲） | `moe-19` | 78 |
| F-12 | P5 植物运输系统；不要求 xylem / phloem、相对位置、蒸腾拉力 | `moe-21` | 57 |
| F-13 | Foundation 的差别；Table 2 下划线规则 | `moe-15`、`moe-16` | 55、20 |
| F-14 | 课纲全文没有心率、呼吸频率、脉搏、膈、肋骨、肺泡、鳃、肺活量等词 | `moe-28` | 全文 |

### 2.2 空气（吸入与呼出）

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-20 | 干燥空气按体积：N₂ 78.08 %、O₂ 20.95 %、Ar 0.934 %、CO₂ 0.042 %；水蒸气"变化很大，通常约 1 %" | S3 NASA | `air-01` | high |
| F-21 | 2026 年 9 月莫纳罗亚月均 CO₂ 426.07 ppm（= 约 0.04 %） | S4 NOAA | `air-02` | high |
| F-22 | 教科书的大气表：N₂ 78.6、O₂ 20.9、H₂O 0.4、CO₂ 0.04（含 0.4 % 水蒸气，所以 N₂ 比 NASA 干空气高） | S2 22.4 表 22.2 | `air-03` | high |
| F-23 | **肺泡里的气体不等于呼出的气体**（肺泡：N₂ 74.9、O₂ 13.7、H₂O 6.2、CO₂ 5.2）；呼出气体混有气道里的空气，氧更多、二氧化碳更少 | S2 22.4 表 22.3 | `air-04` | high |
| F-24 | 呼出气体（教科书与课程的写法）：O₂ 约 16 %（16–17 %）、CO₂ 约 4 %（4–4.4 %）、N₂ 约 78 % 不变、水蒸气增多 | S5、S6 | `air-05`、`air-06` | medium |
| F-25 | 呼出气体的实测分压换算：O₂ 约 15.3 %、CO₂ 3.8 %、N₂ 74.7 %、H₂O 6.2 %（推得：mm Hg ÷ 760）；维基给的范围 O₂ 13.6–16.0、CO₂ 4.0–5.3、H₂O 5.0–6.3 | S8（推得）、S7 | `air-08`、`air-07` | medium / low |
| F-26 | 可以放心讲的四舍五入：O₂ 21 → 16（约四分之一被用掉，约四分之三被呼出：16 ÷ 21 ≈ 0.76，推得）、CO₂ 0.04 → 4（约 100 倍，推得）、N₂ 约 78 不变、水蒸气增多 | S5、S6 + 推得 | `air-09` | medium |
| F-27 | 新加坡的空气潮湿，所以吸入与呼出的水蒸气差别比教科书表格小（推断，没有本地测量） | 研究 §2a | — | 推断（只在细看，写"大概"） |

### 2.3 呼吸系统

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-30 | 鼻腔：提供空气通道，挡住灰尘与病菌，把空气加温、加湿 | S2 22.1 | `resp-01` | high |
| F-31 | 鼻毛与黏液挡住灰尘（补习讲义的说法） | S15；**待核** S2 22.1 原文有没有写鼻毛 | `sys-03` | low → 待核 |
| F-32 | 气管由 16–20 块 C 形软骨叠成，保持张开；下端分成左右两条支气管通到肺 | S2 22.1 | `resp-02` | high |
| F-33 | 呼吸时肺是被动的：膈与肋间肌收缩使胸腔变大，肺跟着扩张；平静呼气是被动的 | S2 22.3 | `resp-03` | high |
| F-34 | 肺从不完全排空（残气量），这让肺泡不塌陷 | S2 22.3 | `resp-04` | high |
| F-35 | 成人平静呼吸一次约 500 mL；肺总量男约 6,000 mL、女约 4,200 mL；**孩子的值没有找到** | S2 22.3 | `resp-05` | medium |
| F-36 | 休息时呼吸：6–11 岁每分钟 18–25 次（PALS 2015）；约 10 岁 18–30 次（OpenStax） | S9；S2 22.3 | `rr-02`、`rr-01` | medium |
| F-37 | 左肺比右肺小，左肺有容纳心脏的凹口 | **待核** S2 22.2 | — | 待核 |
| F-38 | 喉咙（咽）是空气和食物共用的通道；吞咽时会厌盖住气管入口 | **待核** S2 22.1 / 23.3；`digestive-system` 第 `mouth-and-gullet-chapter` 章已有来源 | — | 待核 |
| F-39 | 气管在食道前面 | **待核** S2 22.1；网格可量（MESH） | — | 待核 |

### 2.4 循环系统

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-40 | 心脏约拳头大小，位于两肺之间、胸腔正中；成人约 12 × 8 × 6 cm | S2 19.1 | `circ-04` | medium |
| F-41 | 心尖指向左下 | **待核** S2 19.1 | — | 待核 |
| F-42 | 成人休息时每个主要泵血腔每跳约 70 mL，约 5.25 L/min | S2 19.1 | `circ-01` | medium |
| F-43 | 成人休息时血液绕全身一圈约一分钟（推得：5–6 L ÷ 5.25 L/min；问答网站的说法相同）；**孩子的值没有找到** | S2 + S19 + 推得 | `circ-02` | low（只写"大约一分钟"） |
| F-44 | 两个回路：心 → 肺（吸收氧气、放出二氧化碳）→ 心；心 → 全身 → 心 | S2 19.1 | `circ-05` | high |
| F-45 | 刚在肺里吸收了氧的血是鲜红色，送出氧之后是较暗的红色，不是蓝色 | S2 18.1 | `circ-06` | high |
| F-46 | 皮肤下的血管看起来发蓝，取决于皮肤对不同波长光的散射与吸收、血的含氧量、血管粗细与深浅、人的视觉 | S29 | `mis-12` | high |
| F-47 | 血液的主要功能：把氧气和养分送到细胞，带走废物；消化后的养分在消化道被吸收进血液 | S2 18.1 | `circ-07`、`sys-01` | high |
| F-48 | 成人血量：男约 5–6 L、女约 4–5 L（约体重的 8 %） | S2 18.1 | `bv-03` | medium |
| F-49 | 孩子的估算血量每千克约 70–75 mL | S16 | `bv-01` | medium |
| F-50 | 十岁孩子约 2.2–2.4 L（**我们算的**：WHO 十岁体重中位数男 31.2 kg、女 31.9 kg × 70–75 mL/kg；WHO 参考人群，不是新加坡） | S16 + S18 + 推得 | `bv-04` | 估算 |
| F-51 | **不写**"血管连起来 10 万千米"：1929 年的旧估算，2024 年核查认为不可靠 | S20 | `circ-03` | — |
| F-52 | 心脏不造血；血细胞在骨髓里生成 | **待核** S2 18.2 | — | 待核 |
| F-53 | 休息时心跳：6–11 岁每分钟 75–118 次（醒着）、58–90 次（睡着）（PALS 2015；Cleveland Clinic 同） | S9、S10 | `hr-01`、`hr-02` | medium |
| F-54 | **提醒**：PALS 范围引自两本没有来源的教科书；《柳叶刀》2011 系统综述（69 项研究、143,346 名儿童）认为 2–10 岁的上限过高，APLS 的界线把约 40 % 健康十岁孩子的心跳、63 % 的呼吸判成异常 | S11 | `hr-03`、`hr-04` | high |
| F-55 | 8–17 岁孩子的平均最大心跳"一般在 190 多"；"220 减年龄"高估 | S10 | `hr-06` | medium |
| F-56 | 孩子运动时心跳能比成人升得更高 | S13 | `hr-07` | medium |
| F-57 | **运动后的心跳、呼吸次数（10–12 岁）没有找到来源**；Rowland & Cunningham 1997 只说同样负荷下呼吸频率随年龄下降，摘要无数 | S14 | `rr-04` | 未核到 → 模型用设计值（§2.9） |
| F-58 | 脉搏可以在手腕或脖子上摸到 | **待核** S2 20.x（脉搏一节） | — | 待核 |

### 2.5 三个系统一起工作

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-60 | 消化道吸收的养分进入血液；呼吸来的氧气扩散进血液，从肺到心脏，再到全身 | S2 18.1 | `sys-01` | high |
| F-61 | 补习讲义的说法"身体各部分用消化后的食物和氧气释放能量"——"释放能量"是 P6 的内容，**不用**，改用课纲的"进行生命过程" | S15 | `sys-02` | low（只作边界） |
| F-62 | 空气：鼻 → 气管 →（两条管）→ 肺；血：心 → 血管 → 全身 → 血管 → 心，两次到全身之间经过肺（课纲层面的路线，研究的综合） | S1 + S2 + S15 | `sys-04` | high（综合） |

### 2.6 补习讲义里的题型与说法（只用于 §1.5 与误解措辞）

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-65 | 补习讲义讲"肺泡"、肋骨与膈、心脏四腔、三种血管、休息 / 走 / 跑的心跳图和呼吸图 | S15 | `resp-07`、`rr-05` | low |
| F-66 | 练习题陷阱："心脏只泵氧气"、"呼吸系统由鼻、食道、肺组成"、血从肺先回心脏再到头、呼吸次数图不从 0 开始 | S15 | `mis-14` | low |

### 2.7 网格（MESH，从缓存的 Z-Anatomy 源量取；施工时 `report.md` 复核）

| # | 事实 | R: |
|---|---|---|
| F-80 | 五个肺叶合起来约 26.1 × 18.6 × 26.4 cm（成年男性） | `mesh-05` |
| F-81 | 气管网格长约 10.5 cm | `mesh-06` |
| F-82 | 四个心腔合起来约 11.9 × 11.3 × 10.8 cm；没有整颗心的网格；全部是开放曲面 | `mesh-08` |
| F-83 | 大血管与肺血管是短段（93–826 个三角形），开口；体循环血管 88 个具名对象，大多左右成对 | `mesh-09`、`mesh-10` |
| F-84 | 全部是成年男性解剖；没有找到开放许可的儿童器官网格 | `mesh-14` |
| F-85 | 网格中心坐标：脐在原点，地面 y ≈ −1.018 m，身高约 1.71 m（与 `digestive-system` 相同，`scripts/anatomy/digestive/organs.json`） | 本仓库 |

### 2.8 待核（研究没有覆盖；施工代理读原文，核不到按"退路"处理，结论记 §9）

| # | 要核的 | 去哪读 | 退路 |
|---|---|---|---|
| F-31 | 鼻毛与黏液挡灰尘 | S2 22.1 "The Nose and its Adjacent Structures" | 只写"挡住灰尘和病菌"（F-30 的原话），不写鼻毛、黏液 |
| F-37 | 左肺比右肺小、有凹口容纳心脏 | S2 22.2 "Gross Anatomy of the Lungs" | 01 第 4 拍删后半句；网格本身照样显示 |
| F-38 | 咽是空气和食物共用；吞咽时会厌盖住气管 | S2 22.1 "Pharynx"、"Larynx"；`digestive-system` 的来源 | 细看改成链 `digestive-system`，不写会厌 |
| F-39 | 气管在食道前面 | S2 22.1 "Trachea"；网格量（MESH） | 只按网格写"在这个模型里，气管在食道前面"（MESH） |
| F-41 | 心尖指向左 | S2 19.1 "Location of the Heart"、"Shape and Size" | 03 第 1 拍只写"在两肺之间、胸腔正中"；"偏左"由模型画面表达、不写成句子 |
| F-52 | 血细胞在骨髓生成 | S2 18.2 "Production of the Formed Elements" | 细看只写"心脏把血泵出去；它不造血，也不'洗'血"——后半句需要 F-52 或 S2 19.1 里"心脏是泵"的原话支撑，否则删去 |
| F-58 | 手腕、脖子能摸到脉搏 | S2 20.x 的 "Pulse" 一节 | 细看 `Count your own` 只数呼吸，不教摸脉搏 |
| F-70 | 鱼用鳃吸收溶在水里的氧气，二氧化碳从鳃排到水里 | **S40** OpenStax *Biology 2e* 39.1 "Systems of Gas Exchange"（CC BY 4.0） | 06 鱼两拍合一拍，只保留第一句并引核到的原文；核不到任何来源则删去鱼的拍，正文写"课纲也要求比较鱼，见……"——**不能留空** |
| F-71 | 水从口进、流过鳃、从鳃盖下（或鳃裂）流出 | S40 同节 | 字幕不写水的路线，只说"水流过鳃" |
| F-72 | 鳃丝很薄、有很多血管 | S40 同节 | 细看不写 |
| F-73 | 植物日夜都吸进氧气、放出二氧化碳（呼吸），主要经过叶上的小孔 | `plant` 主题 `leaves-make-food` 章引用的来源（施工时读 `src/content/topics/plant/data/sources.json` 对号，进本主题 S38）；必要时 S41 OpenStax *Biology 2e* 第 30 章 | 字幕只写"植物也吸进氧气、放出二氧化碳"，不写"主要经过叶上的小孔" |
| F-74 | 有光时叶子吸进二氧化碳、放出氧气制造食物 | 同上（`plant` 已发布的说法） | 链 `plant` 第 `leaves-make-food` 章、不在本主题复述 |
| F-75 | 植物有运水（从根往上）和运食物（从叶到各处）的管 | 同上（`plant` 第 `the-stem` 章） | 只引课纲原话（F-6） |
| F-76 | 鱼 / 植物标本的几何参考 | §3.3 参考图 R7–R9 | — |

### 2.9 模型（设计研究来源 S37 的内容；`table` 的每一格）

**T1 呼吸（`breath`）**：`phase` 三个值：`auto`（默认，呼吸动画照常一呼一吸）→ 膈 `cycle`、胸腔 `cycle`、空气 `cycle`（"一下一上 / 一大一小 / 一进一出"）；`in`（停在吸气末）→ 膈 `down`、胸腔 `bigger`、空气 `in`；`out`（停在呼气末）→ `up`、`smaller`、`out`（F-33）。`auto` 以外的值让四个呼吸动画缓停（现有 `enabled` 绑定），潮汐流随之停住，姿态由 `pose` 绑定给出。画面的移动量**放大了**（肺按呼吸中心缩放约 6 %、膈下移约 2.5 cm、肋骨约 3 %），细看写明"动得比真的明显"；真实的平静呼吸移动量没有核到来源，不写数。

**T2 空气（`air`，`tag: typical`）**：

| 样本 | N₂ % | O₂ % | CO₂ % | 水蒸气 % | 来源 |
|---|---|---|---|---|---|
| 吸入的空气 `in` | 78 | 21 | 0.04（两位小数） | 约 1（变化很大） | S3（F-20、F-21） |
| 呼出的气体 `out` | 78（§0.1-2） | 16 | 4 | 约 6 | S5、S6（F-24）；水蒸气 S8（F-25） |

小球（每个 = 1 %，向下取整）：吸入 N₂ 78、O₂ 21、CO₂ 0、水蒸气 1；呼出 78、16、4、6。合计不是正好 100（四舍五入、氩等别的气体约 1 % 没画）：细看 `Why the balls don't add up` 讲；呼出 78 + 16 + 4 + 6 = 104 也正是"实测氮气只有约 75 %"那条细看的引子。

**T4 跟着血走（`route`）**：`stop` 0（整圈都显示）、1 心脏把血送到肺 `heart-to-lungs`（暗红）、2 在肺里 `in-lungs`（暗红 → 鲜红）、3 回到心脏 `lungs-to-heart`（鲜红）、4 心脏把血送到全身 `heart-to-body`（鲜红）、5 在身体各处 `in-body`（鲜红 → 暗红）、6 回到心脏 `body-to-heart`（暗红）（F-44、F-45）。`blood` 状态：1、6 = `poor`；3、4 = `rich`；2 = `poor-to-rich`；5 = `rich-to-poor`。

**每一步显示哪些流**：第 k 步显示第 k 段和它前面的第 k − 1 段（第 1 步的前一段是第 6 段，绕回来），读者总能看到"从哪里来、到哪里去"；第 0 步显示全部。段 = 流：1 `heart-right` + `to-lungs`；2 `exchange-lungs` + `oxygen-lungs` + `co2-lungs`；3 `from-lungs` + `heart-left`；4 `to-body`；5 `exchange-body` + `oxygen-muscle` + `co2-muscle`；6 `from-body`。所以第 j 段的流 `visible: { in: [0, j, j + 1] }`（第 6 段写 `[0, 6, 1]`）。

**T5 运动（`effort`，`tag: sim`，S37）**：

| 活动 | 呼吸（次 / 分） | 心跳（次 / 分） | 肌肉需要 | 画面参数（不显示） | 依据 |
|---|---|---|---|---|---|
| 坐着休息 `rest` | 20 | 90 | `little` | 血流速度 × 1.0；空气 × 1.0；肌肉换气密度 0.25 | 呼吸在 18–25（F-36）、心跳在 75–118（F-53）范围中间 |
| 走路 `walk` | 26 | 115 | `more` | × 1.28；× 1.3；0.5 | 设计值：介于休息与跑步之间 |
| 跑步 `run` | 40 | 165 | `most` | × 1.83；× 2.0；1.0 | 设计值：心跳低于孩子平均最大心跳"190 多"（F-55），约其 85 % |

- 血流速度倍数 = 心跳 ÷ 90（只是画法：真实每跳泵出的血也会变多，没有核到孩子的数，不画、不写）；空气流速倍数 = 呼吸 ÷ 20（夹在 2 以内）；心跳动画频率 = 心跳 ÷ 60 Hz（1.5 / 1.92 / 2.75 Hz），呼吸动画 = 呼吸 ÷ 60 Hz（0.33 / 0.43 / 0.67 Hz）——**动画按真实时间跳动与呼吸**，所以不需要"画面放快"的说明。
- 卡片与 PLATE 的读数带 SIM、写"在这个模型里"；细看 `These numbers are a model` 写清：休息值落在指南范围里，走路、跑步的值是为显示"变快"而设的，不是测量，每个人不一样（F-57）。
- 单测钉住全部格子（§8.2）。

---

## 3. 对象、网格与零件

### 3.1 分区（组 = LAYERS 的行；顺序 = 编号顺序）

| 分区 | 组 id | EN / ZH | 零件 | 组色 | 右上卡 |
|---|---|---|---|---|---|
| 01 | `airway` | Nose, throat and windpipe / 鼻、咽和气管 | nasal-cavity, pharynx, epiglottis, larynx, trachea | `token:muscle-1` | ✓（第 1 列） |
| 02 | `lung-pair` | Lungs / 肺 | lung-right, lung-left | `token:bone` | ✓（第 2 列） |
| 03 | `heart-group` | Heart / 心脏 | heart, great-vessels, lung-vessels | `token:muscle-3` | ✓（第 3 列） |
| 04 | `body-vessels` | Blood vessels / 血管 | vessels-out, vessels-back | `token:muscle-2` | ✓（第 4 列） |
| 05 | `air-tubes` | Air tubes · further / 支气管 · 再进一步 | bronchi | `token:muscle-1` | `card: false` |
| 06 | `breathing-movers` | Breathing muscle and ribs · further / 横膈膜与肋骨 · 再进一步 | diaphragm, ribcage | `token:ink-3` | `card: false` |
| 07 | `digestion` | Digestive system / 消化系统 | oesophagus, stomach, small-intestine, large-intestine, liver | `token:food` | `card: false` |
| 08 | `leg-muscle-group` | Leg muscles / 腿部肌肉 | leg-muscles（左右两个真实节点） | `token:muscle-1` | `card: false` |
| 09 | `skeleton-context` | Skeleton / 骨骼 | skeleton | `token:bone` | `card: false` |
| 10 | `air-sample` | Jar of air / 空气瓶 | air-jar, n2-balls, o2-balls, co2-balls, h2o-balls | `token:ink-2` | `card: false`，组级 `scale` 不写（"1 球 = 1 %"不是长度，见 D13 的 note） |
| 11 | `compare` | Fish and plant / 鱼与植物 | fish-body, gills, gill-cover, plant-specimen | `token:ink-2` | `card: false` |
| — | `skin-context` | Body outline / 身体轮廓 | skin-outline、skin-wire（context） | `token:mannequin` | — |
| — | `side-table` 等 context | — | side-table、fish-tank、plant-pot（context，不属于任何组） | — | — |
| — | `air` | Air / 空气 | 只有流 | `token:air` | — |
| — | `blood-rich` | Oxygen-rich blood / 含氧多的血 | 只有流 | `token:blood-rich` | — |
| — | `blood-poor` | Oxygen-poor blood / 含氧少的血 | 只有流 | `token:blood-poor` | — |
| — | `gases` | Oxygen and carbon dioxide / 氧气与二氧化碳 | 只有流 | `token:oxygen` | — |
| — | `digested-food` | Digested food / 消化后的食物 | 只有流 | `token:food` | — |
| — | `fish-water` | Water past the gills / 流过鳃的水 | 只有流 | `token:cold` | — |
| — | `plant-flow` | Water and food in the plant / 植物里的水和食物 | 只有流 | `token:cold` | — |

右上零件链 4 列 = 鼻、咽和气管 → 肺 → 心脏 → 血管；`connects` 正好讲两条路：空气 nasal-cavity → pharynx → trachea → lung-right / lung-left；血 lung-right / lung-left → lung-vessels → heart → great-vessels → vessels-out → vessels-back → heart（**肺和心脏之间的连线是血管，不是气管**——误解 M-3 的画面回答）。`chainName` 都 ≤ 8 个字符（Nose、Throat、Windpipe、R. lung、L. lung、Heart、Vessels、Out、Back），避免 docs/25 §9.1 记的截断。

### 3.2 坐标与尺度

单位米，Y 向上、+Z 朝前、身体左 = +X（anatomy runbook §6），**脐在原点、不落地**，与 `digestive-system.glb` 完全相同（F-85），所以 `digestive-system` 的镜头数字可以直接参考：头 `target ≈ [0, 0.49, −0.075]`，胸 `≈ [0, 0.27, −0.07]`（施工时按网格量）。小桌（context `side-table`）放在身体左侧（画面右侧）`x ≈ 0.75`，桌面高与胸齐（`y ≈ 0.12`），同 `digestive-system` 的放大标本台位置；空气瓶在桌左半，鱼缸与植物在桌右半。**比例**：身体按真实大小（`units: { modelUnit: "m", scale: 1 }`）；桌上的三样是教具，彼此不按比例（鱼长约 0.24 m、植物高约 0.30 m、瓶高约 0.25 m），D13 的 `note` 写明。`views.section.plane: "xy"`（PLATE 立面画正面）。

### 3.3 Tier-1（一眼能认）与参考图

**Tier-1**（`archetypes.md` §3 生物）：① 两个大肺占满胸腔两侧，右肺三叶、左肺两叶，左肺内侧有凹口；② 气管有一圈圈软骨环，下端分两叉；③ 心脏在两肺之间、略偏左，尖朝左下，上面是主动脉弓；④ 血管从心脏出去分到头、两臂、肚子、两腿，再回来；⑤ 膈是肺底下的圆顶；⑥ 鼻腔在剖面上看得见从鼻孔到咽的通道；⑦ 鱼：流线形身体、鳃盖掀开后露出四道红色鳃弓与密密的鳃丝；⑧ 植物一眼认出是盆栽。

**参考图**（`scripts/geo/heart-and-lungs/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）：

| # | 来源 | 许可（下载时核） | 看什么 |
|---|---|---|---|
| R1 | Gray, *Anatomy of the Human Body* (1918)：肺正面、心与大血管正面、支气管树、主要动静脉全身图（Bartleby / Wikimedia Commons 扫描；图号待核） | 公有领域 | 器官相对位置、肺叶裂、心的朝向、血管走向 |
| R2 | OpenStax A&P 2e 图 22.2（呼吸系统总图）、22.12（肺）、19.2（心的位置）、20.x（全身循环示意） | CC BY-NC-SA 4.0（只看、不复制） | 课本的标准读法 |
| R3 | Wikimedia Commons "Respiratory system complete en.svg"（Mariana Ruiz，**许可待核**） | 待核 | 儿童课本式总图 |
| R4 | Wikimedia Commons 人体循环两色示意（找用红 / 暗红而不是红 / 蓝的版本；**许可待核**） | 待核 | 两个回路的版式 |
| R5 | Z-Anatomy GitHub README 截图 | CC BY-SA 4.0 | 源网格在原软件里的样子，核对导出没有缺件 |
| R6 | 本仓库 `digestive-system` 的 `hero-clean.png`、`ch01-five-systems.png` | 本站 | 同一身体的画法、ghost 程度 |
| R7 | OpenStax *Biology 2e* 图 39.x（鱼鳃）（CC BY 4.0，**待核**） | 待核 | 鳃弓数、鳃丝、鳃盖位置 |
| R8 | Wikimedia Commons 硬骨鱼鳃的公有领域或 CC 图（**待核**） | 待核 | 鳃盖掀开后的样子 |
| R9 | 本仓库 `plant` 的 `parts.json` 与截图 | 本站 | 植物标本的几何 |

### 3.4 网格 manifest 计划（`scripts/anatomy/heart-lungs/manifest.json`，由 `manifest.py` 对 `cache/inventory.json` 逐项核出；下表的源名都已在起草时从 inventory 查到，施工时生成器会再核一次）

| 节点 | 源对象（Z-Anatomy 名） | 源系统 | role | 三角形预算 | 备注 |
|---|---|---|---|---|---|
| `nasal-cavity` | Mucosa of nasal cavity（9,808，开放，80 条非流形边） | visceral | organ（open） | 4,000 | 外鼻由皮肤给；`closed: false`，剖切不填剖面 |
| `pharynx` | Nasopharynx、Oropharynx、Laryngopharynx（闭合） | visceral | tube | 3,500 | 空气与食物共用 |
| `epiglottis` | Epiglottis（3,376，闭合） | visceral | organ | 1,000 | 再进一步（细看） |
| `larynx` | Thyroid cartilage（4,488）、Cricoid cartilage（1,882） | skeleton | organ | 2,500 | 再进一步；没有整块 Larynx 网格 |
| `trachea` | Trachea（4,756，42 条边界边） | visceral | tube | 3,500 | 中心线 `_U`（0 = 喉端） |
| `bronchi` | Left main bronchus、Right main bronchus、Intermediate bronchus.r、Left superior / inferior lobar bronchus、Right superior / inferior lobar bronchus、Middle lobar bronchus.r、20 段 segmental bronchus（含 "(Anteromedial basal segmental bronchus of left lung)"）；按 `r'.*(main\|lobar\|intermediate\|segmental) bronch.*'` 取，28 个，82,944 | visceral | tube | 12,000 | 每段先抽中心线再合并；再进一步 |
| `lung-right` | Superior / Middle / Inferior lobe of right lung | visceral | organ（open seams） | 10,000 | 三叶合并，叶裂缝保留 |
| `lung-left` | Superior / Inferior lobe of left lung | visceral | organ | 8,000 | |
| `diaphragm` | Diaphragm（38,868，闭合） | muscles | organ | 5,000 | |
| `ribcage` | `r'.* rib'`（24 根）、`r'Costal cartilage.*'`、Manubrium of sternum、Body of sternum、Xiphoid process | skeleton | system | 14,000 | 单独一个节点，好让呼吸时动；X-RAY shell |
| `heart` | Left atrium、Right atrium、Left ventricle、Right ventricle（共 29,664，约 800 条边界边） | cardiovascular | organ（open） | 10,000 | **合并前**把四个腔的质心写进 `landmarks.json`（流在心里的路线用）；`closed: false`；外壳有洞时按 D2 退路 |
| `great-vessels` | Ascending aorta、Aortic arch、Thoracic aorta、Abdominal aorta、Brachiocephalic trunk、Superior vena cava、Inferior vena cava (thoracic part)、Inferior vena cava (abdominal part)、Left / Right brachiocephalic vein | cardiovascular | tube | 5,000 | 中性组织色（D4） |
| `lung-vessels` | Pulmonary trunk、Bifurcation of pulmonary trunk、Left / Right pulmonary artery、Left / Right superior / inferior pulmonary vein | cardiovascular | tube | 4,000 | 往返肺的血管 |
| `vessels-out` | Right / Left common carotid artery；Internal / External carotid artery .l/.r；Right / Left subclavian artery；Axillary、Brachial、Radial、Ulnar artery .l/.r；Coeliac trunk；Common hepatic artery；Proper hepatic artery；Splenic artery；Superior mesenteric artery；Common / External / Internal iliac artery .l/.r；Femoral、Deep femoral、Popliteal、Anterior tibial、Posterior tibial artery .l/.r；Dorsalis pedis artery .l/.r | cardiovascular | tube | 12,000 | 从心脏出去的血管（主线不叫 artery） |
| `vessels-back` | Internal / External jugular vein .l/.r；Right / Left subclavian vein；Axillary vein .l/.r；Brachial、Radial、Ulnar veins .l/.r；Basilic、Cephalic vein .l/.r；Common / External / Internal iliac vein .l/.r；Femoral、Deep femoral、Popliteal vein .l/.r；Anterior / Posterior tibial veins .l/.r；Great / Small saphenous vein .l/.r；Superior mesenteric vein；Splenic vein；Hepatic portal vein；Hepatic veins | cardiovascular | tube | 12,000 | 回心脏的血管 |
| `oesophagus`、`stomach`、`small-intestine`（Duodenum + Jejunum）、`large-intestine`（Ascending / Transverse / Descending / Sigmoid colon + Vermiform appendix）、`liver` | 同 `digestive` manifest 的源名 | visceral | organ（context 用低模） | 2,000 / 5,000 / 10,000 / 8,000 / 5,000 | 只作对照；`fillOpenings` 照 `digestive` 补胃前壁的展示窗 |
| `leg-muscles.l` / `.r` | Rectus femoris muscle、Vastus lateralis muscle、Vastus medialis muscle、Medial / Lateral head of gastrocnemius（.l / .r） | muscles | organ（bilateral） | 6,000 / 侧 | 第 05 章"肌肉需要更多氧"的落点 |
| `skeleton` | `digestive` manifest 的骨骼表**减去**肋骨、肋软骨、胸骨 | skeleton | system | 30,000 | context 级 |
| `skin-outline` / `skin-wire` | 同 `digestive`（core manifest 的皮肤） | regions | skin | 18,000 / 5,000 | context |

- **不取**：手指、脚趾、掌、足的细小血管（Proper palmar digital arteries 等，一个就上万三角形）；冠状血管（细看的配图已画）；肾与肾血管（课纲不要求，已知差距写"血也流到肾等器官，模型只画主要路线"）；脑（头部的血路在颅底转回，§3.6）；Pleura（112,288，与肺重叠）；瓣膜与乳头肌（不要求）；Vertebral artery（源只有 .l）。
- **预算**：呼吸 ≈ 64 k、循环 ≈ 43 k、消化对照 30 k、腿部肌肉 12 k、骨骼 30 k、皮肤 23 k → **≈ 202 k 三角形**；按 `digestive-system.glb` 的比例（233,786 三角形 ≈ 2.09 MB）估 ≈ 1.8–2.0 MB。soft 4 MB / 350 k、hard 8 MB / 500 k（anatomy runbook §5）。
- **许可与署名**（anatomy runbook §2 的四处）：glb `asset.copyright`（Z-Anatomy 两行原文 + 改动"structures selected for the respiratory and circulatory systems with digestive and skeletal context, simplified, renamed, centrelines and route landmarks baked"；若用了 D2 的退路，加 BP3D 4.0 那一行）；`THIRD-PARTY-NOTICES.md`（3D anatomy models 节加本 glb）；主题 `data/SOURCES.md`；`topic.yaml.note` + 00 章来源细看。逐件核许可（R: `mesh-03`：库里有几件第三方模型许可不同，但都不是心、肺、血管；Cardiovascular 的逐节点出处研究没核到，§9 记录）。

### 3.5 零件（22 个网格零件 + 9 个程序化零件 + 5 个 context）

| # | id | 组 | 源 | 材质（glb 零件写 `material`） | explode | connects | summary 要点 |
|---|---|---|---|---|---|---|---|
| 01 | `nasal-cavity` | airway | mesh | `tissue` + `token:muscle-1` | 前 0.03 | pharynx | 空气从这里进来；加温、加湿、挡住灰尘（F-30） |
| 02 | `pharynx` | airway | mesh | `tissue` + `token:muscle-2` | 后 0.03 | trachea | 空气和食物都经过的喉咙（F-38 待核） |
| 03 | `epiglottis` | airway | mesh | `tissue` | 后 0.02 | — | 吞咽时盖住气管的一片（再进一步） |
| 04 | `larynx` | airway | mesh | `tissue` + `token:bone` | 前 0.02 | trachea | 气管顶上的软骨，也叫喉（再进一步） |
| 05 | `trachea` | airway | mesh | `tissue` + `token:bone` | — | lung-right, lung-left | 一圈圈软骨让它保持张开；下端分成两条管（F-32） |
| 06 | `lung-right` | lung-pair | mesh | `tissue` + 淡粉 tint（`token:muscle-1` 浅一档） | 右 0.08 | lung-vessels | 空气里的氧气在这里进入血液，二氧化碳离开（F-44） |
| 07 | `lung-left` | lung-pair | mesh | 同上 | 左 0.08 | lung-vessels | 同上；比右肺小，给心脏留出位置（F-37 待核） |
| 08 | `bronchi` | air-tubes | mesh | `tissue` + `token:bone` | — | — | 气管分出的管，越分越细（再进一步） |
| 09 | `diaphragm` | breathing-movers | mesh | `muscle` + `token:muscle-3` | 下 0.04 | — | 肺下面圆顶形的肌肉；往下移时胸腔变大（F-33） |
| 10 | `ribcage` | breathing-movers | mesh | `tissue` + `token:bone` | — | — | 护住心和肺；吸气时往上往外移 |
| 11 | `heart` | heart-group | mesh | `muscle` + `token:muscle-3` | 前 0.06 | great-vessels | 由肌肉构成的泵，每跳一下把血挤进血管（F-40） |
| 12 | `great-vessels` | heart-group | mesh | `tissue` + 中性组织 tint | — | vessels-out | 心脏旁最粗的几条血管 |
| 13 | `lung-vessels` | heart-group | mesh | 同上 | — | heart | 把血从心脏送到肺、再送回心脏 |
| 14 | `vessels-out` | body-vessels | mesh | 同上 | — | vessels-back | 把血从心脏运到身体各处 |
| 15 | `vessels-back` | body-vessels | mesh | 同上 | — | heart | 把血从身体各处运回心脏 |
| 16 | `oesophagus` | digestion | mesh | `tissue` + `token:muscle-2` | — | stomach | 食道：食物走这里，空气走前面的气管 |
| 17 | `stomach` | digestion | mesh | 同上 | — | small-intestine | 消化系统的一部分（链 `digestive-system`） |
| 18 | `small-intestine` | digestion | mesh | `tissue` + `token:muscle-1` | — | large-intestine | 消化后的食物从这里进入血液（F-60） |
| 19 | `large-intestine` | digestion | mesh | `tissue` + `token:muscle-3` | — | — | 消化系统的一部分 |
| 20 | `liver` | digestion | mesh | `tissue` + `token:muscle-3` | — | — | 从小肠来的血先经过这里再回心脏（细看一句，再进一步） |
| 21 | `leg-muscles` | leg-muscle-group | mesh，`bilateral`（真实 `.r` 节点） | `muscle` + `token:muscle-1` | 外 0.03 | — | 跑步时更用力，需要更多氧气和消化后的食物 |
| 22 | `skeleton` | skeleton-context | mesh | `tissue` + `token:bone` | — | — | 支撑身体（X-RAY shell） |
| 23 | `air-jar` | air-sample | 程序化：`vessel`（玻璃，r 0.08 m、长 0.22 m）+ `lathe` 瓶盖 | `glass`、`plastic` | — | — | 一瓶空气的模型：每个小球代表 1 % |
| 24 | `n2-balls` | air-sample | 程序化：`sphere` r 0.006 `repeat` 80 沿 +X 间距 0.0135，一排横在瓶旁的托架上（`count` 绑定的零件不能有 `extra`，所以每种气体单独一排，见下注） | `token:air`（缎面） | — | — | 氮气：每个球 1 % |
| 25 | `o2-balls` | air-sample | 同上，`repeat` 25 | `token:oxygen` | — | — | 氧气 |
| 26 | `co2-balls` | air-sample | 同上，`repeat` 6 | `token:carbon-dioxide` | — | — | 二氧化碳 |
| 27 | `h2o-balls` | air-sample | 同上，`repeat` 8 | `token:cold` | — | — | 水蒸气 |
| 28 | `fish-body` | compare | 程序化：`sweep` 身体（椭圆截面、尾柄收细）+ `wing` 背鳍 / 臀鳍 / 尾鳍 + `sphere` 眼 + 口（`lathe` 开口） | `tissue` + 银灰 tint | — | gills | 鱼：从口吸进水 |
| 29 | `gills` | compare | 程序化：四道 `sweep` 鳃弓（弧形），每道一排 `repeat` 的薄 `box` 鳃丝（≤ 48 × 4） | `tissue` + `token:blood-rich` 浅一档 | 外 0.02 | — | 鳃：氧气从水进入血液，二氧化碳从血液进入水（F-70 待核） |
| 30 | `gill-cover` | compare | 程序化：`curvedPanel` 薄板，姿态 `gills-open` 绕前缘掀开 55° | `tissue` + 银灰 | 外 0.03 | — | 鳃盖：水从这里流出（F-71 待核） |
| 31 | `plant-specimen` | compare | 程序化：从 `plant` 抄辣椒的茎（`sweep`）与 6 片叶（`extrude` / `wing`），缩到 0.30 m 高；茎里一段剖开露出两条管（`extra` 细 `tube`） | `tissue` + 叶绿 tint（`token:food` 系）、茎 `wood` | — | — | 植物：主要通过叶上的小孔吸进氧气、放出二氧化碳；用管子运水和食物（F-73、F-75） |
| — | `skin-outline`、`skin-wire` | context | mesh | 墨色线框 / `membrane` + `token:mannequin` | — | — | 身体轮廓 |
| — | `side-table` | context | 程序化：`bevelBox` 桌面 + 四条腿 | `wood` | — | — | 放教具的小桌 |
| — | `fish-tank` | context | 程序化：`bevelBox` 玻璃缸 + 一块水面 `plane` | `glass` | — | — | 鱼缸 |
| — | `plant-pot` | context | 程序化：`lathe` 花盆 + 土面 | `plastic` 赭色 tint | — | — | 花盆 |

- **空气瓶的排法**：四排小球沿瓶旁的一根浅木托架横排（从上到下 N₂、O₂、CO₂、水蒸气），每排的第一个球在同一条竖线上，长度就是百分数——一张用小球拼的条形图；瓶本身是"这些气体装在一起"的示意。每排前面一块小木牌（context，无字；组名由引线标注给）。
- **鱼**按"教具模型"一级：每件 6–15 块、2–3 个材质槽，不追求物种（不点名是什么鱼，§7 同理）；鳃弓与鳃丝在 `gills-open` 姿态下从侧面看得清。
- **预算**：程序化零件合计 ≤ 20 k 三角形、≤ 18 次绘制（小球每排一个 InstancedMesh）；全页静止 ≤ 60 calls、运转 ≤ 80（§8.2）。

### 3.6 流（23 条；路径由管线 `routes.py` 从网格中心线与地标生成，§4.9；下表写零件顺序）

| id | group | 路径（零件顺序；多路径写条数） | speed（U/s） | count | size × | ends | 特别 | parts |
|---|---|---|---|---|---|---|---|---|
| `air-right` | air | 鼻孔 → 鼻腔（示意）→ 咽 → 喉 → 气管 → 右主支气管 → 叶 / 段支气管末端；**10 条路径**（右肺 10 段） | 0.12 | 300 | 1.0 | fade | `tidal: { sync: "breathe" }`（E-HL3） | nasal-cavity, pharynx, larynx, trachea, bronchi, lung-right |
| `air-left` | air | 同上，左肺；**9 条路径** | 0.12 | 270 | 1.0 | fade | 同上 | nasal-cavity, pharynx, larynx, trachea, bronchi, lung-left |
| `heart-right` | blood-poor | 上、下腔静脉末端 → 右心房质心 → 右心室质心 → 肺动脉干起点（心内示意）；2 条 | 0.10 | 60 | 1.4 | open | — | great-vessels, heart |
| `to-lungs` | blood-poor | 肺动脉干 → 分叉 → 左 / 右肺动脉 → 沿支气管旁 8 mm 到各叶的末端（肺内示意）；5 条 | 0.10 | 160 | 1.4 | open | — | lung-vessels, lung-right, lung-left |
| `exchange-lungs` | blood-poor | 各叶末端的一小段弧（"很细的血管"，示意）；5 条 | 0.05 | 60 | 1.4 | open | `stops: [{ at: 0, color: token:blood-poor }, { at: 1, color: token:blood-rich }]` | lung-right, lung-left |
| `from-lungs` | blood-rich | 叶末端 → 四条肺静脉 → 左心房质心；5 条 | 0.10 | 160 | 1.4 | open | — | lung-vessels, heart |
| `heart-left` | blood-rich | 左心房 → 左心室 → 升主动脉起点（心内示意）；1 条 | 0.10 | 40 | 1.4 | open | — | heart, great-vessels |
| `to-body` | blood-rich | 升主动脉 → 主动脉弓 → 分支：头 ×2（颈总 → 颈内动脉到颅底）、臂 ×2（锁骨下 → 腋 → 肱 → 桡动脉到手腕）、腹（胸 → 腹主动脉 → 肠系膜上动脉到空肠旁）、腿 ×2（腹主动脉 → 髂总 → 髂外 → 股 → 腘 → 胫后动脉到踝）；**7 条** | 0.14 | 420 | 1.4 | open | — | great-vessels, vessels-out |
| `exchange-body` | blood-rich | 7 条路径末端各一小段弧（头：颅底；臂：前臂；腹：空肠旁；腿：小腿）；7 条 | 0.05 | 105 | 1.4 | open | `stops: [{ at: 0, color: token:blood-rich }, { at: 1, color: token:blood-poor }]` | vessels-out, vessels-back, leg-muscles |
| `from-body` | blood-poor | 头 ×2（颈内静脉 → 头臂静脉 → 上腔静脉）、臂 ×2（肱静脉 → 腋静脉 → 锁骨下静脉 → 头臂静脉 → 上腔静脉）、腹（肠系膜上静脉 → 门静脉 → 穿过肝（示意）→ 肝静脉 → 下腔静脉）、腿 ×2（胫后静脉 → 腘 → 股 → 髂外 → 髂总 → 下腔静脉）；末端都到右心房；**7 条** | 0.14 | 420 | 1.4 | open | — | vessels-back, great-vessels, liver |
| `oxygen-lungs` | gases | 各叶的空气末端 → `exchange-lungs` 的弧中点；5 条 | 0.03 | 60 | 0.8 | fade | — | lung-right, lung-left |
| `co2-lungs` | gases | `exchange-lungs` 弧中点 → 空气末端；5 条；颜色 `token:carbon-dioxide` | 0.03 | 40 | 0.8 | fade | — | lung-right, lung-left |
| `oxygen-muscle` | gases | 腿的 `exchange-body` 弧中点 → 大腿 / 小腿肌肉内两点；4 条（两腿各 2） | 0.03 | 40 | 0.8 | fade | — | leg-muscles |
| `co2-muscle` | gases | 肌肉内 → 弧中点；4 条；`token:carbon-dioxide` | 0.03 | 30 | 0.8 | fade | — | leg-muscles |
| `food-in` | digested-food | 空肠表面若干点 → 肠系膜上静脉起点；4 条 | 0.03 | 60 | 0.8 | fade | — | small-intestine, vessels-back |
| `food-route` | digested-food | 肠系膜上静脉 → 门静脉 → 肝 → 肝静脉 → 下腔静脉 → 右心 → 肺动脉 → 右肺 → 肺静脉 → 左心 → 主动脉 → 左腿 → 大腿肌肉；1 条 | 0.10 | 120 | 0.9 | fade | 与血流同路，粒子小一档，叠在血流上 | small-intestine, vessels-back, liver, heart, lung-right, vessels-out, leg-muscles |
| `fish-water` | fish-water | 鱼口前方 → 口 → 四道鳃弓之间 → 鳃盖下流出；4 条 | 0.06 | 120 | 0.8 | fade | `clip: false` | fish-body, gills, gill-cover |
| `fish-o2` | gases | 鳃丝间的水 → 鳃弓；2 条；`token:oxygen` | 0.02 | 30 | 0.6 | fade | — | gills |
| `fish-co2` | gases | 鳃弓 → 鳃丝间的水；2 条；`token:carbon-dioxide` | 0.02 | 20 | 0.6 | fade | — | gills |
| `plant-water` | plant-flow | 盆土 → 茎里的运水管 → 叶；2 条 | 0.04 | 60 | 0.6 | fade | 与 `plant` 同色（`token:cold`） | plant-specimen |
| `plant-food` | plant-flow | 叶 → 茎里的运食物管 → 盆土；2 条；`token:food` | 0.03 | 40 | 0.6 | fade | 同上 | plant-specimen |
| `plant-o2` | gases | 叶外 → 叶背的几个小孔；3 条；`token:oxygen` | 0.02 | 20 | 0.6 | fade | 只在 06 第 4 拍 | plant-specimen |
| `plant-co2` | gases | 叶背的小孔 → 叶外；3 条；`token:carbon-dioxide` | 0.02 | 20 | 0.6 | fade | 只在 06 第 4 拍 | plant-specimen |

（合计 23 条流；人体 16 条、鱼 3 条、植物 4 条。）

- **分段流的通量**：首尾相接的血流（`heart-right` → `to-lungs` → `exchange-lungs` → `from-lungs` → `heart-left` → `to-body` → `exchange-body` → `from-body` → `heart-right`）各段按 `count / 长度 × speed` 大致相等（docs/06「流场」）；交接处端点间距 ≤ 5 mm（管线检查，§4.9）。
- **心里、肺里、肝里、末端的弧都是示意**（源网格没有这些路径）：`routes.json` 标 `schematic: true`，`report.md` 与已知差距写明；画面上它们都在半透明器官内部，不穿出器官外表面（六向射线检查同 `digestive` 的 `food_route.py`）。
- **章节里血流的可读性**：有血流的章把血管与心脏 `ghost`、肺 `ghost`（X-RAY 下），粒子 `size` 1.4；验收看两种主题下两种红都分得开（§8.2）。
- 运转时人体的 16 条流全开只在 05 第 5 拍（三系统同屏，+16 次绘制）；其余章 `layers` 只开需要的流组。

### 3.7 动画与姿态

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `breathe` | lung-right | `sequence` | keys：t 0 静止 → t 1.4 `scale [1.05, 1.07, 1.06]`（pivot = 肺门地标）→ t 3 静止；loop | 吸气在前半周期、呼气在后半；**频率由 `hz` 绑定按呼吸次数改**（E-HL2），`tidal` 流同步（E-HL3） |
| `breathe-left` | lung-left | `sequence` | 同上 | 同上（同一 `hz` 绑定） |
| `diaphragm-breathe` | diaphragm | `sequence` | t 1.4 `offset [0, −0.025, 0]` | 同上 |
| `ribs-breathe` | ribcage | `sequence` | t 1.4 `scale [1.03, 1.01, 1.04]`（pivot = 胸椎前缘） | 同上 |
| `heartbeat` | heart | `pulse` | `scale 1.04`、hz 1.5（默认 = 90 ÷ 60） | `hz` 绑定按心跳次数改 |
| `gill-flap` | gill-cover | `oscillate` | 绕前缘 4°、0.8 Hz | 只在 06；在 `gills-open` 姿态之上 |

| pose | 内容 | 用在 |
|---|---|---|
| `breathe-in` | 同 `breathe` 等四个动画 t 1.4 的变换 | T1（`phase: in`） |
| `lungs-aside` | lung-right offset [−0.06, 0, 0.02]、lung-left offset [0.06, 0, 0.02] | 03、04 看心与肺血管时（拨开两肺） |
| `gills-open` | gill-cover 绕前缘转 55° | 06 第 2–3 拍 |

**`prefers-reduced-motion`**：照引擎现有规则（动画停在静止姿态、流照常），T1 的姿态切换直接到终值。

### 3.8 剖切、X-RAY、拆开

- `views.cuts`：`midline`（`{ normal: [-1, 0, 0], offset: 0.008 }`，偏开中线 8 mm 切过一侧鼻腔，看鼻孔 → 鼻腔 → 咽 → 喉 → 气管 → 食道并排；label "Midline / 正中剖面"；施工时按网格量 offset）。
- `views.cutaway`（默认剖切，C 键与预设 `heart-inside` 用）：冠状面过心脏中心（`normal: [0, 0, -1]`，offset 按网格量），露出四个空腔——**再进一步**，节拍不用。
- X-RAY：`shell` = skin-outline、skeleton、ribcage（大多数章用 X-RAY 看胸腔里面）。
- EXPLODED（`explodeLabel` "Spread out / 摊开"）：肺左右拉开、心脏前移、膈下移、鼻腔前移；流禁用（引擎）。

### 3.9 HUD 数据

- **标题**：EN "The Heart and Lungs" / ZH "心与肺"；副标题 EN "Breathing and the blood: how oxygen and digested food reach every part of the body" / ZH "呼吸与血液：氧气和消化后的食物怎样送到全身"；`shortTitle` EN "Heart & lungs" / ZH "心肺"；`moe`：`["MOE 2023 Science P5 Human System (Respiratory and circulatory systems): air, nose, windpipe, lungs, heart, blood, blood vessels, integration with digestion", "MOE 2023 Science P5: compare how plants, fish and humans take in oxygen and give out carbon dioxide; compare transport in plants and humans"]`；`tags: [biology, psle, p5, space]`；`illustration: heart-and-lungs`；`note` 见 D13。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Air breathed in / 吸入的空气 | `N₂ 78 % · O₂ 21 % · CO₂ 0.04 %` | typical |
| Air breathed out / 呼出的气体 | `O₂ ≈ 16 % · CO₂ ≈ 4 %` | typical |
| At rest, age 6–11 / 6–11 岁休息时 | EN `heart 75–118 · breaths 18–25 per min` / ZH `心跳 75–118 · 呼吸 18–25 次 / 分` | typical |
| One round of the blood / 血液绕一圈 | EN `≈ 1 min · adult at rest` / ZH `约 1 分钟 · 成人休息时` | typical |

- **telemetry**（≤ 6，全部 `follow`）：

| key EN / ZH | follow | unit | scope |
|---|---|---|---|
| Breaths / 呼吸 | `breaths` | /min / 次 / 分 | — |
| Heartbeats / 心跳 | `beats` | /min / 次 / 分 | — |
| Oxygen in the sample / 样本里的氧气 | `o2` | % | observe |
| Carbon dioxide in the sample / 样本里的二氧化碳 | `co2` | % | observe |

  块尾 `SIM <本章观察的状态> · <本章改变量的值>`（如 `SIM IN THE LUNGS · STOP 2`、`TYPICAL BREATHED OUT`；E-HL1 让 `typical` 输出写 TYPICAL）。
- **镜头预设**（≤ 6，不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `whole-body` | BODY | 全身正面 3/4（同 `digestive-system` 的 hero），X-RAY，血管到四肢都在画面里 |
| 2 | `head-neck` | HEAD | 头颈侧前方，配 `midline` 剖切看鼻腔到气管 |
| 3 | `chest` | CHEST | 胸腔正面略俯，两肺、心、膈都在 |
| 4 | `heart-inside` | INSIDE · FURTHER | 心脏前方近景，`view: cutaway`（四个空腔，再进一步） |
| 5 | `side-bench` | BENCH | 小桌 3/4 前上方，瓶、鱼缸、植物同框 |
| 6 | `legs` | LEGS | 两腿前方，大腿与小腿肌肉、腿的血管 |

  hero 用 `views.assembled.camera`：胸到头 3/4 前右、X-RAY 皮肤半透；`views.cover` = 胸腔近景（肺、心、气管）。

---

## 4. 引擎与网格管线

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 空气由几种气体组成；呼出的不同 | 瓶旁四排小球，切换吸入 / 呼出时 O₂ 少 5 个、CO₂ 多 4 个、水蒸气多 5 个 | **E-HL1** `table`（`air`）→ 现有 `count` 绑定 |
| 鼻、气管、肺；空气的路 | 剖面上空气点从鼻孔一路到肺的每一叶，随呼吸一进一出 | 现有多路径流 + **E-HL3** `tidal` |
| 呼吸时胸腔变大、肺跟着胀 | 膈下移、肋骨外扩、肺胀开（动画），T1 切换两个姿态 | 现有 `sequence`、`pose` 绑定 + **E-HL2** `hz` |
| 心脏是泵 | 心脏按"每分钟几次"真实频率跳动 | 现有 `pulse` + **E-HL2** `hz` |
| 血液运送；两个回路；两种红 | 首尾相接的 9 段血流，在肺里由暗红变鲜红、在身体各处由鲜红变暗红；T4 一段段点亮 | 现有流 `stops` + `visible` 绑定（`in`）+ **E-HL4** token |
| 三系统协同；运动 | 食物点从小肠进血、跟着血过心、肺、心、到腿部肌肉；切到跑步时心跳、呼吸动画与血流同时变快，肌肉旁的氧气点变密 | **E-HL1**（`effort`）→ **E-HL2** `hz` + 数值 `intensity`（速度、密度） |
| 人、鱼、植物比较 | 小桌上的鱼（鳃盖掀开、水流过鳃）与植物（叶上的小孔） | 现有程序化积木、姿态、流 |

### 4.2 模型 `table`（E-HL1；`lib/sim/table.ts` + `table-schema.ts`，纯函数，有单测）

通用的"按控件取有来源的值"。同步、确定、< 0.05 ms；只在控件值变化时算。**每一格的数都要有来源**：行写 `source: ["S#", …]`（`sources.json` 里存在），`tag: sim` 的输出所在的行只能引设计研究来源（`design: true` 的那一条，本主题 S37），`tag: typical` 的输出所在的行不能只引设计研究来源——validate 强制。

```jsonc
"sim": {
  "kind": "table",
  "controls": [
    { "id": "phase", "kind": "choice", "default": "auto", "label": { "en": "Breathing", "zh": "呼吸" },
      "options": [ { "id": "auto", "label": { "en": "Breathing on its own", "zh": "自然呼吸" } }, { "id": "in", "label": { "en": "Breathe in", "zh": "吸气" } }, { "id": "out", "label": { "en": "Breathe out", "zh": "呼气" } } ] },
    { "id": "sample", "kind": "choice", "default": "in", "label": { "en": "Air in the jar", "zh": "瓶里的气体" },
      "options": [ { "id": "in", "label": { "en": "Breathed in", "zh": "吸入的空气" } }, { "id": "out", "label": { "en": "Breathed out", "zh": "呼出的气体" } } ] },
    { "id": "stop", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6], "default": 0, "label": { "en": "Step on the round", "zh": "这一圈的第几步" } },
    { "id": "activity", "kind": "choice", "default": "rest", "label": { "en": "Activity", "zh": "活动" },
      "options": [ { "id": "rest", … "Sitting at rest / 坐着休息" }, { "id": "walk", … "Walking / 走路" }, { "id": "run", … "Running / 跑步" } ] }
  ],
  "outputs": [
    { "id": "diaphragm", "kind": "state", "states": { "cycle": { "en": "Down and up in turn", "zh": "一下一上" }, "down": { "en": "Moves down", "zh": "往下移" }, "up": { "en": "Moves up", "zh": "往上移" } } },
    { "id": "chest", "kind": "state", "states": { "cycle": …, "bigger": …, "smaller": … } },
    { "id": "airflow", "kind": "state", "states": { "cycle": { "en": "In and out in turn", "zh": "一进一出" }, "in": { "en": "Flows in", "zh": "流进来" }, "out": { "en": "Flows out", "zh": "流出去" } } },
    { "id": "n2", "label": …, "unit": "%", "decimals": 0, "tag": "typical" },
    { "id": "o2", "unit": "%", "decimals": 0, "tag": "typical" },
    { "id": "co2", "unit": "%", "decimals": 0, "tag": "typical" },          // 格子可写 { "value": 0.04, "decimals": 2 } 覆盖
    { "id": "h2o", "unit": "%", "decimals": 0, "tag": "typical" },
    { "id": "where", "kind": "state", "states": { "whole": …, "heart-to-lungs": …, "in-lungs": …, "lungs-to-heart": …, "heart-to-body": …, "in-body": …, "body-to-heart": … } },
    { "id": "blood", "kind": "state", "states": { "both": …, "poor": …, "poor-to-rich": …, "rich": …, "rich-to-poor": … } },
    { "id": "breaths", "unit": "/min", "decimals": 0, "tag": "sim" },
    { "id": "beats", "unit": "/min", "decimals": 0, "tag": "sim" },
    { "id": "muscles", "kind": "state", "states": { "little": …, "more": …, "most": … } },
    { "id": "blood-pace", "decimals": 2, "tag": "sim" },                    // 画面参数，不进卡片
    { "id": "air-pace", "decimals": 2, "tag": "sim" },
    { "id": "muscle-need", "decimals": 2, "tag": "sim" }
  ],
  "bind": [
    { "control": "phase", "part": ["lung-right", "lung-left", "diaphragm", "ribcage"], "pose": { "in": "breathe-in", "out": null } },
    { "control": "phase", "animation": ["breathe", "breathe-left", "diaphragm-breathe", "ribs-breathe"], "enabled": { "eq": "auto" } },
    { "output": "n2", "part": "n2-balls", "count": true }, { "output": "o2", "part": "o2-balls", "count": true },
    { "output": "co2", "part": "co2-balls", "count": true }, { "output": "h2o", "part": "h2o-balls", "count": true },
    { "control": "stop", "flow": "heart-right", "visible": { "in": [0, 1, 2] } }, { "control": "stop", "flow": "to-lungs", "visible": { "in": [0, 1, 2] } },
    { "control": "stop", "flow": "exchange-lungs", "visible": { "in": [0, 2, 3] } }, …,                  // 每段流一条：第 j 段 in [0, j, j+1]，第 6 段 [0, 6, 1]（§2.9 T4）
    { "output": "breaths", "animation": ["breathe", "breathe-left", "diaphragm-breathe", "ribs-breathe"], "hz": { "per": 0.0166667 } },   // E-HL2
    { "output": "beats", "animation": "heartbeat", "hz": { "per": 0.0166667 } },
    { "output": "blood-pace", "flow": ["heart-right", "to-lungs", "from-lungs", "heart-left", "to-body", "from-body", "food-route"], "intensity": { "full": 1 } },   // E-HL2：数值输出 → 整条流
    { "output": "air-pace", "flow": ["air-right", "air-left"], "intensity": { "full": 1 } },
    { "output": "muscle-need", "flow": ["oxygen-muscle", "co2-muscle"], "intensity": { "full": 1, "mode": "density" } }
  ],
  "table": {
    "experiments": {
      "breath": { "keys": ["phase"], "rows": [
        { "when": { "phase": "auto" }, "set": { "diaphragm": "cycle", "chest": "cycle", "airflow": "cycle" }, "source": ["S2"] },
        { "when": { "phase": "in" },  "set": { "diaphragm": "down", "chest": "bigger", "airflow": "in" },  "source": ["S2"] },
        { "when": { "phase": "out" }, "set": { "diaphragm": "up", "chest": "smaller", "airflow": "out" }, "source": ["S2"] } ] },
      "air": { "keys": ["sample"], "rows": [
        { "when": { "sample": "in" },  "set": { "n2": 78, "o2": 21, "co2": { "value": 0.04, "decimals": 2 }, "h2o": 1 }, "source": ["S3", "S4"] },
        { "when": { "sample": "out" }, "set": { "n2": 78, "o2": 16, "co2": 4, "h2o": 6 }, "source": ["S5", "S6", "S8"] } ] },
      "route": { "keys": ["stop"], "rows": [ { "when": { "stop": 0 }, "set": { "where": "whole", "blood": "both" }, "source": ["S2"] }, … ] },
      "effort": { "keys": ["activity"], "rows": [
        { "when": { "activity": "rest" }, "set": { "breaths": 20, "beats": 90, "muscles": "little", "blood-pace": 1.0, "air-pace": 1.0, "muscle-need": 0.25 }, "source": ["S37", "S9"] },
        { "when": { "activity": "walk" }, "set": { "breaths": 26, "beats": 115, "muscles": "more", "blood-pace": 1.28, "air-pace": 1.3, "muscle-need": 0.5 }, "source": ["S37"] },
        { "when": { "activity": "run" },  "set": { "breaths": 40, "beats": 165, "muscles": "most", "blood-pace": 1.83, "air-pace": 2.0, "muscle-need": 1.0 }, "source": ["S37", "S10"] } ] }
    }
  }
}
```

**规则**：

1. **求值**：每个实验按它的 `keys` 取当前控件值，找到唯一一行，`set` 里的值进对应输出；不属于任何实验的输出 = NaN（显示 `—`）。所有实验同时求值（第 03 章没有卡片，心跳动画照样按 `activity` 的默认值 `rest` 跳）。
2. **格子覆盖小数位**：`{ "value": 0.04, "decimals": 2 }` 只覆盖这一格的显示（吸入 CO₂ 写 `0.04 %`、呼出写 `4 %`，不写 `4.00 %`）；表、卡片、PLATE、条形图同用。
3. **芯片**：`tag: typical` 的输出在卡片与 PLATE 上的芯片写 TYPICAL / 典型值、后面跟本行 `source` 的上标（点开来源弹层，同 detail 的 `[S#]`）；`tag: sim`（默认）照旧写 SIM / "在这个模型里"。卡片同时观察两种时各自带芯片。
4. `SEPARATE_EXPERIMENTS['table'] = true`（PLATE 块尾只写本章卡片观察的那个实验）。
5. **validate**（`table-schema.ts`，同 `matter-schema.ts` 的独立写法）：`keys` 是控件；每个实验对它的 `keys` 的全部值组合**恰好一行**（列出缺的、重的）；`set` 的键是输出、值的种类对得上（数 / 状态 id / 格子对象）；同一输出只属于一个实验；每行有 `source`，每个 S# 在 `sources.json`；`tag: sim` 的输出所在行至少引一条 `design: true` 的来源，`tag: typical` 的输出所在行至少引一条不是设计研究的来源；`count` 绑定的零件 `repeat.count` ≥ 该输出在表里的最大值（向下取整），否则报"球不够"；先猜后看的 `observe` 与 `change` 落在同一个实验里。
6. **测试 API**：`__atlas.engine.sim()` 照旧；`outputs` 里每个 typical 输出多一个 `sources` 字段。

### 4.3 绑定两件（E-HL2；`lib/sim/bind.ts` + `stages/model3d/PartNode.tsx` / `Flows.tsx`）

- **动画 `hz`**：`{ output, animation: id | [id…], hz: { per, origin? } }` → 动画频率 = (值 − origin) × per（Hz，≤ 4；`pulse`、`oscillate`、`contract` 直接换 `hz`；`sequence` 按"每秒几个循环"缩放时间轴，循环长度 = 最后一个 key 的 t）。**相位逐帧积分**（同 `rpm` 绑定），换值不跳；0.5 s 缓到新频率。几条动画同时绑同一输出时同相位（呼吸的四个动画一起动）。
- **数值 `intensity`**：`intensity` 现在只收向量输出（按路径 id）；加一条：**数输出 → 这条流的每条路径同一倍数**（`flow` 可写数组，一条绑定管几条流），`mode: "density"` 同样适用。其余规则（夹在 ±2、0.3 s 淡出、相位积分）不变。
- **validate**：`hz` 只能绑动画、输出是数；`intensity` 的数输出不能和同一条流的向量绑定同用。
- **测试 API**：`__atlas.engine.animation(id)` → `{ hz, phase }`（新）；`--beats` 每拍核对：有 `hz` 绑定的动画此刻的 `hz` = 输出 × per（± 1 %）。

### 4.4 潮汐流 `tidal`（E-HL3；`stages/model3d/Flows.tsx` + `flowMaterial.ts`，`schema.ts`）

```jsonc
{ "id": "air-right", "paths": [ … ], "tidal": { "sync": "breathe" } }   // 或 { "hz": 0.33 }
```

- 粒子沿路径的速度 = `speed` × 强度 × sin(2π φ)，φ = 被同步的动画的循环相位（`sequence` 的 t ÷ 循环长度）；`breathe` 的前半周期肺在胀，所以 φ ∈ [0, 0.5) 速度为正（向肺）、[0.5, 1) 为负（向鼻）。相位在 CPU 上积分成每条路径一个位移 uniform（已有的每路径相位通道），shader 不变复杂。
- 端点：潮汐流两端一律 `fade`（粒子在两端淡入淡出，不从肺"绕回"鼻孔）；粒子沿路径均匀撒，振幅 = 一次呼吸里走过的距离（`speed` ÷ (π × hz)），`speed` 由作者选到"空气点大约从咽走到肺门"（示意，细看写明真实的一口气走不了这么远这一层不写——只写"点的进退表示吸气、呼气"）。
- `RUN` 关时粒子停在原地（与其他流一致）；被同步的动画因 `enabled` 绑定缓停时，流跟着缓停（T1 拨到吸气 / 呼气时）；`prefers-reduced-motion`：粒子静止、不淡。
- **validate**：`sync` 是存在的动画；不能与 `stops`、`ends: open` 同用。**测试**：`tidal.test.ts`（相位 → 速度符号、积分位移、换 hz 不跳、两端淡出）。

### 4.5 五个 token（E-HL4；`src/theme/tokens.css` + docs/08 §1 的功能色表）

| token | 意思 | paper 方向 | cinema | 约束 |
|---|---|---|---|---|
| `--blood-rich` | 含氧多的血（鲜红） | 偏暖的鲜红，比 `--hot` 更红、更饱和 | 提亮约 12 % | 与 `--blood-poor` 明度差 ≥ 20（L\*），灰度可分；与 `--muscle-1/2/3` 色差 ΔE ≥ 15（粒子压在心脏、血管网格上要看得出） |
| `--blood-poor` | 含氧少的血（暗红） | 酒红、偏暗；**不偏紫、不偏蓝** | 提亮 | 色相与 `--blood-rich` 相差 ≤ 20°（都是红） |
| `--oxygen` | 氧气 | 清的青绿 | 提亮 | 与 `--xray` 区分（`plant` 用了 `--xray` 当氧气，记为以后的统一项，不在本主题改 `plant`） |
| `--carbon-dioxide` | 二氧化碳 | 暖灰 | 提亮 | 与 `--air`、`--neutral` 可分 |
| `--air` | 空气（混合气体） | 浅的蓝灰 | 提亮 | 在 paper 底色上对比度 ≥ 3:1 |

`tokens.css` 文件头的功能色表补五行（"one meaning each"）；单测 `tests/theme/tokens.test.ts`（若有）或新加一个：五个 token 两套主题都定义、上表的色差约束成立。

### 4.6 其余全部复用（已查 docs/06，未改代码）

试一试卡片（改变 / 不变 / 观察、记一行、`record.chart` 条形图——`breaths` 与 `beats` 单位都写 `/min`，一张图两组条；`o2` / `co2` / `h2o` 都是 `%`）、先猜后看（状态输出的 `means` 写状态 id；数输出用 `less` / `more` / `same` / `zero`）、`count` 绑定（`repeat` 零件只显示前 k 个）、`pose` 绑定、流 `visible`（`in` 条件）、多路径流、流 `stops`、背景章、`ghost`、命名剖切、预设 `view`、`bilateral` 网格零件、`sequence` / `pulse` / `oscillate` 动画、glb meshopt + 量化、`asset.copyright`。

### 4.7 引擎件清单与文件归属（一个 Opus 引擎代理，约 2 天；不改 `package.json`、不加依赖；在工作分支提交，push 等 Gavin）

| 件 | 优先级 | 文件 | 要点 | 估计 |
|---|---|---|---|---|
| E-HL1 `table` | 必须 | `src/engines/space-scene/lib/sim/table.ts`（新）、`table-schema.ts`（新）、`sim-schema.ts`（`SIM_KINDS` 加 `table`、输出 `tag`、格子小数位）、`lib/sim/index.ts`（注册、`SEPARATE_EXPERIMENTS`）、`explorer/TryIt.tsx` + `hud/PlateBlock.tsx`（TYPICAL 芯片与来源上标）、`lib/sim/text.ts`（格子小数位）、`scripts/validate-content.ts`（`source` 对 `sources.json`）、i18n | §4.2 | 0.9 天 |
| E-HL2 绑定 | 必须 | `lib/sim/bind.ts`、`sim-schema.ts`、`stages/model3d/PartNode.tsx`（动画频率与相位）、`stages/model3d/Flows.tsx`（数值 intensity）、`core/test-api.ts`（`animation`）、`scripts/shoot.ts`（每拍核对） | §4.3 | 0.4 天 |
| E-HL3 `tidal` | 必须 | `schema.ts`（流字段）、`stages/model3d/Flows.tsx`、`flowMaterial.ts` | §4.4；退路：两条流 `air-in` / `air-out` 用 `visible` 绑 `phase`，RUN 时只画吸气方向（字幕不说"一进一出"），§9 记录 | 0.5 天 |
| E-HL4 token | 必须 | `src/theme/tokens.css`、docs/08 §1 | §4.5 | 0.1 天 |
| 夹具主题 | 必须 | `src/content/topics/sample-table/`（新，`status: draft`，占位文字，只用程序化积木：一只"泵"（`vessel` + `pulse`）、一只"气球"（`sphere` + `sequence`）、一排 `repeat` 小球、两条流（一条 `tidal`）；三章：两行的 `table` + `count`、三行的 `table` + `hz` + 数值 `intensity`、`stop` + `visible`；背景章） | 不碰 `heart-and-lungs/` 目录 | 0.3 天 |
| 测试 | 必须 | `tests/space-scene/table.test.ts`、`hz-binding.test.ts`、`tidal.test.ts`、样板 `tests/space-scene/fixtures/heart-lungs-table.ts`（§4.2 的完整 `table` 数据 = 本主题的作者模板，含 §2.9 全表）、`tests-e2e/sample-table.spec.ts` | §4.8 | （含在上面） |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 表（table）」「SpaceScene · 潮汐流（tidal）」，改「试一试（sim）」的模型种类一行与绑定一行（`hz`、数值 `intensity`）；docs/08 §1 功能色表 | | 0.1 天 |

主会话不预装依赖（不需要）。网格管线（§4.9）与引擎并行：不碰同一个文件。

### 4.8 引擎验收

- [ ] 单测 `table.test.ts`：§2.9 全部格子逐格；每种控件组合恰好一行；不属于实验的输出为 NaN；格子小数位（`0.04 %`、`4 %`）；TYPICAL / SIM 芯片的选择；确定性；URL `sim=sample.out~activity.run` 往返。
- [ ] 单测 `hz-binding.test.ts`：值 → hz；相位连续（换值前后位置不跳）；`sequence` 的时间缩放；多动画同相；`prefers-reduced-motion`。
- [ ] 单测 `tidal.test.ts`：相位 → 速度符号；一周期净位移 0；换 hz 不跳；两端淡出。
- [ ] validate 报错用例：实验少一行 / 多一行、`set` 的键不是输出、状态 id 不存在、`source` 不在 `sources.json`、`sim` 输出的行没有设计来源、`typical` 输出的行只有设计来源、`count` 零件的 repeat 不够、`hz` 绑在流上、`tidal.sync` 不是动画、`tidal` 与 `stops` 同用。
- [ ] e2e（`sample-table`）：深链接 `?ch=…&sim=…` 后 `count` 与动画频率是终值；`]` 换值时动画缓到新频率、流变速；卡片 TYPICAL 芯片与来源上标可点；中文页；手机 390 × 844 卡片可用、按钮 ≥ 44 px。
- [ ] `sample-space`、`sample-forces`、`sample-matter`、`digestive-system`、`plant`、`states-of-matter` 截图与 `--beats` 不回归（新字段都是可选的）。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.9 网格管线（`scripts/anatomy`，native Blender 5.1；主会话或一个 Opus 代理在本机跑，不进沙箱；约 2.5 天）

照 anatomy runbook §4 的静态路径（`rig: false`）与 docs/25 §9.1 的施工记录，新 region `heart-lungs`：

| 步 | 做什么 | 文件 | 闸门 |
|---|---|---|---|
| P1 注册 | `run.py` 的 `TOPICS` 加 `heart-lungs`、所需输入（Visceral、CardioVascular、Muscular、Skeletal、Regions）；`optimize.ts` 的合法 topic 加它；**`optimize_static.ts` 的版权文字改成读 manifest 的 `changes` 字段**（现在写死了 "digestive region"），`digestive` 的 manifest 补同样字段、重跑后 **`digestive-system.glb` 的 SHA-256 必须不变**（记 `report.md`） | `run.py`、`optimize.ts`、`optimize_static.ts`、`digestive/manifest.py`（只加 `changes`） | digestive glb 字节不变 |
| P2 manifest | `scripts/anatomy/heart-lungs/manifest.py`：照 §3.4 的表对 inventory 逐项核，缺的报错（不发明替代）；`output: "heart-and-lungs.glb"`；`landmarks` 段：四个心腔质心、五个肺叶质心、肺门、鼻孔（皮肤 Nasal region 与鼻腔黏膜前开口之间）、膈顶、胸椎前缘；`routes` 段：每条路线的对象顺序（§3.6）与示意段的种子点；`MANIFEST-READY` 带 checksum | `heart-lungs/manifest.py`、`manifest.json`、`MANIFEST-READY` | 生成器 0 缺件；§3.4 每个节点都核到 |
| P3 build | `run.py --topic heart-lungs`：选取、脐中心坐标转换（`static_region.py` 现成）、按容差简化、**合并前**逐对象抽中心线（`centrelines.extract`；血管与支气管都是开口的管，用边界环）、写 `landmarks.json`；胃照 `digestive` 补展示窗 | `heart-lungs/centrelines.json`、`landmarks.json`、`cache/heart-lungs-raw.glb` | 每段中心线 `connectedFraction` 记录；抽不出的（分叉多的 Superior mesenteric artery 等）写 `schematic` 并用 manifest 种子 |
| P4 routes | `heart-lungs/routes.py`（照 `digestive/food_route.py`）：按 `routes` 段把各对象的中心线首尾相接（间隙 ≤ 5 mm 直接连，> 5 mm 记"桥"并在 `report.md` 列出），心内、肺内、肝内、末端弧按地标生成示意段；每 8 mm 一点；六向射线检查（路径点在所属器官 / 血管内部）；输出 `routes.json`（每条流的 `path` / `paths`、长度、示意段、桥） | `heart-lungs/routes.py`、`routes.json` | 非示意段的点 100 % 在管内；示意段不穿出所在器官外表面 |
| P5 optimize + audit | `optimize.ts`（meshopt + 量化，保留 `asset.copyright`）→ `audit_static.py --topic heart-lungs`（surface / topology / 预算 / 命名 / `_U` 单调 / 版权字段 / 左右节点） | `public/models/heart-and-lungs.glb`、`cache/heart-lungs-*.json`、`heart-lungs/report.md` | ≤ 4 MB、≤ 350 k 三角形；0 命名缺失 |
| P6 preview + 人审 | `preview.py`：front、back、left、exploded-by-role、skin overlay、**airway-only**（鼻腔到支气管）、**vessels-only**（含路线叠加）、heart close-up（看外壳有没有洞，D2 退路的依据）；`contact.py` 拼图 | `cache/heart-lungs-preview-*.png`、`heart-lungs/preview-review.md` | 逐图写观察：左右、肺叶数、心的朝向、血管到四肢是否连续、路线是否在血管里；**心脏外壳的结论写明**（保留 / 换 BP3D） |

- **写进 `parts.json`**：`scripts/geo/heart-and-lungs/build-flows.ts` 读 `routes.json` 写各流的 `path` / `paths`（同 `digestive` 的做法）；地标写进姿态的 pivot 与预设的 target。
- **重跑**：`python3 scripts/anatomy/manifests.py --topic heart-lungs && python3 scripts/anatomy/run.py --topic heart-lungs`（写进 `scripts/anatomy/README.md` 的新一节）。
- **不做**：rig、蒙皮、纤维、起止点（器官不做动作；呼吸与心跳是整件的 `sequence` / `pulse`）。

### 4.10 不做（v2）

- 心跳的"两下"（心房先、心室后）与瓣膜开合（docs/17 §3 课外深化"心脏的四个腔与瓣膜"，另立主题）。
- 读者自己拖动运动强度、输入自己量到的脉搏进表（卡片里一个数字输入框 + 记一行；约 1 天）。
- 呼吸时气管与鼻腔里的气流速度场、肺泡的放大标本（课纲不要求）。
- `plant` 主题把氧气从 `--xray` 改成 `--oxygen`（统一项，另开小任务）。

---

## 5. 章节

### 5.0 总表

`layers` 写组 id（流组单列）；`ghost` 写淡显的组；镜头写预设名或"拍内"（拍内写字面 `camera`，施工时按网格量）。

| # | id | 标题 EN / ZH | view | run | 剖切 | layers | ghost | sim.set | 镜头 |
|---|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | xray | true | — | airway, lung-pair, heart-group, body-vessels, digestion, skeleton-context, air, blood-rich, blood-poor | digestion | — | hero |
| 01 | `nose-windpipe-lungs` | Nose, windpipe and lungs / 鼻、气管和肺 | assembled（第 1–2 拍）/ xray | true | `midline`（第 1–2 拍） | airway, lung-pair, breathing-movers, digestion（只第 2 拍）, skeleton-context, air | heart-group | `phase: auto` | `head-neck` |
| 02 | `what-changes-in-the-air` | What changes in the air / 空气有什么变化 | assembled | false（第 4 拍 true） | — | air-sample（第 1–3 拍）；lung-pair, heart-group, gases, blood-poor, blood-rich（第 4 拍） | lung-pair（第 4 拍） | `sample: in` | `side-bench` |
| 03 | `heart-blood-vessels` | Heart, blood and blood vessels / 心脏、血液和血管 | xray | true | — | heart-group, body-vessels, lung-pair, skeleton-context, blood-rich, blood-poor | lung-pair | `activity: rest` | 拍内（心脏 3/4 前左） |
| 04 | `the-blood-route` | Through the lungs, then round the body / 先到肺，再到全身 | xray | true | — | airway, lung-pair, heart-group, body-vessels, leg-muscle-group, air, gases, blood-rich, blood-poor | lung-pair, body-vessels | `stop: 0` | `chest` |
| 05 | `three-systems` | Three systems working together / 三个系统一起工作 | xray | true | — | digestion, airway, lung-pair, heart-group, body-vessels, leg-muscle-group, air, gases, blood-rich, blood-poor, digested-food | lung-pair, body-vessels, digestion | `activity: rest` | `whole-body` |
| 06 | `plants-fish-humans` | Plants, fish and humans / 植物、鱼和人 | assembled | true | — | compare, airway, lung-pair, air, gases, fish-water, plant-flow | — | — | `side-bench` |

- 拍的 `sim.set` 叠在本章 `set` 上、不叠在上一拍上：每拍把要的控件写全（docs/06）。
- 每章 `labels` 只标本章讲到的，近景减量；`state.index` 列出正文和拍里讲到的零件（3–10 个）。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "The body on the stage is one adult man's anatomy, simplified; a pupil's organs are smaller. Only the main blood vessels are drawn. Bright and dark red dots show blood with more or less oxygen: blood is always red. Numbers marked TYPICAL come from the sources listed; numbers marked SIM are this model's, not measurements. Parts marked 'further' go beyond the P5 syllabus." / ZH "台上的身体是一位成年男子的解剖，已经简化；学生的器官比它小。只画了主要的血管。鲜红和暗红的点表示含氧多和含氧少的血——血总是红的。标 TYPICAL 的数来自列出的来源；标 SIM 的数是这个模型的，不是测量。标"再进一步"的部分超出 P5 课纲。"
- **summary**：You breathe in air and your heart pumps blood without stopping. This topic follows the air into the lungs and the blood round the body, and shows how they work with the digestive system. / 你不停地吸进空气，心脏不停地泵血。这个主题跟着空气走进肺，跟着血液走遍全身，看它们怎样和消化系统一起工作。
- **正文提纲**：① 课纲要什么（F-1–F-8）：空气的成分；鼻、气管、肺；心脏、血液、血管；三个系统一起工作；比较植物、鱼、人；比较植物和人的运输。② P4 学过的五个系统（F-9，`<TopicLink slug="digestive-system" ch="five-systems">`）：呼吸系统吸进氧气、放出二氧化碳，循环系统把东西运到全身。③ 这个模型：成年男性、半透明皮肤、只画主要血管、消化道画得很淡（D13）。④ 两种红（F-45；不是蓝，第 03 章细看讲为什么血管看起来发蓝）。⑤ 数字的两种芯片：TYPICAL 来自来源、SIM 是模型（D7）；范围照写。⑥ 标"再进一步"的部分（D6）。⑦ 小桌上的三样。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero，X-RAY）；labels trachea, lung-right, heart, vessels-out | Inside this adult body are the parts we breathe with and the parts that carry blood: the windpipe, the lungs, the heart and the blood vessels. / 这个成年人的身体里，有用来呼吸的部分，也有运送血液的部分：气管、肺、心脏和血管。 |
| 2 | camera `whole-body`；labels oesophagus, stomach, small-intestine；layers + digestion（不 ghost） | The digestive system is drawn faintly. It is the subject of another topic; here it shows where digested food enters the blood. / 消化系统画得很淡，它在另一个主题里讲；这里用它来看消化后的食物从哪里进入血液。 |
| 3 | camera `whole-body`；flows to-body, from-body；labels vessels-out, vessels-back | Bright red dots are blood carrying a lot of oxygen. Dark red dots are blood that has given much of its oxygen away. Blood is red in both. / 鲜红的点是含氧多的血，暗红的点是已经送出不少氧气的血。两种血都是红色的。 |
| 4 | camera `side-bench`；layers air-sample, compare；labels air-jar, fish-body, plant-specimen | On the small table are a jar of air, a fish and a potted plant for later chapters. They are models, not drawn to scale. / 小桌上放着一瓶空气、一条鱼和一盆植物，后面几章会用到。它们是模型，彼此不按比例。 |

- **试一试**：无。
- **细看**：`Where the model comes from`（Z-Anatomy / BodyParts3D 署名、改动、成年男性参考身体、只取主要血管，§3.4）；`Breathing is not the same as what you learn in P6`（一句：P6 会学身体怎样从食物中得到能量，这个主题只讲呼吸和血液——不展开 P6 内容）；`Standard and Foundation`（鱼的比较、运输比较、三系统协同是 Standard 的内容）。
- **本章索引**：trachea, lung-right, lung-left, heart, vessels-out, vessels-back, small-intestine, air-jar
- **名词首现**：respiratory-system、circulatory-system。

### 5.2 第 01 章 `nose-windpipe-lungs`

- **summary**：Air comes in through the nose, goes down the windpipe and into the two lungs. Breathing in makes the chest bigger, and air flows in. / 空气从鼻子进来，沿着气管往下，进入两个肺。吸气时胸腔变大，空气就流进来。
- **正文提纲**：① 鼻：鼻孔、加温加湿、挡住灰尘（F-30、F-31）。② 喉咙是空气和食物共用的（F-38）；气管在食道前面（F-39，M-11）。③ 气管的软骨环（F-32，"16 到 20 块"写进细看）；下端分成两条管通到两个肺（F-32）。④ 肺占满胸腔两侧，心脏在中间，肋骨护着（M-4，F-37）。⑤ 吸气、呼气：胸腔变大 / 变小，肺跟着（F-33），肺不会完全排空（F-34，M-5）。⑥ 试一试。⑦ 配图 1（§7）放在 ③ 之后。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | `head-neck`，`midline` 剖切，run（`air-*` 潮汐流）；labels nasal-cavity, pharynx | Air comes in through the nostrils. Inside the nose it is warmed and moistened, and dust is caught. / 空气从鼻孔进来。在鼻子里，空气被加温、变湿，灰尘被挡住。 |
| 2 | 同上；layers + digestion（只 oesophagus 不 ghost）；labels pharynx, trachea, oesophagus | From the throat, air goes down the windpipe, which lies in front of the gullet. Food goes down the gullet; air goes down the windpipe. / 空气经过喉咙进入气管。气管在食道前面：食物走食道，空气走气管。 |
| 3 | `chest`，xray，无剖切；labels trachea, lung-right, lung-left | Rings of cartilage keep the windpipe open. At the bottom it divides into two tubes, one to each lung. / 一圈圈软骨让气管一直张开。气管下端分成两条管，分别通到两个肺。 |
| 4 | `chest`；heart-group 不 ghost；labels lung-right, lung-left, heart, ribcage | The lungs are large. They fill most of the chest on both sides of the heart, inside the ribs. / 肺很大，占满了胸腔里心脏两边的大部分空间，外面有肋骨护着。 |
| 5 | `chest` 侧前方；run，`breathe` 等动画；labels diaphragm, ribcage, lung-right | To breathe in, the dome-shaped muscle under the lungs moves down and the ribs move up and out. The chest gets bigger and air flows in. The lungs do not move by themselves. / 吸气时，肺下面那块圆顶形的肌肉往下移，肋骨往上、往外移。胸腔变大，空气就流进来。肺自己不会动。 |

- **试一试 T1 吸气、呼气**：`vary: phase`；`keep: [{ en: "Same person, sitting still", zh: "同一个人，坐着不动" }]`；`observe: [diaphragm, chest, airflow]`；不记表；先猜后看：`prompt` EN "The muscle under the lungs moves down and the ribs move out. What does the air do?" / ZH "肺下面的肌肉往下移，肋骨往外移。空气会怎样？"；`start: { phase: out }`、`change: { phase: in }`、`observe: airflow`；`options`：`flows-in`（means `in`，"Flows in / 流进来"）、`flows-out`（means `out`，"Flows out / 流出去"）。卡片把 `phase` 拨到 `in` / `out` 时呼吸动画缓停、停在那个姿态，拨回 `auto` 又照常呼吸；换章、换拍时回到 `auto`。
- **细看**：`Rings in the windpipe`（16–20 块 C 形软骨，F-32）；`Air and food share the throat`（F-38，链 `<TopicLink slug="digestive-system" ch="mouth-and-gullet-chapter">`）；`Names for the parts that move · further`（膈、肋骨、肋间肌的名字，课纲没写；链 `<TopicLink slug="muscles-chest" ch="under-the-pecs">`）；`Air tubes · further`（支气管越分越细，X-RAY 下的 `bronchi`，课纲没写）；`The lungs never empty`（F-34）。
- **本章索引**：nasal-cavity, pharynx, trachea, oesophagus, lung-right, lung-left, diaphragm, ribcage, bronchi
- **名词首现**：nose、windpipe、lungs、breathing、diaphragm（细看）、air-tubes（细看）。

### 5.3 第 02 章 `what-changes-in-the-air`

- **summary**：Air is a mixture of gases. The air you breathe out still has most of its oxygen, but about a hundred times more carbon dioxide and more water vapour. / 空气是几种气体的混合。呼出的气体里，大部分氧气还在，但二氧化碳多了大约一百倍，水蒸气也更多。
- **正文提纲**：① 空气是物质（P4，`<TopicLink slug="states-of-matter" ch="air-is-matter">`），是几种气体的混合（F-1、F-20）：氮气约 78 %、氧气约 21 %、二氧化碳约 0.04 %（F-21）、水蒸气随天气变化（F-20）、其余约 1 % 主要是氩（细看）。② 呼出的气体（F-24、F-26）：氧气约 16 %、二氧化碳约 4 %、水蒸气更多；氮气身体不用也不造。③ "只吸氧气、只呼二氧化碳"不对（M-1）：约四分之三的氧气又被呼出来（F-26）。④ 少了的氧气去了哪里、多出来的二氧化碳从哪里来：在肺里进出血液（M-2，第 04 章再讲）。⑤ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | `side-bench`；`sample: in`；labels n2-balls, o2-balls, air-jar | Air is a mixture of gases. Here each ball stands for one part in a hundred: about 78 are nitrogen and 21 are oxygen. / 空气是几种气体混合在一起的。这里每个小球代表百分之一：大约 78 个是氮气，21 个是氧气。 |
| 2 | 同上；labels co2-balls, h2o-balls | Carbon dioxide is only about 0.04 per cent of air, less than one ball. How much water vapour there is depends on the weather. / 二氧化碳只占空气的大约 0.04%，连一个球都不到。水蒸气有多少，要看天气。 |
| 3 | `sample: out`；labels o2-balls, co2-balls, h2o-balls | Breathed-out air still has about 16 parts oxygen in a hundred. Carbon dioxide rises to about 4, a hundred times more, and there is more water vapour. / 呼出的气体里，每一百份仍有大约 16 份是氧气。二氧化碳增加到大约 4 份，是原来的一百倍；水蒸气也更多了。 |
| 4 | `chest`，xray，run；flows oxygen-lungs, co2-lungs, exchange-lungs；labels lung-right, lung-vessels | The missing oxygen has gone into the blood in the lungs. The extra carbon dioxide has come out of the blood. Green dots are oxygen; grey dots are carbon dioxide. / 少了的氧气在肺里进了血液，多出来的二氧化碳是从血液里出来的。绿点是氧气，灰点是二氧化碳。 |

- **试一试 T2 一瓶空气**：`vary: sample`；`keep: [{ en: "Same person, at rest", zh: "同一个人，休息时" }]`；`observe: [o2, co2, n2, h2o]`；`record: { chart: { y: ["o2", "co2", "h2o"] } }`（两行、条形图）；先猜后看：`prompt` EN "Compared with the air breathed in, the oxygen in breathed-out air is…" / ZH "和吸入的空气比，呼出的气体里的氧气……"；`start: { sample: in }`、`change: { sample: out }`、`observe: o2`；`options`：`all-gone`（means `zero`，"All gone / 全没了"）、`less`（means `less`，"Less / 少了一些"）、`same`（means `same`，"The same / 一样多"）。
- **细看**：`Why the balls don't add up`（四舍五入；氩约 0.9 %，F-20；呼出 78 + 16 + 4 + 6 > 100）；`Nitrogen is really about 75 per cent in breath`（F-25：水蒸气和二氧化碳多了，把氮气的份额冲淡了；氮气的量没变；很多课本两边都写 78 %）；`Deep in the lungs is different again`（F-23：肺深处的气体氧更少，呼出时混了气道里的空气；肺泡一词写明"课纲不要求"）；`Misty breath`（冷的镜子上起雾：呼出的水蒸气遇冷凝结，链 `<TopicLink slug="water" ch="the-water-cycle">`；新加坡的空气本来就潮，差别没课本表那么大，F-27）；`Air changes slowly`（CO₂ 今天约 0.04 %，F-21；只一句，不展开气候）。
- **本章索引**：air-jar, n2-balls, o2-balls, co2-balls, h2o-balls, lung-right, lung-vessels
- **名词首现**：oxygen、carbon-dioxide、water-vapour、nitrogen。

### 5.4 第 03 章 `heart-blood-vessels`

- **summary**：The heart is a pump made of muscle. With each beat it pushes blood into blood vessels, which reach every part of the body and bring the blood back. / 心脏是由肌肉构成的泵。每跳一下，就把血挤进血管；血管通到身体每个部分，再把血运回来。
- **正文提纲**：① 心脏在哪、多大（F-40、F-41，M-9），"约有主人的拳头那么大"。② 是由肌肉构成的泵，不造血、不"洗"血（M-6，F-52）。③ 血管：出去的、回来的（F-7：artery / vein / capillary 不要求，细看）。④ 血液运送消化后的食物、氧气、二氧化碳（F-6、F-47，M-12）。⑤ 血量：成人、十岁孩子的粗略估算（F-48–F-50）。⑥ 休息时心跳的范围与提醒（F-53、F-54，只在正文，不进字幕）。⑦ 配图 2（§7）放在 ② 之后。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 拍内镜头（心脏 3/4 前左），pose `lungs-aside`；labels heart, lung-right, lung-left | The heart sits between the lungs, in the middle of the chest, with its tip turned to the left. It is about the size of its owner's fist. / 心脏在两个肺之间、胸腔正中，尖端偏向左边。它大约有主人的拳头那么大。 |
| 2 | 同上；run（`heartbeat` 1.5 Hz）；labels heart, great-vessels | The heart is a pump made of muscle. Each beat squeezes blood out into the blood vessels. / 心脏是一个由肌肉构成的泵。每跳一下，就把血挤进血管。 |
| 3 | `whole-body`，xray；labels vessels-out, vessels-back, great-vessels | Blood vessels are tubes that reach every part of the body. Some carry blood away from the heart; others bring it back. / 血管是通到身体每个部分的管子。有的把血从心脏运出去，有的把血运回心脏。 |
| 4 | 同上；flows to-body, from-body, exchange-body；labels vessels-out, vessels-back | Blood carries oxygen and digested food to every part of the body and takes carbon dioxide away. / 血液把氧气和消化后的食物送到身体各处，并把二氧化碳带走。 |
| 5 | 同上；labels heart, vessels-out | An adult man has about 5 to 6 litres of blood. For a typical ten-year-old, a rough estimate is 2.2 to 2.4 litres. / 成年男子大约有 5 到 6 升血。一个十岁的孩子，粗略估算大约 2.2 到 2.4 升。 |

- **试一试**：无（"量自己的脉搏"是读者自己的事，在第 05 章细看）。
- **细看**：`Why veins look blue`（F-46：皮肤与光，血是红的）；`Three kinds of blood vessel · further`（artery / vein / capillary，动脉 / 静脉 / 毛细血管，课纲写明不要求，F-7）；`Four spaces inside · further`（`<FlyTo preset="heart-inside">`：心脏里有四个空腔，右边两个把血送到肺、左边两个把血送到全身；课纲写明不要求，F-3）；`How fast a heart beats at rest`（F-53、F-54：范围 + 《柳叶刀》提醒）；`Where the estimate comes from`（F-49、F-50：每千克 70–75 mL × WHO 十岁体重中位数，WHO 参考人群不是新加坡）。
- **本章索引**：heart, great-vessels, lung-vessels, vessels-out, vessels-back, lung-right, lung-left
- **名词首现**：heart、blood、blood-vessel。

### 5.5 第 04 章 `the-blood-route`

- **summary**：On each round, blood goes from the heart to the lungs, back to the heart, out to the body and back to the heart again. It turns bright red in the lungs and dark red in the body. / 血液每绕一圈，都是从心脏到肺、回心脏、再到全身、再回心脏。它在肺里变成鲜红，在身体各处变回暗红。
- **正文提纲**：① 从身体回来的血先被送到肺（F-44）。② 在肺里吸收氧气、放出二氧化碳，变鲜红（F-44、F-45，M-2）。③ 回到心脏，不直接去全身（M-7）。④ 被泵到全身，送出氧气、带走二氧化碳，变暗红（F-45）。⑤ 连接肺和心脏的是血管、不是气管（M-3）。⑥ 一圈大约一分钟（成人休息时，F-43）。⑦ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | `chest`，pose `lungs-aside`；`stop: 1`；labels heart, lung-vessels | Blood coming back from the body is dark red. The heart sends it first to the lungs. / 从身体回来的血是暗红色的。心脏先把它送到肺。 |
| 2 | `stop: 2`；layers + gases；labels lung-right, lung-vessels | In the lungs the blood takes in oxygen from the air and gives out carbon dioxide. It turns bright red. / 在肺里，血液从空气中吸收氧气，放出二氧化碳，变成鲜红色。 |
| 3 | `stop: 3`；labels lung-vessels, heart | The bright red blood goes back to the heart, not straight to the body. The tubes between the lungs and the heart are blood vessels, not air tubes. / 鲜红的血先回到心脏，而不是直接流到身体各处。连接肺和心脏的是血管，不是气管。 |
| 4 | `whole-body`；`stop: 5`（按 §2.9 的规则同时显示第 4、5 段：从心脏出去的鲜红血与身体里的换色弧）；labels vessels-out, leg-muscles | The heart pumps it out to every part of the body. There the blood gives oxygen to the body parts and takes in carbon dioxide, and turns dark red. / 心脏再把它泵到身体各处。在那里，血液把氧气交给身体各部分，带走二氧化碳，又变成暗红色。 |
| 5 | `whole-body`；`stop: 0`（整圈）；labels heart, lung-right, vessels-out, vessels-back | So on every round the blood passes through the heart twice: heart, lungs, heart, body, heart. At rest, one round takes about a minute in an adult. / 所以血液每绕一圈都经过心脏两次：心脏、肺、心脏、身体、心脏。成人休息时，绕一圈大约要一分钟。 |

- **试一试 T4 跟着血走**：`vary: stop`；`keep: []`；`observe: [where, blood]`；不记表；先猜后看：`prompt` EN "The blood has just picked up oxygen in the lungs. Where does it go next?" / ZH "血刚在肺里吸收了氧气。接下来它去哪里？"；`start: { stop: 2 }`、`change: { stop: 3 }`、`observe: where`；`options`：`back-to-heart`（means `lungs-to-heart`，"Back to the heart / 回到心脏"）、`to-body`（means `in-body`，"Straight to the body / 直接到身体各处"）。
- **细看**：`Two loops`（右边的心把血送到肺、左边的心把血送到全身——与第 03 章 `Four spaces inside` 呼应，标再进一步）；`Tiny blood vessels · further`（交换发生在很细的血管里，毛细血管一词课纲不要求；肺泡一词课纲不要求）；`About a minute`（F-43 的算法：成人血量 ÷ 每分钟泵出量，孩子的值没有找到）。
- **本章索引**：heart, lung-vessels, lung-right, lung-left, great-vessels, vessels-out, vessels-back, leg-muscles
- **名词首现**：oxygen-rich-blood（"含氧多的血"作名词卡，`see` blood）。

### 5.6 第 05 章 `three-systems`

- **summary**：Digested food and oxygen both enter the blood, which carries them to every part of the body. When you run, your muscles need more, so you breathe faster and your heart beats faster. / 消化后的食物和氧气都进入血液，由血液运到身体各处。跑步时肌肉需要更多，所以呼吸变快、心跳也变快。
- **正文提纲**：① 消化系统：消化后的食物从小肠进入血液（F-60，`<TopicLink slug="digestive-system" ch="small-intestine-chapter">`）。② 呼吸系统：氧气进入血液、二氧化碳离开（第 02、04 章）。③ 循环系统：把它们运到各处（F-6）。④ 身体各部分用消化后的食物和氧气进行生命过程（F-4，课纲原话；**不写"释放能量"**，F-61）。⑤ 系统 = 各部分一起工作（F-10）。⑥ 运动时（M-10）：肌肉需要更多氧气和消化后的食物、产生更多二氧化碳；呼吸、心跳变快（F-56）；休息时的范围（F-36、F-53、F-54）；运动后的数这个模型是设计值（F-57、§2.9）。⑦ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 拍内（腹部正面）；flows food-in, from-body；digestion 不 ghost；labels small-intestine, vessels-back, liver | Digested food passes from the small intestine into the blood. / 消化后的食物从小肠进入血液。 |
| 2 | `whole-body`；flows food-route + 全部血流；labels heart, lung-right, vessels-out | The blood carries it, along with oxygen from the lungs, through the heart to every part of the body. / 血液带着它，还有从肺里得到的氧气，经过心脏送到身体各处。 |
| 3 | `legs`；flows oxygen-muscle, co2-muscle, food-route, exchange-body；labels leg-muscles, vessels-out, vessels-back | Body parts, such as these leg muscles, use digested food and oxygen to carry out life processes. They give out carbon dioxide, which the blood takes to the lungs. / 身体各部分，比如这些腿部肌肉，用消化后的食物和氧气进行生命过程。它们放出二氧化碳，由血液带到肺。 |
| 4 | `whole-body`；`activity: run`；labels heart, lung-right, leg-muscles | When you run, your leg muscles work harder. They need more oxygen and digested food and make more carbon dioxide, so you breathe faster and your heart beats faster. / 跑步时，腿部肌肉更用力，需要更多氧气和消化后的食物，也产生更多二氧化碳，所以呼吸变快，心跳也变快。 |
| 5 | hero；`activity: rest`；全部流；labels small-intestine, trachea, heart | Three systems, one body: the digestive system takes in food, the respiratory system takes in oxygen and gives out carbon dioxide, and the circulatory system carries them all. / 三个系统，一个身体：消化系统吸收食物，呼吸系统吸进氧气、呼出二氧化碳，循环系统把它们运到各处。 |

- **试一试 T5 休息、走路、跑步**：`vary: activity`；`keep: [{ en: "Same person, same model", zh: "同一个人，同一个模型" }]`；`observe: [breaths, beats, muscles]`；`record: { chart: { y: ["breaths", "beats"] } }`（三行、条形图）；先猜后看：`prompt` EN "You stop resting and start running. Your heartbeat…" / ZH "从休息变成跑步，你的心跳……"；`start: { activity: rest }`、`change: { activity: run }`、`observe: beats`；`options`：`faster`（means `more`，"Gets faster / 变快"）、`slower`（means `less`，"Gets slower / 变慢"）、`same`（means `same`，"Stays the same / 不变"）。
- **细看**：`These numbers are a model`（§2.9：休息值在指南范围里，走路、跑步是设计值；每个人不一样；孩子运动时心跳能比成人升得更高，F-56；孩子平均最大心跳"190 多"，F-55）；`Count your own`（坐着数 30 秒呼吸、乘 2；原地轻轻跳一分钟再数；身体不舒服就不要做——价值陈述；摸脉搏一句待 F-58）；`Through the liver first · further`（从小肠来的血先经过肝再回心脏，模型里那段路是示意）；`Not the whole story`（血也流到肾、脑等许多器官，模型只画了主要路线）。
- **本章索引**：small-intestine, liver, heart, lung-right, vessels-out, vessels-back, leg-muscles, trachea
- **名词首现**：life-processes、pulse（细看）。

### 5.7 第 06 章 `plants-fish-humans`

- **summary**：Humans take in oxygen from air with their lungs; fish take in oxygen dissolved in water with their gills; plants take it in through tiny openings, mostly on their leaves. Plants move water and food in tubes; humans move digested food, oxygen and carbon dioxide in blood vessels. / 人用肺从空气中吸进氧气；鱼用鳃吸收溶在水里的氧气；植物主要通过叶上的小孔吸进氧气。植物用管子运水和食物；人用血管运送消化后的食物、氧气和二氧化碳。
- **正文提纲**：① 人（第 01–04 章一句回顾）。② 鱼：氧气溶在水里；水从口进、流过鳃、从鳃盖下出；在鳃里氧气进血、二氧化碳出血（F-70–F-72，M-14）。③ 植物：没有肺也没有鳃；主要通过叶上的小孔吸进氧气、放出二氧化碳，白天黑夜都这样（F-73，M-13）；有光时叶子另外吸进二氧化碳、放出氧气来制造食物（F-74，P6，`<TopicLink slug="plant" ch="leaves-make-food">`）。④ 运输：植物的两种管（F-75，`<TopicLink slug="plant" ch="the-stem">`）；人的血管（F-6）。⑤ **比较表**（MDX 表格，Haiku 核对与字幕一致）：

| | Humans / 人 | Fish / 鱼 | Plants / 植物 |
|---|---|---|---|
| Oxygen comes from / 氧气从哪里来 | air / 空气 | water / 水 | air / 空气 |
| Taken in through / 从哪里吸进 | nose, windpipe, lungs / 鼻、气管、肺 | gills / 鳃 | tiny openings, mostly on the leaves / 主要是叶上的小孔 |
| Carbon dioxide goes out through / 二氧化碳从哪里出去 | lungs, windpipe, nose / 肺、气管、鼻 | gills / 鳃 | tiny openings / 小孔 |
| Substances carried in / 用什么运送物质 | blood vessels: digested food, oxygen, carbon dioxide / 血管：消化后的食物、氧气、二氧化碳 | — | tubes: water, food / 管子：水、食物 |

  （鱼的运输一栏留空：课纲的运输比较只有植物和人，F-6。）
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | `chest`，xray，run；flows air-*, oxygen-lungs, co2-lungs；labels trachea, lung-right | Humans take in oxygen from the air through the nose, windpipe and lungs, and give out carbon dioxide the same way. / 人通过鼻、气管和肺从空气中吸进氧气，也从同一条路呼出二氧化碳。 |
| 2 | `side-bench` 近鱼缸；pose `gills-open`；flows fish-water；labels fish-body, gills, gill-cover | A fish takes in oxygen that is dissolved in water. Water goes in through the mouth, passes over the gills and flows out under the gill covers. / 鱼吸收溶解在水里的氧气。水从口进入，流过鳃，再从鳃盖下面流出去。 |
| 3 | 鳃近景；flows fish-o2, fish-co2；labels gills | In the gills, oxygen passes from the water into the blood, and carbon dioxide passes from the blood into the water. / 在鳃里，氧气从水进入血液，二氧化碳从血液进入水中。 |
| 4 | 植物近景；flows plant-o2, plant-co2；labels plant-specimen | A plant has no lungs or gills. It takes in oxygen and gives out carbon dioxide through tiny openings, mostly on its leaves, by day and by night. In light, its leaves also take in carbon dioxide and give out oxygen to make food. / 植物没有肺，也没有鳃。它主要通过叶上的小孔吸进氧气、放出二氧化碳，白天黑夜都这样。有光时，叶子另外吸进二氧化碳、放出氧气来制造食物。 |
| 5 | `side-bench` 拉远 + 身体同框（拍内）；flows plant-water, plant-food, to-body, from-body；labels plant-specimen, vessels-out | To move substances around, a plant has tubes that carry water and food. A human has blood vessels that carry digested food, oxygen and carbon dioxide. / 运送物质时，植物用管子运水和食物；人用血管运送消化后的食物、氧气和二氧化碳。 |

- **试一试**：无（比较表就是本章的"记录"）。
- **细看**：`Tiny openings have a name`（stomata / 气孔，课纲不要求，同 `plant` 的写法）；`Insects do it differently`（`<TopicLink slug="grasshopper" ch="breathing-and-blood">`，一句）；`Gills up close`（鳃丝很薄、有很多血管，F-72 待核）；`The fish and plant are models`（不点物种、不按比例）。
- **本章索引**：fish-body, gills, gill-cover, plant-specimen, lung-right, trachea, vessels-out
- **名词首现**：gills。

### 5.8 拍数与配图

00 · 4，01 · 5，02 · 4，03 · 5，04 · 5，05 · 5，06 · 5 = **33 拍**。试一试 4 张（01、02、04、05）。配图：01（airway-tree）、03（heart-vessels）；封面不放进章节。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（18 个候选，目标 14–16 个，正文用不到的删）

| id | EN / ZH | 定义要点 | see | 层 |
|---|---|---|---|---|
| `respiratory-system` | respiratory system / 呼吸系统 | 鼻、气管、肺：吸进氧气、放出二氧化碳的一组器官（不是 P6 的"呼吸作用"） | breathing, lungs | 主线 |
| `circulatory-system` | circulatory system / 循环系统 | 心脏、血液、血管：把东西运到全身的一组器官 | heart, blood-vessel | 主线 |
| `breathing` | breathing / 呼吸 | 吸气、呼气；胸腔变大变小，空气进出 | respiratory-system | 主线 |
| `nose` | nose / 鼻 | 空气进来的地方；加温、加湿、挡灰尘 | windpipe | 主线 |
| `windpipe` | windpipe / 气管 | 从喉咙到肺的管，有软骨环；也叫 trachea | lungs | 主线 |
| `lungs` | lungs / 肺 | 胸腔里的一对器官；氧气在这里进入血液 | windpipe | 主线 |
| `heart` | heart / 心脏 | 由肌肉构成的泵 | blood | 主线 |
| `blood` | blood / 血液 | 在血管里流动，运送消化后的食物、氧气、二氧化碳；总是红的 | blood-vessel | 主线 |
| `blood-vessel` | blood vessel / 血管 | 运血的管；动脉 / 静脉 / 毛细血管三个词课纲不要求 | heart | 主线 |
| `oxygen` | oxygen / 氧气 | 空气里约 21 % 的气体 | carbon-dioxide | 主线 |
| `carbon-dioxide` | carbon dioxide / 二氧化碳 | 空气里约 0.04 %；呼出的气体里约 4 % | oxygen | 主线 |
| `water-vapour` | water vapour / 水蒸气 | 气态的水；呼出的气体里更多 | — | 主线 |
| `life-processes` | life processes / 生命过程 | 生物活着要做的事（课纲用词） | — | 主线 |
| `gills` | gills / 鳃 | 鱼吸收水中氧气的器官 | — | 主线 |
| `nitrogen` | nitrogen / 氮气 | 空气里约 78 %；身体不用 | — | 主线（候选，可并入 oxygen 的定义） |
| `air-tubes` | air tubes / 支气管 | 气管分出、越分越细的管 | windpipe | 再进一步 |
| `diaphragm` | diaphragm / 横膈膜 | 肺下面圆顶形的肌肉 | breathing | 再进一步 |
| `pulse` | pulse / 脉搏 | 手腕、脖子上摸到的跳动，每分钟次数与心跳相同（F-58 待核） | heart | 再进一步 |

### 6.2 来源（施工时进 `sources.json`；访问日期一律 2026-10-21）

**编号**：本文自己编 S1–S41（研究只用行 id，没有 S 号）；**设计研究来源是 S37**（脚手架生成的 S1 设计研究条目改成 S37，`design: true`，S1 换成课纲）；待核的新来源从 **S40** 起；没用上的写进 `SOURCES.md` 的空号说明。

| S# | 内容 | 许可 / 性质 | 用于 |
|---|---|---|---|
| S1 | MOE CPDD，*Science Teaching & Learning Syllabus Primary Three to Six, Standard / Foundation*（2023 Primary Three Cohort 起实施，封面 Updated Jan 2026），https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023.pdf（第 14、15–18、20、52–57、78 页） | 官方 | §1.1、F-1–F-14 |
| S2 | Betts J.G. et al., *Anatomy and Physiology 2e*, OpenStax / Rice University：18.1、19.1、22.1、22.3、22.4（待核：18.2、19.1 心尖、20.x 脉搏、22.1 鼻毛与会厌、22.2 左右肺） | CC BY-NC-SA 4.0（只转述，不复制图文） | F-22、F-23、F-30、F-32–F-36、F-40–F-48、F-60 |
| S3 | NASA NSSDC, *Earth Fact Sheet*（大气成分，干燥空气） | 美国政府 | F-20、T2 |
| S4 | NOAA Global Monitoring Laboratory, *Trends in Atmospheric CO₂*（莫纳罗亚月均，2026 年 9 月） | 美国政府 | F-21 |
| S5 | Save My Exams, Cambridge IGCSE Biology 0610 revision notes 11.1.4 *Differences in inspired and expired air* | 商业复习资料 | F-24、T2 |
| S6 | LibreTexts, BIO 50 *Anatomy and Physiology*（Zingg）11.4 *A Closer Look at the Air We Breathe* | 课程页 | F-24、T2 |
| S7 | Wikipedia, *Breathing*（成分一节；只用来显示范围） | CC BY-SA | F-25 |
| S8 | East Tennessee State University（Currie），*The Gas Exchange Page*，表 B | 课程页 | F-25、T2 水蒸气 |
| S9 | PedsCases, *Pediatric Vital Signs Reference Chart*（Novak & Gill 2018，转载 AHA PALS 2015） | 临床教学 | F-36、F-53、T5 |
| S10 | Cleveland Clinic Health Essentials, *Pushing a Child's Heart Rate High*（儿科心脏科医生） | 医院科普 | F-53、F-55、T5 |
| S11 | Fleming S. et al., "Normal ranges of heart rate and respiratory rate in children from birth to 18 years of age: a systematic review of observational studies", *The Lancet* 2011;377:1011–1018（PMC3789232） | 同行评审 | F-54 |
| S12 | Wallis L.A. et al. 2005（开普敦 1,109 名学童的休息心跳、呼吸） | 同行评审（数据只在图里） | 不用（空号说明） |
| S13 | Children's Health（Dallas），*What is a normal heart rate for kids?* | 医院科普 | F-56 |
| S14 | Rowland T.W., Cunningham L.N., *Chest* 1997（儿童运动通气的纵向研究） | 同行评审（只读摘要） | F-57（只记"没有数"） |
| S15 | Geniebook, Primary 5 Science: Human Respiratory System / Human Circulatory System | 商业补习 | F-31、F-61、F-65、F-66、§1.5 |
| S16 | University of Iowa Health Care, Anesthesia protocol *Maximum Allowable Blood Loss*（估算血量表） | 临床规程 | F-49、F-50 |
| S17 | Linderkamp O. et al., *Eur J Pediatr* 1977（儿童血量） | 同行评审 | 不用（空号说明：只有列线图） |
| S18 | WHO 2007 Growth reference 5–19 years, Weight-for-age 5–10 years（男、女，10:0 行） | WHO | F-50 |
| S19 | I'm a Scientist（UK）问答，2014-03-20 | 问答（low） | F-43 |
| S20 | GIGAZINE 对 Kurzgesagt 2024 核查"血管 10 万千米"的报道 | 新闻 | F-51（只记"不写"） |
| S21 | Allen M., *Misconceptions in Primary Science*（OUP 2010），第 29–34、35–40 页（经 SCIMAP 索引） | 教师用书 | §1.4 |
| S22 | Ozgur S. 2013, *Int. J. Environmental & Science Education*（经 SCIMAP 转录） | 同行评审 | §1.4 |
| S23 | Mohapatra A.K., Mukharjee S. 2022, *School Science*（NCERT），第 87–90 页 | 期刊 | §1.4 |
| S24 | Fokides E., Mastrokoukou A. 2018，第 155–156 页 | 期刊 | §1.4 |
| S25 | Arnaudin M.W., Mintzes J.J. 1985, *Science Education* 69(5)（经 ERIC ED309037 摘要） | 同行评审 | §1.4 |
| S26 | Pelaez N.J. et al. 2005, *Adv Physiol Educ* 29(3) | 同行评审 | §1.4（只作背景） |
| S27 | Ahi B., Balci S. 2017 | 期刊 | §1.4 |
| S28 | Silva M., Almeida A. 2017 | 会议论文 | §1.4 |
| S29 | Kienle A. et al., "Why do veins appear blue? A new look at an old question", *Applied Optics* 1996;35(7):1151 | 同行评审 | F-46 |
| S30 | 香港教育局，*English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S.1–3)*（2017） | 官方词表（繁体） | §6.1 |
| S31 | 中文维基（zh-sg 变体）：呼吸、心率、呼吸频率、脉搏、支气管…… | CC BY-SA | §6.1 |
| S32 | 《联合早报》2023-09-21 第 6 版；伊丽莎白医院中文页 | 新加坡用法 | §6.1 |
| S33 | Z-Anatomy（GitHub `LluisV/Z-Anatomy`，PC-Version 分支，`Resources/Models/FBX/`、`License.txt`） | CC BY-SA 4.0 | 网格 |
| S34 | BodyParts3D（DBCLS）许可页 | CC BY 4.0（现行）/ CC BY-SA 2.1 JP（历史署名） | 网格上游；D2 退路 |
| S35 | HRA 3D Reference Objects（NIH 3D） | CC-BY | 不用（空号说明） |
| S36 | Creative Commons, *Compatible licenses* | CC | 许可混用 |
| **S37** | **本设计研究**：模型是成年男性参考解剖的简化；`table` 的 T1 状态、T2 小球的取整、T4 路线、T5 的设计值与画面参数（§2.9）；流在心、肺、肝与末端的示意段；呼吸动画的放大量 | `design: true` | 规格行以外的 SIM 读数、卡片、PLATE、细看 |
| S38 | 本仓库的 `plant`、`digestive-system`、`states-of-matter`、`water`、`grasshopper`、`muscles-chest` 主题（链接与几何）；`plant` 引用的来源在施工时逐条对号（F-73–F-75） | 本站 | 06、链接 |
| S39 | Gray H., *Anatomy of the Human Body* (1918) | 公有领域 | 参考图 R1、位置核对 |
| S40 起 | 待核（§2.8）：S40 OpenStax *Biology 2e* 39.1（鱼鳃，F-70–F-72）；S41 OpenStax *Biology 2e* 第 30 章（植物的气体交换，F-73 的后备）；其余待核项都在 S2 的其他小节里，核到后不另编号 | CC BY 4.0 | §2.8 |

**不用**（研究已标出或本文决定）：S12、S17、S35；"血管 10 万千米"（S20 只记"不写"）；研究里的 Connett 1994（新加坡儿童肺功能，只有摘要，不写肺活量）。

---

## 7. 图像清单（只用已审草稿，不出新图）

`art/planned/heart-and-lungs/` 的三张草稿都已看过（2026-10-21；`art/planned/manifest.jsonl` 第 68–70 行记了生成时的核对）：石墨铅笔画、灰度、透明底、无文字、无箭头、无血。**图只当插画，不当事实依据**；入库时主会话逐张再看一遍下面的核对点。

| 草稿 | 看到的 | 决定 | 入库为 |
|---|---|---|---|
| `heart-and-lungs.png`（1024²） | 正面：带软骨环的气管分成两条主支气管；画面左（身体右）肺三叶，一条水平裂、一条斜裂；画面右（身体左）肺两叶、一条斜裂，内侧凹口；心脏在两肺之间偏画面右，尖朝右下，主动脉弓上三条分支，肺血管从两侧伸出；心表面画了冠状血管 | **封面**：同 Tier-1 ①–③，与模型同一读法 | `public/illustrations/heart-and-lungs.webp` |
| `heart-and-lungs-airway-tree.png`（1536 × 1152） | 头的正中剖面（鼻腔、口、咽、喉），接一条有环的气管，下端分成两条，在半透明的两肺里越分越细；肺下面一片圆顶形的膈 | **配图 1**，第 01 章 ③ 段后。图注 EN "Air goes from the nose down the windpipe, which divides into two tubes, one to each lung. Inside the lungs the tubes branch many times (beyond the syllabus)." / ZH "空气从鼻子进入气管，气管分成两条管，分别通到两个肺；在肺里，这些管又分了很多次（超出课纲）。" | `public/illustrations/figures/heart-and-lungs-airway-tree.webp` |
| `heart-and-lungs-heart-vessels.png`（1536 × 1152） | 一颗心的正面外观，尖朝画面右下；主动脉弓上三条分支，上腔静脉在画面左，肺动脉干在前；心表面有分叉的细血管；没有剖开、没有瓣膜 | **配图 2**，第 03 章 ② 段后。图注 EN "The outside of a heart, with the large blood vessels at the top. The fine vessels on its surface carry blood to the heart muscle itself." / ZH "心脏的外面，顶上是几条大血管。表面那些细细的血管，把血送给心脏自己的肌肉。" | `public/illustrations/figures/heart-and-lungs-heart-vessels.webp` |

- **核对点**（主会话入库前）：三张都无文字、无水印；封面的左右（画面左 = 身体右，三叶）不能镜像；airway 图里的膈两侧肺底略低于膈缘，是肋膈角的正常样子，不改；heart 图的"细血管把血送给心脏肌肉"需要一条来源（S2 19.1 冠状循环，**待核**），核不到就把图注后半句删掉；图注不点"冠状动脉"这个词。
- 转换：`png` → `webp`（同已发布主题的做法，用仓库现有的转换脚本或已有依赖 `sharp`；不加依赖）。`art/planned/heart-and-lungs/` 的原稿保留。
- **缺的图（不补）**：鱼鳃、植物叶背的小孔、两个回路的示意图——这三处都由 3D 模型讲。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md` 与 `anatomy-mesh-runbook.md`；**不用 Codex**；本主题不需要新依赖；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

分工原则：**Opus** 做引擎、网格管线、几何与视觉、内容决定（拍、镜头、标注、`sim.set`）、中文、事实与代码的审查；**Sonnet** 起草英文（正文、字幕、零件说明、名词、来源）、读原文核事实（§2.8 待核）、截图 QA；**Haiku** 做机械检查（脚本能判的一致性）。网格管线要 native Blender 5.1：由**主会话或一个 Opus 代理在本机终端**跑（anatomy runbook §3），不能在受限沙箱里声称跑过。

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 §3 P5 行改成"→ docs/40"、docs/README 加一行；`docs/review-queue.md` 加 §0.1 的六项 | 主会话 | docs/40、docs/17、docs/README、review-queue | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts heart-and-lungs --engine space-scene --subject biology --title-en "The Heart and Lungs" --title-zh "心与肺"`；把 S1 设计研究条目改成 S37；R1–R9 参考图下到 `scripts/geo/heart-and-lungs/refs/`、逐张记许可 | 主会话（参考图交 Sonnet：只下载 CC / 公有领域，写许可清单） | 主题目录、refs | validate 绿；参考图逐张看过 | 0.4 天 |
| P | 网格管线 P1–P6（§4.9）；`digestive-system.glb` 字节不变 | 主会话 / Opus（管线），本机 native Blender | `scripts/anatomy/**`（`heart-lungs/` 全部、`run.py`、`optimize.ts`、`optimize_static.ts`、`digestive/manifest.py` 只加 `changes`）、`public/models/heart-and-lungs.glb`、`THIRD-PARTY-NOTICES.md` | `report.md` 预算内、0 命名缺失；`preview-review.md` 逐图写观察；心脏外壳结论；`routes.json` 非示意段 100 % 在管内 | 2.5 天 |
| E | E-HL1–E-HL4 + 夹具 `sample-table` + 测试 + docs/06、docs/08 | Opus 引擎（一个代理），与 P 并行 | §4.7；**不碰** `src/content/topics/heart-and-lungs/`、`scripts/anatomy/` | §4.8 全勾 | 2 天 |
| D1 | 数据骨架：`topic.yaml`、`parts.json` 的网格零件（读 glb 节点）、程序化零件（瓶、小球、鱼、植物、桌、缸、盆）、组、`build-flows.ts` 写流、动画、姿态、剖切、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后接） | Opus 内容（几何），P 出 glb 后开始（程序化零件可先做） | `scripts/geo/heart-and-lungs/build-parts.ts`（总装）、`specimens/{jar,fish,plant}.ts`、`build-flows.ts`、`chapters/*.mdx` frontmatter | `build-parts` 生成 `parts.json`，validate 0 error | 2 天 |
| D2 | R2 几何两轮（并排参考图：肺叶、心的朝向、血管到四肢、鱼鳃、植物）→ R3 材质（两种红在 paper / cinema 下可分；ghost 程度）→ R4 流与动画（呼吸、心跳、潮汐流、9 段血流首尾相接）；E 合并后接 `sim` 与绑定 | Opus 内容（视觉） | 同上 + `docs/screenshots/heart-and-lungs/` | 每轮 `pnpm shoot heart-and-lungs` 截图自证；calls / 三角形在 §8.2 预算内；Tier-1 清单逐项 | 2 天 |
| T1 | 待核 F-31、F-37–F-39、F-41、F-52、F-58、F-70–F-75 与配图 2 图注逐条读原文落定（核不到按退路改 spec 与数据，记 §9）；§2.2–§2.5 各条复读原文、照研究的摘录对号；`sources.json`（S1–S41） | Sonnet（事实核查）→ Opus 审 | `sources.json`、`SOURCES.md` | 事实表与来源一一对应；`pnpm tsx scripts/sources-md.ts heart-and-lungs` | 1 天 |
| T2 | 英文草稿：零件 `summary` / `detail`、七章正文与细看、名词定义、33 条字幕 EN（照 §5 的提纲与草稿，字幕说"这一拍模型上显示什么"） | Sonnet 起草 → Opus 逐句核对（事实、口吻、课纲词、和画面对得上） | `parts.json` 文本字段（经 `scripts/geo/heart-and-lungs/text.ts`）、`chapters/*.mdx` 正文 EN、`glossary.json` EN | `writing-rules.md`；§8.2 的禁句为 0 | 1.5 天 |
| T3 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（新加坡用法 §1.6、§6.1；中文独立成文；术语按 §0.1 的现行选择，Gavin 改了再统一替换） | Opus | 同上 ZH 字段 | 用词与名词表一致；引号只用"“ ”"；无"呼吸作用" | 1 天 |
| I | 三张图转 webp 入库，按 §7 的核对点再看一遍 | 主会话 | `public/illustrations/` | §7 核对点 | 0.1 天 |
| B | 33 拍定稿：镜头、标注、`sim.set`、字幕 EN / ZH 与画面一致；第 04 章第 4 拍是否拆成两拍 | Opus（拍的决定）+ Sonnet（字幕润色） | `state.beats` | `--beats` 0 失败、无漏标、`hz` 核对 0 失败、四种组合 | 1 天 |
| M | 机械检查（每次 T / B 之后跑一遍，结果交主会话） | Haiku | 只读；报告 | ① 字幕、正文、细看、卡片、规格行里每个数 = §2 的表（78、21、0.04、16、4、6、75–118、18–25、5–6、2.2–2.4、约一分钟；T5 的 20 / 90、26 / 115、40 / 165）；② 第 06 章比较表 = 字幕；③ 每个 `<TopicLink>` 的主题与章存在；④ 每个 `<Term>` 的 id 在 `glossary.json`；⑤ 中文引号只用"“ ”"；⑥ 禁句 grep（见 §8.2 措辞）；⑦ 每个 `detail` 的事实带 `[S#]`；⑧ "artery / vein / capillary / alveoli / 动脉 / 静脉 / 毛细血管 / 肺泡"只出现在标"再进一步"的细看与名词表里；⑨ 字幕里无"blue / 蓝" | 每轮 0.1 天 |
| P2 | HUD 排版、手机、模式组合、截图 QA（四种组合逐拍看）；事实与代码审计；两个已发布主题的回链（主会话改） | Sonnet 截图 QA；Opus 审查（事实、代码、视觉问题回 D2） | — | §8.2 全勾 | 1 天 |

- 合计：网格管线约 2.5 天、引擎约 2 天（两者并行）；内容约 9 天。
- **同一时间只有一个代理写同一个文件**：`parts.json` 由 `build-parts.ts` 生成（D1 拥有），流的路径由 `build-flows.ts` 从 `routes.json` 写；文本字段在 `text.ts`，T2 / T3 依次拥有；拍只在 B 步写。管线代理只碰 `scripts/anatomy/**`、`public/models/heart-and-lungs.glb`、`THIRD-PARTY-NOTICES.md`；引擎代理只碰 §4.7 的文件。
- **样章**：第 04 章（9 段血流首尾相接 + 两种红 + T4 + 先猜后看）先做完给 Gavin 看——最能检验真实血管路线、两种红在两套主题下的可读性和"先到肺再到全身"这种讲法。

### 8.2 验收（`acceptance.md` + `anatomy-mesh-runbook.md` 三道人审全部 + 本主题另加）

- [ ] **课纲对齐**：第 54 页三条 Core Ideas：空气成分（02）、部分与功能（01、03）、三系统协同（05）；两条 Practices：人 / 鱼 / 植物（06）、植物与人的运输（06）；VEA（05 细看 `Count your own`、T2 / T5 的表）；两条 Note（不要求肺泡、心腔瓣膜；不要求 artery / vein / capillary 等词）——这些词只出现在标"再进一步"的细看与名词表，且写明"课纲不要求"。
- [ ] **措辞**：无"呼吸作用 / respiration"作为本主题的内容（00 细看那一句除外）；无"release energy / 释放能量"；无"blue blood / 蓝色的血"、无把暗红的血叫"脏血 / dirty blood"；无把吸入、呼出的气体说成单一气体的句子（"吸进的是氧气""呼出的是二氧化碳"）；课纲式的"吸进氧气、放出二氧化碳"可以用；无"10 万千米 / 100,000 km"；无"心脏在左边"；无"小朋友"、感叹号、问句标题。
- [ ] **必须讲对的十二处**（D14）各有一拍或一段正文；误解目录 M-1–M-14 每条在指定位置给出正确说法；标"假设"的没有写成研究结论。
- [ ] **数字一致**：卡片、PLATE、规格行、字幕、正文、细看里同一个量同值（§2 的表）；TYPICAL 的读数有来源上标，SIM 的读数写"在这个模型里"；单测 `tests/space-scene/heart-and-lungs-topic.test.ts`：`table` 的每一格 = §2.9；每条字幕里的数 = 该拍设置下的输出或 §2 的事实；T2 小球数 = 输出取整；T4 每个 `stop` 显示的流 = §2.9；动画 `hz` = 输出 ÷ 60。
- [ ] **网格**：glb ≤ 4 MB、≤ 350 k 三角形；`asset.copyright` 在优化后仍在；四处署名齐全；`digestive-system.glb` 的 SHA-256 不变；`preview-review.md` 逐图写了观察（左右、右肺三叶左肺两叶、心的朝向、血管到四肢连续）；心脏外壳的结论记 §9。
- [ ] **路线**：9 段血流首尾相接（端点 ≤ 5 mm，`routes.json` 的桥逐条列出）；非示意段的点都在血管 / 气道里（六向射线）；示意段在 `report.md` 与已知差距写明；`--beats` 截图上流不穿出器官外表面。
- [ ] **两种红**：paper 与 cinema 下鲜红、暗红一眼分得开、灰度截图也分得开（L\* 差 ≥ 20）；粒子压在心脏、血管网格上看得出；任何地方都没有蓝色的血。
- [ ] **呼吸与心跳**：RUN 时肺、膈、肋骨同相；潮汐流吸气向肺、呼气向鼻，与肺的胀缩同步（E-HL3；退路时按 §4.4 记录）；T5 切到跑步，动画与血流 0.5 s 内缓到新频率，不跳。
- [ ] **试一试**：01、02、04、05 四章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；T2、T5 条形图；四个先猜后看不判对错、中英文都对；TYPICAL / SIM 芯片对。
- [ ] **写实**：Tier-1（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"人的肺和心脏"；鱼的鳃弓与鳃丝在 06 第 3 拍看得清；无品牌、无字、无照片贴图。
- [ ] **来源**：待核 F-31、F-37–F-39、F-41、F-52、F-58、F-70–F-75 与配图 2 图注每条有结论（核到 / 按退路改），记 §9；`SOURCES.md` 的空号说明。
- [ ] **链接**：`<TopicLink>` 到 `digestive-system`（`five-systems`、`mouth-and-gullet-chapter`、`small-intestine-chapter`）、`plant`（`the-stem`、`leaves-make-food`）、`states-of-matter`（`air-is-matter`）、`water`（`the-water-cycle`）、`muscles-chest`（`under-the-pecs`）、`grasshopper`（`breathing-and-blood`）全部通过 validate；`digestive-system`、`plant` 的回链（主会话）。
- [ ] **性能**（SwiftShader 只报 calls 与三角形）：静止 ≤ 60 calls、运转 ≤ 80（上限 100）；05 第 5 拍（全部流）≤ 90；三角形 < 0.35 M；`table` 一次求值 < 0.05 ms。超过时在 §9 写明哪些零件 / 流、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片在抽屉里可用，按钮 ≥ 44 px；`chest` 镜头里两种红看得清。
- [ ] 首页图 + 2 张配图按 §7 核对。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot heart-and-lungs --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

### 9.1 网格管线 P1–P6（2026-10-21，Opus 代理，本机 native Blender 5.1.2）

**产出**：`public/models/heart-and-lungs.glb`，1,952,300 字节、213,380 三角形、25 个节点、25 次绘制（软上限 4 MB / 350 k 以内）；`scripts/anatomy/heart-lungs/`：`manifest.py`（生成 `manifest.json` + `MANIFEST-READY`）、`centrelines.json`（131 段源中心线）、`landmarks.json`（32 个地标）、`organs.json`（坐标系，与 `digestive` 同一个脐中心、同一变换）、`routes.py` + `routes.json`（16 条流 81 条路径）、`test_routes.py`（19 个单测）、`report.md`（审计，PASS）、`preview-review.md`（逐图观察）。重跑：`python3 scripts/anatomy/manifests.py --topic heart-lungs && python3 scripts/anatomy/run.py --topic heart-lungs`（先跑单测，再 build → optimize → routes → 审计 → 预览 → 拼图；从清空的缓存跑通过，连跑两次 glb 字节相同：SHA-256 `a4e67065…81ff903a`）。另有 `tests/anatomy/heart-lungs-routes.test.ts`（`pnpm test` 里核 `routes.json` 的路径数、8 mm 步长、包含检查、血流环首尾相接）。

**P1 注册**：`run.py`、`optimize.ts`、`common.py`、`audit.py`、`manifests.py`、`contact.py` 加 `heart-lungs`；`manifests.py` 改为先分派静态主题（以前没有 `drafts/` 就跑不了 `--topic digestive`）。`optimize_static.ts` 的版权文字改由 manifest 的 `changes` 字段（可选 `attribution` 附加行，留给 BP3D 退路）拼出；`digestive/manifest.py` 只加 `changes`（原句照抄）。**`digestive-system.glb` 的 SHA-256 不变**：`24ecf044…22263c95`，两次核对——用缓存的 digestive 原始 glb 重新编码，和用改过的共享代码（`static_region.py`、`centrelines.py`、`audit_static.py`、`preview_static.py`）从 FBX 完整重跑 `run.py --topic digestive`，字节都与已发布的相同，`digestive/` 下的 `centrelines.json`、`organs.json`、`report.md` 也无差异。

**P2 manifest**：§3.4 每个源名都对 `inventory.json` 核到（缺件即报错，0 缺件），524 个源对象。节点 25 个 = §3.5 的 22 个网格零件（`leg-muscles` 是 `.l` / `.r` 两个真实节点）+ `skin-outline` + `skin-wire`。支气管按名字取到正好 28 段（正则要不分大小写：`Intermediate bronchus.r`）。`landmarks` 段：四个心腔与五个肺叶的面积加权质心（**合并前**量）、两个瓣口（`tricuspid`、`mitral`：两腔相对的开口环中点，心内示意路线用）、肺门（主支气管远端）、左右鼻孔（鼻腔黏膜最前端与皮肤 Nasal region 之间）、鼻道、后鼻孔、鼻咽、口咽、喉口、喉、左右膈顶、胸椎前缘（T5–T8）、肝门与肝中心、大腿（股直肌）与小腿（腓肠肌内侧头）。`routes` 段写每条路径的对象顺序与示意段种子点。

**P3 build**：多段管（咽、气管、支气管、大血管、肺血管、出 / 回心脏的血管）**合并前**逐段抽中心线（`static_region.segment_centrelines`，3 mm 步长，按血流方向：气道从喉起、动脉从心起、静脉到心止）：81 段用表面测地环心，27 段用拓扑环（支气管），12 段用主轴截面，10 段由几块不相连的管拼成（肺动脉分叉、三条肺静脉、脾动静脉、肠系膜上动脉、大隐静脉 ×2、肝静脉），取最长的一块、其余留给路线（`<源名>#2`…），1 段（肠系膜上静脉）环到环的路径会折回，改用"从端环到封闭端的测地行走 + 局部截面质心"。降主动脉、腹腔干、肝静脉单凭到心脏的距离分不清两端，manifest 按上下游邻段定向。咽的三块是**封闭实体**，截面质心不是管腔，标 `schematic`（空气路线在咽里走地标）。管节点的 `_U` = 每个顶点在**自己那段**中心线上的位置（0 = 上游），逐段归一；审计用"最近源段表面"独立重算，0 个超差（咽 2 个，在三块交界）。胃照 `digestive` 补展示窗。骨骼预算从 30 k 提到 40 k（30 k 时采样误差 3.5 mm 超过 system 的 85 % 安全线，重试后反而 77 k；40 k 时为 46,298、3.39 mm < 4 mm），总数仍 ≈ 213 k。

**P4 路线**（`routes.py`，仿 `food_route.py`；纯函数有单测）：16 条流 81 条路径——空气右 10 / 左 9（每条一个带 B 编号的段支气管：右 10、左 9，左肺"前内基底段"是 BVII / BVIII 的共干，不单算）、heart-right 2、to-lungs 5、exchange-lungs 5、from-lungs 5、heart-left 1、to-body 7、from-body 7、exchange-body 7、oxygen-lungs 5、co2-lungs 5、oxygen-muscle 4、co2-muscle 4（倒放）、food-in 4、food-route 1。每 8 mm 一点。
- **示意段（`routes.json` 每条路径的 `schematic` 列表）**：鼻孔 → 鼻道 → 后鼻孔 → 咽后壁前 7 mm 的四点 → 喉口 → 喉 → 气管（源里鼻咽与口咽之间约 1 cm 空隙）；心内（腔静脉口 → 右心房 → 三尖瓣口 → 右心室 → 肺动脉干起点；左心房 → 二尖瓣口 → 左心室 → 升主动脉起点）；肺内（肺动脉末端 → 支气管旁 10 mm → 叶内交换点，叶质心两侧各 12 mm）；肝内（门静脉 → 肝门 → 肝中心 → 肝静脉）；交换弧（肺 5 条、全身 7 条，腕处只弓 4 mm）；肌肉里的氧 / 二氧化碳（从大腿 / 小腿动脉离肌肉最近处到肌腹）；小肠表面 → 肠系膜上静脉；以及下面的桥。
- **桥（> 5 mm 的接口，直线、标示意）**：主动脉弓到头臂干 / 左颈总 / 左锁骨下的开口（5.5 / 13.9 / 8.1 mm，即主动脉半径）；胫后静脉止于腘静脉下 39 mm（源缺段，两腿）；四个段支气管的源网格离所属叶支气管 3–6 cm（右尖段、左尖后段、舌段两支、左上段），按解剖指定父段（Gray 1918；OpenStax A&P 2e 22.2），共 5 条路径。肺动脉分叉的第二块（`#2`，向右）接上后，到右肺的三条路线不再有桥。
- **包含检查**：每点向路径法向发 6 条射线。追踪段（沿源中心线）要 6 条里 5 条打到自己的管：**2,362 点 0 个在外**；示意段要 4 / 6 打到所在器官（它们穿过真实开口）：**1,102 点 0 个在外**。15 个追踪点在 3–4 mm 细血管的急弯处偏出简化后的发布网格，已移到发布管截面中心（≤ 2.2 mm，`recentred` 逐点列出）。开口端点在管内 3 mm 处探测。
- **血流环首尾相接**：heart-right → to-lungs → exchange-lungs → from-lungs → heart-left → to-body → exchange-body → from-body → heart-right，每条路径的终点到下一条流某条路径起点的最大间距 0.0 mm。
- **与 §3.6 的出入**（均为几何上的必要选择，内容代理可改 manifest 重跑）：from-body 的臂路从桡静脉起（不是肱静脉），交换弧才落在手腕；腿的交换弧在踝（to-body 到踝），氧气进肌肉改从股动脉 / 胫后动脉离肌腹最近处出发；from-body 止于上、下腔静脉的入房口，heart-right 从那里起（两者相接）。

**P5 优化与审计**（`audit_static.py` → `audit_organs.py`）：PASS。各节点三角形：nasal-cavity 3,987、pharynx 3,500、epiglottis 1,000、larynx 2,500、trachea 3,500、bronchi 12,000、lung-right 9,999、lung-left 8,000、diaphragm 5,000、ribcage 13,986、heart 10,000、great-vessels 3,186、lung-vessels 3,279、vessels-out 12,000、vessels-back 11,998、oesophagus 2,000、stomach 5,000、small-intestine 10,000、large-intestine 8,000、liver 5,000、leg-muscles.l 5,996、leg-muscles.r 5,998、skeleton 46,298、skin-outline 17,843、skin-wire 3,310。表面采样误差全在预算内；左右节点、命名、`asset.copyright`（含 Z-Anatomy、CC BY-SA 4.0、`changes` 原句、文件名）都核过；包围盒在 `cache/heart-lungs-static-audit.json`。**复核提示**（不影响路线）：肺动脉干、两条髂总动脉、肺动脉分叉的源中心线在分叉口那一端出管 4–7 mm（环心落在分叉的胯部），路线在这些地方都通过了包含检查。

**P6 预览与人审**（`preview_organs.py`，逐图观察见 `preview-review.md`）：正面右肺三叶、左肺两叶带心切迹，心在两肺之间尖朝左下，膈右高左低，血管到双腕双踝连续，路线都在血管里。**心脏外壳结论：保留 Z-Anatomy 四腔合并，不需要 D2 的 BodyParts3D 4.0 退路。** 发布的心脏有 804 条开放边、29 个开口，但在建议的封面镜头（胸部近景，`position [0.36, 0.42, 0.92]`、`target [0.01, 0.29, -0.10]`、`fov 30`）和 INSIDE 预设距离（约 0.5 m）下单面渲染、亮底，**看不到任何透底的洞**：开口只是腔静脉、肺动脉干、肺静脉的接口（组装后被血管节点盖住），四腔之间的接缝重合、看起来是细缝而非空隙。封面距离上肋骨挡住大半个心，封面要 X-RAY 或肋骨 ghost（内容决定）。

**署名（照肌肉系列的做法）**：glb 的 `asset.copyright` 已带；`THIRD-PARTY-NOTICES.md` 的 3D anatomy models 表加了本 glb，并加一节本 glb 的署名原文与"glb 及其导出几何（`centrelines.json`、`landmarks.json`、`routes.json`、写进 `parts.json` 的流路径、pivot、镜头 target）为 CC BY-SA 4.0"。**`LICENSE-CONTENT` 建议加的例外（未改，交主会话）**：

> Exception — heart and lungs (topic `heart-and-lungs`): the 3D model (`public/models/heart-and-lungs.glb`), the geometry derived from it (`scripts/anatomy/heart-lungs/centrelines.json`, `landmarks.json`, `routes.json`, and the flow paths, pivots and camera targets taken from them into `src/content/topics/heart-and-lungs/data/parts.json`) and the screenshots under `docs/screenshots/heart-and-lungs/` are derived from Z-Anatomy (CC BY-SA 4.0) and are licensed CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/), with the attribution given in `THIRD-PARTY-NOTICES.md`. The texts of that topic (`src/content/topics/heart-and-lungs/chapters/**` and the other data files) stay under CC BY-NC-SA 4.0 as above.

另：`digestive-system.glb` 至今不在 `THIRD-PARTY-NOTICES.md` 与 `LICENSE-CONTENT` 的例外里（它的署名在 glb 与主题 `SOURCES.md`），建议主会话一并补上。

**留给内容 / 引擎的**：`scripts/geo/heart-and-lungs/build-flows.ts` 读 `routes.json` 写各流 `path` / `paths`（一条路径用 `path`）；姿态 pivot 取 `landmarks.json` 的 `hilum.r/l`、`thoracic-spine-front`、膈顶；镜头 target 取心、肺叶质心。鱼与植物的流是程序化零件，不在本管线。参考图（R1–R9）没下载（管线不需要）。

### 9.2 引擎（E-HL1–E-HL4，2026-10-22，Opus 引擎代理，分支 `worktree-agent-a92cb04b234424a13`）

**做了什么**：E-HL1 `table` 模型（`lib/sim/table.ts`、`table-schema.ts`；注册 `SIM_KINDS`、`simQuantities`、`quantityKind`、`SEPARATE_EXPERIMENTS.table = true`，无时间线；输出 `tag`、格子小数位、`tableSourceIssues` 进 `pnpm validate`；`sources.json` 加可选 `design: true`）；卡片与 PLATE 的 TYPICAL 芯片与来源上标（`explorer/TryIt.tsx`、`hud/PlateBlock.tsx`）；E-HL2 `hz` 绑定与数输出的 `intensity`（`lib/sim/bind.ts`、`lib/sim/hz.ts`、`stages/model3d/AnimClocks.tsx`、`PartNode.tsx` / `MotionDriver.tsx` 读时钟、`Flows.tsx`），`animation` / `flow` 可写数组；E-HL3 潮汐流 `tidal`（`schema.ts` 流字段与校验、`lib/sim/tidal.ts`、`Flows.tsx`，shader 不变）；E-HL4 五个 token（`tokens.css` 两套主题、`theme.ts TOKEN_NAMES`、docs/08 §1 功能色表）。测试 API `animation(id)`、`copies(id)`、`flow(id).pace`、`sim().sources`；`pnpm shoot --beats` 每拍与拍链接核对 `hz`。作者模板 `tests/space-scene/fixtures/heart-lungs-table.ts`（§4.2 整段 `sim` + §2.9 全表）；草稿夹具 `sample-heart`；单测 `table.test.ts`（55 条）、`hz-binding.test.ts`、`tidal.test.ts`、`tests/theme/blood-gas-tokens.test.ts`；e2e `tests-e2e/sample-heart.spec.ts`（8 条）；docs/06 三节（表、动画频率与整条流的强度、潮汐流）与绑定、token 两行。

**与 §4 的出入**（内容代理照这些写数据）：

1. **夹具**叫 `sample-heart`（不是 §4.7 的 `sample-table`），用真实 `heart-and-lungs.glb`（气管、支气管、两肺、膈、心、大血管、肺血管、皮肤轮廓）加程序化的瓶和四排小球；流取 `routes.json` 的 8 条（两条潮汐空气流、肺循环一圈 + 肺里的氧气）；背景章 + 空气（typical、`count`、条形图、先猜后看）、运动（sim、`hz`、数 `intensity`、`phase` 吸住）、一圈（`stop` + `visible`）三章；来源 S1、S3 占位测量值，S2 `design: true`。
2. **SIM / TYPICAL 只给数输出**：状态（膈往下移、在肺里……）不带芯片；"`sim` 行引设计研究、`typical` 行引别的来源"的规则也只看数输出——否则 §4.2 自己的 `breath`、`route` 行（只引 S2）过不了校验。状态输出写 `tag` 报错。
3. **没有实验设定的输出**：数输出 = NaN（`—`）；状态输出必须有实验设定（校验报）。另加一条：同一实验每行设定同一组输出。
4. **格子小数位**：解析时写进输出的 `decimalsAt`（`{ "0.04": 2 }`，作者不写）；`outputDecimals(o, value)` 读它，表、卡片、PLATE、条形图同用。
5. **小球取整**：`count` 绑定沿用引擎原有的四舍五入（不是 §2.9 写的向下取整）；§2.9 的值都是整数或 0.04，结果相同；"球不够"按同一取整查。
6. **测试 API**：`sim().outputs` 的值仍是数；typical 输出的来源在另一个字段 `sim().sources`（`{ o2: ["S3", "S4"] }`）。另加 `copies(partId)`（`count` 此刻画出的份数）、`animation(id)` 多给 `on`、`flow(id).pace`。
7. **`hz`** 只收数**输出**（不收控件）、不绑 `rotate`（用 `rpm`）与 rig 关节、`sequence` 要 `loop`；频率夹在 0–4 Hz；缓动是指数逼近（约 0.5 s 到 95 %，差 0.5 % 内到位）；深链接、瞬切、截图、减少动态直接到终值。几条动画写在同一条绑定里步长相同、始终同相（时钟各一个，按同样的输入推进）。
8. **数组**：`animation`、`flow` 在所有动画 / 流绑定上都可写数组（§4.2 的 `enabled` 绑定也用了数组）；`paths`、场线 `state`、向量 `intensity` 仍只写一条流。一条流只能有数强度或向量强度之一。
9. **潮汐流两端**：沿用现有的路径相位与 `fract`，粒子沿整条路径均匀撒；走出一端的粒子在那一端淡出、从另一端淡入（两端都在淡出区，看不到"跳"）。速度另乘被同步动画的 `on`（`enabled` 缓停时流跟着缓停）；`prefers-reduced-motion` 粒子不动。设计里空气强度 = 呼吸 ÷ 20、频率 = 呼吸 ÷ 60，所以一口气走的距离各活动相同（`speed` × 3 ÷ π ≈ 0.115 m，`speed` 0.12）。
10. **双侧镜像**：`hz` 绑定的动画若目标是 `bilateral` 零件，镜像出的 `<id>-r` 动画不跟着变速（本主题没有：两肺是两个零件，`leg-muscles` 不动）。
11. **PLATE 块尾**：卡片只观察 typical 输出时写 `TYPICAL · <控件值>`（沿用原有的 ` · ` 分隔，§3.9 写的是 `TYPICAL BREATHED OUT`）；跟随 typical 输出的读数后面跟 TYPICAL 芯片与来源上标。卡片同时观察两种时两行（SIM、TYPICAL）都有，每个读数名后再带一枚小芯片。
12. **token 取值**（两套主题都过 §4.5 的全部约束，单测核）：paper `--blood-rich #C8222D`、`--blood-poor #5C151B`（L* 43.7 / 19.6，色相 31° / 25°）、`--oxygen #1A8F63`、`--carbon-dioxide #5E554E`、`--air #5F7A8C`（对纸底 3.56:1）；cinema `#FF5A5F`、`#A8343C`、`#46C48F`、`#8A786A`、`#8FA9BB`。
13. **加了流字段 `flat: true`**（§4 没有）：cinema 的流默认是叠加混合 + 白芯，`sample-heart` 截图里深酒红被洗成和鲜红一样的粉白，§8.2 "两种主题下两种红都分得开"过不了；`flat` 让这条流在 dark plate 上也用普通混合、无白芯（paper 不变）。**心肺的八条血流（`heart-right` 到 `from-body`，含两条交换弧）都写 `flat: true`**；空气、气体、食物的流照常发光。
14. **作者模板**里状态的标签（"一下一上""从心脏到肺"等）是引擎代理按 §2.9 写的，内容代理定稿时可改字，不改 id。

**验收**（§4.8，合入 main `bde1d3d` 后重跑）：`pnpm check` 0 错、`pnpm validate` 50 个主题 0 错 0 警告、`pnpm test` 4019 条全过（含 `table` 55 条、`hz-binding` 15 条、`tidal` 7 条、`blood-gas-tokens` 12 条）、`pnpm build` 通过、`CI=1 pnpm e2e` 293 条全过（含 `sample-heart` 8 条）；`pnpm shoot sample-heart --beats --keys --layout` 0 拍失败、10/10 拍链接一致、0 键失败、0 版式问题、控制台干净（静止 16 次绘制、0.37 M 三角形）。回归：`digestive-system`、`mosquito`、`states-of-matter`、`sample-materials`、`sample-sort` 的 `--beats --keys` 改前改后都是 0 拍失败、0 键失败、拍链接全一致；逐拍截图像素差：后三者 ≤ 0.04 / 255，`digestive-system` ≤ 1.2，`mosquito` 最大 7（幼虫摆动、流粒子的动画相位：没有 `hz` 绑定的动画走的代码路径与改前逐位相同）。`sort.test.ts` 的 < 0.2 ms 计时在并行 shoot 的负载下失败一次，单跑通过（只是负载）。**已知差距**：`sample-heart` 背景章与运动章 `labels` 里有几个零件在章镜头下没有引线（夹具，不影响引擎）；`plant` 的氧气仍是 `--xray`（§4.10）。

### 9.3 内容施工（2026-10-22，Opus 内容代理）

**产出**：`src/content/topics/heart-and-lungs/`（`status: published`）：`topic.yaml`、背景章 00 + 六章（33 拍，四张试一试：01 吸气呼气、02 一瓶空气、04 跟着血走、05 休息走路跑步）、`data/parts.json`（31 个零件 + 6 个 context、23 条流、6 个动画、3 个姿态、6 个预设、`sim` = §4.2 作者模板逐格）、`sources.json`（S1–S42，空号见 `SOURCES.md`）、`glossary.json`（16 个词）、`REVIEW.md`。`parts.json` 由 `scripts/geo/heart-and-lungs/build-parts.ts` 生成（`bench.ts` 小桌教具与鱼、植物的流，`text.ts` 文本，`sim.ts` 试一试），流路径与 pivot 读 `scripts/anatomy/heart-lungs/routes.json`、`landmarks.json`。单测 `tests/space-scene/heart-and-lungs-topic.test.ts`（19 条：表 = 模板、sim 对零件与来源无问题、小球数、字幕里的数 = 该拍输出、T4 每步的流、先猜后看、八条血流 `flat`、空气 `tidal`、措辞）；e2e `tests-e2e/heart-and-lungs.spec.ts`（8 条）；首页 smoke 计数 30 → 31。三张已审草稿经 `scripts/illustrate.ts` 入库（封面、配图 1、配图 2）。回链：`digestive-system` 的 `five-systems`、`small-intestine-chapter`，`plant` 的 `the-stem`，各一句。

**待核项结论**（Sonnet 读原文，2026-10-22）：F-31 核到（OpenStax Biology 2e 39.1"hairs and mucus trap…"，进 S40；A&P 22.1 只写 hair follicles）；F-37 核到（A&P 22.2）；F-38 核到（A&P 22.1 咽、会厌）；F-39 核到（Biology 2e 39.1 "sits in front of the esophagus"）；F-41 核到（A&P 19.1 "apex … just to the left of the sternum"）；F-52 核到（A&P 18.2 红骨髓；19.1、19 章导言"心脏是泵"）；F-58 核到（A&P 20.2 桡动脉、颈动脉）；配图 2 图注核到（A&P 19.1 冠状动脉给心肌供血、走在心表面，两句合起来）；F-70、F-72 核到（Biology 2e 39.1）；F-71 部分：口 → 鳃（29.1）与鳃在鳃盖下的腔里（29.2）合起来写，没有一句直接说，`SOURCES.md` 记明；F-73 只有 `plant` 已引的推广手册（S42，本次 403 未重读），气孔交换由 Biology 2e 30.2、30.4、30.5、8.1 支撑（S41）；F-74、F-75 核到（S41）。另核 A&P 20.5（肝门静脉）、23.5（小肠吸收）、19.4（运动时二氧化碳增多、氧气减少被感受到，心跳加快）、22.3（二氧化碳升高使呼吸变快变深）。

**与前文的出入**：① 中文 diaphragm 一律写"膈"（本次施工的要求，与 `digestive-system` 一致），不写 §0.1 的"横膈膜"。② 加了三个组：`bench`（小桌，不让它出现在每一章）、`skin-light`（`skin-wire` 单独一层、各章不开：两层皮肤在 X-RAY 下发灰、显出面片）、`plant-gases`（植物的氧气与二氧化碳，06 第 4、5 拍分开显示）；鱼的气体流并入 `fish-water`；鱼的水流 id 改为 `gill-water`（与组同名会报错）。③ 植物用 `living-things` 的辣椒苗放大 4.5 倍、加三对叶、茎前画两条管，不抄 `plant` 主题的整株。④ 空气瓶缩为直径 9 cm、高 15 cm；小球直径 4.6 mm、间距 5.2 mm，低模（引擎球体让托架达 29 万三角形）。⑤ 预设不能开剖切，`heart-inside` 由细看写"按 C"。⑥ 04、05 章血管与肺 ghost（看得见里面的血点），被 ghost 的零件不能标注，这些拍改标心脏、往返肺的血管、大血管、腿部肌肉。⑦ 封面镜头略从身体左前方看胸腔，心脏从左肺心切迹旁露出。⑧ `views.cover`、各章镜头按截图调过；`gills-open` 掀开 45°。

**一处 token 改动（`src/theme/tokens.css`，只改一格）**：cinema 的 `--blood-poor` 由 `#A8343C` 改为 `#82242D`（L* 39.8 → 29.9，与 `--blood-rich` 差 21 → 31）。截图里 dark plate 上的含氧少的血被渲染得和鲜红几乎一样（腿上并行的出、回两条血管分不开），§8.2"两种主题一眼分得开"过不了；色相（24°）、与三层肌肉的 ΔE（≥ 21）、比 paper 亮，原有约束全过；`blood-gas-tokens.test.ts` 加一条 cinema 明度差 ≥ 30。docs/08 §1 功能色表同步。
