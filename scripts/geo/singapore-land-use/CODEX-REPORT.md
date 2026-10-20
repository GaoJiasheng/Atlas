# CODEX report — singapore-land-use

20 October 2026 · **INCOMPLETE: stopped at brief step (2), as instructed by the Landsat account-access gate.**

## Stop condition and evidence

The fixed coast method requires Collection 2 **Level-1 L1TP**. Microsoft Planetary Computer anonymously serves the required MSS family, but its TM/ETM+ collection is Level-2. The actual USGS TM Level-1 green-band download redirected to `ers.cr.usgs.gov/login` and returned login HTML. AWS returned HTTP403 (anonymous requester-pays requests require authentication); Google returned HTTP400 (requester-pays billing project missing). These tested routes did not provide the required TM/ETM+ Level-1 inputs without an account. This is an access limitation, not a copyright restriction or a claim that no other archive could exist.

The brief says **“if every route needs an account, stop and report — do not create accounts.”** No accounts, billing projects or registered-user sessions were created. No Level-2, Collection1, schematic shoreline or guessed map geometry was substituted. Downstream steps (3)–(8) were not started. Resume requires supplied Level-1 files, another verified account-free Level-1 route, or an explicit change to the required processing level.

Evidence: [SOURCES-GEO.md](SOURCES-GEO.md), [machine access receipts](research/landsat-access.json), [download receipts](research/fetch-receipts.json), and ignored `raw/` API responses. A successful MSS 32-byte range request is **not** counted as a scene download. Scene candidates were not accepted using scene-wide cloud percentages: island cloud, tides and coast quality remain unmeasured.

## Work retained

- Ran the exact requested `scripts/new-topic.ts` scaffold command. Set `topic.yaml` title, draft status, geography metadata, local basemap name/maxZoom, entity colours mode, bloc labels, strings, illustration id, note and five `datedLayers` entries to the specified names. The layer assets do not yet exist.
- Added topic-local `.gitignore` entries for `raw/`, `work/`, `refs/`. The manifest carries the prescribed water/keepMatch settings copied from four-taps. It is an incomplete source manifest, **not a ready-to-run map recipe**. Its water-name selector input and eight era recipes are not supplied.
- Kept four successful data.gov.sg downloads with ids, timestamps, bytes, SHA-256 and inherited licence/attribution evidence. G6/G7/G8/G12 downloads were rate-limited (HTTP429). G1 metadata was retrieved, but the full-resolution Commons original and licence-template requests returned HTTP403.
- Wrote [RESEARCH.md](../../../src/content/topics/singapore-land-use/RESEARCH.md), combining supplementary housing, land/food and rail source ledgers. Original E# evidence identifiers are retained. Newly read sources, local original-document extracts, reused evidence and indexed-only evidence are distinguished. Original Loh book pages were not accessed and no causal verdict was supplied.
- Removed generated chapter prose placeholders. No child-facing draft chapters are claimed. The scaffold's single empty control entry contains no geography and is **not an authored K1**.
- Four-taps and singapore-1819-1965 remained read-only. No engine, component, shared pipeline, package, other topic, `dist/`, build or commit changes were made. Unrelated untracked `docs/35-light-and-shadows-content-spec.md` and `docs/36-states-of-matter-content-spec.md` appeared during the run and were left untouched.

## Counts

Published topic data counts at this stop:

| Deliverable | Count / state |
|---|---|
| Authored coast eras | **0**; required L4–L11 =8, all unbuilt here |
| Control keyframes | **1 scaffold entry**, empty; **0 authored frames**; requested K1–K4 sequence absent |
| Entities | 0; eight categories are specified but data array remains empty |
| Category features | housing0; countryside0; agriculture0; industry0; green0; transport0; defence-special0; town-and-services0 |
| HDB points | 0; join not run; matched/ambiguous/unmatched counts and rates **not measured**, not0% |
| Dated-layer features | hdb-blocks0; estates0; farm-parks0; reserves0; reservoirs0; all five files absent |
| Published rail movement segments | 0 |
| Events / sources / glossary terms | 0 /0 /0 in topic data; S# source numbering not performed |
| Chapters / comparison plates / generated figures | 0 /0 /0 |
| Successful dataset files / full Landsat scenes | **4 /0** |

Supplementary research counts (these are records, including overlapping claims, not unique historical facts):

| Ledger | Records | Confirmed | Corrected | Unverifiable |
|---|---:|---:|---:|---:|
| housing | 53 | 38 | 4 | 11 |
| land-food | 56 | 32 | 5 | 19 |
| rail | 49 | 33 | 0 | 16 |

The additional July2024 syllabus-version check is unverifiable. The original reusable ledger has136 facts,165 evidence ids and83 source entries; those are **not** newly authored `sources.json` entries or independently rechecked in full here. “Confirmed” concerns the particular source statement, not reconciled conflicts or map readiness. The 49 rail-register rows comprise 36 track-project rows and 13 station-on-existing-track rows. The rail register uses operator/NAS/MOT fallbacks where LTA/NLB evidence was unavailable; that provenance is explicit. It is not a completed LTA/NLB-only passenger-service register. Boon Lay’s opening-event day was downgraded in the parent audit because first passenger service was not independently established.

## Per-era coast statistics

**N/A means not produced or measured; no zero error or area is implied.** Upstream L4/L5 were read as source assets but not decoded/rebuilt here. The 1973 candidate is metadata/byte-access evidence only, not a chosen scene.

| Era | Accepted scene/date | Threshold | Unchanged-coast p50/p95 | Area difference to today | Minus/plus piece table |
|---|---|---|---|---|---|
| L4 | upstream history L4, not copied | N/A | N/A | N/A | N/A |
| L5 | upstream history L5, not copied | N/A | N/A | N/A | N/A |
| L6 | none; candidate LM01_L1TP_134059_19731017_20200909_02_T2,17 October1973 | N/A | N/A | N/A | N/A |
| L7 | none; 1979 MSS search items only, not accepted | N/A | N/A | N/A | N/A |
| L8 | none; USGS TM candidate31 August1990 redirects to login | N/A | N/A | N/A | N/A |
| L9 | none; required ETM+ L1 not fetched | N/A | N/A | N/A | N/A |
| L10 | none; required TM L1 not fetched | N/A | N/A | N/A | N/A |
| L11 | URA dataset fetched; not dissolved/built | N/A | N/A | N/A | N/A |

No unchanged-coast masks, thresholds, buffers/erosions, pieces above0.1km², engineering-project matches or comparison PNGs were calculated. L4/L5 upstream residuals must not be presented as measurements of an unbuilt topic asset.

## K1 georeference residuals

**Not measured.** Original G1 full-resolution download failed with HTTP403; no image, control points, projection fit, RMS/max/leave-one-out residuals, stipple tracing, or countryside difference operation was produced. The ≥16-point and max300m/RMS150m gates are unassessed.

## Corrections and disagreements to carry forward

- Home Ownership for the People launch: **12 February1964**, so draft beat/event1 February1964 would be early.
- Land Acquisition Act: approval **26 October1966**, commencement **17 June1967**. Historical compensation formulae must not be described using current rules; both public-purpose rationale and documented replacement-property difficulty are sourced.
- First housing programme: NLB53,000 flats by end1965; MND54,430 units by mid1965. Scope/date conflict unresolved; preserve both. Official1959 population is1,587,200 in the inspected record, requiring a caption of about1.6million rather than borrowing1957’s total.
- Pig-farming phase-out announced March1984; CLC places the last pig in1989. Government rationale and farmers’ investment/livelihood consequences are both recorded.
- Six agrotechnology parks: **1986 reservation/tender programme is not six verified individual openings**. Keep that distinction for approximate dated areas.
- Indoor farm: SFA2014; manufacturer facility established October2013, pilot commercial supply announced31 July2014. These milestones differ.
- East Coast:1966 start, seven phases over roughly thirty years;1985 is not verified as the end of the whole project. Jurong Island opening14 October2000 is separate from conflicting completion accounts2003/2009.
- Reserve histories distinguish forest reservation,1951 Ordinance protection and1990 Nature Reserve declaration; NParks accounts include1883/1887 disagreement. Sungei Buloh park opening1993 differs from reserve gazette2002.
- Punggol West2014 service was partial; a whole-loop geometry would be wrong.2016 passenger track and later station openings must be separated. Changi MRT2001/2002 accounts disagree; airport station and Expo opening are separate.

## Every explicitly unresolved supplemental record

Each item below has exact source/section/access status and, where readable, a quotation in `RESEARCH.md` / the linked ledger. Unverified candidate dates are locators only, excluded from accepted dates and all published geometry.

### housing

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

### land-food

- `pig-farmers-overseas`: Individual farmers’ relocation to neighbouring countries was not verified in the inspected sources.
- `farm-park-lim-chu-kang`: Lim Chu Kang: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-murai`: Murai: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-sungei-tengah`: Sungai Tengah: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-nee-soon`: Nee Soon: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-loyang`: Loyang: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-ah-ma-keng`: Ah Ma Keng: 1986 land reservation verified; individual opening/gazette year unverified.
- `farm-park-chinese-names`: Chinese names for all six historical agrotechnology parks were not individually verified.
- `first-indoor-farm-location`: Jalan Ahmad Ibrahim is reported by The Straits Times; exact site/address and publishable point coordinates were not verified from primary evidence.
- `jurong-construction-day`: A single estate-wide start/opening day was not established; sources disagree on the National Iron & Steel Mills foundation-stone day.
- `jtc-founded`: Jurong Town Corporation Act commencement is 1 June 1968, but direct SSO access was blocked.
- `tuas-industrial-opening`: NLB describes industrial development following 1970s resettlement; no precise estate opening year was verified.
- `woodlands-industrial-opening`: Woodlands Town Plan 1971–1975 included industry, but an industrial-estate opening year was not verified.
- `seletar-aerospace-opening`: JTC’s indexed Dream Factories timeline places first tenants in 2010; full PDF text could not be read reliably.
- `reserve-labrador`: NParks’ indexed educational factsheet gives gazette date 1 January 2002; full PDF could not be retrieved.
- `sand-environmental-claims`: Neighbour-country coastal damage and Cambodian-sand controversy require further directly readable reporting; no specific causal finding verified here.
- `semakau-reclamation-dates`: Semakau reclamation dates were not researched before mandated Landsat access stop.
- `pinnacle-duxton`: HDB’s indexed publications give completion 2009 and 50 storeys; exact December date was not verified from full source.
- `lim-chu-kang-farmers-perspective`: Affected farmers’ own responses to the 2026 changes were not verified.

### rail

- `ewl-outram-park-clementi`: Outram Park → Clementi: Ceremonial inauguration on 12 March 1988 is verified; first passenger day of west extension not independently checked.
- `nsl-yio-chu-kang-yishun`: Yio Chu Kang → Yishun: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `nsl-raffles-place-marina-bay`: Raffles Place → Marina Bay: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `ewl-tanah-merah-pasir-ris`: Tanah Merah → Pasir Ris: NLB BiblioAsia Pasir Ris article confirms month and cites “3 Stations Open Today”, Straits Times, 16 December 1989, p.30; original not read.
- `branch-jurong-east-choa-chu-kang`: Jurong East → Choa Chu Kang: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `ewl-boon-lay-1990`: Lakeside → Boon Lay: Official completion/opening speech; day of first service needs separate check if distinguishing ceremony. Parent audit: opening day is sourced, but passenger-service day remains unverified; excluded from map-ready dates.
- `nsl-woodlands-extension`: Choa Chu Kang → Yishun: Official NAS opening speech and LTA 2014/15 annual report confirm inauguration; same-day first passenger service not independently established.
- `ewl-dover-infill`: Dover → Dover: SMRT 2002 report confirms October 2001 only; station added on existing track, never delay 1988 track to 2001.
- `nel-buangkok-opens`: Buangkok → Buangkok: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `nel-woodleigh-opens`: Woodleigh → Woodleigh: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `nsl-marina-bay-marina-south-pier`: Marina Bay → Marina South Pier: LTA confirms 2014 extension; exact day located but direct release was not recovered before stop.
- `ewl-joo-koon-tuas-link`: Joo Koon → Tuas Link: LTA current EWL page confirms June 2017. Original 27 April 2017 release URL returns 404; exact day not verified from available primary text.
- `pglrt-oasis`: Oasis → Oasis: Archived SBS opening release found; no readable body recovered before stop.
- `pglrt-damai`: Damai → Damai: Original SBS 17 June 2011 release/poster located; body not recovered before stop.
- `pglrt-punggol-point`: Punggol Point → Punggol Point: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.
- `pglrt-samudera`: Samudera → Samudera: Exact first-passenger-service day not verified in LTA/NLB or primary transcript before required stop.

### Prior research gaps still retained

- `july-2024-syllabus`: The current official MOE syllabus page links a PDF whose cover says January2024. The named July2024 URL is indexed but returned404 in direct download and a bot challenge in web access. July-specific wording and differences remain unverified.
- `syllabus-verbatim-limit`: Full verbatim outcome lists are not reproduced because quotations from one copyrighted source are limited. The inquiry question and two short syllabus extracts are verbatim; remaining outcomes/content are explicitly paraphrased with exact printed-page and PDF-page locators. The downloaded official PDF is retained in sources/moe-jan2024.pdf.
- `observed-historical-polygons`: No complete licence-cleared observed land-use polygon series for1950s–1980s was verified. Master Plans are planning snapshots; archive access and academic publication do not establish open rights.
- `reclamation-decades`: Published maps support selected dates/areas, not a complete verified decade-by-decade reclamation dataset. Glaser1991 full map pages were not accessible. Wong1992 is identified via Hesp1995; original chapter not inspected.
- `farm-boundaries`: No open whole-island1960s kampong-farm boundary dataset was verified. The1986 government annexes locate agricultural land and proposed estate uses; their map reuse licence remains unverified.
- `farm-statistics`: Historical farm area figures use rounded decades and different definitions. The2000 FAO value cites unrecovered AVA2004 statistics. Current food-farm licence counts exclude some non-food farming; no fully harmonised annual farm-area series was verified.
- `reservoir-inventory`: Reservoir milestones here are selected verified examples, not a complete17-reservoir commissioning register. Western reservoir dates and earlier extension footprints need further primary-source checks. Current polygons must not be back-projected unchanged.
- `mrt-segment-register`: First services and selected opening stages are verified; a complete station-to-station opening register including every extension to2026 is not assembled. A first line-opening date cannot activate all later segments.
- `town-completion`: A whole new town does not have one defensible completion year. Use documented planning, first blocks, keys and project-completion events; current HDB stock also omits demolished buildings.

Derived-data facts remain uncomputed: distinct LU_DESC values/areas and unmatched classifications; all category area shares; MP2003/2019 agriculture comparison; HDB join counts/rates by town and floor-height medians; coast scene/tide/cloud selection, deviations and piece matches. They are not verified statistics. Reservoirs, dates, ids, geometry and glossary definition have not yet been copied, so cross-topic equality is not claimed.

## Licences not independently confirmed / unresolved rights

- **G1:** existing E143 and successful Commons imageinfo provide public-domain evidence; this run did not retrieve the complete PD-UKGov template text or original image. No tracing performed.
- **G2–G5 SODL:** catalogue/licence wording was inherited from E129–E136 and recorded as such in receipts. Successful download does not itself re-verify the full legal text. No geometry published in this run.
- **G6 post2019 line geometry:** an official downloadable source and its particular licence were not obtained. No later route was drawn from memory.
- **G7/G8/G12:** existing catalogue SODL evidence retained; these dataset downloads failed429. No independent refreshed licence-page/full-data review claimed.
- **G9:** USGS public-domain rights confirmed from its restriction/cloud FAQs; account restrictions are a separate access issue. Microsoft preview/SAS terms were readable via indexed text and documented with short excerpts and links; no tokens were retained. No USGS/AWS/Google account agreement was entered.
- **G10/G11:** upstream SODL/ODbL and historical-map provenance remain as published; no altered licence or new copy was issued here. OSM derivative database portions require ODbL attribution/terms when copied.
- **Look-only, no open reuse assumed:** NAS historical maps; SLA/NUS1953/1966/1975 mosaics; Glaser1991; Hesp1995/Wong1992 figures; SFA annex/farm/tender maps;1986 map annexes; Commons HDB annual-report CC0 claims;1958 Queenstown map CC-BY-SA claim;1951 city-map worldwide public-domain status. Existing research records the specific cautions. None was traced, published or treated as a rights-cleared substitute.

## Validation and scope verification

Ran **`pnpm validate`**, exit1:

```text
error src/content/topics/singapore-land-use/topic.yaml  (root): Unrecognized key(s) in object: 'datedLayers'
validate-content: 38 topic(s), 1 error(s), 0 warning(s)
```

This is the expected engine-schema gap on this checkout. **The topic schema failure prevents downstream asset checks; the one-error result is not evidence that missing assets or unfinished content pass validation.** No `milestone` events were authored, so no milestone error was emitted. Empty-frame future-engine behaviour was not exercised beyond the empty scaffold.

All three supplementary JSON ledgers parse and their nested quotation fields contain no excerpt over25 words. No application build, check/test suite, e2e, shoot, image processing or commit was run. Final `git status` shows only the two permitted new topic directories for this work, plus the unrelated untracked documents noted above. No public geometry/screenshots were created.

## Second pass — 20 October 2026

Anonymous MPC SAS access resolved the Landsat gate. The draft data and chapters are built. **Geographic acceptance is incomplete:** K1 lacks independent ground controls and the full-resolution source; coast p95 targets, tide matching and complete engineering-project matches remain unresolved. Passing software gates does not waive these requirements.

### Counts

- Eight coast eras, a mask and today's reference coast; four control frames with 3 / 0 / 0 / 7 features; eight fixed-colour entities.
- 10,644 HDB points from 10,817 residential rows: 98.401% matched, 121 ambiguous and 52 unmatched omitted. No OneMap. Per-town counts are in dated-layers-report.md. The 26 blocks dated 2026 remain outside the 1959–2025 playback.
- Dated areas: two industrial areas, one supported western farmland group, four reserves and 18 canonical reservoirs.
- 37 rail segments, 2,594 vertices; 58 events; 111 sources; 14 glossary terms; seven English chapter drafts, 33 beats and six presets. Chinese uses 【待译】 except required canonical copies.
- Existing cover and four chapter figures reused. Twenty layer plates, two control plates, eight coast plates and a rail overview are retained in the ignored screenshot directory.

### Sources, licences and method

URA/HDB/NParks/statistics use SODL 1.0. BIS 1959 is PD-UKGov; Landsat is USGS public domain. G11's inherited historical estimates retain their rejected-draft status. Reservoir name matching and Linggiu use © OpenStreetMap contributors, ODbL 1.0. Railway geometry is OSM-free. No NAS/SLA/NUS/journal/SFA map artwork was traced. Original research was recovered read-only from main and preserved with an evidence crosswalk. Exact receipts, hashes and chronology citations are in SOURCES-GEO.md, fetch-receipts.json and the layer/rail audits.

| Era | Scene ID (STAC item) | Date | Scene / island QA cloud % | Bands and index | Otsu threshold |
|---|---|---|---:|---|---:|
| L6 | `LM01_L1TP_134059_19731017_02_T2` | 1973-10-17 | 2.00 / 1.47 | B4/B7 TOA reflectance; NDWI | 0.01465815 |
| L7 | `LM02_L1TP_134059_19791031_02_T2` | 1979-10-31 | 20.00 / 7.01 | B4/B7 TOA reflectance; NDWI | 0.17528600 |
| L8 | `LT05_L2SP_125059_19910428_02_T1` | 1991-04-28 | 11.00 / 4.07 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.22265625 |
| L9 | `LE07_L2SP_125059_20021011_02_T1` | 2002-10-11 | 54.00 / 4.80 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.12157136 |
| L10 | `LT05_L2SP_125059_20110214_02_T1` | 2011-02-14 | 26.00 / 22.55 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.16941148 |


MSS uses calibrated B4/B7 NDWI; TM/ETM+ uses SR_B2/SR_B5 MNDWI. Otsu thresholds use a 2 km outer-coast belt, followed by one-pixel closing, two-pixel uncertainty buffers and a 0.1 km² piece filter. Cloud pixels conservatively retain today's land status. Plus is constrained to G11 L5 to exclude foreign land; zero qualifying plus pieces remain. Low-QA but visibly hazy 1992/2009 scenes were rejected. Tide matching is unverified.

### Coast statistics and K1

| Era | Acquisition / reference | Published land km² | Difference to L11 km² | Diagnostic p50 / p95 m | Samples |
|---|---|---:|---:|---:|---:|
| L4 | Inherited G11 approximate outline | 536.397 | -219.514 | Not requalified | — |
| L5 | Inherited G11 approximate outline | 521.855 | -234.057 | Not requalified | — |
| L6 | 1973-10-17 | 599.991 | -155.920 | 42.47 / 168.94 | 435 |
| L7 | 1979-10-31 | 629.848 | -126.063 | 47.60 / 214.38 | 477 |
| L8 | 1991-04-28 | 645.415 | -110.496 | 24.20 / 157.58 | 412 |
| L9 | 2002-10-11 | 704.788 | -51.123 | 19.19 / 113.64 | 422 |
| L10 | 2011-02-14 | 727.444 | -28.467 | 26.53 / 266.04 | 392 |
| L11 | URA MP2019 outline, from 2019-11-18 | 755.911 | 0.000 | Reference only | — |


All p95 values exceed the brief's sensor-specific targets. The unchanged-coast selector itself uses rejected G11 L5 as a provisional check. National statistical areas and planning-outline areas are different measures. Every retained minus piece, candidate project correspondence and unmatched result is listed in SOURCES-GEO.md. The Admiralty chart check is qualitative; TPC 1984 was not newly fetched.

K1 uses a 1920 px Commons preview and 16 correlated graticule constructions. Internal RMS/max are 20.17/40.12 m; leave-one-out RMS/max are 37.49/68.80 m. **These do not satisfy 16 independent geographic controls or certify external accuracy.** Source-pixel City/Naval Base traces are approximate. Intermediate whole-island land-use frames are empty.

### Budgets

| File | Bytes | gzip -9 bytes | Budget |
|---|---:|---:|---|
| `control.json` | 1,029,411 | 319,960 | 1.2 MiB raw |
| `land-sg-modern.json` | 250,603 | 74,604 | 250 KiB raw |
| `sg-hdb-blocks.json` | 806,969 | 85,478 | 300 KB gzip |
| `sg-estates.json` | 36,910 | 14,628 | 400 KB raw, all four area files combined |
| `sg-farm-parks.json` | 7,483 | 3,451 | 400 KB raw, all four area files combined |
| `sg-reserves.json` | 8,430 | 3,617 | 400 KB raw, all four area files combined |
| `sg-reservoirs.json` | 52,754 | 14,144 | 400 KB raw, all four area files combined |


Coast display packing uses DP 90 m and quantisation 10000, approximately 5.37 × 3.38 m cells. This is a disclosed size tradeoff and does not meet the tighter geographic accuracy specification. K4 uses 10 m DP and quantisation 50000; HDB uses 100000. Topic-local adapters handle packing and empty frames. Engine, shared pipeline, package files and other topics remain unchanged.

### Gates and visual review

Final results are recorded in gates.json and appended below after integration. Earlier temporary failures are distinguished from remaining geographic accuracy gaps.

### Unverifiable facts and remaining acceptance work

- K1 full-resolution image and 16 independent geographic controls; externally established residuals.
- Coast p95 accuracy, tide levels and complete dated engineering-footprint matches. Lost islands absent from G11 L5 are not recovered; inherited L4/L5 remain rejected estimates.
- TPC 1984 comparison. Admiralty checks are qualitative; publication dates are not equivalent to survey dates.
- Exact Tuas/Woodlands estate openings; separate historical boundaries and opening dates of the six farm parks. One supported western farmland group is not a reconstruction of six parks.
- July 2024 syllabus differences; original Loh book pages on fire-cause accounts; HDB's exact founding-day office; precise current State-land share; Jurong West's first development; historical Chinese farm-park names; exact indoor-farm point; affected farmers' responses to 2026 proposals; causal claims about particular sand shipments. Unsupported exact claims are not asserted.
- Woodlands and Marina South Pier first-service days retain month precision. Operator/MOT/NAS date sources are a disclosed exception to the preferred LTA/NLB register. Closed spurs and unverified historical realignments are omitted.
- Existing approved illustration assets were reused rather than regenerated.

Status remains draft. No push.

### Final integration gate results

- `pnpm validate`: exit 0, 39 topics, **0 errors / 0 warnings**.
- `pnpm check`: exit 0, **0 errors / 0 warnings**. Eleven hints: three pre-existing unused variables and eight from ignored matplotlib JavaScript dependencies.
- `pnpm vitest run tests/geo-rings.test.ts`: exit 0, **8 / 8 tests passed**, including the added topic slug.
- `pnpm build`: exit 0, **81 pages**.
- `pnpm shoot singapore-land-use --beats`: exit 0, **33 / 33 EN paper beats**, clean console, zero beat failures. A nonfatal background default-view leader-label notice is retained in gates.json; relevant beat views were inspected.
- Final dated-layer checks: zero invalid/empty geometries, zero bad date intervals, all 10,644 HDB points inside current land. Final coast packing retains all eight eras, with 965 rings and zero zero-area/self-crossing rings. Control ring checks also pass after clipping to the final packed L4/L11 outlines.
- Opened source comparisons and rendered background, housing-growth, Jurong and MP2019 beat PNGs. Source reviews and all 33 final beat images were copied under `docs/screenshots/singapore-land-use/`, which remains gitignored.

These results validate the implementation and schema. They do not change the explicitly incomplete geographic acceptance status above. No engine code, shared pipeline, package file or other topic was edited. No push.
