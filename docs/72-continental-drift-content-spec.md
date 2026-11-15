# 72 · 大陆漂移 · 内容施工 spec（v1，待 Gavin 定稿）

2026-11-15。`continental-drift`；TimeScene / GeoStage；EN 默认、ZH 完整；paper 默认、cinema 可切。本文只是内容与引擎施工依据，**没有声称主题、数据或引擎已实现**；本轮没有下载任何数据集、没有改其他文件、没有 git commit。

**一句话**：用一个真实板块重建模型（Merdith et al. 2021，CC BY 4.0）把今天的大陆按板块切开，每块板块绕自己的欧拉极按时间连续转动；读者拖时间轴，大陆从 4 亿年前一路漂到今天。沿着这条连续的地图讲魏格纳的四类证据、为什么当时不被接受、海底扩张与磁条带、板块构造、盘古大陆的聚合与裂解、东南亚怎样拼到一起，以及今天 GPS 测到的移动。

**规模**：背景 + 8 章、39 拍；一个旋转模型（不是若干张关键帧）；三组"只在今天显示"的现代参照层（海底年龄、冰岛南面磁异常、GPS 速度）；封面 + 4 张章图（外包 Codex，§5）。新引擎工作 E-CD1–E-CD4（§4），其中 E-CD4 取决于 D4。

**来源纪律**：§0.3 每条事实标明本轮读到的程度。`read` = 本轮用抓取工具读到原页（经工具转述，没有逐字引用）；`snippet` = 只见到搜索摘要或二手转述，**施工前必须取原文复核**；`todo` = 本轮未取到，列了候选原始来源，施工前取原文，取不到就从正文删掉，不许凭记忆补。这条规则覆盖全文所有数字。

---

## 0. 决定与事实复核

### 0.1 给 Gavin 的代定项

| id | 代定内容（默认值）| 备选 / 理由 |
|---|---|---|
| D1 | **模型用 Merdith et al. 2021**（1000–0 Ma 全板块模型，Zenodo v1.2.4，8,496,217 B，CC BY 4.0）。只用它的旋转文件、静态多边形、海岸线、大陆轮廓（continents）。[CD13–CD17] | 备选 Müller et al. 2019 v3.0（CC BY 4.0，85.7 MB，0–约 250 Ma，含裂谷 / 造山带变形网格）。不选：覆盖不到盘古大陆**聚合**（约 3.3 亿年前起），压缩包大十倍，变形网格要另做引擎。两个模型不混用。 |
| D2 | **时间范围 400–0 Ma**，`maDigits: 1`（URL `t=123.4ma`）。400 取自模型海岸线"主要覆盖过去 4 亿年"的说明[CD17]；构建期逐 1 Myr 检查各大陆都有海岸线要素，不满足就把起点收到最老的完整年代（预计不早于 320 Ma，届时第 01 章改为从该年代起）。 | 备选 320–0：聚合只剩尾声，第 01 章并入第 02 章。备选 250–0：只讲裂解。 |
| D3 | **运行时按 GPlates 同一规则即时计算旋转**（E-CD1 方案 A）：构建期把旋转文件中本题用到的板块及其上级链原样抽成 JSON（总重建极，不预采样），运行时对同一对"移动板块 / 固定板块"相邻两条极做四元数球面线性插值，再沿板块层级合成到锚定板块。每一帧都等于"该模型在这个年代给出的位置"，数据最小（预计 ≤ 60 KB gz）。 | 方案 B（Gavin 举的例子）：构建期按每 1 Myr 预算每块板块的绝对有限旋转四元数（int16 量化），运行时相邻样本 slerp。代价：数据约 150–250 KB gz，样本之间与 GPlates 结果有小偏差，需实测并写进来源说明。A 的金标测试（§4.6）不过时退回 B。 |
| D4 | **投影用 MapLibre 5 自带的球面（globe）**：4–3 亿年前冈瓦纳横跨南极，墨卡托会把它放大到失真、极区裁掉，正好是冰川证据所在。球面下仍保留可拖动、缩放。E-CD4 只加一个 `projection` 开关。 | 备选墨卡托（与 dinosaur-earth 一致，不需要 E-CD4）：南极附近的冰川证据只能裁切 + 文字说明，第 02 章效果明显变差。若 E-CD4 在 iPad 上不过性能线（§4.7），回退墨卡托并把第 02 章镜头改到南美–非洲。 |
| D5 | 海底年龄、冰岛南面磁条带、GPS 速度箭头 **只在 0 Ma 显示，不随板块转动**。理由：海底年龄格网（Seton 2020）是用另一个板块模型做的，套用 Merdith 的旋转会出现错位与缝隙；GPS 是今天的测量。 | 备选：把年龄格网切进 Merdith 静态多边形一起转（"往回拖，大西洋海底缩回洋脊"）。效果好，但两个模型混用，暂不做；若要做应换 D1 为 Müller 2019 并用它自己的年龄格网。 |
| D6 | 章节顺序 = 深时顺序（老 → 新），魏格纳等人的科学史放进各章正文与细看。证据恰好按形成年代排：冰川（约 3 亿年前）→ 化石（2.9–2.4 亿年前）→ 拼合（2 亿年前）→ 海底（1 亿年前至今）→ GPS（今天）。背景章先交代 1912 年魏格纳提出的问题。 | 按"发现史"排章会让底部分段轴的时间倒退（segmentScale 要求各章起点有序），不采用。 |
| D7 | 第 02、03 章最后一拍跳回 0 Ma（"今天这些点散在五块大陆"），拍间时间缓动让读者看到 3 亿年一路漂回今天。这让这两章的时间段与后面各章重叠，segmentScale 已支持重叠段（"Chapters may overlap in time"）。 | 备选：两章不回 0 Ma，只在正文说今天的位置。 |
| D8 | **未来超大陆只写进第 08 章细看**，并列几种假说、标明推测、每种署名；地图时间轴不延伸到负 Ma，不画未来地图，也不出未来地图插画。[CD34] | 备选：一张标"推测"的示意图。不建议：画出来的轮廓会被当成数据。 |
| D9 | 不做人物肖像（魏格纳、撒普等），不复制历史论文插图（版权、AI 相似度风险）。插图只有 §5 的 5 张通用物件。 | — |
| D10 | `subject: geography`；`mode: time`；`engine: time-scene`；`stage: geo`；`theme: paper`；`sensitivity: open`；`tags: [deep-time, beyond-syllabus, singapore, map]`；不展示年级，不宣称 MOE 必修单元。无死亡人数、无灾害内容：按 `docs/next-batch.md` §一 **直接上线**（施工期 `draft`，§7 全绿改 `published`）。 | — |
| D11 | 新加坡视角放在：背景章参照点、第 04 章（东南亚的地块怎样拼到一起，武吉知马花岗岩 2.85–2.3 亿年前）、第 08 章（南洋理工大学 GPS 站每年约 2.8 cm）。巽他古陆（低海平面时露出的巽他陆架）只在第 04 章细看讲，并明确它是海平面变化、不是板块漂移。 | 篇幅不按"和新加坡有关"加码；第 04 章是 8 章之一。 |
| D12 | 中文译名按 §6.2；魏格纳、盘古大陆、冈瓦纳、舌羊齿、中龙、水龙兽、犬颌兽、洋中脊、海底扩张有通行译名；滇缅马苏、苏可泰岛弧、玛丽·撒普、松山基范等本轮没有找到新加坡华文用例，属编辑用词，首见附英文 / 拉丁名。 | — |
| D13 | 与姊妹主题分工按 §2.3：docs/49 当年把魏格纳、漂移证据、磁条带、GPS 记作"交 sibling"（F05–F09 cut），但 `inside-the-earth` 实际没有讲（本轮 grep 两题章节确认），**由本题接手**。本题不讲地震 / 火山灾害、地球内部结构细节、恐龙、放射性定年。 | — |
| D14 | 地图上大陆名用**今天的名字**（"今天的非洲"），超大陆名（盘古大陆、冈瓦纳）只在有来源的年代窗口内显示；阅读说明写明。 | — |

### 0.2 核查口径

访问日期均为 2026-11-15。本轮读到的原页：NASA Earth Observatory 魏格纳专文、Zenodo 两个模型记录的 API 元数据、EarthByte 的 Merdith 模型页与 SM2_ReadMe、JPL GNSS 速度表（table2）、PyPI pygplates 元数据、NGL NTUS 站页。被挡的：USGS *This Dynamic Earth*（403）、USGS FAQ（405）。其余事实只见搜索摘要或未取到，按 `snippet` / `todo` 处理。

**施工第一步是"事实补取"**（§7 第 1 项）：把 §0.3 所有 `snippet` / `todo` 取原文、改成 `read` 或 `cut`，更新本表后再写正文。没有 `read` 的事实不能进正文、字幕、细看、名词定义或插图验收标准。

### 0.3 事实表（fact id → 结论与来源）

| fact | 状态 | 本题采用口径 | 来源（§8） |
|---|---|---|---|
| CD01 | read | 魏格纳 1912 年 1 月 6 日在法兰克福地质学会首次公开讲大陆漂移，四天后在马尔堡再讲。 | S01 |
| CD02 | read | 1915 年出版《大陆和海洋的起源》；1922 年第三版译成多种语言；最后一次修订 1929 年。 | S01 |
| CD03 | read | 他用的证据：大西洋两岸海岸线相合；山脉与煤层拼合后连续；犬颌兽、中龙、舌羊齿、水龙兽化石跨大洋分布；二叠–石炭纪冰川证据拼合后聚在南极周围。 | S01 |
| CD04 | read | 多数地质学家不接受：他提不出足以推动大陆的力，他本人也承认提出的力不够；1926 年纽约国际研讨会多数发言者反对。也有针对他"外行"身份的攻击。 | S01 |
| CD05 | read | 1930 年格陵兰考察途中去世（确切日期不详），遗体 1931 年 5 月 12 日发现。 | S01 |
| CD06 | read | 自 1950 年代中期起，古地磁与海洋学的发现使多数科学家接受大陆会移动。 | S01 |
| CD07 | snippet | 撒普在 1952 年末把北大西洋测深剖面画出来，发现洋脊中央有 V 形裂谷；希曾起初怀疑，后来对照地震震中发现震中多在裂谷内。当年由希曾署名发表，撒普的贡献后来才被承认。各家回忆的细节不同。 | S12 |
| CD08 | snippet | 赫斯 1962 年《洋盆的历史》：洋底在洋脊生成、向两侧推开。"海底扩张"一词由迪茨 1961 年提出（todo）。 | S11 |
| CD09 | snippet | 瓦因和马修斯 1963 年《自然》199 卷 947–949 页：洋脊两侧磁异常对称成带；加拿大的莫利独立得出同一想法，投稿被拒，今称 Vine–Matthews–Morley 假说。 | S11,S13 |
| CD10 | snippet | 1966 年雷恰内斯洋脊（冰岛西南）测量给出有力证据。 | S11 |
| CD11 | snippet | 最近一次地磁倒转（布容–松山界线）约 77.3 万年前（千叶阶 GSSP 文件）或约 78.6 万年前（千叶研究），并列，不取平均。正文只写"约 78 万年前"需两源都读到才用，否则删。 | S24 |
| CD12 | todo | 松山基范 1929 年报告日本、朝鲜部分玄武岩的反向磁化。取不到原始或权威二手来源就删，只保留"科学家发现岩石记录了相反方向的磁场"。 | 候选：日本地质学会 / 京都大学史料 |
| CD13 | read | Merdith et al. 2021，*Earth-Science Reviews* 214:103477；1 Ga–今天的连续全板块模型；古地磁参考系（540–320 Ma 冈瓦纳视极移曲线，320–0 Ma 全球视极移曲线）。 | S02,S04 |
| CD14 | read | 作者说明：不适合 < 5 Myr 时间尺度分析、绝对板块运动或涉及热点的太平洋研究；250–83 Ma 太平洋板块以 5 Myr 间隔连到非洲。 | S03,S04 |
| CD15 | read | Zenodo 10.5281/zenodo.13635864，v1.2.4，2022-07-07，cc-by-4.0；`Merdith_etal_2021_ESR_v1.2.4.zip` 8,496,217 B，md5 `181ab32d1d235a923ee343568731e64a`。 | S03 |
| CD16 | read | Müller et al. 2019 v3.0，Zenodo 10.5281/zenodo.11601026，cc-by-4.0；`…PlateMotionModel_v3.0.zip` 85,689,718 B。本题不采用（D1）。 | S05 |
| CD17 | read | 压缩包内：旋转文件 `1000_0_rotfile_Merdith_et_al.rot`（纯古地磁参考系）；`shapes_coastlines_…gpml` 主要覆盖过去 4 亿年；`shapes_continents_…`、`shapes_cratons_…`、`shapes_static_polygons_…` 覆盖过去 10 亿年；另有分时段板块边界拓扑。 | S04 |
| CD18 | read | JPL GNSS 速度表（IGS14，参考历元 2026-01-01）：NTUS（南洋理工大学，1.3458°N 103.6800°E）北向 −5.985、东向 27.158 mm/yr；水平合速度 √(5.985²+27.158²)=27.81 mm/yr ≈ 2.8 cm/yr，方向东偏南约 12°。列序按 POS 行"纬、经、高"推定为"北、东、上"，取快照时从表头确认。 | S06 |
| CD19 | read | 同表 REYK（雷克雅未克）北 19.834、东 −9.698 mm/yr（合 22.08 mm/yr）。冰岛东侧对照站（HOFN 等）todo：取快照时读出；两站差值才表示裂开速度，单站速度是相对地球参考框架。 | S06 |
| CD20 | snippet | 澳大利亚大陆每年约 7 cm 向北偏东移动；2017 年 GDA2020 发布，坐标约移 1.8 m；另有"自 1994 年约 1.5 m"说法，两者参照不同，并列不混。 | S08 |
| CD21 | snippet | 健康青年手指甲平均每月长 3.47 mm（Yaemsiri 等 2010）；×12 = 41.6 mm/yr ≈ 4.2 cm/yr（本题计算）。"板块和指甲一样快"的说法：NTUS 约 2.8、澳大利亚约 7、指甲约 4.2 cm/yr，同属"每年几厘米"。正文写"同一量级 / 差不多慢"，不写"一样快"。 | S07,S06,S08 |
| CD22 | snippet | 新加坡武吉知马一带的五个花岗岩体约在 2.85–2.3 亿年前先后侵入，属苏可泰岛弧（东马来亚–印支一侧）的俯冲型岩浆；新加坡在文冬–劳勿缝合带南延线以东约 50–100 km；滇缅马苏与苏可泰岛弧碰撞在晚三叠世末至早侏罗世初，变形约 1.95 亿年前结束。 | S09,S10 |
| CD23 | read（姊妹题） | PB2002 把新加坡放在巽他板块；新加坡气象局（MSS）更宽地描述为欧亚板块稳定大陆部分。两个模型细致程度不同。 | plates-and-hazards 现有来源 |
| CD24 | todo | 盘古大陆约 3.35 亿年前起由冈瓦纳、劳俄等聚合，约 2 亿年前（三叠纪末–侏罗纪初）开始裂解；中大西洋岩浆省约 2.015 亿年前。本轮只见维基镜像，不可用。 | 候选 S17,S18 |
| CD25 | todo | 晚古生代冰期主要在石炭纪–早二叠世（约 3.4–2.9 亿年前，待原文）。 | 候选 S19 |
| CD26 | todo | 四种化石的年代：中龙早二叠世；舌羊齿二叠纪；水龙兽二叠纪末–早三叠世；犬颌兽早–中三叠世。年代以 PBDB 快照中每条记录的区间为准，正文只写纪。 | 候选 S16,S01 |
| CD27 | todo | 水龙兽除南部大陆外也见于中国、俄罗斯；以 PBDB 快照实际分布为准。 | S16 |
| CD28 | todo | 洋底年龄从洋脊向两侧变老；现存洋壳大多年轻于约 2 亿年。 | 候选 S14 |
| CD29 | snippet | Seton et al. 2020 全球洋壳年龄格网，CC BY 4.0，6 / 2 / 1 弧分；GTS2012 与 Gee & Kent 2007 两种时间表版本。 | S14 |
| CD30 | snippet | EMAG2v3 2 弧分全球磁异常格网，DOI 10.7289/V5H70CVX，高度 4 km，float32，nodata 99999；GeoTIFF 约 175 MB。 | S15 |
| CD31 | todo | 1968 年深海钻探计划第 3 航段在南大西洋取样，沉积物最底部年代随离洋脊距离增大。 | 候选 S25 |
| CD32 | todo | 1965 年威尔逊提出转换断层；1967–1968 年麦肯齐与帕克、摩根、勒皮雄等把这些归纳为板块构造。 | 候选 S11 |
| CD33 | todo | 霍姆斯 1931 年提出地幔对流可能推动大陆；南非的杜托伊特 1937 年《我们漂泊的大陆》支持漂移。 | 候选 S11 |
| CD34 | todo | 未来超大陆是推测：终极盘古 / 比邻盘古、新盘古、奥里卡、亚美等多种情景，约 2–3 亿年后；不同假设给出不同结果。 | 候选 S21,S22 |
| CD35 | todo | 末次冰盛期（约 2 万年前）海平面比今天低约 120 m，巽他陆架大片露出成为巽他古陆。 | 候选 S23 |
| CD36 | read（姊妹题） | 板块相对运动通常每年几厘米，各地不同。 | plates-and-hazards / inside-the-earth 的 BGS 来源 |
| CD37 | todo | 古地磁只约束古纬度和方向，不约束古经度；纯古地磁参考系模型里古经度是约定。 | 候选 S02 正文、S22 |
| CD38 | todo | 晚古生代冰川沉积代表地层：南非 Dwyka 群、巴西巴拉那盆地 Itararé 群、印度 Talchir 组、塔斯马尼亚 Wynyard 组、南极横贯山脉 Pagoda 组；坐标精度只到地区。 | 候选：各国地调局 / Macrostrat |
| CD39 | todo | 阿巴拉契亚山脉与格陵兰东部、苏格兰高地、斯堪的纳维亚的加里东造山带拼合后成一条带。 | 候选 S11、BGS |
| CD40 | todo | PBDB 快照许可以下载时 `datainfo` 头为准（dinosaur-earth 的快照自报 CC0）。 | S16 |
| CD41 | read | pygplates 1.0.0（PyPI，2025-03-26），GPL-2.0，Python ≥ 3.8；本机 Python 3.9.6 / arm64 对应 `pygplates-1.0.0-cp39-cp39-macosx_11_0_arm64.whl` 59,930,915 B，sha256 `ba0aa4f3…ca4c`（全值见 §3.1）。只作构建工具，不部署。 | S27 |
| CD42 | todo | GPlates 在相邻两条总重建极之间用四元数球面线性插值，再沿板块层级合成；跨"固定板块切换"年代的取舍规则。§4.6 金标测试以 pygplates 实算结果为准，文档只作说明。 | 候选 S26 |
| CD43 | todo | MapLibre GL JS 5.x 的 globe 投影可用性、GeoJSON 跨日界线与含极点多边形在 globe 下的渲染行为。由 E-CD4 夹具实测。 | 候选 S28 |

合计 43 条：**read 16（含姊妹题 2）/ snippet 10 / todo 17**。

### 0.4 设计数字（不是观测，统一挂 S30 `design: true`）

| id | 数值与说明 |
|---|---|
| DS01 | 时间范围 400–0 Ma、`maDigits: 1`（D2）。 |
| DS02 | 精度声明：每帧位置 = 模型在该年代的有限旋转（D3）；金标容差 ≤ 0.001°（约 0.1 km）。这是"复现模型"的误差，不是"复原真实地球"的误差。 |
| DS03 | 几何细节两档：拖动 / 缓动时用"快档"，松手 300 ms 内换"细档"。陆地海岸细档 ≤ 40,000 顶点、快档 ≤ 12,000；大陆边缘（continents）细档 ≤ 25,000、快档 ≤ 8,000。面积小于 100 km²（按今天面积）的岛屿在快档省略、细档保留，省略数量写进 SOURCES-GEO.md。 |
| DS04 | "只在今天显示"的图层：所选年代量化后等于 0.0 Ma 才显示；离开 0 Ma 立即隐藏。 |
| DS05 | 拍间时间缓动沿用现有 `CHAPTER_TWEEN_MS`（1.6 s）；`prefers-reduced-motion` 时直接跳。 |
| DS06 | 镜头：0 Ma 镜头用预设；远古镜头由 `scripts/geo/continental-drift/cameras.ts` 在构建期用同一旋转代码计算"本拍高亮对象（或指定板块组）在该年代的球面质心"，写进章节 JSON；不手填古坐标。 |
| DS07 | 新加坡轨迹：从本拍年代到 0 Ma 每 1 Myr 一个点，运行时计算。 |
| DS08 | 海底年龄分档：0–10、10–20、…、170–180、> 180 Ma 共 19 档（只用于 0 Ma 静态显示）。 |
| DS09 | 磁异常：EMAG2v3 在 [−36, 56, −20, 66]（W,S,E,N）范围内按正 / 负号分两类成面，按 2 km 容差简化；只表示"测得的磁异常正负"，不标"正向 / 反向期"。 |

---

## 1. 立场、范围与必须讲对

**读者**：一般读者，含小学高年级与家长。每章正文 EN 200–300 词 / ZH 350–500 字，3–5 段 → 细看 2–3 块；字幕 EN ≤ 45 词，会被朗读，不用括号缩写。所有显示文本 `{ en, zh }`，中文独立成文。不做测验、不做配音文件。

**科学史的写法（对称、全球）**：魏格纳（德国）、杜托伊特（南非）、霍姆斯（英国）、松山基范（日本，待核）、撒普与希曾、赫斯（美国）、瓦因与马修斯（英国）、莫利、威尔逊（加拿大）按贡献写，不写成"孤独天才 vs 顽固学界"。反对者的理由（没有机制、他提出的力太弱）如实写，不嘲讽任何一方；撒普当年署名问题照事实写一句，不加评价词。不用"我们 / 敌人"，不用"伟大、可笑、终于证明"。

**必须讲对**：

1. 地图上的轮廓是**今天的海岸线被模型带回去**，不是古代海岸线；古代海平面、侵蚀、后来增生的陆地都没有体现。想看古代水陆分布去 `dinosaur-earth`（PaleoDEM 复原）。[CD17]
2. 每块板块被当作**刚体**旋转；真实大陆碰撞处会挤压变形，所以印度–亚洲等处会出现重叠，裂开处会出现缝隙。早已俯冲消失的洋壳不显示。
3. 模型是**古地磁参考系**：古纬度有约束，古经度是模型约定；"整张图往东挪多少"没有意义，看板块之间的相对位置。[CD13,CD37]
4. 模型作者说明它**不适合 < 5 Myr 尺度**；所以"今天每年几厘米"用 GPS 实测，不从模型读。[CD14,CD18]
5. 魏格纳的"大陆漂移"≠ 今天的"板块构造"：板块包括洋底，大陆不是在洋底上犁过去。他关于驱动力的说法被否定，大陆会移动的结论被后来的证据支持。[CD03,CD04,CD06]
6. 化石点、冰川点是**今天的发现地**，被构建期按它所在的板块一起转回去；点不是动物的活动范围，空白不代表没有。[CD26,CD27]
7. GPS 速度是**相对地球参考框架（IGS14）**的速度，不是相对邻近板块的速度；冰岛两侧的差才是裂开速度。[CD18,CD19]
8. 巽他古陆是低海平面时露出的陆架，和板块漂移是两回事。[CD35]
9. 未来超大陆是推测，几种假说并列。[CD34]
10. 新加坡今天在巽他板块（PB2002）上；它脚下的岩石在三叠纪前后随东南亚各地块拼到一起。[CD22,CD23]

**无沉重内容**。魏格纳在考察中去世一句平实带过。

---

## 2. 章节与节拍

### 2.1 总表

时间一律 `{ma:number}`。章自身 `state` = 最后一拍；点章落第一拍。镜头缩写：`G0` = 0 Ma 世界 `[20, 10, 1.1]`；`ATL0` = 0 Ma 大西洋 `[-25, 15, 2.0]`；`SEA0` = 0 Ma 东南亚 `[105, 3, 3.2]`；`ICE0` = 0 Ma 冰岛 `[-22, 63, 4.2]`；`fit(...)@t` = 按 DS06 在年代 t 框住括号内对象 / 板块组。数值为设计值（S30）。

图层 id：`base`（经纬网 / 海洋底色）、`cd-land`（海岸线多边形，转动）、`cd-shelf`（大陆边缘 continents 多边形，转动）、`cd-names`（大陆名标注，转动）、`cd-glacial`、`cd-fossils`、`cd-belts`（证据点，转动）、`cd-singapore`（参照点 + 轨迹，转动）、`cd-seafloor`、`cd-stripes`、`cd-gps`（只在 0 Ma，D5 / DS04）。不写 `borders` / `control` / `movements`。

| # | id | 标题 EN / ZH | 代表 Ma / 拍数 | 图层（章 state） |
|---|---|---|---|---|
| 00 | background | A map that moves / 会动的地图 | 0 / 3 | base, cd-land, cd-shelf, cd-names, cd-singapore |
| 01 | before-pangaea | Before Pangaea / 盘古大陆之前 | 330 / 4 | base, cd-land, cd-names |
| 02 | pangaea-and-ice | One supercontinent, one ice age / 一块超大陆，一场冰期 | 0（300 起）/ 5 | base, cd-land, cd-names, cd-glacial |
| 03 | shared-fossils | Fossils on both sides of the ocean / 大洋两岸的化石 | 0（285 起）/ 5 | base, cd-land, cd-names, cd-fossils |
| 04 | southeast-asia-assembles | How Southeast Asia came together / 东南亚怎样拼到一起 | 195 / 4 | base, cd-land, cd-names, cd-singapore |
| 05 | atlantic-jigsaw | A jigsaw across the Atlantic / 大西洋两岸的拼图 | 200 / 4 | base, cd-land, cd-shelf, cd-names, cd-belts |
| 06 | breaking-apart | Pangaea breaks apart / 盘古大陆分裂 | 100 / 4 | base, cd-land, cd-names |
| 07 | ocean-floor-record | The ocean floor keeps a record / 海底留下的记录 | 0（50 起）/ 5 | base, cd-land, cd-seafloor, cd-stripes |
| 08 | moving-today | Still moving today / 今天仍在移动 | 0 / 5 | base, cd-land, cd-gps, cd-singapore |

章节起点（第一拍）依次为 400、310、285、250、200、190、50、0 Ma，单调变年轻，满足 segmentScale 的"起点有序"。重叠是有意的：第 02、03 章末拍回 0 Ma（D7）；第 04 章（250→195 Ma）末尾比第 05 章（200 Ma）年轻 5 Myr。施工时 `segmentScale` 单测补一条本题的章节起点 / 重叠夹具。

背景 `state.note`（阅读说明，EN / ZH）：

- EN: "The map turns today's coastlines back in time with the Merdith et al. 2021 plate model. Outlines are today's coasts, not ancient shorelines, and east–west positions are a model convention. Dots mark where evidence is found today. Numbers link to their sources."
- ZH："地图用 Merdith 等 2021 年的板块模型，把今天的海岸线沿时间往回转。轮廓是今天的海岸，不是古代海岸线；东西方向的位置是模型的约定。点表示证据今天的发现地。数字都可点开来源。"

### 2.2 每章提纲、索引与逐拍字幕

拍表"事实"列只供审计，不显示。每拍显式写 layers / highlight（无高亮写 `[]`）。所有涉及"某年代板块在哪里"的字幕，在首尾帧跑通后逐拍对照实际模型画面复核：不符先改拍的 `t` 或措辞，不改数据（§7）。

#### 00 `background` · 会动的地图（3 拍）

- **summary**：See how this map turns today's continents back in time. / 看这张地图怎样把今天的大陆沿时间往回转。
- **正文**：1912 年魏格纳问：大陆会不会移动？[CD01] 本题沿着证据形成的年代往前走；地图是模型而非照片（必须讲对 1–3）；怎么读 Ma、怎么拖时间轴。
- **细看**：① 什么是板块重建模型、它从哪些数据来（古地磁、洋底磁异常、地质对比）[CD13]；② 每块板块绕一个"欧拉极"转（`term-euler-pole`），为什么不同板块方向不同。
- **index**：`site-singapore`。

| 拍 | Ma / 镜头 | 图层增减 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b00-1 | 0 / G0 | land, names / — | Today: these are the continents as they look now. In this map they are cut into plates, and each plate can be turned back in time. | 今天：这是大陆现在的样子。地图把它们按板块切开，每一块都能沿时间往回转。 | CD13 |
| b00-2 | 0 / ATL0 | +shelf / — | Today: the pale band around each continent is its edge under the sea. It is part of the same continent, so the model moves it with the land. | 今天：大陆周围的浅色带是没在海里的大陆边缘。它和陆地属于同一块大陆，模型让它们一起移动。 | CD17 |
| b00-3 | 0 / SEA0 | +singapore / site-singapore | Today: Singapore is marked as a reference point. Drag the timeline and watch where the model carries it. | 今天：新加坡标成一个参照点。拖动时间轴，看模型把它带到哪里。 | CD23 |

#### 01 `before-pangaea` · 盘古大陆之前（4 拍）

- **summary**：Watch separate continents move towards each other. / 看分开的大陆怎样彼此靠近。
- **正文**：4 亿年前冈瓦纳在南方，北方另有几块大陆[CD24 待核]；每块板块各自转动；它们之间的洋壳后来俯冲消失，地图上是空白（必须讲对 2）；碰撞抬起山脉[CD39]。
- **细看**：① 刚体旋转与真实变形的差别；② 古经度为什么是约定（CD37）。
- **index**：`name-gondwana`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b01-1 | 400 / fit(all)@400 | land, names / name-gondwana | 400 million years ago: a large southern continent, Gondwana, lies far from the northern continents. The outlines are today's coasts carried back by the model. | 4 亿年前：南方的大陆冈瓦纳离北方的大陆还很远。轮廓是模型带回去的今天的海岸。 | CD24,CD17 |
| b01-2 | 370 / fit(all)@370 | 同上 / — | 370 million years ago: the gap is narrower. Each plate turns about its own pole, so the pieces do not all move the same way. | 3.7 亿年前：缺口变窄了。每块板块绕自己的极转动，所以各块移动的方向不一样。 | CD13 |
| b01-3 | 340 / fit(all)@340 | 同上 / — | 340 million years ago: the continents are closing in. The ocean floor that lay between them has since sunk back into the Earth, so the model leaves the space empty. | 3.4 亿年前：大陆越来越近。它们之间的洋底后来沉回了地球内部，所以模型在那里留空。 | CD24 |
| b01-4 | 330 / fit(gondwana-north)@330 | 同上 / name-gondwana | 330 million years ago: Gondwana is meeting the northern continents. Where they pushed together, mountain ranges rose. | 3.3 亿年前：冈瓦纳和北方的大陆相遇。挤在一起的地方隆起了山脉。 | CD24,CD39 |

#### 02 `pangaea-and-ice` · 一块超大陆，一场冰期（5 拍）

- **summary**：Find rocks left by glaciers and see where they gather. / 找到冰川留下的岩石，看它们聚在哪里。
- **正文**：约 3 亿年前大部分陆地连成盘古大陆[CD24]；晚古生代冰期[CD25]；五块大陆上的冰川沉积与擦痕[CD38]；魏格纳的解释：拼回去后它们聚在南极周围[CD03]。
- **细看**：① 冰川擦痕和冰碛岩怎样认（配图 IMG-2）；② 有人提出"冰盖覆盖热带"的替代解释为何难以成立——**只在取到原始来源后写，否则删**。
- **index**：`name-pangaea`、`glacial-dwyka`、`glacial-itarare`、`glacial-talchir`、`glacial-wynyard`、`glacial-pagoda`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b02-1 | 310 / fit(all)@310 | land, names / name-pangaea | 310 million years ago: most of the world's land is joining into one supercontinent, Pangaea. | 3.1 亿年前：世界上大部分陆地正连成一块超大陆——盘古大陆。 | CD24 |
| b02-2 | 300 / fit(glacial)@300 | +glacial / — | 300 million years ago: each dot marks rocks left by glaciers, found today in South America, Africa, India, Australia and Antarctica. Here the dots gather near the South Pole. | 3 亿年前：每个点表示冰川留下的岩石，今天分布在南美、非洲、印度、澳大利亚和南极洲。在这里，它们聚在南极附近。 | CD03,CD38 |
| b02-3 | 300 / fit(glacial-dwyka)@300 | 同上 / glacial-dwyka | 300 million years ago: in southern Africa, glaciers scratched the rock and left a layer of boulders mixed with mud. Open the dot to see where it was described. | 3 亿年前：在非洲南部，冰川刮花了岩石，留下石块和泥混在一起的地层。打开这个点，看它在哪里被记录。 | CD38 |
| b02-4 | 300 / fit(glacial)@300 | 同上 / glacial-itarare, glacial-talchir | 300 million years ago: Wegener argued that one ice cap near the pole explained these rocks better than ice in five far-apart places. | 3 亿年前：魏格纳认为，一片靠近南极的冰盖，比五个相隔很远的冰川更能解释这些岩石。 | CD03 |
| b02-5 | 0 / G0 | 同上 / — | Today: the same glacier rocks lie on five continents, some of them now close to the Equator. | 今天：同样的冰川岩石分散在五块大陆上，有些如今已靠近赤道。 | CD38 |

#### 03 `shared-fossils` · 大洋两岸的化石（5 拍）

- **summary**：Follow four fossils whose finds are now split by oceans. / 跟着四种化石，看它们的发现地怎样被大洋隔开。
- **正文**：中龙、舌羊齿、水龙兽、犬颌兽分别是什么、生活在什么纪[CD26]；它们今天的发现地；拼回去后连成带[CD03]；水龙兽也见于亚洲（不只南部大陆）[CD27]；点是记录不是普查。
- **细看**：① 四种生物的身体特征（配图 IMG-3）；② 当时的"陆桥"解释：有人主张大洋间曾有后来沉没的陆桥，与漂移说怎样竞争——取到来源后写（CD33 同批）。
- **index**：`taxon-mesosaurus`、`taxon-glossopteris`、`taxon-lystrosaurus`、`taxon-cynognathus`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b03-1 | 285 / fit(taxon-mesosaurus)@285 | land, names, fossils / taxon-mesosaurus | 285 million years ago: Mesosaurus fossils are found today in southern Africa and South America. On this map their sites lie close together. | 2.85 亿年前：中龙化石今天发现于非洲南部和南美洲。在这张图上，它们的发现地靠得很近。 | CD03,CD26 |
| b03-2 | 270 / fit(taxon-glossopteris)@270 | 同上 / taxon-glossopteris | 270 million years ago: Glossopteris was a seed plant with tongue-shaped leaves. Its fossils come from across the southern continents. | 2.7 亿年前：舌羊齿是一种种子植物，叶子像舌头。它的化石来自南方各块大陆。 | CD03,CD26 |
| b03-3 | 250 / fit(taxon-lystrosaurus)@250 | 同上 / taxon-lystrosaurus | 250 million years ago: Lystrosaurus was a plant-eating animal. Its fossils come from Africa, India and Antarctica, and also from parts of Asia. | 2.5 亿年前：水龙兽是一种吃植物的动物。它的化石来自非洲、印度和南极洲，也来自亚洲一些地方。 | CD03,CD26,CD27 |
| b03-4 | 245 / fit(taxon-cynognathus)@245 | 同上 / taxon-cynognathus | 245 million years ago: Cynognathus was a meat-eating relative of mammals. Its fossils come from more than one southern continent. | 2.45 亿年前：犬颌兽是一种吃肉的动物，和哺乳动物有亲缘关系。它的化石来自不止一块南方大陆。 | CD03,CD26 |
| b03-5 | 0 / G0 | 同上 / — | Today: the same fossil sites are separated by oceans. Wegener argued that the land itself had once been joined. | 今天：同样的化石发现地被大洋隔开。魏格纳认为，是陆地本身曾经连在一起。 | CD03 |

b03-3 / b03-4 的大陆清单以 PBDB 快照实际分布为准（构建报告逐 taxon 列国家），与字幕不符改字幕。

#### 04 `southeast-asia-assembles` · 东南亚怎样拼到一起（4 拍）

- **summary**：Follow the ground under Singapore as blocks join. / 跟着新加坡脚下的地块，看各地块怎样拼合。
- **正文**：东南亚由多个地块拼成[CD22]；新加坡位于苏可泰岛弧一侧；武吉知马花岗岩是洋板块俯冲时上升的岩浆冷凝而成（2.85–2.3 亿年前）[CD22]；滇缅马苏从西面靠拢，晚三叠世末至早侏罗世初碰撞[CD22]；新加坡今天在巽他板块上[CD23]；轨迹是模型路径、经度是约定（必须讲对 3）。
- **细看**：① 巽他古陆：海平面低时露出的陆架，不是漂移（CD35，配合 D11）；② 新加坡的花岗岩长什么样（配图 IMG-4，通用花岗岩）。连 `plates-and-hazards` 的 `felt-in-singapore`。
- **index**：`site-singapore`、`name-sibumasu`、`name-sukhothai-arc`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b04-1 | 250 / fit(site-singapore)@250 | land, names, singapore / site-singapore | 250 million years ago: the ground under today's Singapore is part of a smaller block at the edge of an ocean. The line shows the model's path for it from here to today. | 2.5 亿年前：今天新加坡脚下的地块，是大洋边缘一块较小的陆块。线条显示模型给出的它从这时到今天的路径。 | CD22,CD37 |
| b04-2 | 230 / fit(site-singapore)@230 | 同上 / site-singapore, name-sukhothai-arc | 230 million years ago: molten rock rose above a sinking ocean plate and cooled into granite. Singapore's Bukit Timah granite formed between about 285 and 230 million years ago. | 2.3 亿年前：洋板块下沉，上方的岩浆上升、冷却成花岗岩。新加坡武吉知马的花岗岩形成于约 2.85 亿至 2.3 亿年前。 | CD22 |
| b04-3 | 210 / fit(sibumasu-sukhothai)@210 | 同上 / name-sibumasu | 210 million years ago: another block, Sibumasu, closes in from the west. The ocean between the two blocks is almost used up. | 2.1 亿年前：另一块地块滇缅马苏从西面靠近，两块之间的大洋快要消失。 | CD22 |
| b04-4 | 195 / fit(sibumasu-sukhothai)@195 | 同上 / name-sibumasu, site-singapore | 195 million years ago: the blocks have joined. The joining zone lies about 50 to 100 kilometres west of where Singapore is today. | 1.95 亿年前：两块地块已经拼合。拼合带位于今天新加坡以西约 50 至 100 公里。 | CD22 |

`name-sibumasu`、`name-sukhothai-arc` 只在构建期确认模型里有对应板块（按 plate ID 与模型说明对照）时启用；对不上就删这两个标注和 b04-3，b04-4 改写为只讲新加坡点（§3.4）。

#### 05 `atlantic-jigsaw` · 大西洋两岸的拼图（4 拍）

- **summary**：Compare the coasts, the sea-covered edges and the old mountains. / 比较海岸、海下边缘和古老山脉。
- **正文**：2 亿年前盘古大陆仍完整[CD24]；海岸线相合、海下大陆边缘更合[CD03,CD17]；山脉与煤层连续[CD03,CD39]；1915 年魏格纳把四类证据合在一起，多数地质学家不接受及理由；1926 年纽约研讨会；霍姆斯、杜托伊特[CD02,CD04,CD33]；魏格纳 1930 年在格陵兰去世[CD05]。
- **细看**：① 不接受的理由，两边各一段：支持方（证据一致）/ 反对方（没有能推动大陆的力；他提出的力太弱）[CD04]；② 早期也有人注意到两岸相合（只在取到原文后写，否则删）。
- **index**：`belt-appalachians`、`belt-east-greenland`、`belt-scottish-highlands`、`belt-scandinavian-caledonides`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b05-1 | 200 / fit(south-atlantic)@200 | land, names / — | 200 million years ago: South America and Africa are still joined. Their matching coasts first made people ask whether continents could move. | 2 亿年前：南美洲和非洲还连在一起。两岸相合的海岸，最先让人想到大陆会不会移动。 | CD03,CD24 |
| b05-2 | 200 / fit(south-atlantic)@200 | +shelf / — | 200 million years ago: the fit is closer along the continents' edges under the sea, which lie beyond today's coasts. | 2 亿年前：沿着海下的大陆边缘拼，比沿今天的海岸拼得更合。 | CD17 |
| b05-3 | 200 / fit(belts)@200 | +belts / belt-appalachians, belt-scottish-highlands, belt-scandinavian-caledonides | 200 million years ago: old mountain belts in North America, Greenland, Britain and Norway line up into one long chain. | 2 亿年前：北美、格陵兰、英国和挪威的古老山带，连成一条长长的山链。 | CD03,CD39 |
| b05-4 | 200 / fit(all)@200 | 同上 / — | 200 million years ago: Wegener put this evidence together in 1915. Most geologists rejected the idea, because no one could explain what force moved the continents. | 2 亿年前：魏格纳在 1915 年把这些证据放在一起。多数地质学家不接受，因为没人能说明是什么力推动了大陆。 | CD02,CD04 |

#### 06 `breaking-apart` · 盘古大陆分裂（4 拍）

- **summary**：Watch the supercontinent split and new oceans open. / 看超大陆裂开、新的大洋张开。
- **正文**：中大西洋最先张开[CD24]；冈瓦纳分成东西两部分；南大西洋张开；印度离开南方大陆北上——各年代以模型画面 + 取到的原文为准（todo，与 CD24 同批补取）。
- **细看**：① 裂开时的火山活动（中大西洋岩浆省，取到 S18 才写）；② 恐龙时代的水陆分布连 `dinosaur-earth` 的 `jurassic-world`、`cretaceous-world`。
- **index**：`name-gondwana`、`name-pangaea`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b06-1 | 190 / fit(central-atlantic)@190 | land, names / name-pangaea | 190 million years ago: a narrow sea opens between North America and Africa. It is the start of the central Atlantic Ocean. | 1.9 亿年前：北美和非洲之间张开一道窄海，这是中大西洋的开端。 | CD24 |
| b06-2 | 160 / fit(all)@160 | 同上 / name-gondwana | 160 million years ago: Gondwana is beginning to split into an eastern part and a western part. | 1.6 亿年前：冈瓦纳开始分成东、西两部分。 | CD24 |
| b06-3 | 130 / fit(south-atlantic)@130 | 同上 / — | 130 million years ago: South America and Africa are pulling apart, starting in the south. | 1.3 亿年前：南美洲和非洲正在分开，从南端开始。 | CD24 |
| b06-4 | 100 / fit(indian-ocean)@100 | 同上 / — | 100 million years ago: India is a separate piece of land, moving north across the ocean. | 1 亿年前：印度已是一块分开的陆地，正向北穿过大洋。 | CD24 |

#### 07 `ocean-floor-record` · 海底留下的记录（5 拍）

- **summary**：Read the age and magnetism of the ocean floor. / 读懂洋底的年龄和磁性。
- **正文**：1950 年代撒普的剖面与裂谷[CD07]；赫斯的海底扩张[CD08]；岩石冷却时记录地磁场方向、地磁场多次倒转[CD11,CD12]；瓦因–马修斯–莫利：洋脊两侧对称的磁条带[CD09,CD10]；钻探取样证实年龄随距离增大[CD31]；从此多数人接受[CD06]。
- **细看**：① 为什么磁条带像"磁带录音"、为什么两侧对称（配封面 IMG-1）；② 撒普与希曾的合作和署名，事实写清，不评价[CD07]。
- **index**：`ridge-mid-atlantic`、`site-reykjanes`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b07-1 | 50 / fit(india-asia)@50 | land / — | 50 million years ago: India is close to Asia. Their collision will later help raise the Himalayas. | 5000 万年前：印度已靠近亚洲。两者碰撞，后来抬升了喜马拉雅山。 | CD32（todo，补取印亚碰撞年代来源） |
| b07-2 | 0 / G0 | +seafloor / — | Today: colours show the age of the ocean floor. The youngest rock lies along the middle of the oceans and gets older towards the continents. | 今天：颜色表示洋底的年龄。最年轻的岩石在大洋中央，越靠近大陆越老。 | CD28,CD29 |
| b07-3 | 0 / ATL0 | 同上 / ridge-mid-atlantic | Today: in the 1950s, Marie Tharp's depth profiles showed a valley running along the middle of this underwater ridge. | 今天：1950 年代，玛丽·撒普画出的海底剖面显示，这条海底山脊中央有一道裂谷。 | CD07 |
| b07-4 | 0 / ICE0 | +stripes / site-reykjanes | Today: south of Iceland, measured magnetism in the sea floor forms stripes that mirror each other on both sides of the ridge. | 今天：在冰岛以南，测得的洋底磁性形成条带，在洋脊两侧互为镜像。 | CD09,CD10,CD30 |
| b07-5 | 0 / ICE0 | 同上 / site-reykjanes | Today: cooling rock records Earth's magnetic field, which has flipped many times. Matching stripes showed that new sea floor forms at the ridge and spreads both ways. | 今天：岩石冷却时记录下地磁场，而地磁场翻转过很多次。对称的条带说明，新的洋底在洋脊生成，向两侧扩张。 | CD08,CD09,CD11 |

#### 08 `moving-today` · 今天仍在移动（5 拍）

- **summary**：Compare GPS speeds with how fast your fingernails grow. / 把 GPS 测到的速度和指甲生长的速度比一比。
- **正文**：板块构造的归纳[CD32]；GPS 卫星定位怎样测出每年几厘米[CD18]；新加坡 NTUS 站约 2.8 cm/yr[CD18]；澳大利亚约 7 cm/yr、坐标系因此调整[CD20]；冰岛两侧站点方向不同[CD19]；指甲约 4 cm/yr 同一量级[CD21]；模型不用于这么短的时间（必须讲对 4）。地震、火山的分布连 `plates-and-hazards` 的 `mapping-plates`。
- **细看**：① 未来的超大陆：几种假说并列、标明推测、各自署名[CD34]（D8）；② GPS 速度是相对什么测的（必须讲对 7，配图 IMG-5）。
- **index**：`gps-ntus`、`gps-australia`、`gps-reyk`、`gps-iceland-east`。

| 拍 | Ma / 镜头 | 图层 / 高亮 | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|---|
| b08-1 | 0 / G0 | land, gps / — | Today: arrows show how far GPS stations move each year. Each region has its own speed and direction. | 今天：箭头表示 GPS 站每年移动多远。每个地区的速度和方向都不一样。 | CD18,CD36 |
| b08-2 | 0 / SEA0 | +singapore / gps-ntus | Today: the GPS station at Nanyang Technological University in Singapore moves about 2.8 centimetres a year, towards the east-southeast. | 今天：新加坡南洋理工大学的 GPS 站每年移动约 2.8 厘米，方向偏东南东。 | CD18 |
| b08-3 | 0 / fit(gps-australia)@0 | 同上 / gps-australia | Today: Australia moves about 7 centimetres a year, one of the fastest continents. Its official map coordinates have been updated to keep up. | 今天：澳大利亚每年移动约 7 厘米，是移动最快的大陆之一。它的官方地图坐标因此做了更新。 | CD20 |
| b08-4 | 0 / ICE0 | 同上 / gps-reyk, gps-iceland-east | Today: Iceland sits on the Atlantic ridge. Stations on its two sides move in different directions, so the island is slowly being pulled apart. | 今天：冰岛坐落在大西洋洋脊上。两侧的 GPS 站朝不同方向移动，这座岛正被慢慢拉开。 | CD19 |
| b08-5 | 0 / G0 | 同上 / — | Today: fingernails grow about 4 centimetres a year. Plates move a few centimetres a year, about as slowly. Over 200 million years, that adds up to thousands of kilometres. | 今天：指甲每年长约 4 厘米，板块每年移动几厘米，差不多一样慢。2 亿年下来，就是几千公里。 | CD21,CD36；算式 3 cm × 2 亿 = 6000 km（S30） |

`gps-australia` 用 JPL 表中一个澳大利亚站（取快照时选，优先 Geoscience Australia 网络的长期站），字幕的"约 7 cm"引 S08，不由单站速度推出；`gps-iceland-east` 同理在快照里选冰岛东侧长期站。两站名称写在 inspector，不进字幕。

### 2.3 姊妹主题分工与互链

| 主题 | 它讲 | 本题不重复，只链接 |
|---|---|---|
| `inside-the-earth`（SpaceScene） | 地球分层、地幔大体是固体、三种边界运动、岩浆、地震波 | 本题第 01 章细看讲"为什么能转"时一句话 + 链 `layers-of-earth`、`three-boundary-motions` |
| `plates-and-hazards`（TimeScene） | 今天的板块边界（PB2002）、火山、地震、海啸及伤亡、新加坡的远震 | 第 08 章链 `mapping-plates`；第 04 章链 `felt-in-singapore` |
| `dinosaur-earth`（TimeScene，PaleoDEM） | 中生代古地形与水陆、恐龙化石记录、撞击 | 必须讲对 1 链 `triassic-world`；第 06 章细看链 `jurassic-world`、`cretaceous-world` |
| `fossils-and-skeletons`（SpaceScene） | 化石怎样形成、地层先后、定年 | 第 03 章细看链 `layers-in-order`、`ash-beds-and-ages` |

本题独有：魏格纳与科学史、四类漂移证据、海底扩张与磁条带、连续板块旋转（400–0 Ma）、GPS 实测、未来假说、新加坡的地块来历。互链用 `TopicLink`，目标章 id 已按现有章节文件名核对（本轮 `ls` 过四题 chapters 目录）。

---

## 3. 数据管线

### 3.1 需要下载（主会话申请批准后再下）

原料放 `/Users/gavin/work/atlas/art/research/continental-drift/data/`（不进 git），每个文件放各自的空目录；处理脚本在 `scripts/geo/continental-drift/`，Python 一律 `python3 -I`。下载后立即算 SHA-256 写 `INVENTORY.json`（文件名、URL、字节、上游 md5、本地 sha256、取得时间），与上游 md5 / 大小对照，不符停下。之后不得用同名重下覆盖。

| # | 内容 | URL | 大小 | 许可 | 校验 |
|---|---|---|---|---|---|
| DL1 | Merdith et al. 2021 模型 v1.2.4 | `https://zenodo.org/records/13635864/files/Merdith_etal_2021_ESR_v1.2.4.zip?download=1` | 8,496,217 B | CC BY 4.0 | 上游 md5 `181ab32d1d235a923ee343568731e64a` + 本地 sha256 |
| DL2 | pygplates 1.0.0 wheel（构建工具，装进 `art/research/continental-drift/.venv`，不部署） | PyPI `pygplates-1.0.0-cp39-cp39-macosx_11_0_arm64.whl` | 59,930,915 B | GPL-2.0（只作工具，产物不受其约束；不分发 wheel） | sha256 `ba0aa4f3db2af7d8661749898a0abd79e7924ffcdbb1df118bfd767ee287ca4c`；依赖（numpy 等）装时列出版本与哈希 |
| DL3 | PBDB 四种化石快照 | `https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Mesosaurus,Glossopteris,Lystrosaurus,Cynognathus&show=coords,loc,strat,ref,class&limit=all` | 预计 < 3 MB（下载前不可知，记实际值） | 以 `datainfo` 头为准（CD40） | 本地 sha256；保存完整查询串与 `rowcount` |
| DL4 | Seton et al. 2020 洋壳年龄格网 6 弧分（GTS2012 版） | EarthByte `webdav/ftp/earthbyte/agegrid/2020/Grids/` 目录下 6m 文件（下载前先读 README 定文件名，HEAD 取大小） | 预计 30–80 MB（待 HEAD） | CC BY 4.0（CD29，取原页确认） | 本地 sha256 |
| DL5 | EMAG2v3 冰岛西南切片 | 优先 GMT 远程数据 `earth_mag` 2 弧分对应 [−36,56,−20,66] 的分块（只下覆盖范围的块，预计每块数 MB）；不行再下 NCEI 全球 GeoTIFF（约 175 MB） | 见左 | NOAA / 美国政府数据（取 NCEI 页面确认使用条款） | 本地 sha256 |
| DL6 | JPL GNSS 速度表快照 | `https://sideshow.jpl.nasa.gov/post/tables/table2.html` | 约 0.46 MB 文本 | 取 JPL 使用说明确认；只用少数站的数值作为事实引用，不再分发整表 | 本地 sha256；记录表头参考框架与历元 |

不下载：Müller 2019（D1 不采用）、Natural Earth（0 Ma 的海岸来自模型本身）、任何瓦片服务。冰川点、山带点的坐标取自论文 / 地调局网页的地点描述（CD38、CD39），不是下载数据集。

### 3.2 处理步骤与产物

全部产物在 `public/geo/cd-*.json`，本地静态、按需加载。

| 产物 | 输入 | 处理 | 许可族 |
|---|---|---|---|
| `cd-rotations.json` | DL1 旋转文件 | `extract-rotations.py`：解析 `.rot`；收集本题所有要素用到的 plate ID 及其到锚定板块的全部上级链（任一年代）；原样保留每条总重建极 `[ageMa, latDeg, lonDeg, angleDeg]`（数值不改写、不四舍五入），按 `(moving, fixed)` 分序列；只保留覆盖 [0, 400] 的极及其两端各一条外侧极。schema 见 §4.2。报告：plate 数、序列数、极数、上级链最大深度。 | CC BY 4.0 改编，署名 Merdith et al. 2021 |
| `cd-land.json`（细 / 快两档对象） | DL1 coastlines | pygplates 读出每个多边形的 plate ID 与有效期（begin/end Ma），导出今天坐标；按 DS03 两档简化（现有 `scripts/geo/lib/simplify.ts` 或等价 Visvalingam，不加依赖）；TopoJSON 量化，属性 `{plateId, from, to}`。 | 同上 |
| `cd-shelf.json`（两档） | DL1 continents | 同上；只用于"海下大陆边缘"。说明：这是模型定义的大陆地壳范围，不是某一等深线。 | 同上 |
| `cd-points.json` | CD38/CD39 地点、新加坡参照点、PBDB 快照、标注点 | `assign-plates.py`：pygplates `PlatePartitioner` 用静态多边形在 0 Ma 给每个点分配 plate ID 与有效期；分不到板块的点记入报告并排除。PBDB 按 collection 聚合，保留每条 occurrence 的年龄区间与文献号；`taxon-*` 组对象列出成员与代表点。新加坡参照点 `[103.8198, 1.3521]`（编辑锚点，不是观测站）。 | PBDB 按其许可；其余 Atlas 文字 CC BY-NC-SA 4.0，事实坐标署原来源 |
| `cd-names.json` | 编辑 | 大陆名标注点（今天的名字）+ 超大陆名标注点（`name-pangaea`、`name-gondwana`、`name-sibumasu`、`name-sukhothai-arc`），每个挂一个 plate ID 与显示年代窗（窗口端点必须有来源，来自 CD22/CD24 补取结果）。 | Atlas |
| `cd-seafloor.json` | DL4 | `seafloor-bands.py`：按 DS08 分档成面（复用 dinosaur-earth `build.py` 的格网→多边形思路，无新依赖），简化，静态，不带 plate ID。 | CC BY 4.0 改编，署名 Seton et al. 2020 |
| `cd-stripes.json` | DL5 | 按 DS09 切片、分正负成面、简化，静态。 | NOAA 条款 |
| `cd-gps.json` | DL6 | 选 4–8 个站：NTUS、REYK、冰岛东侧站、澳大利亚站，以及各大板块代表站各一（构建脚本列选择理由）；每站 `{id, at, vNorthMm, vEastMm, frame:'IGS14', epoch:'2026-01-01', source}`；箭头长度按显示比例（S30）画，图例写比例。 | 事实数值署 JPL |
| `cd-manifest.json` | 以上 | 清单：modelId、范围、文件 stem、LOD 名、来源 id、方法说明（双语）。 | — |

**golden 夹具**（只进 `tests/fixtures/continental-drift/`，不部署）：`golden.py` 用 pygplates 直接对 DL1 重建 200 个随机今天坐标点（覆盖所有用到的 plate ID）在年代集合 {0, 0.05, 1, 7.3, 49.95, 50, 123.4, 199.9, 200, 250.25, 300, 333.3, 399.9, 400} 以及**每个固定板块切换年代 ±0.05** 的位置，加每个化石 / 冰川 / 新加坡点在各拍年代的位置。

### 3.3 管线校验（构建报告必须打印）

1. DL1 解压后文件清单与 SM2_ReadMe 一致（CD17）；版本 v1.2.4。
2. 覆盖检查：每 1 Myr，七大今天大陆（按 plate ID 组）都有有效海岸要素；不满足的年代列出 → 决定 D2 起点。
3. 每个 LOD：环闭合、零面积 0、自交 0（`scripts/geo/lib/rings.ts`）；顶点数 ≤ DS03。
4. 点分配：每类点分到板块的数量、未分到的点及原因；新加坡点的 plate ID 及其上级链。
5. 旋转抽取：`cd-rotations.json` 再用 pygplates 加载（转回 `.rot` 文本）重建 golden 点，与直接用 DL1 的结果差 = 0（证明抽取没丢极）。
6. 体积：`public/geo/cd-*` 合计 ≤ 2.0 MB（原始字节），首屏需要的（rotations + land 两档 + names + manifest）≤ 600 KB gz。

### 3.4 对象 id 清单（共享命名空间，已查无与章节 / 名词重名）

- 点：`site-singapore`；`glacial-dwyka`、`glacial-itarare`、`glacial-talchir`、`glacial-wynyard`、`glacial-pagoda`；`belt-appalachians`、`belt-east-greenland`、`belt-scottish-highlands`、`belt-scandinavian-caledonides`；`ridge-mid-atlantic`、`site-reykjanes`（只 0 Ma）；`gps-ntus`、`gps-reyk`、`gps-iceland-east`、`gps-australia` 及其余选中站 `gps-<station>`。
- 组：`taxon-mesosaurus`、`taxon-glossopteris`、`taxon-lystrosaurus`、`taxon-cynognathus`（成员是 PBDB collection 点，id `pbdb-col-<n>`）。
- 标注：`name-pangaea`、`name-gondwana`、`name-sibumasu`、`name-sukhothai-arc`，以及今天大陆名 `name-africa` 等（只标注，不进 index）。
- 名词 `term-*`（§6.1）；预设 `preset-world`、`preset-atlantic`、`preset-southeast-asia`、`preset-iceland`（只用于 0 Ma）。
- `entities.json = []`、`events.json = []`、`movements.json = []`；`control.json` 只放两个空帧（400、0 Ma）用于时间范围，不造 holder / 阵营。

---

## 4. 引擎扩展（E-CD1–E-CD4，压到最小）

### 4.0 现实核对

已读：`src/engines/time-scene/reconstruction-map.ts`（dinosaur-earth 的离散重建主图，184 行）、`lib/reconstruction.ts`（离散帧选择与缓存）、`deep-time.ts`（清单 schema）、`stages/geo/GeoStage.tsx:77`（按 `basemap.reconstruction` 懒加载重建主图）、`src/content/schema/topic.ts:96–100,274–277`（basemap 互斥分支）、`View.tsx:332`（重建主题**不做**时间缓动）、`lib/segmentScale.ts`（章节段起点有序、允许重叠）、`scripts/js-budget.ts`（time-scene 棘轮 **452 KB gz**；2026-11-12 实测 TimeScene 峰值 449.05 KB，余量约 3 KB）。依赖：`maplibre-gl 5.24.0`、`topojson-client 3.1.0`，无 d3-geo、无投影库。

可复用：MapLibre 单实例与 HUD framing、TopoJSON 解码（`decodeTopologyObject`）、主题色 token、Ma 时间与 `maDigits`、拍 / URL `b` / 演示、引线标注系统（`stages/geo/leaders.ts`）、inspector 与来源弹层、`geology()` 测试 API 外壳。

不做：变形网格、自己的投影库、第二个 MapLibre、WebGL 自定义图层（顶点着色器里旋转更快，但代码量与 globe 兼容风险大，留作 §4.7 超预算时的后备方案）。

| 编号 | 内容 | 新 / 改文件 |
|---|---|---|
| E-CD1 | 旋转数学（纯函数）：读 `cd-rotations.json`，任意年代算任意板块的有限旋转（GPlates 规则） | 新 `src/engines/time-scene/lib/plateRotation.ts`；测试 `tests/time-scene/plate-rotation.test.ts` |
| E-CD2 | 转动主图分支：`basemap.rotation`；每次年代变化旋转多边形、按有效期过滤、跨日界线与含极点处理、两档细节、合并更新；0 Ma 静态图层；时间缓动 | 新 `lib/rotatedGeometry.ts`、`rotation-map.ts`；改 `content/schema/topic.ts`、`deep-time.ts`（加 rotation 清单 schema）、`stages/geo/GeoStage.tsx`（加一条懒加载分支）、`View.tsx`（缓动条件 + PLATE 读数 + 测试 API）、`scripts/validate-content.ts` |
| E-CD3 | 挂在板块上的对象：点 / 组 / 标注随板块转动，高亮与引线、inspector、章内 index、新加坡轨迹 | `rotation-map.ts` 内；inspector 复用 dinosaur-earth 的点详情展示部分（若与 `ModernInset` 耦合，抽出纯展示组件，不改其行为）；`scripts/shoot.ts` 高亮检查纳入这些 `data-id` |
| E-CD4 | `projection: 'globe' \| 'mercator'`（D4 选 globe 才做） | `rotation-map.ts` 创建地图时设置；`lib/hud-framing.ts` 若 globe 下失效再最小修 |

### 4.1 E-CD1：旋转数学

```ts
// cd-rotations.json（构建产物，数值原样来自 .rot）
{ version: 1, modelId: 'merdith2021', anchorPlateId: number,
  sequences: [{ moving: number, fixed: number,
    poles: [ageMa: number, latDeg: number, lonDeg: number, angleDeg: number][] }] }
// 同一 (moving, fixed) 可有多段序列；每段 ageMa 严格递增；不同段的年代区间只在端点相接。

export function createRotationModel(json): RotationModel
interface RotationModel {
  /** 板块相对锚定板块在 ma 的有限旋转，单位四元数 [w,x,y,z]，Float64。超出模型范围返回 null。 */
  rotation(plateId: number, ma: number): Quat | null;
  /** 今天单位向量 → ma 时位置（经纬度，度）。 */
  rotatePoint(plateId: number, ma: number, lonLat: [number, number]): [number, number] | null;
}
```

规则（与 GPlates 对齐，以 §4.6 金标为准，不以文档描述为准）：

1. 载入时把每条极（lat, lon, angle）转为四元数：轴 = 极的单位向量，角 = angle；角为 0 的极是单位四元数。
2. 求板块 P 在年代 t 的相对旋转：在 P 作为 moving 的序列中找区间包含 t 的那段（端点相接时取 pygplates 金标所示一侧，实现时用金标里切换年代 ±0.05 的点定死规则）；在相邻两极 (t0,q0)、(t1,q1) 之间按 `(t−t0)/(t1−t0)` 做 slerp，`dot(q0,q1)<0` 时先取反 q1 走短弧；t 恰为极年代时直接取该极。
3. 合成：`R(P,t) = R(fixed,t) ∘ R_rel(P→fixed,t)`，递归到 anchor（R(anchor)=单位）。同一 t 内用 Map 记忆化，换 t 清空。环检测：上级链出现循环 → 抛错（构建期 schema 就该拦住）。
4. 全程 Float64；年代输入先 clamp 到 [0, 400]（或 D2 定的起点）。

预计代码 ≤ 120 行。

### 4.2 E-CD2：转动主图

**topic 配置**（与 `local / region / reconstruction` 四选一）：

```yaml
basemap:
  rotation: { file: cd-manifest, projection: globe }   # projection 由 D4 定
```

`cd-manifest.json`（strict schema，加在 `deep-time.ts`）：

```ts
{ version: 1, modelId: 'merdith2021', modelLabel: Bi, coordinateSpace: 'rotated-present-day',
  rangeMa: [number, number],            // [400, 0]
  rotations: AssetId,
  layers: [{ id: LayerId, file: AssetId, kind: 'fill' | 'line' | 'point' | 'label',
             motion: 'plate' | 'present-only',    // plate = 随板块转；present-only = 只在 0 Ma 显示且不转
             lod?: { scrub: string, full: string } // TopoJSON 对象名
           }],
  method: Bi, sources: string[] }
```

校验（`validate-content.ts` 实读文件）：清单与每个文件存在且可解码；`plate` 图层每个要素有整数 `plateId` 且能在 rotations 中解析到 anchor（`rangeMa` 内任一年代）；`from >= to`、有限；`present-only` 图层无 plateId；所有 point / label / group id 进全局 id 注册并与章节、名词、预设不重名；章节 / 拍的 `highlight`、`index` 只引用存在的对象；拍 `t` 在 `rangeMa` 内；`rotation` 不得与 `datedLayers`、`modernInset` 并用；本题实体 / 事件 / 行动必须为空。

**每次年代变化**（`rotatedGeometry.ts`，纯函数，可单测）：

1. 载入时每个顶点预计算今天的单位向量（Float64Array，3×N）；每个要素记 plateId、有效期、所属环的偏移。
2. 年代 t：过滤 `to <= t <= from` 的要素；每个 plateId 只算一次旋转矩阵（3×3），顶点矩阵乘 → `atan2` / `asin` 得经纬度。
3. 跨日界线：沿环把经度"展开"成连续值（相邻点差 > 180° 时加减 360°），交给 MapLibre / geojson-vt 自己按世界副本切分；不手工切环。
4. 含极点的环：展开后首尾经度差为 ±360° 即包住一个极；在环尾按该极补两点 `(lonEnd, ±90)`、`(lonStart, ±90)` 闭合。合成夹具：一个包住南极的环、一个跨 ±180 的环、一个同时跨两者的环，globe 与 mercator 下都不出现横贯全图的直线或反色填充。
5. 产出 GeoJSON FeatureCollection（复用数组，避免每帧分配新大对象），属性带 `kind` 与对象 id。

**更新调度**（`rotation-map.ts`）：

- 所选年代来自 playhead（`selectedMa = −playhead/1e6`），与 dinosaur-earth 相同；按 `maDigits` 量化后相同则不重算。
- 拖动、缓动期间用快档；停止 300 ms 后换细档（DS03）。
- 每个 source 同时最多一个 `setData` 在途；在途时到来的新年代只记"最新待算"，完成后只算最新一个（丢弃中间帧，不排队）。
- GeoJSON source 设 `maxzoom: 4`（主图最大 zoom 沿用 3.6）以减少切片量。
- `present-only` 图层：量化年代 = 0.0 才 `visibility: visible`（DS04），不随年代重算。
- 年代缓动：`View.tsx:332` 当前对 `reconstructed` 主题禁缓动；改为"离散重建禁缓动、旋转主图允许缓动"（每一帧都是模型真实结果，缓动经过的中间年代也是真结果）。`prefers-reduced-motion` 直接跳。
- 静止时不跑 rAF，不分配。
- 换主题色只改 paint，不重传几何（沿用 reconstruction-map 做法）。

**输出 / 读数**：`RotationStats = { selectedMa, modelId, status: 'loading'|'ready'|'unavailable', lod: 'scrub'|'full', geometryUpdates, verticesDrawn, featuresDrawn, presentOnlyVisible: boolean, lastUpdateMs }`。PLATE 左列显示：所选年代、模型名（MERDITH 2021 · ROTATION）、"Continuous rotation, today's coastlines · east–west positions are a model convention / 连续旋转，今天的海岸线 · 东西位置为模型约定"、投影名。底部只保留章节轴。`__atlas.engine.geology()` 增加 `rotation` 字段（与 `reconstruction` 平级）。失败（文件缺 / 解码错）显示双语 unavailable，不回退任何现代底图。

### 4.3 E-CD3：挂在板块上的对象

- 点、组、标注都走 E-CD2 的同一旋转；引线锚点 = 当前年代的旋转后坐标，每次几何更新后通知 `leaders.ts` 重排（只在高亮对象上，不对全部 PBDB 点）。
- `taxon-*` 组：高亮时组内全部成员加强显示，引线只挂代表点。点击单个 PBDB 点 → inspector 显示 collection、各 occurrence 年龄区间与文献；点击组 → 组说明。
- 标注 `name-*` 只在自身年代窗内显示；窗外被高亮时 shoot 报错（拍写错了）。
- 新加坡轨迹：`cd-singapore` 打开时，从当前年代到 0 Ma 每 1 Myr 算一个点连成线（DS07），挂 `data-id="site-singapore-trail"`；超出点所在多边形有效期的年代不画。
- 章内 index：`timeChapterState.index?: string[]`（dinosaur-earth 已有字段则复用），只收本题 point / group id；点 index 项 = 选中 + 镜头飞到该对象在**当前年代**的位置。
- 所有可点目标 ≥ 44 px（密集 PBDB 点靠聚合 + 列表），键盘可达，不依赖 hover。

### 4.4 E-CD4：投影开关（D4 = globe 时）

`new MlMap({ ..., projection: { type: 'globe' } })`（或 style 的 projection 字段，以 5.24 实际 API 为准，CD43）。必须实测：hud-framing 的"自由舞台矩形"取景在 globe 下仍正确；拖动 / 双指缩放；dark plate 下球外背景色用 token；极区（> 85°）显示有无空洞——若有，用 token 色的极区圆盘图层盖住并在 PLATE 注明，不假装有数据。墨卡托路径保持 dinosaur-earth 的 ±85.051129° 规则。

### 4.5 URL 与状态

不新增 URL 字段：复用 `t=<n>ma`（`maDigits: 1`）、`b`、`cam`、`layers`、`hl`。`cam` 在旋转主图里是屏幕镜头（经纬度是当前投影下的视点），刷新后原样恢复；不尝试"跟随板块"。

### 4.6 测试

| 用例 | 输入 | 必须 |
|---|---|---|
| 金标（E-CD1） | golden.json 全部点 × 年代 | 每点经纬度差 ≤ 0.001°（大圆距离）；固定板块切换年代 ±0.05 全部通过 |
| 端点 | t = 0 | 所有 plateId 旋转为单位（或模型 0 Ma 极给出的值，以金标为准）；点位置与今天坐标差 ≤ 0.001° |
| 短弧 | 合成两极 dot<0 | slerp 走短弧，结果与 pygplates 一致 |
| 抽取无损（§3.3-5） | 抽取 JSON vs 原 .rot | 金标差 0 |
| 有效期 | 合成要素 from=150,to=50 | t=151 不出现；150、50 出现；49.9 不出现 |
| 日界线 / 极点（E-CD2） | 三个合成环 | 无横贯直线、无反色；面积（球面）与原环一致 ±0.1% |
| 调度 | 连续 50 次年代变化，模拟 worker 延迟 | `setData` 在途 ≤ 1；最终画面 = 最后一次年代；`geometryUpdates` 不随同一量化年代增加 |
| present-only | t=0.0 / 0.1 | 0.0 显示，0.1 隐藏，且不触发重算 |
| 缓动 | 拍 300→0 | 经过的中间年代每帧 `selectedMa` 单调、几何来自同一模型；reduced-motion 下一步到位 |
| 回归 | dinosaur-earth、sample-deep-time、ww2、plates-and-hazards | 行为与截图不变；`View.tsx:332` 对离散重建仍不缓动 |
| schema 错误 | 未知 plateId、循环上级链、from<to、present-only 带 plateId、hl 悬空、与 datedLayers 并用 | 每项构建失败、报错明确 |
| 夹具主题 | 新 draft `sample-plate-rotation`：3 块合成板块、2 段序列含一次固定板块切换、1 个含极点环、1 个跨日界线环、2 个点、1 个组 | `pnpm validate` 绿；e2e 拖动 / 拍 / 深链 / 两主题 / 两语言 |

全部用 vitest / Playwright，不加依赖。合成数字标 TEST，不进学生内容。

### 4.7 性能与体积预算

- **JS**：`rotation-map.ts` + `rotatedGeometry.ts` + `plateRotation.ts` 只在 `basemap.rotation` 主题懒加载，合计 ≤ 8 KB gz（目标 6）。`View.tsx` / `GeoStage.tsx` / schema 的改动对**所有** TimeScene 页面的静态闭包增量 ≤ 0.5 KB gz。`pnpm tsx scripts/js-budget.ts --check`：continental-drift 与全部现有 TimeScene 主题都 ≤ 452 KB（棘轮不上调）。超了先拆 chunk，不提预算。
- **数据**：§3.3-6。
- **运行时**（真 iPad，记录型号、iPadOS、Safari / Capacitor 版本；不用 SwiftShader 数字）：
  - 快档单次更新主线程（旋转 + 组装 GeoJSON）p95 ≤ 8 ms；细档 p95 ≤ 20 ms。
  - 拖动时地图实际刷新 ≥ 15 次 / 秒（以 `geometryUpdates` 计）；松手后 ≤ 300 ms 内细档到位。
  - 拍间 1.6 s 缓动期间无长任务 > 50 ms。
  - 静止 CPU 无持续 rAF；额外内存 ≤ 60 MB。
  - 估算依据（设计值，S30）：40,000 顶点 × 每顶点一次 3×3 乘与 atan2 / asin，在 iPad JIT 下约 2–4 ms；主要代价在 worker 侧 geojson-vt 切片，故用快档 + 单在途 + `maxzoom: 4`。实测不达标的后备顺序：降快档顶点数 → 只在松手后算细档 → WebGL 自定义图层（需 Gavin 再批）。
- 首次进入：rotations + land 两档 + names + manifest 一次加载；seafloor / stripes / gps 在第一个列出它们的章节进入时加载。

### 4.8 来源说明怎么写（SOURCES.md / SOURCES-GEO.md / PLATE）

- EN："Continents are today's coastlines (Merdith et al. 2021, CC BY 4.0) rotated with the same model's rotation file. Each frame is the model's position for the selected age, computed in the browser by interpolating between the model's total rotation poles the way GPlates does (checked against pyGPlates to within 0.001°). Between poles, positions come from this interpolation, not from separate observations. Plates are rigid; east–west positions are a model convention."
- ZH："大陆轮廓是今天的海岸线（Merdith 等 2021，CC BY 4.0），按同一模型的旋转文件转动。每一帧都是模型在所选年代给出的位置：浏览器按 GPlates 的方法在模型的总重建极之间插值计算（与 pyGPlates 核对，误差不超过 0.001°）。两个极之间的位置来自插值，不是独立观测。板块按刚体处理；东西方向的位置是模型约定。"
- SOURCES-GEO.md 逐文件记：输入 → 脚本 → 参数（简化容差、LOD 顶点数、面积阈值、分档）→ 产物字节 / 哈希 → 校验结果（§3.3）。

---

## 5. 插图需求（外包 Codex 生成，严格验收）

### 5.0 共同规则

- 风格：现有技术图版石墨铅笔画（细排线 + 点描），纯中性灰（R=G=B），透明底，无纸色底、无边框。
- **一律不许出现**：任何文字、字母、数字、刻度、比例尺、箭头、标注线、图例、徽标、旗帜、品牌、水印、签名；人物、手、动物活体（第 3 张只画化石）；地图轮廓、地球仪、大陆形状（AI 画的轮廓会被当成数据）；火焰、发光岩浆、爆炸。
- 关系正确优先于好看（docs/69 教训）：凡有几何关系的（对称、平行、数量），**Codex 先用代码（SVG）画几何骨架，再加石墨质感**，并输出一个检查脚本证明关系成立；不接受纯 AI 一次生成的关系图。
- cinema 主题会整体反相（`.atlas-drawing`）：图注不得依赖"深色 = 某种含义"。
- 交付：PNG 原图 + `art/planned/continental-drift/manifest.jsonl` 每张一行（照 dinosaur-earth 格式：`dimensions`、`neutralGreyscale`、`alphaExtrema`、`alphaBBox`、`canvasOccupancyWH`、`visualCounts`、`visualReview`）；`prompts.json` 存提示词与代码。处理用 `scripts/illustrate.ts process|figure`。
- 验收：主会话逐张原尺寸打开 + 局部放大，逐条对下表"事实约束"与"验收"打勾；paper 与 cinema 各合成一次看；任何一条不过 → 重做，不靠图注圆。

### 5.1 清单

| id / 文件 | 用途 | 画什么 | 事实约束 | 不许 | 验收（可数的） |
|---|---|---|---|---|---|
| IMG-1 `continental-drift.png` 1024×1024 | 封面；第 07 章细看复用为图 | 一块斜俯视的洋底剖切块体：中央洋脊有一道纵向裂谷，洋壳表面有与洋脊平行的明暗条带，块体侧面露出上层洋壳（不画地幔细节） | 条带**以裂谷中线镜像对称**：每对条带宽度差 ≤ 3%；条带宽度不相等、不规则（至少 6 对，宽窄交替无规律）；条带与洋脊平行；离洋脊越远块体表面略低（洋底随年龄加深）| 岩浆、火光、熔岩海、箭头、海水波浪、鱼、船、"录音带"等比喻物 | 代码骨架输出各条带边界坐标，脚本断言对称与平行；`visualCounts: {blocks:1, rift_valleys:1, stripe_pairs:≥6}` |
| IMG-2 `continental-drift-striated-rock.png` 1536×1152 | 第 02 章细看 | 一块被冰川磨光的基岩面，表面有许多平行擦痕与几道较深的槽，近旁另一块冰碛岩断面：细泥中夹大小不一、带棱角的石块 | 擦痕基本平行（主方向 ±10° 内）、直、长短不一；冰碛岩中石块**大小悬殊、排列杂乱、有棱角**（与河流卵石区分）| 冰、雪、冰川体、人、工具、锤子、标尺、水 | `visualCounts: {bedrock_surfaces:1, tillite_blocks:1}`；擦痕主方向统计（代码骨架）在 ±10° 内 |
| IMG-3 `continental-drift-four-fossils.png` 1536×1152 | 第 03 章细看 | 2×2 等大格：中龙骨架、舌羊齿叶化石、水龙兽头骨、犬颌兽头骨，各自在一块岩板上 | 形态以补取的博物馆 / 论文资料为准（CD26 同批，参考图放 `scripts/geo/continental-drift/refs/`，不进 git）：中龙——细长身体、长尾、极长窄吻部与细密针状牙；舌羊齿——舌形叶、明显中脉、网状叶脉；水龙兽——短吻、有一对獠牙、无其他牙齿的喙；犬颌兽——大头骨、牙齿分化（门齿、犬齿、颊齿可分）。四格**不表示相对大小**（图注写"不按比例"）| 活体复原、肉、皮肤、颜色、恐龙、人、比例尺、标签 | `visualCounts: {panels:4, mesosaurus_skeletons:1, glossopteris_leaves:1, lystrosaurus_skulls:1, lystrosaurus_tusks:2, cynognathus_skulls:1}`；主会话对照参考图逐项核形态；有一项不符重做 |
| IMG-4 `continental-drift-granite.png` 1536×1152 | 第 04 章细看 | 一块手标本大小的粗粒花岗岩，一面切平抛光、其余为自然断口 | 晶粒互相嵌合（无基质包裹）、粒径毫米到厘米级；三种可辨矿物：较大的淡色长石（部分可见解理面）、灰色半透明石英、细小深色黑云母片；**不声称是武吉知马的样本**（图注"通用花岗岩"）| 文字、标尺、底座、品牌、人手、晶洞水晶 | `visualCounts: {rock_specimens:1, polished_faces:1}`；三类晶体都可在放大图中指认 |
| IMG-5 `continental-drift-gnss-pillar.png` 1536×1152 | 第 08 章细看 | 一座测量用 GNSS 天线墩：混凝土立柱顶部的强制对中螺栓上装一具扼流圈天线（扁圆顶罩下有同心环），一根电缆沿柱身向下 | 只有一个天线；天线水平安装；不画卫星、信号波、光线；**不表示 NTUS 实物**（图注"通用 GNSS 测站"）| 品牌、型号、文字、栅栏上的标牌、人、卫星、信号弧线 | `visualCounts: {pillars:1, antennas:1, satellites:0}` |

图注（EN / ZH）与 alt 在施工时按上表"事实约束"写成双语，必须包含"通用 / 示意 / 不按比例"等限定；不写任何数字。

---

## 6. 写法与用词表

### 6.1 名词表（15 项，`term-` 前缀；各语言只包全题第一次出现）

| id | EN / ZH | 定义范围 | 事实 |
|---|---|---|---|
| term-continental-drift | continental drift / 大陆漂移 | 魏格纳提出的"大陆会移动"的假说；与后来的板块构造不同，后者包括洋底。 | CD01,CD03 |
| term-plate-tectonics | plate tectonics / 板块构造 | 地球外壳分成多块刚性板块并相对运动的理论，1960 年代后期归纳成形。 | CD32,CD36 |
| term-supercontinent | supercontinent / 超大陆 | 大部分大陆连成一块的状态。 | CD24 |
| term-pangaea | Pangaea / 盘古大陆 | 约 3 亿年前前后形成、约 2 亿年前开始分裂的超大陆（数值待 CD24）。 | CD24 |
| term-gondwana | Gondwana / 冈瓦纳 | 南方的大陆群，包括今天的南美、非洲、印度、澳大利亚、南极洲。 | CD24 |
| term-ma | Ma / 百万年前 | 同 dinosaur-earth 的定义口径。 | — |
| term-plate-model | plate reconstruction model / 板块重建模型 | 用古地磁、洋底与地质证据推算板块过去位置的模型；不是照片。 | CD13 |
| term-euler-pole | rotation pole (Euler pole) / 旋转极（欧拉极） | 板块在球面上移动可看作绕穿过地心的一根轴转动，轴与地表的交点就是这个极。 | CD42 |
| term-glacial-striations | glacial striations / 冰川擦痕 | 冰川夹带的石块刮过基岩留下的平行划痕。 | CD38 |
| term-mid-ocean-ridge | mid-ocean ridge / 洋中脊 | 大洋底部绵延的海底山脉，新洋壳在这里生成。 | CD07,CD08 |
| term-seafloor-spreading | seafloor spreading / 海底扩张 | 新洋底在洋中脊生成并向两侧推开。 | CD08 |
| term-magnetic-reversal | magnetic reversal / 地磁倒转 | 地球磁场南北方向互换。 | CD11 |
| term-magnetic-stripes | magnetic stripes / 磁条带 | 洋底岩石记录的磁性形成与洋中脊平行、两侧对称的条带。 | CD09 |
| term-gnss | GPS / GNSS / 卫星定位 | 用卫星信号测定地面点位置；长期测量能得到每年几毫米到几厘米的移动。 | CD18 |
| term-sundaland | Sundaland / 巽他古陆 | 海平面较低时露出的巽他陆架陆地；与板块漂移无关。 | CD35 |

### 6.2 用词表

| 不写 | 写 | 理由 |
|---|---|---|
| 大陆在洋底上漂 / 犁过洋底 | 板块（包括大陆和洋底）一起移动 | 必须讲对 5 |
| 地图显示 3 亿年前的海岸线 | 模型把今天的海岸线带回 3 亿年前 | 必须讲对 1 |
| 新加坡 3 亿年前在东经 X 度 | 新加坡脚下的地块在模型里位于……（只讲相对位置、纬度带） | 必须讲对 3 |
| 魏格纳被嘲笑 / 学界顽固 / 终于证明他是对的 | 多数地质学家不接受，理由是……；后来的证据支持大陆会移动 | 客观，不用评价词 |
| 魏格纳发现了板块构造 | 魏格纳提出大陆漂移；板块构造是 1960 年代后期归纳的 | 必须讲对 5 |
| 撒普被埋没 / 抢功 | 当年由希曾署名发表，撒普的贡献后来才得到承认 | 只写事实 |
| 板块和指甲长得一样快 | 同一量级 / 差不多一样慢（每年几厘米） | CD21 |
| 新加坡每年移动 2.8 cm（不带参照） | 新加坡的 GPS 站相对全球参考框架每年约 2.8 cm | 必须讲对 7 |
| 未来会形成某某超大陆 | 有科学家推测……另一些模型给出……都是推测 | D8 |
| 巽他古陆是漂过来的 | 巽他古陆是海平面低时露出的陆地 | 必须讲对 8 |
| 地幔是熔岩 / 大陆浮在岩浆上 | 地幔大部分是固体，能在很长时间里缓慢变形（链 inside-the-earth） | 与姊妹题一致 |
| 我们的地球 / 我们的大陆 | 地球 / 这块大陆 | 全站规则 |

中文译名（D12）：魏格纳 Alfred Wegener；杜托伊特 Alexander du Toit；霍姆斯 Arthur Holmes；赫斯 Harry Hess；迪茨 Robert Dietz；玛丽·撒普 Marie Tharp；希曾 Bruce Heezen；瓦因 Fred Vine；马修斯 Drummond Matthews；莫利 Lawrence Morley；威尔逊 J. Tuzo Wilson；松山基范 Motonori Matuyama；盘古大陆 Pangaea；冈瓦纳 Gondwana；滇缅马苏 Sibumasu；苏可泰岛弧 Sukhothai Arc；文冬–劳勿缝合带 Bentong–Raub Suture；巽他板块 Sunda plate（与 plates-and-hazards 一致）；巽他古陆 Sundaland；武吉知马 Bukit Timah；舌羊齿 *Glossopteris*；中龙 *Mesosaurus*；水龙兽 *Lystrosaurus*；犬颌兽 *Cynognathus*；雷恰内斯洋脊 Reykjanes Ridge。

数字写法：正文取整加"约"，精确值进细看；`<Num s="S#">` 只包数量（cm、km、mm、百分比），不包年份与 Ma（同 dinosaur-earth：Ma 是时间坐标）；冲突来源并列（CD11、CD20），不取平均。

---

## 7. 验收清单（施工后逐项打勾；本轮均未执行）

- [ ] **事实补取**：§0.3 全部 `snippet` / `todo` 改为 `read` 或 `cut`；cut 的内容从正文 / 字幕 / 细看 / 名词 / 图注删除；更新合计行。
- [ ] DL1–DL6 经批准下载；`INVENTORY.json` 哈希与上游一致；原料不进 git、不部署。
- [ ] §3.3 六项构建报告全部通过；D2 起点按覆盖检查确定并回写本文。
- [ ] E-CD1 金标全过（≤ 0.001°，含固定板块切换年代）；抽取无损。D3 若退回方案 B，§4.8 来源说明改写并实测样本间最大偏差。
- [ ] E-CD2–E-CD4 测试与夹具主题 `sample-plate-rotation` 全绿；dinosaur-earth / sample-deep-time / ww2 / plates-and-hazards 回归无变化。
- [ ] 先做 400 Ma 与 0 Ma 两帧 + 新加坡轨迹，主会话对照 GPlates（pygplates 渲染图）并排目视，再铺 39 拍。
- [ ] 每拍字幕对照实际模型画面复核（§2.2 规则），不符改字幕或 `t`。
- [ ] 背景 + 8 章 EN/ZH 正文、细看、39 拍字幕、15 名词、来源全部到位；无 TODO / 占位 / 死代码 / console 噪音。
- [ ] 遵守 docs/08 §2：底部只有章节轴；PLATE 读数在左列；选中详情在阅读面板章头下；本章 index 能点到所有提到的对象；点章 / 拍不自动播放；P 从当前拍开始。
- [ ] 两主题（paper / cinema）× 两语言；1024×768、900×1200、390×844 无重叠；可点目标 ≥ 44 px；不依赖 hover。
- [ ] 纯静态、零运行时外部请求、离线可用（断网 e2e）。
- [ ] JS 预算：`js-budget --check` 全题 ≤ 452 KB；懒 chunk ≤ 8 KB gz；其他 TimeScene 题增量 ≤ 0.5 KB。数据 ≤ 2.0 MB、首屏 ≤ 600 KB gz。
- [ ] 真 iPad 性能按 §4.7 记录（设备、方法、数值），未达标按后备顺序处理，不偷偷放宽。
- [ ] 5 张插图逐张按 §5 验收，manifest 齐全；cinema 反相下含义不变。
- [ ] `data/SOURCES.md`、`SOURCES-GEO.md`、`LICENSE-CONTENT` / `THIRD-PARTY-NOTICES` 记录 Merdith（CC BY 4.0，改编说明）、Seton（CC BY 4.0）、PBDB、EMAG2、JPL、pygplates（仅工具）。
- [ ] 门槛：`pnpm check`、`pnpm validate`（0 error / 0 warning）、`pnpm test`、`pnpm build`、`pnpm e2e`（先 build）；`pnpm shoot continental-drift --locale all --theme all --layout --keys --beats` 逐图看，"unlabelled highlights" 与 "chapter highlights" 清单为空。
- [ ] docs/06 补"旋转主图"一节；本文 §9 填施工记录。全绿后改 `published`（D10）。

---

## 8. 来源表

`sources.json` 施工时按全站 S# 编号重排；下表是本 spec 的工作编号。外链只供读者主动打开，运行时不请求。

| id | 来源 | 本题用途 / 状态 |
|---|---|---|
| S01 | NASA Earth Observatory，[Alfred Wegener](https://science.nasa.gov/earth/earth-observatory/alfred-wegener)（原 earthobservatory.nasa.gov/features/Wegener） | CD01–CD06；read |
| S02 | Merdith et al. 2021, *Earth-Science Reviews* 214:103477，[EarthByte 页](https://www.earthbyte.org/extending-full-plate-tectonic-models-into-deep-time-linking-the-neoproterozoic-and-the-phanerozoic/)；[ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0012825220305237) | CD13、CD37（正文待取）；DOI 字符串取原页确认 |
| S03 | Zenodo，[Merdith 模型 v1.2.4](https://zenodo.org/records/13635864)（[API](https://zenodo.org/api/records/13635864)） | CD14、CD15；read |
| S04 | EarthByte，[SM2_ReadMe.txt](https://www.earthbyte.org/webdav/ftp/Data_Collections/Merdith_etal_2021_ESR/SM2_ReadMe.txt) | CD13、CD14、CD17；read |
| S05 | Zenodo，[Müller et al. 2019 v3.0](https://zenodo.org/records/11601026) | CD16；read；不采用 |
| S06 | NASA JPL，[GNSS Time Series 速度表 table2](https://sideshow.jpl.nasa.gov/post/tables/table2.html) | CD18、CD19；read；施工时存快照 |
| S07 | Yaemsiri, Hou, Slade & Jiang 2010, *JEADV* 24(4)；索引 [BioNumbers 112380](https://bionumbers.hms.harvard.edu/bionumber.aspx?id=112380) | CD21；snippet |
| S08 | Geoscience Australia，[GDA2020](https://www.ga.gov.au/scientific-topics/positioning-navigation/geodesy/datums-projections/gda2020)；[Australia officially moves 1.8 metres northeast](https://www.ga.gov.au/news/news-archive/australia-officially-moves-1.8-metres-northeast) | CD20；snippet |
| S09 | Gillespie et al.，*The igneous rocks of Singapore: new insights to Palaeozoic and Mesozoic assembly of the Sukhothai Arc*（J. Asian Earth Sci.；NERC 开放库待定位） | CD22；snippet |
| S10 | Leslie et al.，[Singapore structural geology（NORA 525127）](https://nora.nerc.ac.uk/id/eprint/525127/1/SingaporeStructuralGeology_Leslie_et_al_Rev02.pdf) | CD22；snippet |
| S11 | Geological Society of London，[Pioneers of Plate Tectonics: Vine and Matthews](https://www.geolsoc.org.uk/Plate-Tectonics/Chap1-Pioneers-of-Plate-Tectonics/Vine-and-Matthews)（同系列赫斯、霍姆斯、威尔逊、撒普等页） | CD08–CD10、CD32、CD33、CD39；snippet / todo |
| S12 | Frankel，*Mappers of the Deep*，[LDEO Marie Tharp 网站 PDF](https://marietharp.ldeo.columbia.edu/sites/default/files/content/Tharp_Mappers%20of%20the%20Deep_MidAtlantic%20ridge%20discovery.pdf) | CD07；snippet |
| S13 | Vine & Matthews 1963, *Nature* 199:947–949 | CD09；书目 |
| S14 | Seton et al. 2020, *G-cubed*, doi:10.1029/2020GC009214；[EarthByte 数据页](https://www.earthbyte.org/a-global-dataset-of-present-day-oceanic-crustal-age-and-seafloor-spreading-parameters/) | CD28、CD29；snippet |
| S15 | NOAA NCEI，[EMAG2v3](https://www.ncei.noaa.gov/products/earth-magnetic-model-anomaly-grid-2)，doi:10.7289/V5H70CVX | CD30；snippet |
| S16 | PBDB 数据服务（§3.1 DL3 查询） | CD26、CD27、CD40；todo |
| S17 | Nance, Murphy & Santosh 2014, *Gondwana Research* 25:4–29（超大陆旋回综述） | CD24；todo |
| S18 | Blackburn et al. 2013, *Science* 340:941（中大西洋岩浆省年代） | CD24；todo |
| S19 | Montañez & Poulsen 2013, *Annual Review of Earth and Planetary Sciences* 41:629（晚古生代冰期） | CD25；todo |
| S20 | Metcalfe 2013, *Journal of Asian Earth Sciences* 66:1–33（冈瓦纳分散与亚洲增生） | CD22 交叉核对；todo |
| S21 | Davies, Green & Duarte 2018, *Global and Planetary Change* 169:133（下一个超大陆情景） | CD34；todo |
| S22 | Mitchell, Kilian & Evans 2012, *Nature* 482:208（亚美超大陆与古经度） | CD34、CD37；todo |
| S23 | Voris 2000, *Journal of Biogeography* 27:1153（东南亚更新世海平面图） | CD35；todo |
| S24 | IUGS / ICS 千叶阶 GSSP 文件（布容–松山界线） | CD11；snippet |
| S25 | 深海钻探计划第 3 航段报告（IODP 存档） | CD31；todo |
| S26 | GPlates / pyGPlates 文档（有限旋转插值） | CD42；todo |
| S27 | PyPI，[pygplates](https://pypi.org/project/pygplates/)（[JSON](https://pypi.org/pypi/pygplates/json)） | CD41；read |
| S28 | MapLibre GL JS 文档（globe 投影） | CD43；todo |
| S30 | 本题设计说明（`design: true`）：DS01–DS09、镜头、显示比例、算式 | §0.4 |

姊妹题沿用来源（复制条目，不跨题引用编号）：plates-and-hazards 的 PB2002 / MSS（CD23）、BGS 板块运动速率（CD36）。

---

## 9. 施工记录（施工后填写）

2026-11-15，分支 `claude/continental-drift`（Gavin 当日定稿：§0.1 全按默认、下载全批）。

### 9.1 事实补取结果（取代 §0.3 的状态列）

全部 43 条取原文复核：**read 40 / 部分 cut 6 / 整条 cut 0**；另补 CD24b–e（冈瓦纳、南大西洋、印度、北方大陆，Torsvik 等 2012）与“Sibumasu 名称”“奥特柳斯 1596”两条 read，“陆桥说”cut。与 §0.3 不同之处（正文按右栏写）：

| fact | 原口径 | 施工采用 |
|---|---|---|
| CD07 | 撒普贡献“后来才被承认” | 原文只说 1956 年由尤因、希曾宣布；照此写，不写“后来承认” |
| CD09 | 莫利投稿被拒（《自然》与 JGR） | 只保留“先投《自然》因缺数据被拒”（Linda Hall Library）；JGR 与月份 cut |
| CD10 | 1966 年测量 | 1963 年飞测、1966 年发表（Vine 1966《科学》） |
| CD11 | 77.3 / 78.6 万年并列 | 只有 772.9 ka 读到；78.6 万 cut；正文写“约 77.3 万年前” |
| CD20 | 北偏东；“自 1994 年 1.5 m” | 向东北；1.5 m cut，用 GDA2020 的 1.8 m |
| CD22 | 变形约 1.95 亿年前结束 | 碰撞约 2 亿–1.95 亿年前基本结束（Leslie）；Metcalfe 中–晚三叠世并列 |
| CD24 | 约 3.35 亿年前起聚合 | 约 3.2 亿年前起（Torsvik）；中大西洋约 1.95 亿年前张开 |
| CD26 | 水龙兽二叠纪末–早三叠世；犬颌兽吃肉 | 水龙兽早三叠世、可能植食；犬颌兽只写“似哺乳爬行动物”（饮食未读到，cut） |
| CD28 | 大多年轻于约 2 亿年 | “比 1.5 亿年老的洋底很少”（NOAA） |
| CD34 | 各情景署名 | 只保留 Mitchell 等 2012 的亚美；其余署名与“比邻盘古”cut |
| b07-1 | 约 5000 万年前碰撞 | 5000 万–4000 万年前（USGS） |
| D-细看 | 冰盖覆盖热带的替代解释；陆桥说 | 未取到来源，两块细看都删 |

### 9.2 实际建成

- 背景 + 8 章，**39 拍**。改动：b04-3 改为“2.1 亿年前地块随邻块北移”（滇缅马苏标注不建，见下）；b06-1 改为 195 Ma（Pangaea 名称窗 320–195 Ma）；b06-2 改为 155 Ma（最早洋底 M25）；b06-4 改为 80 Ma（印度 85 Ma 离开马达加斯加）；第 06 章代表年代因此为 80 Ma。
- **滇缅马苏 / 苏可泰岛弧标注未建**：模型中 603（Sino/Burma/Malaya）与新加坡所在 64701 在 250–195 Ma 一起移动，看不到合拢的大洋；按 §2.2 规则删标注，正文仍写名称来历与碰撞年代。
- 数据：DL1–DL6 全部下载并核对（DL1 md5 与上游一致），DL5 走 GMT 分块（1.56 MB，未下 175 MB 全球图）。哈希见 `scripts/geo/continental-drift/INVENTORY.json`。D2 起点保持 400 Ma（覆盖检查：400 Ma 时各大陆组今天海岸面积保留 75%–98%）。
- 引擎：E-CD1 方案 A（运行时按 GPlates 规则），12,380 个 pygplates 金标位置全部 ≤ 0.001°，含 236 个固定板块切换年代；切换年代的规则是 pyGPlates 重建树的建法（锚定板块起深度优先、子序列文件倒序、先到者得），不是“取哪一段”。E-CD2–E-CD4 见 docs/06“TimeScene · 旋转主图”。投影 globe。
- 未做：`sample-plate-rotation` 夹具主题（合成环 / 切换 / 抽取无损改由单测覆盖）；真 iPad 性能（只有桌面 Chromium 数字，见交付报告）；插图由 Codex 另做，本分支未引用任何图。

### 9.3 验收数字（2026-11-15）

- 门槛：`pnpm check` 0 error、`pnpm validate` 0 error / 0 warning、`pnpm test` 全绿、`pnpm build` 通过；e2e：`continental-drift`（5）、`sample-deep-time`、`time-scene-folds`、`smoke`、`plates-and-hazards`、`dinosaur-earth`。
- `pnpm shoot continental-drift`：四种 locale × theme 的 `--keys` 0 失败、`--layout` 0 问题（20 个尺寸，含 390×844、900×1200、1024×768）；`--beats`（en / paper）39 拍链接全部与演示一致，章节高亮全部在屏上。
- JS：TimeScene 静态闭包峰值 449.26 KB gz（改动前 449.05，+0.21 KB，≤ 452）；懒加载 `rotation-map` chunk（含 plateRotation、rotatedGeometry）7.25 KB gz（≤ 8），`rotation-ui` chunk 2.7 KB gz 另计。
- 数据：`public/geo/cd-*` 合计 1.99 × 10⁶ B（1.90 MiB）；首屏 231 KB gz。
- 性能（桌面 Chromium，Apple 芯片 Mac，1180×820 @2x；**不是 iPad 实测**）：拖动 400→0 Ma 3 秒，几何更新约 35 次 / 秒；快档单次主线程 p50 0.8 ms、p95 1.0 ms；细档约 1.2–1.5 ms；松手到细档到位约 335 ms（含 300 ms 等待）。真 iPad 数字待补。
