# 事实与实现审计 · solar-system · 2026-10-29

## 依据与数字

准备资料来自只读主目录 `art/research/solar-system/`：facts.json、sources.json、solar-system-research.md、chapter-beats.json、INVENTORY及planet-reference。最终spec的56个显式F/D/C/M编号全部存在于facts.json。生产正文改用S1–S37来源上标，内部研究编号不显示给学生。

| 事实块 | 研究编号 | 生产依据与处理 |
|---|---|---|
| 课纲定位 | C001–C003 | S1/S2缓存官方课纲，只做接口/范围说明，不发布课纲PDF。 |
| 太阳、分类 | F001–F008 | S3/S4：太阳恒星/等离子体/核聚变，八行星、巨行星分类、冥王星仍存在；不冻结卫星/小天体总数。 |
| 行星量与尺度 | F009–F020、D001/D002/D005 | S5/S6/S7/S26 + DESIGN S37。八组mean radius/a/period保留原精度；正文取合适舍入，明说Earth–Moon barycentre代理、非当天星历。 |
| 较小天体 | F021–F027 | S8/S9/S10/S11/S25；彗尾反太阳几何、流星大气环境、土星环碎块；稀疏标记不作密度。 |
| 闪烁 | F028–F030 | S12/S13；定性振幅、四路径平均和时间步为S37，不标天气或星等测量。接收点变亮、光源稳定有回归测试。 |
| 天空视点与图案 | F031–F035/F041–F043、D003/D006 | S14/S28/S30/S31/S32/S34；固定J2000近似恒星时与本地几何地平；不发升落或现实可见度预报。F035的官方坐标主张降为S37教学输入，S15保留本地背景。 |
| 光年与银河系 | F036–F040/F044、D004 | S16/S17/S24/S29/S35；光速×儒略年，4.24ly为约数，100000ly是粗略盘直径，不是太阳至边缘。 |
| 术语 | S21/S33 | 16条独立定义；海王星采用正确行星名；不声称本地官方标准认证。每词EN/ZH正文各首现包一次。 |

本轮直接复查JPL Physical Parameters/Approximate Positions、NASA Sun/Comets/Galaxies、NASA StarChild闪烁、IAU星座、USNO恒星时。科学馆页面显示人机验证，未点击或绕过；不以当前活动/票务时段为事实。受限页面不下载素材；不复制长引文。

AU=149597870.7km；儒略年31557600s；c=299792.458km/s；ly≈9460730472580.8km（浮点计算误差<.01km）；1AU光行时499.004783836s。Earth直径10mm时，AU≈117.4051746m、Jupiter直径≈109.7330212mm。单位测试重算这些量及不取模的completed turns，避免把半径当直径或光年当时间。

## 数据与许可

独立文件 `public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json` 是28行HYG v4.1子集，保持CC BY-SA 4.0，署名David Nash/Astronexus。子集SHA256：`c8a2a4282f7d83a87523996e317675dbe7ab5feb569c57ec7c8bb491a60c13a0`；原CSV哈希及列单位在其meta中。目录不进topic data合并器，原创图案边只按HIP在内存引用，不写回目录。LICENSE-CONTENT与THIRD-PARTY-NOTICES.md已加独立例外。

数值转录保存在 `scripts/geo/solar-system/planet-reference.json`，模型输入在parts.sim.solarSystem中，单测逐值对照。它不是地图；无地图数据、无手画地理边界。本轮图版为已审生成图，无第三方照片/星座图资产混入。原始PNG留主目录；WebP进public/illustrations。

## 模型与几何

49对象分五组；九个天体单位球经单一scale+shift映射，土星环同因子，没有中心距离被半径缩放的错误。三个学生尺度工位均有说明；原始lab/scale控件不在正式try卡开放，防止切换后沿用错误镜头/隐藏表。引擎draft夹具覆盖另外的true-scale接口。

数值审查证实：彗尾先绕核的原点旋转再平移，E=180时与太阳方向相反；大小行太阳独立放在x=-32且主行拍隐藏，避免重叠。反射光路接在可见球面，接收点用独立姿态对齐；太阳切口与核心为结构示意。四圆盘光路连续到同一接收点，空气/光源开关控制显隐；几何不伪装随湍流逐帧更新。银河系带与中央棒抬到扁盘表面以上，包含标记也露出。

逐拍显隐、索引、字幕与控制值校验全部覆盖；真实HIP方向在选定Singapore日期/钟点的固定预期值独立比对。固定16:9数值投影检查未发现可见对象中心越出frustum；它不检查渲染遮挡/HUD排版，后者留浏览器门槛。

## 验证记录

- 引擎目标回归74/74（solar15、orbit31、shift11、span17）；旧sample-data7亦通过。
- 正式内容14/14；接收亮度、四路径、银河系几何与控件边界有独立断言。
- 全套unit：221文件、5477测试通过。
- check：0错误、0警告、4既有提示；validate：87主题、0错误、0警告。
- build成功：177静态页面，PWA precache215项。输出目录星表逐字节一致；topic bundle无stars/ra/dec/proper/pmra/pmdec记录键，gzip31,268bytes；首页49张published卡。Vite提示部分chunk>500KB；不冒称首屏JS预算已通过。
- sample-solar有8项e2e，solar-system有9项（含双语双主题160个深链接对照）。按用户brief均未运行。
- shoot/手机截图/实测draw calls/浏览器离线流程未运行；主会话端口5453。没有把静态分析或unit通过写成视觉通过。
