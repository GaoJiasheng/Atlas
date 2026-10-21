# Singapore after 1965: verification ledger (historian review, 21 October 2026)

The topic was built in one pass (Opus) from the content spec (docs/42, with §0.3 taking precedence over earlier sections), the Sonnet research pass (`art/research/singapore-after-1965/after-1965-research.md`, `facts.json`: 117 facts, 80 sources) and the originals pass (`originals-pass.md` / `.json`). The English and the Chinese were both written for this topic; neither is a translation of the other. Every claim in the chapters, the More blocks, the beat captions, the events and the glossary was checked against a quotation recorded in those passes (each at most 25 words, with its page and section) or against a source read again for this review. Where only a headline or an issue listing was read, the source note says so. Nothing was filled in from memory.

Sources read again for this review (21 October 2026): Wikidata coordinates for the nine places (API, CC0); the Promote Mandarin Council's database entries 特选学校, 全面防卫日 and 新加坡国家信约.

## What was audited

| Item | Count | Result |
|---|---|---|
| Chapters (background + 6) | 7 × 4 paragraphs | English 213–300 words; Chinese 344–446 characters; every number in `<Num>`; spec §2.2 points all present |
| More blocks | 22 | disputes given both sides, each with its source; three tables (seven symbols, Operation Spectrum, four commemorative days) |
| Beat captions | 30 | each opens with a date and describes the map; every number in a caption appears in the chapter or an event with its source |
| Events | 34 (27 new, 7 copied) | the 7 copies are byte-identical to `singapore-1819-1965` and `singapore-land-use` (unit test); every event anchored at the island's centre or at a Parliament building says so in its detail |
| Entities, movements, control | 0, 0, 2 empty frames | no new geometry; V1–V4 in docs/42 §9 |
| Glossary | 15 | `konfrontasi` identical to singapore-1819-1965 without its `see` (unit test) |
| Presets | 4 | `island`, `west`, `civic`, `region` |
| Sources | 87 (S401–S475 new; 12 inherited numbers copied unchanged) | Wikipedia is not cited for any sentence; three NewspaperSG items are cited from their issue listings only and say so |
| Images | 3 | cover and two figures from the reviewed drafts; no people, text, flags, crests or weapons |

## Corrections that §0.3 required, and how they landed

| §0.3 | Spec draft | In the topic | Sources |
|---|---|---|---|
| 1 | Turnbull, Tharman (“social activists”), Woon (“still not proven”) quoted on Operation Spectrum | all three quotations cut; Barr 2010 is the only historian quoted (“there never was a conspiracy, Marxist or otherwise”); Tharman appears only as Barr reports him (he later denied there was a conspiracy); the 1988 statement quoted from its full text; the statutory declarations and the “political ploy” sentence attributed to NLB as the government-side account | S461, S462, S459 |
| 2 | 1989: “limited judicial review” | “courts may not review the government's decisions under it, except on whether the procedure required by law was followed” (ISA s 8B(2)) | S464 |
| 3 | Confrontation ended 11 August in Bangkok | 11 August signed in Jakarta (FRUS d218), 12 August ratified in Jakarta (NLB); event dated 12 August | S449, S450 |
| 4 | Jehovah's Witnesses: reason “public welfare and order”; 11 detained as a government figure | 14 January 1972 and MHA's wording “prejudicial to public welfare and good order” from [1994] SGHC 207; the 11 (2023) and 14 (2022) attributed to the Witnesses' own website as reported by the US State Department (state.gov, not ecoi.net) | S429, S428 |
| 5 | 1969: only one source | Straits Times issue listings of 1–8 June 1969 (17 injured the first night, 2 dead and 13 in hospital in one police statement, 5 charged on 3 June, calm by 8 June); “4 dead, about 80 injured” kept as the government page's totals | S445, S444 |
| 6 | Total Defence Day “first marked nationally in 1998” | cut; 1984 (Home Team NS, Promote Mandarin Council) against the school calendar (The New Paper, 17 May 1997) and a school marking (Straits Times, 14 February 1998), no conclusion | S455–S458 |
| 7 | Goh Keng Swee “resigned” as finance minister in 1970 | both 1965 titles given (Straits Times “Defence and Security”, MINDEF “Interior and Defence”); 17 August 1967 swap with Lim Kim San; 11 August 1970 back to defence, Hon Sui Sen to finance; no “resigned”, no rename date | S470, S421, S471 |
| 8 | 1954: 26 injured, 45 arrested | printed as “the National Heritage Board's account gives”; the 1954 papers were not read | S420 |
| 9 | Racial Harmony Day: “some sources say 1998” | 1997 (NLB, Straits Times 22 July 1997) and 1998 (MOE press release 2012) side by side; NLB's note that community development councils joined from 1998 added without inferring a cause | S440–S442 |
| 10 | 偏颇报道 in quotation marks | no quotation marks in either language (NLB's “slanted reporting” is a description, not a quotation) | S468 |
| 11 | NewspaperSG full texts unread | listed under “Not read” below | — |

Corrections from the research pass (spec ★) also landed: the 1967 law is the National Service (Amendment) Act and the Enlistment Act is 1970; about 900 of some 9,000 began full-time service at Taman Jurong Camp; Pasir Laba was SAFTI, not the first NS camp; seven national symbols, no national dress; the Pledge drafted October 1965–February 1966; Total Defence 22 January 1984; 奥斯曼渥, 胡姬, 卓锦万代兰, 《前进吧，新加坡！》.

## Claims checked, by chapter

Source numbers are in the chapters' `<Num s>` and the events' `sources`; the research ids are those of `facts.json`.

| Chapter | Claim | Verdict | Source (research id) |
|---|---|---|---|
| 00 | two infantry battalions, about 1,000 men, two ships, no air force | confirmed (MINDEF); SG101's “two wooden hull boats” in the More | S421, S419 (ns-04) |
| 00 | unemployment 8.9 % in 1966 | confirmed, government figure | S433 (yrs-04) |
| 00 | 1959 unemployed: 200,000 vs 46,000; “double digits” | both quoted in the More only; not in the body | S434, S435, S431 (yrs-03) |
| 01 | “despite our small population, we could mobilise …” | quoted as BiblioAsia's wording | S418 (ns-04) |
| 01 | Israel persuaded to provide training | confirmed (SG101 “Eventually … persuaded the Israelis”); “other governments declined” not printed (no quotation) | S419 |
| 01 | SAFTI 14 Feb 1966, 60 trainees, opened 18 June, 150 commanders 18 Nov 1966, 117 cadets 16 July 1967, moved 1995 | confirmed | S422 (ns-07) |
| 01 | NS (Amendment) Act 14 March 1967 (17 March in BiblioAsia); first read 27 Feb | both in the More and the event | S421, S418, S420 (ns-01) |
| 01 | registration 28 March–18 April 1967; 6 months / $2,000 | confirmed | S420 (ns-03) |
| 01 | about 9,000 registered, about 900 full-time from 17 August 1967, 450 per battalion, training from 11 Sept | confirmed; BiblioAsia's “9,000 enlisted” in the More | S421, S425, S418 (ns-02) |
| 01 | Taman Jurong Camp: one-room JTC flats as barracks; park; marker 6 Aug 2017 | confirmed | S425, S426 (ns-08) |
| 01 | “most people had long thought little of soldiering” | paraphrase of MINDEF “held military service in low esteem” | S421 (ns-09) |
| 01 | 8 Cessna trainers (1968); MID split 1970; air bases 1971; Enlistment Act 1970 | confirmed | S421, S423, S424 (ns-06, ns-01) |
| 01 | NSmen in SAF, police and civil defence | syllabus wording, no year given (spec §1.3) | S401 (syl-07) |
| 01 | 1954: about 500 students, 13 May; 1967 protests “not as serious” | confirmed | S419, S418 (ns-09) |
| 01 | JW: 14 Jan 1972, MHA wording; no conscientious-objection right; 11 / 14 | as §0.3-4 | S429, S428 (ns-10, J1, J2) |
| 01 | Armed Forces Day 1 July 1969, Jalan Besar, 1,500; armour in NDP 1969 | confirmed | S427, S419 (ns-11) |
| 02 | 18 Nov 1959 Assembly; 3 Dec 1959 City Hall, installation of Yusof Ishak; Toh Chin Chye's committee; national in 1965 | confirmed | S404, S403 (sym-02) |
| 02 | flag, crest meanings; red per the 2022 law; NHB's older wording in the More | confirmed | S411, S404, S405 (sym-03, sym-04) |
| 02 | anthem: Zubir Said 1958 for the City Council; new arrangement 19 Jan 2001 | confirmed | S406 (sym-05) |
| 02 | Pledge: Oct 1965 William Cheng; Ong Pang Boon, Philip Liau, George Thomson; Rajaratnam Feb 1966; LKY and MOE; Cabinet; 24 Aug 1966, 500,000 pupils, 529 schools; “forget differences …” / “regardless of …”; fist from 1988 | confirmed; NLB's “just after independence” noted as differing | S407, S413, S415, S414 (sym-06–sym-08) |
| 02 | flower 15 April 1981, Dhanabalan, 40 flowers / 30 orchids, 1893 | confirmed | S409 (sym-10) |
| 02 | Lion Head 1986, Michael Lee, five partings | confirmed | S408 (sym-09) |
| 02 | Public Seal: arms ringed by “Republic of Singapore”, kept by the President; no adoption year found | confirmed | S410, S411 (sym-11) |
| 02 | National Symbols Act 2022 (No. 29), Bill first read 2 Aug 2022, in force 1 Aug 2023, seven symbols; MCCY still six | confirmed | S411, S404, S403 (sym-01) |
| 02 | first National Day 9 Aug 1966, Padang, Yusof Ishak, 23,000, City Hall–Chinatown–Tanjong Pagar | confirmed | S417 (place-ndp-01) |
| 03 | Konfrontasi bombings in Singapore: 7 dead, 50 injured | confirmed | S449 (reg-01) |
| 03 | relations with Indonesia 7 Sept 1967 | confirmed | S449 |
| 03 | ASEAN 8 Aug 1967, Bangkok, five founders, Rajaratnam; later members | confirmed; “foreign ministers” of the draft changed to “five leaders” (Malaysia's signatory was the Deputy Prime Minister) | S452, S451, S447 (reg-02) |
| 03 | Total Defence 22 Jan 1984, “the national defence concept”, five pillars, digital 2019 | confirmed (MINDEF fact sheets) | S453, S454, S456 (td-01, T1) |
| 03 | 15 February = fall of Singapore, 1942 | confirmed | S441 (rhd-02) |
| 04 | 18 July 1967; 16 Jan 1968; over 20 % of GNP; most gone by Oct 1971; last soldier March 1976 | confirmed | S430 (yrs-01, yrs-02) |
| 04 | 25,000 vs 30,000 + 10,000, about half expected to lose jobs | both in the More, each with its article | S430, S435 (yrs-02) |
| 04 | EDB 1961, UN team, Winsemius; Economic Expansion Incentives Act 1967; National Semiconductor within two weeks (1968) | confirmed | S431, S432 (yrs-05, yrs-07) |
| 04 | CPF for HDB flats from September 1968 | confirmed | S436 (home-01) |
| 04 | 1968 election: Barisan boycott, 7 of 58 contested, PAP all seats | confirmed, no comment added | S430 (yrs-09) |
| 04 | labour laws: “restore the rights of management”; 1,284,029 man-days 1960–67; two NTUC MPs' concerns about the Industrial Arbitration Court | confirmed; the draft's list of matters taken out of bargaining (promotion, transfer) cut, as no read source lists them | S435 (yrs-08) |
| 04 | 8.9 % → 4.5 % (1966–73); about 13 % growth a year | confirmed, called government figures; the More says the figures do not show cause | S433 (yrs-04) |
| 04 | “Goh's Folly”; two first investors; 181 factories, about 20,000 workers by the end of the 1960s | confirmed, one source | S434 (yrs-06) |
| 05 | 1964: July 23 dead, 454 injured; Sept 13 dead, 106 injured; PAP vs Razak accounts | identical to singapore-1819-1965 chapter 11 | S443 (harm-01, harm-04) |
| 05 | Othman Wok: PAP 1954 for multiracialism; called a traitor after 19 July 1964; Social Affairs 1963–77; Muslim law 1966; MUIS 1968 | confirmed | S446, S443 (harm-05, harm-02) |
| 05 | Rajaratnam: foreign minister to 1980, ASEAN, Pledge 1966 | confirmed | S447 (harm-05) |
| 05 | four official languages (Art. 153A); second language compulsory 1960 / 1966; Goh Report 1978: over 60 %, 85 %; SAP 1979; English first language by 1987 except SAP | confirmed | S437, S475 (lang-01, lang-02) |
| 05 | Speak Mandarin 7 Sept 1979; households 76 → 48 %, 13 → 30 % | confirmed | S438 (lang-03) |
| 05 | Lee Kuan Yew 2009: four quotations | confirmed, quoted exactly | S439 (lang-04, lang-05) |
| 05 | National Education 17 May 1997; RHD 21 July | confirmed | S441, S440 (rhd-01) |
| 06 | 2 May 1971, four Nanyang executives, ISA; “glamorising the communist system”; 22 May “admitted”; June affidavits; Herald licence 28 May 1971 | confirmed (NLB; Straits Times issue listings; the first report said three, the government's statement four) | S465, S466 (cost-03, P3) |
| 06 | NPPA third reading 28 Aug 1974, in force 1 Jan 1975; 1986 amendment, “veering towards authoritarianism” | confirmed | S467, S468 (P1, P2) |
| 06 | Spectrum: 16 on 21 May, 6 on 20 June, 22 in all, one month to three years; “Marxist conspiracy”; Tan Wah Piow and Vincent Cheng named | confirmed | S459, S461, S460 (cost-01) |
| 06 | 18 April 1988 statement of nine; eight re-detained on 19 April; statutory declarations (NLB); Teo Soh Lung memoir 2010 (title only) | confirmed | S462, S463, S459 (O5–O7) |
| 06 | “many of them active in Catholic church groups” | from Barr's title and NLB's “church and other groups” | S461, S459 |
| 06 | the four commemorative days, International Friendship Day the third Friday of Term 2 | confirmed | S402, S441 (syl-11, rhd-02) |

## Chinese forms

| Form | Status | Source |
|---|---|---|
| 奥斯曼渥 (no middle dot) | confirmed | 联合早报 2017-04-17 (S448) |
| 胡姬、卓锦万代兰、特选学校、种族和谐日、讲华语运动、全面防卫日、信约、国家象征、狮头标志、邦旗 / 邦徽 / 邦歌 | confirmed | Promote Mandarin Council database (S416, S456, S475) |
| 《前进吧，新加坡！》 | confirmed | NHB anthem page (S406) |
| 国民服役、战备军人、新加坡武装部队、新加坡武装部队军训学院、巴西拉峇军营、吴庆瑞 | confirmed | MINDEF term list (S474) |
| 拉惹勒南、王邦文 | confirmed | 联合早报 2026 (research §4) |
| 杜进才、朱比赛、丹那巴南、林金山、韩瑞生、陈华彪、尚达曼、敦阿都拉萨、亚当·马立克、艾妮丝·卓锦 | standard Singapore forms, not checked in a Zaobao article for this review | — |
| 公共印章、内部安全法令、光谱行动、全面防卫、惹兰勿刹体育场、回教法执行法令、新加坡伊斯兰教理事会、《国民服役（修正）法令》、《征兵法令》、《雇佣法令》、《劳资关系（修正）法令》、《报章与印刷新闻业法令》、《国家象征法令》 | not confirmed in a Singapore Chinese source (search reached no Zaobao text); listed in REVIEW.md | — |
| Taman Jurong (军营 / Greens) | kept in Latin letters; 达曼裕廊 is the likely form but was not confirmed | — |
| William Cheng、Philip Liau、George Thomson、Michael Lee、Vincent Cheng、Michael Barr | kept in Latin letters (no Chinese form found) | — |

## Not read (and what the text does instead)

- NewspaperSG full articles (terms page not accepted; later a bot check): ST 1969-06-01…08, 1971-05-03…06-08, 1965-08-10, TNP 1997-05-17, ST 1998-02-14, ST 1997-07-22. The text uses only what the issue listings show and the source notes say so.
- ST 14 Dec 2001 (Tharman), ST 6 Jul 1991 (Woon), Turnbull 2009 p. 339: not quoted.
- Teo Soh Lung, *Beyond the Blue Gate* (2010): cited as a publication only.
- The 1954 newspapers: the 26 / 45 figures are printed as NHB's account.
- Hansard for the 1966, 1967, 1968 and 1974 laws: the 1968 and 1966 laws are dated to the month or year only.
- The Home Team NS page on Total Defence Day was seen in a search result, not re-read (S455 says so).

## Anchors

Nine events stand at the island's centre [103.8198, 1.3521] (the Pledge, the national flower, the Lion Head, Total Defence, the Speak Mandarin Campaign, English as first language, Racial Harmony Day, the 1971 detentions, Operation Spectrum); every detail says the point means “the whole country”. Four laws stand at the old Parliament House, used until 1999 (S469); the 2023 Act at today's Parliament House. The three withdrawal events stand on the naval base and say the decision was taken in London.
