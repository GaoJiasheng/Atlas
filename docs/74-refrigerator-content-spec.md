# 74 · 冰箱 · 内容施工 spec（v1，待 Gavin 定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备（与空调同族）。slug `refrigerator`。

本主题要讲清楚的是：**冰箱不制造冷，它用电把热从箱子里搬到厨房里**。搬热靠的蒸气压缩循环和空调是同一个循环，原理已在 `aircon` 第 03 章讲透，这里直接链接，只讲冰箱特有的东西：发泡箱体和带磁条的门封怎样把热挡在外面，一台机器怎样同时给出 −18 °C 和 4 °C 两个温度，为什么会结霜、无霜冰箱怎样自己化霜，冰箱的热从哪里出去、为什么开着门不能给厨房降温，能效标签，以及冷媒和臭氧层的历史。

范本：结构照 docs/12（空调）和 docs/13 + skill `atlas-space-topic` 的 `references/spec-template.md`；试一试照 docs/55（heat）的 `sim.kind: "heat"`。本轮只出 spec。**正文、字幕、来源条目、parts.json 都等 Gavin 定稿后再写**（CLAUDE.md）。

---

## 0. 决定与事实复核（2026-11-15 起草）

### 0.0 决策表（默认值，带 ★ 的在 §0.1 等 Gavin 拍板）

| # | 决定 |
|---|---|
| D-1 | 对象：**双门、上冷冻下冷藏、风冷无霜（frost-free）家用冰箱**，总容积约 350 L。**通用设计研究**：无品牌、无型号、无铭牌、无显示屏文字；每个物理事实和典型数字都有来源。★ 选上冷冻的理由见 §0.1-1 |
| D-2 | 范围：讲箱体隔热、门封、冷媒回路的冰箱特有件（往复式压缩机、侧壁内藏冷凝管、门框防凝管、干燥过滤器、毛细管、回气管换热）、风扇风道风门、化霜与排水、温度传感器与控制板、灯与门开关。**不重讲**蒸气压缩循环的压力—沸点原理（链接 `aircon/switch-on`）和变频原理（链接 `aircon/efficiency-and-use`）。不讲制冰机、饮水机、多循环 / 双蒸发器高端机（细看里一句带过） |
| D-3 | **必须讲对的四处**：① 冰箱不"产生冷"，它把热搬出来；搬出来的热 = 从箱内吸走的热 + 用掉的电，所以开门不能给厨房降温，反而让厨房多出整台冰箱的耗电那么多热（§1.2 F-24）。② 无霜冰箱只有一个蒸发器，藏在冷冻室后板里；冷藏室靠风扇经风门送来的冷风降温（F-12）。③ 毛细管替代空调的膨胀阀；它和回气管贴在一起换热，所以回气管到压缩机时已接近室温（F-15、F-16）。④ 在本设计的蒸发温度 −25 °C 下，R600a 的饱和压力约 0.060 MPa（绝对压力），**低于大气压**（F-5） |
| D-4 | 7 章 31 拍（§6.0）。★ 是否压成 6 章见 §0.1-4 |
| D-5 | 分区 01–05 = 箱体与门 / 冷端（蒸发器与风路）/ 机械与热端 / 冷媒回路（只有流）/ 空气与水（只有流）（§2） |
| D-6 | 模型布局**按真实比例和位置**，不做示意映射（冰箱是一个整体，和空调不同）；唯一的示意是：冷凝管、毛细管在流里只画 2–3 程，真实回数和长度写在 detail 里；毛细管画粗（真实内径约 0.6–0.8 mm，F-15）。`topic.yaml` 的 `note`："Generic design study · not a specific brand or model / 通用设计研究 · 不代表任何品牌或型号" |
| D-7 | 事实纪律：规格行 = DESIGN（落在 TYPICAL 内）；PLATE 块模拟读数 = SIM，满足能量守恒（§1.2 模拟运行点）；设计研究来源一条（S1） |
| D-8 | 试一试：做一个，**复用已有的 `sim.kind: "heat"`**（docs/55 E-H1/E-H2），在第 02 章：压缩机不工作时，门开 / 门关 / 薄隔热层、满 / 空，10 分钟里冷藏室温度怎样上升。0 个必需的引擎扩展（§9） |
| D-9 | 不做：品牌 / 型号 / 贴图 / 配音文件 / 视频 / 测验（与空调一致） |
| D-10 | 单位：SI（°C、MPa 绝对压力、W、kWh、L）；压力一律写**绝对压力**并注明；能耗写 kWh/年（NEA 标签用的单位，F-27） |
| D-11 | 课纲接口写准（§1.3）：P4 热（热的传递方向、良 / 不良导热体、得热失热）与 P5 水的状态变化（蒸发、凝结、凝固、熔化）；**对流、辐射、潜热、压力与沸点超出小学课纲**，只进细看并写明"中学会学到" |
| D-12 | 设计环境：厨房 30 °C（新加坡室内无空调厨房的合理设计点，F-21）；冷冻室 −18 °C、冷藏室 4 °C（SFA 建议值，F-20） |

### 0.1 代定项（每项给默认，Gavin 拍板）

| # | 问题 | 默认 | 备选与理由 |
|---|---|---|---|
| 0.1-1 | 上冷冻还是下冷冻 | **上冷冻（top-freezer）** | 理由：① 新加坡组屋家庭最常见的双门布局之一，价位最普及（**待核**：施工时按 2–3 家本地大卖场的冰箱分类页统计双门款里上 / 下冷冻的数量，不点名品牌，记进 SOURCES）；② 单蒸发器在冷冻室后板、风扇把冷风经风门**向下**送进冷藏室，路径短、好画、好讲；③ 是教科书最常见的画法。备选：下冷冻（bottom-freezer，近年更多，冷藏室在顺手的高度）；改它只动零件坐标与风道走向，章节不变 |
| 0.1-2 | 冷凝器放哪 | **侧壁内藏（"热壁"，钢管贴在两侧外板内面）+ 门框防凝管 + 底部后方压缩机仓** | 理由：东南亚市场常见无霜双门机多用此做法（**待核**：施工时用 2 份服务手册 / 专利图确认，§11），也正好回答"为什么冰箱侧面和背后摸起来是温的"。备选 A：背部外露的黑色"线管式"冷凝器（老式、最直观，但现在少见）；备选 B：压缩机仓里带小风扇的盘管冷凝器。三种都在第 06 章细看里讲一句 |
| 0.1-3 | 压缩机 | **往复式（活塞）全封闭压缩机，变频（可变转速）** | 与空调的转子式形成对照（剖开能看到活塞来回）；变频原理链接空调，不重讲。备选：定速（到温就停、热了再开），温控章节更直观；2025 年起 MEPS 为 3 tick（F-26），新售机型变频比例高，默认变频，细看里讲"老冰箱一开一停" |
| 0.1-4 | 章数 | **7 章 31 拍** | 备选：把第 04 章（风扇风道）并进第 03 / 05 章，6 章 27 拍；代价是"一个蒸发器怎样给两个温度"只剩一拍 |
| 0.1-5 | 试一试 | **做，第 02 章，复用 `heat`** | 实验时长限在 0–600 s（`heat` 的现有域）；"停电时冰箱能保冷约 4 小时"只在细看引用 USDA（F-22），不模拟。要模拟小时级停电需 E-FR1（可选，默认不做） |
| 0.1-6 | 热的三种传递 | **主线只讲传导（P4 良 / 不良导热体）；对流、辐射放第 02 章细看，标"中学会学到"** | brief 要求讲三种传递在冰箱里分别在哪：放细看可以讲全，不冒充小学课纲 |
| 0.1-7 | "氟利昂 / Freon" | 首现写"含氯氟烃（CFC，常被叫作氟利昂）"/ "chlorofluorocarbons (CFCs), often called by the trade name Freon"；之后只写 CFC | Freon 是商标；作为历史俗称出现一次，不当通用名 |
| 0.1-8 | 历史写到谁 | 写米奇利（Thomas Midgley Jr.）等人 1928 年前后为找"不毒不燃"的冷媒合成 CFC；莫利纳与罗兰 1974 年的论文；英国南极调查局 1985 年发表臭氧洞；1987 年《蒙特利尔议定书》 | 只写事实，不评价个人；全球视角：发达国家 1996 年、发展中国家 2010 年停产 CFC（**待核** P25）；新加坡何时加入议定书（**待核** P25） |
| 0.1-9 | 新加坡的冰 | 写 1854 年黄埔冰屋（Whampoa Ice House）开始进口美国天然冰、途中常化掉近一半（P20） | 如 Gavin 觉得太远可删成细看一句 |
| 0.1-10 | 箱内食物 | 放一组**无标签**的通用瓶、盒（context 零件），让"满 / 空"的试一试有看得见的对应 | 备选：不放食物，箱内只看结构 |
| 0.1-11 | 外观颜色 | 浅银灰烤漆（`enamel` + tint，非品牌色） | 备选：白色 |
| 0.1-12 | 开门时风扇停转 | 只有找到服务手册原文才写；找不到就只写"门开关点亮灯" | 不写没有来源的控制逻辑 |
| 0.1-13 | 插图 | 封面 1 + 章图 3（其中 1 张代码画），§12 | 备选：章图 2 张（去掉结霜图，它在 cinema 反相下有意思颠倒风险） |

### 0.2 已做的事实复核（本轮联网核过的，施工代理仍要读原文抄准确措辞）

| 项 | 结论 | 来源（P#） |
|---|---|---|
| 新加坡家用冰箱冷媒 GWP 上限 | 单相、调整容积 ≤ 900 L 的冰箱，**GWP ≤ 15，自 2022-10-01 起**；之前已供应的不受影响 | NEA 气候变化 / RAC 冷媒页（P5） |
| 能效标签 | 冰箱 MELS 自 **2008-01-01**；评级 2014-09-01 修订；冰箱为 **1–4 tick**（空调、干衣机是 1–5）；标签写年耗电（按每天 24 小时，kWh）和年电费（按每 kWh 27 分、每天 24 小时） | NEA MELS/MEPS 页、"The Energy Label"页（P6、P7）；NCCS 2014 新闻稿（P8） |
| MEPS 历程 | 2011-09-01 起（旧 2-tick 水平）→ 2013-09-01 旧 3-tick → 2017-12-01 再提高 → 2022-01-01 全部 2-tick → **2025-04-01 全部 3-tick** | NEA MELS/MEPS 页（P6） |
| 冰箱占家庭用电 | NEA 2017 年对 550 户的一周计量：空调 24 %、冰箱 17 %、热水器 11 %；另一条 NEA 新闻稿写"约 18 %"——两数并列，正文用"约六分之一"，细看写两个来源 | P9（**待核**：读 NEA 原新闻稿与附件） |
| 冷藏 / 冷冻温度 | SFA：冷藏 4 °C 及以下、冷冻 −18 °C 及以下；细菌在 5–60 °C 繁殖最快 | SFA safe food practices（P10） |
| 停电保冷 | USDA FSIS：不开门，冷藏约 4 小时；满的冷冻柜约 48 小时（半满约 24 小时） | P11 |
| R600a 物性 | NIST：−29.2 °C 0.0484 MPa；−24.2 °C 0.0605 MPa；−20.0 °C 0.0726 MPa；0 °C 0.157 MPa；30 °C 0.405 MPa；40 °C 0.532 MPa；45 °C 0.605 MPa（绝对压力）；标准沸点约 −11.7 °C（插值 −11.8）；饱和液 / 汽焓 −24.2 °C 146.1 / 522.0 kJ/kg | NIST Chemistry WebBook，isobutane（P2） |
| 碳氢冷媒充注上限 | 家用冰箱每个回路 ≤ 150 g（UL/IEC 60335-2-24 体系；美国 EPA 2018 年把上限从 57 g 提到 150 g） | P15（**待核**：IEC 原文条款号） |
| 门从里面能推开 | 美国《冰箱安全法》1956-08-02 颁布，起因是儿童被困在旧冰箱里窒息；要求门能从里面打开（16 CFR 1750：内推力不超过 66.7 N）；磁性门封被接受为满足要求的关门方式 | CPSC / 16 CFR 1750 / ULSE（P14） |
| 化霜 | 定时或按使用情况（adaptive）触发；加热器化霜，化霜终止温控在蒸发器回暖后断开；化霜水经接水槽、排水管流到压缩机旁的蒸发盘，被压缩机或冷凝器的热蒸发掉 | 厂商服务手册（P16，**不点名**）；间隔"约 8–12 小时""15–30 分钟"只见于维修博客，**待核**（ASHRAE Handbook P17） |
| 臭氧层 | WMO/UNEP 2022 评估：按现行政策，臭氧总量回到 1980 年水平约在 2066 年（南极）、2045 年（北极）、2040 年（60°N–60°S 平均）；约 99 % 受控物质已淘汰 | P26 |
| 新加坡的冰 | 1854 年黄埔冰屋开始进口美国天然冰；运输途中多达一半会化掉；1840 年代美国冰已运到新加坡 | NLB BiblioAsia 2024 Jul–Sep（P20）、National Geographic（P21） |

**没核到、默认不用**：冰箱"每天开门多少次"的统计、"冰箱每降 1 °C 多耗电 X %"、"冰箱放满更省电 X %"——没有可靠一手来源，不写数字。

---

## 1. 主题与范围

### 1.1 对象（按真实工作顺序）

一台通用的双门上冷冻无霜冰箱（R600a），放在新加坡组屋厨房：

- **箱体与门**：外板是烤漆钢板（顶 + 两侧 + 后板），内胆是白色塑料，两者之间灌满**聚氨酯发泡**（约 50 mm，冷冻段顶部约 60 mm）——一层充满小气泡的不良导热体。中间一道发泡**中梁**把冷冻室（上，约 95 L）和冷藏室（下，约 255 L）隔开，中梁里留有回风口。两扇门也是发泡夹层，门边一圈软 PVC **门封**，里面嵌着软磁条，把门吸在钢制箱口上。
- **冷端（冷冻室后板里）**：**蒸发器**（铝管 + 片距较宽的铝鳍片，霜不容易堵死）。上方一只小**轴流风扇**把穿过蒸发器的冷空气吹进冷冻室，另一路经**风门**进入冷藏室后壁的**风道**，从几个出风口吹出。蒸发器下面是**化霜加热器**和**接水槽**，接水槽接一根**排水管**通到压缩机仓。两只**温度传感器**（热敏电阻）分别在冷冻室和冷藏室，第三只贴在蒸发器上管化霜终止。
- **机械仓与热端（底部后方）**：**往复式全封闭压缩机**（黑色罐子，里面是电机 + 曲轴 + 活塞）。高温气体经排气管进入贴在两侧外板内面的**侧壁冷凝管**，再绕一圈**门框防凝管**（让箱口保持比露点高、不凝水），凝结成液体，经**干燥过滤器**进入**毛细管**——一根很细很长的铜管，替代空调的膨胀阀。毛细管和**回气管**焊贴在一起：毛细管里的液体被回气冷却，回气被加热到接近室温再回压缩机。压缩机顶上放着**蒸发盘**。**控制板**根据传感器调压缩机转速、开关风门、定时化霜、点灯。

### 1.2 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型范围（厂商资料只当"典型"，不点名）；`DESIGN` = 本设计取值，必须落在 TYPICAL 内；`SIM` = 运行时模拟值。P# 见 §14。**"待核"= 本轮没读到原文的工作值**，施工代理读原文核对后才能用，核不到就换值或删。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 外形 | 双门上冷冻 300–450 L 约宽 600–700 × 深 650–720 × 高 1,600–1,800 mm（P17、本地卖场规格页统计） | 600 × 680（含门）× 1,700 mm | 是（统计范围） |
| F-2 | 容积 | 同上 | 总 350 L：冷冻约 95 L、冷藏约 255 L（按 §3.1 内胆尺寸算） | |
| F-3 | 冷媒 | 新售家用冰箱主流 R600a（异丁烷）；新加坡 2022-10-01 起家用冰箱 GWP ≤ 15（P5）；R134a 的 GWP 为 1,430（AR4）（P4），故被排除 | R600a | |
| F-4 | R600a 安全与气候 | ASHRAE 34：A3（低毒、高可燃）（P3）；ODP 0；GWP 约 3（P4） | — | GWP 数值的出处版本（AR4 / AR5 / EU F-gas 附件）并列 |
| F-5 | R600a 饱和压力（绝对） | −25 °C 约 0.060 MPa；−18 °C 约 0.079 MPa（插值）；30 °C 0.405 MPa；40 °C 0.532 MPa；标准沸点约 −11.7 °C（P2） | 低压侧 0.060 MPa（蒸发 −25 °C）；高压侧 0.53 MPa（冷凝 40 °C）；停机周期之间平衡约 0.08 MPa；断电放到室温约 0.41 MPa | |
| F-6 | R600a 汽化潜热 | −24 °C 约 376 kJ/kg（522.0 − 146.1，P2） | — | |
| F-7 | 充注量 | 家用冰箱 R600a 约 30–80 g；上限 150 g（P15、P17） | 55 g | 是（30–80 g 典型范围） |
| F-8 | 蒸发 / 冷凝温度 | 无霜冰箱蒸发约 −23 至 −30 °C；冷凝约比环境高 10–15 K（P17） | 蒸发 −25 °C；冷凝 40 °C | 是 |
| F-9 | 压缩机 | 家用冰箱多为往复式全封闭，排量约 4–12 cm³，变频机约 1,300–4,500 rpm，定速约 2,900 rpm（50 Hz）（P19） | 排量 8 cm³；SIM 3,100 rpm（由质量流量反算，见下） | 是 |
| F-10 | 输入功率（运转时） | 约 40–120 W（P17、P19） | 60 W（压缩机约 56 W + 风扇约 4 W） | 是 |
| F-11 | 运转时 COP | −25 / 40 °C 工况约 1.4–2.0（P17、P19） | 1.8 → 制冷量 108 W | 是 |
| F-12 | 无霜结构 | 风冷无霜：一个蒸发器在冷冻室后板，风扇 + 风门给冷藏室送风（P17） | 同 | |
| F-13 | 发泡层 | 聚氨酯硬泡，导热系数约 0.019–0.022 W/(m·K)；壁厚约 35–70 mm（P17、P18） | 0.020；侧 / 后 / 底 50 mm，冷冻段顶 60 mm，中梁 60 mm | 是 |
| F-14 | 门封 | 软 PVC 气囊 + 内嵌软磁条（P14、P17；magnets 主题 F-17） | 同 | |
| F-15 | 毛细管 | 内径约 0.6–0.9 mm，长约 2–4 m，与回气管焊接换热（P17） | 内径 0.7 mm、长 3 m（detail 写真实值；模型画粗） | 是 |
| F-16 | 回气管 | 回气在回气管里被毛细管加热，进压缩机时接近室温（P17） | SIM 约 20 °C | 是 |
| F-17 | 冷凝器 | 侧壁内藏（热壁）+ 门框防凝管，或背部线管式，或底部风冷（P17） | 侧壁内藏 + 门框管 | 是（0.1-2） |
| F-18 | 化霜 | 加热器约 100–300 W，每次约 15–30 分钟，每天 1–3 次（P16、P17） | 160 W、20 分钟、每天 2 次 → 约 0.11 kWh/天 | 是 |
| F-19 | 新加坡湿度 | 年平均相对湿度约 84 %（P12） | — | 是（MSS 原文数值） |
| F-20 | 建议温度 | SFA：冷藏 ≤ 4 °C，冷冻 ≤ −18 °C；5–60 °C 细菌繁殖最快（P10） | 冷藏 4 °C，冷冻 −18 °C | |
| F-21 | 设计环境 | 能耗测试标准的环境温度（IEC 62552 用 16 °C 与 32 °C，P28）；新加坡年均温约 27–28 °C（P12） | 厨房 30 °C（设计点，写明不是测试标准值） | 是（NEA 引用的测试标准） |
| F-22 | 停电 | 不开门冷藏约 4 h；满冷冻约 48 h、半满约 24 h（P11） | 正文 / 细看引用，不模拟 | |
| F-23 | 年耗电 | 新加坡标签按每天 24 h 计（P7）；同容量 3–4 tick 双门机约 250–450 kWh/年（NEA 注册产品库统计，P6） | 375 kWh/年（运行点 336 + 化霜 39，见下） | 是（施工时在 NEA 产品库按 300–400 L 双门筛一次，只取范围） |
| F-24 | 能量守恒 | 放出的热 = 吸走的热 + 输入的电（P29、P30） | 运转时 168 = 108 + 60 W | |
| F-25 | 标签 | 冰箱 1–4 tick；MELS 2008-01-01；评级 2014-09-01 修订（P6–P8） | 正文用 | |
| F-26 | MEPS | 2011 起；2025-04-01 起全部 3 tick（P6） | 正文用 | |
| F-27 | 标签上的数字 | 年耗电 kWh（24 h/天）；年电费（27 分/kWh）（P7） | 375 kWh × 0.27 ≈ 101 元/年（SIM，写明按标签算法） | |
| F-28 | 占家庭用电 | 17 %（NEA 2017 计量）/ 约 18 %（NEA 另一新闻稿）（P9） | 正文写"约六分之一"，细看并列 | 是 |
| F-29 | 门安全 | 美国 1956 年《冰箱安全法》（P14） | 细看 | |
| F-30 | 臭氧与议定书 | 1974 莫利纳—罗兰（P23）；1985 南极臭氧洞论文（P24）；1987-09-16 签署，1989-01-01 生效，2009 年全体联合国会员国批准，2016 年基加利修正案（P25）；1995 诺贝尔化学奖（P27）；恢复 2066 / 2045 / 2040（P26） | 第 07 章 | 日期逐条读 P25 原文 |
| F-31 | CFC 的来历 | 1928 年前后为替代有毒（氨、二氧化硫、氯甲烷）或可燃的早期冷媒而合成，1930 年公开（P22、P33） | 第 07 章 | 是 |
| F-32 | 新加坡的冰 | 1854 年黄埔冰屋；途中最多一半化掉（P20）；1840 年代美国冰已运到新加坡（P21） | 第 07 章 | |

**模拟运行点（SIM，内部自洽）**

条件：厨房 30 °C；冷冻室空气 −18 °C；冷藏室 4 °C；门关着（开门另算，见第 06 章）。

1. **漏进来的热**（传导，平均传热面积 × 导热系数 ÷ 厚度 × 温差）：
   - 冷冻室：1.4 m² × 0.020 ÷ 0.058 m × 48 K ≈ **23 W**
   - 冷藏室：3.4 m² × 0.020 ÷ 0.050 m × 26 K ≈ **35 W**
   - 门封、箱口、管线穿孔等热桥：**10 W**（DESIGN，约占 15 %，**待核**典型占比）
   - 合计 **Q漏 ≈ 69 W**（这是冰箱平均每秒必须搬走的热）
2. **运转时**：输入 60 W，COP 1.8 → 吸热 **108 W**；放热 108 + 60 = **168 W**。
3. **开机率**：69 ÷ 108 ≈ **64 %**（变频机实际是低速长开；这里用"等效满速运转比例"表示，细看写明）。
4. **平均**：输入 0.64 × 60 ≈ **38 W**；向厨房放热 69 + 38 = **107 W**（能量守恒：放出的 = 漏进来的 + 用的电）。
5. **年耗电**：38.3 W × 8,760 h ≈ 336 kWh + 化霜 160 W × 1/3 h × 2 次 × 365 ≈ 39 kWh → **约 375 kWh/年**；按标签算法 375 × 0.27 ≈ **101 元/年**。（化霜加热的热本身也要再搬一次，这里忽略，细看写明。）
6. **冷媒**：蒸发器进口焓约 260 kJ/kg（冷凝后 40 °C 液体 296 kJ/kg 经回气管换热降到约 260），出口饱和汽 522 kJ/kg → 每千克吸热约 **262 kJ**；质量流量 108 ÷ 262 ≈ **0.41 g/s（约 1.5 kg/h）**；进蒸发器时已有约 (260 − 146) ÷ (522 − 146) ≈ **30 %** 变成气体；55 g 充注量约 **130 秒（约 2 分钟）走完一圈**。
7. **压缩机转速**：回气约 20 °C、0.060 MPa 时密度 ≈ 0.060 × 10⁶ × 0.0581 ÷ (8.314 × 293) ≈ 1.43 kg/m³ → 体积流量 0.41 ÷ 1.43 ≈ 0.29 L/s ≈ 17.4 L/min；排量 8 cm³、容积效率 0.70 → **约 3,100 rpm**。
8. **侧壁表面**：冷凝 40 °C 的管贴在钢板内面，外表面 SIM 约 **37 °C**（**待核**典型值；摸上去"温热"，不烫手）。

这些数字只出现在 PLATE 块读数（带 SIM）和细看（写明"模拟运行点"）；正文写取整的范围。施工时若 F-23 的典型范围核出来不含 375 kWh，**按比例调热桥与 COP，而不是改壁厚**，并同步本节全部数字。

### 1.3 课纲接口与分工、互链

**课纲（MOE 2023 Primary Science）**，写准、不夸大（页码沿用 heat、water 主题已核的出处，施工时复核一次）：

| 课纲 | 本主题对应 | 深度 |
|---|---|---|
| P4 Energy Forms and Uses: Heat（pp. 76–77）：热从较热处流向较冷处直到同温；得热失热与温度；良 / 不良导热体 | 第 02 章（发泡层是不良导热体、热总从厨房流进箱子）、第 06 章（冰箱逆着这个方向搬热要用电） | 主线 |
| P5 Cycles in Matter and Water（Water，pp. 49–50）：水的三态与互变（蒸发、凝结、凝固、熔化） | 第 05 章（水汽结霜、化霜成水、蒸发盘里的水蒸发掉） | 主线 |
| 蒸气压缩循环、压力与沸点、潜热 | 第 03 章，链接 `aircon/switch-on` | 课外，正文点到为止 |
| 对流、辐射 | 第 02、04 章细看 | 课外，写"中学科学会学到"，不进主线 |
| 能量守恒、电能变成其他形式 | 第 06 章，链接 `energy-conversion` | 小学 P6 能量主题的延伸（**待核**年级），正文只讲"能量不会消失" |

`topic.yaml` 的 `moe`：`["MOE 2023 Primary Science P4 Energy Forms and Uses: Heat, pp. 76–77", "MOE 2023 Primary Science P5 Cycles in Matter and Water (Water), pp. 49–50"]`（页码待核后再写）。

**与已有主题的分工**（`<TopicLink slug ch>`，每处 EN、ZH 各一次）：

| 主题 · 章 | 那边讲透了什么 | 冰箱这边怎么用 | 链接位置 |
|---|---|---|---|
| `aircon` · `switch-on` | 压缩—冷凝—节流—蒸发四步；压力越低沸点越低；R32 的压力—温度表 | 只说"和空调同一个循环"，给 R600a 的两个点（−25 °C / 0.060 MPa，40 °C / 0.53 MPa），不重讲四步的物理 | 第 03 章正文第 1 段、细看 |
| `aircon` · `where-the-air-goes` | 室外机放出的热 = 吸的热 + 用的电 | 冰箱把这份热放在**同一个厨房里**，所以不能当空调 | 第 06 章 |
| `aircon` · `efficiency-and-use` | 变频原理、空调 tick 标签（1–5） | 冰箱标签是 1–4 tick，评法不同；变频一句带过 | 第 03 章细看、第 07 章 |
| `heat` · `slowing-heat-transfer` | 隔热减慢传热，保冷也一样 | 发泡层就是这个原理的工业版 | 第 02 章 |
| `heat` · `heat-along-spoons` | 良 / 不良导热体 | 钢板外壳、铝蒸发器（良）与发泡（不良）各司其职 | 第 02 章细看 |
| `heat` · `cooling-curves` | 温差越大升降越快 | 试一试的曲线前段较陡 | 第 02 章试一试 |
| `water` · `the-water-cycle` | 蒸发、凝结 | 结霜、化霜、蒸发盘 | 第 05 章 |
| `states-of-matter` · `gases` | 气体能被压缩 | 压缩机压的是冷媒气体 | 第 03 章拍 2 字幕不链，正文链一次 |
| `energy-conversion` · `electrical-energy-at-home` / `never-used-up` | 电能变成动能、热能；能量不会用完 | 冰箱用的电最后全变成厨房里的热 | 第 06 章 |
| `magnets` · `magnets-at-work` | 冰箱门封里的磁条 | 门封的剖面、为什么要能从里面推开 | 第 02 章 |

反向链接（施工完成后由主会话决定是否加）：`aircon/switch-on` 细看、`heat/slowing-heat-transfer` 细看、`magnets/magnets-at-work` 各加一处指向本主题；**不在本轮改**。

### 1.4 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`（与空调一致）：读者是一般读者含小学生和家长；短句、先现象后原理；每章正文 EN 200–300 词 / ZH 350–500 字、3–5 段，细看 2–4 块；数字取整 + 约，模拟值写明"在这个模拟运行点"。安全：R600a 可燃，但密封在管里、量很少（≤ 150 g）；**维修、搬运时弄破管路有风险，交给受过训练的人**；不渲染危险，也不回避。冰箱安全法讲到儿童被困窒息：写事实、用词克制，不写细节场景。

---

## 2. 分区 01–05

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `cabinet` | Cabinet and doors / 箱体与门 | 外箱、右侧板、发泡层、两只内胆、中梁、两扇门、门封、磁条、搁架、果蔬盒、门架、灯 | `token:ink-2` |
| 02 | `cold-side` | Cold side / 冷端 | 蒸发器、霜层、风道盖板、风扇、冷藏风道、风门、化霜加热器、接水槽、排水管、传感器 | `token:cold` |
| 03 | `machine` | Machine and warm side / 机械与热端 | 压缩机、活塞、电机、排气管、侧壁冷凝管、门框防凝管、干燥过滤器、毛细管、回气管、蒸发盘、控制板、机械仓后盖 | `token:neutral` |
| 04 | `refrigerant` | Refrigerant loop / 冷媒回路 | 只有流（4 段，§4） | `token:hot`（图例渐变） |
| 05 | `air-water` | Air and water / 空气与水 | 只有流：箱内两路冷风、厨房一侧上升的暖气流、开门时的进出气流、化霜水 | `token:cold` |

- 有零件的组在 PLATE 立面里按组色画；04、05 只在 LAYERS 和 KEY 里。
- context 零件：`food-items`（箱内无标签的瓶和盒），不属于任何分区。

---

## 3. 零件表

### 3.1 坐标与尺度

- 单位米，Y 向上，+Z 朝观者（冰箱正面），+X 向右；地面 y = 0。铰链在右（门向右开）。
- 箱体：x −0.300…0.300；箱身 z −0.340…0.280，门 z 0.280…0.340；y 0.020…1.700（底下 20 mm 是调平脚）。
- 冷冻室内腔：x −0.250…0.250，y 1.210…1.640，z −0.290…0.230（后部 z −0.290…−0.209 是蒸发器腔，被风道盖板隔开）。
- 中梁：y 1.150…1.210。
- 冷藏室内腔：x −0.250…0.250，y 0.070…1.150，z −0.290…0.230；后下角让出压缩机仓（y < 0.280、z < −0.120 的台阶）。
- 压缩机仓：x −0.290…0.290，y 0.020…0.270，z −0.340…−0.120。
- 整体包络 0.60 × 1.70 × 0.68 m，模型半径约 0.95 m；投影门槛 ≥ 0.28 × 0.95 ≈ 0.27 m（只有外箱、两扇门、发泡层、内胆投影）。
- primitive 写法照 `schema.ts` 与 `modelling-runbook.md` §3；`tube.path` 相对 `at`（下表给绝对点，施工时减去 `at`）。坐标是起点，R2 按参考图调，不改量级。

### 3.2 零件（36 个 + 1 个 context；右侧冷凝管用 `bilateral` 镜像出左侧，镜像件不另编号）

材质族：`enamel`（外板）、`plastic`（内胆、风道、塑料件）、`glass`（搁架、果蔬盒、灯罩、霜层）、`casing`（铝：蒸发器）、`copper`、`steel`、`stainless`、`powder`（压缩机黑漆）、`rubber`（门封、排水管）。"shell"= X-RAY 时透明；"隐"= 默认隐藏的章；"参考"= §11 编号。

| # | id 名称 | 组 | primitive（+ extra） | at | 材质 | explode dir · dist | connects | shell | 投影 | 隐 | 参考 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `outer-case` 外箱 | cabinet | extra 三块 bevelBox：顶 [0.600, 0.008, 0.620]（y 1.696）、左侧 [0.008, 1.676, 0.620]（x −0.296）、后板 [0.584, 1.430, 0.004]（y 0.985, z −0.338）；bevel 0.003 | (0, 0.86, −0.03) | enamel tint `#c4c6c3` | [−1, 0.3, 0] · 0.20 | foam, side-panel-right | ✓ | ✓ | 03–06 章 | R1 R2 |
| 02 | `side-panel-right` 右侧板 | cabinet | bevelBox [0.008, 1.676, 0.620] bevel 0.003 | (0.296, 0.858, −0.03) | enamel 同上 | [1, 0, 0] · 0.25 | side-condenser | ✓ | ✓ | 03–06 章 | R1 |
| 03 | `foam` 发泡层 | cabinet | extra 五块 bevelBox（封闭体，剖切时填剖面）：左右壁 [0.042, 1.62, 0.604]、后壁 [0.500, 1.40, 0.045]、顶 [0.584, 0.052, 0.604]、底 [0.500, 0.045, 0.40] | 箱体中心 | plastic tint `#d8c58e`（聚氨酯淡黄） | 0（不拆） | outer-case, freezer-liner, fresh-liner | ✓ | ✓ | — | R3 |
| 04 | `freezer-liner` 冷冻室内胆 | cabinet | 五块薄 bevelBox 围成开口盒（厚 0.004） | (0, 1.425, −0.03) | plastic tint `#ecebe6` | 0 | foam | ✓ | | — | R4 |
| 05 | `fresh-liner` 冷藏室内胆 | cabinet | 同上，后下角台阶（extra 两块）让出压缩机仓 | (0, 0.61, −0.03) | plastic 同上 | 0 | foam, air-duct | ✓ | | — | R4 |
| 06 | `mullion` 中梁 | cabinet | extrude：XZ 平面轮廓 0.50 × 0.52，两个孔（前部回风口 0.40 × 0.03、后部送风孔 0.08 × 0.04），depth 0.06，rotation [90, 0, 0] | (0, 1.180, −0.03) | plastic + foam extra | 0 | damper, freezer-liner, fresh-liner | | | — | R4 |
| 07 | `freezer-door` 冷冻门 | cabinet | bevelBox [0.600, 0.494, 0.050]；extra：内衬 bevelBox [0.50, 0.40, 0.012]（z 0.274）、门槽把手（左上沿凹槽，bevelBox）、上铰链（steel） | (0, 1.450, 0.305) | enamel + plastic | [0, 0, 1] · 0.25 | door-gaskets | ✓ | ✓ | — | R1 R5 |
| 08 | `fresh-door` 冷藏门 | cabinet | bevelBox [0.600, 1.124, 0.050]；extra 同上（中、下铰链） | (0, 0.600, 0.305) | enamel + plastic | [0, 0, 1] · 0.25 | door-gaskets, lamp | ✓ | ✓ | — | R1 R5 |
| 09 | `door-gaskets` 门封 | cabinet | tube 闭合矩形 r 0.009，bendRadius 0.02，沿门内侧周边一圈；extra 第二扇门一圈 | 门内侧 z 0.278 | rubber tint `#b8b8b2`（灰白 PVC） | [0, 0, 1] · 0.32 | freezer-door, fresh-door, magnet-strips | ✓ | | — | R6 |
| 10 | `magnet-strips` 磁条 | cabinet | tube r 0.003，与门封同路径（在气囊里） | 同上 | powder | 同 09 | door-gaskets, outer-case | | | — | R6 |
| 11 | `shelves` 搁架 | cabinet | box [0.50, 0.005, 0.44]，repeat {count 3, axis [0,1,0], spacing 0.24}（冷藏 y 0.43 / 0.67 / 0.91）；extra 冷冻室一层（y 1.42） | (0, 0.67, −0.01) | glass | 0 | fresh-liner | | | — | R4 |
| 12 | `crisper` 果蔬盒 | cabinet | bevelBox [0.48, 0.20, 0.40] bevel 0.006（开口向上用 extra 四壁 + 底） | (0, 0.18, 0.00) | glass tint 浅灰 | [0, 0, 1] · 0.20 | fresh-liner | | | — | R4 |
| 13 | `door-bins` 门架 | cabinet | bevelBox [0.48, 0.08, 0.09]，repeat {count 3, axis [0,1,0], spacing 0.30}；extra 冷冻门一只 | 门内侧 z 0.22 | glass | 随门姿态 | fresh-door | | | — | R5 |
| 14 | `lamp` 灯与门开关 | cabinet | bevelBox [0.10, 0.012, 0.04]（LED 灯罩，冷藏室顶前部）；extra：门开关 cylinder r 0.006（箱口左侧）；extra `lamp-glow` 薄片（sim `visible` 绑定开门） | (0, 1.135, 0.12) | glass；门开关 plastic | 0 | fresh-door, control-board | | | — | R4 |
| 15 | `evaporator` 蒸发器 | cold-side | coilBank rows 2, cols 7, pitch 0.032, tubeRadius 0.004, length 0.42, finPitch 0.007（真实无霜蒸发器片距约 5–10 mm，模型可按真实，**待核**）, finDepth 0.05, bends both, tubeColor casing（铝管）；管沿 X、7 列沿 Y | (0, 1.40, −0.250) | casing | [0, 0.4, −1] · 0.22 | capillary-tube, suction-line, defrost-heater | ✓ | | — | R7 R8 |
| 16 | `frost` 霜层 | cold-side | extra 7 根 capsule（沿 X，r 0.010，套在每排管外）+ 一块 box [0.42, 0.24, 0.008] 贴迎风面；pose `frost-thin`（scale 0.6）/ `frost-thick`（1.0） | 同 15 | glass tint `#f2f4f3` | 同 15 | evaporator | | | 除第 05 章外 | R8 R9 |
| 17 | `evap-cover` 风道盖板 | cold-side | bevelBox [0.50, 0.43, 0.012]；extra 顶部出风格栅 grille slats [0.30, 0.012, 0.04] ×1、底部回风缝 | (0, 1.425, −0.209) | plastic 白 | [0, 0, 1] · 0.20 | evap-fan, freezer-liner | ✓ | | 03、05 章 | R7 |
| 18 | `evap-fan` 风扇 | cold-side | blades axial count 5, radius 0.045, hub 0.016, pitch 30, thickness 0.002, rotation [90, 0, 0]；extra 电机 cylinder r 0.022 × 0.03（steel）、支架 | (0, 1.585, −0.232) | plastic + steel | [0, 0, 1] · 0.15 | evaporator, damper, control-board | | | — | R7 |
| 19 | `air-duct` 冷藏风道 | cold-side | bevelBox [0.10, 0.84, 0.028]（贴冷藏室后壁）；extra 三个出风口 bevelBox [0.07, 0.02, 0.01]（y 1.00 / 0.76 / 0.52） | (0, 0.73, −0.276) | plastic 白 | [0, 0, 1] · 0.15 | damper, fresh-liner | ✓ | | — | R7 |
| 20 | `damper` 风门 | cold-side | bevelBox [0.09, 0.06, 0.05]（框）；extra 门片 box [0.07, 0.002, 0.04]；pose `damper-open`（门片绕 X 转 70°，pivot 前沿） | (0, 1.18, −0.258) | plastic 深灰 | [0, 0, 1] · 0.18 | evap-fan, air-duct, control-board | | | — | R7 |
| 21 | `defrost-heater` 化霜加热器 | cold-side | tube r 0.005：沿蒸发器底横走 → 两端向上沿侧边（U 形），bendRadius 0.015 | 蒸发器下沿 y 1.27 | stainless | 同 15 | evaporator, defrost-sensor（sensors）, control-board | | | — | R8 |
| 22 | `drain-trough` 接水槽 | cold-side | extrude U 截面（宽 0.46、深 0.03、壁 0.002）沿 X，向中部出水口略倾 | (0, 1.235, −0.25) | plastic | [0, −1, 0] · 0.12 | drain-tube | | | — | R8 |
| 23 | `drain-tube` 排水管 | cold-side | tube r 0.006：(0, 1.22, −0.27) → (0.18, 1.20, −0.30) → (0.18, 0.30, −0.315) → 蒸发盘上方 (0.12, 0.25, −0.25) | 路径中点 | rubber | 0 | drain-trough, drain-tray | ✓ | | — | R10 |
| 24 | `sensors` 温度传感器 | cold-side | capsule r 0.004 × 0.02 ×3（extra）：冷冻室侧壁 (−0.22, 1.50, −0.18)、冷藏室侧壁 (−0.24, 0.95, −0.15)、蒸发器出口管上 (0.20, 1.52, −0.245) | 第一只 | rubber（黑色热缩头） | [−1, 0, 0] · 0.10 | control-board | | | — | R11 |
| 25 | `compressor` 压缩机 | machine | lathe 封闭壳（r 0.075、总高 0.17，上下封头 + 焊缝），segments 40；extra：底板 + 四只橡胶脚（rubber）、接线盒（plastic）、吸排气管接头（copper） | (0.08, 0.12, −0.23) | powder | [0, 0, −1] · 0.25 | discharge-line, suction-line, compressor-motor, control-board | | | — | R12 R13 |
| 26 | `compressor-piston` 活塞与连杆 | machine | 活塞 cylinder r 0.0125 × 0.02（轴沿 X）；extra 缸体 cylinder（steel，r 0.016）、连杆 box | (0.11, 0.15, −0.23) | steel | 同 25 | compressor-motor | | | — | R13 |
| 27 | `compressor-motor` 电机 | machine | 定子 lathe 环（copper 绕组 + steel 铁芯）；extra 转子 cylinder | (0.08, 0.09, −0.23) | steel + copper | 同 25 | compressor-piston | | | — | R13 |
| 28 | `discharge-line` 排气管 | machine | tube r 0.0024：压缩机顶 (0.10, 0.21, −0.23) → (0.27, 0.22, −0.30) → 右侧板内面下角 (0.288, 0.30, −0.30) | 路径中点 | copper | [0, 0, −1] · 0.20 | compressor, side-condenser | | | — | R10 |
| 29 | `side-condenser` 侧壁冷凝管 | machine | tube r 0.0024 蛇形，贴右侧板内面（x 0.288）：8 程竖走 z −0.30…0.22、y 0.30…1.62（≤ 40 点），bendRadius 0.03；`bilateral: { axis: "x" }` 出左侧件；两侧之间经顶部后沿横管连通（extra tube） | (0.288, 0.96, −0.04) | copper（detail：常为镀铜钢管，**待核**） | [1, 0, 0] · 0.20（随右侧板） | discharge-line, frame-pipe | ✓ | | — | R2 R14 |
| 30 | `frame-pipe` 门框防凝管 | machine | tube r 0.0024 闭合"日"字路径，沿冷冻室、冷藏室箱口前沿一圈（z 0.272） | 箱口 | copper | 0 | side-condenser, filter-drier | ✓ | | — | R14 |
| 31 | `filter-drier` 干燥过滤器 | machine | cylinder r 0.009 × 0.10（竖放）；两端 cone 缩口（extra） | (−0.20, 0.19, −0.30) | copper | [0, 0, −1] · 0.15 | frame-pipe, capillary-tube | | | — | R10 R15 |
| 32 | `capillary-tube` 毛细管 | machine | tube r 0.0012（画粗，见 D-6）：过滤器 → 沿后壁上行，在回气管外绕 4 圈螺旋（48 点）→ 蒸发器左下进口 (−0.21, 1.27, −0.26) | 路径中点 | copper | 0 | filter-drier, evaporator, suction-line | ✓ | | — | R15 |
| 33 | `suction-line` 回气管 | machine | tube r 0.0032：蒸发器右上出口 (0.21, 1.58, −0.26) → 沿后壁（发泡层内）下行 → 压缩机吸气口 (0.04, 0.17, −0.25) | 路径中点 | copper | 0 | evaporator, compressor, capillary-tube | ✓ | | — | R15 |
| 34 | `drain-tray` 蒸发盘 | machine | bevelBox [0.20, 0.03, 0.14] 开口盒（extra 四壁） | (0.08, 0.225, −0.23) | plastic | [0, 1, 0] · 0.12 | drain-tube, compressor | | | — | R10 |
| 35 | `control-board` 控制板 | machine | bevelBox [0.16, 0.10, 0.025]（盒）；extra 线束 tube 到风扇、风门、传感器（只画一束） | (−0.15, 0.14, −0.31) | steel | [−1, 0, −0.5] · 0.20 | compressor, evap-fan, damper, sensors, defrost-heater, lamp | | | — | R11 |
| 36 | `bay-grille` 机械仓后盖 | machine | grille slats size [0.584, 0.004, 0.25]，count 18 | (0, 0.145, −0.342) | powder tint 深灰 | [0, 0, −1] · 0.25 | compressor | ✓ | | 03、05、06 章 | R1 R10 |
| — | `food-items` 箱内食物（context） | — | extra ≤ 12：lathe 瓶（无标签）、bevelBox 盒、sphere 果蔬；`clip: false` | 冷藏室各层 | plastic / glass 灰调 tint | — | — | — | — | 第 03 章 | — |

- **零件数说明**：空调 36 + 墙；冰箱 36 + 食物。外箱拆成"外箱 + 右侧板"是为了第 06 章把右侧板拆开、露出贴在它内面的冷凝管；门封与磁条分开是为了第 02 章单独标注磁条（链接 magnets）；压缩机拆成壳、活塞、电机三件是为了剖开看到活塞（与空调的转子式对照）。删减顺序（如超预算）：`door-bins` → `crisper` → `compressor-motor`（并入 compressor extra）→ `frost` 改为 `evaporator` 的 tint。
- **默认不隐藏零件**（第 01 章完整外观）；`hide` 不累积。

### 3.3 summary / detail 要点（施工时写成 EN / ZH；summary ≤ 60 字符，第一句说它做什么）

| id | summary | detail 要点 |
|---|---|---|
| outer-case | 钢板外壳，顶、左侧和背后 | 烤漆钢板；外壳本身导热好，隔热靠里面的发泡（F-13） |
| side-panel-right | 右侧外板，里面贴着冷凝管 | 摸上去温热，就是这个原因；左侧同样（F-17） |
| foam | 发泡层：充满小气泡，热很难穿过 | 聚氨酯，约 0.020 W/(m·K)；50 mm 厚；发泡时注入后在壳和内胆之间膨胀固化，也把箱体粘成整体（P17） |
| freezer-liner / fresh-liner | 塑料内胆，好清洁、不生锈 | 内胆和外壳之间不直接相连，避免"热桥" |
| mullion | 隔开两个温度，中间留有风口 | 60 mm 发泡；前部回风、后部送风 |
| freezer-door / fresh-door | 发泡夹层门 | 门也是隔热墙；门内的门架随门转 |
| door-gaskets | 门边一圈软胶条，把缝封住 | 软 PVC 气囊，贴合不平的箱口；变硬、开裂就会漏冷（漏热） |
| magnet-strips | 胶条里的磁条把门吸紧 | 柔性磁条吸在钢制箱口上；门能从里面推开（F-29）；链接 magnets |
| shelves / crisper / door-bins | 放食物的搁架、果蔬盒、门架 | 果蔬盒让蔬菜周围的空气流动小、更湿，蔬菜不易干（**待核**） |
| lamp | 开门时亮的灯；门开关控制它 | LED；门开关同时告诉控制板"门开了"（是否停风扇见 0.1-12） |
| evaporator | 冷媒在管里沸腾，从空气里吸热 | 铝管铝鳍片；约 −25 °C、0.060 MPa（低于大气压，F-5）；片距宽，霜不容易一下堵死 |
| frost | 空气里的水汽在冷管上结成的霜 | 霜是不良导热体，还挡风；所以要定时化掉（第 05 章） |
| evap-cover | 冷冻室后板，挡住蒸发器、组成风道 | 上出风、下回风 |
| evap-fan | 把冷空气吹进冷冻室和冷藏室 | 小轴流风扇，约 4 W（**待核**） |
| air-duct | 把冷风送到冷藏室各层 | 出风口在后壁，几层都吹得到 |
| damper | 开大关小，决定多少冷风进冷藏室 | 冷藏室传感器读数高于设定值时开（P17） |
| defrost-heater | 化霜时通电发热，融掉霜 | 160 W，每次约 20 分钟，每天约 2 次（DESIGN，F-18） |
| drain-trough / drain-tube | 接住化霜水，引到压缩机仓 | 排水口有时也结冰，有的机型加小加热丝（P16） |
| sensors | 量冷冻室、冷藏室和蒸发器的温度 | 热敏电阻：温度变，电阻变；控制板据此控制 |
| compressor | 把冷媒气体压到高压，推动整个回路 | 往复式全封闭；SIM 3,100 rpm；外壳黑漆，摸上去热 |
| compressor-piston | 活塞来回运动，一次吸一口气、压一口气 | 排量约 8 cm³（DESIGN）；比较 aircon 的转子式 |
| compressor-motor | 电机，带动曲轴和活塞 | 变频：改变转速；链接 aircon 第 05 章 |
| discharge-line | 压缩机出来的热气走这根管 | 模拟运行点约 65 °C（**待核**） |
| side-condenser | 冷媒在这里把热交给厨房空气，凝结成液体 | 贴在外板内面，热经钢板传到外面；侧面所以是温的 |
| frame-pipe | 让箱口保持温热，不凝水珠 | 新加坡空气湿，箱口若太冷会凝露；利用冷凝器的余热，不额外用电 |
| filter-drier | 吸掉回路里的微量水分、挡住杂质 | 水分会在毛细管出口结冰堵住 |
| capillary-tube | 很细很长的管，让冷媒压力骤降 | 内径约 0.7 mm、长约 3 m；没有活动件；与回气管焊贴换热（F-15） |
| suction-line | 蒸发后的冷媒气体回压缩机 | 一路被毛细管加热，到压缩机时接近室温（F-16） |
| drain-tray | 化霜水在这里被热蒸发掉 | 不需要人倒水 |
| control-board | 读传感器，管压缩机、风扇、风门、化霜和灯 | 电子控制；老冰箱用机械温控器 |
| bay-grille | 机械仓后盖，让热空气能流走 | 背后要留空，说明书会写距离（只写"按说明书"） |

---

## 4. 流

颜色语义与空调相同（每色一个意思，冷媒和空气共用）：`hot` = 高于室温，`neutral` = 接近室温，`cold` = 低于室温。物态靠粒子疏密与速度：液体密而慢、气体疏而快。首尾相接的段 `ends: "open"`，各段 `count / 长度 × speed` 大致相等（约 60 个/秒）。速度是可视速度，不宣称真实流速。

| id | group | 段 | 路径（按零件） | 约长 m | speed | count | size × | spread | stops（u: 色） | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ref-hot-gas` | refrigerant | 热气体 → 在侧壁里凝结 | 压缩机顶 → discharge-line → 右侧壁 3 程 → 顶后沿横管 → 左侧壁 3 程 → 左前下角 | 9.0 | 0.9 | 600 | 0.45 | 0.002 | 0: hot · 0.6: hot · 1: neutral | open | ✓ | compressor, discharge-line, side-condenser, 镜像件（id 按引擎 bilateral 规则 `<id>-r` / `-l`） |
| `ref-warm-liquid` | refrigerant | 温的液体 | 箱口门框管一圈 → 干燥过滤器 | 3.4 | 0.35 | 600 | 0.45 | 0.002 | 0: neutral · 1: neutral | open | ✓ | frame-pipe, filter-drier |
| `ref-cold-mix` | refrigerant | 节流 → 冷的气液混合 → 在蒸发器里沸腾 | 过滤器 → 毛细管（螺旋段只画 2 圈）→ 蒸发器 3 程 | 3.6 | 0.4 | 860 | 0.45 | 0.002 | 0: neutral · 0.55: cold · 1: cold | open | ✓ | filter-drier, capillary-tube, evaporator |
| `ref-cool-gas` | refrigerant | 冷气体回压缩机，途中被加热 | 蒸发器出口 → suction-line（与毛细管并行段）→ 压缩机 | 1.9 | 1.0 | 120 | 0.45 | 0.002 | 0: cold · 0.5: cold · 1: neutral | open | ✓ | evaporator, suction-line, compressor |
| `air-freezer` | air-water | 冷冻室循环（闭环） | 风扇 → 盖板顶出风 → 沿顶前行 → 沿门内侧下降 → 沿底回后 → 盖板底回风 → 穿过蒸发器 → 风扇 | 1.9 | 0.35 | 300 | 0.8 | [0.18, 0.02, 0.02] | 单色 cold | — | ✓ | evap-fan, evaporator |
| `air-fresh` | air-water | 冷藏室送风与回风 | 风扇 → 风门 → 风道 → 三个出风口 → 横穿各层 → 前部上行 → 中梁前回风口 → 蒸发器底 | 3.2 | 0.35 | 420 | 0.8 | [0.18, 0.02, 0.02] | 0: cold · 1: cold | — | ✓ | evap-fan, damper, air-duct, mullion, evaporator |
| `air-kitchen` | air-water | 侧面、背后的暖空气上升（`paths` 两条：右侧外、后板外） | 侧板外 2 cm 自下而上；后板外自仓口而上 | 2 × 1.7 | 0.25 | 360 | 0.8 | [0.02, 0.05, 0.12] | 0: neutral · 0.3: hot · 1: hot | fade | ✗ | — |
| `air-door` | air-water | 开门时：冷空气从门口下部流出、厨房热湿空气从上部流入（`paths` 两条，sim `visible` 绑定 setup = open） | 下：箱内 → 门口下沿 → 地面；上：门口上沿外 → 箱内顶 | 2 × 0.8 | 0.3 | 300 | 0.9 | [0.2, 0.03, 0.05] | 下：cold；上：0: hot · 1: cold（`paths` 共一组 stops 时退路：拆两条流） | fade | ✗ | — |
| `meltwater` | air-water | 化霜水（第 05 章；sim `visible` 绑定化霜控件，或章节 layers） | 接水槽 → 排水管 → 蒸发盘 | 1.4 | 0.2 | 80 | 0.6 | 0.002 | 单色 neutral | fade | ✓ | drain-trough, drain-tube, drain-tray |

- 冷媒四段首尾相接，回路链：compressor → discharge-line → side-condenser → frame-pipe → filter-drier → capillary-tube → evaporator → suction-line → compressor；右上卡运转时沿它步进。
- 在压缩机里（`ref-cool-gas` 末 → `ref-hot-gas` 首）颜色从 neutral 跳到 hot，第 03 章拍 2 讲"压缩使气体变热"；`ref-cold-mix` 在毛细管里由 neutral 渐变到 cold，表示压力沿细管逐渐降低（与空调膨胀阀"一下子降"不同，细看写一句）。
- 合计 9 条流 → 运转时最多 +9 次绘制（`air-door` 与 `meltwater` 只在部分拍可见；< 10）。若 `air-door` 两条 path 需要不同颜色而 `paths` 共用 stops，退路是拆成两条流（= 10 条，压线）。

---

## 5. 动画与姿态

全部 `whenRun: true`。转速是可读的视觉速度；真实值只在 PLATE 读数和细看（第 03 章细看写"画面里的转动放慢了几十倍"）。

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `piston-stroke` | compressor-piston | sequence | keys t 0 / 0.4 / 0.8：offset x 0 → −0.008 → 0；loop | 剖开或 X-RAY 才看得见；约每秒 1.25 次（真实约 50 次/秒） |
| `motor-spin` | compressor-motor | rotate | axis [0,1,0]，rpm 75 | 与活塞同步的视觉速度 |
| `fan-spin` | evap-fan | rotate | axis [0,0,1]，rpm 40 | 5 片，60 fps 每帧 2.4°，远小于半叶距 36° |
| `damper-breathe` | damper | — | 不做动画，用 pose | 风门开合是控制动作，不是周期运动 |

姿态（`poses`，≤ 32；默认缓动 0.8 s）：

| pose | 零件 | 内容 |
|---|---|---|
| `doors-open` | freezer-door, fresh-door, door-bins, door-gaskets, magnet-strips | 绕右侧铰链（pivot x 0.300, z 0.335）转 −100°（向右开） |
| `fresh-door-open` | fresh-door 与其门架、门封、磁条 | 只开冷藏门（第 04、06 章） |
| `damper-open` / 默认关 | damper | 门片转 70° |
| `frost-thin` / `frost-thick` | frost | scale 0.6 / 1.0（只在第 05 章） |

---

## 6. 章节

### 6.0 总表

镜头写预设名（§7.4）；`layers` 只写与默认（全部）不同的；`hide`、`labels` 不累积。

| # | id | 标题 EN / ZH | view | run | cutaway | pose | hide | layers | part | labels | 镜头 | 拍 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `whole-fridge` | Two doors, two temperatures / 两扇门，两个温度 | assembled | false | none | — | — | 01–03 | null | freezer-door, fresh-door, bay-grille | hero | 4 |
| 02 | `keeping-heat-out` | Keeping heat out / 把热挡在外面 | assembled | false | `centre` | — | food-items 由 sim 控制 | 01–03 | foam | foam, door-gaskets, magnet-strips, outer-case | section | 5 |
| 03 | `the-cold-loop` | Switch on: the refrigerant loop / 通电：冷媒循环 | xray | true | none | — | outer-case, side-panel-right, bay-grille, evap-cover, food-items | 02, 03, 04 | compressor | compressor, side-condenser, capillary-tube, evaporator | back | 5 |
| 04 | `cold-air-inside` | One coil, two temperatures / 一个蒸发器，两个温度 | xray | true | `centre` | — | food-items | 01, 02, 05 | evap-fan | evap-fan, damper, air-duct, sensors | section | 4 |
| 05 | `frost-and-defrost` | Frost and defrosting / 结霜与化霜 | xray | false | none | frost-thick | evap-cover, outer-case | 01, 02, 03, 05 | evaporator | evaporator, frost, defrost-heater, drain-tube | coldspot | 4 |
| 06 | `heat-out-the-back` | Where the heat goes / 热去了哪里 | assembled | true | none | — | side-panel-right, bay-grille | 全部 | side-condenser | side-condenser, frame-pipe, compressor, drain-tray | back | 4 |
| 07 | `energy-and-history` | Electricity, labels and refrigerants / 用电、标签和冷媒 | assembled | false | none | — | — | 01–03 | null | compressor, capillary-tube, door-gaskets | hero | 5 |

合计 **7 章 31 拍**。每章 `summary` 是阅读面板头一句，也是默认字幕。

### 6.1 第 01 章 `whole-fridge`

- **summary**：A fridge is an insulated box with a machine that moves heat out of it. This one keeps the top compartment at about −18 °C and the bottom at about 4 °C. / 冰箱是一个隔热的箱子，加上一台把热搬出箱子的机器。这台冰箱上层约 −18 °C，下层约 4 °C。
- **正文提纲**：① 冰箱不"装进冷"，它把食物和空气里的热不断搬到外面（引出第 03、06 章）。② 两个室各管什么：冷冻室让水结冰、冷藏室刚好在冰点之上；SFA 建议值（F-20），细菌在 5–60 °C 繁殖最快——冷藏室要低于这个范围。③ 外形与容积（F-1、F-2）；新加坡家庭的冰箱约用掉全家六分之一的电（F-28，引出第 07 章）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（hero） | 双门冰箱：上冷冻、下冷藏；约 1.7 m 高、350 L |
| 2 | pose doors-open；camera inside；labels shelves, crisper, door-bins, lamp | 开门：搁架、果蔬盒、门架，门一开灯就亮 |
| 3 | pose doors-open；labels freezer-liner, fresh-liner, mullion | 两个室中间隔着一道厚厚的中梁：上面约 −18 °C，下面约 4 °C |
| 4 | camera back；labels bay-grille, outer-case | 背后底部是机械仓，压缩机就在里面 |

- **细看**：`Why 4 °C and −18 °C`（SFA 数字、危险温度区）；`How big is it`（外形、容积怎么量；同类冰箱的典型范围 F-1）；`What is not in this model`（制冰机、饮水机、双蒸发器机型一句话）。
- **本章索引**：outer-case, freezer-door, fresh-door, shelves, crisper, door-bins, lamp, freezer-liner, fresh-liner, mullion, bay-grille
- **名词首现**：refrigerant（一句话解释，详细在第 03 章）

### 6.2 第 02 章 `keeping-heat-out`

- **summary**：Heat always flows from the warm kitchen into the cold box. Foam walls and a magnetic door seal slow it down; they cannot stop it. / 热总是从温暖的厨房流进冰冷的箱子。发泡墙和带磁条的门封让它流得慢，但挡不住。
- **正文提纲**：① P4 课纲句：热从较热处流向较冷处（F-24 前提）；冰箱的墙就是一道"让热流得慢"的墙。② 发泡层：小气泡里的空气是不良导热体（链接 `heat/slowing-heat-transfer`）；50 mm 厚（F-13）；钢板外壳是良导热体，但它不负责隔热。③ 门封：软胶条贴合箱口，磁条吸紧（链接 `magnets/magnets-at-work`）；磁力让门能从里面推开（F-29，细看）。④ 模拟运行点：关着门，每秒约 69 J 的热漏进来（SIM，§1.2），机器必须把这些搬出去。⑤ 试一试：压缩机不工作时，开门 10 分钟和关门 10 分钟差多少。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | cutaway centre；camera section；labels foam, outer-case, fresh-liner | 剖开侧壁：钢板、发泡、塑料内胆三层，发泡约 5 cm 厚 |
| 2 | 同上；labels foam, mullion, freezer-liner | 冷冻室那边更厚：温差更大，漏热更多（23 W 对 35 W 是不同面积，字幕只说"更厚"） |
| 3 | camera gasket；labels door-gaskets, magnet-strips | 门封：软胶条里藏着磁条，把门吸在钢制箱口上 |
| 4 | sim.set {setup: closed, contents: full, elapsed-s: 600}；sim.reveal | 关门、压缩机不转：10 分钟后冷藏室约 4.5 °C（SIM） |
| 5 | sim.set {setup: open, contents: full, elapsed-s: 600}；pose 由 bind 开门；flow air-door 可见 | 开着门：10 分钟后约 9.5 °C（SIM）；冷空气从门口下部流出 |

- **试一试**：见 §8。
- **细看**：`Three ways heat gets in`（**中学会学到**：传导——穿过墙和门；对流——开门时空气交换，箱内风扇也靠空气流动搬热；辐射——厨房墙面、灯等向箱体发出的红外线，被外壳挡下再传导进来；三种各一句、不给数字）；`Why the door opens from inside`（1956 年美国法律与磁性门封，F-29，用词克制）；`Numbers at this simulated operating point`（§1.2 第 1 步的算式）；`Good and poor conductors here`（钢板、铝蒸发器是良导热体，用在需要传热的地方；发泡、塑料内胆是不良导热体，用在要挡热的地方；链接 `heat/heat-along-spoons`）。
- **本章索引**：outer-case, foam, freezer-liner, fresh-liner, mullion, freezer-door, fresh-door, door-gaskets, magnet-strips
- **名词首现**：insulation、conductor-of-heat、door-seal

### 6.3 第 03 章 `the-cold-loop`

- **summary**：Switched on, a small amount of refrigerant goes round a sealed loop: squeezed hot, cooled to a liquid in the side walls, dropped in pressure in a thin tube, and boiled behind the freezer. / 通电后，少量冷媒在密封的回路里一圈圈流动：被压缩变热，在侧壁里冷却成液体，经过细管降压，在冷冻室后面沸腾。
- **正文提纲**：① 和空调同一个循环（链接 `aircon/switch-on`，不重讲四步原理），冰箱的三处不同：活塞压缩机、侧壁冷凝管、毛细管。② 压缩：低压气体被活塞压到约 0.53 MPa，变热（F-5、F-9）。③ 冷凝：热经侧壁钢板传给厨房空气，冷媒约 40 °C 时凝结；最后一段绕箱口一圈，顺便防凝露。④ 节流：毛细管又细又长，压力沿管慢慢降到约 0.06 MPa——比大气压还低；它和回气管贴在一起交换热（F-15、F-16）。⑤ 蒸发：约 −25 °C 沸腾，从冷冻室后面的空气里吸热；55 g 冷媒约 2 分钟走一圈（SIM）。R600a 一句（F-3、F-4），详细放第 07 章。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章 | 同一份冷媒在密封回路里循环；颜色和疏密的读法（与空调相同，一句） |
| 2 | part compressor；camera bay；cutaway centre；labels compressor, compressor-piston, compressor-motor | 压缩：活塞来回，把约 0.06 MPa 的气体压到约 0.53 MPa，气体变热 |
| 3 | part side-condenser；camera back；labels side-condenser, frame-pipe | 冷凝：贴在侧壁里的管把热交给厨房，冷媒约 40 °C 凝结成液体 |
| 4 | part capillary-tube；camera back（近）；labels filter-drier, capillary-tube, suction-line | 节流：细长的毛细管让压力一路降下来，并和回气管交换热 |
| 5 | part evaporator；camera coldspot；labels evaporator, suction-line | 蒸发：约 −25 °C 沸腾、吸热；一圈约 2 分钟（模拟） |

- **细看**：`Below air pressure`（−25 °C 时 0.060 MPa，约大气压的六成；所以低压侧若有漏点会吸进空气和水汽，要靠干燥过滤器；F-5）；`Numbers at this simulated operating point`（§1.2 第 2、6、7 步）；`A piston, not a rotor`（往复式与空调转子式对照；变频一句并链 `aircon/efficiency-and-use`；老冰箱定速一开一停）；`Why the return pipe is not cold`（毛细管—回气管换热的好处：进蒸发器的液体更冷、回压缩机的气体不带液滴）。
- **本章索引**：compressor, compressor-piston, compressor-motor, discharge-line, side-condenser, frame-pipe, filter-drier, capillary-tube, evaporator, suction-line
- **名词首现**：refrigerant、compressor、condenser、evaporator、capillary-tube（vapour-compression-cycle 用空调主题的定义，本主题 glossary 另写一条并 `see` 空调）

### 6.4 第 04 章 `cold-air-inside`

- **summary**：There is only one cold coil, hidden behind the freezer. A fan blows its cold air round the freezer, and a damper lets some of it down into the fridge below. / 整台冰箱只有一个蒸发器，藏在冷冻室后面。风扇把冷空气吹遍冷冻室，一道风门放一部分下到冷藏室。
- **正文提纲**：① 风冷：风扇推动空气流过蒸发器（空气流动带走热；"对流"一词只在细看）。② 冷冻室：空气一直循环，保持约 −18 °C。③ 冷藏室：风门开时冷风经风道进入，读数到 4 °C 就关小（F-12）。④ 传感器与控制板：热敏电阻量温度，控制板据此调压缩机转速、开关风门。⑤ 门开关：开门灯亮。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | part evap-fan；labels evap-fan, evap-cover, evaporator | 风扇在冷冻室后板上方：把穿过蒸发器的冷空气吹出来 |
| 2 | layers 02 + 05；flow air-freezer；labels freezer-liner, evap-cover | 冷冻室里的空气不停地循环，保持约 −18 °C |
| 3 | pose damper-open；part damper；labels damper, air-duct, mullion | 风门打开：一部分冷风沿后壁风道下到冷藏室 |
| 4 | labels sensors, control-board, lamp | 传感器告诉控制板温度；控制板决定压缩机快慢、风门开关 |

- **细看**：`Cold air sinks`（冷空气比暖空气重，所以冷藏室出风口在上、回风在前；中学会学到"对流"；对比老式"直冷"冰箱：蒸发器板就在冷冻室里，靠空气自然流动，会结厚霜）；`What a thermistor does`；`The setting dial`（调高调低改的是控制板的目标温度，不是"冷气大小"）。
- **本章索引**：evap-fan, evap-cover, evaporator, air-duct, damper, mullion, sensors, control-board, lamp
- **名词首现**：damper、sensor、thermostat（老冰箱的机械温控器在细看里）

### 6.5 第 05 章 `frost-and-defrost`

- **summary**：Each time the door opens, warm, damp kitchen air gets in. Its water vapour freezes onto the coldest surface, the coil, so a frost-free fridge melts the frost away on a timer and drains the water out. / 每次开门，温暖潮湿的厨房空气就会进去。水汽在最冷的地方——蒸发器——结成霜，所以无霜冰箱定时把霜化掉，再把水排出去。
- **正文提纲**：① 新加坡空气很潮湿（F-19）；开门进去的空气带着水汽。② P5 课纲：水汽遇到低于 0 °C 的蒸发器变成霜（直接从气体变成冰，或先凝结成水再凝固——两种都会发生，写"变成冰"，不引入"凝华"为主线词；细看提一句）。③ 霜挡风又隔热，蒸发器效率下降。④ 化霜：压缩机停，加热器通电约 20 分钟，霜熔化成水；蒸发器上的传感器回暖就断电（F-18）。⑤ 水经接水槽、排水管流到压缩机上的蒸发盘，被热蒸发回厨房的空气里——又一次物态变化（链接 `water/the-water-cycle`）。"无霜"= 霜只结在看不见的蒸发器上并被自动化掉，不是不结霜。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | sim.set {setup: open}；flow air-door；camera inside；pose frost-thin | 开门：潮湿的厨房空气流进去 |
| 2 | pose frost-thick；camera coldspot；labels evaporator, frost | 水汽在约 −25 °C 的蒸发器上结成霜，越积越厚 |
| 3 | run false；化霜加热器发光（§9 E-FR2 或 sim 绑定）；pose frost-thin → 无霜；labels defrost-heater, sensors | 化霜：压缩机停，加热器把霜化成水，蒸发器回暖后自动断电 |
| 4 | flow meltwater；camera bay；labels drain-trough, drain-tube, drain-tray | 水流到压缩机上的蒸发盘，被热蒸发掉 |

- **细看**：`Frost is a poor conductor`（霜层越厚越"隔热"，还挡风）；`Old fridges and the ice block`（直冷冰箱要手动除霜；不要用尖物凿冰，会戳破管路——安全事实，来源 P16 用户手册类）；`Ice straight from vapour`（凝华一词：中学会学到）；`Defrost uses electricity too`（§1.2 第 5 步：约 39 kWh/年，SIM）。
- **本章索引**：evaporator, frost, defrost-heater, sensors, drain-trough, drain-tube, drain-tray, compressor
- **名词首现**：frost、defrost、frost-free

### 6.6 第 06 章 `heat-out-the-back`

- **summary**：All the heat taken out of the food, plus the electricity used, comes out into the kitchen through the side walls and the machine bay. That is why a fridge with its door open warms the kitchen. / 从食物里搬出的热，加上用掉的电，全部从侧壁和机械仓放进厨房。所以开着门的冰箱会让厨房更热。
- **正文提纲**：① 摸一摸：侧面温、背后底部热（F-17）；热经钢板传给厨房空气，暖空气上升（流 `air-kitchen`）。② 能量守恒：运转时放出 168 W = 吸走 108 W + 用电 60 W；平均每秒放出约 107 J（SIM，§1.2）；能量没有消失，只是从一处搬到另一处、电能最后也变成热（链接 `energy-conversion/never-used-up`、`electrical-energy-at-home`）。③ 开门想给厨房降温：门口的冷空气确实凉，但吸走的热又在同一个厨房里从侧壁放出来，再加上 60 W 的电——厨房净得热（F-24）。④ 空调为什么能降温：它的热放到**室外**（链接 `aircon/where-the-air-goes`）。⑤ 所以冰箱背后要留空，热才散得出去（只写"按说明书留距离"）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | labels side-condenser, frame-pipe；flow air-kitchen | 侧壁里的冷凝管把热放出来，冰箱两侧摸上去是温的（约 37 °C，模拟） |
| 2 | camera bay；labels compressor, drain-tray, bay-grille | 压缩机自己也发热，热从背后底部散出 |
| 3 | sim.set {setup: open}；pose doors-open；camera hero；flow air-door | 开着门：冷空气流出来，压缩机全速运转 |
| 4 | 同上；layers 04 + 05 | 从厨房吸走的热又回到厨房，还多了一份用掉的电：厨房反而更热 |

- **细看**：`Heat moved, not destroyed`（算式，SIM）；`Three ways to get rid of the heat`（侧壁热壁、背部线管、底部风冷，0.1-2）；`Fridge versus air conditioner`（同一个循环，差别只在热放在哪里）。
- **本章索引**：side-condenser, frame-pipe, compressor, drain-tray, bay-grille, side-panel-right, outer-case, fresh-door
- **名词首现**：energy-conservation（若 glossary 收）

### 6.7 第 07 章 `energy-and-history`

- **summary**：A fridge runs day and night, so its design matters: Singapore's label shows its yearly electricity use, and its refrigerant was chosen after a long story about the ozone layer. / 冰箱日夜不停地运转，设计好不好很要紧：新加坡的能效标签写着它一年用多少电；它用的冷媒，背后是一段关于臭氧层的长故事。
- **正文提纲**：① 标签：冰箱 1–4 tick，标签上有年耗电（每天 24 小时算）和年电费（每 kWh 27 分算）（F-25、F-27）；2025 年 4 月起新售冰箱至少 3 tick（F-26）。本模型若贴标签约 375 kWh/年（SIM，写明）。② 用得省：门少开、快关；门封要贴紧；背后留空；冷藏 4 °C、冷冻 −18 °C 就够（F-20）。③ 冰的历史：1854 年新加坡开始卖进口的美国天然冰，船运途中最多一半化掉（F-32）。④ CFC：为了找不毒、不燃的冷媒，1928 年前后合成 CFC，用了几十年（F-31）；1974 年科学家指出 CFC 会破坏臭氧层，1985 年南极臭氧洞被测到；1987 年《蒙特利尔议定书》开始逐步禁用；按现行政策，南极上空约 2066 年恢复（F-30）。⑤ 今天：新加坡 2022 年起家用冰箱冷媒 GWP 不超过 15，所以用 R600a；它可燃，但封在管里、只有约 55 g，维修交给受过训练的人（F-3、F-4、F-7）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | camera hero；labels freezer-door, fresh-door | 能效标签：冰箱 1–4 个 tick，还写着一年用多少电 |
| 2 | labels door-gaskets, bay-grille | 省电在于用法：门少开、门封贴紧、背后留空 |
| 3 | camera hero（no labels） | 冰箱出现以前：1854 年新加坡开始卖从美国运来的冰 |
| 4 | view xray；run true；layers 04；labels compressor, capillary-tube, evaporator | 1928 年前后出现的 CFC 冷媒不毒不燃，却会破坏高空的臭氧层 |
| 5 | 同上 | 1987 年各国约定逐步停用；今天新加坡的冰箱用 R600a，GWP 不超过 15 |

- **细看**：`What the label numbers mean`（24 h、27 分；为什么冰箱是 1–4 而空调是 1–5；MEPS 历程 F-26）；`About one sixth of a home's electricity`（两条 NEA 来源并列，F-28）；`From ice house to refrigerator`（P20、P21；全球视角：天然冰贸易从美国运到加勒比、印度、东南亚）；`The ozone story`（1974、1985、1987、1989、2009、2016 基加利修正案把 HFC 也纳入；1995 年诺贝尔化学奖授予克鲁岑、莫利纳、罗兰；发达国家与发展中国家停产时间不同；恢复年份三个数并列）；`Is R600a safe`（A3、≤ 150 g、封闭回路；不要在冰箱附近用明火检修；回收与报废由持证人员）。
- **本章索引**：freezer-door, fresh-door, door-gaskets, bay-grille, compressor, capillary-tube, evaporator, side-condenser
- **名词首现**：tick-rating、cfc、ozone-layer、montreal-protocol、gwp

### 6.8 名词表 `glossary.json`（候选 18 个，保留 14–16 个；正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| refrigerant | Refrigerant / 冷媒（制冷剂） | 在回路里循环、反复沸腾和凝结来搬运热的物质 | gwp |
| compressor | Compressor / 压缩机 | 把冷媒气体压到高压、推动回路的泵 | — |
| condenser | Condenser / 冷凝器 | 冷媒在里面放热、凝结成液体的管 | — |
| evaporator | Evaporator / 蒸发器 | 冷媒在里面吸热、沸腾成气体的管 | frost |
| capillary-tube | Capillary tube / 毛细管 | 又细又长、让冷媒压力降低的铜管，替代膨胀阀 | — |
| vapour-compression-cycle | Vapour-compression cycle / 蒸气压缩循环 | 压缩—冷凝—节流—蒸发，空调和冰箱共用 | （空调主题同名条目） |
| insulation | Insulation / 隔热层 | 让热流得很慢的材料，如发泡 | conductor-of-heat |
| conductor-of-heat | Good and poor conductors of heat / 热的良导体与不良导体 | 课纲词：让热容易 / 不容易通过的材料 | insulation |
| door-seal | Door seal / 门封 | 门边带磁条的软胶条 | — |
| frost | Frost / 霜 | 水汽在 0 °C 以下的表面上变成的冰 | defrost |
| defrost | Defrost / 化霜 | 加热融掉蒸发器上的霜 | frost-free |
| frost-free | Frost-free / 无霜 | 霜只结在隐藏的蒸发器上并被自动化掉的设计 | defrost |
| damper | Damper / 风门 | 开大关小、控制冷风去冷藏室的门片 | — |
| sensor | Temperature sensor / 温度传感器 | 把温度变成电信号告诉控制板 | — |
| tick-rating | Energy label (ticks) / 能效标签 | NEA 强制标签，冰箱 1–4 tick | — |
| gwp | Global warming potential / 全球变暖潜能值 | 同质量气体 100 年增温效果与 CO₂ 之比 | refrigerant |
| cfc | CFC / 含氯氟烃 | 旧冷媒，会破坏臭氧层 | ozone-layer |
| ozone-layer | Ozone layer / 臭氧层 | 高空吸收大部分紫外线的一层臭氧 | montreal-protocol |
| montreal-protocol | Montreal Protocol / 蒙特利尔议定书 | 1987 年签署、逐步淘汰破坏臭氧层物质的国际条约 | cfc |

---

## 7. HUD

### 7.1 标题块与规格行

- DOC-ID 自动：`ATL-REFRIG-01…07`。标题 EN "How a Refrigerator Keeps Food Cold" / ZH "冰箱是怎样让食物保持冰冷的"；副标题 "A two-door frost-free fridge, generic design study" / "双门无霜冰箱 · 通用设计研究"。`shortTitle`：Refrigerator / 冰箱。`illustration: refrigerator`。
- `note`：见 D-6。
- 规格行（≤ 4，tag）：

| key EN / ZH | value | tag |
|---|---|---|
| Type / 类型 | TOP-FREEZER · FROST-FREE | design |
| Volume / 容积 | 350 L · 95 + 255 | design |
| Refrigerant / 冷媒 | R600a · 55 g | design |
| Energy / 年耗电 | 375 kWh/yr | sim |

### 7.2 右上卡（零件链路）

列 = 01 CABINET · 02 COLD SIDE · 03 MACHINE；04、05 无零件不出列。零件 EN 名 ≤ 14 字符：Outer case、Right panel、Foam、Freezer liner、Fridge liner、Mullion、Freezer door、Fridge door、Door seals、Magnet strips、Shelves、Crisper、Door bins、Lamp；Evaporator、Frost、Duct cover、Fan、Air duct、Damper、Defrost heater、Drain trough、Drain tube、Sensors；Compressor、Piston、Motor、Discharge pipe、Side condenser、Frame pipe、Filter drier、Capillary tube、Suction pipe、Drain tray、Control board、Bay cover。

`connects` 链见 §3.2；运转时沿冷媒 `parts` 着色步进。03 列 12 行，用紧凑行高（空调已有）。

### 7.3 PLATE 块

- 立面：`views.section.plane = "zy"`（侧剖立面：冷冻室、中梁、冷藏室、后壁风道、底部机械仓一目了然）；REFERENCE 用同一立面。
- 模拟读数 `telemetry`（≤ 6，SIM）：

| key EN / ZH | unit | idle（压缩机歇着） | run | lag（s） | decimals |
|---|---|---|---|---|---|
| Compressor / 压缩机 | rpm | 0 | 3,100 | 6 | 0 |
| High side / 高压侧 | MPa abs | 0.08 | 0.53 | 12 | 2 |
| Low side / 低压侧 | MPa abs | 0.08 | 0.06 | 12 | 2 |
| Evaporator / 蒸发器 | °C | −18 | −25 | 30 | 0 |
| Side wall / 侧壁 | °C | 30 | 37 | 60 | 0 |
| Power / 功率 | W | 0 | 60 | 4 | 0 |

idle 指"开机周期之间压缩机歇着"，平衡压力约等于 −18 °C 的饱和压力（F-5）；断电放到室温才是 0.41 MPa，细看说明。第 02 章（试一试）`telemetry` 跟随 sim 输出（`follow`、`lag: 0`）显示冷藏室温度与经过时间，见 §8。

### 7.4 镜头预设（≤ 6；起点值，镜头轮调）

| # | id | label | position | target | fov | 用途 |
|---|---|---|---|---|---|---|
| 1 | `hero` | HERO | [1.9, 1.55, 3.1] | [0, 0.85, 0] | 30 | 3/4 前右上，封面构图 |
| 2 | `inside` | INSIDE | [0.45, 1.1, 2.3] | [0, 0.85, 0] | 32 | 开门看内部 |
| 3 | `section` | SECTION | [2.6, 0.95, 0.15] | [0, 0.85, −0.03] | 28 | 正侧面，配 `cuts.centre` |
| 4 | `back` | BACK | [−1.6, 1.3, −2.6] | [0, 0.75, −0.2] | 30 | 3/4 后左上：冷凝管、毛细管、回气管 |
| 5 | `bay` | BAY | [−0.9, 0.5, −1.4] | [0.05, 0.15, −0.25] | 30 | 机械仓近景 |
| 6 | `coldspot` | COLD SPOT | [0.9, 1.75, −1.2] | [0, 1.40, −0.25] | 30 | 蒸发器与风扇近景（X-RAY） |

`views.cuts`：`centre` = normal [−1, 0, 0]、offset 0（沿中线竖切，看发泡层、内胆、风道、中梁、机械仓），label "Centre section / 中线剖面"。`views.cutaway`（C 键默认）= 同上。`views.cover`：hero 稍拉远、冷冻门开 30°（pose 可选）。

### 7.5 模式组合

| 组合 | 行为 |
|---|---|
| X-RAY + FLOW | 主要读法：外壳、内胆、发泡、管路透明，冷媒和空气粒子可见 |
| CUTAWAY（centre）+ FLOW | 冷媒流被裁到一半（只剩剖面一侧的管）；`air-kitchen`、`air-door` `clip: false` |
| EXPLODED + FLOW | 引擎禁用 |
| hide + EXPLODED | 隐藏件拆开时仍隐藏 |
| pose doors-open + EXPLODED | 门按姿态位置再沿 +Z 拆开（检查不穿模） |

---

## 8. 试一试（第 02 章，复用 `sim.kind: "heat"`）

**问题**：压缩机不工作时（停电、或开机周期之间），门开着和关着、冰箱满和空、隔热层厚和薄，10 分钟里冷藏室的温度怎样变？

**模型**（全部是 docs/55 E-H1 的现有契约，不新增 kind）：

```jsonc
"sim": {
  "kind": "heat",
  "controls": [
    { "id": "elapsed-s", "kind": "step", "values": [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600], "default": 0, "unit": "s" },
    { "id": "setup", "kind": "choice", "default": "closed",
      "options": [ { "id": "closed" }, { "id": "open" }, { "id": "thin" } ] },   // 门关 / 门开 / 门关但发泡只有 15 mm
    { "id": "contents", "kind": "choice", "default": "full",
      "options": [ { "id": "full" }, { "id": "empty" } ] }
  ],
  "heat": {
    "time": "elapsed-s",
    "lumps": {
      "fridge": {
        "initial": 4,
        "capacity": { "mass": { "control": "contents", "values": { "full": 12000, "empty": 2000 } }, "specific": 4.2 },
        "reservoir": { "temperature": 30,
          "conductance": { "control": "setup", "values": { "closed": 1.6, "open": 20, "thin": 4.8 } } }
      },
      "baseline": { "initial": 4, "capacity": 50400, "reservoir": { "temperature": 30, "conductance": 1.6 } }
    },
    "compare": { "vs-baseline": { "first": "fridge", "second": "baseline", "epsilon": 0.05 } }
  }
}
```

- 参数含义（写进 detail 与细看，DESIGN，**不冒充实测**）：`capacity` 是"箱内食物、搁架、内胆和空气看成一个均匀温度的整体"，满 ≈ 12 kg 水的热容、空 ≈ 2 kg 水；`conductance` 关门 1.6 W/K（冷藏室墙 1.36 + 门封分摊 0.25，§1.2）、薄发泡 4.8 W/K（15 mm）、开门 20 W/K（**教学参数**：开门时空气交换的等效值，量级待核，细看写明"真实开门的效果取决于开多久、开多大、风扇是否停"）。功率 0 = 压缩机不工作。
- 解析结果（600 s，°C）：满 + 关 4.5；满 + 薄 5.4；满 + 开 9.5；空 + 关 6.8；空 + 薄 11.5；空 + 开 23.8。300 s：满 + 开 6.9、空 + 开 17.3。全部在 heat 域 0–95 °C、0–600 s 内，单调，不跨相变。
- 卡片：`try.vary: [setup, contents]`；`keep: [elapsed-s]`；`observe: temperature:fridge`；先猜后看（不评分）；`curve: { x: elapsed-s, y: [temperature:fridge, temperature:baseline] }`（E-H2 自动适配纵轴）。
- 输出（≤ 8）：`temperature:fridge`、`change:fridge`、`rate:fridge`（W，正 = 热流进来）、`energy:fridge`、`temperature:baseline`、`compare:vs-baseline`、`direction:fridge`。
- 绑定：`setup = open` → `pose: doors-open`（fresh-door）、`visible`：`air-door` 流、`lamp` 的发光片；`contents = full` → `food-items` 可见（**待核**：bind 能否作用于 context 零件；不能则把食物改为普通零件、不进链路卡的退路是去掉 context 标记并放进 `cabinet` 组末尾）。
- 拍里写清楚：这是理想模型；真实冰箱的食物比空气升温慢得多，"满的冰箱开门后回温更慢"是方向正确的结论，不是精确数字；停电 4 小时只引 USDA（F-22）。

---

## 9. 引擎缺口（已查代码：`schema.ts`、`sim-schema.ts`、`heat-schema.ts`、`lib/sim/curve.ts`）

**必需：无**。本主题所需的 primitive（`coilBank`、`lathe`、`extrude`、`tube`、`grille`、`blades`）、`bilateral`、`poses`（铰链 pivot）、`sequence`（活塞 offset）、命名剖切 `views.cuts`、flow `stops / ends / paths / clip`、sim `heat` + `curve`（纵轴自适应）、bind `pose / visible / glow` 都已存在。

| 编号 | 优先级 | 现状 | 最小方案 | 退路 |
|---|---|---|---|---|
| E-FR1 | 可选 | `heatIssues` 把时间限在 0–600 s（`heat-schema.ts` 第 37 行），不能模拟数小时停电 | 允许 `unit: "min"` 的时间控件，上限 600 min；求解仍按秒；域校验同步；docs/06 加一句 | 默认不做：停电只在细看引 USDA |
| E-FR2 | 应该 | bind `glow` 需要数值输出或 step 控件；章 / 拍没有静态的"让某零件发光"字段 | 先试数据退路：sim 加一个 step 控件 `heater-w`（0 / 160 W，不进 `try.vary`），bind glow 到 `defrost-heater`、visible 到 `meltwater`；**若** 不在 vary 里的控件仍会出现在试一试卡上，则加章 / 拍 `glow: { <part>: 0..1 }`（复用 bind glow 的渲染，零额外绘制）+ 单测 + docs/06 | 化霜拍不发光，只靠标注和字幕 |
| E-FR3 | 可选 | `paths` 多路径流共用一组 `stops` | 不改引擎：`air-door` 拆成两条流 | — |

施工前先用 `sample-heat` 夹具验证：① 非 vary 控件的显示行为；② bind 作用于 context 零件；③ `pose` 与 sim bind 的 pose 同时写同一零件时的优先级（章节 pose vs bind pose）。三条结论写进 §15 施工记录。

---

## 10. 性能预算（对照 `modelling-runbook.md` §7 与 docs/08 §4）

| 项 | 目标 | 本主题估计 | 说明 |
|---|---|---|---|
| 绘制调用（静止） | < 50 | 约 46 | 36 零件中约 9 个双材质槽（门 ×2、风扇、压缩机、电机、蒸发器 coilBank、中梁、灯、冷凝管镜像 +1）≈ 46；投影件 6 次另计 → 静止约 52，**压线**；先合并同材质 extra |
| 绘制调用（运转） | < 60（上限 100） | 约 58–61 | + 冷媒 4 + 空气 2–4 + 化霜水 0–1 |
| 三角形 | < 0.3 M（上限 1.5 M） | 约 0.12–0.18 M | 鳍片 2 × 60 片、蛇形管 2 × ~40 点 × 16 径向、毛细管螺旋 48 点、压缩机 lathe 40 段；食物 ≤ 12 件低段数 |
| GLB | 0 | 0 | 全程序化，不用 glb |
| parts.json | ≤ 120 KB | 约 70–90 KB | 空调约同量级 |
| 首屏 | 不新增依赖 | 0 | sim `heat` 与 `curve` 已在 space-scene chunk 里（按需加载照现状） |

降开销顺序（runbook §7）：合并 extra → 关小件和长管投影 → lathe 40 → 32 → 减流的 count。**不**先删蒸发器、冷凝管、毛细管这些 Tier-1 件。验证：`pnpm shoot refrigerator --perf --gpu` 记静止 / FLOW / X-RAY + FLOW 三组。

**Tier-1（一眼能认，R2 必须对）**：① 外包络比例（高 ≈ 2.8 × 宽）与上小下大的两扇门；② 门内侧一圈门封 + 门架；③ 冷冻室后板 + 后面的鳍片蒸发器与上方风扇；④ 底部后方的黑色压缩机罐 + 顶上的蒸发盘；⑤ 侧壁里的蛇形冷凝管（X-RAY）；⑥ 中线剖面上三层墙（钢 / 发泡 / 内胆）的厚度。

---

## 11. 参考图需求（`scripts/geo/refrigerator/refs/`，gitignore，不发布、不当贴图）

本轮**不下载**。施工时按下表找，逐张在 §15 记文件名、来源页、许可、看什么。只用公有领域或 CC（Commons 页抄许可原文）；**美国专利附图是公有领域**，内部结构首选。专利号施工时检索后再填，**不凭记忆预填**。文件名 `NN-<看什么>-<来源>.<ext>`。

| # | 要找什么 | 去哪里找（检索词） | 许可要求 | 看什么 |
|---|---|---|---|---|
| R1 | 双门上冷冻冰箱整机 3/4 实拍，前、侧、背各一 | Commons "top-freezer refrigerator"、"refrigerator rear" | CC / PD；**去掉或不看品牌标识**，只取比例 | 高宽比、门缝位置、底部机械仓开口 |
| R2 | 侧壁 / 外板内藏冷凝管的结构图 | Google Patents："refrigerator side wall condenser pipe outer case"、"hot wall condenser refrigerator" | 美国专利图 PD | 蛇形走向、贴在外板内面的方式、两侧怎样连通 |
| R3 | 箱体发泡剖面 | 专利："refrigerator cabinet foam insulation cross section liner" | PD | 壁厚比例、内胆与外壳的边缘结构 |
| R4 | 内胆、搁架、果蔬盒、中梁、灯的位置 | 专利 "top mount refrigerator mullion air return"；Commons 开门照 | PD / CC | 中梁回风口、灯位、搁架层数 |
| R5 | 门内侧门架、铰链 | Commons 开门照；专利 "refrigerator door bin hinge" | CC / PD | 门架排列、铰链位置 |
| R6 | 门封剖面（气囊 + 磁条） | 专利 "refrigerator door gasket magnetic strip cross section"（magnets 主题 R8 若已下载可共用，复制不移动） | PD | 剖面形状、磁条位置 |
| R7 | 冷冻室后板、风扇、风道、风门的系统图 | 专利 "refrigerator evaporator fan duct damper freezer compartment fresh food" | PD | 送风回风路径、风门位置 |
| R8 | 无霜冰箱蒸发器 + 化霜加热器 + 接水槽 | 专利 "no-frost evaporator defrost heater drain"；Commons "refrigerator evaporator" | PD / CC | 管排数、片距、加热器形状与位置 |
| R9 | 蒸发器 / 冷冻室结霜实拍 | Commons "frost freezer"、"frost evaporator coil" | CC / PD | 霜的形态（R3 材质轮参考） |
| R10 | 机械仓：压缩机、蒸发盘、干燥过滤器、排水管出口 | Commons "refrigerator compressor"、"back of refrigerator" | CC / PD | 相对位置、蒸发盘在压缩机顶 |
| R11 | 温度传感器与控制板位置 | 服务手册类示意（只看拓扑，不复制）；专利 "refrigerator thermistor control" | PD | 传感器在哪面墙、几个 |
| R12 | 冰箱用全封闭压缩机外观 | Commons "hermetic compressor refrigerator" | CC / PD | 壳体比例、接管位置、底脚 |
| R13 | 往复式全封闭压缩机剖视 | Commons "reciprocating hermetic compressor cutaway"；专利 "hermetic reciprocating compressor crankshaft piston" | CC / PD | 电机在下、活塞在上、缸体朝向 |
| R14 | 门框防凝管（箱口加热管） | 专利 "refrigerator anti-condensation pipe front flange" | PD | 环绕箱口的走向 |
| R15 | 毛细管与回气管的换热段 | Commons "capillary tube refrigerator"；专利 "capillary tube suction line heat exchanger" | CC / PD | 并行焊接 / 缠绕的形式、长度 |
| R16 | 老式冰盒（icebox）与天然冰贸易 | Smithsonian Open Access（CC0）、Library of Congress（PD）"icebox"、"ice harvesting" | CC0 / PD | 插图 F-ICEBOX 的事实约束（冰仓在上、排水） |

覆盖要求：整体 3/4、正 / 侧轮廓、内部（拆壳 / 剖面）、每个 Tier-1 件的近景。看不到的内部结构（风门内部、控制板走线）写明用什么推断。

---

## 12. 插图需求（外包给 Codex；Claude 逐张验收）

**通用规则**（BRIEF2 与 docs/69 §4.2，全部适用）：fine graphite pencil 19th-century scientific / engineering plate；细交叉排线与点画；**严格中性灰**（R = G = B，无棕褐色偏）；**透明 PNG**；主体居中约占画面 85 %，四周留白，不触边；**NO text, letters, numerals, labels, logos, brand marks, displays with digits, arrows, flags, paper texture, background, frame, ground shadow**；不画任何真实品牌的外形特征（徽标位、特征把手、特征面板分割）。交付：`art/planned/refrigerator/` 下原图 + `manifest.jsonl`（`{slug, kind, file, chapterIdea, subject, checks, tries}`）+ 420 px 宽预览 + cinema 反相模拟图；验收不合格最多重画 4 次。章图显示约 420 px 宽：主体 ≥ 画框 60 %，关键部件 ≥ 40 px。

| # | 文件 | 类型 / 尺寸 | 用在 | 画什么 | 事实约束（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `refrigerator.png` | 封面 1024 × 1024 | 主题卡、第 01 章 | 一台通用双门上冷冻冰箱，3/4 前右视角，冷冻门（上、小）微开约 30°，露出门内侧门封和一只门架；冷藏门（下、大）关着 | ① 恰好两扇门，上门高约为下门的 0.45（±0.1）；② 铰链在右、门向右开；③ 整机高约为宽的 2.8 倍（±0.3）；④ 门内侧可见一圈连续门封；⑤ 底部有调平脚、背后底部不可见也不画散热格栅在正面；⑥ 开着的门内侧是平的内衬，无文字 | 品牌字样、徽标凹位、显示屏、饮水口、冰箱贴、便条、食物、手、人、地面阴影、背景墙 | AI |
| I-2 | `refrigerator-gasket-section.png` | 章图 1536 × 1152 | 第 02 章 | 门边与箱口的**横剖面**：左为门（外板 + 发泡 + 内衬），右为箱体前沿（外板 + 发泡 + 内胆）；中间门封的气囊截面，气囊里一条扁平磁条贴近箱口钢板；箱体前沿钢板后面一根小圆管（门框防凝管）截面 | ① 磁条在门封里、靠近钢板一侧，二者之间只隔一层薄胶；② 发泡区域用点画、钢板用实线、塑料用细线区分；③ 门封有 2–3 个气腔（照 R6 选定的一张专利图定数，写进 checks）；④ 防凝管截面在钢板内侧；⑤ 剖面线 45°，与 docs/08 剖切语法一致 | 文字、数字、箭头、磁力线、N/S 字母、人手 | **代码画**（`scripts/figures/refrigerator-gasket-section.ts`，SVG 几何 + 铅笔质感，按 docs/69 §4.2-1 写几何断言：磁条在气囊内、气囊贴合钢板、各层厚度比例 = 本 spec F-13 / §3.2） |
| I-3 | `refrigerator-icebox.png` | 章图 1536 × 1152 | 第 07 章 | 约 1900 年前后的木制冰盒（icebox）通用样式，正面 3/4，上格门微开露出一块方冰，下格门关着 | ① 冰格在上（冷空气下沉）；② 两扇或三扇带金属铰链的木门，门边可见厚门框（隔热）；③ 冰块下有接水托盘或排水口；④ 木纹用排线表现，不写品牌铭牌 | 文字、铭牌、商标、人物、食物堆、背景、地板阴影 | AI，以 R16 的公有领域馆藏照片为构图依据（只看样式，不描摹单件藏品） |
| I-4 | `refrigerator-frost.png`（★ 0.1-13 可删） | 章图 1536 × 1152 | 第 05 章 | 无霜冰箱蒸发器的近景：两排铝管穿过平行鳍片，前半段鳍片上覆着一层霜，后半段干净；下方一根 U 形加热管 | ① 鳍片平行、等距、垂直于管；② 霜只在鳍片和管表面，不悬空；③ 加热管在蒸发器下沿，两端向上；④ 管排数 = 2、可见管数 6–8（写进 checks） | 文字、箭头、水滴特效、冰柱、背景 | AI；**明暗有物理含义**（霜 = 白），交付清单标 `invert: false`，由 Claude 在组件里加 cinema 例外（docs/69 §4.2-4） |

验收标准（每张）：manifest 的 checks 3–6 条逐条放大核对；R=G=B 逐像素检查；透明边缘干净；420 px 预览可读；cinema 反相模拟下意思不颠倒（I-4 除外，用例外处理）；alt / caption 与图一致（caption 不替图辩解）。图注草稿：

| 文件 | 图注 EN / ZH |
|---|---|
| I-2 | Section through the door edge: the magnet strip in the soft seal holds the door to the steel frame. / 门边剖面：软门封里的磁条把门吸在钢制箱口上。 |
| I-3 | An icebox kept food cool with a block of ice in the top compartment. / 冰盒在上层放一块冰来给食物降温。 |
| I-4 | Frost on the fins of a fridge's evaporator, with the defrost heater below. / 冰箱蒸发器鳍片上的霜，下方是化霜加热管。 |

---

## 13. 写法与用词表

按 `writing-rules.md` 与空调主题；本主题的约定：

| 用 | 不用 | 理由 |
|---|---|---|
| 把热搬出来 / moves heat out | 制造冷、把冷送进去、冷气 | 冷不是一种能流动的东西（课纲：热的传递） |
| 冷空气流出来 / cold air spills out | 冷气跑掉 | 空气确实在流动，说空气，不说"冷气" |
| 冷媒（制冷剂）/ refrigerant | 雪种（粤语俗称）、氟（俗称） | 与空调主题一致；"雪种"可在细看提一句本地俗称（**待 Gavin 定**） |
| 含氯氟烃（CFC，常被叫作氟利昂）| 直接写"氟利昂"当通用名 | 0.1-7 |
| 发泡层 / 隔热层 / insulation | 保温层（冰箱语境） | heat 主题用"隔热" |
| 不良导热体 / poor conductor of heat | 绝热体 | 课纲词；没有完全不导热的材料 |
| 冷冻室 / freezer；冷藏室 / fresh-food compartment（EN 正文可写 fridge compartment） | 冰格、保鲜室 | 统一 |
| 无霜 / frost-free | "不会结霜" | 霜仍会结，只是结在隐藏的蒸发器上并被自动化掉 |
| 结成霜 / turns to frost | 凝华（主线） | 凝华超纲，只在细看 |
| 绝对压力 / absolute pressure（MPa abs） | 表压、公斤 | 与空调一致 |
| 能效标签、tick | 星级、节能等级 | NEA 用词 |
| 模拟运行点 / simulated operating point | "实测" | 事实纪律 |
| 毛细管 / capillary tube | 节流阀、膨胀阀（指本机） | 本机没有阀 |
| 压缩机歇着 / the compressor rests | 冰箱"休息"、"累了" | 不拟人；"歇着"只在 PLATE 说明里用，正文写"停下" |

- 不拟人、不喊"小朋友"、不用感叹号和问句标题；不推荐品牌、不比较产品；能效只讲原理与官方建议。
- 历史：客观、全球视角；CFC 的发明当时是为了安全，后来发现了臭氧问题——两面都写；不写成某国或某人的功过叙事；议定书的成功写事实与评估报告的原话（"约 99 %"），不写口号。
- 安全：R600a 可燃、维修交给受过训练的人；冰箱安全法只写法律与目的，不描写事故。

---

## 14. 来源计划（P# → 施工时 S#；≥ 25 条，逐条读原文）

| P# | 内容 | 候选来源 | 用于 |
|---|---|---|---|
| P1 | 本设计研究（设计值与模拟运行点） | 本 spec §1.2、§8 | 规格行、PLATE、细看、试一试 |
| P2 | R600a 饱和性质 | NIST Chemistry WebBook，Isobutane（C75285）饱和表 | F-5、F-6 |
| P3 | 冷媒安全分类 | ASHRAE Standard 34 / 其公开的冷媒命名与分类表 | F-4 |
| P4 | GWP | IPCC AR4 WG1 Table 2.14（R134a 1,430）；异丁烷 GWP 的出处（EU F-gas 条例附件或 UNEP TEAP/RTOC 报告），版本并列 | F-3、F-4 |
| P5 | 新加坡家用冰箱 GWP ≤ 15 | NEA "Reducing GHG emissions from the use of refrigerants in RAC sector" 页及其附件 | F-3 |
| P6 | MELS / MEPS 历程 | NEA "About Mandatory Energy Labelling and Minimum Energy Performance Standards"；NEA 注册产品库（统计范围） | F-23、F-25、F-26 |
| P7 | 标签内容 | NEA "The Energy Label" 页 | F-27 |
| P8 | 2014 评级修订 | NCCS 新闻稿 "Revised Energy Labels and Rating System…" | F-25 |
| P9 | 冰箱占家庭用电 | NEA 新闻稿（2017 年 550 户计量；"五分之四家庭…"）与 2017 年冰箱 MEPS 新闻稿附件 | F-28 |
| P10 | 安全温度 | SFA "Safe food practices" / "Good food safety practices" | F-20 |
| P11 | 停电保冷 | USDA FSIS "Keep Your Food Safe During Emergencies" | F-22 |
| P12 | 新加坡气候 | Meteorological Service Singapore "Climate of Singapore" | F-19、F-21 |
| P13 | 课纲 | MOE 2023 Primary Science Syllabus（P4 Heat pp. 76–77；P5 Water pp. 49–50） | §1.3 |
| P14 | 冰箱安全法 | 15 U.S.C. §1211–1214；16 CFR Part 1750；CPSC 说明页；ULSE 文章 | F-29 |
| P15 | 碳氢充注上限 | US EPA 2018 SNAP 规则（Federal Register）；IEC 60335-2-24 条款；CEN/TR 14739 | F-7 |
| P16 | 化霜系统 | 厂商服务手册（manualslib 上的通用说明页，不点名品牌）；GE Appliances 支持页"Types of defrost systems"（**是否算点名**：只引用原理，不出现品牌名于正文） | F-18、第 05 章 |
| P17 | 家用冰箱结构综述 | ASHRAE Handbook—Refrigeration，"Household Refrigerators and Freezers"一章 | F-1、F-7–F-18 |
| P18 | 聚氨酯发泡导热系数 | ASHRAE Handbook—Fundamentals 材料表，或同行评审综述 | F-13 |
| P19 | 冰箱压缩机 | 压缩机厂商公开目录的典型范围（不点名）；或 ASHRAE Handbook | F-9–F-11 |
| P20 | 新加坡制冰史 | NLB BiblioAsia Vol. 20 Issue 2（2024 Jul–Sep）"A Cool Business: The History of Ice-Making in Singapore" | F-32 |
| P21 | 天然冰贸易 | National Geographic "Frederic Tudor, the Ice King"；Smithsonian 相关文章 | F-32 |
| P22 | CFC 的来历 | Science History Institute（Thomas Midgley Jr.）；ACS 历史资料 | F-31 |
| P23 | 1974 论文 | Molina & Rowland, *Nature* 249, 810–812 (1974) | F-30 |
| P24 | 1985 论文 | Farman, Gardiner & Shanklin, *Nature* 315, 207–210 (1985) | F-30 |
| P25 | 蒙特利尔议定书 | UNEP Ozone Secretariat（条约文本、批准情况、基加利修正案、各国加入日期含新加坡） | F-30 |
| P26 | 臭氧恢复 | WMO/UNEP Scientific Assessment of Ozone Depletion: 2022, Executive Summary（NOAA CSL 页） | F-30 |
| P27 | 1995 诺贝尔化学奖 | nobelprize.org | F-30 |
| P28 | 能耗测试标准 | IEC 62552-3:2015 与 NEA 引用的测试方法 | F-21 |
| P29 | 空调主题的已核来源 | `aircon/data/sources.json`（能量平衡、压力—沸点） | F-24、第 03 章链接 |
| P30 | 能量守恒（小学层面） | `energy-conversion/data/sources.json` 中对应条目 | F-24 |
| P31 | 早期冷媒有毒 | ASHRAE Journal 历史文章或 Science History Institute | F-31 |
| P32 | 碳氢冰箱的推广 | UNEP OzonAction 关于碳氢冷媒家用冰箱的资料（1990 年代德国最早量产，**待核**） | 第 07 章细看 |
| P33 | 本地市场布局统计 | 2–3 家本地大卖场冰箱分类页（只取"双门上 / 下冷冻"计数，不点名、不引用具体产品） | 0.1-1、F-1 |

---

## 15. 施工顺序与验收清单

按 skill `atlas-space-topic` 的 `build-order.md`（E → D → T → B → P）：

1. **Gavin 定稿 §0.1**。
2. **E**：§9 的三条夹具验证；E-FR2 视结论做或不做；E-FR1 默认不做。
3. **参考图**：§11，至少 R1、R2、R7、R8、R10、R13、R15 到位再建模。
4. **脚手架**：`pnpm tsx scripts/new-topic.ts refrigerator --engine space-scene --subject science --title-en "How a Refrigerator Keeps Food Cold" --title-zh "冰箱是怎样让食物保持冰冷的"`。
5. **D**：R2 几何两轮并排（Tier-1 §10）+ 干涉检查（含 pose doors-open 下门架与搁架、拆开状态）→ R3 材质（hero-clean 当封面）→ R4 流与动画（粒子不穿实体：风道、管内）。
6. **T**：sources（逐条读原文）→ glossary → summary / detail → 第 03 章样章先给 Gavin → 其余章。
7. **B**：31 拍；`pnpm shoot refrigerator --beats` 0 失败、无漏标。
8. **插图**：Codex 按 §12 交付，Claude 验收入库。
9. **P**：HUD、镜头、模式组合、事实审计、代码审计。

**验收清单**（`acceptance.md` 全部 + 本主题另加）：

- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`（先 build）；`pnpm shoot refrigerator --layout --keys --beats` 截图逐张看过（paper + cinema、1920 × 1080、1440、390 宽）。
- [ ] 7 章 31 拍；每拍字幕说"模型上显示什么"；EN 字幕 ≤ 45 词；labels ≤ 6 且可见；每章 `index` 覆盖正文和拍里提到的全部零件。
- [ ] 必须讲对的四处（D-3）在正文、字幕、零件 detail 三处一致：不"制造冷"；单蒸发器 + 风门；毛细管 + 回气换热；低压侧低于大气压（0.060 MPa abs）。
- [ ] §1.2 模拟运行点所有数字在 PLATE、细看、规格行之间一致；能量守恒三处相等（168 = 108 + 60；107 = 69 + 38；年耗电 375）；施工若调参，全部同步。
- [ ] 试一试：六种组合在 600 s 的读数与 §8 表一致（±0.1 °C）；曲线与 PLATE、读数卡同一时刻相等；门开时开门姿态、`air-door` 流、灯同步；不越出 heat 域；理想模型说明可见。
- [ ] 所有 DESIGN 值落在有来源的 TYPICAL 内；"待核"项全部核过或删除；GWP 与用电占比的多来源并列不偷选。
- [ ] 互链 10 处都指向已存在的章（§1.3），EN、ZH 各一次；不重复空调已讲透的段落。
- [ ] 课纲：`moe` 页码核过；对流、辐射、潜热、凝华只在细看并标"中学会学到"。
- [ ] 无品牌、型号、文字贴花；食物无标签；门内侧无文字。
- [ ] Tier-1 六项在 R2 并排图里逐项对上；干涉检查结果记入施工记录（开门姿态下门架不穿搁架）。
- [ ] 性能：静止 < 50（压线时按 §10 降），运转 < 60，三角形 < 0.3 M；记录 FLOW 前后增幅 < 10。
- [ ] 插图 4 张（或 3 张）按 §12 验收；I-2 有几何断言脚本；I-4 cinema 例外已加。
- [ ] 触控 ≥ 44 px；快捷键与按钮共用 store；无 console 噪音、无 TODO。

---

## 16. 已知风险（引擎对本主题的限制）

| 风险 | 影响 | 处理 |
|---|---|---|
| 单一剖切面 | 中线剖面切不到侧壁冷凝管（它在 x = ±0.288） | 冷凝管靠 X-RAY 看；剖面专门讲墙的三层 |
| 发泡层用 bevelBox 拼 | 剖面填充是统一的赭色 + 剖面线，看不出"泡沫" | 材质淡黄 + detail 说明；插图 I-2 用点画补 |
| 毛细管画粗 | 真实约 2 mm 外径在 1.7 m 的模型里看不见 | D-6 写明；detail 写真实值 |
| 冷凝管、毛细管只画 2–3 程 | 真实回数更多 | 流的说明与 detail 写真实值 |
| 鳍片片距 | 无霜蒸发器片距本来就宽（约 5–10 mm，待核），可能按真实画 | 若出摩尔纹再放宽，并写明 |
| 霜用 capsule + box 近似 | 不是真实的霜晶形态 | R3 材质轮调 `glass` tint 与粗糙度；插图 I-4 补形态 |
| 流不随拆开移动 | EXPLODED 时看不到冷媒 | 引擎已禁用，不处理 |
| 开机率 64 % 无法在 PLATE 上表现为一开一停 | 读数只有"运转 / 歇着"两态 | 细看写"等效满速比例"，变频机实际低速长开 |
| sim 控件可见性 / context 绑定 / pose 优先级 | 可能影响第 02、05 章的写法 | §9 施工前夹具验证 |
| 本地市场布局与冷凝器做法未统计 | 0.1-1、0.1-2 的默认可能与"最常见"不符 | P33 统计后再定；改布局只动坐标与风道 |

---

## 17. 施工记录（2026-11-15，Gavin 已按默认定稿；分支 claude/refrigerator）

### 17.1 事实复核后改动的数字（来源与原文摘录见 `data/sources.json`、`data/SOURCES.md`）

| 项 | spec 原值 | 施工值 | 原因 |
|---|---|---|---|
| 设计厨房 | 30 °C | **28 °C** | 气象局年均约 27.5 °C、5 月均 28.6 °C；30 °C 让年耗电超过 3 tick 上限 |
| 冷冻室壁厚 | 侧 / 后 50 mm、顶 60 mm | **65 mm** | DOE 拆解：上冷冻机型冷冻室壁 5.3–7.9 cm |
| 漏热 | 23 + 35 + 10 = 69 W | **20 + 33 + 9 = 62 W** | 随厨房温度与壁厚；热桥约 15 %（DOE 仅传导的箱口边缘约 17 %） |
| 开机率 / 平均功率 / 平均放热 | 64 % / 38 W / 107 W | **57 % / 34 W / 96 W** | 同上 |
| 年耗电 | 375 kWh | **317 kWh（厨房常年 28 °C 的模拟值，不是标签值）** | 375 超过本尺寸（调整容积约 425 L）的 3 tick 法定上限约 328 kWh；本地卖场 300–400 L 上冷冻标签值 270–449、中位约 318 |
| 化霜 | 160 W、20 min、每天 2 次 → 39 kWh | **250 W、约 10 min、约每天 1 次 → 15 kWh** | DOE 拆解 390–413 W、4.8–8 min、压缩机累计运转 10.5–14 h 一次；某厂手册 250 W |
| −25 °C 饱和压力 | 0.060 MPa | **0.058 MPa**（PLATE 0.058；停机 0.079；28 °C 断电约 0.38） | NIST；0.061 是 −24 °C 的值 |
| 新加坡湿度 | 84 % | **约 82 %** | 气象局原文 |
| CFC | 1928 年前后 | **约 1930 年** | 1928 无一手来源；Midgley & Henne 1930、Science History Institute |
| 冰 | 1840 年代美国冰已到新加坡 | **删**；改用 1854 黄埔冰屋、1861 Tudor 接手 | 没有找到来源 |
| 用电占比 | 550 户一周计量 | **删 550 户细节**，17 %（2018 新闻稿）与约 18 %（2016）并列 | NEA 页面上没有 550 户 |
| 停电保冷 | USDA FSIS | **FDA + 弗吉尼亚卫生局** | FSIS 拒绝自动访问 |
| 毛细管 | 内径 0.6–0.9 mm、长 2–4 m（TYPICAL） | **0.7 mm、3 m 只作 DESIGN**；与回气管换热段 1.2–1.8 m 有来源 | 内径与总长无一手来源 |
| 侧壁表面 37 °C、排气温度、果蔬盒保湿、开门停风扇 | 待核 | **删** | 没有来源（开门停风扇只写"门开关点亮灯"） |
| PLATE "侧壁 °C" 一行 | 30 → 37 | 改为 **Heat out / 放热 0 → 168 W** 与 **Fridge air**（跟随试一试输出，只在第 02 章） | 侧壁温度删了；放热行直接显示能量守恒 |
| 冷凝器布局 | "东南亚常见" | **DESIGN："一种常见做法"**；第 06 章细看另讲底部风冷盘管 | DOE 称热壁冷凝器常见于冷柜与小冰箱；读到的一份亚洲厂商手册是底部风冷 |
| 上 / 下冷冻 | 待核 | **默认成立**：Courts 双门 109 上 / 39 下（300–400 L 36 / 13）；Best Denki 16 / 12（26 未标） | Harvey Norman、Gain City 拒绝自动访问 |
| 课纲页码 | — | P4 Heat pp. 76–77；P5 Water（Standard）pp. 49–50；能量转换是 P6 p. 80，"能量不会用完"超出课纲，正文写明 | 已核官方 PDF |

### 17.2 试一试（厨房 28 °C、初温 4 °C、压缩机不工作）

300 s / 600 s：满 + 关 4.2 / 4.5；满 + 薄 4.7 / 5.3；满 + 开 6.7 / 9.1；空 + 关 5.3 / 6.6；空 + 薄 7.8 / 11.0；空 + 开 16.2 / 22.2（`tests/space-scene/refrigerator-topic.test.ts` 核对）。

### 17.3 引擎行为验证（§9 三条）与 E-FR2

1. 不在 `try.vary` / `also` 里的控件不出现在试一试卡上（`explorer/TryIt.tsx` 只渲染 vary + also）。所以 E-FR2 走数据退路：sim 加 step 控件 `heater-w`（0 / 250 W），第 05 章拍 3、4 `sim.set` 它；bind glow 到 `defrost-heater`、visible 到 `meltwater`。**引擎零改动。**
2. bind `visible` 可以作用于 context 零件（`food-items` 随 `contents` 显示 / 隐藏；validate 不拦，单测核对 `simEffects`）。
3. 姿态优先级：sim bind 的姿态压在章 / 拍姿态之上，但没映射的值（`setup = closed`）不写姿态，所以章 / 拍的 `doors-open` 仍然生效；`setup = open` 时 `fresh-door-open` 胜出。单测核对。

### 17.4 与 §3–§5 的差异

- `side-condenser` 不用 `bilateral`：两侧蛇形管 + 顶部前沿横管是一根管（每侧 5 程），流沿真实管走，一次绘制。
- 冷冻门门封并入 `freezer-door`（`door-gaskets` / `magnet-strips` 只在冷藏门上），这样 `fresh-door-open` 只开冷藏门时冷冻门封不跟着转；冷冻门不放门架。
- 风门框并入 `mullion`，`damper` 只剩门片（姿态只转门片）。
- 门开关灯不发光（`setup` 是选择控件，glow 需要数值）。
- `air-door` 拆成 `air-door-out`（冷）与 `air-door-in`（热 → 冷）；另加第六组 `kitchen-air`（厨房空气：`air-kitchen` 与两条开门气流），让第 04 章剖面里不出现厨房一侧的暖气流。
- 活塞沿 Z 来回（缸轴沿 Z、在 x = 0），中线剖切正好把缸剖开看见活塞。
- 几何由 `scripts/geo/refrigerator/build-parts.mjs` 生成（文字在同目录 `part-text.json`）。

### 17.5 参考图（`scripts/geo/refrigerator/refs/`，gitignore）

10 张：US4489470（热壁冷凝器，立式冷柜）、US4735062 图 1–2（上冷冻剖面、门框热液回路）、US4852361 图 2（风扇、风道、风门）、US5499514（蒸发器、化霜加热器、排水）、US5205723（往复式全封闭压缩机剖面）、US4147037（毛细管—回气管换热）为美国专利附图（公有领域）；Commons 3 张（CC BY-SA，只看比例，不取品牌标识）。URL、字节数、SHA-256 见 `data/SOURCES.md` 末尾。没有找到上冷冻冰箱侧壁冷凝管的专利图，所以每侧回数是 DESIGN。

### 17.6 验收数字（2026-11-15，SwiftShader，1920 × 1080）

- 绘制调用：静止 48（目标 < 50）；运转最多 53（第 06 章，目标 < 60）；三角形约 0.227 M（目标 < 0.3 M）。控制板移到箱体背面靠上（原 spec 在机械仓里，在第 04 章剖面里被压缩机挡住）。
- JS：refrigerator 页 429.23 KB gz（space-scene 上限 477 KB）。
- `pnpm shoot refrigerator --beats`：31 拍 0 失败，beat links 31 / 31。
- 写实轮（协调者复审后）：两扇门细把手、上 / 中 / 下铰链盖、底部前方踢脚通风格栅、调平脚、门与箱体倒圆、门封线加深；箱内搁架改有色玻璃加深色前沿、果蔬盒加深、食物统一中间调；绘制调用不变（静止 48、运转 53，0.233 M 三角形）。
- 插图：封面 `refrigerator` 与章图 `refrigerator-gasket-section`（第 02 章）、`refrigerator-frost`（第 05 章，`invert={false}`）、`refrigerator-icebox`（第 07 章）已接入（codex/img4 96d9a621），图注用 Codex 交付的原文；`src/lib/illustrations.json` 加封面覆盖掩码；`status: published`，smoke 计数随之更新（62 个主题、science 20、徽章 124、ww2 图版号 61），`tests/figure-geometry.test.ts` 的不反相名单加 `refrigerator-frost`。
- 门槛：check、validate、test（6,946）、build、e2e（refrigerator + smoke）全绿；shoot：paper 与 cinema（zh）31 拍 0 失败、无漏标、chapter highlights all on screen；keys 0 失败，布局 18 个尺寸 0 问题（含 390 × 844 手机与 iPad 竖横）。
