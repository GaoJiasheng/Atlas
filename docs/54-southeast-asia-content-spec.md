# 东南亚 · 位置、自然环境与邻国合作 · 内容规格

TimeScene / Geo；`southeast-asia`；paper 默认，cinema 可切。2026-10-27。**定稿施工规格；目标 status: published；e2e 端口 5442。**

父档案：`/Users/gavin/work/atlas/art/research/southeast-asia/` 的 `southeast-asia-research.md`、`facts.json`、`datasets.json`。新核查在 `facts-extra.json`；F 为父事实，FX 为本轮事实。没有既定 sibling，故依用户指令省略 §0.0。可选梯田独立主题只是建议，不是本次另一个交付物。

## 0. 决策与默认值

| # | 默认决定 | 依据 / 意义 |
|---|---|---|
| 1 | 背景 + 7 章、33 拍；学科 geography，规划 P5；所有人可读 | SS P5 Part 2 [F01–F02] |
| 2 | 地理底图固定为本轮取得的现代制图快照；正文称“今天的地图 / present-day map” | 原始字节、SHA、许可均在 data/INVENTORY.md [FX01] |
| 3 | 地理、月气候、入会日期三种**阅读上下文**，共用一个地图和章节轴 | 设计；不得拿气候月份冒充历史日期 [F39] |
| 4 | `membership` 只改变固定国形的成员高亮；1967 画面也常驻“今界，按入会日期着色” | 成员日期 [F06–F12]；不是历史疆界复原 |
| 5 | 月气候已在 main：docs/50 **E-MW1–3**；直接复用 loader、渲染、采样、KEY 与原数组 | [F39,FX11–FX12]；已核本树实现，不重建月气候 |
| 6 | 山峰点 + 河流 + 海名；没有 DEM、区域植被分区、推测船线 | NE 精度与本轮实取覆盖 [F36–F37,FX02,FX09–FX10] |
| 7 | 植被用新加坡两处具名案例；地图只定位到国家/城市尺度，不能把点冒充公园边界 | [F27,FX04–FX05]；不增加未经授权的公园地理数据 |
| 8 | 梯田用地图定位菲律宾 + 已有四级剖面图，不增加水量模拟 | [F21–F24]；图中“四级”是图像设计，不是实地测量 |
| 9 | 建议以后将可操作梯田剖面独立为 `rice-terraces` SpaceScene；本主题没有 3D 部件/模拟/bindings | 一题一个 descriptor 的现状；本轮没有 sibling、没有跨题硬链接 |
| 10 | 亚细安为中文主称，东盟作首次出现别称；寮国为默认本地用词，括注老挝可作检索别名 | [S22,FX13]；南中国海采用本地用法 [FX14] |
| 11 | 三图：既有高脚屋封面、新绘梯田地形图、既有红树支柱根图；旧圆桌留存但不入最终清单 | `art/planned/southeast-asia/manifest.jsonl` |
| 12 | 无小测、视频、人物肖像、旗帜、国徽、虚构经济热区/航线 | 设计；预测问题写在正文，不引入 MathScene |

### 0.1 代定说明及事实证据等级

采用上述默认值完成可评审施工。本文件按用户授权代定所有默认值后施工；§9 单独记录实际完成与偏差。SS 课纲印刷 p.35–36 由官方**索引文本**核对，直连 PDF 被人机验证挡住；Science PDF 未核到原页。源档案的限制原样保留 [F01–F02; S01–S02]。

本轮修正父提纲两处：①“从源头看到三角洲”改为“看已取得的上游—下游线，真实源头不在本图定位”；②不再承诺山脉范围或区域植被面。Lancang / Mekong 是两个真实源要素，物理标签 point 主题没有所需山脉；用四个山峰点作山地阅读入口 [FX02,FX10]。不画连接河段来补缺口。

许可采用 BRIEF2：允许 PD/CC0/CC BY/CC BY-SA/CC BY-NC-SA/ODbL/ODC-BY；受限协议数据不入包。**本次所有地图/气候派生文件都是 PD-derived**；不把 UNESCO CC BY-SA 文本/图像并入 Atlas CC BY-NC-SA 文件，也不把 ODbL 和其他 share-alike 混为一份衍生数据库。参考事实的转述和下载素材是两件事 [F35,F38]。

## 1. 课纲、范围与写法

### 1.1 覆盖

p.35 的位置、地图、气候、植被、山河海、遗产公园由 00–05 承接；p.36 的农业、家庭手工业、科技产业、旅游、住房/文化及亚细安由 05–07 承接 [F01–F02]。文化只选择具名案例，不宣称详尽覆盖食物、游戏、习俗、音乐全部学习目标。游戏与饮食可留给课堂补充；这不是完整 SS 教科书替代品。

正文每章 EN 200–300 词、ZH 350–500 字，3–5 段、2–3 个细看。中文独立成文。每个事实性句子带 F/FX 引用的写作记录，施工时映射 `sources.json`；id 不显示给儿童。数量使用 `<Num>`，日期不用数字组件。以下镜头、字号、图像四级数量属于设计取值，不是自然数据。

### 1.2 必须讲对

- 地理区域与组织分开；国名以十一项列表为准，正文不沿用十成员旧图 [F03–F12]。
- 马来西亚跨半岛及婆罗洲，不把“大陆/岛屿”当互斥国籍分类 [FX08]。
- “月平均、参考期、资料种类、原生格网”始终能读；风和雨不共享数组索引 [F39,FX11–FX12]。
- 河流线不是水流模拟，山峰不是完整地形面，海名标签不是领海主张 [F36–F37,FX02,FX09–FX10]。
- 梯田图是一般机理图；年龄争议在细看中并列来源及研究范围 [F22–F26]。
- 不把民族文化、住房、职业或环境问题压缩成一个国家的固定属性 [F02,FX06–FX07]。

### 1.3 敏感与争议

国界保留 NE 源属性与制图免责声明；不画海上主张线。亚细安成员身份与某次会议的政治代表安排不等同；本题只讲成员日期及合作，不能按会议出席人数改地图 [F06–F12,FX15]。山峰高度不用本轮 NE 属性作现时权威值，不排名最高峰 [FX10]。

梯田年龄：UNESCO 的旧年代描述与 UCLA 研究账户并列，不把约四百年推广到所有田块，不把两者求平均；正文无需年龄数字也能讲清机制 [F25–F26]。尊重伊富高社区知识 [F21–F24]。本题没有伤亡、剥削或灾难数字；若施工扩写，重新补证据，不凭本题插图延伸。

## 2. 章节与节拍

### 2.1 公共记法

下表是内容状态合同；schema 按 §4 的最小扩展落地。`ctx`：P = `{kind:'present'}`；C1/C7 = 气候一月/七月；A1…A6 见 §3.3。每拍必须完整写 context、camera、layers、highlight、selection、caption；未选对象写 `selection:null`，避免上一拍残留。章节默认 state = 第一拍。`b` URL 从 1 起、store beat 从 0 起，沿用 docs/50。

图层缩写：B=`base`、N=`geo-countries`、S=`geo-anchors`、R=`geo-rivers`、M=`geo-marine-labels`、H=`geo-peaks`、W=`clim-wind`、Q=`clim-rain`、A=`geo-membership`。海标签只画点/文字，不画源 marine 面。所有镜头 pitch=0、bearing=0；zoom 是设计起点，施工按有效舞台宽度 fit。高亮每拍至多三个；完整国家列表通过索引，不强塞十一条引线。

| preset | EN / ZH | center / zoom | fit 限定 |
|---|---|---|---|
| `view-world` | World / 世界 | [105,8], 1.2 | 世界上下文，只 B，读者能辨亚洲位置；不用 regionBasemap 禁止全球缩放的模式 |
| `view-region` | Southeast Asia / 东南亚 | [116,8], 3.0 | [92,-12,142,30]，必要时减 zoom |
| `view-mainland` | Mainland / 大陆一侧 | [102,20], 4.0 | [92,8,110,33] |
| `view-straits` | Straits / 海峡 | [104,3], 4.6 | [95,-3,117,12] |
| `view-rivers` | River systems / 河流 | [102,20], 3.7 | [94,8,108,33] |
| `view-borneo` | Borneo / 婆罗洲 | [115,4], 4.4 | [107,-5,124,10] |
| `view-luzon` | Northern Philippines / 菲律宾北部 | [121,17], 5.0 | [118,13,125,21]；是区域参考，不能称精确田块 |
| `view-singapore` | Singapore / 新加坡 | [103.84,1.35], 8.2 | 仅国家/城市级参考，无公园边界；气候层不在此视角显示 |

### 2.2 章节总表

| # | id | 标题 EN / ZH | child’s question / 孩子的问题 | 初始上下文 | 拍数 |
|---|---|---|---|---|---|
| BG | `background` | Reading a regional map / 怎样读区域地图 | What does this map show? / 地图在告诉我什么？ | P | 4 |
| 01 | `countries-and-seas` | Countries and seas / 国家与海洋 | Do all neighbours meet the sea? / 每个邻国都靠海吗？ | P | 4 |
| 02 | `mountains-and-rivers` | Mountains and rivers / 山与河 | What tells us where a river goes? / 怎样看河流通往哪里？ | P | 4 |
| 03 | `seasons-and-rain` | Months of wind and rain / 风雨的月份 | Is January the same everywhere? / 各地一月都一样吗？ | C1 | 4 |
| 04 | `forests-and-parks` | Forests, wetlands and parks / 森林、湿地与公园 | Are all green places the same? / 绿色的地方都一样吗？ | P | 4 |
| 05 | `terraces-and-rice` | Rice on a hillside / 山坡上的稻田 | How can a slope hold a field? / 山坡怎样留住一块田？ | P | 4 |
| 06 | `work-and-connections` | Ways to live and work / 生活与工作的联系 | Does one place have only one kind of work? / 一处地方只有一种工作吗？ | P | 4 |
| 07 | `asean` | Neighbours cooperating / 邻国携手合作 | Did everyone join together? / 成员一起加入的吗？ | A1 | 5 |

### 00 · background

**正文**：地图的陆地、岛屿、国界来自实际制图资料；十一国为区域对象，不是十一张同样大小的贴纸 [F03–F04,FX01]。先从世界参考到区域，再用小型可点标记找新加坡；图上面积仍是来源面积。区分国家和城市锚点，说明地图快照、气候平均和入会日期不同 [F39,FX01]。

**细看**：资料来源与概括程度 [F35–F37]；区域/组织的区别 [F03,F06]；连回已发布 `water` 的水循环（本地状态清单 [F40]）。

背景阅读说明 EN：“The land and country shapes are a present-day cartographic snapshot. Climate views reuse monthly means for 1991–2020. ASEAN dates change membership shading on those same shapes. Local case studies are located at country scale unless a more precise source is stated.”

ZH：“陆地和国形采用今天的制图快照。气候图复用 1991–2020 年月平均；亚细安日期只改变同一组国形的成员着色。个案默认只定位到国家尺度，不能据此寻找田块或公园边界。” [F39,FX01]

索引：`geo-sgp`、全部十一国；本章国家列表源 [F04,FX01]。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| bg-1 | P / world | B / — / null | Present-day reference: start with the world before moving into Southeast Asia. | 今天的地理参考：先看世界，再进入东南亚。 | FX01 |
| bg-2 | P / region | B,N,S / geo-sgp / geo-sgp | Present-day reference: the Singapore marker locates a small country without enlarging its land. | 今天的地理参考：用标记找到新加坡，国土没有被放大。 | FX01 |
| bg-3 | P / region | B,N / geo-lao / geo-lao | Present-day reference: this country outline belongs to Lao PDR, one of the region’s eleven countries. | 今天的地理参考：这片国形是寮国，是区域十一国之一。 | F03–F05,FX01 |
| bg-4 | P / singapore | B,N,S / city-singapore / city-singapore | Present-day reference: the city point helps us read location; it is not a climate station. | 今天的地理参考：城市点帮助读位置，不代表气象站。 | F39,FX01；城市源 SX10 |

### 01 · countries-and-seas

**正文**：十一国名单在可点索引里完整呈现 [F04]。比较寮国与有海岸的邻国，但不替它编海岸 [F05,FX01]。马来西亚国形跨半岛和婆罗洲 [FX08]。四处真实海名/海峡标签用于阅读海陆位置，不出现海上主张范围 [FX09]。

**细看**：地图小国怎样点 [FX01，交互设计]；同一国家多片陆地 [FX08]；海名与国界不同 [F36,FX09]。

索引：十一国及四海名 `sea-<ne_id>`，具体 id 从 `data/anchors-sea.json` 读取，不再手抄。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 01-1 | P / mainland | B,N,S / geo-lao / geo-lao | Present-day reference: Lao PDR has no coastline. Find its neighbouring country outlines. | 今天的地理参考：寮国没有海岸，找找周围的国形。 | F05,FX01 |
| 01-2 | P / straits | B,N / geo-mys / geo-mys | Present-day reference: Malaysia’s shape reaches the peninsula and part of Borneo. | 今天的地理参考：马来西亚的国形分布在半岛和婆罗洲的一部分。 | FX08 |
| 01-3 | P / straits | B,N,M / sea-malacca / sea-malacca | Present-day reference: the Strait of Malacca label identifies a real strait, not a shipping track. | 今天的地理参考：马六甲海峡标签标示真实海峡，并非船舶轨迹。 | FX09 |
| 01-4 | P / region | B,N,M / sea-south-china,sea-java / sea-south-china | Present-day reference: compare the South China Sea and Java Sea labels on the same map. | 今天的地理参考：在同一地图比较南中国海和爪哇海的位置。 | FX09,FX14 |

表中的 `sea-malacca / sea-south-china / sea-java / sea-andaman` 是 §3.1 构建别名，施工数据中有确定映射，非缺少锚点。

### 02 · mountains-and-rivers

**正文**：MRC 说明湄公河的源区和跨国联系 [F18–F20]，地图仅显示本轮源线可覆盖部分 [FX02]。五个要素中两个属于澜沧江—湄公河，不擅接缺线、不按坐标顺序跑水粒子。另读伊洛瓦底、湄南和红河的名称 [FX02]。以京那巴鲁等峰点说明山地可在不同位置出现，不报高度或最高排行 [FX10]。

**细看**：为何图线长度不等于河长 [F20,F37]；河流与国界 [F19]；山的形状不证明成因（研究提示 [F33]，地质链到 `inside-the-earth`）。

索引：四个 `river-*` 系统、四个峰点、`geo-mys`、`geo-mmr`。河流系统选择可以高亮多个真实子要素。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 02-1 | P / rivers | B,N,R / river-mekong / river-mekong | Present-day reference: these upper and lower mapped reaches belong to the Mekong system. The true spring is not located here. | 今天的地理参考：这些上、下游图线属于湄公河水系；本图没有定位真实泉源。 | F18,FX02 |
| 02-2 | P / mainland | B,N,R / river-ayeyarwady / river-ayeyarwady | Present-day reference: select the Ayeyarwady’s source line and compare its position with the Mekong. | 今天的地理参考：选取伊洛瓦底江的来源图线，与湄公河比较位置。 | FX02 |
| 02-3 | P / mainland | B,N,R / river-chao-phraya,river-red / river-chao-phraya | Present-day reference: the Chao Phraya and Red River are separate named systems in the source data. | 今天的地理参考：湄南河和红河是资料中两套有名的水系。 | FX02 |
| 02-4 | P / borneo | B,N,H / peak-kinabalu / peak-kinabalu | Present-day reference: the Kinabalu point locates a mountain; this point layer does not show a complete relief surface. | 今天的地理参考：京那巴鲁点标示一座山，这个点图层不是完整地形面。 | FX10 |

### 03 · seasons-and-rain

**正文**：先问“同一月份能否照搬到所有地方”，再在相同标尺下比较一月、七月 [F39,FX11–FX12]。区域风是 850 hPa，再分析而非地面阵风；雨是独立格网，显示 mm/day，不偷偷换成年总量。新加坡地面来风和季风名称的关系读 MSS 正文 [F14–F16]。用本题最少必要的气候内容连接完整 `monsoon-and-weather`；该题发布前显示普通参考说明，不制造死链接。

**细看**：格点和学校不一样 [F39]；风箭头的去向、季风名称的来向 [F16; docs/50]；平均图不能预报某天 [F39]。

索引：`geo-sgp`、`cell-105-0`（气候检视动作，不是假测站）、共享 climate source records。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 03-1 | C1 / region | B,N,Q / — / null | January, 1991–2020 mean: rain is shown on its native regional cells. | 1991–2020 年一月平均：降水按原生区域格显示。 | F39 |
| 03-2 | C1 / region | B,N,Q,W / cell-105-0 / cell-105-0 | January mean: inspect one wind node and the rain cell containing the same coordinates. | 一月平均：查看一个风节点，以及包含同一坐标的降水格。 | FX11 |
| 03-3 | C7 / region | B,N,Q,W / cell-105-0 / cell-105-0 | July mean: the data change, while the rain legend and native grids stay the same. | 七月平均：数据改变，降水图例和原生格网保持相同。 | FX12 |
| 03-4 | P / singapore | B,N,S / city-singapore / city-singapore | Present-day reference: return to Singapore to distinguish local surface-wind descriptions from the regional pressure-level map. | 今天的地理参考：回到新加坡，分清本地地面风说明与区域气压层地图。 | F16,F39 |

### 04 · forests-and-parks

**正文**：以 NParks 的两个案例解释植被与栖息地，不虚构全东南亚“森林类型”分布图 [FX04–FX05]。红树图只教支柱根形态；不是所有红树都有同一种根 [FX03，图像范围限定]。两处保护区属于 ASEAN Heritage Parks，用来连接环境与合作 [F27–F28]。研究中的预测题是备选，不给本地儿童贴误解标签 [F31–F32]。

**细看**：植物也值得观察 [F31]；画树标本与画植被分布不同 [FX03–FX05]；区域保护合作 [F28]。

索引：`case-bukit-timah`、`case-sungei-buloh`、`case-mangrove-roots`。三者 `locationRef=geo-sgp`、`scope=country`。选择只高亮新加坡，详情明确“国家尺度定位”，不在同一位置叠三个假公园点。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 04-1 | P / straits | B,N,S / geo-sgp / geo-sgp | Present-day reference: Singapore is the country-scale anchor for two different habitat examples. | 今天的地理参考：以新加坡作为两个不同栖息地案例的国家尺度锚点。 | FX04–FX05 |
| 04-2 | P / singapore | B,N,S / geo-sgp / case-bukit-timah | Reference map: the selected case is Bukit Timah’s rainforest. Its park boundary is not drawn. | 参考地图：选中武吉知马雨林案例，这里没有画公园边界。 | FX04 |
| 04-3 | P / singapore | B,N,S / geo-sgp / case-sungei-buloh | Reference map: switch the reading case to Sungei Buloh’s wetlands and mangroves. | 参考地图：把阅读案例切换为双溪布洛的湿地和红树林。 | FX05 |
| 04-4 | P / singapore | B,N,S / geo-sgp / case-mangrove-roots | Reference map: the specimen figure shows arching stilt roots. The Singapore outline remains a location reference. | 参考地图：标本图展示弯拱的支柱根，新加坡国形仍只作位置参考。 | FX03 |

图随该章正文一直可读，不要求新“自动滚到图”功能；当前详情带同页图链接，点击才滚动。静态图拍不声称地图上的森林在实时生长。

### 05 · terraces-and-rice

**正文**：由菲律宾国形进入吕宋北部的区域参考，不造梯田边界 [F21]。阅读一般剖面：层面、挡墙、蓄水、较高与较低田块及管理 [F22–F24]。剖面的田级数量、几何和水深没有实测含义。将维护、知识及社区纳入农业说明 [F23]。

**细看**：图与实地的距离 [F21–F24]；年龄描述与研究的不同范围 [F25–F26]；水循环链回 `water`（已发布 [F40]）。

索引：`geo-phl`、`case-terraces`、`case-terrace-dating`（后二者 locationRef=geo-phl，国家尺度）。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 05-1 | P / region | B,N,S / geo-phl / geo-phl | Present-day reference: locate the Philippines before examining its northern terrace example. | 今天的地理参考：先找到菲律宾，再看北部的梯田案例。 | F21,FX01 |
| 05-2 | P / luzon | B,N / geo-phl / case-terraces | Reference view: the map frames northern Luzon. The separate terrace section is schematic. | 区域参考：地图框住吕宋北部，另附的梯田剖面是示意。 | F21–F22 |
| 05-3 | P / luzon | B,N / geo-phl / case-terraces-water | Reference view: read the figure’s retained fields and downhill connections, without treating them as measured channels. | 区域参考：看图中的挡墙田面与下坡连接，不把它们当作实测水道。 | F22–F24 |
| 05-4 | P / luzon | B,N / geo-phl / case-terrace-dating | Reference view: different accounts of terrace age refer to different evidence. The location map does not decide between them. | 区域参考：梯田年代的不同说法依据不同，位置图不能代替证据判断。 | F25–F26 |

### 06 · work-and-connections

**正文**：四种经济活动是课纲框架 [F02]，不是四类国籍。农业承接梯田；手工艺采用 songket 的有出处织造案例，不推定全部在家庭生产 [FX07]；科技产业采用 EDB 的新加坡半导体例子 [F29]；旅游采用地区可持续旅游规划及文化景观案例 [F30,F21]。封面住宅与 NHB 的一般形式特征可对照，但它没有具体地点、族群或年代 [FX06]。不从通用住宅图推出“某国全部住法”。

**细看**：文化传承与工作 [FX07]；旧住宅图只代表一个例子 [FX06]；地区旅游与环境讨论 [F30]。饮食、音乐、游戏不凑百科清单，见 §1.1 范围。

索引：`case-terraces`、`case-songket`（geo-mys）、`case-technology`（geo-sgp）、`case-tourism`（geo-phl）、`case-housing`（geo-sgp，泛例，非实地照片）。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 06-1 | P / luzon | B,N / geo-phl / case-terraces | Reference view: the terrace case introduces agricultural work and knowledge. | 区域参考：梯田案例带出农业劳动与知识。 | F23–F24 |
| 06-2 | P / straits | B,N / geo-mys / case-songket | Country-scale reference: the selected Malaysian example is songket weaving. | 国家尺度参考：选中的马来西亚案例是 songket 织造。 | FX07 |
| 06-3 | P / singapore | B,N,S / geo-sgp / case-technology | Country-scale reference: Singapore provides an example of technology-based industry. | 国家尺度参考：新加坡提供科技产业的一个例子。 | F29 |
| 06-4 | P / region | B,N / geo-phl / case-tourism | Regional reference: compare tourism with the other activities in the reading panel. A country can contain many kinds of work. | 区域参考：在阅读面板比较旅游与其他活动，一个国家可以有多种工作。 | F02,F30 |

### 07 · asean

**正文**：由五个创始国讲起，使用 §3.3 全部成员节点；1995 在正文、日期选择器和成员详情中有独立位置，不因拍数少而漏掉 [F06–F12]。同一现代国形只做成员状态着色。机构目的、知识共享、保护合作连接前章 [FX15,F28]。

**细看**：同日两国入会 [F10]；先观察员/原则接纳不等于正式入会 [F12]；地理区域与组织的区别 [F03,F06]。

索引：十一国成员行，可在任何日期查看，包括尚未加入者；“未加入”文字明示，不能把其国形藏掉。`case-asean-cooperation` 带地区保护合作来源。

| 拍 | ctx / preset | layers / highlight / selection | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| 07-1 | A1 / region | B,N,A / geo-sgp / geo-sgp | 8 August 1967: five founding members are highlighted on today’s country shapes. | 1967 年 8 月 8 日：在今天的国形上高亮五个创始成员。 | F06–F07 |
| 07-2 | A2 / borneo | B,N,A / geo-brn / geo-brn | 7 January 1984: Brunei Darussalam joins. The country shapes remain fixed. | 1984 年 1 月 7 日：文莱加入，国形保持不变。 | F08 |
| 07-3 | A4 / mainland | B,N,A / geo-lao,geo-mmr / geo-lao | 23 July 1997: Lao PDR and Myanmar join on the same date; Viet Nam had joined in 1995. | 1997 年 7 月 23 日：寮国和缅甸同日加入；越南已于 1995 年加入。 | F09–F10 |
| 07-4 | A5 / mainland | B,N,A / geo-khm / geo-khm | 30 April 1999: Cambodia joins, bringing the membership shown here to ten. | 1999 年 4 月 30 日：柬埔寨加入，这时图示成员数达到十个。 | F11；F06–F10 派生计数 |
| 07-5 | A6 / region | B,N,A / geo-tls / geo-tls | 26 October 2025: Timor-Leste becomes the eleventh member. The map still uses the same present-day shapes. | 2025 年 10 月 26 日：东帝汶成为第十一个成员，地图仍采用同一组今天的国形。 | F12 |

## 3. 数据与地图计划

### 3.1 已取文件、构建别名及索引

完整 URL、许可、字节、SHA、覆盖检查、图层用途见 `data/INVENTORY.md` / `inventory.json`；`datasets.json.files` 同步收录所有下载/复用/派生。总量远低于 300 MB/数据集、1 GB/主题。以下为已核实的准备输入名；运行时归并为单一 `data/geography.json`，字段见 §4；原始存档不全打包。

| 输入 / 派生 | 数量 | 用途 / 来源 |
|---|---|---|
| `countries-sea.geojson` | 11 country features | N，所有上下文共享一份几何 [FX01] |
| `rivers-sea.geojson` | 5 source features / 4 systems | R；Mekong system 包含 `name=Lancang` 与 `name=Mekong` [FX02] |
| `peaks-sea.geojson` | 4 points | H；无高度读数 [FX10] |
| `marine-reference-sea.geojson` | 4 source polygons | 只生成内部标注点，源面不入舞台 [FX09] |
| `anchors-sea.json` | 19 anchors | 11 国 LABEL_X/Y、4 峰原点、4 海区内部质心 |
| `cities-sea.geojson` | 11 cities | 城市索引备用；正文只必须 city-singapore；不称国家首都 [SX10] |
| `membership-sea.json` | 11 rows | A0–A6 的阶跃谓词；数据源 F06–F12 |
| `land-50m.json`, `land-10m-sea.json` | 既有底图副本 | B；保留原 hash；现代海岸 |
| `wind-850-1991-2020.json` | 12 × 399 vectors | W，共享 docs/50 数据 [F39] |
| `rain-gpcp-1991-2020.json` | 12 × 360 cells | Q，共享 docs/50 数据 [F39] |
| 三份 climate 原始 ASCII + monsoon-source-inventory | 原样副本 | NOAA URL→原字节→规范化数组 provenance 链 |

国家 id 固定 `geo-` + 小写 ADM0_A3；NE_ID、A3、源文件名保留 provenance，不把源别名当当代政治名称。构建海名别名表：`sea-malacca`→name=`Strait of Malacca`、`sea-south-china`→`South China Sea`、`sea-java`→`Java Sea`、`sea-andaman`→`Andaman Sea`；每个恰好一个源要素，歧义即构建失败。`peak-kinabalu`→源名 `Gunung Kinabalu`；其余峰按源名确定 id，见 `data/aliases.json`。城市只 `city-singapore` 为必用锚点。

**地理对象索引合同**：四河按系统 id 分组，Mekong 两要素同时高亮。海标签的质心经过 inside-polygon 检查，只作标签位置。准备坐标算法保留在研究目录 `data/build-prefetch.py`；运行发布脚本 `scripts/geo/southeast-asia/build.py` 保留源坐标，四河标签锚点取最长源线段的中间顶点，不是泉源。输出与输入哈希见主题 `provenance.json`，没有手画地图多边形。

**阅读个案**：`case-bukit-timah`、`case-sungei-buloh`、`case-mangrove-roots`、`case-terraces`、`case-terraces-water`、`case-terrace-dating`、`case-songket`、`case-technology`、`case-tourism`、`case-housing`、`case-asean-cooperation`。`data/geography.json.referenceItems` 给出 locationRef、来源及图像引用。它们**不是空间观测点**；没有 at 坐标，选择只高亮 locationRef 的国家几何并显示解释。

### 3.2 图层/空间规则与预算

不用 regionBasemap：它禁止看世界，与背景世界→区域冲突。沿用全球 NE 底图和东南亚高分辨率海岸叠图；maxZoom 默认 9，公园案例不承诺岛内定位。现今 inland borders 可在该 geography 分支明确开启；历史模板“默认关闭现代边界”的规则不适合本题，不能无意继承。

构建目标：每个运行地图文件 ≤ 2 MB，总地区附加数据尽量 ≤ 2 MB；首屏 JS ≤ 400 KB gz，按 docs/02；本轮源数据是存档，不全送浏览器。本次原坐标总量约 1.09 MB，直接去无关属性而不简化、不改共享边界，完整保留小国/小岛。禁止逐国独立简化导致公共边界裂缝。首尾成员图形 hash 必须相同。首屏不载整个全球源国家文件；共享气候文件只加载一次。

初版**不需要**：历史 landEras、Ma 时间、海上路线、战斗/伤亡对象、历史控制区、植被面积数、DEM。旧源码支持这些不等于本题应塞进去。

### 3.3 成员关键状态

K-PRESENT 是静态地理上下文；CL-JAN/CL-JUL 是本题拍的两个气候状态（控件仍可选 12 个月）；A0–A6 是成员筛选状态。**不是七份重绘边界**。

| id | date | 新增 | 成员数（日期谓词结果） | 来源 |
|---|---|---|---|---|
| A0 | 1967-08-07 | 尚无 ASEAN | 0 | F06–F07 的边界测试，不作为国家成立日期 |
| A1 | 1967-08-08 | IDN MYS PHL SGP THA | 5 | F06–F07 |
| A2 | 1984-01-07 | BRN | 6 | F08 |
| A3 | 1995-07-28 | VNM | 7 | F09 |
| A4 | 1997-07-23 | LAO MMR | 9 | F10 |
| A5 | 1999-04-30 | KHM | 10 | F11 |
| A6 | 2025-10-26 | TLS | 11 | F12 |

右侧日期选择器按此表跳转，不线性跨淡化某国的“部分成员”。“Today / 今日”按钮恢复 P 或在 A 中显示 asOf 对应 11（按钮标签区分）。所有模式常驻现代国形说明，A 的日期只注在 Membership date / 入会日期栏。

### 3.4 缺失数据及降级

本次没有缺失的必需地图数据。山脉标签覆盖不足→采用已取峰点；河流源头位置/缺线→字幕如实限于已取得河段；区域植被分布未许可/未取→用具名案例和标本图，不画假面。若未来单个数据链接失效，使用本轮带 hash 的本地副本；不改为外部在线请求。本树月引擎已合入，直接复用；不重复实现。

## 4. 引擎合同（复用优先，最小保留项）

### 4.1 现有能力审计

本树已读 `docs/06`「月气候模式」、TimeScene schema、`ClimatologyView`、`climatologyController`、`lib/climate`、`climateLoader`、`climatology-state`。E-MW1–3 已在 main；`sample-climate` 原生真实 NOAA 两数组直接按文件名共享，禁止另建气候 loader、雨格、风矢量、采样算法或重复导出数据。

`four-taps` 的控制区/持久路线及 `singapore-land-use` 的 datedLayers 已有真实静态几何装载、token 样式和 GPU filter；datedLayers 必填数字 f/u，不能给本题静态国形编年代以绕过。复用 MapLibre/GeoJSON 装载及过滤方式，新增的只是无日期静态要素与成员谓词。`staticSite` 已无 t，复用其信息/来源阅读模式。现有 ChapterAxis、presentation、camera preset、SourceRefs、Figure、Num、Term 全部复用。

当前批分支审计结果另附构建记录；未合入的轨道、自转、翼型、地质年代/板块 catalogue 与本题无关，不依赖其代码。删除准备稿“重建月气候”“第二套月状态/读数”“通用地理绑定”“面积排名”“3D梯田模拟”。保留 E-SEA1 与 E-SEA2，作为同一 geography 分支的小扩展，无新 sim kind。

### 4.2 E-SEA1：地理上下文和静态要素（单文件）

```ts
type GeoContext = {kind:'present'} | {kind:'climatology'; month:number} | {kind:'membership'; date:string};
// topic.yaml，且仅 time-scene/geo
temporalMode: 'geography';
geography: {asOf:'2026-10-27', geometryEpoch:string,
  dateRange:['1967-08-07','2026-10-27'], initialContext:{kind:'present'}};
// climatology / monthlyLayers 复用现有资源；新增可选 sourceMap 只映射来源元数据，解决跨题 S# 冲突。
// wind {S22:S201,S25:S20,S101:S203}；rain {S32:S202,S25:S20,S102:S204}。
// 原资源不改字节，数值/格网/时期完全不改。
```

每拍/章 `geoContext`、`selection:string|null`，每章 `index:string[]`，沿用 camera/layers/highlight/caption。t 永远 null；不建历史 time model。上下文切换原子替换，不能合并残留 month/date。C 才显示月层与采样；P/A 不显示残留雨风值。程序拒绝非整数月份和不真实/越界公历日，UI 月动作规则沿用 E-MW1。

`data/geography.json` 是唯一附加运行文件，随既有 topic data.json 发出，无额外外网资源：

```ts
{
 countries: FeatureCollection, // Polygon/MultiPolygon properties {id,a3,name:{en,zh},sources:string[],summary?:Bilingual}
 layers: [{id,kind:'point'|'line'|'area',label:Bilingual,color:'token:…',features:FeatureCollection}],
 // layer properties {id,name:Bilingual,sources:string[],summary?:Bilingual}; 同一水系可有多个真实源 feature 共用 id
 anchors: [{id,name:Bilingual,at:[lon,lat],sources:string[]}],
 members: [{id,a3,joined:'YYYY-MM-DD',sources:string[]}],
 referenceItems: [{id,label:Bilingual,summary:Bilingual,sourceIds:string[],locationRef:string,locationScope:'country',figure?:string}]
}
```

country id/A3 唯一，members 与 countries 一一对应；layers 按 kind 校验几何与有效 WGS84 坐标，源编号全部存在。anchors 使用源 LABEL_X/Y、原峰点或已验证内部海区点，不用城市坐标冒充国家面积。referenceItems 禁止 at，locationRef 指国家，选择只高亮国家并明写国家尺度；不生成公园/工厂/田块假点。case 图只给同页 Figure 链接。Mekong/Lancang 两源线使用同一 river-mekong id，不接线。选择 cell-105-0 调现有 sampleClimate(105,0,month)。

URL 沿用 ch,b,cam,layers,theme；gc=p|c|a，C 附 m=1..12，A 附 at=真实 YYYY-MM-DD。章→拍 baseline→完整合法 context override；缺 gc 不从 m/at 推断。非法 override 整体丢弃，恢复本拍 baseline，并 canonical 为完整有效 gc/m/at；移除 t 和别的 context 参数。b 从 1 起，store 从 0 起。

HUD 复用章轴/reader slot：底部只章轴；左 PLATE 地理快照、C 的时期/850hPa/mm/day/原格距或 A 的入会日/人数；右章头→拍→详情→正文→索引。不开战争面积卡/泳道。月和日期控件只在 PLATE/TOOLS/手机入口。选择、来源、图例、按键均与现有模式同一路径，触控目标 ≥44px。

### 4.3 E-SEA2：固定今界的成员筛选

`memberIds = members.filter(m => m.joined <= date)`，日期范围/真实公历校验后 ISO 日比较，含入会当日，计唯一 country id。不复用参战面积、bloc 或退出战争文案。固定 countries source 只装一次，以 GPU filter 改成员着色；日期不 setData、不复制边界、不做部分入会淡化。颜色仅 member 强调与临时选中描边两种意义，KEY 成员/尚未加入分开。十一国在全部日期仍可选。

日期控件含 A0–A6（含 1995 越南节点），允许范围内任意真实日期。成员层关闭保留 API 语义人数，PLATE 显示图层关闭而不是零。测试 API 在 __atlas.engine 增 geography/setGeoContext/selectGeography/goToGeographyBeat（复用 UI），geography 输出 context、geometryHash、countryCount、memberIds、memberCount、selection、visibleLayerIds、climateSample|null。geometryHash 用固定 country 几何，不能随日期变化。无新的跨引擎 bindings。

### 4.4 数值与状态测试（施工验收）

| # | 输入 | 精确预期 |
|---|---|---|
| T01 | A at=1967-08-07 | count=0，country geometries=11 |
| T02 | 1967-08-08 | count=5；集合 IDN,MYS,PHL,SGP,THA |
| T03 | 1984-01-06 / 1984-01-07 | count 5 / 6；BRN 一次出现 |
| T04 | 1995-07-27 / 1995-07-28 | count 6 / 7；VNM 入会 |
| T05 | 1997-07-22 / 1997-07-23 | count 7 / 9；LAO 和 MMR 同时出现，无 count=8 的日期 |
| T06 | 1999-04-30 | count=10 |
| T07 | 2025-10-25 / 2025-10-26 / 2026-10-27 | count 10 / 11 / 11 |
| T08 | A0→A6 全序列 | country geometry SHA 不变；setData 不因日期重做；几何仍 11 项 |
| T09 | country 多岛 / MultiPolygon | 同一 country 只计 1；geo-idn 不按岛数计 |
| T10 | A6→P→C1→A1 | count/legend/context 全部同步；P 无假日期，C 不出现成员图例；A 不残留月读数 |
| T11 | C1, sample(105,0) | wind index=132；u=1.1373713，v=-4.9311786；rain index=126，3.784817 mm/day；tol=1e-6 [FX11] |
| T12 | C7, sample(105,0) | u=0.11203182，v=3.5973375；rain=3.726351；tol=1e-6 [FX12] |
| T13 | magnitude of T11/T12 vector | 5.0606457947 / 3.5990815797 m/s；tol=1e-8；标作平均矢量的模，不是平均风速 |
| T14 | sample(85,0)；超出风/雨共同范围 | 两值 unavailable/null，显示 —，不补零；不延拓至图版边缘 |
| T15 | month 0/13/1.5/NaN；at=1997-02-30 | 程序输入拒绝；URL override 整体丢弃，回到本拍合法 baseline |
| T16 | ?ch=seasons-and-rain&b=3&gc=c&m=7 | 同拍 camera/layers/selection，C7；b=3 对应 store beat=2 |
| T17 | 同上但 gc=c&m=13 | 无效 override 丢弃；回第三拍 C7；canonical m=7 或用 baseline canonical 无多余参数，须全项目选一种 |
| T18 | ?ch=asean&b=1&gc=a&at=2025-10-26 | 第一拍 camera，成员 11；不改章节为最后一拍 |
| T19 | ?gc=p&m=7&at=2025-10-26&t=1967 | P；m,at,t 去掉；不显示任何日期或气候读数 |
| T20 | select case-bukit-timah 然后 case-sungei-buloh | 相同 geo-sgp 几何高亮，reader 内容/来源改变；地图新增 point 数=0 |
| T21 | select river-mekong | 2 个源 feature 高亮，另三河不亮；不补任何新 LineString |
| T22 | geo分支非geo舞台、重复A3、悬空locationRef、空zh、无效kind | build validation 失败，带具体文件/id |
| T23 | 两主题 + EN/ZH + 手机索引点击 | 33 拍经按钮/键盘/URL 落相同状态；无 hover-only 信息；无外网请求 |

T17 canonical 规则在此定为：**总是写回合法 baseline context 的完整必要参数**，故该例为 gc=c&m=7。T15 其他无效日期同理写回当前拍 baseline。此条消除表内两种候选，不留给实现猜测。

测试 API 只扩展既有 `__atlas.engine`：`geography()` 输出 `{context,geometryHash,countryCount,memberIds,memberCount,selection,visibleLayerIds,climateSample|null}`；`setGeoContext(ctx)`、`selectGeography(id|null)` 动作调用同一 store。`__atlas.state()` 和 `stats()` 继续现有名字，不发明 getState。membership id 按 A3 排序以稳定快照。截图检查依 docs/06 既有布局/按键工具，不复制测试框架。

## 5. 名词表 EN / ZH

以下为正文使用的 12 项。与事实寄存器相比，定义是短句教学转述；术语核验状态见 `facts-extra.json.terms`，未核词明确列为编辑性译名草稿，不把自然语言定义当仿真规则。

| id | EN / ZH | Definition EN / ZH | 事实 |
|---|---|---|---|
| term-region | Region / 区域 | A grouping used to study places together. / 为一起研究地方而使用的分组。 | F03（M49 统计分组语境） |
| term-landlocked | Landlocked / 内陆的 | Having no coastline. / 没有海岸。 | F05；ZH 编辑性译名 |
| term-archipelago | Archipelago / 群岛 | A group of islands; not a political membership list. / 一组岛屿，不是组织成员名单。 | FX01（图读定义）；ZH 编辑性译名 |
| term-strait | Strait / 海峡 | A narrow sea passage between land areas. / 陆地之间较窄的海上通道。 | FX09（图读定义）；ZH 编辑性译名 |
| term-river-system | River system / 水系 | Connected river reaches considered together. / 一起阅读的相连河段。 | FX02；ZH 编辑性译名 |
| term-climatology | Monthly climate mean / 月气候平均 | Calendar-month statistics over a stated multi-year period. / 指定多年时期中按月份统计的资料。 | F39 |
| term-monsoon | Monsoon / 季风 | A seasonally changing large-scale circulation. / 随季节改变的大范围环流。 | S25；F14–F16 |
| term-mangrove | Mangrove forest / 红树林 | Coastal plant communities such as those in the Sungei Buloh case. / 可借双溪布洛案例认识的海岸植物群落。 | FX05；S23 |
| term-terrace | Rice terrace / 水稻梯田 | A retained field made along a slope. / 沿坡修成、有挡护的田面。 | F22–F24 |
| term-irrigation | Irrigation / 灌溉 | Supplying water to cultivated fields. / 向耕作田地供水。 | F24；ZH 编辑性译名 |
| term-asean | ASEAN / 亚细安 | An organisation of neighbouring states with dated membership. / 成员按不同日期加入的区域国家组织。 | F06–F12,FX15 |
| term-cooperation | Cooperation / 合作 | Working together on shared matters, including conservation. / 在共同事务上携手行动，如保育。 | F28,FX15 |

扩充术语表是资料寄存器，不要求把全部 81 个词加入正文。国名/城市名来自原数据中文字段；新加坡用法优先但必须有证据，避免把 NAME_ZH 的万象等自动写成当地唯一通称。未核中文可在审稿时保留英语辅助。

## 6. 来源表与许可

完整 bibliographic 表自动附在 `source-register.md`：父 S01–S25 + 新 SX01–SX14；每条标题、发布机构、URL、locator、access_note 均保留。事实总表在两份 JSON 中共 55 条。现有 sourceId 必须匹配 S1/S12，不能用 S01 或 SX01；`source-id-map.json` 已固定父 S01→S1、新 SX01→S101（依序），施工必须应用该映射。准备稿 sources-draft.json 仅供核对；实际交付主题 `data/sources.json` 是44条双语书目，另加S201–S204的NOAA主来源及S205显示设计来源。

| 用途 | 源 / 事实 | 证据限制 |
|---|---|---|
| SS / Science | S01–S02 / F01–F02 | SS 官方索引摘文；Science 页码未核，不能冒充直接引文 |
| 国名/区域 | S03,SX01 / F03–F05,FX01,FX08 | 源快照；国家边界不是法律裁定 |
| ASEAN | S04–S06,SX14 / F06–F12,FX15 | 部分 ASEAN 403；NAS/官方索引明确注明 |
| 月气候 | S07,S20–S21,SX11 / F13–F17,F38–F39,FX11–FX12 | 同期 1991–2020，资料/网格差异常驻 |
| 河山海 | S08,S17–S19,SX02,SX08–SX09 / F18–F20,F35–F37,FX02,FX09–FX10 | 线概括、marine 只标签、山峰不报高度 |
| 梯田 | S09–S11 / F21–F26 | 机制可讲，年代并列，不复制网站图片 |
| 植被/本地合作 | S12,SX03–SX05 / F27–F28,FX03–FX05 | 国家级地理锚点、具名文字案例 |
| 经济/住房文化 | S13–S14,SX06–SX07 / F29–F30,FX06–FX07 | NHB/UNESCO 个别页 gated，只有索引事实，写作须保留限定 |
| 教学研究 | S15–S16 / F31–F34 | 不推断 Singapore P5 发生率，river abstract 无结论数字 |
| 中文 | S22–S25,SX12–SX13 | 本地/国际 attestation 区分；稿件词表见 §5 |

下载 map/climate 只含 PD-derived，作者/产品和公有领域说明写主题 `data/SOURCES.md`；不为原创内容或纯事实参考新增许可例外；项目正文/新原创图按项目内容许可。UNESCO 描述 CC BY-SA 3.0 IGO 只作事实参考，不复制/改编其图文；若以后要放原图，独立文件和 carve-out 再核。ODbL、ODC-BY、CC BY-NC-SA 本次没有外部数据文件，不能仅因允许就随意填许可。

## 7. 图像计划与检查

| file | 用途 | Caption EN / ZH | 检查与来源 |
|---|---|---|---|
| southeast-asia.png | 封面；06 住房 | A generic raised house study, not a named building. / 一般高脚屋图例，不是某栋实测建筑。 | 既有图复用，单屋、坡屋顶、支柱、楼梯、一舟；FX06 只支持一般形式 |
| southeast-asia-rice-terraces.png | 05 梯田 | A schematic section with four retained field levels; not a surveyed Ifugao terrace. / 有四级田面的示意剖面，并非伊富高实测梯田。 | 按用户要求新绘以替代圆桌；四田面、分级水面、挡墙、下坡连接；F22–F24；原图不入最终包 |
| southeast-asia-mangrove-roots.png | 04 植被 | A mangrove growth-form study showing arching stilt roots. / 展示弯拱支柱根的红树形态图。 | 复用准备稿已生成并核查的一张；FX03；不凭密集叶簇作种级鉴定 |

按用户指令，以新绘梯田地形替代旧圆桌题材。使用 imagegen skill 和内置 image_gen，先读 UNESCO/FAO 的挡墙、水平田面与灌溉事实；只生成原创一般机理图，不复制第三方图片。目检四个田面、三处下坡出口、连续田埂、各级稻株，无文字、箭头或座位象征。封面与红树图由主仓库只读来源复制到本工作树后检查复用。

所有图均以 `scripts/illustrate.ts process/figure` 处理。最终透明边缘、灰度和成品目检记录在本树 `art/planned/southeast-asia/image-qa.json`，新图确切 prompt/生成原稿/manifest 在同目录，原图仍留主仓库。本次最终 WebP：封面800/1600方图，章图1200×900。管线处理后，再从同一原 PNG 以相同 trim/pad/灰度/Lanczos 参数优化 WebP alpha 编码，并目检成品。最终封面89,170/258,758 B、梯田109,748 B、红树121,868 B，均在90/260/120 KiB预算内；透明边缘无内容，WebP RGB最大误差1，未改变共享脚本或放宽测试。

## 8. 施工顺序与验收

1. 内容规格定稿后才施工；E-MW1–3 已合入，按本合同完成 E-SEA1/2，避免第二套月引擎。
2. 用本轮 raw+derived 源制备有来源的运行文件，检查地理/成员/气候全套边界条件；先做 A1/A6 两态和 C1/C7 比较。
3. 做 BG、01、03、07 四个代表性章，再写其余正文、Figure、索引及双语来源。逐拍 URL、点击、键盘与 PRESENT 走同一状态。
4. 运行 check/validate/test/build。依 BRIEF-BUILD 明令跳过 sandbox 不可运行的 shoot/e2e，不开用户浏览器；由主会话以 `ATLAS_E2E_PORT=5442` 完成截图和浏览器门槛，未跑不记通过。

| 验收 | 明确标准 |
|---|---|
| 真实地图 | 无手画国形/河/航线；每份几何可追溯 sourceId、URL、hash；A0–A6 几何相同 |
| 数据 | countries=11；systems=4/source rivers=5；peaks=4；marine anchors=4；12 个月数组长度匹配 |
| 成员 | T01–T09 全过；无“第八个成员日期”虚构中间帧；2025-10-26 前后 10→11 |
| 时间上下文 | T10,T15–T19 全过；地理无假年，月层不接历史 t，URL canonical 稳定 |
| 气候复用 | 原数据 hash 与 monsoon 相同，T11–T14 数值过；图例/pressure/period/范围及缺测语义一致 |
| 阅读 | 33 拍、所有标题/字幕/来源双语；每章具名对象皆从索引可点；案例明确国家级而非假公园点 |
| 插图 | 3 manifest 项准确；图与地图用途分明；无绘制疆界/旗帜/文字；alpha 和等RGB 已检查 |
| UI | 44px，EN/ZH×paper/cinema，390×844 和1024×768；无溢出/遮挡，无 hover-only；底部仅章轴 |
| 离线 | 运行期无外部 fetch/tiles/fonts；来源网址仅用户主动打开外链，静态包内数据完整 |
| 版权 | 数据 PD-derived，图/文项目内容分开；每个外部素材若将来新增需独立许可记录 |

## 9. 构建记录

### 9.1 引擎实现记录（E-SEA1–2）

已落地 `geography-schema.ts`、`lib/geography.ts`、`GeographyView.tsx`、`stages/geo/geographyLayers.ts` 与小型 geography.css；shared topic/schema registry、URL/SceneHost、descriptor、validator 仅加 geography 短分支。共享 climatology controller 增加 inline source/member filter 接口，既有雨格/风矢量/loader/采样/KEY 原实现复用。draft `sample-geography`（3国真实数据子集，3章8拍）及单元/e2e 合同已写；夹具明确不代表完整区域。

**分支审计**：main..codex/monsoon-engine 与 main..codex/dinosaur 无独有提交（月气候与深时间已在 main）；sem-engine 的 5a0400d 及复核提交为 SpaceScene orbit，airfoil-content 的 b1f97b5/0230699 为 SpaceScene airfoil，均不需要；plates 的 a0a2c0e 添加 reference datedLayers/catalogue/impact，但未合入且不提供本题 context/member 语义，本实现不依赖它。four-taps 的永久路线/控制帧与 singapore-land-use 的 f/u 地图层属于年代语义；只复用不可变 GPU source/filter 模式，不伪造日期，不复制整个 catalogue 子系统。

**细化/偏差**：① geography 数据集中为单份 inline `data/geography.json`，不再增加 public 地理 loader/file，减少重复几何。② 原月文件 source 编号与本题书目冲突，月层加可选 sourceMap；运行/校验只映射来源元数据，原字节/数组不变。③ geometryHash 测试输出采用 FNV-1a 稳定校验，原始文件与派生数据 provenance 继续 SHA-256；不将浏览器校验值冒充密码学哈希。④ 成员过滤重用同一 source，不与战史 participation/面积绑定；地理来源点保留小国可点性。⑤ 图示按钮只在当前章有目标时出现，避免跨章死锚点。

**已验**：新增 geography 单元 22 项（12个成员边界、源几何不变、Mekong双源分组、strict schema、ISO日期、URL优先/canonical、上下文清理、原格网精度、GPU source 一次安装与 MapLibre style 验证）；连同既有 climate/monthly、URL、datedLayers、singapore-land-use 回归，共7文件82项全过。后续完整门槛由主会话记录；浏览器 shoot/e2e 按 BRIEF 禁令未运行，端口5442留给主会话。

### 9.2 内容实现记录

完成 `southeast-asia`（status: published）背景加七章、33拍。正文每章 EN232–252词、ZH357–398汉字，四段及2–3个细看，独立中文；章节/拍完整写上下文、相机、图层、高亮和选择，state=首拍。44条双语来源、12个已使用名词、8个镜头预设；11个国家尺度个案；封面与两幅章图。`REVIEW.md` 逐段列中文审阅重点，`AUDIT.md` 记录每段/细看/字幕事实及证据层级。

真实数据：11国、5源河段/4水系、4峰、4海名点、24个来源锚点、11条成员日期；新增单文件约1.09MB，保留取得的所有原坐标，未简化、接线或造面。`scripts/geo/southeast-asia/build.py` 可从原研究目录重建；主题 `provenance.json` 固定输入/输出SHA-256及原NE_ID。独立核验逐国/逐河与原始NE geometry一致、标签锚点来自源属性/原点/原线顶点，海名点在源面内。气候只按原stem复用真实区域两文件，399风节点/360雨格×12月，不用人工测试数组。

新绘梯田替代圆桌。生成prompt、内置image_gen原稿、manifest与像素/目检QA在本工作树 `art/planned/southeast-asia/`；经 `scripts/illustrate.ts` 处理，最终所有体积目标内。UNESCO/FAO事实只支持一般挡墙田面/灌溉关系，不将四级示意说成实测/普遍灌溉路径。图片无成员座位数。正文明确东帝汶2025-10-26正式加入、截至2026-10-27为11成员，来源S5为秘书处公告。

内容出链仅 `water` 与 `inside-the-earth`；规格没有指定反向链接落点，因此未改其他主题，未链尚未发布季风/梯田sibling。原始/派生地图为PD-derived；项目原创图文和第三方事实参考分开，未增加无适用对象的LICENSE-CONTENT/THIRD-PARTY-NOTICES例外。发布烟测计数：35主题、70徽章、geography3题、末图版35；draft夹具不计。

### 9.3 门槛与给 Gavin

最终 `pnpm check` 通过（789文件、0错误0警告、4既有提示，tsc退出0）；`pnpm validate` 通过（60主题、0错误0警告）；`pnpm test` 全过（168文件、4,369项；新增引擎22+内容21）；`pnpm build` 通过（123页、PWA），build再执行内容验证通过。`git diff --check`通过。静态输出核对EN/ZH首页35已发布卡及本题运行数据1,112,854 B、11国/5河线/44来源。没有git写入，没有package/lockfile、review-queue或next-batch改动。

浏览器 `shoot` / `e2e` 依BRIEF明令跳过，未开或控制用户浏览器，未把它们记为通过。主会话用5442端口跑浏览器合同，并核EN/ZH×paper/cinema、390×844/1024×768、33拍地图标签/镜头、图链接、离线和性能预算；回归sample-climate/four-taps/singapore-land-use。中文逐段、当地译词、梯田年代范围和课纲索引证据等级请Gavin核读；未来3D梯田与扩展文化默认不在本题范围。完整清单与命令在主题REVIEW.md，逐段/逐句事实账本在AUDIT.md。

### 9.4 浏览器验收（主会话代理，2026-10-27）

分支先 `git merge main`（含 E-IR1、airfoil、orbit `orb-t`）：SceneHost / url-state 两处冲突按“两边都保留”合并（`geoContext` 与 `orbitTime` 字段并存；URL 键序 `… t, gc, m, at, … sim, orb-t, layers …`）。`tests-e2e/smoke.spec.ts` 冲突取 main 版本，再只为本题加一：38 主题、76 徽章、geography 3 题、末图版 38，并加 southeast-asia 卡片断言。

**看过的图**：`shoot --beats` en-paper、zh-cinema（1920 演示）及 `--gpu` 复拍；另按拍链接逐拍截 en-paper 1024×768 与 zh-cinema 390×844 共 66 张；`--layout --keys --gpu` 四组 EN/ZH × paper/cinema，七种尺寸含 1024×768、390×844。国形、河线、峰点、海名、成员着色、一月/七月雨格与风箭头都与字幕相符；1997-07-23 为 9 国（越南已入）、1999 为 10、2025-10-26 为 11；格点读数一月 u/v 1.1/−4.9、雨 3.8 mm/day，七月 0.1/3.6、3.7，与 §4.4 T11–T12 一致。负载 160+ 时 swiftshader 演示截图会落后一拍才重绘（地图层停在上一拍）；同一批拍在硬件 GL 与链接重开下全部正确，记为负载伪影，不是引擎错误。

**数字**：`--beats` 0 失败，拍链接 33/33 与演示一致，章高亮全部在屏；`--keys` 0 失败（swiftshader 下 drag 偶发超时，ww2 / four-taps 同时段同样失败，GPU 复跑通过）；`--layout` 0 问题；控制台干净，无外部请求。页面 JS 452.8 KB gz（与 sample-climate 451.7、ww2 457.1 同级）；`data.json` 1,112,917 B（gzip 396 KB），按需加载。`--perf` 对月气候/地理控制器不出 draw call / fps（与 sample-climate 相同的既有缺口），只能记要素数 24、主相机缩放。回归 `--beats --keys`：sample-geography、sample-climate、ww2、four-taps、singapore-land-use、industrial-revolution 拍失败均为 0。e2e（southeast-asia、sample-geography、sample-climate、smoke，workers=2）：本题与夹具全过；sample-climate 月份提交 5 s 轮询与 smoke sample-space 在负载下失败，单独重跑通过。

**本轮修正**：① `case-tourism` 的 locationRef 按 §2 06 改回 `geo-phl`（原为 `geo-sgp`，导致 06-4 的 geo-phl 高亮被选择覆盖、地图无高亮）；`build.py` 同步，`provenance.json` 输出哈希更新。② 详情里的“查看图示”改为同页 `<a href>`，按“当前章正文含此图”判断是否显示，而不是当时可见；手机阅读面板折起时选案例也有链接（原实现手机上永远不出现）；补 44px 样式。③ e2e：两份手机测试先展开阅读面板（与 sample-climate 相同）；月份提交轮询放宽到 30 s。

**留给 Gavin**：`monsoon-and-weather` 合入后，在 03 正文第三段（季风）加 `<TopicLink slug="monsoon-and-weather">`，本题不重复季风讲解；“寮国 / 亚细安 / 南中国海”等本地用词仍待核读。1024×768 下预设镜头以整张画布为中心，目标有时落在左侧 PLATE 文字下（TimeScene 通病，非本题）。
