# 46 · 化石与恐龙骨架 · 内容施工 spec（`fossils-and-skeletons`，定稿）

2026-10-27。SpaceScene / Model3DStage；EN 默认、ZH 完整；paper 默认、cinema 可切。父 dossier：`dinosaurs-and-fossils`；姊妹主题：`dinosaur-earth`。本文件是施工依据，覆盖准备稿；仅交付本规格，不代表主题已经构建或验收。

**上线方式：直接上线。** 按 `docs/next-batch.md` §一，本主题不需等待历史内容复审；施工期间 `status: draft`，§8 全绿后改 `published`。新引擎工作 **0 项**，不等其他引擎分支。背景章 + 7 正式章、36 拍、两张原生试一试卡、16 个核心名词、封面 + 两张章节图。

## 0. 决定与事实复核

### 0.1 给 Gavin 的代定项

| id | 代定内容 |
|---|---|
| D1 | 主线为身体 / 活动证据 → 埋藏 → 地层先后 → 灰层夹定 → 骨架依据 → 活鸟 → 新加坡馆藏；古地图、年代全表和灭绝因果讨论交 `dinosaur-earth`。不设测验。 |
| D2 | 骨架是通用 **Tyrannosaurus rex 教学复原**，不对应某具标本；不是“任意恐龙”都长这样。每手两个功能性手指、每足三个主要承重趾。[F015–F016] |
| D3 | 保留身体证据 / 活动证据和保存方式两条分类轴；叶印痕不能变成与身体、活动互斥的第三类。[F003, F053–F054] |
| D4 | 灰层全部年龄与误差为虚构 DESIGN/SIM；三组算例只教范围，不给化石中点年龄。主卡保留五项范围读数；外包界限是设定的有界区间，不称置信区间。[DS02] |
| D5 | 十二模块中 7 直接、3 比较、2 推定，为虚构库存；模块不是骨头，也不是馆藏完整率。形状依据与展示材料分两行，直接记录的复制头骨仍算直接依据。[DS03] |
| D6 | 馆藏用 Prince、Apollonia、Twinky，保留拉丁字母；分类停在梁龙科蜥脚类，不给各自物种、性别、亲缘或逐骨材料清单。三件通用长颈模型不按真实个体大小或展台姿态复制。[F026–F028, F030] |
| D7 | 主线不讲“超过八成”，仅在细看明确归于馆方概括，不解释为骨数 / 骨量算法；两具有头骨是独立来源主张。[F026] |
| D8 | 爪哇八哥是本地活鸟例；“它也是恐龙”明确是 F017 与 F035 的合并推论。删去引入年代、管理措施、法律与旧昵称支线。 |
| D9 | 中文术语、爪哇八哥、霸王龙、始祖鸟、莫里森组、Dana 采石场均按本规格编辑用词；本轮未建立新加坡权威中文对照，不标 MOE 规范译名。英文与拉丁名帮助辨认。 |
| D10 | 五组研究共用一个展示体积，各自为示意尺度，不设实长、物理比例尺、标本体重或骨骼总数；矿物孔隙放大不标显微尺度。无真实地质时间推进。[DS01, DS04] |
| D11 | 动物死亡、腐解和灭绝平实叙述，无血腥；只讲约六千六百万年前非鸟恐龙灭绝及部分鸟类支系幸存，不展开有争议的灭绝机制。[F004, F019] |
| D12 | 保留三张既有生成图，不新生成、编辑或引入外部照片 / 网格；插图不能作为几何测量证据。 |
| D13 | 数值只用原生试一试卡，不重复定义 telemetry；原生 scope:observe 不会收起整行。索引照现有实现选择零件；隐藏件另配普通章拍链接。05 章索引保留全部 12 模块，作为 3–10 项建议的明确例外。无需新增导航组件。 |
| D14 | `subject: science`，`levels: [P3, P4, P5, P6]`、`tags: [beyond-syllabus, singapore]` 仅作规划。删去未在本轮重新取得的课纲具体断言，不宣称 PSLE 必考。 |

以上均为可复核的默认决定，无阻塞项；本轮不改 review queue、其他规格或主题源码。

### 0.2 证据与审计口径

父事实编号 F001–F052、新增 F053–F057 保持原号；本次只审准备稿实际采用的 **38 条**，不把父 dossier 的全部事实搬入本主题。没有字面 ⚑ 标记；仍将 medium / 原文读取受限项按待核处理。尤其 F027 已取得馆方 HTML 原文；F047 被删，不再延用二手结论。死亡 / 灭绝、馆藏命名、亲缘和所有拟展示数量也在下表交代。

`verified` = 本轮取得原发布者页面并核实采用范围；`changed` = 缩小主张或改用完整可读的证据链；`cut` = 从本主题删除，不暗示该事实错误或已核实。自然事实复核 **25 verified / 3 changed / 10 cut**，逐行互斥。DS01–DS04 另作设计与算术核查，不混入自然事实计数。下表中的来源 id 在 §6 有直达链接与定位；不复制原文引句。

### 0.3 fact id → 结论与来源（本轮访问 2026-10-27）

| fact id | 结论 | 定稿采用范围 / 删改原因 | 本轮依据 |
|---|---|---|---|
| F001 | cut | 完整中生代边界及其数值留姊妹主题，本主题不展示。 | 原 [S01](https://stratigraphy.org/ICSchart/ChronostratChart2026-06.pdf)；本轮未重新取图，不沿用其数值 |
| F002 | cut | 地质边界修订史随年代全表移出。 | 原 [S01](https://stratigraphy.org/ICSchart/ChronostratChart2026-06.pdf)；同上 |
| F003 | verified | 化石记录身体部分或活动；骨 / 叶与足迹分别说明。 | [S2](https://www.nps.gov/subjects/fossils/how-fossils-form.htm)，Introduction / Fossil Types |
| F004 | verified | 快速埋藏、硬组织有利，仍不保证保存；不报成功概率。 | S2，Odds of Becoming a Fossil |
| F005 | verified | 矿物可从地下水沉淀，充填原有孔隙。 | [S4](https://www.nps.gov/articles/000/permineralization-and-replacement.htm)，Permineralization |
| F006 | verified | 充填与置换不同，可并存；不把所有化石都叫石化。 | S4，Introduction / Replacement；S2，Preserved Remains |
| F007 | verified | 自然印模为空腔 / 印迹，其填充可成铸型，区别人工复制。 | [S3](https://www.nhm.ac.uk/discover/how-are-fossils-formed.html)，Mould and cast fossils |
| F008 | verified | 抬升、风化、侵蚀使原被覆盖的化石出露。 | S3，Uplift, weathering and erosion |
| F009 | verified | 未扰动、正立的沉积层下老上新；不能用厚度直接读岁数。 | [S59](https://geology.utah.gov/map-pub/survey-notes/rock-dating/)，Superposition；[S5](https://www.amnh.org/explore/videos/dinosaurs-and-fossils/how-do-we-know-how-long-ago-dinosaurs-lived)，正文 |
| F010 | verified | 灰层合适矿物中的放射性变化可给矿物年龄。 | S5，灰中晶体与母 / 子原子段 |
| F011 | changed | 原 S5 只够解释矿物时钟；补 S58 的上下灰层夹定与误差原文。年龄范围是两界限的推论，受正立、原生灰层、未再搬运等本例前提限制；不把中心值平均成实测年龄。 | [S58](https://humanorigins.si.edu/evidence/dating)，Tephrostratigraphy / Absolute Dating；S5；DS02 算术 |
| F012 | verified | 碳十四用于较近期有机遗存，数万年量级；不给统一硬截止，不用于中生代恐龙骨。 | [S6](https://www.nist.gov/how-do-you-measure-it/how-do-you-know-age-fossils-and-other-old-things)，carbon-14 段 |
| F013 | verified | 用解剖与其他动物比较复原分散骨架。 | [S7](https://www.nhm.ac.uk/discover/what-can-scientists-learn-about-dinosaurs-and-how.html)，How palaeontologists learn about dinosaurs |
| F014 | verified | 骨、足迹等证据支持不同问题；教学完整形象不等于完整出土个体。 | S7；[S55](https://www.fieldmuseum.org/blog/which-dinosaur-bones-are-real)，Understanding fossils and casts |
| F015 | verified | T. rex 每手两个功能性手指。 | [S9](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-t-rex)，Arms and Fingers 字幕原文 |
| F016 | verified | 本课兽脚类足形以三个主要承重趾约束；小抬趾不计作主要承重趾。 | [S48](https://www.amnh.org/explore/ology/paleontology/beyond-t-rex)，Theropoda |
| F017 | verified | 现生鸟嵌套于兽脚类恐龙内。只采用该页分类说明，不沿用其他老年代或鸟种数。 | [S8](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-dinosaurs)，问题 9 |
| F018 | verified | 始祖鸟有羽毛、叉骨及不同于现生鸟的特征；不指定为所有鸟的直接祖先。 | [S10](https://www.nhm.ac.uk/discover/what-were-the-first-birds-like.html)，Archaeopteryx 段 |
| F019 | verified | 约 66 Ma，非鸟恐龙灭绝，一些鸟类支系幸存；约六千六百万年前为单位换算。 | [S11](https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html)，开篇 / What survived |
| F026 | verified | 馆方称三具梁龙科蜥脚类超过 80% 完整，其中两具有头骨；不是本课独立逐骨审计。 | [S17](https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/)，Highlights: Dinosaurs；S57 另述头骨材料 |
| F027 | changed | 名字与 Dana Quarry / Ten Sleep / Wyoming / Jurassic Morrison 保留；采用完整可读的馆方 HTML，替换“PDF 摘要已核全篇”的不充分证据状态。 | [S57](https://lkcnhm.nus.edu.sg/interview-with-an-evolutionary-paleobiologist-dr-emanuel-tschopp/)，Research work in LKCNHM |
| F028 | verified | 当前 gallery 使用 diplodocid sauropods；本课不逐个指定种。 | S17；S57 的物种身份研究措辞 |
| F029 | cut | 旧 Apollo / baby 命名史不是主线；不从旧昵称推出性别或亲子关系。 | 原 [S19](https://rafflesmuseum.wordpress.com/2012/04/25/welcome-twinky/)；不进入运行时来源 / 正文 |
| F030 | verified | 馆方将 herd / family 说成可能；不能改写为已证实父母孩子。 | S17，believed 的限定措辞 |
| F035 | changed | 只保留爪哇八哥在新加坡出现；删去引入年代和其他管理话题。“活恐龙”为 F017 + F035 的编辑合并推论。 | [S23](https://avs.nparks.gov.sg/wildlife/encountering-wildlife/house-crows-pigeons-javan-mynas/javan-mynas/)，Distribution & Habitat |
| F042 | cut | 本主题不选 Smithsonian 网格，无需向学生解释资产授权体系。 | 原 [S32](https://www.si.edu/openaccess/faq)；许可执行 §3.10 的项目规则 |
| F043 | cut | 未采用的受限前肢模型不进课堂、资源或运行时来源。 | 原 [S33](https://www.si.edu/object/3d/tyrannosaurus-rex-osborn-1905-left-and-right-forelimb%3A133260a5-a653-4fc6-953f-2d1a1364269a)；无模型下载 |
| F044 | cut | 本轮不把缓存课纲结论重述为已复取的现行课纲事实。 | 原 [S37](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx)；拓展阅读为编辑定位 |
| F045 | cut | 社会科相邻技能支线删除。 | 原 [S38](https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf)；不进入运行时 |
| F046 | cut | 澳洲小样本不是本地误解流行率；本主题不用研究人数。 | 原 [S39](https://link.springer.com/article/10.1007/s11165-024-10195-0)；不进入运行时 |
| F047 | cut | 二手文献综述与未取得原文的年代理解结论删除。 | 原 [S40](https://doi.org/10.1080/21548455.2016.1200155)；未以索引摘录冒充原文 |
| F048 | verified | 发现时间 2007–2010，地点 Ten Sleep，美国；不等于运抵新加坡时间。 | S17，Highlights: Dinosaurs |
| F051 | cut | 最早确证恐龙约 230 Ma 的支线移姊妹主题，不出现在本主题数值中。 | 原 [S52](https://www.amnh.org/explore/videos/dinosaurs-and-fossils/150-million-years-of-dinosaur-evolution)；本主题不依赖 |
| F053 | verified | 印痕不保留有机质；压型仍留变化后的部分有机质。 | [S54](https://www.nps.gov/articles/000/impressions-and-compressions.htm)，Definitions |
| F054 | verified | 叶可留印痕，细粒沉积可保存细节；教学叶不定种。 | S54，Occurrence |
| F055 | verified | 直接翻模和参照其他骨件补塑具有不同形状依据。 | S55，Understanding fossils and casts |
| F056 | verified | 清理围岩、修复保存并记录；展架可混合原化石、复制与补塑。 | [S56](https://naturalhistory.si.edu/exhibits/david-h-koch-hall-fossils-deep-time/fossilab)，开篇 / FAQ |
| F057 | verified | 复制件可保护易损原件、分享异地馆藏；复制不等于猜想。 | S56，FAQ |

### 0.4 数字与限制总账

学生可见自然数量只用：T. rex 每手 **2** 功能指、每足 **3** 主要承重趾（F015–F016）；约 **66 Ma** / 六千六百万年前（F019）；馆藏 **3** 具、其中 **2** 具带头骨、馆方称 **>80%**、发现 **2007–2010**（F026、F048）。碳十四细看只说数万年，不引入半衰期数字或统一截止。所有其他年龄、区间、误差和模块数量只属 S90 / DS01–DS04；章序、坐标、镜头、性能指标是设计指标。

S18 年报 web 读取因文件过大失败，常规 HTTP 返回验证脚本页；没有绕验证、登录或接受条款。S57 完整 HTML 已足以支撑定稿，不需继续取得 S18。未提供三馆藏逐骨清单，所以不画个体真实性配色或算法完整率。

## 1. 立场、范围与必须讲对的事实

这是证据课与拓展阅读。读者从物体的可见差异判断“保存什么、能推出什么、还不知道什么”。目标是区分身体与活动记录、充填与置换、先后与年龄、形状依据与展示材料。[F003–F014, F053–F057]

主线用正立、未扰动、化石未再搬运、灰层原生的示意剖面；这些前提写在 03 正文、04 主卡 keep 与细看中。虚构年龄约束不用于 Prince、Apollonia 或 Twinky。[F009–F011, DS02]

活鸟属于恐龙的嵌套分类；相似外形只是观察入口，不能用 T. rex 变形成八哥解释演化。[F017–F018] 新加坡是展出地，美国怀俄明州是这组三馆藏发现地；一起发现与已证亲缘是两回事。[F027, F030, F048]

中文独立成文，英文用新加坡 / 英式拼写。每正式章 EN 200–300 词、ZH 350–500 字，3–5 段、2–3 个细看；章拍字幕 EN ≤45 词。科学、馆藏主张逐项关联本表 F id；设计主张用 DS id。运行时正文数量包 `<Num s="S#">`，detail 用 `[S#]`；字幕是纯文本，保留同样数值与“在这个模型里”。自然事实不能用 S90 代替机构来源。无拟人、目的论、感叹号或问句标题。

姊妹衔接：00、03、04、06、07 正文收尾各有 topic-only `<TopicLink slug="dinosaur-earth">`，不猜章节 id；若姊妹还未发布，就用双语书名普通文字。地图负责古地理、化石点与灭绝机制，本主题不造简易世界图。

## 2. 章节与节拍（施工字幕定稿）

### 2.0 总表与展开规则

`L=`为layers，`H=`为完整hide，`lab=`为labels，`C=`为§3.9 镜头；这些是写作缩记，不是新schema字段。落地都展开现有state字段。除特别写明，`view:assembled, explode:0, run:false, cutaway:none, ghost:[], part:null`；两控件章初默认重置`ash-case:wide, evidence-view:whole`；章内拍以**本章状态**为底，不以相邻拍为底。labels≤6，所有被标对象当前可见。

| # | id | EN / ZH | 拍数 | 章基线 L / H / labels / camera | 试一试 |
|---|---|---|---|---|---|
| 00 | `before-you-start`，background | Before you start / 开始之前 | 4 | L specimens；H leaf-lid；lab bone-sample, track-slab, leaf-slab；C evidence-close | 无 |
| 01 | `body-track-leaf` | Body, footprint and leaf / 骨、足迹与叶印痕 | 5 | 同00，但H空；lab bone-sample, track-slab, leaf-lid | 无 |
| 02 | `buried-to-exposed` | From burial to exposure / 从埋藏到出露 | 5 | L burial；H pore-shell, pore-minerals；lab sediment-mid, buried-bone；C burial-close | 无 |
| 03 | `layers-in-order` | Layers in order / 地层的先后 | 4 | L age-section；H dated-crystal；lab ash-low, fossil-bed, ash-high；C layers-close | 无 |
| 04 | `ash-beds-and-ages` | Ash beds and ages / 灰层与年龄 | 5 | L age-section；H空；lab ash-low, fossil-bed, ash-high；C layers-close | T1年代夹定 |
| 05 | `rebuilding-evidence` | Rebuilding from evidence / 依据证据重建骨架 | 5 | L skeleton；H空；lab sk-skull, sk-trunk, sk-pelvis, sk-tail-tip；C skeleton-side | T2复原依据 |
| 06 | `birds-are-dinosaurs` | Birds are living dinosaurs / 鸟是活着的恐龙 | 4 | L living-museum；H prince-study, apollonia-study, twinky-study；lab myna-body, myna-wing；C bird-close | 无 |
| 07 | `singapore-skeletons` | Skeletons in Singapore / 新加坡的恐龙骨架 | 4 | L living-museum；H myna-body, myna-wing, myna-leg, myna-feather；lab prince-study, apollonia-study, twinky-study；C museum-close | 无 |

36拍=4+5+5+4+5+5+4+4。正式章计7，背景另计1；EN、ZH两种都保留全部拍。每拍字幕标记的 F / DS 只在 spec 与审计清单，不朗读。每拍都有可见变化，不能只换字幕；04.4–04.5 的变化是试一试数值读数与对应灰层高亮，不暗示地层厚度随年龄变。

### 2.1 背景章 00 `before-you-start`

- **summary** EN “Fossils are evidence. This model separates what was preserved, what was measured and what has been reconstructed.” / ZH “化石是证据。这个模型把保存下来的东西、测量所得和复原部分分开来看。” [F003, F011, F014, F055]
- **阅读说明 note**：引用§3.9 双语声明，加“章轴只改变观察，不让百万年在屏幕上真实运行”。[DS01–DS04]
- **正文提纲**：①骨、足迹、植物形体的证据；②展台完整形象背后可能有空缺；③模型年龄与自然证据分开；④新加坡活鸟与展馆是两个不同入口。年代词只用“百万年前”，首次解释Ma；完整地质时代去兄弟。[F003, F011, F014, F017, F026–F028, F035]

| 拍 | 舞台变化 / 完整覆盖 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 00.1 | 章基线；evidence-close | The bone, footprint and leaf imprint record different parts of past life. The objects here are teaching models. | 骨、足迹和叶印痕记录着过去生命的不同方面。这里展示的是教学模型。 | F003, F053–F054, DS01 |
| 00.2 | L skeleton；H空；C skeleton-side；lab sk-skull, sk-pelvis, sk-tail-tip | Ivory marks direct records, blue-grey comparison and grey inferred parts. This invented teaching reconstruction separates the evidence behind a complete-looking skeleton. | 象牙色表示直接记录，蓝灰表示比较，灰色表示推定。这是虚构教学复原，用来分辨完整外形背后的不同依据。 | F013–F014, F055, DS03 |
| 00.3 | L age-section；H dated-crystal；C layers-close；lab ash-low, fossil-bed, ash-high | The layers give an order. Dates from suitable minerals can add an age range. Numbers marked SIM belong to our invented example. | 地层给出先后顺序，合适矿物的测年结果可以进一步限制年龄范围。标 SIM 的数字属于虚构算例。 | F009–F011, DS02 |
| 00.4 | L living-museum；H prince-study, apollonia-study, twinky-study；C bird-close；lab myna-body | A bird you see in Singapore belongs within the dinosaur family tree. Fossil evidence connects this living world with the past. | 新加坡能见到的鸟，在演化分类中也属于恐龙。化石证据把眼前的生命与过去联系起来。 | F017 + F035（合并推论）, F014 |

- **细看**：`Evidence and a model / 证据与模型`（F014，DS01）；`Millions of years / 百万年`（DS02：Ma 表示百万年前，为单位释义，链姊妹）。
- **本章索引**：bone-sample, track-slab, leaf-slab, sk-skull, sk-pelvis, sk-tail-tip, ash-low, fossil-bed, ash-high, myna-body。10项，跨工位索引有“看对应章”明确按钮 /正文链接；不得假设点隐藏件自动飞站。
- **首现词**：fossil, reconstruction。

### 2.2 第01章 `body-track-leaf`

- **summary** EN “A fossil can record a body part or an activity. A leaf imprint describes how a body part was preserved.” / ZH “化石可以记录身体部分，也可以记录活动。叶印痕说的是身体部分怎样被保存。” [F003, F053–F054]
- **正文提纲**：①单根骨保留身体形状，不是刚死的骨；②凹足迹是足与沉积相互作用的结果，未留下脚骨；③掀开石片看叶形；④分开分类轴：记录什么 / 怎样保存；⑤三件都不能单独告诉精确年代，也不能由教学足迹定出恐龙种名。自然mould/cast与博物馆复制cast同词不同用法，放细看。[F003, F007, F011, F014, F053–F055]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 01.1 | H空；lab bone-sample；camera推近骨样 | The bone records part of an animal's body. A fossil bone is evidence of a body part, even when minerals have changed it. | 这根骨记录了动物身体的一部分。即使矿物让它发生了变化，它仍是身体部分留下的证据。 | F003, F005–F006 |
| 01.2 | H空；lab track-slab；镜头俯看凹迹 | The footprint records an activity. The foot made a mark, but no foot bone is preserved in this teaching slab. | 足迹记录的是活动。脚留下了痕迹，而这块教学石板里没有保存脚骨。 | F003, F014, DS01 |
| 01.3 | H leaf-lid；lab leaf-slab；镜头到叶板 | Removing the upper slab reveals a leaf shape. This example is an impression, with no original organic material retained. | 移开上面的石片，叶子的形状显露出来。这个例子是印痕，没有保留原来的有机物质。 | F053–F054 |
| 01.4 | H leaf-lid；lab bone-sample, leaf-slab；C evidence-close | The bone and leaf shape both record body parts. “Impression” tells us about preservation, rather than making a separate group beside bodies and activities. | 骨与叶形都记录身体部分。“印痕”说明保存方式，并不是在身体与活动之外再设一种互斥类别。 | F003, F053–F054 |
| 01.5 | H leaf-lid；lab bone-sample, track-slab, leaf-slab；C evidence-close | Each object answers a different question. These shapes alone do not give an exact age or identify every animal that made a track. | 每件东西能回答的问题不同。单看这些形状，不能得到精确年龄，也不能把每个足迹认定到某一种动物。 | F011, F014, DS01 |

- **试一试**：无模型卡；文字活动建议：看三件标本，分别说“记录什么”与“如何保存”。不做正误评分。
- **细看**：`An imprint or a carbon film / 印痕与碳膜`（F053：压型另一个保存例，不把本图说成碳膜）；`Natural casts and museum casts / 自然铸型与博物馆复制`（F007、F055）；`What a footprint cannot settle / 足迹的判断边界`（F014，教学足迹不定种）。
- **本章索引**：bone-sample, track-slab, leaf-slab, leaf-lid。
- **首现词**：body-fossil, trace-fossil, impression。

### 2.3 第02章 `buried-to-exposed`

- **summary** EN “Burial can protect remains. Minerals may fill a bone's pores, and later erosion can expose the fossil.” / ZH “埋藏可以保护遗存，矿物可能进入骨的孔隙，后来的侵蚀又能让化石出露。” [F004–F008]
- **正文提纲**：①遗存很容易消失，硬组织和快速埋藏只是提高机会；②骨在中层，覆盖层压在其上；③放大孔隙看充填，不能把充填说成整体置换；④置换可另外发生，不是所有化石都石化；⑤风化 / 侵蚀出露，图像只画一条可能路径。[F004–F008]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 02.1 | H sediment-mid, sediment-high, pore-shell, pore-minerals；lab buried-bone, sediment-low | Most remains do not become fossils. This hard body part is shown before covering sediment is added; preservation is still only a possibility. | 大多数遗存不会形成化石。这里先看还未被覆盖的坚硬身体部分；它是否保存下来，仍不是必然。 | F004, DS04 |
| 02.2 | H pore-shell, pore-minerals；view xray；lab sediment-mid, sediment-high, buried-bone | Sediment covers the bone. Rapid burial can protect remains from damage and decay, but it does not guarantee a fossil. | 沉积物盖住了骨。较快埋藏能帮助遗存免受破坏和分解，但不能保证形成化石。 | F004 |
| 02.3 | H sediment-low, sediment-mid, sediment-high, buried-bone, pore-minerals；view assembled；camera孔隙特写；lab pore-shell | This enlarged cutaway shows spaces inside the bone. Permineralisation means minerals fill these spaces; the spaces are not drawn to microscopic scale. | 这个放大剖块显示骨内部的空隙。矿物充填是矿物进入这些空隙；画面没有采用真实的显微尺度。 | F005, DS04 |
| 02.4 | H sediment-low, sediment-mid, sediment-high, buried-bone；camera同上；lab pore-shell, pore-minerals | The added blocks represent minerals in the pores. Replacement is a different change, where minerals substitute for original material; both changes can occur together. | 加上的小块代表孔隙中的矿物。置换是另一种变化：矿物替代原来的物质。两种变化也可能一起发生。 | F005–F006, DS04 |
| 02.5 | H sediment-high, pore-shell, pore-minerals；view xray；C burial-close；lab sediment-mid, buried-bone | The cover is removed to show exposure after erosion. The fossil has not climbed through the rock; material above it has been worn away. | 移开覆盖层，表示侵蚀后的出露状态。不是化石自己穿过岩石向上爬，而是上面的物质被削去了。 | F008, DS04 |

- **图**：本章第③段后放`fossils-and-skeletons-fossilisation.png`；其三层不能改说“两个已测年灰层”。[F005, DS01–DS02]
- **细看**：`Filling and replacing / 充填与置换`（F005–F006）；`One path, many missing records / 一条路径与许多空缺`（F004）；`Why this is not a clock / 这不是计时动画`（DS04）。
- **本章索引**：sediment-low, sediment-mid, sediment-high, buried-bone, pore-shell, pore-minerals。
- **首现词**：sediment, permineralisation, replacement。

### 2.4 第03章 `layers-in-order`

- **summary** EN “In an undisturbed, upright sequence, the lower deposited layer is older. Order is different from a numerical age.” / ZH “在未受扰动且未倒转的层序中，下方先沉积的层较老。先后顺序与数值年龄不是一回事。” [F009–F011]
- **正文提纲**：①这块剖面先声明前提，不推广为任何地下情况；②从下层看至上层；③化石在中层的位置；④层厚不是固定时间，真实记录会有缺失，数值年龄需额外证据，链兄弟年代总览。[F004, F009–F011]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 03.1 | 章基线；lab ash-low；highlight signal ash-low | Start with the lower layer. In this upright, undisturbed example it was deposited before the layers above it. | 先看下方这一层。在这个正立、未受扰动的例子中，它比上方各层先沉积。 | F009, DS02 |
| 03.2 | H dated-crystal；lab ash-high；highlight signal ash-high | The upper layer came later. This simple reading requires the sequence not to have been overturned or disturbed. | 上方这一层较晚形成。这样读层序，必须先确认地层没有倒转或受到扰动。 | F009 |
| 03.3 | H dated-crystal；view xray；lab fossil-bed, ash-low, ash-high | The fossil-bearing bed lies between them. Its position constrains the order, provided the fossil has not been moved from an older deposit. | 含化石层夹在两层之间。如果化石没有从更老的沉积中被再次搬来，这个位置便能约束它的先后关系。 | F009–F011 |
| 03.4 | H dated-crystal；view assembled；C layers-close；lab ash-low, fossil-bed, ash-high | Layer thickness alone does not turn into years. The next chapter adds dates from suitable minerals; the map topic places these ages in Earth's history. | 不能只凭层厚就换算出年数。下一章加入合适矿物的测年结果；地图主题再把这些年代放进地球历史中。 | F009–F011；姊妹链接见 §1 |

- **试一试**：无数值卡；文字比较“能判断较老 / 较新”与“能给多少百万年”的不同。
- **细看**：`When up is not younger / 上方未必较新`（F009前提）；`Missing pieces of the record / 记录的空缺`（F004；不新增未经核实的沉积速率）；`Geological time on the map / 地图里的地质时间`（DS02，TopicLink 姊妹无 ch）。
- **本章索引**：ash-low, fossil-bed, ash-high。
- **首现词**：stratum, relative-age。

### 2.5 第04章 `ash-beds-and-ages`

- **summary** EN “Dates from ash minerals can bracket a fossil's age. The interval and the uncertainty must remain visible.” / ZH “灰层矿物的测年结果可以夹定化石年龄，范围与误差都要保留。” [F010–F011]
- **正文提纲**：①在剖面辨认灰层与含化石层；②矿物时钟读同位素变化、依赖合适材料与假设；③虚构150 / 148Ma算例：较年轻端在上层、较古老端在下层；④比较更近的灰层对；⑤比较同中心值但较小误差，不能产生中点真值。碳十四局限与真实层序再搬运问题放细看；本章算例不能给馆藏三具定年。[F009–F012, DS02]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 04.1 | 章基线；lab ash-low, fossil-bed, ash-high | The fossil bed sits between two ash layers in this invented section. Suitable minerals in the ash can provide dates for the layers around it. | 这个虚构剖面中，含化石层夹在两层火山灰之间。灰中的合适矿物能为两侧地层提供年龄约束。 | F010–F011, DS02 |
| 04.2 | camera测年矿物近景；lab dated-crystal；H空 | A mineral clock uses radioactive changes in the mineral. It dates a specified event in that mineral's history, rather than giving every dinosaur bone a direct date. | 矿物时钟利用矿物里的放射性变化，测定其历史中的特定事件，并不是给每块恐龙骨直接测出一个日期。 | F010–F012 |
| 04.3 | C layers-close；view xray；sim wide；lab ash-low, fossil-bed, ash-high | In this model, the lower ash is 150 million years old and the upper ash 148 million. The central dates bracket the fossil between those ages, rather than fixing it at their average. | 在这个模型中，下灰层为一亿五千万年前，上灰层为一亿四千八百万年前。两个中心年龄把化石夹在范围内，并不把它定在平均数上。 | F011, DS02 |
| 04.4 | C layers-close；sim close；highlight signal fossil-bed；lab fossil-bed, ash-low, ash-high | The second model pair has closer ages. Its central bracket is narrower, while the stated measurement errors still need to be considered. | 第二对模型灰层的年龄更接近，中心值给出的范围也更窄，但所设的测量误差仍要一起考虑。 | F011, DS02 |
| 04.5 | C layers-close；sim precise；highlight signal ash-low, ash-high；lab ash-low, ash-high | Smaller errors around the same two central dates reduce the outer envelope in this model. They do not remove the time gap between the layers or create one exact fossil age. | 在这个模型里，相同中心年龄配上较小误差，外包范围会缩小；两层之间的时间间隔却没有消失，也没有得到一个精确的化石年龄。 | F011, DS02 |

- **T1 年代夹定**：`vary:ash-case`；keep正立、原生灰层、未再搬运；observe=bracket-young, bracket-old, bracket-width, envelope-young, envelope-old；record:true；不设predict，不计算均值、不画混合单位图。卡下说明列出所选上下灰层中心年龄与设定误差，来自S90；可以用已有正文小表呈现三行全部数据，**不需要新动态模板输出**。精确区间读数保留“SIM / 在这个模型里”。[DS02]
- **细看**：`What is the clock timing / 时钟记录什么事件`（F010–F011，半衰期只解释概念，不造核素半衰期数）；`Carbon fourteen has a different reach / 碳十四的适用范围`（F012：近代有机物、数万年数量级，不给普适硬截止）；`An envelope is not a confidence interval / 外包范围不是置信区间`（DS02，说明模型所设有界误差与真实误差不同）。
- **本章索引**：ash-low, fossil-bed, ash-high, dated-crystal。
- **首现词**：radiometric-age, age-bracket。正文收尾出链兄弟“发现点年龄范围”。

### 2.6 第05章 `rebuilding-evidence`

- **summary** EN “A skeleton is rebuilt from evidence. A replica's material and the evidence behind its shape are separate questions.” / ZH “骨架依据证据重建。复制件是什么材料，与它的形状依据来自哪里，是两个问题。” [F013–F014, F055, F057]
- **正文提纲**：①清理、保存和记录后才谈比较复原；②头骨、脊柱、骨盆与肢体的对位，爆炸图不当出土图；③完整视图→隐藏推定部分→仅直接依据；④该虚构直接依据头骨显示为复制件，仍有原骨形状依据；⑤模块计数不能换成骨数完整率，不给皮色或叫声。两个手指、三主承重趾约束真实类别，不能推广所有恐龙。[F013–F016, F055–F057, DS01, DS03]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 05.1 | 章基线；sim whole；C skeleton-side | Ivory marks direct records, blue-grey comparison and grey inferred parts. These twelve teaching modules are invented, not twelve bones or a museum inventory. | 象牙色表示直接记录，蓝灰表示比较，灰色表示推定。这十二个教学模块是虚构的，不是十二块骨，也不是馆藏清单。 | DS01, DS03 |
| 05.2 | view exploded；explode .35；sim whole；lab sk-skull, sk-trunk, sk-pelvis, sk-arm-l, sk-leg-l | Separating the modules makes their connections easier to see. The arrangement explains anatomy; it is not a map of where the bones were found. | 把模块稍稍拆开，可以看清相互位置。这个排法解释身体结构，并不是骨头出土位置的记录。 | F013, DS01 |
| 05.3 | view assembled；explode0；sim supported；lab sk-neck, sk-ribs, sk-arm-r | The inferred tail modules disappear. The comparison-based modules remain: they represent evidence from other bones or corresponding body parts. | 推定的两个尾部模块隐藏了。依据比较的部分仍在，表示参考其他骨件或相对应的身体部分。 | F013, F055, DS03 |
| 05.4 | view assembled；sim direct；lab sk-skull, sk-jaw, sk-pelvis | Only directly evidenced modules remain in this invented example. The skull represents a cast of a documented original, so a replica can still carry direct shape evidence. | 在这个虚构例子中，只留下有直接依据的模块。头骨代表已记录原件的复制件，所以复制件也可以保留直接的形状证据。 | F055, F057, DS03 |
| 05.5 | sim whole；view assembled；camera手部近景；lab sk-arm-l, sk-arm-r；不隐藏其他件 | Both hands return, each with two functional fingers in this Tyrannosaurus teaching reconstruction. The complete picture combines several kinds of evidence; it does not mean every part was found together. | 两只手重新显示；这个霸王龙教学复原的每只手有两个功能性手指。完整画面结合了几种依据，并不表示所有部分都一起被发现。 | F014–F015, F055, DS03 |

- **T2 复原依据**：vary=evidence-view；keep同一套12个教学模块；observe=direct-count, comparison-count, inferred-count, visible-count；record:true。静态库存7/3/2，显示数12/10/7；卡正文不写“完整度百分比”。已知原件的复制仍属direct，比较依据复制与推定补塑分开。[DS03]
- **图**：`fossils-and-skeletons-rebuilding-a-skeleton.png`在第一段后；未标材料类别的这张图只说明整体结构，不能充当本章颜色分配的证据，也不是具名展品。[F014, DS03]
- **细看**：`Cleaning and conserving / 清理与保存`（F056）；`Evidence and display material / 形状依据与展示材料`（F055、F057，完整二维表）；`What the skeleton does not tell us / 骨架没有单独告诉我们的事`（F014，精确皮色 / 叫声不添加）。
- **本章索引**：sk-skull, sk-jaw, sk-neck, sk-trunk, sk-ribs, sk-pelvis, sk-arm-l, sk-arm-r, sk-leg-l, sk-leg-r, sk-tail-base, sk-tail-tip。12项为必要例外：必须能查阅每个证据模块，不能为10项建议删除两个；默认列表顺序按解剖顺序，隐藏项有通向whole拍的可见路径。
- **首现词**：cast, comparison-evidence；reconstruction在00首现，本章不重复包Term。

### 2.7 第06章 `birds-are-dinosaurs`

- **summary** EN “Birds are living theropod dinosaurs. A Javan myna in Singapore is a local example of this surviving branch.” / ZH “鸟类是活着的兽脚类恐龙。新加坡的爪哇八哥就是这个现存分支的本地例子。” [F017 + F035，合并推论]
- **正文提纲**：①从活鸟进入嵌套分类，bird在theropod里，theropod在dinosaur里；②翼与羽毛作大部位观察，不用一个相似特征代替亲缘研究；③始祖鸟的羽毛与叉骨结合其他特征提供化石比较，不能说它是所有鸟的已证直接祖先；④约66Ma非鸟恐龙灭绝，一些鸟分支幸存，去兄弟看环境 / 地图；⑤就近安静观察八哥，活动建议不设成绩。[F017–F019, F035]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 06.1 | 章基线；C bird-close；lab myna-body | This teaching bird represents a Javan myna, a species found in Singapore. Because birds belong within theropod dinosaurs, it is a living dinosaur too. | 这只教学模型代表新加坡能见到的爪哇八哥。鸟类在演化分类中属于兽脚类恐龙，因此它也是活着的恐龙。 | F017 + F035（合并推论） |
| 06.2 | C bird-close；lab myna-wing, myna-leg；highlight signal myna-wing | The wing is a bird's forelimb. The body has changed through evolution, while its place within the dinosaur branch remains; this is not a Tyrannosaurus turning into a myna. | 翼是鸟的前肢。身体在演化中发生了变化，但它仍属于恐龙分支；这不是“霸王龙变成八哥”的过程图。 | F017–F018 |
| 06.3 | camera羽毛近景；lab myna-feather；其他H按章 | The enlarged feather is a modern-bird comparison model. Fossils such as Archaeopteryx preserve combinations of features that help scientists study early birds. | 放大的羽毛是现生鸟类的比较模型。始祖鸟等化石保存的特征组合，帮助科学家研究早期鸟类。 | F014, F018, DS01 |
| 06.4 | C bird-close；lab myna-body, myna-wing | About sixty-six million years ago, non-avian dinosaurs became extinct. Some bird lineages survived; the map topic follows the larger event. | 大约六千六百万年前，非鸟恐龙灭绝了，一些鸟类支系存活下来。地图主题继续讲那场更大的事件。 | F019；链兄弟 |

- **试一试**：无模型卡。正文活动“观察一只附近的鸟，描述身体部分；亲缘关系要结合来源，不能只凭这次观察判定”。不追赶、不喂食为建议，不写成本课法律要求。
- **细看**：`Nested groups / 一层套一层的分支`（F017；三行文字嵌套，非未经清查的分支年代图）；`Archaeopteryx is not a universal ancestor label / 始祖鸟不等于所有鸟的直接祖先`（F018）；`A Singapore bird / 新加坡的鸟`（F035：只采用本地出现，不加入引入年代）。
- **本章索引**：myna-body, myna-wing, myna-leg, myna-feather。
- **首现词**：theropod。Archaeopteryx只解释专名，不扩大16词核心表。

### 2.8 第07章 `singapore-skeletons`

- **summary** EN “Prince, Apollonia and Twinky are diplodocid sauropod fossils displayed in Singapore. Their discovery site was in Wyoming's Jurassic Morrison Formation.” / ZH “Prince、Apollonia 和 Twinky 是在新加坡展出的梁龙科蜥脚类化石，发现于怀俄明州侏罗纪的莫里森组。” [F026–F028]
- **正文提纲**：①现行名字与科级分类；②发现地 Dana Quarry / Wyoming / Morrison，与展出地 LKCNHM 分开；③馆方完整率仅在细看归因，两具有头骨不可套到教学十二模块；④关联不等于已证亲子；⑤回看证据与复原，地图看两地。[F026–F028, F030, F048, DS03]

| 拍 | 舞台变化 | 字幕 EN | 字幕 ZH | 证据 |
|---|---|---|---|---|
| 07.1 | 章基线；C museum-close；lab prince-study, apollonia-study, twinky-study | Prince, Apollonia and Twinky are the current names of the museum's three diplodocid sauropod fossils. These small models are generic studies, not measured copies of the mounts. | Prince、Apollonia 和 Twinky 是馆内三具梁龙科蜥脚类化石的现行名字。这里的小模型是通用示意，不是展台骨架的测量复制。 | F026–F028, DS01 |
| 07.2 | C museum-close；highlight signal apollonia-study；lab apollonia-study | Their discovery site was Dana Quarry in Wyoming, in the Jurassic Morrison Formation. Display in Singapore and discovery in Wyoming are different parts of their history. | 它们发现于怀俄明州 Dana Quarry 的侏罗纪莫里森组。在新加坡展出与在怀俄明州出土，是两段不同的经历。 | F027, F048 |
| 07.3 | camera近Prince与Twinky；lab prince-study, twinky-study；不改各自几何 | The museum describes the three fossils as unusually complete, with two skulls. We do not have a bone-by-bone inventory, so these teaching models do not mark which mounted parts are original. | 馆方介绍这三具化石保存得相当完整，其中两具有头骨。我们没有逐骨清单，因此教学模型不标出展台上哪些部分是原件。 | F026, F028, DS01 |
| 07.4 | C museum-close；lab prince-study, apollonia-study, twinky-study | Being found together does not prove a parent-and-child family. The lesson ends by keeping the evidence, the reconstruction and the unanswered questions separate. | 一起发现并不能证明它们是父母与孩子。回看这组骨架，要把证据、复原和仍未回答的问题分开。 | F014, F030 |

- **试一试**：无模型卡。展馆观察建议：阅读展签，分别找“名字、发现地、展示材料、未定问题”；不让读者靠颜色猜真骨。
- **细看**：`What over eighty per cent means here / 这里的“超过八成”`（F026：逐字以自己的话归于馆方概括，不分配给每具、不假设按骨量或骨数计算）；`Names and identification / 名字与鉴定`（F027–F028：昵称不是种名；不讲旧 Apollo 或性别）；`Discovery place and display place / 发现地与展出地`（F027、F048，链兄弟；不在本主题画随手世界地图）。
- **本章索引**：prince-study, apollonia-study, twinky-study。
- **首现词**：diplodocid；Morrison Formation / 莫里森组为具名地层，正文现场解释，不说可通用于所有恐龙。

## 3. 对象、数据与现有能力配置

### 3.0 自描述设计来源与完整算例（S90，design:true）

**DS01 模型范围**：五组研究、33 个可选零件，另 1 个 context 底台。都为示意；未获取逐骨扫描或馆藏审计，不对应个体。十二个教学骨架模块包含复杂多骨部分，不能将模块数称为骨数。画面中的生物计数只约束 F015–F016，不宣称全部椎骨、肋骨和牙齿精确。

**DS02 年代算例**：Ma 为距今百万年，数越大越老。下灰层中心年龄 `L`，上灰层 `U`；前提为正立层序、原生灰层、化石未再搬运，且模型把相关矿物结晶时间视为该次沉积的约束。[F009–F011] 设计数据满足 `L > U > 0`。中心值夹定为 `[U, L]`，宽度 `L − U`。误差只是设计的有界区间半宽 `eU, eL`；保守外包范围 `[max(0, U − eU), L + eL]`。**这不是概率分布、95% 置信区间或真实地层测年结果**，也不是在断言真实测年误差有严格有限界。没有 `mean-age` 输出。

| 算例 id | 下灰层 L ± eL（Ma，SIM） | 上灰层 U ± eU（Ma，SIM） | 中心夹定（年轻→古老） | 宽度 | 设计误差外包范围 |
|---|---|---|---|---|---|
| `wide` | 150.00 ± 0.20 | 148.00 ± 0.20 | 148.00–150.00 | 2.00 | 147.80–150.20 |
| `close` | 149.40 ± 0.10 | 148.60 ± 0.10 | 148.60–149.40 | 0.80 | 148.50–149.50 |
| `precise` | 150.00 ± 0.05 | 148.00 ± 0.05 | 148.00–150.00 | 2.00 | 147.95–150.05 |

较小的单个灰层误差不会自动缩小两中心年龄之间的沉积间隔；较近的一对灰层给较窄的中心夹定。三个剖块几何相同，避免以岩层厚度暗示时间。[F009–F011, DS02]

**DS03 复原算例**：7 个模块有“该虚构个体直接记录”；3 个依据比较（另一个体 / 对侧对应）；2 个推定补足。它们是虚构的证据示范，非 SUE、Prince、Apollonia、Twinky 的清单。`whole` 显示 12；`supported` 显示 10；`direct` 显示 7。证据库存计数永远 7 / 3 / 2，不随显示改变。不能据此报告“58.3% 完整”。[F013–F014, F055–F057, DS03]

**DS04 视觉时间**：不模拟百万年经过的秒数，不给地下水速度、置换速率或埋藏成功率。镜头过渡、隐藏动画沿引擎既有时长；这些仅为交互时间。矿物小块被放大，没有微米尺度或真实晶体类型断言。[F005–F006, DS04]

施工 `sources.json` 的 S90 必须 `design: true`；说明全文要包含本节算例与假设，所有 SIM 表行引 S90。S90 的 EN / ZH text 与 note 都须写全这些值、假设、算式和“非实测”，可参考准备资料，但本规格是唯一施工真值。自然事实来源不得被“设计研究”替代。

### 3.1 五分区与坐标

坐标为**模型布局单位**，Y 上、+Z 朝观者。下面零件表、镜头表中的数都是各组的原始作者坐标；不是标本米数。**定稿改为共用一个展示体积**，不把五组研究沿 X 排开。章拍只开当前研究，其余开关沿原生 layers / hide。骨架、地层、活鸟没有统一实长比例。

| 分区 | group id | EN / ZH | 原始局部包络 x / y / z | token / 右上卡 |
|---|---|---|---|---|
| 01 | `specimens` | Fossil evidence / 化石证据 | ±2 / 0–2 / ±1 | `token:ink-2`；`card:false` |
| 02 | `burial` | Burial and minerals / 埋藏与矿物 | ±1.5 / 0–2.2 / ±1 | `token:neutral`；`card:false` |
| 03 | `age-section` | Layers and ages / 地层与年龄 | ±1.5 / 0–2.2 / ±1 | `token:ink-2`；`card:false` |
| 04 | `skeleton` | Rebuilding / 骨架复原 | ±4 / 0–3 / ±0.9 | `token:bone`；唯一进链路卡 |
| 05 | `living-museum` | Living birds and museum / 活鸟与馆藏 | 鸟与馆藏各自独立归中 | `token:neutral`；`card:false` |

**施工时在内容生成器烘焙一个固定仿射变换，不加运行时状态**：按 specimens、burial、age-section、skeleton、myna-*、三件 *-study 这六套几何各求原始静止非 context AABB，中心 c、半宽高深 h。统一目标中心 C=[0,2,0]、包络半尺寸 H=[4,2,1.4]；取正比例 k=min(4/hx,2/hy,1.4/hz)，零半尺寸项忽略。每套采用 T(v)=C+k(v−c)，保持形状比例；不是强行拉成长方体。同套所有 primitive / extra 的 at、sweep / tube 局部路径、半径 / 厚度 / size、explode.dist，以及对应镜头 position / target 都须一致换算。方向、欧拉角、FOV 不变。用原始数据计算一次，不能反复归一化已经变换过的数据。最终几何直接写进 parts.json，不写未经支持的 group transform 字段。

这解决实际代码的边界：`SceneRoot.tsx` 的 stageBounds / sphere 看所有零件，`CameraRig.tsx` 无 cover 时按这个全局球 fit，**并不按当前图层重新求球**。共用体积使 H 仍框住当前研究，允许不同轮廓周围留白，不声称自动精确 fit 当前可见件；hero-clean 以 05 骨架章为主，另检查其余章无空画面。`views.reference:{fit:"layers"}` 已存在，可让 REF. 按当前层 / hide 取景；不扩展 H 行为。原生 LAYERS 可自由叠开多个教学对象；重叠时回到当前章第一拍重置，不赋予叠加科学含义。

不设 `units` 或组 `scale`；note 明说示意比例，PLATE 的 U 只表示布局单位。地层为原创示意，不是采石场实测柱状图。context 底台保留 1 个最终场景 `bevelBox`：size:[9,0.12,3]、at:[0,-0.10,0]，不参与六套几何 AABB、不编号、不入索引、不投影。它不是馆藏底座的复制。

### 3.2 Tier-1 与几何边界

- 骨架：一个中空头骨及下颌、连续颈躯轴与骨盆、两短前肢各两个功能手指、两后肢各三个主要承重趾，长尾抬离台面。牙、椎、肋计数没有数据，不标数字；低密度结构只保证可辨轮廓，不称精准骨学复原。[F013–F016, DS01]
- 地层：水平接触、骨完整位于中层；切开孔隙放大件能看出外壁与内部空隙，矿物填空不替换整个外形。出露用移开覆盖层，不演示“骨自己浮上来”。[F005–F009, DS04]
- 标本板：足迹是真正的凹轮廓（`extrude.holes` 的上片 + 下底板），不是浮在平板上的实体脚；叶印痕为浅负形，不加碳膜；二者形状都不鉴定到物种。[F003, F053–F054]
- 鸟：爪哇八哥外观只作本地鸟示意；翼对应前肢，羽毛模型与骨架不同尺度，不能以并排相似形直接证明亲缘。嵌套关系靠正文解释与已有研究。[F017–F018, F035]
- 馆藏：三件 generic sauropod study，不用霸王龙模型换名字冒充。小头、长颈、四足与长尾只作“蜥脚类示意”，不画逐标本恢复率、精确比例或姿态；具名介绍在详情文字。[F026–F028, F030, DS01]

优先 `sweep` 变径骨干、`extrude` 中空侧壁、`tube` 弧形肋、合并的 `extra`；没有逐骨真实网格。不能用生成 PNG 当 morphometric ground truth。若某复杂部位不能原创示意得准确，保留简化的开放骨性轮廓和声明；后续精细网格另查逐文件许可与来源，不放宽许可红线。[DS01]

### 3.3 零件总表（33 selectable + 1 context）

`at` 以下为原始局部中心，落地按 §3.1 对整套几何、尺寸与镜头一并变换。所有 name / summary / detail 为 EN+ZH；表的说明是文案要点。`connects` 只表达同站结构邻接，不能把地下水、活鸟、博物馆画成同一物体的装配链。未写 dist 的零件 `dist:0`；材质族只用既有 `abrasive / tissue / powder` 与 `token:bone` 配色，不添加新族。`token:bone` 是色，不是“模型是真化石”的证据。

| id · 名称 EN / ZH | 组 | primitive / 主要结构；局部 at | summary / detail 要点与事实 | shell / explode |
|---|---|---|---|---|
| `bone-sample` Bone / 骨化石 | specimens | sweep 两端扩张骨干；[-1.1,0.7,0] | 保留身体部分形体；形状不能给精确岁数。[F003, F011] | — |
| `track-slab` Footprint / 足迹板 | specimens | extrude 有足迹孔的上层 + 底片；[0,0.3,0] | 记录活动，不是脚骨；原创三主趾示意，不定制作者物种。[F003, F014] | — |
| `leaf-slab` Leaf imprint / 叶印痕板 | specimens | extrude 浅叶形负片+底；[1.1,0.3,0] | 记录叶形，不保留有机质的这一例；叶来自身体。[F053–F054] | — |
| `leaf-lid` Upper slab / 覆盖片 | specimens | bevelBox；[1.1,0.5,0] | 移开后露出印痕；上下两片为示意，不称实物配对标本。[F053, DS01] | shell；[0,1,0] · 0.7 |
| `sediment-low` Lower sediment / 下部沉积 | burial | bevelBox [2.8,0.6,1.6]；[0,0.3,0] | 作为先沉积的层，平整接触。[F009] | — |
| `sediment-mid` Bone-bearing sediment / 含骨沉积 | burial | 两侧薄壳+底，不用填实骨所在空间；[0,0.95,0] | 围住骨，X-RAY 才能看见内部；不保证保存。[F004] | shell |
| `sediment-high` Covering sediment / 覆盖沉积 | burial | bevelBox；[0,1.65,0] | 移去表示覆盖物被侵蚀后的观察结果。[F008] | shell；[0,1,0] · 1 |
| `buried-bone` Buried bone / 埋藏骨 | burial | sweep+extra骨端；[0,0.95,0.25] | 埋藏的一个身体部分；无复制的第二根骨。[F004–F005] | — |
| `pore-shell` Bone pores / 骨的孔隙 | burial | 侧开 sweep + 6 个不等空隙的 extrude；[0,1,0.6] | 放大观察孔隙；与整骨互斥显示，不是第二根骨。[F005, DS04] | clip true |
| `pore-minerals` Pore minerals / 孔隙矿物 | burial | extra 小块烘焙；[0,1,0.6] | 小块填充空隙，未替换外壁；未指定晶种。[F005–F006, DS04] | — |
| `ash-low` Lower ash / 下方灰层 | age-section | bevelBox [2.8,0.15,1.6]；[0,0.3,0] | 下方已测年灰层，较老；颜色不等于岩性鉴定。[F009–F011, DS02] | — |
| `fossil-bed` Fossil bed / 含化石层 | age-section | 开口沉积壳 + 一根嵌入骨的 extra；[0,0.95,0] | 化石在两灰层间，年龄只被夹定。[F011] | shell |
| `ash-high` Upper ash / 上方灰层 | age-section | bevelBox 同厚；[0,1.6,0] | 上方较年轻；厚度并不决定岁数。[F009–F011, DS02] | — |
| `dated-crystal` Dated mineral / 测年矿物 | age-section | 原创多面体 extrude；[1.1,1.9,0.5] | 时钟读的是相关矿物，不是直接碳十四测恐龙骨。[F010–F012] | clip false |
| `sk-skull` Skull / 头骨 | skeleton | 两侧 extrude 孔洞+横向桥；[-3.1,2.4,0] | 保留头骨形体；教学直接依据 / 展示复制。[F013, F055, DS03] | [-1,0.4,0] · .5 |
| `sk-jaw` Jaw / 下颌 | skeleton | 两侧 sweep；[-3.1,2.05,0] | 与头骨对应；教学直接依据 / 原件。[F013, DS03] | [0,-1,0] · .35 |
| `sk-neck` Neck / 颈部模块 | skeleton | 多段 sweep；[-2,2.1,0] | 教学比较依据 / 另一标本的复制；不标椎数。[F013, F055, DS03] | [-1,.5,0] · .4 |
| `sk-trunk` Trunk / 躯干轴 | skeleton | sweep+extra；[-.5,1.95,0] | 教学直接依据 / 原件；连接骨盆。[F013, DS03] | [0,.6,0] · .4 |
| `sk-ribs` Ribs / 肋部模块 | skeleton | tube 弧列合并；[-.6,1.65,0] | 教学比较依据 / 补塑；无真实肋骨计数。[F013, F055, DS03] | [0,0,1] · .5 |
| `sk-pelvis` Pelvis / 骨盆 | skeleton | extrude 孔形+extra；[.5,1.6,0] | 教学直接依据 / 原件；后肢邻接。[F013, DS03] | [0,.5,0] · .3 |
| `sk-arm-l` Left forelimb / 左前肢 | skeleton | sweep+两条指骨形 extra；[-1.3,1.4,.45] | 教学直接依据 / 原件；两个功能指。[F015, DS03] | [0,0,1] · .45 |
| `sk-arm-r` Right forelimb / 右前肢 | skeleton | 左形镜像但独立 id；[-1.3,1.4,-.45] | 教学比较依据 / 对侧对应补塑；不是新发现的另一只手。[F013, F015, F055, DS03] | [0,0,-1] · .45 |
| `sk-leg-l` Left hindlimb / 左后肢 | skeleton | sweep腿+足部 extra；[.5,.8,.5] | 教学直接依据 / 原件；三个主承重趾。[F016, DS03] | [0,0,1] · .5 |
| `sk-leg-r` Right hindlimb / 右后肢 | skeleton | 显式镜像独立 id；[.5,.8,-.5] | 教学直接依据 / 原件；不把小抬趾画成承重趾。[F016, DS03] | [0,0,-1] · .5 |
| `sk-tail-base` Tail base / 尾基模块 | skeleton | sweep；[1.6,1.5,0] | 教学推定 / 补塑；完整轮廓不代表完整发现。[F014, F055, DS03] | [1,0,0] · .45 |
| `sk-tail-tip` Tail tip / 尾端模块 | skeleton | 锥缩 sweep；[3,1.35,0] | 教学推定 / 补塑；无尾椎计数。[F014, DS03] | [1,0,0] · .7 |
| `myna-body` Myna / 八哥 | living-museum | 扁球+原创喙尾 sweep；[-1.7,1,0] | 新加坡活鸟例子；不是霸王龙直接后代的演变动画。[F017, F035] | — |
| `myna-wing` Wing / 翼 | living-museum | 薄 extrude+羽片；[-1.65,1,.2] | 鸟的前肢；比较只标大部位，不造精细八哥骨学数据。[F017–F018] | — |
| `myna-leg` Bird hindlimbs / 鸟的后肢 | living-museum | 显式两腿 sweep；[-1.7,.5,0] | 活鸟外形定位；不是足迹生产者鉴定。[F017, F035, DS01] | — |
| `myna-feather` Feather / 羽毛比较件 | living-museum | 薄翼形 extrude + 羽轴 tube；[-.5,1.2,.5] | 鸟羽与化石羽证据在文字比较；不称此件是化石。[F014, F018] | — |
| `prince-study` Prince study / Prince 示意 | living-museum | generic sauropod sweep + 四足 extra；[.5,1,0] | 当前名、梁龙科；不赋种名与性别。[F026–F028, DS01] | — |
| `apollonia-study` Apollonia study / Apollonia 示意 | living-museum | 独立 generic sauropod；[1.7,1,0] | 当前名 Apollonia；不讲旧名。[F027–F028, DS01] | — |
| `twinky-study` Twinky study / Twinky 示意 | living-museum | 独立 generic sauropod；[2.7,1,0] | 三者一起出现不是亲子关系证据；不按实物尺寸缩放。[F027–F028, F030, DS01] | — |
| `study-plinth` Study platform / 示意底台 | context | bevelBox，宽按当前构图克制裁取 | 无科学身份，不可选、不入索引 | context true；不投影 |

`bone` 不是现行材质族：骨色几何用 `color: "token:bone"` 或现有哑光族 + `tint: "token:bone"`，不发明 `color: "bone"`。岩石用既有 `abrasive`，各层用 `token:neutral / ink-2` tint；背景与线读主题 token，不写新颜色常量。图像 greyscale 与 3D 低饱和功能色的规则分别适用。

### 3.4 十二模块证据与材料（独立轴，DS03）

| 形状依据 | 模块 | 在虚构示例中的展示材料 | 数量 |
|---|---|---|---|
| 直接记录 `direct` | sk-skull, sk-jaw, sk-trunk, sk-pelvis, sk-arm-l, sk-leg-l, sk-leg-r | skull 为该已记录原件的复制；其余代表原件 | 7 |
| 比较依据 `comparison` | sk-neck, sk-ribs, sk-arm-r | neck 为其他标本的复制；ribs / arm-r 为有比较依据的补塑 | 3 |
| 推定 `inferred` | sk-tail-base, sk-tail-tip | 示意补塑 | 2 |

颜色只表形状依据：direct `token:bone`、comparison `token:cold`、inferred `token:neutral`；选择高亮仍是 signal。每个 detail 开头明确“虚构教学例”，两行写“形状依据 / 展示材料”；短名带“直接 / 比较 / 推定”，灰度下靠文字与可逐组隐藏的轮廓缺口识别。不用闪烁、透明度或粗糙度宣称可靠程度。颜色不表示自然化石颜色，也不把复制排除出直接证据。[F014, F055, F057, DS03]

### 3.5 连接、动画与预算

- `connects` 只为骨架：sk-skull→sk-jaw、sk-neck；sk-neck→sk-trunk；sk-trunk→sk-ribs、sk-pelvis、sk-arm-l、sk-arm-r；sk-pelvis→sk-leg-l、sk-leg-r、sk-tail-base；sk-tail-base→sk-tail-tip。仅为邻接示意，不表示每个模块只有一块骨。[F013, DS01]
- `flows: []`、`animations: []`，全章 `run:false`。地下水不做循环粒子：本主题没有可核流量或模拟时间。埋藏、孔隙填充、覆盖层移开用离散拍的 hide / xray 切换。[F005–F008, DS04]
- 章拍采用视图 assembled；地层用 X-RAY，孔隙可 CUTAWAY；骨架章拍只用 assembled / exploded，避免把 X-RAY 当“证据变弱”。整体 explode 不代表真实挖掘位形。[DS01, DS03]
- 一个材质的 extra 烘焙合并；骨架12模块不逐骨开 draw call。目标静止 <50 calls；最复杂 exploded <60，软上限100；<0.3M triangles、硬上限1.5M；首屏JS≤300KB gzip；无GLB。不可为追求肋骨 / 椎骨“数量”突破预算或编造细节。[DS01]

### 3.6 参考核验计划（本轮不下载未清理的媒体）

| ref id | 发布页 / 父资源 | 施工时核对什么 | 许可与处理 |
|---|---|---|---|
| R1 | S9 AMNH T. rex问答 + S48 Beyond T. rex | 两功能指、三主要承重趾；正文计数与模型 / 插图一致。[F015–F016] | 事实咨询；不复制该页插画，不把网页授权扩大成媒体许可 |
| R2 | S4 NPS矿物充填与置换 | 孔隙充填 / 原物质替代的区别。[F005–F006] | 只作原理对照；图内第三方条目先看credit，未清理不下载 |
| R3 | S54 NPS印痕与压型 | 浅负形、是否保留有机质、细粒保存细节。[F053–F054] | 原创generic叶负形，不沿版权照片描摹或取纹理 |
| R4 | S55 Field Museum + S56 Smithsonian FossiLab | 翻模、补塑、原件保存、材料与形状依据的两轴。[F055–F057] | 原文事实咨询；照片不捆绑；不套用它们的个体完整率 |
| R5 | S17 LKCNHM gallery + S57 馆方访谈完整原文 | 名字、family-level、发现地与展出地。[F026–F028, F030] | 无开放图片许可；仅文字事实，不做三具逐骨描摹 |
| R6 | S23 NParks爪哇八哥页 + S10早期鸟类 | 本地鸟身份、鸟类 / 化石比较的内容边界。[F017–F018, F035] | 鸟为原创示意，不贴照片或猜身体长度 |
| R7 | 本主题 planned 三幅 PNG与manifest / image-qa | 构图、附肢计数、三沉积层 / 单骨、透明石墨风格 | 项目生成图可copy；只作插图与视觉约束，不作为测量参考 |

R2 的正侧 / 斜侧并排核验必须区分“来自可靠参考的解剖事实”和“原创示意几何”；不把工具生成图与自己模型相互比较就称为科学验证。所有尚未取得许可的照片均不下载，参考表没有伪造本地文件名。若需正式解剖图或扫描作为派生几何输入，另列开放许可、具体文件与署名后才用。[F014, DS01]

### 3.7 两张试一试：现有 table 数据契约

使用 `sim.kind: "table"`，原生 choice、数 / 状态输出、visible 绑定及内存记表。下面以及 §3.0 给出全部输入与输出；准备文件 `interaction-plan.json` 只可提取 `.sim`，不得将 meta、moduleEvidence、designStudySource、cards 等说明字段导入严格 schema。

| 层 | 字段 | 规则 |
|---|---|---|
| 顶层 | `sim.kind` | 固定 `table`，不是 `fossils` 新种类 |
| 控件 | `ash-case` | choice，选项 wide / close / precise，默认 wide；每个 label 与选项双语 |
| 控件 | `evidence-view` | choice，whole / supported / direct，默认 whole |
| 表 | `table.experiments.ash-bracket.keys` | 仅 `[ash-case]`；3行穷尽合法值；每行同9个数输出 |
| 表 | `table.experiments.skeleton-evidence.keys` | 仅 `[evidence-view]`；3行穷尽；每行4个数与2个state输出 |
| 行 | `when / set / source` | when恰好列keys；set不跨实验重复拥有输出；每行source `[S90]`，S90存在且design true |
| 数输出 | 9个年龄、4个计数 | 全 `tag:sim`，无 `from`；年龄单位Ma / decimals2，计数decimals0；有限数 |
| 状态输出 | comparison-visible / inferred-visible | kind state，states shown / hidden 各有 EN+ZH；不能用0/1假装未标注状态 |
| 绑定 | `output` + `part[]` + `visible` | comparison-visible→3比较模块，inferred-visible→2推定模块；`visible:{eq:shown}`；不控制7直接模块 |
| 输出显示 | `state.sim.try.observe` | T1恰好5项；T2恰好4项；原灰层年龄与误差以卡片说明 / 记表补充，不另开底条 |
| 记录 | `record:true` | 原生内存记表，同选项覆盖，不做不同单位混合柱状图 |
| URL / 键 | 原生sim、b与`[` `]` | URL往返保留控件；选项非法由现行resolve忽略并回合法默认；无重载请求 |

年龄输出：`ash-lower-age, ash-upper-age, ash-lower-error, ash-upper-error, bracket-young, bracket-old, bracket-width, envelope-young, envelope-old`。计数输出：`direct-count, comparison-count, inferred-count, visible-count`。实验不相乘成九行：分别3行，共6行；同一求值时两实验都计算，章只观察自己卡片。

```json
{
  "output": "comparison-visible",
  "part": ["sk-neck", "sk-ribs", "sk-arm-r"],
  "visible": { "eq": "shown" }
}
```

另一条同构绑定：`inferred-visible` → sk-tail-base / sk-tail-tip。直接依据的复制头骨保留在 `direct`，不能因是cast而隐藏。绑定不改变 detail 的真实分类。章节 layers / hide 仍优先：不在 skeleton 组的章不显示骨架，不能让 sim 绑定把关闭工位唤出。

控件与选项 label：`ash-case` Ash pair / 灰层对，wide = Wide interval / 较宽间隔，close = Closer beds / 年龄更近，precise = Smaller errors / 误差更小；`evidence-view` Evidence shown / 显示依据，whole = All modules / 全部模块，supported = Direct and comparison / 直接与比较，direct = Direct records only / 仅直接记录。后者是显示过滤器，不是可靠度评分。

数输出 label（单位 Ma，decimals:2，kind:number，tag:sim，无 from）：`ash-lower-age` Lower ash age / 下灰层年龄；`ash-upper-age` Upper ash age / 上灰层年龄；`ash-lower-error` Lower set error / 下灰层设定误差；`ash-upper-error` Upper set error / 上灰层设定误差；`bracket-young` Younger limit / 较年轻界限；`bracket-old` Older limit / 较古老界限；`bracket-width` Central bracket width / 中心夹定宽度；`envelope-young` Outer younger limit / 外包年轻界限；`envelope-old` Outer older limit / 外包古老界限。三个年龄行的九输出分别按 §3.0 的 L / U / eL / eU 与式子填写。

计数输出（unit 空，decimals:0，kind:number，tag:sim）：`direct-count` Direct modules / 直接模块；`comparison-count` Comparison modules / 比较模块；`inferred-count` Inferred modules / 推定模块；`visible-count` Visible modules / 可见模块。whole 行依次 7/3/2/12，supported 为 7/3/2/10，direct 为 7/3/2/7。状态输出 `comparison-visible` Comparison visibility / 比较部分显隐、`inferred-visible` Inferred visibility / 推定部分显隐；kind:state，不写 tag，states: shown = Shown / 显示、hidden = Hidden / 隐藏。三行依次 shown/shown、shown/hidden、hidden/hidden。共 15 输出，数输出 13、状态输出 2，每行 `source:["S90"]`。

原生试一试沿用引擎标题，不新增 `title` 字段。04、05 卡配置如下；卡内读数 label 已在上段列全，正文用 Ash age bracket / 灰层年龄夹定、Reconstruction evidence / 复原依据作相邻说明。keep 每项是原生双语对象，vary 是单个控件 id 字符串，不能写数组。

```json
{
  "vary": "ash-case",
  "keep": [
    {"en": "Upright, undisturbed layers", "zh": "正立、未扰动层序"},
    {"en": "Primary ash; fossil not reworked", "zh": "原生灰层；化石未再搬运"},
    {"en": "Invented bounded errors, not a confidence interval", "zh": "虚构有界误差，不是置信区间"}
  ],
  "observe": ["bracket-young", "bracket-old", "bracket-width", "envelope-young", "envelope-old"],
  "record": true
}
```

```json
{
  "vary": "evidence-view",
  "keep": [
    {"en": "Same twelve invented teaching modules", "zh": "同一套十二个虚构教学模块"},
    {"en": "Modules are not bones or a specimen inventory", "zh": "模块不是骨头，也不是标本清单"}
  ],
  "observe": ["direct-count", "comparison-count", "inferred-count", "visible-count"],
  "record": true
}
```

两卡不设 predict、chart、timeline，不造推测概率或年代直方图。上下灰层输入 / 误差完整三行表写在 04 正文，固定表不是依控件插值的动态模板。数值仅在现有卡和记录表出现，避免另开自制读数块。

### 3.8 章拍状态与可见访问路径

- 每章显式写 `view, explode, run, cutaway, layers, ghost, hide, labels, part, camera, sim.set`；没有试一试时不写 `try`。各拍 `sim.set` 覆盖本章，不承接上一拍；拍里 hide / labels 也重写完整需要列表。
- 表格里的镜头名只作 author shorthand：章 `state.camera` 展开为向量对象；拍 `camera` 可用预设名。`part:null` 是默认，选中详情让读者自行打开。
- 33个可选对象全部有功能summary；即使当章某拍隐藏，对应对象仍需可从本章索引找到。原生索引对隐藏对象的选择不会恢复可见性，施工须用“返回概览 / 看这一拍”明确可见路径，验收逐项检查，不虚构索引自动开层能力。
- 十二模块的文字为两段：第一段简述结构位置与作用，第二段写教学证据等级、展示材料、来源与限制。背景 note、05细看、T2 keep 三处都写“模块不是骨头、不是馆藏清单”。[F013–F014, F055–F057, DS03]

**索引访问的具体实现**：`ChapterIndex.tsx` 的按钮只 patch `{part:id}`，不动 layers / hide / sim / camera；不为本主题修改该行为。各章在正文最后、原生索引之前用普通本页查询链接列“Show on the model / 在模型中查看”。每个当章索引对象按下表路由生成 `?ch=<chapter>&b=<beat>&part=<id>`（XML 属性中的 & 写 `&amp;`）；使用当前语言路径，语言不重置。这样先跳到可见状态，再选中对象，详情仍在章头下。不用仅移镜头的 FlyTo 假装已经开层。

| 对象 | 明确可见路径 |
|---|---|
| bone-sample, track-slab | body-track-leaf，b=1 / b=2 |
| leaf-slab / leaf-lid | body-track-leaf，b=3 / b=1 |
| sediment-low, buried-bone | buried-to-exposed，b=1 |
| sediment-mid, sediment-high | buried-to-exposed，b=2 |
| pore-shell, pore-minerals | buried-to-exposed，b=4 |
| ash-low, fossil-bed, ash-high | ash-beds-and-ages，b=1 |
| dated-crystal | ash-beds-and-ages，b=2 |
| 所有 sk-* 模块 | rebuilding-evidence，b=1（whole；每条仍带自己的 part） |
| myna-body, myna-wing, myna-leg | birds-are-dinosaurs，b=1 |
| myna-feather | birds-are-dinosaurs，b=3 |
| prince-study, apollonia-study, twinky-study | singapore-skeletons，b=1 |

00 章跨工位的十个索引项也按这张表各给对应链接。05 从 direct 过滤状态选中隐藏尾部时，详情可以出现；“在模型中查看”链接回 b=1，使 whole 显示恢复，再选择尾模块。原生索引 12 项不删。上线逐项点按验证，不能只检查字符串引用合法。


### 3.9 HUD、镜头与模式

topic.yaml `note`：EN “Schematic fossil evidence studies. Not a museum specimen inventory. Ages marked SIM are invented examples; parts are not drawn to a shared scale.” / ZH “化石证据示意研究，并非馆藏标本清单。标 SIM 的年代为虚构算例；各部分不采用统一比例。” [DS01–DS04]

规格行 ≤4：MODEL / 模型 = Schematic / 示意（design）；EVIDENCE / 证据 = Body and activity / 身体与活动（typical，[F003]）；AGES / 年代 = Bracket, not one date / 年龄范围（design，[F011,DS02]）；MUSEUM / 馆藏 = Three diplodocids / 三具梁龙科标本（typical，[F026–F028]）。事实型说明用来源文字，不用无法核实的实长或骨数。

定稿不写 `telemetry`：年龄五读数与模块四读数各在原生试一试卡 / 记表中显示；避免其他章常驻五行无关年代标签。现有 PLATE 保留结构、状态、选中与 perf。已核 `scope:observe` 只把未观察数值变为 —，并不会隐藏整行，故不使用它假装按章收起。右上卡仅skeleton，短名 ≤14 EN字符，connects表达骨架邻接。其余组card false。底部只有原生章节轴；背景+7段、36刻度，不自动播放；阅读面板顺序照docs/08。

镜头均在 §3.1 的原始作者坐标中写 p / target t，施工用对应研究的 T 同时变换二者；fov34：

| id / label EN·ZH | 工位 | p；t | 用途 |
|---|---|---|---|
| `evidence-close` Evidence / 证据 | specimens | [4,3,6]；[0,.7,0] | 三件标本完整，不遮叶板 |
| `burial-close` Burial / 埋藏 | burial | [4,2.8,5]；[0,1,0] | 层面与骨横切 |
| `layers-close` Layers / 地层 | age-section | [4,2.6,5]；[0,1,0] | 两灰层及中层 |
| `skeleton-side` Skeleton / 骨架 | skeleton | [1,3,13]；[0,1.4,0] | 稍偏侧的完整轮廓 |
| `bird-close` Bird / 鸟 | living-museum | [-.5,2,5]；[-1.5,1,0] | 八哥与羽毛，关三具示意 |
| `museum-close` Museum / 馆藏 | living-museum | [4,3,7]；[1.6,1,0] | 三具示意，关鸟 |

章节特殊近景只写拍内camera对象，不增加第7个预设：骨孔特写 p[1.6,1.6,2.6] t[0,1,.5]；测年矿物p[2.8,2.8,3] t[1.1,1.9,.5]；手部p[-.7,1.9,3.7] t[-1.3,1.4,0]。三组特殊近景分别按 burial / age-section / skeleton 的 T 换算。定稿省略 `views.cover`；H 使用六套已归中的几何全局包围球，不能误写成随图层求球。05 骨架作为 hero-clean 主构图，其余章允许留白但不得框空。REF. 使用现有 `views.reference:{fit:"layers"}`。

CUTAWAY 标准面 normal:[0,0,-1]，offset 在最终场景坐标里按前后壳调至保留后半；pore-shell是可读对象，先用建模开口，再用clip确认不是切成空；labels锚点必须在保留侧。EXPLODED只讲结构对位，不能伪称出土姿态。全章无FLOW / ANIM；RUN无动画不应给误导的“正在化石化”字样。[DS01, DS04]

这些布局复用 `PlateBlock`、`Inspector`、`ChapterIndex`、`ChapterAxis`。阅读面板顺序固定章头 → 节拍行 → 试一试 → 选中详情 → 正文 → 本章索引；底部仅章拍轴，点拍不自动播放。MODE 列表沿现行引擎；本主题没有科学过程 RUN，若用户切 run，不会开始“化石生成计时”。不增加针对本主题的开关或 HUD 插槽。


### 3.10 文件、数据与许可家族

没有地图、GeoJSON、PBDB、PaleoDEM、古海岸或时序栅格输入，也没有 `data/INVENTORY.md`；地图数据集与地理关键帧 **不适用**，不借父目录的候选条目冒充已取得数据。这里的关键状态是 §2 的离散观察拍，不是地层演化实测关键帧。

| 施工输出 | 输入 / 处理 | 派生许可家族与署名 |
|---|---|---|
| `data/parts.json`（含 sim）及原创几何生成脚本 | 原创 primitive、S90 虚构值与计算；无扫描、照片描摹或第三方几何输入 | Atlas CC BY-NC-SA 4.0；S90 记全假设和计算 |
| `chapters/*.mdx`、`topic.yaml`、`glossary.json` | 本规格文字的双语自主释义；事实来源逐条保留 | Atlas CC BY-NC-SA 4.0；不声称重新许可来源网页 |
| `data/sources.json`、`SOURCES.md` | §6 的标题、链接、访问日期、定位、引用边界和自描述设计研究 | Atlas CC BY-NC-SA 4.0；保留来源责任与改写说明 |
| 三张 PNG 的发布 WebP / 缩略图及本主题截图 | 仅 §7 指定的本项目生成图和原创场景 | Atlas CC BY-NC-SA 4.0；保留 manifest 的父图重用链和生成性质 |

不采用第三方模型或图表，因而没有 BY-SA、ODbL、ODC-BY 的派生文件或新例外。施工在 `LICENSE-CONTENT` / `THIRD-PARTY-NOTICES.md` 确认本主题原创 NC-SA 家族及生成图来源；若后续改用外部资产，必须重新逐文件列输入、修改、署名与许可例外。允许的家族按 next-batch §三：PD / CC0 / CC BY / CC BY-SA / CC BY-NC-SA / ODbL / ODC-BY；受限或签协议资产不用，同一派生文件不混 CC BY-SA 与 CC BY-NC-SA。

## 4. 引擎现实核对：新增契约为空

2026-10-27 查实际 schema、求值、绑定、HUD、URL、测试与截图脚本后的结论：**保留 E 项 0 个，无 E-FS1 或其他新模型 / 字段**。准备稿本来也未列必要新增；父 dossier 的可选工作不能变成这次依赖。§3 是既有接口的内容配置，不是引擎扩展。

| 新增 E 编号 | 真正缺失能力 | schema / 校验 / 输出 / 绑定 / URL / API / 单测 / e2e / 预算 |
|---|---|---|
| 无 | 无 | 全部复用下表；不增加 schema、求解器、测试 API 或引擎夹具。主题验收见 §8。 |

| 曾被提及 / 易误列的新工作 | 核对到的现有实现 | 定稿处理 |
|---|---|---|
| 年代求解、误差图、新 fossil sim | `table-schema.ts` 的 tableIssues / tableSourceIssues；`lib/sim/table.ts` 的 solveTable；`sim-schema.ts` 已注册 table；`lib/sim/index.ts` 分实验求值 | 删除新增项；只用三行年龄表、五读数及静态输入说明表，不做随机衰变动画。 |
| 骨件证据专有字段、自动骨件拼装、按证据隐藏 | `sim-schema.ts` 的 choice / state / bind；`lib/sim/bind.ts` 的 visible 条件与 hidden 集合；`stages/model3d/PartNode.tsx` 接现有可见性 | 删除新增项；三行显示表 + 两条 visible 绑定，分类 / 材料写普通双语 detail。 |
| 化石负形 / 中空骨架几何 | `schema.ts` extrude.holes、sweep、extra、mirror；`stages/model3d/{geometry,shaped,organic}.ts`；`lib/sweep.ts` | 删除新增项；原创程序化负形与合并模块，不引入 GLB、骨学扫描或新 primitive。 |
| 层序步骤、埋藏、出露、工位切换 | `schema.ts` spaceBeat；`lib/beat-scene.ts`；`View.tsx` 章基线 + 拍 hide / layers / camera | 删除新增项；离散状态表示观察过程，不求解地质时间、地下水或保存概率。 |
| 章节对象索引、正文上方详情、第二条底部年龄轴 | `explorer/ChapterIndex.tsx`、`explorer/Inspector.tsx`、`hud/PlateBlock.tsx`、core `ChapterAxis`，与 docs/08 §2 一致 | 索引与详情已存在；年龄进原生试一试卡；隐藏件访问用 §3.8 普通链接，不增导航行为。 |
| 新共享状态 / 年代 URL / 测试 API | `index.ts`、`lib/sim/controls.ts` encodeSimParam / decodeSimParam；`View.tsx` test.sim / setSim / anchor；core URL state | 删除新增项；`ch,b,part,sim` 已能回放教学状态。没有地质时钟，所以不借 TimeScene 的 t=Ma。 |
| 自定义事实或表格校验器 | `scripts/validate-content.ts` 已调用 tableSourceIssues，`schema.ts` / sim-schema 已校验引用；`src/content/schema/sources.ts` 校验 S 号 | 删除新增项；地质条件和区间算术属主题数据断言，不加全局地质规则。 |
| 专用节拍截图 / 可见性读数 | `scripts/shoot.ts` 已跑 beat、beat-links、keys、layout；现有 `__atlas.engine.sim()`、`anchor()` 与 screenshot | 删除新增项；主题 e2e 显式检查计数、可见性与深链，不假设 shoot 自动理解化石证据语义。 |

S 号兼容已查 `src/content/schema/sources.ts` 的 `SOURCE_ID = /^S[1-9]\d*$/`：研究 S01–S09 在运行时去前导零，S10 以上保号，F id 不变；**不改正则**。本规格正文表已经使用运行时 S2–S9。`chainName` 已存在于 part schema，可给骨架链用双语短名；不沿用旧资料“没有短名字段”的限制。

## 5. 名词表 EN / ZH

新加坡中文科学词表未在父研究建立通用背书。下表“编辑用词”明确是本项目中文表达，不包装成MOE规定术语；父terms已核的中文用法继续可追溯。每词仅在全主题EN / ZH首次正文包`<Term>`，字幕不加组件。

| id | term EN / ZH | definition EN | 定义 ZH | 证据 / 用词状态 / see |
|---|---|---|---|---|
| `fossil` | Fossil / 化石 | Evidence of past life preserved in a geological setting. | 在地质环境中保存的过去生命证据。 | F003；本规格编辑用词；see body-fossil, trace-fossil |
| `reconstruction` | Reconstruction / 复原 | A model assembled from preserved evidence and stated comparisons or inferences. | 根据保存的证据、说明过的比较或推定，重建的模型。 | F013–F014；编辑释义；see comparison-evidence |
| `body-fossil` | Body fossil / 实体化石 | Evidence of an organism's body or a body part, including plants. | 生物身体或身体部分留下的证据，也包括植物。 | F003, F053–F054；本规格编辑用词；see fossil |
| `trace-fossil` | Trace fossil / 遗迹化石 | A preserved record of biological activity, such as a footprint. | 活动留下的地质记录，例如足迹。 | F003；本规格编辑用词；see body-fossil |
| `impression` | Impression / 印痕 | A shallow imprint without retained organic material. | 没有保留有机物质的浅表形体印记。 | F053；编辑简明词，不称SG规范译名；see body-fossil |
| `sediment` | Sediment / 沉积物 | Material deposited in layers around the evidence in this model. | 在本模型中围着遗存逐层沉积的物质。 | F004, F009；编辑释义；see stratum |
| `permineralisation` | Permineralisation / 矿物充填作用 | Minerals deposited in natural pores within remains. | 矿物沉积到遗存内部原有的孔隙中。 | F005；编辑暂用，未建立新加坡中文权威对照；see replacement |
| `replacement` | Mineral replacement / 矿物置换作用 | Minerals substitute for dissolved original material. | 原来的物质溶解后，由矿物替代。 | F005–F006；编辑暂用，未建立新加坡中文权威对照；see permineralisation |
| `stratum` | Stratum / 地层 | One layer in the sequence being examined. | 所观察层序中的一层。 | F009；本规格编辑用词；see relative-age |
| `relative-age` | Relative age / 相对年龄 | Whether a layer or fossil is older or younger than another, with geological conditions checked. | 在核对地质条件后，判断一层或化石比另一层或化石较老还是较新。 | F009；编辑词；see age-bracket |
| `radiometric-age` | Radiometric age / 放射性测年年龄 | A numerical estimate from a suitable isotope clock, with assumptions and uncertainty. | 利用合适同位素时钟得到、带有假设与误差的数值年龄。 | F010–F012；编辑简化，未核新加坡官方用词；see age-bracket |
| `age-bracket` | Age bracket / 年龄夹定范围 | Older and younger limits supplied by dated evidence around a fossil. | 化石周围的测年证据给出的较古老和较年轻界限。 | F011；编辑释义；see relative-age |
| `cast` | Museum cast / 博物馆复制件 | A made replica of a recorded fossil shape; distinguish it from a natural fossil cast. | 人工复制的化石形体；须与自然形成的铸型化石区别。 | F007, F055, F057；编辑释义；see reconstruction |
| `comparison-evidence` | Comparative evidence / 比较依据 | Other documented anatomy used to constrain the shape of missing parts. | 用其他已记录的解剖结构，约束缺失部分的形状。 | F013, F055；编辑词；see reconstruction |
| `theropod` | Theropod / 兽脚类 | The dinosaur group within which living birds are classified. | 现生鸟类在演化分类中所属的恐龙分支。 | F017；本规格编辑用词；see fossil |
| `diplodocid` | Diplodocid / 梁龙科恐龙 | The family-level sauropod grouping used for the Singapore trio in the adopted museum information. | 本课采用的馆方资料对新加坡三具蜥脚类标本所用的科级分类。 | F026–F028；编辑暂用，未建立新加坡中文权威对照；see reconstruction |

专名保留：*Tyrannosaurus rex* / 霸王龙（编辑用词）；*Archaeopteryx* / 始祖鸟（本规格编辑用词）；Javan myna / 爪哇八哥（本项目用词，首次附英文，非声称NParks提供中文名）；Prince、Apollonia、Twinky不在正文强译性别或家庭角色；Morrison Formation / 莫里森组、Dana Quarry / Dana采石场为编辑音译 / 说明。没有把这些翻译算作新增自然事实。

全表是 16 个核心条目；正文首次出现各包一次 `<Term>`，EN / ZH 分别处理。没有取得新加坡中文原始来源的条目一律注“编辑用词”，不以术语对照补充新的科学主张。

## 6. 来源 id 与引用实施

以下均于 **2026-10-27** 重新取得机构原发布页面；除明确标记的 S18 外为正文读取，不把搜索摘要当完整报告。每条 runtime source 的 text / note 都有 EN / ZH，写作者、机构、标题、原文定位、访问日期和采用范围。事实阅读不等于媒体再利用授权；网页图片均不进产物。

| runtime id（研究号） | 直达原发布来源 | 采用定位 / 边界 |
|---|---|---|
| S2（S02） | [US National Park Service · How Fossils Form](https://www.nps.gov/subjects/fossils/how-fossils-form.htm) | Introduction、Odds、Fossil Types |
| S3（S03） | [Natural History Museum, London · How are dinosaur fossils formed?](https://www.nhm.ac.uk/discover/how-are-fossils-formed.html) | Mould and cast fossils；Uplift, weathering and erosion |
| S4（S04） | [US National Park Service · Permineralization and Replacement](https://www.nps.gov/articles/000/permineralization-and-replacement.htm) | Introduction、Permineralization、Replacement |
| S5（S05） | [American Museum of Natural History · How do we know how long ago dinosaurs lived?](https://www.amnh.org/explore/videos/dinosaurs-and-fossils/how-do-we-know-how-long-ago-dinosaurs-lived) | 页面说明正文的相对时间、灰层矿物与母 / 子原子段 |
| S6（S06） | [US National Institute of Standards and Technology · How Do You Know the Age of Fossils and Other Old Things?](https://www.nist.gov/how-do-you-measure-it/how-do-you-know-age-fossils-and-other-old-things) | carbon-14 段；只用数万年量级，不采用具体半衰期 |
| S7（S07） | [Natural History Museum, London · Beyond Jurassic World: What we really know about dinosaurs and how](https://www.nhm.ac.uk/discover/what-can-scientists-learn-about-dinosaurs-and-how.html) | How palaeontologists learn about dinosaurs |
| S8（S08） | [American Museum of Natural History · Ask a Scientist About Dinosaurs](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-dinosaurs) | 问题 9 的鸟 / 兽脚类嵌套说明；不采用旧年代和鸟种数 |
| S9（S09） | [American Museum of Natural History · Ask a Scientist About T. rex](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-t-rex) | Arms and Fingers 的文字 transcript |
| S10（S10） | [Natural History Museum, London · What were the first birds like?](https://www.nhm.ac.uk/discover/what-were-the-first-birds-like.html) | Archaeopteryx 的羽毛、叉骨与其他特征段 |
| S11（S11） | [Natural History Museum, London · How an asteroid ended the age of the dinosaurs](https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html) | 开篇约 66 Ma 与 What survived 段；不搬其他比例、尺度或因果细节 |
| S17（S17） | [Lee Kong Chian Natural History Museum, NUS · Biodiversity Gallery](https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/) | Highlights: Dinosaurs，三具 / >80% / 两头骨 / 2007–2010 / Ten Sleep / believed |
| S23（S23） | [NParks Animal and Veterinary Service · Javan Mynas in Singapore](https://avs.nparks.gov.sg/wildlife/encountering-wildlife/house-crows-pigeons-javan-mynas/javan-mynas/) | Distribution & Habitat；只用本地出现。观察建议为编辑活动，不做法律解释 |
| S48（S48） | [American Museum of Natural History · Beyond T. rex](https://www.amnh.org/explore/ology/paleontology/beyond-t-rex) | Theropoda 的主要承重趾说明 |
| S54（S54） | [US National Park Service · Impressions and Compressions (including Carbonization)](https://www.nps.gov/articles/000/impressions-and-compressions.htm) | Definitions、Occurrence |
| S55（S55） | [Field Museum · Which Dinosaur Bones Are “Real”?](https://www.fieldmuseum.org/blog/which-dinosaur-bones-are-real) | Understanding fossils and casts；不用照片 |
| S56（S56） | [Smithsonian National Museum of Natural History · FossiLab](https://naturalhistory.si.edu/exhibits/david-h-koch-hall-fossils-deep-time/fossilab) | 开篇 preparation 与 FAQ 的复制、保存及材料说明 |
| S57（本规格新增来源） | [LKCNHM · Interview with an evolutionary paleobiologist: Dr Emanuel Tschopp](https://lkcnhm.nus.edu.sg/interview-with-an-evolutionary-paleobiologist-dr-emanuel-tschopp/) | 完整 HTML，Research work in LKCNHM；当前名字、地点与地层。只新增来源号，不新增 / 重排父 F 号。 |
| S58（本规格新增来源） | [Smithsonian Human Origins Program · Dating](https://humanorigins.si.edu/evidence/dating) | Tephrostratigraphy 的上下灰层夹定、Absolute Dating 的误差；只借通用方法，不把人类遗址年龄挪给恐龙。 |
| S59（本规格新增来源） | [Utah Geological Survey / Mark Milligan · Rock Dating](https://geology.utah.gov/map-pub/survey-notes/rock-dating/) | Relative Dating / Superposition 的水平沉积、未倒转前提与层序空缺；不沿用页面示例数值。 |
| S90 | Atlas fossil evidence design study / Atlas 化石证据设计研究 | `design:true`；text 写 §3.0 全部设计值、计算、非实测声明，note 写前提与限制；不设远程 URL。 |

S18 仅留审计记录：[LKCNHM Annual Report 2024–2025](https://lkcnhm.nus.edu.sg/wp-content/uploads/sites/11/2025/12/LKCNHM-AR-2024-2025-e-copy_rev.pdf)。本轮未读完整 PDF；indexed 段落可对照但不作为独立已验证来源，不进 runtime 引用。F027 的运行时引用改用 S57。S1 及其他空号不补占位来源，未采用来源不用进入 sources.json。

## 7. 图像（仅既有 planned 三图）

本轮已查看三图；哈希、尺寸、RGBA 与透明性记录沿用准备目录 image-qa.json / manifest，不冒充本轮重算。`tries:0`指本拆分新增生成次数；父代封面2次、两图各1次的记录保存在image-qa.json，不改写历史。风格为石墨、排线与点描、中性灰、透明背景、无字 / 数字 / 标签 / 箭头 / 底影 / 纸纹 / 画框；长轴约85%画布，较扁骨架允许高度少于85%。

| kind / file（art/planned/fossils-and-skeletons/） | 位置 / chapterIdea | alt EN / ZH | 学术限制 / 验查 |
|---|---|---|---|
| cover `fossils-and-skeletons.png`，1024×1024 | 首页；化石头骨证据 | Graphite study of a Tyrannosaurus fossil skull with its lower jaw, with hollow openings. / 石墨画的霸王龙化石头骨与下颌，孔洞中空。 | 一个头骨、一个下颌；眼眶无眼球；不宣称精确牙数或标本身份。[F014] |
| figure `fossils-and-skeletons-fossilisation.png`，1536×1152 | 02；孔隙矿物充填 | A bone shown within the middle of three continuous sediment beds, cut open to show pores and mineral filling. / 一根骨位于连续三层沉积的中层，剖开处显示孔隙与矿物充填。 | 正好三层、两接触面、单根骨、两扩张骨端；不是已测年灰层实测图。[F005, DS01] |
| figure `fossils-and-skeletons-rebuilding-a-skeleton.png`，1536×1152 | 05；重建骨架 | A complete-looking Tyrannosaurus teaching skeleton, with two short forelimbs and a raised tapering tail. / 看似完整的霸王龙教学骨架，有两条短前肢和抬起的渐细长尾。 | 两手各两功能指；两足各三主要承重趾与小抬趾；肋 / 椎 / 牙未计数；不是Prince等三具蜥脚类，也不是已发现完整个体。[F014–F016, F028] |

`manifest.jsonl`每行含slug、kind、file、chapterIdea、subject、checks、tries、reusedFrom。`reusedFrom`指向父完整路径；文件copy不move。图像元数据与哈希见image-qa.json。本轮不调用image_gen，也不对图进行任何编辑。

正式 caption：02 EN “A schematic bone section shows pore filling within sediment. It is not a dated quarry section.” / ZH “骨的示意剖面显示沉积层中的孔隙充填，不是已经测年的采石场剖面。” [F005, DS01]；05 EN “A teaching reconstruction of Tyrannosaurus rex. A complete image does not show how much of one individual was found.” / ZH “霸王龙教学复原；画面完整，不等于发现了一个完整个体。” [F014–F016, DS03]。图不编码本课 7/3/2 分配，不能当复制材料清单。

施工只从 `/Users/gavin/work/atlas/art/planned/fossils-and-skeletons/` 读三文件，用现有 `scripts/illustrate.ts` 输出本地发布资源与对应缩略图；不从父目录另选图，不使用图中牙、肋或椎的数量作事实。两套主题检查透明边缘、读图对比与 alt；不额外添加文字或编号到原图。

## 8. 施工顺序与验收

先按 §6 记录来源和 S90，再按 §3 建原创几何与六行表，写 05 章双语样章验证“直接依据的复制件”读法，再展开其余正文与 36 拍。参考核对 → 至少两轮 R2 结构比较 → R3 两主题材质灯光 → 章拍 / HUD / 事实检查。此规格不授权扩大到其他主题或更换插图。

### 8.1 数值、schema 与现有 API 验收

以下是施工必须得到的期望，不是本轮已跑过的测试报告。测试应验证学习含义与状态往返；不为文档或颜色选择写镜像实现的测试。

| 输入 / 操作 | 必须观察到 |
|---|---|
| ash-case=wide | bracket-young=148.00、bracket-old=150.00、width=2.00、envelope=147.80–150.20 Ma |
| ash-case=close | 148.60、149.40、0.80、148.50–149.50 Ma |
| ash-case=precise | 148.00、150.00、2.00、147.95–150.05 Ma；误差变小不改变两中心值之差 |
| evidence-view=whole / supported / direct | visible-count=12 / 10 / 7，库存始终 direct=7 / comparison=3 / inferred=2 |
| direct 状态 | 仅比较 / 推定的五模块隐藏；sk-skull 这个直接依据复制件仍可见，不根据展示材料删件 |
| direct → whole | 12 件恢复，标注与点击恢复；隐藏状态不能残留点击区域 |
| 两控件交叉 | 3×3 共九种可求值组合相互独立，但数据只写两个实验、共六行 |
| 删除行、重复 when、未知输出、错误状态 / 数种类、无 S90 / design:false | 既有 schema、tableIssues / tableSourceIssues 拒绝；不另写化石全局验证器 |
| 每个年龄行的主题数据断言 | L>U>0；误差≥0；U−eU≥0；U+eU<L−eL；各界限公式与表一致；不存在 mean-age 输出 |
| `?ch=ash-beds-and-ages&b=4` | ash-case=close 与该拍镜头、高亮、图层一致；切 EN/ZH、paper/cinema、刷新保持同一状态 |
| `?ch=rebuilding-evidence&b=4&sim=evidence-view.whole` | 显式 sim 覆盖第四拍 direct，显示 whole / 12；不能因拍应用晚一帧回到 direct |
| 05 direct → 00 → 05 | 章默认重置 whole；不继承上一章缺尾状态；两实验互不干扰 |
| 通过索引选隐藏件，再点 §3.8 对应链接 | 原生详情能显示；目标章拍确实露出并选中目标，无死链接 |

复用 API：`window.__atlas.engine.sim().values` / `.outputs` 读数，`.try` 读卡，`.table` 看原生记表；`engine.setSim({...})` 设合法值返回 true、非法值返回 false；`engine.anchor(id)` 读 shown / onScreen，结合截图与点击命中检查真实显隐。`sim().sources` **仅返回 typical 数输出来源**，本主题全是 SIM，不能断言它含 S90；S90 由构建期 tableSourceIssues 与来源弹层 / 内容审计确认。不新增 `partEvidence()`、visibleCount API、或每帧求解器。

使用既有测试工具给主题加必要的数据不变量与一组交互 e2e，覆盖 wide / precise、direct 保留复制头骨、URL 覆盖、章重置与索引可见路径。现有引擎负向校验已有测试，内容只核配置触发正确，不另建 sample-fossils 引擎夹具。

### 8.2 内容与画面逐项签收

- [ ] 背景 + 七正式章；拍数 4/5/5/4/5/5/4/4，合计 36。EN / ZH 字幕完整且事实 id 对应；每拍标签 ≤6、章近景 ≤3，各标签落屏；两卡都有 keep、SIM 和记录。
- [ ] 叶形为身体印痕，无碳膜；足迹是凹痕，不是悬空脚骨；孔隙与填充可分辨，矿物加入不替换整块骨壁。[F003–F008, F053–F054]
- [ ] 年龄卡保留前提、中心范围和设定误差；不把外包范围叫概率 / 置信区间，不提供中点“生日”。所有设计数带 SIM 或明确模型说明。[F009–F012, DS02]
- [ ] 手指 / 承重趾计数对；骨模块不等于骨头，7/3/2 与 12/10/7 一致；材料与依据两轴不混，灰度靠文字与缺口可读。[F015–F016, F055, DS03]
- [ ] 鸟属于恐龙分支，始祖鸟不被强定直接祖先；“八哥也是恐龙”明确合并推论。灭绝拍仅采用 F019 的克制措辞。[F017–F019, F035]
- [ ] 馆藏使用当前名、科级分类与美国发现地；80% 明确馆方概括，非逐个体审计或本课算法；不推断物种、性别或家庭角色。[F026–F028, F030, F048]
- [ ] 所有 33 可选零件有 EN/ZH name、summary、detail；context 不进索引。正文 / 拍提及对象全进当章索引，并逐项点查 §3.8 可见路径；05 的十二项完整保留。
- [ ] 每个正文数字有 Num、每个 detail 数字有来源、字幕与 UI 同数；删去 §0.3 cut 内容，无旧 Apollo、课纲强制学习或年代全表支线。来源 id 无前导零。
- [ ] HUD 按 docs/08 §2：唯一底部章拍轴、左 PLATE、详情在正文前；点第 2 拍不进演示，URL b=2；`,` / `.` 跨章翻拍。按钮 / 键同 store，手机触控目标≥44px，无 hover 必要操作。
- [ ] paper / cinema × EN / ZH 四组合；1920×1080 与 1600×900 章拍检查，390×844 手机抽屉 / 选中详情 / 两卡能用。H 在每工位框住当前可见对象；无空舞台、遮挡标签或幽灵点击。
- [ ] assembled / xray / exploded / cutaway / reference 及 hide 组合逐一检查；无 FLOW / ANIM 科学内容；爆炸只解释结构，不伪称出土分布。自动播放默认关闭，演示进出恢复读者状态。
- [ ] 三张指定插图、alt / caption / manifest 与重用链齐全；没有外部图像 / 网格或未经许可数据混入；LICENSE-CONTENT / THIRD-PARTY-NOTICES 与 §3.10 一致。

### 8.3 仓库门槛与预算（施工后执行）

依 `CLAUDE.md`：`pnpm check`、`pnpm validate`（0 error / warning）、`pnpm test`、`pnpm build`、**build 后** `pnpm e2e` 全绿。视觉额外 `pnpm shoot fossils-and-skeletons --layout --keys`，`--beats` 检查全部拍与拍链接；用 `--locale en|zh --theme paper|cinema` 跑四组合（参数分别取值），再 `--size 1600x900` 检查；看实际截图，不能以命令退出成功代替审图。

`pnpm shoot fossils-and-skeletons --perf --gpu`：静止 <50 calls、最复杂拆解 <60，100 为上限；三角形目标 <0.3M、上限 1.5M；同材质 extra 合并，静止 demand 渲染；首屏 JS≤300KB gzip，不引依赖、GLB、实时模拟或远程请求。目标 1080p60；SwiftShader 不用 fps 冒充真机，iPad 实测触控与静止行为。两组表只在状态变化求值，沿既有 table <0.05ms 目标，不运行帧循环求值。

归档每章、hero-paper / hero-clean / hero-dark / hero-zh、mode-xray / mode-exploded、phone-390 与几何对照截图，记录实际 calls / triangles / JS 大小、命令结果和偏差。§9 施工前保持空白；本轮仅规格检查，不运行会生成其他文件的构建、截图或测试命令，不提交、不发布。

## 9. 引擎记录（施工后填写）
