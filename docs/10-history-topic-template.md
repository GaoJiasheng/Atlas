# 10 · 历史主题模板（时间线 + 地图）

二战主题（docs/09）跑通之后，把"做一个时间线 + 地图历史主题"固化成项目级模板，跨 session、跨模型都按同一套做。

## 入口

| 东西 | 位置 | 用途 |
|---|---|---|
| skill | `.claude/skills/atlas-history-topic/` | 全流程：`SKILL.md` + `references/`（spec 模板、写作规则、数据速查、地图管线手册、施工顺序与分工、验收清单） |
| 脚手架 | `pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history --title-en "…" --title-zh "…" [--start YYYY-MM-DD --end YYYY-MM-DD]` | 建主题目录（`status: draft`）、背景章、第 01 章、最小合法数据文件、`SOURCES.md`、`scripts/geo/<slug>/` 清单；`pnpm validate` 立即为绿 |
| 地图管线 | `scripts/geo/lib/<step>.ts --topic <slug>` | 每个主题一个清单 `scripts/geo/<slug>/sources.json`（焦点框、预算、量化、海岸规则写在 `pipeline` 里，缺省 = ww2 的值） |
| 引擎契约 | docs/06「TimeScene」「Geo pipeline」「背景章」「名词表」 | 实现细节，skill 不重复 |
| 范本 | `src/content/topics/ww2/`、`scripts/geo/ww2/`、docs/09 | 照着看 |

## 新增约定

- **背景章**：章节 frontmatter `kind: background`（默认 `chapter`），`order: 0`，每个主题至多一个。没有时间轴分段、没有自己的时间（地图显示第一帧，或它的 `state.time`）；章节轨写"Background / 背景"不编号，doc id 用 `00`；第一次进入时阅读面板展开（不管之前是否收起）；← → 照常经过它；演示先播它的拍（默认一拍 = `summary`）。二战没有背景章。
- **阅读说明**：背景章的 `state.note`（双语），阅读面板正文顶部的细框，标题"How this topic is written / 阅读说明"。写本主题的视角、数字写法、地图来源。
- **名词表**：`data/glossary.json`（`{ terms: [{ id, term, definition, see? }] }`，共享 schema `src/content/schema/glossary.ts`）；正文 `<Term id="blitzkrieg">闪电战</Term>` 是点状下划线，点开在阅读面板的 inspector 区显示定义和相关词；控制面板 TOOLS 的"名词 / Glossary"列出全部。每个词只包全主题第一次出现处（EN、ZH 各一处）。
- **阵营名按主题**：引擎的 bloc 只有 `axis / allied / neutral`，显示名由 `topic.yaml` 的可选 `blocLabels: { axis?, allied?, neutral?, out? }`（每项 `{ en, zh }`）决定，缺省回退全站 `time.bloc.*`。一战：`allied` = 协约国（Allies (Entente)），`axis` = 同盟国（Central Powers）。实体不能随时间改名，要换名写在控制区要素的 `label` 里。
- **`disaster` 事件**（流感、饥荒、击沉客轮）：空心墨色三角，不需要 `sides` / `result`，图例“Disaster / 灾难”。**`site` 事件**（墓园、纪念碑、镜厅）：`sites` 图层的空心菱形，不进时间轴，章节 `layers` 要列 `sites` 才显示。
- **时间轴是分段的**（commit 6c13981 起）：底部条每章一段（标签写章号和 `YYYY-MM`，不画年 / 月刻度），段里每个演示拍一个刻度；点段 = 换到该章**第一拍**（不自动跑），点刻度 = 那一拍，拖动播放头只改时间不换章；章节在时间上可以重叠（拍的 `t` 晚于下一章开始也行）。**拍就是叙事结构**：每章 `state.beats` 3–5 拍，每拍 `t` / `camera` / `layers` / `highlight` + 字幕（描述这一拍地图上的东西，日期开头）；第一拍是读者点进本章看到的封面；走过的路线用 `linger` 留一会儿。
- **演示**（顶栏橙色 PRESENT，键 P）：每拍系统先接管镜头，落定后读者可自由拖动 / 缩放，点地图不翻页、不选事件；翻页 = 字幕卡上点一下 / → / 空格 / 进度条；字幕卡右上 ⌄ 把卡收成一条；"自动播放"和"语音"两个勾选框（语音先读章号、章名，再读字幕）。演示里只标这一拍的 `highlight`，所以每个高亮 id 要在镜头里有引线标注。
- **领土名称**（键 N）：控制区要素的 `properties.label`（`{ en, zh }`，括号内说明不显示）；换名（Russia → Soviet Russia）靠同 holder 配对，在交叉淡化 50 % 处换字。**引线标注**贴近锚点两列放置，让开 HUD 面板。
- **海岸与国界**：控制区被沿底图海岸裁剪，控制边只画不同 holder 之间的内陆分界；`borders` 图层 = 今天的内陆国界，默认关，章节 `layers` **不要列**。控制 TopoJSON 由管线生成，`simplify.ts` 末尾须打印 `rings: N, zero-area 0, self-crossing 0`；预算 `budgetMB` 2.5；帧没做全用 `--fine`。跨日界线的路线照实写 ±180 跳变，引擎展开。
- **HUD**：顶栏左章节号码芯片、中 VIEW 组居中加 PRESENT、右 LOOK / 语言；阅读面板、右上卡可收起，收起状态粘住。
- **草稿不上索引页**：索引页只列 `status: published`；草稿和 `ready` 照常构建，用 URL 访问。
- `pnpm validate` 检查：背景章 `order: 0` 且唯一、`note` 只在背景章、`<Term id>` 与 `see` 引用存在。

## 流程一句话

spec（Gavin 定稿）→ 脚手架 → 地图先做首尾两帧 → 背景章 + 两个模板章 → 其余关键帧 ‖ 其余章节分批 → 节拍 → 打磨 → `pnpm shoot <slug> --keys --layout --beats`（末尾的"unlabelled highlights"和"chapter highlights"清单要空）→ 验收清单 → 发布。细节见 skill 的 `build-order.md`。
