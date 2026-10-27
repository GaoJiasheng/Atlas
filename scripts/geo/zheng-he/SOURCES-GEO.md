# 郑和地图来源与构建记录 / Zheng He map provenance

## 数据与许可

- **G1 / D01** Natural Earth contributors, 1:10m land, modern cartographic geometry. Public domain / 公有领域。URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson . Terms: https://www.naturalearthdata.com/about/terms-of-use/ . Source SHA256 `1ac90796408bc6ad6911d69448485d3c4dbf2190370080368a09976e1c9f7416`.
- **G2 / D02** Natural Earth contributors, 1:10m populated places, public domain / 公有领域。URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson . SHA256 `9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`. 15 selected modern city points copied exactly; no present population/date/border metadata treated as fifteenth-century evidence.
- **G3 / D03** GeoNames, Iran gazetteer, **CC BY 4.0**, https://download.geonames.org/export/dump/IR.zip . Record 131231 (Hormoz): `[56.4529,27.095]`. SHA256 `d4338847ec485215ecde11c0ab197fef7e6abb84be155f40fbdf65452caa64b2`.
- **G4 / D04** GeoNames, Tanzania gazetteer, **CC BY 4.0**, https://download.geonames.org/export/dump/TZ.zip . Record 157382 (Kilwa Kisiwani): `[39.49808,-8.95897]`. SHA256 `fb3cc5ede2af2bee7db31c750d236ed1a3367f610770f276c49c022b3cb69170`.

GeoNames licence and table contract: https://download.geonames.org/export/dump/readme.txt . Credit GeoNames; selected records and added descriptions are identified as changes. Raw databases not shipped. Selection evidence: `scripts/geo/zheng-he/evidence/ports.geojson`, `ports-provenance.json`, `INVENTORY.md`, `download-records.json`. Natural Earth terms state that its raster/vector data are in the public domain; GeoNames readme offers its data under CC BY 4.0. No CC BY-SA geometry or text is incorporated into an NC-SA derived file.

## 区域几何与定位限制

区域 [35,-15,125,37]，外扩 0.25° 防纸框边缘露缝。使用 **准备时实际下载并固定 SHA 的 D01 GeoJSON**；不使用第一轮试跑的 world-atlas 成品。现有 mapshaper：裁切、Douglas–Peucker 500 m、keep-shapes、clean；现有 regionTopology：不二次简化，保留 ≥1 km² 岛环，量化 1,000,000。成品 `public/geo/zheng-he-land.json` 单对象 `zheng-he-land`，只有 land/coast；裁切直边不冒充海岸。

最终 363,634 bytes（355.1 KiB），1,034 多边形／环、31,889 顶点、1,038 coast arcs；`zero-area: 0; self-crossing: 0`。这不是十五世纪海岸重建。城市点非码头、战场中心、登陆或个人行程的证明；尤其加勒是碑发现地、达卡是孟加拉区域参照、泗水是爪哇区域参照、基尔瓦是背景而非确认到访。霍尔木兹保留岛上点，不换成阿巴斯港。

复建（需要原始 D01 文件及现有 geo 工具，不改项目依赖）：

```sh
pnpm tsx scripts/geo/zheng-he/build-land.ts --source <ne-10m-land.geojson>
```

`build-land.ts` 在任何处理前检查精确源 SHA，超过 2 MB 或出现坏环即失败。`region-land.ts` 通用命令读的是 world-atlas，并非本版固定 D01 的复建入口。

静态来源／成品对照：`scripts/geo/zheng-he/evidence/coastline-comparison.png`（概览、海峡、霍尔木兹、锡兰、基尔瓦），已打开检查，首尾和所有空控制帧共用这份海岸。它是离线数据 QA 图，**不是浏览器验收截图**。应用的标签遮挡、手机布局、paper/cinema 和逐拍取景仍须主会话 shoot。

## 每个关键帧

| K | 年份 | 控制要素 | 地图、方法与残差 | 检查 |
|---|---|---:|---|---|
| K0 | 1405 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K1 | 1407 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K2 | 1409 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K3 | 1411 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K4 | 1413 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K5 | 1415 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K6 | 1417 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K7 | 1421 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K8 | 1433 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |

## 航迹

`movements.json` 为 `[]`。S21 原始 SVG 下载被 HTTP 403 阻止；仅以其文件说明理解主队与可能支队的区别，未获取／派生路线。无人工连港口线，无船速、风场或坐标时序。无配准工作，所以不虚报 RMS=0。

## 许可家族

地理底层为 PD + CC BY；Atlas 原创选择、中文及说明为 CC BY-NC-SA 4.0。UNESCO 等描述只作事实参考，无复制段落或图像。没有新增 BY-SA／ODbL／ODC-BY 派生文件或第三方图像，因此不新增 LICENSE-CONTENT carve-out 或 THIRD-PARTY-NOTICES 条目。三张图为原准备批准的原创 AI 石墨插画，非史料扫描。


## 2026-10-27 follow-up: symbol offsets

The 17 source anchors and all 30 `at` values are unchanged. Nine dated Nanjing records now use a documented 96 CSS px display ring, keeping `site-nanjing` stationary. Exact slot order, offsets and rationale are recorded in `src/content/topics/zheng-he/data/SOURCES.md` under “Nanjing display offsets”. This rendering convention is independent of zoom and is not geographic evidence. S1 was re-read to confirm that the second expedition belongs at the Calicut destination anchor; no port was moved.
