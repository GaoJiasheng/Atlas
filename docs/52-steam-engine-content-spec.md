# 52 · 瓦特蒸汽机 · 内容施工 spec（`steam-engine`，SpaceScene，v1）

2026-10-27 定稿。SpaceScene / Model3DStage，EN 默认、简体 ZH，paper 默认、cinema 可切。原型：旋转机械的横梁—汽缸—传动变体。读者沿动力和水的路径，解释压力差、分离冷凝、双作用、平行运动、太阳与行星齿轮及反馈。[se-006–011][se-013–015][se-024]

**上线方式：直接上线**，按 `docs/next-batch.md` §一；施工先为 draft，§8 全部验收后改 `status: published`。本文件完成内容规格，不表示引擎或生产主题已完成。姊妹主题 `industrial-revolution` 按其独立的历史草稿门槛处理。

阅读优先级：施工后填写的 §9 → 本规格 → 准备稿。`se-*` 对应主 checkout 的 `art/research/steam-engine/facts-extra.json`，`ir-*` 对应父 dossier 的 `facts.json`；本规格对这些事实的最终采用范围以 §0.3 为准。`D*` 是编辑决定，`S*` 是 §6 的施工来源编号。未标实测的几何与运行数值均为 S1 的 DESIGN / SIM。

## 0. 决定与核查

### 0.1 代 Gavin 作出的默认决定（供后续审阅，无待答阻塞项）

| # | 最终默认值 |
|---|---|
| D1 | 采用保存的 **1788 Lap engine，Science Museum Group 1861-46** 作参考。页面标题 Watt’s steam engine / 瓦特蒸汽机；不称馆方数字孪生或某年原厂复原，不画品牌铭牌。[se-001] |
| D2 | 内径采用 ASME 的 18.75 in；档案的 18 in 并列于细看，不解释差异成因。行程 4 ft；飞轮按 Hulse 的 16 ft，并标具名参考。外缘不画可数的取力齿，不选定冲突齿数。[se-002–005] |
| D3 | 背景 + 7 章、36 拍。历史年表限 Newcomen 与 Watt 的几个技术节点。社会史只作父主题导航，不把父档 20 条劳动、奴隶制、殖民经济与争论压成无条件结论；本页不放死亡、工时、寿命、奴隶人数或伤害场面。父主题仍须完整处理这些内容。 |
| D4 | 喷射式冷凝器、抽气泵、热井、部分给水与外来冷水/溢流都画出；空间布局与管径是重建。旧冷凝器插图只说明冷热分开，不能用来证明内部喷射系统。[se-009][se-021] |
| D5 | 保留刚性闭合的连续主机构。压力、功、三档调速器静态姿态、能量账本改用已有 `table`，删除新的 `steam` sim。主机运动是给定相位，不由压力求加速度。[se-017–020] |
| D6 | 调速器改为 **60/90/120 rpm 的独立静态比较**；不与主机速度、压力或负载联立，不模拟瞬态、静差、皮带比。三套姿态 `duration: 0`，避免独立插值拉开刚杆。主机运行拍隐藏调速器组；全景停机时可见。[se-019] |
| D7 | 四个配汽阀、节流阀片、节流连杆分成独立可选 part；不用新的命名 submesh / element 系统。调速器左右球和杆分别建 part；Newcomen 两侧的柔性链段也独立，避免把可变外露链长与刚性活塞烘焙在一起。teaching 不进右上链路卡，保留四列；06章14项索引全部保留。[se-010–011][se-019][ir-010] |
| D8 | 米、SI、绝压 `kPa abs / 千帕绝压`。杆径、间隙、压力、转速、能量比例为教学输入；不显示实机效率、耗煤、温度或轴功率。细看里的指示功率必须写“模型指示功率”。[se-017–020] |
| D9 | 中文采用“汽缸、平行运动机构、太阳与行星齿轮机构、热井、滑套、叉环”；Newcomen 译“纽科门”，Lap 保留英文。这些专名是编辑用语，未获新加坡专门中文来源核定。删课纲页码与 PSLE 必考声称。 |
| D10 | 三张图只取 `art/planned/steam-engine/` 的最终 PNG，不生成替代图。机械参考图只使用两张已存公有领域图；无真实网格、照片贴图或受限档案扫描。[se-021–022] |
| D11 | 不配录音、不默认测验、不自动翻章。四张试一试在 02、03、06、07；保留已有先猜后看与记录卡。底部只有章节轴，读数进 PLATE，详情与索引遵守 docs/08 §2。 |
| D12 | 主题派生文件属于 CC BY-NC-SA 4.0 family；公有领域参考原图各自保留 PD 身份。没有 CC BY-SA 输入，没有跨 share-alike 家族混合；施工登记 §3.6 的逐文件许可。 |

### 0.2 本轮核查方法与边界

重新抓取原始来源，日期 **2026-10-27**；没有逐字引文（0 词）。ASME PDF 读取完整 Lap 段（第 7/8 页），没有把紧邻的 Whitbread 尺寸套给 Lap。重新查看三张最终插图和 Ferguson fig.10；逐项核对 manifest 哈希、父快照与本地链接。模型审计脚本移除写盘语句后在内存重算，未改 dossier。

准备稿没有字面 `⚑` 标记；其 medium / 仅索引核查条目按同等标准处理。Mayr PDF 本轮抓取被工具的 42 MB 大小限制拒绝，删去 se-012；MOE 原 PDF 返回机器人验证，停止并删课纲断言；NASA 旧热力学 URL 失败，改用同机构现行原理页。工厂法/经济史来源的抓取与范围删减记录见下表；公开可读不代表素材可再分发。

### 0.3 事实处置表（按唯一 fact id 计数）

`verified` = 本轮原文或本地实物/计算确认；`changed` = 已确认依据，但缩窄、纠错或改成明确的设计模型；`cut` = 本主题不采用，可能是范围删减，也可能访问/证据不足，不能读成判定原事实为假。下表所有网页链接均为本轮实际抓取或尝试抓取的源。

| fact id | 处置 | 本轮结果与采用范围 | 来源 |
|---|---|---|---|
| `se-001` | verified | 馆藏年代、用途、结构及编号确认。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788) |
| `se-002` | verified | ASME 第 7 页 Lap 段确认内径/行程；按 S16 的 in/ft 定义独立换算，精度是单位换算精度。 | [原始依据](https://www.asme.org/wwwasmeorg/media/resourcefiles/aboutasme/who%20we%20are/engineering%20history/landmarks/111-boulton-watt-rotative-steam-engine.pdf) |
| `se-003` | changed | 档案内径 18 in、行程 4 ft 确认；只保留内径差异，不展示目录功率或推测扩缸。 | [原始依据](https://calmview.birmingham.gov.uk/CalmView/Record.aspx?id=MS+3147%2F5%2F714%2Fb&src=CalmView.Catalog) |
| `se-004` | verified | Hulse 第一手模型研究说明 16 ft 飞轮；归属给作者，不称博物馆新测量。 | [原始依据](https://davidhulse.co.uk/steam-engines/the-lap-engine/) |
| `se-005` | changed | ASME 296 与 Hulse 304 确有差异；数字只留作者审计，本页细看写“来源齿数不同”，模型省精确外缘齿圈。 | [原始依据](https://davidhulse.co.uk/steam-engines/the-lap-engine/) |
| `se-006` | verified | 双作用和两个方向做功；SMG 馆藏说明及 Lardner 第 VI 章。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `se-007` | verified | Ferguson fig.10：A/F 固定，C-B-D-E 平行四边形，EF 与 BD 交叉不设铰链。 | [原始依据](https://www.gutenberg.org/files/27106/27106-h/27106-h.htm) |
| `se-008` | verified | Ferguson fig.7e 及正文、Lardner §57：行星固连传动杆、定距杆、相等齿轮完整周期净两圈。 | [原始依据](https://www.gutenberg.org/files/27106/27106-h/27106-h.htm) |
| `se-009` | verified | Lardner §§49–53：喷射、抽气泵、混合水、热井、给水和外来冷水。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `se-010` | changed | Lardner §60 阀口配对确认；“速度导数为零时四口全关”仅是 S1 的理想切换规则，非 Lap 实测正时。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `se-011` | changed | 原文确认转速—连杆—节流反馈；原书杠杆式套环方向不能照搬给本设计的对称菱形，滑套上升属于 S1 几何。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `se-012` | cut | 原 PDF 抓取超工具大小限制；不依赖索引片段发布静差断言，也不写完全恒速。 | [原始依据](https://repository.si.edu/server/api/core/bitstreams/6209f5f4-9488-4f0a-bf6f-0250cfe12568/content) |
| `se-013` | verified | NASA P=F/A 与表面法向压力力；两侧受力、外露杆大气项由本研究受力分析推得。 | [原始依据](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/air-pressure/) |
| `se-014` | changed | NOAA 确认凝结为汽到液及放热；删未重新核到的沸点延伸与所有温度数字。 | [原始依据](https://www.noaa.gov/jetstream/atmosphere/hydro) |
| `se-015` | changed | NASA 现行 Conservation of Energy 支持 ΔE=Q−W；循环 ΔE=0 推出 Qh=W+Qc，明确为本研究推导，限定热机工作流体边界。 | [原始依据](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/conservation-of-energy/) |
| `se-016` | verified | 本 worktree 两主题为 published，四个目标 chapter id 存在；父主题尚未落地，不能输出死链。 | [原始依据](../src/content/topics/energy-conversion/topic.yaml) |
| `se-017` | changed | 内存重算行程 1.219200015 m、横移约 1.795 mm；闭合误差按 <1e−9 m 验收，不承诺平台相关的最后一位浮点残差。 | [原始依据](#33-模型输入与已有-table-的作者方案) |
| `se-018` | verified | 独立重算压力面积、16.021640/15.930345 kN、38.955861 kJ、6.492643 kW；全为 SIM，保留指示/轴功区别。 | [原始依据](#33-模型输入与已有-table-的作者方案) |
| `se-019` | changed | 重算三档静态摆球与刚性节流连杆；删 4.5:1 主机耦合，姿态只作独立静态比较。 | [原始依据](#33-模型输入与已有-table-的作者方案) |
| `se-020` | verified | 100=10+90=20+80=30+70；热输入归一化示例，不是燃料输入或 Lap 效率。 | [原始依据](#33-模型输入与已有-table-的作者方案) |
| `se-021` | verified | 两图与父快照逐字节相同，三张最终图哈希匹配 manifest。 | [原始依据](/Users/gavin/work/atlas/art/planned/steam-engine/manifest.jsonl) |
| `se-022` | verified | 重新并排看最终平行运动图与 fig.10；六处功能枢轴、交叉不连接、输出一根杆，图不提供制造尺寸。 | [原始依据](https://www.gutenberg.org/files/27106/27106-h/images/fig-10.jpg) |
| `se-023` | verified | Lardner §58 飞轮平滑运动的机制；用现代能量措辞独立转述，不承诺计算出的恒速。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `se-024` | verified | Lardner 锅炉章与双作用章：炉膛向锅炉水供热，蒸汽经活塞做机械功。 | [原始依据](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm) |
| `ir-003` | cut | NPS 原文可读；水力工厂的案例与扩展社会论述交父主题，本页仅保留导航。 | [原始依据](https://home.nps.gov/blrv/learn/historyculture/slatermill.htm) |
| `ir-009` | verified | SMG Newcomen 原文确认近 Dudley 的 1712 节点；1791 馆藏为晚例，未当作 1712 实物。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) |
| `ir-010` | verified | SMG 原文与 ASME 说明确认凝结降压、大气下推及重泵杆帮助回程；不声称所有泵都在同一向行程排水。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) |
| `ir-011` | verified | SMG James Watt 条目确认 1765 工作模型。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) |
| `ir-012` | verified | SMG 馆员文章确认 1769-01-05 专利；不采用其无条件节煤比例。 | [原始依据](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) |
| `ir-013` | verified | 同文确认热汽缸与独立冷凝器分离。 | [原始依据](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) |
| `ir-014` | changed | 只保留 SMG “1776 商用机器已安装运转”；删除 1775 销售支线，避免把不同里程碑混成冲突的发明日期。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) |
| `ir-015` | changed | 用途与调速器确认；父来源标题错误馆号 1858-1 改为 1861-46，仅本 spec 纠正。 | [原始依据](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788) |
| `ir-016` | cut | ASME 原文确认 Whitbread 的多阶段改造；本页不放第二台旋转机的历史/数字，仍执行不得倒置年代的编辑规则。 | [原始依据](https://www.asme.org/about-asme/engineering-history/landmarks/111-boulton-watt-rotative-steam-engine) |
| `ir-061` | cut | MOE PDF 返回机器人验证，不绕过；删 P4 页码与直接课纲引语，标科学拓展。 | [原始依据](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx) |
| `ir-038` | cut | 原链接 403；父档的工厂/劳动细节不在本页复述。 | [原始依据](https://www.nationalarchives.gov.uk/education/resources/1833-factory-act/) |
| `ir-039` | cut | 原链接 403；父档的工厂/劳动细节不在本页复述。 | [原始依据](https://www.nationalarchives.gov.uk/education/resources/1833-factory-act/) |
| `ir-040` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/) |
| `ir-041` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/) |
| `ir-042` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/) |
| `ir-043` | cut | 原链接 403；父档的工厂/劳动细节不在本页复述。 | [原始依据](https://www.nationalarchives.gov.uk/explore-the-collection/stories/the-proclamation-of-ned-ludd/) |
| `ir-044` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.tuc.org.uk/research-analysis/reports/section-tucs-first-victories) |
| `ir-045` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.parliament.uk/about/living-heritage/transformingsociety/towncountry/towns/keydates/) |
| `ir-046` | cut | NBER 链接 403；删寿命估计或殖民经济因果论断与数字。 | [原始依据](https://www.nber.org/papers/w21647) |
| `ir-047` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-0289.2010.00532.x) |
| `ir-048` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.jstor.org/stable/jj.40336711) |
| `ir-049` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://www.jstor.org/stable/j.ctt7sv80) |
| `ir-050` | cut | 公开作者/出版社文本可读；不在机器页裁决奴隶制与工业化的因果份额，全部交父主题。 | [原始依据](https://uncpress.org/9781469663678/capitalism-and-slavery-third-edition/) |
| `ir-051` | cut | 公开作者/出版社文本可读；不在机器页裁决奴隶制与工业化的因果份额，全部交父主题。 | [原始依据](https://www.wcfia.harvard.edu/publications/empire-cotton-0) |
| `ir-052` | cut | 公开作者/出版社文本可读；不在机器页裁决奴隶制与工业化的因果份额，全部交父主题。 | [原始依据](https://www.cambridge.org/core/journals/journal-of-global-history/article/slavery-and-the-new-history-of-capitalism/6885E5697E7151B50FDEFC65ED96C79E) |
| `ir-053` | cut | 公开作者/出版社文本可读；不在机器页裁决奴隶制与工业化的因果份额，全部交父主题。 | [原始依据](https://ideas.repec.org/a/eee/exehis/v67y2018icp1-17.html) |
| `ir-054` | cut | NBER 链接 403；删寿命估计或殖民经济因果论断与数字。 | [原始依据](https://www.nber.org/papers/w11730) |
| `ir-055` | cut | OUP 跳转读取失败；不采用产业衰落概括。 | [原始依据](https://academic.oup.com/book/33485/chapter-abstract/287779515) |
| `ir-056` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://academic.oup.com/book/7358/chapter/152152209) |
| `ir-057` | cut | 公开机构/作者页可读；本页删除劳动、福利或工业化成因的扩展主张，交父主题。 | [原始依据](https://ideas.repec.org/a/eee/exehis/v46y2009i4p418-435.html) |

合计 **54 条：verified 20、changed 10、cut 24**。统计含准备稿泛引的父档 ir-038–057 各 1 条；其余父 dossier 条目没有引入，不计入。本页无死亡人数。数字来源映射还包括 §1.2、§3.3 与 §4.5：计算值是核算，不是历史实测验证。

## 1. 立场、范围与必须讲对的事实

### 1.1 学习结果与边界

- Newcomen 在 Watt 改良之前已有实用抽水机；1712、1765、1769-01-05、1776、1788 分别是不同机器、模型、专利或商业节点，不是同一天的整机发明。[ir-009–014][se-001]
- 低压空间不“拉”活塞；活塞两侧的压力力合成造成净力。杆占面积，必须一致处理外界大气项。[se-013][se-018]
- 蒸汽凝结成水；独立冷凝器让工作缸不必反复直接喷冷水，仍有热量排出、混合水和空气需要移走。[ir-013][se-009][se-014–015]
- 双作用两个方向做功；横梁端走弧，完整平行运动给近似直线。两处固定支点不能合并，交叉杆不能多画铰链。[se-006–007]
- 行星轮固连传动杆而非自由空转；相等齿轮每个完整活塞周期净两圈，瞬时比不是恒定的 2；飞轮储能并交还，调速器通过供汽反馈调节。[se-008][se-011][se-023]
- 热机完整循环账本为 Qh=W+Qc；本页 100 份模型的边界是传给工作流体的热量，不是全部燃料化学能。[se-015][se-020]

主线面向小学高年级科学拓展；热力学、连杆几何与反馈不标 PSLE 必考。公式、英制和参考尺寸争议放细看；主线先描述画面。中文独立成文、英文字幕 ≤45 词，无拟人、胜利叙事或“机器必然改善每个人生活”的句子。全球工业化的劳动、强迫劳动与污染由父主题承担；父主题未发布时只显示中性阅读说明，不生成 `<TopicLink>`。[D3][D9]

### 1.2 页面数字白名单

| 类型 / fact | 可以给读者看的数字 | 显示与解释 |
|---|---|---|
| 历史节点，ir-009、ir-011–014、se-001 | 1712、1765、1769-01-05、1776、1788 | 数字正文用 `<Num s>`；模型不是 1769 整机复原 |
| 具名 REF，se-002–004 | 内径约 0.476 m（18.75 in）；档案另记 0.4572 m（18 in）；行程约 1.219 m（4 ft）；飞轮约 4.88 m（16 ft） | 内部换算 0.47625、1.2192、4.8768 m。后两来源冲突与归属并列；不新增“行业典型范围” |
| DESIGN，se-017–019 | 杆径 0.040 m；显示径向间隙 3 mm；横移全幅约 1.795 mm；连杆与摆球研究长度见 §3.3、§4 | 只在细看/来源显示；不得冒充制造尺寸；闭合容差不是测量精度 |
| SIM 压力，se-018 | 热侧 110；冷侧 20/50/80；外界 101.325 kPa abs；8/10/12 周期/分 | 都是指定输入；没有温度、流量或锅炉操作指导 |
| SIM 力与功，se-018 | 下行约 16.022/10.677/5.333 kN；上行与周期功、模型指示功率由 §3.3 算式得 | 卡片始终 SIM；合力 kN 3 位、功 kJ 2 位、指示功率 kW 3 位；字幕“约十六千牛”对应默认值 |
| SIM 调速，se-019 | 60/90/120 rpm；滑套升程约 0.503/0.779/0.876 m；阀开度约 84.9/50.0/36.3% | 理想点质量静态模型；开度百分数是角度归一化，不是相同百分比的质量流量 |
| SIM 账本，se-020 | 100→10+90、20+80、30+70 | 一片代表一归一化单位；不是效率测量 |
| 机构关系，se-008 | 两球；两等齿轮；完整周期净两圈 | 两球由 se-019 本设计确认；不宣称所有瓦特机同构；相位刻度不是历史时间 |

其余 UI 结构编号不作为物理事实；新增任何物理数字必须先加入 S1 或具名来源及此表。所有 `detail` 数字带 `[S#]`，所有正文数字带 `<Num s>`；字幕、规格与读数保持同值。[D8]

## 2. 章节与 36 个节拍（EN / ZH 定稿）

### 2.0 状态总表与记法

每章 `state` 默认：`explode:0,part:null,cutaway:none,run:false,view:assembled`，所有hide/layers/labels从本章重建，不累计。表中01–04是§3.1 的组别简写，施工展开为实际group id而不写数字层名。表中的镜头见§3.5；`manual(n)`完整展开为`sim.set:{experiment:本章实验,motion-mode:manual,phase-deg:n,cycle-rate:10,cold-pressure:20,governor-rpm:90,work-share:20}`；`auto(n)`只把mode换auto并`run:true`。不同控件的覆盖必须从本章base展开，不从上一拍拿值。表内另写cold/gov/share时替换对应默认。所有拍默认无爆炸，没写的labels取本章行，labels中每件都必须看得见。

| # / id | 标题 EN / ZH | layers；hide / view / 镜头 | 实验、状态、章labels |
|---|---|---|---|
| 00 `before-you-start` background | Before you start / 开始之前 | 01–04；hide全部05；hero | mechanism,manual0；boiler,cylinder,beam,flywheel |
| 01 `atmospheric-push` | Air pushes the piston / 空气推动活塞 | 仅teaching的nc五件；hide账本与主机；newcomen-view | pressure,manual0；nc-cylinder,nc-piston,nc-beam,nc-pump |
| 02 `keep-hot-and-cold-apart` | Keep hot and cold apart / 把热与冷分开 | 01–03+steam-flow+water-flow；hide全部05；condenser-view | pressure,manual0；cylinder,condenser,air-pump,hot-well |
| 03 `power-both-ways` | Power in both directions / 两个方向都做功 | 01–03+steam-flow；hide05；xray,cylinder-view | pressure,manual0；valve-chest,cylinder,piston,piston-rod |
| 04 `parallel-motion` | A nearly straight path / 近似直线的路径 | 02；hide05及遮挡连杆的管；linkage-view | mechanism,manual0；beam,parallel-inner,radius-rod,piston-rod |
| 05 `sun-and-planet` | From rocking to rotation / 从摆动到转动 | 02+必要04；hide05；hero后转拍内齿轮近景 | mechanism,manual0；drive-rod,planet,sun,flywheel |
| 06 `speed-feedback` | Speed and feedback / 速度与反馈 | 01+04；其余机件淡显但不标；governor-view | governor,manual0；governor-balls,governor-collar,throttle-link,throttle |
| 07 `follow-the-energy` | Follow the energy / 跟着能量走 | 首拍01–04；后拍只teaching账本；hero / 拍内账本 | energy,manual0；furnace,boiler,shaft,condenser；账本拍改标签 |

01章五件原理模块的pose：`nc-fill`（泵杆重端在下、汽缸活塞在高处、无冷水）；`nc-condense`（同高处，喷口显示）；`nc-power`（活塞下、泵杆上）；`nc-return`（重新通汽、重泵杆降、汽缸活塞回高）。这些是展示端态，图中链应在两端pose均贴合弧端；不把几张pose变成虚构实测时序。[ir-010]


**状态补充（覆盖上表中简写）**：七控件 `experiment / cold-pressure / cycle-rate / governor-rpm / work-share / motion-mode / phase-deg`，取值与默认见 §3.3。`manual(n)` 不推进机构；默认 `run:false`，阀口仍按该相位显示开闭。02.2–02.4 可在手动静帧设 `run:true` 显示管内路径，粒子仅标路径；03 章默认粒子关闭、用开阀几何与高亮讲路径。`auto(0)` 才连续推进机构，05.4/05.5 隐藏 regulation，避免把独立静态调速研究当作实时反馈。06 全章 `run:false`，按 gov 控件选择三套零时长静态姿态，不播放轴旋转。全章索引含该章正文和所有拍的并集；06 为 14 个入口，允许阅读面板纵向滚动，不能漏掉右侧球/杆或阀片。[D5–D7]

背景章的 00.2 是唯一切到 Newcomen 模块的拍：必须覆盖 `layers:[teaching]` 并把主机全 hide；返回 00.3 恢复主机。07.3 只显示三组账本片；07.4 恢复停机全景。06 使用 `ghost` 时只能 ghost 没有被当前标签引用的零件。02.3 用 manual180 的泵上行静帧，不另给泵动画；按本几何 dWy/dθ≈+0.242461 m/rad。所有 auto 拍在减少动态偏好下停在指定起始相位；不自动翻拍。[se-017][D11]

**已核现有跳转**：`states-of-matter/gases`、`states-of-matter/air-is-matter`、`energy-conversion/stored-energy`、`energy-conversion/never-used-up`，均从本 worktree frontmatter 确认。父主题的计划锚 `ir-thread-coal-power`、`ir-work-cotton-coercion`、`ir-growth-costs` 只作施工对照；仅当目标实际存在且 published 才渲染链接，否则普通双语说明；不改父主题状态。[se-016]

### 2.1 背景章00 `before-you-start`（4拍）

**summary**：A steam engine links hot water and a moving machine. This study follows one preserved engine and separates recorded dimensions from teaching examples. / 蒸汽机把加热的水和运转的机器连起来。本研究以一台保存的机器为参考，把记录中的尺寸与教学示例分开。[se-001–004][se-015]

**正文提纲**：①台上是Lap参考机构，内径、行程与飞轮尺寸有公开记录，其余为重建。[se-001–004][se-017] ②Newcomen在前，Watt改良分多个阶段。[ir-009–014] ③热量、物态变化、机器传动是本主题三条线，回链两门已发布科学主题。[se-014–016] ④说明SIM、给定相位、放大间隙。[se-017–020]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 00.1 | base hero；高亮boiler→cylinder→beam→flywheel，不运转 | Follow the parts from the boiler to the cylinder, then through the beam to the flywheel. This is a mechanism study after the preserved Lap engine. / 从锅炉看到汽缸，再沿着横梁看到飞轮。这是以保存的 Lap 蒸汽机为参考的机构研究。 | se-001,se-006,se-008 |
| 00.2 | newcomen-view；仅nc模块；pose nc-fill；labels nc-cylinder,nc-beam | Steam engines were already pumping mine water before Watt’s improvements. The earlier comparison module shows the atmospheric engine’s open cylinder. / 在瓦特改良之前，蒸汽机已经用于抽出矿井里的水。旁边的比较模块展示大气式蒸汽机的开口汽缸。 | ir-009,ir-010 |
| 00.3 | cylinder-view；xray；labels cylinder,piston,piston-rod | The bore and stroke come from published records. The links and clearances are reconstructed; the motion is prescribed, rather than calculated from the steam force. / 内径和行程来自公开记录。连杆和间隙经过重建；画面中的运动由相位控制，并不是根据蒸汽推力计算出来的。 | se-002,se-017,se-018 |
| 00.4 | condenser-view；labels condenser,air-pump；显示图例token | Water changes between liquid and vapour here. The dots mark routes through the model, while numbers marked SIM are teaching examples. / 水在这里发生液态与气态之间的变化。小点标出模型中的路径，标着 SIM 的数字是教学示例。 | se-009,se-014,se-018 |

**试一试**：无。**细看**：来源与版本；示意间隙；如何用底部拍轴切静帧。**索引**：boiler,cylinder,piston,piston-rod,beam,flywheel,condenser,air-pump,nc-cylinder,nc-piston,nc-beam,nc-pump,nc-chain,nc-pump-chain。**名词首现**：steam-engine、cylinder、piston。相关链接：父主题 `ir-thread-coal-power`（待发布）；`states-of-matter/gases`。[se-016]

### 2.2 第01章 `atmospheric-push`（5拍）

**summary**：Condensing steam lowers the pressure below the piston. Air above it then pushes it down, while the beam raises the mine-pump rod. / 蒸汽凝结后，活塞下面的压力降低。上方的空气把活塞向下推，横梁另一端便把矿井泵杆提起来。[ir-010]

**正文提纲**：①开口上方接大气，下面通低压蒸汽。[ir-010] ②在缸内喷冷水，凝结与压力差。[ir-010][se-014] ③下推活塞、抬泵杆；回程靠泵杆重端。[ir-010] ④一再冷却汽缸带来重新加热负担，转到02章。[ir-013] ⑤模型数字只比较同面积下的压力差，不以Watt杆面积套进开口缸。[se-018]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 01.1 | base nc-fill；labels nc-cylinder,nc-piston | The cylinder is open above the piston. Steam enters below it as the heavy pump rod helps raise the piston. / 活塞上方的汽缸敞开着。蒸汽进入下面的空间，沉重的泵杆帮助活塞升起来。 | ir-010 |
| 01.2 | pose nc-condense；labels nc-jet,nc-cylinder | A spray of cold water condenses the steam inside the cylinder. The pressure below the piston falls. / 冷水喷入汽缸，让里面的蒸汽凝结。活塞下面的压力降低。 | ir-010,se-014 |
| 01.3 | pose nc-power；剖面近景；labels nc-piston,nc-cylinder | Air above the piston pushes harder than the low-pressure contents below it. The pressure difference produces a downward force; a vacuum does not pull. / 活塞上方空气的推力，大于下方低压空间的推力。压强差产生向下的力，并不是「真空在拉」。 | ir-010,se-013 |
| 01.4 | pose nc-power；镜头框beam和pump；labels nc-beam,nc-pump | As the engine piston descends, the other end of the beam lifts the mine-pump rod. / 蒸汽机的活塞下降时，横梁另一端把矿井泵杆提起来。 | ir-010 |
| 01.5 | pose nc-return；labels nc-cylinder,nc-jet；冷水路径关 | Steam enters again and the weighted pump side helps the return. The cylinder that was cooled now has to warm again. / 蒸汽再次进入，沉重的泵杆一侧帮助机构回程。刚被冷却的汽缸又要重新加热。 | ir-010,ir-013 |

**试一试**：无数值卡，避免把没有穿过密封上盖的活塞杆的比较模块与主机力卡混为一体；细看展示14.487kN这个明确假设的算例。[se-018] **细看**：大气也是物质（链air-is-matter）；1712里程碑，不称第一台人类蒸汽装置；链只能拉，双作用需要刚杆。[ir-009][se-007] **索引**：nc-cylinder,nc-piston,nc-beam,nc-pump,nc-jet,nc-chain,nc-pump-chain。**名词**：pressure-difference、condensation（大气压在正文直接解释）。

### 2.3 第02章 `keep-hot-and-cold-apart`（5拍）

**summary**：Watt moved condensation into a separate cold vessel. The working cylinder could stay hot, while a pump removed water and air from the condenser. / 瓦特把冷凝过程移到一个独立的冷容器里。工作汽缸可以保持热，泵则把冷凝器中的水和空气移走。[ir-013][se-009]

**正文提纲**：①热汽缸和冷凝器的位置分开。[ir-013] ②蒸汽到冷凝器变液体，主机选喷射式示意；补冷水与排暖水。[se-009][se-014] ③抽气泵与止回阀，不只画一罐水就声称真空能保持。[se-009] ④热井、部分回水和溢流；水不是全部纯净封闭循环。[se-009] ⑤降低冷端压力的推力效果与改善燃料使用的历史意义分开，不编一个通用节煤百分数。[ir-013][se-018]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 02.1 | cylinder-view；xray；labels cylinder,condenser；hot/cold两区 | The working cylinder and the cold condenser are separate. Cooling the exhaust no longer requires spraying cold water into the working cylinder. / 工作汽缸和冷凝器分开了。冷却排出的蒸汽，不再需要把冷水喷进工作汽缸。 | ir-013 |
| 02.2 | condenser-front剖切；labels condenser,injection-jet,cooling-cistern；冷水与排汽流开 | In this jet-condenser model, cold water meets the exhaust steam inside the separate vessel. The vapour becomes liquid water. / 在这个喷射式冷凝器模型里，冷水在独立容器中接触排出的蒸汽。水蒸气变成液态水。 | se-009,se-014 |
| 02.3 | manual180；同镜头；labels condenser,air-pump,pump-piston；泵上行静帧 | The air pump removes water and air from the condenser. Its non-return valves let the mixture move towards the hot well. / 抽气泵把冷凝器中的水和空气移走。止回阀让混合物朝热井方向流动。 | se-009 |
| 02.4 | 拉远至hot-well/feed；labels hot-well,feed-pump,water-pipes；显示补水和溢流 | Some warm water returns to the boiler through a feed pump. Excess mixed water leaves, and fresh cooling water must enter. / 一部分温水经过给水泵回到锅炉。多余的混合水排出，新的冷却水还要补进来。 | se-009 |
| 02.5 | cylinder-view；manual0,cold50；静止；labels piston,cylinder | Keep the hot-side pressure fixed. Raising the cold-side pressure makes the downward force smaller in this model. / 保持热侧压力不变。在这个模型中，提高冷侧的压力，会让向下的推力变小。 | se-013,se-018 |

**试一试T1**：`vary:cold-pressure`，keep「Same piston and hot-side pressure / 同一活塞、相同热侧压力」，observe force-down，记录三行；predict start20→change50，选择more/less/same，expected less。强调这是压力实验，不是根据水温预测凝结速率。[se-018] **细看**：1765/1769/1776三里程碑；复用配图不是完整主机；泵功也要从机构取得。[ir-011–014][se-009] **索引**：cylinder,condenser,injection-jet,cooling-cistern,air-pump,pump-piston,hot-well,feed-pump,water-pipes,piston,boiler。**名词**：separate-condenser、air-pump（热井在正文直接解释）。

### 2.4 第03章 `power-both-ways`（5拍）

**summary**：The valve gear swaps the high- and low-pressure sides. The piston can deliver a working stroke in each direction. / 配汽机构交换高压侧和低压侧，让活塞在两个方向的行程中都能做功。[se-006][se-010]

**正文提纲**：①密封缸盖与穿盖杆。[se-006] ②上进下排、下进上排，两个不同的阀口配对。[se-010] ③两侧力相减；绝压与表压不混用。[se-013][se-018] ④杆占了上侧面积，两个方向略不相等。[se-018] ⑤力不是功率，指示功按力乘路程；模型没有算摩擦和泵功。[se-018]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 03.1 | base manual0；cylinder-front；labels cylinder,piston,piston-rod | This cylinder has a sealed top, with the piston rod passing through a gland. Steam can act on either side of the piston. / 这个汽缸上端封闭，活塞杆穿过密封填料口。蒸汽可以作用在活塞的两面。 | se-006 |
| 03.2 | manual0；框入四口；labels valve-upper-in,valve-lower-out,piston；显示upperIn/lowerOut | For downward travel, the upper inlet admits steam and the lower outlet leads to the condenser. The opposite pair stays closed. / 向下运动时，上方的进汽口通入蒸汽，下方的排汽口接通冷凝器。另一对阀口关闭。 | se-010 |
| 03.3 | manual180；labels valve-lower-in,valve-upper-out,piston；同镜头；显示lowerIn/upperOut | Now the lower inlet and upper exhaust are open. The pressure difference acts upwards, giving the other working stroke. / 现在下方进汽口和上方排汽口打开。压强差产生向上的力，完成另一个做功行程。 | se-006,se-010 |
| 03.4 | manual0,cold20；labels piston,piston-rod；力读数显 | At the chosen model pressures, the downward force is about sixteen kilonewtons. The smaller force from below must be subtracted. / 在选定的模型压力下，向下的合力约为十六千牛。计算时必须减去下方较小的推力。 | se-013,se-018 |
| 03.5 | manual180；labels piston,piston-rod；对照两向读数 | The rod takes up part of the upper face. Including its area makes the two model working forces slightly different. / 活塞杆占去了上表面的一部分面积。把这部分算进去，模型中两个方向的做功推力就略有不同。 | se-018 |

**试一试T2**：沿用压力卡vary cold-pressure，observe force-down,force-up,work-cycle；保持内径、杆径、供汽压力；不用phase试验冒充改变压力。**细看**：§3.3 算式与指示功；四逻辑口的显示不是 Lap 原阀制造图。[se-018][se-010] **索引**：valve-chest,valve-upper-in,valve-lower-in,valve-upper-out,valve-lower-out,cylinder,piston,piston-rod,steam-main,condenser。**名词**：double-acting（进汽、排汽、绝压在正文直接解释）。

### 2.5 第04章 `parallel-motion`（4拍）

**summary**：The end of a rocking beam follows an arc. Watt’s linked bars give the piston rod a path that is nearly straight. / 摆动横梁的端点走弧线。瓦特的连杆组合让活塞杆得到一条近似直线的路径。[se-007]

**正文提纲**：①横梁刚体绕固定点转，不能把梁端平移当摆动。[se-007] ②C-E与F-E构成近直线机构；加上平行四边形把运动传到D。[se-007] ③固定点A、F与活动关节点；交叉无铰链。[se-007] ④实际近似程度取决于尺寸；本设计横移约1.795mm，间隙放大已标明，不泛称所有Watt机构都同误差。[se-017]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 04.1 | base manual0；labels beam,piston-rod | The beam rocks about a fixed pivot. A point at its end follows an arc, so it cannot simply be fixed directly to a straight-moving piston rod. / 横梁绕固定支点摆动，端点走的是弧线，因此不能简单地直接固定在直线运动的活塞杆上。 | se-007 |
| 04.2 | manual90；labels parallel-inner,radius-rod；淡显其余，但这两件不ghost | A short link joins the beam to a radius rod with its own fixed pivot. Their combined motion gives a nearly straight path. / 一根短连杆把横梁与另一根有固定支点的摇杆连起来。它们的组合运动得到近似直线的路径。 | se-007 |
| 04.3 | manual180；labels parallel-inner,parallel-outer,parallel-bottom,piston-rod | The added parallelogram carries that motion to the piston rod. The crossing bars pass at different depths; there is no joint at the crossing. / 加上的平行四边形把这一运动传到活塞杆。交叉的杆件处于不同深度，交叉处没有铰链。 | se-007 |
| 04.4 | manual270；镜头近看D与杆；labels piston-rod,radius-rod | This is an approximate straight line. Our reconstructed link lengths give less than two millimetres of sideways movement, with display clearances enlarged to show it. / 这是一条近似直线。本研究重建的连杆尺寸产生不到两毫米的横向移动，显示间隙也已放大。 | se-017 |

**试一试**：用拍轴在四个静态相位间切换、旋转观察；不新增一个只有设定角而无真实观察量的试一试卡。**细看**：完整六杆与常见三杆简图的差别；近似直线与精确直线；配图不作尺寸来源。[se-007][se-022] **索引**：beam,parallel-inner,parallel-outer,parallel-bottom,radius-rod,piston-rod。**名词**：parallel-motion、pivot。

### 2.6 第05章 `sun-and-planet`（5拍）

**summary**：A connecting rod carries a gear around another gear on the output shaft. The pair converts rocking motion into rotation. / 传动杆带着一个齿轮，绕着输出轴上的另一个齿轮运动。这对齿轮把摆动转换成转动。[se-008]

**正文提纲**：①输出要驱动旋转机器，梁和活塞仍往复。[ir-015][se-008] ②行星齿轮固连杆，定距杆独立绕轴。[se-008] ③太阳轮、输出轴、飞轮共轴。[se-008] ④齿数相同才有完整周期净两圈；杆摆角让瞬时比不是简单恒2。[se-008] ⑤飞轮储存/交还转动动能，不能制造能量，也不等于调速器。[se-011][se-023]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 05.1 | base manual0；hero；labels beam,drive-rod,flywheel | The piston and beam move back and forth. A factory shaft needs rotation, so another mechanism connects these motions. / 活塞和横梁来回运动，工厂的传动轴却需要转动，因此要用另一套机构把两种运动连接起来。 | ir-015,se-008 |
| 05.2 | 齿轮拍内camera[4.7,3.8,3.8]→[2.5,2.6,0]；manual90；labels drive-rod,planet,sun | The planet gear is fixed to the connecting rod. It rocks with that rod rather than spinning freely on its own axle. / 行星轮固定在传动杆上，随杆件摆动，并不是在自己的轴上自由空转。 | se-008 |
| 05.3 | manual180；同镜头，稍侧视；labels centre-link,planet,sun,shaft | The centre link keeps the two gear centres the same distance apart. The sun gear is fixed to the output shaft. / 定距连杆让两个齿轮的中心距保持不变。太阳轮固定在输出轴上。 | se-008 |
| 05.4 | auto0，run；镜头框两齿轮和读数；labels planet,sun,flywheel | With equal gears, one complete piston cycle gives two net turns of the sun and flywheel. Watch the shared mechanism, not separate wheel animations. / 两个齿轮相等时，活塞一个完整周期让太阳轮和飞轮净转两圈。这里整套机构共用同一个运动相位。 | se-008,se-017 |
| 05.5 | auto0；拉远hero；labels flywheel,load-wheel,shaft | The flywheel stores and returns rotational energy as the driving effort varies. Power leaves through the machine drive; the wheel does not create energy. / 驱动力变化时，飞轮储存并交还转动的能量。动力从机器取力端传出，飞轮并不创造能量。 | se-015,se-023 |

05.5的飞轮平顺作用引用独立事实se-023，来源S7历史教材§58；本模型并未求解角加速度或负载转矩。

**试一试**：RUN/暂停和拍轴静帧；不需要新齿轮小游戏。模型用轮缘标记观察转动，测试 API 保留累计轴圈数；不新增帧遥测 HUD。**细看**：太阳与行星不是天文模型；传动杆摆角公式；飞轮外缘齿数来源不一致，故不画精确外缘齿圈；太阳/行星的相等齿廓是 DESIGN。[se-005][se-008] **索引**：beam,drive-rod,planet,sun,centre-link,shaft,flywheel,load-wheel,piston。**名词**：sun-and-planet、flywheel。

### 2.7 第06章 `speed-feedback`（4拍）

**summary**：The flyballs and sliding collar change the throttle opening as speed changes. This is a feedback path from rotation back to steam admission. / 转速变化时，飞球和滑套会改变节流阀开度。这是一条从转动回到进汽的反馈路径。[se-011]

**正文提纲**：①两球、两上杆、两下杆、同一滑套，驱动轴来自机器。[se-011][se-019] ②转得快、球张开、滑套上升，经非旋转叉环关小节流阀。[se-011][se-019] ③转慢时相反；节流阀与四配汽口不同。[se-010–011] ④三档是独立静态比较，不展示负载变化后的转速曲线，也不承诺完全恒速。[se-019]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 06.1 | base gov60；runfalse；labels governor-spindle,governor-balls,governor-collar | Two flyballs are linked to one rotating spindle and one sliding collar. The collar can rise and fall along the spindle. / 两个飞球连着同一根转轴和同一个滑套。滑套可以沿轴上下移动。 | se-011,se-019 |
| 06.2 | gov90；labels governor-balls,governor-collar,throttle-link | At a higher steady speed in this ideal model, the balls sit farther out and the collar rises. The non-rotating fork carries that movement to the throttle linkage. / 在这个理想模型中，较高的稳定转速对应更张开的飞球和更高的滑套。不旋转的叉环把升降运动传给节流连杆。 | se-011,se-019 |
| 06.3 | gov120；切节流剖面；labels throttle-link,throttle | The linkage reduces the throttle opening. It limits steam admission rather than applying a brake to the flywheel. / 连杆让节流阀开度减小，限制进汽，并不是给飞轮加上刹车。 | se-011,se-019 |
| 06.4 | gov60；拉回调速联动全景；labels governor-balls,governor-collar,throttle | Lower speed gives the opposite arrangement. These are three steady model positions; no response to a changing load is calculated here. / 较低转速对应相反的机构位置。这里比较三个模型静态位置，并没有计算负载变化后的响应。 | se-019 |

**试一试T3**：vary governor-rpm，keep两杆长、球数、重力，observe collar-rise,throttle-opening；record三行；predict60→120阀开度less。不出现「完全维持90rpm」结论。**细看**：封面省去外接叉环，不据它复制全反馈机构；本模型只比较静态位置，进汽量与负载响应均未求解。[se-019][se-021] **索引**：governor-spindle,governor-balls,governor-ball-right,governor-upper,governor-upper-right,governor-lower,governor-lower-right,governor-collar,throttle-link,throttle-rod,throttle-crank,throttle,throttle-disc,flywheel。**名词**：centrifugal-governor、feedback、throttle。

### 2.8 第07章 `follow-the-energy`（4拍）

**summary**：Fuel heats the water, the engine delivers work, and heat leaves through the condenser. Follow a separate model energy account, then continue to the history topic. / 燃料给水供热，蒸汽机输出功，热量也从冷凝器排出。先读一份独立的模型能量账本，再继续历史主题。[se-009][se-015][se-020][se-024][D3]

**正文提纲**：①燃料化学能，经传热到水/蒸汽，再对活塞做功，轴向机器传递机械能。[se-015][se-024] ②冷凝器是排热端之一，实际锅炉和烟气还有其他损失。[se-015][se-020] ③100份示例明确边界仅工作流体热机循环；份数变化不是可调的真实Lap效率。[se-020] ④这里只研究机器；劳动者、原料和环境的历史阅读交父主题，不增加未经本页核查的概括。[D3]

| 拍 | state覆盖 / 可见变化 | Caption EN / ZH | facts |
|---|---|---|---|
| 07.1 | base hero；labels furnace,boiler,piston,shaft；依次高亮链 | Fuel supplies heat to the water. Steam does work on the piston, and the mechanism passes mechanical energy to the output shaft. / 燃料向水供热。蒸汽对活塞做功，机构再把机械能传到输出轴。 | se-015,se-024 |
| 07.2 | condenser-view；labels condenser,cooling-cistern；账本旁景 | The condenser transfers heat to cooling water. Heat rejected here is still energy; it has not disappeared. / 冷凝器把热量传给冷却水。这里排出的热量仍然是能量，并没有消失。 | se-009,se-015 |
| 07.3 | 仅账本，share20；camera[−8,2.5,4]→[−10,1,0]；labels energy-input,energy-work,energy-reject | This separate example divides one hundred heat-input units into twenty work units and eighty rejected-heat units. It is an energy account, not a measurement of the Lap engine. / 这个独立示例把一百份输入热量分成二十份功和八十份排热。这是一份能量账本，不是 Lap 蒸汽机的测量结果。 | se-020 |
| 07.4 | hero，主机静止；labels boiler,flywheel,load-wheel；阅读面板TopicLinks | This study follows a machine. The history topic follows the people, materials and wider changes around industrialisation. / 本研究沿着机器讲原理。历史主题则继续讨论工业化中的劳动者、原料和更广泛的变化。 | D3 |

**试一试T4**：vary work-share，keep heat-in100，observe useful-work,heat-out；record三行；predict20→30，heat-out less。图例写一片=一归一化单位。**细看**：热机账本与燃料边界；能量不消失和可利用性；本页机器模型与历史主题的分工。[se-015][se-020][D3] **索引**：furnace,boiler,piston,shaft,condenser,cooling-cistern,load-wheel,energy-input,energy-work,energy-reject,flywheel。**名词**：work（热机与能量转换在正文解释）。链接§2.0 已核的两门科学主题及父主题劳动/污染章节。

### 2.9 四张试一试的字段与拍数核对

所有卡 `record:true`，不写 `replay`；prediction 的选项均给 `{id:more|less|same,label:{en:"More"|"Less"|"The same",zh:"变大"|"变小"|"不变"},means:同id}`，prompt 使用下表双语句。`keep` 的叙述写双语对象，不把数输出 id 当控件引用；`try` 放章 state，不放拍内。

| 卡 / 章 | vary / observe | keep 的双语文字 | predict：start → change；观察；prompt EN / ZH |
|---|---|---|---|
| T1 / 02 | cold-pressure / [force-down] | Same piston and hot-side pressure / 同一活塞，相同热侧压力 | cold-pressure:20→50；force-down；How will the downward force change in this model? / 模型中的向下合力会怎样变化？（less） |
| T2 / 03 | cold-pressure / [force-down,force-up,work-cycle] | Same bore, rod and hot-side pressure / 相同内径、杆径和热侧压力 | cold-pressure:20→50；work-cycle；How will the work per cycle change? / 每周期的功会怎样变化？（less） |
| T3 / 06 | governor-rpm / [collar-rise,throttle-opening] | Same link lengths, balls and gravity / 相同杆长、球和重力 | governor-rpm:60→120；throttle-opening；How will the model throttle opening change? / 模型的节流阀开度会怎样变化？（less） |
| T4 / 07 | work-share / [useful-work,heat-out] | One hundred heat-input units / 一百份输入热量 | work-share:20→30；heat-out；How will the rejected heat share change? / 排出热量的份数会怎样变化？（less） |

上述假设/观察均为 S1，分别对应 [se-018][se-019][se-020]；问题文字是教学设计，不是历史事实。主机构的 cycle-rate/mode/phase 可经已核的现有 `setSim` 操作，但不为没有观察量的章新造试一试卡；拍轴与 RUN 已足够完成机构观察。

00=4，01=5，02=5，03=5，04=4，05=5，06=4，07=4，**总36**；有用的物理变化/机械观察对应每拍，不以相同全景配不同段落凑拍。四张数值试一试卡在02、03、06、07；01和04的原理比较通过拍轴与3D旋转完成。

## 3. 零件、数据、图层与现有能力的组合

### 3.1 分区和尺度

01 `steam-supply` 锅炉与供汽；02 `working-motion` 汽缸、横梁、连杆、齿轮与取力；03 `condensing` 冷凝、抽气、热井与水；04 `regulation` 调速器与节流联动；05 `teaching` Newcomen 比较模块及能量账本。只有流的 `steam-flow`、`water-flow` 列在 LAYERS 末尾；不建 energy-flow。材质采用 wood / steel / brass；温热语义仅用 `token:hot`、冷端 `token:cold`、机械强调 `token:signal`，不使用历史阵营色。

| group id | name EN / ZH | 色 / 链路卡 |
|---|---|---|
| steam-supply | Steam supply / 锅炉与供汽 | token:hot；card:true |
| working-motion | Working mechanism / 工作机构 | token:signal；card:true |
| condensing | Condensing system / 冷凝系统 | token:cold；card:true |
| regulation | Speed regulation / 调速联动 | token:ink-2；card:true |
| teaching | Comparison models / 比较模型 | token:ink-2；card:false |
| steam-flow | Steam routes / 蒸汽路径 | token:hot；只有流 |
| water-flow | Water routes / 水的路径 | token:cold；只有流 |

表为分区排序，实际 groups 数组顺序就是编号。右上卡四列，`chainName` 使用现有字段，英文短名不超过14字符，中文不超过6字；长杆可用 Connecting rod / 传动杆、Inner link / 内连杆，不截成无法理解的词。Chapter index/详情保留完整 name，不受链路短名限制。

单位米，Y 向上，+Z 面向观者。§4 的平面局部坐标加 `[0,5.6,0]` 放进主场景；太阳轮中心世界 `[2.5,2.6,0]`，飞轮半径2.4384m，最低点 y≈0.162m。活塞中心约 x=−2.5，缸体 y≈2.4；锅炉在 x≈−5，冷凝/泵在前侧 z≈0.8。整机工作包络约 x[−6,5.1]、y[0,6]、z[−1.2,1.8]，是展示布局而不是厂房复原。Newcomen 模块移到独立工位 x≈−11，章节镜头不把两套同比例当成同一原机。[se-004][se-017]

### 3.2 零件清单（56 个可选零件 + 4 个 context）

所有坐标除有来源的内径、行程、飞轮外径均为 DESIGN。表中 `→` 是连接关系，不是物质流必然经过的路径；部件名字出现在章节就必须在索引可点。`shell` 只用于外壳。小管省去装饰螺钉，不省去功能连接。[se-001–010][se-017]

| id / EN / ZH | 组 | primitive / 尺寸或位置起点 | 功能、连接、显示 |
|---|---|---|---|
| `boiler` Boiler / 锅炉 | 01 | lathe/vessel；半径0.6、长2.2，轴X，x−5；shell | 蒸汽来源 → steam-main；造型为通用低压锅炉研究，不宣称原锅炉 [se-014] |
| `boiler-water` Water / 锅炉水 | 01 | 半筒 lathe，锅炉内部 | 加热变汽；液位不随演示编造 [se-014] |
| `furnace` Furnace / 炉膛 | 01 | extrude炉座；锅炉下 | 与水空间分开；不画火焰穿过水 [se-015] |
| `steam-main` Steam main / 供汽管 | 01 | tube半径0.05，锅炉→节流→阀箱；shell | 保留连续管路 [se-010–011] |
| `throttle` Throttle body / 节流阀体 | 01 | 中空 lathe，shell | 固定阀体，连接供汽管；可见阀片另为 throttle-disc [se-011] |
| `throttle-disc` Throttle disc / 节流阀片 | 01 | extrude 圆片，独立 part | 仅按三档静态 gov pose 绕阀轴转动，不随阀体位移 [se-019] |
| `valve-chest` Valve chest / 阀箱 | 01 | 中空 lathe/extrude，shell | 固定通道接上下缸口，四阀各自可点，正时示意 [se-010] |
| `valve-upper-in` Upper inlet / 上进汽阀 | 01 | 小 lathe，独立阀芯 | upperIn，开时沿自身阀轴抬 0.015 m DESIGN [se-010] |
| `valve-lower-in` Lower inlet / 下进汽阀 | 01 | 同上 | lowerIn，同样短程开闭 [se-010] |
| `valve-upper-out` Upper exhaust / 上排汽阀 | 01 | 同上 | upperOut，通冷凝器 [se-010] |
| `valve-lower-out` Lower exhaust / 下排汽阀 | 01 | 同上 | lowerOut，通冷凝器 [se-010] |
| `cylinder` Cylinder / 汽缸 | 02 | 中空lathe；内半径0.238125，内工作长约1.5，x−2.5；shell | 上下端口→阀箱，端盖密封杆口；参考尺寸 [se-002] |
| `piston` Piston / 活塞 | 02 | cylinder半径0.235125，高0.05 | DISPLAY 3mm径向余隙；随输出D横向微移，不伪装真机间隙 [se-017] |
| `piston-rod` Piston rod / 活塞杆 | 02 | cylinder半径0.02、长2.4 | 与 piston 固连，顶端接D；贯通上缸盖 [se-018] |
| `beam` Beam / 横梁 | 02 | extrude，左右各2.5；world pivot[0,5.6,0] | 刚体 A-C-B-K 同一转角 [se-007][se-017] |
| `parallel-inner` Inner link / 内侧短连杆 | 02 | 端点C-E，长0.8 | 一根刚杆，不增中间铰链 [se-007] |
| `parallel-outer` Outer link / 外侧短连杆 | 02 | B-D，长0.8 | 与内侧杆平行 [se-007] |
| `parallel-bottom` Bottom link / 下连杆 | 02 | E-D，长1.25 | 与C-B平行 [se-007] |
| `radius-rod` Radius rod / 摇杆 | 02 | F-E，长1.25，单独z层 | F固定；与B-D交叉处不相连 [se-007] |
| `drive-rod` Connecting rod / 传动杆 | 02 | K-P，长3 | 下端与planet刚接 [se-008][se-017] |
| `planet` Planet / 行星轮 | 02 | extrude闭合齿廓，48 齿 DESIGN | 节圆半径orbit/2；角度=传动杆摆角+常量，不能额外自由自转 [se-008] |
| `sun` Sun / 太阳轮 | 02 | 相同48齿、同模数齿廓 | 固连shaft；齿相位由无滑移式算 [se-008] |
| `centre-link` Centre link / 定距连杆 | 02 | O-P，长orbit，z后侧 | 两端转动副，只定中心距，不取代齿轮传动 [se-008] |
| `shaft` Shaft / 输出轴 | 02 | cylinder沿Z，中心O | sun与flywheel共轴且同角 [se-008] |
| `flywheel` Flywheel / 飞轮 | 02 | lathe轮缘 + extrude辐条 | 外径4.8768；辐条数为重建，非声称历史数量；不画精确外缘齿圈 [se-004–005] |
| `governor-spindle` Spindle / 调速器轴 | 04 | cylinder，独立托架 | 保留输出轴取力的示意连接；本轮三档比较均静止，不声称已求驱动比 [se-011][se-019] |
| `governor-balls` Left flyball / 左飞球 | 04 | sphere，左球独立 part | 静态半径/高度由 S1 计算；保留原 id 作为左球入口 [se-019] |
| `governor-ball-right` Right flyball / 右飞球 | 04 | sphere，右球独立 part | 与左球等高，相对轴对称 [se-019] |
| `governor-upper` Left upper arm / 左上摆臂 | 04 | 0.5 m 刚杆，独立 part | 顶枢轴→左球，静态 pose 以端点求旋转及位移 [se-019] |
| `governor-upper-right` Right upper arm / 右上摆臂 | 04 | 同上 | 顶枢轴→右球，不拉伸 [se-019] |
| `governor-lower` Left lower link / 左下连杆 | 04 | 0.5 m 刚杆，独立 part | 左球→滑套 [se-019] |
| `governor-lower-right` Right lower link / 右下连杆 | 04 | 同上 | 右球→同一滑套 [se-019] |
| `governor-collar` Collar / 滑套 | 04 | 有槽lathe环套 | 沿轴升降；叉环不跟着轴转 [se-011][se-019] |
| `throttle-link` Collar fork / 滑套叉环 | 04 | lathe 环叉，独立 part | 只随滑套升降，保留原 id，无公转 [se-019] |
| `throttle-rod` Throttle rod / 节流连杆 | 04 | J-M，长 1.1 m，独立 part | 静态两圆交点 M 保证定长 [se-019] |
| `throttle-crank` Throttle crank / 节流曲柄 | 04 | T-M，长 0.4 m，独立 part | 与独立阀片同角，阀轴固定 [se-019] |
| `condenser` Condenser / 冷凝器 | 03 | 中空lathe，半径0.22、长0.7，低位；shell | 排汽与喷射冷水在内部接触 [se-009] |
| `injection-jet` Injection / 冷水喷口 | 03 | 小tube，水箱→冷凝器内 | 与排汽路径分清；不能只靠外浴宣称喷射式 [se-009] |
| `cooling-cistern` Cistern / 冷水箱 | 03 | 薄壁box和水面，condenser外 | 补充冷水、排出暖水；冷水不直进工作汽缸 [se-009] |
| `air-pump` Air pump / 抽气泵 | 03 | 中空lathe，x−1，y≈1.1；shell | condenser→止回阀→泵→hot-well [se-009] |
| `pump-piston` Pump piston / 泵活塞 | 03 | 小cylinder含示意止回阀片 | 上行抽入/排出，下降转移，不称为恒量抽气 [se-009] |
| `pump-rod` Pump rod / 泵杆 | 03 | K内侧取点Q→sliderW，长4.5 DESIGN | 解算端点，不用独立正弦 [se-009][se-017] |
| `hot-well` Hot well / 热井 | 03 | 开口lathe小水槽 | 收混合温水；部分经feed-pump返回，另有溢流 [se-009] |
| `feed-pump` Feed pump / 给水泵 | 03 | lathe小泵；尺寸示意 | 热井→锅炉，另有外来补水接口 [se-009] |
| `water-pipes` Water pipes / 水管 | 03 | tube多段，同材质合并 | 注水、混合排水、回水、溢流独立，端点必须接对 [se-009] |
| `load-wheel` Mill drive / 机器取力轮 | 02 | 小轮与轴，飞轮外缘旁 | 只示意机械取力，不用发电机冒充磨光机 [se-001] |
| `nc-cylinder` Open cylinder / 开口汽缸 | 05 | 开口lathe；与主机分工位 | 上方接大气；只比较模块，不是1791馆藏复制 [ir-010] |
| `nc-piston` Pump-engine piston / 泵机活塞 | 05 | disc+刚性活塞杆 | 受大气压下推；不把可变外露链段烘焙到本件 [ir-010] |
| `nc-beam` Pumping beam / 泵机横梁 | 05 | 带弧端extrude | 与泵杆相连；同一状态演示 [ir-010] |
| `nc-pump` Mine pump / 矿井泵 | 05 | 竖直泵杆和短井筒 | 重泵杆帮助回程；只是原理模块 [ir-010] |
| `nc-chain` Piston-side chain / 活塞侧链段 | 05 | 细 tube 符号，独立 part | 外露竖直链段接活塞杆与横梁弧端切点；只受拉，不作为刚杆 [ir-010][se-007] |
| `nc-pump-chain` Pump-side chain / 泵侧链段 | 05 | 同上 | 与泵杆相接，随端态改变外露段长度 [ir-010] |
| `nc-jet` Cylinder jet / 缸内喷口 | 05 | tube进入开口汽缸下部 | 直接冷凝与Watt对照 [ir-010][ir-013] |
| `energy-input` Heat input / 输入热量 | 05 | repeat100小片 | 独立能量工位；一片=一归一化单位 [se-020] |
| `energy-work` Work / 输出功 | 05 | repeat30小片 | count由10/20/30控制；不是输出轴上的粒子 [se-020] |
| `energy-reject` Rejected heat / 排出热量 | 05 | repeat90小片 | count=90/80/70，与input不叠画成多出能量 [se-020] |

context 四件：`engine-frame`、`foundation`、`boiler-seating`、`comparison-support`；不入零件数、索引、拆开或点击。原机木架与金属配件的轮廓依据馆藏照片，细部为 RECON；外形参考图施工前要逐张打开核对。[se-001][se-004]

Newcomen 的四个端态也离线按同一横梁角计算：取两侧弧端半径 R=1.5 m、beam pivot 世界 [−11,3.5,0]，高位活塞对应 β=−12°，低位对应+12°；nc-fill/nc-condense/nc-return 用高位，nc-power 用低位。竖杆固定在 x=−12.5 / −9.5，活塞/泵杆位移分别为 −Rβ / +Rβ（β用rad，rest β=0）。基准活塞中心 y=2.0 m、两侧杆顶 y=3.0 m，弧的竖直切点 y=3.5 m；外露链长在约0.186–0.814 m之间。随杆顶位置求链段长度和中点，用现有 pose 的 scale/offset 只改变柔性符号链段，刚性活塞/杆不缩放。链绕弧的一段以省略口表示、不逐环建模；没有“链能向上推”的画面。R、β、杆端基准高度均为 S1 的比较教具设计；nc-jet 与入缸供汽口固定，不跟着活塞移动。[ir-010][D7]

### 3.3 模型输入与已有 `table` 的作者方案

**保持已有 sim 注册表不变**。`sim.kind:"table"`，全部数输出 `kind:"number", tag:"sim"`（默认值亦可），不写 `from`；状态输出不写 `tag`。每行 `source:["S1"]`，不是虚构外部测量。控件七个，所有 label/options 双语：

| control id | kind / 合法域 | default |
|---|---|---|
| experiment | choice: pressure, mechanism, governor, energy | mechanism |
| cold-pressure | step: 20,50,80（kPa abs） | 20 |
| cycle-rate | step: 8,10,12（周期/分，给定） | 10 |
| governor-rpm | step: 60,90,120（静态比较） | 90 |
| work-share | step: 10,20,30（每 100 份） | 20 |
| motion-mode | choice: manual,auto | manual |
| phase-deg | step: 0,90,180,270,360（主机构轨道相位） | 0 |

`table.experiments` 只需三个独立表，无须以 experiment 造成大笛卡尔积，也不伪造 NaN 单元格：

| 表 id | keys / 行数 | 每行写齐的 set 输出 |
|---|---|---|
| pressure-table | cold-pressure,cycle-rate / 9 行 | hot-abs=110；cold-abs；force-down；force-up；newcomen-force；work-cycle；indicated-power |
| governor-table | governor-rpm / 3 行 | governor-speed；ball-angle（deg）；ball-radius（m）；collar-rise（m）；throttle-opening（%）；governor-pose（state: gov-slow/gov-middle/gov-fast） |
| energy-table | work-share / 3 行 | heat-in=100；useful-work；heat-out |

三表始终求值，experiment 仅用作阅读/机构运行条件；不相关读数靠已有 `try.observe`、`telemetry.scope:"observe"` 隐去。`governor-pose` 的 `states` 三项均双语，**数值输出名称与单位在 parts/sources/正文完全一致**。15 行覆盖每表全部组合，保持每行同一组 set；每输出只由一个表赋值。所有输入常量与完整全精度生成公式写入 S1。

压力算式（S1 从 NASA P=F/A 推导，所有压力乘 1000 变 Pa）：

```
D=0.47625 m, d=0.04 m, s=1.2192 m
A=πD²/4=0.17813934812021404 m²
Ar=πd²/4=0.0012566370614359172 m²
F(top,bottom)=1000*(top*(A-Ar)+101.325*Ar-bottom*A) N
Fd=F(110,cold); Fu=-F(cold,110)      // Fu 正值向上
W=(Fd+Fu)*s/1000 kJ; Pi=W*cycleRate/60 kW
Fn=(101.325-cold)*1000*A/1000 kN   // 无穿盖杆的比较模块
```

恒压、无摩擦/惯性/泄漏/截止膨胀，不扣泵功，所以 W 是**指示功**、Pi 是**模型指示功率**。Fn 不能代替主机上杆面积公式。默认 Fd=16.0216400043 kN、Fu=15.9303453218 kN、W=38.9558605096 kJ、Pi=6.4926434183 kW；Fn=14.4871824859 kN。读者不把这些作为 Lap 性能。[se-013][se-018]

调速静态公式（S1 理想点质量圆锥摆受力推导，不引入受限教材）：L=0.5 m、g=9.81 m/s²，ω=2πn/60，c=g/(Lω²)，r=L√(1−c²)，上杆角 acos(c)，球高在顶枢轴下 Lc，滑套在顶枢轴下 2Lc，升程 h=2L(1−c)。只生成合法三档，不推广到低速/零速。两上杆、两下杆均长 L；叉环 J=(0,h)，阀轴 T=(1,0)，柄 TM=0.4 m，杆 JM=1.1 m；取 `circle(T,0.4,J,1.1,branch:+1)` 的 M，ψ=atan2(My,Mx−1)，ψ90=−2.814149273102258 rad，u=0.5+(ψ−ψ90)/(π/2)。三档 u 均在 (0,1)，阀片角=90u 度。表存 100u，不把开度当作流量比例。[se-019]

| n rpm | h m（全精度生成后显示三位） | 100u %（显示一位） |
|---|---|---|
| 60 | 0.503019594234333 | 84.92403502048649 |
| 90 | 0.7791198196597037 | 50 |
| 120 | 0.8757548985585832 | 36.26315839616716 |

生成三个完整刚性姿态 `gov-slow/gov-middle/gov-fast`，每个 `duration:0`；所有球、上下杆、滑套、叉环、JM、TM、阀片用**同一组端点**生成。已有 `{output:"governor-pose",part:[…],pose:{…}}` 选择姿态；杆件旋转/位移，不缩放。无连续转动、无动态调速。主机其余 parts 不受该 binding 影响。[D6][se-019]

静态调速器局部原点（垂下时的滑套/叉环位置）映射到 world [1,2,0.9]，顶枢轴局部 (0,1)，两球 (±r,1−Lc)，滑套/叉环 (0,h)，阀轴 T=(1,0)。据此一次生成全部 world 端点；z=0.9 的平面只是展示布局。锅炉到阀体、阀体到阀箱的固定供汽管按此接头布置，不让阀片或轴凭空悬浮。该坐标为 S1 的重建尺寸，不是 Lap 原厂平面图。[se-019]

账本三表值为 W=10/20/30、Qc=100−W；`energy-input` repeat100 常显；`energy-work` repeat30 与 `energy-reject` repeat90 用已有 `count:true` 绑定。三个零件都不能有 extra。输入排与输出两排分栏显示“输入/输出”，不能把三排相加说有 200 份；输出两排相加恰为 100。[se-020]

DESIGN：主机构长及坐标见 §4；锅炉半径 0.6 m/长 2.2 m、管半径 0.05 m、缸壳工作内长约 1.5 m、显示活塞半径 0.235125 m、活塞厚 0.05 m、阀芯升程 0.015 m 都是展示尺寸。物理可动体以 §4 解算坐标为准，静态支架避开完整行程。参考内径/行程/飞轮不能因镜头构图缩放；其他几何及镜头属于 S1，不添“典型实机”说法。[se-002–004][se-017]

### 3.4 流、动画与模式

| 流 id | 路径 / 状态 | 语义与验收 |
|---|---|---|
| `live-steam` | boiler→throttle→valve-chest | 热token；物质路径，不是能量本身；配汽分支见下 [se-010–011] |
| `port-steam` | valve-chest→upper / lower port 两条paths | 仅对应进汽路径可见；随共享frame门控 [se-010] |
| `exhaust-steam` | 两端exhaust→condenser | 仅排汽端可见；与进汽端不短路 [se-010] |
| `cooling-water` | cistern→injection-jet→condenser | 冷token；到混合处结束 [se-009] |
| `mixed-discharge` | condenser→air-pump→hot-well | 水/空气混合物示意；不把每点说成一个分子 [se-009] |
| `feed-water` | hot-well→feed-pump→boiler，另分支overflow | 只有一部分返回；水箱有外来补水，非永动闭环 [se-009] |

最多六次流绘制；一条流内多个 paths 分摊点数。≤360点/流、spread小于管内半径，不穿金属。`port-steam`、`exhaust-steam` 最多四条分支，端点正对阀口；粒子多少只解释路径，不推断流量。章节 07 账本用实体小片，避免再造能量流占据物质管道。[se-009–010][se-020]

主机运动由 E-ST1/2 共享刚性机构驱动：beam、piston/rod、parallel links、drive-rod/planet、sun/shaft/flywheel、centre-link、pump。调速球、上/下杆、滑套、节流连杆在三个离线求得的刚性端态之间瞬切。Newcomen 比较模块用四个命名静态 pose（duration:0）按拍切换，**不声称是压力积分**。阀片只在切换处短程动作，阀箱剖面把四个口显出来。[se-006–011][se-017–019]

六条流全部 `whenRun:true, flat:true, ends:fade, clip:false`，取可视速度0.12 m/s、count≤360/流、size0.6、spread0.004 m，均为 S1 的可读性设计，不是实物流速；小管若容不下该 spread 必须缩小。物质蒸汽的排出分支可由 hot 在进入冷凝器前过渡 cold；冷却水到混合处即结束，混合排出单独一条，不把注水流误作继续绕回的纯蒸汽。主机四固定缸口不接移动活塞，故不用移动端点扩展。

- X-RAY：只淡化shell，杆/齿轮保持实体；CUTAWAY `cylinder-front` 按汽缸世界中心设平面，保留约半缸并露出活塞；采用引擎现有平面符号，R2 核实际保留侧。冷凝器另设 `condenser-front`，不同时施加两张剖面。
- EXPLODED：保持同一冻结相位后按组分离；流关闭，驱动停；恢复assembled再从冻结相位继续，不能让脱开的齿轮空转。
- 单件isolate：静止检查；机构锁相，标注锚点仍跟真实变换。所有模式遵循现有docs/08。

### 3.5 HUD 与镜头

四条规格：参考内径约0.476m、参考行程约1.219m、参考飞轮约4.88m、运行研究“Double-acting condensing / 双作用冷凝式”。每条来源都见[se-001–004]。`telemetry` 最多六行，全部用已有 `follow` 与 `scope:"observe"`：合力（down/up 同单位一行）、周期功、静态滑套升程、阀开度、账本功、账本排热；其他章显示 `—`。压力等输入在现有控件芯片与细看显示。删机构帧遥测 HUD；累计圈数只供测试 API。

当前 `spec.tag` 只有 typical/design/sim，不为三个参考尺寸新增芯片类型：行用 `tag:design`，双语 key 明写 Reference bore / 参考内径、Reference stroke / 参考行程、Reference flywheel / 参考飞轮，数值出处在 note 与来源入口明确，不伪装“行业典型值”。`topic.yaml.note`：EN “Mechanism study after the preserved 1788 Lap engine · reconstructed links and enlarged clearances · model pressures, static governor positions and energy shares.” / ZH「以保存的1788年Lap蒸汽机为参考的机构研究 · 连杆重建、间隙放大 · 压力、调速器静态位置和能量份数为模型值」。[se-001–004][se-017–020]

| preset | position → target，fov30（DESIGN起点） | 用途 |
|---|---|---|
| `hero` | [11,9,15]→[−0.5,2.8,0] | 包含完整锅炉、横梁和飞轮 |
| `newcomen-view` | [−7,5,7]→[−11,2,0] | 独立比较模块 |
| `cylinder-view` | [−0.6,4.1,4]→[−2.5,2.5,0] | 活塞与四阀口；本拍只留3–5标签 |
| `condenser-view` | [0.5,3.4,5]→[−1.7,0.9,0.8] | 低位水与泵，必要时镜头内临时调整 |
| `linkage-view` | [−1,7.4,5]→[−1.2,5,0] | 平行运动；05章另用拍内齿轮近景 |
| `governor-view` | [3,4,5]→[1,2.1,0.9] | 双球、滑套、节流联动；07用拍内账本镜头 |

`views.section.plane=xy`；六预设不另外挤出新模式。所有预设为待几何R2校准的DESIGN，不称为照片配准结果。`hero-clean` 另采用hero，并保持全部主体及四周留白。

### 3.6 数据、参考与许可家族

本主题是 SpaceScene，**无地图关键帧、无地理派生文件**，不引入父 `data/INVENTORY.md` 中铁路、煤层或底图。已读父 `datasets.json`：其早期拒收 NC 的文字已被 next-batch §三覆盖，但本题没有使用这些地理数据的理由。

| 文件 / 派生物 | 依据 / 用途 | 许可家族与登记 |
|---|---|---|
| 开发 refs/ferguson-fig10-parallel-motion.jpg | Lardner 1852，Ferguson fig.10；20,628 B；sha256 `4b03d288fe7d9a67eb9a6ebb498c6c7d18fc906dcf6bfc7151053ccbe6be102a` | PD 原图，独立保存来源、作者、年代，不打 Atlas NC 标签，不带 Gutenberg 标识入产品 |
| 开发 refs/ferguson-fig7e-sun-planet.jpg | Muirhead 1854，fig.7e；14,862 B；sha256 `38ec14bd14a9a1eed75dd31756857caadd8fc1a6e4394ee3f12e3ba2dd6124bd` | PD；核实际采用定距连杆而非旧图的环导向 |
| `data/parts.json`（含程序化几何、15 行表、相机与管路） | PD 机构拓扑、独立事实与本研究计算 | CC BY-NC-SA 4.0 family；在 SOURCES.md 列 S1 的公式和尺寸来源；不是历史制造图 |
| 章节、glossary.json、sources.json、SOURCES.md、REVIEW.md | 本 spec，SMG 独立改写有署名 | CC BY-NC-SA 4.0 family；SMG 描述的 CC BY 4.0 署名与改写声明保留 |
| 三张处理后的本地 webp、截图 | §7 最终 PNG，原创 AI 图及原创程序化模型 | CC BY-NC-SA 4.0 family；保留父快照复用 provenance |
| ASME、Hulse、Birmingham 档案媒体 | 只独立引用公开尺寸/文字事实 | **不复制媒体、不下载受限扫描、不作派生输入**；无声明可再分发许可 |
| SMG 物件照片 | 仅开发对照外形；本轮不作为产品插图或几何追踪输入 | 单独照片 CC BY-NC-SA 4.0；若施工确需追踪，先在同一 NC-SA 派生清单登记署名与改动，不得引入 BY-SA |

施工在 `LICENSE-CONTENT` 与 `THIRD-PARTY-NOTICES.md` 登记上述 NC-SA 派生物与 PD 原图例外，逐文件指明许可，不能写“所有引用网页都是 CC”。允许 PD/CC0/BY/BY-SA/BY-NC-SA/ODbL/ODC-BY 的总政策不等于允许把 BY-SA 与 BY-NC-SA 混进同一派生文件；本题没有后一族输入。受限、需协议、登录与验证码不绕过。现有两张机械参考图总 **35,490 B**。[D12]

## 4. 引擎契约（仅真正缺失的两项）

### 4.1 代码核对与删除项

核查依据为本 worktree：`schema.ts`（primitive/extra、poses、flow.paths、sequence≤32）、`sim-schema.ts`、`table-schema.ts`、`lib/sim/{index,table,bind,hz,timeline,tidal}.ts`、`stages/model3d/{runtime,AnimClocks,TimelineClock,PartNode,Flows}.tsx/ts`、`View.tsx`、`index.ts`、`bridge.ts`、`scripts/validate-content.ts`、`scripts/shoot.ts`，以及 docs/06 的 SpaceScene、table、绑定、QA 和 docs/40–41 §9 已施工记录。现有注册种类没有 steam，根 schema 也没有 mechanisms；单个动画/时间线不会维持几何约束。

| 草稿项 | 最终处置 / 覆盖能力 |
|---|---|
| 原 E-ST1 新 `sim.kind:steam`（压力、静态调速、能量） | **删除**；固定离散控件用已有 `table`，按 §3.3 生成全部行；已有 `tag:sim`、设计来源检查、NaN/observe 显示、predict、record、count、pose 足够。无新 sim registry 条目 |
| 原 E-ST2 的主横梁/平行运动/齿轮/泵刚性约束 | **保留为 E-ST1**，范围只含主平面机构；不造通用物理引擎 |
| 原 E-ST2 的调速器实时求解、4.5:1 皮带比 | **删除**；三档离线解析端态 + 已有 pose binding（duration:0）。本轮范围不含动态反馈积分 |
| 原 E-ST3 每帧同步阀/流与恢复 | **收窄为 E-ST2**；一份 frame，四个独立阀 part 与四条固定路径门控 |
| 原命名 `element` / extra 子网格驱动 | **删除**；阀芯、阀片、连杆都是现有独立 part，保持可选与索引 |
| 原 `frameEndpoint`、`followFrame` 遥测 | **删除**；蒸汽管口全固定，不需移动路径；模型帧只进只读测试 API，普通数读数用已有 `follow` + `scope:observe` |
| 章/拍/URL、索引、选中详情、双语源弹层、新 HUD | **不列新工作**；`beatScene`、`sim` URL 编码、core 章节轴、readerTop/readerEnd、PLATE、现有控件注册已覆盖；只为新帧追加必要的运行时保存/恢复 |
| 齿轮 primitive、材质、流渲染器、回放时间线 | **不新增**；现有 extrude/lathe/tube/wood/steel/brass 与多路径 Points 足够；主机构不用插值时间线来冒充精确闭合 |

| 编号 | 必须的最小工作 | 预计代码边界 / 对外结果 |
|---|---|---|
| E-ST1 | 可选 `mechanisms[].kind:'beam-steam'`；纯几何求解、单相位时钟、严格 schema 与交叉校验 | `mechanism-schema.ts`、`lib/mechanism.ts`、现有 schema/runtime；frame 的点位、角度、杆长残差 |
| E-ST2 | 同 frame 应用零件刚体矩阵、阀芯与固定流路径 gate；标注/测试桥、冻结与 P 恢复 | `MechanismDriver.tsx`、PartNode/Flows/probes/bridge/View 必要接线；测试 API 两个方法；不新增 UI 面板/URL 字段 |

### 4.2 E-ST1：作者字段与解算

下列为**新增契约**，不是当前已被 schema 接受的 JSON。根 `parts.json.mechanisms?: Mechanism[]` 默认空；v1 最多 1 项。`sim.kind` 仍是 table。严格对象（拒收未知字段）：

```ts
{
 id:'main-engine', kind:'beam-steam', origin:[0,5.6,0],
 clock:{ phaseControl:'phase-deg', rateControl:'cycle-rate',
         modeControl:'motion-mode', experimentControl:'experiment' },
 geometry:{ beamPivot:[0,0], shaftCentre:[2.5,-3], radiusPivot:[-2.5,-0.8],
   beamHalfM:2.5, connectingRodM:3, orbitM:0.6092838281609874,
   shortLinkM:0.8, radiusRodM:1.25, innerFraction:0.5,
   beamBranch:1, parallelBranch:1, pistonRodM:2.4,
   cylinderX:-2.5, radialDisplayClearanceM:0.003,
   nominalStrokeM:1.2192, pump:{beamFraction:-0.4,sliderX:-1,rodM:4.5} },
 parts:{ /* 每个下列 role -> {part, restEndpoints?}；都为独立 part */ },
 ports:{ /* §4.3 的四个固定端口角色 */ }
}
```

局部 XY 为机构平面、z 为显示深度；所有 part 几何以 θ=0 的解作装配基准，world=local+origin。part 的既有 at/rotation 决定该件静态 z 层，无须增加通用 z binding。支架和固定缸体不进动态 role。

固定 role 白名单与运动：

| role | part | 定义 |
|---|---|---|
| beam | beam | 刚体 B-A-K（含 C），绕 A |
| innerLink / outerLink / bottomLink / radiusRod | parallel-inner / parallel-outer / parallel-bottom / radius-rod | C-E / B-D / E-D / F-E |
| driveRod / centreLink | drive-rod / centre-link | K-P / O-P |
| piston / pistonRod | piston / piston-rod | S / S-D，x 坐标随 D；杆竖直 |
| planet / sun / shaft / flywheel | 同名 | 行星中心 P，后三者 O；角度关系见下 |
| pumpRod / pumpPiston | pump-rod / pump-piston | Q-W / W |

杆件给 `restEndpoints:[[x,y],[x,y]]`，等于 θ=0 解的相应端点；其余角色只写 `{part}`。所有 role 恰好一次，目标 part 唯一；普通 primitive+extra 可以整体刚体变换，但这些动态目标不得有 repeat/bilateral、mesh/rig、独立动画、pose（章/拍或 sim）、offset/rotate/play/shift/stretch/bend/fill binding，或第二机构驱动。静态阀体不随阀芯移动。不能以通用 extra 元素驱动扩大此契约。

**确定性求解（无 DOM、clock 或 store 的纯函数）**：输入 θ（不取模的轨道角，rad）和 geometry；输出一份复用缓存。令 A=beamPivot、O=shaftCentre、F=radiusPivot、L=beamHalfM、l=connectingRodM、a=shortLinkM、b=radiusRodM、s=pistonRodM；本夹具分别取 (0,0)、(2.5,−3)、(−2.5,−0.8)、2.5、3、0.8、1.25、2.4，所有长度为 DESIGN：

1. P=O+r(cosθ,sinθ)，r=orbitM；K=`circle(A,L,P,l,beamBranch)`；β=atan2(Ky−Ay,Kx−Ax)。v=K−A，C=A−v/2，B=A−v。
2. E=`circle(C,a,F,b,parallelBranch)`，D=B+E−C；C-B-D-E 是平行四边形。S=D−(0,s)。活塞与竖杆一起随 D 横移，**不把 D.x 硬锁成 cylinderX**；3 mm 径向显示余隙容纳最大偏移。[se-017]
3. α=atan2(Ky−Py,Kx−Px)。取 δp=atan2(sin(α−α0),cos(α−α0))，α0=α(0)，δs=2θ−δp；validate 保证本种机构整周期传动杆只摆动、δp没有跨±π的跳变，故此式无需依赖前一帧就能确定相位。planet 固连 driveRod，sun/shaft/flywheel 共 δs，centreLink 绕 O 的角为 θ。每周期 δp 净零，δs 净 4π。[se-008]
4. Q=A+pump.beamFraction·v；Wx=pump.sliderX，Wy=Qy−√(pump.rodM²−(Qx−Wx)²)。pumpRod=Q-W；泵活塞=W。[se-017]
5. dDy/dθ 用中心差分 ε=1e−5 rad（角度输入不取模）或同等精度解析导数；阈值 |dDy/dθ|≤1e−7 m/rad 为 switch，负=down，正=up。真实几何死点约在 90°/270°附近，**不可把 90°/270°写死为切阀点**。

`circle(c0,r0,c1,r1,b)`：d=|c1−c0|，a=(r0²−r1²+d²)/(2d)，h²=r0²−a²，m=c0+a(c1−c0)/d，交点=m+b√h²·perp(c1−c0)/d。拒绝 d≤1e−9、无交点、h²<−1e−10；仅舍入的 [−1e−10,0) 夹零。branch 必须固定，不在运行中翻支。

v1 的 **48/48 相等齿轮**由内容生成器用现有 extrude 生成相同模数的渐开线；节圆半径 r/2，模数 r/48、压力角 20°、总切向侧隙 0.0003 m 均为 S1 的 DESIGN。基圆 rp cos20°、齿顶 rp+m、齿根 rp−1.25m；根部圆滑过渡。现有 `outline` 每块上限160点、extra上限32，故每轮分成四个90°扇区（每区12齿、每块轮廓≤160点，primitive+3 extra、同材质烘焙合并），不能把超长整轮轮廓塞过 schema，也不为此放宽引擎上限。静态 θ=0 对齐“一齿对一槽”，两轮各分配半侧隙，至少逐齿廓采样核完整周期无齿体相交；引擎只作旋转约束，不新增齿轮 primitive。齿廓误差不能用错相或任意星形替代。[se-008][se-017]

**校验接入**：schema 导出 `mechanismIssues`，通过现有 SpaceScene schema/schemas 注册路径进入 `pnpm validate`，不在内容组件里运行校验。所有数有限、长度/clearance>0；innerFraction v1 恰为 0.5；branches ±1；beamFraction∈[−1,1]；点长为 2、origin 为 3；controls 都存在，mode/experiment 是上述 choice，phase/rate 是 §3.3 的 step 值域。验证全部合法 phase 值，并以 4096 等间隔角检查圆可达、杆残差 <1e−9 m、circle h>1e−6 m、泵根号余量>1e−9 m²、|δp|<π−1e−4且相邻δp无跨π跳变；32768 角采样行程距 nominalStroke≤1e−6 m，max|Dx−cylinderX|<clearance。所有引用与互斥冲突给 JSON path/目标 id，不静默丢字段。运行遇到非法解停止机构、关闭四个门控并报双语配置错误，不输出 NaN 的姿态。

### 4.3 E-ST2：单 frame、独立阀芯与已有流渲染

`ports` 恰有 `upperIn/lowerIn/upperOut/lowerOut` 四键，每项严格为：

```ts
upperIn:{ part:'valve-upper-in', openOffset:[0,0.015,0],
          flow:{id:'port-steam',path:'upper'} }
// lowerIn -> valve-lower-in, port-steam/lower
// upperOut -> valve-upper-out, exhaust-steam/upper
// lowerOut -> valve-lower-out, exhaust-steam/lower
```

`openOffset` 是世界轴向的展示抬阀向量，沿实际阀芯轴，不强制所有阀都向 Y 抬。目标 part 必须独立、无其他 transform driver；基准位置为关阀。flow/path 均已存在且唯一，一个 path 只归一个 gate；不允许同时为该路径写 sim.visible/intensity/state/tidal，也不允许移动端点。管口全固定，故无 frameEndpoint。其他三条水路及供汽主干继续沿用现有 sim/whenRun。

down 时只开 upperIn+lowerOut；up 时只开 lowerIn+upperOut；switch 四口全关。**同一 frame 更新四阀位置和 gate**；关 gate 立即把该路径粒子 opacity 置零（不能沿用普通 0.3 s 余辉造成两个方向同时通），开 gate 可用已有淡入。现有 `Flows` 的多路径可见性/纹理/相位渲染照用，只增加 frame boolean 与现有可见性的 AND；不造新的 flow shader 或通用 binding DSL。[se-010]

执行顺序：共享时钟 → 纯求解一次 → 主机构/阀芯矩阵 → 现有 explode 展示偏移 → probes/标注/流/API 读取同一缓存。杆矩阵为 `T(当前中点)·Rz(当前角−静态角)·T(−静态中点)`，坐标加 origin、保留各件静态 z，绝不缩放杆长；圆盘/活塞用各角色的同等刚体映射。PartNode 的包围盒、投影锚点、点击代理与可见 mesh 必须同变换，不能仍指向 rest 位置。explode 刚开始即冻结，之后只作展示拆开。

**clock / URL / 恢复**：

- 有 `experiment∈{pressure,mechanism}`、`motion-mode:auto`、RUN、非 paused/REFERENCE/EXPLODED/isolate/solo、非 reduced-motion 时，dθ/dt=2π·cycleRate/60。使用现有 demand-loop、MAX_DT、暂停/可见性规则；持有单个数值 θ，别给每根杆积分。RUN 关闭立即冻结，不再用惯性余转冒充物理。
- manual 按合法 phase-deg 设置 θ，RUN 可以只让固定路径粒子流动；压力实验不改变运动速度。改变 rate 在 auto 中只改后续斜率、不跳相位；改 cold/work/gov 不重置 θ。改 mode=manual 或 phase 控件立即 seek；新的章/拍始终按 base⊕beat 从该拍 phase 开始，不继承前拍时刻。
- 沿用 `ch,b,sim,run,view,pose` URL；**不新增 query key**。只有手动五个合法 phase 值保证精确静帧深链接；auto 链接保证从所声明 phase 起跑，不承诺编码分享时的运行圈数。现有 `sim=` 整组覆盖拍基线的语义保留。
- REFERENCE/EXPLODED/isolate/solo 进入时冻结 θ，退出恢复同一 θ；不因 mesh 分离让齿轮继续转。P 额外保存/恢复 `{thetaRad,qaHold}` 与现有 paused/run/sim snapshot；P 退出相位与进入前一致。当前拍在 P 内重应用时仍使用拍指定相位。减少动态不推进，仍可手动换拍/相位；没有机构的主题逐位保留既有行为。
- **不新增 G 重放语义**；已有 G 只属于有 timeline/replay 的卡，本题没有 timeline/replay，重看通过拍轴或 phase 控件，避免注册空操作。HUD 和 keyboard 仍用已有 store。

**只读测试 API**（挂现有 `__atlas.engine`，无机构主题返回 null）：

```
mechanism(id) -> null | {
 thetaRad, phaseDeg, cycles, pistonDirection:'up'|'down'|'switch',
 points:{A,O,F,P,K,C,B,E,D,S,Q,W},             // world metres
 planetAngleRad, sunAngleRad, shaftTurns,     // 相对 θ=0，unwrapped
 ports:{upperIn,lowerIn,upperOut,lowerOut},
 linkResidualM, clearanceMarginM,
 parts:{[partId]:{matrix:number[16], endpoints?:number[][]}},
 gates:{'port-steam:upper':boolean, ...}
}
seekMechanism(id,deg) -> boolean
```

phaseDeg 在 [0,360)，cycles=θ/2π，shaftTurns=δs/2π 保留累计圈数，故 seek360 时 cycles=1、shaftTurns=2、phaseDeg=0。矩阵与端点是**当前实际绘制后**变换（含 display explode）；linkResidual 另取拆开前物理 frame。API points 也是未拆开物理点，字段语义不能混淆。`seekMechanism` 仅 QA 瞬态：接受有限 0≤deg≤360，设置内部 qaHold、立即刷新姿态/门控，不偷偷写不合法 step 值到 sim/URL；未知 id、NaN、越界 false 且不改变任何状态。下一次用户改 phase/mode、换拍清 qaHold。API 读取无副作用，手动 UI 与深链接用已有 `setSim`，不让测试 API 成为产品依赖。

### 4.4 复用范围、实现交付与性能预算

引擎实现最小夹具 `sample-steam`（draft）覆盖手动四阀、连续刚杆、三档静态 governor、15 行表；不把生产机器或精确历史外观作为引擎夹具。交付 `tests/space-scene/{beam-steam,steam-bindings}.test.ts`、`tests-e2e/sample-steam.spec.ts`，更新 docs/06 的新机制字段与测试 API；§9 在实际施工验收后填写。schema、geometry maths、stage driver 三层分离；不加依赖、不改 package.json，不在 MDX 或生成器绕过引擎操纵 DOM/store。

每帧一次解算 <0.2 ms（安静机器 10,000 次中位，记录环境），常量内存、缓存向量/矩阵、零 geometry/material 分配；不写每帧 React state、不更新 DOM 数字。静止无连续 rAF；只在动作/相机/流需要时 invalidate。主题预算：静止目标 <75 calls、运行目标 <85，**硬门槛 <100**（较小的 <50/<60 理想目标继续争取，56 个可选件的例外公开记录）；流增幅≤6、<10，三角形目标 <0.3 M、上限≤1.5 M；首屏 JS≤300 KB gzip（docs/02），无运行时外网、pixelRatio=min(dpr,3840/W,2)。真 GPU 1920×1080 目标 60 fps；SwiftShader 不报为真机帧率。

### 4.5 单元、shoot 与 e2e 的明确验收数

| 检查 | 输入 | 期望值 / 容差 |
|---|---|---|
| 九行压力表独立算式 | cold20, rate10 | Fd=16.02164000431131 kN，Fu=15.930345321797988 kN；数表误差≤1e−8 kN |
| 冷端变化 | cold20/50/80，其余不变 | Fd=16.0216400043/10.6774595607/5.3332791171 kN；单调下降 |
| 受力平衡 | top=bottom=atm=101.325 | 净力 0±1e−9 N；不能拿 110/110 作零力夹具 |
| 指示账 | cold20,rate10 | W=38.95586050959246 kJ；Pi=6.492643418265409 kW；cold20,rate8/12 的 Pi 分别为默认×0.8/1.2 |
| Newcomen 比较 | cold20，无穿盖杆面积 | 14.487182485876407 kN；与主机公式分开 |
| 4096 帧杆长 | θ∈[0,2π)，固定 branch | AK=2.5，AC=CB=ED=FE=1.25，CE=BD=0.8，KP=3，OP=r，QW=4.5 m，误差各 <1e−9 m |
| 32768 帧轨迹 | 默认 geometry | 行程=1.2192000154±1e−6 m；Dx∈[−2.500931896,−2.499137005]±1e−8 m；最低径向余隙 >0.002 m |
| 齿相位 | 所有样本及 θ0→2π | δs+δp−2θ=0±1e−10 rad；整周 δp净0、δs净4π、shaftTurns=2；行星无额外自由自转 |
| 端点与阀 | θ=0 / π | D局部约(−2.50000000969,−0.73731382482)/(−2.50000000944,−0.73763822232) m，误差≤1e−8；前者 down→upperIn/lowerOut，后者 up→lowerIn/upperOut |
| 非整点死点 | 对 D.y 极值数值求根 | derivative≤1e−7 时四口全关；90° 的 dDy/dθ≈−0.0148262，不是 switch；270°≈+0.0158473，不是 switch |
| 调速三档与几何 | n60/90/120 | h、100u 等于 §3.3，容差1e−6；两球对称，上下杆各0.5、JM1.1、TM0.4 m 误差≤1e−9；pose duration0 |
| 能量三行与绘制 | work10/20/30 | useful+reject=100；copies=10+90/20+80/30+70，输入排100；不出现 20% 实机效率 |
| 配置错误 | 缺 role、未知 part/path、重复 driver、坏 branch、innerFraction≠0.5、不可达圆、clearance不足、非法 control | 全部路径明确的 validate error；合法旧主题完全不受影响 |
| 暂停、变速与恢复 | autoθ=任意，rate10→12；pause/R/E/isolate/solo/P | 变速不跳；冻结时θ不变；退出保护/演示回原θ，差≤1e−9 rad；同一个frame供阀和流读取 |
| URL 与 QA seek | `?ch=power-both-ways&b=3`；manual180 的合法 sim 覆盖；QA seek45.5/360/NaN/unknown | 新 document 与拍跳转同 frame；45.5可读但不写URL，360累计两圈；非法无改变 |

`pnpm shoot sample-steam --beats --keys --layout` 及生产主题同命令跑四语言/主题组合（§8）；不增加新命令旗标。现有 shoot 的截图、beat-link、八尺寸、外部请求检查复用；**它不会自动验证杆长与门控**，新增 e2e 必须读取上述 API 与实际绘制端点/gate，并逐帧扫角、验证 paused/恢复/深链接。另用现有 `--shots` 的 js 先 `seekMechanism`，分别保存 0/90/180/270/360° 齿轮与四阀剖面；人工看齿廓相位、交叉深度与标签锚点。无“调用 API 成功即证明模型画对”的替代验收。

## 5. 名词表 EN / ZH（16 项）

中文为编辑用语，不声称已得到MOE/新加坡专门术语表逐字认可；父档已核通用词可沿用，新增机构译名按 D9 作为编辑用语说明。其余admission/exhaust/absolute-pressure等首次出现时在正文直接解释，不再膨胀glossary。[se-007–015]

| id | EN / ZH | Definition EN / ZH | first / see / facts |
|---|---|---|---|
| steam-engine | Steam engine / 蒸汽机 | A machine that uses steam to perform mechanical work. / 利用蒸汽做机械功的机器。 | 00；cylinder；se-024 |
| cylinder | Cylinder / 汽缸 | The chamber in which a piston moves. / 活塞在其中运动的腔体。 | 00；piston；se-006 |
| piston | Piston / 活塞 | A close-fitting moving part acted on by pressure on its faces. / 在缸内运动、两面受到压力作用的零件。 | 00；pressure-difference；se-013 |
| pressure-difference | Pressure difference / 压强差 | The difference between pressures on two sides. / 两侧压强的差别。 | 01；piston；se-013 |
| condensation | Condensation / 凝结 | The change from vapour to liquid. / 物质从气态变成液态的变化。 | 01；separate-condenser；se-014 |
| separate-condenser | Separate condenser / 分离冷凝器 | A vessel separate from the working cylinder where exhaust steam condenses. / 独立于工作汽缸、让排出蒸汽凝结的容器。 | 02；air-pump；ir-013 |
| air-pump | Air pump / 抽气泵 | A pump that removes air and water from this condensing system. / 在这套冷凝系统中把空气和水移走的泵。 | 02；separate-condenser；se-009 |
| double-acting | Double-acting / 双作用 | Working strokes occur in both directions of piston travel. / 活塞两个方向的行程都能做功。 | 03；piston；se-006 |
| parallel-motion | Parallel motion / 平行运动机构 | Watt’s linked-bar arrangement giving an approximately straight piston-rod path. / 瓦特用连杆组合得到近似直线活塞杆路径的机构。 | 04；pivot；se-007 |
| pivot | Pivot / 支点或枢轴 | A joint about which a member turns; it may be fixed or moving. / 杆件绕它转动的连接点；可以固定，也可以随机构移动。 | 04；parallel-motion；se-007 |
| sun-and-planet | Sun-and-planet gear / 太阳与行星齿轮机构 | A rod-carried planet gear travels around a sun gear on the output shaft. / 传动杆带着行星轮，绕输出轴上的太阳轮运动。 | 05；flywheel；se-008 |
| flywheel | Flywheel / 飞轮 | A wheel that stores and returns rotational kinetic energy. / 储存并交还转动动能的轮。 | 05；work；se-023 |
| centrifugal-governor | Centrifugal governor / 离心调速器 | A speed-sensitive mechanism that adjusts steam admission through a linkage. / 随转速变化、通过连杆调整进汽的机构。 | 06；throttle,feedback；se-011 |
| throttle | Throttle valve / 节流阀 | A valve that restricts the steam supply passage. / 限制供汽通道开度的阀。 | 06；centrifugal-governor；se-011 |
| feedback | Feedback / 反馈 | A path by which an output affects the input that drives it. / 输出反过来影响驱动它的输入的路径。 | 06；throttle；se-011 |
| work | Mechanical work / 机械功 | Energy transferred by the component of a force along a displacement. / 力沿位移方向的分量所传递的能量。 | 03、07；flywheel；se-018，S15 |

## 6. 来源（施工 `sources.json`，本轮访问 2026-10-27）

源编号使用现有合法 `S1` 形式。S1 必须 `design:true`；其余来源不能伪造测量标签。每条含 title/en+zh、publisher、URL、locator、accessed、note。原网页事实转述与媒体许可分开。

| id | 来源与定位 | 本页用途 / 许可与限制 |
|---|---|---|
| S1 | 本规格 §1.2、§3.3、§4；Atlas steam-engine design study / Atlas 蒸汽机设计研究 | 自描述写全参考尺寸、重建长度/管径/余隙、七控件、15行表、受力/功/圆锥摆/刚性节流/圆交点/能量公式及舍弃项。`design:true`，NC-SA4；链接正式 topic 的 `data/SOURCES.md`，不能把 art 草稿路径当运行时 URL |
| S2 | [Science Museum Group，Rotative Steam Engine by Boulton and Watt, 1788](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788)，馆号1861-46，描述/Details/Rights | se-001、se-006、ir-015；metadata CC0，描述 CC BY4，图像各自 NC-SA4；不照抄“第一”断言 |
| S3 | [R. S. Hartenberg / ASME，landmark 111 brochure](https://www.asme.org/wwwasmeorg/media/resourcefiles/aboutasme/who%20we%20are/engineering%20history/landmarks/111-boulton-watt-rotative-steam-engine.pdf)，第7/8页末 Lap 段；第2页 Newcomen 说明 | se-002、se-005、ir-010；只独立引用事实，无媒体派生；不采用 Whitbread 尺寸/功率或实机热效率猜测 |
| S4 | [Library of Birmingham，MS3147/5/714/b](https://calmview.birmingham.gov.uk/CalmView/Record.aspx?id=MS+3147%2F5%2F714%2Fb&src=CalmView.Catalog)，Description | se-003；18 in 与4 ft目录值；未下载扫描，不宣称目录给制造图再分发权 |
| S5 | [David K. Hulse，The Lap Engine](https://davidhulse.co.uk/steam-engines/the-lap-engine/)，飞轮/地板/重建说明 | se-004–005；作者第一手模型研究的归属说明，保护媒体不复制；飞轮直径按作者报道 |
| S6 | [Eugene S. Ferguson / Smithsonian，Kinematics of Mechanisms from the Time of Watt](https://www.gutenberg.org/files/27106/27106-h/27106-h.htm)，1962，fig.7e/10与紧邻正文 | se-007–008；政府文本及选定19世纪图PD；不能把书中其他照片一概视为PD |
| S7 | [Dionysius Lardner / James Renwick，The Steam Engine，1836](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm)，§§49–53、55–60、锅炉章§73起 | se-006、009–011、023–024；历史原文PD；不用过时热学、文明等级措辞、无条件完全恒速断言；本模型滑套方向依 S1，不能从不同杠杆配置硬抄 |
| S8 | [NASA Glenn，Air Pressure](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/air-pressure/)，Definition/Magnitude of Pressure Force | se-013；P=F/A与法向压力力；本研究另作受力图，不复制图像 |
| S9 | [NOAA JetStream，The Hydrologic Cycle](https://www.noaa.gov/jetstream/atmosphere/hydro)，Condensation | se-014；汽到液及放热；不用其天气图，也不用此页推算机器温度 |
| S10 | [NASA Glenn，Conservation of Energy](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/conservation-of-energy/)，Derivation | se-015；ΔE=Q−W，闭合循环账本是明确的 S1 推导；替换抓取失败的旧 thermo1 URL |
| S11 | [Science Museum Group，Newcomen Atmospheric Engine](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine)，描述与日期 | ir-009–010；1712历史节点与1791晚例分清；说明CC BY4、metadata CC0 |
| S12 | [Ben Russell / Science Museum，James Watt and the separate condenser](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/)，2019-01-05正文 | ir-012–013；专利日与独立冷凝原理，只事实转述，不采用泛化节煤比例 |
| S13 | [Science Museum Group，James Watt](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james)，1765模型/1776商业段 | ir-011、ir-014；只采用已核最窄节点，删传记其他数量与有歧义企业成立日期 |
| S14 | 本地 [energy-conversion](../src/content/topics/energy-conversion/topic.yaml)、[states-of-matter](../src/content/topics/states-of-matter/topic.yaml) 的 frontmatter/chapters，以及主checkout `art/planned/steam-engine/manifest.jsonl` | se-016、se-021–022；本轮实际核文件、哈希、图像；原创NC-SA4；本地审计路径不进产品运行时请求 |
| S15 | [NASA Glenn，Work Equals Force Times Distance](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/work/)，常力公式及位移方向分量段 | se-018 的功与功率计算、work 定义；恒定且沿位移的力有 W=Fs，J=N·m，功率是功的时间变化率；只独立转述，不复制飞机图 |
| S16 | [NIST，SI Units – Length](https://www.nist.gov/pml/owm/si-units-length)，metric redefinition of the inch；[SP811换算说明](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors) | se-002–004 的独立换算采用 1 in=0.0254 m、1 ft=0.3048 m 的精确定义；不是增加历史测量的有效位数 |

§0.3 的 cut 来源只留编辑核查记录，不转成生产 `sources.json` 条目；尤其不把 Mayr 的索引、被挡 MOE 页或父档经济史范围引用当作本页正文证据。全文件没有逐字引文。政府/历史PD文本有相应注明；ASME、Hulse与档案未被当作开放媒体库。

## 7. 图像（只使用已在位的三张最终图）

源目录是主 checkout `/Users/gavin/work/atlas/art/planned/steam-engine/`。本轮三文件 sha256 均与 manifest 匹配；两复用文件与父 `parent-art-snapshot` 相同。最终图已逐张目视复核；未采用 generation/ 下的尝试图。[se-021–022]

| 输入 / 导出 stem / 放置 | EN caption / ZH 图注 | 核查与限制 |
|---|---|---|
| `steam-engine.png` 1024×1024 / `steam-engine` / 首页与主题封面 | Flyball governor mechanism, without its external throttle linkage. / 离心调速器组件，省略外接节流连杆。 | 两球、两上杆、两下杆、一滑套；不是完整反馈闭环或 Lap 实物复制。hash `b27e69b77277bd969ff318bc424c7a6cf318fad20c8e698e0976ecb1c178717b` [se-021] |
| `steam-engine-separate-condenser.png` 1536×1152 / 同名去扩展名 / 02章冷热分开之后 | Separate-condenser principle module; boiler, air pump, full valve cycle and injection jet are omitted. / 分离冷凝器原理模块；省略锅炉、抽气泵、完整配汽循环与内部喷射口。 | 旧图只示外部水浴，不能用来佐证生产模型的喷射构造。hash `cd424f00e8424356c28a2eab927fd21a10db29166972ae38b43672aba9ddd53a` [se-009][se-021] |
| `steam-engine-parallel-motion.png` 1536×1152 / 同名去扩展名 / 04.3之后 | Watt’s parallel motion: a hinged parallelogram and a separately pivoted radius rod. The crossing is not a joint. / 瓦特平行运动机构：铰接平行四边形与有独立支点的摇杆；交叉处不是铰链。 | 重看 fig.10：A/F固定、C/B/E/D活动；C-E无多余中间铰链，E-F越过B-D不连接，一根输出杆。只核拓扑，不从生成图量尺寸。hash `e33e6bf3144fe115e5ce936175479d4a71faafba36116af62c934fe38cf87a97` [se-007][se-022] |

三图均中性灰、透明底、无文字/箭头/纸底。未来用现有 `scripts/illustrate.ts` 生成 800/1600 px webp，固定 width/height 与 alt 双语，按 paper/cinema 既有混色；处理后再看图。图注不能扩展成热效率、齿数或制造精度证据。新图的第一次尝试因 C-E 多铰链已淘汰；只采用 manifest 指向的最终图。[se-022][D10]

## 8. 施工与验收清单

顺序：§4 两项引擎与 sample-steam 验收 → 主机程序化几何（公有领域参考先看）→ R2 两轮比例/全周期干涉 → R3 材质/双主题 → R4 相位与阀路 → 双语正文、来源、名词 → 36拍与四卡 → R9 数字/措辞/许可审计 → 发布。本次只交此规格，不写主题、代码、图片或 review-queue，不执行 git/安装；以下是**未来施工门槛，均未声称通过**。

- [ ] `pnpm check`、`pnpm validate`（0 error/0 warning）、`pnpm test`、`pnpm build`、**build 后** `pnpm e2e` 全绿；含 §4.5 真实数值、非法配置、恢复与无机制旧主题回归。
- [ ] `pnpm shoot steam-engine --locale all --theme all --beats --keys --layout`，sample-steam 同样检查；36/36 beat links、0键失败、0布局问题、console干净、无外部请求。实际看 EN/ZH × paper/cinema 所有拍图；unlabelled清单为空、chapter highlights 全在屏内（脚本仅打印的项目也不能忽略）。
- [ ] 再用 `--size 1600x900 --beats` 检查36拍；`--layout` 覆盖3840×2160、2560×1440、1920×1080、1600×900、1280×720、1024×768、900×1200、390×844及全页加载拍链接。44px点击、无hover依赖；手机抽屉节拍与全部索引可用。
- [ ] custom `--shots` 保存相位0/90/180/270/360、四阀、交叉杆、泵上行；e2e同时查API实际端点、阀芯位置、关路粒子零可见，不能只有截图或公式单测。
- [ ] 主机构全部刚杆闭合、齿轮中心距/齿相位正确；A/F固定、交叉处无铰链、planet与杆刚接、完整周期太阳净两圈。静态/全拆开无未解释穿模。三个 governor 姿态杆定长、两球数正确、叉环不旋转、阀开度方向正确。
- [ ] 蒸汽与冷水在正确位置相遇，混合排水/热井/部分回水/溢流都有接头；Newcomen的冷水直入缸与Watt模型分清；水/蒸汽粒子只标路径，非质量流量、温度或分子。
- [ ] R/X/C/F/E、hide、solo/isolate、pause、P、H组合逐一检查；E/R锁定流，退出回相位。减少动态静帧有效；mode manual/auto、冷压、相位与合法URL共享一致。不得新增空G或自动翻章。
- [ ] HUD遵守docs/08 §2：底部只有8段章节轴与各章拍刻度，`,`/`.`跨章，URL b；次级读数进PLATE；试一试与选中详情在正文上方；章内提到的56件中相应对象均能索引选到。背景章14项、06章14项允许纵向滚动，不能省索引。
- [ ] 主全景不出现Newcomen和账本工位；背景00.2/07.3单独取景；hero-clean完整主体占宽65–80%，模型、阴影和管路均在画内；材料wood/steel/brass分明，cinema无死黑/炫光。
- [ ] `pnpm shoot steam-engine --perf --gpu --size 1920x1080` 记录硬件/renderer/buffer/pixelRatio、calls与tris；硬门槛<100calls、流增幅<10、≤1.5M tris、首屏JS≤300KB gzip，目标见§4.4。SwiftShader只记录架构计数，不当真GPU fps。静止demand-loop休眠，运行求解器零分配。
- [ ] 所有物理数字属于§1.2白名单；正文`<Num s>`、detail`[S#]`；表/卡/PLATE/字幕值相同。S1标design且自描述；无未验证温度、真实热效率、轴功率/耗煤/负载响应；无cut事实重新混入。
- [ ] 三张既有图导出后重新看；参考图来源与PD例外、NC-SA派生文件、SMG署名及改写说明已进SOURCES/THIRD-PARTY-NOTICES/LICENSE-CONTENT；没有BY-SA与NC-SA同文件混合、无受限媒体。
- [ ] 两种语言全部字段与16词名词表齐全，首次出现各自包Term；无占位文案/死链/TODO/console噪音；父主题仍draft时不渲染链接、不改其发布状态。
- [ ] 施工记录与实际差异、零件/拍数、性能、截图路径、剩余限制填本文件§9；合格后steam-engine直接published，社会史主题独立审阅门槛保持。

## 9. 引擎记录（施工后填写）
