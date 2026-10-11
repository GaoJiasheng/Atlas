# 施工顺序与分工

依赖由主会话预装（MathScene 主题一般**不需要新依赖**）；子代理不改 `package.json`；同时有几个子代理时划清文件归属。

| 阶段 | 谁 | 做什么 | 文件 | 前置 |
|---|---|---|---|---|
| 0 | 主会话 | spec 定稿（Gavin）；建目录 `src/content/topics/<slug>/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`）；没有 math-scene 脚手架，照分数主题手建 | `topic.yaml` | — |
| 1 | E（Opus，按需） | spec §4 的引擎缺口：schema、舞台、检查 / 诊断、单测、docs/06 | `src/engines/math-scene/**`、`tests/math-scene/**` | 0 |
| 2 | 主会话 / L | `lesson.json` 的 `syllabus`、每步 `beats`（3–5）、`keyFacts`、每步 1–2 道样板题、练习题；`pnpm shoot <slug> --beats` 看每一拍 | `data/lesson.json` | 0、1 |
| 3 | Codex（批量） | 每步题库其余 6–9 道（`data-cookbook.md` 的流程，每份草稿自证 0 错） | `scripts/math/drafts/`（不进 git） | 2 |
| 3 | Codex（可选） | 每章英文正文初稿 | `scripts/math/drafts/text-NN.en.mdx` | 2 |
| 4 | 主会话 / T（Opus） | 合并题库（审、删、改中文）；定稿英文正文；**写中文正文**；名词表、来源 | `data/lesson.json`、`chapters/*.mdx`、`data/glossary.json`、`data/sources.json`、`data/SOURCES.md` | 3 |
| 5 | P（Sonnet） | 布局、键盘、读屏、两套主题、手机；`pnpm shoot <slug> --beats --tasks --keys --layout`（en / zh × paper / cinema）；e2e | `tests-e2e/<slug>.spec.ts`、`shots/` | 4 |
| 6 | 主会话 | `acceptance.md` 全勾、门槛全绿、截图进 `docs/screenshots/<slug>/`、spec §8 / §9 记录、`git commit`；push 等 Gavin | — | 5 |

估算（分数主题）：节拍 51 个约半天；题库 118 道（Codex 83 道）起草 + 合并约半天；正文 12 章（EN 草稿 + ZH 手写）约半天；QA 半天。
