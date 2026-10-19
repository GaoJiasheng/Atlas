# 33 · 蚊子与生活史 · 内容施工 spec（`mosquito`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 + docs/30、docs/31 的"实验台"：**一张标本台**，左边一只放大约 200 倍的雌性埃及伊蚊成虫（旁边一只雄蚊作对照），右边一只同样放大的**玻璃浅皿**，皿里按生活史的顺序绕一圈摆着：贴在水面上方皿壁的卵、四个龄期倒挂在水面下的幼虫（孑孓）、逗号形的蛹、正从蛹壳里钻到水面上的成虫；小点组成的"环"沿着这一圈走，再从皿里出来回到成虫、回到卵。台的另一头是一个按实物大小画的**新加坡家居一角**（花盆和底盘、水桶、花瓶、一段屋顶檐槽），讲积水在哪里、NEA 的 B-L-O-C-K 怎么做。本主题的任务：**P3 学生看完能说出蚊子一生的四个阶段和顺序（卵 → 幼虫 → 蛹 → 成虫），知道前三个阶段离不开水、各在水的哪里、幼虫吃东西而蛹不吃；知道昆虫靠蜕皮一步一步长大；能把蚊子的四阶段生活史和蝗虫的三阶段生活史对照；知道只有雌蚊叮人、为什么；能说出骨痛热症（登革热）的主要征兆和预防办法，并说清"清除积水"为什么能打断这一圈。**

`subject: biology`；对应 2023 课纲 P3 *Cycles in Plants and Animals (Life Cycles)*（S2 第 42 页，课纲点名的七种动物之一就是蚊子）、P3 *Diversity of Living and Non-Living Things*（第 38 页，昆虫）和 2024 PE 课纲 P3 *Mosquito-borne Diseases*（S3 第 96 页）。docs/17 §6 #5 的 brief（"一只蚊子"，L）与 §7 B1（循环布局）、B2（姿态序列）、B12（水面）。

2026-10-19 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/30 / docs/31（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。事实来自 Codex 的研究（`art/codex-research/mosquito/mosquito-research.md` 与 `facts.json`，476 条，2026-10-19 完成，下文 R-ID 指它的行号，如 BIO-11）和起草时本人读过的原文（MOE 两份课纲 PDF、NEA 伊蚊页、NEA 滋生处页、NEA 双语传单）；标"待核"的施工代理读原文核对后才能用，核不到就换值或删掉。

蝗虫主题（`grasshopper`，docs/14，已发布）已经讲透的昆虫基础——外骨骼、三部分身体、六条足、复眼、蜕皮、若虫与不完全变态——本主题**不重讲**，用一句话 + `<TopicLink slug="grasshopper" ch="…">` 链过去；本主题只讲蚊子不一样的地方。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 一张标本台**，三区（§3.1）：① 成虫区：一只雌性**埃及伊蚊** *Aedes aegypti* 成虫（主标本，站立静息、翅叠在腹上）+ 一只雄蚊（触角、触须对照）；② 水皿区：一只直径约 40 mm 的玻璃浅皿，水深约 9 mm，皿里沿一圈摆 7 个站位（卵 → 一龄 → 二龄 → 三龄 → 四龄 → 蛹 → 正在羽化的成虫），成虫区就是这一圈的第 8 站；③ 家居一角（另按实物大小画，§0-D4）：一盆植物（干硬的泥土）和花盆底盘、一只水桶、一只插花的花瓶、一段带叶片堵塞的屋顶檐槽，地面和一面墙。**模型研究**，不是某一只标本的扫描；无品牌、无文字（皿边的尺只有刻度）。标题块 `note`：EN "Model study · mosquito and young drawn about 200× life size · stages arranged round one dish for display · home corner drawn separately" / ZH "示意模型 · 蚊子与各阶段约放大 200 倍 · 各阶段绕一只皿排成一圈以便观看 · 家居一角另按比例画" | 同意 | 定稿 |
| D2 | **物种**：主标本用埃及伊蚊（新加坡骨痛热症的主要媒介，Project Wolbachia 针对的种，R: WOL-06、DENGUE-01），**雌性**（叮人的是雌蚊；她连接"吸血 → 产卵"）。白纹伊蚊 *Ae. albopictus* 只在第 01 章细看对照（胸背一条白纵纹 vs 埃及伊蚊的竖琴形白纹，R: ANAT-07、ANAT-08）。两种的生活史一样（R: BIO-01） | 同意 | 定稿 |
| D3 | **生活史画成一个环**（docs/17 B1）：环在皿里，俯视顺时针（卵在皿的左壁、离成虫最近）；一条只有流的"环"（墨色小点）沿 7 个站位走，从羽化站爬出皿沿到成虫，再从雌蚊腹端回到卵壁。右上卡换成**生活史环卡**（§4.3，E-M2）：同一个环画成 HUD 墨线，每段写当前水温下的天数、标出"在水里"的几段、高亮当前阶段；第 05 章可并排第二个环（蝗虫：卵 → 若虫 → 成虫）。**皿里所有阶段同时在场**，这本来就是真实容器的样子；"跟着一只孑孓走"由试一试的天数控件和环上的标记圈表达，不让模型变形长大（同蝗虫 docs/14 D5 的取舍）。羽化用 `sequence` 动画（`loop: false`，运转时播一次），不需要 B2 姿态序列 | 同意 | 定稿 |
| D4 | **尺度**：不写 `units`（PLATE 立面读 U）；每个组写 `scale`（docs/14 B10 的组级比例尺）：蚊子四组 `{ unit: mm, magnification: 200 }`（1 场景单位 = 5 mm，比例尺写 `2 MM · ×200`），家居组 `{ unit: cm, magnification: 1 }`（1 场景单位 = 1 m，比例尺写 `20 CM`）。家居一角放在台的另一头、自己的预设镜头里看，**和放大的蚊子不同框**（章节 `layers` 控制）：两种比例同框会读成"一只比水桶还大的蚊子"。规格行、细看写实长（mm）。不需要引擎改动 | 同意 | 定稿 |
| D5 | **天数要有温度**：卵以外各阶段的天数取一项实验室研究在 20 / 25 / 28 / 32 °C 恒温下测的**雄性**埃及伊蚊（Khan 饲料）各龄与蛹的平均历期（S16，R: BIO-11）；28 °C 时从孵化到成虫 7.23 天。NEA 的"最适条件下卵不到一天孵化、幼虫约四天、蛹约两天"（S4，R: BIO-27）在正文里并列，作为新加坡官方的说法。卵单独讲：新产的卵在 28 °C 下约 61.6 小时发育完（S15，R: BIO-05），之后可以干着等上约九个月（S4），被水淹没才孵化；所以**天数从孵化算起**（第 0 天 = 孵化），卵这一段在环卡上写"等水来"而不写天数。正文写"在一项实验室研究里 / in one laboratory study"、写温度、写"雄性比雌性发育快一点"（S13）。新加坡容器里的真实水温没有来源，不说"新加坡的孑孓七天长成"，只说"新加坡全年温暖"（待核气象局来源，F-38） | 同意 | 定稿 |
| D6 | **引擎：SpaceScene + `sim`，新加一个模型 `kind: 'life-cycle'`**（E-M1）+ 右上**生活史环卡**（E-M2），其余全部复用（试一试卡片、数据表与小图、先猜后看、`visible` / `pose` 绑定、流的 `intensity`、`sequence` 动画、背景章、组级比例尺、`membrane` 水面）。docs/30 D2 说过"不做通用查表模型，SIM 要由模型算出"：这里查的表是**有来源的实测历期**（TYPICAL，每个温度一行，S16），模型只做推导——第 d 天在哪一阶段、各段的累计、隔几天倒一次水会不会有成虫飞出、环转得多快——这些是 SIM，写明"在这个模型里"。同一个模型以后给 P3 课纲点名的其他动物（蝴蝶、青蛙、鸡、甲虫、蟑螂）和植物的生活史复用 | 新 `kind: 'life-cycle'` + E-M1–E-M2（§4），引擎约 2 天 | 定稿 |
| D7 | **必须讲对的九处**（§1.4 误解目录逐条对应）：① 孑孓是蚊子的幼虫，有头、胸、腹，**不是蠕虫**，也不是另一种动物；② **蛹不是"什么都不做"**：它不吃东西，但会呼吸、会翻滚下潜，身体在里面改造成成虫；③ 昆虫靠**蜕皮一步一步长大**，不是一直慢慢变大；成虫不再长大，小蚊子不是"小时候"的蚊子；④ **只有雌蚊叮人**，为了血里的蛋白质产卵；雄蚊和雌蚊都吸植物的糖汁；⑤ 卵**不在水里**，产在水面**上方**的潮湿壁上，可以干着活好几个月——所以只倒水不够，还要擦壁；⑥ 伊蚊在家里**小片的积水**（底盘、水桶、花瓶）里滋生，**不只是脏水、臭水沟**（待核：NEA 关于"清水"的原话，F-42；核不到就只说"小容器里的积水"）；⑦ 蚊子**不是生来就带病毒**：叮过病人的雌蚊约七天后才能传播；**不是每一口都会得骨痛热症**；⑧ 蚊子不是"越暖越快、没有上限"：35 °C 时卵只有约一半能孵化，36 °C 不孵化（S15 表）；⑨ Wolbachia 放的是**雄蚊**，不叮人；它不能代替清除积水 | 同意 | 定稿 |
| D8 | **骨痛热症的写法**：平静、如实、给孩子能做的事。说清怎么传（被感染的雌蚊 → 人；人不是从别人身上直接传的，待核 WHO 原文）、主要征兆（PE 课纲要求，WHO / MOH 原文列的几条，待核 F-37）、"觉得不舒服告诉大人、去看医生"（R: DENGUE-02）；新加坡每年的病例数（2019–2025，§2 F-35）放第 06 章细看的一张小表，死亡人数一句话、带来源，不渲染。**不画病人、不画叮在皮肤上的蚊子、不画血**；"吸血后腹部撑大"只在 X-RAY 下画中肠的形状变化，用 `tissue` 族的低饱和赭色（不是血红），字幕说"腹部撑大"不说"装满血" | 同意 | 定稿 |
| D9 | **章数 6 + 背景章 00**（§5）：00 开始之前 / 01 一只伊蚊 / 02 雌蚊与雄蚊 / 03 卵与孑孓 / 04 从蛹到成虫 / 05 绕一圈 / 06 在家里打断这一圈。试一试在 03、04、05、06（00–02 没有）；**不做测验** | 同意 | 定稿 |
| D10 | **三张试一试**（§4.2、§5）：**T1 天天看**（第 03、04 章）：改"孵化后第几天"（0–8），水温 28 °C 不变，看这一只孑孓在哪一阶段、还有几天变成成虫；环上的标记圈跟着走。**T2 水温**（第 05 章，公平测试的招牌实验）：改水温 20 / 25 / 28 / 32 °C，不变：同样的饲料、同样的密度（S16 的条件），看从孵化到成虫要几天、幼虫几天、蛹几天，记表 + 折线图；先猜后看；环的小点随之变快 / 变慢。**T3 多久倒一次水**（第 06 章）：改"每隔几天把皿里的水倒掉"（2 / 4 / 6 / 8 / 10 / 14 天）、另一个开关"倒水后擦壁"，看"有没有成虫飞走"和"壁上还有没有卵"；皿里的水倒空、孑孓和蛹搁浅在皿底 | 同意 | 定稿 |
| D11 | **新加坡家居与 NEA 用词**：B-L-O-C-K 五步的英文照 NEA 原文（R: BLOCK-B–K），中文照 NEA 双语传单（铲松干硬的泥土 / 清除花盆底盘的积水 / 倒置存放水桶并擦干水桶边缘 / 更换花瓶里的水 / 疏通阻塞的屋顶檐槽并放置 BTI 杀蚊药，S6）；家里最常见的五类滋生处照 NEA 2025 年的排名（S5）。S-A-W（喷杀虫剂、用驱蚊剂、穿长衣长裤）只在细看。**动手的是大人**：字幕写"清除积水 / tip out the water"，细看一句"看到积水告诉家里的大人"（R: PREV-04 的编者说明），不让孩子独自爬高清檐槽 | 同意 | 定稿 |
| D12 | **Project Wolbachia**：第 06 章一拍 + 细看：放的是带 *Wolbachia* 的雄性埃及伊蚊；它们和野外雌蚊交配后卵不孵化，伊蚊变少（S9、S10）；NEA 说放蚊地区埃及伊蚊减少 80–90 %、骨痛热症风险低 70 % 以上（S11），随机对照试验的保护效力 71–72 %（S12）；2026 年覆盖一半家庭（S11）。百分数只写这些来源给的、写清是"放蚊地区"，不说"全新加坡少了 70 %"。中文用"沃尔巴克氏菌"（新加坡报章用法，R: ZH-09） | 同意 | 定稿 |
| D13 | **建模：程序化**（同蝗虫：`sweep`、`wing`、`lathe`、`bilateral`、`extra`、`repeat`、生物材质族），**不用网格**：蚊子的形体是细管、椭球、膜翅，正是 docs/14 B1–B12 那套原语的长项；anatomy-mesh 例外只给人体器官。白鳞片的花纹（胸背竖琴纹、足的白环、腹节白带、触须白端、唇基两簇白鳞）用贴在表面的细 `sweep` / 环做 `extra`，同材质合并成一次绘制，不用贴图。参考图（CDC PHIL 等公有领域照片）只在本地 `scripts/geo/mosquito/refs/`，逐张记许可 | 同意 | 定稿 |
| D14 | **背景章 00**：讲这一课要看什么（四个阶段在一只皿里绕一圈）、昆虫的基础去蝗虫那里看、模型怎么读（200 倍、环、颜色、家居一角另按比例）、骨痛热症是新加坡关心蚊子的原因（一句）。`note` 写模型和数字的来历 | 同意 | 定稿 |
| D15 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人体（不画皮肤、手、病人）/ 血 / 叮咬的近景 / 蚊子"恐怖片"式的大特写镜头 / 杀虫剂喷雾的画面 / 按国家或族群讲病例 / 读者拖动模型里的东西（v2）/ 按龄期变形长大的同一只孑孓（D3） | 同意 | 定稿 |
| D16 | **单位**：长度 mm（标本）、cm（家居）；时间"天 / days"（模型内部小数天，读数保留 1 位）、卵的发育写小时；温度 °C；病例数写整数（千位逗号） | 同意 | 定稿 |
| D17 | **图**：首页图沿用 Codex 草稿 `mosquito.png`；章节图 4 张：`mosquito-water-stages` 重画、`mosquito-larva` 新画、`mosquito-three-life-cycles` 新画、`mosquito-empty-saucer` 沿用（§7） | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。三处是"按惯例代定、Gavin 想改随时改"的：

1. **家居一角放进 3D**（D4）：它和 200 倍的蚊子不同比例，只在第 00 章末拍和第 06 章出现，各用自己的镜头。不要的话删去家居组，B-L-O-C-K 改用 `mosquito-empty-saucer` 一类的配图（第 06 章少 4 拍、少约 12 个零件）。
2. **天数用雄蚊的实验室数据**（D5）：找到的四个温度、分龄、同一实验的数据只有这一份是雄性（S16）；正文写明"雄蚊、实验室、同样的饲料"，并说"雌蚊稍慢"。施工时如果找到同样完整的雌雄合计表（例如 Rueda et al. 1990），换成它，模型不变。
3. **病例与死亡人数**（D8）：每年病例数进第 06 章细看的小表；死亡人数只写一句（如"2020 年最多，32 人"，待核原文）。觉得对 P3 太重就只留病例数。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；2026-10-19 起草时从 PDF 抄录，页码是页脚印的数字）

**S2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"（文件名 `Primary-Science-Syllabus-2023_May24.pdf`，Codex 下载于 `art/codex-research/mosquito/sources/`；起草时用 `pdftotext -layout` 读）。文件声明允许为个人或非商业教育用途复制。

**About Cycles**（第 41 页）

> There are cycles or repeated patterns of change in nature. Understanding cycles, such as life cycles and the water cycle, helps us predict events and processes and to appreciate the Earth as a self-sustaining system that supports life.
>
> Essential Takeaways: • There are repeated patterns of change around us. • Understanding cycles helps us to make predictions about events and processes around us.
>
> Key Inquiry Questions: • What makes a cycle? • How does a cycle help us predict events and processes? • Why are cycles important to life?

**Cycles in Plants and Animals (Life Cycles) (P3)**（第 42 页）

> **Core Ideas**
> • Show an understanding that different living things have different life cycles.
>   - Plants
>   - Animals
>
> **Practices**
> • Observe and compare the life cycles of plants grown from seeds over a period of time.
>
> Note:
> - The focus is on the stages (seed, young plant, adult plant) of flowering plants. Processes in plant reproduction (pollination, fertilisation, seed dispersal and germination) are introduced in the topic of Cycles in Plants and Animals (Reproduction) in P5.
>
> • Observe and compare the life cycles of animals over a period of time (chicken, cockroach, frog, grasshopper, beetle, butterfly, mosquito)
>
> **Values, Ethics and Attitudes**
> • Show curiosity by questioning and exploring the surrounding plants and animals.
> • Show care and concern by being responsible towards plants and animals.

**Diversity of Living and Non-Living Things (General characteristics and classification) (P3)**（第 38 页，本主题用到的部分）

> • Describe the characteristics of living things.
>   - Need water, food and air to survive
>   - Grow, respond and reproduce
>
> • Recognise some broad groups of living things based on similarities and differences.
>   - … Animals (amphibians, birds, fish, insects, mammals, reptiles) …
>
> Practices: • Classify living things into broad groups (in plants and animals) based on similarities and differences of common observable characteristics.
>
> Note: - Recall of names of specific living things (e.g., guppy) and their characteristics (e.g., give birth to young alive) is not required.

**S3**：MOE SDCD，*Physical Education Syllabus, Primary, Secondary & Pre-University*，2024 年起小学实施（起草时下载 PDF 读）。**Primary 3 – Physical Health and Safety**（第 96 页），Personal Hygiene and Self-Care 一栏：

> Mosquito-borne Diseases
> • Understand the signs, symptoms and preventive measures for mosquito-borne diseases.

- 第 42 页**没有**写"不要求"的条目（R: CUR-08）；第 38 页的 Note 说不要求记具体生物的名字和特征。所以：伊蚊、埃及伊蚊、各龄期、平衡棒这些名字是**扩展**，进名词表但不当必记；四个阶段的名字（egg、larva、pupa、adult）和"不同生物有不同的生活史"是主线。
- Foundation：P3 课题不分 Standard / Foundation（第 20 页表 2 的下划线规则只用于 P5–P6），不标。UI 不出现年级（同 docs/29 D3、docs/31）。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 四个阶段的名字、顺序、各在哪里（壁上 / 水里 / 空中）、谁吃东西谁不吃 | 主线（03–05） |
| 生活史是一个**环**、能预测（"隔几天去看会看到什么"） | 主线（05 + T1、T3），对应第 41 页 Essential Takeaways |
| 与蝗虫（三阶段）、蝴蝶（四阶段）对照 | 主线一拍（04、05）+ 配图 + 链 `grasshopper` |
| 昆虫三部分、六条足；伊蚊只有两只翅 + 平衡棒 | 主线（01），昆虫通性一句 + 链 `grasshopper` |
| 蜕皮与龄期 | 主线（03），"龄 / instar"进名词表 |
| 只有雌蚊叮人、为什么；雌雄的触角 | 主线（02） |
| 温度改变发育快慢 | 主线（05，T2 公平测试） |
| 骨痛热症的征兆、怎么传、怎么预防 | 主线（02 一拍、06），PE 第 96 页 |
| B-L-O-C-K 五步 | 主线（06，五拍） |
| Project Wolbachia | 主线一拍 + 细看（06） |
| 病例数、死亡数、S-A-W、BTI 是什么、白纹伊蚊、飞多远、哪一刻最常叮人 | 细看 |
| 口针几根、唾液、胚胎发育小时数、卵的干燥耐受怎么来的 | 细看或零件 detail |
| 血清型、重症登革、疫苗、治疗、按地区的病例群 | 不讲（课纲外，不是 P3 的内容） |
| 其他蚊属（按蚊、库蚊）的生活史差别 | 只在细看一句"有的蚊子把卵产成一块浮在水上"（待核来源；核不到就删） |

### 1.3 读者学到什么（P3 用词）

1. 蚊子是**昆虫**：身体分头、胸、腹三部分，六条足长在胸上；它只有一对翅，后面一对小小的**平衡棒**。
2. 蚊子的**生活史**有四个阶段：**卵 → 幼虫（孑孓）→ 蛹 → 成虫**，然后成虫又产卵，**周而复始**。前三个阶段离不开水。
3. **卵**产在容器内壁、水面稍上方；能干着等好几个月，水涨上来淹没它才孵化。
4. **幼虫**倒挂在水面下，用身体末端的**呼吸管**伸出水面吸气，用嘴边的毛刷吃水里的微小颗粒；它靠**蜕皮**分四步长大（四个**龄期**），第四次蜕皮就变成蛹。
5. **蛹**像个逗号，用背上两根**呼吸角**吸气，**不吃东西**，被惊动会翻滚下潜；成虫在蛹里成形，最后从蛹壳里**钻出来**（羽化）站到水面上。
6. 四个样子完全不同的阶段 = **完全变态**；蝗虫只有三个阶段（卵 → 若虫 → 成虫），没有蛹 = 不完全变态。
7. 水越暖，长得越快：在一项实验室研究里，28 °C 时从孵化到成虫约 7 天，20 °C 时约 13 天。
8. **只有雌蚊叮人**：她需要血里的蛋白质来产卵。被感染的雌蚊能传播**骨痛热症**。
9. 清除家里的积水（**B-L-O-C-K**）能在孑孓和蛹变成成虫之前打断这一圈；卵还在壁上，所以要擦壁、要常常检查。

### 1.4 误解目录（每条至少一拍或一段正文正面讲；R: EDU、CHECK 指 Codex 研究 §5）

没有找到以新加坡 P3 学生为对象、关于蚊子生活史的误解调查（R: §5 开头）。下表是**教学上要正面讲的说法**，依据是正确的生物学和两项海外研究（R: EDU-01–02：孩子熟悉蝴蝶的变态，不等于会迁移到别的昆虫；学过以后又会把"变态"套到不变态的动物上；R: EDU-04：柬埔寨学生知道孑孓，却不一定会去清容器）。正文不写"很多孩子以为……"。

| # | 说法 | 正确的说法 | 哪里纠正 |
|---|---|---|---|
| M-1 | 蚊子只从脏水、臭水沟里来 | 伊蚊在家里**小容器的积水**里滋生：水桶、花盆底盘、花瓶最常见（S5）；水不必脏（F-42 待核） | 06 第 3 拍、细看 |
| M-2 | 孑孓是一种小虫子 / 蠕虫，和蚊子不是一回事 | 孑孓就是蚊子的幼虫，有头、胸、腹；同一只蚊子先后是卵、孑孓、蛹、成虫（R: CHECK-01、ANAT-11–12） | 03 第 3 拍、细看 |
| M-3 | 所有蚊子都叮人 | 只有雌蚊吸血，为了产卵；雄蚊不叮人（S4、S9） | 02 第 3 拍；06 第 7 拍 |
| M-4 | 蛹在睡觉、什么都不做 / 蛹是死的 | 蛹不吃东西，但呼吸、会动，成虫在里面成形（R: BIO-16、CHECK-02） | 04 第 2–3 拍 |
| M-5 | 昆虫一天一天慢慢长大；小蚊子是"小时候"的蚊子 | 幼虫靠蜕皮分步长大（四个龄期）；成虫不再长大（R: BIO-08；成虫不长大待核来源） | 03 第 5 拍、细看 |
| M-6 | 把水倒掉，蚊子就全没了 | 水里的孑孓和蛹会死，但壁上的卵能干着活好几个月（S4、S7）；要擦壁、要常检查（R: CHECK-04） | 06 第 1–2 拍、T3 |
| M-7 | 每只蚊子都带病毒 / 被叮一口就会生病 | 雌蚊叮过病人、约七天后才能传播（S4）；不是每口都会得病（R: CHECK-05、DENGUE-01） | 02 第 5 拍 |
| M-8 | 越热蚊子长得越快，没有上限 | 在 20–32 °C 里越暖越快（S16）；但 35 °C 卵孵化率降到约一半，36 °C 不孵化（S15） | 05 细看 |
| M-9 | 所有昆虫都有蛹 / 都是完全变态 | 蝗虫没有蛹（R: CHECK-03） | 04 第 5 拍、05 第 5 拍 |

### 1.5 PSLE 题型 → 本主题哪里支持

| 题型（P3–P6 科学 Booklet A / B 常见） | 支持 |
|---|---|
| 给出几个阶段的图，排顺序 / 补全环 | 环卡、05 第 1 拍、配图 `mosquito-three-life-cycles` |
| 哪几个阶段在水里、哪个阶段不进食 | 环卡的"在水里"标记；03、04 |
| 幼虫、蛹怎样呼吸（呼吸管、呼吸角），为什么要到水面 | 03 第 3 拍、04 第 1 拍、空气流 |
| 三阶段 vs 四阶段生活史（蝗虫、蟑螂 vs 蚊子、蝴蝶、甲虫） | 04 第 5 拍、05 第 5 拍、配图 |
| 积水被倒掉，哪个阶段受影响；为什么倒水后还要擦 | 06 第 1–2 拍、T3 |
| 读表找规律：温度与发育天数（公平测试：改变 / 不变 / 观察） | T2（表 + 折线图 + 先猜后看） |
| 只有雌蚊吸血的原因；怎样预防骨痛热症（PE） | 02、06 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md` 与 docs/14 §1.3 的生物版：不拟人（"蚊子妈妈"不写）、不写目的论（"为了吸血进化出长喙"→"长喙里的口针能刺进皮肤"）、不喊"小朋友"、无感叹号；不渲染恐惧（"致命的蚊子""杀手"不写），病情如实而克制；不教捕捉、饲养蚊子；动手清积水写成"和家里的大人一起"。中文用新加坡用法（§6.1）：伊蚊、埃及伊蚊、白纹伊蚊、孑孓（第一次写"幼虫（孑孓）"）、蛹、成虫、骨痛热症（第一次写"骨痛热症（登革热）"）、沃尔巴克氏菌、灭蚊行动；引号只用“ ”。英文用新加坡 / 英式拼写（moult、colour、centre）。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 外骨骼、三部分、六足、复眼、蜕皮、若虫、不完全变态、昆虫的内脏系统 | `grasshopper`（01 `whole-animal`、02 `armour-and-senses`、06 `nerves-and-growing-up`） | 00 第 3 拍 + 细看链 `ch="whole-animal"`；03 蜕皮一句链 `ch="nerves-and-growing-up"`；04、05 对照链同章。**谁后发布谁补链接**：本主题发布时给 `grasshopper` 第 06 章细看"Three stages, not four"加一句 `<TopicLink slug="mosquito" ch="round-the-cycle">`（主会话改，内容代理不碰 grasshopper 目录） |
| 植物的生命周期（种子 → 幼苗 → 成株） | `plant` | 05 细看一句"植物也有生命周期"链 `plant` 对应章（施工时查 id） |
| 水的三态、蒸发 | `water` | 06 细看"积水会蒸发吗"一句，链 `ch="the-water-cycle"`（可选） |
| 温度与热 | `aircon` | 不链（本主题的温度只是实验变量） |

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本模型取的值；`SIM` = §4.2 模型的结果。P# → §6.2（施工时变 S#；S1 是设计研究来源）。R: 后面是 Codex 研究的行 ID。"待核" = 起草时没读到原文或来源之间不一致，施工代理读原文定。

### 2.1 物种与成虫

| # | 项 | TYPICAL（来源） | DESIGN / SIM | 待核 |
|---|---|---|---|---|
| F-1 | 分类 | 昆虫纲 → 双翅目 Diptera → 蚊科 Culicidae → 伊蚊属 *Aedes* → 埃及伊蚊 *Ae. aegypti* (Linnaeus)（P13） | 规格行 `INSECTA · DIPTERA · CULICIDAE` | |
| F-2 | 成虫大小 | 一般蚊子约 3–6 mm（P14 Service，泛指蚊子，R: ANAT-14）；UF 页"4 to 7 m"是排印错误，不用（R: §3 开头）；雄蚊翅长 2.16 mm（28 °C、Khan 饲料，P16，R: ANAT-16） | 雌蚊体长（头到腹端，不含喙）4.5 mm = 0.9 场景单位；**R2 按参考照片定比例**（喙、触角、足长都从照片量） | 找一份埃及伊蚊雌蚊体长 / 翅长的实测（施工 T 步） |
| F-3 | 雌雄大小 | 雌蚊比雄蚊大（P13） | 雄蚊画成雌蚊的 0.85 倍（示意） | |
| F-4 | 胸背花纹 | 埃及伊蚊胸背白鳞片成竖琴（lyre）形；白纹伊蚊胸背正中一条白纵纹（P13、P15、P17，R: ANAT-07–08） | 竖琴纹：两条外弯的侧纹 + 两条正中细纹（R2 照片定） | |
| F-5 | 足与腹的白斑 | 后足各跗节基部有白环；腹部深褐到黑，有白鳞（P13，R: ANAT-05）；伊蚊足有白环（P17） | 三对足的跗节白环（后足最明显）；腹节基部白带 + 侧面白斑 | 前、中足白环的位置（照片） |
| F-6 | 触须与触角 | 雌蚊触须短、端部银白；雄蚊触角浓密羽状，雌蚊触角只有稀疏短毛（P13，R: ANAT-02） | 雌触须约为喙长的 1/5（照片定）；雄触须长度照片定 | 雄蚊触须长度（照片） |
| F-7 | 喙与唇基 | 雌雄喙都是深色；唇基有两簇白鳞（P13） | 照画 | |
| F-8 | 翅与平衡棒 | 一对能飞的翅 + 一对棒状平衡棒，平衡棒是后翅变的、帮助保持平衡 / 转向（P14 第 2 页、P18，R: ANAT-03–04） | 静息时两翅平叠在腹背上 | |
| F-9 | 体节 | 成虫腹部 10 节，前 7–8 节明显，末端几节特化为生殖器（P14 第 4 页，R: ANAT-06） | 画 8 个可见腹节 | |
| F-10 | 只有雌蚊叮人 | "Only the female Aedes mosquito bites, as it needs the protein in blood for its eggs to develop."（P4）；雄蚊吸植物汁液、不叮人（P9，R: WOL-02）；雌雄都吸花蜜（P13） | — | |
| F-11 | 产卵 | 吸血后约三天产卵；一生约产三次、每次约 100 粒（P4）；UF：每批平均 100–200 粒、一生最多五批，视吸血量而定（P13） | 正文用 NEA 的说法，细看并列 UF | |
| F-12 | 产卵的位置 | 卵一粒一粒贴在容器内壁、水线以上不同高度；不是浮在水面的卵块（P19 CDC、P13，R: BIO-02）；同一批卵分散产在两处以上（P13） | 皿左壁水线上方一条带上画 12 粒 | |
| F-13 | 卵的颜色 | 刚产下是白色，几分钟内变成亮黑色（P13） | 黑色 `chitin` | |
| F-14 | 叮人的时间 | 两种伊蚊主要白天叮人，在光亮处夜里也会（P17，R: BIO-22）；埃及伊蚊早上和傍晚前两个高峰（P20 WHO，R: BIO-23）；NEA 伊蚊页写"peak biting is at dawn and dusk"（P4） | 细看并列 | |
| F-15 | 飞多远 | 埃及伊蚊可飞到约 400 m 找积水容器，一般在人居附近（P20，R: BIO-24）；CDC："一生只飞几个街区"（P19，R: BIO-25） | 细看 | |
| F-16 | 成虫寿命 | 野外平均约两周（P4，R: BIO-19）；实验室可长得多（R: BIO-20，白纹伊蚊，不用） | 正文"约两周" | |

### 2.2 生活史与天数

| # | 项 | TYPICAL（来源） | DESIGN / SIM | 待核 |
|---|---|---|---|---|
| F-17 | 四阶段、完全变态 | 卵 → 幼虫 → 蛹 → 成虫，完全变态（holometabolous）（P13、P19，R: BIO-01）；不完全变态三阶段：卵 → 若虫 → 成虫（P26 UC IPM，R: CHECK-03；蝗虫 S3） | 环 7 站 + 成虫区 | |
| F-18 | NEA 的时间线 | 最适条件下卵不到一天孵化成幼虫，幼虫约四天变蛹，再两天羽化；叮人吸血后三天产卵（P4，R: BIO-10、17、27）；未写温度 | 正文并列 | |
| F-19 | CDC 的时间线 | 从卵到成虫 7–10 天，未写温度（P19，R: BIO-26） | 细看 | |
| F-20 | **各龄与蛹的历期**（模型数据） | 雄性埃及伊蚊（Bora Bora 品系），Khan 饲料，恒温，平均天数（P16 表 2，R: BIO-11）：**20 °C** L1 2.99 · L2 1.52 · L3 1.62 · L4 3.15 · 蛹 4.04 · 孵化到成虫 13.40；**25 °C** 2.53 · 1.17 · 1.08 · 2.77 · 2.61 · 10.18；**28 °C** 1.88 · 0.68 · 1.00 · 1.82 · 1.86 · 7.23；**32 °C** 1.55 · 0.95 · 0.70 · 1.63 · 1.70 · 6.40（另有 15 °C：27.11，不用） | 进 `sim.lifeCycle.days`（§4.2）；**孵化到成虫用论文的实测总数**，各段按比例缩放到总数（各段 n 不同，平均值之和与总数差 0.01–0.16 天，P16 表注；S1 写明） | 用 IAEA 2 饲料的另一组（R: BIO-12，28 °C 8.11 天）做"饲料也有影响"的细看？——施工时定 |
| F-21 | 雌雄差别 | 雄蚊发育比雌蚊快，一般先化蛹（P13） | 正文一句"雌蚊稍慢" | 雌蚊的数（找到就并列） |
| F-22 | 卵的发育 | 新产的卵 28 °C 下 61.6 ± 1.2 小时（约 2.6 天）完成胚胎发育；25 °C 77.4 h，31 °C 48.4 h，22 °C 98.3 h，16 °C 489.3 h；孵化率 22–28 °C 约 93–96 %，31 °C 83 %，35 °C 49 %，36 °C 不孵化（P21 Farnesi 2009 表，Rockefeller 品系，R: BIO-05–06） | 环卡"卵"段写"约 2½ 天成形，然后等水"；M-8 细看 | |
| F-23 | 卵的耐干 | 干燥下可休眠约九个月，条件合适再孵化（P4，R: BIO-04）；CDC：最多 8 个月（P19，R: BIO-03）；耐干的能力是胚胎发育过程中长出的浆膜角质层带来的，新产的卵还没有（P22，R: BIO-07） | 正文"好几个月 / 约九个月（NEA）" | |
| F-24 | 卵的大小 | 埃及伊蚊卵长 0.634 ± 0.034 mm、宽 0.169 mm（80 % 胚胎发育、去卵壳外层后测，P22 表 1，R: ANAT-09）；UF："约 1 mm"（P13） | 0.63 mm = 0.127 场景单位 | 正文写"不到一毫米"（两个来源都对得上） |
| F-25 | 幼虫 | 四个龄期（P13，R: BIO-08）；倒挂在水面下，身体末端的呼吸管伸出水面，身体几乎竖直下垂；伊蚊的呼吸管短（P13）；嘴边的口刷收集有机颗粒和微生物；幼虫吃、蛹不吃（P13、P14，R: BIO-09）；有头、愈合的三节胸、八节腹、末端的呼吸管和肛鳃，没有分节的足（P14 第 8–9 页，P21 图 2，R: ANAT-11–12）；肛鳃管的是水和盐，不是呼吸（R: ANAT-11） | 照画 | |
| F-26 | 四龄幼虫长度 | 约 8 mm（P13，R: ANAT-13） | L4 体长（头到腹端，不含呼吸管）7.5 mm；L1–L3 的长度**无来源**，画成 2.2 / 3.6 / 5.4 mm（示意，S1 写明、标签不写长度） | 找分龄体长或头壳宽（如 Christophers 1960，P29）；找到就把"头壳宽"做成 T1 的读数和阶梯图（§4.2 `size`） |
| F-27 | 蛹 | 逗号形：圆的头胸部、弯曲分节的腹部，头胸部背上一对呼吸角贴在水面，腹端一对游泳桨；会动、不进食（P14 第 10 页，R: BIO-16）；头胸部里有正在形成的成虫附肢的鞘（P23，R: ANAT-17）；"tumblers"，约两天（P13） | 照画 | |
| F-28 | 蛹的尺寸 | 呼吸角长 0.53–0.69 mm（平均 0.61）；腹部长 2.33–2.95 mm（平均 2.63）；游泳桨 0.78–1.13 mm（平均 0.92，量的方向原文不清）（P23 扫描电镜，实验室品系，R: ANAT-18–20） | 照这些画；头胸部大小按照片与腹部比例 | |
| F-29 | 羽化 | 成虫吞进空气让腹部膨胀，撑裂蛹壳，头先出来（P13，R: BIO-18）；在水面上进行（P19） | `sequence` 动画；画面里的时长是示意，细看写"画面加快了" | 真实羽化要多久（找到再写） |
| F-30 | 蝗虫对照 | 黑角瓦兰蝗：实验室约 28 °C 下整个生活史 6½–8½ 个月；若虫雄 6 龄、雌 7 龄（`grasshopper` S3 Kok 1971） | 05 第 5 拍、细看 | |

### 2.3 新加坡：骨痛热症与预防

| # | 项 | TYPICAL（来源） | 用在 | 待核 |
|---|---|---|---|---|
| F-31 | 怎么传 | 骨痛热症是病毒病，主要由**被感染的**雌性埃及伊蚊传播，白纹伊蚊也能（P24 WHO，R: DENGUE-01）；雌蚊叮了带病毒的人约七天后变得有传染性，病毒在蚊子体内繁殖、到达唾液腺（外潜伏期，P4） | 02 第 5 拍 | 人与人之间不直接传染：读 WHO 原文 |
| F-32 | 病情 | 很多感染没有症状或很轻，有些人会病得很重（P24，R: DENGUE-02） | 06 细看 | |
| F-33 | 征兆 | WHO / MOH 列的主要征兆：突发高烧、严重头痛、眼窝后痛、肌肉和关节痛、恶心呕吐、皮疹等（P24、P25） | 06 第 1 拍前后的正文 + 细看 | **待核**：逐条照 WHO 事实单与 MOH（HealthHub）原文；只写两边都有的 |
| F-34 | 家里最常见的滋生处 | 2025 年 NEA 在住家发现的前五：水桶等家用容器、花盆底盘 / 托盘、花瓶等装饰容器、有地住宅门外的垃圾桶、帆布 / 塑料布；2024 年第五是"植物（干硬的泥土和叶腋）"（P5，R: PREV-01–02） | 06 第 3 拍 | |
| F-35 | 每年病例 | 2019 15,998；2020 35,315（另一份 NEA 报告印 35,266）；2021 5,258；2022 32,173；2023 9,949；2024 13,651；2025 4,036（四个季度之和：1,222 + 1,361 + 874 + 579）（P30–P35，R: DEN-ANNUAL-*、DEN-2025-Q1–4） | 06 细看小表 | 2020 两个数并列；2025 写"四个季度报告之和" |
| F-36 | 每年死亡 | 2019 20；2020 32；2021 5；2022 19；2023 6；2024 17（各年第四季度报告的全年累计，P31–P34） | 06 细看一句 | 2025 全年数（读 Q1–Q3 报告）；Gavin 决定留不留（§0.1-3） |
| F-37 | B-L-O-C-K（英文原文） | **B**reak up hardened soil · **L**ift and empty flowerpot plates · **O**verturn pails and wipe their rims · **C**hange water in vases · **K**eep roof gutters clear and place BTI insecticide inside（P27、P28，R: BLOCK-B–K） | 06 第 4–6 拍 | |
| F-38 | B-L-O-C-K（NEA 中文） | 铲松 干硬的泥土 · 清除 花盆底盘的积水 · 倒置 存放水桶并擦干水桶边缘 · 更换 花瓶里的水 · 疏通 阻塞的屋顶檐槽并放置 BTI 杀蚊药（P6 中文版，起草时看过栅格页） | 06 第 4–6 拍 | |
| F-39 | S-A-W | 喷杀虫剂（检查家中阴暗角落）· 用驱蚊剂（定期防范）· 穿长衣长裤（免蚊虫叮咬）（P6，R: PREV-04） | 06 细看 | 英文原文措辞（读 P6 英文版） |
| F-40 | 检查频率 | NEA 检查清单："Check your home regularly for mosquito breeding." / "定期检查，以防伊蚊在家中滋生"（P7） | 06 正文、T3 细看 | NEA 有没有写"每周至少一次"：找到就用，找不到只说"定期 / regularly" |
| F-41 | BTI | BTI 是一种只杀孑孓的生物杀虫剂（P27 待核） | 06 第 6 拍 | **待核**：NEA 关于 BTI 的原文；找不到就只写"NEA 建议放的杀孑孓药" |
| F-42 | 清水也会滋生 | 伊蚊在清的积水里滋生（待核：NEA 原文） | M-1 | 找不到就只写"小容器里的积水" |
| F-43 | Wolbachia 怎么起作用 | 放带 *Wolbachia* 的雄性埃及伊蚊；它们和没有这种 Wolbachia 的本地雌蚊交配，卵不孵化，下一代变少（P9，R: WOL-01）；雄蚊不吸血、不传骨痛热症（P10，R: WOL-02） | 06 第 7 拍 | |
| F-44 | Wolbachia 的结果 | 放蚊地区埃及伊蚊减少 80–90 %，骨痛热症风险低 70 % 以上（P11，R: WOL-03–04）；整群随机对照试验（15 群，2022–2024 年 24 个月）保护效力 71–72 %（P12 NEJM，R: WOL-05）；2026 年扩展到五个新地区后覆盖约一半家庭、80 多万户（P11、P8）；仍要清除积水（P11，R: WOL-06） | 06 细看 | |
| F-45 | 新加坡的气温 | 年平均气温约 27–28 °C，全年温暖（P36 气象局） | 05 细看"新加坡全年温暖" | **待核**：读气象局原文的数和年份 |

### 2.4 模型（SIM，设计研究来源 S1 的内容；§4.2 的模型算出来的）

全部由 F-20 的实测历期推出，内部自洽：

- **阶段边界**（孵化 = 第 0 天）：28 °C：各段平均之和 1.88 + 0.68 + 1.00 + 1.82 + 1.86 = 7.24，按实测总数 7.23 缩放（× 0.9986）→ L1 [0, 1.877)、L2 [1.877, 2.556)、L3 [2.556, 3.555)、L4 [3.555, 5.372)、蛹 [5.372, 7.23)、≥ 7.23 成虫。**T1 的整数天**：第 0、1 天一龄，第 2 天二龄，第 3 天三龄，第 4、5 天四龄，第 6、7 天蛹，第 8 天成虫。
- **孵化到成虫**（`to-adult`，读数 1 位小数）：20 °C 13.4 · 25 °C 10.2 · 28 °C 7.2 · 32 °C 6.4 天；幼虫期（缩放后）13.40 × 9.28 ÷ 13.32 = 9.34 → 9.3 · 7.57 → 7.6 · 5.38 → 5.4 · 6.40 × 4.83 ÷ 6.53 = 4.73 → 4.7 天；蛹期 4.06 → 4.1 · 2.61 → 2.6 · 1.86 → 1.9 · 1.67 → 1.7 天（幼虫 + 蛹 = 总数）。**正文写论文的数**（13.4、10.2、7.2、6.4），与读数一致；施工时单测钉死这一表。
- **环转得多快**（`rate`）：28 °C = 1；其余 = 7.23 ÷ 该温度的总数：20 °C 0.54、25 °C 0.71、32 °C 1.13。
- **T3 多久倒一次水**（`emptying`）：28 °C 下隔 N 天倒一次：N > 7.23 → 有成虫飞走（`some`），N ≤ 7.23 → 没有（`none`）；步进值 2 / 4 / 6 / 8 / 10 / 14 → none / none / none / some / some / some（不设 7，避开平均值附近的临界点：个体有快有慢，雄快雌慢）。"擦壁"开 → 壁上没有卵（`none`），关 → 还有（`yes`）。这只是按平均历期画的界线，细看写明"有的会快一点，所以 NEA 说要定期检查"。
- 这些数字只出现在试一试卡片、PLATE 读数、环卡（都带 SIM / "在这个模型里"）和细看；正文写取整的"约 7 天 / about a week"。

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） | 卡 | `scale` |
|---|---|---|---|---|---|---|
| 01 | `head` | Head / 头 | 头壳、复眼、触角、触须、喙、口针 | `token:ink-2` | （环卡代替链路卡） | mm × 200 |
| 02 | `thorax` | Thorax / 胸 | 胸、三对足、翅、平衡棒、唾液腺 | `token:ink-3` | | mm × 200 |
| 03 | `abdomen` | Abdomen / 腹 | 腹部外壳、中肠、卵巢 | `token:cut` | | mm × 200 |
| 04 | `male` | Male / 雄蚊 | 雄蚊身体、触角、触须、翅 | `token:neutral` | | mm × 200 |
| 05 | `water-stages` | Life in water / 水中的阶段 | 皿、水、卵、四个龄期、蜕下的皮、蛹、蛹壳、正在羽化的成虫、飞走的成虫；context：标记圈、尺 | `token:accent-2`（`cold` 留给空气流） | | mm × 200 |
| 06 | `home` | Water at home / 家里的积水 | 花盆、泥土（干硬 / 铲松）、底盘与积水、水桶与积水、花瓶与水、屋顶檐槽、落叶、檐槽积水；context：地面与墙 | `token:loop` | | cm × 1 |
| — | `cycle` | Life cycle / 生活史 | 只有流：环上的小点 | `token:ink-3` | | |
| — | `air` | Air / 空气 | 只有流：呼吸管、呼吸角吸进的空气 | `token:cold` | | |
| — | `food` | Food / 食物 | 只有流：孑孓吃进的微粒 | `token:food` | | |

- 右上卡是 E-M2 的**生活史环卡**（§4.3）；退路（E-M2 没做）：零件链路卡，只留 `water-stages` 一列 `connects` 成链（卵 → L1 → … → 羽化），其余组 `card: false`。
- context `bench`（标本台面）不属于任何组；`home-floor`、`home-wall` 属于 `home` 组（受图层开关）；`follow-marker`、`dish-ruler` 属于 `water-stages`。

### 3.2 坐标与尺度

- 单位：场景单位（su）。蚊子各组 1 su = 5 mm（放大 200 倍，组级比例尺写 `×200`）；家居组 1 su = 1 m（实物大小，比例尺写实长）。Y 向上，台面 y = 0；+Z 朝观者。
- **成虫区**（左）：雌蚊中心约 (−2.4, 0.5, 0.6)，头朝 −X，左侧对着观者（同蝗虫的教科书式侧视）；体长 0.9 su（4.5 mm），连喙约 1.3 su；足展约 2.5 su（R2 照片定）。雄蚊在她右后方 (−1.6, 0.45, −1.0)，头朝 −X 略转向观者。
- **水皿区**（右）：皿心 (3.4, 0, −0.4)；内半径 4.0 su（20 mm），壁厚 0.12，壁高 2.1（10.5 mm），水面 y = 1.85（水深约 9 mm）。站位在半径 3.0 的圆上，按钟点（12 点 = −Z 远处，3 点 = +X，6 点 = +Z 近处，9 点 = −X 靠成虫一侧），俯视**顺时针**：

| 站 | 钟点 | 零件 | 中心（su） | 说明 |
|---|---|---|---|---|
| 1 | 9 | `eggs` | 皿左壁内侧 r 3.95，y 1.95–2.08，绕 9 点 ±20° 的弧上 12 粒 | 水线上方 0.5 mm 内一条带；最近成虫 |
| 2 | 10:30 | `larva-l1` | (1.28, 1.85, −2.52) | 呼吸管端点在水面，身体向下 |
| 3 | 12 | `larva-l2` | (3.4, 1.85, −3.4) | 远处，隔水看 |
| 4 | 1:30 | `larva-l3` | (5.52, 1.85, −2.52) | |
| 5 | 3 | `larva-l4` | (6.4, 1.85, −0.4) | 最大的孑孓在右侧，侧面看得清 |
| 6 | 4:30 | `pupa` | (5.52, 1.85, 1.72) | 呼吸角贴水面 |
| 7 | 6 | `pupal-case` + `emerging-adult` | (3.4, 1.85, 2.6) | 最近观者：羽化最显眼 |
| 8 | — | 成虫区 | 雌蚊 | 环的流从 6 点爬出皿沿到雌蚊，再从她腹端回到 9 点的卵壁 |

- 蜕下的皮（`moult-skins`）三片浮在 L2、L3、L4 站旁边的水面；尺（`dish-ruler`）贴在皿前方台面上，40 mm 长，只有刻度（毫米细线、5 mm 稍长）。
- **家居一角**（台的左端，另一块台座上，1 su = 1 m）：中心 (−10, 0, −1)，地面 2.2 × 1.6，后墙高 2.4、墙顶一段屋檐与檐槽（长 1.2，离地 2.3），地上：花盆（高 0.22）与底盘、水桶（高 0.30）、花瓶（高 0.28，放在 0.45 高的矮柜上）。
- 整体包络约 x −11.2 … 7.6；标本区（蚊子 + 皿）约 x −4 … 7.6、z −4.5 … 3.8，半径约 6 su。投影规则照引擎默认（≥ 0.28 × 模型半径的零件投影：皿、台、家居墙）。
- 以上是 R2 起点：**先按参考照片配准**（雌蚊侧视、背视；孑孓、蛹侧视；fact-discipline §9 的半透明叠图），改量级回 §2 改 DESIGN。

### 3.3 Tier-1（一眼能认）与参考图

**Tier-1**（`archetypes.md` §3 生物：剪影、体节数、附肢数与关节、标志结构的位置和相对大小）：

| 对象 | 一眼要认出的 |
|---|---|
| 雌蚊 | 驼背的胸、细长 8 节的腹、两只大复眼几乎占满头、细长前伸的喙、短而白端的触须、稀毛的触角；**两只**窄翅静息时平叠在腹上、翅脉上有鳞；平衡棒；六条细长的足、跗节白环；**胸背竖琴纹**；腹节白带 |
| 雄蚊 | 羽毛状（像瓶刷）的触角、长触须；个子小一点 |
| 卵 | 黑色、细长的梭形，一粒一粒贴在壁上、水线以上 |
| 孑孓 | 大头、比腹宽的胸、八节细腹、末端一根**短而粗的深色呼吸管**、鞍板和四根肛鳃、两侧几簇毛、嘴边一对扇形口刷；**倒挂、几乎竖直**，呼吸管尖在水面 |
| 蛹 | 逗号：圆的头胸部（侧面一只深色复眼）、背上两根短呼吸角贴水面、腹部向下向前卷、末端一对桨 |
| 羽化 | 蛹壳背上一道裂缝，成虫头胸先出、足伸出、站到蛹壳 / 水面上 |
| 家居 | 花盆底盘里一圈积水、敞口水桶里的水、花瓶里的水、檐槽里被落叶堵住的一段水；墙、地面是新加坡住家常见的瓷砖与粉刷墙（无门牌、无标志） |

**参考图**（`scripts/geo/mosquito/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）：

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 雌性埃及伊蚊侧视（静息、吸血前） | CDC PHIL（James Gathany 的伊蚊系列）；Wikimedia Commons "Aedes aegypti" 类目 | CDC PHIL 多为公有领域（逐张核 PHIL 页的 Copyright Restrictions 一栏） | 体段比例、喙与足长、翅叠法、静息姿态（后足是否上翘） |
| R2 | 雌蚊背视 | 同上 | 同上 | 竖琴纹的形状、腹节白带、翅的轮廓 |
| R3 | 雌蚊头部特写（触须、唇基白鳞、复眼） | CDC PHIL；Commons | 同上 | 触须长度与白端、复眼的大小 |
| R4 | 雄蚊（羽状触角） | CDC PHIL；Commons | 同上 | 触角毛的长度与层数、触须长度 |
| R5 | 白纹伊蚊背视 | CDC PHIL | 同上 | 胸背白纵纹（细看对照，不建模） |
| R6 | 埃及伊蚊卵（壁上、显微） | CDC PHIL；P22 图（只看不发） | 公有领域 / 版权（只作参考） | 卵的形状、排布 |
| R7 | 四龄孑孓侧视 | CDC PHIL；Commons；P14 第 8–9 页图（只看） | 同上 | 头、胸、腹的比例；呼吸管长粗；毛簇、口刷、肛鳃 |
| R8 | 一至三龄孑孓 | 待找（Commons / 论文开放图） | | 低龄的头大身小比例 |
| R9 | 蛹侧视 | CDC PHIL；P23 图（CC BY，核） | | 头胸部、呼吸角、桨、腹部卷曲的角度 |
| R10 | 羽化 | CDC PHIL；Commons | | 裂缝位置、出来的姿势 |
| R11 | 新加坡住家的花盆底盘、水桶、花瓶、檐槽 | NEA 传单的照片（只看，不发）；自己的生活经验 | 版权（只作参考） | 常见的大小和样式，不画任何品牌 |

### 3.4 零件（45 个 + 6 个 context）

材质族见 docs/06「生物与有机形体」；`shell` = X-RAY 时变透明；"双" = `bilateral: true`（数据只写左侧 +Z）。坐标是 R2 起点。

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | 双 | shell | 隐 / 姿态 | 参考 |
|---|---|---|---|---|---|---|---|---|
| 01 | `head-capsule` Head / 头 | head | 椭球（`sphere` + `scale`）；extra：唇基两簇白鳞（小椭球） | `chitin` 近黑 tint + 白鳞 `enamel` 暖白 | | ✓ | | R1、R3 |
| 02 | `compound-eyes` Compound eyes / 复眼 | head | 两只大椭球，几乎在头顶相接 | `eye` | | | | R3 |
| 03 | `antennae` Antennae / 触角 | head | `sweep` 带 `rings`（约 14 节），节上短毛做细环 | `chitin` | ✓ | | | R3 |
| 04 | `palps` Palps / 触须 | head | 短 `sweep`；extra：端部白鳞段 | `chitin` + 白 | ✓ | | | R3 |
| 05 | `proboscis` Proboscis / 喙 | head | 细长 `sweep`（下唇鞘），端部略粗 | `chitin` | | ✓ | 姿态 `bite-parts`：鞘中段向后弯 | R1 |
| 06 | `stylets` Stylets / 口针 | head | 喙里 3 根更细的 `sweep`（示意，真实 6 根，待核来源） | `chitin` 深褐 | | | 默认藏在鞘里；姿态 `bite-parts` 向前伸出 | — |
| 07 | `thorax` Thorax / 胸 | thorax | `sweep` 驼背轮廓（`section: {flat}`）；extra：竖琴纹 4 条细 `sweep`、侧板白斑 | `chitin` + 白 | | ✓ | | R2 |
| 08 | `fore-legs` Front legs / 前足 | thorax | `sweep`（基节、转节、股节、胫节、5 节跗节，关节处略细）；extra：白环 | `chitin` + 白 | ✓ | | | R1 |
| 09 | `mid-legs` Middle legs / 中足 | thorax | 同上 | 同上 | ✓ | | | R1 |
| 10 | `hind-legs` Hind legs / 后足 | thorax | 同上，最长；跗节白环最明显 | 同上 | ✓ | | | R1 |
| 11 | `wings` Wings / 翅 | thorax | `wing`（窄长外形 + 翅脉；翅缘与脉上的鳞画成深色细线） | `membrane` | ✓ | | 姿态 `wings-spread`：外展约 50° | R2 |
| 12 | `halteres` Halteres / 平衡棒 | thorax | 细 `sweep` + 端部小球 | `chitin` 浅褐 | ✓ | | | R1 |
| 13 | `salivary-glands` Salivary glands / 唾液腺 | thorax | 胸前部三叶小 `sweep`（示意） | `tissue` 乳黄 | ✓ | | X-RAY 可见 | — |
| 14 | `abdomen` Abdomen / 腹 | abdomen | `sweep` 带 `rings`（8 节）；extra：节基白带、侧面白斑 | `chitin` + 白 | | ✓ | 姿态 `fed` 撑大、`gravid` 略撑大 | R1、R2 |
| 15 | `midgut` Midgut / 中肠 | abdomen | `sweep`，从胸到腹中部 | `tissue` 低饱和赭（`tint` 取 `token:cut` 方向，**不用血红**） | | | 姿态 `fed`：腹段 `scale` 膨大 | — |
| 16 | `ovaries` Ovaries / 卵巢 | abdomen | 椭球；extra：卵（细小梭形，`repeat`） | `tissue` 乳白 | ✓ | | 姿态 `gravid`：放大、卵变长 | — |
| 17 | `male-body` Male mosquito / 雄蚊 | male | 头、胸、腹、六足合成一件（`sweep` + extra），尺寸 × 0.85 | `chitin` + 白 + `eye` | | | | R4 |
| 18 | `male-antennae` Bushy antennae / 羽状触角 | male | 触角轴 `sweep` + 每节一圈细毛盘（`repeat` 的薄 `cone`，像瓶刷） | `chitin` + `membrane` | ✓ | | | R4 |
| 19 | `male-palps` Male palps / 雄蚊触须 | male | 长 `sweep`，端部毛簇 | `chitin` | ✓ | | | R4 |
| 20 | `male-wings` Male wings / 雄蚊翅 | male | `wing` | `membrane` | ✓ | | | R4 |
| 21 | `dish` Glass dish / 玻璃皿 | water-stages | `lathe` 浅皿（底 + 壁，开口向上，r 4.12 外 / 4.0 内） | `glass` | | ✓ | | — |
| 22 | `dish-water` Still water / 积水 | water-stages | `lathe` 水体（r 3.98，高 1.80）+ extra：水面上一道弯月面细环 | `membrane` tint `#6c919a`（同 `water` 主题的海面） | | | 姿态 `drained`：缩成皿底一层薄水膜 | — |
| 23 | `eggs` Eggs / 卵 | water-stages | 12 个梭形（`sphere` + `scale` [1, 3.7, 1]，长 0.127 su）作 extra，贴在皿壁内侧、轴大致水平 | `chitin` 黑 | | | T3：`eggs-left` = none 时不显示 | R6 |
| 24 | `larva-l1` First instar / 一龄孑孓 | water-stages | 头（`sphere`）+ 胸（扁椭球）+ 腹（`sweep` 8 节 `rings`）+ 鞍板 + 呼吸管 + 4 肛鳃 + 毛簇 + 口刷（extra，同材质合并）；长 0.44 su（2.2 mm，示意） | `tissue` 灰褐半透 + `chitin`（头壳、呼吸管、鞍板） | | | `drained` 姿态：躺倒在皿底 | R7、R8 |
| 25 | `larva-l2` Second instar / 二龄孑孓 | water-stages | 同 24，长 0.72 su（3.6 mm，示意） | 同上 | | | 同上 | R7、R8 |
| 26 | `larva-l3` Third instar / 三龄孑孓 | water-stages | 同 24，长 1.08 su（5.4 mm，示意） | 同上 | | | 同上 | R7 |
| 27 | `larva-l4` Fourth instar / 四龄孑孓 | water-stages | 同 24，长 1.5 su（7.5 mm，F-26） | 同上 | | | 同上 | R7 |
| 28 | `moult-skins` Shed skins / 蜕下的皮 | water-stages | 三片皱缩的空皮（短 `sweep` + 头壳空壳），浮在 L2、L3、L4 站旁 | `membrane` 浅褐 | | | | R7 |
| 29 | `pupa` Pupa / 蛹 | water-stages | 头胸部 `lathe`（侧面复眼 extra）+ 卷曲腹部 `sweep`（8 节）+ 两根呼吸角（短喇叭形 `lathe`，长 0.12 su）+ 两片桨（`wing` 小扇）| `tissue` 深褐 + `eye` | | ✓（X-RAY 看得见里面折叠的足和翅芽：extra 细 `sweep`，`tissue` 浅色） | 姿态 `pupa-dive`：下潜翻转；`drained`：躺倒 | R9 |
| 30 | `pupal-case` Pupal skin / 蛹壳 | water-stages | 同 29 的外形，背上一道裂口（两片外翻的 `curvedPanel` / `wing` 片）；空壳 | `membrane` 浅褐 | | | | R10 |
| 31 | `emerging-adult` Emerging adult / 羽化中的成虫 | water-stages | 简化成虫一件（身体 + 收拢的足 + 皱的翅），雌蚊 × 0.85 | `chitin` + `membrane` | | | 动画 `emerge`（§3.7） | R10 |
| 32 | `escaped-adults` Adults that flew off / 飞走的成虫 | water-stages | 两只简化成虫（展翅），悬在皿上方 1.5 su | `chitin` + `membrane` | | | T3：`adults` = some 时出现；动画 `hover` | — |
| 33 | `flower-pot` Flower pot / 花盆 | home | `lathe` 盆（高 0.22，口径 0.24）；extra：植物（几片 `wing` 叶 + 茎 `sweep`） | `plastic` tint 赤陶色（`#b5704f`，产品本色）+ 叶 `tissue` 绿 | | | | R11 |
| 34 | `soil-hardened` Hardened soil / 干硬的泥土 | home | 盆口下的土面圆盘，中间一个浅坑；extra：坑里一小片积水（`membrane`） | `abrasive` 深褐 tint + `membrane` | | | 第 06 章第 4 拍 `hide` | R11 |
| 35 | `soil-loosened` Loosened soil / 铲松的泥土 | home | 同位置、表面起伏的土面（`lathe` 波纹轮廓） | `abrasive` 深褐 | | | 默认 `hide`；第 4 拍起显示 | — |
| 36 | `pot-plate` Flower pot plate / 花盆底盘 | home | `lathe` 浅盘（直径 0.26，高 0.03） | `plastic` 赤陶色 | | | 姿态 `home-bl` / `home-oc`：抬起竖向一侧 | R11 |
| 37 | `plate-water` Water in the plate / 底盘积水 | home | 盘内水薄片 | `membrane` 水色 | | | 第 4 拍起 `hide` | — |
| 38 | `pail` Pail / 水桶 | home | `lathe` 桶 + 提手 `tube` | `plastic` 蓝灰 tint（无品牌） | | | 姿态 `home-oc`：倒置 | R11 |
| 39 | `pail-water` Water in the pail / 水桶积水 | home | 桶内水体 | `membrane` | | | 第 5 拍起 `hide` | — |
| 40 | `vase` Vase / 花瓶 | home | `lathe` 瓶（`glass`）；extra：三枝花（茎 `sweep` + 花 `lathe`），矮柜（`bevelBox`） | `glass` + `tissue` + `wood` | | | 姿态 `home-oc`：倾倒换水 | R11 |
| 41 | `vase-water` Water in the vase / 花瓶的水 | home | 瓶内水体 | `membrane` | | | 第 5 拍 `highlight.custom` 换浅色（"换过的清水"） | — |
| 42 | `roof-gutter` Roof gutter / 屋顶檐槽 | home | `extrude` U 形槽（长 1.2），挂在屋檐下；extra：两个托架 | `stainless` 或 `powder` 浅灰 | | | | R11 |
| 43 | `gutter-debris` Fallen leaves / 落叶 | home | 一团 `wing` 小叶片堵在槽中段 | `tissue` 枯褐 | | | 第 6 拍 `hide` | — |
| 44 | `gutter-water` Water in the gutter / 檐槽积水 | home | 落叶上游一段水 | `membrane` | | | 第 6 拍 `hide` | — |
| 45 | `bti-granules` BTI granules / BTI 杀蚊药 | home | 檐槽里一小撮颗粒（`repeat` 小球） | `abrasive` 浅 tint | | | 默认 `hide`；第 6 拍显示 | — |
| c1 | `bench` Specimen bench / 标本台 | — | `bevelBox` 台面（x −4.5 … 8、z −5 … 4.2） | `wood` 浅 | | | | |
| c2 | `follow-marker` Follow-me ring / 标记圈 | water-stages | 细 `torus`（半径 0.45 su） | `token:signal` | | | 姿态 `marker-*`（§3.7，T1 绑定） | |
| c3 | `dish-ruler` Ruler / 尺 | water-stages | `bevelBox` + 刻度 extra（40 根细条，5 mm 一根长的） | `plastic` 浅 + 墨色刻度 | | | | |
| c4 | `home-floor` Floor / 地面 | home | `bevelBox` 2.2 × 1.6，瓷砖缝做 extra 细条 | `enamel` 浅灰 | | | | |
| c5 | `home-wall` Wall and eave / 墙与屋檐 | home | 后墙板 + 屋檐板（`bevelBox`） | `enamel` 暖白 | | | | |
| c6 | `home-plinth` Plinth / 台座 | home | 家居一角底下的台座 | `wood` 浅 | | | | |

- 零件数理由：雌蚊拆到能分别标注的结构（课纲的"三部分、六足"+ 伊蚊的识别特征）；孑孓四个龄期各一件（"分步长大"要并排看得见）；家居每处积水单独一件（每一步 B-L-O-C-K 要移开它）。删减顺序（超预算时）：`salivary-glands` 并进 `thorax` 的 X-RAY 示意 → `male-palps` 并进 `male-body` → `bti-granules` 删去（字幕照说）。
- **绘制预算**（§8.2 验收）：标本区静止目标 ≤ 60 calls、运转 ≤ 70、上限 100；三角形 < 0.4 M。估算：雌蚊约 30（双侧的镜像件各 +1）、雄蚊 8、皿区 18、台与 context 4、三条流 3。家居一角单独约 16，和标本区不同时开（`layers`），全开的自由浏览约 80。四个孑孓的毛簇、口刷用 extra 合并，每只 2 个材质槽；白鳞花纹同材质合并成一次。
- 默认不隐藏零件（`soil-loosened`、`bti-granules` 除外，由章节 `hide` 控制）。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么，≤ 60 字符） | detail 要点（怎样做到 · 数字 · 与别的的差别） |
|---|---|---|
| `compound-eyes` | Two large eyes made of many tiny lenses. / 由许多小眼组成的两只大眼。 | 几乎占满头；昆虫通性链 `grasshopper`；伊蚊白天找人（F-14） |
| `antennae` | Feelers that pick up smells and warmth. / 感受气味和温度的触角。 | 雌蚊稀毛（F-6）；找人靠气味等线索（CDC，R: ANAT-01，待核具体线索）；对比雄蚊 |
| `palps` | Short feelers beside the mouthpart. / 喙旁边短短的触须。 | 雌蚊短、白端（F-6）；按蚊雌蚊触须长，不要混（R: ANAT-02） |
| `proboscis` | The long mouthpart used for feeding. / 用来吸食的长喙。 | 外面是鞘，里面是口针；叮人时鞘弯起、口针刺入（待核来源）；雌雄都用它吸花蜜（F-10） |
| `stylets` | Fine, sharp parts that pierce skin. / 刺进皮肤的细口针。 | 只有雌蚊用来刺进皮肤（F-10）；模型画 3 根，真实更多（待核：6 根） |
| `thorax` | Holds the legs and wings; has a lyre pattern. / 足和翅都长在胸上，背上有竖琴纹。 | 竖琴纹 vs 白纹伊蚊的一条纹（F-4）；飞行肌在胸里（不建模，detail 一句） |
| `fore-legs` / `mid-legs` / `hind-legs` | Long legs with white bands. / 带白环的细长足。 | 足的分节（股节、胫节、跗节，R: ANAT-05）；白环在跗节基部（F-5） |
| `wings` | One pair of narrow wings. / 一对窄长的翅。 | 翅脉上有鳞（R2 照片）；静息时平叠；双翅目只有一对翅（F-8） |
| `halteres` | Small knobs that help it balance in flight. / 帮助飞行平衡的小棒。 | 后翅变来的（F-8） |
| `salivary-glands` | Make saliva; dengue virus can reach them. / 分泌唾液；病毒会到达这里。 | 外潜伏期约七天（F-31）；位置示意 |
| `abdomen` | Holds the gut and eggs; stretches after feeding. / 装着肠和卵，进食后会撑大。 | 10 节、前 8 节可见（F-9）；白带（F-5） |
| `midgut` | Where a meal is digested. / 消化食物的地方。 | 血里的蛋白质用来造卵（F-10）；颜色示意 |
| `ovaries` | Where eggs grow. / 卵在这里成熟。 | 吸血后约三天成熟（F-11、F-18）；每次约 100 粒（F-11） |
| `male-antennae` | Bushy antennae of a male. / 雄蚊毛茸茸的触角。 | 羽状（F-6）；"用来听雌蚊翅膀声"（待核来源，核不到不写） |
| `eggs` | Laid one by one just above the water. / 一粒粒产在水面上方。 | 0.63 mm（F-24）；白 → 黑（F-13）；约 2½ 天成形、可干着等约九个月（F-22、F-23） |
| `larva-l1` … `larva-l4` | Hangs at the surface; breathes through a siphon. / 倒挂在水面下，用呼吸管吸气。 | 四龄（F-25）；L4 约 8 mm（F-26），L1–L3 大小示意；28 °C 下这一龄约几天（F-20） |
| `moult-skins` | Old skins left after moulting. / 蜕皮后留下的旧皮。 | 外骨骼不能撑大，所以蜕皮（链 `grasshopper` 第 06 章） |
| `pupa` | Comma-shaped; breathes but does not eat. / 逗号形，会呼吸但不吃东西。 | 呼吸角 0.61 mm、腹 2.63 mm、桨 0.92 mm（F-28）；28 °C 约 1.9 天（F-20）；会翻滚下潜（F-27） |
| `pupal-case` | The skin left behind when the adult comes out. / 成虫钻出后留下的蛹壳。 | 背上裂开（F-29） |
| `emerging-adult` | A new adult climbing out onto the water. / 刚钻出来、站上水面的成虫。 | 吞空气撑裂蛹壳、头先出（F-29）；画面加快 |
| `dish-water` | Still water: where the young live. / 积水：幼虫和蛹住的地方。 | 模型的皿 40 mm、水深约 9 mm（DESIGN）；真实容器里各阶段混在一起 |
| `pot-plate` 等家居件 | 每件一句它为什么会积水 | NEA 2025 排名（F-34）；对应的 B-L-O-C-K 一步（F-37、F-38） |

---

## 3.6 流

颜色语义：`cycle` 墨色小点 = **顺序**（不是物质）；`air` 冷色 = 空气；`food` 叶绿 = 食物微粒。每条流一次绘制。

| id | group | 路径 | 约长 su | speed | count | size | 说明 |
|---|---|---|---|---|---|---|---|
| `life-cycle` | cycle | 多路径（E-M1 `rate` 绑定，`<流>:<路径>` 键）：`ring` = 水面上 0.25 su、半径 3.0 的圆弧，从 9 点顺时针到 6 点（270°）；`out` = 6 点站上方升起、越过皿沿、落到雌蚊胸背上方；`lay` = 雌蚊腹端 → 9 点卵壁 | 14 + 6 + 4 | 0.5 | 260 | 0.5 | `whenRun: false`（一直在，图层控制）；`intensity`（速度模式）绑 `rate`，`full: 1`；`clip: false` |
| `breathing-air` | air | 多路径：四个孑孓各一条（水面上 0.1 su → 呼吸管口）、蛹两条（→ 呼吸角口） | 共约 1.2 | 0.15 | 120 | 0.3 | `whenRun: true`；第 03、04 章字幕说一次"冷色小点是空气" |
| `larval-food` | food | 多路径：L3、L4 头前方各一团向口刷汇聚的微粒（`spread` 大、慢） | 共约 1.6 | 0.08 | 160 | 0.3 | `whenRun: true`；第 03 章第 4 拍 |

合计运转时 +3 次绘制。

## 3.7 动画与姿态

**动画**（全部 `whenRun: true`，除注明）：

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `wriggle-l1` … `wriggle-l4` | `larva-l1` … `larva-l4` | oscillate | 绕呼吸管尖（`pivot` = 各自的水面点），轴 = 切向，幅度 6°，0.35–0.5 Hz（各不相同） | 在水面下轻轻摆；不宣称真实频率 |
| `pupa-bob` | `pupa` | oscillate | 绕呼吸角口，幅度 3°，0.2 Hz | |
| `emerge` | `emerging-adult` | sequence，`loop: false` | t 0：身体在蛹壳里（offset −0.25 y、俯 50°）→ t 2.5：头胸出壳（offset −0.05、俯 25°）→ t 4.5：足踩上水面（offset 0、俯 0°）→ t 6：停住 | 每次运转（章 / 拍 `run: true`）从头播一次；细看写"画面加快了"（F-29 待核真实时长） |
| `hover` | `escaped-adults` | oscillate | 幅度 4°，1.2 Hz（缓慢摆动，表示在飞） | 不是真实翅频 |

**姿态**（`poses`，≤ 32）：

| 名 | 零件 | 变换 | 用在 |
|---|---|---|---|
| `wings-spread` | `wings`（自动镜像） | 绕翅基外展 50° | 01 第 4 拍 |
| `bite-parts` | `proboscis`、`stylets` | `proboscis` 绕基部下转 15°；`stylets` 沿喙的方向 offset 前伸 0.15 su（示意“鞘让开、口针伸出”；真实的鞘是中段折弯，模型画不出折弯，细看写明） | 02 第 2 拍；R2 读不出就删姿态，这一拍只用 X-RAY 静态 |
| `fed` | `abdomen`、`midgut` | 腹部绕腹基 `scale` [1.05, 1.35, 1.4]；中肠 `scale` [1, 1.8, 1.8] | 02 第 3 拍 |
| `gravid` | `abdomen`、`ovaries` | 腹 [1.03, 1.2, 1.25]；卵巢 × 1.6 | 02 第 4 拍 |
| `marker-l1` … `marker-adult`（7 个） | `follow-marker` | offset 到各站（各孑孓呼吸管尖、蛹、羽化站、雌蚊脚下）；卵站不需要（`stage` 从孵化算起，不会是 `egg`） | T1 绑定 `stage` |
| `pupa-dive` | `pupa` | offset −0.9 y，绕自身转 120° | 04 第 2 拍 |
| `drained` | `dish-water`、`larva-l1…l4`、`pupa`、`moult-skins`、`emerging-adult`、`pupal-case` | 水体 `scale` y 0.03（贴皿底）；孑孓、蛹转 85° 躺倒、offset 到皿底；蜕皮与蛹壳落底；羽化中的成虫 offset 到皿底（搁浅） | 06 第 1–2 拍（T3） |
| `home-bl` | `pot-plate` | 底盘抬起 0.15、绕 x 转 70°（竖起晾干，同配图 `mosquito-empty-saucer`） | 06 第 4 拍 |
| `home-oc` | `pot-plate`、`pail`、`vase`、`vase-water` | 同 `home-bl` 的底盘；水桶绕 x 转 180°、offset 使桶口贴地（倒置）；花瓶离开矮柜、倾斜 60°（换水的动作，读不出就去掉这一条，只用 `highlight.custom`） | 06 第 5、6 拍（一拍只能有一个姿态，所以 B-L-O-C-K 的姿态是累积写的） |

## 3.8 HUD 数据

- **标题**：EN "A Mosquito's Life Cycle" / ZH "一只蚊子与它的生活史"；副标题 EN "The Aedes mosquito: its body, its life in water, and how to stop it breeding" / ZH "伊蚊：身体、水中的一生，以及怎样不让它滋生"；`shortTitle` EN "Mosquito" / ZH "蚊子"；`moe`：`["MOE 2023 Science P3 Cycles: life cycles of animals (mosquito is one of the named animals)", "MOE 2023 Science P3 Diversity: insects", "MOE 2024 PE P3: mosquito-borne diseases"]`；`tags: [singapore]`；`illustration: mosquito`。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Species / 物种 | `AEDES AEGYPTI · ♀` / `埃及伊蚊 · 雌` | typical |
| Body / 体长 | `4.5 MM · MODEL ×200` / `4.5 毫米 · 模型 ×200` | design |
| Stages / 阶段 | `EGG → LARVA ×4 → PUPA → ADULT` / `卵 → 幼虫 4 龄 → 蛹 → 成虫` | typical |
| Hatch → adult / 孵化 → 成虫 | `≈ 7 D AT 28 °C (LAB)` / `28°C 约 7 天（实验室）` | typical |

- **telemetry**（≤ 6，跟随 sim 输出，`scope` 照 docs/06）：`HATCH → ADULT d`（`to-adult`）、`LARVA d`（`larva-days`）、`PUPA d`（`pupa-days`）、`WATER °C`（`temp-now`，控件值的回显输出）。块尾一行 `SIM <stage> · <本章控件值>`。
- **镜头预设**（≤ 6）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `hero` | HERO | 3/4 前右上方：雌蚊在左前、皿在右后、环看得见；封面构图 |
| 2 | `heads` | HEADS | 雌、雄两只的头部同框，侧前方（02） |
| 3 | `dorsal` | ABOVE | 雌蚊正上方俯视（竖琴纹、翅叠法） |
| 4 | `dish` | DISH | 皿的正上偏前 55° 俯视，整圈 7 站 + 成虫区 |
| 5 | `underwater` | WATER | 低机位从前方隔着玻璃平视水下：L4、蛹、羽化站 |
| 6 | `home` | HOME | 家居一角 3/4 前方 |

- `views.section.plane: "xz"`（PLATE 立面画俯视图：环是一个圆）；`views.cover` = hero 略拉远；不设剖切面（皿是玻璃 `shell`，X-RAY 看得见水下；雌蚊的内脏用 X-RAY）。
- **模式组合**：X-RAY + FLOW（皿与外壳透明、孑孓实心、空气与食物点可见：第 03 章主要读法）；EXPLODED（引擎禁用 FLOW；雌蚊的头、胸、腹、足、翅按装配方向拆开，皿区零件 `explode.dist` 0：不拆）；hide + EXPLODED 照常；REFERENCE + run（暂停）。

---

## 4. 引擎

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 生活史是一个循环（第 41–42 页） | 皿里一圈 7 站 + 成虫区，小点沿圈走；右上一个环 | 数据（站位、多路径流）+ **E-M2 环卡** |
| 隔一段时间观察（"over a period of time"） | 天数一步一步加，标记圈从一龄走到成虫；环卡高亮当前阶段 | **E-M1** `stage` → `pose` 绑定（已有） |
| 比较不同动物的生活史 | 环卡并排第二个环（蝗虫三阶段）；配图三环 | E-M2 的 `compare` |
| 温度与发育（公平测试） | 改水温，环转得快 / 慢，表与折线图 | E-M1 `to-adult`、`rate` → 流 `intensity`（已有）、数据表小图（已有） |
| 倒掉积水、擦壁（PE 预防措施） | 水倒空、孑孓和蛹搁浅；卵在 / 不在；有 / 没有成虫飞走 | 章节姿态 `drained` + E-M1 `emptying` → `visible` 绑定（已有） |
| 羽化 | 成虫从蛹壳钻出 | `sequence`（`loop: false`，已有） |
| 水面、水下 | 玻璃皿 + 半透明水体，孑孓倒挂在水面下 | `glass` + `membrane`（`water` 主题用过），不需要新材质 |

### 4.2 模型 `life-cycle`（E-M1；`lib/sim/lifecycle.ts`，纯函数，有单测）

```jsonc
"sim": {
  "kind": "life-cycle",
  "controls": [
    { "id": "temp", "kind": "step", "values": [20, 25, 28, 32], "default": 28, "unit": "°C", "label": { "en": "Water temperature", "zh": "水温" } },
    { "id": "day", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6, 7, 8], "default": 0, "unit": "d", "label": { "en": "Days after hatching", "zh": "孵化后第几天" } },
    { "id": "every", "kind": "step", "values": [2, 4, 6, 8, 10, 14], "default": 14, "unit": "d", "label": { "en": "Water tipped out every", "zh": "每隔几天倒一次水" } },
    { "id": "wipe", "kind": "toggle", "default": false, "label": { "en": "Wall scrubbed too", "zh": "倒水后也刷壁" } },
    { "id": "compare", "kind": "toggle", "default": false, "label": { "en": "Show a grasshopper's cycle", "zh": "并排看蝗虫的生活史" } }   // 只给环卡，不进试一试卡片
  ],
  "outputs": [
    { "id": "stage", "kind": "state", "states": { "egg": {…}, "l1": {…}, "l2": {…}, "l3": {…}, "l4": {…}, "pupa": {…}, "adult": {…} } },
    { "id": "to-adult", "unit": "d", "decimals": 1 },                 // 孵化 → 成虫，当前水温
    { "id": "larva-days", "from": "days:larva", "unit": "d", "decimals": 1 },
    { "id": "pupa-days", "from": "days:pupa", "unit": "d", "decimals": 1 },
    { "id": "days-left", "unit": "d", "decimals": 1 },                // 到成虫还剩几天（≥ 0）
    { "id": "temp-now", "from": "control:temp", "unit": "°C", "decimals": 0 },
    { "id": "adults", "kind": "state", "from": "emptying:adults", "states": { "none": {…}, "some": {…} } },
    { "id": "eggs-left", "kind": "state", "from": "emptying:eggs", "states": { "yes": {…}, "none": {…} } },
    { "id": "rate", "kind": "vector" }
  ],
  "bind": [
    { "output": "stage", "part": "follow-marker", "pose": { "l1": "marker-l1", "l2": "marker-l2", …, "adult": "marker-adult" } },
    { "output": "eggs-left", "part": "eggs", "visible": { "eq": "yes" } },
    { "output": "adults", "part": "escaped-adults", "visible": { "eq": "some" } },
    { "output": "rate", "flow": "life-cycle", "intensity": { "full": 1 } }
  ],
  "lifeCycle": {
    "temp": "temp", "day": "day",
    "start": "l1",                                    // 第 0 天 = 孵化；之前的阶段（卵）不计天
    "stages": [
      { "id": "egg",   "in": "wall",  "part": "eggs",      "label": { "en": "Egg", "zh": "卵" },           "note": { "en": "waits for water", "zh": "等水来" } },
      { "id": "l1",    "in": "water", "part": "larva-l1",  "label": { "en": "Larva 1", "zh": "一龄" } },
      { "id": "l2",    "in": "water", "part": "larva-l2",  "label": { "en": "Larva 2", "zh": "二龄" } },
      { "id": "l3",    "in": "water", "part": "larva-l3",  "label": { "en": "Larva 3", "zh": "三龄" } },
      { "id": "l4",    "in": "water", "part": "larva-l4",  "label": { "en": "Larva 4", "zh": "四龄" } },
      { "id": "pupa",  "in": "water", "part": "pupa",      "label": { "en": "Pupa", "zh": "蛹" } },
      { "id": "adult", "in": "air",   "part": "thorax",    "label": { "en": "Adult", "zh": "成虫" } }
    ],
    "groups": { "larva": ["l1", "l2", "l3", "l4"] },
    "days": {                                         // 实测平均历期（天），S16 表 2（雄性、Khan 饲料）；total = 论文的孵化到成虫
      "20": { "l1": 2.99, "l2": 1.52, "l3": 1.62, "l4": 3.15, "pupa": 4.04, "total": 13.40 },
      "25": { "l1": 2.53, "l2": 1.17, "l3": 1.08, "l4": 2.77, "pupa": 2.61, "total": 10.18 },
      "28": { "l1": 1.88, "l2": 0.68, "l3": 1.00, "l4": 1.82, "pupa": 1.86, "total": 7.23 },
      "32": { "l1": 1.55, "l2": 0.95, "l3": 0.70, "l4": 1.63, "pupa": 1.70, "total": 6.40 }
    },
    "size"?: { "head": { "unit": "mm", "values": { "l1": …, "l2": …, "l3": …, "l4": … } } },   // 只在 F-26 找到来源时写
    "emptying": { "every": "every", "wipe": "wipe" },
    "rate": { "flow": "life-cycle", "reference": 28 },
    "card": { "compare": { "control": "compare", "label": { "en": "Grasshopper", "zh": "蝗虫" },
              "stages": [ { "id": "egg", "label": {…} }, { "id": "nymph", "label": {…} }, { "id": "adult", "label": {…} } ],
              "link": { "topic": "grasshopper", "chapter": "nerves-and-growing-up" } } }
  }
}
```

**规则**：

- 每个温度一行 `days`：各段（`start` 起、`adult` 之前的每个阶段）> 0；`total` 可选：写了就按 `total ÷ Σ` 缩放各段（论文的总数是全体个体的平均、各段样本数不同，§2.4），不写 = Σ。validate：`|total − Σ| ≤ 5 % Σ`（防止抄错）。
- `stage`：第 `day` 天落在哪一段（左闭右开）；≥ 总数 = `adult`。`start` 之前的阶段（卵）不计天数，`stage` 永远不会是它；卵由环卡上那段弧的 `note`（“等水来”）和字幕讲。
- 量（输出的 `from`）：`stage`、`to-adult`、`days-left` = max(0, 总数 − day)、`days:<阶段>`、`days:<groups 的键>`、`on:<阶段>`（1 / 0，给 `tint` 绑定用，本主题不用）、`size:<量>`（当前阶段的值，没有 = NaN 显示 `—`）、`control:<控件>`（回显）、`emptying:adults`（`every` > 总数 → `some`，否则 `none`）、`emptying:eggs`（`wipe` 开 → `none`，否则 `yes`）、`rate`（向量：`<rate.flow>:<该流每条路径>` → 参考温度总数 ÷ 当前总数）。
- 确定、同步、< 0.1 ms；`SEPARATE_EXPERIMENTS['life-cycle'] = false`（PLATE 块尾照常写状态：`stage` 或本章卡片观察的状态）。
- **validate**（`sim-schema.ts lifeCycleIssues`）：`temp` 是步进控件、每个值在 `days` 里有一行、`days` 没有多余的温度；`day` 是步进控件、值 ≥ 0；阶段 id 唯一、`start` 是其中之一、`adult` 是最后一个、每行 `days` 恰好覆盖 `start` 到 `adult` 之前的阶段；`part` 存在（非 context）；`groups` 的成员是阶段；`size` 的键是阶段；`emptying` 的控件存在、种类对（步进 / 开关）；`rate.flow` 是有 `paths` 的流、`reference` 是 `temp` 的一个值；`card.compare.control` 是开关、`link` 的主题与章存在（同 `<TopicLink>` 的检查）；输出的 `from` 是这个模型的量、种类对得上。

### 4.3 生活史环卡（E-M2；`hud/CycleCard.tsx` + `lib/sim/cycle.ts`）

有 `sim.lifeCycle` 时代替右上的零件链路卡（同电路图卡、能量链卡的做法）；标题 LIFE CYCLE / 生活史；< 1024 px 收进试一试卡片里可折叠的一节；手机隐藏（同其他右上卡）。

- **版式**（`lib/sim/cycle.ts`，纯函数、确定、有单测）：阶段节点等距排在一个圆上，第一个阶段在 12 点，**顺时针**（教科书生活史图的惯例；与皿里俯视顺时针一致）；节点 = 小圆 + 下方标签（`label`），四个龄期节点小一号、连成一段弧（`groups.larva` 加一个弧形括号 "Larva / 幼虫（孑孓）"）；相邻节点之间一段带箭头的弧（HUD 墨线 hairline，箭头在弧中点）；每段弧旁写当前温度下的天数（`1.9 d` / `1.9 天`，1 位小数；`start` 之前的弧写 `note`："waits for water / 等水来"；`adult` → 第一个阶段的弧写"lays eggs / 产卵"）；`in: water` 的节点后面一条 `--cold` 15 % 的宽弧带，带端写"in water / 在水里"；`wall` 节点画一小段竖线表示壁。圆心写 `≈ 7.2 d · 28 °C`（孵化到成虫 · 水温）。
- **状态**：当前 `stage` 的节点实心 signal；其余描边；控件变 → 天数与圆心读数更新（0.3 s 淡变）。
- **对照**：`compare` 开时卡片里并排两个小环（左：本主题；右：`card.compare` 的阶段，只画节点、箭头，没有天数；下面一行 `<TopicLink>` 式的小链接"See the grasshopper / 看蝗虫"，跳到 `link`）。
- **交互**：节点是按钮（≥ 44 px 命中区，`aria-label` = 阶段名 + 天数），点 = 选中该阶段的 `part`（详情出现在阅读面板章头下）；整张卡 `role="img"` 的读屏文字由数据拼（"Life cycle at 28 °C: egg, waits for water; larva 1, 1.9 days; … adult."）。
- **i18n**：卡片标题、"in water"、"waits for water"、"lays eggs"、天的单位走 `i18n/ui.{en,zh}.json`；阶段名和 `note` 来自数据。

### 4.4 其余全部复用（已查 docs/06，未改代码）

试一试卡片（改变 / 不变 / 观察、`[ ]`、`T`、记一行、`record.chart` 折线图、先猜后看、URL `sim=`）；`visible` / `pose` 绑定（`pose` 按输出值的字符串取姿态，`lib/sim/bind.ts` 第 165 行）；流的 `intensity`（速度模式，多路径流的 `<流>:<路径>` 键）；`sequence` 动画的 `loop: false`；拍的 `run`、`layers`、`pose`、`hide`、`highlight.custom`、`sim`；背景章与 `note`；组级比例尺（`groups[].scale`）；`glass` / `membrane` 材质族与 `tint`；`bilateral`；`<TopicLink>`。**不需要新 token**（用 `cold`、`food`、`signal`、`ink-3`）。

### 4.5 引擎件清单与文件归属（一个 Opus 引擎代理，约 2 天；不改 `package.json`、不加依赖、不提交）

| 件 | 优先级 | 文件 | 要点 |
|---|---|---|---|
| E-M1 模型 | 必须 | `src/engines/space-scene/lib/sim/lifecycle.ts`（新）、`sim-schema.ts`（`lifeCycleSchema`、`lifeCycleIssues`、量的种类、`kind` 枚举）、`lib/sim/index.ts`（注册） | §4.2；单测钉死 §2.4 全表 |
| E-M2 环卡 | 应该 | `lib/sim/cycle.ts`（新，版式）、`hud/CycleCard.tsx`（新）、`View.tsx`（卡片槽）、`explorer/TryIt.tsx`（< 1024 px 收进卡片）、`space-scene.css`、`src/i18n/ui.{en,zh}.json` | §4.3；退路：零件链路卡（§3.1） |
| 夹具主题 | 必须 | `src/content/topics/sample-life-cycle/`（新，`status: draft`，占位文字，只用程序化积木：一只皿、7 个占位标本、标记圈、一条三路径的环流；四章各用一种：T1 天数、T2 温度 + 小图、T3 倒水、环卡对照） | 不碰 `mosquito/` 目录 |
| 测试 | 必须 | `tests/space-scene/lifecycle.test.ts`、`cycle-card.test.ts`、样板 `tests/space-scene/fixtures/aedes-cycle.ts`（§4.2 的完整 `lifeCycle` 数据 = 本主题的作者模板）、`tests-e2e/sample-life-cycle.spec.ts` | 见 §4.6 |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 生活史（life-cycle）」，改「试一试（sim）」的模型种类一行 | |

主会话不预装依赖（本主题不需要新依赖）。

### 4.6 引擎验收

- [ ] 单测：§2.4 的阶段边界、`to-adult`、`larva-days`、`pupa-days`、`days-left` 四个温度 × 第 0–8 天全表；`total` 缩放后各段之和 = `total`；没有 `total` 时 = Σ；`emptying` 六个步进值 × 擦壁开关；`rate` 四个温度；`on:` / `size:`（夹具里写一组假数据）/ `control:` 量；确定性；URL `sim=temp.32~day.4` 往返。
- [ ] validate 报错用例：温度缺行 / 多行、阶段缺天数、`start` 不存在、`adult` 不在最后、负的历期、`total` 与 Σ 差 > 5 %、`part` 不存在或是 context、控件种类不对、`rate.flow` 没有 `paths`、`compare.link` 的章不存在、输出的 `from` 不是本模型的量。
- [ ] 环卡单测：节点位置确定、顺时针、第一个在 12 点；弧的天数文字 = 模型的段长（1 位小数）；`in: water` 的弧带覆盖正确的节点；`compare` 开时两环；读屏文字中英。
- [ ] e2e（`sample-life-cycle`）：深链接 `?ch=…&sim=day.4` 标记圈在第 4 站、环卡高亮四龄；`]` 走一天；改水温后环卡天数变、流变快；倒水章 `every` 8 → 飞走的成虫出现；擦壁 → 卵消失；点环卡节点选中零件；< 1024 px 环卡在试一试卡片里；中文页。
- [ ] `sample-space`、`sample-forces`、`sample-energy`、`grasshopper`、`circuits`、`energy-conversion` 截图与 `--beats` 不回归。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.7 不做（v2）

读者拖动标记圈或标本；模型随天数变形长大（同一只孑孓由小变大）；同时在皿里显示"某一天皿里有哪些阶段"的种群模拟（产卵批次、存活率）；按温度改变孑孓摆动的速度。

---

## 5. 章节

### 5.0 总表

`layers` 写"蚊子" = `head, thorax, abdomen, male, water-stages, cycle`；`run` 指本章默认；镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | view | run | layers | pose | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | assembled | true | 蚊子 | — | day 8 | eggs, larva-l4, pupa | hero |
| 01 | `the-adult` | An Aedes mosquito / 一只伊蚊 | assembled | false | head, thorax, abdomen, male | — | day 8 | head-capsule, thorax, abdomen | 拍内（雌蚊 3/4） |
| 02 | `female-and-male` | Female and male / 雌蚊与雄蚊 | assembled | false | head, thorax, abdomen, male | — | day 8 | antennae, male-antennae, proboscis | heads |
| 03 | `eggs-and-larvae` | Eggs and larvae / 卵与孑孓 | xray | true | water-stages, cycle, air, food | — | temp 28, day 0 | eggs, larva-l1, larva-l4 | dish |
| 04 | `pupa-to-adult` | From pupa to adult / 从蛹到成虫 | assembled | true | water-stages, cycle, air, head, thorax, abdomen | — | temp 28, day 5 | pupa, pupal-case, emerging-adult | underwater |
| 05 | `round-the-cycle` | Round the cycle / 绕一圈 | assembled | true | 蚊子 | — | temp 28, day 8 | eggs, pupa, abdomen | hero |
| 06 | `breaking-the-cycle` | Breaking the cycle at home / 在家里打断这一圈 | assembled | false | water-stages | drained | temp 28, every 14, wipe false, day 8 | eggs, dish-water | dish |

- 第 06 章 `hide`（章）：`follow-marker, soil-loosened, bti-granules`；拍里的 `hide` 不累积，第 4–6 拍逐拍写全（见 §5.7）。第 03 章 X-RAY：皿是 `shell`，水下更清楚；蚊子各组不在这章的 `layers` 里，不受影响。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "This is a model. The mosquitoes, eggs, larvae and pupa are drawn about 200 times life size, and the stages are set round one dish so that you can see them in order; in a real container you would find many of each, all mixed together. The corner of a home in the last chapter is drawn separately, at a different scale. Day counts come from one laboratory study at stated water temperatures (marked SIM where this model works them out); real containers vary." / ZH "这是一个模型。蚊子、卵、孑孓和蛹都放大了约 200 倍，各阶段绕着一只皿排成一圈，方便按顺序看；真实的容器里，每个阶段都有很多只，混在一起。最后一章的家居一角是另外按比例画的。天数来自一项写明水温的实验室研究（模型推算出来的数标 SIM）；真实的容器各不相同。"
- **summary**：The Aedes mosquito is an insect that spends the first part of its life in water. This topic follows one round of its life cycle, and shows how removing still water breaks the cycle. / 伊蚊是一种昆虫，一生的前半段在水里度过。本主题跟着它的生活史走一圈，并说明为什么清除积水能打断这一圈。
- **正文提纲**：① 课纲：不同生物有不同的生活史，蚊子是课纲点名的七种动物之一（S2 第 42 页）。② 蚊子是昆虫：三部分、六足——基础在蝗虫主题（`<TopicLink slug="grasshopper" ch="whole-animal">`），这里只讲蚊子不一样的地方。③ 新加坡为什么关心蚊子：伊蚊能传播骨痛热症（一句，F-31）。④ 怎么读：200 倍；皿里的环与小点；冷色点是空气、绿点是食物；环卡；第 03–06 章的试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero，run） | This model shows an Aedes mosquito about two hundred times life size, beside a dish of still water. / 这个模型把一只伊蚊放大了约两百倍，旁边是一皿积水。 |
| 2 | camera dish；labels eggs, larva-l1, larva-l4, pupa, emerging-adult | Round the dish are the stages of its life: eggs, larvae of four sizes, a pupa, and a new adult climbing out. The dots move round in the order the stages come. / 皿里绕着一圈的是它一生的各个阶段：卵、四种大小的孑孓、蛹，还有一只正在钻出来的成虫。小点绕圈走的方向，就是这些阶段出现的顺序。 |
| 3 | camera hero 拉近雌蚊；labels head-capsule, thorax, abdomen | Like every insect, the adult has three body parts and six legs. The grasshopper topic looks at these parts closely. / 和所有昆虫一样，成虫身体分三部分，有六条足。蝗虫主题仔细讲了这些部分。 |
| 4 | camera home；layers home；labels pot-plate, pail, vase | In Singapore, Aedes mosquitoes breed in small pools of still water at home, such as flower pot plates and pails. The last chapter shows how to stop them. / 在新加坡，伊蚊在家里的小片积水中滋生，比如花盆底盘和水桶。最后一章讲怎样阻止它们。 |

- 本章 `hide`：`soil-loosened, bti-granules`（第 4 拍的家居一角显示 B-L-O-C-K 之前的样子）。
- **试一试**：无（环卡照常显示，`day 8` → 高亮成虫）。
- **细看**：`How this model is drawn`（200 倍、皿是展示用、家居另按比例；真实容器里各阶段混在一起）；`Insects, again`（S2 第 38 页"昆虫"；链 grasshopper `whole-animal`）；`Where the day counts come from`（S16：实验室、雄蚊、同样的饲料、写明水温；NEA 的说法 S4；为什么"新加坡的孑孓几天长成"没有一个固定的数）。
- **本章索引**：head-capsule, thorax, abdomen, eggs, larva-l4, pupa, emerging-adult, pot-plate
- **名词首现**：aedes、life-cycle（“昆虫”不进名词表，正文一句话，链蝗虫）。

### 5.2 第 01 章 `the-adult`

- **summary**：An adult Aedes mosquito is a small black insect with white markings, a few millimetres long. Like other flies, it has only one pair of wings. / 成年伊蚊是一种几毫米长、黑色带白斑的小昆虫。和其他蝇类一样，它只有一对翅。
- **正文提纲**：① 多大：几毫米（F-2），模型放大 200 倍；雌蚊比雄蚊大（F-3）。② 头：大复眼、触角、触须、细长的喙（F-6、F-7）。③ 胸：六条足都在胸上、跗节白环（F-5）；一对翅、翅后一对平衡棒（F-8）；胸背竖琴纹（F-4）。④ 腹：分节、白带（F-9、F-5）。⑤ 新加坡的两种伊蚊：埃及伊蚊与白纹伊蚊（F-4，细看）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（雌蚊 3/4，近）；labels head-capsule, thorax, abdomen | Head, thorax and abdomen: the adult has the same three body parts as every insect. This one is a female Aedes aegypti. / 头、胸、腹：成虫和所有昆虫一样分三部分。这是一只雌性埃及伊蚊。 |
| 2 | camera 头部近景；labels compound-eyes, antennae, palps, proboscis | Two large compound eyes cover most of the head. The long, thin mouthpart is the proboscis. The two short feelers beside it are the palps, with white tips. / 两只大复眼几乎占满了头。细长的口器叫喙，旁边两根短短的、末端发白的是触须。 |
| 3 | camera dorsal；labels thorax, wings | From above, white scales on the thorax make a lyre shape. Its close relative, Aedes albopictus, has one white stripe there instead. / 从上面看，胸背的白鳞片排成竖琴的形状。它的近亲白纹伊蚊，这里只有一条白纹。 |
| 4 | pose wings-spread；camera dorsal 略高；labels wings, halteres | A mosquito has only one pair of wings. Behind them are two small knobs, the halteres, which help it keep its balance in flight. / 蚊子只有一对翅。翅后面有两个小棒，叫平衡棒，帮助它在飞行时保持平衡。 |
| 5 | camera 侧视；labels fore-legs, mid-legs, hind-legs | All six long legs join the thorax. White bands on the legs give the Aedes mosquito its striped look. / 六条细长的足都长在胸上。足上的白环让伊蚊看起来一节黑一节白。 |

- **试一试**：无。
- **细看**：`Two kinds of Aedes in Singapore`（F-4、F-14：两种都白天叮人为主；白纹伊蚊多在绿化地带，R: ANAT-08）；`Only two wings`（双翅目，F-8；对比蝗虫四翅，链 grasshopper `armour-and-senses`）；`How big is it?`（F-2、F-3；尺；200 倍）；`When and how far`（F-14、F-15）。
- **本章索引**：head-capsule, compound-eyes, antennae, palps, proboscis, thorax, wings, halteres, fore-legs, mid-legs, hind-legs, abdomen
- **名词首现**：proboscis、palp、haltere。

### 5.3 第 02 章 `female-and-male`

- **summary**：Only the female mosquito bites. She needs protein from blood to make her eggs; males and females both feed on plant sugars. / 只有雌蚊叮人。她需要血里的蛋白质来制造卵；雄蚊和雌蚊都吃植物的糖汁。
- **正文提纲**：① 雌雄怎么分：触角（羽状 vs 稀毛）、触须、个子（F-3、F-6）。② 喙：外鞘与里面的口针（P38 待找；找不到就只说“喙里有细细的口针”，不写动作）。③ 只有雌蚊吸血，为了卵（F-10）；雌雄都吸糖汁（F-10）。④ 吸血后约三天卵成熟，每次约 100 粒、一生约三次（NEA，F-11；UF 的说法在细看）。⑤ 骨痛热症怎么从蚊子到人：被感染的雌蚊、约七天、唾液腺；蚊子不是生来带病毒；不是每口都会生病（F-31、M-7）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（heads）；labels antennae, male-antennae, palps, male-palps | The male's antennae are bushy, covered in long fine hairs; the female's have only short hairs. The male is also a little smaller. / 雄蚊的触角毛茸茸的，长满细长的毛；雌蚊的触角只有短毛。雄蚊的个子也小一点。 |
| 2 | X-RAY；pose bite-parts；camera 雌蚊头部低侧；labels proboscis, stylets | Inside the female's proboscis are fine, sharp stylets. When she feeds on blood, they slide into the skin while the outer sheath bends back. / 雌蚊的喙里有几根又细又尖的口针。她吸血时，口针刺进皮肤，外面的鞘向后弯起。 |
| 3 | X-RAY；pose fed；labels abdomen, midgut | Only females take blood, because they need its protein to make eggs. Afterwards the abdomen is stretched. Males and females both drink sugary plant juices such as nectar. / 只有雌蚊吸血，因为她需要血里的蛋白质来制造卵。吸过血，腹部会撑大。雄蚊和雌蚊都吸花蜜之类的植物糖汁。 |
| 4 | X-RAY；pose gravid；labels ovaries | About three days after a blood meal, her eggs are ready. She lays about a hundred at a time, and can do this about three times in her life. / 吸血后大约三天，卵就成熟了。她每次产约一百粒卵，一生大约能产三次。 |
| 5 | X-RAY；pose null；labels salivary-glands, proboscis | If a female bites a person who has dengue, the virus multiplies inside her. About seven days later it reaches her salivary glands, and her bites can pass it on. A mosquito is not born with the virus. / 雌蚊如果叮了患骨痛热症的人，病毒会在她体内繁殖。大约七天后病毒到达唾液腺，她再叮人就可能把病毒传出去。蚊子不是生来就带着病毒的。 |

- **试一试**：无。
- **细看**：`How many eggs?`（F-11：NEA 约 100 粒 × 约 3 次；UF 每批 100–200、最多 5 批，取决于吸了多少血）；`Not every bite`（M-7：只有被感染的雌蚊能传；很多感染很轻，R: DENGUE-01–02；人不会直接从别人身上传染——待核 WHO）；`What the males do`（吸糖汁、不叮人，F-10；第 06 章的 Wolbachia 正是放雄蚊）；`Who it bites, and when`（F-14）。
- **本章索引**：antennae, male-antennae, palps, male-palps, proboscis, stylets, abdomen, midgut, ovaries, salivary-glands
- **名词首现**：dengue、stylet（可并入 proboscis 的定义，不单列）。

### 5.4 第 03 章 `eggs-and-larvae`

- **summary**：Eggs laid just above the water hatch when the water rises to cover them. Each larva hangs below the surface to breathe, eats tiny bits in the water, and grows in four steps, shedding its skin between them. / 产在水面上方的卵，水涨上来淹没它就孵化。孑孓倒挂在水面下呼吸，吃水里的微小颗粒，分四步长大，每两步之间蜕一次皮。
- **正文提纲**：① 卵：在哪里（F-12）、多大（F-24）、白 → 黑（F-13）、28 °C 约 2½ 天成形（F-22）、可干着等约九个月（F-23）、水淹没才孵化。② 幼虫（孑孓）不是蠕虫：头、胸、腹、呼吸管（F-25，M-2）。③ 倒挂在水面下，用呼吸管吸气（F-25）。④ 口刷收集微粒（F-25）。⑤ 外皮不能撑大，所以蜕皮、分四个龄期长大（F-25、F-26；链 grasshopper `nerves-and-growing-up`），28 °C 下各龄几天（F-20、§2.4）。⑥ 试一试：跟着一只孑孓一天一天看。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | camera 卵壁近景（拍内）；labels eggs, dish | A female lays her eggs one by one on the damp wall just above the water. Each egg is less than a millimetre long. It is white when laid and turns black within minutes. / 雌蚊把卵一粒一粒产在水面上方潮湿的壁上。每粒卵不到一毫米长，刚产下是白色的，几分钟内就变黑。 |
| 2 | 同上；labels eggs, dish-water | At twenty-eight degrees, a larva takes about two and a half days to form inside the egg. Then the egg can wait, dry, for months. When rising water covers it, the larva hatches. / 在 28°C 下，卵里的幼虫大约两天半成形。之后卵可以干着等上好几个月，等水涨上来淹没它，幼虫就孵出来。 |
| 3 | camera underwater 对准 L4；run；labels larva-l4, dish-water；空气流 | A larva is not a worm. It has a head, a thorax and an abdomen. It hangs head down and breathes air through a short tube, the siphon, at the tip of its body. The cool-coloured dots are air. / 孑孓不是蠕虫，它有头、胸、腹三部分。它头朝下倒挂着，用身体末端一根短短的呼吸管伸出水面吸气。冷色的小点就是空气。 |
| 4 | camera L3 头部；食物流；labels larva-l3 | Brushes beside its mouth sweep tiny bits of food out of the water. The green dots are food. Larvae eat; that is how they grow. / 嘴边的口刷把水里微小的食物扫进嘴里。绿色的小点就是食物。孑孓要吃东西，才能长大。 |
| 5 | camera dish（侧前，L1–L4 同框）；labels larva-l1, larva-l2, larva-l3, larva-l4, moult-skins | Its hard outer skin cannot stretch, so a larva grows in steps. It sheds its skin, then grows bigger in the new one. The four sizes are called instars. / 孑孓坚硬的外皮撑不大，所以它一步一步地长：蜕掉旧皮，在新皮里再长大。这四种大小叫做四个龄期。 |
| 6 | sim day 4；camera dish；labels larva-l4（标记圈是 context，不标注，它自己就是记号） | In this model, at twenty-eight degrees, the larva is in its fourth instar by day four after hatching. The ring marks where it is. / 在这个模型里，水温 28°C 时，孑孓到孵化后第 4 天已经是第四龄。那个圈标出它此刻在哪一站。 |

- **试一试 T1**：`vary: day`，`keep: [temp, { en: "Same food, same number of larvae", zh: "同样的食物、同样多的孑孓" }]`，`observe: [stage, days-left]`，`record: true`（若 F-26 找到头壳宽：`observe` 加 `head-width`，`record: { chart: { y: head-width } }`——阶梯形的折线图就是"分步长大"）；`predict`（只有 `head-width` 时做）：prompt "From day 0 to day 1, does the larva's head get wider?" / "从第 0 天到第 1 天，孑孓的头会变宽吗？"，`start: { day: 0 }`，`change: { day: 1 }`，`observe: head-width`，options 一样 `same` / 变宽 `more`（答案：一样——只在蜕皮时才变）。
- **细看**：`Not a worm`（M-2；R: ANAT-11–12：没有分节的足，但有头、胸、腹）；`Eggs that wait`（F-22、F-23：新产的卵还不耐干，成形以后才能等；为什么第 06 章要擦壁）；`Growing in steps`（链 grasshopper 第 06 章的蜕皮；"小孑孓的大小是示意"）；`Where the days come from`（S16：雄蚊、28 °C、Khan 饲料；NEA "约四天" S4）。
- **本章索引**：eggs, dish-water, larva-l1, larva-l2, larva-l3, larva-l4, moult-skins
- **名词首现**：larva、siphon、instar、moult（定义里链蝗虫的 `moult`）。

### 5.5 第 04 章 `pupa-to-adult`

- **summary**：After its last moult the larva becomes a comma-shaped pupa. The pupa does not eat, but inside it the body is rebuilt into an adult, which then climbs out onto the water. / 最后一次蜕皮后，孑孓变成逗号形的蛹。蛹不吃东西，但它的身体在里面被改造成成虫；成虫随后从蛹壳里钻到水面上。
- **正文提纲**：① 第四次蜕皮 → 蛹；逗号形：头胸部 + 卷起的腹 + 桨（F-27、F-28）。② 用呼吸角在水面吸气；不吃东西（F-27）。③ 会翻滚下潜（"tumbler"），不是睡着（M-4）；成虫的足、翅在头胸部里成形（F-27 R: ANAT-17）；28 °C 约 1.9 天（F-20），NEA 约两天（F-18）。④ 羽化：吞空气、撑裂、头先出、在水面上（F-29）。⑤ 卵、幼虫、蛹、成虫四个样子完全不同 = 完全变态；蝗虫没有蛹 = 不完全变态（F-17，M-9；链 grasshopper）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（underwater 对准蛹，run）；labels pupa | After its fourth moult the larva becomes a pupa, shaped like a comma. It breathes through two short trumpets on its back that touch the surface. / 第四次蜕皮后，孑孓变成蛹，形状像一个逗号。它用背上两根短短的呼吸角贴着水面呼吸。 |
| 2 | pose pupa-dive；labels pupa | A pupa does not eat. It is not asleep, though: when the water is disturbed it rolls and dives, then floats back up. / 蛹不吃东西，但它不是在睡觉：水一被搅动，它就翻滚着潜下去，然后再浮上来。 |
| 3 | view xray（蛹的外壳透明，看见里面折叠的足和翅芽）；labels pupa | Inside the pupa, the body is being rebuilt into an adult: legs, wings and a long proboscis are forming under the skin. At twenty-eight degrees this takes about two days. / 在蛹里，身体正被改造成成虫：足、翅和长长的喙在皮下慢慢成形。在 28°C 下，这大约要两天。 |
| 4 | camera 羽化站；run（`emerge` 从头播）；labels pupal-case, emerging-adult | To come out, the adult takes in air. Its body swells and splits the pupal skin along the back, and the adult climbs out head first onto the water surface. / 成虫要出来时先吞进空气，身体胀大，把蛹皮从背上撑裂，然后头先钻出来，站到水面上。 |
| 5 | camera dish；sim compare true；labels eggs, larva-l4, pupa, emerging-adult | Egg, larva, pupa, adult: four stages that look completely different. This is called complete metamorphosis. A grasshopper has no pupa; its young already look like small adults. / 卵、幼虫、蛹、成虫：四个样子完全不同的阶段，叫做完全变态。蝗虫没有蛹，它的若虫看起来已经像缩小的成虫。 |

- **试一试 T1（续）**：`set: { day: 5 }`；`vary: day`，`keep: [temp]`，`observe: [stage, days-left]`，`record: true`；没有先猜后看。
- **细看**：`A pupa that moves`（M-4；"tumbler"）；`Coming out`（F-29；画面里加快了；新成虫在水面上停一会儿再飞——待核来源，核不到删）；`Males first`（F-21）；`Complete and incomplete`（M-9；蝗虫三阶段链 `<TopicLink slug="grasshopper" ch="nerves-and-growing-up">`；蝴蝶也是四阶段，配图 `mosquito-three-life-cycles` 在第 05 章）。
- **本章索引**：pupa, pupal-case, emerging-adult, larva-l4, eggs
- **名词首现**：pupa、breathing-trumpet、emergence、complete-metamorphosis、incomplete-metamorphosis。

### 5.6 第 05 章 `round-the-cycle`

- **summary**：Egg, larva, pupa, adult, and back to eggs: the cycle repeats. In warm water an Aedes mosquito goes from hatching to adult in about a week; in cooler water it takes longer. / 卵、幼虫、蛹、成虫，再回到卵：这一圈周而复始。在温暖的水里，伊蚊从孵化到成虫大约一周；水凉一些，就要更久。
- **正文提纲**：① 整个环与天数（F-20 28 °C、F-18 NEA、F-19 CDC）；成虫约活两周、约三次产卵，所以环一直转（F-16、F-11）。② 公平测试：只改水温（T2），在一项实验室研究里 20 °C 约 13 天、32 °C 约 6½ 天（F-20）。③ 新加坡全年温暖（F-45 待核）。④ 对照：蝗虫三阶段、几个月（F-30）；蝴蝶四阶段（配图）；"不同生物有不同的生活史"（S2 第 42 页）。⑤ 能预测：知道大约一周，就知道积水要多久检查一次（引到第 06 章）。配图 `mosquito-three-life-cycles`（④ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | camera dish；run；labels eggs, larva-l1, pupa, emerging-adult | Follow the dots round: egg, larva, pupa, adult, and back to eggs. In one laboratory study at twenty-eight degrees, the trip from hatching to adult took about seven days. / 跟着小点绕一圈：卵、幼虫、蛹、成虫，再回到卵。在一项实验室研究里，水温 28°C 时，从孵化到成虫大约七天。 |
| 2 | sim temp 20；labels larva-l4 | At twenty degrees, the same trip took about thirteen days. The dots move more slowly. / 水温 20°C 时，同样一圈大约要十三天，小点也走得慢些。 |
| 3 | sim temp 32 | At thirty-two degrees, it took about six and a half days. In these measurements, warmer water meant faster growth. / 水温 32°C 时，大约六天半。在这些测量里，水越暖，长得越快。 |
| 4 | sim temp 28；camera hero（雌蚊）；labels abdomen, eggs | An adult female lives about two weeks outdoors. In that time she can lay eggs about three times, so the cycle keeps turning. / 雌蚊在野外大约活两周，这段时间里能产三次左右的卵，所以这一圈不停地转下去。 |
| 5 | sim compare true；camera hero；labels pupa, larva-l4 | A grasshopper's life cycle has three stages: egg, nymph and adult, and it takes months. A mosquito's has four, because it has a pupa. / 蝗虫的生活史有三个阶段：卵、若虫、成虫，要好几个月。蚊子的有四个阶段，因为多了蛹。 |

- **试一试 T2**（本主题的招牌公平测试）：`vary: temp`，`keep: [{ en: "Same food", zh: "同样的食物" }, { en: "Same number of larvae in the same amount of water", zh: "同样多的水里放同样多的孑孓" }]`，`observe: [to-adult, larva-days, pupa-days]`，`record: { chart: { y: [larva-days, pupa-days, to-adult] } }`（折线图，四个温度）；`predict`：prompt "Warmer water, from 28 °C to 32 °C: will the young take more days or fewer to become adults?" / "水温从 28°C 升到 32°C，孑孓变成成虫要的天数会更多还是更少？"，`start: { temp: 28 }`，`change: { temp: 32 }`，`observe: to-adult`，options 更多 `more` / 更少 `less` / 一样 `same`。
- **细看**：`A fair test`（只改水温；为什么要同样的食物和密度：S17 Couret——食物、密度也会改变发育快慢，R: BIO-28）；`Not warmer and warmer for ever`（M-8：35 °C 卵孵化率约一半、36 °C 不孵化，S15）；`Singapore is warm all year`（F-45）；`Other life cycles`（蝗虫 F-30 链 grasshopper；蝴蝶；植物链 `plant`；配图）；`Where the numbers come from`（S16 表 2、雄蚊、§2.4 的缩放一句）。
- **本章索引**：eggs, larva-l1, larva-l4, pupa, emerging-adult, abdomen
- **名词首现**：无新词（“公平测试”正文一句话解释，不进名词表）。

### 5.7 第 06 章 `breaking-the-cycle`

- **summary**：Tip out still water, and the larvae and pupae in it die before they become adults. Scrub off the eggs too. This is how homes in Singapore help to stop dengue. / 把积水倒掉，水里的孑孓和蛹就会在长成成虫之前死去；再把壁上的卵刷掉。新加坡的家庭就是这样帮助阻止骨痛热症的。
- **正文提纲**：① 骨痛热症（登革热）：病毒病、由被感染的伊蚊传播（F-31）；主要征兆（F-33 待核），觉得不舒服告诉大人、去看医生（R: DENGUE-02）；新加坡近几年的病例（细看小表，F-35）。② 为什么倒水有用：前三个阶段离不开水，倒掉积水，孑孓和蛹就死；但卵在壁上能等好几个月（F-23）→ 擦壁；隔多久？在一项实验室研究里 28 °C 约一周（F-20）→ 定期检查（F-40）。③ 家里最常见的积水（F-34）。④ B-L-O-C-K 五步（F-37、F-38；"和家里的大人一起"）。⑤ Project Wolbachia（F-43、F-44）。⑥ 保护自己：S-A-W（细看，F-39）。配图 `mosquito-empty-saucer`（④ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（dish，drained，`every 14`，`wipe false`：飞走的成虫在、卵在）；labels dish-water, larva-l4, eggs | Here the water has been tipped out. The larvae and pupae die, because they can only live in water. Before this, some had already become adults and flown away. / 这里的积水已经倒掉了。孑孓和蛹都会死，因为它们只能在水里生活。不过在倒水之前，已经有一些长成成虫飞走了。 |
| 2 | sim wipe true（卵消失）；labels eggs | The eggs on the wall can survive dry for months, so tipping out the water is not enough. Scrubbing the wall gets rid of them too. / 壁上的卵能干着活好几个月，所以只倒水还不够。把壁刷一刷，卵也除掉了。 |
| 3 | camera home；layers home；labels pail, pot-plate, vase, soil-hardened, roof-gutter | In Singapore homes, Aedes larvae are found most often in pails, flower pot plates and vases. Hardened soil in pots and blocked roof gutters can hold water too. / 在新加坡的住家里，最常发现孑孓的地方是水桶、花盆底盘和花瓶。花盆里干硬的泥土和堵塞的屋顶檐槽也会积水。 |
| 4 | hide follow-marker, soil-hardened, plate-water, bti-granules（soil-loosened 不再隐藏）；pose home-bl；labels soil-loosened, pot-plate | B: break up hardened soil, so water sinks in instead of lying on top. L: lift and empty flowerpot plates. / B：铲松干硬的泥土，让水渗下去，不积在表面。L：拿起花盆底盘，倒掉积水。 |
| 5 | hide follow-marker, soil-hardened, plate-water, pail-water, bti-granules；pose home-oc；highlight.custom vase-water 浅色；labels pail, vase | O: overturn pails and wipe their rims. C: change the water in vases. / O：把水桶倒过来放，并擦干桶边。C：更换花瓶里的水。 |
| 6 | hide follow-marker, soil-hardened, plate-water, pail-water, gutter-debris, gutter-water（bti-granules 显示）；pose home-oc；labels roof-gutter, bti-granules | K: keep roof gutters clear, and place BTI insecticide inside. Do these steps with an adult, and check your home regularly. / K：疏通屋顶檐槽，并在里面放 BTI 杀蚊药。和家里的大人一起做，并且定期检查。 |
| 7 | camera heads；layers 蚊子；hide []；pose drained（皿在背景里仍是倒空的）；labels male-antennae, male-body | Singapore also releases male mosquitoes that carry Wolbachia bacteria. Males do not bite. When they mate with wild females, the eggs do not hatch, so fewer Aedes mosquitoes grow up. / 新加坡还释放带有沃尔巴克氏菌的雄蚊。雄蚊不叮人。它们和野外的雌蚊交配后，产下的卵不会孵化，长大的伊蚊就少了。 |

- 第 3–6 拍都写 `layers: [home]`、`camera: home`（拍的字段不累积，只改它写的）；第 7 拍写 `layers` 蚊子各组。
- **试一试 T3**：`vary: every`，`also: [wipe]`，`keep: [temp, { en: "Same dish, refilled with water each time", zh: "同一只皿，每次倒完再装满水" }]`，`observe: [adults, eggs-left, to-adult]`，`record: true`；`predict`：prompt "If the water is tipped out every 10 days, will any adults fly away?" / "如果每隔 10 天才倒一次水，会有成虫飞走吗？"，`start: { every: 6 }`，`change: { every: 10 }`，`observe: adults`，options 没有 `none` / 有 `some`。
- **细看**：`Signs of dengue`（PE 第 96 页；F-33：WHO / MOH 原文列的征兆；觉得不舒服告诉大人、看医生；很多人病得轻，有些人会重，R: DENGUE-02）；`Dengue in Singapore`（F-35 小表：2019–2025 每年病例；2020 年最多；F-36 死亡一句，§0.1-3）；`Protect yourself: S-A-W`（F-39）；`Clean water counts too`（M-1，F-42 待核）；`How Wolbachia works`（F-43、F-44：只针对埃及伊蚊、仍要清积水）；`Why "regularly"?`（§2.4：一周左右；32 °C 时 6.4 天；个体有快有慢）。
- **本章索引**：dish-water, eggs, larva-l4, pail, pot-plate, vase, soil-hardened, soil-loosened, roof-gutter, male-body
- **名词首现**：breeding-habitat、mozzie-wipeout、bti、wolbachia。

### 5.8 拍数与配图

- 拍数：00 四、01 五、02 五、03 六、04 五、05 五、06 七 = **37 拍**。
- 配图位置：`mosquito-water-stages` 第 03 章 ① 段后（"真实的容器里各阶段混在一起"）；`mosquito-larva` 第 03 章 ② 段后；`mosquito-three-life-cycles` 第 05 章 ④ 段后；`mosquito-empty-saucer` 第 06 章 ④ 段后。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（18 个候选，目标 14–16 个，正文用不到的删）

中文照新加坡用法（R: ZH-01–10）；与蝗虫主题重名的概念定义写法对齐 `grasshopper/data/glossary.json`（`instar`、`moult`、`incomplete-metamorphosis`、`compound-eye`）。

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `aedes` | Aedes mosquito / 伊蚊 | 一类白天叮人为主、黑底白斑的蚊子；新加坡的骨痛热症主要由埃及伊蚊传播 | dengue |
| `life-cycle` | life cycle / 生活史 | 一种生物从出生到长成、再生下一代的各个阶段，一圈接一圈 | complete-metamorphosis |
| `larva` | larva / 幼虫（孑孓） | 蚊子孵化后住在水里、会吃东西长大的阶段；蚊子的幼虫叫孑孓 | instar, siphon |
| `pupa` | pupa / 蛹 | 幼虫和成虫之间不进食的阶段，身体在里面改造成成虫 | emergence |
| `instar` | instar / 龄 | 幼虫两次蜕皮之间的一段；蚊子幼虫有四个龄期 | moult |
| `moult` | moult / 蜕皮 | 脱掉旧的外皮，换上一层更大的新皮 | instar |
| `complete-metamorphosis` | complete metamorphosis / 完全变态 | 卵、幼虫、蛹、成虫四个样子完全不同的阶段 | incomplete-metamorphosis |
| `incomplete-metamorphosis` | incomplete metamorphosis / 不完全变态 | 卵、若虫、成虫三个阶段，没有蛹（如蝗虫） | complete-metamorphosis |
| `proboscis` | proboscis / 喙 | 蚊子细长的口器；外面是鞘，里面是口针 | — |
| `palp` | palp / 触须 | 喙两旁的一对短感觉器官 | — |
| `haltere` | haltere / 平衡棒 | 翅后的一对小棒，帮助飞行时保持平衡；由后翅变来 | — |
| `siphon` | siphon / 呼吸管 | 孑孓身体末端伸出水面吸气的短管 | larva |
| `breathing-trumpet` | breathing trumpet / 呼吸角 | 蛹背上贴着水面吸气的一对短管 | pupa |
| `emergence` | emergence / 羽化 | 成虫从蛹壳里钻出来 | pupa |
| `dengue` | dengue / 骨痛热症（登革热） | 由病毒引起、靠被感染的伊蚊叮咬传播的病 | aedes |
| `breeding-habitat` | breeding habitat / 滋生处 | 蚊子产卵、幼虫和蛹生活的积水 | mozzie-wipeout |
| `mozzie-wipeout` | Mozzie Wipeout (B-L-O-C-K) / 灭蚊行动 | NEA 的五步清除积水办法 | breeding-habitat |
| `wolbachia` | Wolbachia / 沃尔巴克氏菌 | 一种细菌；带它的雄蚊与雌蚊交配，卵不孵化 | — |

（`bti` 不单列：第 06 章第 6 拍的字幕和细看各解释一次。）

### 6.2 来源（施工时进 `sources.json`；访问日期一律 2026-10-19）

| P# | 来源 | 用于 |
|---|---|---|
| P1 | **本设计研究**（S1，自描述）：DESIGN 尺寸、§2.4 的模型规则与全表、示意之处（L1–L3 大小、口针根数、皿与水深、环的排法、家居比例） | 规格行、PLATE、环卡、细看"About this model" |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six*（2023，Updated Jan 2026），第 38、41、42 页（PDF：moe.gov.sg …/Primary-Science-Syllabus-2023_May24.pdf） | §1.1、00、05 |
| P3 | MOE SDCD，*Physical Education Syllabus — Primary, Secondary & Pre-University*（2024），第 96 页 | §1.1、06 |
| P4 | NEA，*Aedes Mosquito*（nea.gov.sg/dengue-zika/prevent-aedes-mosquito-breeding/aedes-mosquito，updated 13 Apr 2026） | F-10、11、14、16、18、23、31 |
| P5 | NEA，*Know The Potential Aedes Breeding Sites*（updated 14 Apr 2026） | F-34 |
| P6 | NEA，*Fight Dengue / 进行灭蚊行动，杜绝骨痛热症* A5 双语传单（2022） | F-38、F-39 |
| P7 | NEA，*Mozzie Wipeout Checklist / 灭蚊行动检测清单*（2019） | F-40、中文用词 |
| P8 | NEA，*Wolbachia-Aedes Mosquito Suppression Strategy*（EHI 页，update 13 Mar 2026） | F-44 |
| P9 | NEA，*How Does Wolbachia-Aedes Suppression Technology Work?*（updated 9 Apr 2026） | F-43 |
| P10 | NEA，*Male Mosquitoes Do Not Bite or Transmit Disease* | F-10、F-43 |
| P11 | NEA，*Project Wolbachia Reaches Half Of Singapore Households With Expansion To Five New Areas*（13 Mar 2026） | F-44 |
| P12 | Lim et al., Project Wolbachia–Singapore Consortium, *Dengue Suppression by Male Wolbachia-Infected Mosquitoes*, NEJM（online 11 Feb 2026），DOI 10.1056/NEJMoa2503304 | F-44 |
| P13 | Zettel Nalen & Kaufman, *Yellow Fever Mosquito, Aedes aegypti*, UF/IFAS Featured Creatures EENY-434，DOI 10.32473/edis-in792-2009 | F-1、3–7、11–13、21、25–27、29 |
| P14 | Service, *Medical Entomology for Students*, 2nd ed.（Cambridge UP 2000），第 1 章第 2–4、8–10 页（出版社样章 PDF） | F-2、8、9、25、27 |
| P15 | UF/IFAS Featured Creatures EENY-319, *Asian Tiger Mosquito, Aedes albopictus* | F-4 |
| P16 | Sasmita, Tu, Bong & Neoh (2019), *Effects of larval diets and temperature regimes on life history traits … of male Aedes aegypti*, Parasites & Vectors 12:578，DOI 10.1186/s13071-019-3830-z（CC BY 4.0）表 2 | F-2、F-20、模型 |
| P17 | NEA，*Understanding Singapore's Mosquito Landscape: Why Different Species Matter*（Annex B，13 Mar 2026） | F-4、F-5、F-14 |
| P18 | CDC，*About Mosquitoes*（body parts，14 May 2024） | F-8、触角 / 触须的作用 |
| P19 | CDC，*Life Cycle of Aedes Mosquitoes*（16 Apr 2024） | F-12、15、17、19、23 |
| P20 | WHO，*Dengue and severe dengue: questions and answers* | F-14、F-15 |
| P21 | Farnesi et al. (2009), *Embryonic development of Aedes aegypti … different constant temperatures*, Mem Inst Oswaldo Cruz 104(1):124–126，DOI 10.1590/S0074-02762009000100020 | F-22、M-8 |
| P22 | Farnesi et al. (2015), *Physical features and chitin content of eggs …*, J Insect Physiol 83:43–52，DOI 10.1016/j.jinsphys.2015.10.006 | F-23、F-24 |
| P23 | Yamany, Adham & Abdel-Gaber (2024), *Morphological description of the pupa of Aedes aegypti … scanning electron microscope*, Arq Bras Med Vet Zootec 76(1):43–54，DOI 10.1590/1678-4162-13120 | F-27、F-28 |
| P24 | WHO，*Dengue and severe dengue*（fact sheet，21 Aug 2025） | F-31、32、33 |
| P25 | MOH / HealthHub 的骨痛热症页（征兆、何时看医生）（**待找**） | F-33 |
| P26 | UC Statewide IPM，*Insects with incomplete metamorphosis …*（图说） | F-17 |
| P27 | NEA，*Dengue Cases*（B-L-O-C-K 文字，updated 17 Oct 2026） | F-37、F-41（BTI 待核） |
| P28 | NEA，*NEA Urges Continued Vigilance …*（5 Dec 2022，第 7 段） | F-37 |
| P29 | Christophers (1960), *Aedes aegypti (L.), the Yellow Fever Mosquito*（Cambridge UP；archive.org 是否有全文待核） | F-26 头壳宽（待核） |
| P30 | NEA，*Number Of Weekly Dengue Cases Expected To Exceed The Historical High Of 891 …*（3 Jun 2020）：2019 全年 | F-35 |
| P31 | NEA，*Integrated Sustainability Report 2020/2021*（High Standards of Public Health）：2020 全年 35,315 | F-35 |
| P32 | NEA，*Integrated Sustainability Report 2021/2022*，第 18 页：2021 全年 5,258、2020 年 35,266 | F-35 |
| P33 | NEA，*Dengue Cases Dropped By 69 Per Cent To 9,949 Cases In 2023 …*（31 Mar 2024）：2022、2023 全年 | F-35 |
| P34 | NEA，*Singapore Enters Peak Dengue Season …*（16 May 2026）：2024 全年 | F-35 |
| P35 | NEA，*Dengue Surveillance Data*（季度报告 2019 Q4 – 2025 Q4）：2025 四个季度、各年死亡人数 | F-35、F-36 |
| P36 | 新加坡气象局（MSS），*Climate of Singapore*（**待找**） | F-45 |
| P37 | Couret, Dotson & Benedict (2014), *Temperature, Larval Diet, and Density Effects on Development Rate and Survival of Aedes aegypti*, PLOS ONE 9(2):e87468 | 05 细看"公平测试" |
| P38 | 雌蚊叮咬时口针与下唇鞘的动作（**待找**：一篇开放获取的显微观察论文，如 Choumet et al. 2012 PLoS ONE 的活体成像） | `stylets`、02 第 2 拍 |
| P39 | 联合早报的用词证据（R: ZH16、ZH24、ZH22、ZH17、ZH25） | 中文用词（不进正文，只进 `sources.json` 的 note 与 §6.1） |
| P40 | Menendez, Rosengren & Alibali (2022), JECP（ERIC ED622917）；Khun & Manderson (2007), PLoS NTD | §1.4 的说明（细看不引，只在 S1 note） |

- 只读到摘要的、挡爬虫的，照 `writing-rules.md`「来源可达性」写 `note`。参考图不进来源（§3.3、§9）。

---

## 7. 图像清单（石墨图版风格，给 Codex）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3。**图只当插画，不当事实依据**；主会话入库前逐张对照 §2 与参考图，错的重画。共同要求：无文字、无数字、无人物、无血、无皮肤、无"恐怖"构图（不从正面仰拍口器）、不拟人（幼虫和蛹不画成"有脸"）。

### 7.1 Codex 草稿审查（`art/planned/mosquito/`，2026-10-18 生成）

| 草稿 | 看到的 | 决定 |
|---|---|---|
| `mosquito.png`（封面，1024²） | 背视展翅的雌蚊标本：六足、两翅、平衡棒、竖琴形胸纹、腹节白带、足上白环、细长的喙、稀毛触角；无文字、灰度、透明底。差别：触须没画出来（雌蚊触须短，背视可能看不见）、头和复眼偏小、翅展开（标本式，和模型静息姿态不同）、白环在股节上也有 | **沿用**（`genimg/roadmap/mosquito.png` → `public/illustrations/mosquito.webp`）。图是插画，不作形态依据；差别不影响认出"一只伊蚊" |
| `mosquito-water-stages.png`（1536 × 1152） | 浅盆剖面、水面以上的壁上一圈卵（对）、一只倒挂的孑孓（对）、一只逗号形的蛹贴水面（对）。问题：孑孓头部正对观者、两只"眼睛"像一张脸（拟人感）；蛹有一只很大的眼睛、腹端画成孑孓那样的毛刷而不是一对桨；盆像深碗 | **重画**（SUBJECT 见下，加：孑孓侧视、眼点小而在侧面；蛹腹端一对平桨；浅盘；水里多放几只不同大小的孑孓和两只蛹，表达"各阶段混在一起"） |
| `mosquito-empty-saucer.png`（1536 × 1152） | 竖起晾干的空底盘、旁边一盆绿萝、盆不坐在水里、底部有排水孔；无昆虫、无人、无文字 | **沿用**（第 06 章）；排水孔的拱形缺口略怪，可接受 |

### 7.2 终版清单

| 文件 | 用途 | SUBJECT（原样英文） |
|---|---|---|
| `genimg/roadmap/mosquito.png` → `public/illustrations/mosquito.webp` | 首页图版（沿用草稿） | （草稿已生成，见 `art/planned/manifest.jsonl` 第 80 行） |
| `public/illustrations/figures/mosquito-water-stages.webp` | 第 03 章：真实容器里各阶段混在一起（重画） | a side-on cutaway of a shallow plastic flowerpot plate holding still water, greatly enlarged as a natural-history plate: a band of tiny dark elongated eggs stuck one by one to the dry inner wall just above the waterline; under the flat water surface, five mosquito larvae of different sizes hanging almost straight down, each seen from the side, with its short dark breathing tube touching the surface, a rounded head with only a small dark eye spot on its side and a fan of fine mouth brushes, a wide thorax with small tufts of hair and a slim segmented abdomen; two comma-shaped pupae floating just under the surface with a pair of short breathing trumpets touching the air and a curled abdomen ending in two flat paddles; one cast-off larval skin floating; no adult, no faces, no arrows, no text |
| `public/illustrations/figures/mosquito-larva.webp` | 第 03 章：孑孓不是蠕虫（新） | a single fourth-stage Aedes mosquito larva in side view, greatly enlarged as a natural-history plate: a rounded head capsule with short antennae, a small dark eye spot on the side and a pair of fan-shaped mouth brushes; a broad thorax wider than the abdomen with tufts of fine hairs at the sides; eight slim abdominal segments with small hair tufts; a short dark breathing siphon at the tail end; a saddle-shaped plate on the last segment with four small finger-like anal gills; the larva hanging head down from a thin horizontal line that marks the water surface, the tip of the siphon at the line; no face, no text, no scale bar |
| `public/illustrations/figures/mosquito-three-life-cycles.webp` | 第 05 章：三种生活史对照（新） | three animal life cycles drawn side by side on one natural-history plate, each arranged as a small ring of specimens joined by fine curved arrows in order: on the left a mosquito cycle with dark eggs on a damp container wall just above water, a larva hanging below the water surface, a comma-shaped pupa at the surface and an adult mosquito; in the middle a butterfly cycle with tiny eggs on a leaf, a caterpillar on a leaf, a chrysalis hanging from a twig and an adult butterfly with open wings; on the right a grasshopper cycle with an egg pod half buried in soil, a small wingless nymph with wing buds and an adult grasshopper; the three rings the same size, specimens recognisable but not to scale, no text, no numbers, no people |
| `public/illustrations/figures/mosquito-empty-saucer.webp` | 第 06 章：倒掉底盘的积水（沿用草稿） | （草稿已生成，见 manifest 第 82 行） |

- 封面与"三种生活史"两张：主会话核对蝴蝶是完全变态四个阶段、蝗虫的若虫有翅芽而无完整的翅、卵荚在土里。重画的水中阶段：核对孑孓没有"脸"、蛹有桨、卵在水线以上。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；本主题**不需要新依赖**；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 #5 那一行与 B1 / B2 / B12 的状态同步（B1 由 E-M2 + 数据做到；B2 用 `sequence` 绕过；B12 用 `membrane` 绕过）；docs/README 加一行 | 主会话 | docs/33、docs/17、docs/README | — | 0.1 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts mosquito --engine space-scene --subject biology --title-en "A Mosquito's Life Cycle" --title-zh "一只蚊子与它的生活史"`；参考图 R1–R11 下到 `scripts/geo/mosquito/refs/`，逐张核许可 | 主会话（参考图可交 Opus 内容代理） | 主题目录、refs | validate 绿；参考图看过 | 0.5 天 |
| E | E-M1 模型 + E-M2 环卡 + 夹具主题 `sample-life-cycle` + 测试 + docs/06 新节 | Opus 引擎（一个代理） | §4.5 的文件；**不碰** `src/content/topics/mosquito/` | §4.6 全勾 | 2 天 |
| D1 | 数据骨架：45 零件 + 6 context、6 组 + 3 个只有流的组（含 `scale`）、三条流（路径由生成脚本写出）、动画、姿态、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后加） | Opus 内容（几何 + 数据），**与 E 并行** | `src/content/topics/mosquito/data/parts.json`、`chapters/*.mdx` frontmatter、`scripts/geo/mosquito/build-parts.ts`（站位、卵、孑孓四龄、环流路径的生成脚本） | validate 0 error；与 spec 的差异写进汇报 | 1.5 天 |
| D2 | R2 几何两轮（雌蚊侧视 / 背视对照 R1–R2，孑孓、蛹对照 R7–R9，干涉检查）→ R3 材质（黑鳞的 `chitin`、白鳞、`membrane` 翅、玻璃与水、dark plate 下的白斑）→ R4 流、动画、姿态；E 合并后加 `sim` 与绑定 | Opus 内容（视觉） | 同上 + `docs/screenshots/mosquito/` | 每轮 `pnpm shoot mosquito` 截图自证；calls / 三角形在 §3.4 预算内 | 3 天 |
| T1 | 来源逐条读、待核落定（F-2、F-26、F-33、F-36、F-40–42、F-45、P25、P29、P36、P38）；S1 设计研究来源（§2.4 全文）；英文草稿：零件 summary / detail、正文、细看、名词定义、`sources.json` 英文 | Codex 起草 → Opus 内容复核事实 | `sources.json`、`glossary.json`、parts.json 文本字段、`chapters/*.mdx` 正文 EN、`SOURCES.md` | 事实表与来源一一对应；`sources-md.ts mosquito` | 2 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（新加坡用法 §1.6、§6.1；中文独立成文） | Claude（Opus） | 同上 ZH 字段 | 用词与名词表一致 | 1 天 |
| I | 图：重画 `mosquito-water-stages`，新画 `mosquito-larva`、`mosquito-three-life-cycles`；入库四张 + 封面 | Codex 出图 → 主会话逐张审 | `genimg/`、`public/illustrations/` | §7 的核对点 | 0.5 天 |
| B | 37 拍定稿：镜头、标注、`sim.set`、姿态、字幕 EN / ZH | Sonnet | `state.beats` | `--beats` 0 失败、无漏标、四种组合 | 1 天 |
| P | HUD 排版、模式组合、手机、事实与代码审计、`grasshopper` 第 06 章细看补链接（主会话改） | Sonnet QA；视觉问题回 Opus | — | §8.2 全勾 | 1 天 |

- 合计：引擎约 2 天（与 D1 并行）；内容约 9.5 天。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）；Codex 的草稿交给 Opus 内容代理合并，不直接写主题目录。
- **样章**：第 03 章（卵与孑孓 + T1）先做完给 Gavin 看——最能检验水下的可读性、孑孓的写实度和环卡。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：第 42 页"不同生物有不同的生活史""隔一段时间观察、比较动物的生活史（蚊子）"在 03–05 章的正文或拍里；第 41 页"循环能帮助预测"在第 05 章正文与 T3；第 38 页"昆虫"在第 00、01 章；PE 第 96 页"征兆、症状、预防措施"在第 06 章正文。
- [ ] **必须讲对的九处**（§0 D7）各有一拍或一段正文；全文无"孑孓是虫子 / 蠕虫"的肯定说法、无"所有蚊子都叮人"、无"蛹在睡觉"（误解引用处除外）；`grep` 字幕和正文无"杀手""致命""可怕"。
- [ ] **误解目录** M-1–M-9 每条在指定章出现并给出正确说法。
- [ ] **数字一致**：环卡、试一试卡片、PLATE、字幕、正文、细看、S1 里同一个量同值（7.2 / 13.4 / 10.2 / 6.4 天；28 °C 的整数天阶段表；61.6 小时；0.63 mm；8 mm；0.61 / 2.63 / 0.92 mm；约九个月；约两周；约 100 粒 × 约 3 次；约七天；病例年表）；模拟的写"在这个模型里 / in this model"；实测的写"在一项实验室研究里、雄蚊、某温度"。单测 `tests/space-scene/mosquito-topic.test.ts`：字幕里的模拟数 = 该拍设置下模型的输出；正文里每个 S1 数字 = 模型输出或设计值；`days` 表 = S16 表 2。
- [ ] **试一试**：03、04、05、06 四章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；T2 有表 + 折线图 + 先猜后看；T3 先猜后看不判对错、中英文都对；`every` 8 起才出现飞走的成虫、擦壁后卵消失。
- [ ] **环卡**：每章都在（00–02 高亮成虫）；顺时针、12 点起；天数随水温变；"在水里"的弧带；`compare` 拍里并排蝗虫三阶段、链接能跳到 `grasshopper` 第 06 章；读屏文字中英；< 1024 px 收进试一试卡片。
- [ ] **写实**：Tier-1 清单（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"一只蚊子和水里的孑孓"；雌雄触角一眼分得出；孑孓倒挂、呼吸管在水面；蛹的呼吸角贴水面；卵在水线以上；并排图 `geo-*.png`。
- [ ] **克制**：无血、无皮肤、无人；`fed` 姿态只在 X-RAY 下、中肠颜色不是血红；家居一角无品牌、无文字。
- [ ] **两种比例不同框**：家居组只在第 00 章第 4 拍与第 06 章第 3–6 拍出现，那几拍 `layers` 不含蚊子各组；组级比例尺在两边都对（`2 MM · ×200` / `20 CM`）。
- [ ] **链接**：`<TopicLink>` 到 `grasshopper`（`whole-animal`、`armour-and-senses`、`nerves-and-growing-up`）、`plant` 的 `ch` 全部通过 validate；`grasshopper` 第 06 章细看补回链（主会话）。
- [ ] **性能**：标本区静止 ≤ 60 calls（目标）/ 运转 ≤ 70 / 上限 100；三角形 < 0.4 M；三条流各 1 次；模型一次求值 < 0.1 ms。超过目标时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片、收进去的环卡在抽屉里可用，按钮 ≥ 44 px；孑孓在 underwater 镜头里看得清。
- [ ] 首页图 + 4 张配图逐张核对 §7。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot mosquito --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

### 9.1 引擎（E-M1 + E-M2，WIP + Codex, 2026-10-19）

**做了什么**：§4.6 的 E-M1、E-M2 全部，建在 docs/30、docs/31 已落地的试一试核心之上：试一试卡（改变 / 不变 / 观察、`[ ]`、`T`、记一行、`record.chart` 折线图、先猜后看、URL `sim=`）、`visible` / `pose` / `tint` 绑定、多路径流的 `intensity`（速度模式）、背景章的 `note`、PLATE 读数与块尾 `SIM` 行都直接沿用，没有改它们的代码。夹具主题 `src/content/topics/sample-life-cycle/`（draft，占位文字，只用程序化积木，12 个零件 + 1 个 context：一只玻璃浅皿、水、壁上的卵、四个占位孑孓、蛹、羽化站、成虫、飞走的成虫、标记圈；一条三路径的环流 `ring` / `out` / `lay`；6 个标记姿态 + `drained`）：背景章 00（`note`）、01 天数卡（T1）、02 水温卡（T2，表 + 折线图 + 先猜后看）、03 倒水卡（T3，`drained` 姿态、擦壁开关）、04 两个环（`compare`）；`stage`、`to-adult`、`days:<组>`、`days:<阶段>`、`days-left`、`on:`、`control:`、`emptying:*`、`rate` 各用一次（`size:` 只在单测里用占位数，§4.2 说"只在 F-26 找到来源时写"）。docs/06 新增「SpaceScene · 试一试 · 生活史（life-cycle）」，改了「试一试（sim）」的模型种类一行和代码清单。

| 件 | 代码 | 要点 |
|---|---|---|
| E-M1 模型 | `lib/sim/lifecycle.ts`（新）、`sim-schema.ts`（`lifeCycleSchema`、`LIFE_STAGE_PLACES`、`SIM_KINDS` 加 `life-cycle`、`quantityKind` 一支、`lifeCycleIssues`、状态标签检查、`SimContext.contextParts`）、`schema.ts`（传 context 零件）、`lib/sim/index.ts`（注册、`SEPARATE_EXPERIMENTS['life-cycle'] = false`）、`scripts/validate-content.ts`（`card.compare.link` 的主题与章） | §4.2 全部量；`total` 缩放、最后一个边界钉在总数上；单测钉死 §2.4 全表 |
| E-M2 环卡 | `lib/sim/cycle.ts`（新，版式 + 弧上的字 + 读屏文字）、`hud/CycleCard.tsx`（新）、`View.tsx`（卡片槽、标题 LIFE CYCLE / 生活史）、`explorer/TryIt.tsx`（< 1024 px 收进试一试卡）、`space-scene.css`、`src/i18n/ui.{en,zh}.json`（`space.card.cycle`、`space.try.cycle`、`space.cycle.*`） | 见 docs/06「生活史」 |
| 测试 | `tests/space-scene/lifecycle.test.ts`（42 条）、`tests/space-scene/cycle-card.test.ts`（9 条）、样板 `tests/space-scene/fixtures/aedes-cycle.ts`（§4.2 的完整数据 = 作者模板）、`tests-e2e/sample-life-cycle.spec.ts`（10 条） | §4.6 的清单逐条 |

**§2.4 全表（单测钉死）**：阶段边界 28 °C L1 [0, 1.877)、L2 [1.877, 2.556)、L3 [2.556, 3.555)、L4 [3.555, 5.373)、蛹 [5.373, 7.23)（§2.4 写的 5.372 是 5.3726 截断，按四舍五入是 5.373，整数天的结果不变）；第 0–8 天：20 °C 一一一一二三三四四、25 °C 一一一二三四四四蛹、28 °C 一一二三四四蛹蛹成、32 °C 一一二三四蛹蛹成成；孵化到成虫 13.4 / 10.2 / 7.2 / 6.4，幼虫 9.3 / 7.6 / 5.4 / 4.7，蛹 4.1 / 2.6 / 1.9 / 1.7，环速 0.54 / 0.71 / 1 / 1.13；倒水 2 / 4 / 6 / 8 / 10 / 14 → none / none / none / some / some / some；临界：28 °C 隔 7 天 none（7 ≤ 7.23）、32 °C 隔 7 天 some（7 > 6.40）、20 °C 隔 10 天 none、隔 14 天 some。环卡弧上的字 28 °C：等水来 · 1.9 · 0.7 · 1.0 · 1.8 · 1.9 天 · 产卵。

**与 §4 的差异**（实现时的决定）：

| # | spec | 实现 | 理由 |
|---|---|---|---|
| 1 | `rate: { flow, reference }`，模型给"该流每条路径"一个值 | `rate: { flow, paths, reference }`，`paths` 由作者列出，validate 要求恰好是这条流的全部路径 | 模型是只读 `sim` 的纯函数，流在 parts.json 别处；漏列的路径会停，所以必须列全 |
| 2 | `groups: { larva: [...] }`，环卡括号写 "Larva / 幼虫（孑孓）" | 组可写数组，或 `{ stages, label }`（`label` = 环卡括号的名字）；成员必须是相邻、按顺序的计天阶段 | 括号的字要有来处 |
| 3 | 阶段 `in`：water / wall / air | 另加 `land`；`part` 可不写 | 以后的青蛙、蝗虫、植物 |
| 4 | 对照环"并排"（左本主题、右蝗虫） | 第二个环画在主环**下面**；卡上一个开关（`role="switch"`）写同一个 `compare` 控件，开时出"See the grasshopper / 看蝗虫"链接 | 右上卡约 260–280 px 宽，主环连圈外的字已占满宽度；并排要把字缩到 7 px 以下。章 / 拍 `sim.set` 照样能开关 |
| 5 | 节点"下方标签"；整张卡 `role="img"` | 名字和弧上的字都在圈外（名字在站的方位，天数在两站之间，交替不撞）；"在水里"的带和组括号在圈内；整张卡 `role="group"` + `aria-label`（读屏文字），站是按钮，当前阶段 `aria-current="step"` | 圈外一圈、圈内一圈才放得下；`role="img"` 会把里面的按钮藏起来 |
| 6 | 节点 44 px 命中区 | 命中方块是 viewBox 的 54 单位：卡片按 ≥ 82 % 画（1280 px 宽的右列）时 ≥ 44 CSS px；e2e 在 1600 与 900 宽量过 | 卡片 SVG 随列宽缩放 |
| 7 | `emptying:adults` 按 28 °C | 按**当前水温**的总数（T3 在 28 °C，结果相同）；单测另钉 32 °C、20 °C 的临界 | 模型不写死温度 |
| 8 | `control:<控件>` | 步进控件 = 值，开关 = 1 / 0；选择控件不提供 | 量是数 |
| 9 | validate `adult` order | The final stage takes no days; stages before `start` take no days. When a stage uses id `adult`, validation explicitly requires it to be last, even if the author adjusts the row coverage. | Preserves generic terminal-stage semantics and enforces the named adult rule. |
| 10 | §4.5 写"不提交" | 引擎在工作分支上提交（主会话的 brief 要求），push 等 Gavin | — |

**续建 / Codex completion**: tightened finite measurements, canonical temperature keys, duplicate rate paths and the inclusive 5 % tolerance; pinned every temperature/day reading and every stage boundary; added comparison-link validator tests. The fixture now has an open glass dish, a thin water surface, larger stage blocks that fit above the dish floor, a drained chapter without water, and escaped adults confined to that chapter. All fixture tints use tokens. Ring type meets the narrow desktop minimum; narrow chapters without a try-it experiment retain a collapsible ring. Browser tests also cover narrow comparison, cinema, 1280 px targets and keyboard selection.

**门槛与回归**：最终记录见本节末尾与根目录 `CODEX-ENGINE-REPORT.md`。回归范围按 §4.6：`sample-space`、`sample-forces`、`sample-energy`、`grasshopper`、`circuits`、`energy-conversion`。

**已知差距**：`size:`（头壳宽）没有来源，夹具不写，单测用占位数；种群模拟、按温度改孑孓摆动、读者拖动标记圈仍是 v2（§4.7）。
