---
name: atlas-history-topic
description: Atlas 项目"时间线 + 地图"历史主题的端到端模板（以二战主题为样板）。当要做一个历史主题、时间线加地图的主题、"像二战那样"的主题，或 build a history topic / timeline map topic / a TimeScene topic with real maps 时使用；也在给已有历史主题加章节、加关键帧、加名词表、写演示节拍、做发布前验收时使用。覆盖内容 spec、立场与写法、数据格式、真实地图管线、施工顺序、子代理分工和验收清单。
---

# Atlas 历史主题（时间线 + 地图）

二战主题（`src/content/topics/ww2/`，记录在 `docs/09-ww2-content-spec.md`）是第一个按这套方法做完的主题。这个 skill 把它固化成可重复的流程：任何 session、任何模型照着做，结果应该和二战同一水准。

## 先读

1. `CLAUDE.md`（硬规则：真实地图数据、客观全球视角、双语、无占位）。
2. `docs/10-history-topic-template.md`（一页总览）；引擎细节查 `docs/06-dev-guide.md`「TimeScene」「Geo pipeline」，不在这里重复。
3. 按当前阶段读 `references/`：

| 阶段 | 读 |
|---|---|
| 立项、写内容 spec | `spec-template.md` |
| 写正文、细看、字幕、名词 | `writing-rules.md` |
| 写 `data/*.json` 与章节 frontmatter | `data-cookbook.md` |
| 做控制区关键帧（地图） | `geo-runbook.md` |
| 排工期、分子代理 | `build-order.md` |
| 发布前 | `acceptance.md` |

## 流程（不跳步）

1. **spec**：复制 `references/spec-template.md` 到 `docs/NN-<slug>-content-spec.md`，填满，交 Gavin 定稿。CLAUDE.md：内容未经 Gavin 定稿不展开。
2. **脚手架**：`pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history --title-en "…" --title-zh "…" --start YYYY-MM-DD --end YYYY-MM-DD`。生成主题目录、背景章、第 01 章、最小合法数据文件、`SOURCES.md` 和 `scripts/geo/<slug>/` 清单。`pnpm validate` 立即为绿。
3. **地图先行**：第一帧和最后一帧先跑通 `scripts/geo/lib/*.ts --topic <slug>`，并排图核对过再铺其余关键帧。
4. **模板章**：背景章 + 两个代表性章节完整做完（正文、细看、事件、行军、来源、名词、节拍），给 Gavin 看。
5. **铺开**：其余关键帧 ‖ 其余章节分批并行；最后统一写节拍、打磨。
6. **验收**：`references/acceptance.md` 全部打勾，门槛全绿，再改 `status: published`。

## 不可违反

- 地图只用真实数据或真实地图配准描摹，每帧在 `SOURCES-GEO.md` 和 `data/SOURCES.md` 记来源、许可、方法、残差；不许手画多边形、不许 `bbox` 当版图。
- 立场客观、全球视角；各方罪行与牺牲同一套写法；不用"我们 / 敌人"。
- 每个数字 `<Num s="S#">`，来源冲突列区间；屠杀段落的中文稿由 Gavin 亲审。
- 所有展示文本 `{ en, zh }`，中文独立成文；id kebab-case；颜色只用 token。
- 不改 `package.json`，不加依赖；有新需求先改引擎并更新 docs/06。
