# 51 · 工业革命：煤、机器与相连的世界 · 内容施工 spec（v1）

**TimeScene / GeoStage；规格定稿于 2026-10-27，产品保持 `status: draft`。** paper 默认、cinema 可切，英文默认、简体中文独立成文。依 `docs/next-batch.md` §一，历史主题须经 Gavin 阅读后才上线，不进 published 索引。本轮只写本规格，未施工或运行产品关卡。研究输入只读自 `/Users/gavin/work/atlas/art/research/industrial-revolution/`（父研究为 `industrial-revolution-research.md`），图只读自 `/Users/gavin/work/atlas/art/planned/industrial-revolution/`；下文 `data/` 输入路径均相对此研究目录。

slug / parent：`industrial-revolution`；姊妹主题：`steam-engine`。title = `{ en: The Industrial Revolution, zh: 工业革命 }`；subtitle = `{ en: Britain and an unevenly connected world, c.1760–1914, zh: 英国与不均衡地相连的世界，约 1760—1914 年 }`。时段是本题观察范围，不是全球同步转型的起止年。[ir-001]

## 0. 决策、审读与事实复核

### 0.1 代定项（给 Gavin 审阅）

| # | 本版默认决定 |
|---|---|
| 1 | 背景 + 7 章、37 拍；英国起点，全球案例至 1914；不作工业化国家排名。不再比较 1840/1850 分期端年。 |
| 2 | 世界自然底图、现代城市参照、GB 含煤地层、有年份的大陆铁路。无殖民版图、历史国界、矿区/园区面、无凭据航线/渠线/电缆线；SG 镜头 zoom 6，不冒充历史港口岸线。 |
| 3 | 零实体、零 movements，1760/1914 两个空 control 帧。axis/allied/neutral 不映射任何国家；备用 blocLabels 使用比较组甲/乙/参照，不引入阵营叙事。 |
| 4 | RShapes 派生文件单独 CC BY-NC-SA 4.0；BGS OGL、地点 PD/CC BY 分别保留来源权利。不得与 CC BY-SA 共享派生文件/拓扑。 |
| 5 | 奴役、童工、殖民劳动约束与污染照实写；全国被奴役人口只在 1860 年视图出现，不作伤亡计数或受虐插画。 |
| 6 | 删八根纱、八/九小时摘要争议、橡胶苗 22/11 比较及贸易金额；煤烟损寿数改定性。02.2 用 1793 年斯莱特厂房/童工替换未直接核到的卢德个案；工会例留在 06。 |
| 7 | 纺纱机时间轴用 1770 专利，不选争议发明年；商业蒸汽机用 1776 已运行，删 1775 对照；06.1 从 1900 年回顾俄国外资，删未直接核到的维特任期。 |
| 8 | 暂未获新加坡来源核定的译名：波塔基特、圣艾蒂安、梅赫伦、博里本德、塔纳、皇村铁路、康加尼、去工业化、汽缸、分离式冷凝器、经纱/纬纱、古塔胶。首次带英文；全文统一“古塔胶”，不轮用别名。史家可保留拉丁字母姓名。 |
| 9 | 不标年级/必考，不引未复核课纲或学生误解比例；无测验、配音文件、视频及国家进步模拟；用现有演示与本地系统语音。 |
| 10 | 只用 §7 三张既有图；Rocket 为早期形态解释性复原，不承诺尺寸/1829 每个细节精确。机制细节转 steam-engine，不在地图新增 sim 或跨引擎宿主。 |
| 11 | §4 保留两项真实缺口：事件索引/上方详情，以及阅读节拍行/共享 b URL 适配；复用共享 slots、beat helper、codec、test API。 |
| 12 | 章节起点递增；02 展至 1860，03 明确回到 1830；专题重叠不修改史实日期。每次点章停第一拍、不自动播放。 |

### 0.2 敏感中文审读位置

| 位置 | 必须保留及核对 |
|---|---|
| 02 正文 2–4 段、细看“全国人数的分母” | 奴役的强制与财产地位、原棉与制造的联系；1860 美国全国人数，非棉田人口/死者。[ir-051, ir2-008] |
| 02“法律与执行” | 危险机器、长工时、罚款/体罚，1833 法案范围与 1836 违规证据，不写法案解决了童工。[ir-038, ir-040, ir-064] |
| 05/06 末段 | 契约、招工、债务、自由迁移的区别，不用印度制度替代全部华工经验。[ir-063, ir2-012] |
| 06 煤烟段 | 历史研究的死亡风险联系，非人人固定损寿，不造工业革命死亡总数。[ir-046] |
| 07 史家细看 | 机制、年代与权重有争议，不以此否认奴役；每个解释逐名归属。[ir-047, ir-048, ir-049, ir-050, ir-051, ir-052, ir-053] |

### 0.3 事实复核台账（2026-10-27）

父 facts 67 + 增量 12 = **79 个唯一事实：verified 57、changed 9、cut 13**。原件无字面 ⚑，本轮把全部 medium 项视作风险标记，并核对所有拟展示数值/日期与敏感项。verified 为本轮直接源文或原始数据复核；changed 为下列收窄写法；cut 从面向读者内容删除，不留待核断言。下表英语保留原事实措辞便于施工核对，中文修订列为最终授权边界。工程规模/坐标/预算不是孩子历史数量。源文无法读取时明确标失败，不以父轮读取状态充数。无新增引语。

| fact id | 结论 | 核查后允许的断言 / 删除理由 | 来源 |
|---|---|---|---|
| `ir-001` | changed | 以英国生产变化为起点；约 1760—1914 只是本题选定范围。删 1840/1850 分期比较。 | [S3](https://www.britishlibrary.cn/zh-cn/articles/industrial-revolution/) |
| `ir-002` | verified | Before mechanisation, textile production included household spinning, weaving and dyeing, with regional specialisation. | [S3](https://www.britishlibrary.cn/zh-cn/articles/industrial-revolution/) |
| `ir-003` | verified | Factories could run on water power; Slater’s early US cotton machinery was water-powered. | [S20](https://home.nps.gov/blrv/learn/historyculture/slatermill.htm) |
| `ir-004` | cut | 删 1733 飞梭首创年/速度比较；旧 Smithsonian 地址失效，新页仅索引可读。功能改由 ir-008 支撑。 | [S15](https://www.si.edu/object/shuttle-and-bobbin%3Anmah_640517) |
| `ir-005` | changed | 只保留 1770 专利年，采用直接可读 SMG 目录。不展示争议发明年份。 | [S13](https://collection.sciencemuseumgroup.org.uk/objects/co44544) |
| `ir-006` | cut | 删八根纱数量；TNA 原网页 403，未把索引摘要当源文复核。 | [S11](https://www.nationalarchives.gov.uk/education/resources/significant-people-collection/james-hargreaves/) |
| `ir-007` | verified | Arkwright’s water frame and Crompton’s mule (c.1779) were distinct spinning technologies; older and newer machines coexisted. | [S14](https://onlinelibrary.wiley.com/doi/full/10.1111/ehr.13082) |
| `ir-008` | verified | A shuttle carries the weft yarn across the warp yarns; its bobbin stores the filling yarn. | [S75](https://www.nps.gov/articles/000/glossary-of-weaving-terms.htm) |
| `ir-009` | verified | Newcomen’s practical mine-pumping engine was erected near Dudley in 1712. | [S4](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) |
| `ir-010` | verified | In a Newcomen engine, condensing steam lowers cylinder pressure; atmospheric pressure drives the piston down. | [S4](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) |
| `ir-011` | verified | Watt developed a working separate-condenser model by 1765. | [S6](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) |
| `ir-012` | verified | Watt’s separate-condenser patent was granted on 5 January 1769. | [S7](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) |
| `ir-013` | verified | The separate condenser allows the working cylinder to remain hot while steam condenses in a separate cold vessel. | [S7](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) |
| `ir-014` | changed | 只保留 1776 年商业机器已运行；删 1775 出售对照。 | [S6](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) |
| `ir-015` | verified | The 1788 Lap engine used a centrifugal governor and drove metal-polishing machinery. | [S9](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788) |
| `ir-016` | cut | Whitbread 改装年表移交姊妹机械主题，本题不展示。 | [S10](https://www.asme.org/about-asme/engineering-history/landmarks/111-boulton-watt-rotative-steam-engine) |
| `ir-017` | verified | The Stockton and Darlington Railway opened in 1825; the Liverpool and Manchester Railway opened in 1830 with steam-hauled passenger and freight services. | [S76](https://historicengland.org.uk/whats-new/research/early-railways-in-england/)、[S77](https://blog.scienceandindustrymuseum.org.uk/seg-if-these-walls-could-talk/) |
| `ir-018` | verified | France’s 1827 Saint-Étienne coal railway used horse-drawn wagons. | [S17](https://www.groupe-sncf.com/en/group/history-archives/two-centuries-railway-history) |
| `ir-019` | verified | The Brussels–Mechelen line opened on 5 May 1835; Belgium-built Le Belge followed that December. | [S18](https://trainworld.be/en/collections/history-of-the-belgian-railways/2-belgium-on-track-19th-century/) |
| `ir-020` | verified | The Nuremberg–Fürth railway opened in 1835 in the German states. | [S19](https://dbmuseum.de/en/nuremberg/exhibitions/the-history-of-the-railway-in-germany) |
| `ir-021` | verified | Slater got cotton-spinning machinery running in Pawtucket in December 1790; the surviving Slater Mill building dates to 1793. | [S20](https://home.nps.gov/blrv/learn/historyculture/slatermill.htm) |
| `ir-022` | verified | Russia’s first public Tsarskoye Selo railway officially opened on 30 October 1837 Old Style / 11 November New Style. | [S21](https://cmzt.ru/events/news-events/otkrytie-czarskoselskoj-zheleznoj-do/) |
| `ir-023` | verified | India’s Bori Bunder–Thane passenger train began on 16 April 1853 over 34 km. | [S22](https://artsandculture.google.com/story/cAVh7RwiKiTtKg) |
| `ir-024` | verified | Japan’s Shimbashi–Yokohama railway opened in Meiji 5 (1872). | [S78](https://www.ndl.go.jp/en/imagebank/theme/tetsudoukiyoe) |
| `ir-025` | verified | UNESCO describes Japanese industrial transformation across the 1850s–1910, including imported expertise and later adaptation by Japanese engineers. | [S24](https://whc.unesco.org/en/decisions/6364) |
| `ir-026` | verified | The Jiangnan Arsenal was established in Shanghai in 1865 and made weapons, machinery and ships while supporting technical translation. | [S25](https://www.chnmuseum.cn/zp/zpml/gmww/202104/t20210406_249554.shtml) |
| `ir-027` | changed | 改引公开研究论文，只写 1881 年唐山—胥各庄铁路建设，不补精确开通日。 | [S79](https://www.dlyj.ac.cn/EN/abstract/article/1000-0585/14696) |
| `ir-028` | verified | Cooke and Wheatstone patented and tested an electric telegraph in 1837; railway signalling and personal communication were distinct proposed uses. | [S27](https://journal.sciencemuseum.ac.uk/article/cooke-and-wheatstones/) |
| `ir-029` | verified | The Suez Canal opened on 17 November 1869, linking the Mediterranean and Red seas. | [S28](https://www.nlb.gov.sg/main/article-detail?cmsuuid=15fcae20-2e3d-4eec-b5ab-2384f1aac2b9) |
| `ir-030` | verified | NLB reports 99 steamers and 65 sailing vessels at New Harbour wharves in 1869, and 541 steamers and 91 sailing vessels in 1879. | [S28](https://www.nlb.gov.sg/main/article-detail?cmsuuid=15fcae20-2e3d-4eec-b5ab-2384f1aac2b9) |
| `ir-031` | cut | NLB 金额已读到，但币制/价格口径未校准；本题删金额与增长图。 | [S28](https://www.nlb.gov.sg/main/article-detail?cmsuuid=15fcae20-2e3d-4eec-b5ab-2384f1aac2b9) |
| `ir-032` | verified | Steam shipping and deeper berths helped shift port activity toward New Harbour near Tanjong Pagar. | [S28](https://www.nlb.gov.sg/main/article-detail?cmsuuid=15fcae20-2e3d-4eec-b5ab-2384f1aac2b9) |
| `ir-033` | verified | The Madras–Singapore telegraph cable was completed on 31 December 1870; service was advertised on 6 January 1871. | [S29](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue2-jul-2007-tapping-history/) |
| `ir-034` | verified | Gutta-percha from the region was used to insulate submarine telegraph cables. | [S29](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue2-jul-2007-tapping-history/) |
| `ir-035` | verified | Rubber seedlings reached Singapore in 1877; Ridley became Botanic Gardens director in 1888. | [S30](https://www.nparks.gov.sg/sbg/research/publications/-/media/sbg/gardenwise/2005-jul-gardenwise-vol-25.ashx) |
| `ir-036` | cut | 删 22/11 株比较；NParks 同刊也分别记 eleven planted 与 22 sent，属不同动作/分母；NUS 当前正文未显示原说法。本版不展开这组数量，不制造矛盾或拼合分母。 | [S30](https://www.nparks.gov.sg/sbg/research/publications/-/media/sbg/gardenwise/2005-jul-gardenwise-vol-25.ashx) |
| `ir-037` | verified | Straits Trading was founded in 1887 and built its Pulau Brani tin smelter in 1890. | [S32](https://biblioasia.nlb.gov.sg/chapters-of-asia/chapters-on-asia-2015-on-the-waterfront-the-building-of-singapore-s-first-high-rise-skyline-1918-1928/) |
| `ir-038` | verified | The 1833 Factory Act restricted child work in covered textile mills; it did not end all child labour. | [S34](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/)、[S80](https://cdn.nationalarchives.gov.uk/documents/education/factory-actdoc.pdf) |
| `ir-039` | cut | 删八/九小时摘要对照；不把二手摘要冲突留给施工者选。 | [S34](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/)、[S80](https://cdn.nationalarchives.gov.uk/documents/education/factory-actdoc.pdf) |
| `ir-040` | verified | The 1833 law provided two hours of schooling and four factory inspectors; enforcement remained weak. | [S34](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/) |
| `ir-041` | verified | The 1844 factory legislation required dangerous machinery to be guarded and limited child hours; Parliament gives six and a half hours/day. | [S35](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/) |
| `ir-042` | verified | The 1847 Factory Act limited hours for women and young people in textile factories; further laws addressed evasions. | [S35](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/) |
| `ir-043` | cut | TNA 直接网页 403；删卢德个案，02.2 改 1793 斯莱特厂房/童工，06 保留工会。 | [S36](https://www.nationalarchives.gov.uk/explore-the-collection/stories/the-proclamation-of-ned-ludd/) |
| `ir-044` | verified | The TUC describes the 1871 Trade Union Act as legalising unions’ status and protecting their funds. | [S37](https://www.tuc.org.uk/research-analysis/reports/section-tucs-first-victories) |
| `ir-045` | verified | The Public Health Acts of 1848 and 1875 developed state and local responsibility for sanitation and water infrastructure. | [S38](https://www.parliament.uk/about/living-heritage/transformingsociety/towncountry/towns/keydates/) |
| `ir-046` | changed | Hanlon 2015 论文联系工业煤烟与死亡风险；摘要/导言 0.57/0.56 不一致，删寿命数字。 | [S81](https://www.anderson.ucla.edu/sites/default/files/documents/areas/ctr/ziman/2015-18WP.pdf) |
| `ir-047` | verified | Allen argues that high wages relative to cheap energy encouraged labour-saving, coal-using inventions in Britain. | [S40](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-0289.2010.00532.x) |
| `ir-048` | verified | Mokyr emphasises Enlightenment culture, useful knowledge and the circulation of ideas in explaining sustained innovation. | [S41](https://www.jstor.org/stable/jj.40336711) |
| `ir-049` | verified | Pomeranz emphasises accessible coal and land-intensive resources from the Americas in explaining divergence between advanced Eurasian regions. | [S42](https://www.jstor.org/stable/j.ctt7sv80) |
| `ir-050` | verified | Williams argued in 1944 that slavery and slave-trade wealth helped finance British industrial development. | [S43](https://uncpress.org/9781469663678/capitalism-and-slavery-third-edition/) |
| `ir-051` | verified | Beckert links mechanised cotton manufacture to slave-grown American cotton and the reorganisation of global supplies during the US Civil War. | [S44](https://www.wcfia.harvard.edu/publications/empire-cotton-0) |
| `ir-052` | verified | Burnard and Riello argue for multiple causes and greater attention to consumption and chronology, including sugar before large US cotton exports. | [S45](https://www.cambridge.org/core/journals/journal-of-global-history/article/slavery-and-the-new-history-of-capitalism/6885E5697E7151B50FDEFC65ED96C79E) |
| `ir-053` | verified | Olmstead and Rhode challenge evidence and mechanisms in parts of the new history of capitalism’s account of cotton and slavery. | [S46](https://ideas.repec.org/a/eee/exehis/v67y2018icp1-17.html) |
| `ir-054` | changed | 改为据 Gupta/Roy 对 Clingingsmith/Williamson 的讨论：政治、生态危机及国际价格变化。未直接读到 NBER 原文。 | [S49](https://academic.oup.com/book/7358/chapter/152152209) |
| `ir-055` | changed | 改由 Gupta/Roy 支撑手纺、织布及其他手工业的不同变化；不单独引受阻 Roy 章节。 | [S49](https://academic.oup.com/book/7358/chapter/152152209) |
| `ir-056` | verified | Gupta and Roy describe both nineteenth-century artisanal decline and the rise of modern Indian cotton, jute and tea industries. | [S49](https://academic.oup.com/book/7358/chapter/152152209) |
| `ir-057` | verified | Allen’s 'Engels’ pause' account has wages lagging productivity in early nineteenth-century Britain, with a different pattern later. | [S50](https://ideas.repec.org/a/eee/exehis/v46y2009i4p418-435.html) |
| `ir-058` | cut | 删教育研究/课纲旁论和引语；不标年级/必考，不把海外研究推成新加坡学生比例。 | [S51](https://journals.sagepub.com/doi/10.3102/00028312038004881) |
| `ir-059` | cut | 删教育研究/课纲旁论和引语；不标年级/必考，不把海外研究推成新加坡学生比例。 | [S52](https://files.eric.ed.gov/fulltext/ED426042.pdf) |
| `ir-060` | cut | 删教育研究/课纲旁论和引语；不标年级/必考，不把海外研究推成新加坡学生比例。 | [S53](https://onlinelibrary.wiley.com/doi/10.1002/tea.3660200905) |
| `ir-061` | cut | 删教育研究/课纲旁论和引语；不标年级/必考，不把海外研究推成新加坡学生比例。 | [S54](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx) |
| `ir-062` | cut | 删教育研究/课纲旁论和引语；不标年级/必考，不把海外研究推成新加坡学生比例。 | [S55](https://file.go.gov.sg/2020ssp.pdf) |
| `ir-063` | verified | Indian labour migration to Malaya and Singapore included indenture, kangany recruitment and free migration. | [S59](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue3-oct-2007-indian-migration-british-malaya-singapore/) |
| `ir-064` | verified | The National Archives’ factory sources describe dangerous machinery, long hours, fines and physical punishment; 1836 reports show breaches after the 1833 law. | [S80](https://cdn.nationalarchives.gov.uk/documents/education/factory-actdoc.pdf) |
| `ir-065` | verified | Jeff Horn argues that French industrialisation followed a distinctive policy path rather than being simply a failed imitation of Britain. | [S60](https://academic.oup.com/mit-press-scholarship-online/book/14881) |
| `ir-066` | changed | 收窄至 Tilly/Kopsidis 的区域起源、制度改革、铁路与重工业，限公开摘要。 | [S61](https://academic.oup.com/chicago-scholarship-online/book/37929) |
| `ir-067` | changed | 改为 Malik 对晚十九世纪至二十世纪初外国资本进入俄国的叙述；删维特任职年和具体政策归因。 | [S82](https://www.jstor.org/stable/j.ctv301gmn) |
| `ir2-001` | verified | 原文件与子集重新解析：20,661 / 18,804，最大年 1921 / 1914；网页至 1922 不改写原值。 | [S63](https://icr.ethz.ch/data/rshapes/) |
| `ir2-002` | verified | 公开产品页与 GB/NI GeoPackage 只读核对，CRS 27700/29900，integrity_check=ok；622/16 为 strata 要素数。未宣称已重投影。 | [S64](https://www.bgs.ac.uk/datasets/coal-resources-for-new-technologies/) |
| `ir2-003` | verified | Rocket was built by Robert Stephenson & Co. in 1829 with a 0-2-2 wheel arrangement and won the Rainhill locomotive trials. The preserved locomotive was substantially rebuilt and is incomplete. | [S65](https://collection.sciencemuseumgroup.org.uk/objects/co26704) |
| `ir2-004` | verified | The National Railway Museum warns that Wardale drawings made around three decades after 1829 included later additions and a different firebox appearance. | [S66](https://blog.railwaymuseum.org.uk/rocket-railtrack-and-a-history-of-design/) |
| `ir2-005` | verified | The reproduced Science Museum handbook describes Rocket as originally built with two rear cylinders inclined about 35 degrees, driving the front pair of wheels, and a smaller trailing pair. | [S67](https://tringlocalhistorymuseum.org.uk/morehistory/Railway/c12_locomotive_(II).htm) |
| `ir2-006` | verified | NE 原文件与 27 点子集重新解析；现代定位不证明历史设施位置。 | [S68](https://www.naturalearthdata.com/about/terms-of-use/) |
| `ir2-007` | verified | 断言不变，改用 Ingenium 直接源文支撑通断电路，不再依赖受阻 LOC。 | [S83](https://ingenium.ca/en/learn/teachers-zone/resources/telegraph-key/) |
| `ir2-008` | verified | Census 官方页直接核实 1860 全国 3,953,760；非棉田人口、非死者。 | [S70](https://www.census.gov/about/history/stories/monthly/2025/june-2025.html) |
| `ir2-009` | cut | Smithsonian 直接页 500；删国内奴隶贸易分句。新奥尔良棉港定位另有直接读到的 Beckert 文章 ir-051。 | [S71](https://americanhistory.si.edu/explore/exhibitions/on-the-water/online/inland-waterways/river-towns-networks/downriver-new-orleans/cotton) |
| `ir2-010` | verified | 六行 TSV 与 GeoNames WGS84/署名页核对，现代城市参照。 | [S72](https://download.geonames.org/export/dump/) |
| `ir2-011` | verified | 本地响应/审计核对 652 ways，无渠线返回；不推成 OHM 全局覆盖结论。 | [S73](https://overpass-api.openhistoricalmap.org/api/interpreter) |
| `ir2-012` | verified | NLB 全文的居住条件、招工滥用、债务延长；只作定性，不泛化全部移民。 | [S59](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue3-oct-2007-indian-migration-british-malaya-singapore/) |

### 0.4 核查后修订的优先级

§0.3 的收窄写法优先于父 dossier 和准备稿。未直接读到的数量/个案已删除或另找直接可读资料，不留 ⚑ 给孩子。旧研究的“NC 不可用/未下载”只是旧轮状态，现依 `docs/next-batch.md` §三与预取 `data/INVENTORY.md`。所有镜头、预算、显示 f 和测试阈值都是设计值，不是历史观测；未取得历史污染数值场，不做模型热图。

## 1. 立场、读者与必须讲对的事实

一般读者，含小学生与家长。每章 EN 200–300 词、ZH 350–500 字、3–5 段，再加 2–4 个双语 More。中文独立成文，所有可见标签双语；不用“我们/敌人”、民族性格解释或胜利叙事。英国为起点，法国、比利时、德意志诸邦、美国、俄国、印度、中国、日本、马来亚/新加坡以具体案例进入；一条铁路不等于全国现代化。[ir-017, ir-018, ir-019, ir-020, ir-021, ir-022, ir-023, ir-024, ir-025, ir-026, ir-027, ir-056, ir-063, ir-065, ir-066, ir-067]

必须讲对：纺纱做纱、织布交织经纬，水力工厂也是工厂；纽科门压力差与瓦特冷/热分离；模型、专利、商业运行不是同一里程碑；铁路建设、动力、营业状态不是同一字段；电报用电信号，古塔胶绝缘与橡胶种植分开。[ir-003, ir-005, ir-007, ir-008, ir-009, ir-010, ir-011, ir-012, ir-013, ir-014, ir-018, ir-028, ir-033, ir-034, ir-035, ir2-001]

童工、奴役和殖民劳动约束照来源说明；工人的法律地位与约束不同。产量、工资、健康、学校教育与自由不能合成一条进步曲线，也不归责于今天的儿童或族群。[ir-038, ir-040, ir-041, ir-042, ir-044, ir-045, ir-046, ir-051, ir-057, ir-063, ir-064, ir2-012]

| 史家问题 | 可写的归属与比较 | 章 |
|---|---|---|
| 发明的动力 | Allen：高工资相对廉价能源的激励；Mokyr：知识与启蒙文化。可以同时考虑，不排成两队。[ir-047, ir-048] | 07 |
| 全球差距 | Pomeranz：煤与美洲土地密集型资源；比较特定区域和资源约束，不概括全部欧亚居民。[ir-049] | 07 |
| 奴役与工业化 | Williams：财富/融资；Beckert：原棉供应体系；Burnard/Riello：年代、消费、糖与多因；Olmstead/Rhode：部分证据/机制的批评。联系与必然性分开。[ir-050, ir-051, ir-052, ir-053] | 02、07 |
| 印度的行业分化 | Gupta/Roy 并列手工业变化与新产业；涉及 Clingingsmith/Williamson 时注明“据 Gupta/Roy 的讨论”，不冒充直接读过受阻原文。[ir-054, ir-055, ir-056] | 06、07 |
| 福利与区域 | Allen 的工资/生产率；Horn 的法国道路；Tilly/Kopsidis 的区域改革；Malik 的俄国外资。不用路网密度代替福利。[ir-057, ir-065, ir-066, ir-067] | 03、06、07 |

数量白名单：1833 的四名监察员、两小时学校 [ir-040]；1860 全国约四百万/精确 3,953,760 [ir2-008]；新港 1869 的 99/65、1879 的 541/91 [ir-030]；印度线路 34 km 仅在 More 可用 [ir-023]。正文数量包 `<Num s>`，日期/章号/序数不包；事件数量附 sources。字幕为纯字符串，不塞 MDX；字幕数量必须在对应事件 sources 中登记。数据 QA 的 feature 数不能写成公里或使用率。

## 2. 章节与逐拍字幕（背景 + 7 章、37 拍）

### 2.1 章节总表与时间约定

正式章的 `state.time` = 第一拍 t，`camera/layers/highlight` 同第一拍；背景的章级 highlight 为空。§2 的镜头是初始设计值，施工截图后可调。每拍都有独立状态，不依赖上一拍残留。第 02 章含一段 1860 年回顾，下一章明确回到 1830 年铁路主线；第 06 章回顾较早法规，字幕用该拍 1900 年视角说明。这是 docs/10 允许的专题重叠，章序按起点递增，不给法律伪造新日期。

K1 = 1760、K2 = 1914，二者都是空 FeatureCollection，只给轴范围。任何拍 control 都关闭；`K1→K2` 的数值淡化没有可见版图，不能当成工业化进度。每拍实际资料组合由 M0–M4 定义（§3.2），不借 control 交叉淡化提前显示铁路。

| # | id | EN / ZH | state.time | 第一镜头 [lon,lat], zoom | 章级 highlight | 拍数 |
|---|---|---|---|---|---|---|
| 00 | `ir-background` | Before the changes / 变化开始之前 | `1760` | [70, 25], 0.3 | 空 | 4 |
| 01 | `ir-thread-coal-power` | Threads, coal and power / 纱线、煤与动力 | `1765` | [-2.6, 54.1], 4.5 | loc-glasgow, loc-dudley | 5 |
| 02 | `ir-work-cotton-coercion` | Factories, cotton and coercion / 工厂、棉花与强制劳动 | `1790` | [-71.5, 41.9], 5.8 | loc-pawtucket | 5 |
| 03 | `ir-railways-networks` | Railways, different beginnings / 铁路，不同的起点 | `1830` | [-2.6, 54.1], 4.5 | loc-liverpool, loc-manchester | 5 |
| 04 | `ir-seas-signals` | Seas and signals / 海路与电讯 | `1865` | [121.0, 31.2], 4.6 | loc-shanghai | 5 |
| 05 | `ir-asian-paths-materials` | Asian paths, tin and rubber / 亚洲的道路、锡与橡胶 | `1872` | [139.7, 35.5], 5.0 | loc-tokyo, loc-yokohama | 5 |
| 06 | `ir-growth-costs` | Growth and its costs / 增长与代价 | `1900` | [30.7, 59.3], 4.4 | loc-st-petersburg | 4 |
| 07 | `ir-connected-world-debates` | Connected world, debated history / 相连的世界，仍有争论的历史 | `1914` | [70, 25], 0.3 | loc-shanghai, loc-singapore-city, loc-mumbai | 4 |

**字段展开规则（设计契约）：** 下表镜头键 `britain` 表示 `camera: {center:[-2.6,54.1],zoom:4.5,pitch:0,bearing:0}`，其它键见 §3.6；layers `coal` = `[base, coal-strata, sites]`，`rail` = `[base, rail-rshapes, sites]`，`places` = `[base, sites]`，`base` = `[base]`。这些是本规格简写，输出 topic 时必须展开，不能把 `places/coal/rail` 当作内置 layer id。H 列的 id 都是静态“现代城市参照位置”site 事件，不是 datedLayer 要素 id。每拍最多 3 个高亮，引线必须逐个验收。全球预设改为 [70,25]/0.3、大西洋为 [-46,43]/1.0，是为手机同时框住所需城市的设计值；不改变历史资料。

### 00 `ir-background` · Before the changes / 变化开始之前

**摘要 / summary**：EN: Britain is the starting case, not a clock for every society. The map follows places and evidence, not a race between countries. ZH：英国是本主题的起点，不是衡量所有社会的同一只钟。地图串起地点与证据，不给各国排先后名次。[ir-001, ir-002, ir-003]

**正文段落顺序**：①家庭纺织与已有技能；②工厂也能用水力；③年代表、现代地理底图和资料空白的读法。[ir-001, ir-002, ir-003, ir2-006]

**细看 / More**：①本题的观察时段不是全球同步转型年；②煤层、煤矿、煤产量为什么不是一回事；③地图上的今天城市点不等于历史厂址。[ir-001, ir2-002, ir2-006]

**本章索引城市**：loc-manchester、loc-nottingham；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：无跨主题跳转；先给整题读法。

**阅读说明 / state.note **：

EN: We begin with Britain, then compare connected histories elsewhere. Dates describe particular events, not a single worldwide start. Coal shading is a modern geological reference; city points are modern location references. Railway gaps are gaps in these data. Slavery, child labour, colonial labour constraints and pollution are described with sources.

ZH：本题从英国讲起，再比较世界各地相连的历史。日期对应具体事件，不表示全世界同时开始。煤层阴影是现代地质参照，城市点只帮助定位。铁路资料空白不代表当地没有技能或贸易。奴役、童工、殖民劳动约束与污染都按来源照实说明。[ir-001, ir-002, ir-038, ir-046, ir-051, ir-063, ir2-001, ir2-002, ir2-006]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 00.1 | `1760` · `view-global` · `base` · 无 | 1760: this map begins with Britain, then follows connections across the world. These dates do not mark a worldwide switch to industry. | 1760 年：这张地图从英国出发，再沿着联系走向世界。这不是全世界同时进入工业时代的年份。 | ir-001 |
| 00.2 | `1760` · `view-britain` · `coal` · loc-manchester | 1760: the shaded British areas show coal-bearing rocks mapped by modern geologists, not mines known to be working in this year. | 1760 年：英国的淡色区域是现代地质调查绘出的含煤地层，不代表这一年正在开采的煤矿。 | ir2-002 |
| 00.3 | `1760` · `view-britain` · `places` · loc-manchester, loc-nottingham | 1760: the city markers locate regions of textile work. People already spun yarn and wove cloth in homes and workshops. | 1760 年：城市点帮助定位纺织劳动的地区。人们早已在家庭和作坊中纺纱、织布。 | ir-002, ir-008 |
| 00.4 | `1760` · `view-global` · `base` · 无 | 1760: empty space in a railway dataset means that evidence is absent here. It does not mean that people, skills or trade were absent. | 1760 年：铁路数据中的空白，只说明这里没有显示相应证据，不说明这里没有人、技术或贸易。 | ir-001, ir-002, ir2-001 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 01 `ir-thread-coal-power` · Threads, coal and power / 纱线、煤与动力

**摘要 / summary**：EN: Spinning makes yarn; weaving crosses yarns into cloth. Condensation and pressure moved early engine pistons, while Watt separated the cold condenser from the hot working cylinder. ZH：纺纱做出纱线，织布把纱线交织成布。早期蒸汽机借冷凝与压力差移动活塞；瓦特把冷凝器与热汽缸分开。[ir-008, ir-010, ir-013]

**正文段落顺序**：①梭子、珍妮纺纱机、水力纺纱机、骡机分清，不把一张梭子图当作纺纱机；②1712、1765、1769、1776 分别是抽水机、模型、专利、商业使用；③1788 年 Lap 机的调速器是机制旁链，不能让英国全境在该年同时上蒸汽。[ir-005, ir-007, ir-008, ir-009, ir-011, ir-012, ir-014, ir-015]

**细看 / More**：①1770 专利不是所有机型共同的发明年；②模型、专利和 1776 商业运行的区别；③配梭子图说明经纱、纬纱和一个纱管；④机械细节链到 steam-engine，不在地图旁造 3D 小部件。[ir-005, ir-008, ir-014]

**本章索引城市**：loc-glasgow、loc-dudley、loc-nottingham、loc-manchester、loc-birmingham；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：本章 More「冷凝为何有用」→ steam-engine 的冷凝章；「转得太快怎么办」→ 其调速章。对方尚无已审 chapter id，默认 TopicLink 只用 slug，不编造 ch；实施时再核对。[ir-010, ir-013, ir-015]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 01.1 | `1765` · `view-britain` · `coal` · loc-glasgow, loc-dudley | 1765: Glasgow and Dudley locate two different stages in steam history: Watt's condenser model and the earlier Newcomen pumping engine near Dudley. | 1765 年：格拉斯哥与达德利标出蒸汽动力史的不同环节：瓦特的冷凝器模型，以及此前在达德利附近工作的纽科门抽水机。 | ir-009, ir-011 |
| 01.2 | `1769` · `view-britain` · `places` · loc-glasgow | 1769: the Glasgow marker opens the condenser story. Watt's patent separated condensation from the hot working cylinder. | 1769 年：点格拉斯哥可读冷凝器的故事。瓦特的专利把冷凝过程与需要保持热的工作汽缸分开。 | ir-012, ir-013 |
| 01.3 | `1770` · `view-britain` · `places` · loc-nottingham, loc-manchester | 1770: Nottingham and Manchester locate the textile story. The jenny spun yarn; the shuttle in the figure carried weft during weaving. | 1770 年：诺丁汉与曼彻斯特帮助定位纺织的故事。珍妮纺纱机纺出纱线；插图中的梭子在织布时携带纬纱。 | ir-005, ir-008 |
| 01.4 | `1776` · `view-britain` · `coal` · loc-birmingham | 1776: Birmingham anchors the Boulton and Watt story. Commercial engines were operating by this milestone; the patent was an earlier step. | 1776 年：伯明翰帮助定位博尔顿与瓦特的故事。商业用蒸汽机已在这一阶段运转，取得专利则是此前的环节。 | ir-014 |
| 01.5 | `1788` · `view-britain` · `coal` · loc-birmingham, loc-manchester | 1788: Birmingham's engine-making and Manchester's textiles are distinct parts of the map. Different machines and power sources coexisted. | 1788 年：伯明翰的机器制造与曼彻斯特的纺织业是地图上的不同环节。不同机器和动力来源长期并存。 | ir-007, ir-015 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 02 `ir-work-cotton-coercion` · Factories, cotton and coercion / 工厂、棉花与强制劳动

**摘要 / summary**：EN: Mills connected machinery, workers and raw materials. Slave-grown cotton entered an economy of mechanised manufacture; children in textile mills faced dangerous machines and long working days. ZH：工厂把机器、工人与原料联系起来。奴隶劳动种出的棉花进入机械化制造体系；纺织厂里的童工面对危险机器与长工时。[ir-051, ir-064]

**正文段落顺序**：①1790 年波塔基特：水力机器，与 1793 年现存厂房的年代分开；②1793 年厂房、受雇童工与雇主控制；③新奥尔良、利物浦、曼彻斯特只作棉业区域锚点，不画无凭据货船航迹；④1833 年法案范围、学校和执行困难；⑤1860 年全国被奴役人口只在 1860 拍出现，明确不是棉田工人总数或死亡数。[ir-003, ir-021, ir-038, ir-040, ir-051, ir-064, ir2-008]

**细看 / More**：①1833 法案不是童工结束；②学校/监察员条款与实际执行分开，不列有争议的每日小时数；③约四百万是美国 1860 年普查，全国精确数 3,953,760，不拿奴役人数作 casualties；④Williams、Beckert 的解释在第 07 章再比较，不用因果争论淡化奴役事实。[ir-038, ir-040, ir-050, ir-051, ir2-008]

**本章索引城市**：loc-pawtucket、loc-new-orleans、loc-liverpool、loc-manchester；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：机械问题可回链第 01 章；本章不把童工与奴役降成机器模型的脚注。

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 02.1 | `1790` · `view-new-england` · `places` · loc-pawtucket | 1790: Pawtucket marks Slater's cotton-spinning machinery. Water powered this early factory system; a factory did not have to use steam. | 1790 年：波塔基特点出斯莱特的棉纺机器。这种早期工厂使用水力；工厂不一定使用蒸汽动力。 | ir-003, ir-021 |
| 02.2 | `1793` · `view-new-england` · `places` · loc-pawtucket | 1793: Pawtucket marks the surviving Slater Mill building. Children worked in this factory system, earning wages while facing employers’ control. | 1793 年：波塔基特点出今天保留的斯莱特厂房。这套工厂制度雇用儿童；他们领取工资，也受雇主控制。 | ir-021 |
| 02.3 | `1830` · `view-atlantic` · `places` · loc-new-orleans, loc-liverpool, loc-manchester | 1830: New Orleans, Liverpool and Manchester locate a cotton economy linked to enslaved labour. These markers are regional anchors, not recorded cargo tracks. | 1830 年：新奥尔良、利物浦与曼彻斯特帮助定位一个与奴隶劳动相连的棉业网络。这些点是地区位置，不是已记录的货运航迹。 | ir-051, ir2-006 |
| 02.4 | `1833` · `view-britain` · `places` · loc-manchester | 1833: the Manchester marker opens the Factory Act's limited textile-mill protections. Four inspectors could not make every employer obey; child labour continued. | 1833 年：点曼彻斯特可读《工厂法》对部分纺织厂的有限保障。四名监察员不能使所有雇主守法，童工仍然存在。 | ir-038, ir-040, ir-064 |
| 02.5 | `1860` · `view-atlantic` · `places` · loc-new-orleans | 1860: New Orleans locates the slave-grown cotton economy. The United States census counted about four million enslaved people nationally; they did not all work in cotton. | 1860 年：新奥尔良帮助定位奴隶劳动种植棉花的经济。同年美国人口普查记录全国约四百万名被奴役者；他们并非全部从事棉花生产。 | ir-051, ir2-008 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 03 `ir-railways-networks` · Railways, different beginnings / 铁路，不同的起点

**摘要 / summary**：EN: Liverpool and Manchester opened their railway in 1830. Later continental lines grew along different paths; a railway dataset cannot by itself tell us what powered a train. ZH：利物浦—曼彻斯特铁路在 1830 年开通。欧洲大陆各地的铁路随后沿不同道路扩展；仅看一条铁路线，不能知道列车靠什么动力。[ir-017, ir-018, ir2-001]

**正文段落顺序**：①1825 与 1830 的英国铁路分开，不称 Rocket 为世界首台火车；②1827 年法国圣艾蒂安煤运线用马匹；③1835 年比利时、德意志诸邦；④俄国 1837 年公历/俄历日差只在细看；⑤印度 1853 年客运线，不等于印度工业的起点。[ir-017, ir-018, ir-019, ir-020, ir-022, ir-023, ir2-003]

**细看 / More**：①法国 Horn 与德意志 Tilly/Kopsidis：各地制度与区域经验，不写英国成功模板；②RShapes 原文件与大陆子集的年份和缺口；③铁路不是蒸汽机车的同义词；④Rocket 是 1829 年早期形态解释性复原，实物后改过，封面不是精密复原图。[ir-018, ir-065, ir-066, ir2-001, ir2-003, ir2-004, ir2-005]

**本章索引城市**：loc-liverpool、loc-manchester、loc-saint-etienne、loc-brussels、loc-mechelen、loc-nuremberg、loc-st-petersburg、loc-mumbai；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：配封面局部说明；运动部件读者转 steam-engine，只有 slug 级链接，不预设机车就是其模型。

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 03.1 | `1830` · `view-britain` · `places` · loc-liverpool, loc-manchester | 1830: Liverpool and Manchester mark a railway carrying steam-hauled passengers and freight. The markers locate its endpoints; no route is drawn in this view. | 1830 年：利物浦与曼彻斯特点出一条以蒸汽机车运送旅客与货物的铁路。图中标出两端的位置，此视图不绘线路。 | ir-017, ir2-001 |
| 03.2 | `1834` · `view-europe` · `rail` · loc-saint-etienne | 1834: the continental railway layer begins its recorded years. Saint-Étienne's earlier coal railway used horses; a rail line alone does not prove steam traction. | 1834 年：欧洲大陆铁路图层进入其记录的起始年份。圣艾蒂安更早的运煤铁路使用马匹，出现铁轨并不等于已使用蒸汽机车。 | ir-018, ir2-001 |
| 03.3 | `1835` · `view-europe` · `rail` · loc-brussels, loc-mechelen, loc-nuremberg | 1835: Brussels, Mechelen and Nuremberg locate new railway services in Belgium and the German states. Their histories are not one national starting date. | 1835 年：布鲁塞尔、梅赫伦与纽伦堡点出比利时和德意志诸邦的新铁路服务。它们不能被当作一个国家整体工业化的起始日期。 | ir-019, ir-020, ir-066 |
| 03.4 | `1837` · `view-russia` · `rail` · loc-st-petersburg | 1837: Saint Petersburg locates the Tsarskoye Selo public railway story. The year avoids silently mixing old and new calendar dates. | 1837 年：圣彼得堡帮助定位皇村公共铁路的故事。这里使用年份，避免把俄历与公历日期混在一起。 | ir-022 |
| 03.5 | `1853` · `view-india` · `places` · loc-mumbai | 1853: the Mumbai marker opens the Bori Bunder to Thane passenger service. Its opening is not the first industrial activity in India. | 1853 年：点孟买可读博里本德至塔纳客运列车开通的故事。铁路开通并不是印度工业活动的开端。 | ir-023, ir-055, ir-056 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 04 `ir-seas-signals` · Seas and signals / 海路与电讯

**摘要 / summary**：EN: Suez linked two seas in 1869. Steamships, deeper wharves and electrical cables reshaped connections around Singapore; these were different technologies. ZH：苏伊士运河在 1869 年连起两片海。蒸汽船、深水码头与电缆改变了新加坡周围的联系；它们靠不同技术工作。[ir-029, ir-032, ir-033, ir-034]

**正文段落顺序**：①1865 年江南制造局的机器、造船与翻译；②1869 年 11 月 17 日苏伊士开通，图仅显示两端城市；③新港同年全年记录 99 艘蒸汽船、65 艘帆船，与 1879 年 541、91 对照；④1870 年 12 月 31 日电缆完成与 1871 年 1 月 6 日通告分开；⑤古塔胶作海底电缆绝缘材料，不等于种植园橡胶。[ir-026, ir-029, ir-030, ir-032, ir-033, ir-034]

**细看 / More**：①1869/1879 到访码头记录按同口径比较，区别船次与独立船队；②船数是到访码头的文献计数，不假设独立船舶身份或全港统计；③库克与惠斯通的系统与通用摩尔斯电键不是同一仪器；④仅用电键图说明手控通断电，不编造海底电缆铺设路线或信号速度。[ir-028, ir-030, ir-033, ir2-007]

**本章索引城市**：loc-shanghai、loc-port-said、loc-suez-city、loc-singapore-city、loc-chennai；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：蒸汽船动力 More → steam-engine；电键是通信技术的图证，不由蒸汽在电缆内传讯。[ir-028, ir-033, ir2-007]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 04.1 | `1865` · `view-china` · `places` · loc-shanghai | 1865: Shanghai locates the Jiangnan Arsenal, where machinery, ships and technical translation formed part of late-Qing industrial change. | 1865 年：上海点出江南制造局。机器、船舶制造与技术翻译，都是晚清工业变化的一部分。 | ir-026 |
| 04.2 | `1869-11-17` · `view-egypt` · `places` · loc-port-said, loc-suez-city | 1869: Port Said and Suez mark the two ends of the newly opened canal, connecting the Mediterranean and Red seas. This view shows endpoints, not a surveyed canal line. | 1869 年：塞得港与苏伊士标出新开运河的两端，连接地中海与红海。此图显示端点，不把它们之间的连线冒充测绘的运河。 | ir-029 |
| 04.3 | `1869-12-31` · `view-singapore-region` · `places` · loc-singapore-city | 1869: Singapore's marker opens New Harbour's annual wharf records: 99 steamers and 65 sailing vessels visiting the wharves. These are not the global fleet or all Singapore shipping. | 1869 年：点新加坡可读新港码头的全年记录：到访的蒸汽船为 99 艘，帆船为 65 艘。这不是全球船队数，也不是新加坡全部航运。 | ir-030, ir-032 |
| 04.4 | `1870-12-31` · `view-indian-ocean` · `places` · loc-chennai, loc-singapore-city | 1870: Chennai, then Madras, and Singapore mark the cable connection completed at year's end. Signals travelled electrically, not as steam inside the cable. | 1870 年：钦奈，当时称马德拉斯，与新加坡标出年底完成的电缆连接。信号靠电传送，不是蒸汽在电缆中流动。 | ir-028, ir-033 |
| 04.5 | `1871-01-06` · `view-singapore-region` · `places` · loc-singapore-city | 1871: Singapore's cable-service advertisement followed the previous year's completion. Regional gutta-percha insulated submarine cables; it was different from plantation rubber. | 1871 年：新加坡的电缆服务广告晚于前一年的完工。这一区域出产的古塔胶用于海底电缆绝缘，与种植园橡胶不同。 | ir-033, ir-034 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 05 `ir-asian-paths-materials` · Asian paths, tin and rubber / 亚洲的道路、锡与橡胶

**摘要 / summary**：EN: Japan adapted imported knowledge while late-Qing China built new industrial institutions. Singapore and Malaya linked shipping and manufacturing to tin, rubber and migrant labour. ZH：日本引进知识，也作本地改造；晚清中国建立新的工业机构。新加坡与马来亚把航运、制造、锡、橡胶和移民劳动联系起来。[ir-025, ir-026, ir-035, ir-037, ir-063]

**正文段落顺序**：①1872 年新桥—横滨铁路不是日本一夜工业化；②1877 年橡胶苗抵达与 1888 年 Ridley 任职分开；③1881 年唐胥铁路建设只是一个具体案例；④1887 年海峡贸易成立、1890 年布拉尼岛炼锡，与马来亚采锡分清；⑤契约、招工、债务与自由移民逐项解释，不能把所有移民都写成自愿，也不能全部等同奴隶。[ir-024, ir-025, ir-027, ir-035, ir-037, ir-063, ir2-012]

**细看 / More**：①橡胶苗抵达与 Ridley 后来任职不能合成一次事件；②不画没有时代资料的橡胶园面或锡矿面；③避免以 Ipoh/太平今天的城市点冒充矿坑坐标；④华工与印度劳工经历不能互相代替，准备阶段只有印度劳工制度的细节已核，华工锡矿契约细节列为后续资料差距。[ir-035, ir-037, ir-063, ir2-006, ir2-012]

**本章索引城市**：loc-tokyo、loc-yokohama、loc-singapore-city、loc-tangshan、loc-ipoh、loc-taiping；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：本章讲供应、劳工与港口，不重复机械零件；回链第 04 章电缆绝缘与港口。[ir-032, ir-034, ir-037]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 05.1 | `1872` · `view-japan` · `places` · loc-tokyo, loc-yokohama | 1872: Tokyo and Yokohama locate the new Shimbashi to Yokohama railway. Japanese industrial change also involved adapting imported expertise. | 1872 年：东京与横滨帮助定位新桥至横滨的新铁路。日本的工业变化还包括对输入技术的改造与运用。 | ir-024, ir-025 |
| 05.2 | `1877` · `view-singapore-region` · `places` · loc-singapore-city | 1877: Singapore’s marker opens the arrival of rubber seedlings. Ridley’s later work at the Botanic Gardens belongs to another stage of this history. | 1877 年：点新加坡可读橡胶苗抵达的故事。Ridley 后来在植物园的工作，属于这段历史的另一环节。 | ir-035 |
| 05.3 | `1881` · `view-north-china` · `places` · loc-tangshan | 1881: Tangshan locates the construction of the Tangshan to Xugezhuang railway. This specific line does not date the beginning of all Chinese industry. | 1881 年：唐山点出唐山至胥各庄铁路的建设。不能用一条线路的日期，概括中国全部工业的起点。 | ir-027 |
| 05.4 | `1890` · `view-singapore-region` · `places` · loc-singapore-city | 1890: Singapore's marker opens the Pulau Brani tin-smelting story. Smelting ore and handling exports were different activities from mining tin in Malaya. | 1890 年：点新加坡可读布拉尼岛炼锡的故事。冶炼矿石、处理出口，与在马来亚开采锡矿是不同的工作。 | ir-037 |
| 05.5 | `1890` · `view-malaya` · `places` · loc-ipoh, loc-taiping, loc-singapore-city | 1890: Malaya and Singapore are shown at regional scale. Indenture, kangany recruitment and free migration involved different labour arrangements and different constraints. | 1890 年：地图转到马来亚与新加坡的区域尺度。契约劳工、康加尼招工与自由移民有不同的劳动安排，也面对不同约束。 | ir-063 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 06 `ir-growth-costs` · Growth and its costs / 增长与代价

**摘要 / summary**：EN: More production did not bring equal benefits at once. Laws, sanitation, labour organisation and pollution changed workers’ lives, while industrialisation differed between regions. ZH：产量增长，并没有马上给每个人同样的好处。法规、卫生设施、工人组织与污染改变了生活，各地工业化的经历也不同。[ir-041, ir-042, ir-044, ir-045, ir-046, ir-054, ir-055, ir-056, ir-057]

**正文段落顺序**：①从 1900 年视角回顾外国资本与俄国的联系；②回看 1844 机械防护、1847 工时、1871 工会与 1848/1875 公共卫生法；③煤烟危害与 Hanlon 模型的版本、地区、时段；④印度部分手工业衰落与棉纺、黄麻、茶业增长并列；⑤回到殖民劳动约束而非只看运输效率。[ir-041, ir-042, ir-044, ir-045, ir-046, ir-054, ir-055, ir-056, ir-063, ir-067, ir2-012]

**细看 / More**：①Hanlon 的工业煤烟/死亡风险研究，只讲定性联系，不展示论文内不一致的寿命数字；②Allen 的 Engels’ pause 是生产率与工资关系的历史解释，不能用铁路密度代替工资；③依 Gupta/Roy 的行业比较及其对 Clingingsmith/Williamson 的讨论区分尺度与资料，不独立转述未直接读到的 Roy 章节；④不画没有资料的污染浓度热图。[ir-046, ir-054, ir-055, ir-056, ir-057]

**本章索引城市**：loc-st-petersburg、loc-manchester、loc-birmingham、loc-mumbai、loc-singapore-city、loc-ipoh；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：回到第 02、05 章劳动个案；机械效率好坏不能直接推出福利变化。[ir-051, ir-057, ir-063]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 06.1 | `1900` · `view-russia` · `rail` · loc-st-petersburg | 1900: Saint Petersburg locates the Russian case beside the recorded railways. Malik’s account describes foreign capital entering Russia around the turn of the century. | 1900 年：圣彼得堡与资料记录的铁路帮助定位俄国案例。Malik 的叙述讨论世纪之交外国资本进入俄国的历史。 | ir-067, ir2-001 |
| 06.2 | `1900` · `view-britain` · `coal` · loc-manchester, loc-birmingham | 1900: Britain’s coal backdrop and industrial cities remain visible. Hanlon’s research links industrial coal smoke with mortality; this map shows geological context, not measured pollution. | 1900 年：英国煤层背景与工业城市同时显示。Hanlon 的研究联系工业煤烟与死亡风险；地图画的是地质参照，不是实测污染。 | ir-046, ir2-002 |
| 06.3 | `1900` · `view-india` · `places` · loc-mumbai | 1900: Mumbai opens a different industrial history. Declining crafts and growing cotton, jute and tea industries did not affect every Indian region in the same way. | 1900 年：点孟买可读另一种工业经历。部分手工业衰退，棉纺、黄麻与茶业又在发展，各地的变化并不相同。 | ir-054, ir-055, ir-056 |
| 06.4 | `1900` · `view-malaya` · `places` · loc-singapore-city, loc-ipoh | 1900: the Malaya and Singapore view returns to labour and materials. The reading panel distinguishes contracts and debt from the legal ownership of enslaved people. | 1900 年：马来亚与新加坡的视图再次聚焦劳动与原料。阅读面板区分契约、债务约束与把被奴役者当作财产的制度。 | ir-051, ir-063 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

### 07 `ir-connected-world-debates` · Connected world, debated history / 相连的世界，仍有争论的历史

**摘要 / summary**：EN: By 1914, these case studies show connected but uneven changes. Historians ask different questions about wages, energy, knowledge, empire and slavery. ZH：到 1914 年，几个案例显示彼此相连、却不均衡的变化。史家从工资、能源、知识、帝国与奴隶制提出不同问题。[ir-001, ir-047, ir-048, ir-049, ir-050, ir-051, ir-052, ir-053]

**正文段落顺序**：①以亚洲地点回顾多条道路；②大陆铁路只能显示数据中记录的线段；③新加坡把锡、橡胶、航运、电缆材料接进故事；④逐名比较 Allen、Mokyr、Pomeranz、Williams、Beckert、Burnard/Riello、Olmstead/Rhode，不强行排成两队；⑤用殖民劳动、童工、奴役与污染的已知事实约束叙述。[ir-025, ir-026, ir-032, ir-034, ir-035, ir-037, ir-038, ir-046, ir-047, ir-048, ir-049, ir-050, ir-051, ir-052, ir-053, ir-063, ir2-001]

**细看 / More**：①能源价格与知识传播解释能否同时成立；②美洲土地和煤的作用不等于单一发明史；③奴隶制资本、原棉供应与工业化因果机制的区别；④印度分化与法国、德国、俄国案例提醒我们不能只用一个国家作通用模板。[ir-047, ir-048, ir-049, ir-050, ir-051, ir-052, ir-053, ir-054, ir-055, ir-056, ir-065, ir-066, ir-067]

**本章索引城市**：loc-shanghai、loc-singapore-city、loc-mumbai、loc-brussels、loc-nuremberg、loc-manchester、loc-liverpool；按 §4 E-IR1，阅读面板可点开并飞到对应城市参照点。再并入 §3.5 所属章的全部文献事件；按 §3.8 补齐回顾对象，id 去重。

**跨题 / 跨章**：末尾双向导读：地图解释这些技术在哪里、何时与谁相连；steam-engine 解释活塞、冷凝、传动与调速如何工作。[ir-010, ir-013, ir-015]

| 拍 | t / 镜头 / layers / highlight | Caption EN | 字幕 ZH  | fact ids |
|---|---|---|---|---|
| 07.1 | `1914` · `view-global` · `places` · loc-shanghai, loc-singapore-city, loc-mumbai | 1914: the world view gathers the Asian places visited in this topic. A set of case studies cannot measure every country's industrial development. | 1914 年：全图汇集本主题走过的几个亚洲地点。几个案例并不能衡量每个国家的工业发展程度。 | ir-001, ir-025, ir-026, ir-056 |
| 07.2 | `1914` · `view-europe` · `rail` · loc-brussels, loc-nuremberg | 1914: the continental network is much denser in the RShapes record. Its segments measure mapped railway coverage, not national prosperity, steam use or people's wellbeing. | 1914 年：RShapes 记录的欧洲大陆路网已更密集。线段表示资料中画出的铁路，不代表国家富裕程度、蒸汽动力使用率或人们的生活状况。 | ir2-001, ir-057 |
| 07.3 | `1914` · `view-singapore-region` · `places` · loc-singapore-city | 1914: Singapore brings shipping, tin, rubber and cable insulation into one regional story. These materials came through different production and labour systems. | 1914 年：新加坡把航运、锡、橡胶与电缆绝缘材料带入同一个区域故事。这些原料经过不同的生产与劳动制度。 | ir-032, ir-034, ir-035, ir-037, ir-063 |
| 07.4 | `1914` · `view-britain` · `coal` · loc-manchester, loc-liverpool | 1914: Liverpool and Manchester anchor the final comparison. Historians weigh energy prices, knowledge, colonial resources and slavery differently; the documented coercion is not in doubt. | 1914 年：利物浦与曼彻斯特帮助定位最后的比较。史家对能源价格、知识、殖民资源与奴隶制的作用有不同解释；已记录的强制劳动并不因此受到否认。 | ir-047, ir-048, ir-049, ir-050, ir-051, ir-052, ir-053 |

**该章验收**：时间、镜头、图层与高亮同时落定；字幕说的是地图上可见地点或从其索引打开的文献；只画点的视图明确不声称显示路线。读者点进本章停在第一拍，系统不自动跑下一拍。

## 3. 地图、部件与数据计划

### 3.1 资源清单与边界

本题的 parts 是“地点 / 煤层 / 轨道 / 文献里程碑”，**不是 SpaceScene 零件**；不计划 parts.json、机械模拟或运行时统计接口。地图需要的数据已经能离线下载；尚未清理成生产 TopoJSON，属于准备素材，不可把 GeoJSON 直接改扩展名当成引擎文件。

| G / 准备阶段产品 | 本地输入 | 实际覆盖与时间 | 使用与许可家族 |
|---|---|---|---|
| G1 Natural Earth land | `data/ne-50m-land.geojson` | 1,420 面，现代全球自然底图，无 1760 年岸线含义 | 公有领域；所有 M 场景作 modern physical reference。[ir2-006] |
| G2 Natural Earth places | `data/ne-10m-populated-places.geojson` | 7,342 个现代城市点；本题精确名称+国家匹配取 21 个 | 公有领域；城市参照，不用人口字段造历史人口。[ir2-006] |
| G3 GeoNames | `data/geonames-cities15000-selected.tsv` | 6 行：Pawtucket、Dudley、Mechelen、Darlington、Stockton-on-Tees、Saint-Étienne | CC BY 4.0；同 NE 合成 27 点，保留源 id / 署名。[ir2-010] |
| G4 RShapes 1.0 | `data/rshapes-1.0.geojson` → `rshapes-through-1914-continent.geojson` | 原 20,661 MultiLineString，年份 1834–1921；本题子集 18,804，至 1914 | 派生文件仅 CC BY-NC-SA 4.0。来源页标至 1922，与实际最大年区分。[ir2-001] |
| G5 BGS coal resources | ZIP + GB / NI GeoPackage | GB 622、NI 16 个 Coal-bearing strata；原 CRS 分别 EPSG:27700 / 29900；2004 图复刻 | OGL 3.0；默认只转 GB strata；不是历史矿井开采面。[ir2-002] |
| G6 OHM bounded sample | `data/ohm-bounded-response.json` | 652 铁路 way，年份 1828–1993；138 带 NLS CC-BY 标签；未返回运河 | 原始研究隔离，默认 **不进产品**。不能据此补全英国网或 Suez。[ir2-011] |
| G7 NE rivers（备用） | `data/ne-50m-rivers.geojson` | 462 线，现代河流，无历史航道日期 | 公有领域；仅预取核对，本题默认不加河流 layer。[ir2-006] |

所有源 URL、逐文件字节数、sha256、原生坐标 extent、时间覆盖、图层 / 拍的关联、blocked / fallback 见 `data/INVENTORY.md`。`datasets.json` 的旧 D03 拒绝判定准备阶段已由用户规则覆盖；受限 CAMPOP / Cobb 全库仍拒绝。Atack US 只保留父目录候选，当前 spec 不需要美国铁路几何，故不下载。

构建前固定输入指纹（本轮重新计算一致）：`rshapes-1.0.geojson` = `c1e52458c7b325153ce079d0d4f3a129fd3549ed21cb8cfce67bb8bf031fde68`；`rshapes-through-1914-continent.geojson` = `92e50dcb6fb7cd7bae8370928eaf57174b5beeb8380da022f191e575f8f051ac`；`industrial-places.geojson` = `392d6cecadb432dfdf6ac07d624c834e4c03dcb793f3e1a7a5cbd5c5d2dcd285`。BGS GB/NI 与其余文件逐个对 INVENTORY 的哈希；不把同名新版当成本规格已核版本。

### 3.2 场景关键帧 / 图层配方（不是新 control 版图）

| M | 地图形态 | 适用拍 | 时态说明 |
|---|---|---|---|
| M0 | base | 00.1、00.4 | 现代自然地理参照；没有“1760 年现代国家”色块 |
| M1 | base + coal-strata + sites | 00.2、01.1、01.4、01.5、06.2、07.4 | 煤层固定，`f=1760` 只是让地质参照在本题范围可见，绝非开矿年。[ir2-002] |
| M2 | base + sites | 其余 places 拍及 00.3、01.2–3 | 27 个常设城市参照点；日期事实来自 inspector / 正文，点的位置来自 G2/G3。[ir2-006, ir2-010] |
| M3 | base + rail-rshapes + sites | 03.2–4、06.1、07.2 | `f=year`，无 `u`；表示资料记录到的累计建设线段，不能声称每条当时仍营业或用蒸汽。[ir2-001] |
| M4 | 英国 / 亚洲 / Suez / 电缆端点视图 | 03.1、03.5、04.2、04.4、05.1、05.3 | 使用 M2，不画替代直线；字幕写 endpoints / regional anchors。[ir-017, ir-023, ir-024, ir-027, ir-029, ir-033] |

煤层从现代地质资料借来作为**参照覆盖层**，不在年表、事件泳道或“新增煤田”统计里出现；`count:false`。铁路也 `count:false`：切线段和合并算法会改变 feature 数，界面不把 feature 数当公里或财富；本规格的计数仅用于数据回归。[ir2-001, ir2-002]

### 3.3 构建配方与许可隔离（将来施工时执行；准备阶段未写 production）

1. **RShapes**：读原 GeoJSON，验证所有坐标有限且 WGS84；保留原 `lid/year/spliced`。用 G1 中含伦敦、都柏林的两个主岛外环，剔除任何顶点落在主岛内的整条 feature，再取 `year<=1914`；这是保守过滤，不补画或沿岸裁轨道。小离岸岛不保证全除，地图描述限定“可用大陆覆盖”，不要声称获得严密的欧洲行政裁切。结果 18,804；原主岛触及线段共移除 1,061（先移除，后按年筛）。[ir2-001]
2. **铁路输出**：拟名 `industrial-rail-rshapes.json`，一个同名 TopoJSON 对象，MultiLineString；properties `{id:'rail-seg-'+lid,f:year,lid,year,spliced,src:['G4'],licence:'CC-BY-NC-SA-4.0'}`。不得猜测 `spliced=1` 是坏数据或置信度；未释义就保留原值。简化 DP 初始 0.75 km，预算不达则逐次至 1.5 km，量化 1,000,000；不得丢掉某条短线以制造缺口。保留 feature，计算计数按原 lid，不按 arc。[ir2-001]
3. **BGS**：只读 GB `Coal-bearing strata`，原 622 个 MultiPolygon。用经过正式 CRS 定义的转换工具从 EPSG:27700 转 EPSG:4326（可用 GDAL / PROJ 现有环境；准备阶段未装包、未假写转换结果）；记录所用变换、网格缺省与误差。不拿 NI EPSG:29900 混进 GB 转换。转完核经纬度、环闭合、绕向、非零面积、自交；与原生 CRS 地图并排看后再简化。[ir2-002]
4. **煤层输出**：拟名 `industrial-coal-strata.json`，同名 TopoJSON 对象，area，props `{id:'coal-gb-'+fid,f:1760,src:['G5'],reference:'modern-geology',surveyYear:2004}`。`f` 是显示范围设计值。DP 0.5 km 起，keep-shapes / topology clean，预算 ≤350 KB；保留合法小面，不把被简化边界误读为历史采矿边界。[ir2-002]
5. **地点输出**：已备 `industrial-places.geojson` 27 Point；从 G2 21 点 + G3 6 行保留源 id。**不**拿地图坐标本身证明某年发生某事件。将其映射成 `kind:site` 事件 loc-*，双语名字与定位说明，见 §3.4。历史 milestone 用独立 id。[ir2-006, ir2-010]
6. **底图**：未来优先复用已打包 Natural Earth（不再下载另一份 CDN 图）；准备阶段 50m 输入作来源与核对。全题世界地图，不能用区域 `region` 把全球镜头锁死；也不需要 `basemap.local`。新加坡 / 马来亚镜头分别 zoom 6.0 / 5.0，不把未核岸线放大到矿井 / 码头尺度。[ir2-006]
7. **预算**（设计）：生产题目数据（不含原始预取）建议铁路 ≤1.5 MB、煤层 ≤350 KB、地点/事件/字幕等 ≤150 KB，总几何目标 ≤2 MB；MapLibre 页面 JS gz ≤400 KB。若无法达到，优先减地图可视区域或有据合并同年相邻原线，不用删历史、挪日期、增外部请求来达标；任何合并后更新计数回归的分母。

**逐文件许可家族**：

| 将来派生文件 | 输入 | 本文件规则 |
|---|---|---|
| `industrial-rail-rshapes.json` | G4 + PD 的岛掩膜选择 | CC BY-NC-SA 4.0；附 RShapes 作者、2025 指定书目、原链接、修改说明；**不含任何 CC BY-SA** |
| `industrial-coal-strata.json` | G5 | OGL 3.0 来源条款保留；适配物可随 Atlas 内容发布，明示 underlying BGS material OGL；无 SA 源 |
| `industrial-places.geojson` / 将来 `events.json` | G2 PD + G3 CC BY | 保留 GeoNames CC BY 4.0 署名；新文字依 Atlas CC BY-NC-SA 4.0；无 BY-SA 源 |
| 自然底图 | G1 / G7 PD | 公有领域来源，不虚加 SA 限制 |
| OHM 原始样本 | 默认 CC0 + NLS CC-BY 标签 + 各原始来源 | 研究隔离，未生成派生文件；如以后采用，先逐元素许可和日期审计，再单独输出，绝不盲合并到铁路 |
| 将来若描 CC BY-SA 历史地图 | 只有该来源与兼容输入 | **单独 CC BY-SA 文件**，不和 RShapes / NC-SA 几何同文件、同拓扑或同派生数据集；本版没有这种文件 |

BGS 署名采用页面要求的短句：`Contains British Geological Survey materials © UKRI 2026`（9 个英语词，逐字核对于 BGS 许可页）；产品图注涉及 OS 底图的权利说明同时保留，不从产品包删除。以上只规划资产标注，不改 LICENSE 文件。[ir2-002]

### 3.3a topic / data 文件绑定（仅列契约，不创建文件）

以下配置使用当前 schema 的真实字段；颜色都来自现有 token。无 holder，因为零实体；“煤层”和“轨道”各一层，不借阵营语义配色。无实体的防漏 blocLabels 见下面配置。`count:false` 的层不造计数 PLATE；若以后加入统计，须另写有分母、有单位、有来源的行。

```yaml
id: industrial-revolution
title: { en: The Industrial Revolution, zh: 工业革命 }
subtitle: { en: 'Britain and an unevenly connected world, c.1760–1914', zh: '英国与不均衡地相连的世界，约 1760—1914 年' }
subject: history
mode: time
engine: time-scene
stage: geo
theme: paper
status:
datePrecision: year
sensitivity: open
blocLabels:
  axis: { en: Comparative group A, zh: 比较组甲 }
  allied: { en: Comparative group B, zh: 比较组乙 }
  neutral: { en: Reference, zh: 参照 }
  out: { en: Outside this view, zh: 本视图之外 }
datedLayers:
  - id: rail-rshapes
    file: industrial-rail-rshapes
    kind: line
    color: token:ink
    label: { en: 'Recorded continental railways', zh: '资料记录的大陆铁路' }
    count: false
  - id: coal-strata
    file: industrial-coal-strata
    kind: area
    color: token:neutral
    label: { en: 'Coal-bearing strata (modern reference)', zh: '含煤地层（现代参照）' }
    count: false
```

`cover` 和首页 illustration 在施工时接已验收最终资产，不在这里写一个尚不存在的生产路径。`entities.json=[]`、`movements.json=[]`；`control.json={keyframes:[{t:'1760',features:{type:'FeatureCollection',features:[]}},{t:'1914',features:{type:'FeatureCollection',features:[]}}]}`。`events.json` 为 58 条 §3.4/3.5/3.8 事件；`sources.json` 按 §6/source-id-map 输出；`glossary.json` 15 条 §5；`presets.json` 14 条 §3.6。章/拍 state.layers 必须从 §2 简写展开，不能让引擎默认 control/movements/battles 偷开。

### 3.4 地点表（已经下载并解析；全部是现代城市参照，非历史精确厂址）

| id | 名称 EN / ZH | [lon, lat] | 输入来源 / 原 id | 关联事实 |
|---|---|---|---|---|
| `loc-manchester` | Manchester / 曼彻斯特 | [-2.248685, 53.47532] | Natural Earth ne_10m_populated_places / 1159149119 | [ir2-006]；具体情节依各拍事实 |
| `loc-liverpool` | Liverpool / 利物浦 | [-2.961934, 53.405068] | Natural Earth ne_10m_populated_places / 1159146371 | [ir2-006]；具体情节依各拍事实 |
| `loc-birmingham` | Birmingham / 伯明翰 | [-1.921943, 52.47692] | Natural Earth ne_10m_populated_places / 1159149367 | [ir2-006]；具体情节依各拍事实 |
| `loc-nottingham` | Nottingham / 诺丁汉 | [-1.165706, 52.941084] | Natural Earth ne_10m_populated_places / 1159135319 | [ir2-006]；具体情节依各拍事实 |
| `loc-glasgow` | Glasgow / 格拉斯哥 | [-4.239101, 55.86227] | Natural Earth ne_10m_populated_places / 1159150591 | [ir2-006]；具体情节依各拍事实 |
| `loc-brussels` | Brussels / 布鲁塞尔 | [4.331371, 50.835263] | Natural Earth ne_10m_populated_places / 1159151465 | [ir2-006]；具体情节依各拍事实 |
| `loc-nuremberg` | Nuremberg / 纽伦堡 | [11.079985, 49.449991] | Natural Earth ne_10m_populated_places / 1159146953 | [ir2-006]；具体情节依各拍事实 |
| `loc-st-petersburg` | Saint Petersburg / 圣彼得堡 | [30.314074, 59.94096] | Natural Earth ne_10m_populated_places / 1159151291 | [ir2-006]；具体情节依各拍事实 |
| `loc-mumbai` | Mumbai / 孟买（当时 Bombay） | [72.875839, 19.068408] | Natural Earth ne_10m_populated_places / 1159151611 | [ir2-006]；具体情节依各拍事实 |
| `loc-chennai` | Chennai / 钦奈（当时 Madras） | [80.278053, 13.091934] | Natural Earth ne_10m_populated_places / 1159151431 | [ir2-006]；具体情节依各拍事实 |
| `loc-shanghai` | Shanghai / 上海 | [121.434559, 31.218398] | Natural Earth ne_10m_populated_places / 1159151605 | [ir2-006]；具体情节依各拍事实 |
| `loc-tangshan` | Tangshan / 唐山 | [118.192431, 39.626283] | Natural Earth ne_10m_populated_places / 1159147045 | [ir2-006]；具体情节依各拍事实 |
| `loc-yokohama` | Yokohama / 横滨 | [139.602021, 35.430656] | Natural Earth ne_10m_populated_places / 1159147167 | [ir2-006]；具体情节依各拍事实 |
| `loc-tokyo` | Tokyo / 东京 | [139.749462, 35.686963] | Natural Earth ne_10m_populated_places / 1159151609 | [ir2-006]；具体情节依各拍事实 |
| `loc-singapore-city` | Singapore / 新加坡 | [103.853875, 1.294979] | Natural Earth ne_10m_populated_places / 1159151627 | [ir2-006]；具体情节依各拍事实 |
| `loc-port-said` | Port Said / 塞得港 | [32.290008, 31.25999] | Natural Earth ne_10m_populated_places / 1159149855 | [ir2-006]；具体情节依各拍事实 |
| `loc-suez-city` | Suez / 苏伊士 | [32.549941, 30.004976] | Natural Earth ne_10m_populated_places / 1159149853 | [ir2-006]；具体情节依各拍事实 |
| `loc-ipoh` | Ipoh / 怡保 | [101.064983, 4.599989] | Natural Earth ne_10m_populated_places / 1159148315 | [ir2-006]；具体情节依各拍事实 |
| `loc-taiping` | Taiping / 太平 | [100.719991, 4.86496] | Natural Earth ne_10m_populated_places / 1159148311 | [ir2-006]；具体情节依各拍事实 |
| `loc-kuala-lumpur` | Kuala Lumpur / 吉隆坡 | [101.688699, 3.139797] | Natural Earth ne_10m_populated_places / 1159151317 | [ir2-006]；具体情节依各拍事实 |
| `loc-new-orleans` | New Orleans / 新奥尔良 | [-90.088368, 29.968908] | Natural Earth ne_10m_populated_places / 1159151233 | [ir2-006]；具体情节依各拍事实 |
| `loc-mechelen` | Mechelen / 梅赫伦 | [4.47762, 51.02574] | GeoNames cities15000 / 2791537 | [ir2-010]；具体情节依各拍事实 |
| `loc-saint-etienne` | Saint-Étienne / 圣艾蒂安 | [4.39, 45.43389] | GeoNames cities15000 / 2980291 | [ir2-010]；具体情节依各拍事实 |
| `loc-stockton` | Stockton-on-Tees / 斯托克顿 | [-1.3187, 54.56848] | GeoNames cities15000 / 2636876 | [ir2-010]；具体情节依各拍事实 |
| `loc-dudley` | Dudley / 达德利 | [-2.08333, 52.5] | GeoNames cities15000 / 2650839 | [ir2-010]；具体情节依各拍事实 |
| `loc-darlington` | Darlington / 达灵顿 | [-1.55039, 54.52429] | GeoNames cities15000 / 2651513 | [ir2-010]；具体情节依各拍事实 |
| `loc-pawtucket` | Pawtucket / 波塔基特 | [-71.38256, 41.87871] | GeoNames cities15000 / 5223869 | [ir2-010]；具体情节依各拍事实 |

loc-* 的 `kind: site`、`t: '1760'` 只为当前数据格式必填，site 不参与时间、不会声称该城于 1760 建立。每条 summary 明示 Modern city reference / 现代城市参照，detail 写出未标历史厂址。现代国别只在数据匹配时消歧，不在历史地图上贴成当年的国名。吉隆坡当前 37 拍没有高亮，保留作马来亚参照 / 索引可选，不写开埠年或矿业起点。[ir2-006, ir2-010]

### 3.5 文献里程碑事件清单

使用已有 `milestone` 事件（墨色点环，不赋 sides/result）；无伤亡事件不造 casualties。所有坐标复用上表城市**参照**，detail 首句明确“区域定位；不是此建筑 / 线端精确坐标”。法案点是本章阅读锚点，不称法案在曼彻斯特通过；全国普查点不是全部人口所在的点。没有经核地点的论著只写 More，不造作者所在地事件。

| id | t（原精度） | loc 参照 | title EN / ZH | fact ids | 所属 index |
|---|---|---|---|---|---|
| `ev-watt-model` | 1765 | loc-glasgow | Watt’s condenser model / 瓦特的冷凝器模型 | ir-011 | 01 |
| `ev-watt-patent` | 1769-01-05 | loc-glasgow | Separate-condenser patent / 分离式冷凝器专利 | ir-012, ir-013 | 01 |
| `ev-jenny-patent` | 1770 | loc-nottingham | Jenny patent / 珍妮纺纱机专利 | ir-005 | 01 |
| `ev-commercial-watt` | 1776 | loc-birmingham | Commercial engines operating / 商业蒸汽机投入运行 | ir-014 | 01 |
| `ev-pawtucket-machinery` | 1790-12 | loc-pawtucket | Cotton machinery running / 棉纺机器运转 | ir-003, ir-021 | 02 |
| `ev-slater-mill-building` | 1793 | loc-pawtucket | Slater Mill building and workers / 斯莱特厂房与工人 | ir-021 | 02 |
| `ev-stockton-darlington` | 1825 | loc-darlington | Stockton and Darlington Railway / 斯托克顿—达灵顿铁路 | ir-017 | 03 |
| `ev-rocket-rainhill` | 1829 | loc-liverpool | Rocket at Rainhill / Rocket 与雷恩希尔试验 | ir2-003, ir2-004, ir2-005 | 03 |
| `ev-liverpool-manchester` | 1830 | loc-manchester | Liverpool and Manchester Railway / 利物浦—曼彻斯特铁路 | ir-017 | 03 |
| `ev-factory-act` | 1833 | loc-manchester | Factory Act, national context / 工厂法，全国背景 | ir-038, ir-040, ir-064 | 02 |
| `ev-belgium-rail` | 1835-05-05 | loc-mechelen | Brussels–Mechelen service / 布鲁塞尔—梅赫伦铁路 | ir-019 | 03 |
| `ev-nuremberg-rail` | 1835 | loc-nuremberg | Nuremberg–Fürth railway / 纽伦堡—菲尔特铁路 | ir-020 | 03 |
| `ev-russia-rail` | 1837 | loc-st-petersburg | Tsarskoye Selo railway / 皇村铁路 | ir-022 | 03 |
| `ev-india-passenger` | 1853-04-16 | loc-mumbai | Bori Bunder–Thane passengers / 博里本德—塔纳客运 | ir-023 | 03 |
| `ev-us-census-enslavement` | 1860 | loc-new-orleans | US census context / 美国人口普查背景 | ir2-008, ir-051 | 02 |
| `ev-jiangnan-arsenal` | 1865 | loc-shanghai | Jiangnan Arsenal / 江南制造局 | ir-026 | 04 |
| `ev-suez-opening` | 1869-11-17 | loc-suez-city | Suez Canal opens / 苏伊士运河开通 | ir-029 | 04 |
| `ev-new-harbour-record` | 1869 | loc-singapore-city | Annual New Harbour record / 新港全年记录 | ir-030, ir-032 | 04 |
| `ev-cable-completion` | 1870-12-31 | loc-singapore-city | Madras–Singapore cable completed / 马德拉斯—新加坡电缆完成 | ir-033 | 04 |
| `ev-cable-advertised` | 1871-01-06 | loc-singapore-city | Cable service advertised / 电缆服务通告 | ir-033, ir-034 | 04 |
| `ev-japan-rail` | 1872 | loc-yokohama | Shimbashi–Yokohama railway / 新桥—横滨铁路 | ir-024, ir-025 | 05 |
| `ev-rubber-arrival` | 1877 | loc-singapore-city | Rubber seedlings arrive / 橡胶苗抵达 | ir-035 | 05 |
| `ev-tangxu-rail` | 1881 | loc-tangshan | Tangshan–Xugezhuang construction / 唐山—胥各庄铁路建设 | ir-027 | 05 |
| `ev-pulau-brani-smelter` | 1890 | loc-singapore-city | Pulau Brani tin smelting / 布拉尼岛炼锡 | ir-037 | 05 |
| `ev-russia-investment-review` | 1900 | loc-st-petersburg | Foreign capital, a retrospective / 外国资本，历史回顾 | ir-067 | 06 |
| `ev-coal-smoke-estimate` | 1900 | loc-manchester | Looking back at coal smoke / 回顾煤烟影响 | ir-046 | 06 |

本表 26 个 milestone；加 §3.8 的 5 条后共 31 个，与 27 个 site 共 58 条。`battles` 默认关闭以免同一城市叠两种点；本章索引点击 milestone 时依 §4 E-IR1 打开 battles 并选中，在其真实日期显示。煤烟事件的 t=1900 是回顾视角，标题与 detail 说是后来历史研究，不伪称当时做过测量；俄国外资回顾同理。[ir-046]

### 3.6 镜头预设与规格行

`presets.json` 使用下表 `view-*` id；world/theatre 保留给引擎，不重名。初始 pitch=0、bearing=0，点击只改镜头；章 / 拍才改时间。

| id | Label EN / ZH | center | zoom |
|---|---|---|---|
| `view-global` | Global / 世界 | [70, 25] | 0.3 |
| `view-britain` | Britain / 英国 | [-2.6, 54.1] | 4.5 |
| `view-europe` | Europe / 欧洲大陆 | [10, 50] | 3.0 |
| `view-new-england` | New England / 新英格兰 | [-71.5, 41.9] | 5.8 |
| `view-atlantic` | Atlantic / 大西洋联系 | [-46, 43] | 1.0 |
| `view-russia` | Russia / 俄国案例 | [30.7, 59.3] | 4.4 |
| `view-india` | India / 印度案例 | [73, 20] | 3.8 |
| `view-china` | China / 上海 | [121.0, 31.2] | 4.6 |
| `view-egypt` | Egypt / 苏伊士两端 | [32.4, 30.5] | 6.2 |
| `view-singapore-region` | Singapore Region / 新加坡区域 | [103.8, 1.4] | 6.0 |
| `view-indian-ocean` | Indian Ocean / 印度洋 | [91, 8] | 2.5 |
| `view-japan` | Japan / 日本案例 | [139.7, 35.5] | 5.0 |
| `view-north-china` | North China / 华北 | [118, 39.5] | 4.7 |
| `view-malaya` | Malaya / 马来亚 | [102.1, 3.5] | 5.0 |

HUD 规格行（设计）：Scope / 范围 = Britain, then global cases / 英国起点、全球案例；Period / 时段 = c.1760–1914（ir-001）；Rail coverage / 铁路资料 = continental sample, since 1834（ir2-001）；Coal layer / 煤层 = modern geology reference（ir2-002）；Places / 地点 = city reference points（ir2-006）。不显示“工业化完成百分比”。

### 3.7 缺失、被挡与可运行的降级

| 缺口 | 已检查证据 | 默认降级（不依赖等候许可） |
|---|---|---|
| 英格兰 / 威尔士全路网 | RShapes 缺；CAMPOP / Cobb full GIS restricted，父 D04 不取；OHM 样本 652 只覆盖局部，含晚期数据与不同来源。[ir2-001, ir2-011] | 英国拍只用已核城市参照、年份、封面；不补线、不把苏格兰残网说成英国全网 |
| Suez 历史渠线 | OHM 准备阶段有界联合查询未返回 canal way；未取得已配准 1869 渠线。[ir2-011] | Port Said / Suez 两个现代城市参照点，明确“不显示测绘渠线”；开通事实仍有 NLB 来源。[ir-029] |
| Madras–Singapore 电缆 / 航运轨迹 | 有起止与服务日期，无准备阶段合格的历史 polyline。[ir-033] | 两端城市点，无手绘海上折点；不计算缩短公里 / 航时 |
| 港池、布拉尼岛 1890 厂界、橡胶园 / 锡矿范围 | 城市点、制度与机构年代不能提供这些面积。[ir-035, ir-037, ir2-006] | 区域城市锚点与文字；不复用现代园区多边形 |
| 美国、印度、日本、中国铁路全网 | 本 spec 不依赖全球完整路网；各有具体开通证据。[ir-021, ir-023, ir-024, ir-027] | 城市点和文献里程碑；不用一段路线代替全国 |
| Hanlon 数字与部分书籍深度 | NBER 页受阻，公开工作论文已直接读取，摘要/导言数字不一致；部分书只有公开摘要 | 煤烟只保留定性；书籍只归属已读论点，不补细节；见 §0.3/§6 |
| LOC 电报 essay 曾受阻 | 本轮定稿另直接读取 Ingenium 电键解释与 Smithsonian Libraries 电路页 | 通用功能复原，ir2-007 改用 S83，未抄受阻图像 |

这些降级已经反映在逐拍字幕，**不需要额外新引擎来画假路线**。以后若补 geometry，另增 source/fact、许可家族、日期与配准残差，通过审核后再改稿。

### 3.8 索引的确定展开与最终事件数

`state.index` 为 event id 字符串数组（§4 E-IR1），不用准备稿的 `{target,preset}` 对象。每章先取 §2“本章索引城市”，再取 §3.5“所属 index”的全部事件，保持顺序、按 id 去重。03 城市补 loc-stockton、loc-darlington；05 补 loc-shanghai 和 ev-jiangnan-arsenal。06 加 ev-factory-act、ev-us-census-enslavement 作为回顾；07 合并 01–06 全部文献事件，保证回顾正文的独立事件可点。00 无文献事件。每章还必须覆盖其所有拍的 highlight 并集。史家/模型/图层/原始铁路分段不造索引事件。

06 回顾的法规与工会有独立文献对象，新增下表；均是地区阅读锚点，不称法律在该坐标通过。07 同样收录。

| id | t | loc 参照 | title EN / ZH | fact | index |
|---|---|---|---|---|---|
| `ev-machinery-law` | 1844 | loc-manchester | Machinery safeguards / 机器防护规定 | ir-041 | 06 |
| `ev-hours-law` | 1847 | loc-manchester | Textile working hours / 纺织工时规定 | ir-042 | 06 |
| `ev-union-law` | 1871 | loc-manchester | Trade union legal status / 工会法律地位 | ir-044 | 06 |
| `ev-health-law-first` | 1848 | loc-manchester | Public health legislation / 公共卫生立法 | ir-045 | 06 |
| `ev-health-law-later` | 1875 | loc-manchester | Local sanitation duties / 地方卫生责任 | ir-045 | 06 |

最终 **27 个 site + 31 个 milestone = 58 个 events**。使用实际 schema 的 `title/summary/detail/sources`，不照抄数据集 `name`。每个 site summary 双语指出“现代城市参照，不是历史设施精确位置”；每个 milestone 明示地理锚点的地区尺度及法律/全国统计的空间分母。城市坐标引 S68/S72，历史断言另引 §0.3 对应来源。

01 的 1712 抽水机只作正文回顾，已有 loc-dudley 索引，不造早于轴范围的事件；1788 Lap 同理由 loc-birmingham 详情与姊妹链接承载。其他没有独立事件的人物/制度在相关地点 detail 或 More 解释。索引覆盖检查按本节规则展开，不能靠 NLP 猜正文。

## 4. 引擎现实核对与最小新增契约

### 4.1 已有能力：从新工作清单移除

核对实际代码：`src/engines/time-scene/{schema.ts,index.ts,View.tsx}`、`stages/geo/{controller.ts,datedLayers.ts}`、`lib/{datedLayers.ts,model.ts,control.ts}`；共享 `src/engines/core/{SceneHost.tsx,url-state.ts,test-api.ts}`、`src/engines/widgets/InfoPanel.tsx`；`scripts/{shoot.ts,validate-content.ts}`；SpaceScene `lib/sim/index.ts`、`bind.ts`。docs/06 只是线索，以本工作树实现为依据。

| 原准备清单项 | 结论 / 现有覆盖 |
|---|---|
| 日期铁路、地质面、计数 | 删除新增：datedLayerDef/datedLayerIssues、GPU `[f,u)`、日期边界索引与过滤缓存、stats().datedLayers 已有。铁路/煤层 count:false，不加路长指标。 |
| 空 control、零实体、中性事件 | 删除新增：空 FeatureCollection/TopoJSON 已支持；View 的 geo.entities.length>0 分支已抑制空参与卡；site/milestone 与 EventInspector 已有。 |
| 低缩放铁路线宽 | 删除条件性引擎项：datedLayerStyles 使用 zoom10=1 px、zoom13=2.5 px 的 interpolate，低于首 stop 保持 1 px，不负向外推。zoom3/4.4 真实截图可读性仅作验收。 |
| 蒸汽周期、刚体、调速、同题切引擎 | 从本题移出：分题并用已有 TopicLink/FlyTo；机械 sim 属 steam-engine，不由地图题承诺。 |
| 全新阅读面板、测试 API、URL 编码器 | 删除重造：共享 readerTop/readerEnd、EventInspector、SceneControls.test、来源弹层与 b codec 都有；仅补以下 TimeScene 适配。 |
| 覆盖未知状态、数据适配器、公里指标 | 不扩 schema：layer.label、背景 note、地点 detail/More 已能说明大陆样本与资料空白；离线转换和 provenance 属内容管线。无公里读数需求。 |

### 4.2 保留工程项

| 编号 | 代码证据 / 缺口 | 最小实现 | 阻塞 |
|---|---|---|---|
| **E-IR1** | timeChapterState strict schema 无 index，timeChapterRefs 只查 highlight；View 只把详情写到低位 inspector 槽 | 事件 id 索引、既有详情改送 readerTop；复用共享 slots，索引只支持本题需要的 events（含 site/milestone） | HUD 验收 |
| **E-IR2** | View 无阅读节拍行；index.ts fromUrl 忽略 core 已解码 beat，applyBeatState 不存 beat | reader 节拍行、静态步进和共享 b 参数适配；复用现有 beats/applyBeatState/axis helpers，不改地图或 codec | 手机翻拍、分享拍 |

**E-IR1 输入与校验**：chapter-state 加 `index?: string[]`（z.array(kebabId)，缺省为空、每章独立），不在 beat 加字段。有序，重复 target 在第二项 `state.index[i]` 报 1 error；必须属于本题 geo.events，layer/entity/movement/跨主题/未知 id 都 error。不复制 title，不加 preset 字段。保留既有 highlight 引用检查；索引另作 event-only 检查，不能加进总 refs 后误许 layer。错误给出章文件/字段路径。内容验收再按 §3.8 展开清单比较。

**E-IR1 输出与绑定**：readerTop = E-IR2 节拍行 + 一份原事件/实体详情，readerEnd = 当前章 index 按钮。没有选中不留空框。按钮 title 来自目标双语 title，`data-time-target`、aria-pressed、≥44 CSS px。旧实体选择仅挪槽，索引不新增 entity/movement 分支。地图/引线/index 复用同一个 selectedEvent 和 EventInspector，不重复渲染。

index 选 site：开 sites，t/beat 不变，highlight=[id]；非 site：开 battles，t=event.t，beat=null；chapter 保持、不进 PRESENT。相机只将 center 改 event.at，zoom/pitch/bearing 保持；非法 id 不动状态。先完成 store 更新再设置 selected，避免现有 transition 订阅清掉刚选对象。演示中拒绝 index 选择。选择后 reader 滚到顶部，手机展开已有抽屉，保持既有持久化偏好。关闭详情恢复当前已选拍的 highlight（E-IR2 beatScene），无有效拍才回章默认。语言/来源弹层复用已有路径。

不加 selected/index URL 字段；复用 ch/t/layers/cam/hl，刷新复现地图，不要求自动重开详情。测试经已有 SceneControls.test 注册：`__atlas.engine.selectEvent(id):boolean`；`__atlas.engine.reader():{indexIds:string[],selectedId:string|null,detailCount:number}`；非法或演示中 false/零副作用。核心 test API 不改。

**E-IR2 输入与状态**：复用 state.beats，TimeSceneExt 新增 `beat:number|null`（0-based，缺省 null，chapter target 重置 null）。applyBeatState 写入 b.index；轴、reader、键与 PRESENT 共用同一状态应用。自由移动镜头保留 beat；时间拖动/微调、非 site 索引跳时清为 null，不猜同日哪拍。site 选择保留 beat。reader 行显示本语言当前字幕、n/N 和上一/下一拍按钮（≥44 px）；没有自定义拍的章可隐藏。用 `core/axis/axis.ts` 的 stepBeat/flatIndex 跨章步进，首尾禁用，不启动演示；注册 `,/.`，按键和按钮同路。

URL 复用 core/url-state.ts 的 b（1-based）与 transition.fields 约定。TimeScene fromUrl 读取解码 beat，首次有效 b 补齐未由链接显式指定的 t/camera/layers/highlight；显式值优先，参考 SpaceScene/lib/beat-scene.ts 的 linkedBeatPatch，抽取纯 helper 时去掉 SpaceScene 专属依赖。无效语法由现有 codec 忽略，超过本章拍数则 beat=null，保持章目标，不制造第六拍。无 b 的旧链接行为不变。显式 t 不等于拍日期时 beat=null，reader 显示双语“Custom time / 自选时间”；单纯显式 cam 是自由查看，不清拍。不新增核心 URL 字段。

P 从当前有效拍进入，退出恢复进入前的 beat/时间/镜头/图层；state().beat 为 0-based/null，URL b 为 1-based。__atlas.goToBeat 仍是演示入口，不借它做 reader 静态翻拍；新增 engine.stepBeat(dir):boolean 测试钩子走 reader 路径。背景 4 拍同样可阅读步进，底部仍只有 7 个正式段/33 刻度，PRESENT 共 37 拍。

**单测与浏览器精确预期**（接口 oracle，不是新史料）：

| 项 | 输入 | 预期 |
|---|---|---|
| E-IR1 schema | 缺省 index、零实体两空帧 | index 按钮 0、参与卡 0、异常 0 |
| E-IR1 schema | 重复 loc-pawtucket；layer rail-rshapes；合法 event | 重复 1 error 定位第二项；layer 1 error；合法 0 error |
| E-IR1 site | 02，t=1833，选 loc-new-orleans | 同章/t=1833；sites 开、highlight 长度1、selected=该 id、detailCount=1、presentation=null |
| E-IR1 event | 同上选 ev-us-census-enslavement | t=1860、beat=null、同章、battles 开、detailCount=1；detail 精确人数 3,953,760 [ir2-008] |
| E-IR1 精度 | 04 选 ev-cable-completion | store.t=1870-12-31，HUD 年=1870，detail 不改成1月1日，不换章 |
| E-IR1 无效 | selectEvent(unknown) | false，t/camera/layers/highlight/selected 改动字段数0 |
| E-IR1 关闭 | 01 第2拍选 loc-dudley 再关闭 | selected=null，highlight 恢复 [loc-glasgow]，不是第一拍两个点 |
| E-IR1 双语 | 同 id 经地图/引线/index；EN→ZH | 每次详情仅1份，id/t 不变，文字换语；reader 顶部可见 |
| E-IR2 URL | 02 ch + b=5 | beat=4，t=1860，view-atlantic，loc-new-orleans 高亮，presentation=null |
| E-IR2 同时刻 | BG b=2 / b=3 | t 均1760，beat 分别1/2；第2拍开 coal-strata、第3拍关；刷新不丢拍号 |
| E-IR2 覆盖 | 04 b=4 + cam=91,8,3 | beat=3、t=1870-12-31、zoom=3；显式 t=1869 则 beat=null/自选时间 |
| E-IR2 非法 | 02 b=6 / b=0 | b=6：beat=null、章目标 t=1790；b=0 被 core 忽略，不崩溃 |
| E-IR2 跨章 | 02 beat4 下一拍，再上一拍 | 03 beat0/t1830，再回02 beat4/t1860；presentation 始终 null |
| E-IR2 边界 | BG 首拍向前；07 末拍向后 | false、零改动；内侧相邻步进 true |
| E-IR2 P 恢复 | 从04 beat3进P再退出 | 原 beat3/t/camera/layers/highlight 全恢复，节拍行仅1份 |

最小文件归属：TimeScene schema/refs/index/View 与一个小 reader 组件；共享组件若抽取 SpaceScene BeatLine 的纯展示部分，不导入其 store 类型，SpaceScene 行为不变。复用宿主 slots、controls、codec、source popover；不改 sim/bind 注册。施工后补 docs/06 小节与本文件 §9，本轮不编辑这些文件。

性能预算：每章索引至多58按钮，不在 rAF 扫描，选择/步进 O(当前章条目/拍数)，不触发地图 source.setData；新增 reader JS ≤5 KB gz，浏览器内响应 p95≤100 ms（不计现有飞镜头）。1914 的18,804线不造 DOM marker；1080p目标60fps，交互后2秒窗口p95帧时≤33ms。超预算先优化转换/渲染，不能删历史或改日期。

shoot/e2e：paper/cinema × EN/ZH，390×844、1024×768及脚本全尺寸；检查 reader 顺序/单份详情、全部索引、b刷新/覆盖/跨章、离线。回归 sample-time、sample-dated-layers、ww2；若抽共享组件，加 SpaceScene 既有 reader/beat 回归。低缩放铁路只做真实1914截图验收，不预先新增样式。

## 5. 名词表（15 个，EN/ZH 独立释义）

id 带 `term-` 防止与章节 / 事件重名；每词 EN、ZH 正文第一次各包一次 Term。中文词形以父 terms 的 attestation 为起点，不冒充已经见过 MOE 华文课本。定义里涉及史实均有 fact id；未把解释性译名标成“官方术语”。

| id | term EN / ZH | Definition EN | 中文定义 | evidence / see |
|---|---|---|---|---|
| term-industrial-revolution | Industrial Revolution / 工业革命 | A period of changes in production and power, beginning with Britain in this topic; other regions changed at different times. | 本题用来描述先从英国讲起的生产与动力变化，各地并不同步。 | ir-001；term-mechanisation |
| term-mechanisation | Mechanisation / 机械化 | Using machines to perform production tasks; machines need not use steam. | 用机器完成生产任务；机器未必靠蒸汽。 | ir-003, ir-007；term-factory |
| term-spinning | Spinning / 纺纱 | Making yarn; it is a different task from weaving cloth. | 做出纱线，与把纱线织成布的工作不同。 | ir-005, ir-008；term-weaving |
| term-weaving | Weaving / 织布 | Crossing weft yarn with warp yarns to make cloth; a shuttle carries the weft. | 把纬纱与经纱交织成布；梭子带着纬纱穿行。 | ir-008；term-spinning |
| term-factory | Factory / 工厂 | A place where workers and machinery are brought together for production; early factories could use water power. | 把工人与机器集中起来生产的场所；早期工厂也能用水力。 | ir-003, ir-021 |
| term-steam-engine | Steam engine / 蒸汽机 | An engine using steam and pressure differences to move machinery. | 利用蒸汽及压力差带动机械的动力装置。 | ir-010, ir-013；term-condensation |
| term-condensation | Condensation / 凝结（冷凝） | Steam changes to liquid water; in these early engines this lowers pressure. | 蒸汽变回液态水；在这些早期机器中，冷凝使压力降低。 | ir-010, ir-013 |
| term-coalfield | Coalfield / 煤田 | A region containing coal-bearing rocks, not a list of mines operating in a particular year. | 含有煤层的地区，不等于某年正在开采的煤矿清单。 | ir2-002 |
| term-steamship | Steamship / 蒸汽船 | A vessel using a steam engine for propulsion; it is distinguished from a sailing vessel in the harbour records. | 以蒸汽机推动的船，在本题码头记录中与帆船分开统计。 | ir-030, ir-032 |
| term-telegraph | Telegraph / 电报 | Sending messages by electrical signals; a manual key makes and breaks a circuit. | 用电信号传递消息；手控电键接通、断开电路。 | ir-028, ir2-007 |
| term-gutta-percha | Gutta-percha / 古塔胶 | A material used to insulate submarine telegraph cables, distinct from plantation rubber in this topic. | 海底电报电缆所用的绝缘材料，与本题种植园橡胶分开。 | ir-034, ir-035 |
| term-slavery | Slavery / 奴隶制 | A system in which people were treated as property and compelled to work; slave-grown cotton supplied mechanised manufacture. | 把人当作财产、强迫劳动的制度；被奴役者种出的棉花供给机械化制造。 | ir-051, ir2-008；term-indenture |
| term-indenture | Indentured labour / 契约劳工 | A labour arrangement binding a worker to an employer for a period; contracts, recruitment and debt could restrict freedom. | 工人在一定期限内受雇佣契约约束的安排；契约、招工与债务可能限制自由。 | ir-063, ir2-012；term-kangany |
| term-kangany | Kangany recruitment / 康加尼招工制 | Recruitment through an overseer, one of several systems used for Indian labour migration to Malaya. | 通过工头招募劳工，是印度劳工迁往马来亚的招工方式之一。 | ir-063, ir2-012；term-indenture |
| term-deindustrialisation | Deindustrialisation / 去工业化 | A decline in manufacturing activity in a defined sector or region; Indian experiences differed across industries and places. | 某行业或地区制造活动的衰退；印度各行业、各地经历并不相同。 | ir-054, ir-055, ir-056 |

## 6. 来源表（稳定编号与本轮替代来源）

本轮读取日期 2026-10-27。S1–S74 沿用准备目录编号，只发布本表选用项；S75–S83 为本轮可直接读取的替代来源，不回写旧 source-id-map。正文/事件 sources 依 §0.3，不能盲复制已删除旧来源。每个 note 写清全文、摘要、数据观察或失败；没有每源超过 25 词的直接引语。原始数据许可不等于可以复制来源整段说明。

| S# | 作者 / 机构 | 来源 | 读取深度与用途 |
|---|---|---|---|
| S3 | British Library | [工业革命 (Matthew White)](https://www.britishlibrary.cn/zh-cn/articles/industrial-revolution/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S4 | Science Museum Group | [Newcomen Atmospheric Engine, 1920-124/1](https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S6 | Science Museum Group | [James Watt, 1736–1819](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S7 | Ben Russell / Science Museum | [James Watt and the separate condenser](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S9 | Science Museum Group | [Rotative Steam Engine by Boulton and Watt, 1788, 1858-1](https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S13 | Science Museum Group | [Replica of Hargreaves' Spinning Jenny, 1912-319](https://collection.sciencemuseumgroup.org.uk/objects/co44544) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S14 | Peter Maw / Economic History Review | [After the great inventions: technological change in UK cotton spinning, 1780–1835](https://onlinelibrary.wiley.com/doi/full/10.1111/ehr.13082) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S17 | SNCF Group | [Two centuries of railway history](https://www.groupe-sncf.com/en/group/history-archives/two-centuries-railway-history) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S18 | TrainWorld / SNCB heritage | [Belgium on track (19th century)](https://trainworld.be/en/collections/history-of-the-belgian-railways/2-belgium-on-track-19th-century/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S19 | DB Museum | [The history of the railway in Germany](https://dbmuseum.de/en/nuremberg/exhibitions/the-history-of-the-railway-in-germany) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S20 | US National Park Service | [Slater Mill](https://home.nps.gov/blrv/learn/historyculture/slatermill.htm) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S21 | Central Museum of Railway Transport, Russia | [Открытие Царскосельской железной дороги](https://cmzt.ru/events/news-events/otkrytie-czarskoselskoj-zheleznoj-do/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S22 | Heritage Directorate, Indian Railways / Google Arts & Culture | [A History of Indian Railways](https://artsandculture.google.com/story/cAVh7RwiKiTtKg) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S24 | UNESCO World Heritage Committee | [Decision 39 COM 8B.14](https://whc.unesco.org/en/decisions/6364) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S25 | National Museum of China | [江南制造局在1865-1885年间所造船只清单](https://www.chnmuseum.cn/zp/zpml/gmww/202104/t20210406_249554.shtml) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S27 | Jean-François Fava-Verde / Science Museum Group Journal | [A tale of two telegraphs: Cooke and Wheatstone’s differing visions of electric telegraphy](https://journal.sciencemuseum.ac.uk/article/cooke-and-wheatstones/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S28 | National Library Board Singapore | [Opening of the Suez Canal](https://www.nlb.gov.sg/main/article-detail?cmsuuid=15fcae20-2e3d-4eec-b5ab-2384f1aac2b9) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S29 | National Library Board Singapore, BiblioAsia | [Tapping History](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue2-jul-2007-tapping-history/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S30 | Singapore Botanic Gardens / NParks, Gardenwise 25 (July 2005) | [Ridley and Singapore’s Rubber Trees](https://www.nparks.gov.sg/sbg/research/publications/-/media/sbg/gardenwise/2005-jul-gardenwise-vol-25.ashx) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S32 | National Library Board Singapore, BiblioAsia | [On the Waterfront: The Building of Singapore’s First High-rise Skyline, 1918–1928](https://biblioasia.nlb.gov.sg/chapters-of-asia/chapters-on-asia-2015-on-the-waterfront-the-building-of-singapore-s-first-high-rise-skyline-1918-1928/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S34 | UK Parliament | [The 1833 Factory Act](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S35 | UK Parliament | [Later factory legislation](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S37 | Trades Union Congress | [Section: The TUC’s first victories](https://www.tuc.org.uk/research-analysis/reports/section-tucs-first-victories) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S38 | UK Parliament | [Key dates: towns and public health](https://www.parliament.uk/about/living-heritage/transformingsociety/towncountry/towns/keydates/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S40 | Robert C. Allen / Economic History Review | [Why the industrial revolution was British: commerce, induced invention, and the scientific revolution](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-0289.2010.00532.x) | 本轮公开学术摘要；只归属作者论点，不声称读过全书。 |
| S41 | Joel Mokyr / Princeton University Press via JSTOR | [A Culture of Growth: The Origins of the Modern Economy](https://www.jstor.org/stable/jj.40336711) | 本轮公开出版 synopsis；只归属论点，不补书中细节。 |
| S42 | Kenneth Pomeranz / Princeton University Press via JSTOR | [The Great Divergence: China, Europe, and the Making of the Modern World Economy](https://www.jstor.org/stable/j.ctt7sv80) | 本轮公开出版 synopsis；只归属论点，不补书中细节。 |
| S43 | Eric Williams / University of North Carolina Press | [Capitalism and Slavery, Third Edition](https://uncpress.org/9781469663678/capitalism-and-slavery-third-edition/) | 本轮公开出版 synopsis；只归属论点，不补书中细节。 |
| S44 | Sven Beckert / Harvard Weatherhead Center, originally The Atlantic (2014) | [Empire of Cotton (author essay)](https://www.wcfia.harvard.edu/publications/empire-cotton-0) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S45 | Trevor Burnard and Giorgio Riello / Journal of Global History | [Slavery and the new history of capitalism](https://www.cambridge.org/core/journals/journal-of-global-history/article/slavery-and-the-new-history-of-capitalism/6885E5697E7151B50FDEFC65ED96C79E) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S46 | Alan L. Olmstead and Paul W. Rhode / Explorations in Economic History | [Cotton, slavery, and the new history of capitalism](https://ideas.repec.org/a/eee/exehis/v67y2018icp1-17.html) | 本轮公开学术摘要；只归属作者论点，不声称读过全书。 |
| S49 | Bishnupriya Gupta and Tirthankar Roy / Oxford University Press | [From Artisanal Production to Machine Tools: Industrialization in India over the Long Run](https://academic.oup.com/book/7358/chapter/152152209) | 本轮公开章节内容；手工业/新产业及对其他研究的讨论。原 S47/S48 未直接读到。 |
| S50 | Robert C. Allen / Explorations in Economic History | [Engels’ pause: Technical change, capital accumulation, and inequality in the British industrial revolution](https://ideas.repec.org/a/eee/exehis/v46y2009i4p418-435.html) | 本轮公开学术摘要；只归属作者论点，不声称读过全书。 |
| S59 | National Library Board Singapore, BiblioAsia | [Indian Migration into Malaya and Singapore During the British Period](https://biblioasia.nlb.gov.sg/all-sections/vol-3-issue3-oct-2007-indian-migration-british-malaya-singapore/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S60 | Jeff Horn / MIT Press via Oxford Academic | [The Path Not Taken: French Industrialization in the Age of Revolution, 1750–1830](https://academic.oup.com/mit-press-scholarship-online/book/14881) | 本轮公开学术摘要；只归属作者论点，不声称读过全书。 |
| S61 | Richard H. Tilly and Michael Kopsidis / University of Chicago Press via Oxford Academic | [From Old Regime to Industrial State: A History of German Industrialization from the Eighteenth Century to World War I](https://academic.oup.com/chicago-scholarship-online/book/37929) | 本轮公开学术摘要；只归属作者论点，不声称读过全书。 |
| S63 | ETH Zürich, International Conflict Research | [RShapes 1.0; downloaded GeoJSON and coverage audit](https://icr.ethz.ch/data/rshapes/) | 重新读取公开产品/许可页并核对已下载原数据；文件/CRS/散列见 §3。 |
| S64 | British Geological Survey / UKRI | [Coal resources for new technologies](https://www.bgs.ac.uk/datasets/coal-resources-for-new-technologies/) | 重新读取公开产品/许可页并核对已下载原数据；文件/CRS/散列见 §3。 |
| S65 | Science Museum Group | [Rocket locomotive, 1862-5](https://collection.sciencemuseumgroup.org.uk/objects/co26704) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S66 | Karen Baker / National Railway Museum | [Rocket, Railtrack and a history of design](https://blog.railwaymuseum.org.uk/rocket-railtrack-and-a-history-of-design/) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S67 | Science Museum handbook, reproduced by Tring Local History Museum | [Science Museum handbook excerpt: Rocket as originally built](https://tringlocalhistorymuseum.org.uk/morehistory/Railway/c12_locomotive_(II).htm) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S68 | Natural Earth | [Natural Earth populated places and physical land](https://www.naturalearthdata.com/about/terms-of-use/) | 重新读取公开产品/许可页并核对已下载原数据；文件/CRS/散列见 §3。 |
| S70 | Jason G. Gauthier / US Census Bureau | [History and the Census: Juneteenth](https://www.census.gov/about/history/stories/monthly/2025/june-2025.html) | 本轮直接读取公开网页；只使用对应事实的内容。 |
| S72 | GeoNames | [GeoNames cities15000 gazetteer](https://download.geonames.org/export/dump/) | 重新读取公开产品/许可页并核对已下载原数据；文件/CRS/散列见 §3。 |
| S73 | OpenHistoricalMap contributors; local audit | [Bounded OHM railway/Suez response and element licence audit](https://overpass-api.openhistoricalmap.org/api/interpreter) | 只读本地有界响应及其实际查询/许可记录；研究隔离，不是已清理生产几何。 |
| S75 | US National Park Service | [Glossary of Weaving Terms](https://www.nps.gov/articles/000/glossary-of-weaving-terms.htm) | 公开全文 Bobbin/Loom/Shuttle/Warp/Weft；替代旧 Smithsonian 条目。 |
| S76 | Historic England | [Early Railways in England](https://historicengland.org.uk/whats-new/research/early-railways-in-england/) | 公开全文，1825 开通；不采用额外人数或首创排名。 |
| S77 | Katie Belshaw / Science and Industry Museum | [Special Exhibitions Gallery: If these walls could talk](https://blog.scienceandindustrymuseum.org.uk/seg-if-these-walls-could-talk/) | 公开全文，1830 利物浦—曼彻斯特蒸汽客货运输。 |
| S78 | National Diet Library, Japan | [Ukiyo-e depictions of railways](https://www.ndl.go.jp/en/imagebank/theme/tetsudoukiyoe) | 公开全文，1872 新桥—横滨；替代受阻日本档案页。 |
| S79 | Huang Chingchi / Chen Xibo | [Peking-Mukden Railway historical geography, 2014](https://www.dlyj.ac.cn/EN/abstract/article/1000-0585/14696) | 公开研究论文，1881 唐胥段建设；不采用铁路首创排名。 |
| S80 | The National Archives, UK | [1833 Factory Act: education source pack](https://cdn.nationalarchives.gov.uk/documents/education/factory-actdoc.pdf) | 直接读取 15 页 PDF，背景与 1836 监察员来信转录；原网页受阻。 |
| S81 | W. Walker Hanlon | [Pollution and Mortality in the 19th Century, September 2015](https://www.anderson.ucla.edu/sites/default/files/documents/areas/ctr/ziman/2015-18WP.pdf) | 直接读取 74 页工作论文；数值不一致，只保留定性结论。 |
| S82 | Hassan Malik | [Bankers and Bolsheviks](https://www.jstor.org/stable/j.ctv301gmn) | 公开出版 synopsis，仅支持外国资本与俄国联系，未读全书。 |
| S83 | Ingenium, Canada Science and Technology Museum | [Telegraph key](https://ingenium.ca/en/learn/teachers-zone/resources/telegraph-key/) | 公开全文 Scientific explanation，按下电键闭合电路。 |

数据的精确 URL/散列依 §3 与预取 INVENTORY。许可补充：[BGS OGL 署名页](https://www.bgs.ac.uk/bgs-intellectual-property-rights/open-government-licence/)、[GeoNames 数据说明](https://download.geonames.org/export/dump/readme.txt)、[NE 公有领域声明](https://www.naturalearthdata.com/about/terms-of-use/)。RShapes 网页“1834 首条铁路”措辞不采用，只用其覆盖范围。[ir2-001]

## 7. 图像计划、实际文件与准确性验收

只选以下三张进未来产品。美术统一：19 世纪科学 / 工程图版式细石墨铅笔、交叉排线与点描、严格中性灰度、透明 PNG；不含纸底 / 背景 / 框 / 字 / 数字 / 标签 / 标志 / 旗 / 箭头 / 地面投影。图注和可读标签由页面双语文字承担，不烙在图片里。技术 QA 见 `art/planned/industrial-revolution/art-audit.json`；记录提示与代际来源见 `PREP-NOTES.md`、`accepted-image-specs.json`、manifest。

| kind / 文件（art/planned/industrial-revolution/） | 用途 / subject | 新 / 复用与尝试 | 必须核对 |
|---|---|---|---|
| cover `industrial-revolution.png`，1024×1024 | 早期 Rocket 型 0-2-2 机车，侧视解释性复原，关联第 03 章 | 新 cover；准备阶段用 built-in image_gen 完成第 4 次修订，generation/rocket-try-4.png；加上继承准备阶段共 4 次尝试 | 一个大驱动轮对、一个小从动轮对（侧视共两轮，远侧遮蔽，不添加第三车轴）；后上方倾斜汽缸、连杆接偏心曲柄销；无两驱动轴间耦合杆；锅炉、烟囱、火箱相连。不是“世界第一辆火车”，不是现存实物的 1829 原状照片。[ir2-003, ir2-004, ir2-005] |
| figure `industrial-revolution-weaving-shuttle.png`，1536×1152 | 第 01 章，单个船形织布梭子 | **复用父图**，从 parent-art-snapshot 原样 copy；不移动，也不再生成 | 一个木质梭身、两个尖端、一个沿长轴的纱管、一条从侧眼引出的纬纱尾；不是纺纱机。[ir-008] |
| figure `industrial-revolution-telegraph-key.png`，1536×1152 | 第 04 章，通用手控电键功能复原 | 新 figure candidate，采用 generation/telegraph-key-try-1.png 的第 1 次生成；准备阶段验收 | 一根可绕枢轴转动的杠杆、一个手钮、接触间隙、回位弹簧及两电接线端；通断电路，不是蒸汽阀；不声称是 1837 库克—惠斯通机或 1871 新加坡实物。[ir-028, ir2-007] |

**双语图注 / alt （都由界面显示）**：

- Cover EN: An interpretive reconstruction of Rocket’s early 0-2-2 form. The surviving locomotive was later rebuilt; this is not a precise original construction drawing. ZH：Rocket 早期 0-2-2 形态的解释性复原。现存机车后来经过改建，本图不是原始精密工程图。[ir2-003, ir2-004, ir2-005]
- Shuttle EN: A boat shuttle carries weft yarn across warp yarns. This generic reconstruction has one bobbin; it shows weaving, not spinning. ZH：船形梭子带着纬纱穿过经纱。本图为装有一个纱管的通用复原，说明织布而非纺纱。[ir-008]
- Key EN: A generic manual telegraph key opens and closes an electrical circuit. It is not a reconstruction of a particular Singapore instrument. ZH：通用手控电键通过通断电路发送信号，不代表某一件新加坡历史仪器的精密复原。[ir2-007]

原调速器 cover 的 manifest 在 parent-art-snapshot 留档，不能拿旧 governor 的 hash 给 Rocket。原 condenser 图不列入本题；姊妹目录不改。生成候选不是历史证据。本轮定稿已实际打开三张最终 PNG，轴数、梭子纱管、电键接触间隙与限定图注相容；尺寸、灰度、alpha 和边距记录沿用准备阶段 art-audit。电键原文件为 LA 灰度+alpha，输出产品时可转 RGBA，不把 mode 名写成全部原图都是 RGBA。继承电键原始提示缺失已在准备记录明示。

只在阅读面板放插图，不另造地图机械舞台。首页如只有主题标题 alt，解释性复原的限制放第 03 章图注/More，不为封面新增 schema。本轮没有生成、改写或移动任何图片。

## 8. 施工顺序与验收清单

先 E-IR1/E-IR2 的夹具、单测、旧题回归，再脚手架保持 draft；地图先做首尾两端和覆盖对照，继而做背景、02、04 模板章，完成其余双语正文/More/来源/名词/图片，最后逐拍/逐章检查。下列均为施工要求，本轮未勾作产品通过；文档静态检查不等于运行产品关卡。

- [ ] `pnpm check`、`pnpm validate`（0 error/0 warning）、`pnpm test`、`pnpm build`、build 后 `pnpm e2e` 全绿；独立端口，不改 package.json 或计数来遮盖失败。
- [ ] `pnpm shoot industrial-revolution --keys --layout --beats --locale en,zh`，paper/cinema 均人工看截图；0 failed keys、0 layout issues、0 unlabelled highlights、chapter highlights 全在屏内；console 干净、0 runtime 外网请求；390×844/1024×768 另查。
- [ ] 8 个阅读章/37 拍，正式底轴 7 段/33 刻度，BG 演示/reader 有4拍；点章第一拍、点刻度同状态、不自动播；专题重叠不误换章；手机全部拍可从 reader 到达。
- [ ] E-IR1/E-IR2 精确用例全过；章头→节拍→详情→正文→本章索引；详情仅1份、选中后顶部可见，58事件按 §3.8 可达；无幽灵/跨主题 target。
- [ ] 全部断言按 §0.3，cut 不回流。Num/sources、1860 全国分母、船数口径、奴役/契约区别、法律与执行、煤烟模型界限逐项读；中英数字一致。每章2–4 More，15名词首次 EN/ZH 各包一次。
- [ ] Gavin 阅读 §0.1/0.2 敏感中文与暂定译名；本版施工完成仍是 draft，发布按后续审读状态处理，不自动改 published。
- [ ] entities/movements 均空，K1=1760/K2=1914空帧；参与卡/领土名/面积排名均0；REFERENCE 可切也无虚构轮廓，不解释K过渡百分比为工业化进度。
- [ ] RShapes 原 lid 一条一 feature；t=1830/1834/1840/1850/1869/1871/1890/1914 的 visible=0/35/428/1925/7355/8339/15577/18804；关闭rail后 visible=0；均只是数据回归，不是公里。日期边界之间 filterUpdates 不随帧增长，不重建source。
- [ ] BGS只取GB Coal-bearing strata，EPSG:27700→4326，保留622要素；经度-9..3、纬度49..61 sanity box，环闭合/绕向正确、自交0/零面积0。NI 29900不混投影。与原生图并排记录变换/误差；两空control环数0不替代煤层检查。
- [ ] 27地点唯一、21NE+6GeoNames、现代城市国家消歧、坐标合法；site不表示建城年；铁路点不冒充精确车站；SG无历史矿坑/码头/园区界；无手绘/未许可路线，borders默认关。
- [ ] 两空control端点各有截图，另有煤层/1834和1914大陆铁路/Suez和电缆端点对照图；SOURCES-GEO.md和data/SOURCES.md记全文件/许可/CRS/处理/误差/缺口。未做配准写“不适用”，不能捏造残差。
- [ ] 生产铁路≤1.5MB、煤层≤350KB、其他题目数据目标≤150KB、总几何≤2MB、地图首屏JS≤400KB gz；reader遵守§4小包/响应预算。未达如实报告，不能删原feature/日期或依赖运行时外部下载。
- [ ] NC-SA铁路不与BY-SA共派生文件/拓扑，BGS/GeoNames/NE署名完整；施工时在LICENSE-CONTENT/THIRD-PARTY-NOTICES加逐文件例外。本轮仅规定，未修改许可文件。
- [ ] 三图均来自art/planned/industrial-revolution，尺寸/灰度/alpha/留白/结构与双语图注核对；generic/interpretive限制明确，不新增图。姊妹TopicLink仅目标实际存在时输出，不编ch id。
- [ ] 关键操作≥44px、无hover必需操作；已访问主题离线可读；EN/ZH、paper/cinema、键盘/触控、语音各看/听两拍。实现结果写§9，不把规格阶段写成施工成功。

## 9. 引擎记录（施工后填写）
