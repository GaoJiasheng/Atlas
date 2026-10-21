# 37 · 身边的材料 · 内容施工 spec（`materials`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备的变体 **"实验台"**（docs/22、23、30、35、36 的同类决定）：一张按实物大小画的小学科学实验台，五个工位各做课纲里的一个性质的公平测试——强度（条架在两块木块上，一块块加砝码）、柔韧性（条夹在台边，压下末端）、浮沉（一缸清水）、防水（滴管滴一滴水）、透光（手电筒、样片、白屏）——台边另画一个新加坡组屋式的厨房角落（壁柜、锅、碗、杯、保鲜盒、毛巾、窗），看每样东西为什么用这种材料。读者每章换一种材料、看结果、记一行，最后一章把五个测试的结果拼成一张表。本主题的任务：**P3 学生看完能说出七种材料（木、金属、陶瓷、橡胶、玻璃、塑胶、布）；能用课纲的话说明五个性质（强度 = 受力而不断，柔韧性 = 能弯而不断，浮 = 停在水面或接近水面，防水 = 不吸水，透光 = 让大部分 / 一部分 / 没有光穿过）；认得出每个测试里改变的、不变的、观察的是什么；能按性质说出一样东西为什么用这种材料。**

`subject: science`；对应 2023 课纲 P3 *Diversity of Materials*（S2 印第 39–40 页）。docs/17 §3 P3 行与 §6 #9（原设想"拆开一间组屋厨房"，本文改成"实验台 + 厨房角落"，理由见 D1）。

2026-10-21 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/36（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Sonnet 起草全文、Opus 逐句核对；ZH 是本文的草稿，施工时 Opus 独立定稿。**本轮没有 Codex**：研究由 Sonnet 完成（`art/research/materials/materials-research.md` 与 `facts.json`，134 行，置信度 high / medium / low / unverified，2026-10-21）；下文 R: 后面是它的行 id（moe 课纲、test 课堂测试、val 数值、sg 新加坡、mis 误解、zh 术语）。课纲原文取自研究里逐字核对过的摘录（`_verified_against_extracted_text: true`）。研究没覆盖的常数（玻璃、陶瓷的弯曲强度与模量，棉纤维密度，半透明塑胶与薄棉布的透光）标"待核"，施工代理读原文核对后才能用，核不到就按每条写的退路处理。

**与已发布主题的分工**：`light-and-shadows`（docs/35）第 03 章 `through-or-blocked` 用透明玻璃、磨砂玻璃、描图纸、硬纸板讲 P4 的"光能不能穿过"（有透光百分数）；本主题第 05 章只讲 P3 的"七种材料各让多少光穿过"，**不给百分数**，链过去。`states-of-matter`（docs/36）讲质量与体积；本主题不讲密度（课纲明说不要求）。`circuits`（导体与绝缘体）、`magnets`（磁性材料）讲的是另两种材料性质，第 06 章细看各链一次。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 一张 2.4 m 长的小学科学实验台 + 台左边一个厨房角落**，按实物大小（1 场景单位 = 1 m，组级比例尺 `{ unit: cm, magnification: 1 }`，写 `10 CM`）。五个工位（§3.1）：① **强度**：两块 6 cm 高的木块相距 20 cm，一根 30 × 3 cm、2 mm 厚的材料条架在上面，条中间放一个砝码托，0–5 个 500 g 槽码；② **柔韧性**：一块 15 cm 高的夹座把同样的材料条夹住、伸出 25 cm，末端旁一支带刻度的推杆架，推杆把末端往下压 0–2 cm；③ **浮沉**：一只 40 × 25 × 25 cm 的玻璃水缸，装 18 cm 深的清水，九样东西轮流放进去（七种材料的 6 × 6 × 3 cm 方块、一块大得多的木板、一只盖好盖子的空塑胶水瓶；布是一块叠好的棉布）；④ **防水**：一个样片座、一支装在架子上的滴管，七块 8 × 8 cm 的样片轮流放上去，滴一滴水；⑤ **透光**：一支手电筒、一个样片夹、一块白屏，同一套七块样片轮流夹上去。**厨房角落**（§3.1 ⑥，按组屋厨房的常见样子画，不声称是某一种组屋的规格）：台面、墙砖、一扇外开窗（玻璃窗扇、铝框、铆钉）、一只开着门的木壁柜、一只不锈钢锅、一只陶瓷碗、一只玻璃杯、一只带橡胶密封圈的塑胶保鲜盒、一条棉布毛巾——和首页图（`materials.png`）是同一组东西。**通用设计研究**，无品牌、无型号、无文字（刻度只有线、没有数字）。标题块 `note`：EN "Generic design study · a school materials bench and a kitchen corner, drawn life size · bends and float levels are worked out from published values and shown without numbers" / ZH "通用设计研究 · 学校的材料实验台与一个厨房角落，按实物大小画 · 弯曲和浮起的高度按公开数据算出，只画不标数" | 同意 | 定稿 |
| D2 | **引擎：SpaceScene + `sim`，新加一个模型 `kind: 'materials'`**（E-MT1）+ **一个新绑定 `bend`**（E-MT2：把一根条按"两端架起"或"一端夹住"的形状弯曲）。其余全部复用：`shadow-cast` 叠加（透光工位的光斑与样片的影子，`dark` 读本模型的数输出）、`visible` / `offset` / `count` / `pose` 绑定、试一试卡片与数据表、先猜后看、背景章、组级比例尺。**为什么不直接用 `force` / `matter` / `light`**：一个主题的 `sim` 只能有一个 `kind`（`lib/sim/index.ts`），而这五个测试分别落在三种模型里；现有子模型也不对口——`force.spring` 是弹簧伸长，没有"条受弯 / 折断"；`matter` 没有浮沉；`light.sheets` 要实验台的两个距离控件和一组有来源的透光率，本主题只有玻璃一个数（D10）。做"一个主题多种 kind"要改模型注册、输出种类推断、`SEPARATE_EXPERIMENTS` 和全部交叉校验，比新加一个自成一体的小模型风险大。**与 docs/30 D2"不做查表模型"的关系**：那一条是为了不手写编出来的数字。本主题按研究的结论（R: 研究摘要第 6 条"Use orderings, not raw numbers"）**界面上不显示任何材料性质的数**，只显示状态（断了 / 没断、弯得多 / 少、浮 / 沉、吸水 / 不吸水、大部分 / 一部分 / 没有光）；状态和画面上的弯曲、浮起高度由模型**按有来源的常数和设计尺寸算出**（梁的弯曲公式、按密度算浮起的深度），单测钉死；防水与透光两项的状态直接取自有来源的定性事实（每种材料一条 F#），没有数可算。不需要时间线、不需要新右上卡、不需要新 token | 新 `kind: 'materials'` + `bend`，引擎约 2.5 天 | 定稿 |
| D3 | **课纲边界**（§1.1 原文，第 39–40 页）：主线 = Core Ideas"把材料的用途和它的物理性质联系起来"（七种材料）+ Practices"比较材料的物理性质"（五个性质）+ VEA"用数据和信息客观地检验观察与解释"。Notes 明说**不要求**两样：密度（第 39 页）；transparent / translucent / opaque 三个词（第 40 页，P4 Light 第 75 页再说一次）。所以：**正文、字幕、卡片不出现"密度"**，浮沉只用"浮在水面或接近水面 / 沉到底"说，"密度"一词只在第 03 章一块细看出现一次并写明"课纲明说不要求，中学会学"；透光主线说"让大部分 / 一部分 / 没有光穿过"，三个词只在第 05 章细看与名词表（标"课纲不要求"）。**硬度、吸水性、弹性、导电、磁性不在五个性质里**：硬度只在第 01 章细看一句（"硬"和"强"不是一回事，R: test-14）；"吸水"只作为防水的反面（课纲的定义就是"不吸水"）；导电、磁性在第 06 章细看链 `circuits`、`magnets`。设计公平测试是 P6 的目标（R: moe-16），本主题只要求**认出**改变 / 不变 / 观察的量 | 同意 | 定稿 |
| D4 | **五个测试按课纲的定义设计，不按教科书物理的定义**（R: 研究摘要第 3 条）：强度 = 受力而不断 → 条上加砝码，看断不断；柔韧性 = 能弯而不断 → 把条压弯，看断不断；浮 = 停在水面或接近水面 → 放进水里看停在哪里；防水 = 不吸水 → 滴一滴水看吸不吸进去；透光 = 让大部分 / 一部分 / 没有光穿过 → 手电筒照样片，看屏上有多亮。**强度测试会碰到"条弯到台面上"的情况**（橡胶、布、塑胶）：模型照实给出"弯到台面上了，没断"，第 01 章讲清"强"和"硬（不容易弯）"不是一回事（R: test-02、test-05），以及"布和橡胶要用拉的办法测强度"（R: test-12、test-13，细看） | 同意 | 定稿 |
| D5 | **样品**（DESIGN，§2.2）：每种材料取一种具体的、有来源的代表，**每个测试里七种的尺寸相同**（公平测试）：木 = 柚木（R: val-str-03、val-float-11，Wood Handbook 有它的弯曲强度、模量和比重）；金属 = 钢（R: val-flex-02、val-float-16）；陶瓷 = 上釉的瓷砖（R: val-float-18、val-wat-06）；橡胶 = 天然橡胶（纯胶，R: val-float-19、val-float-20）；玻璃 = 普通透明窗玻璃（R: val-float-17、val-flex-03、val-tra-01）；**塑胶 = 高密度聚乙烯（HDPE）**——研究里数据最全的塑胶（模量、屈服强度、断裂伸长率、吸水率、密度都有，R: val-str-06、val-wat-01、val-wat-02、val-float-02）；布 = 棉布（R: val-wat-03、test-11）。正文与字幕只说"木、金属……"，具体是哪一种只在零件细看、S1 和细看"这些样品是什么"里写 | 同意 | 定稿 |
| D6 | **必须讲对的十处**（§1.4 误解目录逐条对应）：① **大的、重的东西不一定沉**：一块大得多的木板照样浮（R: mis-01）；② **硬的东西也可能浮、软的也可能沉**：硬木浮，钢沉（R: mis-05）；③ **"强"不等于"不容易弯"**：塑胶条弯到台面上也没断；玻璃条几乎不弯，却先断了（R: test-02、test-03、test-05）；④ **玻璃和陶瓷是脆的**：它们几乎不弯就突然断开，所以"不柔韧"（R: val-flex-04；玻璃待核 F-6）；⑤ **木头这种"硬"东西也会吸水**：没上漆的木块会慢慢把水吸进去（R: test-16、mis-12）；⑥ **防水看的是"吸不吸水"**，不是"湿不湿"：水珠停在塑胶上，塑胶是湿的，但它不吸水（R: moe-09）；⑦ **同一种材料，做法不同结果不同**：上釉的瓷砖不吸水、没上釉的花盆吸水（R: val-wat-06）；薄的金属条能弯、厚的金属棒弯不动（R: test-07）；⑧ **塑胶不一定都浮**：瓶子用的那种塑胶做成实心的一块会沉，盖好盖子的空瓶浮，是因为里面有空气（R: sg-09、val-float-01，细看）；⑨ **橡胶浮不浮要看是哪一种**：纯天然橡胶浮，硬橡胶、很多橡皮擦沉（R: val-float-19，细看）；⑩ **一样东西可以用好几种材料做**：保鲜盒是塑胶加橡胶密封圈，窗是玻璃加金属框（00、06） | 同意 | 定稿 |
| D7 | **章数 6 + 背景章 00**（§5）：00 开始之前 / 01 强度 / 02 柔韧性 / 03 浮还是沉 / 04 防水 / 05 透光 / 06 选材料。顺序照课纲第 39 页五个性质的顺序。**每章一张试一试**（00 没有），**不做测验** | 同意 | 定稿 |
| D8 | **六张试一试**（§4、§5），每张写明改变 / 不变 / 观察，可记一行进表；**都不画小图**（观察量都是状态，没有可画的数；条形图要数）：**T1 加砝码**（01）：换材料条，可再改砝码个数，看断没断、弯得多少；**T2 压一压**（02）：换材料条，可再改压下多少，看断没断；**T3 放进水里**（03）：换放进水缸的东西，看浮还是沉；**T4 滴一滴水**（04）：换样片，看水珠停在上面还是吸进去；**T5 照一照**（05）：换样片，看屏上有大部分、一部分还是没有光；**T6 五个测试一起看**（06）：换材料，五个结果同时读出，七行记完就是一张完整的材料性质表（课纲 P3–P4 的"记录、比较数据"，R: moe-17、moe-18）。六张都有先猜后看 | 同意 | 定稿 |
| D9 | **数字**：界面上只出现**器材的量**——砝码个数与每个 500 g、推杆压下的 cm、水深、样品尺寸（规格行、PLATE 读数、卡片的控件值）；**材料性质一律不出数**（不写多少兆帕、多少克每立方厘米、百分之几的光），细看里可以出现研究里有来源的典型值，各一两处、写清条件（玻璃约九成的光，R: val-tra-01；瓷砖吸水率的分类，R: val-wat-06；一根棉线吊住约 1.1 kg，R: test-11）。模型内部的常数、算出的弯曲量全部在 S1 设计研究来源里，单测钉死 | 同意 | 定稿 |
| D10 | **透光只按课纲的三档**：玻璃"大部分"（R: val-tra-01：4 mm 透明玻璃约 90 %）；HDPE 塑胶片（2 mm，乳白半透）与单层薄棉布"一部分"（**待核** F-19；退路见 §0.1-4）；木、金属、陶瓷、橡胶"没有"（R: val-tra-04 的"厚的、深色的材料挡光"只是教学说法，F-18 另找一条更直接的来源，待核）。屏上的亮度由 `shadow-cast` 画：样片的影子深浅 = 1 − 透过的光，"大部分"取 0.10（由玻璃的 90 % 来）、"一部分"取 0.60（**示意**，S1 写明）、"没有"取 1 | 同意 | 定稿 |
| D11 | **新加坡的生活情境，只写有来源的**（R: 研究 §3）：**确认可用**——BCA 与 HDB 自 2004 年起规定外开窗的铝铆钉要换成不锈钢铆钉，铝铆钉锈蚀、变弱是外开窗掉落的主要原因（2023 年头 11 个月 35 起窗户掉落，19 起是外开窗）；玻璃碎片从高处掉下会伤人（R: sg-01–sg-03）；蓝色回收桶把纸、金属、塑胶、玻璃收在一起，所有 MOE 学校都有蓝色回收桶，塑胶上的树脂编号不说明能不能回收（R: sg-05–sg-07）；塑胶水瓶多用 PET（R: sg-09）。**只作示意、不写成新加坡事实**（通用的"为什么用这种材料"）：窗用玻璃因为透光（R: test-27）；陶瓷茶壶、不锈钢水槽（R: test-29）；用布做拖把因为吸水（R: test-28）；保鲜盒的橡胶圈"能弯、不吸水"（由 F-5、F-16 推出，标推断）。**不写**（研究没查到）：组屋窗玻璃的种类、地铁钢轨的钢种、拖鞋用什么橡胶、校服的布料成分、组屋地砖的种类、饮料瓶回收押金计划的日期（R: sg-04、sg-08、sg-10–sg-13） | 同意 | 定稿 |
| D12 | **背景章 00**：讲"物体"和"材料"的区别（R: mis-11）、七种材料、五个性质（课纲的话）、试一试卡片怎么用、"公平测试"三个问题（改了什么？不变的是什么？看什么？）、模型的画面是按公开数据算的但不标数（D9）。`note` 写模型和数字的来历 | 同意 | 定稿 |
| D13 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人与手（不画拿滴管、压条的手：推杆和滴管都装在架子上）/ 密度的计算 / 材料性质的数值读数 / 小图（D8）/ 读者拖动样品（v2）/ "拉断"的强度测试（只在细看讲，v2 可做）/ 打碎玻璃、陶瓷的写实碎片（断开只画成两段，§3.4）/ 吸水的时间过程（只画结果）/ 腐蚀与生锈的过程（只在第 06 章引 BCA 一句） | 同意 | 定稿 |
| D14 | **图：只用 `art/planned/materials/` 里已审过的三张草稿，不出新图**（本轮没有 Codex）：封面 `materials.png`（厨房壁柜，七种材料都在）**沿用**；`materials-flexible-ruler.png`（塑胶尺架在两块木块上、中间压一块石头、弯而不断）**沿用**，放第 02 章；`materials-waterproof-test.png`（棉布吸水成一片湿印、光滑塑胶片上水成珠）**沿用**，放第 04 章（§7） | 同意 | 定稿 |
| D15 | **中文术语**（§6.1；R: zh-01–zh-17；**没有找到 MOE 的英汉科学词表**，核心词来自香港教育局的英汉科学词汇（繁体，转简体是编辑上的转换）与 Wiktionary）：材料、物体、性质、木（木材）、金属、陶瓷、橡胶、玻璃、**塑胶**（见 §0.1-1）、布（布料）、强度、柔韧性（课纲意思"能弯而不断"）、浮 / 沉、防水、吸水、透光、公平测试（与站内 `forces`、`light-and-shadows` 等主题的名词表一致）。英文用新加坡 / 英式拼写（colour、centimetre、metre） | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。下面几处是"按惯例代定、Gavin 想改随时改"的：

1. **"plastic"写 塑胶 还是 塑料**（D15）：新加坡华语资料库把**塑胶**列为新加坡用词、**塑料**标为中国大陆用词（R: zh-06，联合早报 2019 年也用"塑胶滑梯"，R: zh-07）；本主题默认写**塑胶**。但**站内现有主题全部写"塑料"**（9 个已发布主题 + 夹具 `sample-space`）：22 个文件、65 处（`circuits` 35、`magnets` 14、`aircon` 5，其余 `decimals`、`forces`、`mosquito`、`states-of-matter`、`energy-conversion`、`water`、`sample-space` 各 1–2 处；起草时 `grep` 计数）。两条路：(a) 本主题用"塑胶"，名词表注"也写作塑料"，Gavin 认可后另开一个小任务把全站改成"塑胶"；(b) 本主题也写"塑料"，名词表注"新加坡常说塑胶"。默认 (a)。
2. **强度测试的结果顺序里，玻璃、陶瓷两个常数待核**（D4、F-6）：它们各在第几个砝码断，取决于玻璃、瓷砖的弯曲强度（研究没覆盖）。字幕和正文只说"玻璃条和陶瓷条几乎不弯就断了"，**不比谁先断**；核不到原文时，两者用同一个示意值（S1 写明），结论不变。
3. **橡胶样品取"纯天然橡胶"（浮）**（D5、D6 ⑨）：研究指出橡胶浮不浮看配方。学校里常见的橡皮擦多半会沉，读者自己试可能和模型不一样——第 03 章细看专门讲。若 Gavin 更想让模型和"橡皮擦沉"一致，改成硬橡胶（R: val-float-19，1.2）只是换一个常数，第 03 章第 4 拍改字幕。
4. **塑胶片、棉布"让一部分光穿过"待核**（D10、F-19）：研究没有找到 HDPE 片和薄棉布的透光数据。核不到就：塑胶片改成"透明塑胶片 = 大部分"（仍需一条来源）、棉布删出 T5；最差情况 T5 只剩玻璃一种"大部分"、四种"没有"、塑胶一种"一部分"。
5. **布放进水里"吸了水沉下去"待核**（F-11）：研究只有"衣服吸了水变重、会让人下沉"（R: test-24，medium），棉纤维本身比水重的数没有来源。核不到就把布从 T3 拿掉，第 03 章细看只写"布会先浮一会儿，吸了水以后往往会沉"并标来源。
6. **厨房角落画成组屋厨房的常见样子**（D1、D11）：只用通用的东西，不声称组屋窗玻璃、地砖的规格。若 Gavin 想换成"学校食堂一角"或"课室一角"，零件表 §3.4 ⑥ 换一组东西，第 06 章字幕跟着改。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；来自研究 §1 的逐字摘录，`facts.json` moe-01–moe-20，`_verified_against_extracted_text: true`；页码是页脚印的数字，印的第 n 页 = PDF 第 n + 1 页）

**S2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，封面 "Implementation starting with 2023 Primary Three Cohort"、"Updated Jan 2026"（URL 见 §6.2 P2；repo 的 docs/36 引的是同一份文件的 `_May24` 文件名）。

**Diversity of Materials (P3)**（第 39 页，表格延续到第 40 页）

> **Core Ideas**
> • Relate the use of various types of materials (wood, metal, ceramic, rubber, glass, plastic, fabric) to their physical properties.
>
> **Practices**
> • Compare physical properties of materials.
>   - Strength
>   - Flexibility
>   - Ability to float/sink in water
>   - Waterproof
>   - Transparency
>
> **Values, Ethics and Attitudes**
> • Show objectivity by using data and information to validate observations and explanations about the properties and uses of materials.

**Notes**（Practices 下的斜体块，第 39–40 页，逐条）

> N1. The focus is on how the properties of materials are used.
> N2. The 'strength' of a material is its ability to be subjected to loads without breaking.
> N3. The 'flexibility' of a material is its ability to bend without breaking.
> N4. The 'ability to float on water' refers to whether an object is able to stay on or near the surface of water and not sink. (The concept of density is not required.)
> N5. A material is 'waterproof' when it does not absorb water.
> N6. The 'transparency' of a material refers to whether the material allows most/ some or no light to pass through. (The use of terms - transparent/ translucent/ opaque is not required.)（第 40 页）

**相邻条目与本主题的关系**：

| 页 | 内容（研究里的逐字摘录） | 本主题怎么用 |
|---|---|---|
| 15 | Table 1，"By the end of P4"：Designing investigations — "Recognise a fair test (changed/unchanged variables)."（P6 一列才是 "Design a fair test"）（R: moe-16） | 每张卡的改变 / 不变 / 观察；正文不要求读者设计实验 |
| 16 | "Use senses, apparatus, and equipment to gather data."；"Record and/or compare observations/data with suggested scaffolding."；"Simple analysis of data and information in representations (e.g., tables, bar and line graphs, charts, and diagrams) to infer patterns and relationships or explain findings."（R: moe-17、moe-18） | 记一行、数据表；T6 的七行表 |
| 17 | "Communicate (e.g., written, verbal, pictorial, tabular or graphical) clear explanation and reasoning."；Making informed decisions — "State or select options based on appropriate criteria with reasons."（R: moe-19、moe-20） | 第 06 章"为什么用这种材料"、T6 的先猜后看 |
| 20 | Table 2：P3 的 Diversity of materials **没有下划线**，Foundation 也要学（R: moe-14） | UI 不标 Foundation（同 docs/33、36） |
| 75 | P4 Light："The use of specific terms (transparent, translucent, opaque) is not required."（R: moe-12） | 第 05 章与 `light-and-shadows` 同一处理 |

- 课纲**没有列**的（R: moe-03 的说明）：硬度、吸水性（作为独立性质）、弹性、导电、磁性。D3 的处理。
- P3 Diversity 的第一部分是"生物与非生物"（R: moe-15），属于别的主题（docs/17 `living-things`），本主题不讲。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 七种材料；物体与材料的区别；一样东西可以用几种材料 | 主线（00、06） |
| 五个性质的课纲定义 | 主线（01–05 每章 summary 第一句） |
| 五个公平测试：改变 / 不变 / 观察 | 主线（01–05 的卡片与第 1 拍） |
| 性质决定用途（N1） | 主线（每章末拍 + 06 整章） |
| "强"与"硬""不容易弯"的区别；脆 | 主线一拍（01）+ 细看 |
| 测强度的另一个办法：拉（布、线） | 细看（01） |
| 形状、厚薄也会改变结果（同一种材料，厚的弯不动、薄的能弯） | 细看（02） |
| 密度 | 细看一句（03），写明"课纲明说不要求，中学会学" |
| 橡胶、塑胶"看是哪一种"；盖好的空瓶靠空气浮 | 细看（03） |
| 上釉 / 上漆改变吸水 | 细看（04） |
| transparent / translucent / opaque | 细看 + 名词表（05），标"课纲不要求" |
| 透光的百分数 | 细看一处（玻璃约九成），链 `light-and-shadows` |
| 不锈钢铆钉（BCA）、蓝色回收桶（NEA） | 主线一拍（06）+ 细看 |
| 导电、磁性 | 细看一句（06），链 `circuits`、`magnets` |
| 硬度（划痕测试） | 细看一句（01） |
| 生物与非生物 | 不讲 |

### 1.3 读者学到什么（P3 用词）

1. **材料**是做东西用的料；**物体**是用材料做成的东西。木、金属、陶瓷、橡胶、玻璃、塑胶、布是七种常见的材料。一样东西可以用好几种材料做。
2. **强度**：材料受力（比如压上重物）而不断。玻璃条、陶瓷条几乎不弯就断了；木条、钢条压满了砝码也没断。"强"和"不容易弯"是两回事：塑胶条弯到台面上，也没断。
3. **柔韧性**：材料能弯而不断。木、金属、塑胶、橡胶、布的条都能弯而不断；玻璃、陶瓷的条一弯就断，它们不柔韧。
4. **浮**：东西停在水面上或接近水面，不沉下去。木、橡胶（这一种）、塑胶（这一种）的方块浮；金属、陶瓷、玻璃的方块沉。大的东西不一定沉。
5. **防水**：材料不吸水。金属、陶瓷（上了釉）、橡胶、玻璃、塑胶不吸水；布和没上漆的木会吸水。
6. **透光**：让大部分、一部分或没有光穿过。玻璃让大部分光穿过；这片塑胶和薄布让一部分；木、金属、陶瓷、橡胶不让光穿过。
7. **公平测试**：一次只改变一样东西（这里是材料），其他都保持不变（同样大小的样品、同样的砝码、同一缸水、同一支滴管、同一支手电筒），再看结果。
8. **选材料**：按东西要做的事选性质，再按性质选材料：窗要透光、不吸水 → 玻璃；毛巾要吸水 → 布；窗的铆钉要多年都结实 → 不锈钢。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

依据：研究 §4（R: mis-01–mis-15）。浮沉的研究是**美国六、七年级学生**（Yin et al. 2008，1,002 人，R: mis-01），不是新加坡 P3；**没有找到新加坡的材料误解研究，也没有透光的误解研究**（R: mis-14、mis-15）。正文不写"很多孩子以为……"，只正面讲正确的说法；没有研究来源的几条标"无研究来源"，细看里也不说"常见误解"。

| # | 说法 | 正确的说法 | 哪里纠正 | 研究（R:） |
|---|---|---|---|---|
| M-1 | 大的、重的东西沉，小的、轻的浮 | 一块大得多的木板照样浮；小小的钢块沉 | 03 第 3 拍、T3 先猜后看 | mis-01（high）；mis-09 两个大小黏土球都沉 |
| M-2 | 硬的东西沉，软的东西浮 | 硬木浮，钢沉 | 03 第 2 拍、细看 | mis-05（medium，OCR 文本） |
| M-3 | 有空气的东西一定浮 | 盖好的空瓶浮，是因为整只瓶连空气一起比水轻；装满石头的密封罐即使有空气也沉 | 03 第 5 拍、细看 | mis-02、mis-06（high） |
| M-4 | 平的东西浮 | 本主题的方块形状一样（公平测试），形状不是原因；细看一句：黏土压成薄片照样沉 | 03 细看 | mis-04（high） |
| M-5 | 水多一点东西就能浮 | 换一只更大的缸，沉的照样沉 | 03 细看 | mis-07（medium） |
| M-6 | 只有布才叫材料；"固体"就是"硬的" | 木、金属、陶瓷、橡胶、玻璃、塑胶、布都是材料；材料做成物体 | 00 第 2–3 拍 | mis-11（low，教师清单） |
| M-7 | 木头、石头这种"硬"的东西不会吸水 | 没上漆的木块会慢慢吸水 | 04 第 3 拍 | mis-12、test-16（medium） |
| M-8 | "强"就是"硬"、就是"不容易弯" | 强 = 受力而不断；玻璃几乎不弯却先断，塑胶弯到底也没断 | 01 第 3–4 拍、细看 | test-05、test-02、test-03（high；教学说明，不是误解调查） |
| M-9 | 所有塑胶都浮 / 所有橡胶都浮 | 看是哪一种：PET 实心沉、PVC 沉；硬橡胶沉 | 03 细看 | sg-09、val-float-01、val-float-19（研究的设计提醒，无误解调查） |
| M-10 | 湿了就是不防水 / 亮晶晶的就防水 | 防水看吸不吸水：水珠停在塑胶上，塑胶不吸水；亮的金属不吸水，是因为金属本身不吸水，不是因为亮 | 04 第 1 拍、细看 | mis-13（unverified：只读到搜索摘要）→ 按"无研究来源"处理，不说"常见误解" |
| M-11 | 玻璃、陶瓷很硬，所以也很强、能弯 | 它们脆：几乎不弯就断 | 01 第 3 拍、02 第 4 拍 | 无研究来源（val-flex-04 只证科学本身） |
| M-12 | 透光要么全透、要么不透 | 课纲的三档：大部分 / 一部分 / 没有 | 05 第 3 拍 | 无研究来源（R: mis-14：没有找到透光的误解研究） |

### 1.5 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 透光的百分数、磨砂玻璃、影子 | `light-and-shadows`（`through-or-blocked`） | 05 细看 + `<TopicLink slug="light-and-shadows" ch="through-or-blocked">` |
| 质量与体积；"大而轻、小而重" | `states-of-matter`（`mass-and-space`） | 03 细看一句 + 链 `ch="mass-and-space"` |
| 弹簧、弹力 | `forces`（`elastic-spring-force`） | 02 细看一句（"弹回来"不是本课的性质）+ 链 |
| 导体与绝缘体 | `circuits`（`conductors-and-insulators`） | 06 细看"其他性质"一句 + 链 |
| 磁性材料 | `magnets`（`magnetic-or-not`） | 06 细看"其他性质"一句 + 链 |

**谁后发布谁补链接**：`light-and-shadows` 第 03 章细看与 `states-of-matter` 第 01 章细看各有一处可以回链本主题（docs/35 D18、docs/36 §1.7 都写了"materials 未建，谁后发布谁补"）；本主题发布时由**主会话**在那两章末段各加一句回链（内容代理不碰那两个目录）。

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：通俗不幼稚，先现象后道理；不拟人（不写"玻璃怕摔"）、不喊"小朋友"、无感叹号、无问句标题；试一试的说明写"改变 / 不变 / 观察"。英文用新加坡 / 英式拼写。中文用新加坡用法（§6.1）：塑胶（§0.1-1）、引号只用“ ”。**安全**：不鼓励读者自己压断玻璃、陶瓷（第 01、02 章细看各一句："玻璃和陶瓷断开的边很利，这个测试只在模型里做"，并引 BCA 关于玻璃碎片的话，R: sg-03）；滴水、浮沉、透光的测试读者可以在家用安全的材料试（细看写"请大人在场"）。

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的尺寸与常数（落在 TYPICAL 内，没有 TYPICAL 的写"示意"）；`SIM` = §4 的模型算出的结果（**只用来画，不显示**，D9）。P# → §6.2（施工时变 S#；S1 是设计研究来源）。置信度照研究：high / medium / low / unverified。"待核" = 研究里没有，施工代理（Sonnet 事实核查）读原文定。

### 2.1 课堂测试的做法（定性）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-1 | 五个测试的公平测试设计 | 柔韧：同样长、宽、厚的木、塑胶、金属尺和卡纸，轻重物，量末端弯下多少（RSC 印第 14 页，R: test-06、test-08）；强度：同样大小的纸，一点点加重物直到撕开（印第 14–15 页，R: test-09）；布用测力计拉到撕开（印第 15 页，R: test-12）；防水：往各种材料上滴水，看吸进去还是停在上面（印第 18–19 页，R: test-18），布绷在杯口上数滴数（R: test-19）；浮沉：先猜后试、不用"密度"这个词（SFI 第 1 页，R: test-21、test-23）；透光：手电筒照 4 种材料（Thorpe Park Y2 第 6 课，R: test-25） | 01–05 的卡片、第 1 拍、细看 | high（RSC、SFI）/ medium（Thorpe） |
| F-2 | 强、硬、不容易弯是不同的词 | 强度 = 把材料弄断要多大的力；"stiffness"（不容易弯）是柔韧的反面；一种材料可以"强但脆"（RSC 印第 11 页，R: test-01–test-03）；日常用语和科学用语不同，要用准确的词（R: test-05）；硬度是抗划、抗压痕，和强度是两回事（印第 16 页，R: test-14） | 01 第 3–4 拍、细看 | high |
| F-3 | 一个测试要适合被测的材料 | 比较布的强度时，要不要把有弹性的布放进同一个测试，本身就是公平性的问题（RSC 印第 16 页，R: test-13） | 01 细看 `Pull, don't bend` | high |
| F-4 | 形状改变柔韧 | 卡纸卷成管比平的卡纸难弯（RSC 印第 14 页，R: test-07） | 02 细看 `Thin and thick` | high |
| F-5 | 陶瓷脆、金属有延展性 | "metals are ductile and ceramics are brittle"；陶瓷硬、耐磨、脆（UW 材料科学资料页，R: val-flex-04） | 01、02 | medium |
| F-6 | 玻璃脆、断前几乎不弯 | **待核**：找一份玻璃厂商技术资料或 EN 572-1 的转述，给出退火浮法玻璃的弯曲强度（特征值约 45 MPa）与弹性模量（约 70 GPa）。研究只有玻璃模量 50–90 GPa（R: val-flex-03，medium） | 01、02、S1 | 待核 |
| F-7 | 两个参考单值 | 一张 A4 打印纸吊住 650 g 才撕开；一段棉线吊住 1100 g 才断，涤纶、尼龙线能吊住多得多（RSC 印第 15 页，**一次课堂结果，不是标准**，R: test-10、test-11） | 01 细看 `Pull, don't bend` | medium |

### 2.2 样品与常数（DESIGN，S1；正文与界面不显示数）

公平测试的样品尺寸（D1）：**材料条** 30 × 3 cm、厚 2 mm（强度、柔韧共用同一套七根）；**方块** 6 × 6 × 3 cm（浮沉；布 = 叠成 6 × 6 cm、约 1 cm 厚的棉布）；**大木板** 24 × 10 × 6 cm（同一种木）；**空瓶** 500 ml、直径 6.5 cm、长 20 cm、盖好盖子；**样片** 8 × 8 cm、厚 2 mm（防水、透光共用同一套七块；布 = 单层薄棉布）。

| # | 材料（样品） | 弹性模量 E | 断 / 屈服的应力 | 断的方式 | 密度 kg/m³ | 吸水 | 透光 | 来源与置信度 |
|---|---|---|---|---|---|---|---|---|
| F-8 | 木（柚木） | 10.7 GPa（12 % 含水率） | 弯曲强度 100.7 MPa | 断（`snaps`） | **650（示意，见 F-12）** | 吸（没上漆） | 没有 | Wood Handbook 表 5-5a 印第 5-21 页（R: val-str-03，high）；比重 0.55（生材体积基础，R: val-float-11）；吸水 R: test-16（high） |
| F-9 | 金属（钢） | 200 GPa | 屈服 250 MPa（结构钢 A36） | 弯而不断（`bends`：超过屈服会永久弯，模型的设计保证不超过，§4.3） | 7820 | 不吸 | 没有 | Engineering ToolBox（R: val-flex-02、val-float-16，medium，经摘要读取） |
| F-10 | 陶瓷（上釉瓷砖） | **待核**（设计取 70 GPa） | **待核**（设计取 35 MPa：ISO 13006 BIa 类瓷砖的最小断裂模数，待读原文） | 断（`snaps`） | 2400（瓷 2.3–2.5 ×10³） | 不吸（上釉；瓷质砖 < 0.5 %） | 没有 | 密度 R: val-float-18（medium）；吸水分类 R: val-wat-06（medium，厂商页转述 ISO 10545-3）；脆 R: val-flex-04 |
| F-11 | 橡胶（纯天然橡胶） | 0.05 GPa（0.01–0.1 的中段，设计取值） | 不断（`never`） | — | 920（纯胶 0.91–0.93） | 不吸 | 没有 | 模量 R: val-flex-01（medium，经摘要读取）；密度 R: val-float-19（medium）；防水、能拉长 R: val-float-20（medium，Wikipedia） |
| F-12 | 玻璃（透明窗玻璃） | 70 GPa（50–90 的中段；F-6 待核） | 弯曲强度 **45 MPa（待核 F-6）** | 断（`snaps`） | 2500（2.4–2.8） | 不吸 | 大部分（4 mm 约 90 %） | R: val-flex-03、val-float-17（medium）；透光 R: val-tra-01（high，AGC，按 EN 410 计算） |
| F-13 | 塑胶（HDPE） | 0.8 GPa | 屈服 > 27.6 MPa（> 4,000 psi 换算） | 弯而不断（断裂伸长率 > 400 %） | 955（0.95–0.96） | 不吸（< 0.10 %） | 一部分（2 mm 乳白片，**待核** F-19） | Proto Labs HDPE 数据表（R: val-str-06、val-wat-01、val-wat-02，medium）；模量 R: val-flex-01；密度 R: val-float-02 |
| F-14 | 布（棉布） | 无（软，`limp`） | 不断 | — | **棉纤维约 1540（待核 F-11b）** | 吸 | 一部分（单层薄布，**待核** F-19） | 吸湿回潮 7–11 %（R: val-wat-03，medium）；滴水测试 R: test-18（high） |
| F-15 | 水 | — | — | — | 1000（清水；海水 1030） | — | — | R: val-float-05（medium） |
| F-16 | 空瓶（PET，盖好） | — | — | — | **平均约 40（示意：瓶重约 20 g ÷ 约 515 ml）** | — | — | PET 本身 1.38–1.39，用于汽水、饮用水瓶（R: sg-09、val-float-01，medium）；瓶重无来源 → 示意 |

- **F-12 的木材密度**：Wood Handbook 的比重 = **全干质量 ÷ 生材（或 12 % 含水率）体积**（R: val-float-12，high），不是一块湿木头放进水里的情况。模型取 650 kg/m³（示意的"风干柚木"），只用来画浮起的高度；"木会浮"这个结论由比重 < 1 支持（R: val-float-09–val-float-11），S1 与第 03 章细看写明这一层。
- **F-11b 棉纤维比水重**（待核）：找一份纺织参考资料给出棉纤维密度约 1.5 g/cm³。核不到见 §0.1-5。
- **F-18 不透光**（待核，可选）：研究只有教学说法"厚的、深色的材料挡光，适合做窗帘"（R: val-tra-04，medium）。木、金属、瓷砖、2 mm 橡胶片不透光是常识，施工找一条更直接的教学来源（如同一 Y2 单元的分类表）；找不到就用 val-tra-04，不写成测量。
- **F-19 塑胶片、薄棉布让一部分光穿过**（待核）：研究没有数据（R: 研究 §2e"Frosted acrylic ... were not obtained"）。施工找一份教学来源说明"薄布、乳白塑胶让一些光穿过"；退路见 §0.1-4。
- **F-6、F-10 的作用**：只决定模型里玻璃条、陶瓷条在第几个砝码 / 压下多少时断；核实后若数值变了，**改 S1 和单测，不改字幕**（字幕不说第几个）。

### 2.3 浮沉、防水、透光的补充事实（细看用）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-20 | 会沉的木头 | 愈疮木比重 1.05（生材），在清水里沉（Wood Handbook 印第 5-19 页，R: val-float-08） | 03 细看 `Wood that sinks` | high |
| F-21 | 塑胶看种类 | PP 0.90–0.91、LDPE 0.92–0.94、HDPE 0.95–0.96 浮；PET 1.38–1.39、PVC 1.16–1.45 沉（TeachEngineering，R: val-float-01–val-float-04） | 03 细看 `Plastics differ` | medium |
| F-22 | 橡胶看配方 | 纯胶 0.91–0.93 浮；一般软橡胶制品约 1.1、硬橡胶 1.2 沉（Engineering ToolBox，R: val-float-19） | 03 细看 `Rubber differs` | medium |
| F-23 | 衣服吸了水变重 | "Most clothes and shoes absorb water and make you heavier and sink."（SFI 第 2 页，R: test-24） | 03 布的一拍、04 细看 | medium |
| F-24 | 有空气 ≠ 一定浮 | 同样大小、同样重的实心球与空心球浮沉一样；装着石头的密封罐即使塞了泡沫也沉（Yin et al. 2008 第 36–37 页，R: mis-02、mis-06） | 03 细看 `Air inside` | high |
| F-25 | 瓷砖吸水分类 | 瓷质砖（BIa）< 0.5 %；炻质（BIIa）3–6 %；陶质 > 10 %（ISO 10545-3 的分类，厂商技术页转述，R: val-wat-06） | 04 细看 `Glaze and varnish` | medium |
| F-26 | 称一称吸了多少水 | 同样大小的样品，泡水前后各称一次，画条形图（RSC 印第 18 页，R: test-17） | 04 细看 `Weigh it` | high |
| F-27 | 吸湿的差别 | 棉 7–11 %、羊毛 13–18 %、涤纶 0.4–0.8 %（从空气里吸湿，不是泡水，Wikipedia 引 Mather & Wardman 2015 第 412 页，R: val-wat-03） | 04 细看（只写"棉比涤纶吸得多"，不写百分数） | medium |
| F-28 | 玻璃透光 | 透明浮法玻璃 3 / 4 / 5 / 6 / 8 / 10 / 12 mm 的透光 91 / 90 / 90 / 89 / 89 / 88 / 87 %（AGC，按 EN 410 计算，R: val-tra-01–val-tra-03） | 05 细看 `Nine tenths`（只写"约九成"） | high |

### 2.4 新加坡与用途（只定性，第 06 章）

| # | 项 | TYPICAL（来源） | 用在 | 置信度 |
|---|---|---|---|---|
| F-29 | 外开窗铆钉 | BCA 自 2004 年起规定屋主把外开窗的铝铆钉全部换成不锈钢铆钉；铝铆钉锈蚀、变弱是外开窗掉落的主要原因；2023 年头 11 个月 35 起窗户掉落，其中 19 起是外开窗（BCA–HDB 联合文告，2023 年 12 月，第 1 页，R: sg-01、sg-02） | 06 第 3 拍、细看 | high |
| F-30 | 玻璃碎片 | "Glass shards, falling from height, can cause serious injuries"（建筑管制专员，同一文告第 2 页，R: sg-03） | 01、02 安全细看；06 细看 | high |
| F-31 | 蓝色回收桶 | 新加坡采用混合收集，纸、金属、塑胶、玻璃都可以投进蓝色回收桶（NEA Recycling FAQs Q4，R: sg-05）；所有 MOE 学校都有蓝色回收桶（R: sg-07）；塑胶上的数字是树脂识别码，供厂商与回收商用，不说明能不能回收（Q7，R: sg-06） | 06 细看 `The blue bin` | high |
| F-32 | 窗用玻璃因为透光 | "Glass is used to make windows because it is transparent."（Thorpe Park Y2，R: test-27） | 05 末拍、06 | medium |
| F-33 | 茶壶、水槽、拖把 | 茶壶：陶瓷，硬、防水、耐热液体；水槽：不锈钢，防水、强、韧、易清洁（RSC 章末工作纸，R: test-29）；布适合做拖把因为吸水（R: test-28） | 04、06 | medium |
| F-34 | 保鲜盒的橡胶圈 | **推断**（不是来源原话）：橡胶能弯（F-11）、不吸水（R: val-float-20），所以能贴紧盒盖。首页图的 SUBJECT 也画了这圈橡胶 | 06 第 4 拍（字幕写"能弯、不吸水"，不写"所以漏不进水"） | 推断 |

**不用**（研究标 unverified 或 low）：组屋窗玻璃种类（sg-04）、地铁钢轨钢种（sg-10；英国 R260 的数只在研究里，不进本主题）、拖鞋的橡胶（sg-11）、校服布料（sg-12）、组屋地砖（sg-13）、饮料瓶回收押金计划（sg-08，日期冲突、low）、OpenLearn 的分阶段推理（mis-10，low）。

### 2.5 模型（SIM，设计研究来源 S1 的内容；§4 的模型算出来的；单测钉死；**只画，不显示**）

全部由 §2.2 的常数和尺寸推出。g = 9.8 N/kg。材料条：宽 b = 3.0 cm、厚 h = 0.20 cm → 截面惯性矩 I = b h³ ÷ 12 = 2.0 × 10⁻¹¹ m⁴、抗弯截面系数 Z = b h² ÷ 6 = 2.0 × 10⁻⁸ m³；自重 w = 密度 × g × b × h。

**T1 强度**（两端架起，跨距 L = 20 cm，砝码放在中点，每个 500 g；离台面 6.0 cm）：中点下垂 δ = P L³ ÷ (48 E I) + 5 w L⁴ ÷ (384 E I)；最大应力 σ = (P L ÷ 4 + w L² ÷ 8) ÷ Z = 2.5 × 10⁶ P + …（Pa）。`snaps` 的材料 σ > 断的应力 → **断**；δ ≥ 6.0 cm → **弯到台面上**（此后砝码由台面托住，应力不再增加）；布 `limp` → 一开始就**垂到台面上**。弯曲程度：< 0.5 cm"几乎不弯"、0.5–3 cm"弯一点"、≥ 3 cm"弯很多"。

| 条 \ 砝码个数 | 0 | 1 | 2 | 3 | 4 | 5 | 末态（5 个） |
|---|---|---|---|---|---|---|---|
| 钢 | 几乎不弯 | 同 | 同 | 同 | 同 | 0.10 cm 几乎不弯 | **没断**、几乎不弯 |
| 木 | 几乎不弯 | 0.38 cm 几乎不弯 | 0.76 弯一点 | 1.15 | 1.53 | 1.91 弯一点 | **没断**、弯一点 |
| 玻璃 | 几乎不弯 | 0.06 | 0.12 | 0.18 cm（σ 37.1 MPa） | **断**（σ 49.4 > 45） | 断 | **断了** |
| 陶瓷 | 几乎不弯 | 0.06 | 0.12 cm（σ 24.9） | **断**（σ 37.1 > 35） | 断 | 断 | **断了** |
| 塑胶（HDPE） | 0.07 cm | 5.17 cm 弯很多（σ 12.4 < 27.6） | **弯到台面**（δ 计算值 10.3） | 台面 | 台面 | 台面 | **弯到台面上、没断** |
| 橡胶 | 1.13 cm 弯一点 | **弯到台面**（δ 计算值 0.83 m） | 台面 | 台面 | 台面 | 台面 | **弯到台面上、没断** |
| 布 | 垂到台面 | 台面 | 台面 | 台面 | 台面 | 台面 | **垂在台面上**（这个测试测不了它） |

- 玻璃、陶瓷断在第几个砝码取决于待核的 F-6、F-10（§0.1-2）；单测按 S1 的设计值钉；字幕不说第几个。
- 塑胶弯到台面时的应力：δ = 6.0 cm 时 P ≈ 5.7 N、σ ≈ 14.4 MPa < 屈服 27.6 MPa（不会永久弯，validate 守，§4.3）。钢在 5 个砝码时 σ ≈ 62 MPa < 250 MPa。
- 大挠度时小挠度公式不准：画面用 `bend` 绑定按弧长保持条的长度（§4.5），弯到台面的条画成贴着台面的形状（示意）；S1 写明"弯多少是按教科书公式算的示意量，真实的条还会受夹持、厚薄不均影响"。

**T2 柔韧性**（一端夹住，伸出 L = 25 cm，推杆把末端压下 0 / 0.5 / 1.0 / 1.5 / 2.0 cm）：夹口处应力 σ = 3 E h × 压下量 ÷ (2 L²) = 0.048 E × 压下量（Pa，压下量 m）；自重的下垂 δ₀ = w L⁴ ÷ (8 E I)；末端位置 = max(压下量, δ₀)。`snaps` 的材料 σ > 断的应力 → **断**；δ₀ ≥ 1.0 cm 或 `limp` → **自己就垂下来**；其余压下 > 0 → **弯而不断**。

| 条 \ 压下 cm | 0 | 0.5 | 1.0 | 1.5 | 2.0 | 柔韧吗 |
|---|---|---|---|---|---|---|
| 钢 | 还没压（自垂 0.06 cm） | 弯而不断 | 同 | 同 | 弯而不断（σ 192 MPa < 250） | 是 |
| 木 | 还没压（0.09 cm） | 弯而不断 | 同 | 同 | 弯而不断（σ 10.3 MPa） | 是 |
| 玻璃 | 还没压（0.05 cm） | 弯（σ 16.8） | 弯（σ 33.6） | **断**（σ 50.4 > 45） | 断 | 否 |
| 陶瓷 | 还没压（0.05 cm） | 弯 | 弯（σ 33.6 < 35） | **断** | 断 | 否 |
| 塑胶（HDPE） | **自己垂下**（自垂 1.71 cm） | 同 | 同 | 同 | 同（末端 2.0 cm） | 是 |
| 橡胶 | **自己垂下**（自垂远大于伸出长度，画成垂挂，末端取 0.8 L = 20 cm） | 同 | 同 | 同 | 同 | 是 |
| 布 | **自己垂下**（`limp`） | 同 | 同 | 同 | 同 | 是 |

- 陶瓷在 1.0 cm 时 σ 33.6 MPa，离设计值 35 只差 4 %——F-10 核实后很可能变成"1.0 cm 就断"；单测随 S1 改，字幕只说"压下去不多就断了"。
- 钢 2 mm、伸出 25 cm、压下 2 cm 时末端要用约 15 N 的力（≈ 1.6 kg 的重量；S1 写明，不显示），手按得下去。

**T3 浮沉**（清水 18.0 cm 深；方块平放、高 3 cm；大木板高 6 cm；空瓶横躺、按高 6.5 cm 的方盒近似；布 1 cm）：浮的条件 密度 < 1000；浮着时浸在水里的深度 = 密度 ÷ 1000 × 高（模型内部的量，用来画）；底面离缸底 = 18.0 − 浸入深度；沉的停在缸底（0）。

| 放进去的 | 结果 | 浸入深度 / 露出水面 | 底面离缸底 |
|---|---|---|---|
| 木（方块） | 浮 | 1.95 cm / 1.05 cm | 16.05 cm |
| 大木板 | 浮 | 3.90 / 2.10 cm | 14.10 cm |
| 钢 | 沉 | — | 0 |
| 陶瓷 | 沉 | — | 0 |
| 橡胶（纯胶） | 浮（接近水面） | 2.76 / 0.24 cm | 15.24 cm |
| 玻璃 | 沉 | — | 0 |
| 塑胶（HDPE） | 浮（接近水面） | 2.87 / 0.14 cm（取 2.865） | 15.14 cm |
| 盖好的空瓶 | 浮（浮得很高） | 0.26 / 6.24 cm（示意） | 17.74 cm |
| 布 | 沉（吸了水以后；F-11b 待核） | — | 0 |

- "接近水面"正是课纲 N4 的 "stay on or near the surface"：橡胶、塑胶只露出两三毫米也算浮。

**T4 防水**：吸水 = 木（没上漆）、布；不吸 = 钢、陶瓷（上釉）、橡胶、玻璃、塑胶。无数（F-8–F-14 的"吸水"一列）。

**T5 透光**（手电筒到样片 20 cm、样片到屏 10 cm，同 `light-and-shadows` 第 03 章的距离）：大部分 = 玻璃（影子深浅 0.10）；一部分 = 塑胶、布（0.60，示意）；没有 = 木、钢、陶瓷、橡胶（1）。

**T6 五个测试一起看**（砝码 5 个、压下 2.0 cm、标准方块、样片）：

| 材料 | 强度（加满 5 个砝码） | 柔韧性（压下 2 cm） | 浮沉 | 防水 | 透光 |
|---|---|---|---|---|---|
| 木 | 没断 | 弯而不断 | 浮 | 吸水 | 没有 |
| 金属 | 没断 | 弯而不断 | 沉 | 不吸水 | 没有 |
| 陶瓷 | 断了 | 断了 | 沉 | 不吸水 | 没有 |
| 橡胶 | 弯到台面、没断 | 自己垂下 | 浮 | 不吸水 | 没有 |
| 玻璃 | 断了 | 断了 | 沉 | 不吸水 | 大部分 |
| 塑胶 | 弯到台面、没断 | 自己垂下 | 浮 | 不吸水 | 一部分 |
| 布 | 垂在台面上 | 自己垂下 | 沉 | 吸水 | 一部分 |

这张表就是本主题的"答案"，也是第 06 章 T6 记完七行后读者手里的表。S1 写明：真实的测试每次结果会有出入（尤其玻璃、陶瓷什么时候断），模型每次给同一个结果；样品换一种木、一种塑胶、一种橡胶，浮沉和弯曲可能不同（细看）。

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `strength-rig` | Strength / 强度 | 两块支撑木块、七根材料条（同时只显示一根）、两根断开的条、砝码托与槽码 | `token:ink-2` |
| 02 | `bend-rig` | Flexibility / 柔韧性 | 夹座、七根材料条、两根断开的条、推杆架、推杆 | `token:accent-2` |
| 03 | `float-tank` | Float or sink / 浮沉 | 水缸、水、九样放进去的东西（同时只显示一样） | `token:cold` |
| 04 | `drop-tray` | Waterproof / 防水 | 样片座与滴管架、七块样片、水珠、湿印 | `token:ink-3` |
| 05 | `light-bench` | Light through / 透光 | 手电筒、样片夹、白屏、七块样片 | `token:en-light` |
| 06 | `corner-wood` | Wood / 木 | 壁柜 | `token:loop` |
| 07 | `corner-metal` | Metal / 金属 | 锅、窗框、窗铆钉、柜门铰链 | `token:loop` |
| 08 | `corner-ceramic` | Ceramic / 陶瓷 | 碗、墙砖 | `token:loop` |
| 09 | `corner-rubber` | Rubber / 橡胶 | 保鲜盒的密封圈 | `token:loop` |
| 10 | `corner-glass` | Glass / 玻璃 | 窗玻璃、玻璃杯 | `token:loop` |
| 11 | `corner-plastic` | Plastic / 塑胶 | 保鲜盒 | `token:loop` |
| 12 | `corner-fabric` | Fabric / 布 | 毛巾 | `token:loop` |

- **厨房角落按材料分组**（docs/17 #9 写的缺口 B5"按材料分组的 LAYERS"，用组就能做，不要引擎）：LAYERS 里关掉其余六组就只看"金属的东西"；第 00、06 章的拍用 `layers` 一次只开一种材料。七组同一个组色（`loop`），PLATE 立面与图例里它们是"厨房角落"的不同材料，名字就是材料名。
- context：`bench`（实验台）、`counter`（厨房台面与柜体）、`corner-wall`（墙与地面）。
- 右上卡：零件链路卡（`connects` 只在工位内部连：砝码托 → 材料条 → 支撑木块；推杆 → 材料条 → 夹座；手电筒 → 样片夹 → 白屏）。不需要新卡。

### 3.2 坐标与尺度

- 1 场景单位 = 1 m，Y 向上，实验台面 y = 0，+Z 朝观者，+X 向右。台面 2.4 × 0.7 m（x −1.2 … 1.2，z −0.35 … 0.35）。厨房台面与实验台同高（y = 0），在台的左边 x −2.3 … −1.5、z −0.35 … 0.30；后墙在 z −0.35，地面 y −0.90。
- 工位中心（R2 起点）：① 强度 (−0.90, 0, 0.05)；② 柔韧 (−0.45, 0, 0.05)（夹座在 x −0.55，条向 +X 伸出）；③ 浮沉 (0.0, 0, −0.02)；④ 防水 (0.45, 0, 0.08)；⑤ 透光 (0.88, 0, 0.0)（手电筒 x 0.70、样片夹 x 0.90、白屏 x 1.00，光轴沿 +X，高 y 0.10）；⑥ 厨房角落 (−1.90, 0, −0.05)。
- 尺寸照 §2.2、§2.5：支撑木块 6 × 6 × 6 cm；夹座 8 × 15 × 8 cm；推杆架高 18 cm；水缸外 40 × 25 × 25 cm（玻璃 5 mm）；样片座 12 × 2 × 12 cm，滴管尖离样片 5 cm；白屏 30 × 22 cm；窗洞 0.6 × 1.0 m（y 0.30 … 1.30），壁柜 0.6 × 0.6 × 0.32 m 挂在 y 0.55 … 1.15。
- 整体包络约 x −2.3 … 1.2，半径约 1.8；投影照引擎默认（台、水缸、柜投影）。以上是 R2 起点：对照参考图调比例；改量级回 §2.2 改 DESIGN。

### 3.3 Tier-1（一眼能认）与参考图

| 对象 | 一眼要认出的 |
|---|---|
| 强度架 | 两块木块、一根条横跨其上、中点一个砝码托叠着几片带槽口的圆槽码（槽口错开） |
| 柔韧架 | 一块木夹座 + 一只 G 形夹压住条的一端；末端旁一根竖杆，杆上一排刻度线（无数字）和一个可上下滑的推杆头 |
| 七根条 | 木：纹理、暖褐；钢：冷灰金属反光；瓷砖条：白色釉面、断面是灰白的坯；橡胶：哑光深色；玻璃：透明、边缘发绿；HDPE：乳白半透；棉布：织纹、毛边 |
| 断开的条 | 两段，断口参差（玻璃：贝壳状、陶瓷：粒状的示意），一段还在支撑上、一段斜落在台面上；不画飞散的碎片 |
| 水缸 | 透明直壁缸、水面平；放进去的东西浮着时水面切过它的侧面 |
| 空瓶 | 塑胶瓶身的环形加强筋、瓶肩、瓶盖；无标签、无字 |
| 防水座 | 一支竖着装在架子上的滴管（玻璃管 + 橡胶头）；样片上一颗半球形水珠，或一片比样片颜色深的湿印 |
| 透光台 | 手电筒（同 `light-and-shadows` 的样子）、夹样片的小架、白屏；屏上一个光斑和样片的影子 |
| 厨房角落 | 外开窗（铝框、窗扇、铰链处可见几颗铆钉）、墙砖（方格缝）、木壁柜（门开着）、柜里与台面上的锅、碗、杯、保鲜盒（盖子一圈深色橡胶圈）、搭在台边的条纹棉毛巾——构图对齐首页图 |

**参考图**（`scripts/geo/materials/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）：

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 三点弯曲 / 桥梁承重的课堂装置 | Wikimedia Commons "Three-point flexural test"、"Bending test" | CC，逐张核 | 支撑、加载点、条的弯曲形状 |
| R2 | 台钳 / G 形夹夹住尺子 | Commons "G-clamps"、"Rulers" | 同上 | 夹的比例、尺子伸出 |
| R3 | 槽码与砝码托 | Commons "Slotted weights" | 同上 | 槽口、托杆 |
| R4 | 退火玻璃、瓷砖的断口 | Commons "Conchoidal fracture"、"Broken tile" | 同上 | 断口形状（只画两段） |
| R5 | 滴管、水珠在不同表面上 | Commons "Pipettes"、"Water droplets on surface" | 同上 | 滴管比例、水珠的接触角 |
| R6 | 外开窗与铆钉 | BCA / HDB 公开的外开窗示意图（只看，版权）；Commons "Casement window" | 只看 / CC | 铰链、摩擦撑杆、铆钉的位置 |
| R7 | 塑胶水瓶 | Commons "PET bottles"（无标签的） | CC | 加强筋、瓶肩、瓶盖 |
| R8 | 首页图 `art/planned/materials/materials.png` | 本 repo（Codex 草稿，已审） | 自有 | 厨房角落的构图与物件 |

### 3.4 零件（67 个 + 3 个 context）

材质族见 docs/06；`shell` = X-RAY 时变透明。"同时只显示一件"的零件由 `visible` 绑定控制（§4.2），所以全景里每个工位只画一根条 / 一样东西。坐标是 R2 起点。

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | shell | sim 绑定 / 姿态 | 参考 |
|---|---|---|---|---|---|---|---|
| 01 | `bridge-blocks` Support blocks / 支撑木块 | strength-rig | `bevelBox` 0.06³ ×2（extra，中心距 0.20） | `wood` | | | R1 |
| 02–08 | `bridge-wood` / `bridge-metal` / `bridge-ceramic` / `bridge-rubber` / `bridge-glass` / `bridge-plastic` / `bridge-fabric` 七根条 / 木条…布条 | strength-rig | `box` 0.30 × 0.002 × 0.03（`bend` 需要沿长度细分，引擎生成） | 木 `wood`；钢 `steel`；陶瓷 `enamel` 白；橡胶 `rubber` 深灰；玻璃 `glass` 浅绿边 tint；塑胶 `plastic` 乳白 tint；布 `fabric` 本白 | 玻璃 ✓ | `visible` ← `bridge-view` = 本材料；`bend` ← `bridge-sag`（`mode: bridge`，`span: 0.20`） | R1 |
| 09 | `bridge-glass-snapped` Snapped glass strip / 断开的玻璃条 | strength-rig | 两段 `box`（各 0.15 长，extra），一段平在左支撑上并斜向台面、一段斜落在台面上；断口一小片不规则 `extrude` | `glass` | ✓ | `visible` ← `bridge-view` = `glass-snapped` | R4 |
| 10 | `bridge-ceramic-snapped` Snapped ceramic strip / 断开的陶瓷条 | strength-rig | 同 09 | `enamel` + `abrasive`（断面坯色） | | `visible` ← `bridge-view` = `ceramic-snapped` | R4 |
| 11 | `bridge-hanger` Mass carrier / 砝码托 | strength-rig | `lathe` 小圆盘 + 托杆，坐在条的中点 | `steel` | | `offset` ← `bridge-sag`（向下，`per: 1`）；姿态 `masses-fallen` ← `bridge-view` | R3 |
| 11b | `bridge-masses` Masses / 槽码 | strength-rig | 500 g 槽码（`lathe` 带槽口）`repeat` 5，沿 Y 叠在托杆上；**不写 extra**（`count` 绑定的要求，docs/06），槽口同向 | `brass` | | `count` ← `masses`（`per: 1`）；`offset` ← `bridge-sag`（同托）；姿态 `masses-fallen` ← `bridge-view` | R3 |
| 12 | `bend-clamp` Clamp block / 夹座 | bend-rig | `bevelBox` 0.08 × 0.15 × 0.08 + G 形夹（`sweep` + 螺杆 `lathe`） | `wood` + `steel` | | | R2 |
| 13–19 | `bend-wood` … `bend-fabric` 七根条 | bend-rig | 同 02–08 | 同 02–08 | 玻璃 ✓ | `visible` ← `bend-view` = 本材料；`bend` ← `flex-tip`（`mode: cantilever`，夹口在条的局部 x −0.10，伸出 0.25） | R2 |
| 20 | `bend-glass-snapped` / 断开的玻璃条 | bend-rig | 夹口里留一段 5 cm + 掉在台面上的一段 25 cm（extra） | `glass` | ✓ | `visible` ← `bend-view` = `glass-snapped` | R4 |
| 21 | `bend-ceramic-snapped` / 断开的陶瓷条 | bend-rig | 同 20 | `enamel` + `abrasive` | | `visible` ← `bend-view` = `ceramic-snapped` | R4 |
| 22 | `push-stand` Push stand / 推杆架 | bend-rig | 底座 `bevelBox` + 竖杆 `lathe` 0.18 高；extra：刻度线（`repeat` 细 `box`，每 0.5 cm 一条，1 cm 处长，无数字） | `powder` + `steel` | | | — |
| 23 | `push-peg` Push peg / 推杆头 | bend-rig | 滑块 `bevelBox` + 向前伸的压头 `capsule` | `plastic` 深 tint + `rubber` | | `offset` ← `push`（向下，`per: 0.01`） | — |
| 24 | `tank` Water tank / 水缸 | float-tank | `box` 薄板拼成的开口缸（5 块，extra） | `glass` | ✓ | | — |
| 25 | `tank-water` Water / 水 | float-tank | `box` 0.39 × 0.18 × 0.24（静态） | `membrane` 水 `#6c919a` | | | — |
| 26–34 | `float-wood` / `float-wood-big` / `float-metal` / `float-ceramic` / `float-rubber` / `float-glass` / `float-plastic` / `float-bottle` / `float-fabric` 放进水里的东西 | float-tank | 方块 `bevelBox` 0.06 × 0.03 × 0.06；大木板 0.24 × 0.06 × 0.10；空瓶 `lathe`（瓶身加强筋、瓶肩、瓶盖 extra），横躺；布 = 叠成的 `bevelBox` 0.06 × 0.01 × 0.06 + 一片 `wing` 翻起的布角 | 同 02–08；空瓶 `glass` 浅 tint（PET 透明的读法同玻璃）+ `plastic` 瓶盖 | 空瓶 ✓ | `visible` ← `block` = 本选项；`offset` ← `float-rise`（向上，`per: 0.01`，原点 = 缸底） | R7 |
| 35 | `drop-stand` Dropper stand / 滴管架 | drop-tray | 样片座 `bevelBox` 0.12 × 0.02 × 0.12 + 立杆与横臂 + 滴管（玻璃管 `lathe` + 橡胶头 `lathe`） | `wood` + `steel` + `glass` + `rubber` | | | R5 |
| 36–42 | `square-wood` … `square-fabric` 七块样片 | drop-tray | `box` 0.08 × 0.002 × 0.08（布：`wing` 单层，四边毛边 extra） | 同 02–08 | 玻璃 ✓ | `visible` ← `square` = 本材料 | — |
| 43 | `water-bead` Water drop / 水珠 | drop-tray | `sphere` 半径 0.004，`scale` y 0.6（半球形贴在样片上） | `glass` 水色 tint | | `visible` ← `drop-result` = `stays-on-top` | R5 |
| 44 | `wet-patch` Damp patch / 湿印 | drop-tray | 一片不规则的薄 `extrude`（半径约 0.015，厚 0.3 mm）贴在样片上 | `membrane` 深 tint（固定的深色 hex，同 docs/36 §9.2 湿沙的做法，不用 `token:ink-*`） | | `visible` ← `drop-result` = `soaks-in` | — |
| 45 | `torch` Torch / 手电筒 | light-bench | 同 `light-and-shadows` 的手电筒（`lathe` 筒身 + 灯头 + 开关）+ 小支架 | `powder` + `glass` | | `glow`（常亮，`token:lamp`） | — |
| 46 | `sheet-holder` Sample holder / 样片夹 | light-bench | 底座 + 两片夹板 | `wood` + `steel` | | | — |
| 47 | `screen` White screen / 白屏 | light-bench | `bevelBox` 0.30 × 0.22 × 0.005 + 支脚 | `enamel` 白 | | | — |
| 48–54 | `sheet-wood` … `sheet-fabric` 七块样片 | light-bench | 同 36–42，竖着夹在样片夹里 | 同 36–42 | 玻璃 ✓ | `visible` ← `square` = 本材料；`shadow-cast` 的挡光物（`dark` ← `light-dark`） | — |
| 55 | `wall-cabinet` Wall cabinet / 壁柜 | corner-wood | 柜体（`bevelBox` 薄板拼）+ 中层板 + 开着的门（绕铰链转 100°） | `wood` | | | R8 |
| 56 | `cabinet-hinges` Hinges / 铰链 | corner-metal | 两只杯形铰链（小 `lathe` + `bevelBox`） | `stainless` | | | R8 |
| 57 | `saucepan` Saucepan / 锅 | corner-metal | `lathe` 锅身 + 锅盖 + 柄（`sweep`） | `stainless` | | | R8 |
| 58 | `window-frame` Window frame / 窗框 | corner-metal | 外框与窗扇框（`extrude` 型材截面 `sweep`）+ 摩擦撑杆 | `casing` 铝 | | | R6 |
| 59 | `window-rivets` Rivets / 铆钉 | corner-metal | 撑杆两端各 2 颗圆头铆钉（`lathe` 小圆头，`repeat` 4） | `stainless` | | 第 06 章第 3 拍特写 | R6 |
| 60 | `bowl` Bowl / 碗 | corner-ceramic | `lathe` 碗 + 圈足 | `enamel` 暖白（上釉） | | | R8 |
| 61 | `wall-tiles` Wall tiles / 墙砖 | corner-ceramic | `box` 墙面一片 + 砖缝（`repeat` 细 `box`） | `enamel` 浅 tint | | | — |
| 62 | `box-seal` Rubber seal / 密封圈 | corner-rubber | `torus` 拉成圆角矩形（`sweep` 闭合路径） | `rubber` 深灰 | | | R8 |
| 63 | `window-pane` Window glass / 窗玻璃 | corner-glass | `box` 0.50 × 0.90 × 0.005（装在窗扇框里） | `glass` | ✓ | | R6 |
| 64 | `tumbler` Glass / 玻璃杯 | corner-glass | `lathe` 直筒杯，杯身八道浅棱（`segments: 8` 的外轮廓） | `glass` | ✓ | | R8 |
| 65 | `food-box` Food box / 保鲜盒 | corner-plastic | 盒身 `bevelBox` 圆角 + 盖子 + 四个扣（extra） | `plastic` 乳白半透 tint | ✓ | | R8 |
| 66 | `tea-towel` Tea towel / 毛巾 | corner-fabric | 搭在台边的一块布：两片 `wing`（台面上一片、垂下一片）+ 两道条纹（tint 的 extra） | `fabric` 本白 + 浅灰条纹 | | | R8 |
| c1 | `bench` Science bench / 实验台 | — | `bevelBox` 2.4 × 0.04 × 0.7 + 四条腿 | `wood` 浅 | | `clip: false` | |
| c2 | `counter` Kitchen counter / 厨房台面 | — | 台面 + 下柜（`bevelBox`） | `enamel` 浅灰（台面）+ `wood`（柜门） | | `clip: false` | |
| c3 | `corner-wall` Wall and floor / 墙与地面 | — | 后墙（窗洞挖空：`extrude` 带 `holes`）+ 地面一块 | `enamel` 墙色 | | | |

- **零件数**：67 件（编号 01–66 已把每根条、每块样片各算一件，另加 11b）+ 3 个 context；透光台的光斑与影子由 `shadow-cast` 画，不是零件。和 `states-of-matter`（68 + 4）同一量级。**零件数理由**：每种材料在每个工位单独一件（材质族不同，`tint` 换不了木纹、玻璃、织物；每件各有自己的 `visible` 与标注）；断开的条单独一件（两段的形状和完整的条不同）。**合并 / 删减顺序**（超预算时）：`cabinet-hinges` 并进 `wall-cabinet` 的 extra（LAYERS 金属组少一件）→ `wall-tiles` 删去（墙改成纯色）→ `push-stand` 的刻度并进竖杆的 extra → 第 02 章断开的条改用第 01 章的同一件（姿态挪到夹座旁，两章共用 2 件）。
- **绘制预算**（§8.2 验收）：全景（hero，五个工位 + 厨房角落）静止 ≤ 70 calls、上限 100；**各章 ≤ 45**；三角形 < 0.3 M。估算：每个工位同时只画一样样品（1–3 槽）+ 器材 3–8 槽；厨房角落约 18 槽；context 4；`shadow-cast` 3（样片 + 光斑 + 支架）。
- 默认不隐藏零件（第 00 章是完整外观）；"只显示所选的那一件"由 `visible` 绑定做，不是章节 `hide`。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么，≤ 60 字符） | detail 要点（怎样做到 · 来源 · 常见误解） |
|---|---|---|
| `bridge-blocks` | Hold each strip up with the same gap. / 用同样的间距把每根条架起来。 | 跨距 20 cm、高 6 cm（DESIGN）；公平测试的"不变" |
| `bridge-*`（七根） | 〔材料〕 strip, 30 × 3 cm, 2 mm thick. / 〔材料〕条，30 × 3 厘米，2 毫米厚。 | 具体样品（柚木、钢、上釉瓷砖、纯天然橡胶、窗玻璃、HDPE、棉布，D5）；在强度测试里的结果（§2.5 T1，只写状态） |
| `bridge-glass-snapped` / `bridge-ceramic-snapped` | Snapped: brittle, it hardly bent first. / 断了：它脆，断之前几乎没弯。 | F-5、F-6；断口的样子是示意；安全一句（F-30） |
| `bridge-hanger` / `bridge-masses` | 500 g masses, added one at a time. / 500 克的槽码，一个一个加。 | 每次用一根新的条（S1）；托的质量不计 |
| `bend-clamp` | Holds one end; 25 cm sticks out. / 夹住一端，伸出 25 厘米。 | 公平测试的"不变" |
| `push-peg` | Pushes the free end down. / 把伸出的一端往下压。 | 0–2 cm，每 0.5 cm 一档；末端要多大的力不显示（S1） |
| `bend-*`（七根） | Same strips as the strength test. / 和强度测试是同一套条。 | 结果（§2.5 T2）；薄与厚（F-4） |
| `tank` / `tank-water` | Fresh water, 18 cm deep, for every test. / 每次都是同一缸清水，18 厘米深。 | 海水另当别论（F-15，细看一句） |
| `float-wood-big` | Much bigger, same wood: still floats. / 大得多，同一种木：照样浮。 | M-1 |
| `float-bottle` | Capped and empty: it floats high. / 盖好的空瓶：浮得很高。 | 瓶身的塑胶本身比水重（F-16、F-21）；浮是因为里面的空气（M-3） |
| `float-rubber` | This rubber floats, low in the water. / 这种橡胶浮，大部分在水里。 | 纯胶；硬橡胶、很多橡皮擦沉（F-22，§0.1-3） |
| `float-fabric` | Soaks up water, then sinks. / 吸了水，就沉下去。 | 刚放进去会浮一会儿（布里有空气）（F-23；F-11b 待核） |
| `drop-stand` | Same dropper, same drop, same height. / 同一支滴管、同样一滴、同样高度。 | 公平测试的"不变" |
| `water-bead` | Stays on top: not absorbed. / 停在上面：没有被吸进去。 | 样片是湿的，但它不吸水（M-10） |
| `wet-patch` | Soaked in: the material absorbs water. / 吸进去了：这种材料吸水。 | 布、没上漆的木（F-8、F-14，M-7） |
| `torch` / `screen` | Same torch, same distances, every time. / 同一支手电筒、同样的距离。 | 20 cm + 10 cm（同 `light-and-shadows` 第 03 章） |
| `sheet-*`（七块） | 〔材料〕 sample, 8 × 8 cm. / 〔材料〕样片，8 × 8 厘米。 | 透光三档（§2.5 T5） |
| `window-pane` | Lets most light in; keeps rain out. / 让大部分光进来，挡住雨水。 | F-28、F-32 |
| `window-rivets` | Stainless steel: stays strong for years. / 不锈钢：多年都结实。 | F-29（BCA 2004 起的规定）；铝铆钉锈蚀变弱 |
| `window-frame` | A light metal frame holds the glass. / 轻的金属框夹住玻璃。 | 铝（只说"金属"，不写铝合金型号） |
| `wall-cabinet` | Wood: strong enough to hold the dishes. / 木：够强，托得住碗碟。 | 推断（F-8 的强度）；标"示意" |
| `saucepan` | Metal: waterproof and strong. / 金属：防水、结实。 | F-33（RSC 工作纸的水槽一行，标通用） |
| `bowl` / `wall-tiles` | Glazed ceramic: does not absorb water. / 上釉的陶瓷：不吸水。 | F-25、F-33 |
| `tumbler` | Glass: you can see the drink inside. / 玻璃：看得见杯里的饮料。 | 透光（F-28） |
| `food-box` | Plastic: waterproof, and it does not shatter. / 塑胶：防水，摔了也不碎。 | "不碎"= 强度测试里塑胶没断（§2.5）；标推断 |
| `box-seal` | Rubber seal: it bends to fit the lid. / 橡胶圈：能弯，贴紧盒盖。 | F-34（推断） |
| `tea-towel` | Cotton fabric: soaks up water. / 棉布：吸水。 | F-33（布做拖把）、F-27 |

### 3.6 流

无。（水、光、"吸进去"都由零件、`shadow-cast` 与绑定表示；不画水流和光线粒子。）

### 3.7 动画与姿态

**动画**：无。

**姿态**（`poses`，≤ 32）：

| 名 | 零件 | 变换 | 用在 |
|---|---|---|---|
| `masses-fallen` | `bridge-hanger`、`bridge-masses` | 下移到台面（托底着台，略倾 8°），`offset` 绑定在断开时为 0 | `bridge-view` = `glass-snapped` / `ceramic-snapped` |
| `rivet-close`（可选） | — | 不建姿态：第 06 章第 3 拍用拍内镜头特写 | — |

### 3.8 HUD 数据

- **标题**：EN "Materials Around Us" / ZH "身边的材料"；副标题 EN "Seven materials, five fair tests: strength, flexibility, floating, waterproof and letting light through" / ZH "七种材料、五个公平测试：强度、柔韧、浮沉、防水、透光"；`shortTitle` EN "Materials" / ZH "材料"；`moe`：`["MOE 2023 Science P3 Diversity of Materials"]`；`tags: [singapore, psle, p3, space]`；`illustration: materials`；`subject: science`。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Samples / 样品 | `7 MATERIALS · SAME SIZE IN EACH TEST` / `7 种材料 · 每个测试大小相同` | design |
| Strips / 材料条 | `30 × 3 CM · 2 MM THICK` / `30 × 3 厘米 · 2 毫米厚` | design |
| Masses / 砝码 | `5 × 500 G` / `5 个 500 克` | design |
| Tank / 水缸 | `FRESH WATER · 18 CM DEEP` / `清水 · 18 厘米深` | design |

- **telemetry**（≤ 6；只有器材的量，D9；`scope: "observe"` 的行只在本章卡片观察它时有数，否则 `—`）：

| key EN / ZH | follow | unit | decimals | scope |
|---|---|---|---|---|
| Masses on the strip / 条上的砝码 | `masses-on` | kg | 1 | — |
| End pushed down / 末端压下 | `push-down` | cm | 1 | — |

  块尾 `SIM <本章观察的状态> · <本章改变量的值>`（如 `SIM SNAPPED · GLASS`、`SIM FLOATS · WOOD`；状态的大写标签由输出的 `states` 给）。
- **镜头预设**（≤ 6，不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `strength-view` | STRENGTH | 强度架正前略俯，条、砝码、两块木块与台面同框（01、06 第 5 拍） |
| 2 | `bend-view` | BEND | 柔韧架正侧（−Z 看 +Z 的反方向：从台前看），条的弯曲轮廓与推杆刻度最清楚（02） |
| 3 | `tank-view` | TANK | 水缸正前、视线与水面同高略高，看得见浮着的东西被水面切过（03） |
| 4 | `drops-view` | DROPS | 样片座 3/4 前、低角度，看得见水珠的半球形或湿印（04） |
| 5 | `light-view` | LIGHT | 透光台 3/4 后侧，屏上的光斑与影子正对镜头（05） |
| 6 | `corner-view` | KITCHEN | 厨房角落 3/4 前，窗、壁柜、台面同框，构图对齐首页图（00、06） |

  hero 用 `views.assembled.camera`：整台 3/4 前右上、约 3.0 m 外，厨房角落在左后方边缘；`views.cover` = hero 略拉近、只开五个工位组。
- `views.section.plane: "xy"`（PLATE 立面画正视图：条的弯曲、水缸里的浮沉最清楚）。不设剖切面（水缸、玻璃件是 `shell`）。
- `views.shadows: "contact"`（主光不投影，只留地面接触阴影；透光台的影子只由 `shadow-cast` 画，同 docs/35 D4）。
- **模式组合**：X-RAY（玻璃、水缸透明：看缸底沉着的东西）；EXPLODED（各工位的东西向上拆开 0.04–0.08 m，水、条、样片 `explode.dist` 0）；hide + EXPLODED 照常；REFERENCE 冻结 sim。

---

## 4. 引擎

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 强度：受力而不断 | 一个个加槽码：条往下弯，钢几乎不动、木弯一点、塑胶和橡胶弯到台面；玻璃、陶瓷突然变成两段，槽码落到台面 | **E-MT1** `bridge` → **E-MT2 `bend`**（`mode: bridge`）+ `visible`、`count`、`offset`、`pose`（已有） |
| 柔韧性：能弯而不断 | 推杆一档档压下末端：条跟着弯；玻璃、陶瓷断成两段；塑胶、橡胶、布本来就垂着 | E-MT1 `cantilever` → E-MT2 `bend`（`mode: cantilever`）+ `visible`、`offset`（已有） |
| 浮 / 沉 | 东西放进水缸：浮的停在水面（浸入的深度按材料不同），沉的落到缸底 | E-MT1 `tank` → `visible`、`offset`（已有） |
| 防水：不吸水 | 滴一滴水：停成半球形水珠，或吸进去成一片湿印 | E-MT1 `drops` → `visible`（已有） |
| 透光：大部分 / 一部分 / 没有 | 屏上手电筒的光斑里，样片的影子浅、较深或全黑 | E-MT1 `light` → `shadow-cast` 的 `dark`（已有，docs/35 E-L2） |
| 用途与性质 | 五个结果同时读出，一张表 | E-MT1 `profile`（复用上面五个子模型） |

### 4.2 模型 `materials`（E-MT1；`lib/sim/materials.ts`，纯函数，有单测）

全部同步、确定、< 0.05 ms；只在控件值变化时算。六个子模型各自可选，数据里没写的子模型不提供它的量（同 `force`、`matter`）。模型内部全精度；**所有给卡片、表、PLATE 的输出都是状态或器材的量**（D9），数输出只给绑定。

```jsonc
"sim": {
  "kind": "materials",
  "controls": [
    { "id": "strip", "kind": "choice", "default": "wood", "label": { "en": "Strip", "zh": "材料条" },
      "options": [ { "id": "wood", … }, { "id": "metal", … }, { "id": "ceramic", … }, { "id": "rubber", … }, { "id": "glass", … }, { "id": "plastic", … }, { "id": "fabric", … } ] },
    { "id": "masses", "kind": "step", "values": [0, 1, 2, 3, 4, 5], "default": 0, "label": { "en": "500 g masses on the strip", "zh": "条上的 500 克槽码" } },
    { "id": "push", "kind": "step", "values": [0, 0.5, 1, 1.5, 2], "default": 0, "unit": "cm", "label": { "en": "End pushed down", "zh": "末端压下" } },
    { "id": "block", "kind": "choice", "default": "wood", "label": { "en": "Put into the water", "zh": "放进水里的" },
      "options": [ "wood", "wood-big", "metal", "ceramic", "rubber", "glass", "plastic", "bottle", "fabric" ] },   // 每项 { id, label }
    { "id": "square", "kind": "choice", "default": "plastic", "label": { "en": "Sample", "zh": "样片" }, "options": [ 七种 ] },
    { "id": "pick", "kind": "choice", "default": "wood", "label": { "en": "Material", "zh": "材料" }, "options": [ 七种 ] }
  ],
  "outputs": [
    { "id": "strength-result", "kind": "state", "from": "bridge:result", "states": { "holds": {…}, "on-bench": {…}, "snapped": {…} } },
    { "id": "strength-bend",   "kind": "state", "from": "bridge:bend",   "states": { "hardly": {…}, "a-little": {…}, "a-lot": {…}, "none": {…} } },   // none：断了
    { "id": "bridge-view",     "kind": "state", "from": "bridge:view",   "states": { "wood": {…}, …七种…, "glass-snapped": {…}, "ceramic-snapped": {…} } },
    { "id": "bridge-sag",      "from": "bridge:sag", "unit": "m" },                         // 只给 bend / offset
    { "id": "masses-on",       "from": "control:masses-kg", "unit": "kg", "decimals": 1 },  // 器材的量：个数 × 0.5
    { "id": "flex-result",     "kind": "state", "from": "cantilever:result", "states": { "not-pushed": {…}, "bends": {…}, "droops": {…}, "snapped": {…} } },
    { "id": "bend-view",       "kind": "state", "from": "cantilever:view", "states": { 同 bridge-view } },
    { "id": "flex-tip",        "from": "cantilever:tip", "unit": "m" },
    { "id": "push-down",       "from": "control:push", "unit": "cm", "decimals": 1 },
    { "id": "float-result",    "kind": "state", "from": "tank:result", "states": { "floats": {…}, "sinks": {…} } },
    { "id": "float-rise",      "from": "tank:rise", "unit": "cm" },
    { "id": "drop-result",     "kind": "state", "from": "drops:result", "states": { "stays-on-top": {…}, "soaks-in": {…} } },
    { "id": "light-result",    "kind": "state", "from": "light:result", "states": { "most": {…}, "some": {…}, "none": {…} } },
    { "id": "light-dark",      "from": "light:dark" },                                      // 0–1，给 shadow-cast
    { "id": "p-strength", "kind": "state", "from": "profile:strength", "states": { 同 strength-result } },
    { "id": "p-flex",     "kind": "state", "from": "profile:flex",     "states": { "bends": {…}, "droops": {…}, "snapped": {…} } },
    { "id": "p-float",    "kind": "state", "from": "profile:float",    "states": { 同 float-result } },
    { "id": "p-water",    "kind": "state", "from": "profile:water",    "states": { 同 drop-result } },
    { "id": "p-light",    "kind": "state", "from": "profile:light",    "states": { 同 light-result } }
  ],
  "bind": [
    { "output": "bridge-view", "part": "bridge-wood", "visible": { "eq": "wood" } }, …（七根 + 两根断开的）,
    { "output": "bridge-sag", "part": ["bridge-wood", …七根], "bend": { "mode": "bridge", "axis": [1, 0, 0], "span": 0.20, "per": 1, "ease": 0.5 } },
    { "control": "masses", "part": "bridge-masses", "count": { "per": 1 } },
    { "output": "bridge-sag", "part": ["bridge-hanger", "bridge-masses"], "offset": { "axis": [0, -1, 0], "per": 1, "origin": 0 } },
    { "output": "bridge-view", "part": ["bridge-hanger", "bridge-masses"], "pose": { "glass-snapped": "masses-fallen", "ceramic-snapped": "masses-fallen" } },
    { "output": "bend-view", "part": "bend-wood", "visible": { "eq": "wood" } }, …（七根 + 两根断开的）,
    { "output": "flex-tip", "part": ["bend-wood", …七根], "bend": { "mode": "cantilever", "axis": [1, 0, 0], "clamp": -0.10, "reach": 0.25, "per": 1, "ease": 0.5 } },
    { "control": "push", "part": "push-peg", "offset": { "axis": [0, -1, 0], "per": 0.01, "origin": 0 } },
    { "control": "block", "part": "float-wood", "visible": { "eq": "wood" } }, …（九件）,
    { "output": "float-rise", "part": ["float-wood", …九件], "offset": { "axis": [0, 1, 0], "per": 0.01, "origin": 0 } },
    { "control": "square", "part": "square-wood", "visible": { "eq": "wood" } }, …（七块）,
    { "output": "drop-result", "part": "water-bead", "visible": { "eq": "stays-on-top" } },
    { "output": "drop-result", "part": "wet-patch", "visible": { "eq": "soaks-in" } },
    { "control": "square", "part": "sheet-wood", "visible": { "eq": "wood" } }, …（七块）
  ],
  "overlays": [
    { "kind": "shadow-cast",
      "source": { "part": "torch", "point": [0.72, 0.10, 0.0], "axis": [1, 0, 0], "beam": 30 },
      "receiver": { "part": "screen", "normal": [-1, 0, 0], "size": [0.30, 0.22] },
      "casters": [ { "part": "sheet-holder" },
                   { "part": "sheet-wood", "dark": { "output": "light-dark" } }, …（七块都写同一个 dark） ],
      "spot": { "color": "token:en-light" } }
  ],
  "materials": {
    "g": 9.8,
    "samples": {                                            // E：GPa；limit：MPa；density：kg/m³
      "wood":    { "E": 10.7, "limit": 100.7, "fails": "snaps", "density": 650,  "absorbs": true,  "light": "none" },
      "metal":   { "E": 200,  "limit": 250,   "fails": "bends", "density": 7820, "absorbs": false, "light": "none" },
      "ceramic": { "E": 70,   "limit": 35,    "fails": "snaps", "density": 2400, "absorbs": false, "light": "none" },
      "rubber":  { "E": 0.05,                 "fails": "never", "density": 920,  "absorbs": false, "light": "none" },
      "glass":   { "E": 70,   "limit": 45,    "fails": "snaps", "density": 2500, "absorbs": false, "light": "most" },
      "plastic": { "E": 0.8,  "limit": 27.6,  "fails": "bends", "density": 955,  "absorbs": false, "light": "some" },
      "fabric":  { "limp": true,              "fails": "never", "density": 1540, "absorbs": true,  "light": "some" }
    },
    "strip":      { "width": 0.03, "thick": 0.002 },
    "bridge":     { "strip": "strip", "masses": "masses", "mass": 0.5, "span": 0.20, "clearance": 0.06, "bend": { "little": 0.005, "lot": 0.03 } },
    "cantilever": { "strip": "strip", "push": "push", "reach": 0.25, "droop": 0.01, "hang": 0.8 },
    "tank":       { "block": "block", "water": 18,
                    "blocks": { "wood": { "sample": "wood", "height": 3 }, "wood-big": { "sample": "wood", "height": 6 },
                                "metal": { "sample": "metal", "height": 3 }, "ceramic": { "sample": "ceramic", "height": 3 },
                                "rubber": { "sample": "rubber", "height": 3 }, "glass": { "sample": "glass", "height": 3 },
                                "plastic": { "sample": "plastic", "height": 3 }, "bottle": { "density": 40, "height": 6.5 },
                                "fabric": { "sample": "fabric", "height": 1 } } },
    "drops":      { "square": "square" },
    "light":      { "square": "square", "dark": { "most": 0.10, "some": 0.60, "none": 1 } },
    "profile":    { "pick": "pick", "masses": 5, "push": 2, "block": "same", "square": "same" }   // same：选项 id = 材料 id
  }
}
```

绑定共约 52 条（≤ 64）：强度架 14、柔韧架 11、水缸 10、防水 9、透光 7。

**规则**（单位：长度 m，E GPa → ×10⁹，limit MPa → ×10⁶）：

1. **样品**：`samples` 的键 = 材料 id；`limp: true` 的不写 `E`，其余必须写；`fails: snaps` 必须写 `limit`；`fails: bends` 写 `limit` 时表示屈服（validate 保证任何控件组合下都不会达到，见 §4.4）；`fails: never` 不写 `limit`。自重 w = density × g × width × thick（N/m）；I = width × thick³ ÷ 12；Z = width × thick² ÷ 6。
2. **两端架起**（`bridge`）：P = masses × mass × g。`limp` → `result` = `on-bench`、`sag` = clearance、`bend` = `a-lot`、`view` = 材料 id。否则 δ = P span³ ÷ (48 E I) + 5 w span⁴ ÷ (384 E I)；σ = (P span ÷ 4 + w span² ÷ 8) ÷ Z。`snaps` 且 σ > limit → `result` = `snapped`、`sag` = 0、`bend` = `none`、`view` = `<id>-snapped`；否则 δ ≥ clearance → `on-bench`、`sag` = clearance、`bend` = `a-lot`；否则 `holds`、`sag` = δ、`bend` = `hardly`（< little）/ `a-little`（< lot）/ `a-lot`。量 `control:masses-kg` = masses × mass。
3. **一端夹住**（`cantilever`）：δ₀ = w reach⁴ ÷ (8 E I)（`limp` → ∞）；tip = min(max(push ÷ 100, δ₀), hang × reach)；σ = 3 E thick × (push ÷ 100) ÷ (2 reach²)。`snaps` 且 σ > limit → `snapped`、`tip` = 0、`view` = `<id>-snapped`；否则 δ₀ ≥ droop → `droops`；否则 push = 0 → `not-pushed`；否则 `bends`。
4. **水缸**（`tank`，cm）：ρ = 选项的 `density` 或其 `sample` 的 density；ρ < 1000 → `floats`、`rise` = water − ρ ÷ 1000 × height；否则 `sinks`、`rise` = 0。
5. **滴水**（`drops`）：`result` = 所选样片材料的 `absorbs` ? `soaks-in` : `stays-on-top`。
6. **透光**（`light`）：`result` = 所选材料的 `light`；`dark` = `light.dark[result]`。
7. **五个一起**（`profile`）：对 `pick` 的材料，用规则 2（masses 取 `profile.masses`）、3（push 取 `profile.push`）、4（`block` = 同 id 的选项）、5、6 各算一次；`flex` 的 `not-pushed` 不会出现（push > 0）。
8. **量**（输出的 `from`）：`bridge:{result,bend,view,sag}`、`cantilever:{result,view,tip}`、`tank:{result,rise}`、`drops:result`、`light:{result,dark}`、`profile:{strength,flex,float,water,light}`、`control:<控件>`、`control:masses-kg`。
9. `SEPARATE_EXPERIMENTS['materials'] = true`（同 `force`、`matter`、`light`：几套实验互不相干，PLATE 块尾只写本章卡片的状态）。

### 4.3 设计守门（数据层的物理检查，`pnpm validate` 报 error）

- `fails: bends` 的材料在**所有** `masses` × `push` 取值下 σ < limit（"会永久弯"模型不画，所以不允许发生）：HDPE 弯到台面前 σ 最大 ≈ 14.4 MPa < 27.6；钢在 5 个槽码时 ≈ 62 MPa、压下 2 cm 时 192 MPa < 250（§2.5）。
- `fails: snaps` 的材料：不要求一定断（木不断）；但状态表里出现的 `snapped` 必须真的有组合会给出。
- 浮着的东西露出水面的高度 ≥ 0、浸入深度 ≤ height；`water` < 缸高。
- `profile.masses`、`profile.push` 是对应控件的合法值。

### 4.4 validate（`sim-schema.ts` 里的 `materialsIssues`，或照 `matter-schema.ts` 的做法独立成 `materials-schema.ts`）

- 引用的控件存在且种类对：`strip`、`block`、`square`、`pick` 是选择；`masses`、`push` 是步进。
- `strip`、`square`、`pick` 的选项 = `samples` 的键（多了、少了都报）；`block` 的每个选项在 `tank.blocks` 里、`sample` 存在、没有 `sample` 的写了 `density`。
- 每个样品：`limp` 与 `E` 二选一；`snaps` 要 `limit`；`light` ∈ {most, some, none}；`light.dark` 三个键齐全、值 ∈ [0, 1]、`most` < `some` < `none`。
- §4.3 的设计守门。
- 输出的 `from` 是本模型的量、种类对得上；状态输出给每个可能状态写标签、不写永远不会出现的状态（`view` 的 `<id>-snapped` 只对会断的材料写）。
- `bend` 绑定的校验见 §4.5。

### 4.5 弯曲绑定 `bend`（E-MT2；`lib/bend.ts` 纯函数 + `stages/model3d/PartNode.tsx`）

```jsonc
{ "output": "bridge-sag", "part": ["bridge-wood", …], "bend": { "mode": "bridge", "axis": [1, 0, 0], "span": 0.20, "per": 1, "ease"?: 0.5 } }
{ "output": "flex-tip",   "part": ["bend-wood", …],   "bend": { "mode": "cantilever", "axis": [1, 0, 0], "clamp": -0.10, "reach": 0.25, "per": 1, "ease"?: 0.5 } }
```

- **零件**：主 primitive 是 `box` 或 `bevelBox`，长轴 = 零件局部 `axis`（只支持 ±X、±Z），中心在原点；不能有 `repeat`；extra 可以有，但只弯主 primitive（布的毛边 extra 不弯——本主题的条不写 extra）。引擎为 `bend` 零件把主 primitive 沿长轴细分成 ≥ 64 段（`shaped.ts` 的 box 构建加一个可选的分段数）。
- **值**：数输出或步进控件，× `per` = 弯的大小（场景单位）：`bridge` = 中点下垂、`cantilever` = 末端下垂；值 ≤ 0 → 直的。
- **形状**（纯函数 `bendCurve(mode, value, …)`，有单测）：`bridge`：两个支点在 ±span/2，跨中按集中力简支梁的挠度形状 f(a) = a(3L² − 4a²) ÷ L³（a ≤ L/2，对称），支点外的悬挑段沿支点处的切线直出（两端翘起，和图 `materials-flexible-ruler` 一致）。`cantilever`：`clamp` 之前（夹在座里的部分）不动；之后 reach 长的一段按悬臂端部集中力的形状 g(x) = x²(3L − x) ÷ (2L³)。两种都**按弧长保持条的长度**：由小挠度形状的斜率求每一段的转角，沿弧长积分出新的中轴线（大挠度时不会把条"拉长"），截面跟着转（法线一起转）；值超过 0.8 × 跨距 / 伸出长度时夹住（布、橡胶的垂挂）。
- **画**：CPU 改写顶点位置与法线（同 `lib/stretch.ts` 的做法：载入时存每个顶点沿长轴的参数，运行时只写位置缓冲，不新建几何）；缓动按值、`ease` 秒（默认 0.5）三次缓入缓出；深链接、截图、拍的瞬切、`prefers-reduced-motion`、REFERENCE = 直接终值。
- **一起走的零件**：`bridge-hanger`、`bridge-masses` 用同一个输出的 `offset`（向下，per 1），与条的中点同步（单测：托底到条顶面的距离 < 1 mm）；`push-peg` 用控件 `push` 的 `offset`，压头碰到条末端（单测：`push` > 自垂时，压头到条末端 < 1 mm）。
- **剖切与 X-RAY**：照常（玻璃条是 `shell`）。
- **测试 API**：`__atlas.engine.bend(partId)` → `{ value, mid: [x, y, z], tip: [x, y, z], length }`（此刻舞台上的中点 / 末端世界坐标、弯后的中轴长度）；`pnpm shoot --beats` 每拍核对：可见的条 `value` = 模型输出 ± 0.5 mm、`length` = 原长 ± 0.5 %。
- **validate**：零件存在、主 primitive 是 `box` / `bevelBox`、无 `repeat`；`axis` 是 ±X / ±Z；`bridge` 的 `span` < 条长；`cantilever` 的 `clamp` 在条内、`clamp + reach` ≤ 条的末端；输出是数（或步进控件）；同一零件只有一条 `bend`；同一零件不能同时有 `bend` 和 `stretch`。
- **退路**（E-MT2 落后时）：条拆成"两段刚性的半条 + `rotate` 绑定"（桥：两半绕各自的支点转成 V 形；悬臂：整根绕夹口转），读数和状态不变，画面粗一些；在 §9 记为已知差距。
- **复用**：以后的"结构 / 桥梁"类主题、跳水板、弯曲的尺子都用它。

### 4.6 其余全部复用（已查 docs/06，未改代码）

试一试卡片（改变 / 不变 / 观察、`[ ]`、记一行、数据表；状态输出作观察量与先猜后看的 `means: <状态 id>`；URL `sim=`）；`visible`（`eq`）、`offset`、`count`（`per: 1`）、`pose`（未列出的值保留章 / 拍姿态，docs/06 §SpaceScene · 试一试 补充规则）绑定；`shadow-cast` 叠加（`dark` 读数输出，docs/06「影子投射」，docs/35 E-L2，校验不限 `kind`——起草时读过 `sim-schema.ts` 第 828–838、1390–1405 行）；`views.shadows: "contact"`（docs/35 E-L5）；背景章与 `note`；组级比例尺；`glass` / `membrane` / `enamel` / `fabric` / `rubber` / `plastic` / `wood` / `steel` / `stainless` / `casing` 材质族与 `tint`；零件链路卡；context 的 `clip: false`（docs/36 §9.3）。**不需要**：新 token、时间线、小图、新右上卡、流。

### 4.7 引擎件清单与文件归属（一个 Opus 引擎代理，约 2.5 天；不改 `package.json`、不加依赖；在工作分支，不提交，主会话验收后提交，push 等 Gavin）

| 件 | 优先级 | 文件 | 要点 |
|---|---|---|---|
| E-MT1 模型 | 必须 | `src/engines/space-scene/lib/sim/materials.ts`（新）、`src/engines/space-scene/materials-schema.ts`（新：`materialsSchema`、`materialsIssues`、§4.3 设计守门；照 `matter-schema.ts` 的拆法，共享文件只加注册）、`sim-schema.ts`（`SIM_KINDS` 加 `materials`、`quantityKind` 一支、状态列表一支，各一两行）、`lib/sim/index.ts`（`simQuantities` 一支、`SEPARATE_EXPERIMENTS.materials = true`） | §4.2–§4.4；约 1 天 |
| E-MT2 `bend` 绑定 | 必须 | `src/engines/space-scene/lib/bend.ts`（新：曲线、弧长积分、顶点改写的纯函数）、`lib/sim/bind.ts`（`bend` 效果）、`sim-schema.ts`（绑定 schema 与校验）、`stages/model3d/PartNode.tsx`（顶点改写、缓动）、`stages/model3d/shaped.ts`（box / bevelBox 的长轴细分）、`core/test-api.ts` 经 `View.tsx`（`bend()`）、`scripts/shoot.ts`（每拍核对） | §4.5；约 1 天 |
| 夹具主题 | 必须 | `src/content/topics/sample-materials/`（新，`status: draft`，占位文字，只用程序化积木：两块木块 + 三根条（木、玻璃、塑胶）+ 槽码；一个夹座 + 推杆 + 同样三根条；一只水缸 + 三样东西；一个样片座 + 三块样片；手电筒 + 屏 + 三块样片；六章：背景章 + 五个子模型各一张卡 + `profile` 卡） | 不碰 `materials/` 目录 |
| 测试 | 必须 | `tests/space-scene/materials.test.ts`、`tests/space-scene/bend.test.ts`、样板 `tests/space-scene/fixtures/materials-bench.ts`（§4.2 的完整 `materials` 数据 = 本主题的作者模板）、`tests-e2e/sample-materials.spec.ts` | §4.8 |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 材料（materials）」「SpaceScene · 弯曲（`bend`）」，改「试一试（sim）」的模型种类一行与绑定一行 | |

主会话不预装依赖（本主题不需要新依赖）。**并行**：内容代理（D1）与引擎代理同时开工：内容代理写 `parts.json` 时条先画直的、不写 `bend`，样品先全部可见；E 合并后再加 `sim` 段与绑定。引擎代理只拥有上表的文件；内容代理只拥有 `src/content/topics/materials/` 与 `scripts/geo/materials/`。**另一个代理同时在写 docs/39（`nets-and-solids`）**：本主题的任何代理都不碰 docs/39 与 `nets-and-solids` 的目录。

### 4.8 引擎验收

- [ ] 单测 `materials.test.ts`：§2.5 的 T1 全表（7 × 6 格的状态；内部下垂量与表中的 cm 差 < 0.01 cm）、T2 全表（7 × 5）、T3 九行（状态与浸入深度）、T4 七行、T5 七行与 `dark`、T6 七行 × 五列；不变量：`bridge` 的下垂随砝码单调增、到台面后不变；`snapped` 之后再加砝码仍是 `snapped`；`cantilever` 的应力随压下单调增；`tank` 的 `rise` 在浮 / 沉的分界两侧跳变；确定性；URL `sim=strip.glass~masses.5` 往返。
- [ ] 单测 `bend.test.ts`：小值时 `bridge` / `cantilever` 曲线与解析挠度相符（< 1 %）；弧长保持（任何值下中轴长度 = 原长 ± 0.1 %）；支点 / 夹口处位置不变；悬挑段沿切线；大值夹住；顶点缓冲复用（不新建几何）；100 次更新的耗时（headless 记录，< 2 ms）。
- [ ] validate 报错用例：控件不存在 / 种类不对、选项与 `samples` 不符、`snaps` 缺 `limit`、`limp` 又写了 `E`、`bends` 的材料在某组合下超过 limit、浮的东西浸入深度 > height、`light` 三档顺序不对、输出 `from` 不是本模型的量、写了永远不会出现的 `<id>-snapped`、`bend` 零件不是 box / 有 repeat / 有两条 `bend`、`clamp + reach` 超出条长。
- [ ] e2e（`sample-materials`）：深链接 `?ch=…&sim=strip.glass~masses.5`：断开的玻璃条可见、完整的不可见、槽码在台面；`]` 加砝码时木条平滑下弯、`__atlas.engine.bend` 的中点 = `bridge-sag`；`push.2` 推杆碰到末端；水缸里塑胶块的底面高度 = `float-rise`；样片换成布时湿印出现；透光换成木时 `shadows()` 的影子深浅 = 1；`profile` 卡记七行，表里五列都是状态标签（中英）；中文页；手机 390 × 844 卡片可用、按钮 ≥ 44 px。
- [ ] 已发布的 SpaceScene 主题（`forces`、`states-of-matter`、`light-and-shadows`、`energy-conversion`、`mosquito`、`magnets`、`circuits`）与夹具 `sample-forces`、`sample-matter`、`sample-light` 的 `pnpm shoot <slug> --beats --keys` 不回归（`bend` 与新 kind 不影响旧数据）。
- [ ] 性能：模型一次求值 < 0.05 ms；`bend` 缓动每帧 < 0.2 ms；夹具全景 ≤ 40 calls。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.9 不做（v2）

"拉"的强度测试（条竖着吊、下面挂槽码，布、橡胶、塑胶膜的强度；要在模型里加拉伸的伸长与断裂，约 0.5 天）；超过屈服后永久弯曲的画法；读者拖动样品进水缸；吸水的时间过程（湿印慢慢变大）；透光的百分数读数（等有来源的 HDPE、薄布数据）；碎片飞散。

---

## 5. 章节

### 5.0 总表

`layers` 写"台" = `strength-rig, bend-rig, float-tank, drop-tray, light-bench`，"角" = 七个 `corner-*` 组；`run` 全部 false（没有流和动画）；镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | layers | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | 台 + 角 | 默认 | — | hero |
| 01 | `strength` | Strength / 强度 | strength-rig | strip wood, masses 0 | bridge-blocks, bridge-wood, bridge-hanger | strength-view |
| 02 | `flexibility` | Flexibility / 柔韧性 | bend-rig | strip plastic, push 0 | bend-clamp, bend-plastic, push-peg | bend-view |
| 03 | `float-or-sink` | Float or sink / 浮还是沉 | float-tank | block wood | tank, float-wood | tank-view |
| 04 | `waterproof` | Waterproof / 防水 | drop-tray | square plastic | drop-stand, square-plastic, water-bead | drops-view |
| 05 | `light-through` | Letting light through / 透光 | light-bench | square glass | torch, sheet-glass, screen | light-view |
| 06 | `choosing-materials` | Choosing materials / 选材料 | 角 + 台 | pick wood | window-pane, window-rivets, food-box | corner-view |

- 每章只开自己工位的组（04、05 的末拍与 06 开"角"）；厨房角落和实验台按实物大小同比例，可以同框（不需要 docs/33、36 那种"不同比例不同框"的约束），但 01–05 的主镜头只对自己的工位。
- `strip` 控件在 01、02 共用（"同一套七根条"）；`square` 控件在 04、05 共用（"同一套七块样片"）。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "This is a model of a school materials bench and a kitchen corner, drawn life size. The bends, the breaks and the float levels are worked out by the model from published values for each material and from the sizes of the samples; they are drawn, not written as numbers. A real test can turn out a little differently each time, especially when glass or ceramic breaks." / ZH "这是一张学校的材料实验台和一个厨房角落，按实物大小画。条弯多少、什么时候断、东西浮起多高，是模型按每种材料的公开数据和样品的尺寸算出来的，只画出来，不写数字。真实的测试每次结果会有一点不同，玻璃、陶瓷什么时候断尤其如此。"
- **summary**：Everything is made of materials. This topic tests seven of them, wood, metal, ceramic, rubber, glass, plastic and fabric, in five fair tests, and then asks why each object around us is made of the material it is. / 东西都是用材料做的。本主题用五个公平测试，比较七种材料：木、金属、陶瓷、橡胶、玻璃、塑胶、布；再看身边的每样东西，为什么用这种材料做。
- **正文提纲**：① 课纲的一句话：把材料的用途和它的物理性质联系起来（S2 第 39 页）。② 物体与材料：锅是物体，金属是材料；一样东西可以用几种材料（M-6）。③ 五个性质，各一句课纲的定义（N2–N6）。④ 五个工位各做什么（一句一个）；试一试卡片：改变 / 不变 / 观察、记一行、先猜后看；"公平测试"的三个问题（R: moe-16：P3–P4 是认出来，P6 才自己设计）。⑤ 画面是按数据算的、不写数（D9）；样品具体是哪一种（细看）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero）；labels bridge-blocks, bend-clamp, tank, drop-stand, screen | This bench has five stations. Each one tests a different property of materials, using samples of the same size. / 这张实验台有五个工位。每个工位用同样大小的样品，测试材料的一种性质。 |
| 2 | camera corner-view；layers 角；labels wall-cabinet, saucepan, bowl, tumbler, food-box, tea-towel | A saucepan is an object; the metal it is made of is a material. This kitchen corner holds things made of seven materials. / 锅是一个物体，做锅的金属是一种材料。这个厨房角落里的东西，用了七种材料。 |
| 3 | camera corner-view；layers corner-plastic, corner-rubber, corner-glass, corner-metal；labels food-box, box-seal, window-pane, window-frame | One object can use more than one material. The food box is plastic with a rubber seal; the window is glass in a metal frame. / 一样东西可以用不止一种材料。保鲜盒是塑胶的，配一圈橡胶密封圈；窗是玻璃，装在金属框里。 |
| 4 | 本章（hero）；labels bridge-hanger, push-peg, tank-water, water-bead, torch | Every test is a fair test: only the material changes. The masses, the water, the dropper and the torch stay the same. / 每个测试都是公平测试：只改变材料。砝码、水、滴管、手电筒都保持不变。 |

- **试一试**：无。
- **细看**：`How this model works`（S1：条怎样弯、怎样断、东西浮多高是按什么算的；为什么不写数；真实测试的差别）；`What the samples are`（D5：柚木、钢、上釉瓷砖、纯天然橡胶、透明窗玻璃、HDPE 塑胶、棉布；"换一种木 / 塑胶 / 橡胶，结果可能不同"）；`Object or material`（M-6）；`Words for properties`（课纲的五个性质与日常说法；硬度、导电、磁性不是这一课的五个性质）。
- **本章索引**：bridge-blocks, bend-clamp, tank, drop-stand, torch, screen, saucepan, food-box, window-pane
- **名词首现**：material、object、property、fair-test。

### 5.2 第 01 章 `strength`

- **summary**：Strength is a material's ability to take a load without breaking. Strips of the same size are loaded with the same masses: some hold them all, some bend down onto the bench, and glass and ceramic snap. / 强度是材料受力而不断的本领。同样大小的条，压上同样的砝码：有的全都托住，有的弯到台面上，玻璃和陶瓷断了。
- **正文提纲**：① 课纲的定义（N2）。② 测试：同样大小的条架在同样的两块木块上，槽码一个一个放在中间，每次用一根新的条（F-1）。③ 钢条几乎不弯、木条弯一点，都托住了全部五个槽码。④ 玻璃条、陶瓷条几乎不弯，就突然断成两段：它们脆（F-5、F-6，M-11）。⑤ 塑胶条、橡胶条弯到台面上也没断；布连自己都撑不起来：**"强"和"不容易弯"是两回事**（F-2，M-8）；这个测试测不出布和橡胶有多强，要用拉的办法（F-3、F-7，细看）。⑥ 用途：窗铆钉要多年都结实（伏笔 06）；碗碟柜的木板要托得住碗。⑦ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（strength-view，木条，0 个槽码）；labels bridge-wood, bridge-blocks | Each strip is 30 centimetres long and 2 millimetres thick, and rests on two blocks with the same gap. Masses are added one at a time. / 每根条长 30 厘米、厚 2 毫米，架在间距相同的两块木块上。槽码一个一个往上加。 |
| 2 | sim strip wood, masses 5；labels bridge-wood, bridge-masses | With all five masses on, the wooden strip bends a little and holds them. The steel strip hardly bends at all. / 五个槽码都放上去，木条弯了一点，托住了。钢条几乎不弯。 |
| 3 | sim strip glass, masses 5；labels bridge-glass-snapped, bridge-masses | The glass strip hardly bends, then snaps. Glass and ceramic are brittle: they break suddenly instead of bending first. / 玻璃条几乎没弯，就断了。玻璃和陶瓷是脆的：它们不先弯一弯，而是突然断开。 |
| 4 | sim strip plastic, masses 5；labels bridge-plastic | The plastic strip bends so much that it rests on the bench, but it does not break. Bending easily is not the same as being weak. / 塑胶条弯得很厉害，搭到了台面上，但没有断。容易弯，不等于不强。 |
| 5 | sim strip fabric, masses 0；labels bridge-fabric | A fabric strip cannot even hold itself up across the gap, so this test cannot measure its strength. Fabric is tested by pulling it. / 布条连自己都撑不起来，架不住这个间距，所以这个测试测不出它的强度。布的强度要用拉的办法来测。 |

- **试一试 T1**：`vary: strip`，`also: [masses]`，`keep: [{ en: "Strips of the same size, a fresh one each time", zh: "同样大小的条，每次换一根新的" }, { en: "The same blocks and gap", zh: "同样的木块和间距" }, { en: "500 g masses, added one at a time", zh: "500 克槽码，一个一个加" }]`，`observe: [strength-result, strength-bend]`，`record: true`（表：材料 × 结果 × 弯得多少；不画图，D8）；`predict`：prompt "The steel strip held all five masses. Swap it for the glass strip: what will happen?" / "钢条托住了五个槽码。换成玻璃条，会怎样？"，`start: { strip: metal, masses: 5 }`，`change: { strip: glass }`，`observe: strength-result`，options `holds` "It holds them / 托得住" · `on-bench` "It bends onto the bench / 弯到台面上" · `snapped` "It snaps / 会断"。
- **细看**：`Strong, stiff and hard`（F-2：强 = 受力不断；不容易弯是另一回事；硬 = 不容易划出痕，另一种性质，课纲没列，R: test-14）；`Brittle`（F-5、F-6：几乎不弯就断；断口是示意）；`Pull, don't bend`（F-3、F-7：布、线用拉的办法测，一段棉线吊住约 1.1 kg 才断——一次课堂结果；测试要适合被测的材料）；`Do not try this with glass`（F-30：断口很利；BCA 的话；这个测试只在模型里做）；`Why the same size`（厚一倍的条难弯得多，公平测试里大小必须一样，回链 02）。
- **本章索引**：bridge-blocks, bridge-hanger, bridge-masses, bridge-wood, bridge-metal, bridge-glass, bridge-glass-snapped, bridge-ceramic, bridge-plastic, bridge-rubber, bridge-fabric
- **名词首现**：strength、load（并入 strength 的定义）、brittle（标"扩展"）。

### 5.3 第 02 章 `flexibility`

- **summary**：Flexibility is a material's ability to bend without breaking. The same strips are clamped and pushed down at the end: wood, metal, plastic, rubber and fabric bend without breaking; glass and ceramic snap. / 柔韧性是材料能弯而不断的本领。把同一套条夹住、压下末端：木、金属、塑胶、橡胶、布都能弯而不断；玻璃和陶瓷断了。
- **正文提纲**：① 课纲的定义（N3）。② 测试：同一套条夹在同一个夹座上、伸出 25 cm，推杆把末端压下同样的距离（F-1；另一种公平测试——挂同样的重物、量弯下多少——在细看）。③ 木条、钢条压下 2 cm 都弯而不断，推杆抬起它们就回去（不画回弹过程）。④ 玻璃条、陶瓷条压下去不多就断：不柔韧（F-5、F-6）。⑤ 塑胶、橡胶、布的条自己就垂下来：很容易弯。⑥ 配图 `materials-flexible-ruler`（塑胶尺压着石头弯而不断，③ 段后）。⑦ 用途：保鲜盒的橡胶圈要能弯（伏笔 06）。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（bend-view，木条，push 0）；labels bend-clamp, bend-wood, push-peg | Each strip is clamped with 25 centimetres sticking out. The peg pushes the free end down by the same distance each time. / 每根条都夹住，伸出 25 厘米。推杆每次把伸出的一端压下同样的距离。 |
| 2 | sim strip wood, push 2；labels bend-wood, push-peg | Pushed down 2 centimetres, the wooden strip bends without breaking. So does the steel strip. / 压下 2 厘米，木条弯了，没有断。钢条也一样。 |
| 3 | sim strip glass, push 2；labels bend-glass-snapped | The glass strip snaps before the peg has pushed it down very far. Glass is not flexible. Neither is ceramic. / 推杆还没压下多少，玻璃条就断了。玻璃不柔韧，陶瓷也不柔韧。 |
| 4 | sim strip rubber, push 0；labels bend-rubber | A rubber strip droops under its own weight. Plastic and fabric strips droop too. They bend very easily without breaking. / 橡胶条在自己的重量下就垂下来。塑胶条、布条也垂着。它们很容易弯，而且不断。 |
| 5 | layers 角；camera corner-view；labels box-seal, tea-towel | The seal in a food box lid has to bend to fit, so it is made of a flexible material, rubber. / 保鲜盒盖子里的密封圈要弯着贴紧盒盖，所以用柔韧的材料：橡胶。 |

- **试一试 T2**：`vary: strip`，`also: [push]`，`keep: [{ en: "The same strips, 25 cm sticking out", zh: "同一套条，都伸出 25 厘米" }, { en: "Pushed down the same distance", zh: "压下同样的距离" }, { en: "A fresh strip each time", zh: "每次换一根新的" }]`，`observe: [flex-result]`，`record: true`；`predict`：prompt "The wooden strip bent without breaking. Swap it for the ceramic strip and push it down 2 cm: what will happen?" / "木条弯了，没有断。换成陶瓷条，也压下 2 厘米，会怎样？"，`start: { strip: wood, push: 2 }`，`change: { strip: ceramic }`，`observe: flex-result`，options `bends` "It bends / 会弯" · `snapped` "It snaps / 会断" · `droops` "It droops by itself / 自己垂下来"。
- **细看**：`Another fair test`（F-1：挂同样轻的重物、量末端弯下多少，RSC 的做法；那样量的是"多容易弯"）；`Thin and thick`（F-4：同一种材料，薄的能弯、厚的弯不动；卡纸卷成管就难弯——所以公平测试里样品要一样大；金属丝能弯、金属棒弯不动）；`Springing back`（推杆抬起，木条、钢条回到原来的样子；这是弹性，课纲没列，链 `<TopicLink slug="forces" ch="elastic-spring-force">`）；`Careful`（F-30：玻璃、陶瓷断口很利）。
- **本章索引**：bend-clamp, push-peg, push-stand, bend-wood, bend-metal, bend-glass, bend-glass-snapped, bend-ceramic, bend-rubber, bend-plastic, bend-fabric
- **名词首现**：flexible（flexibility）。

### 5.4 第 03 章 `float-or-sink`

- **summary**：A material floats if a piece of it stays on or near the surface of water. Wood, this rubber and this plastic float; metal, ceramic and glass sink. Big things do not always sink, and a capped bottle floats because of the air inside it. / 一块材料能停在水面上或接近水面，就是浮。木、这种橡胶、这种塑胶浮；金属、陶瓷、玻璃沉。大的东西不一定沉；盖好盖子的空瓶浮，是因为里面有空气。
- **正文提纲**：① 课纲的意思（N4）；"浮"也包括只露出一点点（橡胶、塑胶）。② 测试：同样大小的方块，轻轻放进同一缸清水（F-1，SFI：先猜后试）。③ 木浮、钢沉；硬的不一定沉（M-2）。④ 大得多的木板照样浮（M-1）。⑤ 橡胶、塑胶浮在水面附近（F-11、F-13）。⑥ 盖好的空瓶浮得很高；瓶子的塑胶做成实心的会沉（F-16、F-21，M-3、M-9）。⑦ 布：刚放进去会浮一会儿，吸了水就沉（F-23，待核 F-11b）。⑧ 用途：救生衣、浮标要用浮的材料（SFI 的救生衣问题，F-1）。⑨ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（tank-view，木块）；labels float-wood, tank-water | Each block is the same size and is put gently into the same tank of fresh water. The wooden block floats. / 每个方块大小一样，轻轻放进同一缸清水里。木块浮着。 |
| 2 | sim block metal；labels float-metal | The steel block sinks to the bottom. A hard material can float, like wood, or sink, like steel. / 钢块沉到缸底。硬的材料有的浮，比如木；有的沉，比如钢。 |
| 3 | sim block wood-big；labels float-wood-big | A much bigger piece of the same wood still floats. A big, heavy thing does not always sink. / 同一种木，大得多的一块照样浮。又大又重的东西，不一定沉。 |
| 4 | sim block plastic；labels float-plastic | This plastic floats with only a sliver above the water. It still counts as floating: it stays near the surface. / 这种塑胶浮着，只露出水面薄薄一层。这也算浮：它停在接近水面的地方。 |
| 5 | sim block bottle；labels float-bottle | A capped, empty plastic bottle floats high, because it holds so much air. A solid lump of the same plastic would sink. / 盖好盖子的空塑胶瓶浮得很高，因为里面有很多空气。同一种塑胶做成实心的一块，就会沉。 |

- **试一试 T3**：`vary: block`，`keep: [{ en: "The same tank of fresh water", zh: "同一缸清水" }, { en: "Blocks of the same size (except the big one)", zh: "方块大小一样（大木板除外）" }, { en: "Put in gently", zh: "轻轻放进去" }]`，`observe: [float-result]`，`record: true`；`predict`：prompt "The small wooden block floats. Will a much bigger block of the same wood float or sink?" / "小木块浮着。同一种木、大得多的一块，会浮还是会沉？"，`start: { block: wood }`，`change: { block: wood-big }`，`observe: float-result`，options `floats` "Float / 浮" · `sinks` "Sink / 沉"。
- **细看**：`On or near the surface`（N4 的原话）；`A word for later`（"科学家用'密度'比较东西和水谁轻谁重；课纲明说 P3 不要求，中学会学"；链 `<TopicLink slug="states-of-matter" ch="mass-and-space">` 的"大而轻、小而重"）；`Plastics differ`（F-21：PP、PE 浮，PET、PVC 沉；瓶上的数字是树脂码，回链 06 的 F-31）；`Rubber differs`（F-22，§0.1-3：纯天然橡胶浮，硬橡胶、很多橡皮擦沉；自己试的结果可能和模型不一样）；`Wood that sinks`（F-20：愈疮木）；`Air inside`（F-24：装满石头的密封罐沉；空心不等于一定浮）；`More water does not help`（M-5：换大缸，沉的照样沉）；`Wet fabric`（F-23：衣服吸了水变重）；`How this model draws it`（F-12 的比重说明：模型里的浮起高度是示意）。
- **本章索引**：tank, tank-water, float-wood, float-wood-big, float-metal, float-ceramic, float-glass, float-rubber, float-plastic, float-bottle, float-fabric
- **名词首现**：float、sink。

### 5.5 第 04 章 `waterproof`

- **summary**：A material is waterproof when it does not absorb water. A drop of water stays on top of metal, glazed ceramic, rubber, glass and plastic, but soaks into fabric and into unvarnished wood. / 材料不吸水，就是防水。一滴水落在金属、上釉的陶瓷、橡胶、玻璃、塑胶上，会停在上面；落在布和没上漆的木上，会吸进去。
- **正文提纲**：① 课纲的定义（N5）：看的是"吸不吸水"，不是"湿不湿"（M-10）。② 测试：同一支滴管、同样一滴、同样高度，看一会儿以后水在哪里（F-1）。③ 塑胶、玻璃、金属、橡胶、上釉的瓷砖：水珠停在上面。④ 布：吸进去，留下湿印（配图 `materials-waterproof-test`）。⑤ 木：没上漆的木也会慢慢吸水（M-7）；上了漆就不吸（细看）。⑥ 用途：毛巾要吸水所以用布（F-33）；碗、墙砖要防水所以用上釉的陶瓷。⑦ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（drops-view，塑胶样片）；labels drop-stand, square-plastic, water-bead | The same dropper lets one drop fall from the same height onto each sample. On plastic, the drop stays on top in a round bead. / 同一支滴管，从同样的高度，往每块样片上滴一滴水。在塑胶上，水停在上面，成一颗圆圆的水珠。 |
| 2 | sim square fabric；labels square-fabric, wet-patch | On cotton fabric, the drop soaks in and leaves a damp patch. Fabric absorbs water, so it is not waterproof. / 在棉布上，水吸了进去，留下一片湿印。布会吸水，所以不防水。 |
| 3 | sim square wood；labels square-wood, wet-patch | Hard materials can absorb water too. This unvarnished wood slowly soaks the drop up. / 硬的材料也会吸水。这块没上漆的木头，慢慢把水吸了进去。 |
| 4 | sim square ceramic；labels square-ceramic, water-bead | On a glazed ceramic tile, the drop stays on top. Metal, rubber and glass are waterproof too. / 在上了釉的瓷砖上，水停在上面。金属、橡胶、玻璃也防水。 |
| 5 | layers 角；camera corner-view；labels tea-towel, bowl, wall-tiles | A tea towel is fabric because it should soak up water. A bowl and the wall tiles are glazed ceramic because they should not. / 毛巾用布，因为它要吸水。碗和墙砖用上了釉的陶瓷，因为它们不能吸水。 |

- **试一试 T4**：`vary: square`，`keep: [{ en: "The same dropper and the same size of drop", zh: "同一支滴管，同样大的一滴" }, { en: "Dropped from the same height", zh: "从同样的高度滴下" }, { en: "Samples of the same size", zh: "样片大小一样" }]`，`observe: [drop-result]`，`record: true`；`predict`：prompt "The drop stayed on top of the plastic. Swap the plastic for the wood: will the drop stay on top or soak in?" / "水珠停在塑胶上。换成木头样片，水会停在上面，还是吸进去？"，`start: { square: plastic }`，`change: { square: wood }`，`observe: drop-result`，options `stays-on-top` "Stays on top / 停在上面" · `soaks-in` "Soaks in / 吸进去"。
- **细看**：`Wet is not the same as absorbing`（M-10：塑胶表面湿了，但水没进到材料里）；`Glaze and varnish`（F-25：上釉的瓷质砖几乎不吸水，没上釉的陶质砖、花盆吸水；木上了漆就不吸——同一种材料，做法不同结果不同）；`Count the drops`（F-1：布绷在杯口，数滴到第几滴开始渗下去，RSC 的做法）；`Weigh it`（F-26：泡水前后各称一次）；`Cotton and polyester`（F-27：棉比涤纶吸得多，所以运动衣多用涤纶，后半句无来源 → 只写前半句）。
- **本章索引**：drop-stand, water-bead, wet-patch, square-plastic, square-fabric, square-wood, square-ceramic, square-metal, square-glass, square-rubber
- **名词首现**：waterproof、absorb。

### 5.6 第 05 章 `light-through`

- **summary**：Materials let most, some or no light pass through. With the same torch and screen, glass lets most of the light through, this plastic and thin fabric let some through, and wood, metal, ceramic and rubber let none through. / 材料让大部分、一部分或没有光穿过。用同一支手电筒、同一块屏：玻璃让大部分光穿过；这种塑胶和薄布让一部分光穿过；木、金属、陶瓷、橡胶不让光穿过。
- **正文提纲**：① 课纲的定义（N6）：三档，不用三个专门的词（细看）。② 测试：同一支手电筒、同样的距离、同一个暗处，看屏上的光（F-1）。③ 玻璃：屏几乎和没放样片时一样亮，影子很淡（F-28：约九成，细看）。④ 塑胶、薄布：屏暗一些，透过它看不清后面（F-19 待核）。⑤ 木、金属、陶瓷、橡胶：屏上一块黑影（F-18）。⑥ 用途：窗用玻璃，让光进来（F-32）；窗帘用厚布挡光（R: val-tra-04）。⑦ 更多关于光和影子：链 `<TopicLink slug="light-and-shadows" ch="through-or-blocked">`。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（light-view，玻璃样片）；labels torch, sheet-holder, screen | The same torch shines through each sample onto the same white screen, from the same distances. / 同一支手电筒，从同样的距离，透过每块样片照在同一块白屏上。 |
| 2 | sim square glass；labels sheet-glass, screen | Clear glass lets most of the light through. Its shadow on the screen is so faint that it is hard to see. / 透明的玻璃让大部分光穿过。它在屏上的影子很淡，几乎看不出来。 |
| 3 | sim square plastic；labels sheet-plastic | This cloudy plastic lets some light through. The screen behind it is dimmer, and you cannot see clearly through it. Thin fabric is like this too. / 这种乳白的塑胶让一部分光穿过。它后面的屏暗了一些，透过它也看不清后面。薄布也是这样。 |
| 4 | sim square wood；labels sheet-wood | Wood lets no light through, and leaves a dark shadow. So do metal, ceramic and rubber. / 木头不让光穿过，留下一块黑影。金属、陶瓷、橡胶也一样。 |
| 5 | layers 角；camera corner-view；labels window-pane, tumbler | A window pane is glass so that light can come in. A drinking glass lets you see what is inside. / 窗用玻璃，让光照进来。玻璃杯让人看得见杯里有什么。 |

- **试一试 T5**：`vary: square`，`keep: [{ en: "The same torch", zh: "同一支手电筒" }, { en: "The same distances to the sample and the screen", zh: "到样片、到屏的距离一样" }, { en: "Samples of the same size", zh: "样片大小一样" }]`，`observe: [light-result]`，`record: true`；`predict`：prompt "Clear glass lets most light through. Swap it for the fabric: how much light will get through?" / "透明玻璃让大部分光穿过。换成布，会有多少光穿过？"，`start: { square: glass }`，`change: { square: fabric }`，`observe: light-result`，options `most` "Most / 大部分" · `some` "Some / 一部分" · `none` "None / 没有"。
- **细看**：`Three words you may hear`（transparent / translucent / opaque —— 透明 / 半透明 / 不透明：课纲第 40 页明说 P3 不要求用这三个词，P4 第 75 页又说一次；本主题只说"大部分 / 一部分 / 没有"）；`Nine tenths`（F-28：4 mm 透明玻璃约让九成的光穿过，厚一点少一点；没有一种材料让全部的光穿过）；`Thick and dark`（R: val-tra-04：厚的、深色的布挡光，适合做窗帘；同一种布，越厚越少光）；`More about light`（链 `light-and-shadows`）。
- **本章索引**：torch, sheet-holder, screen, sheet-glass, sheet-plastic, sheet-fabric, sheet-wood, sheet-metal, sheet-ceramic, sheet-rubber
- **名词首现**：transparency（lets light through）。

### 5.7 第 06 章 `choosing-materials`

- **summary**：Each object is made of a material whose properties suit its job. Putting the five tests together gives each material its own set of properties, and that is how we choose a material and give reasons for it. / 每样东西用的材料，性质都适合它要做的事。把五个测试放在一起，每种材料都有一组自己的性质；我们就是这样选材料、说出理由的。
- **正文提纲**：① 课纲的重点：性质怎样被用上（N1）；按要求选、说出理由（R: moe-20）。② 五个测试的结果拼成一张表（T6，§2.5），用数据说话（VEA，R: moe-13）。③ 窗：玻璃（透光、防水）+ 金属框（F-28、F-32）。④ 窗的铆钉：BCA 自 2004 年起要求用不锈钢铆钉代替铝铆钉——铝铆钉会锈蚀、变弱，是外开窗掉落的主要原因（F-29）；玻璃从高处掉下会伤人（F-30）。⑤ 保鲜盒：塑胶（防水、摔了不碎）+ 橡胶圈（能弯、不吸水）（F-34 推断）。⑥ 锅：金属（防水、结实，F-33）；碗、墙砖：上釉的陶瓷（防水）；毛巾：布（吸水）；壁柜：木（够强、示意）。⑦ 用完以后：蓝色回收桶收纸、金属、塑胶、玻璃（F-31，细看）。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（corner-view）；labels wall-cabinet, saucepan, bowl, tumbler, food-box, tea-towel | Each thing in this kitchen is made of a material with the right properties for its job. / 这个厨房里的每样东西，用的材料都有适合它那份工作的性质。 |
| 2 | camera 拍内（窗，正前）；layers corner-glass, corner-metal；labels window-pane, window-frame | The window pane is glass: it lets most light through and is waterproof. The frame is metal. / 窗玻璃让大部分光穿过，也防水。窗框是金属的。 |
| 3 | camera 拍内（窗铰链特写）；layers corner-metal；labels window-rivets | Small rivets hold the window's hinges. Since 2004, home owners in Singapore have had to use stainless steel rivets, because aluminium ones can corrode and weaken. / 窗的铰链靠几颗小铆钉固定。从 2004 年起，新加坡的屋主必须用不锈钢铆钉，因为铝铆钉会锈蚀、变弱。 |
| 4 | camera 拍内（保鲜盒）；layers corner-plastic, corner-rubber；labels food-box, box-seal | The food box is plastic, which is waterproof and does not snap. Its seal is rubber, which bends to fit the lid and does not absorb water. / 保鲜盒是塑胶的：防水，也不会一压就断。它的密封圈是橡胶的：能弯着贴紧盒盖，也不吸水。 |
| 5 | layers 台；camera hero；sim pick glass；labels bridge-glass-snapped, sheet-glass, float-glass | Put the five tests together and each material has its own set of properties. Glass lets light through and is waterproof, but it is brittle and it sinks. / 把五个测试放在一起，每种材料都有一组自己的性质。玻璃透光、防水，但它脆，而且会沉。 |

- 第 5 拍：`pick glass` 不驱动工位的显示（`pick` 只给卡片的五个输出）；画面靠拍的 `sim.set` 同时设 `strip: glass, masses: 5, block: glass, square: glass`，让四个工位都显示玻璃的结果。
- **试一试 T6**：`vary: pick`，`keep: [{ en: "The same five tests as chapters 1 to 5", zh: "和第 1 到第 5 章同样的五个测试" }, { en: "All five masses; pushed down 2 cm", zh: "加满五个槽码；压下 2 厘米" }]`，`observe: [p-strength, p-flex, p-float, p-water, p-light]`，`record: true`（七行记完 = §2.5 T6 的表）；`predict`：prompt "A window must let light through. Swap the wood for the glass: how much light gets through?" / "窗要让光透进来。把木头换成玻璃，会有多少光穿过？"，`start: { pick: wood }`，`change: { pick: glass }`，`observe: p-light`，options `most` · `some` · `none`（同 T5 的标签）。
- **细看**：`Rivets and windows`（F-29、F-30：BCA–HDB 2023 年 12 月的文告；只引文告里的话，不加别的数）；`The blue bin`（F-31：纸、金属、塑胶、玻璃一起投进蓝色回收桶；每所 MOE 学校都有；塑胶上的数字不说明能不能回收）；`Choosing with reasons`（R: moe-20：先说东西要做什么，再说要什么性质，再选材料；举毛巾、锅两例）；`Other properties`（导电：`<TopicLink slug="circuits" ch="conductors-and-insulators">`；磁性：`<TopicLink slug="magnets" ch="magnetic-or-not">`；它们不是这一课的五个性质）；`One material, many forms`（同一种材料做法不同，性质会变：薄与厚（02）、上釉与没上釉（04）、空瓶与实心（03））。
- **本章索引**：window-pane, window-frame, window-rivets, food-box, box-seal, saucepan, bowl, wall-tiles, tumbler, tea-towel, wall-cabinet
- **名词首现**：（无新词；ceramic、plastic、rubber、fabric 的名词表条目在 00 首现）

### 5.8 拍数与配图

- 拍数：00 四、01 五、02 五、03 五、04 五、05 五、06 五 = **34 拍**。
- 配图位置：首页图 `materials`；`materials-flexible-ruler` 第 02 章 ③ 段后；`materials-waterproof-test` 第 04 章 ④ 段后。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（19 个候选，目标 14–16 个，正文用不到的删）

中文来源：香港教育局英汉科学词汇（繁体，转简体是编辑上的转换）、Wiktionary、新加坡华语资料库（R: zh-01–zh-17）。**没有找到 MOE 的英汉科学词表**（R: zh-17）；下表"来源"一列照研究标，"编辑用词"的在 `glossary.json` 的 `note` 写明来历。

| id | EN / ZH | 定义要点 | 中文来源（R:） | see |
|---|---|---|---|---|
| `material` | material / 材料 | 做东西用的料；七种常见材料 | Wiktionary（zh-14）；"物料"是地区用法，未核新加坡学校用法 | object |
| `object` | object / 物体 | 用材料做成的东西 | 编辑用词（与 docs/36"物体"同） | material |
| `property` | property / 性质 | 材料的特点，如强度、柔韧性；本课的五个是物理性质 | HK EDB 第 42 页"物理性質"（zh-04） | |
| `strength` | strength / 强度 | 受力（重物）而不断的本领（课纲 N2） | HK EDB 第 52 页"強度"（zh-02）；"负荷"第 32 页（zh-05） | brittle |
| `flexible` | flexible (flexibility) / 柔韧（柔韧性） | 能弯而不断（课纲 N3） | Wiktionary 柔韌"pliable and tough"（zh-16）；**无 HK 词表条目**；"柔软度 / 可弯曲性"未核，不用 | strength |
| `float` | float / 浮 | 停在水面上或接近水面（课纲 N4） | Wiktionary（zh-10） | sink |
| `sink` | sink / 沉 | 沉到水底 | Wiktionary（zh-10） | float |
| `waterproof` | waterproof / 防水 | 不吸水（课纲 N5） | Wiktionary（zh-08） | absorb |
| `absorb` | absorb / 吸水 | 水进到材料里面 | 编辑用词 | waterproof |
| `transparency` | lets light through (transparency) / 透光 | 让大部分 / 一部分 / 没有光穿过（课纲 N6）；transparent / translucent / opaque（透明 / 半透明 / 不透明）课纲不要求 | Wiktionary 透光（zh-09）；HK EDB 第 54、39 页半透明 / 不透明（zh-03） | |
| `fair-test` | fair test / 公平测试 | 一次只改变一样东西、其余保持不变 | 与站内 `forces` 等主题的名词表一致 | |
| `brittle` | brittle / 脆（扩展） | 几乎不弯就断 | 编辑用词（F-5 的 "brittle"） | strength |
| `wood` | wood / 木（木材） | 树干里的材料；有纹理 | Wiktionary（zh-15） | |
| `metal` | metal / 金属 | 钢、铝、铜等 | HK EDB 第 34 页（zh-01） | |
| `ceramic` | ceramic / 陶瓷 | 黏土烧成的材料，如碗、瓷砖；上了釉不吸水 | Wiktionary（zh-11） | |
| `rubber` | rubber / 橡胶 | 能拉长、能弯、不吸水；种类不同，浮沉不同 | HK EDB 第 47 页"橡膠管"（zh-05）；Wiktionary（zh-12） | |
| `glass` | glass / 玻璃 | 透明、防水、脆 | HK EDB 第 22 页"玻璃管"（zh-05） | |
| `plastic` | plastic / 塑胶 | 种类很多；本课用的是 HDPE。**新加坡常说"塑胶"，也写作"塑料"**（§0.1-1） | 新加坡华语资料库（zh-06）；"塑料"标中国大陆（zh-07） | |
| `fabric` | fabric / 布（布料） | 纱线织成的材料 | Wiktionary（zh-13）；"织物"未核，不用 | |

删的顺序（超过 16 个时）：`object`（并入 material 的定义）→ `absorb`（并入 waterproof）→ `wood`、`glass`、`metal`（最常见、最不需要解释）。

### 6.2 来源（施工时进 `sources.json`；**访问日期一律 2026-10-21**）

施工时 S# 照 docs/33、36 的做法保留 P# 的编号（S1 = P1 …），没用上的写进 `SOURCES.md` 的空号说明。只经摘要读取的来源（Engineering ToolBox 两页）、作者推断的出版者（RSC 章节）在 `note` 写明；研究里标 unverified / low 的不进来源表（§2.4 末段）。

| P# | 内容 | 来源（URL） | R: | 用于 |
|---|---|---|---|---|
| P1 | 本设计研究（样品、尺寸、常数取值、§2.5 全部模拟结果、示意之处） | 本 spec §2 | — | 规格行、PLATE、画面、细看 `How this model works` |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*（Updated Jan 2026），印第 15–17、20、39–40、75 页 | https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023.pdf | moe-01–moe-20 | §1.1、D3 |
| P3 | 小学科学教师用书章节 "The properties of materials and their everyday uses"，印第 11–19 页与章末工作纸（出版者按致谢推断为 RSC 相关，medium） | http://www.primaryresources.co.uk/science/pdfs/rsc_tc_nc1.pdf | test-01–test-20、test-29 | F-1–F-4、F-7、F-26、F-33 |
| P4 | Science Foundation Ireland，Discover Primary Science，"Material for a Lifejacket" | https://www.sfi.ie/site-files/primary-science/media/pdfs/col/material_for_a_lifejacket.pdf | test-21–test-24 | F-1、F-23、03 |
| P5 | Thorpe Park Academy，*Uses of Everyday Materials*（Year 2 单元） | https://thorpeparkacademy.org.uk/wp-content/uploads/2025/02/Uses-of-Everyday-Materials-Year-2.pdf | test-25–test-28、val-tra-04 | F-1、F-18、F-32、F-33 |
| P6 | TeachEngineering uoa-2458，*Plastic Properties* 背景页 | https://www.teachengineering.org/content/uoa_/activities/uoa-2458-plastic-properties/uoa-2458-plastic-properties-background-sheets.pdf | val-float-01–val-float-06、sg-09 | F-13、F-16、F-21 |
| P7 | USDA Forest Products Laboratory，*Wood Handbook*（FPL-GTR-190）第 5 章，印第 5-6、5-7、5-8、5-18、5-19、5-21 页 | https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr190/chapter_05.pdf（研究读的是镜像，内容与页码同 2010 版；施工核对官方主机是否可达） | val-float-07–val-float-12、val-str-01–val-str-03 | F-8、F-12、F-20 |
| P8 | Engineering ToolBox，"Solids – Densities"（经摘要读取，medium） | https://www.engineeringtoolbox.com/density-solids-d_1265.html | val-float-13–val-float-19 | F-9–F-12、F-22 |
| P9 | Engineering ToolBox，"Young's Modulus"（经摘要读取，medium；施工逐行复读） | https://www.engineeringtoolbox.com/young-modulus-d_417.html | val-flex-01–val-flex-03 | F-9、F-11、F-12、F-13 |
| P10 | University of Washington MSE 资料，"Ceramic Properties" | https://depts.washington.edu/matseed/mse_resources/Webpage/Ceramics/ceramicproperty.htm | val-flex-04 | F-5 |
| P11 | Proto Labs，HDPE material data sheet（2026） | https://www.protolabs.com/media/rkzn2wud/2026-026-cnc-material-data-sheet_hdpe.pdf | val-str-06、val-wat-01、val-wat-02 | F-13 |
| P12 | Wikipedia，"Yarn conditioning"（引 Mather & Wardman 2015 第 412 页） | https://en.wikipedia.org/wiki/Yarn_conditioning | val-wat-03、val-wat-04 | F-14、F-27 |
| P13 | STILE，"Technical characteristics"（转述 ISO 10545-3 的吸水分类） | https://www.stile.com.pk/technical-characteristics/ | val-wat-06 | F-10、F-25 |
| P14 | AGC Glass Europe，"Oversized glass – Technical specifications"（2021-12） | https://www.agc-yourglass.com/sites/default/files/2021-12/Oversized-glass-2021-EN.pdf | val-tra-01–val-tra-03 | F-12、F-28 |
| P15 | Wikipedia，"Natural rubber" | https://en.wikipedia.org/wiki/Natural_rubber | val-float-20 | F-11、F-34 |
| P16 | BCA–HDB 联合文告，"35 cases of fallen windows in the first 11 months of 2023"（2023-12） | https://isomer-user-content.by.gov.sg/338/6c4d195b-9638-4373-82fc-e32c9109730f/35-cases-of-fallen-windows-in-the-first-11-months-of-2023.pdf | sg-01–sg-03 | F-29、F-30 |
| P17 | NEA，Recycling FAQs | https://www.nea.gov.sg/docs/default-source/our-services/waste-management/recycling-faqs.pdf | sg-05–sg-07 | F-31 |
| P18 | Yin, Tomita & Shavelson 2008, "Diagnosing and dealing with student misconceptions: Floating and sinking", *Science Scope* 31(8): 34–39（研究读的是教师博客上的转载 PDF；施工找 NSTA 原刊页并核页码） | https://michellesclassroom.wordpress.com/wp-content/uploads/2012/09/diagnosing-and-dealing-with-student-misconceptions.pdf | mis-01–mis-09 | M-1–M-5、F-24 |
| P19 | 香港教育局，*English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S1–3)*（2017） | https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/SciGlossary_2017.pdf | zh-01–zh-05 | §6.1 |
| P20 | 讲华语运动 / 新加坡华文理事会，新加坡华语资料库，词条"塑胶" | https://www.mandarin.languagecouncils.sg/en/learning-resources/singaporean-mandarin-database/terms/plastic | zh-06 | §0.1-1、§6.1 |
| P21 | Wiktionary：塑料、防水、透光、浮 / 沉、陶瓷、橡胶、布料、材料、木材、柔韧 | https://en.wiktionary.org/wiki/（各词条） | zh-07–zh-16 | §6.1 |
| P22 | 退火浮法玻璃的弯曲强度与弹性模量（EN 572-1 的转述） | **待核**（玻璃厂商技术手册） | — | F-6、F-12 |
| P23 | 瓷砖的断裂模数与弹性模量（ISO 13006 / ISO 10545-4 的转述） | **待核** | — | F-10 |
| P24 | 棉纤维的密度 | **待核**（纺织参考资料） | — | F-11b、F-14 |
| P25 | 薄布、乳白塑胶片让一部分光穿过；木、金属、瓷砖不透光 | **待核**（教学来源；或沿用 P5） | — | F-18、F-19 |

---

## 7. 图像清单（只用已审的草稿，不出新图）

本轮**没有 Codex**，不生成新图。三张草稿都在 `art/planned/materials/`（`art/planned/manifest.jsonl` 第 83–85 行，Codex 2026-10-18 生成并自检：灰度、真 alpha、无文字），本文起草时逐张看过。**图只当插画，不当事实依据**；主会话入库前再核一次下表的核对点。入库用 `scripts/illustrate.ts`（只处理、不生成）：

```
pnpm tsx scripts/illustrate.ts process art/planned/materials/materials.png materials
pnpm tsx scripts/illustrate.ts figure  art/planned/materials/materials-flexible-ruler.png materials-flexible-ruler
pnpm tsx scripts/illustrate.ts figure  art/planned/materials/materials-waterproof-test.png materials-waterproof-test
```

| 草稿 | 看到的 | 决定 | 用在 | 图注草稿 EN / ZH |
|---|---|---|---|---|
| `materials.png`（封面，1024²） | 一只开着门的木壁柜（木纹清楚、两只金属杯形铰链）；上层一只不锈钢带盖锅、一只白色釉面碗；下层一只玻璃杯、一只半透明塑胶保鲜盒（盖上一圈深色橡胶圈、四个扣）；一条有两道条纹的棉毛巾搭在柜边垂下。七种材料都在；无文字、无标志、灰度、透明底 | **沿用**（首页图版 → `public/illustrations/materials.webp` + `@2x`，守 90 KB / 260 KB 预算） | 首页 | （首页图无图注） |
| `materials-flexible-ruler.png`（1536 × 1152） | 一把无刻度的透明塑胶尺架在两块木块上，中间压一块卵石，尺子弯成弧形没有断；尺子两端搭在木块上、略翘起（简支梁的悬挑段沿切线翘起，物理对，和 `bend` 的 `bridge` 形状一致）；无文字 | **沿用**（`public/illustrations/figures/materials-flexible-ruler.webp`） | 第 02 章 ③ 段后 | A plastic ruler bends under a stone without breaking: it is flexible. / 塑胶尺压着一块石头，弯了却没有断：它柔韧。 |
| `materials-waterproof-test.png`（1536 × 1152） | 左：一块有毛边的棉布，水吸进去成一片不规则的深色湿印；右：一张光滑、一角卷起的塑胶片，水停成大小不一的圆水珠；无滴管、无手、无文字 | **沿用**（`public/illustrations/figures/materials-waterproof-test.webp`） | 第 04 章 ④ 段后 | Water soaks into the cotton cloth but stays in drops on the plastic sheet. / 水吸进了棉布，在塑胶片上却聚成水珠。 |

- **核对点**：封面——七种材料齐全（橡胶圈看得见）、无品牌与文字；尺子图——尺子连续不断、两端在木块上、无刻度数字；防水图——湿印在布里（不是浮在布面上的水洼）、塑胶片上的是凸起的水珠。塑胶片反光较强，有人可能读成金属箔：图注写明"塑胶片"，和 manifest 的 SUBJECT 一致；两种都防水，图注的说法在任何读法下都对。
- 不用的：无（三张全用）。第 01、03、05 章没有配图：模型本身就是图（强度架、水缸、透光台），D14 不出新图。若以后有生成器，候选是"盖好的空瓶浮、实心塑胶块沉"（第 03 章）——记在 §9 的待办，不在本轮。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；本主题**不需要新依赖**；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

模型分工（本轮没有 Codex）：**Opus** 做引擎、几何与视觉、数据、中文、事实复核与终审；**Sonnet** 做英文草稿、事实核查（读原文、落定"待核"）、节拍、截图 QA；**Haiku** 做机械检查（链接、计数、来源 URL 可达、数字与名词的一致性 grep）。

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 #9 的状态同步、docs/README 加一行 | 主会话 | docs/37、docs/17、docs/README | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts materials --engine space-scene --subject science --title-en "Materials Around Us" --title-zh "身边的材料"`；参考图 R1–R7 下到 `scripts/geo/materials/refs/`，逐张核许可 | 主会话（参考图可交 Opus 内容代理） | 主题目录、refs | validate 绿；参考图看过 | 0.4 天 |
| F | **事实核查**：P22–P25 与 F-6、F-10、F-11b、F-18、F-19 的待核逐条读原文；P7 官方主机、P8 / P9 逐行复读（研究只经摘要读取）、P18 原刊页码；产出 `art/research/materials/facts-pass1.md`（每条：原文摘录 ≤ 25 词、页码、是否改 §2 的值）。核实后若 F-6 / F-10 改值，Opus 重算 §2.5 T1、T2 两表 | Sonnet → Opus 复核 | `art/research/materials/`（只增文件） | 每个待核有结论（核实 / 换值 / 按 §0.1 退路删） | 0.6 天 |
| E | E-MT1 模型 + E-MT2 `bend`（含测试 API、shoot 核对）+ 夹具 `sample-materials` + 测试 + docs/06 两节 | Opus 引擎（一个代理） | §4.7 的文件；**不碰** `src/content/topics/materials/`、docs/39、`nets-and-solids` | §4.8 全勾 | 2.5 天 |
| D1 | 数据骨架：零件（§3.4）、12 组、姿态、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后加）；条先画直、样品先全部可见 | Opus 内容（几何 + 数据），**与 E 并行** | `src/content/topics/materials/data/parts.json`、`chapters/*.mdx` frontmatter、`scripts/geo/materials/build-parts.ts`（样品、条、断开的条、槽码、厨房角落的生成脚本；文字放同目录 `text.ts`） | validate 0 error；与 spec 的差异写进汇报 | 1.5 天 |
| D2 | R2 几何两轮（对照 R1–R8；干涉检查：条在支撑上、槽码叠在托上、东西不穿缸壁、样片贴在座上）→ R3 材质（七种材料在 paper / cinema 下一眼分得开：木纹、钢的冷灰、釉面白、橡胶哑光、玻璃边、HDPE 乳白、棉布织纹）→ E 合并后加 `sim`、绑定、`shadow-cast` | Opus 内容（视觉） | 同上 + `docs/screenshots/materials/` | 每轮 `pnpm shoot materials` 截图自证；calls / 三角形在 §3.4 预算内 | 2 天 |
| T1 | 英文草稿：零件 summary / detail、七章正文与细看、名词定义、`sources.json` 英文（按 F 的结论；只写读到并核对过的内容） | Sonnet 起草 → Opus 逐句核对事实与课纲用词 | `sources.json`、`glossary.json`、parts.json 文本字段（`text.ts`）、`chapters/*.mdx` 正文 EN、`SOURCES.md` | 事实表与来源一一对应；`pnpm tsx scripts/sources-md.ts materials` | 1.5 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（中文独立成文；塑胶按 §0.1-1；名词表用词一致） | Opus | 同上 ZH 字段 | 用词与 §6.1 一致 | 1 天 |
| I | 三张草稿入库（§7 的三条命令）；核对点逐张看 | 主会话 | `public/illustrations/`、`src/lib/illustrations.json` | §7 核对点 | 0.1 天 |
| B | 34 拍定稿：镜头、标注、`sim.set`、`layers`、字幕 EN / ZH（字幕说的东西本拍画面里看得见） | Sonnet 起草 → Opus 审 ZH | `state.beats` | `--beats` 0 失败、无漏标、`bend` 核对通过、四种组合 | 1 天 |
| Q1 | 机械检查：`<TopicLink>` 的 slug / ch 都存在；名词表条数、每个 `<Term>` 有条目；`sources.json` 每条 URL 可达（HEAD / GET，记状态码）；每章 `index` 覆盖本章字幕与正文提到的零件；全文 grep：无"密度"出现在细看 `A word for later` 以外、无 transparent / translucent / opaque 出现在 05 细看与名词表以外、"塑胶 / 塑料"只按 §0.1-1 的写法出现、无 TODO / placeholder | Haiku | 只读，汇报 | 汇报清单清零 | 0.2 天 |
| Q2 | 截图 QA：`pnpm shoot materials --layout --keys --beats --locale en,zh --theme paper,cinema`，逐拍看（en-paper 全看，其余抽看）；HUD 排版、模式组合、手机 | Sonnet；视觉问题回 Opus | `docs/screenshots/materials/` | §8.2 全勾 | 0.8 天 |
| R | 终审：事实（每个界面字符串的状态都能追到 F#）、措辞、代码审计；回链 `light-and-shadows`、`states-of-matter`（主会话改） | Opus（终审）+ 主会话 | — | 门槛全绿 | 0.3 天 |

- 合计：引擎约 2.5 天（与 D1 并行）；内容约 9 天。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）。
- **样章**：第 01 章（强度 + T1）先做完给 Gavin 看——最能检验 `bend` 的形状、断开的画法、七种材料的材质辨识、"强 ≠ 不容易弯"的讲法。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：Core Idea 的七种材料在 00 与 06 都出现；五个性质各有一章，summary 第一句是课纲 N2–N6 的意思；VEA 的"用数据检验"在 06 的 T6 表；N1"性质怎样被用上"在 01–05 每章末拍与 06 整章。
- [ ] **不要求的两项**：`grep` 正文、字幕、卡片：无"密度 / density"（只在 03 细看 `A word for later` 一处，写明课纲不要求）；无 transparent / translucent / opaque 与 透明 / 半透明 / 不透明 作为主线说法（只在 05 细看与名词表，标课纲不要求）。
- [ ] **不显示性质的数**（D9）：卡片、PLATE、字幕、表格里没有兆帕、克每立方厘米、透光百分数；细看里只有 F-7、F-25、F-28 三处带条件的来源数。单测 `tests/space-scene/materials-topic.test.ts`：所有观察量是状态输出；PLATE 只跟随器材的量。
- [ ] **必须讲对的十处**（§0 D6）各有一拍或一段正文；误解目录 M-1–M-12 每条在指定章出现并给出正确说法；全文无"大的东西会沉 / 玻璃柔韧 / 布防水 / 所有塑胶都浮"的肯定说法（引用误解处除外）。
- [ ] **结果一致**：卡片、字幕、正文、细看、S1 里同一个结果同一种说法（§2.5 T1–T6 的表）；单测：字幕里提到的每个结果 = 该拍设置下模型的输出；`profile` 七行 = §2.5 T6；若 F 步改了 F-6 / F-10，§2.5 与单测同步、字幕不变。
- [ ] **弯曲**：`pnpm shoot --beats` 每拍 `bend` 核对 0 失败；条长保持；槽码托随条中点、推杆碰到末端；断开的条不和完整的条同时出现；paper 与 cinema 下七种材料一眼分得开。
- [ ] **试一试**：01–06 六章可用；鼠标、触屏、键盘 `[` `]` 都能操作；URL `sim=` 往返；换章重置；六个先猜后看（T1–T6）不判对错、中英文都对；记一行的表列名与状态标签中英都对。
- [ ] **新加坡事实只用有来源的**（D11）：BCA 铆钉一拍的措辞与 F-29 原文一致（"since 2004"、"aluminium rivets"、"stainless steel"）；无组屋窗玻璃、地铁钢轨、拖鞋、校服、地砖、回收押金的说法。
- [ ] **写实**：Tier-1 清单（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"一张材料实验台：条、水缸、滴管、手电筒"；厨房角落和首页图是同一组东西；无品牌、无字、无人与手。
- [ ] **链接**：`<TopicLink>` 到 `light-and-shadows`（`through-or-blocked`）、`states-of-matter`（`mass-and-space`）、`forces`（`elastic-spring-force`）、`circuits`（`conductors-and-insulators`）、`magnets`（`magnetic-or-not`）全部通过 validate；`light-and-shadows`、`states-of-matter` 回链（主会话）。
- [ ] **性能**：全景静止 ≤ 70 calls、上限 100；各章 ≤ 45；三角形 < 0.3 M；模型一次求值 < 0.05 ms；`bend` 缓动每帧 < 0.2 ms。超过目标时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片在抽屉里可用，按钮 ≥ 44 px；`bend-view` 里条的弯曲、`tank-view` 里的水面看得清。
- [ ] 首页图 + 2 张配图逐张核对 §7。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot materials --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

（空。施工后照 docs/36 §9 补：引擎 E-MT1 / E-MT2 的实现记录与验收数据；主题施工与本 spec 的差异表；F 步事实核查的结论（F-6、F-10、F-11b、F-18、F-19 与 §0.1 的退路是否触发）；参考图；性能；截图验收；引擎与流程问题。）
