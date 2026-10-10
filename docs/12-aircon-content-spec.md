# 12 · 空调 · 内容施工 spec（v1）

SpaceScene / Model3DStage，paper 默认、cinema 可切。本主题的任务是**用一个真实题材把 SpaceScene 引擎验一遍**：几何、材质、流场、动画、HUD、演示节拍都要按技术图版（docs/08 + skill `industrial-3d-showcase`，原型 `archetypes.md` §2 封闭设备）做到能发布。本文细到可直接施工；**正文、字幕、来源条目未经 Gavin 定稿不写**（CLAUDE.md）。引擎缺口（§8）先做。

范本：结构照 docs/09、docs/11；写法照 skill `atlas-history-topic` 的 `writing-rules.md`，按科学主题改（§1.3）。

## 0. 决策记录（2026-10-10 起草，待 Gavin 定稿）

| # | 决定 |
|---|---|
| 1 | 对象：一台**壁挂分体式、单冷、变频空调**（新加坡组屋卧室最常见的机型）：室内机 + 室外机 + 连接管。**虚构的通用设计**（无品牌、无型号），称"通用设计研究 / generic design study"；每个物理事实和典型数字都有来源 |
| 2 | 只做制冷（单冷）：新加坡常年制冷，主流家用机多为单冷。**没有四通换向阀**（制热机才有），正文细看里说明 |
| 3 | 节流件用**电子膨胀阀（EEV）、装在室外机里**。因此连接管里的细管（液管）在制冷时输送的是已经节流的**低温气液混合物**，不是"热液体"——这是本主题必须讲对的一处（§1.2 F-14） |
| 4 | 5 章，按 docs/04 大纲调整：第 04 章合并"空气去哪了"与"为什么室外机吹热风"，第 05 章新增"效率与使用"（变频、温度设定、滤网、能效标签、用电、冷媒与气候）。docs/04 的空调大纲待定稿后同步改 |
| 5 | 分区 01–05 = 室内机 / 连接管 / 室外机 / 冷媒回路 / 空气路径。零件组只有前三个（按位置分）；04、05 是**只有流、没有零件**的组（LAYERS 里开关冷媒流和空气流）。电控盒归入各自机组，不单设 `controls` 组（§2） |
| 6 | 模型布局是**示意映射**（MODEL LAYOUT MAPPING）：室内机在左上、室外机在右下、中间一段墙的剖面，两台机都朝向观者；连接管缩短到约 2 m（真实安装常见 3–7 m）。HUD 声明写"通用设计研究"，spec 和细看里写清楚哪些是示意 |
| 7 | 事实纪律：规格行写**本设计的值**（DESIGN），全部落在有来源的**典型范围**（TYPICAL）之内；运行读数是 **SIMULATED** 并满足能量守恒（§1.2）。屏幕上不出 FACT 芯片（只有 STATE 面板的 SIM 芯片），来源全部进 `sources.json`，正文数字照常 `<Num s>` |
| 8 | 不做：品牌 logo、真实型号、照片贴图、配音文件、视频。演示用浏览器语音（与 TimeScene 共用，§8 G1）。测验：默认**不做**（与 ww1/ww2 一致），见 §11-3 |
| 9 | 单位：SI（kW、MPa 绝对压力、°C、m³/h）；制冷量另注 BTU/h（新加坡卖场常用）。压力一律写**绝对压力**并注明 |

## 1. 主题与范围

### 1.1 对象

一台通用的壁挂分体式变频空调（R32 冷媒），新加坡组屋卧室用：

- **室内机**：挂在卧室墙上。吸入房间空气 → 滤网 → 蒸发器盘管（冷）→ 贯流风扇 → 导风板吹出。冷凝水落到接水盘，经排水管排走。电控盒接收遥控器信号，控制风扇和导风板，并与室外机通信。
- **连接管**：两根铜管（细的液管、粗的气管）各自包保温层，与排水管捆在一起，穿墙到室外；两端用喇叭口螺母接在机组上。
- **室外机**：放在空调平台（ledge）上。压缩机（转子式、直流变频，带气液分离器）把低压气体压成高温高压气体 → 冷凝器盘管把热交给室外空气 → 电子膨胀阀降压 → 经液管去室内。轴流风扇从背后抽风穿过冷凝器、从前面吹出。截止阀（服务阀）连接连接管。变频控制板驱动压缩机和风扇。

### 1.2 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源给出的典型范围（引用厂商规格书时写"典型"，不点名品牌）；`DESIGN` = 本设计研究取的值，必须落在 TYPICAL 内；`SIM` = 运行时模拟值。来源编号是计划（§9 的 P#），施工时变成 `sources.json` 的 S#。**"待核"= 我凭记忆给出的工作值，施工代理必须读原文核对后才能写进正文或数据**；核不到就换值或删掉。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 冷媒 | 新加坡新售家用分体机主流 R32（P10、P17） | R32 | NEA 2022 起的 GWP 上限条文 |
| F-2 | R32 安全分类 | ASHRAE 34：A2L（低毒、微燃）（P3） | — | |
| F-3 | R32 全球变暖潜能值 GWP100 | 675（IPCC AR4）/ 677（AR5）（P4）；R410A 2088（AR4） | — | 两个版本并列，不偷偷选 |
| F-4 | R32 物性 | 标准沸点约 −51.7 °C；临界点约 78.1 °C、5.78 MPa；摩尔质量 52.02 g/mol（P1、P2） | — | 是 |
| F-5 | R32 饱和压力（绝对） | 约 1.01 MPa @ 7 °C；1.93 MPa @ 30 °C；3.0 MPa @ 48 °C（P1） | 低压侧 1.01 MPa（蒸发 7 °C），高压侧 3.0 MPa（冷凝 48 °C），停机平衡约 1.93 MPa（30 °C） | 是 |
| F-6 | R32 汽化潜热 | 约 300 kJ/kg @ 7 °C（P1） | — | 是 |
| F-7 | 水的汽化潜热 | 约 2,440 kJ/kg @ 25 °C；2,257 kJ/kg @ 100 °C（P23） | 冷凝水计算用 2,440 | 是 |
| F-8 | 制冷量 | 卧室机 2.5–3.5 kW（约 9,000–12,000 BTU/h；1 kW ≈ 3,412 BTU/h）（P18、P19） | 2.6 kW（约 9,000 BTU/h） | |
| F-9 | 额定输入功率 | 0.6–1.2 kW（P18） | 0.65 kW | |
| F-10 | COP（= 制冷量 ÷ 输入功率，冷却时也叫 EER，W/W） | 额定工况约 3–5（P13、P18）；新加坡能效标签按 NEA 当年标准（P6、P7） | 4.0（= 2.6 ÷ 0.65） | NEA 现行 tick 阈值与计算口径（加权 COP） |
| F-11 | 额定工况 | ISO 5151 T1：室内 27 °C 干球 / 19 °C 湿球，室外 35 °C 干球（P30） | 本模型运行点：室内 27 °C，室外 33 °C | |
| F-12 | 压缩机转速 | 直流变频转子式约 10–120 rps（600–7,200 rpm）（P21）；定频 50 Hz 两极约 2,900 rpm（P13） | SIM：额定 3,600 rpm（60 rps）；动画按可读速度放慢，见 §5 | 是（厂商目录） |
| F-13 | 蒸发 / 冷凝温度 | 蒸发约 5–10 °C；热带环境冷凝约 40–50 °C；排气约 60–90 °C（P14、P20） | 蒸发 7 °C，冷凝 48 °C，排气 SIM 约 75 °C | 是 |
| F-14 | 节流件位置 | 家用分体机的节流件（电子膨胀阀或毛细管）一般在室外机；两根连接管都要保温（P19、P20） | EEV 在室外机 | 读安装 / 维修手册的系统图 |
| F-15 | 连接管 | ≤ 3.5 kW 常见液管 1/4″（6.35 mm）、气管 3/8″（9.52 mm）；最大管长约 15–20 m，出厂预充约 7.5 m 用量（P19） | 1/4″ + 3/8″；模型管长约 2 m（示意） | |
| F-16 | 冷媒充注量 | 约 0.5–0.9 kg（P18、P19） | 0.60 kg | |
| F-17 | 室内机风量 | 高档约 480–720 m³/h（8–12 m³/min）（P18） | 600 m³/h | |
| F-18 | 室外机风量 | 约 1,500–2,100 m³/h（P18） | 1,900 m³/h | |
| F-19 | 贯流风扇 / 轴流风扇转速 | 约 800–1,400 rpm / 600–900 rpm（P20、P22） | SIM 1,100 / 800 rpm；动画放慢 | 是 |
| F-20 | 外形 | 室内机约 770–800 × 280–300 × 210–240 mm；室外机约 660–800 × 500–550 × 260–300 mm（P18） | 室内 800 × 290 × 220 mm；室外 780 × 550 × 290 mm | |
| F-21 | 出风温度 | 约 12–18 °C（P15） | SIM 17 °C（由能量平衡算出，见下） | |
| F-22 | 建议设定温度 | NEA 建议 25 °C 或以上（P8） | 正文用 | 原文措辞、"每升 1 °C 省多少"是否有 NEA 数字 |
| F-23 | 滤网清洁 | 厂商说明书常写每两周（P19） | 正文用 | |
| F-24 | 新加坡气候 | 年均温约 27–28 °C，年均相对湿度约 84 %（P11） | 室外 33 °C 是"炎热午后"的设计点 | 是 |
| F-25 | 空调占家庭用电 | NEA / EMA 的家庭用电研究（P9） | 正文用 | 数字与年份 |
| F-26 | 能效标签 | NEA 强制能效标签（1–5 个 tick）与最低能效标准（MEPS）（P6、P7） | 正文用 | 生效年份、现行最低档 |

**模拟运行点（SIM，内部自洽）**：

- 冷凝器放热 = 制冷量 + 输入功率 = 2.6 + 0.65 = **3.25 kW**。
- 室外风 1,900 m³/h，33 °C 空气密度约 1.15 kg/m³ → 0.607 kg/s；温升 = 3.25 ÷ (0.607 × 1.006) ≈ **5.3 K** → 出风约 **38 °C**。
- 室内风 600 m³/h，27 °C 密度约 1.17 kg/m³ → 0.195 kg/s。显热比取 0.75（典型 0.7–0.8，P15）：显热 1.95 kW → 降温约 **10 K** → 出风约 **17 °C**；潜热 0.65 kW ÷ 2,440 kJ/kg ≈ 0.27 g/s ≈ **1 L/h 冷凝水**。
- 冷媒质量流量约 0.011 kg/s（≈ 39 kg/h，按蒸发器焓差约 240 kJ/kg 估算，待按 P1 焓值核）；0.60 kg 充注量平均约**一分钟走完一圈**。
- 这些数字只出现在 STATE 面板（带 SIM）和正文细看（写明"模拟运行点"）；正文只写取整的典型范围。

### 1.3 口吻（科学主题版写作规则）

- 读者：一般读者，含小学生和家长。通俗不幼稚：短句、具体、先现象后原理；第一次出现的概念当场一句话解释或包 `<Term>`。不用拟人（"冷媒很累""压缩机生气了"），不用"小朋友们"之类的称呼，不用感叹号和问句标题。
- 每章：正文 EN 200–300 词 / ZH 350–500 字，3–5 段 → 细看 `<More>` 2–4 块。中文独立成文。
- 数字：正文写取整加"约 / about"，精确值放细看；每个数量包 `<Num s>`（只包数字）；模拟值写明"在这个模拟运行点 / at this simulated operating point"，不包 `<Num>`，而是在细看里交代算法。
- 对齐小学科学用词（P11，施工时核年级）：热从较热的物体传到较冷的物体（heat gain / heat loss）、温度、蒸发与沸腾、凝结、物态变化、热的良导体与不良导体。专业词（压缩机、冷凝器、蒸发器、膨胀阀、潜热、COP、变频）都进名词表。
- 不做产品推荐，不比较品牌；能效与用电只讲原理和官方建议。冷媒的安全性如实写（R32 微燃，安装和回收要由持证人员做），不渲染危险也不回避。

## 2. 分区 01–05（模型、右上卡、底部三面板共用）

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `indoor` | Indoor unit / 室内机 | 外壳（后壳、端盖、前面板、顶部进风格栅）、滤网、蒸发器（两片）、贯流风扇、导风板、接水盘、电控盒 | `token:ink-2` |
| 02 | `line-set` | Line set / 连接管 | 液管、气管、保温层、喇叭口螺母、排水管 | `token:ink-3` |
| 03 | `outdoor` | Outdoor unit / 室外机 | 外壳（前面板、顶盖、右侧板、底盘）、风扇格栅、冷凝器 + U 形弯头、轴流风扇 + 电机、压缩机 + 转子 + 气液分离器、排气管、吸气管、电子膨胀阀、截止阀、变频控制板 | `token:neutral` |
| 04 | `refrigerant` | Refrigerant loop / 冷媒回路 | 只有流（4 段，§4）；状态变化见第 03 章 | `token:hot`（图例用渐变，§8 G3） |
| 05 | `air` | Air paths / 空气路径 | 只有流（室内 1 + 室外 2，§4） | `token:cold` |

- 组的顺序就是分区号：`groups` 数组按 01–05 写。ARCHITECTURE 面板的分区括号只画有零件的 01–03；04、05 在 LAYERS 和 KEY 里。
- 为什么不设 `controls` 组：两块电控板各在一台机里，单列一组会让右上卡多一列、分区号对不上 01–05；电控的作用在两个零件的 summary 和第 05 章讲。
- 示意墙（`wall-section`）不属于任何分区（§8 G9 的 `context` 零件；没做 G9 之前不放墙）。

## 3. 零件表

### 3.1 坐标与尺度

- 单位米，Y 向上，+Z 朝观者（房间里正对空调的方向），+X 向右（墙外）。地面 y = 0 是室外机所在的空调平台。
- 墙：x ∈ [−0.075, 0.075]，y ∈ [0, 1.95]，z ∈ [−0.35, 0.20]（只是一段墙的剖面）。
- 室内机：中心约 (−0.62, 1.45, 0)，800 × 290 × 220 mm（x −1.02…−0.22，y 1.305…1.595，z −0.11…0.11）。
- 室外机：中心约 (0.62, 0.305, 0)，780 × 550 × 290 mm（x 0.23…1.01，y 0.03…0.58，z −0.145…0.145）；风扇中心 (0.50, 0.31)；右侧 x 0.76…1.01 是压缩机仓。
- 整体包络约 2.1 × 1.95 × 0.55 m，模型半径约 1.45 m；引擎规则"包围半径 ≥ 0.28 × 模型半径（≈ 0.40 m）的零件投影"。
- 下表的坐标、角度是起点，R2 几何轮里按截图调（不改尺寸量级）。primitive 尺寸写法照 `schema.ts`：`fins` 沿 x 叠片时 `size = [深(z), 高(y), 片厚]`；`cylinder = [上半径, 下半径, 高]`（轴 Y）；`vessel` 轴 Y；`tube.path` 相对 `at`（下表给的是绝对点，施工时减去 `at`）。

### 3.2 零件（33 个；所有零件 `level` 不写）

材质族：casing 拉丝铝、steel 机加工钢、powder 缎面黑粉末涂层、stainless、copper、rubber、plastic 哑光暖砂色、glass。"投影"= 按引擎规则会投影（✓）；"隐"= 哪些章 / 拍用 `hide` 隐去（§8 G2）；"X 实"= X-RAY 时保持实心（§8 G4，其余零件透明）。

| # | id | 组 | primitive（米） | at | 材质 | explode dir · dist | connects | 投影 | 隐 | X 实 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `indoor-chassis` 后壳 | indoor | bevelBox [0.80, 0.29, 0.05] bevel 0.012 | (−0.62, 1.45, −0.085) | plastic | [0,0,−1] · 0.12 | end-caps, control-box | ✓ | — | |
| 02 | `end-caps` 端盖 | indoor | bevelBox [0.012, 0.29, 0.22] bevel 0.004；repeat {count 2, axis [1,0,0], spacing 0.788} | (−0.62, 1.45, 0) | plastic | [0,0,1] · 0.10（两端一起） | indoor-chassis | | — | |
| 03 | `front-panel` 前面板 | indoor | bevelBox [0.80, 0.23, 0.02] bevel 0.008，绕 X 后仰 −4° | (−0.62, 1.47, 0.10) | plastic | [0,0.35,1] · 0.30 | air-filter | ✓ | 02、03 章；05 章第 3 拍 | |
| 04 | `top-grille` 进风格栅 | indoor | box [0.008, 0.005, 0.12]；repeat {count 30, axis [1,0,0], spacing 0.025} | (−0.62, 1.597, −0.03) | plastic | [0,1,0] · 0.22 | air-filter | | — | |
| 05 | `air-filter` 滤网 | indoor | box [0.37, 0.004, 0.17]，绕 X 前倾 20°；repeat {count 2, axis [1,0,0], spacing 0.39} | (−0.62, 1.565, 0) | plastic | [0,1,0.4] · 0.40 | evaporator-rear | | — | |
| 06 | `evaporator-front` 蒸发器 | indoor | fins axis x，size [0.022, 0.17, 0.0006]，count 150，gap 0.0042（可视片距 4.8 mm，真实约 1.2–1.8 mm，见 §12） | (−0.62, 1.43, 0.06)，绕 X −15° | casing | [0,0,1] · 0.18 | evaporator-rear, liquid-line, drain-pan | | — | |
| 07 | `evaporator-rear` 蒸发器后片 | indoor | 同上，size [0.022, 0.12, 0.0006] | (−0.62, 1.52, −0.03)，绕 X 55° | casing | [0,0.5,−0.5] · 0.18 | gas-line, crossflow-fan | | — | |
| 08 | `crossflow-fan` 贯流风扇 | indoor | box [0.66, 0.016, 0.0016]（叶片）；repeat {count 24, axis [1,0,0], radius 0.045}（真实约 35 片，见 §5） | (−0.64, 1.39, 0) | plastic | [0,−0.6,1] · 0.30 | louvre | | — | ✓ |
| 09 | `louvre` 导风板 | indoor | bevelBox [0.70, 0.006, 0.065] bevel 0.002，绕 X −25° | (−0.62, 1.318, 0.085) | plastic | [0,−1,1] · 0.20 | — | | — | ✓ |
| 10 | `drain-pan` 接水盘 | indoor | bevelBox [0.74, 0.022, 0.07] bevel 0.004 | (−0.62, 1.345, 0.055) | plastic | [0,−1,0] · 0.18 | drain-hose | | — | |
| 11 | `control-box` 室内电控盒 | indoor | bevelBox [0.09, 0.20, 0.09] bevel 0.004 | (−0.27, 1.45, 0.0) | steel | [1,0,0.3] · 0.25 | crossflow-fan, louvre, inverter-board | | — | ✓ |
| 12 | `liquid-line` 液管 | line-set | tube r 0.0032（1/4″），bendRadius 0.04；路径：室内机后右 (−0.30, 1.38, −0.09) → (−0.10, 1.38, −0.09) → 穿墙 (0.12, 1.38, −0.09) → 沿墙外向下 (0.12, 0.45, −0.22) → 室外机背后 (1.08, 0.45, −0.22) → (1.08, 0.15, −0.06) → 液阀 (1.04, 0.15, −0.06)；在保温层中心线 −0.009 偏置 | 路径中点 | copper | 0 | flare-nuts, evaporator-front | ✓（长路径） | — | |
| 13 | `gas-line` 气管 | line-set | tube r 0.0048（3/8″），同路径 +0.009 偏置，终点气阀 (1.04, 0.22, −0.06) | 同上 | copper | 0 | flare-nuts, evaporator-rear | ✓ | — | |
| 14 | `insulation` 保温层 | line-set | tube r 0.024，同路径中心线（两根保温管 + 排水管捆扎后的外包络） | 同上 | rubber（黑色橡塑保温，新加坡常见） | 0 | liquid-line, gas-line | ✓ | 03 章（让管里的冷媒看得见；或靠 X-RAY） | |
| 15 | `flare-nuts` 喇叭口螺母 | line-set | cylinder [0.011, 0.011, 0.018]，轴 X（rotation [0,0,90]）；repeat {count 2, axis [0,1,0], spacing 0.07}（真实两颗对边 17 / 22 mm，模型同尺寸） | (1.035, 0.185, −0.06) | copper（黄铜，见 §8 G14） | [1,0,0] · 0.10 | service-valves | | — | ✓ |
| 16 | `drain-hose` 排水管 | line-set | tube r 0.008；接水盘右端 (−0.25, 1.33, −0.05) → 贴保温层下方穿墙 → 沿墙外下到平台 (0.20, 0.03, 0.10) | 路径中点 | plastic | 0 | drain-pan | ✓ | — | |
| 17 | `outdoor-front` 室外机前面板 | outdoor | **panel** [0.78, 0.55, 0.012]，圆孔 r 0.205 位于风扇中心（§8 G10）；未做 G10 前：三条 bevelBox 围出开口 + 一个 torus 导风圈 | (0.62, 0.305, 0.139) | powder | [0,0,1] · 0.35 | fan-grille | ✓ | 02、03 章 | |
| 18 | `outdoor-top` 顶盖 | outdoor | bevelBox [0.78, 0.012, 0.29] bevel 0.004 | (0.62, 0.574, 0) | powder | [0,1,0] · 0.30 | — | ✓ | 02、03 章 | |
| 19 | `outdoor-side` 右侧板（兼阀门盖） | outdoor | bevelBox [0.012, 0.53, 0.29] bevel 0.004 | (1.004, 0.30, 0) | powder | [1,0,0] · 0.30 | — | | 02、03 章 | |
| 20 | `base-pan` 底盘 | outdoor | bevelBox [0.78, 0.025, 0.29] bevel 0.004 | (0.62, 0.043, 0) | powder | [0,−1,0] · 0.10 | compressor, condenser-coil | ✓ | — | |
| 21 | `fan-grille` 出风格栅 | outdoor | box [0.42, 0.005, 0.005]；repeat {count 13, axis [0,1,0], spacing 0.032} | (0.50, 0.31, 0.152) | powder | [0,0,1] · 0.45 | outdoor-fan | | — | |
| 22 | `condenser-coil` 冷凝器 | outdoor | fins axis x，size [0.036, 0.50, 0.0006]，count 160，gap 0.0039（可视片距 4.5 mm） | (0.62, 0.31, −0.125) | casing | [0,0,−1] · 0.30 | condenser-hairpins, discharge-pipe, expansion-valve | ✓ | — | |
| 23 | `condenser-hairpins` U 形弯头 | outdoor | tube r 0.0035，路径 [[0,−0.0105,0],[0.012,−0.0105,0],[0.012,0.0105,0],[0,0.0105,0]]（XY 平面的 U），bendRadius 0.008；repeat {count 12, axis [0,1,0], spacing 0.042} | (0.985, 0.31, −0.125) | copper | 同 22 | condenser-coil | | — | |
| 24 | `outdoor-fan` 轴流风扇 | outdoor | bevelBox [0.15, 0.085, 0.004] bevel 0.0015（叶片，桨距约 25–30°，R2 调）；repeat {count 3, axis [0,0,1], radius 0.10} | (0.50, 0.31, 0.10) | plastic | [0,0,1] · 0.25 | fan-motor | | — | ✓ |
| 25 | `fan-motor` 风扇电机 | outdoor | cylinder [0.055, 0.055, 0.07]，轴 Z（rotation [90,0,0]） | (0.50, 0.31, 0.04) | powder | [0,0,1] · 0.15 | inverter-board | | — | ✓ |
| 26 | `compressor` 压缩机 | outdoor | vessel r 0.058，length 0.17，headRatio 0.5（总高约 0.23） | (0.88, 0.205, −0.03) | powder（黑漆壳） | [0.3,0,1] · 0.25 | accumulator, discharge-pipe, compressor-rotor | | — | ✓ |
| 27 | `compressor-rotor` 电机转子（永磁体） | outdoor | box [0.008, 0.055, 0.016]；repeat {count 6, axis [0,1,0], radius 0.026}（六块磁钢，直流无刷电机） | (0.88, 0.25, −0.03) | steel | 同 26 | compressor | | — | ✓ |
| 28 | `accumulator` 气液分离器 | outdoor | vessel r 0.034，length 0.11，headRatio 0.5 | (0.79, 0.24, 0.06) | powder | [−0.3,0,1] · 0.25 | compressor, suction-pipe | | — | ✓ |
| 29 | `discharge-pipe` 排气管 | outdoor | tube r 0.0048：压缩机顶 (0.88, 0.335, −0.03) → (0.88, 0.50, −0.03) → (0.975, 0.50, −0.10) → 冷凝器进口 (0.975, 0.52, −0.125) | 路径中点 | copper | 同 26 | condenser-coil | | — | |
| 30 | `suction-pipe` 吸气管 | outdoor | tube r 0.0048：气阀 (1.02, 0.22, −0.06) → (0.95, 0.36, 0.06) → 分离器顶 (0.79, 0.32, 0.06) | 路径中点 | copper | [0.3,0,1] · 0.20 | accumulator | | — | |
| 31 | `expansion-valve` 电子膨胀阀 | outdoor | cylinder [0.018, 0.018, 0.035]（步进电机线圈头；阀体在管内） | (0.96, 0.40, 0.06) | powder | [1,0,1] · 0.25 | service-valves | | — | ✓ |
| 32 | `service-valves` 截止阀 | outdoor | bevelBox [0.03, 0.035, 0.04] bevel 0.003；repeat {count 2, axis [0,1,0], spacing 0.07} | (1.02, 0.185, −0.06) | copper（黄铜） | [1,0,0] · 0.12 | flare-nuts | | — | ✓ |
| 33 | `inverter-board` 变频控制板 | outdoor | bevelBox [0.24, 0.06, 0.24] bevel 0.004（盒；散热片伸进风道写在 detail 里） | (0.885, 0.50, 0) | steel | [0,1,0.3] · 0.25 | compressor, outdoor-fan, expansion-valve | | — | ✓ |
| — | `wall-section` 墙（context，§8 G9） | — | box [0.15, 1.95, 0.55] | (0, 0.975, −0.075) | plastic | 0 | — | 不投影（G9） | — | |

- **零件数说明**：brief 给的是约 28 个；33 个是因为几何都是实心积木，外壳必须拆成薄板（后壳 + 端盖 + 前面板；前面板 + 顶盖 + 侧板 + 底盘）才能露出里面，冷凝器的铜管靠 U 形弯头表达"管穿过鳍片"。每个零件都有功能理由（summary 第一句写）。删减顺序（如需要）：`end-caps` → `condenser-hairpins` → `suction-pipe`。
- **绘制预算**：33 个零件各一次绘制（repeat 与 fins 是实例），投影件约 10 次阴影绘制，流 7 次，地面 2 次：运转时约 52 次，< 100。三角形：fins 150 + 150 + 160 片 × 12，管子每根 ≤ 480 段，合计远低于 0.3 M。
- **默认不隐藏任何零件**（第 01 章是完整的外观）。`hide` 不累积，只看本章 / 本拍（§8 G2）。
- **X-RAY 角色**：标 ✓ 的零件在 X-RAY 时保持实心（机器本体），其余（外壳、鳍片、管子、保温层）透明 .15，这样管里的冷媒粒子和机内的气流可见（§8 G4）。

### 3.3 summary / detail 要点（施工时写成 EN/ZH）

summary 一句话说"它做什么"，也是引线标注的一行说明（≤ 60 字符）；detail 2–3 句，数字带来源（§8 G11）。

| id | summary 要点 | detail 要点 |
|---|---|---|
| indoor-chassis | 机身后壳，挂在墙上的挂板上 | 塑料（ABS 类）后壳，内有风道；挂板用膨胀螺丝固定在墙上 |
| end-caps | 两端封住风道 | 右端后面是风扇电机和电控盒 |
| front-panel | 可掀起的前盖，打开能取出滤网 | 现在很多机型前盖不进风，空气主要从顶部进 |
| top-grille | 房间空气从这里被吸进来 | 进风在上、出风在下：冷空气往下沉，房间混得更均匀 |
| air-filter | 挡住灰尘，保护蒸发器 | 说明书常写每两周清洗；滤网堵了风量变小、耗电变多（F-23） |
| evaporator-front / -rear | 冷媒在铜管里蒸发，从流过的空气中吸热 | 铝鳍片增大与空气接触的面积；表面温度低于空气露点，水汽凝成水滴（除湿）；真实片距约 1.2–1.8 mm |
| crossflow-fan | 把空气横向吸过蒸发器再吹出去 | 叶轮和机身一样长，电机在右端；SIM 约 1,100 rpm |
| louvre | 上下摆动，改变出风方向 | 由电控盒里的步进电机驱动 |
| drain-pan | 接住蒸发器滴下的冷凝水 | 模拟运行点约每小时 1 升水（§1.2） |
| control-box | 接收遥控器信号，控制风扇和导风板，与室外机通信 | 室温传感器把读数传给它，变频空调据此调压缩机转速 |
| liquid-line | 细管：把降压后的低温冷媒送进室内 | 1/4″ 铜管；节流在室外机里，所以这根管在制冷时也是冷的，必须保温（F-14、F-15） |
| gas-line | 粗管：把吸了热的冷媒气体带回室外 | 3/8″ 铜管；气体比液体占的体积大得多，所以管更粗 |
| insulation | 包住两根铜管，防止吸热和结露 | 不包的话管外会凝水滴在墙上 |
| flare-nuts | 把铜管喇叭口压紧在阀门上，不漏冷媒 | 拧紧力矩按说明书（P19）；安装由持证技工做 |
| drain-hose | 把冷凝水排到室外 | 靠重力，管子要一路向下 |
| outdoor-front | 室外机前面板，中间圆孔是风扇出风口 | 粉末涂层钢板 |
| outdoor-top / outdoor-side / base-pan | 外壳的顶、右侧和底；右侧板盖住阀门 | 底盘上有排水孔 |
| fan-grille | 防止手和杂物碰到风扇 | — |
| condenser-coil | 冷媒在这里把热交给室外空气，由气体凝结成液体 | 铝鳍片 + 铜管；很多机型的盘管绕到左侧，这里只画背面一片（示意） |
| condenser-hairpins | 铜管在鳍片两端用 U 形弯头来回连通 | — |
| outdoor-fan | 从背后抽风穿过冷凝器，从前面吹出 | SIM 约 800 rpm |
| fan-motor | 驱动风扇 | 直流电机，转速由控制板调 |
| compressor | 把低压冷媒气体压成高温高压气体，推动整个回路 | 转子式；外壳是密封的，电机和压缩部件都在里面；SIM 3,600 rpm |
| compressor-rotor | 压缩机里电机的转子，带着滚动活塞转 | 直流无刷电机，永磁体；变频 = 改变转速（F-12） |
| accumulator | 只让气体进压缩机，挡住液滴 | 液体不能被压缩，进了压缩机会损坏它 |
| discharge-pipe | 压缩机出口到冷凝器的热管 | 模拟运行点约 75 °C（F-13） |
| suction-pipe | 从气阀回到分离器的冷管 | — |
| expansion-valve | 让高压液体经过一个可调的小口，压力骤降、温度骤降 | 步进电机按控制板指令开大关小（F-14） |
| service-valves | 连接管接在这里；安装、维修时开关 | 室外机出厂时冷媒封在里面，接好管、抽真空后才打开 |
| inverter-board | 把市电变成频率可变的电，调压缩机转速 | 功率器件的散热片伸进风道，由风扇顺带冷却 |

## 4. 流

**引擎现状（已查代码）**：`flowMaterial.ts` 每条流一个 `uColor`，**不支持沿路径变色**；开放路径两端各有 5 % / 8 % 的淡入淡出（`smoothstep(0, .05, u)`、`1 − smoothstep(.92, 1, u)`），所以首尾相接的几段之间会出现空档；每条流固定 360 个粒子（`PARTICLES_PER_FLOW`）、抖动半径固定 0.012、粒径按主题固定；路径烘焙 64 个采样点；流随剖切面一起被裁掉。本节按 §8 G3 补齐后的写法写；**没做 G3 的退路**写在表下。

颜色语义（每色一个意思，冷媒和空气共用）：`hot` = 热（高于室温），`neutral` = 接近室温 / 环境，`cold` = 冷（低于室温）。物态不靠颜色，靠**粒子疏密和速度**：液体密而慢，气体疏而快，气液混合居中。段与段之间按"粒子通量连续"取数：`count / 长度 × speed ≈ 60 个/秒`（液体段因此更密）。速度是可视速度，不宣称真实流速。

| id | group | 段 | 路径（按零件） | 约长 m | speed | count | size × | spread | stops（u: 色） |
|---|---|---|---|---|---|---|---|---|---|
| `ref-hot-gas` | refrigerant | 高温高压气体 → 在冷凝器里凝结 | 压缩机顶 → discharge-pipe → 冷凝器进口 → 盘管内 3 程（右→左→右→左，沿 hairpin 处折返）→ 冷凝器出口（右下） | 2.9 | 0.55 | 320 | 0.45 | 0.003 | 0: hot · 0.18: hot · 1: neutral |
| `ref-warm-liquid` | refrigerant | 高压液体 | 冷凝器出口 → EEV 进口 | 0.35 | 0.20 | 110 | 0.45 | 0.002 | 0: neutral · 1: neutral |
| `ref-cold-mix` | refrigerant | 低温低压气液混合 → 在蒸发器里蒸发 | EEV → 液阀 → liquid-line 全程 → 蒸发器前片、后片 2 程 | 3.6 | 0.30 | 720 | 0.45 | 0.003 | 0: cold · 1: cold |
| `ref-cool-gas` | refrigerant | 低压气体回压缩机 | 蒸发器出口 → gas-line 全程 → 气阀 → suction-pipe → 分离器 → 压缩机下部进口 | 2.7 | 0.80 | 200 | 0.45 | 0.003 | 0: cold · 1: cold，末段 10 % 向 neutral 混 35 % |
| `air-indoor` | air | 房间空气 → 冷风 | 顶部格栅上方 (x, 1.75, −0.05) → 格栅 → 滤网 → 蒸发器后片 → 风扇 (1.40, 0) → 出风口 (1.33, 0.07) → 导风板外 (1.25, 0.25) → (1.10, 0.55) | 0.95 | 0.35 | 360 | 0.8 | [0.30, 0.01, 0.01] | 0: neutral · 0.42: neutral · 0.55: cold · 1: cold |
| `air-outdoor-upper` | air | 室外空气 → 热风（上半） | 冷凝器背后 (0.62, 0.45, −0.45) → 冷凝器 (−0.125) → 风扇 (0.50, 0.36, 0.10) → 格栅 → (0.50, 0.40, 0.65) | 1.15 | 0.50 | 360 | 0.8 | [0.15, 0.05, 0.02] | 0: neutral · 0.30: neutral · 0.40: hot · 1: hot |
| `air-outdoor-lower` | air | 同上（下半） | 冷凝器背后 (0.62, 0.15, −0.45) → … → (0.50, 0.24, 0.65) | 1.15 | 0.50 | 360 | 0.8 | 同上 | 同上 |

- 四段冷媒首尾相接（前一段终点 = 后一段起点），`ends: "open"`（不淡入淡出，§8 G3）。在压缩机里（`ref-cool-gas` 终点 → `ref-hot-gas` 起点）颜色从冷跳到热：这就是"压缩使气体升温"，第 03 章第 1 拍讲。
- 流的 `parts`（§8 G8）：冷媒四段合起来是 compressor → discharge-pipe → condenser-coil → expansion-valve → service-valves → liquid-line → evaporator-front → evaporator-rear → gas-line → suction-pipe → accumulator，右上卡运转时沿这条链着色。
- 空气流 `clip: false`（剖切时不裁掉机外的空气，§8 G3）；冷媒流照常被裁（管子被切开时里面的粒子也一起切）。
- 合计 7 条流 = 运转时 +7 次绘制（< 10）。
- **没做 G3 的退路**：冷媒按 4 段、每段单色（hot / neutral / cold / cold），接缝处会有淡出空档；室内气流拆成 3 条（x = −0.88、−0.62、−0.36），室外拆成 3 条：共 10 条流（+10 次绘制，压线）。粒径大于铜管直径（0.024 vs 0.006–0.010 m），只能在 X-RAY 里看。**不建议走退路**，G3 是小改动。

## 5. 动画

全部 `whenRun: true`。转速是**可读的视觉速度**（master-spec G：不宣称真实转速），真实值（SIM）只在 STATE 面板和细看里出现；第 03 章细看写一句"画面里的转动放慢了几十倍"。

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `compressor-spin` | compressor-rotor | rotate | axis [0,1,0]，rpm 60 | 六块磁钢绕轴转；剖切或 X-RAY 才看得见（压缩机外壳不转） |
| `crossflow-spin` | crossflow-fan | rotate | axis [1,0,0]，rpm 30 | 24 片，60 fps 时每帧 3°、30 fps 时 6°，都小于半个叶片间距 7.5°，不出现车轮倒转错觉 |
| `outdoor-fan-spin` | outdoor-fan | rotate | axis [0,0,1]，rpm 45 | 3 片 |
| `louvre-swing` | louvre | oscillate | axis [1,0,0]，amplitude 15，hz 0.12 | 约 8 s 一个来回 |
| `eev-adjust` | expansion-valve | pulse | scale 1.05，hz 0.5 | 示意"在调节"，不是真实动作；summary 已说明它由步进电机调开度 |

## 6. 章节

### 6.0 总表

镜头写预设名（§7.4）；`layers` 只写与默认（全部五组）不同的；`hide` 不累积。

| # | id | 标题 EN / ZH | view | run | cutaway | hide | layers | part | labels | 镜头 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `whole-machine` | The whole machine / 整机 | assembled | false | none | — | 全部 | null | 组标注 indoor、line-set、outdoor（§8 G12；退路：front-panel、insulation、outdoor-front） | hero |
| 02 | `open-it-up` | Open it up: the four big parts / 拆开看：四大件 | assembled | false | none | front-panel, outdoor-front, outdoor-top, outdoor-side | 全部 | null | compressor, condenser-coil, expansion-valve, evaporator-front | hero |
| 03 | `switch-on` | Switch on: the refrigerant loop / 通电：冷媒循环 | xray | true | none | 同 02 + insulation | indoor, line-set, outdoor, refrigerant | compressor | compressor, condenser-coil, expansion-valve, evaporator-front, liquid-line, gas-line | hero |
| 04 | `where-the-air-goes` | Where the air goes / 空气去哪了 | assembled | true | none | — | indoor, line-set, outdoor, air | null | top-grille, louvre, condenser-coil, fan-grille | hero |
| 05 | `efficiency-and-use` | Using it well / 用得好、用得省 | assembled | true | none | — | 全部 | null | compressor, inverter-board, air-filter | hero |

每章另写 `summary`（阅读面板头一句，也是默认字幕）和 `question`（可选，孩子会问的问题，不渲染时作备注）。下面每章的"正文提纲"是要点，不是正文。

### 6.1 第 01 章 `whole-machine`

- **summary**：A split air conditioner is two machines joined by pipes: one inside the room, one outside. / 分体式空调是用管子连起来的两台机器：一台在房间里，一台在室外。
- **正文提纲**：① 名字的由来：分体 = 室内机 + 室外机，一束管线穿墙相连；新加坡组屋的室外机放在空调平台上（P27）。② 空调不"造冷"：它把房间里的热搬到室外（引出第 03、04 章）。③ 三件东西各自的位置和大小（F-20）。④ 冷媒是什么：在管里一圈圈流动、反复蒸发和凝结的物质（`<Term>`），本机用 R32（F-1）。
- **节拍**：

| 拍 | state（叠加在本章上） | 字幕要点 |
|---|---|---|
| 1 | 本章（hero） | 一台壁挂分体式空调：室内机、室外机、连接管 |
| 2 | camera indoor；labels top-grille, front-panel, louvre | 室内机：上面进风、下面出风，约 0.8 m 长 |
| 3 | camera line-set；labels insulation, drain-hose | 管线穿墙：两根铜管包着保温层，旁边是排水管 |
| 4 | camera outdoor；labels outdoor-front, fan-grille, condenser-coil | 室外机：前面出风、背后是金属盘管 |

- **细看**：`Why "split"?`（窗式机与分体机：噪音大的压缩机放到室外）；`Living with air-con in Singapore`（家庭拥有率、空调平台、安装由持证人员做；数字 P9/P27 待核）；`How big is it?`（制冷量 2.5–3.5 kW、BTU/h 换算，F-8）。
- **名词首现**：refrigerant、split-system。

### 6.2 第 02 章 `open-it-up`

- **summary**：Take the covers off and four parts do the real work: compressor, condenser, expansion valve and evaporator. / 拿掉外壳，真正干活的是四大件：压缩机、冷凝器、膨胀阀、蒸发器。
- **正文提纲**：① 四大件各在哪台机里（三件在室外，一件在室内）。② 每件一句话的作用。③ 两种盘管长得一样（铝鳍片 + 铜管），作用相反：一个放热、一个吸热。④ 其余零件为四大件服务：风扇、滤网、接水盘、电控。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | hide 生效（从完整外观过渡：前面板向上掀起后淡出，室外机顶盖、前板、侧板向外移开后淡出） | 打开外壳 |
| 2 | part compressor；camera outdoor；labels compressor, accumulator | 压缩机：黑色密封罐，回路的"泵" |
| 3 | part condenser-coil；camera 室外机右后上方（自定 camera）；labels condenser-coil, condenser-hairpins | 冷凝器：室外机背后的盘管 |
| 4 | part expansion-valve；camera 室外机右侧近景；labels expansion-valve, service-valves | 膨胀阀：一个可调的小口 |
| 5 | part evaporator-front；camera indoor；labels evaporator-front, evaporator-rear, crossflow-fan | 蒸发器：室内机里的盘管，就在风扇前面 |

- **细看**：`Fins and tubes`（为什么要鳍片：增大面积；片距真实值 vs 模型）；`The other parts`（风扇、滤网、接水盘、电控各一句）；`Pull it apart`（提示按 E 看爆炸图；爆炸方向按装配逻辑）。
- **名词首现**：compressor、condenser、evaporator、expansion-valve、heat-exchanger。

### 6.3 第 03 章 `switch-on`

- **summary**：Switched on, the same refrigerant goes round and round, changing from gas to liquid and back as its pressure rises and falls. / 通电后，同一份冷媒一圈圈流动，压力一升一降，它就在气体和液体之间来回变化。
- **正文提纲**：① 压缩：低压气体被压成高压，温度升到约 70–80 °C（F-13，取整写范围）。② 冷凝：高压气体在冷凝器里放热，凝结成液体（约 48 °C 时就凝结，因为压力高；F-5）。③ 节流：液体通过膨胀阀，压力从约 3.0 降到约 1.0 MPa，一部分立刻沸腾，温度降到约 7 °C（F-5）。④ 蒸发：冷的气液混合物在蒸发器里吸收房间空气的热，全部变成气体，回到压缩机。⑤ 关键：沸点随压力变——压力高，冷媒在较高温度就凝结；压力低，在较低温度就沸腾；压缩机和膨胀阀制造了这个压力差（`<Term id="latent-heat">`）。
- **节拍**（颜色：热 = 橙，接近室温 = 灰，冷 = 青灰；密 = 液体，疏 = 气体，字幕里说一次）：

| 拍 | state | 字幕要点（每拍一个数字） |
|---|---|---|
| 1 | camera outdoor；part compressor；cutaway half（看见转子） | 压缩：气体被压缩，约 1.0 → 3.0 MPa，变热 |
| 2 | part condenser-coil；camera 室外机右后上方 | 冷凝：在冷凝器里放热，约 48 °C 时凝结成液体 |
| 3 | part expansion-valve；camera 右侧近景 | 节流：压力骤降，温度降到约 7 °C，变成冷的气液混合物 |
| 4 | part evaporator-front；camera indoor | 蒸发：在蒸发器里吸热，沸腾成气体 |
| 5 | part null；camera hero | 一圈约一分钟（模拟），周而复始 |

- **细看**：`Pressure and boiling point`（R32 的饱和温度—压力对照四个点，F-5；类比高原上水的沸点更低）；`Numbers at this simulated operating point`（§1.2 的模拟运行点：压力、温度、质量流量、一圈的时间；写明 SIM）；`Why the thin pipe is cold too`（F-14：节流在室外，两根管都保温）；`About R32`（A2L、GWP 两版本、为什么取代 R410A / R22；P3、P4、P24、P25）。
- **名词首现**：latent-heat、boiling-point（或 pressure）、vapour-compression-cycle。

### 6.4 第 04 章 `where-the-air-goes`

- **summary**：Room air is cooled and dried as it passes the cold coil; outside, the heat it lost comes out as warm air. / 房间空气流过冷盘管时被降温、除湿；它失去的热在室外变成一股热风吹出来。
- **正文提纲**：① 室内：空气从顶部进，经过滤网和蒸发器降温约 10 °C（SIM 17 °C 出风，F-21 范围），从导风板吹出；空气里的水汽在冷盘管上凝成水，所以空调也在除湿（约 1 L/h，SIM）。② 室外：风扇从背后抽风穿过冷凝器，吹出的风比进风热约 5 °C（SIM）。③ 热被"搬"走而不是消灭：室外放出的热 = 从房间吸的热 + 压缩机用的电（2.6 + 0.65 = 3.25 kW，SIM）——所以室外机吹热风。④ 对齐小学科学：热自然从热处流向冷处；空调把热从较冷的房间送到较热的室外，要靠压缩机做功（用电）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（hero，空气流） | 室内一股冷风、室外一股热风 |
| 2 | camera indoor；view xray；labels top-grille, air-filter, evaporator-front, louvre | 房间空气：进 27 °C → 出约 17 °C（模拟） |
| 3 | camera indoor 低一点；labels drain-pan, drain-hose | 空气里的水汽凝结，接水盘接住，排到室外 |
| 4 | camera outdoor；view xray；labels condenser-coil, outdoor-fan, fan-grille | 室外空气：进 33 °C → 出约 38 °C（模拟） |
| 5 | camera hero；layers 加 refrigerant；view xray | 热从房间搬到室外，外面多出的那一份是压缩机用的电 |

- **细看**：`Heat moved, not destroyed`（能量平衡算式，写明 SIM）；`Why the room also gets drier`（露点、冷凝水量、新加坡湿度 F-24）；`Hot air outside`（室外机密集时的热岛、平台通风要求；P27 待核，不写没有来源的说法）。
- **名词首现**：heat-transfer、condensation、dehumidification。

### 6.5 第 05 章 `efficiency-and-use`

- **summary**：How much electricity an air conditioner uses depends on its design and on how it is used. / 空调用多少电，取决于它的设计，也取决于怎么用。
- **正文提纲**：① COP：用 1 份电搬走几份热（本模型 4.0，典型 3–5，F-10）。② 变频：定频机靠开停控制温度；变频机改变压缩机转速（F-12），接近设定温度后低速运转，减少反复启停（只讲原理；省电百分比各来源不一，只写有来源的区间或不写）。③ 用法：NEA 建议设定 25 °C 或以上（F-22）；清洗滤网（F-23）；关门窗。④ 能效标签：tick 越多越省电，NEA 强制标签与最低能效标准（F-26）。⑤ 冷媒与气候：R32 的 GWP 比 R410A 低约三分之二，但仍是温室气体，维修与报废要由持证人员回收（P10、P24）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | part compressor；camera outdoor；view xray | 变频：压缩机转速可变，接近设定温度时慢下来 |
| 2 | run false → 字幕讲定频机停机；（下一拍再开） | 定频机：到温度就停，热了再全速启动 |
| 3 | hide front-panel；part air-filter；camera indoor | 滤网：堵了风量变小、更耗电，约两周洗一次 |
| 4 | camera hero | 设定 25 °C；看能效标签上的 tick |
| 5 | camera line-set；labels liquid-line, gas-line, service-valves | 冷媒留在管里：安装、维修、报废都要防止泄漏 |

- **细看**：`What the ticks mean`（MELS / MEPS 生效年份与当前最低档，P6、P7 待核）；`What a night of air-con costs`（0.65 kW × 8 h ≈ 5.2 kWh × 施工当季 SP Group 电价，P29；写明是模拟运行点）；`Cooling around the world`（IEA《The Future of Cooling》全球空调与风扇用电占比，P26）；可选 `Air-con and Singapore`（历史与城市发展；若用李光耀关于空调的原话，必须核原文出处，否则不用）。
- **名词首现**：cop、inverter、energy-label、gwp。

### 6.6 名词表 `glossary.json`（16 个候选，保留 12–15 个）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| refrigerant | Refrigerant / 冷媒（制冷剂） | 在空调回路里循环、反复蒸发和凝结来搬运热的物质 | latent-heat, gwp |
| split-system | Split system / 分体式 | 室内机和室外机分开、用管线连接的空调 | — |
| compressor | Compressor / 压缩机 | 把冷媒气体压到高压、推动回路的泵 | inverter |
| condenser | Condenser / 冷凝器 | 冷媒在里面放热、由气体凝结成液体的盘管 | condensation |
| evaporator | Evaporator / 蒸发器 | 冷媒在里面吸热、由液体沸腾成气体的盘管 | latent-heat |
| expansion-valve | Expansion valve / 膨胀阀 | 让高压液体通过可调小口、压力和温度骤降的阀 | — |
| heat-exchanger | Heat exchanger / 换热器 | 让热从一种流体传到另一种而两者不混合的设备，如盘管 | condenser, evaporator |
| latent-heat | Latent heat / 潜热 | 物质改变状态（如液体变气体）时吸收或放出、但不改变温度的热 | boiling-point |
| boiling-point | Boiling point / 沸点 | 液体沸腾的温度，压力越低越低 | latent-heat |
| heat-transfer | Heat transfer / 热传递 | 热自然从较热处流向较冷处 | — |
| dehumidification | Dehumidification / 除湿 | 空气被冷却到露点以下，水汽凝结析出 | condensation |
| condensation | Condensation / 凝结 | 气体放热变成液体 | — |
| cop | COP（coefficient of performance）/ 能效比 | 搬走的热 ÷ 用掉的电；越大越省电 | energy-label |
| inverter | Inverter / 变频 | 改变电的频率来调节压缩机转速的技术 | compressor |
| energy-label | Energy label (ticks) / 能效标签 | 新加坡 NEA 强制的能效标识，tick 越多越省电 | cop |
| gwp | Global warming potential / 全球变暖潜能值 | 同质量气体在 100 年里造成的增温效果与二氧化碳之比 | refrigerant |

正文没用到的删掉。`<Term>` 只包全主题第一次出现处，EN、ZH 各一处。

## 7. HUD

### 7.1 标题块与规格行

- DOC-ID：`ATL-AIRCON-01…05`。标题：EN "How an Air Conditioner Cools a Room" / ZH "空调怎样让房间变凉"；副标题 "A wall-mounted split inverter unit, opened up" / "拆开一台壁挂分体式变频空调"。
- 标题块声明（§8 G5 的 `note`）："Generic design study · not a specific brand or model / 通用设计研究 · 不代表任何品牌或型号"。
- 规格行（宿主默认 3 行之后，主题 5 行，§8 G5；不带 FACT 芯片，值都是 DESIGN）：

| id | label EN / ZH | value |
|---|---|---|
| type | Type / 类型 | WALL SPLIT · INVERTER |
| refrigerant | Refrigerant / 冷媒 | R32 · 0.60 kg |
| cooling | Cooling / 制冷量 | 2.6 kW · 9,000 BTU/h |
| power | Power in / 输入功率 | 0.65 kW · COP 4.0 |
| airflow | Airflow / 风量 | 600 · 1,900 m³/h |

引擎自带的 PARTS / GROUPS / FLOWS 行：有主题规格行时只保留 PARTS（共 3 + 1 + 5 = 9，超 8 行上限 → 宿主的 SYLLABUS 行在 `moe` 为空时不画，或主题行减到 4 行；施工代理按 G5 定一种）。

### 7.2 右上卡（零件链路，引擎已有）

- 列顺序 = 组顺序：01 INDOOR · 02 LINE SET · 03 OUTDOOR；04、05 没有零件，不出空列（§8 G8）。
- 列内顺序 = 零件数据顺序（§3.2 的序号）。零件 EN 名尽量 ≤ 14 字符（卡片列宽约 99 设计 px 时不截断）：例如 Evaporator、Evap. (rear)、Crossflow fan、Expansion valve、Service valves、Inverter board。
- `connects` 构成回路链：compressor → discharge-pipe → condenser-coil → expansion-valve → service-valves → flare-nuts → liquid-line → evaporator-front → evaporator-rear → gas-line → flare-nuts … suction-pipe → accumulator → compressor；空气侧：top-grille → air-filter → evaporator-rear、crossflow-fan → louvre、outdoor-fan → fan-motor；电控：control-box → crossflow-fan / louvre / inverter-board，inverter-board → compressor / outdoor-fan / expansion-valve。
- 运转时沿冷媒 `parts` 链着色并步进（§8 G8）。室外列 17 行：需要 G8 的紧凑行高。

### 7.3 底部三面板

- **01 ARCHITECTURE**：`views.section: { plane: "xy" }`（正立面）：左上室内机、中间墙（context，斜线填充，G9）、右下室外机，分区括号 01 / 02 / 03，比例尺 0.5 m。REFERENCE（R）用同一立面。
- **02 DETAIL**：引擎现有（选中零件编号、名称、所属组、相连、一行说明、迷你爆炸图）。
- **03 STATE**：RUN 一行 + 主题的模拟读数 6 行（§8 G6），每行带 SIM 芯片；VIEW / EXPLODE 已在状态行里，有主题读数时面板不再重复。

| id | label EN / ZH | unit | idle（停机） | run（稳定运行） | τ（s） | 小数 |
|---|---|---|---|---|---|---|
| compressor | Compressor / 压缩机 | rpm | 0 | 3,600 | 6 | 0（显示取整到 10） |
| high-side | High side / 高压侧 | MPa abs | 1.93 | 3.00 | 10 | 2 |
| low-side | Low side / 低压侧 | MPa abs | 1.93 | 1.01 | 10 | 2 |
| air-out-indoor | Indoor air out / 室内出风 | °C | 27 | 17 | 25 | 1 |
| air-out-outdoor | Outdoor air out / 室外出风 | °C | 33 | 38 | 20 | 1 |
| power | Power / 功率 | kW | 0.00 | 0.65 | 6 | 2 |

  算法：`x(t) = target + (x₀ − target) · e^(−Δt/τ)`，target = run ? `run` : `idle`，开机与关机都按同一 τ 趋近（关机时压力回到平衡值、温度回到环境值）。时间用舞台的运转时钟（暂停时冻结），面板 4 Hz 刷新，不逐帧重渲。不加随机抖动（截图可复现）。

### 7.4 镜头预设（`views.presets`，§8 G7）

VIEW 组 = 命名预设 + ORBIT + REF.（章节镜头不再进 VIEW 组，与 TimeScene 一致；状态行写 `CHAPTER 03 VIEW`）。数字键 1–6。起点值，R6 镜头轮调：

| # | id | label | position | target | fov | 用途 |
|---|---|---|---|---|---|---|
| 1 | `hero` | HERO | (2.6, 2.1, 3.6) | (0.0, 0.85, 0) | 34 | 3/4 前右上，两台机都在、模型占画面宽 70–80 %，封面 |
| 2 | `indoor` | INDOOR | (−0.2, 1.75, 1.3) | (−0.62, 1.42, 0) | 30 | 室内机近景 |
| 3 | `outdoor` | OUTDOOR | (1.5, 0.75, 1.5) | (0.62, 0.30, 0) | 30 | 室外机近景（压缩机仓可见） |
| 4 | `line-set` | LINE SET | (1.4, 1.2, −1.6) | (0.3, 0.8, −0.1) | 32 | 从墙外背后看管线走向 |
| 5 | `cutaway-side` | CUTAWAY | (0.0, 0.95, 3.2) | (0.0, 0.85, 0) | 28 | 正面长焦，配 C 看剖面（预设只管镜头，C 另按） |
| 6 | `exploded` | EXPLODED | (2.9, 2.4, 4.2) | (0.0, 0.9, 0.1) | 36 | 框住爆炸后的包络（`views.exploded.camera` 也用它） |

`views.cutaway`：`{ normal: [0, 0, −1], offset: 0 }`（切掉 z > 0 的前半，两台机各保留约 50 % 外壳，墙也被切出剖面）。

### 7.5 模式组合

| 组合 | 行为 |
|---|---|
| X-RAY + FLOW | 本主题的主要读法（第 03、04 章）：外壳、鳍片、管子透明，机器实心（G4），粒子可见 |
| CUTAWAY + FLOW | 冷媒流随管子一起被切；空气流 `clip: false` 不切 |
| EXPLODED + FLOW | 引擎现状：流路径不随零件拆开移动，粒子会飘在空中。**禁用**：EXPLODED 时 FLOW 按钮禁用、状态行写明（与 REFERENCE 的锁定同一机制）；或 E 时自动关 run。施工代理选前者 |
| hide + EXPLODED | 被隐藏的零件拆开时仍隐藏 |
| REFERENCE | 引擎现有：停运转、收爆炸、隐藏流 |

## 8. 引擎缺口（已查代码，未改）

优先级：**必须** = 不做就达不到本 spec；**应该** = 不做有退路但明显降质；**可选**。

**G1（必须）SpaceScene 演示节拍。** 现状：宿主只拥有 HUD 隐藏、`applyState`、`controls.beats` 契约、`__atlas.beats / goToBeat / setAutoplay / setVoice` 和 `pnpm shoot --beats`；**字幕卡、两级进度条、自动播放、语音（`time-scene/lib/speech.ts`）、音频、拍键捕获、进入前场景的保存与恢复全部写在 `time-scene/View.tsx`**（约 365–520 行与 1040–1177 行），SpaceScene 一样都没有；SpaceScene 的章节 state schema 是 strict，连 `summary` 都不接受（宿主的 `chapterSummary` 已经会读它）。最小方案：
- 抽出 `src/engines/core/presentation/`：`usePresentation({ beats, applyBeat, onEnter, onExit })`（拍序、自动播放、语音队列、音频预加载、键盘、快照恢复）+ `<PresentationCard>`（表头 / 字幕 / 进度条 / 两个勾选框；表头的日期段可空）；`speech.ts` 移到 `src/lib/speech.ts`。TimeScene 改用它，行为逐项不变（ww1 / ww2 的 e2e 与 `--beats` 全绿是验收）。
- SpaceScene：`spaceChapterState` 加 `summary`、`question`、`beats: spaceBeat[]`，`spaceBeat = { view?, part?, explode?, run?, cutaway?, camera?, layers?, labels?, hide?, caption, audio? }`；`spaceChapterRefs` 把拍里的 `part / layers / labels / hide` 也纳入校验。注册模式 `presentation`（P，`phone: false` 否），演示中：停 ORBIT、退出 REFERENCE、舞台盖透明点击层（拖动不转模型）、引线只标这一拍的 `labels`（上限 6、字号 +20 %），引线避让只看字幕卡和标题块。
- `pnpm shoot --beats` 对 SpaceScene 用 `labels`（而不是 `highlight`）核对"这拍要标的零件有没有标上"。

**G2（必须）按章 / 拍隐藏零件。** 现状：可见性只由组（`layers`）、`isolate` 决定（`lib/visibility.ts`），没有逐零件开关；外壳和内件都是实心积木，不隐藏就看不见里面。最小方案：章节与拍的 `hide: kebabId[]`，**不累积**（同 `labels`），不进 store / URL（舞台从当前章或当前拍读，拍的值放进 space `ui` store）。隐藏 = 沿自己的 explode 方向移出 0.25 × dist 再 .6 s 淡出（master-spec G"先开后淡出"），反向同理；隐藏的零件不投影、不可点、不标注、不进 `labelBudget`；ARCHITECTURE 面板画成虚线框。`resolvePartDisplay` 加一个 `hidden` 集合，单测补上。

**G3（必须：stops、ends、count；应该：size、spread、clip）流的参数。** 现状见 §4 开头。最小方案（都在 `flowSchema` + `Flows.tsx` + `flowMaterial.ts`）：
- `stops?: [{ at: 0..1, color: colorRef }]`（≤ 6 个），顶点着色器按粒子 `u` 在 uniform 数组里插值（线性 RGB）；没有 `stops` 时用 `color`。图例画成渐变色条（`Legend` 的 `kind: 'arrow'` 加 `colors?`）。
- `ends?: 'fade' | 'open'`，`open` 时 `vAlpha = 1`（首尾相接的分段流）。
- `count?`（默认 360，上限 1,024）、`size?`（相对主题默认粒径的倍数）、`spread?: number | [x, y, z]`（抖动半径，标量为球、数组为世界轴向的盒），`clip?: boolean`（默认 true；false = 不受剖切面影响）。
- 64 个烘焙点对本主题够用（盘管只画 2–3 程）；不改。

**G4（必须）X-RAY 的外壳 / 内核区分。** 现状：X-RAY 时除选中零件外**全部** .15 透明（docs/08 §10 已记为遗留）。最小方案：零件 `xray?: 'ghost' | 'solid'`（默认 `ghost`），`solid` 的零件在 X-RAY 下保持实心；`resolvePartDisplay` 一处改动 + 单测。管子、鳍片、外壳是 ghost，所以管里的冷媒粒子可见（透明件不写深度）。

**G5（必须）数据驱动的规格行与标题块声明。** 现状：SpaceScene 只注册 PARTS / GROUPS / FLOWS 三行；标题块声明是全站固定文案 `hud.note`（"Educational visualization"）。最小方案：`parts.json` 顶层 `spec?: [{ id, label: Bilingual, value: string, mono?, source?: 'fact'|'ref'|'reconstruction'|'simulated' }]`（≤ 5 行；有它时引擎只保留 PARTS 行）；`topic.yaml` 可选 `note?: Bilingual` 覆盖标题块声明（两个引擎通用）。规格行总数超 8 时宿主先去掉值为 0 的 SYLLABUS 行。

**G6（必须）STATE 面板的模拟读数。** 现状：`StatePanel.tsx` 固定 RUN / FLOW / ANIMATIONS / VIEW / EXPLODE 五行。最小方案：`parts.json` 顶层 `telemetry?: [{ id, label: Bilingual, unit: string, idle: number, run: number, tau: number, decimals?: number }]`（≤ 6 行）；舞台在 `bridge` 上暴露运转时钟，面板按 §7.3 的公式算，4 Hz 刷新；有 `telemetry` 时面板 = RUN + 这些行（都带 SIM 芯片）。

**G7（应该）命名镜头预设与 `<FlyTo>`。** 现状：SpaceScene 的 VIEW = 各章镜头 + ORBIT + REF.；没有命名预设；`<FlyTo preset>` 只认 TimeScene 的 `presets.json`。最小方案：`views.presets?: [{ id, label: Bilingual, camera }]`；有它时 VIEW = 命名预设 + ORBIT + REF.（章节镜头退出 VIEW 组，与 TimeScene 同一产品决定），否则维持现状；校验器让 `<FlyTo preset>` 在 SpaceScene 主题里认这些 id。退路：VIEW = 5 个章节镜头 + ORBIT + REF.，§7.4 的 indoor / outdoor / line-set 只出现在节拍里。

**G8（应该）零件链路卡。** 现状：`partChain` 给**每个**组建一列（04、05 会是空列，列宽降到约 55 px，名字被截）；行高 23 固定（室外 17 行 → 卡高约 420 设计 px）；运转时只给"组内有流"的连线着色，本主题的流组没有零件，所以卡片不会动。最小方案：没有零件的组不出列；最长列 > 10 行时行高降到 16；流可选 `parts?: kebabId[]`，运转时把链上相邻零件之间的连线染成该流颜色并步进（有 `stops` 时取对应位置的颜色）。另可加 `cardToggle`（与 TimeScene 相同的展开 / 收起）。

**G9（应该）context 零件与投影开关。** 现状：每个零件都可选、可标注、进链路卡和零件计数；投影只按包围半径自动判断（长管子、墙都会投影）。最小方案：零件 `context?: true`（不可点、不标注、不进卡片与计数、不拆开、ARCHITECTURE 画斜线填充、不投影）和 `shadow?: boolean`（覆盖自动判断）。墙就是 context 零件；三根长管设 `shadow: false`。

**G10（应该）带孔的板。** 现状：积木都是实心体，不能开孔；室外机前面板的圆形出风口只能用三条板拼。最小方案：工程零件 `panel { size: [w, h, t], bevel?, holes?: [{ at: [u, v], radius }] }`，用 `Shape` + 孔 + `ExtrudeGeometry`（或 ShapeGeometry 正反面 + 侧边条带，量包体增量 ≤ 6 KB gz）。同一零件也可用于室内机出风口。

**G11（应该）零件的来源与细节分段。** 现状：`detail` 已存在且必填，Inspector 在"Tell me more"后显示一段；零件不能带来源号。最小方案：零件 `sources?: string[]`（S 编号，校验存在），Inspector 在 detail 后画 mono 上标（复用 `SourcePopover`，与事件同一机制）；`detail` 里的空行分段渲染成多个段落。

**G12（应该）组标注。** 现状：引线标注只能指向零件；第 01 章想标的是"室内机 / 连接管 / 室外机"三个整体。最小方案：章 / 拍的 `labels` 可写组 id，锚点 = 组内可见零件包围盒中心，文字 = 组名 + 组的 `summary?`（`groupSchema` 新增可选 `summary`）。退路：标 front-panel、insulation、outdoor-front，summary 写成整机说明。

**G13（必须，小）控制面板的名词行。** SpaceScene 的 `ExplorerOverlay` TOOLS 里没有 `{ kind: 'glossary' }`（TimeScene 有）。有 `glossary.json` 时加上。

**G14（可选）`brass` 材质族。** 截止阀和喇叭口螺母是黄铜；现在只能用 `copper`。

**G15（可选）脚手架。** `scripts/new-topic.ts` 只支持 `--engine time-scene`；本主题手工建目录，或给脚手架加 space-scene（`parts.json` 最小合法 + 章节 state 示例 + beats 示例）。

**G16（随 G1）EXPLODED + FLOW 的组合。** 流路径不随拆开移动；按 §7.5 显式禁用，状态行说明。

**(d) section 平面**：已有（`views.section.plane`，ARCHITECTURE 立面与 REFERENCE 共用），无需改；本主题用 `xy`。**(e) 零件 detail**：已有（必填，Inspector 已显示），只需 G11 的来源与分段。

## 9. 来源计划（≥ 25，P# → 施工时的 S#）

规范同 docs/09 §6：每条数字一条来源；冲突并列；只看到搜索摘要的在 `note` 里写明并列入 §12。厂商资料一律当"典型"引用，正文和 HUD 不出现品牌名。

| P# | 内容 | 候选来源 | 用于 |
|---|---|---|---|
| P1 | R32 饱和压力、温度、焓、潜热 | NIST Chemistry WebBook SRD 69，Difluoromethane（CAS 75-10-5）流体性质表 | F-4–F-6、SIM |
| P2 | R32 临界点、沸点、摩尔质量 | CoolProp 文档 R32 页（交叉核对 P1） | F-4 |
| P3 | 安全分类 A2L | ASHRAE Standard 34 冷媒命名与安全分类页 | F-2 |
| P4 | GWP 675 / 677；R410A 2088 | IPCC AR4 WG1 第 2 章表 2.14；AR5 WG1 第 8 章附表 | F-3 |
| P5 | R32 安全数据表 | 冷媒生产商 SDS（Daikin Chemical / Chemours / Arkema 任一） | 第 03 章细看 |
| P6 | 强制能效标签（MELS） | NEA 官网 Mandatory Energy Labelling Scheme 页 | F-26 |
| P7 | 最低能效标准（MEPS） | NEA 官网 MEPS 页（含现行空调阈值表） | F-10、F-26 |
| P8 | 建议设定 25 °C | NEA 节能建议页（household energy-saving tips） | F-22 |
| P9 | 空调占家庭用电比例 | NEA / EMA 家庭用电研究或 Singapore Energy Statistics | F-25 |
| P10 | 家用空调冷媒 GWP 上限 | NEA 2022 年公告（climate-friendly household air-conditioners） | F-1 |
| P11 | 新加坡气候 | Meteorological Service Singapore「Climate of Singapore」 | F-24 |
| P12 | 课纲对齐 | MOE Primary Science Syllabus（2023） | §1.3 |
| P13 | 蒸气压缩循环、COP 定义、定频电机转速 | Çengel & Boles《Thermodynamics: An Engineering Approach》制冷循环章 | 第 03、05 章 |
| P14 | 制冷循环与典型工况 | ASHRAE Handbook — Fundamentals（热力学与制冷循环章） | F-13 |
| P15 | 分体机、显热比、出风温度 | ASHRAE Handbook — HVAC Systems and Equipment（单元式空调 / 无风管分体机章） | F-21、SIM |
| P16 | 分体机结构（科普） | US DOE Energy Saver「Ductless, mini-split air conditioners」 | 第 01 章 |
| P17 | 空调原理（科普） | US DOE Energy Saver「Central air conditioning」/「Room air conditioners」 | 第 02、03 章 |
| P18 | 典型规格（容量、功率、风量、外形、充注量） | 三家主流厂商新加坡站 2.5 kW 级壁挂分体机规格书，取区间 | F-8–F-10、F-16–F-20 |
| P19 | 安装：管径、管长、预充、力矩、保温、滤网清洗 | 同级机型的安装说明书与使用说明书 | F-14、F-15、F-23 |
| P20 | 系统图（EEV 位置）、风扇转速表 | 同级机型的维修手册（refrigerant circuit diagram） | F-13、F-14、F-19 |
| P21 | 变频转子式压缩机转速范围 | 压缩机厂商产品目录（直流变频转子式） | F-12 |
| P22 | 贯流风扇 | 风机厂商技术资料或 ASHRAE Handbook 风机章 | F-19 |
| P23 | 水的汽化潜热 | NIST Chemistry WebBook，水的饱和性质 | F-7 |
| P24 | HFC 削减 | UNEP 臭氧秘书处：基加利修正案；新加坡批准情况 | 第 05 章 |
| P25 | R22 等 HCFC 淘汰 | UNEP：蒙特利尔议定书 HCFC 时间表 | 第 03 章细看 |
| P26 | 全球制冷用电 | IEA《The Future of Cooling》（2018） | 第 05 章细看 |
| P27 | 组屋空调安装 | HDB 关于空调平台与安装的规定页；家庭拥有率用 DOS Household Expenditure Survey | 第 01、04 章 |
| P28 | 安装与维修人员资质 | NEA / BCA 对空调安装、冷媒处理人员的要求（施工时确认主管机构） | 第 01、05 章 |
| P29 | 电价 | SP Group 当季住宅电价公告（写明季度） | 第 05 章细看 |
| P30 | 额定工况 | ISO 5151:2017（T1 工况）摘要页或厂商规格书脚注 | F-11 |

## 10. 施工顺序、分工与验收

**前置**：Gavin 定稿本 spec（§11）。CLAUDE.md：依赖由主会话预装，子代理不改 `package.json`；并行时划清文件归属。

| 步 | 内容 | 谁 | 文件归属 | 完成标准 |
|---|---|---|---|---|
| E1 | G1 抽出 `core/presentation/` + `speech.ts` 迁移；TimeScene 改用（行为不变） | Opus（引擎） | `src/engines/core/presentation/**`、`src/lib/speech.ts`、`src/engines/time-scene/View.tsx`、`time-scene/lib/speech.ts`（删） | ww1、ww2 `pnpm shoot --beats` 与 e2e 全绿；docs/06 更新 |
| E2a | G2–G6、G8–G11、G13、G14 的 schema、舞台、面板（不碰 `space-scene/View.tsx`） | Opus（引擎，与 E1 并行） | `space-scene/schema.ts`、`lib/**`、`stages/**`、`hud/**`、`explorer/**`、`content/schema/topic.ts`、`core/Hud.tsx`（note） | 单测；sample-space 不回归（截图对比） |
| E2b | G1 的 SpaceScene 一侧、G7、G12、G16：节拍注册、P 模式、命名预设、组标注、`--beats` 的 labels 核对 | Opus（引擎，E1、E2a 之后） | `space-scene/View.tsx`、`hud/LeaderLabels.tsx`、`scripts/shoot.ts`、`scripts/validate*` | sample-space 加两拍示例数据通过 `--beats`；docs/06 SpaceScene 节更新 |
| D1 | 主题目录、`topic.yaml`（`status: draft`）、`parts.json`：33 零件、组、流、动画、views、presets、spec、telemetry；章节 frontmatter 存根（state + summary，正文只放 `<Lang>` 空壳不发布） | Opus（数据 + 几何） | `src/content/topics/aircon/**` | `pnpm validate` 0 error |
| D2 | R2 几何与比例（§3.1 包络、Tier-1：两台机外形、风扇开口、盘管、压缩机仓、管线走向；穿模检查）→ R3 材质与灯光（hero-clean 能当封面）→ R4 流与动画（§4、§5；粒子不穿实体，冷媒四段接缝无空档，流开启 +7 calls） | Opus（视觉） | 同 D1 的 `parts.json` | 每轮 `pnpm shoot aircon` 截图自证，列差异、直接修 |
| T1 | `sources.json`（≥ 25，逐条读原文，§1.2 的"待核"全部落定或删去）、`glossary.json`、零件 summary / detail（EN/ZH） | Opus（事实）；中文 Opus 初稿 | `data/sources.json`、`data/glossary.json`、`parts.json` 的文本字段（D2 结束后接手该文件） | `pnpm tsx scripts/sources-md.ts aircon`；事实表与来源一一对应 |
| T2 | 五章正文 + 细看（Gavin 定稿后） | Opus | `chapters/*.mdx` 正文 | 字数、`<Num>`、`<Term>` 首现；Gavin 看第 03 章样章后再铺开 |
| B | 每章节拍（§6）与字幕（EN ≤ 45 词，可朗读，无括号缩写） | Sonnet | `chapters/*.mdx` 的 `state.beats` | `pnpm shoot aircon --beats` 无失败、无未标注 |
| P | R5 HUD 排版（规格行、卡片、三面板、标注两列）→ R6 镜头与模式组合 → R9 审计（事实：所有带数字的 UI 字符串有来源或带 SIM；代码：无 TODO / 死代码 / console 噪音） | Opus（视觉）+ Sonnet（QA） | 视需要 | 下表全勾 |
| 发布 | `status: published`；docs/04 空调大纲改为本 spec 的 5 章；本文补"实现记录 / 已知差距" | 主会话 | | 门槛全绿；push 等 Gavin |

**验收清单**

- [ ] `pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e` 全绿；`pnpm shoot aircon --layout --keys` 通过；`--beats` 无失败。
- [ ] 两套主题（paper / cinema）× 两种语言每章截图；dark plate 下 `powder` 外壳不发灰到读不出（docs/08 §10 遗留，必要时调材质族）。
- [ ] `hero-clean`（HUD 关）能当作品集封面：两台机都在、主体占宽 70–80 %、阴影完整、无穿模。
- [ ] draw calls：静止 < 50、运转 < 60（上限 100）；三角形 < 0.3 M；运转开启增幅 < 10。
- [ ] 引线标注可读：两列对齐、不压面板、近景减量；每章 `labels` 里的零件在章节镜头下都有标注（`--beats` 的 chapter highlights 列表为空）。
- [ ] 手机（390 × 844）：舞台 + 章节芯片 + 底部控制；节拍字幕卡不溢出；触控目标 ≥ 44 px。
- [ ] X-RAY + FLOW 下冷媒四段颜色连续、接缝无空档；液体段明显比气体段密而慢；空气流不穿过实心零件。
- [ ] 规格行、STATE 读数、正文数字与 §1.2 一致；正文没有未标"模拟"的模拟数字。
- [ ] 无品牌名、无型号、无照片；标题块声明为"通用设计研究"。

## 11. 待 Gavin 确认

1. §0 决策表：单冷、EEV 在室外机、5 章结构（第 04 章合并、第 05 章"效率与使用"），docs/04 大纲随之改。
2. 示意布局（两台机都朝向观者、中间一段墙剖面、管线缩短）是否可以；还是要更写实的"室内机贴墙、室外机在墙外平台"（会让 hero 只能看到一台机的正面）。
3. 测验：默认不做；若要，每章一题，放在正文末。
4. 零件 33 个（brief 约 28）：删减顺序见 §3.2。
5. 颜色语义：冷媒与空气共用"热 / 接近室温 / 冷"三色，物态用疏密和速度表达（不用第四种颜色表示"温液体"）。
6. 第 05 章是否提及李光耀关于空调的说法（必须核到原文出处才用）。
7. 外壳材质：室内机 `plastic`（暖砂色哑光），室外机 `powder`（黑色）——真实产品多为白色；在纸色底上，白色外壳对比弱。是否接受这一设计研究的配色，或加一个"暖白烤漆"材质族（与 G14 一起）。

## 12. 已知风险：SpaceScene schema 对写实空调的限制

- **实心积木**：所有 primitive 都是实心体，不能做薄壳、开孔、折边。外壳靠拆成薄板（§3.2）、出风口靠 G10；没有 G10 时室外机前面板的圆孔用三条板拼，近景可见接缝。
- **没有弯曲的盘管**：真实蒸发器是 2–3 段折成弧形包住贯流风扇，室外冷凝器常是 L 形；`fins` 只能叠直板，用两片倾斜的平板和一片背板近似。
- **鳍片密度**：`fins` 上限 256 片；真实片距 1.2–1.8 mm（0.7 m 宽约 400–600 片），而且那么密会在截图里出摩尔纹。模型用约 4.5–4.8 mm 的可视片距，detail 里写明真实值。
- **没有曲面叶片**：贯流风扇的前弯叶片、轴流风扇的扭曲叶片只能用倾斜的薄板；叶片数也按可读性取（24 片 vs 真实约 35 片）。
- **单一剖切面**：一个平面同时切两台机和墙；室内机与室外机不能各自选最好的剖切位置。
- **流不随拆开移动**：EXPLODED 与 FLOW 不能同开（§7.5）。
- **没有贴花与文字**：能效标签、铭牌、遥控器屏幕都不能出现在模型上，第 05 章只靠正文。
- **材质族**：没有白色塑料 / 烤漆钢板、没有黄铜（§11-7、G14）；颜色只能用 token，不能写产品本色。
- **动画只有三种**：没有铰链开合（前面板"掀起"用 G2 的位移 + 淡出代替）；压缩机内部的滚动活塞偏心运动做不出来，用转子磁钢的转动表示。
- **路径烘焙 64 点**：冷媒在盘管里只能画 2–3 程，不能逐根追 U 形弯头。

## 13. §11 的决定（2026-10-10，主会话代 Gavin 按既定原则拍板）

1. 单冷、EEV 在室外机、5 章结构：照办；docs/04 发布时改。
2. 示意布局（两台机朝向观者、中间墙剖面、管线缩短）：采用，标题块注明"示意布局"。
3. 测验：不做（既定原则：无儿童化设计）。
4. 33 个零件：保留。
5. 三色语义 + 疏密速度表物态：采用。
6. 李光耀的说法：核到原文出处（1999 年访谈或新加坡档案）才用，否则不提。
7. 外壳材质：新增 `enamel` 材质族（暖白烤漆，微哑光，hairline 边线保证纸底上的对比），室内机用它；室外机用浅灰 `powder`（不是黑）。与 G14 一起做。

## 14. 施工记录（D1 · D2，2026-10-10）

**D1 数据骨架**：`src/content/topics/aircon/`：`topic.yaml`（draft、paper、`note` 加"示意布局"、`tags: [singapore]`）；`data/parts.json`：34 个机器零件 + 1 个 context 墙，5 组，7 条流，4 个动画，`views`（assembled / exploded 镜头、`cutaway` z 平面、`section: xy`），6 个命名预设，`spec` 4 行，`telemetry` 6 行；`sources.json` / `glossary.json` 为空壳；5 章存根（完整 `state`、草稿 `summary`、正文一段占位，无 beats）。零件 `name` 定稿；`summary` / `detail` 是标了 "T1 draft" 的占位。`scripts/new-topic.ts` 只支持 time-scene（G15 未做），目录手工建。

**与 §3 / §4 / §7 的差异（都为几何或校验原因）**

| 项 | 改动 | 原因 |
|---|---|---|
| 零件数 | 33 → 34 + 墙：加 `liquid-pipe`（室外液管：冷凝器出口 → EEV → 液阀）、`partition`（隔板，电控盒装在上面）、`fan-bracket`（电机支架） | 没有液管时 `ref-warm-liquid` 悬空走；电控盒、风扇电机不加支撑会浮在空中 |
| 布局 | 室内机下移 0.23 m、左移 0.18 m（中心 (−0.80, 1.22)）；墙高 1.45 m、z −0.27…0.15；室外机 y 0…0.55 坐在平台上（底盘就是底） | 整体更宽更矮，hero 构图能放下两台机；原表底盘悬空 3 cm |
| 管线 | 管束 z −0.20 一条中心线（液 −0.191 / 气 −0.209，统一弯半径 0.04），沿墙外下到平台再从机后到右侧阀门；机内铜管弯半径 0.02；保温层从室内机背后竖段开始 | 偏移垂直于所有弯曲平面，三根管同心；平台贴地走避开室外进风 |
| 截止阀 / 喇叭口 | x 1.026 / 1.05（原 1.02 / 1.035） | 原值与右侧板相交 |
| EEV | (0.978, 0.105, −0.06)，套在液管竖段上 | 与液管成一体；原位置无管可接 |
| 蒸发器 | 140 片 × 2（原 150），前片 −12°、后片 49°，倒 V 包住风扇 | 让出右端电控盒和接管空间 |
| 滤网 | 倾角 8°（原 20°） | 20° 时与进风格栅相交 |
| 导风板 | 绕 X +25°（前缘向下） | 原 −25° 前缘上翘，挡住出风 |
| 冷凝器 | 160 片、高 0.49；U 形弯头 11 个 | 避开顶盖与侧板 |
| 动画 | 4 个（去掉 `eev-adjust` 脉动） | brief 定 4 个；示意性脉动不是真实动作（master-spec G） |
| 预设 id | `hero`、`indoor-unit`、`outdoor-unit`、`line-set-rear`、`cutaway-side`、`exploded-view` | `indoor` / `outdoor` / `line-set` 与组 id 冲突（校验器全主题 id 唯一） |
| 规格行 | 4 行（类型、冷媒、制冷量、输入功率），风量只在正文 / STATE | `spec` 上限 4 |
| 冷媒分段 | `ref-warm-liquid` 延到液阀，EEV 处用 stop 变冷；`ref-cool-gas` 全程 cold（"末段混 35 % neutral"无法用 token stop 表达） | 64 点烘焙下 EEV→阀门的 S 弯会偏出管外 |
| 室外空气 | 两股分在电机支架左右（x 0.42 / 0.58） | 不穿支架、不穿面板、不碰电机 |
| 投影 | 室内机各件、保温层、排水管、两根铜管不投影；墙投影 | 地面是室外平台，室内机投在上面读作悬空 |
| 外壳色 | 室外机 `powder` + tint `#b3b6b1`（浅灰） | token 会随主题翻成深色；产品本色用 hex，与 docs/06 示例一致 |

**D2 三轮**：R2 用脚本做零件 OBB / 管段球体干涉检查（静止与全拆开各一遍），剩下的只有前后蒸发器顶点 0.8 mm 相接（同一盘管）和圆柱按盒近似的假阳性；空气流对实体（外壳、导风板、接水盘、电机、支架）全部净空。R3：enamel 暖白室内机、浅灰粉末室外机、铜管、黄铜阀、黑橡塑保温、铝鳍片、黑压缩机；dark plate 下两台机都清楚，黑保温层偏暗但可辨。R4：四段冷媒首尾坐标完全相同、`ends: open`；液体段 300 粒/m、0.20 m/s，气液 200 粒/m，气体 75–110 粒/m；64 点烘焙在弯头处最多偏 15–20 mm（引擎限制）。

**计数（1600×900，--gpu）**：hero 静止 39 calls / 0.105 M tris；FLOW 开 46 calls（+7）；X-RAY 43；第 03 章（X-RAY + 冷媒流）37。截图 `docs/screenshots/aircon/`。

**引擎问题（未改引擎）**：① 同一 tick 内 `setPreset` 后紧跟 `setMode`（`pnpm shoot` 的 `preset` + `modes`）镜头停在上一张图的位置，截图里用 `js` 延 400 ms 设预设绕过；② VIEW 组 = 5 个章节镜头 + ORBIT + REF. + 6 个命名预设，数字键只到 9，后 4 个预设没有快捷键；③ 1600×900 带 HUD 时引线标注空带太窄，第 01 章三个组标注都不出（`--beats` 阶段要复核）；④ HUD 开 / 关舞台宽度不同、镜头不重新取景，同一 hero 镜头在 HUD 下约占舞台 70 %，hero-clean 只约 55 %（达不到 70–80 %，要做需要"封面镜头"概念）。
