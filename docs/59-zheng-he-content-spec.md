# 郑和下西洋与海上丝路 · 内容施工 spec（施工定稿 / draft）

TimeScene / GeoStage；paper 默认，cinema 可切。按 2026-10-27 BUILD brief 授权施工；保持 draft，供 Gavin 后续审阅。

slug：`zheng-he`；title EN **Zheng He and the Maritime Silk Routes** / ZH **郑和下西洋与海上丝路**；shortTitle EN **Zheng He** / ZH **郑和下西洋**。subtitle EN **Fleets, ports and people across the Indian Ocean, 1405–1433** / ZH **印度洋上的船队、港口与人（1405—1433）**。[ZH-F01,15]

## 0. 决策记录与默认值（2026-10-27）

| # | 默认方案 | 理由/限定 |
|---|---|---|
| 1 | 背景章 + 7 章、每章 5 拍，共 40 拍 | 从网络背景到远航、地方政治、证据与遗产；不是逐航次重复同一条路。[ZH-F01,05–11] |
| 2 | `subject: history; mode: time; engine: time-scene; stage: geo; status: draft; tags: [beyond-syllabus]` | 课纲外；不在界面写年级或课纲考点。[ZH-F48–49] |
| 3 | 时间范围 1405–1433，`datePrecision: year` | 颁诏、出海、回国与历法不一，避免假日精度。[ZH-F01,11,23] |
| 4 | **点图为默认，航线为缺数据的后续可选分支**；`movements: []` | 原始 SVG 下载 403；不手连港口、不造海上折点。[ZH-F50] |
| 5 | 区域图版 [35,-15,125,37]，现代 NE 海岸；没有历史国界填色 | 保留东非至中国的空间关系。没有可信逐年政治面，本题无版图推演。 |
| 6 | 视角：明廷、马来港口、印度洋通事/商人、东非斯瓦希里城市 | 依史实权重安排，不能把其他地方写成被发现的空白。[ZH-F13,22,24,33–35] |
| 7 | 旧港死亡报告、爪哇明军被杀、锡兰及苏门答剌俘虏、郑和童年强制伤害直述；`sensitivity: open` | 数字注明报告主体，未知不写 0；不使用血腥图。[ZH-F03,18–21] |
| 8 | 宝船尺寸、访问次数、动机、逝世细节均保留争论 | 两边各说材料与限制，不用选定长度作比例复原。[ZH-F16,23,36–37,40,52] |
| 9 | 无 quiz、无船舶/季风速度仿真、无人像重建；既有 engine 即可 | 历史 skill 的“孩子问题”是内部叙事设计，不强加练习流。 |
| 10 | 内容家族 CC BY-NC-SA 4.0；地图点只由 PD + CC BY 来源组成 | BY-SA 文字只作事实参考，未复制成派生地图；后续 carve-out 见 §3。 |
| 11 | 同一 dossier 是 parent，无拆分姊妹 | 按用户指示省略 §0.0；古文明与新加坡主题是交叉链接，非 sibling。 |
| 12 | 封面 + 两图沿用准备阶段已批准的原创生成图；本轮不重画 | 既有古文明图是塔庙、希腊罐、浴场/水道；现代新加坡与天气图也不代表本题器物；不能把希腊陶罐当明代货物。 |

### 0.1 Gavin 阅读重点（默认照做，不阻塞本次 draft 施工）

- 第 01 章童年强制伤害；第 02 章两种死亡报告；第 03 章锡兰俘虏与同页献礼；第 04 章继位干预。[ZH-F03,18–21,28–30]
- 第 01 章宝船尺寸细看与封面“代表性帆船、非精确复原”说明；第 03 章马六甲五/七次争论。[ZH-F23,36–37]
- 第 05 章东非主体性、基尔瓦只是贸易背景；第 07 章不把停航写成中国停止一切贸易。[ZH-F33–35,39]


### 0.2 引擎核对与施工决策

已查 main 的 docs/06、TimeScene schema、EventInspector、Counter、区域海岸管线及现有历史主题。也用只读 git log main..codex/<branch> 与 git show 核对 monsoon-engine（月气候层）、sem-engine（公转自转）、airfoil-content（翼型）、dinosaur（当前该分支 topic schema 无 landEra，深时需求无关）、plates（参考层、目录、影响记录）。不依赖任何未合并代码。主线已有蒸汽/table/pose/sort/light/magnet/circuit/materials 等空间模拟均不适用于本题。

保留新引擎项 **0**；不新增航海模拟、季风风场、路线生成、政治版图、时标或伤亡计数器。全部组合现有 year 时标、site/dated event、空控制帧、区域底图、camera、beats（节拍）、名词和插图。§4 只列内容验证合同。

所有 ZH-F01–52 均在 facts.json；图像类别补充 ZH-X01 与马六甲关系补充 ZH-X02 在 facts-extra.json。源 id 保持准备稿 S01–S30。S24/S25 仅参考不强行进入正文。无 route 数据，movements=[]。正文不逐字引用来源。

构图修正：04-a 的 evt-fourth-voyage 位于南京，镜头改 china，字幕据该点讲出发；05-a 与06-a 的出发点也改 china。不能把南京事件留在印度/全洋远景而无法辨认。00-c 印度镜头适当西移到 [76,10]；东非双点镜头按真实坐标向北扩大。浏览器构图仍由主会话验收。

## 1. 立场、证据与文字规格

每章正文 EN 200–300 词 / ZH 350–500 字，3–5 段；2–4 个细看。本节规定正文、细看与字幕结构；完整 MDX 正文随本次施工交付。日期只写源证据支持的精度，每条历史字幕带 dossier fact id；施工时把 fact id 映射回 S 编号。数量用 `<Num s="Sxx">`，日期不包 Num。

不使用“伟大”“发现非洲”“没有战争的航行”等判断词。外交赠礼与强制同时出现。Wade 的支配解释和外交/正统性解释都署作者或来源，俘虏与死亡的事实不因解释不同而消失。[ZH-F15–21,31–32,52]

阅读说明 EN 草稿：**This topic follows fleets, ports and people across the Indian Ocean. Court records, inscriptions, archaeology and later maps answer different questions. Modern coastlines and city points locate regions; they do not show measured ship tracks. Reported deaths and disputed interpretations are identified.**

阅读说明 ZH 草稿：**本主题从船队、港口与人看印度洋交流。朝廷记录、碑刻、考古和后出的地图能回答不同的问题。现代海岸与城市点只帮助定位区域，不是测得的航迹。死亡报告和有争议的解释都会标明来源。** [ZH-F18–21,25–30,33,50]

## 2. 章节总表、镜头与时间

| # | id | 标题 EN / ZH | 首拍年 | 默认镜头 [lng,lat,zoom] | 控制帧 |
|---|---|---|---|---|---|
| 00 | `background` | An ocean already connected / 已经相连的海 | 1405 | [102.8, 1.9, 5.7] | K0（空） |
| 01 | `setting-sail` | A fleet for the Ming court / 为明廷出发的船队 | 1405 | [119, 28, 4.3] | K0（空） |
| 02 | `straits-and-force` | Trade and force in the straits / 海峡上的贸易与武力 | 1407 | [76, 10, 5] | K1（空） |
| 03 | `melaka-and-sri-lanka` | Melaka and Sri Lanka / 马六甲与锡兰 | 1411 | [102.8, 1.9, 5.7] | K3（空） |
| 04 | `hormuz-and-gifts` | Ports, gifts and power / 港口、赠礼与权力 | 1413 | [119, 28, 4.3] | K4（空） |
| 05 | `east-african-ports` | East African ports / 东非的港口 | 1417 | [119, 28, 4.3] | K6（空） |
| 06 | `returning-envoys` | Return journeys and pauses / 回程与停顿 | 1421 | [119, 28, 4.3] | K7（空） |
| 07 | `last-voyage-and-evidence` | The final voyage and its evidence / 最后一次远航与留下的证据 | 1431 | [119, 28, 4.3] | K7（空） |

背景章 `kind: background; order: 0`，不占底部段，首进展开；其五拍同属 1405 的背景回看，并非五个 1405 事件。各章首拍时间不递减，章内时间不倒退；第二章最后一拍至 1409，第三章以 1411 作回看，符合现有重叠时间段规则。1433 章末谈后世只写“后出/延续”，不把文献出版年份当成 1433 年发生。[ZH-F26]

所有 control 帧是空 `FeatureCollection`。因此交叉淡化没有历史领土变化，也无错位帧问题；拍所指的帧是最后一个不晚于 t 的空帧。不能为使用 control 功能而给明朝和港口画圆、多边形或现代国界。

### 2.1 镜头预设

| preset（施工时前缀 view-） | center | zoom | 用途 |
|---|---|---|---|
| `ocean` | [80, 8] | 2.2 | 镜头设计参数，不是观测数据 |
| `china` | [119, 28] | 4.3 | 镜头设计参数，不是观测数据 |
| `straits` | [102.8, 1.9] | 5.0 | 镜头设计参数，不是观测数据 |
| `india` | [76, 10] | 5.0 | 镜头设计参数，不是观测数据 |
| `sri-lanka` | [80.7, 7.3] | 5.7 | 镜头设计参数，不是观测数据 |
| `gulf` | [56.45, 27.0] | 6.0 | 镜头设计参数，不是观测数据 |
| `africa` | [43, -3] | 3.9 | 镜头设计参数，不是观测数据 |
| `arabia` | [45, 13] | 5.3 | 镜头设计参数，不是观测数据 |
| `java` | [111, -7] | 5.0 | 镜头设计参数，不是观测数据 |
| `sumatra` | [97.2, 5.0] | 6.0 | 镜头设计参数，不是观测数据 |
| `bengal` | [90.2, 23] | 4.4 | 镜头设计参数，不是观测数据 |

区域模式已有 Whole plate（world）按钮；不再注册同名预设。`view-ocean` 是叙事取景，不另造一个“全图”按钮。镜头需在 iPad 比例下实调，任何高亮不在取景内则扩大视野，不能挪数据点。

### 2.2 每章正文结构、细看与字幕 EN/ZH

#### 00 · background · 已经相连的海

**内部核心问题**：郑和到来以前，海上有谁？

**正文顺序**：

1. 以 ACM 唐代沉船开场，把海上交换放到远早于郑和的时间背景；强调其最后出发港不确定。[ZH-F43–44]
2. 淡马锡的考古与航海地名是不同种类的证据。转接既有新加坡背景章，不讲一遍 1819 后历史。[ZH-F25–27]
3. 把古里与东非商人的港口放入同一张图，不以一国船队作为全球海洋网络的起点。[ZH-F12,33–35]
4. 读图说明：现代海岸/城市坐标只定位区域；没有推测版图；港口点不等于确定登陆，镜头移动不等于船的航行。[ZH-F25,50]

**细看**：

- 一件器物能证明什么：器物、文献与行程的证据不同。[ZH-F27,33]
- 港口不是一条路上的被动驿站：斯瓦希里与马来港口的交易主体。[ZH-F24,34]
- 海上丝绸之路是对许多交流网络的统称，读者不可把它误当单条实测航道。[ZH-F43–44,50]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-00-a` / 1405 | straits · site-temasek-region | Before 1405: the Singapore region already belonged to a world of maritime exchange. | 1405 年以前：新加坡区域已经参与海上交换。 | ZH-F27, ZH-F43 |
| `beat-00-b` / 1405 | straits · site-melaka | Before the fleets: Melaka belongs to the Malay world, with its own rulers and trading interests. | 船队到来前：马六甲属于马来世界，当地统治者与商人有自己的利益。 | ZH-F22, ZH-F24 |
| `beat-00-c` / 1405 | india · site-calicut, site-kochi | Before 1405: ports on India’s southwest coast are part of the wider trading world. | 1405 年以前：印度西南岸港口已在广阔的贸易网络中。 | ZH-F12, ZH-F43 |
| `beat-00-d` / 1405 | africa · site-kilwa | Before 1405: Kilwa’s merchants traded across the Indian Ocean; this point is not a claimed fleet landing. | 1405 年以前：基尔瓦商人已参与印度洋贸易；这个点不表示船队曾在此登陆。 | ZH-F33, ZH-F34 |
| `beat-00-e` / 1405 | ocean · 无（保留底图） | 1405: these are geographic reference points, not measured ship positions. | 1405 年：这些点用于地理定位，不是测得的船只位置。 | ZH-F25, ZH-F50 |

**跨题链接**：`ancient-civilisations` → `southeast-asia-seas` / `southeast-asia-kingdoms`（本轮已核 MDX id）；`singapore-1819-1965` → `background`（本轮已核 MDX id）。这是 draft 依赖，不宣称目标已发布。
#### 01 · setting-sail · 为明廷出发的船队

**内部核心问题**：庞大的船队为什么出发？

**正文顺序**：

1. 先写朝廷的任务：威望、使节与朝贡关系，再说明这些关系在不同港口有不同含义。[ZH-F04,15–16,52]
2. 郑和来自云南穆斯林家庭；童年被俘并遭阉割，被迫进入宫廷服务。把受害经历与后来的权力都说清。[ZH-F02–03]
3. 远航依靠水手、士兵、医护、修船人员与通事，不只依靠统帅；不把全部人叫探险家。[ZH-F13,15]
4. 规模只写数百艘与数万人，争议尺寸留细看。封面是代表性中国帆船插画，不是九桅宝船的考古复原。[ZH-F14,36–38]

**细看**：

- 约 208 与 317 艘：范围和统计口径并未统一，不平均成一个假精确值。[ZH-F14]
- 宝船有多大：晚出文本与大船论据；工程反对与较小尺度说，均标作者。[ZH-F36–37]
- 风、星与罗盘：导航方式并用，罗盘不能直接告诉船在哪里。[ZH-F38,49]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-01-a` / 1405 | china · evt-first-voyage | 1405: the first expedition begins under the Ming court’s authority. | 1405 年：第一次远航由明廷派出。 | ZH-F01, ZH-F04, ZH-F05 |
| `beat-01-b` / 1405 | china · site-nanjing | 1405: at the court end of this network, Zheng He’s career follows childhood captivity and forced service. | 1405 年：把镜头留在朝廷一端，也要记住郑和童年被俘、被迫服役的经历。 | ZH-F02, ZH-F03 |
| `beat-01-c` / 1405 | china · site-fuzhou | 1405: the Fujian coastal reference point helps locate the outward-facing shore; it is not an exact departure quay. | 1405 年：福建沿岸参照点帮助定位面向海洋的地区，不表示确定的出航码头。 | ZH-F05, ZH-F38 |
| `beat-01-d` / 1405 | china · evt-first-voyage | 1405: the expedition needs sailors, soldiers, interpreters, medical staff and repair workers. | 1405 年：船队需要水手、士兵、通事、医护和修船人员。 | ZH-F13 |
| `beat-01-e` / 1405 | ocean · 无（保留底图） | 1405: fleet totals and treasure-ship dimensions are debated; this plate does not choose a measured hull size. | 1405 年：船队总数与宝船尺寸有争论；本图版不选定一个船体尺度。 | ZH-F14, ZH-F36, ZH-F37 |
#### 02 · straits-and-force · 海峡上的贸易与武力

**内部核心问题**：大船队到港，对当地人意味着什么？

**正文顺序**：

1. 交代第一航次抵达印度西南岸及返程，再把视线放到旧港。不要逐个港口编上未核日历日期。[ZH-F05,12]
2. 1407 年旧港冲突：明方报告约 5,000 人被杀；陈祖义被俘送往中国处决。说明这是征服者一方留下的报告。[ZH-F18]
3. 同年爪哇当地冲突中约 170 名明军被杀。两处均用同样的“谁报数、未知什么”写法，不制造双方总伤亡对照。[ZH-F19]
4. 1407–1409 第二航次通过现有网络继续往返，不能声称郑和亲率每一航次或亲自访问每个点。[ZH-F06,15]

**细看**：

- 旧港名称与今天巨港：城市点只定位，不是精确海战中心。[ZH-F18]
- “海盗”是谁的称呼：保留明方的敌对分类与当地权力竞争。[ZH-F18,21]
- 读数字的边界：5,000 是明方报告，170 也是明方报告，未知数不填 0。[ZH-F18–19]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-02-a` / 1407 | india · site-calicut, site-kochi | By 1407: the first expedition has reached India’s southwest coast. | 到 1407 年：第一次远航已到达印度西南岸。 | ZH-F05, ZH-F12 |
| `beat-02-b` / 1407 | straits · evt-old-port-1407 | 1407: at Old Port, the Ming fleet fought Chen Zuyi’s force. | 1407 年：明朝船队在旧港与陈祖义的势力交战。 | ZH-F18 |
| `beat-02-c` / 1407 | straits · evt-old-port-1407 | 1407: Ming records reported about 5,000 people killed here; the figure is not independently verified. | 1407 年：明方记录报告此役约有 5,000 人被杀；这个数字没有得到独立核实。 | ZH-F18 |
| `beat-02-d` / 1407 | java · evt-java-report-1407 | 1407: Ming records also reported 170 Ming troops killed in Java. The locator marks the island region. | 1407 年：明方记录也报告 170 名明军在爪哇被杀。标记只定位岛上区域。 | ZH-F19 |
| `beat-02-e` / 1409 | ocean · evt-second-voyage | 1407–1409: another expedition uses the same connected seas; command and personal attendance are different questions. | 1407—1409 年：下一航次继续往返于这些海域；统领船队和本人到场是不同的问题。 | ZH-F06, ZH-F15 |
#### 03 · melaka-and-sri-lanka · 马六甲与锡兰

**内部核心问题**：合作与战争能同时出现在一段历史里吗？

**正文顺序**：

1. 马六甲的对明关系不始于郑和：尹庆 1403 年已奉命前往。当地政权把合作用于自身的发展与安全；细看把马来王室谱系、Pires 与明廷记录对照，不能让官档代表所有人的经验。[ZH-F22,24,ZH-X02]
2. 船队使用仓储据点，等待与补给是远航的一部分。对明廷是部署网络，对当地也是交换与谈判的机会；不要以“朝贡”替代所有地方政治。[ZH-F17,51]
3. 以三语碑展现跨语、跨宗教的献礼，碑的 1409 日期与安装日期不混。随后讲 1411 年俘虏，不让宗教物件遮住武力。[ZH-F28–30,20]
4. 锡兰当地统治者及家人被送至明廷；明方称遭敌对行动而反击，Wade 强调强制干预。两种解释不改变俘虏事实。[ZH-F20,52]

**细看**：

- 七次都停马六甲吗：万明七次说与传统五次说，说明史料缺口。[ZH-F23]
- 三种文字不等于三个版本完全相同；本稿只用已核中文部分的献礼含义。[ZH-F28–30]
- 锡兰不是一个无差别整体：不把局部政权之争写成全岛被明朝征服。[ZH-F20]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-03-a` / 1411 | straits · site-melaka | By 1411: Melaka’s relations with the Ming court already have a history reaching back to Yin Qing’s mission. | 到 1411 年：马六甲与明廷的交往已有尹庆出使的前史。 | ZH-F07, ZH-F22 |
| `beat-03-b` / 1411 | straits · site-melaka | By 1411: Melaka is a staging and storage point, while its rulers pursue local interests. | 到 1411 年：马六甲是船队停泊与存货的据点，当地统治者也在谋求自己的利益。 | ZH-F17, ZH-F24, ZH-F51 |
| `beat-03-c` / 1411 | sri-lanka · site-galle | 1411, looking back: a stele dated 1409 records Chinese, Tamil and Persian inscriptions. Galle is its findspot. | 1411 年，回看史料：1409 年的碑刻写有中文、泰米尔文和波斯文；加勒是发现地。 | ZH-F28, ZH-F29 |
| `beat-03-d` / 1411 | china · evt-captives-1411 | 1411: a Sri Lankan ruler and members of his family were taken to the Ming court after fighting. | 1411 年：战事之后，锡兰一位统治者及家人被带到明廷。 | ZH-F20 |
| `beat-03-e` / 1411 | sri-lanka · 无（保留底图） | 1411: offerings and force belong in the same account; historians differ over how to explain the intervention. | 1411 年：献礼与武力都应写入这段历史；史家对干预的解释不同。 | ZH-F16, ZH-F20, ZH-F30, ZH-F52 |

**跨题链接**：`ancient-civilisations` → `southeast-asia-seas` / `southeast-asia-kingdoms`（本轮已核 MDX id）。这是 draft 依赖，不宣称目标已发布。
#### 04 · hormuz-and-gifts · 港口、赠礼与权力

**内部核心问题**：一件礼物经过了谁的手？

**正文顺序**：

1. 第四航次向波斯湾扩展；霍尔木兹坐标取岛上城镇，绝不用今天阿巴斯港替代。[ZH-F08,12]
2. 贸易、外交、承认皇帝威望不是相同概念。通事把不同语言的人联系起来，同行者留下了描述；不代替当地人发言。[ZH-F13,15–16]
3. 1414 年长颈鹿来自孟加拉国王的赠礼，朝廷用麒麟解释它。插图是自然史示意，不复刻清代画，也不虚构如何捆绑运送。[ZH-F31–32]
4. 1415 年苏门答剌继位争端中有人被俘送中。支持当地一方与强制干预是两种史学解释，不能概括为纯商业成功。[ZH-F21,52]

**细看**：

- 霍尔木兹地名：城、岛、海峡不能互换；点仅作城镇锚点。[ZH-F12]
- 长颈鹿与麒麟：动物形态和宫廷政治寓意分开说明。[ZH-F31–32]
- 通事与记录者的视角：译写也有选择；不把每段游记都当所有人的共同感受。[ZH-F13,46]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-04-a` / 1413 | china · evt-fourth-voyage | 1413: the Ming court sends out the fourth expedition; the marker locates Nanjing, not a measured departure quay. | 1413 年：明廷派出第四次远航；标记定位南京，不是测得的出发码头。 | ZH-F08, ZH-F12 |
| `beat-04-b` / 1415 | gulf · site-hormuz | By 1415: the fourth expedition reaches Hormuz, beyond the earlier Indian destinations. | 到 1415 年：第四航次已到达霍尔木兹，远于早先的印度目的地。 | ZH-F08, ZH-F12 |
| `beat-04-c` / 1415 | india · site-calicut | 1413–1415: interpreters and diplomatic specialists connect visitors and ports; neither side speaks with one voice. | 1413—1415 年：通事和外交人员把访客与港口联系起来；任何一方都不是只有一种声音。 | ZH-F13, ZH-F15, ZH-F46 |
| `beat-04-d` / 1415 | bengal · site-bengal-region | 1415, looking back to 1414: the giraffe came as a gift from Bengal’s king. This is a regional locator, not its boarding place. | 1415 年，回看 1414 年：长颈鹿是孟加拉国王的赠礼；此处只是区域定位，不是装船地点。 | ZH-F31, ZH-F32 |
| `beat-04-e` / 1415 | sumatra · evt-samudera-1415 | 1415: a claimant to power in Samudera was captured and taken to China; the succession accounts conflict. | 1415 年：苏门答剌一位争夺统治权的人被俘并被带往中国；继位争端的记载互有矛盾。 | ZH-F21 |
#### 05 · east-african-ports · 东非的港口

**内部核心问题**：海的另一边有哪些主人？

**正文顺序**：

1. 第五航次带返使节并有船队抵达东非。强调分队和文献记载的区别，不保证统帅本人到达每处。[ZH-F09,35]
2. 亚丁、摩加迪沙、马林迪不是背景布景，它们是有本地人、交易关系与政权的港口。对东非用同样具体的命名和地图尺度。[ZH-F35]
3. 基尔瓦让读者看到斯瓦希里贸易主体、来自腹地与跨海的商品；本稿不把基尔瓦列成确认访问点。[ZH-F33–34]
4. 器物证明流通，但中国瓷器不自动证明某艘明朝船或郑和到场。回到“证据能回答哪个问题”。[ZH-F33,46]

**细看**：

- 麻林地等历史名的识别需谨慎，未核的今名对应不能靠声音相似决定。[ZH-F35,50]
- 东非不是一个国家，也不只有外来商人：斯瓦希里文化是地方历史主角。[ZH-F34]
- 贸易器物图：丝绸与瓷器是商品类别，不是宣称都在某一艘船的同一批货内。[ZH-F15,33]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-05-a` / 1417 | china · evt-fifth-voyage | 1417: the fifth expedition begins another outward journey. | 1417 年：第五航次开始又一次出海。 | ZH-F09 |
| `beat-05-b` / 1419 | arabia · site-aden | By 1419: Aden is among the destinations associated with the expedition. | 到 1419 年：亚丁是这一航次记载中的目的地之一。 | ZH-F09, ZH-F35 |
| `beat-05-c` / 1419 | africa · site-mogadishu, site-malindi | By 1419: accounts name Mogadishu and Malindi; these points do not prove Zheng He personally landed at both. | 到 1419 年：记载提到摩加迪沙和马林迪；这些点不能证明郑和本人都曾登陆。 | ZH-F35 |
| `beat-05-d` / 1419 | africa · site-kilwa | 1419: look farther south to Kilwa for the wider Swahili trading world, not a confirmed fleet stop. | 1419 年：基尔瓦代表更广阔的斯瓦希里贸易世界，不是确认的船队停靠点。 | ZH-F33, ZH-F34 |
| `beat-05-e` / 1419 | africa · site-kilwa | 1419: Chinese porcelain in a trading city is evidence of exchange, not a signature left by one admiral. | 1419 年：贸易城市中的中国瓷器能说明交换，不能当作某位统帅留下的签名。 | ZH-F33, ZH-F46 |
#### 06 · returning-envoys · 回程与停顿

**内部核心问题**：往返的船还带着哪些关系？

**正文顺序**：

1. 第六航次的往返使节让海图不是一串从中国向外的单向箭头。不要编每个本地统治者都自愿到访。[ZH-F10,15–16]
2. 季风会影响候风和往返；万明的历史解释与 MSS 现代机制说明用不同的小标题，不能混成历史气象观测。[ZH-F41–42,51]
3. 朝廷对开支与优先事务存在分歧；把大规模组织的资源成本写清，但本轮不编砍树数、粮食总量或日速。[ZH-F04,16,52]
4. 1422—1431 航次序列之间有间隔，先展现时间，再引出最后一次；停顿不代表海上所有人都停止活动。[ZH-F10–11,39]

**细看**：

- 国家外交与商人网络：相关，但不是同一个制度。[ZH-F15,39]
- 季风不是一条全年不变的箭头：新加坡局地风向不代表整个印度洋。[ZH-F41–42]
- 不要用后来的殖民扩张结果倒推每次航行都必然通向全球统治。[ZH-F47,52]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-06-a` / 1421 | china · evt-sixth-voyage | 1421: the sixth expedition carries envoys back across the connected seas. | 1421 年：第六航次运送使节返回这些相连的海域。 | ZH-F10, ZH-F15 |
| `beat-06-b` / 1422 | straits · site-melaka | By 1422: returning through staging ports involves waiting and provisioning, not continuous sailing at a fixed speed. | 到 1422 年：经由停泊港返航需要候风和补给，不是以固定速度持续航行。 | ZH-F17, ZH-F51 |
| `beat-06-c` / 1422 | ocean · 无（保留底图） | 1422: seasonal winds help explain schedules; no wind field on this plate claims to be an observation from this year. | 1422 年：季节性风有助于解释航程安排；本图版不把任何风场当作当年的观测。 | ZH-F41, ZH-F42, ZH-F51 |
| `beat-06-d` / 1422 | china · site-nanjing | After 1422: the court view raises questions about power, cost and priorities; historians weigh these motives differently. | 1422 年以后：朝廷要权衡威望、成本与优先事务；史家对各种动机的权重看法不同。 | ZH-F04, ZH-F16, ZH-F52 |
| `beat-06-e` / 1422 | ocean · 无（保留底图） | After 1422: the voyage sequence pauses before the final expedition. Merchant networks are a separate history. | 1422 年以后：最后一次远航之前出现间隔；商人网络有另一条历史线索。 | ZH-F10, ZH-F11, ZH-F39 |
#### 07 · last-voyage-and-evidence · 最后一次远航与留下的证据

**内部核心问题**：船队停航之后，什么仍然存在？

**正文顺序**：

1. 最后一次航行通常标为 1431—1433，1430 是颁诏/准备纪年之一。不要把这两种日期说成来源自相矛盾。[ZH-F11,23]
2. 讲清主队与支队：已出版现代地图也把可能路线单独表示；本轮原图不可下载，所以默认点图没有航迹。[ZH-F50]
3. 国家大规模远航结束不等于所有贸易终止；以后互市和走私的文献说明网络持续变化。后世内容只放细看，不把时间轴强拉到近代。[ZH-F39]
4. 郑和逝世细节不确定。通过后出的航海图传统与当地遗产收束，并把淡马锡、马六甲交还给各自的长历史。[ZH-F24–27,40]

**细看**：

- 常见的 1430/1431：准备日期、离岸日期与历法精度。[ZH-F11,23]
- 主队不等于全部分队，更不等于每个人的脚印。[ZH-F35,50]
- 谁保存什么：碑刻、游记、后出图与现代考古回答不同问题。[ZH-F26–30,46]

**五拍（caption 为可审阅初稿）**：

| Beat / t | 镜头 · 高亮 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| `beat-07-a` / 1431 | china · evt-seventh-voyage | 1431: the final expedition begins its conventional sailing period, after a commission dated 1430. | 1431 年：最后一航次进入通常采用的航行纪年；颁诏纪年则是 1430 年。 | ZH-F11, ZH-F23 |
| `beat-07-b` / 1433 | gulf · site-hormuz | By 1433: Hormuz belongs to the final expedition’s main-fleet account; proposed squadron routes need separate evidence. | 到 1433 年：最后一次远航的主队记载包括霍尔木兹；推定支队路线需要另列证据。 | ZH-F11, ZH-F50 |
| `beat-07-c` / 1433 | ocean · evt-final-return | 1433: the great state-sponsored expedition sequence ends; maritime trade does not simply vanish. | 1433 年：这组国家远航告一段落；海上贸易并没有随之消失。 | ZH-F01, ZH-F11, ZH-F39 |
| `beat-07-d` / 1433 | straits · site-temasek-region | Looking back from 1433: later charts preserve Temasek in navigational knowledge, without proving a personal landing. | 从 1433 年回看：后出的航海图保存了淡马锡的地理知识，但不能据此证明郑和亲自登陆。 | ZH-F25, ZH-F26 |
| `beat-07-e` / 1433 | straits · site-melaka | Looking back from 1433: Melaka and the Singapore region continue into histories longer than this fleet’s voyages. | 从 1433 年回看：马六甲与新加坡区域的历史，都比这支船队的远航更长。 | ZH-F24, ZH-F27, ZH-F39 |

**跨题链接**：`ancient-civilisations` → `southeast-asia-seas` / `southeast-asia-kingdoms`（本轮已核 MDX id）；`singapore-1819-1965` → `background`（本轮已核 MDX id）。这是 draft 依赖，不宣称目标已发布。

## 3. 地点、图层、数据与许可

### 3.1 命名空间与参与者

主题、chapter、event、movement、entity、preset、glossary、dated-layer id 共用唯一命名空间。chapter 用上表；event 前缀 `evt-`；地点事件前缀 `site-`；实体前缀 `actor-`；预设 `view-`；名词 `term-`。准备文件的 `place-*` 是地理锚点 id，施工导出为 `site-*`。Beat id 只在准备审计中使用，不要求新增 schema 字段。

| entity id | 名称 EN / ZH | bloc/颜色 | 时间语义 |
|---|---|---|---|
| actor-ming-fleet | Ming expedition fleet / 明朝远航船队 | neutral; token:holder-1 | joined 1405；本主题观察起点，不是明朝建国 |
| actor-old-port-force | Chen Zuyi’s force, as described in Ming records / 明方所记陈祖义的势力 | neutral; token:holder-2 | joined 1407；仅旧港报告 [ZH-F18] |
| actor-melaka | Melaka polity / 马六甲政权 | neutral; token:holder-3 | joined 1405；观察起点，非建国 [ZH-F22–24] |
| actor-indian-ocean-ports | Indian Ocean ports / 印度洋港口 | neutral; token:holder-4 | 叙事分组，非单一国家或军事联盟 [ZH-F12,15] |
| actor-swahili-ports | Swahili trading ports / 斯瓦希里贸易港口 | neutral; token:holder-5 | 叙事分组，非一个东非国家 [ZH-F33–35] |

`colorBy: entity`；axis、allied 不分配任何实体。`blocLabels.neutral = {en: "People and ports", zh: "人与港口"}`；out = “Outside this view / 不在当前范围”。`strings.joined = {en: "shown from", zh: "本图起见于"}`；left = “shown until / 本图止于”；notYet = “Not yet shown / 尚未显示”。不显示参战/退战，也不把所有 neutral 标成政治中立。

### 3.2 控制区关键帧

| K | t | features | 用途 |
|---|---|---:|---|
| K0 | "1405" | 0 | 空控制帧；底图 D01 不变 |
| K1 | "1407" | 0 | 空控制帧；底图 D01 不变 |
| K2 | "1409" | 0 | 空控制帧；底图 D01 不变 |
| K3 | "1411" | 0 | 空控制帧；底图 D01 不变 |
| K4 | "1413" | 0 | 空控制帧；底图 D01 不变 |
| K5 | "1415" | 0 | 空控制帧；底图 D01 不变 |
| K6 | "1417" | 0 | 空控制帧；底图 D01 不变 |
| K7 | "1421" | 0 | 空控制帧；底图 D01 不变 |
| K8 | "1433" | 0 | 空控制帧；底图 D01 不变 |

只导出已有 schema 的 `{keyframes:[{t:"1405",features:{type:"FeatureCollection",features:[]}},...]}`。不需要 Ma 或 BCE，本题绝不能借地质时间做航海时间单位。

### 3.3 事件与地理证据

13 个 dated events + 17 个 site events。Site 事件的 t 统一 1405 仅满足 schema，它不参加时间范围/泳道，不能被解释为 1405 建城或登陆。全部 point 来自 `data/ports.geojson` 的同一锚点表。17 个 site 的 title/detail 必须写明现代定位、历史角色与证据，尤其区域参照点。

| id | t | kind | 地理 anchor 后缀 | 内容 EN / ZH | Facts |
|---|---|---|---|---|---|
| `evt-first-voyage` | 1405 | milestone | nanjing | First expedition / 第一次远航 | ZH-F01, ZH-F04, ZH-F05 |
| `evt-old-port-1407` | 1407 | battle | palembang | Old Port conflict / 旧港冲突 | ZH-F18 |
| `evt-java-report-1407` | 1407 | political | java-region | Reported deaths in Java / 爪哇被杀报告 | ZH-F19 |
| `evt-second-voyage` | 1407 | milestone | calicut | Second expedition / 第二次远航 | ZH-F06 |
| `evt-third-voyage` | 1409 | milestone | nanjing | Third expedition / 第三次远航 | ZH-F07 |
| `evt-captives-1411` | 1411 | political | nanjing | Captives taken to the Ming court / 被带到明廷的俘虏 | ZH-F20 |
| `evt-fourth-voyage` | 1413 | milestone | nanjing | Fourth expedition / 第四次远航 | ZH-F08 |
| `evt-giraffe-gift-1414` | 1414 | political | nanjing | A giraffe from Bengal / 来自孟加拉的长颈鹿 | ZH-F31, ZH-F32 |
| `evt-samudera-1415` | 1415 | political | samudera-region | Captive in a succession conflict / 继位争端中的俘虏 | ZH-F21 |
| `evt-fifth-voyage` | 1417 | milestone | nanjing | Fifth expedition / 第五次远航 | ZH-F09 |
| `evt-sixth-voyage` | 1421 | milestone | nanjing | Sixth expedition / 第六次远航 | ZH-F10 |
| `evt-seventh-voyage` | 1431 | milestone | nanjing | Seventh expedition / 第七次远航 | ZH-F11 |
| `evt-final-return` | 1433 | milestone | nanjing | End of expedition sequence / 这组远航的结束 | ZH-F01, ZH-F11, ZH-F39 |

事件位置约束：旧港事件用巨港现代城市点，并写“区域位置，非测得海战中心”。爪哇报告只用区域参照，不能把泗水说成已知冲突地。锡兰俘虏事件放在**南京被带至明廷**这一证据端，不把加勒点误作战场。孟加拉礼物事件同样放南京，孟加拉区域点用于来源地域，不是装船位置。苏门答剌事件用附近区域参照而非皇宫实址。[ZH-F18–21,28–31]

旧港 `kind:battle`：sides attacker=`actor-ming-fleet` defender=`actor-old-port-force`；result=`attacker`；`casualties:{"actor-old-port-force":5000}`，title/detail 中注明**明方报告、受害者身份划分不明、非独立核实**。[ZH-F18] Java `kind:political`：表示有来源的冲突死亡报告，未掌握可命名的交战双方，不强造 battle sides；使用与旧港相同的克制叙述和来源限定；`casualties:{"actor-ming-fleet":170}`。[ZH-F19] 两处都明说被杀与来源；图标类别区别来自已知资料结构，不能暗示任何一方的死亡较不重要，也不能为填 schema 编造对手。

伤亡沿用 EventInspector → ForceTable → Counter。代码已读 `counterPer` 与 `IconGrid`：支持最后一个图标部分填充；不用新引擎。保持每张图显式“一个图标代表 N 人”，不可将 unknown casualties 写 0。为避免战场量级比较被误读，两处各自显示来源与单位，不生成“双方损失比”。

### 3.4 航线 / movements

**默认 `[]`，数量为 0。** 不把 camera flyTo 当移动线；不加人工折点。许可允许的路线来源仍未可得，所以 spec 不以它为必需数据。[ZH-F50]

后续若拿到原始 SVG：先分主队实线、可能支队虚线和七位使者旅行线，不把地图全部黑线当郑和本人路线。至少六个真实海岸/地点控制点、记录投影与残差，单独输出 route GeoJSON，目标 RMS ≤50 km、最大误差 ≤100 km；超过时只作文献插图，不转成可导航航迹。这些是编辑验收门槛，不是原史料误差。第 1–6 航次不复制第 7 航次几何。该分支尚未取得数据，不计入本次默认验收。

### 3.5 地图层与文件计划

| 运行时文件 | 本轮来源 | 格式/对象与约束 | 许可家族 |
|---|---|---|---|
| zheng-he-land.json | D01 原始 NE 10m land | 区域裁切/简化 TopoJSON；唯一对象 zheng-he-land；kind land/coast，真实岛环保留 | PD 底层；原创整理可按 NC-SA，署名 NE |
| events.json | ports.geojson + 事实表 | 30 个事件，17 site + 13 dated；双语、来源 id、统一命名 | Atlas CC BY-NC-SA 4.0；NE PD、GeoNames CC BY 署名 |
| control.json | 9 个空帧 | features=0，不存在历史国界观测 | Atlas CC BY-NC-SA 4.0 |
| movements.json | 无 | 空数组 | Atlas CC BY-NC-SA 4.0 |
| presets.json / glossary.json / sources.json | 本 spec、facts/source ledger | 现有 schema，先转换 source text 为 en/zh，不把准备 ledger 原样丢入引擎 | Atlas 原创 NC-SA；仅短引文需署名 |

无 datedLayers 必需文件；只有 site/事件与底图。已有 datedLayers 要求 TopoJSON 单对象、f/u 有限且 f<u、[f,u) 过滤，不能把 ports.geojson 直接当 datedLayers runtime 文件。没有 Ma、landEra 新需求；现代海岸一直显示，背景读图说明负责历史岸线限制。

当前 main 的 TimeScene 无自定义观察范围 PLATE 或 readerEnd 索引注册。按“无新增引擎”决定，范围用既有 subtitle/note、年份轴显示；每章末使用现有 More + FlyTo + 来源说明作内容索引，可切换取景并阅读定位证据。地图点点击仍用已有 EventInspector。这不是点击索引直接开启 inspector 的新增功能。不显示“17 个已访问港口”计数：17 是地理锚点总数，含区域、上下文和未证实访问点。下方仅章节轴，读数放左列；阅读面板固定章头→拍→详情→正文→本章索引。所有被正文提及的地理对象可从索引进入详情。

### 3.6 地图预取与许可验收

已预取 **4 份来源，共 43,718,244 bytes（约 41.69 MiB）**：NE land 11 个大几何要素、NE populated places 7,342 点、GeoNames IR 254,986 行、TZ 19,524 行；派生 17 个定位点。详见 `data/INVENTORY.md`、`download-records.json`、`ports-provenance.json`。[许可来源 S22–S23]

NE land 的 feature 数不是岛屿数；Geometry MultiPolygon 内有许多岛环。必须实际计环再评估简化，不能按 11 误以为丢失所有小岛。原始 prefetch 不是 ≤2 MB 的运行时包，施工需裁切简化并肉眼查新加坡、霍尔木兹与海峡。默认没有地名国界层，避免把现代国际边界覆在十五世纪解释之上。

许可隔离：`ports.geojson` 与运行时事件只由 PD + CC BY 数据和 Atlas 原创叙述组成，家族 **CC BY-NC-SA 4.0**。不复制 UNESCO BY-SA 描述段落，不把 BY-SA-only 几何混入。S21 若能下载，明确选择 CC BY 1.0 分支并记录作者、底图作者、修改；若改用 BY-SA-only 来源，另派生 BY-SA 文件并在未来 LICENSE-CONTENT 加 carve-out。用户允许的 ODbL / ODC-BY 也需独立保留数据库 notices；本版未用。

未清许可的 NLB 扫描、Met 图像、受限数据库不下载。MOE 版权 PDF 只读已有文件，记录短引文与哈希，没有复制进交付目录。

## 4. 最小引擎契约：无新增，仅复用与内容验证

**新引擎工作：无。** 这一决定建立在当前 docs/06 与 schema、EventInspector/Counter 的实际读取上，不依赖将来功能。下面是内容/构建契约，不能误派成引擎扩展。

| 输入 | 校验规则 | 输出/绑定 | 验证样例（预期） |
|---|---|---|---|
| ports.geojson | FeatureCollection；17 个 Point；lon/lat 有限；id 唯一；每点来源；角色非空 | place→site id；坐标原样复制 events.at；新增英文/中文地域说明 | Hormuz = [56.4529,27.095]；禁止 [56.272135,27.20406] 的 Bandar Abbas 替代 |
| control.keyframes | 1405,1407,1409,1411,1413,1415,1417,1421,1433 严格递增 | 每帧空 FeatureCollection；model 解码与淡化已有逻辑 | 9 帧，total control features=0；t=1422 不应有领土填色 |
| chapters.state.beats | 8 章，每章 5；chapter id 唯一；所有 caption en/zh；fact 与 highlight 均存在 | applyBeatState → t/camera/layers/highlight；按既有 URL 同步 | 40 拍；07-b t=1433；highlight site-hormuz；点拍不自动连播 |
| events / casualty | 每个日期、数量有 sources；unknown 不填 0；kind 条件满足 schema | EventInspector，来源按钮，Counter；全键盘/触控 | 自动 counterPer(5000)=500 →10 图标；counterPer(170)=10 →17 图标；170,per=100 →2 个槽、末槽70%（组件边界验证） |
| layers | 每拍显式 [base,sites,battles]，无 borders；site 可点 | sites 静态点；dated events 走原 battles 层；0 movement | 05-d 只高亮 site-kilwa，详情明确“未证实访问”而非 landing |
| region land | 真实 D01 几何，裁切前后可追溯；所有环闭合，无自交；同名对象 | basemap.region.land；outline 与 paper/cinema token | bounds [35,-15,125,37]；首屏地图包最终 ≤2 MB；岛岸未被 bbox 代替 |

上述 Counter 参数是组件已有数学验证，不强制改写自动选择单位；生产 EventInspector 必须核对实际 unit label。相同事实只保留一份数字。不要把“5,000 已核实”写进 aria-label；可访问文本也应保留“reported / 报告”。

性能：静态本地打包，无外部瓦片、字体、图片或 API；TimeScene 首屏 JS ≤400 KB gz；地图运行时几何 ≤2 MB；不要把 43.7 MB 原始数据放进 PWA 预缓存。图版纸色与暗色双主题、触控 ≥44px、标签同屏目标 ≤12 个；高亮点必须有引线，手机不靠 hover。

## 5. 名词表 EN / ZH（15 项）

词库调查有 78 条，完整形式与 attestation 状态在 facts.json；运行时只选正文真正用到的 15 个。未获新加坡权威用法的历史音译在稿内写旧称/今名双名，发布前核读。首次 Term 链接 EN/ZH 各一次。

| id | EN / ZH | 定义 EN / ZH 初稿 | 事实 |
|---|---|---|---|
| term-envoy | envoy / 使节 | A person sent to represent a ruler or government. / 代表统治者或政府出使的人。 | ZH-F15 |
| term-tribute | tribute / 朝贡 | Gifts and formal recognition within a court’s diplomatic order; meanings and benefits could differ. / 在朝廷外交秩序中进献礼物并表达承认；各方的理解和利益不一定相同。 | ZH-F04,15–16 |
| term-monsoon | monsoon / 季风 | A large-scale seasonal change in wind circulation. / 大范围、随季节变化的风循环。 | ZH-F41 |
| term-interpreter | interpreter / 通事 | A person who helps speakers of different languages communicate. / 帮助使用不同语言的人沟通的人。 | ZH-F13 |
| term-depot | staging depot / 仓储据点 | A place to store supplies and assemble for another stage. / 存放物资、集合并准备下一段航程的地方。 | ZH-F17,51 |
| term-temasek | Temasek / 淡马锡 | A historical name found in sources about the Singapore region. / 史料中见于新加坡区域的历史地名。 | ZH-F25 |
| term-melaka | Melaka / 马六甲 | A Malay port polity central to this topic’s straits connections. / 本主题海峡交流中的马来港口政权。 | ZH-F22–24 |
| term-old-port | Old Port / 旧港 | A historical name associated here with Palembang; not a precise battlefield coordinate. / 本主题对应今天巨港的历史名称，不是精确战场坐标。 | ZH-F18 |
| term-hormuz | Hormuz / 霍尔木兹 | The island port destination in the expedition account. / 远航记载中的岛上港口目的地。 | ZH-F12 |
| term-swahili | Swahili coastal culture / 斯瓦希里沿海文化 | East African coastal culture central to its port histories. / 东非沿海港口历史中的重要地方文化。 | ZH-F34 |
| term-qilin | qilin / 麒麟 | An auspicious mythical creature used by courtiers to interpret the giraffe. / 宫廷用来解释长颈鹿的一种祥瑞神话动物。 | ZH-F32 |
| term-inscription | inscription / 碑刻 | Writing preserved on an object such as a stone stele. / 刻在石碑等物件上保存下来的文字。 | ZH-F28–30 |
| term-evidence | historical evidence / 历史证据 | Surviving material used to answer a question about the past. / 用来回答过去某个问题的留存材料。 | ZH-F27,46 |
| term-interpretation | interpretation / 历史解释 | An argued account based on selected evidence, open to scrutiny. / 依据所选证据提出、可以被检验的解释。 | ZH-F16,46,52 |
| term-treasure-ship | treasure ship / 宝船 | A name used for major fleet vessels, whose dimensions remain disputed. / 用于船队大型船只的名称，其尺寸仍有争论。 | ZH-F36–37 |

## 6. 来源表与 fact 映射

优先原始碑刻/官史的可靠解释、学术研究与馆藏说明；百科与地图页面只用于其实际提供的元数据。S01 旧教材页有宝船尺寸的过度肯定和简化，不能照抄；S29 新提纲也有明显转录错误，不能把其 1733、1403 等误字用作日期。动机解释有明确归属。[ZH-F36–37,52]

| Source id | 来源 | 用途与证据范围 | 对应 facts |
|---|---|---|---|
| S01 | [Columbia University, Asia for Educators · The Ming Voyages](https://afe.easia.columbia.edu/special/china_1000ce_mingvoyages.htm) | The Seven Voyages; Preparing the Fleet; The Fateful Decision | ZH-F02, ZH-F04, ZH-F05, ZH-F06, ZH-F07, ZH-F08, ZH-F09, ZH-F10, ZH-F11, ZH-F12, ZH-F13, ZH-F35, ZH-F38, ZH-X01 |
| S02 | [Geoff Wade / NUS Asia Research Institute, Working Paper 31 (2004) · The Zheng He Voyages: A Reassessment](https://ari.nus.edu.sg/wp-content/uploads/2018/10/wps04_031.pdf) | printed pp. 3, 13–17, 20–25; PDF pages +1 | ZH-F03, ZH-F16, ZH-F17, ZH-F18, ZH-F19, ZH-F20, ZH-F21 |
| S03 | [National Library Board Singapore · Bukit Larangan: Early Singapore in Maps, Texts, and Artifacts](https://curiocity.nlb.gov.sg/digital-stories/fort-canning-hill/bukit-larangan/) | Early Singapore Maps; Early Singapore Artefacts | ZH-F25, ZH-F26, ZH-F27 |
| S04 | [The Mariners’ Museum and Park, Ages of Exploration · Zheng He](https://exploration.marinersmuseum.org/subject/zheng-he/) | Principal Voyage; Later Years and Death; Legacy | ZH-F01, ZH-F14, ZH-F15, ZH-F40 |
| S05 | [The Metropolitan Museum of Art · Giraffe with Two Keepers (object 51649)](https://www.metmuseum.org/art/collection/search/51649) | Curatorial description; object date Qing dynasty | ZH-F31, ZH-F32 |
| S06 | [UNESCO World Heritage Centre · Ruins of Kilwa Kisiwani and Ruins of Songo Mnara](https://whc.unesco.org/en/list/144) | Description; Outstanding Universal Value | ZH-F33 |
| S07 | [UNESCO World Heritage Centre · Melaka and George Town, Historic Cities of the Straits of Malacca](https://whc.unesco.org/en/list/1223/) | Description; Outstanding Universal Value | ZH-F24 |
| S08 | [Asian Civilisations Museum / NHB Singapore · Tang Shipwreck](https://www.nhb.gov.sg/acm/galleries/maritime-trade/tang-shipwreck) | About the gallery | ZH-F43 |
| S09 | [Kan Shuyi, ACM / NHB Roots · Sunken Treasure: A Ninth Century Shipwreck](https://www.roots.gov.sg/stories-landing/stories/sunken-treasure-a-ninth-century-shipwreck/story) | Ship construction; uncertain departure port | ZH-F44 |
| S10 | [Sally K. Church, Monumenta Serica 53 (2005), 1–43 · Zheng He: An Investigation into the Plausibility of 450-ft Treasure Ships](https://www.researchgate.net/publication/261905911_ZHENG_HE_AN_INVESTIGATION_INTO_THE_PLAUSIBILITY_OF_450-FT_TREASURE_SHIPS) | Author-uploaded public text: opening; Xin Yuan’ou’s engineering arguments; conclusion; DOI 10.1179/mon.2005.53.1.001 | ZH-F36 |
| S11 | [American Historical Association · Frederic Wakeman Jr., presidential address](https://www.historians.org/presidential-address/frederic-wakeman-jr/) | notes 45–46: Needham, liao, rudder evidence | ZH-F37 |
| S12 | [万明 / 中国社会科学院（中国社会科学报，2019-12-02） · 郑和下西洋七至满剌加](https://www.cass.cn/xueshuchengguo/xscg_lsyjy/201912/t20191202_5051930.shtml) | 时间上存在可能性; 1403 尹庆; 五次/七次争论 | ZH-F22, ZH-F23, ZH-F51 |
| S13 | [Sri Lanka National Commission for UNESCO · Trilingual Inscription](https://slncu.lk/partnerships-networks/mow/trilingual-inscription/) | Memory of the World item description | ZH-F28 |
| S14 | [Siddham, The Asian Inscription Database · IN03152 Galle Trilingual Stele – Chinese Inscription](https://siddham.network/inscription/in03152/?section=metadata) | Metadata; Chinese text, Tamil and Persian positions | ZH-F29, ZH-F30 |
| S15 | [Meteorological Service Singapore · Climate of Singapore](https://www.weather.gov.sg/climate-climate-of-singapore) | Seasons; Surface Wind; 1991–2020 station climatology | ZH-F42 |
| S16 | [Meteorological Service Singapore · Winds](https://www.weather.gov.sg/learn_winds/) | Tropical Monsoon | ZH-F41 |
| S17 | [Keith C. Barton / American Historical Association (2004) · Research on Students’ Historical Thinking and Learning](https://www.historians.org/perspectives-article/research-on-students-historical-thinking-and-learning-october-2004/) | Individual agency; overnarrativisation; historical evidence | ZH-F45, ZH-F46 |
| S18 | [Ofsted / UK Department for Education (2021) · Research review series: history](https://www.gov.uk/government/publications/research-review-series-history/research-review-series-history) | Interpretations; misconceptions; contingency | ZH-F47 |
| S19 | [Ministry of Education Singapore · 2020 Social Studies Primary Teaching and Learning Syllabus, updated January 2024](https://www.moe.gov.sg/media/files/primary/d8ea4817-c1b3-4217-84d4-82838d39d75c.pdf) | printed pp. 39, 41–42; PDF pp. 40, 42–43 | ZH-F48 |
| S20 | [Ministry of Education Singapore · 2023 Primary Science Syllabus (local January 2026 copy)](https://www.moe.gov.sg/-/media/files/primary/syllabus/primary-science-syllabus-2023_may24.pdf) | printed p. 62; PDF p. 63 | ZH-F49 |
| S21 | [Vmenkov, based on Historicair’s Asie.svg / Wikimedia Commons · File:Ming-Expeditions.svg](https://commons.wikimedia.org/wiki/File:Ming-Expeditions.svg) | Summary and Licensing; main fleet versus possible Hong Bao route | ZH-F50 |
| S22 | [Natural Earth contributors · Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) | Terms of Use | 许可/术语/参考目录 |
| S23 | [GeoNames · GeoNames Gazetteer extract readme](https://download.geonames.org/export/dump/readme.txt) | Licence and geoname table columns | 许可/术语/参考目录 |
| S24 | [Wikimedia Foundation / Wikidata contributors · Wikidata:Licensing](https://www.wikidata.org/wiki/Wikidata:Licensing) | Official policy | 许可/术语/参考目录 |
| S25 | [Channel Islands Maritime Museum volunteer education page · Admiral Zheng He and the Chinese Treasure Fleet](https://www.education.maritime-museum.org/training/north-gallery-2/asian-history/admiral-zheng-he-and-the-chinese-treasure-fleet/) | Size of the ships; uncertain reconstructions | 许可/术语/参考目录 |
| S26 | [Tanzania Wildlife Management Authority · RUINS OF KILWA AND SONGО MNARA](https://www.tawa.go.tz/attraction-details/ruins-kilwa-and-songo-mnara-world-heritage-site) | Cultural Heritage Sites; Swahili coastal culture | ZH-F34 |
| S27 | [UNESCO World Heritage Centre · 基尔瓦基斯瓦尼遗址和松戈马拉遗址](https://whc.unesco.org/zh/list/144) | 中文简介 | 许可/术语/参考目录 |
| S28 | [Gakusho Nakajima, Socio-Economic History 76(4), 501–524 (2011) · Transformation and reorganization of the international trade order in East Asia from the 14th to 16th century](https://www.jstage.jst.go.jp/article/sehs/76/4/76_KJ00007943782/_article/-char/en) | Author abstract; DOI 10.20624/sehs.76.4_501 | ZH-F39 |
| S29 | [Columbia University, Asia for Educators · China’s Ming Voyages: teaching guide](https://video.afe.easia.columbia.edu/teaching-guides/the-ming-maritime-expedititons-zheng-he-teaching-guide/) | Outline III–IV, 23:00 and 42:00; source contains apparent transcription errors, do not use chronology in vocabulary box | ZH-F52 |
| S30 | [Wang Gungwu / ISEAS–Yusof Ishak Institute, in Admiral Zheng He and Southeast Asia (2005), pp. 1–25 · The Opening of Relations between China and Malacca, 1403–05](https://www.cambridge.org/core/books/abs/admiral-zheng-he-and-southeast-asia/opening-of-relations-between-china-and-malacca-140305/E65EFF1BD3DCEA4AB517D8DA201ABE66) | Public chapter summary, paragraphs 1–4; full chapter gated and not accessed | ZH-X02 |

逐字短引文预算与引用定位见 facts.json。运行时 sourceId 去掉前导零：S01→S1（全部 S1–S30）。S10 仅公开可返回全文段落，不声称核完版权期刊全部页面。所有 quote 是短原句，不将解释写成引号里的原话。

## 7. 图像计划与准确性边界

| 文件 | kind / 章 | 画面与约束 | Facts / 类型 |
|---|---|---|---|
| zheng-he.png | cover / 01 | 单艘三桅三帆中国式木帆船、船尾舵；代表性器物图，不是某艘宝船的比例复原 | ZH-F36–38；桅帆数为图像设计，不是史料确数 |
| zheng-he-giraffe.png | figure / 04 | 一只长颈鹿，自然史图；四腿、双耳、双角状突起、尾一条；无运输装置或神兽混合 | ZH-F31–32；不声称还原 1414 个体 |
| zheng-he-trade-goods.png | figure / 05 | 一只储物陶罐、一只瓷碗、一卷丝绸；商品类别，不是同一货舱的出土清单 | ZH-F15,33,ZH-X01；所列货物补充在 facts-extra.json |

准备三图均为透明 PNG、严格中性灰、铅笔交叉排线/点描、无字/标/旗/箭头/框/纸纹/地影。尺寸 cover 1024²，figure 1536×1152。生成原图先视觉核数，再按 brief 明确授权只做灰度/alpha/尺寸规范；检查最终 alpha bbox 与非透明边距，保存 manifest、prompt 与检查记录。计划不包含不确定尺寸的船只比例对比图。

## 8. 施工与验收清单

### 8.1 本次准备验收（由 audit-report.json 记录实际结果）

- [x] 自己的新 dossier 作为 parent；未编 sibling；BRIEF2 许可规则优先。
- [x] 8 章 / 40 双语拍；fact id 与 highlight id 可解析；章序与首拍时间相符。
- [x] 4 个开放数据源已下载，能打开，行数/范围/sha256/用途入 inventory；单份 <300 MB、总计 <1 GB。
- [x] 默认点图具备真实地理数据；路线 403 有完整降级，不填合成轨迹。
- [x] 本地 syllabus 页码和短引文核过；新加坡链接 status 实查为 draft，不伪报 published。
- [x] 最终三张 PNG 与 manifest 的视觉、灰度、透明、尺寸核验完成；image-qa.json 与 audit-report.json 为证。

### 8.2 施工验收

- [ ] Gavin 读稿后内容定稿；逐段落实所有来源/敏感措辞；核中文音译、交叉链接和图像图注。
- [x] 按现有 schema 导出；地图裁切简化与 TopoJSON 环验收；首尾空控制帧与港口坐标由数据验证，静态来源／成品图已核。应用截图留主会话。
- [ ] 运行 pnpm check / validate / test / build / e2e；视觉再 shoot --layout --keys --beats 并看图。
- [ ] paper/cinema、EN/ZH、iPad/手机、无运行时外部请求；键盘与触控一致；无未来高亮、无离镜头对象。
- [x] 保持 status:draft；绝不自行改 published。

### 8.3 开放问题与默认答案

| 项目 | 默认 | 对后续的影响 |
|---|---|---|
| 是否必须要动态航迹？ | 本稿采用点与镜头即可完成；取得原始路线图再考虑增强 | 若 Gavin 指定航迹为必需，原始文件下载/配准是施工前条件，不能合成代替。 |
| 历史中文音译 | 古里、柯枝、忽鲁谟斯与今名并列；SG 用法不详的标待核 | facts.json 里 unverified 不自动进最终名词表。 |
| 郑和死亡地点与年龄 | 不定位、不做日期/年龄定论 | 详细死亡叙述需专门再核；当前不阻塞 draft 施工。[ZH-F40] |
| “殖民主义”一词 | 作为 Wade 的分析术语，而非 Atlas 的裁决 | 与正统性/外交解释并列，不给国家作道德排名。[ZH-F16,52] |
| NLB/Met 原始图像 | 不下载，生成原创图并作说明 | 没有现成扫描或现代纪念物便不把 AI 图充当史料。 |
| 许可 carve-out | 本版派生文件不含 BY-SA；无需本次编辑 LICENSE-CONTENT | 后续如引 BY-SA 或 ODbL，先隔离输出，不能混入 NC-SA 文件。 |

本 spec 授权按 BUILD brief 施工，不授权改为 published。浏览器门槛按 brief 留主会话执行；e2e 端口 5447。

## 9. 施工记录

### 9.1 内容与数据（2026-10-27）

- 新引擎项保留 0；未修改引擎／schema／docs/06，不依赖未合并分支。区域裁切、site、事件、计数器、year、camera、More/FlyTo、glossary、Figure 全用 main。
- `src/content/topics/zheng-he/`：背景章 + 7 章，40 双语拍；30 事件 = 17 site + 13 dated；5 叙事实体；11 预设；15 词；30 来源；9 个空控制帧；0 movement；0 新参考／风场／政治图层。无 quiz／试一试。
- 图像按批准图处理：封面 800/1600 WebP + 2 幅 1200×900 章图；`illustrations.json` 只新增 zheng-he。
- `scripts/geo/zheng-he/build-land.ts --source <D01>` 固定准备原始文件 SHA，调用现有 mapshaper/regionTopology。区域图 363,634 bytes，1,034 环，0 零面积、0 自交；没有配准，不报虚假 RMS。静态来源／成品对照在 `scripts/geo/zheng-he/evidence/coastline-comparison.png`，已查看。
- 所有章 state 对齐第一拍，默认镜头以 §2 表和实际 frontmatter 为准。04-a/05-a/06-a 的南京出发事件改 China 视野；印度／东非双点只改镜头，不挪地理数据。
- 准备稿假定的自定义 PLATE／交互章节索引当前 main 不存在：遵守无引擎工作，范围用 subtitle/note/年份轴；索引用 More + FlyTo + 来源说明，点击切取景并就地阅读证据，EventInspector 仍从地图点开。此差异已列 REVIEW。
- 运行时 S01→S1，余类同，满足既有 sourceId；正文各词首次 EN/ZH 一次；交叉链接只向既有 draft 目标。没有 spec 要求的反向链接，不改其他主题。
- 新 unit 8 项、新 e2e 7 项；结果与主会话待验收项见 REVIEW.md / AUDIT.md。保持 draft，不改 smoke 数、不提交。

### 9.2 门槛记录

2026-10-27：`pnpm check` exit 0，765 files、0 errors／0 warnings、3 个既有 hints；`pnpm validate` 58 topics、0／0；`pnpm test` 161 files／4,285 tests 通过（本题 8 tests，索引后再跑也通过）；`pnpm build` exit 0，119 pages、PWA 完成，有共享 chunk >500 kB 提醒，未新增运行时 JS。构建后的两种语言各有 8 个章正文、2 个 figure、8 个索引；data 30 events／0 movements／9 空帧。`shoot` 与 `e2e` 按 BUILD brief 跳过，留主会话 port 5447；已写 7 项 e2e。不能将静态 QA 当作浏览器通过。详见 REVIEW.md／AUDIT.md。

### 9.3 浏览器验收（Claude，2026-10-27）

- **看过的图**：1024×768 en/paper 全 40 拍、zh/cinema 全 40 拍；390×844 zh/cinema 13 拍与 en/paper 8 章阅读视图；1280×800 与 390×844 上点开“本章索引”、点 FlyTo、点标记打开 EventInspector。官方 `pnpm shoot zheng-he --beats --keys --layout`：en/paper 全绿（console clean、key failures 0、layout 0、beat failures 0），zh/cinema 的 beats／keys 全绿；`pnpm shoot` 在负载 120+ 的机器上截图时机不稳，故另用同一 dist 的自写脚本在每拍等 3.5 秒后截图作为主要视觉依据。
- **海岸与点**：现代 NE 海岸、无国界填色、无航线，各视野与 §3 一致；标签落在对应点上，没有 HUD 重叠。没有任何线条暗示航迹（只有标签引线）。
- **改动（均为取景／字数，不动数据点）**：
  - 02 章 2、3 拍（旧港）：旧港点原在字幕卡下被遮住，镜头改为 [103.9, −1.0, 5.5]。
  - 00 章 4 拍、05 章 4、5 拍（基尔瓦）：基尔瓦贴字幕卡上沿，镜头改为 [42, −6, 4.2]。
  - 全洋取景 `view-ocean` 与各“全图”拍：由 [80, 8, 2.2] 改为 [80, 10, 2.1]，1024×768 下版框底部不再被字幕卡压住。
  - 06 章 4、5 拍时间 1424 → 1422：1424 年没有对应事实，字幕与正文也没有这一年；字幕 4 改为“After 1422 / 1422 年以后”。
  - 4 条 zh 字幕（03-3、04-4、05-4、06-4）超过 45 字，在 390 宽字幕卡里被截掉末句（如“不是确认的船队停靠点”）；改写为 ≤ 40 字，意思不变。
  - 07 章 ZH “茅坤图传统”改为“《武备志》所收的航海图（英文文献称 Mao Kun map）”：茅坤图是英文文献的称呼。
  - e2e “forty beats” 的标签等待由 5 秒放宽到 20 秒（标签在镜头跳转后数帧才放置，机器负载高时 5 秒不够）。
- **THIRD-PARTY-NOTICES**：新增 GeoNames（CC BY 4.0，霍尔木兹／基尔瓦两个点）一行；NE 属公有领域，已有总条目，不再重复。
- **性能**：`pnpm shoot zheng-he --perf --gpu`（1920×1080，机器负载 120–230）：27 个镜头 58–60 fps，console clean，首屏 JS 452.9 KB gz／10 文件（共享 TimeScene 引擎，本题无新增 JS；高于 §4 写的 ≤400 KB，是引擎既有体量，非本题造成）。海岸运行时 363,634 bytes，按需加载。
- **e2e**（`CI=1 ATLAS_E2E_PORT=5447`）：zheng-he.spec 7/7 通过（“forty beats” 在放宽等待后通过）；smoke 的 `index (en/zh) lists published topics only` 通过（draft 未上首页，smoke 计数未动）；`sample-space` 两项在重载下超时（SpaceScene，与本题无关，未改引擎），留主会话全量跑。
- **剩余**：`--layout` 探针在 zh/cinema 偶发 `bar` 内容宽于面板：第一次 1280／1024、第二次 1920，每次只在前 1–3 章、尺寸不同，单独量 DOM 复现不出；ww2 zh/cinema 同探针在 3840–1024 全部通过。疑为重载下探针等待（350 ms）不足，仍请主会话在空闲机器上重跑 `--layout`。移动端字幕卡无 leader 标签、章节索引里 FlyTo 只切取景不开 inspector（需再点地图标记），都是引擎既有行为；见 REVIEW。


### 9.4 TimeScene 与内容跟进（2026-10-27）

本题继续 `status: draft`。中文 Geoff Wade 统一写“韦德”，正文首次“韦德（Geoff Wade）”；独立事件摘要／来源目录同样可对应英文姓名。原事实、来源与解释归属保留。

南京的九条 dated 记录以 `displayOffset` 分开：D02 `at` 原样保留，site-nanjing 不动；半径 96 CSS px，正北起顺时针每 40°，按 first / third / captives / fourth / giraffe / fifth / sixth / seventh / final 的固定顺序，四舍五入 0.1 px。最小间距约 65.7 px；符号、命中、脉冲、引线共用偏移。不是新历史实址或航线。背景说明与正文双语说明约定，精确偏移表见 data/SOURCES.md；原 §9.1“无引擎修改”属于初版记录。

重读 S1 的第二航次段，确认船队赴古里参加新王即位典礼，郑和组织但未亲自率队。evt-second-voyage 保留古里／科泽科德 D02 坐标；事件详情与章索引写明目的地含义，既不定位典礼实址，也不声称某日船位。

八章双语 More 索引的每个 FlyTo 行都带 event id：点击选中并在章头下显示同一事件详情，仍使用原 preset 取景。普通正文取景按钮仍可只切取景。TimeScene 按数据决定战争统计与图层；本题确有旧港 battle，保留战斗统计／事件层，隐藏空行动、空控制区和空参与层。其他主题回归与本轮四项非浏览器门槛结果见本节后续记录；浏览器检查由主会话执行，本轮没有打开或控制浏览器／桌面。


本轮最终非浏览器门槛（2026-10-27）：`pnpm check` exit 0，814 files、0 errors／0 warnings、4 hints；`pnpm validate` exit 0，63 topics、0 errors／0 warnings；全量 `pnpm test -- --maxWorkers=2` exit 0，175 files／4,479 tests 全过；`pnpm build` exit 0，129 static pages、PWA 完成（共享大 chunk 提醒仍在）。初次默认并发 test 有两项未修改的几何测试超过 5 秒，降低 worker 数后完整重跑通过；未放宽超时或改测试配置。`git diff --check` 通过。EN／ZH 静态成品各有 40 个郑和可选 FlyTo 行，两题仍为 draft。shoot／e2e 按用户要求未运行，完全未打开或驱动浏览器／桌面。

### 9.5 浏览器验收（Claude，2026-10-27）

- `pnpm shoot zheng-he --beats --keys`：40 拍 0 失败；修正 N 键后 keys 0 失败（原先无领土名称却注册 N 键）。
- **对象索引**：02 章（1600×900）与 04 章（390×844，中文）各点四行 `<FlyTo event>`：选中对象正确、`detailCount` 1、详情在章头下、预设取景保留、阅读面板保持展开；手机上详情抽屉保留。
- **南京偏移**：在 07 章中国沿岸视图逐个点击九个位置（八个环形记录 + 中心城市点），九次选中各不相同；1433 拍第九个记录 evt-final-return 出现并在环上。整区视图（zoom 3）下 96 px 半径约等于上千公里，环上标记会落到山东、台湾附近，读者难看出它们属于南京；已给偏移标记加一条 hairline 腿连回南京点（`displayLeg`，单测覆盖）。半径是否随缩放收小，留给 Gavin。
- 文字：S2 中文来源名去掉套括号，改为"韦德（Geoff Wade）／新加坡国立大学亚洲研究所工作论文第 31 号（2004）·《郑和远航：重新评估》"，SOURCES.md 同步。
