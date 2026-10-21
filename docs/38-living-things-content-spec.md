# 38 · 生物的分类 · 内容施工 spec（`living-things`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体的变体 **"标本台"**（同 docs/36 "实验台"的做法）：一张课室用的长桌，后面一只 9 × 4 格的**标本盒**（32 件程序化标本模型，每件一格），前面一只**分类盘**（按问题换成 2、3 或 6 + 1 个组的毡垫），左后角一块**显微镜台座**（放大画的酵母细胞和细菌）。读者每一章选一个"是 / 不是"的问题，标本从盒里起身、落进分类盘上的组；右上角的**分类流程图卡**同步画出问了哪些问题、每组几件。本主题的任务：**P3 学生看完能说清生物需要水、食物和空气，会生长、对变化有反应、会繁殖（会动不在这张单上，玩具车会动也会"反应"，但不生长、不繁殖）；能认出四个大类——植物（开花、不开花）、动物（两栖、鸟、鱼、昆虫、哺乳、爬行）、真菌（霉菌、蘑菇、酵母）、细菌；能按看得见的共同特征给植物和动物分组，用流程图和打勾表；知道蝙蝠、海豚、企鹅、蜘蛛、蟾蜍、弹涂鱼、穿山甲这些"长得像别的组"的动物该归哪里、为什么。**

`subject: science`；对应 2023 课纲 P3 *Diversity of Living and Non-Living Things (General characteristics and classification)*（S1 第 38 页）。docs/17 §3.1 Diversity 第一行（"标本台，孩子把 16–20 个标本分进组"，引擎 M 或 S）、§7 A10 / B7。

2026-10-21 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/36（§0 决定 → §1 课纲与范围 → §2 事实 → §3 标本与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕与正文要点是**草稿**，用来定节拍和模型状态：EN 施工时由 Sonnet 起草全文、Opus 逐句核对；ZH 是本文的草稿，施工时 Opus 独立定稿。事实来自 Sonnet 的研究 `art/research/living-things/`（`living-things-research.md` §1–§7 与 `facts.json`：169 条逐字核过的摘录、68 个来源、31 个中文术语，2026-10-21 完成）；下文 **R:** 后面是 `facts.json` 的条目 id（如 R: `ex-toad-skin2`），**S#** 是它的来源号（S1 = 课纲 … S74）。研究没有覆盖的事实标"待核"（§2.7），施工代理读原文核对后才能用，核不到按该行写的退路处理。课纲第 38 页起草时本人用 `pdftotext -layout` 读过（仓库里的同一份 PDF `art/codex-research/states-of-matter/sources/moe-primary-science-2023-jan2026.pdf`，PDF 第 39 页；印的第 n 页 = PDF 第 n + 1 页）。

**本主题不用 Codex**：没有新图（只用 `art/planned/living-things/` 里三张已审的草稿，§7），研究已由 Sonnet 做完，施工分工见 §8.1（Opus / Sonnet / Haiku）。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **形式 = SpaceScene 标本台 + 每章一张"分一分"试一试**，不走 MathScene 的"讲解节拍 + 章末小测"。比过的两条路：**(a) SpaceScene**：课纲的动词是 *observe* 和 *classify … based on common observable characteristics*（S1 第 38 页）——"看得见的特征"要真的能看：转一转标本数腿、看羽毛和毛、看鳍和鳞；分组是标本**在盘子里真的移动**，问题一换、组就重排，比一张选择题更接近"分类"这个动作；"企鹅放哪一组""哪些分错了"用**先猜后看**（不判对错）和第 05 章"同学的分类盘"表达，模型算出放置和对错。代价：一个小模型 + 一个绑定 + 一张右上卡 + 两种表面纹理（§4，约 4 天）；32 件标本是内容工作，只用现有积木（`sweep` / `wing` / `lathe` / 带 `scale` 的 `sphere` / `extra` / `mirror`），蝗虫、蚊子、植物三个主题已证明这些积木做得出一眼能认的生物；标本做成"标本模型"一级（每件 6–15 块、2–3 个材质槽），细节链到已有的蝗虫、蚊子、植物主题。**(b) MathScene**：长处是判对错 + 按误解诊断的反馈，"哪个分错了"天然是一道 `choose` 题。但 MathScene 的舞台是 SVG、模型全是数学的：要新做一种"生物卡片"模型（32 张手画 SVG 生物图，没有 Codex 出图，只能由代理手写路径，质量风险高）、新的 `sort` / 流程图题型、一个"生物"误解诊断域、`check-pool` 支持科学题（docs/17 A10），约 6–8 天 + 美术；而且 Atlas 的科学主题一律"不做测验"（skill `atlas-space-topic`"默认不做测验"；docs/36 D6）。**结论：(a)**。判分的小测留作 v2（§4.7） | 同意 | 定稿 |
| D2 | **引擎：新加一个模型 `kind: 'sort'`**（E-LT1）+ **一个新绑定 `shift`**（E-LT2，按模型给的向量把标本移进组）+ **一张右上卡"分类流程图"**（E-LT3）+ **两种表面 `scales` / `feathers`**（E-LT4）+ **µm 比例尺**（E-LT5，可选）。**为什么不只用现有的 `pose` 绑定**：一个问题一个姿态的话，T1 六个、T3 六个、T4 七步、T5 两态、T6 的 6 × 6 种组合，远超 `poses` ≤ 32；放置是手写的，没有任何东西保证"放进羽毛组的真有羽毛"；"放错了几只""这一组里混了几类""海豚现在在哪一组"这些读数和先猜后看都要一个模型给出状态输出。`sort` 是纯函数：每件标本的特征（有来源，§3.4）× 本章的问题 → 组 → 组里的格子；数据里不写任何一件标本落在哪里（docs/30 D2"读数由模型算出"）。其余全部复用：试一试卡片（改变 / 不变 / 观察、记一行、条形图与折线图、先猜后看——状态输出的 `means: <状态 id>`）、`visible` 绑定、背景章、组级比例尺、`fabric` / `chitin` / `tissue` / `abrasive` / `enamel` / `glass` 材质族与 `tint` | 新 `kind: 'sort'` + `shift` + 流程图卡 + 两种表面，约 4 天 | 定稿 |
| D3 | **课纲边界**（§1.1 原文）：要的——描述生物的特征（需要水、食物、空气；生长、反应、繁殖）；认出几个大类（植物分开花 / 不开花；动物分六类；真菌举霉菌、蘑菇、酵母；细菌）；观察生物和非生物、推断不同；把生物**分成大组（植物与动物）**，依据看得见的共同特征；好奇、爱护生物。Note 原文：**记住具体生物的名称（如孔雀鱼）和它们的特征（如胎生）不要求**。所以：① 标本的物种名只是"这是什么"的说明（详情卡、索引），正文不要求记，不出"背下来"的表；② "下蛋 / 胎生 / 喂奶 / 用肺或鳃呼吸"在模型上看不见，**不作分类盘的问题**；第 05 章说明海豚、蝙蝠、穿山甲为什么是哺乳动物时要用到"呼吸空气、喂奶"，写成"科学家还看这些身体里面、生活里的特征"，石龙子胎生、孔雀鱼胎生、鸭嘴兽下蛋只在细看；③ **"会动"不在课纲的特征单上**（威尔士的 MRS GREN 有，新加坡没有，R: `mis-nrw-mrs`、`syl-p3-chars`），正文照新加坡的写；④ 课纲对真菌、细菌的动词是 *recognise*（认出），对植物、动物才是 *classify*（R: `syl-gloss-recognise`、`syl-gloss-classify`）：第 02 章的四大类用流程图演示，但不要求读者给真菌、细菌再分组；⑤ **孢子 / 种子**是 P5（第 43 页，R: `syl-p5-spores`）：不开花植物在主线只定义为"从来不开花"，孢子在细看；⑥ 不讲脊椎 / 无脊椎、界门纲目、原生生物、病毒、古菌、演化树（链 `grasshopper` 的"Where it sits in the tree of life"细看） | 同意 | 定稿 |
| D4 | **分组问题只问看得见的特征**，每个问题只有"是 / 不是"两个答案（R: `key-nrw-def`）。动物六类的流程图顺序（第 04 章 T4，研究 §3.4 的草案，**设计，不是 MOE 的**）：① 六条腿、身体分三部分 → 昆虫；② 有羽毛 → 鸟类；③ 有毛发 → 哺乳动物；④ 有鳍 → 鱼类；⑤ 身上有鳞片 → 爬行动物；⑥ 皮肤湿润、没有鳞片 → 两栖动物；都不是 → "不在这六类里"。这样排是因为鳞片（鱼、爬行动物、穿山甲）、翅膀（鸟、蝙蝠、昆虫）、"住在水里"都跨好几个组，不能先问（研究 §3.3）。这张流程图**会把海豚分进鱼类、把穿山甲分进爬行动物、把蟾蜍分到"都不是"**——这是第 05 章的内容，不是 bug（研究 §3.4"Known cracks"）。"会飞""有鳞片""有鳍"作为第一个问题会得到混在一起的组，第 06 章 T6 专门比较。**不问"住在水里吗"**：弹涂鱼、树蛙、海龟的答案说不清，数据给不出确定的是 / 不是 | 同意 | 定稿 |
| D5 | **必须讲对的十三处**（§1.4 误解目录逐条对应）：① **会动不是生物的特征**：植物不走动也是生物，玩具车会动不是生物；② **"有反应"一条不够**：玩具车也会"反应"（新加坡补习讲义的原话，R: `g-live-4`），要看生长、繁殖；③ **植物也需要食物**：它自己制造（R: `g-live-2`）；④ **真菌不是植物**：没有根、茎、叶，不能自己制造食物（R: `g-fungi-1`、`g-fungi-2`）；霉菌和酵母是生物；"真菌"不只是蘑菇；⑤ **面包上的霉看得见**：单个酵母细胞看不见，长成一片的霉看得见（纠正讲义"霉菌和酵母小到肉眼看不见"，R: `g-fungi-5`）；⑥ **细菌一个看不见，长成菌落看得见**（待核 F-90）；有的有益，有的有害（R: `g-bact-2`）；⑦ **开花植物不是一直有花**：辣椒幼苗还没开花，仍是开花植物（R: `g-plant-4`）；⑧ **长得像松树的木麻黄是开花植物**（R: `ex-casuarina`）；⑨ **不开花植物也是绿色的**（R: `g-plant-6`）；⑩ **蝙蝠是哺乳动物，企鹅是鸟**；⑪ **海豚是哺乳动物，鲨鱼是鱼**：海豚用喷水孔呼吸空气、没有鳃（R: `ex-dolphin-mammal`、`ex-dolphin-gills`）；⑫ **蜘蛛不是昆虫**：八条腿、身体两部分（R: `ex-spider`、`ex-spider2`）；⑬ **"规矩"只是大多数**：蟾蜍皮肤干、有疙瘩，仍是两栖动物（R: `ex-toad-skin2`）；弹涂鱼能在陆地上呼吸，仍是鱼（R: `ex-mudskipper`）；穿山甲有鳞片，是哺乳动物（R: `ex-pangolin`）；写"大多数鱼下蛋""大多数哺乳动物胎生"，不写"所有"（R: `g-fish-4`、`g-mammal-3`）。另加一条：**人也是动物，是哺乳动物**（R: `mis-yorek-human`；待核 F-98） | 同意 | 定稿 |
| D6 | **章数 6 + 背景章 00**（§5）：00 开始之前 / 01 生物与非生物 / 02 植物、动物、真菌、细菌 / 03 开花植物与不开花植物 / 04 动物的六个类群 / 05 分错了的动物 / 06 自己做分类流程图。**每章一个试一试**（00 没有），**不做测验** | 同意 | 定稿 |
| D7 | **六张试一试**（§5），每张写明改变 / 不变 / 观察，可记一行进表；都有先猜后看（不判对错）：**T1 生物还是非生物**（01）：换问题，看 7 样东西怎样分成两组；**T2 四大类**（02）：一步步问三个问题，看 13 件生物进 A–D；**T3 分植物**（03）：换问题，看 6 株植物怎样分；**T4 动物流程图**（04）：一步步问六个问题，看 18 只动物进 A–F 和"都不是"，折线图画"盒里还剩几只"；**T5 哪些分错了**（05，新加坡考题的形式，R: `key-sg-wrong`）：同学的分类盘，选一只动物看它放对没有、本该在哪一组，再按"放回正确的组"；**T6 自己的流程图**（06）：选第一、第二个问题，看 A、B 组里各混了几类，条形图比较六个第一问题 | 同意 | 定稿 |
| D8 | **对象 = 一张 1.9 × 1.1 m 的课室长桌**（1 场景单位 = 1 m）：后面一只浅木**标本盒**（9 × 4 个凹格，格距 9 cm）；前面一只**分类盘**（1.32 × 0.58 m），盘上的组是几块薄毡垫，按本章的问题换布局（2 组 / 3 组 / 6 组）；标本盒右边一小块毡垫 **X**："不在这六类里"；左后角一块**显微镜台座**和一台显微镜（放大画的细胞，单独入镜）。**标本是模型**：每件都按"放得进一格"的大小画（≤ 7 cm 见方），**彼此不按比例**（海豚和孔雀鱼一样大），真实大小只在详情卡里、有来源才写。标题块 `note`：EN "Model specimens on a sorting tray · not to scale · cells under the microscope drawn far larger than life" / ZH "分类盘上的标本模型 · 彼此不按比例 · 显微镜下的细胞画得比实物大得多"。无品牌、无文字（毡垫上不印字母，组名由引线标注和流程图卡给）、不画人和手 | 同意 | 定稿 |
| D9 | **标本 32 件 + 显微镜下 2 组**（§3.2）：非生物 3（玩具车、石头、塑料花）、植物 6（龙船花、辣椒幼苗、木麻黄幼树、鸟巢蕨、鹿角蕨、苔藓）、真菌 4（蘑菇、木头上的多孔菌、发霉的面包、酵母）、细菌 1（培养皿里的菌落）、昆虫 2（蝗虫、甲虫）、蜘蛛 1、鸟 2（林八哥、企鹅）、哺乳动物 4（大蕉松鼠、犬蝠、海豚、穿山甲）、鱼 4（斑鱼 / 生鱼、孔雀鱼、弹涂鱼、鲨鱼）、两栖 2（树蛙、蟾蜍）、爬行 3（壁虎、蟒蛇、海龟）。**优先选新加坡本地的、NParks / SBO 页面写明状态的物种**；外来种照写"外来"（孔雀鱼、林八哥，R: `ex-guppy-intro`、`ex-myna-j`）；**黑眶蟾蜍的本地 / 外来，NParks 两个网站和 SBO 说法不一**（R: `ex-toad-ffw`、`ex-toad-bsg`、`ex-toad-sbo`）：正文只写"新加坡常见"，详情卡并列三方说法；企鹅、鲨鱼、甲虫是**不点物种**的通用标本（企鹅不是新加坡野生动物，详情卡不写它住哪里，除非 F-99 核到）。**不用**：斑姬地鸠（BiodiversitySG 页面印错了学名，R: S38）、家八哥（同一网站自相矛盾，R: `ex-myna-c2`）、石龙子与海马 / 海龙（胎生，课纲说不要求，只在细看）、卷柏（既不是苔藓也不是蕨，P3 不讲，R: `ex-spikemoss2`）、苏铁（不开花却结种子，只在细看，R: `ex-cycas-div`）、鸭嘴兽（不在新加坡，只在细看） | 同意 | 定稿 |
| D10 | **名称的写法**：正文、字幕用**通用的类名**（a squirrel / 松鼠、a fruit bat / 果蝠、a dolphin / 海豚），物种全名（大蕉松鼠 *Callosciurus notatus*）只在零件 `detail` 第一句和 `name`；中文物种名只用研究核到的 SBO 名（`singapore_verified: true`，研究 §5）或交给 Gavin 定（§0.1）；SBO 的中文字段不单独当依据（海豚那一栏是粤语拼音，研究 §5 注 4） | 同意 | 定稿 |
| D11 | **与已有主题的分工：链过去，不重讲**：昆虫的身体（`grasshopper` 第 `whole-animal` 章；`mosquito` 第 `before-you-start`、`the-adult` 章）；开花植物的花、果实、种子、幼苗（`plant` 第 `the-whole-plant`、`flowers-and-pollination`、`fruits-and-seeds`、`seed-to-plant` 章）；肠道里的细菌（`digestive-system` 第 `large-intestine-chapter` 章）。本主题的蝗虫、辣椒幼苗是**简化的标本模型**，从那两个主题的零件里抄几何、缩到一格大（§3.2），详情卡写"看完整的蝗虫 / 辣椒，去……"。孔雀鱼与蚊子：孔雀鱼被引进新加坡"用来控制蚊子"，效果"有争议"（R: `ex-guppy-trap`），一句细看链 `mosquito` 第 `breaking-the-cycle` 章 | 同意 | 定稿 |
| D12 | **流程图与打勾表是新加坡 P3 的格式**（R: `key-sg-flow`、`key-sg-table`、`g-live-5`–`g-live-7`）：主线用 EN "flowchart" / ZH "分类流程图"，"classification key / 检索表"只在第 06 章细看出现一次（英格兰 Y4 的说法，R: `key-dfe-y4`；中文维基"检索表"，R: `key-zh`）；第 06 章正文放一张静态打勾表（MDX 表格，从模型数据生成，Haiku 核对）；"给一组起标题"（新加坡讲义的第三步，R: `g-live-7`）由流程图卡的组名表达 | 同意 | 定稿 |
| D13 | **不做**：照片贴图、真实的动物标本或解剖、物种名背诵表、测验与计分、"下蛋 / 胎生 / 用肺或鳃呼吸"作分类盘问题、脊椎 / 无脊椎、界门纲目与学名系统、演化树、孢子与种子的区分（P5）、在家培养细菌的演示、读者拖动标本（v2，§4.7）、判分小测（v2）、人体模型与手 | 同意 | 定稿 |
| D14 | **背景章 00**：这张桌子上有什么（标本盒、分类盘、显微镜台座）、"分类"在课纲里的意思（R: `syl-gloss-classify`）、标本是模型不按比例、物种名不要求记、流程图卡怎么读、试一试卡片怎么用、和 `grasshopper` / `mosquito` / `plant` 的关系、爱护生物（课纲 VEA） | 同意 | 定稿 |
| D15 | **数字**：本主题几乎没有物理量。模型给出的只有**件数**（每组几件、盒里还剩几件、放错几只、一组里混了几类），在卡片和 PLATE 带 SIM、"在这个模型里"；字幕里写"进了 D 组的有 5 只"这类数，单测钉住（§8.2）。真实大小（如壁虎 13 cm，待核 F-97）只在详情卡，有来源才写；显微镜下的细胞大小待核（F-91、F-92），核不到就不写数、不画比例尺 | 同意 | 定稿 |
| D16 | **图**（§7）：只用 `art/planned/living-things/` 的三张已审草稿，不出新图。**封面** `living-things.png`（一只浅盆里：一株开花植物和一只蝴蝶、一丛蕨、一朵小蘑菇——开花植物、不开花植物、真菌、昆虫四样都有）；**配图 1** `living-things-plant-fungus.png`（盆栽开花植物、盆栽蕨、木头上的蘑菇）放第 03 章；**配图 2** `living-things-animal-groups.png`（蛙、鱼、蝴蝶）放第 04 章。三张图都不点物种（画的蝴蝶、鱼不是新加坡的种），图注只写类名 | 同意 | 定稿 |
| D17 | **中文术语**（研究 §5；**没有找到 MOE 或新加坡出版社的中文科学词表**，下列多数来自香港教育局英汉科学词汇（繁转简）与中文维基 zh-sg，只有 SBO 物种名是新加坡核到的）：生物 / 非生物、特征、分类、开花植物 / 不开花植物、真菌、霉菌、蘑菇、酵母、细菌、菌落、两栖动物、鸟类、鱼类、昆虫、哺乳动物、爬行动物、分类流程图、打勾表、检索表（只在细看）、孢子（只在细看）、毛发、羽毛、鳞片、鳍。物种名见 §6.1。**需要 Gavin 看的写在 §0.1** | 同意（待 Gavin 过目） | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。下面是"按惯例代定、Gavin 想改随时改"的：

1. **中文术语一套**（D17）。最想请 Gavin（或女儿的课本）确认的四组：
   - **开花植物 / 不开花植物**（本文用）还是 有花植物 / 无花植物（香港用词）。研究没有找到任何来源用过"不开花植物"这个词（研究 §5 注 1）。
   - **分类流程图**（本文用）还是 流程图 / 分类图；"检索表"只在细看出现一次。
   - **哺乳动物、爬行动物、两栖动物、鸟类、鱼类、昆虫**（本文用）还是 哺乳类、爬行类、两栖类。
   - 物种的中文俗名：本文正文用 **松鼠、果蝠、海豚、穿山甲、八哥、企鹅、斑鱼（生鱼）、孔雀鱼、弹涂鱼、鲨鱼、树蛙、蟾蜍、壁虎、蟒蛇、海龟、蝗虫、甲虫、蜘蛛、龙船花、辣椒、木麻黄、鸟巢蕨、鹿角蕨、苔藓、蘑菇、多孔菌、酵母**；新加坡华文课室里"生鱼 / 斑鱼""壁虎 / 蜥蜴""龙船花 / 山丹"怎么叫，研究核不到。物种全名（详情卡）的取舍见 §6.1。
2. **形式**（D1）：选了 SpaceScene（3D 标本 + 先猜后看，不判分）。如果 Gavin 想要"判对错 + 按误解给反馈"的小测，那是 v2：要么在 SpaceScene 加一种判分卡片（约 1.5 天，§4.7），要么另做一个 MathScene 练习主题。
3. **物种的取舍**（D9）：孔雀鱼和林八哥是外来种，但一个是课纲 Note 自己举的例子，一个是"新加坡最常见的鸟"（R: `ex-myna-j`），本文保留并写明"外来"；黑眶蟾蜍的本地 / 外来三方说法不一，正文只写"新加坡常见"。企鹅、鲨鱼、甲虫不点物种。
4. **两个设计出来的问题**：第 02 章分动物用"是不是用嘴吃进食物"，第 04 章动物流程图的问题顺序（D4）——都是本文的设计（研究 §3.4 也标了"我的提议"），不是 MOE 的原文。
5. **新加坡补习讲义当依据**：各类群"看什么特征"（毛发、羽毛、鳞片、鳍……）、"玩具车会反应"、流程图与"哪些分错了"的题型，唯一能读到的新加坡来源是 Geniebook 的 P3 讲义（S2–S5，商业补习，不是 MOE；研究也列出了它的几处错误，§2.3 已避开）。本文照研究的做法引它，标 medium-high。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；2026-10-21 起草时从 PDF 抄录，页码是页脚印的数字）

**S1**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"（文件名 `Primary-Science-Syllabus-2023_May24.pdf`；URL 见 §6.2）。

**Diversity of Living and Non-Living Things (General characteristics and classification) (P3)**（第 38 页，全文）

> **Learning Outcomes**
>
> **Core Ideas**
> • Describe the characteristics of living things.
>   - Need water, food and air to survive
>   - Grow, respond and reproduce
> • Recognise some broad groups of living things based on similarities and differences.
>   - Plants (flowering, non-flowering)
>   - Animals (amphibians, birds, fish, insects, mammals, reptiles)
>   - Fungi (mould, mushroom, yeast)
>   - Bacteria
>
> **Practices**
> • Observe a variety of living and non-living things and infer differences between them.
> • Classify living things into broad groups (in plants and animals) based on similarities and differences of common observable characteristics.
>
> **Values, Ethics and Attitudes**
> • Show curiosity by questioning and exploring the surrounding living and non-living things.
> • Show care and concern by being responsible towards living things.
>
> **Note:**
> - Recall of names of specific living things (e.g., guppy) and their characteristics (e.g., give birth to young alive) is not required.

**相邻的条目（只作边界，不引全文）**：

| 页 | 条目 | 与本主题的关系 |
|---|---|---|
| 12 | Diversity 主题："We classify living and non-living things based on their similarities and differences."（R: `syl-theme`） | 00 正文 ① |
| 20 | Table 2：Diversity of living and non-living things 是 P3 第一个课题；P4–P6 没有再以 Diversity 为名讲分类（R: `syl-table2`）。Foundation 是否要求（下划线）从文字里看不出，**未核**：同 docs/36，主题不标 Foundation | — |
| 42 | P3 Life cycles 点名七种动物："chicken, cockroach, frog, grasshopper, beetle, butterfly, mosquito"（R: `syl-p3-lifecycles`） | 甲虫、蝗虫、蛙进标本盒；蝴蝶在两张图里；链 `grasshopper`、`mosquito` |
| 43 | P5："Investigate the ways in which plants reproduce."，下列 Spores、Seeds（R: `syl-p5-spores`） | 孢子只在第 03 章细看（D3 ⑤） |
| 68 | P6："An organism is a living thing."（R: `syl-p6-organism`） | 名词表 `living-thing` 的 see |
| 82–83 | Glossary：classify "to group objects or events based on common characteristics"；recognise "to identify facts, characteristics or concepts that are critical to the understanding of a situation, event, process or phenomenon"；infer "to explain or draw a conclusion based on observations, data or information"（R: `syl-gloss-*`） | 00 正文、02 细看 `Recognise, not classify` |

- 课纲**没有**写：非生物的定义、"会动"、细胞、叶绿素、孢子、光合作用、分解者、脊椎 / 无脊椎、藻类、原生生物、病毒、古菌（研究 §1.1 逐条核过整页）；"Bacteria"是一个没有任何特征的条目。
- **PSLE**：P3 内容进 PSLE 范围（docs/17 S6）；题型只描述、不抄题（§1.5）。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 生物的特征：需要水、食物、空气；生长、反应、繁殖 | 主线（01） |
| "会动"不是特征；玩具车会"反应" | 主线（01 第 2–3 拍、T1） |
| 植物、动物、真菌、细菌四大类 | 主线（02） |
| 真菌：霉菌、蘑菇、酵母；不是植物；分解者 | 主线（02）；"分解者"一词只在细看 |
| 细菌：一个看不见、菌落看得见；有益有害 | 主线一拍（02 第 6 拍）+ 细看 |
| 显微镜下的酵母细胞、细菌 | 主线一拍（02 第 5 拍，单独入镜） |
| 开花 / 不开花植物；没开花的开花植物；像松树的木麻黄；不开花植物也是绿的 | 主线（03） |
| 孢子；苏铁与针叶树"不开花却结种子" | 细看（03），标 P5 |
| 动物六类、各看什么特征 | 主线（04） |
| 人是哺乳动物 | 主线一段（04 ④） |
| 长得像别组的动物（蝙蝠、企鹅、海豚、蜘蛛、蟾蜍、弹涂鱼、穿山甲） | 主线（05） |
| 下蛋 / 胎生 / 喂奶 / 用肺或鳃呼吸 | 05 正文用来解释（写"科学家还看……"），不作分类问题；胎生的鱼和蜥蜴、下蛋的哺乳动物只在细看 |
| 流程图、打勾表、问题的顺序 | 主线（04、06） |
| "classification key / 检索表"这个词 | 细看（06） |
| 爱护生物（看，不捉；石头木头翻开要放回） | 00 细看、06 细看 |
| 界门纲目、演化、学名系统 | 不讲（链 `grasshopper` 的细看） |

### 1.3 读者学到什么（P3 用词）

1. **生物**需要水、食物和空气才能活下去；它们会**生长**、会对周围的变化**作出反应**、会**繁殖**。植物也要食物，它自己制造。
2. 会动不是生物的特征：植物不走动，也是生物；玩具车会动、甚至会"反应"，但不会生长、不会繁殖，不是生物。
3. 生物可以分成几个大类：**植物、动物、真菌、细菌**。蘑菇不是植物：它没有根、茎、叶，不能自己制造食物。霉菌、酵母也是真菌，也是生物。一个细菌小到看不见，长成一团菌落就看得见；有的细菌有益，有的有害。
4. 植物分**开花植物**和**不开花植物**。开花植物不是一直有花；长得像松树的木麻黄会开小花。蕨和苔藓从来不开花，它们也是绿色的。
5. 动物分六类，各有看得见的特征：**昆虫**六条腿、身体分三部分；**鸟类**有羽毛；**哺乳动物**有毛发；**鱼类**有鳍和鳞片；**爬行动物**皮肤干、有鳞片；**两栖动物**皮肤湿润、没有鳞片。人也是哺乳动物。
6. 有的动物长得像别的组：蝙蝠会飞，是哺乳动物；企鹅不会飞，是鸟；海豚有鳍、住在海里，是哺乳动物；蜘蛛八条腿，不是昆虫；蟾蜍皮肤干，是两栖动物；弹涂鱼能离开水，是鱼；穿山甲有鳞片，是哺乳动物。
7. 分类时一次问一个只有"是 / 不是"的问题；先问只有一个组才有的特征（羽毛、毛发、六条腿），"会不会飞""有没有鳞片"会把不同的组混在一起。同样的问题可以画成流程图，也可以写成打勾表。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

依据：研究 §4。**所有研究都不是新加坡 P3 学生**（土耳其九年级 191 人、美国大学生与教授、土耳其四个五年级学生），不能说"很多新加坡孩子以为……"；标"假设"的是研究提出的教学假设，没有研究来源，正文只正面讲正确说法，细看里也不说"常见误解"。

| # | 说法 | 正确的说法 | 哪里纠正 | 依据（R:） |
|---|---|---|---|---|
| M-1 | 会动的就是活的；动物比植物"更活" | 会动不是特征；看需要、生长、反应、繁殖 | 01 第 2 拍、T1 | `mis-yorek-motion`（Yorek et al. 2009 第 369 页）、`mis-gts-child`（Goldberg & Thompson-Schill 2009 摘要） |
| M-2 | 植物不算生物（举生物的例子时想不到植物） | 植物满足全部特征 | 01 第 1、5、6 拍 | `mis-yorek-plants`（第 372 页） |
| M-3 | 会"反应"的就是生物（玩具车） | 一条不够，要看生长和繁殖 | 01 第 3 拍、T1 先猜后看 | `mis-sg-toycar`、`g-live-4`（新加坡讲义的题，非研究） |
| M-4 | 真菌是植物；蘑菇有根和叶 | 没有根、茎、叶，不能自己制造食物 | 02 第 2、4 拍、T2 先猜后看 | `mis-bul-plant`、`mis-bul-cite`、`mis-bul-roots`（Bulunuz et al. 2008 第 32、33、38 页；4 名学生） |
| M-5 | 霉菌和酵母不是生物 | 它们是真菌，是生物 | 02 第 4–6 拍 | `mis-bul-plant` |
| M-6 | 真菌就是蘑菇 | 霉菌、酵母、多孔菌也是 | 02 第 4 拍 | `mis-bul-all`（第 37 页） |
| M-7 | 细菌都是有害的 | 有益有害都有 | 02 细看 | 假设；`g-bact-2` |
| M-8 | 不开花植物不是绿色的 | 也是绿色的 | 03 第 6 拍、T3 的"绿色"选项 | 假设；`g-plant-6` |
| M-9 | 现在没有花 = 不开花植物 | 还没开花的开花植物 | 03 第 3 拍、T3 先猜后看 | 假设；`g-plant-4` |
| M-10 | 像松树的就是不开花植物 | 木麻黄会开小花 | 03 第 4 拍 | 假设；`ex-casuarina` |
| M-11 | 按住在哪里、怎么动来分动物（有鳍 / 住水里 = 鱼，会飞 = 鸟） | 按身体上看得见的特征分；"会飞"会把鸟、蝙蝠、昆虫混在一起 | 05 全章、06 第 2 拍、T6 | `mis-yorek-habitat`、`mis-yorek-habitat2`（第 373 页，引 Kattmann 2001 等）；"有鳍就是鱼"本身是假设（`mis-fish-fins`） |
| M-12 | 蝙蝠是鸟；企鹅不是鸟；蜘蛛是昆虫 | 蝙蝠有毛，是哺乳动物；企鹅有羽毛；蜘蛛八条腿 | 04 第 2–4 拍、05 第 2、4 拍 | 假设；`ex-bat-fly`、`g-bird-4`、`g-ins-4` |
| M-13 | 所有爬行动物都下蛋；所有两栖动物皮肤都湿 | "大多数"；蟾蜍皮肤干；有的蜥蜴胎生 | 05 第 4 拍、细看 | 假设；`g-rept-2` 对 `ex-skink`，`g-amph-1` 对 `ex-toad-skin2` |
| M-14 | 人不是动物 | 人是哺乳动物 | 04 正文 ④ | `mis-yorek-human`（第 373 页） |

### 1.5 PSLE 题型 → 本主题哪里支持

只描述题型，不抄题；来源是新加坡补习讲义里的练习形式（R: `key-sg-*`、`g-ins-4`），不是 SEAB 的统计。

| 题型 | 支持 |
|---|---|
| 判断生物 / 非生物，用特征说理（玩具车、塑料花） | 01、T1 |
| 读一张打勾表，给两组选标题（"Which … are suitable headings for Group C and Group D?"，R: `key-sg-table`） | 06 正文的打勾表、流程图卡的组名 |
| 读流程图，问某动物（企鹅）放哪一组（R: `key-sg-flow`） | 04、T4 先猜后看（海豚）；04 第 3 拍（企鹅） |
| "哪些动物分错了"（鲸、鸭嘴兽、企鹅、孔雀鱼是常见陷阱，R: `key-sg-wrong`、`key-sg-trap`） | 05、T5（本主题用新加坡能见到的海豚、蝙蝠、穿山甲；鸭嘴兽、孔雀鱼胎生在细看） |
| "E 有 8 条腿，是不是昆虫"（R: `g-ins-4`） | 04 第 2 拍、05 第 4 拍 |
| 真菌、细菌是不是植物 / 是不是生物 | 02、T2 先猜后看 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：通俗不幼稚，先看到再说为什么；不拟人（"蝙蝠以为自己是鸟"不写）、不喊"小朋友"、无感叹号、无问句标题（字幕里的"问题"写成"第一个问题：它是不是……"）；试一试的说明写"改变 / 不变 / 观察"。英文用新加坡 / 英式拼写（mould、colour、fibre）。中文用新加坡用法（§6.1），引号只用"“ ”"。生物不拟人、不写"为了……而长成"（目的论）。**沉重内容**：穿山甲、海豚、海龟是极危物种（R: `ex-pangolin`、`ex-dolphin-status`、`ex-hawksbill`）——详情卡照实写保护状态，不渲染。**爱护生物**（课纲 VEA）：00、06 细看各一句"看，不捉；翻开的石头和木头放回原处"——这是价值陈述，不当事实引来源。**安全**：培养皿是模型，细看一句"不要在家里培养细菌"（同上，价值陈述）。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 昆虫的身体（头胸腹、六条腿、四片翅、外骨骼） | `grasshopper`（`whole-animal`）、`mosquito`（`before-you-start`、`the-adult`） | 04 第 2 拍 + 细看 `Insects up close`，`<TopicLink slug="grasshopper" ch="whole-animal">`；标本是简化的 |
| 开花植物的花、果、种子、幼苗 | `plant`（`the-whole-plant`、`flowers-and-pollination`、`fruits-and-seeds`、`seed-to-plant`） | 03 第 3 拍 + 正文链 `seed-to-plant`、`flowers-and-pollination` |
| 肠道里的细菌 | `digestive-system`（`large-intestine-chapter`） | 02 细看 `Helpful and harmful bacteria` 链过去 |
| 孔雀鱼与灭蚊 | `mosquito`（`breaking-the-cycle`） | 05 细看一句 |
| 生活史（蛙、蝴蝶、甲虫、鸡） | `mosquito`、`grasshopper`；P3 Life cycles 其余未建 | 不讲；04 细看一句"它们的生活史见……" |
| 材料的分类（P3 Diversity of materials） | `materials`（docs/17，未建） | 不链；施工时若已发布，00 细看补一句 |

**谁后发布谁补链接**：本主题发布时，主会话在 `grasshopper` 第 `whole-animal` 章、`plant` 第 `the-whole-plant` 章、`mosquito` 第 `the-adult` 章的末段各加一句回链（内容代理不碰那三个目录）。

---

## 2. 事实表

`R:` = 研究条目（`facts.json`，摘录都 ≤ 25 词、逐字核过）；**S#** = 研究的来源号（§6.2）；可信度照研究：high（课纲、NParks / SBO、同行评审）、medium-high（Geniebook 补习讲义：新加坡 P3 学生实际被教什么，但不是 MOE）、medium（博客、维基摘要）。"待核"的在 §2.7。

### 2.1 课纲与动词（S1，high）

| # | 事实 | R: | 页 |
|---|---|---|---|
| F-1 | 生物的特征：需要水、食物、空气；生长、反应、繁殖（只有这两条） | `syl-p3-chars`、`syl-p3-chars2` | 38 |
| F-2 | 认出的大类：植物（开花、不开花）；动物（两栖、鸟、鱼、昆虫、哺乳、爬行）；真菌（霉菌、蘑菇、酵母）；细菌 | `syl-p3-plants`、`syl-p3-animals`、`syl-p3-fungi`、`syl-p3-bacteria` | 38 |
| F-3 | 分类只要求"in plants and animals"，依据"common observable characteristics" | `syl-p3-practice-classify` | 38 |
| F-4 | 不要求记具体生物的名称与特征（孔雀鱼、胎生） | `syl-p3-note` | 38 |
| F-5 | VEA：好奇、发问；爱护生物 | `syl-p3-values` + 本文抄录 | 38 |
| F-6 | classify、recognise、infer 的定义 | `syl-gloss-*` | 82–83 |
| F-7 | 孢子与种子是 P5 | `syl-p5-spores` | 43 |
| F-8 | P3 生活史点名七种动物（含 beetle、frog、butterfly、grasshopper、mosquito） | `syl-p3-lifecycles` | 42 |
| F-9 | "An organism is a living thing." | `syl-p6-organism` | 68 |

### 2.2 生物与非生物

| # | 事实 | 来源 | R: | 可信度 |
|---|---|---|---|---|
| F-10 | 生物也叫 organism；植物自己制造食物，其他生物要吃进食物 | S5 | `g-live-1`、`g-live-2` | medium-high |
| F-11 | 有些非生物会对变化作出反应，例如玩具车；但非生物不能繁殖 | S5 | `g-live-4`、`mis-sg-toycar` | medium-high |
| F-12 | 威尔士的 MRS GREN 七项（含 Movement）；新加坡的单更短 | S65 第 2 页 | `mis-nrw-mrs` | high（威尔士） |
| F-13 | 英格兰 Y2 的讨论题 "Is a flame alive? Is a deciduous tree dead in winter?" | S64 | `mis-dfe-flame` | high（英格兰） |
| F-14 | 大蕉松鼠一胎两三只，养在树上的叶巢里（"繁殖"的例子） | S14 | `ex-squirrel` | high |
| F-15 | 分类三步：观察、把相似的放一组、给组起标题；用流程图和表 | S5 | `g-live-5`–`g-live-7` | medium-high |
| F-16 | 补习讲义说非生物"不会生长"——过于简化（火焰、晶体会"长"是研究者的推论，无来源）：**不照抄**，正文只说"玩具车、石头、塑料花不会长大" | S5 | `mis-sg-sneg` | low |

### 2.3 各类群看什么（Geniebook S2–S4，medium-high；括号里是研究标出的"规矩漏的地方"）

| # | 类群 | 特征（R:） | 漏的地方 |
|---|---|---|---|
| F-20 | 哺乳动物 | 身上有毛发、用肺呼吸（`g-mammal-1`）；喂奶（`g-mammal-2`）；"大多数"胎生（`g-mammal-3`） | 蝙蝠会飞、海豚住在水里、穿山甲有鳞片、鸭嘴兽下蛋 |
| F-21 | 鸟类 | 羽毛、用肺呼吸（`g-bird-1`）；喙、一对翅、一对腿（`g-bird-2`）；下硬壳蛋（`g-bird-3`）；企鹅、鸵鸟不会飞（`g-bird-4`） | 蝙蝠会飞却不是鸟 |
| F-22 | 鱼类 | 鳞片（`g-fish-1`）；鳃、"都住在水里"（`g-fish-2`，**"都"不照抄**：弹涂鱼）；鳍和尾（`g-fish-3`）；"大多数"在水里下软蛋（`g-fish-4`） | 孔雀鱼、海龙胎生；弹涂鱼在陆地上呼吸 |
| F-23 | 两栖动物 | 皮肤湿润，在陆上用肺、在水里用皮肤呼吸（`g-amph-1`）；在水里下无壳的蛋（`g-amph-2`） | 蟾蜍皮肤干；温室蛙在陆地上下蛋 |
| F-24 | 爬行动物 | 皮肤干、有鳞片、用肺呼吸（`g-rept-1`）；在陆地上下蛋（`g-rept-2`）；有的有壳（`g-rept-3`） | 多纹南蜥胎生 |
| F-25 | 昆虫 | 三部分身体、六条腿、两根触角（`g-ins-1`）；外骨骼（`g-ins-2`）；有的有翅、有的没有（`g-ins-3`）；"8 条腿的不是昆虫"（`g-ins-4`） | 蜘蛛 |
| F-26 | 植物 | 自己制造食物，有根、茎、叶（`g-plant-1`，**苔藓没有真正的根茎叶**，S70：不把这条规矩用在苔藓上）；分开花、不开花（`g-plant-2`、`g-plant-3`）；开花植物不是一直有花（`g-plant-4`）；大多数不开花植物在叶背产孢子（`g-plant-5`，苏铁、针叶树例外）；不开花植物也是绿色的（`g-plant-6`）。**讲义 S5 有一张表把开花植物写成"用孢子繁殖"（`g-plant-err`），不用** | 木麻黄像松树 |
| F-27 | 真菌 | 不是植物：没有根、茎、叶（`g-fungi-1`）；没有叶绿素、不能自己制造食物（`g-fungi-2`）；蘑菇、毒菌、木耳、霉菌、酵母（`g-fungi-3`）；分解者（`g-fungi-4`）。**讲义说"酵母和霉菌小到肉眼看不见"（`g-fungi-5`），与同页"面包上的绿斑"自相矛盾：不照抄** | — |
| F-28 | 细菌 | 小到肉眼看不见的微生物（`g-bact-1`）；有的有益（帮助消化），有的有害（`g-bact-2`） | 雨树根里的细菌把空气里的氮变成养分（`ex-raintree`，S45） |

### 2.4 标本的来源（新加坡物种以 NParks BiodiversitySG = BSG、Flora & Fauna Web = FFW、Singapore Biodiversity Online = SBO 为准，high）

| # | 标本 | 事实（用在详情卡与正文） | R: / S# |
|---|---|---|---|
| F-30 | 黑眶蟾蜍 *Duttaphrynus melanostictus* | **状态三方不一**：FFW（2024-01-29 记录）本地；BSG（2026-05-29）"non-native"；SBO "Introduced alien species"。最可靠的辨认特征是眼后的骨棱；身上是干的疙瘩皮；"all toads are frogs" | `ex-toad-ffw`、`ex-toad-bsg`、`ex-toad-sbo`、`ex-toad-skin`、`ex-toad-skin2`、`ex-toad-frog`；S6、S7、S8 |
| F-31 | 斑腿泛树蛙 / 四线树蛙 *Polypedates leucomystax* | 本地（FFW）；皮肤较光滑、四肢细长、趾端扩大成吸盘；在水塘或沟渠上方做泡沫巢 | `ex-ftf-ffw`、`ex-ftf-feat`、`ex-ftf-foam`；S34、S35 |
| F-32 | 林八哥 *Acridotheres javanicus* | **外来**（SBO）；"新加坡最常见的鸟"（BSG）；暗灰色羽毛、黄喙黄脚 | `ex-myna-j`、`ex-myna-j2`；S9、S73 |
| F-33 | 疣尾蜥虎（壁虎）*Hemidactylus frenatus* | 本地（SBO）；皮薄、有小而不重叠的鳞片、眼没有眼睑、趾成黏垫 | `ex-gecko-ffw`、`ex-gecko-pads`、`ex-gecko-sbo`；S12、S13 |
| F-34 | 大蕉松鼠 *Callosciurus notatus* | 本地、广布常见（SBO）；一胎两三只 | `ex-squirrel`、`ex-squirrel-sbo`；S14、S15 |
| F-35 | 短耳犬蝠 *Cynopterus brachyotis*（Lesser dog-faced fruit bat） | 毛茸茸的身体；吃果实、传播种子、倒挂栖息；SBO 分类树：哺乳纲；蝙蝠是唯一能真正持续飞行的哺乳动物 | `ex-bat`、`ex-bat-sbo`、`ex-bat-fly`；S16、S17、S42 |
| F-36 | 马来穿山甲 *Manis javanica* | "an infrequently seen, scaly mammal that is found in Singapore"；本地、广布但稀少（SBO）；极危（BSG） | `ex-pangolin`、`ex-pangolin-zh`；S18、S19 |
| F-37 | 印度太平洋驼背豚 *Sousa chinensis* | FFW：脊椎动物（哺乳类）；见于新加坡海峡与柔佛海峡；新加坡红皮书第 3 版极危。"Dolphins are mammals. Sharks are fish."；"Sharks have gills, dolphins don't."；用喷水孔呼吸；海豚哺乳幼仔，有的鲨鱼胎生、有的下蛋（所以胎生分不开它们） | `ex-dolphin-ffw`、`ex-dolphin-status`、`ex-dolphin-mammal`、`ex-dolphin-gills`、`ex-dolphin-milk`、`mis-fish-fins`；S21、S22、S23。中文名有争议（研究 §2.3，"未核"）→ §0.1 |
| F-38 | 网纹蟒 *Malayopython reticulatus* | 一窝 15–80 个蛋；鳞片排成网纹 | `ex-python`；S27 |
| F-39 | 玳瑁 *Eretmochelys imbricata* | 新加坡两种海龟之一；5 至 10 月夜里上岸下蛋；极危 | `ex-hawksbill`；S28 |
| F-40 | 许氏齿弹涂鱼 *Periophthalmodon schlosseri* | 把海水存在改造过的鳃腔里、透过皮肤吸收氧气，在陆地上呼吸；胸鳍是肉质的 | `ex-mudskipper`、`ex-mudskipper2`；S29、S72 |
| F-41 | 斑鳢（斑鱼 / 生鱼）*Channa striata* | 本地（SBO）；鱼雷形身体、扁平像蛇的头，覆盖大鳞片；长背鳍 | `ex-snakehead`；S30 |
| F-42 | 孔雀鱼 *Poecilia reticulata* | **外来**、广布常见（SBO）；雌鱼不下蛋，胎生；被引进各地"用来控制蚊子"，效果有争议 | `ex-guppy-ea`、`ex-guppy-intro`、`ex-guppy-zh`、`ex-guppy-trap`；S31、S32 |
| F-43 | 蜘蛛（不点物种） | "Spiders are not insects, as they have eight legs instead of six."；身体只有两部分 | `ex-spider`、`ex-spider2`；S40 |
| F-44 | 企鹅（不点物种） | "flightless semi-aquatic sea birds"；有羽毛、下蛋 | `ex-penguin`、`key-sg-penguin`；S42、S2 |
| F-45 | 龙船花（Ixora 栽培种） | 常见的绿篱灌木；每朵花正好四片花瓣，排成十字，连在细长的花管上 | `ex-ixora`；S46 |
| F-46 | 木麻黄 *Casuarina equisetifolia*（rhu） | 本地（FFW）；"it is actually an angiosperm (flowering plant) and not related to the non-flowering pine family at all"；NParks 的分类写 "Angiosperms (Flowering Seed Plants)" | `ex-casuarina`、`ex-casuarina-div`；S47 |
| F-47 | 鸟巢蕨 *Asplenium nidus* | 本地；附生；成熟叶背有褐色、毛茸茸的平行线（孢子囊群），在那里产孢子；NParks 分类写 "Ferns & Lycophytes (Non-Seed Vascular Plants)" | `ex-fern-div`、`ex-fern-spore`、`ex-fern-sori`；S49、S50 |
| F-48 | 鹿角蕨 *Platycerium coronarium* | 新加坡本地的大型附生蕨，对树无害 | `ex-staghorn`；S51 |
| F-49 | 雨树 *Samanea saman*（只在文字里） | 从美洲引进；根里有特别的细菌，把空气里的氮变成养分；枝上长着鸟巢蕨 | `ex-raintree`、`ex-raintree2`；S45 |
| F-50 | 苏铁、针叶树（只在细看） | NParks："Gymnosperms (Non-Flowering Seed Plants)" | `ex-cycas-div`；S48 |
| F-51 | 多孔菌 / 木腐菌 | SBO 列 38 种多孔菌目；NParks / NTU / NUS 的研究在 134 棵、14 种行道树的样本里把木腐菌和病树联系起来 | `ex-fungi-poly`、`ex-fungi-trees`；S55、S56 |
| F-52 | 蘑菇 | 蘑菇是真菌产孢子的子实体；NParks 植物园有种蘑菇的工作坊（新加坡的联系） | `ex-mushroom-def`、`ex-fungi-farm`；S42、S58 |
| F-53 | 真菌、酵母、霉菌、细菌的定义 | 真菌包括酵母、霉菌、蘑菇；酵母主要是单细胞、靠出芽或分裂繁殖；"Not all fungi form molds."；细菌多半是一个细胞 | `ex-fungi-def`、`ex-yeast-def`、`ex-mold-def`、`ex-bact-def`；S42（维基摘要，medium，只用于定义） |
| F-54 | "真菌既不是植物也不是动物"（植物园展览板，经博客转述） | `ex-fungi-gloss`、`ex-fungi-decomp`；S57（weak）：只在细看，写"新加坡植物园的一次展览这样介绍" | medium |
| F-55 | 温室蛙在陆地上潮湿处下蛋，小蛙孵出来就是蛙的样子，跳过蝌蚪阶段（只在细看） | `ex-gh-frog`；S36 | high |
| F-56 | 多纹南蜥胎生（只在细看） | `ex-skink`、`ex-skink-sbo`；S24、S25 | high |
| F-57 | 海龙：雄鱼把受精卵放在育儿袋里，直到小鱼生出来（只在细看） | `ex-pipefish`；S33 | high |
| F-58 | 鸭嘴兽和针鼹是下蛋的哺乳动物（只在细看） | `ex-monotreme`；S41 | high |
| F-59 | 鼯猴会滑翔，不是狐猴、不会飞（只在细看） | `ex-colugo`；S20 | high |

### 2.5 流程图与打勾表

| # | 事实 | R: / S# |
|---|---|---|
| F-70 | 检索表的问题只有两个答案，常是"是 / 不是"；可以是表，也可以是分叉的图（威尔士） | `key-nrw-def`；S65 第 3 页 |
| F-71 | 先分大类，再把动物分成鸟、哺乳、爬行、两栖；然后让学生给别人做一个检索表 | `key-nrw-sort`；S65 |
| F-72 | 英格兰 Y4（8–9 岁）"explore and use classification keys" | `key-dfe-y4`；S64 |
| F-73 | 新加坡 P3 练习：流程图（"A, B, C and D are animals"）、给两组选标题、"哪些分错了"；讲义没有用 *key* 或 *dichotomous* 这两个词 | `key-sg-flow`、`key-sg-table`、`key-sg-wrong`、`key-sg-trap`；S2；研究 §3.2 |
| F-74 | 中文维基：检索表把一群生物按稳定、易观察的特征作一系列二分 | `key-zh`；S70 |

### 2.6 误解研究（只在 §1.4 与细看的措辞里用，正文不引百分比）

| # | 事实 | R: / S# |
|---|---|---|
| F-80 | 九年级学生最常把"生命"和"运动"联系在一起 | `mis-yorek-motion`、`mis-yorek-bardel`、`mis-yorek-piaget`；S66 第 369 页 |
| F-81 | 学生举的生物例子里没有植物 | `mis-yorek-plants`；S66 第 372 页 |
| F-82 | 学生按栖息地和运动方式给动物分组，教过分类后也不变；把人单独放一组 | `mis-yorek-habitat`、`mis-yorek-habitat2`、`mis-yorek-human`；S66 第 373 页 |
| F-83 | 幼儿说会动的人造物是活的、不说植物是活的；成年人、生物学教授判断植物时也更慢 | `mis-gts-child`、`mis-gts-adult`、`mis-gts-sun`；S67 |
| F-84 | 四个五年级学生教学前：霉菌、酵母不是生物；真菌是植物；真菌就是蘑菇；"蘑菇有根和叶" | `mis-bul-*`；S68 第 32–38 页 |

### 2.7 待核（研究没有覆盖；施工代理读原文，核不到按"退路"处理）

| # | 项 | 打算用在 | 候选来源 | 退路 |
|---|---|---|---|---|
| F-90 | 细菌长成菌落，肉眼看得见 | 02 第 6 拍、`bacteria-dish` | OpenStax *Microbiology*（菌落一节）或 Microbiology Society 科普页 | 删第 6 拍里细菌的一半，只讲霉；`bacteria-dish` 改成"显微镜下才看得见"的说明，标本仍放（培养皿是器具，不是说法） |
| F-91 | 酵母细胞的大小（约几 µm） | 显微镜台座的比例尺、详情 | OpenStax *Microbiology* / 教科书 | 不写数、不画比例尺，只写"画得比实物大得多" |
| F-92 | 一个细菌的大小（约 1–2 µm） | 同上 | 同上 | 同上 |
| F-93 | 海豚有背鳍、鳍状肢和尾鳍 | `dolphin` 的 `fins` 特征 | S22 / S23 原文（研究只摘了鳃和喷水孔）或 NOAA | 核不到：`dolphin` 仍画背鳍（这是外形，不需要文字来源）；04 第 5 拍改说"它的外形和鲨鱼一样流线型"，不写"有鳍"——**模型数据 `fins` 照旧为真**，因为外形可见（施工代理在 §9 记录） |
| F-94 | 海龟的四肢是鳍状肢（flippers），身上有鳞 | `hawksbill-turtle` 的 `scales`、详情 | S28 原文、NOAA Fisheries | 核不到：海龟从动物盘撤下（只留文字），E 组剩壁虎、蟒蛇；§2.8 的表相应改（单测跟着改） |
| F-95 | 穿山甲的脸和腹部有稀疏的毛 | `pangolin` 详情（不进分类：模型上不画毛） | S18 原文、IUCN Pangolin SG | 不写 |
| F-96 | 鲨鱼的皮上有很小的、像牙齿一样的鳞 | `shark` 的 `scales`、详情 | Ocean Conservancy / BBC 原文（S22、S23）或 Florida Museum | 核不到：详情不写；`scales` 对鲨鱼不影响任何分组结果（"有鳍"先把它分走），模型数据照旧写真并在 §9 记 |
| F-97 | 疣尾蜥虎体长约 13 cm | `house-gecko` 详情 | S12 原文（研究表里有这个数，摘录里没有） | 不写数 |
| F-98 | 人是哺乳动物 | 04 正文 ④ | 维基 Human 摘要 / 大英百科 | 写成"人有毛发、喂婴儿吃奶：照哺乳动物的特征，人也属于这一类"，引 F-20 |
| F-99 | 企鹅几乎都生活在南半球 | `penguin` 详情 | 维基 Penguin 摘要（S42 的同一来源，研究只摘了第一句） | 不写住在哪里 |
| F-100 | 木麻黄的花很小；果实像小球果 | `rhu-sapling` 的外形（小果）、03 第 4 拍 | S47 原文的形态描述 | 核不到：模型不画果，`flowers-or-fruits` 对木麻黄为假（§2.8 T3 改一行）；第 4 拍只引"它是开花植物" |
| F-101 | 鹿角蕨、鸟巢蕨长在树枝上（附生） | 03 第 6 拍 | S50、S51 原文（研究摘录有"epiphytic"） | 已有，复读即可 |
| F-103 | 雨树的小叶在下雨前合起来（"植物也会反应"） | 01 细看 `Plants respond too` | S45 原文（研究的条目说明里提到，摘录里没有） | 删这一块细看 |
| F-102 | 甲虫：前翅是硬的翅鞘，多数会飞 | `beetle` 详情、`can-fly` | 维基 Beetle 摘要 / Australian Museum | 核不到："会飞"对甲虫写真，详情只写"六条腿、身体三部分"（F-25）；T6 的 `can-fly` 结果不变（蝗虫、八哥、果蝠已经混了三类） |

### 2.8 模型（SIM，设计研究来源的内容；§4.2 的模型算出的）

全部由 §3.4 的特征表推出；施工时单测逐格钉死（`tests/space-scene/sort.test.ts` + `living-things-topic.test.ts`）。组内按标本编号排（§3.2 的 #），所以下面的顺序就是盘里的顺序。"盒"= 还在标本盒里（U）。

- **T1 生物还是非生物**（托盘 `alive`：玩具车、石头、塑料花、辣椒幼苗、蝗虫、松鼠、孔雀鱼，7 件；布局两组）：

| 问题 `q-alive` | A（是） | B（不是） | 玩具车在 |
|---|---|---|---|
| `none` | — | — | 盒 |
| `moves` 能自己走动 | 玩具车、蝗虫、松鼠、孔雀鱼（4） | 石头、塑料花、辣椒幼苗（3） | A |
| `responds` 对变化有反应 | 玩具车、辣椒幼苗、蝗虫、松鼠、孔雀鱼（5） | 石头、塑料花（2） | A |
| `grows` 会生长 | 辣椒幼苗、蝗虫、松鼠、孔雀鱼（4） | 玩具车、石头、塑料花（3） | B |
| `reproduces` 会繁殖 | 同上（4） | 同上（3） | B |
| `needs` 需要水、食物和空气 | 同上（4） | 同上（3） | B |

- **T2 四大类**（托盘 `big`：龙船花、辣椒幼苗、鸟巢蕨、苔藓、蘑菇、多孔菌、发霉的面包、酵母、细菌、蝗虫、林八哥、松鼠、斑鱼，13 件；布局六组，用 A–D；流程图 = ① 绿色、自己制造食物 → A；② 用嘴吃进食物 → B；③ 是蘑菇、霉菌或酵母 → C；其余 → D）：

| 问了几个 `asked-big` | A 植物 | B 动物 | C 真菌 | D 细菌 | 盒 | 蘑菇在 |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 13 | 盒 |
| 1 | 4（龙船花、辣椒、鸟巢蕨、苔藓） | 0 | 0 | 0 | 9 | 盒 |
| 2 | 4 | 4（蝗虫、八哥、松鼠、斑鱼） | 0 | 0 | 5 | 盒 |
| 3 | 4 | 4 | 4（蘑菇、多孔菌、霉、酵母） | 1 | 0 | C |

- **T3 分植物**（托盘 `plants`：龙船花、辣椒幼苗、木麻黄、鸟巢蕨、鹿角蕨、苔藓，6 件；布局两组）：

| 问题 `q-plant` | A（是） | B（不是） | 辣椒幼苗在 |
|---|---|---|---|
| `none` | — | — | 盒 |
| `flowers-now` 现在有花 | 龙船花（1） | 其余 5 | B |
| `flowers-or-fruits` 现在有花、花苞或果实 | 龙船花、木麻黄（2；木麻黄的小果待核 F-100） | 其余 4 | B |
| `needles` 细针一样的叶 | 木麻黄（1） | 其余 5 | B |
| `green` 绿色 | 6 | 0 | A |
| `flowering` 某个时候会开花 | 龙船花、辣椒、木麻黄（3） | 鸟巢蕨、鹿角蕨、苔藓（3） | A |

- **T4 动物流程图**（托盘 `animals`：18 件；布局六组 + X；流程图 = ① 六条腿 → A；② 羽毛 → B；③ 毛发 → C；④ 鳍 → D；⑤ 鳞片 → E；⑥ 皮肤湿润 → F；其余 → X）：

| 问了几个 `asked-animal` | 进组的（这一步） | 盒里还剩 | 海豚在 |
|---|---|---|---|
| 0 | — | 18 | 盒 |
| 1 | A：蝗虫、甲虫（2） | 16 | 盒 |
| 2 | B：八哥、企鹅（2） | 14 | 盒 |
| 3 | C：松鼠、果蝠（2） | 12 | 盒 |
| 4 | D：海豚、斑鱼、孔雀鱼、弹涂鱼、鲨鱼（5） | 7 | D |
| 5 | E：穿山甲、壁虎、蟒蛇、海龟（4） | 3 | D |
| 6 | F：树蛙（1）；X：蜘蛛、蟾蜍（2） | 0 | D |

  按真实类群核对：分错的是海豚（D，应在哺乳）、穿山甲（E，应在哺乳）、蟾蜍（X，应在两栖）——3 只。

- **T5 哪些分错了**（托盘 `classmate`：同样 18 件，同学的摆法写在数据里；布局六组 + X；组名 A 昆虫、B 鸟类、C 哺乳动物、D 鱼类、E 爬行动物、F 两栖动物、X 不在这六类）：

| 组 | 同学放的（`fix` 关） | 放回正确的组（`fix` 开） |
|---|---|---|
| A 昆虫 | 蝗虫、甲虫、**蜘蛛** | 蝗虫、甲虫 |
| B 鸟类 | 八哥、**果蝠** | 八哥、企鹅 |
| C 哺乳动物 | 松鼠 | 松鼠、果蝠、海豚、穿山甲 |
| D 鱼类 | **企鹅**、**海豚**、斑鱼、孔雀鱼、鲨鱼 | 斑鱼、孔雀鱼、弹涂鱼、鲨鱼 |
| E 爬行动物 | **穿山甲**、壁虎、蟒蛇、海龟、**蟾蜍** | 壁虎、蟒蛇、海龟 |
| F 两栖动物 | 树蛙、**弹涂鱼** | 树蛙、蟾蜍 |
| X 不在这六类 | — | 蜘蛛 |

  放错 7 只（粗体）→ 放回后 0。可选的"嫌疑"`suspect`：果蝠、海豚、企鹅、蜘蛛、蟾蜍、弹涂鱼、穿山甲（都 `wrong`，本该在：哺乳、哺乳、鸟、不在六类、两栖、鱼、哺乳）、鲨鱼（`right`，鱼）。海豚在：关 D，开 C。

- **T6 自己的流程图**（托盘 `own-key`：18 件；布局三组；A = 第一个问题答"是"，B = 第一个"不是"、第二个"是"，C = 其余）：

| 第一个 `first` | 第二个 `second` | A | A 里几类 | B | B 里几类 | C |
|---|---|---|---|---|---|---|
| `feathers` | `hair` | 八哥、企鹅（2） | 1 | 松鼠、果蝠（2） | 1 | 14 |
| `hair` | `hair` | 松鼠、果蝠（2） | 1 | 0 | 0 | 16 |
| `six-legs` | `hair` | 蝗虫、甲虫（2） | 1 | 松鼠、果蝠（2） | 1 | 14 |
| `fins` | `hair` | 海豚、斑鱼、孔雀鱼、弹涂鱼、鲨鱼（5） | 2 | 松鼠、果蝠（2） | 1 | 11 |
| `scales` | `hair` | 穿山甲、斑鱼、孔雀鱼、弹涂鱼、鲨鱼、壁虎、蟒蛇、海龟（8） | 3 | 松鼠、果蝠（2） | 1 | 8 |
| `can-fly` | `hair` | 蝗虫、甲虫、八哥、果蝠（4） | 3 | 松鼠（1） | 1 | 13 |
| `six-legs` | `feathers` | 蝗虫、甲虫（2） | 1 | 八哥、企鹅（2） | 1 | 14 |

  T6 的条形图（`second` = `hair`）：A 里几类 = 羽毛 1、毛发 1、六条腿 1、鳍 2、鳞片 3、会飞 3。

- 这些件数只出现在试一试卡片、PLATE 读数（带 SIM）、流程图卡（每个叶子的件数）、字幕（"在这个分类盘上"）和细看。设计研究来源（S59，§6.2）写明：**哪件标本有哪些特征是本主题按来源与模型外形定的（§3.4），组和件数由模型按问题算出**。

---

## 3. 对象、标本与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `non-living` | Not alive / 非生物 | 玩具车、石头、塑料花 | `token:neutral` |
| 02 | `plants` | Plants / 植物 | 龙船花、辣椒幼苗、木麻黄、鸟巢蕨、鹿角蕨、苔藓 | `token:food` |
| 03 | `fungi` | Fungi / 真菌 | 蘑菇、多孔菌、发霉的面包、酵母 | `token:ink-3` |
| 04 | `bacteria` | Bacteria / 细菌 | 培养皿里的菌落 | `token:cut` |
| 05 | `insects` | Insects / 昆虫 | 蝗虫、甲虫 | `token:holder-1` |
| 06 | `birds` | Birds / 鸟类 | 林八哥、企鹅 | `token:holder-2` |
| 07 | `mammals` | Mammals / 哺乳动物 | 松鼠、果蝠、海豚、穿山甲 | `token:holder-3` |
| 08 | `fish` | Fish / 鱼类 | 斑鱼、孔雀鱼、弹涂鱼、鲨鱼 | `token:holder-4` |
| 09 | `amphibians` | Amphibians / 两栖动物 | 树蛙、蟾蜍 | `token:holder-5` |
| 10 | `reptiles` | Reptiles / 爬行动物 | 壁虎、蟒蛇、海龟 | `token:holder-6` |
| 11 | `other-animals` | Other animals / 其他动物 | 蜘蛛 | `token:holder-7` |
| 12 | `tray` | Sorting tray / 分类盘 | 12 块毡垫（`pad-*`）、显微镜 | `token:ink-2` |
| 13 | `magnified` | Under the microscope / 显微镜下 | 酵母细胞、细菌（放大画）；context：台座 | `token:accent-2` |

- 组是**真实的类群**（LAYERS 可以只看某一类、单显 `⊙`），不是"本章分到哪一组"；本章分到哪一组由模型和毡垫表示。13 个组，PLATE 立面的图例按 docs/06"组多于 5 个时图例行距收紧"。`holder-*` 是 TimeScene 用的分类色，施工时核对它们在 paper / cinema 下与 `food`、`cut` 分得开，分不开就换（只用 token）。
- 右上卡：**分类流程图**（E-LT3）代替零件链路卡。
- context：`bench`（长桌）、`specimen-case`（标本盒）、`sorting-tray`（分类盘的木盘）、`cell-plinth`（显微镜台座，属 `magnified` 组）。全部 `clip: false`。

### 3.2 标本（32 件）与其他零件

**坐标**（R2 起点，1 场景单位 = 1 m，Y 向上，桌面 y = 0，+Z 朝观者）：长桌 1.9 × 1.1 m（x −0.95 … 0.95，z −0.6 … 0.5）；标本盒 x −0.42 … 0.42、z −0.52 … −0.14，盒底 y = 0.015，9 列 × 4 行凹格，格心 x = −0.36 + 0.09 c、z = −0.465 + 0.09 r（c = 0 … 8，r = 0 … 3），**标本按编号 1–32 从左上起一行一行放**（第 1 行 1–9……第 4 行 28–32，空 4 格）；分类盘 x −0.66 … 0.66、z −0.06 … 0.52，盘面 y = 0.008；X 垫在标本盒右边（0.62, 0.002, −0.33），0.24 × 0.18；显微镜台座在左后角（−0.74, 0, −0.36）。组的布局（毡垫中心与格子，格距 0.08，X 垫 0.07）：

| 布局 | 垫 | 中心 (x, z) | 列 × 行 | 容量 |
|---|---|---|---|---|
| `two` | `pad-2a` / `pad-2b` | (−0.32, 0.23) / (0.32, 0.23) | 7 × 6 | 42 |
| `three` | `pad-3a` / `pad-3b` / `pad-3c` | (−0.43, 0.23) / (0, 0.23) / (0.43, 0.23) | 5 × 6 | 30 |
| `six` | `pad-6a`–`pad-6c`（后排）/ `pad-6d`–`pad-6f`（前排） | x −0.43 / 0 / 0.43；z 0.09（后）/ 0.37（前） | 5 × 3 | 15 |
| `six` | `pad-x` | (0.62, −0.33) | 3 × 2 | 6 |

每件标本 ≤ 0.07 m 见方（格距 0.08 留 1 cm 空），高 ≤ 0.12 m。左右对称的件（腿、翅、眼）在一个零件里用 `extra` 写两份（`mirror: "z"`），**不用 `bilateral`**（双胞胎零件会多出可选零件与绘制）。材质槽目标每件 2 个、最多 3 个：眼睛、喙尖、鼻孔这些深色小件并进同一个深色槽。

**A. 身份与来源**（# = 盒里的位置，也是组内的顺序）：

| # | id | EN / ZH（`name`） | 组 | 新加坡状态（写进 detail） | 事实 |
|---|---|---|---|---|---|
| 1 | `toy-car` | Toy car / 玩具车 | non-living | — | F-11 |
| 2 | `pebble` | Pebble / 石头 | non-living | — | — |
| 3 | `plastic-flower` | Plastic flower / 塑料花 | non-living | — | — |
| 4 | `ixora` | Ixora / 龙船花 | plants | 栽培的绿篱灌木 | F-45 |
| 5 | `chilli-seedling` | Young chilli plant / 辣椒幼苗 | plants | — | `plant` 主题（S71） |
| 6 | `rhu-sapling` | Young rhu tree / 木麻黄幼树 | plants | 本地（FFW） | F-46、F-100 |
| 7 | `birds-nest-fern` | Bird's nest fern / 鸟巢蕨 | plants | 本地，附生 | F-47 |
| 8 | `staghorn-fern` | Staghorn fern / 鹿角蕨 | plants | 本地，附生 | F-48 |
| 9 | `moss` | Moss / 苔藓 | plants | 不点物种（研究没有找到有状态的新加坡物种页） | F-26 |
| 10 | `mushroom` | Mushroom / 蘑菇 | fungi | 栽培的，不点物种 | F-52 |
| 11 | `bracket-fungus` | Bracket fungus / 多孔菌 | fungi | 不点物种（SBO 列 38 种多孔菌目） | F-51 |
| 12 | `mouldy-bread` | Mould on bread / 面包上的霉 | fungi | 不点物种 | F-27、F-53 |
| 13 | `yeast` | Yeast / 酵母 | fungi | 不点物种 | F-53 |
| 14 | `bacteria-dish` | Bacteria in a dish / 培养皿里的细菌 | bacteria | 不点物种 | F-28、F-90 |
| 15 | `grasshopper` | Grasshopper / 蝗虫 | insects | 黑角瓦兰蝗 *Valanga nigricornis*（`grasshopper` 主题） | F-25、S71 |
| 16 | `beetle` | Beetle / 甲虫 | insects | 不点物种；课纲第 42 页点名的动物之一 | F-8、F-25、F-102 |
| 17 | `spider` | Spider / 蜘蛛 | other-animals | 不点物种 | F-43 |
| 18 | `javan-myna` | Javan myna / 林八哥 | birds | **外来**；新加坡最常见的鸟 | F-32 |
| 19 | `penguin` | Penguin / 企鹅 | birds | 不是新加坡的野生动物；不点物种 | F-44、F-99 |
| 20 | `plantain-squirrel` | Plantain squirrel / 大蕉松鼠 | mammals | 本地，常见 | F-14、F-34 |
| 21 | `fruit-bat` | Lesser dog-faced fruit bat / 短耳犬蝠 | mammals | 本地，常见 | F-35 |
| 22 | `dolphin` | Indo-Pacific humpback dolphin / 印度太平洋驼背豚（中文名待 Gavin，§0.1） | mammals | 新加坡海峡、柔佛海峡；极危 | F-37、F-93 |
| 23 | `pangolin` | Sunda pangolin / 马来穿山甲 | mammals | 本地，稀少；极危 | F-36、F-95 |
| 24 | `snakehead` | Common snakehead / 斑鳢（斑鱼、生鱼） | fish | 本地 | F-41 |
| 25 | `guppy` | Guppy / 孔雀鱼 | fish | **外来**，常见 | F-42 |
| 26 | `mudskipper` | Giant mudskipper / 许氏齿弹涂鱼 | fish | — | F-40 |
| 27 | `shark` | Shark / 鲨鱼 | fish | 不点物种 | F-37、F-96 |
| 28 | `tree-frog` | Four-lined tree frog / 斑腿泛树蛙（四线树蛙） | amphibians | 本地 | F-31 |
| 29 | `asian-toad` | Asian toad / 黑眶蟾蜍 | amphibians | **三方说法不一**（F-30），正文只写"新加坡常见" | F-30 |
| 30 | `house-gecko` | Common house gecko / 疣尾蜥虎（壁虎） | reptiles | 本地，城市里常见 | F-33、F-97 |
| 31 | `python` | Reticulated python / 网纹蟒 | reptiles | — | F-38 |
| 32 | `hawksbill-turtle` | Hawksbill turtle / 玳瑁 | reptiles | 两种海龟之一；极危 | F-39、F-94 |

另有：`yeast-cells` Yeast cells, magnified / 放大的酵母细胞、`bacteria-cells` Bacteria, magnified / 放大的细菌（`magnified` 组，F-53、F-91、F-92）；`microscope` Microscope / 显微镜（`tray` 组，删减时第一个删）；12 块毡垫 `pad-2a` … `pad-x`（`tray` 组，`name` = "Group A / A 组" … "Not in these six groups / 不在这六类里"）。**零件数 47 + 4 个 context**。

**B. 建模与 Tier-1**（"槽"= 材质槽数；参考见 §3.3）：

| # | id | primitive（+ extra），≤ 0.07 m 见方 | 材质（槽） | 一眼要认出的 |
|---|---|---|---|---|
| 1 | `toy-car` | `bevelBox` 车身 + 车顶；4 个 `cylinder` 轮（`extra`，`mirror`） | `plastic` 红 tint + `rubber`（2） | 小汽车的剪影、四个黑轮；光亮塑料、无字无标志 |
| 2 | `pebble` | `sphere` + `scale` [1.4, 0.7, 1] | `abrasive` 灰（1） | 一块扁圆的河石 |
| 3 | `plastic-flower` | 一根直直的绿 `tube` 茎 + 两片**完全一样**的 `wing` 叶 + 一朵花（6 片一样的 `wing` 花瓣 + `sphere` 花心），插在一只小 `lathe` 塑料座上 | `plastic` 高光（两个 tint：绿、粉）（2） | 花瓣、叶子一模一样、光亮、没有叶脉——一看就是假花 |
| 4 | `ixora` | 小 `lathe` 花盆 + 3 根 `sweep` 枝 + 约 12 片 `wing` 叶（`repeat` 绕枝）+ 3 团花球（每团 8 朵四瓣小花，`wing` 合并） | `enamel` 盆 + `tissue` 绿叶 + `tissue` 红橙花（3） | 深绿革质叶、枝顶一团团红橙色小花，每朵四瓣成十字（F-45） |
| 5 | `chilli-seedling` | 从 `plant` 主题的 `chilli-seedling` 零件抄 primitive，缩到格内；种在小 `lathe` 盆里 | 同 `plant`（2） | 一株只有几片叶的小苗、**没有花、没有果** |
| 6 | `rhu-sapling` | 细 `sweep` 树干 + 约 20 根下垂的细 `tube` 绿枝条（`repeat` 绕干）+ 4 个小 `sphere` 果（`abrasive`，F-100 核到才画）；小盆 | `wood` 干 + `tissue` 灰绿（+ `abrasive`）（2–3） | 像一棵小松树：细针一样的下垂枝条 |
| 7 | `birds-nest-fern` | 一小块 `bevelBox` 树皮 + 约 10 片长条带状 `wing` 叶（中脉 `veins`）排成莲座；叶背 2 片画褐色细平行线（`veins`） | `wood` 树皮 + `tissue` 亮绿（2） | 一圈宽长的亮绿带状叶围成"鸟巢"，中间空 |
| 8 | `staghorn-fern` | 树皮块 + 一片圆盾形 `wing`（贴树皮）+ 4–6 片分叉成鹿角的 `wing` | `wood` + `tissue` 灰绿（2） | 分叉像鹿角的叶 + 贴着树皮的圆盾叶 |
| 9 | `moss` | 一块扁石（`sphere` 压扁）上一团低矮的 `sphere` 穹顶（`fabric` 短绒） | `abrasive` 石 + `fabric` 绿（2） | 石头上一团绿色的软垫 |
| 10 | `mushroom` | `lathe` 菌盖 + 菌柄 + 菌环；菌盖下 `fins` 菌褶（放射，或 `lathe` 细棱） | `tissue` 奶白（1–2） | 伞形菌盖、菌褶、菌柄 |
| 11 | `bracket-fungus` | 一段 `cylinder` 木头（`wood`）+ 3 片半圆的 `lathe`（`arc: 180`）层层叠在侧面 | `wood` + `tissue` 褐 tint（2） | 一层层架子似的菌长在朽木侧面 |
| 12 | `mouldy-bread` | 一片 `extrude` 方面包（四角圆）+ 4 团压扁的 `sphere` 霉斑（`fabric` 短绒，蓝绿与白两档） | `enamel` 面包色 + `fabric`（2） | 一片面包上一团团毛茸茸的霉 |
| 13 | `yeast` | 一只小 `lathe` 碟 + 约 60 粒 `capsule` 小颗粒（`repeat` 合并） | `enamel` 碟 + `abrasive` 米黄（2） | 一小碟干酵母颗粒 |
| 14 | `bacteria-dish` | `lathe` 培养皿（盖 + 底，`glass`）+ 一层培养基（`lathe` 薄片）+ 约 12 个大小不一的小圆点菌落（压扁 `sphere`） | `glass` + `tissue` 米黄 + `enamel` 奶白（3） | 一只盖着的玻璃培养皿，里面一个个小圆斑 |
| 15 | `grasshopper` | 从 `grasshopper` 主题抄：头、前胸背板、腹部（`sweep`）、后足（股节 + 胫节）、前中足、覆翅、触角、复眼；合并为一件 | `chitin` 黄绿褐 tint + `eye`（2） | 跳跃的大后腿、前胸背板、六条腿、两根触角 |
| 16 | `beetle` | 椭圆 `sphere` 翅鞘（中缝一条 `veins` 线）+ 前胸 + 头 + 6 条 `tube` 腿（`mirror`）+ 两根触角 | `chitin` 深色高光 + `eye`（2） | 圆背硬壳、六条腿清楚可数 |
| 17 | `spider` | 两段身体（头胸部 `sphere` + 较大的腹部 `sphere`）+ **8 条** `tube` 腿（每侧 4，`mirror`）+ 小眼 | `chitin` 褐 + `eye`（2） | 两段身体、八条长腿（F-43）——要能一眼数出 8 |
| 18 | `javan-myna` | `sweep` 身体（`feathers`）+ 两片 `wing` 翅（翅尖白）+ `wing` 尾 + 头 + 黄喙、黄脚（`capsule`） + 眼 | `feathers` 暗灰 + `plastic` 黄 + `eye`（3） | 暗灰色的鸟、黄喙黄脚（F-32） |
| 19 | `penguin` | 直立的 `lathe` 身体（背黑腹白两个 `extra`）+ 两片短 `wing` 鳍翅 + 喙 + 两只脚 | `feathers` 黑 + `feathers` 白 + `plastic` 橙（3） | 直立、黑背白肚、短短的鳍状翅 |
| 20 | `plantain-squirrel` | `sweep` 身体 + 大而蓬松的 `sweep` 尾（半径大）+ 头 + 两耳 + 四肢 + 眼 | `fabric` 褐（短绒当毛）+ `eye`（2） | 蓬松大尾巴、毛茸茸 |
| 21 | `fruit-bat` | `sweep` 毛茸茸身体 + 狗脸似的头 + 两片 `wing` 翼膜（`veins` 画指骨）半张 + 眼 | `fabric` 褐 + `tissue` 深褐翼膜 + `eye`（3） | 毛茸茸的身体、皮膜翅膀里有手指骨（F-35） |
| 22 | `dolphin` | `sweep` 流线身体（长喙）+ 背鳍、两片胸鳍、水平尾鳍（`wing`）+ 头顶的喷水孔（深色小 `sphere`）+ 眼 | `enamel` 灰粉 tint + `eye`（2） | 流线型、长喙、背鳍、**水平的尾鳍**、头顶一个孔 |
| 23 | `pangolin` | `sweep` 身体与长尾（`scales`）+ 小尖头 + 四条短腿 + 眼 | `scales` 褐 + `eye`（2） | 全身覆盖大片鳞、长尾巴、尖脸 |
| 24 | `snakehead` | `sweep` 鱼雷形身体（扁平的头）+ 长背鳍、臀鳍、尾鳍（`wing`）+ 眼 | `scales` 深褐 + `eye`（2） | 长身、蛇一样的扁头、长长的背鳍（F-41） |
| 25 | `guppy` | 小 `sweep` 身体 + 大扇形尾鳍（`wing`，`veins` 画鳍条）+ 背鳍 + 眼 | `scales` 灰 + `tissue` 橙 + `eye`（3） | 小鱼、很大的彩色扇尾 |
| 26 | `mudskipper` | `sweep` 身体趴在一小块泥上 + 头顶凸起的两只眼 + 两片肉质胸鳍（`sweep`，撑地）+ 背鳍 | `scales` 灰褐 + `abrasive` 泥 + `eye`（3） | 趴在泥上、眼睛长在头顶、用胸鳍撑着（F-40） |
| 27 | `shark` | `sweep` 流线身体 + 三角背鳍、胸鳍、**竖直的**尾鳍（上叶长）+ 体侧 5 道鳃裂（细深色 `bevelBox`）+ 眼 | `enamel` 灰 + `eye`（2） | 三角背鳍、体侧一排鳃裂、竖直的尾鳍 |
| 28 | `tree-frog` | 蹲坐的 `sweep` 身体 + 细长四肢（`sweep`）+ 趾端小圆垫（`sphere`）+ 背上四道深色纵纹（贴面 `sweep`）+ 大眼 | `tissue` 浅褐、低粗糙度（湿亮）+ `eye`（2） | 光滑湿亮、长腿、趾端吸盘、背上四道纹（F-31） |
| 29 | `asian-toad` | 矮胖的身体 + 短腿 + 眼后两道黑色骨棱（`sweep`）+ 大眼 | `abrasive` 橄榄褐（疙瘩皮）+ `eye`（2） | 矮胖、皮肤干而多疙瘩、眼后黑色骨棱（F-30） |
| 30 | `house-gecko` | `sweep` 身体与尾 + 四肢 + 趾垫 + 大眼（无眼睑） | `scales` 浅肉色 + `eye`（2） | 扁平的小蜥蜴、宽趾垫、大眼（F-33） |
| 31 | `python` | 一条盘成两圈的 `sweep`（`closed: false`，半径渐细）+ 头 | `scales` 褐 tint + `eye`（2） | 盘起来的蛇、没有腿 |
| 32 | `hawksbill-turtle` | `lathe` 拱形背甲 + 四片 `wing` 鳍状肢 + 鹰嘴似的头 | `chitin` 琥珀 tint（甲）+ `scales` 褐（肢与头）+ `eye`（3） | 拱背的甲、桨一样的四肢、尖嘴 |
| — | `yeast-cells` | 约 14 个椭球细胞（`sphere` + `scale`），其中 4 个旁边长着出芽的小球 | `tissue` 奶白（1） | 一团圆圆的细胞，有的在"出芽"（F-53） |
| — | `bacteria-cells` | 约 20 个 `capsule`（杆状）和 8 个 `sphere`（球状），散在台座上 | `tissue` 淡紫灰（1） | 小小的杆和球，比酵母小 |
| — | `microscope` | 底座 + 镜臂 + 载物台 + 镜筒 + 目镜（`lathe` / `bevelBox`） | `powder` + `stainless`（2） | 一台学校显微镜 |
| — | `pad-*`（12） | 薄 `bevelBox` 毡垫（厚 3 mm，圆角） | `fabric` 浅灰（1） | 盘里的一块块毡垫 |
| c | `bench` / `specimen-case` / `sorting-tray` / `cell-plinth` | `bevelBox`；盒的凹格用 `repeat` 的浅 `cylinder` 凹坑（同材质合并） | `wood` 浅 / `wood` / `wood` / `enamel` | — |

- **绘制预算**（§8.2 验收）：全部 32 件在盒里（00 第 1 拍，hero）≤ 85 calls；有分类盘的章（≤ 18 件 + ≤ 7 块垫）≤ 65；显微镜那一拍 ≤ 20；三角形 < 0.5 M。估算：标本平均 2.3 槽 × 32 ≈ 74 + context 4 + 投影；18 只动物 ≈ 42 + 垫 7 + context 4 ≈ 55。不在本章托盘上的标本由 `shift` 隐藏（不画、不投影）。
- **合并 / 删减顺序**（超预算时）：`microscope` 删去 → 标本的眼并进主槽（用 `tint` 深色的同族材质，失去高光）→ `ixora` 的盆并进 `enamel` 槽、`plastic-flower` 两色合一 → 小标本（`yeast`、`moss`）的底座并进主槽。
- **默认**：所有标本都在盒里（`tray: all`）；没有隐藏件；毡垫只在本章布局里显示。

### 3.3 参考图（`scripts/geo/living-things/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 松鼠、果蝠、穿山甲 | Wikimedia Commons："Callosciurus notatus"、"Cynopterus brachyotis"、"Manis javanica" | CC / 公有领域，逐张核 | 体形比例、尾、耳、翼膜里的指骨、鳞片的排法 |
| R2 | 海豚、鲨鱼 | Commons："Sousa chinensis"、"Carcharhinidae" | 同上 | 喙、背鳍形状、尾鳍方向（海豚水平、鲨鱼竖直）、鳃裂 |
| R3 | 林八哥、企鹅 | Commons："Acridotheres javanicus"、"Spheniscidae" | 同上 | 羽色、喙与脚的颜色、站姿 |
| R4 | 斑鳢、孔雀鱼、弹涂鱼 | Commons："Channa striata"、"Poecilia reticulata"、"Periophthalmodon schlosseri" | 同上 | 头形、鳍的位置、眼的位置 |
| R5 | 树蛙、蟾蜍 | Commons："Polypedates leucomystax"、"Duttaphrynus melanostictus" | 同上 | 皮肤质感、骨棱、趾端 |
| R6 | 壁虎、网纹蟒、玳瑁 | Commons："Hemidactylus frenatus"、"Malayopython reticulatus"、"Eretmochelys imbricata" | 同上 | 趾垫、盘起的姿态、背甲与鳍状肢 |
| R7 | 蝗虫、甲虫、蜘蛛 | `grasshopper` 主题已有的参考；Commons："Coleoptera"、"Araneidae" | 同上 | 腿的数目与位置、身体分节 |
| R8 | 龙船花、木麻黄、鸟巢蕨、鹿角蕨、苔藓 | Commons："Ixora"、"Casuarina equisetifolia"、"Asplenium nidus"、"Platycerium coronarium"、"Bryophyta" | 同上 | 花序、下垂的枝条、莲座、鹿角叶 |
| R9 | 蘑菇、多孔菌、面包霉、干酵母 | Commons："Agaricus bisporus"、"Polyporales"、"Bread mould"、"Dried yeast" | 同上 | 菌褶、层叠的架子、霉斑的质感 |
| R10 | 培养皿里的菌落；显微镜下的酵母与细菌 | Commons："Bacterial colonies"、"Saccharomyces cerevisiae (micrograph)"、"Escherichia coli (micrograph)" | 同上（避开带水印的） | 菌落的大小分布；出芽；杆状与球状 |
| R11 | NParks / SBO 物种页的照片 | S6–S55（研究已列） | **只看**（版权） | 与 Commons 互相核对 |

### 3.4 特征表（`sort.specimens`：每件只写它所在托盘会问到的特征；托盘问到而没写 = validate error）

"✓"= 真，空 = 假；只列各托盘要用的列。依据：生物 / 非生物的五列对生物按定义为真（F-1，课纲说生物都如此），玩具车按 F-11；其余各列看模型外形，与 §2.4 的来源一致。

**托盘 `alive`**：

| 标本 | moves | responds | grows | reproduces | needs |
|---|---|---|---|---|---|
| toy-car | ✓ | ✓ | | | |
| pebble | | | | | |
| plastic-flower | | | | | |
| chilli-seedling | | ✓ | ✓ | ✓ | ✓ |
| grasshopper / plantain-squirrel / guppy | ✓ | ✓ | ✓ | ✓ | ✓ |

**托盘 `big`**：`makes-food` = 龙船花、辣椒幼苗、鸟巢蕨、苔藓；`mouth` = 蝗虫、林八哥、松鼠、斑鱼；`fungus` = 蘑菇、多孔菌、发霉的面包、酵母；细菌三列都假。

**托盘 `plants`**：

| 标本 | flowers-now | flowers-or-fruits | needles | green | flowering |
|---|---|---|---|---|---|
| ixora | ✓ | ✓ | | ✓ | ✓ |
| chilli-seedling | | | | ✓ | ✓ |
| rhu-sapling | | ✓（F-100） | ✓ | ✓ | ✓ |
| birds-nest-fern / staghorn-fern / moss | | | | ✓ | |

**托盘 `animals` / `classmate` / `own-key`**：

| 标本 | six-legs | feathers | hair | fins | scales | moist-skin | can-fly | 真实类群 |
|---|---|---|---|---|---|---|---|---|
| grasshopper | ✓ | | | | | | ✓ | insect |
| beetle | ✓ | | | | | | ✓（F-102） | insect |
| spider | | | | | | | | none |
| javan-myna | | ✓ | | | | | ✓ | bird |
| penguin | | ✓ | | | | | | bird |
| plantain-squirrel | | | ✓ | | | | | mammal |
| fruit-bat | | | ✓ | | | | ✓ | mammal |
| dolphin | | | | ✓（F-93） | | | | mammal |
| pangolin | | | | | ✓ | | | mammal |
| snakehead / guppy | | | | ✓ | ✓ | | | fish |
| mudskipper | | | | ✓ | ✓ | | | fish |
| shark | | | | ✓ | ✓（F-96） | | | fish |
| tree-frog | | | | | | ✓ | | amphibian |
| asian-toad | | | | | | | | amphibian |
| house-gecko / python | | | | | ✓ | | | reptile |
| hawksbill-turtle | | | | | ✓（F-94） | | | reptile |

海豚的 `hair` 为假：模型上看不到毛（有的来源说海豚出生时有几根须，研究没有核到，不写）。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（≤ 60 字符） | detail 要点 |
|---|---|---|
| `toy-car` | Moves, but does not grow or reproduce. / 会动，却不生长、不繁殖。 | F-11；会"反应"的例子；不是生物 |
| `plastic-flower` | Looks like a plant but never grows. / 像植物，却从不生长。 | 不需要水、食物、空气 |
| `ixora` | A hedge shrub in flower. / 正在开花的绿篱灌木。 | F-45：四瓣、十字、花管；开花植物 |
| `chilli-seedling` | A flowering plant that has not flowered yet. / 还没开花的开花植物。 | F-26 `g-plant-4`；链 `plant` `seed-to-plant` |
| `rhu-sapling` | Looks like a pine, but it bears flowers. / 像松树，却会开花。 | F-46；本地；海边常见（只写来源里有的） |
| `birds-nest-fern` | A fern: it never bears flowers. / 一种蕨，从来不开花。 | F-47；附生；叶背褐线产孢子（P5） |
| `staghorn-fern` | A fern that grows on tree branches. / 长在树枝上的蕨。 | F-48 |
| `moss` | A tiny non-flowering plant. / 很小的不开花植物。 | 没有真正的根、茎、叶（S70） |
| `mushroom` | A fungus, not a plant. / 是真菌，不是植物。 | F-27、F-52：菌褶、子实体；不能自己制造食物 |
| `bracket-fungus` | A fungus feeding on dead wood. / 吃朽木的真菌。 | F-51：分解者；树病 |
| `mouldy-bread` | Mould: a fungus you can see. / 霉：看得见的真菌。 | F-27、F-53；不要吃发霉的面包（价值陈述，不引来源） |
| `yeast` | A fungus made of tiny single cells. / 由单个小细胞组成的真菌。 | F-53：出芽 |
| `bacteria-dish` | Bacteria: one is too small to see. / 细菌：一个小到看不见。 | F-28、F-90；有益有害；不要在家培养 |
| `grasshopper` | Six legs, three body parts: an insect. / 六条腿、三部分：昆虫。 | 链 `grasshopper` `whole-animal` |
| `beetle` | Six legs and hard wing cases. / 六条腿，硬硬的翅鞘。 | F-25、F-102 |
| `spider` | Eight legs: not an insect. / 八条腿：不是昆虫。 | F-43；也不在六类里 |
| `javan-myna` | Feathers: a bird. / 有羽毛：鸟。 | F-32：外来、最常见 |
| `penguin` | Cannot fly, but has feathers. / 不会飞，却有羽毛。 | F-44、F-99 |
| `plantain-squirrel` | Hair and a bushy tail: a mammal. / 有毛、蓬松大尾：哺乳动物。 | F-14、F-34 |
| `fruit-bat` | Flies, but has fur: a mammal. / 会飞，却有毛：哺乳动物。 | F-35；喂奶（F-20） |
| `dolphin` | Fins, yet a mammal that breathes air. / 有鳍，却是呼吸空气的哺乳动物。 | F-37；对照鲨鱼；极危 |
| `pangolin` | Scales, yet a mammal. / 有鳞片，却是哺乳动物。 | F-36；极危 |
| `snakehead` | Scales and fins: a fish. / 有鳞有鳍：鱼。 | F-41 |
| `guppy` | A small fish brought to Singapore. / 被带到新加坡的小鱼。 | F-42：外来；胎生（课纲 Note 自己的例子，不要求记）；灭蚊有争议，链 `mosquito` |
| `mudskipper` | A fish that breathes on land. / 在陆地上呼吸的鱼。 | F-40 |
| `shark` | Gills and fins: a fish. / 有鳃有鳍：鱼。 | F-37（鲨鱼一侧）、F-96 |
| `tree-frog` | Moist, smooth skin: an amphibian. / 皮肤湿润光滑：两栖动物。 | F-31：泡沫巢 |
| `asian-toad` | Dry, bumpy skin, yet an amphibian. / 皮肤干而多疙瘩，仍是两栖动物。 | F-30：骨棱；所有蟾蜍都是蛙；状态三方说法 |
| `house-gecko` | Small scales: a reptile. / 小鳞片：爬行动物。 | F-33、F-97 |
| `python` | Scales and no legs: a reptile. / 有鳞、没有腿：爬行动物。 | F-38：下蛋 |
| `hawksbill-turtle` | A reptile that lives in the sea. / 住在海里的爬行动物。 | F-39、F-94：上岸下蛋；极危 |
| `yeast-cells` / `bacteria-cells` | Drawn far larger than life. / 画得比实物大得多。 | F-53、F-91、F-92 |
| `pad-*` | One group on the sorting tray. / 分类盘上的一组。 | 本章的组名看流程图卡 |

### 3.6 流、动画、姿态

**流**：无。**动画**：无（标本的移动全部由 `shift` 绑定，§4.3）。**姿态**：无（RUN、FLOW 在本主题没有内容；章 `run: false`；控制面板照常有这两个开关，按了没有变化——同 docs/36 的做法，不改引擎）。

### 3.7 HUD 数据

- **标题**：EN "Classifying Living Things" / ZH "生物的分类"；副标题 EN "Living or not, and how living things are sorted into groups by what you can see" / ZH "有没有生命，以及怎样按看得见的特征给生物分组"；`shortTitle` EN "Living things" / ZH "生物"；`moe`：`["MOE 2023 Science P3 Diversity of Living and Non-Living Things"]`；`tags: [singapore, psle, p3, space]`；`illustration: living-things`；`subject: science`；`note` 见 D8。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Specimens / 标本 | `32 MODELS · NOT TO SCALE` / `32 件模型 · 不按比例` | design |
| Big groups / 大类 | `PLANTS · ANIMALS · FUNGI · BACTERIA` / `植物 · 动物 · 真菌 · 细菌` | typical |
| Animal groups / 动物类群 | `6` | typical |
| Sorted by / 分类依据 | `WHAT YOU CAN SEE` / `看得见的特征` | design |

- **telemetry**（≤ 6，全部 `follow`，SIM，单位写空串）：

| key EN / ZH | follow | scope |
|---|---|---|
| On the tray / 托盘上 | `on-tray` | — |
| Groups A · B · C / A · B · C 组 | `count-a`、`count-b`、`count-c` | — |
| Groups D · E · F / D · E · F 组 | `count-d`、`count-e`、`count-f` | — |
| In the case · none / 盒里 · 都不是 | `count-u`、`count-x` | — |
| Wrongly placed / 放错的 | `wrong` | observe |
| Kinds in A · B / A、B 组里的类群数 | `kinds-a`、`kinds-b` | observe |

  块尾 `SIM <本章第一个状态输出> · <本章改变量的值>`（如 `SIM GROUP D · 4 QUESTIONS`、`SIM WRONG · BAT`）。
- **镜头预设**（≤ 6，不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `case-view` | CASE | 标本盒正前略俯，32 格都在画面里（00、各章第 1 拍） |
| 2 | `tray-view` | TRAY | 分类盘 3/4 前上方，盘和盒同框（01–06 的主镜头） |
| 3 | `back-row` | A–C | 后排三组近景（六组布局） |
| 4 | `front-row` | D–F | 前排三组近景 |
| 5 | `lens-view` | MICROSCOPE | 显微镜台座正上方偏前 40°，台座填满画面 |

  hero 用 `views.assembled.camera`：整张桌 3/4 前右上、约 1.8 m 外；`views.cover` = hero 略拉近。
- `views.section.plane: "xz"`（PLATE 立面画俯视图：分类盘上的组最清楚）。不设剖切面。
- **模式**：X-RAY 无 `shell` 时全体半透（引擎默认），对本主题无意义，不在节拍里用；EXPLODED：标本 `explode` 向上 0.04（只是把标本抬离格子，便于看腿），毡垫与 context 不拆；REFERENCE 冻结 sim。

---

## 4. 引擎

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 生物的特征 | 换问题，7 样东西起身、落到"是 / 不是"两块垫上；玩具车一会儿和动物一组、一会儿和石头一组 | **E-LT1** `sort`（`ask`）→ **E-LT2** `shift` |
| 认出四大类 | 三个问题一个个问，植物、动物、真菌依次离开标本盒，剩下的细菌进 D；右上卡的流程图一步步点亮 | E-LT1（`chain`）→ E-LT2；**E-LT3** 流程图卡 |
| 按看得见的特征分植物、动物 | 同上；六步流程图把 18 只动物分进六组，三只"不听话"的落错地方 | 同上 |
| 哪些分错了 | 同学的分类盘；选一只看"放错了 / 本该在哪"，打开"放回正确的组"，7 只走回去 | E-LT1（`arrangement`）→ E-LT2；卡片的组名带 ✗ |
| 毛、羽毛、鳞片看得清 | 松鼠、果蝠的短绒，八哥、企鹅的羽片，鱼、蜥蜴、穿山甲的鳞 | `fabric`（已有）+ **E-LT4** `feathers` / `scales` |
| 一个细菌看不见 | 显微镜台座上放大画的酵母与细菌，带比例尺 | 组级比例尺（已有）+ **E-LT5** µm（可选） |

### 4.2 模型 `sort`（E-LT1；`lib/sim/sort.ts`，纯函数，有单测）

同步、确定、< 0.2 ms（32 件 × 6 问）；只在控件值变化时算。

```jsonc
"sim": {
  "kind": "sort",
  "controls": [
    { "id": "tray", "kind": "choice", "default": "all", "label": { "en": "On the tray", "zh": "托盘上" },
      "options": [ { "id": "all", … }, { "id": "alive", … }, { "id": "big", … }, { "id": "plants", … }, { "id": "animals", … }, { "id": "classmate", … }, { "id": "own-key", … } ] },
    { "id": "q-alive", "kind": "choice", "default": "none", "label": { "en": "Sort by", "zh": "按什么分" },
      "options": [ { "id": "none", … }, { "id": "moves", … }, { "id": "responds", … }, { "id": "grows", … }, { "id": "reproduces", … }, { "id": "needs", … } ] },
    { "id": "asked-big", "kind": "step", "values": [0, 1, 2, 3], "default": 0, "label": { "en": "Questions asked", "zh": "问了几个问题" } },
    { "id": "q-plant", "kind": "choice", "default": "none", "label": { "en": "Sort by", "zh": "按什么分" },
      "options": [ { "id": "none", … }, { "id": "flowers-now", … }, { "id": "flowers-or-fruits", … }, { "id": "needles", … }, { "id": "green", … }, { "id": "flowering", … } ] },
    { "id": "asked-animal", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6], "default": 0, "label": { "en": "Questions asked", "zh": "问了几个问题" } },
    { "id": "suspect", "kind": "choice", "default": "fruit-bat", "label": { "en": "Check this animal", "zh": "检查这只动物" },
      "options": [ "fruit-bat", "dolphin", "penguin", "spider", "asian-toad", "mudskipper", "pangolin", "shark" ] },   // 每项 { id, label }
    { "id": "fix", "kind": "toggle", "default": false, "label": { "en": "Move to the right groups", "zh": "放回正确的组" } },
    { "id": "first", "kind": "choice", "default": "feathers", "label": { "en": "First question", "zh": "第一个问题" },
      "options": [ "feathers", "hair", "six-legs", "fins", "scales", "can-fly" ] },
    { "id": "second", "kind": "choice", "default": "hair", "label": { "en": "Second question", "zh": "第二个问题" },
      "options": [ "feathers", "hair", "six-legs", "fins", "scales", "can-fly" ] }
  ],
  "outputs": [
    { "id": "slots", "kind": "vector", "from": "slots" },                       // { <标本 id>: [dx, dy, dz] | null }：给 shift
    { "id": "layout", "kind": "state", "from": "layout", "states": { "none": {…}, "two": {…}, "three": {…}, "six": {…} } },
    { "id": "on-tray", "from": "count:tray" },
    { "id": "count-u", "from": "count:u" }, { "id": "count-a", "from": "count:a" }, …, { "id": "count-f", "from": "count:f" }, { "id": "count-x", "from": "count:x" },
    { "id": "kinds-a", "from": "kinds:a" }, { "id": "kinds-b", "from": "kinds:b" },
    { "id": "wrong", "from": "wrong" },
    { "id": "verdict", "kind": "state", "from": "verdict", "states": { "right": {…}, "wrong": {…} } },
    { "id": "belongs", "kind": "state", "from": "belongs", "states": { "insect": {…}, "bird": {…}, "mammal": {…}, "fish": {…}, "reptile": {…}, "amphibian": {…}, "none": {…} } },
    { "id": "where-toy-car", "kind": "state", "from": "where:toy-car", "states": { "u": {…}, "a": {…}, "b": {…} } },
    { "id": "where-mushroom", "kind": "state", "from": "where:mushroom", "states": { "u": {…}, "a": {…}, "c": {…} }, "predictOnly": ["a"] },
    { "id": "where-chilli", "kind": "state", "from": "where:chilli-seedling", "states": { "u": {…}, "a": {…}, "b": {…} } },
    { "id": "where-dolphin", "kind": "state", "from": "where:dolphin", "states": { "u": {…}, "c": {…}, "d": {…} } }
  ],
  "bind": [
    { "output": "slots", "part": [ /* 32 件标本 */ ], "shift": { "ease": 0.8, "stagger": 0.03, "lift": 0.04 } },
    { "output": "layout", "part": ["pad-2a", "pad-2b"], "visible": { "eq": "two" } },
    { "output": "layout", "part": ["pad-3a", "pad-3b", "pad-3c"], "visible": { "eq": "three" } },
    { "output": "layout", "part": ["pad-6a", "pad-6b", "pad-6c", "pad-6d", "pad-6e", "pad-6f", "pad-x"], "visible": { "eq": "six" } }
  ],
  "sort": {
    "groups": {                                    // 真实类群：标签 + 所属大类；verdict、kinds、belongs 用
      "non-living": { "label": {…}, "big": "non-living" }, "flowering": { "label": {…}, "big": "plant" }, "non-flowering": {…}, "fungus": {…}, "bacteria": {…},
      "insect": {…}, "bird": {…}, "mammal": {…}, "fish": {…}, "reptile": {…}, "amphibian": {…}, "none": { "label": { "en": "Not in these six groups", "zh": "不在这六类里" }, "big": "animal" }
    },
    "questions": {                                 // 问题 = 一个特征；label 给流程图卡与组名
      "moves": { "label": { "en": "Moves about by itself", "zh": "能自己走动" } }, …,
      "six-legs": { "label": { "en": "Six legs, three body parts", "zh": "六条腿、身体分三部分" } }, …
    },
    "specimens": {                                 // 键 = 零件 id；顺序 = 组内的顺序（§3.2 的 #）
      "toy-car": { "group": "non-living", "traits": { "moves": true, "responds": true, "grows": false, "reproduces": false, "needs": false } },
      …
    },
    "layouts": {                                   // 组的格子：中心、列 × 行、格距（m）；y = 垫面
      "two":   { "a": { "at": [-0.32, 0.011, 0.23], "cols": 7, "rows": 6, "pitch": 0.08, "pad": "pad-2a" }, "b": { … "pad": "pad-2b" } },
      "three": { "a": …, "b": …, "c": … },
      "six":   { "a": …, …, "f": …, "x": { "at": [0.62, 0.005, -0.33], "cols": 3, "rows": 2, "pitch": 0.07, "pad": "pad-x" } }
    },
    "trays": {                                     // 键 = tray 控件的选项
      "all":       { "specimens": "*" },
      "alive":     { "specimens": ["toy-car", "pebble", "plastic-flower", "chilli-seedling", "grasshopper", "plantain-squirrel", "guppy"],
                     "layout": "two", "key": { "ask": "q-alive" } },
      "big":       { "specimens": [ … 13 … ], "layout": "six",
                     "key": { "chain": ["makes-food", "mouth", "fungus"], "else": "d", "asked": "asked-big" } },
      "plants":    { "specimens": [ … 6 … ], "layout": "two", "key": { "ask": "q-plant" } },
      "animals":   { "specimens": [ … 18 … ], "layout": "six",
                     "key": { "chain": ["six-legs", "feathers", "hair", "fins", "scales", "moist-skin"], "else": "x", "asked": "asked-animal" } },
      "classmate": { "specimens": [ … 18 … ], "layout": "six",
                     "key": { "arrangement": { "a": { "heading": "insect", "members": ["grasshopper", "beetle", "spider"] }, …, "x": { "heading": "none", "members": [] } },
                              "fix": "fix", "suspect": "suspect" } },
      "own-key":   { "specimens": [ … 18 … ], "layout": "three", "key": { "ask": "first", "no": { "ask": "second" } } }
    }
  }
}
```

**规则**：

1. **托盘**：`tray` 的值选 `trays` 里的一项；不在这一项 `specimens` 里的标本 → `slots[id] = null`（隐藏），`where:<id>` = `off`。`"*"` = 全部，在盒里，`layout` = `none`。
2. **键**（全部只读特征，不读真实类群，`arrangement` 除外）：
   - `ask: <choice 控件>`：控件值是 `none` → 全部留在盒里（`u`）；否则特征为真 → `a`，假 → `b`。
   - `ask` + `no: { ask: <控件> }`（两层）：第一问真 → `a`；否则第二问真 → `b`；否则 `c`。
   - `chain: [q1 … qn]` + `asked: <step 控件 k>` + `else: <组>`：依次问前 k 个，第 i 个（从 1 起）第一次为真 → 第 i 个字母（a、b、c……）；k 个都假：k < n → `u`；k = n → `else`。
   - `arrangement` + `fix` + `suspect`：`fix` 关 → 每件在数据写的组；开 → 每件进 `heading` 等于它真实类群的那一组（没有这样的组 → 写 `heading: none` 的组，validate 保证存在）。
3. **格子**：每组按 `specimens` 的顺序（不是 `trays` 列表的顺序）排，第 k 件（0 起）在列 k mod cols、行 ⌊k / cols⌋；格心 = `at` + ((列 − (cols − 1)/2) × pitch, 0, (行 − (rows − 1)/2) × pitch)。`u` = 回到自己的家（偏移 [0, 0, 0]）。偏移 = 格心 − 标本的家，"家"= 零件主 primitive 的 `at`（`evaluateSimOnStage` 的第五参数，docs/36 已有）的 x、z 与**标本底面**的 y（零件包围盒底；`lib/parts.ts` 已有包围盒）。
4. **量**（`from`）：`slots`（向量）、`layout`（`none` / 布局名）、`count:<组 | u | tray>`、`kinds:<组>`（这一组里真实类群的种数）、`wrong`（只对 `arrangement`：所在组的 `heading` ≠ 真实类群的件数；其他键给 NaN，显示 `—`）、`verdict` / `belongs`（`suspect` 那一件）、`where:<标本>`（`u` / 组字母 / `off`）。
5. `SEPARATE_EXPERIMENTS['sort'] = true`（每章一个托盘，PLATE 块尾只跟本章）。
6. **validate**（`sim-schema.ts sortSchema`、`sortIssues`，可独立成 `sort-schema.ts`，同 `matter-schema.ts` 的做法）：`trays` 的键 = `tray` 的选项；每个托盘的 `specimens` 是零件、不是 context、不重复；**键会问到的特征，托盘里每件都要写**（列出缺的）；`ask` / `first` / `second` 的控件是 choice，选项 = `questions` 的键（加 `none`）；`asked` 是 0 … n 的 step；`chain` 的长度 ≤ 布局里的组数；`else` 是布局里的组；**容量**：对每个托盘，把它的键用到的控件的所有值组合枚举一遍（都是有限的：最多 6 × 6），任何一组的件数 > cols × rows = error（列出组合）；`arrangement` 的成员恰好覆盖托盘的标本各一次，`heading` 是 `groups` 的键，有需要时有 `none` 组；`suspect` 的选项都在 `classmate` 托盘里；`where:<id>` 的 id 是标本，状态标签覆盖它在各托盘能到的全部值，不写到不了的——**例外**：状态输出可写 `"predictOnly": [<状态>]`，这些状态有标签、可作先猜后看的 `means`，模型不会给，validate 不报"到不了"（但报"predictOnly 里的状态模型其实到得了"）；`layouts` 的 `pad` 是零件；格子不出分类盘（`sorting-tray` 的包围盒）、组与组的格子不重叠；`specimens` 的键是零件。

### 4.3 移位绑定 `shift`（E-LT2；`lib/sim/bind.ts` + `stages/model3d/PartNode.tsx`）

```jsonc
{ "output": "slots", "part": ["toy-car", …], "shift": { "ease"?: 0.8, "stagger"?: 0.03, "lift"?: 0.04 } }
```

- **值**：向量输出 `{ <零件 id>: [dx, dy, dz] | null }`（场景单位）。`part` 列出的零件里，向量没写的 → 不动（偏移 0、照常显示）；`null` → **隐藏**，与章 / 拍 `hide` 同一套效果（不画、不投影、不可点、不标注、不进本章索引的"可见"判断），但不沿 `explode` 方向移出：原地淡出 0.3 s。
- **变换顺序**：位置 → 姿态 → `offset` / `rotate` 绑定 → **`shift`**（加在最后，与 `offset` 叠加）→ 动画。引线锚点、`__atlas.engine.anchor`、包围盒、PLATE 立面都跟着走（同 `offset`）。
- **过渡**：偏移变化时按 `ease` 秒三次缓入缓出；路径是一条拱：y 额外 + `lift` × sin(π t)（标本被"拿起来、放下"）；多件同时变化时按它们在向量里的顺序各晚 `stagger` 秒开始（18 件约 0.5 s 铺开）。深链接、拍的瞬切、截图、`prefers-reduced-motion`、REFERENCE = 直接终值。
- **测试 API**：`__atlas.engine.shift(partId)` → `{ offset: [x, y, z], target: [x, y, z], shown }`；`pnpm shoot --beats` 每拍核对：每件有 `shift` 的零件此刻的 `offset` = 模型 `slots` 的值（± 1 mm）、`shown` = 值不为 `null`。
- **validate**：输出是向量；`part` 是零件、不是 context；同一零件只有一条 `shift`；不能与 `place` 绑定同用一件。
- **复用**：任何"把零件挪到模型算出的位置"的场景（以后的 `materials` 主题按材料分组、`life-cycles` 标本按阶段排队）都能用。

### 4.4 分类流程图卡（E-LT3；`hud/KeyCard.tsx` + `lib/sim/keycard.ts`）

- **何时出现**：`sim.kind = 'sort'` 时代替右上的零件链路卡（同 `CycleCard`、`CircuitCard`）；标题 FLOWCHART / 分类流程图；< 1024 px 收进试一试卡片里可折叠的一节；没有试一试卡的章（00）在阅读面板里单独放这一节；手机同其他右上卡。
- **版式**（`lib/sim/keycard.ts keyLayout`，纯函数、确定、有单测；viewBox 宽 280）：
  - `ask`：一个问题框（圆角、hairline 墨线，字是问题的 `label`）→ 两条线 YES / 是、NO / 不是 → 两个叶子 A、B。
  - 两层 `ask` + `no`：问题框 1 → YES → A；NO → 问题框 2 → YES → B、NO → C。
  - `chain`：问题框竖排（每行一个），每个框右边一条 YES 线到它的叶子（A、B……），框与框之间一条 NO 线向下；最后一个 NO 到 `else` 叶子。还没问到的（序号 > `asked`）画虚线、字用 `ink-faint`；叶子仍画（件数 0）。
  - `arrangement`：没有问题框，七个叶子竖排，每个写组名（类群标签）和件数；含放错件的叶子后面一个 ✗ 和"n 只放错"（**不只靠颜色**）；`fix` 开后 ✗ 消失。
  - `tray: all`（没有键）：一行字"32 specimens in the case. Pick a chapter to sort them. / 标本盒里有 32 件标本。选一章来分一分。"
- **叶子**：字母 + 组名 + 件数（`count:<组>`，同 PLATE），组名 = `ask` 的 A "Yes: <问题>" / B "No"，两层的 C "Neither"，`chain` 的第 i 个 = 第 i 个问题的 `label`、`else` = `groups[else]` 的标签（D：Bacteria / 细菌；X：Not in these six groups）——这就是新加坡讲义"给组起标题"那一步（R: `g-live-7`）。
- **选中的标本**（store `part` 是本托盘的标本时）：它走过的问题框和线描 `signal`，答案（YES / NO）加粗，落到的叶子实心；`arrangement` 下它所在的叶子描 `signal`，若放错，叶子旁另写"本该在：<类群>"（= `belongs`）。
- **交互**：叶子是按钮（44 px 命中区，Enter / Space）：点 = 选中这一组的毡垫零件（详情卡出现，引线标注这一组）；`aria-current` 标选中标本所在的叶子。卡片本身不改控件（改问题在试一试卡片里，免得两处入口）。
- **读屏**：`aria-label` = `keySummary`（"Flowchart in this model: Six legs, three body parts? Yes: group A, 2. No: Feathers? …" / "这个模型里的分类流程图：六条腿、身体分三部分？是：A 组，2 只。不是：有羽毛？……"）；件数变化时 0.3 s 淡入（减少动态时不淡）。底下一行 `SIM` + "In this model / 在这个模型里"。
- **i18n**：`space.card.key`、`space.key.*`。
- **测试**：`.space-key[data-kind]`、`[data-node]`、`[data-leaf][data-count]`、`[data-on]`、`[data-wrong]`。

### 4.5 两种表面 `scales`、`feathers`（E-LT4；`stages/model3d/textures.ts`、`materials.ts`、`lib/presets.ts`）

- **`scales`**：鳞片的法线贴图 + 灰度颜色贴图——一排排互相错开、半圆形的鳞，每片中间略高、边缘一道暗缝（`scaleField`，同 `pileField` / `sandField` 的写法，种子固定）；材质族 `scales` = 半光泽（roughness 0.45）、`tint` 给物种本色；sweep 的 UV（u = 弧长）让鳞沿身体方向排。重复密度：绕截面一圈 14 片（v 方向），沿身体按同样的宽高比重复。**不加新字段**：鳞的大小随零件的粗细走——穿山甲身体粗、鳞自然大，鱼和壁虎细、鳞自然小，正是想要的。
- **`feathers`**：羽片的法线贴图——一排排沿 u 方向的细长叶形片，片与片上下重叠，片上一道羽轴；材质族 `feathers` = 哑光（roughness 0.8）、`tint`。
- 两者只在用到的主题生成（同 `pile`、`sand`：`finish` 按需建）。机器主题、已有生物主题不受影响（截图不回归）。
- **退路**：不做 E-LT4 时，鳞片用 `chitin` + 深一档的 `tint`，羽毛用 `fabric`（短绒）——Tier-1 仍认得出（剪影、喙、尾），但"毛 / 羽毛 / 鳞片看得清"这一条验收降为"颜色与剪影可分"，§9 记录。

### 4.6 µm 比例尺（E-LT5，可选；`lib/units.ts`、`schema.ts`）

`groups[].scale.unit` 加 `"um"`；`formatLength` 小于 0.1 mm 时写 `µm`（**保留小写 µ 与 m**：`5 µm · ×5000`，不写成 `5 µM`，单测）。显微镜台座组 `magnified` 写 `{ "unit": "um", "magnification": 5000 }`（酵母细胞约 4 µm 画成 2 cm——F-91 核到后按核到的值改倍数）。核不到 F-91 / F-92 时不写 `scale`，本件取消。

### 4.7 引擎件清单与文件归属（一个 Opus 引擎代理，约 4 天；不改 `package.json`、不加依赖；在工作分支提交，push 等 Gavin）

| 件 | 优先级 | 文件 | 要点 | 估计 |
|---|---|---|---|---|
| E-LT1 模型 | 必须 | `src/engines/space-scene/lib/sim/sort.ts`（新）、`sort-schema.ts`（新）、`sim-schema.ts`（`SIM_KINDS` 加 `sort`、`quantityKind`、状态标签；短分支）、`lib/sim/index.ts`（注册、`SEPARATE_EXPERIMENTS`） | §4.2 | 1.0 天 |
| E-LT2 `shift` | 必须 | `lib/sim/bind.ts`（`shift` 效果）、`sim-schema.ts`（绑定 schema 与校验）、`stages/model3d/PartNode.tsx`（缓动、拱形路径、错开、隐藏）、`bridge.ts` / `probes`（锚点跟随）、`core/test-api.ts`（`shift`）、`scripts/shoot.ts`（每拍核对） | §4.3 | 0.6 天 |
| E-LT3 流程图卡 | 必须 | `hud/KeyCard.tsx`（新）、`lib/sim/keycard.ts`（新，版式与读屏文字）、`View.tsx`（右上卡选择）、`explorer/TryIt.tsx`（< 1024 px 收进卡片）、i18n | §4.4；退路：卡片只列"组名 · 件数"一张表（无图） | 1.2 天 |
| E-LT4 表面 | 应该 | `stages/model3d/textures.ts`、`stages/model3d/materials.ts`、`lib/presets.ts`、`schema.ts`（材质族枚举） | §4.5；退路见该节 | 0.5 天 |
| E-LT5 µm | 可选 | `lib/units.ts`、`schema.ts` | §4.6 | 0.15 天 |
| 夹具主题 | 必须 | `src/content/topics/sample-sort/`（新，`status: draft`，占位文字，只用程序化积木：8 件"标本"（球、方块、锥……带不同的假特征）、两种布局的毛毡垫；四章：`ask`、两层 `ask`、`chain`、`arrangement` + 背景章） | 不碰 `living-things/` 目录 | 0.4 天 |
| 测试 | 必须 | `tests/space-scene/sort.test.ts`、`keycard.test.ts`、`shift.test.ts`、样板 `tests/space-scene/fixtures/specimen-tray.ts`（§4.2 的完整 `sort` 数据 = 本主题的作者模板，含 §3.4 全表）、`tests-e2e/sample-sort.spec.ts` | §4.8 | （含在上面） |
| 文档 | 必须 | `docs/06-dev-guide.md` 新节「SpaceScene · 试一试 · 分类（sort）」「SpaceScene · 移位（`shift`）」「SpaceScene · 分类流程图卡」，改「试一试（sim）」的模型种类一行与绑定一行、材质族一行 | | 0.2 天 |

主会话不预装依赖（不需要）。内容代理（§8.1 D1）与引擎代理并行：内容代理先写标本几何和 `sort` 数据的**特征表**（`scripts/geo/living-things/specimens/*.ts`），`sim` 段等 E 合并后接上。E-LT4 可以另交一个代理并行（只碰 `textures.ts` / `materials.ts` / `presets.ts`，与 E-LT1–3 无交集）。

### 4.8 引擎验收

- [ ] 单测 `sort.test.ts`：§2.8 全部表格逐格（T1 六行、T2 四行、T3 六行、T4 七行与海豚的位置、T5 两态与八个嫌疑、T6 七行）；不变量：每件在且只在一个地方；`u` 的偏移为 0；同一组里件的格子不重叠、都在组框内；`chain` 的 k 递增时盒里的件数不增；`arrangement` `fix` 开时 `wrong` = 0；确定性；URL `sim=tray.animals~asked-animal.4` 往返。
- [ ] 单测 `keycard.test.ts`：四种键的版式（节点数、线、叶子的位置不重叠、命中方块 ≥ 44 px @ 280 px 宽卡片的 82 %）；还没问到的框是虚线；选中标本的路径；`arrangement` 的 ✗ 与"本该在"；读屏文字 EN / ZH。
- [ ] 单测 `shift.test.ts`：向量 → 偏移；`null` → 隐藏；没写的不动；与 `offset` 叠加的顺序；拱形路径的中点高度 = `lift`；错开的开始时刻；瞬切直接终值。
- [ ] validate 报错用例：托盘的键缺控件、问到的特征缺值（列出标本与特征）、容量溢出（列出组合）、`arrangement` 漏件或重件、`heading` 不是类群、`suspect` 不在托盘里、`where` 的 id 不是标本、`where` 写了到不了的状态、`pad` 不是零件、格子出盘、`shift` 的输出不是向量、同一零件两条 `shift`。
- [ ] e2e（`sample-sort`）：深链接 `?ch=…&sim=…` 后零件在格子里（`__atlas.engine.shift` = 模型）；`]` 换问题时件按拱形移动、错开；`chain` 每多问一个，盒里少几件、卡片多点亮一个框；`arrangement` 开关：✗ 消失、件回位；点卡片的叶子选中毡垫；中文页；手机 390 × 844 卡片与流程图在抽屉里可用、按钮 ≥ 44 px。
- [ ] `sample-space`、`sample-life-cycle`、`sample-matter`、`grasshopper`、`mosquito`、`plant`、`states-of-matter` 截图与 `--beats` 不回归（`shift` 与新材质族不影响旧数据）。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.9 不做（v2）

- **判分小测卡**：试一试卡片加一种"小测"（拖或点把一件标本放进一组，判对错、按误解给一句反馈，误解来自 §1.4；约 1.5 天）——docs/17 A10 的科学版，要先问 Gavin 要不要让 SpaceScene 的科学主题开始判分（D1、§0.1 第 2 条）。
- **读者拖动标本**进组（拖放 + 触屏 + 键盘替代，约 2 天）。
- **自己写打勾表**（卡片里一张可勾的表，勾完生成流程图）。
- 显微镜的"对焦"动画、植物向光生长的"反应"演示。

---

## 5. 章节

### 5.0 总表

`layers` 写"全部"= 除 `magnified` 外的所有组；`run` 一律 false；镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | `tray: all` | plantain-squirrel, ixora, mushroom, toy-car, bacteria-dish | hero |
| 01 | `alive-or-not` | Living and non-living / 生物与非生物 | `tray: alive`, `q-alive: none` | toy-car, pebble, plastic-flower, chilli-seedling, plantain-squirrel | tray-view |
| 02 | `four-big-groups` | Plants, animals, fungi and bacteria / 植物、动物、真菌、细菌 | `tray: big`, `asked-big: 0` | ixora, mushroom, javan-myna, bacteria-dish | tray-view |
| 03 | `flowering-or-not` | Flowering and non-flowering plants / 开花植物与不开花植物 | `tray: plants`, `q-plant: none` | ixora, chilli-seedling, rhu-sapling, birds-nest-fern | tray-view |
| 04 | `animal-groups` | Six groups of animals / 动物的六个类群 | `tray: animals`, `asked-animal: 0` | plantain-squirrel, javan-myna, snakehead, tree-frog, house-gecko, grasshopper | tray-view |
| 05 | `classified-wrongly` | Classified wrongly / 分错了的动物 | `tray: classmate`, `fix: false`, `suspect: fruit-bat` | fruit-bat, dolphin, penguin, spider | tray-view |
| 06 | `make-a-flowchart` | Make your own flowchart / 自己做分类流程图 | `tray: own-key`, `first: feathers`, `second: hair` | pad-3a, pad-3b, pad-3c | tray-view |

- 第 02 章第 5 拍、00 章第 4 拍：`layers: [magnified]`、`camera: lens-view`（**只有**台座与显微镜，不和桌子同框，同 docs/36 D4 的做法）。
- 拍的 `sim.set` 叠在本章 `set` 上、不叠在上一拍上：每拍把要的控件写全。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "These are models, not real specimens, and they are not drawn to scale: a dolphin and a guppy fill the same space in the case. Real sizes are given in each specimen's details where a source gives one. The cells under the microscope are drawn far larger than life. The number of specimens in each group is worked out by the model from what each specimen looks like (marked SIM)." / ZH "这些是模型，不是真的标本，彼此也不按比例：在标本盒里，一只海豚和一条孔雀鱼占一样大的格子。有来源的，每件标本的详情里写了实物多大。显微镜下的细胞画得比实物大得多。每组有几件，是模型按每件标本的样子算出来的（标 SIM）。"
- **summary**：Living things are all around us. This bench holds model specimens of animals, plants, fungi and bacteria, and three things that are not alive. Each chapter sorts some of them into groups by what you can see. / 生物就在我们身边。这张桌上有动物、植物、真菌、细菌的标本模型，还有三样不是生物的东西。每一章按看得见的特征，把其中一些分成组。
- **正文提纲**：① 课纲要什么（F-1–F-3）：说出生物的特征、认出几个大类、按看得见的特征给植物和动物分组。② "分类"的意思：按共同的特征把东西分组（F-6）；新加坡课本的三步：观察、分组、给组起标题（F-15）。③ 这张桌子：标本盒、分类盘、毡垫、显微镜台座；标本是模型（`note`）。④ 物种的名字只为说清"这是什么"，课纲不要求记（F-4）。⑤ 右上角的流程图卡、试一试卡片、先猜后看怎么用；件数是模型算的（SIM）。⑥ 昆虫和开花植物另有完整的主题：`<TopicLink slug="grasshopper" ch="whole-animal">`、`<TopicLink slug="plant" ch="the-whole-plant">`。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero，`tray: all`）；labels plantain-squirrel, ixora, mushroom, toy-car, bacteria-dish | This case holds thirty-two model specimens. Most are living things; three are not. / 这个标本盒里有 32 件标本模型，大多数是生物，有 3 件不是。 |
| 2 | `tray: big`, `asked-big: 3`；camera tray-view；labels pad-6a, pad-6b, pad-6c, pad-6d | In front of the case is a sorting tray. Specimens move from the case into groups, one question at a time. / 标本盒前面是一只分类盘。每问一个问题，就有标本从盒里移到盘上的组里。 |
| 3 | 同上；labels mushroom, javan-myna | Classifying means grouping things by what they have in common. The flowchart at the top right shows the questions asked. / 分类，就是按共同的特征把东西分组。右上角的流程图列出了问过的问题。 |
| 4 | `tray: all`；layers magnified；camera lens-view；labels yeast-cells, bacteria-cells | Some living things are too small to see one at a time. Under the microscope they are drawn far larger than life. / 有的生物一个一个是看不见的。显微镜下的它们，画得比实物大得多。 |

- **试一试**：无。**流程图卡**：在阅读面板里单独一节（D14）。
- **细看**：`About these models`（模型、不按比例、真实大小在详情里）；`Names you do not need to learn`（F-4：孔雀鱼、胎生是课纲自己举的例子）；`Look, don't catch`（课纲 VEA：看，不捉；翻开的石头、木头放回原处——价值陈述）。
- **本章索引**：plantain-squirrel, ixora, mushroom, toy-car, bacteria-dish, yeast-cells
- **名词首现**：living-thing、classify。

### 5.2 第 01 章 `alive-or-not`

- **summary**：Living things need water, food and air, and they grow, respond to changes and reproduce. A toy car can move and even respond, but it cannot grow or reproduce, so it is not alive. / 生物需要水、食物和空气，会生长、会对变化作出反应、会繁殖。玩具车会动，甚至会"反应"，但它不会生长、不会繁殖，所以不是生物。
- **正文提纲**：① 课纲的单子：需要水、食物、空气；生长、反应、繁殖（F-1）。② 植物也需要食物：它自己制造（F-10）。③ 会动不在单子上：辣椒苗不走动，是生物；玩具车会动，不是（M-1；威尔士的单子有 Movement，新加坡的没有，F-12，细看）。④ "反应"：生物会对周围的变化作出反应；可是玩具车也会"反应"（F-11），只看这一条分不出来（M-3）。⑤ 生长与繁殖：松鼠一胎两三只（F-14）、辣椒结种子（链 `<TopicLink slug="plant" ch="fruits-and-seeds">`）；玩具车、石头、塑料花都不会（F-16 的措辞约束）。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`q-alive: none`）；labels toy-car, pebble, plastic-flower, chilli-seedling, plantain-squirrel | Seven things from the case. Four are living things: a squirrel, a grasshopper, a guppy and a young chilli plant. / 盒里拿出 7 样东西。其中 4 样是生物：一只松鼠、一只蝗虫、一条孔雀鱼、一株辣椒幼苗。 |
| 2 | `q-alive: moves`；labels toy-car, chilli-seedling, pad-2a | Sorted by "moves about by itself", the toy car joins the animals and the chilli plant stays with the pebble. Moving is not one of the signs of life. / 按"能自己走动"来分，玩具车和动物分到一组，辣椒苗却和石头在一起。会动并不是生物的特征。 |
| 3 | `q-alive: responds`；labels toy-car, chilli-seedling | Living things respond to changes around them. A toy car can respond too, so this question alone cannot tell them apart. / 生物会对周围的变化作出反应。玩具车也会有反应，所以只问这一条还分不出来。 |
| 4 | `q-alive: grows`；labels toy-car, plastic-flower, pad-2b | Living things grow. The toy car, the pebble and the plastic flower never do. / 生物会生长。玩具车、石头和塑料花都不会长大。 |
| 5 | `q-alive: reproduces`；labels plantain-squirrel, chilli-seedling | Living things reproduce. A squirrel has young, and a chilli plant makes seeds. A toy car cannot make more toy cars. / 生物会繁殖：松鼠会生小松鼠，辣椒会结种子。玩具车变不出更多的玩具车。 |
| 6 | `q-alive: needs`；labels chilli-seedling, plantain-squirrel | Living things need water, food and air to survive. A plant needs food too; it makes its own. / 生物要有水、食物和空气才能活下去。植物也要食物，只是它自己制造。 |

- **试一试 T1**：`vary: q-alive`，`keep: [{ en: "The same seven things", zh: "同样的 7 样东西" }]`，`observe: [count-a, count-b, where-toy-car]`，`record: true`（表：问题 · A · B · 玩具车在）；`predict`：prompt "Sort by 'responds to changes' instead of 'grows'. Where will the toy car go?" / "不按“会生长”，改按“对变化有反应”来分，玩具车会去哪一组？"，`start: { q-alive: grows }`，`change: { q-alive: responds }`，`observe: where-toy-car`，options 留在 B 组（和石头一起）`b` / 去 A 组（和生物一起）`a`。
- **细看**：`Moving is not on the list`（F-12：威尔士的 MRS GREN 有七项，新加坡的单子短一些，没有"会动"；F-80 一句"研究发现，很多人把'活'和'会动'连在一起"——不写比例、注明是土耳其的九年级学生）；`Is a flame alive?`（F-13：英格兰课程拿它做讨论题；用这五条一条条核一核，不给答案）；`Once alive`（英格兰把东西分成"活的、死的、从来没活过"；新加坡课纲只分生物与非生物；木头勺子、枯叶曾经是生物的一部分；S64，"living, dead, never alive"的措辞研究没有摘录，T1 复读原文核，核不到删这一块）；`Plants respond too`（F-103 雨树的小叶在下雨前合起来——待核，核不到删这一块）。
- **本章索引**：toy-car, pebble, plastic-flower, chilli-seedling, grasshopper, plantain-squirrel, guppy
- **名词首现**：non-living-thing、characteristic、grow、respond、reproduce（后三个并进 `characteristic` 的定义，不单列）。

### 5.3 第 02 章 `four-big-groups`

- **summary**：Living things can be sorted into big groups: plants, animals, fungi and bacteria. A mushroom is not a plant: it has no leaves and cannot make its own food. Mould and yeast are fungi too, and they are alive. / 生物可以分成几个大类：植物、动物、真菌、细菌。蘑菇不是植物：它没有叶子，也不能自己制造食物。霉菌和酵母也是真菌，也是生物。
- **正文提纲**：① 植物：绿色，自己制造食物（F-10、F-26；苔藓没有真正的根茎叶，所以不说"植物都有根、茎、叶"）。② 动物：吃进食物（F-10）。③ 真菌：蘑菇、霉菌、酵母，还有长在朽木上的多孔菌（F-27、F-51、F-53）；不是植物：没有根、茎、叶，不能自己制造食物（M-4）；它们靠长在上面的东西过活，把死去的东西分解掉（"分解者"一词放细看）。④ 霉菌看得见：面包上毛茸茸的一团（纠正 F-27 的讲义说法）；单个的酵母细胞看不见（F-53）。⑤ 细菌：一个小到看不见（F-28）；长成一团菌落就看得见（F-90）；有益有害（M-7）。⑥ 显微镜下的样子。⑦ 课纲说认出真菌、细菌就够了，分组只要求植物和动物（F-6，细看）。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`asked-big: 0`）；labels ixora, mushroom, javan-myna, bacteria-dish, moss | Thirteen living things, still in the case: plants, animals, fungi and bacteria mixed together. / 13 件生物还在标本盒里：植物、动物、真菌、细菌混在一起。 |
| 2 | `asked-big: 1`；labels pad-6a, moss, mushroom | First question: is it green, and does it make its own food? The four plants move to group A. The mushroom stays behind. / 第一个问题：它是不是绿色的、自己制造食物？4 株植物移到 A 组，蘑菇留在原处。 |
| 3 | `asked-big: 2`；labels pad-6b, grasshopper, snakehead | Next: does it take in food through a mouth? The four animals move to group B. / 下一个问题：它是不是用嘴吃进食物？4 只动物移到 B 组。 |
| 4 | `asked-big: 3`；labels mushroom, bracket-fungus, mouldy-bread, yeast, bacteria-dish | The mushroom, the bracket fungus, the mould and the yeast are fungi, in group C. They have no leaves and cannot make their own food. The bacteria are group D. / 蘑菇、多孔菌、霉和酵母是真菌，在 C 组。它们没有叶子，也不能自己制造食物。细菌是 D 组。 |
| 5 | `asked-big: 3`；layers magnified；camera lens-view；labels yeast-cells, bacteria-cells | Under a microscope, yeast is a mass of tiny round cells. Bacteria are smaller still: one on its own is far too small to see. / 在显微镜下，酵母是一大团圆圆的小细胞。细菌还要小，单独一个根本看不见。 |
| 6 | `asked-big: 3`；camera 拍内（C、D 组近景）；labels mouldy-bread, bacteria-dish | Grown into a patch, mould on bread can be seen with the eye alone, and so can a colony of bacteria in a dish. / 长成一片以后，面包上的霉用眼睛就看得见，培养皿里的一团细菌菌落也看得见。 |

- **试一试 T2**：`vary: asked-big`，`keep: [{ en: "The same thirteen living things", zh: "同样的 13 件生物" }]`，`observe: [count-a, count-b, count-c, count-u]`，`record: { chart: { y: count-u } }`（折线图：盒里还剩几件，13 → 9 → 5 → 0）；`predict`：prompt "Ask the first question: green, and makes its own food. Will the mushroom go to group A with the plants?" / "问第一个问题：绿色、自己制造食物。蘑菇会和植物一起去 A 组吗？"，`start: { asked-big: 0 }`，`change: { asked-big: 1 }`，`observe: where-mushroom`，options 和植物一起去 A 组 `a` / 留在盒里 `u`。`a` 是模型永远给不出的值（蘑菇在 `big` 托盘里只会在盒里或 C 组），只为这个选项存在，同 docs/36 `vs-sum` 的 `more`：`where-mushroom` 写 `"predictOnly": ["a"]`（§4.2 规则 6）。
- **细看**：`Fungi are not plants`（F-27；F-84：四个五年级学生的访谈里有"蘑菇有根和叶"的说法——注明是土耳其的一项小研究；F-54：新加坡植物园的一次展览说真菌"既不是植物也不是动物"）；`Decomposers`（F-27 `g-fungi-4`、F-51：多孔菌分解朽木，也会让行道树生病）；`Mould you can see`（单个霉菌、酵母细胞看不见，长成一片的霉看得见；不要吃发霉的面包——价值陈述）；`Helpful and harmful bacteria`（F-28；雨树根里的细菌，F-49；肠道里的细菌，`<TopicLink slug="digestive-system" ch="large-intestine-chapter">`）；`Recognise, not classify`（F-6：课纲对真菌、细菌用 recognise，对植物、动物用 classify）；`Do not grow bacteria at home`（培养皿是模型——价值陈述）。
- **本章索引**：ixora, chilli-seedling, birds-nest-fern, moss, mushroom, bracket-fungus, mouldy-bread, yeast, bacteria-dish, yeast-cells, bacteria-cells, grasshopper, javan-myna, plantain-squirrel, snakehead
- **名词首现**：plant、animal、fungus、mould、mushroom、yeast、bacteria、colony（标"扩展"）、decomposer（只在细看，标"扩展"）。

### 5.4 第 03 章 `flowering-or-not`

- **summary**：Plants are grouped by whether they bear flowers. Ferns and mosses never do, and they are green too. A young chilli plant has no flowers yet, and a rhu tree looks like a pine, but both are flowering plants. / 植物按会不会开花分组。蕨和苔藓从来不开花，它们也是绿色的。辣椒幼苗还没开花，木麻黄长得像松树，但它们都是开花植物。
- **正文提纲**：① 开花植物开花，然后结果、结种子（F-26；链 `<TopicLink slug="plant" ch="flowers-and-pollination">`）。② 不是一直有花：辣椒幼苗还没开（M-9；链 `<TopicLink slug="plant" ch="seed-to-plant">`）。③ 不开花植物：蕨、苔藓；也是绿色的（M-8）；鸟巢蕨、鹿角蕨是新加坡本地的蕨，长在树枝上（F-47、F-48、F-101）；配图 `living-things-plant-fungus`（③ 段后，图注："一株开花植物、一丛蕨、一朵蘑菇。只有前两样是植物。"）。④ 像松树的木麻黄会开小花，是开花植物（M-10，F-46）。⑤ "看现在有没有花"为什么不够：要看它会不会开花；问题本身决定了分得对不对（T3）。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`q-plant: none`）；labels ixora, chilli-seedling, rhu-sapling, birds-nest-fern, staghorn-fern, moss | Six plants. All of them are green and make their own food. / 6 株植物，都是绿色的，都自己制造食物。 |
| 2 | `q-plant: flowers-now`；labels pad-2a, ixora | Sorted by "has flowers now", only the ixora goes to group A. / 按"现在有花"来分，只有龙船花去了 A 组。 |
| 3 | `q-plant: flowers-now`；labels chilli-seedling | The young chilli plant has no flowers yet. It will flower when it is older, so it is still a flowering plant. / 辣椒幼苗还没开花，长大了才开，所以它仍是开花植物。 |
| 4 | `q-plant: needles`；labels rhu-sapling | The rhu tree has thin, needle-like shoots, like a pine. It bears tiny flowers, so it is a flowering plant. / 木麻黄长着细针一样的枝条，像松树；但它会开很小的花，是开花植物。 |
| 5 | `q-plant: flowering`；labels pad-2a, pad-2b | Grouped by whether they ever bear flowers: the ixora, the chilli and the rhu are flowering plants. The two ferns and the moss never flower. / 按会不会开花来分：龙船花、辣椒、木麻黄是开花植物；两种蕨和苔藓从来不开花。 |
| 6 | `q-plant: green`；labels birds-nest-fern, staghorn-fern, moss | Non-flowering plants are green too. These two ferns grow on tree branches in Singapore. / 不开花植物也是绿色的。这两种蕨在新加坡长在树枝上。 |

  第 4 拍"tiny flowers"按 F-100 核到的写；核不到改成 "but it is a flowering plant, not a pine" / "但它是开花植物，不是松树"。
- **试一试 T3**：`vary: q-plant`，`keep: [{ en: "The same six plants", zh: "同样的 6 株植物" }]`，`observe: [count-a, count-b, where-chilli]`，`record: true`；`predict`：prompt "Sort by 'flowers, buds or fruits on it now' instead of 'ever bears flowers'. Will the young chilli plant stay in group A?" / "不按“会不会开花”，改按“现在有花、花苞或果实”来分，辣椒幼苗还会留在 A 组吗？"，`start: { q-plant: flowering }`，`change: { q-plant: flowers-or-fruits }`，`observe: where-chilli`，options 留在 A 组 `a` / 去 B 组 `b`。
- **细看**：`Not in flower yet`（F-26 `g-plant-4`）；`A pine look-alike`（F-46 原话）；`Spores (Primary 5)`（F-47：鸟巢蕨叶背褐色的线是产孢子的地方；F-7：孢子和种子到 P5 再学；F-50：苏铁、松树不开花却结种子，NParks 叫它们"不开花的种子植物"）；`Plants on plants`（F-49、F-101：雨树的枝上长着鸟巢蕨，一株开花植物托着一株不开花植物）；`Mosses`（没有真正的根、茎、叶，S70）。
- **本章索引**：ixora, chilli-seedling, rhu-sapling, birds-nest-fern, staghorn-fern, moss
- **名词首现**：flowering-plant、non-flowering-plant、fern、moss、spore（只在细看，标"扩展"）。

### 5.5 第 04 章 `animal-groups`

- **summary**：Animals are sorted into six groups by what can be seen on their bodies: insects have six legs, birds have feathers, mammals have hair, fish have fins, reptiles have dry, scaly skin and amphibians have moist skin. People are mammals too. / 动物按身上看得见的特征分成六类：昆虫有六条腿，鸟类有羽毛，哺乳动物有毛发，鱼类有鳍，爬行动物皮肤干、有鳞片，两栖动物皮肤湿润。人也是哺乳动物。
- **正文提纲**：① 六类各看什么（F-20–F-25）：一句一类；"大多数鱼下蛋""大多数哺乳动物胎生"——写"大多数"，而且这些课纲不要求（F-4）。② 好问题问的是每只都看得见的东西：腿、羽毛、毛、鳍、鳞、皮肤（D4）。③ 流程图的顺序：先问只有一类才有的（六条腿、羽毛、毛发），鳞片、鳍、会飞跨好几类，放后面（D4，研究 §3.3）。④ 人也是动物、是哺乳动物（M-14，F-98）。⑤ 配图 `living-things-animal-groups`（① 段后，图注："一只蛙、一条鱼、一只蝴蝶：两栖动物、鱼类、昆虫。"）。⑥ 昆虫的身体去 `grasshopper`、`mosquito` 看（链）。⑦ 这张流程图会分错三只：海豚、穿山甲、蟾蜍（第 05 章）。⑧ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`asked-animal: 0`）；labels plantain-squirrel, javan-myna, snakehead, tree-frog, house-gecko, grasshopper | Eighteen model animals: at least one from each of the six groups, and a spider. / 18 只动物模型：六个类群每类至少一只，还有一只蜘蛛。 |
| 2 | `asked-animal: 1`；camera back-row；labels grasshopper, beetle, spider | Six legs and three body parts: the grasshopper and the beetle are insects, in group A. The spider has eight legs, so it stays in the case. / 六条腿、身体分三部分：蝗虫和甲虫是昆虫，进了 A 组。蜘蛛有八条腿，留在盒里。 |
| 3 | `asked-animal: 2`；camera back-row；labels javan-myna, penguin | Feathers: the myna and the penguin are birds, in group B. A penguin cannot fly, but it has feathers. / 有羽毛：八哥和企鹅是鸟类，进了 B 组。企鹅不会飞，但它有羽毛。 |
| 4 | `asked-animal: 3`；camera back-row；labels plantain-squirrel, fruit-bat | Hair or fur: the squirrel and the fruit bat are mammals, in group C. A bat can fly, but it has fur. / 有毛发：松鼠和果蝠是哺乳动物，进了 C 组。蝙蝠会飞，但身上有毛。 |
| 5 | `asked-animal: 4`；camera front-row；labels snakehead, mudskipper, shark, dolphin | Fins: the snakehead, the guppy, the mudskipper and the shark go to group D, the fish. In this sort the dolphin goes there too. Chapter 5 checks it. / 有鳍：斑鱼、孔雀鱼、弹涂鱼和鲨鱼进了 D 组，鱼类。按这样分，海豚也进了 D 组，第 5 章再来核对。 |
| 6 | `asked-animal: 6`；camera tray-view；labels pangolin, house-gecko, tree-frog, asian-toad, spider | Scales: the gecko, the python, the turtle and the pangolin go to group E. Moist skin: the tree frog goes to group F. The toad and the spider are left over. / 有鳞片：壁虎、蟒蛇、海龟和穿山甲进了 E 组。皮肤湿润：树蛙进了 F 组。剩下蟾蜍和蜘蛛。 |

- **试一试 T4**：`vary: asked-animal`，`keep: [{ en: "The same eighteen animals", zh: "同样的 18 只动物" }, { en: "Questions asked in the same order", zh: "问题的顺序不变" }]`，`observe: [count-u, count-x, where-dolphin]`，`record: { chart: { y: count-u } }`（折线图：18 → 16 → 14 → 12 → 7 → 3 → 0）；`predict`：prompt "Ask the fourth question: does it have fins? Where will the dolphin go?" / "问第四个问题：它有鳍吗？海豚会去哪里？"，`start: { asked-animal: 3 }`，`change: { asked-animal: 4 }`，`observe: where-dolphin`，options 留在盒里 `u` / 去 D 组（鱼类）`d` / 去 C 组（哺乳动物）`c`（`c` 在 T5 里模型给得到，不必 `predictOnly`）。
- **细看**：`Most, not all`（F-20–F-24 的"大多数"；F-55–F-58：在陆地上下蛋的温室蛙、胎生的多纹南蜥和孔雀鱼、雄海龙育儿、下蛋的鸭嘴兽——注明"课纲不要求记"）；`Why ask about six legs first`（D4、研究 §3.3：鳞片、翅膀、住在水里都跨好几类）；`People are animals`（M-14、F-82：一项研究发现学生常把人单独放一组）；`Insects up close`（`<TopicLink slug="grasshopper" ch="whole-animal">`、`<TopicLink slug="mosquito" ch="the-adult">`）；`Life cycles`（F-8：课纲在生活史一课点名的动物里有蛙、甲虫、蝴蝶、蝗虫、蚊子；链 `mosquito` `before-you-start`）。
- **本章索引**：18 只动物（按 # 排）。
- **名词首现**：mammal、bird、fish、amphibian、reptile、insect、feathers、scales、fins（后三个并进各类的定义，不单列）、flowchart。

### 5.6 第 05 章 `classified-wrongly`

- **summary**：Some animals look as if they belong to another group. A fruit bat flies but has fur, so it is a mammal. A dolphin has fins and lives in the sea, but it breathes air and is a mammal too. A penguin cannot fly but has feathers. A spider is not an insect. / 有的动物看起来像别的类群。果蝠会飞，但身上有毛，是哺乳动物。海豚有鳍、住在海里，但它呼吸空气，也是哺乳动物。企鹅不会飞，却有羽毛。蜘蛛不是昆虫。
- **正文提纲**：① 同学的分类盘（新加坡练习的题型，F-73）：六个标题、7 只放错。② 为什么会错：按住在哪里、怎么动来分（M-11，F-82）。③ 一只一只纠正，每只一句来源：果蝠（F-35）、企鹅（F-44）、海豚对鲨鱼（F-37：海豚用喷水孔呼吸、没有鳃、喂奶；鲨鱼有鳃；胎生分不开它们）、蜘蛛（F-43）、蟾蜍（F-30："all toads are frogs"）、弹涂鱼（F-40）、穿山甲（F-36）。④ 看不见的特征：科学家还看用什么呼吸、怎样养育后代——海豚、穿山甲要靠这些才能放对（F-20、F-37）；这些课纲不要求记（F-4）。⑤ 保护：海豚、穿山甲、海龟在新加坡都是极危（F-36、F-37、F-39），一句。⑥ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`fix: false`）；labels pad-6a, pad-6b, pad-6c, pad-6d, pad-6e, pad-6f | A classmate sorted the same animals under six headings: insects, birds, mammals, fish, reptiles and amphibians. Seven of them are in the wrong group. / 一位同学把这些动物分到六个标题下：昆虫、鸟类、哺乳动物、鱼类、爬行动物、两栖动物。其中 7 只放错了组。 |
| 2 | `suspect: fruit-bat`；labels fruit-bat, penguin | The fruit bat is with the birds because it flies, but it has fur: it is a mammal. The penguin is with the fish because it swims, but it has feathers: it is a bird. / 果蝠会飞，被放进了鸟类，可它身上有毛，是哺乳动物。企鹅会游泳，被放进了鱼类，可它有羽毛，是鸟。 |
| 3 | `suspect: dolphin`；labels dolphin, shark | The dolphin has fins and lives in the sea, like the shark. But a dolphin breathes air through a blowhole and has no gills. It is a mammal; the shark is a fish. / 海豚和鲨鱼一样有鳍、住在海里。但海豚用头顶的喷水孔呼吸空气，没有鳃。它是哺乳动物，鲨鱼才是鱼。 |
| 4 | `suspect: spider`；labels spider, asian-toad | The spider has eight legs and two body parts, so it is not an insect. The toad's skin is dry and bumpy, but a toad is a kind of frog: an amphibian. / 蜘蛛有八条腿、身体分两部分，不是昆虫。蟾蜍的皮肤干而多疙瘩，但蟾蜍是蛙的一种，是两栖动物。 |
| 5 | `suspect: pangolin`；labels pangolin, mudskipper | The pangolin is covered in scales, but it is a mammal. The mudskipper spends time out of the water, but it is a fish. / 穿山甲全身是鳞片，却是哺乳动物。弹涂鱼常常离开水，却是鱼。 |
| 6 | `fix: true`；labels pad-6c, pad-6d, pad-x | In the right groups, the mammals now include the bat, the dolphin and the pangolin, and the spider sits apart, in none of the six groups. / 放回正确的组以后，哺乳动物里多了果蝠、海豚和穿山甲；蜘蛛单独放在一边，不属于这六类。 |

- **试一试 T5**：`vary: suspect`，`also: [fix]`，`keep: [{ en: "The classmate's tray", zh: "同学的分类盘" }]`，`observe: [verdict, belongs, wrong]`，`record: true`（表：动物 · 放对没有 · 本该在 · 放错几只）；`predict`：prompt "Press 'move to the right groups'. Where will the dolphin end up?" / "按下“放回正确的组”，海豚最后会在哪一组？"，`start: { fix: false }`，`change: { fix: true }`，`observe: where-dolphin`，options 还在 D 组（鱼类）`d` / 去 C 组（哺乳动物）`c`。
- **细看**：`Dolphin or shark`（F-37：鳃对喷水孔；有的鲨鱼胎生、有的下蛋，所以"胎生"分不开）；`A bat is not a bird`（F-35；F-59：鼯猴会滑翔，不会飞）；`All toads are frogs`（F-30 原话；蟾蜍在新加坡的状态三方说法并列）；`A fish out of water`（F-40：把海水存在鳃腔里、透过皮肤吸氧）；`A scaly mammal`（F-36）；`Guppies and mosquitoes`（F-42：被引进来灭蚊，效果有争议；`<TopicLink slug="mosquito" ch="breaking-the-cycle">`）；`Why sorts go wrong`（F-82：按住在哪里、怎么动来分；一项研究发现教过以后也不容易改）。
- **本章索引**：fruit-bat, penguin, dolphin, shark, spider, asian-toad, pangolin, mudskipper
- **名词首现**：（无新词；`gills` 并进 `fish`）

### 5.7 第 06 章 `make-a-flowchart`

- **summary**：A flowchart sorts with one yes-or-no question at a time. The order of the questions matters: start with something only one group has, such as feathers. Questions such as "can it fly?" put different kinds of animals in the same group. / 分类流程图一次问一个"是 / 不是"的问题。问题的顺序要紧：先问只有一类才有的特征，比如羽毛。"会不会飞"这样的问题，会把不同类的动物放进同一组。
- **正文提纲**：① 流程图：每个问题只有两个答案（F-70）；新加坡的练习常用流程图和打勾表（F-73）。② 两个问题、三组：A、B 是答"是"的，C 是剩下的。③ 好的第一个问题：羽毛、毛发、六条腿；不好的：会飞（鸟、蝙蝠、昆虫）、有鳞片（鱼、爬行动物、穿山甲）、有鳍（鱼、海豚）（T6）。④ **打勾表**（静态 MDX 表，从 §3.4 生成）：10 只动物 × 6 个特征（六条腿、羽毛、毛发、鳍、鳞片、皮肤湿润），表下一句"每一列就是流程图里的一个问题"。⑤ 给组起标题：流程图卡的叶子就是标题（F-15）。⑥ 自己给别人做一个（F-71）；爱护生物（课纲 VEA）。⑦ 试一试。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（`first: feathers`, `second: hair`）；labels pad-3a, pad-3b, pad-3c | This flowchart asks two questions. "Feathers?" sends the birds to group A; then "hair or fur?" sends the squirrel and the bat to group B. The rest wait in group C. / 这张流程图问两个问题。"有羽毛吗？"把鸟送进 A 组；接着"有毛发吗？"把松鼠和果蝠送进 B 组。其余的在 C 组等着。 |
| 2 | `first: can-fly`, `second: hair`；labels pad-3a, fruit-bat, beetle, javan-myna | Asking "can it fly?" first puts a bird, a bat and two insects together in group A: three kinds of animal in one group. / 先问"会飞吗？"，A 组里就有一只鸟、一只蝙蝠和两只昆虫：三类动物混在一组。 |
| 3 | `first: scales`, `second: hair`；labels pad-3a, pangolin, house-gecko, snakehead | "Scales?" first mixes fish, reptiles and the pangolin, which is a mammal. / 先问"有鳞片吗？"，鱼、爬行动物和属于哺乳动物的穿山甲就混在了一起。 |
| 4 | `first: six-legs`, `second: feathers`；labels pad-3a, pad-3b | "Six legs?", then "feathers?": groups A and B each hold one kind of animal. A good first question picks out something only one group has. / 先问"六条腿吗？"，再问"有羽毛吗？"：A、B 两组各只有一类动物。好的第一个问题，问的是只有一类才有的特征。 |
| 5 | 同上；camera 拍内（盘与盒同框）；labels pad-3c | Group C still holds fourteen: thirteen animals of four kinds, and a spider. More questions, one at a time, would sort them too. / C 组里还有 14 只：四类动物共 13 只，加一只蜘蛛。再一个一个地问下去，它们也能分开。 |

  第 5 拍的件数照模型：`six-legs` + `feathers` 时 C = 14（松鼠、果蝠、海豚、穿山甲、斑鱼、孔雀鱼、弹涂鱼、鲨鱼、树蛙、蟾蜍、壁虎、蟒蛇、海龟：哺乳、鱼、两栖、爬行四类 13 只；+ 蜘蛛）；单测钉住字幕里的数。
- **试一试 T6**：`vary: first`，`also: [second]`，`keep: [{ en: "The same eighteen animals", zh: "同样的 18 只动物" }]`，`observe: [kinds-a, kinds-b, count-c]`，`record: { chart: { y: kinds-a } }`（条形图：第一个问题 → A 组里几类）；`predict`：prompt "Change the first question from 'feathers?' to 'can it fly?'. How many kinds of animal will group A hold?" / "把第一个问题从“有羽毛吗”换成“会飞吗”，A 组里会有几类动物？"，`start: { first: feathers, second: hair }`，`change: { first: can-fly }`，`observe: kinds-a`，options 还是一类 `same` / 不止一类 `more`。
- **细看**：`Tables and flowcharts`（F-73：新加坡练习的两种写法；"给两组选标题"）；`What a key is`（F-70、F-72、F-74：英格兰的小学叫它 classification key，中文叫检索表；每个问题只有两个答案）；`Make one for someone else`（F-71）；`Care for living things`（课纲 VEA：看、拍照、画下来，不捉；放回原处）。
- **本章索引**：pad-3a, pad-3b, pad-3c, javan-myna, fruit-bat, beetle, pangolin, house-gecko, snakehead
- **名词首现**：key（标"扩展"，`see: flowchart`）、tick-table（并进 `flowchart` 的定义）。

### 5.8 拍数与配图

- 拍数：00 四、01 六、02 六、03 六、04 六、05 六、06 五 = **39 拍**。（技能建议每章 3–5 拍；01–05 各 6 拍是因为每拍对应一个问题或一只动物，画面各不相同。B 步若觉得长，可把 01 第 6 拍并进第 5 拍、05 第 4–5 拍合成一拍。）
- 配图位置：`living-things-plant-fungus` 第 03 章 ③ 段后；`living-things-animal-groups` 第 04 章 ① 段后。封面只在首页。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（20 个候选，目标 15–17 个，正文用不到的删）

中文：研究 §5（香港教育局英汉科学词汇繁转简 S69、中文维基 zh-sg S70；**都不是新加坡课室的证据**）；"分类流程图""打勾表""菌落"是编辑用词，施工时在 `glossary.json` 的 `note` 写明来历，并等 Gavin 过目（§0.1）。

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `living-thing` | living thing (organism) / 生物 | 需要水、食物、空气；会生长、反应、繁殖（F-1、F-9） | characteristic |
| `non-living-thing` | non-living thing / 非生物 | 没有生命的东西；不生长、不繁殖 | living-thing |
| `characteristic` | characteristic / 特征 | 一类东西共同的样子或本领；生物的特征：生长、反应、繁殖…… | classify |
| `classify` | classify / 分类 | 按共同的特征把东西分组（F-6） | flowchart |
| `plant` | plant / 植物 | 绿色，自己制造食物 | flowering-plant |
| `animal` | animal / 动物 | 吃进食物；本主题分六类 | mammal |
| `flowering-plant` | flowering plant / 开花植物 | 会开花、结果、结种子的植物；不是一直有花 | non-flowering-plant |
| `non-flowering-plant` | non-flowering plant / 不开花植物 | 从来不开花的植物，如蕨、苔藓；也是绿色的 | spore |
| `fungus` | fungus (fungi) / 真菌 | 蘑菇、霉菌、酵母；不是植物，不能自己制造食物 | mould, yeast |
| `mould` | mould / 霉菌 | 长成毛茸茸一片的真菌，如面包上的霉（"霉菌"不是分类学的名称，S70） | fungus |
| `yeast` | yeast / 酵母 | 由单个小细胞组成的真菌，靠出芽繁殖（F-53） | fungus |
| `bacteria` | bacteria (bacterium) / 细菌 | 一个小到看不见的生物；有益有害都有 | colony |
| `colony` | colony / 菌落（扩展） | 一大群细菌长在一起，看得见的一团 | bacteria |
| `mammal` | mammal / 哺乳动物 | 有毛发，喂幼仔吃奶；人也是 | animal |
| `bird` | bird / 鸟类 | 有羽毛、喙、两只翅膀、两条腿 | animal |
| `fish` | fish / 鱼类 | 有鳍、鳞片，用鳃呼吸 | animal |
| `amphibian` | amphibian / 两栖动物 | 皮肤通常湿润、没有鳞片；蛙、蟾蜍 | animal |
| `reptile` | reptile / 爬行动物 | 皮肤干、有鳞片；蜥蜴、蛇、龟 | animal |
| `insect` | insect / 昆虫 | 六条腿、身体分三部分、两根触角 | animal |
| `flowchart` | flowchart / 分类流程图 | 一次问一个"是 / 不是"的问题来分组；同样的问题也可以写成打勾表 | key |
| `key` | classification key / 检索表（扩展） | 英格兰小学和中文里对分类用的问题表的叫法 | flowchart |
| `spore` | spore / 孢子（扩展，P5） | 蕨、苔藓等用来繁殖的很小的细胞 | non-flowering-plant |

**物种名**（零件 `name` 与 `detail` 第一句；正文用通用类名，D10）：SBO 核到的照用——黑眶蟾蜍、疣尾蜥虎、大蕉松鼠、马来穿山甲、许氏齿弹涂鱼、林八哥、孔雀鱼（S8、S13、S15、S19、S72、S73、S32）；其余是通用中文名、**新加坡未核**，等 Gavin：斑鳢（斑鱼 / 生鱼）、短耳犬蝠、斑腿泛树蛙（四线树蛙）、网纹蟒、玳瑁、龙船花、木麻黄、鸟巢蕨、鹿角蕨；**海豚的中文名**（中华白海豚 / 印度太平洋驼背豚）研究说命名有争议（未核），在 §0.1 第 1 条。

### 6.2 来源（施工时进 `sources.json`；访问日期一律 2026-10-21）

**编号**：沿用研究的 S#（S1 = 课纲 … S74），不重新编号；**设计研究来源用研究的空号 S59**（脚手架生成的 S1 设计研究条目改成 S59，S1 换成课纲）；待核的新来源从 **S75** 起；没用上的研究来源写进 `SOURCES.md` 的空号说明（研究本身就跳过了 S43、S60–S63）。只读到摘要或转述的照研究的 `note` 写（S57 是博客转述展览；S42、S70 是维基摘要，只用于定义）。

| S# | 内容 | 用于 |
|---|---|---|
| S1 | MOE CPDD，*Science Teaching & Learning Syllabus Primary Three to Six, Standard / Foundation*（2023 Primary Three Cohort 起实施，封面 Updated Jan 2026），https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf（第 12、20、38、42、43、68、82–83 页） | §1.1、F-1–F-9 |
| S2–S5 | Geniebook，Primary 3 Science：Diversity of Animals / Diversity of Plants / Fungi & Bacteria / Living and Non-Living Things（商业补习讲义） | F-10、F-11、F-15、F-20–F-28、F-73 |
| S6–S8 | 黑眶蟾蜍：BSG（2026-05-29）、FFW（2024-01-29 记录）、SBO | F-30 |
| S9、S73 | 林八哥：BSG、SBO | F-32 |
| S12、S13 | 疣尾蜥虎：FFW、SBO | F-33、F-97 |
| S14、S15 | 大蕉松鼠：BSG、SBO | F-14、F-34 |
| S16、S17 | 短耳犬蝠：BSG、SBO | F-35 |
| S18、S19 | 马来穿山甲：BSG、SBO | F-36 |
| S20 | 鼯猴：BSG | F-59 |
| S21 | 印度太平洋驼背豚：FFW | F-37 |
| S22、S23 | Ocean Conservancy、BBC Discover Wildlife：海豚与鲨鱼的区别 | F-37、F-93、F-96 |
| S24、S25 | 多纹南蜥：BSG、SBO | F-56 |
| S27 | 网纹蟒：BSG | F-38 |
| S28 | 玳瑁：BSG | F-39、F-94 |
| S29、S72 | 许氏齿弹涂鱼：BSG、SBO | F-40 |
| S30 | 斑鳢：BSG | F-41 |
| S31、S32 | 孔雀鱼：Ecology Asia、SBO | F-42 |
| S33 | 海龙：BSG | F-57 |
| S34、S35 | 斑腿泛树蛙：BSG、FFW | F-31 |
| S36 | 温室蛙：BSG | F-55 |
| S40 | Singapore 101：Spiders | F-43 |
| S41 | Australian Museum：What is a monotreme? | F-58 |
| S42 | 维基摘要（Penguin、Bat、Mushroom、Fungus、Yeast、Mold、Bacteria……） | F-35、F-44、F-52、F-53、F-99 |
| S45 | 雨树：BSG | F-28、F-49 |
| S46 | 龙船花栽培种：BSG | F-45 |
| S47 | 木麻黄：FFW | F-46、F-100 |
| S48 | 苏铁：FFW | F-50 |
| S49、S50 | 鸟巢蕨：FFW、BSG | F-47、F-101 |
| S51 | 鹿角蕨：BSG | F-48、F-101 |
| S55、S56 | SBO 多孔菌目；J. Fungi 2023 新加坡行道树木腐菌调查 | F-51 |
| S57 | Little Day Out：植物园真菌展览（博客，weak） | F-54 |
| S58 | NParks 植物园 Funtastical World of Fungi 活动页 | F-52 |
| **S59** | **本设计研究**：标本是模型、不按比例；§3.4 特征表（哪件标本有哪些看得见的特征，依据 §2.4 的来源与模型外形）；问题的措辞与流程图的顺序（D4，研究 §3.4 的草案）；§2.8 的全部分组与件数（模型算出） | 规格行、PLATE、卡片、流程图卡、字幕里的件数、细看 |
| S64 | 英格兰 DfE，National curriculum in England: science programmes of study | F-13、F-72 |
| S65 | Natural Resources Wales，Activity plan: Characteristics of life and classification | F-12、F-70、F-71 |
| S66 | Yorek, Şahin & Aydın 2009，*Eurasia J. Math. Sci. Tech. Ed.* 5(4): 369–378 | F-80–F-82 |
| S67 | Goldberg & Thompson-Schill 2009，*Psychological Science* 20(4): 480–487 | F-83 |
| S68 | Bulunuz, Jarrett & Bulunuz 2008，*Turkish Science Education* 5(3): 32–46 | F-84 |
| S69 | 香港教育局，*English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S.1–3)*（2017） | §6.1 |
| S70 | 中文维基（zh-sg 变体）：生物、两栖动物、苔藓植物、生物检索表…… | F-74、§6.1、苔藓的说明 |
| S71 | 本仓库的 `grasshopper`、`mosquito`、`plant` 主题 | 蝗虫、辣椒幼苗的几何与链接 |
| S75 起 | 待核（§2.7）：菌落（F-90）、细胞大小（F-91、F-92）、海豚的鳍（F-93）、海龟（F-94）、穿山甲的毛（F-95）、鲨鱼的鳞（F-96）、人是哺乳动物（F-98）、企鹅的分布（F-99）、甲虫（F-102） | §2.7 |

**不用**（研究已标出）：S10、S11（家八哥，自相矛盾）、S38（斑姬地鸠，学名印错）、S26（变色树蜥）、S39（金斑蝶：改用甲虫，免得讲"前腿退化"）、S44（鸡骨常山 / Tembusu）、S52（芒萁）、S53（卷柏）、S54（裂褶菌未定种）。

---

## 7. 图像清单（只用已审草稿，不出新图）

`art/planned/living-things/` 的三张草稿都已看过（2026-10-21）：石墨铅笔画、灰度、透明底、无文字、无数字、无人物。**图只当插画，不当事实依据**；入库时主会话逐张再看一遍下面的核对点。

| 草稿 | 看到的 | 决定 | 入库为 |
|---|---|---|---|
| `living-things.png`（1024²） | 一只浅椭圆盆，泥土和树皮上长着一株开花植物（三朵花、几个花苞）、一丛蕨、一朵小蘑菇；一只蝴蝶停在花上 | **封面**：开花植物、不开花植物、真菌、昆虫四样都在，正好是本主题的四个大类里的三个加一类动物；和 `plant`（辣椒）封面不重 | `public/illustrations/living-things.webp` |
| `living-things-plant-fungus.png`（1536 × 1152） | 左：盆栽开花植物（一朵开着、四个花苞）；中：盆栽蕨，有一个卷着的嫩叶；右：长在朽木上的蘑菇（菌盖、菌褶、菌环） | **配图 1**，第 03 章 ③ 段后。图注 EN "A flowering plant, a fern and a mushroom. Only the first two are plants." / ZH "一株开花植物、一丛蕨、一朵蘑菇。只有前两样是植物。" | `public/illustrations/figures/living-things-plant-fungus.webp` |
| `living-things-animal-groups.png`（1536 × 1152） | 左：一只蛙（有鼓膜、斑点）；中：一条鱼（鳞、背鳍、胸鳍、鳃盖）；右：一只凤蝶（三段身体、棒状触角、几条腿） | **配图 2**，第 04 章 ① 段后。图注 EN "A frog, a fish and a butterfly: an amphibian, a fish and an insect." / ZH "一只蛙、一条鱼、一只蝴蝶：两栖动物、鱼类、昆虫。" | `public/illustrations/figures/living-things-animal-groups.webp` |

- **核对点**（主会话入库前）：三张都无文字、无水印；图注**不点物种**、不提腿的数目（画里的蝴蝶腿数不好数，正文的"六条腿"由 3D 模型的蝗虫和甲虫讲）；画里的鱼、蝴蝶、开花植物不是新加坡的种，图注只写类名；封面没有图注。
- 转换：`png` → `webp`（同已发布主题的做法，用仓库现有的转换脚本或 `sharp` 已有依赖；不加依赖）。`art/planned/living-things/` 的原稿保留。
- **缺的图（不补）**：细菌 / 酵母、"分错了的动物"、生物与非生物——这三处都由 3D 模型和显微镜台座讲。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；**不用 Codex**；本主题不需要新依赖；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

分工原则：**Opus** 做引擎、几何与视觉、内容决定（拍、镜头、标注、`sim.set`）、中文、事实与代码的审查；**Sonnet** 起草英文（正文、字幕、零件说明、名词、来源）、读原文核事实（§2.7 待核）、截图 QA；**Haiku** 做机械检查（脚本能判的一致性）。

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 §3.1 Diversity 第一行改成"→ docs/38，S"、docs/README 加一行；`docs/review-queue.md` 加 §0.1 的中文术语一项 | 主会话 | docs/38、docs/17、docs/README、review-queue | — | 0.2 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts living-things --engine space-scene --subject science --title-en "Classifying Living Things" --title-zh "生物的分类"`；把 S1 设计研究条目改成 S59；R1–R11 参考图下到 `scripts/geo/living-things/refs/`、逐张记许可 | 主会话（参考图交 Sonnet：只下载 CC / 公有领域、写许可清单） | 主题目录、refs | validate 绿；参考图逐张看过 | 0.5 天 |
| E | E-LT1–E-LT3（+ E-LT5）+ 夹具 `sample-sort` + 测试 + docs/06 三节 | Opus 引擎（一个代理） | §4.7；**不碰** `src/content/topics/living-things/` | §4.8 全勾 | 3.5 天 |
| E4 | E-LT4 两种表面（与 E 并行） | Opus 引擎（第二个代理，可选） | `textures.ts`、`materials.ts`、`presets.ts`、`schema.ts` 的材质族枚举（与 E 约定：E 不碰这四个文件里的材质部分） | 单测 + 已有生物主题截图不回归 | 0.5 天 |
| D1a | 标本几何：非生物、植物、真菌、细菌、显微镜下（#1–#14 + 2 + 显微镜），以及 context、毡垫、预设、views、spec、telemetry | Opus 内容（几何），**与 E、D1b 并行** | `scripts/geo/living-things/build-parts.ts`（总装，D1a 拥有）、`scripts/geo/living-things/specimens/{non-living,plants,fungi-bacteria,lab}.ts` | `build-parts` 生成 `parts.json`，validate 0 error | 1.5 天 |
| D1b | 标本几何：动物（#15–#32）；蝗虫从 `grasshopper` 抄、缩到一格 | Opus 内容（几何），与 D1a 并行 | `scripts/geo/living-things/specimens/animals.ts`（只这一个文件） | 同上；每件 ≤ 0.07 m 见方、槽数照 §3.2 | 2 天 |
| D1c | 特征表与 `sort` 数据（§3.4、§4.2 的 `sort` 段、托盘、布局、同学的摆法）；章节 frontmatter（state、拍、index；`sim` 段等 E 合并后接） | Opus 内容 | `scripts/geo/living-things/sort-data.ts`、`chapters/*.mdx` frontmatter | 单测：`sort-data` 跑出 §2.8 全表 | 0.5 天 |
| D2 | R2 几何两轮（并排参考图：剪影、腿数、尾鳍方向、鳞与毛）→ R3 材质（paper / cinema 下毛、羽、鳞、湿皮可分；`holder-*` 组色可分）；E 合并后接 `sim` 与绑定 | Opus 内容（视觉） | 同上 + `docs/screenshots/living-things/` | 每轮 `pnpm shoot living-things` 截图自证；calls / 三角形在 §3.2 预算内；Tier-1 清单逐项 | 2 天 |
| T1 | 待核 F-90–F-103 逐条读原文落定（核不到按退路改 spec 与数据，记 §9）；§2.4 各条复读原文、照研究的摘录对号；`sources.json`（S1–S74 沿用、S59 设计研究、S75 起新来源） | Sonnet（事实核查）→ Opus 审 | `sources.json`、`SOURCES.md` | 事实表与来源一一对应；`pnpm tsx scripts/sources-md.ts living-things` | 1 天 |
| T2 | 英文草稿：零件 `summary` / `detail`、七章正文与细看、名词定义、39 条字幕 EN（照 §5 的提纲与草稿，字幕说"这一拍模型上显示什么"） | Sonnet 起草 → Opus 逐句核对（事实、口吻、和画面对得上） | `parts.json` 文本字段（经 `scripts/geo/living-things/text.ts`）、`chapters/*.mdx` 正文 EN、`glossary.json` EN | `writing-rules.md`；无"所有鱼 / 所有爬行动物"等禁句 | 1.5 天 |
| T3 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（新加坡用法 §1.6、§6.1；中文独立成文；术语按 §0.1 的现行选择，Gavin 改了再统一替换） | Opus | 同上 ZH 字段 | 用词与名词表一致；引号只用"“ ”" | 1 天 |
| I | 三张图转 webp 入库，按 §7 的核对点再看一遍 | 主会话 | `public/illustrations/` | §7 核对点 | 0.1 天 |
| B | 39 拍定稿：镜头、标注、`sim.set`、字幕 EN / ZH 与画面一致 | Opus（拍的决定）+ Sonnet（字幕润色） | `state.beats` | `--beats` 0 失败、无漏标、`shift` 核对 0 失败、四种组合 | 1 天 |
| M | 机械检查（每次 T / B 之后跑一遍，结果交主会话） | Haiku | 只读；报告 | ① 第 06 章打勾表 = §3.4 特征表；② 字幕、正文、细看里每个件数 = §2.8；③ 每个 `<TopicLink>` 的主题与章存在；④ 每个 `<Term>` 的 id 在 `glossary.json`；⑤ 中文引号只用"“ ”"、无英文引号；⑥ 禁句 grep（"all fish""all reptiles""所有鱼""所有爬行动物""课纲不要求记住"之外的"不要求"、"movement is a characteristic"、"会动是生物的特征"）；⑦ 每个 `detail` 的事实带 `[S#]`；⑧ 物种名的中文与 §6.1 一致 | 每轮 0.1 天 |
| P | HUD 排版、手机、模式组合、截图 QA（四种组合逐拍看）；事实与代码审计；三个已发布主题的回链（主会话改） | Sonnet 截图 QA；Opus 审查（事实、代码、视觉问题回 D2） | — | §8.2 全勾 | 1 天 |

- 合计：引擎约 4 天（E 3.5 + E4 0.5，与 D1 并行）；内容约 10 天。
- **同一时间只有一个代理写同一个文件**：`parts.json` 由 `build-parts.ts` 生成，D1a 拥有总装脚本，D1b 只拥有 `specimens/animals.ts`，D1c 只拥有 `sort-data.ts`；文本字段在 `text.ts`，T2 / T3 依次拥有；拍只在 B 步写。
- **样章**：第 05 章（同学的分类盘 + T5 + 流程图卡的 ✗）先做完给 Gavin 看——最能检验 `shift`、流程图卡、动物标本在两套主题下的可读性和"分错了"这种讲法。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：第 38 页两条 Core Ideas 在 01（特征）、02–04（大类）；两条 Practices：观察生物与非生物（01、T1）、按看得见的特征分植物和动物（03、04、06）；两条 VEA 在 00、06 细看；Note（不要求记名字和胎生）在 00 细看，且正文没有要求记物种名的句子。
- [ ] **措辞**：无"会动是生物的特征"；无"所有鱼 / 所有哺乳动物 / 所有爬行动物 / 所有两栖动物……"的全称说法（"大多数"可以）；无"蘑菇是植物"的肯定说法；无"霉菌看不见"；不开花植物在主线不定义为"用孢子繁殖"；黑眶蟾蜍不写"本地"或"外来"的单方说法；孔雀鱼、林八哥写"外来"；没有"小朋友"、感叹号、问句标题。
- [ ] **必须讲对的十三处**（D5）各有一拍或一段正文；误解目录 M-1–M-14 每条在指定位置给出正确说法；标"假设"的没有写成研究结论。
- [ ] **件数一致**：卡片、PLATE、流程图卡、字幕、正文、细看里同一个数同值（§2.8 全表）；单测 `tests/space-scene/living-things-topic.test.ts`：每条字幕里的件数 = 该拍设置下模型的输出；第 06 章打勾表 = 特征表；每件标本的特征 = §3.4；`classmate` 放错 7 只、放回后 0；`where-*` 的四个先猜后看揭晓的值 = §2.8。
- [ ] **移位**：`pnpm shoot --beats` 每拍 `shift` 核对 0 失败；换问题时标本按拱形移动、错开；不在本章托盘的标本不画、不标注、不在索引；深链接直接终值。
- [ ] **试一试**：01–06 六章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；T2、T4 折线图、T6 条形图；六个先猜后看不判对错、中英文都对。
- [ ] **流程图卡**：四种键的版式都对；还没问到的问题是虚线；选中标本时路径描 signal；第 05 章放错的组有 ✗ 和文字（不只靠颜色）；叶子 44 px、可键盘操作；< 1024 px 收进卡片；读屏文字通顺。
- [ ] **两种比例不同框**：显微镜台座只在 00 第 4 拍、02 第 5 拍出现，那两拍 `layers` 只有 `magnified`；有比例尺时数对（F-91、F-92），没有核到就没有比例尺。
- [ ] **写实**：Tier-1（§3.2 表 B）逐项对；hero-clean 不认识这个主题的人能说出"一盒动植物的模型和一只分类盘"；蜘蛛的 8 条腿、甲虫和蝗虫的 6 条腿在 `back-row` 镜头里数得清；海豚的尾鳍水平、鲨鱼的竖直；毛、羽毛、鳞片、湿皮在 paper 与 cinema 下都分得开（E-LT4 没做时按 §4.5 的退路验收，§9 记录）；无品牌、无字、无人与手。
- [ ] **来源**：每个物种的状态、特征都能对到 §2.4 的 R: 条目；待核 F-90–F-103 每条有结论（核到 / 按退路改），记 §9；`SOURCES.md` 的空号说明。
- [ ] **链接**：`<TopicLink>` 到 `grasshopper`（`whole-animal`）、`mosquito`（`the-adult`、`before-you-start`、`breaking-the-cycle`）、`plant`（`the-whole-plant`、`flowers-and-pollination`、`fruits-and-seeds`、`seed-to-plant`）、`digestive-system`（`large-intestine-chapter`）全部通过 validate；三个主题的回链（主会话）。
- [ ] **性能**：全部 32 件在盒里 ≤ 85 calls；有分类盘的章 ≤ 65；显微镜拍 ≤ 20；三角形 < 0.5 M；模型一次求值 < 0.2 ms；`shift` 动画期间每帧 < 0.5 ms CPU。超过时在 §9 写明哪些零件、为什么不并。
- [ ] **手机 390 × 844**：试一试卡片与流程图在抽屉里可用，按钮 ≥ 44 px；`tray-view` 里标本看得清是什么。
- [ ] 首页图 + 2 张配图按 §7 核对。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot living-things --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

（空）
