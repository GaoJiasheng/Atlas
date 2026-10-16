# Warring States: verification ledger (historian review, 17 October 2026)

The second Codex pass left **53 ledger units** (50 source / event records and 3 chapter passages): 5 closed, 48 open. This review closes all 53. "Closed" means the fact is now either verified against the primary text or a read secondary source, or the text states the uncertainty in the reader's words (traditional location plus the alternative, two dates side by side, "according to the Shiji"). Four residual source gaps remain and are listed at the end; none blocks a claim in the text, because each claim is attributed to what was actually read.

Primary texts were read in the Wikisource text of the Shiji, Zuozhuan, Guliang and Mengzi (ctext was behind a bot check). Every passage used is listed in the source's `note` in `data/sources.json` (S2, S150–S169, S211–S236).

## Closed in this review

| Unit | Resolution |
|---|---|
| S26 | Bibliography confirmed (Wenwu 1996 no. 6). Contents taken only from a read press account of the excavation (S241) and Zhang Guangzhi's paper (S159): about 130 individuals, all male, mostly about 30, jumbled, cut wounds and arrowheads, judged killed then thrown in, not buried alive. Text says "according to published accounts of the excavation". Residual: report itself unread. |
| S31, S42, site-dujiangyan, chapter 08 demography, chapter 10 irrigation | Closed in the second pass; wording re-checked. |
| S43 | Coordinates: Wikidata / Wikipedia site pages, rounded. Battlefields whose site is disputed are written "traditionally placed at …; another view …" in the event detail. Inventory kept in `scripts/geo/warring-states/verification-sites.json`. |
| S158 | Kept as background only; no figure rests on it. |
| kuiqiu | Traditionally near Minquan; Lankao given as the alternative. |
| chengpu | Traditionally south-west of Juancheng (Linpu); the conflicting Wikidata point stays rejected. |
| boju | Traditionally near Macheng; Hanchuan as alternative. |
| fujiao | Traditionally Xishan island in Lake Tai. The three-year servitude story is not used; "sleeping on brushwood" is labelled a later addition (Shiji 41 has only the gall). |
| shimen | Shiji 5 names the opponent "Jin" (= Wei); 60,000 heads given as Qin's own count; traditionally south of present-day Shanxi (south-west of Yuncheng). |
| guiling | Traditionally near Changyuan; Heze as alternative; "besiege Wei to save Zhao" sourced to Shiji 65. |
| maling | Traditionally on the Shen–Fan border; Tancheng as alternative; 342/341 BCE; Shiji vs Yinqueshan on Pang Juan both given. |
| xiuyu | Qin annals date 318 BCE (更元七年), conventional 317 BCE; both stated; traditionally south-west of Yuanyang. |
| danyang | Traditionally north of the Dan near Xichuan; commander's name corrected to Qu Gai 屈丐 as in Shiji 5. |
| yuyu | Traditionally near Heshun; Wu'an alternative; Zhao annals 270 vs Qin annals 269 BCE stated. |
| hangu-241 | Zhao annals (Zui) and Lord Chunshen biography (Hangu) both given; point at Zui. |
| pingyang-234 | Traditionally west of Linzhang; 100,000 heads as Qin's count. |
| fei-233 | Traditionally near Jinzhou; Li Mu made Lord Wu'an. |
| li-xin-defeat | Reconsidered. There is no consensus (Xin Deyong 2014, S243, reviews the views). The marker and route now follow the traditional identification of Chengfu near Bozhou, Anhui; the Henan Fucheng view (S210) is stated in text and detail. 225 BCE is stated as inferred. |
| site-zeng-hou-yi | 65 bells (museum record S161); c. 433 BCE from the Chu king's bell; 21 young women killed to accompany the marquis (S27, from Tan Weisi via standard references); Zeng = Sui stated. |
| changping-massacre | Shiji 73 (400,000 surrendered; 240 sent home; 450,000 beheaded or captured in all) and Shiji 5 ("more than 400,000, all killed") quoted verbatim and kept apart; Bai Qi's "more than half" of Qin's dead; doubts (Song Yu 1983, Zhang Guangzhi 2016); Yonglu as above; keng explained. |
| chapter 08 excavation passage | Rewritten as above. |
| wey-abolished | Shiji 37: Lord Jiao year 9 = 221 BCE, year 21 = 209 BCE. |
| yue-after-306 | Shiji 41 links the war to King Wei of Chu (c. 333 BCE); Yang Kuan's 306 BCE given as the alternative; 222 BCE "brought the Yue lords to submission". |
| S170–S195 (26 routes) | Station orders as reviewed in the second pass. All labels now end "(schematic)" / "（示意）". Li Xin's route (S191) changed to Pingyu → Chengfu (Bozhou). |

## Other facts checked or corrected in this review

- Hong 638 BCE: Chu was the invader (Zuozhuan, Xi 22); sides corrected to attacker Chu, result attacker.
- Huayang: Bai Qi's biography (130,000 heads + 20,000 drowned, year 34 = 273 BCE) and Qin annals (150,000, year 33) kept as two counts.
- Daliang's "three months" comes from what people at the ruins told Sima Qian (Shiji 44, S212), not from Shiji 6.
- Chu's fall: Chu annals and the Table (224 Xiang Yan killed, 223 king captured) versus the First Emperor's annals (king captured 224, Lord Changping and Xiang Yan dead 223); both stated.
- Burning of books / killing of the zhusheng: Shiji 6 wording ("诸生", "犯禁者四百六十余人，皆阬之咸阳"), Fusu's "皆诵法孔子", Shiji 121's "坑术士"; Li Kaiyuan 2010 and Dai Guoxi 2012 (S238) for the debate.
- Forced labour: Shiji 6's 700,000; Zhaobeihu labourers' cemetery (S237): 114 graves, 32 excavated, 19 named on 18 tiles, e.g. 东武居赀上造庆忌.
- Human sacrifice written for every state the same way: Qin (Duke Wu 66, Duke Mu 177, Duke Jing's tomb 186, S244), Song (ruler of 鄫, 641 BCE), Chu (heir of Cai, 531 BCE), Zeng (21 women).
- Floodings of cities written the same way: Zhi at Jinyang (453), Zhao against Qi and Wei (332) and Wei (281), Qin at Yan (279) and Daliang (225); two Zhao events added.
- Occupations written the same way: Wu in Ying (Zuozhuan, Guliang, Shiji), Qi in Yan (Mencius; civil war "死者数万", Shiji 34), Yan in Qi (Shiji 82, with its storytelling frame), Qin in Handan 228 (Shiji 6).

## Residual source gaps (stated in the source notes)

1. S26 Yonglu excavation report: not read; contents from S241 and S159.
2. S237 Zhaobeihu report (Wenwu 1982 no. 3): not read; contents from published summaries quoting the tiles.
3. S238 Li Kaiyuan / Dai Guoxi: known from abstracts and a university report.
4. S244 Huang Zhanyue on Duke Jing's tomb (186 victims) and S27 on the 21 Zeng victims: figures as quoted in standard references.
