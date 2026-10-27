# 44 · 太阳、地球、月亮 · 内容施工 spec（v1）

`sun-earth-moon` · parent dossier `sun-earth-moon` · SpaceScene / Model3DStage · 2026-10-27 定稿。

**上线方式：直接上线**（docs/next-batch.md §一）；施工夹具和未验收内容先保持 `status: draft`，§8 全绿后发布为 `published`。本文件是引擎与内容施工依据，不表示应用已实现。paper 为标准实现，cinema 为 dark plate。背景章 + 7 正章，39 拍；5 张试一试；只用既有 3 张插图。

本主题把地面观察与空间位置、朝向、光照连起来；昼夜、季节、月相、食分别解释。[F005 F009 F016 F021 F022] 采用天文教具原型：借旋转机械原型的相位纪律，舞台不复制三球仪的齿轮机构。遵循 docs/13、atlas-space-topic skill 和 docs/08 §2 的现有 HUD；本任务只定稿此文件。

## 0. 决策、复核与证据边界

### 0.1 代定项（供 Gavin 后续审读，无阻塞项）

| # | 具体决定 |
|---|---|
| D0 | 标题 Sun, Earth and Moon / 太阳、地球、月亮；science、space、space-scene；规划 P4–P6 是编辑定位，标拓展。不再引用未重新取得的 MOE 学段断言，不声称 PSLE 必考。 |
| D1 | 保留背景 + 7 正章、39 拍、01–05 的 5 张试一试；默认无测验、无配音文件。 |
| D2 | 封面沿用机械三球仪；舞台是球体与辅助几何。教具的杆、球体比例和图上大陆不成为物理数据。 |
| D3 | 合成圆轨道、球形天体、固定地轴、平均周期；不做 N 体积分、星历、潮汐、天平动动画、实时天空或真实日食路径。 |
| D4 | 真尺度与示意尺度并存；大小与两种中心距分别标映射倍率，物理值不随显示倍率改变。暗面微弱填光是教学画法。 |
| D5 | 月相窗是地心、地球北朝上，非新加坡地平视图；日食窗取明示的模型地表点。 |
| D6 | 01–02 用太阳中心几何地平线；03 用 −0.833° 的标准计算约定。两者不共用“实测日长”标签。 |
| D7 | 原太阳表的 1.3342°N、103.7357°E 改称 Atlas 指定教学参考点；不再断言它是官方天文台坐标。只显示分钟级计算估计，删昨日滚动页面的“官方核对一致”说法。 |
| D8 | 2019-12-26 新加坡日环食事实用 NUS 现场报道补证；不采用报道中的持续分钟数，不做秒级接触时刻、观测路径或当日模型复现。 |
| D9 | 中秋只取农历八月十五与历法/满月时刻区别；不生成公历节日表，不把文化团圆叙述当物理定律，不假定所有家庭庆祝。 |
| D10 | 中文“自转、公转、地轴倾角、半球、太阳日、太阳正午、月相、上弦、下弦、同步自转、轨道交点、视直径”是编辑采用的科学译法，未声称获新加坡 MOE 中文词表认可；“朔望月、阴阳历”以 HKO 为参考；“中秋节、农历八月十五”有本地 S38 正文佐证。 |
| D11 | 删 5 个虚拟可选卡对象和专用 orbit-item URL；3 个动态观察窗复用 card / readerTop 插槽。日历、投影活动用正文细看；所有真实天体与辅助模型对象仍进入现有 parts 索引。 |
| D12 | 删除 comparison-earth 副本；02 的平行轴对照用既有插图和顺序快照，04 同步/不转比较由同一控件切换，不新增比较时钟。 |
| D13 | 精确常量、23.44°、5.145° 供模型用；学生主线取约 23.4°、约 5.1°，距离采样 363300/384400/405500 km 是 DESIGN，非绝对近远地点界限。 |
| D14 | 不用纹理、手绘大陆、NASA 图片或外部地理数据。当前 3 张原创生成 PNG 只作插画；不新增图。 |
| D15 | 安全活动只用成人监督的间接投影，背向太阳看纸面；普通太阳眼镜不能用来观日。不给儿童望远镜安装操作。 |

### 0.2 本轮方法

读取主 checkout 的 `sun-earth-moon-research.md`、`facts.json`、`facts-extra.json`、`sources.json`、`datasets.json`、`spec-draft.md`、`engine-oracles.json`、太阳表及图片 manifest；研究目录只读。草稿无字面 ⚑；将 medium、indexed-only、未核中文译名及所有学生可见数量按同等风险处理。以下状态覆盖父 dossier，旧 fact id 不改号；cut 不进入学生正文、字幕、详情或来源论证。所有外部保留结论重新取得一手正文；计算事实另读取原始 JSON 并复算。无新增逐字引文。受验证页阻挡的来源直接停止，不同意条款、不绕过验证。

### 0.3 事实核查表（43 条：verified 33 / changed 2 / cut 8）

来源 id 的完整链接在 §6；本表每行的 S 编号是该行结论的证据。verified 指本轮核对结论，模型计算不因此变成实测。

| fact id | 结果 | 定稿结论 / 处理 | 本轮来源与定位 |
|---|---|---|---|
| F001 | cut | 删 P4 课纲归属与课纲缺项断言；“拓展”为 D0。 | S01 旧缓存记录；未以旧访问冒充新核验。 |
| F002 | cut | 删 P6 课纲归属；太阳恒星身份另由 F004 支撑。 | S01 旧缓存记录。 |
| F003 | cut | 删 P5 社会学科桥梁断言。 | S02 旧缓存记录。 |
| F004 | verified | 太阳是恒星、地球是行星、月球是地球天然卫星。 | S34 Sun facts、S04 Earth facts、S07 Moon facts。 |
| F005 | verified | 地点随自转进出阳光，产生昼夜。 | S03 自转与昼夜段。 |
| F006 | verified | 太阳日约 24 h；恒星自转约 23 h 56 min；模型取 86164.09054 s。 | S10 参数表 day、mean sidereal day；S04 Orbit and Rotation。 |
| F007 | verified | 地轴从轨道法线量约 23.4°；模型取 23.44°。 | S09 Earth obliquity 23.44；S03 倾斜轴图。 |
| F008 | verified | 一年内地轴在空间方向近似不变。 | S03 tilted axis / same direction。 |
| F009 | verified | 倾角改变入射角和日长，南北半球季节相反。 | S03 半球与直射关系；日长数值按 S36 复算。 |
| F010 | verified | 近日点通常在一月、远日点在七月；距离解释不了半球相反的季节。 | S03 lopsided orbit。 |
| F011 | verified | 新加坡热带气候，有两季季风与季风间期。 | S11 Seasons。 |
| F012 | verified | 近赤道日长变化小；白昼与直接日照时数不同。 | S11 Sunshine Duration；F013 原创年表。 |
| F013 | changed | 原数值保留，地点改为 Atlas 指定参考点；2026 昼长 722.886–732.005 min 是计算估计。 | S33 365 行逐行复算一致；S26 方法正文重新获取；不称观测。 |
| F014 | cut | 删除 2026-10-26 MSS 滚动页的过去单日核对与“官方一致”字幕。 | S12 非归档证据；不把昨日记录当本轮取得的日期页面。 |
| F015 | verified | 月光主要为反射太阳光；非食时月面约半受光，背面不永远黑。 | S05 Quick Facts；S07。 |
| F016 | verified | 普通月相来自观察到的受光部分变化，不是地影造成。 | S05 All Moon Phases；S06 将地影限定于月食。 |
| F017 | verified | 公转相对恒星约 27.32 d；朔望周期平均约 29.53 d。 | S08 Orbital parameters 27.3217、29.53。 |
| F018 | verified | 上弦/下弦约半个可见月盘亮；“quarter”不是四分之一亮。 | S05 First / Third Quarter。 |
| F019 | verified | 白天可见月球；满月大致傍晚升起，不是固定钟点预报。 | S05 Daytime Moons。 |
| F020 | verified | 月球近似同步自转；真实天平动会略改可见范围。 | S21 正文；不采用 S07 关于地球也被同步锁定的含混句。 |
| F021 | verified | 日食需月球位于太阳与地表观察者之间并足够排齐。 | S06 Solar Eclipses。 |
| F022 | verified | 月食是月球进入地影，发生于满月附近的排列。 | S06 Lunar Eclipses。 |
| F023 | verified | 月轨道相对黄道倾约 5.145°，大多数新月/满月不成食。 | S08 inclination；新 S40 The Moon’s Tilted Orbit。 |
| F024 | verified | 中心排列且月球视盘较小可成日环食，不要求恰在远地点。 | S06 Annular Solar Eclipse。 |
| F025 | verified | 日偏食/日环食全程需安全观日；普通太阳眼镜不适用。 | S35 Eye Safety for Partial and Annular Solar Eclipses。 |
| F026 | verified | 2019-12-26 新加坡可见日环食。 | 新 S37 NUS Physics 现场活动报道，仅取日期、地点、食型。 |
| F027 | cut | 删 WGS84、两分钟路径采样等未用的路径数据结论。 | 原 S15；本题无地图与路径表资产。 |
| F028 | verified | 科学馆天文台提供本地天文学习活动，天气影响观察。 | S14 科学馆可读正文；不固化当前活动时段。 |
| F029 | changed | 不再发布“官方坐标/40 cm 望远镜”事实；1.3342°N、103.7357°E 是 S33 的设计输入。 | S33 meta 与 D7；原 S13 indexed-only 不能提升为已核事实。 |
| F030 | verified | 农历是结合月相月份与太阳年信息的阴阳历。 | S18 农历历法正文。 |
| F031 | verified | 中秋为农历八月十五；名称不代表新加坡有温带秋季。 | 新 S38 华族文化百科首段；气候部分 S11。 |
| F032 | verified | 历法日号与精确满月时刻不能等同。 | 新 S39 HKO 2026 赏月公报明确满月晚于中秋；主线不另加当年时刻表。 |
| F033 | verified | 平均半径太阳 695700、地球 6371、月球 1737.4 km；直径分别乘二。 | S09、S08 volumetric mean radius；不混赤道半径。 |
| F034 | verified | 地月名义中心距 384400 km，实际有变化。 | S08 semimajor axis 与 mean perigee/apogee 脚注。 |
| F035 | verified | AU 精确定义 149597870.7 km，不是每天日地距。 | S10 astronomical unit 149597870700 m。 |
| F036 | verified | 地球直径 10 mm 时，月球 2.727044420 mm、中心距 301.6794852 mm、表面间隙 295.3159630 mm。 | F033/F034 常量重新获取；S36 比例复算。学生主线中心距取约 302 mm。 |
| F037 | verified | 同尺度太阳直径约 1.092 m、日地中心距约 117.405 m。 | F033/F035 常量重新获取；S36 比例复算。 |
| F038 | verified | 日月视直径相近但不固定相等；物理尺寸相差很大。 | S09 apparent diameter、S08 opposition apparent diameter；S36 有限观察距公式。 |
| F039 | cut | 删非本地高年龄样本的误解研究归因。 | 原 S24；改为教学对照，不声称发生率。 |
| F040 | cut | 删只读摘要的认知研究结论。 | 原 S25；不影响模型证据。 |
| F041 | cut | 删未取得全文的研究年龄/分类结论。 | 原 S23；不编造本地儿童特征。 |
| F042 | verified | NOAA/Meeus 为近似计算；大气、地平线影响实际升落，工具已停止维护。 | S26 General、Refraction、maintenance notice。 |
| F043 | verified | 成人监督，背向太阳看针孔投影；不得透孔看太阳，不给儿童用未滤光光学设备直视。 | S35 pinhole projection、front-mounted solar filter、supervision。 |

**来源取舍**：S38 只取节日日期和本地中文用词。另读 SCCC 2023 旧活动页发现“中秋月球最近”等不成立的天文解释，本规格不用这些句子，也不用“必定最圆”叙述；天文部分由 S08、S18、S39 支撑。S37 只证明事件，不引用其持续时间或未来预报。

### 0.4 数字审计与实现状态

本轮在内存中读取 `prepare.py` 的 `solar/root/hhmm` 纯函数，按 S26 的阈值法重算全部 365 行：日出、正午、日落、原精度昼长均与 S33 一致。这是**复现校验，非独立观测验证**。另独立复算比例、45°/80° 日长、日月视盘、平均周期与名义弦月亮部，结果见 §4.9。所有小数型 oracle 是测试精度，学生显示精度另定。

源文件 SHA-256：S33 `ab38b692020361acea7399e0bf109f13ae116192bbbdd053f90d8bfefdc8fac1`；oracle `cf5c121fc25fceae3b3a3b4a064cf89b21f8a7e1cd81a88b1d0c6d0ae33db54d`。源码确认没有 orbit-rotation；§4 是施工契约，§8 是未来验收，均未伪称已通过。

## 1. 立场、范围与必须讲对的事实

核心问题是“观察点、朝向和光照一起改变时，会看到什么”。把自转与公转分开，再组合；圆轨道是解释几何的模型，不能带真实天象日期。[F005 F006 F008 F016；S36]

必须讲对：倾角从轨道法线量；地轴一年内近似平行，南北半球季节相反；普通月相不是地影；同面朝地仍需要自转；新月/满月还需接近轨道交点才可能食；日环食留下的亮环仍需安全观日。[F007 F008 F009 F016 F020 F021 F022 F023 F024 F025 F043]

主线覆盖一天、一年、月相周期、食、2019 本地例子及历法；细看解释约 24 h 与约 23 h 56 min、27.32 d 与 29.53 d、中心距与表面间隙、日长与日照、日号与满月时刻。[F006 F012 F017 F032 F036] 引力推导、地理路径、真实接触时刻、完整历法转换、实时天空预报不进入本题。无死亡、战争、殖民等沉重内容；观日安全平实而明确。

误解对照：01 冻结公转仍有昼夜；02 同日地距的相反半球与零倾角对照；03 计算昼长与天气日照分列；04 月球远离地影时仍有弦月；05 倾斜轨道下新月无食；06 环食不作裸眼观察；07 不把十五绑成亮部 100%。[F005 F009 F012 F016 F018 F023 F025 F032]

双语正文按 skill：每正章 EN 200–300 词、ZH 350–500 字，3–5 段，细看 2–3 块。字幕描述可见变化、EN ≤45 词，中文独立成文；每条科学主张的 fact id 见 §2。内部 F 编号不显示给学生；施工转为来源上标，正文数量用 `<Num s="S…">`，字幕纯文本且说明 SIM。术语首现才用 `<Term>`。全局名词表缩至 16 项，其余当场解释。链接仅指向实际存在的 `light-and-shadows`、`telling-time`、`water`、`plant`、`energy-conversion`；施工校验链接，不改这些主题。

## 2. 章节与逐拍字幕

### 2.0 总表与状态规则

下面 39 拍每一拍都要看见变化；不得把正文七段硬切成七拍。所有章默认：assembled、run=false、explode=0、cutaway=none、ghost=[]，只开所列 groups，隐藏其他对象；索引列天体与真正绘出的辅助线；观察窗是这些对象的视图，不作为虚拟零件。引线 ≤6；观察窗的名称放卡头，不冒充 3D 引线。每拍在章的 B0+set 上叠加，拍表“同章”也是完整确定状态。相机位置追随显示 frame。表中 set 的短写 λ/α/θ/ε/i/Ω/φ/r 分别对应 year-angle/lunar-angle/spin-angle/obliquity/lunar-tilt/node-angle/observer-lat/moon-range，施工需展开成真实 id。

| # / id | 标题 EN / ZH | 章 sim set（B0 上覆盖） | groups / camera | beats / try |
|---|---|---|---|---|
| BG before-you-start | Three bodies and one model / 三个天体与一个模型 | lab=coupled，α90，i0 | 01–04 / system-overview | 4 / 无 |
| 01 a-turning-earth | A turning Earth / 自转的地球 | lab=day，ε0，θ0，i0 | 01,02,04 / earth-close | 5 / T1 |
| 02 a-tilted-year | A tilted year / 倾斜地轴下的一年 | lab=year，λ0，φ45 | 01,02,04 / year-top | 5 / T2 |
| 03 singapore-daylight | Singapore's daylight / 新加坡的白昼 | lab=local-year，day-index79，φ1.3342 | 02 / local-year | 5 / T3 |
| 04 one-moon-many-views | One Moon, changing views / 一个月球，不同月相 | lab=moon，ε0，i0，α0 | 01–04 / system-overview | 5 / T4 |
| 05 alignment-and-eclipses | Alignment and eclipses / 排列与日月食 | lab=eclipse，ε0，φ0，i5.145，Ω90，α0 | 01–04 / alignment-side | 5 / T5 |
| 06 a-ring-over-singapore | A ring over Singapore / 新加坡上空的光环 | lab=eclipse，ε0，φ0，i0，Ω0，α0，r405500 | 01,02,03 / alignment-side | 5 / 无 |
| 07 moon-and-calendar | Moon and calendar / 月相与历法 | lab=moon，ε0，i5.145，Ω90，α0 | 01,02,03 / moon-close | 5 / 无 |

**作者展开表**：B0 在 §4.3，所有拍的 set = B0 ⊕ 章 set ⊕ 本拍 set；表中“同章”不继承前拍。`layers` 把上表编号展开为 §3.1 的 group id。章默认 `part:null`，labels/hide 如下；拍未写就用章值，写了完整替换。`hide` 先并入每章的可见清单反集；被隐藏对象仍可从索引打开有效详情，详情说明它在本拍隐藏的原因，不虚构现有 isolate 会自动解除 hide。

| 章 | 默认 labels（≤3） | 开启组内默认 hide |
|---|---|---|
| BG | sun-body,earth-body,moon-body | node-line；scale-ruler 只在 BG.3 展开显示，其他拍 hide |
| 01 | earth-body,earth-axis,observer-marker | orbital-plane,node-line,scale-ruler |
| 02 | earth-body,earth-axis,orbital-plane | node-line,scale-ruler |
| 03 | earth-body,observer-marker | earth-axis,equator-ring |
| 04 | sun-body,earth-body,moon-body | node-line,scale-ruler；i0 也由引擎隐藏 node-line |
| 05 | moon-body,lunar-track,orbital-plane | earth-track,scale-ruler |
| 06 | earth-body,moon-body,observer-marker | earth-axis,equator-ring,lunar-track |
| 07 | earth-body,moon-body,near-side-mark | earth-axis,equator-ring,lunar-track |

BG.3 明确覆写 hide：只留 earth-body、moon-body、scale-ruler（含光源的解析计算继续存在），camera alignment-side；BG.4 回章默认。05.5 明写 i0/Ω0，不依赖05.4。每拍 labels 中的对象要从 hide 排除。01 光照边界一直来自解析明暗，不增加拍级 schema。默认观察窗按 lab；moon/eclipses 内地影小图一直读同一物理快照，按现有 card/reader 折叠语义显示，无新的每拍窗口状态字段。事件日期、日历、投影是正文，不通过隐藏/新增卡对象推进。

01–07 的最终正文应 EN/ZH 独立成文，以下提纲规定正文范围，字幕为施工定稿。caption 列 EN 与 ZH 都带同一事实索引；设计动作引用 S36，不新增外部事实。页面只显示另一层来源上标，不给学生显示 F004 这样的内部研究编号。

### 2.1 背景章 BG · before-you-start

kind:background，order:0。summary EN “Use three bodies, one light source and a marked observer to connect the space view with what can be seen from Earth.” / ZH “用三个天体、一个光源和一个观察点，把空间位置与地球上的观察连起来。”[F004 F005 F015 F016]

正文提纲：① 太阳、地球、月球的身份；② 自转/公转与观察点；③ 三球仪与舞台都是教具；④ 比例、填光及 SIM/TYPICAL/DESIGN 的区别。[F004 F005 F015 F033–F038；D2 D4]

| 拍 | 明确状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| BG.1 | 同章；labels sun-body,earth-body,moon-body | The Sun is a star, Earth a planet, and the Moon Earth's natural satellite. The cover shows a teaching instrument for these three bodies. | 太阳是恒星，地球是行星，月球是地球的天然卫星。封面的三球仪是用来认识它们的教具。 | F004；D2 |
| BG.2 | camera earth-close；labels earth-body,earth-axis,observer-marker；光照对照 | The marked place is on a turning Earth. Sunlight reaches one side; the faint fill on the other side only helps us read this model. | 观察点在转动的地球上。太阳照亮朝向它的一侧；暗侧的微弱填光只为了让模型看得清。 | F005；D4 |
| BG.3 | set scale-mode=true-scale；地月框；labels earth-body,moon-body,scale-ruler | With Earth ten millimetres wide, the Moon is about three hundred and two millimetres away between centres. The surface gap is smaller. | 地球直径画成十毫米时，地月中心相距约三百零二毫米。两球表面之间的间隙要更小。 | F033 F034 F036 |
| BG.4 | scale-mode=schematic；camera system-overview；倍率读数出现；labels 三天体 | Enlarging the bodies and shortening the gaps makes the relationships readable. The physical calculations keep the original sizes and distances. | 放大球体、压缩间距，位置关系才容易看见。物理计算仍保留原来的大小和距离。 | F033–F038；D4 |

细看：“真尺度放不进同一个近景”（F036 F037）、“圆轨道不能用来预测天象日期”（S36）。index：sun-body,earth-body,moon-body,earth-axis,observer-marker,scale-ruler。名词首现 rotation,orbit；sun/earth/moon 当场释义，不造 Term id。回链 light-and-shadows、plant、energy-conversion；不引用未建兄弟主题。

### 2.2 第01章 · a-turning-earth

summary EN “Keep the Sun direction fixed and follow one place as Earth turns through light and darkness.” / ZH “固定太阳方向，跟着一个地点看地球自转怎样带来白天和黑夜。”[F005 F006]

正文提纲：① 空间中的光向与地上所见；② 标记地的昼夜；③ 固定公转仍会变明暗；④ 一太阳日与一恒星自转的区别，日常只需“约一天”。[F005 F006] 卡片 T1：vary=spin-angle；keep=[obliquity,year-angle,{en:"Sun direction fixed",zh:"太阳方向固定"}]；observe=[observer-altitude-deg,observer-day]；record 不写；无判分。run可由读者启动。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 01.1 | 同章，θ0；camera offset[0.6,0.22,0]；labels earth-body,observer-marker；暗侧 | The marked place faces away from the Sun. It is on Earth's night side. | 标记地点背向太阳，位于地球的夜晚一侧。 | F005 |
| 01.2 | θ90；camera offset[0,0.22,−0.6]；labels observer-marker,earth-axis；terminator开 | Turning Earth carries the place to the boundary between darkness and light. The Sun has stayed in the same direction. | 地球自转把这个地点带到明暗交界。太阳方向没有改变。 | F005；S36 |
| 01.3 | θ180；camera offset[−0.6,0.22,0]；observer在亮面；labels observer-marker,light-ray-guide | The same place now faces the Sun. In this zero-tilt, equatorial demonstration, sunlight comes from almost overhead. | 同一地点现在朝向太阳。在这个零倾角、赤道上的演示里，阳光几乎从头顶照来。 | F005 F007；S36 |
| 01.4 | θ270；camera offset[0,0.22,0.6]；labels observer-marker,earth-axis | Another quarter-turn takes the place towards night. One turning Earth can explain both transitions. | 再转四分之一圈，地点走向夜晚。同一个自转过程解释了进入白昼和进入黑夜。 | F005；S36 |
| 01.5 | θ360；camera system-overview；公转轨迹保持不动，labels earth-track,earth-axis | The marker returns after a full turn while the yearly path is held still. In the real moving system, a solar day and an inertial turn are slightly different. | 模型把公转固定住，标记转一圈后回到原处。在真实同时公转的系统里，一个太阳日与一次相对恒星的自转略有不同。 | F005 F006；S36 |

细看：“模型为什么冻结公转”（S36）、“约24小时与约23小时56分”（F006）、“钟表时间交给 telling-time”。index：earth-body,earth-axis,observer-marker,earth-track,light-ray-guide。名词首现 daylight,solar-day；axis 当场释义。回链 light-and-shadows。

### 2.3 第02章 · a-tilted-year

summary EN “Follow an almost parallel spin axis around a circular year and compare the two hemispheres.” / ZH “让近似平行的地轴走过圆形一年，比较南北半球的受光。”[F007–F010；S36]

正文提纲：① 从轨道法线量23.44°；② 轴的方向近似不变；③ 同距离下日长和正午高度变化；④ 南北相反；⑤ 零倾角反例与真实近日点。[F007–F010] T2：vary=year-angle；also=[obliquity,observer-lat]；keep=[{en:"Same circular orbital radius",zh:"相同的圆轨道半径"}]；observe=[geometric-daylight-hours,noon-altitude-deg]；record={chart:{y:"geometric-daylight-hours"}}；不设先猜后看判定。φ 由45改−45可以重做；不把图称温度预测。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 02.1 | 同章，λ0；显示法线与地轴夹角，labels earth-axis,orbital-plane | Earth's tilt is measured from the perpendicular to its orbital plane. Here it is about twenty-three point four degrees. | 地轴倾角从轨道平面的垂线量起，这里约二十三点四度。 | F007 |
| 02.2 | λ90，φ45；incidence开；labels earth-body,earth-axis,light-ray-guide | The northern hemisphere tilts towards the Sun. At the model latitude of forty-five degrees north, daylight lasts about fifteen hours and twenty-six minutes. | 北半球倾向太阳。在模型北纬四十五度处，白昼约十五小时二十六分。 | F008 F009；S36 |
| 02.3 | λ270，φ45；显示既有平行轴插图；labels earth-body,earth-axis | Half a model year later, the axis remains parallel. The same northern latitude now has about eight hours and thirty-four minutes of daylight. | 模型过了半年，地轴方向仍近似平行。同一北纬地点的白昼现在约八小时三十四分。 | F008 F009；S36 |
| 02.4 | λ90，φ−45；同一地球改选南纬圈 | At the opposite latitude in the south, the long and short days swap. Both hemispheres are almost the same distance from the Sun. | 换到相反的南纬地点，长日和短日交换。两个半球到太阳的距离几乎一样。 | F009 F010；S36 |
| 02.5 | λ90，φ45，ε0；倾角弧收至0，日长12h | Remove the tilt in this circular model and the seasonal daylight change disappears. Earth's real distance variation is not the explanation for opposite seasons. | 在这个圆轨道模型里取消倾角，季节性的日长变化消失。真实日地距离的变化不能解释南北半球季节相反。 | F007–F010；S36 |

细看：“近日点在一月，北半球却不是夏季”（F010）、“昼长不是气温模型”（F009 F011）、“分点的日夜不必精确十二小时”（F042、0°与−0.833°区别）。figure parallel-axes 放02.3之后，英文/中文图注见§7。index：earth-body,earth-axis,orbital-plane,equator-ring,light-ray-guide,earth-track,observer-marker。名词首现 obliquity,hemisphere。01的拍内camera offset均相对地球显示中心，target同中心；示意/真尺度之间随半径缩放，避免观察点绕到球后却仍要求引线可见。

### 2.4 第03章 · singapore-daylight

summary EN “Compare a year of calculated daylight at one Singapore reference point, keeping day length separate from sunshine and clock time.” / ZH “比较新加坡一个参考点的全年计算日长，分清白昼、日照与钟表时刻。”[F011 F012 F013 F029 F042]

正文提纲：① 同一地点全年曲线；② 六月/十二月的短差别；③ 日出日落钟点还受经度和均时差影响（模型方法说明，不由日长一项解释）；④ 云影响日照，不等于改变天文昼长；⑤ 参考点、平坦地平线、分钟取整与单日核对限制。[F011 F012 F013 F029 F042；S33] 读数来自表，不把参考球的恒定摆法当当天太阳方向。

T3：vary=day-index；keep=[{en:"Same Singapore point and horizon",zh:"同一新加坡参考点与地平线"}]；observe=[local-sunrise,local-noon,local-sunset,local-daylight-minutes]；record 不写；365日图来自E-SEM3，不用12行试验图假充。不设先猜后看，以约九分钟差值直接比较，避免原草稿 ±5% same 被误读为完全相等。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 03.1 | 同章 day79=03-20；year-chart开，静态参考点 marker；labels earth-body,observer-marker | This curve is calculated for one Singapore reference point. It estimates daylight above a standard, unobstructed horizon; it is not a weather forecast. | 曲线为新加坡一个参考点计算，估计标准无遮挡地平线上的白昼时长，不是天气预报。 | F013 F029 F042 |
| 03.2 | day172=06-21；图指针移到最大处，卡片约12h12m | Near June's longest day in this table, daylight is about twelve hours and twelve minutes. | 这份表在六月最长的一天附近，白昼约十二小时十二分钟。 | F013 |
| 03.3 | day355=12-21；图指针移到最小处，卡片约12h03m | Near December's shortest day, it is about twelve hours and three minutes. Across the year, the change is small. | 十二月最短的一天附近，白昼约十二小时三分钟。全年变化很小。 | F012 F013 |
| 03.4 | day299=10-26；三个时刻读数与太阳正午条突出 | Clock noon and solar noon differ. For this model date, sunrise is estimated at six forty-seven, solar noon at twelve forty-nine, and sunset at six fifty-one in the evening. | 钟表十二点与太阳正午不同。这个模型日期估计日出六点四十七分、太阳正午十二点四十九分、日落傍晚六点五十一分。 | F006 F013 F042；S33 |
| 03.5 | 同章 day79；year-chart旁的正文对照“daylight”与“sunshine”，不编造sunshine曲线或数值 | Singapore's monsoons and clouds still change the weather. A day can have similar daylight but fewer hours of direct sunshine. | 新加坡的季风和云量仍会改变天气。白昼长短相近的一天，也可能只有较少的直接日照。 | F011 F012 |

细看：“两个日长定义”（F013 F042）、“参考点不是家门口的天际线”（F029）、“这是一年计算表，不是实测记录”（F013 F042）。index：earth-body,observer-marker。名词首现 solar-noon；回链 telling-time、water。不显示科学馆开放时间、票价、观测成功承诺。

### 2.5 第04章 · one-moon-many-views

summary EN “Move one half-lit Moon and compare the changing illuminated part seen from Earth's centre.” / ZH “移动一个受光约一半的月球，比较从地心看见的亮部怎样变化。”[F015 F016 F018]

正文提纲：① 反射光和球体亮半面；② 地心观察窗；③ 四主月相和连续中间形状；④ 地影是另一个几何条件；⑤ 同步转动、白天月亮与远近侧区别。[F015–F020] T4：vary=lunar-angle；also=[synchronous]；keep=[{en:"Fixed Sun direction and north-up view",zh:"固定太阳方向与北朝上视图"}]；observe=[moon-lit-percent,moon-phase]；record=true；不设先猜后看判定。卡片 moon-phase 按八桶读数，不将每个桶叫准确月相时刻。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 04.1 | 同章 α0；phase-window开；labels sun-body,moon-body,earth-body | The Moon reflects sunlight. At this model new-Moon position, its bright side points mostly away from Earth. | 月球反射太阳光。在这个模型新月位置，亮面主要背向地球。 | F015 F016 |
| 04.2 | α90；phase-window右半亮；labels moon-body,light-ray-guide | From Earth's centre we now see about half the disc illuminated. First quarter names a point in the cycle, not a quarter-lit visible disc. | 从地心看，现在约半个月盘亮着。“上弦”说的是周期中的位置，不是可见圆盘只有四分之一亮。 | F016 F018 |
| 04.3 | α180；phase窗满月；eclipse 状态与地影小图说明共面遮暗 | The illuminated side now faces Earth. This is full-Moon geometry; an eclipse can dim it when the bodies are aligned, as this deliberately flat model is. | 受光面现在朝地球，这是满月的位置关系。若天体恰好排齐，月食还会遮暗它；这个刻意共面的模型正是这种排列。 | F016 F022 F023；S36 |
| 04.4 | α270；phase窗左半亮；同一地影小图表明弦月远离影轴 | At last quarter we again see about half illuminated. The Moon is well away from Earth's shadow, so that shadow is not making the phase. | 下弦时也约半个月盘亮着。月球远离地球影子，说明这个月相不是地影造成的。 | F016 F018 |
| 04.5 | α90；synchronous=false（与本章默认 true 的姿态比较）；near-side-mark突出 | Keeping one face towards Earth requires the Moon to turn as it orbits. Its far side is not permanently dark. | 月球一边公转一边自转，才能让近似同一面朝向地球。背面并不是永远黑暗。 | F015 F020 |

04.5 同步/不转用同一 synchronous 控件切换，α90 的位置不动，标记的惯性朝向改变；不增加第二个模型或时钟；正文成人可带做走圈转身活动。figure four-phases 放04.4后；避免把真实满月必食写进主线，04.3 caption 明说共面设计，05立即恢复真实倾角。[F023]

细看：“白天也能看见月亮”（F019）、“27.32与29.53天，太阳方向也在改变”（F017）、“实际有天平动，这里没有”（F020）。index：sun-body,earth-body,moon-body,near-side-mark,lunar-track,light-ray-guide。名词首现 phase,synchronous-rotation；四主月相当场释义。本章照片式亮度与地平朝向不在承诺中。

### 2.6 第05章 · alignment-and-eclipses

summary EN “Add the Moon's tilted orbital plane and compare phase, alignment and apparent size as separate conditions.” / ZH “加回倾斜的月球轨道，把月相、排列和视大小三个条件分开比较。”[F021–F024]

正文提纲：① 新月/满月不够；② 倾角、轨道交点；③ 日食的观察位置与月食的地影；④ 同一中心排列下月球视大小改变食型；⑤ 教学模型不预测真实食。[F021–F024 F038] T5：vary=node-angle；also=[lunar-angle,lunar-tilt,moon-range]；keep=[{en:"Same physical body radii",zh:"相同的物理半径"}]；observe=[solar-eclipse,lunar-eclipse,sun-diameter-deg,moon-diameter-deg]；record=true；不设先猜后看判定。切换月相/距离时记表按当前 vary 值覆盖同节点行，注明“仅当前试验设定”；不把多个输入不同的记录当单变量曲线。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 05.1 | 同章；α0,i5.145,Ω90；labels moon-body,lunar-track,orbital-plane | Near new Moon, the tilted lunar orbit can carry the Moon above or below the required alignment. New Moon alone does not guarantee a solar eclipse. | 接近新月时，倾斜月轨道可让月球偏离所需的排列。仅有新月并不保证发生日食。 | F021 F023 |
| 05.2 | Ω0；node-line突出；局部同尺度影窗开 | The orbital planes meet along a line. Near that crossing, the Moon can come between the Sun and the model observer. | 两个轨道平面沿一条线相交。在交点附近，月球才可能来到太阳与模型观察点之间。 | F021 F023 |
| 05.3 | Ω0,α180；影窗切Earth caster；labels earth-body,moon-body,node-line | At full-Moon alignment, Earth is between Sun and Moon. Now Earth's shadow can fall on the Moon: a lunar eclipse. | 满月排齐时，地球位于太阳和月球之间。地影可以落到月面上，形成月食。 | F022 F023 |
| 05.4 | α0,i0,Ω0,r363300；disc-window开，type total | In this central model alignment, the nearer Moon's apparent disc covers the Sun. The calculated model eclipse is total. | 在这个中心对齐模型里，较近月球的视圆盘盖住太阳，算出的模型食型是日全食。 | F021 F024 F038；S36 |
| 05.5 | α0,i0,Ω0,r405500；盘变小，type annular；其余按章默认 | Move the Moon farther away without changing its physical radius. A bright ring remains because its apparent disc is now smaller than the Sun's. | 月球实体半径不变，只移得更远。视圆盘变得比太阳小，周围便留下明亮光环。 | F024 F034 F038；S36 |

细看：“观察地点不同，食型会不同”（F021）、“日食、月食的影子落在哪里”（F021 F022）、“别把零倾角实验叫真实轨道”（F023）。index：sun-body,earth-body,moon-body,lunar-track,orbital-plane,node-line,observer-marker。名词首现 node,solar-eclipse,lunar-eclipse,annular-eclipse,apparent-diameter。

### 2.7 第06章 · a-ring-over-singapore

summary EN “Use Singapore's 2019 annular eclipse to distinguish an historical fact, a model explanation and a safe observation method.” / ZH “以新加坡2019年日环食为例，分清事件事实、模型解释与安全观察方法。”[F024 F025 F026 F028 F043]

正文提纲：① 日期与环食类型；② 同尺度模型解释，明确不是当日复现；③ 报道日期与无日期模型分栏；④ 本地天文学习活动与天气限制；⑤ 只看间接投影。[F024 F025 F026 F028 F043] 无试一试：不提供未核本地接触数据的地点切换。历史说明在文字卡中，模型数字不能带2019日期标题。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 06.1 | 同章；事件日期卡出现；disc-window标Model explanation | An annular solar eclipse was visible from Singapore on twenty-six December twenty-nineteen. The adjacent alignment explains a ring; it is not a timed reconstruction. | 二〇一九年十二月二十六日，新加坡可见日环食。旁边的排列解释光环怎样形成，并不是当日计时复现。 | F024 F026 |
| 06.2 | 同章；同章镜头；part=observer-marker，labels observer-marker；视盘读数标 SIM | The model observer sees a ring when the Moon appears smaller than the Sun and crosses near its centre. These numbers belong to the model. | 模型观察点看见光环，是因为月球视大小较小，又从太阳中央附近经过。这些数字属于模型。 | F021 F024 F038；S36 |
| 06.3 | r405500,α0.3；模型盘偏移为partial，历史卡保持独立 | Shift the alignment and only part of the solar disc is covered. This change belongs to the undated model; it does not move an observer across Singapore in twenty-nineteen. | 改变对齐关系，便只遮住太阳圆盘的一部分。这一改变属于无日期模型，并非把观察点沿着二〇一九年的新加坡移动。 | F021；S36 |
| 06.4 | camera earth-close；part=observer-marker，labels earth-body,observer-marker；阅读面板显示安全说明，无场馆照片 | Science Centre's observatory is one local place to learn about astronomy. Clouds can prevent a planned observation. A bright annular ring still requires safe solar viewing. | 科学馆天文台是本地学习天文的地点之一，云层可能让计划中的观测无法进行。日环食的亮环仍需要安全观察方法。 | F025 F028 |
| 06.5 | 选中 sun-body；阅读面板显示投影安全步骤，太阳在背后，只看纸面 | With an adult supervising, face away from the Sun and look at its projected image. Never look through the pinhole or look at the Sun through unfiltered binoculars or a telescope. | 在成人监督下背向太阳，只看纸面上的投影。不要透过针孔看太阳，也不要用未装专用前置太阳滤镜的望远镜直视太阳。 | F025 F043 |

06.5 用正文中的双语步骤说明背向太阳看纸面；本轮不增加插画或儿童望远镜组装活动。细看：“本地持续几秒，现有证据为什么还不能回答”（F026；S36）、“科学馆当前活动请看官方信息，不固化时段”（F028）、“普通太阳眼镜不适用”（F025 F043）。index：sun-body,moon-body,earth-body,observer-marker。回链 light-and-shadows 的投影概念；无地图预取需求。

### 2.8 第07章 · moon-and-calendar

summary EN “Compare a continuous Moon phase with the numbered days of a lunisolar calendar.” / ZH “把连续变化的月相，与阴阳历里按天编号的日期分开比较。”[F030–F032]

正文提纲：① 月相是连续过程；② 农历同时使用月相与太阳年；③ 中秋八月十五；④ 日号不保证精确满月时刻；⑤ 月亮日记记录日期、时刻、天气和画出的月相。[F017 F030–F032 F011] 日记是原创新活动，无天气数据、无农历转换器、无固定“第15天一定100%”输出。

| 拍 | 状态 / 可见变化 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|
| 07.1 | 同章α0；phase-window与连续刻度开；labels moon-body | Moon phases change continuously. A calendar instead assigns names and numbers to days. | 月相连续变化，历法则给一天一天安排名称和编号。 | F016 F030 |
| 07.2 | α90；calendar-strip只显示“month / days”的无年份例子，不绑lunar-angle | The Chinese calendar uses lunar months together with solar information about the year. That makes it lunisolar. | 农历既用与月相相关的月份，也用太阳年的信息，因此是阴阳历。 | F030 |
| 07.3 | α180；无年份节日卡“month 8, day 15”出现；不得与当前亮部百分比自动等号 | Mid-Autumn falls on day fifteen of the eighth lunar month. The festival's name does not give Singapore a temperate autumn. | 中秋是农历八月十五。“中秋”这个名字，并不表示新加坡有温带的秋季。 | F011 F031 |
| 07.4 | α135；月相窗变，calendar-strip保持独立并突出“date ≠ instant” | A calendar day and the exact full-Moon instant are different things. Day fifteen does not promise that the exact full Moon occurs that night. | 历法的一天与精确满月时刻是两回事。十五这个日号，不保证准确满月一定落在当天晚上。 | F017 F032 |
| 07.5 | α225；原创观察记录空白格式卡，不填伪观测数；月相窗标model | Record the date, time, clouds and Moon shape in an observation diary. Keep an observed sky, a model phase and a calendar entry distinct. | 观察日记可记录日期、时刻、云量和月亮形状。真实天空、模型月相和历法日期要分别记清。 | F011 F019 F030–F032；教学设计 |

细看：“29.53日不是每个月相间隔都固定”（F017）、“家里说的农历与科学分类阴阳历”（F030）、“不同家庭的节日实践不同，神话与物理解释分开”（编辑边界，不编一套普遍习俗）。index：sun-body,earth-body,moon-body,near-side-mark。名词首现 synodic-month,lunisolar-calendar；回链 telling-time。

### 2.9 章/卡/图计数

背景4拍，01–07各5拍，共39拍；8章可直接跳。5张试一试（01–05）；06–07的“活动”是文字/观察设计，不冒充可运行实测实验。13 个可选实体/辅助线对象；观察窗不设虚拟对象；3 raster assets（全复用）。39 条字幕均有 EN/ZH 及 fact 或 design 引用。所有章的 index 在施工时写成 `state.index.parts`。phase-window、disc-window、year-chart 仅表示 §4.8 的视图；calendar-strip 表示正文细看，不是 schema 字段。

## 3. 对象、零件、尺度与 HUD 数据

### 3.1 分区与 Tier-1

| 分区 | group id | EN / ZH | 内容 | token |
|---|---|---|---|---|
| 01 | solar-body | Sun / 太阳 | sun-body | token:en-light |
| 02 | earth-system | Earth / 地球 | earth-body、earth-axis、equator-ring、observer-marker | token:cold |
| 03 | moon-system | Moon / 月球 | moon-body、near-side-mark、lunar-track | token:ink-2 |
| 04 | orbital-guides | Geometry / 位置与光照 | earth-track、orbital-plane、node-line、light-ray-guide | token:ink-3 |
| — | 观察窗 | Observation / 观察 | card / readerTop 的视图，不建立组或虚拟零件 | — |

sun-body、earth-body、moon-body 是三个不同的真实天体。[F004] 辅助线、标记、观察窗都明确是教具，不是太空里的杆或物体。三球仪是封面；机械齿轮只作图像主体，不从图反推天体比值。Tier-1：三球可分、地轴过球心且倾角正确、光照面朝太阳、同步标记朝地、交点位于两轨道平面交线。[F007 F008 F015 F020 F023]

### 3.2 坐标与尺度（DESIGN；S36）

物理坐标单位 km，右手系；+Y 是黄道面法线。+X 为模型三月分点时的日地向量，+Z 由右手系确定。从 +Y 看，正向运动采用 RY(正角)，即 (cos a,0,−sin a)。这不是 ICRF，不标真实赤经或 UTC；§4 的合成时间从 0 起，没有日期。[F007 F008；DESIGN]

同尺度：k = 0.01 / 12742 m/km。位置和半径同乘 k。地球直径 10 mm；月球直径 2.7270 mm、地月中心距 301.6795 mm、表面间隙 295.3160 mm；太阳直径 1.091979 m、日地中心距 117.405329 m。[F033–F037；推导 S36] 不能同时把三个球拍得很大；允许远景里地月小到不可辨，再用地月近景。

示意尺度：太阳中心 0；地球位置乘 sSE = 3.6/AU；月球的**地心相对位移**乘 sEM = 0.75/384400 后加显示地球中心；观察点跟随地球表面显示位置。半径分别映射到太阳 0.45 m、地球 0.12 m、月球 0.12×1737.4/6371 m。显示标签逐项列“距离压缩 SE … / EM …；天体放大 S … / E … / M …”，倍率 = 各半径或距离显示系数除以 k，不能只写“未按比例”。[F033–F038；DESIGN] 日地/地月两种压缩率不相同。两模式切换只改 display 数据，物理输出必须逐值相同。

实现使用 Float64 求物理量，再减浮动原点、转 Float32 入 GPU；近景原点取地球、总览取太阳。原点变化时同一帧更新相机 target、引线、剔除范围和辅助几何。地轴方向在惯性系不追太阳，不把浮动原点画成“太阳绕地球”。日食影锥只能在同尺度局部图中画；不得用示意球直接投射出“真实地影”。[F008 F021–F024；DESIGN]

### 3.3 零件与可选对象（13 个可选模型对象）

| id | 类型 / 组 | summary EN / ZH | 几何与连接 / detail 重点 |
|---|---|---|---|
| sun-body | sphere / 01 | Provides the light. / 提供光照。 | 48×32 球面；光照解析源；不显示核内部。[F004] |
| earth-body | sphere / 02 | Carries the observing place. / 承载观察地点。 | 48×32；经纬线教具；旋转朝向由 bodyTransform 唯一驱动。[F005 F006] |
| earth-axis | cylinder / 02 | Shows the spin direction. / 表示自转轴的方向。 | 穿球心，长度显示半径的 2.7 倍；不是实杆。[F007 F008] |
| equator-ring | thin tube / 02 | Divides the hemispheres. / 标出南北半球的分界。 | 地球局部 XZ 圆，半径 1.006×球半径；教学线。[F009] |
| observer-marker | sphere / 02 | Marks the model observer. / 标出模型观察点。 | 跟随地表，常规经度模型 0°；本地年表是单独固定参考点。[F029；DESIGN] |
| moon-body | sphere / 03 | Reflects sunlight. / 反射太阳光。 | 48×32；不贴摄影纹理。[F015] |
| near-side-mark | small disc / 03 | Makes turning visible. / 让自转朝向看得见。 | 在月球局部 +X 表面，与地心方向比较；不假画成某真实陨坑。[F020；DESIGN] |
| lunar-track | tube / 03 | Marks the Moon's orbital plane. / 标出月球轨道平面。 | 从物理参数采样 128 点；显示坐标转一次。[F023；DESIGN] |
| earth-track | tube / 04 | Marks the yearly path. / 标出一年轨道。 | 128 点圆；标示“圆形解释模型”。[F008 F010；DESIGN] |
| orbital-plane | wire disc / 04 | Provides a plane for the tilt. / 提供量倾角的参考面。 | 透明填充可关；不是实物。[F007 F023] |
| node-line | cylinder / 04 | Marks the plane crossings. / 标出两个平面的交线。 | 与轨道法线叉积同向；i=0 时隐藏并读“平面重合”。[F023；DESIGN] |
| light-ray-guide | 3 thin cylinders / 04 | Shows the light direction. / 表示光照方向。 | 没有移动粒子；解析指向太阳，不用棚灯假定。[F015；S36] |
| scale-ruler | line mesh / 04 | Compares centres and surfaces. / 区分中心距与表面间隙。 | 00 专用，不在不同尺度之间共用一个无说明标尺。[F034 F036] |

三球 + 4 个本体附件 + 6 个辅助对象 = 13 个可选模型对象。`light-ray-guide` 的三条线合并为一个零件；`scale-ruler` 一件。采用现有 `state.index.parts`、`part` URL、Inspector 和 ChapterIndex；观察窗依附所观察天体。没有不可见球锚点，没有新 selection kind。无桌面、地面或接触阴影。

说明 detail 每件两段：先讲功能，再讲模型限制及来源；天然天体不写“坏了会怎样”。物理连接只写“地球绕太阳 / 月球绕地球”，不强迫已有零件链卡表示能量流。[F004 F015] 本主题光传播不用时间粒子模拟，不暗示光瞬时传播的实测速度。

### 3.4 动画、视图与镜头

没有独立 rpm/hz 自转动画；所有角度由 E-SEM1 的同一个 t 计算。run 默认 false；拍之间改变参数，读者按 SPACE 才播放所在实验（P 演示仍手动翻拍）。01–02 的 axis 不随相机 ORBIT 改变，04 的北朝上观察窗禁止普通相机 turntable。X-RAY / CUTAWAY / EXPLODED 在本题没有解释价值，显式禁用并用双语说明；不把移动月球称为爆炸拆解。F/run 控制共享模型钟而不是光的有无。

镜头预设六个（DESIGN 起点，后续施工按截图微调，不能改物理量）：`system-overview` pos [7,6,9] target [1.6,0,0] fov 32；`earth-close` pos 地球显示中心+[0.55,0.38,0.75] target 地球中心 fov 30；`year-top` pos [0,12,0.01] target [0,0,0] fov 42；`moon-close` pos 月球显示中心+[0.12,0.09,0.18] target 月球中心 fov 32；`alignment-side` 对准当前显示地月中点 C，pos=C+[0.1,0.6,0.55]×q、target=C、fov42，其中 q=当前显示地月中心距/0.301679485167 m；`local-year` pos 地球显示中心+[0.5,0.4,0.75] target 地球中心 fov 32。E-SEM2 的 orbit 专用取景表把 system-overview/year-top 设为太阳 frame、earth-close/local-year 设为地球 frame、moon-close 设为月球 frame、alignment-side 设为以地球为原点、按当前显示尺度取景的地月 frame（食影小图另用同尺度）。预设/拍 camera 沿用现有位置/target/fov 格式，由预设名和本章 lab 选 frame，不新增通用 camera schema。自由相机仍写现有 URL；变换原点时同帧转换 position/target，run 时跟随当前 frame 的中心，不追随天体自转四元数。真实尺度下 earth-close/moon-close 距离按当前可见半径同倍缩放，alignment-side 的 q 自动随显示中心距改变；不得把示意尺度镜头原样用于真尺度。

`views.cover` 使用 system-overview，不加载 PNG 充当 3D 模型；首页插画依旧是 tellurion。`views.section.plane = xz`。HUD 标题 note EN “Model study · sizes and gaps can use different scales · circular motions explain geometry, not eclipse timings” / ZH “模型研究 · 球体大小与间距可用不同尺度 · 圆形运动解释位置关系，不预测食的时刻”。

规格 ≤4 行：地球倾角 about 23.4°（typical，F007）；地月中心距 about 384400 km（typical，F034）；日/月两种周期（typical，F006 F017）；当前显示尺度（design，S36）。PLATE ≤6 行按章 observe 切换：几何日长、正午高度、月面亮部百分比、地月中心距、日/月视直径、当地计算日长。03 的时刻读数跟随年表，分钟精度；不把无效量显示为 0。


### 3.5 图层、材质与作者数据

只有 4 个真实 group：01 solar-body、02 earth-system、03 moon-system、04 orbital-guides。观察窗不传入 `layers`；所有章 `run:false`、assembled、explode:0、cutaway:none。天体用现有 `matte` 材质族作基底，颜色只用已存在 token：太阳 `en-light`、地球 `cold`、月球 `ink-2`、辅助线 `ink-3`、观察标记 `signal`；太阳自发光，球面明暗由 §4.7 接管，材质不暗示真实颜色。无 flows、无独立 rpm/hz 动画。每个 part 都 `castShadow:false`、`clip:false`，辅助体不作实体杆解释。

图层与 hide/labels 每拍完整替换；没有学生可见的“组05”。观察窗依 lab 自动选择：moon → phase，eclipse → apparent-discs，local-year → solar-year；BG、day、year 默认无窗。07 仍用 phase，正文另列日历示例。03 的太阳/轨道对象隐藏，地球仅作纬度示意，观察标记用 observer-lat=1.3342；参考经度103.7357°来自表的输入文字，不从静态球面读出。不能说球体摆放就是当天姿态。

正文对象索引规则（与 §2 一致）：BG 为 sun-body、earth-body、moon-body、earth-axis、observer-marker、scale-ruler；01 为 earth-body、earth-axis、observer-marker、earth-track、light-ray-guide；02 再含 orbital-plane、equator-ring；03 为 earth-body、observer-marker；04 为 sun-body、earth-body、moon-body、near-side-mark、lunar-track、light-ray-guide；05 为 sun-body、earth-body、moon-body、observer-marker、lunar-track、orbital-plane、node-line；06 为 sun-body、moon-body、earth-body、observer-marker；07 为 sun-body、earth-body、moon-body、near-side-mark。以此表为各章 `index.parts` 的完整清单，禁止把窗名混进 parts。

### 3.6 文件、数据与许可计划

无地图，无 `data/INVENTORY.md`，不虚构地理数据依赖。只取父 `datasets.json` 的 D03（NASA/JPL 公开参数）、D04（NOAA 方法）与 D05（原创太阳表）；不取 D01/D02/D06–D09 的星历、纹理、路径或底图。S33 原文件 90,425 bytes。

| 施工文件 | 确切来源 / 转换 | 许可族与发布处理 |
|---|---|---|
| `data/parts.json`（含 orbitRotation） | §3–4 原创球体/辅助线、S08/S09/S10 公开数值 | CC BY-NC-SA 4.0，NC-SA 族；事实参数没有 SA 资产负担。 |
| `data/singapore-sun-2026.json` | 主 checkout 同名原文件；365 行数值不改；发布派生版删除 meta.cross_check 中已 cut 的 MSS 断言，precision 改为“计算估计、分钟显示、未独立全年观测验证”；meta 保留原方法/坐标/阈值/时区/CC0 | CC0-1.0，无 SA；SOURCES.md 记录原哈希及上述元数据编辑，生成后记录派生哈希。 |
| `chapters/*.mdx`、`data/glossary.json`、`sources.json`、`SOURCES.md` | 本规格原创双语；逐条来源概述 | CC BY-NC-SA 4.0，NC-SA 族；不打包源网页/原图。 |
| 测试数值 `engine-oracles.json` | 父同名 CC0 算术文件，依 §4.9 核对 | CC0，无 SA；不能反推为观测星历。 |
| 封面与两张 figure 的 webp | §7 指定的本地 PNG 与原 manifest | 原创生成图按项目 CC BY-NC-SA 4.0；NC-SA 族。 |
| 源网页、MOE 缓存、NASA/HKO/MSS/SCCC/NUS 图表 | 只作核查；不再发行 | 无派生资产，不以“可读”推定开放许可。 |

按 docs/next-batch.md §三，未来若有 BY-SA 输入必须保持独立 BY-SA 派生文件，不能和 NC-SA 混在同一文件；本题没有此类输入。施工将每份数据/插画的许可族、原始出处、改动及 CC0 例外写进 LICENSE-CONTENT 与 THIRD-PARTY-NOTICES；本次只定规格不修改这些文件。不使用需签协议或受限素材。

### 3.7 建模参考与关键状态

参考只读：S03 平行轴季节图核朝向，S05 月相图核观察方向，S06 食型图核遮挡顺序，S08/S09/S10 数值核比例。源图不进入运行时；如留开发参考须逐件记来源和许可，未获重分发许可的参考不随产品发布。球体保持无大陆纹理，以解析角度为比例依据，原有生成插画不作量角器。

关键状态：BG.3 真尺度地月近景；02.2/02.3 λ90/270 的地轴不变；03.2/03.3 为表的两极值日期；04.2/04.4 为有向离角区分的两弦月；05.1 倾斜离节点无食，05.2/05.3 节点排列；05.4/05.5 仅改变模型月距；06.1 真实日期说明与无日期模型分开。[F007 F008 F013 F016 F018 F021–F024 F026 F036；S36]

## 4. 引擎契约（只保留缺口）

### 4.1 代码现实核查与最小工作表

核查的是本 worktree 当前源码与 docs/06，而非草稿的“未来工作”自述。路径中 `lib/sim/` 以下均指 `src/engines/space-scene/lib/sim/`。本题只增加一个 sim kind，沿 docs/40 §9.2 的 table 与 docs/41 §9.1 的 seeds 注册方式扩展，不另造引擎。

| 草稿项 | 已有代码 / 文档证据 | 定稿处理 |
|---|---|---|
| 草稿 E1 的控件、输出、SIM 卡、状态、记录与 URL 容器 | `sim-schema.ts`、`lib/sim/{controls,index,trial,chart,text}.ts`、`explorer/TryIt.tsx`；docs/06 试一试 | 直接复用；新求解器只注册种类/量名/校验。 |
| 草稿 E1 的共享钟 | `runtime.ts` 的共享运行时；`TimelineClock.tsx` / `timeline.ts`、`AnimClocks.tsx` / `hz.ts` | 基础计时/帧限制可复用，但 timeline 深链接取终态、key 改即回放，hz 是独立积分相位；二者都不能令动态物理读数和可恢复任意 t 同步。只加 orbit 分支，不改既有语义。 |
| 草稿 E2 变换可否用 offset/rotate/place/shift/play 拼 | `lib/sim/{bind,frame,shift}.ts`、`PartNode.tsx` | 已有标量缓动/球面放置/平移动画；缺绝对位置 + 四元数 + 半径映射的原子快照。保留 bodyTransform；普通显隐仍用已有 visible/hide/layers。 |
| 草稿 E2 太阳位置与照明 | `lib/sim/sun.ts` 的 sunPosition / solarNoon / sunVector；`Lighting.tsx` | sunPosition 已含折射，不能拿来求 −0.833° 几何过线；03 读既有表，不新建日出求解器。棚灯不能正确表达球面太阳明暗，保留解析照明分支。 |
| 草稿 E3 食影可否用 shadow-cast | `sim-schema.ts shadowSource/shadowCastSchema`、`lib/sim/shadow.ts`、`ShadowCast.tsx`；docs/06 影子投射 | 已有点/平行光源向平面 receiver 投影，缺太阳有限圆盘和球形天体的本影/半影/伪本影；只保留天文局部图，禁止复用放大球的点光阴影冒充食影。 |
| 草稿 E3 的可选卡索引、详情位置与新 selection kind | `schema.ts spaceChapterIndex`、`explorer/{ChapterIndex,Inspector,BeatLine}.tsx`、`View.tsx`、core ChapterAxis；docs/08 §2 | 删除：13 个实体/辅助线复用现有 parts 索引、part URL 和详情。观察窗是视图；日历与投影是 More 文字。无 orbitItems、orbit-item query 或 selectOrbitItem API。 |
| 草稿 E3 全年图/时间轴 | `TryChart.tsx` + `lib/sim/chart.ts` 基于已记最多 12 行；table 是独立 sim.kind 的离散查表 | 复用数值/时刻格式化与来源组件；365 日曲线不是 12 行记录，保留小型 solar-year 视图和单行读取，不新造 TimeScene 或通用图表库，不同时挂 table kind。 |
| 草稿 E4 校验、截图、拍链接、HUD、回归 | `scripts/validate-content.ts`、`scripts/shoot.ts` 的 runBeatLinks / timeline / hz / tint 检查，core test-api；docs/06 QA | 删除独立工程项目；各缺口自己增校验/数值观测与 shoot 比较，复用已有框架。 |

| 编号 | 真正缺口 | 精确边界 / 验收 |
|---|---|---|
| E-SEM1 | orbit-rotation 纯模型、量名注册、共享物理时刻 | §4.2–4.6：13 控件、23 输出、单一可恢复 t；365 日期控件的受限例外；几何、相位、食型与表读取。T01–T17、T20–T28。 |
| E-SEM2 | 同快照天体变换、显示尺度、太阳明暗与跟随取景 | §4.7：bodyTransform、solarIllumination；两种尺度不改物理；附件、标注、相机统一 frame。T08、T16–T19、T23–T26。 |
| E-SEM3 | 月相/视盘/全年观察窗及轨道/有限光源食影图 | §4.8：原 card/readerTop 插槽；仅 2 个天文 overlay kind；不扩展选择系统。T09–T15、T21–T22、T27–T28 与 §4.10 视图验收。 |

新注册：`SIM_KINDS` 追加 orbit-rotation，配置键 `orbitRotation`；`simQuantities`、`quantityKind`、状态枚举、`SEPARATE_EXPERIMENTS['orbit-rotation']=true`、模型/来源交叉校验补分支。文件可用 `orbit-rotation-schema.ts`、`lib/sim/orbit-rotation.ts`、`orbit-clock.ts`、`orbit-projection.ts`；不加依赖，不动已有 sim 的行为。未知量/拼错量必须校验报错，不能依赖 evaluateSim 现有缺量回退 0。

### 4.2 数据字段与具体值

以下是**新增 schema 设计**，不是可以交给当前校验器的既有 JSON。

| 字段 | 类型 / 默认 / 验证 |
|---|---|
| sim.kind | 必须字面量 `orbit-rotation` |
| orbitRotation.version | 必须 1；strict，拒绝未知字段 |
| orbitRotation.model | 必须 `idealised-circular`；不接受 ephemeris。03 的本地表是独立计算读数，不给该轨道模型贴真实日期 |
| orbitRotation.units / frame | 固定 `km-s-deg` / `atlas-ecliptic-y-up`；数学内部角转 rad |
| bodies | 恰有 sun、earth、moon；各为 {id,parent,radiusKm}；parent 依次 null、sun、earth；半径 695700 / 6371 / 1737.4 [F033] |
| orbit.earthRadiusKm / moonReferenceKm | 正有限数，149597870.7 / 384400 [F034 F035]；地球距太阳 > Rs+Re；每个可选月距 > Re+Rm；所有球不相交 |
| periods.yearSeconds | 31557600，DESIGN Julian year 的合成圆周周期，不声称真实回归年或历法年 [F006 F017；S36] |
| periods.spinSeconds | 86164.09054，名义恒星自转；模型耦合太阳日由差频得出 [F006] |
| periods.moonSeconds | 27.3217×86400 = 2360594.88，设计取值，贴近 F017 的约 27.32 日；不是拟合特定新月 |
| controls | 下表 13 个逻辑输入到现有 control id 的一一映射；严格校验类型，不允许一个 id 承担两个输入 |
| clock | {seed:"elapsed",maxSeconds:31557600,rateByLab:{coupled:86400,day:21600,year:2629800,moon:196716.24,eclipse:0,local-year:0}}；rate 单位模型秒/墙钟秒；非负有限、≤31557600（静态两分支必须0）；不可从 Date.now 推真实日期 |
| display | {scale:"scale-mode",trueScaleMPerKm:0.01/12742,schematic:{earthOrbitM:3.6,moonOrbitM:0.75,sunRadiusM:0.45,earthRadiusM:0.12,moonRadiusM:0.12×1737.4/6371}}；全部正有限，physical 独立 |
| solarYear | {file:"singapore-sun-2026.json",control:"day-index",year:2026,lat:1.3342,lon:103.7357,zoneHours:8,thresholdDeg:-0.833,source:"S33"}；构建时装入主题 data，不直接把准备路径发到浏览器 [F013 F029 F042] |
| panel | {byLab:{moon:"phase",eclipse:"apparent-discs",local-year:"solar-year"},north:"earth-axis"}；其他 lab 默认收起 |
| sources | ["S08","S09","S10","S33","S36"]，均须存在；S36 design:true |

控制全量定义（label 均须 EN/ZH；配置里写下面 id，chapter/beat set 只写这些控件）：

| id | kind / 值 / 默认 | label EN / ZH |
|---|---|---|
| lab | choice: coupled, day, year, moon, eclipse, local-year；default coupled | Experiment / 实验 |
| elapsed | step: 0,21600,43200,64800,86400,2360594.88,31557600；default 0；unit s | Model time / 模型时间 |
| year-angle | step: 0,90,180,270；default 0；deg | Year position / 一年中的位置 |
| lunar-angle | step: 0,0.3,1,45,90,135,180,180.75,181,182,225,270,315；default 0；deg | Moon position from new / 从新月方向起的月球位置 |
| spin-angle | step: 0,90,180,270,360；default 180；deg | Spin position / 自转位置 |
| obliquity | step: 0,23.44；default 23.44；deg | Earth tilt / 地轴倾角 |
| lunar-tilt | step: 0,5.145；default 5.145；deg | Moon orbit tilt / 月轨道倾角 |
| node-angle | step: 0,90；default 0；deg | Node direction / 交线方向 |
| observer-lat | step: −45,0,1.3342,45,80；default 0；deg | Model latitude / 模型纬度 |
| moon-range | step: 363300,384400,405500；default 384400；km | Moon centre distance / 月球中心距 |
| synchronous | toggle；default true | Keep one face towards Earth / 同一面朝地球 |
| scale-mode | choice: true-scale, schematic；default schematic | Display scale / 显示尺度 |
| day-index | step: 所有整数 1..365；default 1 | Date in the computed year / 计算年份中的日期 |

moon-range 的三值是 **DESIGN 采样**，不称绝对近地点/远地点边界。[F034] 不提供地点经度控件；模型观察点经度固定 0°，不称新加坡观察点。local-year 的固定经纬度只属于表，不复用 observer-lat。

**现有 schema 的实际缺口**：step.values 当前最多24项，不能直接写365个 day-index。E-SEM1 将结构上限放到366，并在 sim.kind 已知后的交叉校验恢复范围：只有 orbit-rotation 且 id 等于 solarYear.control 的那个 step 可以超过24；其值必须逐个等于1..该年表行数，且表行数≤366。所有其他 step 仍≤24，所有既有 kind 不放宽。输出/控件枚举、URL解析、步进按钮和验证组合遍历都不得截断到24；local-year只枚举日期这一相关维度，避免无关实验维度乘积。新增回归：365项有效；缺第299项/乱序/重复/367项无效；旧circuit等25项仍无效。

### 4.3 实验、共享时间与确定性

纯函数签名：

`solveOrbitRotation(config, resolvedControls, context?: {timeSeconds:number}) -> Record<string, number | string | Record<string,number>>`。

当前 evaluateSim 的五参数顺序保持为 `(sim, values, observe, frames, parts)`，只在末尾追加可选 context；simQuantities 同步传递。runtime 以预分配缓冲构建同一物理 snapshot，不让各消费组件重复求值或逐帧创建 geometry/material/vector。

没有 context 时 t=elapsed；有 context 时 t=timeSeconds；两者都应在 [0,maxSeconds] 内有限，不求墙钟、不访问网络/DOM、不修改 controls。动态求值由 evaluateSim 的可选末尾 context 传入；旧模型忽略它，原 API 参数含义保持不变。先计算全部物理量，再一次性提交同一 snapshot 给 body、光照、卡片、读数与辅助图，不能每个消费方自己读取时间。

| lab | λ 地球年角速度倍率 / 月球惯性 u 角速度倍率 / θ 地球自转倍率 | 解释与读数 |
|---|---|---|
| coupled | 1 / 1 / 1 | 同一 t 同步三种运动；不同周期可比较。[F006 F017] |
| day | 0 / 0 / 1，**Pspin 改为 86400 s** | 冻结公转作教学对照，“24 小时一圈”为 DESIGN；不能把它叫恒星自转。[F005 F006] |
| year | 1 / 0 / 0 | 只推进公转；日长由解析一昼夜几何求出，不声称台上标记正在经历一整天。[F008 F009] |
| moon | 0 / 1 / 0 | 冻结太阳方向的月球绕行；计时只叫“冻结公转的模型时间”，不标真实月相日期或 29.53 天复现。[F017] |
| eclipse | 0 / 0 / 0 | 参数静态排列；elapsed 无效；无真实日期。[F021–F024] |
| local-year | 0 / 0 / 0 | 只选既有表的一行；动态轨道层隐藏，参考地球只作地点示意。[F013] |

时钟状态 `{seedSeconds,elapsedSeconds,running}` 存引擎 store。墙钟 Δ 使用单调 performance timestamp，背景/隐藏时暂停并重置基准，恢复不补跑；单帧 Δ 夹到 [0,0.05] s。到 maxSeconds 时夹住并暂停，禁止循环回零跳帧。run/SPACE/F、暂停按钮只改同一 running；eclipse/local-year 的 rate=0，running 强制false、运行按钮及对应命令禁用，说明“Static comparison / 静态比较”。暂停时 transform 不变、demand rendering。改变除 scale-mode 外任一控件时暂停并令 elapsedSeconds=当前 elapsed seed（若改变 elapsed 就用新值），再原子重算；改 scale-mode 只重映射、保持 t。

新增 URL query `orb-t`：十进制有限秒，最多 6 位小数，0..31557600，配合原 `ch`、`b`、`sim`；恢复顺序 = 章默认 → 拍 set → URL sim → 合法 orb-t → 求值。若非法，忽略并回 seed，不写 NaN。只在暂停、换控件、复制链接时 replaceState，不逐帧写 URL；加载深链接一律暂停，直接到所指定时刻。换章/拍清 orb-t，用目标拍 seed；演示退出恢复进入前 controls、t、running；REFERENCE 保存并暂停该 t，退出恢复同一 t/run，不把读数归零；prefers-reduced-motion 默认暂停，拍直接到目标。截图/instant 也直接求值，不等 0.5 秒缓动。

章/拍应用 **不累积**：每拍相对本章 set，不是相对上一拍。下文 B0 是明确合并宏（施工展开成实际字段，不把“B0”塞进数据）：{lab:coupled,elapsed:0,year-angle:0,lunar-angle:0,spin-angle:180,obliquity:23.44,lunar-tilt:5.145,node-angle:0,observer-lat:0,moon-range:384400,synchronous:true,scale-mode:schematic,day-index:1}。

### 4.4 物理方程、相位与日长

以下均为 S36 的合成模型推导，依 F006–F010、F015–F024、F033–F038。所有三角函数取 rad；wrap 到 [0,2π)，clamp dot 到 [−1,1]。

1. λ0 = year-angle，u0 = λ0 + π − node-angle + lunar-angle，θ0 = spin-angle。λ=λ0+ay×2πt/Pyear；u=u0+am×2πt/Pmoon；θ=θ0+ae×2πt/Pspin。ay/am/ae 见上表，day 的 Pspin 是专用值。lunar-angle 是初始相对方向参数，不是准确相角，也不独立覆盖耦合时钟后的月相。
2. S=(0,0,0)，E=AU×(cos λ,0,−sin λ)。m=moon-range×RY(Ω) RX(i) (cos u,0,−sin u)，M=E+m。Ω=node-angle，i=lunar-tilt。所有姿态都是主动旋转，列向量右乘顺序从右到左。
3. 地球四元数 qE = qX(ε) qY(θ)，轴 n=qX(ε)(0,1,0)=(0,cos ε,sin ε)，ε=obliquity。故 λ=90° 时北半球向太阳，λ=270° 时南半球向太阳。不能让 qE 乘 qY(λ) 而使轴跟着太阳转。
4. 同步月球 qM=qY(Ω) qX(i) qY(u+π)，局部 +X 指向地心；非同步 qM=qY(Ω) qX(i) qY(uRef+π)，其中 uRef=λ0+π−Ω，是 lunar-angle=0 的共同朝向基准，既不含当前 lunar-angle，也不含 t。因此在同一固定 λ0/Ω/i 下改变 lunar-angle，非同步朝向仍固定，能与同步快照直接比较。这是圆轨道同步演示，省略真实天平动，不称精密月球定向。[F020]
5. 观察者 O=E+Re×qE(cos φ,sin φ,0)，φ=observer-lat，模型经度 0°；地表法向 v=(O−E)/Re。昼夜实验采用地心方向的平行阳光近似，太阳中心高度 h=asin(v·unit(S−E))，与下项解析日长同一约定；h>1e−9 rad 为 day，h<−1e−9 为 night，否则 boundary。日食的视圆盘另用 O 点有限距离；是否在地平上用 hTopo=asin(v·unit(S−O))，不把二者极小的视差差异当实测日出。
6. 太阳赤纬 δ=asin(n·unit(S−E))。正午中心高度 H=90°−abs(φ−δ)。日长令 C=−tan φ tan δ；C≤−1 → 24 h / polar-day，C≥1 → 0 h / polar-night，其余 D=24×acos(C)/π。仅几何中心地平线、无折射/太阳半径；φ=80° 的极区分支只是本解析模型测试，**不扩展 light.sun 原有纬度范围**。
7. 月球相角 iPhase=acos(unit(S−M)·unit(E−M))，亮部比例 k=(1+cos iPhase)/2，输出百分比 100k。这是地心月相窗的几何亮部比例，发生月食时仍输出这个未扣食的比例；卡片另报食状态，不说“满月仍然全亮”。视窗受食遮暗独立叠加。
8. 月相名称取地心黄道投影的有向离角 α=wrap(atan2(−m.z,m.x)−atan2(−(S−E).z,(S−E).x))。桶号 j=floor((α+π/8)/(π/4)) mod 8；依次 new、waxing-crescent、first-quarter、waxing-gibbous、full、waning-gibbous、last-quarter、waning-crescent。桶是展示分类，不是“新月准确时刻”。半亮不能仅凭 k 判断上弦还是下弦。
9. 有限太阳距离下 lunar-angle=90°/270° 得 k≈0.501285，**并非严格 0.5**。真正半亮在模型约 89.8528°/270.1472°；字幕用“约半个”，不要在测试里错误要求名义 90° 点精确等于 50%。耦合共面模型的合成朔望周期 P=1/(1/Pmoon−1/Pyear)=29.5306753681 d；不能把该值用于实际日历。[F017；推导 S36]

### 4.5 食与有限光源（只用于无日期的解释模型）

日食输出是 **模型地表点 O** 的视圆盘几何；相位窗仍用地心 E，二者明确区分。uS=unit(S−O)、uM=unit(M−O)，角半径 aS=asin(Rs/|S−O|)、aM=asin(Rm/|M−O|)，分离角 d=acos(clamp(uS·uM))。先要求月球位于太阳之前且同半天方向：|M−O|<|S−O| 且 uS·uM>0；不满足为 none。接着：d≥aS+aM → none（外切只算 contact，不算有面积的食）；aM≥aS 且 d≤aM−aS → total；aS>aM 且 d≤aS−aM → annular；其余 partial。边界角比较 tolerance=1e−12 rad，按此优先级判定；相等角半径且同心归 total。观察太阳在地平下时几何 type 仍可算，但 `solar-visible` 为 false，UI 写“地平下的排列”，不得写“这里看到日食”。不输出真实 obscuration、magnitude、contact time。

月食用真实 Rs、Re、Rm 与物理位置。a=unit(E−S)，D=|E−S|，x=(M−E)·a，b=|(M−E)−xa|；x≤0 为 none。κu=asin((Rs−Re)/D)、κp=asin((Rs+Re)/D)，Lu=Re/sin κu。对本配置所有月距，x 距锥尖须 >Rm，保证球与锥的法向距离判断有效；超范围配置校验失败。du=b cos κu+x sin κu−Re，dp=b cos κp−x sin κp−Re。若 0<x<Lu：du≤−Rm → total；du<Rm → partial；否则若 dp<Rm → penumbral；其余 none。总影与半影相切同样按有面积的相交处理；距离比较 tolerance 1e−6 km。不做大气折射红月、真实地影膨胀或实际亮度预测。

日食影锥将遮挡体换成月球，同一组外公切线/内公切线生成 umbra、penumbra、antumbra；地心新月可以没有地表观察点的中心食，不能把“满月”直接映成 lunar-total。影锥是有限太阳几何，不是 THREE 点光源阴影。太阳/月球大小一变，必须从物理半径和距离重算。[F021–F024 F038]

### 4.6 输出注册表与空值

共 **23 个声明输出**，低于现有上限 32；from 固定如下，输出 id 可用同名 kebab-case。vector 的键可以含点号，是通道名，不是内容对象 id。

| from（建议 id） | kind / 单位 | 精确定义 / 可用实验 |
|---|---|---|
| body-frame | vector | sun/earth/moon/observer 各 xKm,yKm,zKm,qx,qy,qz,qw,radiusKm，共 32 固定键；全实验有限；sun四元数恒[0,0,0,1]，observer四元数=qE、半径0，只是位置参照 |
| solar-directions | vector | earth.x/y/z、moon.x/y/z 共 6 键，分别指向太阳的单位向量；各自身体中心，不用 O 替代 |
| earth-axis-direction | vector | x,y,z；n；换 year-angle 不变 |
| geometric-daylight-hours | number / h | §4.4 D，local-year 时 NaN；0..24 |
| noon-altitude-deg | number / deg | §4.4 H，local-year 时 NaN；−90..90 |
| observer-altitude-deg | number / deg | §4.4 h，local-year 时 NaN |
| observer-day | state | day,night,boundary,not-applicable；local-year 为 not-applicable |
| daylight-state | state | normal,polar-day,polar-night,not-applicable |
| moon-lit-percent | number / % | 100k；local-year 时 NaN |
| moon-phase-angle-deg | number / deg | iPhase；local-year 时 NaN |
| moon-phase | state | 八桶 + not-applicable；local-year 为 not-applicable |
| solar-eclipse | state | none,partial,total,annular,not-applicable；local-year 为 not-applicable |
| solar-visible | number / 无 | hTopo>0 为1，否则0；local-year NaN；显示时读成文本，不当百分比 |
| lunar-eclipse | state | none,penumbral,partial,total,not-applicable |
| sun-diameter-deg | number / deg | 2aS，观察点 O；local-year NaN |
| moon-diameter-deg | number / deg | 2aM，同上 |
| disc-separation-deg | number / deg | d，同上 |
| earth-sun-km | number / km | norm(E−S)，固定 AU；local-year NaN |
| earth-moon-km | number / km | norm(M−E)，等于 moon-range；local-year NaN |
| local-sunrise | number / h，format:time | 当年表选中行 HH:MM→h；仅 local-year，否则 NaN |
| local-noon | number / h，format:time | 同上 |
| local-sunset | number / h，format:time | 同上 |
| local-daylight-minutes | number / min | 原表 daylight_minutes；仅 local-year，否则 NaN；显示整数分钟 |

lunar-eclipse 在 local-year 同样为 not-applicable。所有 state 声明完整的 {en,zh} states，quantityKind 对错拼写返回 null，未声明输出报错，不回退假 0。数值 NaN 是显式“不适用”，卡片/PLATE 写破折号与原因；vector 不用 NaN，所有组件必须有限。phase/solar outputs 不进 local-year 的 observe；local 输出不进别的卡 observe。source/precision 注释由模型 metadata 按 branch 供卡片复用：S36 模型 / S33 计算年表，二者均 SIM，不能用表模型的 TYPICAL 芯片伪装实测。

### 4.7 新绑定（E-SEM2）

新增 bind 分支（字段 camelCase 与现有绑定风格一致）：

`{output:"body-frame",part:"earth-body",bodyTransform:{body:"earth",attachment:"centre"}}`

`{output:"body-frame",part:"near-side-mark",bodyTransform:{body:"moon",attachment:"surface",localDirection:[1,0,0],surfaceFactor:1.006,scaleWithRadius:true}}`

`{output:"solar-directions",part:"moon-body",solarIllumination:{body:"moon",darkFill:0.035}}`

bodyTransform strict 字段为 `{body,attachment,localDirection?,surfaceFactor?,scaleWithRadius?}`。attachment 必填 centre/surface；surface 要非零 localDirection 与正有限 surfaceFactor（默认1），centre 禁止这两个字段；surfaceFactor 上限1.1；scaleWithRadius 默认 true，本体/轴/赤道/表面标记都以本体半径1的局部几何写，observer 特例用地球显示半径。primitive.at/rotation 先烘焙为局部几何后由该矩阵整体安放，不再加原世界位置。

body 为 sun/earth/moon/observer；attachment 为 centre 或 surface（observer 只用 centre）。centre：读绝对物理位置、四元数，应用 §3.2 对该 body 的显示映射，再依显示半径调整单位球。surface：同 body 的显示中心 + q×normalize(localDirection)×显示半径×surfaceFactor；同 q 旋转附件，标记 primitive 半径取父体半径的比例，不反过来把标记尺寸当 body 半径。axis/equator 附件用 centre + `scaleWithRadius:true`，其 primitive 单位尺寸以本体半径为 1。观察点 marker 使用 observer 的物理坐标求对应 earth 表面法向，在显示 earth 半径上安放；observer.radiusKm=0 不用于缩放 mesh；observer-marker 单位半径0.025（相对地球），near-side-mark 单位半径0.06（相对月球）。零长度 direction、缺键、非单位四元数（容差 1e−6）、未知 body、重复变换写者均报校验错误。

绝对坐标已含 parent，**不再乘父 body 矩阵**；attachment 才用局部向量。执行次序：物理 snapshot → display centres/radii → bodyTransform → 附件 → camera/labels → illumination/overlays。受此绑定控制的零件不得同时有 offset、rotate、shift、place、pose、动画、explode 或父节点运动；冲突为错误，不采用“后写的覆盖”。hide/visible/selection 可以共存，不改变物理状态。

solarIllumination 接受 solar-directions 固定 6 键；world normal 点乘该 body 指向太阳的向量作明暗边界，暗侧只保留 darkFill 0..0.05 的教学填光。纸/电影两主题相同物理明暗，token 负责可读性，不加 rim 把暗半球画亮。地球/月球禁用全局棚灯、接触阴影和假点光源阴影；太阳自发光但不做耀斑。此绑定 strict 字段 `{body:"earth"|"moon",darkFill:number}`（默认0.035、范围0..0.05），只接 solar-directions vector，不能写在太阳/guide上。主舞台明暗表达受光几何；食的遮暗示意在 §4.8 同尺度影窗与月相窗单列，必须同时显示食状态，不把主舞台填光当月食实测亮度。渲染暗面可见必须在 00 注明“教学填光”，不能把灰色新月图当肉眼可见照片。[F015 F016；DESIGN]

### 4.8 观察窗、辅助图与全年表（E-SEM3）

只增加 **2 个 overlay kind**，沿用现有 ≤4 上限与 when 条件、group 引用检查：

- `orbit-guides`：strict 字段 `{kind, group:"orbital-guides", parts:{earthTrack,lunarTrack,plane,nodes,rays,ruler}, axes:boolean, tracks:boolean, nodes:boolean, incidence:boolean, terminators:boolean, when?}`；parts 的值分别引用 §3 的真实零件 id，每种引用恰一件、不得重复。aux axes/equator 已由 bodyTransform 带动。光照边界来自太阳解析 shader，必要大圆描线由此 kind 同源生成，不另建 orbit-terminator kind。
- `orbit-eclipse-shadow`：strict 字段 `{kind, group:"orbital-guides", bodies:{source:"sun",planet:"earth",satellite:"moon"}, localFrame:"earth-moon", labs:["moon","eclipse"], when?}`。只读当前物理 snapshot；不允许来自示意显示球的半径/距离。有限光源切线算本影、半影、伪本影；无大气颜色或亮度预测。

`orbit-guides.parts` 引用的就是可见/可选/可标注的那组 guide parts，渲染端替换它们的几何/世界矩阵或受控更新同一节点，不能把静态 primitive 再画一遍，也不能使用不可见锚点占位。该 overlay 是这些 guide 的唯一变换写者，禁止同一 guide 再写 bodyTransform、pose、offset、rotate、shift、place、play、动画或 explode。13 个 part 的实际几何节点继续进入现有 picking、bounds、bridge、LeaderLabels 和 Inspector。图层/hide 关闭时不画、不标；全部由相同 snapshot 的 resolved parameters 与物理位置生成，轨道 128 采样点，i=0 不画交线并读“平面重合”。

月相窗占现有右上 card 槽，不另开 HUD。camera forward=unit(M−E)，屏幕上方为地轴 n 在垂直 forward 平面上的归一投影；投影长<1e−9 时用黄道 +Y 再投影，仍退化则 +Z，必须连续选同一符号。屏幕 right=cross(forward,up)。射线从观察者 E 打月球求球面法向，再与太阳方向点乘出受光区；按 qM 显示抽象 near-side-mark。卡片写“Geocentric · north up / 地心视图·北朝上”，相机 ORBIT 只影响主舞台，不改变此窗；不提供新加坡地平旋转。

视圆盘窗以 uS 为屏幕中心，构建与 uS 垂直的北向基，月盘中心沿其投影位置按 d 放置，盘半径用 aS/aM。同一角度尺、可读文字读数；不输出平面圆盘相交面积冒充精密日面遮盖率。地表点与星历未校准，标题必须是“Model observer / 模型观察点”。

影锥在单独同尺度局部 frame 绘制：原点 E，缩放 k，与太阳方向共轴；太阳本体可在画框外，用解析切线延续入画。该 frame 内 Earth、Moon 半径和中心距**全用 k**；主舞台若 schematic，则影锥窗与放大球之间不做假装吻合的连接。04 的地影用此同尺度窗，90° 月相远离影轴，镜头/示意引线指出其与月相窗是同一物理快照。[F016 F021–F024]

全年卡不新增 timeline 引擎。365 行日期必须逐日唯一、无缺日且年为2026；horizon、threshold、坐标和 zone 与配置相等。HH:MM 解析为小时，sunrise<noon<sunset；各日 daylight_minutes 为有限数并处于 720..735。**时刻已取整，不能用 sunset−sunrise 反向替代高精度 daylength，也不能要求两者逐分钟精确相等。** 图横轴日期、纵轴分钟，固定720..735 min，明确标“纵轴放大区间 / Expanded vertical range”，不把9分钟画成半天差；可在图上点日或用前后日按钮（44px），二者调用同一 day-index store；超过12条试验记录时沿用现有上限，全年曲线本身不是“记表”的12行。无插值出未给出的太阳高度或月相。[F013 F042]

不扩展选择 schema、URL 或测试选择 API。card 只是一种观察视图，窗口内对应天体的可访问按钮仍调用既有 part 选择；详情进入原 Inspector 槽。calendar-strip 与投影安全说明在现有 `<More>` 中，不生成虚拟可选对象。全部实体/辅助线的索引按 §3.5 写 `state.index.parts`。手机将同一观察窗移至现有 TryIt / readerTop 抽屉（共享一个状态实例），不在两个槽位各自挂模型/时钟。phase/disc/solar-year 各有双语可读说明和读数，读屏不用识别像素图。

### 4.9 校验与确定数值的未来测试

验证 13 controls / 23 outputs / ≤64 binds / 2 overlays；所有 id、引用、units、kind、sources 双语齐全；不存在第二 kind 配置。限制参数域为本题给出的值集；更改常量的通用引擎仍须满足不相交、锥尖距离、四元数、单位与范围检查。先用解析公式穷举可达的离散边界，再抽样时间，不可把 365×所有无关输入全笛卡尔积跑到指数级。local-year 的 inactive geometry 控件改变不得改表；换 scale 不重跑纯求解器。

下表 tolerance 除注明外：距离 1e−6 km、角度 1e−6 deg、k 1e−9、时间 1e−6 h；图片容差另定。父 engine-oracles.json 作为 CC0 对照夹具；本轮复核其关键算式，不证明未来实现正确。

| # | 输入（未写则 B0；数值测试可直接调用纯函数配置） | 应得值 / 断言 |
|---|---|---|
| T01 | ε=0，φ=0，year-angle=0 | D=12 h；H=90°；h≈90°（spin180）；observer-day=day |
| T02 | lab=day,ε=0,spin0，t=0/21600/43200/64800/86400 | 依次 night/boundary/day/boundary/night；观察高度约 −90/0/90/0/−90° |
| T03 | lab=year，year-angle90，φ45 | δ=23.44°；D=15.4258924132 h；H=68.44° |
| T04 | 同上，year-angle270 | D=8.5741075868 h；H=21.56°；T03+T04=24 h |
| T05 | T03 改 φ−45 | D=8.5741075868 h；南北半球互换，日地距仍是 AU |
| T06 | ε=0，所有 year-angle 与 φ−45/0/45 | D=12 h；轴 [0,1,0] |
| T07 | φ80，λ90 /270 | D=24 /0 h；polar-day /polar-night，无 NaN |
| T08 | λ=0,90,180,270，ε23.44 | 地轴始终 [0,cos23.44°,sin23.44°]，分量差<1e−12 |
| T09 | lab=moon,ε0,i0,Ω0，lunar-angle0/90/180/270 | k=0 /0.501284773403 /1 /0.501284773403；相位 new/first-quarter/full/last-quarter |
| T10 | lunar-angle180,i0 | moon-lit-percent=100；lunar-eclipse=total，月相几何与食遮暗不混淆 |
| T11 | lunar-angle0/180，i5.145,Ω90 | solar-eclipse=none；lunar-eclipse=none；Moon 黄道面高度 ±34471.6689691 km |
| T12 | lab=eclipse,ε0,i0,φ0,spin180，lunar0,moon-range363300 | 太阳视直径0.5329289108°，月球0.5577920563°；total |
| T13 | T12 月距405500 | 月球0.4988161807°；annular |
| T14 | T12 月距384400,lunar-angle0.3 | 分离0.3050559370°；partial |
| T15 | T14 lunar-angle1 | 分离1.0168523050°；none |
| T16 | i0，同步，u 改90°；再绕360° | qM(+X)·unit(E−M)=1；惯性姿态变化90°；一周后同姿态（q与−q等价） |
| T17 | i0，synchronous=false，月球转90° | 惯性 qM 不变，近侧标记不再朝地；点积约0 |
| T18 | 真尺度 | Earth 10mm、Moon 2.727044420mm、中心距301.6794852mm、表面gap295.3159630mm；Sun1.091979281m、日地117.405329383m |
| T19 | 同一快照换 schematic/true-scale、自由相机、语言、主题 | 所有物理数逐值不变；只显示映射、UI文本改变 |
| T20 | 耦合 i0,ε0 | 模型朔望周期29.5306753681d；等效太阳日86399.9949493s，约24h；用 moon 冻结分支不得声称同一周期 |
| T21 | local-year，day-index299（2026-10-26） | 06:47 /12:49 /18:51；昼长724.417 min（读取既有原行，不由圆整时刻相减） |
| T22 | local-year，day-index172 /355 | 最长732.005min /最短722.886min；07:01–19:13 /07:02–19:04 |
| T23 | URL orb-t=21600，day，ε0,spin0 | 直接落几何边界；暂停。JSON/URL往返后同一物理 snapshot；非法 t 回 seed |
| T24 | 30/60/120fps，在0.05s夹限内推进墙钟1s | 同 rate 得同 t；不以每帧角增量积累；暂停10次tick完全不动 |
| T25 | 缺 qz、q 长2、循环 parent、负radius、重写同一 part、真数据模型标签ephemeris、外链solarYear | validator 逐项报对应路径；不静默更正 |
| T26 | 任一章/拍深链接；演示保存退出；reduce motion | 与同拍 instant 相同；只保留一个时钟和选择；不会自动翻章或从0回放 |
| T27 | lab=eclipse,ε0,i0,Ω0,r384400；lunar-angle180.75 /181 /182 | 月影法向距离du=431.7043495 /2108.6330182 /8814.4140796 km；依次 lunar-eclipse=partial /penumbral /none；181°时dp=−1466.1043371 km，确有半影相交 |
| T28 | 视圆盘分类辅助函数直接给aS=0.25°,aM=0.26° | d=0.51°外切→none；d=0.01°内切→total；d=0.010001°→partial；与角度tolerance一致；同aS=aM=0.25°且d=0→total |

T18/T21 与父 oracle 及原年表核对；所有对学生显示的 SIM 数采用 §0.3 的取整，不把 oracle 小数位当观察精度。

### 4.10 测试 API、校验入口、shoot / e2e 与预算

扩展既有 `__atlas.engine.sim()`，保留 values、outputs、sources、timeline 等原字段。新增 `__atlas.engine.orbit()` 返回 `{snapshotId,timeSeconds,running,lab,scale,physical:{bodies,axis,solarDirections},display:{origin,centres,radii},rendered:{parts,solarDirections},panel:{kind,northUp,observer,dayIndex,shadowFrame}}`：physical bodies 为 km 与单位四元数，display 为 m；rendered 从舞台实际 world matrix 和照明 uniform 反读，不能只返回 solver 希望画的值。`parts[id]` 为 `{position,quaternion,scale,visible}`，shadowFrame 包含同尺度 centres/radii 及 cone signed distances；solar-year 返回 dayIndex 与显示的四个读数。所有字段可 JSON 化，非适用数值在此 hook 用 null（内部 NaN 保留），附 not-applicable 原因。

新增 `engine.orbitSeek(seconds)`：同控件的有限范围检查，设 t 后暂停、一次重算并 snap 到渲染值；返回是否接受。沿用现有 `setSim` 改控件、`setPaused`、run/F/SPACE、章节与拍 API，不造另一套操作路径。新控件/输出的 label、所有 choice option 与 state label 均 EN/ZH 完整；24h、deg、km、min、% 和 HH:MM 用现有格式器。lab 不暴露为学生任意切换实验清单，由章节定；TryIt 仅列本章 vary/also。无卡的 BG、06、07 仍须保留可访问的尺度开关；07 保持冻结，不自动开跑。

校验扩展接入现有 schema / topicIssues 与 `scripts/validate-content.ts`：本地 solarYear 路径禁止协议、绝对路径、`..`、查询串，只允许主题 data 下 JSON；表的日期完整、阈值、年、坐标、时区、单位及来源一致。strict 模型只能给一种 sim 配置；body 不相交、parent 无环；每条输出 from/种类/状态枚举、绑定引用、写者冲突均给出字段路径。S33 为计算来源，S36 `design:true` 且在 note 列假设与公式，不能把年表输出打 typical。全量 365 日只检查日期维度，其他 24 项以内离散控件分实验枚举，禁止全维笛卡尔积。尺度纯显示开关不重复运行物理解算。

T01–T28 的 unit tests 逐项编写；数字容差见 §4.9，clock 用注入 Δ 的确定性测试，不靠真实 sleep。再加：365 日期合法、缺299/乱序/重复/367项非法、旧 circuit 25 项仍非法；所有 39 拍完整配置求值无未声明输出；local-year 几何数为 NaN / 状态 not-applicable，inactive 参数不改表；i0 时 node 隐藏；负/非有限参数与非单位四元数报错。bodyTransform 和 guide 的真正渲染值另用 e2e 检查，不能以纯函数测试替代。

夹具 `sample-orbit`（draft）用通用球体、三类窗、两种尺度与至少一条 off-node / partial / annular / lunar-total 状态；不依赖本主题的长正文。e2e 必测：01 SPACE/F/按钮同钟，30/60/120fps 等时推进；暂停/后台/REFERENCE 不跳时；03 指针、步进按钮与 day-index 同 store；04 主相机转动不改北朝上视窗；05/06 地心相位与地表视盘/食型不混同；39 个 ch+b 深链接、有效/非法 orb-t、演示保存/恢复、reduce motion；手机仍能打开观察窗和改控件，选择详情仍在章头下方。

`scripts/shoot.ts` 复用 --beats / runBeatLinks：对 orbit 主题多收 `engine.orbit()` 和 `sim().outputs`，等待 snapshotId 画完，比较点击拍、演示 instant、整页 ch+b 链接的 t/控件/物理量/实际渲染矩阵/窗类型。合法深链接 orb-t 也与 orbitSeek 同结果；禁止让老 timeline 的“必须终态”断言套在 orbit 上。额外检查太阳 uniform、真尺度 display、月相窗 northUp、影图同尺度；差异按 §4.9 容差报拍失败。已有 kinds 不进入新分支。键/布局/网络捕获复用原脚本，无另一个 QA 框架。

预算：纯求解 <1 ms/次（注明硬件，排除测试启动）；运行时一帧一次物理 snapshot、预分配矩阵/向量，365 日图预载一次不逐帧扫描；三球 48×32，辅助图合并绘制，静止目标 <50 calls、运行 <60、所有状态硬限 <100，目标 <0.1 M 三角形、总上限 1.5 M。新增懒加载 JS 目标 ≤15 KB gzip，按 docs/02 实测整主题首屏 ≤300 KB gzip；本地太阳 JSON ≤100 KB 未压缩。pixelRatio 延用 `min(dpr,3840/W,2)`，暂停 demand、后台停帧、GPU 1080p 目标60fps；软件 GL 不作真机帧率证明。不加纹理、外部请求、依赖、通用天文/图表库。

## 5. 名词表 EN / ZH

16 项。`see` 在当前 schema 中只能指向**别的名词 id**，不能写 part id；下表“关联对象”是写作/点选计划，仍走 §3.5 的 parts 索引。以下中文为 D10 的编辑选词，HKO 用语不提升为新加坡课纲认证。

| id | EN / ZH | 定义 EN / ZH | see / 关联对象 / facts |
|---|---|---|---|
| rotation | rotation / 自转 | Turning about a body's own axis. / 天体绕自身轴线转动。 | orbit / earth-axis / F005 F006 |
| orbit | orbit / 公转 | Moving around another body. / 围绕另一天体运动。 | rotation / earth-track / F017 F020 |
| obliquity | axial tilt / 地轴倾角 | The angle between the spin axis and the orbital normal. / 自转轴与轨道法线的夹角。 | hemisphere / earth-axis / F007 |
| hemisphere | hemisphere / 半球 | Half a globe; here north or south of the equator. / 球体的一半；这里指赤道以北或以南。 | obliquity / equator-ring / F009 |
| daylight | daylight duration / 昼长 | Daylight length under a stated horizon convention. / 在指定地平线定义下的白昼时长。 | solar-day / observer-marker / F012 F013 F042 |
| solar-day | solar day / 太阳日 | A cycle measured relative to the Sun. / 按相对太阳的位置回归计量的周期。 | rotation, solar-noon / earth-body / F006 |
| solar-noon | solar noon / 太阳正午 | The Sun's daily crossing of the local meridian. / 太阳每天经过当地子午线的时刻。 | solar-day / observer-marker / F042；S33 |
| phase | Moon phase / 月相 | The shape of the sunlit portion seen from Earth. / 从地球看见的月球受光部分的形状。 | synodic-month / moon-body / F016 |
| synchronous-rotation | synchronous rotation / 同步自转 | One spin during one orbit. / 公转一周时自转一周。 | rotation, orbit / near-side-mark / F020 |
| synodic-month | synodic month / 朔望月 | The new-Moon-to-new-Moon cycle. / 从一次新月到下次新月的周期。 | phase / moon-body / F017 |
| node | orbital node / 轨道交点 | A crossing of the lunar orbit and Earth's orbital plane. / 月球轨道穿过地球轨道平面的位置。 | solar-eclipse, lunar-eclipse / node-line / F023 |
| solar-eclipse | solar eclipse / 日食 | The Moon covers the Sun for an observer. / 对某个观察者而言，月球遮住太阳。 | apparent-diameter, annular-eclipse / sun-body / F021 |
| lunar-eclipse | lunar eclipse / 月食 | The Moon enters Earth's shadow. / 月球进入地球影子。 | node / moon-body / F022 |
| annular-eclipse | annular solar eclipse / 日环食 | A central solar eclipse leaving a bright ring. / 太阳周围仍留下明亮光环的中心日食。 | apparent-diameter, solar-eclipse / sun-body / F024 |
| apparent-diameter | apparent diameter / 视直径 | A body's angular width from a chosen place. / 从指定地点看到的天体角宽度。 | annular-eclipse / moon-body / F038 |
| lunisolar-calendar | lunisolar calendar / 阴阳历 | A calendar combining lunar months and solar-year information. / 结合月相月份与太阳年信息的历法。 | synodic-month / moon-body / F030 |

太阳、地球、月球、自转轴、新月、上弦、满月、下弦在正文首现就地说明，避免 24 项全局词表。模型中八个月相桶仍有双语 label，不需每桶一张术语卡。

## 6. 来源与逐项引用计划

沿用父 S 编号，补 S35–S40；不为了连续而复制不用的来源。外部条目访问日期为 **2026-10-27**，指本轮取得正文；S33/S36 是本地原创计算/设计，明确不是外部实测。sources.json 的 `text/note` 双语、来源 id 与正文一致；id 的 `S` 加数字形式沿现有校验。所有概述原创，不嵌入源图或整表。

| id | 来源（直接链接） | 已读位置 / 用途 |
|---|---|---|
| S03 | NASA Space Place, [What Causes the Seasons?](https://spaceplace.nasa.gov/seasons/en/) | 轴方向、太阳直射关系、自转昼夜、相反半球、近日点/远日点月份；F005 F008–F010。 |
| S04 | NASA Science, [Facts About Earth](https://science.nasa.gov/earth/facts/) | 行星身份、Orbit and Rotation；F004 F006。倾角定义不用其“with respect to the plane”的简略措辞。 |
| S05 | NASA Science, [Moon Phases](https://science.nasa.gov/moon/moon-phases/) | Quick Facts、All Moon Phases、Quarter、Daytime Moons；F015 F016 F018 F019。图片观察方向只是参考，运行时用本规格定义。 |
| S06 | NASA Science, [Types of Solar Eclipses](https://science.nasa.gov/eclipses/types/) | total/annular/partial、Lunar Eclipses（倾斜机制另见 S40）；F021–F024。 |
| S07 | NASA Science, [Moon Facts](https://science.nasa.gov/moon/facts/) | 天然卫星身份、受光与远近侧；F004 F015。不同步引用其地球转动的简略句。 |
| S08 | NASA NSSDC, [Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html) | mean radius 1737.4 / 6371.0 km；semimajor axis、27.3217 d、29.53 d、5.145°，mean perigee/apogee 脚注；F017 F023 F033 F034 F036 F038。 |
| S09 | NASA NSSDC, [Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) | mean radius 695700 / 6371 km、Earth obliquity 23.44°、apparent diameter；F007 F033 F037 F038。 |
| S10 | NASA/JPL SSD, [Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html) | day 86400 s、Julian year 365.25 d、mean sidereal day 86164.09054 s、AU 149597870700 m；F006 F035、S36 的周期约定。 |
| S11 | MSS, [Climate of Singapore](https://www.weather.gov.sg/climate-climate-of-singapore/) | Seasons、Sunshine Duration；F011 F012、F031 的本地气候边界。 |
| S14 | Science Centre Singapore, [Night at the Museum: Stargazing at Science Centre Singapore](https://voiddeck.science.edu.sg/articles/space/scob-stargazing/) | 天文台公众教育与天气限制；F028。无票价、开放日或当期预约承诺。 |
| S18 | HKO, [历法](https://www.hko.gov.hk/sc/gts/time/calendarinfo.htm) | 农历历法、阴阳历、朔望月、以朔为月首；F030 与中文术语。不将其平均周期生成逐年历表。 |
| S21 | HKO, [甚么是月球天平动？](https://www.hko.gov.hk/sc/education/astronomy-and-time/astronomy/00777-what-is-lunar-libration.html) | 同步自转与真实天平动；F020。省略其百分比及其他未用于本题的数值。 |
| S26 | NOAA GML, [Solar Calculation Details](https://gml.noaa.gov/grad/solcalc/calcdetails.html) | Meeus 算法、折射约定、大气/地平线精度限制、停止维护提示；F042 与 S33 方法。 |
| S33 | Atlas, `art/research/sun-earth-moon/singapore-sun-2026.json`，生成函数在同目录 `prepare.py` | 本地 CC0 原创计算；365 行、指定坐标、UTC+8、−0.833°、平坦海平面地平线；F013/F029。发布时按 §3.6 删旧核对断言，数值不改；source note 不写“已获官方全年验证”。 |
| S34 | NASA Science, [Sun: Facts](https://science.nasa.gov/sun/facts/) | 太阳恒星身份；F004。 |
| S35 | NASA Science, [Eclipse Viewing Safety](https://science.nasa.gov/eclipses/safety/) | 日环食/偏食无安全裸眼阶段、太阳眼镜、儿童监督、前置滤镜、背向太阳的针孔投影；F025 F043。活动只取间接投影。 |
| S36 | Atlas, 本文 §3–4 “sun-earth-moon design study v1” | `design:true`。text 写圆轨道/球形/固定轴、常量、显示映射、每个实验冻结项与运行点；note 写非实测、无真实日期、公式、计算数据出处。oracle 为父 `engine-oracles.json`，CC0 数字对照；不把 spec-draft.md 当最终算法权威。 |
| S37 | NUS Physics, [Solar Eclipse](https://www.physics.nus.edu.sg/solar-eclipse/) | “Annular Solar Eclipse and SEANN Meeting, 26–28 Dec, 2019”段：本地实际观察日期与日环食；F026。仅用事件事实，不取观测人数、器材数、当地持续时间或下一次日期。 |
| S38 | 新加坡华族文化中心 / 华族文化百科，李国樑，[中秋节](https://culturepaedia.singaporeccc.org.sg/zh/social-practices/festivals/the-mid-autumn-festival-in-singapore/) | 首段“农历八月十五”与本地中文；F031。无历史起源故事、习俗普遍性、最圆/最近的天文断言。 |
| S39 | HKO, [二零二六年中秋节赏月锦囊](https://www.hko.gov.hk/sc/%E6%96%B0%E9%97%BB%E5%85%AC%E6%8A%A5/110730/%EF%BB%BF%E4%BA%8C%E9%9B%B6%E4%BA%8C%E5%85%AD%E5%B9%B4%E4%B8%AD%E7%A7%8B%E8%8A%82%E8%B5%8F%E6%9C%88%E9%94%A6%E5%9B%8A) | 首段明确中秋与稍后的准确满月分日；F032。用作反例证据，主线不加入香港月出/满月时刻表，不声称那是新加坡地平数据。 |

| S40 | NASA Science, [Eclipses and the Moon](https://science.nasa.gov/moon/eclipses/) | The Moon’s Tilted Orbit、Lunar Eclipse Basics：约5°倾斜使日月食不每月发生；F021–F023。只取几何机制，不取该页未来天象表或长期预报。 |

不进入产品来源论证：S01/S02 的旧课纲缓存、S12 过去日期滚动页、S13 索引坐标、S15 路径采样、S16 旧索引事件、S17/S32 只有标题的 STB 页面、S23–S25 未用认知研究。NHB 与部分 SCCC/STB 页面未提供可读正文或出现验证时，已停止；改用可读 S38，未操作验证。

逐项 `SOURCES.md` 需列 F → S 映射、每个学生数值的来源/公式、参考点设计属性、原/派生太阳表哈希、所有近似、实际显示精度、插画 provenance 及 §3.6 许可族。F036/F037 和模拟日长引 S36 并指向依赖常量的 S08/S09/S10，不把算式结果写成来源网站的原话。

## 7. 图像清单（仅现有三张）

本轮重新打开三张 PNG 目视：三球仪含一太阳灯球、一地球、一月球；平行轴图两根轴同向；四月相从左上起为新月、上弦、满月、下弦。灰度透明底，无文字。它们是插画，不是量角器、真尺度图、真实天空照片或天象数据。

| 原文件（均在 `art/planned/sun-earth-moon/`） | 放置与成品计划 | 定稿图注 / alt EN 与 ZH |
|---|---|---|
| `sun-earth-moon.png` · 1024×1024 | 首页 cover → `public/illustrations/sun-earth-moon.webp` 及 @2x；原 PNG 保留 | alt: A mechanical tellurion with one Sun lamp, an Earth globe and a Moon. / 有一个太阳灯球、一个地球仪和一个月球的机械三球仪。note: Teaching instrument; schematic proportions. / 教学仪器，比例为示意。[F004；D2] |
| `sun-earth-moon-parallel-axes.png` · 1536×1152 | 02.3 后 → `public/illustrations/figures/sun-earth-moon-parallel-axes.webp` 及 @2x | Parallel axes at opposite model positions. Sizes, gaps and the projected angle are schematic. / 相反轨道位置上的地轴保持平行。大小、间距和画面投影角均为示意。alt: Two Earth views with parallel axes and opposite sunlight relations. / 两个地球视图，地轴平行，受光关系相反。[F007 F008 F009] |
| `sun-earth-moon-four-phases.png` · 1536×1152 | 04.4 后 → `public/illustrations/figures/sun-earth-moon-four-phases.webp` 及 @2x | Four north-up phase views: new, first quarter, full and last quarter. This is not a Singapore horizon chart. / 北朝上的四种月相：新月、上弦、满月、下弦。这不是新加坡地平视图。alt: Four lunar discs in two rows. / 两行排列的四个月盘。[F015 F016 F018] |

原 manifest 的 SHA-256 分别为 `438a02030459728dbbf22cfd5ae24cae44129e436453c12ec3b9c4cd771c00e2`、`6a24f5e9d4228f20838ec5c38a71e0ddf375952e44ed6b1d7e98d29405bd6fa2`、`74348e93ed33578f022895f081d09cd8235e1608784624a8c01324c35c470735`。施工转换前按此核对，不改原图与生成记录。使用仓库 `scripts/illustrate.ts` 和现有依赖导出，原 manifest 作为 provenance；不再生成、裁切或下载第四张图。暗侧细节是教学画法，四月相的左右亮面不承诺新加坡当天肉眼朝向。

## 8. 施工验收清单

以下全是施工后要满足的 gates，本轮文档定稿不把它们打勾。

- [ ] E-SEM1–3 依 §4 实现，先有 draft `sample-orbit`、数值夹具和测试；docs/06 补注册与作者手册，§9 记录实际契约差异后再铺内容。原有 circuit / light / table / seeds / timeline 行为保持。
- [ ] `pnpm check`、`pnpm validate`（0 error、0 warning）、`pnpm test`、`pnpm build`、build 后 `pnpm e2e` 全绿；不增加依赖，不用本轮纯算术复核冒充应用测试。
- [ ] `pnpm shoot sun-earth-moon --locale all --theme all --beats --keys --layout` 全绿并看图；39/39 拍链接、8 章直接跳、P 从当前拍开始、退出恢复；`unlabelled` 清单为空、chapter highlights all on screen。再以 `--size 1600x900 --beats` 检查标注，不能仅依退出码忽略漏标提示。
- [ ] `--layout` 当前脚本的八尺寸都测：3840×2160、2560×1440、1920×1080、1600×900、1280×720、1024×768、900×1200、390×844；EN/ZH × paper/cinema，页面初次打开的 ch+b 与换章一致，iPad/手机控件 ≥44 px 且不依赖 hover。
- [ ] 底部只有现有章节轴；刻度点/`,`/`.`/按钮用同 store；阅读顺序按 docs/08；实体索引完整，选中详情在章头下方，无新底条、不可点虚拟卡或伪锚点。
- [ ] T01–T28、365 日期例外及全部非法输入测试通过；浮点容差、模型数值与学生显示精度分开。每个变换/明暗/观察窗只读同一物理 snapshot；实际 render 读回与 solver 相符。
- [ ] 真尺度 BG 地球 10 mm、地月中心距约 302 mm 与表面 gap 分清；切换示意尺度/相机/语言/主题不改任一物理输出；所有倍率可见。全系统远景里地月不可辨是比例事实，用近景和索引解释，不能偷偷放大。
- [ ] 地轴从法线量约 23.4°且全年同向；南北日长对调，倾角零时几何日长变化消失；01 的冻结 24 h 演示与 coupled 的恒星周期标签不同，日长不当气温预测。
- [ ] 03 只读本地计算年表，365 天完整；显示约 12 h 03 min–12 h 12 min，UTC+8、参考点、平地地平线、−0.833°与“计算估计”齐全；不以圆整 sunset−sunrise 覆盖原昼长，不出现 cut 的 MSS 验证或官方坐标/望远镜尺寸。
- [ ] 04 月相窗随主相机转动仍北朝上；弦月约半亮；地影对照远离弦月；共面满月的食遮暗与几何亮部百分比单列，不能演成“每次满月都食”。同步关闭时惯性朝向固定。
- [ ] 05 月轨道倾角约 5.1°与地轴约 23.4°分别标；节点零倾角退化有明确文案；有限光源的本影/半影/伪本影仅在同尺度局部图，光锥与示意放大球不假接；地心月相与地表日食分开。
- [ ] 06 2019 日期说明与“无日期模型解释”同时可见；无当日接触时刻、食带、秒级数值或未核持续时间；日环食亮环仍需安全观察；背向太阳看投影、成人监督和不透孔/不经未滤光设备直视说明完整。
- [ ] 07 农历八月十五只作日期事实，不自动变亮部100%；无平均朔望周期生成的公历节日表；文化叙述不替代物理，未画出假的实测月亮日记。
- [ ] 所有学生数字、细看、spec、PLATE、字幕、part detail 均有来源/公式及一致精度；SIM/TYPICAL/DESIGN 清楚，S36 自描述，中文术语按 D10 说明，无被 cut 的事实漏回正文。16 个名词、来源 id、see 与 TopicLink 都通过当前校验。
- [ ] 3 张插图依 §7，R2 比例/朝向、R3 两主题明暗与 R4 过程各看截图；模型无需 X-RAY/CUTAWAY/EXPLODED，显式禁用并写双语原因，相关模式截图以禁用证据替代；REFERENCE、ORBIT、HUD、FLOW/RUN 与缩放组合可用。
- [ ] GPU 下 `pnpm shoot sun-earth-moon --perf --gpu --json ...` 记录实际 calls/triangles/fps/硬件；满足 §4.10 的 <100 calls / ≤1.5 M 硬限与更严目标，暂停 demand、后台不补跑；记录 JS gzip、太阳 JSON 大小，无首屏预算静默放宽。
- [ ] 网络审计无运行时外部请求/CDN/瓦片/星历下载，console/pageerror/同源4xx–5xx 干净；回归 `sample-space`、`light-and-shadows`、`sample-heart`、`sample-seeds` 及含 timeline 的 `forces` / `energy-conversion`，主题 slug 以仓库实际存在项为准。
- [ ] `data/SOURCES.md`、LICENSE-CONTENT、THIRD-PARTY-NOTICES 的 CC0 / NC-SA provenance 与例外齐全，没有 BY-SA/NC-SA 混合派生文件；最终 `status: published`，记录截图 `hero-paper`、`hero-clean`、`hero-dark`、`hero-zh`、`phone-390` 与关键科学状态到 `docs/screenshots/sun-earth-moon/`。

## 9. 引擎记录（施工后填写）

### 9.1 E-SEM1–E-SEM3 引擎施工记录（Codex，2026-10-27）

**范围与状态**：只施工引擎与 `sample-orbit` draft 夹具，没有创建正式 `sun-earth-moon` 内容、图像或星历。§8 不打勾：数值、schema、类型与构建已通过，浏览器启动被当前执行环境拒绝，尚未完成视觉 / e2e / GPU 验收。未修改依赖、lockfile 或 review queue，未执行 git 写操作。

**实现文件**：

- E-SEM1：`orbit-rotation-schema.ts`；`lib/sim/orbit-{constants,rotation,clock,session}.ts`。注册 SIM_KINDS / simSchema / quantityKind / 状态表 / simQuantities / evaluateSim / SEPARATE_EXPERIMENTS；原五参数后追加 context，不改变旧参数含义；无 timeline channels。13控件、23输出、共享可恢复t、受限365日期例外、有限视盘与影锥法向距离、计算年表读取。`core/url-state.ts` / `types.ts` / `SceneHost.tsx` 与 SpaceScene 的 beat / presentation 保存 `orb-t`；暂停、尺度切换、控件重置、REFERENCE 与演示恢复读同一个会话。
- E-SEM2：`lib/sim/orbit-projection.ts`、`stages/model3d/OrbitDriver.tsx`，接入 SceneRoot / PartNode / materials / CameraRig / bridge。沿既有可选 part 节点写绝对位置、四元数和半径；表面附件用父体半径；解析明暗覆盖棚灯输出，无新色 token。实际 world matrix 与太阳 uniform 从舞台反读到 `engine.orbit()`；`engine.orbitSeek()` 通过同一会话定位，等 rendered.snapshotId 后比较。PLATE 跟随 orbit 输出不作独立缓动。
- E-SEM3：`hud/OrbitCard.tsx` 与现有 card / readerTop 槽。地心北朝上球面射线月相、模型观察点同角尺视盘、365日计算曲线；影图独立同尺度，含本影 / 半影 / 伪本影，月食遮暗与几何亮部百分比分开。`orbit-guides` 更新六个真实 guide 节点的几何，不另画不可选副本；零倾角隐藏交线。全年图指针 / 前后日与 TryIt 共用 setSim，来源复用 SourceRefs，没有新 selection kind 或底条。
- 夹具：`src/content/topics/sample-orbit/`，8章 / 39拍，13 parts、4 groups、13 controls、23 outputs、9 binds、2 overlays、5张 TryIt；两种尺度、三种观察窗、离节点 / 偏食 / 环食 / 全月食均有状态。背景、06、07也有尺度按钮；X-RAY / CUTAWAY / EXPLODED 禁用并写双语原因。年表为独立 CC0 文件，365行数值不变，只删旧 MSS cross_check 并改 precision；来源与哈希见夹具 SOURCES.md（验收时撤回了 LICENSE-CONTENT / THIRD-PARTY-NOTICES 的夹具条目：夹具不发行第三方素材；正式主题按 §3.6 再定）。
- 验证：`tests/space-scene/orbit-rotation.test.ts`（30 tests，覆盖 T01–T28、365日期异常、旧24项上限、39拍、URL / context / clock / restoration）；CC0 `tests/space-scene/fixtures/orbit-oracles.json`；`tests-e2e/sample-orbit.spec.ts`（9项，含39直链、矩阵 / uniform、手机、REFERENCE / presentation / reduce-motion、注入30/60/120fps与后台时间）。`scripts/shoot.ts` 扩展原 --beats / runBeatLinks：收 snapshot 与实际变换，比较拍与直链，并比较 orb-t 与 orbitSeek；旧模型不进入分支。作者完整 JSON 与注册说明见 docs/06 新节。

**相对 §4 的差异与理由**：

1. 现有 source id 规则为 `S[1-9]…`，不允许 S08 / S09。作者数据使用 **S8 / S9**，其余 S10 / S33 / S36 原号不变；oracle 原文件不改。没有为一个主题放宽全站来源规则。
2. `solarYear.table` 是构建链接本地 file 后的内部字段；浏览器随主题 data.json 一次取得它，作者模板只写 file。没有新的太阳表网络请求或运行时路径解析。
3. 绝对天体写者集中在 **OrbitDriver**，在既有 PartNode 动画之后、CameraRig / LabelProbe 之前应用，并更新实际 bounds / picking mesh / bridge；没有把天文绝对坐标混进通用 offset/rotate 的缓动栈。实际可选节点与光照仍是原舞台对象。
4. 物理 snapshot 使用每次求值返回的独立普通数值记录，**不是 §4.3 所要求的全预分配物理结果缓冲**；显示尺度切换保持 snapshot 实例，纯求解实测约0.019ms，渲染侧几何、材质与 THREE 临时向量预分配。运行时长时间GC / 真机帧率尚未取得，不能把算术速度视作该项性能验收通过。
5. 数值T01–T28无变更；名义90°弦月仍约50.1284773403%，并未改成精确50%。影锥仍用真实物理半径 / 距离；图中球体没有为可读性单独放大。观察窗使用原槽位和一个共享会话，没新增卡片对象或第二模型。

**已执行 gates 与限制**：

| Gate | 本轮结果 |
|---|---|
| `pnpm check` | 0 errors、0 warnings，3个仓库既有 unused 提示；包含最终新增 e2e 的类型复核。 |
| `pnpm validate` | 56 topics，0 errors、0 warnings。 |
| `pnpm test` | 156 files / **4209 tests passed**（orbit 30 tests）。 |
| `pnpm build` | **115 pages built**，静态构建成功。 |
| `pnpm shoot sample-orbit --beats --keys --layout` | 浏览器创建阶段失败，0页面执行，未生成可审截图。 |
| 四个回归 topic 的 `--beats --keys` | light-and-shadows / sample-light / energy-conversion / sample-heart 在修改前和修改后均因相同 Chromium MachPort 权限错误而无法启动。没有可比较的功能结果，**不能声称0新增回归**。 |
| `CI=1 ATLAS_E2E_PORT=5401 pnpm e2e` | 343 tests 均失败于 browser fixture 启动，页面断言未执行；新增第9项后另单跑 sample-orbit，结果见下补记。 |

浏览器错误为 `bootstrap_check_in … MachPortRendezvousServer … Permission denied (1100)`。computer-use 工具另返回 “Computer Use was not approved to use Google Chrome”；未操作授权、验证或条款页面，没有尝试绕过限制。

**性能实测边界**：Apple M5 Max / macOS arm64；预热1000次后10000次纯 snapshot 求值平均 **0.0188ms**；本地太阳 JSON **90248 bytes**（≤100KB）。构建日志相对施工前，SpaceScene View gzip约+9.1KB、Model3DStage约+2.6KB、公共小块约+0.3KB，合计约12KB，低于新增15KB目标；这不是浏览器首屏网络采样。未取得实际 draw calls / triangles / GPU fps / 长时间GC、首屏≤300KB、两主题 / 八尺寸布局、截图目视、网络与console运行时审计；这些都是尚未通过的验收项，没有静默放宽预算。已授权可继续的工作以恢复浏览器执行后的这些 gates 为界。

**浏览器补记**：最终独立执行 `CI=1 ATLAS_E2E_PORT=5401 pnpm e2e tests-e2e/sample-orbit.spec.ts`，9/9同样在 Chromium 启动时被拒绝（未执行页面断言）；`pnpm shoot sample-orbit --perf --gpu` 也在启动阶段被相同 MachPort 权限拒绝，未取得GPU测量或截图。

### 9.2 验收（Claude，2026-10-27）

浏览器 gate 在本机可跑，补齐 §9.1 缺的截图 / e2e。审查后保留 Codex 的结构（一个 sim kind、会话 + OrbitDriver、两个 overlay、OrbitCard 占原 card 槽），只改了看得见的错和多余的东西：

- **月相窗颜色反了**：paper 上亮部画成 `--ink`（深色），暗部是底色，孩子会把暗的半边读成亮的。改为两套主题都取较亮的 token 画亮部、较暗的画暗部；颜色从 canvas `fillStyle` 读，不再 `getImageData`（原来每拍一条 console 警告）。
- **观察卡太高**：1280×720 / 1024×768 下 03–07 章卡片出屏、压住章节轴（36 条 layout 问题）。卡头改为 Observation / 观察窗（原来显示“零件链路”）；图与读数并排，影图只裁到天体所在的细条；删掉卡里重复的 Earth / Moon 选择按钮（选择走本章索引，铁律）。现在 0 条。
- **视盘窗**：月球画成两套主题都暗的剪影；月球在太阳一侧时影图把地球放右边，两者都在框内。
- **夹具月球 tint**：`ink-2` 在 paper 上是深灰，亮面和暗面分不出 → 改 `neutral`（两套主题都是中灰）。正式主题定稿时 §3.5 的 token 表照此改。
- 去掉未使用的 store 字段 `orbitClock`、重复的 24 项上限检查；撤回 LICENSE-CONTENT / THIRD-PARTY-NOTICES 的夹具条目（不发行第三方素材）。
- e2e：day 直链只写了两个 sim 值，URL 的 sim 是整套值，章节的 `lab: day` 被替换成默认 coupled → 测试链接补 `lab.day`（引擎行为与其他 sim 一致，不改）。

| Gate | 结果 |
|---|---|
| check / validate / test / build | 0 errors；56 topics 0 errors；156 files / 4210 tests；115 pages |
| `shoot sample-orbit --beats --keys --layout --theme paper,cinema` | 39 拍 × 2 主题 0 failures，39/39 直链同景，orb-t = orbitSeek，layout 0（八个尺寸），console clean |
| 回归 `--beats --keys` | light-and-shadows、sample-light、energy-conversion、sample-heart、materials、flower-and-seed、fractions、sample-time：均 0 failures、console clean |

| `CI=1 pnpm e2e`（全量，合并 main 前的构建） | 333 passed / 11 failed：heart-and-lungs、sample-heart（屏气后呼吸动画未归零）、singapore-after-1965、singapore-land-use、sample-space smoke、sample-forces、space-label-drag 均为超时或帧率阈值；同一负载下在 main 的构建上逐个重跑，失败相同（机器负载 100–160） |
| 合并 main（蒸汽机构引擎、inside-the-earth）后 | check 0 errors；4308 tests；58 topics；119 pages；`shoot sample-orbit --beats`（两主题）39/39、0 failures；`shoot sample-mechanism --beats --keys --layout` 16/16、0 failures、console clean；e2e sample-orbit 8/9 + sample-mechanism 10/11 单独重跑（失败均为高负载下超时 / 0.4 rad 帧步阈值） |

e2e 的直链测试原来逐个打开 39 拍（负载下 7–10 分钟），改为每章第一拍 + BG.3 真尺度共 9 拍；全部 39 拍的对照由 `shoot --beats` 做。shoot 的拍 / 直链对照不再比较 `rendered`（逐帧绘制状态，含淡入），这一项由 orbitIssues 在帧落地后对照快照检查——高负载下直链 400 ms 时首帧可能还没画，造成 2/39 的偶发差异。

看过的截图：地轴在 02 章两极值拍方向不变（观察点相对地心偏移逐位相同）；01/04 章明暗界线朝向太阳（相机在夜侧时整球暗，是对的）；04 章上弦月北朝上右亮 50.13 %；05/06 章日全食 / 环食 / 月全食的视盘与影图；BG.3 真尺度标签；手机 390 宽。

仍留给内容施工：03 章观察点、04/05 章月球在章初镜头下没有可见标签（夹具镜头，shoot 只记不判）；轨道导引管在近景里偏粗（半径 = 地球显示半径 × 0.012）；`simEffects` 的普通绑定读的是进入章节时的 orbit 输出，运行中不会刷新——目前夹具没有这类绑定，正式主题若要按 orbit 输出显隐零件需先补。
