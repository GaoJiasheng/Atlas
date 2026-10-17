# Singapore, 1819–1965: review status (18 October 2026)

Status stays `draft` until Gavin has read the passages below. Facts, objectivity and the Chinese text have been reviewed; the ledger is [AUDIT.md](AUDIT.md), the build notes are in docs/28 §11.

## For Gavin to read before publishing (Chinese text first)

Paragraph numbers count the four body paragraphs of each chapter (¶1–¶4).

1. **07 War and occupation — the Sook Ching.** Body ¶2; More “肃清：日期与数字” (table); More “同一场占领，不同的遭遇” (Bahau deaths); beat 3 caption (copied from ww2 ch08). Events `sook-ching`, `site-changi-beach`, `site-punggol-beach`, `alexandra-hospital` (all ww2 copies). Questions: the numbers and wording are ww2's; is it right that this chapter uses 鸦片山 for Bukit Chandu and 蔡杨素梅 for Elizabeth Choy (Singapore usage) while ww2 still has 武吉知卓 and 伊丽莎白·蔡? Should ww2 be aligned?
2. **06 British Malaya — the 1915 mutiny and executions.** Body ¶4; More “1915 年：兵变与处决”; events `mutiny-1915` (atrocity), `mutiny-executions-1915` (now political). Questions: the mutineers' killings carry the atrocity mark and the executions the political mark, as the 1947 Sook Ching death sentences do in ww2 — is that the right pairing, or should public executions before crowds of up to 15,000 carry the atrocity mark too? Is “44 killed” (BiblioAsia) plus a note on Infopedia's 49 enough?
3. **03 and 04 — opium and the labour trade.** ch03 ¶3 and More “谁在养这个殖民地”; ch04 ¶1, ¶4 and More “一张船票的代价”, “罪犯修的城”; glossary `coolie`, `credit-ticket`. Questions: the word 苦力 is used once, wrapped as a glossary term with the note that it is insulting — acceptable? Is 赊单制 the term you want, and is “卖猪仔” better left out (it is not in a read source, so it was removed)?
4. **05 Town life — the 1854 fighting and 1876 shooting.** ¶3; More “1854 年：五月的十天”; events `riots-1854`, `post-office-riots-1876` (both atrocity). Question: the 1854 deaths are given as two estimates without a single figure — right?
5. **08 After the war — Maria Hertogh, 1950.** ¶4; More “玛丽亚·赫托：官司与暴乱”; event `hertogh-riots` (atrocity). Questions: no source breaks down the 18 dead by community; the text says only that they included people attacked by rioters and rioters shot by the security forces. Is that restraint right for a primary readership, or do you want the (unread) older Infopedia breakdown hunted down?
6. **08 After the war — Hock Lee, 1955.** ¶4; More “福利巴士：四个死者”; event `hock-lee-riots`. The four dead are named in Latin letters in the Chinese text because no Singapore Chinese form was found. Question: do you know the Chinese names used in 1955 newspapers?
7. **09 Self-government — 1956 schools.** ¶1–¶2; More “1956 年：两种说法”; event `school-riots-1956`. Question: the dead are not named (no read source names them) — acceptable?
8. **10 Merger — the referendum and Operation Coldstore.** ¶2–¶3; More “冷藏行动：两种说法”, “三种‘赞成’”; events `coldstore-1963`, `referendum-1962`. Questions (spec §10-2): two accounts side by side, counts 107 / 110 / 113 each with its source, Lim Chin Siong and Thum Ping Tjin named on one side, the 2014 ministerial speech and Kumar Ramakrishna on the other — is the balance and the naming what you want? Is “the blank-vote rule” described fairly?
9. **11 Riots and separation — July and September 1964.** ¶1–¶2; More “1964 年：各方的说法”; events `race-riots-july-1964`, `race-riots-september-1964`. Questions: the PAP and UMNO accounts and the governments' joint blame of Indonesian agents are given without a verdict; Syed Ja'afar Albar is named. September's start is given as 2 September with NLB's other page (3 September) in the event detail. Right?
10. **11 — MacDonald House, 1965.** ¶3; More “麦唐纳大厦：三位死者”; event `macdonald-house-1965`. Questions: the three victims are named; the marines are named and their execution and Indonesian honours are both stated (“the two countries remember the same men in opposite ways”). Acceptable for this readership?
11. **11 — Separation.** ¶4; More “分家：两地的两种说法”; events `independence-agreement-1965`, `separation-1965`. Question: the text says Singapore's leaders presented independence as forced on them while the Albatross File shows Goh negotiating the terms with Lee's agreement — is that the framing you want?
12. **01 Founding and 02 Treaties.** ch01 More “两个苏丹”; ch02 More “割让的代价与价钱” (“he had little room to refuse”). Question: is this the right weight for the Malay rulers' side?
13. **Glossary definitions:** `coolie`, `orang-laut`, `kongsi`, `konfrontasi`, `credit-ticket` (spec §5 asked for your reading of the first four).
14. **Background reading note and More “地图是怎么画的”** — the plain-language list of what the map gets wrong.

## Questions still open from the spec

- §10-3 “Lim & Lau”: not identified; Albert Lau's work is cited only through NLB's article, not read.
- The Kampong Bugis and Chulia names: 武吉士 is kept for places (武吉士甘榜) and 武吉斯人 used for the people; Chulia is 注辇 (林孝胜's usage). Confirm.
- Malayan Union is 马来亚联邦 and the Federation of Malaya 马来亚联合邦 (Singapore usage), unlike the spec's 马来亚联盟. City Hall is 政府大厦. Confirm.

## control.json changes for the main session

The coordinator asked that `data/control.json` (and `scripts/geo/singapore-1819-1965/sources.json`, which generates its labels) not be edited here while Codex reworks the geometry. Please apply after that pass:

1. **K1 date:** `t` 1819-02-06 → **1819-01-28** (in control.json and in the manifest keyframe K1). Reason: the engine draws no control areas before the first keyframe, so the background chapter (time 1819-01-28) and the first beats of chapter 01 (28 January, early February) show no territories at all. K1's content (Penang under the Company, Dutch Malacca, Singapore under Johor) is the state of 28 January too. The draft spec assumed the first frame shows before its date.
2. **Labels.** Every feature's `label.zh` is still 【待译】. Replace by holder and English label as below (same row for every frame listed); where “EN new” is given, change the English too.

| Frames (id, t) | holder | label EN now | label EN new | label ZH new |
|---|---|---|---|---|
| K1 1819-02-06 … K2 1823-06-09 (2 frames) | `eic` | Penang and Province Wellesley (modern state outline; approximate) | Penang and Province Wellesley (East India Company; modern state outline, approximate) | 槟城与威省（东印度公司；按今天的州界，近似） |
| K1 1819-02-06 … K2 1823-06-09 (2 frames) | `johor` | Singapore (Johor) | (same) | 新加坡（柔佛） |
| K1 1819-02-06 … K2 1823-06-09 (2 frames) | `netherlands` | Malacca (Dutch; modern state outline; approximate) | Malacca (Dutch; modern state outline, approximate) | 马六甲（荷兰；按今天的州界，近似） |
| K2 1823-06-09 | `arab-kampong` | Arab Campong (1822 plan; approximate) | (same) | 阿拉伯甘榜（1822 年规划；近似） |
| K2 1823-06-09 | `bugis-kampong` | Bugis Campong (1822 plan; approximate) | (same) | 武吉士甘榜（1822 年规划；近似） |
| K2 1823-06-09 | `cantonment` | Cantonment Plain and Native Cantonment (1822 plan; approximate) | (same) | 兵营平地与土著兵营（1822 年规划；近似） |
| K2 1823-06-09 | `chinese-kampong` | Chinese Campong (1822 plan; approximate) | (same) | 华人甘榜（1822 年规划；近似） |
| K2 1823-06-09 | `chulia-kampong` | Chuliah Campong (1822 plan; approximate) | (same) | 注辇甘榜（1822 年规划；近似） |
| K2 1823-06-09 | `european-town` | European Town (1822 plan; approximate) | (same) | 欧洲人市区（1822 年规划；近似） |
| K2 1823-06-09 | `government-hill` | Singapore Hill (government hill) (1822 plan; approximate) | Singapore Hill, for government (1822 plan; approximate) | 新加坡山，政府用地（1822 年规划；近似） |
| K2 1823-06-09 | `kampong-glam` | Sultan’s compound (Kampong Glam) (1822 plan; approximate) | Sultan’s compound, Kampong Glam (1822 plan; approximate) | 苏丹的居地，甘榜格南（1822 年规划；近似） |
| K3 1826-11-27 … K7 1941-12-07 (8 frames) | `straits-settlements` | Singapore (Straits Settlements) | (same) | 新加坡（海峡殖民地） |
| K3 1826-11-27 … K4a 1887-01-01 (3 frames) | `straits-settlements` | Straits Settlements (modern Penang and Malacca outlines; approximate) | Straits Settlements (Penang and Malacca by modern outlines, approximate) | 海峡殖民地（槟城、马六甲按今天的州界，近似） |
| K5 1896-07-01 | `brunei` | Brunei (including Lawas; approximate) | (same) | 文莱（含老越；近似） |
| K5 1896-07-01 | `fms` | Federated Malay States (1898 map frontiers; approximate) | Federated Malay States (borders from an 1898 map, approximate) | 马来联邦（边界据 1898 年地图，近似） |
| K5 1896-07-01 | `johor` | Johor (1898 map frontier; approximate) | Johor (border from an 1898 map, approximate) | 柔佛（边界据 1898 年地图，近似） |
| K5 1896-07-01 | `kedah` | Kedah (under Siam; 1898 map frontiers, approximate) | Kedah (under Siam; borders from an 1898 map, approximate) | 吉打（属暹罗；边界据 1898 年地图，近似） |
| K5 1896-07-01 | `kelantan` | Kelantan (under Siam; 1898 map frontiers, approximate) | Kelantan (under Siam; borders from an 1898 map, approximate) | 吉兰丹（属暹罗；边界据 1898 年地图，近似） |
| K5 1896-07-01 | `north-borneo` | Labuan (British colony; Company administration) | Labuan (British colony; run by the North Borneo Company) | 纳闽（英国殖民地；由北婆罗洲公司管理） |
| K5 1896-07-01 … K7 1941-12-07 (5 frames) | `north-borneo` | North Borneo (Company) | North Borneo (Chartered Company) | 北婆罗洲（特许公司） |
| K5 1896-07-01 | `perlis` | Perlis (under Siam; modern outline, approximate) | (same) | 玻璃市（属暹罗；按今天的州界，近似） |
| K5 1896-07-01 | `sarawak` | Sarawak (Brooke; Limbang included, Lawas excluded; approximate) | Sarawak (Brooke rule; with Limbang, without Lawas; approximate) | 砂拉越（布洛克家族统治；含林梦，不含老越；近似） |
| K5 1896-07-01 | `siam` | Siam (including Reman; eastern frontier approximate) | Siam (including Reman; eastern border approximate) | 暹罗（含勒曼；东部边界近似） |
| K5 1896-07-01 … K6a 1912-01-01 (3 frames) | `straits-settlements` | Dindings (Straits Settlements; 1898 map trace, approximate) | Dindings (Straits Settlements; traced from an 1898 map, approximate) | 天定（海峡殖民地；据 1898 年地图描绘，近似） |
| K5 1896-07-01 … K7 1941-12-07 (5 frames) | `straits-settlements` | Straits Settlements | (same) | 海峡殖民地 |
| K5 1896-07-01 | `terengganu` | Terengganu (under Siam; 1898 map frontiers, approximate) | Terengganu (under Siam; borders from an 1898 map, approximate) | 登嘉楼（属暹罗；边界据 1898 年地图，近似） |
| K6 1909-07-09 … K19 1965-08-09 (13 frames) | `brunei` | Brunei | (same) | 文莱 |
| K6 1909-07-09 … K6a 1912-01-01 (2 frames) | `fms` | Federated Malay States (Dindings excluded until 1935; approximate) | Federated Malay States (without the Dindings until 1935; approximate) | 马来联邦（1935 年前不含天定；近似） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `johor` | Johor | (same) | 柔佛 |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `kedah` | Kedah (British protection) | (same) | 吉打（英国保护） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `kelantan` | Kelantan (British protection) | (same) | 吉兰丹（英国保护） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `perlis` | Perlis (British protection) | (same) | 玻璃市（英国保护） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `sarawak` | Sarawak (Brooke; modern extent, approximate) | Sarawak (Brooke rule; modern extent, approximate) | 砂拉越（布洛克家族统治；按今天的范围，近似） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `siam` | Siam (modern eastern boundary; approximate) | Siam (modern eastern border; approximate) | 暹罗（东部按今天的边界；近似） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `straits-settlements` | Labuan (Straits Settlements) | (same) | 纳闽（海峡殖民地） |
| K6 1909-07-09 … K7 1941-12-07 (4 frames) | `terengganu` | Terengganu (British protection) | (same) | 登嘉楼（英国保护） |
| K6b 1937-01-01 … K7 1941-12-07 (2 frames) | `fms` | Federated Malay States | (same) | 马来联邦 |
| K8 1942-02-15 … K10 1945-09-04 (3 frames) | `japan` | Malaya (Japanese-occupied) | (same) | 马来亚（日本占领） |
| K8 1942-02-15 … K10 1945-09-04 (3 frames) | `japan` | Northern Borneo (Japanese-occupied) | (same) | 婆罗洲北部（日本占领） |
| K8 1942-02-15 … K10 1945-09-04 (3 frames) | `japan` | Syonan (Singapore, Japanese-occupied) | (same) | 昭南（新加坡，日本占领） |
| K8 1942-02-15 … K10 1945-09-04 (3 frames) | `siam` | Thailand (allied with Japan) | (same) | 泰国（日本的盟国） |
| K9 1943-10-18 … K10 1945-09-04 (2 frames) | `siam` | Kedah (Thai-administered) | (same) | 吉打（泰国管理） |
| K9 1943-10-18 … K10 1945-09-04 (2 frames) | `siam` | Kelantan (Thai-administered) | (same) | 吉兰丹（泰国管理） |
| K9 1943-10-18 … K10 1945-09-04 (2 frames) | `siam` | Perlis (Thai-administered) | (same) | 玻璃市（泰国管理） |
| K9 1943-10-18 … K10 1945-09-04 (2 frames) | `siam` | Terengganu (Thai-administered) | (same) | 登嘉楼（泰国管理） |
| K11 1945-09-12 | `bma` | Malaya (British Military Administration) | (same) | 马来亚（英国军政府） |
| K11 1945-09-12 | `bma` | Northern Borneo (Australian command and British civil affairs) | Northern Borneo (Australian command, British civil affairs) | 婆罗洲北部（澳军指挥，英国民政） |
| K11 1945-09-12 | `bma` | Singapore (British Military Administration) | (same) | 新加坡（英国军政府） |
| K11 1945-09-12 … K19 1965-08-09 (10 frames) | `siam` | Thailand | (same) | 泰国 |
| K12 1946-04-01 | `malayan-union-government` | Malayan Union | (same) | 马来亚联邦 |
| K12 1946-04-01 | `north-borneo` | North Borneo (military administration; Crown Colony from July 1946) | (same) | 北婆罗洲（军政管理；1946 年 7 月起为直辖殖民地） |
| K12 1946-04-01 | `sarawak` | Sarawak (military administration; Crown Colony from July 1946) | (same) | 砂拉越（军政管理；1946 年 7 月起为直辖殖民地） |
| K12 1946-04-01 … K14 1959-06-02 (3 frames) | `singapore` | Colony of Singapore | (same) | 新加坡殖民地 |
| K13 1948-02-01 … K16 1963-09-15 (5 frames) | `federation-of-malaya` | Federation of Malaya | (same) | 马来亚联合邦 |
| K13 1948-02-01 … K16 1963-09-15 (5 frames) | `north-borneo` | North Borneo (Crown Colony) | (same) | 北婆罗洲（直辖殖民地） |
| K13 1948-02-01 … K16 1963-09-15 (5 frames) | `sarawak` | Sarawak (Crown Colony) | (same) | 砂拉越（直辖殖民地） |
| K15 1959-06-03 … K16 1963-09-15 (3 frames) | `singapore` | State of Singapore (self-governing) | (same) | 新加坡自治邦 |
| K17 1963-09-16 … K19 1965-08-09 (3 frames) | `indonesia` | Indonesia | (same) | 印度尼西亚 |
| K17 1963-09-16 … K19 1965-08-09 (3 frames) | `malaysia` | Malaysia | (same) | 马来西亚 |
| K17 1963-09-16 … K18 1965-08-08 (2 frames) | `malaysia` | Singapore (Malaysia) | Singapore (state of Malaysia) | 新加坡（马来西亚的一州） |
| K19 1965-08-09 | `singapore` | Republic of Singapore | (same) | 新加坡共和国 |

## Gates at hand-over

See docs/28 §11.4.
