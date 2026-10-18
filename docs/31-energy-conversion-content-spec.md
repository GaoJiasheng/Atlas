# 31 · 能量转换 · 内容施工 spec（v1）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备的变体——**"组屋切片"立体剖面**：不是一台机器，而是一座新加坡组屋的一段示意剖面（屋顶、顶层的一套住户、楼下的组屋底层与旁边的游乐场），能量在同一个场景里从一件东西走到另一件东西。本主题的任务：**P6 学生看完能说清能量是事物工作所需要的；能举例说出动能、势能、光能、电能、声能、热能六种形式；能说出一件东西把能量从哪种形式转换成哪种形式（每次转换都有一部分变成热、常常还有声）；知道我们用的大多数能源归根结底来自太阳；知道能量不会被"用完"，只会转换成不容易再利用的形式，所以要节约能源；并能读、能做"公平测试"的能量转换小实验和数据表。**

`subject: science`；对应 PSLE 2023 课纲 P6 *Energy Conversion*（S3 第 80 页，只有 Standard 页）与 P6 *Energy Forms and Uses (Photosynthesis)* 的"太阳是主要能源"一条（第 78–79 页）。docs/17 §3.5 的 `energy-chain` brief（"同一个场景里跟着能量走"、B11 能量链叠加），本 spec 把 slug 定为 **`energy-conversion`**（docs/17 那一行由主会话同步改名）。

本主题**复用** docs/22 §4.3 的 SpaceScene `sim`（E-SIM 核心 S1–S8，已在电路 / 磁铁两个主题里实现），另加一个模型 `kind: 'energy'`、一张"能量链"右上卡、一个能量条叠加，落球 / 秋千 / 发条的回放共用 docs/30 定义的时间线回放件 F2（§4）。已经讲过的能量内容不重复，用 `<TopicLink>` 链过去：热的传递 → `aircon`；电路与电池 → `circuits`；光合作用 → `plant`；太阳推动水循环 → `water`；登格河筑坝成蓄水池 → `four-taps`；发电机里的磁铁与线圈 → `magnets`。力（重力、弹簧弹力、摩擦力）由 docs/30（`forces`，与本文同日起草，已读）负责，本主题只在误解 M-2 里对照"能量不是力"；两边的共享件与对齐见 §1.4、§8.1。

结构与 docs/22、docs/23 相同，按本次 brief 重排：§0 决策 → §1 课纲原文与边界 → §2 主题、事实、误解、口吻 → §3 分区、零件、HUD 数据 → §4 引擎（物理、`energy` 模型、流、卡片、动画、文件归属、验收）→ §5 章节 → §6 名词 → §7 来源与图像 → §8 施工顺序、分工、验收 → §9 实现记录（空）。本文的字幕是**草稿**；标"待核"的事实施工代理读原文核对后才能用，核不到就换值或删掉。

---

## 0. 决策记录（2026-10-18 起草）

| # | 决定（提议） |
|---|---|
| 1 | **对象 = 一座组屋的示意切片**：屋顶（12 块太阳能板、逆变器、电梯机房和曳引机）、电梯井（轿厢、对重、钢丝绳）、顶层一套住户（吊扇、LED 吸顶灯、音箱、电热水壶、窗台上的一盆植物、茶几上的手电筒和发条玩具、配电箱）、组屋底层（一辆倒放的自行车带摩擦式发电机和车灯、一个落球实验架带四种可换的地面）、旁边游乐场的一架秋千；左上角一个**示意的太阳**。中间楼层省略（柱子和电梯井在"省略带"处画断裂线，技术图的常规画法）。**通用设计研究**，无品牌、无型号、无文字；`topic.yaml` 的 `note`：EN "Model study · an HDB block slice · middle floors left out · the Sun not to scale" / ZH "示意模型 · 组屋切片 · 省略中间楼层 · 太阳不按比例" |
| 2 | **引擎：SpaceScene + `sim`（新模型 `kind: 'energy'`）**，复用 E-SIM 核心（控件、绑定、读数、试一试卡片、数据表、先猜后看、URL），不做独立引擎。新增：`energy` 模型（纯函数）、**能量链卡**（右上卡，Sankey 式条带，docs/17 B11）、**每种能量形式一条多路径流**（颜色 = 形式）、落球 / 秋千 / 发条的**物理回放**（模型给出时间线，复用 docs/30 `forces` 定义的时间线回放件 F2）和**能量条叠加**（势能 / 动能 / 已变成热和声，三根条加起来总是 100 %）（§4） |
| 3 | **课纲边界**（S3 第 80 页原文，§1）：六种形式的英文名照课纲（kinetic、potential、light、electrical、sound、heat energy）。**"化学势能、重力势能、弹性势能"这些细分词不进主线**（课纲 Note 明说不要求）：电池、食物、天然气、上紧的发条、举高的物体里的能量一律叫"势能 / potential energy"，必要时加一句"储存的能量 / stored energy"说明；细分词只在一处细看里出现一次（"中学会学到它们的细分名字"）。"能量守恒定律"一词不进主线（课纲没有）；"能量不会用完、只会转换"作为现象讲（§0-5 ②） |
| 4 | **"节约能源"与"能量守恒"不混**：课纲价值观是 conserving energy（节约能源，第 80 页）；物理上能量总量不变。中文分开写：节约能源 / 节约用电；"能量不会凭空消失"。英文主线用 "save energy"、"waste less energy"，conserve 只在引用课纲价值观时出现，名词表 `save-energy` 条说明两层意思 |
| 5 | **必须讲对的六处**：① 太阳能板、风扇、灯、音箱、水壶、发电机都**不制造**能量，只**转换**能量；② **能量不会用完**：每一步都有一部分变成热（常常还有声），最后几乎全部散成周围空气的热，不容易再利用——这就是"浪费"，所以要节约；③ **电池储存的是势能，不是"电"**：电路闭合时势能才转换成电能，电池里的物质反应完了就没电了（与 `circuits` 一致）；④ 植物的能量来自**光**，土里吸的是水，不是能量（与 `plant` 一致）；⑤ 热是能量的一种形式，不是一种东西（P4 已学，与 `aircon` 一致）；⑥ 组屋屋顶的太阳能板主要供**公共设施**（电梯、走廊灯、水泵），多余的送进电网；住户家里的电大多来自电网，新加坡的电约 94 % 由天然气发电（2024 年）。docs/17 的 brief 写"屋顶太阳能板 → 电 → 家里的风扇 / 灯"，与事实不符，本 spec 改为：屋顶板 → 电梯；电网 → 住户 |
| 6 | 章数 **6 + 背景章 00**（§5）：00 开始之前 / 01 来自太阳的能量 / 02 家里的电能 / 03 举高与运动 / 04 储存的能量 / 05 踩出电能 / 06 能量不会用完。01–06 每章一个"试一试"（背景章没有）；**不做测验** |
| 7 | **公平测试一等公民**（docs/22 §0-7）：每章试一试写明改变 / 不变 / 观察的量；01–06 章都可"记一行"进数据表。第 03 章（落球高度 × 地面）是本主题的招牌实验：PSLE Booklet B 最常见的能量题型之一 |
| 8 | **能量怎么画**（§4.3）：① 舞台上每种**流动的**形式一种颜色、一条多路径流（光、电、动、声、热五条；势能是"存着的"，不画流，画在能量条和卡片里）；粒子画成稀疏的"能量小包"（`size` 1.4–1.8、每条路径少量），一件东西进去一种颜色、出来几种颜色；分到每条出口的小包多少 ∝ 那一份的占比（流密度绑定，E-EN4）；② 右上**能量链卡**画这一章 / 这一拍的转换链：节点 = 零件（太阳、太阳能板、电梯曳引机……），条带宽 ∝ 占比、颜色 = 形式、写百分数（SIM）；③ 落球、秋千、发条旁边的**能量条**：三根条之和恒为 100 %，读者看见"能量没有少，只是换了地方" |
| 9 | 分区（§3.1）：01 `rooftop` 屋顶与太阳 / 02 `lift` 电梯 / 03 `home` 家里 / 04 `void-deck` 楼下（落球、秋千、自行车）；只有流的组：`light` 光能、`electrical` 电能、`kinetic` 动能、`sound` 声能、`heat` 热能（LAYERS 里可以单开某一种形式，第 06 章"只看热"一拍用它）。context：楼体（楼板、柱、墙、女儿墙、省略带）、家具、游乐场地垫 |
| 10 | **数字纪律**：占比（光、热、声各占多少）全部是 **SIM**，由 §2.4 的设计值算出、写"在这个模型里"；能落到来源的只有：太阳能板效率范围、白炽灯约 90 % 变热、音箱约 1 % 变声、LED 比白炽灯省至少 75 %、网球弹跳高度、阳光强度、新加坡燃料构成、登格浮动光伏与组屋太阳能计划的规模；其余（风扇、水壶、发电机、发条的占比）是**示意**，S1 写明。主线不用焦耳、瓦特作必学概念：PLATE 与细看里出现 W、kW、m/s、cm，正文写"更多 / 更少 / 大约五分之一"；焦耳只在第 03 章一处细看 |
| 11 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人物（秋千上、自行车旁都不画人；"推一下秋千""踩踏板"由控件和字幕表达）/ 发电厂和登格浮动光伏的 3D 模型（只做石墨配图，§7.3）/ 读者拖动物体（v2） |
| 12 | 单位：SI；高度 cm、m；速度 m/s（落球、秋千）与 km/h（自行车，生活里的说法）；功率 W、kW 只在 PLATE、细看；温度 °C |

### 0.1 定稿（2026-10-18，主会话按 Gavin 惯例代定）

Gavin 已说"做"。以下按 Gavin 在 docs/22、23、24、26 定稿时的惯例代定，施工中如有冲突再回到这里改：

1. 开工。复用 E-SIM 核心；新增 `kind: 'energy'` 模型、能量链卡、五种能量形式各一条多路径流、落球 / 秋千 / 发条的时间线回放（共用 docs/30 的 F2）、`energy-bars` 叠加、流的密度绑定、SpaceScene 背景章的 `note`（§4.6 E-EN1–EN8）。不做独立引擎。
2. 场景用组屋切片（§0-1），中间楼层省略并画断裂线；太阳示意。屋顶板供电梯，住户用电网电（§0-5 ⑥）。
3. 课纲用词：势能不细分（§0-3）；"节约能源"与"能量不会消失"分开写（§0-4）。
4. 六种形式的颜色定为新 token `--en-*`（§4.4，paper / cinema 各一套），引擎代理按色觉缺陷模拟校验后可微调明度，色相顺序不变。
5. 01–06 章都有数据表；第 03 章落球实验（高度 × 地面）与第 05 章自行车发电机（速度 → 灯的功率）是两个主实验；第 01、02、03、05、06 章另有先猜后看。
6. 图：首页图版 + 4 张配图（§7.3）。Codex 已在按 docs/17 起草；入库前主会话逐张对照 §2.3 审，错的重画。
7. 施工：Opus 引擎（两个代理分文件）→ Opus 内容（几何 + 数据）→ Codex 起英文正文与数据草稿 → Claude 写中文 → Opus 复核事实 → Sonnet QA（§8）。

**真正需要 Gavin 看一眼的**（不阻塞开工，样章出来时一起看）：组屋切片"只画底层和顶层"的取舍是否可以（备选：画 4 层完整的矮楼，零件更小、镜头更远）。

---

## 1. 课纲原文与边界

来源 S3：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"（2026-10-18 从 MOE 下载、`pdftotext` 读，87 页；页码是 PDF 上印的页码）。文件声明允许为个人或非商业教育用途复制。下面只原文引用本主题直接对齐的两页；其余相关页写要点与页码。

### 1.1 Energy Conversion (P6 Standard)，第 80 页（原文）

> **Core Ideas**
> • Recognise that energy from most of our energy resources is derived in some ways from the Sun.
> • Recognise and give examples of the various forms of energy.
>   - Kinetic energy
>   - Potential energy
>   - Light energy
>   - Electrical energy
>   - Sound energy
>   - Heat energy
>
> Note:
> - The use of specific terms (chemical potential energy, gravitational potential energy and elastic potential energy) is not required.
>
> **Practices**
> • Investigate energy conversion from one form to another.
>
> **Values, Ethics and Attitudes**
> • Show care and concern by being responsible in conserving energy in our everyday life.

- **Foundation**：课纲里没有 "Energy Conversion (P6 Foundation)" 页（Photosynthesis、Forces 都有 Foundation 页），第 20 页表 2 注明"下划线的课题 Foundation 不要求"；从文本提取看不出下划线，按"没有 Foundation 页"推断 Foundation 不考本课题——**待核**（看 PDF 第 20 页的下划线）。本主题不区分。

### 1.2 Energy Forms and Uses (Photosynthesis) (P6)，第 78 页（Standard）/ 第 79 页（Foundation），本主题用到的一条（原文）

> • Recognise that the Sun is our primary source of energy (light and heat).

同页另两条（要点）：生物靠呼吸作用释放食物里的能量来进行生命过程（Note：重点是从食物释放能量）；区分植物和动物获得能量的方式。实验条：探究光合作用的条件（水、光能、二氧化碳 → 糖和氧）。这些由 `plant` 第 04 章负责，本主题第 01 章链过去，不重复。

### 1.3 其他相关页（要点，不引原文）

| 页 | 课题 | 与本主题的关系 |
|---|---|---|
| 14、74 | Energy 主题总述 | 三条要点：能量是事物工作所需要的；能量有多种形式、可以互相转换；有些能源会耗尽，我们在节约能源上有责任。三个探究问题：身边有哪些能量形式、日常怎样用能量、为什么要节约能源。→ 背景章 00 与第 06 章 |
| 76–77 | Energy Forms and Uses (Heat)（P4） | 热是能量的一种形式；热从较热处流向较冷处；热与温度的区别 → 误解 M-5；链 `aircon` |
| 75 | Energy Forms and Uses (Light)（P4） | 物体发光或反光才看得见；光沿直线传播 → 只在第 02 章灯的一拍顺带 |
| 59 | Electrical System（P5） | 电路由能源（电池）和元件组成一个电系统 → 第 04 章手电筒；链 `circuits` |
| 63–64 | Interaction of Forces（P6） | 力是推或拉；重力使物体有重量；弹簧弹力 → 误解 M-2；docs/30 `forces` 负责 |
| 67 | Interactions within the Environment（P6） | 能量从太阳经生物流动的路径（食物链）→ 第 01 章一句 |
| 15–18 | Practices 表 1 | P6 末"设计公平测试"、读表与图、用模型和多种表示解释与预测 → 每章试一试 |

### 1.4 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 热从热处流向冷处、热与温度、空调搬热、空调省电 | `aircon`（01–05 章） | 第 02、06 章各一句 + `<TopicLink slug="aircon" ch="efficiency-and-use">`；第 00 章误解 M-5 链 `ch="where-the-air-goes"` |
| 电路、电池、开关、导体、串并联 | `circuits` | 第 04 章手电筒只讲"势能 → 电能 → 光能 + 热能"，链 `ch="inside-a-torch"`、`ch="more-batteries"` |
| 光合作用、呼吸作用 | `plant` | 第 01 章窗台植物一拍 + 链 `ch="leaves-make-food"`；误解 M-4 |
| 太阳推动水循环 | `water` | 第 01 章一句 + 链 `ch="the-water-cycle"` |
| 登格河筑坝成蓄水池（登格浮动光伏所在） | `four-taps` | 第 01 章细看一句 + 链 `ch="damming-the-rivers"` |
| 磁铁、电磁铁（发电机里转动的磁铁） | `magnets` | 第 05 章细看一句 + 链 `ch="making-magnets"` |
| 食物的消化 | `digestive-system` | 第 04 章"食物也是储存的能量"一句 + 链 `ch="a-meals-journey"` |
| 力（重力、弹簧弹力、摩擦力）的定义与实验 | docs/30 `forces`（2026-10-18 起草、§0 定稿；实验台 + 落体架，钢球、纸、弹簧、刹车轮，章 `gravity-and-weight`、`elastic-spring-force` 等） | 本主题不讲力的效果；落球"往下掉"只说"被地球往下拉"一次。已对齐：g 两边都取 9.8（docs/30 F-3，新加坡约 9.78 是公式算值）；docs/30 用钢球与纸，本主题用网球——不冲突，各讲各的；docs/30 的刹车轮是正放的前轮，本主题的自行车是倒放、带发电机，模型各自独立。docs/30 第 05、06 章细看提到"拉长的弹簧、举高的球储存着能量"、只用 potential energy，与本文 §0-3 一致。链接：本主题第 03 章细看链 `<TopicLink slug="forces" ch="gravity-and-weight">`，`forces` 链回本主题；**谁后发布谁补链接**（validate 要求目标主题与章存在） |

---

## 2. 主题、事实、误解与口吻

### 2.1 读者学到什么（P6 用词）

1. **能量是事物工作所需要的**；能量有不同的形式：**动能**（运动的物体）、**势能**（储存的能量：举高的物体、上紧的发条、拉长的橡皮筋、电池、食物、燃料）、**光能**、**电能**、**声能**、**热能**。
2. **能量转换**：一件东西把能量从一种形式变成另一种或几种形式；每次转换都有一部分变成热（常常还有声）。
3. **大多数能源归根结底来自太阳**：阳光直接到太阳能板和植物；食物来自植物；天然气是很久以前海洋生物的遗骸变成的，那些生物的能量也来自太阳；太阳的热推动水循环和风。
4. **新加坡的电**：大约 94 % 由天然气发电（2024 年）；太阳能在增加：组屋屋顶、蓄水池上的浮动光伏（登格）。
5. **势能 ↔ 动能**：举得越高、势能越多；落下时势能变成动能；弹跳、摆动越来越低，因为每次都有一部分变成热和声。
6. **能量不会用完**：它只是转换，最后大多散成热，不容易再利用；所以**节约能源**：随手关、选 LED、空调 25 °C。
7. 做法：公平测试（一次只改一个量），记表、读表、找规律。

### 2.2 场景（从上到下）

- **太阳**（左上，示意）：一个发光的球，光能小包射向屋顶的太阳能板和窗台的植物。
- **屋顶**：两排 × 6 块太阳能板装在铝支架上，向南微倾（示意）；板背面的电缆接到女儿墙边的**逆变器**；逆变器一路电缆进电梯机房，一路往下接进楼里的电网（多余的电）。**电梯机房**里是曳引机（电动机 + 曳引轮），钢丝绳挂着轿厢和对重。
- **电梯井**（左侧，从底层通到顶层，中间在省略带断开）：轿厢可在底层和顶层之间（控件 `lift-at`）；对重反向移动。
- **顶层住户**（正面剖开，没有前墙）：客厅——吊扇（五叶 Ø 1.32 m）、LED 吸顶灯、电视柜上的一只音箱、茶几上一支 LED 手电筒和一只发条玩具车；后墙窗台上一盆植物；门边墙上的**配电箱**，电网电缆从楼下的竖井上来接进它。厨房——台面上的电热水壶（底座 + 壶身 + 水 + 底部发热盘）。
- **组屋底层**（地砖地面，柱子）：一辆**倒放**的自行车（车座、车把着地，后轮悬空可以转），后叉上一只摩擦式（瓶式）发电机压着轮胎，导线接到车头的车灯；一个落球实验架（1.2 m 高的刻度杆，只有刻度线、没有数字）和杆脚一块 60 × 60 cm 的试验地面（地砖 / 橡胶垫 / 地毯 / 沙盘四选一）。
- **游乐场**（右侧，橡胶安全地垫）：一架秋千（A 字架高 2.45 m、链长 2.0 m）。

### 2.3 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的值；`SIM` = §2.4 模型的结果。P# → §7.1，施工时变 S#。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 能量是事物工作所需要的；能量有多种形式、可以互相转换；有些能源会耗尽 | P2 第 14、74 页 | — | |
| F-2 | 六种形式：动能、势能、光能、电能、声能、热能；化学 / 重力 / 弹性势能这些细分词不要求 | P2 第 80 页 | 主线只用"势能" | |
| F-3 | 太阳是我们主要的能源（光和热） | P2 第 78 页 | — | |
| F-4 | 大多数能源的能量以某种方式来自太阳 | P2 第 80 页 | — | |
| F-5 | 天然气、石油、煤是数百万年前海洋中的微小动植物遗骸埋在沉积物下、经热和压力变成的化石燃料 | P7（EIA *Natural gas explained*） | 第 01 章一拍 + 配图 | |
| F-6 | 新加坡 2024 年发电燃料：天然气 94.0 %、太阳能光伏 2.1 %、其他 2.7 %、煤和石油 1.2 %；联合循环燃气轮机等占装机 81.3 % | P5（EMA *Singapore Energy Statistics 2025* ch.2；`circuits` S29 已读） | 第 02 章字幕 + 细看 | 发布前看有没有 2025 年全年数 |
| F-7 | 燃气联合循环电厂把燃料能量的约 50–60 % 变成电能 | P8（IEA 或 EMA 技术资料） | 55 %（DESIGN） | 是 |
| F-8 | 登格蓄水池浮动光伏：60 MWp、约 122,000 块板、约 45 公顷，2021 年 7 月 14 日正式启用；电量足够供 PUB 本地五座自来水厂，约占 PUB 每年用电 7 % | P6（PUB 新闻稿 2021-07-14；2026-10-18 检索确认摘要） | 第 01 章细看 + 配图 | 读原文；2020 年动工稿写"逾 146,000 块"，以启用稿为准并在 note 写明；PUB 页"板面覆盖 38 公顷"与"45 公顷"并列 |
| F-9 | 组屋 SolarNova：屋顶太阳能板白天供电梯、照明、水泵等公共设施，多余的送进电网；目标 2030 年 540 MWp；到 2025 年 12 月约 5,300 座组屋装了板（约一半） | P9（HDB 新闻 / 年报 / 2025 年情况说明；2026-10-18 检索摘要） | 屋顶板 → 电梯（§0-5 ⑥） | 是：读 HDB 原文，取最新一份 |
| F-10 | 全国太阳能目标：2 GWp 提前达成，2030 年目标提高到 3 GWp | P10（EMA 情况说明） | 细看一句 | 是：日期与原文 |
| F-11 | 新加坡阳光强度（2023 年平均，地方太阳时 12 时）：晴空约 919 W/m²、实际天气约 644 W/m² | P11（NASA POWER 逐时数据，`plant` S23 已下载求平均） | 天空 `clear` 900、`average` 640（DESIGN，取整）；`overcast` 150、`night` 0（示意） | overcast 150 待找来源或标"示意" |
| F-12 | 商用晶体硅组件效率十年间从约 17 % 提高到接近 25 % | P12（Fraunhofer ISE *Photovoltaics Report* 2025） | 21 %（DESIGN） | 读原文页码 |
| F-13 | 太阳能板没变成电的光大多变成热，板会发烫；板温越高效率越低 | P12；P13（NREL 或 OpenStax） | 模型：热 75 %、反射光 4 %（示意）；不算温度影响 | 反射比例示意 |
| F-14 | 常见组件尺寸约 1.72 × 1.13 m（108 片半片） | P14（组件数据表当典型引，不点名） | 1.722 × 1.134 m = 1.953 m² × 12 块 | 是 |
| F-15 | 白炽灯约 90 % 的能量变成热、10 % 变成光；LED 至少省 75 % | P15（US DOE *Energy Efficient Lighting* 情况说明；ENERGY STAR） | 白炽：光 10 / 热 90；LED：光 40 / 热 60（由"省 75 %"推出：10 ÷ 40 = 1/4） | LED 40 % 与 DOE 固态照明"电光效率"对照 |
| F-16 | 动圈音箱效率约 1 %，其余变成热（音圈与磁体） | P16（OpenStax *College Physics 2e* 17.3 习题；Stereophile 测量文章） | 声 1 / 热 99 | |
| F-17 | 电热水壶 1,800–3,000 W；新加坡 13 A 插座、230 V | P17（壶的典型规格；`circuits` 已引 230 V / BS 1363） | 2,200 W；85 % 进水、14 % 散到空气、1 % 声（示意） | 是：85 % |
| F-18 | 水的比热约 4,186 J/(kg·°C) | P18（OpenStax *College Physics 2e* 表 14.1） | 1.0 L 从 30 °C 烧开：292.6 kJ；2,200 W × 85 % → 约 156 s（SIM） | 30 °C 自来水温示意 |
| F-19 | 吊扇功率约 40–75 W；电机把一部分电能变成热、嗡嗡声 | P19（NEA / 厂商典型，不点名） | 动 60 / 热 38 / 声 2（示意） | 是 |
| F-20 | 网球：质量 56.0–59.4 g、直径 6.54–6.86 cm；从 254 cm 落到坚硬平面，弹回 135–147 cm | P20（ITF *Rules of Tennis* 附录 / ITF 技术手册） | 58 g、Ø 6.7 cm；地砖弹回比 0.55（135/254 = 0.53 到 147/254 = 0.58 之间） | 读 ITF 原文条款号 |
| F-21 | 软地面吸收更多能量，弹得更低 | P21（IOP Spark "bounce efficiency"） | 橡胶垫 0.40、地毯 0.25、沙 0.05（示意） | 是 |
| F-22 | 标准重力加速度 9.80665 m/s²（新加坡地面略小，约 9.78） | P22（NIST / BIPM） | g = 9.8 | 新加坡值待核 |
| F-23 | 自由下落：v = √(2gh)（不计空气阻力；网球落 1 m 时空气阻力影响很小） | P23（OpenStax *College Physics 2e* 2.7、7.6） | 25 / 50 / 75 / 100 cm → 2.21 / 3.13 / 3.83 / 4.43 m/s（SIM） | |
| F-24 | 单摆周期 T = 2π√(L/g)；摆角 35° 时比小角公式长约 2 % | P24（OpenStax *College Physics 2e* 16.4） | 链长 2.0 m、摆角 35°：T ≈ 2.90 s；最低点速度约 2.66 m/s；最高点比最低点高 0.36 m（SIM） | |
| F-25 | 秋千、摆不推会越摆越低：一部分能量变成热（挂钩摩擦、空气）和声 | P23；P24 | 每摆一次损失 3 %（示意）；8 次后"重新拉起" | 是 |
| F-26 | 能量既不会凭空产生，也不会凭空消失，只会转换；总量不变 | P23（OpenStax 7.6 *Conservation of Energy*） | 能量条三根之和恒为 100 %；能量链卡每个节点进出相等 | |
| F-27 | 人体把食物能量变成机械功的效率约 20–25 %，其余变成热 | P25（OpenStax 7.8 表 7.2） | 第 04 章细看一句 | 表号待核 |
| F-28 | 电池里储存的是物质的能量；电路闭合时它推动电流，电流不被储存、不被用掉 | P26（OpenStax 21.2 电动势）；`circuits` 第 01、04 章 | 手电筒：势能 → 电 95、电池内部变热 5（示意）；LED 光 40 / 热 60 | |
| F-29 | 自行车发电机：传统规格 6 V、3 W；轮胎带动发电机里的磁铁在线圈旁转动，产生电流 | P27（德国 StVZO §67 旧版条文或车灯厂技术说明）；P28（OpenStax 23.1–23.3 电磁感应） | 6 V 0.5 A 白炽前灯（3 W）；后面只有反光片 | 是 |
| F-30 | 发电机输出随转速升高、高速时电流趋于一个上限（线圈电感限流），灯不会烧坏 | P29（轮毂 / 瓶式发电机技术测试文章） | I = 0.55 × x / √(1 + x²)，x = v / 12 km/h；灯 12 Ω（DESIGN 示意，§2.4） | 是：形状对、数值示意 |
| F-31 | 瓶式发电机效率低（约 20–40 %），转起来有呼呼声 | P29 | 电 30 / 热 65 / 声 5（示意） | 是 |
| F-32 | 电梯有对重，平衡轿厢与约一半额定载重，曳引机只需补上差额 | P30（电梯工程手册或 BCA 资料） | 第 03 章细看 | 是 |
| F-33 | 节约用电：空调 25 °C 或以上、每调高一度约省 10 %；能效标签；随手关；LED | P31（NEA 能效页；`aircon` 已有来源） | 第 06 章 | 用 `aircon` 现成 S# |
| F-34 | 儿童的能量误解：能量会用完；能量就是力；植物从土里得到能量 / 食物；电池里装着电；热是一种东西 | P32–P36（§7.1） | §2.5 误解表 | 页码待核 |

### 2.4 模拟运行点（SIM，内部自洽；设计研究来源 S1 的内容）

**总规则**：每个转换节点"进 = 出"（百分数相加 = 100，取整到 1 %，取整误差归到热）；链上的百分数是**相对于这条链起点的能量**，节点内的占比是**相对于进这个节点的能量**；卡片两种都能显示（默认显示相对起点）。

**A · 太阳能板（`chain: solar`，第 01 章）**

| `sky` | 阳光 W/m² | 每块板电功率 = 1.953 m² × G × 0.21 | 12 块合计（PLATE `panel-power`） | 太阳发光（`sun-glow`） |
|---|---|---|---|---|
| `clear` 晴天正午 | 900 | 369 W | **4.43 kW** | 1.0 |
| `average` 实际天气正午平均 | 640 | 262 W | **3.15 kW** | 0.8 |
| `overcast` 阴天（示意） | 150 | 61.5 W | **0.74 kW** | 0.35 |
| `night` 夜里 | 0 | 0 | **0** | 太阳隐藏 |

照到板上的能量 = 100：电 21、热 75、反射光 4（与天空无关；夜里整条链为 0）。电 21 → 逆变器（损失 1，变热）→ 电梯曳引机 20：动能 16、热 3、声 1 → 轿厢上升：动能 16 → 势能 16（`lift-at: top` 时）。`lift-at: ground` 时 20 全部经逆变器送进电网（卡片画"→ 电网"，示意）。

**B · 家里的电器（`chain: home`，第 02 章；`appliance` 控件；相对进电器的电能）**

| `appliance` | 想要的形式（`useful`） | 散到周围的热（`heat`） | 声 | 备注 |
|---|---|---|---|---|
| `fan` 吊扇 | 动能 60 | 38 | 2 | 示意 |
| `lamp` LED 吸顶灯 | 光能 40 | 60 | 0 | 由 F-15 推出 |
| `speaker` 音箱 | 声能 1 | 99 | — | F-16 |
| `kettle` 水壶 | 热能（进水）85 | 14 | 1 | 示意；1.0 L 30 → 100 °C 约 156 s |

**C · 落球（`chain: bounce`，第 03 章；`drop` × `surface`）**

弹回比 r：`tile` 地砖 0.55（F-20）、`rubber` 橡胶垫 0.40、`carpet` 地毯 0.25、`sand` 沙 0.05（示意）。第一次弹回高度 = r × 落下高度（cm，四舍五入到整数，0.5 进位）；落地速度 = √(2 × 9.8 × h)（与地面无关）；第一次弹跳后留下 r（势能，在最高点）、变成热和声 1 − r。

| `drop` cm | 落地速度 m/s | 地砖 | 橡胶垫 | 地毯 | 沙 |
|---|---|---|---|---|---|
| 25 | 2.21 | 14 | 10 | 6 | 1 |
| 50 | 3.13 | 28 | 20 | 13 | 3 |
| 75 | 3.83 | 41 | 30 | 19 | 4 |
| **100** | **4.43** | **55** | 40 | 25 | 5 |

`kept`（留下的 %）= 55 / 40 / 25 / 5；`lost`（变成热和声的 %）= 45 / 60 / 75 / 95。回放（时间线 `bounce-run`，§4.5）：落下一次、弹起一次，终态停在第一次弹起的最高点；"再跑一次"重放。细看（只此一处用焦耳）：58 g 的球举高 1 m 有约 0.57 J 势能。

**D · 秋千（`chain: swing`，第 03 章）**：链长 2.0 m，从 35° 放开：最高点比最低点高 0.36 m，最低点速度约 2.66 m/s，周期约 2.90 s。每摆一次（单程算一次）3 % 的能量变成热和声（示意），摆幅相应变小；回放（时间线 `swing-run`）摆 8 次后停在最高点（剩 78 %），"再跑一次" = 重新拉到 35° 放开（字幕说"再拉起来放开"）。能量条：势能 = (1 − cos θ) ÷ (1 − cos 35°) × 剩余能量；动能 = 剩余能量 − 势能；热和声 = 100 − 剩余能量。

**E · 发条玩具（`chain: windup`，第 04 章）**：上紧 `winds` 圈 = 0 / 2 / 4 / 6 / 8 → 跑的时间 `run-time` = 1.5 s × 圈数 = 0 / 3 / 6 / 9 / 12 s（示意）。链：势能 100 → 动能（车轮转动、车跑）→ 跑完时热 95、声 5（示意，滴答声）。能量条：发条势能从 100 线性降到 0，动能是一小块"正在流过"的量（恒定 8，示意），热和声 = 100 − 势能 − 动能（结束时 = 100）。

**F · 手电筒（`chain: torch`，第 04 章；`torch-on`）**：电池势能 100 → 电能 95、电池内部热 5 → LED：光 38、热 57（光 40 % × 95）。`torch-on: false` 时整条链为 0。

**G · 自行车发电机（`chain: dynamo`，第 05 章；`speed` × `dynamo-on`）**

电流 I = 0.55 A × x / √(1 + x²)，x = v ÷ 12 km/h；灯功率 P = I² × 12 Ω；亮度 = P ÷ 3 W × 100；后轮转速 = v ÷ 3.6 ÷ 2.07 m × 60（26 吋轮周长 2.07 m）。

| `speed` km/h | 电流 A | 灯功率 W（`lamp-power`） | 亮度 %（`brightness`） | 后轮 rpm |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 5 | 0.212 | 0.54 | 18 | 40 |
| 10 | 0.352 | 1.49 | 50 | 81 |
| **15** | **0.429** | **2.21** | **74** | 121 |
| 20 | 0.472 | 2.67 | 89 | 161 |
| 25 | 0.496 | 2.95 | 98 | 201 |

链（`dynamo-on: true`，speed > 0）：踩踏板的动能 100 → 发电机：电 30、热 65、声 5 → 灯：光 3、热 27。`dynamo-on: false`：灯 0，链只剩"动能 → 车轮轴承的热"（示意），卡片注"更好踩"。

**H · 从天然气到灯（`chain: gas-to-home`，第 06 章；`lamp-type`）**

天然气（势能）100 → 发电厂：电 55、热 45 → 电网：到家 53、电缆热 2 → 灯：LED 光 21 / 热 32；白炽 光 5 / 热 48 → 房间里的光照到墙和家具上，最后也变成热。卡片尾节点"最后：几乎全部是热"。`same-light`（同样亮所需电能，白炽 = 100 %）：LED 25 %、白炽 100 %。

**I · 全景（`chain: whole`，第 00 章）**：所有链的路径同时亮，强度取各链默认值的 0.6 倍（示意），卡片画"太阳 → 屋顶板 → 电梯"与"天然气 → 电网 → 家里"两条主干，其余以细带表示。

这些数字只出现在 PLATE 读数（SIM 芯片）、能量链卡（SIM 芯片 + "在这个模型里"）、试一试卡片、细看（写明"模拟"）和字幕（写"在这个模型里"）；正文写"大约五分之一""大部分""一百份里只有一份"。

### 2.5 误解目录（每条：说法 → 正确的说法 → 本主题哪里纠正）

| # | 常见说法 | 正确的说法 | 哪里 | 来源 |
|---|---|---|---|---|
| M-1 | 能量会用完；电池 / 风扇把能量用掉了 | 能量不会消失，只会转换；最后大多变成散在空气里的热，很难再用上——"用完"其实是"变成了用不上的形式" | 00、06 章；03 章能量条（三根之和恒为 100 %） | P32、P33；F-26 |
| M-2 | 能量就是力；举起的球"有力" | 力是推或拉（P6 力的主题）；能量是让事物能工作的东西。被举高的球有势能；它掉下时是地球的引力把它往下拉，势能变成动能 | 03 章细看 `Energy is not a force` | P32、P34；docs/30 |
| M-3 | 静止的东西没有能量 | 静止的高处的球、上紧的发条、电池都有储存的能量（势能） | 03、04 章 | P33 |
| M-4 | 植物从土里得到能量 / 食物 | 植物的能量来自光：叶子用光能把水和二氧化碳变成糖；根从土里吸的是水 | 01 章窗台植物一拍 + `plant` 链接 | P35；`plant` |
| M-5 | 热是一种东西，会"流进""装满" | 热是能量的一种形式；热从较热的物体传到较冷的物体（P4）；没有一种叫"热"的物质 | 00 章细看；06 章 | P36；P2 第 76 页；`aircon` |
| M-6 | 电池里装着电（像水箱装水） | 电池储存的是势能（电池里的物质）；电路闭合时才转换成电能；电流不被储存、不被用掉 | 04 章 | P26；`circuits` |
| M-7 | 太阳能板 / 发电机制造能量 | 它们只转换能量：板把光能变成电能、发电机把动能变成电能；没有光、不转动就没有电 | 01 章夜里一拍；05 章停下一拍 | F-26 |
| M-8 | 球弹不回原来的高度，是因为能量"没了" | 每次落地时一部分能量变成热（球和地面变暖一点）和声（"咚"一声） | 03 章 | P21 |
| M-9 | 秋千不推也会一直摆下去 | 每摆一次都损失一点能量（热、声），要有人推才能保持 | 03 章 | F-25 |
| M-10 | 发电机发电不费力 | 接上发电机后要更用力踩：电能来自你踩踏板的动能 | 05 章 `dynamo-on` 一拍 | F-29 |
| M-11 | 太阳只给光（或只给热） | 太阳给光和热（课纲原话） | 01 章 | P2 第 78 页 |

### 2.6 口吻

按 `writing-rules.md`。课纲用词：energy、form of energy、kinetic / potential / light / electrical / sound / heat energy、energy conversion（convert … into …）、energy resource / source of energy、the Sun、conserve energy（只在价值观处）。中文（新加坡用法）：能量、能量形式、**动能、势能、光能、电能、声能、热能**、能量转换（把 … 转换成 …）、能源、太阳、节约能源。句式固定："X 把 A 能转换成 B 能和 C 能"（EN "X converts A energy into B energy and C energy" / "changes … into …"）。不说"能量跑掉了""被吃掉了""用光了"（除非是在误解里引用并纠正）；不拟人（"太阳能板吸收能量来工作"→"太阳能板把光能转换成电能"）；不说"免费的能源""清洁能源最好"这类评价，只讲事实（燃料构成、目标、规模，带来源）。安全：只在第 02 章细看写一句"壶身和蒸汽很烫"（常识，不另引来源）；用电安全由 `circuits` 第 06 章负责，这里不重复。

### 2.7 PSLE 题型 → 本主题哪里支持

| 题型（S3 第 15–18 页过程技能；P6 AO II） | 支持 |
|---|---|
| 写出一件东西的能量转换（"电能 → 动能 + 声能 + 热能"） | 每章能量链卡 + 舞台上颜色换过的流 |
| 能量转换链（太阳 → 植物 → 人；太阳 → 板 → 电梯） | 01、06 章卡片 |
| 落球 / 弹跳：放得越高弹得越高、哪种地面弹得低、为什么越弹越低 | 03 章试一试 + 数据表 + 能量条 |
| 秋千 / 摆：哪一点动能最大、哪一点势能最大 | 03 章秋千能量条 |
| 太阳能电池驱动电动机：光的强弱与转速 | 01 章天空控件（板的电功率） |
| 发电机：转得越快灯越亮；不转不亮 | 05 章试一试 + 数据表 |
| 发条 / 橡皮筋：上得越紧跑得越久 | 04 章试一试 |
| 节约能源的做法与理由 | 06 章 |
| 认出公平测试里不变的量 | 试一试卡片"不变"芯片（同一只球、同一盏灯、同一块板） |

---

## 3. 分区、零件、HUD 数据

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色 |
|---|---|---|---|---|
| 01 | `rooftop` | Sun and rooftop / 太阳与屋顶 | 太阳、太阳能板、支架、逆变器、屋顶电缆 | `token:ink-2` |
| 02 | `lift` | Lift / 电梯 | 机房、曳引机、钢丝绳、轿厢、对重、电梯井 | `token:ink-3` |
| 03 | `home` | Home / 家里 | 配电箱、电网电缆、吊扇、灯、音箱、水壶、植物、手电筒、发条玩具 | `token:neutral` |
| 04 | `void-deck` | Void deck and playground / 楼下与游乐场 | 落球架、网球、四种地面、秋千、自行车与发电机、车灯 | `token:cut` |
| — | `light` | Light energy / 光能 | 只有流 | `token:en-light` |
| — | `electrical` | Electrical energy / 电能 | 只有流 | `token:en-electrical` |
| — | `kinetic` | Kinetic energy / 动能 | 只有流 | `token:en-kinetic` |
| — | `sound` | Sound energy / 声能 | 只有流 | `token:en-sound` |
| — | `heat` | Heat energy / 热能 | 只有流 | `token:en-heat` |

势能没有组（不画流），它的颜色 `token:en-potential` 只出现在能量条和能量链卡里；KEY 图例由引擎在有 `energy` 模型时追加一行"Potential energy / 势能（储存）"（E-EN2 的一部分）。

### 3.2 坐标与尺度

- 单位米，Y 向上，+Z 朝观者，+X 向右；地面 y = 0。
- **楼体切片** x −6.0 … +4.0、z −3.5 … +3.5。底层地面顶 y 0.15、底层天花 y 3.0；**省略带** y 3.25 … 3.75（柱、井壁在这里断开，断口是锯齿形薄板，context）；顶层楼板顶 y 3.95，天花 y 6.55；屋顶板 y 6.55 … 6.80，女儿墙顶 y 7.7；电梯机房 x −6.0 … −3.8、y 6.8 … 9.0。
- **电梯井** x −6.0 … −3.8、z −1.3 … +1.3；轿厢 1.4 × 2.3 × 1.5 m，底层时中心 y 1.30，顶层时 y 5.10（位移 3.8 m）。
- **住户** x −3.8 … +4.0、z −3.3 … +2.8（前面无墙）；客厅 x −3.8 … +1.2，厨房 x +1.2 … +4.0。
- **游乐场** x +5.0 … +11.0、z −2.5 … +2.5，地垫顶 y 0.05。
- **太阳** (−8.0, 12.0, −7.0)，半径 0.9（示意，不按比例）。
- 模型半径约 11 m（太阳计入）；最小件是网球（Ø 6.7 cm）与手电筒 LED（Ø 5 mm），靠预设镜头近看（缩放下限按作者镜头放宽，docs/06「交互」）。

### 3.3 零件（46 个 + 5 个 context）

"shell" = X-RAY 时变透明；"隐" = 哪些章 / 拍 `hide`；参考见 §7.2。

| # | id 名称 | 组 | primitive（+ extra） | at（约） | 材质 | shell | 备注 |
|---|---|---|---|---|---|---|---|
| 01 | `sun` 太阳 | rooftop | sphere r 0.9 | (−8.0, 12.0, −7.0) | `token:en-light` 自发光 | | `glow` ← `sun-glow`；夜里 `visible` 关 |
| 02 | `solar-panels` 太阳能板 | rooftop | bevelBox 1.134 × 0.035 × 1.722（玻璃面 + 铝框 extra），`repeat` 6 沿 X，第二排为 extra | (0, 7.25, ±1.2)，倾 10° | `glass` + `casing`；电池片 `token:ink` 深蓝灰 tint | | 电池片网格用程序化贴图（细栅线），无文字 |
| 03 | `panel-frames` 支架 | rooftop | tube 框架 × 4 + 底脚 | 同上，y 6.8–7.2 | `casing` | | |
| 04 | `inverter` 逆变器 | rooftop | bevelBox 0.5 × 0.6 × 0.25 + 散热片 `fins` extra | (3.4, 7.1, 2.9) | `enamel` | | |
| 05 | `rooftop-cables` 屋顶电缆 | rooftop | tube（板 → 逆变器 → 机房；逆变器 → 竖井） | — | `rubber` | | 与电流路径同源 |
| 06 | `motor-room` 电梯机房 | lift | bevelBox 薄板墙 × 4 + 顶 | x −6 … −3.8，y 6.8–9.0 | `enamel` | ✓ | |
| 07 | `lift-motor` 曳引机 | lift | lathe（电机壳）+ lathe（曳引轮，绳槽）+ 底座 | (−4.9, 7.3, 0) | `powder` + `steel` | | 动画 `motor-spin`（运转且轿厢移动时） |
| 08 | `lift-ropes` 钢丝绳 | lift | tube × 4（曳引轮 → 轿厢顶；→ 对重） | — | `steel` | | 长度随轿厢（两段：上、下，姿态换） |
| 09 | `lift-car` 轿厢 | lift | bevelBox 1.4 × 2.3 × 1.5（门面板 extra） | (−4.9, 1.30, 0.1) | `stainless` | | `offset` ← `lift-at`（+3.8 m） |
| 10 | `counterweight` 对重 | lift | box 0.9 × 1.6 × 0.2（铸铁块叠 extra） | (−4.9, 5.2, −1.1) | `powder` | | `offset` ← `lift-at`（−3.8 m） |
| 11 | `lift-shaft` 电梯井 | lift | 薄板墙 × 3（前面开窗，省略带断开） | x −6 … −3.8 | `enamel` | ✓ | |
| 12 | `grid-cable` 电网电缆 | home | tube（地下 → 竖井 → 顶层配电箱）+ 竖井盒 | x −3.7，z −3.2 | `rubber` | | |
| 13 | `distribution-board` 配电箱 | home | bevelBox 0.45 × 0.6 × 0.12 + 断路器排 `fins` | (−3.7, 5.6, 1.6) | `enamel` | | |
| 14 | `fan-motor` 吊扇电机 | home | lathe（吊杆 + 电机壳） | (−1.3, 6.15, −0.3) | `enamel` | | |
| 15 | `fan-blades` 吊扇叶 | home | blades `axial` count 5，radius 0.66，pitch 12° | (−1.3, 6.05, −0.3) | `plastic` tint 木色 | | 动画 `fan-spin`（`enabled` ← appliance = fan 或 chain whole） |
| 16 | `led-lamp` LED 吸顶灯 | home | lathe 圆盘 Ø 0.4 + 乳白罩 | (1.0, 6.50, −1.6) | `enamel` + `glass` | | `glow` ← `lamp-glow` |
| 17 | `speaker` 音箱 | home | bevelBox 0.2 × 0.32 × 0.24 + 网罩 | (−3.2, 4.55, −2.7) | `wood` | | |
| 18 | `speaker-cone` 扬声器纸盆 | home | lathe 锥面 Ø 0.13 | 音箱前面 | `plastic` 深灰 | | 动画 `cone-pulse` |
| 19 | `kettle` 电热水壶 | home | lathe 壶身 + 把手 extrude + 底座 lathe | (2.6, 4.97, −2.9) | `stainless` + `plastic` | ✓ | 壶身 shell，X-RAY 见水 |
| 20 | `kettle-water` 壶里的水 | home | lathe（水面以下） | 同上 | `glass` tint `token:cold` | | `tint` ← `water-warm`（变暖色，示意） |
| 21 | `kettle-element` 发热盘 | home | torus r 0.07 管 0.006 | 壶底 | `steel` | | `glow` ← appliance = kettle |
| 22 | `window-plant` 窗台植物 | home | lathe 花盆 + 程序化叶片（sweep，6 片） | (0.4, 4.95, −3.15) | `plastic` 赭 + 叶 `token:loop` tint | | 第 01 章一拍 |
| 23 | `torch` 手电筒 | home | lathe 筒身 Ø 0.032 × 0.16（开关 extra） | (−1.65, 4.37, 0.6) 平放 | `casing` | ✓ | |
| 24 | `torch-batteries` 手电筒电池 | home | cylinder × 2（AA） | 筒内 | `steel` | | X-RAY 可见 |
| 25 | `torch-led` 手电筒 LED | home | sphere r 0.0025 + 反光碗 lathe | 筒头 | `glass` | | `glow` ← `torch-on` |
| 26 | `windup-toy` 发条玩具车 | home | extrude 车身侧影 0.12 × 0.06 × 0.06 | (−0.95, 4.40, 0.6) | `plastic` tint | ✓ | `play` ← `toy-run`（x，§4.5） |
| 27 | `windup-spring` 发条 | home | coil（平面螺旋示意：锥形 coil，r 0.004–0.018） | 车内 | `steel` | | X-RAY 可见；姿态 `spring-wound`（紧）/ 静止（松） |
| 28 | `windup-key` 钥匙 | home | extrude 蝶形 + 轴 | 车顶 | `brass` | | `play` ← `toy-run`（key） |
| 29 | `windup-wheels` 车轮 | home | cylinder × 4（`repeat`） | 车下 | `rubber` | | `play` ← `toy-run`（spin，`each`） |
| 30 | `drop-pole` 刻度杆 | void-deck | box 0.04 × 1.2 × 0.02 + 刻度线 `fins`（每 10 cm 一条长、每 5 cm 一条短）+ 底座 | (−2.6, 0.75, 1.8) | `enamel` + `token:ink` | | 无数字；释放夹在 extra |
| 31 | `tennis-ball` 网球 | void-deck | sphere r 0.0335（缝线 sweep extra） | (−2.45, 1.18, 1.8) | `rubber` tint 黄绿（`token:food` 系） | | `play` ← `bounce-run`（y） |
| 32 | `surface-tile` 地砖 | void-deck | bevelBox 0.6 × 0.01 × 0.6 | (−2.45, 0.155, 1.8) | `enamel` | | `visible` ← surface = tile |
| 33 | `surface-rubber` 橡胶垫 | void-deck | bevelBox 0.6 × 0.02 × 0.6 | 同上 | `rubber` | | `visible` ← rubber |
| 34 | `surface-carpet` 地毯 | void-deck | bevelBox 0.6 × 0.012 × 0.6 | 同上 | `plastic` 毛面 tint | | `visible` ← carpet |
| 35 | `surface-sand` 沙盘 | void-deck | 浅木框 + 沙面（box + 低频起伏，用 `extrude` 近似） | 同上 | `wood` + `plastic` 沙色 | | `visible` ← sand |
| 36 | `swing-frame` 秋千架 | void-deck | tube A 字架 × 2 + 横梁 | (8.0, 1.2, 0)，高 2.45、跨 3.2 | `powder` tint 绿灰 | | |
| 37 | `swing-seat` 秋千 | void-deck | box 座板 0.45 × 0.04 × 0.18 + 链 tube × 2（2.0 m） | 挂点 (8.0, 2.40, 0) | `rubber` + `steel` | | `play` ← `swing-run`（angle，绕挂点、沿 Z 轴） |
| 38 | `bicycle-frame` 自行车车架 | void-deck | tube 车架、前叉、车把、车座（倒放） | (1.0, 0.55, 1.6) | `powder` | | 车座、车把着地 |
| 39 | `front-wheel` 前轮 | void-deck | torus 轮胎 + 轮圈 + 辐条 `fins` 放射（示意 16 根） | 前 | `rubber` + `steel` | | 不转 |
| 40 | `rear-wheel` 后轮 | void-deck | 同上 Ø 0.66 | 后，轴心 y 0.95 | `rubber` + `steel` | | 动画 `wheel-spin`（`rpm` ← `wheel-rpm`） |
| 41 | `crank-pedals` 曲柄与踏板 | void-deck | tube 曲柄 × 2 + box 踏板 + 牙盘 lathe + 链条 tube | 中轴 | `steel` | | 动画 `crank-spin`（`rpm` ← `crank-rpm`） |
| 42 | `bicycle-dynamo` 自行车发电机 | void-deck | lathe 瓶身 Ø 0.032 × 0.09 + 摩擦轮 | 后叉，压在后轮胎侧 | `casing` | ✓ | 姿态 `dynamo-off`（离开轮胎 8°） |
| 43 | `dynamo-magnet` 发电机磁铁 | void-deck | cylinder Ø 0.018 × 0.03（两半 `token:pole-n` / `token:pole-s` 与 `magnets` 一致） | 瓶内 | 漆 | | 动画 `magnet-spin`（`rpm` 示意） |
| 44 | `dynamo-coil` 发电机线圈 | void-deck | coil r 0.012 丝 0.0008 | 瓶内 | `copper` | | |
| 45 | `dynamo-wires` 车灯导线 | void-deck | tube（发电机 → 车头） | — | `rubber` | | |
| 46 | `headlamp` 车灯 | void-deck | lathe 灯壳 + 透镜 + 灯丝 coil extra | 车头 | `casing` + `glass` | | `glow` ← `brightness`（full 100，sqrt） |
| c1 | `block-structure` 楼体 | context | 楼板、柱、后墙、侧墙、女儿墙、窗洞（`panelHole`）、省略带断口，同材质合并 | — | `enamel` + `powder` | | 不可选 |
| c2 | `flat-furniture` 家具 | context | 茶几、电视柜、厨房台面、窗台 | — | `wood` + `enamel` | | |
| c3 | `void-deck-floor` 底层地面 | context | 地砖面 | — | `enamel` | | |
| c4 | `playground-mat` 游乐场地垫 | context | 地垫 | — | `rubber` tint | | |
| c5 | `break-marks` 省略带 | context | 锯齿薄板（柱、井壁断口） | y 3.25–3.75 | `token:ink-3` | | |

- 零件数理由：每件东西都在某一拍里被点名或被标注（§5 本章索引）；能量链卡的每个节点都是一个零件。删减顺序（若超预算）：`front-wheel` 并进车架、`windup-key` 并进玩具、`panel-frames` 并进太阳能板、四种地面并成两件（地砖 / 其他三种用姿态换颜色）。
- **绘制预算**（§4.8）：静止目标 ≤ 70 calls、运转 ≤ 80、上限 100；三角形 < 0.4 M。电路主题 35 件实测静止 71 calls（同材质的不同零件不合并），本主题 46 件靠：太阳能板 12 块 = 1 件 repeat（烘焙合并）、context 同材质合并、小件只用一个材质。

### 3.4 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么） | detail 要点 |
|---|---|---|
| sun | Gives out light and heat; the start of almost every chain | 太阳是我们主要的能源（课纲）；模型里的大小、距离不按比例；新加坡正午晴空约 900 W/m²（F-11） |
| solar-panels | Change light energy into electrical energy | 硅电池片；约五分之一变电、大部分变热（F-12、F-13）；夜里不发电；组屋屋顶板供公共设施（F-9） |
| inverter | Changes the panels' direct current into the kind the block uses | 只说"把板的直流电变成楼里用的交流电"（交流 / 直流细看一句，中学学）；少量变热 |
| lift-motor | Changes electrical energy into kinetic energy to move the lift | 电动机 + 曳引轮；绳子绕过轮；也变热、有嗡声 |
| lift-car | Gains potential energy as it is raised | 升到顶层势能更多；对重（F-32） |
| counterweight | Balances the car so the motor needs less energy | 轿厢上它下；只需补差额（F-32） |
| grid-cable | Brings electrical energy from power stations to the flat | 约 94 % 来自天然气发电（F-6）；电缆也变一点热（示意 2 %） |
| distribution-board | Shares the flat's electrical energy among its circuits | 断路器（链 `circuits` 安全一章，不重复） |
| ceiling-fan（fan-motor / fan-blades） | Changes electrical energy into kinetic energy of the blades and air | 动 60 / 热 38 / 声 2（示意）；空气的动能最后也变成热 |
| led-lamp | Changes electrical energy into light energy, and some heat | LED 40 % 变光（推算，F-15）；白炽 10 % |
| speaker | Changes electrical energy into sound energy | 纸盆前后振动推动空气；约 1 % 变声（F-16） |
| kettle | Changes electrical energy into heat energy in the water | 2,200 W（DESIGN）；约 156 s 烧开 1 L（SIM）；壶身和蒸汽很烫 |
| window-plant | Uses light energy to make food in its leaves | 链 `plant`；土里吸的是水，不是能量（M-4） |
| torch / torch-batteries / torch-led | Batteries store potential energy; the LED changes electrical energy into light | 链 `circuits`；电池不装"电"（M-6） |
| windup-toy / windup-spring | A tightened spring stores potential energy that turns the wheels | 上得越紧跑得越久（示意 1.5 s / 圈） |
| tennis-ball | Has potential energy when held up; kinetic energy as it falls | ITF 数据（F-20）；58 g；1 m 落地约 4.4 m/s（SIM） |
| surface-* | The floor it lands on decides how much energy turns into heat and sound | 硬地弹得高，沙几乎不弹（F-21 示意） |
| swing-seat | Swaps potential energy and kinetic energy as it swings | 最低点最快、最高点瞬间停住（F-24、F-25） |
| bicycle-dynamo / dynamo-magnet / dynamo-coil | Changes kinetic energy of the wheel into electrical energy | 磁铁在线圈旁转动产生电流（链 `magnets`）；不转不发电；效率低、有呼呼声（F-31） |
| headlamp | Changes electrical energy into light energy and heat | 6 V 3 W 白炽（F-29）；越快越亮、到 3 W 附近不再变亮（F-30 示意） |
| rear-wheel / crank-pedals | Carry the kinetic energy from the pedals to the dynamo | 倒放的自行车，踩踏板转后轮 |

### 3.5 HUD 数据

- **规格行**（≤ 4）：`Solar array / 太阳能板` 12 × 1.95 m² · 21 %（design）；`Kettle / 电热水壶` 2,200 W（design，落在 typical 内）；`Bicycle dynamo / 自行车发电机` 6 V · 3 W（typical）；`Tennis ball / 网球` 58 g · Ø 6.7 cm（typical）。
- **PLATE 读数**（`telemetry` ≤ 6，全部 `follow`，SIM）：

| key EN / ZH | follow | unit | decimals |
|---|---|---|---|
| Panel output / 板的电功率 | `panel-power` | kW | 2 |
| In the form we want / 变成想要的形式 | `useful` | % | 0 |
| Heat to the surroundings / 散到周围的热 | `heat` | % | 0 |
| Bounce height / 弹回高度 | `bounce-height` | cm | 0 |
| Speed at the floor / 落地速度 | `impact-speed` | m/s | 2 |
| Lamp power / 车灯功率 | `lamp-power` | W | 2 |

  本章不适用的显示 `—`（E-SIM S5 已有）。块尾 `SIM <chain-state 标签> · <本章控件值>`（如 `SIM BOUNCE · 100 CM · TILE`）。`run-time`、`brightness`、`same-light`、`kept`、`lost` 只在试一试卡片的大号读数里。
- **立面**：`views.section.plane = "xy"`（正面，楼层与屋顶最清楚）。
- **右上卡**：能量链卡（E-EN2），代替零件链路卡；< 1024 px 收进试一试卡片里可折叠的一节（同电路图卡）。
- **镜头预设**（≤ 6）：`rooftop`（屋顶 3/4 俯视，含太阳一角）、`lift-core`（电梯井剖面，X-RAY 下看轿厢与对重）、`living-room`（客厅：吊扇、灯、音箱、茶几）、`kitchen`（水壶近景）、`ball-drop`（落球架，侧视平视，fov 28）、`bicycle`（倒放的自行车与发电机近景）。秋千用第 03 章拍里写的镜头。`hero` = `views.assembled.camera`：整座切片 3/4 前右上，距离约 26 m；`views.cover` 把游乐场裁掉一半，让楼体占宽 70 %。
- **命名剖切**（`views.cuts`）：`dynamo`（过发电机轴线的竖切，露出磁铁与线圈）；`kettle`（过壶中心，露出水与发热盘）。
- **模式组合**：X-RAY 透明 shell（电梯井、机房、水壶、手电筒、玩具、发电机壳），能量流照常；CUTAWAY + FLOW：光能的太阳射线 `clip: false`；EXPLODED：本主题拆开意义不大，只给小拆开距离（每件 0.2–0.5 m，沿 +Z），EXPLODED + FLOW 照引擎禁用；能量条在 EXPLODED 下隐藏。

---

## 4. 引擎

### 4.1 要看得见的物理（课纲 → 画面 → 机制）

| 课纲点 | 画面 | 机制 |
|---|---|---|
| 太阳是主要能源 | 太阳发光，光能小包（黄）射向屋顶、窗台植物 | `light` 流多路径；`sun` glow |
| 光能 → 电能 | 黄色小包进板，蓝色（电）小包出来走电缆，橙色（热）小包从板面往上冒 | 三条流的路径在板处交接；密度 ∝ 占比 |
| 电能 → 动能 + 势能 | 电梯曳引机转、轿厢升到顶层；卡片尾节点"势能" | `lift-at` offset；`motor-spin` |
| 电能 → 动 / 光 / 声 / 热 | 风扇转、灯亮、纸盆振、水壶发热盘发红；各自冒出的小包颜色不同 | `appliance` 选择 → 路径强度、动画 `enabled`、`glow` |
| 势能 ↔ 动能 | 落球、秋千旁的三根能量条随动作实时变化 | 时间线 `bounce-run` / `swing-run`（docs/30 F2）+ `energy-bars` |
| 每次转换都有热和声 | 球每次落地"热和声"条涨一截；秋千越摆越低 | 同上（损失写进动画） |
| 储存的能量 | 发条上紧（X-RAY 看螺旋变紧）、松开后车轮转、慢下来停住 | 姿态 `spring-wound` + 时间线 `toy-run` |
| 动能 → 电能 | 踩踏板，后轮转，发电机磁铁转，车灯亮；越快越亮 | `speed` → `wheel-rpm` / `brightness`；`glow` |
| 能量不会用完 | 只开"热"一层：每件东西都在往外冒热；卡片尾节点"最后几乎全部是热" | LAYERS 单开 `heat`；`gas-to-home` 链 |

### 4.2 `energy` 模型（`lib/sim/energy.ts`，纯函数，有单测）

**parts.json 数据形状**（只写与 E-SIM 核心不同的部分）：

```jsonc
"sim": {
  "kind": "energy",
  "controls": [
    { "id": "chain", "kind": "choice", "default": "whole", "label": {…},          // 不进试一试卡片：章 / 拍 sim.set 选链（同磁铁的 setup）
      "options": [ "whole", "solar", "home", "bounce", "swing", "windup", "torch", "dynamo", "gas-to-home" ] },
    { "id": "sky", "kind": "choice", "default": "clear", "options": [ "clear", "average", "overcast", "night" ], … },
    { "id": "lift-at", "kind": "choice", "default": "ground", "options": [ "ground", "top" ], … },
    { "id": "appliance", "kind": "choice", "default": "fan", "options": [ "fan", "lamp", "speaker", "kettle" ], … },
    { "id": "drop", "kind": "step", "values": [25, 50, 75, 100], "default": 100, "unit": "cm", … },
    { "id": "surface", "kind": "choice", "default": "tile", "options": [ "tile", "rubber", "carpet", "sand" ], … },
    { "id": "winds", "kind": "step", "values": [0, 2, 4, 6, 8], "default": 0, … },
    { "id": "torch-on", "kind": "toggle", "default": false, … },
    { "id": "speed", "kind": "step", "values": [0, 5, 10, 15, 20, 25], "default": 0, "unit": "km/h", … },
    { "id": "dynamo-on", "kind": "toggle", "default": true, … },
    { "id": "lamp-type", "kind": "choice", "default": "led", "options": [ "led", "filament" ], … }
  ],
  "outputs": [
    { "id": "panel-power", "unit": "kW", "decimals": 2 },  { "id": "sun-glow" },
    { "id": "useful", "unit": "%" }, { "id": "heat", "unit": "%" }, { "id": "sound", "unit": "%" },
    { "id": "bounce-height", "unit": "cm" }, { "id": "impact-speed", "unit": "m/s", "decimals": 2 },
    { "id": "kept", "unit": "%" }, { "id": "lost", "unit": "%" },
    { "id": "run-time", "unit": "s" }, { "id": "lamp-power", "unit": "W", "decimals": 2 }, { "id": "brightness", "unit": "%" },
    { "id": "wheel-rpm" }, { "id": "crank-rpm" }, { "id": "lamp-glow" }, { "id": "water-warm" },
    { "id": "same-light", "unit": "%" },
    { "id": "chain-state", "kind": "state", "states": { "whole": {…}, "solar": {…}, … } },
    { "id": "bounce-run", "kind": "timeline" }, { "id": "swing-run", "kind": "timeline" }, { "id": "toy-run", "kind": "timeline" },   // docs/30 F2
    { "id": "paths", "kind": "vector", "from": "paths" },     // 每条流路径的强度 0–1（路径 id → 值）
    { "id": "links", "kind": "vector", "from": "links" }      // 能量链卡每条带的占比（link id → %）
  ],
  "energy": {
    "solar":   { "area": 1.953, "modules": 12, "efficiency": 0.21, "sky": { "clear": 900, "average": 640, "overcast": 150, "night": 0 },
                 "glow": { "clear": 1, "average": 0.8, "overcast": 0.35, "night": 0 } },
    "bounce":  { "g": 9.8, "ratio": { "tile": 0.55, "rubber": 0.40, "carpet": 0.25, "sand": 0.05 }, "slow": 2 },           // → 时间线 bounce-run
    "swing":   { "length": 2.0, "amplitude": 35, "loss": 0.03, "swings": 8, "sample": 0.08 },                                 // → 时间线 swing-run
    "windup":  { "secondsPerTurn": 1.5 },
    "dynamo":  { "imax": 0.55, "v0": 12, "lampOhms": 12, "rated": 3, "wheel": 2.07, "crankRatio": 0.37 },
    "shares":  {                                             // 节点内的占比（相对进这个节点的能量），全部 SIM / 示意，S1
      "panel":   { "electrical": 21, "heat": 75, "light": 4 },
      "inverter":{ "electrical": 95, "heat": 5 },           // 相对进逆变器的 21 → 20 + 1
      "lift":    { "kinetic": 80, "heat": 15, "sound": 5 },
      "fan":     { "kinetic": 60, "heat": 38, "sound": 2 },
      "led":     { "light": 40, "heat": 60 }, "filament": { "light": 10, "heat": 90 },
      "speaker": { "sound": 1, "heat": 99 },
      "kettle":  { "heat-water": 85, "heat": 14, "sound": 1 },
      "battery": { "electrical": 95, "heat": 5 },
      "windup":  { "heat": 95, "sound": 5 },
      "dynamo":  { "electrical": 30, "heat": 65, "sound": 5 },
      "station": { "electrical": 55, "heat": 45 }, "grid": { "electrical": 96, "heat": 4 }
    },
    "chains": {                                              // 能量链卡与流路径：节点 = 零件，带 = 一种形式
      "dynamo": {
        "nodes": [ { "id": "rider", "label": {…} }, { "id": "dyn", "part": "bicycle-dynamo" }, { "id": "lamp", "part": "headlamp" }, { "id": "air", "label": {…}, "sink": true } ],
        "links": [
          { "id": "d-in",    "from": "rider", "to": "dyn",  "form": "kinetic",    "share": "in",               "paths": ["kinetic:pedal-wheel", "kinetic:wheel-dynamo"] },
          { "id": "d-el",    "from": "dyn",   "to": "lamp", "form": "electrical", "share": "dynamo.electrical", "paths": ["electrical:dynamo-lamp"] },
          { "id": "d-heat",  "from": "dyn",   "to": "air",  "form": "heat",       "share": "dynamo.heat",       "paths": ["heat:dynamo"] },
          { "id": "d-sound", "from": "dyn",   "to": "air",  "form": "sound",      "share": "dynamo.sound",      "paths": ["sound:dynamo"] },
          { "id": "l-light", "from": "lamp",  "to": "air",  "form": "light",      "share": "filament.light",    "paths": ["light:headlamp-beam"] },
          { "id": "l-heat",  "from": "lamp",  "to": "air",  "form": "heat",       "share": "filament.heat",     "paths": ["heat:headlamp"] }
        ],
        "active": { "control": "speed", "gt": 0 }, "switch": { "control": "dynamo-on" }
      },
      …                                                      // solar、home、bounce、swing、windup、torch、gas-to-home、whole 同理
    }
  }
}
```

**算法**（`evaluate(data, values) → outputs`，同步、< 1 ms）：

1. `chain-state` = `chain` 控件值。
2. 按 §2.4 的子模型算数输出：`panel-power`、`sun-glow`（天空）；`bounce-height`、`impact-speed`、`kept`、`lost`（落球）；`run-time`（发条）；`lamp-power`、`brightness`、`wheel-rpm`、`crank-rpm`（发电机：踏板转速 = 后轮转速 × `crankRatio`，示意的齿比 0.37）；`lamp-glow`（家里灯：appliance = lamp 时 1，whole 时 0.6，否则 0；第 06 章 LED / 白炽同为 1，亮度一样）；`water-warm`（appliance = kettle 时 1，示意）；`same-light`。不在当前链里的数输出返回 `null`（PLATE 显示 `—`）。
3. `useful` / `heat` / `sound`：当前链"最后一个转换节点"（家里 = 所选电器；太阳能 = 板；发电机 = 发电机 × 灯的乘积；天然气链 = 灯；落球 = `kept` / `lost`；秋千、发条、手电筒按 §2.4）。
4. `links`：沿链从起点（100）传播，`share` 是"in"或 `shares` 里的键（节点内占比 × 进节点的量 ÷ 100），取整到 1，取整误差加到该节点的热带上——**每个节点进出相等**（单测逐链校验）。`active` / `switch` 不成立时整链为 0（夜里、车不转、手电筒没开、发条 0 圈）。
5. `paths`：每条链的每个 link 把它的占比 ÷ 100 写到它列出的流路径上（`<流 id>:<路径 id>`）；一条路径被多个 link 引用时取最大值；`whole` 链取各链默认值 × 0.6；不在当前链里的路径为 0（绑定会淡出）。
6. validate（`sim-schema.ts energyIssues`）：链的节点 `part` 存在、link 的 `from` / `to` 是节点、`form` 是五种流动形式之一或 `potential`（`potential` 的 link 不能列 `paths`）、`share` 键存在、`paths` 的流与路径存在；每个节点进出相等（数据层面：分到各出口的 `shares` 之和 = 100）；每个 `chain` 选项都有链；`useful` 的"最后节点"能找到。

**单测**（`tests/space-scene/energy.test.ts`）：§2.4 A–H 全表（落球 16 格、发电机 6 行、太阳能 4 行、电器 4 行、天然气 2 种灯）逐值；每条链节点守恒；`active` / `switch` 归零；`paths` 与 `links` 的键与数据一致；URL 往返 `sim=chain.bounce~drop.50~surface.sand`。

### 4.3 能量的颜色与小包（流的写法）

五条流，每条一次绘制、多路径（≤ 16 条路径，E-SIM 已有）：

| 流 id | 组 | 色 | 路径（`<id>`：起 → 止） | 小包参数 |
|---|---|---|---|---|
| `light-energy` | light | `token:en-light` | `sun-roof-a`、`sun-roof-b`（太阳 → 两排板）、`sun-plant`（太阳 → 窗台植物）、`panel-reflect`（板 → 斜上方，短）、`lamp-room`（吸顶灯 → 向下三束合一条折线，示意）、`torch-beam`、`headlamp-beam`（车灯 → 前方 1 m） | size 1.6，count 300，speed 1.2（太阳射线快）/ 0.4（屋内短束），`clip: false`（太阳射线），`ends: fade` |
| `electrical-energy` | electrical | `token:en-electrical` | `panel-inverter`、`inverter-motor`、`inverter-grid`（往下到竖井）、`grid-db`（地下 → 配电箱）、`db-fan`、`db-lamp`、`db-speaker`、`db-kettle`、`torch-loop`、`dynamo-lamp` | size 1.3，count 360，speed 0.35，沿导线（与 `tube` 零件同源），`ends: open` |
| `kinetic-energy` | kinetic | `token:en-kinetic` | `motor-car`（曳引轮 → 绳 → 轿厢顶）、`fan-air`（扇叶 → 向下的气流，短）、`toy-run`（发条 → 车轮）、`pedal-wheel`（踏板 → 链 → 后轮）、`wheel-dynamo`（轮胎 → 摩擦轮） | size 1.4，count 240，speed 0.3 |
| `sound-energy` | sound | `token:en-sound` | `speaker-out-a/b/c`（纸盆 → 三个方向扇形）、`fan-hum`、`motor-hum`、`kettle-hiss`、`toy-tick`、`dynamo-whirr` | size 1.2，count 200，speed 0.6，`ends: fade`（向外淡出，像声音散开） |
| `heat-energy` | heat | `token:en-heat` | `panel-heat`（板面 → 上方 0.6 m）、`inverter`、`lift-motor`、`fan`、`lamp`、`speaker`、`kettle-water`（发热盘 → 水里，短环）、`kettle-air`（壶身 → 上方）、`torch`、`dynamo`、`headlamp`、`grid-cable`（竖井沿线，很淡）、`toy`、`db` | size 1.5，count 400，speed 0.15（慢慢升起），`ends: fade`，spread 0.03 |

- **绑定**：`{ "output": "paths", "flow": "<流 id>", "intensity": { "full": 1, "mode": "density" } }` × 5（E-EN4）：每条路径**可见小包的比例** ∝ 强度、速度不变（读成"这一份多 / 少"）；强度 0 的路径 0.3 s 淡出。
- **颜色语义**（全主题唯一）：一种颜色 = 一种能量形式；转换 = 一件零件处颜色换了；不用 `stops` 沿路径变色（会读成"能量在路上慢慢变"）。
- 势能不画流：用能量条（§4.5）和卡片的 `potential` 带表示；轿厢升到顶层时卡片尾节点写"势能"、PLATE 无读数。
- 合计 5 次绘制（运转时）；路径总数 44（每条流 ≤ 16）。

### 4.4 Token（E-EN3）

| token | paper（提议） | cinema（提议） | 说明 |
|---|---|---|---|
| `--en-light` | `#c99a12` | `#f0c64a` | 黄，最亮的一档；不用 `--lamp`（纸色上太淡） |
| `--en-electrical` | `#2f6aa8` | `#6f9fd8` | 蓝；与电路主题的 `--current`（暗金）不同：那里画的是电流，这里画的是能量形式 |
| `--en-kinetic` | `#2e8a6a` | `#5fbf9a` | 青绿 |
| `--en-sound` | `#7d55a0` | `#ae8ad0` | 紫 |
| `--en-heat` | `#c0502c` | `#e8805a` | 橙红，接近 `--hot`（热的语义与 aircon 一致） |
| `--en-potential` | `#7a6232` | `#c4a66a` | 赭褐（"存着的"） |

引擎代理用 skill `dataviz` 的色板校验方法（三种色觉缺陷模拟下两两可分、在纸色与 dark plate 背景上对比 ≥ 3:1）微调明度；色相顺序不变。名称与颜色同时出现在 KEY 图例、卡片带标签、能量条标签里，**不靠颜色单独区分**。

### 4.5 物理回放与能量条（E-EN5、E-EN6）

**回放用 docs/30 的 F2（时间线输出 + `play` 绑定），不另做动画种类。** docs/30（`forces`，2026-10-18 已起草、§0 定稿）为落体、小车、木块、轮子定义了"模型给出时间线、零件按通道回放"的共享件 F2：时间线 = `{ duration, channels }`，通道是分段匀加速段 `[{t0, t1, x0, v0, a}]` 或 ≤ 256 点的采样；值变化后 0.4 s 自动从 0 播放；"再跑一次"按钮与键 `G`；`slow` 放慢倍数并在卡片上写明；深链接、截图、拍的瞬切、REFERENCE、减少动态时直接显示**终态**；`__atlas.engine.simSeek(id, t)`。两个主题谁先施工谁做 F2，另一个只验收。本主题的 `energy` 模型输出三条时间线：

| 时间线输出 | 通道 | 内容 | 终态（截图、深链接看到的） |
|---|---|---|---|
| `bounce-run` | `y`（球心高度，分段匀加速：下落、弹起都是 a = −g）、`pe`、`ke`、`lost`（%，采样） | 从 `drop` 落下 → 第一次落地 → 弹回到 r × `drop` 的最高点（只演一次弹跳）；`slow: 2` | 球停在第一次弹起的最高点：势能 = r × 100、动能 0、热和声 = (1 − r) × 100（地砖 100 cm：55 / 0 / 45） |
| `swing-run` | `angle`（采样，每 0.08 s 一点）、`pe`、`ke`、`lost` | 从 35° 放开，摆 8 次（单程），每次 3 % 的能量变成热和声，摆幅相应递减；周期 2.90 s；约 11.6 s | 停在第 8 次的最高点：剩余 0.97⁸ ≈ 78 %，全部是势能；热和声 22 % |
| `toy-run` | `x`（车沿茶几前进，匀减速段）、`spin`（车轮转角）、`key`（钥匙反转角）、`pe`、`ke`、`lost` | 发条放开：车轮转速从最大线性减到 0，历时 `run-time`；`winds = 0` 时时间线为空 | 车停下：势能 0、动能 0、热和声 100 |

绑定照 docs/30 的写法：`{ "output": "bounce-run", "part": "tennis-ball", "play": { "channel": "y", "axis": [0, 1, 0] } }`；`{ "output": "swing-run", "part": "swing-seat", "play": { "channel": "angle", "turn": [0, 0, 1], "pivot": [8.0, 2.40, 0] } }`（若 F2 的 `play` 还没有 `pivot`，由先做的一方加上，与 `rotate` 绑定的 `pivot` 同义）；`toy-run` 驱动 `windup-toy`（x）、`windup-wheels`（spin，`each`）、`windup-key`（key）。

- **秋千不做永动**：时间线只放 8 次就停在最高点；"再跑一次" = 重新拉到 35° 放开（字幕"再拉起来放开"）。
- **为什么只演一次弹跳**：终态要能说明问题（停在最高点时三根条正好是 55 / 0 / 45）；"一次比一次低"由秋千和配图 `energy-conversion-bounce`（频闪）表达。若 F2 支持"终态不等于最后一帧"，可改成演完全部弹跳、终态取第一次最高点——由 F2 的实现者决定，本主题两种都能用。
- **画面放慢**：落球 `slow: 2`（1 m 落下真实 0.45 s，画面 0.9 s），卡片芯片"slowed down 2 times / 放慢 2 倍"（docs/30 落体用 4 倍；本主题只有一次弹跳，2 倍够看清）；秋千、发条不放慢。

**能量条叠加**（`overlays: energy-bars`，`stages/model3d/SimOverlays.tsx`，与力箭头同一个文件）：

```jsonc
{ "kind": "energy-bars", "timeline": "bounce-run", "near": "drop-pole", "offset": [0.25, 0, 0], "height": 0.6,
  "bars": { "potential": "pe", "kinetic": "ke", "lost": "lost" }, "lostSplit": { "heat": 0.9, "sound": 0.1 } }
```

- 三根竖条（宽 4 cm，间距 2 cm，平涂不受光，面向镜头，1 次绘制）：势能（`--en-potential`）、动能（`--en-kinetic`）、已变成热和声（`--en-heat` 底段 + `--en-sound` 顶段，按 `lostSplit`，示意）；一根 hairline 标出 100 % 高度；**三根条高度之和恒为 100 %**（模型生成通道时保证，单测）。
- 数值直接读时间线通道（跟着回放走；终态即终值），叠加里不重算物理。
- 标签：条下小字 PE / KE / HEAT + SOUND（EN）或 势能 / 动能 / 热和声（ZH），HUD 字体，经 bridge 投影画在 HUD 层（同引线标注的做法，不进 WebGL 文字）；条不在画面里或 EXPLODED 时淡出；手机上照常显示。
- 测试：`__atlas.engine.energyBars()` → `{ [timeline]: { potential, kinetic, lost } }`；单测在若干 t（`simSeek`）校验三者之和 = 100 ± 0.5，t = 0 时势能 100；`winds = 0` 时发条那组条隐藏。

### 4.6 引擎件清单（E-EN）

| # | 件 | 现状（已查代码） | 最小方案 | 退路 | 优先级 |
|---|---|---|---|---|---|
| EN1 | `energy` 模型 `lib/sim/energy.ts` + `sim-schema.ts` 的 `energyIssues` + 注册 | 注册表只有 `circuit`、`magnet`（`lib/sim/index.ts`） | §4.2 | — | 必须 |
| EN2 | **能量链卡** `hud/EnergyCard.tsx` + 排版 `lib/sim/sankey.ts`（纯函数） | 右上卡只有零件链路卡与电路图卡（`hud/PartChainCard`、`hud/CircuitCard`） | 有 `sim.energy` 时代替零件链路卡；标题 ENERGY CHAIN / 能量链；节点按链的拓扑分列（起点左、sink 右），节点 = 零件短名（点 = 选中零件；选中零件描 signal）；带 = 贝塞尔条带，宽 ∝ `links` 的 %（最小 1.5 px），颜色 = 形式 token，带上写 `21 %`（≥ 8 % 的带）；一枚 SIM 芯片 + "在这个模型里"；sink 节点"周围的空气 / The air around"；`potential` 带画成实心块（存着）；换章 / 拍时 0.4 s 交叉淡入；KEY 图例追加势能一行；< 1024 px 收进试一试卡片（同电路图卡）；读屏：卡片有一段 `aria-label` 文字版（"电能 21 % → 电梯曳引机 …"） | 只在试一试卡片里写文字链 | 必须 |
| EN3 | token `--en-*` 六个（paper / cinema） | 无 | `src/theme/tokens.css` + `src/theme/theme.ts` | — | 必须 |
| EN4 | 流强度 `mode: "density"` | `intensity` 只改每条路径的速度（`Flows.tsx`、`flowMaterial.ts`、`lib/sim/bind.ts`） | 每条路径一个"可见比例"uniform：粒子序号 < 比例 × 该路径粒子数时可见，其余 alpha 0（0.3 s 缓动）；速度不变 | 用现有速度模式（通量仍 ∝ 值，但读起来是"快慢"） | 应该 |
| EN5 | **时间线回放**：docs/30 F2（`kind: 'timeline'` 输出、`play` 绑定、再跑一次 / `G`、`slow`、终态、`simSeek`）+ 本主题三条时间线（§4.5） | 代码里还没有（2026-10-18；docs/30 §4.4 F2 已定义）；绑定只有 `offset` / `rotate` 缓动与 `settle` | `forces` 先施工：本主题只在 `energy.ts` 里写三条时间线并验收 F2；本主题先施工：E-B 按 docs/30 F2 的定义实现（含 `play` 的 `pivot`），docs/30 只验收 | 只用 `offset` 缓动到终态（失去"落下、弹起"的过程） | 必须 |
| EN6 | 叠加 `energy-bars` | `SimOverlays.tsx` 只有力箭头 | §4.5 | 只在试一试卡片显示数字 | 必须 |
| EN7 | SpaceScene 章 state 加 `note`（背景章的阅读说明）；这是 docs/30 F0（SpaceScene 下的背景章，"缺什么补什么"）里会碰到的具体缺口 | `spaceChapterState` 是 strict，没有 `note`；`SceneHost.chapterNote` 与 `InfoPanel` 已能画；SpaceScene 还没有主题用过背景章 | schema 加 `note: bilingual.optional()`，validate：只允许 `kind: background` 的章写；与 docs/30 F0 同一件，谁先施工谁做 | 把说明写进正文第一段 | 必须（小） |
| EN8 | `pnpm shoot` 与 `__atlas`：`energyBars()`；`--beats` 截时间线终态（F2 的规则）；`--keys` 含 `G`（F2） | `--beats` 已应用拍的 `sim.set` | 加一个读取函数；其余随 F2 | — | 必须（小） |

**不需要新做的**（已存在）：多路径流、`glow` / `tint` / `visible` / `offset` / `pose` / `rpm` / `enabled` 绑定、试一试卡片、数据表、先猜后看、`coil` / `lathe` / `blades` / `fins` / `extrude` / `panelHole`、背景章的章节轴与编号（`core/chapters.ts`、SpaceScene `View.tsx` 已处理 `isBackground`）。

### 4.7 文件归属（两个 Opus 引擎代理并行；主会话不预装依赖，本主题不需要新依赖）

| 代理 | 拥有的文件 | 不碰 |
|---|---|---|
| **E-A（模型与卡片）** EN1、EN2、EN7、EN8 的 `__atlas` 部分 | `src/engines/space-scene/lib/sim/energy.ts`、`lib/sim/sankey.ts`、`lib/sim/index.ts`（注册一行）、`sim-schema.ts`、`schema.ts` 的 `spaceChapterState.note` 一行、`hud/EnergyCard.tsx`、`View.tsx`（卡片槽选择、KEY 势能行）、`space-scene.css` 的卡片段、`scripts/validate-content.ts`（energy 校验接入）、`tests/space-scene/energy.test.ts`、`tests/space-scene/sankey.test.ts`、docs/06 新节「SpaceScene · 试一试 · 能量（energy）」 | 舞台目录、tokens |
| **E-B（舞台）** EN3、EN4、EN6、EN8 的 shoot 部分；EN5 的 F2 本体（仅当 `forces` 尚未施工） | `stages/model3d/SimOverlays.tsx`（能量条）、`stages/model3d/Flows.tsx`、`stages/model3d/flowMaterial.ts`、`lib/sim/bind.ts`（density 模式；若做 F2 另加 `play`）、`stages/model3d/PartNode.tsx`（仅 F2）、`src/theme/tokens.css`、`src/theme/theme.ts`、`scripts/shoot.ts`、`tests/space-scene/energy-bars.test.ts`（若做 F2：`tests/space-scene/timeline.test.ts`，与 docs/30 F9 同名同内容）；docs/06 的叠加与 density 两段交给 E-A 汇总（E-B 在交付说明里写好文字） | `lib/sim/energy.ts`、卡片 |

- 合并顺序：E-A 的 `schema.ts` 一行先进；E-B 再改动画联合。docs/06 只由 E-A 写。
- 两个代理都不改 `package.json`、不提交；主会话验收后提交。

### 4.8 引擎验收

- [ ] 单测：`energy.test.ts`（§2.4 全表、节点守恒、归零、URL）；`sankey.test.ts`（布局确定、带宽和 = 节点值、最小宽）；`energy.test.ts` 另含三条时间线（落地时刻 = √(2h/g)、弹回最高点 = r × h、摆的周期 2.90 s 与 8 次后剩 78 %、发条在 `run-time` 停、每个采样 pe + ke + lost = 100）；`energy-bars.test.ts`（读通道、终态 = 时间线最后的值）；F2 若由本主题实现，`timeline.test.ts` 照 docs/30 F9。
- [ ] 已发布的 SpaceScene 主题（aircon、grasshopper、b200-server、muscles-*、digestive-system、plant、water、circuits、magnets、sample-space）`pnpm shoot <slug> --beats` 不回归；`circuits`、`magnets` 的试一试照常（density 模式不影响默认的速度模式）。
- [ ] 能量链卡：两套主题、EN / ZH、1600 × 900 与 1920 × 1080 都不溢出；带宽目测与百分数一致；点节点 = 选中零件；读屏文字版存在。
- [ ] 确定性：同一深链接两次截图像素一致（时间线终态）。
- [ ] 性能：模型 < 1 ms；能量条 1 次绘制；五条能量流各 1 次；`frameloop: 'demand'` 下回放只在播放中请求帧，终态停帧（F2 规则）。
- [ ] docs/06 新节写清数据形状、算法、动画参数、叠加、validate 规则；docs/08 §2 不需要改（右上卡的替换规则同电路图卡）。

---

## 5. 章节

### 5.0 总表

`layers` 不写 = 全部组；"能量层"= 五个只有流的组。镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | view | run | cutaway | hide | sim.set | labels | 镜头 |
|---|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start: what energy is / 开始之前：什么是能量 | assembled | true | none | — | chain whole | sun, solar-panels, lift-car, fan-blades, kettle, bicycle-dynamo | hero |
| 01 | `energy-from-the-sun` | Energy from the Sun / 来自太阳的能量 | assembled | true | none | — | chain solar, sky clear | sun, solar-panels, inverter, lift-motor | rooftop |
| 02 | `electrical-energy-at-home` | Electrical energy at home / 家里的电能 | assembled | true | none | — | chain home, appliance fan | grid-cable, distribution-board, fan-blades, led-lamp, speaker, kettle | living-room |
| 03 | `up-high-and-moving` | Up high, moving fast / 举高与运动：势能和动能 | assembled | true | none | — | chain bounce, drop 100, surface tile | tennis-ball, drop-pole, surface-tile | ball-drop |
| 04 | `stored-energy` | Stored energy / 储存的能量 | assembled | true | none | — | chain windup, winds 0 | windup-toy, windup-spring, windup-key, torch | living-room（拉近茶几） |
| 05 | `pedal-power` | Pedal power: making electrical energy / 踩出来的电能 | assembled | true | none | — | chain dynamo, speed 0, dynamo-on true | rear-wheel, bicycle-dynamo, headlamp, crank-pedals | bicycle |
| 06 | `never-used-up` | Energy is never used up / 能量不会用完 | assembled | true | none | — | chain gas-to-home, lamp-type led | grid-cable, led-lamp, distribution-board | hero |

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note`（E-EN7）草稿：EN "This block is a model. Only its ground floor and top floor are drawn; the floors in between are left out, and the Sun is not to scale. Each form of energy has one colour wherever it appears. The percentages are worked out in this model from rounded values (marked SIM); real machines vary, and the sources say where each number comes from." / ZH "这座组屋是模型：只画了底层和顶层，中间的楼层省略了；太阳的大小和距离不按比例。每种能量形式在全主题里只用一种颜色。百分数是在这个模型里按取整的数值算出来的（标 SIM）；真实的机器各不相同，每个数字的出处见来源。"
- **summary**：Energy is what makes things work. It comes in different forms, and machines change it from one form into others. / 能量让事物能够工作。能量有不同的形式，机器把它从一种形式转换成别的形式。
- **正文提纲**：① 课纲三条要点（F-1）：能量让事物工作；形式可以转换；有些能源会耗尽。② 六种形式各举身边一例（F-2），势能 = 储存的能量。③ 怎么读这个模型：颜色、小包、卡片、能量条。④ 三个探究问题（第 74 页）引出后面六章。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero，`whole` 链，能量层全开） | Energy is what makes things work: it lights a room, turns a fan, boils water and lifts a lift. This block shows where some of that energy comes from and where it goes. / 能量让事物能够工作：照亮房间、转动风扇、烧开水、把电梯升上去。这座组屋显示了一部分能量从哪里来、到哪里去。 |
| 2 | 镜头不动；labels sun, solar-panels, fan-blades, speaker, kettle；卡片 `whole` | Each form of energy has its own colour here: yellow for light, blue for electrical, green for kinetic, purple for sound and orange for heat. / 在这里每种能量形式有自己的颜色：黄色是光能，蓝色是电能，绿色是动能，紫色是声能，橙色是热能。 |
| 3 | camera ball-drop；chain bounce；能量条出现 | Potential energy is stored energy, so it is drawn as a bar, not as a moving stream. A ball held up high has it; so do a wound spring and a battery. / 势能是储存的能量，所以画成一根条，而不是流动的小点。举高的球有势能，上紧的发条和电池也有。 |
| 4 | 回 hero；chain whole | Follow any stream into a machine: energy goes in as one form and comes out as other forms. None of it disappears. / 跟着任何一条流走进一台机器：能量以一种形式进去，以别的形式出来，一点也不会消失。 |

- **试一试**：无。
- **细看**：`Heat is not a substance`（M-5，P4 学过：热是能量的一种形式，从较热处流向较冷处；链 `<TopicLink slug="aircon" ch="where-the-air-goes">`）；`How the percentages are worked out`（§2.4 总规则：进 = 出、取整）；`Where this topic links`（各主题链接一句一个）。
- **本章索引**：sun, solar-panels, lift-car, fan-blades, led-lamp, speaker, kettle, tennis-ball, bicycle-dynamo
- **名词首现**：energy、form-of-energy、kinetic-energy、potential-energy、light-energy、electrical-energy、sound-energy、heat-energy。

### 5.2 第 01 章 `energy-from-the-sun`

- **summary**：Light from the Sun reaches the roof, where solar panels change part of it into electrical energy. Most of the energy we use came from the Sun in some way. / 太阳光照到屋顶，太阳能板把其中一部分转换成电能。我们用的大多数能量都以某种方式来自太阳。
- **正文提纲**：① 太阳是主要能源，给光和热（F-3、M-11）。② 屋顶板：光能 → 电能，大约五分之一，其余大多变热（F-12、F-13）；组屋屋顶板供公共设施、多余进电网（F-9，§0-5 ⑥）。③ 电梯：电能 → 动能，轿厢升高（势能，第 03 章细讲）。④ 能源来自太阳的几条路：植物（链 `plant`）、食物、天然气（F-5）、水循环与风（链 `water`）。⑤ 新加坡的太阳能：2.1 %（2024 年，F-6）、登格浮动光伏（F-8）、全国目标（F-10）。配图 `energy-conversion-sun-sources`（④ 段后）、`energy-conversion-tengeh`（⑤ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（rooftop，晴天） | The Sun gives out light and heat. On a clear Singapore noon, about nine hundred watts of sunlight fall on every square metre of this roof. / 太阳发出光和热。新加坡晴天正午，这片屋顶每平方米大约照到九百瓦的阳光。 |
| 2 | labels solar-panels, inverter, rooftop-cables；卡片显示板节点 | Solar panels change light energy into electrical energy. In this model about a fifth of the light becomes electrical energy; most of the rest warms the panels. / 太阳能板把光能转换成电能。在这个模型里，大约五分之一的光变成电能，其余大部分让板变热。 |
| 3 | camera lift-core；X-RAY；sim lift-at top；labels lift-motor, lift-car, counterweight | On HDB blocks, rooftop panels power shared services such as the lifts, corridor lights and water pumps. The lift motor changes electrical energy into kinetic energy and raises the car. / 组屋屋顶的太阳能板为电梯、走廊灯、水泵这些公共设施供电。电梯的电动机把电能转换成动能，把轿厢升上去。 |
| 4 | camera rooftop；sim sky night | At night there is no sunlight, so the panels give no electrical energy. The block then takes all its electrical energy from the grid. / 夜里没有阳光，太阳能板不产生电能。这时整座楼的电能都从电网来。 |
| 5 | sim sky clear；camera 拍内（窗台植物近景）；labels window-plant, sun | Plants take in light energy too, and use it to make food in their leaves. The food we eat, and the natural gas burnt in most of Singapore's power stations, hold energy that first came from the Sun. / 植物也接收光能，用它在叶子里制造食物。我们吃的食物、新加坡大多数发电厂烧的天然气，里面的能量最初都来自太阳。 |

- **试一试**：`vary: sky`，`keep: [{ en: "Same panels, same angle", zh: "同样的板、同样的倾角" }]`，`observe: [panel-power, useful]`，`record: true`；`predict`：prompt "Night falls. What happens to the panels' electrical output?" / "天黑了，板产生的电能会怎样？"，`start: { sky: clear }`，`change: { sky: night }`，`observe: panel-power`，options 变少 `less` / 变成零 `zero` / 不变 `same`。
- **细看**：`Tengeh floating solar farm`（F-8：60 MWp、约 122,000 块板、45 公顷、2021 年启用、供 PUB 五座水厂、约 7 %；登格蓄水池是 1975–1981 年筑坝的河口蓄水池之一，`<TopicLink slug="four-taps" ch="damming-the-rivers">`）；`How natural gas holds the Sun's energy`（F-5）；`The simulated panel`（§2.4 A 表；板温、灰尘不计；1.953 m² × 900 × 0.21 = 369 W）；`Plants and the soil`（M-4；`<TopicLink slug="plant" ch="leaves-make-food">`）。
- **本章索引**：sun, solar-panels, panel-frames, inverter, rooftop-cables, lift-motor, lift-car, window-plant
- **名词首现**：solar-panel、energy-resource、fossil-fuel、natural-gas、energy-conversion。

### 5.3 第 02 章 `electrical-energy-at-home`

- **summary**：Electrical energy reaches the flat through the grid. Each appliance changes it into the form we want, and always into some heat as well. / 电能经电网送到家里。每件电器把它转换成我们想要的形式，同时总有一部分变成热。
- **正文提纲**：① 电从哪里来：电网、发电厂、天然气约 94 %（F-6）。② 四件电器四种转换（§2.4 B）：风扇（动能）、灯（光能）、音箱（声能）、水壶（热能）；每件都有热（大多是不想要的）。③ 水壶：想要的就是热；约两分半钟烧开 1 L（SIM，F-17、F-18）。④ 读能量链卡：带越宽，那一份越多。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（living-room）；labels grid-cable, distribution-board；卡片 home | Most of the flat's electrical energy comes through the grid from power stations. In 2024 about ninety-four per cent of Singapore's electricity was made from natural gas. / 家里的电能大多经电网从发电厂送来。二零二四年，新加坡大约百分之九十四的电是用天然气发的。 |
| 2 | sim appliance fan；labels fan-motor, fan-blades | A fan's motor changes electrical energy into kinetic energy: the blades turn and push the air. The motor also warms up and hums. / 风扇的电动机把电能转换成动能：扇叶转动，推动空气。电动机也会变热、发出嗡嗡声。 |
| 3 | sim appliance lamp；labels led-lamp | A lamp changes electrical energy into light energy, and some into heat. In this model an LED lamp turns about four tenths of its electrical energy into light. / 灯把电能转换成光能，也有一部分变成热。在这个模型里，LED 灯大约把十分之四的电能变成光。 |
| 4 | sim appliance speaker；labels speaker, speaker-cone | A speaker changes electrical energy into sound energy. Only about one part in a hundred becomes sound; the rest becomes heat. / 音箱把电能转换成声能。一百份里只有大约一份变成声音，其余都变成热。 |
| 5 | camera kitchen；sim appliance kettle；cutaway kettle；labels kettle, kettle-element, kettle-water | A kettle changes electrical energy into heat in the water. In this model it brings one litre from thirty degrees to the boil in about two and a half minutes, and it hisses as it heats. / 电热水壶把电能转换成水里的热。在这个模型里，它大约两分半钟把一升三十摄氏度的水烧开，烧的时候还会嘶嘶响。 |

- **试一试**：`vary: appliance`，`keep: [{ en: "Same supply", zh: "同样的供电" }]`，`observe: [useful, heat]`，`record: true`；`predict`：prompt "Switch from the fan to the speaker. Will more or less of the energy end up in the form we want?" / "从风扇换成音箱，变成想要的形式的那一份会更多还是更少？"，`start: { appliance: fan }`，`change: { appliance: speaker }`，`observe: useful`，options 更多 `more` / 更少 `less` / 差不多 `same`。
- **细看**：`Where Singapore's electricity comes from`（F-6 全部数字，太阳能 2.1 %）；`The simulated kettle`（Q = 1.0 kg × 4,186 × 70 = 292.6 kJ；÷ (2,200 W × 0.85) ≈ 156 s；壶身和蒸汽很烫）；`Even the fan's breeze ends as heat`（空气的动能最后在房间里变成热，第 06 章接上）。
- **本章索引**：grid-cable, distribution-board, fan-motor, fan-blades, led-lamp, speaker, speaker-cone, kettle, kettle-element
- **名词首现**：grid、power-station。

### 5.4 第 03 章 `up-high-and-moving`

- **summary**：Anything raised up has potential energy. As it falls the potential energy changes into kinetic energy, and every bounce or swing changes some of it into heat and sound. / 被举高的东西有势能。落下时势能转换成动能；每弹一次、每摆一次都有一部分变成热和声。
- **正文提纲**：① 举高 → 势能多（轿厢在顶层、球在 1 m）。② 落下：势能 → 动能，越落越快（F-23）。③ 弹起：动能 → 势能，但弹不回原高；差的那部分变成热和声（M-8、F-20）；地面不同，变成热和声的多少不同（F-21）。④ 秋千：最高点势能最多、瞬间停住；最低点动能最多、最快（F-24）；越摆越低（M-9、F-25）。配图 `energy-conversion-bounce` 放 ③ 后。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | camera lift-core；sim chain solar, lift-at ground → top；labels lift-car, counterweight | Raise something and you store energy in it. The lift car at the top floor has more potential energy than it had at the ground floor. / 把东西举高，就把能量储存在它里面。轿厢在顶层时的势能比在底层时多。 |
| 2 | 本章（ball-drop，100 cm，地砖）；RUN；能量条 | A tennis ball held one metre above a hard floor has potential energy. Let go: as it falls, potential energy changes into kinetic energy, and it reaches the floor at about four point four metres a second. / 网球举在硬地面上方一米处，有势能。松手后，它一边下落，势能一边转换成动能，落地时速度大约每秒四点四米。 |
| 3 | 同上；labels tennis-ball, surface-tile | It bounces back to about fifty-five centimetres. The rest of the energy has not vanished: the squashed ball and the floor warmed a little, and the bounce made a sound. The bars still add up to the same total. / 它弹回到大约五十五厘米。其余的能量并没有消失：被压扁的球和地面变暖了一点，落地还发出了声音。三根条加起来还是一样多。 |
| 4 | sim surface sand；labels surface-sand | On sand the ball hardly bounces. Almost all its energy changes into heat and sound as it pushes the sand aside. / 落在沙上，球几乎不弹。推开沙子的时候，它的能量几乎全部变成了热和声。 |
| 5 | camera 拍内（游乐场秋千，侧视）；sim chain swing；labels swing-seat, swing-frame | A swing changes potential energy into kinetic energy and back again. It moves fastest at the lowest point and stops for an instant at each highest point. / 秋千把势能转换成动能，又转换回势能。它在最低点最快，在每个最高点停住一瞬间。 |
| 6 | 同上，回放终态（第 8 次的最高点） | Each swing is a little lower, because some energy becomes heat and sound at the hooks and in the air. Without a push it slowly stops. / 每一次都摆得低一点，因为一部分能量在挂钩处和空气里变成了热和声。没人推，它就慢慢停下来。 |

- **试一试**：`vary: drop`，`also: [surface]`，`keep: [surface, { en: "Same ball", zh: "同一只球" }]`，`observe: [bounce-height, impact-speed]`，`record: true`；`predict`：prompt "Drop the ball from twice the height. How high will it bounce?" / "从两倍的高度放手，球会弹多高？"，`start: { drop: 50 }`，`change: { drop: 100 }`，`observe: bounce-height`，options 更高 `more` / 更低 `less` / 一样 `same`。卡片下方注："画面放慢了一半 / The motion is shown at half speed"。
- **细看**：`Energy is not a force`（M-2：力是推或拉；球往下掉是地球的引力拉它；能量是让它能工作的东西；`forces` 已有主题目录时链 `<TopicLink slug="forces" ch="gravity-and-weight">`）；`How much energy is in the ball`（58 g × 9.8 × 1 m ≈ 0.57 J，焦耳在中学会学；只此一处）；`The lift's counterweight`（F-32）；`About this model`（不计空气阻力；地面弹回比除地砖外是示意；秋千每次损失 3 % 是示意；中学会学到势能有重力势能、弹性势能等细分名字——全主题唯一一次提到细分词）。
- **本章索引**：lift-car, counterweight, tennis-ball, drop-pole, surface-tile, surface-rubber, surface-carpet, surface-sand, swing-seat, swing-frame
- **名词首现**：fair-test。

### 5.5 第 04 章 `stored-energy`

- **summary**：Energy can be stored as potential energy, in a tightened spring, in a battery or in food, and changed into other forms when it is needed. / 能量可以以势能的形式储存：在上紧的发条里、在电池里、在食物里，需要时再转换成别的形式。
- **正文提纲**：① 发条：转钥匙时手的动能存进发条（势能）；松开后变动能、声，跑完都变成热（§2.4 E）。② 上得越紧，存得越多，跑得越久（试一试）。③ 手电筒：电池的势能 → 电能 → 光能和热能（§2.4 F）；电池里不是"装着电"（M-6），链 `circuits`。④ 食物也是储存的能量：身体把它变成动能和热（F-27），链 `digestive-system`；食物的能量最初来自太阳（接第 01 章）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（茶几近景，X-RAY）；sim winds 0 → 6；pose spring-wound；labels windup-key, windup-spring | Turning the key winds a spring tight inside the toy. The kinetic energy of your hand is stored in the spring as potential energy. / 转动钥匙，把玩具里的发条上紧。手的动能以势能的形式储存在发条里。 |
| 2 | RUN；能量条（发条）；labels windup-toy, windup-wheels | Let go and the spring unwinds, turning the wheels. Its potential energy changes into kinetic energy, and into sound as the toy ticks along. When it stops, that energy has become heat. / 一松手，发条松开，带动车轮转动。它的势能转换成动能，玩具一路嗒嗒响，也有声能。停下来时，这些能量都变成了热。 |
| 3 | sim chain torch, torch-on true；labels torch, torch-led | A torch's batteries store potential energy. Close the switch and it changes into electrical energy, then into light and heat at the bulb. / 手电筒的电池储存着势能。合上开关，势能转换成电能，再在灯泡处变成光能和热能。 |
| 4 | X-RAY 手电筒近景；labels torch-batteries | A battery does not hold electricity the way a tank holds water. The substances inside store energy, and only when the circuit is closed does it change into electrical energy. When they are used up, the battery is flat. / 电池并不像水箱装水那样装着电。电池里的物质储存着能量，只有电路闭合时，它才转换成电能。这些物质反应完了，电池就没电了。 |
| 5 | 回茶几全景；labels windup-toy, torch | Food is a store of potential energy too. Your body changes it into kinetic energy and heat when you move, even when you wind up a toy. / 食物也是储存势能的东西。你活动时，身体把它转换成动能和热，连上发条也是这样。 |

- **试一试**：`vary: winds`，`also: [torch-on]`，`keep: [{ en: "Same toy, same table", zh: "同一只玩具、同一张桌子" }]`，`observe: [run-time]`，`record: true`。
- **细看**：`Batteries, current and energy`（M-6；`<TopicLink slug="circuits" ch="inside-a-torch">`、`ch="more-batteries"`）；`Food and your body`（F-27：大约四分之一能变成踩踏板这样的功，其余变热，所以运动时身体发热；`<TopicLink slug="digestive-system" ch="a-meals-journey">`）；`About this model`（1.5 s / 圈、热 95 / 声 5 是示意）。
- **本章索引**：windup-toy, windup-spring, windup-key, windup-wheels, torch, torch-batteries, torch-led
- **名词首现**：—（"储存的能量"并进 potential-energy 的定义；电池沿用 `circuits` 的说法，不另立名词）。

### 5.6 第 05 章 `pedal-power`

- **summary**：A dynamo changes kinetic energy into electrical energy. Turn the wheel faster and the lamp glows brighter; stop, and it goes out. / 自行车发电机把动能转换成电能。轮子转得越快，车灯越亮；一停下，灯就灭。
- **正文提纲**：① 倒放的自行车、发电机压着轮胎、导线到车灯。② 里面：磁铁在线圈旁转动，产生电流（F-29，链 `magnets`）。③ 越快越亮，到 3 W 附近不再明显变亮（F-30）；不转不亮（M-7）。④ 接上发电机更难踩（M-10）：电能来自你的动能；发电机效率低，大部分变热和声，灯里又大部分变热——踩出来的能量只有大约 3 % 变成光（SIM，§2.4 G）。⑤ 发电厂是同一个道理的大规模版本：烧天然气推动涡轮，涡轮带动发电机（F-7）。配图 `energy-conversion-power-station` 放 ⑤。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（bicycle）；speed 0；labels rear-wheel, bicycle-dynamo, headlamp | This bicycle stands upside down so its back wheel can turn freely. A small dynamo presses on the tyre and is wired to the lamp. / 这辆自行车倒放着，后轮可以自由转动。一个小发电机压在轮胎上，用导线接到车灯。 |
| 2 | sim speed 15；RUN；labels crank-pedals, rear-wheel, bicycle-dynamo | Turn the pedals and the wheel spins the dynamo. The dynamo changes kinetic energy into electrical energy, and the lamp lights up. / 踩动踏板，车轮带动发电机转动。发电机把动能转换成电能，车灯亮了。 |
| 3 | cutaway dynamo；X-RAY；labels dynamo-magnet, dynamo-coil | Inside, a magnet spins beside a coil of wire. A moving magnet near a coil makes a current flow in it. / 发电机里面，一块磁铁在一圈圈导线旁边转动。磁铁在线圈旁运动，线圈里就有电流。 |
| 4 | sim speed 25；cutaway none；labels headlamp | Pedal faster and the lamp glows brighter. In this model the lamp gets about two watts at fifteen kilometres an hour, and close to its full three watts at twenty-five. / 踩得越快，车灯越亮。在这个模型里，时速十五公里时车灯大约得到两瓦，时速二十五公里时接近满额的三瓦。 |
| 5 | sim speed 0 | Stop turning and the lamp goes out at once. The dynamo gives electrical energy only while it is being turned. / 一停下，车灯马上熄灭。发电机只有在转动时才产生电能。 |
| 6 | sim speed 15, dynamo-on false；pose dynamo-off | Pull the dynamo off the tyre and the wheel is easier to turn, but the lamp stays dark. With it on you must push harder: the electrical energy comes from your kinetic energy. / 把发电机从轮胎上扳开，车轮更好转，但车灯不亮。压上时要更用力：电能来自你踩踏板的动能。 |

- **试一试**：`vary: speed`，`also: [dynamo-on]`，`keep: [{ en: "Same lamp, same dynamo", zh: "同一盏灯、同一个发电机" }]`，`observe: [lamp-power, brightness]`，`record: true`；`predict`：prompt "Stop pedalling. What happens to the lamp?" / "停止踩踏板，车灯会怎样？"，`start: { speed: 15 }`，`change: { speed: 0 }`，`observe: lamp-power`，options 慢慢变暗 `less` / 马上熄灭 `zero` / 不变 `same`（观察到"变成零"；字幕解释"马上"）。
- **细看**：`Magnets and coils`（`<TopicLink slug="magnets" ch="making-magnets">`：电流法制磁铁的反过来——磁铁运动产生电流，中学会学"电磁感应"）；`Why the lamp stops getting brighter`（F-30：线圈限制了电流，设计成灯不会烧坏；模型公式与表）；`Power stations`（F-6、F-7：联合循环燃气电厂，约 55 % 变成电能、其余变热，示意）；`Where the pedalling energy goes`（§2.4 G 链：100 → 电 30 → 光 3）。
- **本章索引**：crank-pedals, rear-wheel, bicycle-dynamo, dynamo-magnet, dynamo-coil, dynamo-wires, headlamp
- **名词首现**：dynamo、generator。

### 5.7 第 06 章 `never-used-up`

- **summary**：Energy is never used up. At every step it changes form, and in the end most of it spreads out as heat that is hard to use again. Saving energy means wasting less of it along the way. / 能量不会用完。每一步它都在转换形式，最后大多散成很难再利用的热。节约能源，就是让路上浪费的少一些。
- **正文提纲**：① 跟一份能量从天然气走到灯（§2.4 H）：每一步都有热；没有一份消失（F-26，M-1）。② 只开"热"一层：所有东西都在散热（这一拍是本章的招牌画面）。③ 灯的选择：白炽约 10 % 变光、LED 多得多；同样亮，LED 只要大约四分之一的电能（F-15，试一试）。④ 为什么要节约能源（课纲价值观）：天然气会耗尽、发电产生的热和二氧化碳；做法：随手关、LED、空调 25 °C（F-33，链 `aircon`）。⑤ 回到太阳：几乎所有这些能量最初都是太阳光。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero）；chain gas-to-home；labels grid-cable, distribution-board, led-lamp；卡片 gas-to-home | Follow energy from natural gas to a lamp in the flat. At the power station, in the cables and at the lamp, some changes into heat each time. None of it disappears. / 跟着能量从天然气走到家里的一盏灯。在发电厂、在电缆里、在灯里，每一步都有一部分变成热，但没有一份消失。 |
| 2 | layers 只开 heat + 四个零件组；chain whole | Show only the heat. The panels, the lift motor, the fan, the lamp, the kettle and the dynamo are all giving off heat into the air around them. / 只显示热。太阳能板、电梯电动机、风扇、灯、水壶、发电机，都在向周围的空气散热。 |
| 3 | layers 全开；chain gas-to-home，lamp-type filament；labels led-lamp | A filament lamp changes only about a tenth of its electrical energy into light; the rest becomes heat. / 白炽灯只把大约十分之一的电能变成光，其余都变成热。 |
| 4 | sim lamp-type led | An LED lamp turns much more into light, so it needs only about a quarter of the electrical energy for the same light. Less energy is wasted on the way. / LED 灯把多得多的电能变成光，同样亮只需要大约四分之一的电能，路上浪费的也就少了。 |
| 5 | camera living-room；chain home，appliance fan；labels fan-blades | Energy is not used up, but the heat that spreads into the air is hard to turn back into electricity. That is why we save energy: switch off what we are not using, and set the air conditioner at twenty-five degrees or higher. / 能量不会用完，但散进空气里的热很难再变回电。所以我们要节约能源：不用的电器关掉，空调设在二十五摄氏度或更高。 |
| 6 | 回 hero，views.cover 构图；chain whole | Almost all of this energy started out as light from the Sun. / 这里几乎所有的能量，最初都是太阳的光。 |

- **试一试**：`vary: lamp-type`，`keep: [{ en: "Same brightness", zh: "同样的亮度" }]`，`observe: [useful, heat, same-light]`，`record: true`；`predict`：prompt "Change the LED lamp for a filament lamp that is just as bright. Will more or less heat go into the room?" / "把 LED 灯换成一样亮的白炽灯，散进房间的热会更多还是更少？"，`start: { lamp-type: led }`，`change: { lamp-type: filament }`，`observe: heat`，options 更多 `more` / 更少 `less` / 一样 `same`。
- **细看**：`Saving energy, two meanings`（§0-4：课纲说的"节约能源"是少浪费；物理上能量总量不变）；`Why save energy in Singapore`（F-6：燃料几乎全靠进口天然气，会耗尽；`<TopicLink slug="aircon" ch="efficiency-and-use">`）；`The simulated chain`（§2.4 H 全部数字，取整规则）；`Light ends as heat too`（照到墙和家具上的光被吸收后也变成热）。
- **本章索引**：grid-cable, distribution-board, led-lamp, fan-blades, kettle, solar-panels, lift-motor, bicycle-dynamo
- **名词首现**：save-energy、waste。

### 5.8 拍数与配图位置

- 拍数：4 + 5 + 5 + 6 + 5 + 6 + 6 = **37**。
- 配图：01 `energy-conversion-sun-sources`（正文 ④ 后）、`energy-conversion-tengeh`（⑤ 后）；03 `energy-conversion-bounce`（③ 后）；05 `energy-conversion-power-station`（⑤ 后）。图说只写画面里有的东西。

---

## 6. 名词表 `glossary.json`（20 个候选，目标 16–18 个，正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| energy | Energy / 能量 | 让事物能够工作的东西；有多种形式，可以从一种转换成另一种 | form-of-energy |
| form-of-energy | Form of energy / 能量形式 | 动能、势能、光能、电能、声能、热能（P6 课纲列的六种） | energy-conversion |
| kinetic-energy | Kinetic energy / 动能 | 运动的物体具有的能量；越快越多 | potential-energy |
| potential-energy | Potential energy / 势能 | 储存的能量：举高的物体、上紧的发条、拉长的橡皮筋、电池、食物、燃料里都有（细分名字中学学） | kinetic-energy |
| light-energy | Light energy / 光能 | 太阳、灯发出的能量；让我们看见东西 | heat-energy |
| electrical-energy | Electrical energy / 电能 | 电流带着的能量；电器把它转换成别的形式 | grid |
| sound-energy | Sound energy / 声能 | 振动的物体发出的能量，通过空气传到耳朵 | — |
| heat-energy | Heat energy / 热能（热） | 能量的一种形式，从较热的物体传到较冷的物体；不是一种物质 | — |
| energy-conversion | Energy conversion / 能量转换 | 能量从一种形式变成另一种或几种形式；总量不变 | waste |
| energy-resource | Energy resource / 能源 | 我们取得能量的来源：阳光、天然气、风、水、食物……大多数归根结底来自太阳 | fossil-fuel |
| fossil-fuel | Fossil fuel / 化石燃料 | 数百万年前的生物遗骸变成的煤、石油、天然气；会耗尽 | natural-gas |
| natural-gas | Natural gas / 天然气 | 一种化石燃料；新加坡约 94 % 的电用它发（2024） | power-station |
| solar-panel | Solar panel / 太阳能板 | 把光能转换成电能的板；只在有光时工作 | energy-conversion |
| power-station | Power station / 发电厂 | 把燃料或别的能源的能量转换成电能、送进电网的地方 | generator |
| generator | Generator / 发电机 | 让磁铁和线圈相对转动、把动能转换成电能的机器；自行车上的小型叫 dynamo | dynamo |
| dynamo | Dynamo / 自行车发电机 | 由车轮带动的小发电机，给车灯供电 | generator |
| grid | Grid / 电网 | 把电能从发电厂送到全国各处的电线网络 | power-station |
| save-energy | Save energy / 节约能源 | 少浪费能量：不用就关、选用省电的电器；与"能量总量不变"是两回事 | waste |
| waste | Wasted energy / 浪费的能量 | 转换成我们不想要、也很难再利用的形式（大多是散到空气里的热）的那部分能量 | save-energy |
| fair-test | Fair test / 公平测试 | 一次只改一个量、其余保持不变的实验 | — |

（`waste`、`fair-test` 视正文是否用到再删。中文用词按新加坡课本：动能、势能、光能、电能、声能、热能、能量转换、能源、节约能源；"发电机"在新加坡华文里同时指大型与自行车上的，EN 区分 generator / dynamo，ZH 第一次出现写"自行车发电机"。）

---

## 7. 来源与图像

### 7.1 来源计划（P# → 施工时的 S#；访问日期 2026-10-18）

"已检"= 2026-10-18 本 spec 起草时读到原文或可靠摘要；施工代理仍须逐条读原文、写 `note`。

| P# | 来源 | 用于 | 状态 |
|---|---|---|---|
| P1 | 本设计研究（§2.4 全部设计值、占比、算式与结果；三条时间线的参数） | 规格行、PLATE、卡片、细看、字幕 | 本 spec |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*（2023 P3 起实施，Updated Jan 2026），第 14、15–18、20、59、63–64、67、74–80 页。https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf | §1 全部；课纲边界与用词 | 已检（PDF 下载、pdftotext） |
| P3 | SEAB，*PSLE Science (Syllabus 0009), 2026*（评估目标 II） | §2.7 | docs/17 S6，待读本年版 |
| P4 | `circuits` S29 = EMA，*Singapore Energy Statistics 2025*，ch.2 Energy Transformation，Fuel Mix for Electricity Generation。https://www.ema.gov.sg/resources/singapore-energy-statistics/chapter2 | F-6 | 已检（circuits 2026-10-14 浏览器读） |
| P5 | 同 P4（发电装机构成 81.3 %） | F-6 | 同上 |
| P6 | PUB，新闻稿 "Sembcorp and PUB officially open the Sembcorp Tengeh Floating Solar Farm"，2021-07-14。https://www.pub.gov.sg/Resources/News-Room/PressReleases/2021/07/Sembcorp-and-PUB-officially-open-the-sembcorp-tengeh-floating-solar-farm ；PUB *Floating Solar Systems* 页 https://www.pub.gov.sg/sustainability/solar/floatingsystems | F-8 | 已检摘要；读原文 |
| P7 | US EIA，*Natural gas explained*。https://www.eia.gov/energyexplained/natural-gas/ ；*Energy Kids: Natural gas* | F-5 | 已检摘要 |
| P8 | IEA 或 EMA 关于燃气联合循环电厂效率的资料（候选：IEA *Projected Costs of Generating Electricity*；EMA 技术说明） | F-7 | 待找 |
| P9 | HDB，"HDB to Bring Solar Energy to Over 8,000 Blocks through SolarNova Programme"（2022）https://www.hdb.gov.sg/hdb-pulse/news/2022/hdb-to-bring-solar-energy ；HDB *Annual Report 2024/2025*；HDB 2025 年 12 月情况说明（约 5,300 座） | F-9 | 已检摘要；取最新一份读原文 |
| P10 | EMA，*Solar* 页 https://www.ema.gov.sg/our-energy-story/energy-supply/solar ；情况说明 "Singapore to Accelerate Solar Deployment to Meet 3 GWp Solar Target by 2030" | F-10 | 已检摘要 |
| P11 | `plant` S23 = NASA LaRC POWER 逐时数据（新加坡 2023 年；晴空 / 实际天气正午均值） | F-11 | 已检（plant 2026-10-14 下载求平均） |
| P12 | Fraunhofer ISE，*Photovoltaics Report*（2025-05-29 版）。https://www.ise.fraunhofer.de/en/publications/studies/photovoltaics-report.html | F-12、F-13 | 已检摘要；读原文页码 |
| P13 | NREL 关于组件温度与效率（或 OpenStax 相关章节） | F-13 | 待找 |
| P14 | 组件数据表（108 片半片组件尺寸，当典型引，不点名） | F-14 | 待找 |
| P15 | US DOE，*Energy Efficient Lighting* 情况说明（白炽 90 % 热、10 % 光）https://www.energy.gov/sites/default/files/2021-08/ES-EE%20Lighting_080921.pdf ；ENERGY STAR LED 页（至少省 75 %） | F-15 | 已检摘要 |
| P16 | OpenStax，*College Physics 2e* 17.3（音箱效率习题）；Stereophile "Measuring Loudspeakers"（约 1 %） | F-16 | 已检摘要 |
| P17 | 电热水壶典型功率（新加坡零售规格当典型引，不点名）；`circuits` 已引的 230 V、BS 1363 来源 | F-17 | 待找 |
| P18 | OpenStax，*College Physics 2e* 14.2，表 14.1（水 4,186 J/kg·°C） | F-18 | 待读 |
| P19 | 吊扇功率典型值（NEA 或厂商，当典型引） | F-19 | 待找 |
| P20 | ITF，*Rules of Tennis* 附录 I / *ITF Technical Booklet 2023*（球的质量、直径、254 cm 落下弹回 135–147 cm）https://www.itftennis.com/media/4420/2023-technical-booklet.pdf | F-20 | 已检摘要；读条款号 |
| P21 | IOP Spark，"Bounce efficiency" https://spark.iop.org/bounce-efficiency | F-21、M-8 | 已检摘要 |
| P22 | NIST / BIPM 标准重力加速度 9.80665 m/s²；新加坡当地 g（待找测绘或物理资料） | F-22 | 待读 |
| P23 | OpenStax，*College Physics 2e* 2.7（自由落体）、7.6（Conservation of Energy） | F-23、F-26 | 待读 |
| P24 | OpenStax，*College Physics 2e* 16.4（单摆） | F-24 | 待读 |
| P25 | OpenStax，*College Physics 2e* 7.8（人体的功、能与功率，效率表） | F-27 | 待读，表号待核 |
| P26 | OpenStax，*College Physics 2e* 21.2（电动势）；`circuits` 第 01、04 章用到的来源 | F-28、M-6 | 待读 |
| P27 | 自行车发电机 6 V 3 W 规格：德国 StVZO §67 旧版条文或车灯厂技术说明 | F-29 | 待找一手 |
| P28 | OpenStax，*College Physics 2e* 23.1–23.3（电磁感应、发电机） | F-29 | 待读 |
| P29 | 发电机输出随速度、效率的测试（候选：轮毂 / 瓶式发电机的独立测试文章或大学讲义） | F-30、F-31 | 待找；只当定性 |
| P30 | 电梯对重的平衡比例（电梯工程手册或 BCA 电梯安全资料） | F-32 | 待找 |
| P31 | `aircon` 已用的 NEA 能效来源（25 °C、每度约 10 %、能效标签） | F-33 | 已有 |
| P32 | M. Watts，"Some alternative views of energy"，*Physics Education* 18(5)，1983，213–217 | M-1、M-2 | 待读（摘要） |
| P33 | R. Driver, A. Squires, P. Rushworth, V. Wood-Robinson，*Making Sense of Secondary Science: Research into Children's Ideas*（Routledge，1994），能量一章 | M-1、M-3 | 待读，页码待核 |
| P34 | C. F. Herrmann-Abell, G. E. DeBoer，"Investigating a learning progression for energy ideas from upper elementary through high school"，*Journal of Research in Science Teaching* 55，2018（AAAS Project 2061） | M-1、M-2、M-7 | 待读 |
| P35 | Driver 等（P33）植物营养一章；或 IOP / AAAS 关于"植物从土里得到食物"的误解条目 | M-4 | 待读 |
| P36 | Driver 等（P33）热与温度一章；E. Erickson 关于儿童"热是物质"想法的研究 | M-5 | 待读 |

### 7.2 参考图（`scripts/geo/energy-conversion/refs/`，gitignore，不发布）

| # | 内容 | 候选来源 | 看什么 |
|---|---|---|---|
| R1 | 组屋屋顶太阳能板（SolarNova） | HDB 新闻配图 / Wikimedia Commons 组屋屋顶照片（逐张核许可） | 板排布、支架高度、倾角、与女儿墙的距离 |
| R2 | 组屋底层（void deck）与电梯厅 | Commons | 柱距、地砖、天花高度 |
| R3 | 曳引机与电梯机房 | Commons "Elevator machine room" / 教科书图解 | 电机、曳引轮、绳的绕法、对重位置 |
| R4 | 吊扇、LED 吸顶灯、电热水壶剖面 | Commons；专利图（电热水壶底部发热盘） | 比例、发热盘位置 |
| R5 | 瓶式自行车发电机剖面 | Commons "Bottle dynamo"（剖面图）/ 专利图 | 磁铁、线圈、摩擦轮 |
| R6 | 倒放自行车 | Commons | 车座车把着地时的几何 |
| R7 | 网球弹跳频闪照片 | Commons "Bouncing ball strobe" | 弹跳高度递减的样子（配图 R、模型对照） |
| R8 | 游乐场秋千 | Commons；NParks 游乐场照片（许可待核） | A 字架、链、座板 |
| R9 | 登格浮动光伏航拍 | PUB / Sembcorp 新闻图（只当参考，不发布） | 配图 `tengeh` |
| R10 | 燃气联合循环电厂示意 | Commons / 教科书图解 | 配图 `power-station` |

### 7.3 图像清单（Codex 已按 docs/17 起草到草稿目录；以下是终版清单，石墨图版风格）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3。**图只当插画，不当事实依据**；主会话入库前逐张对照 §2.3 与参考图，错的重画。共同要求：无文字、无数字、无品牌、无人物、无"能量箭头"或光线以外的符号。

| 文件 | 用途 | SUBJECT（原样英文） |
|---|---|---|
| `genimg/roadmap/energy-conversion.png` → `public/illustrations/energy-conversion.webp` | 首页图版 | a cutaway slice of a Singapore public housing block seen three-quarters from the front: on the flat roof two rows of tilted solar panels on low metal frames and a small lift machine room; below it one top-floor flat with its front wall removed, showing a five-blade ceiling fan, a round ceiling lamp, a kettle on a kitchen counter and a potted plant on the window ledge; a lift shaft running down the left side; the middle floors left out with zigzag break lines across the columns; at ground level an open void deck with an upside-down bicycle resting on its saddle and handlebars; the Sun drawn as a small radiant disc in the upper left with straight fine rays falling on the panels; no people, no text, no signs |
| `public/illustrations/figures/energy-conversion-sun-sources.webp` | 第 01 章：能源大多来自太阳 | a single plate showing four paths from one Sun in the upper centre: on the left sunlight falling on the leaves of a chilli plant in a pot with a bowl of rice beside it; next, sunlight warming a calm sea with vapour rising into a cloud and rain falling onto a reservoir behind a dam; next, a cross-section of layered seabed rock with tiny ancient sea plankton at the top and a pocket of natural gas trapped deep below, a slender gas pipeline leading away; on the right a field of solar panels; the four scenes side by side like specimens on one plate, no arrows, no text |
| `public/illustrations/figures/energy-conversion-tengeh.webp` | 第 01 章：登格浮动光伏 | an aerial view of a large floating solar farm on a calm reservoir: many rectangular islands of solar panels on floats laid out in neat blocks with narrow water channels between them, a low earth dam with a road along one shore, mangrove and scrubby trees along the far bank; drawn from high above at an angle, no boats, no people, no text |
| `public/illustrations/figures/energy-conversion-power-station.webp` | 第 05 章：燃气发电厂 | a clear technical cutaway of a gas-fired combined-cycle power station hall: a long horizontal gas turbine opened to show its rows of compressor and turbine blades, connected on one shaft to a large cylindrical generator with its outer casing cut back to show the copper coil windings and the spinning rotor inside; behind them a tall boiler that uses the hot exhaust and a smaller steam turbine; thick cables leaving the generator towards a transformer outside; no smoke clouds, no people, no text |
| `public/illustrations/figures/energy-conversion-bounce.webp` | 第 03 章：弹跳频闪 | a stroboscopic study of a tennis ball bouncing across a hard tiled floor from left to right: the ball drawn many times along its path, starting high at the left beside a plain upright measuring pole with only tick marks, each bounce lower than the one before in smooth parabolic arcs, the arcs getting shorter until the ball rolls; the ball slightly flattened at each contact with the floor; no numbers, no text |

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0.1 已代定）；docs/17 §3.5 那一行改 slug；定 `forces` 与本主题谁先施工（决定 F2 / F0 / F5 由谁做，§8.1 末条） | 主会话 | docs/31、docs/17 | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts energy-conversion --engine space-scene --subject science --title-en "How Energy Changes Form" --title-zh "能量是怎样转换的"`；参考图 R1–R10 下到 refs | 主会话 | 主题目录、refs | validate 绿；参考图看过 | 0.5 天 |
| E-A | EN1 模型、EN2 能量链卡、EN7 `note`、EN8（`__atlas`）、docs/06 新节 | Opus 引擎 A | §4.7 E-A 行 | §4.8 对应条 | 2.5–3 天 |
| E-B | EN3 token、EN4 密度绑定、EN6 能量条、EN8（shoot）；若 `forces` 未先施工，另做 docs/30 F2 时间线回放（+1.5 天） | Opus 引擎 B（与 E-A 并行） | §4.7 E-B 行 | §4.8 对应条 | 2–2.5 天（+1.5） |
| D1 | 数据骨架：46 零件 + 5 context、组、五条流 44 条路径（与导线 `tube` 同源）、`sim` 段（控件、输出、`energy` 数据、链、绑定）、姿态、预设、剖切、spec、telemetry；章节 frontmatter（state、拍、sim、index） | Opus 内容（几何） | `data/parts.json`、`chapters/*.mdx` frontmatter | validate 0 error；E-A / E-B 合并后舞台可看 | 1.5 天 |
| D2 | R2 几何两轮（组屋比例、曳引机、自行车倒放几何、发电机剖面、秋千对照 R1–R8）→ R3 材质（板的玻璃与电池片、不锈钢、太阳发光）→ R4 流、动画、能量条位置 | Opus 内容（视觉） | 同上 + `docs/screenshots/energy-conversion/` | 每轮 `pnpm shoot energy-conversion` 截图自证 | 2.5 天 |
| T1 | 来源逐条读、待核落定；S1 设计研究来源（§2.4 全文）；英文草稿：零件 summary / detail、正文、细看、名词定义、`sources.json` 英文 | Codex 起草 → Opus 内容复核事实 | `sources.json`、`glossary.json`、parts.json 文本字段、`chapters/*.mdx` 正文 EN | 事实表一一对应；`sources-md.ts` | 2 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（新加坡用法，§2.6、§6） | Claude（Opus，中文独立成文，不逐句直译） | 同上 ZH 字段 | 用词与名词表一致 | 1 天 |
| B | 37 拍定稿：镜头、标注、`sim.set`、字幕 EN / ZH | Sonnet | `state.beats` | `--beats` 0 失败、无漏标、四种组合 | 1 天 |
| P | HUD 排版、模式组合、手机、事实与代码审计；配图入库与审 | Sonnet QA；主会话审图 | — | §8.2 全勾 | 1 天 |

- 合计：引擎 2.5–3 天（两个代理并行；本主题先于 `forces` 施工时 +1.5 天做 F2，F0 / `note` 同理谁先谁做）；内容约 9.5 天。
- **与 docs/30 的共享件**：F2 时间线回放、F0 SpaceScene 背景章（含本文 EN7 的 `note`）、F5 数据表下的小图。F5 若已做，本主题第 03 章（弹回高度 vs 落下高度，折线）、第 05 章（灯功率 vs 速度，折线）、第 01 章（板的电功率 vs 天空，条形）的 `record` 改成 `{ chart: true }`；没做就只有表。两个主题的 g 都是 9.8；`forces` 第 05、06 章细看里"储存的能量"往这里链，本主题第 03 章细看往 `forces` 第 02 章链（谁后发布谁补链接）。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）；Codex 的草稿交给 Opus 内容代理合并，不直接写主题目录。子代理不提交、不改 `package.json`；主会话验收后提交（spec 定稿、引擎合并、样章、发布各一次），push 等 Gavin。
- 样章：第 03 章（落球 + 秋千，最能检验能量条和数据表）先做完给 Gavin 看。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：第 80 页每条（来自太阳、六种形式、探究能量转换、节约能源的价值观）在某一章的正文或拍里出现；第 78 页"太阳是主要能源（光和热）"在第 01 章；"化学 / 重力 / 弹性势能"只在第 03 章一处细看出现，不在主线、字幕、名词表定义里。
- [ ] **必须讲对的六处**（§0-5）各有一拍或一段正文；全文无"能量被用掉 / 用光了""电池里装着电""板 / 发电机制造能量"的说法（误解引用处除外）；屋顶板只供电梯等公共设施（字幕、零件、正文一致）。
- [ ] **误解目录** M-1–M-11 每条在指定章出现并给出正确说法。
- [ ] **守恒可见**：每条链能量链卡上每个节点进 = 出（单测 + 截图目测）；三根能量条之和恒为 100 %（单测 + `energyBars()` 抽样）；第 06 章"只看热"一拍每件电器都有热流。
- [ ] **读数一致**：PLATE、卡片、试一试卡片、字幕、细看、S1 的同一个量同值（4.43 / 3.15 / 0.74 / 0 kW；21 / 75 / 4；60 / 40 / 1 / 85；落球 16 格与 4.43 m/s；发电机 0.54 / 1.49 / 2.21 / 2.67 / 2.95 W 与 18 / 50 / 74 / 89 / 98 %；LED 25 %），都写明"在这个模型里 / SIM"；示意值在 S1 `note` 和"About this model"细看里标明。
- [ ] **试一试**：01–06 六章每章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；第 01、02、03、04、05、06 章"记一行"；先猜后看不判对错、中英文都对。
- [ ] **颜色**：五种流动形式 + 势能六个 token 在 paper / cinema 下可分（色觉缺陷模拟截图存档），名称与颜色总是一起出现；全主题不用 `stops` 沿路径变色。
- [ ] **回放**：弹回最高点 = r × 落下高度（单测）、"放慢 2 倍"在卡片与细看写明；秋千越摆越低、8 次后停在最高点，"再跑一次"重新拉起（无"永动"）；发条跑完停住；深链接与截图显示时间线终态且两次一致；`G` 与按钮都能再跑一次。
- [ ] **链接**：`<TopicLink>` 到 `aircon`、`circuits`、`plant`、`water`、`four-taps`、`magnets`、`digestive-system` 的 `ch` 全部通过 validate；没有重复讲这些主题已讲的内容（只一句 + 链接）。
- [ ] **背景章**：00 在章节轴上是 `BG`、阅读说明框显示（E-EN7）、演示里排在 01 之前。
- [ ] **性能**：静止 ≤ 70 calls（目标）/ 运转 ≤ 80 / 上限 100；三角形 < 0.4 M；五条能量流各 1 次、能量条 1 次；控件切换模型 < 1 ms、不掉帧。超过目标时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片、收进去的能量链卡在抽屉里可用，按钮 ≥ 44 px；能量条在舞台上可读。
- [ ] **无文字贴图**：刻度杆只有刻度线；电池、灯、壶、板无品牌与文字。
- [ ] 首页图 + 4 张配图逐张核对 §7.3（无文字、无人物、弹跳逐次变低、发电机剖面有线圈与转子、登格是蓄水池上的浮台）。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot energy-conversion --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求。

---

## 9. 实现记录与已知差距

（施工后补。）
