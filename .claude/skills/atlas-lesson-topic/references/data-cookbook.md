# 数据手册：`data/lesson.json`

schema 在 `src/engines/math-scene/schema.ts`（zod，构建期）；校验在 `src/engines/math-scene/validate.ts`；示例全在 `src/content/topics/fractions/data/lesson.json`。

## 顶层
```json
{ "syllabus": [ { "id": "p3-equivalent", "level": "P3", "ref": "P3 1.1", "page": 35, "source": "S1",
                  "text": { "en": "equivalent fractions", "zh": "等值分数" } } ],
  "steps": [ … ],
  "practice": [ { "id": "q1-…", "revisit": ["equivalent-fractions"], "task": { "id": "q1-…", … } } ] }
```

## 步（一章一步，步 id = 章 id）
```json
{ "id": "equivalent-fractions", "lo": ["p3-equivalent"], "bridge": false, "views": ["bar", "circle"],
  "beats": [ … 3–5 … ], "keyFacts": [ … 2–4 … ], "pool": [ … 8–10 … ] }
```
- `views`：小测时 VIEW 组可切的模型（引擎再按题目能否画来过滤）。

## 讲解节拍
```json
{ "model": { "kind": "bar", "parts": 4, "given": 2, "shaded": [2], "object": "strip" },
  "crossed": [1], "highlight": ["1/2", "2/4"], "overlay": { "labels": true, "equivalent": true, "numberline": true, "symbol": true },
  "equation": "{1/2} + {1/4} = {3/4}", "move": "shade",
  "caption": { "en": "…", "zh": "…" } }
```
| 模型 | 写法 | 讲什么 |
|---|---|---|
| 一个整体 | `{ "kind": "bar", "parts": 8, "given": 3, "object": "chocolate" }` | 份、取几份 |
| 不等分 / 对角 | `"cuts": [0.18, 0.6]` / `"diagonal": true`（配 `object: "kueh"`） | 平均分的反例 / 等积不同形 |
| 几个整体 | `"wholes": 2, "given": 7` | 假分数、带分数 |
| 叠放比较 | `{ "kind": "bar", "parts": 12, "rows": [{ "parts": 12, "given": 8 }, { "parts": 12, "given": 9 }] }` | 化成同样大的份再比 |
| 圆 | `{ "kind": "circle", "parts": 6, "given": 5, "object": "cake" }` | 份数（prata / cake / plain） |
| 数轴 | `{ "kind": "numberline", "from": 0, "to": 1, "intervals": 8, "labels": "ends", "marks": ["5/8"], "withBar": true }` | 分数是数、数段不数刻度 |
| 分数墙 | `{ "kind": "wall", "rows": [1, 2, 4, 8] }` + `"highlight": ["1/2", "2/4", "4/8"]` | 比较（两个 = 冷 / 热）、等值叠放、排序 |
| 模型图 | `{ "kind": "barmodel", "type": "part-whole" \| "comparison", "bars": […], "brace": {…}, "units": 10 }` + `"overlay": { "equivalent": true }` 显示单位格 | 文字题 |

- `given` = 给定的量（cold），`shaded` = 新加上的（signal），`crossed` = 拿走的（只能是 given 里的份）。
- `move`：`cut` / `fold` / `split` / `convert`（新分隔线扫过）、`merge`（合拢）、`morph`（换模型种类）、`shade` / `cross` / `place`（同一幅图，标记逐份过渡）。第一拍不写 `move`。结构（种类、份数、行）不变时只有标记过渡。
- 校验会查：份的下标在范围内、`crossed` ⊂ `given`、数轴上的点在刻度上、分数墙有对应的行、叠加用在对的模型上。

## 题库任务（与练习题同一格式，没有 `example`）
11 种 `kind`：`shade` `cut` `fold` `split` `merge` `place` `compare` `order` `choose` `input` `build-sum`。字段、`feedback.wrong[].sample` 的写法见 docs/06「MathScene · 数据」和 `lib/solve.ts sampleState`。每种至少照抄一个分数主题里的现成题做样板。

自证（每道题都要过）：`lib/proof.ts proveTask` —— 标准解法检查通过；起点不通过；每个 `sample` 被诊断成它声明的 code；`choose` 每个错选项被诊断成它的 `misconception`。

## 用 Codex 起草题库（省 Claude 的 token）
分数主题的做法（`scripts/math/drafts/` 已 gitignore）：

1. 写一份 brief（分数用的是 `references/codex-pool-brief.md`，复制到 `scripts/math/drafts/BRIEF.md` 再改）：读哪些文件（schema、check、solve、validate、本步现有的题、spec 的误解与写作规则）、输出格式（只有新题的 JSON 数组）、id 前缀、数字约束、口吻、**必须自己跑 `check-pool` 到 0 错**。
2. 每步一条命令，最多 4 条并行，**一定 `< /dev/null`**：
   ```sh
   codex exec --skip-git-repo-check -s workspace-write -C /Users/gavin/work/atlas \
     "Read scripts/math/drafts/BRIEF.md and follow it exactly. Your step: … Draft exactly 7 NEW tasks, id prefix \"ef-\". Step notes: … Write to scripts/math/drafts/step-07.json, then run pnpm -s tsx scripts/math/check-pool.ts scripts/math/drafts/step-07.json and fix until 0 error(s)." \
     < /dev/null > scripts/math/drafts/step-07.log 2>&1
   ```
   （Codex 沙箱里 `pnpm` 偶尔被拦，它会改用 `node --import tsx`，结果一样。）
3. Claude 合并：再跑一遍 `check-pool`；列出每道题的 `id · kind · prompt EN | ZH · 误解`，删掉超纲、重复、情境不妥的题，改不地道的中文；合并进 `pool`（≤ 10），`pnpm validate` + `pnpm test`。
4. 正文英文初稿同理（`references/codex-text-brief.md`），中文 Claude 自己写。

## 章节 frontmatter
```yaml
id: equivalent-fractions
order: 7
title: { en: "Same amount, different names", zh: "等值分数" }
state:
  summary: { en: "One amount can have many fraction names.", zh: "同一个量可以有很多个分数名字。" }
```
练习章加 `practice: true`；背景章 `kind: background` + `note`。

## 名词表、来源
`data/glossary.json`（10–16 个，正文第一次出现包 `<Term>`）；`data/sources.json`（S1 = 课纲）与 `data/SOURCES.md`，同通用规则。
