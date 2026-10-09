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

- **背景章**：章节 frontmatter `kind: background`（默认 `chapter`），`order: 0`，每个主题至多一个。没有时间轴节点、没有自己的时间（地图显示第一帧，或它的 `state.time`），不自动跑；章节轨写"Background / 背景"不编号，doc id 用 `00`；第一次进入时阅读面板展开（不管之前是否收起）；← → 照常经过它；演示先播它的拍（默认一拍 = `summary`）。二战没有背景章。
- **阅读说明**：背景章的 `state.note`（双语），阅读面板正文顶部的细框，标题"How this topic is written / 阅读说明"。写本主题的视角、数字写法、地图来源。
- **名词表**：`data/glossary.json`（`{ terms: [{ id, term, definition, see? }] }`，共享 schema `src/content/schema/glossary.ts`）；正文 `<Term id="blitzkrieg">闪电战</Term>` 是点状下划线，点开在阅读面板的 inspector 区显示定义和相关词；控制面板 TOOLS 的"名词 / Glossary"列出全部。每个词只包全主题第一次出现处（EN、ZH 各一处）。
- `pnpm validate` 检查：背景章 `order: 0` 且唯一、`note` 只在背景章、`<Term id>` 与 `see` 引用存在。

## 流程一句话

spec（Gavin 定稿）→ 脚手架 → 地图先做首尾两帧 → 背景章 + 两个模板章 → 其余关键帧 ‖ 其余章节分批 → 节拍 → 打磨 → `pnpm shoot <slug> --keys --layout --beats` → 验收清单 → 发布。细节见 skill 的 `build-order.md`。
