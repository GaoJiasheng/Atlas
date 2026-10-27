# 瓦特蒸汽机：事实与模型审计 / Watt’s steam engine verification ledger

2026-10-27。施工依据为 [定稿规格](../../../../docs/52-steam-engine-content-spec.md)，以 §0.3 和 §9.1 优先；同时读取主 checkout 的 `art/research/steam-engine/facts-extra.json`（24 条补充事实）、`research.md`，父 dossier 的 `facts.json`（67 条）、`datasets.json` 及相关准备记录。原始 dossier 未改。旧准备稿中的 46 件、21 来源槽位、三项引擎计划不覆盖定稿的 56 件、16 来源与已落地的 sample-mechanism 引擎。

This production audit distinguishes the specification’s original-source review from checks repeated during construction. “Verified” below is the disposition assigned by spec §0.3, not a claim that this construction session fetched every listed source again. No quoted passage is reproduced (0 quoted words). Historical facts are paraphrased; generated geometry, imposed inputs and calculated readings remain DESIGN / SIM.

## 本轮独立复核 / Independently repeated in construction

- [SMG Lap catalogue](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788): read the description, details and rights. Confirmed 1788, object 1861-46, metal-polishing use and double action. Catalogue metadata, prose and image rights remain distinct. No museum image is shipped. The catalogue’s priority and fuel-saving superlatives are not adopted.
- [Ferguson](https://www.gutenberg.org/files/27106/27106-h/27106-h.htm): read fig.7e and adjacent text (the built arrangement uses the centre link; equal gears yield two flywheel turns per piston cycle), plus fig.10 and its fixed A/F caption. Compared the saved fig.10 with the approved final parallel-motion illustration: two separate supports, one output rod and no joint at the crossing. This confirms topology, not manufactured dimensions.
- [Lardner](https://www.gutenberg.org/files/55428/55428-h/55428-h.htm): read the jet inlet and separate-vessel explanation in §49, rigid push/pull linkage explanation, and the paired inlet/exhaust explanation in §60. Modern model force and energy language is an independent reformulation; outdated thermodynamics, social hierarchy and perfect-speed rhetoric are excluded.
- [NASA pressure](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/air-pressure/): read pressure as force per area and the normal surface force. Opposing faces, rod area and exposed-rod atmosphere are this study’s explicit force analysis.
- [NOAA condensation](https://www.noaa.gov/jetstream/atmosphere/hydro): read vapour-to-liquid change and released heat. No machine temperature, boiling-point extension or weather illustration is used.
- [NASA conservation of energy](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/conservation-of-energy/): read ΔE=Q−W. Setting cycle ΔE=0 to obtain Qh=W+Qc is the study’s inference for the working-fluid boundary. The arbitrary ledger shares are not Lap efficiency or a whole-fuel account.
- Recomputed SHA-256 and byte counts of all three approved PNGs and both saved public-domain reference JPEGs; the cover and condenser PNGs match their saved parent-art-snapshot bytes. PNG hashes match spec §7. This session did not regenerate or replace the approved art.
- Production unit tests independently recalculate all nine pressure rows, three governor equilibria and three ledger rows, and inspect actual pose offsets/rotations and production mechanism geometry. Browser tests read drawn endpoint/matrix data, gates and visible copies; their existence is not a browser pass.

ASME, Birmingham, Hulse, the three historical Newcomen/Watt milestone pages and NIST conversions retain the checked scope documented in the final specification. They were not freshly fetched by this audit subtask. No new precision or explanation for historical bore/tooth discrepancies is inferred. The blocked Mayr/MOE pages and all cut parent social-history claims were not retried or adopted.

## 全部事实处置 / Complete fact disposition

以下逐项保留定稿 §0.3 的最终处置与采用边界，共 **54 个唯一 fact id：verified 20、changed 10、cut 24**。来源列是定稿核查的原始依据；本轮重复复核的子集见上。`cut` 表示本主题不采用，并不判定该事实为假。父 dossier 的其他条目未引入，不扩张本页事实范围。

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
| `se-016` | verified | 本 worktree 两主题为 published，四个目标 chapter id 存在；父主题尚未落地，不能输出死链。 | [原始依据](../energy-conversion/topic.yaml) |
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


## 数值、内容与许可边界 / Model and content boundaries

`tests/steam-engine-content.test.ts` reads the production `parts.json` and chapter frontmatter rather than the sample fixture. It checks 56 selectable parts plus four context objects, eight chapters / 36 bilingual captions, the two full 14-entry indexes, every labelled part’s index entry, all four prediction/record cards, the 15 complete sourced table rows, seven controls, 16 sources and 16 terms. Numeric captions are compared with the same resolved model outputs the stage uses. Its production-geometry sweep checks stroke, lateral wander, radial clearance, rigid residual and gear phase over 32,768 samples. The actual governor pose test verifies four half-metre links and the 1.1 m / 0.4 m throttle members at all three equilibria. The actual throttle disc face normal is transformed through its rest and pose rotations and compared with the fixed Y-axis steam passage; increasing rpm closes the model opening and increases its projected obstruction. This catches the old fixture’s inappropriate Rx90 disc orientation. Supply/outlet paths meet the body at y2.1/1.9. The four Newcomen poses additionally keep the piston and pump rigid, the jet fixed, and each flexible chain joined to its rod top and fixed arc tangent.

Pressure inputs are 110 kPa abs hot, 20/50/80 kPa abs cold and 101.325 kPa abs atmosphere; forces include the upper-face rod area and the atmosphere acting on its exposed end. At cold20/rate10 the expected values are Fd=16.0216400043 kN, Fu=15.9303453218 kN, indicated cycle work=38.9558605096 kJ and model indicated power=6.4926434183 kW. The open-cylinder comparison is separately 14.4871824859 kN. No friction, inertia, cutoff, leakage, pump work or shaft power is computed.

Governor rpm60/90/120 selects three duration-zero complete poses; no main-shaft drive ratio, transient regulation or changing-load response is calculated. Ledger100=10+90=20+80=30+70 counts heat delivered to the working fluid, never fuel input or measured machine efficiency. Main motion is prescribed phase, not pressure-integrated acceleration. Exact-unit conversion does not increase the precision of historical dimensions.

中文“汽缸、平行运动机构、太阳与行星齿轮机构、热井、滑套、叉环、纽科门”为本题编辑用语；没有声称获得 MOE 或新加坡专门术语表核定。没有 P4 页码或 PSLE 必考承诺。社会史只保留中性阅读说明；父主题尚未落地时不输出运行时链接，计划锚记录在 REVIEW.md。

The approved images are exported as 800/1600 px WebP variants, plus two additional 1200×900 figure files for the existing prose Figure component. This is an image-pipeline adaptation, not regenerated artwork. S1 and S14 keep complete self-describing local-source text without a URL because the source schema accepts only HTTP(S); data/SOURCES.md carries the repository evidence.

The topic’s derived content stays in the CC BY-NC-SA 4.0 family; the two nineteenth-century reference originals retain their own public-domain status. SMG descriptive text is independently adapted with attribution; catalogue and photo licences are not conflated. ASME, Hulse and Birmingham are factual references, not copied assets. No CC BY-SA material or parent geodata is introduced. Per-file registration belongs to data/SOURCES.md, LICENSE-CONTENT and THIRD-PARTY-NOTICES.md.

## 尚未验收 / Browser work still outstanding

The user brief explicitly prohibits running browser gates in this sandbox and using the user’s browser as a workaround. This construction subtask did not launch Playwright or computer use. `tests-e2e/steam-engine.spec.ts` is prepared for build followed by `CI=1 ATLAS_E2E_PORT=5421 pnpm e2e`; it adapts the already implemented `__atlas` API from sample-mechanism and adds production chapter/card/index coverage. The suite checks drawn rigid members, actual valve-core offsets, closed-path visibility at numerical deadpoints, legal deep links, phase holds, auto freeze/recovery, static governor anchors and energy copy counts.

`pnpm exec vitest run tests/steam-engine-content.test.ts` passed **20/20** tests (one file, 2026-10-27). `pnpm exec playwright test tests-e2e/steam-engine.spec.ts --list` successfully enumerated **11** cases without launching a browser; listing is syntax/discovery evidence only, not execution.

No production screenshot, EN/ZH × paper/cinema visual gate, phone-width layout pass, draw-call/triangle budget, GPU frame rate or first-load JS budget is claimed here. Keep the topic draft until the specification’s outstanding production gates are performed. The fixture’s earlier browser results in spec §9.1 are engine evidence only; they do not constitute production-topic acceptance. Main-session command results and remaining review work are recorded in REVIEW.md.
