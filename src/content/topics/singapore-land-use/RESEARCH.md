# Singapore land use — research and unresolved checks

Access date: **20 October 2026**. The first pass stopped at brief step (2), after its tested account-free Collection 2 Level-1 TM/ETM+ access routes failed. That first pass authored no downstream maps, dated layers or chapters. The second pass resumes the build; its content checks are appended below and its geographic results supersede the earlier access stop. See [geographic access audit](../../../../scripts/geo/singapore-land-use/SOURCES-GEO.md) and [final report](../../../../scripts/geo/singapore-land-use/CODEX-REPORT.md).

Original evidence identifiers **E001–E165** and fact identifiers refer to `art/codex-research/singapore-land-use/facts.json` and `land-use-research.md`. Those ledgers contain 136 facts and 83 source entries; they are prior research, not newly audited in their entirety here. Each supplemental record distinguishes a newly read source, inspected local extract, reused ledger, indexed excerpt, or an inaccessible source. “Confirmed” means the identified evidence supports that specific statement; it does not resolve disagreements or convert a search excerpt into a full-source read. Unavailable originals remain explicitly unverifiable. Source text quotations are at most 25 words per excerpt.

The sections below reproduce the topic-local supplemental ledgers, including their pending-check coverage matrices and exact source locators. Machine-readable versions are in `scripts/geo/singapore-land-use/research/`.

## Additional syllabus-version check

**unverifiable** · Spec §1.1: differences between the January and July 2024 primary Social Studies syllabus. Title: *2020 Social Studies Primary Teaching and Learning Syllabus (updated July 2024)*; publisher: Ministry of Education; URL: https://www.moe.gov.sg/-/media/files/syllabus/2020-social-studies-primary-teaching-and-learning-syllabus-updated-july-2024.pdf ; section: edition cover and relevant printed pp.23–27; access date: 20 October 2026. Quotation: none, because the July file was not obtained. The prior gap record reports 404 / bot challenge. The locally retained January edition is readable, but edition equivalence must not be assumed. No repeat network request was made after the mandated stop.



## Housing supplementary research

Access date: 20 October2026. New ids use `housing-*`; original E identifiers are retained. Status confirmed means the specified source supports the stated claim, not that conflicting sources were reconciled. Indexed-only and reused-ledger evidence is labelled. Original Loh book pages were not read. No geometry or imagery from look-only publications was reused.

### Coverage of housing-related pending checks

| Pending check | Record / outcome |
|---|---|
| F3 HDB foundation; SIT count; programme target/output | housing-hdb-founded; housing-sit-and-output-nlb; housing-output-mnd. Output definitions conflict. |
| F5 February1964 launch; beat date | housing-home-ownership-date. Correct exact date to12 February. |
| F7 Act passed/effective; compensation; two perspectives; ownership endpoints | housing-land-act-dates; housing-compensation-history; housing-acquisition-two-sides; housing-public-land-1960; housing-state-land-today. Today90% unverified. |
| §1.4 Loh2013 original pages / rumours / government response | housing-loh-original remains unverifiable; housing-loh-scope only publisher description. |
| §1.5 1959 Kampong Tiong Bahru fire | housing-tiong-bahru-fire confirmed13 February1959. |
| §2.2 headquarters on founding day | housing-founding-office unresolved for1 February;1960 Princess House indexed attestation only. |
| §2.2 Queenstown first flats year | town-queenstown-1953 confirms planning only; first-flat-specific date remains unverified. Do not convert planning1953 to first flats. |
| §2.2 Woodlands; Jurong West town years | housing-woodlands construction1972 indexed caption only; housing-jurong-west unverifiable. |
| §2.2 airports/base dates | housing-paya-lebar; housing-seletar; housing-tengah confirmed; Sembawang/Changi exact opening unresolved. |
| §2.2 1959 estimated population | housing-population1959 gives1,587,200; caption may say about1.6 million. |
| F17 / §2.2 Pinnacle2009-12;50storeys | housing-pinnacle year/height confirmed; housing-pinnacle-keys13 December ceremony. Completion month not independently fixed. |
| §5 HDB-flat99yearlease; majority own flats | housing-99-year-lease supports generally99years; majority-ownership numeric denominator not separately checked here. |
| §5 kampong/attap/newtown/resettlement/acquisition definitions | Existing E102/E121/E123 and town records; housing-acquisition-two-sides; avoid all-villages lack-services claim. |
| §7 void decks; approximately7storeys | housing-void-deck NHB indexed page supports many1960s groundfloors occupied; HDB-only original unavailable; housing-early-flat-design rejects universal7storeys. |


### Evidence records

#### housing-hdb-founded

**confirmed** · F 3; §2.2 hdb-founded

HDB replaced SIT on 1 February 1960.

Source: [Public Housing, Private Lives](https://biblioasia.nlb.gov.sg/all-sections/vol-12-issue-3-oct-dec-2016-public-housing-private-lives/) — National Library Board, BiblioAsia; Building Fast and Furious: 1960–1965; accessed 2026-10-20.

Quote: “1 February 1960”

Evidence: new supplemental record; source page read.



#### housing-sit-and-output-nlb

**confirmed** · F 3; §2.2 early building counts

SIT built 23, 019 units in 32 years. NLB reports HDB first-programme output of 53, 000 flats by end-1965, 3, 000 above its target (therefore target 50, 000).

Source: [Public Housing, Private Lives](https://biblioasia.nlb.gov.sg/all-sections/vol-12-issue-3-oct-dec-2016-public-housing-private-lives/) — National Library Board, BiblioAsia; Building Fast and Furious: 1960–1965; accessed 2026-10-20.

Quote: “53,000 new flats”

Evidence: new supplemental record; source page read.

Output conflicts with housing-output-mnd; retain both. Target 50, 000 is arithmetic from this explicit comparison.

#### housing-output-mnd

**confirmed** · F 3; §2.2 early building counts

MND reports 54, 430 HDB units by mid-1965; SIT output 23, 019 in 1927–1959.

Source: [Groundbreaking: 60 Years of National Development in Singapore](https://www.clc.gov.sg/docs/default-source/books/groundbreaking-60-years-of-national-development-in-singapore.pdf) — Ministry of National Development / Centre for Liveable Cities; Printed pp.30–31, Housing a People (PDF spread index 16); accessed 2026-10-20.

Quote: “54,430 units”

Evidence: new supplemental record; source page read.

Conflicts with NLB 53, 000 flats by end-1965. Unit scope and period not reconciled; original 1965 annual report not read in this pass. Safe prose: more than 50, 000, with both source numbers in More.

#### housing-early-flat-design

**corrected** · §7 housing-change

Early rental blocks varied from five to twelve storeys; some early emergency flats shared kitchens and toilets. A universal seven-storey description is unsupported.

Source: [Public Housing, Private Lives](https://biblioasia.nlb.gov.sg/all-sections/vol-12-issue-3-oct-dec-2016-public-housing-private-lives/) — National Library Board, BiblioAsia; Building Fast and Furious: 1960–1965; accessed 2026-10-20.

Quote: “between five and 12 storeys tall”

Evidence: new supplemental record; source page read.

Do not imply every early household immediately gained a private kitchen or private toilet.

#### housing-home-ownership-date

**corrected** · F 5; §2.2 home-ownership-1964

Home Ownership for the People Scheme launched on 12 February 1964, offering low-income buyers 99-year-lease flats.

Source: [Groundbreaking: 60 Years of National Development in Singapore](https://www.clc.gov.sg/docs/default-source/books/groundbreaking-60-years-of-national-development-in-singapore.pdf) — Ministry of National Development / Centre for Liveable Cities; Printed pp.32–35, Ministers / A Stake in the Nation (PDF spread indices 17–18); accessed 2026-10-20.

Quote: “12 February 1964”

Evidence: new supplemental record; source page read.

Replace draft 1964-02-01 beat/event date with 1964-02-12. This date is launch, not the completion of all sales.

#### housing-99-year-lease

**confirmed** · §5 hdb-flat

Public housing is generally built on State land on a 99-year lease.

Source: [Speech at the Judicial Executive Programme 2022](https://www.mlaw.gov.sg/news/speeches/2022-11-21-speech-k-shanmugam-judicial-executive-programme/) — Ministry of Law / K Shanmugam; 21 November 2022, paragraph 59; accessed 2026-10-20.

Quote: “generally on a 99-year lease”

Evidence: new supplemental record; source page read.

Use generally: do not define every housing product as a 99-year lease.

#### housing-land-act-dates

**confirmed** · F 7; §2.2 land-acquisition-act

Parliament approved the Bill on 26 October 1966; the Act took effect on 17 June 1967. Compensation disputes went to an Appeals Board.

Source: [Land Acquisition Act 1966](https://www.nlb.gov.sg/main/article-detail?cmsuuid=153040f3-9475-444a-ba5c-be2a56658c34) — National Library Board, Singapore Infopedia; Pressing needs for land, paragraph 3; accessed 2026-10-20.

Quote: “came into effect on 17 June”

Evidence: new supplemental record; source page read.

Approval and commencement are different milestones. SSO current Act URL https://sso.agc.gov.sg/Act/LAA 1966 returned tool error; dates independently readable here. CLC Land Framework wording calls 26 October introduction, conflicting with NLB; use approved, supported by NLB.

#### housing-compensation-history

**corrected** · F 7; §1.4 compensation

The 1966 formula discounted market value through exclusions. From 1973–2007 it used current or statutory historical value, whichever lower; after 2007 current value became primary.

Source: [Land Acquisition and Resettlement: Securing Resources for Development](https://isomer-user-content.by.gov.sg/50/aac3af3c-1e66-411c-93eb-41c12cd6730f/uss-land-acquisition-and-resettlement.pdf) — Centre for Liveable Cities; Printed pp.16–17 (PDF spread 18); accessed 2026-10-20.

Quote: “whichever was lower”

Evidence: new supplemental record; source page read.

Do not back-project current market-value rules onto all historical acquisitions. Legal historical description, not advice.

#### housing-acquisition-two-sides

**confirmed** · §1.4 compensation

Lee argued public-funded land gains should benefit the community. CLC records that historical valuations left some owners unable to afford suitable replacement property.

Source: [Land Acquisition and Resettlement: Securing Resources for Development](https://isomer-user-content.by.gov.sg/50/aac3af3c-1e66-411c-93eb-41c12cd6730f/uss-land-acquisition-and-resettlement.pdf) — Centre for Liveable Cities; Printed pp.16–17, 36–39 (PDF spreads 18, 28–29); accessed 2026-10-20.

Quote: “insufficient for them to purchase”

Evidence: new supplemental record; source page read.

Government rationale is attributed to Lee; hardship is CLC documented consequence. CLC also presents owners’ risk/private-improvements argument. No named resident quote or universal time-pressure claim verified here.

#### housing-public-land-1960

**confirmed** · F 7 State-land share start

Public-sector land, including statutory boards, increased from 44% in 1960 to over 85% in 2007.

Source: [Land Acquisition and Resettlement: Securing Resources for Development](https://isomer-user-content.by.gov.sg/50/aac3af3c-1e66-411c-93eb-41c12cd6730f/uss-land-acquisition-and-resettlement.pdf) — Centre for Liveable Cities; Printed pp.56–57 (PDF spread 38); accessed 2026-10-20.

Quote: “44% to over 85%”

Evidence: new supplemental record; source page read.

Different denominator and dates from State-owned land today. Do not label this series 1960s 44%→2025 90%.

#### housing-state-land-today

**unverifiable** · F 7 State-land share end

An official contemporary 90% State-land figure was not verified; do not state today 90% as settled.

Source: [Land Acquisition Act 1966](https://www.nlb.gov.sg/main/article-detail?cmsuuid=153040f3-9475-444a-ba5c-be2a56658c34) — National Library Board; Biggest landowner; accessed 2026-10-20.

Quote: “76.2 percent”

Evidence: new supplemental record; source page read.

Readable NLB gives government 76.2% in 1985 and 31% in 1949, while CLC gives public-sector 44% in 1960 and>85% in 2007. They are different metrics. Recent opposition speech says 90%, but source/dataset denominator not established.

#### housing-bhs

**confirmed** · F 4; §1.4 cause; §2.2 bukit-ho-swee-fire/rebuilt

25 May 1961 fire:100 acres, about 16, 000 homeless, four deaths; cause unknown. Remaining families rehoused by February 1962. HDB built 12, 562 flats on fire/adjacent lands by 1967.

Source: [Bukit Ho Swee fire](https://www.nlb.gov.sg/main/article-detail?cmsuuid=8a0ca033-7b44-47a1-b4cd-f841debdf6db) — National Library Board, Singapore Infopedia; Introduction; Relocation of affected families; accessed 2026-10-20.

Quote: “The cause of the fire remains unknown.”

Evidence: E090, E091, E092, E093, E094, E095; source page read.

Write by February 1962, not before February 1962. Counts and chronology independently re-read.

#### housing-tiong-bahru-fire

**confirmed** · §1.5 1959 fire

Kampong Tiong Bahru fire on 13 February 1959 destroyed homes of around 12, 000 people.

Source: [Bukit Ho Swee fire](https://www.nlb.gov.sg/main/article-detail?cmsuuid=8a0ca033-7b44-47a1-b4cd-f841debdf6db) — National Library Board, Singapore Infopedia; Kampong Bukit Ho Swee, paragraph 2; accessed 2026-10-20.

Quote: “13 February 1959”

Evidence: new supplemental record; source page read.

NLB cites Straits Times 14 February 1959, p.1 and HDB Bukit Ho Swee Estate 1967, p.7; original newspaper not read.

#### housing-loh-original

**unverifiable** · §1.4 Loh 2013 pages/rumours/government response

Loh 2013 original pages on arson rumours, their evidence and government response could not be accessed.

Source: [Squatters into Citizens: The 1961 Bukit Ho Swee Fire and the Making of Modern Singapore](https://nuspress.nus.edu.sg/products/squatters-into-citizens) — NUS Press; Publisher description; no original book page available; accessed 2026-10-20.

Quote: “oral history interviews, official records and media reports”

Evidence: new supplemental record; source page read.

Readable publisher description confirms methods and scope only. It supplies no original pagination or causal verdict. NLB references pp.148, 154, 158, 166; these are citations, not pages read. Do not quote reviews as Loh original text.

#### housing-loh-scope

**confirmed** · §1.4 Loh 2013

Publisher describes a study of the fire, relocation, memory and everyday lives; it is not proof of any arson theory.

Source: [Squatters into Citizens: The 1961 Bukit Ho Swee Fire and the Making of Modern Singapore](https://nuspress.nus.edu.sg/products/squatters-into-citizens) — NUS Press; Publisher description; accessed 2026-10-20.

Quote: “the nature of memory”

Evidence: new supplemental record; source page read.

Published 2013; NUS publisher says 330 pages. No full book or alleged rumour pages read.

#### housing-founding-office

**unverifiable** · §2.2 hdb-founded office

NHB places HDB headquarters at Princess House in 1960, but the exact office on founding day 1 February was not verified.

Source: [Queenstown: The Queen of Singapore’s Heartlands](https://www.roots.gov.sg/stories-landing/stories/queenstown-the-queen-of-housing-estates/story) — National Heritage Board; Crown jewels; accessed 2026-10-20.

Quote: “sited its headquarters there in 1960”

Evidence: new supplemental record; official indexed excerpt only.

Source readable in indexed excerpt; direct Roots pages challenged. Do not shift founding event to Princess House with day precision; use general city anchor.

#### housing-void-deck

**confirmed** · §7 housing-change

NHB says many 1960s blocks had ground-floor homes/shops; open ground floors became common from 1970s, with an older 1963 example at Jalan Klinik.

Source: [Void Decks](https://www.nhb.gov.sg/~/media/nhb/files/resources/publications/ebooks/nhb_ebook_void_decks.pdf) — National Heritage Board; Printed p.2, A History of Void Decks in Singapore; accessed 2026-10-20.

Quote: “many of the HDB blocks built during that period were filled with either homes or shops”

Evidence: new supplemental record; official indexed page text only.

Official indexed full page text read; direct URL returns JS challenge/404. Qualified many, not all; 1963 oldest claim is explicitly attributed by NHB to Straits Times. HDB-only original source remains unavailable.

#### housing-void-deck-hdb-only

**unverifiable** · §7 request HDB source

An HDB-published source for the first/general introduction of void decks was not retrieved.

Source: [Our History](https://www.hdb.gov.sg/about-us/our-story/our-history) — Housing & Development Board; Page shell only; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; source page read.

NHB source above supports illustration choice; do not claim HDB-primary-source verification.

#### housing-woodlands

**confirmed** · §2.2 woodlands-new-town

NHB describes first Marsiling HDB Blocks 1–5 under construction in 1972, a defensible early-building milestone rather than whole-town completion.

Source: [Woodlands Heritage Trail: Our Heritage](https://www.roots.gov.sg/-/media/Roots/Files/Woodlands-Heritage-Trail/NHB22_Woodlands_Trail-Booklet_web.pdf) — National Heritage Board; Housing section / caption; printed page not established; accessed 2026-10-20.

Quote: “first HDB flats (Blocks 1-5)”

Evidence: new supplemental record; official indexed excerpt only.

Official indexed excerpt read; direct PDF challenged. Caption dates construction photograph 1972. Do not infer first occupancy date.

#### housing-jurong-west

**unverifiable** · §2.2 jurong-west-new-town

No single first-development or first-occupancy year verified for Jurong West.

Source: [Jurong West](https://www.hdb.gov.sg/about-us/our-towns-and-estates/jurong-west) — Housing & Development Board; HTML returned town navigation only; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; source page read.

Primary HDB 1981 model-flat and construction releases mention Jurong West but do not establish town founding. Do not use secondary website 1981 as verified town date.

#### housing-pinnacle

**confirmed** · F 17; §2.2 pinnacle-duxton

Pinnacle@Duxton was completed in 2009 and has 50-storey blocks.

Source: [Groundbreaking:60 Years of National Development in Singapore](https://www.clc.gov.sg/docs/default-source/books/groundbreaking-60-years-of-national-development-in-singapore.pdf) — Ministry of National Development / CLC; Chapter 5, Pinnacle@Duxton caption; accessed 2026-10-20.

Quote: “Completed in 2009”

Evidence: new supplemental record; source page read.

Year and height confirmed; completion month not established from this source. Key handover date separately documented below.

#### housing-pinnacle-keys

**confirmed** · §2.2 pinnacle-duxton December date

NAS catalogue records Pinnacle@Duxton key handover ceremony on 13 December 2009.

Source: [Minister Mentor Lee Kuan Yew cutting the ribbon to open…](https://www.nas.gov.sg/archivesonline/photographs/record-details/c85d5fb9-5801-11e7-83df-0050568939ad) — National Archives of Singapore / MICA; Covering Date and agency description; accessed 2026-10-20.

Quote: “13/12/2009”

Evidence: new supplemental record; source page read.

This is a key-handover ceremony, not necessarily construction-completion day. Photo look-only; no image reused.

#### housing-paya-lebar

**confirmed** · §2.2 site-paya-lebar-airport

Paya Lebar Airport officially opened 20 August 1955.

Source: [Paya Lebar Air Base](https://www.ura.gov.sg/land-planning/master-plan/master-plan-2025/regional-plans/north-east/paya-lebar-air-base/) — Urban Redevelopment Authority; Peering down memory lane; accessed 2026-10-20.

Quote: “officially opened on 20 August 1955”

Evidence: new supplemental record; source page read.



#### housing-seletar

**confirmed** · §2.2 site-seletar-airbase

Seletar began operations in 1928; official opening 1 January 1930.

Source: [Former Royal Air Force Seletar Conservation Area](https://www.ura.gov.sg/conservation/find-a-building/conservation-portal/frafs/) — Urban Redevelopment Authority; The History; accessed 2026-10-20.

Quote: “began operations in 1928 and was officially opened on 1 January 1930”

Evidence: new supplemental record; source page read.

Keep 1928 as operations milestone, distinguish formal opening.

#### housing-tengah

**confirmed** · §2.2 site-tengah-airbase

RSAF dates building of RAF Tengah to 1939.

Source: [1971/09 - Tengah Air Base](https://www.rsaf.gov.sg/about-us/history/history-of-the-rsaf/1971-sep-tengah-air-base/) — Republic of Singapore Air Force; History body; accessed 2026-10-20.

Quote: “Built in 1939”

Evidence: new supplemental record; source page read.

Construction year verified; no exact opening date established.

#### housing-sembawang-airbase

**unverifiable** · §2.2 site-sembawang-airbase

Sembawang was operational by 1940, but an exact opening milestone not established.

Source: [Singapore, Straits Settlements.1940-08. The Sergeant’s Mess…](https://www.awm.gov.au/collection/C20402) — Australian War Memorial; Accession 078724, date and description; accessed 2026-10-20.

Quote: “1940-08”

Evidence: new supplemental record; source page read.

Primary catalogue confirms existence byAugust 1940. Do not infer exact opening date from a photo. Other histories disagree on transfer/operations dates; no date selected.

#### housing-changi-airbase

**unverifiable** · §2.2 site-changi-airbase

Changi airfield is present on a 1946 topographical index, but exact airbase opening date remains unverified.

Source: [Index to Old Topographical Sheets of Singapore](https://www.nas.gov.sg/archivesonline/maps_building_plans/record-details/f9288abe-115c-11e3-83d5-0050568939ad) — National Archives of Singapore; 1946 catalogue description; accessed 2026-10-20.

Quote: “Changi Airfields”

Evidence: new supplemental record; source page read.

Look-only catalogue existence evidence, not geospatial permission or an opening year. Distinguish wartime Japanese airstrip from postwar RAF station.

#### housing-population1959

**corrected** · §2.2 crowded-city beat 1

Official annual total-population series gives 1, 587, 200 in 1959; 1957 is 1, 445, 929.

Source: [Indicators On Population, Annual](https://data.gov.sg/datasets/d_3d227e5d9fdec73f3bcadce671c333a6/view) — Singapore Department of Statistics; Total Population row, 1959 column; accessed 2026-10-20.

Quote: “1587200”

Evidence: E025; source page read.

1959 is new evidence, not what E 025 originally covered; E 025 remains the 1957 value. Caption can say about 1.6 million in 1959. Do not label annual 1959 estimate a census count.

#### kampong-services-varied

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Kampong Wak Sumang received piped water, electricity, paved roads and drainage during the 1960s.

Source: [Remembering Punggol’s Kampong Wak Sumang and the Man Who Made It Happen](https://biblioasia.nlb.gov.sg/all-sections/vol-19-issue-2-jul-sep-2023-kampong-wak-sumang-punggol/) — National Library Board, BiblioAsia; Developing Punggol; accessed 2026-10-20.

Quote: “In the 1960s, Kampong Wak Sumang welcomed piped water, electricity, paved roads and drainage systems.”

Evidence: E013; existing evidence ledger reused.

A named counterexample to any claim that every kampong lacked services throughout the 1960s. Do not generalise one settlement’s experience to all.

#### hdb-population-share-1960

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB historical chart gives 9% of total population living in HDB flats in 1960.

Source: [HDB Annual Report 2020/2021 — Key Statistics](https://assets.hdb.gov.sg/about-us/news-and-publications/annual-report/2021/assets/ebooks/key-statistics.pdf) — Housing & Development Board; printed p. 13 (PDF p. 7), Resident Population in HDB Flats chart and notes; accessed 2026-10-20.

Quote: “9%”

Evidence: E041; existing evidence ledger reused.

Historical chart estimate rounded to whole percent. Chart note: pre-1980 except 1970 uses total population; 1970 and 1980 onwards uses residents. 2021 point is March. From 2003 residents overseas for continuous 12 months or longer are excluded.

#### hdb-population-share-1965

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB historical chart gives 23% of total population living in HDB flats in 1965.

Source: [HDB Annual Report 2020/2021 — Key Statistics](https://assets.hdb.gov.sg/about-us/news-and-publications/annual-report/2021/assets/ebooks/key-statistics.pdf) — Housing & Development Board; printed p. 13 (PDF p. 7), Resident Population in HDB Flats chart and notes; accessed 2026-10-20.

Quote: “23%”

Evidence: E042; existing evidence ledger reused.

Historical chart estimate rounded to whole percent. Chart note: pre-1980 except 1970 uses total population; 1970 and 1980 onwards uses residents. 2021 point is March. From 2003 residents overseas for continuous 12 months or longer are excluded.

#### hdb-population-share-1970

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB historical chart gives 35% of resident population living in HDB flats in 1970.

Source: [HDB Annual Report 2020/2021 — Key Statistics](https://assets.hdb.gov.sg/about-us/news-and-publications/annual-report/2021/assets/ebooks/key-statistics.pdf) — Housing & Development Board; printed p. 13 (PDF p. 7), Resident Population in HDB Flats chart and notes; accessed 2026-10-20.

Quote: “35%”

Evidence: E043; existing evidence ledger reused.

Historical chart estimate rounded to whole percent. Chart note: pre-1980 except 1970 uses total population; 1970 and 1980 onwards uses residents. 2021 point is March. From 2003 residents overseas for continuous 12 months or longer are excluded.

#### hdb-population-share-1980

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB historical chart gives 67% of resident population living in HDB flats in 1980.

Source: [HDB Annual Report 2020/2021 — Key Statistics](https://assets.hdb.gov.sg/about-us/news-and-publications/annual-report/2021/assets/ebooks/key-statistics.pdf) — Housing & Development Board; printed p. 13 (PDF p. 7), Resident Population in HDB Flats chart and notes; accessed 2026-10-20.

Quote: “67%”

Evidence: E045; existing evidence ledger reused.

Historical chart estimate rounded to whole percent. Chart note: pre-1980 except 1970 uses total population; 1970 and 1980 onwards uses residents. 2021 point is March. From 2003 residents overseas for continuous 12 months or longer are excluded.

#### hdb-population-share-1990

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB historical chart gives 87% of resident population living in HDB flats in 1990.

Source: [HDB Annual Report 2020/2021 — Key Statistics](https://assets.hdb.gov.sg/about-us/news-and-publications/annual-report/2021/assets/ebooks/key-statistics.pdf) — Housing & Development Board; printed p. 13 (PDF p. 7), Resident Population in HDB Flats chart and notes; accessed 2026-10-20.

Quote: “87%”

Evidence: E047; existing evidence ledger reused.

Historical chart estimate rounded to whole percent. Chart note: pre-1980 except 1970 uses total population; 1970 and 1980 onwards uses residents. 2021 point is March. From 2003 residents overseas for continuous 12 months or longer are excluded.

#### hdb-resident-share-2025-03-31

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

At end-March 2025, 76.0% of Singapore resident population lived in HDB flats.

Source: [HDB Key Statistics 2024/2025](https://www.hdb.gov.sg/-/media/hdb-pulse/reports/annual-reports-and-financial-statements/HDB_Key-Statistics-2025.pdf) — Housing & Development Board; printed p. 07 (PDF p. 7), Statistical Highlights, FY 2024 column and footnote 1; accessed 2026-10-20.

Quote: “76.0”

Evidence: E053; existing evidence ledger reused.

Denominator is resident persons, not resident households, total population, flat owners, or share of dwelling stock. FY 2024 refers here to end-March 2025.

#### living-shophouses

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Around 1960, some families occupied small shophouse cubicles in buildings shared with other households.

Source: [Who’s Your Neighbour?](https://isomer-user-content.by.gov.sg/98/86474f7e-5dec-4de7-8666-c54e80fedffe/NIC-whos-your-neighbour.pdf) — National Heritage Board, with National Integration Council and Housing & Development Board; Printed p.7, From urban slums to high-rise living (PDF p.5 spread); accessed 2026-10-20.

Quote: “shophouse cubicle”

Evidence: E096; existing original-document extract inspected locally.



#### living-services

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Thousands lived in informal settlements lacking household piped water, reliable electricity and adequate sanitation/waste disposal. Do not generalise this to every kampong.

Source: [Who’s Your Neighbour?](https://isomer-user-content.by.gov.sg/98/86474f7e-5dec-4de7-8666-c54e80fedffe/NIC-whos-your-neighbour.pdf) — National Heritage Board, with National Integration Council and Housing & Development Board; Printed p.7, From urban slums to high-rise living (PDF p.5 spread); accessed 2026-10-20.

Quote: “no piped water”

Evidence: E097; existing original-document extract inspected locally.



#### living-bhs-fast-blocks

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

NHB records five HDB blocks completed in nine months to house families displaced by the Bukit Ho Swee fire.

Source: [Who’s Your Neighbour?](https://isomer-user-content.by.gov.sg/98/86474f7e-5dec-4de7-8666-c54e80fedffe/NIC-whos-your-neighbour.pdf) — National Heritage Board, with National Integration Council and Housing & Development Board; Printed p.7, Did you know? (PDF p.5 spread); accessed 2026-10-20.

Quote: “nine months”

Evidence: E099; existing original-document extract inspected locally.



#### living-adjustment

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

For some residents, moving from kampong houses or shophouses to high-rise flats initially involved difficult adjustments.

Source: [Who’s Your Neighbour?](https://isomer-user-content.by.gov.sg/98/86474f7e-5dec-4de7-8666-c54e80fedffe/NIC-whos-your-neighbour.pdf) — National Heritage Board, with National Integration Council and Housing & Development Board; Printed p.9, Moving up! (PDF p.6 spread); accessed 2026-10-20.

Quote: “initially difficult”

Evidence: E101; existing original-document extract inspected locally.



#### living-attap-material

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

NHB describes traditional kampong houses with sloping roofs, often thatched with palm fronds, and raised floors that help ventilation and coping with wet ground.

Source: [‘Kampong’ house](https://www.roots.gov.sg/Collection-Landing/listing/1077823) — National Heritage Board / National Museum of Singapore; Collection description, accession 1995-01616; accessed 2026-10-20.

Quote: “The roof is covered with ‘attap’, which is made from palm fronds.”

Evidence: E102; existing evidence ledger reused.



#### living-resettlement-personal

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Au Seck Ngee’s family described leaving their familiar kampong for their first flat as a major life change. They needed HDB help explaining English contracts.

Source: [人民的家园](https://www.foundersmemorial.gov.sg/shapeourmemorial/ch/onlineexhibition/detail/homes-for-the-people) — Founders’ Memorial, National Heritage Board; Au Seck Ngee and the HDB documents for his first flat; accessed 2026-10-20.

Quote: “人生中的重大改变”

Evidence: E103; existing evidence ledger reused.



#### town-queenstown-1953

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

SIT planned Queenstown as Singapore’s first satellite town in 1953. This is a planning milestone, not a whole-town completion year.

Source: [Queenstown Town Design Guide](https://www.hdb.gov.sg/-/media/about-us/our-role/plan-and-design-towns/town-design-guides/Queenstown-Town-Design-Guide.pdf) — Housing & Development Board; Printed p.10, Historical Background; accessed 2026-10-20.

Quote: “In 1953, SIT planned Queenstown as the first satellite town”

Evidence: E105; existing original-document extract inspected locally.



#### town-toapayoh-1964

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Toa Payoh land preparation took place in 1964, ahead of HDB’s second five-year building programme in 1965; HDB calls it its first comprehensively planned town.

Source: [Toa Payoh](https://www.hdb.gov.sg/about-us/our-towns-and-estates/toa-payoh) — Housing & Development Board; History of Toa Payoh; Evolving through the years; accessed 2026-10-20.

Quote: “The land was then prepared in 1964”

Evidence: E106; existing evidence ledger reused.



#### town-amk-1973

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Ang Mo Kio’s first slab blocks were built in 1973, within Neighbourhoods 2 and 3.

Source: [Ang Mo Kio Town Design Guide](https://www.hdb.gov.sg/-/media/about-us/our-role/plan-and-design-towns/town-design-guides/Ang-Mo-Kio-Town-Design-Guide.pdf) — Housing & Development Board; Printed p.12, Evolution of Ang Mo Kio; accessed 2026-10-20.

Quote: “First slab blocks built in 1973”

Evidence: E107; existing original-document extract inspected locally.



#### town-tampines-1979

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

Construction of Tampines New Town began in 1979.

Source: [Tampines](https://curiocity.nlb.gov.sg/resource-room/tampines/) — National Library Board, Curiocity; Opening paragraph; accessed 2026-10-20.

Quote: “With its construction beginning in 1979”

Evidence: E108; existing evidence ledger reused.



#### town-tengah-keys-2023

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

The first Tengah residents collected keys at Plantation Acres and Plantation Grange in August 2023.

Source: [HDB Annual Report 2023/2024](https://www.hdb.gov.sg/-/media/hdb-pulse/reports/annual-reports-and-financial-statements/HDB-AR-FY23.pdf) — Housing & Development Board; Printed p.18, Tengah’s Progress Milestones at a Glance; accessed 2026-10-20.

Quote: “First Keys Delivered”

Evidence: E109; existing original-document extract inspected locally.



#### town-tengah-projects-2023

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

All residential blocks at Tengah’s first two BTO projects, Plantation Acres and Plantation Grange, were completed in December 2023.

Source: [HDB Annual Report 2023/2024](https://www.hdb.gov.sg/-/media/hdb-pulse/reports/annual-reports-and-financial-statements/HDB-AR-FY23.pdf) — Housing & Development Board; Printed p.18, Tengah’s Progress Milestones at a Glance; accessed 2026-10-20.

Quote: “All residential blocks at Plantation Acres and Plantation Grange completed”

Evidence: E110; existing original-document extract inspected locally.



#### term-hdb

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

HDB flat / public housing flat: 组屋

Source: [Speak Mandarin Campaign celebrates its 40th anniversary (Chinese press release)](https://www.languagecouncils.sg/mandarin/en/-/media/smc/documents/2019/press-release---speak-mandarin-campaign-celebrates-its-40th-anniversary-chi.pdf) — Promote Mandarin Council / Speak Mandarin Campaign; Printed p.8, 组屋 entry; accessed 2026-10-20.

Quote: “由新加坡政府建造的居民住宅。”

Evidence: E121; existing evidence ledger reused.

Official Singapore Mandarin entry; 组屋 denotes the flat, while HDB agency is 建屋发展局

#### term-kampong

**confirmed** · F 2/F 4/F 6/F 8; §5 (existing evidence)

kampong / kampung / village: 甘榜

Source: [甘榜精神 / kampung spirit](https://www.languagecouncils.sg/mandarin/en/learning-resources/singaporean-mandarin-database/terms/kampung-spirit) — Singapore Mandarin Council, Singaporean Mandarin Database; 由来 / Etymology; accessed 2026-10-20.

Quote: ““甘榜”一词是马来语 kampung 的音译，泛指乡村。”

Evidence: E123; existing evidence ledger reused.

Explicit official bilingual etymology; kampong is a village/community, not a synonym for poverty

#### housing-queenstown-first-flats

**unverifiable** · §1.4; §2.2; §5 supplementary gap

The precise first-flat completion date for the queenstown-first-flats event was not established.

Source: [Queenstown Town Design Guide](https://www.hdb.gov.sg/-/media/about-us/our-role/plan-and-design-towns/town-design-guides/Queenstown-Town-Design-Guide.pdf) — Official source named in URL; Printed p.10; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; unresolved at user-directed access stop.

E 105 confirms planning in 1953 and neighbourhood date ranges only; do not substitute planning for first completion.

#### housing-majority-homeowners

**unverifiable** · §1.4; §2.2; §5 supplementary gap

The glossary assertion that most HDB residents own their units needs a current household-based measure; this supplement did not verify it.

Source: [HDB Key Statistics 2024/2025](https://www.hdb.gov.sg/-/media/hdb-pulse/reports/annual-reports-and-financial-statements/HDB_Key-Statistics-2025.pdf) — Official source named in URL; Ownership denominator not inspected in this pass; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; unresolved at user-directed access stop.

Resident persons in HDB flats (E 053, 76.0%) is not the home-ownership share. Do not use one as the other.

#### housing-pinnacle-completion-month

**unverifiable** · §1.4; §2.2; §5 supplementary gap

Exact construction-completion month for Pinnacle@Duxton was not confirmed; year 2009 and key ceremony 13 December 2009 are separately supported.

Source: [Pinnacle@Duxton key handover catalogue record](https://www.nas.gov.sg/archivesonline/photographs/record-details/c85d5fb9-5801-11e7-83df-0050568939ad) — Official source named in URL; Covering date; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; unresolved at user-directed access stop.

Use ceremony label if assigning 13 December; do not relabel it completion day.

#### housing-resettlement-time-pressure

**unverifiable** · §1.4; §2.2; §5 supplementary gap

A direct named-resident source for insufficient notice or relocation time pressure was not read.

Source: [Land Acquisition and Resettlement: Securing Resources for Development](https://isomer-user-content.by.gov.sg/50/aac3af3c-1e66-411c-93eb-41c12cd6730f/uss-land-acquisition-and-resettlement.pdf) — Official source named in URL; Time-pressure attribution not verified; accessed 2026-10-20.

Quote: None: exact claim or source body unavailable.

Evidence: new supplemental record; unresolved at user-directed access stop.

CLC documents compensation hardship and owners’ lack of choice; this does not verify every draft claim about deadlines.

### Remaining unverified

- `housing-state-land-today`: An official contemporary 90% State-land figure was not verified; do not state today 90% as settled.
- `housing-loh-original`: Loh 2013 original pages on arson rumours, their evidence and government response could not be accessed.
- `housing-founding-office`: NHB places HDB headquarters at Princess House in 1960, but the exact office on founding day 1 February was not verified.
- `housing-void-deck-hdb-only`: An HDB-published source for the first/general introduction of void decks was not retrieved.
- `housing-jurong-west`: No single first-development or first-occupancy year verified for Jurong West.
- `housing-sembawang-airbase`: Sembawang was operational by 1940, but an exact opening milestone not established.
- `housing-changi-airbase`: Changi airfield is present on a 1946 topographical index, but exact airbase opening date remains unverified.
- `housing-queenstown-first-flats`: The precise first-flat completion date for the queenstown-first-flats event was not established.
- `housing-majority-homeowners`: The glossary assertion that most HDB residents own their units needs a current household-based measure; this supplement did not verify it.
- `housing-pinnacle-completion-month`: Exact construction-completion month for Pinnacle@Duxton was not confirmed; year 2009 and key ceremony 13 December 2009 are separately supported.
- `housing-resettlement-time-pressure`: A direct named-resident source for insufficient notice or relocation time pressure was not read.

Research stopped when the parent confirmed the user-directed Landsat account/billing gate. No new accounts, geometry, downstream authoring or paid access. Original Loh book pages were not read; publisher descriptions and NLB citations are explicitly distinguished. This supplementary ledger does not assert open image or map licences for text references.


## Land, food and environment verification

Access date: 20 October 2026. Scope: assigned food/land/environment pending checks in spec §§1.3, 1.4, 2.2 and 5. Existing evidence IDs are retained. This is a research ledger, not publishable chapter prose.

Research stopped when the parent confirmed that the mandated anonymous Landsat route was blocked. No map/date was invented to fill a gap.

Status counts: confirmed 32, corrected 5, unverifiable 19.

### Coverage matrix

| Check | Spec | Status | Finding |
|---|---|---|---|
| pig-farming-announcement | F11; §2.2 ch03 | confirmed | Goh Keng Swee announced the phase-out policy in Parliament in March 1984. |
| pig-farming-government-rationale | F11; §1.4; ch03 | confirmed | Government cited treatment cost, scarce land/water, smell and homes approaching farmland. Lim Chu Kang farms were to stop by June 1986. |
| pig-farming-catchment | F11; §1.4; ch03 | confirmed | Pig-farm runoff threatened Kranji catchment; relocation preceded the island-wide phase-out. |
| pig-farming-completion | F11; ch03 pig-farming-phase-out | corrected | CLC dates the last pig phase-out to 1989. |
| pig-farming-farmers-perspective | §1.4; ch03 | confirmed | Koh Lip Lin criticised the reversal after farmers invested in Punggol; some families entered retail. CLC describes loss of family ties and identity. |
| pig-farmers-overseas | §1.4 farmers moving to neighbouring countries | unverifiable | Individual farmers’ relocation to neighbouring countries was not verified in the inspected sources. |
| farm-count-and-area-transition | F1; F10; ch03 | confirmed | SFA gives 20,000 farms in 1959 and farmland shrinking from about 14,000 to 8,400 hectares as the 1970s began. |
| farm-phaseout-count | F10; ch03 | confirmed | CLC reports roughly 8,000 farms phased out in 1975–1984, about 7,900 remaining, and about 1,500 hectares by the 1980s. |
| farm-park-lim-chu-kang | F12; §3.4 farm-parks | unverifiable | Lim Chu Kang: 1986 land reservation verified; individual opening/gazette year unverified. |
| farm-park-murai | F12; §3.4 farm-parks | unverifiable | Murai: 1986 land reservation verified; individual opening/gazette year unverified. |
| farm-park-sungei-tengah | F12; §3.4 farm-parks | unverifiable | Sungai Tengah: 1986 land reservation verified; individual opening/gazette year unverified. |
| farm-park-nee-soon | F12; §3.4 farm-parks | unverifiable | Nee Soon: 1986 land reservation verified; individual opening/gazette year unverified. |
| farm-park-loyang | F12; §3.4 farm-parks | unverifiable | Loyang: 1986 land reservation verified; individual opening/gazette year unverified. |
| farm-park-ah-ma-keng | F12; §3.4 farm-parks | unverifiable | Ah Ma Keng: 1986 land reservation verified; individual opening/gazette year unverified. |
| agrotech-first-tender | F12; ch03 agrotech-parks-1986 | confirmed | The September 1986 release scheduled first tenders for Sungei Tengah, Murai and Loyang for 5 September 1986; wider development was planned for 1986–1992. |
| farm-park-chinese-names | F12 Chinese place names | unverifiable | Chinese names for all six historical agrotechnology parks were not individually verified. |
| food-import-share | F13; ch03 final beat | confirmed | SFA states that Singapore imports over 90% of its food. |
| first-indoor-farm-sfa | F13; ch03 first-indoor-farm | confirmed | SFA dates Singapore’s first indoor farm to 2014. |
| first-indoor-farm-panasonic | F13; ch03 first-indoor-farm | corrected | Panasonic announced pilot commercial supply on 31 July 2014; its release says the facility was established in October 2013. |
| first-indoor-farm-location | ch03 first-indoor-farm coordinates | unverifiable | Jalan Ahmad Ibrahim is reported by The Straits Times; exact site/address and publishable point coordinates were not verified from primary evidence. |
| jurong-conception | F9; ch02 jurong-industrial-estate | confirmed | JTC dates the estate’s conception to 1961. |
| jurong-construction-day | F9; ch02 jurong-industrial-estate | unverifiable | A single estate-wide start/opening day was not established; sources disagree on the National Iron & Steel Mills foundation-stone day. |
| jtc-founded | F9; ch02 jtc-founded | unverifiable | Jurong Town Corporation Act commencement is 1 June 1968, but direct SSO access was blocked. |
| tuas-industrial-opening | §3.4 estates: Tuas | unverifiable | NLB describes industrial development following 1970s resettlement; no precise estate opening year was verified. |
| woodlands-industrial-opening | §3.4 estates: Woodlands | unverifiable | Woodlands Town Plan 1971–1975 included industry, but an industrial-estate opening year was not verified. |
| seletar-aerospace-opening | §3.4 estates: Seletar Aerospace Park | unverifiable | JTC’s indexed Dream Factories timeline places first tenants in 2010; full PDF text could not be read reliably. |
| reserve-bukit-timah | F19; §3.4 reserves | confirmed | Bukit Timah was declared a Nature Reserve in 1990, according to NParks’ current history page. |
| reserve-central-catchment | F19; §3.4 reserves | confirmed | Central Catchment was declared a Nature Reserve in 1990, according to NParks’ current history page. |
| reserve-bukit-timah-earlier-status | F19 chronology conflict | corrected | NParks’ public history gives forest-reserve establishment 1883 and Ordinance protection 1951; its research paper dates forest/nature declarations 1887/1951. |
| reserve-sungei-buloh | F19; ch06 sungei-buloh-reserve | confirmed | Sungei Buloh opened as a Nature Park in 1993 and was gazetted a Nature Reserve in 2002. |
| reserve-labrador | F19; ch06 labrador-reserve | unverifiable | NParks’ indexed educational factsheet gives gazette date 1 January 2002; full PDF could not be retrieved. |
| east-coast-reclamation | F16; ch05 east-coast-reclamation | corrected | Official start 1966; seven phases over about thirty years. The spec’s 1985 overall endpoint is unsupported. |
| east-coast-phases | F16; coast matching | confirmed | Phases I–II: 1966–1971; III–IV: 1971–1975; V: 1974–1977. |
| marina-bay-reclamation | F16; ch05 marina-bay-reclamation | confirmed | Marina Centre: 1974–1977; Marina East/South phases began 1979; bay-edge works: 1990–1992. |
| jurong-tuas-reclamation | F16; ch05 tuas-reclamation | confirmed | Jurong reclamation: 1963; Jurong/Tuas expansion: 1970s; Tuas extension: late 1980s. |
| jurong-island-completion-conflict | F16; coast matching | corrected | NLB reports scheme beginning 1993 and completion 2003; JTC timeline gives completion 2009; opening 2000 is separate. |
| changi-reclamation | F16; ch04 changi-airport-opens | confirmed | Airport reclamation began 1975; later Changi East stages ran 1992–2004. |
| west-coast-reclamation | coast piece matching | confirmed | Clementi west-coast reclamation: 1976–1978. |
| northeast-reclamation | coast piece matching | confirmed | Pasir Ris: 1979–1980; Punggol: 1983–1986; Pasir Ris–Seletar: 1985–2001. |
| tekong-reclamation | coast piece matching | confirmed | First Tekong reclamation: 1981–1985; additional scheme approved 2000. |
| pasir-panjang-reclamation | coast piece matching | confirmed | Foreshore works: 1972–1979; new-terminal first phases: 1993–1999. |
| reclamation-method | §5 land-reclamation | confirmed | Containment dykes enclose fill; soil improvement accelerates settling. |
| jurong-island-official-opening | F16; ch05 jurong-island-opens | confirmed | Official opening took place on 14 October 2000; speech describes joining seven islands. |
| sand-government-distinction | F16; §1.4; ch05 | confirmed | MFA said Indonesian sea-sand imports stopped after the February 2003 ban; the 2007 land-sand ban concerned construction rather than reclamation. |
| sand-environmental-claims | F16; §1.4; ch05 | unverifiable | Neighbour-country coastal damage and Cambodian-sand controversy require further directly readable reporting; no specific causal finding verified here. |
| semakau-reclamation-dates | coast piece matching | unverifiable | Semakau reclamation dates were not researched before mandated Landsat access stop. |
| jurong-rock-caverns | F17; ch05 jurong-rock-caverns | confirmed | Jurong Rock Caverns officially opened on 2 September 2014 for underground liquid hydrocarbon storage; PM said it freed 60 hectares of surface land. |
| pinnacle-duxton | F17; ch05 pinnacle-duxton | unverifiable | HDB’s indexed publications give completion 2009 and 50 storeys; exact December date was not verified from full source. |
| dtss | F17; ch05 underground sewerage | confirmed | PUB describes gravity tunnels carrying used water to reclamation plants; Phase 1 completed in 2008. |
| master-plan-five-year-review | F20; §5 master-plan | confirmed | URA states that the statutory Master Plan is reviewed every five years and maps permissible land use and density. |
| kampong-lorong-buangkok-name-status | F21; ch03 site-kampong-lorong-buangkok | confirmed | Singapore Mandarin Council attests 甘榜罗弄万国; its entry records resident households as of 2023 and unimplemented redevelopment plans. |
| kampong-lorong-buangkok-current | F21 current status | confirmed | September 2026 reporting calls 罗弄万国村 a still-inhabited mainland kampong. |
| lim-chu-kang-future | §1.4; ch06 detail only | confirmed | Joint May 2026 release plans agriculture to the north and defence in the south; farms retain tenures until expiry and may bid for alternate sites. |
| lim-chu-kang-farmers-perspective | §1.4 future farm changes | unverifiable | Affected farmers’ own responses to the 2026 changes were not verified. |
| existing-food-series-reuse | F12–F13 preverified series | confirmed | Reuse E014 (2000 park/farming-area distinction), E063–E068 (2024 farms/shares, former target, revised target and definitions). |
| hydroponics-glossary | §5 hydroponics | confirmed | SFA distinguishes hydroponics from soil cultivation and describes nutrient-water systems. |

### Source records

Quotes below are short excerpts. An empty quote means no suitable directly read excerpt was available; the unresolved claim remains marked accordingly. Search-only evidence is labelled and never promoted to a fully verified opening date.

#### pig-farming-announcement

**confirmed** — Goh Keng Swee announced the phase-out policy in Parliament in March 1984.

Spec: F11; §2.2 ch03. Evidence: new check; no existing E ID replaced.

Source: *The Phasing Out of Pig Farms*. Ministry of the Environment, 23 April 1985 / National Archives of Singapore. https://www.nas.gov.sg/archivesonline/data/pdfdoc/19850423_0003.pdf. Section/page: printed p. 1, opening paragraph. Accessed 2026-10-20.

Quotation: "in Parliament in March 1984"

Full two-page government release read; do not invent a day within March.

#### pig-farming-government-rationale

**confirmed** — Government cited treatment cost, scarce land/water, smell and homes approaching farmland. Lim Chu Kang farms were to stop by June 1986.

Spec: F11; §1.4; ch03. Evidence: new check; no existing E ID replaced.

Source: *The Phasing Out of Pig Farms*. Ministry of the Environment, 23 April 1985 / National Archives of Singapore. https://www.nas.gov.sg/archivesonline/data/pdfdoc/19850423_0003.pdf. Section/page: printed pp. 1–2. Accessed 2026-10-20.

Quotation: "land and water"

Release also promises resettlement benefits and at least one year notice for subsequent areas. Catchment-specific rationale has a separate source below.

#### pig-farming-catchment

**confirmed** — Pig-farm runoff threatened Kranji catchment; relocation preceded the island-wide phase-out.

Spec: F11; §1.4; ch03. Evidence: new check; no existing E ID replaced.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed pp. 29–31; PDF pp. 23–24. Accessed 2026-10-20.

Quotation: "water catchment areas"

Water protection is a documented rationale; do not imply every closed farm polluted a reservoir.

#### pig-farming-completion

**corrected** — CLC dates the last pig phase-out to 1989.

Spec: F11; ch03 pig-farming-phase-out. Evidence: new check; no existing E ID replaced.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 35; PDF p. 26. Accessed 2026-10-20.

Quotation: "1989"

Replace approximate 1990 endpoint with source-qualified 1989; no exact day verified.

#### pig-farming-farmers-perspective

**confirmed** — Koh Lip Lin criticised the reversal after farmers invested in Punggol; some families entered retail. CLC describes loss of family ties and identity.

Spec: §1.4; ch03. Evidence: new check; no existing E ID replaced.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed pp. 27–28, 35; PDF pp. 22–23, 26. Accessed 2026-10-20.

Quotation: "last frontier"

Attribution is essential. CLC reproduces Koh’s parliamentary criticism and describes the Tan Chye Huat family’s supermarket business.

#### pig-farmers-overseas

**unverifiable** — Individual farmers’ relocation to neighbouring countries was not verified in the inspected sources.

Spec: §1.4 farmers moving to neighbouring countries. Evidence: new check; no existing E ID replaced.

Source: *Of Swine and Sustainability*. National Heritage Board / Roots. https://www.roots.gov.sg/stories-landing/stories/of-swine-and-sustainability/story. Section/page: access attempt: robot-verification page. Accessed 2026-10-20.

Quotation: None verified for this check.

Do not state overseas relocation without a readable specific case. A search excerpt exists but full page was blocked.

#### farm-count-and-area-transition

**confirmed** — SFA gives 20,000 farms in 1959 and farmland shrinking from about 14,000 to 8,400 hectares as the 1970s began.

Spec: F1; F10; ch03. Evidence: E054, E055.

Source: *Of Change & Challenges: Reminders from Singapore’s Past Agricultural Transformations*. Singapore Food Agency; Choo RuiZhi, 12 October 2022. https://www.sfa.gov.sg/food-for-thought/article/detail/of-change-challenges-reminders-from-singapore-s-past-agricultural-transformations. Section/page: Evolution of Singapore’s Agri-food Industry. Accessed 2026-10-20.

Quotation: "20,000 farms"

Source opened during this pass; historic all-farm totals differ from modern food-farm licences.

#### farm-phaseout-count

**confirmed** — CLC reports roughly 8,000 farms phased out in 1975–1984, about 7,900 remaining, and about 1,500 hectares by the 1980s.

Spec: F10; ch03. Evidence: E057, E058.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 27; PDF p. 22. Accessed 2026-10-20.

Quotation: "7,900"

The 1980s figure has no exact year. It is not a 1980 data point.

#### farm-park-lim-chu-kang

**unverifiable** — Lim Chu Kang: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Lim Chu Kang"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### farm-park-murai

**unverifiable** — Murai: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Murai"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### farm-park-sungei-tengah

**unverifiable** — Sungai Tengah: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Sungai Tengah"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### farm-park-nee-soon

**unverifiable** — Nee Soon: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Nee Soon"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### farm-park-loyang

**unverifiable** — Loyang: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Loyang"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### farm-park-ah-ma-keng

**unverifiable** — Ah Ma Keng: 1986 land reservation verified; individual opening/gazette year unverified.

Spec: F12; §3.4 farm-parks. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36 and endnote 101; PDF pp. 27, 67. Accessed 2026-10-20.

Quotation: "Ah Ma Keng"

1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.

#### agrotech-first-tender

**confirmed** — The September 1986 release scheduled first tenders for Sungei Tengah, Murai and Loyang for 5 September 1986; wider development was planned for 1986–1992.

Spec: F12; ch03 agrotech-parks-1986. Evidence: new check; no existing E ID replaced.

Source: *Tendering of Land for Farming in Agrotechnology Parks*. Singapore Government / Primary Production Department / NAS. https://www.nas.gov.sg/archivesonline/data/pdfdoc/1181-1986-09-03.pdf. Section/page: printed p. 1, paragraphs 1–3; inspected existing rendered scan. Accessed 2026-10-20.

Quotation: "to be tendered out on 5 Sep 86"

Plan publication is not an opening. The primary release lists more future locations than CLC’s six. Maps remain look-only; no open reproduction licence established.

#### farm-park-chinese-names

**unverifiable** — Chinese names for all six historical agrotechnology parks were not individually verified.

Spec: F12 Chinese place names. Evidence: E059.

Source: *Food and The City: Overcoming Challenges for Food Security*. Centre for Liveable Cities, Ministry of National Development; Elyssa Ludher and Thinesh Kumar s/o Paramasilvam (2018). https://www.clc.gov.sg/docs/default-source/urban-systems-studies/food-and-the-city-overcoming-challenges-for-food-security.pdf. Section/page: printed p. 36; English list only. Accessed 2026-10-20.

Quotation: None verified for this check.

Retain Chinese fields as 【待译】; especially Murai and Ah Ma Keng require local usage evidence.

#### food-import-share

**confirmed** — SFA states that Singapore imports over 90% of its food.

Spec: F13; ch03 final beat. Evidence: new check; no existing E ID replaced.

Source: *Champions of tomorrow - supporting local farmers*. Singapore Food Agency. https://www.sfa.gov.sg/fromsgtosg/our-sg-food-story/champions-of-tomorrow-supporting-local-farmers. Section/page: opening section, paragraph 3. Accessed 2026-10-20.

Quotation: "imports over 90% of its food"

SFA’s broad statement; no denominator or precise 2024 measurement supplied. “Most food comes from abroad” is supported.

#### first-indoor-farm-sfa

**confirmed** — SFA dates Singapore’s first indoor farm to 2014.

Spec: F13; ch03 first-indoor-farm. Evidence: E007.

Source: *Agriculture Technologies*. Singapore Food Agency. https://www.sfa.gov.sg/food-science-and-technology/technology/agriculture-technologies. Section/page: Indoor agricultural farms. Accessed 2026-10-20.

Quotation: "Singapore’s first indoor farm was established in 2014"



#### first-indoor-farm-panasonic

**corrected** — Panasonic announced pilot commercial supply on 31 July 2014; its release says the facility was established in October 2013.

Spec: F13; ch03 first-indoor-farm. Evidence: new check; no existing E ID replaced.

Source: *Panasonic Contributes to Singapore’s Self-Sufficiency Level of Vegetables with First Indoor Vegetable Farm*. Panasonic Asia Pacific, 31 July 2014. https://www.mynewsdesk.com/sg/panasonicapac/pressreleases/panasonic-contributes-to-singapore-s-self-sufficiency-level-of-vegetables-with-first-indoor-vegetable-farm-1104976. Section/page: opening paragraph; About Panasonic Factory Solutions Asia Pacific. Accessed 2026-10-20.

Quotation: "In October 2013, the facility established its indoor agriculture farm"

Different milestones. The release describes soil cultivation under LED light; do not automatically describe this first farm as hydroponic.

#### first-indoor-farm-location

**unverifiable** — Jalan Ahmad Ibrahim is reported by The Straits Times; exact site/address and publishable point coordinates were not verified from primary evidence.

Spec: ch03 first-indoor-farm coordinates. Evidence: new check; no existing E ID replaced.

Source: *Panasonic runs one of Singapore’s largest indoor farms*. The Straits Times. https://www.straitstimes.com/singapore/panasonic-runs-one-of-singapores-largest-indoor-farms?ai-allowed=1. Section/page: search excerpt only. Accessed 2026-10-20.

Quotation: "located in Jalan Ahmad Ibrahim"

Do not use the speculative west-island beat coordinate as a precise farm point. Panasonic release has no address; attached scanned fact sheet gave no extractable text.

#### jurong-conception

**confirmed** — JTC dates the estate’s conception to 1961.

Spec: F9; ch02 jurong-industrial-estate. Evidence: E008.

Source: *Dream Factories*. JTC Corporation. https://www.jtc.gov.sg/about-jtc/dream-factories. Section/page: Dream Factories introduction. Accessed 2026-10-20.

Quotation: "Jurong Industrial Estate, conceptualised in 1961"

Conception is not inauguration or start of every parcel.

#### jurong-construction-day

**unverifiable** — A single estate-wide start/opening day was not established; sources disagree on the National Iron & Steel Mills foundation-stone day.

Spec: F9; ch02 jurong-industrial-estate. Evidence: new check; no existing E ID replaced.

Source: *Industrial Revolution*. National Library Board, Curiocity. https://curiocity.nlb.gov.sg/digital-stories/jurong/jurong-industrial-estate-development/. Section/page: page accessed; compare URA NatSteel conservation page. Accessed 2026-10-20.

Quotation: None verified for this check.

Search extract says 1 September 1962; URA 22 Tanjong Kling Road search extract says 16 September 1962. Do not silently choose. Estate conception 1961 remains independently verified.

#### jtc-founded

**unverifiable** — Jurong Town Corporation Act commencement is 1 June 1968, but direct SSO access was blocked.

Spec: F9; ch02 jtc-founded. Evidence: new check; no existing E ID replaced.

Source: *Jurong Town Corporation Act 1968*. Attorney-General’s Chambers / Singapore Statutes Online. https://sso.agc.gov.sg/act/jtca1968. Section/page: search-rendered Act header; direct request returned 403. Accessed 2026-10-20.

Quotation: "[1 June 1968]"

Date visible in official search excerpt, not full direct page; human/direct-source verification still required.

#### tuas-industrial-opening

**unverifiable** — NLB describes industrial development following 1970s resettlement; no precise estate opening year was verified.

Spec: §3.4 estates: Tuas. Evidence: new check; no existing E ID replaced.

Source: *Tuas*. National Library Board, Infopedia. https://www.nlb.gov.sg/main/article-detail?cmsuuid=bb47d299-4da2-4e58-a883-6002e8f05011. Section/page: Historical background, search extract. Accessed 2026-10-20.

Quotation: "In the 1970s"

Do not turn a decade into 1970 or use reclamation dates as an estate opening.

#### woodlands-industrial-opening

**unverifiable** — Woodlands Town Plan 1971–1975 included industry, but an industrial-estate opening year was not verified.

Spec: §3.4 estates: Woodlands. Evidence: new check; no existing E ID replaced.

Source: *MUSE SG, Volume 11 Issue 1 / Woodlands feature*. National Heritage Board. https://www.roots.gov.sg/-/media/Roots/Images/resources/muse/issues/muse18_magazinevol38_r15_fa-compressed.ashx. Section/page: printed p. 45, search extract. Accessed 2026-10-20.

Quotation: "Woodlands Town Plan (1971-75)"

Housing completion in 1972 is not industry inauguration. Estate dates require further primary research.

#### seletar-aerospace-opening

**unverifiable** — JTC’s indexed Dream Factories timeline places first tenants in 2010; full PDF text could not be read reliably.

Spec: §3.4 estates: Seletar Aerospace Park. Evidence: new check; no existing E ID replaced.

Source: *Dream Factories + Destination: A Future Perfect*. JTC Corporation. https://www.jtc.gov.sg/-/media/project/jtc-cx/corpweb/assets/jtc-dream-factories.pdf. Section/page: printed p. 48 timeline; search extract only. Accessed 2026-10-20.

Quotation: "welcomed its first tenants"

Separate JTC story says development since 2008. Do not label 2008 or 2010 an official opening without fuller primary verification.

#### reserve-bukit-timah

**confirmed** — Bukit Timah was declared a Nature Reserve in 1990, according to NParks’ current history page.

Spec: F19; §3.4 reserves. Evidence: new check; no existing E ID replaced.

Source: *History of Bukit Timah Nature Reserve*. National Parks Board. https://www.nparks.gov.sg/visit/parks/bukit-timah-nature-reserve/special-features/history. Section/page: Important periods in the Reserve’s history. Accessed 2026-10-20.

Quotation: "1990:"

Present footprint is approximate for earlier dates. Forest/catchment protection existed earlier; 1990 is current statutory-status milestone.

#### reserve-central-catchment

**confirmed** — Central Catchment was declared a Nature Reserve in 1990, according to NParks’ current history page.

Spec: F19; §3.4 reserves. Evidence: new check; no existing E ID replaced.

Source: *History of Bukit Timah Nature Reserve*. National Parks Board. https://www.nparks.gov.sg/visit/parks/bukit-timah-nature-reserve/special-features/history. Section/page: Important periods in the Reserve’s history. Accessed 2026-10-20.

Quotation: "Central Catchment"

Present footprint is approximate for earlier dates. Forest/catchment protection existed earlier; 1990 is current statutory-status milestone.

#### reserve-bukit-timah-earlier-status

**corrected** — NParks’ public history gives forest-reserve establishment 1883 and Ordinance protection 1951; its research paper dates forest/nature declarations 1887/1951.

Spec: F19 chronology conflict. Evidence: new check; no existing E ID replaced.

Source: *Historical review of Bukit Timah Nature Reserve, Singapore*. G.W.H. Davison & P.T. Chew / Gardens’ Bulletin Singapore 71(Suppl. 1), NParks, 2019. https://www.nparks.gov.sg/sbg/research/publications/gardens-bulletin-singapore/-/media/sbg/gardens-bulletin/gbs_71_s1_y2019_v71_s1/71_s1_02_y2019_v71s1_gbs_pg19.pdf. Section/page: printed p. 19 abstract; compare current NParks history page. Accessed 2026-10-20.

Quotation: "forest reserve (1887) and nature reserve (1951)"

Preserve all milestone meanings and disagreement; do not flatten to a single founding date.

#### reserve-sungei-buloh

**confirmed** — Sungei Buloh opened as a Nature Park in 1993 and was gazetted a Nature Reserve in 2002.

Spec: F19; ch06 sungei-buloh-reserve. Evidence: new check; no existing E ID replaced.

Source: *History of Sungei Buloh Wetland Reserve*. National Parks Board. https://www.nparks.gov.sg/visit/parks/sungei-buloh-wetland-reserve/special-features. Section/page: About Sungei Buloh Wetland Reserve’s history. Accessed 2026-10-20.

Quotation: "In 2002, 130 hectares were officially gazetted as a Nature Reserve."



#### reserve-labrador

**unverifiable** — NParks’ indexed educational factsheet gives gazette date 1 January 2002; full PDF could not be retrieved.

Spec: F19; ch06 labrador-reserve. Evidence: new check; no existing E ID replaced.

Source: *Factsheet on Labrador Nature Reserve, Annex 1b*. National Parks Board. https://www.nparks.gov.sg/-/media/nparks-real-content/learning/learning-journeys/guided-walks/diy-guided-walks/heritage-comes-alie/worksheets-for-students.pdf. Section/page: search extract; direct PDF retrieval failed. Accessed 2026-10-20.

Quotation: "gazetted as a nature reserve on 1 January 2002"

2002 corroborated by other official indexed NParks materials. Exact day still requires readable primary confirmation.

#### east-coast-reclamation

**corrected** — Official start 1966; seven phases over about thirty years. The spec’s 1985 overall endpoint is unsupported.

Spec: F16; ch05 east-coast-reclamation. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: East Coast: The Great Reclamation. Accessed 2026-10-20.

Quotation: "1966"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### east-coast-phases

**confirmed** — Phases I–II: 1966–1971; III–IV: 1971–1975; V: 1974–1977.

Spec: F16; coast matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: East Coast: The Great Reclamation. Accessed 2026-10-20.

Quotation: "1975"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### marina-bay-reclamation

**confirmed** — Marina Centre: 1974–1977; Marina East/South phases began 1979; bay-edge works: 1990–1992.

Spec: F16; ch05 marina-bay-reclamation. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: East Coast: The Great Reclamation. Accessed 2026-10-20.

Quotation: "1979"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### jurong-tuas-reclamation

**confirmed** — Jurong reclamation: 1963; Jurong/Tuas expansion: 1970s; Tuas extension: late 1980s.

Spec: F16; ch05 tuas-reclamation. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: New Lands for Industries: JTC. Accessed 2026-10-20.

Quotation: "1963"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### jurong-island-completion-conflict

**corrected** — NLB reports scheme beginning 1993 and completion 2003; JTC timeline gives completion 2009; opening 2000 is separate.

Spec: F16; coast matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: New Lands for Industries: JTC. Accessed 2026-10-20.

Quotation: "2003"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### changi-reclamation

**confirmed** — Airport reclamation began 1975; later Changi East stages ran 1992–2004.

Spec: F16; ch04 changi-airport-opens. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: New Lands for Infrastructure and Recreation: MPA. Accessed 2026-10-20.

Quotation: "1975"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### west-coast-reclamation

**confirmed** — Clementi west-coast reclamation: 1976–1978.

Spec: coast piece matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: Other Reclamation Projects by HDB. Accessed 2026-10-20.

Quotation: "1978"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### northeast-reclamation

**confirmed** — Pasir Ris: 1979–1980; Punggol: 1983–1986; Pasir Ris–Seletar: 1985–2001.

Spec: coast piece matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: Other Reclamation Projects by HDB. Accessed 2026-10-20.

Quotation: "1986"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### tekong-reclamation

**confirmed** — First Tekong reclamation: 1981–1985; additional scheme approved 2000.

Spec: coast piece matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: New Lands for Infrastructure and Recreation: MPA. Accessed 2026-10-20.

Quotation: "1985"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### pasir-panjang-reclamation

**confirmed** — Foreshore works: 1972–1979; new-terminal first phases: 1993–1999.

Spec: coast piece matching. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: New Lands for Infrastructure and Recreation: MPA. Accessed 2026-10-20.

Quotation: "1999"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### reclamation-method

**confirmed** — Containment dykes enclose fill; soil improvement accelerates settling.

Spec: §5 land-reclamation. Evidence: new check; no existing E ID replaced.

Source: *Land From Sand: Singapore’s Reclamation Story*. Lim Tin Seng / National Library Board, BiblioAsia, 4 April 2017. https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-1-apr-jun-2017-land-from-sand/. Section/page: LAND RECLAMATION: HOW DOES IT WORK?. Accessed 2026-10-20.

Quotation: "containment dykes"

Text chronology only; copyrighted figures not traced or republished. Scene-date spatial correspondence requires coast analysis.

#### jurong-island-official-opening

**confirmed** — Official opening took place on 14 October 2000; speech describes joining seven islands.

Spec: F16; ch05 jurong-island-opens. Evidence: new check; no existing E ID replaced.

Source: *Speech by Prime Minister Goh Chok Tong at the Official Opening of Jurong Island on Saturday, 14 October 2000, at 7.00 pm*. Prime Minister’s Office / Singapore Government Media Release / NAS. https://www.nas.gov.sg/archivesonline/data/pdfdoc/2000101403.htm. Section/page: title; opening paragraph. Accessed 2026-10-20.

Quotation: "built by merging seven separate islands"



#### sand-government-distinction

**confirmed** — MFA said Indonesian sea-sand imports stopped after the February 2003 ban; the 2007 land-sand ban concerned construction rather than reclamation.

Spec: F16; §1.4; ch05. Evidence: new check; no existing E ID replaced.

Source: *Transcript of Reply by Minister of Foreign Affairs George Yeo to Question in Parliament on sand and land reclamation, 12 February 2007*. Ministry of Foreign Affairs. https://www.mfa.gov.sg/newsroom/press-statements-transcripts-and-photos/transcript-of-reply-by-minister-of-foreign-affairs-george-yeo-to-question-in-parliament-on-sand-and-12-feb-2007/. Section/page: Reply, opening three paragraphs. Accessed 2026-10-20.

Quotation: "distinguishing sea sand from land sand"

Attribute to minister. Do not repeat inaccurate general claim that 2007 ban covered Indonesian sea sand.

#### sand-environmental-claims

**unverifiable** — Neighbour-country coastal damage and Cambodian-sand controversy require further directly readable reporting; no specific causal finding verified here.

Spec: F16; §1.4; ch05. Evidence: new check; no existing E ID replaced.

Source: *S’pore has strict criteria for sand imports, says Govt, as controversy over Cambodian imports brews*. CNA. https://www.channelnewsasia.com/singapore/spore-has-strict-criteria-sand-imports-says-govt-controversy-over-cambodian-imports-brews-5769186. Section/page: search excerpt; full retrieval repeatedly timed out. Accessed 2026-10-20.

Quotation: None verified for this check.

Do not present allegations as settled fact. NLB separately identifies ecological limits to reclamation but not a site-specific foreign damage finding.

#### semakau-reclamation-dates

**unverifiable** — Semakau reclamation dates were not researched before mandated Landsat access stop.

Spec: coast piece matching. Evidence: new check; no existing E ID replaced.

Source: *No source inspected*. not established. No source established. Section/page: not established. Accessed 2026-10-20.

Quotation: None verified for this check.

Mark any corresponding coast piece unmatched until sourced.

#### jurong-rock-caverns

**confirmed** — Jurong Rock Caverns officially opened on 2 September 2014 for underground liquid hydrocarbon storage; PM said it freed 60 hectares of surface land.

Spec: F17; ch05 jurong-rock-caverns. Evidence: new check; no existing E ID replaced.

Source: *PM Lee Hsien Loong at the Official Opening of the Jurong Rock Caverns*. Prime Minister’s Office Singapore. https://www.pmo.gov.sg/newsroom/transcript-prime-minister-lee-hsien-loongs-speech-official-opening-jurong-rock-caverns/. Section/page: date; opening paragraph; surface-land paragraph. Accessed 2026-10-20.

Quotation: "it freed up 60 hectares of surface land"



#### pinnacle-duxton

**unverifiable** — HDB’s indexed publications give completion 2009 and 50 storeys; exact December date was not verified from full source.

Spec: F17; ch05 pinnacle-duxton. Evidence: new check; no existing E ID replaced.

Source: *Home Truly: Building Dreams, Housing Hopes*. Housing & Development Board. https://assets.hdb.gov.sg/about-us/news-and-publications/home/Home-Truly-1.pdf. Section/page: 2009 timeline; search extract only. Accessed 2026-10-20.

Quotation: "first 50-storey development"

Use neither an exact day nor exact month without reading primary page.

#### dtss

**confirmed** — PUB describes gravity tunnels carrying used water to reclamation plants; Phase 1 completed in 2008.

Spec: F17; ch05 underground sewerage. Evidence: new check; no existing E ID replaced.

Source: *5 things you may not have known about NEWater*. PUB, Singapore’s National Water Agency, 27 August 2021. https://www.pub.gov.sg/Resources/News-Room/Featured-Stories/2021/5-things-about-NEWater. Section/page: Deep Tunnel Sewerage System section. Accessed 2026-10-20.

Quotation: "DTSS Phase 1, which serves the eastern part of Singapore was completed in 2008."

2021 page’s forecast for Phase 2 is not evidence of actual completion; no Phase 2 claim added.

#### master-plan-five-year-review

**confirmed** — URA states that the statutory Master Plan is reviewed every five years and maps permissible land use and density.

Spec: F20; §5 master-plan. Evidence: E005.

Source: *Master Plan*. Urban Redevelopment Authority. https://www.ura.gov.sg/land-planning/master-plan/. Section/page: opening explanation. Accessed 2026-10-20.

Quotation: "It is reviewed every five years"

Page read in full; all topic references to the map must say planned use.

#### kampong-lorong-buangkok-name-status

**confirmed** — Singapore Mandarin Council attests 甘榜罗弄万国; its entry records resident households as of 2023 and unimplemented redevelopment plans.

Spec: F21; ch03 site-kampong-lorong-buangkok. Evidence: new check; no existing E ID replaced.

Source: *Buangkok / 万国*. Singapore Mandarin Council, Singaporean Mandarin Database. https://www.languagecouncils.sg/mandarin/en/learning-resources/singaporean-mandarin-database/terms/buangkok. Section/page: Etymology / 由来, second and third bullets. Accessed 2026-10-20.

Quotation: "甘榜罗弄万国（Kampong Lorong Buangkok）"

Supports living village, not a preserved museum. Do not claim formal conservation status. For current mainland-village wording see companion Zaobao source.

#### kampong-lorong-buangkok-current

**confirmed** — September 2026 reporting calls 罗弄万国村 a still-inhabited mainland kampong.

Spec: F21 current status. Evidence: new check; no existing E ID replaced.

Source: *潮什么：不用花大钱！解锁本地宝藏景点*. 王博涵 / 联合早报, 4 September 2026. https://www.zaobao.com.sg/lifestyle/campus/story20260904-9624249. Section/page: 到甘榜体验慢活. Accessed 2026-10-20.

Quotation: "罗弄万国村（Kampong Lorong Buangkok）"

Opened readable article; source date is after timeline endpoint, so use as a current-status check, not a 2025 event.

#### lim-chu-kang-future

**confirmed** — Joint May 2026 release plans agriculture to the north and defence in the south; farms retain tenures until expiry and may bid for alternate sites.

Spec: §1.4; ch06 detail only. Evidence: E011.

Source: *Government to implement land-use change in Lim Chu Kang*. Singapore Food Agency; Ministry of Defence; NParks; Singapore Land Authority. https://www.sfa.gov.sg/news-publications/newsroom/government-to-implement-land-use-change-in-lim-chu-kang. Section/page: Benefits of Consolidating Land Uses; Supporting Affected Farms. Accessed 2026-10-20.

Quotation: "There will be no early termination of leases."

Post-2025 scope: detail only. Government describes implementation planned, not merely undecided discussion. Independent farmer testimony not verified.

#### lim-chu-kang-farmers-perspective

**unverifiable** — Affected farmers’ own responses to the 2026 changes were not verified.

Spec: §1.4 future farm changes. Evidence: E011.

Source: *Government to implement land-use change in Lim Chu Kang*. Singapore Food Agency; Ministry of Defence; NParks; Singapore Land Authority. https://www.sfa.gov.sg/news-publications/newsroom/government-to-implement-land-use-change-in-lim-chu-kang. Section/page: Supporting Affected Farms. Accessed 2026-10-20.

Quotation: None verified for this check.

Official support statement does not substitute for farmers’ accounts.

#### existing-food-series-reuse

**confirmed** — Reuse E014 (2000 park/farming-area distinction), E063–E068 (2024 farms/shares, former target, revised target and definitions).

Spec: F12–F13 preverified series. Evidence: E014, E063, E064, E065, E066, E067, E068.

Source: *Singapore Food Statistics 2024*. Singapore Food Agency. https://www.sfa.gov.sg/docs/default-source/publication/sg-food-statistics/singapore-food-statistics-2024.pdf. Section/page: printed p. 5, prior research verification. Accessed 2026-10-20.

Quotation: None verified for this check.

Not independently re-fetched in this pass. Parent facts.json preserves exact source for each evidence ID. These are several sources; this compact index must not become a source citation for all claims.

#### hydroponics-glossary

**confirmed** — SFA distinguishes hydroponics from soil cultivation and describes nutrient-water systems.

Spec: §5 hydroponics. Evidence: E006.

Source: *Agriculture Technologies*. Singapore Food Agency. https://www.sfa.gov.sg/food-science-and-technology/technology/agriculture-technologies. Section/page: Land-based / Indoor / Rooftop agricultural farms. Accessed 2026-10-20.

Quotation: "hydroponic systems"

The definition may describe water with dissolved nutrients; it must not claim all indoor farms use hydroponics.

### Remaining gaps

- pig-farmers-overseas: Individual farmers’ relocation to neighbouring countries was not verified in the inspected sources. Do not state overseas relocation without a readable specific case. A search excerpt exists but full page was blocked.
- farm-park-lim-chu-kang: Lim Chu Kang: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-murai: Murai: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-sungei-tengah: Sungai Tengah: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-nee-soon: Nee Soon: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-loyang: Loyang: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-ah-ma-keng: Ah Ma Keng: 1986 land reservation verified; individual opening/gazette year unverified. 1986 may be used only as reservation/programme date, with approximate current footprint. Ah Ma Keng was later redesignated; no end year recovered.
- farm-park-chinese-names: Chinese names for all six historical agrotechnology parks were not individually verified. Retain Chinese fields as 【待译】; especially Murai and Ah Ma Keng require local usage evidence.
- first-indoor-farm-location: Jalan Ahmad Ibrahim is reported by The Straits Times; exact site/address and publishable point coordinates were not verified from primary evidence. Do not use the speculative west-island beat coordinate as a precise farm point. Panasonic release has no address; attached scanned fact sheet gave no extractable text.
- jurong-construction-day: A single estate-wide start/opening day was not established; sources disagree on the National Iron & Steel Mills foundation-stone day. Search extract says 1 September 1962; URA 22 Tanjong Kling Road search extract says 16 September 1962. Do not silently choose. Estate conception 1961 remains independently verified.
- jtc-founded: Jurong Town Corporation Act commencement is 1 June 1968, but direct SSO access was blocked. Date visible in official search excerpt, not full direct page; human/direct-source verification still required.
- tuas-industrial-opening: NLB describes industrial development following 1970s resettlement; no precise estate opening year was verified. Do not turn a decade into 1970 or use reclamation dates as an estate opening.
- woodlands-industrial-opening: Woodlands Town Plan 1971–1975 included industry, but an industrial-estate opening year was not verified. Housing completion in 1972 is not industry inauguration. Estate dates require further primary research.
- seletar-aerospace-opening: JTC’s indexed Dream Factories timeline places first tenants in 2010; full PDF text could not be read reliably. Separate JTC story says development since 2008. Do not label 2008 or 2010 an official opening without fuller primary verification.
- reserve-labrador: NParks’ indexed educational factsheet gives gazette date 1 January 2002; full PDF could not be retrieved. 2002 corroborated by other official indexed NParks materials. Exact day still requires readable primary confirmation.
- sand-environmental-claims: Neighbour-country coastal damage and Cambodian-sand controversy require further directly readable reporting; no specific causal finding verified here. Do not present allegations as settled fact. NLB separately identifies ecological limits to reclamation but not a site-specific foreign damage finding.
- semakau-reclamation-dates: Semakau reclamation dates were not researched before mandated Landsat access stop. Mark any corresponding coast piece unmatched until sourced.
- pinnacle-duxton: HDB’s indexed publications give completion 2009 and 50 storeys; exact December date was not verified from full source. Use neither an exact day nor exact month without reading primary page.
- lim-chu-kang-farmers-perspective: Affected farmers’ own responses to the 2026 changes were not verified. Official support statement does not substitute for farmers’ accounts.

### Reuse and rights

All sources above are used for factual research and short quotation only. NAS programme annexes, NLB maps, JTC publication images and NParks educational PDF images were not traced or republished. Their presence online does not establish an open geometry/image licence. Data source licences remain the map agent’s separate responsibility.

The current reserve footprints must not be treated as historical vegetation. Six farm parks share a verified 1986 reservation policy; individual opening dates remain unresolved. Tuas/Woodlands opening years cannot be inferred from present boundaries or broad decade histories.


## Singapore rail opening register and transport fact checks

Access date: 20 October 2026. Research stopped when parent confirmed the user-required anonymous-Landsat access stop. This is a durable incomplete register, not a fully verified map input. Original evidence IDs E082, E084–E088 are reused; R-rail-* IDs are additional research evidence. No dates are supplied from memory. Candidate dates are locators read in secondary tables and are explicitly excluded from `date` when primary verification is incomplete.

### Register

49 rows: 33 confirmed; 16 unverified. A row groups one same-day opening project across an uninterrupted route. Infill/deferred station rows do not represent new track and must not postpone the appearance of already operating rails. Modern line names are used for geometry grouping; the initial network operated differently.

| ID | Line / route | First passenger date | Status | Evidence | Note |
|---|---|---|---|---|---|
| nsl-toa-payoh-yio-chu-kang | NSL: Toa Payoh → Yio Chu Kang | 1987-11-07 | confirmed | E082 |  |
| nsl-toa-payoh-raffles-place | NSL: Toa Payoh → Raffles Place | 1987-12-12 | confirmed | R-rail-01 | Modern-line split of original Toa Payoh–Outram Park opening; same-date EWL continuation separate. |
| ewl-raffles-place-outram-park | EWL: Raffles Place → Outram Park | 1987-12-12 | confirmed | R-rail-01 |  |
| ewl-outram-park-clementi | EWL: Outram Park → Clementi | unverified (candidate 1988-03-12) | unverifiable | R-rail-gap | Ceremonial inauguration on 12 March 1988 is verified; first passenger day of west extension not independently checked. |
| ewl-clementi-lakeside | EWL: Clementi → Lakeside | 1988-11-05 | confirmed | R-rail-02 |  |
| nsl-yio-chu-kang-yishun | NSL: Yio Chu Kang → Yishun | unverified (candidate 1988-12-20) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| ewl-city-hall-tanah-merah | EWL: City Hall → Tanah Merah | 1989-11-04 | confirmed | R-rail-03 | NLB confirms nine newly opened EWL stations, including Eunos. |
| nsl-raffles-place-marina-bay | NSL: Raffles Place → Marina Bay | unverified (candidate 1989-11-04) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| ewl-tanah-merah-pasir-ris | EWL: Tanah Merah → Pasir Ris | unverified (candidate 1989-12-16) | unverifiable | R-rail-gap | NLB BiblioAsia Pasir Ris article confirms month and cites “3 Stations Open Today”, Straits Times, 16 December 1989, p.30; original not read. |
| branch-jurong-east-choa-chu-kang | NSL (original Branch Line): Jurong East → Choa Chu Kang | unverified (candidate 1990-03-10) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| ewl-boon-lay-1990 | EWL: Lakeside → Boon Lay | unverified (official opening 1990-07-06) | unverifiable | R-rail-04 | Official completion/opening speech; day of first service needs separate check if distinguishing ceremony. |
| nsl-woodlands-extension | NSL: Choa Chu Kang → Yishun | unverified (candidate 1996-02-10) | unverifiable | R-rail-gap | Official NAS opening speech and LTA 2014/15 annual report confirm inauguration; same-day first passenger service not independently established. |
| ewl-tanah-merah-expo | EWL airport branch: Tanah Merah → Expo | 2001-01-10 | confirmed | R-rail-06 |  |
| ewl-dover-infill | EWL: Dover → Dover | unverified (candidate 2001-10-18) | unverifiable | R-rail-gap | SMRT 2002 report confirms October 2001 only; station added on existing track, never delay 1988 track to 2001. |
| ewl-expo-changi-airport | EWL airport branch: Expo → Changi Airport | 2002-02-08 | confirmed | R-rail-07 | Disagreement retained: NLB BiblioAsia “How Changi Airport Came To Be” says airport MRT opened in 2001; operator first-train account says 8 February 2002. |
| nel-harbourfront-punggol | NEL: HarbourFront → Punggol | 2003-06-20 | confirmed | R-rail-08 | Track through Buangkok and Woodleigh opened; those stations opened later. |
| nel-buangkok-opens | NEL: Buangkok → Buangkok | unverified (candidate 2006-01-15) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| nel-woodleigh-opens | NEL: Woodleigh → Woodleigh | unverified (candidate 2011-06-20) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| ewl-boon-lay-joo-koon | EWL: Boon Lay → Joo Koon | 2009-02-28 | confirmed | R-rail-09 |  |
| ccl-bartley-marymount | CCL: Bartley → Marymount | 2009-05-28 | confirmed | E084 |  |
| ccl-dhoby-ghaut-bartley | CCL: Dhoby Ghaut → Bartley | 2010-04-17 | confirmed | E084 | Stages 1 and 2 opened together; joins existing Stage 3 at Bartley. |
| ccl-marymount-harbourfront | CCL: Marymount → HarbourFront | 2011-10-08 | confirmed | R-rail-10 | Stages 4 and 5; Bukit Brown station remains unopened through end-2025. |
| ccl-promenade-marina-bay | CCL extension: Promenade → Marina Bay | 2012-01-14 | confirmed | R-rail-10 |  |
| dtl-bugis-chinatown | DTL: Bugis → Chinatown | 2013-12-22 | confirmed | E085-E087 |  |
| nsl-marina-bay-marina-south-pier | NSL: Marina Bay → Marina South Pier | unverified (candidate 2014-11-23) | unverifiable | R-rail-gap | LTA confirms 2014 extension; exact day located but direct release was not recovered before stop. |
| dtl-bukit-panjang-bugis | DTL: Bukit Panjang → Bugis | 2015-12-27 | confirmed | E085-E087 | Includes through-track at Hume; Hume station opened 2025. |
| ewl-joo-koon-tuas-link | EWL: Joo Koon → Tuas Link | unverified (candidate 2017-06-18) | unverifiable | R-rail-gap | LTA current EWL page confirms June 2017. Original 27 April 2017 release URL returns 404; exact day not verified from available primary text. |
| dtl-chinatown-expo | DTL: Chinatown → Expo | 2017-10-21 | confirmed | E085-E087 |  |
| nsl-canberra-infill | NSL: Canberra → Canberra | 2019-11-02 | confirmed | R-rail-12 | Infill station; surrounding track was already passenger-operating from Woodlands extension. |
| tel-woodlands-north-woodlands-south | TEL: Woodlands North → Woodlands South | 2020-01-31 | confirmed | E088, R-rail-12 |  |
| tel-woodlands-south-caldecott | TEL: Woodlands South → Caldecott | 2021-08-28 | confirmed | R-rail-13 |  |
| tel-caldecott-gardens-by-the-bay | TEL: Caldecott → Gardens by the Bay | 2022-11-13 | confirmed | R-rail-14 | Mount Pleasant and Marina South stations not passenger-operating through end-2025; through-track operates. |
| tel-gardens-by-the-bay-bayshore | TEL: Gardens by the Bay → Bayshore | 2024-06-23 | confirmed | R-rail-15 |  |
| nel-punggol-punggol-coast | NEL: Punggol → Punggol Coast | 2024-12-10 | confirmed | R-rail-16 |  |
| dtl-hume-infill | DTL: Hume → Hume | 2025-02-28 | confirmed | R-rail-11 | Through-track opened with DTL2 in 2015; no new route length. |
| bplrt-initial | Bukit Panjang LRT: Choa Chu Kang → Bukit Panjang loop / Ten Mile Junction | 1999-11-06 | confirmed | R-rail-17 | Initial fourteen stations including Ten Mile Junction. Closure/reopening history of that spur not verified here; do not assume still operating today. |
| sklrt-east | Sengkang LRT: Sengkang → East Loop | 2003-01-18 | confirmed | R-rail-08 |  |
| sklrt-west | Sengkang LRT: Sengkang → West Loop | 2005-01-29 | confirmed | R-rail-18 | Cheng Lim, Farmway and Kupang station stops deferred; full loop first-passenger track geometry still requires operational-path verification. |
| sklrt-farmway | Sengkang LRT: Farmway → Farmway | 2007-11-15 | confirmed | R-rail-19 |  |
| sklrt-cheng-lim | Sengkang LRT: Cheng Lim → Cheng Lim | 2013-01-01 | confirmed | R-rail-20 |  |
| sklrt-kupang | Sengkang LRT: Kupang → Kupang | 2015-06-27 | confirmed | R-rail-21 |  |
| pglrt-east | Punggol LRT: Punggol → Cove–Kadaloor | 2005-01-29 | confirmed | R-rail-18 | Initial six stations including Punggol; Oasis and Damai deferred. Do not infer full loop passenger geometry from station dates alone. |
| pglrt-oasis | Punggol LRT: Oasis → Oasis | unverified (candidate 2007-06-15) | unverifiable | R-rail-gap | Archived SBS opening release found; no readable body recovered before stop. |
| pglrt-damai | Punggol LRT: Damai → Damai | unverified (candidate 2011-06-20) | unverifiable | R-rail-gap | Original SBS 17 June 2011 release/poster located; body not recovered before stop. |
| pglrt-west-initial | Punggol LRT: Punggol → Soo Teck–Sumang–Nibong | 2014-06-29 | confirmed | R-rail-22 | Partial loop via crossover; source explicitly excludes service between PW1 and PW4. Do not paint entire West Loop in 2014. |
| pglrt-west-sam-kee | Punggol LRT: Sam Kee → Nibong | 2016-02-29 | confirmed | R-rail-23 | Service extended around loop; Teck Lee/Punggol Point/Samudera stops remain closed. Track is passenger-used past closed stations; split line geometry at operational junctions. |
| pglrt-punggol-point | Punggol LRT: Punggol Point → Punggol Point | unverified (candidate 2016-12-29) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| pglrt-samudera | Punggol LRT: Samudera → Samudera | unverified (candidate 2017-03-31) | unverifiable | R-rail-gap | Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop. |
| pglrt-teck-lee | Punggol LRT: Teck Lee → Teck Lee | 2024-08-15 | confirmed | R-rail-15 |  |

### Evidence records

LTA/NLB pages were preferred. Where no detailed LTA/NLB day was recoverable, contemporary government transcripts or operator primary reports are identified explicitly. Those operator records are useful primary evidence but do not satisfy a literal LTA/NLB-only provenance requirement; retain that caveat in final report. Each quotation below is at most 25 words per source.

#### E082
- Title: Speech by Minister Khaw Boon Wan at Decommissioning of 66 First-Generation NSEWL Trains
- Publisher: Ministry of Transport
- URL: https://www.mot.gov.sg/news-resources/newsroom/speech-by-minister-khaw-boon-wan-at-decommissioning-of-66-first-generation-nsewl-trains/
- Section: paragraph 14
- Access: 2026-10-20; existing evidence E082 reused
- Short quotation: “When our MRT opened on 7 November 1987, we only had five stations, from Toa Payoh to Yio Chu Kang.”

#### R-rail-01
- Title: The Mass Rapid Transit
- Publisher: National Heritage Board
- URL: https://www.roots.gov.sg/stories-landing/stories/the-mass-rapid-transit/story
- Section: All aboard!
- Access: 2026-10-20; read via indexed page
- Short quotation: “on 12 December 1987, nine more stations were added from Novena to Outram Park.”

#### R-rail-02
- Title: Speech at the opening of Section 4 of the MRT system at Jurong East Station
- Publisher: Ministry of Communications and Information / NAS
- URL: https://www.nas.gov.sg/archivesonline/data/pdfdoc/ynh19881105s.pdf
- Section: heading and first paragraph
- Access: 2026-10-20; read indexed official transcript
- Short quotation: “Today, a year later, we begin operations of part of the second half of our MRT project.”

#### R-rail-03
- Title: Eunos
- Publisher: National Library Board
- URL: https://www.nlb.gov.sg/main/article-detail?cmsuuid=1d48db31-1bbc-42b0-91db-614c1e10515d
- Section: paragraph before Author; reference 7
- Access: 2026-10-20; read indexed NLB text
- Short quotation: “On 4 November 1989, together with eight other stations along the East-West Line”

#### R-rail-04
- Title: Speech at the closing ceremony to mark completion of MRT project and opening of Boon Lay station
- Publisher: Ministry of Communications and Information / NAS
- URL: https://www.nas.gov.sg/archivesonline/data/pdfdoc/ynh19900706s.pdf
- Section: heading; first paragraph
- Access: 2026-10-20; read indexed official transcript
- Short quotation: “Tonight's ceremony to mark the completion of the MRT Project is a happy occasion.”

#### R-rail-05
- Title: Speech at opening of Woodlands MRT Line
- Publisher: Prime Minister Goh Chok Tong / NAS
- URL: https://www.nas.gov.sg/archivesonline/data/pdfdoc/19960210_0001.pdf
- Section: speech heading; closing declaration
- Access: 2026-10-20; read indexed transcript; date is ceremony date, same-day passenger service not separately established
- Short quotation: “It is now my pleasure to declare open the Woodlands MRT Line.”

#### R-rail-06
- Title: Annual Review 2001
- Publisher: SMRT Corporation
- URL: https://www.smrt.com.sg/getmedia/61dc9386-7f96-4d8d-9ae6-e373e5a02d0f/2001_AR.pdf?ext=.pdf
- Section: printed p.27, Opening of Expo station
- Access: 2026-10-20; read indexed operator report
- Short quotation: “officially opened Expo Station on 10 January 2001.”

#### R-rail-07
- Title: Annual Report 2002
- Publisher: SMRT Corporation
- URL: https://www.smrt.com.sg/getmedia/d616a462-7d80-457d-a06b-b2513d6a27f7/2002_AR.pdf%3Fext%3D.pdf
- Section: Our reach for greater convenience
- Access: 2026-10-20; read indexed operator report
- Short quotation: “MRT trains rolled into Singapore Changi International Airport for the first time on 8 February 2002.”

#### R-rail-08
- Title: Annual Report 2003
- Publisher: SBS Transit
- URL: https://www.sbstransit.com.sg/Uploads/Investor_Relations/Annual_Report/sbst_annualreport03.pdf
- Section: Operations Review; Rail Business; Service Enhancements
- Access: 2026-10-20; read indexed operator report; extract also explicitly says East Loop
- Short quotation: “18 January 2003 and the much-awaited NEL started passenger service on 20 June 2003.”

#### R-rail-09
- Title: Annual Report 2009
- Publisher: SMRT Corporation
- URL: https://www.smrt.com.sg/getmedia/bff0d1e9-de22-474a-aaa5-0433ee08f1cb/2009_AR.pdf?ext=.pdf
- Section: MRT, Highlights in FY2009
- Access: 2026-10-20; read indexed operator report
- Short quotation: “Boon Lay Extension revenue service commenced on 28 February 2009”

#### E084
- Title: Circle Line Book
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/books/pdf/Circle_Line_Book.pdf
- Section: Over to You
- Access: 2026-10-20; existing E084 reused; page text additionally read for Stages 1 and 2; quote consists of two date excerpts
- Short quotation: “28 May 2009; 17 April 2010”

#### R-rail-10
- Title: Annual Report 2012
- Publisher: SMRT Corporation
- URL: https://www.smrt.com.sg/getmedia/6d890d93-79eb-442b-b318-4dc0a1921a12/2012_AR.pdf?ext=.pdf
- Section: Operating and Financial Review, Circle Line
- Access: 2026-10-20; read indexed operator report; same paragraph confirms 14 January 2012 extension
- Short quotation: “Stage 4 and 5 commenced operations on 8 October 2011.”

#### E085-E087
- Title: Downtown Line
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network/downtown_line.html
- Section: Stages 1, 2 and 3: Opening date
- Access: 2026-10-20; existing E085, E086, E087 reused; current page read
- Short quotation: “22 December 2013; 27 December 2015; 21 October 2017”

#### R-rail-11
- Title: Hume Station to Open on 28 February 2025
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/newsroom/2025/1/news-releases/hume_station_to_open.html
- Section: paragraphs 1–3
- Access: 2026-10-20; read
- Short quotation: “will open for passenger service at 3pm on 28 February 2025.”

#### R-rail-12
- Title: Annual Report 2019/20
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/report/pdf/LTA_AR1920.pdf
- Section: Completed rail expansions; Canberra, printed p.19
- Access: 2026-10-20; read indexed report; TEL1 paragraph also confirms service 31 January 2020
- Short quotation: “officially opened on 2 November 2019.”

#### E088
- Title: Thomson-East Coast Line
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/upcoming_projects/rail_expansion/thomson_east_coast_line.html/1000
- Section: Location of stations, Stage 1
- Access: 2026-10-20; existing E088 reused and page read
- Short quotation: “Stage 1, 31 January 2020: Connecting Woodlands to NSL”

#### R-rail-13
- Title: Factsheet: Thomson–East Coast Line 2 to Welcome Commuters from 28 August 2021
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/newsroom.html?keyword=mytransport.sg
- Section: 30 June 2021 release listing
- Access: 2026-10-20; read LTA newsroom listing, direct release not recovered
- Short quotation: “will open for passenger service from 28 August 2021.”

#### R-rail-14
- Title: TEL3 Hits the City: Get fed, get fit and overall, feel fab!
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/who_we_are/statistics_and_publications/Connect/tel3hitsthecity.html
- Section: opening and closing paragraphs
- Access: 2026-10-20; read indexed page
- Short quotation: “opens for passenger service on 13 November 2022!”

#### R-rail-15
- Title: Annual Report 2024/25
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/report/pdf/LTA%20AR2024_25%20PDFa%20%28web%29.pdf
- Section: printed pp.14,16, Key Highlights
- Access: 2026-10-20; read indexed report; p.16 confirms Punggol Coast 10 December and Teck Lee 15 August 2024
- Short quotation: “opened for passenger service on 23 June 2024.”

#### R-rail-16
- Title: Factsheet: Punggol Coast Station Welcomes Commuters from 10 December 2024
- Publisher: Land Transport Authority
- URL: https://www.lta.gov.sg/content/ltagov/en/newsroom/2024/12/news-releases/punggol_coast_station_welcomes_commuters.html
- Section: paragraph 1
- Access: 2026-10-20; read; publication date 10 December 2024
- Short quotation: “will open for passenger service at 3.00pm today.”

#### R-rail-17
- Title: First Light Rail Transit system
- Publisher: National Library Board
- URL: https://www.nlb.gov.sg/main/article-detail?cmsuuid=fe1e33e6-6770-4f4b-a800-51def14c2c04
- Section: The pilot LRT system – Bukit Panjang
- Access: 2026-10-20; read; preceding sentence gives 6 November 1999
- Short quotation: “The first service started at 1.22 pm”

#### R-rail-18
- Title: Punggol LRT and Sengkang LRT West Loop to Commence Revenue Service on 29 January 2005
- Publisher: SBS Transit
- URL: https://web.archive.org/web/20190830050757/https://www.sbstransit.com.sg/press/2005jan_10-3.aspx
- Section: Phased Opening; Five Stations To Open First
- Access: 2026-10-20; read full archived primary release; initial closed stations named
- Short quotation: “commence revenue service on 29 January 2005.”

#### R-rail-19
- Title: Farmway LRT Station to Open on 15 November 2007
- Publisher: SBS Transit
- URL: https://web.archive.org/web/20170907075334/http://www.sbstransit.com.sg/press/2007-11-14-01-S.aspx
- Section: opening paragraph
- Access: 2026-10-20; read archived primary release
- Short quotation: “From tomorrow, 15 November 2007, Farmway Station”

#### R-rail-20
- Title: Cheng Lim LRT Station To Open And Sengkang West LRT to Run in Both Directions
- Publisher: SBS Transit
- URL: https://web.archive.org/web/20121224110914/http://www.sbstransit.com.sg/press/2012-12-21-01.aspx
- Section: first two paragraphs
- Access: 2026-10-20; read archived primary release; same-day station opening stated in next paragraph
- Short quotation: “From 1 January 2013”

#### R-rail-21
- Title: Kupang LRT Station to Open and More than 260 Weekly Trips to be Added to the Sengkang/Punggol LRT
- Publisher: SBS Transit
- URL: https://web.archive.org/web/20171010155818/https://www.sbstransit.com.sg/press/2015-06-15-02.aspx
- Section: first paragraph
- Access: 2026-10-20; read archived primary release
- Short quotation: “will open for passenger service on Saturday, 27 June 2015.”

#### R-rail-22
- Title: Punggol West LRT System to Commence Passenger Service and North East Line to Add More Train Trips
- Publisher: SBS Transit
- URL: https://www.sbstransit.com.sg/news/punggol-west-lrt-system-to-commence-passenger-service-and-north-east-line-to-add-more-train-trips
- Section: paragraphs 1,2,5–8
- Access: 2026-10-20; read; Nibong/Sumang/Soo Teck opened 29 June 2014; not whole West Loop
- Short quotation: “There will be no LRV service between Sam Kee Station (PW1) and Samudera Station (PW4).”

#### R-rail-23
- Title: Sam Kee Station on Punggol LRT System to open for Passenger Services
- Publisher: SBS Transit
- URL: https://www.sbstransit.com.sg/news/sam-kee-station-on-punggol-lrt-system-to-open-for-passenger-services
- Section: paragraphs 1,4,7
- Access: 2026-10-20; read; service is extended round loop, Teck Lee/Punggol Point/Samudera still closed
- Short quotation: “will open for passenger service on Monday, 29 February 2016.”

#### R-rail-gap
- Title: Candidate register for further primary-source verification
- Publisher: Research locator only
- URL: https://www.sgtrains.com/network-figures.html
- Section: Opening-date tables
- Access: 2026-10-20; secondary locator read, not acceptable verification under brief; candidate dates must not activate geometry
- Quotation: none; secondary discovery locator only.

### Transport 待核: F14 and §2.2 chapter 04

#### R-transport-ALS — confirmed
Fact: ALS began on 2 June 1975. The initial scheme required a supplementary licence for affected vehicles during restricted hours, with exemptions; do not write that every car paid. Source: *Area Licensing Scheme*, National Library Board, introductory paragraph and “Launch of the ALS”; https://www.nlb.gov.sg/main/article-detail?cmsuuid=072b1248-63b0-4b30-8a04-ba1742961351 ; accessed 20 October 2026. Quotation: “The Area Licensing Scheme (ALS) was launched on 2 June 1975.”

#### R-transport-COE — confirmed at month precision
Fact: COE/VQS launched in May 1990; this research does not independently confirm a specific day from LTA/NLB text. Source: *Vehicle ownership*, Ministry of Transport, opening policy description; https://www.mot.gov.sg/what-we-do/motoring-road-network-and-infrastructure/vehicle-ownership/ ; accessed 20 October 2026 (indexed official text). Quotation: “Launched in May 1990”. Also NHB National Museum collection object *Certificate of entitlement (under the Vehicle quota system)*, accession 2015-02023: https://www.roots.gov.sg/Collection-Landing/listing/1321937 ; description confirms May 1990.

#### R-transport-ERP — confirmed
Fact: ERP introduced in 1998; its rules commenced on 1 April 1998. Source: LTA, *Electronic Road Pricing (ERP)*, opening paragraph, https://onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html?myRad=3 ; accessed 20 October 2026. Quotation: “ERP was introduced in 1998 to manage traffic congestion in Singapore.” Exact legal commencement: *Road Traffic (Electronic Road Pricing System) Rules 1998*, Singapore Statutes Online, rule 1, https://sso.agc.gov.sg/SL-Supp/S176-1998/Published?DocDate=19980330&ProvIds=P1I- ; quotation: “shall come into operation on 1st April 1998.” Contemporary first-operation corroboration: *Good start for ERP*, The Straits Times, 2 April 1998, p.1, NLB NewspaperSG https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19980402-1 (indexed opening says operation began yesterday).

#### R-transport-Changi — confirmed; separate MRT error retained
Fact: Changi Airport began operations on 1 July 1981. Source: *How Changi Airport Came To Be*, National Library Board, BiblioAsia, vol.17 issue 3 (2021), “Expanding Changi”, https://biblioasia.nlb.gov.sg/all-sections/vol-17-issue-3-oct-dec-2021-changi-airport/ ; accessed 20 October 2026. Quotation: “Changi Airport began operations on 1 July 1981 with just one terminal and one runway.” The same article incorrectly/discordantly dates Changi Airport MRT station to 2001; retain both accounts: SMRT 2002 first-train account explicitly gives 8 February 2002 (R-rail-07). Airport opening and airport rail link are different events. Reclaimed-land extent not independently quantified here.

#### R-transport-bus — confirmed
Fact: three bus companies merged into SBS on 1 July 1973; reorganisation continued with a Government Team of Officials in May 1974. Source: *The Road to Nationalisation: Public Buses in Singapore*, Lee Meiyu, National Library Board, BiblioAsia, 10 October 2017, merger paragraph and following paragraph, https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-3-oct-dec-2017-roadtonationalisation/ ; accessed 20 October 2026. Quotation: “the government announced the merger of the three bus companies to form Singapore Bus Service (SBS) on 1 July 1973.” Write the documented merger plainly; the article’s evaluative language is not needed.

#### R-transport-PIE — partly confirmed; first-section day unverified
Fact: PIE was built in phases, with its initial 35 km stretch constructed between 1966 and 1981 according to NLB. Source: *The A(YE), B(KE) and C(TE) of Expressways*, National Library Board, BiblioAsia, vol.14 issue 2 (2018), “The First Expressways: PIE and ECP”, https://biblioasia.nlb.gov.sg/all-sections/vol-14-issue-2-jul-sep-2018-aye-bke-cte-expressways/ ; accessed 20 October 2026. Quotation: “The 35-km stretch was constructed between 1966 and 1981”. Government Singapore Mandarin Database entry *Expressway* confirms Thomson Road–Woodsville Circle opened in 1969: https://www.languagecouncils.sg/mandarin/ch/learning-resources/singaporean-mandarin-database/terms/expressway ; exact month/day unverified. NLB Eunos article (R-rail-03) confirms eastern PIE Jalan Eunos–ECP opening on 10 January 1981. Construction start, first section and complete route must remain distinct.

### Remaining gaps and map cautions

- The rows with `date: null` require primary day verification. Do not turn `candidate_date` into a map date automatically.
- Opening ceremonies are not inherently first passenger service. NAS 1990 Boon Lay and 1988 Section 4 speech dates are contemporary opening evidence, but no separate first-train narrative was recovered for them.
- NLB first-LRT article explicitly distinguishes inaugural ceremony and first service on the same day; 6 November 1999 is confirmed.
- Punggol West is especially important: SBS’s 2014 primary release explicitly says there was NO service between Sam Kee and Samudera. The whole geometric West Loop must not appear in 2014. The 2016 Sam Kee release describes continuous travel Sam Kee → Nibong, passing unopened stops.
- Deferred stations (Buangkok, Woodleigh, Hume, Mount Pleasant, Marina South, LRT stops) do not automatically identify deferred through-track. Station opening and track passenger use must be stored separately.
- Ten Mile Junction branch shutdown/reopening/permanent closure dates were not verified; through-2025 portrayal needs separate source checks.
- Circle Line Stage 6 and DTL/TEL extensions opening in 2026 lie outside the topic’s 2025-12-31 end; do not show them.
- The 1990 chapter endpoint beat is supported at year precision (LTA original EWL ends at Boon Lay 1990; original MRT complete 1990); Pasir Ris/Marina Bay exact-day records remain pending above.
- No map geometry, station coordinates or line-colour claims are made by this research. Textual citations do not license reuse of maps embedded in those sources.

Parent audit: Boon Lay’s official opening speech establishes 6 July 1990 as the opening event, but does not independently establish first passenger service. That row is downgraded to unverifiable for the required passenger-service register. The original sourced opening date is retained separately.


## Second pass: content authoring and additional checks (20 October 2026)

The first-pass account-gate paragraph above records the earlier run; it does not describe the second-pass build. The second pass authors English chapters and data using the retained supplemental evidence. The original ledger was subsequently located and read from the read-only main worktree at `/Users/gavin/work/atlas/art/codex-research/singapore-land-use/`. Its facts, datasets and research narrative are now retained as `scripts/geo/singapore-land-use/research/original-*`; earlier missing-worktree cautions are superseded. No original publication that was inaccessible is represented as newly read.

| Check | Exact source / locator | Short quotation | Outcome and access mode |
|---|---|---|---|
| Queenstown early blocks | National Heritage Board, *The First HDB Blocks & the HDB Terraces*, opening paragraphs; https://www.roots.gov.sg/places/places-landing/Places/landmarks/my-queenstown-heritage-trail/the-first-hdb-blocks-the-hdb-terraces ; accessed 20 October 2026 | “completed in October 1960” | Corrected: completion October 1960; handover 1961. Official indexed text inspected; direct page returned a bot challenge. S79. |
| Area Licensing Scheme | Lim Tin Seng, NLB, *Area Licensing Scheme*, opening paragraph and “Launch of the ALS”; https://www.nlb.gov.sg/main/article-detail?cmsuuid=072b1248-63b0-4b30-8a04-ba1742961351 ; accessed 20 October 2026 | “launched on 2 June 1975” | Confirmed from full article. Non-exempt vehicles required a licence; exemptions prevent saying every vehicle paid. S157. |
| Bus integration | LTA, *The LTA Story*, organisational history; https://www.lta.gov.sg/content/ltagov/en/who_we_are/our_organisation/the_lta_story.html ; accessed 20 October 2026 | “merged in 1973” | Confirmed in official indexed text: consolidation in 1970, SBS merger in 1973. S150. |
| Changi first service | Changi Airport Group, *Building Changi from ground up – commemorating Changi’s 40th anniversary* (2021), closing section; https://www.changiairport.com/en/corporate/our-media-hub/publications/changi-journeys/2021/building-changi-from-ground-up-commemorating-changis-40th-anniversary.html ; accessed 20 October 2026 | “1 July 1981” | Confirmed from official indexed article text. S151. |
| ERP first launch | LTA, *Annual Report 2014/2015*, printed pp.26–27, milestone “ERP launched”; https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/report/pdf/LTA_AR_14-15_RGB.pdf ; accessed 20 October 2026 | “launch on 1 April” | Confirmed in indexed PDF page text under 1998. Starts on expressways; city cordon followed later. S152. |
| Revised food goals | MSE, *Oral Reply to Parliamentary Question on Revised Local Production Targets*, 13 January 2026, reply paragraphs; https://www.mse.gov.sg/latest-news/oral-reply-to-parliamentary-question-on-revised-local-production-targets/ ; accessed 20 October 2026 | “fresh leafy and fruited vegetables, beansprouts, and mushrooms” | Confirmed: fibre-food definition; protein group is eggs and seafood. The reply is retrospective after the topic end. S201. |

Content uses corrected dates for the land-acquisition law (approval 26 October 1966, effect 17 June 1967), the home-ownership scheme (12 February 1964), and early Queenstown blocks (October 1960 completion). The policy event for first indoor farming identifies western Singapore approximately and explicitly does not claim a verified facility location. Tuas reclamation uses the start of a documented decade, with that precision caveat in the event.

Remaining unresolved checks from the first-pass ledgers are retained, including the July syllabus edition; the original Loh pages about rumours and responses; founding-day HDB office; contemporary State-land share; first-development date for Jurong West; some industrial-estate dates and individual farm-park openings; Chinese park names; precise indoor-farm coordinates; farmer responses to the May 2026 proposal; and source-specific causal claims about imported sand and coastal damage. No cause of the Bukit Ho Swee fire is inferred.

| Additional check | Exact source / locator | Short quotation | Outcome |
|---|---|---|---|
| COE implementation month | NHB / National Museum, *Certificate of entitlement (under the Vehicle quota system)*, accession 2015-02023; https://www.roots.gov.sg/Collection-Landing/listing/1321937 ; accessed 20 October 2026 | “implemented in May 1990” | Confirmed in official indexed collection text; direct page requires bot check. S158, event uses month precision. |
| Historical rail lengths | Singapore Department of Statistics / LTA, *Public Transport Operation And Ridership, Annual*, MRT row; https://data.gov.sg/datasets/d_ba615ec4cc5d9f5b7800ad82057f36f1/view ; accessed 20 October 2026 | “Mass Rapid Transit (MRT)” | Confirmed 1990 and 2024 route lengths in the public data table. LTA *Rail Length 2024* separates MRT and LRT. S156. |
| Area measurement break | Singapore Department of Statistics / SLA, *Land Area (As At December), Annual*, footnotes; https://data.gov.sg/datasets/d_0b2c034da121ef8efc71949af1694b4d/view ; accessed 20 October 2026 | “Prior to 2002, data are based on approved land lots.” | Confirmed: from 2002, land owned parcels. S200. |

| Landsat cloud licensing | USGS, *Are Landsat data in the cloud still considered to be within the public domain?*; https://www.usgs.gov/faqs/are-landsat-data-cloud-still-considered-be-within-public-domain ; accessed 20 October 2026 | “Landsat data are controlled by the USGS” | Official indexed FAQ confirms public domain regardless of USGS storage location. The Level-1 page also states that use is unrestricted. S10. |

| Labrador and Sungei Buloh gazette month | Ng Lang, *A City in a Garden*, Civil Service College ETHOS (April 2008), “Conserving our natural heritage”; https://knowledge.csc.gov.sg/world-cities-summit-issue/a-city-in-a-garden/ ; accessed 20 October 2026 | “were gazetted in January 2002” | Confirmed from full official article by the then NParks chief executive. Supersedes the earlier Labrador year/month gap, without claiming the unread worksheet’s exact day. S218. |

## Second-pass final Landsat source register

Read from retained Microsoft Planetary Computer STAC item responses on 20 October 2026. Whole-scene cloud is not Singapore-island cloud. Final MSS NDWI uses B4/B7; TM/ETM+ MNDWI uses SR_B2/SR_B5. The 2009 Tier-2 candidate was rejected visually for haze and replaced by 14 February 2011. The coastal build records island QA, thresholds, cleanup and limits; these rows do not assert accuracy acceptance.

| Source | Exact item | Acquisition date | Whole-scene cloud | Index bands | Metadata / source |
|---|---|---|---:|---|---|
| S11 | `LM01_L1TP_134059_19731017_02_T2` | 1973-10-17 | 2% | B4/B7 | [landsat-c2-l1](https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l1/items/LM01_L1TP_134059_19731017_02_T2) |
| S12 | `LM02_L1TP_134059_19791031_02_T2` | 1979-10-31 | 20% | B4/B7 | [landsat-c2-l1](https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l1/items/LM02_L1TP_134059_19791031_02_T2) |
| S13 | `LT05_L2SP_125059_19910428_02_T1` | 1991-04-28 | 11% | SR_B2/SR_B5 | [landsat-c2-l2](https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LT05_L2SP_125059_19910428_02_T1) |
| S14 | `LE07_L2SP_125059_20021011_02_T1` | 2002-10-11 | 54% | SR_B2/SR_B5 | [landsat-c2-l2](https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LE07_L2SP_125059_20021011_02_T1) |
| S15 | `LT05_L2SP_125059_20110214_02_T1` | 2011-02-14 | 26% | SR_B2/SR_B5 | [landsat-c2-l2](https://planetarycomputer.microsoft.com/api/stac/v1/collections/landsat-c2-l2/items/LT05_L2SP_125059_20110214_02_T1) |

Historical-shore check: the upstream `scripts/geo/singapore-1819-1965/SOURCES-GEO.md` calls L4/L5 rejected research drafts. Its explicit source-age and accuracy limitations are retained in S19 and in the reader’s approximate-shore explanation. Copying the required outlines does not promote them to accepted surveys.

## Original evidence ledger audit — completed second pass

All 136 fact records, source/evidence joins, dataset licence/status entries and narrative research sections were read from the main worktree without changing it. Durable copies preserve E001–E165 and the original S001-style source ids. `research/original-evidence-crosswalk.json` maps matching original evidence and fact ids to this topic’s final S# registry and records SHA-256 receipts. Dataset permissions remain distinct from text citations: original NAS, SLA/NUS, agrotechnology annex and academic maps are reference-only.

The audit confirms the chapter’s HDB percentages and denominator change (E041–E053), farm numbers (E054–E059), food counts and category shares (E063–E064), former/revised goals and definitions (E065–E068), MRT lengths/openings (E069–E089), Bukit Ho Swee figures/unknown cause/rehousing (E090–E095), residents’ experiences (E096–E104) and new-town milestones (E105–E110). No conflicting original fact required changing those claims. Supplemental corrections still govern precise home-ownership, land-law, Queenstown and rail service dates. The MOE source URL is corrected to the exact January 2024 PDF in original E001. The revised target’s 2035 date now also cites its exact SFA source (S220 / E066); it is not attributed only to an abbreviated MSE reply.

Original reservoir evidence E111–E118 distinguishes formation, completion, opening and commissioning; it does not silently replace the required copied four-taps event dates. The July 2024 syllabus, exact historical farm boundaries and inaccessible original Loh pages remain unresolved. Finding the research ledger does not resolve those underlying source gaps.
