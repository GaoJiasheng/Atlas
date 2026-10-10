# 施工顺序与分工

空调实际走过并验证的顺序（docs/12 §10、§14–§16；提交 0d34a6c → 198ec4a → 979d8b8 → 615c2ad → 18107d9 → e1f9397 → bdb8486 → 605ec68 → 484a56c）。主会话负责 brief、验收、提交；施工交给子代理（CLAUDE.md「工作方式」：Opus 做引擎 / 视觉，Sonnet 做收尾 / QA）。

| 步 | 内容 | 谁 | 完成标准 | 提交 |
|---|---|---|---|---|
| 0 | 内容 spec（`spec-template.md`）+ 参考图表；§11 待确认问题交 Gavin | 主会话起草，Gavin 定稿 | 决策表、事实表、分区、零件表、流、章节与节拍、HUD、引擎缺口、参考图与来源计划都有 | 是 |
| 1 | 脚手架 `scripts/new-topic.ts <slug> --engine space-scene`；参考图下到 `scripts/geo/<slug>/refs/` | 主会话 | `pnpm validate` 绿；参考图逐张看过 | 是 |
| E | 引擎缺口（spec §8）：schema + 舞台 + HUD + 单测 + docs/06。互不相干的缺口可分两个代理（空调：E1 core 演示系统 ‖ E2a 数据驱动的 hide / 流色标 / 遥测 / 规格行 / 材质，之后 E2b 节拍与预设） | Opus（引擎） | 单测；sample-space 与已发布主题不回归（`pnpm shoot <topic>` 对比、`--beats` 全绿）；docs/06 更新 | 每批 |
| D1 | 数据骨架：`topic.yaml`、`parts.json` 全部零件（按零件表）、组、流、动画、views、presets、spec、telemetry；章节 state + 草稿 summary | Opus（数据 + 几何） | `pnpm validate` 0 error；与 spec 的差异写进 spec §14 的差异表 | 是 |
| D2 | R2 几何与比例（并排参考图至少两轮 + 干涉检查）→ R3 材质与灯光（hero-clean 当封面）→ R4 流与动画 | Opus（视觉） | 每轮 `pnpm shoot <slug>` 截图自证，差异列表清零；calls / 三角形在预算内 | 每轮 |
| T | `sources.json`（逐条读原文，事实表的"待核"全部落定或删去；设计研究来源自描述）、`glossary.json`、零件 summary / detail（EN / ZH）、各章正文与细看。先写一章样章给 Gavin | Opus（事实与文字） | `pnpm tsx scripts/sources-md.ts <slug>`；事实表与来源一一对应；字数、`<Num>`、`<Term>` 首现 | 是 |
| B | 每章 3–5 拍字幕与拍的镜头 / 标注 / 隐藏 | Sonnet | `pnpm shoot <slug> --beats` 0 失败、无漏标、chapter highlights all on screen；四种组合（EN / ZH × paper / cinema） | 是 |
| P | R5 HUD 排版 → R6 镜头与模式组合 → R9 审计（事实：所有带数字的 UI 字符串有来源或带 SIM；代码：无 TODO / 死代码 / console 噪音） | Sonnet（QA），视觉问题回 Opus | `acceptance.md` 全勾 | 是 |
| 发布 | `status: published`；spec 补 §15 实现记录与已知差距；docs/04 大纲同步；索引页 e2e 的主题计数 | 主会话 | 门槛全绿 | 是；push 等 Gavin |

写实反馈（"太抽象""不像"）回到 D2：先补参考图，再加原语（E），再按参考重建、并排两轮，结果写进 spec §16。

## 子代理 brief 要点

- 开头写清：读哪些文件（本 skill 的相关 reference + docs/06 SpaceScene + docs/08 + spec 的哪几节）、**只拥有哪些文件**、门槛、"不提交、不改 package.json、不加依赖"、汇报格式（≤ 20 行：文件、计数、差异、未解决）。
- 几何代理：零件表、参考图路径与"看什么"、Tier-1 清单、预算；要求每轮附截图路径和并排图，列出差异 → 修正。
- 事实代理：事实表、来源计划、可用的来源编号段（并行时如 S1–S29 / S30–S49）、"只写读到并核对过的内容"。
- 节拍代理：每章节拍表、写作规则的字幕部分、`--beats` 的通过标准。
- 引擎代理：缺口编号、最小方案、要补的单测、docs/06 要改的小节；不碰内容目录。

## 并行时的文件归属

| 文件 | 归属 |
|---|---|
| `src/engines/space-scene/**`、`src/engines/core/**`、`src/content/schema/**`、`scripts/validate-content.ts`、`scripts/shoot.ts` | 引擎代理（同一时间最多一个改同一目录；E1 / E2a 这类分目录并行） |
| `src/content/topics/<slug>/data/parts.json` 的几何字段（primitive、extra、repeat、explode、flows、animations、views、presets） | 几何代理 |
| `parts.json` 的文本字段（name、summary、detail）、`data/sources.json`、`glossary.json`、`SOURCES.md` | 事实代理（D2 结束后接手 parts.json；同一时间只一个代理写这个文件） |
| `chapters/*.mdx` 正文 | 文字代理（按章划分） |
| `chapters/*.mdx` 的 `state.beats` | 节拍代理（正文定稿之后） |
| `scripts/geo/<slug>/refs/`（本地）、`docs/screenshots/<slug>/` | 几何代理 |
| `docs/NN-<slug>-content-spec.md` | 主会话（代理在汇报里给要补的记录，主会话写入） |
| `package.json`、依赖 | 只有主会话，且预先装好 |

两个代理不得同时改同一个 JSON 文件；冲突时主会话按 id 合并、重跑 `pnpm validate`。

## 草稿

`status: draft` 的主题照常构建，用 URL（`/en/topics/<slug>/`）进入，`pnpm shoot`、e2e 都用 URL；索引页只列 `published`。

## 每步收尾

`pnpm check && pnpm validate && pnpm test && pnpm build && pnpm e2e`；视觉改动加 `pnpm shoot <slug> --keys --layout`（节拍改动加 `--beats`，性能改动加 `--perf --gpu`）并**看截图**，再提交。
