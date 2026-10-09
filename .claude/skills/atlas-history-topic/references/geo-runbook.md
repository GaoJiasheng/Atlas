# 地图管线操作手册

硬规则（CLAUDE.md，Gavin 2026-10-08）：版图、国界、前线、路线只来自公开地理数据集或真实地图配准描摹；禁止几何图形和手画多边形。管线代码在 `scripts/geo/lib/`，每个主题一个清单 `scripts/geo/<slug>/sources.json`。范本：`scripts/geo/ww2/`（12 帧、21 个数据源）和它的 `SOURCES-GEO.md`。实现细节：docs/06「Geo pipeline」。

## 来源优先级

1. **CShapes 2.0**（ETH ICR）：1886–2019 逐日主权国界 + 殖民地，作每帧底图（按 GW 代码映射到实体）。**许可 CC BY-NC-SA 4.0**：只能非商业使用，衍生数据要署名、同许可——Atlas 是非商业教育站，可以用；若将来商业化必须换源。
2. **OpenHistoricalMap**（**CC0**，个别要素除外）：带 `start_date / end_date` 的边界关系（占领区、傀儡政权、保护国）。`ohm-export.ts --list <date>` 查某天有效的关系。版权页（openhistoricalmap.org/copyright）原文：数据 “dedicated to the public domain under a Creative Commons CC0 dedication”，带 `license=*` 标签的要素按各自许可（CC BY / CC BY-SA 等）。每个关系集导出后查 `raw/ohm-<set>.json` 里有没有 `tags.license`，有的单独记许可和署名；页面不提 ODbL，不要写 ODbL。
3. **维基共享资源 SVG**（多为 CC BY-SA）：有明确类别填色的历史地图，控制点配准后按颜色类别转成多边形。
4. **维基共享资源位图 / 公有领域战役图**（如美国西点军校、美国陆军军史中心）：调色板分类像素后配准；只有日期可信时只用来定"哪天谁占了哪个行政单位"，不描。
5. **Natural Earth 省份**（公有领域）：按行政单位切分部分占领的地区。

## 清单格式（`scripts/geo/<slug>/sources.json`）

| 键 | 内容 |
|---|---|
| `datasets` | `{ id: { ref: "G1", title, url, file, page, author, license, role } }`；`cshapes` 是底图（compose 用它的 `ref` 标注底图要素），`ne-admin1` 供 `admin1` 选择器 |
| `ohm` | `{ set: { date, relations: { "<relation id>": "<expected name>" } } }` |
| `svg` | `{ id: { dataset, projection: "auto", classes: { "#rrggbb": "class" }, land, sea?, exclude?, maxResidualKm, controlPoints: [{ name, lnglat, svg }], controlPointsFrom? } }` |
| `raster` | `{ id: { dataset, projection, palette, tolerance, land, sea, exclude?, minRegionPx?, maxResidualKm, controlPoints } }` |
| `keyframes` | `[{ id: "K1", t, base: { "<GW code>": "<holder>" }, ohm: "<set>", method, steps: [{ note, holder, label?, src, from, clip?, minus? }], checks: [{ name, center, zoom, source? }] }]` |
| `pipeline` | 可选，见下；缺省值 = ww2 的取值 |

`steps` 按顺序叠加，后者覆盖前者。选择器（`from / clip / minus`）：`cshapes`（`partsAt` 只取含某点的岛，`at` 取别的日期）、`ohm`（`set` 借别帧）、`admin1`、`svg` / `raster`（类别；`coastFillKm` 让占领区沿底图海岸补齐）、`svgFrame` / `rasterFrame`、`parts`（保留或 `drop` 含某点的单块）、`bbox`（**只用来选取已有几何的一部分**）、`union` / `intersect` / `difference`。

`pipeline` 字段：`plannedKeyframes`（12）、`budgetMB`（2.0，按帧数等比）、`focus`（细简化的焦点框 `[w,s,e,n]` 列表，= 章节会放大的战区）、`fineStartKm` 1.5 / `fineStepKm` 0.25（自动找能放进预算的最细间隔）、`coarseKm` 50（框外）、`method` `dp`、`quantization` 400000、`islandsKm2 { focus: 20, coarse: 300 }`、`coast { enabled, land, detailLand, detailBox, worldBox, gapKm 6, islandKm2 2, outsideKm 2, skipKm 15 }`、`checkColors`、`shots`。东南亚 10m 细海岸框 `detailBox [95,-9,125,22]` + `detailLand public/geo/land-10m-sea.json` 是 ww2 的；别的区域设 `null`（两个一起），或先在 `scripts/build-geo.ts` 加该区域的 10m 陆地。

## 步骤

```bash
pnpm tsx scripts/geo/lib/fetch.ts --topic <slug>             # 数据集 -> scripts/geo/<slug>/raw/；工具（mapshaper、osmtogeojson）装到 scripts/geo/.tools/（共享，gitignore）
pnpm tsx scripts/geo/lib/ohm-export.ts --topic <slug> --list 1942-03-09 --levels 1-3   # 发现：某天有效的 OHM 边界关系
pnpm tsx scripts/geo/lib/ohm-export.ts --topic <slug>        # 关系集 -> work/ohm-<set>.geojson（校验有效期与名称）
pnpm tsx scripts/geo/lib/georef-svg.ts --topic <slug> --fills <id>   # 列填充色，选类别
pnpm tsx scripts/geo/lib/georef-svg.ts --topic <slug> --dots <id>    # 城市点 + 最近标注，选控制点
pnpm tsx scripts/geo/lib/georef-svg.ts --topic <slug> --propose <id> --region europe|asia   # 用现有拟合提议海角控制点
pnpm tsx scripts/geo/lib/georef-svg.ts --topic <slug>        # 拟合（auto = 留一法 RMS 最小的投影 + 仿射 / 二次多项式），打印残差 km
pnpm tsx scripts/geo/lib/georef-raster.ts --topic <slug> --colors|--preview|--circles <id>   # 位图：调色板、分类预览、城市圈
pnpm tsx scripts/geo/lib/georef-raster.ts --topic <slug>
pnpm tsx scripts/geo/lib/compose.ts --topic <slug> [K1]      # 每帧 -> work/K#.geojson（properties.holder / label / src）
pnpm tsx scripts/geo/lib/check.ts --topic <slug> --work K1   # 简化前快速看
pnpm tsx scripts/geo/lib/simplify.ts --topic <slug>          # 全部帧一个拓扑 -> src/content/topics/<slug>/data/control.json
pnpm tsx scripts/geo/lib/check.ts --topic <slug> [K1]        # 成品并排图 -> docs/screenshots/<slug>/geo-K#.png
```

先做**第一帧和最后一帧**，并排图核对通过，再铺中间帧。加一帧：`ohm` 加该日期的关系集（先 `--list`）→ 需要的话加 SVG / 位图源和控制点 → `keyframes` 写配方和 `checks` → compose → simplify（见「海岸与简化」：帧没做全时用 `--fine`）→ check。

## 残差预算

- 控制点 ≥ 4（二次多项式 ≥ 9），分布到图的四角和中间；城市点优先，海角用 `--propose` 吸附。
- 最大残差：欧洲 ≤ 30 km，亚太 ≤ 60 km（大比例尺地区图应更小）。超了先查错点（留一法残差大的那个），不要靠删点凑数。
- 同一底图的系列图用 `controlPointsFrom` 共用一套控制点。

## 日期与拼接陷阱

- **CShapes 在条约签署日才改边界**，不是战线变化日。要画“条约后的新地图”，帧日期当天的 CShapes 常常还是条约前的法理状态（一战 K9：1919-06-28 当天奥地利、匈牙利仍含加利西亚、特兰西瓦尼亚等）。用 `cshapes` 选择器的 `at` 查**之后**的日期（圣日耳曼 1919-09-10、特里亚农 1920-06-04 等），逐块取，并在该块的 `label` 与 `SOURCES-GEO.md` 写明用了哪天。想让帧日期和地图严格一致，就把帧（和对应章节）挪到那天。写 spec 时就列出这类日期差，让 Gavin 选。
- **OHM 与 CShapes 混用会留缝**：两个来源的同一条边界不逐点重合，会出现细长缝隙（sliver）和重叠。做法：同一条边界两侧尽量取同一来源；步骤顺序让 OHM **覆盖** CShapes（后者覆盖前者），用 `difference` 把被覆盖处从 CShapes holder 里减掉，而不是各画各的；残留的缝由 compose 的 sliver 过滤（< 5 km²）和 simplify 的海岸裁剪（`coast.gapKm`，把漏掉的陆地并给最近 holder）收掉，内陆的缝用 `union` / `difference` 并给邻 holder；**不许手画补丁**。用 `check.ts --work` 看未简化图，逐处找缝。
- 实体不能随时间改名（`entities.json` 一个 id 一个名字）：国家换名（俄国→苏俄、奥匈→奥地利 / 匈牙利）写在控制区要素的 `label` 上，不新增改名实体，除非历史上确是两个国家。

## 海岸与简化

- `simplify.ts` 把所有帧放进**一个** mapshaper 数据集：相邻实体、相邻关键帧之间共用的边界只存一次。焦点框内细（`fineStartKm` 起逐步加粗直到放进 `budgetMB × 帧数 / plannedKeyframes`），框外 `coarseKm`。
- **预算按主题，但世界海岸是固定成本**（全球海岸裁剪约 600 KB，不随帧数增加）。只有头几帧时，按比例的预算（如 9 帧里的 2 帧 = 0.55 MB）可能小于海岸本身，自动搜索会把焦点区一路加粗到失效。所以**帧没做全时用 `simplify --fine <km>`（如 `--fine 1.5`）固定间隔；帧齐了才用自动搜索**。固定间隔超出按比例预算时，在 `SOURCES-GEO.md` 写明实际 KB、预算和原因。
- **沿底图海岸裁剪**（`coast.enabled`）：每帧擦掉水域，再把简化漏掉的陆地给 `gapKm` 内最近的 holder，让控制区停在底图那一条海岸线上；引擎只画两个不同 holder 之间的内陆分界，不画海岸。
- 旋钮：`--budget <MB>`、`--fine / --coarse <km>`（固定间隔）、`--quant`、`--method dp|weighted`（Visvalingam 会删掉细长峡湾）、`--islands focus,coarse`、`--no-coast`、`--out <file>`、`--no-measure`。脚本最后打印焦点框内原始顶点到成品边界的偏差 p50 / p95 / p99 / max（km），写进 SOURCES-GEO.md。
- 已知：ww2 提交的 `control.json` 是 `--fine 1.5` 的结果（2120 KB，超 2 MB 预算一点）；默认自动搜索得 2.5 km、2120 KB。重新生成前先决定用哪个。

## 并排核对（`check.ts`）

左边 MapLibre 渲染成品（holder 平色 + 标签），右边来源图（有配准的写模型和 RMS）。逐块对照：谁占哪块、前线走向、岛屿、海岸。有差别回到配方改，不在成品上修。`checkColors`（清单或 `scripts/geo/<slug>/check-colors.json`）给 holder 定色，没列的按 id 哈希取色。

## 记录

- `scripts/geo/<slug>/SOURCES-GEO.md`：①来源调查（URL、引用、**页面上的原文许可**、覆盖范围、对本主题的局限）②每帧：日期、配方、来源、配准模型与残差、并排图路径、已知简化 ③许可义务。
- `src/content/topics/<slug>/data/SOURCES.md`：`[G#]` 一行一个来源（标题、作者、URL、**许可**、用途）；「Control keyframes」表（K、日期、方法、来源、残差、核对）；「Movement routes」表（途经点、地图来源、兵力来源）。
- 许可：CShapes CC BY-NC-SA 4.0（非商业、同许可）；OHM CC0（带 `license=*` 的要素按其标签）；Commons 多为 CC BY-SA 3.0 / 4.0（署名、同许可）；美国政府作品、Natural Earth 公有领域。每个都在页面上抄原文核对，不凭记忆。
