# Atlas — 项目指令（每个 session 都读）

双语（EN 默认 / ZH）可视化课本，给新加坡小学生用。两个引擎：TimeScene（地图 + 时间轴）、SpaceScene（3D 拆解）。内容是数据，引擎复用。

## 先读什么
- 架构与约束：`docs/02-architecture.md`（纯静态、无外部请求、iPad/Capacitor 约束、性能预算）
- 引擎契约：`docs/06-dev-guide.md`
- **视觉与交互语言：`docs/08-technical-plate.md`**，它适配了项目级 skill `.claude/skills/industrial-3d-showcase/`。任何视觉、HUD、材质、镜头、动画、标注、性能工作都按这两份做；skill 的 `references/master-spec.md`、`rounds.md`、`perf-lessons.md`、`fact-discipline.md` 是细则。
- 内容路线：`docs/04-content-roadmap.md`；加主题看 `docs/05-briefing-playbook.md`
- **历史主题（时间线 + 地图，像二战那样）**：用项目级 skill `.claude/skills/atlas-history-topic/`（总览 `docs/10-history-topic-template.md`），脚手架 `pnpm tsx scripts/new-topic.ts`，地图管线 `scripts/geo/lib/<step>.ts --topic <slug>`

## 硬规则
- 纯静态：无 SSR、无 API、无运行时外部请求（无 CDN、无 Google Fonts、无瓦片服务）
- 所有展示文本 `{ en, zh }`；id kebab-case；颜色只用 token
- 两套主题都要能跑：paper 是技术图版标准实现，cinema 是 dark plate 变体
- 可点目标 ≥ 44px，关键操作不依赖 hover；快捷键与按钮共用 store
- 交付物里无 TODO / placeholder / 死代码 / console 噪音
- **地图类内容必须用真实数据**：版图、国界、前线、路线一律来自公开地理数据集（CShapes、Natural Earth、OpenHistoricalMap、UMN 历史国界等）或把真实出版地图 / 维基共享资源地图配准后描摹，每个关键帧在 `data/SOURCES.md` 记来源、许可、配准方法；禁止用几何图形、随手多边形凑合（Gavin 2026-10-08 明确要求，对所有主题生效）
- 历史内容**客观、全球视角、不带立场**：各方的侵略、罪行、牺牲用同一套写法写全（含同盟国一方），不写成任何一国的胜利叙事，不用"我们 / 敌人"；新加坡、中国只是视角之一，篇幅按历史分量分配。沉重内容（屠杀、轰炸、集中营）讲细节和数字，不回避；用词克制、尊重受害者，数字带来源

## 门槛（改完必须全绿）
`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`（先 build）；视觉改动另加 `pnpm shoot <topic> --layout --keys` 并看截图。

## 工作方式
- 关键进展主动 `git commit`（文档定稿、阶段验收通过）；push 等 Gavin 说
- 施工优先外包给子代理（Opus 做引擎/视觉，Sonnet 做收尾/QA），主会话负责 brief、验收、提交
- 同一时间多个子代理并行时，划清文件归属，依赖由主会话预装，不让子代理改 package.json
- 内容（二战等）未经 Gavin 定稿不展开；示例主题只放占位数据
