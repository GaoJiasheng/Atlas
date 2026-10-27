# 工业革命 — 地理数据记录

本题保持草稿。完整来源、哈希、转换方法、误差界限、许可与静态对照图见 `scripts/geo/industrial-revolution/SOURCES-GEO.md` 和 `build-report.json`。

- 铁路：RShapes 1.0，18,804 个原始 lid，按年累计。只保留可用大陆覆盖，主岛采用 Natural Earth 选择后整条剔除；不是全球铁路、蒸汽牵引或营业网。独立 CC BY-NC-SA 4.0 文件位于 `public/geo/industrial-rail-rshapes.json`，无 BY-SA/OHM 输入。
- 煤层：BGS GB `Coal-bearing strata`，622 要素、624 面、1,017 闭合环；EPSG:27700 经既有 mproj OSGB36 七参数转换到 WGS84。没有 OSTN15 网格，不能宣称测量级精度。零退化、零环自交、零同面环间相交、零绕向错误。它是现代地质参照，不是某年正在开采的矿区。OGL 文件位于 `public/geo/industrial-coal-strata.json`。
- 地点：21 Natural Earth 公有领域点 + 6 GeoNames CC BY 4.0 点；保留源 id。`scripts/geo/industrial-revolution/industrial-places.geojson` 是构建来源记录；运行时位置在 `data/events.json`。现代点不表示建城、车站或厂房的精确位置。
- 控制区：1760/1914 两空帧；无实体、无 movements。苏伊士、电缆和英国早期铁路仅用有来源的城市锚点，不画无依据路线。

铁路原始文件 3,942,408 字节（gzip 530,795），超过 1.5 MB 原始预算；仅必需属性已为 2,049,993 字节。煤层 266,680 字节（gzip 75,990），在 350 KB 内。两层原始总计 4,209,088 字节，超过 2 MB；未为达预算删除原始 feature 或日期。该偏差交 Gavin 审阅。

两张离线对照图已实际打开查看，源数据与成品总体分布相符。它们不是浏览器截图；运行时首尾空帧、端点、标签和布局仍由主会话执行浏览器验收。配准残差不适用，没有根据截图假写残差。

署名：Contains British Geological Survey materials © UKRI 2026；源产品 OS notice：Contains OS data © Crown copyright 2020。GeoNames：https://www.geonames.org/。RShapes 作者 Müller-Crepon、Girardin；完整指定书目及逐文件许可见上述管线记录、`data/SOURCES.md`、根目录 `THIRD-PARTY-NOTICES.md`。
