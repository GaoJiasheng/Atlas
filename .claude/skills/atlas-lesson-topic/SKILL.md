---
name: atlas-lesson-topic
description: Atlas 项目"课"主题（MathScene：讲解节拍 + 章末一道小测 + 练习）的端到端模板（以分数主题为样板）。当要"做一节 XX 课"、"像分数那样"的数学 / 算术主题、按新加坡 MOE 课纲讲一个概念（小数、百分比、面积、时间、角、比、整数运算……），或 build a math-scene topic / an explanation-first lesson / a step-by-step lesson with a short check per chapter and a practice chapter 时使用；也在给已有课主题加步、写讲解节拍、扩题库、改写正文、做发布前验收时使用。覆盖内容 spec、讲解优先的写法、lesson.json 数据手册、Codex 起草题库与自证、章节轴与阅读面板、施工顺序和验收清单。
---

# Atlas 课主题（MathScene · 讲解优先）

分数主题（`src/content/topics/fractions/`，记录在 `docs/15-fractions-content-spec.md`，§10 是现在的形态，§8 D11–D16 是 2026-10-11 的改版决定）是第一个按这套方法做完的 MathScene 主题。Gavin 审过第一版后的原话是这套方法的出发点："讲解要占大头。每一章的最后一小节简单做一个小测试题就可以了……网站的核心是让大家理解，而不是考大家。" 这个 skill 把改版后的形态固化成可重复的流程。

## 先读

1. `CLAUDE.md`（硬规则：纯静态、双语、token 颜色、无占位）。
2. `docs/15-fractions-content-spec.md` §1（课纲对照的做法）、§2.2（误解目录）、§5（写作规则与术语）、§10（一章的形状、数据、交互）。
3. 引擎契约：`docs/06-dev-guide.md`「MathScene」「演示系统」「QA：pnpm shoot」；HUD 铁律：`docs/08-technical-plate.md` §2（章节轴、PLATE 块、阅读面板顺序）与「MathScene 语法」。
4. 按阶段读 `references/`：

| 阶段 | 读 |
|---|---|
| 立项、对课纲、写 spec | `spec-template.md` |
| 写讲解节拍、正文、小测题、练习、中文 | `writing-rules.md` |
| 写 `lesson.json`（节拍、题库、要点、练习）、用 Codex 起草题库 / 英文正文 | `data-cookbook.md`、`codex-pool-brief.md`、`codex-text-brief.md` |
| 排工期、分工、文件归属 | `build-order.md` |
| 发布前 | `acceptance.md` |

## 流程（不跳步）

1. **课纲**：从 MOE 课纲 PDF（S1）逐字抄出本主题的学习目标与页码，定级别主体与"桥"；分步，每步对一两条课纲。
2. **spec**：复制 `references/spec-template.md` 到 `docs/NN-<slug>-content-spec.md`，填满（步表、每步的讲解节拍草图、误解目录、题库计划、练习题、术语表），交 Gavin 定稿。CLAUDE.md：内容未经 Gavin 定稿不展开。
3. **节拍先行**：每步 3–5 拍，写进 `lesson.json`（`data-cookbook.md`）；`pnpm validate` 绿、`pnpm shoot <slug> --beats` 每拍一张，逐张看模型、算式、字幕是否讲清楚了。
4. **正文**：按拍的顺序写（EN 250–350 词 / ZH 400–550 字），`<Beat n>` 链到拍，最后一句引出小测。英文可让 Codex 起草，中文 Claude 独立写。
5. **题库**：每步 8–10 道。手写 1–2 道样板，其余用 Codex 按 `data-cookbook.md` 的 brief 起草，每份草稿 `pnpm tsx scripts/math/check-pool.ts <draft>` 0 错后合并；Claude 审题意、改中文、删不合课纲的题。
6. **练习**：6–10 道固定题（分数是 8 道），每题一次检查，`revisit` 指向步。
7. **验收**：`references/acceptance.md` 全部打勾，门槛全绿，截图看过，再改 `status: published`。

## 不可违反

- **讲解占大头**：一章 = 讲解节拍 + 一道小测。不把章做成题单；不在正文里塞多个 `<Task>`；小测从题库随机抽，"再来一道""跳过"都在，什么都不强制。练习章是唯一"做题"的章。
- **章节轴是唯一的底部条**：段 = 章，圆点 = 讲解拍，方块 = 小测 / 练习题；点了就去，不自动跑。不加底部面板；次级读数放左列 PLATE 块，算式放在舞台模型下方，选中 / 作答放在阅读面板章头下方。
- **CPA 在一个画面里**：舞台模型（具体 / 图像）+ 模型下方的算式（抽象）+ 节拍行的话；颜色只表示"谁的"（给定 = cold，新加上的 / 孩子的 = signal，第二个量 = hot，拿走 = 墨色斜线，答案 = 墨色虚线），从不用红绿表示对错。
- **课纲是唯一的范围依据**：MOE 原文逐字引用并注页码（`syllabus[]` + 来源 S1），教材只作顺序参考，不照抄题目、插图、措辞；超纲内容标"桥"（`bridge: true`）。
- **口吻**：平静、第二人称、先具体后符号；不用感叹号、不说"简单""错了""太棒了"，错误反馈说原因和下一步看哪里；不打分排名、不做连胜、徽章、音效、卡通人物。
- **答案与抽到的题不进 URL、不进存储**；进度只在内存。
- 所有展示文本 `{ en, zh }`，中文独立成文、术语按 spec 术语表；id kebab-case、全主题唯一。
- 不改 `package.json`、不加依赖；引擎要新东西先改引擎并更新 docs/06。子代理不提交，主会话验收后提交，push 等 Gavin。
