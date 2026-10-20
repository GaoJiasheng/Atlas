# Singapore's land, 1959–today: verification ledger (historian review, 20 October 2026)

Codex drafted the data and English chapters in two passes (commit 82ee63c; its report is `scripts/geo/singapore-land-use/CODEX-REPORT.md`, its research register `RESEARCH.md`). This review checked every map layer against its source and licence, re-read the sources behind every number and date in the chapters, captions and events (NLB Infopedia and BiblioAsia, HDB, URA, LTA, PUB, SFA, NParks, JTC, NAS speeches and press releases, MFA, CLC studies), rewrote the English chapters and wrote all the Chinese text. Sources were re-read directly or, where NLB pages block scripts, through Wayback copies; each source note says when it was read.

## What was audited

| Item | Count | Result |
|---|---|---|
| Chapters (background + 6) | 7 × 3–4 paragraphs | rewritten in English for young readers (concrete, short sentences, every number in `<Num>`); Chinese written independently |
| More blocks | 21 | rewritten; disputes given two sides; three figures re-captioned |
| Beats | 33 | captions checked against the map in EN and ZH screenshots; 14 changed (cameras, layers, dates, wording) |
| Events | 55 (17 reservoirs copied unchanged; the naval base copied with its kind changed to `site`) | 37 retitled and rewritten; 2 Johor events (Linggiu) removed; the 1959 Kampong Tiong Bahru fire folded into the Bukit Ho Swee event; dates corrected (below) |
| Rail segments | 37 | 2 dates corrected; labels written out in full in both languages |
| Entities, presets, glossary | 8, 6, 14 | Chinese written; glossary definitions tightened; `water-catchment` identical to four-taps `catchment` |
| Sources | 119 (S1–S231 with gaps) | every Codex source rewritten as a readable citation with a Chinese text and note; housekeeping (“evidence ledger E…”, “read from the read-only main worktree”) removed from reader notes; S33–S35 (Linggiu) dropped; S221–S231 added for the corrections (NAS speeches, NLB Infopedia via Wayback, NHB Roots, two reviews of Loh 2013, MND and Global Witness on sand) |
| Map layers | 5 dated layers, 7 coast eras, 4 control frames | see “Map data” below |

## Map data

| Layer | Verdict | What was checked / changed |
|---|---|---|
| Coast eras (`land-sg-modern.json`) | **fixed** | (1) Cloud blobs and single bright pixels over seas reclaimed later had become round islets (up to 45 per era: Changi, Tekong, Jurong); the extraction now drops land specks under 0.1 km² (the method's own noise rule) and cloud-dominated patches standing apart from the island. (2) The inherited 1959–1973 coast (docs/28 L5) lacked Pulau Ubin, Pulau Tekong and the southern and Jurong islands, so a 1959 map showed them as sea later “reclaimed”; they are now taken from the 1973 Landsat image. (3) L4 (the 1941 map) is dropped: for 21 months it would have shown ~15 km² more western mangrove coast than L5, a change of source, not of land. Display simplification improved from 90 m to 50 m within the 250 KB budget. Measured deviations along unchanged coast (p50 / p95, m): L6 40.5 / 172.6, L7 48.2 / 215.0, L8 24.6 / 157.6, L9 19.2 / 113.7, L10 26.5 / 268.0 — above the spec's p95 targets; stated to readers. |
| K1, 1959 (`control.json`) | **fixed** | City and naval base traced from the BIS map (PD-UKGov) checked against the source image; countryside rebuilt on the corrected coast, so the islands are now coloured. Georeference is approximate (1920-px preview, 16 constructed graticule points); every K1 feature stays `approximate`. |
| K2, K3 empty; K4, MP2019 | **kept** (+ hold frame) | Empty frames as specified; K4 grouping table checked against all LU_DESC values (none unplaced); labelled “planned use” everywhere. A hold frame (K4 again, 31 December 2025) ends the axis on the spec's date; without it the last event (November 2025) ended the axis and clamped the final beat. |
| HDB dots (`sg-hdb-blocks`) | **kept** | 10,644 of 10,817 residential rows joined (98.4 %); spot checks: Pinnacle@Duxton 7 points, 2009, 50 storeys; pre-1960 dots are SIT blocks (Tiong Bahru 1937–49, Dakota 1958), now said in captions and text. 26 blocks dated 2026 lie beyond the timeline. |
| Industrial estates (`sg-estates`) | **fixed** | Jurong (1961, JTC “conceptualised in 1961”) and Seletar Aerospace Park (2007) kept; today's extent was drawn over the sea of the 1960s, so every area layer is now cut by coast era (one piece per era, `[from, to)`). |
| Farmland (`sg-farm-parks`) | **fixed** | Feature renamed (“Ah Ma Keng” was named without its boundary); clipped by coast era; still one group (Lim Chu Kang and the western catchment), the other five 1986 parks have no planned farmland today. |
| Nature reserves (`sg-reserves`) | **fixed** | Bukit Timah and the Central Catchment dated from 1951 (Nature Reserves Ordinance; NParks), not 1990 (re-declaration), so the background chapter's “today's reserves” outline is visible; Sungei Buloh and Labrador 2002. |
| Reservoirs (`sg-reservoirs`) | **fixed** | Geometry, arcs, names and years identical to four-taps; Linggiu (Johor) removed because this topic maps Singapore only. 17 features. |
| Rail (`movements.json`) | **fixed** | Geometry from URA MP2019 rail (SODL) checked on the overview plate; dates checked against NAS speeches, LTA and NLB (corrections below). |

## Corrections of fact

| Where | Draft | Corrected | Source |
|---|---|---|---|
| rail `ewl-outram-park-clementi` | 13 March 1988 | 12 March 1988 (six stations Tiong Bahru–Clementi opened with the official opening) | S96 |
| rail `nsl-woodlands-extension` | February 1996 | 10 February 1996 | S223 |
| `agrotech-parks-1986` | first tenders Sungei Tengah, Murai and Lim Chu Kang | Sungei Tengah, Murai and Loyang, 120 ha, tendered 5 September 1986 | S103 |
| `woodlands-new-town` | 1972, “under construction” | building began 1971; first flats (Marsiling Blocks 1–5) finished 1973 | S58 |
| reserves layer | Bukit Timah, Central Catchment from 1990 | from 1951 (first legal protection as nature reserves); 1990 is the re-declaration | S204, S205 |
| ch02 | “Jurong… set up in 1968” | JTC set up 1 June 1968; EDB planned Jurong from 1961 | S203 |
| ch02 | state land share not given | about 44 % (1960) to over 85 % (2007) (CLC); 31 % (1949) to 76.2 % (1985) (NLB) | S54, S53 |
| ch05 | Jurong Island “opened 2000; reclamation continued” | joined from 1993, opened 14 October 2000, scheme completed 2003 | S207, S208 |
| ch05 | Rock Caverns “free surface land” | about 60 ha freed | S210 |
| ch03 | “30 by 30” set in 2019 (Opus draft) | year removed (not in a read source); Food Story 2 announced 4 November 2025 | S201, S220 |
| ch01 | Queenstown planned 1953 | HDB: 1953; NLB: 1952 — note gives both | S70 |
| ch04 | ERP 1 April 1998 replaced ALS | ERP started 1 April 1998 on the East Coast Parkway; the city area followed in September 1998 | S152 |
| event `changi-airport-opens` | — | operations 1 July 1981; official opening 29 December 1981 (in source note) | S151, S222 |
| `site-linggiu-*` | two Johor events | removed from this topic (kept in four-taps) | — |
| `singapore-naval-base` | `political`, 1938 | `site` (same date, text and sources): as a dated event it pulled the time axis back to 1938 | S216 |
| `kampong-fire-1959` | own event, 13 February 1959 | folded into `bukit-ho-swee-fire` detail (it fell before the 1959 map and pulled the axis start back) | S55 |
| ch01 More | “government rejected the rumour; no evidence found”; “Loh interviewed residents… fire brought people into flats sooner” (Opus draft, unsourced) | rumours (gangs or the government) and one resident's words from two reviews of Loh; the government's 1961 amendment to the land law to remove landlords' inducement to arson (NLB) | S221, S231, S55 |
| ch01 | shelter “in schools and community centres” | about 7,000 people in five schools on Kim Seng Road by 5 p.m. that day | S55, S226 |
| ch01 More | 53,000 vs 54,430 left unexplained | 54,430 units = 53,777 homes + 653 commercial (HDB) | S65 |
| ch02 | Toa Payoh “first comprehensively planned” (HDB page did not render) | “first town conceived and built solely by HDB” (NLB); building began end-1964, first tenants 20 June 1966 | S229 |
| ch02 More | Au Seck Ngee: contracts in English | adds the facts on the page: moved before national service, signed with his mother, first a three-room flat, family spoke dialect; Chinese name 欧摄毅 | S69 |
| ch03 | pig farms closed “to protect reservoirs” | 1985 release: pollution, treatment cost, land, complaints from nearby estates; catchment protection was the aim of the 1970s move to Punggol (NHB) | S100, S225 |
| ch03 / `first-indoor-farm` | “began trial supply in July 2014” | the builder announced trial supply on 31 July 2014 | S106 |
| ch04 / `changi-airport-opens` | “much of it on reclaimed land” | “partly”: 707 of 1,663 ha (Howe 1981; 745 or 870 ha in NLB articles) | S222 |
| ch04 / `erp-1998` | ERP “on expressways” from 1 April 1998 | East Coast Parkway only on 1 April; the city area from September 1998 | S224 |
| ch04 | ALS: “a car” needed a licence | most cars; buses, taxis, goods vehicles, motorcycles and car pools of four exempt | S157 |
| ch05 More | sand “first from Singapore's hills, then neighbours”; “Singapore buys only from licensed sources” (unsourced) | East Coast fill from Siglap, Bedok and Tampines hills; Changi from the seabed; Tekong partly imported (NLB); MND's 2010 reply on checking sources vs Global Witness | S207, S227, S228 |
| ch06 More | Lim Chu Kang change “proposed” | the government will implement it (release title) | S215 |
| Murai (Chinese) | 姆赖 | 慕莱, as in four-taps' 慕莱蓄水池 | — |

## Disputes written both ways (no verdict)

1. **Bukit Ho Swee fire, cause** — NLB and NHB: unknown; rumours at the time blamed gangs or the government (Loh, via the LSE and IIAS reviews); the government's response was to change the land law so that landowners could not gain from land cleared by fire (NLB). No verdict — ch01 More, event detail.
2. **Land acquisition** — the government's case (land needed quickly; publicly created land value belongs to the public; Lee Kuan Yew) vs owners' hardship (compensation on 1973 values could not buy a replacement) — ch02 body and More, event detail.
3. **Resettlement** — gains (water, power, sanitation, safety from fire, ownership) vs losses (neighbours, farms, livelihoods, difficult first years in high-rise flats); one named family's memory (Au Seck Ngee) — ch02.
4. **Pig-farm phase-out** — the government's reasons (pollution, treatment cost, land, nearby housing) vs farmers who had just invested at Punggol and Koh Lip Lin's criticism in Parliament (1988) — ch03 More, event detail.
5. **Sand for reclamation** — the land it gave vs its costs: buried reefs and mangroves, imported sand, Indonesia's export bans (2003 sea sand, 2007 land sand) and neighbours' concerns — ch05 More.
6. **Lim Chu Kang, 2026** — farmland moved north, defence south; farms keep tenures and may bid elsewhere — ch06 More, written as a plan still being worked out.
7. **Numbers that differ by source** — HDB output by 1965 (53,000 NLB vs 54,430 MND); share in HDB flats in 1970 (35 % of residents vs 36 % of total population); Bukit Timah forest reserve (1883 NParks vs 1887 Gardens' Bulletin); Changi reclaimed area (707, 745 or 870 ha) — both given where used.

## Comparable things written alike

- Every planned-use statement says “planned use”; every dated area says “today's extent”; every HDB dot is “a block still standing today”.
- Policies without a place (home ownership, COE, Food Story 2) carry the same note: the marker stands for the city or the island.
- Gains and losses are paired in each chapter that moves people or farms (01, 02, 03), and costs are paired with gains for new land (05).

## Consistency with four-taps and singapore-1819-1965

- Reservoir geometry, ids, names, years and source texts are identical to four-taps (test `tests/time-scene/singapore-land-use.test.ts` checks the years); Linggiu is omitted. `water-catchment` uses four-taps' `catchment` definition word for word.
- `singapore-naval-base` and its two sources are byte-identical to singapore-1819-1965 (only the source numbers differ).
- The first coast era is that topic's L5; its maps are still under review (docs/28), so this coast is called approximate.

## Residual gaps

1. Loh Kah Seng's book was not read; his argument is taken from the publisher's description and two reviews (S56, S221, S231). The Pacific Affairs review sat behind a verification page and was not read.
2. No open map of farms and kampongs between 1959 and 2019 exists; the map is empty of land use between the two whole-island maps, and the text says so.
3. Coast p95 deviations exceed the spec targets; tides were not matched; the 2011 scene was 22 % cloud over the island.
4. K1's georeference uses a preview image and constructed control points; its residuals are internal, not independent.
5. The exact site of the first indoor farm, HDB's office on 1 February 1960 and the opening days of Sembawang and Changi airfields were not confirmed.
6. Marina South Pier's opening day (November 2014) is kept to the month.
