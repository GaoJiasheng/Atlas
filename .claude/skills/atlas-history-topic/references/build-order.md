# 施工顺序与分工

ww2 实际走过并验证的顺序（docs/09 §9、§11）。主会话负责 brief、验收、提交；施工交给子代理（CLAUDE.md「工作方式」）。

| 步 | 内容 | 谁 | 完成标准 | 提交 |
|---|---|---|---|---|
| 0 | 内容 spec（`spec-template.md`） | 主会话起草，Gavin 定稿 | 决策记录、章节表、关键帧表、沉重内容清单都有 | 是 |
| 1 | 脚手架 `scripts/new-topic.ts`；引擎缺口（spec §8）先补 | 主会话 / Opus | `pnpm validate` 绿；缺口有单测、docs/06 已更新 | 是 |
| 2 | 地图：**第一帧和最后一帧**（fetch → ohm → georef → compose → simplify → check） | Opus | 并排图一致，残差在预算内，SOURCES-GEO.md 记全 | 是 |
| 3 | **模板章**：背景章 + 两个代表性章节完整（正文双语、细看、事件、行军、来源、名词、节拍） | Opus 写数据与英文，中文 Opus 初稿 | `pnpm shoot <slug>`；Gavin 看过再铺开 | 是 |
| 4a ‖ 4b | 其余关键帧 ‖ 其余章节（按时代分 2–3 批） | Opus × 2 并行 | 每批：门槛绿、每个数字有来源 | 每批 |
| 5 | 全部章节的演示节拍（3–5 拍 / 章，同时是时间轴刻度）、预设镜头、名词表收齐 | Opus 或 Sonnet | `pnpm shoot <slug> --beats` 无失败、无未标注高亮、"chapter highlights"清单为空 | 是 |
| 6 | 打磨：几何 / 路线准确（skill industrial-3d-showcase `rounds.md` R2）→ 动画节奏（R4）→ 事实审计、死代码（R9） | Sonnet | `acceptance.md` 全勾 | 是 |
| 7 | 发布：`status: published`，docs 的实现记录表补齐 | 主会话 | 门槛全绿 | 是；push 等 Gavin |

## 子代理 brief 要点

- 开头写清：读哪些文件（本 skill + docs/06 相关节 + spec）、**只拥有哪些文件**、门槛、"不提交、不改 package.json、不加依赖"、汇报格式。
- 给地图子代理：要做的帧、候选来源、残差预算、焦点框；要求先 `--work` 看一眼再 simplify；汇报每帧残差和并排图路径。
- 给内容子代理：章节 id 列表、spec 对应小节、`writing-rules.md`、可用的来源编号段（如 S100–S149，避免并行冲突）、要新增的事件 / 行军 id 前缀。

## 并行时的文件归属

| 文件 | 归属 |
|---|---|
| `scripts/geo/<slug>/**`、`data/control.json`、`docs/screenshots/<slug>/geo-*.png` | 地图代理 |
| `chapters/<nn>-*.mdx`（按批划分） | 各内容代理只动自己那批 |
| `data/events.json`、`movements.json`、`entities.json` | 同一时间只给一个代理；或每批写到草稿文件、由主会话合并 |
| `data/sources.json`、`glossary.json` | 按编号段 / id 前缀分配；合并后主会话跑 `scripts/sources-md.ts` |
| `src/engines/**`、`src/content/schema/**`、`scripts/validate-content.ts` | 引擎代理（同一时间最多一个） |
| `package.json`、依赖 | 只有主会话，且预先装好 |

两个代理不得同时改同一个 JSON 数组文件；冲突时主会话按 id 合并、重跑 `pnpm validate`。

## 草稿与索引页

`status: draft` / `ready` 的主题照常构建，直接输入 URL（`/en/topics/<slug>/`、`/zh/topics/<slug>/`）进入，`pnpm shoot`、e2e 都用 URL；**索引页只列 `published`**，草稿不会出现在上面，也没有草稿标记。别因为索引页上看不到就以为主题没建出来。

## 每步收尾

`pnpm check && pnpm validate && pnpm test && pnpm build && pnpm e2e`，视觉改动加 `pnpm shoot <slug> --keys --layout`（节拍、章节镜头、高亮改动加 `--beats`，读末尾两份清单）并**看截图**，再提交。
