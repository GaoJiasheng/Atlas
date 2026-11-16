# 73 · 丝绸之路（汉到元，陆海） · 内容施工 spec（v1 草案，待 Gavin 定稿）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写，结构照 docs/59（郑和）；地图做法照 docs/43（古文明：Cliopatria 近似版图、区域图版、`colorBy: entity`、`datedLayers` 势力范围、跨公元前后 E1）与 docs/27（区域图版、`certainty: approximate`）。**本轮只出 spec：没有写代码、没有改其他文件、没有下载任何数据集、没有 commit。** §0.1 的代定项按 Gavin 惯例给了默认值，他可以逐条推翻；`status: draft` 直到 Gavin 读完 §7 的敏感段落。

- slug：`silk-road`；title EN **The Silk Roads** / ZH **丝绸之路**；shortTitle EN **Silk Roads** / ZH **丝绸之路**；subtitle EN **Routes by land and sea across Afro-Eurasia, 2nd century BCE – 14th century CE** / ZH **亚欧非大陆的陆路与海路（公元前2世纪—公元14世纪）**。
- `subject: history; mode: time; engine: time-scene; stage: geo; theme: paper; sensitivity: open; status: draft; tags: [beyond-syllabus]`；`colorBy: entity`；`datePrecision: year`；时间轴 `-0138` → `1368`（跨公元前后，自动走 docs/43 E1 的 `mixedEra`：公元 1–999 年写 "150 CE / 公元150年"）。
- 范围（Gavin 已定）：**汉到元，陆海都讲**。公元前 2 世纪（张骞出使）到 14 世纪蒙古帝国后期（1368 元朝退出大都、明朝建立）。海上丝路单独 **2 章**（02、07），讲到郑和之前为止；1405 年以后链接 `zheng-he`，不重复。
- 本文的事实 id 用 `SR-F##`，来源 id 用 `P##`（施工时转成 `sources.json` 的 S#）；**✓ = 本轮读到原文或可靠页面；◐ = 只读到二手转述，施工 F 步要换成一手 / 学术来源；⚑ = 本轮未读，凭已知文献列出候选来源，施工 F 步必须读到再写**。进正文的数字一律要在 F 步落到 ✓。

---

## 0. 决定与事实复核

### 0.0 默认决定（施工按此做，除非 Gavin 推翻）

| # | 默认决定 | 理由 / 限定 |
|---|---|---|
| 1 | **背景章 + 10 章，每章 5 拍，背景 4 拍，共 54 拍**（§1） | 1,500 年、陆海两线、十几个政权；比古文明（8 章）多两章，但每章只讲一个时段一件事 |
| 2 | **章节严格按首拍时间排序；两个海上章按开始年份穿插**：02 季风之海（首拍前 111）排在张骞之后，07 港口与商埠（首拍 971）排在巴格达之后、蒙古之前 | docs/10 硬规则"章节顺序 = 时间顺序、首拍不递减"。海上章各跨几百年，拍晚于下一章开始是允许的（docs/10 "章节在时间上可以重叠"）。备选：两章海路都放末尾——违反首拍不递减规则，不建议 |
| 3 | 视角：汉、匈奴、月氏 / 贵霜、帕提亚、罗马、萨珊、粟特、突厥与回鹘、吐蕃、唐、阿拔斯、印度诸港、东南亚（室利佛逝、淡马锡）、宋、蒙古四大汗国、马穆鲁克、热那亚 / 威尼斯商人。**中国是其中之一**：张骞一章同等写匈奴、月氏的利益；"丝路"不是中国一端出发的单向箭头 | CLAUDE.md 历史立场 |
| 4 | 交流写成**双向**：西来的马、葡萄、苜蓿、玻璃、金银器、佛教、景教、摩尼教、伊斯兰教；东去的丝、纸、瓷、印刷、火药；双向的疾病（鼠疫）、技术（养蚕 552 年传到君士坦丁堡）、奴隶贸易 | 不写"中国把文明传出去" |
| 5 | **"丝绸之路"这个名字**：背景章第一段讲——李希霍芬 1877 年让这个词出名，但 Mertens 2019 查到德语 *Seidenstraße* 更早已有人用；当时的人没有这个统称，路是很多条 | SR-F01–F02 ✓ |
| 6 | **底图 = 复用古文明的旧大陆区域图版** `public/geo/ancient-world-plate.json`（NE 10m，公有领域，438,534 bytes，已在仓库）；`bounds [-12, -12, 135, 58]`（伊比利亚到朝鲜半岛、不列颠 / 巴黎到爪哇）；**零新陆地文件** | 文件已过 0 / 0 环检查；图版外由纸边覆盖。咸海、里海形状须 V2 核对（§4.3） |
| 7 | **河流新建** `public/geo/silk-road-rivers.json`，**只用 NE 10m**（公有领域）：阿姆河、锡尔河、泽拉夫尚河、塔里木河、伊犁河、伏尔加河、顿河、底格里斯河、幼发拉底河、印度河、恒河、尼罗河、渭河、长江、黄河（**只取兰州—郑州段**：今下游是 1855 年后的河道，本主题时段内全错，不画）| 不复用 `ancient-rivers.json`（含 CC BY-SA 古黄河，会把例外许可带进来）；NE 里没有的河不画 |
| 8 | **政权范围 = Cliopatria v0.2.1（CC BY 4.0）**，14 个控制区关键帧（§3.3），全部 `certainty: approximate`（虚线分界、淡底）；只画正文讲到的政权；其余留白，阅读说明写"空白不是无人" | 与古文明同源同法；Cliopatria 作者自己说只是"一种版本" |
| 9 | **东南亚 = 复用古文明的势力范围层** `ac-srivijaya`、`ac-majapahit`（Cliopatria，已在仓库），不重画 | 室利佛逝、满者伯夷是曼荼罗体系，画成可重叠势力范围 |
| 10 | **路线不描任何地图**：按**一手文献的站点表**（《汉书·西域传》南北道、伊西多尔《帕提亚驿程》、贾耽"广州通海夷道"、裴哥罗梯《通商指南》的 Tana—契丹路程等）把有坐标的站点按原文顺序连线；陆上站点之间直线，海上由管线在 NE 海域上自动求最短路（§3.4）。阿拔斯时代路网直接用 **al-Thurayya（CC BY 4.0）** 的路段几何。全部画成 `datedLayers kind: line`、`certainty: approximate`（虚线，需引擎 E-SR1）| 硬规则"禁止随手画"：站点来自数据集，顺序来自原文，连线方法可复现、写进 SOURCES；字幕与图例一律写"站点有记录，站点之间的线是示意" |
| 11 | **人物旅程**（张骞、法显、玄奘、鲁布鲁克、马可·波罗、拉班·扫马、伊本·白图泰）画成 `movements`（`linger` 留到下一章），站点 = 其行纪 / 传记明确写到的地方；**认定有争议的地名不当站点**（如大夏都城、"石塔"、黄支） | 人物旅程是"一条走过的路"，与路网不同；用现有 movements |
| 12 | **鼠疫传播 = 带日期的 `disaster` 点事件**（各城首见年份，来源逐条）；**不画**传播等时面 | Commons 上唯一像样的等时图（Flappiefh，CC BY-SA 4.0）若描摹就要 LICENSE-CONTENT 例外，且依据单一学者的年表；见 §0.1-6 |
| 13 | 沉重内容讲事实与数字、不回避，用词克制：战争（汉—匈奴、大宛之战、卡莱、怛罗斯、安史之乱、蒙古征服、巴格达 1258）、奴隶与奴隶贸易（吐鲁番 639 年契约、僧祇人起义、蒙古掳掠工匠、黑海奴隶贸易与马穆鲁克）、屠杀报告（广州 878/879、梅尔夫与内沙布尔）、鼠疫与 1348–49 年欧洲对犹太人的屠杀。**同类同标**（§2.4）：哪一方做的都用同一种事件标记、同一种写法 | CLAUDE.md；§7 敏感段落清单 |
| 14 | **新加坡 / 东南亚**：按史料分量写——海上一章讲马六甲海峡与室利佛逝（链古文明）、贝利通沉船（藏于亚洲文明博物馆）；07 章末拍讲 1349 年汪大渊记的"单马锡"与福康宁考古；**山尼拉乌他玛的故事只作"《马来纪年》里的传说"一句 + 链接**，不重讲 | 已有 `singapore-1819-1965` 背景章 |
| 15 | 不做：测验、配音、视频、人物肖像、神像与宗教符号的图、钱币与带文字的器物图、旗帜、今天的国界；不做运费 / 行程速度模拟；不画罗马道路网（Itiner-e 可选，§0.1-7） | |
| 16 | 图像：**封面 + 8 张章图**（§6），全部新画，交 Codex，按 §6 的禁止项和验收标准逐张看 | 已有古文明 / 郑和的图不代表本题器物 |
| 17 | 内容许可：内容家族 CC BY-NC-SA 4.0；发布的地理数据只由 PD / CC0 / CC BY 来源派生（NE、Wikidata、Pleiades、Cliopatria、al-Thurayya）；**本版不引入任何 CC BY-SA 或 ODbL 几何**，LICENSE-CONTENT 不需要新例外 | CC BY-SA 不能并进 NC-SA 文件（§3.6） |

### 0.1 代定项（要 Gavin 拍板；默认值已写进本文）

| # | 问题 | 默认 | 备选与代价 |
|---|---|---|---|
| 1 | 章节数 | 背景 + 10 章、54 拍 | 合并 03「四个帝国」与 04「僧人与信仰」→ 9 章 49 拍；代价：佛教东传、摩尼教、粟特古信札挤进一章 |
| 2 | 海上章的位置 | 按首拍穿插在 02、07 | 都放末尾：违反"首拍不递减"，只能让海上章的拍写成"回看"（郑和 03-c 那种），一千年的"回看"读不通，不建议 |
| 3 | 路线画法 | 一手站点表 + 数据集坐标 + 直线 / 自动海路（§3.4），全部虚线 | ①描 Commons 上 Kaidor 的 *Silk Road in the I century AD*（CC BY-SA 4.0）：图本身没有列任何文献来源，且要加 BY-SA 例外，不建议；②只画点不画线（郑和的做法）：最诚实，但"路"这个主题看不出路 |
| 4 | 草原政权（匈奴、西突厥、回鹘、蒙古）要不要填色 | Cliopatria 有记录就照画，`approximate`，阅读说明加一句"游牧政权的范围是控制人群与牧场，不是固定国界" | 只画点（王庭 / 都城）+ 字幕说明；代价：蒙古帝国一章没有范围 |
| 5 | al-Thurayya 路段 | 用（CC BY 4.0，G0 先读 `DATA-LICENSE.md` 确认"路段坐标"属于项目原创数据） | 若 DATA-LICENSE 把 Cornu 图集派生的几何排除在外：阿拔斯路网改为站点法（伊本·胡尔达兹贝赫的路程） |
| 6 | 黑死病传播 | 带日期的城市点（`disaster`），各点来源逐条 | 加 Flappiefh 等时面（Commons，CC BY-SA 4.0，1,962,272 bytes）：单独文件、LICENSE-CONTENT 加例外段、依据 Benedictow 一家年表 |
| 7 | 罗马与帕提亚境内的路 | 只用伊西多尔《帕提亚驿程》站点 | 加 Itiner-e 罗马道路（CC BY 4.0，Zenodo 263.9 MB）的东方行省一段；代价：大下载、与站点法风格不一 |
| 8 | 马可·波罗 | 写，标"按他书中所说"，细看讲真实性争论（Wood 1995 / Vogel 2013） | 不画他的旅程线，只留事件 |
| 9 | 敦煌藏经洞文书被带走 | 中性写法："1907 年斯坦因、1908 年伯希和从王圆箓处购得大批写本，带到伦敦、巴黎；今天这批文物分藏多国，取得方式至今有争议" | 加中英双方机构的说法各一句 |
| 10 | 蒙古屠城数字 | 正文写"波斯史家记下的数字极大，现代史家认为夸大，但大规模杀戮确实发生"，数字放细看并列（各带来源）；**不用 Counter 图标** | 用 Counter：会把有争议的"百万"画成图标，不建议 |
| 11 | 中文用词 | "丝绸之路"作标题，正文可用"丝路"；"西域"首次出现说明"汉代人对玉门关以西地方的称呼"；"景教"写"东方教会（唐代称景教）"；"拜占庭"写"东罗马帝国（后人称拜占庭）"；"金帐汗国"写"金帐汗国（术赤兀鲁思）" | 见 §5 |
| 12 | 图像数 | 封面 + 8 | 去掉 04 莫高窟崖面、06 造纸（各章仍有地图） |
| 13 | 数据下载 | 施工 G0 下载 §3.1 的 D1、D3、D6（共约 56 MB + NE 河湖），Wikidata / Pleiades 按条 API | Gavin 批准后才下载（本轮未下） |

### 0.2 事实复核表（进正文的每条 F 步要到 ✓）

| id | 事实（施工时的写法边界） | 来源（§9） | 状态 |
|---|---|---|---|
| SR-F01 | "Silk Road" 通常归于李希霍芬 1877 年《中国》第 1 卷；他也用复数"丝绸之路们"；Waugh 认为这个"发明"之功被夸大 | P01 | ✓ |
| SR-F02 | Mertens 2019：德语 *Seidenstraße* 比李希霍芬首用早近四十年已出现；不能说他"创造"了这个词，只能说"让它出名" | P02 | ✓ |
| SR-F03 | 张骞约前 139/138 年受命出使月氏，被匈奴扣留十余年，经大宛、康居到月氏、大夏，约前 126 年回长安；出发百余人，"唯二人得还" | P10（《史记·大宛列传》）、P11（《汉书·张骞传》） | ⚑ |
| SR-F04 | 司马迁用"凿空"形容张骞之行——引用时注明是司马迁的话 | P10 | ⚑ |
| SR-F05 | 河西四郡（武威、张掖、酒泉、敦煌）设于前 2 世纪末至前 1 世纪初，具体年份史书与学界有分歧 | P11、P12 | ⚑ |
| SR-F06 | 前 104–前 101 年汉伐大宛求马；《史记》记两次出征的兵力与损失（只用《史记》原文数字，注"《史记》记载"） | P10 | ⚑ |
| SR-F07 | 前 60 年设西域都护 | P12（《汉书·西域传》） | ⚑ |
| SR-F08 | 《汉书·地理志》记从徐闻、合浦出海到黄支等国的航程，汉使"蛮夷贾船，转送致之"——乘外国商船；黄支的今地有争议，不定点 | P13 | ⚑ |
| SR-F09 | 《厄立特里亚海航行记》（约 1 世纪中叶）记船随季风到穆济里斯，丝从"Thina"经陆路到印度 | P20 | ⚑ |
| SR-F10 | 海岛东南亚航海者的大船，3 世纪中国文献已有记载（古文明 F64 已核，链过去） | 古文明 S | ✓（仓库） |
| SR-F11 | 和田玉见于殷墟妇好墓（约前 13 世纪）——汉以前已有东西交换（背景章用；若 F 步只读到维基，删） | P14 | ⚑ |
| SR-F12 | 法显 399 年从长安出发陆路赴印度，412 年经师子国（斯里兰卡）、耶婆提走海路回国 | P21（Legge 1886 译本） | ⚑ |
| SR-F13 | 贝利通（唐代）沉船约 830 年，缝合船板的西亚 / 印度洋式船，载长沙窑等中国货，藏亚洲文明博物馆（数字用 ACM 原文） | 郑和 S8/S9、古文明 F65 | ✓（仓库） |
| SR-F14 | 878/879 年黄巢据广州；阿布·扎伊德·西拉菲称被杀外国人 12 万（马苏第作 20 万）；中国史书不载此屠杀，年代与城名有疑，Rossabi 认为数字夸大 | P30（Mackintosh-Smith 译本）◐ 二手 | ◐ |
| SR-F15 | 前 53 年卡莱之战，普鲁塔克记罗马 2 万人被杀、1 万被俘 | P22（Plutarch, *Crassus* 31） | ⚑ |
| SR-F16 | 卡莱之战罗马人首见丝绸军旗——只见于弗洛鲁斯，晚出，正文**不用**；细看可写"一个流传的说法" | P23 | ⚑ |
| SR-F17 | 老普林尼（约 77 年）说印度、赛里斯、阿拉伯每年从帝国拿走 1 亿塞斯特斯 | P24（*NH* 12.84） | ⚑ |
| SR-F18 | 97 年班超遣甘英使大秦，至条支临海而还 | P15（《后汉书·西域传》） | ⚑ |
| SR-F19 | 166 年"大秦王安敦遣使"自日南徼外献物；史家多认为是商人自称使者 | P15 | ⚑ |
| SR-F20 | 迦腻色伽即位约 127 年（Falk 的年代）；贵霜跨大夏到恒河平原，犍陀罗艺术融合希腊、伊朗、印度风格 | P25 | ⚑ |
| SR-F21 | 萨珊王朝 224–651 年 | P26 | ⚑ |
| SR-F22 | 安世高（安息人）148 年到洛阳译经 | P27 | ⚑ |
| SR-F23 | 莫高窟按 698 年碑记始凿于 366 年 | P28（UNESCO 440） | ⚑ |
| SR-F24 | 鸠摩罗什（龟兹人）401 年到长安译经 | P27 | ⚑ |
| SR-F25 | 粟特古信札：1907 年斯坦因在敦煌以西烽燧发现，312/313 年；第 2 号信报告洛阳被焚（311 年）；一批未送达的信，两封出自女性（米薇） | P03、P04 | ✓ |
| SR-F26 | 摩尼（216–274/277）在萨珊伊朗创摩尼教；回鹘牟羽可汗 762/763 年奉摩尼教 | P29 | ⚑ |
| SR-F27 | 普罗科匹厄斯：约 552 年僧人把蚕卵带到君士坦丁堡 | P31（*Wars* 8.17） | ⚑ |
| SR-F28 | 玄奘 629 年西行（未获准出境），645 年回长安 | P32 | ⚑ |
| SR-F29 | 639 年吐鲁番粟特文契约：女孩优婆遮被卖，买方可"打、骂、捆、转卖"；**买方身份各书说法不一**，F 步读 Yoshida & Moriyasu 1989 / Hansen 2012 定 | P05 ◐ | ◐ |
| SR-F30 | 635 年阿罗本到长安；781 年立《大秦景教流行中国碑》 | P33 | ⚑ |
| SR-F31 | 751 年怛罗斯之战，阿拔斯军与葛逻禄等击败唐军 | P34 | ⚑ |
| SR-F32 | "怛罗斯俘虏把造纸术带到撒马尔罕"出自 11 世纪塔阿利比；Bloom：751 年前撒马尔罕已用纸，此说是后起的故事 | P06、P07 | ✓/◐ |
| SR-F33 | 755–763 年安史之乱；安禄山为粟特与突厥混血；唐户籍人口从约 5,300 万降到约 1,700 万**是登记崩溃，不等于死亡数**（写也要这样写，或不写） | P35 | ⚑ |
| SR-F34 | 吐蕃约 786 年占敦煌（另有 781、787 说，并列） | P36 | ⚑ |
| SR-F35 | 762 年曼苏尔建巴格达 | P37 | ⚑ |
| SR-F36 | 伊本·胡尔达兹贝赫《道里邦国志》（约 870）记拉德汉犹太商人往返法兰克与中国 | P38 | ⚑ |
| SR-F37 | 869–883 年僧祇人（东非被奴役者）起义于伊拉克南部 | P39 | ⚑ |
| SR-F38 | 868 年《金刚经》印本（大英图书馆 Or.8210/P.2），有确切纪年的最早完整印本书 | P40 | ⚑ |
| SR-F39 | 藏经洞约 11 世纪初封闭，1900 年王圆箓打开；1907 斯坦因、1908 伯希和购走大批写本 | P41 | ⚑ |
| SR-F40 | 宋 971 年于广州置市舶司，1087 年泉州置市舶司 | P42 | ⚑ |
| SR-F41 | 2021 年"泉州：宋元中国的世界海洋商贸中心"列入世界遗产 | P43 | ⚑ |
| SR-F42 | 1974 年泉州后渚港宋代沉船，13 个隔舱 | P44 | ⚑ |
| SR-F43 | 1025 年朱罗袭击室利佛逝（古文明已核，链过去） | 古文明 S | ✓（仓库） |
| SR-F44 | 开罗吉尼扎文书记突尼斯犹太商人本·伊居（12 世纪 30–40 年代）往来亚丁与印度马拉巴尔海岸 | P45 | ⚑ |
| SR-F45 | 赵汝适《诸蕃志》（1225）记海外诸国物产 | P46 | ⚑ |
| SR-F46 | 1206 年忽里勒台推铁木真为成吉思汗 | P47 | ⚑ |
| SR-F47 | 1218 年讹答剌守将杀蒙古商队；1219 年蒙古西征花剌子模 | P47 | ⚑ |
| SR-F48 | 志费尼等记梅尔夫、内沙布尔死者数以百万计，现代史家认为不可能，但大规模屠杀属实 | P48 | ⚑ |
| SR-F49 | 鲁布鲁克 1253–1255 年出使，1254 年在哈剌和林见到穆斯林、佛教徒、基督徒及被掳来的巴黎金匠布歇 | P49 | ⚑ |
| SR-F50 | 1258 年旭烈兀攻陷巴格达、杀末代哈里发；死者估计从约 9 万到数十万不等 | P50 ◐ | ◐ |
| SR-F51 | 1260 年艾因扎鲁特，马穆鲁克击败蒙古军；马穆鲁克是被买来训练的奴隶兵出身 | P51 | ⚑ |
| SR-F52 | 1271 年忽必烈定国号元；大都（汗八里）在今北京 | P52 | ⚑ |
| SR-F53 | 马可·波罗 1271 年出发、约 1275 年到忽必烈处、约 1291 年从泉州出海、1295 年回威尼斯；真实性争论：Wood 1995 质疑，Vogel 2013 以货币、盐税细节支持 | P53、P54 | ⚑ |
| SR-F54 | 拉班·扫马（生于大都附近的东方教会僧人）1287–1288 年作伊利汗使者到君士坦丁堡、罗马、巴黎，见法王腓力四世、英王爱德华一世 | P55 | ⚑ |
| SR-F55 | 裴哥罗梯《通商指南》（约 1340）称从塔纳到契丹的路"日夜安全"，列出沿途站点 | P56 | ⚑ |
| SR-F56 | 伊本·白图泰 1345/46 年从苏门答剌须文答剌—巴赛航至泉州 | P57 | ⚑ |
| SR-F57 | 汪大渊《岛夷志略》（1349）记"单马锡""龙牙门"；福康宁出土 14 世纪器物 | `singapore-1819-1965` 已核 | ✓（仓库） |
| SR-F58 | 伊塞克湖附近 Kara-Djigach、Burana 墓地，1338–1339 年墓碑写死于"瘟疫"；2022 年 Spyrou 等从 3 人遗骸测到鼠疫杆菌，推断天山一带本地起源；与 1346 年后大流行的联系是推断 | P08 | ✓ |
| SR-F59 | 1346 年金帐汗国军围卡法时军中暴发鼠疫；"把尸体抛进城"只见于德穆西的记述，Wheelis 2002 认为城中疫情更可能由老鼠 / 船带入 | P58 | ⚑ |
| SR-F60 | 1347 年秋鼠疫到君士坦丁堡、墨西拿、亚历山大；1347–1351 年遍及欧洲 | P59 | ⚑ |
| SR-F61 | 欧洲死亡比例估计 30%–60% 不等（Benedictow 2021 约 60–65%；Jedwab 等 2019 均值约 39%）；正文写区间，两端各自来源 | P09 ◐ | ◐ |
| SR-F62 | 埃及与西亚同遭重创（Dols 1977，开罗） | P60 | ⚑ |
| SR-F63 | 1348–1349 年多地犹太人被诬投毒而遭屠杀，1349 年 2 月斯特拉斯堡 | P61 | ⚑ |
| SR-F64 | 13–14 世纪热那亚卡法、威尼斯塔纳输出黑海奴隶，大批卖给马穆鲁克苏丹国 | P62 | ⚑ |
| SR-F65 | 1368 年元廷退出大都，明朝建立 | P52 | ⚑ |
| SR-F66 | UNESCO 2014："丝绸之路：长安—天山廊道的路网"（中、哈、吉三国联合申报） | P63 | ⚑（UNESCO 页面 403，F 步换镜像） |
| SR-F67 | UNESCO 2023："丝绸之路：泽拉夫尚—卡拉库姆廊道"（塔、土、乌三国，31 个组成部分，约 866 km） | P64 | ✓ |
| SR-F68 | "海上丝绸之路"是近代学者起的名字（与古文明名词一致，不定首创者） | 古文明 S | ✓（仓库） |
| SR-F69 | 伊西多尔《帕提亚驿程》（约公元前后）列从幼发拉底河渡口到阿拉霍西亚的驿站与距离 | P65 | ⚑ |
| SR-F70 | 贾耽（8 世纪末）记"广州通海夷道"沿途诸国，经马六甲海峡、师子国、印度西岸到波斯湾、缚达（巴格达） | P66（《新唐书·地理志七下》） | ⚑ |
| SR-F71 | 当时没有"黑死病"这个名字，时人称"大瘟疫""大死亡" | P59 | ⚑ |
| SR-F72 | 东罗马人自称罗马人，"拜占庭"是后人的叫法 | P67 | ⚑ |

已知差距（不阻塞 spec）：①Cliopatria 是否有匈奴、西突厥、回鹘、吐蕃、喀喇契丹、四大汗国的多边形，本轮无法不下载就核实（PMC 页面挡爬虫，GitHub 页面不列名称）——G0 清点，每个实体都写了"缺了怎么办"（§3.3）。②SR-F14、F29、F50、F61 只有二手。③UNESCO 官网对本机 403。

---

## 1. 章节与节拍

### 1.1 总表

`cam` = `[lng, lat, zoom]`（桌面 1280×720，施工按 `pnpm shoot --beats` 调）。章节 `state.time` = 第一拍 `t`（照郑和）。`layers` 默认 `[base, control, movements, battles, sites]` + 本章路线层 / 势力范围层；**不写 `borders`**（区域图版本来没有）。"帧"= 第一拍显示的关键帧（§3.3）。

| # | id | 标题 EN / ZH | 首拍 t | 默认镜头 | 帧 |
|---|---|---|---|---|---|
| 00 | `background` | Many roads, one later name / 许多条路，一个后起的名字 | -0138 | 全图 | K1 |
| 01 | `zhang-qian` | An envoy to the west / 张骞出使 | -0138 | `view-steppe-china` | K1 |
| 02 | `monsoon-seas` | The monsoon seas, 2nd century BCE – 9th century CE / 季风之海（公元前2世纪—公元9世纪） | -0111 | `view-south-china-sea` | K1 |
| 03 | `four-empires` | Between four empires / 四个帝国之间 | -0053 | `view-iran` | K2 |
| 04 | `faiths-on-the-road` | Monks, merchants and new faiths / 僧人、商人与新的信仰 | 0148 | `view-china-north` | K3 |
| 05 | `sogdians-and-tang` | Sogdian merchants and Tang Chang'an / 粟特商人与唐代长安 | 0629 | `view-tarim` | K6 |
| 06 | `baghdad-and-paper` | Baghdad, paper and print / 巴格达、纸与印刷 | 0751 | `view-sogdiana` | K7 |
| 07 | `ports-and-emporia` | Ports of the monsoon world, 10th–14th centuries / 季风世界的港口（10—14世纪） | 0971 | `view-china-coast` | K9 |
| 08 | `mongol-conquests` | The Mongol conquests / 蒙古征服 | 1206 | `view-mongolia` | K10 |
| 09 | `mongol-roads` | Roads across the khanates / 诸汗国之间的路 | 1271 | `view-china-north` | K12 |
| 10 | `plague-on-the-roads` | Plague on the roads / 商路上的瘟疫 | 1338 | `view-tianshan` | K13 |

首拍序列 -0138 ≤ -0138 ≤ -0111 ≤ -0053 ≤ 0148 ≤ 0629 ≤ 0751 ≤ 0971 ≤ 1206 ≤ 1271 ≤ 1338，不递减。02 章拍跨到 0879、07 章拍跨到 1349，与后续章重叠（允许）。

**阅读说明（背景章 `state.note`）草稿**：

- EN: "**What this topic covers.** Routes by land and sea that linked China, Central Asia, Iran, India, Southeast Asia, the Mediterranean and East Africa, from about 138 BCE to 1368 CE. 'Silk Road' is a name from the 19th century; people at the time travelled many routes and did not use one name. Goods, faiths, inventions and diseases moved in both directions. Wars, slavery and massacres are written the same way whoever carried them out. **Numbers.** Every number opens its source. Old chronicles often give very large death tolls; where historians doubt them, both the reported figure and the doubt are shown. **The map.** Land and rivers are today's. Coloured areas come from the Cliopatria dataset and are approximate; blank land was not empty. Steppe empires ruled people and pastures more than fixed borders. Route lines are dashed: the stopping places come from written sources, but the lines between them are drawn by rule, not measured tracks."
- ZH: "**讲什么**：约公元前 138 年到公元 1368 年间，连接中国、中亚、伊朗、印度、东南亚、地中海和东非的陆路与海路。'丝绸之路'是 19 世纪才流行的名字，当时的人走的是许多条路，也没有一个统称。货物、信仰、发明和疾病都是双向流动的。战争、奴役和屠杀，不论是谁做的，都用同一种写法。**数字**：每个数字都能点开来源。古代史书常给出极大的死亡数字；史家有怀疑的地方，记载的数字和怀疑都写出来。**地图**：陆地和河流按今天的样子画。色块来自 Cliopatria 数据集，范围是大致的；空白的地方并不是没有人。草原上的帝国控制的是人群和牧场，不是固定的国界。路线画成虚线：沿途站点来自文献记载，站点之间的线是按规则画出的示意，不是测得的路径。"

`topic.yaml` 的 `note`（HUD 一行）：EN "Approximate extents from Cliopatria · dashed routes: recorded stops, schematic lines · today's land and rivers" / ZH "范围取自 Cliopatria，为示意 · 虚线路线：站点有记录，连线为示意 · 陆地与河流按今天"。

`blocLabels.neutral` = "Powers drawn on this map / 地图上画出的政权"；`out` = "No longer drawn / 已不在图上"；`strings`：joined "On the map from / 地图上始见"，left "On the map until / 地图上止于"，notYet "Not yet on the map / 尚未见于地图"（同古文明）。

### 1.2 镜头预设（`presets.json`，id 前缀 `view-`；全部是镜头设计参数，不是观测数据）

| id | 名称 EN / ZH | center | zoom |
|---|---|---|---|
| `view-steppe-china` | Steppe and China / 草原与中国 | [100, 40] | 3.6 |
| `view-china-north` | North China / 华北 | [112, 35.5] | 5.0 |
| `view-hexi` | Hexi Corridor and Dunhuang / 河西走廊与敦煌 | [98, 39.5] | 5.6 |
| `view-tarim` | Tarim Basin / 塔里木盆地 | [83, 40] | 5.0 |
| `view-tianshan` | Tian Shan and Issyk-Kul / 天山与伊塞克湖 | [76, 42.5] | 5.6 |
| `view-sogdiana` | Sogdiana and Ferghana / 粟特与费尔干纳 | [68, 40] | 5.4 |
| `view-iran` | Iran and Mesopotamia / 伊朗与两河 | [50, 34] | 4.4 |
| `view-mesopotamia` | Baghdad and Basra / 巴格达与巴士拉 | [45.5, 32] | 6.0 |
| `view-mediterranean` | Eastern Mediterranean / 东地中海 | [26, 37] | 4.6 |
| `view-black-sea` | Black Sea / 黑海 | [36, 45] | 5.0 |
| `view-europe` | Europe / 欧洲 | [8, 47] | 4.2 |
| `view-mongolia` | Mongolia / 蒙古高原 | [104, 46.5] | 4.6 |
| `view-india` | India / 印度 | [78, 18] | 4.0 |
| `view-arabian-sea` | Arabian Sea / 阿拉伯海 | [62, 15] | 3.8 |
| `view-bay-of-bengal` | Bay of Bengal and Sri Lanka / 孟加拉湾与斯里兰卡 | [88, 10] | 4.2 |
| `view-straits` | Strait of Malacca / 马六甲海峡 | [102.8, 1.9] | 5.6 |
| `view-java-sea` | Java Sea and Belitung / 爪哇海与勿里洞 | [108, -3.5] | 5.4 |
| `view-south-china-sea` | South China Sea / 南海 | [112, 15] | 4.4 |
| `view-china-coast` | Guangzhou and Quanzhou / 广州与泉州 | [116, 24] | 5.6 |

区域图版的"全图"由引擎第一个预设给出，**不再注册同名预设**（docs/06）。镜头在 iPad 比例实调；高亮不在取景内就放大视野，不挪数据点。

### 1.3 各章：正文要点、细看、节拍

格式：**正文要点**（EN 200–300 词 / ZH 350–500 字，3–5 段）→ **细看**（2–4 个 `<More>`）→ **节拍表**（caption 为可审阅初稿，日期开头、描述此刻地图上的东西；EN ≤ 45 词，ZH ≤ 40 字以内为宜，390 宽字幕卡不截断）→ **跨题链接**。每拍高亮 ≤ 3 个，均须在镜头里有引线标注。

#### 00 · background · 许多条路，一个后起的名字

- 正文：①名字：1877 年李希霍芬让"丝绸之路"出名，但这个德语词更早就有，"创造"之说不成立；他本人也写复数（F01–F02）。②不是一条路：草原、绿洲、山口、海港组成的网络，大多数商人只走其中一段，货物一站站转手（细看③）。③在汉朝之前已有交换：和田玉到殷墟（F11，读不到一手就删这句）；海上南岛航海者（F10）。④地图怎么读：阅读说明短版。
- 细看：①**名字的来历**（F01、F02 两边写）；②**今天的世界遗产**（F66、F67：2014 长安—天山廊道、2023 泽拉夫尚—卡拉库姆廊道；UNESCO 用"路网 / 廊道"而不是"一条路"）；③**谁走完了全程**（几乎没人：粟特、波斯、阿拉伯、犹太、印度、马来商人各管一段；人物旅程线是少数例外）；④**这张图怎么画的**（Cliopatria、站点法、自动海路、为什么是虚线，§3）。
- 节拍（4，均 `t: -0138`，背景章不占底部段）：

| Beat | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 00-a | 全图 · 无 | About 138 BCE, where this topic begins: lands and seas from the Atlantic to the Pacific. Land and rivers are drawn as they are today. | 约公元前 138 年，本主题从这里开始：从大西洋到太平洋的陆地与海洋。陆地和河流按今天的样子画。 | — |
| 00-b | 全图 · `site-chang-an`、`site-samarkand`、`site-antioch` | 1877, a later name: the geographer Ferdinand von Richthofen made "Silk Road" famous. People at the time used many routes and no single name. | 1877 年，一个后起的名字：地理学家李希霍芬让"丝绸之路"出了名。当时的人走许多条路，也没有统称。 | F01, F02 |
| 00-c | `view-tarim` · `site-dunhuang`、`site-kashgar`、`site-khotan` | Before 138 BCE: travellers already crossed these deserts oasis by oasis, carrying jade, horses and ideas. | 公元前 138 年以前：已经有人一个绿洲接一个绿洲地穿过这片沙漠，带着玉、马和想法。 | F11 |
| 00-d | `view-arabian-sea` · `site-muziris` | Before 138 BCE, at sea: sailors of many peoples already crossed the Indian Ocean with the seasonal winds. | 公元前 138 年以前，在海上：许多民族的水手已借季节风横渡印度洋。 | F10 |

- 跨题链接：`ancient-civilisations` → `china`（汉的纸）、`southeast-asia-seas`；`warring-states` → `after-221`（秦汉之交）。

#### 01 · zhang-qian · 张骞出使

- 核心问题（内部）：一个使者为什么出发，路上遇到了谁？
- 正文：①匈奴是草原上的强大政权，汉初和亲、纳贡；汉武帝想联络被匈奴赶走的月氏夹击匈奴（F03）。写匈奴的处境与汉朝同等具体，不用"胡""蛮"。②张骞被扣十余年、娶妻生子、逃出，到大宛、康居、月氏、大夏；月氏已在大夏旁安居，不愿回头作战——外交目的落空，但带回了西方诸国的消息（F03）；"凿空"是司马迁的话（F04）。③汉朝此后对匈奴连年用兵、设河西诸郡，前 104–前 101 年为汗血马远征大宛，《史记》记下沉重的损失（F05–F06，数字 `<Num>`）。④前 60 年设西域都护；绿洲小国在汉、匈奴之间周旋（F07）。
- 细看：①**匈奴怎么看**（游牧经济、与汉的贸易需求；匈奴自己没有留下文字，我们读到的都是汉方记载——写明）；②**大宛之战的代价**（《史记》原数字，标"《史记》记载"）；③**"西域"是谁的词**（汉代人的说法；绿洲诸国各有名字与王）；④**马、葡萄、苜蓿**（"张骞带回"是后世附会，《史记》说的是汉使取来；F 步核）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 01-a / -0138 | `view-steppe-china` · `evt-zhang-qian-sets-out`、`mv-zhang-qian` | About 138 BCE: the Han court sends Zhang Qian west to find the Yuezhi, hoping for allies against the Xiongnu. He is soon captured by the Xiongnu. | 约公元前 138 年：汉廷派张骞西行寻找月氏，想联合他们对付匈奴。他不久就被匈奴扣留。 | F03 |
| 01-b / -0128 | `view-sogdiana` · `site-dayuan`、`site-yuezhi-court`、`mv-zhang-qian` | About 128 BCE: after about ten years Zhang Qian escapes, reaches Dayuan in the Ferghana Valley, then the Yuezhi beside Bactria. They do not want war with the Xiongnu. | 约公元前 128 年：被扣十年左右，张骞逃出，到费尔干纳的大宛，又到大夏旁的月氏。月氏不想再与匈奴开战。 | F03 |
| 01-c / -0126 | `view-hexi` · `evt-zhang-qian-returns` | 126 BCE: Zhang Qian returns to Chang'an. Sima Qian records that of more than a hundred who set out, two came back. | 公元前 126 年：张骞回到长安。司马迁记载，出发时一百多人，只有两人回来。 | F03 |
| 01-d / -0101 | `view-sogdiana` · `evt-dayuan-war` | 104–101 BCE: Han armies march to Dayuan for its horses. Sima Qian's figures show that many soldiers died on the way. | 公元前 104 至前 101 年：汉军远征大宛求马。司马迁记下的数字显示，许多士兵死在路上。 | F06 |
| 01-e / -0060 | `view-tarim` · `evt-western-regions-protectorate` · + `routes-han` | 60 BCE: the Han court appoints a Protector-General of the Western Regions. The dashed lines join oases in the order the Han History lists them. | 公元前 60 年：汉廷设西域都护。虚线按《汉书》所列顺序连接各个绿洲。 | F07 |

- 跨题链接：`warring-states` → `after-221`。

#### 02 · monsoon-seas · 季风之海（海上丝路 I）

- 核心问题：海上是谁在航行？
- 正文：①季风决定航期；南岛语族、印度、波斯、阿拉伯、中国的船都在这片海上（F10；链古文明 `southeast-asia-seas`，不重讲扶南 / 室利佛逝）。②汉灭南越后，《汉书·地理志》记汉使从徐闻、合浦出海，"蛮夷贾船，转送致之"——汉使坐外国商船（F08）。③西端：《航行记》里的穆济里斯、季风横渡；罗马商品到印度，丝从陆路到印度再上船（F09）。④法显 412 年走海路回国（F12）；约 830 年贝利通沉船——阿拉伯 / 印度洋式缝合船载中国瓷器，今藏新加坡亚洲文明博物馆（F13）。⑤878/879 年广州：只有阿拉伯文记载的屠杀报告，同一套"谁报数、未知什么"写法（F14）。
- 细看：①**季风是怎么用的**（冬季东北风南下、夏季西南风北上；链 `monsoon-and-weather` 若有合适章）；②**一艘船，几种来历**（贝利通：船是西亚式，货是中国的，沉在东南亚；链古文明 `southeast-asia-seas`）；③**广州 878/879：只有一种记载**（西拉菲 12 万、马苏第 20 万，中国史书不载，年代有疑，Rossabi 认为夸大——两边写，未知不写 0）；④**海路上的奴隶**（《航行记》列出被贩卖的人；唐代"昆仑奴"——F 步读到学术来源才写，读不到删）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 02-a / -0111 | `view-south-china-sea` · `evt-han-takes-nanyue` · + `sea-han` | 111 BCE: Han armies conquer Nanyue in the far south. The Han History says envoys then sailed from this coast toward India on foreign merchants' ships. | 公元前 111 年：汉军灭南越。《汉书》说汉使此后从这一带出海前往印度，乘的是外国商船。 | F08 |
| 02-b / 0050 | `view-arabian-sea` · `site-muziris`、`site-berenike` | Mid-1st century CE: a Greek sailing guide describes ships crossing to Muziris on the monsoon, and silk reaching India overland. | 公元 1 世纪中叶：一本希腊文航海指南记载船随季风横渡到穆济里斯，丝从陆路运到印度。 | F09 |
| 02-c / 0412 | `view-bay-of-bengal` · `mv-faxian` | 412 CE: after years in India, the monk Faxian sails home from Sri Lanka by way of the islands to the east. | 公元 412 年：在印度多年后，僧人法显从斯里兰卡乘船，经东边的海岛回国。 | F12 |
| 02-d / 0830 | `view-java-sea` · `evt-belitung-wreck` | About 830 CE: a sewn-plank ship full of Chinese ceramics sinks off Belitung. Its cargo is now in Singapore's Asian Civilisations Museum. | 约公元 830 年：一艘满载中国瓷器的缝合船在勿里洞附近沉没，船货今藏新加坡亚洲文明博物馆。 | F13 |
| 02-e / 0879 | `view-china-coast` · `evt-guangzhou-879` | 878–879 CE: Huang Chao's rebels take Guangzhou. An Arabic writer reports that many foreign merchants were killed; Chinese records do not mention it. | 公元 878 至 879 年：黄巢军攻占广州。一位阿拉伯作者记载许多外国商人被杀，中国史书没有提到。 | F14 |

- 跨题链接：`ancient-civilisations` → `southeast-asia-seas`；`zheng-he` → `background`（"已经相连的海"）。

#### 03 · four-empires · 四个帝国之间

- 核心问题：丝到了罗马，罗马人知道它从哪里来吗？
- 正文：①约 1 世纪，汉、贵霜、帕提亚、罗马四国从东到西相接；没有哪一国控制整条路，帕提亚与贵霜处在中间（F18–F20）。②卡莱之战：帕提亚击败克拉苏，普鲁塔克记的数字（F15）；罗马与帕提亚长期争夺两河。③罗马一端：普林尼的抱怨（F17）、赛里斯只是"产丝的人"的模糊名字；汉一端：甘英到海边折返（F18），166 年"安敦"使者多半是商人（F19）。④贵霜：迦腻色伽，犍陀罗艺术，佛教向北传（F20）；伊西多尔《帕提亚驿程》列下帕提亚境内的驿站（F69，路线层来源）。
- 细看：①**谁是"赛里斯"，谁是"大秦"**（双方对对方的模糊印象）；②**卡莱：数字从哪里来**（普鲁塔克一百多年后写；丝绸军旗之说只见晚出的弗洛鲁斯，F16）；③**贝格拉姆的宝藏**（罗马玻璃、印度象牙、汉代漆器同出一处——F 步核来源，读不到删）；④**中间人**（帕提亚、贵霜、粟特为什么不让两端直接见面——写成"史家的一种解释"）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 03-a / -0053 | `view-iran` · `evt-carrhae` · + `routes-han` | 53 BCE: at Carrhae, a Parthian army defeats the Roman army of Crassus. Plutarch later wrote that 20,000 Romans were killed and 10,000 captured. | 公元前 53 年：卡莱之战，帕提亚军击败克拉苏的罗马军。普鲁塔克后来写道，2 万罗马人被杀、1 万被俘。 | F15 |
| 03-b / 0077 | `view-mediterranean` · `site-rome` | About 77 CE: in Rome, Pliny complains that India, the Seres and Arabia take 100 million sesterces a year from the empire. | 约公元 77 年：在罗马，普林尼抱怨印度、赛里斯和阿拉伯每年从帝国拿走 1 亿塞斯特斯。 | F17 |
| 03-c / 0097 | `view-iran` · `evt-gan-ying` | 97 CE: the Han envoy Gan Ying reaches a great sea in the west and turns back. Rome, called Da Qin in Chinese records, stays out of reach. | 公元 97 年：汉使甘英到西边的大海边折回。中国史书称为"大秦"的罗马，始终没有到达。 | F18 |
| 03-d / 0127 | `view-sogdiana` · `evt-kanishka`、`site-begram` | About 127 CE: Kanishka becomes Kushan king. His realm joins Bactria to the Ganges plain, and its art mixes Greek, Iranian and Indian forms. | 约公元 127 年：迦腻色伽成为贵霜王。他的国家从大夏连到恒河平原，艺术混合希腊、伊朗、印度风格。 | F20 |
| 03-e / 0166 | `view-south-china-sea` · `evt-andun-166` | 166 CE: men calling themselves envoys of "Andun", king of Da Qin, reach the Han court by sea from the south. Historians think they were merchants. | 公元 166 年：自称大秦王"安敦"使者的人从南方海上到达汉廷。史家认为他们多半是商人。 | F19 |

#### 04 · faiths-on-the-road · 僧人、商人与新的信仰

- 核心问题：一种信仰怎样走过几千公里？
- 正文：①佛教东传：安息人安世高 148 年到洛阳（F22）——译经者多来自帕提亚、贵霜、粟特、龟兹，不只是中国求法僧；鸠摩罗什 401 年到长安（F24）；敦煌莫高窟始凿（F23）。②萨珊伊朗（224 年起，F21）：琐罗亚斯德教是国教；摩尼在这里创教，后来摩尼教传到中亚与中国（F26）。③粟特古信札（F25）：商人和一位被丈夫丢在敦煌的妇女写信回撒马尔罕，信里说洛阳被焚——311 年永嘉之乱从商人的角度看。④东罗马：约 552 年蚕卵被带到君士坦丁堡，丝不再只能从东方来（F27）。
- 细看：①**一封没送到的信**（米薇的信，粟特女性的处境——Smithsonian 粟特展原文）；②**翻译的人**（安世高、支娄迦谶、鸠摩罗什都不是汉人）；③**摩尼教：一个今天几乎消失的世界宗教**；④**养蚕术怎样传开**（普罗科匹厄斯的故事；和田"传丝公主"传说——标"传说"）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 04-a / 0148 | `view-china-north` · `evt-an-shigao` | 148 CE: An Shigao, a man from Parthia, reaches Luoyang and begins translating Buddhist texts into Chinese. | 公元 148 年：来自安息的安世高到达洛阳，开始把佛经译成中文。 | F22 |
| 04-b / 0240 | `view-iran` · `site-ctesiphon` | About 240 CE: in Sasanian Iran, Mani begins to teach a new religion that will spread east as far as China. | 约公元 240 年：在萨珊伊朗，摩尼开始传播一种新宗教，后来一直传到中国。 | F21, F26 |
| 04-c / 0313 | `view-hexi` · `evt-sogdian-letters` | 313 CE: near Dunhuang, Sogdian merchants and a woman left in the town write letters home to Samarkand. One reports that Luoyang has burned. The letters never arrived. | 公元 313 年：在敦煌附近，粟特商人和一位留在城里的妇女给撒马尔罕写信，有一封说洛阳已被焚毁。这些信没有送到。 | F25 |
| 04-d / 0401 | `view-tarim` · `evt-kumarajiva`、`site-mogao` | 401 CE: Kumarajiva, a monk from Kucha, reaches Chang'an to translate Buddhist texts. At Dunhuang, cave temples have been cut into the cliff since 366. | 公元 401 年：龟兹僧人鸠摩罗什到长安译经。敦煌的崖壁上，从 366 年起就在开凿石窟。 | F23, F24 |
| 04-e / 0552 | `view-mediterranean` · `evt-silkworms-552` | About 552 CE: according to Procopius, monks bring silkworm eggs to Constantinople, and silk begins to be made in the Eastern Roman Empire. | 约公元 552 年：据普罗科匹厄斯记载，僧人把蚕卵带到君士坦丁堡，东罗马帝国从此开始自己产丝。 | F27 |

#### 05 · sogdians-and-tang · 粟特商人与唐代长安

- 核心问题：一座城里能有多少种人？
- 正文：①粟特人：撒马尔罕、布哈拉的商人，在中国、草原、伊朗之间建起商人聚落，粟特语是商路通用语（F25、F29）。②唐初的长安：玄奘西行（F28）；东方教会（景教）635 年到长安，781 年立碑（F30）；祆教、摩尼教寺院。③奴隶也是货物：639 年吐鲁番契约（F29），写明契约条款、不加形容词。④755–763 年安史之乱：安禄山是粟特—突厥混血的将领；乱后唐失西域，粟特人在中国处境变化；户籍数字的骤降是登记崩溃，不是死亡数（F33）。⑤吐蕃约 786 年占敦煌，回鹘与吐蕃争路；回鹘可汗奉摩尼教（F34、F26）。
- 细看：①**粟特人是谁**（不是一个国家，是一串城邦与一张商人网）；②**一纸契约**（F29 原文要点；买方身份按 F 步定稿）；③**安史之乱与粟特人**（乱后对"胡人"的敌意——用史家的转述，不渲染）；④**东方教会的碑**（碑文是中文与叙利亚文；"景教"是唐代的叫法）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 05-a / 0629 | `view-tarim` · `mv-xuanzang` · + `routes-tang` | 629 CE: the monk Xuanzang leaves Chang'an for India without the emperor's permission. He comes back in 645 with hundreds of texts. | 公元 629 年：僧人玄奘未获准许就离开长安前往印度，645 年带着数百部经书回来。 | F28 |
| 05-b / 0635 | `view-china-north` · `evt-aluoben-635` | 635 CE: Aluoben, a monk of the Church of the East, reaches Chang'an. A stone set up in 781 tells his story in Chinese and Syriac. | 公元 635 年：东方教会僧人阿罗本到达长安。781 年立的一块石碑用中文和叙利亚文记下这件事。 | F30 |
| 05-c / 0639 | `view-tarim` · `evt-turfan-contract-639` | 639 CE: at Turfan, a contract written in Sogdian records the sale of a girl named Upach. People were bought and sold along these routes. | 公元 639 年：吐鲁番一份粟特文契约记下一个叫优婆遮的女孩被卖。这些商路上也买卖人口。 | F29 |
| 05-d / 0755 | `view-china-north` · `evt-an-lushan` | 755 CE: An Lushan, a general of Sogdian and Turkic descent, rebels against the Tang. The war lasts until 763, and the Tang lose the far west. | 公元 755 年：粟特与突厥血统的将领安禄山起兵反唐。战乱持续到 763 年，唐朝失去西域。 | F33 |
| 05-e / 0786 | `view-hexi` · `evt-tibet-dunhuang` | About 786 CE: Tibetan forces hold Dunhuang. The Tibetan Empire and the Uyghurs now contest the routes. | 约公元 786 年：吐蕃占领敦煌。吐蕃和回鹘此时争夺这些通路。 | F34 |

#### 06 · baghdad-and-paper · 巴格达、纸与印刷

- 核心问题：一项技术是怎样传开的？
- 正文：①751 年怛罗斯（F31）；"俘虏带来造纸"是 11 世纪的故事，撒马尔罕更早已用纸（F32，两边写）。②762 年建巴格达（F35）：阿拔斯王朝把两河、伊朗、中亚连成一个大市场，纸在巴格达普及，书籍与翻译兴盛。③伊本·胡尔达兹贝赫记拉德汉犹太商人往返欧洲与中国（F36）；al-Thurayya 路网显示伊斯兰世界的道路（数据层）。④869–883 年僧祇人起义：在伊拉克南部盐碱地劳作的东非被奴役者起义，战争十几年，双方都有大量死亡（F37，同一套写法）。⑤另一端：868 年敦煌《金刚经》印本（F38）；藏经洞后来封存、1900 年打开、文书分散世界（F39，§0.1-9 写法）。
- 细看：①**怛罗斯与纸：一个故事怎样变成"史实"**；②**巴格达的书市**（F 步找来源；读不到删）；③**僧祇人是谁**（来自东非沿岸，被贩运到伊拉克；奴隶兵与家内奴隶的不同）；④**藏经洞的写本今天在哪里**（伦敦、巴黎、圣彼得堡、北京等地分藏；国际敦煌项目 IDP 在线共享——事实写法，不评价个人）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 06-a / 0751 | `view-sogdiana` · `evt-talas` | 751 CE: near the Talas River, an Abbasid army and its allies defeat a Tang army. A later story says captives brought papermaking to Samarkand, but paper was already used there. | 公元 751 年：在怛罗斯河附近，阿拔斯军及其盟军击败唐军。后来有故事说俘虏把造纸术带到撒马尔罕，但那里更早已经用纸。 | F31, F32 |
| 06-b / 0762 | `view-mesopotamia` · `evt-baghdad-founded` | 762 CE: the caliph al-Mansur founds Baghdad on the Tigris. Goods arrive from China, India and East Africa by caravan and by ship. | 公元 762 年：哈里发曼苏尔在底格里斯河畔建巴格达。来自中国、印度和东非的货物靠商队和船运到这里。 | F35 |
| 06-c / 0868 | `view-hexi` · `evt-diamond-sutra-868` | 868 CE: a copy of the Diamond Sutra is printed in China, the oldest complete printed book with a date. It was later sealed in a cave at Dunhuang. | 公元 868 年：中国印出一部《金刚经》，是有确切日期的最早完整印本书。它后来被封存在敦煌的一个洞窟里。 | F38, F39 |
| 06-d / 0869 | `view-mesopotamia` · `evt-zanj-revolt` | 869 CE: in southern Iraq, enslaved East Africans called the Zanj rise in revolt. The war lasts until 883. | 公元 869 年：在伊拉克南部，被称为"僧祇"的东非被奴役者起义，战争持续到 883 年。 | F37 |
| 06-e / 0870 | 全图 · + `routes-abbasid` | About 870 CE: a book of roads describes Jewish merchants travelling between Europe and China. The dashed roads come from a modern atlas of the Islamic world. | 约公元 870 年：一部讲道路的书记载犹太商人往返欧洲与中国。虚线道路来自一部现代伊斯兰世界地图集。 | F36 |

#### 07 · ports-and-emporia · 季风世界的港口（海上丝路 II）

- 核心问题：一个港口靠什么兴旺？
- 正文：①宋朝设市舶司（广州 971、泉州 1087，F40），对外贸易成为朝廷收入；泉州在宋元时期是世界大港（F41），1974 年出土的宋代船有 13 个隔舱（F42）。②印度洋两岸的商人：开罗吉尼扎文书里的本·伊居（F44）、朱罗与室利佛逝之争（F43，链古文明）。③赵汝适《诸蕃志》的物产（F45）；香料、胡椒、乳香、象牙、瓷器、铜钱双向流动。④元代：马可·波罗说他从泉州出海、在苏门答腊候风数月（F53）；伊本·白图泰从须文答剌—巴赛航到泉州（F56）；1292–93 年元军远征爪哇（链古文明）。⑤1349 年汪大渊记"单马锡""龙牙门"，福康宁出土器物与他同时代（F57）；山尼拉乌他玛只写"《马来纪年》里的传说"并链接。结尾一句：1405 年起明朝船队下西洋，链 `zheng-he`。
- 细看：①**市舶司收什么**（抽分、禁榷；F 步核）；②**一封 12 世纪的商人信**（本·伊居：一个犹太商人在印度的家庭——学术来源）；③**淡马锡：考古与文字**（链 `singapore-1819-1965` 背景章；汪大渊对龙牙门劫掠船只的记载——同一套写法）；④**下一步：郑和**（链 `zheng-he`，不预告细节）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 07-a / 0971 | `view-china-coast` · `evt-guangzhou-shibosi-971` · + `sea-tang` | 971: the Song court sets up an office at Guangzhou to manage and tax sea trade. Quanzhou gets one in 1087. | 971 年：宋朝在广州设市舶司管理海上贸易并征税。泉州在 1087 年也设了市舶司。 | F40 |
| 07-b / 1025 | `view-straits` · `evt-chola-raid-1025` · + `srivijaya-sphere` | 1025: a fleet sent by the Chola king of south India attacks Srivijaya's ports. Trade in the straits was also a contest for power. | 1025 年：南印度朱罗国王派出的船队攻击室利佛逝的港口。海峡上的贸易也是权力之争。 | F43 |
| 07-c / 1132 | `view-arabian-sea` · `site-aden`、`site-mangalore` | 1130s: letters kept in a Cairo synagogue follow Abraham Ben Yiju, a Jewish merchant from Tunisia, trading between Aden and India's southwest coast. | 12 世纪 30 年代：开罗一座犹太会堂保存的信件，记下突尼斯犹太商人本·伊居在亚丁和印度西南岸之间做生意。 | F44 |
| 07-d / 1291 | `view-straits` · `mv-polo-sea`、`site-samudera-pasai` | About 1291: Marco Polo's book says he sailed from Quanzhou and waited months in Sumatra for the winds to change. | 约 1291 年：马可·波罗的书里说，他从泉州出海，在苏门答腊等了几个月，等风向转变。 | F53 |
| 07-e / 1349 | `view-straits` · `site-temasek` · + `majapahit-sphere` | 1349: Wang Dayuan describes Danmaxi, a trading settlement at today's Singapore. Objects found on Fort Canning come from his time. | 1349 年：汪大渊记下"单马锡"，一个在今天新加坡的贸易聚落。福康宁出土的器物正是那个时代的。 | F57 |

- 跨题链接：`singapore-1819-1965` → `background`；`ancient-civilisations` → `southeast-asia-kingdoms`；`zheng-he` → `setting-sail`。

#### 08 · mongol-conquests · 蒙古征服

- 核心问题：一个帝国在征服中毁掉了什么，又连起了什么？
- 正文：①1206 年成吉思汗（F46）。②讹答剌事件与西征花剌子模（F47）：布哈拉、撒马尔罕、梅尔夫、内沙布尔被攻破；城中居民被杀，工匠被掳走集中迁移——同一套"谁记载、数字是否可信"写法（F48）。③蒙古宫廷里的多种人：鲁布鲁克在哈剌和林（F49），被掳的巴黎金匠布歇——掳掠工匠是蒙古征服的一部分。④1258 年巴格达（F50）；1260 年艾因扎鲁特，马穆鲁克（奴隶兵出身）挡住蒙古西进（F51）。
- 细看：①**数字为什么这么大**（志费尼、伊本·阿西尔的数字与现代估计并列，F48）；②**被掳走的人**（工匠迁移、驿站役户；不写"人才交流"之类的美化）；③**巴格达 1258**（数字区间两端各自来源；图书馆被毁的说法——F 步核）；④**马穆鲁克是谁**（从黑海草原买来的奴隶少年，训练成兵，后来自己当了苏丹；链到 09 章黑海奴隶贸易）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 08-a / 1206 | `view-mongolia` · `evt-chinggis-1206` | 1206: an assembly of Mongol and other steppe peoples proclaims Temüjin as Chinggis Khan. | 1206 年：蒙古和草原各部的大会推举铁木真为成吉思汗。 | F46 |
| 08-b / 1219 | `view-sogdiana` · `evt-otrar-1218` | 1218–1219: at Otrar, a governor of the Khwarazm shah has a Mongol trade caravan killed. In 1219 Chinggis Khan invades Khwarazm. | 1218 至 1219 年：花剌子模沙的总督在讹答剌杀死蒙古商队。1219 年，成吉思汗进攻花剌子模。 | F47 |
| 08-c / 1221 | `view-iran` · `evt-merv-1221`、`evt-nishapur-1221` | 1220–1221: Mongol armies take Bukhara, Samarkand, Merv and Nishapur. Persian writers give death tolls in the millions; historians think these are too high, but the killing was vast. | 1220 至 1221 年：蒙古军攻下布哈拉、撒马尔罕、梅尔夫和内沙布尔。波斯作者记下数以百万计的死者；史家认为过高，但杀戮确实极大。 | F48 |
| 08-d / 1254 | `view-mongolia` · `evt-rubruck-karakorum`、`mv-rubruck` | 1254: the friar William of Rubruck reaches Karakorum. At the Mongol court he meets Muslims, Buddhists, Christians and a captured goldsmith from Paris. | 1254 年：修士鲁布鲁克到达哈剌和林。他在蒙古宫廷见到穆斯林、佛教徒、基督徒，还有一个被掳来的巴黎金匠。 | F49 |
| 08-e / 1258 | `view-mesopotamia` · `evt-baghdad-1258` | 1258: Mongol forces under Hülegü take Baghdad and kill the last Abbasid caliph. Estimates of the dead range from about 90,000 to several hundred thousand. | 1258 年：旭烈兀率蒙古军攻下巴格达，杀死末代阿拔斯哈里发。死亡人数的估计从约 9 万到数十万不等。 | F50 |

#### 09 · mongol-roads · 诸汗国之间的路

- 核心问题：路通了，谁在走？
- 正文：①1260 年后帝国分成元、伊利汗国、金帐汗国（术赤兀鲁思）、察合台汗国，彼此时有交战（F52）。②驿站（站赤）与牌符让使者和商人走长路；"蒙古和平"是现代史家的说法，不是当时的事实描述——写明（§5）。③东西双向的旅人：马可·波罗（F53，真实性争论）；拉班·扫马自东向西出使欧洲（F54）——一个从中国出发去见欧洲国王的人。④黑海：热那亚的卡法、威尼斯的塔纳，皮毛、粮食和被奴役的人卖往马穆鲁克埃及与意大利（F64）。⑤约 1340 年裴哥罗梯说塔纳到契丹的路"日夜安全"（F55）；伊本·白图泰在德里苏丹国做官后出使中国（链 07）。
- 细看：①**马可·波罗到过中国吗**（Wood 与 Vogel 两边写，不下结论）；②**拉班·扫马的报告**（叙利亚文传记；他眼中的欧洲）；③**黑海的奴隶贸易**（谁被卖、卖到哪里、谁获利：热那亚、威尼斯商人与金帐汗国、马穆鲁克——各方都写）；④**火药、印刷、历法**（西传 / 东传的证据与"谁最早"的争论——F 步只写有学术来源的）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 09-a / 1271 | `view-china-north` · `evt-yuan-1271` · + `routes-mongol` | 1271: Khubilai Khan names his dynasty Yuan. His capital, Khanbaliq, stands where Beijing is today. The empire is now four khanates that sometimes fight each other. | 1271 年：忽必烈定国号为元，都城大都在今天的北京。帝国此时分成四个汗国，彼此时有交战。 | F52 |
| 09-b / 1275 | 全图 · `mv-polo-land` | About 1275: according to his book, Marco Polo reaches Khubilai's court with his father and uncle. Historians still debate parts of his story. | 约 1275 年：按他自己书里的说法，马可·波罗随父亲和叔叔到达忽必烈的朝廷。史家对书中部分内容仍有争论。 | F53 |
| 09-c / 1287 | `view-europe` · `mv-rabban-sauma` | 1287–1288: Rabban Sauma, a Church of the East monk born near Khanbaliq, travels west as the Ilkhan's envoy and meets the kings of France and England. | 1287 至 1288 年：生于大都附近的东方教会僧人拉班·扫马作为伊利汗的使者西行，见到法国和英国国王。 | F54 |
| 09-d / 1300 | `view-black-sea` · `site-caffa`、`site-tana` | About 1300: from Caffa and Tana on the Black Sea, Genoese and Venetian merchants ship furs, grain and enslaved people, many sold to Mamluk Egypt. | 约 1300 年：热那亚和威尼斯商人从黑海边的卡法和塔纳运出皮毛、粮食和被奴役的人，许多人被卖到马穆鲁克埃及。 | F64 |
| 09-e / 1340 | 全图 · + `routes-mongol` | About 1340: a Florentine merchant's handbook says the road from Tana to Cathay is safe by day and night. The dashed line follows his list of stops. | 约 1340 年：一位佛罗伦萨商人的手册说，从塔纳到契丹的路日夜安全。虚线按他列出的站点画出。 | F55 |

#### 10 · plague-on-the-roads · 商路上的瘟疫

- 核心问题：连接世界的路，也会带来什么？
- 正文：①1338–1339 年天山北麓的墓碑与 2022 年古 DNA（F58）——写清"起源在这一带是推断，与后来大流行的联系也是推断"。②1346 年卡法：金帐汗国军中暴发瘟疫；"抛尸入城"只见一家记述（F59）；船把疫病带到君士坦丁堡、墨西拿、亚历山大（F60）。③欧洲、北非、西亚同遭重创：死亡比例的估计区间（F61、F62），两端各自来源；当时的人叫它"大瘟疫"（F71）。④恐惧与迫害：犹太人被诬投毒，1348–49 年多地屠杀，斯特拉斯堡 1349（F63）——写受害者，写明是谁做的。⑤1368 年元廷退出大都，明朝建立（F65）；陆路贸易没有消失；1405 年起明朝船队走海路，链 `zheng-he`。
- 细看：①**古 DNA 怎样找到病原体**（方法与局限）；②**数字的区间**（为什么同一场疫病有 30% 到 60% 的估计）；③**中国与东亚有没有黑死病**（史料不足、史家有争论——两边写；读不到学术来源就只写"不清楚"）；④**为什么要记住斯特拉斯堡**（受害者有名字写名字；与今天的"把疫病归罪于某个群体"相关的一句，克制）。
- 节拍：

| Beat / t | 镜头 · 高亮 · 层 | Caption EN | 字幕 ZH | Facts |
|---|---|---|---|---|
| 10-a / 1338 | `view-tianshan` · `evt-kara-djigach-1338` | 1338–1339: gravestones near Lake Issyk-Kul record deaths from "pestilence". In 2022, scientists found plague bacteria in DNA from these graves. | 1338 至 1339 年：伊塞克湖附近的墓碑记下死于"瘟疫"的人。2022 年，科学家从这些墓中的 DNA 找到鼠疫杆菌。 | F58 |
| 10-b / 1346 | `view-black-sea` · `evt-caffa-1346` | 1346: plague breaks out in the Golden Horde army besieging Caffa. One Italian writer says bodies were thrown into the town; historians doubt plague spread that way. | 1346 年：围攻卡法的金帐汗国军中暴发瘟疫。一位意大利作者说尸体被抛进城里，史家怀疑瘟疫是这样传开的。 | F59 |
| 10-c / 1347 | `view-mediterranean` · `evt-plague-constantinople-1347`、`evt-plague-messina-1347`、`evt-plague-alexandria-1347` | Autumn 1347: ships carry plague to Constantinople, Messina and Alexandria. | 1347 年秋：船只把瘟疫带到君士坦丁堡、墨西拿和亚历山大。 | F60, F62 |
| 10-d / 1349 | `view-europe` · `evt-strasbourg-1349` | February 1349: in Strasbourg, as plague approaches, the town's Jews are falsely blamed and killed. Similar killings happen in many European towns. | 1349 年 2 月：瘟疫逼近时，斯特拉斯堡的犹太人被诬陷并遭杀害。欧洲许多城镇发生同样的屠杀。 | F63 |
| 10-e / 1368 | `view-china-north` · `evt-ming-1368` | 1368: the Yuan court leaves Khanbaliq and the Ming dynasty is founded. Overland trade goes on; from 1405 the Ming also send great fleets west by sea. | 1368 年：元廷撤出大都，明朝建立。陆上贸易仍在继续；从 1405 年起，明朝还派大船队从海上西行。 | F65 |

- 跨题链接：`zheng-he` → `setting-sail`（结尾）。

---

## 2. 数据清单

### 2.1 命名空间

主题、章节、事件、movement、实体、预设、名词、dated-layer id 共用一个命名空间（docs/10）。前缀：事件 `evt-`、地点 `site-`、旅程 `mv-`、预设 `view-`、名词 `term-`、路线层 `routes-` / `sea-`；实体无前缀（与章节 id 查重：没有实体叫 `zhang-qian` 等）。

### 2.2 实体（`entities.json`；`bloc: neutral`，颜色由 `colour-holders.ts` DSatur 分配）

| id | EN / ZH | 出现的帧 | Cliopatria 预计记录（G0 清点为准） | 缺了怎么办 |
|---|---|---|---|---|
| `han` | Han / 汉 | K1–K3 | "Han Dynasty"（古文明已用到：-36…5、117…153 等） | — |
| `xiongnu` | Xiongnu / 匈奴 | K1–K3 | "Xiongnu" | 只画王庭点 `site-xiongnu-court`（坐标争议大，F 步定；定不了就不画），字幕不提范围 |
| `parthia` | Parthian Empire / 帕提亚（安息） | K1–K3 | "Parthian Empire" / "Arsacid" | 只画都城点（泰西封）|
| `rome` | Roman Republic / Empire · 罗马 | K1–K5 | "Roman Republic"、"Roman Empire"（已用到）| — |
| `kushan` | Kushan Empire / 贵霜 | K3–K4 | "Kushan Empire" | 只画点（贝格拉姆、布路沙布逻）|
| `sasanian` | Sasanian Empire / 萨珊 | K4–K6 | "Sasanian Empire" | 只画泰西封点 |
| `gupta` | Gupta Empire / 笈多 | K5 | "Gupta Empire"（已用到 387–489）| — |
| `eastern-rome` | Eastern Roman Empire / 东罗马（拜占庭） | K6–K14 | "Eastern Roman Empire"（INVENTORY 已列）| — |
| `tang` | Tang / 唐 | K6–K8 | "Tang Dynasty" | — |
| `western-turks` | Western Turkic Khaganate / 西突厥 | K6 | "Western Turkic Khaganate" | 不画（玄奘在碎叶见可汗，用点）|
| `tibet` | Tibetan Empire / 吐蕃 | K6–K8 | "Tibetan Empire" | 不画，05-e 字幕只说"吐蕃占领敦煌" |
| `uyghur` | Uyghur Khaganate / 回鹘 | K7–K8 | "Uyghur Khaganate" | 不画 |
| `abbasid` | Abbasid Caliphate / 阿拔斯王朝 | K7–K8 | "Abbasid Caliphate" | — |
| `song` | Song / 宋 | K9–K12 | "Northern Song"/"Southern Song" | — |
| `liao` | Liao / 辽 | K9 | "Liao Dynasty" | 不画 |
| `fatimid` | Fatimid Caliphate / 法蒂玛王朝 | K9 | "Fatimid Caliphate" | 不画（吉尼扎文书用点）|
| `chola` | Chola / 朱罗 | K9 | "Chola Empire"（INVENTORY 已列 850…1259）| — |
| `khwarazm` | Khwarazmian Empire / 花剌子模 | K10 | "Khwarazmian Empire" | 只画讹答剌、撒马尔罕点 |
| `jin` | Jin / 金 | K10 | "Jin Dynasty (1115–1234)" | 不画 |
| `mongols` | Mongol Empire / 蒙古帝国 | K10–K11 | "Mongol Empire" | 必需；缺则 G0 停下报主会话（备选 OHM 关系，CC0）|
| `yuan` | Yuan / 元 | K12–K13 | "Yuan Dynasty" | 同上 |
| `ilkhanate` | Ilkhanate / 伊利汗国 | K12–K13 | "Ilkhanate" | 同上 |
| `golden-horde` | Golden Horde (Ulus of Jochi) / 金帐汗国（术赤兀鲁思） | K12–K14 | "Golden Horde" | 同上 |
| `chagatai` | Chagatai Khanate / 察合台汗国 | K12–K14 | "Chagatai Khanate" | 同上 |
| `mamluk` | Mamluk Sultanate / 马穆鲁克苏丹国 | K11–K14 | "Mamluk Sultanate" | — |
| `delhi` | Delhi Sultanate / 德里苏丹国 | K13–K14 | "Delhi Sultanate" | 不画 |
| `ming` | Ming / 明 | K14 | "Ming Dynasty" | — |
| `srivijaya`、`majapahit` | （势力范围层 holder，复用古文明实体定义，id 相同但在本主题 entities.json 自写一份） | — | `ac-srivijaya`、`ac-majapahit` | — |

不画：三国 / 两晋南北朝诸政权（K4–K5 中国留白，阅读说明"只画本主题讲到的政权"覆盖）、塞尔柱、喀喇汗、西夏（K9–K10 讲到时用点）。若 G0 清点后某帧有 holder > 8 色冲突，`--keep` 手工调，不新增 token。

### 2.3 关键帧（`control.json`；全部要素 `certainty: approximate`）

拍与帧的对齐已逐拍算过：两帧之间只有最后 30 % 交叉淡化，每拍 `t` 落在帧日期上或淡化开始前。

| K | t | holder | 用在 | 下一帧淡化窗 |
|---|---|---|---|---|
| K1 | -0138 | han, xiongnu, parthia, rome | 00、01-a…d、02-a | [-0083, -0060) |
| K2 | -0060 | han, xiongnu, parthia, rome | 01-e、03-a | [0017, 0050) |
| K3 | 0050 | han, xiongnu, kushan, parthia, rome | 02-b、03-b…e、04-a | [0183, 0240) |
| K4 | 0240 | sasanian, kushan, rome | 04-b、04-c | [0352, 0400) |
| K5 | 0400 | sasanian, gupta, rome | 04-d、02-c、04-e | [0560, 0629) |
| K6 | 0629 | tang, sasanian, eastern-rome, western-turks, tibet | 05-a…c | [0714, 0751) |
| K7 | 0751 | tang, abbasid, eastern-rome, tibet, uyghur | 06-a、05-d、06-b | [0776, 0786) |
| K8 | 0786 | tang, abbasid, eastern-rome, tibet, uyghur | 05-e、02-d、06-c…e、02-e | [0915, 0971) |
| K9 | 0971 | song, liao, eastern-rome, fatimid, chola | 07-a…c | [1135, 1206) |
| K10 | 1206 | jin, song, khwarazm, mongols | 08-a…c | [1240, 1254) |
| K11 | 1254 | mongols, song, mamluk, eastern-rome | 08-d、08-e | [1266, 1271) |
| K12 | 1271 | yuan, song, ilkhanate, golden-horde, chagatai, mamluk, eastern-rome | 09-a…d、07-d | [1316, 1335) |
| K13 | 1335 | yuan, ilkhanate, golden-horde, chagatai, mamluk, eastern-rome, delhi | 10-a、09-e、10-b…d、07-e | [1358, 1368) |
| K14 | 1368 | ming, golden-horde, chagatai, mamluk, eastern-rome, delhi | 10-e | — |

核对：07-d（1291）、09-d（1300）都早于 K12→K13 淡化窗（1316 起）；10-a 1338 在 K13 之后 ✓。G0 若某记录年份不覆盖帧年：按古文明规则 ±50 年内借用并在要素 `note`、SOURCES-GEO 写明；仍无则该实体不进此帧。帧日期若因清点改动，§1 的拍 `t` 同步改并在施工记录写明。

### 2.4 事件（`events.json`）

同类同标规则：有记录的大规模杀戮 / 屠城 / 人口买卖 = `atrocity`（空心方块）；会战 = `battle`（需 sides / result）；征服、建都、起兵等无可靠伤亡数 = `political`；疫病 = `disaster`；人物、文献、发明 = `milestone`；地点 = `site`。**汉、唐、罗马、帕提亚、阿拔斯、蒙古、热那亚、欧洲城市一律同标**。伤亡字段 `casualties` 只用于有单一明确来源的数字，并在 title/detail 写"某某记载"；蒙古屠城、广州、巴格达**不填** `casualties`（区间写在 detail 与细看），避免 Counter 把有争议的数字画成图标。

| id | t | kind | 锚点（坐标 G5 读 Wikidata P625） | 备注 / Facts |
|---|---|---|---|---|
| `evt-zhang-qian-sets-out` | -0138 | milestone | 长安 | F03 |
| `evt-zhang-qian-returns` | -0126 | milestone | 长安 | F03 |
| `evt-dayuan-war` | -0104（until -0101）| battle | 大宛（费尔干纳，区域点，detail 写都城贰师城今地有争议）| sides han / 大宛（实体只叙事，不上色：`dayuan` 叙事实体）；result attacker；伤亡用《史记》数字（F06）|
| `evt-western-regions-protectorate` | -0060 | political | 乌垒（轮台附近，F 步核）| F07 |
| `evt-han-takes-nanyue` | -0111 | political | 番禺（广州）| F08 |
| `evt-carrhae` | -0053 | battle | 卡莱（哈兰）| sides parthia / rome；result attacker；casualties rome 20,000 killed（普鲁塔克）+ 文字写 1 万被俘 | F15 |
| `evt-gan-ying` | 0097 | milestone | 区域点：波斯湾北岸（detail："条支"今地有争议，标记只表示'西边的海'方向）——若 F 步认为任何点都会误导，改挂在 `site-kashgar` 并写明 | F18 |
| `evt-kanishka` | 0127 | political | 布路沙布逻（白沙瓦）| F20 |
| `evt-andun-166` | 0166 | milestone | 日南（区域点）| F19 |
| `evt-an-shigao` | 0148 | milestone | 洛阳 | F22 |
| `evt-sogdian-letters` | 0313 | milestone | 敦煌西烽燧 T.XII（F 步读坐标；读不到放敦煌并写"以西约 90 km"）| F25 |
| `evt-kumarajiva` | 0401 | milestone | 长安 | F24 |
| `evt-silkworms-552` | 0552 | milestone | 君士坦丁堡 | F27 |
| `evt-aluoben-635` | 0635 | milestone | 长安 | F30 |
| `evt-turfan-contract-639` | 0639 | atrocity | 吐鲁番（高昌故城 / 阿斯塔那）| 人口买卖记录同标 atrocity；detail 写契约条款，无伤亡数 | F29 |
| `evt-an-lushan` | 0755 | political | 范阳（今北京）| 不填伤亡（户籍数不是死亡数）| F33 |
| `evt-tibet-dunhuang` | 0786 | political | 敦煌 | F34 |
| `evt-talas` | 0751 | battle | 怛罗斯（塔拉兹附近，战场今地有争议，detail 写）| sides abbasid / tang；result attacker；不填伤亡（数字来源晚且互相矛盾）| F31 |
| `evt-baghdad-founded` | 0762 | political | 巴格达 | F35 |
| `evt-diamond-sutra-868` | 0868 | milestone | 敦煌莫高窟 | F38 |
| `evt-zanj-revolt` | 0869（until 0883）| political | 巴士拉 | detail 写双方死亡，无可靠总数 | F37 |
| `evt-belitung-wreck` | 0830 | milestone | 勿里洞岛（沉船点按古文明同一坐标）| F13 |
| `evt-guangzhou-879` | 0879 | atrocity | 广州 | detail："据阿布·扎伊德·西拉菲，约 12 万外国人被杀；中国史书不载，史家认为夸大"；不填 casualties | F14 |
| `evt-guangzhou-shibosi-971` | 0971 | political | 广州 | F40 |
| `evt-chola-raid-1025` | 1025 | political | 巨港（与古文明同锚、同写法）| F43 |
| `evt-chinggis-1206` | 1206 | political | 斡难河源（区域点，F 步定）| F46 |
| `evt-otrar-1218` | 1218 | atrocity | 讹答剌 | 商队被杀（人数记载约 450，F 步核，读不到不写数）| F47 |
| `evt-merv-1221` | 1221 | atrocity | 梅尔夫 | F48 |
| `evt-nishapur-1221` | 1221 | atrocity | 内沙布尔 | F48 |
| `evt-rubruck-karakorum` | 1254 | milestone | 哈剌和林 | F49 |
| `evt-baghdad-1258` | 1258 | atrocity | 巴格达 | 区间写 detail，不填 casualties | F50 |
| `evt-ain-jalut-1260` | 1260 | battle | 艾因扎鲁特 | 只在 08 细看与索引；sides mamluk / mongols | F51 |
| `evt-yuan-1271` | 1271 | political | 大都 | F52 |
| `evt-kara-djigach-1338` | 1338 | disaster | Kara-Djigach（比什凯克附近，读论文坐标）| F58 |
| `evt-caffa-1346` | 1346 | disaster | 卡法（费奥多西亚）| F59 |
| `evt-plague-constantinople-1347` | 1347 | disaster | 君士坦丁堡 | F60 |
| `evt-plague-messina-1347` | 1347 | disaster | 墨西拿 | F60 |
| `evt-plague-alexandria-1347` | 1347 | disaster | 亚历山大 | F62 |
| `evt-plague-cairo-1348` | 1348 | disaster | 开罗 | F62（只在 10 章索引）|
| `evt-strasbourg-1349` | 1349 | atrocity | 斯特拉斯堡 | 受害人数 F 步核（编年史数字与现代估计并列）| F63 |
| `evt-ming-1368` | 1368 | political | 大都 | F65 |

**同址偏移**：长安（6 条）、大都（2）、巴格达（3）、敦煌（3）用 `displayOffset`，按郑和南京的规则（顺时针每 40°、半径 72 px、按 t 排序），在 `data/SOURCES.md` 记排布规则。

**sites**（`kind: site`，不进时间轴；均 Wikidata 坐标）：长安、洛阳、敦煌、莫高窟、玉门关、吐鲁番、龟兹（库车）、和田、喀什、大宛（区域点）、月氏王庭（区域点，detail 写今地争议，若 F 步认为误导则删）、撒马尔罕、布哈拉、梅尔夫、泰西封、安条克、罗马、君士坦丁堡、亚历山大、贝勒尼基（红海港）、穆济里斯、阿里卡梅杜（复用古文明坐标）、亚丁、门格洛尔、须文答剌—巴赛、淡马锡（与 `singapore-1819-1965` 的 `site-fort-canning-temasek` 同坐标）、泉州、哈剌和林、萨莱、卡法、塔纳、贝格拉姆，共约 32 个。每个 `detail` 写现代定位、历史角色、证据类型；区域点写明"区域参照，不是遗址"。

### 2.5 旅程（`movements.json`；`kind` land / sea；`linger` 到下一章首拍）

站点只取行纪 / 传记**明确写到并能认定今地**的地方；陆段站点间直线，海段走自动海路（§3.4 G6）。标签带"（主要站点）/ (main stops)"。

| id | from → to | 站点（依据） | linger |
|---|---|---|---|
| `mv-zhang-qian` | -0138 → -0126 | 长安 → 陇西 → （匈奴扣留，区域点）→ 大宛 → 康居 → 月氏 → 大夏 → 南道 → 长安（《史记·大宛列传》）| -0111 |
| `mv-faxian` | 0399 → 0413 | 长安 → 敦煌 → 鄯善 → 于阗 → 葱岭 → 印度诸地（选 3–4 个可认定的：布路沙布逻、华氏城、多摩梨帝）→ 师子国 → 耶婆提（今地争议：不作站点，海路直接到山东牢山）→ 青州（Legge 1886 译本）| 0552 |
| `mv-xuanzang` | 0629 → 0645 | 长安 → 凉州 → 瓜州 → 高昌 → 龟兹 → 碎叶 → 撒马尔罕 → 巴米扬 → 那烂陀 → …… → 和田 → 敦煌 → 长安（《大唐西域记》《慈恩传》，取 ≤ 15 站）| 0755 |
| `mv-rubruck` | 1253 → 1255 | 君士坦丁堡 → 苏达克 → 萨莱（拔都营帐，区域点）→ 哈剌和林 → 返程至的黎波里（Rockhill 1900）| 1258 |
| `mv-polo-land` | 1271 → 1275 | 阿卡 → 霍尔木兹 → 巴达赫尚（区域点）→ 喀什 → 和田 → 敦煌（沙州）→ 上都（按 Yule–Cordier 本；争议点不入）| 1287 |
| `mv-polo-sea` | 1291 → 1295 | 泉州 → 占城 → 须文答剌 → 斯里兰卡 → 马拉巴尔 → 霍尔木兹 → （陆路）大不里士 → 特拉布宗 → 君士坦丁堡 → 威尼斯 | 1300 |
| `mv-rabban-sauma` | 1287 → 1288 | 马拉盖 → 特拉布宗 → 君士坦丁堡 → 那不勒斯 → 罗马 → 热那亚 → 巴黎 → 波尔多 → 罗马 → 马拉盖（Budge 1928）| 1300 |
| `mv-ibn-battuta-china` | 1345 → 1346 | 须文答剌—巴赛 → 占城一带（区域点，可省）→ 泉州（Yule 1916 卷 4 译本）| 1349 |

若引擎实现 E-SR2，以上全部 `certainty: approximate`（虚线轨迹）；否则标签带"（示意）"（古文明先例）。

### 2.6 路线层（`datedLayers`，`kind: line`，全部 `certainty: approximate`，需 E-SR1）

| 层 id | 文件 | f–u | 构成 | 依据 |
|---|---|---|---|---|
| `routes-han` | `sr-routes-han` | -0060 → 0220 | 河西（长安—武威—张掖—酒泉—敦煌—玉门关）+ 《汉书·西域传》南道（鄯善—且末—精绝—于阗—莎车—疏勒）与北道（车师—焉耆—龟兹—姑墨—疏勒）+ 葱岭以西至大宛、大月氏（区域站点不连）+ 伊西多尔驿程（宙格玛—塞琉西亚—埃克巴坦那—赫卡通皮洛斯—木鹿）| F07、F69 |
| `sea-han` | `sr-sea-han` | -0111 → 0220 | 徐闻 / 合浦 → 马六甲海峡 → 斯里兰卡 → 印度东南岸（《汉书·地理志》可认定的点，黄支不定点）+ 《航行记》贝勒尼基 → 亚丁湾 → 穆济里斯 | F08、F09 |
| `routes-tang` | `sr-routes-tang` | 0640 → 0790 | 长安—河西—伊州—西州—安西（龟兹）—疏勒—碎叶 + 撒马尔罕（贾耽"安西入西域道"可认定段）| F70 |
| `sea-tang` | `sr-sea-tang` | 0785 → 1000 | 贾耽"广州通海夷道"：广州—占不劳山—军突弄山—海峡（"质"）—师子国—没来国—提䫻国—乌剌—末罗—缚达；只用今地有共识的站点 | F70 |
| `routes-abbasid` | `sr-routes-abbasid` | 0762 → 1000 | al-Thurayya 路段（10 世纪路网），裁到图版，DP 2 km | D6 |
| `routes-mongol` | `sr-routes-mongol` | 1271 → 1368 | 裴哥罗梯：塔纳—阿斯特拉罕—萨莱—乌尔根奇—讹答剌—阿力麻里—哈密—甘州—（杭州 / 大都）| F55 |

`[f, u)` 是"本层依据的文献所反映的年代"，不是道路存在的起止；SOURCES 与细看写明。

### 2.7 名词表（`glossary.json`，15 个；每词全主题只包首见处，EN/ZH 各一）

| id | EN / ZH | 定义要点（EN / ZH 施工时成稿） | see |
|---|---|---|---|
| `term-silk-roads` | Silk Roads / 丝绸之路 | 19 世纪后流行的名字，指连接亚洲、欧洲、非洲的许多陆路与海路；运的不只是丝 | `term-maritime-silk-road` |
| `term-maritime-silk-road` | Maritime Silk Road / 海上丝绸之路 | 同古文明定义（共用措辞）| `term-monsoon` |
| `term-monsoon` | Monsoon / 季风 | 按季节改变方向的大范围风；帆船据此安排出航和返航 | |
| `term-oasis` | Oasis / 绿洲 | 沙漠中有水源、可以耕种和居住的地方 | `term-caravan` |
| `term-caravan` | Caravan / 商队 | 结伴用骆驼、马等驮运货物长途行走的一群人 | `term-caravanserai` |
| `term-caravanserai` | Caravanserai / 商队客栈 | 路旁供商队住宿、存货、饮牲口的院落 | |
| `term-western-regions` | Western Regions / 西域 | 汉代以后中国史书对玉门关、阳关以西地区的称呼；那里有许多各自的国家 | |
| `term-protector-general` | Protector-General / 都护 | 汉、唐在西域设置的最高军政长官 | |
| `term-sogdians` | Sogdians / 粟特人 | 以撒马尔罕、布哈拉为中心的中亚民族，以经商闻名，语言曾是商路通用语 | |
| `term-church-of-the-east` | Church of the East / 东方教会 | 以美索不达米亚为中心的基督教会，唐代称景教 | |
| `term-manichaeism` | Manichaeism / 摩尼教 | 3 世纪摩尼在伊朗创立的宗教，曾传到北非、中亚和中国 | |
| `term-caliphate` | Caliphate / 哈里发国 | 由哈里发（穆罕默德的继承者）统治的伊斯兰国家 | |
| `term-khanate` | Khanate / 汗国 | 由可汗统治的国家；蒙古帝国后来分成几个汗国 | |
| `term-yam` | Yam / 站赤（驿站制度） | 蒙古帝国的驿站网，供使者换马、住宿 | `term-khanate` |
| `term-plague` | Plague / 鼠疫 | 由鼠疫杆菌引起的传染病；14 世纪中叶的大流行后来被称为"黑死病" | |

### 2.8 规格行（HUD 左上 PLATE）

ENTITIES / KEYFRAMES 14 / EVENTS / MOVEMENTS 8 / ROUTE LAYERS 6；不加计数层。

---

## 3. 数据管线

### 3.1 来源与许可（许可原文施工时在页面上再抄一遍，不凭记忆）

| D# | 来源 | 许可（本轮读到的页面原话） | 大小 | 用途 | 进发布数据？ |
|---|---|---|---|---|---|
| D1 | **Cliopatria v0.2.1**（GitHub tag 2026-10-03；Zenodo concept doi:10.5281/zenodo.13363121；论文 doi:10.1038/s41597-025-04516-9）| CC BY 4.0（仓库 LICENSE.md，古文明 INVENTORY 已抄原文）| `cliopatria.geojson.zip` **46,005,176 bytes**（古文明 G0 记录的 SHA-256 `e10a4e42…eed4`；本地 raw 已删，需重下）| 14 帧控制区 | 是（署名 + 注明裁剪简化）|
| D2 | NE 1:10m land → `public/geo/ancient-world-plate.json`（仓库已有）| 公有领域 | 438,534 bytes | 图版陆地 | 是 |
| D3 | NE 1:10m `rivers_lake_centerlines`、`lakes`（naturalearthdata.com）| 公有领域 | 约数 MB，G0 记实际字节与 SHA | 河流、咸海 / 伊塞克湖岸 | 是 |
| D4 | Wikidata P625（`wbgetentities`，构建期）| CC0 | 每点几 KB | 全部站点、地点坐标 | 是 |
| D5 | Pleiades（逐条 JSON）| CC BY 3.0 | 每点几 KB | 地中海—中亚古地名核对；只有采用了其坐标的点署名 | 视情况 |
| D6 | **al-Thurayya**（github.com/althurayya/althurayya.github.io，`master/routes.json`、`master/places.geojson`）| README："original datasets created and curated by the project are licensed under CC BY 4.0 … place records, route records, coordinates"；"Source-derived material and third-party data are excluded unless their own terms permit"——**G0 读 DATA-LICENSE.md 确认路段几何属于前者**（§0.1-5）| routes.json **6,689,410 bytes**；places.geojson **3,350,965 bytes**（GitHub API 元数据）| `routes-abbasid` | 是（署名，注明依据 Cornu 1983 图集配准）|
| D7 | `public/geo/ac-srivijaya.json`、`ac-majapahit.json`（仓库已有，Cliopatria 派生）| CC BY 4.0 → 内容家族 | 15,332 / 30,557 bytes | 势力范围层 | 是 |
| D8 | 一手文献（不是数据集）：《史记》《汉书》《后汉书》《新唐书》（公有领域原文）；英译 Schoff 1912 / 1914、Legge 1886、Rockhill 1900、Yule 1914–16、Yule–Cordier 1903、Budge 1928（美国公有领域）| 公有领域 | — | 站点表与站序 | 只用事实（站点名、顺序） |
| 可选 D9 | Commons *1346-1353 spread of the Black Death in Europe map.svg*（Flappiefh，据 Cesana, Benedictow & Bianucci 2017）| "licensed under the Creative Commons Attribution-Share Alike 4.0 International license" | 1,962,272 bytes | §0.1-6 备选 | 选了才进，**单独文件 + LICENSE-CONTENT 例外** |
| 可选 D10 | Itiner-e static 2024（Zenodo 10.5281/zenodo.17122148）| CC BY 4.0 | 约 263.9 MB（十个文件）| §0.1-7 备选 | 选了才进 |
| 可选 D11 | ORBIS v2 node / edge tables（purl.stanford.edu/mn425tz9757）| "Creative Commons Attribution 3.0 Unported license (CC BY)"，"may be subject to additional license and use restrictions applied by the depositor" | 页面未列 | 罗马—红海段核对 | 默认不用 |
| 可选 D12 | Frachetti et al. 2017 PastPart 模型数据（doi:10.7936/K7V986GW）| CC BY 4.0（检索结果所述；记录页对本机 403，未读到原文）| 未知 | 高地游牧通道"模型层"——模型不是史料，默认不用 | 默认不用 |
| 核对 C1 | Commons *Silk Road in the I century AD - en.svg*（Kaidor）| CC BY-SA 4.0；页面称"based on Transasia trade routes 1stC CE gr2.png"，**未列任何文献来源** | 890,067 bytes | 只作肉眼并排核对 | 否 |
| 核对 C2 | UNESCO 1442 / 1675 申遗文件地图、ICOMOS《丝绸之路主题研究》（Williams 2014）| © UNESCO / ICOMOS | — | 只看不描 | 否 |
| 拒用 | CHGIS V6（"free for academic research, no commercial use, resale, or redistribution"——不能派生发布）；OWTRAD（未找到任何许可）；Commons *Silk route.jpg*（公有领域，但页面自承"A source (reference) has not been provided for the data"）；World History Encyclopedia 地图（BY-NC-ND）；historical-basemaps（GPL-3.0）；DARMC（无许可） | | | | 否 |

**许可隔离**：发布的 `control.json`、`sr-*.json`、`silk-road-rivers.json`、`events.json`、`movements.json` 只由 PD / CC0 / CC BY 来源 + Atlas 原创组成，家族 CC BY-NC-SA 4.0；不把任何 CC BY-SA 几何并入。`THIRD-PARTY-NOTICES.md` 加 Cliopatria（若未有）、al-Thurayya、Pleiades（采用时）。

### 3.2 管线步骤（文件全在 `scripts/geo/silk-road/`，`raw/`、`work/`、`check/` gitignore）

每步把命令、版本、SHA-256、计数写进 `SOURCES-GEO.md`；不许手画多边形、不许 bbox 当版图、不许从记忆填坐标。

- **G0 下载与清点**（Gavin 批准后；结果交主会话看过再往下）：下载 D1、D3、D6；`inventory.ts`（复用古文明的同名脚本思路）对 §2.2 每个实体模糊匹配 Cliopatria `Name`，输出每帧覆盖表；读 al-Thurayya `DATA-LICENSE.md` 抄原文；**决策点**：主会话按清点结果确认"画面 / 只画点"，记入施工记录。
- **G1 图版**：`topic.yaml` 写 `basemap.region { bounds: [-12, -12, 135, 58], land: ancient-world-plate, rivers: silk-road-rivers }`，`maxZoom: 9`。不重跑 region-land。
- **G2 河流**：`build-rivers.ts` 从 D3 按名取 §0.0-7 名单；黄河只取兰州—郑州（用 NE 要素的 `name` + 经度裁切，裁切点写 SOURCES-GEO）；咸海、伊塞克湖从 NE lakes 外环取岸线。≤ 200 KB，`riversFile` 校验通过。
- **G3 控制区**：`build-keyframes.ts` 读 `keyframes.json`（§2.3 的机器版），年份规则 `FromYear ≤ Y ≤ ToYear`；同 holder 多条记录合并；裁到图版陆地；帧内重叠 ≥ 2 % 停下交主会话；`simplify.ts --topic silk-road`，`control.json` ≤ 2.0 MB，末尾 `rings: N, zero-area 0, self-crossing 0`，slug 加进 `tests/geo-rings.test.ts`。**先做 K1 与 K12**（最复杂）并排图主会话看过再铺其余。
- **G4 站点**：`points.ts` 对 §2.4 sites、§2.5 / §2.6 全部站点取 Wikidata P625（5 位小数）；有 Pleiades id 的同取，差 > 5 km 列出、主会话定；al-Thurayya 地名与 Wikidata 差 > 10 km 列出。今地有争议的站点（黄支、条支、石塔、耶婆提、贰师城、月氏王庭）**不进线**，只在 detail 说明。
- **G5 陆上站点连线**：`itinerary.ts` 读 `itineraries.json`（每条：`id`、`source`（文献与卷章）、`stations: [{ name, wikidata, note }]`），相邻站点间大圆直线；若 al-Thurayya 有连接同两站的路段，用其几何并记一行。输出 LineString，`properties: { f, u, certainty: "approximate", src }`。
- **G6 海上自动海路**：`sea-path.ts`：把图版陆地栅格化为 0.05°（约 5.5 km）水 / 陆格网，港口吸附到 15 km 内最近水格，8 邻域 A*（代价 = 大圆距离），结果 DP 3 km；检查每段与陆地相交 < 1 km。**这是可复现的程序，不是手画**；SOURCES 与细看写"港口之间的线是程序在海上求出的最短路径，不是船走过的航迹；真实航行常沿岸、看季风"。
- **G7 打包**：`sr-*.json` 每层一个 TopoJSON（对象名 = 文件名），量化 100000，单个 ≤ 150 KB；`pnpm validate` 的 `datedLayerIssues` 通过。
- **G8 配色**：`colour-holders.ts --topic silk-road --write`；势力范围层与同帧控制区冲突时手工调。
- **G9 核对**：`check.ts` 每帧并排图 `docs/screenshots/silk-road/geo-K#.png`；路线层与 C1、C2 肉眼对照，差别 > 200 km 的写进 SOURCES-GEO"来源之间的差别"（不改我们的线，改的话只能改站点表依据）。

### 3.3 精度口径（写进 SOURCES-GEO 和背景章细看④）

| 对象 | 精度 | 读者看到的说明 |
|---|---|---|
| 政权范围 | Cliopatria 作者称"一种版本"，无误差量化 | 虚线、淡底；"范围是大致的" |
| 城市 / 站点 | Wikidata 点，城市级（几公里）；古城址与今城不同处在 detail 写 | "标记在今某地" |
| 陆上路线 | 站点有文献、顺序有文献；站点间直线**不是道路**；al-Thurayya 路段依 Cornu 1983 图集配准，精度未公布 | 虚线；KEY："站点有记录，连线为示意" |
| 海上路线 | 港口有文献；航线是程序最短路 | 同上 |
| 旅程 | 只用行纪写明的站点，争议站点不用 | "主要站点" |
| 河流 / 海岸 | 今天的 NE 1:10m；咸海按 NE（湖岸非 14 世纪）| 阅读说明"按今天" |

### 3.4 产物清单

| 运行时文件 | 来源 | 预算 |
|---|---|---|
| `src/content/topics/silk-road/data/control.json` | D1 | ≤ 2.0 MB |
| `public/geo/silk-road-rivers.json` | D3 | ≤ 200 KB |
| `public/geo/sr-routes-han.json` 等 6 个 | D4、D5、D6、D8 | 每个 ≤ 150 KB |
| `events.json`（约 40 dated + 32 site）、`movements.json`（8）、`entities.json`（约 28）、`presets.json`（19）、`glossary.json`（15）、`sources.json` | 本 spec | — |
| 复用：`ancient-world-plate.json`、`ac-srivijaya.json`、`ac-majapahit.json` | 仓库 | 0 新增 |

---

## 4. 引擎扩展（压到最小）

### 4.1 复用（已在 main，docs/06 有契约）

区域图版 `basemap.region`（含河流、河名、经纬网、纸边）；`colorBy: entity` + DSatur；控制区 `certainty: approximate`；`datedLayers`（area 势力范围、line 路线层）；`mixedEra`（docs/43 E1）；`movements` + `linger`；`disaster` / `site` / `atrocity` / `milestone` 事件；`displayOffset` + `displayLeg`（郑和）；`strings`、`blocLabels`；背景章、阅读说明、名词、FlyTo、TopicLink、本章索引。

### 4.2 新增

| # | 内容 | 现状（已读代码） | 最小改动 | 阻塞？ |
|---|---|---|---|---|
| **E-SR1** | **按年份线图层的 `certainty: approximate` 画虚线** | `src/engines/time-scene/stages/geo/datedLayers.ts`：`kind: line` 只有一条实线（宽 zoom 10→13 由 1→2.5 px，不透明 .9），**不读 `certainty`**；`area` 已按 `certainty` 分 edge / dash | `line` 拆两层：`certain` 实线、`approximate` 加 `line-dasharray [3, 2]`（与控制区近似分界同一虚线）；区域视角（zoom ≤ 6）宽度下限 1.2 px，保证图版全图可读；KEY 该层若含近似要素画虚线样条；单测（style 生成）+ docs/06 datedLayers 一句。其他主题的 line 层（新加坡铁路等无 `certainty`）输出逐字不变 | 是（不做则路线层画成实线，与"示意"矛盾；退路：路线全改 movements，但 movements 不能在 u 年结束后消失又不留到末尾） |
| **E-SR2**（可选） | **movement 的 `certainty: approximate`**：轨迹只画步进虚线、不画 .3 实底；KEY 行"示意路线 / Schematic route" | `schema.ts` movementSchema 无此字段 | schema 加可选 `certainty`；`lib/frame.ts` / 渲染层按它切换；单测；docs/06 一句 | 否（退路：标签加"（示意）"，古文明先例） |

不需要：新事件种类、新颜色 token、`basemap.local`、`borders`、伤亡计数改动、航速 / 季风模拟。E-SR1/E-SR2 归一个 Opus 引擎代理，文件归属 `stages/geo/datedLayers.ts`、`schema.ts`（E-SR2）、`lib/frame.ts`（E-SR2）、`tests/time-scene/**`、docs/06；改前主会话确认无别的代理在改引擎。

### 4.3 施工前核对（结论写施工记录）

| # | 核对 | 不过怎么办 |
|---|---|---|
| V1 | 复用 `ancient-world-plate` 配窄 `bounds` 时纸边、全图预设、经纬网（10°）正常 | 报主会话；不改他题文件 |
| V2 | 图版内**里海是水、咸海按 NE 湖岸**、伊塞克湖可见 | NE land 若把里海当陆地：加 lakes 面作水（河流文件同法）|
| V3 | -0138 → 1368 时间轴：段标签 "138 BCE"…"150 CE"…"1368"；拍刻度、拖动正常 | — |
| V4 | 28 个实体、14 帧的图例只列当前帧 holder；DSatur ≤ 8 色 | `--keep` 手调 |
| V5 | 6 个路线层 + 2 个势力范围层 + 8 条旅程同屏时 fps（`pnpm shoot silk-road --perf`）| 章节 `layers` 只开本章需要的层 |
| V6 | 约 32 个 site 菱形在全图视角的密度；`displayOffset` 圈在 zoom 3 以下可读 | 全图拍少开 sites |
| V7 | 背景章 `state.time` -0138 与 K1 一致；00-b 字幕写 1877 但地图时间不跳 | — |
| V8 | `pnpm shoot --keys` 区域图版拖动检查按 docs/27 处理 | — |

---

## 5. 写法与用词

- 口吻按 `writing-rules.md`：每章正文 EN 200–300 词 / ZH 350–500 字，先事实后解释；评价词（伟大、辉煌、野蛮、残暴、开辟文明）不进正文；数字 `<Num s="S#">`，区间两端各自来源；日期 EN "138 BCE" / "150 CE"，ZH "公元前 138 年" / "公元 150 年"（同章后文可省"公元"）；约数写 "about / 约"。
- 每章自查：至少两方的处境；各方的战争、奴役、屠杀同一写法；不用"我们 / 敌人 / 我军"；争议两边写不下结论；受害者有名字写名字。

| 不写 | 写 | 说明 |
|---|---|---|
| 张骞"开辟 / 凿通"丝绸之路 | 张骞出使西域；司马迁称之为"凿空" | 路早已存在；"凿空"加引号署名 |
| 中国把丝绸 / 四大发明传给世界 | 丝、纸、印刷从东向西传；马、葡萄、玻璃、佛教从西向东传 | 双向 |
| 胡人、蛮夷、番 | 粟特人、波斯人、阿拉伯人……；原文引用加引号署名 | |
| 匈奴"入侵 / 骚扰" | 匈奴攻入（具体地点）；汉军出击（具体地点） | 双方同一动词 |
| 景教 | 东方教会（唐代称景教） | 首次 |
| 拜占庭帝国 | 东罗马帝国（后人称拜占庭） | F72 |
| 黑死病（当时） | 鼠疫大流行（后来被称为"黑死病"） | F71 |
| 蒙古和平 / Pax Mongolica（作事实） | "一些现代史家称这段时期为'蒙古和平'" | 署名 |
| 屠城英雄 / 天谴 / 上帝之鞭 | 攻下某城，某史家记载死者若干，现代史家认为…… | |
| 发现、探险家（用于使者 / 商人） | 出使、旅行、行商 | |
| 朝贡（作中性事实） | 朝廷记作"朝贡"；对方可能视为贸易或外交 | 同郑和名词 |
| 奴隶（作为货物名词罗列） | 被奴役的人 / 被卖的人 | 人不是"货" |
| 西域"诸国归附" | 某国向汉遣使 / 汉在某地设官 | 不替对方表态 |
| 海上丝路"起点在泉州 / 广州" | 泉州、广州是这张网上的大港 | 网络无起点 |

中文译名待核（Gavin 或课本核对）：粟特 / 索格底亚那、贵霜、帕提亚（安息）、怛罗斯、讹答剌、术赤兀鲁思、本·伊居、裴哥罗梯、拉班·扫马、鲁布鲁克、优婆遮（契约人名的汉译以学界译本为准）、须文答剌—巴赛。

---

## 6. 插图需求清单（外包 Codex；主会话逐张看过再处理）

**统一规则**（在 `scripts/illustrate.ts` 的 `STYLE_BRIEF` 之上追加，原样附在每张 SUBJECT 之后）：

> STRICT: no text, no letters, no numbers, no inscriptions, no pseudo-script, no seals or stamps (surfaces where writing would be are left blank or show only faint indistinct strokes with no character shapes); no flags, no coins, no religious figures or symbols, no human faces or portraits, no weapons in use, no blood, no modern objects (no metal screws, rubber, plastic, modern harness buckles, modern rope coils, modern tools); no map, no compass rose, no arrows; draw as a museum or archaeological reconstruction plate.

验收（每张都查，任何一条不过就重做，不修图凑合）：①放大到 200 % 逐处找任何像文字的笔画（docs/69 的虎符教训）；②数量逐个数（腿、驼峰、隔舱、桅）；③年代：服饰器物与 §6 表的"年代约束"逐项对；④cinema 反相后意思不颠倒（docs/69 §4）；⑤透明底、灰度、尺寸（封面 1024²，章图 1536×1152 → 1200×900 WebP）；⑥caption 写"为本主题画的示意图，依据……"，不当史料；⑦alt 写图里实际画了什么。

| id | 章 | 画什么（SUBJECT 英文原样交 Codex） | 年代 / 器物约束 | 不许出现 | 验收重点 |
|---|---|---|---|---|---|
| `silk-road`（封面） | — | a museum still-life plate of three objects that travelled in opposite directions along the Silk Roads: a Tang-dynasty unglazed earthenware figurine of a standing Bactrian camel with two humps and a loaded pack frame of bundled bolts between the humps; beside it a loosely folded length of plain-weave silk with a soft drape; in front a Sasanian-style cut-glass bowl with rows of round concave facets in a honeycomb pattern | 骆驼俑按唐代陶俑造型（双峰、驮架在两峰之间）；玻璃碗按萨珊切子玻璃（如正仓院白琉璃碗类型）；丝为素织 | 骆驼上的人、马鞍蹬、任何纹样文字、彩色釉（图是灰度但不要画成三彩斑块）、钱币 | 双峰；四条腿；碗面是圆形凹切面而不是花瓣；三件物体互不遮挡主体 |
| `silk-road-hexi-wall` | 01 | a landscape engineering plate of a Han-dynasty frontier wall in the Gansu desert near Dunhuang: a low wall built of alternating thin layers of gravel and bundled reeds, partly eroded so the layers show in section, with a square rammed-earth beacon tower nearby and a small heap of reed bundles for signal fires; flat gravel desert, distant low hills, no people | 汉代玉门关一带"芦苇夹砂砾"夯层；烽燧方形夯土 | 砖砌城墙、垛口、明长城式样、人、旗 | 层理是芦苇层与砂砾层交替；没有砖 |
| `silk-road-sewn-ship` | 02 | a cutaway reconstruction plate of a 9th-century Indian Ocean sewn-plank ship like the Belitung wreck: a wooden hull whose planks are stitched together edge to edge with cord through rows of small holes, no nails; one mast with a single square-ish sail furled; inside the cut-open hold, stacks of plain ceramic bowls packed in large storage jars | 缝合船板（贝利通 / Jewel of Muscat 复原）；碗只画素面或模糊纹样 | 铁钉、舵轮、多桅、中式帆篷、碗上的字、海浪中的人 | 船板之间可见缝线孔与绳；无钉；碗在罐里成摞 |
| `silk-road-begram-goods` | 03 | a museum plate of objects of the kind found together at Begram, Afghanistan: a tall Roman glass beaker with a plain ribbed surface, a Han-dynasty lacquer ear-cup (oval shallow cup with two flat side handles), and a short string of polished carnelian beads; arranged on no ground like specimens | 罗马吹制玻璃杯（素面）；汉代漆耳杯形制 | 人物纹（贝格拉姆象牙板有人像，不画）、文字、神像 | 耳杯两只平耳在长边；玻璃杯无画像 |
| `silk-road-mogao-cliff` | 04 | an architectural plate of the Mogao cave cliff near Dunhuang seen from across the dry riverbed: a long sandstone-conglomerate cliff face cut with rows of small rectangular cave entrances at several levels, connected by wooden walkways and ladders, a multi-storey wooden facade on one tall cave, poplar trees at the cliff foot | 崖面与窟口外观；木构窟檐 | 窟内佛像、壁画人物、匾额文字、游客、现代水泥栈道与栏杆、电线 | 只画外观；无任何文字匾；栈道是木构 |
| `silk-road-camel-pack` | 05 | a technical side-view plate of a Bactrian camel standing with a caravan pack load: two humps, a wooden pack frame resting on felt pads between and around the humps, two large wrapped bales hung on either side and tied with cords, a lead rope from a nose peg; no rider | 双峰驼；木驮架 + 毡垫；绳结 | 单峰驼、马鞍、金属扣件、骑者、铃铛上的字 | 两个驼峰；四条腿各两关节方向正确；驮架不压在峰顶 |
| `silk-road-papermaking` | 06 | a process plate of hand papermaking in a medieval Central Asian or Middle Eastern workshop, shown as separate numbered-by-position steps without numbers: rags and plant fibre soaking in a stone vat, a wooden mortar for beating pulp, a rectangular wooden mould with a fine screen lifting a wet sheet from a vat of pulp, and finished sheets drying pressed flat on a plastered wall | 手工抄纸，工具木石；不定具体某国工艺 | 机器、齿轮、金属滚筒、文字、人脸（手和前臂可画） | 四个步骤彼此分开、读得出顺序；纸面空白 |
| `silk-road-quanzhou-ship` | 07 | a cutaway reconstruction plate of the 13th-century Song ship excavated at Quanzhou in 1974: a broad V-shaped wooden hull with a keel, the hull cut open lengthwise to show thirteen watertight compartments separated by transverse bulkheads, multiple layers of hull planking, the stub of a mast step; no sails, no people | 1974 泉州后渚沉船：V 形底、龙骨、13 隔舱、多层船板 | 帆、旗、炮、文字、现代甲板设施 | **数隔舱 = 13**（数不对重做）；舱壁横向 |
| `silk-road-flea` | 10 | a natural-history plate of a rat flea (Xenopsylla cheopis) in side view, enlarged: laterally flattened body, no wings, six legs with the large jumping hind legs, short antennae tucked in grooves, mouthparts pointing down; a small inset of a rod-shaped bacterium cell drawn as a simple capsule shape | 印鼠客蚤侧视；插图注"传播途径有争论（鼠蚤 / 人体寄生虫）" | 翅膀、八条腿（那是蜱）、病人、尸体、老鼠尸体、显微镜 | **6 条腿、无翅**；侧扁 |

图数：封面 1 + 章图 8。不画：战争场面、屠杀、病人、人物肖像、宗教造像、地图。08、09 章不配图（地图与旅程足够）。

---

## 7. 敏感段落清单（给 Gavin 读，先看中文）

施工后按实际段落号更新，加进 `docs/review-queue.md`「一、草稿主题」：

- **01 张骞**：匈奴的写法（只有汉方史料，写明）；细看"大宛之战的代价"（《史记》数字）。
- **02 季风之海**：事件 `evt-guangzhou-879` 与细看③——只有阿拉伯文记载的 12 万 / 20 万，中国史书不载、史家疑其夸大；细看④"海路上的奴隶"（读不到学术来源就删）。
- **03 四个帝国**：卡莱之战数字（普鲁塔克）。
- **05 粟特与唐**：639 年吐鲁番契约（条款原样转述、买方身份待 F 步定）；安史之乱"户籍数字不是死亡数"的写法；乱后对粟特人的敌意。
- **06 巴格达**：僧祇人起义（东非被奴役者）；藏经洞写本被带走（§0.1-9 中性写法）；怛罗斯与造纸"传说 vs 证据"。
- **07 港口**：淡马锡与《马来纪年》传说的一句；汪大渊记龙牙门劫船。
- **08 蒙古征服**：梅尔夫、内沙布尔、巴格达的数字区间与"夸大但属实"的措辞；被掳工匠（布歇）；马穆鲁克的奴隶兵出身。
- **09 诸汗国之间**：黑海奴隶贸易（热那亚、威尼斯、金帐汗国、马穆鲁克各方都写）；马可·波罗真实性争论。
- **10 瘟疫**：卡法"抛尸"说的处理；死亡比例区间；斯特拉斯堡 1349 年对犹太人的屠杀（受害人数、措辞；"为什么今天还要记住"一句）；"东亚有没有黑死病"不确定的写法。
- 名词 `term-silk-roads`、`term-western-regions`、`term-plague` 的释义。

---

## 8. 与其他主题的分工与互链

| 主题 | 它讲的 | 本主题怎么处理 | 链接（MDX id 已在 main 核对） |
|---|---|---|---|
| `ancient-civilisations` | 汉的纸（蔡伦）、扶南 / Óc Eo、室利佛逝、贝利通沉船、朱罗 1025、满者伯夷、马六甲建立、季风海路（示意） | 不重讲；海上章各一句 + 链接；复用其势力范围层 `ac-srivijaya` / `ac-majapahit`；名词"海上丝绸之路"措辞一致 | `ch="china"`、`ch="southeast-asia-seas"`、`ch="southeast-asia-kingdoms"` |
| `zheng-he` | 1405–1433 明朝船队、旧港、马六甲、锡兰、霍尔木兹、东非；"已经相连的海" | 本主题止于 1368；07、10 章结尾各链一次；不画 1405 以后任何东西 | `ch="background"`、`ch="setting-sail"` |
| `warring-states` | 到前 206 年 | 背景章、01 章链"秦汉之交" | `ch="after-221"` |
| `singapore-1819-1965` | 淡马锡、福康宁考古、汪大渊、《马来纪年》 | 07-e 一拍 + 细看一段，坐标与其 `site-fort-canning-temasek` 相同，文字本题自写 | `ch="background"` |
| `southeast-asia` | 今天的地理与亚细安 | 季风解释链其气候章（若措辞合适） | `ch="seasons-and-rain"`（施工时读正文再定）|

反向链接（从上述主题链到 `silk-road`）**本轮不加**：它们都已 published，改动另开任务、Gavin 批准后做。

---

## 9. 来源表（P# → 施工时的 S#）

| P# | 来源 | 用途 | 状态 |
|---|---|---|---|
| P01 | Daniel C. Waugh, "Richthofen's 'Silk Roads': Toward the Archaeology of a Concept", *The Silk Road* 5/1 (2007)；重印 https://faculty.washington.edu/dwaugh/publications/waughrichthofen2010.pdf | F01 | ✓（检索摘要 + 重印本） |
| P02 | Matthias Mertens, "Did Richthofen Really Coin 'the Silk Road'?", *The Silk Road* 17 (2019) https://edspace.american.edu/silkroadjournal/wp-content/uploads/sites/984/2020/02/2-Mertens-Did-Richthofen-Really-Coin-the-Silk-Road.pdf | F02 | ✓ |
| P03 | Smithsonian / Freer\|Sackler, *Sogdians: Influencers on the Silk Roads* · Ancient Letters https://sogdians.si.edu/ancient-letters/ | F25 | ✓ |
| P04 | Silk Road Seattle (U. Washington) · The Sogdian Ancient Letters https://depts.washington.edu/silkroad/texts/sogdlet.html | F25（译文） | ✓ |
| P05 | Valerie Hansen, *The Silk Road: A New History* (OUP 2012)；Yoshida Yutaka & Moriyasu Takao 1989（吐鲁番契约）；课程页 https://webspace.ship.edu/jkskaf/Silk%20Road/a14)%20Sogdians.html（二手） | F29 | ◐ |
| P06 | Jonathan M. Bloom, *Paper Before Print* (Yale 2001)；Encyclopaedia Iranica "Paper and papermaking" https://iranicaonline.org/articles/paper-and-papermaking | F32 | ◐ |
| P07 | Bloom, "Revolution by the Ream", *Aramco World* 50/3 (1999) https://archive.aramcoworld.com/issue/199903/revolution.by.the.ream-a.history.of.paper.htm | F32 | ◐ |
| P08 | Spyrou M. A. et al., "The source of the Black Death in fourteenth-century central Eurasia", *Nature* 606 (2022) doi:10.1038/s41586-022-04800-3 | F58 | ✓（摘要与多家报道） |
| P09 | Benedictow, *The Complete History of the Black Death* (2021)；Jedwab, Johnson & Koyama 2019；综述 https://www.medievalists.net/2023/11/how-many-people-died-black-death/ | F61 | ◐ |
| P10 | 司马迁《史记·大宛列传》（ctext.org，公有领域原文） | F03、F04、F06 | ⚑ |
| P11 | 班固《汉书·张骞李广利传》 | F03、F05 | ⚑ |
| P12 | 《汉书·西域传》 | F05、F07、路线站点 | ⚑ |
| P13 | 《汉书·地理志下》（粤地条） | F08 | ⚑ |
| P14 | 妇好墓玉器产地研究（F 步找考古学论文；读不到删 F11） | F11 | ⚑ |
| P15 | 《后汉书·西域传》 | F18、F19 | ⚑ |
| P20 | *Periplus of the Erythraean Sea*, tr. Schoff 1912（Fordham Internet History Sourcebooks） | F09、路线 | ⚑ |
| P21 | Faxian, *A Record of Buddhistic Kingdoms*, tr. Legge 1886（Project Gutenberg） | F12、`mv-faxian` | ⚑ |
| P22 | Plutarch, *Crassus* 31（Loeb 1916，LacusCurtius） | F15 | ⚑ |
| P23 | Florus, *Epitome* 1.46 | F16 | ⚑ |
| P24 | Pliny, *Natural History* 12.84（Perseus） | F17 | ⚑ |
| P25 | Harry Falk 关于迦腻色伽纪元的论文；Rabatak 碑（Sims-Williams） | F20 | ⚑ |
| P26 | Encyclopaedia Iranica "Sasanian dynasty" | F21 | ⚑ |
| P27 | Erik Zürcher, *The Buddhist Conquest of China*（安世高、鸠摩罗什） | F22、F24 | ⚑ |
| P28 | UNESCO World Heritage 440 Mogao Caves | F23 | ⚑ |
| P29 | Encyclopaedia Iranica "Manicheism"；回鹘改宗研究 | F26 | ⚑ |
| P30 | Abu Zayd al-Sirafi, *Accounts of China and India*, tr. Tim Mackintosh-Smith (Library of Arabic Literature, NYU Press 2014/2017)；Rossabi 的评论 | F14 | ◐ |
| P31 | Procopius, *History of the Wars* 8.17, tr. Dewing（Gutenberg / LacusCurtius） | F27 | ⚑ |
| P32 | 慧立、彦悰《大慈恩寺三藏法师传》；玄奘《大唐西域记》 | F28、`mv-xuanzang` | ⚑ |
| P33 | 《大秦景教流行中国碑》（西安碑林）；学术译注 | F30 | ⚑ |
| P34 | Encyclopaedia Iranica / Britannica "Talas, Battle of"（只引读到的） | F31 | ⚑ |
| P35 | 《旧唐书》《新唐书》安禄山传；户籍数字解读（学术） | F33 | ⚑ |
| P36 | 吐蕃占领敦煌年代研究 | F34 | ⚑ |
| P37 | Encyclopaedia of Islam / Iranica "Baghdad" | F35 | ⚑ |
| P38 | Ibn Khurradadhbih, *Kitab al-Masalik wa'l-Mamalik*（Fordham Sourcebook 选译） | F36 | ⚑ |
| P39 | Alexandre Popovic, *The Revolt of African Slaves in Iraq* (1999) | F37 | ⚑ |
| P40 | British Library · The Diamond Sutra (Or.8210/P.2) | F38 | ⚑ |
| P41 | International Dunhuang Programme (idp.bl.uk) | F39 | ⚑ |
| P42 | 《宋史·食货志》市舶条；学术研究 | F40 | ⚑ |
| P43 | UNESCO World Heritage "Quanzhou: Emporium of the World in Song-Yuan China"（2021） | F41 | ⚑ |
| P44 | 泉州海外交通史博物馆 · 泉州湾宋代海船 | F42 | ⚑ |
| P45 | S. D. Goitein & M. A. Friedman, *India Traders of the Middle Ages* (Brill 2008) | F44 | ⚑ |
| P46 | Chau Ju-kua, tr. Hirth & Rockhill 1911（公有领域） | F45 | ⚑ |
| P47 | *The Secret History of the Mongols*；Juvaini tr. Boyle | F46、F47 | ⚑ |
| P48 | Juvaini；现代评估（如 Morgan, *The Mongols*） | F48 | ⚑ |
| P49 | William of Rubruck, tr. Rockhill 1900（Hakluyt；archive.org） | F49、`mv-rubruck` | ⚑ |
| P50 | 巴格达 1258 死亡数估计（F 步找学术来源；本轮只读到汇总，区间约 9 万—数十万） | F50 | ◐ |
| P51 | Reuven Amitai-Preiss, *Mongols and Mamluks* (1995) | F51 | ⚑ |
| P52 | 《元史》；*Cambridge History of China* vol. 6 | F52、F65 | ⚑ |
| P53 | Marco Polo, tr. Yule–Cordier 1903（公有领域） | F53、旅程 | ⚑ |
| P54 | Frances Wood, *Did Marco Polo Go to China?* (1995)；Hans Ulrich Vogel, *Marco Polo Was in China* (Brill 2013) | F53 争论 | ⚑ |
| P55 | E. A. Wallis Budge, *The Monks of Kublai Khan* (1928) | F54、旅程 | ⚑ |
| P56 | Pegolotti, *La pratica della mercatura*, in Yule, *Cathay and the Way Thither* vol. 3 (1914) | F55、`routes-mongol` | ⚑ |
| P57 | Ibn Battuta, in Yule, *Cathay and the Way Thither* vol. 4 (1916) | F56、旅程 | ⚑ |
| P58 | Mark Wheelis, "Biological Warfare at the 1346 Siege of Caffa", *Emerging Infectious Diseases* 8/9 (2002) | F59 | ⚑ |
| P59 | Benedictow 2021；Rosemary Horrox, *The Black Death* (1994，原始文献选译) | F60、F71 | ⚑ |
| P60 | Michael W. Dols, *The Black Death in the Middle East* (1977) | F62 | ⚑ |
| P61 | Fordham Sourcebook "The Black Death and the Jews 1348–1349"（含 Closener 编年史） | F63 | ⚑ |
| P62 | Hannah Barker, *That Most Precious Merchandise* (UPenn 2019) | F64 | ⚑ |
| P63 | UNESCO World Heritage 1442（官网对本机 403，F 步换可读镜像或申遗文件） | F66 | ⚑ |
| P64 | UNESCO World Heritage 1675；UCL 新闻 https://www.ucl.ac.uk/archaeology/news/2023/sep/silk-roads-zarafshan-karakum-corridor-inscribed-unesco-world-heritage-list | F67 | ✓ |
| P65 | Isidore of Charax, *Parthian Stations*, tr. Schoff 1914（公有领域） | F69、`routes-han` | ⚑ |
| P66 | 《新唐书·地理志七下》贾耽"入四夷之路" | F70、`routes-tang`、`sea-tang` | ⚑ |
| P67 | Britannica / Oxford Dictionary of Byzantium "Byzantine Empire" 名称 | F72 | ⚑ |
| G1–G7 | 数据集：Cliopatria、NE、Wikidata、Pleiades、al-Thurayya、ac-* 层（§3.1） | 地图 | 许可 ✓ |

---

## 10. 验收清单（`acceptance.md` 之外本主题另加）

- [ ] Gavin 定稿 §0.1 全部代定项；读完 §7 中文稿。
- [ ] F 步：§0.2 全部 ⚑ / ◐ 落到 ✓ 或删句；`sources.json` 只写读到并核对过的内容；挡爬虫站点按 writing-rules 找全文镜像。
- [ ] G0 清点报告（Cliopatria 每实体覆盖、al-Thurayya DATA-LICENSE 原文）主会话看过；偏离写施工记录。
- [ ] 控制区 14 帧 `rings: N, zero-area 0, self-crossing 0`；`control.json` ≤ 2.0 MB；并排图逐帧看过。
- [ ] 每条路线层、旅程：站点表含文献卷章；无争议站点进线；海段与陆地相交 < 1 km；SOURCES.md「Movement routes」「Route layers」两表齐全。
- [ ] E-SR1 单测、docs/06 一句；新加坡等已有 line 层截图不变。
- [ ] 11 章 54 拍：首拍不递减；每拍 `t` 不在帧淡化窗内（§2.3 表复核）；每个高亮有引线；`pnpm shoot silk-road --keys --layout --beats` 的 "unlabelled highlights""chapter highlights" 清单为空。
- [ ] 同类同标：所有 `atrocity` 的 detail 写"谁记载"；没有用 Counter 画有争议数字。
- [ ] 读者能分辨：KEY 有"路线：站点有记录，连线为示意"；背景章细看④讲清精度。
- [ ] 9 张图按 §6 验收；cinema 反相检查。
- [ ] paper / cinema、EN / ZH、iPad / 手机；无运行时外部请求；触控 ≥ 44 px；`pnpm check / validate / test / build / e2e` 全绿。
- [ ] 不改其他主题；`status: draft` 不自行改 published。

## 11. 不确定与已知差距

1. Cliopatria 对匈奴、西突厥、吐蕃、回鹘、蒙古四大汗国的覆盖未核（必须下载后清点）；蒙古各帧是本题核心，若缺，备选 OpenHistoricalMap（CC0）需另做 G0。
2. al-Thurayya 路段几何是否在 CC BY 4.0 之内，要读 `DATA-LICENSE.md`；README 的"source-derived material excluded"措辞可能把依据 Cornu 图集配准的路段排除。
3. "站点 + 直线 / 自动海路"是本 spec 提出的方法，比描学术地图粗，但每一步可复现、无版权问题；Gavin 若认为"直线穿山"误导孩子，可退回只画站点（§0.1-3 ②）。
4. 张骞、法显、玄奘、马可·波罗的部分站点今地有学术争论；本 spec 只给原则（争议站点不进线），具体名单 F 步定。
5. 大量事实本轮只列了候选来源（⚑），尤其数字（《史记》大宛之战、普鲁塔克卡莱、斯特拉斯堡人数、巴格达区间）。
6. "东亚是否经历黑死病"学界无共识，本轮未读专门研究。
7. UNESCO 官网对本机 403；F66 需换来源。
8. 背景章 00-b 字幕写 1877 年而地图时间停在 -0138：引擎允许，但需 Gavin 看观感（V7）。

---

## 12. 施工记录（2026-11-15，分支 `claude/silk-road`）

Gavin 2026-11-15 定稿：§0.1 全部按默认，下载都批。下面记实际做成的样子和与上文的偏离；上文 §0–§11 保留为定稿时的原样。

### 12.1 做成了什么

- 背景 + 10 章，54 拍（4 + 10 × 5），章节顺序与 §1.1 相同；首拍不递减。2026-11-16 按 Gavin “搞完就全部上线” 改为 `status: published`，REVIEW.md 由他事后读。
- 引擎：**E-SR1**（`datedLayers` 线图层 `certainty: approximate` → 虚线 `[3, 2]`、zoom ≤ 10 宽 1.4 px、KEY 虚线样条；不写的线层样式逐字不变）和 **E-SR2**（movement `certainty: approximate` → 只画步进虚线、不画 .3 实底）都做了；单测 + docs/06 各一句。View.tsx 只改了一处（KEY 用 `datedLayerLegendKind`）。
- 控制区 14 帧（Cliopatria v0.2.1），669 KB，rings 944 / 0 / 0；并排图 `docs/screenshots/silk-road/geo-K1…K14.png`。
- 路线层 6 个（`sr-routes-han`、`sr-sea-periplus`、`sr-routes-tang`、`sr-sea-tang`、`sr-routes-abbasid`、`sr-routes-mongol`，共 1–6 KB），旅程 8 条（全部 `certainty: approximate`）；站点 = Wikidata 130 个点；陆上直线、海上自动最短水路（`routes.ts`）。
- 事件 41 + 地点 29；来源 S1–S97（无 S9）；名词 13 个；预设 10 个（§1.2 的 19 个在 iPad 顶栏占三行，只留区域级的 10 个）。
- 图像：Codex 的 `codex/img4` 分支还没有本主题的图，封面和章图都没有接（主会话合并时接）。

### 12.2 与 spec 的偏离

| spec | 实际 | 原因 |
|---|---|---|
| `routes-abbasid` 用 al-Thurayya 路段 | 改为伊本·胡尔达兹贝赫所记犹太商人路线的站点连线（Jacobs 1919 译文） | DATA-LICENSE.md 排除“source-derived material”，README 说路段是从 Cornu 1983 图集配准来的（§0.1-5 的备选） |
| `sea-han`（徐闻 / 合浦 → 黄支） | 改名 `sea-periplus`，只画《航行记》贝勒尼基 → 穆济里斯、→ 婆卢羯车 | 《汉书》航程的站点都没有公认今地（沈丹森 2017），不画线；徐闻、合浦作地点 |
| `routes-tang` 含长安—河西—西州 | 只画贾耽“安西入西域道”可定位段（龟兹—阿克苏—别迭里—碎叶—俱兰—怛罗斯），年份 785–1000 | 河西段不在贾耽这条路里 |
| `routes-mongol` 1271 起 | 1335 起（裴哥罗梯约 1340） | 层的年份 = 文献反映的年代；09-a 不开此层 |
| K12（1271）四汗国 | 一块“蒙古帝国” | Cliopatria 1294 年以前没有分开的四个汗国（INVENTORY.md） |
| K11/K12 东罗马 | 用 Cliopatria “Nicaean Empire” 记录，标“尼西亚帝国（东罗马）” | Byzantine Empire 记录 1227–1278 有缺口 |
| `evt-kara-djigach-1338` | `evt-chuy-graves-1338`，点在布拉纳塔 | 论文不给坐标，维基数据没有 Kara-Djigach 墓地 |
| `evt-andun-166` 日南区域点 | 只在时间轴（`timeline-only`） | 维基数据日南郡没有坐标 |
| `evt-gan-ying` | 挂在喀什（疏勒），detail 说明 | 条支今地不定（§2.4 允许的退路） |
| `evt-kanishka` 白沙瓦 | 罗巴塔克碑出土地 | 都城未读到来源，碑文可定位 |
| `evt-plague-constantinople-1347` | 删 | 君士坦丁堡的日期未读到 |
| `evt-han-takes-nanyue` 番禺 | `evt-han-envoys-sea` 在徐闻 | 南越都城今地未读到来源；徐闻是《汉书》写到的出海港 |
| 地点：月氏王庭、贝格拉姆、萨莱 | 不画 | 今地有争议 / 无来源 / 维基数据无坐标 |
| 旅程：张骞回程、玄奘回程、鲁布鲁克的拔都营地 | 不画 | 只有方向描述，或无坐标 |
| 名词 15 | 13（去掉 `term-caravanserai`、`term-yam`） | 正文没有用到 / 定义未读到来源 |
| 03-e、04-b 高亮 | 03-e 无高亮；04-b 高亮萨珊实体 | 安敦来客无地图点；摩尼传教地点未读到 |

### 12.3 删掉或改写的事实（F 步）

- **删**：F11（妇好墓和田玉，未读到考古来源）；F14 中“史家认为夸大 / Rossabi”（未读到）；F29 女孩名“优婆遮”、卖主名；F34 的 781 年说；F48 伊本·阿西尔的 70 万；F50 “约 9 万”的现代估计和“杀末代哈里发”；F51 “奴隶少年”；F60 君士坦丁堡的日期；F64 “多数是女性”；F66、F67（UNESCO 页面 403，未读到）；乱后对粟特人的敌意；贝格拉姆宝藏；巴格达书市；“蒙古和平”一语；《汉书》航程站点的今地。
- **改**：F21 萨珊止于 650/651（Iranica 650）；F31 葛逻禄是唐的盟军、战中倒戈；F33 只写登记人数，不写“登记崩溃”的解释（未读到）；F36 伊本·胡尔达兹贝赫初稿约 846 年，写“9 世纪”；F45 1225 年依据赵汝适自序；F48 内沙布尔 1,747,000 是赛菲的数字；F50 80 万是穆斯塔菲的；F53 回程约 1292 年（玉尔），出发港是玉尔的推断；F54 拉班·扫马“来自大都”（不是“生于附近”）；F69 伊西多尔没有赫卡通皮洛斯、木鹿，线只到可定位的驿站；F70 乌剌 / 末罗按谢明良 2010（乌布拉 / 巴士拉），Hirth–Rockhill 的不同比定写进 SOURCES-GEO；F27 普罗科匹厄斯没有年份，写“550 年代初”。
- 敏感段落与施工记录：`src/content/topics/silk-road/REVIEW.md`（Gavin 事后读）。
