---
name: atlas-space-topic
description: Atlas 项目"对象解剖"主题（SpaceScene：3D 拆解 + 工作原理）的端到端模板（以空调主题为样板）。当要"做一个 XX 的拆解 / 解剖 / 结构 / 3D 展示"、"像空调那样"的主题、讲"XX 是怎么工作的 / how X works"，或 build a space-scene topic / an object anatomy topic / an exploded or cutaway model of a machine, appliance, vehicle, organ, animal, insect or plant 时使用（生物解剖同样适用）；也在给已有 SpaceScene 主题加零件、改几何、加流和动画、写演示节拍、做写实轮次或发布前验收时使用。覆盖内容 spec、参考图、程序化建模手册、数据格式、写法、施工顺序、子代理分工和验收清单。
---

# Atlas 拆解主题（SpaceScene · 对象解剖）

空调主题（`src/content/topics/aircon/`，记录在 `docs/12-aircon-content-spec.md`，§13–§16 是决定、施工记录、已知差距和写实轮次）是第一个按这套方法做完的 SpaceScene 主题。这个 skill 把它固化成可重复的流程：任何 session、任何模型照着做，结果应该和空调同一水准——一眼认得出的真实结构、技术图版的画法、每个数字有来源。

## 先读

1. `CLAUDE.md`（硬规则：纯静态、双语、token 颜色、无占位、客观）。
2. `docs/13-space-topic-template.md`（一页总览）；引擎契约查 `docs/06-dev-guide.md`「SpaceScene」「演示系统」「QA：pnpm shoot」，不在这里重复。
3. 视觉语言：`docs/08-technical-plate.md` + skill `industrial-3d-showcase`（入口 skill `atlas-plate`）：`master-spec.md` B / D / E / F / G / H / J / K / M、`archetypes.md`、`rounds.md`、`perf-lessons.md`、`fact-discipline.md`。冲突时 docs/08 为准。
4. 按当前阶段读 `references/`：

| 阶段 | 读 |
|---|---|
| 立项、写内容 spec、选原型 | `spec-template.md` |
| 找参考图、建模、写实轮次、性能 | `modelling-runbook.md` |
| 写 `parts.json`、章节 frontmatter、镜头 | `data-cookbook.md` |
| 写正文、零件说明、字幕、名词、来源 | `writing-rules.md` |
| 排工期、分子代理、文件归属 | `build-order.md` |
| 发布前 | `acceptance.md` |

## 流程（不跳步）

1. **spec**：复制 `references/spec-template.md` 到 `docs/NN-<slug>-content-spec.md`，填满（决策表、事实表、分区、零件表、流、动画、章节与节拍、HUD、引擎缺口、参考图与来源计划），交 Gavin 定稿。CLAUDE.md：内容未经 Gavin 定稿不展开。
2. **参考图先行**：照片、专利图、教科书 / 博物馆图解（CC 或公有领域）下到 `scripts/geo/<slug>/refs/`（gitignore，不发布），在 spec 的参考图表里逐张写来源、许可、看什么。没看过参考图不建模。
3. **脚手架**：`pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science|biology --title-en "…" --title-zh "…"`。生成 draft 主题、带全部字段示例的 `parts.json`、第 01 章（state + summary + 两拍）、设计研究来源 S1、`SOURCES.md`、`refs/.gitignore`。`pnpm validate` 立即为绿。
4. **E 引擎缺口**：spec §8 里"必须"的先做（schema + 舞台 + 单测 + docs/06），数据再用。
5. **D 几何**：按零件表建模（`modelling-runbook.md`）→ R2 几何与比例（和参考图并排，至少两轮，干涉检查）→ R3 材质与灯光（hero-clean 能当封面）→ R4 流与动画。每轮 `pnpm shoot <slug>` 截图自证。
6. **T 事实与文字**：`sources.json`（逐条读原文）、名词表、零件 summary / detail、章节正文（`writing-rules.md`）。先做一章样章给 Gavin 看。
7. **B 节拍**：每章 3–5 拍，字幕说"这一拍模型上显示什么"；`pnpm shoot <slug> --beats` 0 失败、无漏标。
8. **P 打磨与审计**：HUD 排版 → 镜头与模式组合 → 事实审计、代码审计。`references/acceptance.md` 全部打勾，门槛全绿，再改 `status: published`。

## 不可违反

- **技术图版语法**：暖象牙纸底、hairline HUD、两列引线标注、克制配色；颜色只用 token（产品本色用材质族 + `tint`）；paper 与 cinema 两套主题都要能看。禁止霓虹、科技蓝、暗色科幻风。
- **写实**：参考先行，**Tier-1 一眼能认**（`archetypes.md` 每种原型的 Tier-1 清单）；每个零件有功能理由，`summary` 第一句说它干什么；禁止随机 greeble。示意性的地方（缩短的管线、放宽的鳍片片距、并排摆放）在标题块 `note`、细看和 spec 已知差距里写明。
- **只用程序化几何**：用引擎的 primitive 拼，不加载外部模型、不贴照片、不加依赖；不画品牌、型号、商标、铭牌。
- **事实纪律**：规格行写 DESIGN（落在有来源的 TYPICAL 范围内），STATE 读数是 SIM 且内部自洽（能量守恒、单位换算）；设计值和模拟运行点写成一条**自描述的设计研究来源**（S1），正文数字一律 `<Num s>`；来源冲突并列，不偷偷选一个。
- **不儿童化**：通俗不幼稚；不拟人、不喊"小朋友"、不用感叹号和问句标题；默认不做测验。
- **客观**：不推荐产品、不比较品牌；能效、用电、安全只讲原理和官方建议。生物主题：解剖如实、用词克制，不渲染血腥，也不回避；动物不拟人；"为了什么而进化"一类目的论说法不写。
- 所有展示文本 `{ en, zh }`，中文独立成文；id kebab-case、全主题唯一。
- 不改 `package.json`、不加依赖；引擎要新东西先改引擎并更新 docs/06。子代理不提交，主会话验收后提交，push 等 Gavin。
