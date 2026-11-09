# 71 编辑核对：课纲与课本用语、三项待定决策（2026-11-05）

分支 `claude/b2-editorial`。Gavin 2026-11-05：“根据自己的判断来吧”“重点核对新加坡课本的措辞，争取和教案一致”。

## 一、依据

| 代号 | 来源 | 怎么读的 |
|---|---|---|
| SCI | MOE《Primary Science Syllabus 2023》（2024 年 5 月版），https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf | 2026-11-05 下载 PDF 抽文本，逐条对照第 37–80 页学习结果 |
| MATH | MOE《2021 Primary Mathematics Syllabus P1–P6》（2025 年 10 月更新），https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 同上，第 31 页起各年级内容 |
| SS | MOE《2020 Social Studies Primary Teaching and Learning Syllabus》，https://www.moe.gov.sg/media/files/primary/d8ea4817-c1b3-4217-84d4-82838d39d75c.pdf | 同上，第 23–41 页 |
| TB-2A / TB-3B | MOE 课程规划与发展司编、Star Publishing 出版的 *Primary Mathematics Textbook 2A*、*3B*（2022 年初版，2021 课纲用书） | 研究目录 `art/codex-research/measuring/sources/` 里的 PDF（2026-10-19 存档，不进 git），抽文本检索 |

SEAB 没有另外的小学术语表；MOE 和 SEAB 都没有公开的小学科学、数学中文术语标准（与 2026-10-19 测量研究的结论相同）。所以中文按任务说明：有新加坡华文用法的用新加坡用法，没有的用内地中小学课本的通行词。

## 二、术语改动（旧 → 新）

### 数学

| 主题 | 位置 | 旧 | 新 | 依据 |
|---|---|---|---|---|
| telling-time | `data/lesson.json` `notation` | `h.mm am`、`HHMM`（7.20 am、1920） | `h:mm am`、`HH MM`（7:20 am、19 20） | TB-2A 第 157 页起“9:05 am”“4:20 pm”“12:53 pm”；TB-3B“7:50 am”“8:00 am”，24 时制“08 00 … zero eight hundred hours”“14 30 … fourteen thirty hours”“23 00”“00 00”。MATH P1 2.2 写 ‘am’ ‘pm’（不带点）。引擎早已支持这两种写法，只改设置 |
| telling-time | 00 章说明（EN/ZH） | “7.20 am with a dot … four digits, such as 1920” | “7:20 am with a colon … four digits with a space, such as 19 20” | 同上 |
| telling-time | 01–05 章正文里手打的钟面读数 | 3.00、3.30、3.40、3.45、7.25、7.28、7.05、7.00、4.30、5.00 | 3:00、3:30 …（冒号） | 同上，与钟面 `<Time as="face">` 的新写法一致 |
| telling-time | 10 章摘要 | 0000、2359 | 00 00、23 59 | 同上 |
| telling-time | `docs/20` D5/D6 | — | 加了 2026-11-05 改动说明 | — |
| decimals | `glossary.json` regroup | regroup (also called trading) | regroup (also called renaming) | MATH P1 “without renaming”；TB-2A“Rename 1 ten as 10 ones”。与乘除法主题的写法一致 |
| fractions | 12 章正文 + `glossary.json` | “improper fraction”无词条；“Its top number is greater than or equal to its bottom number” | 新词条 improper fraction / 假分数；“Its numerator is greater than or equal to its denominator” | MATH P4 Fractions 1.1 “mixed numbers, improper fractions and their relationship”；其他各章都已在“top number”后点出 numerator，12 章是唯一没点的 |
| states-of-matter | `glossary.json` | Take up space | Occupy space (take up space) | SCI P4 Matter：“matter is anything that has mass and occupies space” |

### 科学（中文）

| 主题 | 旧 | 新 | 依据 |
|---|---|---|---|
| mosquito、grasshopper、living-things、frog-and-chicken、flower-and-seed、sample-life-cycle，以及全站 UI 字串 `space.card.cycle`、`space.try.cycle`、`space.cycle.summary` | 生活史 | 生命周期（蛙与鸡 00 章首次出现处写“生命周期（也叫生活史）”） | 内地小学科学通用“生命周期”（如“动物的生命周期”“植物的生命周期”）；frog-and-chicken 已收的香港教育局《科学（小一至小六）课程指引》（2025）也用“生命周期”。“生活史”是大学生物学用语（台湾小学也用）。新加坡华文用法未找到。来源题名（sources.json、SOURCES.md）里的“生活史”是来源原文，没改 |
| coral-reef、mangrove-food-web、dinosaur-earth、living-things | 生境 | 栖息地 | 内地中小学生物、科学教材通用“栖息地”；“生境”是生态学术语。对应 SCI P6 “different habitats support different communities” |
| circuits（词条、02 章、电路状态读数） | 开路（断路） | 断路（开路） | 内地初中物理（人教版九年级“通路、断路、短路”）与小学科学都用“断路” |

### 人名（社会、历史）

| 主题 | 旧 | 新 | 依据 |
|---|---|---|---|
| singapore-1819-1965（09、11 章，events.json） | 尤索夫·伊萨、奥斯曼·渥 | 尤索夫伊萨、奥斯曼渥 | 新加坡华文写马来人名不加间隔号：《联合早报》写“奥斯曼渥”“尤索夫伊萨”，ISEAS 的中文名是“尤索夫伊萨东南亚研究院”。singapore-after-1965 已是这种写法，现在两个主题一致。sources.json 里引用的来源题名照原样 |

### 测试随改

`tests/schemas.test.ts`（分数词条数 12 → 13）、`tests/math-scene/telling-time-lesson.test.ts`（写法设置）、`tests/space-scene/cycle-card.test.ts` 与 fixture、`tests-e2e/telling-time.spec.ts`（3:45、3:15 pm = 15 15）、`tests-e2e/mosquito.spec.ts`、`tests-e2e/sample-life-cycle.spec.ts`（生命周期）。

## 三、§三“课本核对”逐条结论

| 条目 | 结论 | 依据 |
|---|---|---|
| 4 × 3 读作“4 groups of 3” | 对，不改 | TB-2A：“3 groups of 4 = 12”“3 × 4 = 12”；乘法表“2 × 5 = 10”按“几组几个”排 |
| 时间写成“7.20 am”和“1920” | **改了**，见上表 | TB-2A、TB-3B |
| 小数读作“zero point three five”；一位小数四舍五入写“3.0” | 不改，待翻 P4 课本 | 手边的 2A、3B 不含小数；MATH P4 只写“rounding decimals to 1 decimal place”。“3.0”保留末尾 0 是通行做法（练习题选项里有“8.0”），读法没找到课本页 |
| 面积课用 length / breadth | 对，不改 | MATH 第 12 页：“area = length × breadth” |
| 长度章也说“Each small part stands for” | 对，不改 | TB-2A：“Each small part stands for 10 g”；量的读数 01、02、04 章已用 |
| 千克还是公斤 | 不改（正文千克，词表注公斤） | 新加坡日常与医疗华文多用公斤；数学课本无中文版，内地课本用千克。见“需要 Gavin 确认” |

## 四、按课纲核对过、不用改的

- **科学**：力（push / pull、stationary、gravitational / frictional / elastic spring / magnetic force、weight）、磁（magnetic / non-magnetic material、like / unlike poles、freely suspended、stroke / electrical method）、电路（electrical system、closed circuit、series / parallel、electrical conductor / insulator）、材料（strength、flexibility、float / sink、waterproof、transparency）、物质三态（solid / liquid / gas、mass、volume）、水（evaporation、condensation、water vapour；melting / freezing / boiling 未单列词条）、热（good / poor conductor of heat、expansion / contraction、temperature）、能量转换（六种能量形式与课纲一字不差）、光与影（light source、reflect、shadow、screen；transparent 等三词课纲注明“不要求”，本题只在词表出现）、生物分类（flowering / non-flowering、六类动物、fungi、bacteria）、消化（mouth、gullet、stomach、small / large intestine）、心与肺（nose、windpipe、lungs、heart、blood、blood vessels、air 的四种成分、life processes）、植物（water-carrying / food-carrying tubes）、花与种子（pollination、fertilisation、seed dispersal、germination、spores、sperm、egg）、红树林与珊瑚礁（organism、population、community、habitat、producer / consumer / decomposer、predator / prey、food chain / food web、adaptation）、蛙与鸡（life cycle、fertilisation）、细胞（cell 为 basic unit of life）。
- **数学**：分数（numerator / denominator、unit / like / unlike / related fractions、equivalent fractions、simplest form、mixed number）、小数（decimal places、round off）、乘除（multiplication table、quotient、remainder）、面积与周长（square unit、cm²、m²、rectilinear figure、composite figure）、展开图（3D shapes / solids、net、cube、cuboid、prism、pyramid、cone、cylinder、sphere）、时间（duration、starting / finishing time、24-hour clock）、量的读数（compound units、volume of liquid）。
- **社会**：古文明的“五个特征”（government、writing、cities with public buildings、the arts, crafts and sciences、economic activities）、civilisation、legacy；新加坡主题的 self-government、merger、National Service、NSman、National Symbols、Racial Harmony Day；东南亚的 ASEAN、region。

## 五、三项决策

### 1. 郑和：旧港之战保留 `battle`

- **结论**：不改类型，`evt-old-port-1407` 仍是 `kind: battle`，详情卡照旧显示攻守双方、“进攻方胜”和伤亡图。
- **理由**：
  - 这是一场武装交战，不是外交事件。韦德（S2，第 14 页）转引明实录：明军报告杀 5,000 人，焚船 10 艘、获船 7 艘。
  - 全站对武装交战都用 battle（ww2、春秋战国等）。改成 political 会把明军用兵写得比其他各方轻，与“各方用同一套写法”的规则相反。
  - 伤亡卡上的数字已标明是“明方记录”，正文和详情也写了没有独立统计。卡片冷硬，是因为事件本身就是这样，不是写法带了立场。
- **没改、记下的**：
  - 1411 年锡兰之战、1415 年苏门答剌之事仍是 political。两条都没有伤亡数，叙述重心在被押走的人，暂不改。
  - 陈祖义的结局：S2 只写“被俘押回”。《明史·郑和传》写“戮于都市”，但这本书不在本题来源里，所以没有加。

### 2. 太空竞赛：加涅杰林事故和邦达连科之死

- **结论**：04 章（损失与重新验证）阿波罗 1 号的细看后面，加了一个 EN/ZH 对等的细看“地面上的其他死亡 / Other deaths on the ground”。
- **内容**：
  - **涅杰林事故**：1960 年 10 月 24 日，R-16 导弹在拜科努尔发射台爆炸。苏联记录发射台上 74 人死亡，涅杰林元帅在内，之后还有伤者不治。俄罗斯航天局说确切人数难以查清，引用 126 人。
  - **邦达连科之死**：1961 年 3 月 23 日，24 岁的邦达连科在莫斯科富氧试验舱起火后去世。
  - **公开时间**：苏联当时没有公开这些死亡；邦达连科的死 1986 年才见报，导弹爆炸 1989 年才公开讲述。
  - **美方对等**：同一时期 4 名美国宇航员死于 T-38 教练机坠毁，弗里曼 1964 年，西和巴西特 1966 年，威廉斯 1967 年。
  - **与“七人”的关系**：本主题后面的“7 名乘员”只算三次飞船事故，不含这些死亡。
- **理由**：
  - 阿波罗 1 号已经写了，它是地面测试中的死亡。邦达连科同样死于地面试验中的富氧火灾，按“同等对待”应当写。
  - 加了邦达连科这样的训练期死亡，也就要写美国宇航员的训练期死亡，所以两边一起写。
  - 苏联隐瞒是有日期的事实，平铺直叙写出，不加评价。
  - 不改“7 人”小计，免得口径变来变去；改为在细看里说明口径。
- **来源（新加 S48–S52）**：
  - S48：Anatoly Zak, RussianSpaceWeb, *Nedelin's disaster*（官方 74 人、1960 年公报谎称空难、1989 年《星火》首次公开）。
  - S49：法新社 2010 年报道，俄罗斯航天局引用切尔托克的 126 人，并说范围在 60 到 150 人之间。
  - S50：Siddiqi, *Challenge to Apollo*（NASA SP-2000-4408）第 266 页，邦达连科与 1986 年《消息报》。页码转引自维基百科，原书没有翻。
  - S51：NASA，*Remembering Elliot See and Charles Bassett*。
  - S52：NASA，第三批宇航员一文（弗里曼）与 C.C. Williams 一文。
  - 以上都在 2026-11-05 读过。
- **没做的**：没有给这两起事故加地图事件或节拍。events.json 和字幕正由 Codex 在改，这次不碰；拜科努尔已在 04 章索引里。

### 3. 1965 年后的新加坡

- **光谱行动的长度：维持“一段正文加一个两种说法的细看”**，不扩不缩。
  - 正文一段写了几件事：22 人被拘留，政府称马克思主义阴谋，1988 年九人否认并描述受到的对待、八人再被拘留，1989 年修法，史家 Barr 的看法。
  - 细看用表格并列三方说法：政府和国家图书馆管理局的说法（“政治伎俩”、法定声明收回指控），被拘留者的说法，史家的看法。
  - “不让睡觉、长时间罚站”留在细看里，明确是被拘留者声明中的说法。按 CLAUDE.md，沉重内容讲细节、不回避，但不写进字幕和正文。
  - **顺手修的矛盾**：原句“只写出政府点名的两个人”，同一张表里却点了张素兰的名。改为“被拘留者当中，只写出政府点名的两个人，以及出版了自己记述的张素兰”。
- **拒服兵役：保留 01 章“不愿服役的人”细看**，补上政府一方的理由。
  - 这是新加坡至今仍在讨论的事实，06 章“仍在讨论的问题”也列了它。原文只有法律规定和外国报告，缺政府一方的理由。
  - 新加一句：2014 年国防部长在国会的书面答复说，服役要求“without exception is fair and necessary to maintain strong support for NS”，允许以道德或宗教理由不服役会削弱这种支持。
  - 来源 S476：MINDEF 2014-07-09 书面答复，2026-11-05 读过。
- **人名**：统一为不加间隔号的“奥斯曼渥”“尤索夫伊萨”，见第二节。

## 六、门槛

- `pnpm check`、`pnpm validate`、`pnpm build` 全绿。
- `pnpm test`：274 / 275 个文件通过，6495 个用例全过。唯一失败的是 `solar-system-polish` 整个文件加载不了：worktree 的 node_modules 是指向主仓库的软链接，Vite 拒绝读取根目录以外的 `drei/web/Html.js`。在没有改动的 main 上同样失败，与本次改动无关。
- `living-things-toad-skin` 在第一次全量运行时超过 5 秒超时，重跑通过。
- e2e 只跑了受影响的三份：`telling-time`、`mosquito`、`sample-life-cycle`，27 个全过。全量 `pnpm e2e` 没有跑。

## 七、需要 Gavin 确认

1. **生命周期 / 栖息地 / 断路**：没找到新加坡华文科学材料，按内地课本改的。若女儿的华文材料或老师说“生活史”“生境”，改回只需全局替换。
2. **小数的读法和“3.0”**：要翻 P4 课本小数章确认。
3. **千克还是公斤**：维持千克，词表注公斤。
4. **亚细安 / 东盟、寮国 / 老挝**：各主题不一致，这次没改：
   - southeast-asia 用新加坡写法“亚细安”“寮国”；
   - singapore-after-1965、monsoon-and-weather 用“东盟”；
   - ancient-civilisations、dinosaur-earth、singapore-after-1965 用“老挝”。
   要统一的话，请定用哪一套。
5. **其他主题的 12 时制写法**：光与影的 SpaceScene 时间读数仍是“8.00 am”（引擎默认写法）。要与数学课本一致，得改引擎默认值，影响面较大，这次没动。
6. **重量与重力**：力主题“Weight = 重量”，飞机主题“Weight = 重力”（四力的习惯说法）。两处语境不同，暂不统一。
7. **Vincent Cheng 的中文名**：未核到，正文保留英文。
8. **邦达连科来源**：S50 页码转引自维基百科，有条件时请翻原书第 266 页。
9. **ww2 与 1819–1965 的两个中文名**：“武吉知卓 / 鸦片山”“伊丽莎白·蔡 / 蔡杨素梅”（review-queue §六），不在本次范围，仍待定。

## 八、2026-11-09 补充：Codex 重建新增文字的可读性修改

范围：`git diff 6668a386..main` 中改过的零件 `summary` / `detail`（18 个主题，53 个字段）和全部主题的 `<Figure>` alt / caption（15 张图）。原则：事实、数字、来源标注和零件 id 都不动，EN / ZH 同步，读者文字里不留建模术语和坐标。本来就够浅白的字段没有改（零件 18 个，图 3 张）。

**零件文字：35 个字段**

| 主题 | 字段数 | 主题 | 字段数 |
|---|---|---|---|
| heat | 10 | circuits | 3 |
| saturn-v | 5 | light-and-shadows | 2 |
| water | 5 | b200-server、digestive-system、flower-and-seed、how-planes-fly、magnets、materials | 各 1 |
| plant | 4 | | |

**图的 alt / caption：12 张图，22 个字段**（每张图在 EN、ZH 两段各出现一次，两处都改）

coral-reef 4、warring-states 4，circuits、digestive-system、inside-the-earth、plates-and-hazards、singapore-land-use、water 各 2，mosquito、steam-engine 各 1。

**例子**

- saturn-v `sii-fuel`：“rim at y = 50.6 m in the launch model” → “At launch its edge is 50.6 m above the bottom of the engines”。坐标原点就是发动机喷口最低点，数字保留。
- heat `expansion-ball`：“expansion coefficient” → “how much the rod expands for each degree”。
- water `pump-house`：“footprint is compressed to fit this slice” → “takes up less ground than the real one”。
- `digestive-system-swallowing` 图：“Mid-sagittal swallowing section … bolus … larynx” → “A side view cut down the middle … lump of food … opening of the windpipe”，与本章正文用词一致。
- `warring-states-tiger-tally` 图：去掉“Graphite drawing”，“inscription bands”改成“bands for writing”。

**生成器**：12 个主题的生成脚本同步修改，只动文字行，并逐个重跑，比对重跑后的 `summary` / `detail` / `name`：11 个主题完全一致；how-planes-fly 见下。`tests/space-scene/digestive-system-rebuild.test.ts` 里钉住旧句子的断言已跟着改。

**留给 Gavin 的问题（超出本次范围，没有改）**

1. saturn-v `lm-docking-port` 仍写着 “y = 92.5 m”，solar-system `horizon` 仍写着 “scene −Z, east +X, up +Y”。这两个字段自 6668a386 以来没有变，不在这次的范围内。
2. how-planes-fly 的 `text.ts` 比 `parts.json` 旧：除了这次改的 `cockpit-glazing`，还有 53 个字段重跑后会退回可读性修改之前的文字。重跑该主题前要先同步。
3. “borosilicate” 只出现在 `docs/68-3d-realism/review-machines.md`，main 的读者文字里没有。
