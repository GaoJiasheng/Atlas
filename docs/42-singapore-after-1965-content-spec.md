# 42 · 1965 年后的新加坡：建设一个国家 · 内容施工 spec（v1）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写；接在 docs/28（`singapore-1819-1965`，到 1965 年 12 月为止）和 docs/34（`singapore-land-use`，1959 年至今的住、粮、行与填海）之后。**§0 由主会话按 Gavin 惯例代定（§0.1），Gavin 已说"做"；他可逐条推翻。`status: draft` 不变，直到 Gavin 读完 §0.2 的敏感段落。**

- slug：`singapore-after-1965`；标题 EN "Singapore after 1965: Building a Nation" / ZH "1965 年后的新加坡：建设一个国家"；副标题 EN "Defence, national symbols and living together" / ZH "国防、国家象征与和谐共处"；`shortTitle` EN "After 1965" / ZH "1965 年以后"。
- 课纲：MOE 2020 SS 课纲 P5 Part 1（印刷页 33–35，§1.1 原文）+ CCE 课纲第 29 页的四个国民教育纪念日。`levels: [P5]` 只是规划元数据，**界面任何地方不出现年级**。`subject: history`，`tags: [singapore, history, map]`。docs/17 第 207 行原定"不单做、并入 singapore-1819-1965 末章"，本文推翻这一条（§0-1），docs/17 与 docs/04 由主会话同步。
- **调查结论**（Sonnet 研究 `art/research/singapore-after-1965/`，2026-10-21 完成：`after-1965-research.md` 含 12 行敏感段落表、课纲原文、事实 2a–2h、地点坐标与许可、新加坡华文用词；`facts.json` 117 条事实、80 个来源）：①课纲核心是**国家象征、建军与国民服役、1964 年骚乱与社会凝聚**；英军撤离与就业、语言政策、东盟、全面防卫、"代价"一章都是 Atlas 的延伸（研究 syl-10）。②研究纠正了 brief 的 8 处前提（§1.3 标 ★）。③1965 年以后**没有领土变化**：本主题不需要任何新的版图或边界几何，地图 = 已有的年代岛岸 + Wikidata 读出的地点 + 土地利用主题已建好的工业区图层。
- **引擎结论**（§4）：**不改引擎**。`basemap.local`（`land-sg-modern`，带日期的岛岸）、控制区空帧、`milestone` 事件、`site` 事件、`datedLayers`、`TopicLink ch` 都已落地（docs/28 §11、docs/34 §9）。施工前只需核对 §4 的 V1–V4 四件事（零实体、全空控制区等），核对不过再按 §4 的最小改动处理。

---

## 0. 决策（2026-10-21 起草，主会话按 Gavin 惯例代定，见 §0.1）

| # | 决定 | 选项 / 理由 | 定稿 |
|---|---|---|---|
| 1 | **单独成题**：背景章 00 + 6 章（§2）。时间轴 1965-08-09（独立）到 2023-08-09（《国家象征法令》生效后的第一个国庆日，K2 保持帧）。1964 年骚乱、分家、第一届内阁**不重讲**，链到 `singapore-1819-1965` 第 11 章；裕廊工业区、裕廊镇管理局、居者有其屋、樟宜机场、地铁、填海**不重讲**，链到 `singapore-land-use` 第 02、04、05 章 | 另一选项是照 docs/17 原定并入 1819–1965 末章：不建议——课纲 P5 Part 1 的三条主线（象征、国防、凝聚）都在 1965 年以后，塞进末章会把那一章撑破 | 主会话按 Gavin 惯例代定 |
| 2 | **章节顺序按章节日期**（硬规则"章节顺序 = 时间顺序"）：01 国防（1966-02）→ 02 国家象征（1966-08-09）→ 03 邻国与全面防卫（1966-08-12）→ 04 英军撤离与就业（1967-07-18）→ 05 和谐共处（1968）→ 06 代价、争论与国庆日（1971-05）。拍可以晚于下一章开始（docs/10 允许重叠），所以象征一章能一直讲到 2023 年、和谐共处一章讲到 1997 年 | brief 建议"撤军与就业"放第 01 章；它的代表日期（1967-07-18）晚于建军（1966-02）和信约（1966-08），放前面就违反顺序规则。课纲核心排在前面，对读者也更好 | 主会话按 Gavin 惯例代定 |
| 3 | **地图只放地点，不画版图**：`control.json` 两个空帧（K1 1965-08-09、K2 2023-08-09，后者只为让时间轴止于这一天），**零个实体**；地点用 `milestone`（按日期出现）和 `site`（1965 年以前就在的地方）事件；岛岸用 `land-sg-modern`（docs/34，Landsat 年代岛岸，原样复用，不复制）；第 04 章打开土地利用主题的工业区图层 `sg-estates`（原文件复用，不复制） | 另一选项：画一个"新加坡共和国"控制区，或东盟成员国按年份上色。不建议：前者没有信息量，还得按岛岸年代裁剪；后者是 P5 Part 2 / 规划中的东南亚主题的内容 | 主会话按 Gavin 惯例代定 |
| 4 | **军事地点只到公共机构一级**：巴西拉峇军营只作**一个岛尺度的点**（标"SAFTI，1966–1995"，不画范围、不画营内、镜头不超过 zoom 11.5）；第一个国民服役营地用今天的公共公园 Taman Jurong Greens 的点（2017 年立了历史标记）；英军基地复制土地利用主题已有的 5 个粗略 `site` 点。**其余营地、警察和民防设施一律不查不画** | 研究"Sensitive-location note" | 主会话按 Gavin 惯例代定 |
| 5 | **全国性的决定锚在固定的点，细看写明只是锚点**：法律 → 当年的国会大厦（1999 年以前用旧国会大厦，坐标同 1819–1965 的 `first-president-1965`；2022 年的法令用今天的国会大厦）；没有地点的全国性政策与运动（信约首次诵读、国花、狮头、全面防卫、讲华语运动、英文为第一语文、种族和谐日、1971 和 1987 年的拘留，共 9 个）→ 全岛形心 [103.8198, 1.3521]（同 1819–1965 的 `coldstore-1963`） | 不为凑地点编造"在哪里宣布"；查到确切地点（例如国花在哪里宣布）再改 | 主会话按 Gavin 惯例代定 |
| 6 | **"代价与争论"两处都有**：各章就地写自己的代价（第 01 章：拒绝服役的人；第 04 章：1968 年劳工法令与选举；第 05 章：方言），第 06 章再集中写报业（1971、1974、1986）与光谱行动（1987），并列回指前面几处。每一项写"政府当时说什么 / 反对的人说什么 / 史家怎么看"，不下结论，不用形容词 | 另一选项：全部集中在第 06 章。不建议：读者在读国民服役时就该知道有人因宗教理由拒绝服役，代价和收益放在一起读 | 主会话按 Gavin 惯例代定 |
| 7 | **数字两边写**：1959 年失业人数（20 万 / 14 % 对 4.6 万）、基地相关工作（2.5 万对 3 万 + 1 万家佣）、1965 年制造业占比（14 % 对 19 %）、独立时的海军（"两艘船"对"两艘木壳船"）、国旗红色的释义（"人类平等与博爱"对 2022 年法令的中性写法）、1967 年法令通过日（3 月 14 日对 17 日）、全面防卫日从哪年开始（1984 对 1997/98）、种族和谐日（1997 对 1998）、对抗结束日（8 月 11 日对 12 日）——都列两个，各带来源；制造业占比和 1959 年人数**正文不印**，只在细看说为什么不印 | 研究 Summary "Numbers the sources do not agree on" | 主会话按 Gavin 惯例代定 |
| 8 | **1969 年骚乱只用一句、注明出处**："新加坡政府的记录是四人死亡、约 80 人受伤"（SG101 是唯一来源）；不画事件点；施工时找当年报纸核对，核不到就保留这句并在细看写明"没有找到独立来源" | 研究 S2 | 主会话按 Gavin 惯例代定 |
| 9 | **新加坡华文用法**：奥斯曼渥（《联合早报》写法，无间隔号）、胡姬 / 胡姬花、卓锦万代兰、国歌《前进吧，新加坡！》、信约、狮头标志、国家象征、国民服役、战备军人、新加坡武装部队、新加坡武装部队军训学院、巴西拉峇军营、种族和谐日、全面防卫日、国民教育、讲华语运动、大草场、政府大厦、旧国会大厦。1959 年写邦旗、邦徽、邦歌，1965 年起写国旗、国徽、国歌。未在新加坡来源核到的（杜进才、朱比赛、公共印章、内部安全法令、光谱行动、全面防卫、Taman Jurong、惹兰勿刹体育场、特选学校、两部法令的中文名）施工时 Opus 按《联合早报》、NLB、语委会资料库核；核不到写原文加注（§5） | 1819–1965 写"奥斯曼·渥""尤索夫·伊萨"，两个主题不一致——列入 §0.1 给 Gavin | 主会话按 Gavin 惯例代定 |
| 10 | **国旗红色的释义用 2022 年法令的写法**（"普世的友爱与平等"，EN "universal fellowship and equality"），细看写明 NHB 的旧写法和 2022 年改为性别中性 | 研究 sym-03 | 主会话按 Gavin 惯例代定 |
| 11 | **精度**：日期到天；只知道年 / 月的照写（`"1986"`、`"1971-10"`），不编日子。数字取整写"约"，精确值放细看 | | 主会话按 Gavin 惯例代定 |
| 12 | **图像只用已审过的草稿**：首页图 `singapore-after-1965.png`，章节图 `national-service`（第 01 章）、`factory-work`（第 04 章）；**不生成新图**（本轮没有 Codex） | §7 | 主会话按 Gavin 惯例代定 |
| 13 | 不做：测验、配音、视频、真实人物肖像、旗帜和国徽的图（国家象征用文字和表格讲，**不画**国旗、国徽、狮头——《国家象征法令》对使用有规定，另见 §7）、国庆检阅逐年场地图层（研究只核到 1966 年） | | 主会话按 Gavin 惯例代定 |

### 0.1 代定说明与给 Gavin 的事项（2026-10-21）

主会话按 Gavin 惯例代定 §0 全部 13 条：00 + 6 章，按日期排序；只画地点、两个空帧、零实体；军事地点只到公共机构；全国性决定用固定锚点；代价就地写 + 第 06 章集中；争议数字两边写；新加坡华文；只用已有三张图。Gavin 已说"做"。

**要 Gavin 定的（默认做法已按建议写进本文，不改就照做）：**

1. **人名写法统一**：本主题按《联合早报》写"奥斯曼渥"，1819–1965 写"奥斯曼·渥""尤索夫·伊萨"。默认：本主题用早报写法，1819–1965 第 11 章随后由主会话改成同一写法（两处、一张表）。另一选项：本主题也加间隔号。
2. **光谱行动（1987）写不写、写多少**：默认第 06 章一段正文 + 一个细看，政府说法、被拘留者说法、史家与后来官员的说法并列，不下结论，除了政府点名的两人不写其他被拘留者的名字。另一选项：只写一句并链到 NLB。
3. **因宗教理由拒绝服役**：默认第 01 章一个细看写"法律没有因良心拒服兵役的例外；耶和华见证人 1972 年被撤销注册；美国国务院报告 2023 年有 11 人在武装部队的拘留所"，原文核到新加坡政府来源才印。另一选项：只写"法律没有例外"一句。
4. **全面防卫日从哪年开始**、**种族和谐日 1997 还是 1998**：默认两说并列（正文写 1997，细看说明另一说）。
5. **首页图**：默认用组屋加工厂那张；它和土地利用主题的首页图（也是板式组屋）有点像。另一选项：用国民服役装备那张当首页图（要重新裁成方形，可能要 Gavin 看效果）。
6. **docs/17 的决定推翻**：原来写"不单做"。本文改为单独成题，请知悉。

### 0.2 敏感段落（给 `docs/review-queue.md` 第一组；草稿完成后按实际段落号更新）

下面是加进 review-queue「一、草稿主题：上线前要读的段落」的条目原文（章节与细看标题按本文 §2，施工后主会话核对段落号）：

> ### 4. 1965 年后的新加坡
>
> - **在哪看**：`src/content/topics/singapore-after-1965/REVIEW.md`（中文在前），事实核查见同目录 AUDIT.md，规格 docs/42。
> - **重点段落**：
>   - **01 国防**：细看"不愿服役的人"——1954 年反对国民服役的学生抗议、1967 年 3 月 17 日的抗议、法律没有因良心拒服兵役的例外、耶和华见证人 1972 年被撤销注册与 2023 年 11 人在拘留所（美国国务院报告）。
>   - **04 英军撤离**：第 1 段与细看"基地里有多少份工作"（两组数字并列）；第 3 段与细看"1968 年的劳工法令：两种看法"、1968 年选举（社阵抵制、58 席只有 7 席有竞选）。事件 `labour-laws-1968`。
>   - **05 和谐共处**：第 1 段对 1964 年骚乱的一句话回顾（数字与 1819–1965 第 11 章一致，两国政府两种说法）；细看"1969 年：只有一份记录"；细看"方言：得到的与失去的"（李光耀 2009 年的原话、在家讲方言的家庭比例）；第 05 章第 4 拍字幕（种族和谐日为什么是 7 月 21 日）。
>   - **06 代价、争论与国庆日**：第 2 段与细看"报纸与法律：两种说法"（1971 年《南洋商报》四人被拘留、《新加坡先驱报》停刊、1974 与 1986 年的报业法令）；第 3 段与细看"光谱行动：两种说法"（1987 年 22 人未经审判被拘留、1988 年九人的声明、再被捕与撤回、史家的看法）；第 1、3 拍字幕；事件 `press-detentions-1971`、`operation-spectrum-1987`。
>   - **02 国家象征**：细看"信约是怎样写成的"（"忘记种族、语言、宗教的差别"改成"不分种族、言语、宗教"，两句并排）。
>   - **03 邻国**：第 1 段对对抗时期爆炸的一句回顾（链到 1819–1965 第 11 章）；第 4 段全面防卫日与 1942 年新加坡沦陷（链到 ww2 第 07 章）。
>   - 背景章阅读说明；名词 `internal-security-act`、`national-service`、`konfrontasi` 的释义。
> - **要定的**：奥斯曼渥 / 奥斯曼·渥的写法（两个主题统一）；光谱行动写一段还是一句；拒服兵役写不写；首页图用哪张。

---


### §0.3 原文核查后的定稿修订（主会话，2026-10-21）

依据 `art/research/singapore-after-1965/originals-pass.md`（Sonnet）。施工以本节为准，与上文冲突时以本节为准。读不到原文的句子一律删掉，不凭二手转述写。

1. 光谱行动：删去 Turnbull 2009、尚达曼 2001 “social activists”、黄锦西 1991 “still not proven” 三处引述；保留 Barr 2010（*Critical Asian Studies* 42(3), p.337 “there never was a conspiracy, Marxist or otherwise”）；1988 年九人声明与八人再被捕已核实；法定声明注明出自 NLB。
2. 1989 年《内部安全法》修正：改写为“除程序是否合规外，法院不得审查”（第 8A、8B 条）。
3. 对抗结束：曼谷协议 1966 年 8 月 11 日在雅加达签署（FRUS d218），8 月 12 日在雅加达批准（NLB）；两个日期都写，地点都是雅加达。
4. 耶和华见证人：1972 年 1 月 14 日撤销注册（[1994] SGHC 207），理由用部长原话“public welfare and good order”；2023 年 11 人、2022 年 14 人被拘留的数字出自见证人自己的网站（经美国国务院报告转述），照此注明，引 state.gov。
5. 1969 年：不再只有一个来源。《海峡时报》1969 年 6 月 1–8 日的版面目录记录了 5 月 31 日晚约 7 时开始的骚乱、首晚 17 人受伤、警方报告 2 死 13 人住院、6 月 3 日五名青年被控、6 月 8 日恢复平静；“4 死、约 80 伤”的总数仍只见于政府的 SG101 网页，照此注明。
6. 全面防卫日：删去“1998 年首次全国纪念”；只写 1984 年 1 月 22 日提出全面防卫，1997 年列入学校日历（The New Paper 1997 年 5 月 17 日）。
7. 吴庆瑞：1965 年 8 月的职衔写“国防与安全部长”（《海峡时报》）与“内政及国防部”（MINDEF 史料）两种说法，不写改名日期；1967 年 8 月 17 日与林金山对调、1970 年 8 月 11 日由财政部调回国防部（总理公署声明，国家档案馆），不写“辞职”。
8. 1954 年学生事件：“26 人受伤、45 人被捕”只见于国家文物局 Roots，其他说明写“二十多人、四十多人”；照此注明出处，或不写具体数字。
9. 种族和谐日：1997 年（NLB、《海峡时报》1997 年 7 月 22 日）与 1998 年（教育部 2012 年新闻稿）两种说法并列。
10. “偏颇报道”去掉引号（NLB 英文是 slanted reporting，不是引语）。
11. 待人工补读：NewspaperSG 文章页需先点 “I Agree” 并通过人机验证，代理没有代为操作；未读全文的几篇见 originals-pass.json（ST 1991-07-06、2001-12-14、1984-01-22、1998-02-14，TNP 1997-05-17，以及 1966 年 8 月、1988 年 4 月、1954 年 5 月、1967 年 3 月的报道）。

## 1. 课纲、范围、立场、必须讲对的事实

### 1.1 课纲原文（S1：MOE CPDD，*2020 Social Studies Teaching and Learning Syllabus, Primary*，封面 "Updated as of January 2024"，印刷页码；研究 syl-01–syl-11）

- **第 33 页**（标题与探究问题）：P5 Part 1 "Understanding Singapore's Development as a Nation"（2022 年起实施）；Inquiry Focus："Part 1: How has Singapore developed as a nation since her independence?"
- 第 33 页 Level Descriptor："Students will learn that our national identity can be built through National Symbols, national events and places in Singapore."
- 第 33 页 Key Understandings："Our National Symbols, national events and places in Singapore help to build our national identity." · "Different people have contributed to the building of Singapore's defence." · "People from different groups have contributed to the building of social cohesion in Singapore."
- 第 33 页 Knowledge Outcomes（Part 1 的四条）："describe the significance of the National Symbols of Singapore" · "analyse how the National Symbols, national events and places in Singapore help to build our national identity" · "describe how different people contributed to Singapore's defence" · "evaluate how people from different groups contributed to the building of social cohesion in Singapore"
- 第 33 页 Key Concepts（Part 1）："Nation-building" · "Contributions"
- **第 34 页** Content 第 1 栏："Our National Symbols and their significance"——依次为 National Flag、State Crest、National Anthem、National Pledge、The Lion Head symbol、National Flower、"The Public Seal"；之后 "National events"、"Places in Singapore"（没有细目）。
- 第 34 页 Content 第 2 栏："Building of the Singapore Armed Forces"（含 Dr Goh Keng Swee 的贡献）· "Creating a citizens' army through National Service (NS)" · "Implementation of NS in 1967" ·（NSmen 的共同经历）· "Contributions of NSmen in the Singapore Armed Forces, Singapore Police Force and Singapore Civil Defence Force"
- **第 35 页** Content："Race riots in 1964" ·（building social cohesion：learning in harmony、living in harmony）· "Contributions of Mr Sinnathamby Rajaratnam" · "Contributions of Mr Othman Wok"
- 第 34–35 页 Guiding Questions："What contributes towards our national identity?" · "How have different people contributed to the building of Singapore's defence?" · "How have people from different groups contributed to the building of social cohesion in Singapore?"
- 第 37–38 页的实地考察与表现任务属于 Part 2（东南亚），不属于 Part 1。课纲除 1964、1967 外不点任何日期，不提经济、经济发展局、双语政策、公积金、东盟（Part 2）、内部安全法令。
- **CCE 课纲**（S2，印刷页 29）："NE Commemorative Days (Total Defence Day, International Friendship Day, Racial Harmony Day, National Day)"——SS 课纲本身不提这些日子。
- 2024 年 7 月更新版的链接 404（docs/17 §8.1-2），差异未知。

对应：课纲核心 = 第 01 章（建军、国民服役、吴庆瑞、NSmen）、第 02 章（七个国家象征、国家事件、地方）、第 05 章（1964 年回顾、学习与生活中的和谐、拉惹勒南、奥斯曼渥）。延伸 = 第 03 章（对抗结束、东盟一拍、全面防卫）、第 04 章（英军撤离与就业）、第 06 章（代价与争论、四个纪念日）。

### 1.2 范围、读者、立场与口吻

- 时段：1965 年 8 月 9 日至 2023 年 8 月；主体是 1965–1971 年，象征、语言、纪念日几条线延伸到今天。地域：新加坡岛；区域视图只为对抗结束与东盟成立两拍（雅加达、曼谷）。
- 读者：小学高年级学生和家长。每章正文 EN 200–260 词 / ZH 350–450 字，3–4 段，细看 2–4 块（同 docs/28，比 docs/34 长一档）。
- **立场（最高优先级）**：
  - **不写建国神话**：不写"奇迹""从第三世界到第一世界""先辈们披荆斩棘""我们的国家 / 我国"。写谁做了什么、为什么、谁同意、谁反对、付了什么代价。
  - **不写成执政党的功劳簿，也不写成控诉**：政府的理由用政府自己的话（注明是谁、哪一年说的），反对者的话用反对者自己的话，史家的判断注明是哪位史家；不加评价词。
  - **不用"我们 / 敌人"**：印度尼西亚、马来西亚、英国都用国名；"对抗"时期写"印度尼西亚针对马来西亚的对抗"。
  - **国民服役不写成光荣叙事**：写为什么要、怎么做、谁去了、多长时间、有人反对和拒绝；课纲要求的"NSmen 的贡献"照写，用事实（谁在哪支部队服役），不用口号。
  - **多元视角**：马来、华、印度和其他族群；讲英语的和受华文教育的；家里讲方言的祖父母一代；被拘留者；工会；邻国政府。篇幅按历史分量。
  - **数字**：每个 `<Num s>`；来源冲突列两个、各带来源（§0-7）。
- 用词表：

| 不写 | 写 | 说明 |
|---|---|---|
| 新加坡被踢出马来西亚 | 新加坡脱离马来西亚，成为独立国家 | 同 docs/28；两边说法已在 1819–1965 第 11 章 |
| 我们的国民服役 / 保家卫国的男儿 | 国民服役；全职服役的男青年；战备军人（NSmen） | 名词表 `national-service`、`nsman` |
| 新加坡经济奇迹 / 一穷二白 | 失业率 1966 年 8.9 %，1973 年 4.5 %（政府数字） | 写数字和来源 |
| 敌人（指印尼） | 印度尼西亚；对抗时期 | 名词表 `konfrontasi` |
| 共党分子 / 马克思主义阴谋分子（作定论） | 被政府指为……的人；政府称这是"马克思主义阴谋" | 引号 + 注明说话人 |
| 烈士 / 受害者（指被拘留者） | 被拘留的人；被捕者 | 两边都不加评价 |
| 方言被消灭 / 华语取代方言 | 方言节目停播；在家主要讲方言的家庭从 76 % 降到 48 %（1980–1990） | 写数字、写李光耀自己的话 |
| 邪教（指耶和华见证人） | 耶和华见证人（1972 年被撤销注册） | |
| 逃兵 / 拒服兵役者 | 因宗教理由拒绝服役的人 | |
| 国民服役从 1967 年《征兵法令》开始 | 1967 年《国民服役（修正）法令》；《征兵法令》是 1970 年的另一部法律 | 研究 ★ 更正 |
| 第一批 9,000 人入伍 | 约 9,000 人登记，约 900 人开始全职服役 | 研究 ★ 更正 |
| 六个国家象征 | 七个（含公共印章）；没有"国服" | 研究 ★ 更正 |
| 兰花（指新加坡国花） | 胡姬（花）；卓锦万代兰 | 新加坡用法 |

### 1.3 必须讲对的事实（施工时每条配 `<Num>` / `sources`；方括号是研究的来源 id，圆括号是研究的事实 id）

★ = 研究纠正了 brief 的前提；⚑ = **二手陈述，要取原文**（Sonnet F 步，§8）；〔待核〕 = 研究没有查到。

| # | 事实 | 写法 | 来源 | 争议与注意 |
|---|---|---|---|---|
| F1 | **独立时的武装力量** | 1965 年 8 月 9 日，新加坡只有两个步兵营（约 50 名军官、1,000 名士兵）、两艘船，没有空军；1965 年 8 月设内政与国防部（MID） | [MINDEF-HIST]；[SG101-WITHDRAW]（ns-04） | 海军："two ships"（MINDEF）对"two wooden hull boats"（SG101），细看两说并列 |
| F2 | **吴庆瑞** | 第一任内政与国防部长；说服以色列派人协助训练（其他国家婉拒之后）；1965–1967 年任国防部长，1970 年 8 月辞去财政部长、再任国防部长；被称为"建军之父" | [SG101-WITHDRAW]；[MINDEF-HIST]；[ZB-GKS]（ns-04、ns-05） | ⚑ [ZB-GKS] 是付费文章，只读了导语。1819–1965 第 11 章内阁表写他 1965 年 8 月 9 日任"国防与安全部长"——与 MINDEF 的 "Minister for the Interior and Defence" 核对官方职称，两个主题写成一致（Opus T 步） |
| F3 | **SAFTI** | 1966 年 2 月 14 日在巴西拉峇军营成立（首期教官预备课程 60 名精选军官与士官）；6 月 18 日吴庆瑞主持开幕；11 月 18 日首批 150 名班长结业；1967 年 7 月 16 日首次授衔（117 名军官学员）；1995 年迁往裕廊新校园 | [SAFTI-HIST]（ns-07） | ★ 巴西拉峇是军官学校，**不是**第一个国民服役营 |
| F4 | **1967 年的法律** ★ | 《国民服役（修正）法令》：2 月 27 日一读，**3 月 14 日**通过；《征兵法令》（Enlistment Act）是 **1970 年**的另一部法律，"使国民服役固定下来" | [MINDEF-HIST]；[SG101-WITHDRAW]；[ROOTS-NS]；[MINDEF-SPEECH24]；[SSO-EA1970]（ns-01） | 通过日 14 日（MINDEF、SG101、Roots）对 17 日（BiblioAsia）——17 日可能是生效日（推测，不写进正文）；细看两说并列 |
| F5 | **登记** | 1949 年 1 月 1 日至 6 月 30 日出生的男子，1967 年 3 月 28 日至 4 月 18 日登记；不登记可判监最多六个月、罚款 2,000 元或两者兼施 | [ROOTS-NS]；[MINDEF-HIST]（ns-03） | 登记站：加冷、加东、实龙岗、武吉班让（Roots）对 加东、实龙岗、武吉班让 + 中央人力基地（MINDEF）；正文不列站名 |
| F6 | **第一批** ★ | 约 9,000 人登记；约 900 人（3 营、4 营各 450 人）**1967 年 8 月 17 日**在 Taman Jurong 军营开始两年全职服役，9 月 11 日正式训练；其余人在人民卫国军、志愿特警团、特别警察部队部分时间服役 | [MINDEF-HIST]；[PMO-TJ]；[BIBLIO-NS]（ns-02） | BiblioAsia 写成"9,000 人 8 月 17 日入伍"，MINDEF、SG101 说 9,000 是登记人数——正文用后者，细看说明。Roots 把出生区间写成"7 月 30 日"（笔误） |
| F7 | **Taman Jurong 军营** | 几座裕廊镇管理局的五层一房式组屋被匆忙改成营房；1966 年人民卫国军在此成立；1968 年 3 月 2 日结业检阅（林金山）；今天是邻里公园 Taman Jurong Greens，2017 年 8 月 6 日立历史标记 | [PMO-TJ]；[ROOTS-TJCAMP]（ns-08） | 军营何时停用〔待核〕，不写 |
| F8 | **社会的态度** | MINDEF："大多数人一向看低当兵"；1967 年 3 月 17 日有反对国民服役的抗议，"不如 1954 年的骚乱严重"；1954 年 5 月 13 日约 500 名华校男女学生抗议国民服役法令；到 1972 年约九成中学有学生军团 | [MINDEF-HIST]；[BIBLIO-NS]；[SG101-WITHDRAW]（ns-09） | 研究 S8：1954 年只写"抗议""冲突"，不写死亡（研究没有找到死亡记录）；Roots 的"26 人受伤、45 人被捕"⚑ 取原文后才印 |
| F9 | **建军到 1971 年** | 1965 年新加坡志愿军改称人民卫国军；1966 年海军志愿部队（三艘船）；1967 年 5 月 5 日海军旗；1968 年空防司令部（8 架塞斯纳 172-H 教练机）；1968 年 12 月海事司令部；1970 年内政与国防部分为国防部和内政部；1971 年英国空军基地交给空防司令部 | [MINDEF-HIST]（ns-06） | 单一来源（MINDEF） |
| F10 | **武装部队日与 1969 年国庆** | 1969 年 7 月 1 日在惹兰勿刹体育场举行第一个武装部队日（1,500 名军人），1972 年起称新加坡武装部队日；1969 年国庆检阅首次出现坦克和装甲车 | [SG101-SAFDAY]；[SG101-WITHDRAW]（ns-11） | |
| F11 | **拒绝服役** | 法律没有因良心或宗教拒服兵役的例外；1972 年 1 月 14 日耶和华见证人被撤销注册，政府理由是"有损公共福利与秩序"；美国国务院报告：2023 年有 11 名（2022 年 14 名）耶和华见证人因宗教理由拒绝服役被关在武装部队拘留所 | [USDOS-IRF23]；[WIKI-JW]（ns-10） | ⚑ 1972 年日期来自维基百科，政府理由与人数来自美国政府报告（经 ecoi.net 镜像）：要找政府公报 / 内政部 / 国会原文；报告原文到 state.gov 取。核不到新加坡政府来源就只写"法律没有例外"一句（§0.1-3） |
| F12 | **七个国家象征** ★ | 《2022 年国家象征法令》（2022 年第 29 号）列明七个：国旗、国歌、信约、国徽（也可称 State Crest）、公共印章、狮头标志、国花；2023 年 8 月 1 日生效，取代 1959 年的法令；**没有国服** | [BILL21]；[NHB-FLAG]；[MCCY-SYM]（sym-01） | 文化、社区及青年部网页仍写"六个"（不含公共印章），法令和课纲是七个——细看说明。法案 2022 年 8 月 2 日一读；国会通过日〔待核〕 |
| F13 | **1959 年的旗、徽、歌** | 1959 年 11 月 18 日立法议院通过，12 月 3 日在尤索夫伊萨就任元首的典礼上（政府大厦）启用；杜进才领导的委员会设计；1965 年独立后成为国旗、国徽、国歌（1959 年称邦旗、邦徽、邦歌） | [NHB-FLAG]；[MCCY-SYM]；[SMD-PLEDGE]（sym-02） | 搜索摘要里的 11 月 11 日 / 30 日不用；画旗的艺术家 Joseph Teo 中文名〔待核〕，不写也可 |
| F14 | **国旗的意义** | 红色：普世的友爱与平等（2022 年法令）；白色：纯洁与美德；新月：一个正在上升的年轻国家；五颗星：民主、和平、进步、正义、平等 | [BILL21]；[NHB-FLAG]（sym-03） | NHB 旧写法 "universal brotherhood and equality of man"；2022 年改为性别中性（法案说明）。正文用法令写法，细看并列（§0-10） |
| F15 | **国徽** | 狮子代表新加坡，老虎代表新加坡与马来西亚的历史渊源；格言 Majulah Singapura | [NHB-CREST]（sym-04） | |
| F16 | **国歌** | 朱比赛 1958 年为市议会作曲（维多利亚剧院重开）；1959 年 12 月 3 日作为国歌演奏；应杜进才要求缩短；2001 年 1 月 19 日推出重新编曲版；官方华文译名《前进吧，新加坡！》 | [NHB-ANTHEM]（sym-05） | 朱比赛、杜进才的写法〔待核〕（早报） |
| F17 | **信约怎么写成** ★ | 1965 年 10 月教育部的 William Cheng 提议；教育部长王邦文请 Philip Liau、George Thomson 起草两稿；1966 年 2 月拉惹勒南寄回改写稿；教育部官员与李光耀再修改；内阁批准；1966 年 8 月 24 日约 50 万名学生在 529 所学校首次每日诵读 | [NHB-PLEDGE]；[NAS-PLEDGE60]；[SMD-PLEDGE]；[ZB-PLEDGE1/2]（sym-06） | NLB "The National Pledge is taken" 说"1965 年 8 月 9 日独立后不久写成"，NAS、NHB 不支持；早报 2026 年说两封信是"1966 年 8 月"——用 NAS 的 1965-10 / 1966-02 / 1966-08。William Cheng、Philip Liau、George Thomson 的中文名〔待核〕，写原文 |
| F18 | **信约的措辞** | 早期稿"forget differences of race, language and religion"，今天诵读的是"regardless of race, language or religion"；官方华文："我们是新加坡公民，誓愿不分种族、言语、宗教，团结一致，建设公正平等的民主社会，并为实现国家之幸福、繁荣与进步，共同努力。" | [SG101-PLEDGE]；[NHB-PLEDGE]；[SMD-PLEDGE]（sym-07） | 研究 S10：两句并排给读者看，不评价 |
| F19 | **诵读姿势** | 1988 年起改为右手握拳放在心口（此前举右手），国防部希望统一姿势 | [NHB-PLEDGE]；[NLB-PLEDGE]（sym-08） | NHB 写 1988 年，NLB 写 1988 年 6 月 27 日；⚑ 3 月 11 日一说只见于搜索摘要，不用 |
| F20 | **狮头标志** | 1986 年由当时的通讯及新闻部推出，供人民和企业自由使用；中选设计者 Michael Lee 把设计送给国家；鬃毛五道分界代表五个理想 | [NHB-LION]（sym-09） | 日期只到年 |
| F21 | **国花** | 1981 年 4 月 15 日文化部长丹那巴南宣布卓锦万代兰为国花；委员会从 40 种花（30 种是胡姬）中选；1893 年由艾妮丝·卓锦培育 | [NHB-FLOWER]；[BILL21]；[SMD-VANDA]；[SMD-ORCHID]（sym-10） | 丹那巴南写法〔待核〕；用"胡姬"不用"兰花" |
| F22 | **公共印章** | 国徽外环"Republic of Singapore"字样；由总统保管，盖在重要的国家文件上 | [NHB-SEAL]；[BILL21]（sym-11） | 采用年份没有找到；"公共印章"〔待核〕 |
| F23 | **第一个国庆日** | 1966 年 8 月 9 日，尤索夫伊萨总统在大草场主持检阅；约 23,000 人从政府大厦出发，经牛车水游行到丹戎巴葛 | [ROOTS-NDP]（place-ndp-01） | 此后逐年场地没有核，不做图层 |
| F24 | **英军撤离** | 1967 年 7 月 18 日英国宣布 1970 年代中期撤军；1968 年 1 月 16 日提前到 1971 年 3 月底（后延到 12 月）；大部分部队 1971 年 10 月前撤离；最后一名英军 1976 年 3 月离开 | [NLB-BRIT]；[SG101-WITHDRAW]（yrs-01） | 1 月 16 / 17 日（宣布日 / 见报日，推测），正文写 16 日 |
| F25 | **基地的分量** ★ | 基地占国民生产总值两成以上；工作：约 2.5 万名基地工人 1971 年会失业（NLB 英军撤离条目）对 3 万名文职雇员加 1 万名家佣、预计一半失业（NLB 劳资关系条目） | [NLB-BRIT]；[NLB-IRA]（yrs-02） | 研究 S9：正文写"数以万计"并在细看并列两组数字；CIA 备忘录的 5.4 万只见于搜索摘要，不用 |
| F26 | **失业与增长** | 1966 年失业率 8.9 %，1973 年 4.5 %；1966–1973 年实际 GDP 年均增长约 13 %（政府数字）；1965 年失业率"接近 9 %"（MAS 讲稿，只作核对） | [SG101-E70]；[MAS-MENON]（yrs-04） | 1959 年失业人数 20 万 / 14 %（Roots）对 4.6 万（NLB）→ 正文写"两位数的失业率"（SG101）；制造业占比 14 % 对 19 % → 不印（§0-7）。MAS 讲稿含虚构的未来情节，只引 1965 年的句子 |
| F27 | **工业化** | 1961 年成立经济发展局（联合国专家团，温思敏）；裕廊（链到 land-use）；1967 年《经济扩展奖励法令》（最多 15 年、最多 90 % 的税务减免）；1968 年美国国家半导体考察后两周内就开工；到 1960 年代末裕廊有 181 家工厂开工、约 2 万名工人 | [SG101-E59]；[SG101-E65]；[ROOTS-JURONG]（yrs-05–yrs-07） | 裕廊数字只有 Roots 一个来源；"温思敏"〔待核〕 |
| F28 | **1968 年劳工法令** | 1968 年 7–8 月通过《雇佣法令》和《劳资关系（修正）法令》；政府说要"把管理权还给雇主"、吸引投资，并举出 1960–1967 年因停工损失 1,284,029 个工作日；两名国会议员（职总领袖）对限制劳资仲裁庭表示关注 | [NLB-IRA]（yrs-08） | 研究 S5：写法律做了什么、政府的理由、国会里的关注，不评价；两部法令的确切通过日〔待核〕；中文法令名〔待核〕 |
| F29 | **1968 年大选** | 1968 年 4 月，社会主义阵线抵制大选，58 席中只有 7 席有竞选，人民行动党赢得全部议席，提名日当天已能组织政府 | [NLB-BRIT]（yrs-09） | 研究 S5：只写抵制和结果，不加评语 |
| F30 | **公积金与组屋** | 1968 年 9 月起公积金可用来买组屋 | [BIBLIO-CPF]（home-01） | 一句，链到 land-use 第 01–02 章 |
| F31 | **双语政策** | 1959 年起；1960 年小学、1966 年中学第二语文必修；1965 年宪法第 153A 条定英、马来、华、泰米尔四种官方语文；1966 年小学离校考试考第二语文；1978 年《吴庆瑞报告书》：1975–77 年六成以上考生一科或两科语文不及格，85 % 华族学生在家讲方言；1979 年特选学校；1987 年起所有学校以英文为第一语文（特选学校除外） | [NLB-BILING]（lang-01、lang-02） | NLB 讲华语运动条目说政府 1966 年"决定采用双语政策"——同一机构的两种说法，1966 是中学这一步；特选计划 1978 / 1979 两说，用 1979 |
| F32 | **讲华语运动与方言** | 1979 年 9 月 7 日李光耀发起；在家主要讲方言的家庭 1980 年 76 %、1990 年 48 %，讲华语的从 13 % 到 30 %；李光耀 2009 年说"1979 年起关掉电台、电视所有方言节目"，又说"我理解人们对母语的深厚感情"；他说若以华语为共同语，非华族的人会处于不利，族群不会团结 | [NLB-SMC]；[SMD-SMC]；[NAS-LKY09]（lang-03–lang-05） | 研究 S6：用李光耀原话、注明 2009 年；方言节目停播的具体年份二手资料说法不一（1978、1981、1982、1983），只写"据李光耀，从 1979 年起"；不泛论"人们的感受" |
| F33 | **奥斯曼渥** | 1954 年因认同多元种族政策加入人民行动党；1964 年出席行动党召开的马来人大会后被巫统活跃分子斥为"叛徒"；1963–1977 年任社会事务部长；1966 年《回教法执行法令》；1968 年成立回教理事会 | [NLB-OTHMAN]；[NLB-1964]；[ZB-OTHMAN]（harm-05、harm-02） | 两部法令、机构的中文正式名〔待核〕；《回教法执行法令》通过日〔待核〕 |
| F34 | **拉惹勒南** | 第一任外交部长（到 1980 年）；代表新加坡签署《东盟宣言》；1966 年信约的主要起草人 | [NLB-RAJ]（harm-05） | |
| F35 | **种族和谐日** | 每年 7 月 21 日；1997 年随国民教育推出（国民教育 1997 年 5 月 17 日由副总理李显龙推出）；纪念 1964 年 7 月 21 日开始的骚乱 | [NLB-RHD]；[NLB-NE]；[SMD-RHD]；[NLB-1964]（rhd-01） | ⚑ 1998 一说（MOE 2012 新闻稿、SG101，只见于搜索摘要），找到原文就两说并列，找不到在细看写"也有资料写 1998 年" |
| F36 | **四个纪念日** | 全面防卫日（2 月 15 日）、国际友谊日（第二学期第三个星期五）、种族和谐日（7 月 21 日）、国庆日（8 月 9 日） | [MOE-CCE]；[NLB-NE]（rhd-02、syl-11） | |
| F37 | **1969 年** | 1969 年 5 月 31 日起七天的冲突，新加坡政府记录四人死亡、约 80 人受伤；起因是 5 月 13 日吉隆坡骚乱的波及 | [SG101-RIOTS]；[SG101-RHD22]（harm-03） | 研究 S2：**只有政府一个来源**，正文不写，细看一句并注明；⚑ 查 1969 年 6 月的报纸（NewspaperSG）；网上"36 死、3,000 人被捕"是 1964 年的数字，不用；不画事件 |
| F38 | **1964 年回顾** | 7 月：23 人死、454 人伤；9 月：13 人死、106 人伤；两国政府说法不同（行动党指巫统活跃分子预谋，敦拉萨说是自发冲突） | [NLB-1964]；[SG101-RHD22]（harm-01、harm-04） | 研究 S1：**不重讲**；数字与 1819–1965 第 11 章逐字一致，一句话 + 链接 |
| F39 | **对抗结束** | 1966 年 8 月 12 日敦拉萨与印尼外长马立克在雅加达批准和平协议；对抗期间新加坡发生多起爆炸，共 7 死 50 伤；1967 年 9 月 7 日新加坡与印尼正式建交 | [NLB-KONF]（reg-01） | ⚑ 美国国务院 FRUS 文件（d218）说 8 月 11 日在曼谷签署，只见于搜索摘要——取原文后两说并列；麦唐纳大厦（3 死 33 伤）已在 1819–1965 第 11 章，研究 S12：链接不重讲 |
| F40 | **东盟** | 1967 年 8 月 8 日在曼谷成立，五个创始国（印尼、马来西亚、菲律宾、新加坡、泰国），拉惹勒南代表新加坡签署；后来文莱 1984、越南 1995、老挝与缅甸 1997、柬埔寨 1999 年加入 | [ASEAN-FOUND]；[NLB-ASEAN]（reg-02） | 只一拍；东帝汶 2025 年入盟只见于 docs/17，研究没有原文——不写，或 Sonnet 取东盟秘书处原文后写 |
| F41 | **全面防卫** | 1984 年 1 月 22 日宣布，五大支柱：军事、民事、经济、社会、心理；2019 年加数码防卫 | [WIKI-TD]；[SMD-TD]（td-01） | ⚑ 1984 年日期来自维基百科转引 1984 年 1 月 22 日《海峡时报》——取 NewspaperSG 原文 |
| F42 | **全面防卫日** | 2 月 15 日，纪念 1942 年新加坡沦陷；从哪年开始：1984（Home Team NS、语委会）对 1997 年 5 月 17 日列入学校纪念日、1998 年首次全国纪念（维基百科转引《新报》《海峡时报》） | [HOMETEAM-TD]；[SMD-TD]；[WIKI-TD]（td-02） | ⚑ 取 1997-05-17《新报》、1998-02-14《海峡时报》原文；两说可以同时成立（1984 年已有、1997–98 推广到学校），细看照实写，不替来源下结论；研究 S11：一句话 + 链到 ww2 `fall-of-singapore` |
| F43 | **光谱行动：政府的说法** | 1987 年 5 月 21 日 16 人、6 月 6 人，共 22 人依《内部安全法令》被拘留，未经审判，拘留期一个月到三年；政府称这是利用教会等团体、以共产党统战手法颠覆政治与社会秩序的"马克思主义阴谋"，点名陈华彪为主谋、Vincent Cheng 为主要助手 | [NLB-SPECTRUM]；[NAS-JAYA87]（cost-01） | 研究 S3：只点政府点名的两人；陈华彪、Vincent Cheng 中文名〔待核〕 |
| F44 | **光谱行动：另一方的说法** | 1988 年 4 月九名获释者发表声明，指拘留期间受虐、否认有阴谋；其中八人再被捕，后来签署法定声明撤回；1989 年 1 月修改《内部安全法令》，限制司法审查；史家滕布尔（Turnbull）、巴尔（Barr）认为"阴谋"站不住；尚达曼 2001 年说多数人是"社会活动者"；黄锦西（Walter Woon）1991 年说政府的指控"仍未证实"；张素兰 2010 年出版回忆录 | [NLB-SPECTRUM]；[WIKI-SPECTRUM]（cost-02） | ⚑⚑ **除 NLB 的部分外全部是维基百科转引**：取原文——《海峡时报》2001-12-14（尚达曼）、1991 年（黄锦西）、Barr 2010（*Critical Asian Studies* 42(3)）、Turnbull 2009 第 339 页、1988 年声明全文、张素兰《Beyond the Blue Gate》。取不到原文的那一句不印。NLB 说 1988 年的声明"后来被揭露是政治伎俩"——这是政府一方的说法，照引并注明。黄锦西、张素兰、尚达曼的中文写法〔待核〕 |
| F45 | **报业** | 1971 年 5 月 2 日《南洋商报》四名高层依《内部安全法令》被拘留，政府指该报"美化共产制度""煽动种族情绪"，6 月四人都发誓章否认先前的认罪；1971 年 5 月 28 日《新加坡先驱报》执照被吊销；1974 年 8 月 28 日通过《报章与印刷新闻业法令》，1975 年 1 月 1 日生效；1986 年修正限制外国刊物（政府说是防止"偏颇报道"，外国报刊批评说"走向威权"）；1984 年 11 月 27 日新加坡报业控股成立 | [NLB-NSP]；[WIKI-NPPA]；[NLB-NPPA86]（cost-03） | 研究 S4；⚑ 1974 年日期来自维基百科信息框，取 SSO / NLB 原文；法令中文名〔待核〕；《先驱报》一事只有 NLB 摘要，⚑ 取当年记录 |

**没有用、也不要从记忆补的**：国家体育场开幕日期与在那里办国庆检阅的年份（研究没查；Sonnet 查到原文才加 `site` 或 `milestone`，否则不画）；国庆检阅逐年场地；警察部队、民防部队开始国民服役的年份（课纲要求写 NSmen 在这两支队伍服役，但研究没有年份：正文写"今天也在警察部队和民防部队服役"，不写年份，除非 Sonnet 取到原文）；1965 年人口。

### 1.4 争议与两边写（汇总，各章细看照此写）

| 争议 | 一边 | 另一边 | 写法 |
|---|---|---|---|
| 1968 年劳工法令（第 04 章） | 政府：恢复雇主的管理权、吸引投资、停工损失 128 万个工作日 [NLB-IRA] | 职总出身的议员在国会关注劳资仲裁庭受限 [NLB-IRA] | 法律做了什么 → 政府的理由 → 国会里的关注；之后的失业率是政府数字，不写"因此成功" |
| 1968 年大选（第 04 章） | — | — | 只写社阵抵制、7 / 58、行动党全胜，不写原因、不写评价 |
| 方言（第 05 章） | 李光耀 2009：不引导的话会讲"混杂的福建—潮州话"；以华语为共同语会让非华族不利 [NAS-LKY09] | 方言节目停播、在家讲方言的家庭减少；李光耀同一篇讲话承认"对母语的深厚感情" [NLB-SMC]、[NAS-LKY09] | 用原话与数字，不概括"祖孙之间无话可说"之类的感受（研究 S6） |
| 拒绝服役（第 01 章） | 政府：法律没有例外；1972 年撤销注册的理由是"有损公共福利与秩序" [USDOS-IRF23] | 耶和华见证人以宗教理由拒绝服役、信约、国歌；2023 年 11 人在拘留所 [USDOS-IRF23] | 一个细看，两句话，注明来源是美国政府报告（核到新加坡来源再加） |
| 报业（第 06 章） | 政府：美化共产主义、煽动种族情绪；1986 年防止偏颇报道 [NLB-NSP]、[NLB-NPPA86] | 四人发誓章否认认罪；外国报刊批评"走向威权" [NLB-NSP]、[NLB-NPPA86] | 并列 |
| 光谱行动（第 06 章） | 政府：马克思主义阴谋 [NLB-SPECTRUM]、[NAS-JAYA87] | 1988 年声明、史家与后来官员的话 ⚑ | 并列；"政府说 / 被拘留者说 / 史家看法不一"；原文取不到的那一句删掉 |
| 1964 年（第 05 章回顾） | 行动党：巫统活跃分子预谋 | 敦拉萨：自发冲突 | 同 1819–1965 第 11 章，一句话 + 链接 |

### 1.5 沉重与敏感内容

研究的 12 行表（S1–S12）逐条落在 §1.3（F8、F11、F25、F28–F29、F32、F35、F37–F39、F42–F45）。本主题没有屠杀段落；死伤数字只有 1964（回顾）、1969（一句）、对抗爆炸（回顾）。**同一套写法**：伤亡带来源；被拘留者与政府用同样中性的动词（"拘留""说""否认"）；不配图；中文稿 Gavin 亲审（§0.2）。章节 `sensitive: true`：01、04、05、06。`sensitivity: open`。

---

## 2. 章节计划（背景章 + 6 章）

### 2.1 总表

`cam` = `[lng, lat, zoom]`。三档：区域 4.2–5.0（雅加达—曼谷）、全岛 10.2–10.6、城区 13.2–14（`maxZoom: 14`；岛尺度海岸在 9.4–9.6 渐入，镜头取 ≤ 9.3 或 ≥ 9.6）。巴西拉峇附近镜头 ≤ 11.5（§0-4）。`layers` 默认 `base, control, battles, sites`；第 04 章加 `industrial-estates`；**不写 `borders`**。控制区全是空帧，没有"`t` 对应哪一帧"的问题；校验列只查高亮事件不晚于章 / 拍的 `t`。

| # | id | 标题 EN / ZH | t | cam | 章节 hl | 校验 |
|---|---|---|---|---|---|---|
| 00 | background | 9 August 1965: a new country / 1965 年 8 月 9 日：一个新国家 | （`state.time` 1965-08-09） | 103.82, 1.36, 10.2 | —（见 §4 V4） | = K1 |
| 01 | defence | An army from scratch, 1965–1971 / 从零建军（1965–1971） | 1966-02-14 | 103.70, 1.335, 11.2 | `safti-founded-1966` | ≥ 背景 |
| 02 | symbols | Flag, anthem, Pledge: the national symbols / 国旗、国歌、信约：国家象征 | 1966-08-09 | 103.852, 1.290, 13.8 | `first-national-day-1966` | 拍到 2023-08-01 |
| 03 | neighbours | Neighbours and Total Defence / 邻国与全面防卫 | 1966-08-12 | 104.5, -1.5, 5.0 | `konfrontasi-ends-1966` | 拍到 1984 |
| 04 | british-withdrawal | The British leave: finding jobs, 1967–1971 / 英军撤离：找工作（1967–1971） | 1967-07-18 | 103.80, 1.40, 10.4 | `british-withdrawal-announced-1967` | 拍到 1971-10 |
| 05 | living-together | Living together: languages and harmony / 和谐共处：语言与种族和谐 | 1968 | 103.851, 1.290, 13.4 | `muslim-law-act-1966` | 高亮 1966 ≤ 1968 |
| 06 | costs-and-national-day | Costs, debates and National Day / 代价、争论与国庆日 | 1971-05-02 | 103.82, 1.36, 10.2 | `press-detentions-1971` | 拍到 2023-08-09 = K2 |

阅读说明（背景章 `state.note`）草稿：

- EN "**Whose story.** Singapore's leaders and government, soldiers and national servicemen, workers and union leaders, families who spoke dialects at home, people detained without trial, and the governments of Malaysia, Indonesia and Britain. Where they disagree, both accounts are given and the source is named. **Numbers.** Every number opens its source; when sources differ, both are shown. **The map.** Coasts change with the years (from satellite images after 1973, approximate). Places are points read from Wikidata; laws are marked at the Parliament building of the time, and nationwide decisions at the centre of the island, which only means 'everywhere'. Army camps are shown only where the place is public: the first National Service camp is today a park, and SAFTI is one point. **Other topics.** The 1964 riots and separation are told in *Singapore, 1819–1965*; housing, Jurong and reclamation in *Singapore's land*."
- ZH "**讲谁的故事**：新加坡的领导人和政府、军人与国民服役人员、工人与工会领袖、在家讲方言的家庭、未经审判被拘留的人，以及马来西亚、印度尼西亚、英国政府。说法不同的地方两边都写，并注明出处。**数字**：每个数字都能点开来源；来源不一致时两个都列。**地图**：海岸线随年份变化（1973 年以后取自卫星影像，近似）。地点是从维基数据读出的点；法律标在当年的国会大厦，全国性的决定标在岛的中心——那只表示'全国'。军营只标公开的地方：第一个国民服役营地今天是公园，军训学院只画一个点。**别的主题**：1964 年骚乱与分家见《新加坡 1819–1965》；组屋、裕廊与填海见《新加坡的家、粮、路》。"

### 2.2 各章

格式同 docs/28 / 34：**正文要点 → 细看 → 节拍（字幕 EN / ZH 草稿，日期开头、描述地图）→ 事件**。字幕里的每个数字在 §1.3 有来源。镜头写在每拍里。

#### 00 background · 1965 年 8 月 9 日：一个新国家

- `summary`：EN "On 9 August 1965 Singapore became an independent country with two infantry battalions, British bases on its soil, and the riots of 1964 still recent." / ZH "1965 年 8 月 9 日，新加坡成为独立国家：只有两个步兵营，岛上还有英国基地，1964 年的骚乱刚过去不久。"
- 正文：①1965 年 8 月 9 日脱离马来西亚（一句，`<TopicLink slug="singapore-1819-1965" ch="separation">` 讲为什么、两边怎么说；第一届内阁也在那里）。②新国家面对的三个问题，也是本主题的三条线：**怎样保卫自己**（F1：两个营、没有空军；对抗还没结束；英军还在）；**怎样谋生**（F26：失业率接近一成；英军基地是许多人的饭碗）；**怎样成为一国人**（多种族、多语言、多宗教；1964 年骚乱；1959 年的旗、徽、歌 F13）。③这个主题怎么读（地图上的点、链到另外三个主题）。
- 细看：①**这个主题和另外三个主题**（一张表：1819–1965 第 11 章 = 骚乱、分家、第一届内阁；土地利用第 01–02 章 = 组屋与居者有其屋、第 02 章 = 裕廊与裕廊镇管理局、第 04 章 = 樟宜机场与地铁、第 05 章 = 填海；ww2 第 07 章 = 1942 年 2 月 15 日）；②**数字为什么常常有两个**（以 1959 年失业人数、基地工作为例，F25、F26）。
- 节拍（4）：
  1. 1965-08-09 · 全岛（103.82, 1.36, 10.2；hl `separation-1965`）。EN "9 August 1965: Singapore leaves Malaysia and becomes an independent country. The marker is City Hall." ZH "1965 年 8 月 9 日：新加坡脱离马来西亚，成为独立国家。标记在政府大厦。"
  2. 1965-08-09 · 区域（105.0, 2.5, 5.0；无高亮）。EN "August 1965: Indonesia's Konfrontasi against Malaysia, which had brought bombs to Singapore, has not yet ended." ZH "1965 年 8 月：印度尼西亚针对马来西亚的对抗还没有结束，新加坡也曾因此遭到炸弹袭击。"
  3. 1965-08-09 · 北部（103.84, 1.40, 10.6；hl `singapore-naval-base`、`site-seletar-airbase`、`site-tengah-airbase`、`site-sembawang-airbase`、`site-changi-airbase`）。EN "1965: British forces still hold a naval base and four airfields on the island; Singapore's own forces are two infantry battalions, with no air force." ZH "1965 年：英军仍驻守岛上的海军基地和四个机场；新加坡自己只有两个步兵营，没有空军。"
  4. 1965-08-09 · 城区（103.852, 1.290, 13.8；hl `site-city-hall`、`site-victoria-theatre`）。EN "The flag, crest and anthem first used at City Hall in 1959 become the new country's national symbols." ZH "1959 年在政府大厦首次启用的旗、徽、歌，成为新国家的国家象征。"

#### 01 defence · 从零建军（1965–1971）

- `summary`：EN "With no army of its size and the British planning to leave, Singapore set up an officer school in 1966 and began National Service in 1967." / ZH "没有足够的军队，英军又要撤走，新加坡 1966 年办起军官学校，1967 年开始国民服役。"
- 正文：①为什么要建军（分家、对抗、英军计划撤离；人口少，养不起大规模职业军队，"人口虽少，能在短时间内动员大批兵力" [BIBLIO-NS] 的思路）；吴庆瑞任内政与国防部长，向外国求助，最后以色列答应派人训练（F2）。②1966 年巴西拉峇军营的 SAFTI：先训练教官和军官（F3）。③1967 年：《国民服役（修正）法令》、登记、约 900 人 8 月 17 日在 Taman Jurong 军营入伍，其余人部分时间服役（F4–F7）；有人抗议（F8）。④到 1971 年：海军、空防司令部、武装部队日、1969 年国庆的装甲车、1970 年《征兵法令》（F9、F10）；今天的战备军人也在警察部队和民防部队服役（课纲，不写年份）。
- 细看：①**第一批：9,000 还是 900？**（F6，两种写法并列；登记站两说 F5）；②**吴庆瑞**（F2，职称按 Opus 核对的结果）；③**不愿服役的人**（F8 1954、1967 的抗议；F11 法律没有例外、耶和华见证人；研究 S7、S8）；④**独立时有几条船**（F1 两说，可并进①）。
- 图：`singapore-after-1965-national-service`（§7）放在细看①之后。
- 节拍（4）：
  1. 1966-02-14 · 西部（103.70, 1.335, 11.2；hl `safti-founded-1966`）。EN "14 February 1966: SAFTI, a school to train officers and instructors, is set up at Pasir Laba Camp in the west of the island." ZH "1966 年 2 月 14 日：训练军官和教官的新加坡武装部队军训学院，在岛西部的巴西拉峇军营成立。"
  2. 1967-03-14 · 城区（103.851, 1.290, 13.4；hl `ns-act-1967`）。EN "14 March 1967: Parliament passes the National Service (Amendment) Act; young men born in the first half of 1949 must register." ZH "1967 年 3 月 14 日：国会通过《国民服役（修正）法令》，1949 年上半年出生的男青年必须登记。"
  3. 1967-08-17 · 西部（103.72, 1.335, 11.4；hl `first-ns-intake-1967`）。EN "17 August 1967: about 900 of some 9,000 registered young men begin two years of full-time service at Taman Jurong Camp, today a park." ZH "1967 年 8 月 17 日：约 9,000 名登记的男青年中，约 900 人在 Taman Jurong 军营开始两年全职服役；那里今天是公园。"（Taman Jurong 的中文〔待核〕）
  4. 1969-08-09 · 城区东（103.856, 1.300, 12.8；hl `armed-forces-day-1969`、`ndp-1969`）。EN "1969: the first Armed Forces Day is held at Jalan Besar Stadium on 1 July; on National Day, tanks and armoured vehicles pass the Padang." ZH "1969 年：7 月 1 日在惹兰勿刹体育场举行第一个武装部队日；国庆日，坦克和装甲车在大草场前列队通过。"
- 事件：`safti-founded-1966` · 1966-02-14 · 巴西拉峇 · milestone（标题 "SAFTI at Pasir Laba Camp, 1966–1995" / "巴西拉峇军营的军训学院（1966–1995）"）；`ns-act-1967` · 1967-03-14 · 旧国会大厦 · milestone（细看写 17 日一说与 1970 年《征兵法令》）；`first-ns-intake-1967` · 1967-08-17 · Taman Jurong Greens · milestone · importance 3；`armed-forces-day-1969` · 1969-07-01 · 惹兰勿刹体育场 · milestone；`ndp-1969` · 1969-08-09 · 大草场 · milestone。

#### 02 symbols · 国旗、国歌、信约：国家象征

- `summary`：EN "The flag, crest and anthem of 1959 became national symbols in 1965; the Pledge followed in 1966, and in 2023 a law named seven symbols." / ZH "1959 年的旗、徽、歌在 1965 年成为国家象征；1966 年有了信约；2023 年的法令列明七个国家象征。"
- 正文：①1959 年 12 月 3 日的旗、徽、歌，1965 年成为国旗、国徽、国歌（F13，邦旗→国旗）。②各自的意思（F14 国旗用法令写法；F15 国徽；F16 国歌与朱比赛）。③信约：谁提议、谁起草、谁改、1966 年 8 月 24 日第一次诵读（F17、F18、F19）；课纲的拉惹勒南在这里第一次出现。④后来的三个：国花 1981、狮头 1986、公共印章；2022 年法令把七个写进一部法律，2023 年生效；没有国服（F12、F20–F22）；第一个国庆日（F23）——"国家事件"。
- 细看：①**七个国家象征**（表：象征 · 哪一年 · 意思 · 来源；注明文化部网页仍写六个）；②**信约是怎样写成的**（时间线 + 两句措辞并排，研究 S10）；③**红色代表什么：两种写法**（F14）；④**第一个国庆日**（F23；场地以后年年不同，本主题只核到 1966 年）。
- 不配图（§0-13）。
- 节拍（5）：
  1. 1966-08-09 · 城区（103.852, 1.290, 13.8；hl `first-national-day-1966`、`site-city-hall`）。EN "9 August 1966: the first National Day Parade is held on the Padang; some 23,000 people march from City Hall through Chinatown to Tanjong Pagar." ZH "1966 年 8 月 9 日：第一次国庆检阅在大草场举行；约 23,000 人从政府大厦出发，经牛车水游行到丹戎巴葛。"
  2. 1966-08-24 · 全岛（103.82, 1.36, 10.2；hl `pledge-first-recited-1966`）。EN "24 August 1966: about 500,000 pupils in 529 schools recite the new Pledge for the first time. The marker stands for the whole island." ZH "1966 年 8 月 24 日：529 所学校约 50 万名学生第一次诵读新的信约。这个标记代表全岛。"
  3. 1981-04-15 · 全岛（hl `national-flower-1981`）。EN "15 April 1981: the orchid Vanda Miss Joaquim is announced as the national flower." ZH "1981 年 4 月 15 日：胡姬花卓锦万代兰被宣布为国花。"
  4. 1986 · 全岛（hl `lion-head-1986`）。EN "1986: the Lion Head symbol is introduced, free for everyone to use." ZH "1986 年：推出人人都可以自由使用的狮头标志。"
  5. 2023-08-01 · 城区（103.850, 1.290, 13.6；hl `symbols-act-2023`）。EN "1 August 2023: the National Symbols Act comes into force and names seven national symbols." ZH "2023 年 8 月 1 日：《国家象征法令》生效，列明七个国家象征。"
- 事件：`site-city-hall` · site · 政府大厦（1959 年 12 月 3 日启用旗、徽、歌；1966 年游行起点）；`site-victoria-theatre` · site · 维多利亚剧院（1958 年朱比赛的歌；1964 年 7 月 19 日行动党召开的马来人大会，第 05 章用）；`first-national-day-1966` · 1966-08-09 · 大草场 · milestone · importance 3；`pledge-first-recited-1966` · 1966-08-24 · 全岛形心 · milestone；`national-flower-1981` · 1981-04-15 · 全岛形心 · milestone；`lion-head-1986` · "1986" · 全岛形心 · milestone；`symbols-act-2023` · 2023-08-01 · 国会大厦 · milestone（细看：2022 年 8 月 2 日一读，2022 年第 29 号法令）。

#### 03 neighbours · 邻国与全面防卫

- `summary`：EN "Konfrontasi ended in 1966 and ASEAN was founded in 1967; in 1984 Singapore adopted Total Defence, which asks everyone to play a part." / ZH "对抗在 1966 年结束，东盟在 1967 年成立；1984 年新加坡提出全面防卫，要每个人都出一份力。"
- 正文：①对抗：1963–1966 年印尼反对马来西亚成立，在新加坡造成多起爆炸、7 死 50 伤（一句，链到 1819–1965 第 11 章；研究 S12）；1966 年 8 月马来西亚与印尼结束对抗；1967 年 9 月新加坡与印尼建交（F39）。②1967 年 8 月 8 日东盟成立，拉惹勒南签字（F40；一段，说明东盟在别的主题里细讲）。③1984 年全面防卫：五大支柱各是什么意思，2019 年加数码防卫（F41）。④全面防卫日为什么是 2 月 15 日（`<TopicLink slug="ww2" ch="fall-of-singapore">`，研究 S11 一句话）；从哪年开始两说（F42）。
- 细看：①**对抗在哪一天结束**（F39，8 月 11 日 / 12 日、曼谷 / 雅加达）；②**全面防卫日从哪一年开始**（F42 两说）；③**东盟后来加入的国家**（F40）。
- 节拍（4）：
  1. 1966-08-12 · 区域（104.5, -1.5, 5.0；hl `konfrontasi-ends-1966`）。EN "12 August 1966: in Jakarta, Malaysia and Indonesia ratify the agreement that ends Konfrontasi." ZH "1966 年 8 月 12 日：马来西亚和印度尼西亚在雅加达批准结束对抗的协议。"
  2. 1967-08-08 · 区域（102.5, 6.0, 4.4；hl `asean-founded-1967`）。EN "8 August 1967: in Bangkok, Indonesia, Malaysia, the Philippines, Singapore and Thailand found ASEAN; S. Rajaratnam signs for Singapore." ZH "1967 年 8 月 8 日：印尼、马来西亚、菲律宾、新加坡和泰国在曼谷成立东盟，拉惹勒南代表新加坡签署。"
  3. 1967-09-07 · 区域（104.5, -1.5, 5.0；hl `indonesia-relations-1967`）。EN "7 September 1967: Singapore and Indonesia establish formal diplomatic relations." ZH "1967 年 9 月 7 日：新加坡与印度尼西亚正式建交。"
  4. 1984-01-22 · 全岛（103.82, 1.36, 10.2；hl `total-defence-1984`）。EN "22 January 1984: Total Defence is proclaimed, with five pillars: military, civil, economic, social and psychological defence." ZH "1984 年 1 月 22 日：宣布全面防卫，五大支柱是军事、民事、经济、社会和心理防卫。"
- 事件：`konfrontasi-ends-1966` · 1966-08-12 · 雅加达（Wikidata 城市点，施工时读）· political；`asean-founded-1967` · 1967-08-08 · 曼谷（Wikidata 城市点；签署的建筑没查，不写）· political · importance 3；`indonesia-relations-1967` · 1967-09-07 · 雅加达 · political；`total-defence-1984` · 1984-01-22 · 全岛形心 · milestone。

#### 04 british-withdrawal · 英军撤离：找工作（1967–1971）

- `summary`：EN "In 1967–68 Britain decided to leave by 1971. Singapore sought factories and foreign investors, and passed labour laws that unions questioned." / ZH "1967–68 年英国决定在 1971 年以前撤军。新加坡想办法吸引工厂和外国投资者，并通过了工会有疑虑的劳工法令。"
- 正文：①1967 年宣布、1968 年提前（F24）；基地占国民生产总值两成以上，数以万计的工作（F25，细看两组数字）。②办法：经济发展局（1961）、裕廊（`<TopicLink slug="singapore-land-use" ch="new-towns">`）、1967 年税务奖励、外国公司来设厂、1968 年裕廊镇管理局、1968 年起可用公积金买组屋（F27、F30）。③1968 年：4 月大选（F29）；7–8 月两部劳工法令，政府的理由与国会里的关注（F28）。④结果按政府的数字：失业率 1966 年 8.9 % → 1973 年 4.5 %，经济年均增长约 13 %（F26）；1971 年大部分英军撤离、机场交给空防司令部，1976 年最后一名英军离开（F24、F9）。
- 细看：①**基地里有多少份工作**（F25 两组数字；为什么不印 1959 年的失业人数和制造业占比，F26）；②**1968 年的劳工法令：两种看法**（F28，研究 S5）；③**裕廊的头几年**（F27："吴庆瑞的傻事"的说法、最初只有两家投资者、到 1960 年代末 181 家工厂——只写 land-use 没写的"人和工作"，链过去）。
- 图：`singapore-after-1965-factory-work`（§7）放在细看③之后。
- 节拍（5）：
  1. 1967-07-18 · 北部（103.80, 1.40, 10.4；hl `british-withdrawal-announced-1967`、`site-seletar-airbase`、`site-tengah-airbase`）。EN "18 July 1967: Britain announces it will withdraw its forces by the mid-1970s. Its bases produce over a fifth of Singapore's national income." ZH "1967 年 7 月 18 日：英国宣布在 1970 年代中期以前撤军。这些基地占新加坡国民生产总值的两成以上。"
  2. 1968-01-16 · 同上（hl `withdrawal-brought-forward-1968`）。EN "16 January 1968: Britain brings the date forward to 1971." ZH "1968 年 1 月 16 日：英国把撤军期限提前到 1971 年。"
  3. 1968-06-01 · 西部（103.70, 1.32, 11.2；layers + `industrial-estates`；hl `jtc-founded`）。EN "1 June 1968: Jurong Town Corporation is set up to run Jurong and the other industrial estates, shown in today's extent." ZH "1968 年 6 月 1 日：裕廊镇管理局成立，管理裕廊和其他工业区（色块是工业区今天的范围）。"
  4. 1968-08 · 城区（103.851, 1.290, 13.4；hl `labour-laws-1968`）。EN "July–August 1968: the Employment Act and an amended Industrial Relations Act are passed; the government says they will bring investment, while union leaders in Parliament raise concerns." ZH "1968 年 7–8 月：国会通过《雇佣法令》和修订的《劳资关系法令》；政府说这能吸引投资，出身工会的议员则在国会提出疑虑。"
  5. 1971-10 · 全岛（103.82, 1.38, 10.2；layers + `industrial-estates`；hl `british-forces-leave-1971`、`site-tengah-airbase`、`site-seletar-airbase`）。EN "By October 1971 most British troops have left; that year their air bases are handed to Singapore's air defence command." ZH "到 1971 年 10 月，大部分英军已经撤离；这一年，英军的空军基地交给新加坡的空防司令部。"
- 事件：`british-withdrawal-announced-1967` · 1967-07-18 · 海军基地坐标 [103.82, 1.46]（细看：在伦敦宣布，标记放在最大的基地）· political · importance 3；`withdrawal-brought-forward-1968` · 1968-01-16 · 同上 · political；`jtc-founded`（**复制** land-use）；`labour-laws-1968` · "1968-08" · 旧国会大厦 · political；`british-forces-leave-1971` · "1971-10" · 海军基地坐标 · political。

#### 05 living-together · 和谐共处：语言与种族和谐

- `summary`：EN "After the riots of 1964, Othman Wok, S. Rajaratnam and others worked to make the new country belong equally to every community; schools taught two languages, and since 1997 pupils mark Racial Harmony Day." / ZH "1964 年骚乱之后，奥斯曼渥、拉惹勒南等人努力让新国家平等地属于每一个族群；学校教两种语文，1997 年起学生纪念种族和谐日。"
- 正文：①1964 年的两次骚乱（一句，数字与两种说法同 1819–1965 第 11 章，`<TopicLink slug="singapore-1819-1965" ch="separation">`；研究 S1）；新国家要回答"怎样一起生活"。②奥斯曼渥（F33）与拉惹勒南（F34）——课纲的两位，各写做了什么、为什么。③语言（课纲的 learning in harmony）：四种官方语文、双语教育、1978 年报告与 1987 年英文为第一语文、1979 年讲华语运动（F31、F32）。④生活中的和谐（living in harmony）：1997 年国民教育与种族和谐日（F35）。
- 细看：①**拉惹勒南与奥斯曼渥**（两人小传，F33、F34；1964 年 7 月 19 日维多利亚剧院的会议）；②**方言：得到的与失去的**（F32，研究 S6）；③**1969 年：只有一份记录**（F37，研究 S2）；④**种族和谐日为什么是 7 月 21 日**（F35 + 1998 一说）。
- 节拍（4）：
  1. 1968 · 城区（103.851, 1.289, 13.6；hl `muslim-law-act-1966`、`site-victoria-theatre`）。EN "1966–1968: with Othman Wok as Minister for Social Affairs, a law on Muslim affairs is passed, and in 1968 the Islamic Religious Council of Singapore is set up." ZH "1966–1968 年：奥斯曼渥任社会事务部长期间，国会通过回教事务的法令，1968 年成立新加坡回教理事会。"（法令、机构中文名〔待核〕）
  2. 1979-09-07 · 全岛（103.82, 1.36, 10.2；hl `speak-mandarin-1979`）。EN "7 September 1979: Lee Kuan Yew launches the Speak Mandarin Campaign." ZH "1979 年 9 月 7 日：李光耀发起讲华语运动。"
  3. 1987 · 全岛（hl `english-first-language-1987`）。EN "By 1987 English is the first language in all schools except the Special Assistance Plan schools." ZH "到 1987 年，除特选学校外，所有学校都以英文为第一语文。"（特选学校〔待核〕）
  4. 1997-07-21 · 全岛（hl `racial-harmony-day-1997`）。EN "21 July 1997: schools mark the first Racial Harmony Day, on the date the 1964 riots began." ZH "1997 年 7 月 21 日：学校举行第一个种族和谐日；1964 年的骚乱就是在这一天开始的。"
- 事件：`muslim-law-act-1966` · "1966"（通过日〔待核〕，核到就改到天）· 旧国会大厦 · milestone（细看写 1968 年回教理事会成立）；`speak-mandarin-1979` · 1979-09-07 · 全岛形心 · milestone；`english-first-language-1987` · "1987" · 全岛形心 · milestone；`racial-harmony-day-1997` · 1997-07-21 · 全岛形心 · milestone（细看写 1997-05-17 国民教育推出）。

#### 06 costs-and-national-day · 代价、争论与国庆日

- `summary`：EN "Building a country also meant choices that some people opposed. This chapter sets out what was decided, the reasons given and the objections, and ends with the days pupils mark today." / ZH "建设国家也意味着一些人反对的选择。这一章写当时决定了什么、给出的理由和反对的声音，最后写学生今天纪念的日子。"
- `sensitive: true`
- 正文：①开头一段：前面几章已经写到的代价——劳工法令与 1968 年大选（第 04 章）、方言（第 05 章）、拒绝服役的人（第 01 章）——这一章再写两件：报纸，和未经审判的拘留。不下结论，写各方的话。②报业（F45，研究 S4）。③光谱行动（F43、F44，研究 S3；取不到原文的句子不印）。④今天：学校的四个纪念日（F36）；国庆日从 1966 年大草场的检阅开始（F23），每天在学校诵读信约（F17）。
- 细看：①**报纸与法律：两种说法**（F45）；②**光谱行动：两种说法**（F43、F44，三栏：政府说 / 被拘留者说 / 史家与后来官员说，每句一个来源）；③**学校里的四个纪念日**（F36 表）；④**还在讨论的问题**（不给答案，列出这一主题里两边都有道理的问题：国民服役与良心、方言与共同语、报业与政府；每条指回对应的章）。
- 节拍（4）：
  1. 1971-05-02 · 全岛（103.82, 1.36, 10.2；hl `press-detentions-1971`）。EN "2 May 1971: four executives of the Nanyang Siang Pau are detained without trial under the Internal Security Act. The marker stands for the whole island." ZH "1971 年 5 月 2 日：《南洋商报》四名高层依《内部安全法令》被拘留，未经审判。这个标记代表全岛。"
  2. 1974-08-28 · 城区（103.851, 1.290, 13.4；hl `press-law-1974`）。EN "28 August 1974: Parliament passes the Newspaper and Printing Presses Act, in force from 1975." ZH "1974 年 8 月 28 日：国会通过《报章与印刷新闻业法令》，1975 年起实施。"（法令中文名〔待核〕）
  3. 1987-05-21 · 全岛（hl `operation-spectrum-1987`）。EN "21 May 1987: sixteen people are detained without trial, and six more in June; the government calls it a Marxist conspiracy, and nine of them later deny it." ZH "1987 年 5 月 21 日：16 人未经审判被拘留，6 月又有 6 人；政府称这是马克思主义阴谋，其中九人后来否认。"
  4. 2023-08-09 · 全岛（hl `first-national-day-1966`、`symbols-act-2023`）。EN "Every 9 August is National Day; the first parade was on the Padang in 1966. Schools also mark Total Defence Day, International Friendship Day and Racial Harmony Day." ZH "每年 8 月 9 日是国庆日，第一次国庆检阅 1966 年在大草场举行。学校还纪念全面防卫日、国际友谊日和种族和谐日。"
- 事件：`press-detentions-1971` · 1971-05-02 · 全岛形心 · political（细看写《新加坡先驱报》5 月 28 日）；`press-law-1974` · 1974-08-28 · 旧国会大厦 · political（细看写 1986 年修正、1984 年报业控股）；`operation-spectrum-1987` · 1987-05-21（until 1987-06，6 名第二批的日子〔待核〕，查不到就不写 until）· 全岛形心 · political（同 1819–1965 `coldstore-1963` 的写法）。

### 2.3 数据清单汇总

- **实体**：**零个**（`entities.json` = `[]`）。没有控制区、没有阵营；图层用颜色 token（§3.3）。核对见 §4 V1。
- **控制区**：`control.json` GeoJSON 写法两帧：K1 `1965-08-09`、K2 `2023-08-09`，`features` 都是空的 FeatureCollection（docs/06：空帧已支持）。K2 只为让时间轴止于 2023-08-09（同 docs/34 的 2025-12-31 保持帧）。
- **事件**：34 个（新建 27、复制 7；milestone 16、political 11、site 7），清单 §3.4。
- **路线**：无（`movements.json` = `[]`）。
- **预设**：`island` 全岛 [103.82, 1.36] 10.2 · `west` 西部 [103.71, 1.335] 11.2 · `civic` 市政区 [103.852, 1.290] 13.8 · `region` 东南亚 [103.0, 3.0] 4.2。不与事件、名词、图层重名。
- **名词**：15 个（§5）。
- **规格行**（若引擎按数据自动生成就以引擎为准）：`YEARS 1965–2023 · CHAPTERS 6 · PLACES 12 · MILESTONES 16 · SYMBOLS 7`。
- **`topic.yaml`**：

```yaml
# Authoring contract: docs/42-singapore-after-1965-content-spec.md.
id: singapore-after-1965
title: { en: "Singapore after 1965: Building a Nation", zh: "1965 年后的新加坡：建设一个国家" }
subtitle: { en: "Defence, national symbols and living together", zh: "国防、国家象征与和谐共处" }
shortTitle: { en: "After 1965", zh: "1965 年以后" }
subject: history
mode: time
engine: time-scene
stage: geo
theme: paper
sensitivity: open
status: draft
levels: [P5]
tags: [singapore, history, map]
illustration: singapore-after-1965
basemap: { local: land-sg-modern, maxZoom: 14 }
note:
  en: "Places from Wikidata · laws marked at the Parliament building of the time, nationwide decisions at the island's centre · coasts after 1973 from Landsat images (approximate) · industrial estates in today's extent"
  zh: "地点取自维基数据 · 法律标在当年的国会大厦，全国性的决定标在岛的中心 · 1973 年以后的海岸取自 Landsat 卫星影像（近似）· 工业区按今天的范围"
datedLayers:
  - id: industrial-estates
    file: sg-estates            # 土地利用主题的文件，原样复用
    kind: area
    color: "token:holder-1"     # 与土地利用主题的"工业"同色
    label: { en: "Industrial estates (today's extent)", zh: "工业区（今天的范围）" }
```

---

## 3. 地图与数据

### 3.1 底图与岛岸

- `basemap: { local: land-sg-modern, maxZoom: 14 }`：直接用 `public/geo/land-sg-modern.json`（docs/34 §3.3 与 §9.2：第一段岛岸 = 1819–1965 的 L5 + 1973 年 Landsat 补的离岛，到 1973-10-17；之后按 Landsat 影像日；最后是 URA 2019 今天的陆地；今天海岸虚线照常）。**不复制、不改**。土地利用主题以后重跑第一段岛岸（docs/34 §9.2 留给主会话的事），本主题自动跟着变；本主题的 `--keys` 截图加进那次回归。
- 区域视图（zoom 4.2–5.0）用默认世界底图 `land-50m` + 东南亚 1:10m；不开 `borders`（今天的国界里有 2002 年才有的东帝汶边界，放在 1967 年不对）。
- 没有新的几何：**本主题不新建任何多边形或线**。"地图类内容必须用真实数据"由三样满足：Landsat / 公有领域地图配准的岛岸（已登记在 land-use 与 1819–1965 的 SOURCES-GEO.md）、Wikidata（CC0）读出的点、URA MP2019（SODL）取出的工业区范围（land-use 已登记）。`data/SOURCES.md` 照抄这三样的登记行并注明"复用，见 docs/34 / docs/28"。

### 3.2 地点（坐标 WGS84 [lon, lat]；研究 §3，2026-10-21 用 Wikidata 查询服务读，OneMap 只作核对，两者相差 ≤ 约 100 m）

| 地点 | 用在 | Wikidata | [lon, lat] | 核对 / 说明 |
|---|---|---|---|---|
| 政府大厦 City Hall | `site-city-hall`、`separation-1965`（复制） | Q3531770 | 103.8516667, 1.2905556 | 与 1819–1965 的 `separation-1965` 同一坐标 |
| 大草场 Padang | `first-national-day-1966`、`ndp-1969` | Q7123224 | 103.853055555, 1.290555555 | OneMap 搜不到，只有 Wikidata |
| 维多利亚剧院与音乐厅 | `site-victoria-theatre` | Q557635 | 103.852, 1.28825 | |
| 旧国会大厦（今艺术之家） | `ns-act-1967`、`labour-laws-1968`、`muslim-law-act-1966`、`press-law-1974` | Q13360293 | 103.8511111, 1.2886111 | 与 1819–1965 `first-president-1965` 逐位相同；**1999 年以前国会在这里开会**〔待核：Sonnet 取 Parliament / NLB 原文〕，核不到就改锚到全岛形心 |
| 国会大厦 | `symbols-act-2023` | Q7138913 | 103.85, 1.28922 | OneMap 1.28897, 103.85052 |
| 惹兰勿刹体育场 | `armed-forces-day-1969` | Q3270373 | 103.860347, 1.310016 | 中文名〔待核〕 |
| 巴西拉峇军营（SAFTI 1966–1995） | `safti-founded-1966` | Q7142152 | 103.672, 1.334 | **只取到千分之一度（约 100 m），岛尺度一个点**；OneMap 1.33385, 103.67135 |
| Taman Jurong Greens（原 Taman Jurong 军营） | `first-ns-intake-1967` | — | 103.718536, 1.33716 | OneMap；公共公园，2017 年历史标记 |
| 全岛形心（"全国"锚点） | 全国性政策 9 个 | — | 103.8198, 1.3521 | 与 1819–1965 `coldstore-1963` 相同 |
| 雅加达 | `konfrontasi-ends-1966`、`indonesia-relations-1967` | Q3630〔施工时读坐标〕 | — | 城市点 |
| 曼谷 | `asean-founded-1967` | Q1861〔施工时读坐标〕 | — | 城市点；签署的建筑不写 |
| 英军海军基地与四个机场 | 复制 land-use 的 5 个 `site` | — | 照 land-use | 粗略点；今天的用途不查、不写 |

不用：伊斯坦纳、国家体育场、裕廊镇大会堂、裕廊港、樟宜机场（研究列了，但本主题的叙事用不上，或开放日期没有来源）。

### 3.3 按年份出现的图层

只有一个：`industrial-estates`（文件 `sg-estates`，land-use 生成，今天的范围按岛岸年代切块，`certainty: approximate`）。只在第 04 章第 3、5 拍打开，说明"今天的范围"。**不**打开组屋点图层：那是土地利用主题的主线（§0-1）。

### 3.4 事件清单（`events.json`）

**复制**（与原主题逐字节相同，脚本比对；来源编号照原主题保留，同 docs/28 复制 ww2 的做法）：

| id | 原主题 | t | kind | 来源编号 |
|---|---|---|---|---|
| `separation-1965` | singapore-1819-1965 | 1965-08-09 | political | S160、S219、S271、S320、S342 |
| `singapore-naval-base` | singapore-land-use | 1938-02-14 | site | S216、S217 |
| `site-seletar-airbase` | singapore-land-use | 1928 | site | S61 |
| `site-tengah-airbase` | singapore-land-use | 1939 | site | S62 |
| `site-sembawang-airbase` | singapore-land-use | 1959-04-01 | site | S9 |
| `site-changi-airbase` | singapore-land-use | 1959-04-01 | site | S9 |
| `jtc-founded` | singapore-land-use | 1968-06-01 | milestone | S203、S230 |

两组编号互不重叠；本主题新来源从 **S401** 起编（§6），避开这 12 个。`site` 事件不进时间轴范围，所以 1928、1938 年的基地不会把时间轴拉回去。

**新建**（`id · t（until）· at · kind · importance`；每条 `title / summary / detail` 双语，`detail` 写锚点说明与争议）：

| 章 | id | t | at | kind |
|---|---|---|---|---|
| 00/02 | `site-city-hall` | 1959-12-03 | 政府大厦 | site |
| 00/02/05 | `site-victoria-theatre` | 1958 | 维多利亚剧院 | site |
| 01 | `safti-founded-1966` | 1966-02-14 | 巴西拉峇 | milestone · 3 |
| 01 | `ns-act-1967` | 1967-03-14 | 旧国会大厦 | milestone · 3 |
| 01 | `first-ns-intake-1967` | 1967-08-17 | Taman Jurong Greens | milestone · 3 |
| 01 | `armed-forces-day-1969` | 1969-07-01 | 惹兰勿刹体育场 | milestone · 2 |
| 01 | `ndp-1969` | 1969-08-09 | 大草场 | milestone · 1 |
| 02 | `first-national-day-1966` | 1966-08-09 | 大草场 | milestone · 3 |
| 02 | `pledge-first-recited-1966` | 1966-08-24 | 全岛形心 | milestone · 3 |
| 02 | `national-flower-1981` | 1981-04-15 | 全岛形心 | milestone · 2 |
| 02 | `lion-head-1986` | 1986 | 全岛形心 | milestone · 1 |
| 02 | `symbols-act-2023` | 2023-08-01 | 国会大厦 | milestone · 3 |
| 03 | `konfrontasi-ends-1966` | 1966-08-12 | 雅加达 | political · 3 |
| 03 | `asean-founded-1967` | 1967-08-08 | 曼谷 | political · 3 |
| 03 | `indonesia-relations-1967` | 1967-09-07 | 雅加达 | political · 1 |
| 03 | `total-defence-1984` | 1984-01-22 | 全岛形心 | milestone · 2 |
| 04 | `british-withdrawal-announced-1967` | 1967-07-18 | [103.82, 1.46] | political · 3 |
| 04 | `withdrawal-brought-forward-1968` | 1968-01-16 | [103.82, 1.46] | political · 2 |
| 04 | `labour-laws-1968` | 1968-08 | 旧国会大厦 | political · 2 |
| 04 | `british-forces-leave-1971` | 1971-10 | [103.82, 1.46] | political · 2 |
| 05 | `muslim-law-act-1966` | 1966 | 旧国会大厦 | milestone · 2 |
| 05 | `speak-mandarin-1979` | 1979-09-07 | 全岛形心 | milestone · 2 |
| 05 | `english-first-language-1987` | 1987 | 全岛形心 | milestone · 1 |
| 05 | `racial-harmony-day-1997` | 1997-07-21 | 全岛形心 | milestone · 3 |
| 06 | `press-detentions-1971` | 1971-05-02 | 全岛形心 | political · 2 |
| 06 | `press-law-1974` | 1974-08-28 | 旧国会大厦 | political · 2 |
| 06 | `operation-spectrum-1987` | 1987-05-21 | 全岛形心 | political · 2 |

- 不建事件的（只写在正文 / 细看）：1964 年骚乱（在 1819–1965，复制会把时间轴拉回 1964）、1969 年冲突（§0-8）、1972 年耶和华见证人撤销注册、1968 年大选、公积金 1968、全面防卫日、国民教育 1997-05-17、1988 年信约姿势、2001 年国歌新编曲、内政与国防部成立（1965-08，只有月份，会早于独立日）。
- 全岛形心上叠了 9 个事件：只有高亮的出引线标注，其余是重叠的点；这是"全国"的诚实表示，不散开、不编地点。

### 3.5 许可

- Wikidata（CC0）、OneMap / data.gov.sg（新加坡开放数据许可 v1.0，只作核对、不进发布数据）；复用的 `land-sg-modern.json`、`sg-estates.json` 许可已在 docs/34 §3.6 登记。全部可按 `LICENSE-CONTENT`（CC BY-NC-SA 4.0）提供。运行时不请求任何外部服务。
- 图像：三张已审草稿，石墨标本图版，无人、无字、无旗徽（§7）。

---

## 4. 引擎

**不改引擎。** 需要的都已有：`basemap.local` 带日期的岛岸（docs/28 E1）、`datedLayers`（docs/34 E1）、控制区空帧（docs/34 E2）、`milestone`（docs/34 E3）、`site`、`TopicLink ch`（docs/28 E3）。施工第一步（Opus，脚手架之后）核对：

| # | 核对 | 怎么查 | 不过怎么办 |
|---|---|---|---|
| V1 | **零实体 + 全空控制区**：`pnpm validate` 通过；右上参与卡、KEY、REFERENCE、领土名称、状态串（K1→K2）不报错、不画空框 | 脚手架后把 `entities.json` 设 `[]`、`control.json` 两个空帧，跑 validate 与 `pnpm shoot singapore-after-1965 --layout` | 若右上卡画出空框：先查 View / HudPanels 是否已有"无实体不出卡"的分支；没有就加最小的一条（`entities.length === 0` 时不注册卡），由引擎代理（Opus）改并补单测、docs/06 一句。**不**为绕开它造一个假实体 |
| V2 | **复用别的主题的图层文件**：`datedLayers.file: sg-estates` 能载入；validate 认 `color` token | 同上，第 04 章第 3 拍截图 | 若校验要求文件属于本主题：改成在 topic.yaml 引用同一路径的最小改动，或复制文件并在测试里比对哈希（两者择一，主会话定） |
| V3 | **巴西拉峇只出一个点**：`maxZoom` 14 下读者仍能放大到 14；点就是点，没有任何几何 | 看图 | 不需要改：放大也只是一个点，不泄露任何东西 |
| V4 | **引线标注与键位检查**：土地利用主题遇到过"World 预设下所有引线挤在舞台中部，拖动终点落在标签上，`--keys` 的'拖动释放镜头'失败"（docs/34 §9.2、land-use REVIEW「Engine notes」） | `pnpm shoot singapore-after-1965 --keys` | 同 land-use 的处理：背景章不写章节级高亮，四拍各自保留；本主题有曼谷、雅加达两个远点，World 预设下标签分散，可能本来就不出这个问题 |

- 不需要：新的事件种类、新的图层种类、`persist` 线、`borders`、`basemap.region`、新的底图文件。
- 若 V1 需要改引擎，文件归属：`src/engines/time-scene/**`、`tests/time-scene/**`、docs/06 一句；同一个 Opus 代理，改前主会话确认没有别的代理在改引擎。

---

## 5. 名词表（`glossary.json`，15 个）

每个词只包全主题第一次出现处。中文"已核"= 研究在 MINDEF 术语表 / 语委会新加坡华语资料库 / 《联合早报》见到；"待核"= Opus Z 步再查。

| id | EN / ZH | 定义要点 | 中文 | see |
|---|---|---|---|---|
| `national-service` | National Service / 国民服役 | 法律规定的男子服役；1967 年起；全职服役之后转为战备军人 | 已核 | `nsman`、`saf` |
| `nsman` | NSman / 战备军人 | 完成全职服役后，按规定定期回营训练、随时可动员的人 | 已核 | `national-service` |
| `saf` | Singapore Armed Forces (SAF) / 新加坡武装部队 | 陆、海、空军；独立后建立 | 已核 | |
| `safti` | SAFTI / 新加坡武装部队军训学院 | 1966 年在巴西拉峇成立的军官与教官学校，1995 年迁址 | 已核 | |
| `national-symbols` | National symbols / 国家象征 | 法律列明的七个：国旗、国歌、信约、国徽、公共印章、狮头标志、国花 | 已核 | `national-pledge` |
| `national-pledge` | National Pledge / 信约 | 1966 年起学生每天诵读的誓词；官方有英、华、马来、泰米尔四种文本 | 已核 | |
| `public-seal` | Public Seal / 公共印章 | 外环写着国名的国徽印，总统保管，用在重要的国家文件上 | 待核 | `national-symbols` |
| `orchid` | Orchid / 胡姬（花） | 新加坡、马来西亚的叫法；国花卓锦万代兰是一种胡姬 | 已核 | |
| `bilingual-policy` | Bilingual education policy / 双语教育政策 | 学生学英文，再学一种母语（华、马来、泰米尔） | 已核（"母语"〔待核〕） | |
| `speak-mandarin-campaign` | Speak Mandarin Campaign / 讲华语运动 | 1979 年起鼓励华族在家和公众场合讲华语、少讲方言 | 已核 | `bilingual-policy` |
| `racial-harmony-day` | Racial Harmony Day / 种族和谐日 | 每年 7 月 21 日，学校纪念 1964 年骚乱、学习彼此的文化 | 已核 | `national-education` |
| `national-education` | National Education / 国民教育 | 1997 年起学校的一套课程与活动，包括四个纪念日 | 已核 | |
| `total-defence` | Total Defence / 全面防卫 | 1984 年提出：防卫不只靠军队，还靠民事、经济、社会、心理（2019 年加数码）防卫 | 待核（"全面防卫日"已核） | |
| `konfrontasi` | Confrontation (Konfrontasi) / 对抗（Konfrontasi） | **复制** 1819–1965 的定义原文，去掉 `see: [merger-1963]`（本主题没有那个词） | 已有 | |
| `internal-security-act` | Internal Security Act / 内部安全法令 | 允许政府不经审判拘留被认为威胁国家安全的人的法律；写"允许……"，不写"用来对付……" | 待核 | |

不收：东盟（正文一拍，括注全称即可）、甘榜、组屋（在别的主题）。

---

## 6. 来源（施工时的 S#；新来源从 S401 起，复制事件的 12 个编号保留，§3.4）

研究 `facts.json` 的 80 个来源按块编号，`sources.json` 每条写标题、发布者、URL、访问日期（2026-10-21）、页码 / 段落；维基百科只作索引、标"secondary"，正文引用的句子必须换成原文（§1.3 ⚑）。

| 块 | 研究来源 id | 用于 |
|---|---|---|
| S401–S402 课纲 | MOE-SS、MOE-CCE | §1.1、F36 |
| S403–S420 象征 | MCCY-SYM、NHB-SYM、NHB-FLAG、NHB-CREST、NHB-ANTHEM、NHB-PLEDGE、NHB-LION、NHB-FLOWER、NHB-SEAL、BILL21、SG101-SYM、NAS-PLEDGE60、NLB-PLEDGE、SG101-PLEDGE、SMD-PLEDGE、ZB-PLEDGE1、ZB-PLEDGE2、ROOTS-NDP | F12–F23 |
| S421–S432 国防 | BIBLIO-NS、SG101-WITHDRAW、ROOTS-NS、MINDEF-HIST、SAFTI-HIST、MINDEF-SPEECH24、SSO-EA1970、PMO-TJ、ROOTS-TJCAMP、ZB-GKS、SG101-SAFDAY、USDOS-IRF23（+ WIKI-JW secondary） | F1–F11 |
| S433–S443 撤军与就业 | NLB-BRIT、SG101-E59、SG101-E65、SG101-E70、ROOTS-JURONG、ROOTS-JTH、NLB-IRA、MAS-MENON（只作核对，注明是虚构未来的讲稿）、BIBLIO-CPF、NLB-PORT、NLB-CHANGI | F24–F30 |
| S444–S452 语言与和谐 | NLB-BILING、NLB-SMC、SMD-SMC、NAS-LKY09、NLB-RHD、NLB-NE、SG101-RHD22、SMD-RHD、NLB-1964、SG101-RIOTS、NLB-OTHMAN、NLB-RAJ、ZB-OTHMAN | F31–F38 |
| S453–S458 区域与全面防卫 | NLB-KONF、NLB-ASEAN、ASEAN-FOUND、SMD-TD、HOMETEAM-TD（+ WIKI-TD secondary） | F39–F42 |
| S459–S465 代价 | NLB-SPECTRUM、NAS-JAYA87、NLB-NSP、NLB-NPPA86（+ WIKI-SPECTRUM、WIKI-NPPA secondary） | F43–F45 |
| S466– 原文（Sonnet F 步取到后加） | 《海峡时报》1984-01-22、1998-02-14，《新报》1997-05-17；1969 年 6 月报纸；FRUS 1964–68 v26 d218；Barr 2010；Turnbull 2009 p.339；《海峡时报》2001-12-14、1991（黄锦西）；1988 年声明；张素兰 2010；政府公报 / 国会记录（1972 年撤销注册、1967 年法令、1966 年回教法令、1968 年劳工法令、1974 年报业法令）；国会搬迁年份 | ⚑ 各条 |
| 地点与许可 | WD-LIC、WD-SPARQL、ONEMAP-SEARCH、ONEMAP-TOS、DGS-ODL | §3 |
| 用词 | MINDEF-TERMS、SMD-ORCHID、SMD-VANDA、ZHWIKI-SYM、ZHWIKI-NAMES（secondary） | §5、中文 |

挡爬虫的 NLB / NAS / 早报 / NHB / SSO 页面用浏览器读（研究方法注），只引读到的原文。

---

## 7. 图像（只用已审草稿 `art/planned/singapore-after-1965/`，主会话 2026-10-21 看过；不生成新图）

清单记录在 `art/planned/manifest.jsonl`（三张都是 `tries: 1`，"Opened and visually reviewed"）。处理：首页图 `pnpm tsx scripts/illustrate.ts process art/planned/singapore-after-1965/singapore-after-1965.png singapore-after-1965`；章节图 `pnpm tsx scripts/illustrate.ts figure <src.png> singapore-after-1965-<id>`（`gen` 走 Codex，本轮不用）。

| 用途 | 文件 | 画的是什么（看过） | 放在 | alt / caption 草稿 | 注意 |
|---|---|---|---|---|---|
| 首页图 | `singapore-after-1965.png`（1024×1024） | 一座早期板式组屋（外廊、底层架空）旁边一间锯齿屋顶的小厂房，门口堆着无字木箱 | 索引卡、主题首页 | alt EN "An early slab block of flats beside a small factory workshop with a saw-tooth roof." / ZH "一座早期的板式组屋，旁边是一间锯齿屋顶的小厂房。" | 与土地利用首页图（也是板式组屋）相似，§0.1-5 |
| 第 01 章 | `singapore-after-1965-national-service.png`（1536×1152） | 帆布背包、系带军靴、钢盔、叠好的军服、带布套的水壶；无武器、无徽章、无字 | 细看"第一批：9,000 还是 900？"之后 | alt EN "A canvas pack, boots, a steel helmet, folded uniform and a water bottle." / ZH "帆布背包、军靴、钢盔、叠好的军服和水壶。" caption EN "Drawing made for this topic of a recruit's field kit of the late 1960s; not an exact issued set." / ZH "为本主题画的示意图：1960 年代末新兵的野战装备，不是当年配发的确切样式。" | 不说是哪一年、哪一款；钢盔样式不作考证 |
| 第 04 章 | `singapore-after-1965-factory-work.png`（1536×1152） | 一台车床（主轴箱、卡盘夹着工件、刀架、尾座、手轮），无人、无刻度、无字 | 细看"裕廊的头几年"之后 | alt EN "A metal-working lathe with a workpiece held in its chuck." / ZH "一台车床，卡盘上夹着一段金属工件。" caption EN "Drawing made for this topic: a lathe, standing for the factory jobs of the late 1960s; not a machine from a particular factory." / ZH "为本主题画的示意图：一台车床，代表 1960 年代末工厂里的工作，不是某家工厂的机器。" | 早期裕廊的工厂多是纺织、钢铁、电子装配（F27），caption 不说"裕廊的工厂用这种机器" |

不画（§0-13）：国旗、国徽、狮头、公共印章、国花的图；人物肖像；武器；任何真实营地。国家象征用文字与细看表格讲。

---

## 8. 施工顺序、分工与验收

**没有 Codex。** 模型分工按 brief：Opus 写内容（数据、结构、史学复核、中文）；Sonnet 写英文初稿、做事实核对（取 ⚑ 原文）、截图 QA；Haiku 做机械检查。主会话写 brief、预装依赖（本主题不需要新依赖）、验收、提交；push 等 Gavin。

| 步 | 内容 | 谁 | 写哪些文件 | 完成标准 |
|---|---|---|---|---|
| 0 | 脚手架：`pnpm tsx scripts/new-topic.ts singapore-after-1965 --engine time-scene --subject history --title-en "Singapore after 1965: Building a Nation" --title-zh "1965 年后的新加坡：建设一个国家" --start 1965-08-09 --end 2023-08-09`；`topic.yaml` 照 §2.3；`entities.json` `[]`；`control.json` 两个空帧；`movements.json` `[]` | 主会话 | `src/content/topics/singapore-after-1965/**` | `pnpm validate` 绿 |
| V | 引擎核对 V1–V4（§4） | Opus | 只读；若 V1 要改，见 §4 | 结论写进 §9 |
| F | **事实核对与取原文**：§1.3 每个 ⚑ 与〔待核〕；写进 `RESEARCH.md`（事实、来源全名、URL、页码 / 段落、≤ 25 词原文、确认 / 更正 / 取不到）；不从记忆填任何数字或日期；取不到的标"取不到"，交 T 步决定删句 | **Sonnet** | `RESEARCH.md` | ⚑ 全部有结论 |
| D | 数据：事件（§3.4，复制的 7 个逐字节）、预设、名词（§5）、`sources.json`（§6，S401 起）、`data/SOURCES.md`（`pnpm tsx scripts/sources-md.ts singapore-after-1965`）；中文字段先填 Opus 草稿 | **Opus** | `data/*.json`、`data/SOURCES.md` | validate 绿 |
| E | 英文正文：背景 + 6 章（§2.2 要点，200–260 词，3–4 段，2–4 个细看，`<Num s>`、`<Term>` 首次出现、`<TopicLink … ch>`）；敏感段落严格按 §1.4 的结构 | **Sonnet** | `chapters/*.mdx`（EN） | 每个数字有 `s` |
| T | 史学与客观性复核：§1.2 立场与用词表；§1.4 每个争议两边；F 步结论落到正文（取不到原文的句子删）；与 1819–1965 第 11 章的 1964 年数字逐字一致；吴庆瑞职称两题一致；写 `AUDIT.md` 与 `REVIEW.md`（§0.2 的条目按实际段落号） | **Opus** | 正文、数据、`AUDIT.md`、`REVIEW.md` | 〔待核〕清零或列入已知差距 |
| Z | 中文定稿：独立成文（不是翻译），新加坡用词（§0-9、§5）；敏感段落克制；人名按 §0.1-1 的默认 | **Opus** | 所有 `zh` 字段 | 无"【待译】" |
| I | 图像：§7 三张处理成 cover / figure，写 alt / caption | 主会话 | `public/…`（脚本输出） | 对照"不画"清单 |
| B | 节拍与镜头：§2.2 草稿落地；`pnpm shoot singapore-after-1965 --beats --keys --layout --locale en,zh` 逐张看 | **Sonnet**（镜头问题退回 Opus） | 章节 frontmatter | 节拍 0 失败，"unlabelled highlights""chapter highlights"两份清单为空 |
| Q | 截图 QA：`acceptance.md` + §8.1；两套主题；手机；回归 `pnpm shoot singapore-land-use --keys`、`pnpm shoot singapore-1819-1965 --keys` | **Sonnet** | — | 全勾 |
| H | 机械检查（脚本或逐项）：复制事件与原主题逐字节相同；`konfrontasi` 定义与 1819–1965 相同；坐标与 §3.2 表一致（巴西拉峇只到 0.001°）；id 唯一；每个 `<Num>` 有 `s` 且编号存在；无"我们 / 我国 / 敌人"（EN "we / our / enemy"）；界面文本无年级；ZH 无"【待译】"、无"奥斯曼·渥"（按 §0.1-1 的结果）；"兰花"不出现；每章 3–5 拍；`borders` 不在任何 `layers` 里 | **Haiku** | 只读，报告 | 0 问题 |
| G | 门槛：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`CI=1 pnpm e2e`；本文 §9 写实现记录；`docs/review-queue.md` 加 §0.2 的条目；docs/17 第 207 行、docs/04 同步；提交 | 主会话 | — | 全绿，`status: draft` |

模板章（先做完给 Gavin 看）：背景章 + 第 01 章（国防，有地图、有拒服兵役的细看）+ 第 06 章（最敏感）。看过再铺开 02–05。并行规则：同一时间只有一个代理改 `events.json`；Sonnet 的 E 步与 Opus 的 D 步可并行（文件不重叠）；任何代理不改 `package.json`、`src/engines/**`（V1 例外，见 §4）、别的主题（1819–1965、land-use、ww2 只读）。

### 8.1 验收（`acceptance.md` 之外，本主题另加）

- [ ] **不重讲**：1964 年骚乱、分家、第一届内阁只有一句话 + `TopicLink ch`；裕廊、裕廊镇管理局、组屋、樟宜、地铁、填海只链不讲；1964 年数字与 1819–1965 第 11 章逐字一致。
- [ ] **地图只用真实数据**：没有新的多边形或线；每个点的坐标来源在 `data/SOURCES.md`；岛岸与工业区图层注明复用自 land-use；巴西拉峇只有一个点、镜头 ≤ 11.5；没有别的营地、警察或民防设施。
- [ ] **★ 更正都落地**：1967 年是《国民服役（修正）法令》；第一批约 900 人在 Taman Jurong；巴西拉峇是 SAFTI；七个国家象征、没有国服；信约的起草经过；种族和谐日 1997；全面防卫 1984 与全面防卫日两说；奥斯曼渥、胡姬、卓锦万代兰、《前进吧，新加坡！》。
- [ ] **两边写**：§1.4 每一行在正文或细看里都有两边、各带来源；争议数字（§0-7）都列两个；1969 年只一句、注明是政府记录。
- [ ] **原文**：§1.3 每个 ⚑ 要么换成原文来源，要么那一句已删；正文里没有只靠维基百科的句子。
- [ ] **全国性锚点**：每个锚在形心或国会大厦的事件，`detail` 都说明"只是锚点"。
- [ ] 界面上没有年级；`levels` 只在 topic.yaml；没有"我们 / 敌人"。
- [ ] 图像 3 张：无人、无字、无旗徽、无武器；caption 写"示意图，不是……"。
- [ ] §0.2 的段落 Gavin 已读（中文稿），再改 `published`。

---

## 9. 实现记录与已知差距

（施工后填写。）
