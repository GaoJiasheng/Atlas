# 49 · 板块与灾害地图 · 内容施工 spec（v1）

`plates-and-hazards` · TimeScene / GeoStage · 2026-10-27。paper 默认，cinema 可切。EN **Plates and hazards** / ZH **板块与灾害地图**；`subject: geography`，`tags: [beyond-syllabus, singapore, map]`，`status: draft`，`sensitivity: open`。依 docs/next-batch.md §一，本题含死亡数字，**施工完成也保持草稿，Gavin 读过敏感中文后才可上线**。本文件是内容与引擎施工依据，不表示功能已经实现。

只定稿本 spec；不建主题、不改引擎、不改其他文件。准备输入只读：`/Users/gavin/work/atlas/art/research/plates-and-hazards/`；父卷实际文件为 `/Users/gavin/work/atlas/art/research/volcanoes-and-earthquakes/volcanoes-and-earthquakes-research.md`，另有 `facts.json`、`datasets.json`、`sources.json`。`Fnn` 保留父卷事实 id，`PHnn` 保留本题 facts-extra id；施工来源映射见 §6。遵循 docs/10、history skill、docs/08 §2；格式参考 docs/42 的引擎实查及 docs/43 §0.4、§9。

## 0. 定稿决策与核查

### 0.1 代定事项（供 Gavin 后续审阅）

| # | 默认决定 / 具体边界 |
|---|---|
| 1 | 背景 + 7 章、38 拍（4+5+5+5+5+4+5+5），1815-04-10—2024-12-31；地图与公历事件归本题，内部机制、深时与 Wegener 归 `inside-the-earth`。只链 sibling slug；其章节落地前不编 `ch`。 |
| 2 | 地理拓展，不宣称 PSLE 必考；不复制未再次获取的 MOE 课纲原句，不把研究中的课程关联变成考纲要求。 |
| 3 | PB2002 与 Natural Earth 全程是现代参考，GVP 是 2026 目录快照；不画板块在公历年代大幅漂移，不复原 1815/1883 岛岸。[F03,F04,F54,F56,PH04] |
| 4 | 地震仅用冻结的 2000–2024、目录 M≥6 样本；各条保留 magType。目录不是同质 Mw、灾害率或预测。[F27,F29,PH04] |
| 5 | `entities: []`、`movements: []`；7 个空控制帧；不配置 blocLabels，不借战争阵营命名板块。章节/拍不写 borders。 |
| 6 | 保留 Tambora 的 >70,000 与 92,000 两个归属明确的估计，Krakatau 约 36,000（细看 36,417），2004 年 227,899、15 国、死亡或失踪并推定死亡、来源 2024-10 同屏。无排行、增长动画或对抗配色。[F35,F36,F40,F41] |
| 7 | 2004 四国表明确不完整；227,343 与差额 556 仅内部算术验收，不再放正文或生成“其他国家”记录。[PH07] |
| 8 | NCEI 只发布观测位置、关联事件与原类型码；测量类型字典未逐类核验，**本版不展示高度数值/高度色带**。这已是确定范围，不留待施工者自行决定。观测按源事件日整体出现，提示并非到达过程。[PH06] |
| 9 | 火环用 MSS/GVP 两段定义与真实点线说明；GVP 的 687/1,214、57% 只放细看并带 v5.4.0。无自造圈、多边形或 membership 统计。[F15–F18] |
| 10 | 中文常用名用坦博拉、喀拉喀托、喀拉喀托之子、基拉韦厄、巽他板块。父卷仅部分词有新加坡来源；这些地名本轮没有新加坡华文用例，属编辑默认，首次附英文。其他目录专名保留官方原名、中文字段与解释，不自动翻译千余专名。 |
| 11 | 镜头、简化容差、符号半径与比例皆为编辑/显示参数，记 S608，不作自然界测量。新加坡 [103.82,1.35] 是方位锚点，非观测站。模型计算值不进入学生数字，速度公式交 sibling。[PH04] |
| 12 | 只用 §7 已有三图；本轮逐张打开核对。无人、无伤者、无血腥；两幅机制图标明示意与夸张，不充当历史复原或地理证据。 |
| 13 | 引擎只保留 E-PH1、E-PH2。删 through-day/event-linked 新时间模式，改用现有十进制年 f；PB 分类由四个数据子层复用现有颜色/图例，不建新分类渲染器。详 §4 实查表。 |

### 0.2 敏感段落与确定措辞

Gavin 上线前阅读：01 间接死亡与不同估计、02 海啸死亡、04 总数定义与四国分项、06 BCA 指引。事件设 `sensitive: true` 仅作元数据。死亡普通叙述、静态 Counter；不渲染伤者或用音效、惊叹号煽情。[F35,F36,F40,F41,F60]

- 01：USGS 的一篇说明记载周边地区超过 70,000 人死亡；另一张 USGS 表列 92,000，并把饥饿列为主要死因。两种历史估计各有出处，不能平均或当成统计置信区间。[F40]
- 02：约 36,000 人死亡，主要由于海啸；36,417 是该 USGS 表并列的历史估计。[F41]
- 04：NOAA/ITIC 2024 年 10 月的汇编记载，15 个国家共 227,899 人死亡或失踪并推定死亡；该汇编不能把地震与海啸死亡完全拆开。[F35]
- 06：BCA 说明新加坡建筑按抵御远处地震震动设计；其室内指引包括到桌下掩护、不使用电梯。仅作注明来源及读取日期的转述，链接官方原页。[F44,F60]

### 0.3 事实复核表（2026-10-27）

核查单元为事实 id：父卷 61 条 + 本题 7 条，共 68 条；**verified 45、changed 4、cut 19**。cut 包括主动移交 sibling/删除范围，非指原事实错误。准备稿没有逐条 ⚑ 符号；按 BRIEF3 把所有学生数字、死亡、分歧与安全措辞仍全部复核。以下来源号均为 §6 可点击原页；未引原文长句，正文用原创转述，每源逐字引文不超过 25 词。

本轮经 Web 获取 USGS/NOAA/GVP/MSS/EOS/BCA/BGS/HKO/CEDD/NPS 原页、两份 NOAA PDF 与 BCA 中文名表；USGS API、NCEI API 用普通 HTTP 获取并解析。PB/GVP/USGS/NCEI 冻结文件另在内存重算（不改研究输入）。最新目录与冻结目录分开，发布仍采用 INVENTORY 的 2026-10-26 字节。直接 USGS Understanding 页面 403，运动分类改由已取到的 NOAA S07、PB 原始说明及 CEDD S45 核对，不冒称读到被挡原页。

| fact id | 结论 | 核实结果 / 最终落点 | 原始来源（§6） |
|---|---|---|---|
| F01 | verified | 岩石圈含地壳和刚性上地幔。 | S07 |
| F02 | verified | 地幔大部为固体，可在长时段变形。 | S06 |
| F03 | verified | 相对运动通常每年几厘米；不作公历大陆漂移。 | S06 |
| F04 | verified | 板块与海岸/大陆轮廓不同。 | S07 |
| F05 | cut | Wegener 年代交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F06 | cut | 漂移证据交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F07 | cut | 科学史机制之争交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F08 | cut | 磁条带交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F09 | cut | GPS 教学交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F10 | verified | 相离、汇聚、转换；宽边界区以 PB orogens 标明。 | S07,S37 |
| F11 | verified | 相离与海底扩张。 | S07,S37 |
| F12 | verified | 俯冲/大陆碰撞分开。 | S07,S45 |
| F13 | verified | 转换为主要水平错动。 | S45,S37 |
| F14 | verified | 水促进上覆地幔部分熔融；机制只链接 sibling。 | S45 |
| F15 | verified | 火环非单一连通结构。 | S11 |
| F16 | verified | MSS 含印尼，GVP 定义排除多数印尼火山。 | S11,S12 |
| F17 | verified | 已取统计表：v5.4.0，687/1,214，57%。 | S11 |
| F18 | verified | 夏威夷为板内火山例子。 | S45,S11 |
| F19 | verified | 岩浆/熔岩称呼与示意封面。 | S10 |
| F20 | cut | 岩浆储库剖面交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F21 | cut | 脱气机制交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F22 | cut | 黏度与喷发交 sibling。 | 父卷同 id 来源；不进入本题学生内容 |
| F23 | verified | 破火山口为塌陷地形；不扩展四种火山形状课。 | S45 |
| F24 | changed | 仅保留火山灰为细小岩石碎屑；删 2 mm 阈值与未取到的原文数字。 | S11 |
| F25 | verified | 断层突滑释放弹性应变能。 | S06 |
| F26 | verified | 震源与震中不同；点不表示全破裂区。 | S12,S44 |
| F27 | verified | 震级、烈度与不同 magType 不混同。 | S44 |
| F28 | cut | 不在地图题展示 32 倍能量定量关系。 | 父卷同 id 来源；不进入本题学生内容 |
| F29 | verified | 不能预报精确地点和时刻。 | S12 |
| F30 | verified | 海水位移产生系列长波；起因不只地震。 | S12,S13,S15 |
| F31 | verified | 浅海底逆冲位移可抬升水体。 | S14 |
| F32 | verified | 深海长波、近岸浅化；无数值传播。 | S15 |
| F33 | cut | 不展示水深—速度公式和演算数字。 | 父卷同 id 来源；不进入本题学生内容 |
| F34 | verified | HTTP 重取：Mw 9.1，深 30 km，[95.982,3.295]，2004-12-26 00:58:53.450 UTC。 | S54 |
| F35 | verified | PDF 表1/叙述：227,899；死亡或失踪并推定死亡；15 国；2024-10。 | S17 |
| F36 | verified | 表1：印尼 167,540、斯里兰卡 35,322、印度 16,269、泰国 8,212。 | S17 |
| F37 | verified | NOAA SOS >230,000/14 国；JetStream 17 国为影响范围，不能合并口径。 | S16,S609 |
| F38 | verified | MSS 9.2，与 USGS 9.1 逐源归属。 | S12,S54 |
| F39 | verified | GVP 264040、松巴哇、1812–1815 episode 16231、VEI 7；不编不确定起止日。 | S19,S604 |
| F40 | verified | HVO 2011-09-29 >70,000；USGS 表 92,000/主要饥饿。 | S22,S21 |
| F41 | verified | USGS Krakatau 行：约 36,000、历史值 36,417、主要海啸。 | S21 |
| F42 | verified | 2018-12-22 火山体崩塌海啸，与 1883 分开。 | S12,S603 |
| F43 | verified | MSS 广义欧亚；PB2002 独立 Sunda；属于模型分辨率差别。 | S12,S37 |
| F44 | changed | BCA 当前页明确远处震动与建筑设计；修正草稿的错误机构译名为官方中文“建设局”，不推成每栋楼绝对安全。 | S23,S611 |
| F45 | verified | 地层、建筑设计与共振影响响应；不给楼宇安全等级。 | S25 |
| F46 | cut | 不引用尚未全文核验的工程条款。 | 父卷同 id 来源；不进入本题学生内容 |
| F47 | verified | 相对屏蔽，有警示体系；不写零风险。 | S12 |
| F48 | cut | 不另展开 Pinatubo 灰影响新加坡案例。 | 父卷同 id 来源；不进入本题学生内容 |
| F49 | cut | 不提供时效性展馆参观信息。 | 父卷同 id 来源；不进入本题学生内容 |
| F50 | cut | 不把国外学习样本数字放学生正文。 | 父卷同 id 来源；不进入本题学生内容 |
| F51 | cut | 不放中学生研究人数。 | 父卷同 id 来源；不进入本题学生内容 |
| F52 | cut | 不放学习误区统计。 | 父卷同 id 来源；不进入本题学生内容 |
| F53 | verified | GVP 专门数据库条款与照片权利分别处理。 | S35 |
| F54 | verified | PB 转换明确 ODC-BY 1.0；原始 README 与分类文件已读。 | S37 |
| F55 | cut | 不采用 GEBCO 或水深数字。 | 父卷同 id 来源；不进入本题学生内容 |
| F56 | verified | Natural Earth 明确 PD。 | S39 |
| F57 | cut | 不采用古地理复原。 | 父卷同 id 来源；不进入本题学生内容 |
| F58 | cut | 本题不采用 GEM 活断层。 | 父卷同 id 来源；不进入本题学生内容 |
| F59 | verified | 本轮 USGS 重取仍 tsunami=0；与 2004 已知海啸不能机械等同。 | S54,S17 |
| F60 | verified | BCA 当前页室内两项：桌下掩护、不乘电梯。 | S23 |
| F61 | verified | NOAA：可波谷先到但并非必然、第一波未必最大；爬高区别波幅。 | S57 |
| PH01 | verified | EOS 原页：2022-02-25 新加坡可感；该页写 6.2。 | S601 |
| PH02 | verified | HTTP 重取 reviewed us6000gzyg：6.1/mww，深 4 km，[100.1006,0.219]，epoch 1645753166554。 | S602 |
| PH03 | verified | 四年份源 API 重取：613/1142/2439/5699 及源日期一致；1883 deaths=34417 与 deathsTotal=36417 不相加。 | S603 |
| PH04 | verified | 冻结表重算 PB 241/54/52/13/5824、唯一 SEQNUM 5819；GVP 1214/11089；USGS 3729 全 reviewed 且 M≥6。选定 episode/坐标以原始行核实。 | S604,S37 |
| PH05 | verified | 元数据限制/引用与政策 PDF 印刷 p3 §4a–c 重读；仅事实编纂表获采用，第三方附件除外。 | S605 |
| PH06 | changed | API page1 totalItems 再核 102/2177/410；冻结全页重算 99/2155/410 可绘。只发布位置和类型码，删所有未核类型的高度数字。 | S606,S605 |
| PH07 | changed | 四项和 227343、余数 556 重算；只在工程验收，学生表不显示差额。 | S607,S17 |

### 0.4 引擎现实核对结论

已读 `src/content/schema/topic.ts`、`src/engines/time-scene/schema.ts`、`lib/model.ts`、`lib/datedLayers.ts`、`stages/geo/{datedLayers,controller,leaders}.ts`、`View.tsx`、`EventInspector.tsx`、`hud/DatedLayerPlate.tsx`、`src/engines/core/{url-state,test-api,controls}.ts`、共享 HUD/Counter、SpaceScene sim/bindings 注册与 `scripts/{shoot,validate-content}.ts`。现有 sim 与绑定只作用于 SpaceScene 模型，不能解决 GeoStage 目录选择；本题无需调用新地球过程 sim。

已有 dated layers 强制有限 `f`，时间是十进制年（不是整数年），因此本题不另造日筛选器。已有统计接口为 `__atlas.stats().datedLayers[id]`，没有 `pick`/目录动作；现有 casualties 以实体 id 为键且恰两项会进 CounterVersus。已实现零实体不注册参与卡；docs/42 §9 旧“空卡框”差距在本 checkout 已修复，不能再开工作项。每项保留/删除及实现边界见 §4。

## 1. 范围、立场、必须讲对的事实

### 1.1 读者与写作

给一般读者、儿童与家长；后续每章正文 EN 200–300 词 / ZH 350–500 字，3–5 段；2–4 个细看。不设历史问答测验、分数或灾难游戏。首次出现术语即时解释；EN、ZH 独立成文。字幕 EN≤45 词，一拍一件地图上看得到的事。引文默认不用，事实作原创转述。

阅读说明：

- EN: “The dates follow historical events. Plate lines and volcano locations are modern reference datasets, not reconstructed maps of each year. Earthquakes are a selected catalogue sample. Numbers retain their source and definition; estimates can differ.”
- ZH: “年代沿着历史事件前进。板块线和火山位置是现代参考资料，不是每个年份的复原地图。地震点来自注明条件的目录样本。数字保留出处与统计口径；不同来源的估计可能不同。” [F03,F04,F35–F43,F54,PH02–PH05]

### 1.2 必须讲对

| 事实 | 要点 | 在本题怎样落实 |
|---|---|---|
| F01–F04 | 板块包括地壳与刚性上地幔，板块不等于大陆 | 背景一句定义，海岸/板块层独立开关；内部构造交兄弟题 |
| F10–F14 | 张裂、汇聚、转换；汇聚还包括碰撞，边界可能很宽 | 第 03 章按 PB2002 `STEPCLASS` 分类，不能凭线形猜；不把全部汇聚都称为火山弧 |
| F15–F18 | 火环非一体，定义不同；热点是例外 | 第 07 章正文 + 并列细看；Kilauea 点可选，不画熔岩地下通道 |
| F25–F27,F29 | 震源/震中、震级/烈度不同，不能精确预测 | 震中符号不是断层破裂全长；大小只编码目录震级；不画新加坡烈度热区 |
| F30–F32,F61 | 海水位移、长波、浅化、后续波；不保证先退水 | 第 04 章示意图旁说明；观测点不连成淹没面；不计算到达时间 |
| F34,F38,F59 | 2004 USGS Mw 9.1；MSS 9.2；USGS tsunami=0 不是「没有海啸」 | 源事件显式 crosswalk 到 NCEI 2439，不依据该 flag 过滤 |
| F35–F37 | 2004 统计口径与版本 | 主数字固定 2024 年 10 月的 227,899；只展示有来源的四国分项，不伪装完整 15 国表 |
| F39–F42 | 1815 Tambora，1883 Krakatau，2018 Anak Krakatau 不能混同 | 分立事件，分立来源；历史年份来自事实账；定位点不是古岛形 |
| F43–F45,F47,F60 | 新加坡可感到远处地震、工程与地面条件相关、海啸相对屏蔽 | 2022 案例用 EOS 记录 + 当前 USGS 解；安全提示只转述 BCA，不扩成施工建议 |
| F53,F54,F56,PH05 | 各资料许可不同 | 每个派生文件带来源、版本、修改说明；本方案不引入 CC BY-SA 或 ODbL 文件 |

### 1.3 分歧与数字写法

| 问题 | 正文默认 | 细看呈现 |
|---|---|---|
| Tambora 死亡 | 「USGS 的一篇说明写周边地区超过 70,000 人死亡；另一张 USGS 表列 92,000，主要死因为饥饿。」[F40] | 是两种估计，不能捏成有统一统计边界的 70,000–92,000 置信区间；不算平均 |
| Krakatau 死亡 | 「约 36,000 人死亡，主要由于海啸。」[F41] | 历史表值 36,417；NCEI `deaths` 与 `deathsTotal` 另有口径，不混加。[PH03] |
| 2004 | 「227,899 人死亡或失踪并推定死亡。」[F35] | 2024 年 10 月海报口径 15 国；其他 NOAA 文案有 >230,000/14 国，17 国指受影响范围。[F37] |
| 2004 震级 | 「USGS 目录：Mw 9.1。」[F34] | MSS 写 9.2；不把来源差异当作当地烈度差。[F38] |
| 2022 震级 | 正文只写日期、Sumatra 与新加坡感到震动。[PH01] | EOS 页面写 6.2；本次 USGS 已审解 6.1、magType mww、深度 4 km；各标来源与抓取日。[PH02] |
| 火环 | 不写普适「75%」标牌 | MSS 广义含印尼；GVP 定义排除澳大利亚—巽他边界上的多数印尼火山；其 687/1,214、57% 是 v5.4.0 的统计。[F15–F17] |
| 位置模型 | 新加坡旁标「PB2002: Sunda」 | MSS 用广义稳定欧亚板块，模型分辨率不同。[F43] |

所有数量施工用 `<Num s>` 或结构化 sources；日期不包 `<Num>`。死亡保持普通正文和带精确值的无动画 Counter，没有“VS”、名次或胜负配色。[F35,F40,F41]

## 2. 章节计划（背景 + 7 章，38 拍）

### 2.1 章表与图层缩写

镜头 `[lon,lat,zoom]` 是编辑取景参数，不是灾害发生坐标。`B`=base；`P`=四个 PB 子层 ph-plate-divergent、ph-plate-transform、ph-plate-subduction、ph-plate-convergent（现代 PB2002，P 每次展开全部四层）；`O`=ph-orogens；`V`=ph-volcano-catalogue（全新世固定目录）；`Q`=ph-quake-sample（到本拍日期的 2000–2024 样本）；`R83/R04/R18`=ph-observations-1883 / ph-observations-2004 / ph-observations-2018（三个独立 NCEI 观测层）；`E`=battles（现有历史事件符号）；`S`=sites（静态地点）。表内缩写施工时展开。现代参考层的「参考年份与目录版本」图例常在；`V` 无喷发动画。地震层只按事件日期出现。

| # | id · EN / ZH | state.time · cam | layers | state.highlight | 帧 |
|---|---|---|---|---|---|
| 00 | background · Reading this atlas / 怎样读这张图 | 1815-04-10 · [112,-4,3.6] | B,P,V,S | site-tambora | K1 |
| 01 | tambora-1815 · Tambora, 1815 / 1815 年的坦博拉 | 1815-04-10 · [118,-8.25,5.7] | B,P,V,E | event-tambora-1815 | K1 |
| 02 | krakatau-1883 · Krakatau, 1883 / 1883 年的喀拉喀托 | 1883-08-27 · [105.4,-6.1,6.2] | B,P,V,E,R83 | event-krakatau-1883 | K2 |
| 03 | mapping-plates · Measuring a restless world / 记录会动的地球 | 2004-12-25 · [150,5,1.3] | B,P,O,V,Q,S | — | K3 |
| 04 | indian-ocean-2004 · The Indian Ocean, 2004 / 2004 年的印度洋 | 2004-12-26 · [83,2,3.2] | B,P,E,R04 | event-sumatra-2004 | K4 |
| 05 | anak-krakatau-2018 · A different tsunami source / 另一种海啸起因 | 2018-12-22 · [105.5,-6.1,6.0] | B,P,V,E,R18 | event-anak-2018 | K5 |
| 06 | felt-in-singapore · Felt in Singapore / 新加坡感到的震动 | 2022-02-25 · [101.9,0.9,5.2] | B,P,Q,E,S | event-pasaman-2022,site-singapore | K6 |
| 07 | comparing-evidence · Patterns and their limits / 分布与证据的边界 | 2024-12-31 · [150,5,1.3] | B,P,O,V,Q,S | — | K7 |

K1–K7 都是空 control 帧，日期与各章表一致，端点覆盖全时间范围。没有疆域淡化；参考线不作为 control 面沿海岸裁剪。背景的 site 静态可见，表内 P/V 等均由 E-PH1 的 reference 语义处理，非事件未来泄漏。章节 hl 均不晚于 state.time；第 04 章以前没有 2004 事件 hl。[F34,F39–F43,PH01–PH04]

### 2.2 每章要点与 EN / ZH 字幕

章状态为各章总览；点击章实际应用首拍。第 03/07 章总览不高亮屏外夏威夷，夏威夷只在第 3 拍近景高亮。每拍均显式写完整 layers 和 highlight，不依赖上一章遗留开关；下表缩写沿用 §2.1。引线每拍最多 3 个；没有 hl 的拍由图例和正文说明，不强添一个屏外事件。

#### 00 background · 怎样读这张图（4 拍）

正文：①板块不等于大陆，板块含地壳与上地幔的刚性部分。②历史日期与现代参考地理同时存在，不能误认火山点正在喷发。③震中、火山位置、海啸观测各有符号，参考层不计为该年事件。④来源可点开，范围、样本条件和空白都要说明。细看：现代线为什么能用于历史定位；本题与 `inside-the-earth` 的职责。[F01,F04,F26,F53,F54,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| BG-1 | 1815-04-10 · [112,-4,3.6] · B,P,V,S · site-tambora | “1815: Tambora is marked on Sumbawa. The plate lines are a modern reference model.” / “1815 年：坦博拉标在松巴哇岛上。板块线采用现代参考模型。” [F39,F54] |
| BG-2 | 1815-04-10 · [150,0,1.2] · B,P · — | “1815, reference view: plate boundaries cross oceans as well as land. Coastlines are different lines.” / “1815 年，参考视图：板块边界经过海洋，也经过陆地；海岸线是另一种线。” [F04] |
| BG-3 | 1815-04-10 · [112,-4,3.6] · B,V,S · site-tambora | “1815, reference view: these volcano points come from a modern Holocene catalogue. A point does not mean an eruption on this date.” / “1815 年，参考视图：火山点来自现代的全新世目录；一个点不表示这一天正在喷发。” [F53,PH04] |
| BG-4 | 1815-04-10 · [118,-8.25,5.7] · B,P,V,S · site-tambora | “10 April 1815: the view returns to Tambora. Historical events will be added separately from the reference locations.” / “1815 年 4 月 10 日：视图回到坦博拉。历史事件会另加标记，与参考位置区分。” [F39,PH03] |

#### 01 tambora-1815 · 坦博拉（5 拍）

summary EN “Tambora's 1815 eruption affected communities around Sumbawa; later food shortages were part of the loss of life.” / ZH “坦博拉 1815 年的喷发影响松巴哇周边的居民；灾后的粮食短缺也是死亡原因的一部分。” [F39,F40]

正文：岛、火山、1815 年 4 月；VEI 7 属于 GVP 的 1812–1815 喷发记录，不是任意一次爆炸的震级。谈直接与间接死亡，按 §1.3 并列两个 USGS 估计，不用 NCEI 的另一数替换。地图只定位，不复原 1815 海岸或灰云。细看：①VEI 与震级是不同对象；②两种死亡估计；③点与喷发记录；链接兄弟题喷发机制。[F27,F39,F40,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 01-1 | 1815-04-10 · [118,-8.25,5.7] · B,P,V,E · event-tambora-1815 | “10 April 1815: the event marker locates Tambora on Sumbawa, in present-day Indonesia.” / “1815 年 4 月 10 日：事件标记位于今天印度尼西亚松巴哇岛上的坦博拉。” [F39,PH03] |
| 01-2 | 1815-04-10 · [116,-7.5,4.2] · B,P,V,E · event-tambora-1815 | “April 1815: Tambora lies among the Indonesian volcanoes. These reference points do not share one connected magma reservoir.” / “1815 年 4 月：坦博拉位于印尼的火山带中。这些参考点不代表一个连通的岩浆库。” [F15,F39] |
| 01-3 | 1815-04-10 · [118,-8.25,5.7] · B,V,E · event-tambora-1815 | “April 1815: the selected record links the eruption to its volcano location. GVP assigns VEI 7 to the 1812–1815 episode.” / “1815 年 4 月：选中的记录连到火山位置。GVP 把 1812—1815 年这段喷发记录为 VEI 7。” [F39,PH04] |
| 01-4 | 1815-04-10 · [118,-8.25,5.7] · B,E · event-tambora-1815 | “April 1815: this marker also opens the human impact. USGS estimates differ, and the larger account identifies starvation as the main cause.” / “1815 年 4 月：点开标记也能读到人的损失。USGS 的估计不同，其中较大的估计把饥饿列为主要死因。” [F40] |
| 01-5 | 1815-04-10 · [112,-5,3.8] · B,P,V,E · event-tambora-1815 | “1815: the map shows location, not the reach of ash or hunger. Those effects need their own evidence.” / “1815 年：地图标明位置；灰云或饥荒影响了多大范围，需要各自的证据。” [F39,F40; editorial limit] |

#### 02 krakatau-1883 · 喀拉喀托（5 拍）

summary EN “Krakatau's 1883 disaster killed about 36,000 people, mainly through tsunamis.” / ZH “1883 年喀拉喀托灾害造成约 36,000 人死亡，主要由于海啸。” [F41]

正文：定位巽他海峡；1883-08-27 主灾难与 GVP 从 5 月开始的整个喷发记录分开；海啸可以由火山过程引起。观测记录点不等于当时所有受灾社区。平静地说明死亡与资料局限，不讲跨海巨浪追逐。细看：①36,417 的历史估计；②NCEI 观测类型；③旧 Krakatau 与后来 Anak Krakatau 并非同年事件。图位置可在此预告海啸图但正文只用一次，放第 04 章。[F30,F41,F42,PH03,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 02-1 | 1883-08-27 · [105.4,-6.1,6.2] · B,P,V,E · event-krakatau-1883 | “27 August 1883: Krakatau is marked in the Sunda Strait. The coastline is modern reference geography.” / “1883 年 8 月 27 日：喀拉喀托标在巽他海峡；海岸线采用现代参考地理。” [F41,PH03,PH04] |
| 02-2 | 1883-08-27 · [105.5,-6.1,5.5] · B,E,R83 · event-krakatau-1883 | “27 August 1883: recorded tsunami observation locations appear around the source. They are observations, not an inundation boundary.” / “1883 年 8 月 27 日：海啸源点周边出现记录中的观测位置。这些是观测点，不是淹没边界。” [PH03,PH06] |
| 02-3 | 1883-08-27 · [105.4,-6.1,6.2] · B,E · event-krakatau-1883 | “1883: the selected event reports about 36,000 deaths, mainly from tsunamis. The number describes people, not wave height.” / “1883 年：选中的事件记载约 36,000 人死亡，主要由于海啸。这个数字说的是人，不是浪高。” [F41] |
| 02-4 | 1883-08-27 · [105,-5,4.3] · B,P,V,E · event-krakatau-1883 | “1883: Krakatau's volcano point and the tsunami source marker have different jobs. An eruption and a tsunami are linked processes, not the same process.” / “1883 年：火山点与海啸源点各有用途。喷发与海啸能够相连，却是不同过程。” [F30,F41,PH03] |
| 02-5 | 1883-08-27 · [105.5,-6.1,5.5] · B,E,R83 · event-krakatau-1883 | “1883: gaps between observation points do not establish that no wave arrived there.” / “1883 年：观测点之间没有记录，不足以证明那些地方没有海啸到达。” [PH06; catalogue limitation] |

#### 03 mapping-plates · 记录会动的地球（5 拍）

summary EN “Measured earthquake locations can be compared with modelled boundaries and volcano locations, while retaining each dataset's limits.” / ZH “把地震记录与板块模型、火山位置叠看，可以比较分布，也要保留各份资料的限制。” [F04,F10,F18,F27,PH04]

正文：以 2000 年开始的选择样本为背景，依次看海岸线、PB 分类、火山、震中；PB `OSR/CRB`=张裂，`OTF/CTF`=转换，`SUB`=俯冲，`OCB/CCB`=其他汇聚，不能把同一对板块的整条边界强归为单一运动。图示走滑横向错动，机制链接兄弟题。地震点大小的映射只是显示编码；不表示破坏半径，不能从目录点外推安全地带。细看：①52 个唯一 code 与 54 个多部件要素；②震级与烈度；③热点火山。[F10–F18,F25–F27,F29,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 03-1 | 2000-01-01 · [150,5,1.3] · B,P,O · — | “2000: modern plate-boundary lines extend through the oceans. Some boundary regions are broad rather than a single sharp line.” / “2000 年：现代板块线延伸到海洋中；有些边界地区很宽，不能只当成一条锐利的线。” [F04,F10] |
| 03-2 | 2000-01-01 · [-29,5,2.1] · B,P · — | “2000, reference view: boundary segments have different relative motions. The legend uses the PB2002 segment classifications.” / “2000 年，参考视图：边界各段的相对运动不同；图例采用 PB2002 的分段分类。” [F10–F13,PH04] |
| 03-3 | 2000-01-01 · [-145,20,2.4] · B,P,V,S · site-kilauea | “2000, reference view: Kilauea is within an oceanic plate. Not every volcano sits on a boundary.” / “2000 年，参考视图：基拉韦厄位于大洋板块内部；火山并非全在板块边界上。” [F18,PH04] |
| 03-4 | 2004-12-25 · [150,5,1.3] · B,P,V,Q · — | “25 December 2004: this earthquake sample contains catalogue events from 2000 up to this date, with magnitude at least 6.” / “2004 年 12 月 25 日：这里的地震样本包含 2000 年至这一天、目录震级至少为 6 的事件。” [PH04] |
| 03-5 | 2004-12-25 · [102,0,3.5] · B,P,O,V,Q · — | “25 December 2004: compare the earthquake points, volcano points and boundary lines. A map pattern is evidence, not a prediction of the next event.” / “2004 年 12 月 25 日：把震中、火山与板块线叠看。分布规律是证据，不能预报下一次事件。” [F29,PH04] |

#### 04 indian-ocean-2004 · 印度洋（5 拍）

summary EN “The earthquake off Sumatra generated a tsunami across the Indian Ocean. NOAA/ITIC's October 2024 accounting records 227,899 people dead or missing and presumed dead.” / ZH “苏门答腊外海地震引发的海啸波及印度洋。NOAA/ITIC 在 2024 年 10 月的统计记载，227,899 人死亡或失踪并推定死亡。” [F34,F35]

正文：USGS 震中、Mw 9.1、30 km；震中不等于整个破裂区。海底形变与海水位移一句，机制交兄弟题。跨海观测点显示记录范围，不用同心波圈假装传播实测。讲死亡/失踪口径，按同一个 2024 海报列印尼 167,540、斯里兰卡 35,322、印度 16,269、泰国 8,212；明确这是四个国家的部分表，不列差额或“其他国家”条目。细看：①不同官方总数与国家数；②观测类型和缺失；③Mw 9.1/9.2；④USGS tsunami flag 陷阱。[F34–F38,F59,PH07]

图：`plates-and-hazards-tsunami-shoaling.png`，caption 明说比例夸张的机制示意，不是 2004 浪高复原。[F32]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 04-1 | 2004-12-26 · [96,3.3,4.2] · B,P,E · event-sumatra-2004 | “26 December 2004: the USGS epicentre lies off Sumatra. The selected solution is Mw 9.1, at a depth of 30 kilometres.” / “2004 年 12 月 26 日：USGS 的震中点位于苏门答腊外海；选用的解为 Mw 9.1，深度 30 公里。” [F34] |
| 04-2 | 2004-12-26 · [83,2,3.2] · B,P,E,R04 · event-sumatra-2004 | “26 December 2004: observation points spread across the Indian Ocean. They record different kinds of water-level evidence, not one uniform wave height.” / “2004 年 12 月 26 日：观测点分布在印度洋多处；它们记录的水位证据类型不同，不能当成同一种浪高。” [PH06] |
| 04-3 | 2004-12-26 · [82,7,4.1] · B,E,R04 · — | “26 December 2004: the view moves towards Sri Lanka and India. A recorded coastal height is not the same as a deep-ocean wave amplitude.” / “2004 年 12 月 26 日：视图移向斯里兰卡与印度。岸上的记录高度与深海的波幅不是同一个量。” [F32,F61,PH06] |
| 04-4 | 2004-12-26 · [83,2,3.2] · B,E,R04 · event-sumatra-2004 | “26 December 2004: the impact record states 227,899 people dead or missing and presumed dead in 15 countries, using NOAA/ITIC's October 2024 accounting.” / “2004 年 12 月 26 日：影响记录采用 NOAA/ITIC 的 2024 年 10 月统计：15 个国家共 227,899 人死亡或失踪并推定死亡。” [F35] |
| 04-5 | 2004-12-26 · [83,2,3.2] · B,P,E,R04 · event-sumatra-2004 | “26 December 2004: the epicentre and observations remain separate layers. A single source point cannot show the whole earthquake rupture or every affected coast.” / “2004 年 12 月 26 日：震中与观测点分属两个图层。一个源点不能表示整段地震破裂，也不能显示每一处受影响的海岸。” [F26,F34,PH06] |

#### 05 anak-krakatau-2018 · 另一种起因（4 拍）

正文：2018-12-22 的火山体崩塌触发海啸；位置近于 1883 点，不能认为历史重复的是同一机制与同一统计。GVP 2018–2020 喷发记录的起日是 2018-06-18，不等于崩塌日。海啸是系列长波，第一波未必最大，也未必先退水。细看：①同地不同事件；②GVP 喷发 episode 与 NCEI 海啸日期；③观测测量类型。链接兄弟题海啸机制。[F30,F42,F61,PH03,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 05-1 | 2018-12-22 · [105.5,-6.1,6.0] · B,P,V,E · event-anak-2018 | “22 December 2018: Anak Krakatau's collapse triggers a tsunami in the Sunda Strait.” / “2018 年 12 月 22 日：巽他海峡中的喀拉喀托之子火山崩塌，引发海啸。” [F42] |
| 05-2 | 2018-12-22 · [105.5,-6.1,5.5] · B,E,R18 · event-anak-2018 | “22 December 2018: a separate set of observation points belongs to this tsunami. The map keeps it apart from the 1883 records.” / “2018 年 12 月 22 日：这一组观测点属于这次海啸；地图把它与 1883 年的记录分开。” [PH03,PH06] |
| 05-3 | 2018-12-22 · [105.5,-6.1,6.0] · B,V,E · event-anak-2018 | “2018: the volcano catalogue and the tsunami record use different event dates. An eruption episode can begin before a collapse.” / “2018 年：火山目录与海啸记录的事件日期不同；一段喷发活动可能早于崩塌开始。” [PH03,PH04] |
| 05-4 | 2018-12-22 · [105,-5,4.5] · B,P,E,R18 · event-anak-2018 | “2018: a tsunami can start without an earthquake as its initiating cause. The first arriving wave need not be the largest.” / “2018 年：海啸的起因可以不是地震；最先到达的一波也未必最大。” [F30,F42,F61] |

#### 06 felt-in-singapore · 新加坡感到的震动（5 拍）

正文：2022 年 2 月 25 日西苏门答腊地震，新加坡有人感到震动（EOS 当时页面与后述公开讲座）；地图从 USGS 当前解的震中移到新加坡，不画虚构传播路线或速度。PB2002 的 Sunda 与 MSS 广义欧亚并列；高楼、地层与响应关系只给定性说明。BCA 说明作为当地指引链接：在室内到桌下掩护、不乘电梯；不用它推论每幢楼有隔震器或绝对安全。细看：①震级估计的版本；②震级与本地烈度；③海啸相对屏蔽但仍需官方警示。[F27,F43–F45,F47,F60,PH01,PH02]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 06-1 | 2022-02-25 · [100.1,0.22,5.8] · B,P,Q,E · event-pasaman-2022 | “25 February 2022: the selected USGS epicentre is in west Sumatra. Its catalogue parameters are distinct from reports of shaking in Singapore.” / “2022 年 2 月 25 日：选中的 USGS 震中位于西苏门答腊。目录参数与新加坡感到的摇晃是不同资料。” [PH01,PH02] |
| 06-2 | 2022-02-25 · [101.9,0.9,5.2] · B,P,E,S · event-pasaman-2022,site-singapore | “25 February 2022: Singapore and the earthquake source appear in one view. People in Singapore reported feeling this distant event.” / “2022 年 2 月 25 日：同一视图里能看到震源地区与新加坡；新加坡有人报告感到这次远处地震。” [PH01,PH02] |
| 06-3 | 2022-02-25 · [103.82,1.35,7.3] · B,P,S · site-singapore | “2022, reference view: Singapore is away from the active regional plate edges. PB2002 names the smaller Sunda plate here.” / “2022 年，参考视图：新加坡远离区域内活跃的板块边界；PB2002 在这里区分出较小的巽他板块。” [F43] |
| 06-4 | 2022-02-25 · [103.82,1.35,7.3] · B,S · site-singapore | “2022: the Singapore point marks a place, not one building's shaking level. Ground conditions and building response affect what people feel.” / “2022 年：新加坡点标的是地点，不是某幢楼的摇晃等级；地面条件和建筑响应都会影响人的感受。” [F45,PH01] |
| 06-5 | 2022-02-25 · [102,0.8,4.7] · B,P,E,S · event-pasaman-2022,site-singapore | “2022: the regional view connects distant sources and local experience. Read BCA's tremor guidance alongside the scientific explanation.” / “2022 年：区域视图把远处震源与本地经验连起来；科学解释旁边附有建设局的地震震动指引。” [F44,F60,PH01] |

#### 07 comparing-evidence · 分布与证据的边界（5 拍）

正文：固定 2000–2024 样本的总数与选择条件，不能同 1815 的稀疏档案做频次上升论证。火山、震中、边界的重叠和例外；火环是通俗名称，MSS 与 GVP 地理范围不同，印尼的归属是定义差别。GVP 的 687/1,214、57% 必须带 v5.4.0，不从本次地图点做未经核对的空间多边形统计。新加坡低暴露不等于零影响；对照数据版本而非做灾害预测。细看：①火环两定义并列；②为什么目录点数会变；③哪里有/没有资料；④去兄弟题看内部机制。[F15–F18,F29,F43–F45,F47,PH04]

| 拍 | t · cam · layers · highlight | caption EN / ZH |
|---|---|---|
| 07-1 | 2024-12-31 · [150,5,1.3] · B,P,O,V,Q · — | “31 December 2024: the earthquake layer now covers the complete 2000–2024 sample. Its catalogue threshold and date range remain visible.” / “2024 年 12 月 31 日：地震层现在包含完整的 2000—2024 年样本；目录震级门槛与日期范围仍显示在旁。” [PH04] |
| 07-2 | 2024-12-31 · [130,5,2.1] · B,P,V · — | “2024, reference view: ‘Ring of Fire’ is a popular regional name. MSS and GVP define its Indonesian extent differently.” / “2024 年，参考视图：‘环太平洋火山带’是通俗地区名称；MSS 与 GVP 对它在印尼的范围定义不同。” [F15,F16] |
| 07-3 | 2024-12-31 · [-145,20,2.4] · B,P,V,S · site-kilauea | “2024, reference view: Kilauea remains a useful exception to a boundary-only explanation of volcanoes.” / “2024 年，参考视图：基拉韦厄说明，不能只用板块边界解释所有火山的位置。” [F18,PH04] |
| 07-4 | 2024-12-31 · [83,2,3.2] · B,P,E,R04 · event-sumatra-2004 | “2024: the 2004 event is still selected. Its impact total keeps the October 2024 source date and the words ‘dead or missing and presumed dead’.” / “2024 年：仍选中 2004 年事件；影响总数保留 2024 年 10 月的出处日期，以及‘死亡或失踪并推定死亡’的口径。” [F35] |
| 07-5 | 2024-12-31 · [102,0.8,4.7] · B,P,V,Q,S · site-singapore | “2024: Singapore sits within a wider region of earthquakes and volcanoes. Maps help compare evidence; official warnings provide current advice.” / “2024 年：新加坡处在更大的地震与火山区域之中。地图帮助比较证据；当前指示要看官方警示。” [F29,F43–F45,F47] |

## 3. 地图、数据与零件清单

### 3.1 资料与许可路线

预取文件、实际字节、SHA-256、坐标范围与时间检查见 `data/INVENTORY.md` 与 `data/coverage.json`。全部在构建期转为本地文件，客户端无外部请求。不是把原始 20 多 MB 数据直接塞进岛 props。[F53,F54,F56,PH04–PH06]

| 来源 / 父卷 D# | 采用内容 | 许可及派生文件家族 | 主要用途 |
|---|---|---|---|
| D01 Natural Earth | 已有 50m 全球陆地、10m SEA 副本；另预取 110m 原始 land 用于全图核对 | PD；直接复用现有 basemap，源几何仍为 PD，作者新写说明归 Atlas CC BY-NC-SA 4.0 | 全章现代参考海岸，不改作 1815 岛岸 |
| D02 fraxen PB2002 | boundaries、plates、orogens、steps，保留全部原始属性 | **ODC-BY 1.0**，数据库派生仍带 ODC-BY 通知；四个 `ph-plate-*` 线文件、`ph-orogens` 独立文件，无 SA 家族 | 所有 K 的固定现代参考；steps 真正驱动分类 |
| D05 USGS | 2000–2024 M≥6 已审事件与 2022 小查询；复用父卷 2004 快照 | USGS 产品 PD；不下载第三方 ShakeMap/摄影。`ph-quake-sample` 的原数据仍 PD，Atlas 说明为 NC-SA | 03、06、07 与 04 源事件 |
| D06 GVP | 全新世火山及喷发 WFS，后续只输出必要字段 | 数据库编纂的 US 政府雇员产品；按专门条款作 PD 采用；照片 URL/说明、地质长文不打包。[F53] | 参考点与三个历史喷发 episode 的核对 |
| D07 NCEI | 四个年份的源事件、1883/2004/2018 完整逐页观测 | NOAA 编纂事实表 PD；元数据不限访问、无额外许可限制，政策区分第三方附件；不含原报告全文与照片。[PH05] | 02、04、05 观测点与 crosswalk |
| D19 NOAA/ITIC 海报 | **仅事实转述**，采用父卷已核数字 | 整幅混合权利海报不复用；`events.json` 的 impacts 是原创组织与事实数字，Atlas NC-SA，不复制图表版式 | 04 主数字与口径 |

本方案没有 CC BY-SA 来源，故没有 BY-SA 派生家族；没有 ODbL 来源。Atlas 新增叙述、翻译、manifest、impact/crosswalk 的原创组织归 **CC BY-NC-SA 4.0**。不把来源 PD/ODC-BY 数据本体宣称为 Atlas 独占版权；ODC-BY 文件与 NC-SA 内容按文件分别发通知。若未来加入 GEM（CC BY-SA 4.0），必须单独生成 BY-SA 派生文件，**不得与任何 CC BY-NC-SA 来源合并到同一派生文件**。[F54,F56,PH05]

### 3.2 数据清单与静态产物（规划）

| 文件 / 对象 | 规模与字段 | 预算 / 输出规则 |
|---|---|---|
| `entities.json`、`movements.json` | 各为空数组 | 不为 Counter 虚构“国家阵营” |
| `control.json` | K1 1815-04-10、K2 1883-08-27、K3 2004-12-25、K4 2004-12-26、K5 2018-12-22、K6 2022-02-25、K7 2024-12-31，均空 FeatureCollection | <2 KB；只是时间锚点 |
| `events.json` | 5 个 disaster + 4 个 site，§3.4 | <25 KB；已有 disaster 三角与 site 菱形 |
| `ph-plate-divergent.json`、`ph-plate-transform.json`、`ph-plate-subduction.json`、`ph-plate-convergent.json` | 从 5,824 steps 按原分类分四个子集，`id, boundaryPair, class, sources` | 各为单对象 TopoJSON；四文件合计≤600 KB；现有 layer 配色/KEY，不另做类别 renderer |
| `pb-plates.geojson`（仅构建输入） | 54 要素、52 Code，用于核实 Sunda/板内位置 | 不发布额外面图层；不造领土实体、不沿陆地裁海洋板块 |
| `ph-orogens.json` | 13 个 orogen 多边形 | ≤60 KB；标「模型中的宽边界区」，非真实危险区 |
| `ph-volcano-catalogue.json` | 1,214 Point；`id=gvp-<number>, name, number, setting, evidence, sources` | ≤350 KB；不输出 Photo_Link/Caption/Credit 或原文地质简介；中文人审常用名，不自动译 1,214 个专名 |
| `ph-quake-sample.json` | 3,729 Point；id、UTC 原时戳、day、mag、magType、depthKm、updated、status、source id | ≤650 KB；保留精确原值，符号半径仅教学编码 |
| `ph-observations-1883/2004/2018.json` | 按 NCEI eventId 各 102/2,177/410 行输入；地图输出 99/2,155/410 个坐标合法行，原表保留 25 个缺坐标行及原因 | 分别≤70/400/120 KB；id、eventId、位置、原测量类型、doubtful、来源；高度与到达字段只保留研究原表，本版不输出其数值；不合并事件 |
| `ph-catalogue-<layer-suffix>.json`（每个实际层各一份） | E-PH1 的目录元数据；常用名双语，其余官方原名 + 中文字段/解释 | 与对应图层一起懒取；单份≤2 MB、合计≤5 MB（不含复用basemap）；不含长篇简介；索引只挂可见对象并分页 |
| `events.json[].impacts` | E-PH2：Tambora 两行估计、Krakatau 一行、2004 总数及四国分项 | 不新增独立 impact loader；新增内容预算<10 KB |
| `ph-crosswalk.json` | `sumatra-2004 -> USGS official20041226005853450_30 -> NCEI 2439`；Krakatau 1883 ->1142；Anak 2018 ->5699；Tambora ->613 | <5 KB，显式人工核对；不能靠距离最近自动 join |

所有图层定义 `count:true`；reference 的 countLabel 明写参考要素/目录，Q 写样本事件，R 写关联观测。主底图直接复用现有本地文件，现代海岸不另生成 ph-land。原始预取总量与发布总量分别记录。所有发布几何合计目标 ≤2 MB，索引与长文分离，按图层懒加载；超预算先去无关属性、共用拓扑和按偏差简化，不减少研究记录来假装完整。PB 线简化最大偏差全球 10 km、SEA 焦点 2 km，仅是容差目标；施工必须测量并记录 p50/p95/max。火山与震中不简化点坐标。geometry只留id/f/u/mag/必要分类；时间戳、updated、解释等长元数据进catalogue，避免同值重复占几何预算。Natural Earth 比例尺决定近景可信度，最大 zoom 8；不做街道级海岸结论。[F54,F56,PH04]

### 3.3 管线与时间

1. 以本目录 bytes/hash 为冻结输入，来源 release 和抓取时间分开。检查 FeatureCollection/JSON，GVP `numberMatched==numberReturned==1214`，NOAA 每页相同 eventId、唯一 id、实际行数等于 totalItems；USGS 3,729 条且均 reviewed。[PH04,PH06]
2. PB steps 按 `STEPCLASS` 精确映射：OSR/CRB 张裂，OTF/CTF 转换，SUB 俯冲，OCB/CCB 其他汇聚；未知 class 失败而非默认为俯冲。geometry 直接取输入，不从 STARTLONG 再手连。当前计数 1,875/474/1,147/457/1,129/341/401。原始说明的 5,819 steps 对应 5,819 个唯一 SEQNUM；转换得到 5,824 features，是其中 1152/1465/2795/4924/4946 五段各在日界线拆为两件。几何 id 写 `ph-step-<seq>-<part>`，保留原序号与两件几何，不删到凑数。原始 229 boundary segments 与转换 241 features 也不当成新增板块发现。[PH04]
3. PB plates 54 feature 只有 52 个唯一 Code（KE、BR 各两段）；用于构建核对，不把 54 当板块数量，不补洞或人工拉线。[PH04]
4. GVP WFS 返回 EPSG:4326 声明，但检查实际 point 为 `[lon,lat]`，如 Tambora `[118,-8.25]`；白名单数值/名称字段，不访问图像 URL。[PH04]
5. USGS 目录窗口 `[2000-01-01T00:00:00Z,2025-01-01T00:00:00Z)`；API 的 endtime 行为不当作契约，下载后强制再过滤 `<end`。这里无边界多余记录。epoch 存精确 UTC；可见 day 取 UTC 日期，t 到某日时展示该日所有目录记录，详情仍列原时戳。不得把 Singapore 时间误作事件源时区。[F34,PH02,PH04]
6. 参考层不写伪 `f=1815`；E-PH1 `temporal.mode=reference`，日期不驱动出现。地震继续用 datedLayers：`f=toNumber(UTC day)`，只含 day≤当前 UTC 日，不另增 through-day。海啸观测每行 `f=toNumber(对应源事件日)`，沿现有 datedLayers 随源事件日期整体显示，**不做小时传播**；标题标「与该事件关联的观测，不按到达时刻回放」，部分记录在次日/更后出现也不隐瞒。[PH06]
7. NOAA 原 `runupHt` 不能不看类型就统一解释为“岸上爬高”；本版统一不输出任何观测高度数值，只列原类型代码、位置和关联信息，不画高度图例、不排名。其他缺数字段显示“未记录”，不是 0。`doubtful=y` 独立注明但仍画位置；不增加另一种运行时筛选状态，原始表保留。[PH06]
8. antimeridian：PB 线/面按真实 ±180 跳变拆分/展开，不能跨世界画长弦；点不 wrap 到另一半球。保存转换报告、容差、哈希和 licence notice。国界层关、海岸是现代参照；Tambora 与 Krakatau 不造历史岛形。[F54,F56]

### 3.4 事件、位置、镜头与索引

| id | t / kind | at [lon,lat] 的出处 | 引用 / inspector |
|---|---|---|---|
| event-tambora-1815 | 1815-04-10 disaster | [118,-8.25] GVP 264040；NCEI 613 是另一近似源点 [118,-8.2]，不平均 | F39,F40,PH03,PH04；日期来自 NCEI 主事件日，不冒称整个 episode 仅一天 |
| event-krakatau-1883 | 1883-08-27 disaster | [105.4233,-6.1009] GVP 262000 | F41,PH03,PH04；NCEI1142 另存原坐标 |
| event-sumatra-2004 | 2004-12-26 disaster | [95.982,3.295] 父卷 USGS 快照 | F34–F38,F59；NCEI2439，impact 索引 |
| event-anak-2018 | 2018-12-22 disaster | [105.4233,-6.1009] GVP 的 Krakatau 火山中心参考点 | F42,PH03,PH04；**不是实测滑坡起点/体积中心** |
| event-pasaman-2022 | 2022-02-25 disaster | [100.1006,0.219] USGS us6000gzyg | PH01,PH02；不显示未经选定来源核对的死亡数字 |
| site-tambora | 1815-04-10 site | GVP264040 同上 | 地点参考，不使火山提前喷发 |
| site-krakatau | 1815-04-10 site | GVP262000 同上 | 现代火山中心，1883 历史事件另列 |
| site-kilauea | 1815-04-10 site | [-155.287,19.421] GVP332010 | F18,PH04；Kilauea / 基拉韦厄 |
| site-singapore | 1815-04-10 site | [103.82,1.35] **编辑镜头锚点**，不作仪器站/震感点/新事实 | F43–F45,F47；非观测标记，名称写 Singapore (orientation point) / 新加坡（方位点） |

site 不进入年代事件泳道与时间范围；既有规格行 EVENTS 仍计 events.json 全部 9 项（5 disaster + 4 site），不要另开引擎改计数。site 的 t 只是现有 schema 的必填日期，并在说明中明确「地点不按这个日期建立」。所有章内提及对象都能通过章末索引选中。`site` 旧路径要 `sites` 可见；上表已为含 site hl 的章/拍显式列出 S，施工展开为 `sites`；不得仅写 hl 而不打开层。GVP/USGS/NOAA 目录项通过 E-PH1 inspector 索引可点，不把数千条目录全部变成 HTML 事件 marker。

预设：`view-indonesia` [112,-4,3.6]；`view-indian-ocean` [83,2,3.2]；`view-sunda-strait` [105.5,-6.1,5.5]；`view-sumatra-singapore` [101.9,0.9,5.2]；`view-pacific` [150,5,1.3]；`view-hawaii` [-145,20,2.4]。均为编辑镜头，不是数据坐标。前 2 章索引各含事件、火山与本章观测；第 03/07 章索引列当前层 + 可搜索目录 + Kilauea；第 06 章列 USGS2022 与新加坡方位点。

### 3.5 不采用与确定范围

不需要 GEM 活断层（避免不必要 BY-SA 派生）、EarthByte 深时复原（兄弟题）、GEBCO 水深、传播动画或高分辨率淹没网格（本题无计算需求）。不下载 MSS 受版权约束的插图、GVP 照片、整幅混合权利海报。准备轮曾有 GVP terms/info 命令行403、NCEI metadata Web超时和API错误路由/超额page size；准备输入已通过普通公开读取取得。本轮 GVP条款与NCEI metadata/policy均Web成功，USGS/NCEI API普通HTTP成功；GVP全量喷发表重取中断，选定3个episode的过滤请求成功，见S604。无登录/验证绕过，施工来源说明保留访问记录。本版确定只画观测位置与原类型码，不显示高度数值与比较。此确定范围有完整的位置地图，不需画猜测面。[F53,F54,F56,PH05,PH06]


### 3.6 冻结输入与关键帧绑定（精确采用 INVENTORY 的文件）

以下路径均相对主 checkout 的 `art/research/plates-and-hazards/data/`。全量 URL、字节数与 SHA-256 以 `INVENTORY.md` 对应行冻结；施工者逐文件校验，不用同名最新下载静默替换。引用该 manifest 不表示将 28.639 MB 原始表送入浏览器。[PH04,PH06]

| 组 | 确切输入文件 | 派生 / 许可家族 | 驱动帧 |
|---|---|---|---|
| PH-D01 | `pb-boundaries.geojson`、`pb-plates.geojson`、`pb-orogens.geojson`、`pb-steps.geojson`；支持 `PB2002-LICENSE.md`、`pb-original-README.md`、`pb-original-PB2002_steps_desc.txt` | 四个 `ph-plate-*` 子层（OSR+CRB=2349、OTF+CTF=1604、SUB=1129、OCB+CCB=742）及 ph-orogens；**各 ODC-BY 1.0**，原序号保留；其他两个表仅构建核对 | K1–K7 固定参考；03 分类 |
| PH-D02 | `natural-earth-land.geojson`（110m核对）、`land-50m.json`、`land-10m-sea.json` | 直接复用已有 50m/10m basemap，无新 ph-land 文件；几何 PD，原创说明 NC-SA | K1–K7；全球/SEA |
| PH-D03 | `usgs-2000-2024-m6.geojson`、`usgs-2022-sumatra.geojson`、`usgs-2004-parent-snapshot.geojson` | ph-quake-sample；USGS 原事实 PD、Atlas 新解释 NC-SA；附第三方产品不采用 | K3/K6/K7 样本；K4 事件 |
| PH-D04 | `gvp-holocene-volcanoes.geojson` | ph-volcano-catalogue；编纂数据 PD、原创目录解释 NC-SA；剔除照片和长文 | K1–K7 固定参考 |
| PH-D05 | `gvp-holocene-eruptions.geojson` | 仅 episode 16231/15589/22275 的选定字段进目录解释；编纂事实 PD、原创解释 NC-SA | K1/K2/K5 |
| PH-D06 | `ncei-tsunami-events-1815.json`、`ncei-tsunami-events-1883.json`、`ncei-tsunami-events-2004.json`、`ncei-tsunami-events-2018.json`、`selected-ncei-sources.geojson` | 四个事件/explicit crosswalk；事实 PD、原创 crosswalk 组织 NC-SA；不复制整个资料页 | K1/K2/K4/K5 |
| PH-D07 | `ncei-runups-1142.json`、`ncei-runups-2439.json`、`ncei-runups-5699.json` | 三个 ph-observations 文件；NOAA 数值/位置事实 PD、原创说明 NC-SA；无高度输出 | K2/K4/K5，K7 可回看 R04 |
| 支持 | `coverage.json`、`inventory.json`、`ncei-tsunami-metadata.html`、`ncei-open-data-policy.pdf` | 构建审计；不作为学生资源打包，政策/海报不作插图 | 全部来源/许可校验 |

不使用 `ncei-probe.json`（不完整诊断）、GEM、EarthByte、GEBCO、MSS 插图、GVP 照片或整个 NOAA 海报。每个派生文件的 provenance 写输入名/hash、下载 URL/日期、版本、筛选/简化、输出 hash/范围、许可；`LICENSE-CONTENT` 与 `THIRD-PARTY-NOTICES` 的后续施工改动逐文件列 PD/ODC-BY 例外，Atlas 原创文案为 CC BY-NC-SA 4.0。同一派生文件禁止混合 CC BY-SA 与 CC BY-NC-SA。[F53,F54,F56,PH05]

逐帧 `data/SOURCES.md` 与 `SOURCES-GEO.md` 写：K1–K7 均为无控制区的时间锚点，PB/海岸无年代变化；无需配准，数据原生 WGS84；PB 简化误差实测，空 control 的环/自交/面积校验为零。保留 land-50m 已展开的 -181.372…190.271 经度，不误按原始 WGS84 限制裁切现有底图。[PH04]

稳定 id 规则：PB=`ph-step-<integer-seq>-<part>`（part按原文件顺序从1起）；orogen=`ph-orogen-<原名kebab>`（冲突构建失败）；V=`gvp-<Volcano_Number>`；Q=`ph-q-<原USGS-id中的非字母数字段改为连字符>`，例如 `ph-q-official20041226005853450-30`、`ph-q-us6000gzyg`，原id另存rawId；R=`ph-r-<tsunamiEventId>-<row-id>`。转换为小写、去首尾连字符后若碰撞则失败，不静默加序号。目录entry用相同id join；catalogue文件固定对应layer名加前缀 `ph-catalogue-` 后缀（如 `ph-catalogue-quake-sample`）。[PH04,PH06]

章对象索引：旧事件/site 索引继续复用；新增 `catalogueIndex` 按该章首拍有效 layers 列目录，拍切换重取当前 layers 的交集。00=V(Tambora)；01=V(Tambora)+四类P；02=V(Krakatau)+R83+P；03=P/O/V/Q；04=P/R04；05=P/V(Krakatau)/R18；06=P/Q(`ph-q-us6000gzyg`)；07=P/O/V/Q（拍4切到R04）。索引提到但当前关闭的类别用现有 layers 按钮开启后才能选；不显示隐藏对象为可选条目。PB 分类页列全部类的双语名称与原码；所有实际开启目录都可搜索访问，不在 DOM 一次挂载数千行。


## 4. 引擎契约（只列实际缺口）

### 4.1 保留 / 删除对照

| 项目 | 代码实查 / 既有覆盖 | 最小决定 |
|---|---|---|
| **E-PH1 科学参考层与目录选择** | `datedLayerDef` strict、强制 f；`datedLayerProperties` 强制数值 f；GPU source/PLATE 已有，但没有 reference、逐 feature inspector、目录 URL | **保留**：在 datedLayers 上加 reference 与目录选择，不建第二套地图系统。 |
| **E-PH2 带口径的影响记录** | `eventSchema.casualties` 是 entity→number，校验 entity；`EventInspector.ForceTable` 两项即 CounterVersus；不能保存估计关系/统计日期/不完整分项 | **保留**：只在现有事件上加 impacts，复用 Counter 与 SourceRefs。不建 impact 文件加载器、对比卡或新计数器。 |
| 草稿 E1 through-day | docs/06 / `lib/datedLayers.ts` 已支持有限十进制年 f；`toNumber` 能转换日 | **删除新模式**。USGS UTC 日期转 f；原 epoch 留目录行。对本题“当前日全部事件”的语义不按时刻细播。 |
| 草稿 E1 event-linked | 关联已在构建期人工 crosswalk；现有 f 能用源事件日 | **删除新模式**。观测每条用源日 f，标题说明整组关联、非到达动画；保留原关联 id 作内容校验。 |
| 草稿 E1 分类线型渲染 | 现有 datedLayers 可多层各自 token 颜色/KEY/LAYERS | **删除新分类 renderer**。PB 原码分四个文件，各有文字名称、可单独开关；无需模式/虚构分类。 |
| 日精度、镜头、拍、layers URL、来源弹层、纸/暗主题 | core `url-state.ts`、`View.tsx`、`SourcePopover` 已实现 | **删除新增要求**，只做本题回归；`datePrecision: day`，不能为了轴显示年而把 URL 日期截断。 |
| 章索引位置、详情在正文前、PLATE 计数 | 共享 InfoPanel + `View.tsx` object index + `DatedLayerPlate` 已实现 | **删除 HUD 搬家工作**；E-PH1 只给原插槽增加新类型条目。 |
| 零实体空帧、无参与卡 | `View.tsx` 已用 `geo.entities.length` 条件注册；schema 接受空帧 | **删除新开关/修空卡工作**。使用已有零实体行为。 |
| 地球过程 sim、传播/到达计算、混合 Ma/CE | 本题只有公历地图；SpaceScene sim/bindings 不绑定 GeoStage | **删除**，没有相关输入数据或本题教学要求。 |

本节所有字段均是待实现契约；引擎落地后更新 docs/06 并在 §9 记录实际接口。禁止在主题内私写运行时解析器。

主题基本字段用现有 schema：`engine: time-scene`、`stage: geo`、`theme: paper`、`datePrecision: day`、`basemap: { maxZoom: 8 }`。00 写 `kind: background, order: 0`，阅读说明仅写 `state.note`；其余 order=1…7。`state.camera` 落地为 `{ center: [lon,lat], zoom }`，表中 `—` 高亮写 `[]`；每拍显式 layers/highlight，不省成继承。各层 color只用已存在token，无holder。P四层、O/V/Q/R的file与各自layer id一致，TopoJSON唯一对象同名。

### 4.2 E-PH1：reference 是 datedLayers 的一种语义，目录是已有 inspector 的新对象

**输入 schema**（`Bilingual`、kebabId、sources、color token、geometry 校验复用现有定义）：

```ts
// datedLayerDef 的可选增量；未写则旧主题行为逐字保留。
temporal?: { mode: 'dated' } | {
  mode: 'reference'; note: Bilingual; release: string;
};
recent?: boolean; // 缺省 true；reference 强制无 recent；本题所有 dated 点设 false。
catalogue?: { file: string }; // kebab-id，public/geo/<file>.json
encoding?: {
  radius: { property: 'mag'; min: 6; max: 9.5; px: [2, 8] };
}; // 仅 point+数值mag；本题只给 Q，显示映射不是震级定义。

// catalogue 文件（独立于几何，随层加载）：
{ entries: CatalogueEntry[] }
interface CatalogueEntry {
  id: string; // 与对应几何 properties.id 相同：同一个对象的 join，非另一个全局 id
  title: Bilingual; summary: Bilingual; sources: string[];
  at: [number, number];
  rows: Array<{
    key: string; label: Bilingual;
    value: number | Bilingual | null;
    unit?: Bilingual; sources?: string[];
  }>;
}
// chapter.state 与 beat 均可选；beat 覆盖同名整组，不累加。
catalogueIndex?: Array<{ layerId: string; ids?: string[] }>;
// ids 缺省=该层当前所有可见目录项；指定则与当前可见集合取交集。
```

`temporal.mode=reference` 不要求 f/u，也不允许假造 f/u；显示固定 REF.、note 与 release。dated 仍要求每个 geometry properties.f 有限、u 可选且 f<u；`recent:false` 不生成 recent draw layer/图例/计数。本题 P/O/V 为 reference；Q 与 R83/R04/R18 为旧 dated+recent:false。Q 的 f 是原 UTC day 的 toNumber；R 的 f 是 crosswalk 源事件日期的 toNumber。发布处理必须断言这些 f 与原日期一一对应，不能把到达时间或目录下载时间写成 f。[PH03,PH04,PH06]

**验证规则**：

1. 现有单对象 TopoJSON 命名约定不变，kind 与 geometry 相符。引用 catalogue 时，每个几何必须有全题唯一 `properties.id`；每个条目恰好 join 同层一个 feature，不重不漏。join 不把 entry id 再登记成“第二个对象”；与 event/site/layer/preset/term 仍不得重名。未知 mode、额外拼错字段、空中文、无来源、断链均构建失败，报文件/id/字段。
2. catalogue.file 必须存在、entries 双语非空、每个 source id 在本题 sources.json 内。rows.key 条目内唯一；数值有限，null 不转零；null 显示 EN “Not recorded” / ZH “未记录”。非数字状态用双语值。本版观测 rows 白名单只含 ncei-id、source-event、measurement-type、doubtful、位置与版本；**不得含 height/arrival 数值**。高度不明不妨碍绘出真实位置。[PH06]
3. at 对 Point 必须等于坐标（忽略深度第三分量）；线锚点取真实线上的点，允许量化造成的≤250 m 偏差；面锚点在面内。本版只有 Point/LineString 与 orogen 面。不能拿 bbox 中心当实测位置。PB split 两片保留不同 id，原 SEQNUM 作为普通字段。[PH04]
4. `encoding.radius` 仅 Point；每条 mag 有限且≥6；min/max/px 本题严格按以上常量。reference 不出“本年新增/本年喷发”；release 不能空。datePrecision 维持 day，所有 CE 日期用现有解析库校验，不用字符串的截年/截月比较。
5. catalogueIndex layer 必须配置 catalogue，ids 必须属于该层；索引只显示当前开启 layers 内可见条目。章节/拍先 apply layers/t 再重建可选集合；未来条目不出现在列表或可点命中集合。若索引缺省，则不增加目录组，旧主题不受影响。

**输出、视觉及绑定**：同一个 layers store 驱动图、KEY、PLATE、索引、选择；不注册第二个筛选时钟。现有 source 在载入时一次 setData，时间过滤与二分计数沿用缓存；reference 始终无日期过滤。PB 四类分别用已存在 token：张裂 `cold`、转换 `ink-2`、俯冲 `hot`、其他汇聚 `loop`；所有类均有双语文字/原码和独立开关，以单层观察支撑色觉差异，无新颜色 token。orogen 用 `neutral` 淡填，标“模型宽边界区”，不表示危险区。V 用 `neutral`，Q 用 `cold`，R 用 `loop`；选中叠 `signal`。[F10–F13,PH04]

Q 半径 `2 + 6 * clamp((mag-6)/3.5,0,1)` px；6→2、7.75→5、9.5→8，10 夹到8。V 复用既有随 zoom 点样式，图例写位置目录，不编码实时活动。图层 count 仍数 geometry features，不把 54 要素称 54 个板块；关闭=0、未加载=—，失败显示双语“图层未能载入”，不用零掩盖失败。图层属性、版本与选择摘要放原 PLATE；详情仍在章头→拍→详情→正文→章索引顺序。[PH04]

目录 inspector 含 title、summary、rows、版本/时间范围与 SourceRefs；行标签全双语。其他不常用火山专名可原名双语相同，但 summary/字段解释必须有中文。列表按 id 稳定排序、分页 50 行，搜索 title 两语与 id；最多 50 个目录行 DOM。选目录时用 at 作为视图锚点，复用既有镜头 action，所选线/点用 overlay 高亮；不创建数千个 HTML marker/leader。目录选中引线最多 1 条，事件/章拍引线仍按既有上限。

**命中、选择和 URL**：

- 指针点击/触屏采用相同 `selectCatalogue(id|null)` action；命中最小 44×44 CSS px（屏幕距离≤22 px 的搜索包围盒后精算）。旧事件/site 优先，目录候选再按距离、id 排序；重叠点可由章索引精确选择。拖动/缩放不变成点击，演示中舞台选择禁用，沿既有事件选择守卫。
- 新可选 `pick=<catalogue-id>` 与旧 `hl` 选择互斥：选择目录先清旧事件选择/hl；选择旧事件先清 pick。外部同时给合法 pick/hl 时 pick 优先；pick 无效则按旧 hl。清除选择恢复当前拍/章默认高亮。ESC 沿既有优先级，在事件关闭位置清目录详情。
- 在 core 的 typed URL engine passthrough 登记 pick，保持 ch/b/t/layers/cam 行为；有效 id 为 kebab-id，最长128字符。空/未知/非法 pick 清 URL；来源层关闭或时间回退使其不可见时清 pick 与卡片；换语言/主题保留同一个 id。
- 深链只在对应可见图层数据/元数据完成后选择。未完成=等待，不把临时缺条目当未知；失败=双语错误、清 pick，不能显示上一层旧卡。章切换/旧请求晚返回用当前状态检查，不能恢复已经清掉的选择。恢复 pick 无需另写 layers；分享链接必须已有相应层开启（沿现有 layers URL）。

**测试 API**：复用 `__atlas.engine` 可选 hooks，不给 core 全局另加方法：

```ts
engine.selectCatalogue(id: string | null): boolean; // 与 UI 同 action，隐藏/演示目标返回 false
engine.catalogueState(): {
  pick: string | null;
  layers: Record<string, { status: 'loading'|'ready'|'error'; visible: number }>;
  indexCount: number; renderedRows: number;
};
// 保留 stats().datedLayers[id].{total,visible,recent,filterUpdates}
// 加可选 mode 与 sourceUpdates（source 首次提交计1），便于性能检查。
```

数值/边界测试（合成 fixture `sample-science-layers`，仅开发用，不当真实地理）：

| 输入 | 明确期望 |
|---|---|
| 两 reference Point 无 f，1815-04-10 / 2024-12-31 | visible=2/2、recent=0、sourceUpdates=1；无“1815 新火山” |
| 旧 f=2000,u=2001；T=1999.9/2000/2001 | visible=0/1/0，缺新字段旧样式与新增窗口不变 |
| Q 的 day=2000-01-01 / 2004-12-26 / 2024-12-31，f 使用现有 toNumber | T 对应1999-12-31 / 2000-01-01 / 2004-12-25 / 2004-12-26 / 2024-12-31 时 visible=0/1/1/2/3；recent=false 恒0 |
| R两行同 source day=2004-12-26，原一条 arrival=27日（原表） | 25日=0、26日=2、27日=2；图例写整组关联而非“已到达” |
| mag=6 / 7.75 / 9.5 / 10 | r=2 / 5 / 8 / 8 px；mag=null 拒绝样本 |
| 两等距候选 ph-q-a/ph-q-b | id排序选 ph-q-a；分页/索引可选 b；pick刷新同项；关层后 pick=null |
| 两可见条目、一条未来；第50/51条翻页 | indexCount=2；未来日到达才=3；renderedRows≤50；键盘 Enter 与点击同项 |
| reference 带f、未知source、缺中文、孤立catalogue、几何重复id、NaN | 构建失败，有文件/id；null行显示未记录，合法 |
| Q一次改变日期跨过一个新增点，随后两边界间缓动 | 首次来源提交=1；静止区间 filterUpdates 不增长；列表不逐帧重建 |

**shoot/e2e**：fixture 与本题按 paper/cinema×EN/ZH，390×844、1280×720、1920×1080。核对 BG 的 REF.；02/04/05 三组观测不混；03 Hawaii 近景；06 点源→Singapore；07-4 重新选2004；未来日/关层清 pick；刷新深链、旧 hl、ESC、触摸/键盘、演示守卫、延迟加载与错误路径。shoot 用既有 chapter/beat 检查，再加目录选中后 `catalogueState`、高亮位于屏内和 inspector 顺序检查；不凭“没异常”代替数值读数。

**性能预算**：全量 5,824 PB step parts + 13 orogens + 1,214 volcanoes + 3,729 quakes + 2,664 observations；各源只初次提交，缩放与拖动零 setData。目录搜索防抖150 ms，50行分页，10k条目搜索 p95<100 ms；60次帧间缓动无边界时零 setFilter。1080p目标60 fps，iPad基线≥30 fps；单次解析/建索引超过50 ms则分批让出主线程。新增引擎 JS≤15 KB gz，不引 npm 包。几何按 §3≤2 MB，目录额外文本合计≤5 MB且懒载；不在岛 props 预灌原始数据。docs/06 已记录 TimeScene 总JS约391 KB gz、超 docs/02 旧300 KB预算：须记录实际增量及偏差，不能声称本题解决旧包体债务。

### 4.3 E-PH2：事件 impacts 的定义、估计关系与来源日期

只扩展 `events.json` 中原事件的可选 `impacts`；不引入 `ph-impacts.json`、eventId 冗余 join、新 sim/output 或新 URL 状态。

```ts
interface ImpactRecord {
  id: string;
  measure: 'deaths' | 'dead-or-missing-presumed-dead';
  estimate: { kind: 'reported' | 'about' | 'more-than'; value: number };
  label: Bilingual; scope: Bilingual;
  sourceAsOf: string; // YYYY | YYYY-MM | YYYY-MM-DD，实际日期须合法
  sourceDateKind: 'publication' | 'accessed';
  sources: string[];
  components?: Array<{ id: string; label: Bilingual; value: number; sources: string[] }>;
  componentsComplete?: boolean;
}
// event.impacts?: ImpactRecord[]
```

校验 id 全题唯一、整数 value≥0、有双语 label/scope、source ids 存在。`componentsComplete` 只有 components 存在才能给；所有 components 的值和≤总值，true 必须相等，完整分项只用于 reported 总值。一个事件不能同时有 impacts 与旧 casualties；旧事件不含 impacts 时逐字维持旧行为。more-than/about 的 components 不用于推导新总数。sourceAsOf 保留来源真实精度、不可用读取日冒称统计修订日；publication 画“来源发布日期”，accessed 画“读取日期”。语言切换只改显示文字，不改 value/measure。[F35,F36,F40,F41]

本题实际绑定：

| event / impact id | measure / estimate | scope / date / source |
|---|---|---|
| event-tambora-1815 / impact-tambora-hvo | deaths / more-than 70000 | Surrounding areas / 周边地区；publication 2011-09-29；S22 |
| event-tambora-1815 / impact-tambora-table | deaths / reported 92000 | Historical estimate; starvation identified as the main cause / 历史估计，主要死因为饥饿；accessed 2026-10-27；S21 |
| event-krakatau-1883 / impact-krakatau-estimate | deaths / about 36000 | Mainly from tsunamis / 主要由于海啸；accessed 2026-10-27；S21；精确历史数36417进细看，不再造第二总数 |
| event-sumatra-2004 / impact-indian-ocean | dead-or-missing-presumed-dead / reported 227899 | 15 countries / 15个国家；publication 2024-10；S17；componentsComplete=false |

四国 components：`impact-indonesia` 167540、`impact-sri-lanka` 35322、`impact-india` 16269、`impact-thailand` 8212，全引 S17。label EN “Dead or missing and presumed dead” / ZH “死亡或失踪并推定死亡”。总数、label、范围、来源日期同一个普通 section 常显，SourceRefs 可点。四国表尾 EN “Four countries shown; not a complete breakdown.” / ZH “这里只列四个国家，并非完整分项。”[F35,F36]

EventInspector 在摘要之后使用现有静态 Counter，以中性墨色画单行；限定词写进 label 与无障碍文本，例如 more-than70000 = “More than 70,000 / 超过70,000”，不能显示成确认死亡70000。两个 Tambora 估计各为独立单行，不进入 CounterVersus、不取平均；四国用普通可读列表，不做排名或国家色对抗。每条附定义、scope、sourceDateKind/date、SourceRefs。总量数字无动画；Counter 已静态呈现，不再改 Counter 的计数/人形算法。

绑定使用已有“选事件→EventInspector”路径；`hl` URL/章拍索引不变，无 impacts 专用 URL。测试读取新增可选 `__atlas.engine.impacts(eventId)`，返回该事件已校验的结构化 records（包括 value/kind/measure/date/complete），不存在事件返回空数组；SourceRefs 点击仍用既有弹层。

| 单测 / e2e 输入 | 期望 |
|---|---|
| 2004 四项=227343，总227899，complete=false | 通过；内部差556，不生成第五条 |
| 同一输入 complete=true | 失败，不等于总数 |
| Thailand 改9000 | 和228131>227899，失败 |
| value=null/-1/1.5、未知来源、非法2024-02-30、impact+casualties | 失败，null不转0 |
| more-than70000 / about36000 | 完整限定词在视觉与aria保留；静态精确数字可读；两语value相同 |
| publication2024-10 对 accessed2026-10-27 | 标签正确区分；不声称2026统计修订 |
| Tambora两项、四国分项、旧ww2恰两方 casualties | 新记录无VS；旧ww2仍原CounterVersus |

shoot/e2e 检查01/02/04/07-4 双语、双主题，400px量级抽屉里定义/来源可读、无横向溢出，源弹层可开/关、焦点返回。新增影响组件JS≤3 KB gz、无逐帧工作；输出记录<10 KB，不新增请求。与 E-PH1 合计新增JS≤18 KB gz。

### 4.4 兼容性与施工边界

修改范围是共享 schema、TimeScene loader/model/controller/inspector、core URL 的可选 pick、test hooks、validator 与 shoot 的目录检查；不改其他主题数据，不改 package.json。先做合成 fixture 与纯函数/失效路径测试，再接本题数据。旧 `sample-dated-layers`、ww2、ancient-civilisations、singapore-land-use、singapore-after-1965 的 dated layers、casualties、空帧、旧 URL 必须回归。既有控制帧 REFERENCE 模式与科学 REF. 图例是不同意思，文案分别写“关键帧对照”和“现代参考数据”；空帧对照无轮廓是正确结果。

## 5. 名词表（15 个，双语定义）

| id | EN / ZH | definition EN / ZH | 事实 |
|---|---|---|---|
| term-lithosphere | Lithosphere / 岩石圈 | The crust and rigid uppermost mantle. / 地壳与上地幔最上部的刚性部分。 | F01 |
| term-tectonic-plate | Tectonic plate / 构造板块 | A moving part of the lithosphere that may carry land and ocean floor. / 岩石圈中相对运动的一块，可以同时承载陆地与海底。 | F01,F04 |
| term-boundary | Plate boundary / 板块边界 | A region where neighbouring plates move relative to one another. / 相邻板块发生相对运动的地区。 | F10 |
| term-divergent | Divergent boundary / 张裂型边界 | Plates move apart. / 板块彼此分离的边界。 | F11 |
| term-subduction | Subduction / 俯冲 | Oceanic lithosphere descends beneath another plate. / 大洋岩石圈沉入另一板块下方的过程。 | F12 |
| term-transform | Transform boundary / 转换型边界 | Plates mainly slide horizontally past each other. / 板块主要沿水平方向彼此错动的边界。 | F13 |
| term-fault | Fault / 断层 | A fracture along which rock moves; sudden slip can generate an earthquake. / 岩石沿其发生位移的破裂面；突然滑动可引发地震。 | F25 |
| term-epicentre | Epicentre / 震中 | The surface point above where earthquake rupture begins. / 地震破裂开始位置正上方的地表点。 | F26 |
| term-magnitude | Magnitude / 震级 | A measure of earthquake size, distinct from local shaking. / 衡量地震规模的量，与某地摇晃强弱不同。 | F27 |
| term-intensity | Intensity / 烈度 | Shaking or effects at a particular place. / 某一地点受到的摇晃或影响程度。 | F27 |
| term-tsunami | Tsunami / 海啸 | A series of long waves caused by sudden water displacement. / 海水突然位移引起的一系列长波。 | F30 |
| term-runup | Run-up / 爬高 | The maximum height reached onshore above sea level. / 海水到达岸上、相对海平面的最大高度。 | F61 |
| term-caldera | Caldera / 破火山口 | A large volcanic collapse depression, distinct from an ordinary summit crater. / 火山塌陷形成的较大洼地，不同于普通山顶火山口。 | F23 |
| term-holocene-catalogue | Holocene volcano catalogue / 全新世火山目录 | A catalogue of volcanoes in the Holocene scope, not a list of volcanoes erupting today. / 按全新世范围收录的火山资料，不是今天正在喷发的名单。 | F53,PH04 |
| term-ring-of-fire | Ring of Fire / 环太平洋火山带 | A popular name whose geographical scope varies between sources. / 一个通俗地区名称，不同资料对它的地理范围定义不同。 | F15–F17 |

中文优先用父卷 terms 已核的用词；首次 EN/ZH 各一次 `<Term>`，see 连接 magnitude/intensity、tsunami/runup、plate/boundary；UI 未展开的学术词不堆砌。通俗正文可用“板块相离/相撞/错动”，精确名词保留在词卡。

## 6. 来源表（fact → sources 施工映射）

父卷 S# 保留 id；PH-S# 映射到 S601–S607，S608–S611 为本 spec 新增。施工将下列实际采用条目复制到本题 sources.json，每条双语 text/note 写完整发布者、标题、版本、定位、URL、读取日；本轮网页/API 复核日 2026-10-27，冻结数据采集日仍 2026-10-26。不能把读取日期写成来源发布日期。这里只采用已读到的原文/数据；被挡页面不作为必要证据。

| id | 来源 / 链接 | 本题事实 / 定位与访问记录 |
|---|---|---|
| S06 | BGS [What causes earthquakes?](https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/what-causes-earthquakes/) | F02,F03,F25；structure / plate tectonics / opening，原页 |
| S07 | NOAA [Plate tectonics and earthquakes](https://www.noaa.gov/jetstream/tsunamis/tsunami-generation-earthquakes/jetstream-max-plate-tectonics-and-earthquakes) | F01,F04,F10–F12；Earth layers / boundaries，原页 |
| S10 | NPS [Volcanic Eruptions](https://www.nps.gov/subjects/volcanoes/volcanic-eruptions.htm) | F19；Introduction / generation，原页；只为术语/示意 |
| S11 | GVP [Pacific Ring of Fire FAQ](https://volcano.si.edu/faq/Pacific_Ring_of_Fire.cfm) | F15–F17,F24；definition / statistics / exclusions；v5.4.0，687/1214、57%，原页重试后成功 |
| S12 | MSS [Earthquakes and Volcanoes](https://www.weather.gov.sg/learn_earthquakes/) | F16,F26,F29,F30,F38,F42,F43,F47；Plate tectonics / earthquakes / tsunami，原页；不打包图片 |
| S13 | NOAA [Tsunamis](https://www.noaa.gov/jetstream/tsunamis) | F30 背景；定义与机制另用 S12/S14/S15 支撑 |
| S14 | NOAA [Tsunami generation](https://www.noaa.gov/jetstream/tsunamis/tsunami-generation-earthquakes) | F31；海底与水体垂直位移、并非所有地震产生海啸，原页 |
| S15 | NOAA [Propagation](https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation) | F30,F32；整层水体、深海长波/浅化，原页；不引用数值示例 |
| S57 | NOAA [Inundation](https://www.noaa.gov/jetstream/tsunamis/tsunami-inundation) | F61；trough first / runup / first wave，原页 |
| S54 | USGS [2004 冻结查询](https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2004-12-26&endtime=2004-12-27&minmagnitude=9&limit=1)；[本轮按 id 重取](https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=official20041226005853450_30&format=geojson) | F34,F59；普通 HTTP JSON：mw9.1、30km、00:58:53.450Z、tsunami0；原快照 hash 9637d1db3e2725d205402872d539c39005f560d14b0d6d683e9fbf64c1d44907 |
| S17 | NOAA/ITIC [October 2024 poster](https://www.ncei.noaa.gov/sites/default/files/2024-11/IO_Poster_20241030_final_lowres.pdf) | F35,F36；单页表1及末部总数定义；PDF 原文与表已读，只转述事实，不复用整图 |
| S16 | NOAA SOS [Sumatra 2004](https://sos.noaa.gov/catalog/datasets/tsunami-historical-series-sumatra-2004/) | F37；Description首段 >230000/14，原页，与S17不同版本 |
| S19 | GVP [Tambora](https://volcano.si.edu/volcano.cfm?vn=264040) | F39；basic data / eruptive history，264040；原页与冻结WFS选定行 |
| S22 | USGS HVO [Tambora account](https://www.usgs.gov/observatories/hvo/news/volcano-watch-infamous-mount-tambora-rumbling-again) | F40；published2011-09-29，April10–11及>70000段，原页 |
| S21 | USGS [Eruption table](https://www.usgs.gov/faqs/which-volcanic-eruptions-were-deadliest) | F40,F41；Tambora/Krakatau两行与脚注，原页；92000、约36000、36417 |
| S23 | BCA [Earth tremor precautions](https://www1.bca.gov.sg/guidelines-and-requirements/precautions-to-take-during-earth-tremors/) | F44,F60；导语及室内指引，原页；读取2026-10-27，非实时提示 |
| S25 | BGS [Earthquake effects](https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/how-do-earthquakes-affect-people/) | F45；Ground conditions / resonant frequency，原页 |
| S44 | HKO [如何解读地震参数](https://www.hko.gov.hk/sc/education/earth-science/earthquake/00694-How-to-interpret-seismic-parameters.html) | F26,F27；published2023-05，震级与烈度、不同震级类别，原页 |
| S45 | CEDD [板块运动](https://ginfo.cedd.gov.hk/hkss/sc/publications-and-resources/educational-materials/hong-kong-geology/chapter-2/index.html) | F12–F14,F18,F23；边缘类型、热点、破火山口，原页；仅选定段落，不采用所有简化解释 |
| S35 | GVP [Terms](https://volcano.si.edu/gvp_termsofuse.cfm) | F53；Content Types/database 与 Photographs，原页；不把一般非商业条款误作数据库全部权利 |
| S37 | PB2002 [conversion](https://github.com/fraxen/tectonicplates)，[licence](https://raw.githubusercontent.com/fraxen/tectonicplates/master/LICENSE.md)，[original README](https://raw.githubusercontent.com/fraxen/tectonicplates/master/original/README.md)，[step fields](https://raw.githubusercontent.com/fraxen/tectonicplates/master/original/PB2002_steps_desc.txt) | F10–F13,F43,F54,PH04；Bird2003 DOI10.1029/2001GC000252、Hugo Ahlenius/Nordpil及转换贡献者；原始分类与ODC-BY重取 |
| S39 | Natural Earth [Terms](https://www.naturalearthdata.com/about/terms-of-use/) | F56；开头PD条款，原页 |
| PH-S01 → S601 | EOS/NTU [Public lecture](https://earthobservatory.sg/news/events/public-lecture-what-we-have-learnt-from-seismology-for-seismic-hazard-and-underground-imaging-with-a-focus-on-singapore) | PH01；About the Event，原页，2023-03-17讲座述2022-02-25/6.2 |
| PH-S02 → S602 | USGS [2022冻结查询](https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-02-25&endtime=2022-02-26&minlatitude=-1&maxlatitude=1&minlongitude=99&maxlongitude=101&minmagnitude=5.8)，[按id重取](https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=us6000gzyg&format=geojson) | PH02；HTTP JSON，6.1/mww/4km，保留epoch/updated；原冻结hash292f2447629c344eeaddfa855ee83aa8b4db739bb8b35d6965df930bb4b74c74 |
| PH-S03 → S603 | NCEI [1883](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?minYear=1883&maxYear=1883&itemsPerPage=100)，[2004](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?minYear=2004&maxYear=2004&itemsPerPage=100)，[1815](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?minYear=1815&maxYear=1815&itemsPerPage=100)，[2018](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?minYear=2018&maxYear=2018&itemsPerPage=100) | PH03；四份HTTP重取、ID/日期/eventValidity一致；不把API deaths字段覆盖海报定义 |
| PH-S04 → S604 | GVP [WFS documentation](https://volcano.si.edu/database/webservices.cfm)，[volcano WFS](https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes)，[eruption WFS](https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Eruptions)，[USGS样本](https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2000-01-01&endtime=2025-01-01&minmagnitude=6&eventtype=earthquake&orderby=time-asc) | PH04；冻结文件/coverage重算，火山WFS本轮重取1214。全量eruption重取连接中断，随后原WFS以 `cql_filter=Eruption_Number IN (16231,15589,22275)` 成功重取3条，VEI/起止/不确定标记与冻结行一致；不伪称全量重取成功。1,214/11,089/3,729是特定快照工件计数，非永恒自然常数。GVP cite Venzke/compiler、v5.4.0、DOI10.5479/si.GVP.VOTW5-2026.5.4 |
| PH-S05 → S605 | NCEI [metadata](https://www.ncei.noaa.gov/access/metadata/landing-page/bin/iso?id=gov.noaa.ngdc.mgg.hazards%3AG02151)，[Open Data Policy](https://www.ncei.noaa.gov/sites/default/files/2023-12/NCEI%20PD-10-2-02%20-%20Open%20Data%20Policy%20Signed.pdf) | PH05；metadata Use/Access Constraints与政策印刷p3 §4a–c，原文；DOI10.7289/V5PN93H7；PD范围限NOAA编纂事实 |
| PH-S06 → S606 | NCEI observations [1142](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups?tsunamiEventId=1142&itemsPerPage=100&page=1)，[2439](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups?tsunamiEventId=2439&itemsPerPage=100&page=1)，[5699](https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups?tsunamiEventId=5699&itemsPerPage=100&page=1) | PH06；本轮各page1 totalItems重核，冻结全2/22/5页与坐标重算；不宣称每行到达日期相同，不输出高度数值 |
| PH-S07 → S607 | Atlas arithmetic，输入 [S17表1](https://www.ncei.noaa.gov/sites/default/files/2024-11/IO_Poster_20241030_final_lowres.pdf) | PH07；167540+35322+16269+8212=227343；227899−227343=556，仅内部验收 |
| S608 | Atlas 本 spec §2–4、§7 的编辑参数 | 镜头、图形比例、点半径、选择命中、容差与预算是显示/工程取值；不作测量值，无外部科学主张 |
| S609 | NOAA [2004 Indian Ocean tsunami](https://www.noaa.gov/jetstream/2004tsu_max) | F37；The Impacts，17国为影响范围，原页 |
| S610 | USGS [copyright FAQ](https://www.usgs.gov/faqs/are-usgs-reportspublications-copyrighted?qt-news_science_products=0) | USGS自有数据PD与第三方作品例外；官方公开全文已读；不当作所有ComCat附件的许可 |
| S611 | BCA [官方中文名表（NAS存档）](https://www.nas.gov.sg/archivesonline/data/pdfdoc/20180522010/BCA%20Awards%202018%20chinese%20translations.pdf) | F44中文校正；中文名称表“建设局”，不是建屋发展局；只取机构名不搬奖项表 |

S05/S09/S46/S52不作为本题必要来源：未成功再次直取的部分分别改由S07/S37/S45/S11覆盖。正文数量只包Num，日期不包；字幕/目录/impact无Num语法处以结构化sources或本表fact映射保证出处；术语与影像说明沿相关事实来源。

## 7. 图像计划与 EN/ZH 文案

仅处理现成三图，不生成新图。原生成工具 built-in image_gen；完整 prompt 与迭代记录在 `art/planned/plates-and-hazards/prompts.json`，技术导出与检查在 `image-qa.json`，manifest 每张一行。都采用细石墨铅笔、19世纪科学图版、排线/点描、严格中性灰、真透明底，无背景纸纹/框/字/数字/箭头/旗/标志/地面投影；约85%画布、留边。机制示意不参与地图地理证据。[F13,F25,F32]

| 文件 / 用途 | 位置 | alt EN / ZH | caption EN / ZH |
|---|---|---|---|
| `plates-and-hazards.png` 1024²，copy 父卷封面 | 首页卡 | “An isolated erupting volcano in graphite.” / “一座正在喷发的火山的石墨素描。” | “A schematic volcano, not a record of a particular eruption.” / “火山示意，不是某一次历史喷发的记录。” [F19,F24] |
| `plates-and-hazards-fault-offset.png` 1536×1152，新图 | 03 细看震中/断层之后 | “Two layered rock blocks with a stream channel offset sideways across one fault.” / “两块有层理的岩块之间，一条河道沿单一断层发生水平错开。” | “A schematic strike-slip fault. Horizontal displacement is shown; this is not a map of a real rupture.” / “走滑断层示意：显示水平错动，不是某次真实破裂的地图。” [F13,F25] |
| `plates-and-hazards-tsunami-shoaling.png` 1536×1152，新图 | 04 海水位移说明之后 | “An ocean cross-section with a rising seabed and a broad wave nearer the coast.” / “一幅海洋剖面：海床向岸边升高，宽缓的波在近岸变高。” | “A schematic of tsunami shoaling. Heights and slopes are exaggerated; this does not reconstruct the 2004 waves.” / “海啸进入浅水区的机制示意。高度与坡度经过夸张，不是 2004 年海浪的复原。” [F32] |

核对计数：封面一锥一口一连通喷发柱；断层图两岩块、一个断层、单河道，顶面与层界没有垂直错台（透视造成的屏幕高差不当成断层倾滑）；海啸图一个连续水体、连续海床、深侧较低波与浅侧较高而未卷破波。透明边缘的小杂色须技术导出消除并保留 alpha，导出后重新打开，R=G=B 每像素验证。本轮已打开三张原PNG检查：机制、留白与无人物成立；manifest记录封面复用tries=0、断层tries=1、浅化tries=2。只做既有illustrate处理，保留透明度，发布导出后重新打开并核对；不得以新生成图替换。


## 8. 施工顺序与验收

### 8.1 施工顺序

先实现 E-PH1/E-PH2 与合成 fixture、相应最小单测/e2e、docs/06 契约；再脚手架为 draft，建立 K1/K7 两空帧与首尾参考图；依 §3 转换冻结输入、写逐文件 provenance/许可通知；先做背景 + 02/04 模板章，再铺其余章。正文 EN 200–300 词、ZH 350–500 字、各3–5段、2–4细看；中文独立成文。补齐全部来源、索引、字幕、图片与 sibling 链接后做下列门槛。本文件 §9 只在实际施工后填写，本轮留空。

### 8.2 产品验收（施工时逐项通过）

- [ ] `pnpm check`、`pnpm validate`（0 error/0 warning）、`pnpm test`、`pnpm build`、build后 `pnpm e2e` 全绿；spec写作不冒充已跑应用门槛。
- [ ] `pnpm shoot plates-and-hazards --keys --layout --beats --locale en,zh`，paper/cinema；逐张看截图，键位0失败、布局0问题、unlabelled highlights与chapter highlights两清单为空、console干净；无运行时外部请求。
- [ ] 背景+7章、38拍；每拍t/camera/layers/highlight/EN+ZH字幕完整；每章3–5拍；英文字幕≤45词、日期开头、每拍只讲可见事。章表顺序、首拍跳转、同日多拍/URL b、拖轴不换章、点章不自动播全过。
- [ ] 底部只有章轴；次级读数进PLATE；阅读面板章头→拍→详情→正文→章索引；目录条目分页/键盘/触控可达。390×844、1280×720、1920×1080与shoot其他尺寸无溢出，可点目标≥44px。选中目录没有数千HTML marker。
- [ ] entities/movements各0、7空帧、5 dated灾害+4site；site只作地点，现有EVENTS规格行计9；无虚构阵营、参与卡/面积卡/领土名；章拍无borders。已有control边界/海岸裁切规则不套到PB。
- [ ] 每个学生科学/历史数量、死亡、分歧与安全句对回 §0.3 / §6。所有数字使用Num或结构化sources；零编造引文/日期精度。cut条目不回流；BCA中文为建设局。
- [ ] 227899+定义+15国+2024-10同屏；2004四国分项标不完整；556/227343只在测试；Tambora两估计不平均，Krakatau约数与历史数区分；全无VS/排名/增长动画。
- [ ] GVP1214、eruption11089、USGS3729、PB54geometry/52code/5819seq/5824parts重算；PB四类2349+1604+1129+742=5824。无未知STEPCLASS；split几何不误删。f来自现有日期库，UTC窗口严格 `<2025-01-01`，magType保留。
- [ ] NCEI raw102/2177/410、map99/2155/410、缺坐标25；完整页/unique id/eventId重核，coverage日志保留。只绘位置与类型码；高度/到达数字不出界面；无填0、插值淹没面或时刻传播。2004关联由crosswalk，不按tsunami flag。
- [ ] PB/GVP/海岸REF版本常显；1815火山点不称当年喷发，PB不作深时或公历漂移；火环无自造圈/普适75%牌；Sunda/广义欧亚与9.1/9.2、6.1/6.2分来源。
- [ ] 每输入hash与INVENTORY一致；每输出记录来源URL/版本/hash/修改/许可/范围/误差；各源<300MB、原题<1GB；发布几何≤2MB，目录懒载≤5MB；PB误差全球≤10km、SEA≤2km，实测p50/p95/max。无运行时瓦片/CDN/外部字体/远程API。
- [ ] 派生ODC-BY、PD事实、Atlas原创NC-SA逐文件标明；LICENSE-CONTENT及THIRD-PARTY-NOTICES例外同步；无BY-SA与NC-SA同文件混合、无受限照片/海报图。大陆/海洋板块不沿陆地裁掉；日界线无贯穿长弦，现代海岸只画一次。
- [ ] 15术语首次EN/ZH各包一次Term、see全存在；所有常用名与图/文一致；非通用专名原名保留并有中文解释，无缺译标记。既有三图导出后看过、alpha/中性灰通过、caption明说示意，不当历史测量。
- [ ] E-PH1/E-PH2全部数值向量、失效/慢加载/URL往返通过；sourceUpdates=1且边界间filterUpdates不增、≤50目录DOM行、数据/JS增量与fps记录。旧300KB总JS债务按实际报告，不把未达预算写绿。
- [ ] 回归ww2（CounterVersus/旧hl）、sample-dated-layers（旧f/u/recent）、ancient-civilisations（年代）、singapore-land-use与singapore-after-1965（空帧/PLATE/卡）与来源弹层；不修改这些主题来掩盖回归。
- [ ] 留 `status: draft`；写本题REVIEW.md定位 §0.2 的实际中文段落和 §0.1代定项；Gavin阅读后才由后续发布工作改变状态。

### 8.3 本轮 spec 检查范围

只读代码/文档/研究输入、网络复核及写本文件；未建应用主题，未运行app check/test/build/e2e/shoot。已机械核对68事实结论、8章38拍、字幕英文长度、fact/source映射及文件中的范围约束；不把研究准备检查或PNG原稿检查当产品门槛通过。未修改研究档、图片、许可文件、review queue或package；无git命令、安装、登录或条款接受操作。

## 9. 引擎记录（施工后填写）

### 9.1 E-PH1 · 参考层与可选目录（2026-10-27）

实现保留datedLayers同一来源路径：topic schema新增temporal/recent/catalogue/encoding，TimeScene schema校验reference禁止f/u、dated窗口、Point mag、目录完整join/来源/锚点/双语/全题唯一id与章拍索引。`catalogueSchema.ts`只在构建期引入zod，客户端只import type；目录join、全题唯一id、几何属性与章拍索引校验抽到`catalogueValidation.ts`，共享schema仅保留短调用和既有导出转发，便于并行分支合并。目录详情显式列Record ID / 记录编号。`lib/catalogue.ts`提供可见集合、搜索分页、半径和距离/id顺序；原dated index增加reference恒定签名和recent:false，GPUsource静态提交，帧间不重建。controller首次开启层时懒取几何/目录，loading/ready/error回报到原PLATE/inspector；错误不用0掩盖。选中通过GPU overlay与单一selectCatalogue动作；章末readerEnd列表150ms搜索、50行分页，详情仍为章头→拍→详情→正文→索引。core只新增pick typed URL字段、codec顺序和SceneHost透传，无新store action/registry/schema注册。

`pick`等待启用层完成，失败或不可见则清理；旧hl在无效pick时保留，有效pick则互斥，ESC取消恢复拍/章高亮。URL显式cam保留，其他pick深链以entry.at定位。`catalogueState`包含规范字段，另加selectedScreen给shoot检查选中锚点位于视口；关闭且从未请求的层不列入状态（status没有idle），已请求层保留缓存状态。fixture `sample-science-layers`为draft，含2 reference点、3 dated+mag点、2同日关联观测与旧f/u点，并包含E-PH2合成事件。unit覆盖数值/边界、来源一次提交和60帧无边界零filter；专用e2e覆盖两语两主题、深链、未来项、关层、ESC、演示守卫、延迟与错误。shoot由主会话补入目录选中读数与截图。

与§4.2的明确差异/额外兼容：全球`basemap:{maxZoom:8}`原schema只接受local/region，新增仅maxZoom选项以支持本题既定配置；目录选择不创建HTML引线，使用GPU高亮及视图锚点（0条目录引线符合最多1条约束）；观察行白名单含longitude/latitude作为位置字段。几何解码/日期建索引按250条一批让出主线程；单个JSON响应的原生解析与最终数值排序仍是同步操作，完整文件单次解析是否超过50ms尚未有浏览器实测，不能声称硬时限通过。真实设备fps与生产Vite分包增量仍需主会话在完整数据构建后实测，不能把纯函数测试称为性能全绿。子代理遵守BRIEF-ENGINE没有运行浏览器门槛；局部check0errors、validate57topics0errors/0warnings、旧dated+新时间缓存30tests通过，完整门槛以主会话最终报告为准。

复查修复：选中GPU overlay也应用dated时间过滤，回退到未来条目前即隐藏，边界间不重写；切换主题同时刷新选中圆的填色和轮廓；deferred pick解析先核对当前store.pick，旧章异步回包不能重新选择，目标层ready即可解析、不等待无关层。`catalogue-runtime.test.ts`5项覆盖这些回归及1001要素4次批间yield、输出几何/索引与同步版本完全一致；另修复多边形bbox命中精算，拒绝距角点31px的44px包围盒候选并尊重面洞。相关GPU/缓存测试22/22通过。当前来源载入结果每次发新数组；渲染只对每层二分边界签名变化重建目录集合，帧间不扫描全部条目。

包体旁证（esbuild0.25.12，HEAD只读导出到tmp，与当前同参数browser/ES2022/minify、入口View.tsx、包含共享依赖及E-PH2、每份JS独立gzip）：基线369361B gzip、当前373748B、增量4387B（4.28KiB）；raw JS从1311989到1325302B。低于15KB新增目标；这是可复现单bundle对照，不冒称生产Vite分包实测，也没有消除原有TimeScene总包体债务。CSS单独从89109到89704B；浏览器帧率和JSON原生解析时延尚未测量。

### 9.2 E-PH2 · 事件来源估计记录（2026-10-27）

已实现 `impactSchema.ts`、`lib/impacts.ts`、`ImpactRecords.tsx` 与 EventInspector 摘要后的小分支；events schema 只加可选 impacts 与互斥校验，整题检查来源与全题唯一 id。旧事件不填 impacts 时保持原路径。`Counter.valueLabel?` 只传入包括限定词的数字文案，图标/刻度算法没有修改；同文案用于视觉与 aria。总数、定义、scope、实际精度日期和 SourceRefs 同 section 常显；独立估计分行、无动画/对抗/平均；分项保留作者顺序，不推导剩余人数。`__atlas.engine.impacts(eventId)` 沿 View 的 test hooks 返回原已校验 records，未知事件 `[]`；不加 loader/URL/store。

数值向量由 `tests/time-scene/impacts.test.ts` 的14项测试验证：227343、差556、Thailand9000→228131；完整总和与 reported 限制；null/负数/小数/非有限数、未知来源、非法2024-02-30、双语缺失、id冲突、impact+casualties均拒绝；70000下界、92000独立估计、36000约数两语与 publication/accessed 标签通过。测试也以静态 HTML 验证 Counter/SourceRefs、总数与范围同屏结构、不生成第五项。合成 fixture 的3个事件包含全部合法数据形状，另有 `tests-e2e/sample-science-impacts.spec.ts` 检查两语/两主题/普通事件选择/来源弹层。

偏差：组件类型没有“国家”单位，通用 engine 的不完整提示为 “Selected entries shown; not a complete breakdown. / 这里只列部分条目，并非完整分项。”；本题明确的“四个国家”完整原句由 impact.scope/正文提供，避免通用组件把所有分项误称国家。其余 §4.3 无范围偏差。局部单测14/14通过；浏览器门槛按 BRIEF-ENGINE 禁止在子代理运行，e2e/shoot 尚未执行，完整集成 check/validate/test/build 与浏览器/包体门槛以主会话实际结果为准。

### 9.3 两阶段整合与草稿内容（2026-10-27）

已在同一worktree先完成E-PH1/E-PH2与合成fixture，再施工`plates-and-hazards`。主题保持`status:draft`；8章、38拍、10个科学图层及10份懒载目录、5个disaster+4个site、7个空帧、15术语、33来源、3幅既有图。未修改smoke计数、package/lockfile、review-queue，未做git写入或发布。对共享core的改动仅typed `pick`字段、URL codec与SceneHost透传；新验证主体已抽到独立`catalogueValidation.ts`，未改store/keys/context/registry或`[slug].astro`。

数据转换`build-data.ts`逐项核验26个冻结输入hash；保留5824个PB分片/5819原序号、13个orogen、1214个火山位置、3729个地震和2664个有效观测位置。几何1,449,977B、目录4,982,515B，最大目录1,743,895B；PB四文件592,532B。DP900m+1e6网格后逐原始顶点量测：全球p50/p95/max=13.717/127.120/656.172m；SEA=10.366/46.112/81.363m。USGS/NCEI点坐标精确保留，UTC日用既有toNumber，观测只按显式crosswalk源日出现；无高度/到达数值、无插值或危险区。逐文件PD/ODC-BY/原创NC-SA通知与21个输出hash在topic/provenance及两份许可文件。

内容/路径偏差：`inside-the-earth`未合并，12个slug-only链接实际触发validate缺topic错误；已在原位置保留规划中配套主题文字，恢复位置逐项列REVIEW，未藏成未经校验的原始href。build-only crosswalk/转换报告放topic/provenance而非runtime data/*.json；现有engine数据schema严格，不为审计增加运行时loader或忽略键。Q的原始id在title、magType/status/UTC日在summary、epoch/updated/depth在rows，NCEI原row/event id在稳定id与summary、类型/疑问标记在rows，版本在层/summary；这种压缩保留事实且符合5MB目录预算，不增加新文件格式。

既有illustrate管线处理三图后，以near-lossless灰度WebP确保解码后每个非透明像素R=G=B；四个密度文件均有透明像素，逐张打开且在paper/cinema底色合成图上复看。实际125454/422108/234700/138682B，超过illustrate的90/260/120KB软目标；这是精确中性灰优先的明确图像体积偏差。图形/说明内容未更换，未生成新图。可复现脚本`build-illustrations.ts`和逐图hash/pixel报告在provenance/illustrations.json。

验收：整合`pnpm test`163files/4286tests全部通过（基线158files/4236tests）；`pnpm validate`58topics、0error/0warning；`pnpm check`0error/0warning（原3条hint；本轮新增unused已移除后复查）。Phase1 build117pages通过；最终build119pages通过。Playwright仅做无浏览器test--list，登记363tests/41files，不当执行通过。生产构建静态import闭包估计10files/468033B gzip，超过旧300KB总页预算；这不是浏览器网络实测，也不拿旧391KB文档值当本轮基线。第一次并行build/test时旧schemas控制区解析5s超时，单独41/41通过，随后全套也通过。未修改旧主题数据来遮盖回归。

**浏览器门槛未执行**：本次两个brief明确禁止sandbox内shoot/e2e，未尝试浏览器/桌面绕过。已添加fixture、本题e2e与shoot目录数值/inspector顺序/选中锚点截图检查，但不能据此声称手机/双主题/键盘触摸/标注布局、延迟加载浏览器路径、来源焦点、GPU帧率或生产Vite实际网络JS总量通过。`ww2`、`sample-dated-layers`、`ancient-civilisations`、`singapore-land-use`、`singapore-after-1965`的shoot/e2e回归同样留给主会话；实际设备60/30fps、原生JSON解析50ms与旧391KB总JS债务仍待浏览器量测。运行e2e固定`CI=1 ATLAS_E2E_PORT=5424 pnpm e2e`。

### 9.4 浏览器验收（主会话，2026-10-27）

在 worktree `codex/plates` 上，由 Playwright 驱动构建后的 dist 完成；机器满载（load 80–140）。Codex 原样交付的内容单独提交为 a0a2c0e。随后合入 main（`inside-the-earth` 已在其中），本节的修复再单独提交一次。

**看到的问题与已修复**

1. **点图层在区域视图里几乎看不见。** 原半径曲线是为城市尺度设计的（zoom 9 → 1.2 px），火山与 NCEI 观测点在 zoom 1–7 都只有针尖大小，例如 02-2、04-2 的说明写着“出现观测点”，图上却看不清。
   - 修复：zoom ≤ 8 时，普通点改为 2.2 px，新增环改为 3 px；zoom 9–14 的曲线不变，singapore-land-use 的镜头全在 zoom 10.2 以上，不受影响。
   - 复看：三组观测、火山、震级编码的地震都清楚可读，图例齐全。
2. **PLATE 块溢出到底部章节轴下面。** 10 个计数层，每层都带 REF.、版本和说明，而且两个 `<small>` 首尾粘连（“2026-10-26FIXED…”）。1080p 及以下，文字从章节轴的半透明底下透出来。`--layout` 的面板检查没有抓到这种溢出。
   - 修复：`.ts-plate` 改为在左列内滚动。
   - 修复：REF. · 版本 · 说明合成一行小字。若干层的版本和说明完全相同（PB2002 的四类），只在第一层写一次。
3. **目录详情排在正文和索引之后**（TimeScene 的 `inspector` 槽位于面板末尾），违反 HUD 铁律 c。shoot 的目录检查在 8 章全都失败；第一轮报告只给计数，现在改为逐条打印。
   - 修复：`CatalogueInspector` 与图层载入失败提示改用 `readerTop`（章头正下方），并在选中时滚到可见处。
   - 未改：旧的事件 / 实体详情仍在原槽位。这个问题由并行的 docs/50 E-MW3 和 docs/51 E-IR1 处理，本分支不动，避免冲突。
4. **其他小修**
   - 目录索引行加上稳定 id（2004 年观测有 332 条同名的 “ACEH, SUMATRA”）。
   - 中文影响记录改用全角冒号。
   - 04 章 EN／ZH 的总数动词按 §0.2 统一为“记载 / records”，不再写“估计 / estimates”。
   - `inside-the-earth` 已合并，REVIEW 三所列 6 处（EN／ZH 各一）恢复为只带 slug 的 `TopicLink`。
   - 修正 THIRD-PARTY-NOTICES 与生成的 SOURCES.md 里缺空格的版本号和许可写法（如 “ODC-BY1.0”“snapshot2026-10-26”）。
   - 冻结数据的单测在满载时会超过 5 s，给了 30 s 时限。
5. **性能**：所有带日期图层的 View 原本在每个计数边界都整体重渲染，现在只在目录层的边界重渲染。这样 HDB 这类普通 dated 图层拖动时保持原来的开销。
6. **旧主题行为回归**：Codex 把所有 dated 图层都改成“首次开启才载入”，而且逐层串行载入，旧主题的行为因此改变。singapore-land-use 在 e2e 中只载入当前章开启的层，旧版是全部载入；sample-dated-layers 的载入也更慢。
   - 修复：只有带 `catalogue` 的层懒载，普通 dated 层恢复在地图载入时全部取回。
   - 修复：同一批新开启的层改为并行取回、并行准备，再按定义顺序提交到地图，图层叠放顺序不变。
   - 同样的满载下实测 sample-dated-layers：从 ready 到 3 层全部就绪，main 构建 4.3–5.5 s，本分支 5.6–7.3 s。多出的时间来自 250 条一批的让出。
7. **图例缺版本**：参考层的 KEY 行加上“· REF. <release>”。本题 e2e 本来就检查这一点，但实现漏掉了。
8. **e2e 本身的问题**：
   - 手机端地图标签按设计隐藏，改为直接触发标签按钮的选择动作；
   - reload 或 goto 之后先等 `__atlas.ready`；
   - 读取几 MB 数据的就绪等待放宽到 30 s；
   - 合成 fixture 的拦截路由在 service worker 缓存之后会失效，所以 fixture spec 阻止 service worker。

**载入与预算**
- 发布几何 1.45 MB，目录 4.98 MB。
- 每层在首次开启时才载入，深链到某章只取该章的图层；`data.json` 为 46 KB。
- 首屏（背景章）取：
  - 4 个 PB 文件和火山几何：690 KB，gzip 后 118 KB；
  - 它们的目录：2.08 MB，gzip 后 121 KB；
  - 加上已有的 land-50m。
- 地震目录（1.74 MB）和 2004 年观测目录（0.93 MB）只在第 03、04 章及以后才取。
- 首屏为背景章而预取的 PB 目录文字，见 FIXES.md F1。
- 页面 JS 457 KB gz，分 10 个文件；超出 docs/02 预算的旧债仍在。

**门槛结果**（满载 load 110–220，约 10 个代理同时开浏览器）
- **全量 shoot**：`pnpm shoot plates-and-hazards --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`，用修复后的构建跑。
  - 4 个组合 × 38 拍，0 失败；目录选中检查 8 章 × 4，0 失败；console 干净，无外部请求。
  - 偶发：en-cinema 的 drag 键检查失败 1 次（帧率 1–4 fps，没能进入自由镜头）。
  - 偶发：4 次 `content wider than panel: bar`，出现在缩放到不同尺寸的瞬间；在 2560×1440 直接载入后测量为 1463 = 1463，没有溢出。
  - “chapter highlights” 的无标注清单（只列出、不算失败）各轮结果不一。
  - 合并并恢复旧图层的预载之后，又跑了一遍 `--beats`（zh/cinema）：38 拍 0 失败，目录检查 8 章全部通过。
- **`--perf --gpu`**：8 章与全部模式、预设都是 60 fps，要素 7,092–10,837 个。
- **TimeScene 回归 `--beats --keys`**：
  - ww2、singapore-after-1965、ancient-civilisations、singapore-land-use 的节拍都是 0 失败。
  - 键检查里，`h`（HUD 恢复按钮淡入）和 `drag` 在不同主题、不同轮次之间时好时坏。shoot 里本来就有说明：主线程被占时这两项会超时；本题自己的 `h` 在 4 个组合都通过。
  - 恢复预载之后，singapore-land-use 重跑两次都卡在 `page.screenshot` 30 s 超时（机器满载），没能跑完。
- **`pnpm check`** 0 错误 0 警告；**`pnpm validate`** 59 主题 0 错 0 警告；**`pnpm test`** 165 个文件、4,327 项全部通过。
- **e2e**：协调方要求不跑全量，只跑相关 spec（`--workers=2`，端口 5491）。
  - 本题、两个合成 fixture spec 与 smoke 的 deep-link 用例全部通过：plates-and-hazards 8/8，sample-science-layers 7/7，sample-science-impacts 2/2。
  - singapore-land-use（3）、dated-layers（2）与 smoke 的 sample-space（2）在同样的负载下，用 main 的导出构建同样失败，属于负载造成，不是本分支的回归。

**留给 Codex（FIXES.md）**
- F1：目录文字改为用到才取；
- F2：地震时间戳显示为 ISO UTC；
- F3：喷发段原始字段与千分位年份（“1,815”）。

**给 Gavin 的判断项**：见 REVIEW.md 五。主题保持 `status: draft`。
