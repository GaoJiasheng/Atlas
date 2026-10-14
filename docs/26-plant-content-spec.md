# 26 · 一株植物 · 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体（按器官分区）。**全部程序化**（`sweep`、`wing`、`lathe`、`extrude`、`repeat`，docs/06「生物与有机形体」），不用网格、不贴照片。范本：docs/14（蚱蜢：生物分区、标本盘、姿态、流的 stops）、docs/12（流与读数）、docs/18（`<Figure>`）。

本主题的任务：**一个对象贯穿 P3–P6 的五个课题**（docs/17 #8）。读者看完能说出根、茎、叶、花各做什么；能沿着输水管把水从根送到叶、沿着输食管把糖从叶送到根和果实；能说出光合作用要什么（光、水、二氧化碳、叶绿素）、产生什么（糖、氧）；能讲清传粉、受精、种子传播、萌发四步；能设计"有光 / 无光""有水 / 无水"这样的公平测试。

结构按本次 brief：决策 §0；范围与事实 §1；写实与参考 §2；零件 §3；流、动画、剖切、姿态、预设、读数、引擎缺口 §4；章节 §5；名词 §6；来源 §7；图像 §8；施工 §9；验收 §10。正文、字幕、来源条目未经 Gavin 定稿不写；§5 的字幕是草稿。

---

## 0. 决策（2026-10-13 起草，待 Gavin 定稿）

| # | 提议 | 待确认点 |
|---|---|---|
| 0-1 | **对象 = 一盆正在开花结果的辣椒 *Capsicum annuum***（双子叶植物，盆栽约 0.5 m）。理由：①新加坡家里、社区花园、学校园圃常种（docs/17 #8 的候选之一）；②**花是规则花**：白色花瓣 5（–7）片、雄蕊 5（–7）枚、一个雌蕊、子房上位（P7、P8，**待核**），剖开后雄蕊、雌蕊、子房、胚珠一眼看清，最适合 P5 传粉 / 受精；③同一株上同时有花蕾、花、青果、红果，生命周期在一株上就看得到；④果实是浆果，**种子靠鸟传播**（辣椒素阻止哺乳动物取食但鸟不受影响，P11）——一个干净、有来源的"动物传播"例子。**备选**：凤仙花 *Impatiens balsamina*（P5 红墨水染茎实验的经典材料、果荚弹裂传播；但花两侧对称、有距，雄蕊合生成帽，剖面难读）；绿豆 *Vigna radiata* 全株（萌发最经典，但花小、蝶形、雄蕊被龙骨瓣包住） | 选辣椒还是凤仙花 |
| 0-2 | **萌发用绿豆**：辣椒种子小（约 3–4 mm，**待核**）且有胚乳，课本讲"子叶给萌发提供养分"的标准材料是豆。第 07 章的萌发标本盘用**绿豆**（学校 P3 "种绿豆"实验的同一种），零件名与字幕写明"这是一粒绿豆，不是辣椒"；辣椒自己的幼苗作为标本盘最后一格 | 是否接受两种植物 |
| 0-3 | 课纲对齐（S3 页码，本地 `scratchpad/sci/paged.txt` 已核）：**P3** Life Cycles 第 42 页（"focus is on the stages (seed, young plant, adult plant) of flowering plants"）；**P4** Plant System (Plant parts and functions) 第 56 页（leaf、stem、root；Note：输水管 / 输食管留到 P5）；**P5** Plant System (Respiratory and circulatory systems) 第 57 页（Standard）/ 第 58 页（Foundation）（运输系统的部分与功能；Note：**不要求两种管的相对位置、不要求 xylem / phloem、不要求蒸腾拉力**）；**P5** Reproduction 第 43–45 页（传粉、受精（产生种子）、种子传播、萌发；Note：受精 = 雄性生殖细胞与雌性生殖细胞融合；**不要求 self- / cross-pollination、花粉管、受精的具体位置**；不要求扦插等营养繁殖）；**P6** Photosynthesis 第 78 页（Standard）/ 第 79 页（Foundation）（水、光能、二氧化碳 → 糖和氧；呼吸释放能量；太阳是主要能源）；**P6** Interactions within the Environment 第 69 页（种子 / 果实的结构是帮助传播的"结构适应"） | — |
| 0-4 | **课纲词优先**：主线写 water-carrying tubes / 输水管、food-carrying tubes / 输食管；xylem / phloem（木质部 / 韧皮部）只在细看与名词表 `see`；"stomata"课纲 P5 Note 说不要求，主线写 tiny openings in the leaf / 叶上的小孔（气孔），名词表收 `stomata`；**两种管的相对位置不作为要点**（模型里照真实画，字幕不考位置）；蒸腾拉力不讲，只在细看说"叶子里的水会蒸发出去" | 是否同意 |
| 0-5 | **尺度**：植物按实长建模，`units: { modelUnit: "cm", scale: 50 }`（1 场景单位 = 50 cm，植株约 1.0–1.2 U 高，与空调、蚱蜢同一量级，镜头与粒子参数可直接用）。**放大标本**（叶片切块、气孔、茎横切、根尖、花剖面、种子剖面）放在植株旁的标本台上，各自放大倍数写在零件名和 summary（"×200"），PLATE 比例尺只对植株有效：细看说明 | 尺度方案 |
| 0-6 | 生命周期与传播：**标本盘**（蚱蜢 v1 的做法），不让主模型变形长大；"同一株随节拍长大"等 E-P1（姿态序列）做好再升级 | — |
| 0-7 | 公平测试是 PSLE 的重点（docs/17 §3.6）：第 02、03、04、07 章各有一个"试一试"写成公平测试（改变一个量、其余不变、量什么）；模型里用 context 件（台灯、纸箱、两只盆）和姿态（`wilted`）把"对照组 / 实验组"摆出来 | 是否每章都要 |
| 0-8 | 事实纪律：规格行 = TYPICAL（辣椒的典型尺寸、花的部件数，带来源）；PLATE 读数 = SIM（晴天一株盆栽辣椒的水与光，§1.4）；正文数字 `<Num s>` | — |
| 0-9 | 写法：不拟人（不写"植物想要阳光""花为了吸引蜜蜂"），写结构与作用（"白色的花瓣和花蜜吸引昆虫来访；昆虫身上沾的花粉落到柱头上"——课纲 P6 自己用 attracting 一词，可用）；不写"杂草""害虫"一类价值词 | — |
| 0-10 | 不做：照片贴图、品种名、商品名、测验（默认不做）；`note`：EN "Model study · a chilli plant (*Capsicum annuum*) · close-ups magnified, cells schematic" / ZH "模型研究 · 一株辣椒 · 放大标本另注倍数，细胞为示意" | — |

---

### 0.1 定稿（2026-10-14，主会话按 Gavin 惯例代定）

1. 开工（与电路并行）。植物 = 盆栽辣椒（Capsicum annuum），发芽用绿豆托盘并明示是另一种植物。
2. 比例方案按 §2（1 单位 = 50 cm；放大特写各自带比例尺——比例尺若引擎没有，先用文字标注，并把缺口报给主会话）。
3. 正文用课纲用语（water-carrying tubes / food-carrying tubes / tiny openings；中文"导水管 / 导养管 / 气孔"按名词委），xylem / phloem / stomata 只进细看与名词表。
4. 多色高亮（染色实验、碘试）若引擎只有两色，先用现有两色 + 文字说明，缺口报主会话。
5. 图：首页图版（辣椒）与 8 张配图已入库（`public/illustrations/plant.webp`、`figures/plant-*.webp`）。

## 1. 范围、读者、必须讲对的事实

### 1.1 读者与范围

读者：P3（2027，第 01、07 章）→ P4（2028，第 01–03 章）→ P5（2029，第 03、05–07 章）→ P6（2030，第 04、06 章）。每章章头写对应年级（若引擎的年级标签支持章级，**待核** docs/06「年级、索引页与偏好」；否则写进 summary 后的细看第一行）。讲：器官与功能、运输、光合作用、开花结果、传播、萌发、生命周期。不讲：细胞器、光合作用的化学式与光反应 / 暗反应、植物激素、分类学、遗传。

### 1.2 必须讲对的

1. **根**：把植物固定在土里；从土里吸收**水和矿物盐**；根毛让吸收面积变大（P1 第 56 页；P2 30.3）。
2. **茎**：撑起叶和花，让叶子朝向光；**里面的输水管把水和矿物盐从根送上来，输食管把叶子造的糖送到植物的其他部分**（P1 第 57 页；P2 30.2）。方向：水"只向上"，糖"上下都可以"（送到根、果实、新芽）。
3. **叶**：**造食物（光合作用）**：需要光、水、二氧化碳和叶绿素；产生糖和氧（P1 第 78 页）。叶绿素在叶子的绿色部分里。二氧化碳从叶上的小孔进来、氧从小孔出去（P2 30.4、8.1）。
4. **植物也呼吸**：日夜都在呼吸释放能量；光合作用只在有光时进行（P1 第 78 页 "living things need energy from respiration"）。常见误解"植物白天光合作用、晚上才呼吸"——细看讲清。
5. **花是繁殖器官**：雄蕊（花药 + 花丝）产生花粉；雌蕊（柱头、花柱、子房）里有胚珠；**传粉** = 花粉从花药到柱头；**受精** = 花粉里的雄性生殖细胞与胚珠里的雌性生殖细胞融合；之后**胚珠发育成种子、子房发育成果实**（P1 第 43 页；P2 32.1–32.2）。不讲花粉管（课纲 Note）。
6. **种子传播**：风、水、动物、弹裂（自身裂开）；果实和种子的结构帮助传播（P1 第 43、69 页）。辣椒是"被动物吃下、种子随粪便排出"的例子（P11）。
7. **萌发**需要**水、空气（氧）、适宜的温度**；**光不是萌发的必要条件**（常见误解）；萌发初期的养分来自子叶（豆类）（P2 32.2；P3）。
8. **生命周期**：种子 → 幼苗（young plant）→ 成株（adult plant）→ 开花结果 → 种子（P1 第 42 页的三个阶段名）。

### 1.3 事实表

| # | 项 | 值（来源） | 类 | 待核 |
|---|---|---|---|---|
| F-1 | 根、茎、叶的功能 | 见 §1.2-1–3（P1 第 56–57 页） | FACT | |
| F-2 | 盆栽辣椒高度 | 约 0.4–0.8 m（P7、P9）；本模型 0.55 m（DESIGN） | TYPICAL | 是 |
| F-3 | 辣椒花 | 花冠白色，5（–7）裂；雄蕊 5（–7），花药常带蓝紫色；子房上位，2–4 室（P7、P8） | TYPICAL | 是 |
| F-4 | 辣椒果 | 浆果；未熟绿、熟后多为红（品种而异）；种子扁圆、淡黄、约 3–4 mm（P7、P8） | TYPICAL | 是 |
| F-5 | 从播种到开花 / 结果 | 约 2–3 个月开花（热带，P9） | TYPICAL | 是 |
| F-6 | 辣椒的传粉 | 自交亲和，花可自花传粉，昆虫来访可增加结实（P8）。课纲不要求自花 / 异花术语——正文只说"花粉落到柱头上，可以来自同一朵花，也可以由昆虫带来" | TYPICAL | 是 |
| F-7 | 鸟传播辣椒种子 | 辣椒素让哺乳动物避开果实，鸟不受影响、吃后种子完好随粪便排出（Tewksbury & Nabhan 2001，P11） | FACT | |
| F-8 | 气孔 | 多数双子叶植物叶片的气孔主要在下表面；保卫细胞控制开闭（P2 30.4） | TYPICAL | |
| F-9 | 叶的内部 | 上表皮 → 栅栏组织（叶绿体多）→ 海绵组织（细胞间有空隙）→ 下表皮（气孔）；叶脉里有两种管（P2 30.4） | TYPICAL | |
| F-10 | 茎里的管 | 双子叶植物茎的维管束排成一圈；输水管（木质部）在内侧、输食管（韧皮部）在外侧（P2 30.2）。**课纲不要求位置** | TYPICAL | |
| F-11 | 输水管 | 由死细胞连成的中空管；输食管由活细胞组成（P2 30.2） | TYPICAL | |
| F-12 | 植物吸收的水的去向 | 绝大部分从叶子蒸发出去，用于光合作用的只是很小一部分（约 1–3 %，P2 / P4） | TYPICAL | 是（数值） |
| F-13 | 光合作用的产物 | 糖（葡萄糖，常转成淀粉储存、以蔗糖运输）和氧（P2 8.1） | TYPICAL | |
| F-14 | 碘液检验淀粉 | 淀粉遇碘变蓝黑（P3 / P5 教师用书），**只在细看提到、不作为家庭"试一试"**（需要用酒精煮叶，须老师带） | TYPICAL | |
| F-15 | 萌发条件 | 水、氧、适宜温度（P2 32.2；P3） | TYPICAL | |
| F-16 | 绿豆萌发 | 浸水后约 1–2 天胚根突出；子叶出土型（P10） | TYPICAL | 是 |
| F-17 | 种子结构 | 种皮、子叶（储存养分）、胚（胚根、胚芽）（P2 32.2） | TYPICAL | |
| F-18 | 传播四种方式与例子 | 风（带翅的果，如青龙木 *Pterocarpus indicus* 的翅果——新加坡常见行道树）、水（椰子）、动物（浆果被吃、带钩的果粘在毛上）、弹裂（凤仙花、豆荚）（P1 第 69 页的 Note；P6 NParks） | TYPICAL | 例子逐个待核 |
| F-19 | 太阳是主要能源 | P1 第 78 页 | FACT | |

### 1.4 模拟运行点（SIM，PLATE 读数）

情景："晴天上午，一盆浇过水的辣椒。"

| key EN / ZH | unit | idle（夜里） | run（晴天上午） | lag s | decimals | 依据 |
|---|---|---|---|---|---|---|
| Light / 光照 | W/m² | 0 | 500 | 3 | 0 | 热带上午典型（P12，**待核**） |
| Openings open / 气孔开放 | % | 10 | 80 | 15 | 0 | 示意值（P2：有光时开、暗时多数关） |
| Water up the stem / 茎中上升的水 | mL/h | 2 | 20 | 20 | 0 | 盆栽辣椒白天蒸腾量级（P13，**待核**；核不到就改"相对值"并去掉单位） |
| Water used to make food / 用于造食物的水 | mL/h | 0 | 0.4 | 20 | 1 | = 20 × 2 %（F-12 的中值），**在这个模拟里** |

规格行（≤ 4，typical）：Height · ≈ 0.55 m（design）；Flower · 5 petals · 5 stamens · 1 pistil；Fruit · berry, green → red；Life cycle · seed → flowers ≈ 2–3 months。

---

## 2. 写实与参考

### 2.1 Tier-1（不认识的人一眼要认出"这是一盆辣椒"）

| Tier-1 | 必须对上 | 参考 |
|---|---|---|
| 株形 | 一根主茎在约 15–20 cm 处二叉分枝，之后反复二叉（辣椒典型的"双叉"株形，P8 **待核**）；叶互生、卵形至披针形、全缘、有长叶柄 | R1、R2 |
| 花 | 单生于分叉处、下垂或斜向下；白色星形 5 裂花冠；中央一圈带蓝紫色花药的雄蕊围着一根柱头 | R3 |
| 果 | 同株上青果与红果并存，下垂、长锥形 | R1 |
| 根 | 一条较粗的主根 + 许多侧根 + 细根，须根团占满盆的下半部 | R4 |
| 叶脉 | 一条主脉、羽状侧脉 | R2 |
| 茎横切 | 表皮、皮层、一圈维管束、中央髓（双子叶茎的标准切面） | R5 |
| 叶横切 | 上表皮、栅栏组织（竖长细胞一排）、海绵组织、下表皮与气孔 | R6 |

### 2.2 程序化建模

- 主茎、分枝、叶柄、根：`sweep`（变径、圆截面，节处 `rings` 轻微环沟）；侧根与细根用 `repeat`（`radius` 绕主根一圈）+ 每件 `extra` 几段 sweep。
- 叶：`wing`（`outline` 卵形，`veins` 主脉 + 羽状侧脉，`thickness` 0.002 U）；一个零件用 `extra` 放 8–12 片（≤ 16），两件叶子零件分上 / 下层，按真实叶序排。
- 花：花瓣 `wing` `repeat` radius 5；花萼 `lathe` 小杯；雄蕊 = 花丝 sweep + 花药 capsule `repeat` radius 5；雌蕊 = 柱头 sphere `scale` 扁 + 花柱 sweep + 子房 `lathe`。
- 果：`lathe` 长锥形 + `scale`；红果 / 青果两个零件（`tint`）。
- 茎内的两种管：主茎内部 8 条 `sweep` 细管（输水管），外侧 8 条更细的（输食管），`shell` 让 X-RAY / 剖切看得到；叶柄与叶脉里不另建管（流沿叶脉走）。
- 标本：叶片切块用 `box`（表皮）+ `capsule` `repeat`（栅栏细胞）+ `sphere` `repeat`（海绵细胞，用 `scale` 不规则）+ 两个保卫细胞（`sweep` 豆形）；茎、根横切用 `lathe` 盘 + `repeat` 维管束；花剖面 = 主花的放大副本做半边（`extra` 只建一半）。
- 材质：`tissue`（植物组织）+ 物种本色 `tint`（叶绿、茎绿、根淡褐、花白、花药蓝紫、红果、青果）；保卫细胞、栅栏细胞里的叶绿体用 `tissue` 深绿 tint。颜色只用 token 或 `tint`（docs/14 惯例）。

### 2.3 参考图（`scripts/geo/plant/refs/`，gitignore，不发布）

| # | 来源 | 许可 | 看什么 |
|---|---|---|---|
| R1 | Commons `Category:Capsicum annuum (plants)`（具体文件 **待核**） | CC BY / BY-SA | 株形、果的姿态、青红并存 |
| R2 | Commons `Category:Capsicum annuum (leaves)` | 同上 | 叶形、叶脉、叶柄长度 |
| R3 | Commons `Category:Capsicum annuum (flowers)` | 同上 | 花冠裂片数、花药颜色、花的朝向 |
| R4 | 根系照片或图（Commons 盆栽辣椒根团，**待核**） | 同上 | 主根与须根比例 |
| R5 | Commons 双子叶茎横切显微照片（如 *Helianthus* stem cross section） | CC BY-SA | 维管束圈 |
| R6 | Commons 叶横切显微照片（如 *Ligustrum* leaf cross section）、气孔显微照片 | CC BY-SA | 叶片分层、气孔 |
| R7 | Commons 绿豆萌发系列照片 | CC | 萌发各阶段 |
| R8 | Köhler's *Medizinal-Pflanzen*（1887）或其他公有领域植物图版中的 *Capsicum annuum* | 公有领域 | 植物学图版的部件画法 |
| R9 | NParks Flora & Fauna Web：*Capsicum annuum*、*Pterocarpus indicus*、*Impatiens balsamina* 条目照片（© NParks，只本地对照） | © | 本地常见形态 |

---

## 3. 零件（35 个 + 4 个 context）

### 3.1 坐标与分区

`units: { modelUnit: "cm", scale: 50 }`；盆底 y = 0，土面 y ≈ 0.36 U（18 cm 高的盆），植株顶 y ≈ 1.46 U。+X 右、+Z 朝观者。标本台在植株右侧 x 0.9–1.8；萌发与传播标本盘在前方 z +0.7 一排（左 → 右 = 早 → 晚）。

| 分区 | 组 id | EN / ZH | 组色 | 卡 |
|---|---|---|---|---|
| 01 | `roots` | Roots / 根 | `token:bone` | ✓ |
| 02 | `stem` | Stem / 茎 | `token:muscle-3` | ✓ |
| 03 | `leaves` | Leaves / 叶 | `token:food` | ✓ |
| 04 | `flowers-fruit` | Flowers and fruit / 花与果 | `token:hot` | ✓ |
| 05 | `close-ups` | Close-ups / 放大标本 | `token:ink-2` | `card: false` |
| 06 | `growth` | Seed to plant / 从种子到植物 | `token:ink-3` | `card: false` |
| 07 | `dispersal` | Seeds on the move / 种子的传播 | `token:ink-3` | `card: false` |
| — | `transport` | Water and food / 水与食物 | 只有流 | — |
| — | `photosynthesis` | Making food / 造食物 | 只有流 | — |
| — | `pollination` | Pollination / 传粉 | 只有流 | — |

右上卡 4 列 = 根 → 茎 → 叶 → 花与果（P4 课纲的"部分与功能"本身就是这条链）。

### 3.2 零件表

| # | id | 组 | primitive（+ extra） | 材质 | explode | connects | shell | summary 要点 |
|---|---|---|---|---|---|---|---|---|
| 01 | `taproot` | roots | sweep 变径，向下 0.3 U | `tissue` 淡褐 | 下 0.25 | lateral-roots, main-stem | | 把植物固定在土里 |
| 02 | `lateral-roots` | roots | sweep `repeat` radius 6 + extra 二级根 | 同上 | 下外 0.2 | fine-roots | | 向四周伸展，抓住更多的土 |
| 03 | `fine-roots` | roots | sweep 细根团（extra ×16） | 同上浅一档 | 下外 0.2 | — | | 带根毛，吸收水和矿物盐 |
| 04 | `main-stem` | stem | sweep 变径 + `rings`（节） | `tissue` 茎绿 | — | branches, stem-water-tubes | ✓ | 撑起植株、连接根与叶 |
| 05 | `branches` | stem | sweep 二叉分枝 ×6（extra） | 同上 | 上 0.1 | petioles | ✓ | 把叶和花托到光里 |
| 06 | `petioles` | stem | sweep 叶柄 ×16（extra） | 同上 | 外 0.05 | leaves-lower, leaves-upper | | 连接叶片与茎 |
| 07 | `stem-water-tubes` | stem | sweep ×8 绕茎心一圈（主茎内，`repeat` radius） | `tissue` 淡蓝灰 tint | — | petioles | | 输水管：水和矿物盐向上 |
| 08 | `stem-food-tubes` | stem | sweep ×8 更细，在输水管外侧 | `tissue` 赭黄 tint | — | taproot, fruit-green | | 输食管：糖送往各处 |
| 09 | `leaves-lower` | leaves | wing ×10（extra），卵形、羽状脉 | `tissue` 深叶绿 | 外 0.08 | — | | 造食物的主要地方 |
| 10 | `leaves-upper` | leaves | wing ×10，较小较嫩 | `tissue` 嫩绿 | 外 0.08 | — | | 新叶 |
| 11 | `flower-bud` | flowers-fruit | sphere `scale` + lathe 萼 ×3 | `tissue` 白绿 | 外 0.06 | flower | | 将要开的花 |
| 12 | `flower` | flowers-fruit | 花瓣 wing `repeat` radius 5 | `tissue` 白 | 外 0.06 | stamens, pistil | | 开放的花，吸引昆虫来访 |
| 13 | `sepals` | flowers-fruit | lathe 小杯 + 5 齿 | `tissue` 绿 | 外 0.05 | flower | | 花开前包住、保护花蕾 |
| 14 | `stamens` | flowers-fruit | 花丝 sweep + 花药 capsule `repeat` radius 5 | `tissue` 白 / 蓝紫 tint | 外 0.04 | pistil | | 雄蕊：花药产生花粉 |
| 15 | `pistil` | flowers-fruit | 柱头 sphere + 花柱 sweep + 子房 lathe | `tissue` 淡绿 | 外 0.04 | fruit-green | | 雌蕊：柱头接住花粉，子房里有胚珠 |
| 16 | `fruit-green` | flowers-fruit | lathe 长锥 ×2（extra） | `tissue` 青 | 下 0.08 | fruit-red | | 正在长大的果实（由子房发育） |
| 17 | `fruit-red` | flowers-fruit | lathe ×2 | `tissue` 红（低饱和） | 下 0.08 | — | | 成熟的果实，里面有种子 |
| 18 | `bee` | flowers-fruit | 程序化小昆虫：capsule 体 + sphere 头 + wing ×2（`bilateral` 不用，extra） | `chitin` 褐黄 tint、`membrane` | — | flower | | 来访的蜜蜂，身上沾着花粉（不是植物的一部分） |
| 19 | `leaf-section` | close-ups | box 上下表皮 + capsule `repeat` 栅栏细胞 + sphere `repeat` 海绵细胞，×200 | `tissue` 绿 / 浅绿 | — | stoma, leaf-vein-section | | 叶片切块（放大 200 倍） |
| 20 | `leaf-vein-section` | close-ups | 叶片切块里的叶脉：两束 sweep（上输水、下输食） | `tissue` 蓝灰 / 赭 | — | leaf-section | | 叶脉里的两种管（放大 200 倍） |
| 21 | `stoma` | close-ups | 两个豆形保卫细胞 sweep + 孔，×800（另放一个） | `tissue` 绿 | — | leaf-section | | 气孔：二氧化碳进、氧出 |
| 22 | `stem-section` | close-ups | lathe 盘（表皮、皮层、髓）+ 维管束 `repeat` radius 8，×15 | `tissue` | — | stem-water-tubes | | 茎的横切（放大 15 倍） |
| 23 | `root-tip` | close-ups | sweep 根尖 + fins / sweep `repeat` 根毛，×30 | `tissue` 淡褐 | — | fine-roots | | 根尖与根毛（放大 30 倍） |
| 24 | `flower-section` | close-ups | 主花的半边副本 ×4：半花瓣、半萼、雄蕊、雌蕊纵切 | `tissue` | — | ovules | | 剖开的花（放大 4 倍） |
| 25 | `ovules` | close-ups | sphere `repeat` 在子房切面内 | `tissue` 乳白 | — | flower-section | | 胚珠：受精后发育成种子 |
| 26 | `pollen-grains` | close-ups | sphere `repeat` ×12，表面刺（`fins` 极小或 `rings`），×400 | `tissue` 黄 | — | stamens | | 花粉粒（放大 400 倍） |
| 27 | `bean-seed` | growth | 绿豆剖面 ×5：种皮壳 lathe（剖开）+ 两片子叶 + 胚 | `tissue` 绿 / 乳黄 | — | bean-sprouting | | 一粒绿豆的里面：种皮、子叶、胚 |
| 28 | `bean-sprouting` | growth | 同上 + 胚根 sweep 伸出 | 同上 | — | bean-seedling | | 吸水后胚根先长出来 |
| 29 | `bean-seedling` | growth | 子叶出土 + 胚芽、两片真叶 wing | 同上 | — | chilli-seedling | | 幼苗：子叶里的养分先用完 |
| 30 | `chilli-seedling` | growth | 辣椒幼苗（2 片子叶 + 2 片真叶） | `tissue` | — | — | | 辣椒的幼苗（young plant） |
| 31 | `winged-fruit` | dispersal | 圆盘翅果（extrude 圆翼 + 中央种子凸起，参照青龙木） | `tissue` 淡褐 | — | — | | 风：翅让果实飘远 |
| 32 | `coconut` | dispersal | 剖开的椰子：纤维层 lathe + 硬壳 + 种子 | `tissue` | — | — | | 水：纤维层里有空气，能漂浮 |
| 33 | `hooked-fruit` | dispersal | sphere + 钩刺 `repeat`（sweep 弯钩） | `tissue` 褐 | — | — | | 动物：钩刺挂在毛上被带走 |
| 34 | `splitting-pod` | dispersal | 豆荚两瓣（lathe 半 ×2）+ 种子 sphere `repeat`；姿态 `pod-split` | `tissue` 褐绿 | — | — | | 弹裂：果荚干裂时把种子弹出去 |
| 35 | `fruit-red-section` | dispersal | 红果纵切副本：果皮 + 胎座 + 种子 `repeat` | `tissue` 红 / 乳黄 | — | fruit-red | | 动物：鸟吃下果实，种子随粪便排出 |
| — | `pot` | context | lathe 花盆（`shell`） | `plastic` 陶土 tint | — | — | ✓ | |
| — | `soil` | context | lathe 土柱（`shell`，剖切露根） | `tissue` 深褐 | — | — | ✓ | |
| — | `lamp` | context | cylinder + cone 灯罩（第 04 章公平测试） | `steel` | — | — | | |
| — | `dark-box` | context | bevelBox 纸箱（盖住第二盆，第 04 章） + 第二盆的 `pot` / 苗（extra） | `plastic` 牛皮纸 tint | — | — | ✓ | |

- 计数理由：植株 18 件（含蜜蜂）对应课纲的"部分"；标本 8 件对应剖面需求；生长 4 件、传播 5 件对应 P3 / P5 / P6。删减顺序（超预算时）：`pollen-grains` 并入 `stamens` 的 detail → `leaves-upper` 并入 `leaves-lower` → `hooked-fruit` 删。
- 预算：静止 calls ≈ 45（`tissue` 多 tint 槽，注意合并）；三角形 < 0.3 M（`repeat` 细胞用低段数 capsule）。

### 3.3 summary / detail 要点（施工写 EN / ZH）

| id | summary | detail 要点 |
|---|---|---|
| fine-roots | Take in water and mineral salts through root hairs. / 用根毛吸收水和矿物盐。 | 根毛是表皮细胞的细长突起，大大增加吸收面积；移栽时根毛受伤，植株会暂时萎蔫 |
| stem-water-tubes | Carry water and mineral salts up from the roots. / 把水和矿物盐从根往上送。 | 中空的死细胞连成的管（xylem，课外词）；只向上；红墨水实验里变红的就是它们（§5 第 03 章） |
| stem-food-tubes | Carry sugar made in the leaves to other parts. / 把叶子造的糖送到植物各处。 | 活细胞组成（phloem，课外词）；送往根、果实、新芽；树皮被环剥一圈，下面的根会缺养分（细看，P2） |
| stoma | Lets carbon dioxide in and oxygen and water vapour out. / 让二氧化碳进来，氧和水蒸气出去。 | 两个保卫细胞围成的小孔，多在叶背（F-8）；有光时多开、暗时多关 |
| pistil | Receives pollen; its ovary holds the ovules. / 接住花粉；子房里有胚珠。 | 柱头、花柱、子房；受精后子房 → 果实、胚珠 → 种子（F-3、§1.2-5） |
| （其余照同一格式：动词开头 ≤ 60 字符；detail 三段：怎样做到 / 典型数字（F-#）/ 受伤、缺水、缺光时会怎样） | | |

---

## 4. 流、动画、剖切、姿态、预设、读数、引擎缺口

### 4.1 颜色语义

| token | 意思 |
|---|---|
| `token:water` | 水（含溶解的矿物盐） |
| `token:food` | 叶子造的糖（"食物"） |
| `token:hot` | 光（从灯 / 太阳到叶子） |
| `token:ink-3` | 二氧化碳 |
| `token:cold` | 氧 |
| `token:neutral` | 水蒸气（叶子蒸发出去的水） |
| `token:cut` | 花粉 |

### 4.2 流（10 条）

| id | group | 路径（按零件） | 约长 U | speed | count | size × | stops | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|---|
| `water-up` | transport | 土 → 细根 → 侧根 → 主根 → 主茎输水管 → 分枝 → 叶柄 → 下层叶主脉 | 1.6 | 0.18 | 420 | 0.5 | water | open | true | fine-roots, lateral-roots, taproot, stem-water-tubes, branches, petioles, leaves-lower |
| `sugar-to-roots` | transport | 叶 → 叶柄 → 主茎输食管（向下）→ 主根 → 侧根 | 1.4 | 0.12 | 300 | 0.5 | food | fade | true | leaves-lower, petioles, stem-food-tubes, taproot, lateral-roots |
| `sugar-to-fruit` | transport | 叶 → 分枝输食管 → 果柄 → 青果 | 0.5 | 0.12 | 120 | 0.5 | food | fade | true | leaves-upper, branches, fruit-green |
| `light` | photosynthesis | 灯 / 太阳方向 → 叶面（多条平行，`spread` 宽） | 0.9 | 0.8 | 260 | 0.4 | hot | fade | false | leaves-upper, leaves-lower |
| `co2-in` | photosynthesis | 空气 → 气孔（标本）→ 海绵组织 → 栅栏细胞 | 0.5 | 0.15 | 160 | 0.6 | ink-3 | fade | false | stoma, leaf-section |
| `o2-out` | photosynthesis | 栅栏细胞 → 海绵组织 → 气孔 → 空气 | 0.5 | 0.15 | 160 | 0.6 | cold | fade | false | leaf-section, stoma |
| `leaf-water` | photosynthesis | 叶脉切面（输水管）→ 栅栏细胞 | 0.3 | 0.1 | 100 | 0.6 | water | open | false | leaf-vein-section, leaf-section |
| `leaf-sugar` | photosynthesis | 栅栏细胞 → 叶脉切面（输食管） | 0.3 | 0.1 | 100 | 0.6 | food | open | false | leaf-section, leaf-vein-section |
| `vapour-out` | photosynthesis | 海绵组织 → 气孔 → 空气（与 o2-out 并行、更疏更快） | 0.5 | 0.3 | 80 | 0.5 | neutral | fade | false | leaf-section, stoma |
| `pollen` | pollination | 花药 → 蜜蜂停留处 → 另一朵花的柱头（弧线） | 0.6 | 0.2 | 60 | 0.8 | cut | fade | true | stamens, bee, pistil |

- 第 04 章同屏的是 `light`、`co2-in`、`o2-out`、`leaf-water`、`leaf-sugar`（5 条）+ 读数；`vapour-out` 只在细看提到的那一拍开。
- 运转 +10 次绘制，章节 `layers` 让同屏 ≤ 6 条。

### 4.3 动画与姿态

| id | target | kind | 参数 | whenRun | 说明 |
|---|---|---|---|---|---|
| `leaf-sway` | leaves-upper, leaves-lower | oscillate + pivot（叶柄基部） | amplitude 3°，hz 0.3 | false | 微风里的轻摆 |
| `bee-visit` | bee | sequence（loop） | offset 关键帧：花 A 上方悬停 → 落到花 A → 飞到花 B → 落下，6 s 一循环 | true | 与 `pollen` 流同步（同一段弧） |
| `stoma-breathe` | stoma | pulse | scale [1.06, 1, 1]，hz 0.2 | true | 保卫细胞的开合示意（真实是分钟级，细看写明） |

| pose | 内容 | 用在 |
|---|---|---|
| `wilted` | leaves-*：绕叶柄基部下垂 −35°；branches 顶端下弯 −10°；flower 下垂 | 第 02 章拍 4（缺水），第 03 章对照 |
| `stomata-closed` | stoma scale [0.6, 1, 1] | 第 04 章拍 5（夜里） |
| `pod-split` | splitting-pod 两瓣绕基部向外翻 60° 并扭转；种子 offset 外抛 | 第 06 章拍 4 |
| `flower-open` | flower-section 两半 offset ±0.05 | 第 05 章拍 3 |
| `lift-out` | 植株全部（roots、stem、leaves、flowers-fruit）offset y +0.35；`soil` hide | 第 02 章拍 1（"把植株从盆里提起来"） |

### 4.4 剖切与模式

- `views.cutaway`：`{ normal: [0,0,-1], offset: 0 }`（切掉盆与土的前半，露出根团；植株细，几乎不受影响）。
- `views.cuts`：`pot`（同上，label "Pot / 盆剖开"）；`stem-cross`（`{ normal: [0,-1,0], offset: 0.55 }`，切掉主茎 27 cm 高度以上，俯视茎的切面看两种管，label "Stem / 茎横切"）；`flower-half`（过主花中心的竖直面，label "Flower / 花纵切"）。
- X-RAY：shell = pot、soil、main-stem、branches、dark-box；茎里的管、盆里的根实心。
- EXPLODED：按 §3.2 方向；标本台与标本盘不动。

### 4.5 镜头预设（≤ 6）

| id | 用途 |
|---|---|
| `hero` | 3/4 前右上，整株 + 盆（封面） |
| `roots` | 盆剖开，平视根团 |
| `stem-close` | 主茎中段近景（配 `stem-cross`） |
| `leaf-bench` | 标本台：叶片切块、气孔 |
| `flower-close` | 主花与花剖面 |
| `tray` | 前方标本盘（萌发 + 传播），抬高俯视（避免互相遮挡，writing-rules 蚱蜢经验） |

### 4.6 引擎缺口

| # | 优先 | 缺口 | 现状（已查） | 最小方案 | 退路 |
|---|---|---|---|---|---|
| E-P1 = B2 | 可选 | **姿态序列**（一拍内播 2–4 个姿态：种子 → 胚根 → 幼苗） | `pose` 是章 / 拍的静态目标；`sequence` 动画能做零件的变换关键帧但只在运转时循环 | 拍字段 `poses: [ {pose, hold} ]` 依次缓动；或 `sequence` 加 `whenBeat` 一次播放 | 标本盘（本 spec 已用） |
| E-P2 | 应该 | **任意 token 的高亮**：`highlight` 现在只有 `signal` / `cold`（`schema.ts` 第 1391 行 `highlightSchema`） | 只能两色 | `highlight: { "<token>": [ids] }`（白名单 token），用于：红墨水染茎（`token:hot` 给 stem-water-tubes）、碘液变蓝黑（`token:ink` 给 leaves）、暗处的苗发黄（`token:bone`） | `signal` 色代"染红"；字幕说明 |
| E-P3 | 应该 | **组级比例尺**（标本的放大倍数）——与 docs/25 E-D5 同一项 | `units` 全主题一个 | 组可写 `units` 覆盖；选中标本时 PLATE 比例尺换成它的实长 | 零件名写"×200"，细看说明 |
| E-P4 | 可选 | 光的**平行射线**表现（`flow.shape: "streak"`，与 docs/24 E-W3 同一项） | 粒子是点 | 同 docs/24 | 点粒子 `spread` 宽 |
| E-P5 | 可选 | context 件上的动画（`bee` 若做成 context） | 动画 target 是否允许 context：**待核**（`schema.ts`） | 允许 | `bee` 做成普通零件（本 spec 已这样写） |

---

## 5. 章节（7 章）

### 5.0 总表

| # | id | 标题 EN / ZH | 年级 | view | run | cutaway | layers（不写 = 全部） | pose | 镜头 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `the-whole-plant` | A whole plant / 一株完整的植物 | P3–P4 | assembled | false | none | roots, stem, leaves, flowers-fruit | — | hero |
| 02 | `roots` | Roots hold on and drink / 根：抓住土、吸收水 | P4 | assembled | true | pot | roots, stem, leaves, close-ups, transport | — | roots |
| 03 | `the-stem` | The stem carries water and food / 茎：支撑与运输 | P4–P5 | xray | true | none | roots, stem, leaves, flowers-fruit, close-ups, transport | — | stem-close |
| 04 | `leaves-make-food` | Leaves make food / 叶子造食物 | P6 | assembled | true | none | leaves, stem, close-ups, photosynthesis | — | leaf-bench |
| 05 | `flowers-and-pollination` | Flowers, pollination and fertilisation / 花、传粉与受精 | P5 | assembled | true | none | flowers-fruit, stem, leaves, close-ups, pollination | — | flower-close |
| 06 | `fruits-and-seeds` | Fruits and seeds on the move / 果实与种子的传播 | P5–P6 | assembled | false | none | flowers-fruit, dispersal, close-ups | — | tray |
| 07 | `seed-to-plant` | From seed to plant / 从种子到植物 | P3、P5 | assembled | false | none | growth, roots, stem, leaves, flowers-fruit | — | tray |

### 5.1 各章

**01 `the-whole-plant`**（P1 第 56 页；P3 第 42 页的"成株"）
- summary：A chilli plant has roots, a stem, leaves and flowers, and each part has its own job. / 一株辣椒有根、茎、叶和花，每个部分各有各的功能。
- 正文提纲：四个部分一句一个（F-1）；它们一起组成一个系统（课纲 About Systems）；为什么选辣椒（§0-1）；模型尺度与放大标本（§0-5）。
- 节拍：

| 拍 | state | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | hero | A chilli plant in a pot, about half a metre tall, with flowers and fruit at the same time. / 一盆辣椒，约半米高，同时开着花、挂着果。 |
| 2 | X-RAY 盆；labels taproot, lateral-roots | Under the soil, the roots hold the plant in place and take in water. / 土下面，根把植物固定住，并吸收水分。 |
| 3 | labels main-stem, branches | The stem holds the leaves and flowers up towards the light. / 茎把叶和花托起来，朝向光。 |
| 4 | labels leaves-lower, leaves-upper | The leaves make the plant's food. / 叶子为植物制造食物。 |
| 5 | labels flower, fruit-green, fruit-red | The flowers make seeds, which grow inside the fruit. / 花产生种子，种子长在果实里。 |

- 细看：`Why a chilli plant`；`What the close-ups are`（放大倍数）；`Plants are living things`（P3 Diversity：需要水、空气、养分，会生长、繁殖）。
- **试一试**：在家里或楼下找一株植物，指出它的根（看不见时想一想在哪里）、茎、叶、花或果。
- 索引：taproot, lateral-roots, main-stem, branches, leaves-lower, leaves-upper, flower, fruit-green, fruit-red。
- 名词首现：`root`、`stem`、`leaf`、`flower`。

**02 `roots`**
- summary：Roots anchor the plant and take in water and mineral salts through tiny root hairs. / 根把植物固定在土里，并通过细小的根毛吸收水和矿物盐。
- 正文提纲：主根、侧根、细根；根毛与面积；水和矿物盐；拔起来看根团（`lift-out`）；缺水萎蔫（`wilted`）。
- 节拍（4）：`pot` 剖切看根团 → `lift-out` 姿态（字幕："根团的大小和地上部分差不多"——**待核**，核不到就删这一说法）→ `root-tip` 标本（根毛）+ `water-up` 流第一次出现（"蓝点是水"）→ `wilted` 姿态（"盆土干了，叶子下垂"）。
- 细看：`Root hairs`；`Mineral salts`；`Why repotting makes a plant droop`。
- **试一试（公平测试）**：两盆一样的小苗，一盆照常浇水、一盆三天不浇，其余（光、位置、盆土）保持一样；每天同一时间拍照比较叶子。
- 索引：taproot, lateral-roots, fine-roots, root-tip, main-stem。
- 名词首现：`root-hair`、`mineral-salts`。

**03 `the-stem`**（P1 第 57 页）
- summary：Inside the stem, water-carrying tubes take water up and food-carrying tubes take sugar to the rest of the plant. / 茎里面，输水管把水往上送，输食管把糖送到植物各处。
- 正文提纲：茎的支撑；两种管（F-10、F-11，位置不作要点）；水向上、糖可上可下；红墨水实验（经典 P5 实验）。
- 节拍（5）：X-RAY 看茎里的管 → `stem-cross` 剖切俯视切面 + `stem-section` 标本 → `water-up` 流（水向上）→ `sugar-to-roots` + `sugar-to-fruit`（第一次说"赭绿是糖"）→ E-P2 高亮输水管为红（"把切下的枝插在红墨水里，几小时后输水管变红"）。
- 细看：`Tubes have names`（xylem / phloem，课外）；`Ring-barking`（P2）；`Up only, or both ways`。
- **试一试**：把一段带叶的芹菜（或白色的花）插进加了食用色素的水里，半天后横切茎，数一数染色的小点。写下：改变了什么（有无色素）、保持什么不变。
- 索引：main-stem, stem-water-tubes, stem-food-tubes, stem-section, petioles, fruit-green。
- 名词首现：`water-carrying-tubes`、`food-carrying-tubes`。

**04 `leaves-make-food`**（P1 第 78 页）
- summary：With light, water and carbon dioxide, the green parts of leaves make sugar and give out oxygen. / 叶子的绿色部分利用光、水和二氧化碳制造糖，并放出氧。
- 正文提纲：光合作用的输入与输出（课纲词）；叶绿素；气孔；叶的分层；糖的去向（运输与淀粉储存，F-13）；植物也呼吸（§1.2-4）；太阳是主要能源（F-19）。
- 节拍（5）：植株 + `light` 流（"暖黄色是光"）→ `leaf-bench` 叶片切块（栅栏细胞里的叶绿体）→ `co2-in` + `leaf-water`（"深灰是二氧化碳，蓝是水"）→ `leaf-sugar` + `o2-out`（"赭绿是糖，浅青是氧"）→ `stomata-closed`，灯关（读数回夜间值："没有光，就不造糖了；呼吸日夜都在进行"）。
- 细看：`Not all the water is used`（F-12，在这个模拟里 2 %）；`Plants breathe too`；`The starch test`（F-14：只描述、需老师带）。
- **试一试（公平测试，PSLE 常考）**：两盆一样的苗，一盆放窗边、一盆用纸箱盖住（`dark-box`），其余条件相同；一周后比较颜色与高度。写下自变量（光）与要保持不变的量（水、盆、苗的大小）。
- 索引：leaves-lower, leaf-section, leaf-vein-section, stoma, stem-food-tubes。
- 名词首现：`photosynthesis`、`chlorophyll`、`stomata`。

**05 `flowers-and-pollination`**（P1 第 43–45 页）
- summary：Pollen moves from anther to stigma; then a male cell joins a female cell in the ovule, and a seed begins. / 花粉从花药落到柱头上；随后雄性生殖细胞与胚珠里的雌性生殖细胞融合，种子开始形成。
- 正文提纲：花的部分（F-3）；传粉（课纲词，不分自花异花）；昆虫来访；受精（课纲 Note 的定义，不讲花粉管与位置）；子房 → 果实、胚珠 → 种子；与人的受精相似（P5 课纲第 45 页，一句，照课纲边界）。
- 节拍（5）：主花近景 → `flower-open` 花剖面（雄蕊、雌蕊、子房、胚珠）→ `pollen-grains` 标本 → `bee-visit` + `pollen` 流（"花粉跟着蜜蜂到了另一朵花的柱头上"）→ 青果（"子房长成果实"）。
- 细看：`Parts of a flower`；`Chilli flowers can pollinate themselves`（F-6，用平实说法、不用课纲不要求的术语）；`Plants and people`（课纲的相似点）。
- **试一试**：用放大镜看一朵花（木槿、辣椒花都行），找出花药、柱头；用棉签轻触花药，看看沾下的花粉。
- 索引：flower, sepals, stamens, pistil, flower-section, ovules, pollen-grains, bee, fruit-green。
- 名词首现：`stamen`、`pistil`、`pollination`、`fertilisation`、`ovule`。

**06 `fruits-and-seeds`**（P1 第 43、69 页）
- summary：Seeds are spread by wind, water, animals or by the fruit splitting open, and the shape of a fruit helps. / 种子靠风、水、动物或果实裂开来传播，果实的结构帮助传播。
- 正文提纲：果实保护种子；四种方式与结构（F-18）；辣椒与鸟（F-7）；为什么要散开（不写目的论："散得远的种子落在亲本旁边以外的地方，少了与亲本争光和水"）。
- 节拍（5）：`fruit-red-section`（"一只红辣椒里有几十粒种子"——数量 **待核**）→ 翅果（风）→ 椰子（水）→ `pod-split`（弹裂）→ 钩果与辣椒（动物）。
- 细看：`Birds and chillies`（F-7）；`Angsana pods in Singapore`（青龙木，NParks）；`Structure helps dispersal`（P6 适应）。
- **试一试**：收集三种不同的种子或果实（如青龙木翅果、豆荚、椰子纤维），猜它们靠什么传播，再从一样高处让它们落下，比较落地的距离。
- 索引：fruit-red, fruit-red-section, winged-fruit, coconut, hooked-fruit, splitting-pod。
- 名词首现：`fruit`、`seed`、`seed-dispersal`。

**07 `seed-to-plant`**（P3 第 42 页；P5 第 43 页萌发）
- summary：A seed needs water, air and warmth to germinate; it grows into a young plant and then an adult plant that flowers. / 种子要有水、空气和适宜的温度才能萌发，长成幼苗，再长成能开花的成株。
- 正文提纲：绿豆的里面（F-17）；萌发条件（F-15，光不是必要条件）；胚根先出（F-16）；子叶的养分；辣椒的幼苗 → 成株 → 开花结果 → 新的种子（F-5），回到生命周期。
- 节拍（5）：`bean-seed` 剖面 → `bean-sprouting`（"吸水后胚根先长出来"）→ `bean-seedling` → `chilli-seedling`（"这是辣椒的幼苗"）→ 镜头回到主株 hero（"成株开花结果，果实里又有了种子"）。
- 细看：`Light is not needed to germinate`；`Seed leaves feed the seedling`；`A green bean is not a chilli`（§0-2）。
- **试一试（公平测试，P3 经典）**：四个杯子各放 5 粒绿豆：湿棉花 / 干棉花 / 湿棉花放冰箱 / 湿棉花完全泡在煮过放凉的水里（少空气），其余相同；三天后数发芽的粒数，填一张表。
- 索引：bean-seed, bean-sprouting, bean-seedling, chilli-seedling, flower, fruit-red。
- 名词首现：`germination`、`seed-leaves`、`life-cycle`。

---

## 6. 名词表 `glossary.json`（候选 15）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `root-hair` | root hair / 根毛 | 根表皮的细长突起，增大吸收面积 | mineral-salts |
| `mineral-salts` | mineral salts / 矿物盐 | 溶在水里、从土里吸收的养分 | root-hair |
| `water-carrying-tubes` | water-carrying tubes / 输水管 | 把水和矿物盐向上运送的管（xylem，木质部，课外词） | food-carrying-tubes |
| `food-carrying-tubes` | food-carrying tubes / 输食管 | 把糖运往各处的管（phloem，韧皮部，课外词） | water-carrying-tubes |
| `photosynthesis` | photosynthesis / 光合作用 | 用光、水、二氧化碳在有叶绿素处造糖并放出氧 | chlorophyll, stomata |
| `chlorophyll` | chlorophyll / 叶绿素 | 植物绿色部分里吸收光的绿色物质 | photosynthesis |
| `stomata` | stomata / 气孔 | 叶上的小孔，气体进出（课纲不要求此词） | photosynthesis |
| `stamen` | stamen / 雄蕊 | 花药 + 花丝，产生花粉 | pollination |
| `pistil` | pistil / 雌蕊 | 柱头、花柱、子房 | ovule |
| `ovule` | ovule / 胚珠 | 子房里，受精后发育成种子 | fertilisation |
| `pollination` | pollination / 传粉 | 花粉从花药到柱头 | fertilisation |
| `fertilisation` | fertilisation / 受精 | 雄性生殖细胞与雌性生殖细胞融合 | ovule |
| `seed-dispersal` | seed dispersal / 种子传播 | 种子离开亲本植株到别处 | fruit |
| `germination` | germination / 萌发 | 种子开始长出胚根与胚芽 | seed-leaves |
| `seed-leaves` | seed leaves / 子叶 | 种子里储存养分的叶状部分 | germination |
| `life-cycle` | life cycle / 生命周期 | 种子 → 幼苗 → 成株 → 种子 | germination |

（`root`、`stem`、`leaf`、`flower`、`fruit`、`seed` 是日常词，第 01 / 06 章首现时视需要收 2–3 个，总数控制在 12–16。）

---

## 7. 来源计划（≥ 15）

| P# | 内容 | 来源 | 用于 |
|---|---|---|---|
| P0 | 本模型研究（设计值、SIM） | 本 spec | 规格行、PLATE |
| P1 | MOE *Science Syllabus Primary 3–6*（2023）：第 20 页表 2、第 42 页 Life Cycles、第 43–45 页 Reproduction、第 56 页 Plant parts、第 57–58 页 Plant transport、第 69 页 adaptations、第 78–79 页 Photosynthesis | docs/17 S3（本地已核页码） | 课纲 |
| P2 | OpenStax *Biology 2e*：第 8 章 Photosynthesis；第 30 章 Plant Form and Physiology（30.2 Stems、30.3 Roots、30.4 Leaves、30.5 Transport）；第 32 章 Plant Reproduction（32.1 花、32.2 传粉与受精、种子与萌发、32.3 传播） | CC BY 4.0 | F-1、F-8–F-15、F-17 |
| P3 | OpenStax *Concepts of Biology* 植物章（交叉核对，CC BY 4.0） | CC BY | 同上 |
| P4 | Taiz, Zeiger et al. *Plant Physiology and Development*（蒸腾与光合用水比例） | 引用事实 | F-12 |
| P5 | 中学 / 小学科学教师用书或 RSB（英国皇家生物学会）的淀粉检验安全说明 | **待核** | F-14 |
| P6 | NParks Flora & Fauna Web：*Pterocarpus indicus*（青龙木翅果）、*Cocos nucifera*、*Impatiens balsamina* | **待核** | F-18、备选 |
| P7 | Kew *Plants of the World Online* / *Flora of China* "Capsicum annuum" 形态描述 | **待核** | F-3、F-4 |
| P8 | Bosland PW, Votava EJ. *Peppers: Vegetable and Spice Capsicums*（CABI）：株形二叉、花、传粉 | 引用事实 | F-2、F-3、F-6、Tier-1 |
| P9 | NParks / 新加坡社区园艺（Community in Bloom、"Gardening with Edibles"）辣椒种植时间 | **待核** | F-2、F-5 |
| P10 | 绿豆萌发：教科书或农业推广资料（FAO / 大学推广站） | **待核** | F-16 |
| P11 | Tewksbury JJ, Nabhan GP. "Directed deterrence by capsaicin in chillies." *Nature* 412, 403–404 (2001) | 摘要（全文可达性 **待核**） | F-7 |
| P12 | 热带太阳辐照典型值（NASA POWER / 教科书） | **待核** | §1.4 |
| P13 | 盆栽辣椒蒸腾量（园艺学论文） | **待核** | §1.4 |
| P14 | Commons 植物解剖显微照片（R5、R6）的页面 | CC BY-SA | 参考 |
| P15 | Köhler's *Medizinal-Pflanzen* 1887（公有领域图版） | PD | R8 |
| P16 | MOE / SEAB *PSLE Science (0009) 2026*：评估目标 II（公平测试、读表） | docs/17 S6 | "试一试"的写法 |

---

## 8. 图像清单（给 Codex）

风格与流程同 docs/24 §8。

### 8.1 首页图版 `genimg/roadmap/plant.png`：**换（定了物种之后）**

已看：一株通用的开花草本（锯齿叶、5 瓣花）+ 花纵切 + 一颗罂粟式蒴果和种子。画得好，但**果实是罂粟式蒴果，与花和植株不是同一种植物**，与本主题选定的辣椒（浆果）对不上。若 §0-1 定辣椒，重画 SUBJECT：

> a whole chilli pepper plant drawn as a botanical plate: the plant lifted out of its pot so the full root ball is visible with a taproot, side roots and fine root hairs; a slender stem branching in pairs; smooth oval leaves with a central vein and side veins on long leaf stalks; small white star-shaped flowers with five petals hanging below the branch forks; long tapering fruits hanging down, some green and some ripe; beside the plant, one flower cut in half lengthwise showing the stamens around the pistil and the ovary with ovules, and one ripe fruit cut open showing the flat round seeds

若定凤仙花，改写对应的株形、花与果荚。

### 8.2 章节图（8 张）

| id | 章 | 用途 | SUBJECT |
|---|---|---|---|
| `leaf-cross-section` | 04 | 叶的横切 | a magnified block cut from a leaf, as a scientific plate: a thin waxy upper skin, a row of tall column-shaped cells packed with small round green bodies, loosely packed rounded cells with air spaces below, a lower skin with one small pore between two bean-shaped guard cells, and a vein in the middle cut across showing a bundle of tubes, no labels |
| `stoma` | 04 | 气孔 | a highly magnified view of the underside of a leaf: the jigsaw-shaped skin cells and several pores, each pore framed by two bean-shaped guard cells, one pore wide open and one nearly closed, scientific plate |
| `stem-dye` | 03 | 红墨水实验 | a classroom experiment drawn as a plate: a leafy stem standing in a glass beaker of dark-coloured water, and beside it the same stem cut across, the cut face showing a ring of small dark dots where the coloured water travelled up the tubes, a small knife and a hand lens on the bench |
| `bee-on-flower` | 05 | 传粉 | a honeybee visiting a small white five-petalled flower, its hairy body dusted with pollen grains, legs touching the anthers, a second flower nearby with a sticky stigma, scientific natural-history plate |
| `seed-dispersal` | 06 | 四种传播 | a natural-history plate of four kinds of fruits and seeds arranged in a row: a round winged pod like an angsana seed pod drifting in the air, a coconut floating half-submerged in water with its fibrous husk cut to show the air spaces, a small fruit covered in hooked spines caught in animal fur, and a dry bean pod twisting open and flinging its seeds out |
| `germinating-bean` | 07 | 绿豆萌发 | a sequence of five green bean seeds from left to right on damp cotton wool: a dry seed, a swollen seed with its coat splitting, a seed with a short white root, a seedling with its root growing down and a hooked shoot, and a young seedling standing up with two seed leaves and two small true leaves, botanical plate |
| `light-fair-test` | 04 | 公平测试 | two identical potted seedlings side by side on a windowsill, one in the light growing green and upright, the other under an upturned cardboard box shown cut away, growing pale, thin and tall, a ruler standing between the pots, drawn as a scientific plate, no text |
| `chilli-life-cycle` | 07 | 生命周期 | the life cycle of a chilli plant arranged in a ring: a seed, a sprouting seed, a seedling with two seed leaves, a young plant, an adult plant with white flowers, and a ripe fruit cut open to show its seeds, with fine curved arrows linking the stages in order, botanical plate, no text |

图数：首页 1（重画）+ 章节 8 = 9 张。

---

## 9. 施工顺序、分工、工作量

| 步 | 内容 | 谁 | 完成标准 |
|---|---|---|---|
| 0 | spec 定稿（物种、两种植物、尺度） | Gavin | §0 回填 |
| 1 | 参考图 R1–R9；脚手架 `pnpm tsx scripts/new-topic.ts plant --engine space-scene --subject biology --title-en "A plant" --title-zh "一株植物"` | 主会话 | validate 绿 |
| E | E-P2（高亮任意 token）、E-P3（组级比例尺，与 docs/25 E-D5 合做一次）；E-P1 / P4 / P5 视时间 | Opus（引擎） | 单测；grasshopper、muscles-* 截图不回归；docs/06 |
| D | `parts.json`（35 + 4）；R2 几何：整株与 R1–R3 并排两轮（株形二叉、花朝下、青红果）→ 标本与 R5–R6 并排 → R3 材质（叶绿几档在 paper / cinema 下分得开）→ R4 流 | Opus（几何） | `pnpm shoot plant` 自证；calls 静止 < 50、运转 < 60 |
| T | `sources.json`、`glossary.json`、零件文本、7 章正文；样章 = 第 03 章（运输） | Opus（事实与文字）；Codex 起草 detail 初稿 | 待核清零 |
| I | §8 九张图 | Codex | 主会话逐张看 |
| B | 7 章节拍 | Sonnet | `--beats` 0 失败；标本盘镜头不互相遮挡 |
| P | 审计、HUD、模式组合 | Sonnet（QA） | acceptance 全勾 |

工作量：**M–L**（docs/17）。几何是大头：株形、花、10 余种标本；引擎缺口小（E-P2、E-P3 各约半天）。docs/04 的"植物的身体 · Layer2D"行在定稿后改为本 spec（Model3D，P3–P6 五课题）。

---

## 10. 验收

`atlas-space-topic/references/acceptance.md` 全部打勾，门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`；`pnpm shoot plant --layout --keys --beats`，EN / ZH × paper / cinema）。本主题另加：

- [ ] hero-clean 一眼看得出是一盆辣椒（二叉株形、下垂白花、青红果并存）。
- [ ] 主线只用课纲词（输水管 / 输食管、叶上的小孔）；xylem / phloem / stomata 只在细看与名词表；没有把"两种管的相对位置"写成要点。
- [ ] 第 04 章的五条流颜色各一义，字幕在第一次出现时说图例；"植物也呼吸"的细看在。
- [ ] 每个放大标本的倍数写在名称与 summary 里；萌发标本写明是绿豆。
- [ ] 每章一个"试一试"，第 02、03、04、07 章写成公平测试（改变什么、保持什么、量什么）；碘液检验只描述、不作家庭实验。
- [ ] 传播例子（青龙木、椰子、凤仙 / 豆荚、辣椒与鸟）逐个有来源。
- [ ] 无拟人、无目的论。
