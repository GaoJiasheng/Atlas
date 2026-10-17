# Singapore, 1819–1965: verification ledger (historian review, 18 October 2026)

The Codex draft (commit abd683b, two passes) left a research register in [RESEARCH.md](RESEARCH.md) with 23 spec facts (F1–F23), 38 section checks and a casualty, census and cabinet table. This review read the draft against those records and against sources read again for the review (NLB Infopedia pages extracted directly or from Wayback copies, BiblioAsia, Roots.sg, Buckley 1902 on archive.org, the Malaysian Hansard of 9 August 1965, the UK Hansard, NHB collection records). Thirty-seven sources were added (S333–S373); every one says in its `note` what was read and how.

## What was audited

| Item | Count | Result |
|---|---|---|
| Chapter bodies (background + 11) | 12 × 4 paragraphs | all rewritten in English from the draft's abstract wording into concrete, sourced narrative; every number in `<Num>` |
| More blocks | 39 | rewritten; 7 new (map gaps, two sultans, Abdullah, Hertogh, Hock Lee, Coldstore, MacDonald House victims) |
| Beat captions | 53 | checked against the map in EN and ZH screenshots; 9 changed (wording, dates, cameras) |
| Events | 122 (103 topic events, 19 copied from ww2) | 103 retitled and rewritten for readers (title, summary, detail); the draft's anchor-provenance notes moved out of reader text (they remain in the coordinate sources S280–S332 and `scripts/geo/…/anchor-second-pass.json`); 19 ww2 copies left byte-identical |
| Entities | 31 | Chinese names written; Malayan Union renamed 马来亚联邦 (Singapore usage) |
| Routes | 18 | 15 topic routes relabelled “(schematic)” in both languages; Hussein's route dated 1–5 February 1819 to span both arrival dates; 3 ww2 copies unchanged |
| Glossary | 16 | definitions tightened; `kongsi` adds the 1890 ban; `self-rule` adds shared internal security |
| Sources | 282 (243 + 39) | 237 draft sources given Chinese text and notes; housekeeping (“HTTP 200”, local file names) dropped from English notes; S325's “Wikidata None” corrected |
| Control labels | 163 features, 63 distinct labels | **not edited here** (map geometry is in a third Codex pass); Chinese labels and EN wording listed in REVIEW.md for the main session |

## Corrections of fact

| Where | Draft | Corrected | Source |
|---|---|---|---|
| ch00, `mahmud-iii-dies` | Sultan Mahmud III died 1812 | 14 January 1811 at Lingga (NLB, BiblioAsia); Matheson's genealogy gives 1812; both stated | S361, S365, S362 |
| ch00 More | 1819 population: Marriott 150 vs NLB 1,000 only | Turnbull's breakdown added (about 500 Orang Kallang, 200 Orang Seletar, 150 Orang Gelam, 20–30 Malays, 20–30 Chinese); explained that the small figures omit the sea people | S351, S4 |
| ch00 More | Fort Canning finds unspecified | first dig 18–28 January 1984, 1,346 sherds; gold found 1928 (not 1926), ten pieces, four survive | S241, S11 |
| ch00 | Pires and the Nagarakretagama not read | Pires (Parameswara welcomed, then killed the ruler) and the 1365 poem now sourced; “1299” confirmed absent from Leyden's Annals | S358, S357, S10 |
| ch01 | 28 January: ships “off the Singapore River” | anchored off St John's Island at 4 p.m. on 28 January; landing on the 28th or 29th (Raffles's letter vs Buckley) | S6, S7 |
| ch01 | garrison “a few hundred” | 120 sepoys of the Bengal Native Infantry | S364 |
| ch01, `site-temenggong-village` | Temenggong settled “around 1811” (spec) | moved from Riau shortly before 1819, after the Dutch–Johor treaty of 1818; following of 6,000–10,000 by 1824 | S373 |
| ch01 More | regalia: Engku Puteri refused Hussein | added: Dutch troops seized the regalia in 1822; Abdul Rahman formally installed November 1823 | S363, S362 |
| ch02 | convention date (beat 9 June, event 7 June) | 7 June 1823; allowances $1,500 / $800 a month | S7, S373 |
| ch02 | cession payments not given | $33,200 + $1,300/month (Sultan), $26,800 + $700/month (Temenggong); NLB's Hussein page gives $32,000 — treaty text preferred, noted in S361 | S7, S361 |
| ch03 | opium “over half” | 40–60 percent in different years, over half at the peak; farms ended 1909, government monopoly 1910, smoking banned 1943 (Japanese) and 1946 (British) | S352, S208 |
| ch04 | convicts' end “1873” as end of transportation | Singapore ceased to be a penal station in 1867; last convicts shipped to the Andamans in May 1873; nearly 3,000 convicts in 1857 | S50, S367 |
| ch04 | credit-ticket abuses (kidnapping, “pig trade”) unsourced | replaced by what NLB records: depots, shipment to Sumatra against the men's will in the 1870s–80s, opium and gambling | S371 |
| ch04, `chinese-protectorate` | 1877, day unsupported | Pickering appointed 3 May 1877; first office North Canal Road | S354 |
| ch05 | 1854: “hundreds” | 400 or more (Buckley) and about 500 (NLB) side by side; about 300 houses burned; 500 arrested, six sentenced to death, two executed; the Temenggong sent 200 men | S178, S58, S353 |
| ch05 | Telok Ayer reclamation 1879–1897 | finished by 1890 (NHB) or 1897 (NLB); both given | S368, S76 |
| ch05 | Sultan Mosque rebuilt 1928–32 | rebuilt 1924–32 (opened 1929) | NLB Infopedia, Sultan Mosque (research agent, archived copy) |
| ch06 | 1915: “dozens” executed, composition and causes vague | 44 killed by the mutineers (BiblioAsia; Infopedia's wording can be read as 49); 47 executed (Infopedia) or more than 47 (BiblioAsia); 22 shot together on 25 March by a volunteer firing squad; a crowd of 15,000 on one occasion; Ranghar and Pathan Muslim companies; causes given as attributed explanations | S57, S360, S355 |
| ch06, `kreta-ayer-1927` | March 1927 | 12 March 1927, six killed, 14 injured | S197, S356 |
| ch06, `johor-treaty-1885` | 1914 General Adviser | General Adviser post created 1910, full powers 1914 (detail keeps 1914 as acceptance of the powers) | research agent, Cambridge/JMF |
| ch07 | Bahau deaths 300–1,500 / about 500 | kept; NLB Infopedia adds “as high as 1,500” | S177, S101, S346 |
| ch07, `endau-settlement` | 1943 | September 1943; 12,000 settlers by the end of the first year | S345 |
| ch07 | civilian deaths in Allied raids | no reliable count found; said so in text and event | S120 |
| ch08 | Hock Lee: “a police officer” | two policemen: Cpl Andrew Teo Bok Lan (Volunteer Special Constabulary) and Det Cpl Yuen Yau Pang; Gene Symonds; student Chong Lon Chong, 16; who shot him never established; 31 injured | S153 |
| ch08 | Hertogh breakdown of the dead | not available in any read source; text says the dead included people attacked by rioters and rioters shot by the security forces; 1,168 arrested, about 500 detained, curfew to 19 December | S151 |
| ch09 | Marshall resigned 7 June | NLB gives 6 June and 7 June; text says “June 1956”, event keeps both | S349, S206 |
| ch09, `school-riots-1956` | 24–29 October | deregistration 24 September; riots 25–26 October; order restored 28 October; 13 dead, 123 injured; 290 + 962 arrested, 912 detained | S154, S155 |
| ch09 | first cabinet: names only | 53.4 percent vote share added; symbols unveiled 3 December 1959 at Yusof Ishak's installation | S334, S335 |
| ch10 | referendum: blank votes “counted for the government” | the rule was that unmarked or uncertain ballots would follow the decision of the Assembly majority; full counts A 397,626, B 9,422, C 7,911, blank 144,077 | S336, S192 |
| ch10 | Coldstore 110 / “more than a hundred” | 107 arrested that night, 110 by 12 February (UK minister), 113 in all (NLB) — three counts, each with its source; no source for 111 | S337, S186, S338 |
| ch10 | Cobbold findings unsourced | paragraph 144 quoted: one third strongly for, one third with safeguards, one third divided between independence first and continued British rule | S366 |
| ch10 | 1963 state election missing | PAP 37, Barisan 13, UPP 1 of 51 seats | S340 |
| ch11, `race-riots-september-1964` | 3–7 September (spec) | began 2 September (NLB riots page; NLB separation page says 3 September — both stated); curfew 4–11 September; 1,439 arrested | S156, S342 |
| ch11 | separation vote “126 to 0” | 126 to none with one abstention, both readings (Hansard read) | S219 |
| ch11 | MacDonald House: names | full names; marines Osman bin Haji Mohamed Ali and Harun bin Said sentenced 20 October 1965, hanged 17 October 1968; 2014 ship naming and Singapore's response | S341, S347 |
| ch11 | “Tunku decided in July” | mid-1965 (Critchley's cable: decision in hospital on 29 June); Tunku's two courses quoted from Hansard | S218, S219 |
| event anchors | seven town events at [103.854, 1.2867] lay in the sea of the 1819–1886 coast; the Singapore Stone and the Chinese Protectorate likewise | moved to points on land in the coast of their own date (north bank town centre; Rocky Point; North Canal Road); Anglo-Dutch Treaty marker moved from London to the Straits of Malacca, as the spec planned, with “signed in London” in the detail | — |
| `post-office-riots-1876` | political | atrocity (police fired on a crowd, three killed), the same mark as Kreta Ayer | S210 |
| `mutiny-executions-1915` | atrocity | political, the same mark as the 1947 Sook Ching trial and its death sentences; **question for Gavin** (REVIEW.md) | — |
| riot events (1854, 1950, 1955, 1956, 1964 ×2, 1927) | `massacre` (“Massacre / 屠杀” in the inspector) | `atrocity` (“Atrocity / 暴行”); same hollow square on the map. “Massacre” stays only for the Sook Ching and Alexandra Hospital (ww2 copies) | — |
| `S200` | the topic's own spec cited as a source | removed from every event | — |

## Disputes written both ways (no verdict)

1. The two sultans of 1819 (Hussein, recognised by Britain; Abdul Rahman, by the Bugis court and the Dutch) — ch01 More.
2. Singapura's last ruler: the Malay Annals (Iskandar Shah flees Majapahit) vs Pires (Parameswara kills the ruler) — ch00 More.
3. The 1819 population (150 / 200 / about 1,000) — ch00 More.
4. 1854 death toll (400+ / about 500) — ch05.
5. The 1876 Post Office riots: secret societies (government) vs remittance houses (Harris) — event.
6. The 1915 mutiny's causes — ch06 More.
7. Residents: order and roads (British reports) vs loss of control (Malay rulers, Perak chiefs) — ch06 More.
8. Sook Ching numbers (5,000 / 11,110 / 25,000–50,000 / 100,000), unchanged from ww2 — ch07 More.
9. The Emergency: British, MCP and villagers' accounts — ch08 More.
10. Hock Lee: government (communist agitation) vs unions and students (workers' rights) — ch08 More.
11. 1956 schools: government (united front) vs students (Chinese education, anti-colonialism) — ch09 More.
12. The referendum's design (no option to reject; blank-vote rule) — ch10 More.
13. Operation Coldstore: government and British security case (and the 2014 restatement) vs detainees and Thum; Ramakrishna's defence of the security case — ch10 More.
14. The Cobbold findings as three thirds — ch10 More.
15. The 1964 riots: PAP (UMNO activists, Utusan) vs UMNO (spontaneous, PAP's treatment of Malays); both governments on September (Indonesian agents) — ch11 More.
16. Separation: the Tunku's two courses vs Singapore's “forced” account vs the Albatross File's negotiated account — ch11 More.
17. MacDonald House: executed in Singapore, honoured as heroes in Indonesia — ch11 More.

## Comparable acts written alike

- Killings of civilians by any side carry the same hollow-square mark and the same plain verbs (“killed”, “shot”, “beat to death”): the 1854 fighting, the 1876 and 1927 police shootings, the 1915 mutineers, the 1950, 1955, 1956 and 1964 riots, the Sook Ching and Alexandra Hospital (ww2), Allied bombing (bombing mark; civilian deaths stated as uncounted), MacDonald House (bombing mark).
- State punishments are written as punishments with their numbers and settings: the 1854 executions, the 1915 public executions, the 1947 Sook Ching trial (ww2), the 1968 hangings of the two marines.
- Detention without trial is named as such for the Emergency (British), 1956 (Lim Yew Hock), Coldstore (Internal Security Council) and the Hertogh aftermath.
- The colonial economy's costs are written beside its growth: opium farms, the credit-ticket trade, convict labour, forest clearance, low-wage mining and rubber work.

## Consistency with ww2 (chapter 07)

Numbers, dates and the three `TopicLink`s are the same as ww2 chapters 07, 08 and 11 (85,000; 61/133; about 200 at Alexandra Hospital; 18 February–4 March with the city screening on 21–23 February per Hayashi; 66 and about 400; 5,000 / 25,000–50,000 / 100,000; $50 million; 12 September 1945). The 19 copied events and 3 routes are byte-identical. Two Chinese names differ from ww2 because Singapore usage was checked for this review: Bukit Chandu is 鸦片山 here (ww2 has 武吉知卓) and Elizabeth Choy is 蔡杨素梅 (ww2 has 伊丽莎白·蔡). The ww2 topic was not edited; the main session may want to align it.

## Residual gaps (stated in source notes or text)

1. Original treaties of 1819, 1823 and 1824 read only as printed by Buckley; the Anglo-Dutch Treaty text not read.
2. Trocki (1979, 1990), Turnbull, Andaya, Harper & Miller, Thum's and Ramakrishna's books not read in full; their positions are taken from read articles and summaries and attributed.
3. No breakdown by community of the dead in 1950, 1956 or 1964; no names for the 1956 dead.
4. No civilian death count for the Allied raids of 1944–45.
5. Several NLB pages were read from Wayback copies because the live pages sit behind a bot check; the notes say so.
6. Chinese characters for the Hock Lee victims, the MacDonald House victims and several ministers' names were not found in a Singapore source; Latin names are used in the Chinese text where unsure.
7. The map's known gaps (detached islands, modern reservoirs, eastern Jurong in 1961, Pangkor islands, the 1822 plan used for 1819 and the 1839 and 1893 maps for 1823 and 1887) are explained to readers in the background chapter's “How the maps were drawn”.
