# 24 · 水循环与新加坡的水 · 内容施工 spec（v1 草案）

两个互链的主题（docs/17 §6 #6）：

- **A · `water`**：SpaceScene / Model3DStage，paper 默认、cinema 可切。一块"新加坡切片"立体剖面：海、太阳、云、雨、集水区、蓄水池与堤坝、水厂、组屋水箱与水龙头、用过的水、新生水厂、海水淡化厂、来自柔佛的输水管。原型：`archetypes.md` §2 封闭设备（厂房）+ 以流为主的过程剖面（本主题的大半读法是流，见 §0-3）。
- **B · `four-taps`**：TimeScene / GeoStage 的小主题（4–5 章）：新加坡岛尺度地图上的蓄水池、集水区、四大水喉的厂址、柔佛河取水与跨长堤输水管，按年份点亮。依赖 docs/17 §7 C1（岛尺度底图），见 §2.4、§4.6。

本主题的任务：**读者看完能说清水循环的三步（蒸发、凝结、降水）为什么是太阳推动的；新加坡的四个水源（本地集水、进口水、新生水、淡化海水）各从哪里来、经过什么处理才到水龙头；为什么每个人都要节约用水。**

结构照 skill `atlas-space-topic` 的 `references/spec-template.md`，按本次 brief 重排：决策 §0；范围与事实 §1；写实与数据来源 §2（含地图数据集）；零件 §3；流、动画、剖切、姿态、预设、读数与引擎缺口 §4；章节 §5；名词 §6；来源 §7；图像清单 §8；施工顺序 §9；验收 §10。正文、字幕、来源条目未经 Gavin 定稿不写（CLAUDE.md）；§5 的字幕是**草稿**，只为定节拍结构。凡标"待核"的数字与年份，施工代理读原文核对后才能用，核不到就换值或删掉。

---

## 0. 决策（2026-10-13 起草，待 Gavin 定稿）

| # | 提议 | 待确认点 |
|---|---|---|
| 0-1 | **拆成两个主题**：A `water`（SpaceScene，7 章）+ B `four-taps`（TimeScene，5 章），互相在首末章用正文链接指过去（`/en/topics/four-taps/` ↔ `/en/topics/water/`）。**理由**：引擎是按主题定的（`topic.yaml` 的 `engine`），一个主题里不能有一章是 3D 舞台、一章是地图；地图要时间轴（1868 → 今天）而 3D 剖面不要；地图半边依赖 C1 管线，拆开后 A 可以先发布、B 等管线。**否决的做法**：在 SpaceScene 里用 `extrude` 把真实海岸线和蓄水池挤成 3D 浮雕当"地图章"——没有时间轴、没有比例尺语义、引线标注做不了地名，而且把地图规则（docs/08 §5）搬进 3D 引擎是更大的缺口 | 是否同意拆分；B 的 slug（`four-taps` / `singapore-water`） |
| 0-2 | 对象（A）：**一条示意的新加坡供水链 + 水循环**，不是某一个真实地点的缩微模型。厂房按真实设施**简化**（堤坝参照滨海堤坝 Marina Barrage；水厂参照常规混凝—沉淀—过滤—消毒流程；新生水厂、淡化厂参照 PUB 公开的工艺图），**不画招牌、标志、名称牌**；标题块 `note`：EN "Schematic slice of Singapore · not to scale · facilities simplified from public descriptions" / ZH "新加坡示意切片 · 不按比例 · 设施按公开资料简化" | `note` 措辞 |
| 0-3 | 读法：**流是主角**。水在各段里的颜色语义固定（§4.1）：天然淡水、水蒸气、处理过的自来水、用过的水、新生水、海水各一色；状态靠疏密与速度（液体密而慢、蒸气疏而快），第 02 章第一次用到时字幕说一次图例 | 颜色语义 |
| 0-4 | 课纲对齐（S3 页码是 PDF 印的页码）：**Sci P5 Cycles in Matter and Water (Water)** 第 49–50 页（Standard）/ 第 51 页（Foundation）：三态与互变、0 °C 与 100 °C、蒸发与凝结在水循环中的作用、水循环的重要性、水对生命过程的重要性、水污染的影响；Practices 里"影响蒸发快慢的因素：风、温度、暴露面积"；VEA 写"把水当作有限的自然资源、负责任地节约"。**四大水喉不在科学课纲里**，它对应社会课 SS P3（S5 第 23–27 页"资源与环境保护"，"Four National Taps"原词在 SS 课纲里是否出现：**待核**）。所以 A 的第 01–02、07 章对 Sci P5，第 03–06 章对 SS P3 + 课外深化；B 对 SS P3 | 是否接受"四大水喉 = SS P3 + 课外"的定位 |
| 0-5 | 主线用课纲词：evaporation / condensation / precipitation 只用到 P5 课纲的深度（"蒸发、凝结"是课纲词；"降水 precipitation"课纲没写，正文写"rain / 降雨"，precipitation 进名词表）。不讲：露点、相对湿度的公式、潜热的数值（只在细看里一句"蒸发要吸热"）、云的分类、反渗透的压力物理 | 深度 |
| 0-6 | **新马水协议只写事实与日期**：签约年份、到期年份、可取水量、柔佛可按协议买回经处理的水（数量与价格条款 **待核**，若写须两国一手来源都核到），不写谈判、争议、评价、谁占便宜；正文与细看都不出现"依赖""威胁"一类定性词。来源同时引新加坡（MFA / PUB / NLB）与马来西亚（政府或国会文件，**待核**）一手材料 | Gavin 审该段中文 |
| 0-7 | 事实纪律：规格行 = TYPICAL / FACT（PUB 公开值）；PLATE 块读数 = SIM（一场阵雨落在滨海集水区的模拟，§1.4），设计研究来源 S1 自描述；正文数字一律 `<Num s>` | — |
| 0-8 | 单位：SI；PUB 用的 **mgd（百万加仑 / 日，英制加仑）** 照写并在第一次出现时换算（1 mgd ≈ 4,546 m³/日；440 mgd ≈ 200 万 m³/日），中文写"百万加仑"；雨量 mm、温度 °C | — |
| 0-9 | 不做：品牌 / 企业名（淡化厂的运营公司不点名）、照片贴图、视频、配音文件、测验（默认不做）；每章一个"Try it / 试一试"细看块（§5），其中第 02、07 章是课纲要求的公平测试（蒸发因素），只写**在家可做、安全**的做法 | 是否保留"试一试" |
| 0-10 | B 的地图**只用真实数据**（CLAUDE.md）：现今海岸、蓄水池面、厂址点、柔佛河与林木水库来自 URA MP2019（SODL）与 OSM（ODbL）；过去的帧 = 当年已存在的蓄水池（按 PUB / NLB 的建成年份筛选今天的多边形），**扩建前的旧轮廓与填海前的海岸不画**，在 `SOURCES.md` 与已知差距写明 | 是否接受"按年份筛选今天的面"这一方法 |

---

### 0.1 定稿（2026-10-14，主会话按 Gavin 惯例代定）

1. 开工，两个主题并行：A `water`（SpaceScene，7 章）+ B `four-taps`（TimeScene，5 章），首末章互链。
2. 0-2 至 0-10 全部按提议。新马水协议只写两国一手来源能支持的日期和数量；价格条款不写。
3. B 的底图 = 新的新加坡岛尺度管线（C1：URA MP2019 规划区边界并成岛岸线 + NE 做周边；C1b：compose 的 `geojson` 选择器）。管线先做，做好后写进 skill `atlas-history-topic` 作为"城市尺度主题"的例外路径；每个关键帧的来源、许可、方法照 `data/SOURCES.md` 记。
4. 过去的帧用开通年份筛选今天的水面；扩建、已消失的水体作为已知差距写明，不臆造多边形。
5. 图：A 的首页图版与 7 张配图已入库（`public/illustrations/water.webp`、`figures/water-*.webp`）；B 的首页图版用新加坡岛线稿地图（Codex 出一张，主会话审），B 不配章节图。

## 1. 范围、读者、必须讲对的事实

### 1.1 读者与范围

读者：P5 学生（2029）与家长；SS P3（2027）可读 A 第 01、03–06 章和 B 全部。讲：水循环三步与太阳的作用；三态（只到课纲）；新加坡的四个水源、各自的处理；用过的水怎么回到循环里；节约与污染。不讲：降雨的微物理、天气预报、水价与税、海平面上升（PUB 的海岸防护职能只在细看提一句）、具体企业、谈判史。

### 1.2 必须讲对的（误解 → 正确说法）

1. **水循环是太阳推动的**：太阳的热让海、湖、地面、叶子上的水蒸发；没有太阳的热，水循环停下（P5 课纲第 49 页"roles of evaporation and condensation"；P6 第 78 页"Sun is our primary source of energy"）。
2. **水蒸气看不见**；云和"白气"是凝结出的小水滴（常见误解："云是水蒸气"）。
3. **蒸发不需要到 100 °C**：任何温度下水面都在蒸发，100 °C 是沸腾（课纲把 boiling / evaporation 写在一起，Practices 区分了两者）。
4. **新生水（NEWater）是用过的水经过多道处理（微滤 / 超滤、反渗透、紫外线消毒）得到的高纯度再生水**，主要供工业；干旱时加到蓄水池里、与原水混合，再经水厂处理后才进自来水管（P3 PUB 展板原文"NEWater is mainly used for industrial purposes… During dry periods, NEWater is added to top up our reservoirs and blended with raw water, and treated before it is supplied as tap water"）。不写成"新加坡人直接喝下水道的水"。
5. **淡化 = 用膜把海水里的盐和矿物质挡在外面**（P3），耗电多于处理淡水（数值 **待核**，只在细看写定性比较）。
6. **蓄水池的水不是直接到水龙头**：先进水厂处理，再进配水管网（P3：6 座 PUB 水厂）。组屋的水先泵到屋顶水箱，再靠重力流到各户（**待核**，HDB / PUB 原文）。
7. **新马水协议是两份 / 三份有日期的协议**：1962 年协议允许新加坡每日从柔佛河取水至多 250 百万加仑，到 2061 年（P3）；1961 年协议于 2011 年到期（**待核**）；1927 年的更早协议（**待核**）。只写事实。
8. **集水区不止"水库周围的森林"**：新加坡超过三分之二的土地是集水区（P3），城市里的排水沟和运河把雨水引进蓄水池；滨海堤坝在城市中心造出第 15 个蓄水池，集水区 10,000 公顷（P3）。
9. **用过的水不是"废水就扔掉"**：经污水管和深隧道排污系统（DTSS，206 km，P3）送到再生水厂处理，再生水一部分做成新生水，其余排海（排放比例 **待核**）。

### 1.3 事实表

`FACT` = 一手机构原文（PUB、MSS、MOE、USGS）；`TYPICAL` = 教科书 / 机构的典型范围；`SIM` = §1.4 的模拟运行点。P# 见 §7，施工时变 S#。

| # | 项 | 值（来源） | 类 | 待核 |
|---|---|---|---|---|
| F-1 | 四大水喉 | 本地集水、进口水、新生水、淡化海水（P3、P4） | FACT | |
| F-2 | 蓄水池数 | 17 个（P3） | FACT | |
| F-3 | 集水区占国土 | 超过三分之二（P3） | FACT | |
| F-4 | 滨海堤坝 | 2008 年；第 15 个蓄水池；集水区 10,000 公顷（P3） | FACT | |
| F-5 | 滨海堤坝闸门与水泵 | 9 道钢闸、7 台排涝泵（P8） | FACT | 是 |
| F-6 | 进口水 | 1962 年水协议：每日至多 250 百万加仑，至 2061 年（P3） | FACT | |
| F-7 | 早期协议 | 1927 年协议；1961 年协议 2011 年到期（P10、P11） | FACT | 是 |
| F-8 | 林木水库（Linggiu） | 柔佛河上游，为柔佛河取水提供调蓄（P3、P11）；建成年份 | FACT | 是 |
| F-9 | 新生水起点 | 2002 年国庆庆典首次亮相；同年第一座新生水厂（勿洛 Bedok）启用（P3） | FACT | |
| F-10 | 新生水厂 | 4 座在运行（樟宜 2、乌鲁班丹 1、克兰芝 1；勿洛厂 2024 年到寿关闭）（P3，截至 2024-10） | FACT | |
| F-11 | 新生水工艺 | 微滤 / 超滤 → 反渗透 → 紫外线消毒（P5） | FACT | 是 |
| F-12 | 新生水能满足需求的比例 | "最多约 40 %"（媒体常见说法，PUB 原文未核到） | — | 是（核不到就删） |
| F-13 | 海水淡化 | 2005 年起；5 座淡化厂（P3） | FACT | |
| F-14 | 淡化比例 | "最多约 25 %"（常见说法） | — | 是（核不到就删） |
| F-15 | 水厂 | 6 座 PUB 水厂（P3）；工艺：混凝、絮凝、沉淀、过滤、消毒（P6） | FACT | 工艺待核 |
| F-16 | 管网 | 自来水输配管网约 6,000 km；新生水管网约 660 km；公共污水管约 3,700 km；DTSS 206 km、通往 3 座集中的再生水厂（P3） | FACT | |
| F-17 | 用水量 | 约 440 百万加仑 / 日（约 200 万 m³/日，换算）（P3） | FACT | |
| F-18 | 用水去向 | 家庭约 40 %、非家庭约 60 %（P3 展板饼图，年份不明）；到 2065 年非家庭"接近 60 %" | FACT | 是（饼图读数待核） |
| F-19 | 将来 | 到 2065 年总需求可能接近翻倍（P3） | FACT | |
| F-20 | 节水小事 | 半冲 3 L / 全冲 4.5 L；刷牙关水龙头每天省约 23 L；淋浴打肥皂时关水每天省约 27 L（P3） | FACT | |
| F-21 | 人均家庭日用水 | 约 140 L / 人·日；政府目标 2030 年 130 L（P7） | FACT | 是 |
| F-22 | 新加坡年雨量 | 全岛平均 2,534 mm（1991–2020）；樟宜站 2,113 mm（P12）。两者测的范围不同，并列 | FACT | 是（读 MSS 原文） |
| F-23 | 地球上的水 | 约 97 % 是海水；淡水约 2.5–3 %，其中大部分是冰与地下水（P13） | TYPICAL | 是 |
| F-24 | 0 °C / 100 °C | 冰在 0 °C 熔化、水在 100 °C 沸腾（一个标准大气压）（P1 第 49 页） | FACT | |
| F-25 | 蒸发因素 | 风、温度、暴露面积（P1 第 49 页） | FACT | |
| F-26 | 屋顶水箱 | 组屋的水先泵上屋顶水箱、再重力供到各户（P9） | FACT | 是 |
| F-27 | 水协议的马来西亚一方说法 | 马来西亚政府 / 国会文件对同一协议的表述（P11） | FACT | 是 |

### 1.4 模拟运行点（SIM，PLATE 块读数，自洽）

情景："晴天午后，滨海集水区上空来了一场阵雨。"

- 太阳辐照（到达地面）：设计 900 W/m²（热带晴天正午典型 800–1,000 W/m²，P14，**待核**）。
- 海面温度：30 °C（新加坡近海典型 28–31 °C，P12 / P15，**待核**）。
- 雨强：30 mm/h（"大雨"的典型量级，MSS 的分级 **待核**）。
- 流进蓄水池的水量：集水区 A = 10,000 公顷 = 1.0 × 10⁸ m²（F-4）；雨强 i = 30 mm/h = 8.33 × 10⁻⁶ m/s；径流系数 C = 0.7（城市集水区典型 0.5–0.9，P16，**待核**）。Q = C × i × A = 0.7 × 8.33 × 10⁻⁶ × 1.0 × 10⁸ ≈ **580 m³/s**。
- 对照：这场雨一小时流进来的水 ≈ 580 × 3,600 ≈ 2.1 × 10⁶ m³，约等于全国一天的用水量（F-17：约 200 万 m³）。**这个对照只在细看里出现，并写明"在这个模拟里"。**

| key EN / ZH | unit | idle | run | lag s | decimals |
|---|---|---|---|---|---|
| Sunlight / 阳光 | W/m² | 0 | 900 | 3 | 0 |
| Sea surface / 海面 | °C | 29 | 30 | 20 | 0 |
| Rain / 雨强 | mm/h | 0 | 30 | 6 | 0 |
| Inflow / 进库水量 | m³/s | 0 | 580 | 12 | 0 |

规格行（≤ 4，FACT，`tag: typical`）：Four taps · local / imported / NEWater / desalinated；Reservoirs · 17；Demand · ≈ 440 mgd；Catchment · > ⅔ of land。

### 1.5 口吻

按 `writing-rules.md`。课纲词：evaporation / condensation / water cycle / states of matter / melting / freezing / boiling；"water-carrying"之类不涉及。不拟人（不写"水滴的旅行日记"），不喊"小朋友"，不用感叹号。环保与节约讲原理与官方建议，不说教。新马协议按 §0-6。

---

## 2. 写实与数据来源

### 2.1 Tier-1（不认识这个主题的人一眼要认得出的）

| Tier-1 | 必须对上 | 参考 |
|---|---|---|
| 水循环 | 海面上升的水汽、积云、雨幕落在集水区的山与城市上 | R1、R2 |
| 滨海式堤坝 | 横跨河口的低矮长坝、一排可放倒的钢闸、侧边的泵房；坝内淡水、坝外海水 | R3、R4 |
| 内陆蓄水池 | 森林丘陵围着的水面、一道土坝、取水塔 | R5 |
| 水厂 | 一排矩形混凝 / 絮凝池、圆形沉淀池、成排的滤池、清水池 | R6 |
| 组屋 | 板式高楼、屋顶水箱；一户的水龙头 | R7 |
| 新生水厂 | 厂房里成排的膜组件（竖立的管状膜架）、横置的反渗透压力管、紫外线反应器 | R8 |
| 海水淡化厂 | 海边取水头与管、预处理池、成排的反渗透压力管、浓盐水排放管 | R9 |
| 深隧道 | 地下几十米的一条大圆管通向再生水厂 | R10 |

### 2.2 模型布局（示意映射）

- 一条 6 × 2.5 单位的"切片"（1 单位 ≈ 不按比例），从左（西、海）到右：**海 + 淡化厂（左前）→ 城市集水区（组屋、排水沟、运河）→ 滨海式堤坝与河口蓄水池（中前）→ 森林丘陵与内陆蓄水池（右后）→ 水厂（右中）→ 供水山顶配水库 → 组屋（中）→ 地下：污水管 → DTSS 深隧道 → 再生水厂 + 新生水厂（右前）**；北缘（−Z 后方）一根管子从切片外进来（柔佛进口水，示意，长度截断）。
- 天空层：太阳（左上，示意位置）、海上的积云、丘陵上方的雨云。
- 地下层只在 `ground` 剖切或 X-RAY 时看得见（地表做成薄壳 `shell`）。
- 水平方向压缩、垂直方向放大（云高约 1–2 km、隧道深 20–60 m（**待核**）都画在同一个框里），厂房相对地形放大约 20 倍：`note` 与第 01 章细看写明。

### 2.3 参考图（`scripts/geo/water/refs/`，gitignore，不发布）

| # | 文件 | 来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | `01-water-cycle-usgs.png` | USGS Water Science School "The Water Cycle" 图（P13） | 公有领域（美国联邦政府作品，**待核**页脚） | 循环的分段与箭头次序 |
| R2 | `02-cumulus-singapore.jpg` | Commons 新加坡积云照片（具体文件 **待核**） | CC BY / BY-SA | 午后对流云的体量 |
| R3 | `03-marina-barrage-aerial.jpg` | Commons `Category:Marina Barrage`（具体文件 **待核**） | CC BY-SA | 坝长与闸门数、泵房位置、坝顶绿屋顶 |
| R4 | `04-crest-gate.jpg` | 同上，闸门近景 | CC BY-SA | 闸门形状与放倒方式 |
| R5 | `05-macritchie-dam.jpg` | Commons `Category:MacRitchie Reservoir` | CC BY-SA | 土坝、取水塔、森林岸线 |
| R6 | `06-water-treatment-schematic` | PUB 水厂流程图（© PUB，只本地对照）/ Commons 通用水厂流程 SVG | © / CC | 池子顺序与相对大小 |
| R7 | `07-hdb-block-roof-tank.jpg` | Commons 组屋屋顶照片 | CC BY-SA | 板楼比例、屋顶水箱位置 |
| R8 | `08-newater-membranes.jpg` | Commons `Category:NEWater`（具体文件 **待核**） | CC BY-SA | 膜架与反渗透压力管排列 |
| R9 | `09-ro-desal-trains.jpg` | Commons 通用反渗透淡化厂照片（不限新加坡） | CC BY-SA | 压力管阵列尺寸 |
| R10 | `10-dtss-schematic` | PUB DTSS 示意图（© PUB，本地对照） | © | 隧道深度与走向示意 |
| G1–G7 | `genimg/water/*.png` | Codex 石墨图版（§8） | 自生成 | 只当风格与构图参考，不是事实依据 |

### 2.4 B `four-taps` 的地图数据（真实数据，逐个核许可）

| ID | 数据集 | 用于 | 许可 | 状态 |
|---|---|---|---|---|
| D1 | URA **Master Plan 2019 Land Use layer**（data.gov.sg） | 今天的蓄水池水面（`LU_DESC` = RESERVOIR / WATERBODY，具体取值 **待核**）；"集水区里的城市"作对照 | Singapore Open Data Licence v1.0（docs/17 S11 已核） | 可用 |
| D2 | URA **Master Plan 2019 Planning Area Boundary (No Sea)**（data.gov.sg） | 今天的陆地轮廓（并成一个面 = 岛尺度海岸）→ C1 底图 | SODL v1.0 | 许可 **待核** |
| D3 | **OpenStreetMap**（Geofabrik `malaysia-singapore-brunei-latest.osm.pbf`，或构建期 Overpass 导出） | 蓄水池名称（`water=reservoir` + `name`）、柔佛河（`waterway=river`）、林木水库、跨长堤输水管（`man_made=pipeline` + `substance=water`）、水厂 / 再生水厂 / 淡化厂 / 新生水厂的位置（`man_made=water_works`、`wastewater_plant` 等） | **ODbL 1.0**：署名"© OpenStreetMap contributors"；我们导出的 GeoJSON 是衍生数据库，须同许可提供（在 `SOURCES.md` 写明） | 标签完整度 **待核** |
| D4 | **Natural Earth** 10m land / rivers / admin-1 | 区域底图（柔佛州、柔佛海峡）、柔佛河主干（NE 是否收录 **待核**） | 公有领域 | 可用 |
| D5 | **OneMap**（SLA）Search API | 构建期地理编码厂址（只取坐标，不进运行时） | OneMap 使用条款 **待核**（docs/17 待核 6） | 待核；退路 = D3 |
| D6 | PUB 集水区图（受保护 / 非受保护 / 城市集水区） | 集水区多边形 | 公开矢量数据**未找到**；PUB 图版 © PUB。若无开放矢量：**不画集水区面**，只画蓄水池面 + 文字"超过三分之二"（F-3）；不许手描 PUB 图 | 待核 |
| D7 | 中央集水区自然保护区边界（OSM `boundary=protected_area` 或 NParks 开放数据） | 只作"森林保护区"图层，**不冒充集水区边界** | ODbL / SODL **待核** | 可选 |
| D8 | 建成年份：PUB 与 NLB Infopedia 各蓄水池条目（P10） | 关键帧筛选（当年存在哪些池） | 事实引用 | 逐条 **待核** |

**方法**：过去的帧 = 用 D8 的年份筛选 D1 / D3 的今天多边形。已知差距：①扩建（如上实里达 1969 年扩建，**待核**）前的较小水面不画；②填海前的海岸不画（C1 只做今天的海岸；历年海岸属于 `singapore-land-use` 的管线）；③河口蓄水池（滨海、榜鹅、实龙岗）在建成前是海湾 / 河口——旧帧里那一块按今天的陆海画，`SOURCES.md` 写明。

---

## 3. 零件（A `water`：39 个 + 3 个 context）

### 3.1 坐标与尺度

单位：场景单位（不按比例，`units` 不写，PLATE 比例尺写 `U`）。Y 向上、+Z 朝观者、+X 向右（东）；地表平均 y = 0。包络 x −3.0…3.0、y −0.6（隧道）…1.6（云顶）、z −1.2…1.2；模型半径约 3.4。

### 3.2 分区

| 分区 | 组 id | EN / ZH | 内容 | 组色 | 卡 |
|---|---|---|---|---|---|
| 01 | `sky-and-sea` | Sun, sea and sky / 太阳、海与天 | 太阳、海、云、雨云 | `token:ink-2` | `card: false` |
| 02 | `catchment` | Catchment / 集水 | 丘陵、内陆蓄水池、土坝、取水塔、城市集水区、排水沟、运河、河口蓄水池、堤坝、闸门、泵房 | `token:water` | ✓ |
| 03 | `supply` | Treatment and supply / 处理与供水 | 原水管、水厂各池、配水库、配水干管、组屋、屋顶水箱、水龙头 | `token:cold` | ✓ |
| 04 | `reuse` | Used water and NEWater / 用过的水与新生水 | 污水管、DTSS、再生水厂、新生水厂（膜、反渗透、紫外线）、新生水管、工厂 | `token:loop` | ✓ |
| 05 | `desal` | Desalination / 海水淡化 | 取水头、预处理、反渗透、浓盐水管 | `token:ink-3` | ✓ |
| 06 | `imported` | Imported water / 进口水 | 柔佛输水管（截断） | `token:ink-2` | `card: false` |
| — | `water-cycle` | Water cycle / 水循环 | 只有流 | `token:neutral` | — |
| — | `flood` | Flood release / 开闸泄洪 | 只有流（第 03 章一拍） | `token:water` | — |

右上卡 4 列 = catchment、supply、reuse、desal（acceptance：列数 ≤ 4）。

### 3.3 零件表

材质族见 `modelling-runbook.md`；生物 / 地形用 `tissue` + `tint`。"shell" = X-RAY 时透明。

| # | id | 组 | primitive（+ extra） | 材质 | explode | connects | shell | 说明 |
|---|---|---|---|---|---|---|---|---|
| 01 | `sun` | sky-and-sea | sphere r 0.18（示意位置左上 (−2.6, 1.45, −0.6)） | `token:signal`（emissive 低） | — | — | | 推动蒸发的热源 |
| 02 | `sea` | sky-and-sea | extrude 海面薄片（左侧 x −3…−1.6）+ extra 海底斜坡 | 新材质族 `water`（E-W1；退路 `glass` + `tint token:water`） | — | desal-intake | | 海水；蒸发主要从这里来 |
| 03 | `cumulus` | sky-and-sea | sphere × 9（`extra`，`scale` 压扁）位于海上 | `membrane` + 白 tint（E-W2 云材质） | 上 0.3 | rain-cloud | | 凝结出的小水滴 |
| 04 | `rain-cloud` | sky-and-sea | sphere × 10，丘陵上空，底面平 | 同上，深一档 | 上 0.3 | forest-hill | | 雨从这里落下 |
| 05 | `forest-hill` | catchment | lathe 丘陵 ×2 + extra cone 树冠 `repeat` | `tissue` + 深绿 tint | — | inland-reservoir | | 受保护集水区的森林 |
| 06 | `inland-reservoir` | catchment | extrude 水面（不规则湖形） | `water` | — | earth-dam | | 内陆蓄水池 |
| 07 | `earth-dam` | catchment | extrude 梯形坝身 | `tissue` + 草绿 / 土 tint | 前 0.2 | intake-tower | | 拦住河谷的土坝 |
| 08 | `intake-tower` | catchment | cylinder + 栈桥 box | `enamel` | 上 0.2 | raw-water-main | | 从库里取原水 |
| 09 | `city-blocks` | catchment | bevelBox 组屋 `repeat` 3 × 4（城市集水区） | `enamel` + 浅暖灰 | — | drains | | 城市集水区的屋顶与地面 |
| 10 | `drains` | catchment | sweep `section: u` 网状 ×3 | `stainless`（混凝土 tint） | — | canal | | 雨水沟收集地面径流 |
| 11 | `canal` | catchment | sweep U 宽截面通到河口 | 同上 | — | estuary-reservoir | | 运河把雨水送进蓄水池 |
| 12 | `estuary-reservoir` | catchment | extrude 河口水面 | `water` | — | barrage | | 河口蓄水池（滨海式） |
| 13 | `barrage` | catchment | bevelBox 长坝 + extra 坝顶步道 | `enamel` 混凝土 tint | 前 0.25 | crest-gates, pump-house | | 隔开海水与淡水 |
| 14 | `crest-gates` | catchment | box `repeat` 9（`each`），F-5 待核 | `steel` | — | — | | 落潮时放倒泄洪 |
| 15 | `pump-house` | catchment | bevelBox + extra 出水口 ×7 | `enamel` | 前 0.2 | — | ✓ | 涨潮遇暴雨时把水泵出海 |
| 16 | `raw-water-main` | supply | tube 取水塔 → 水厂 | `steel` | — | waterworks-mixing | | 原水管 |
| 17 | `waterworks-mixing` | supply | box 混凝 / 絮凝池 ×2（extra） | `enamel` | 上 0.15 | clarifiers | | 加混凝剂，小颗粒聚成絮团 |
| 18 | `clarifiers` | supply | cylinder 浅池 `repeat` 3 + extra 刮泥桥（`each` rotate） | `enamel` | 上 0.15 | filter-beds | | 絮团沉到池底 |
| 19 | `filter-beds` | supply | box `repeat` 6 + extra 砂层 | `enamel` + 砂 tint | 上 0.15 | clear-water-tank | | 砂滤去掉细小颗粒 |
| 20 | `clear-water-tank` | supply | bevelBox 半埋 | `enamel` | 上 0.15 | service-reservoir | ✓ | 消毒后存放的清水 |
| 21 | `service-reservoir` | supply | cylinder 覆土顶（小山上） | `enamel` + 草 tint | 上 0.15 | distribution-main | ✓ | 高处的配水库，靠高度送水 |
| 22 | `distribution-main` | supply | tube 配水库 → 组屋 | `steel` | — | hdb-block | ✓ | 配水干管 |
| 23 | `hdb-block` | supply | bevelBox 板楼 + extra 走廊板 | `enamel` | — | roof-tank | ✓ | 一栋组屋 |
| 24 | `roof-tank` | supply | box 两格 | `steel` | 上 0.2 | kitchen-tap | | 泵上屋顶的水再靠重力下到各户（F-26 待核） |
| 25 | `kitchen-tap` | supply | tube 鹅颈 + cylinder 阀体（放大 ×10，示意） | `stainless` | 前 0.2 | house-sewer | | 一户的水龙头 |
| 26 | `house-sewer` | reuse | tube 组屋 → 地下 | `plastic` 深灰 tint | — | dtss-tunnel | ✓ | 用过的水离开家 |
| 27 | `dtss-tunnel` | reuse | tube r 0.08 深埋（y −0.5） | `enamel` 混凝土 tint | 下 0.2 | reclamation-plant | | 深隧道靠重力输送用过的水（F-16） |
| 28 | `reclamation-plant` | reuse | cylinder 池 `repeat` 4 + box 曝气池 | `enamel` | 上 0.15 | newater-membranes | | 再生水厂：去掉固体、用微生物分解污物 |
| 29 | `newater-hall` | reuse | bevelBox 厂房外壳（薄板） | `casing` 浅灰 tint | 上 0.35 | — | ✓ | 新生水厂的厂房 |
| 30 | `newater-membranes` | reuse | cylinder 竖管 `repeat` 2 × 8 | `plastic` 白 tint | 上 0.15 | newater-ro | | 微滤 / 超滤：挡住细菌和颗粒 |
| 31 | `newater-ro` | reuse | cylinder 横管 `repeat` 3 × 6 | `plastic` | 上 0.15 | uv-reactors | | 反渗透：挡住溶解的盐和更小的物质 |
| 32 | `uv-reactors` | reuse | cylinder 短管 `repeat` 3 | `stainless` | 上 0.15 | newater-main | | 紫外线消毒 |
| 33 | `newater-main` | reuse | tube → 工厂 + 支管 → 河口蓄水池（干旱补水） | `steel` + loop tint 环 | — | factory | | 新生水管网（F-16） |
| 34 | `factory` | reuse | bevelBox + extra 冷却塔 cylinder | `enamel` | — | — | | 用新生水的工厂（晶圆厂等，示意） |
| 35 | `desal-intake` | desal | tube 海底管 + cylinder 取水头 | `steel` | 下 0.15 | desal-pretreat | | 从海里取海水 |
| 36 | `desal-pretreat` | desal | box 池 ×3 | `enamel` | 上 0.15 | desal-ro | | 去掉海水里的泥沙和藻类 |
| 37 | `desal-ro` | desal | cylinder 横管 `repeat` 4 × 8（厂房只画半透明薄板屋面 extra，`shell` 由 X-RAY 处理） | `plastic` | 上 0.15 | brine-outfall, distribution-main | | 反渗透膜挡住盐（F-13） |
| 38 | `johor-main` | imported | tube 北缘进来 → 水厂；末端截断标记 | `steel` | 后 0.3 | waterworks-mixing | | 柔佛河取水经长堤输水管（示意截断） |
| 39 | `brine-outfall` | desal | tube 入海，末端扩散口 | `steel` | 下 0.15 | sea | | 把浓盐水排回海里（稀释方式 **待核**） |
| — | `ground-shell` | context | extrude 地表薄壳（含城市、丘陵底座） | `tissue` 土 tint | — | — | ✓ | 剖切时露出地下 |
| — | `seabed-block` | context | box 剖面土块 | `tissue` | — | — | | 切片的底座 |
| — | `causeway-stub` | context | box 截断的长堤一段（北缘） | `enamel` | — | — | | 提示进口水管从切片外来 |

- 计数：39 个零件 + 3 个 context（`ground-shell`、`seabed-block`、`causeway-stub`：北缘长堤截断面）。超预算时的删减顺序：`uv-reactors` 并入 `newater-ro` 的 extra → `pump-house` 并入 `barrage` → `factory` 改 context。
- 绘制预算：静止约 45–50（零件按材质槽）；运转 +10 流 + 2 动画；三角形 < 0.3 M（地形 lathe / extrude 控制段数）。
- 第 01 章不隐藏零件；地下件靠 `ground-shell` 的 shell 与 `ground` 剖切看到。

### 3.4 summary / detail 要点（施工时写 EN / ZH）

| id | summary | detail 要点 |
|---|---|---|
| sun | Heats the sea and land so water evaporates. / 晒热海面和地面，让水蒸发。 | 水循环的能量来源；阳光强的时候蒸发快；示意位置（F-25、P1） |
| barrage | Holds fresh water in and keeps the sea out. / 把淡水留在里面，把海水挡在外面。 | 河口变成淡水库；闸门与泵用来防洪（F-4、F-5） |
| clarifiers | Lets clumps of dirt settle to the bottom. / 让絮团沉到池底。 | 混凝后的沉淀；刮泥桥（动画放慢）；排泥去向 **待核** |
| newater-ro | Pushes water through membranes that hold back salts. / 把水压过膜，挡住盐分。 | 反渗透；只讲"孔极小、挡住溶解物"；压力数值不写 |
| johor-main | Brings water bought from Johor across the Causeway. / 把从柔佛买的水经长堤送来。 | 1962 年协议事实（F-6）；模型截断；B 主题地图上看全程 |
| （其余 33 个按同一格式：summary 动词开头 ≤ 60 字符；detail 三段：怎样做到 / 典型数字（带 F-#）/ 坏了或脏了会怎样，如"滤池堵了就要反冲洗"） | | |

---

## 4. 流、动画、剖切、姿态、预设、读数、引擎缺口

### 4.1 颜色语义（每色一个意思）

| token | 意思 | 状态 |
|---|---|---|
| `token:water` | 天然淡水（雨、径流、库水、进口原水） | 密、慢 |
| `token:neutral` | 水蒸气（真实看不见；画出来是为了读图，第 02 章字幕说明） | 疏、快 |
| `token:cold` | 处理过的自来水 | 密 |
| `token:cut` | 用过的水 | 密、慢 |
| `token:loop` | 新生水 | 密 |
| `token:ink-3` → `token:ink-2` | 海水 → 浓盐水 | 密 |

### 4.2 流（10 条）

| id | group | 路径（按零件） | 约长 U | speed | count | spread | stops（u: 色） | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|---|
| `evaporation` | water-cycle | 海面 (−2.3, 0.02, 0) → 竖直上到积云底 (−2.1, 1.05, −0.1) | 1.05 | 0.25 | 360 | [0.55, 0.02, 0.5]（一片升起的薄层） | 0: water · 0.15: neutral · 1: neutral | fade | false | sea, cumulus |
| `drift-condense` | water-cycle | 积云 → 东移到雨云（云内） | 2.2 | 0.35 | 200 | [0.2, 0.08, 0.25] | 0: neutral · 0.6: neutral · 1: water 40 % | open | false | cumulus, rain-cloud |
| `rain` | water-cycle | 雨云底 (1.6, 1.0, −0.4) → 丘陵与城市地面 (1.4, 0.15, −0.3) | 0.85 | 0.9 | 700 | [0.9, 0.02, 0.5] | 0: water · 1: water | fade | false | rain-cloud, forest-hill, city-blocks |
| `runoff` | catchment | 丘陵坡 → 内陆蓄水池；城市地面 → 排水沟 → 运河 → 河口蓄水池（两段，`ends: open`） | 2.6 | 0.3 | 420 | 0.02 | water | open | true | forest-hill, inland-reservoir, drains, canal, estuary-reservoir |
| `barrage-release` | flood | 河口蓄水池 → 放倒的闸门 → 海 | 0.6 | 0.6 | 240 | [0.25, 0.01, 0.02] | water | fade | true | estuary-reservoir, crest-gates, sea |
| `raw-to-tap` | supply | 取水塔 → 原水管 → 混凝 → 沉淀 → 滤池 → 清水池 → 配水库 → 干管 → 组屋 → 泵上屋顶水箱 → 下到水龙头 | 6.0 | 0.4 | 900 | 0.01 | 0: water · 0.35: water · 0.5: cold · 1: cold | fade | true | intake-tower, raw-water-main, waterworks-mixing, clarifiers, filter-beds, clear-water-tank, service-reservoir, distribution-main, hdb-block, roof-tank, kitchen-tap |
| `imported` | imported | 北缘 → 柔佛输水管 → 混凝池 | 1.6 | 0.4 | 240 | 0.01 | water | open | true | johor-main, waterworks-mixing |
| `used-water` | reuse | 水龙头 → 污水管 → DTSS → 再生水厂 | 3.0 | 0.3 | 420 | 0.01 | cut | open | true | kitchen-tap, house-sewer, dtss-tunnel, reclamation-plant |
| `newater` | reuse | 再生水厂 → 膜 → 反渗透 → 紫外线 → 新生水管 → 工厂（主）；支管 → 河口蓄水池 | 3.2 | 0.35 | 480 | 0.01 | 0: cut · 0.25: neutral · 0.5: loop · 1: loop | open | true | reclamation-plant, newater-membranes, newater-ro, uv-reactors, newater-main, factory |
| `desal` | desal | 取水头 → 海底管 → 预处理 → 反渗透 → 配水干管 | 2.4 | 0.35 | 360 | 0.01 | 0: ink-3 · 0.55: ink-3 · 0.7: cold · 1: cold | open | true | desal-intake, desal-pretreat, desal-ro, distribution-main |

- 浓盐水不单开流：`brine-outfall` 零件 + `desal` 的 detail 讲（流数到 10 的上限）；若 E 阶段证明余量足够，再加 `brine`（ink-3 → ink-2）。
- 运转 +10 次绘制；各章 `layers` 控制同屏可见的流 ≤ 6。
- 新生水支管进河口蓄水池（干旱补水）是 §1.2 第 4 条的事实（P3 原文），粒子少（count 占 `newater` 的 15 %，示意"不是常态"），细看说明。

### 4.3 动画与姿态

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `scraper-turn` | clarifiers | rotate，`each: true` | axis [0,1,0]，rpm 2 | 刮泥桥慢转（画面放慢；真实转速 **待核**，不写） |
| `cloud-drift` | cumulus | sequence（loop） | offset x 0 → +0.05 → 0，8 s 一循环（oscillate 只转不平移） | 云的轻微漂移 |
| `uv-glow` | uv-reactors | pulse | scale 1.03，hz 0.5 | 示意"在工作"（detail 写明是示意） |

| pose | 内容 | 用在 |
|---|---|---|
| `gates-open` | `crest-gates` 绕下缘铰轴 rotation [−70,0,0] | 第 03 章拍 4（落潮泄洪） |
| `dry-spell` | `inland-reservoir`、`estuary-reservoir` offset y −0.03、scale [0.97,1,0.97]；`rain-cloud` scale 0.01 + hide | 第 05 章拍 5（干旱时新生水补库） |
| `storm` | `rain-cloud` scale 1.25；`cumulus` offset +x 0.4 | 第 02 章拍 4、第 03 章拍 3 |

### 4.4 剖切、X-RAY、爆炸

- `views.cutaway`：`{ normal: [0,0,-1], offset: 0.2 }`（切掉 z > 0.2 的前缘，露出地下管道与隧道的纵剖面）。
- `views.cuts`：`ground`（同上，label "Underground / 地下"，第 04、05 章）。（初稿还有一个水平的 `plants` 剖切，发布前去掉：平面高度同时切到森林山丘、楼顶和工厂，切面上出现赭色剖面线；厂房改用 X-RAY 透视，见 §15。）
- X-RAY：shell = ground-shell、newater-hall、pump-house、clear-water-tank、service-reservoir、hdb-block、distribution-main、house-sewer（地下管线与厂内设备实心）。
- EXPLODED：天空件向上、厂房件向上、地下件向下、堤坝向前；流禁用（引擎）。主要不是本主题的读法。

### 4.5 镜头预设（≤ 6）

| id | label | 用途 |
|---|---|---|
| `hero` | HERO | 3/4 前右上看全切片（封面） |
| `cycle` | CYCLE | 侧前方拉远，海—云—雨—山同框（第 02 章） |
| `barrage` | BARRAGE | 堤坝近景，海与库同框（第 03 章） |
| `plants` | PLANTS | 水厂 + 新生水厂俯视 3/4（第 04–05 章） |
| `coast` | COAST | 淡化厂与取水头（第 06 章） |
| `home` | HOME | 组屋、屋顶水箱、水龙头近景（第 04、07 章） |

`views.cover` = hero 略收；`views.section.plane` = `xy`（正面立面）。

### 4.6 引擎缺口

| # | 优先 | 缺口 | 现状（已查） | 最小方案 | 退路 |
|---|---|---|---|---|---|
| E-W1 | 应该 | **水面材质族 `water`**（docs/17 B12） | 材质族无水；`glass` 是半透明玻璃 | 平面、低粗糙度、极淡程序化波纹法线、`token:water` 底色、半透明 .7、剖切填剖面色；paper / cinema 都读得出 | `glass` + `tint: token:water` |
| E-W2 | 可选 | **云材质**（柔边、不写深度、受光） | `membrane` 半透明双面，边缘硬 | `membrane` 加 fresnel 边缘淡出 | `membrane` + 白 tint，球多一些 |
| E-W3 | 可选 | 雨的**拉长粒子**（`flow.shape: "streak"`，沿速度方向拉长） | 粒子是点 | flowMaterial 里按速度方向拉长 quad | 点粒子 + 高 count，字幕说"雨" |
| E-W4 | 可选 | 右上卡的**循环环**（docs/17 B1） | 右上卡是零件链路列；只有流的组不进卡 | `views.cycle: [{label, parts}]` 画一圈节点 + 箭头，运转时步进 | 第 02 章 `<Figure>` 水循环图版（§8 W-F1） |
| E-W5 | 可选 | 地形原语 `terrain {grid, heights}` | 只有 lathe / extrude / sweep | 高度网格 → BufferGeometry | lathe 丘陵 + extrude 台地 |
| C1 | 必须（B 主题） | **新加坡岛尺度底图**（docs/17 C1） | 底图 `land-50m` + 东南亚 `land-10m-sea`（zoom ≥ 7）；NE 10m 的新加坡海岸约公里级，看不见蓄水池 | `scripts/build-geo.ts` 另出 `public/geo/land-sg.json`（D2 并成一个面，简化 10 m，TopoJSON，预算 ≤ 150 KB，**待量**）；GeoStage 在 zoom ≥ 10 且视野与 [103.55, 1.15, 104.10, 1.48] 相交时 fetch，同 `land-10m-sea` 的渐入办法；`pipeline.coast.detailLand / detailBox` 换成它 | 无（不做就不做 B） |
| C1b | 必须（B） | compose 的 **`geojson` 选择器**：从预处理好的数据集（D1 / D3 导出）按属性过滤取面 | 已查 `scripts/geo/lib/compose.ts` 第 227–260 行：只有 cshapes / ohm / admin1 / svg / raster / parts / bbox / union / intersect / difference；`osmtogeojson` 只给 OHM 用 | `{ "geojson": "<dataset>", "where": { "<key>": "<value>" }, "minYear?": … }`；数据集在 `sources.json.datasets` 登记许可；OSM 用 `ohm-export.ts` 同一套 Overpass 代码改 endpoint 出 `osm-export.ts` | 无 |
| C3 | 应该（B） | 非战争的**图层语义**（docs/17 C3）：`bloc` 只有 axis / allied / neutral | `blocLabels` 能改名，实体有 `color?` | B 用 `blocLabels`：axis → "Local catchment / 本地集水"，allied → "Imported / 进口"，neutral → "Other / 其他"；实体按水喉自带 `color`（token）；图例去掉"已退出" | 同上，不改引擎 |
| C2-lite | 应该（B） | **有日期的静态线**（输水管、深隧道走向）：从建成那天出现、之后一直在 | `movements` 是行军线（从起点画到终点、可 `linger`） | `movements` 加 `persist: true`（到主题末都以 .6 不透明度保留、不画箭头头）；或新图层 `lines` | `movements` + `linger` 到 2061-12-31 |

**结论（§0-1 的推荐）**：B 做成独立 TimeScene 小主题；C1、C1b 是 B 的硬前置，C3 用现有 `blocLabels` 解决，C2-lite 一行 schema。C1 一旦做好，`singapore-1819-1965`、`singapore-land-use` 也能用（docs/17 §6 的提醒）。

### 4.7 B `four-taps` 的数据骨架（TimeScene）

- `entities.json`：`local-catchment`（bloc axis，`color: token:water`）、`imported-water`（allied，`token:ink-2`）、`newater`（neutral，`token:loop`）、`desalination`（neutral，`token:ink-3`）。控制区 holder = 这些实体：蓄水池面属于 `local-catchment`；林木水库与柔佛河取水范围属于 `imported-water`。
- `control.json` 关键帧（年份全部 **待核**，D8）：K1 1868（第一座蓄水池，今麦里芝）→ K2 1912（加上下皮尔斯一带，**待核**）→ K3 1940（实里达）→ K4 1962（水协议当年的状态）→ K5 1986（西部集水区与勿洛等陆续建成后）→ K6 2008（滨海堤坝）→ K7 2011（榜鹅、实龙岗；17 个齐）。
- `events.json`：`site` 事件 = 今天的厂址（6 水厂、4 新生水厂、5 淡化厂、再生水厂；只写 PUB 公开的名称与位置）；`political` 事件 = 1927、1961、1962 协议签署日与 2011 到期日（日期 **待核**）；其它：2002 新生水、2005 第一座淡化厂、2008 滨海堤坝启用。
- `movements.json`：跨长堤输水管（建成年 **待核**）、DTSS 第一期（2008）走向（只在 OSM / PUB 公开图可核时画，否则不画）。
- `presets.json`：`island`（全岛 zoom 10.6）、`johor-river`（柔佛河—林木水库 zoom 9）、`marina`、`west`（淡化厂一带）。

---

## 5. 章节

### 5.1 A `water`（7 章）总表

| # | id | 标题 EN / ZH | view | run | cutaway | layers（不写 = 全部） | pose | 镜头 |
|---|---|---|---|---|---|---|---|---|
| 01 | `one-island-four-taps` | One island, four taps / 一座岛，四个水喉 | assembled | false | none | 全部 − 流组 | — | hero |
| 02 | `the-water-cycle` | The Sun drives the water cycle / 太阳推动水循环 | assembled | true | none | sky-and-sea, catchment, water-cycle | — | cycle |
| 03 | `catching-the-rain` | Catching the rain / 接住每一滴雨 | assembled | true | none | sky-and-sea, catchment, water-cycle, flood | storm | barrage |
| 04 | `reservoir-to-tap` | From reservoir to tap / 从蓄水池到水龙头 | xray | true | none | catchment, supply, imported | — | plants |
| 05 | `used-water-to-newater` | Used water becomes NEWater / 用过的水变成新生水 | xray | true | ground | supply, reuse, catchment | — | plants |
| 06 | `sea-and-johor` | Water from the sea and from Johor / 来自大海与柔佛的水 | assembled | true | none | sky-and-sea, desal, imported, supply | — | coast |
| 07 | `every-drop` | Every drop counts / 每一滴都算数 | assembled | true | none | 全部 | — | home |

### 5.2 各章

**01 `one-island-four-taps`**（Sci P5 第 50 页"importance of water to life processes"；SS P3）
- summary：Singapore has no big rivers or lakes, so it gets water four ways. / 新加坡没有大河大湖，用水来自四个水喉。
- 正文提纲：① 水对生命过程的重要性（课纲）② 一天约 440 百万加仑（F-17，换算）③ 四个水喉一句一个（F-1）④ 本模型是示意切片（§2.2）。
- 节拍：

| 拍 | state | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | hero | This slice of Singapore shows where tap water comes from: rain, the sea, used water and a pipe from Johor. / 这块新加坡切片画出了自来水的来处：雨、大海、用过的水，还有一根来自柔佛的水管。 |
| 2 | labels forest-hill, inland-reservoir, estuary-reservoir | Tap one is local catchment: rain collected in seventeen reservoirs. / 第一个水喉是本地集水：雨水收进十七个蓄水池。 |
| 3 | labels johor-main | Tap two is imported water, piped across the Causeway from the Johor River. / 第二个水喉是进口水，从柔佛河经长堤输水管送来。 |
| 4 | labels newater-hall, reclamation-plant | Tap three is NEWater, made from used water that has been cleaned many times over. / 第三个水喉是新生水，用过的水经过多道处理制成。 |
| 5 | labels desal-ro, desal-intake | Tap four is desalinated water: seawater pushed through membranes that hold back the salt. / 第四个水喉是淡化海水：把海水压过能挡住盐的膜。 |

- 细看：`What the model leaves out`（不按比例、厂房放大）；`How much is 440 million gallons`（换算到 m³ 与奥运泳池，F-17）。
- **试一试**：按 X 看厂房里面，再按 E 把切片拆开，找出四个水喉各自的入口。
- 索引：sun, sea, inland-reservoir, estuary-reservoir, johor-main, newater-hall, desal-ro, kitchen-tap。
- 名词首现：`four-national-taps`、`catchment`、`reservoir`。

**02 `the-water-cycle`**（Sci P5 第 49–50 页）
- summary：Heat from the Sun turns water into vapour; cooled vapour condenses into clouds, and rain brings it back down. / 太阳的热把水变成水蒸气；水蒸气冷却凝结成云，再以雨落回地面。
- 正文提纲：① 三态与 0 °C / 100 °C（F-24）② 蒸发：任何温度都在发生，阳光、风、面积影响快慢（F-25）③ 水蒸气上升、冷却、凝结成小水滴（误解 2）④ 雨落回地面、流回海；循环为什么重要（课纲）⑤ 地球上的淡水很少（F-23）。
- 节拍：

| 拍 | state | 字幕草稿 |
|---|---|---|
| 1 | cycle 镜头，run | The Sun heats the sea. Water at the surface evaporates and rises as invisible water vapour, drawn here as sparse grey dots. Dense blue dots are liquid water. / 太阳晒热海面，表面的水蒸发，变成看不见的水蒸气上升；稀疏的灰点代表水蒸气，密集的蓝点是液态水。 |
| 2 | labels cumulus | Higher up the air is cooler, so the vapour condenses into tiny droplets. A cloud is made of droplets, not vapour. / 高处空气较冷，水蒸气凝结成小水滴。云是小水滴，不是水蒸气。 |
| 3 | labels rain-cloud | The droplets join into bigger drops, and they fall as rain on the hills and the city. / 小水滴聚成大水滴，以雨的形式落在山上和城市里。 |
| 4 | pose storm；labels forest-hill, drains | Rain runs downhill into drains and rivers and back towards the sea, and the cycle starts again. / 雨水顺坡流进水沟和河道，流回大海，循环重新开始。 |
| 5 | hide cumulus, rain-cloud；labels sea, sun | Without the Sun's heat, evaporation would slow down and the cycle would stop. / 没有太阳的热，蒸发会变慢，水循环就会停下来。 |

- 细看：`Evaporation is not boiling`；`Where Earth's fresh water is`（F-23）；`Steam you can see`（壶嘴的白气是凝结的小水滴）。
- **试一试（公平测试，课纲 Practices）**：三个一样的碟子各倒 20 mL 水，只改变一个条件（放在风扇前 / 阳光下 / 换成大浅盘），其余保持一样，一小时后量剩下多少。写清"改了什么、哪些保持不变"。
- 索引：sun, sea, cumulus, rain-cloud, forest-hill, drains。
- 名词首现：`evaporation`、`condensation`、`water-vapour`、`precipitation`、`water-cycle`。

**03 `catching-the-rain`**（SS P3；课外）
- summary：Drains and canals lead rain into reservoirs; more than two-thirds of the land is catchment. / 排水沟和运河把雨水引进蓄水池；新加坡超过三分之二的土地是集水区。
- 正文提纲：① 森林里的内陆蓄水池与土坝 ② 城市集水区：屋顶、路面、水沟、运河（F-3）③ 河口蓄水池与堤坝（F-4、F-5）④ 年雨量两种口径并列（F-22）⑤ 17 个蓄水池（F-2）。
- 节拍：hero 丘陵与库 → 城市排水沟（runoff）→ 河口与堤坝（pose storm）→ `gates-open` + `flood` 层（落潮时放倒闸门泄洪）→ 泵房（涨潮遇暴雨时泵水出海，F-5 待核）。字幕要点照此。
- 细看：`A reservoir in the city`（滨海）；`Two rainfall averages`（F-22）；`Keeping catchments clean`（水污染，课纲第 50 页）。
- **试一试**：雨后看组屋楼下的雨水沟往哪个方向流；在模型上按 FLOW 跟着蓝点走到蓄水池。
- 索引：forest-hill, inland-reservoir, earth-dam, city-blocks, drains, canal, estuary-reservoir, barrage, crest-gates, pump-house。

**04 `reservoir-to-tap`**
- summary：Raw water is cleaned at a waterworks, stored high up and pumped to every home. / 原水在水厂里处理，存在高处，再送到每户人家。
- 正文提纲：① 取水塔与原水管 ② 混凝、絮凝、沉淀、过滤、消毒（F-15 待核）③ 配水库与管网（F-16）④ 组屋屋顶水箱（F-26 待核）⑤ 进口原水也在这里处理（F-6）。
- 节拍（5）：取水塔 → 混凝 / 絮凝池 → 沉淀池（刮泥桥转）→ 滤池与清水池（颜色由 water 变 cold，第一次出现时字幕说"浅青色是处理过的自来水"）→ 组屋、水箱、水龙头。
- 细看：`Six waterworks`（F-15）；`Why water is stored on hills and roofs`（重力）；`Is tap water safe to drink`（PUB / WHO 标准，**待核**的一手来源）。
- **试一试**：把一杯泥水静置 30 分钟看沉淀，再用纸巾 + 沙 + 小石子做个滤层（**只观察，不喝**）。
- 索引：intake-tower, raw-water-main, waterworks-mixing, clarifiers, filter-beds, clear-water-tank, service-reservoir, distribution-main, roof-tank, kitchen-tap。
- 名词首现：`waterworks`、`filtration`。

**05 `used-water-to-newater`**
- summary：Used water flows through deep tunnels to be treated; part of it is cleaned again into NEWater. / 用过的水经深隧道送去处理，其中一部分再处理成新生水。
- 正文提纲：① 污水管与 DTSS（F-16）② 再生水厂（微生物分解）③ 新生水三步（F-11）④ 主要供工业，干旱时补进蓄水池再经水厂（误解 4、P3）⑤ 2002 年起（F-9、F-10）。
- 节拍（5）：水龙头 → 污水管入地（`ground` 剖切）→ DTSS 到再生水厂 → 膜 / 反渗透 / 紫外线（颜色 cut → loop）→ `dry-spell` 姿态 + 新生水支管补库。
- 细看：`Not straight from the sewer`（误解 4）；`Why factories want NEWater`（纯度高，P5）；`A closed loop`（P3 "close the water loop"）。
- **试一试**：在 LAYERS 里只开"用过的水与新生水"（⊙），从水龙头一路点零件，看每一步去掉了什么。
- 索引：house-sewer, dtss-tunnel, reclamation-plant, newater-membranes, newater-ro, uv-reactors, newater-main, factory, estuary-reservoir。
- 名词首现：`used-water`、`newater`、`membrane`、`reverse-osmosis`。

**06 `sea-and-johor`**
- summary：Seawater is turned into fresh water with membranes, and water is also bought from Johor under a 1962 agreement. / 海水用膜变成淡水；另有按 1962 年协议从柔佛购买的水。
- 正文提纲：① 取海水、预处理、反渗透、浓盐水（F-13）② 淡化耗电较多（定性，P5 **待核**）③ 柔佛河、林木水库、跨长堤输水管（F-6—F-8）④ 协议的事实与日期（§0-6）⑤ 指向 B 主题地图。
- 节拍（4）：海边取水头 → 淡化厂内反渗透→ 浓盐水管 → 北缘输水管（截断标记，字幕说"地图在下一个主题"）。
- 细看：`Why desalination uses more energy`（定性）；`The water agreements`（日期与数量，两国一手来源；Gavin 审）；`On the map`（链接 `four-taps`）。
- **试一试**：把一小杯盐水放在阳光下晒干，看留下的盐——蒸发把水带走、盐留下（与淡化原理不同，细看说明区别）。
- 索引：desal-intake, desal-pretreat, desal-ro, brine-outfall, johor-main, distribution-main。
- 名词首现：`desalination`。

**07 `every-drop`**（Sci P5 第 49–50 页 VEA；SS P3）
- summary：Demand may almost double by 2065, so how we use water at home matters. / 到 2065 年用水可能接近翻倍，所以家里怎样用水很重要。
- 正文提纲：① 家庭与非家庭用水（F-18 待核）② 2065 年（F-19）③ 节水小事（F-20）与人均日用水（F-21 待核）④ 污染让水更难用（课纲）⑤ 四个水喉合成一个循环。
- 节拍（4）：全景运转 → 组屋近景（home）→ 水龙头（字幕：刷牙关水每天省约 23 升，F-20）→ 回到 hero，全部流同开（"一个闭合的循环"）。
- 细看：`Where Singapore's water goes`；`Small habits, real litres`（F-20）；`Pollution`（课纲）。
- **试一试（公平测试）**：测一测刷牙时开着水龙头和用杯子各用多少水（用量杯接 1 分钟的水）。
- 索引：kitchen-tap, hdb-block, roof-tank, factory, newater-main, estuary-reservoir。
- 名词首现：`water-conservation`。

### 5.3 B `four-taps`（5 章，TimeScene）

| # | id | 标题 EN / ZH | time | 拍（3–4） | 试一试 |
|---|---|---|---|---|---|
| 01 | `the-island-today` | Where Singapore's water is today / 今天新加坡的水在哪里 | 今天（K7） | 全岛 17 个蓄水池 → 中央集水区森林（D7，若可用）→ 四类厂址（`sites`）→ 柔佛河与林木水库 | 在地图上找离你家最近的蓄水池 |
| 02 | `the-first-reservoirs` | The first reservoirs / 最早的蓄水池 | 1868 → 1940 | K1 → K2 → K3，逐个点亮 | 对比 1868 与今天的蓝色面积 |
| 03 | `water-from-johor` | Water from Johor / 来自柔佛的水 | 1927 → 2061 | 1927 协议 → 1961 / 1962 协议 → 2011 到期 → 2061（文字，不画未来） | 量一量柔佛河取水点到长堤的距离（比例尺） |
| 04 | `new-taps` | New taps: NEWater and desalination / 新水喉：新生水与海水淡化 | 2002 → 今天 | 2002 新生水 → 2005 第一座淡化厂 → 今天 4 座新生水厂、5 座淡化厂 | 找出淡化厂都在海边的原因 |
| 05 | `marina-and-the-whole-island` | A reservoir in the city / 城市中心的蓄水池 | 2008 → 2011 | K6 滨海 → K7 榜鹅、实龙岗 → 回到全岛 | 对照 A 主题第 03 章的堤坝模型 |

每拍字幕描述此刻地图上的东西（history skill 的规则），施工时按 `atlas-history-topic` 的 `writing-rules.md` 写。

---

## 6. 名词表 `glossary.json`（候选 14，用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `water-cycle` | water cycle / 水循环 | 水在海、空气、陆地之间循环；太阳推动 | evaporation, condensation |
| `evaporation` | evaporation / 蒸发 | 液态水在低于沸点时变成水蒸气 | water-vapour |
| `condensation` | condensation / 凝结 | 水蒸气遇冷变回液态小水滴 | water-cycle |
| `water-vapour` | water vapour / 水蒸气 | 气态的水，看不见 | evaporation |
| `precipitation` | precipitation / 降水 | 从云里落下的雨等；课纲写"rain" | water-cycle |
| `catchment` | catchment / 集水区 | 雨水被收集流向同一蓄水池的土地 | reservoir |
| `reservoir` | reservoir / 蓄水池 | 储存原水的水体 | catchment |
| `four-national-taps` | Four National Taps / 四大水喉 | PUB 对四个水源的统称 | newater, desalination |
| `waterworks` | waterworks / 水厂 | 把原水处理成自来水的工厂 | filtration |
| `filtration` | filtration / 过滤 | 让水穿过砂层等去掉颗粒 | waterworks |
| `used-water` | used water / 用过的水 | PUB 对污水的说法 | newater |
| `newater` | NEWater / 新生水 | 由处理过的用过的水再净化成的高纯度再生水 | membrane, reverse-osmosis |
| `membrane` | membrane / 膜 | 有极小孔的薄层，挡住比孔大的东西 | reverse-osmosis |
| `reverse-osmosis` | reverse osmosis / 反渗透 | 加压让水穿过膜、把溶解的盐挡在另一侧 | desalination |
| `desalination` | desalination / 海水淡化 | 去掉海水中的盐得到淡水 | reverse-osmosis |
| `water-conservation` | water conservation / 节约用水 | 少用、重复用、不浪费 | — |

---

## 7. 来源计划（≥ 15；P# → 施工时 S#）

| P# | 内容 | 来源 | 用于 |
|---|---|---|---|
| P0 | 本设计研究（示意切片、模拟运行点 §1.4） | 本 spec | 规格行、PLATE 读数、细看 |
| P1 | MOE *Science Syllabus Primary 3–6*（2023 版）第 49–51 页（Water）、第 78 页（Sun as energy source）、第 15–18 页（过程技能） | docs/17 S3；本地 `scratchpad/sci/paged.txt` 已核页码 | 课纲对齐 |
| P2 | MOE *Social Studies Syllabus Primary*（2020 版）第 23–27 页（P3 资源与环境） | docs/17 S5 | 四大水喉的课纲位置（原词 **待核**） |
| P3 | PUB，*Our Water Story* 展板（SG60，2025-02），`pub.gov.sg/-/media/PUB/Public/Key-Initiatives/Our-Water-SG60/Resources/Exhibition-Panels/Exhibition-Panels---Our-Water-Story.pdf` | 2026-10-13 已读全文 | F-1–F-4、F-6、F-9、F-10、F-13、F-15–F-20 |
| P4 | PUB，"Our Water Story / Four National Taps" 网页（`pub.gov.sg/Public/WaterLoop/OurWaterStory`，2024-02-28 更新） | 已读 | F-1；进口水"取自林木水库"的说法 |
| P5 | PUB NEWater 页面（工艺三步、用途） | **待核** | F-11、F-12 |
| P6 | PUB 水处理页面（混凝—消毒） | **待核** | F-15 |
| P7 | PUB / MSE 家庭用水与 2030 目标（Singapore Green Plan 2030 或 PUB 年报） | **待核** | F-21 |
| P8 | PUB 滨海堤坝页面（闸门、泵、三重作用：供水、防洪、休闲） | **待核** | F-5 |
| P9 | HDB / PUB 关于组屋供水（屋顶水箱、增压泵） | **待核** | F-26 |
| P10 | NLB Infopedia：MacRitchie Reservoir、Marina Barrage、1927 / 1961 / 1962 Water Agreements、各蓄水池建成年 | **待核** | F-7、D8 |
| P11 | 新加坡 MFA 水协议说明页 + **马来西亚**政府 / 国会一手文件（同一协议） | **待核** | F-6–F-8、F-27、§0-6 |
| P12 | Meteorological Service Singapore，Climate of Singapore / 年度气候评估（1991–2020 平均：全岛 2,534.3 mm、樟宜 2,113.3 mm；本次只读到转引） | **待核**（读 MSS 原文） | F-22、海面温度 |
| P13 | USGS Water Science School："Where is Earth's water?"、"The Water Cycle" | **待核** | F-23、R1 |
| P14 | 太阳辐照典型值（NASA / NREL 或教科书） | **待核** | §1.4 |
| P15 | NEA / MSS 近海海面温度 | **待核** | §1.4 |
| P16 | 径流系数典型范围（PUB *Code of Practice on Surface Water Drainage* 或水文教科书） | **待核** | §1.4 |
| P17 | URA MP2019 Land Use / Planning Area（data.gov.sg）与 SODL v1.0 | docs/17 S11 | D1、D2 |
| P18 | OpenStreetMap（ODbL 1.0）+ Geofabrik 导出说明 | — | D3 |
| P19 | Natural Earth 10m | — | D4 |
| P20 | WHO *Guidelines for Drinking-water Quality*（PUB 引用的标准） | **待核** | 第 04 章细看 |
| P21 | OpenStax *Chemistry 2e* 或 *Concepts of Biology* 的水的三态 / 蒸发段落（CC BY） | **待核** | 第 02 章 |

---

## 8. 图像清单（给 Codex）

风格统一用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（石墨铅笔、19 世纪科学图版、透明底、无文字）；章节图走 `pnpm tsx scripts/illustrate.ts figure <src.png> <id>`（4:3，`public/illustrations/figures/<id>.webp`），正文用 `<Figure src="figures/<id>" …>`（docs/06）。Codex 用 `genimg/roadmap/gen.sh` 同一调用方式，产物放 scratchpad `genimg/water/`，主会话逐张看过再 process。**图只当插图与构图参考，不当事实依据**；caption 写"为本主题画的示意图"。

### 8.1 首页图版 `genimg/roadmap/water.png`：**换**

已看：画面好看，但画成了**山区水电站**——高山、混凝土重力坝带溢洪闸泄向海、远处群山，这不是新加坡（新加坡最高点约 164 m（**待核**），河口蓄水池是低矮的堤坝）。重画 SUBJECT：

> a low-lying tropical island seen as a cutaway plate: on the left the open sea with thin stippled wisps of water vapour rising towards a cumulus cloud; in the middle a long, low barrage with a row of steel crest gates separating the calm reservoir behind it from the sea, a small pump house at one end, tall slab apartment blocks along the reservoir edge; on the right low forested hills under a rain cloud with rain falling, a small reservoir with an earth dam among the trees, and a compact water treatment works with rectangular basins and round settling tanks; underground, a cut face of soil shows a pipe and a deep tunnel

### 8.2 章节图（7 张）

| id | 章 | 用途 | SUBJECT（英文，原样给 Codex） |
|---|---|---|---|
| `water-cycle` | 02 | 水循环总图（E-W4 的退路） | a classic water-cycle plate: the sea at left with fine stippled vapour rising, a cumulus cloud above, the cloud drifting over coastal hills, rain falling on the hills, a stream running down through forest back to the sea, the sun at upper left drawn as a plain disc with fine radiating lines, thin curved arrows showing the loop, no text |
| `water-three-states` | 02 | 三态 | three glass beakers side by side on a plain bench: the first holding ice cubes, the second holding water, the third over a small flame with water boiling and a plume of condensed droplets above the spout of a kettle-like cover, drawn as a scientific plate, no labels |
| `marina-barrage` | 03 | 堤坝 | a long low concrete barrage across a river mouth, a row of nine wide steel crest gates lowered partly with water spilling over them towards the sea, a pump house at one end, the calm freshwater reservoir behind with city towers in the distance, seen from the sea side at a three-quarter angle |
| `water-treatment` | 04 | 水厂流程 | a water treatment works seen from above at an angle: a row of rectangular mixing basins, three round settling tanks with rotating scraper bridges, a block of rectangular sand filter beds, a covered clear-water tank, pipes linking them in order, drawn as an engineering plate |
| `newater-membranes` | 05 | 新生水 | inside a water reclamation hall: long racks of vertical tubular membrane modules on the left, rows of horizontal white pressure vessels for reverse osmosis on the right, a stainless ultraviolet reactor pipe in front, and a small sealed glass bottle of clear water standing on a plain plinth in the foreground, no logos or text |
| `ro-membrane` | 06 | 反渗透原理 | a cutaway of a spiral-wound reverse osmosis membrane element: the outer cylinder cut open to show the thin membrane sheets wound around a perforated central tube, with fine arrows showing salty water flowing along the surface and clean water passing through into the centre tube, scientific diagram plate, no text |
| `johor-river` | 06 | 进口水 | a wide, slow tropical river winding through oil-palm and forest country towards the sea, a modest water intake and pumping station on the bank, and in the distance a long causeway across a strait carrying a road and large water pipes, drawn as a landscape plate |

图数：首页 1（重画）+ 章节 7 = 8。B `four-taps` 不配插图（地图本身就是图）。

---

## 9. 施工顺序、分工、工作量

| 步 | 内容 | 谁 | 完成标准 |
|---|---|---|---|
| 0 | 本 spec 定稿（§0 逐条） | Gavin | 决策表回填 |
| 1 | 参考图 R1–R10 下到 `scripts/geo/water/refs/`；脚手架 `pnpm tsx scripts/new-topic.ts water --engine space-scene --subject science --title-en "Water in Singapore" --title-zh "新加坡的水"` | 主会话 | `pnpm validate` 绿 |
| E | E-W1（水材质，应该）；E-W2–W5 视时间（可选） | Opus（引擎） | 单测；sample-space、aircon、grasshopper 截图不回归；docs/06 更新 |
| D | `parts.json` 39 + 3 context、流 10、姿态 3、剖切 2、预设 6、读数 4；R2 几何两轮（堤坝、水厂、膜架并排参考）→ R3 材质 → R4 流 | Opus（几何） | `pnpm shoot water` 截图自证；calls 静止 < 50、运转 < 60 |
| T | `sources.json`（P3 已读；其余待核项读原文落定或删）、`glossary.json`、零件 summary / detail、7 章正文；先写第 02 章样章 | Opus（事实与文字）；Codex 可起草零件 detail 的英文初稿，Opus 核 | 事实表"待核"清零；`<Num>` 齐 |
| I | 图像：§8 八张；`illustrate.ts` 处理；首页图版替换 | Codex 生成，主会话看图 | 逐张对照 §8 的要点 |
| B | 7 章节拍（§5.2 草稿定稿） | Sonnet | `pnpm shoot water --beats` 0 失败、无漏标 |
| P | HUD、模式组合、审计；`acceptance.md` | Sonnet（QA），视觉问题回 Opus | 全勾 |
| M1 | C1 + C1b + C2-lite（地图管线） | Opus（引擎 / 管线） | `land-sg.json` 体积与偏差入 `SOURCES-GEO.md`；`tests/geo-rings.test.ts` 加 slug |
| M2 | B `four-taps` 脚手架（`--engine time-scene --subject geography`）、`scripts/geo/four-taps/sources.json`（D1–D8）、K1 与 K7 先行 → 其余帧 | Opus（地图） | `check.ts` 并排图 |
| M3 | B 的 5 章正文与节拍 | Opus 文字 + Sonnet 节拍 | history skill `acceptance.md` |

工作量：A = **M**（约 2–3 个施工日，E-W1 小）；B = **M**（C1 / C1b 约 1 日 + 5 帧 + 5 章）；合计 M + M，与 docs/17 一致。docs/04 的"水循环 · TimeScene/Diagram"行在定稿后改为本 spec 的 A + B。

文件归属：E 只碰 `src/engines/**`、`src/content/schema/**`；D 只碰 `parts.json` 几何字段；T 碰文本字段与 `sources.json` / `glossary.json`；M1 碰 `scripts/geo/lib/**`、`scripts/build-geo.ts`、`public/geo/land-sg.json`；不改 `package.json`。

---

## 10. 验收

`atlas-space-topic/references/acceptance.md`（A）与 `atlas-history-topic/references/acceptance.md`（B）全部打勾，门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`；`pnpm shoot water --layout --keys --beats`；B 加 `pnpm shoot four-taps …`）。本主题另加：

- [ ] 第 02 章四种组合下，水蒸气（neutral）与液态水（water）一眼分得开；字幕说过一次图例。
- [ ] 每个流的颜色只有一个意思（§4.1），PLATE 读数四行全部带 SIM，§1.4 的算式与细看里的数字一致。
- [ ] 新马协议段：只有带日期和来源的事实；两国一手来源各至少一条；中文由 Gavin 亲审。
- [ ] F-12、F-14（"40 %""25 %"）没有一手来源就不出现在页面上。
- [ ] "试一试"只写安全、在家能做的步骤；涉及的公平测试写清变量与不变量。
- [ ] B：每帧 `SOURCES-GEO.md` 记数据集、许可（SODL / ODbL / PD）、筛选年份与来源；ODbL 署名出现在页面来源列表；没有手画多边形；`land-sg.json` 偏差 p95 写入。
- [ ] 厂房无标志、无企业名、无文字；`note` 写明示意切片。


---

## 15. 实现记录与已知差距（2026-10-14，发布）

两个主题一起收尾：A `water`、B `four-taps`，都改为 `status: published`，首页 17 个主题（科学 3、地理 1 = B；地理曾是"即将推出"，现在可点）。提交由主会话做（本次 QA 不提交）。

### A · `water`（SpaceScene）

**数量**：7 章 33 拍（5 / 5 / 5 / 5 / 5 / 4 / 4）；42 个零件（39 个 + 3 个 context：地表壳、海床块、长堤残段）、9 组、11 条流、3 个动画（刮泥桥转动、云漂移、紫外线脉动）、3 个姿态（storm / gates-open / dry-spell）、6 个预设（hero / cycle / barrage-view / plants / coast / home）、1 个剖切（`ground`）；16 个名词；32 条来源（S1 自描述的设计研究来源；S27 并入 S26 的 `note`）；6 张章节图在用（`water-cycle`、`water-three-states`、`water-marina-barrage`、`water-treatment`、`water-newater-membranes`、`water-ro-membrane`；`water-johor-river` 入库未用，柔佛的水管在 B 的地图上）加首页图；每章一个"试一试"，第 02、07 章是公平测试，都只写在家能做的安全做法。

**QA 收尾做的改动**
- **文字**：全篇照 `atlas-space-topic/references/writing-rules.md` 读过一遍（EN / ZH）；统一：数量都包 `<Num s>`（补了"三分之二 / two-thirds"四处）；第 06 章把"第四个水喉来自新加坡以外"改成"第二个水喉，进口水，来自新加坡以外"（与第 01 章的编号一致）；第 04 章去掉"厂房从上面剖开"。名词表 16 个，每个只在首次出现处包。试一试不是测验，不判对错。
- **链接**：正文里手写的 `/en/topics/four-taps/` 改成新的 MDX 组件 `<TopicLink slug>`（`src/components/mdx/TopicLink.astro`，用 `localeHref`，跟读者语言和站点 base；`pnpm validate` 检查主题存在；docs/06 记了）。B 里的 Markdown 链接同样替换。
- **S27**：没有任何正文引用，删去；内容（SS P3 大纲第 23–26 页、"四大水喉"一词不在大纲里）并入 S26 的 `note`。来源编号因此少一个 S27，不重排。
- **cinema 眩光**：`ground-shell` 顶面 `#cbc6b1 → #b8b19b`，`city-blocks` `#d6d0c2 → #c5beac`，组屋与工厂的未着色 enamel 件加 `#cdc7b8`；paper 下图底对比更好，cinema 下大片浅色不再发白。
- **`plants` 剖切**：水平剖切（y = 0.15）同时切到森林山丘（高 0.15–0.37）、楼顶和工厂（高 0.15，与切面共面，出现赭色斑点），第 04、05 章的山丘上全是赭色剖面线。去掉这个剖切；第 04 章 `cutaway: none`，第 05 章第 4 拍沿用 `ground`；厂房是 `shell`，X-RAY 下本来就透明，池子与膜架看得到。

**验收数据**（1920×1080，SwiftShader）：`pnpm shoot water --layout --keys --beats`，EN / ZH × paper / cinema 四种组合，键位 0 失败、七个尺寸 0 布局问题、33 拍 0 失败、chapter highlights 全部在屏、console 干净；`pnpm check`（0 error）、`validate`（0 / 0）、`test`（1512）、`build`、`e2e`（78）全绿。静止 69 calls / 35.5 万三角形（SwiftShader 下的 hero 镜头；`--perf --gpu` 在真机上另测）。规范截图在 `docs/screenshots/water/`（本地）：`hero-paper`、`hero-dark`、`hero-zh`、`mode-xray`、`mode-exploded`、`phone-390`、`ch04-*`、`ch05-cinema`、四个组合的节拍联系表。
- 另一处修：森林山丘与配水库穹顶的 `lathe` 轮廓是从上到下写的（与引擎要求的从下到上相反，首尾在轴上才是封闭体），任何剖切下整个穹顶都被画成赭色剖面线；4 个轮廓改成从下到上，剖面线消失（第 05 章地面剖切下也是）。

**已知差距**
- 地面与厂房的 cinema 色是数据里的单一 `tint`（不分主题）；真要两套色得走引擎的主题化 tint。
- 地下剖面里的深隧道埋深（35–55 m）按厂房放大后画得比真实浅得多；`note` 与第 01 章细看已写明。
- 新马协议只写了 S4、S17、S18、S19 能支持的日期和数量，价格条款不写；中文待 Gavin 审。
- 蓄水池 17 个、水厂 6 座、新生水厂 4 座、淡化厂 5 座、DTSS 206 km 都是 PUB 截至 2024–2026 年的页面值，会变；来源页的"最后更新"日期记在 `sources.json`。

### B · `four-taps`（TimeScene，岛尺度地图）

**数量**：背景章 + 5 章共 23 拍（4 / 3 / 5 / 4 / 4 / 3）；7 个控制关键帧 K1–K7（1867、1920、1975、1986、1993、2008-10-31、2011）共 18 个蓄水池多边形；38 个事件（5 个协议 / 政治事件 + 33 个 `site`）、2 条输水管线（长堤、柔佛河）、4 个实体、5 个预设、11 个名词、33 条来源；没有章节图，首页图 `four-taps`（岛的线稿，已重新压缩进预算：80 KB / 231 KB）。

**管线（城市尺度主题，docs/17 C1）**：`fetch.ts`（data.gov.sg 的 URA MP2019 土地利用与规划区边界，Overpass 的蓄水池、管线、水厂）→ `local-land.ts`（55 个规划区无海边界并成岛岸线，去掉 0.02 km² 以下碎块与大于 0.02 km² 的内陆水面，叠在 Natural Earth 周边之上；`public/geo/land-sg.json` 84 KB）→ `compose.ts`（`overlap` 选择器：面积至少一半落在 OSM 同名多边形内的 URA `WATERBODY` 地块，一个蓄水池一步）→ `simplify.ts`（Douglas–Peucker 10 m，70 条弧，`control.json` 62 KB，rings 205 / zero-area 0 / self-crossing 0，偏差 p95 0.01 km）→ `check.ts`（`geo-K#.png` 并排图）。过去的帧 = 当年已存在的蓄水池按今天的水面画（§0-10）。来源、许可（SODL v1.0 / ODbL 1.0 / 公有领域）、方法、残差在 `scripts/geo/four-taps/SOURCES-GEO.md` 与 `data/SOURCES.md`，ODbL 署名在页面来源列表（S31）。

**QA 收尾做的改动**
- **中文蓄水池名**：对照新加坡"促进华语理事会"的新加坡华语词库（S28：蓄水池 / 麦里芝 / 贝雅士上下段 / 实里达上段 / 登格）和中文维基的新加坡河流列表（克兰芝、慕莱、波扬、莎琳汶、登格、实里达下段、实龙岗、榜鹅），全部统一成"X 蓄水池"（上下段放在后面）；班丹、勿洛、德光岛、裕廊湖按通行写法未找到单独来源，沿用。**林木水库**（Linggiu，在柔佛）译名没有查到权威写法，沿用"水库"，待 Gavin 或 PUB 中文页核对。
- **协议章 ZH 改写**：只写日期、数量和双方（柔佛州政府 / 新加坡的水务机构，1965 年协议里写作 PUB）；去掉"作为交换"（改成"协议同时规定"）、"分家协议"（改成"新加坡脱离马来西亚的协议"）、签约方"市议会"（来源里没有，删）；"同一份协议，两种说法"一块只列两国官方说法，价格条款一句"本主题只写日期和数量，不涉及价格"。EN 同步。
- **蓄水池引线**：历史章（01、03）原先高亮实体 `local-catchment`，引线写的是"本地集水 · 加入 1867"，每一拍都一样；现在开 `sites` 图层，每拍高亮当拍出现的蓄水池（`site-*`），引线写蓄水池名。第 02 章末拍的 `imported-water` 实体换成 `site-linggiu-reservoir`。引擎的"加入 {date}"（`time.joinedOn`）是全站共用的字符串，没有主题级覆盖，所以没有改成"启用 / opened"，而是让本主题不再高亮实体；实体卡里"加入"一行还在，要改需要引擎加一个主题级文案（见已知差距）。
- **ZH 篇幅**：背景章与第 05 章各补一句有来源的内容（4 座新生水厂、5 座淡化厂，S25、S23）；背景章的数量统一成"4.4 亿加仑""2,400 毫米"。
- **企业名**：事件标题去掉"Keppel / 吉宝"，去掉淡化厂的旧商业名（Tuaspring / 大士泉）；id 同步改成 `site-marina-east-desalination`。

**验收数据**（1920×1080）：`pnpm shoot four-taps --layout --keys --beats`，EN / ZH × paper / cinema 四种组合，键位 0 失败、七个尺寸 0 布局问题、23 拍 0 失败、chapter highlights 全部在屏、unlabelled 清单为空、console 干净、无外部请求。`control.json` 62 KB。规范截图在 `docs/screenshots/four-taps/`（本地，另有 `geo-K1…K7`）。

**已知差距**
- 蓄水池扩建前的旧轮廓、已消失的水体、填海前的海岸线都没有画（SOURCES-GEO.md §3）；Marina 蓄水池的中央海湾没有蓝色（OSM 关系不含）。
- "加入 {date}"字样仍出现在实体卡里；需要 `time.joinedOn` 的主题级覆盖（引擎改动）。
- 林木水库中文名待核；班丹 / 勿洛 / 德光岛 / 裕廊湖的中文只有通行写法。
- 集水区没有画（PUB 只给图片）。

