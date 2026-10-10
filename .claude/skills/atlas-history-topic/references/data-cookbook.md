# 数据格式速查

权威定义：`src/engines/time-scene/schema.ts`、`src/content/schema/{chapter,sources,glossary}.ts`；行为细节：docs/06「TimeScene」。下面每种格式给最小例子和要点。改完一律 `pnpm validate`。

## id 约定

- 全部 kebab-case，全主题唯一（主题、章节、实体、事件、行军、预设共用一个命名空间；名词 id 和来源 id 各自一个）。
- 实体用国家 / 政权名：`japan`、`vichy-france`、`manchukuo`；事件用事件名：`fall-of-singapore` 是章节，`surrender-ford` 是事件；静态点位加前缀 `site-`；行军写"谁-去哪"：`japan-malaya`、`germany-poland-n`。
- 预设不能叫 `world` / `theatre`（内置）。来源 `S1, S2 …`；地图来源 `[G1] …`（只在 SOURCES.md 和 `properties.src`）。

## 时间 `t`

- 三种精度：`1942`、`1942-02`、`1942-02-15`（公元前加 `-`）；地质时间 `{ "ma": 200 }`。来源只给到月份的事件（ww1：`turnip-winter` 的 `1916-12`、`influenza` 的 `1918-03`）**允许写月精度 `t`**，不要编造日期；`until` 同理。
- 换算成数值时取**时段起点**（`1942-02` = 2 月 1 日）。store 和 URL 里的 `t` 是日精度。历史主题统一写到天。
- 章节顺序必须等于时间顺序（ww2 有测试）；章节节点位置 = 本章累积目标的 `t`。

## entities.json

```json
[
  { "id": "japan", "name": { "en": "Japan", "zh": "日本" }, "bloc": "axis", "joined": "1937-07-07", "left": "1945-09-02" },
  { "id": "italy", "name": { "en": "Italy", "zh": "意大利" },
    "bloc": [{ "bloc": "axis", "from": "1940-06-10", "to": "1943-10-13" }, { "bloc": "allied", "from": "1943-10-13" }],
    "joined": "1940-06-10", "left": "1945-05-08" },
  { "id": "switzerland", "name": { "en": "Switzerland", "zh": "瑞士" }, "bloc": "neutral", "joined": "1939-09-01" }
]
```

- `bloc`：`axis | allied | neutral`，或换阵营的时段数组（`[from, to)`，只有最后一段可省 `to`，按时间排、不重叠）。值只有这三个，但**显示名按主题**：`topic.yaml` 的可选 `blocLabels: { axis?, allied?, neutral?, out? }`（每项 `{ en, zh }`，`out` = “已退出战争”）；图例、实体详情、引线说明都读它，缺省回退全站 `time.bloc.*`（Axis / 轴心国，Allies / 同盟国）。**非二战主题必须设**：先在 spec 决定映射（一战：`allied` = Entente，`axis` = Central Powers；注意中文“同盟国”在二战指 Allies、在一战指 Central Powers，必须靠 `blocLabels` 写对）。
- 实体 id 对应一个固定名字，**不能随时间改名**；国家换名（俄国→苏俄）写在控制区要素的 `label` 里，实体详情仍显示原名。
- `joined` 之前、`left` 之后一律按中立显示（地图、参与卡、地名）；`joined` 驱动"何时加入"图层和参与卡的线。
- `color` 只在必须区分同阵营实体时用，写 token。

## control.json（控制区关键帧）

两种写法，引擎解码后一样：

- **GeoJSON**（小主题、示例）：`{ "keyframes": [{ "t": "…", "features": { "type": "FeatureCollection", "features": [...] } }] }`
- **TopoJSON**（真实主题，由 `scripts/geo/lib/simplify.ts` 生成，**不手写**）：`{ "topology": {...}, "keyframes": [{ "t": "1937-07-07", "object": "K1" }] }`，所有帧共用一份拓扑。

要素 `properties`：`holder`（实体 id，必填）、`label`（`{ en, zh }`，领土名称用，如 `Denmark (German-occupied)` / `丹麦（德国占领）`，括号内说明不显示）、`src`（`["G1","G2"]`）。

**交叉淡化与关键帧日期**：两帧之间，区间的**最后 30%** 里前帧淡出、后帧淡入，此前一直显示前帧。所以：关键帧日期 = 这张图**准确成立**的日期（来源地图的日期）；想让某章完整显示某帧，章节时间要落在该帧日期上或之后；两帧太近（几天）会让淡化一闪而过，太远会让前一帧在过时后仍显示很久——帧的密度跟着章节走。

## movements.json

```json
{ "id": "japan-north-china", "from": "1937-07-07", "to": "1937-11-08", "holder": "japan", "kind": "land",
  "strength": 300000, "linger": "1938-01-31",
  "label": { "en": "Japanese North China offensive", "zh": "日军华北攻势" },
  "path": { "type": "LineString", "coordinates": [[116.29, 39.86], [115.97, 39.49], [114.51, 38.04], [112.55, 37.87]] } }
```

- `path` 按真实路线数字化（城镇、铁路、河流、海路中间点），不走直线；在 SOURCES.md「Movement routes」表记途经点和来源。
- `strength` 人数，决定线宽（相对全主题最大值）；未知就不写（0 = 不显示人数）。
- `linger`：`to` 之后整条线以 40% 保留到这天再淡出（看得出"走过哪里"）。
- `kind`：`land | sea | air`。过日界线照实写跳变（`[179.5, 38], [-175, 33]`），引擎会展开走近路。
- 头部位置在 `from`–`to` 之间线性插值，只是近似。

## events.json

```json
{ "id": "surrender-ford", "t": "1942-02-15", "at": [103.7693, 1.3527], "kind": "surrender",
  "sides": { "attacker": "japan", "defender": "uk" }, "importance": 3,
  "title": { "en": "Surrender at the Ford factory", "zh": "福特车厂投降" },
  "summary": { "en": "…", "zh": "…" }, "detail": { "en": "…", "zh": "…" }, "sources": ["S35", "S29"] }
```

| kind | 何时用 | 必填 | 地图 |
|---|---|---|---|
| `battle` | 有胜负的战斗 | `sides` `result` | 圆点 + 进攻方色环 |
| `landing` | 登陆 | `sides` `result` | 同上 |
| `bombing` | 空袭、轰炸城市（含原子弹） | `sides` | 圆点 |
| `siege` | 围城（有 `until`） | — | 外加虚线环 |
| `massacre` / `atrocity` | 屠杀 / 其他暴行（各方都用） | — | 空心方块（墨色） |
| `disaster` | 流感、饥荒、击沉客轮等非作战灾难（不分阵营，不写 `sides`） | — | 空心三角（墨色），图例“Disaster / 灾难”；ww1 例：`lusitania`（`t` 到天）、`turnip-winter`（`t: "1916-12"`、`until: "1917-03"`，德国饥荒，来源只到月）、`influenza`（`1918-03` 至 `1919-04`，`at` 取一个有记录的城市，各地另写 `influenza-singapore`） |
| `surrender` / `political` | 投降、条约、宣战、政权变化 | — | 圆点 |
| `evacuation` / `liberation` | 撤退、解放（冷色） | — | 冷色圆点 |
| `site` | 静态地点（监狱、纪念碑） | — | `sites` 图层的菱形，不进时间轴；ww1 例：`site-noyelles-chinese-cemetery`、`site-hall-of-mirrors`、`site-singapore-cenotaph`（只写位置和名字，`t` 取事件 / 设立日期） |

- `until` 给持续事件（围城、战役）；`importance` 1–3（3 最大）；`forces` / `casualties` 是 `{ 实体 id: 人数 }`，恰好两方时画成双方并排计数器；`result`：`attacker | defender | draw | inconclusive`。
- `summary` 一句话；长内容放 `detail`（inspector 里默认收起）；数字来源写 `sources`。

## presets.json

`{ "presets": [{ "id": "singapore-island", "label": { "en": "Singapore", "zh": "新加坡" }, "camera": { "center": [103.82, 1.35], "zoom": 9.2 } }] }` —— VIEW 按钮（数字键从 3 起）和正文 `<FlyTo preset>` 用。只放地理镜头。

**镜头 zoom 经验值**（1920 px 宽的舞台；MapLibre 512 px 世界，每 +1 放大一倍）：

| zoom | 大约框住 |
|---|---|
| 1.4 | 整个世界（lng ±180 ≈ 1500 px） |
| 2.4 | 一个半球 |
| 3.6 | 欧洲（西欧到乌拉尔） |
| 5.5 | 一个国家（法国、土耳其） |
| 10 | 一座岛 / 一个大城市（新加坡） |

每 +1 zoom 视野宽度减半。屏幕每度经度 ≈ `512 × 2^zoom / 360` px（赤道），纬度方向随 1/cos(lat) 放大。高亮 id 多的章，先算最远两个 id 的经度差是否 < 舞台宽 ÷ 每度像素，再定 zoom；框不住就拉远或换中心，不要丢 id。

## sources.json

`{ "sources": [{ "id": "S1", "text": { "en": "…", "zh": "…" }, "url": "https://…", "note": { "en": "Range: …", "zh": "区间：…" } }] }` —— 正文 `<Num s>` 和事件 `sources` 引用；`pnpm tsx scripts/sources-md.ts <slug>` 写进 SOURCES.md 的生成块。

## glossary.json

`{ "terms": [{ "id": "blitzkrieg", "term": { "en": "Blitzkrieg", "zh": "闪电战" }, "definition": { "en": "…", "zh": "…" }, "see": ["encirclement"] }] }` —— id 唯一，`see` 必须存在且不能指向自己；正文 `<Term id>` 必须存在。

## 章节 frontmatter

```yaml
---
id: fall-of-singapore
order: 7                       # 背景章 order: 0 且 kind: background；其余从 1 起
# kind: background             # 可选；默认 chapter
title: { en: "Malaya and Singapore", zh: "马来亚与新加坡" }
sensitive: false               # 只是元数据
state:
  time: "1942-02-15"           # 背景章可省（= 第一帧）
  camera: { center: [103.0, 3.0], zoom: 5.6 }
  layers: [base, control, movements, battles]   # 另有 borders participation sites
  highlight: [kota-bharu, surrender-ford]        # 引线标注
  summary: { en: "…", zh: "…" }                  # 阅读面板标题下一句；无 beats 时的演示字幕
  # note: { en: "…", zh: "…" }                   # 只在背景章：阅读说明
  beats:
    - t: "1941-12-08"
      camera: { center: [101.4, 6.2], zoom: 6.3 }
      highlight: [kota-bharu]
      caption: { en: "8 December 1941, …", zh: "1941 年 12 月 8 日：…" }
---
```

- 章节目标**累积**：只写和上一章不同的字段。
- 每拍 = 本章累积目标 ⊕ 拍里写的 `t / camera / layers / highlight`；`audio` 预留。
- **拍就是时间轴的结构**：底部条每章一段（段从 `time` 和第一拍 `t` 里较早的那个开始，标签写章号和年月），段里每拍一个刻度，位置按拍的 `t`；读者点段 = 落在第一拍，点刻度 = 那一拍。所以每拍都要写 `t`（不写就落在章节时间上），第一拍就是读者点进这章时看到的画面（镜头、时间、高亮都要成立）。拍的 `t` 可以晚于下一章的开始（章节在时间上重叠），轴照样能画。
- 背景章：底部条上没有段；编号 00（doc id `ATL-…-00`），章节轨写"Background / 背景"；第一次进入时阅读面板展开；演示从它的拍开始。
