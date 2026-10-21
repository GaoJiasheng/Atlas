# 41 · 花与种子 · 内容施工 spec（`flower-and-seed`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体的变体 **"标本台"**（docs/14、33 的做法），按 docs/17 B1 排成**一圈**：一张圆形标本台，沿台边顺时针摆五个工位——一朵剖开的辣椒花（放大 20 倍）和来访的蜜蜂 → 别的传粉者（太阳鸟、洞穴花蜜蝠与榴莲花、榕小蜂与榕果）→ 两组示意的生殖细胞 → 果实与种子（按实物大小，风、水、动物、爆开 / 裂开四种传播）→ 一粒绿豆的里面与五杯绿豆的萌发测试——再接回那朵花；台外另一张小台放一株巢蕨和一丛苔藓（"不开花、靠孢子"的另一条路）。本主题的任务：**P5 学生看完能说出植物繁殖的两种方式（孢子、种子）；能按顺序讲清开花植物的四个过程（传粉、受精、种子传播、萌发）各是什么；知道搬运花粉的不只蜜蜂（新加坡的太阳鸟、蝙蝠、榕小蜂）；能从果实和种子的样子说出它靠风、水、动物还是爆开 / 裂开传播；能说出种子萌发要水、空气、适宜的温度而不需要光、幼苗却要光才长得绿；能认出一组萌发测试里哪两杯才是公平测试；能说出植物受精与人的受精相似在哪里。**

`subject: biology`；对应 2023 课纲 P5 *Cycles in Plants and Animals (Reproduction)*（S2 印第 43–45 页 Standard、第 46–47 页 Foundation）。docs/17 第 150–151 行（`flower-and-seed`，B1 环形布局；人类受精"不单做，写在本主题里"）。

2026-10-21 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/37（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Sonnet 起草全文、Opus 逐句核对；ZH 是本文的草稿，施工时 Opus 独立定稿。**本轮没有 Codex**：研究由 Sonnet 完成（`art/research/flower-and-seed/flower-seed-research.md` §1–§8 与 `facts.json`：66 条事实、163 条核对过的引文、59 个来源，访问日期 2026-10-21）；下文 R: 后面是它的行 id（C 课纲、F 事实、X 实验、M 误解、Z 中文）与引文 id（E…）。研究标 partial / unverified 的，本文标"待核"，施工代理（Sonnet 事实核查）读原文定，核不到按每条写的退路处理。

**与已发布主题 `plant`（docs/26）的分工**：`plant` 第 05–07 章（`flowers-and-pollination`、`fruits-and-seeds`、`seed-to-plant`）已经讲了辣椒花的部分、蜜蜂传粉、受精的定义、五个传播例子（青龙木、椰子、凤仙花、带钩的果、辣椒与鸟）和一个四杯绿豆的公平测试（文字，不出结果）。本主题**往深处走 `plant` 没走的地方**：孢子与种子（巢蕨、苔藓）；蜜蜂以外的传粉者（太阳鸟、蝙蝠与榴莲、榕小蜂）；传粉与种子传播的区分（同一棵榕树、同一类蝙蝠做两件事）；爆开的橡胶树果、漂浮的榄仁树果、榕果；**一组能动手看结果的五杯萌发测试**（水、空气、温度、光，含"冰箱又冷又暗"的公平测试陷阱）和**温度与天数的一份实验室数据**；植物受精与人的受精的相似处。几何尽量**复用 `plant` 的程序化零件**（辣椒花、剖开的花、胚珠、花粉、蜜蜂、青果、红果剖面、翅果、椰子、凤仙果荚、绿豆三件），由生成脚本从 `plant/data/parts.json` 读出、换算尺度（D13）；两个主题用 `<TopicLink>` 互链。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 一张圆形标本台**（直径约 3 m，按 docs/17 B1 的"环"排），台边顺时针五个工位（§3.1）：① **花**（12 点）：一朵开着的辣椒花和一朵纵剖的辣椒花，放大 20 倍，一只来访的蜜蜂（同一倍数）；② **别的传粉者**（2 点）：一只太阳鸟停在一枝红色穗状花上、一只洞穴花蜜蝠在一簇榴莲花前（按实物大小），旁边一只剖开的榕果和一只榕小蜂（放大 10 倍）；③ **生殖细胞**（4 点，示意、不按比例）：植物的一对（雄性 / 雌性生殖细胞）、人的一对（精子 / 卵子）；④ **果实与种子**（6 点，按实物大小）：青龙木翅果、榄仁树果（整个 + 剖开）、椰子（剖开）、红辣椒（剖开）与青辣椒、三颗成熟的榕果、橡胶树果（三瓣蒴果 + 三粒种子）、凤仙花果荚；后面一条海水；⑤ **种子与萌发**（8 点）：一粒绿豆的整粒、剖开、发芽三件（放大 10 倍），一条天数卡与一只湿纸巾培养皿，五只装绿豆的杯子（A–E）分别放在窗台、柜子里、冰箱里（按实物大小）。台外左侧一张小台：**一株巢蕨**（缩小到 1/4）、一片叶背的孢子囊群与一丛苔藓（放大 10 倍）。一条只有流的"循环"（`loop` 墨色小点）沿台边从花走到萌发、再回到花。**模型研究**，不是哪一件标本的扫描；无品牌、无文字。标题块 `note`：EN "Model study · a specimen table arranged as a cycle · each station has its own scale bar · reproductive cells are diagrams, not to scale · seed-test results come from published classroom and laboratory studies" / ZH "模型研究 · 标本台按循环排成一圈 · 每个工位各有比例尺 · 生殖细胞是示意图，不按比例 · 种子测试的结果取自公开的课堂与实验室研究" | 同意 | 定稿 |
| D2 | **主标本的花 = 辣椒花**（*Capsicum annuum*），沿用 `plant` 的同一朵花（docs/26 D0-1：规则花、雄蕊雌蕊一眼看清；NParks 记它靠蜜蜂传粉，R: F04、E64）。理由：①和 `plant` 一致，读者从那边点过来看到同一朵花；②几何现成（D13）；③配图 `flower-and-seed-bee-pollination` 画的正是蜜蜂访辣椒花（§7）。首页图版是一朵**通用的花**（不是辣椒），它只当首页插画，不和模型比对（§7） | 同意 | 定稿 |
| D3 | **课纲边界**（§1.1 原文）：主线 = Practices"孢子、种子"+ Core Ideas 四个过程 + 受精的定义（Standard：雄性生殖细胞与雌性生殖细胞融合；Foundation：导致果实与种子形成的过程——两种说法正文都写）+ 人的受精（精子与卵子融合；卵巢产生卵子、睾丸产生精子；受精卵在子宫里发育）+ 植物与人受精的相似处（Standard 第 45 页）。Notes 明说**不要求**的五项全部不讲：扦插等营养繁殖；"self-pollination / cross-pollination"两个词；花粉管；受精发生的具体位置；胎儿发育与脐带。**第 44 页"female reproductive system"那条 Note 的歧义（R: C07）按"两条线都适用"处理**：主线（正文、字幕、卡片、零件摘要）**不说受精在花的哪个位置发生**（不写"在胚珠里 / 在子房里受精"、不写"雌性生殖细胞在胚珠里"），也**不说在人体的哪个位置发生**（不写输卵管）；只说"胚珠发育成种子、子房发育成果实"（OpenStax 的事实，不是位置的说法，R: F02）。生殖细胞画成飘在台上的示意图，不放进花或人体里（§3.4 ③）。§0.1-1 请 Gavin 确认 | 同意 | 定稿 |
| D4 | **课纲没点名、本主题选进来的内容，都用非 MOE 的来源**（R: C13：全课纲 0 处 fern、moss、bat、sunbird、bee、pollinator、dark，没有任何萌发条件或萌发测试）：蕨与苔藓（孢子的例子）、传粉者、风媒、萌发的条件、萌发测试、"光不是必要条件"。这些在 spec 里标"内容选择"；正文不说"课纲要求"，PSLE 的写法按课纲 Table 1 的过程技能（P4 认出公平测试、P6 设计公平测试，R: C11）。真菌也产生孢子，但课纲把真菌列为植物以外的另一类（P3 第 38 页，R: C12），**真菌只在第 01 章细看一句**，不建模 | 同意 | 定稿 |
| D5 | **必须讲对的十处**（§1.4 误解目录逐条对应）：① **不是所有植物都从种子长出来**：蕨和苔藓不开花，靠孢子繁殖（M-6）；② **孢子不是种子**：孢子是一个细胞；种子里有胚、储存的养分和种皮（待核 F-6 的"单个细胞"引文）；③ **花不是装饰**，是产生种子的部分（M-4）；④ **传粉 ≠ 受精**：传粉把花粉送到柱头，受精是两个生殖细胞融合；中文"授粉"就是"传粉"，不是"受精"（R: Z03）；⑤ **搬花粉的不只蜜蜂**：太阳鸟、蝙蝠、榕小蜂；有些太阳鸟从花的基部啄洞"偷蜜"、不传粉（R: F08）；⑥ **传粉 ≠ 种子传播**（M-5，研究证据最强的一条）：同一棵榕树，榕小蜂传粉、鸟和松鼠吃果实传播种子；蝙蝠给榴莲传粉，果蝠吃榄仁树果传播种子；⑦ **种子萌发不需要光**（这些绿豆和多数种子都是如此；少数种子要光或要暗，R: F16）（M-1）；⑧ **但幼苗要光**：暗处萌发的幼苗淡黄、细弱（R: F17）——"种子要什么"和"幼苗要什么"是两个问题（M-2）；⑨ **冰箱又冷又暗**：拿冰箱里的杯子和窗台上的比，同时改了两样，不是公平测试；要和柜子里的比（§2.6）；⑩ **种子是活的**（会呼吸，R: F16 "Respiration takes place in all viable seed"），里面储存的养分供它萌发，不是从土里"吃"东西（M-3、M-9） | 同意 | 定稿 |
| D6 | **章数 7 + 背景章 00**（§5）：00 开始之前 / 01 孢子与种子 / 02 花与传粉 / 03 谁在搬花粉 / 04 受精 / 05 种子传播 / 06 种子的里面 / 07 种子的公平测试。比 brief 的"约 6 章"多一章：萌发拆成两章，因为两张试一试（温度与天数、五杯测试）**每章至多一张卡**（docs/06）；第 07 章是 PSLE 最常考的公平测试，单独成章。**不做测验** | 同意 | 定稿 |
| D7 | **试一试**：三张模型卡（§4、§5）：**T1 种子怎样传播**（05）：换果实，看它靠什么传播、哪个结构帮了忙；先猜后看。**T2 温度与天数**（06）：换温度（14 / 17 / 20 °C，一项实验室研究的三个温度），走天数，看"一半种子发芽要几天"；记表 + 折线图；先猜后看。**T3 五杯绿豆**（07）：选一杯、选一杯来比，走到第 7 天，看发没发芽、幼苗什么颜色、两杯之间改了几样东西（只改一样才是公平测试）；记表；先猜后看。01–04 章的"试一试"是**文字活动**（细看里，像 `plant` 的做法）：看巢蕨叶背、清早看谁来访花、用纸做"翅果"的公平测试（SFI，05 细看）、和大人一起剖开辣椒数种子 | 同意 | 定稿 |
| D8 | **引擎：SpaceScene + `sim`，新加一个小模型 `kind: 'seeds'`**（E-S1，§4，约 1 天）：三个可选子模型——`cups`（五杯的条件 → 第 d 天发没发芽、幼苗颜色、两杯之间改了什么）、`timing`（温度 → 一半发芽的天数；第 d 天是否已过一半）、`dispersal`（果实 → 传播方式与结构）。其余**全部复用**：`visible` / `tint` / `offset` / `pose` 绑定、试一试卡片、数据表与折线图、先猜后看、背景章、组级比例尺、`<TopicLink>`。**为什么不用 `life-cycle`**：它按温度取每个阶段的实测天数、用天数推阶段（docs/06）；萌发没有"有水 / 没水""有空气 / 没空气"的条件逻辑，也没有有来源的分阶段天数（胚根第几天出来**没有来源**，R: F20）。**为什么不拆成几个 kind**：一个主题的 `sim` 只能有一个 `kind`（`lib/sim/index.ts`）。三个子模型都只把**有来源的事实**（哪些条件下发芽、实测的中位天数、NParks 写的传播方式）按规则组合，不编数字（docs/30 D2 的纪律，同 docs/37 D2 的防水、透光两项） | 新 `kind: 'seeds'`，约 1 天 | 定稿 |
| D9 | **萌发的数字纪律**：①**第 7 天看结果**：BBSRC 的豌豆实验在第 5–7 天量幼苗（R: X01、E108）；NC State 说绿豆芽 3–7 天长成（21–27 °C，暗处，R: F19）；Gardens by the Bay（新加坡）说 3–4 天（先泡 12 小时、放进暗柜，R: E111、E112）——所以"温暖、有水、有空气的绿豆一星期内发芽"有来源。②**不发表"胚根 1–2 天出来"**（R: F20：没有来源）；模型的天数只有 0 和 7。③**冰箱那一杯**"一星期不发芽"：研究里只有 14 / 17 / 20 °C 的实验室中位数（9.4 / 6.5 / 4.3 天，R: E115），冰箱更冷——由这个趋势推断，标"推断"，F 步再找一条直接来源（F-47）。④**泡在煮过放凉的水里那一杯**"不发芽"：依据是"种子要氧"（VCE，R: E100、E104），F 步找一条课堂来源（F-46）。③④核不到时的退路见 §0.1-6。⑤温度那张卡**只用实验室研究的三个温度**，不外推到新加坡室温；新加坡室温（NEA：2009–2018 年平均 27.89 °C，R: F22）只在细看里和 Gardens by the Bay 的 3–4 天一起说 | 同意 | 定稿 |
| D10 | **传粉者**（第 03 章）：**蜜蜂**（NParks：辣椒、凤仙花靠蜜蜂；许多粮食作物的主要传粉者，R: F04）；**太阳鸟**（NParks 2025：细长、向下弯的喙，取食时给所访的花传粉；新加坡有七种，R: F08；从花口取食时喙上沾的花粉蹭到下一朵花的柱头，有些从花基部啄洞偷蜜、不传粉，R: E61、E62）；**洞穴花蜜蝠**（NParks：吃花蜜和花粉，"许多森林树木包括榴莲的重要传粉者"，R: F05）+ **榴莲**（NParks：花在夜里开、气味浓，蝙蝠是主要传粉者，R: F06）——**野外研究在马来西亚刁曼岛，而且研究的是大狐蝠**（R: E54），正文写清，不说"新加坡的研究证明"；新加坡只有一条在金蒲桃花上拍到洞穴花蜜蝠、翼膜沾满花粉的观察记录（R: F07）；**榕小蜂**（NParks：只有榕小蜂能给榕树传粉；青果榕由 *Ceratosolen appendiculatus* 传粉，R: F10）；**风**只在细看说一句（草类，OpenStax；**没有找到新加坡的风媒例子**，R: F03），不建模。**太阳鸟的名字**：默认用 NParks 2025 文章的 Olive-backed Sunbird（*Cinnyris jugularis*），细看注明 NParks Flora & Fauna Web 现在写作 Ornate Sunbird（*C. ornatus*）（R: F09，§0.1-2）；模型画**雌鸟**（橄榄绿背、黄腹，配色待核 R5；雄鸟喉部深色的金属光泽只在细看说），主线只说"太阳鸟" | 同意 | 定稿 |
| D11 | **传播的例子**（第 05 章，每个都有 NParks 或论文来源）：风 = **青龙木**翅果（R: F11）；水 = **榄仁树果**（软木般的外皮有细小空隙，能浮，R: F12）与**椰子**（厚纤维外皮 + 果核空腔，R: F12，E75 待核）；动物 = **辣椒**（鸟吃后种子完好排出、还能萌发，R: F13）与**榕果**（鸟、松鼠、长尾猕猴吃，R: F10）；爆开 / 裂开 = **橡胶树**（干了"啪"地爆开，种子可弹到 20 m 以外，R: F14）与**凤仙花**（很容易裂开，R: F14）。**榄仁树果也被果蝠和猴子吃**（R: E74）——细看"一种果实，两种方式"；**相思豆（saga）不当单一类别的例子**（豆荚扭开、红种子又被鸟吃，R: F15），只在同一段细看提一句。**不用带钩的果**（Bidens、地桃花的钩没有核实，R: F13）。Marsh Pulai、Keruing、Sea Pong Pong、Katong Laut、Champaca、Twin-seed 只在细看列名（NParks P5 资源页，R: F11、F12、F14） | 同意 | 定稿 |
| D12 | **人的受精**（第 04 章最后两拍 + 正文一段 + 细看）：只用课纲的话：精子与卵子融合；睾丸产生精子、卵巢产生卵子；受精卵在子宫里发育；相似处 = 都是一个雄性生殖细胞与一个雌性生殖细胞融合。**画法**：两对示意的细胞（植物：两个圆细胞；人：精子 = 头 + 尾，卵子 = 带外层的大圆细胞），飘在台上，标"示意图，不按比例"，**不画人体、不画器官**。不讲胎儿发育、脐带（课纲 Note）。中文提醒：英文 ovary 一词两义，花的叫**子房**、人的叫**卵巢**（细看 + 名词表分两条）。§0.1-4 | 同意 | 定稿 |
| D13 | **复用 `plant` 的几何**：`scripts/geo/flower-and-seed/build-parts.ts` **只读** `src/content/topics/plant/data/parts.json`，按 id 取出 `flower`、`sepals`、`stamens`、`pistil`、`flower-section`、`ovules`、`pollen-grains`、`bee`、`fruit-green`、`fruit-red-section`、`winged-fruit`、`coconut`、`splitting-pod`、`bean-seed`、`bean-sprouting`、`bean-seedling` 的 primitive（含 extra），连同 `flower-open`、`pod-split` 两个姿态和 `bee-visit` 动画，**整体换算尺度并平移到本主题的工位**（§3.2 的换算规则）；文字（summary / detail）不复用，按本主题重写（D3 的位置规则与 `plant` 不同）。`plant` 的目录**任何代理都不改**；回链由主会话在 `plant` 第 05、06、07 章细看各加一句（§1.7） | 同意 | 定稿 |
| D14 | **尺度**：不写 `units`；每个有实体的组写 `scale`（docs/14 B10）：花 ×20、榕果 ×10、孢子特写 ×10、种子 ×10、巢蕨 ×¼（`magnification: 0.25`）、传粉者 ×1、果实 ×1、萌发台 ×1；生殖细胞组不写比例（示意）。各组的实长取自 §2.7；**§2.7 里待核的尺寸核不到时，那一组不写 `scale`（不画比例尺），零件名写"示意比例"**。不同倍数的组不同框：每章只开自己工位的组（§5.0），字幕第一次出现一个放大的标本时说倍数 | 同意 | 定稿 |
| D15 | **写法**：按 `writing-rules.md`：不拟人（不写"花想要""蜜蜂帮忙"），少用目的论（课纲 P6 自己用 attracting，可以用"吸引"，但不写"为了"）；不用"杂草""害虫"；VEA 两条（好奇地观察身边的动植物、负责任地爱护它们，§1.1）落在文字试一试：只看不摘、不惊扰蝙蝠和鸟。英文用新加坡 / 英式拼写（fertilisation、colour、metre）。中文用新加坡用法（§6.1），引号只用“ ”。人的受精一段语气平实，和植物一段同样的写法 | 同意 | 定稿 |
| D16 | **图：只用 `art/planned/flower-and-seed/` 里已审过的三张草稿，不出新图**（本轮没有 Codex）：封面 `flower-and-seed.png` **沿用**；`flower-and-seed-bee-pollination.png` **沿用**，放第 02 章；`flower-and-seed-seed-germination.png` **沿用**，放第 06 章（§7）。只有这两张章节图，没有第三张 | 同意 | 定稿 |
| D17 | **不做**：品牌 / 照片贴图 / 视频 / 配音文件 / 测验 / 人体与器官 / 花粉管与受精位置 / 自花、异花两个词 / 营养繁殖 / 胎儿与脐带 / 风媒植物的模型 / 蘑菇的模型 / 相思豆与带钩果的模型 / 读者拖动标本（v2）/ 同一粒种子随天数变形长大的姿态序列（B2，没有分天数的来源，用五杯 + `visible` 代替）/ 夜景灯光（榴莲花"夜里开"只在字幕与细看说） | 同意 | 定稿 |
| D18 | **中文术语**（§6.1；R: Z01：**没有找到新加坡 MOE 的中文科学词表**，核心词来自 zh.wikipedia、香港教育局词表与 NParks 印的中文植物名）：传粉（名词表注"也叫授粉"）、受精、种子传播、萌发（口语"发芽"可用于正文）、孢子、孢子囊、蕨类植物、苔藓、花粉、雄蕊 / 花药 / 花丝、雌蕊 / 柱头 / 花柱 / 子房 / 胚珠、花瓣、萼片、子叶、精子 / 卵子 / 卵巢 / 睾丸 / 子宫；植物名照 NParks（巢蕨、青龙木、榄仁树、椰子、凤仙花、青果榕、榴莲、辣椒、绿豆、相思豆）；与 `plant` 名词表一致（传粉、受精、种子传播、萌发、子叶） | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。下面几处是"按惯例代定、Gavin 想改随时改"的：

1. **第 44 页那条 Note 的范围**（D3，R: C07）："The specific location where fertilisation takes place in the female reproductive system is not required." 它印在花的那组 Notes 末尾、人的那一条之前，措辞是"female reproductive system"。可以读成只指人、只指花或两者都指。默认**两者都指**：主线不说受精在胚珠 / 子房里，也不说在输卵管里，只说"胚珠发育成种子、子房发育成果实"。`plant` 第 05 章已经写了"胚珠里有一个雌性生殖细胞"（不违反课纲，只是多讲了），本主题不改它。若 Gavin 认为只指人，第 04 章第 1 拍可以加"雌性生殖细胞在胚珠里"，零件 `ovules` 的摘要跟着改。
2. **太阳鸟的名字**（D10，R: F09）：NParks 2025 年的文章写 Olive-backed Sunbird（*Cinnyris jugularis*），NParks Flora & Fauna Web 的物种页（2025 年更新）写 Ornate Sunbird（*C. ornatus*）。默认主线只说"太阳鸟 / sunbird"，零件细看写"Olive-backed Sunbird（NParks Flora & Fauna Web 现称 Ornate Sunbird）"。施工时 F 步再查一次 NParks 现行名录，若已统一就只写一个名字。
3. **洞穴花蜜蝠的中文名**（R: Z09）：NParks 没印中文名；"长舌果蝠"只在搜索摘要里见到、未核实。默认写**洞穴花蜜蝠**（英文名直译，名词表 `note` 写"编辑直译，英文 cave nectar bat，学名 *Eonycteris spelaea*"）。F 步若找到可靠的中文名（动物志、新加坡华文报刊），换成它。
4. **人的生殖细胞画不画**（D12）：默认画两颗示意细胞（精子、卵子），不画人体。课纲要求认得"精子与卵子融合"，P5 课本通常有这类示意图。若 Gavin 觉得只用文字更稳妥，删 `sperm`、`egg` 两件，第 04 章第 5、6 拍改成只看植物那一对、字幕不变。
5. **7 章而不是 6 章**（D6）：萌发拆成"种子的里面 + 温度与天数"和"五杯测试"两章。若 Gavin 想压到 6 章，T2 并进第 07 章的细看（表 + 文字），第 06 章与第 07 章合并，少约 5 拍。
6. **两杯的结果等 F 步**（D9）：冰箱杯（F-47）、泡水杯（F-46）"一星期不发芽"目前一条是推断、一条只有"种子要氧"的一般来源。若 F 步找不到直接来源：冰箱杯保留，字幕改成"一星期里没有发芽（在这个模型里）"，细看说明由 14 °C 的数据推断；泡水杯从模型里拿掉（C 杯删去，四杯测试），"种子要空气"只在正文按 VCE 说一句，和 `plant` 第 07 章的做法一样。
7. **与 `plant` 的重叠**：本主题讲深之后，`plant` 第 05–07 章仍保留（它们服务 P3–P4 的读者，是整株植物的一部分）。默认不删减 `plant`，只加回链。若 Gavin 希望 `plant` 第 06、07 章更短、把细节交给本主题，另开一个小任务。
8. **几个没有新加坡中文来源的名字**：榕小蜂（fig wasp）、Scarlet Spiral Flag（太阳鸟停的那枝红花，*Costus woodsonii*）、橡胶树（NParks 页面没印中文名）。默认：榕小蜂、"一种红色的穗状花（Scarlet Spiral Flag）"、橡胶树，名词表与细看注"编辑用词"。
9. **首页图是一朵通用的花**（§7）：画得准（一个雌蕊、一个圆头柱头、子房里的胚珠、一圈雄蕊），但不是辣椒。默认沿用；它只作首页插画。

---


### §0.3 事实核查第二轮后的定稿修订（主会话，2026-10-21）

依据 `art/research/flower-and-seed/facts-pass2.md`（Sonnet）。施工以本节为准，与上文冲突时以本节为准。

1. **T3 拿掉杯 C（凉开水浸没）**：没有来源支持“七天不发芽”；绿豆在家里本来就整颗泡水 12 小时。T3 改为四杯 A、B、D、E，相关拍、比较组合、问答一并调整。
2. **杯 E（冰箱）保留**，结果标“本模型中”，说“约 4 °C 或更冷”，用发芽的最低温度（文献估计约 9–10 °C）解释；不写“4–5 °C”。
3. **Silwal 数据改说法**：4.3 / 6.5 / 9.4 天是“最终发芽的种子里有一半”所需的天数，不是全部种子的一半；14 °C 时 21 天只有约 61% 发芽。T2 正文、第 4–5 拍、`half-flag` 与状态标签都按此改写；实验有每天 10 小时光照，不写成在黑暗中。
4. **杯 D（暗柜）**：确认会发芽且苗色发白，可写“发白”（绿豆有专门数据）。
5. **孢子**：写“孢子通常是单个细胞”；删去“没有储存的养料”。
6. **椰子**：写“空腔里装着水”（NParks），不写“中空”。
7. **大小**：绿豆种子长约 4.3–5.1 毫米；苔藓和榕小蜂用“示意比例”，不标真实尺寸。
8. **中文名**：榕小蜂、苔藓已确认；洞穴花蜜蝠保留为编辑译名；不用“长舌果蝠”。

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；来自研究 §1.1 的逐字摘录与同一份 PDF 的 `pdftotext` 文本，R: C01–C08；页码是页脚印的数字，印的第 n 页 = PDF 第 n + 1 页）

**S2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*（封面 "Updated Jan 2026"；本地 `art/codex-research/states-of-matter/sources/moe-primary-science-2023-jan2026.pdf`，SHA-256 `0556023c…3ab0`）。

**Cycles in Plants and Animals (Reproduction) (P5 Standard)**（第 43–45 页）

> **Core Ideas**
> • Recognise that a cell is a basic unit of life.
> • Show an understanding that living things reproduce to ensure continuity of their kind and that many characteristics of an organism are passed on from parents to offspring.
> • Describe processes in the sexual reproduction of flowering plants.
>   - Pollination
>   - Fertilisation (seed production)
>   - Seed dispersal
>   - Germination
>
> Note:
> - Fertilisation occurs when a male reproductive cell fuses with a female reproductive cell.
> - The use of specific terms ("self-pollination" and "cross-pollination") to describe the pollination process is not required.（第 44 页）
> - Knowledge of the pollen tube formation is not required.（第 44 页）
> - The specific location where fertilisation takes place in the female reproductive system is not required.（第 44 页）
>
> • Recognise the process of fertilisation in the sexual reproduction of humans.（第 44 页）
>
> Note:
> - Fertilisation occurs when a sperm fuses with an egg.
> - The fertilised egg develops in the womb.
> - Students should know that ovaries produce eggs, and the testes produce sperms.
> - Foetal development and the mechanism of obtaining air, food and water through the umbilical cord are not required.（第 45 页）
>
> • Recognise the similarity in terms of fertilisation in the sexual reproduction of flowering plants and humans.（第 45 页）
>
> **Practices**
> • Investigate the ways in which plants reproduce.
>   - Spores
>   - Seeds
>
> Note:
> - Vegetative propagation methods, such as stem cutting, are not required.
>
> **Values, Ethics and Attitudes**
> • Show curiosity by questioning and exploring the surrounding plants and animals.
> • Show care and concern by being responsible towards plants and animals.

**P5 Foundation**（第 46–47 页，与 Standard 的差别，R: C02–C08）：Core Ideas 没有"细胞"和"延续"两条；"**State** the processes in the sexual reproduction of flowering plants."（同样四项）；Note 改成 "**Fertilisation is the process that leads to the development of fruits and seeds.**"；同样不要求 self- / cross-pollination 两个词；**没有**花粉管、受精位置两条 Note；Practices "**Observe and compare** the ways in which plants reproduce."（Spores、Seeds）；人的一条 "State the process of fertilisation in the sexual reproduction of humans."，Notes 同 Standard；**没有**"植物与人受精相似"一条。UI 不标 Standard / Foundation（同 docs/33、36、37）；正文把两种受精的说法都写上（04 第 1 段）。

**相邻条目与本主题的关系**：

| 页 | 内容（R:） | 本主题怎么用 |
|---|---|---|
| 15–16 | Table 1：P4 末 "Recognise a fair test (changed/ unchanged variables)"、P6 末 "Design a fair test"；读表、条形图、折线图（C11） | T2、T3 的改变 / 不变 / 观察；T2 的折线图；第 07 章"哪两杯是公平测试" |
| 38 | P3：植物分开花 / 不开花；真菌（霉、蘑菇、酵母）是另一类（C12） | 第 01 章：蕨与苔藓是不开花的植物；真菌只在细看 |
| 42 | P3 Life Cycles：只要求种子、幼株、成株三个阶段；四个过程"在 P5 介绍"（C09） | 00、07 末段接回 `plant` 的生命周期 |
| 69、72 | P6 Interactions："dispersing seeds/fruits"是繁殖上的适应；果实和种子帮助传播的外形是"structural adaptations"；传播方式和外形"在 Cycles 主题里介绍"（C10） | 第 05 章 T1 的"哪个结构帮了忙"；细看指向 P6 |

- 课纲**没有**：蕨、苔藓、蝙蝠、太阳鸟、蜜蜂、传粉者、风媒、萌发条件、暗处（C13）。D4 的处理。
- PSLE（SEAB 2026）：Booklet A 30 道选择题、Booklet B 10–11 道结构题；考"理解与应用"（预测、解释、评价观察与方法）（C14）。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 两种繁殖方式：孢子（蕨、苔藓）、种子 | 主线（00、01） |
| 孢子是单个细胞、没有储存的养分；种子有胚、养分、种皮 | 主线（01 第 5 拍；"单个细胞"待核 F-6） |
| 真菌也产生孢子，但真菌不是植物 | 细看一句（01） |
| 花的部分与各自的作用 | 主线（02） |
| 传粉的定义；花粉可来自同一朵或另一朵花 | 主线（02），**不用**自花 / 异花两个词 |
| 蜜蜂、太阳鸟、洞穴花蜜蝠与榴莲、榕小蜂 | 主线（02、03） |
| 太阳鸟偷蜜；鸟媒花、蝠媒花的特点；新加坡的蝙蝠；马来西亚的榴莲研究 | 细看（03） |
| 风媒（草类） | 细看一句（03），不建模 |
| 受精的两种说法（Standard / Foundation） | 主线（04） |
| 胚珠 → 种子、子房 → 果实 | 主线（04） |
| 受精发生的位置、花粉管 | **不讲**（D3） |
| 人的受精、卵巢 / 睾丸、受精卵在子宫里发育、相似处 | 主线（04 末两拍 + 一段） |
| 胎儿发育、脐带 | **不讲** |
| "果实还是蔬菜"、没有种子的果实 | 细看（04） |
| 四种传播方式与结构 | 主线（05） |
| 一种果实两种方式（榄仁树果、相思豆） | 细看（05） |
| 结构适应（P6） | 细看一句（05） |
| 种子的结构；种子是活的；子叶的养分 | 主线（06） |
| 温度与萌发快慢（实验室数据） | 主线（06，T2） |
| 新加坡室温下几天发芽 | 细看（06：Gardens by the Bay 3–4 天，写清条件） |
| 胚根第几天出来 | **不讲**（没有来源，R: F20） |
| 萌发要水、空气、适宜温度；不需要光；幼苗要光 | 主线（07） |
| 公平测试：一次只改一样；冰箱又冷又暗 | 主线（07 第 5–6 拍） |
| 少数种子要光或要暗才萌发 | 细看（07） |
| 营养繁殖（扦插） | **不讲** |

### 1.3 读者学到什么（P5 用词）

1. 植物有两种繁殖方式：**孢子**和**种子**。蕨和苔藓不开花，靠孢子繁殖；孢子很小，从叶背或小囊里放到空气中。种子里有一个小小的胚、储存的养分和保护它的种皮。
2. **花**是开花植物产生种子的部分。**雄蕊**的花药产生花粉；**雌蕊**顶端的柱头接住花粉，底部的子房里有胚珠。
3. **传粉**：花粉从花药落到柱头上。花粉可以来自同一朵花，也可以来自另一朵花。蜜蜂、太阳鸟、蝙蝠、榕小蜂会把花粉从一朵花带到另一朵花。
4. **受精**：花粉带来的雄性生殖细胞与雌性生殖细胞融合；之后胚珠发育成种子、子房发育成果实。受精是产生果实和种子的过程。
5. **人的受精**也一样是两个细胞融合：精子（睾丸产生）与卵子（卵巢产生）融合，受精卵在子宫里发育。
6. **种子传播**：种子靠风、水、动物，或果实爆开 / 裂开，被带离母株。果实和种子的样子透露它怎样传播：翅、能浮的空隙、动物爱吃的果肉、会爆开的干果荚。
7. **萌发**：种子吸水、胀大，长出根和芽。种子萌发要**水、空气和适宜的温度**；这些绿豆不需要光也能萌发，但幼苗要有光才长得绿。温度低一些，萌发慢一些。
8. **公平测试**：一次只改变一样条件，其他都保持一样，才知道是哪一样起了作用。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

依据：研究 §4（R: M01–M10）。**证据强弱照研究分级**：只有 M-5 有像样的研究（Lampert et al. 2020，228 名 10–18 岁奥地利学生）；其余是教学清单、3 人个案或综述，**没有新加坡的患病率数据**。正文不写"很多孩子以为……"，只正面讲正确的说法。

| # | 说法 | 正确的说法 | 哪里纠正 | 证据（R:） |
|---|---|---|---|---|
| M-1 | 种子要阳光才会发芽 | 这些绿豆在黑暗的柜子里照样萌发；多数种子不需要光，少数要光或要暗 | 07 第 4 拍、T3 先猜后看、细看 | M01：教学页 + 3 人个案 + 学校清单；反证 F16（BBSRC、VCE） |
| M-2 | 种子要的和植物长大要的是一回事 | 种子萌发靠自己储存的养分，不需要光；幼苗用完养分后要光 | 07 第 4 拍、细看 `Seed or seedling?` | M02：教学页（Vanderbilt，句子被截断，待核） |
| M-3 | 种子是食物、不是活的 | 种子里有活的胚，会呼吸 | 06 第 2 拍、细看 | M03：3 人个案；综述 |
| M-4 | 花只是好看 | 花是产生种子的部分 | 02 第 1 拍 | M04：学校清单（无研究） |
| M-5 | 传粉和种子传播是一回事 | 传粉搬的是花粉（花 → 花）；种子传播搬的是种子（果实 → 别处）。同一棵榕树两件事都有 | 03 第 5 拍、05 第 1 段、T1 细看 | M05：Lampert 2020（研究，摘要） |
| M-6 | 所有植物都从种子长出来 / 都开花 | 蕨和苔藓不开花、靠孢子 | 01 第 1 拍 | M06：学校清单 |
| M-7 | 长在树上的是水果、长在地里的是蔬菜 | 由花的子房长成的就是果实，辣椒就是果实 | 04 第 4 拍、细看 | M07：土耳其 6–8 年级（摘要页） |
| M-8 | 没有种子就是没传粉 | 有些果实不受精也能长成（香蕉、菠萝的例子见综述）；不写成绝对的话 | 04 细看 | M08：综述转引 |
| M-9 | 植物从土里"吃"食物 | 种子萌发靠自己储存的养分；长大后叶子自己造食物（链 `plant`） | 06 细看 | M09：综述（28 篇） |
| M-10 | 只有蜜蜂传粉 | 太阳鸟、蝙蝠、榕小蜂也传粉 | 03 整章 | **无研究来源**（不说"常见误解"） |
| M-11 | 孢子就是很小的种子 | 孢子是一个细胞，没有胚和储存的养分 | 01 第 5 拍 | **无研究来源**；F-6 待核 |
| M-12 | 拿冰箱里的和窗台上的比，就知道温度的作用 | 冰箱又冷又暗，改了两样；要和柜子里的比 | 07 第 5–6 拍 | **无研究来源**（课纲 P4 过程技能的应用） |

### 1.5 PSLE 题型 → 本主题哪里支持

题型是研究按课纲与 SEAB 目标**推出来的描述**（R: X06，unverified：没有对照真题，不声称出现频率）。

| 题型 | 本主题 |
|---|---|
| 从一张条件表里挑出会萌发的装置 | T3（五杯）+ 记表 |
| 哪两组构成某个条件的公平测试 | T3 的"和哪一杯比"+ `changed` 输出；07 第 5–6 拍 |
| 解释某组为什么不萌发（水、空气、温度） | 07 第 2、3、6 拍 |
| 拿走光会怎样、幼苗以后缺什么 | 07 第 4 拍、细看 |
| 排列 / 配对四个过程 | 00、04 第 1 拍、循环流 |
| 标出花的部分、说出作用 | 02 |
| 胚珠、子房各长成什么 | 04 第 3–4 拍 |
| 从果实特征判断传播方式、说出结构适应 | T1 |
| 情境里分辨传粉与种子传播 | 03 第 5 拍、05 细看 |
| 读种子萌发随天数 / 温度变化的表或图 | T2 的表与折线图 |
| 分出靠种子和靠孢子繁殖的植物 | 01 |
| 植物与人受精的相似处（Standard） | 04 第 6 拍 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：通俗不幼稚，先现象后道理；不拟人；不喊"小朋友"、无感叹号、无问句标题。试一试写"改变 / 不变 / 观察"。**安全与爱护**：剖辣椒请大人在场、之后洗手、不碰眼睛；看蝙蝠、鸟、巢蕨只看不碰、不摘；冰箱实验用干净的杯子、做完扔掉豆子。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 一株植物的根、茎、叶、运输、光合作用 | `plant` | 06、07 细看链 `<TopicLink slug="plant" ch="leaves-make-food">`（幼苗要光） |
| 辣椒花的部分、蜜蜂、受精（P5 入门） | `plant` 第 05 章 `flowers-and-pollination` | 02 细看 `More on this flower` 链过去 |
| 五个传播例子 | `plant` 第 06 章 `fruits-and-seeds` | 05 细看链过去 |
| 生命周期（种子 → 幼株 → 成株） | `plant` 第 07 章 `seed-to-plant` | 00、07 末段链过去 |
| 生物与非生物、开花 / 不开花植物、真菌 | `living-things`（docs/38，起草中） | 若施工时已发布，01 细看链它的相应章（`pnpm validate` 核章 id）；未发布就不写链接，谁后发布谁补 |
| 动物的生活史 | `mosquito`、`grasshopper` | 00 细看一句"动物也有生活史"，链 `mosquito` |

**回链**：本主题发布时由**主会话**在 `plant` 第 05、06、07 章细看各加一句链到本主题的 02、05、07 章（内容代理不碰 `plant` 目录）。

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的尺寸与取舍；`SIM` = §4 模型按规则给出的结果。P# → §6.2（施工时变 S#；S1 是设计研究来源）。置信度照研究：verified / partial / unverified；"待核" = F 步读原文定。

### 2.1 孢子与种子（第 01、06 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-1 | 蕨不开花，靠叶背的孢子繁殖 | "they do not flower and instead reproduce via spores on the undersides of their leaves"（NParks 2025，P25，R: F23、E90） | 01 第 1–2 拍 | verified |
| F-2 | 孢子囊群、孢子散到空气中 | 成熟叶背上成群的孢子囊叫 sori；孢子从孢子囊放到空气里（OpenStax 25.4，P32，R: E91、E92） | 01 第 3 拍 | verified |
| F-3 | 巢蕨 | *Asplenium nidus*，NParks 中文名 巢蕨；孢子囊群窄，长在叶片上半部的每条叶脉上；用孢子繁殖（P23，R: E97、E177）。叶片长度 **待核**（§2.7） | 01、零件 `fern-*` | verified |
| F-4 | 苔藓 | 孢蒴口的蒴齿随湿度开合、陆续放出孢子；苔藓植物多生在潮湿处（OpenStax 25.3，P33，R: E93、E37） | 01 第 4 拍 | verified |
| F-5 | 真菌的孢子 | 比植物的种子小而轻，随风飘或附在动物身上（OpenStax 24.1，P34，R: E94、E95）；课纲把真菌列为植物以外的一类（S2 第 38 页，R: C12） | 01 细看 | verified |
| F-6 | 种子 vs 孢子 | 种子给胚保护、养分和休眠的机制；储存组织和种皮（OpenStax 26.1，P35，R: E96、E99）。**"苔藓、蕨的孢子是单个细胞"待核**：研究没存 OpenStax 26.1 / 25.1 的原句（R: F26 partial）；F 步补一条 ≤ 25 词的引文。核不到：01 第 5 拍只说"种子里有胚和养分"，删"孢子是一个细胞"，M-11 改成正文一句"孢子里没有胚和储存的养分"也删 | 01 第 5 拍 | partial → 待核 |
| F-7 | 种子的部分 | 种皮、储存的养分（如胚乳）、胚（VCE，P39，R: E102）；豆类的养分在子叶里（`plant` S7 OpenStax 32.2 的用法，R: F18） | 06 第 1–2 拍 | partial |
| F-8 | 种子是活的 | "Respiration takes place in all viable seed."（VCE，R: E104） | 06 第 2 拍 | verified |

### 2.2 花与传粉（第 02、03 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-9 | 花的部分 | 雄蕊 = 花丝 + 花药（花粉在花药里形成）；心皮（雌蕊）= 柱头、花柱、子房；子房里有一个或多个胚珠（OpenStax 32.1，P30，R: F01、E40–E42）。OpenStax 用 carpel，Atlas 沿用 `plant` 名词表的 pistil（新加坡课本的用词未核） | 02 | verified |
| F-10 | 辣椒花 | 白色，约 1 cm；花瓣 5（–7）、雄蕊 5（–7），花药常带蓝紫色；子房 2–3 室（`plant` 的 S10 Flora of China、S11、S12，P61–P63）；模型画 5 瓣 5 雄蕊（DESIGN，同 `plant`） | 02、规格行 | verified（`plant` 已核） |
| F-11 | 辣椒靠蜜蜂 | NParks：传粉方式 Insects (Bee)（P26，R: F04、E64）；辣椒花能自己传粉，蜜蜂来访结果更多更好（`plant` S13、S14，P63、P62） | 02 第 4–5 拍 | verified |
| F-12 | 蜜蜂 | "the main pollinator for many food crops today"（NParks 2025，P17，R: E57）；凤仙花靠蜂、蝶、蛾（P11，R: E66） | 02 细看 | verified |
| F-13 | 传粉的定义 | 花粉从花药到柱头（OpenStax 32.2，P31；`plant` 名词表同一说法） | 02 第 4 拍、名词表 | verified（`plant` 已核） |
| F-14 | 风媒 | "many angiosperms, such as grasses, maples and oaks, are pollinated by wind"（OpenStax，R: E44）；**没有新加坡例子**（R: F03） | 03 细看一句 | partial |
| F-15 | 鸟媒花 | "Brightly colored, odorless flowers that are open during the day are pollinated by birds."（OpenStax，R: E46） | 03 细看 | verified |
| F-16 | 太阳鸟 | 细长、向下弯的喙；以花为食，"act as pollinators to the flowers that they visit"；新加坡七种（NParks 2025，P17、P18，R: F08、E58、E60） | 03 第 1 拍 | verified |
| F-17 | 太阳鸟怎样传粉、怎样偷蜜 | 从花口取食，喙上沾的花粉蹭到下一朵花的柱头；有些从花瓣基部啄穿"抄近路"，不帮这些花传粉（BESG 2018，P19，R: E61、E62；该文写的是 Scarlet Spiral Flag 上的 Olive-backed Sunbird） | 03 第 2 拍、细看 | verified |
| F-18 | 太阳鸟的名字 | NParks 2025 文章：Olive-backed Sunbird（*Cinnyris jugularis*）；NParks Flora & Fauna Web（2025 年更新）：Ornate Sunbird（*C. ornatus*），该页不提传粉（P20，R: F09、E65） | §0.1-2 | partial |
| F-19 | 洞穴花蜜蝠 | *Eonycteris spelaea*：吃花蜜和花粉；成群栖在山洞、旧建筑、混凝土桥下；"Important pollinator of many forest trees including durians."（NParks，P4，R: F05、E50–E52）。保育状态（Uncommon；新加坡红皮书 Vulnerable 1994）是工具从页面读出、没有引文：**待核** | 03 第 3–4 拍、细看 | verified（状态待核） |
| F-20 | 榴莲花 | NParks：花在夜里开、气味浓，蝙蝠是主要传粉者（P5，R: F06、E53） | 03 第 3 拍 | verified |
| F-21 | 蝙蝠怎样带花粉 | "their faces and heads become covered with pollen, which is then transferred to the next flower"（OpenStax 32.2，R: E45） | 03 第 4 拍 | verified |
| F-22 | 榴莲的野外研究在马来西亚 | 刁曼岛的大狐蝠（*Pteropus hypomelanus*）提高榴莲结果，"serve as important pollinators for durian trees"（Aziz et al. 2017，P36，R: E54）。**不是新加坡、不是洞穴花蜜蝠**；F 步核该文是否也记了洞穴花蜜蝠 | 03 细看 | verified |
| F-23 | 新加坡的一条观察 | 2012 年 4 月 5 日晚上，金蒲桃（golden penda）花上的洞穴花蜜蝠，翼膜沾满黄色花粉（Singapore Biodiversity Records 2013，P21，R: F07、E55）——观察记录，不是传粉研究 | 03 细看 | verified |
| F-24 | 榕小蜂 | "Only fig wasps can pollinate the fig trees"（NParks 2025，R: E59）；青果榕 *Ficus variegata* 由 *Ceratosolen appendiculatus* 传粉，成熟榕果被鸟吃（P15，R: F10、E63） | 03 第 5 拍 | verified |
| F-25 | 榕树的花在榕果里面 | **待核**（研究没存这句）：F 步在 NParks 2025 文章的榕小蜂一段或 OpenStax / 大学资料里找"榕果是一个里面长满小花的结构、榕小蜂从顶端小孔钻进去"。核不到：03 第 5 拍字幕改成"榕树只能靠榕小蜂传粉。青果榕有它自己的那一种榕小蜂。"，`fig-cut` 不画里面的小花、只画剖开的果壁 | 03 第 5 拍、零件 `fig-cut` | 待核 |

### 2.3 受精与果实（第 04 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-26 | 受精的两种说法 | Standard：雄性生殖细胞与雌性生殖细胞融合；Foundation：导致果实与种子形成的过程（S2 第 43、46 页，R: C04） | 04 第 1 拍与第 1 段 | verified |
| F-27 | 胚珠 → 种子、子房 → 果实 | "The fertilized ovule forms the seed, whereas the tissues of the ovary become the fruit, usually enveloping the seed."（OpenStax 32.2，R: F02、E43） | 04 第 3–4 拍 | verified |
| F-28 | 不受精也有果实 | 综述转引 Hershey：香蕉、菠萝等可单性结实；"所有植物的果实都要经过传粉受精"是误解（Wynn et al. 2017，P49，R: M08、E135） | 04 细看（不写绝对的话） | partial |
| F-29 | 人的受精 | 精子与卵子融合；受精卵在子宫里发育；卵巢产生卵子、睾丸产生精子；胎儿发育与脐带不要求（S2 第 44–45 页，R: C08、E11–E14） | 04 第 5–6 拍 | verified |
| F-30 | 相似处 | "Recognise the similarity in terms of fertilisation in the sexual reproduction of flowering plants and humans."（Standard 第 45 页，R: E15） | 04 第 6 拍 | verified |
| F-31 | 延续与遗传 | "living things reproduce to ensure continuity of their kind …"（Standard 第 43 页，R: E06）；"a cell is a basic unit of life"（R: E05） | 04 细看两句 | verified |

### 2.4 种子传播（第 05 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-32 | 青龙木（风） | 不开裂的翅荚，扁翅围着中央，"dispersed by the wind"；花通常只开一天（NParks，P6，R: F11、E70–E72）。荚的大小：`plant` 写 3–5 cm（`plant` S16），F 步复核 | 05 第 1 拍、T1 | verified |
| F-33 | 新加坡的其他例子 | 风：Marsh Pulai、Keruing；水：Sea Pong Pong、Katong Laut；动物：Ohwia caudata、Bur Mallow；自己爆开 / 裂开：Champaca、Twin-seed（NParks P5 资源页，P16，R: E84、E85、E183、E184） | 05 细看 `Find them in Singapore` | verified |
| F-34 | 榄仁树果（水） | "They have a corky rind, which contains tiny air cavities that enable them to float"（NParks Heritage Tree，P7，R: E73）；"随海流和海浪漂到新的海岸"这半句 F 步对原文措辞；果蝠和猴子也吃，帮助传播（P7、P8，R: E74、E88）。果的大小 **待核**（§2.7） | 05 第 2 拍、细看 | verified（措辞待核） |
| F-35 | 椰子（水） | "The cavity within the nut augments the buoyancy provided by the thick husk."（Harries & Clement 2014 摘要，P13，R: E75——**OUP 拒绝 curl，没逐字核对**，待核）；NParks：外果皮、纤维质中果皮、木质内果皮（P12，R: E76） | 05 第 3 拍 | partial → 待核 |
| F-36 | 辣椒与鸟（动物） | 辣椒素挡住脊椎动物里吃种子的，不挡更有效的传播者（Tewksbury & Nabhan 2001 摘要，P37，R: E86）；"the birds passed the seeds whole and capable of germinating"（ScienceDaily 新闻稿，P38，R: E38） | 05 第 4 拍、T1 | verified |
| F-37 | 榕果（动物） | 成熟榕果是鸟、蕉松鼠、长尾猕猴的食物（NParks 青果榕，P15，R: E83、E63） | 03 第 5 拍、05 细看、T1 | verified |
| F-38 | 橡胶树（爆开） | 蒴果干了"explodes with a loud sound resembling the sound of a gun-shot"，传播字段 Abiotic (Explosive Dehiscence)（NParks，P9，R: E77）；Heritage Tree 页："explode loudly when ripe and dry, dispersing the seeds more than 20 m from the parent tree"（P10，R: E78，工具截短，F 步对全句）。蒴果与种子的大小 **待核**（§2.7） | 05 第 5 拍、T1 | verified（全句待核） |
| F-39 | 凤仙花（裂开） | 果"split open easily to scatter small seeds"；属名 *Impatiens* 来自果荚爆开放出种子（NParks，P11，R: E79、E80） | 05 第 6 拍、T1 | verified |
| F-40 | 相思豆两边都沾 | 豆荚"twists spirally and splits open"，红种子"are eaten and dispersed by birds"（NParks，P14，R: F15、E81、E82）；NParks 工作纸把它归哪类**没读到**（404） | 05 细看一句 | partial |
| F-41 | 用纸做的"种子"做公平测试 | 一次只改一个量（如纸螺旋桨的大小），其余不变（如落下的高度）；真的种子"Possibly too many variables in nature"（SFI，P46，R: X04、E120、E121） | 05 细看（文字试一试） | verified |
| F-42 | P6 结构适应 | "physical characteristics are the 'structural adaptations' which help fruits and seeds in their dispersal"（S2 第 69 页，R: E24） | T1 的 `feature`、05 细看 | verified |

### 2.5 萌发（第 06、07 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-43 | 四个环境因素 | "There are four environmental factors which affect germination: water, oxygen, light, and temperature."；第一步是吸水；所有活种子都呼吸；光对某些种子促进或抑制（VCE，P39，R: F16、E100–E104） | 06、07 | verified |
| F-44 | 多数种子不需要光 | "The food store provides the energy required to form a root and a stem, even in the absence of light."；豌豆"will germinate in either light or dark conditions as long as there is adequate warmth and water"；有些种子要光或要暗才"启动"（BBSRC，P40，R: E105、E106、E109） | 07 第 4 拍、细看 | verified |
| F-45 | 暗处的幼苗 | 暗、暖处的豌豆萌发后"will display signs of light deficiency"（弱、苍白，R: F17、E122） | 07 第 4 拍、T3 的 `seedlings` | verified（豌豆；用到绿豆是推广，细看写明） |
| F-46 | 泡在煮过放凉的水里不萌发 | **待核**（D9-④）：F 步找一条课堂或推广资料说"完全泡在水里（煮过放凉的水）的种子缺氧、不萌发"。现有依据只有 F-43 的"氧"。退路：§0.1-6 | 07 第 3 拍、T3 的 C 杯 | 待核 |
| F-47 | 冰箱里一星期不萌发 | **推断**：14 / 17 / 20 °C 的中位天数 9.4 / 6.5 / 4.3（F-50），越冷越慢；冰箱更冷，一星期不发芽。F 步找直接来源（Silwal 2026 全文的最低温度结论，或推广资料给的绿豆最低萌发温度）。退路：§0.1-6 | 07 第 5–6 拍、T3 的 E 杯 | 推断 → 待核 |
| F-48 | 根先出来 | **待核**：研究没存"radicle emerges first"的引文（`plant` 第 07 章写了，来源 S7 / S20 需复核）。核不到：06 第 3 拍改成"种子吸水胀大，种皮裂开，长出根和芽" | 06 第 3 拍 | 待核 |
| F-49 | 绿豆的名字与出土方式 | NParks：Mung bean、Green gram、Green bean，中文 绿豆（P27，R: E117）；"Germination is epigeal with the cotyledons and stem emerging from the seedbed."（Oplinger 1990，P45，R: E116） | 06、07 | verified |
| F-50 | 温度与天数（实验室） | 湿纸巾上的绿豆，一半发芽的中位天数：20 °C 4.3 天、17 °C 6.5 天、14 °C 9.4 天（Silwal et al. 2026，澳大利亚，只测了这三个温度，P44，R: E115） | T2、06 第 4–5 拍 | verified |
| F-51 | 绿豆芽几天 | Gardens by the Bay：3–4 天（先泡 12 小时，放在暗柜里，P42，R: E111、E112）；NC State：3–7 天长成，最好在 70–80 °F（约 21–27 °C）的暗处（P43，R: E113、E114） | 06 细看、D9 | verified |
| F-52 | 胚根 1–2 天出来 | **没有来源，不发表**（R: F20） | 验收的 grep | unverified |
| F-53 | 新加坡的温度 | 2009–2018 年是新加坡最暖的十年，平均 27.89 °C（NEA，P29，R: E118）；比 NC State 的范围略高一点 | 06 细看 | verified |
| F-54 | BBSRC 的设计 | 豌豆分四组：亮 / 暗 × 凉 / 暖；凉的两组放一起、暖的两组放一起"to ensure that the test is fair"；第 5–7 天量幼苗（R: X01、E107、E108） | 07 细看 `A light and warmth test` | verified |
| F-55 | NParks "Every Child a Seed" | 小苗放在温暖、半荫处，土湿而不积水（P3 计划页，P22，R: E119） | 07 细看（在家种） | verified |

### 2.6 模型（SIM，设计研究来源 S1 的内容；§4 的模型按规则给出；单测钉死）

**五杯**（T3，第 07 章；每杯 5 粒绿豆，同样的透明杯与棉花；第 0 天放好，第 7 天看）。规则：**发芽 = 有水 ∧ 有空气 ∧ 温暖**（F-43；光不进这条规则，F-44）；第 7 天发芽的杯：有光 → 绿色幼苗，没光 → 淡黄幼苗（F-45）；第 0 天一律"刚放好"。

| 杯 | 水 | 空气 | 放在 | 温暖 | 有光 | 第 7 天 | 幼苗 | 和 A 比改了 | 和 D 比改了 |
|---|---|---|---|---|---|---|---|---|---|
| A | 湿棉花 | 有 | 窗台 | 是 | 是 | **发芽** | 绿 | 同一杯 | 光（一样） |
| B | 干棉花 | 有 | 窗台 | 是 | 是 | **没发芽**（F-43 吸水） | — | 水（一样） | 不止一样 |
| C | 泡在煮过放凉的水里 | 少 | 窗台 | 是 | 是 | **没发芽**（F-46 待核） | — | 空气（一样） | 不止一样 |
| D | 湿棉花 | 有 | 柜子里（关着门） | 是 | 否 | **发芽**（F-44） | **淡黄** | 光（一样） | 同一杯 |
| E | 湿棉花 | 有 | 冰箱里 | 否 | 否 | **没发芽**（F-47 推断） | — | **不止一样**（温度 + 光） | 温度（一样） |

- 这张表就是第 07 章的"答案"：只改一样的比法——B 对 A（水）、C 对 A（空气）、D 对 A（光）、**E 对 D（温度）**；E 对 A 不是公平测试。
- S1 写明：真实的杯子每次会有一两粒不发芽或发得慢，模型给的是来源里的一般结果；C 杯里的水还有一点空气，个别种子可能胀大甚至冒出一点根（F-46 核完再定措辞）。

**温度与天数**（T2，第 06 章）：中位天数取 F-50；第 d 天（0–12）：d ≥ 中位数 → "一半或更多发芽了"，否则"不到一半"（中位数的定义：到这一天，一半种子已经发芽）。

| 温度 | 一半发芽（中位） | 第 4 天 | 第 5 天 | 第 7 天 | 第 10 天 |
|---|---|---|---|---|---|
| 20 °C | 4.3 天 | 不到一半 | 一半或更多 | 一半或更多 | 一半或更多 |
| 17 °C | 6.5 天 | 不到一半 | 不到一半 | 一半或更多 | 一半或更多 |
| 14 °C | 9.4 天 | 不到一半 | 不到一半 | 不到一半 | 一半或更多 |

**传播**（T1，第 05 章）：

| 果实 | 方式 | 帮了忙的结构 | 来源 |
|---|---|---|---|
| 青龙木 | 风 | 翅 | F-32 |
| 榄仁树果 | 水 | 有空隙、能浮 | F-34 |
| 椰子 | 水 | 有空隙、能浮 | F-35 |
| 辣椒 | 动物 | 动物吃的多汁果实 | F-36 |
| 榕果 | 动物 | 动物吃的多汁果实 | F-37 |
| 橡胶树果 | 爆开 / 裂开 | 干了会爆开的果 | F-38 |
| 凤仙花 | 爆开 / 裂开 | 干了会爆开的果 | F-39 |

（榄仁树果"也被动物吃"不进模型，只在细看。）

### 2.7 模型尺寸（DESIGN；待核的由 F 步读 NParks 物种页的 Size / Fruit / Flower 字段定）

| 件 | 取值 | 依据 | 核不到时 |
|---|---|---|---|
| 辣椒花 | 约 1 cm 宽，模型 ×20 | F-10 | — |
| 蜜蜂 | 约 1.2 cm，×20（同花） | `plant` 的蜜蜂约 1 cm（`plant` 零件细看）；F 步复核 | 名字写"示意比例" |
| 巢蕨叶片 | **待核**（NParks 页面的叶长字段） | P23 | `fern` 组不写 scale |
| 孢子囊群、苔藓 | 叶片一段 3 cm、苔藓 1–3 cm，×10 | 示意（苔藓高度**待核**） | `spore-close` 组不写 scale |
| 太阳鸟 | **待核**（约 10 cm 量级） | P17 / P18 | `visitors` 组不写 scale |
| 洞穴花蜜蝠 | **待核**（前臂长、翼展） | P4 | 同上 |
| 榴莲花 | **待核** | P5 | 同上 |
| 榕果、榕小蜂 | **待核**（榕果直径；小蜂约 mm 量级） | P15 | `fig` 组不写 scale |
| 青龙木荚 | 3–5 cm（`plant`） | F-32 | — |
| 榄仁树果、橡胶树果与种子 | **待核** | P8、P9 | `fruits` 组不写 scale |
| 椰子 | 沿用 `plant` 的几何与尺寸 | `plant` S17 | — |
| 绿豆 | 约 4 mm 长（**待核**，`plant` 的绿豆 ×10 几何） | P27 / P45 | 名字仍写 ×10（相对 `plant` 几何） |
| 杯 | 直径 7 cm、高 9 cm 的透明塑胶杯；棉花 1 cm 厚；窗台、柜、冰箱按家用常见大小 | DESIGN（示意） | — |

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） | 比例 | 卡 |
|---|---|---|---|---|---|---|
| 01 | `fern` | Fern / 蕨 | 巢蕨、翻起的一片叶 | `token:ink-2` | ×¼ | ✓ |
| 02 | `spore-close` | Spores up close / 孢子特写 | 叶背一段孢子囊群、苔藓与孢蒴 | `token:ink-3` | ×10 | `card: false` |
| 03 | `flower` | Flower / 花 | 辣椒花、剖开的花、花萼、雄蕊、雌蕊、胚珠、花粉、蜜蜂 | `token:hot` | ×20 | ✓ |
| 04 | `visitors` | Other pollinators / 别的传粉者 | 太阳鸟与红花、洞穴花蜜蝠与榴莲花 | `token:accent-2` | ×1 | ✓ |
| 05 | `fig` | Fig and fig wasp / 榕果与榕小蜂 | 剖开的榕果、榕小蜂 | `token:accent-2` | ×10 | `card: false` |
| 06 | `cells` | Reproductive cells (diagram) / 生殖细胞（示意） | 植物的一对、人的一对 | `token:signal` | 示意 | `card: false` |
| 07 | `fruits` | Fruits and seeds / 果实与种子 | 青辣椒、红辣椒剖面、翅果、榄仁树果（整 + 剖）、椰子、榕果、橡胶树果与种子、凤仙果荚 | `token:food` | ×1 | ✓ |
| 08 | `seed-inside` | Inside a seed / 种子的里面 | 绿豆整粒、剖开、发芽；一小撮蕨的孢子 | `token:ink-3` | ×10 | `card: false` |
| 09 | `germination` | Seed test / 萌发测试 | 五杯与里面的种子 / 幼苗、两个指示环、天数卡、标记、旗、培养皿 | `token:cold` | ×1 | ✓ |
| — | `spore-drift` | Spores / 孢子 | 只有流 | `token:ink-3` | — | — |
| — | `pollination` | Pollen / 花粉 | 只有流（四条路径） | `token:cut` | — | — |
| — | `seed-travel` | Seeds on the move / 种子的旅程 | 只有流（风、水、爆开） | `token:neutral` | — | — |
| — | `cycle` | The cycle / 循环 | 只有流（沿台边一圈） | `token:loop` | — | — |

- 右上卡：零件链路卡，列 = 蕨 → 花 → 别的传粉者 → 果实与种子 → 萌发测试（`card` 为 ✓ 的五组；`connects` 只在工位内部连：花药 → 柱头、太阳鸟 → 红花、蝙蝠 → 榴莲花、果 → 种子、杯 → 种子 → 幼苗）。不需要新卡。
- PLATE KEY 图例现在能换行（两行，`space-plate__key`）；9 个实体组仍偏多，施工时若两行放不下，把 `fig` 并进 `visitors` 的图例色（同 `accent-2`，名字仍分开）。
- context：`table`（圆形标本台，`clip: false`）、`side-table`（巢蕨小台，`clip: false`）、`sea-water`（果实工位后面的一条海水，`membrane`）、`windowsill`（A–C 杯下的窗台与窗框）、`cupboard`（D 杯的柜子，门画成打开以便看见，`shell`）、`fridge`（E 杯的小冰箱，前面剖开，`shell`）。

### 3.2 坐标与尺度

- 不写 `units`；1 场景单位按组的 `scale` 换算（D14）。Y 向上，台面 y = 0，+Z 朝观者。圆台中心 (0, 0, 0)、半径 1.5；工位中心（R2 起点，按钟点、俯视顺时针）：① 花 (0, 0, −1.15)；② 别的传粉者 (1.05, 0, −0.75)、榕果 (1.25, 0, −0.3)；③ 细胞 (1.2, 0.25, 0.35)（悬在台上 25 cm 处的示意）；④ 果实 (0.45, 0, 1.15)；⑤ 种子的里面 (−0.35, 0, 1.2)；⑥ 萌发台 (−1.1, 0, 0.6)…(−1.25, 0, −0.2)（窗台、柜、冰箱沿台边排）。巢蕨小台在 (−2.4, 0, −0.4)。
- **复用 `plant` 几何的换算**（`build-parts.ts`）：`plant` 是 `units: { modelUnit: "cm", scale: 50 }`（1 U = 50 cm），零件名里的"×N"是它自己的放大倍数（没写的按 ×1；花 ×1.7——`plant` S1 说三朵花画成约 1.7 cm）。本主题换算系数 s = 50 ÷ N_plant × M_本组 ÷ 100（例：花 s = 50 ÷ 1.7 × 20 ÷ 100 ≈ 5.88；剖开的花 s = 50 ÷ 6 × 20 ÷ 100 ≈ 1.67；绿豆 s = 50 ÷ 10 × 10 ÷ 100 = 0.5）。对每个 primitive 与 extra：`at` 相对零件锚点（主 primitive 的 `at`）乘 s 再平移到工位；`scale` 乘 s（缺省视为 [1,1,1]）；`repeat` 的半径、姿态的 `offset` / `pivot`、动画的 `pivot` / 关键帧位移同样换算。**单测**：换算后零件包围盒 = `plant` 原包围盒 × s（± 1 %）；不改 `plant` 的文件（测试读文件哈希前后一致）。引擎若对 `scale` 的作用中心与上述假设不同，由几何代理在 R2 第一轮先验证一件（花），再批量换算。
- 整体包络约 x −2.7 … 1.6、z −1.6 … 1.6，半径约 2.1；投影照引擎默认。以上是 R2 起点：对照参考图调比例；改量级回 §2.7 改 DESIGN。

### 3.3 Tier-1（一眼能认）与参考图

| 对象 | 一眼要认出的 |
|---|---|
| 巢蕨 | 一圈宽带状、全缘、亮绿的叶片从中心放射张开，中间像鸟巢；一片叶翻过来，叶背上半部沿每条侧脉一条条褐色细线 |
| 苔藓 | 一小丛贴地的细小叶状枝，上面伸出细柄，柄顶一个小囊（带盖 / 口） |
| 辣椒花 | 同 `plant`：白色星形 5 裂花冠、一圈带蓝紫色花药的雄蕊围着一根柱头；剖开的一半看得见子房里的胚珠 |
| 蜜蜂 | 同 `plant` 的蜜蜂（胸腹环纹、两片翅） |
| 太阳鸟 | 小鸟、**细长向下弯的喙**、橄榄绿背、黄腹（雌，配色待核 R5），停在红色穗状花上，喙伸进花口 |
| 洞穴花蜜蝠 | 长吻的果蝠类头部、大眼、膜翼由指骨撑开、悬停姿态；面部沾黄色花粉（示意） |
| 榴莲花 | 一簇从枝上垂下的乳白色花，长长一束雄蕊伸出花外 |
| 榕果、榕小蜂 | 圆的榕果剖开：厚果壁、里面一层密密的小花、顶端一个小孔；一只极小的黑色小蜂在孔口 |
| 生殖细胞 | 圆形细胞示意（两对），简洁、无器官背景，旁边一个"示意"小标 |
| 青龙木翅果 | 同 `plant`：扁圆盘，中央鼓起、四周纸质翅 |
| 榄仁树果 | 扁的杏仁形核果，有一条脊；剖开的一半：外层软木般、布满小空隙，中间一粒种子 |
| 椰子 | 同 `plant` 的剖开椰子 |
| 橡胶树果 | 三瓣的圆蒴果，瓣缝清楚；三粒带斑纹的椭圆种子；爆开姿态里三瓣裂开扭转、种子飞出 |
| 凤仙花果荚 | 同 `plant` 的裂开果荚 |
| 五杯 | 透明塑胶杯、白棉花、五粒绿豆或五株幼苗；C 杯装满水；D 杯在柜里；E 杯在冰箱里 |

**参考图**（`scripts/geo/flower-and-seed/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可；照片只看，不贴图）：

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 巢蕨植株与叶背孢子囊群 | Wikimedia Commons "Asplenium nidus"；NParks 物种页照片（© NParks，只本地对照） | CC，逐张核 / © | 叶形、孢子囊群的位置与走向 |
| R2 | 苔藓孢子体 | Commons "Moss sporophytes"、"Moss capsules" | CC | 柄与孢蒴的比例 |
| R3 | 辣椒花 | `scripts/geo/plant/refs/` 已有（R3） | 同 `plant` | 复用核对 |
| R4 | 蜜蜂 | 同 `plant` | — | — |
| R5 | Olive-backed / Ornate Sunbird（雌） | Commons "Cinnyris jugularis female"；NParks 2025 文章照片（只看） | CC / © | 喙的弯度、体色、停姿 |
| R6 | Scarlet Spiral Flag | Commons "Costus woodsonii" | CC | 苞片与管状花 |
| R7 | 洞穴花蜜蝠 | Commons "Eonycteris spelaea"；NParks 物种页 | CC / © | 吻长、翼形、体色 |
| R8 | 榴莲花 | Commons "Durio zibethinus flowers" | CC | 花簇、雄蕊束 |
| R9 | 青果榕榕果与剖面、榕小蜂 | Commons "Ficus variegata"、"Fig wasp"、"Syconium" | CC | 果壁、内部小花、孔口 |
| R10 | 榄仁树果与剖面 | Commons "Terminalia catappa fruit" | CC | 形状、脊、软木层 |
| R11 | 橡胶树蒴果与种子 | Commons "Hevea brasiliensis fruit / seeds" | CC | 三瓣、种子斑纹 |
| R12 | 绿豆萌发 | 同 `plant` R7 | — | 幼苗形态 |
| R13 | 首页图 `art/planned/flower-and-seed/flower-and-seed.png` | 本 repo（已审草稿） | 自有 | 只作风格参照（不是辣椒） |

### 3.4 零件（59 个 + 6 个 context）

材质族见 docs/06（生物：`tissue`、`chitin`、`membrane`、`eye`；器材：`glass`、`plastic`、`fabric`、`wood`、`enamel`）；`shell` = X-RAY 时变透明；"复用"= 由 `build-parts.ts` 从 `plant/data/parts.json` 换算（D13）。颜色只用 token、`tint` 或固定 hex（淡黄幼苗的混色用固定 hex，不用 `token:ink-*`——cinema 下会变亮，docs/36 §9.2 的教训）。

**① 蕨与孢子**

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 01 | `fern-fronds` Bird's nest fern / 巢蕨 | fern | `wing` 带状叶 ×9（extra，绕中心放射，`veins` 中脉 + 细侧脉）+ 中心一团 `sweep` 根与叶基 | `tissue` 亮绿 | | R1 |
| 02 | `fern-underside` Frond, turned over / 翻过来的叶片 | fern | 一片 `wing` 叶翻成叶背朝上；叶片上半部每条侧脉上一条细 `sweep`（褐色孢子囊群，≤ 24 条 extra，同材质合并） | `tissue` 浅绿 + 褐 tint | | R1 |
| 03 | `sorus-close` Spore lines ×10 / 孢子囊群 ×10 | spore-close | 3 cm 的一段叶背（薄 `box`）+ 三条隆起的孢子囊群（`sweep`）+ 孢子囊 `sphere` `repeat`（每条 12 个） | `tissue` 绿 / 褐 | `spore-drift` 流的起点 | R1 |
| 04 | `moss-cushion` Moss ×10 / 苔藓 ×10 | spore-close | 小叶状枝 `sweep` + 极小 `wing` 叶，`repeat` ×14 成一丛；底下一块石（extra `bevelBox`） | `tissue` 深绿 + `abrasive` 石 | | R2 |
| 05 | `moss-capsules` Moss capsules ×10 / 苔藓的小囊 ×10 | spore-close | 细柄 `sweep` + 小囊 `lathe`（口一圈细齿 `fins`）`repeat` ×5 | `tissue` 赭绿 | | R2 |

**② 花**（×20；06–13 复用）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 06 | `flower` Chilli flower ×20 / 辣椒花 ×20 | flower | 复用 `plant` `flower`（取一朵 + 花梗），另加一段带两片叶的枝（`sweep` + `wing` extra） | `tissue` 白 / 绿 | | R3 |
| 07 | `sepals` Sepals / 萼片 | flower | 复用 | `tissue` 绿 | | R3 |
| 08 | `stamens` Stamens / 雄蕊 | flower | 复用（花药 + 花丝） | `tissue` 白 / 蓝紫 | | R3 |
| 09 | `pistil` Pistil / 雌蕊 | flower | 复用（柱头、花柱、子房） | `tissue` 淡绿 | | R3 |
| 10 | `flower-section` Flower cut in half ×20 / 剖开的花 ×20 | flower | 复用（半花），姿态 `flower-open` 复用 | `tissue` | | R3 |
| 11 | `ovules` Ovules ×20 / 胚珠 ×20 | flower | 复用 | `tissue` 乳白 | | R3 |
| 12 | `pollen-grains` Pollen grains, magnified / 花粉粒（放大） | flower | 复用（不写倍数，同 `plant`：来源没有花粉大小） | `tissue` 黄 | | — |
| 13 | `bee` Honeybee ×20 / 蜜蜂 ×20 | flower | 复用 + `bee-visit` 动画复用 | `chitin`、`membrane` | | R4 |

**③ 别的传粉者**（×1；14–17 新建）

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 14 | `sunbird` Sunbird / 太阳鸟 | visitors | 身体 `lathe`、头 `sphere`、**喙 `sweep` 细长下弯**、两翼 `extrude`（收拢）、尾 `wing`、两足 `sweep` 抓在花茎上、眼 `sphere` | `tissue` 橄榄绿 / 黄 tint、`eye` | `sunbird-sip` 动画 | R5 |
| 15 | `red-flower` Red flower spike / 红色穗状花 | visitors | 苞片 `lathe` 锥 + 苞片 `wing` `repeat` 螺旋 + 两三朵管状花 `lathe`、一段花茎 | `tissue` 红 / 橙 tint | | R6 |
| 16 | `nectar-bat` Cave nectar bat / 洞穴花蜜蝠 | visitors | 身体 `lathe`（毛）、头 `sphere` + 长吻 `capsule`、耳 `wing`、两翼 `membrane` `extrude`（膜）+ 指骨 `sweep` ×4 每侧、后足；面部一撮黄点（`sphere` `repeat`，表示花粉，示意） | `tissue` 褐、`membrane` 深褐、`eye` | `bat-flap` 动画 | R7 |
| 17 | `durian-flowers` Durian flowers / 榴莲花 | visitors | 一段枝 `sweep` + 4 朵花：萼杯 `lathe`、5 瓣 `wing`、雄蕊束 `sweep` `repeat`、花柱 `sweep` | `tissue` 乳白 / 淡绿 | | R8 |

**④ 榕果**（×10）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 18 | `fig-cut` Fig, cut open ×10 / 剖开的榕果 ×10 | fig | 半个 `lathe` 果壁 + 里面一层小花（`sweep` 短柄 + `sphere`，`repeat`；F-25 核不到就不画）+ 顶端孔口的小鳞片 | `tissue` 青 / 乳白 / 红褐 | | R9 |
| 19 | `fig-wasp` Fig wasp ×10 / 榕小蜂 ×10 | fig | 极小的蜂：`capsule` 身体 + `membrane` 翅 ×2 + 触角 `sweep`，停在孔口 | `chitin` 黑褐 | `wasp-enter` 动画 | R9 |

**⑤ 生殖细胞**（示意，不按比例）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 20 | `male-cell` Male reproductive cell (diagram) / 雄性生殖细胞（示意） | cells | 小 `sphere`，外面一圈半透明的花粉粒轮廓（`lathe` 带刺，`glass` 淡黄） | `tissue` signal 色 tint | 姿态 `cells-fused`：移入 `female-cell` 中心、缩到 0.6 | — |
| 21 | `female-cell` Female reproductive cell (diagram) / 雌性生殖细胞（示意） | cells | 较大的 `sphere` + 细胞核 `sphere` | `tissue` 暖白 | | — |
| 22 | `sperm` Sperm (diagram) / 精子（示意） | cells | 头 `sphere` `scale` 椭 + 尾 `sweep` 细长 | `tissue` | 姿态 `cells-fused`：头贴进 `egg` 外层 | — |
| 23 | `egg` Egg (diagram) / 卵子（示意） | cells | 大 `sphere` + 外层 `glass` 薄壳 + 核 | `tissue` 暖白 | | — |

**⑥ 果实与种子**（×1）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 24 | `chilli-young` Young chilli fruit / 青辣椒 | fruits | 复用 `fruit-green`（一只） | `tissue` 青 | | R3 |
| 25 | `chilli-cut` Ripe chilli, cut open / 剖开的红辣椒 | fruits | 复用 `fruit-red-section` | `tissue` 红 / 乳黄 | 姿态 `chilli-front` | R3 |
| 26 | `angsana-pod` Angsana pod / 青龙木翅果 | fruits | 复用 `winged-fruit` | `tissue` 淡褐 | 姿态 `angsana-front` | — |
| 27 | `sea-almond` Sea almond fruit / 榄仁树果 | fruits | `lathe` 杏仁形 + `scale` 压扁 + 一条脊（`sweep`），浮在 `sea-water` 上 | `tissue` 黄绿转红 tint | 姿态 `sea-almond-front`；`sea-almond-bob` 动画 | R10 |
| 28 | `sea-almond-cut` Sea almond, cut open / 剖开的榄仁树果 | fruits | 半个果：外层 `lathe`（`wood` 浅色，软木）+ 小空隙（深色 `sphere` `repeat` 嵌在外层）+ 中间一粒种子 | `wood` 浅 tint、`tissue` | 同上 | R10 |
| 29 | `coconut` Coconut, cut open / 剖开的椰子 | fruits | 复用 `coconut` | `tissue`、`wood` | 姿态 `coconut-front` | — |
| 30 | `ripe-figs` Ripe figs / 成熟的榕果 | fruits | 一段小枝 + 三只榕果 `lathe` | `tissue` 红褐 | 姿态 `fig-front` | R9 |
| 31 | `rubber-capsule` Rubber tree fruit / 橡胶树果 | fruits | 三瓣 `lathe`（各 1/3 圆，瓣缝 `sweep`） | `tissue` 黄褐 | 姿态 `capsule-burst`（三瓣绕各自基部外翻 70°、扭 20°）；`rubber-front` | R11 |
| 32 | `rubber-seeds` Rubber seeds / 橡胶树种子 | fruits | 三粒 `sphere` `scale` 椭 + 斑纹（tint 的 extra 小片） | `tissue` 褐斑 | 姿态 `capsule-burst`：三粒沿 `seed-burst` 流的三条路径外抛到 0.25–0.4 U | R11 |
| 33 | `balsam-pod` Garden balsam pod / 凤仙花果荚 | fruits | 复用 `splitting-pod`，姿态 `pod-split` 复用 | `tissue` 褐绿 | `balsam-front` | — |

**⑦ 种子的里面**（×10）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 34 | `bean-whole` Green bean ×10 / 绿豆 ×10 | seed-inside | `lathe` 椭圆豆 + 一道白色种脐（`sweep` 短） | `tissue` 绿 | | R12 |
| 35 | `bean-cut` Green bean, split open ×10 / 剖开的绿豆 ×10 | seed-inside | 复用 `bean-seed`（种皮、两片子叶、胚） | `tissue` | | R12 |
| 36 | `bean-sprout` Sprouting green bean ×10 / 发芽的绿豆 ×10 | seed-inside | 复用 `bean-sprouting` | `tissue` | | R12 |
| 37 | `spore-pinch` A pinch of fern spores ×10 / 一小撮蕨的孢子 ×10 | seed-inside | 载玻片 `box`（`glass`）+ 一小堆褐色细粒（`sphere` `repeat` ×60，极小） | `glass`、`tissue` 褐 | | — |

**⑧ 萌发测试**（×1；38–56 新建，57–59 复用 / 新建）

| # | id 名称 EN / ZH | 组 | primitive | 材质 | 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|
| 38–42 | `cup-a` … `cup-e` Cup A … E / A 杯 … E 杯 | germination | 透明杯 `lathe`（`shell`）+ 棉花（`sweep` 团块，`fabric` 白）；B 的棉花浅一档（干）；C：杯里一柱水（`membrane` 水色 `lathe`）、棉花沉在杯底 | `glass` / `plastic` 透明、`fabric`、`membrane` | | — |
| 43–47 | `seeds-a` … `seeds-e` Seeds in cup A … E / A … E 杯里的种子 | germination | 5 粒绿豆（`sphere` `scale` 椭，`repeat` ×5，不写 extra） | `tissue` 绿 | `visible` ← `grown-<杯>` = 0 | R12 |
| 48–52 | `seedlings-a` … `seedlings-e` Seedlings in cup A … E / A … E 杯里的幼苗 | germination | 复用 `bean-seedling`（×1），`repeat` ×5 | `tissue` 绿 | `visible` ← `grown-<杯>` = 1；`tint` ← `pale-<杯>`（`#e4dba2`，`full: 1`，`max: 0.85`） | R12 |
| 53 | `pick-ring` Looking at / 正在看 | germination | 细 `torus` 环（杯底一圈） | `token:signal` | 姿态 ← `cup`：`pick-a` … `pick-e` | — |
| 54 | `ref-ring` Compared with / 拿来比的 | germination | 细 `torus` 环（虚线感：`repeat` 12 段） | `token:cold` | 姿态 ← `against`：`ref-a` … `ref-e` | — |
| 55 | `day-strip` Day strip / 天数卡 | germination | 13 cm × 2 cm 的卡条 `box` + 13 道刻度（`repeat` 细 `box`，每 1 cm 一道，第 0、5、10 道长，**无数字**） | `enamel` 白 | | — |
| 56 | `day-marker` Today / 今天 | germination | 小三角 `cone`，贴卡条上沿 | `token:signal` | `offset` ← `count-day`（+X，`per: 0.01`，`origin: 0`） | — |
| 57 | `half-flag` Half germinated / 一半发芽 | germination | 小旗：旗杆 `sweep` + 旗面 `wing` | `token:cold` | `offset` ← `half-day`（+X，`per: 0.01`，`origin: 0`） | — |
| 58 | `towel-dish` Seeds on a damp paper towel / 湿纸巾上的种子 | germination | 培养皿 `lathe`（`glass`）+ 纸巾（`wing`，`fabric` 浅灰）+ 10 粒绿豆（`repeat`） | `glass`、`fabric`、`tissue` | | — |
| 59 | `bean-seedling-close` Seedling ×1 / 幼苗 ×1 | germination | 复用 `bean-seedling` 一株（第 06 章末拍"子叶被举出土面"） | `tissue` | | R12 |
| c1 | `table` Specimen table / 标本台 | — | 圆台 `lathe` 半径 1.5 + 台脚 | `wood` 浅 | `clip: false` | |
| c2 | `side-table` Small table / 小台 | — | 圆台 半径 0.35 | `wood` 浅 | `clip: false` | |
| c3 | `sea-water` Sea water / 海水 | — | 一条 `box` 0.5 × 0.02 × 0.12 | `membrane` 水色 | | |
| c4 | `windowsill` Windowsill / 窗台 | — | 台板 + 窗框（`extrude` 带窗洞） | `enamel`、`casing` | | |
| c5 | `cupboard` Cupboard / 柜子 | — | 柜体 `bevelBox` 薄板拼，门打开 100°（示意，字幕说"关着门"） | `wood` | `shell` | |
| c6 | `fridge` Small fridge / 小冰箱 | — | 箱体 `bevelBox` 薄板拼，前面开、一层隔板 | `enamel` 白 | `shell` | |

- **零件数**：59 + 6 context（`states-of-matter` 68 + 4、`materials` 67 + 3 同一量级）。其中 21 件复用 `plant` 几何、38 件新建；最难的是 `sunbird`、`nectar-bat`、`durian-flowers`、`fern-*`。**合并 / 删减顺序**（超预算时）：`spore-pinch` 删（01 第 5 拍只看种子）→ `bean-seedling-close` 删（06 末拍改看 A 杯）→ `chilli-young` 并进 `chilli-cut` 的 extra → `fig-wasp` 并进 `fig-cut`（不单独选中）→ `red-flower` 简化成一朵管状花。
- **绘制预算**（§8.2）：全景 hero 静止 ≤ 80 calls、上限 100；**各章 ≤ 45**；三角形 < 0.35 M（五杯 × 5 株幼苗用低段数）。
- 默认不隐藏零件（第 00 章是完整外观）；"选中的杯 / 选中的果实"由绑定与姿态表示，不是章节 `hide`。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么，≤ 60 字符） | detail 要点（怎样做到 · 来源 · 常见误解） |
|---|---|---|
| `fern-fronds` | No flowers, no seeds: it makes spores. / 不开花、不结种子，它产生孢子。 | F-1、F-3；新加坡常见的附生蕨（"常见、长在树干上"F 步核 NParks 原话再写） |
| `fern-underside` | Brown lines underneath: where spores form. / 叶背的褐色线：产生孢子的地方。 | F-2、F-3（上半部、沿每条叶脉） |
| `sorus-close` | Many tiny spore cases in each line. / 每条线里有许多细小的孢子囊。 | F-2；孢子从孢子囊放到空气里 |
| `moss-capsules` | Each capsule releases spores. / 每个小囊放出孢子。 | F-4（随湿度开合）；苔藓多在潮湿处 |
| `flower` | The part of the plant that makes seeds. / 植物产生种子的部分。 | F-10；放大 20 倍（S1）；M-4 |
| `stamens` | Anthers on thin stalks make pollen. / 细丝顶端的花药产生花粉。 | F-9、F-10 |
| `pistil` | Stigma catches pollen; ovary holds ovules. / 柱头接住花粉，子房里有胚珠。 | F-9；**不写**"雌性生殖细胞在胚珠里"（D3） |
| `ovules` | Each one becomes a seed after fertilisation. / 受精以后，每个胚珠发育成一粒种子。 | F-27；辣椒种子多，因为胚珠多（`plant` 已有的说法） |
| `bee` | Carries pollen on its hairy body. / 毛茸茸的身体带着花粉。 | F-11、F-12；不是植物的一部分 |
| `sunbird` | Thin, down-curved beak reaches nectar. / 细长下弯的喙伸到花蜜。 | F-16、F-17、F-18（名字）；雌鸟；雄鸟喉部深色有光泽（待核 R5） |
| `nectar-bat` | Feeds on nectar and pollen at night. / 夜里吃花蜜和花粉。 | F-19、F-21、F-23；"示意：脸上的黄点是花粉"；保育状态待核 |
| `durian-flowers` | Open at night with a strong smell. / 夜里开花，气味很浓。 | F-20、F-22（马来西亚的研究） |
| `fig-cut` | Its flowers are inside the fig. / 它的花长在榕果里面。 | F-25 待核（核不到改 summary："Only fig wasps can pollinate it. / 只有榕小蜂能给它传粉。"） |
| `fig-wasp` | The only insect that can pollinate a fig. / 唯一能给榕树传粉的昆虫。 | F-24 |
| `male-cell` / `female-cell` | Diagram: these two cells fuse. / 示意图：这两个细胞会融合。 | F-26；不按比例；不画位置（D3） |
| `sperm` / `egg` | Diagram: a sperm fuses with an egg. / 示意图：精子与卵子融合。 | F-29；睾丸产生精子、卵巢产生卵子 |
| `chilli-cut` | Grew from the ovary; seeds from ovules. / 由子房长成；种子由胚珠长成。 | F-27、F-36（鸟） |
| `angsana-pod` | Wind: the wing carries it away. / 风：翅让它被吹走。 | F-32 |
| `sea-almond` / `sea-almond-cut` | Water: corky, air-filled, it floats. / 水：软木般、有空隙，能浮。 | F-34；也被果蝠、猴子吃（细看） |
| `coconut` | Water: husk and hollow keep it afloat. / 水：纤维外皮和空腔让它浮起。 | F-35（待核） |
| `ripe-figs` | Animals: eaten by birds and monkeys. / 动物：鸟和猴子吃。 | F-37 |
| `rubber-capsule` / `rubber-seeds` | Bursts when dry; seeds fly over 20 m. / 干了就爆开，种子飞出 20 米以外。 | F-38 |
| `balsam-pod` | Splits open easily, scattering seeds. / 很容易裂开，撒出种子。 | F-39 |
| `bean-cut` | Coat, two seed leaves, a tiny plant. / 种皮、两片子叶、小小的胚。 | F-7、F-8 |
| `bean-sprout` | Water taken in; coat split; root out. / 吸了水，种皮裂开，长出根。 | F-43、F-48 待核；**不写天数** |
| `cup-a` … `cup-e` | 〔条件一句〕 / 〔条件一句〕 | §2.6 表：A 湿棉花、窗台；B 干棉花；C 泡在煮过放凉的水里；D 柜子里；E 冰箱里 |
| `seedlings-d` | Germinated in the dark; pale. / 在暗处萌发，幼苗淡黄。 | F-44、F-45 |
| `half-flag` | The day half the seeds had germinated. / 一半种子发芽的那一天。 | F-50；一项实验室研究 |

### 3.6 流

颜色语义（每色一义）：`ink-3` = 孢子；`cut` = 花粉（与 `plant` 同）；`neutral` = 风带着走；`cold` = 水带着走；`accent-2` 不用于流；`loop` = 循环。

| id | group | 路径 | speed | count | size × | ends | 说明 |
|---|---|---|---|---|---|---|---|
| `spore-drift` | spore-drift | `sorus-close` 的孢子囊 → 向上飘散（3 条散开的弧，`spread` 宽） | 0.06 | 80 | 0.4 | fade | 01 第 3 拍 |
| `pollen` | pollination | 多路径（`paths`，一次绘制）：`bee`（花药 → 另一朵花的柱头，沿用 `plant` 的弧）、`bird`（红花花口 → 喙 → 示意的下一朵花）、`bat`（榴莲花 → 蝙蝠面部 → 下一朵）、`wasp`（榕果孔口 → 里面） | 0.15 | 各 ≥ 30 | 0.7 | fade | 02、03；每章镜头只框自己那一条 |
| `wind-drift` | seed-travel | 青龙木荚 → 斜向远处（带一点摆动的弧） | 0.25 | 40 | 0.5 | fade | 05 第 1 拍；`visible` ← `method` = wind |
| `water-drift` | seed-travel | 榄仁树果 / 椰子 → 沿海水条向外 | 0.08 | 40 | 0.5 | fade | 05 第 2–3 拍；`visible` ← `method` = water |
| `seed-burst` | seed-travel | 多路径：橡胶树果 → 三条外抛的抛物线；凤仙果荚 → 两条短弧 | 0.4 | 各 ≥ 12 | 0.5 | fade | 05 第 5–6 拍；`visible` ← `method` = splitting |
| `cycle` | cycle | 沿台边一圈：花 → 别的传粉者 → 细胞 → 果实 → 种子 → 五杯 → 花（闭合） | 0.05 | 160 | 0.35 | open（闭合路径） | 00 第 1 拍、07 末拍 |

合计 6 条 = 运转时 +6 次绘制。动物传播没有流（姿态把果实推到前面 + 字幕）。

### 3.7 动画与姿态

**动画**（全部 `whenRun: true`）：

| id | target | kind | 参数 | 用在 |
|---|---|---|---|---|
| `bee-visit` | bee | sequence（复用 `plant`，换算尺度） | 6 s 一循环 | 02 |
| `sunbird-sip` | sunbird | sequence（loop） | 头与喙绕颈部 pivot 下探 12° → 停 1.5 s → 回，4 s 一循环 | 03 |
| `bat-flap` | nectar-bat | oscillate + pivot（两翼绕肩） | ±25°，2 hz（**可读的示意速度**，真实更快，细看写明） | 03 |
| `wasp-enter` | fig-wasp | sequence（loop） | 沿孔口方向移入 0.01 U → 停 → 回，5 s | 03 |
| `sea-almond-bob` | sea-almond | oscillate | y ±0.004 U，0.4 hz | 05 |

**姿态**（`poses`，≤ 32；共 25 个）：

| 名 | 零件 | 变换 | 用在 |
|---|---|---|---|
| `flower-open` | flower-section | 复用（两半张开） | 02 第 2 拍 |
| `cells-fused` | male-cell、sperm | `male-cell` 移入 `female-cell` 中心、缩到 0.6；`sperm` 头贴进 `egg` 外层、尾留在外 | 04 第 2、5、6 拍 |
| `capsule-burst` | rubber-capsule、rubber-seeds | 三瓣外翻扭转；三粒种子外抛 | `fruit` = rubber（绑定） |
| `pod-split` | balsam-pod | 复用 | `fruit` = balsam（绑定） |
| `<果>-front` ×7 | 各果实零件 | 被选的果实向台前移 0.12 U、抬高 0.03 U | 绑定 ← `fruit` |
| `pick-a` … `pick-e` | pick-ring | 环移到所选杯底 | 绑定 ← `cup` |
| `ref-a` … `ref-e` | ref-ring | 环移到拿来比的杯底 | 绑定 ← `against` |

### 3.8 HUD 数据

- **标题**：EN "Flowers and Seeds" / ZH "花与种子"；副标题 EN "How plants make new plants: spores and seeds, pollination, fertilisation, seed dispersal and germination" / ZH "植物怎样繁殖：孢子与种子，传粉、受精、种子传播与萌发"；`shortTitle` EN "Flowers & seeds" / ZH "花与种子"；`moe`：`["MOE 2023 Science P5 Cycles in Plants and Animals (Reproduction): spores and seeds; pollination, fertilisation, seed dispersal, germination; fertilisation in humans"]`；`tags: [singapore, psle, p5, plants, space]`；`illustration: flower-and-seed`；`subject: biology`；`sensitivity: open`。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Flower / 花 | `CHILLI ×20 · 5 PETALS · 5 STAMENS · 1 PISTIL` / `辣椒 ×20 · 5 瓣 · 5 雄蕊 · 1 雌蕊` | design |
| Pollinators / 传粉者 | `BEE · SUNBIRD · CAVE NECTAR BAT · FIG WASP` / `蜜蜂 · 太阳鸟 · 洞穴花蜜蝠 · 榕小蜂` | typical |
| Seed test / 种子测试 | `5 CUPS × 5 GREEN BEANS · CHECKED ON DAY 7` / `5 杯 × 5 粒绿豆 · 第 7 天看` | design |
| Germination needs / 萌发需要 | `WATER · AIR · WARMTH` / `水 · 空气 · 适宜的温度` | typical |

- **telemetry**（≤ 6；`scope: "observe"` 的行只在本章卡片观察它时有数，否则 `—`）：

| key EN / ZH | follow | unit | decimals | scope |
|---|---|---|---|---|
| Seed test day / 五杯第几天 | `day-now` | d | 0 | observe（只在第 07 章有数；T3 的 `observe` 加 `day-now`，卡片上多一个小读数） |
| Lab temperature / 实验室温度 | `temp-now` | °C | 0 | observe |
| Half germinated by / 一半发芽 | `half-day` | d | 1 | observe |

  块尾 `SIM <本章观察的状态> · <本章改变量的值>`（如 `SIM GERMINATED · CUP D`、`SIM WIND · ANGSANA`、`SIM FEWER THAN HALF · 14 °C`）。
- **镜头预设**（≤ 6，不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `spores-view` | SPORES | 小台：巢蕨 3/4 俯，翻起的叶背与特写同框（00、01） |
| 2 | `flower-view` | FLOWER | 花与剖开的花、蜜蜂，正前略俯（02、04 第 3 拍） |
| 3 | `visitors-view` | VISITORS | 太阳鸟与红花、蝙蝠与榴莲花同框，侧前（03） |
| 4 | `fruits-view` | FRUITS | 果实工位俯 45°，海水条在后（05） |
| 5 | `seed-view` | SEED | 种子的里面三件与天数卡（06） |
| 6 | `cups-view` | CUPS | 窗台、柜、冰箱与五杯同框，正前（07） |

  hero 用 `views.assembled.camera`：圆台 3/4 俯视、看得见整圈循环与台外的巢蕨；`views.cover` = hero 略拉近。生殖细胞、榕果用拍内镜头。
- `views.section.plane: "xz"`（PLATE 立面画俯视：整圈工位一目了然，同 B1 的"环"）。不设剖切面（柜、冰箱、杯是 `shell`）。
- **模式组合**：X-RAY（柜、冰箱、杯透明，看里面的种子）；EXPLODED（花的部分按 `plant` 的方向拆开，其余 `explode.dist` 0）；hide + EXPLODED 照常；REFERENCE 冻结 sim。

---

## 4. 引擎

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 孢子 | 叶背的孢子囊群、孢子飘散 | 零件 + 流（已有） |
| 传粉 | 蜜蜂、太阳鸟、蝙蝠、榕小蜂与花粉流 | 零件 + 多路径流 + 动画（已有） |
| 受精 | 两对示意细胞融合 | 姿态（已有） |
| 种子传播 | 选一个果实：它被推到前面，翅果随风、榄仁树果漂、橡胶树果爆开 | **E-S1 `dispersal`** → `pose`、流 `visible`（已有） |
| 萌发要什么 | 五杯：第 7 天哪几杯有幼苗、什么颜色；两个环标出在比的两杯 | **E-S1 `cups`** → `visible`、`tint`、`pose`（已有） |
| 温度与快慢（数据） | 天数卡上的"今天"标记与"一半发芽"小旗；表 + 折线图 | **E-S1 `timing`** → `offset`（已有）+ `record.chart`（已有） |

### 4.2 模型 `seeds`（E-S1；`lib/sim/seeds.ts`，纯函数，有单测）

全部同步、确定、< 0.05 ms；只在控件值变化时算。三个子模型各自可选（同 `force`、`matter`、`materials`）：数据里没写的不提供它的量。

```jsonc
"sim": {
  "kind": "seeds",
  "controls": [
    { "id": "fruit", "kind": "choice", "default": "angsana", "label": { "en": "Fruit", "zh": "果实" },
      "options": [ "angsana", "sea-almond", "coconut", "chilli", "fig", "rubber", "balsam" ] },          // 每项 { id, label }
    { "id": "temp", "kind": "step", "values": [14, 17, 20], "default": 20, "unit": "°C", "label": { "en": "Temperature (lab study)", "zh": "温度（实验室研究）" } },
    { "id": "count-day", "kind": "step", "values": [0,1,2,3,4,5,6,7,8,9,10,11,12], "default": 0, "unit": "d", "label": { "en": "Day", "zh": "第几天" } },
    { "id": "cup", "kind": "choice", "default": "a", "label": { "en": "Cup to look at", "zh": "看哪一杯" }, "options": [ "a", "b", "c", "d", "e" ] },
    { "id": "against", "kind": "choice", "default": "a", "label": { "en": "Compared with", "zh": "和哪一杯比" }, "options": [ "a", "b", "c", "d", "e" ] },
    { "id": "day", "kind": "step", "values": [0, 7], "default": 0, "unit": "d", "label": { "en": "Day", "zh": "第几天" } }
  ],
  "outputs": [
    { "id": "method",  "kind": "state", "from": "dispersal:method",  "states": { "wind": {…}, "water": {…}, "animals": {…}, "splitting": {…} } },
    { "id": "feature", "kind": "state", "from": "dispersal:feature", "states": { "wing": {…}, "floats": {…}, "eaten": {…}, "bursts": {…} } },
    { "id": "half-day", "from": "timing:median", "unit": "d", "decimals": 1 },
    { "id": "half",     "kind": "state", "from": "timing:half", "states": { "fewer": {…}, "half-or-more": {…} } },
    { "id": "temp-now", "from": "control:temp", "unit": "°C", "decimals": 0 },
    { "id": "cup-result",     "kind": "state", "from": "cups:result",     "states": { "waiting": {…}, "germinated": {…}, "not-germinated": {…} } },
    { "id": "against-result", "kind": "state", "from": "cups:against-result", "states": { 同上 } },
    { "id": "changed",        "kind": "state", "from": "cups:changed",    "states": { "same-cup": {…}, "water": {…}, "air": {…}, "warmth": {…}, "light": {…}, "more-than-one": {…} } },
    { "id": "seedlings",      "kind": "state", "from": "cups:seedlings",  "states": { "none": {…}, "green": {…}, "pale": {…} } },
    { "id": "day-now",        "from": "control:day", "unit": "d", "decimals": 0 },
    { "id": "grown-a", "from": "cup:a:grown" }, …（a–e 五个，1 / 0）,
    { "id": "pale-a",  "from": "cup:a:pale"  }, …（a–e 五个，1 / 0）
  ],
  "bind": [
    { "control": "fruit", "part": "angsana-pod", "pose": { "angsana": "angsana-front" } }, …（七个果实各一条，只映射自己的选项）,
    { "control": "fruit", "part": ["rubber-capsule", "rubber-seeds"], "pose": { "rubber": "capsule-burst" } },
    { "control": "fruit", "part": "balsam-pod", "pose": { "balsam": "pod-split" } },
    { "output": "method", "flow": "wind-drift",  "visible": { "eq": "wind" } },
    { "output": "method", "flow": "water-drift", "visible": { "eq": "water" } },
    { "output": "method", "flow": "seed-burst",  "visible": { "eq": "splitting" } },
    { "control": "count-day", "part": "day-marker", "offset": { "axis": [1, 0, 0], "per": 0.01, "origin": 0 } },
    { "output": "half-day",   "part": "half-flag",  "offset": { "axis": [1, 0, 0], "per": 0.01, "origin": 0 } },
    { "output": "grown-a", "part": "seeds-a",     "visible": { "eq": 0 } },
    { "output": "grown-a", "part": "seedlings-a", "visible": true },
    { "output": "pale-a",  "part": "seedlings-a", "tint": { "color": "#e4dba2", "full": 1, "max": 0.85 } }, …（五杯各三条）,
    { "control": "cup",     "part": "pick-ring", "pose": { "a": "pick-a", "b": "pick-b", "c": "pick-c", "d": "pick-d", "e": "pick-e" } },
    { "control": "against", "part": "ref-ring",  "pose": { "a": "ref-a", …, "e": "ref-e" } }
  ],
  "seeds": {
    "dispersal": { "fruit": "fruit",
      "fruits": { "angsana": { "method": "wind", "feature": "wing" }, "sea-almond": { "method": "water", "feature": "floats" },
                  "coconut": { "method": "water", "feature": "floats" }, "chilli": { "method": "animals", "feature": "eaten" },
                  "fig": { "method": "animals", "feature": "eaten" }, "rubber": { "method": "splitting", "feature": "bursts" },
                  "balsam": { "method": "splitting", "feature": "bursts" } } },
    "timing": { "temp": "temp", "day": "count-day", "medians": { "14": 9.4, "17": 6.5, "20": 4.3 } },
    "cups": { "cup": "cup", "against": "against", "day": "day", "after": 7,
      "places": { "windowsill": { "warm": true, "light": true }, "cupboard": { "warm": true, "light": false }, "fridge": { "warm": false, "light": false } },
      "set": { "a": { "water": true,  "air": true,  "place": "windowsill" },
               "b": { "water": false, "air": true,  "place": "windowsill" },
               "c": { "water": true,  "air": false, "place": "windowsill" },
               "d": { "water": true,  "air": true,  "place": "cupboard" },
               "e": { "water": true,  "air": true,  "place": "fridge" } } }
  }
}
```

绑定共约 36 条（≤ 64）：果实 9、流 3、天数卡 2、五杯 15、环 2（另 5 条余量）。

**规则**：

1. **传播**（`dispersal`）：`method` / `feature` = 所选果实那一行。量：`dispersal:method`、`dispersal:feature`。
2. **温度与天数**（`timing`）：m = `medians[temp]`；`timing:median` = m；`timing:half` = `day` ≥ m ? `half-or-more` : `fewer`。
3. **五杯**（`cups`）：对每杯 k：germinates(k) = water ∧ air ∧ places[place].warm；result(k) = `day` < `after` ? `waiting` : (germinates ? `germinated` : `not-germinated`)；seedlings(k) = result = germinated ? (places[place].light ? `green` : `pale`) : `none`；`cup:<k>:grown` = result = germinated ? 1 : 0；`cup:<k>:pale` = germinated ∧ ¬light ? 1 : 0。所选杯 c、比的杯 r：`cups:result` = result(c)、`cups:against-result` = result(r)、`cups:seedlings` = seedlings(c)；`cups:changed` = 比较四个因素 {水 = water、空气 = air、温度 = warm、光 = light}：都相同 → `same-cup`（c = r 时也是），恰一个不同 → 那个因素（`water` / `air` / `warmth` / `light`），≥ 2 个 → `more-than-one`。
4. **量**（输出的 `from`）：`dispersal:{method,feature}`、`timing:{median,half}`、`cups:{result,against-result,changed,seedlings}`、`cup:<id>:{grown,pale}`、`control:<控件>`（步进的值）。
5. `SEPARATE_EXPERIMENTS.seeds = true`（三套互不相干：PLATE 块尾只写本章卡片观察的状态）。不提供时间线。

### 4.3 validate（`seeds-schema.ts` 的 `seedsSchema` 与 `seedsIssues`；照 `matter-schema.ts` 的拆法）

- 引用的控件存在且种类对：`fruit`、`cup`、`against` 是选择；`temp`、`count-day`、`day` 是步进；`after` 是 `day` 的一个值。
- `fruit` 的选项 = `fruits` 的键（多、少都报）；`method` ∈ {wind, water, animals, splitting}、`feature` ∈ {wing, floats, eaten, bursts}。
- `medians` 的键 = `temp` 的每个值（规范的数，`14` 不是 `14.0`），值 > 0、有限；`count-day` 的值 ≥ 0。
- `cup`、`against` 的选项 = `set` 的键；每杯的 `place` 在 `places` 里；`places` 每项有 `warm`、`light` 两个布尔。
- 输出的 `from` 是本模型的量、种类对；状态输出给每个**可能出现**的状态写标签，**不写永远不会出现的状态**（例：没有哪两杯恰好只差"空气"时，`changed` 写了 `air` 要报——由 `set` 两两比较算出可能的集合）。

### 4.4 其余全部复用（已查 docs/06，未改代码）

试一试卡片（改变 / 不变 / 观察、`[ ]`、`T`、记一行、`record.chart` 折线图、先猜后看、URL `sim=`）；`visible`（数与状态的 `eq`）、`tint`（`max`）、`offset`（`origin`）、`pose`（只映射自己的选项，未映射的值不压回静止——docs/36 §9.3 已修）绑定；流的 `visible` 绑定；多路径流；`sequence` / `oscillate` 动画；背景章与 `note`；组级比例尺（`groups[].scale`）；`<TopicLink>`；`clip: false`；`membrane`、`glass`、`fabric`、`tissue`、`chitin`、`eye` 材质族与 `tint`；零件链路卡。**不需要**：新 token、时间线、新右上卡、新绑定、姿态序列（B2）。

### 4.5 引擎件清单与文件归属（一个 Opus 引擎代理，约 1 天；不改 `package.json`、不加依赖；在工作分支，不提交，主会话验收后提交，push 等 Gavin）

| 件 | 优先级 | 文件 | 要点 |
|---|---|---|---|
| E-S1 模型 | 必须 | `src/engines/space-scene/lib/sim/seeds.ts`（新）、`src/engines/space-scene/seeds-schema.ts`（新：`seedsSchema`、`seedsIssues`）；**注册只改三处、各一两行**：`sim-schema.ts`（`SIM_KINDS` 加 `'seeds'`、`seeds: seedsSchema.optional()`、`quantityKind` 一支、状态列表一支、`seedsIssues` 调用一行）、`lib/sim/index.ts`（`simQuantities` 一支、`SEPARATE_EXPERIMENTS.seeds = true`） | §4.2–§4.3；约 0.5 天 |
| 夹具主题 | 必须 | `src/content/topics/sample-seeds/`（新，`status: draft`，占位文字，只用程序化积木：五只杯 + 种子 / 幼苗 + 两个环；一条天数卡 + 标记 + 旗；三个占位果实（翅片、浮块、三瓣球）；四章：背景章 + 三个子模型各一张卡） | 不碰 `flower-and-seed/` 目录 |
| 测试 | 必须 | `tests/space-scene/seeds.test.ts`、样板 `tests/space-scene/fixtures/seeds-bench.ts`（§4.2 的完整 `seeds` 数据 = 本主题的作者模板）、`tests-e2e/sample-seeds.spec.ts` | §4.6 |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 种子（seeds）」，改「试一试（sim）」的模型种类一行 | |

**与 `materials` 引擎代理的协调**：另一个 Opus 代理正在别的工作树里做 `kind: 'materials'`（docs/37 E-MT1 / E-MT2），它也改 `SIM_KINDS`、`SEPARATE_EXPERIMENTS`（`Record<SimKind, boolean>`，少一个 kind 就编译不过）、`quantityKind`。规则：①**E-S1 在 `materials` 合并进 main 之后再开工**（从新的 main 开工作树）；②若要并行，E-S1 只在这几处列表的**末尾各加一行**、把全部逻辑放在两个新文件里，合并冲突由主会话按"两行都留"解决；③两个代理都不改对方的新文件、不改对方的夹具主题与 docs/06 小节。**内容代理与 E-S1 并行**：`parts.json` 先不写 `sim` 段（五杯全显示种子、果实不带姿态绑定），E-S1 合并后再加 `sim` 与绑定。

### 4.6 引擎验收

- [ ] 单测 `seeds.test.ts`：§2.6 五杯表全部格子（5 杯 × 第 0 / 7 天的 result、seedlings、grown、pale；`changed` 的 5 × 5 全表，含 E 对 A = `more-than-one`、E 对 D = `warmth`、B 对 D = `more-than-one`）；`timing` 3 温度 × 13 天的 `half`（含边界：20 °C 第 4 天 `fewer`、第 5 天 `half-or-more`）；`dispersal` 七行；确定性；URL `sim=cup.e~against.d~day.7` 往返。
- [ ] validate 报错用例：控件不存在 / 种类不对；`fruit` 选项与 `fruits` 不符；`method` / `feature` 取值不对；`medians` 缺温度 / 多温度 / 非正数；`after` 不是 `day` 的值；`place` 不在 `places`；写了不可能出现的 `changed` 状态；输出 `from` 不是本模型的量。
- [ ] e2e（`sample-seeds`）：深链接 `?ch=…&sim=cup.d~day.7`：D 杯的幼苗可见、种子不可见、幼苗被 `tint` 混成淡黄（截图像素或 `__atlas.engine` 读材质色）；`]` 把 `day` 从 0 走到 7 时 A、D 杯换成幼苗；`against` 换成 d 时 `ref-ring` 移到 D 杯；`timing` 卡记三行后折线图出现、读屏文字含"一直下降"；`fruit` = rubber 时橡胶树果三瓣打开、`seed-burst` 流可见；中文页；手机 390 × 844 卡片可用、按钮 ≥ 44 px。
- [ ] 已发布的 SpaceScene 主题（`forces`、`states-of-matter`、`light-and-shadows`、`energy-conversion`、`mosquito`、`magnets`、`circuits`；若已合并则含 `materials`）与夹具 `sample-forces`、`sample-matter`、`sample-light`、`sample-life-cycle` 的 `pnpm shoot <slug> --beats --keys` 不回归。
- [ ] 性能：模型一次求值 < 0.05 ms；夹具全景 ≤ 30 calls。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.7 不做（v2）

按天数逐日长大的萌发（要有分天数的来源，R: F20）；"发芽粒数"的分布（只有中位数）；读者自己配杯子的条件（现在是五只固定的杯，读者选看哪两杯）；更多温度（实验室研究只有三个）；拖动果实进风 / 水里；传粉者的选择卡。

---

## 5. 章节

### 5.0 总表

`run` 写"拍"= 只在写明的拍开；镜头写预设名或"拍内"。每章只开自己工位的组 + 需要的流组（不同倍数不同框，D14）。

| # | id | 标题 EN / ZH | layers | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | 全部 | 默认 | — | hero |
| 01 | `spores-and-seeds` | Spores and seeds / 孢子与种子 | fern, spore-close, spore-drift, seed-inside | — | fern-fronds, fern-underside | spores-view |
| 02 | `flowers-and-pollination` | Flowers and pollination / 花与传粉 | flower, pollination | — | flower, stamens, pistil | flower-view |
| 03 | `who-carries-pollen` | Who carries pollen / 谁在搬花粉 | visitors, fig, pollination | — | sunbird, nectar-bat | visitors-view |
| 04 | `fertilisation` | Fertilisation / 受精 | cells, flower, fruits | — | male-cell, female-cell | 拍内 |
| 05 | `seed-dispersal` | Seed dispersal / 种子传播 | fruits, seed-travel | fruit angsana | angsana-pod | fruits-view |
| 06 | `inside-a-seed` | Inside a seed / 种子的里面 | seed-inside, germination | temp 20, count-day 0 | bean-whole, bean-cut | seed-view |
| 07 | `a-fair-test-with-seeds` | A fair test with seeds / 种子的公平测试 | germination, cycle | cup a, against a, day 0 | cup-a … cup-e | cups-view |

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "This is a model study laid out on one round table, in the order of a flowering plant's life: flower, pollination, fertilisation, fruits and seed dispersal, germination, and back to the flower. A bird's nest fern and a moss sit on a small table to one side, because they reproduce by spores instead. Each station has its own scale bar; the reproductive cells are diagrams, not to scale. The seed-test results come from published classroom and laboratory studies; the model shows what they found and does not invent day counts." / ZH "这是一张按开花植物一生的顺序排成一圈的标本台：花、传粉、受精、果实与种子传播、萌发，再回到花。巢蕨和苔藓放在旁边的小台上，因为它们靠孢子繁殖。每个工位各有比例尺；生殖细胞是示意图，不按比例。种子测试的结果取自公开的课堂与实验室研究，模型只照着画出来，不编天数。"
- **summary**：Plants make new plants in two ways: ferns and mosses release spores, and flowering plants make seeds. A flowering plant's seeds come from four steps: pollination, fertilisation, seed dispersal and germination. / 植物有两种繁殖方式：蕨和苔藓放出孢子，开花植物产生种子。开花植物的种子要经过四步：传粉、受精、种子传播、萌发。
- **正文提纲**：① 课纲的两句：植物怎样繁殖（孢子、种子）；生物繁殖让同类延续下去、许多特征从亲代传给后代（S2 第 43 页）。② 四个过程各一句（02–07 的预告）。③ 这张台怎么读：一圈 = 一个循环；每个工位的比例尺；示意的细胞；种子测试的数据从哪里来（D9）。④ `plant` 主题讲一整株辣椒，本主题从它的花讲下去（链 `<TopicLink slug="plant">`）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero）；run；layers 全部 + cycle；labels flower, sunbird, angsana-pod, cup-a | Around this table, a flowering plant's life goes in a circle: flower, pollination, fertilisation, fruits and seeds, germination, and back to a flower. / 沿着这张圆台，开花植物的一生绕成一圈：花、传粉、受精、果实与种子、萌发，再回到花。 |
| 2 | camera spores-view；labels fern-fronds, moss-capsules | Ferns and mosses do not flower. They reproduce by spores instead of seeds. / 蕨和苔藓不开花。它们不靠种子，而是靠孢子繁殖。 |
| 3 | camera flower-view；labels stamens, pistil, bee | In a flowering plant, pollen has to reach the stigma first. This is pollination. / 开花植物要先让花粉落到柱头上，这叫传粉。 |
| 4 | camera cups-view；sim day 7；labels seedlings-a | After fertilisation, the flower makes seeds. A seed carried to a suitable place germinates and grows into a new plant. / 受精以后，花产生种子。种子被带到合适的地方，就会萌发，长成新的植株。 |

- **试一试**：无。
- **细看**：`How this model works`（S1：比例尺；示意细胞；五杯与天数卡的数据来源；为什么只有第 0、7 天）；`Why living things reproduce`（课纲：同类延续、特征传给后代；"细胞是生命的基本单位"一句，R: F-31）；`The plant topic`（`<TopicLink slug="plant">`：根、茎、叶与整株的生命周期）；`Animals have life cycles too`（一句，链 `<TopicLink slug="mosquito">`）。
- **本章索引**：fern-fronds, moss-capsules, flower, bee, sunbird, nectar-bat, angsana-pod, cup-a
- **名词首现**：spore、seed。

### 5.2 第 01 章 `spores-and-seeds`

- **summary**：Not every plant grows from a seed. Ferns and mosses have no flowers; they release tiny spores into the air. A seed is different: it holds a tiny plant and a store of food inside a protective coat. / 不是每种植物都从种子长出来。蕨和苔藓不开花，它们把细小的孢子放到空气里。种子不一样：种皮里面包着一个小小的胚和储存的养分。
- **正文提纲**：① 课纲 Practices：植物怎样繁殖——孢子、种子。② 巢蕨：新加坡常见的蕨（F 步核"常见、长在树上"的原话）；不开花，靠叶背的孢子繁殖（F-1、F-3）。③ 叶背的孢子囊群 → 孢子囊 → 孢子放到空气里（F-2）。④ 苔藓：小囊随湿度开合放出孢子；喜欢潮湿（F-4）。⑤ 种子：胚、养分、种皮（F-6）；孢子是一个细胞（F-6 待核），没有这些。⑥ 真菌也有孢子，但真菌不是植物（细看）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（spores-view）；labels fern-fronds | This bird's nest fern, drawn at a quarter of its real size, has no flowers and makes no seeds. Ferns reproduce by spores. / 这株巢蕨缩小到真实大小的四分之一。它不开花，也不结种子。蕨类植物靠孢子繁殖。 |
| 2 | labels fern-underside | Turn a frond over: the brown lines along its veins are where the spores are made. / 把叶片翻过来：沿着叶脉的一条条褐色线，就是产生孢子的地方。 |
| 3 | camera 拍内（孢子特写）；run；labels sorus-close | Ten times life size, each line is a row of tiny spore cases. The spores are released from them into the air. / 放大十倍看，每条线是一排细小的孢子囊。孢子从里面放出来，散到空气中。 |
| 4 | camera 拍内（苔藓）；labels moss-cushion, moss-capsules | Mosses reproduce by spores too. Each small capsule on a thin stalk releases spores. / 苔藓也靠孢子繁殖。细柄顶端的每个小囊会放出孢子。 |
| 5 | camera seed-view；layers seed-inside；labels bean-cut, spore-pinch | A seed is different. Inside its coat are a tiny plant and a store of food. A spore is a single cell, with no store of food. / 种子不一样。种皮里面有一个小小的胚和储存的养分。孢子只是一个细胞，没有储存的养分。 |

  第 4 拍不写"干的时候放得多"之类的方向（OpenStax 25.3 只说"随湿度开合"，F-4）；细看可以引原话。第 5 拍后半句依赖 F-6，退路见 F-6。
- **试一试**（文字）：和大人一起在公园或学校园圃找一株巢蕨，看叶背有没有褐色的线；只看不摘（课纲 VEA：爱护植物）。
- **细看**：`Spore cases`（F-2：孢子囊群、孢子囊）；`Mosses like damp places`（F-4）；`Fungi make spores too`（F-5：真菌的孢子比种子小而轻，随风或附在动物身上；真菌和植物是两类，P3 学过）；`Not every plant has flowers`（M-6）；若 `living-things` 已发布，链它讲开花 / 不开花植物的那一章。
- **本章索引**：fern-fronds, fern-underside, sorus-close, moss-cushion, moss-capsules, bean-cut, spore-pinch
- **名词首现**：spore、fern、moss、seed。

### 5.3 第 02 章 `flowers-and-pollination`

- **summary**：A flower is the part of a flowering plant that makes seeds. Its stamens make pollen, and its pistil has a stigma that receives pollen. Pollination is the moving of pollen from an anther to a stigma; in chilli flowers, bees often carry it. / 花是开花植物产生种子的部分。雄蕊产生花粉，雌蕊顶端的柱头接住花粉。传粉就是花粉从花药落到柱头上；辣椒花常靠蜜蜂传粉。
- **正文提纲**：① 花不是装饰（M-4）。② 花的部分与作用（F-9、F-10）：花瓣、萼片；雄蕊 = 花药 + 花丝；雌蕊 = 柱头、花柱、子房（里面有胚珠）。③ 传粉的定义（F-13）；花粉可来自同一朵或另一朵花，都叫传粉（F-11；**不用**两个专门的词）。④ 蜜蜂：毛茸茸的身体沾上花粉，带到下一朵花（F-11、F-12）；配图 `flower-and-seed-bee-pollination`（④ 段后）。⑤ 预告：搬花粉的不只蜜蜂（03）。⑥ 链 `<TopicLink slug="plant" ch="flowers-and-pollination">`。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（flower-view）；labels flower, sepals | A chilli flower, drawn 20 times life size. A flower is not just for show: it is the part of the plant that makes seeds. / 一朵辣椒花，放大 20 倍。花不只是好看，它是植物产生种子的部分。 |
| 2 | pose flower-open；labels stamens, pistil, flower-section | Cut in half, it shows a ring of stamens around one pistil in the middle. / 剖开来看：一圈雄蕊围着中间的一个雌蕊。 |
| 3 | labels stamens, pollen-grains, ovules | The anthers at the tips of the stamens make pollen. The pistil has a sticky stigma on top and an ovary at the bottom, which holds the ovules. / 雄蕊顶端的花药产生花粉。雌蕊顶端是黏黏的柱头，底部是子房，子房里有胚珠。 |
| 4 | run；labels bee, pistil | Pollination is the moving of pollen from an anther to a stigma. A bee's hairy body picks up pollen and carries it to the next flower. / 花粉从花药落到柱头上，就是传粉。蜜蜂毛茸茸的身体沾上花粉，带到下一朵花。 |
| 5 | labels flower, bee | The pollen can come from the same flower or from another flower. Both are pollination. / 落到柱头上的花粉，可以来自同一朵花，也可以来自另一朵花，都叫传粉。 |

- **试一试**（文字）：早上找一株开花的植物，静静看五分钟，数一数有几只动物来访、各停在花的哪里；不碰花和动物（课纲 VEA：好奇地观察）。
- **细看**：`Parts of a flower`（小表：部分 → 作用）；`Pistil or carpel`（一些书写 carpel；本站写 pistil / 雌蕊，F-9）；`Bees and food crops`（F-12）；`More on this flower`（`<TopicLink slug="plant" ch="flowers-and-pollination">`）。
- **本章索引**：flower, sepals, stamens, pistil, flower-section, ovules, pollen-grains, bee
- **名词首现**：stamen、anther、pistil、stigma、ovary、ovule、pollen、pollination。

### 5.4 第 03 章 `who-carries-pollen`

- **summary**：Bees are not the only animals that carry pollen. In Singapore, sunbirds visit flowers by day, cave nectar bats visit durian flowers at night, and fig trees can be pollinated only by tiny fig wasps. Some plants, such as grasses, are pollinated by the wind. / 搬花粉的不只蜜蜂。在新加坡，太阳鸟白天访花，洞穴花蜜蝠夜里访榴莲花，榕树只能靠细小的榕小蜂传粉。草这类植物靠风传粉。
- **正文提纲**：① 动物为什么来：吃花蜜、花粉（F-19 蝙蝠吃花蜜和花粉；太阳鸟以花为食 F-16）——写成"来吃花蜜，身上就沾了花粉"，不写"花为了……"。② 太阳鸟（F-16、F-17、F-18）。③ 洞穴花蜜蝠与榴莲（F-19、F-20、F-21）；野外研究在马来西亚（F-22）；新加坡的观察（F-23）。④ 榕小蜂（F-24、F-25 待核）。⑤ 风（F-14，一句）。⑥ 爱护：蝙蝠在新加坡并不多（F-19 状态待核），只远看、不惊扰。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（visitors-view）；run；labels sunbird, red-flower | A sunbird feeds at flowers by day. Its thin, downward-curving beak reaches the nectar. / 太阳鸟白天在花间取食，细长、向下弯的喙能伸到花蜜。 |
| 2 | run；labels sunbird | Feeding from the front of a flower, its beak gets dusted with pollen, and some rubs off on the stigma of the next flower. / 它从花口取食时，喙上沾了花粉，到下一朵花时，一部分就蹭到柱头上。 |
| 3 | camera 拍内（蝙蝠与榴莲花）；labels nectar-bat, durian-flowers | Durian flowers open at night and have a strong smell. Bats, such as the cave nectar bat, are their main pollinators. / 榴莲花在夜里开，气味很浓。蝙蝠是它们主要的传粉者，洞穴花蜜蝠就是其中一种。 |
| 4 | run；labels nectar-bat | As a bat feeds on nectar, its face and head get covered with pollen, which it carries to the next flower. / 蝙蝠吃花蜜时，脸和头上沾满花粉，又带到下一朵花。 |
| 5 | camera 拍内（榕果）；layers fig, pollination；run；labels fig-cut, fig-wasp | A fig's tiny flowers are inside the fig, ten times life size here. Only fig wasps, which crawl in, can pollinate them. / 榕树细小的花长在榕果里面（这里放大十倍）。只有钻得进去的榕小蜂，才能给它们传粉。 |

  第 5 拍依赖 F-25，退路见 F-25。
- **试一试**（文字）：清早在公园、组屋楼下的花圃，远远看太阳鸟怎样取食：从花口还是从花的基部？（细看 `Nectar robbers` 讲两种）。
- **细看**：`Nectar robbers`（F-17：有些太阳鸟从花的基部啄洞，吃到花蜜却不传粉）；`Bird flowers, bat flowers`（F-15：鸟常访颜色鲜艳、没有香味、白天开的花；榴莲花夜里开、气味浓，F-20）；`Bats in Singapore`（F-19 栖息处；F-23 Clementi 那晚的观察；保育状态待核后再写；不惊扰）；`A study in Malaysia`（F-22：刁曼岛的大狐蝠让榴莲结果更多——那是马来西亚、另一种蝙蝠）；`Which sunbird?`（F-18：名字的两种写法；新加坡有七种太阳鸟；模型画的是雌鸟）；`The wind`（F-14：草类等靠风传粉；本主题没有新加坡的例子）；`One tree, two jobs`（M-5：榕小蜂给榕树传粉，鸟、松鼠和猴子吃成熟的榕果、把种子带走——第 05 章讲后一件）。
- **本章索引**：sunbird, red-flower, nectar-bat, durian-flowers, fig-cut, fig-wasp, bee
- **名词首现**：pollinator、nectar。

### 5.5 第 04 章 `fertilisation`

- **summary**：After pollination comes fertilisation: a male reproductive cell from the pollen fuses with a female reproductive cell. Then each ovule develops into a seed and the ovary develops into a fruit. Fertilisation in humans is similar: a sperm fuses with an egg. / 传粉之后是受精：花粉带来的雄性生殖细胞与雌性生殖细胞融合。之后每个胚珠发育成一粒种子，子房发育成果实。人的受精也相似：精子与卵子融合。
- **正文提纲**：① 两种说法都写（F-26）：受精是雄性生殖细胞与雌性生殖细胞融合；受精是让果实和种子形成的过程。② 传粉 ≠ 受精；中文：传粉也叫授粉，受精是另一回事（R: Z03）。③ 胚珠 → 种子、子房 → 果实（F-27）；辣椒就是果实（M-7）。④ 人的受精（F-29），一段，用课纲的话。⑤ 相似处（F-30）：都是一个雄性生殖细胞与一个雌性生殖细胞融合。⑥ 后代像亲代（F-31，一句）。**不写受精发生的位置**（D3）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | camera 拍内（细胞，植物一对）；labels male-cell, female-cell | Pollination only brings pollen to the stigma. Fertilisation is the next step: a male reproductive cell from the pollen fuses with a female reproductive cell. / 传粉只是把花粉送到柱头上。下一步是受精：花粉带来的雄性生殖细胞与雌性生殖细胞融合。 |
| 2 | pose cells-fused；labels female-cell | The two cells fuse into one. This is a diagram, not to scale. / 两个细胞融合成一个。这是示意图，不按比例。 |
| 3 | camera flower-view；pose flower-open；labels ovules, pistil | After fertilisation, each ovule develops into a seed, and the ovary around the ovules develops into the fruit. / 受精以后，每个胚珠发育成一粒种子，包着胚珠的子房发育成果实。 |
| 4 | camera fruits-view（拍内近景）；labels chilli-young, chilli-cut | So a chilli is a fruit: it grew from the ovary of a flower, and its seeds grew from the ovules. / 所以辣椒是果实：它由花的子房长成，里面的种子由胚珠长成。 |
| 5 | camera 拍内（细胞，人的一对）；pose cells-fused；labels sperm, egg | Fertilisation in humans is similar. A sperm, made in the testes, fuses with an egg, made in the ovaries. The fertilised egg develops in the womb. / 人的受精也相似。睾丸产生的精子与卵巢产生的卵子融合，受精卵在子宫里发育。 |
| 6 | camera 拍内（两对同框）；pose cells-fused；labels male-cell, female-cell, sperm, egg | In flowering plants and in humans, fertilisation is the same idea: one male reproductive cell fuses with one female reproductive cell. / 开花植物和人的受精是同一个道理：一个雄性生殖细胞与一个雌性生殖细胞融合。 |

- **试一试**（文字）：和大人一起剖开一只辣椒，数一数里面有几粒种子；每粒种子都是一个胚珠长成的。剖完洗手，不要碰眼睛。
- **细看**：`Pollination is not fertilisation`（ZH 段落写清"传粉 = 授粉 ≠ 受精"；EN 写两个过程的先后）；`What P5 leaves out`（男女生殖细胞怎样相遇、在哪里相遇、胎儿怎样长大，中学再学——不点名花粉管与器官名）；`Fruit or vegetable?`（M-7：植物学里由子房长成的叫果实；辣椒是果实）；`Fruits without seeds`（M-8 / F-28：有些果实不受精也能长成，所以"没有种子"不一定说明没传粉；只说"有些"）；`Like parents, but not the same`（F-31：后代从亲代那里得到许多特征）；`Ovary: one word, two meanings`（英文 ovary 一词两义：花的子房、人的卵巢）。
- **本章索引**：male-cell, female-cell, ovules, pistil, chilli-young, chilli-cut, sperm, egg
- **名词首现**：fertilisation、fruit、sperm、egg、womb（并入 egg 的定义）。

### 5.6 第 05 章 `seed-dispersal`

- **summary**：Seeds are carried away from the parent plant by the wind, by water, by animals, or when the fruit bursts or splits open. The shape of a fruit shows how it travels: a wing for the wind, air spaces for floating, juicy flesh that animals eat, a dry pod that bursts. / 种子靠风、水、动物，或果实爆开、裂开，被带离母株。果实的样子透露它怎样传播：借风的翅、能浮的空隙、动物爱吃的多汁果肉、会爆开的干果荚。
- **正文提纲**：① 传粉搬花粉、种子传播搬种子（M-5）。② 风：青龙木（F-32）；新加坡的 Marsh Pulai、Keruing（细看）。③ 水：榄仁树果（F-34）、椰子（F-35）。④ 动物：辣椒与鸟（F-36）、榕果（F-37）。⑤ 爆开 / 裂开：橡胶树（F-38）、凤仙花（F-39）。⑥ 果实的这些样子在 P6 叫"结构适应"（F-42）。⑦ 种子落在离母株远一些的地方（只写事实，不写"为了"）。⑧ 链 `<TopicLink slug="plant" ch="fruits-and-seeds">`。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（fruits-view）；sim fruit angsana；run；labels angsana-pod | An angsana fruit is a flat pod with a thin wing all round. The wind carries it away from the tree. / 青龙木的果实是扁扁的荚，四周一圈薄翅。风把它带离大树。 |
| 2 | sim fruit sea-almond；run；labels sea-almond, sea-almond-cut | A sea almond fruit has a corky layer full of tiny air spaces, so it floats, and the sea can carry it to a new shore. / 榄仁树的果实外层像软木，布满细小的空隙，所以能浮在水上，被海水带到新的岸边。 |
| 3 | sim fruit coconut；run；labels coconut | A coconut floats too: its thick, fibrous husk and the hollow inside the nut keep it afloat. / 椰子也会漂浮：厚厚的纤维外皮和果核里的空腔让它浮起来。 |
| 4 | sim fruit chilli；labels chilli-cut | Birds eat ripe chillies. The seeds pass through them whole and can still germinate where they land. / 鸟吃成熟的辣椒，种子完好地随粪便排出，落地后还能萌发。 |
| 5 | sim fruit rubber；run；labels rubber-capsule, rubber-seeds | When a rubber tree's fruit dries, it bursts with a loud bang and throws its seeds, sometimes more than 20 metres. / 橡胶树的果实干了以后，会"啪"地一声爆开，把种子弹出去，有时超过 20 米。 |
| 6 | sim fruit balsam；labels balsam-pod | A garden balsam pod splits open easily and scatters its small seeds. / 凤仙花的果荚很容易裂开，把小小的种子撒出去。 |

  第 2 拍"被海水带到新的岸边"等 F-34 的措辞核对；第 3 拍等 F-35（核不到：改成"Its thick, fibrous husk helps it float. / 厚厚的纤维外皮帮助它浮起来。"并删"空腔"）。
- **试一试 T1**：`vary: fruit`，`keep: [{ en: "Ripe fruits of plants that grow in Singapore", zh: "新加坡植物的成熟果实" }]`，`observe: [method, feature]`，`record: true`（表：果实 × 方式 × 结构；不画图）；`predict`：prompt "A rubber tree's fruit has no wing and is not juicy. How do you think its seeds travel?" / "橡胶树的果实没有翅，也不多汁。你猜它的种子怎样传播？"，`start: { fruit: angsana }`，`change: { fruit: rubber }`，`observe: method`，options `wind` "By the wind / 靠风" · `water` "By water / 靠水" · `animals` "By animals / 靠动物" · `splitting` "It bursts or splits open / 爆开或裂开"。
- **细看**：`One fruit, two ways`（F-34：榄仁树果会浮，果蝠和猴子也吃；F-40：相思豆的豆荚扭开裂开，红种子又被鸟吃——有些果实不只一种传播方式，所以不拿它们当"只有一种"的例子）；`Pollination or dispersal?`（M-5：榕小蜂传粉、鸟和猴子吃榕果传播种子；蝙蝠给榴莲传粉，果蝠吃榄仁树果传播种子）；`Shapes that help`（F-42：P6 会把这些样子叫"结构适应"）；`Find them in Singapore`（F-33 的名单）；`A fair test with paper seeds`（文字试一试，F-41：剪两种大小的纸螺旋桨，从同样的高度放下，比较落地的快慢；一次只改一样；真的种子变量太多）；`More examples`（`<TopicLink slug="plant" ch="fruits-and-seeds">`）。
- **本章索引**：angsana-pod, sea-almond, sea-almond-cut, coconut, chilli-cut, ripe-figs, rubber-capsule, rubber-seeds, balsam-pod
- **名词首现**：seed-dispersal。

### 5.7 第 06 章 `inside-a-seed`

- **summary**：Germination is when a seed starts to grow into a young plant. Inside a green bean are a tiny plant and two seed leaves full of stored food. The seed takes in water, swells and splits its coat, and a root grows out. In one laboratory study, mung beans germinated faster when it was warmer. / 萌发是种子开始长成幼苗的过程。绿豆里面有一个小小的胚和两片储满养分的子叶。种子吸水、胀大、撑破种皮，长出根来。一项实验室研究发现，温度高一些，绿豆萌发得快一些。
- **正文提纲**：① 绿豆（新加坡叫 green bean / 绿豆，F-49）。② 种子的部分（F-7）；种子是活的（F-8，M-3）。③ 萌发的第一步是吸水（F-43）；根向下、芽向上；绿豆把子叶举出土面（F-49）；子叶的养分供幼苗，直到叶子能自己造食物（M-9，链 `plant` 的 `leaves-make-food`）。配图 `flower-and-seed-seed-germination`（③ 段后）。④ 温度：一项实验室研究（F-50），讲"中位天数"= 到这一天一半的种子发芽了。⑤ 新加坡室温更暖（F-53）、豆芽 3–4 天（F-51，写清条件）。**不写胚根第几天出来**（F-52）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（seed-view）；labels bean-whole | A green bean, or mung bean, drawn 10 times life size. Its hard coat protects what is inside. / 一粒绿豆，放大 10 倍。硬硬的种皮保护着里面的部分。 |
| 2 | labels bean-cut | Inside are two seed leaves full of stored food and a tiny plant with a root tip and a shoot tip. The seed is alive. / 里面是两片储满养分的子叶，还有一个带着根尖和芽尖的小小的胚。种子是活的。 |
| 3 | labels bean-sprout | Germination starts when the seed takes in water. It swells, its coat splits, and a root grows downwards. / 萌发从吸水开始。种子胀大，种皮裂开，根向下长出来。 |
| 4 | camera 拍内（天数卡）；sim temp 20, count-day 5；labels half-flag, day-marker | In one laboratory study, mung beans on damp paper towels were kept at different temperatures. At 20 °C, half of them had germinated by about day 4.3. / 一项实验室研究把湿纸巾上的绿豆放在不同温度下。20 °C 时，大约到第 4.3 天，一半种子发芽了。 |
| 5 | sim temp 14, count-day 5；labels half-flag | At 14 °C, it took about 9.4 days. When it is cooler, seeds germinate more slowly. / 14 °C 时，要大约 9.4 天。温度低，种子萌发得慢。 |

  第 3 拍"根先出来"的说法依赖 F-48（字幕只说"根向下长出来"，不说"先"）。第 4 拍 `count-day` 取 5（第 4 天还 `fewer`，见 §2.6）。
- **试一试 T2**：`vary: temp`，`also: [count-day]`，`keep: [{ en: "The same kind of seed: mung beans", zh: "同一种种子：绿豆" }, { en: "On damp paper towels", zh: "放在湿纸巾上" }, { en: "Counted every day", zh: "每天数一次" }]`，`observe: [half-day, half]`，`record: { chart: { y: "half-day" } }`（三行记完 = 一条一直下降的折线：温度越高，一半发芽的天数越少）；`predict`：prompt "At 20 °C, half the seeds had germinated by about day 4.3. At 14 °C, will it take fewer days, about the same, or more days?" / "20 °C 时，大约第 4.3 天一半种子发芽。14 °C 时，天数会更少、差不多，还是更多？"，`start: { temp: 20 }`，`change: { temp: 14 }`，`observe: half-day`，options `less` "Fewer days / 更少" · `same` "About the same / 差不多" · `more` "More days / 更多"。
- **细看**：`A seed is alive`（F-8：种子会呼吸；M-3）；`Food for the first days`（子叶的养分；植物长大后靠叶子造食物，不是从土里"吃"，M-9，`<TopicLink slug="plant" ch="leaves-make-food">`）；`What "half" means`（中位天数的意思；这项研究在澳大利亚做、只测了 14、17、20 °C 三个温度，F-50）；`How long in Singapore?`（F-53 新加坡平均约 28 °C；F-51 Gardens by the Bay：泡 12 小时、放进暗柜，豆芽 3–4 天；NC State：3–7 天；没有来源说根在第几天出来，所以这里不说）；`Green bean or mung bean`（F-49 的名字）。
- **本章索引**：bean-whole, bean-cut, bean-sprout, towel-dish, day-strip, day-marker, half-flag
- **名词首现**：germination、seed-leaves。

### 5.8 第 07 章 `a-fair-test-with-seeds`

- **summary**：A seed needs water, air and warmth to germinate. In this test, seeds kept dry, under water or in a fridge do not germinate in a week, but seeds in a dark cupboard do: like most seeds, green beans do not need light to germinate. Their seedlings, though, need light to grow green. / 种子萌发需要水、空气和适宜的温度。在这个测试里，放在干棉花上、泡在水里、放进冰箱的种子，一星期也没发芽；放在黑暗柜子里的却发芽了：绿豆和多数种子一样，萌发不需要光。不过，幼苗要有光才长得绿。
- **正文提纲**：① 萌发受四个因素影响（F-43）。② 五杯的做法（§2.6），A 是拿来比的那一杯。③ B：干的不发芽——第一步是吸水。④ C：泡在煮过放凉的水里，水里空气少，不发芽（F-46 待核）。⑤ D：暗柜里照样发芽（F-44，M-1）；第 7 天淡黄（F-45）：种子要的和幼苗要的不一样（M-2）。⑥ E：冰箱（F-47）；E 对 A 改了两样（冷 + 暗），**E 对 D 才是公平测试**（M-12）。⑦ 公平测试：一次只改一样；P4 认出、P6 自己设计（课纲 Table 1）。⑧ 回到循环：有光的幼苗长成能开花的植株，花又产生种子（链 `<TopicLink slug="plant" ch="seed-to-plant">`）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（cups-view，第 0 天）；labels cup-a, cup-b, cup-c, cup-d, cup-e | Five cups, each with five green beans. Cup A has damp cotton wool and sits on a warm, bright windowsill. The other four cups change the conditions. / 五个杯子，每杯五粒绿豆。A 杯放湿棉花，在温暖明亮的窗台上。其余四杯改变了条件。 |
| 2 | sim day 7, cup b, against a；labels seedlings-a, seeds-b | A week later, the seeds in cup A have germinated. In cup B, on dry cotton wool, they have not: a seed needs water. / 一星期后，A 杯的种子发芽了。B 杯放的是干棉花，种子没有发芽：种子需要水。 |
| 3 | sim day 7, cup c, against a；labels cup-c, seeds-c | In cup C the seeds lie under water that was boiled and cooled, which holds little air. They have not germinated: a seed needs air. / C 杯的种子泡在煮沸后放凉的水里，这样的水里空气很少。它们没有发芽：种子需要空气。 |
| 4 | sim day 7, cup d, against a；labels seedlings-d, seedlings-a | Cup D is kept in a closed, dark cupboard, yet its seeds germinate: green beans, like most seeds, do not need light to germinate. But its seedlings are pale, while those in cup A are green. / D 杯放在关着门的黑暗柜子里，种子照样发芽：绿豆和多数种子一样，萌发不需要光。不过 D 杯的幼苗是淡黄的，A 杯的是绿的。 |
| 5 | sim day 7, cup e, against a；labels cup-e, seeds-e | Cup E is in a fridge, and its seeds have not germinated. But comparing E with A is not a fair test: inside a fridge it is cold and also dark. / E 杯放在冰箱里，种子没有发芽。不过拿 E 和 A 比不是公平测试：冰箱里又冷又暗。 |
| 6 | sim day 7, cup e, against d；run；layers germination, cycle；labels cup-e, cup-d | Compare cup E with cup D instead: both are dark, so only the warmth is different. A seed needs warmth to germinate. / 改拿 E 和 D 比：两杯都在暗处，只有温度不同。种子萌发需要适宜的温度。 |

  第 3 拍依赖 F-46、第 5–6 拍依赖 F-47，退路见 §0.1-6。第 6 拍开 `cycle` 流：循环从五杯回到花，正文末段接上。
- **试一试 T3**：`vary: cup`，`also: [against, day]`，`keep: [{ en: "Five green beans in each cup", zh: "每杯五粒绿豆" }, { en: "The same cups and cotton wool", zh: "同样的杯子和棉花" }, { en: "Checked on the same day", zh: "同一天看结果" }]`，`observe: [cup-result, changed, seedlings, day-now]`，`record: true`（表：杯 × 结果 × 和哪杯比改了什么 × 幼苗；读者记完五行 = §2.6 的表）；`predict`：prompt "Cup D is in a dark cupboard; everything else is the same as cup A. After a week, will its seeds have germinated?" / "D 杯放在黑暗的柜子里，其他都和 A 杯一样。一星期后，它的种子会发芽吗？"，`start: { cup: d, against: a, day: 0 }`，`change: { day: 7 }`，`observe: cup-result`，options `germinated` "Yes, they germinate / 会发芽" · `not-germinated` "No, they need light / 不会，要有光"。
- **细看**：`Seed or seedling?`（M-2 / F-45：种子靠自己的养分萌发；养分用完后，幼苗要光，暗处的幼苗淡黄、细弱——这是豌豆实验里看到的，绿豆也一样会发黄（F 步若找到绿豆的直接说法就替换））；`Why boiled water?`（煮沸会赶走水里的空气，放凉后再用——F-46 核实后再写这一句；核不到就只写"水里空气很少"）；`A fridge is dark too`（M-12：一次只改一样；PSLE 常问"哪两组能比较温度的作用"）；`A light and warmth test`（F-54：BBSRC 的四组豌豆，亮 / 暗 × 凉 / 暖）；`Some seeds do need light`（F-43、F-44：少数种子要光或要暗才萌发，所以只说"多数"）；`Real cups vary`（真的杯子里总有一两粒不发芽或发得慢：数清楚再下结论）；`Try it at home`（和大人一起做五杯，用 `plant` 第 07 章的做法；NParks "Every Child a Seed"：温暖、半荫、湿而不积水，F-55；做完把豆子扔掉）；`From seedling to flower`（`<TopicLink slug="plant" ch="seed-to-plant">`）。
- **本章索引**：cup-a, cup-b, cup-c, cup-d, cup-e, seeds-b, seeds-c, seeds-e, seedlings-a, seedlings-d
- **名词首现**：fair-test。

### 5.9 拍数与配图

- 拍数：00 四、01 五、02 五、03 五、04 六、05 六、06 五、07 六 = **42 拍**。
- 配图位置：首页图 `flower-and-seed`；`flower-and-seed-bee-pollination` 第 02 章 ④ 段后；`flower-and-seed-seed-germination` 第 06 章 ③ 段后。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（20 个候选，目标 16–18 个，正文用不到的删）

中文来源：zh.wikipedia、香港教育局词表（繁体，转简体是编辑上的转换）、NParks 印的中文名（R: Z01–Z09）。**没有找到 MOE 的英汉科学词表**（R: Z01）；"编辑用词"在 `glossary.json` 的 `note` 写明来历。与 `plant` 名词表同 id 的条目用同样的中文。

| id | EN / ZH | 定义要点 | 中文来源（R:） | see |
|---|---|---|---|---|
| `spore` | spore / 孢子 | 蕨、苔藓等放出的繁殖体，一个细胞（F-6 待核），没有胚和储存的养分 | zh.wikipedia 孢子（Z06） | seed |
| `seed` | seed / 种子 | 种皮里包着胚和储存的养分；由胚珠发育而成 | 日常词（与 `plant` 同） | spore, ovule |
| `fern` | fern / 蕨类植物 | 不开花、靠叶背的孢子繁殖的植物，如巢蕨 | zh.wikipedia 孢子（繁体 蕨類植物，Z06） | spore |
| `moss` | moss / 苔藓 | 矮小、喜湿、靠孢子繁殖的植物 | **待核**（研究没查；F 步查 zh.wikipedia 苔藓植物） | spore |
| `pollen` | pollen / 花粉 | 花药产生的细小颗粒，带着雄性生殖细胞 | zh.wikipedia 花（Z02） | pollination |
| `stamen` | stamen / 雄蕊 | 花药 + 花丝，产生花粉 | Z02；与 `plant` 同 | anther |
| `anther` | anther / 花药 | 雄蕊顶端产生花粉的部分 | Z02 | stamen |
| `pistil` | pistil / 雌蕊 | 柱头、花柱、子房；有的书写 carpel（心皮） | Z02；与 `plant` 同 | stigma, ovary |
| `stigma` | stigma / 柱头 | 雌蕊顶端接住花粉的部分 | Z02 | pistil |
| `ovary` | ovary (of a flower) / 子房 | 雌蕊底部，里面有胚珠；受精后发育成果实。注：人的 ovary 中文叫卵巢 | Z02 | ovule, ovaries |
| `ovule` | ovule / 胚珠 | 子房里的小粒，受精后发育成种子 | Z02；与 `plant` 同 | seed |
| `pollination` | pollination / 传粉 | 花粉从花药到柱头；也叫"授粉"（≠ 受精） | zh.wikipedia 传粉"傳粉又稱授粉"（Z03）；与 `plant` 同 | fertilisation |
| `pollinator` | pollinator / 传粉者 | 把花粉从一朵花带到另一朵花的动物 | 编辑用词 | pollination |
| `fertilisation` | fertilisation / 受精 | 雄性生殖细胞与雌性生殖细胞融合；让果实和种子形成的过程 | Z03；与 `plant` 同 | pollination, sperm |
| `seed-dispersal` | seed dispersal / 种子传播 | 种子被带离母株：风、水、动物、爆开 / 裂开 | zh.wikipedia 种子传播（Z04）；与 `plant` 同 | fruit |
| `germination` | germination / 萌发 | 种子开始长成幼苗；口语"发芽" | zh.wikipedia 发芽、HK EDB（Z05）；与 `plant` 同 | seed-leaves |
| `seed-leaves` | seed leaves / 子叶 | 种子里储存养分的叶状部分 | 与 `plant` 同 | germination |
| `sperm` | sperm / 精子 | 男性的生殖细胞，睾丸产生 | 编辑用词（标准汉语词，未查新加坡来源） | egg |
| `egg` | egg / 卵子 | 女性的生殖细胞，卵巢产生；受精卵在子宫里发育 | 编辑用词（同上） | sperm |
| `fair-test` | fair test / 公平测试 | 一次只改变一样东西、其余保持不变 | 与 `forces`、`materials` 等主题一致 | — |

删的顺序（超过 18 个时）：`anther`（并入 stamen）→ `stigma`（并入 pistil）→ `pollinator`（并入 pollination）。另：`ovaries`（人，卵巢）不单列，写进 `ovary` 的注里（`see` 的 `ovaries` 删去）；`fruit` 若需要，沿用 `plant` 的定义（由子房长成）。

### 6.2 来源（施工时进 `sources.json`；**访问日期一律 2026-10-21**）

施工时 S# 照 docs/33、36、37 的做法保留 P# 的编号（S1 = P1 …），没用上的写进 `SOURCES.md` 的空号说明。研究里标 unverified 的不进来源表；只读到摘要或新闻稿的在 `note` 写明。研究的 S 号在"R:"一列。

| P# | 内容 | 来源（URL） | R: | 用于 |
|---|---|---|---|---|
| P1 | 本设计研究（标本台布局、倍数、复用的几何、五杯的设置、§2.6 全部模型规则与结果、推断之处） | 本 spec §2–§4 | — | 规格行、PLATE、画面、细看 `How this model works` |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*（Updated Jan 2026），印第 15–16、38、42–47、69、72 页 | https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf | S01 | §1.1、D3 |
| P3 | SEAB，*PSLE Science (0009)*，examination from 2026 | https://www.seab.gov.sg/files/PSLE%20Syllabus%20documents/2026%20PSLE/0009_y26_sy.pdf | S02 | §1.5 |
| P4 | NParks Flora & Fauna Web，*Eonycteris spelaea*（Cave Nectar Bat） | https://www.nparks.gov.sg/florafaunaweb/fauna/5/6/563 | S03 | F-19 |
| P5 | NParks Flora & Fauna Web，*Durio zibethinus*（Durian，榴莲） | https://www.nparks.gov.sg/FloraFaunaWeb/Flora/2/8/2865 | S04 | F-20 |
| P6 | NParks Flora & Fauna Web，*Pterocarpus indicus*（Angsana，青龙木） | https://www.nparks.gov.sg/florafaunaweb/flora/3/0/3093 | S05 | F-32 |
| P7 | NParks Heritage Trees，Sea Almond（HT 2017-290） | https://heritagetrees.nparks.gov.sg/heritagetrees/ht-2017-290/ | S06 | F-34 |
| P8 | NParks Flora & Fauna Web，*Terminalia catappa*（Sea Almond，榄仁树） | https://www.nparks.gov.sg/florafaunaweb/flora/3/1/3181 | S07 | F-34 |
| P9 | NParks Flora & Fauna Web，*Hevea brasiliensis*（Para Rubber） | https://www.nparks.gov.sg/florafaunaweb/flora/2/9/2953 | S08 | F-38 |
| P10 | NParks Heritage Trees，Para Rubber（HT 2018-294） | https://heritagetrees.nparks.gov.sg/heritagetrees/ht-2018-294/ | S09 | F-38 |
| P11 | NParks Flora & Fauna Web，*Impatiens balsamina*（Garden Balsam，凤仙花） | https://www.nparks.gov.sg/florafaunaweb/flora/2/1/2121 | S10 | F-12、F-39 |
| P12 | NParks Flora & Fauna Web，*Cocos nucifera*（Coconut，椰子） | https://www.nparks.gov.sg/florafaunaweb/flora/5/6/5618 | S11 | F-35 |
| P13 | Harries, H. C. & Clement, C. R. (2014). Long-distance dispersal of the coconut palm by migration within the coral atoll ecosystem. *Annals of Botany* 113(4): 565–570（摘要；OUP 拒绝自动读取，待核） | https://academic.oup.com/aob/article/113/4/565/2768952 | S12 | F-35 |
| P14 | NParks Flora & Fauna Web，*Adenanthera pavonina*（Saga，相思豆） | https://www.nparks.gov.sg/florafaunaweb/flora/2/6/2697 | S13 | F-40 |
| P15 | NParks Flora & Fauna Web，*Ficus variegata*（Common Red-stem Fig，青果榕） | https://nparks.gov.sg/florafaunaweb/flora/2/9/2917 | S14 | F-24、F-37 |
| P16 | NParks，Seed dispersal for plant reproduction（Primary 5 resources） | https://www.nparks.gov.sg/learn/resources/seed-dispersal-plant-reproduction | S15 | F-33 |
| P17 | NParks，"The Wings Behind Flowers"（Ng Wenli，2025-02-04） | https://www.nparks.gov.sg/publications-resources/articles/the-wings-behind-flowers | S16 | F-12、F-16、F-24 |
| P18 | NParks，"Identifying the Sunbirds of Singapore"（2025-02-11） | https://nparks.gov.sg/publications-resources/articles/identifying-the-sunbirds-of-singapore | S17 | F-16、F-18 |
| P19 | Wee, Y. C. (2018). Olive-backed Sunbird: Sipping nectar from flowers of Scarlet Spiral Flag. Bird Ecology Study Group | https://besgroup.org/2018/07/31/olive-backed-sunbird-sipping-nectar-from-flowers-of-scarlet-spiral-flag/ | S18 | F-17 |
| P20 | NParks Flora & Fauna Web，*Cinnyris ornatus*（Ornate Sunbird） | https://nparks.gov.sg/florafaunaweb/fauna/4/7/476 | S19 | F-18 |
| P21 | Chan, K. W. (2013). Cave fruit bat and mourning gecko on golden penda tree. *Singapore Biodiversity Records* 2013: 108–109（LKCNHM / NUS） | https://lkcnhm.nus.edu.sg/wp-content/uploads/sites/11/app/uploads/2017/04/sbr2013-108-109.pdf | S20 | F-23 |
| P22 | NParks，Every Child a Seed（Primary 3 programme） | https://www.nparks.gov.sg/learn/programmes/every-child-seed | S21 | F-55 |
| P23 | NParks Flora & Fauna Web，*Asplenium nidus*（Bird's Nest Fern，巢蕨） | https://nparks.gov.sg/florafaunaweb/flora/1/5/1541 | S22 | F-3 |
| P24 | （空号：*Nephrolepis acutifolia* 不用——它的"走茎"繁殖属课纲不要求的营养繁殖） | — | S23 | — |
| P25 | NParks，"Is it a Fern? Double Con-fern!"（2025-02-03） | https://www.nparks.gov.sg/publications-resources/articles/is-it-a-fern--double-con-fern! | S24 | F-1 |
| P26 | NParks Flora & Fauna Web，*Capsicum annuum*（Chilli，辣椒） | https://www.nparks.gov.sg/florafaunaweb/flora/6/6/6629 | S25 | F-11 |
| P27 | NParks Flora & Fauna Web，*Vigna radiata*（Mung bean，绿豆） | https://www.nparks.gov.sg/florafaunaweb/flora/5/8/5888 | S26 | F-49 |
| P28 | （空号：Bur Mallow 的钩没核实，D11 不用） | — | S27 | — |
| P29 | NEA，"2018 Is Singapore's Eighth Warmest Year On Record"（2019-01-15） | https://www.nea.gov.sg/media/news/news/index/2018-is-singapore-s-eighth-warmest-year-on-record | S28 | F-53 |
| P30 | OpenStax，*Biology 2e*，32.1 Reproductive Development and Structure | https://openstax.org/books/biology-2e/pages/32-1-reproductive-development-and-structure | S30 | F-9 |
| P31 | OpenStax，*Biology 2e*，32.2 Pollination and Fertilization | https://openstax.org/books/biology-2e/pages/32-2-pollination-and-fertilization | S31 | F-13、F-14、F-15、F-21、F-27、F-48 |
| P32 | OpenStax，*Biology 2e*，25.4 Seedless Vascular Plants | https://openstax.org/books/biology-2e/pages/25-4-seedless-vascular-plants | S32 | F-2 |
| P33 | OpenStax，*Biology 2e*，25.3 Bryophytes | https://openstax.org/books/biology-2e/pages/25-3-bryophytes | S33 | F-4 |
| P34 | OpenStax，*Biology 2e*，24.1 Characteristics of Fungi | https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi | S34 | F-5 |
| P35 | OpenStax，*Biology 2e*，26.1 Evolution of Seed Plants | https://openstax.org/books/biology-2e/pages/26-1-evolution-of-seed-plants | S35 | F-6 |
| P36 | Aziz, S. A. et al. (2017). Pollination by the locally endangered island flying fox (*Pteropus hypomelanus*) enhances fruit production of the economically important durian (*Durio zibethinus*). *Ecology and Evolution* 7(21): 8670–8684（马来西亚刁曼岛） | https://pmc.ncbi.nlm.nih.gov/articles/PMC5677486/ | S36 | F-22 |
| P37 | Tewksbury, J. J. & Nabhan, G. P. (2001). Directed deterrence by capsaicin in chillies. *Nature* 412: 403–404（PubMed 摘要） | https://doi.org/10.1038/35086653 | S37 | F-36 |
| P38 | ScienceDaily（2001-07-26），"For Peppers, 'Hot' Quite Literally The Spice Of Life"（P37 的新闻稿） | https://sciencedaily.com/releases/2001/07/010726103553.htm | S38 | F-36 |
| P39 | Relf, D. & Ball, E. *Plant Propagation from Seed*，Virginia Cooperative Extension 426-001 | https://pubs.ext.vt.edu/426/426-001/426-001.html | S40 | F-7、F-8、F-43 |
| P40 | BBSRC（UKRI），*Easy-PEAsy seed germination*：teachers' pack and student sheets | https://www.ukri.org/wp-content/uploads/2022/02/BBSRC-140214-Easy-peasy-seed-germination-teachers-pack-and-student-sheets.pdf | S41 | F-44、F-45、F-54 |
| P41 | New York Botanical Garden，*Seedling Science*（grades 2–8） | https://www.nybg.org/content/uploads/2017/03/Seedling_Science_Layout_1.pdf | S42 | 07 细看（可选） |
| P42 | Gardens by the Bay，"Speedy Sprouts" | https://www.gardensbythebay.com.sg/en/learn-with-us/explore-resources/articles/speedy-sprouts.html | S43 | F-51 |
| P43 | Bass, L. & Sanders, D. *Bean Sprouts and Other Vegetable Seed Sprouts*，NC State Extension | https://content.ces.ncsu.edu/bean-sprouts-and-other-vegetable-seed-sprouts | S44 | F-51 |
| P44 | Silwal, S. et al. (2026). Critical temperature requirement for the germination and establishment of mungbean (*Vigna radiata* L.) in temperate environments. *Frontiers in Plant Science* | https://pmc.ncbi.nlm.nih.gov/articles/PMC12921486/ | S45 | F-50、F-47 |
| P45 | Oplinger, E. S. et al. (1990). Mungbean. *Alternative Field Crops Manual*（Purdue NewCROP） | https://hort.purdue.edu/newcrop/afcm/mungbean.html | S46 | F-49 |
| P46 | Science Foundation Ireland，*Investigating Falling Things: Paper Helicopters* | https://www.sfi.ie/site-files/primary-science/media/pdfs/col/curious-minds-resource-paper-helicopters.pdf | S47 | F-41 |
| P47 | Vanderbilt University，"Modeling Nature: Conditions for Germination & Growth"（2005） | https://vanderbilt.edu/modeldata/curriculum_seeds_bigideas_cfgg.htm | S50 | M-1、M-2 |
| P48 | Lampert, P. et al. (2020). Students' conceptions of plant reproduction processes. *Journal of Biological Education* 54(2): 213–223（ERIC 摘要） | https://eric.ed.gov/?id=EJ1249417 | S51 | M-5 |
| P49 | Wynn, A. N. et al. (2017). Student Misconceptions about Plants. *JMBE* 18(1) | https://pmc.ncbi.nlm.nih.gov/articles/PMC5524439/ | S52 | M-3、M-8、M-9、F-28 |
| P50 | Gültekin, M. (2014). Diagnosing Students' Misconceptions about Plant Parts in Turkey. *IJHSS* 4(7): 134–142（经 SciMAP 摘要页） | https://wordpressua.uark.edu/scimap/?p=372 | S53 | M-7 |
| P51 | Luis, M. & Monteiro, R. (2011). Conceptual Progression Hypothesis study … Plant Reproduction（3 人个案） | https://sapientia.ualg.pt/bitstreams/ed69db2c-5623-4714-af72-ebd430d51136/download | S54 | M-1、M-3 |
| P52 | Fairfields Primary School，Science Common Misconceptions Map（2022） | https://www.fairfields.herts.sch.uk/_site/data/files/migrated/science/misconception-map.pdf | S55 | M-1、M-4、M-6 |
| P53 | zh.wikipedia：传粉 | https://zh.wikipedia.org/wiki/传粉 | S60 | §6.1 |
| P54 | zh.wikipedia：花 | https://zh.wikipedia.org/wiki/花 | S61 | §6.1 |
| P55 | zh.wikipedia：孢子 | https://zh.wikipedia.org/wiki/孢子 | S63 | §6.1 |
| P56 | zh.wikipedia：种子传播 | https://zh.wikipedia.org/wiki/种子传播 | S64 | §6.1 |
| P57 | zh.wikipedia：发芽 | https://zh.wikipedia.org/wiki/发芽 | S65 | §6.1 |
| P58 | zh.wikipedia：太阳鸟科 | https://zh.wikipedia.org/wiki/太阳鸟 | S66 | §6.1 |
| P59 | 香港教育局，*An English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S.1–3)*（2017） | https://www.edb.gov.hk/en/curriculum-development/kla/science-edu/ref-and-resources/glossary.html | S67 | §6.1 |
| P60 | zh.wikipedia：种子植物 | https://zh.wikipedia.org/wiki/种子植物 | S62 | §6.1 |
| P61 | Flora of China, Vol. 17：*Capsicum annuum* 辣椒（沿用 `plant` S10） | http://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200020513 | `plant` S10 | F-10 |
| P62 | Cruz, D. de O. et al. (2005). Pollination efficiency of the stingless bee … on greenhouse sweet pepper（沿用 `plant` S14） | https://scielo.br/j/pab/a/YbrfGpRbjMSwD3SGBPvcQTB/abstract/?lang=en | `plant` S14 | F-11 |
| P63 | NParks GardeningSG，"Chilli"（沿用 `plant` S13） | https://gardeningsg.nparks.gov.sg/gardening-resource-library/chilli/ | `plant` S13 | F-11 |
| P64 | 各标本的尺寸（太阳鸟、洞穴花蜜蝠、榴莲花、青果榕的榕果与榕小蜂、榄仁树果、橡胶树果与种子、巢蕨叶片、绿豆、苔藓） | **待核**（多数在 P4–P27 的 NParks 物种页 Size / Fruit / Flower 字段；榕小蜂另找） | — | §2.7 |
| P65 | 泡在水里的种子缺氧不萌发（课堂或推广资料） | **待核** | — | F-46 |
| P66 | 绿豆在冰箱温度下不萌发（或最低萌发温度） | **待核**（先读 P44 全文） | — | F-47 |
| P67 | 萌发时根先出来；暗处的绿豆芽发黄 | **待核**（OpenStax 32.2 / P42 / P43 原文） | — | F-48、F-45 |
| P68 | 榕果里面的花与榕小蜂进出的孔 | **待核**（P17 的榕小蜂一段或大学资料） | — | F-25 |
| P69 | 洞穴花蜜蝠、榕小蜂、苔藓的中文名 | **待核** | — | §0.1-3、§0.1-8、§6.1 |

---

## 7. 图像清单（只用已审的草稿，不出新图）

本轮**没有 Codex**，不生成新图。三张草稿都在 `art/planned/flower-and-seed/`（`art/planned/manifest.jsonl` 第 71–73 行，Codex 2026-10-18 生成并自检：灰度、真 alpha、无文字），本文起草时逐张在象牙底上看过。**图只当插画，不当事实依据**；主会话入库前再核一次下表的核对点。入库用 `scripts/illustrate.ts`（只处理、不生成）：

```
pnpm tsx scripts/illustrate.ts process art/planned/flower-and-seed/flower-and-seed.png flower-and-seed
pnpm tsx scripts/illustrate.ts figure  art/planned/flower-and-seed/flower-and-seed-bee-pollination.png flower-and-seed-bee-pollination
pnpm tsx scripts/illustrate.ts figure  art/planned/flower-and-seed/flower-and-seed-seed-germination.png flower-and-seed-seed-germination
```

| 草稿 | 看到的 | 决定 | 用在 | 图注草稿 EN / ZH |
|---|---|---|---|---|
| `flower-and-seed.png`（封面，1024²） | 一朵通用的五瓣花连着一段带两片锯齿叶的茎；近侧花瓣与子房纵剖，子房里两列椭圆胚珠；中央**一个**雌蕊（圆头柱头、连续的花柱）；约十枚细长雄蕊围着它；萼片在基部。无文字、灰度、透明底 | **沿用**（首页图版 → `public/illustrations/flower-and-seed.webp` + `@2x`，守 90 KB / 260 KB 预算） | 首页 | （首页图无图注） |
| `flower-and-seed-bee-pollination.png`（1536 × 1152） | 一枝辣椒：两个花蕾、几片全缘叶、一朵五瓣白花；一只蜜蜂伏在花上，前足碰着花药，身上沾着花粉粒，后足带着花粉团；两对翅、远侧的部分被挡住。无箭头、无文字 | **沿用**（`public/illustrations/figures/flower-and-seed-bee-pollination.webp`） | 第 02 章 ④ 段后 | A honeybee on a chilli flower: its hairy body brushes the anthers and picks up pollen. Illustration for this topic. / 蜜蜂停在辣椒花上，毛茸茸的身体擦过花药，沾上花粉。为本主题画的插图。 |
| `flower-and-seed-seed-germination.png`（1536 × 1152） | 一粒萌发中的绿豆：种皮裂开，两片肥厚的子叶露出；一段向上弯的芽带着未展开的叶芽；一条向下斜伸的主根带几条细侧根，根尖完整。无土、无文字 | **沿用**（`public/illustrations/figures/flower-and-seed-seed-germination.webp`） | 第 06 章 ③ 段后 | A germinating green bean: the seed coat has split, a root grows down and a shoot grows up. Illustration; not to scale and not timed. / 一粒正在萌发的绿豆：种皮裂开，根向下长，芽向上长。示意插图，不按比例，也不对应具体天数。 |

- **核对点**：封面——只有一个雌蕊、柱头不分叉（manifest 记了第三次才去掉木槿式的分叉柱头）、胚珠在子房里、雄蕊连在花上、无文字；它**不是辣椒**，只作首页插画（§0.1-9）。蜜蜂图——花瓣五片；六足都接在胸部；头部后方一条细线（触角或翅基）在 1 倍大小下看一次，若读成多出的触角就在 `illustrate.ts` 前用 alpha 擦掉（只擦线，不改画）；后足的花粉团是蜜蜂的真实特征。萌发图——manifest 记了细根之间残留的淡灰阴影（DONE.md 已披露）：在发布尺寸下看，若看得出就用 `illustrate.ts process` 的浮尘去除（同 `plant` §9.1 第 8 条的做法）；图注不写天数（F-52）。
- 只有两张章节图（D16）：第 01、03、04、05、07 章没有配图，模型本身就是图。若以后有生成器，候选是"太阳鸟访花"（03）与"五杯第 7 天"（07）——记在 §9 的待办，不在本轮。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；本主题**不需要新依赖**；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

模型分工（本轮没有 Codex）：**Opus** 做引擎、几何与视觉、数据、中文、事实复核与终审；**Sonnet** 做英文草稿、事实核查（读原文、落定"待核"）、节拍草稿、截图 QA；**Haiku** 做机械检查（链接、计数、来源 URL 可达、数字与名词的一致性 grep）。

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 第 150–151 行状态同步、docs/README 加一行；§0.1 各项进 `docs/review-queue.md` | 主会话 | docs/41、docs/17、docs/README、docs/review-queue | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts flower-and-seed --engine space-scene --subject biology --title-en "Flowers and Seeds" --title-zh "花与种子"`；参考图 R1–R12 下到 `scripts/geo/flower-and-seed/refs/`，逐张核许可 | 主会话（参考图可交 Opus 内容代理） | 主题目录、refs | validate 绿；参考图看过 | 0.4 天 |
| F | **事实核查**：§2 全部"待核"（F-3 叶长、F-6、F-19 状态、F-22 是否含洞穴花蜜蝠、F-25、F-34 措辞、F-35、F-38 全句、F-45 绿豆、F-46、F-47、F-48、§2.7 的尺寸、§6.1 的 moss / 榕小蜂 / 蝙蝠中文名、太阳鸟现行名）逐条读原文；产出 `art/research/flower-and-seed/facts-pass1.md`（每条：原文摘录 ≤ 25 词、页码 / 定位、是否改 §2 的值、触发了哪条退路） | Sonnet → Opus 复核 | `art/research/flower-and-seed/`（只增文件） | 每个待核有结论（核实 / 换值 / 按退路删） | 0.8 天 |
| E | E-S1 模型 + 夹具 `sample-seeds` + 测试 + docs/06 一节（§4.5；**等 `materials` 合并后开工**） | Opus 引擎（一个代理） | §4.5 的文件；**不碰** `src/content/topics/flower-and-seed/`、`plant/`、docs/38、docs/40 | §4.6 全勾 | 1 天 |
| D1 | 数据骨架：`build-parts.ts`（读 `plant` 的 16 件并换算，§3.2；新建 37 件）、9 + 4 组、姿态、动画、流、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后加）；五杯先全显示种子 | Opus 内容（几何 + 数据），**与 E 并行** | `src/content/topics/flower-and-seed/data/parts.json`、`chapters/*.mdx` frontmatter、`scripts/geo/flower-and-seed/build-parts.ts`（文字放同目录 `text.ts`） | validate 0 error；复用件包围盒单测；`plant` 文件哈希不变 | 2 天 |
| D2 | R2 几何两轮（对照 R1–R12；重点：太阳鸟的喙与体形、蝙蝠的翼膜与指骨、榴莲花的雄蕊束、巢蕨的放射叶与叶背线、榕果剖面、橡胶树果的三瓣与爆开姿态；干涉检查：鸟足抓在花茎上、蝙蝠吻到花口、杯里的幼苗不穿杯壁）→ R3 材质（paper / cinema 下各物种本色分得开；淡黄幼苗用固定 hex）→ E 合并后加 `sim`、绑定 | Opus 内容（视觉） | 同上 + `docs/screenshots/flower-and-seed/` | 每轮 `pnpm shoot flower-and-seed` 截图自证；calls / 三角形在 §3.4 预算内 | 3 天 |
| T1 | 英文：零件 summary / detail、八章正文与细看、名词定义、`sources.json` 英文（按 F 的结论；只写读到并核对过的内容） | Sonnet 起草 → Opus 逐句核对事实、课纲用词与 D3 的位置规则 | `sources.json`、`glossary.json`、`text.ts`、`chapters/*.mdx` 正文 EN、`SOURCES.md` | 事实表与来源一一对应；`pnpm tsx scripts/sources-md.ts flower-and-seed` | 1.5 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（独立成文；传粉 / 授粉 / 受精的说法；植物名照 NParks） | Opus | 同上 ZH 字段 | 用词与 §6.1 一致 | 1 天 |
| I | 三张草稿入库（§7 的三条命令）；核对点逐张看 | 主会话 | `public/illustrations/`、`src/lib/illustrations.json` | §7 核对点 | 0.1 天 |
| B | 42 拍定稿：镜头、标注、`sim.set`、`layers`、`pose`、字幕 EN / ZH（字幕说的东西本拍画面里看得见；放大的标本第一次出现时说倍数） | Sonnet 起草 → Opus 审 ZH | `state.beats` | `--beats` 0 失败、无漏标、四种组合 | 1 天 |
| Q1 | 机械检查：`<TopicLink>` 的 slug / ch 都存在；名词表条数、每个 `<Term>` 有条目；`sources.json` 每条 URL 可达（HEAD / GET，记状态码）；每章 `index` 覆盖本章字幕与正文提到的零件；全文 grep（§8.2 的"不讲"清单） | Haiku | 只读，汇报 | 汇报清单清零 | 0.2 天 |
| Q2 | 截图 QA：`pnpm shoot flower-and-seed --layout --keys --beats --locale en,zh --theme paper,cinema`，逐拍看（en-paper 全看，其余抽看）；HUD 排版、模式组合、手机 | Sonnet；视觉问题回 Opus | `docs/screenshots/flower-and-seed/`（shoot 日志放自己的子目录，docs/36 §9.2 流程问题 4） | §8.2 全勾 | 1 天 |
| R | 终审：事实（每个界面字符串能追到 F#）、措辞、代码审计；`plant` 第 05–07 章回链（主会话改） | Opus（终审）+ 主会话 | — | 门槛全绿 | 0.4 天 |

- 合计：引擎约 1 天（与 D1 并行）；内容约 11 天（几何是大头：太阳鸟、蝙蝠、榴莲花、巢蕨、苔藓、榕果、橡胶树果都是新建的生物形体）。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）。
- **样章**：第 07 章（五杯 + T3）先做完给 Gavin 看——最能检验 E-S1、`visible` / `tint` 的画法、"冰箱又冷又暗"的讲法；**写实检查**用第 03 章（太阳鸟、蝙蝠与榴莲花）在 R2 第二轮后单独过一次。
- **另一个代理在写 docs/38（`living-things`）、之后有 docs/40**：本主题的任何代理都不碰它们与对应目录；`living-things` 的链接按 §1.7"谁后发布谁补"。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：Practices 的孢子与种子在 00、01；四个过程各有主线（02–03 传粉、04 受精、05 种子传播、06–07 萌发），顺序与课纲一致；受精的 Standard 与 Foundation 两种说法都在 04；人的受精用课纲的话，相似处在 04 第 6 拍；VEA 两条落在文字试一试。
- [ ] **不讲的**（`grep` 正文、字幕、卡片、零件文字）：无 self-pollination / cross-pollination / 自花传粉 / 异花传粉；无 pollen tube / 花粉管；无"在胚珠里受精""在子房里受精""fertilisation takes place in"、无 oviduct / fallopian / 输卵管；无 umbilical / foetus / 脐带 / 胎儿；无 stem cutting / 扦插（细看 `What P5 leaves out` 只泛说"中学再学"）。
- [ ] **天数纪律**（F-52）：无"1–2 days / 1–2 天 / 一两天"之类的胚根天数；正文与字幕里的天数只有 F-50、F-51 的数和"一星期 / 第 7 天"；单测：字幕里的每个天数 = 该拍设置下模型的 `half-day` 或 `day`。
- [ ] **必须讲对的十处**（§0 D5）各有一拍或一段正文；误解目录 M-1–M-12 每条在指定章出现并给出正确说法；"种子不需要光"一律带"多数 / 绿豆"限定，全文无绝对的"seeds do not need light"。
- [ ] **结果一致**：卡片、字幕、正文、细看、S1 里同一个结果同一种说法（§2.6 三张表）；单测：五杯 5 × 2 天 × 3 个状态、`changed` 全表、`timing` 全表、`dispersal` 七行 = §2.6；F 步若触发退路（§0.1-6），§2.6、单测、字幕同步。
- [ ] **来源分寸**：榴莲与蝙蝠的野外研究写明马来西亚、大狐蝠；太阳鸟名字按 §0.1-2；风媒只泛说草类；相思豆不当单一类别；没有带钩的果。
- [ ] **复用**：`plant` 的文件未被改动（哈希）；复用件包围盒单测通过；`plant` 第 05–07 章回链（主会话）通过 validate。
- [ ] **试一试**：T1（05）、T2（06）、T3（07）可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；三个先猜后看不判对错、中英文都对；T2 记三行出折线图、读屏文字对；T3 的 `ref-ring` / `pick-ring` 跟着选择走。
- [ ] **写实**：Tier-1 清单（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"一圈标本：花、鸟、蝙蝠、果实、发芽的豆子"；生殖细胞明显是示意图（有"示意"标注、无器官背景）；无品牌、无字。
- [ ] **比例尺**：每个有 `scale` 的组选中时比例尺正确；§2.7 核不到尺寸的组没有比例尺、名字写"示意比例"；不同倍数的组不同框（每章 `layers`）。
- [ ] **性能**：hero 静止 ≤ 80 calls、上限 100；各章 ≤ 45；三角形 < 0.35 M；模型一次求值 < 0.05 ms。超过目标时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：三张卡在抽屉里可用，按钮 ≥ 44 px；`cups-view` 里五杯与两个环看得清。
- [ ] 首页图 + 2 张配图逐张核对 §7。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot flower-and-seed --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

（主题施工后照 docs/36、37 §9 补：主题施工与本 spec 的差异表；F 步事实核查的结论（F-6、F-25、F-35、F-45–F-48、§2.7 尺寸、中文名与 §0.1 的退路是否触发）；复用 `plant` 几何的换算记录；参考图；性能；截图验收；引擎与流程问题。）

### 9.1 引擎（E-S1，2026-10-22，Opus 引擎代理，分支 `worktree-agent-a6decabca2d78e05c`）

**做了什么**：E-S1 `seeds` 模型（`lib/sim/seeds.ts`：`solveSeeds`、`seedsQuantity`、`seedsStates`、`cupConditions`、`cupResult`、`cupSeedlings`、`cupChange`、`halfState`；`seeds-schema.ts`：`seedsSchema`、`seedsIssues`）。注册只动了列表的末尾：`sim-schema.ts`（`SIM_KINDS` 加 `'seeds'`、`seeds: seedsSchema.optional()`、`quantityKind` 一支、状态表一支、"永远不会出现的状态"一句、`seedsIssues` 两行）、`lib/sim/index.ts`（`simQuantities` 一行、`SEPARATE_EXPERIMENTS.seeds = true`）；没有时间线。另加两个 token、一个测试 API 读数与对应的 `pnpm shoot --beats` 核对（见下）。作者模板 `tests/space-scene/fixtures/seeds-bench.ts`（§4.2 整段 `sim`，按 §0.3 改；另有 §2.6 初稿五杯的 `FIVE_CUPS`）；草稿夹具 `sample-seeds`（背景章 + 传播、温度与天数、四只杯三章，12 拍）；单测 `seeds.test.ts`、`tests/theme/seedling-token.test.ts`；e2e `tests-e2e/sample-seeds.spec.ts`（9 条）；docs/06 新节「SpaceScene · 试一试 · 种子（seeds）」与模型种类、token 两行；docs/08 §1 功能色表加一行。

**与 §4 的出入**（内容代理照这些写数据）：

1. **四杯**（§0.3-1）：模板与夹具都是 A、B、D、E 四杯，选项 id 保留字母 `a` `b` `d` `e`（字幕里的"E 杯"不用改名）；`grown-*` / `pale-*` 各 4 个、绑定 12 条（不是 15）。四杯里没有哪两杯只差"空气"，所以 `changed` **不写 `air` 标签**（写了 validate 报"never"）；引擎仍支持五杯（`FIVE_CUPS` 单测复现 §2.6 初稿的整张 5 × 5 表）。
2. **淡黄色是 token**，不是 §3.4 / §4.2 的 `#e4dba2`：新加 `--seedling`（有光的幼苗，叶绿）与 `--seedling-pale`（暗处长出的幼苗，淡黄；`tint` 绑定写 `"color": "token:seedling-pale"`）。paper `#6B8E3A` / `#E4DBA2`（L* 54.8 / 86.9），cinema `#86AB52` / `#EBE2A6`；单测核两者明度差 ≥ 20、淡黄 L* ≥ 80、彩度 20–40、色相 85–110°、与 `--bone`、`--food` 分开。§4.4 说"不需要新 token"，但颜色只用 token 的规矩优先。
3. **一个零件一次只取一个姿态**（同一轮绑定里后写的胜出）：§4.2 同时给 `rubber-capsule` 写了 `rubber-front` 与 `capsule-burst`、给 `balsam-pod` 写了 `balsam-front` 与 `pod-split`，两条会互相覆盖。模板只留 `capsule-burst`、`pod-split`，**这两个姿态里要把"移到台前、抬高"也写进去**（复用 `plant` 的 `pod-split` 时加上同样的 offset）；`sea-almond`、`sea-almond-cut` 共用一条绑定。绑定共 26 条（≤ 64）。
4. **`tint` 只染零件自己的材质（槽 0）**：幼苗的茎、子叶要同一种材质（含 tint 色），才会一起变淡黄；`seedlings-*` 用 `repeat` ×5，不写不同材质的 `extra`。
5. **validate 比 §4.3 多三条**：至少写一个子模型；`cup` 与 `against` 必须是两个控件；**两杯条件完全相同报错**（拿它们比什么也没改，`changed` 会说"同一杯"）。天数步进（`count-day`、`day`）的值都要 ≥ 0。
6. **`changed` 的因素名**：杯子数据写 `places[*].warm`，状态叫 `warmth`（§4.2 原样）；`same-cup` 也用于"两杯条件相同"，但第 5 条已经不让这种数据通过，所以实际只在 c = r 时出现。
7. **`timing:half`**：day ≥ 中位数算"一半或更多"（中位数那天本身算到了）；20 °C 第 4 天 `fewer`、第 5 天 `half-or-more`，与 §2.6 一致。标签按 §0.3-3 写成"发芽的种子里有一半"（模板草稿：Fewer than half of those that germinate / 发芽的种子里还不到一半）；`half-day` 的标签同理。
8. **`method` / `feature` 的取值集写死在引擎里**（课纲 P5 的四种方式、P6 的结构适应），作者只能从里面选；`dispersal:*` 的状态按 `fruits` 实际用到的穷举，夹具只有三种果实（风、水、爆开），所以它的 `method` 不写 `animals`。
9. **测试 API 与 QA**（§4.4 没有）：`__atlas.engine.tint(partId)` → `{ color, level }`（此刻画出的 `tint` 目标色与混色程度）；`pnpm shoot --beats` 每拍与拍链接核对每件有 `tint` 绑定的零件画出的程度 = 绑定值（± 0.01）。`lib/sim/bind.ts` 抽出 `tintLevel`（舞台与 shoot 同用；值是 NaN 时取 0，原来会得 NaN）。没有新绑定。
10. **夹具**：三个占位果实（翅片 = 风、浮球 = 水、三瓣球 + 三粒种子 = 爆开，`burst-open` 姿态把果移到台前并弹出种子）、一条天数卡（13 道刻度、`day-marker`、`half-flag`）、窗台 / 柜子 / 冰箱（`shell`）上的四只杯与两个环；三条流 `whenRun: false`（不按 RUN 也随 `method` 显隐）、颗粒 `size` 0.15（台面尺度小，0.5 会盖住果实）。颜色全用材质族与 token。
11. **模板标签**（结果、幼苗"发白"、改了什么……）是引擎代理写的草稿，内容代理定稿时可改字，不改 id。

**验收**：见下方"门槛"一段（合入 main 后重跑）。
