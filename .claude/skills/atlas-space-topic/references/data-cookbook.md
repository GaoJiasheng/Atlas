# 数据格式速查

权威定义：`src/engines/space-scene/schema.ts`（parts.json、章节 state、节拍）、`src/content/schema/{topic,chapter,sources,glossary,camera}.ts`；行为细节：docs/06「SpaceScene」。几何参数见 `modelling-runbook.md` §3–§4。改完一律 `pnpm validate`。脚手架生成的 `parts.json` 和第 01 章就是下面每一段的最小合法示例。

## id 约定

- 全部 kebab-case。**一个命名空间**：主题、章节、零件、组、流、动画、命名预设共用，不能重名；名词 id、来源 id（`S1, S2 …`）各自一个。
- 零件用部件名（`compressor`、`hind-leg`），组用分区名（`indoor`、`thorax`），流写"组-段"（`ref-hot-gas`、`air-indoor`），动画写"零件-动作"（`crossflow-spin`、`louvre-swing`）。
- 预设不能叫 `orbit` / `reference`，也不能和组重名：空调的预设是 `indoor-unit`、`outdoor-unit`，因为 `indoor`、`outdoor` 是组。

## topic.yaml

```yaml
id: aircon                       # = 目录名 = URL
title: { en: "How an Air Conditioner Works", zh: "空调是怎么把房间变冷的" }
subtitle: { en: "A split-type inverter unit, generic design study", zh: "分体式变频空调 · 通用设计研究" }
subject: science                 # science | biology | …（SUBJECTS 六选一）
tags: [singapore]                # 可选，规划用
moe: []
mode: space
engine: space-scene
stage: model3d                   # layer2d 被 schema 接受但没有实现，不要用
theme: paper
sensitivity: open
status: draft                    # 验收后改 published；草稿不上索引页，用 URL 访问
note: { en: "Generic design study · schematic layout · not a specific brand or model", zh: "通用设计研究 · 示意布局 · 不代表任何品牌或型号" }
```

`note` 是标题块的声明行（替代全站 "Educational visualization"）。生物：`"Model study · schematic proportions · not a specific specimen"` / `"模型研究 · 示意比例 · 不对应具体标本"`。`blocLabels` 只属于 TimeScene，这里不写。SpaceScene 主题不用背景章（`state.note` 只在 TimeScene 有）；阅读说明的内容放第 01 章细看和 `note`。

## parts.json

顶层键：`parts`（必填）、`groups`、`flows`、`animations`、`views`、`spec`（≤ 4）、`telemetry`（≤ 6）、`presets`（≤ 6），可选 `model`（glb，Atlas 默认不用）。

### parts

```json
{ "id": "compressor", "name": { "en": "Compressor", "zh": "压缩机" }, "group": "outdoor",
  "summary": { "en": "Squeezes the gas so it gets hot; drives the loop.", "zh": "把气体压缩得很热，推动整个回路。" },
  "detail": { "en": "What it does … [S1].\n\nIf liquid or dirt gets in …", "zh": "…" },
  "primitive": { "kind": "lathe", "profile": [[0, -0.135], [0.055, -0.113], [0.055, 0.09], [0, 0.135]], "segments": 48, "at": [0.852, 0.193, -0.005], "color": "powder" },
  "extra": [{ "kind": "bevelBox", "size": [0.05, 0.03, 0.044], "bevel": 0.004, "at": [0.832, 0.33, 0.007], "color": "rubber" }],
  "explode": { "dir": [0.3, 0, 1], "dist": 0.25 },
  "connects": ["accumulator", "discharge-pipe", "compressor-rotor"] }
```

- 必填：`id`、`name`、`group`（context 零件可省）、`summary`（≤ 60 字符，也是引线的一行说明）、`detail`（空行分段，`[S3]` / `[S3, S7]` 渲染成来源上标，编号必须在 sources.json）、`primitive`。
- 可选：`extra`、`repeat`、`explode`（默认不动）、`connects`、`shell`、`context`、`castShadow`、`level`（规划用）。
- **数组顺序就是编号**（#01…，状态行、链路卡、ARCHITECTURE 都用）：按组、组内按工作顺序写；context 零件放末尾。

### groups

```json
{ "id": "indoor", "name": { "en": "Indoor unit", "zh": "室内机" }, "color": "token:ink-2" }
```

按分区号 01–05 排；只有流、没有零件的组（`refrigerant`、`air`）放最后，它们在 LAYERS 和 KEY 里出现，不在 ARCHITECTURE 和链路卡里。组没有 `summary`（组标注只显示组名）。

### flows

```json
{ "id": "ref-hot-gas", "group": "refrigerant", "path": [[0.868, 0.328, -0.017], [0.868, 0.366, -0.017], …],
  "speed": 0.55, "color": "token:hot",
  "stops": [{ "at": 0, "color": "token:hot" }, { "at": 0.15, "color": "token:hot" }, { "at": 1, "color": "token:neutral" }],
  "ends": "open", "count": 278, "size": 0.8, "spread": 0.003, "clip": true,
  "parts": ["compressor", "discharge-pipe", "condenser-coil"], "whenRun": true }
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `path` | 必填 | 场景坐标折线；首尾点相同 = 闭环（不淡入淡出） |
| `speed` | 必填 | 场景单位 / 秒，可视速度，不宣称真实流速 |
| `color` | 必填 | 无 `stops` 时的粒子色；有 `stops` 时是图例色 |
| `stops` | — | 2–6 个，`at` 0..1 按弧长升序，线性 RGB 插值：表达"变热 / 变冷"等状态变化 |
| `ends` | `fade` | `open` = 不淡（首尾相接的分段流）；`fade` = 首 5 % / 尾 8 % 淡入淡出 |
| `count` | 360 | ≤ 1024；分段流按 `count / 长度 × speed` 相近取 |
| `size` | 1 | 主题默认粒径的倍数（≤ 4）；管内流 0.45–0.8，空气 0.8–1 |
| `spread` | 0.012 | 数 = 球半径；`[x, y, z]` = 场景轴向盒半宽（宽风道用盒） |
| `clip` | true | `false` = 剖切不裁（机外的空气） |
| `parts` | — | 流经的零件（≥ 2，按顺序，非 context）：运转时链路卡沿它染色步进 |
| `whenRun` | true | `false` = 常动（只受图层开关） |

### animations

```json
{ "id": "outdoor-fan-spin", "target": "outdoor-fan", "kind": "rotate", "axis": [0, 0, -1], "rpm": 45 }
{ "id": "louvre-swing", "target": "louvre", "kind": "oscillate", "axis": [1, 0, 0], "amplitude": 15, "hz": 0.12 }
{ "id": "heart-beat", "target": "heart", "kind": "pulse", "scale": 1.05, "hz": 1.2 }
```

`axis` 是场景坐标、绕零件 `at` 转（含 `extra`）；`amplitude` 单位度；`pulse` 的 `scale` 是峰值缩放。转速写可读值（30–60 rpm 量级）。`whenRun` 默认 true。

### views

```json
"views": {
  "assembled": { "camera": { "position": [1.8, 1.76, 4.41], "target": [0.01, 0.41, 0.06], "fov": 30 } },
  "exploded":  { "camera": { "position": [2, 2.2, 5.3], "target": [-0.05, 0.55, 0.1], "fov": 30 } },
  "cutaway":   { "normal": [0, 0, -1], "offset": 0 },
  "section":   { "plane": "xy" },
  "cover":     { "position": [1.42, 1.66, 3.2], "target": [0.08, 0.64, -0.05], "fov": 30 },
  "reference": { "camera": { "position": [0, 0.7, 9], "target": [0, 0.7, 0], "fov": 16 } }
}
```

- `assembled` / `xray` / `exploded` / `isolate` 各可带一个镜头（本章没写 `camera` 时用）。
- `cutaway`：裁掉 `dot(normal, p) + offset < 0` 的一侧（`[0, 0, -1]` = 切掉 z > 0 的前半）；默认 `[-1, 0, 0]` 切掉右半。
- `section.plane`：ARCHITECTURE 立面与 REFERENCE 方向，`xy` 正面 / `zy` 侧面 / `xz` 俯视。
- `cover`：直接是镜头（不套 `camera`），HUD 关（H、`hero-clean`）时飞过去；没写就自动取景到模型占宽 75 %。
- `reference`：可选；默认按包围盒自动取长焦正视。

### presets（VIEW 按钮、`<FlyTo preset>`、拍的 `camera: "<id>"`）

```json
{ "id": "outdoor-unit", "label": { "en": "Outdoor", "zh": "室外机" },
  "camera": { "position": [1.82, 1, 1.86], "target": [0.66, 0.28, 0], "fov": 30 }, "view": "xray" }
```

排在 ORBIT、REF. 之后，数字键接着排（第 10 个是 `0`）。`view` 可选：按预设时同时切视图（拍里引用预设只取镜头，不取 `view`）。

### spec（标题块规格行）与 telemetry（STATE 读数）

```json
"spec": [
  { "key": { "en": "Refrigerant", "zh": "冷媒" }, "value": "R32 · 0.80 kg", "tag": "design" },
  { "key": { "en": "Type", "zh": "类型" }, "value": { "en": "Wall split · inverter", "zh": "壁挂分体 · 变频" }, "tag": "design" }
],
"telemetry": [
  { "key": { "en": "High side", "zh": "高压侧" }, "unit": "MPa abs", "idle": 1.93, "run": 3.0, "lag": 10, "decimals": 2 }
]
```

- `spec`：`value` 是字符串（mono，数字和单位）或 `{ en, zh }`（文字）；`tag`：`typical | design | sim`，只有 `sim` 画 SIM 芯片。有 `spec` 时引擎只留 PARTS 行，标题块总共 ≤ 8 行。
- `telemetry`：STATE 面板 = RUN + 这些行（都带 SIM 芯片）。**滞后语义**：一阶滞后 `x(t) = target + (x₀ − target) · e^(−t / lag)`，target = 运转 ? `run` : `idle`；`lag` 秒后走完约 63 %、3 × `lag` 后约 95 %；开机关机同一个 `lag`；暂停时冻结；4 Hz 刷新，不加抖动；深链接和截图（snap）直接跳到终值。`lag` 按物理惯性取：转子 4–6 s、压力 10 s、空气温度 20–25 s。`idle` / `run` 必须等于设计研究来源 S1 里的数（停机值 = 环境 / 平衡值）。`decimals` 默认取 `idle` / `run` 写出的小数位。

## 章节 frontmatter

```yaml
---
id: switch-on
order: 3                         # 1 起，唯一；文件名 03-switch-on.mdx
title: { en: "Switch on: the refrigerant loop", zh: "通电：冷媒循环" }
sensitive: false                 # 元数据
state:
  view: xray                     # assembled | xray | exploded | isolate
  explode: 0                     # 0..1，exploded 时生效
  part: compressor               # 选中零件（非 context）；null 取消
  run: true                      # 动画 + 流
  cutaway: none                  # none | half
  layers: [indoor, line-set, outdoor, refrigerant]   # 可见的组
  hide: [front-panel, outdoor-front, insulation]     # 本章移开的零件（不累积）
  labels: [compressor, condenser-coil, "group:outdoor"]  # 本章引线（不累积；3–6 个，镜头下看得见）
  camera: { position: [1.8, 1.76, 4.41], target: [0.01, 0.41, 0.06], fov: 30 }   # 只能是镜头对象，不能写预设 id
  # theme: cinema                # 可选：本章换主题（少用）
  summary: { en: "…", zh: "…" }  # 阅读面板头句；无 beats 时的字幕
  # question: { en: "…", zh: "…" }  # 可选：孩子会问的问题（没有 summary 时代替它）
  beats:
    - part: null
      camera: { position: [1.65, 1.8, 4.0], target: [0.05, 0.5, 0.0], fov: 30 }
      caption: { en: "…", zh: "…" }
    - part: compressor
      camera: outdoor-unit       # 拍里可以写预设 id（只取镜头）
      cutaway: half
      labels: [compressor, accumulator, service-valves]   # ≤ 6
      hide: [outdoor-front, outdoor-side]
      caption: { en: "…", zh: "…" }
      # audio: /audio/aircon/ch03-2.mp3   # 可选：站内旁白文件（默认用浏览器语音读 caption）
---
```

- **累积**：章节目标只写和上一章不同的字段（`view` `explode` `part` `run` `cutaway` `layers` `camera` `theme` 沿用上一章）；`hide`、`labels` **不累积**，只看本章。
- **拍** = 本章目标 ⊕ 拍里写的 `view / part / explode / run / cutaway / layers / camera`；`hide`、`labels` 写了就替换本章的，不写就用本章的；`camera` 不写 = 本章进入时的镜头。
- **校验**：`part` / `hide` / `labels` 是零件（`part`、`labels` 不能是 context），`labels` 也可以是 `group:<组 id>`，`layers` 是组，拍的字符串 `camera` 是命名预设。
- `labels` 要标被外壳挡住的零件时，本章 `hide` 外壳、用 X-RAY，或者改用组标注；`pnpm shoot <slug> --beats` 末尾的 `chapter highlights` 必须 `all on screen`。
- `quiz` 默认不写（不做测验）；`level` 可选、不渲染。

## 正文组件

`<Lang en>` / `<Lang zh>`（标签前后空行）；`<Num s="S1">0.80 kg</Num>`；`<Term id="latent-heat">latent heat</Term>`；`<More title={{ en: "…", zh: "…" }}>`（空行再写 Markdown）；`<FlyTo preset="outdoor-unit">Start at the compressor</FlyTo>`（只认 parts.json 的 `presets`）。写法见 `writing-rules.md`。

## sources.json / SOURCES.md / glossary.json

```json
{ "sources": [{ "id": "S29", "text": { "en": "Atlas design study for this topic (…). Design values: … Simulated operating point: … Results: …", "zh": "…" },
  "note": { "en": "Not a measurement. … Inputs and arithmetic: S1, S3, S20, S21.", "zh": "…" } }] }
{ "terms": [{ "id": "split-system", "term": { "en": "Split system", "zh": "分体式" }, "definition": { "en": "…", "zh": "…" }, "see": ["refrigerant"] }] }
```

改完 `sources.json` 跑 `pnpm tsx scripts/sources-md.ts <slug>`，只重写 `SOURCES.md` 的生成块；块外手写：本主题的来源规则、未使用的说法及原因、被挡爬虫的页面怎么读的。名词 `see` 必须存在且不指向自己。

## 镜头经验值（fov 30，1920×1080 带 HUD）

章节镜头按带 HUD 的舞台取景（模型放在左右 HUD 之间的空带里，给引线留位置）；封面镜头按满屏取景。D = 要框住的东西的宽度（米）：

| 用途 | 距离（相机到 target） | 方位 | 例（空调，整机 D ≈ 2.1 m） |
|---|---|---|---|
| hero / 章节全景 | ≈ 2.2–2.5 × D | 3/4 前右上：x ≈ +0.35、y ≈ +0.3、z ≈ +0.9（× 距离） | `[1.8, 1.76, 4.41] → [0.01, 0.41, 0.06]`，距离 4.9 |
| cover（HUD 关） | ≈ 1.7–1.8 × D | 同 hero | `[1.42, 1.66, 3.2] → [0.08, 0.64, -0.05]`，3.7 |
| 子部件近景 | ≈ 2.5 × 部件宽 | 3/4 | 室内机 0.8 m：`[-0.1, 1.72, 1.9] → [-0.82, 1.2, 0]`，2.1 |
| 正面 / 剖面 | ≈ 2 × D，正对 +Z | x = target.x，y 略高 | `[-0.12, 0.84, 4.2] → [-0.12, 0.66, 0]`，fov 30 |
| 爆炸 | hero × 1.1–1.2，略高 | 同 hero | `[2, 2.2, 5.3]`，框住拆开后的包络 |
| 背面（管线、背板） | ≈ 2 × D，z 取负 | 3/4 后右上 | `[2.3, 1.7, -3] → [0.1, 0.65, -0.2]` |

- target 放在要看的东西的包围盒中心偏下一点（引线和字幕卡在下方）。fov 26–34；近景别低于 26（透视太平看不出体积）。
- 舞台宽高比 < 1.6（平板、竖屏）时引擎自动后拉镜头；URL 里写的是与设备无关的值。
- 调镜头：在页面里拖到满意，`__atlas.stats().camera` 读回真实 `{ position, target, fov }`，取 2–3 位小数写回数据。
