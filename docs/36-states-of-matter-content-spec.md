# 36 · 物质的三态 · 内容施工 spec（`states-of-matter`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备的变体 **"实验台"**（docs/22、docs/23、docs/30、docs/31 的同类决定）：一张按实物大小画的小学科学实验台，五个工位各做一个课纲里的物质实验——称质量、量体积与倒液体、空气占据空间且有质量、压针筒、沙和糖——台边一张小桌摆着几件新加坡家里常见的东西（打气的脚车轮胎、一罐汽水、一瓶咖椰、冰块、一杯果汁、手电筒）。读者在每一章动手改一个量，看液面、针筒、秤的读数，记进数据表、画成图。本主题的任务：**P4 学生看完能说清物质是有质量、占据空间的任何东西；能用合适的器材量质量和体积；能从形状和体积两方面区分固体、液体、气体：固体形状和体积都固定，液体的形状随容器变而体积不变，气体没有固定的形状和体积、会充满整个容器、能被压缩；知道空气也是物质（占据空间、有质量），沙和糖会"倒"但仍是固体，"重"不等于"大"。**

`subject: science`；对应 2023 课纲 P4 *Cycles in Matter and Water (Matter)*（S2 第 48 页）。docs/17 §3 P4 Matter 行（"同一个量的冰、水、水蒸气装进三种容器……课纲不要求粒子模型，粒子视图只作'细看'"）、§7 D0（变量面板 + 表 + 曲线）、D3。

2026-10-20 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/30 / docs/31 / docs/33（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。课纲来源 S2 **本文起草时已用 `pdftotext -layout` 逐页读过 PDF**（Codex 下载的同一文件 `art/codex-research/states-of-matter/sources/moe-primary-science-2023-jan2026.pdf`，封面 "Updated Jan 2026"），页码是每页页脚印的数字（印的第 n 页 = PDF 第 n + 1 页）。事实来自 Codex 的研究（`art/codex-research/states-of-matter/matter-research.md` 与 `facts.json`，74 条事实、30 个来源、68 段 ≤ 25 词的原文摘录，2026-10-20 完成、自检通过；下文 R: 后面是它的 ID：C 课纲、F 科学、M 误解、X 实验、Q 题型、T 术语、E 摘录、S 来源）和起草时本人读过的课纲 PDF。**Codex 没有覆盖的数**（空气密度、水的压缩率、器材尺寸、岩石与泡沫的密度、篮球规格、孔隙率、休止角）标"待核"，施工代理读原文核对后才能用，核不到就换值或删掉。

**与 `water` 的分工**：`water`（docs/24，已发布）讲 P5 的"水的三态与互变"（熔化、凝固、沸腾 / 蒸发、凝结、0 °C 与 100 °C、水循环）。本主题**不讲物态变化**，只讲 P4 的"物质是什么、三态的形状与体积"；冰、水、水蒸气只在第 06 章出现一拍，用 `<TopicLink slug="water" ch="the-water-cycle">` 链过去。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 一张 1.6 m 长的小学科学实验台 + 台边一张小桌 + 一块"放大镜"台座**，按实物大小（1 场景单位 = 1 m），六区（§3.1）：① **称质量**：一台电子秤、一架等臂天平（比较"大而轻"的海绵和"小而重"的石头）、一盘待称的东西（石头、海绵、玻璃弹珠、一团黏土、一杯 200 ml 的水）；② **量体积**：两只 250 ml 量筒（一只倒水、一只放东西进去看水面升高）、一只高玻璃杯、一只 250 ml 锥形瓶、一只宽碗，放进量筒的石头、弹珠、黏土球、同一团黏土搓成的长条；③ **空气**：一只大玻璃水盆、一只倒扣的玻璃杯（杯底塞一团纸巾）、第二台电子秤上的一只篮球和打气筒、一只气球打气筒和两只形状不同的气球；④ **压针筒**：一个压针筒的架子，三支封住针口的 20 ml 针筒，分别装空气、水、沙，柱塞上的托盘可以一块块加 1 kg 的砝码；⑤ **沙和糖**：一碟堆成小山的沙、一碟糖、一碟水，一只装了 100 ml 干沙的量筒和一杯准备倒进去的水，一只放大镜；⑥ **身边的东西**（小桌上）：一只装在架子上的脚车轮（自行车轮）和落地打气筒、一罐没开的汽水、一瓶咖椰、碟子里的冰块、一杯果汁、一支手电筒。另有一块台座（⑦ **放大的颗粒**，单独的比例，§0-D4）。**通用设计研究**，无品牌、无型号、无文字（量筒、针筒、尺只有刻度线、没有数字；电子秤的显示窗是空的，读数在 HUD 里）；标题块 `note`：EN "Generic design study · a school science bench drawn life size · magnified grains drawn separately" / ZH "通用设计研究 · 小学科学实验台，按实物大小画 · 放大的颗粒另按比例画" | 同意 | 定稿 |
| D2 | **引擎：SpaceScene + `sim`，新加一个模型 `kind: 'matter'`**（E-MA1）+ **一个新绑定 `fill`**（E-MA2：液体零件按体积画液面），其余全部复用（试一试卡片、数据表与小图、先猜后看、`visible` / `pose` / `offset` / `count` / `tint` 绑定与 `settle`、流的 `visible`、背景章、组级比例尺、`glass` / `membrane` 材质）。理由：现有五种模型（电路、磁铁、力、能量、生活史）没有一种管"体积、液面、压缩、质量"；docs/30 D2 说过"不做通用查表模型，SIM 要由模型算出"——这里每个读数都由有来源的常数和设计尺寸**算**出来（液面 = 体积对容器轮廓积分的反解、针筒里的空气 = 玻意耳定律、球里多出来的空气 = 打进去的体积 × 空气密度、沙里的空隙 = 孔隙率），全部纯函数、单测钉死。`fill` 是唯一真正新的舞台能力：现有绑定只能移动、转动、显隐零件，画不出"同样的水在锥形瓶里矮、在量筒里高"。不需要时间线（倒水用 `fill` 的缓动表现，§4.3） | 新 `kind: 'matter'` + `fill`，引擎约 2.5 天 | 定稿 |
| D3 | **课纲边界**（§1.1 原文，第 48 页）：要的——物质是有质量、占据空间的任何东西；从形状和体积区分固体、液体、气体；用合适的器材量质量和体积；对身边的物质好奇、发问。第 48 页**没有** Note 行：没有写"不要求"什么，也**没有提粒子模型**；全文检索 `particle`、`compress`、`irregular`、`displacement` 都是 0 处（起草时本人 `grep` 与 Codex 的 `syllabus-audit.json` 一致，R: C05–C08）——这些是"没点名"，**不是"不要求"**：docs/17 "课纲不要求粒子模型"是编辑上的判断，不是 MOE 的原话，正文和细看都不能写"课纲不要求"，只写"小学课纲没有讲 / 中学会学"（R: C06、C14）。所以：**粒子模型不进主线**——"物质由微粒组成"只在第 06 章一块细看 + 一张配图里出现，标题写明"课纲之外 / Beyond the syllabus"，不进字幕、不进试一试、不进名词表的必记词（docs/17 P4 行）；**排水法**（量不规则固体的体积）课纲没有点名，但它正是"用合适的器材量体积"和"固体占据空间"的直接做法：主线讲成"石头占据了空间，所以水面升高；升高了多少毫升，石头的体积就是多少立方厘米"，"displacement / 排水法"这个词只在细看和名词表（标"扩展"）；**密度**不讲（P3 Diversity of Materials 第 39 页 Note 明说"The concept of density is not required"），"大而轻、小而重"只用质量和体积两个量说，"密度"一词只在细看出现一次并注明中学会学（R: C09）；**压缩**课纲没有点名，但"气体没有固定的体积"最直接的证据就是针筒里的空气能被压小，主线讲"能被压缩 / can be squashed"，玻意耳定律、压强数值只在 S1 和细看 | 同意 | 定稿 |
| D4 | **尺度**：整台按实物大小（组级比例尺 `{ unit: cm, magnification: 1 }`，比例尺写 `10 CM`）。**放大的颗粒**（沙粒、糖粒约 0.5 mm）另放一块台座、`{ unit: mm, magnification: 40 }`（比例尺写 `1 MM · ×40`），只在第 02 章第 6 拍、用自己的镜头看，**和实验台不同框**（章 / 拍的 `layers` 控制；同 docs/33 D4 家居一角的做法）。不需要引擎改动 | 同意 | 定稿 |
| D5 | **必须讲对的十处**（§1.4 误解目录逐条对应）：① **空气有质量**：给篮球打气，秤的读数变大；② **气体也是物质**：空气占据空间（倒扣的杯子里纸巾不湿、盆里的水面升高），也有质量——两样证据都要给，"看不见"不是判断标准（R: M06）；③ **沙和糖会"倒"，但它们是固体**：每一粒的形状和体积都固定；"会倒"不能用来判断状态（R: F16、M04）；倒出来的堆有坡、水面是平的；一杯沙里有很多空气；④ **液体换了容器，体积不变**：液面高低不同、形状不同，倒回量筒还是 200 ml；⑤ **重不等于大**：大海绵比小石头轻；⑥ **"空"杯子、"空"瓶子不是空的**：里面是空气；⑦ **海绵能被捏小，不说明固体能被压缩**：被挤出去的是孔里的空气；⑧ **固体的形状改了，体积不变**：黏土球搓成长条，放进水里水面升得一样高；⑨ **液体几乎压不小**：装水的针筒压不下去，和空气不一样——写"几乎压不小 / much harder to squash"，**不写"完全不能压缩"**（R: F11、E22）；⑩ **光、声、热不是物质**：手电筒的光没有质量、不占据空间。另加一条措辞约束：**"固定的体积"指同一份东西换容器时体积不变**，不是说加热、冷却也不变（P4 Heat 第 77 页讲热胀冷缩，R: C10）；第 03 章细看一句 | 同意 | 定稿 |
| D6 | **章数 6 + 背景章 00**（§5）：00 开始之前 / 01 质量与空间 / 02 固体 / 03 液体 / 04 空气也是物质 / 05 气体会散开，也能被压缩 / 06 固体、液体还是气体。**每章一个试一试**（00 没有），**不做测验** | 同意 | 定稿 |
| D7 | **六张试一试**（§4.2、§5），每张写明改变 / 不变 / 观察，可记一行进表，表下画小图（选择 → 条形图，步进 → 折线图）：**T1 称一称**（01）：换称的东西，读质量；**T2 放进水里**（02）：换放进量筒的东西，读水面与体积；**T3 换个容器**（03）：同样 200 ml 的水倒进四种容器，读液面高度与倒回来的体积；**T4 打气**（04）：给篮球打 0–20 下气，读质量与打进去的空气；**T5 压针筒**（05，本主题的招牌公平测试）：三支针筒各加 0–4 kg，读空气、水、沙的体积，三条线一张图；**T6 沙里加水**（06）：往 100 ml 干沙里倒 0–100 ml 水，读量筒，看折线在哪里拐弯。六张都有先猜后看。倒扣杯子的实验（04）走拍的 `sim.set`，不进卡片（每章至多一张卡）。卡片只要求**认出**改变 / 不变 / 观察的量；"自己设计公平测试"是 P6 末的目标（S2 第 15–17 页，R: Q08 的说明），正文不要求读者设计 | 同意 | 定稿 |
| D8 | **数字与单位**：质量 g、kg；液体的体积 ml（与 docs/32 `measuring` 和 MOE 数学课本的写法一致：小写 ml、ℓ），固体的体积 cm³，正文第一次出现时一句"1 ml 和 1 cm³ 一样大"（P11，R: E29）；长度 cm、mm。**不出现**压强单位、牛顿、玻意耳定律的式子、密度的式子；PLATE 读数和细看里的模拟数写"在这个模型里 / in this model"；读数取到器材的分度量级：电子秤 0.1 g、量筒 1 ml（250 ml 量筒分度 2 ml，读到半格）、针筒 0.1 ml（分度 1 ml，读到十分之一格是模型的精度，细看写明真实只能估到半格）（DESIGN，§2） | 同意 | 定稿 |
| D9 | **空气有质量的试一试用篮球；气球天平只作细看**：气球天平是公开的课堂演示（TERC 用两层套在一起的气球、用打气筒打气、整套放回天平，打了气的一边下沉，R: F08、X01、E18、E20），本主题照实引用、不说它"错"。但模型要给**算得出来的数**：吹大的气球体积变了很多，周围空气托它的力也跟着变（TERC 的老师说明讲到周围空气的作用），秤上多出的读数远小于打进去的空气，算它要知道橡胶把空气压紧了多少——没有来源。篮球的大小几乎不随打气变，周围空气托它的力前后一样，**秤上多出来的就是打进去的空气**（S1 写明这条推理）。气球在模型里只用来讲"气体充满它的容器、形状随容器"（05） | 同意 | 定稿 |
| D10 | **倒扣杯子的实验画出"外面的水面升高"**：杯子竖直压下去（R: F09、E25），盆里的水面升高约 9 mm（在这个模型里），因为杯子里的空气占据了空间；杯底开一个孔，空气冒出、水涌进杯子、纸巾湿了，盆里的水面回落到只比原来高约 1 mm（只剩玻璃本身占的空间）。课堂上更常见的另一种做法是把杯子**倾斜**，气泡从杯口跑出、水进来（R: E26）——第 3 拍字幕提一句，模型用"开孔"（倾斜要在转动的杯子里解液面，v2）。杯里的水面只比杯口高约 1 mm：空气被水"压紧"了一点点，所以**不说"水一点都进不去"**，说"空气挡住了水，杯子装不满水"（R: §2.2 Cup validity）；这一点和 05 的针筒呼应（细看） | 同意 | 定稿 |
| D11 | **新加坡的生活情境**：给脚车（自行车）轮胎打气（气体能被压缩：同一条轮胎里能压进越来越多的空气）、一罐没开的汽水（罐是固体、汽水是液体、气泡和罐顶的空间是气体；X-RAY 看得见）、一瓶咖椰（"不好分类"的细看，§0-D13）、碟子里的冰块与一杯果汁、篮球场上的篮球、手电筒的光（不是物质）。不画品牌、不写汽水的种类和含糖量；不画人和手（打气只用流表示空气进去） | 同意 | 定稿 |
| D12 | **粒子视图（"凑近看"）只作 v1 的一块细看 + 一张配图**：第 06 章细看 `Look closer (beyond the syllabus)`：固体里的微粒紧密排列、只在原地振动，液体里的微粒挨着但能滑过彼此，气体里的微粒相隔很远、到处乱跑；**写明"这是科学家用的一种模型，小学课纲没有讲，中学会学；本主题的问题不用它也都答得出"**（R: §1.3 的 Atlas design inference），不说"微粒在受热时变大"之类会教出新误解的话。不做 3D 粒子图层（v2，§4.7）：模型里没有一处画"微粒"。同理**不画"同样多的冰、水、水蒸气装在三只一样大的容器里"**（docs/17 那一行的原设想）：同一份水变成水蒸气体积会大很多，一样大的三只容器会暗示"变了状态体积不变"（R: §1.3 的 design inference）；冰、水、水蒸气只在 06 一拍里说"同一种物质可以是三态"，链 `water` | 同意 | 定稿 |
| D13 | **不好分类的东西**（咖椰、牙膏、果冻、沙）只在细看讲：课纲的三态是典型情况；沙、糖是一粒粒的固体（主线）；咖椰这类糊状的东西"像液体一样慢慢流，又能堆起来"，科学家用更多的词来描述它们，小学课纲没有讲它们怎么分（Stavy & Stachel 1985 把粉末单列一组讨论，P22；"会倒"不能用来判断状态，R: F16） | 同意 | 定稿 |
| D14 | **背景章 00**：讲这一课要看什么（实验台五个工位与一张小桌）、"物质"这个词在科学里是什么意思、试一试卡片怎么用、这里的数字是模型算出来的、和 `measuring`（怎样读刻度）与 `water`（水的三态互变）的关系 | 同意 | 定稿 |
| D15 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人与手 / 物态变化的过程（熔化、沸腾、凝结，链 `water`）/ 粒子的 3D 动画（v2）/ 密度的计算 / 压强与玻意耳定律的式子 / 读者拖动器材（v2）/ 危险的演示（压爆的气球、打爆的轮胎、加热密封容器） | 同意 | 定稿 |
| D16 | **图**：Codex 草稿三张（`art/planned/states-of-matter/`）：封面**换**（草稿只有冰与水，和 `water` 主题的三态图重了，也缺气体）；`states-of-matter-air-takes-space` **重画**（杯里水面升得太高，没有纸巾）；`states-of-matter-matter-has-mass` **不用**（一杯水比空杯重，模型和正文已经讲清，图没有新信息）。新画三张：`states-of-matter-sponge`、`states-of-matter-sand-grains`、`states-of-matter-look-closer`（§7） | 同意 | 定稿 |
| D17 | **中文术语**（R: T01–T19；**没有找到 MOE 的 P4 英汉科学词表**，核心词来自香港教育局的英汉科学词汇（繁体，转简体是编辑上的转换）与剑桥英汉词典，R: §5）：物质（不和"物体"混用）、质量（正文口语可说"有多重"；"重量"另是一个量，R: T07）、体积、占据空间、固体、液体、气体、形状、**固定的形状 / 固定的体积**（"没有固定的形状"；EN 写 "definite shape / fixed volume"，同 OpenStax 的用词，R: E09、E12）、容器、压缩、量筒、天平、针筒（实验说明写"无针针筒"）、空气；电子秤、柱塞、毫升 / 立方厘米、孔隙是编辑用词。"质量"与 docs/32 D14 一致，`measuring` 里液体用"容量"，科学课用"体积"，名词表注明（§6.1） | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。三处是"按惯例代定、Gavin 想改随时改"的：

1. **排水法进主线**（D3）：课纲第 48 页只写"用合适的器材量体积"，没点名排水法。本文把它讲成"固体占据空间"的观察 + 量体积的一种做法，`displacement` 一词只在细看。不要的话第 02 章的 T2 改成"只看水面升高、不读体积"，第 6 拍删。
2. **压缩进主线**（D3）：课纲没写 compress，本文把"空气能被压小、水和沙几乎压不小"作为"气体没有固定的体积"的证据（05 整章 + T5）。觉得超纲可以把 05 改成细看为主，但 PSLE 的针筒题很常见（§1.5）。
3. **粒子视图只是一块细看 + 一张图**（D12）：如果想要模型里的"X 光看微粒"模式，是 v2 的引擎件（约 1.5 天，§4.7）。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；2026-10-20 起草时从 PDF 抄录，页码是页脚印的数字）

**S2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"，©2022 Curriculum Planning and Development Division（文件名 `Primary-Science-Syllabus-2023_May24.pdf`；URL 见 §6.2）。

**Cycles in Matter and Water (Matter) (P4)**（第 48 页，全文；本页**没有** Note 行）

> **Core Ideas**
> • State that matter is anything that has mass and occupies space.
> • Differentiate among the three states of matter (solid, liquid, gas) in terms of shape and volume.
>
> **Practices**
> • Measure mass and volume using appropriate apparatus.
>
> **Values, Ethics and Attitudes**
> • Show curiosity in exploring matter in the surroundings and question what they find.

**About Cycles**（第 41 页，本主题所属的主题"Cycles"）

> There are cycles or repeated patterns of change in nature. Understanding cycles, such as life cycles and the water cycle, helps us predict events and processes and to appreciate the Earth as a self-sustaining system that supports life.

**Table 2: An Overview of the topics**（第 20 页）：P4 一列列出 Plant system、Human system (Digestive system)、**Cycles in matter and water (Matter)**、Energy forms and uses (Light)、Energy forms and uses (Heat)；表下 "Topics which are underlined are not required for students taking Foundation Science."——P4 没有下划线的课题，不标 Foundation（同 docs/29 D3、docs/33）。

**相邻的条目（只作边界，不引全文）**：

| 页 | 课题 | 与本主题的关系 |
|---|---|---|
| 39–40 | Diversity of Materials (P3)：材料的物理性质（强度、柔韧、浮沉、防水、透光）；Note："(The concept of density is not required.)" | 本主题不讲密度（D3）；"浮在水上"的海绵不能用排水法量（细看） |
| 49–50 | Cycles in Matter and Water (Water) (P5 Standard)：水的三态可以互变；熔化、凝固、沸腾 / 蒸发、凝结；0 °C 与 100 °C；水循环 | 属于 `water`；本主题第 06 章一拍 + 链接 |
| 76–77 | Energy Forms and Uses (Heat) (P4)：State that heat is a form of energy；"List some effects of heat gain/loss in our everyday life. - Contraction / expansion of objects (solid, liquid and gas) - Change in state of matter" | "热不是物质，是一种能量"（第 01 章一句，M-10）；热胀冷缩、物态变化不讲 |
| 15–17 | Table 1: Ways of Thinking and Doing，"By the end of P4" 一列："Use senses, apparatus, and equipment to gather data."；"Record and/or compare observations/data with suggested scaffolding."；"Simple analysis of data and information in representations (e.g., tables, bar and line graphs, charts, and diagrams) to infer patterns and relationships or explain findings." | 试一试的记表与小图（条形图、折线图）对的就是这一列 |
| 82 | Glossary of Terms：16. measure "to obtain a reading from a suitable measuring instrument"；7. differentiate "to identify the differences between objects, concepts or processes" | 正文用这两个动词的意思写 |

- **S3**：SEAB，*PSLE Science (Syllabus 0009)*（2026 年考试），评估依据 2023 课纲（docs/17 S6，Codex 已下载 `seab-science-2026.pdf`；施工时读一遍，只用来确认 P4 内容进 PSLE 范围，不引题）。
- 课纲**没有点名**的（第 48 页没有 Note；全文检索 `particle`、`compress`、`irregular`、`displacement` 0 处，`density` 只在第 39 页的 P3 Note 出现一次——起草时本人 `grep` 与 Codex 的审计一致，R: C05–C09）：粒子模型、压缩、排水法；**明说不要求的只有密度**（P3）。物态变化属于 P5。本主题的处理见 D3、D12。
- **PSLE**（S3，R: Q09、E36–E39）：选择题与结构题；评估目标包括知识、应用、"interpreting and analysing information"与"communicating explanations and reasoning"。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 物质的定义：有质量、占据空间 | 主线（00、01，全主题反复用） |
| 用电子秤、天平量质量；用量筒量液体的体积 | 主线（01、03） |
| 固体：形状和体积固定；用排水法量不规则固体的体积 | 主线（02，"displacement"一词只在细看） |
| 液体：形状随容器、体积不变；液面是平的 | 主线（03） |
| 气体：没有固定的形状和体积，充满容器；能被压缩 | 主线（04、05） |
| 空气占据空间、有质量 | 主线（04） |
| 沙、糖是固体颗粒；沙里有空气 | 主线（02 两拍、06 + T6） |
| 光、声、热不是物质 | 主线一拍（01） |
| 读量筒：视线和液面平、读凹面的底（弯月面） | 细看（03；docs/32 D10 说弯月面"是科学课的事"） |
| 冰、水、水蒸气是同一种物质的三态 | 主线一拍（06）+ 链 `water`；不画"等量三态装进三只一样大的容器"（D12） |
| "固定的体积"的条件：同一份东西换容器；加热会让东西胀大一点（P4 Heat） | 细看一句（03，R: C10） |
| 粒子模型 | 细看 + 配图（06），标"课纲之外" |
| 密度、浮力、压强数值、玻意耳定律 | 细看各一句（"中学会学"），或只在 S1 |
| 糊状、胶状的东西怎么分类 | 细看（06） |
| 物态变化的过程、熔点沸点、热胀冷缩 | 不讲（P4 Heat、P5 Water） |

### 1.3 读者学到什么（P4 用词）

1. **物质（matter）**是任何**有质量**、**占据空间**的东西。石头、水、空气都是物质；光、声、热不是。
2. **质量（mass）**用天平或电子秤量，单位 g、kg；**体积（volume）**是东西占据的空间有多大，液体用量筒量（ml），不规则的固体可以放进水里看水面升高多少（cm³，1 ml = 1 cm³）。
3. **重不等于大**：一块大海绵比一块小石头轻。
4. **固体**有固定的形状和固定的体积。用力可以改变某些固体的形状（黏土），体积不变；海绵被捏小，是孔里的空气被挤了出去。
5. **沙和糖**是一粒粒很小的固体，会"倒"，但每一粒的形状和体积都固定；倒出来堆成小山，不像水那样摊平；一杯沙里有很多空气。
6. **液体**没有固定的形状，形状随容器变；但体积固定：同样 200 ml 的水，在高杯里高、在宽碗里矮，倒回量筒还是 200 ml。
7. **气体**没有固定的形状，也没有固定的体积：它会充满装它的整个容器；能被压缩（同一支针筒里的空气能被压小，水和沙几乎压不小）。
8. **空气是物质**：它占据空间（倒扣的杯子压进水里，纸巾不湿）；它有质量（篮球打了气，秤的读数变大）。
9. 生活里到处都是三态：汽水罐（固体）、汽水（液体）、气泡（气体）；轮胎里压进去的空气；冰块与果汁。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

依据：Codex 研究 §3（R: M01–M06）。它们是**海外的研究，不是新加坡 P4 的比例**，测的东西也各不相同（分类、预测、量的守恒），不能合成一个"多少孩子以为"的数；正文不写"很多孩子以为……"，只正面讲正确的说法。没有研究来源的几条（M-5–M-10、M-12）是**教学上要正面讲的说法**，依据是正确的科学本身，标"无研究来源"，细看里也不说"常见误解"。

| # | 说法 | 正确的说法 | 哪里纠正 | 研究（R:） |
|---|---|---|---|---|
| M-1 | 空气没有质量 / 空气是"什么都没有" | 给篮球打 20 下气，秤多出约 4.7 g（在这个模型里）；空气约 1.2 g / ℓ（F-3） | 04 第 4–5 拍、T4 | M01：Osborne 2023（*Teaching Science* 69(2): 21–28，只读到作者机构的摘要，具体页码未核，S22）与她的访谈（"air/gas has no mass"，E59，S23）；Pathare & Pradhan 2010 第 631 页（印度本科生，不是小学生，只在 S# 的 note 里提，S28） |
| M-2 | 气体不是物质（物质只指能摸到、能看见的东西） | 气体有质量、占据空间，所以是物质；两样证据都要（秤、杯子 / 针筒） | 01 第 1 拍；04 全章 | M03：Stavy 1991 第 243 页表 2：三年级只有 25 % 把空气归为物质（E33，S13） |
| M-3 | 沙、糖会倒，所以是液体 | 每一粒都是固体：形状和体积固定；堆起来有坡，水面是平的；沙里有空气 | 02 第 5–6 拍、06 第 1–3 拍、T6 | M04：Stavy & Stachel 1985 第 419 页（粉末组含沙和糖，"children classify them as liquids because they pour"，E32，S12） |
| M-4 | 液体倒进另一个容器，体积变了（高了就多、矮了就少） | 液面高低是容器的形状造成的；倒回量筒，读数不变 | 03 全章、T3 先猜后看 | M05：Bošnjak Stepanović et al. 2019 第 133–134 页：倒进更窄的容器后标对液面的，一年级 21.49 %、三年级 42.15 %（E34–E35，S14）——测的是"预测液面"，不是孩子说"体积变了" |
| M-5 | 越重的东西越大 / 越大越重 | 质量和体积是两个量；大海绵 11.5 g、小石头 66.3 g（在这个模型里） | 01 第 2–3 拍、T1 先猜后看 | 无研究来源 |
| M-6 | "空"的杯子、瓶子里什么都没有 | 里面是空气；倒扣竖直压进水里，空气挡住了水 | 04 第 1–2 拍 | 课堂做法 R: F09、E24（"air takes up space"，Primary Connections，S09）；无误解调查 |
| M-7 | 海绵能捏小，所以固体也能被压缩 | 挤出去的是孔里的空气；海绵本身的材料体积不变 | 02 第 4 拍、配图 | 无研究来源 |
| M-8 | 改变固体的形状，体积也跟着变 | 黏土球和搓成的长条放进水里，水面升得一样高 | 02 第 3 拍、T2 先猜后看 | 无研究来源 |
| M-9 | 液体也能像空气那样被压小 | 装水的针筒加 4 kg，读数仍是 20.0 ml（在这个模型里）；水"难压得多"，不是"完全压不了"（R: F11、E21–E22） | 05 第 3 拍、T5 先猜后看 | 课堂做法 R: X03（TERC、Cambridge 工作纸 3.3a）；无误解调查 |
| M-10 | 光、热、声音也是物质 | 它们没有质量、不占据空间；热是一种能量（S2 第 76 页"State that heat is a form of energy"） | 01 第 5 拍 | 无研究来源 |
| M-11 | 吹了气的气球放上天平，那一边会**升起来**（变轻） | 打了气的那一边下沉（TERC 的双层气球演示，R: E18） | 04 细看 `Balloons on a balance` | M02：NEMP 1999 第 50 页：新西兰四年级 32 % 预测吹大的气球会升起来（E30–E31，S11） |
| M-12 | 气体只在容器的一部分（上面、或者靠近口的地方） | 气体充满整个容器 | 05 第 2 拍 | 无研究来源（OpenStax 的定性说法 R: E11 只证科学本身） |

### 1.5 PSLE 题型 → 本主题哪里支持

描述题型，不抄题；R: Q01–Q08 是 Codex 从课纲与 SEAB 评估目标推出的**题型类别**，不是"真题出现的频率"（R: §4.2 的说明）。常见的课堂实验家族 R: X01–X06（气球天平、倒扣的杯子、封口针筒、换容器、粉末分类、量筒与排水）；新加坡学校确有 P4 物质单元（R: X07，北岸小学"P4 Fun with Matter"），但不能据此说每所学校都做哪个实验。

| 题型 | 支持 |
|---|---|
| Q01 判断 / 分类：哪些东西是物质，是固体、液体还是气体；要用"质量、空间、形状、体积"的证据说理，不靠外观 | 01 第 1、5 拍；06 |
| Q02 读一张"形状固定吗 / 体积固定吗"的表，认出三态，指出表里不对的一行 | 06 细看 `Three states in a table` |
| Q03 预测天平怎样变；分清气球（容器）和里面的空气；用给的读数求质量差 | 04、T4（折线图 + 先猜后看）；04 细看（气球天平） |
| Q04 用"关在里面的空气占据空间"解释杯子 / 瓶子进不进水；预测让空气跑掉以后怎样 | 04 第 1–3 拍 |
| Q05 读针筒前后的读数；分清"封口时空气被压小"和"针口开着时空气跑掉" | 05、T5（三线图）；05 细看 |
| Q06 比较不同形状容器里的液体体积；"水面高不等于水多" | 03、T3（条形图 + 先猜后看） |
| Q07 选量质量 / 体积的器材、读刻度、减去容器（归零）或排水前后的读数、写对单位 | 01（归零）、02（排水）、03（量筒） |
| Q08 评价一个比较：找出改变的量和要保持不变的量（开始的体积、针口封住、液体别洒） | T1–T6 的改变 / 不变 / 观察三行 |
| 沙里加水，读数比两者相加少 | 06、T6（折线拐弯）——这是本主题自己加的一类，没有题型来源 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：通俗不幼稚，先现象后原理；不拟人（"空气想出去"不写，写"空气从孔里冒出去"）、不喊"小朋友"、无感叹号、无问句标题；试一试的说明写"改变 / 不变 / 观察"。英文用新加坡 / 英式拼写（colour、litre、millilitre、centimetre）。中文用新加坡用法（§6.1）：物质、质量、体积、占据空间、量筒、电子秤、针筒、脚车（第一次写"脚车（自行车）"，之后"脚车"）、咖椰；引号只用“ ”。安全：不画、不鼓励把东西压到会坏的程度（细看一句"不要把轮胎、气球打得过满"）；"砝码要放稳、由大人在场"一句放在 T5 细看。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 读刻度、ml 与 ℓ、g 与 kg 的换算、量杯 | `measuring`（MathScene，`mass-and-balances`、`weighing-scales`、`volume-and-litres`、`millilitres`、`reading-scales`） | 00 细看一句 + `<TopicLink slug="measuring" ch="millilitres">`；01 链 `ch="mass-and-balances"`；量筒的分度不重讲 |
| 水的三态互变、0 °C / 100 °C、蒸发与沸腾 | `water`（`the-water-cycle`） | 06 第 5 拍 + 细看链 `ch="the-water-cycle"` |
| 重量是重力作用的结果、质量与重量的区别 | `forces`（`gravity-and-weight`） | 01 细看一句"重量是另一个量（P6）"，链 `ch="gravity-and-weight"` |
| 光、热是能量 | `energy-conversion`（`before-you-start`）；P4 Light / Heat 主题未建 | 01 第 5 拍一句，链 `energy-conversion` `ch="before-you-start"` |
| 材料的性质（P3） | `materials`（docs/17 #9，未建） | 不链；施工时若已发布再补 |
| 体积的计算（长方体，P5 数学） | `volume`（docs/17，未建） | 不链；它将来复用本主题的 `fill` 绑定（§4.3） |

**谁后发布谁补链接**：本主题发布时，主会话在 `water` 第 02 章细看与 `measuring` 第 `millilitres` 章的末段各加一句回链（内容代理不碰那两个目录）。

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的尺寸与常数（落在 TYPICAL 内，没有 TYPICAL 的写明"示意"）；`SIM` = §4.2 的模型算出的结果。P# → §6.2（施工时变 S#；S1 是设计研究来源）。"待核" = 起草时没读到原文，施工代理读原文定。

### 2.1 定义、常数与课堂做法

| # | 项 | TYPICAL（来源） | DESIGN（模型取值） | 待核 |
|---|---|---|---|---|
| F-0a | 三态的定义 | 固体 "possesses a definite shape"；液体 "takes the shape of its container"、固体与液体 "fixed volume"；气体取容器的形状与体积（OpenStax *Chemistry 2e* §1.2，R: F04–F06、E09–E12，P28） | 正文与名词表的定义 | |
| F-0b | 质量与重量 | 质量是东西里"how much matter it contains"，单位 kg；重量是重力作用在它上面的力，单位 N（NIST，R: F02–F03、E14–E17，P29） | 01 细看 | |
| F-0c | 沙是固体颗粒 | 沙会倒、会重新排列，但由 "grains of solid sand" 组成（R: F16、E13，P28） | 02、06 | |
| F-1 | 1 ml 与 1 cm³ | "1 mL = 1 cm3"（ACS 排水法课，印第 4 页，R: F15、E29，P11）；1 cc = 1 mL（Vernier，R: E68，P11b）；BIPM：升是立方分米的专用名称（P11c，可选） | 换算 1 : 1 | |
| F-1b | 排水法与读数 | 物体体积 = "final water level – initial water level"；读 "the line just at the bottom of the meniscus"（ACS 印第 3 页，R: F14–F15、E27–E28，P11）；物体要整个没入、不吸水、不溶、不带气泡（R: §2.4 的有效条件） | 02、03 细看 | |
| F-2 | 标准大气压 | 1 atm = 101 325 Pa（P4 NIST SP 811 附录 B） | 室内空气压强取 101.325 kPa | 页码 |
| F-3 | 空气的密度 | 约 1.2 kg/m³（20 °C、海平面）；随温度变：25 °C 约 1.18、30 °C 约 1.16（理想气体 ρ = p ÷ R T，R = 287.05 J/(kg·K)，P6） | **1.18 g / ℓ**（25 °C 室温） | P6 选一份可读原文的表（NASA 标准大气 / CRC），写明温度 |
| F-4 | 玻意耳定律 | 温度不变时，一定量气体的压强与体积成反比（P5 NASA Glenn，待核原文） | 针筒和倒扣的杯子里的空气用 p V = 常数，慢慢压、温度不变 | P5 |
| F-4b | 真实的测量：气体被压小 | 一组公开的学生实测（**氮气**，不是空气）：60 ml 针筒读数 60.0 → 45.0 → 30.0 ml（压力计读数 0 / 5 / 10），压力计与接头另占 4.3 ± 0.3 ml，针筒读数 ±0.5 ml（Waterloo / *Chem 13 News*，Eix 2015，图 3，R: F18、E66–E67，P33） | 05 细看 `Real readings`：说明"封住的气体真的能被压到一半"，模型的数是算出来的、这组是量出来的；不引它的压强分析 | |
| F-4c | 课堂的针筒做法 | 剑桥 *Primary Science 4* 工作纸 3.3a：空气抽到 10 ml 后封口；水先抽约 12 ml、针口朝上排掉气泡、再推到 10 ml（印第 83–84 页，R: F12、E55–E57，P32）；TERC："Air can be squeezed into a smaller space; it is compressible."，教师注 "Liquids and solids are compressible"（只是难得多），放手后柱塞回不到原处可能是漏气（R: F11、E21–E23，P30） | 05 正文与细看；"水先排气泡"写进 T5 的不变量说明；"轻轻地压"——模型用砝码是为了读数可比，细看说明课堂上用手轻压 | |
| F-5 | 水的密度 | 25 °C 约 0.997 g/cm³（P7 USGS） | 0.997 g/ml | 读 USGS 的表 |
| F-6 | 水的压缩率 | 25 °C 约 4.5 × 10⁻¹⁰ Pa⁻¹（P8） | 4.5 × 10⁻⁷ 每 kPa | 选一份可读原文（CRC / Kell 1975 / 工程手册），核不到改写"极小"并删 F-6 的数 |
| F-7 | 重力 | 约 9.8 N/kg（`forces` 的 S#，P9） | g = 9.8（只在 S1 里用来把砝码换成压力） | |
| F-7b | 空气占据空间：倒扣的杯子 | 杯子 "Slowly push the cup straight down into the water"，杯底的纸巾不湿；倾斜时 "Air bubbles escaped from the cup"，水进来（Primary Connections，R: F09、E24–E26，P31） | 04 第 1–3 拍；本模型用"开孔"代替倾斜（D10） | |
| F-7c | 空气有质量：气球天平 | 两套没吹的双层气球先在天平上平衡，用打气筒吹大其中一套、放回原盘，"The pan with the inflated double balloon will move down."；用打气筒是为了不带进肺里的水汽（TERC，R: F08、X01、E18、E20，P30） | 04 细看；不给气球称重的数字（D9） | |

### 2.2 实验台上的东西

| # | 项 | TYPICAL（来源） | DESIGN（本模型） | 待核 |
|---|---|---|---|---|
| F-8 | 量筒 250 ml | ISO 4788 规定量筒的容量与分度（P19）；250 ml 量筒常见分度 2 ml | 内半径 1.85 cm（截面 10.75 cm²），刻度高约 23 cm；200 ml 的液面 18.6 cm、100 ml 的 9.3 cm | ISO 4788 的尺寸表（内径、高）；核不到就写"示意尺寸" |
| F-9 | 锥形瓶 250 ml | ISO 1773（P20） | 底部内半径 4.2 cm，10 cm 高处收到瓶颈内半径 1.6 cm（截头圆锥），再接 4 cm 瓶颈 | ISO 1773 的尺寸 |
| F-10 | 高玻璃杯、宽碗 | 无标准，示意 | 杯：直筒，内半径 3.0 cm、高 12 cm；碗：半球形，半径 8 cm | — |
| F-11 | 石头 | 花岗岩等常见岩石密度约 2.6–2.7 g/cm³（P15） | 一块扁长的卵石，25 cm³、2.65 g/cm³ → 66.3 g（SIM） | P15 原文 |
| F-12 | 玻璃弹珠 | 钠钙玻璃密度约 2.5 g/cm³（P16）；弹珠常见直径约 16 mm（示意） | 直径 1.6 cm → 2.1 cm³、5.4 g（SIM） | P16 原文 |
| F-13 | 黏土（模型黏土） | 密度约 1.4–1.8 g/cm³（P18 待核） | 20 cm³、1.6 g/cm³ → 32.0 g；球半径 1.68 cm；搓成直径 1.6 cm、长 9.9 cm 的长条（同 20 cm³） | P18 核不到：T1 去掉黏土这一项（黏土只在 T2 用体积） |
| F-14 | 海绵 | 软质聚氨酯泡沫密度约 0.016–0.05 g/cm³（P17） | 12 × 8 × 4 cm = 384 cm³、0.030 g/cm³ → 11.5 g（SIM）；**浮在水上、会吸水**，不能放进量筒量体积（细看） | P17 原文 |
| F-15 | 篮球 | 7 号球：周长 749–780 mm、质量 567–650 g（P9a FIBA）；NBA 规则充气到 7.5–8.5 psi（约 52–59 kPa 表压，P10） | 瘪球（表压 0）读 600.0 g；球内空间 7.0 ℓ（周长 75 cm 的球减去球壳）；打气筒每下压进 0.2 ℓ 一个大气压的空气（**示意**，无来源） | P9a 条款号与年份；P10 条款 |
| F-16 | 电子秤 | 学校电子秤常见分度 0.1 g 或 1 g（待核） | 分度 0.1 g、量程 2 kg（示意） | 找一份学校器材目录；找不到写"示意" |
| F-17 | 针筒 | 20 ml 一次性针筒内径约 19–20 mm（P21 典型规格，不点名厂家） | 内径 20.0 mm（截面 3.14 cm²），刻度 20 ml、分度 1 ml，针口用帽封住；柱塞摩擦不计 | P21 |
| F-18 | 砝码 | 1 kg 圆柱槽码（示意） | 每支针筒的托盘上 0–4 块，同时加在三支上；托盘与柱塞的质量不计（S1 写明） | — |
| F-19 | 玻璃水盆、杯子 | 示意 | 盆内半径 12 cm、水深 14.0 cm（6,333 ml）；杯子内半径 3.5 cm、内高 9.0 cm（346 ml），壁厚 2 mm、底厚 4 mm（玻璃 57.9 cm³），压下去时杯口离盆底 3.0 cm | — |
| F-20 | 沙的孔隙率 | 沙约 25–50 %（P12 Freeze & Cherry 表 2.4） | 干沙 35 % | P12 页码 |
| F-21 | 沙粒大小 | 沙 = 0.0625–2 mm 的颗粒（P13 Wentworth / USGS） | 放大组里画 0.2–1.0 mm 的不规则多面体 | |
| F-22 | 干沙的休止角 | 约 30–35°（P14） | 沙堆坡度 33° | P14 原文 |
| F-23 | 砂糖粒 | 常见砂糖晶粒约 0.3–1 mm、单斜晶系的短棱柱（P14b 待核） | 放大组里画 0.5 mm 左右的短棱柱 | 找不到来源就只画"小晶粒"，不写大小 |

### 2.3 身边的东西（只定性，第 06 章）

| # | 项 | TYPICAL（来源） | 用在 | 待核 |
|---|---|---|---|---|
| F-24 | 汽水里的气泡是二氧化碳 | 汽水在压力下溶进二氧化碳，开罐后冒泡（P35 待核） | 06 第 4 拍、细看；主线只说"气泡是气体" | 来源 |
| F-25 | 轮胎打气 | 打气就是把更多空气压进同一条轮胎（定性，同 F-4） | 05 第 5 拍 | — |
| F-26 | 冰、水、水蒸气 | 水能以三种状态存在（S2 第 49 页）；水蒸气看不见（`water` 主题已用的来源） | 06 第 5 拍 | 用 `water` 的 S# |
| F-27 | 咖椰 | 椰浆、蛋、糖做的抹酱（P36 待核：NLB Infopedia 或类似） | 06 细看 | 来源；核不到细看只写"一种很稠的抹酱" |

### 2.4 模型（SIM，设计研究来源 S1 的内容；§4.2 的模型算出来的）

全部由 §2.1–2.2 的常数和尺寸推出，内部自洽；施工时单测钉死下面每一个数（3 位有效数字，读数按输出的 `decimals`）。

- **T1 称一称**（`weigh`，质量 = 体积 × 密度，读到 0.1 g）：石头 66.3 g · 海绵 11.5 g · 弹珠 5.4 g · 黏土球 32.0 g · 200 ml 水 199.4 g（先把空烧杯放上去归零）。海绵的体积是石头的 15.4 倍，质量是它的 0.17 倍。**这些是"这块模型石头、这块模型海绵"的值**：Codex 提醒不要采用"一块石头多重"这种通用值，课堂上的质量只能来自真秤的读数（R: F17）——所以字幕、卡片都写"在这个模型里"，细看 `Real stones differ` 一句"你称的石头会是另一个数"；密度只进 S1 的算式，不进正文。
- **T2 放进水里**（`displace`，250 ml 量筒先装 100 ml 水，读到 1 ml）：什么都不放 100 ml · 石头 125 ml（升 2.3 cm）· 弹珠 102 ml（2.1 cm³，升 0.2 cm）· 黏土球 120 ml · 黏土长条 120 ml（升 1.9 cm）。**物体的体积 = 读数 − 100**。
- **T3 换个容器**（`pour`，200 ml 水，液面高度由容器的内轮廓积分反解，§4.3，读到 0.1 cm）：量筒 18.6 cm · 高玻璃杯 7.1 cm · 锥形瓶 5.0 cm · 宽碗 3.0 cm；倒回量筒的体积 200 ml（四种都一样）。
- **T4 打气**（`pump`，m = 600.0 + n × 0.2 ℓ × 1.18 g/ℓ；表压 p = n × 0.2 ÷ 7.0 × 101.3 kPa）：0 / 5 / 10 / 15 / 20 下 → 600.0 / 601.2 / 602.4 / 603.5 / 604.7 g；打进去的空气 0 / 1.2 / 2.4 / 3.5 / 4.7 g；表压 0 / 14.5 / 29.0 / 43.4 / 57.9 kPa（只在 S1 和细看，正文不写 kPa）；软硬状态：`flat`（0）、`soft`（< 51.7 kPa）、`firm`（51.7–58.6 kPa，即 NBA 的 7.5–8.5 psi）、`too-hard`（> 58.6）——20 下正好 `firm`。每下多 0.24 g：折线是一条直线。
- **倒扣的杯子**（`cup`，拍里设定）：杯子在水面上方 → 盆里水面 14.0 cm；压下去（杯口离盆底 3.0 cm，整只杯子没入水中）→ 杯里的空气被压紧 1.1 %，从 346.4 ml 变成 342.5 ml，杯里的水面只比杯口高 1.0 mm，盆里水面升到 14.9 cm（升 8.9 mm），纸巾干；杯底开孔 → 空气全部冒出，杯里灌满水，盆里水面 14.1 cm（只比原来高 1.3 mm，是玻璃本身占的空间），纸巾湿。
- **T5 压针筒**（`squeeze`，每支 20 ml，加 m kg，压力 = m × 9.8 ÷ 3.14 cm²；空气 V = 20 × 101.3 ÷ (101.3 + 31.2 m)；水 V = 20 × (1 − 4.5 × 10⁻⁷ × 31.2 m)；沙：颗粒互相顶住，模型里不动）：0 / 1 / 2 / 3 / 4 kg → 空气 20.0 / 15.3 / 12.4 / 10.4 / 9.0 ml；水 20.0（4 kg 时只少 0.001 ml，读不出）；沙 20.0。空气的折线先陡后缓（每加 1 kg 少得越来越少）；把砝码拿走，空气回到 20.0 ml（柱塞弹回，`settle`）。量级核对：4 kg 时压力约增加 1.2 个大气压，空气压到原来的 45 %，与 F-4b 的实测（压到一半）同一量级。Codex 的提醒（R: F13）——课堂实验"不要填编出来的末读数"——在这里的处理：卡片与 PLATE 的数都带 SIM、写"在这个模型里"，S1 写出算式；细看给 F-4b 的真实测量作对照。
- **T6 沙里加水**（`pores`，100 ml 干沙、孔隙 35 % = 35 ml 空气；读数 = 100 + max(0, 加的水 − 35)，读到 1 ml）：加 0 / 20 / 40 / 60 / 80 / 100 ml 水 → 100 / 100 / 105 / 125 / 145 / 165 ml；沙里剩下的空气 35 / 15 / 0 / 0 / 0 / 0 ml；"100 ml 沙 + 100 ml 水"读 165 ml，比 200 少 35 ml。折线在 35 ml 处拐弯（之前水钻进沙粒间的空隙、空气冒出来；之后水面在沙面上方升起）。
- 这些数只出现在试一试卡片、PLATE 读数（带 SIM）、拍的字幕（写"在这个模型里"）和细看；正文写取整的"约 5 g""约 9 mm"。S1 写明：真实实验每次读数会差一点（量筒读数、秤的漂移、沙压紧的程度、杯子没压直），模型每次给同一个数。

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） | `scale` |
|---|---|---|---|---|---|
| 01 | `weighing` | Weighing / 称质量 | 电子秤 A、天平、托盘、石头、海绵、弹珠、黏土球、一杯水 | `token:ink-2` | cm × 1 |
| 02 | `measuring` | Measuring volume / 量体积 | 量筒 A 与水、高玻璃杯与水、锥形瓶与水、宽碗与水、量筒 B 与水、放进量筒 B 的石头 / 弹珠 / 黏土球 / 黏土长条 | `token:accent-2` | cm × 1 |
| 03 | `air-bench` | Air / 空气 | 水盆与水（两种）、倒扣的杯子、杯里的水、纸巾、电子秤 B、篮球、打气筒、气球打气筒、两只气球 | `token:cold` | cm × 1 |
| 04 | `syringes` | Squeezing / 压缩 | 压针筒架、三支针筒、空气针筒的柱塞、另两支的柱塞、水柱、沙柱、三叠砝码 | `token:ink-3` | cm × 1 |
| 05 | `grains` | Sand and sugar / 沙和糖 | 沙堆、糖堆、一碟水、量筒 C、量筒 C 里的沙、沙上的水、准备倒的一杯水、放大镜 | `token:cut` | cm × 1 |
| 06 | `around-you` | Around you / 身边的物质 | 脚车轮与轮胎、落地打气筒、汽水罐、罐里的汽水、咖椰瓶、冰块与碟子、一杯果汁、手电筒与光束 | `token:loop` | cm × 1 |
| 07 | `closer` | Magnified grains / 放大的颗粒 | 沙粒、糖粒（×40）；context：放大台座 | `token:neutral` | mm × 40 |
| — | `air-flow` | Air moving / 空气的流动 | 只有流：杯底冒出的气泡、沙里冒出的气泡、打进球和轮胎、气球的空气 | `token:cold` | |

- 右上卡：零件链路卡（`connects` 只在每个工位内部连：量筒 A → 高玻璃杯 / 锥形瓶 / 宽碗；打气筒 → 篮球 → 电子秤 B；落地打气筒 → 轮胎）。不需要新卡（§4.4）。
- context：`bench`（台面）、`side-table`（小桌）、`closer-plinth`（放大台座）不属于任何组；`object-tray` 属于 `weighing`。

### 3.2 坐标与尺度

- 1 场景单位 = 1 m（放大组另按 ×40），Y 向上，台面 y = 0，+Z 朝观者，+X 向右。台面 1.6 × 0.7 m（x −0.8 … 0.8，z −0.35 … 0.35）；小桌在台的左边 x −1.25、桌面 y = 0（与台面同高，0.5 × 0.5 m）；放大台座在台的右后方 x 1.6、z −0.6（另一块台面，不和台同框）。
- 工位中心（R2 起点）：① 称质量 (−0.60, 0, 0.05)；② 量体积 (−0.22, 0, 0)；③ 空气 (0.18, 0, 0)（水盆中心 (0.12, 0, −0.08)，电子秤 B (0.32, 0, 0.12)）；④ 压针筒 (0.52, 0, −0.05)；⑤ 沙和糖 (0.70, 0, 0.18)；⑥ 小桌 (−1.25, 0, 0)。
- 尺寸照 §2.2：量筒外高约 0.30（含底座）；水盆外半径 0.125、高 0.18；针筒架高 0.32（三支针筒竖直、针口朝下、柱塞朝上，托盘在柱塞顶）；脚车轮直径 0.62（装在一个矮架上，轮心离桌面 0.34）。
- 整体包络约 x −1.55 … 0.85（不含放大台座），半径约 1.3；投影规则照引擎默认（台、小桌、水盆、脚车轮投影）。
- 以上是 R2 起点：先对照参考图（§3.3）调比例；改量级回 §2 改 DESIGN。

### 3.3 Tier-1（一眼能认）与参考图

**Tier-1**：

| 对象 | 一眼要认出的 |
|---|---|
| 量筒 | 细长直筒、六角或圆形底座、口部一个倒水嘴、侧面一排水平刻度线（长短相间、无数字）；液面是平的，靠壁处有一道向上弯的细边（弯月面，`fill` 的 `meniscus`） |
| 锥形瓶 | 平底、斜壁、细颈、口部一圈翻边 |
| 电子秤 | 扁平方形机身、圆形或方形秤盘、前面一块深色显示窗（空的）和两个按钮 |
| 天平 | 中柱、横梁、两只吊盘（或托盘）、中间一根指针 |
| 针筒 | 透明筒身带刻度、两侧指托、柱塞杆与深色橡胶活塞头、针口一只封帽 |
| 倒扣的杯子 | 透明直筒杯倒扣，杯底（朝上）里一团白色纸巾；杯里水面只比杯口高一点点 |
| 篮球 | 橙褐色球面、八道深色沟线（无字、无标志）、打气针接在打气筒的软管上 |
| 沙 / 糖堆 | 锥形小堆、坡面不平；旁边的水面是平的 |
| 脚车轮 | 轮胎、轮圈、辐条、气门嘴、落地打气筒的软管接在气门嘴上 |
| 汽水罐 | 圆柱罐身、上下收口、拉环（无图案、无字） |
| 放大的颗粒 | 沙粒：大小不一、棱角被磨圆的多面体，半透明的浅褐、灰、白几种；糖粒：大小相近、有平面和棱的短棱柱，近白、半透明 |

**参考图**（`scripts/geo/states-of-matter/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）：

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 250 ml 量筒（玻璃或塑料） | Wikimedia Commons "Graduated cylinders" 类目 | CC / 公有领域，逐张核 | 高径比、底座、倒水嘴、刻度排布 |
| R2 | 250 ml 锥形瓶 | Commons "Erlenmeyer flasks" | 同上 | 底径、斜壁角、颈长 |
| R3 | 学校电子秤、天平 | Commons "Digital scales"、"Beam balances" | 同上（避开有品牌字样的照片） | 机身比例、秤盘、天平的吊盘 |
| R4 | 一次性针筒 | Commons "Syringes" | 同上 | 指托、活塞头、刻度、封帽 |
| R5 | 倒扣杯子的实验 | Primary Connections（Codex 已存 `primary-connections-gas.html`）、Commons | 只看（版权） | 杯里的水面与纸巾的位置 |
| R6 | 篮球 | Commons "Basketballs"（无标志的） | CC | 沟线的走法（八片式） |
| R7 | 沙粒、糖粒的显微照片 | Commons "Sand grains under microscope"、"Sugar crystals" | CC | 形状、大小分布、透明度 |
| R8 | 脚车轮与落地打气筒 | Commons | CC | 气门嘴、软管、打气筒的把手与底座 |
| R9 | 沙堆的休止角 | P14 的图（只看） | 版权 | 坡面 |

### 3.4 零件（67 个 + 3 个 context）

材质族见 docs/06；`shell` = X-RAY 时变透明。液体零件一律 `membrane` + `tint`（水：`#6c919a`，同 `water` 主题；果汁：`#c98a3c`；汽水：`#5b4632`，产品本色），由 `fill` 绑定按体积画（§4.3）。坐标是 R2 起点。

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | shell | sim 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|---|
| 01 | `balance-a` Electronic balance / 电子秤 | weighing | `bevelBox` 机身 0.20 × 0.05 × 0.22；extra：圆秤盘（`lathe`）、显示窗（深色 `bevelBox`，空的）、两个按钮 | `enamel` + `stainless` + `powder` | | | R3 |
| 02 | `beam-balance` Beam balance / 天平 | weighing | 中柱 `lathe`、横梁 `bevelBox`（0.30 长）、指针、两只吊盘（`lathe` 浅盘 + 三根吊线 `tube`） | `stainless` + `brass` | | 姿态 `beam-tilt`（向石头一侧倾 6°，01 第 3 拍；示意角度） | R3 |
| 03 | `object-tray` Tray / 托盘 | weighing | `bevelBox` 浅盘 0.24 × 0.015 × 0.14 | `plastic` | | | — |
| 04 | `stone` Stone / 石头 | weighing | 扁长卵石：`sphere` + `scale` [1.7, 0.8, 1.0]（半径按 25 cm³ 反算）+ 两处小凹凸的 extra | `abrasive` 灰 tint | | T1 绑定：`weigh-object` = stone → 姿态 `pan-stone`（移到秤盘上）；01 第 3 拍姿态 `beam-tilt` 里在天平右盘 | — |
| 05 | `sponge` Sponge / 海绵 | weighing | `bevelBox` 0.12 × 0.04 × 0.08（圆角 0.008）；extra：表面一些浅凹点（小 `sphere` 半嵌，`repeat`）表示孔 | `fabric` 黄 tint | | T1 → `pan-sponge`；02 第 4 拍姿态 `sponge-squeezed`（`scale` [1, 0.45, 1]） | — |
| 06 | `marble` Glass marble / 玻璃弹珠 | weighing | `sphere` 半径 0.008；extra：内部一条彩色扭带（`sweep`） | `glass` + `plastic` tint | | T1 → `pan-marble` | — |
| 07 | `clay-ball` Clay ball / 黏土球 | weighing | `sphere` 半径 0.0168 | `rubber` 赭 tint（哑光） | | T1 → `pan-clay` | — |
| 08 | `water-beaker` Beaker of water / 一杯水 | weighing | `lathe` 烧杯（250 ml，带嘴）；extra：200 ml 水体（静态 `lathe`，不用 `fill`） | `glass` + `membrane` | ✓ | T1 → `pan-water` | R1 |
| 09 | `cylinder-a` Measuring cylinder A / 量筒 A | measuring | `lathe` 筒身（内半径 0.0185、壁 0.0015、高 0.28）+ 倒水嘴；extra：底座（`lathe` 六边形 `segments: 6`）、刻度（`repeat` 细 `box`，每 10 ml 长一点，无数字） | `glass` + `powder` 刻度 | ✓ | | R1 |
| 10 | `cyl-a-water` Water in cylinder A / 量筒 A 里的水 | measuring | `lathe` = 量筒 A 的内轮廓（封闭到轴） | `membrane` 水 | | `fill` ← `v-cyl-a`（ml），`meniscus` | — |
| 11 | `tall-glass` Tall glass / 高玻璃杯 | measuring | `lathe` 直筒杯（内半径 0.030、高 0.12，厚底） | `glass` | ✓ | | — |
| 12 | `glass-water` Water in the glass / 杯里的水 | measuring | `lathe` = 杯的内轮廓 | `membrane` 水 | | `fill` ← `v-glass` | — |
| 13 | `flask` Conical flask / 锥形瓶 | measuring | `lathe`（F-9 的轮廓 + 颈 + 翻边） | `glass` | ✓ | | R2 |
| 14 | `flask-water` Water in the flask / 瓶里的水 | measuring | `lathe` = 锥形瓶的内轮廓 | `membrane` 水 | | `fill` ← `v-flask` | — |
| 15 | `bowl` Wide bowl / 宽碗 | measuring | `lathe` 半球碗（内半径 0.08）+ 圈足 | `enamel` 暖白（瓷碗） | | | — |
| 16 | `bowl-water` Water in the bowl / 碗里的水 | measuring | `lathe` = 碗的内轮廓 | `membrane` 水 | | `fill` ← `v-bowl` | — |
| 17 | `cylinder-b` Measuring cylinder B / 量筒 B | measuring | 同 09 | 同 09 | ✓ | | R1 |
| 18 | `cyl-b-water` Water in cylinder B / 量筒 B 里的水 | measuring | 同 10 | `membrane` 水 | | `fill` ← `reading`（水 + 物体占的总体积，§4.3） | — |
| 19 | `drop-stone` Stone in the water / 放进水里的石头 | measuring | 同 04 的形状（另一块） | `abrasive` | | T2 → 姿态 `in-cyl-stone`（沉到量筒 B 底）；不选时停在量筒旁的台面上 | — |
| 20 | `drop-marble` Marble / 弹珠 | measuring | 同 06 | 同 06 | | T2 → `in-cyl-marble` | — |
| 21 | `drop-clay-ball` Clay ball / 黏土球 | measuring | 同 07 | 同 07 | | T2 → `in-cyl-clay-ball` | — |
| 22 | `drop-clay-roll` Clay roll / 黏土长条 | measuring | `capsule` 半径 0.008、长 0.099（同 20 cm³） | 同 07 | | T2 → `in-cyl-clay-roll`（竖着沉到底） | — |
| 23 | `basin` Glass basin / 玻璃水盆 | air-bench | `lathe` 直壁浅盆（内半径 0.12、高 0.18） | `glass` | ✓ | | R5 |
| 24 | `basin-water` Water in the basin / 盆里的水 | air-bench | `lathe` 盆的内轮廓 | `membrane` 水 | | `fill` ← `v-basin`；`visible` ← `cup-place` = above | — |
| 25 | `basin-water-cup` Water round the cup / 杯子周围的水 | air-bench | `lathe`：盆的内轮廓减去杯子外形占的圆柱（§4.3 的"带空腔轮廓"） | `membrane` 水 | | `fill` ← `v-basin-cup`；`visible` ← `cup-place` = pushed | — |
| 26 | `cup` Upside-down cup / 倒扣的杯子 | air-bench | `lathe` 直筒杯（F-19），倒扣 | `glass` | ✓ | 姿态 `cup-pushed`（下移到杯口离盆底 0.03）；`cup-place` 绑定 | R5 |
| 26b | `cup-hole-mark` Hole in the cup / 杯底的孔 | air-bench | 杯底中心一只小 `torus`（内径 4 mm）+ 一片深色小圆片表示孔 | `powder` 深 | | `visible` ← 控件 `cup-hole`；随 `cup-pushed` 移动 | — |
| 27 | `cup-water` Water inside the cup / 杯里的水 | air-bench | `lathe` 杯的内轮廓（从杯口起算） | `membrane` 水 | | `fill` ← `v-cup`（随 `cup` 的姿态移动：同一姿态里写它） | — |
| 28 | `tissue` Tissue / 纸巾 | air-bench | 一团皱的纸：几片 `wing` 小片 + 一个压扁的 `sphere`，塞在杯底 | `fabric` 白 | | `tint` ← `tissue-wet`（0 / 1 → 变深、变灰半透） | R5 |
| 29 | `balance-b` Electronic balance B / 电子秤 B | air-bench | 同 01；extra：一只放球的圈座（`torus`） | 同 01 | | | R3 |
| 30 | `basketball` Basketball / 篮球 | air-bench | `sphere` 半径 0.119；extra：八道沟线（细 `sweep` 贴在球面上，合并） | `rubber` 橙褐 tint + `rubber` 近黑 | | 姿态 `ball-flat`（`scale` y 0.94，贴盘处压扁）↔ 默认圆；绑定 `firmness` = flat → `ball-flat` | R6 |
| 31 | `ball-pump` Ball pump / 打气筒 | air-bench | 筒身 `lathe` + 把手 `bevelBox` + 软管 `tube` + 打气针（到球的气门） | `plastic` + `rubber` | | 不做把手动画：打进去的空气由流 `pumped-air` 表示 | — |
| 32 | `balloon-pump` Balloon pump / 气球打气筒 | air-bench | 同 31 的小号，竖放 | `plastic` | | | — |
| 33 | `balloon-round` Round balloon / 圆气球 | air-bench | `lathe` 气球轮廓（瘪 / 鼓两套由姿态 `scale` 表示）+ 打结的嘴 | `rubber` 红 tint（半透） | | 姿态 `balloons-full`（05 第 2 拍） | — |
| 34 | `balloon-long` Long balloon / 长气球 | air-bench | `sweep` 长条，粗 0.03 | `rubber` 蓝 tint | | 同上 | — |
| 35 | `syringe-rack` Syringe press / 压针筒架 | syringes | 底板 + 两根立柱（`lathe`）+ 横梁（`bevelBox`），三个夹子 | `powder` + `stainless` | | | R4 |
| 36 | `syringe-air` Air syringe / 装空气的针筒 | syringes | 筒身 `lathe`（内半径 0.010、刻度长 0.0637）+ 指托 + 封帽；extra：刻度（`repeat`，每 1 ml 一条、5 ml 长） | `glass`（塑料透明的读法同玻璃）+ `rubber` 帽 | ✓ | | R4 |
| 37 | `syringe-water` Water syringe / 装水的针筒 | syringes | 同 36 | 同 36 | ✓ | | R4 |
| 38 | `syringe-sand` Sand syringe / 装沙的针筒 | syringes | 同 36 | 同 36 | ✓ | | R4 |
| 39 | `plunger-air` Plunger (air) / 柱塞（空气） | syringes | 柱塞杆（十字截面 `extrude`）+ 活塞头（`lathe` 深色橡胶）+ 顶上托盘（`lathe`） | `plastic` + `rubber` | | `offset` ← `v-air`（每 ml 0.00318 m，原点 20，向下）+ `settle` | R4 |
| 40 | `plunger-water` Plunger (water) / 柱塞（水） | syringes | 同 39 | 同 39 | | `offset` ← `v-water`（同上；读数不变，柱塞不动） | R4 |
| 41 | `plunger-sand` Plunger (sand) / 柱塞（沙） | syringes | 同 39 | 同 39 | | `offset` ← `v-sand` | R4 |
| 42 | `water-column` Water in the syringe / 针筒里的水 | syringes | `lathe` 柱（20 ml） | `membrane` 水 | | | — |
| 43 | `sand-column` Sand in the syringe / 针筒里的沙 | syringes | `lathe` 柱；`abrasive` 细颗粒法线 | `abrasive` 沙色 tint | | | — |
| 44 | `masses-air` Masses (air) / 砝码（空气） | syringes | 1 kg 圆柱槽码（`lathe` 带槽）`repeat` 4（沿 Y 叠） | `steel` | | `count` ← `load`（`per: 1`） | — |
| 45 | `masses-water` Masses (water) / 砝码（水） | syringes | 同 44 | 同 44 | | `count` ← `load`；随 `plunger-water` 同一 `offset` | — |
| 46 | `masses-sand` Masses (sand) / 砝码（沙） | syringes | 同 44 | 同 44 | | `count` ← `load`；随 `plunger-sand` | — |
| 47 | `sand-heap` Heap of sand / 一堆沙 | grains | 碟子（`lathe`）+ 圆锥沙堆（`lathe`，坡 33°，表面轻微起伏） | `enamel` 碟 + `abrasive` 沙色 | | | R9 |
| 48 | `sugar-heap` Heap of sugar / 一堆糖 | grains | 同 47，糖色（近白、`abrasive` 细颗粒） | `enamel` + `abrasive` 白 tint | | | — |
| 49 | `water-dish` Dish of water / 一碟水 | grains | 同样的碟子 + 平的水面（静态 `lathe`） | `enamel` + `membrane` | | | — |
| 50 | `cylinder-c` Measuring cylinder C / 量筒 C | grains | 同 09 | 同 09 | ✓ | | R1 |
| 51 | `sand-in-cylinder` Dry sand / 量筒里的干沙 | grains | `lathe` 柱，到 100 ml 刻度 | `abrasive` 沙色 | | `tint` ← `wet`（0–1，干 → 湿：变深） | — |
| 52 | `water-over-sand` Water above the sand / 沙上的水 | grains | `lathe` = 量筒 C 的内轮廓 | `membrane` 水 | | `fill` ← `water-above`，`fill.below: 100`（从 100 ml 处往上画） | — |
| 53 | `pour-cup` Beaker to pour from / 倒水用的烧杯 | grains | 带嘴的 250 ml 烧杯（`lathe`） | `glass` | ✓ | | R1 |
| 53b | `jug-water` Water to pour / 准备倒的水 | grains | `lathe` = 烧杯的内轮廓 | `membrane` 水 | | `fill` ← `water-left`（100 − 已倒的） | — |
| 54 | `magnifier` Magnifying glass / 放大镜 | grains | 镜片（`lathe` 双凸薄片）+ 镜框 `torus` + 柄 `capsule` | `glass` + `powder` | | | — |
| 55 | `bicycle-wheel` Bicycle wheel / 脚车轮 | around-you | 轮胎 `torus`（半径 0.31、管粗 0.022）、轮圈 `torus`、辐条（`repeat` 32 细 `tube`）、花鼓 `lathe`、气门嘴；矮架 `bevelBox` | `rubber` + `stainless` + `steel` | | 姿态 `tyre-soft`（轮胎 `scale` 下半略扁）↔ 默认 | R8 |
| 56 | `floor-pump` Floor pump / 落地打气筒 | around-you | 筒身 `lathe` + T 形把手 + 底座踏板 + 软管 `tube` 接到气门嘴 | `powder` + `rubber` | | 不做把手动画（同 31）；05 第 5 拍运转时只有流 | R8 |
| 57 | `drink-can` Can of drink / 汽水罐 | around-you | `lathe` 罐（上下收口、罐顶、拉环 extra） | `casing` 铝 | ✓ | | — |
| 58 | `can-drink` Drink inside / 罐里的汽水 | around-you | `lathe` 液体到罐高 90 %（静态）；extra：几十个小气泡（`sphere`，`repeat` 合并） | `membrane` 汽水色 + `glass` 气泡 | | X-RAY 时可见（罐是 `shell`） | — |
| 59 | `kaya-jar` Jar of kaya / 一瓶咖椰 | around-you | `lathe` 玻璃瓶 + 盖；extra：瓶里的咖椰（`lathe`，表面不平，挖过的一个坑） | `glass` + `plastic` 盖 + `tissue`（哑光糊状）绿褐 tint | ✓ | | — |
| 60 | `ice-cube` Ice cube / 冰块 | around-you | 两块圆角方块（`bevelBox` 0.025）在一只小碟（`lathe`）里 | `glass` 浅冷 tint（冰）+ `enamel` 碟 | | | — |
| 61 | `juice-glass` Glass of juice / 一杯果汁 | around-you | 杯 `lathe` + 果汁（静态 `lathe`） | `glass` + `membrane` 果汁色 | ✓ | | — |
| 62 | `torch` Torch / 手电筒 | around-you | 筒身 `lathe` + 灯头 + 开关 | `powder` + `glass` | | | — |
| 62b | `torch-beam` Light from the torch / 手电筒的光 | around-you | 一只很淡的长 `cone`（从灯头向前 0.5 m） | `membrane` 浅暖 tint，透明度高 | | 默认 `hide`（每章的 `hide` 都写它），只在 01 第 5 拍显示；标注说明"光不是物质"——画出来只为让读者知道说的是哪里 | — |
| 63 | `sand-grains` Sand grains ×40 / 放大的沙粒 | closer | 约 40 粒不规则多面体（`lathe` `segments: 5–7` 再 `scale` 打乱，合并）散在台座上 | `glass` 浅褐 / 灰 / 白三档 tint（同材质合并） | | | R7 |
| 64 | `sugar-crystals` Sugar crystals ×40 / 放大的糖粒 | closer | 约 25 个短棱柱（`extrude` 平行四边形截面，合并） | `glass` 近白 | | | R7 |
| c1 | `bench` Science bench / 实验台 | — | `bevelBox` 台面 1.6 × 0.04 × 0.7 + 四条腿 | `wood` 浅 | | | |
| c2 | `side-table` Side table / 小桌 | — | `bevelBox` 0.5 × 0.04 × 0.5 + 腿 | `wood` | | | |
| c3 | `closer-plinth` Plinth / 放大台座 | — | `bevelBox` 0.06 × 0.01 × 0.04（×40 组里就是 2.4 × 1.6 mm 的一片） | `enamel` 浅灰 | | | |


- **零件数**：表里 67 件（01–64 加 26b、53b、62b）+ 3 个 context，比 `mosquito`（52）多，因为六个工位各有自己的器材和液体。**零件数理由**：每个液体单独一件（`fill` 绑定按零件画液面；它们要分别被标注"这里是同样的 200 ml"）；三支针筒、三支柱塞、三叠砝码分开（标注与绑定各不相同）；放进量筒的四样东西单独一件（每样一个姿态）。**合并 / 删减顺序**（超预算时）：`object-tray` 并进 `balance-a` 的 extra → `balloon-pump` 删去（气球直接画鼓 / 瘪两态）→ `magnifier` 删去 → `water-dish` 并进 `sand-heap` 的 extra（同一张碟的旁边）→ `pour-cup` 与 `jug-water` 删去（字幕照说"旁边有 100 毫升水"）。
- **绘制预算**（§8.2 验收）：全景（hero，01–05 组 + 小桌）静止 ≤ 85 calls、运转 ≤ 90、上限 100；**各章（只开本章的组）≤ 60**；三角形 < 0.4 M。估算：玻璃件每件 1–2 槽（玻璃 + 刻度），液体每件 1 槽；称质量 12、量体积 22、空气 18、压针筒 16、沙和糖 12、身边 14、放大 2、context 3、流 1–2。全开约 100：hero 不开 `around-you` 与 `closer`，第 06 章才开 `around-you`。刻度线用 `repeat` 合并、篮球沟线合并、辐条合并。
- 默认只隐藏 `torch-beam`（每章 `hide` 写它，01 第 5 拍不写）；`basin-water-cup` 的显隐由 `cup-place` 决定；放大组只在指定拍的 `layers` 里。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么，≤ 60 字符） | detail 要点（怎样做到 · 数字 · 常见误解） |
|---|---|---|
| `balance-a` | Measures mass in grams. / 量质量，以克为单位。 | 先放空容器、按"归零"（F-16 的分度）；量的是质量（P4），"重量"是 P6 的另一个量（链 `forces`） |
| `beam-balance` | Compares two masses side by side. / 并排比较两样东西的质量。 | 重的一边沉下去；比的是质量不是大小（M-5） |
| `stone` | Small but heavy: 66 g for 25 cm³. / 个子小，却重：25 cm³ 有 66 g。 | 模型值（S1）；密度一词只在细看 |
| `sponge` | Big but light; its holes are full of air. / 个子大，却轻；孔里全是空气。 | 384 cm³ 只有 11.5 g（S1）；捏小时挤出去的是空气（M-7）；浮在水上，不能放进量筒量 |
| `clay-ball` / `drop-clay-roll` | Same clay, two shapes, same volume. / 同一团黏土，两种形状，体积一样。 | 20 cm³（S1）；T2 先猜后看（M-8） |
| `cylinder-a` 等量筒 | Measures the volume of a liquid in ml. / 量液体的体积，单位毫升。 | 分度 2 ml（F-8）；视线与液面平，读凹面最低处（细看）；链 `measuring` |
| `cyl-a-water` 等液体 | The same 200 ml of water, in another shape. / 同样的 200 ml 水，换了一种形状。 | 液面高度（SIM，§2.4）；液面总是平的 |
| `drop-stone` | Takes up space, so the water rises. / 它占据了空间，所以水面升高。 | 125 − 100 = 25 cm³（S1）；排水法一词在细看 |
| `cup` | Upside down, it traps air. / 倒扣着，把空气关在里面。 | 压下去：盆里水面升约 9 mm、杯里水面只比杯口高约 1 mm（SIM）；开孔：空气冒出、水灌进来 |
| `tissue` | Stays dry while air fills the cup. / 杯里有空气，它就不湿。 | 有孔时变湿 |
| `basketball` | Pumping in air makes it heavier. / 打进空气，它就变重。 | 每下约 0.24 g、20 下约 4.7 g（SIM）；FIBA 7 号球的质量范围（F-15）；为什么不用气球（D9） |
| `syringe-air` | Air inside can be squashed smaller. / 里面的空气能被压小。 | 4 kg 时 9.0 ml（SIM）；拿走砝码弹回 20 ml |
| `syringe-water` | Water inside hardly squashes at all. / 里面的水几乎压不小。 | 4 kg 时少 0.001 ml，读不出（SIM，F-6） |
| `syringe-sand` | Sand grains push back; it stays put. / 沙粒互相顶住，柱塞不动。 | 沙粒之间有空气，但颗粒先顶住了（S1 写明是模型的简化；真实的松沙会先压实一点，待核） |
| `sand-heap` | Pours, but each grain is a solid. / 会倒，但每一粒都是固体。 | 坡 33°（F-22）；水面是平的 |
| `sand-in-cylinder` | 100 ml of sand: grains and air. / 100 ml 的沙：沙粒加空气。 | 孔隙 35 %（F-20）；T6 |
| `bicycle-wheel` | More air is squeezed into the same tyre. / 同一条轮胎里压进更多空气。 | 定性（F-25）；不要打得过满 |
| `drink-can` | Solid can, liquid drink, gas bubbles. / 固体的罐、液体的汽水、气体的泡泡。 | X-RAY 看罐里（F-24） |
| `kaya-jar` | A thick spread that is hard to sort. / 一种不好分类的稠抹酱。 | 细看（D13） |
| `torch` | Its light is not matter. / 它发出的光不是物质。 | 没有质量、不占据空间；光、热是能量（M-10） |
| `sand-grains` / `sugar-crystals` | Each grain has its own shape. / 每一粒都有自己的形状。 | ×40；沙 0.0625–2 mm（F-21）；糖晶粒（F-23） |

---

## 3.6 流

颜色语义：`cold` 小点 = **空气**（同 `mosquito` 与 `water` 的约定：冷色点是空气 / 气体）；液体不画流（液体靠 `fill` 的液面）。每条流一次绘制。

| id | group | 路径 | 约长 m | speed | count | size | 说明 |
|---|---|---|---|---|---|---|---|
| `escaping-air` | air-flow | 多路径：`cup-hole` = 杯底小孔 → 竖直向上到水面（气泡上升）；`sand-gaps` = 量筒 C 沙柱里 5 条短竖线 → 沙面 | 0.06 + 5 × 0.05 | 0.06 | 120 | 0.9（气泡大一点） | 流 `visible`：`cup-hole` ← `cup-bubbles`（压下去且开孔时）；`sand-gaps` ← `sand-bubbles`（0 < 加的水 < 35 ml 时，T6 第 2 档）；`clip: false` |
| `pumped-air` | air-flow | 多路径：`ball` = 打气筒 → 软管 → 球的气门 → 球心；`tyre` = 落地打气筒 → 软管 → 气门嘴 → 沿轮胎内管 90°；`balloon` = 气球打气筒 → 两只气球 | 0.5 + 0.7 + 0.3 | 0.25 | 240 | 0.5 | `whenRun: true`；04 第 4 拍、05 第 2、5 拍 |

合计运转时 +2 次绘制。**不画**"气体在容器里乱跑"的点：那是粒子模型（D12）。

## 3.7 动画与姿态

**动画**：无。打气、气泡的"动"都由流表示（§3.6）；打气筒的把手不做上下动画（要把把手拆成单独的零件，读者从流已经看得出"在打气"，不值得多两件）。

**姿态**（`poses`，≤ 32）：

| 名 | 零件 | 变换 | 用在 |
|---|---|---|---|
| `pan-stone` / `pan-sponge` / `pan-marble` / `pan-clay` / `pan-water` | 各自的物体 | 从托盘 offset 到电子秤 A 的秤盘中心 | T1 绑定 `weigh-object` |
| `beam-tilt` | `beam-balance`（横梁与两盘）、`stone`、`sponge` | 海绵进左盘、石头进右盘；横梁绕支点向右倾 6°（示意） | 01 第 3 拍 |
| `in-cyl-stone` / `in-cyl-marble` / `in-cyl-clay-ball` / `in-cyl-clay-roll` | 各自的物体 | 移到量筒 B 底（`offset`，0.8 s） | T2 绑定 `drop-object` |
| `sponge-squeezed` | `sponge` | `scale` [1, 0.45, 1]（绕底面） | 02 第 4 拍 |
| `cup-pushed` | `cup`、`cup-hole-mark`、`cup-water`、`tissue` | 从水面上方下移到杯口离盆底 0.03 m | `cup-place` 绑定 |
| `ball-flat` | `basketball` | 贴秤的一面 `scale` y 0.94（瘪） | `firmness` = flat |
| `balloons-full` | `balloon-round`、`balloon-long` | 从瘪的小尺寸放大到鼓起的尺寸（各自的 `scale`） | 05 第 2 拍 |
| `tyre-soft` | `bicycle-wheel` 的轮胎 | 下缘略扁 | 05 第 5 拍开头（之后不写姿态 = 鼓） |

## 3.8 HUD 数据

- **标题**：EN "States of Matter" / ZH "物质的三态"；副标题 EN "Solids, liquids and gases on a science bench: mass, space, shape and volume" / ZH "在实验台上看固体、液体、气体：质量、空间、形状与体积"；`shortTitle` EN "Matter" / ZH "物质"；`moe`：`["MOE 2023 Science P4 Cycles in Matter and Water (Matter)"]`；`tags: [singapore, psle, p4, space]`（同 `forces` 的写法；UI 不显示年级）；`illustration: states-of-matter`；`subject: science`。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Liquid / 液体 | `200 ML WATER` / `水 200 毫升` | design |
| Syringes / 针筒 | `3 × 20 ML · TIPS SEALED` / `3 支 20 毫升 · 针口封住` | design |
| Air / 空气 | `≈ 1.2 G PER LITRE · 25 °C` / `每升约 1.2 克 · 25°C` | typical |
| Ball / 篮球 | `SIZE 7 · 600 G FLAT` / `7 号球 · 瘪时 600 克` | design |

- **telemetry**（≤ 6，全部 `follow`，SIM；`scope: "observe"` 的行只在本章卡片观察它时有数，否则 `—`）：

| key EN / ZH | follow | unit | decimals | scope |
|---|---|---|---|---|
| Mass / 质量 | `mass`、`ball-mass` | g | 1 | observe |
| Volume / 体积 | `reading`、`poured`、`sand-reading` | ml | 0 | observe |
| Water height / 液面高度 | `level` | cm | 1 | observe |
| Syringes · air · water · sand / 针筒 · 空气 · 水 · 沙 | `v-air`、`v-water`、`v-sand` | ml | 1 | （三值一行） |
| Basin level / 盆里水面 | `basin-level` | cm | 1 | — |
| Air pumped in / 打进的空气 | `air-added` | g | 1 | observe |

  块尾 `SIM <本章第一个状态输出> · <本章改变量的值>`（如 `SIM FIRM · 20 PUMPS`、`SIM DRY · PUSHED`）。

- **镜头预设**（≤ 6，不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `scales-view` | SCALES | 称质量工位 3/4 前，电子秤与天平同框（01） |
| 2 | `cylinders-view` | VOLUME | 量体积工位正前略俯，量筒 A、B 与三种容器同框（02、03） |
| 3 | `basin-view` | BASIN | 水盆正前、与水面同高的低机位，看得见杯里杯外的水面（04） |
| 4 | `syringe-view` | SYRINGES | 压针筒架正前，三支针筒的刻度看得清（05） |
| 5 | `grains-view` | SAND | 沙和糖工位 3/4 前（02、06） |
| 6 | `table-view` | AROUND YOU | 小桌 3/4 前（06） |

  hero 用 `views.assembled.camera`：整台 3/4 前右上、约 2.2 m 外，小桌在左后方边缘；`views.cover` = hero 略拉近，只开 01–05 组；放大组的镜头写在拍里（`closer`，正上方偏前 40°，×40 台座填满画面）。
- `views.section.plane: "xy"`（PLATE 立面画正视图：液面高低、针筒长短最清楚）。不设剖切面（玻璃件是 `shell`，X-RAY 看汽水罐和咖椰瓶里面）。
- **模式组合**：X-RAY + FLOW（玻璃与罐透明，空气点可见：04、06 的读法）；EXPLODED（引擎禁用 FLOW；各工位的东西向上拆开 0.05–0.1 m，液体零件 `explode.dist` 0：不拆，避免"水飘在空中"）；hide + EXPLODED 照常；REFERENCE 冻结 sim。

---

## 4. 引擎

### 4.1 要看得见的物理（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 物质有质量（量质量） | 东西被放上电子秤，读数出现在卡片与 PLATE；天平向石头一侧倾 | **E-MA1** `weigh` → `pose` 绑定（已有）；天平姿态（已有） |
| 物质占据空间（量体积） | 石头沉进量筒，水面升高 2.3 cm | E-MA1 `displace` → **E-MA2 `fill`**（液面）+ `pose`（已有） |
| 液体：形状随容器、体积不变 | 量筒里的水"倒"进杯 / 瓶 / 碗：量筒的液面降下、另一只容器的液面升起（同时缓动 1.2 s），高度各不相同 | E-MA1 `pour` → E-MA2 `fill`（缓动） |
| 气体：没有固定的形状和体积，能被压缩 | 加砝码，空气针筒的柱塞下沉、回弹；水和沙的不动；气球鼓成各自的形状 | E-MA1 `squeeze` → `offset` + `settle`、`count`（已有）；姿态 |
| 空气占据空间 | 倒扣的杯子压下去，盆里水面升起、杯里的水只到杯口；开孔，气泡冒出，水灌进杯子，纸巾变湿 | E-MA1 `cup` → E-MA2 `fill`、`visible`（流、零件）、`tint`（已有） |
| 空气有质量 | 打气，球从瘪变圆，读数一下下变大 | E-MA1 `pump` → `pose`（已有） |
| 沙是固体、沙里有空气 | 往干沙里倒水：先冒气泡、沙变深色、读数不动；空隙满了以后水面在沙上升起 | E-MA1 `pores` → E-MA2 `fill`（`below`）、`tint`、流 `visible` |

### 4.2 模型 `matter`（E-MA1；`lib/sim/matter.ts`，纯函数，有单测）

全部同步、确定、< 0.1 ms；只在控件值变化时算。七个子模型各自可选，数据里没写的子模型不提供它的量（同 `force`）。读数按输出的 `decimals` 四舍五入后才进卡片 / PLATE / 表；模型内部全精度，单测按 3 位有效数字钉 §2.4。

```jsonc
"sim": {
  "kind": "matter",
  "controls": [
    { "id": "weigh-object", "kind": "choice", "default": "stone", "label": { "en": "On the balance", "zh": "秤上放的" },
      "options": [ { "id": "stone", … }, { "id": "sponge", … }, { "id": "marble", … }, { "id": "clay", … }, { "id": "water", … } ] },
    { "id": "drop-object", "kind": "choice", "default": "nothing", "label": { "en": "Put into the water", "zh": "放进水里的" },
      "options": [ { "id": "nothing", … }, { "id": "stone", … }, { "id": "marble", … }, { "id": "clay-ball", … }, { "id": "clay-roll", … } ] },
    { "id": "container", "kind": "choice", "default": "cylinder", "label": { "en": "Water poured into", "zh": "水倒进" },
      "options": [ { "id": "cylinder", … }, { "id": "glass", … }, { "id": "flask", … }, { "id": "bowl", … } ] },
    { "id": "pumps", "kind": "step", "values": [0, 5, 10, 15, 20], "default": 0, "label": { "en": "Pumps of air", "zh": "打气的次数" } },
    { "id": "cup-place", "kind": "choice", "default": "above", "label": { "en": "Cup", "zh": "杯子" },
      "options": [ { "id": "above", … }, { "id": "pushed", … } ] },
    { "id": "cup-hole", "kind": "toggle", "default": false, "label": { "en": "Hole in the cup", "zh": "杯底开孔" } },
    { "id": "load", "kind": "step", "values": [0, 1, 2, 3, 4], "default": 0, "unit": "kg", "label": { "en": "Mass on each plunger", "zh": "每支柱塞上的砝码" } },
    { "id": "water-added", "kind": "step", "values": [0, 20, 40, 60, 80, 100], "default": 0, "unit": "ml", "label": { "en": "Water poured onto the sand", "zh": "倒进沙里的水" } }
  ],
  "outputs": [
    { "id": "mass", "from": "weigh:mass", "unit": "g", "decimals": 1 },
    { "id": "reading", "from": "displace:reading", "unit": "ml", "decimals": 0 },
    { "id": "object-volume", "from": "displace:volume", "unit": "cm³", "decimals": 0 },
    { "id": "level", "from": "pour:level", "unit": "cm", "decimals": 1 },
    { "id": "poured", "from": "pour:volume", "unit": "ml", "decimals": 0 },
    { "id": "ball-mass", "from": "pump:mass", "unit": "g", "decimals": 1 },
    { "id": "air-added", "from": "pump:air", "unit": "g", "decimals": 1 },
    { "id": "firmness", "kind": "state", "from": "pump:firmness", "states": { "flat": {…}, "soft": {…}, "firm": {…}, "too-hard": {…} } },
    { "id": "basin-level", "from": "cup:basin-level", "unit": "cm", "decimals": 1 },
    { "id": "basin-rise", "from": "cup:basin-rise", "unit": "mm", "decimals": 1 },
    { "id": "cup-rise", "from": "cup:cup-rise", "unit": "mm", "decimals": 1 },
    { "id": "tissue", "kind": "state", "from": "cup:tissue", "states": { "dry": {…}, "wet": {…} } },
    { "id": "cup-bubbles", "kind": "state", "from": "cup:bubbles", "states": { "none": {…}, "rising": {…} } },
    { "id": "v-air", "from": "squeeze:air", "unit": "ml", "decimals": 1 },
    { "id": "v-water", "from": "squeeze:water", "unit": "ml", "decimals": 1 },
    { "id": "v-sand", "from": "squeeze:sand", "unit": "ml", "decimals": 1 },
    { "id": "sand-reading", "from": "pores:reading", "unit": "ml", "decimals": 0 },
    { "id": "air-gaps", "from": "pores:air", "unit": "ml", "decimals": 0 },
    { "id": "vs-sum", "kind": "state", "from": "pores:vs-sum", "states": { "equal": {…}, "less": {…}, "more": {…} } },
    { "id": "sand-bubbles", "kind": "state", "from": "pores:bubbles", "states": { "none": {…}, "rising": {…} } },
    { "id": "wet", "from": "pores:wet" },                                   // 0–1，给 tint
    { "id": "tissue-wet", "from": "cup:wet" },                              // 0 / 1，给 tint
    { "id": "v-cyl-a", "from": "volume:cyl-a-water", "unit": "ml" },       // 以下给 fill：每个液体零件此刻装多少 ml
    { "id": "v-glass", "from": "volume:glass-water", "unit": "ml" },
    { "id": "v-flask", "from": "volume:flask-water", "unit": "ml" },
    { "id": "v-bowl", "from": "volume:bowl-water", "unit": "ml" },
    { "id": "v-basin", "from": "volume:basin-water", "unit": "ml" },
    { "id": "v-basin-cup", "from": "volume:basin-water-cup", "unit": "ml" },
    { "id": "v-cup", "from": "volume:cup-water", "unit": "ml" },
    { "id": "water-above", "from": "volume:water-over-sand", "unit": "ml" },
    { "id": "water-left", "from": "volume:jug-water", "unit": "ml" }
  ],
  "bind": [
    { "control": "weigh-object", "part": ["stone", "sponge", "marble", "clay-ball", "water-beaker"], "pose": { "stone": "pan-stone", "sponge": "pan-sponge", "marble": "pan-marble", "clay": "pan-clay", "water": "pan-water" } },
    { "control": "drop-object", "part": ["drop-stone", "drop-marble", "drop-clay-ball", "drop-clay-roll"], "pose": { "stone": "in-cyl-stone", "marble": "in-cyl-marble", "clay-ball": "in-cyl-clay-ball", "clay-roll": "in-cyl-clay-roll" } },
    { "output": "v-cyl-a", "part": "cyl-a-water", "fill": { "per": 1e-6, "meniscus": 0.0015, "ease": 1.2 } },
    { "output": "v-glass", "part": "glass-water", "fill": { "per": 1e-6, "ease": 1.2 } },
    { "output": "v-flask", "part": "flask-water", "fill": { "per": 1e-6, "ease": 1.2 } },
    { "output": "v-bowl", "part": "bowl-water", "fill": { "per": 1e-6, "ease": 1.2 } },
    { "output": "v-basin", "part": "basin-water", "fill": { "per": 1e-6 } },
    { "output": "v-basin-cup", "part": "basin-water-cup", "fill": { "per": 1e-6, "ease": 1.0 } },
    { "output": "v-cup", "part": "cup-water", "fill": { "per": 1e-6, "ease": 1.0 } },
    { "output": "water-left", "part": "jug-water", "fill": { "per": 1e-6 } },
    { "output": "reading", "part": "cyl-b-water", "fill": { "per": 1e-6, "meniscus": 0.0015 } },
    { "output": "water-above", "part": "water-over-sand", "fill": { "per": 1e-6, "below": 100, "meniscus": 0.0015 } },
    { "control": "cup-place", "part": ["cup", "cup-hole-mark", "cup-water", "tissue"], "pose": { "pushed": "cup-pushed" } },
    { "control": "cup-hole", "part": "cup-hole-mark", "visible": true },
    { "control": "cup-place", "part": "basin-water", "visible": { "eq": "above" } },
    { "control": "cup-place", "part": "basin-water-cup", "visible": { "eq": "pushed" } },
    { "output": "tissue-wet", "part": "tissue", "tint": { "color": "token:ink-3", "full": 1 } },
    { "output": "cup-bubbles", "flow": "escaping-air", "paths": ["cup-hole"], "visible": { "eq": "rising" } },    // 按路径显隐：§4.3
    { "output": "firmness", "part": "basketball", "pose": { "flat": "ball-flat" } },
    { "output": "v-air", "part": ["plunger-air", "masses-air"], "offset": { "axis": [0, 1, 0], "per": 0.00318, "origin": 20, "settle": { "period": 0.5, "damping": 0.25 } } },
    { "output": "v-water", "part": ["plunger-water", "masses-water"], "offset": { … 同上 … } },
    { "output": "v-sand", "part": ["plunger-sand", "masses-sand"], "offset": { … 同上 … } },
    { "control": "load", "part": ["masses-air", "masses-water", "masses-sand"], "count": { "per": 1 } },
    { "output": "wet", "part": "sand-in-cylinder", "tint": { "color": "token:ink-2", "full": 1 } },
    { "output": "sand-bubbles", "flow": "escaping-air", "paths": ["sand-gaps"], "visible": { "eq": "rising" } }
  ],
  "matter": {
    "g": 9.8, "p0": 101.325, "air": 1.18, "water": { "density": 0.997, "squash": 4.5e-7 },        // kPa；g/ℓ；g/ml；每 kPa
    "objects": {
      "stone":     { "volume": 25,    "density": 2.65 },
      "sponge":    { "volume": 384,   "density": 0.030, "floats": true },
      "marble":    { "volume": 2.145, "density": 2.5 },
      "clay":      { "volume": 20,    "density": 1.6 },
      "clay-ball": { "volume": 20,    "density": 1.6 },
      "clay-roll": { "volume": 20,    "density": 1.6 },
      "water":     { "volume": 200,   "density": 0.997 }
    },
    "weigh":    { "object": "weigh-object", "step": 0.1 },
    "displace": { "object": "drop-object", "water": 100, "liquid": "cyl-b-water" },
    "pour":     { "container": "container", "volume": 200, "liquids": { "cylinder": "cyl-a-water", "glass": "glass-water", "flask": "flask-water", "bowl": "bowl-water" } },
    "pump":     { "pumps": "pumps", "ball": 600.0, "stroke": 0.2, "inside": 7.0, "firm": [51.7, 58.6] },
    "cup":      { "place": "cup-place", "hole": "cup-hole", "basin": { "radius": 12, "depth": 14.0 }, "cup": { "radius": 3.5, "height": 9.0, "glass": 57.9, "rim": 3.0, "top": 12.4 },
                  "liquids": { "basin": "basin-water", "around": "basin-water-cup", "inside": "cup-water" } },
    "squeeze":  { "load": "load", "volume": 20, "bore": 2.0, "fillings": { "air": "gas", "water": "liquid", "sand": "grains" } },   // bore：内径 cm
    "pores":    { "water": "water-added", "sand": 100, "porosity": 0.35, "liquids": { "above": "water-over-sand", "jug": "jug-water" }, "jug": 100 }
  }
}
```

**规则**：

1. **称**（`weigh`）：`mass` = 所选物体的 `volume × density`，按 `step` 取整（0.1 g）。
2. **放进水里**（`displace`）：`reading` = `water` + 所选物体的 `volume`（`nothing` = 0）；`volume` = `reading − water`；`floats: true` 的物体不能是 `drop-object` 的选项（validate）；量 `volume:<liquid>` = `reading`（水 + 物体共同占到的刻度，液体零件按它画液面，物体画在液体里面，§4.3）。
3. **倒**（`pour`）：所选容器的液体零件 `volume:<part>` = `volume`，其余为 0；`level` = 该液体零件的轮廓按 `volume` 反解出的高度（cm，与 `fill` 用同一个纯函数 `lib/fill.ts levelForVolume`，单测保证舞台的液面 = 读数）；`volume`（输出 `poured`）= `volume`（倒回量筒读的数）。
4. **打气**（`pump`）：`air` = n × `stroke` × `air`（g）；`mass` = `ball` + `air`；表压 = n × `stroke` ÷ `inside` × `p0`（kPa，只给 `firmness`，不作输出）；`firmness`：n = 0 → `flat`，表压 < `firm[0]` → `soft`，≤ `firm[1]` → `firm`，否则 `too-hard`。
5. **倒扣的杯子**（`cup`，单位 cm、ml）：盆面积 A_b = π R²、杯内面积 A_c = π r²、杯内容积 V₀ = A_c × h、水量 V_w = A_b × depth。`above`：水面 = depth，杯里 0 ml，纸巾 `dry`，`bubbles` `none`。`pushed` 且无孔：解 x（杯里水面高出杯口）与 H（盆里水面）——V_air = V₀ − A_c x；H = (V_w + glass + V_air) ÷ A_b；p = p0 + ρ g (H − rim − x) / 100（kPa，ρ g = 9.77 kPa/m）；V_air = V₀ × p0 ÷ p；不动点迭代到 |Δx| < 1e-6 cm（≤ 20 次）。`pushed` 且有孔：V_air = 0，杯里灌满（V₀），H = (V_w + glass) ÷ A_b，纸巾 `wet`，`bubbles` `rising`。量：`basin-level` = H、`basin-rise` = (H − depth) × 10 mm、`cup-rise` = x × 10 mm（有孔时 = h × 10）、`wet` = 0 / 1、`volume:basin-water` = V_w（`above` 时；否则 0）、`volume:basin-water-cup` = V_w − 杯里的水（`pushed` 时）、`volume:cup-water` = A_c x 或 V₀。validate：`top` > `rim`、压下去时 H > `top`（杯子整只没入，单测钉 14.9 > 12.4、14.1 > 12.4）。
6. **压针筒**（`squeeze`）：压力增量 Δp = m × g ÷ (π (bore/2)² × 1e-4) ÷ 1000（kPa）；`gas`：V = volume × p0 ÷ (p0 + Δp)；`liquid`：V = volume × (1 − squash × Δp)；`grains`：V = volume（S1 写明："颗粒互相顶住，模型里柱塞不动"）。三支同时算（同一个 `load`）。
7. **沙里加水**（`pores`）：孔 = sand × porosity（35 ml）；`reading` = sand + max(0, W − 孔)；`air` = max(0, 孔 − W)；`wet` = min(1, W ÷ 孔)；`bubbles` = 0 < W < 孔 时 `rising`（W = 20），否则 `none`；`vs-sum`：W = 0 → `equal`，`reading` < sand + W → `less`，否则 `equal`（`more` 只为先猜后看的选项存在，模型不会给）；`volume:<above>` = max(0, W − 孔)（`fill.below = sand`）、`volume:<jug>` = jug − W。
8. `SEPARATE_EXPERIMENTS['matter'] = true`（同 `force`：七套实验各管各的，PLATE 块尾只写本章卡片的状态）。
9. **validate**（`sim-schema.ts matterIssues`）：每个子模型读的控件存在且种类对（选择 / 步进 / 开关）；`weigh` / `displace` 的每个选项在 `objects` 里（`nothing` 除外）；`objects` 里没被任何选项用到的键 = warning；`floats` 的物体不能放进 `displace`；`pour.liquids` 覆盖 `container` 的每个选项；`liquids` 里的零件存在、不是 context、primitive 是 `lathe`（或 `box`）；`pour.volume` 不超过每只容器液体零件的容积（§4.3 的 `capacity`，单测：200 ≤ 量筒 A 250、杯 339、瓶 282 + 颈、碗 1,072）；`displace.water + 最大物体体积` ≤ 量筒 B 容积；`cup` 的几何合理（`rim` < `top` < depth + 升高后的水面）；`squeeze.fillings` 的三个键 = 零件名无关的固定种类（`gas` / `liquid` / `grains`），输出的 `from` 写 `squeeze:<键>`；`pores.porosity` ∈ (0, 0.6)；`pores.water` 的最大值 ≤ `jug`；输出的 `from` 是这个模型的量、种类对得上；状态输出给每个状态写标签。

### 4.3 液面绑定 `fill`（E-MA2；`lib/fill.ts` 纯函数 + `stages/model3d/PartNode.tsx`）

```jsonc
{ "output": "v-flask", "part": "flask-water", "fill": { "per": 1e-6, "below"?: 0, "meniscus"?: 0.0015, "ease"?: 0.6 } }
```

- **零件**：primitive 是 `lathe`（轮廓封闭：首尾在轴上，或首点 = 末点；可以有贴着轴的段，用来挖掉杯子占的空腔——`basin-water-cup` 的轮廓 = (0, 0) → (R, 0) → (R, H_max) → (0, H_max) → (0, top) → (r_out, top) → (r_out, rim) → (0, rim) → (0, 0)）或 `box`（直棱柱，截面不变）。轮廓是**液体可能占到的最大区域**（容器的内腔），不是此刻的液体。不能有 `repeat`、`extra`、`each`；可以被姿态移动（杯子压下去时杯里的水跟着走）。
- **值**：数输出或步进控件，× `per` = 立方场景单位（ml → m³ 写 `1e-6`）。`below`（同单位）：液体从"装了 `below` 那么多"的高度往上画（沙上的水从 100 ml 处起）。
- **几何**（`lib/fill.ts`，纯函数、有单测）：`volumeBelow(profile, y)` = 把轮廓多边形在 y 处水平剪开（半平面剪裁），对剪下的部分用帕普斯定理（旋转体体积 = 2π × 面积 × 形心到轴的距离）精确求体积；`levelForVolume(profile, v)` = 在 [y_min, y_max] 上二分（40 次，误差 < 1e-9 m）；`capacity(profile)`。`box`：h = v ÷ (w × d)。画法：剪裁后的轮廓 + 一个平的顶面（剪裁线本身就是顶面的半径，旋转后是一个圆盘；挖空腔的轮廓自然成环），重建 `LatheGeometry`（≤ 48 段 × 轮廓点，约 1–2 k 顶点）；`meniscus`（m）= 顶面外缘向上翘的一圈细边（高 = `meniscus`，宽 = 2 × `meniscus`，同材质），量筒读数的"凹面"。值 ≤ 0 或 < 0.1 % 容积 → 零件不画（不出现一张贴底的薄片）。超过容积 → 夹到满，`pnpm validate` 对数据给出的最大值报 error。
- **缓动**：按**体积**缓动（不是按高度），`ease` 秒（默认 0.6；倒水的四个液体写 1.2），三次缓入缓出；几条 `fill` 同一帧开始缓动时同步（量筒 A 的水降、杯里的水升，看起来像倒过去）。缓动中每帧重建几何（只重建在动的那几件；单测：100 帧缓动的重建总耗时 < 5 ms，headless 记录）。深链接、截图、拍的瞬切、`prefers-reduced-motion`、REFERENCE = 直接终值。
- **剖切与 X-RAY**：液体零件照常被剖切面切（剖面填色同材质），X-RAY 下不变透明（不是 `shell`）。
- **流的按路径显隐**（E-MA2 的小扩展）：流的 `visible` 绑定可写 `"paths": ["cup-hole"]`：只控制这几条路径（每条路径一个透明度，`flowMaterial.ts` 已有每路径透明度），其余路径不受这条绑定影响；`escaping-air` 的两条路径由 `cup-bubbles`、`sand-bubbles` 各管各的。没有这条扩展的退路：拆成两条流（+1 次绘制）。
- **测试 API**：`__atlas.engine.fill(partId)` → `{ volume, level, shown }`（此刻舞台上的体积 m³、液面 y、是否画着；`pnpm shoot --beats` 每拍核对：有 `fill` 的零件的 `level` = 模型 `level` 输出换算的高度 ± 0.5 mm）。
- **validate**：零件存在、primitive 是 `lathe` / `box`、轮廓封闭且不自交、没有 `repeat` / `extra`；输出是数（或步进控件）；`below` < 容积；`per` > 0；同一零件只有一条 `fill`。
- **一处要留意的时序**：杯子压下去用的是姿态（约 0.8 s 移动），盆里两件水的切换用 `visible`（瞬时）——空腔会比杯子先到。做法：`cup-pushed` 的 `duration` 设 0.4 s，并让 `basin-water-cup` 的 `fill` 缓动 1.0 s 盖住切换；R4 截图看不出跳变就不改引擎，看得出再给 `visible` 绑定加一个可选的 `delay`（应该级，不阻塞）。
- **复用**：docs/17 的 `volume`（P5 数学，"水箱灌水的高度"）与 `water` 若要画水箱 / 量杯，都用它。

### 4.4 其余全部复用（已查 docs/06，未改代码）

试一试卡片（改变 / 不变 / 观察、`[ ]`、`T`、记一行、`record.chart` 条形图与折线图、先猜后看——包括状态输出的 `means: <状态 id>`、URL `sim=`）；`pose`（按选择的值取姿态）、`visible`、`offset` + `settle`（柱塞回弹）、`count`（`per: 1`）、`tint`（纸巾、湿沙）绑定；流的 `visible`；拍的 `sim.set`、`layers`、`pose`、`hide`、`run`；背景章与 `note`；组级比例尺（`groups[].scale`）；`glass` / `membrane` / `abrasive` / `fabric` / `rubber` 材质族与 `tint`；零件链路卡。**不需要新 token**（`cold` 空气、`signal` 当前、`ink-2` / `ink-3` 湿的颜色、组色用现有的）。不需要时间线（`timeline` / `play`）、不需要新右上卡。

### 4.5 引擎件清单与文件归属（一个 Opus 引擎代理，约 2.5 天；不改 `package.json`、不加依赖；在工作分支提交，push 等 Gavin）

| 件 | 优先级 | 文件 | 要点 |
|---|---|---|---|
| E-MA1 模型 | 必须 | `src/engines/space-scene/lib/sim/matter.ts`（新）、`sim-schema.ts`（`matterSchema`、`matterIssues`、`SIM_KINDS` 加 `matter`、`quantityKind` 一支）、`lib/sim/index.ts`（注册、`SEPARATE_EXPERIMENTS['matter'] = true`） | §4.2；`pour.level` 调 `lib/fill.ts` |
| E-MA2 `fill` 绑定 | 必须 | `src/engines/space-scene/lib/fill.ts`（新，剪裁、帕普斯体积、反解、容积）、`lib/sim/bind.ts`（`fill` 效果）、`sim-schema.ts`（绑定的 schema 与校验）、`stages/model3d/PartNode.tsx`（重建几何、缓动、`meniscus`）、`stages/model3d/shaped.ts`（复用 `lathe` 构建）、`stages/model3d/Flows.tsx` + `flowMaterial.ts`（流 `visible` 的 `paths`）、`core/test-api.ts`（`fill`）、`scripts/shoot.ts`（每拍核对液面） | §4.3；退路：每只容器一件静态液体零件 + `visible`（失去倒水的缓动，液面仍对） |
| 夹具主题 | 必须 | `src/content/topics/sample-matter/`（新，`status: draft`，占位文字，只用程序化积木：一只量筒、一只锥形瓶、一只碗、一块"石头"、一支针筒与柱塞、一只倒扣的杯子与水盆、一只球、一只装沙的量筒；六章各用一个子模型 + 背景章） | 不碰 `states-of-matter/` 目录 |
| 测试 | 必须 | `tests/space-scene/matter.test.ts`、`fill.test.ts`、样板 `tests/space-scene/fixtures/matter-bench.ts`（§4.2 的完整 `matter` 数据 = 本主题的作者模板）、`tests-e2e/sample-matter.spec.ts` | 见 §4.6 |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 物质（matter）」「SpaceScene · 液面（`fill`）」，改「试一试（sim）」的模型种类一行与绑定一行 | |

主会话不预装依赖（本主题不需要新依赖）。内容代理（D1）与引擎代理并行：内容代理写 `parts.json` 时液体零件先只写 `lathe` 轮廓、不写 `fill`，E 合并后再加 `sim` 段。

### 4.6 引擎验收

- [x] 单测 `matter.test.ts`：§2.4 全表（T1 五个质量、T2 五个读数、T3 四个液面与体积、T4 五档质量 / 空气 / 软硬、杯子三种状态的 H / x / 纸巾 / 气泡、T5 五档 × 三种、T6 六档的读数 / 空气 / `vs-sum` / 气泡）；不变量：`pour` 四种容器的体积相同、液面严格不同；`squeeze` 的空气单调减、水与沙恒定；`pump` 每下增量相同；`pores` 拐点在孔隙处；确定性；URL `sim=container.flask~load.2` 往返。
- [x] 单测 `fill.test.ts`：圆柱、截头圆锥、球冠、带空腔的轮廓、`box` 的体积与解析式相符（相对误差 < 1e-6）；`levelForVolume(volumeBelow(y)) = y`；`below` 的偏移；`capacity`；剪裁后的轮廓封闭；`meniscus` 不改变体积的读法（只是装饰，单测写明）；100 帧缓动的重建耗时。
- [x] validate 报错用例：控件不存在 / 种类不对、选项不在 `objects`、`floats` 的物体放进 `displace`、`pour.liquids` 缺选项、液体零件不是 `lathe` / `box` 或有 `extra`、`pour.volume` 超容积、杯子没入不完全、孔隙越界、输出的 `from` 不是本模型的量、`fill` 的输出是状态、同一零件两条 `fill`。
- [x] e2e（`sample-matter`）：深链接 `?ch=…&sim=container.bowl` 碗里有水、量筒是空的、`__atlas.engine.fill` 的液面 = `level` 读数；`]` 换容器时两个液面同时缓动；`load.4` 柱塞下移、`load.0` 回弹停在 20 ml；杯子 `pushed` + 开孔：纸巾变色、气泡路径出现、盆里水面回落；T6 第 2 档气泡出现、第 3 档消失；中文页；手机 390 × 844 卡片可用。
- [x] `sample-space`、`sample-forces`、`sample-energy`、`sample-life-cycle`、`forces`、`mosquito`、`water` 截图与 `--beats` 不回归（`fill` 与流按路径显隐不影响旧数据）。
- [x] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.7 不做（v2）

**粒子"凑近看"模式**（一个 X-RAY 式视图：容器里画微粒——固体格子振动、液体挨着滑动、气体疏而乱跑，随 `squeeze` 的体积变密；约 1.5 天：实例化小球 + 每种状态一个确定性的运动函数 + 一个视图开关；课纲之外，D12）；读者拖动物体放进量筒、自己倒水（拖动倾斜容器，液面保持水平：要在旋转的容器里解液面，约 2 天）；连续的砝码滑块；温度对气体体积的影响（P4 Heat 的热胀冷缩，另一个主题）。

---

## 5. 章节

### 5.0 总表

`layers` 写"台" = `weighing, measuring, air-bench, syringes, grains, air-flow`；`run` 指本章默认；镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | view | run | layers | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | assembled | false | 台 | 默认 | — | hero |
| 01 | `mass-and-space` | Mass and space / 质量与空间 | assembled | false | weighing, measuring | weigh-object stone | balance-a, stone, sponge | scales-view |
| 02 | `solids` | Solids / 固体 | assembled | false | measuring, weighing, grains | drop-object nothing | cylinder-b, drop-stone | cylinders-view |
| 03 | `liquids` | Liquids / 液体 | assembled | false | measuring | container cylinder | cylinder-a, cyl-a-water | cylinders-view |
| 04 | `air-is-matter` | Air is matter / 空气也是物质 | assembled | true | air-bench, air-flow | cup-place above, cup-hole false, pumps 0 | cup, basin, basketball | basin-view |
| 05 | `gases` | Gases spread and squash / 气体会散开，也能被压缩 | assembled | true | syringes, air-bench, air-flow | load 0 | syringe-air, syringe-water, syringe-sand | syringe-view |
| 06 | `sorting-matter` | Solid, liquid or gas / 固体、液体还是气体 | assembled | false | grains, around-you, air-flow | water-added 0 | sand-in-cylinder, drink-can, ice-cube | grains-view |

- 每章 `state.hide: [torch-beam]`；拍里写 `hide` 时同样要带上它（拍的 `hide` 不累积），只有 01 第 5 拍不带。
- 第 02 章第 6 拍开 `closer`（放大的颗粒），那一拍的 `layers` **只有** `closer`（不和实验台同框）。
- 第 06 章第 4–5 拍 `layers: [around-you]`、`camera: table-view`。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "This is a model of a school science bench, drawn life size. The readings on the balances, cylinders and syringes are worked out by the model from measured values for air and water and from the sizes of the apparatus (marked SIM); a real experiment gives slightly different readings each time. The sand and sugar grains in chapter 2 are drawn 40 times life size, separately from the bench." / ZH "这是一张按实物大小画的学校科学实验台。秤、量筒、针筒上的读数，是模型根据空气和水的实测数值、器材的尺寸算出来的（标 SIM）；真实的实验每次读数会有一点不同。第 2 章的沙粒、糖粒放大了 40 倍，和实验台分开画。"
- **summary**：Everything on this bench is matter: the stone, the water and even the air. This topic measures how much space things take up and how much mass they have, and sorts them into solids, liquids and gases. / 这张实验台上的东西都是物质：石头、水，连空气也是。本主题量一量东西占据多少空间、有多少质量，再把它们分成固体、液体和气体。
- **正文提纲**：① 课纲的两句话：物质是有质量、占据空间的任何东西；从形状和体积区分三态（S2 第 48 页）。② "matter / 物质"在科学里的意思和日常说法不同（"物质生活"的"物质"不是这个意思，中文一句）。③ 实验台五个工位与小桌各做什么（一句一个）。④ 试一试卡片：改变 / 不变 / 观察、记一行、看小图、先猜后看；数字是模型算的（SIM）。⑤ 读刻度、ml 与 g 的单位在 `measuring` 学过（`<TopicLink slug="measuring" ch="millilitres">`）；水怎样从冰变成水、再变成水蒸气在 `water` 讲（`<TopicLink slug="water" ch="the-water-cycle">`），这里不讲。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero）；labels balance-a, cylinder-a, basin, syringe-rack, sand-heap | This bench has five stations: weighing, measuring volume, air, squeezing and sand. Each one tests a different idea about matter. / 这张实验台有五个工位：称质量、量体积、空气、压缩，还有沙和糖。每个工位检验一个关于物质的想法。 |
| 2 | camera scales-view；labels stone, balance-a | Matter is anything that has mass and takes up space. A balance measures mass, in grams. / 物质是任何有质量、占据空间的东西。秤量的是质量，单位是克。 |
| 3 | camera cylinders-view；labels cylinder-a, cyl-a-water | A measuring cylinder measures the volume of a liquid, in millilitres. Volume is how much space something takes up. / 量筒量的是液体的体积，单位是毫升。体积就是东西占据的空间有多大。 |
| 4 | camera table-view；layers around-you；labels drink-can, ice-cube, bicycle-wheel | Solids, liquids and gases are all around us, even in a can of drink. The last chapter sorts some of them. / 固体、液体、气体就在我们身边，连一罐汽水里都有。最后一章把它们分一分。 |

- **试一试**：无。
- **细看**：`How this model works`（读数怎么来的、SIM、真实实验的误差）；`Matter in everyday words`（"物质"日常用法 vs 科学用法）；`What you need from measuring`（链 `measuring`）。
- **本章索引**：balance-a, cylinder-a, basin, syringe-air, sand-heap, drink-can
- **名词首现**：matter、mass、volume。

### 5.2 第 01 章 `mass-and-space`

- **summary**：Everything that is matter has mass and takes up space. A big thing is not always heavier than a small one: a large sponge has less mass than a small stone. / 凡是物质都有质量，都占据空间。大的东西不一定比小的重：一大块海绵的质量比一小块石头还小。
- **正文提纲**：① 质量：东西里"物质有多少"，用秤量，g 和 kg（F-16；链 `measuring` `mass-and-balances`）；先归零再称。② 占据空间：两样东西不能同时在同一个地方（量筒里的石头把水推上去，伏笔 02）。③ 大 ≠ 重：海绵 384 cm³、11.5 g，石头 25 cm³、66.3 g（SIM，M-5）；天平往石头一侧沉。④ 液体也有质量：200 ml 水约 199 g（SIM）。⑤ 光、声、热不是物质：没有质量、不占据空间；热是一种能量（S2 第 76 页，M-10；链 `energy-conversion`）。⑥ 试一试：称五样东西。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（scales-view，石头在秤上）；labels balance-a, stone | Everything on this tray is matter. Each thing has mass, and the electronic balance measures it in grams. In this model the stone reads sixty-six point three grams. / 托盘上的每样东西都是物质，都有质量，电子秤以克为单位量出来。在这个模型里，石头的读数是 66.3 克。 |
| 2 | sim weigh-object sponge；labels sponge, balance-a | The sponge is about fifteen times bigger than the stone, but it reads only eleven point five grams. / 海绵差不多有石头的十五倍大，读数却只有 11.5 克。 |
| 3 | pose beam-tilt；sim weigh-object water（让石头离开电子秤：T1 的姿态绑定压在章 / 拍姿态之上，选着石头时石头会留在电子秤上）；labels beam-balance, sponge, stone | On a beam balance, the side with the stone goes down. A bigger thing is not always heavier. / 放在天平上，石头那一边沉了下去。大的东西不一定更重。 |
| 4 | sim weigh-object water；labels water-beaker, balance-a | Liquids have mass too. With the empty beaker set to zero first, two hundred millilitres of water reads about one hundred and ninety-nine grams. / 液体也有质量。先放空烧杯归零，200 毫升的水大约读 199 克。 |
| 5 | hide []（拍的 `hide` 代替章的，本拍显示光束）；layers around-you；camera table-view；labels torch, torch-beam | The light from a torch is not matter. It has no mass and takes up no space. Light and heat are forms of energy. / 手电筒发出的光不是物质，它没有质量，也不占据空间。光和热是能量的形式。 |

- **试一试 T1**：`vary: weigh-object`，`keep: [{ en: "Same balance, set to zero first", zh: "同一台电子秤，先归零" }]`，`observe: [mass]`，`record: { chart: true }`（条形图，五样东西）；`predict`：prompt "The sponge is much bigger than the stone. Swap the sponge for the stone: will the reading go up, go down or stay the same?" / "海绵比石头大得多。把秤上的海绵换成石头，读数会变大、变小，还是不变？"，`start: { weigh-object: sponge }`，`change: { weigh-object: stone }`，`observe: mass`，options 变大 `more` / 变小 `less` / 不变 `same`。
- **细看**：`Mass and weight`（F-0b：质量是"有多少物质"，重量是重力拉它的力；P4 说质量，"重量"是 P6 的另一个量（S2 第 64 页，R: C13），链 `<TopicLink slug="forces" ch="gravity-and-weight">`）；`Set it to zero`（归零 / tare：称液体先放空容器，R: Q07）；`Big but light`（M-5；"密度"一词在中学会学）；`Real stones differ`（模型里的质量是这块模型石头、这块模型海绵的值；你称的会是另一个数，R: F17）；`Not matter`（M-10：光、声、热、影子）。
- **本章索引**：balance-a, beam-balance, stone, sponge, marble, clay-ball, water-beaker, torch
- **名词首现**：balance、tare（并入 balance 的定义，不单列）。

### 5.3 第 02 章 `solids`

- **summary**：A solid has a definite shape and a fixed volume. Its volume can be measured by how much it makes the water in a measuring cylinder rise. Sand pours, but each grain is a solid. / 固体有固定的形状和固定的体积。把它放进量筒的水里，看水面升高多少，就能量出它的体积。沙会倒，但每一粒都是固体。
- **正文提纲**：① 固体的形状和体积固定：石头放在哪里都是这个样子、这么大。② 量不规则固体的体积：量筒先装 100 ml 水，放进石头读 125 ml，石头 25 cm³（SIM；1 ml = 1 cm³，F-1）；石头占据了空间，把水推了上去（S2 "occupies space"）。③ 用力能改变某些固体的形状（黏土），体积不变：黏土球和搓成的长条都读 120 ml（M-8）。④ 海绵被捏小，是孔里的空气被挤出去（M-7；配图 `states-of-matter-sponge`）；海绵浮在水上、会吸水，不能这样量。⑤ 沙和糖会倒，但是一粒粒的固体（M-3）：放大看每一粒有自己的形状；倒出来堆成有坡的小山，水却摊平；配图 `states-of-matter-sand-grains`。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（cylinders-view，量筒 B 100 ml）；labels cylinder-b, cyl-b-water, drop-stone | A solid keeps its shape and its volume. This measuring cylinder holds one hundred millilitres of water, ready for the stone. / 固体的形状和体积都是固定的。这只量筒装了 100 毫升水，等着放进石头。 |
| 2 | sim drop-object stone；labels drop-stone, cyl-b-water | The stone takes up space, so the water rises to one hundred and twenty-five millilitres. The stone's volume is twenty-five cubic centimetres. / 石头占据了空间，水面就升到 125 毫升。石头的体积是 25 立方厘米。 |
| 3 | sim drop-object clay-roll；labels drop-clay-roll, cyl-b-water | A ball of clay raises the water to one hundred and twenty millilitres. The same clay rolled into a long shape raises it to one hundred and twenty too. Its shape changed; its volume did not. / 一团黏土球让水面升到 120 毫升；同一团黏土搓成长条，水面也升到 120 毫升。它的形状变了，体积没变。 |
| 4 | layers weighing；camera scales-view 近；pose sponge-squeezed；labels sponge | Squeeze a sponge and it gets smaller, but only because air is pushed out of its holes. The sponge material itself keeps its volume. / 捏海绵，它变小了，那只是因为孔里的空气被挤了出去。海绵本身的材料，体积没有变。 |
| 5 | camera grains-view；labels sand-heap, sugar-heap, water-dish | Sand and sugar pour, but they are not liquids. Poured out, they pile up in a heap with sloping sides. Water spreads out flat. / 沙和糖会倒，但它们不是液体。倒出来，它们堆成有斜坡的小山；水却会摊平。 |
| 6 | layers closer；camera 拍内（放大台座）；labels sand-grains, sugar-crystals | Magnified forty times, each grain of sand and each crystal of sugar has its own shape and volume. Each grain is a solid. / 放大 40 倍，每一粒沙、每一粒糖都有自己的形状和体积。每一粒都是固体。 |

- **试一试 T2**：`vary: drop-object`，`keep: [{ en: "Same cylinder, 100 ml of water to start", zh: "同一只量筒，开始时都装 100 毫升水" }]`，`observe: [reading, object-volume]`，`record: { chart: { y: object-volume } }`（条形图）；`predict`：prompt "Roll the clay ball into a long shape and put it in. Will the water rise more, less or the same?" / "把黏土球搓成长条再放进去，水面会升得更高、更低，还是一样？"，`start: { drop-object: clay-ball }`，`change: { drop-object: clay-roll }`，`observe: reading`，options 更高 `more` / 更低 `less` / 一样 `same`。
- **细看**：`Measuring by displacement`（排水法 / displacement 这个词；读两次相减；要整个没入水中、不能吸水、不能浮——海绵为什么不行）；`Reading a cylinder`（视线与液面平、读凹面最低处；弯月面 meniscus；docs/32 D10：数学课把液面画平）；`Squeezing a sponge`（M-7，配图）；`Grains`（沙粒 0.0625–2 mm，F-21；坡度约 33°，F-22；配图）。
- **本章索引**：cylinder-b, cyl-b-water, drop-stone, drop-marble, drop-clay-ball, drop-clay-roll, sponge, sand-heap, sugar-heap, sand-grains
- **名词首现**：solid、displacement（标"扩展"）、grain（可并入 solid 的定义）。

### 5.4 第 03 章 `liquids`

- **summary**：A liquid has no definite shape: it takes the shape of its container. But it keeps its volume. The same 200 ml of water stands tall in a narrow cylinder and low in a wide bowl, and still measures 200 ml when poured back. / 液体没有固定的形状，它的形状随容器变；但它的体积不变。同样 200 毫升的水，在细长的量筒里高、在宽碗里矮，倒回量筒还是 200 毫升。
- **正文提纲**：① 量筒里的 200 ml 水（F-8）。② 倒进高杯、锥形瓶、宽碗：形状变成容器的形状，液面高度不同（SIM，§2.4）。③ 体积不变：倒回量筒还是 200 ml（M-4）；液面高是因为容器窄，不是因为水多了。④ 液面总是平的；靠壁处弯起一点（细看）。⑤ 果汁、油、汽水都是液体，都这样（06 再看）。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（cylinders-view）；labels cylinder-a, cyl-a-water | Two hundred millilitres of water fills this measuring cylinder to a height of about eighteen and a half centimetres. / 200 毫升水把这只量筒装到大约 18.5 厘米高。 |
| 2 | sim container glass；labels tall-glass, glass-water | Poured into a tall glass, the same water takes the shape of the glass. In this model it stands about seven centimetres high. / 倒进高玻璃杯，同样的水变成了杯子的形状。在这个模型里，水高约 7 厘米。 |
| 3 | sim container flask；labels flask, flask-water | In a conical flask it spreads over the wide bottom and stands about five centimetres high. / 倒进锥形瓶，水铺满宽宽的瓶底，高约 5 厘米。 |
| 4 | sim container bowl；labels bowl, bowl-water | In a wide bowl it is only about three centimetres deep. The water looks like less, but it is the same water. / 倒进宽碗，水只有大约 3 厘米深。看起来少了，其实还是那些水。 |
| 5 | sim container cylinder；labels cylinder-a, cyl-a-water | Poured back into the cylinder, it measures two hundred millilitres again. A liquid changes its shape, but not its volume. / 倒回量筒，又是 200 毫升。液体会改变形状，但不会改变体积。 |

- **试一试 T3**：`vary: container`，`keep: [{ en: "The same 200 ml of water", zh: "同样的 200 毫升水" }]`，`observe: [level, poured]`，`record: { chart: { y: level } }`（条形图：液面高度；体积一列在表里四行都是 200）；`predict`：prompt "Pour the water from the tall glass into the wide bowl, then back into the cylinder. Will it measure more than, less than, or the same as 200 ml?" / "把水从高玻璃杯倒进宽碗，再倒回量筒，读数会比 200 毫升多、少，还是一样？"，`start: { container: glass }`，`change: { container: bowl }`，`observe: poured`，options 多 `more` / 少 `less` / 一样 `same`。
- **细看**：`Why the level changes`（底面越宽，同样的体积铺得越薄；中学会学截面积，不写式子）；`A level surface`（液面总是平的；靠壁处的弯月面；读凹面最低处）；`Every last drop`（真实倒水会有几滴挂在壁上，所以真实读数可能差 1–2 ml；模型不算，S1 写明）；`Juice, oil and syrup`（都是液体；稠的流得慢，仍随容器变形；咖椰见 06）；`"Fixed" means moved, not heated`（固定的体积说的是同一份液体换容器；加热会让东西胀大一点，那是 P4 Heat 的内容，R: C10）。
- **本章索引**：cylinder-a, cyl-a-water, tall-glass, glass-water, flask, flask-water, bowl, bowl-water
- **名词首现**：liquid、container、measuring-cylinder、meniscus（标"扩展"）。

### 5.5 第 04 章 `air-is-matter`

- **summary**：Air is matter. It takes up space: air trapped in an upside-down cup stops the water from filling it. And it has mass: pump air into a ball and the balance reads more. / 空气是物质。它占据空间：倒扣的杯子里关着空气，水就灌不满杯子。它也有质量：给球打气，秤的读数就变大。
- **正文提纲**：① "空"杯子里有空气（M-6）。② 倒扣压进水里：纸巾不湿、杯里水面只到杯口、盆里水面升高约 9 mm（SIM，D10）——空气占据了空间。③ 杯底开孔：气泡冒出、水涌进、纸巾湿，盆里水面落回（SIM）。④ 打气：篮球瘪时 600.0 g，打 20 下 604.7 g（SIM，F-15），多出来的约 4.7 g 就是打进去的空气（M-1、D9）。⑤ 空气每升约 1.2 g（F-3）；一间 9 × 7 × 3 m 的教室里，空气约 220 kg（细看，写明是按这个尺寸和 25 °C 的估算：189 m³ × 1.18 kg/m³，SIM）。配图 `states-of-matter-air-takes-space`（② 段后）。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（basin-view，杯子在水面上方）；labels cup, tissue, basin | This cup looks empty, but it is full of air. A dry tissue is pushed into its bottom, and the cup is turned upside down over a basin of water. / 这只杯子看起来是空的，其实装满了空气。杯底塞了一团干纸巾，杯子倒扣在一盆水上方。 |
| 2 | sim cup-place pushed；labels cup, cup-water, basin-water-cup, tissue | Pushed straight down, the cup keeps its air. The water outside rises, by about nine millimetres in this model, but water barely enters the cup, and the tissue stays dry. / 把杯子竖直压下去，杯里的空气还在。外面的水面升高了，在这个模型里约 9 毫米；水几乎进不了杯子，纸巾还是干的。 |
| 3 | sim cup-place pushed, cup-hole true（拍的 `sim.set` 叠在本章上，不叠在上一拍上，所以两项都写）；run（气泡）；labels cup-hole-mark, tissue, basin-water-cup | With a hole in the bottom of the cup, the air bubbles out and water rushes in. The tissue gets wet, and the water outside drops back down. Tilting the cup lets the air out in the same way. / 杯底开一个孔，空气冒着泡出去，水涌了进来。纸巾湿了，外面的水面又落了下来。把杯子倾斜，空气也会这样跑出去。 |
| 4 | sim cup-place above, cup-hole false, pumps 0；camera 拍内（电子秤 B 3/4）；labels basketball, balance-b, ball-pump | Air also has mass. This flat basketball reads six hundred grams. / 空气也有质量。这只瘪的篮球读 600 克。 |
| 5 | sim pumps 20；run（打进球的空气）；labels basketball, balance-b | After twenty pumps of air, the ball is firm, and in this model it reads about six hundred and four point seven grams. The extra mass is the air pumped in. / 打了 20 下气，球鼓起来了，在这个模型里读数约 604.7 克。多出来的质量，就是打进去的空气。 |

- 第 1–3 拍 `camera: basin-view`；第 4–5 拍写电子秤 B 的拍内镜头。拍的 `sim.set` 不累积：第 4 拍写全（`cup-place above`、`cup-hole false`、`pumps 0`）。
- **试一试 T4**：`vary: pumps`，`keep: [{ en: "Same ball, same balance", zh: "同一只球，同一台秤" }]`，`observe: [ball-mass, air-added, firmness]`，`record: { chart: { y: air-added } }`（折线图：0–20 下，一条直线；`ball-mass` 在表里）；`predict`：prompt "Pump twenty times. Will the balance read more, less or the same?" / "打 20 下气，秤的读数会变大、变小，还是不变？"，`start: { pumps: 0 }`，`change: { pumps: 20 }`，`observe: ball-mass`，options 变大 `more` / 变小 `less` / 不变 `same`。
- **细看**：`The water outside rose`（D10 的数，"在这个模型里"；杯里的水为什么升了 1 mm：水把空气压紧了一点点，05 再讲）；`Balloons on a balance`（F-7c、M-11：TERC 的双层气球演示——打了气的那一边下沉，用打气筒不用嘴吹；为什么模型用篮球给数字：吹大的气球被周围空气托起的也变多，篮球的大小几乎不变，多出来的读数就是打进去的空气，D9）；`How heavy is air`（约 1.2 g / ℓ，F-3；温度越高越轻一点）；`Do not over-pump`（球、轮胎打得过满会坏；NBA 规则的气压范围，F-15）。
- **本章索引**：cup, tissue, basin, basin-water-cup, cup-water, basketball, balance-b, ball-pump
- **名词首现**：air、gas（"空气是几种气体混在一起"一句，细看）。

### 5.6 第 05 章 `gases`

- **summary**：A gas has no definite shape and no fixed volume: it spreads out to fill whatever holds it. That is why air can be squashed into a smaller space, while water and sand hardly squash at all. / 气体没有固定的形状，也没有固定的体积：它会散开，充满装它的东西。所以空气能被压进更小的空间，水和沙却几乎压不小。
- **正文提纲**：① 气体充满整个容器：气球打进空气，圆气球鼓成圆的，长气球鼓成长的（形状随容器）；一点点空气也充满整只瓶（M-12）。② 三支针筒：都装到 20 ml、针口封住，柱塞上加同样的砝码（公平测试：只改装的东西）。③ 空气：加 4 kg 压到约 9 ml（SIM），拿走砝码弹回 20 ml。④ 水：几乎压不小（M-9，F-6）；沙：沙粒互相顶住（沙里也有空气，但颗粒先顶住了——S1 的简化）。⑤ 打气：同一条轮胎里能压进越来越多的空气，所以轮胎变硬（F-25）。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（syringe-view，load 0）；labels syringe-air, syringe-water, syringe-sand | Three syringes are each filled to twenty millilitres, one with air, one with water and one with sand. Their tips are sealed, so nothing can get out. / 三支针筒都装到 20 毫升：一支是空气，一支是水，一支是沙。针口都封住了，里面的东西出不去。 |
| 2 | camera 拍内（气球）；pose balloons-full；run（打进气球的空气）；labels balloon-round, balloon-long | A gas spreads out to fill its container. Pumped into a round balloon, air takes a round shape; in a long balloon, a long shape. / 气体会散开，充满装它的容器。打进圆气球，空气就是圆的；打进长气球，就是长的。 |
| 3 | sim load 2；labels plunger-air, masses-air, syringe-water | With two kilograms on each plunger, the air is squashed to about twelve point four millilitres in this model. The water and the sand stay at twenty. / 每支柱塞上放 2 千克，在这个模型里空气被压到约 12.4 毫升，水和沙还是 20 毫升。 |
| 4 | sim load 4；labels syringe-air, plunger-air | With four kilograms, the air is squashed to about nine millilitres. Each extra kilogram squashes it a little less than the one before. / 放到 4 千克，空气被压到约 9 毫升。每多加 1 千克，压下去的比上一次少一点。 |
| 5 | sim load 0；camera table-view；layers around-you, air-flow；run（打进轮胎的空气）；labels bicycle-wheel, floor-pump | Take the masses off and the air springs back to twenty millilitres. Pumping a bicycle tyre squeezes more and more air into the same tyre, so it gets harder. / 拿走砝码，空气又弹回 20 毫升。给脚车轮胎打气，就是把越来越多的空气压进同一条轮胎，所以轮胎越来越硬。 |

- **试一试 T5**（本主题的招牌公平测试）：`vary: load`，`keep: [{ en: "Same syringes, each filled to 20 ml", zh: "同样的针筒，每支都装到 20 毫升" }, { en: "Tips sealed", zh: "针口封住" }, { en: "The same mass on each plunger", zh: "每支柱塞上放同样的砝码" }]`，`observe: [v-air, v-water, v-sand]`，`record: { chart: { y: [v-air, v-water, v-sand] } }`（折线图，三条线，0–4 kg）；`predict`：prompt "Put 2 kg on each plunger. What happens to the water's volume?" / "每支柱塞上放 2 千克，水的体积会怎样？"，`start: { load: 0 }`，`change: { load: 2 }`，`observe: v-water`，options 变小 `less` / 不变 `same` / 变大 `more`。
- **细看**：`A fair test`（只改"装的是什么"；为什么三支要一样大、装一样多、加一样重；水先排掉气泡，F-4c）；`Real readings`（F-4b：一组学生实测的氮气从 60 ml 压到 30 ml，量出来的；模型的数是算出来的；课堂上用手轻轻压，F-4c）；`Air in the gaps`（沙粒之间也有空气，但沙粒互相顶住；松散的沙先压实一点点——待核，核不到只说"模型里不动"）；`Squashed air pushes back`（柱塞弹回；杯里的水为什么升了 1 mm，回链 04）；`Careful with masses`（砝码放稳、大人在场；不要把气球、轮胎打得过满）。
- **本章索引**：syringe-air, syringe-water, syringe-sand, plunger-air, masses-air, water-column, sand-column, balloon-round, balloon-long, bicycle-wheel
- **名词首现**：gas、compress（"压缩 / squash"并列）、syringe。

### 5.7 第 06 章 `sorting-matter`

- **summary**：Solids keep their shape and volume; liquids keep their volume but not their shape; gases keep neither. Use these two questions to sort the matter around you, from sand to a can of drink. / 固体的形状和体积都固定；液体的体积固定、形状不固定；气体两样都不固定。用这两个问题，给身边的物质分分类，从一把沙到一罐汽水。
- **正文提纲**：① 两个问题、三种答案：一张三态表（正文里的表格，不是图）。② 沙是固体的又一个证据：往 100 ml 干沙里倒 100 ml 水，读数只有 165 ml（SIM，F-20）——少掉的 35 ml 是沙粒之间的空气，冒着泡跑了出去（M-3）。③ 一罐汽水：罐是固体、汽水是液体、气泡是气体（F-24）；X-RAY 看罐里。④ 冰块、一杯果汁、空气里看不见的水蒸气：同一种物质也可以是三态（F-26，链 `water`）。⑤ 脚车轮胎里的空气、篮球里的空气（回链 04、05）。⑥ 不好分类的东西：咖椰、牙膏、果冻（D13，细看）。⑦ 凑近看：课纲之外的粒子图（D12，细看 + 配图 `states-of-matter-look-closer`）。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（grains-view，water-added 0）；labels sand-in-cylinder, jug-water | This cylinder holds one hundred millilitres of dry sand. Next to it is one hundred millilitres of water. / 这只量筒装着 100 毫升干沙，旁边是 100 毫升水。 |
| 2 | sim water-added 20；run（沙里冒出的气泡）；labels sand-in-cylinder | As water soaks into the sand, bubbles of air come up from between the grains, and the reading stays at one hundred. / 水渗进沙里，沙粒之间冒出一个个气泡，读数却还是 100。 |
| 3 | sim water-added 100；labels sand-in-cylinder, water-over-sand | With all the water in, the cylinder reads about one hundred and sixty-five millilitres, not two hundred. About thirty-five millilitres of this sand was air. / 水全倒进去以后，量筒读数约 165 毫升，不是 200。这些沙里约有 35 毫升是空气。 |
| 4 | layers around-you；camera table-view；view xray；labels drink-can, can-drink | In a can of drink, the can is a solid, the drink is a liquid, and the bubbles are a gas. / 一罐汽水里，罐是固体，汽水是液体，气泡是气体。 |
| 5 | layers around-you；camera table-view；labels ice-cube, juice-glass | Water can be all three: ice is a solid, water is a liquid, and water vapour, an invisible gas, is in the air around us. / 水三种都可以是：冰是固体，水是液体，水蒸气是一种看不见的气体，就在我们周围的空气里。 |

- **试一试 T6**：`vary: water-added`，`keep: [{ en: "The same 100 ml of dry sand", zh: "同样的 100 毫升干沙" }]`，`observe: [sand-reading, air-gaps]`，`record: { chart: { y: sand-reading } }`（折线图：先平后升，在 35 ml 处拐弯）；`predict`：prompt "Pour all 100 ml of water onto 100 ml of dry sand. Will the cylinder read 200 ml, less, or more?" / "把 100 毫升水全倒进 100 毫升干沙里，量筒会读 200 毫升、少一些，还是多一些？"，`start: { water-added: 0 }`，`change: { water-added: 100 }`，`observe: vs-sum`，options 200 毫升 `equal` / 少一些 `less` / 多一些 `more`。
- **细看**：`Three states in a table`（固体 / 液体 / 气体 × 固定的形状 / 固定的体积 / 能被压缩；这张表就是 PSLE 分类题的骨架）；`Hard to sort`（D13：咖椰、牙膏、果冻；小学课纲没有讲它们怎么分）；`Water in three states`（F-26；`<TopicLink slug="water" ch="the-water-cycle">`；冒出来的"白气"是小水滴不是水蒸气，`water` 已讲，一句回链）；`Look closer (beyond the syllabus)`（D12；配图；"这是科学家用的一种模型，小学课纲没有讲，中学会学"）；`Where the sand reading comes from`（孔隙 35 %，F-20；真实的沙湿了会压实一点，读数可能再少一点，待核）。
- **本章索引**：sand-in-cylinder, water-over-sand, jug-water, sand-heap, drink-can, can-drink, ice-cube, juice-glass, kaya-jar, bicycle-wheel
- **名词首现**：state-of-matter（若 00 已首现则不算）、particle（标"课纲之外"，只在细看包 `<Term>`）。

### 5.8 拍数与配图

- 拍数：00 四、01 五、02 六、03 五、04 五、05 五、06 五 = **35 拍**。
- 配图位置：`states-of-matter-sponge` 第 02 章 ④ 段后；`states-of-matter-sand-grains` 第 02 章 ⑤ 段后；`states-of-matter-air-takes-space` 第 04 章 ② 段后；`states-of-matter-look-closer` 第 06 章细看 `Look closer` 里。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（18 个候选，目标 14–16 个，正文用不到的删）

中文：R: T01–T19（香港教育局英汉科学词汇转简体 + 剑桥英汉词典；没有找到 MOE 的 P4 英汉科学词表，R: §5）；"电子秤""柱塞""颗粒""微粒""弯月面""排水法"是编辑用词，施工时在 `glossary.json` 的 `note` 写明来历。

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `matter` | matter / 物质 | 任何有质量、占据空间的东西（S2 第 48 页） | mass, volume |
| `mass` | mass / 质量 | 东西里物质的多少；g、kg；用秤量；日常说"有多重" | balance |
| `volume` | volume / 体积 | 东西占据的空间有多大；液体 ml、固体 cm³，1 ml = 1 cm³；`measuring` 里液体叫"容量" | measuring-cylinder |
| `occupy-space` | take up space / 占据空间 | 两样东西不能同时在同一个地方 | matter |
| `state-of-matter` | state of matter / 物质的状态（三态） | 固体、液体、气体 | solid, liquid, gas |
| `solid` | solid / 固体 | 固定的形状、固定的体积 | |
| `liquid` | liquid / 液体 | 形状随容器、体积固定；液面是平的 | |
| `gas` | gas / 气体 | 没有固定的形状和体积，充满容器；能被压缩 | air |
| `air` | air / 空气 | 几种气体的混合；占据空间、有质量 | gas |
| `compress` | compress (squash) / 压缩 | 把东西压进更小的空间；气体能，液体与固体几乎不能 | gas |
| `balance` | balance / 秤（电子秤、天平） | 量质量的器材；先归零 | mass |
| `measuring-cylinder` | measuring cylinder / 量筒 | 带刻度的直筒，量液体的体积；读凹面最低处 | meniscus |
| `container` | container / 容器 | 装东西的东西 | liquid |
| `syringe` | syringe / 针筒 | 筒 + 柱塞；本主题封住针口做压缩实验 | compress |
| `displacement` | displacement / 排水法（扩展） | 把东西放进水里，看水面升高多少来量它的体积 | volume |
| `meniscus` | meniscus / 弯月面（扩展） | 量筒里液面靠壁处弯起的一圈 | measuring-cylinder |
| `grain` | grain / 颗粒 | 一粒很小的固体（沙粒、糖粒） | solid |
| `particle` | particle / 微粒（课纲之外） | 物质由极小的微粒组成；中学会学 | state-of-matter |

### 6.2 来源（施工时进 `sources.json`；访问日期一律 2026-10-20）

"R:" = Codex 研究的来源号（`matter-research.md` 的 Source register，S01–S30），那些已逐条读过、有 ≤ 25 词的原文摘录；"待核" = 起草时没有读到原文。施工时 S# 照 docs/33 的做法保留 P# 的编号（S1 = P1 …），没用上的写进 `SOURCES.md` 的空号说明。只读到摘要或第三方转录的来源在 `note` 写明（Osborne 2023 只有摘要；Stavy 1985、1991 读的是带原刊页码的第三方转录）。

| P# | 内容 | 来源 | 用于 |
|---|---|---|---|
| P1 | 本设计研究（设计尺寸、常数取值与 §2.4 全部模拟值；篮球的推理、沙柱不动的简化） | 本 spec §2 | 规格行、PLATE、卡片、字幕里的 SIM 数、细看 |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus Primary Three to Six, Standard / Foundation*（2023 Primary Three Cohort 起实施，封面 Updated Jan 2026），https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf | R: S01；起草时本人也读过（第 15–17、20、39–41、48–51、64、76–77、82 页） | §1.1、D3 |
| P3 | SEAB，*PSLE Science (Syllabus 0009)*，for examination from 2026 | R: S15（PDF 第 1–2 页，无印页码） | §1.1、§1.5 |
| P4 | NIST SP 811 附录 B：1 atm = 101 325 Pa | 待核 | F-2 |
| P5 | NASA Glenn Research Center，"Boyle's Law" | 待核 | F-4 |
| P6 | 空气密度与温度的表 | 待核（NASA 标准大气 / CRC；工程表只当典型） | F-3 |
| P7 | USGS Water Science School，"Water Density" | 待核 | F-5 |
| P8 | 水的等温压缩率 | 待核（CRC / Kell 1975） | F-6 |
| P9 | g ≈ 9.8 N/kg | `forces` 主题的同一条来源 | F-7 |
| P9a | FIBA，*Official Basketball Rules* / *Basketball Equipment*（2024）：7 号球周长与质量 | 待核 | F-15 |
| P10 | NBA，*Official Rules*，Rule 1 Section III：球的气压 7.5–8.5 psi | 待核 | F-15 |
| P11 | American Chemical Society，*Middle School Chemistry*，Ch. 3 Lesson 2 "Finding Volume: The Water Displacement Method"（排水法相减、读凹面最低处、1 mL = 1 cm³） | R: S10（印第 3–4 页） | F-1、F-1b |
| P11b | Vernier，"Inverse Variation in Pressure Data"（1 cc = 1 mL） | R: S30（印第 1 页） | F-1 |
| P12 | Freeze & Cherry，*Groundwater*（1979）表 2.4：孔隙率 | 待核（Groundwater Project 开放版） | F-20 |
| P13 | 沙的粒径 0.0625–2 mm | 待核（USGS 粒径表 / Wentworth 1922） | F-21 |
| P14 | 干沙的休止角；P14b 砂糖晶粒 | 待核 | F-22、F-23 |
| P15 | 常见岩石密度 | 待核 | F-11 |
| P16 | 钠钙玻璃密度 | 待核 | F-12 |
| P17 | 软质聚氨酯泡沫密度 | 待核（Polyurethane Foam Association） | F-14 |
| P18 | 模型黏土密度 | 待核（核不到删 T1 的黏土） | F-13 |
| P19 | ISO 4788 量筒 | 待核 | F-8 |
| P20 | ISO 1773 锥形瓶 | 待核 | F-9 |
| P21 | 20 ml 针筒内径（典型，不点名厂家） | 待核 | F-17 |
| P22 | Stavy & Stachel 1985, "Children's ideas about 'solid' and 'liquid'", *European Journal of Science Education* 7(4): 407–421, https://doi.org/10.1080/0140528850070409 | R: S12（第 419 页） | M-3 |
| P23 | Stavy 1991, "Children's Ideas About Matter", *School Science and Mathematics* 91(6): 240–244, https://doi.org/10.1111/j.1949-8594.1991.tb12090.x | R: S13（第 243 页表 2） | M-2 |
| P24 | Bošnjak Stepanović et al. 2019, "Primary School Students' Misconceptions about Physical Properties of Water", *The New Educational Review* 57: 127–138 | R: S14（第 133–134 页） | M-4 |
| P25 | NEMP Report 13: Science 1999, "Balancing Balloons"（University of Otago） | R: S11（第 50 页） | M-11 |
| P26 | Osborne 2023, "Difficult physical science concepts in middle primary", *Teaching Science* 69(2): 21–28（摘要）；Teacher magazine 对她的访谈（2023-08-28） | R: S22、S23 | M-1 |
| P27 | Pathare & Pradhan 2010, *Physics Education* 45(6): 629–634（本科生样本） | R: S28（第 631 页） | M-1 的 note |
| P28 | OpenStax, *Chemistry 2e*, §1.2 "Phases and Classification of Matter" | R: S05 | F-0a、F-0c |
| P29 | NIST Office of Weights and Measures, "SI Units — Mass"（质量与重量） | R: S06 | F-0b |
| P30 | TERC, The Inquiry Project, Grade 5, Investigation 13 "Is air matter?"、Investigation 14 "What are some properties of air?" | R: S07、S08 | F-4c、F-7c、D9 |
| P31 | Australian Academy of Science, Primary Connections, *Communicating matters*, Lesson 4 "What a gas" | R: S09 | F-7b、D10 |
| P32 | Cambridge *Primary Science 4*, Worksheet 3.3a "Squashing gases, liquids and solids"（学校网站上的节选） | R: S21（印第 83–84 页）；粒子、冷冻的部分不采用 | F-4c |
| P33 | Eix 2015, "A different way to do gas laws — Part 1"（University of Waterloo / *Chem 13 News*），图 3 | R: S29 | F-4b |
| P34 | 香港教育局，*English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S1–3)*（2017）与 *…Physics*（2020）；剑桥英汉词典（occupy、space、shape、fixed、air） | R: S16–S19、S25–S27 | §6.1 |
| P35 | 汽水里的二氧化碳 | 待核 | F-24 |
| P36 | 咖椰 | 待核（NLB Infopedia） | F-27 |
| P37 | 新加坡学校的 P4 物质单元（北岸小学科学部页面） | R: S24（只证"有这个单元"） | §1.5 |

## 7. 图像清单（石墨图版风格，给 Codex）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3。**图只当插画，不当事实依据**；主会话入库前逐张对照 §2，错的重画。共同要求：无文字、无数字、无刻度数字、无品牌、无人物、无手；水面画平（除弯月面那一张的细节外不画夸张的弯曲）；不画"白气"当作水蒸气。

### 7.1 Codex 草稿审查（`art/planned/states-of-matter/`，manifest 第 65–67 行）

| 草稿 | 看到的 | 决定 |
|---|---|---|
| `states-of-matter.png`（封面，1024²） | 一块带裂纹和气泡的长方体冰、一只装水的玻璃杯，水面平；灰度、透明底、无字。好看，但只有固体和液体，没有气体；冰与水的组合和 `water` 主题的 `water-three-states` 重了；主题讲的是实验台，不是水 | **换**（新 SUBJECT 见 §7.2） |
| `states-of-matter-air-takes-space.png`（1536 × 1152） | 方水箱、倒扣的杯子，杯里的水面在杯口上方约五分之一杯高处；杯顶露出水面；没有纸巾 | **重画**：杯里水面应只比杯口高一点点（D10：约 1 mm），杯子整只没入，杯底塞一团纸巾；水箱改成圆形玻璃盆（与模型一致）。"外面的水面升高"图里表达不了（不能画标记线），由模型第 2 拍讲。SUBJECT 见下 |
| `states-of-matter-matter-has-mass.png`（1536 × 1152） | 等臂天平，左空杯、右一杯水，右侧下沉 | **不用**（D16）：信息平常，模型第 01 章第 4 拍已讲"液体也有质量"；图里水杯低得过多（示意可以，但不给新东西） |

### 7.2 终版清单

| 文件 | 用途 | SUBJECT（原样英文） |
|---|---|---|
| `genimg/roadmap/states-of-matter.png` → `public/illustrations/states-of-matter.webp` | 首页图版（新） | a small still life on a plain wooden bench drawn as a natural-history plate: on the left a rough grey pebble; in the middle a glass conical flask half full of water with a perfectly flat, level surface; on the right an inflated basketball with plain dark seam lines and no markings, with the thin hose of a small hand pump attached to its valve; the three objects separate and fully visible, no steam, no bubbles in the air, no hands, no text, no numbers, no logos |
| `public/illustrations/figures/states-of-matter-air-takes-space.webp` | 第 04 章：倒扣的杯子（重画） | a round clear glass basin about three-quarters full of still water, seen from the front at water level; a clear drinking glass held upside down and pushed straight down so that the whole glass is under the water, a little above the basin floor; a crumpled white tissue wedged into the bottom of the glass, now at the top, completely dry; inside the glass the water surface is only a hair above the rim of the glass, so almost the whole glass is filled with trapped air; the water surface in the basin is flat; no bubbles, no hands, no arrows, no text |
| `public/illustrations/figures/states-of-matter-sponge.webp` | 第 02 章：海绵的孔（新） | a rectangular bath sponge cut in half, greatly enlarged as a natural-history plate: the cut face shows a network of thin solid walls around many open holes of different sizes; beside it the same sponge squeezed flat between two small wooden blocks, its holes pressed closed and its outline thinner, the solid walls folded but not broken; no water, no hands, no arrows, no text |
| `public/illustrations/figures/states-of-matter-sand-grains.webp` | 第 02 章：沙粒与沙堆（新） | on the left a small conical heap of dry sand on a flat dish with sloping sides at a steady angle, next to a dish of water with a flat level surface; on the right a circular magnified view, like the view through a hand lens, of a few dozen loose sand grains of different sizes, each grain irregular with rounded edges, some clear, some cloudy, with visible gaps between the grains; no text, no scale bar, no numbers |
| `public/illustrations/figures/states-of-matter-look-closer.webp` | 第 06 章细看：课纲之外的粒子图（新） | three small sealed glass boxes of the same size side by side, drawn as a scientific plate, each holding identical small round beads: in the first box the beads are packed tightly in neat regular rows filling the box from side to side; in the second box the same number of beads lies jumbled but touching, filling the lower part of the box with a flat top; in the third box only a few beads are spread far apart across the whole box with lots of empty space between them; all beads the same size in every box; no arrows, no motion lines, no text, no labels |

- 主会话核对：封面里没有蒸汽、篮球没有标志；杯子图的纸巾干、杯里水面只在杯口上方一点点；海绵的孔壁连续不断；沙粒大小不一、有空隙；粒子图三只盒子里的珠子**一样大**（不教"气体微粒更大 / 更小"）、第二只盒子是一个平的上表面（液体）。
- 图注（施工时写）：粒子图的图注写明"小学课纲之外"；沙粒放大图写"像透过放大镜看"，不写倍数。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；本主题**不需要新依赖**；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定；Codex 研究已并入 §1–§2、§6）；docs/17 P4 Matter 行的状态同步、docs/README 加一行 | 主会话 | docs/36、docs/17、docs/README | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts states-of-matter --engine space-scene --subject science --title-en "States of Matter" --title-zh "物质的三态"`；参考图 R1–R9 下到 `scripts/geo/states-of-matter/refs/`，逐张核许可 | 主会话（参考图可交 Opus 内容代理） | 主题目录、refs | validate 绿；参考图看过 | 0.5 天 |
| E | E-MA1 模型 + E-MA2 `fill`（含流按路径显隐、测试 API、shoot 核对）+ 夹具 `sample-matter` + 测试 + docs/06 两节 | Opus 引擎（一个代理） | §4.5 的文件；**不碰** `src/content/topics/states-of-matter/` | §4.6 全勾 | 2.5 天 |
| D1 | 数据骨架：零件（§3.4）、7 组 + 1 个只有流的组（含 `scale`）、两条流（路径由生成脚本写出）、姿态、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后加）；液体零件的 `lathe` 轮廓由生成脚本从容器轮廓算出（内腔 = 容器轮廓内偏移壁厚） | Opus 内容（几何 + 数据），**与 E 并行** | `src/content/topics/states-of-matter/data/parts.json`、`chapters/*.mdx` frontmatter、`scripts/geo/states-of-matter/build-parts.ts`（容器轮廓、刻度、液体内腔、针筒、沙粒与糖粒的随机但固定种子的形状、流路径） | validate 0 error；与 spec 的差异写进汇报 | 1.5 天 |
| D2 | R2 几何两轮（量筒、锥形瓶、针筒、篮球、脚车轮对照 R1–R8；干涉检查：液体在容器壁内、柱塞在筒内、砝码叠在托盘上）→ R3 材质（玻璃与水的层次、cinema 下玻璃的边、沙与糖、湿沙）→ R4 流、姿态；E 合并后加 `sim` 与绑定 | Opus 内容（视觉） | 同上 + `docs/screenshots/states-of-matter/` | 每轮 `pnpm shoot states-of-matter` 截图自证；calls / 三角形在 §3.4 预算内 | 2.5 天 |
| T1 | 来源逐条读、待核落定（F-3、F-6、F-8、F-9、F-11–F-17、F-20–F-24、F-27；Codex 已核的 R: 来源施工时只需复读摘录对应的段落）；S1 设计研究来源（§2.4 全文）；英文草稿：零件 summary / detail、正文、细看、名词定义、`sources.json` 英文 | Codex 起草 → Opus 内容复核事实 | `sources.json`、`glossary.json`、parts.json 文本字段、`chapters/*.mdx` 正文 EN、`SOURCES.md` | 事实表与来源一一对应；`sources-md.ts states-of-matter` | 1.5 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（新加坡用法 §1.6、§6.1；中文独立成文） | Claude（Opus） | 同上 ZH 字段 | 用词与名词表一致 | 1 天 |
| I | 图：封面新画、`air-takes-space` 重画、`sponge` / `sand-grains` / `look-closer` 新画；入库 | Codex 出图 → 主会话逐张审 | `genimg/`、`public/illustrations/` | §7 的核对点 | 0.5 天 |
| B | 35 拍定稿：镜头、标注、`sim.set`、姿态、字幕 EN / ZH | Sonnet | `state.beats` | `--beats` 0 失败、无漏标、液面核对通过、四种组合 | 1 天 |
| P | HUD 排版、模式组合、手机、事实与代码审计、`water` 与 `measuring` 回链（主会话改） | Sonnet QA；视觉问题回 Opus | — | §8.2 全勾 | 1 天 |

- 合计：引擎约 2.5 天（与 D1 并行）；内容约 9 天。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）；Codex 的草稿交给 Opus 内容代理合并，不直接写主题目录。
- **样章**：第 03 章（液体 + T3）先做完给 Gavin 看——最能检验 `fill` 的倒水缓动、玻璃与水在两套主题下的可读性、条形图。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：第 48 页两条 Core Ideas 在 00、01（定义）与 02–06（三态）的正文或拍里；Practices "Measure mass and volume using appropriate apparatus" 在 01（秤）、02（排水）、03（量筒）的试一试里；VEA "curiosity… question what they find" 在 06 的"不好分类"细看；粒子模型只在 06 一块细看 + 一张图，标"课纲之外"，**`grep -i particle` 字幕与正文主段为空**。
- [ ] **措辞**：全文无"课纲不要求（粒子 / 压缩 / 排水法）"（只有密度可以这样说，且只在细看）；无"水 / 沙完全不能压缩"；无"水一点都进不去杯子"；物质与物体不混用。
- [ ] **必须讲对的十处**（§0 D5）各有一拍或一段正文；误解目录 M-1–M-12 每条在指定章出现并给出正确说法；全文无"空气没有质量 / 沙是液体 / 气体不是物质"的肯定说法（误解引用处除外）。
- [ ] **数字一致**：卡片、PLATE、字幕、正文、细看、S1 里同一个量同值（66.3 / 11.5 / 5.4 / 32.0 / 199.4 g；125 / 102 / 120 ml；18.6 / 7.1 / 5.0 / 3.0 cm；600.0 → 604.7 g、每下 0.24 g；14.0 / 14.9 / 14.1 cm、8.9 mm、1.0 mm；20.0 / 15.3 / 12.4 / 10.4 / 9.0 ml；100 / 100 / 105 / 125 / 145 / 165 ml；35 %；1.18 g / ℓ）；模拟的写"在这个模型里 / in this model"。单测 `tests/space-scene/states-of-matter-topic.test.ts`：字幕里的模拟数 = 该拍设置下模型的输出；正文里每个 S1 数字 = 模型输出或设计值；每个 `fill` 零件的轮廓容积 ≥ 数据会给它的最大体积；液体零件的轮廓 = 对应容器的内腔（生成脚本同源，单测比对）。
- [ ] **液面**：`pnpm shoot --beats` 每拍液面核对 0 失败；倒水时两个液面同时缓动；液体不穿出容器壁（R2 干涉检查截图）；paper 与 cinema 下玻璃和水都分得清。
- [ ] **试一试**：01–06 六章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；T1–T3 条形图、T4–T6 折线图；六个先猜后看（T1、T2、T3、T4、T5、T6）不判对错、中英文都对。
- [ ] **两种比例不同框**：`closer` 组只在第 02 章第 6 拍出现，那一拍 `layers` 只有 `closer`；比例尺两边都对（`10 CM` / `1 MM · ×40`）。
- [ ] **写实**：Tier-1 清单（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"一张科学实验台：量筒、秤、针筒"；无品牌、无字、无人与手。
- [ ] **链接**：`<TopicLink>` 到 `measuring`（`millilitres`、`mass-and-balances`）、`water`（`the-water-cycle`）、`forces`（`gravity-and-weight`）、`energy-conversion`（`before-you-start`）全部通过 validate；`water`、`measuring` 回链（主会话）。
- [ ] **性能**：全景静止 ≤ 85 calls / 运转 ≤ 90 / 上限 100；各章 ≤ 60；三角形 < 0.4 M；两条流各 1 次；模型一次求值 < 0.1 ms；`fill` 缓动每帧重建 < 0.5 ms。超过目标时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片在抽屉里可用，按钮 ≥ 44 px；量筒刻度与液面在 `cylinders-view` 里看得清。
- [ ] 首页图 + 4 张配图逐张核对 §7。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot states-of-matter --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

### 9.1 引擎 E-MA1 + E-MA2（Codex，2026-10-20）

本轮只施工引擎与 `sample-matter` draft 夹具；没有创建或展开 `states-of-matter` 正文。提交 `31b7907`（`codex/space-matter`），不 merge、不 push。

**E-MA1**：`lib/sim/matter.ts` 七个可选纯子模型 `weigh` / `displace` / `pour` / `cup` / `pump` / `squeeze` / `pores`；严格作者 schema 与引用校验独立在 `matter-schema.ts`，共享注册文件只加一个种类、一个模型字段与短分支，便于同 `light` 合并。`SIM_KINDS`、`simQuantities`、`quantityKind`、状态标签、`SEPARATE_EXPERIMENTS.matter = true` 完整注册；没有 timeline，沿用 `simTimelineChannels` 的 null 分支。`evaluateSim` / `simQuantities` 可选第五参数传零件；`evaluateSimOnStage` 把几何交给模型，舞台、PLATE、试一试、记录、先猜后看用同一个容器轮廓求液面。旧磁铁载体最小 `{ at }` 契约保留。

§2.4 所有显示数字、压力、空气压缩率、质量 / 体积比例与孔隙拐点均由单测钉住，无数字偏差。模型除 `weigh.step` 指定的秤分度外保留全精度（弹珠排水 2.145 ml、水的微小压缩等），UI 仍按输出 `decimals` 格式化。无用 objects 经 validator 报 warning；液体容积上界对 matter 量和 step 控件静态核对。

**E-MA2**：`lib/fill.ts` 水平裁剪、帕普斯体积、40 次二分反解、容积、下垫体积 `below`、装饰弯月面与体积三次缓动。支持带杯子空腔的弱简单轮廓；拒绝非轴自交、未封闭轮廓。支持直立全周 lathe / box、Y 缩放 / 镜像、圆轮廓等比 X/Z 缩放与 box 的 Y 轴旋转。倾斜容器、部分 arc 与椭圆横截面不属于本轮，校验明确拒绝。

`fillGeometry.ts` 采用 **48 径向段 + 预分配位置 / 法线 / UV / index 缓冲**，只写变化的顶点与 drawRange；没有逐帧 new geometry / material。与 §4.3 的逐帧 new LatheGeometry 表述不同，这是保留同一裁剪轮廓与体积结果的性能改进。平顶、环形空腔、箱体、圆形 / 矩形弯月面均在同一 mesh；弯月面不计入体积读数。小于容积 0.1% 不画、溢出夹满。液体正常被剖切，切面用液体自身颜色；非 shell 液体 X-RAY 不淡化。

几件液体用同一帧的时钟按体积缓动，倒出 / 倒入守恒；瞬切、拍链接、减少动态效果与 REFERENCE 到终值，瞬切后不会重新从旧的缓动起点播放。原有 `pose` / `offset` / `settle` / `count` / `tint` 不改契约。流 `visible.paths` 独立控制路径透明度，并与原有 intensity、density、整流开关相乘；深链接从目标透明度开始，实时变化仍淡入淡出，不增加绘制。

**QA API 与截图**：`__atlas.engine`（View 挂上）新增 `fill(id) → { volume, level, shown }`（m³、primitive 局部 Y）、`flow(id)`（当前逐路径可见性）、`fillBenchmark(id)`（100 次重建的暖机五组中位数，恢复原几何）。`scripts/shoot.ts --beats` 对每拍和每个拍链接核对全部液体的模型体积、反解液面、pour 高度与 cup 杯内 / 盆外读数，液面容差 0.5 mm。

**夹具**：`sample-matter` 45 个零件（全部 primitive，部分带 extra）、6 组、6 实验章 + 背景章、10 个 fill、1 条双路径气泡流；六张卡包括记录、小图与先猜后看。轮廓覆盖直筒、锥形瓶、半球碗、空腔与 box，沙上水用 below。仅夹具文字占位，状态 draft；实物识别级建模与正式内容仍属于后续主题施工。视觉复核修了液体错误使用不透明 token 材质（改 membrane + token tint）、过大气泡（24 点、size 0.08）和 centered repeat 砝码穿过托盘（整叠基准抬高）。

**测试与性能**：新增 `matter.test.ts` 58 项、`fill.test.ts` 17 项；完整作者模板 `tests/space-scene/fixtures/matter-bench.ts`。覆盖 §2.4 全表、不变量、URL、schema 错误、独立路径、解析体积 / 反解、空腔、装饰弯月面、变换、缓冲复用与复杂轮廓预算。全库 111 文件 / 3,033 单测通过；共享机器并行重负载下原有地理测试出现 5 秒超时，使用 `VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm test` 全量通过，未跳题、未放宽断言。`sample-matter.spec.ts` 15 项覆盖真实缓动、深链接、杯子 / 气泡、柱塞回弹、图表、预测、中文 cinema、减少动态与 390 × 844 / 44 px。

暖机全模型平均 0.0312 ms / 次。Node 100 帧重建中位数 1.1622 ms；headless Chromium / Apple M5 Max Metal 对全部 10 件液体测量，最慢半球碗 100 帧 2.3 ms（< 5 ms）。这些是 CPU 几何成本，不把软件渲染的 FPS 当 GPU 性能。最终 hero 在 paper / cinema 均为 51 calls / 41,880 三角形 / 62 geometries / 10 textures，1920 × 1080、DPR 1、Metal 60 fps；各章 HUD 8–21 calls。页面 JS 471.9 KB gzip / 11 files（变更前共享场景 467.6 KB）。

**截图与回归**：夹具 paper / cinema 合计 42 拍及 42 个拍链接、54 个 key 检查、每套 8 个布局尺寸全部通过，0 note / error / 外部请求；逐张打开并看完 `shots/sample-matter/` 的 90 张 PNG（42 拍、32 layout、12 章 HUD、2 剖切、2 hero）。五个指定真实主题 `forces` / `energy-conversion` / `mosquito` / `magnets` / `circuits` 的 `--beats --keys` 全过；另补 §4.6 的 `sample-space` / `sample-forces` / `sample-energy` / `sample-life-cycle` / `water` 同样全过。全部十个场景同保存的变更前 dist 的 hero 比较，calls / triangles / geometries / textures 不变；`forces` / `sample-forces` / `water` 像素完全相同，其余差异在粒子、动态和细边缘，无结构 / 材质回归。`mosquito` 原有一条拍和一条章 label note 保留，没有改正式主题。

**门槛**：`pnpm check` 0 error / warning（3 条原有 hint）；`pnpm validate` 38 topics、0 error / warning；全量单测 111 files / 3,033 tests；`pnpm build` 79 pages / 25.59 s；上述全部截图门槛通过；最终原样 `CI=1 pnpm e2e` **186 passed / 27.0 min**。前轮共享机器上既有 sample-space voice 时序断言得到 3,685 ms（要求 < 2,800 ms），该项隔离重跑和完整重跑均通过，未改断言 / 超时 / 配置；首轮日志和 trace 留在报告所列路径。最终 CI 的 flask 100 次几何更新为 0.5 ms。

本轮 E-MA1 / E-MA2 无未完项；正式主题施工尚未开始。作者数据形状见 docs/06「SpaceScene · 试一试 · 物质（matter）」「SpaceScene · 液面（`fill`）」与 `tests/space-scene/fixtures/matter-bench.ts`。

### 9.2 主题施工（Claude Opus，2026-10-20）

在 1caf36d（matter + light 引擎）与 fb6d6ba（配图）之上施工；**没有改引擎代码**，没有改 `package.json`。

**数据**：`scripts/geo/states-of-matter/build-parts.ts` 生成 `parts.json`（文字在同目录 `text.ts`）。68 个零件 + 4 个 context（实验台、小桌、天平座、颗粒台座），13 个姿态、3 条流、6 个预设、1 个命名剖切面 `basin-section`。每个液体零件的轮廓与它的容器、`matter` 数据出自同一组常数（量筒内半径 1.85 cm、杯 3.0 cm、锥形瓶 4.2 → 1.6 cm、碗 8 cm 半球、水盆 12 cm、倒扣杯 3.5 cm × 9.0 cm、针筒内径 2.0 cm），单测比对。章节 7 个（00 背景 + 01–06），**36 拍**（§5.8 的 35 拍 + 第 05 章把“拿走砝码弹回”和“脚车打气”分成两拍，画面各说各的）。名词 16 个（删去 `container`、`grain`），来源 31 条（编号规则与空号见 `SOURCES.md`）。

**与 §3–§5 的差异（都是为了“每一拍看得到字幕说的东西”）**：

- **布局**：实验台改 1.8 m（1.6 m 放不下六个工位的真实尺寸）；量体积工位改成后排四只容器（量筒 A、高杯、锥形瓶、宽碗）一字排开、前排量筒 B 和四样固体；空气工位把水盆放前面、篮球与电子秤 B 放后面（24 cm 的篮球原先挡住水盆和杯子）；小桌 0.8 × 0.6 m，`side-table` 归 `around-you` 组（hero 不开这一组时空桌子也不画）；放大台座放在台后 1.7 m，只在第 02 章第 6 拍单独入镜。
- **天平与捏海绵**：引擎的 `pose` 绑定会把绑定零件在“其它值”时压回静止（`lib/sim/bind.ts`：同一零件的绑定姿态优先于章 / 拍姿态），所以 §5.2 第 3 拍的拍姿态 `beam-tilt`、§5.3 第 4 拍的 `sponge-squeezed` 在 T1 绑定下不起作用。做法：加两个**不进模型的场景开关**控件 `beam`、`squeeze`（toggle，默认关），绑定在 T1 绑定之后（非静止的后者胜出），拍里写 `sim.set`。代价：这两个值会出现在 URL 的 `sim=` 里。引擎层面更干净的做法见“引擎问题”。
- **球不画瘪**（Codex 事实核查 F-15-baseline）：600.0 g 是“未打气、外形不变”的读数，球外形一直是 75 cm 的球，状态 `flat` 的标签改为“Not pumped / 未打气”，删去 `ball-flat` 姿态；规格行写 `600 G UNPUMPED`。
- **汽水罐不画气泡**（F-24-SEALED-CAN）：没开的罐里，汽水上方是一小段气体；溶解的二氧化碳开罐才冒泡。
- **黏土长条**：`capsule` 的第二个尺寸是中段长度，20 cm³ 要中段 8.88 cm（全长 10.48 cm），不是 9.9 cm。
- **气球**：几何画瘪的小尺寸，`balloons-full` 姿态把它们吹大（§3.7 原写法是反过来的）。
- **不画“倒扣杯子倾斜”**：同 D10，用开孔。

**引擎审查要求的内容修正**：

- 湿沙、湿纸巾向**固定的深色 hex**（`#3d2e1b`、`#7f7c74`）混色，不用 `token:ink-*`（cinema 下是浅色，会变亮）；单测核对两色比原色暗 40 % 以上。
- 封口 / 开孔的杯子：第 04 章第 2、3 拍用剖切面 `basin-section`（切掉水盆前半）并移开后面的篮球、气球；封口时画一团**关住的空气**（新零件 `trapped-air`，开口轮廓、浅色哑光，`cup-place = pushed` 且 `cup-hole = false` 时可见），开孔后它消失、杯里灌满水、气泡流出现、纸巾变深——两拍一眼分得开。
- 弹珠排开的体积：输出 `object-volume` 取 1 位小数，卡片读 2.1 cm³，量筒读 102 ml。
- 篮球与打气筒把手不相交：打气筒平放在球的前方，把手离球心 > 球半径 + 3 cm（单测）。

**事实（Codex 第一轮事实核查，`art/codex-drafts/states-of-matter/facts-pass1.*`，55 条）**：§2.4 的显示数字全部不变（模型取整常数 1.18 g/ℓ、0.997 g/ml、4.5 × 10⁻⁷ /kPa 有 CIPM-2007、IAPWS 原文支持；若用不取整的 25 °C 干空气 1.184 g/ℓ，只有打 15 下变成 603.6 g，S6 的 note 写明）。改了的：FIBA 7 号球 750–770 mm、580–620 g（S38，原 749–780 mm、567–650 g 是旧版二手数据）；7.5–8.5 psi 只属于 NBA（S10），FIBA 只要求标气压和回弹测试；黏土密度来源改成一家厂商的 1.60 g/cm³（S18），通用 1.4–1.8 范围删去；软泡沫 15–60 kg/m³（S17）；休止角用一份实测 32.5° ± 2.4°（S14），不写“30–35°”的通用范围；砂糖粒度是各规格的平均筛孔（S40），糖粒“短棱柱”的形状写成示意；倒水“挂壁 1–2 ml”删去（无来源）；开孔后盆里水面高 1.3 mm（§0 D10 / §8.2 里的 1.0 mm 是杯里的水高出杯口，两者分开写）。标“示意 / 设计取值”的：容器内轮廓（ISO 尺寸表读不到）、篮球内 7.0 ℓ、每下 0.2 ℓ（S43 说明真实打气筒不同）、35 % 孔隙、沙柱不动、方框里的教室 9 × 7 × 3 m。

**Codex 用到的**：研究（`art/codex-research/states-of-matter/`）、事实核查与重算、七章英文正文草稿与 35 条字幕草稿。英文逐章改写（并入节拍顺序、改掉不对应画面的句子、去掉 `<Num>` 包住非数字的写法）；字幕按最终画面重写；中文全部独立写成（固定的形状 / 固定的体积、脚车（自行车）、咖椰，只用“ ”）。

**参考图**：没有下载 R1–R9 到 `scripts/geo/states-of-matter/refs/`；量筒、锥形瓶、针筒、电子秤的比例取自 S19–S21、S41 的厂商规格，其余按 §3.3 的 Tier-1 描述建模。这是已知差距（acceptance 的并排对照图未做）。

**性能**（`pnpm shoot states-of-matter --perf --gpu`，1920 × 1080，Apple M5 Max / Metal）：全景静止 84 calls、FLOW 开 85、三角形 0.18 M、60 fps；各章 11–32 calls；预设 8–50。全部在 §3.4 / §8.2 的预算内（85 / 90 / 100、各章 ≤ 60、< 0.4 M）。

**截图验收**：`pnpm shoot states-of-matter --beats --keys --layout --locale en,zh --theme paper,cinema` 四种组合各 36 拍、36 个拍链接全部打开在同一场景，液面核对 0 失败，键位 0 失败，八个尺寸 0 布局问题，`chapter highlights: all on screen`，console 干净。en-paper 每一拍都看过；zh / cinema 抽看（背景章、固体、液体、杯子剖面、针筒、沙）。

**测试**：`tests/space-scene/states-of-matter-topic.test.ts`（62 项：24 个字幕数字 = 该拍设置下的模型输出、9 个状态、杯子三态、弹珠 2.1 cm³；正文每个 `<Num s="S1">` = 模型输出或设计值；措辞规则；湿色变暗；关住的空气只在封口时可见；黏土长条 20 cm³；篮球与打气筒把手不相交；罐里无气泡；10 个液体零件与容器同轴、不宽于内腔、装得下模型给的最大体积）；`tests-e2e/states-of-matter.spec.ts`（13 项）；首页统计与 smoke 计数改为 27 个已发布主题（并行的 light-and-shadows、singapore-land-use 合并时再加，ww2 的“图版 n”随字母序后移）。

**引擎与流程问题（未改引擎）**：

1. `pose` 绑定会把列出的零件在没有映射的值上压回静止，章 / 拍的 `pose` 因此管不到这些零件（见上“天平与捏海绵”）。建议：没有映射的值返回 `undefined`（不参与），只有显式写 `null` 才压回静止；之后可以删掉 `beam`、`squeeze` 两个场景开关，改回拍姿态。
2. 剖切面同时切到实验台（context），台面剖面的金色斜线在第 04 章第 2、3 拍占了画面底部一条；建议 context 零件可选 `clip: false`。
3. 液体（`membrane`）在剖面里不填色，封口杯里的空气要靠一个“开口轮廓”的零件画出来；若引擎给液体剖面填色，就不需要 `trapped-air` 这类辅助零件。
4. （流程）共享 scratchpad：并行代理的 `shoot` 日志若用同名文件会互相覆盖（本轮遇到一次），日志要放各自的子目录。

**门槛**（合并 main f3624a9 之后）：`pnpm check` 0 error / 0 warning；`pnpm validate` 42 topics、0 error / 0 warning；`pnpm test` 124 files / 3,267 tests；`pnpm build` 通过；`CI=1 pnpm e2e` 212 passed（31.7 min）；上面的截图验收四种组合 0 失败。`status: published`。
