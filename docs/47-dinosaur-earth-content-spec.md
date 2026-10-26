# 47 · 恐龙时代的地球 · 内容施工 spec（定稿）

2026-10-27。`dinosaur-earth`；父 dossier `dinosaurs-and-fossils`；TimeScene / GeoStage；EN 默认、ZH 完整；paper 默认、cinema 可切。本文覆盖准备稿，供引擎与内容施工使用；没有声称主题已实现或通过发布验收。

**上线方式：直接上线。** 按 `docs/next-batch.md` §一，施工期间 `status: draft`，§8 全绿后改 `published`，不加历史主题人工复审前置条件。规模：背景 + 7 章、35 拍、10 张真实来源重建帧、现代发现地点小图、封面 + 两张章图。新引擎工作仅 E-DE1–E-DE3（§4）。

## 0. 决定与事实复核

### 0.1 给 Gavin 的代定项

| id | 代定内容 |
|---|---|
| D1 | 保留背景 + 7 章 / 35 拍；范围 250–0 Ma。三叠纪起点在更早的 251.902 Ma；250 是第一张模型样本，不冒充时期起点。[F001,DE003] |
| D2 | `subject: geography`；`mode: time`；`engine: time-scene`；`stage: geo`；`theme: paper`；`sensitivity: open`；`tags: [dinosaurs,deep-time,beyond-syllabus]`；不展示年级，不宣称 MOE 恐龙必修单元。 |
| D3 | 主图只用 PALEOMAP PaleoDEM v2 的已打开 CSV；不加入 Müller 模型、现代海岸或 API 古坐标。采用离散较老样本、显式日界线切口及极区裁切，不做连续漂移模拟。[F039,DE003,DE007] |
| D4 | `z>0` 是模型陆地阈值；`z=0` 归到非陆地一侧并在来源说明标“海平面边界不确定”。这不是实测古岸线；1° 是网格间隔，不是位置准确度。[F039,DS01] |
| D5 | 所选事件 66 Ma 配实际地图 70 Ma，两个读数始终并列；65 Ma 帧只在之后独立出现。无精确 66 Ma 图时不造图、不重命名、不形变。[F019,DE003] |
| D6 | 化石只放现代小图；采用既存有界 PBDB 快照，不补完整全球数据库、不做物种密度或国家数量排行榜。浏览窗 ±5 Ma 是界面选择，非测量误差。[F036,DE005,DE006,DS02] |
| D7 | 第05章和第07章显示“跨中生代的发现地”，不表示同时生存；前三张区域证据卡可在各章独立打开，卡片地层年龄与主图样本分列。[F031–F034] |
| D8 | 所有马来西亚 PBDB 精确位置均从发布数据中抑制；彭亨仅文字区域卡，不用州府点或假半径。泰、老卡也只到有来源的地区 / 国家精度。[F031–F034,DE006] |
| D9 | 新加坡是现代制图定位与展出地点；馆藏来源采用馆方可读 HTML。删旧昵称、亲子故事、发现年份和完整率支线，不把展出地当原地出土证据。[F026–F028,DE004] |
| D10 | 灭绝平实叙述，无人类伤亡、受伤动物或尸体图。正文用撞击证据；细看保留火山活动、气体与年代的研究问题，删除逐篇争论史与反演数值，不制造等证据权重的二选一。[F019–F023,F050] |
| D11 | 诗琳通龙、鱼猎龙、希克苏鲁伯、盘古大陆、莫里森组、呵叻府及§5中文词是编辑用词，本轮没有建立新加坡权威中文对照；首见保留英文 / 拉丁名，不称 MOE 规范译名。Khok Kruat 保留拉丁字母。 |
| D12 | 复用本题已审三张生成插画，不重新生成或编辑。足迹为通用示意，不据三个趾印断言物种；地层图的五层与小行星外形是画面设计，不是测量。[DS03] |
| D13 | 章内对象索引落实到本题 point/card；帧从 PLATE 来源入口点开，术语走现成 glossary。复用 inspector 插槽与来源弹层，只补 TimeScene 缺少的数据接线，不重建 HUD。 |
| D14 | 姊妹主题按 docs/46 的最终章 id 链接（§2.3）；不保留准备稿虚构的 `museum`、`dating`、`regional-evidence` 等目标。本轮只写本规格，不改其他文件或 review queue。 |

### 0.2 核查口径

已读取父 dossier 的 `dinosaurs-and-fossils-research.md`（实际文件名）、facts / datasets，本题 spec-draft / facts-extra / INVENTORY / engine-review，以及现有代码。准备稿没有字面 ⚑；把原文受限项、所有拟展示数值、灭绝与争议内容仍列入复核。`verified` 指取得原发布者原文或直接重读并计算带哈希的原始数据；`changed` 指缩小主张、修订书目信息或换成可读原文；`cut` 只表示本题不采用，不宣称事实错误。互斥计数见下表末行。

访问日期均为 2026-10-27；不直接引用任何原句，避免把索引摘要充当全文。Schulte 原摘要通过 Europe PMC REST 取得，旧摘要的 65.5 Ma 不采用；年代以 ICS / NHM 的 66 Ma 为准。Chiarenza 全文通过同一公共存档取得；PMC 浏览器验证页未操作。馆方 annual report 超大小限制，换 S57 HTML。所有自然科学数字和来源版本留到 `data/SOURCES.md`；日期不包 `<Num>`，尺寸与数量包 `<Num s="…">`，元数据 / 地图读数附来源按钮。

### 0.3 fact id → 结论与依据

| fact id | 结论 | 本题最终采用范围 / 删除理由 | 本轮来源与定位（直达链接见§6） |
|---|---|---|---|
| F001 | verified | 中生代 251.902–66.00 Ma；三叠纪 / 侏罗纪界 201.4±0.2、侏罗纪 / 白垩纪界 143.1±0.6 Ma；最老界 251.902±0.024。 | S01 单页图，数值及栏位已复取 |
| F002 | verified | 数值年龄可修订；本题固定 ICS 2026/06，不把数值误写为地层单位本身的定义。 | S01 图下注释 |
| F003 | verified | 化石包括身体遗存和活动痕迹。 | S02 Introduction |
| F004 | verified | 保存不完整；快速埋藏与硬组织有利。点空白不能证明没有恐龙。 | S02 Odds of Becoming a Fossil；S24 数据选择限制 |
| F009 | verified | 未扰动、未倒转的沉积序列下老上新；不据厚度推年数。 | S05 相对年代段；S58 Superposition |
| F010 | cut | 同位素过程详解交姊妹主题，不在本题重复。 | 原 S05；跨题链接而非本题事实断言 |
| F011 | cut | 不另造夹定年龄算例。 | 原 S05；docs/46 的试一试承担 |
| F012 | cut | 碳十四方法与数万年量级支线移出。 | 原 S06；本题不展示其数字 |
| F014 | verified | 骨、牙、足迹等证据支持不同问题；不从局部遗骸画完整标本。 | S07 evidence / skeleton / footprints 段 |
| F016 | cut | 封面仅通用三趾图，不在本题作所有兽脚类足趾的分类断言。 | 原 S48；画面数量转 DS03 |
| F017 | verified | 现生鸟属于兽脚类恐龙。 | S08 问题9 |
| F018 | cut | 始祖鸟形态详解交姊妹主题。 | 原 S10；本题无该主张 |
| F019 | verified | 约66 Ma 非鸟恐龙灭绝；有鸟类支系存活。 | S11 开篇 / What survived；S01 |
| F020 | verified | 全球相关喷出物层、时间与生态模式共同支持撞击触发灭绝。 | S12 原论文摘要，Europe PMC REST core |
| F021 | verified | 现代墨西哥位置；撞击体约10 km、坑约180–200 km；不把点画成坑轮廓。 | S13 全文引言，Europe PMC fullTextXML；DE-S01只证位置 |
| F022 | verified | 仅在细看说明这项气候 / 生态模型研究的条件性结论，不把模型当实测历史气温。 | S13 Significance / Abstract 与正文 |
| F023 | verified | 德干喷发跨界线；时间关联与挥发物因果须区分。 | S15 作者机构PDF，摘要与讨论 |
| F024 | cut | 删除碳循环反演和两步生产力下降细节；不以未复取全文的准备结论补段落。 | 原 S14；不进正文 / 运行时来源 |
| F025 | cut | 删除特定作者争论史；保留已取得的S13/S15/S51研究问题。 | 原 S16；同上 |
| F026 | changed | 只采用馆方展示梁龙科蜥脚类化石；删超过80%与两头骨等数量支线。 | S17 Highlights: Dinosaurs，原文已取得 |
| F027 | changed | Wyoming / Dana Quarry / Jurassic Morrison 来源改为馆方HTML；名字不必进入本题。 | S57 Research work in LKCNHM；替代过大的S18 PDF |
| F028 | verified | 分类止于 diplodocid sauropods，不替各个馆藏指定物种。 | S17；S57身份研究段 |
| F029 | cut | 旧Apollo / baby等命名史删除。 | 原 S19；本题不采用 |
| F030 | cut | 群体 / 家庭关系支线删除，不作已证实亲缘主张。 | 原 S17；仅作编辑禁用项 |
| F031 | verified | Sirindhorna来自呵叻府早白垩世Khok Kruat组；纸中采用Aptian，不把130Ma地图当其精确年龄。 | S20 Abstract / Locality and horizon / Geological setting |
| F032 | verified | 老挝早白垩世Ichthyovenator依据部分相连的头后骨骼。 | S21 原摘要 |
| F033 | verified | 彭亨发现恐龙牙齿；本题不需要首次 / 发布日支线。 | S22 研究者讲座摘要 |
| F034 | verified | 原研究者说明地点为保护而保密；本题不复原精确挖掘坐标。 | S22 最后段 |
| F036 | changed | collection可汇集多条occurrence，资料来自文献，年龄范围保留；旧API论文实际DOI为10.1017/pab.2015.39（2016卷），非父档案2016.39；当前文件许可另据DE005/6。 | S24 Abstract / PBDB Data Model；原始CSV |
| F037 | cut | 不沿用旧论文与新指南许可冲突叙事；选定快照已自带CC0声明。 | DE005/6替代，非宣称历史文献一致 |
| F038 | cut | Müller2019不是所选地图，删覆盖范围与候选模型支线。 | 父D04未采用 |
| F039 | verified | PaleoDEM为复原地形 / 海底深度，单位m、1°格网、540–0 Ma与名义5Myr间隔；下载帧实况另见DE003。 | S29 Zenodo Description；官方API许可cc-by-4.0 |
| F040 | cut | PaleoAtlas v3与91张图不是本题输入。 | 父D06未采用 |
| F041 | verified | Natural Earth数据公有领域；只用于现代参照。 | S31 Terms of Use |
| F044 | cut | 删除具体科学课纲对应断言，改为编辑定义的拓展读物。 | 原 S37未在本轮复取 |
| F045 | cut | 删除社会科课纲对应与页码主张。 | 原 S38未在本轮复取 |
| F048 | cut | 删除2007–2010发现年份支线。 | S17已读；本题无需该数字 |
| F050 | verified | 喷发岩量与影响气候的气体释放未必同步；不合并不同测年结果成一个精确脉冲。 | S51 作者摘要末句；与S15并列 |
| F051 | verified | 约230 Ma晚三叠世已有确立恐龙记录；不是宣称所有更早候选均已排除。 | S52 视频文字稿 |
| F052 | cut | 本题不报灭绝物种比例，避免扩成生命个体死亡比例。 | 原 S53未采用 |
| DE001 | verified | LPI 21°20′N / 89°30′W换算为[-89.5,21.333333]；只作现代近似定位，不采用该页旧年龄 / 坑径。 | DE-S01 Latitude / Longitude |
| DE002 | verified | 盘古大陆相连、分裂与大西洋发展的一般解释。 | DE-S02开篇；具体边线仍来自S29 |
| DE003 | verified | 实际nc归档109成员；所选10数值年龄存在，66不存在；不用旧文件名的时期。 | S29远端记录 + 本地原始ZIP CRC与成员清单，复跑verify-prefetch.py |
| DE004 | verified | 新加坡label anchor [103.816925,1.366587]，非馆址或化石坐标。 | DE-S04原始ZIP DBF / modern-locators.json，复读 |
| DE005 | verified | 固定全球快照2000occ/1224collections，查询有界、agespan排序且自报CC0；不代表全球普查。示例collection24178有3条occ，各121.4–100.5Ma。 | DE-S05原始CSV metadata、逐行解析；公开派生重算 |
| DE006 | verified | 区域快照167occ/90collections；TH141/LA23/MY3。并集2106occ，抑制3个MY collections/3occ后2103occ、1274collections、61国。 | DE-S06原始CSV、pbdb-derivation.json及公开候选；本轮重算 |
| DE007 | verified | 十个CSV规则网格、接缝和极点不等价；不作无缝球面。K0接缝6个陆海符号差、K100有25个。 | S29原始CSV哈希/CRC，verify-prefetch.py本轮exit0 |

合计 **47 条：28 verified / 3 changed / 16 cut**。其余父档案事实未采用，不计入本题审计。

### 0.4 设计数字单列

| id | 核查与显示规则 |
|---|---|
| DS01 | `z>0`阈值、最大主图zoom3.6、Mercator纬度裁切±85.051129°、不跨±180°焊接是可复现制图选择；不是古地球观测数值。 |
| DS02 | 浏览窗±5Ma；66Ma → 窗[61,71]，70Ma → [65,75]。采样差70−66=4Ma、66−65=1Ma；边界四舍五入只影响显示，原数值参与比较。 |
| DS03 | 足迹三个向前趾印、地层图五个主要层、小行星一个；只是已看过插画的设计计数，不是标本数据。 |

## 1. 立场、范围与必须讲对

本题把时间、古地理复原、现代证据位置分开读。全球主图配东南亚证据；新加坡只作现代参照，不凭展品推断本地出土。各地记录的差异不写成国家成就榜。每章EN 200–300词、ZH 350–500字、3–5段及2–3个细看；不设测验，不另制作音频。字幕EN≤45词；中文独立成文。全显示文本双语、id用kebab-case、颜色只用token。

必须讲对：时期有不同边界[F001–F002]；250Ma地图早于约230Ma的确立恐龙记录[F051]；地图是复原高程派生而非照片[F039]；点是文献采集记录，非动物数、精确死亡日期、完整栖息地或迁徙轨迹[F004,F036]；今天发现国不等于远古国家；区域材料不是同时群落[F031–F034]；馆藏来自怀俄明州[F027]；非鸟恐龙灭绝而部分鸟类支系存活[F017,F019]。

重内容仅为自然灭绝，克制写清，无血腥。撞击证据与模型结论分层：全球喷出物证据[F020]、条件性气候模型[F022]、德干年代和气体问题[F023,F050]分别署名；不以“科学家不知道”抹掉证据，也不把某个模型写成直接观测。小行星与坑径只用S13的约值[F021]；不同来源定义与旧值留来源说明，不拼成更精确的“平均值”。

## 2. 章节与节拍

### 2.1 时间、镜头、状态

时间全部`{ma:number}`；W是本章world镜头，P为[30,0,1.45]，S为[103.816925,1.366587,3.6]。W依章为：00/01/04=[0,10,1.1]，02/07=[0,5,1.1]，03=[15,5,1.1]，05=[90,10,1.5]，06=[-30,5,1.1]。S在0Ma只是制图参照，远古章不以今天新加坡锚点定位古新加坡。所有镜头数值是设计值。

章自身state等于最后一拍，点章按现有规则落第一拍；第一拍与章代表时间不同是有意设计。`state.layers`：背景[base]，正式章[base,fossils-modern]；每拍显式写layers/highlight（无高亮写[]），不继承前章意外开关。背景允许小图参考点而不显示化石，避免宽年龄记录被误读为250Ma恐龙起源证据。

| # | id | 标题 EN / ZH | 代表Ma / 拍数 | 地图样本 |
|---|---|---|---|---|
| 00 | background | Reading deep time / 读懂深时 | 250 / 3 | K250 |
| 01 | triassic-world | Triassic: connected land / 三叠纪：相连的陆地 | 230 / 4 | K250,K230 |
| 02 | jurassic-world | Jurassic: a world separating / 侏罗纪：逐渐分开的世界 | 150 / 4 | K200,K170,K150 |
| 03 | cretaceous-world | Cretaceous: changing land and sea / 白垩纪：变化的水陆 | 100 / 4 | K130,K100 |
| 04 | fossil-atlas | Finds are a record, not a census / 发现记录不是动物普查 | 70 / 5 | K100,K70 |
| 05 | southeast-asian-finds | Southeast Asian evidence / 东南亚的证据 | 70 / 5 | K70 |
| 06 | impact-boundary | 66 million years ago: the impact / 6600万年前：撞击 | 66 / 5 | K70 |
| 07 | earth-today | Earth today: Singapore as a reference / 今天的地球：从新加坡回望 | 0 / 5 | K65,K0 |

小图别名是施工缩写，不是schema值：none → insetVisible:false；modern-world → world；modern-sea → southeast-asia；modern-mexico → mexico；modern-sea-all → southeast-asia + all-mesozoic。其他显示小图的拍用age-window，第07章全部拍显式覆盖为all-mesozoic。隐藏小图不暗改view。默认world / visible:true / age-window。现代country轮廓只在小图显示。卡片的地层年龄独立于当前主图样本。

背景`state.note`：

- EN: “The large map shows reconstructed ancient land. Its sample age stays visible separately from the selected time. The inset shows modern find locations. Fossil dots belong to selected published collections, not a dinosaur census. Regional cards may describe finds of different ages.” [F004,F036,F039,F031–F034]
- ZH：“大图显示复原的远古陆地，地图样本年龄与所选年代分别标出。小图显示今天的发现地点。化石点来自所选文献采集记录，不是恐龙普查。区域卡中的发现可能来自不同年代。”[同上]

### 2.2 每章提纲、索引与逐拍字幕

事实号仅供审计，不进朗读。表中W / world依§2.1解析，pangaea-context=P、singapore=S。高亮点在现代小图有引线；无坐标卡显示已打开的具名证据卡，不在古地图造锚点。章内index只列下述point/card；地质时期、帧来源与名词分别从时期读数、PLATE及现成glossary进入，不把它们伪装成point id。

#### 00 `background` · 读懂深时

- **summary EN / ZH**：An ancient map and a modern find map answer different questions. / 古地图和今天的发现地点图，回答不同的问题。
- **正文**：Ma表示百万年前，较大值更老；中生代含不同时期[F001]。古地理与现代发现图坐标不可混贴[F036,F039]。复原不是照片，点不代表全部动物[F004]。
- **细看**：地图年龄与事件年龄分开读[F001,DE003]；身体证据与活动痕迹[F003,F014]。
- **index**：`site-singapore-modern`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b00-1` | 250 / world / none | — | 250 million years ago: this land pattern is a reconstruction, not the outline of today’s continents. | 2.5 亿年前：这片陆地来自古地理复原，不是今天大陆的轮廓。 | F039 |
| `b00-2` | 250 / world / modern-world | — | 250 million years ago: this map sample is in the Triassic. The Mesozoic began earlier, about 252 million years ago. | 2.5 亿年前：这张地图样本位于三叠纪。中生代开始得更早，约在 2.52 亿年前。 | F001,F039 |
| `b00-3` | 250 / world / modern-world | site-singapore-modern | 250 million years ago: The small map uses today’s land. Singapore is a modern reference point, not a dinosaur fossil find. | 2.5 亿年前：小图使用今天的陆地。新加坡是现代参照地点，不是这里标出的恐龙化石发现地。 | F041,DE004 |

#### 01 `triassic-world` · 三叠纪：相连的陆地

- **summary EN / ZH**：Read the land before adding dinosaur evidence. / 先读陆地，再加入恐龙证据。
- **正文**：250Ma不是三叠纪起点[F001]；约230Ma已有确立恐龙记录[F051]。盘古大陆的概括来自USGS，具体轮廓来自模型[DE002,F039]。相连陆地与所选点分布不能替代完整栖息地[F004,F036]。
- **细看**：未扰动、未倒转沉积序列下老上新[F009]，用地层图连姊妹layers-in-order；复原与概括的差别[F039]。
- **index**：`site-singapore-modern`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b01-1` | 250 / world / none | — | 250 million years ago: the map is in the Triassic. Do not fill the whole period with dinosaur symbols. | 2.5 亿年前：地图位于三叠纪。不能把整个时期都填上恐龙符号。 | F001,F051 |
| `b01-2` | 250 / pangaea-context / none | — | 250 million years ago: The connected land pattern belongs to Pangaea. Coastlines here are reconstructed from a palaeoelevation model. | 2.5 亿年前：相连的陆地属于盘古大陆；这里的海岸线从古地形模型推导。 | DE002,F039 |
| `b01-3` | 230 / world / modern-world | — | 230 million years ago: well-established dinosaurs appear in the Late Triassic record. The inset marks where records were found on today’s Earth. | 2.3 亿年前：晚三叠世已有确立的恐龙记录。小图标的是今天地球上的发现地点。 | F051,F036 |
| `b01-4` | 230 / world / modern-sea | — | 230 million years ago: A fossil point is evidence of a find. Empty areas on this map do not prove that dinosaurs were absent. | 2.3 亿年前：一个化石点表示一条发现记录。地图上的空白，不能证明那里没有恐龙。 | F004,F036 |

#### 02 `jurassic-world` · 侏罗纪：逐渐分开的世界

- **summary EN / ZH**：Compare reconstructed frames as land separates. / 对照复原样本，看陆地逐渐分开。
- **正文**：侏罗纪界线201.4–143.1Ma，200Ma只是样本[F001]。比较200/170/150Ma的长期变化[DE002,F039,DE003]。新加坡展示的蜥脚类材料来自怀俄明州侏罗纪莫里森组，不能从150Ma地图为单具标本指定精确年龄[F026–F028]。
- **细看**：模型地形不等于现代海岸[F039]；展出地与发现地[F027]，连singapore-skeletons。
- **index**：`card-museum-origin`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b02-1` | 200 / world / none | — | 200 million years ago: this is a Jurassic map sample. The period boundary is older, at 201.4 million years ago in the cited chart. | 2 亿年前：这是侏罗纪内的一张地图。所引年代表的时期界线更早，为 2.014 亿年前。 | F001,DE003 |
| `b02-2` | 170 / world / none | — | 170 million years ago: compare this reconstruction with the earlier frame. Pangaea’s breakup took place over millions of years. | 1.7 亿年前：对照前一张复原图。盘古大陆的分裂经历了漫长的地质时间。 | DE002,F039 |
| `b02-3` | 150 / world / modern-world | — | 150 million years ago: the large map shows reconstructed land, while the inset keeps fossil finds in modern coordinates. | 1.5 亿年前：大图显示复原陆地，小图仍按现代经纬度显示化石发现地。 | F036,F039 |
| `b02-4` | 150 / world / modern-sea | card-museum-origin | 150 million years ago: The museum in Singapore displays Jurassic sauropods found in Wyoming. Their display location is different from their place of discovery. | 1.5 亿年前：新加坡博物馆展示的侏罗纪蜥脚类化石发现于怀俄明州。展出地点与发现地点不同。 | F026,F027 |

#### 03 `cretaceous-world` · 白垩纪：变化的水陆

- **summary EN / ZH**：Compare map samples and the independent ages of finds. / 对照地图样本与发现材料各自的年代。
- **正文**：白垩纪143.1–66Ma[F001]；130/100Ma是两个复原样本[DE003]。泰、老材料来自早白垩世，区域卡保留原论文学段，不把130Ma地图当泰国标本测年[F031,F032]。PBDB年龄界限保留，不以中点作死亡日期[F036,DE005]。
- **细看**：地质界线数值会修订[F002]；1°网格不等于古岸线准确度[F039]。
- **index**：`card-thailand-find`, `card-laos-find`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b03-1` | 130 / world / none | — | 130 million years ago: this sample lies in the Cretaceous. The period began earlier, around 143 million years ago on the cited chart. | 1.3 亿年前：这张样本图位于白垩纪。所引年代表中，白垩纪约始于 1.43 亿年前。 | F001,DE003 |
| `b03-2` | 130 / world / modern-sea | card-thailand-find | 130 million years ago: the inset’s Thailand card describes an Early Cretaceous find. Its age comes from the paper, independently of this map sample. | 1.3 亿年前：小图的泰国卡说明早白垩世的发现。材料年代来自论文，与这张地图的样本年龄分别读取。 | F031,DE003 |
| `b03-3` | 100 / world / none | — | 100 million years ago: compare reconstructed land and water with the 130-million-year sample. These are separate model frames. | 1 亿年前：把复原的水陆分布与 1.3 亿年前样本对照。它们是不同的模型帧。 | F039,DE003 |
| `b03-4` | 100 / world / modern-world | — | 100 million years ago: A record with a broad age range may overlap several map samples. That does not show one animal living through them all. | 1 亿年前：年代范围较宽的记录，可能与几张地图样本重叠。这不表示一只动物活过了这些时段。 | F036,DE005 |

#### 04 `fossil-atlas` · 发现记录不是动物普查

- **summary EN / ZH**：A dot opens collections, occurrences and sources. / 一个点打开采集、记录与来源。
- **正文**：本题从PBDB取非鸟恐龙中生代有界快照[DE005,DE006]。一个collection可含多条occurrence，地图聚合而详情逐条保留[F036]。时间窗交集不提供精确死亡日期[DE005,DS02]。保存与研究及选择限制使密度、空白不能作数量比较[F004,F036]。
- **细看**：记录例collection24178的三条年龄区间[DE005]；快照的选择方式与CC0声明[DE005,DE006]。
- **index**：`pbdb-col-24178`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b04-1` | 100 / world / modern-world | — | 100 million years ago: the inset filters records whose published age ranges overlap the selected window. The dots use modern find coordinates. | 1 亿年前：小图筛出发表年龄范围与所选时间窗重叠的记录，点位采用现代发现坐标。 | F036,DE005 |
| `b04-2` | 100 / world / modern-world | pbdb-col-24178 | 100 million years ago: Several fossil records can share one collection location. Open a marker to see the records and their references. | 1 亿年前：多条化石记录可能共用一个采集地点。打开标记，可以查看记录和文献。 | DE005 |
| `b04-3` | 70 / world / modern-world | — | 70 million years ago: the filter changes with age. A dot appears because its age range overlaps the window, not because a death date is known. | 7000 万年前：筛选随年代改变。点出现是因为年龄范围重叠，不是因为知道了死亡日期。 | DE005 |
| `b04-4` | 70 / world / modern-sea | — | 70 million years ago: Dense clusters show recorded finds. Preservation and research affect where fossils enter the database. | 7000 万年前：密集的点群表示已记录的发现。保存条件和研究工作，都会影响哪些化石进入数据库。 | F004,F036 |
| `b04-5` | 70 / world / modern-mexico | — | 70 million years ago: A blank patch is a gap in this selected record. It is not a measured boundary of dinosaur habitat. | 7000 万年前：一片空白只是所选记录中的空缺，不是测量得到的恐龙栖息地边界。 | F004,F036 |

#### 05 `southeast-asian-finds` · 东南亚的证据

- **summary EN / ZH**：Regional finds preserve different pieces of evidence. / 区域发现留下不同的证据片段。
- **正文**：主图70Ma仅为叙事背景，小图切all-mesozoic，始终标不同年代[F031–F034]。泰国是Sirindhorna材料，老挝是Ichthyovenator部分头后骨骼；彭亨牙齿只用地区卡[F031–F034]。新加坡定位与美国来源馆藏分开[F027,DE004]。
- **细看**：区域卡不冒充某个PBDB记录；彭亨位置保护[F034]；局部骨、牙证据连rebuilding-evidence[F014]。
- **index**：`site-singapore-modern`, `card-thailand-find`, `card-laos-find`, `card-pahang-find`, `card-museum-origin`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b05-1` | 70 / world / modern-sea-all | site-singapore-modern | Background map: 70 million years ago; modern inset: The inset switches to regional evidence from across the Mesozoic. Singapore is today’s reference point; these finds are not all the same age. | 背景地图为7000 万年前；现代小图：小图切换为跨中生代的区域证据。新加坡是今天的参照地点；这些发现并非都属于同一年代。 | F031,F032,F033,DE004 |
| `b05-2` | 70 / world / modern-sea-all | card-thailand-find | Background map: 70 million years ago; modern inset: In northeastern Thailand, Sirindhorna was described from the Early Cretaceous Khok Kruat Formation in Nakhon Ratchasima Province. | 背景地图为7000 万年前；现代小图：在泰国东北部，诗琳通龙的描述材料来自呵叻府早白垩世的 Khok Kruat 组。 | F031 |
| `b05-3` | 70 / world / modern-sea-all | card-laos-find | Background map: 70 million years ago; modern inset: Laos preserves Early Cretaceous Ichthyovenator remains. The original description was based on parts of the body, not a complete skeleton. | 背景地图为7000 万年前；现代小图：老挝保存了早白垩世鱼猎龙的遗骸。最初描述依据身体的一部分，并非完整骨架。 | F032 |
| `b05-4` | 70 / world / modern-sea-all | card-pahang-find | Background map: 70 million years ago; modern inset: Pahang, Malaysia, yielded dinosaur teeth. The site was kept confidential for protection, so this card identifies only the region. | 背景地图为7000 万年前；现代小图：马来西亚彭亨发现了恐龙牙齿。发现地点曾为保护而保密，因此卡片只说明区域。 | F033,F034 |
| `b05-5` | 70 / world / modern-sea-all | card-museum-origin | Background map: 70 million years ago; modern inset: Singapore’s museum displays sauropod fossils found in the United States. A museum location is not a fossil excavation site. | 背景地图为7000 万年前；现代小图：新加坡博物馆展示的蜥脚类化石发现于美国。博物馆的位置，不等于化石挖掘地点。 | F026,F027 |

#### 06 `impact-boundary` · 6600万年前：撞击

- **summary EN / ZH**：Separate event age, map age and evidence. / 分开事件年代、地图年代与证据。
- **正文**：66Ma事件配70Ma样本[F019,DE003]；现代坑址取LPI坐标，坑径与撞击体尺寸取S13而非旧LPI数值[F021,DE001]。全球喷出物与年代证据支持撞击触发[F020]。非鸟恐龙灭绝，鸟类支系存活[F017,F019]。
- **细看**：模型显示撞击冬天可破坏栖息地[F022]，不同于实测历史气候；德干年代、气体与喷发岩量的关系仍要分别研究[F023,F050]。
- **index**：`site-chicxulub-modern`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b06-1` | 70 / world / none | — | 70 million years ago: this is the last older land sample before the impact in our selected map sequence. | 7000 万年前：在所选地图序列中，这是撞击之前最后一张较老的陆地图。 | DE003 |
| `b06-2` | 66 / world / modern-mexico | site-chicxulub-modern | 66 million years ago: the impact age is shown separately. The large map remains the 70-million-year reconstruction; the inset locates the crater in modern Mexico. | 6600 万年前：事件年代单独显示。大图仍是 7000 万年前复原；小图标出今天墨西哥的坑址。 | F019,F021,DE001,DE003 |
| `b06-3` | 66 / world / modern-world | site-chicxulub-modern | 66 million years ago: The asteroid was roughly 10 kilometres across. The crater is roughly 180 to 200 kilometres across; this locator dot is not its outline. | 6600 万年前：小行星直径约 10 公里，陨石坑直径约 180 至 200 公里。这个定位点不是坑的轮廓。 | F021 |
| `b06-4` | 66 / world / modern-mexico | site-chicxulub-modern | 66 million years ago: A global ejecta layer and its timing support the impact as the extinction trigger. Deccan volcanism also overlapped this interval. | 6600 万年前：全球喷出物层及其年代，支持撞击是灭绝的触发因素。德干火山活动也与这段时期重叠。 | F020,F023 |
| `b06-5` | 66 / world / modern-world | — | 66 million years ago: All non-avian dinosaurs disappeared in the end-Cretaceous extinction. Some bird lineages survived, so not all dinosaurs became extinct. | 6600 万年前：白垩纪末灭绝中，所有非鸟类恐龙消失；部分鸟类谱系存活，因此并非所有恐龙都灭绝了。 | F017,F019 |

#### 07 `earth-today` · 今天的地球：从新加坡回望

- **summary EN / ZH**：Distinguish today, model samples and museum locations. / 分清今天、模型样本与展出地点。
- **正文**：65Ma在事件之后1Ma，不能改称66Ma[DE003,DS02]。0Ma主图仍为PALEOMAP，小图另用Natural Earth[F039,F041]。新加坡参照是cartographic label anchor，非馆址或挖掘点[DE004]。馆藏与活鸟提供不同的证据入口[F017,F027]。
- **细看**：为何65到0之间不冒充连续运动[DE003]；连singapore-skeletons与birds-are-dinosaurs。
- **index**：`site-singapore-modern`, `card-museum-origin`。

| 拍 id | Ma / 主镜头 / 小图 | 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| `b07-1` | 65 / world / none | — | 65 million years ago: this map sample is one million years younger than the 66-million-year event. It is not an exact impact map. | 6500 万年前：这张地图比 6600 万年前事件晚 100 万年，并不是撞击瞬间的地图。 | F019,DE003 |
| `b07-2` | 65 / world / modern-world | — | 65 million years ago: The fossil dots remain on today’s inset. None have been moved into this ancient land pattern. | 6500 万年前：化石点仍在现代小图上；没有把它们直接移到这片远古陆地。 | F036,F039 |
| `b07-3` | 0 / world / modern-sea | site-singapore-modern | Today: the large map shows the model’s zero-million-year sample. The modern inset uses Natural Earth land and its Singapore locator. | 今天：大图显示模型的零百万年样本。现代小图使用 Natural Earth 陆地及其新加坡定位点。 | F039,F041,DE003,DE004 |
| `b07-4` | 0 / singapore / modern-sea | card-museum-origin | Today: In Singapore, a museum visit connects us to Jurassic fossils discovered in Wyoming. A display and a discovery tell different location stories. | 今天：在新加坡参观博物馆，可以认识发现于怀俄明州的侏罗纪化石。展出地点与发现地点，讲的是不同的位置故事。 | F026,F027 |
| `b07-5` | 0 / singapore / modern-sea | site-singapore-modern | Today: Living birds belong within dinosaurs. Continue to the skeleton topic to see the anatomical evidence behind that relationship. | 今天：现生鸟类属于恐龙。前往骨骼主题，继续看这种亲缘关系的解剖证据。 | F017 |

### 2.3 姊妹主题接口

`TopicLink slug="fossils-and-skeletons"`：地层顺序→`layers-in-order`；定年细节→`ash-beds-and-ages`；保存偏差→`buried-to-exposed`；局部骨 / 牙证据→`rebuilding-evidence`；鸟→`birds-are-dinosaurs`；馆藏→`singapore-skeletons`。这些id按docs/46定稿，不再使用准备稿占位id。构建时校验真实目标；目标主题未就绪时用有效主题页链接，不能发布死ch链接。

## 3. 数据、图层与制图计划

### 3.1 精确输入与部署文件

原料只读根目录为 `/Users/gavin/work/atlas/art/research/dinosaur-earth/data/`。精确下载URL、字节数、SHA256、成员CRC在同目录 `INVENTORY.md`、`inventory.json`、`keyframes-csv.json`；不得用同名重新下载文件默默覆盖这些固定快照。本轮 `python3 -B …/data/verify-prefetch.py` exit 0；原数据开箱通过，不等于派生地图已通过拓扑 / 视觉验收。

| 输入（相对原料根目录） | 上游固定来源 / 用途 | 成品（建议 public/geo/ 文件名，均本地） | 每份成品许可家族 |
|---|---|---|---|
| `keyframes-csv/Map49_250Ma.csv` 等§3.2十份 | D05，PALEOMAP v2，Zenodo5460860的 `PaleoDEMS_long_lat_elev_csv_v2.zip` 成员；主图唯一水陆输入 | `de-land-250.json`等十个单对象TopoJSON；`de-reconstruction.json`清单 | 原料CC BY4.0；地形改编文件CC BY-NC-SA4.0，保留Scotese/Wright、版本、DOI、原CC BY链接及变更说明 |
| `paleomap-1deg-netcdf.zip`（SHA256 `7014767a168c28d3762f55117ebafcd0f6b6b90029a495e2d14fd23f94abc16d`） | D05官方完整nc归档；109成员、CRC通过；仅作成员年龄核对。没有声称HDF5数组已解码 | 不部署；不把不能解码的数组当CSV数值独立交叉验证 | 原CC BY4.0 |
| `pbdb-global-bounded-2000.csv` + `pbdb-th-la-my.csv` | D02，2026-10-26固定API快照，exact query见下；只用于制作可公开子集 | 不部署原件 | 原metadata CC0；包含马来西亚位置的原件只留准备目录 |
| `pbdb-publication-modern-points.csv`（SHA256 `a44596c27e151009a843f0b5214273cd58ab27632efc87f1e28cb8a6db84848c`） | 两快照按occurrence去重、排除MY后的候选；本轮重算2103occ/1274collections/61国[DE005,DE006] | `de-fossils-modern.json`，按collection聚合，每条occurrence保留区间与文献；不可丢引用 | CC0，无share-alike；留PBDB、原贡献者、查询/快照日期与整理说明 |
| `ne_110m_land.zip`，v4.1.0（SHA256 `1926c621afd6ac67c3f36639bb1236134a48d82226dc675d3e3df53d02d2a3de`） | D08，Natural Earth；现代世界 / 墨西哥小图陆地 | `de-modern-land.json`，命名对象同stem | 公有领域，无新增限制，礼貌署名及简化说明 |
| `ne_50m_admin_0_countries.zip`，v5.1.1（SHA256 `5fed433373581fa648920435f937d95f2d3c0200e067409c6478dcdf1b853139`） | D08，现代小图国家轮廓TH/LA/MY/SG/MX；DBF新加坡label anchor[DE004] | `de-modern-countries.json`，只导出所需国家、保留稳定NE键 | 公有领域；与古地形分文件 |
| 自编现代参照点与证据卡 | DE001/4、F026–F034，事实改写，不复制馆方照片或论文图 | `de-reference-points.json`、`de-reference-cards.json`、`de-modern-inset.json` | Atlas文字CC BY-NC-SA4.0；点坐标事实保留原来源，不能把原始事实宣称为独占 |
| sources / glossary / 本文 / 三张既有生成图 | 自编双语文字与本题已审图 | 主题data、章节及图像WebP | Atlas CC BY-NC-SA4.0；图不是第三方地图或标本扫描 |

不存在CC BY-SA与CC BY-NC-SA混成一个派生文件的情形；不采用ODbL或受协议限制源。上游数据声明与派生许可逐文件写入 `LICENSE-CONTENT` / `THIRD-PARTY-NOTICES` 例外表，不能用Atlas总许可覆盖CC0/PD原件。上述是后续施工要求，本轮不改许可文件。

PBDB完整查询必须随来源表保留（只在构建准备期使用，运行时零外部请求）：

```text
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&show=coords,loc,strat,ref&limit=2000&order=agespan
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&cc=TH,LA,MY&show=coords,loc,strat,ref&limit=5000
```

全球快照是2000/21720匹配occurrences，按agespan排序；区域为167/167，仅对该次查询完整。两个快照不能直接相加；并集、抑制、聚合顺序见§4。快照数量只在资料说明 / PLATE中称“所选记录”，不作古生态学结论。[DE005,DE006]

### 3.2 十帧与时期边界

| 帧id / 输出stem | Ma | 实际CSV成员 | 时期 / 服务拍 |
|---|---:|---|---|
| frame-land-250 / de-land-250 | 250 | Map49_250Ma.csv | 三叠纪；00全部、01前两拍 |
| frame-land-230 / de-land-230 | 230 | Map46_230Ma.csv | 三叠纪；01后两拍 |
| frame-land-200 / de-land-200 | 200 | Map43_200Ma.csv | 侏罗纪；02-1 |
| frame-land-170 / de-land-170 | 170 | Map37_170Ma.csv | 侏罗纪；02-2 |
| frame-land-150 / de-land-150 | 150 | Map33_150Ma.csv | 侏罗纪；02-3/4 |
| frame-land-130 / de-land-130 | 130 | Map29_130Ma.csv | 白垩纪；03-1/2 |
| frame-land-100 / de-land-100 | 100 | Map23_100Ma.csv | 白垩纪；03-3/4、04-1/2 |
| frame-land-70 / de-land-70 | 70 | Map17_070Ma.csv | 白垩纪；04后3拍、05、06全部 |
| frame-land-65 / de-land-65 | 65 | Map16_065Ma.csv | 古近纪；07-1/2 |
| frame-land-0 / de-land-0 | 0 | Map01_000Ma.csv | 现代模型样本；07后3拍 |

帧存在性[DE003]，分类[F001]。source legacy `Late_Triassic_200Ma`、`Permo-Triassic Boundary_250Ma`、`KT_Boundary_65Ma`仅作原文件名，禁止进入显示名。没有66Ma样本。正文 / 细看用固定ICS2026/06表：三叠纪251.902至201.4、侏罗纪201.4至143.1、白垩纪143.1至66.00Ma；误差随S01显示。它是阅读面板表格，不新增底部年代条，不把251.902扩入250–0的可拖范围。边界取整写“约”，精确值保留到细看。[F001,F002]

### 3.3 制图管线与边缘策略

1. 只读十个已打开CSV；核对SHA256/CRC，坐标唯一、有限、间距1°。较老五帧是180×360、64800行，范围[-180,-89,179,90]；其余是181×361、65341行，范围[-180,-90,180,90]。[DE007]
2. 源说明已确认地形 / 水深单位为m[F039]；以z>0派生模型陆地，精确零归非陆地一侧[DS01]。同一阈值和确定性矢量化算法用于全部帧；记录阈值、简化公差和变更，不套普通历史控制区的现代海岸裁剪。
3. `renderWorldCopies:false`；经度±180为显式图框切口，纬度裁到±85.051129°。只在源内部单侧插值，不跨接缝焊接。较老五帧179至180°未采样条带出unavailable遮罩，不能当已知海洋。裁切边 / 遮罩边不描成海岸。极点行与接缝高程有不一致，不能抹平后声称无缝球面。[DE007,DS01]
4. 海岸从未裁切的陆地边界导出，再按显示图框裁边线；环闭合、无自交/零面积、无跨日界线横贯直线。`SOURCES-GEO.md`每帧列输入→算法→成品、采样/简化误差分开记。没有实测古岸线可作真值，不伪造“历史岸线残差”。
5. 先做K250/K0，连同原网格并排渲染；通过后扩十帧。0Ma主图仍同模型，小图是现代NE，不能临时用NE填补缺陷。现代country文件不与古地形合并。

### 3.4 文件与图层绑定

`entities.json=[]`、`events.json=[]`、`movements.json=[]`；`control.json.keyframes`按旧→新含十个空FeatureCollection，t与§3.2逐项相等。用现有空帧生成范围和时间轴菱形，不造holder/阵营，不走军事统计或面积对比。`base`永远开且对本题只指重建底图；`fossils-modern`是小图化石符号开关；不列borders/control/movements/battles/participation/sites，不启用普通REFERENCE的军事帧比较。

参照点：`site-singapore-modern`=[103.816925,1.366587][DE004]；`site-chicxulub-modern`=[-89.5,21.333333]，附`eventAge:{ma:66}`[DE001,F019]。它们不是PBDB点，不计化石collection。卡片：`card-thailand-find`（呵叻府、region-only）、`card-laos-find`（老挝、country-only）、`card-pahang-find`（彭亨、region-only）、`card-museum-origin`（Wyoming→Singapore文字、region-only）。卡片无at，无运输线，无推测centroid；有对应NE国家面才允许弱高亮现代国家，必须同时写卡片实际精度。[F027,F031–F034]

小图view设计bounds：world[-180,-85,180,85]、southeast-asia[90,-10,120,25]、mexico[-105,10,-80,30]。按现有d3-geo用SVG绘制，clip到view，主图仅一个MapLibre实例。不得为墨西哥视图套新加坡镜头；切小图不动主camera。小图作为现有右上card插槽内容，开关走现成controls；窄屏放阅读面板节拍行之后、inspector之前，并支持演示可见。普通H照旧隐藏HUD卡片，hero-clean只留古地图；P演示把当前证据图 / 卡作为舞台内的present-evidence层保留，并纳入字幕避让与布局检查，不把小图变成不可验收的纯装饰。

左列PLATE：SELECTED / 所选年代；MAP SAMPLE / 地图样本及Δ；模型名+RECON；Mercator / 极区裁去；现代小图模式；匹配 / 所选collections与抑制数。手机隐藏左列时，样本年龄和小图“今天”标签仍在舞台 / 阅读面板可见。次级读数不另占底部。模型、范围、样本差与小图数值均能点到来源。reconstruction分支的底部状态只显示年代/实际样本等适用读数，不显示0场战斗、参战方数或控制面积；不改旧历史主题状态。

## 4. 引擎契约（仅缺失能力）

### 4.0 代码现实核对与删项

检查范围包括 `src/content/schema/{common,topic}.ts`、`src/engines/time-scene/{schema,index,View}.tsx/ts`、`lib/{time,ticks,format,model,datedLayers,localLand,frame}.ts`、`stages/geo/{controller,style}.ts`、`src/engines/core/{types,url-state,SceneHost,test-api,presentation}`、SpaceScene `lib/sim/{index,bind}.ts`、`scripts/{validate-content,shoot}.ts` 与 docs/06 的时间 / 图层 / URL / QA节。当前实际sim注册和bind是SpaceScene零件/流/动画系统，没有可复用的古地理或第二坐标空间求解器；本题无需新增sim。

| 准备稿需求 | 定稿处理 / 现有覆盖 |
|---|---|
| 新建“地质年代引擎”、Ma排序、负时间坐标、Ma URL语法 | 删除。common.ts已有`geoTime`，time-scene/lib/time.ts已有toNumber/fromNumber（支持maDigits参数），src/lib/time.ts已有`200ma`编解码；只补§4.3调用接线和finite边界。 |
| 地质刻度 / 底部章拍轴 / 点章跳第一拍 / 手动翻拍 | 删除重做项。lib/ticks.ts、segmentScale.ts、Timeline.tsx、View.tsx与core/presentation已覆盖；只补现有b字段到TimeScene的恢复。 |
| 零实体、全空control、隐藏参与卡 | 删除。View.tsx已有`geo.entities.length>0`条件，docs/42 §9的旧空卡差距已修复。 |
| 详情放正文上方、来源弹层、可收起卡片 | 删除新HUD组件要求。SceneHost inspector / card槽、EventInspector及SourcePopover已覆盖；新point/card只接入它们。 |
| 所有章节对象都可点索引 | HUD规则已定，但TimeScene的严格timeChapterState实际没有index字段。只在E-DE2补本题point/card索引与校验；不声称TimeScene已有SpaceScene索引实现。 |
| datedLayers取代化石筛选 | 不采用。现有[f,u)与“过去一年新增”不表达逐occurrence闭区间交集，也无法改变现代与古坐标的显示空间。保留E-DE2。 |
| basemap.local/region或控制区交叉淡化代替古底图 | 不成立。local是高zoom局部覆盖，region静态，control是holder层；都不能确保不加载现代全球陆地与离散重建切换。保留E-DE1。 |
| 把撞击写普通event并重做事件持续窗口 | 删除这项引擎改动。model.ts现有最短1%事件窗口不适用；本题用E-DE2现代参照点+eventAge，不修改历史事件语义。 |

| 新项 | 最小施工范围 | 依赖 / 不包含 |
|---|---|---|
| E-DE1 | reconstruction-only全球底图分支、真实帧选择/失败状态/样本读数、现代源隔离 | 复用MapLibre/TopoJSON；无板块求解器、无海岸形变 |
| E-DE2 | SVG现代发现图、collection区间筛选、无坐标卡、MY抑制、point/card inspector和index接线 | 复用card/inspector/controls/来源；不扩展普通datedLayers |
| E-DE3 | topic级Ma精度接到现有函数、有限值/同标尺校验、TimeScene现有b恢复及inset URL状态 | 复用现有URL/拍控件；无新时间模型、无新HUD底条 |

### 4.1 E-DE1：全球重建底图

以下`Bi={en:string,zh:string}`两值均非空；`Ma={ma:finite number>=0}`；asset stem为kebab-case，解析到本地`public/geo/<stem>.json`；source id必须解析到本题sources。所有对象严格schema，未知字段拒绝。

```ts
// topic.basemap新增分支，与local、region恰选一个；不改变无basemap主题默认。
reconstruction: { file: AssetId; selection: 'hold-older' }
// de-reconstruction.json
{
  version: 1, modelId: 'paleomap-v2', modelLabel: Bi,
  coordinateSpace: 'reconstructed', geometryMeaning: 'exposed-land',
  method: Bi, sources: string[],
  frames: [{id: string, t: Ma, file: AssetId,
    sampleBounds: [number,number,number,number], sources: string[]}]
}
// 每帧单对象TopoJSON（object名=stem）；properties:
{kind:'land'|'coast'|'unavailable', modelId:string, frameMa:number}
```

land/unavailable必须面，coast必须线；非空land，线不得含图框裁边。清单帧Ma严格递减、唯一，modelId一致；本题精确十帧。每帧样本边界匹配§3.3；Topology可解码，坐标有限合法、无零面积/自交，依既有绕向修正，不以手画边界修源。清单/frame/source/object缺失、混合日期与Ma、frameMa或modelId不一致均构建失败。reconstruction只用于time-scene+geo，不得并用local/region/datedLayers；本题实体/事件/行动须空，control空帧时间与清单完全一致。引擎的内置不可用图层不注册开关，URL试图开启borders等也丢弃，不能靠“默认关闭”隔离古今。

`frameAt(q)`取所有`frameMa>=q`中的最小值，输入先clamp到[0,250]；exact命中自身。`deltaMa=frameMa-selectedMa`。66→70/Δ4；65→65；32.5→65/Δ32.5并提示“此区间未提供中间样本”；0→0。初次/切主题/换theme/缺帧任何路径都不加载Natural Earth主图、SEA高精陆地、现代国界/国名/河流；现代源只归E-DE2。不能在底图load后再盖掉现代图，避免闪现。

帧选定后一次替换本地静态source；无两岸线叠影、无vertex morph。复用fetch缓存与TopoJSON解码工具，最多留当前+相邻两帧；跨帧异步请求以generation取消旧响应，旧请求迟到不能覆盖新帧。所选帧未就绪时不挂旧陆地冒充新样本；显示loading/unavailable并保留所选年代。失败不能回退现代海岸。相同frameId内拖动不重复解码/上传几何。主图maxZoom=3.6、worldCopies=false、边缘按§3.3；不新增maxZoom主题配置。

输出（§4.4测试API及PLATE共用）：`selectedMa, frameId, frameMa, deltaMa, modelId, geometryMeaning, status:'loading'|'ready'|'unavailable', geometryUpdates`。无可用帧时frameId/frameMa/deltaMa为null，不能报虚假ready。事实来源芯片RECON；墨卡托极区裁切与离散样本声明保持可读。底部只保留现有章节轴。

### 4.2 E-DE2：现代发现图与证据对象

```ts
// topic现代图配置：只用于有reconstruction的主题
modernInset: {
  file: AssetId, land: AssetId, countries: AssetId,
  label: Bi, defaultView:'world', defaultVisible:true,
  ageWindowHalfWidthMa:5,
  views: [{id:'world'|'southeast-asia'|'mexico', label:Bi,
    bounds:[number,number,number,number]}]
}
// de-modern-inset.json；各子文件分开署名
{version:1, pointFiles:AssetId[], cardFiles:AssetId[],
 suppression:{countryCode:'MY',collections:number,occurrences:number}}
// pointFiles内：{version:1, coordinateSpace:'modern', points:ModernPoint[]}
ModernPoint = {
 id:string, coordinateSpace:'modern', at:[number,number], title:Bi,
 summary:Bi, detail?:Bi, sources:string[]
} & (
 {kind:'fossil-collection', pbdbCollectionId:string, countryCode:string,
  precision:Bi, occurrenceAges:[{pbdbOccurrenceId:string,
    olderMa:number, youngerMa:number, basis:Bi, sources:string[]}]}
 | {kind:'reference',role:'singapore'}
 | {kind:'reference',role:'impact-site',eventAge:Ma}
)
// cardFiles内：{version:1, coordinateSpace:'modern', cards:ReferenceCard[]}
ReferenceCard = {
 id:string, kind:'reference-card', role:'regional-find'|'museum-origin',
 coordinateSpace:'modern', title:Bi, summary:Bi, detail:Bi, sources:string[],
 regionLabel:Bi, countryCode:string, precision:'region-only'|'country-only',
 linkedCountryFeatureId?:string // 必须在countries文件中存在
}
// timeChapterState与timeBeat补可选绑定；index只在chapter
inset?:'world'|'southeast-asia'|'mexico'; insetVisible?:boolean;
fossilMode?:'age-window'|'all-mesozoic';
// timeChapterState：index?:string[]，仅本题point/card ids
```

校验：view恰好三个，id唯一，bounds有限合法west<east/south<north，与§3.4一致；point坐标有限合法，0/0不是缺失。collection id、occurrence id原样保留，每个collection只一个符号；occurrenceAges非空，older/younger有限非负且older>=younger，允许单值；sources/basis不可省。不同occurrence区间不得取外包络填空档。point、card、frame、chapter、term、preset、layer共用既有全局ID注册校验；index与hl必须引用存在对象。只有全局point/card进入本题highlight，旧主题引用校验不变。`ReferenceCard`为strict且没有任何坐标字段；linkedCountryFeatureId不能用任意land几何冒充国家面。

生产顺序固定：读两个原始快照→按occurrence_no稳定去重→排MY→按collection_no聚合。坐标冲突或非法年龄报明确错误，不以“最后一条赢”合并；缺坐标等排除原因计入整理日志。公开候选作校验基线，不部署原始CSV、原始MY ids/经纬度或可逆精确定位字段。发布数据递归拒绝MY fossil points和MY card的at/geometry/coordinates/centroid字段；suppression必须与原料日志相符：当前3 collections / 3 occurrences。彭亨仅有一张区域卡，卡片不算一个化石collection。[F034,DE006]

筛选绑定：q=selectedMa；window=[max(0,q−5),q+5]，按[younger,older]闭区间判断：`older>=windowYoung && younger<=windowOld`。任一occurrence相交即显示该collection；不是把动物生存期当作区间。all-mesozoic绕过浏览窗、只显示所选数据集，不更改所选时间；标题固定“跨中生代的发现地；并非同时生存”。age-window标题写“年龄范围与…有交集”。`fossils-modern`关闭只隐藏化石符号，不隐藏参考点/卡；insetVisible关闭不清view/mode/所选卡。时间窗令选中的化石不可见时清该选择及相应hl；不为高亮而偷偷绕过过滤。reference与cards不受年代过滤、不计化石数。

UI绑定：modernInset存在时注册现成card/cardToggle（不受零实体参与卡条件限制），内容为现代发现图；没有modernInset仍沿用原参与卡条件。现成controls注册三视图、显示开关、fossilMode；不新增键盘字母，与按钮共用store。SVG点可点/键盘选；密集点有≥44px命中目标与等价可聚焦列表（列表窗口化，非同时堆1274个按钮）。碰撞只作显示聚合，不改数据collectionsTotal；放大列表能逐点打开。选中详情进入现有inspector：现代位置/精度、逐条年龄区间、依据及文献。区域卡显示region-only/country-only，不能暗示古地理锚点。index点击显示对应卡/点；若化石点在窗外，先显示“该记录在当前浏览窗外”及显式切换全部记录操作，不能暗切模式。ESC按既有宿主规则关闭来源/选中。全部显示文本双语。

演示：每拍除了地图要有可见的证据变化；高亮point出inset引线，高亮card出具名证据卡及现代国家高亮（如有），都避让字幕。窄屏仍能看到本拍证据，不能只留一幅空古地图；点证据不翻拍。保存/退出演示恢复inset/view/mode/hl，复用现有presentation save/restore；不另造计时器。

### 4.3 E-DE3：精确Ma与URL接线

`topic.maDigits?:0|1|2|3`，仅地质TimeScene可用；本题3，其余默认2且输出不变。复用既有`fromNumber(n,'ma',{maDigits})`，把选定精度传到拖动提交、URL规范化与所有Ma格式化入口。英文显示至多3位且去尾零；中文主读数同样附精确`… Ma / 百万年前`（如`251.902 Ma / 251.902百万年前`），正文仍用自然的亿/万和“约”。不把251.902显示成251.9或2.52亿而丢掉精确信息。schema/URL拒绝NaN/Infinity/负Ma/转换后溢出；本题所有control/chapter/beat/eventAge/age range均同一Ma标尺，不能混ISO日期。边界表误差是S01数据，不能复制到每个化石年龄区间。

| URL | store字段 / 恢复规则 |
|---|---|
| 现有`t=<n>ma`、`hl`、`cam`、`layers` | 复用编解码与URL差异基线；t有限，q超[0,250]先clamp，再按maDigits量化；hl只留合法对象。主图边界不能因此扩展。 |
| 现有`b=1..N` | TimeSceneExt补`beat:number|null`，接现有core `beat`/`b`，不造第二拍参数。无b保留既有“章自身state”深链行为；有b应用章目标⊕指定拍；显式t/cam/layers/hl/inset字段优先于拍。范围外b忽略。点章/刻度按现有applyBeatState应用并写b；自由拖年代清beat为null，防刷新被拉回旧拍。 |
| 新`inset=world|southeast-asia|mexico` | store.inset；缺省取拍/章/主题默认；非法值丢弃，不覆盖有效默认。 |
| 新`inset-visible=0|1` | store.insetVisible；隐藏仍保留view，刷新后重新开启回原view。 |
| 新`fossil-mode=age-window|all-mesozoic` | store.fossilMode；显示与筛选严格同一值；非法丢弃。 |

接线位置按docs/06：UrlEngineFields、URL_KEY_ORDER/编解码、SceneHost字段转交、TimeSceneExt/defaults/fromChapterState/fromUrl、拍applyState/save/restore/urlBaseline、View读取与commit。新字段只在相关主题序列化；相等目标值省略，未知utm等query保留。深链恢复hl中首个可见point/card为selectedObjectId，其他只高亮；UI最后点击对象为选中，URL无需另加selected字段。Ma不能写成ISO年份或自动日期。

### 4.4 输出、测试API与可复现数字

复用现有`__atlas.ready`、`state()`、`beats()`、`goToBeat(globalIndex,{instant:true})`、主题/模式/镜头API。仅新增`__atlas.engine.geology()`读数，供测试断言实际所画结果，而非重新算一份输入：

```ts
{
 reconstruction:{selectedMa,frameId,frameMa,deltaMa,modelId,geometryMeaning,
   status,geometryUpdates},
 inset:{coordinateSpace:'modern',view,insetVisible,fossilMode,
   queryWindowMa:[number,number]|null,
   fossilsTotal,fossilsVisible,fossilsInView,ageOverlapCount,
   referencePointsTotal,referenceCardsTotal,
   suppressedCollections,suppressedOccurrences,
   highlightedObjectIds:string[],selectedObjectId:string|null}
}
```

`fossilsTotal`是所有公开collection数；`ageOverlapCount`总是按当前±5窗口独立计算；`fossilsVisible`是view裁切前、经mode及图层开关后候选数；`fossilsInView`是这些可见候选中坐标在当前bounds的数。隐藏整个inset只改insetVisible，保留内部计算，避免把隐藏误读为没有资料。卡片/参考点不计入任一化石数。queryWindowMa在all-mesozoic为null。frameMa是屏幕实际已载的帧，loading不能报告未来帧ready。

| 单测 / 数据fixture | 输入 | 必须输出 |
|---|---|---|
| 既有Ma数值复用 | toNumber({ma:200})；fromNumber(-251902000,'ma',{maDigits:3}) | -200000000；{ma:251.902} |
| frameAt与端点 | q=250,230,201.4,150,66,65,32.5,0 | frameMa=250,230,230,150,70,65,65,0；66的Δ=4，32.5的Δ=32.5 |
| 精度与URL | parse/format 201.4ma、143.1ma、251.902ma；formatter独立于topic clamp | 字符串无损；EN251.902 Ma；ZH精确251.902百万年前；真实topic的251.902ma输入clamp250ma |
| 闭区间 | synthetic A=[75,65],B=[90,80],C=[66,66]，q=70 | window[65,75]；2 collections（A/C）；q=80→[75,85]，2（A/B），边界算相交 |
| 不合并空档 | 一collection两个区间[145,140]与[100,95]，q=120 | window[115,125]，0；q=140或100各1，详情保留两个区间 |
| 去重与聚合 | 同一occ重复两次；同collection另一个occ | 2条唯一occ、1 collection；不同collection同坐标仍2 collections |
| 关闭图层 / 隐藏图 | 上述A/B/C，q70；关fossils-modern；再隐藏inset | total3 / overlap2 / visible0；hidden不改total/overlap/view；再开恢复visible2 |
| references | 无化石命中，有2points/4cards | visible0；referencePointsTotal2、referenceCardsTotal4；卡可选 |
| MY抑制 | synthetic MY两collection三occ，TH一collection一occ | 发布total1；suppressedCollections2/Occurrences3；发布MY精确字段0 |
| 当前真实快照 | 原料→稳定去重→排MY→聚合 | union2106，排3occ/3collections，公开2103occ/1274collections；collection24178=3occ且年龄各121.4–100.5[DE005,DE006] |
| 网格实检 | K250/K0/K70/K100 | rows64800/65341；K70零值3023；K0 seam land-sign差6、K100差25，不能被“修复”成0[DE007] |
| schema错误 | NaN、Infinity、日期混Ma、重复帧、unknown source、MY at、index/hl悬空 | 每项明确构建失败；非法URL忽略，不崩溃、不请求外部源 |
| URL与拍 | ?ch=impact-boundary&b=2&t=66ma&inset=mexico | beat第2拍，selected66 / actual70 / delta4 / mexico / impactAge66；reload相同，无自动翻拍 |
| 竞态 / 失败 | 请求70后请求65，70迟到；65加载失败 | 不能被迟到70覆盖；显示unavailable、不出现现代或旧岸线冒充65 |

以上合成数字标TEST/DESIGN，不进入学生自然事实。按现有vitest / Playwright写有意义的纯函数与集成用例，不引新依赖。

### 4.5 shoot / e2e / 性能契约

- `scripts/validate-content.ts`与引擎schema/loader必须实际读取新清单和子文件，核source、ID、文件、坐标空间、章拍绑定及topology；只在YAML加字段而不纳入构建校验不算完成。
- `scripts/shoot.ts --beats`现仅按TimeScene `.ts-co`核高亮，须把现代inset引线和具名证据卡的`data-id`纳入同一高亮检查；不把缺标注降为忽略。给现代卡/小图加`data-hud-panel`做layout检查，新增TimeScene b的整页重载对比。新逻辑只对存在modernInset的主题启用，旧主题行为保持。
- e2e涵盖两语言、两theme、35拍及其b深链、66→70/65→65、逐occ区间、MY不发布、modern/ancient不混、切view不改主camera、隐藏/刷新/再开启、列表键盘操作、ESC/来源、演示恢复、窄屏证据仍可见、断网本地加载。检查失败时浏览器network中没有现代主图fetch；NE请求仅为小图文件。
- 部署地图矢量合计≤2MB（不是原料23MB）；十帧分开按需载入、同时解码至多3帧；首次JS≤400KB gz，SVG复用现有d3-geo，不开第二MapLibre、不加依赖。首帧ready后同frame拖动不上传几何；geometryUpdates只在帧实际改变时增加。
- 在目标iPad / 真GPU记录预算：同帧年龄筛选p95≤16ms，缓存帧切换p95≤50ms（不含网络读取）；静止不跑额外rAF或每帧分配collection数组。记录设备、尺寸、字节、测量方法，不用SwiftShader数字冒充真机fps。超预算先简化源、缓存区间索引或窗口化列表，不能删事实/偷偷加预算。
- 引擎完成后更新docs/06、新增sample夹具、补本spec§9施工记录（实际实现、变更、测试、已知限制）；本轮§9保持空白。

## 5. 名词表 EN / ZH（15项）

中文均为§0.1-D11的编辑用词，不标新加坡课本规范。`term-`前缀避免与章节、帧及对象重名；各语言仅首次出现包`<Term>`。定义显示为双语，以下为施工释义，按同一事实范围独立写英文。

| id | EN / ZH | 定义范围与来源 |
|---|---|---|
| term-ma | Ma / 百万年前 | 过去的时间以百万年计；例如66Ma表示6600万年前，不是公历年。[F001,F019] |
| term-mesozoic | Mesozoic / 中生代 | 包含三叠纪、侏罗纪、白垩纪；年代范围按S01版本。[F001] |
| term-triassic | Triassic / 三叠纪 | 本表三个纪中最早的一个；250Ma是其内样本，不是开始。[F001,DE003] |
| term-jurassic | Jurassic / 侏罗纪 | 位于三叠纪之后、白垩纪之前；与250Ma不同年代。[F001] |
| term-cretaceous | Cretaceous / 白垩纪 | 中生代最后一个纪；末界约66Ma。[F001] |
| term-pangaea | Pangaea / 盘古大陆 | 多块今天分开的大陆过去相连构成的超大陆；之后逐渐分裂。[DE002] |
| term-palaeogeography | palaeogeographic reconstruction / 古地理复原 | 用证据与模型重建过去的水陆格局；不是远古照片。[F039] |
| term-fossil | fossil / 化石 | 保存在地质背景中的过去生命证据，包括身体与活动痕迹。[F003] |
| term-collection | collection / 采集记录组 | PBDB把有地理联系的化石资料汇成collection；范围可不同，不一定等于一只动物或一次发掘。[F036] |
| term-occurrence | occurrence / 化石出现记录 | 资料中某类化石在一个collection里的记录；同collection可有多条。[F036] |
| term-age-range | age range / 年龄范围 | 发表资料给出的较老与较年轻年龄界限；不是已知死亡日期或在两端之间一直生存的证明。[F036,DE005] |
| term-non-avian | non-avian dinosaur / 非鸟类恐龙 | 在本题中指鸟类之外的恐龙，不能把现生鸟排除出恐龙谱系。[F017,F019] |
| term-extinction | extinction / 灭绝 | 某一谱系不再有存活成员；白垩纪末鸟类有幸存谱系，所以不能说所有恐龙灭绝。[F017,F019] |
| term-asteroid | asteroid / 小行星 | 本章讨论撞击地球的小天体；概念图不复原其真实外形或比例。[F021,DS03] |
| term-chicxulub | Chicxulub crater / 希克苏鲁伯陨石坑 | 与白垩纪末撞击相关的坑址，今天在墨西哥；地图定位点不是坑轮廓。[F020,F021,DE001] |

## 6. 来源（运行时S#与核查记录）

下面列本题实际保留的来源，不照搬父档案全部书目。`sources.json`每条含title、publisher、url、accessed=2026-10-27、具体定位及本题采用范围；下载快照日期另写2026-10-26，不混成访问日。事实编号沿用父档案与DE扩展；同一个网页只一个运行时来源，DE-S03/07可作为S29的文件级审计定位别名，不重复抓网络。原文没有直接引句；外部链接仅供读者主动打开，不在运行时fetch。

| id | 来源与直达链接 | 采用范围 / 定位 |
|---|---|---|
| S01 | ICS，[2026/06国际地层表](https://stratigraphy.org/ICSchart/ChronostratChart2026-06.pdf) | 单页中生代栏、数值及图下注；251.902±0.024、201.4±0.2、143.1±0.6、66.00Ma。只转录事实表，不打包整张PDF。 |
| S02 | NPS，[How Fossils Form](https://www.nps.gov/subjects/fossils/how-fossils-form.htm) | Introduction / Odds：身体与活动证据、保存偏差。 |
| S05 | AMNH，[How do we know how long ago dinosaurs lived?](https://www.amnh.org/explore/videos/dinosaurs-and-fossils/how-do-we-know-how-long-ago-dinosaurs-lived) | 相对地层年龄段；本题不复制同位素全过程。 |
| S58 | Utah Geological Survey，[Rock Dating](https://geology.utah.gov/map-pub/survey-notes/rock-dating/) | Superposition及未受扰动前提；补地层图说明。 |
| S07 | NHM，[Dinosaur evidence and reconstruction](https://www.nhm.ac.uk/discover/what-can-scientists-learn-about-dinosaurs-and-how.html) | 骨骼、足迹、软组织等不同证据与推断限制。 |
| S08 | AMNH，[Ask a Scientist About Dinosaurs](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-dinosaurs) | 问题9鸟属于兽脚类 / 恐龙；不采用该页其他旧数字。 |
| S11 | NHM，[How an asteroid ended the age of the dinosaurs](https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html) | 66Ma、非鸟恐龙与鸟类存活；该页坑径与S13不同，不用于本题尺寸。 |
| S12 | Schulte等，Science2010，[论文摘要PubMed](https://pubmed.ncbi.nlm.nih.gov/20203042/)；[实际取得的Europe PMC原摘要接口](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:20203042&format=json&resultType=core) | 全球喷出物及灭绝对应；旧65.5Ma不采。只声称取得原摘要，不冒充读完全篇。 |
| S13 | Chiarenza等，PNAS2020，[论文DOI](https://doi.org/10.1073/pnas.2006087117)；[实际取得的Europe PMC全文XML](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC7382232/fullTextXML) | 开篇约10km、坑约180–200km；Significance / 模型结果；条件性结论归作者。 |
| S15 | Schoene等，Science2019，[作者机构公开稿](https://timslab.princeton.edu/sites/g/files/toruqf2276/files/schoene-2019-science.pdf) | 摘要、讨论：德干喷发与界线的年代关系；不搬精确喷发脉冲数值。 |
| S51 | Sprain等，Science2019，[原摘要](https://pubmed.ncbi.nlm.nih.gov/30792301/) | Abstract末尾：影响气候的气体释放与岩量未必直接对应。 |
| S17 | NUS LKCNHM，[Biodiversity Gallery](https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/) | Highlights: Dinosaurs；馆藏分类与展出，仅事实改写，不复制照片。 |
| S57 | NUS LKCNHM，[Emanuel Tschopp访谈](https://lkcnhm.nus.edu.sg/interview-with-an-evolutionary-paleobiologist-dr-emanuel-tschopp/) | Research work in LKCNHM：Dana Quarry、Ten Sleep、Wyoming、Jurassic Morrison；替代大PDF。 |
| S20 | Shibata等，PLOS ONE2015，[Sirindhorna原始描述](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0145904) | Abstract / Geological setting / Locality and horizon；早白垩世、呵叻府、Khok Kruat；不下载图。 |
| S21 | Allain等，2012，[Ichthyovenator原始摘要](https://pubmed.ncbi.nlm.nih.gov/22528021/) | 早白垩世老挝与部分相连的头后遗骸；不补完整头骨。 |
| S22 | JMM / Masatoshi Sone，[Dinosaur Di Malaysia?](https://www.jmm.gov.my/ms/syarahan-umum-dinosaur-di-malaysia) | 研究者讲座摘要，彭亨牙齿与保密保护；网页活动日期不当作化石年龄。 |
| S24 | Peters & McClennen，[PBDB API论文](https://www.cambridge.org/core/journals/paleobiology/article/the-paleobiology-database-application-programming-interface/4D20F5CAFA1B0AC7033975418668D82B) | PBDB Data Model；DOI10.1017/pab.2015.39，2016卷。旧许可不覆盖本题新快照声明。 |
| S29 | Scotese & Wright，[PALEOMAP PaleoDEM v2](https://zenodo.org/records/5460860) / [官方API元数据](https://zenodo.org/api/records/5460860) | Description、米制高程/水深、1°格网、CC BY4.0；源说明提117个模型，下载nc归档实为109成员，两者不偷换。 |
| S31 | Natural Earth，[Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) | 公有领域声明；只有现代位置参照。无需点击接受条款。 |
| S52 | AMNH，[150 Million Years of Dinosaur Evolution](https://www.amnh.org/explore/videos/dinosaurs-and-fossils/150-million-years-of-dinosaur-evolution) | 文字稿Late Triassic约230Ma；不复制该片“全部发现”的覆盖范围说法。 |
| DE-S01 | LPI/USRA，[Chicxulub locator](https://www.lpi.usra.edu/science/kring/epo_web/impact_cratering/World_Craters_web/northamericacraters/Chicxulub.html) | Latitude/Longitude；度分转十进制度，21+20/60=21.333333，−(89+30/60)=−89.5。旧64.98Ma、170km不采用。 |
| DE-S02 | USGS，[What was Pangea?](https://www.usgs.gov/faqs/what-was-pangea) | 开篇大陆相连与分离；不据文字手画岸线。 |
| DE-S03 / DE-S07 | S29同发布的原始ZIP与十份CSV；[下载源](https://zenodo.org/records/5460860/files/PaleoDEMS_long_lat_elev_csv_v2.zip?download=1) | 本地INVENTORY、keyframes-csv.json、源CSV、verify-prefetch.py。CRC/SHA与边界审计属于取得的原数据，不借网页介绍填数。 |
| DE-S04 | Natural Earth，[50m countries固定ZIP](https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip) | v5.1.1，SGP DBF LABEL_X/Y；world land见[110m固定ZIP](https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip)。 |
| DE-S05 / DE-S06 | PBDB贡献者，[API数据入口](https://paleobiodb.org/data1.2/occs/list.csv)；精确两条执行查询见§3.1 | 带datainfo的固定CSV元数据和行，本轮本地复读/重算；当前web工具请求失败不影响已取得固定快照，禁止把后来的可变查询计数混入2026-10-26数据。 |

删除项原始来源只作审计追溯，不进运行时：F010–F012 [NIST](https://www.nist.gov/how-do-you-measure-it/how-do-you-know-age-fossils-and-other-old-things) / S05；F016 [AMNH](https://www.amnh.org/explore/ology/paleontology/beyond-t-rex)；F018 [NHM](https://www.nhm.ac.uk/discover/what-were-the-first-birds-like.html)；F024 [Cox & Keller作者页](https://brenhinkeller.github.io/publication/2023-09-29-Cox-Keller-2023)；F025 [Keller作者页](https://gkeller.princeton.edu/publications/cretaceous-extinctions-evidence-overlooked)；F029 [馆方旧博客](https://rafflesmuseum.wordpress.com/2012/04/25/welcome-twinky/)；F037 [PBDB指南](https://escholarship.org/content/qt9gg7n69f/qt9gg7n69f.pdf)；F038 [模型清单](https://gwsdoc.gplates.org/models/)；F040 [PaleoAtlas v3](https://zenodo.org/records/10596610)；F044 [MOE Science](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx)；F045 [MOE Social Studies](https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf)；F052 [Morgan等综述](https://www.nature.com/articles/s43017-022-00283-y)。这些链接不表示本轮核实了删除主张。

## 7. 图像（仅本题已审图）

三张均取 `/Users/gavin/work/atlas/art/planned/dinosaur-earth/`，本轮已逐张看图，记录与manifest.jsonl相符；不新生成、不借父题骨架图、不将生成图用于古地图。细石墨线、排线点描、灰度、透明底；paper/cinema使用项目既有图像处理与混色。后续用 `scripts/illustrate.ts` 生成首页800/1600px WebP及现成章节figure处理，不另安装依赖。

| 源文件 | 使用 | Caption EN / ZH、alt与事实边界 |
|---|---|---|
| dinosaur-earth.png | 封面；1024×1024原图 | “A generic footprint illustration, not an identified specimen.” / “通用足迹示意，并非已鉴定标本。” alt同义；一个岩板、一个足迹、三个向前趾印为设计计数[DS03]。不标物种、真实尺寸或发现地；活动痕迹概念[F003,F014]。首页alt按现有引擎取主题标题。 |
| dinosaur-earth-reading-strata.png | 01细看；1536×1152原图 | “Schematic rock layers: in an undisturbed, unreversed sequence, lower deposited beds are older.” / “地层示意：在未扰动、未倒转的沉积序列中，下方沉积层更老。” alt为五层岩块；五个主要层是画面设计[DS03]，不由层厚推年龄、不称真实K–Pg剖面[F009]。 |
| dinosaur-earth-impactor.png | 06细看；1536×1152原图 | “A conceptual asteroid; its exact shape is not reconstructed here.” / “小行星概念图；这里没有复原撞击体的准确外形。” alt同义；一个天体，无火焰、轨道或多余碎块[DS03]；正文尺寸引S13，不能从图测量[F021]。 |

图注、alt及figure标题双语。尺寸是源文件像素元数据，不是科学尺寸。图注不把画面变成标本照片、科学扫描或证据。原manifest的F016标签不自动继承为本题分类主张（§0.3已cut），以本节caption为准。

## 8. 施工与验收

规格本轮只交本文件；下列是施工后的发布门槛，未执行的不得打勾。本轮已完成资料、源网页与数值复核、代码核对、三图目视；没有运行会生成其他工作树文件的项目build/shoot，也没有把规格自查冒充应用验收。

- [ ] 引擎先落实E-DE1–E-DE3与合成fixture；地图先K250/K0与现代小图，源—成品并排目视后扩至十帧。背景、01、06作为正文模板，核年代/坐标空间后铺35拍。
- [ ] 主题状态按开头规定；`id:dinosaur-earth`、双语title “Dinosaur Earth / 恐龙时代的地球”、subtitle “Moving continents, fossil finds and the boundary at 66 Ma / 移动的大陆、化石发现与6600万年前的界线”。无年级UI、无未定稿占位、无TODO/死代码/console噪声。
- [ ] 28 verified / 3 changed / 16 cut按§0.3落实；cut内容没有偷偷回正文；新添数字必须先取得来源并更新事实表。F027只引可读HTML；所有事实标签、正文数量Num、sources与glossary/TopicLink解析有效。
- [ ] 十帧实际数字年龄、版本、许可与输入哈希可追溯；250/200/65不沿用旧文件名时期。每帧原格网/成品并排，环检查zero-area=0、self-crossing=0；掩膜与切口边不算海岸，K0接缝缺陷没有被无记录地焊平。
- [ ] 任意所选时间主图都不加载现代陆地/国界/国名；含首帧、theme切换、失败与竞态。66→70与Δ4、65→65、0→同模型0；无66伪重建、无连续漂移动画。失败有双语可读状态。
- [ ] 现代图持续标“今天”；all-mesozoic持续标不同年代，区域卡年龄与背景年龄分列。全球有界资料不称完整、不比较国家数量、不画迁徙推断；collection和occurrence没有混计，年龄交集不误作生存时长。
- [ ] MY精确位置不进任何发布JSON/CSV/页面/构建资源；3collections/3occ抑制日志齐全。彭亨无点/假半径；新加坡是现代label anchor，非挖掘点/馆址；坑址近似现代定位，非古坐标或坑轮廓。
- [ ] 遵守docs/08 §2：底部仅章拍轴；次级读数进左PLATE；选中详情在章头/节拍后、正文前；所有正文point/card从index可点。背景无正式编号/时间轴分段；点章和拍不自动播放；P从当前拍开始，退出恢复。
- [ ] 35拍EN/ZH字幕、两theme、三视图、年龄筛选、深链覆盖；所有高亮的inset引线/证据卡确实可见且已计入shoot检查。1024×768与390×844手指可点≥44px、不依赖hover，标签与字幕不压叠；窄屏仍可读样本年龄和当前证据。
- [ ] 纯静态、零运行时外部请求、离线全本地；署名、许可族、变更记录可从来源入口查看。矢量≤2MB、首屏JS≤400KB gz、其余性能按§4.5有实测记录；不把原料包打入站点。
- [ ] 项目硬门槛全绿：`pnpm check`、`pnpm validate`（0 error/0 warning）、`pnpm test`、`pnpm build`、`pnpm e2e`（先build）。本题与sample-time/既有历史主题Ma以外URL和默认底图回归通过。
- [ ] build后 `pnpm shoot dinosaur-earth --locale all --theme all --layout --keys --beats` 并逐图实看；高亮未标清单、chapter highlights、console/pageerror/外部请求均空；另以常规 `pnpm shoot dinosaur-earth` 留章节与hero-clean图，真GPU性能检查记录设备。
- [ ] 最终记录源/派生数据、章节/拍数、实际E-DE实现、全部测试及任何偏离到§9；没有把未测项写为通过。§8全绿后直接published。

## 9. 引擎记录（施工后填写）
