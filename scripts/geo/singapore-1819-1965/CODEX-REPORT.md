# Singapore, 1819–1965 — Codex handoff

> The original handoff below is the first-pass record. The **Second pass** section at the end supersedes its pipeline, coast size/areas, border-completion and unresolved-anchor counts. Historical accuracy remains unaccepted.

Research, English chapter drafts, data and provisional geographic assets are written. **Geographic acceptance is incomplete.** The topic remains `status: draft`; valid schemas and ring checks do not make the historical maps ready for release.

## Counts and verification

| Artifact | Count |
|---|---:|
| Dated coast eras | 6 |
| Control keyframes | 23 |
| Control features across all frames | 160 |
| Entities | 31 |
| Events | 122 |
| Routes | 18 |
| Numbered sources | 173 |
| Glossary terms | 16 |
| Chapters, including background | 12 |
| Presets | 6 |
| Basemap features | 7: one mask and six dated land features |
| Downloaded/hashed requested records | 29: 26 Commons originals plus G21, G22 and G30 |

All 83 pending specification markers are mapped to research checks. The census tables cover 1824, 1871, 1931 and 1957, retaining both 1957 published returns. There are ten casualty rows, nine June 1959 Cabinet members, ten August 1965 Cabinet members, and eleven street-name rows. The source catalog records exactly what was read; indexed passages, inherited citations and unread originals are distinguished. Tables are in RESEARCH.md and research/tables.json.

The 12 English bodies contain 245–270 words, four paragraphs and 3–4 More blocks each. All 16 glossary terms are used. Chinese draft fields are prefixed 【待译】, with original inherited WW2 source text preserved. Six requested figure references resolve to assets supplied by the main session.

Nineteen events and three movements remain exact WW2 copies. All six hold pairs are exact geometry/label copies: **K4←K3, K7←K6b, K10←K9, K14←K13, K16←K15a, K18←K17**. K3/K4 use a generic settlement label to satisfy the exact-hold instruction; the Company/Crown distinction is explained in prose.

Control: **951,697 bytes**, 1,655 rings, zero-area **0**, self-crossing **0**; below 1 MB. Eight sub-resolution rings under 1e-10 square degrees (about 1.24 m² here) were removed after numerical clipping/quantization; no geographic boundary was drawn to repair them. Gap filling is disabled, and Singapore is re-clipped after cleanup. The largest measured final quantization fringe is **0.0377 m** beyond the dated coast; its aggregate area is reported per frame in final-audit.json rather than called zero.

Coast: **237,418 bytes**, 39 rings, zero-area **0**, self-crossing **0**. **The 200 KiB / 204,800-byte coast budget fails.** The optional current-coast line is omitted. Lower-precision candidates were rejected: one introduced crossings; repairing it moved narrow shoreline fingers by up to 42.53 m. The retained asset preserves the measured geometry.

`colour-holders.ts --write` completed with no unresolved colour conflicts. K2 and K19 were composed and compared first; all 23 standalone keyframe source comparisons, six coast comparisons and a contact sheet were generated and inspected. These are review images, not acceptance or application screenshots.

## Map residuals

All numbers below are metres. LOO means leave-one-out; raster fit residuals are not shoreline-identification accuracy.

| Map | CP | Model | Fit RMS / max | LOO RMS / max | Status |
|---|---:|---|---:|---:|---|
| G1 | 12 | laea(103.9,1.3)+affine | 42.22 / 87.43 | 58.39 / 113.58 | Town numeric budget met; proposed junction continuity remains unverified. |
| G2 | 4 | equirectangular+affine | 2287.25 / 2799.99 | not measurable / not measurable | Only four whole-island diagnostic CPs; rejected and unused. |
| G4 | 12 | mercator+affine | 44.39 / 75.78 | 60.16 / 103.47 | LOO RMS slightly exceeds the 60 m town budget. |
| G7 | 12 | mercator+affine | 24.02 / 49.94 | 32.77 / 63.31 | Town numeric maximum met; source-date and extent gaps remain. |
| G9 | 16 | mercator+affine | 189.70 / 359.50 | 232.84 / 440.71 | Whole-island budget failed. |
| G11 | 16 | mercator+affine | 145.59 / 290.67 | 177.64 / 353.96 | 30/60 m budget failed. |
| G16 | 16 | equirectangular+affine | 139.15 / 386.61 | 160.24 / 425.96 | 30/60 m budget failed; 16 nominal CPs include nine unnamed external controls. |
| G23 | 12 | mercator+affine | 1801.42 / 2813.53 | 2447.51 / 4829.04 | Regional named-town comparison only, not surveyed-junction accuracy. |

RMS/max **not measured** for G3, G5, G6, G8, G10, G12, G13, G14, G15, G17, G18, G19, G20, G24, G25, G26, G27 and G29. They are downloaded sources/comparisons, not completed reconstruction inputs. Raster residual is not applicable to vector G21/G22/G30. G23 uses twelve independently read town-symbol anchors; its earlier printed-graticule diagnostic is not external accuracy.

Recorded ink shares: G1 town waterfront 96%/100%; G4 100%/97%; G7 93%; G9 four parts 94%/95%/94%/95%; G11 87%; G16 78%. Jackson division segments range from 90% to 100%. A river-bank trial with high ink agreement was rejected because visual inspection showed adjacent street ink; the rejected diagnostic never entered the final coast.

## Era geometry and unfinished geography

| Era | Area km² | Difference from URA baseline km² |
|---|---:|---:|
| L0 | 521.863679 | 266.572377 |
| L1 | 522.345045 | 266.091011 |
| L2 | 522.257825 | 266.178232 |
| L3 | 523.136688 | 265.299368 |
| L4 | 554.030754 | 234.405303 |
| L5 | 552.652337 | 235.783720 |

The URA geometric baseline is 788.436057 km², not an official contemporary land-area statistic. Differences include omitted islands, source age, water and registration gaps: **they are not reclamation measurements**. The non-monotonic L1/L2 and L4/L5 areas are unresolved source/fit differences, not evidence of historical land loss.

All six eras are explicitly marked approximate/rejected for historical accuracy. Outstanding map work:

- G5 is the eastern strait sheet and does not cover main Singapore. G6 is a small proposed office layout, not the described whole-town plan. G1 is monochrome and proposed, with no colour legend; interpreted printed divisions are recorded in jackson-legend.json.
- L0 uses an 1822 proposed waterfront as a backcast to 1819; L1 uses 1839, L2 uses 1893 for an 1887 epoch. G9 later-map substitution outside early town coverage is explicit.
- G9/G11/G16 fail residual targets; some candidate cape/street identities and nine G16 external CP identities remain unqualified. G11/G16 ink shares also fail the shoreline target. G14/G15 Jurong and western 1961 reconstruction is not completed; G16 corrections stop in 1954.
- Detached historical islands and historical land now gone are omitted. No modern detached-island fallback remains in historical features. G1/G4 river banks, parts of the west docks and later estuaries remain untraced.
- Dindings has no qualified boundary trace: it is excluded from the draft recipe and the affected FMS feature expressly labels the unresolved modern extent. No box or invented polygon substitutes for it.
- G23 comparison exposes substantial historic state-border differences, but the requested >10 km correction traces are unfinished. Modern 1896 Sarawak still includes Lawas and is labelled approximate; Limbang belongs in 1896 after its 1890 annexation, while Lawas needs exclusion until 1905. G23 contains no Borneo evidence.
- The 92 unresolved new event anchors below still need source-backed positions. Eleven other anchors are sourced current reference points, not exact historical footprints; all 103 new historical anchors remain approximate.

Topic-local coasts.ts implements `pipeline.localLand.eras`; simplify.ts implements `coast.excludeBox` and separate regional/local tolerances without shared edits. Data uses the requested dated `kind: land`, `from`/`to`, `basemap.local` and `TopicLink ch` names. The current engine still needs dated-land display filtering and chapter-aware TopicLink support; the current component ignores `ch`. Optional `kind: coast-today` is not present. These do not currently produce validation errors.

## Unconfirmed licences

- **G19:** Shell Road Map of Malaya 1951 / Survey Department No. 88-1951; uploader's Malaysian copyright-duration claim and PD-old-70 tag do not establish original Singapore rights. Cross-check only.
- **G20:** modern repaired/assembled scan with both self CC BY-SA 4.0 and PD-UKGov; original agency/edition unidentified. Cross-check only.
- **G27:** Time / Robert M. Chapin, 12 April 1963; PD-US-not renewed tag not independently established by a renewal search. Cross-check only.

G16's printed 1954 small-corrections year is visually confirmed. No uncertain-rights source supplies published geometry. Optional G28/CShapes and G31/CORONA were not used; CORONA Singapore coverage and its original terms were not independently checked. No NAS original image reproduction rights are asserted. SODL attribution for URA/OneMap and CC0/public-domain attribution for Wikidata/Natural Earth are retained in sources and map provenance. OSM coordinates are registration controls only, with no OSM geometry introduced into published files.

## Remaining fact qualifications

The following research entries retain an unresolved detail, disagreement, unread original or interpretive limit. Each may also contain confirmed information; the stated limitation is what remains open. Full exact URLs/pages, read extents and short quotations are in RESEARCH.md and research/evidence.json.

| Fact / check | Remaining finding and scope |
|---|---|
| K11-borneo (corrected) | British Borneo formally transferred to SEAC on 10 January 1946; exact local return of control dates remain unresolved. |
| F1 (partly-confirmed) | Rockhill pp. 129–133 offers competing identifications for Lung-ya-men and Pan-tsu. Miksic 2013 chapter 4, Pires and the Nagarakretagama original passages were not read; precise modern locations remain unverified. The inspected Leyden passage has no Gregorian 1299; the origin of that later chronology was not established. |
| F2 (partly-confirmed) | The original field report and complete assemblage remain unread. |
| F3 (confirmed) | Exact landing spot and first person ashore remain disputed. |
| F4 (unverifiable) | These are estimates with differing geographical scopes, not a census. |
| F5 (corrected) | The Anglo-Dutch original treaty was not independently inspected. |
| F6 (partly-confirmed) | The securely established date 27 November 1826 is the Second Charter of Justice; the exact administrative foundation day remains unverified. |
| F8 (corrected) | NLB accounts disagree between 18 and 25 April. Ending transportation in 1860/1867 differs from the final convicts departing in May 1873. Annual totals remain unverified. |
| F9 (partly-confirmed) | The Protectorate, Pickering and credit system abuses are confirmed for 1877; exact 1 May is unsupported by the read article. Earlier annual totals, mortality rates remain unverified. Indian immigration legislation is now distinguished as 1876 enactment, Singapore operation from 1883 and replacement in 1884 at secondary legal-history level; original instruments remain unread. |
| F10 (partly-confirmed) | A uniform 40–50% claim and exact legal commencement of the 1910 monopoly/1946 ban still need original ordinances or Blue Books. |
| F11 (conflicting) | Exact end date 16 May remains unverified. |
| F12 (conflicting) | NLB 2020 gives 44 killed and more than 47 executed; the spec’s 47 killed is not confirmed. Harper/Miller and Kuwajima originals were not read. |
| F14 (confirmed) | A complete death count by community was not obtained. |
| F15 (corrected) | Who shot the student remains unresolved. |
| F16 (partly-confirmed) | The spec’s exact 24–29 October interval and victim identities remain unverified. |
| F18 (confirmed-rounded) | The content agent found a primary Order Paper giving 144,077 blank and 2,370 uncertain papers, differing from the private compilation’s 2,523 uncertain. |
| F19 (conflicting) | Exact scopes for 113 and 111 remain unverified. Government security allegations and Poh/Thum’s political repression interpretation are attributed accounts. |
| F20 (partly-confirmed) | The precise causal chronology of the UN survey and the original Philippine claim documents remain unverified. |
| F21 (corrected) | The 12 death alternative remains unverified. |
| F22 (confirmed) | The 1968 executions and Indonesian honours require separate attribution. |
| background-regalia (unverifiable) | Trocki 1979 and Andaya 2017 passages were not obtained. Borschberg’s original passage for destruction in 1613 was not read. |
| background-site-coordinates (partly-confirmed-with-coordinate-gaps) | All proposed exact coordinates, the Stone position and competing Longyamen sites remain unverified. |
| ch01-hussein (conflicting) | Departure from Riau on 31 January remains unverified. |
| ch01-route (partly-confirmed) | NLB supports Penang departure on 19 January, Karimun rendezvous on 27 January and St John’s arrival on 28 January. Horsburgh describes the straits, but does not prove the 1819 ship’s precise track. |
| ch02-plan-legend (corrected-with-interpretive-gaps) | Government-hill and Sultan-compound extents are interpreted street/plot enclosures, not observed ethnic residence. Historical junction continuity and allocation limits remain review gaps. |
| ch02-streets (partly-confirmed) | Crawford Street spelling and its Crawfurd connection still need direct evidence; Hill Street and Bencoolen Street etymologies were not directly verified. |
| ch03-straits-date (corrected) | 27 November 1826 is the Second Charter date; the administrative formation day remains unverified. |
| ch03-malacca (unverifiable) | An indexed Dutch proclamation dated 9 April 1825 was located in Leupe’s BKI reprint, but the original full passage was not read. |
| ch03-suez-forests (unverifiable) | The precise reduction from three or four months to one month, forest clearance totals and tiger death figures were not verified. |
| ch04-ordinances (partly-resolved-secondary) | Original legislation/commencement still unread. Protectorate establishment is supported in May 1877; exact 1 May remains unsupported. |
| ch06-mutiny-location (unverifiable) | The precise Alexandra barracks and Outram Prison coordinates, 22 February endpoint and 25 March execution occasion were not located in original maps or records. |
| ch06-depression (partly-confirmed) | January versus April commencement in 1933 remains unresolved. |
| ch07-resistance (unverifiable) | Individual resistance biographies were not independently read here; copy only existing ww 2 statements where available. Do not add unsupported details about Force 136, MPAJA or named civilians. |
| ch07-endau (partly-confirmed) | 1943 is supported by the Bahau account, but September, the official foundation on 14 December and a large group on 1 February 1944 have not been reconciled. Use year precision. |
| ch08-locations (partly-confirmed-with-coordinate-gaps) | The Sultan Mosque reference is not proven riot onset. The depot gate and exact historical footprint remain unverified. |
| ch09-marshall (confirmed) | Resignation on 7 June 1956 confirmed; the dispute concerned the proposed joint defence and internal security council’s veto arrangement. |
| ch09-citizenship (partly-confirmed) | The original commencement instrument remains unread. |
| ch10-barisan (corrected) | Registration on 13 or 15 August remains unresolved. |
| ch10-konfrontasi (confirmed) | An attack on 12 April would be a separate military event; that specific day was not independently verified. |
| ch11-harmony (partly-confirmed) | Exact initial committee membership and appointments were not independently checked. |
| F23 (confirmed-with-remaining-interpretive-gaps) | Contemporary Lee and Razak statements, Malaysian diplomatic reporting and Goh’s notes give attributed accounts; the two memoirs were not directly read. |
| ch06-kreta-ayer (partly-confirmed) | Primary Hansard 9 May 1927 quotes the inquest jury: six men died from police gunshots outside Kreta Ayer Police Station. Exact 12 Marchday still needs the original dated account; month precision is secure. The inquest and official description remain attributed. |
| ch11-cabinet (confirmed-contemporary-report) | A later Culture transfer date remains unverified. |
| bibliography-lim-lau (unverifiable) | The spec’s P 34 reference to “Lim & Lau” does not identify the Lim author or title. Do not infer a book. Albert Lau’s listed work remains a bibliographic lead unless the passage was actually read. |
| F7 (conflicting-published-returns) | The 1871 census was on 2 April: 97,111 in Marriott; Saw 2007 gives 96,087, scope unresolved. SIT 1959 instead reports 1,445,930 with small group differences. |
| F17 (partly-confirmed) | The original appointment instrument remains unread. |
| ch05-buildings (partly-confirmed-with-day-and-coordinate-gaps) | Precise coordinates and St Andrew’s details remain unchecked here. |
| ch06-states (partly-confirmed-with-specific-remaining-gaps) | A Perak 1954 enactment confirms Dindings cession in 1935, but 16 February remains unverified. Johor’s 1914 adviser date still needs its instrument. |
| ch07-four-states-raids (partly-confirmed-with-civilian-loss-gap) | Team reading of the indexed US Army 1944 handbook confirms formal transfer of the four states on 18 October 1943 while Japan retained strategic transport facilities; the full scan was not obtained. Its aircraft and warehouse figures are attacker operational assessments; civilian casualties remain unverified. |
| ch08-elections (partly-confirmed) | The exact 20 March 1948 and 2 April 1955 days were not independently verified from an original election writ here; team institutional chronology provides context. |
| ch09-enfranchisement-symbols (partly-confirmed) | The first official use of flag/arms/anthem and Yusof’s 3 December oath still need original instruments or recordings. |
| ch10-august-declaration (partly-confirmed) | The exact constitutional meaning of Lee’s 31 August declaration remains unchecked here. |
| ch09-cabinet-oath (confirmed-archival-and-institutional) | This closes the ceremony day; appointment instrument and oath text remain unread. |
| ch02-sultan-istana (confirmed-institutional-scan) | These are different structures, with no exact construction day asserted. |
| ch02-telok-blangah (confirmed-institutional) | Exact day and original relocation order remain unread. |

Seven published date/meaning warnings remain explicitly in event details:

| Event | Unverified detail |
|---|---|
| site-longyamen | 1349 is a report chronology, not an established foundation date for the disputed modern site. |
| straits-settlements-1826 | Formation year is confirmed; exact administrative foundation day remains unverified. The 27November Charter is a distinct event. |
| site-chinatown | 1823 is a draft date for the plan marker, not a verified beginning of Chinese settlement. |
| site-kampong-glam | 1823 is a draft date for the plan marker, not a verified beginning of the settlement. |
| site-serangoon-road | 1823 is a draft orientation date; the street’s opening or settlement foundation was not independently verified. |
| indian-immigration-ordinance | Original ordinances and G.N. 577 of 28 December 1883 still need inspection; do not assign an exact commencement date from this secondary article. 1876 Protection Ordinance, Singapore operation from 1883 and replacement in 1884 are different milestones. |
| bma-1945 | 12 September is the surrender/return chapter anchor. Proclamation signature on 15 August and Gazette reproduction on 1 November are confirmed; the precise assumption-of-control milestone for Singapore remains unverified. |

Unresolved source-backed coordinate audit (92 draft anchors):

`site-fort-canning-temasek`, `site-singapore-stone`, `site-longyamen`, `site-johor-lama`, `site-lingga-daik`, `site-penang`, `site-malacca`, `mahmud-iii-dies`, `raffles-arrives`, `preliminary-agreement-1819`, `hussein-brought-from-riau`, `treaty-1819`, `dutch-protest-1819`, `farquhar-resident`, `site-temenggong-village`, `town-committee-1822`, `boat-quay-fill`, `convention-1823`, `site-telok-blangah`, `site-kampong-glam-istana`, `singapore-institution`, `anglo-dutch-treaty`, `crawfurd-treaty`, `census-1824`, `straits-settlements-1826`, `capital-to-singapore`, `malacca-handover`, `naning-war`, `hong-kong-1841`, `tanjong-pagar-dock`, `crown-colony-1867`, `suez-1869`, `first-amoy-junk`, `convicts-arrive`, `convict-transport-ends`, `chinese-protectorate`, `indian-immigration-ordinance`, `census-1871`, `site-raffles-institution`, `site-chinatown`, `site-kampong-glam`, `site-serangoon-road`, `riots-1854`, `telok-ayer-reclamation`, `post-office-riots-1876`, `pangkor-1874`, `perak-war`, `fms-1896`, `johor-treaty-1885`, `labuan-to-ss`, `anglo-siamese-treaty`, `mutiny-1915`, `mutiny-executions-1915`, `kreta-ayer-1927`, `census-1931`, `dindings-to-perak`, `four-states-to-thailand`, `allied-raids-singapore`, `bahau-settlement`, `endau-settlement`, `bma-1945`, `colony-of-singapore-1946`, `malayan-union`, `umno-founded`, `federation-1948`, `election-1948`, `emergency-1948`, `hertogh-riots`, `election-1955`, `marshall-resigns`, `school-riots-1956`, `merdeka-1957`, `citizenship-1957`, `election-1959`, `self-government-1959`, `first-cabinet-1959`, `yusof-ishak-1959`, `tunku-proposal-1961`, `barisan-sosialis-1961`, `referendum-1962`, `brunei-revolt`, `coldstore-1963`, `malaysia-agreement`, `malaysia-day-1963`, `konfrontasi-begins`, `malaysia-election-1964`, `race-riots-july-1964`, `race-riots-september-1964`, `independence-agreement-1965`, `separation-1965`, `first-cabinet-1965`, `first-president-1965`.

The eleven audited references still do not establish original historical footprints. The first TTSH vicinity and Hock Lee junction are corrected with institutional text plus OneMap evidence. July 1964's Kallang/Kampong Soo Poo onset area is supported in text; its exact marker remains unverified. “Lim & Lau” remains unidentified beyond the Albert Lau lead; the optional clarification question had no reply when this report was written.

The fifteen new active sea corridors are schematic interpretations of Horsburgh, not individual tracks or schedules. The route audit found zero land crossings/samples in sixteen candidates. `steamer-amoy-1900` and `causeway-rail` are withheld pending timetable/map evidence. The Suez route is only the maritime segment south of Suez; no canal geometry was invented. New routes have no unsourced strength.

## Validation, scope and next handoff

`pnpm validate`: **25 topics, 0 errors, 0 warnings**. Log: work/validate-final.log. No engine-field errors are currently reported; engine behavior described above remains pending. No build, project tests, e2e, shoot or commit was run. Figures were not generated by this task.

Only the authorized topic, topic-local geo scripts, public/geo/land-sg-history.json and topic screenshot folder were written. Raw/work entries and research cache ignores are in the topic-local .gitignore. Other topics, WW2, shared geo code, components, package.json and engines were not edited.

Rebuild commands and the first-pair ordering are in README.md. Do not rerun content-build.ts's publish option over the final incremental source/date/coordinate corrections. Review RESEARCH.md, data/SOURCES.md, SOURCES-GEO.md, content-audit.md and final-audit.json together. Schema success does not clear the unfinished geographic acceptance gates.

## Second pass

18 October 2026. **Shared-pipeline migration, sourced border corrections, all 92 missing positional references, and the requested software gates are complete. Historical coast acceptance is still not complete:** G9/G11/G16 residual/coverage gates and the complete dated 1961 Jurong west are not achieved. The topic stays draft. This section supersedes first-pass metrics above, without claiming those remaining requested accuracy criteria passed.

### Shared pipeline and scripts

- Moved every era’s outline/minus/plus and evidence-map IDs into `sources.json → pipeline.localLand.eras`; evidence IDs are `src`. `coastToday: true` publishes the dashed current coast. Inland river/water exclusions use shared `localLand.water` with URA WATERBODY and the same named-reservoir overlap selection as four-taps. G32 records the URA water attribution; G33 records the OSM selector, whose boundaries are not published.
- `pipeline.focus` is exactly `[{ "box": [103.55,1.15,104.1,1.48], "fineKm": 0.005 }, [99,0,120,8]]`; coast exclusion retained. Regional selectors intersect Johor/Riau/other regional pieces with decoded 10m land **inside** that box, preserving their original selection outside it. This avoids deleting West New Guinea from Indonesia.
- `keyframes.ts` invokes unchanged shared compose and copies holds byte-for-byte. Shared simplify writes the control asset; `finalise-control.ts` only restores approximate provenance metadata and verifies exact holds. It does not modify geometry.
- Removed duplicate `coasts.ts`, topic `simplify.ts`, `coast-eras.json`, `coast-lines.json` and `town-water.ts`. Coast source recipes now live in the normal shared `lines.json`; `coast-inputs.ts` selects the shared line output. `check-coasts.ts` retains only review-image rendering. Removed obsolete ignored work scripts `coast-budget-experiment.ts`, `coast-budget-repair.ts`, `check-runner.ts`, `lines-coast-runner.ts`; the check adapter regenerates its typed disposable runner when needed. The failed `anchor-discovery.py` attempt was also removed.
- Retained topic scripts are typed, with no `ts-nocheck`. No engine/shared pipeline/component/package/other-topic code was edited. Existing unrelated workspace changes were left alone. No build, e2e, shoot or commit ran.

### Control points and fits

Metres throughout. Each before→after row records count, model, fitted RMS/max and leave-one-out RMS/max. Newly reviewed fits use shared `projection: auto`; low residuals never substitute for point identity or shoreline recognition.

| Map | CP before → after | Model before → after | Fit RMS / max before → after | LOO RMS / max before → after |
|---|---:|---|---:|---:|
| G1 | 12 → 12 | LAEA+affine → same | 42.22 / 87.43 → same | 58.39 / 113.58 → same |
| G2 (unused diagnostic) | 4 → 4 | equirectangular+affine → same | 2287.25 / 2799.99 → same | not measurable → same |
| G4 | 12 → 12 | Mercator+affine → same | 44.39 / 75.78 → same | 60.16 / 103.47 → same |
| G7 | 12 → 12 | Mercator+affine → same | 24.02 / 49.94 → same | 32.77 / 63.31 → same |
| G9 | 16 → 18 | Mercator+affine → equirectangular+affine | 189.70 / 359.50 → 69.79 / 153.31 | 232.84 / 440.71 → 107.71 / 243.91 |
| G11 | 16 → 18 | Mercator+affine → equirectangular+affine | 145.59 / 290.67 → 61.91 / 124.73 | 177.64 / 353.96 → 77.78 / 146.13 |
| G15 (internal grid only) | unmeasured → 12 | unmeasured → equirectangular+affine | unmeasured → 3.22 / 4.84 | unmeasured → 4.40 / 7.54 |
| G16 | 16 nominal → 6 named | equirectangular+affine → Mercator+affine | 139.15 / 386.61 → 41.16 / 53.69 | 160.24 / 425.96 → 152.53 / 289.29 |
| G23 | 12 → 12 | Mercator+affine → same | 1801.42 / 2813.53 → same | 2447.51 / 4829.04 → same |
| G34 (internal grid only) | unmeasured → 8 | unmeasured → Mercator+affine | unmeasured → 229.33 / 333.49 | unmeasured → 381.09 / 697.20 |

G9/G11 now use independently reread surviving town junctions and selected rocky cape tips. Generic summit/name points and soft mangrove capes without demonstrated continuity were removed. G16’s nine anonymous external controls and ambiguous hill/name controls were removed; Sultan Shoal, Raffles and Horsburgh original lighthouse stars use official MPA positions, plus three approximate rocky tips. Six qualified points fail the required whole-map count; they are not padded to sixteen. Church/temple candidates that lacked a clear original symbol or trustworthy coordinate semantics were withheld. G9/G11 still fail strict whole-island residuals, and G16 still fails LOO/count/coverage. G11/G16/G15 source-ink recognition also remains below acceptance. G15/G34 printed-grid fits are **internal registration only**, with external datum/map accuracy unmeasured. Full receipts and rejected candidates: [SECOND-PASS-COAST.md](SECOND-PASS-COAST.md), `georef-G16-lighthouse-candidates.json`, `georef-fixed-buildings-candidates.json`, and [SECOND-PASS-BORDERS.md](SECOND-PASS-BORDERS.md).

### Coast areas, river and western method

Decoded published land area, local planar diagnostic at 1.35° N; km². All eras use the URA inland-water exclusions, and omit untraced detached historical islands/historical land now gone. These numbers describe geometry, not official area statistics or measured reclamation.

| Era | First pass → second pass km² | Method and source date |
|---|---:|---|
| L0 | 521.863679 → 509.009381 | URA land ∩ G9 outline, minus G1 town waterfront and source-pixel river water; 1822 proposed-plan backcast. |
| L1 | 522.345045 → 509.485563 | URA land ∩ G9 outline, minus G4 town waterfront and source-pixel river water; 1839 source substituted for 1823. |
| L2 | 522.257825 → 509.517905 | URA land ∩ G9 outline, minus G7 waterfront/river water; 1893 source substituted for 1887. |
| L3 | 523.136688 → 510.474163 | URA land ∩ G9 outline (1911 survey / 1912 edition / 1916 revision). |
| L4 | 554.030754 → 540.030076 | URA land ∩ G11 outline (1937 revision / 1941 War Office / 1944 reproduction). |
| L5 | 552.652337 → 525.290116 | URA land ∩ G16 outline with G15 western Tuas/Pasir Laba splice. G16 corrected through 1954; G15 1960–61 survey with later corrections; incomplete eastern Jurong. |

The L1→L2 non-monotonicity is **fixed** after extending the source-pixel river trace: 5 m scanline integration measures 0.3525 km² in L1-only and 0.3849 km² in L2-only, net **+0.0323 km²** into L2. The changes are localized to dated town/river masks and registration. L4→L5 still has 18.5185 km² in L4-only versus 3.7800 km² in L5-only, net −14.7385 km². Most loss is in western Tuas/Pasir Laba: G15 follows an inner mangrove/high-water edge where G11’s outer shoreline and unsupported western extrapolation differ by roughly 0.5–1 km. The water/land side of the splice was independently checked. Different shoreline conventions, source age and registration prevent interpreting the decline as historical land loss. No geographic area was fabricated to force monotonicity. `era-audit.json` retains changed cells and independent 5 m scanline measurements; its spherical absolute areas differ slightly from the planar table by definition.

G15’s original is licensed PD-UKGov and has a 1960–61 underlying survey, but later corrected additions. Only the qualified natural western coast is spliced, west of 103.691 E; its box is a data selection seam, not a historical coast. G14/eastern Jurong/Pandan and individually dated post-1961 reclamation exclusions are **not complete**. This does not satisfy the full requested L5-west acceptance alternative. See `work/west-coast-method.json` and the detailed coast report.

The monochrome river colour-following trial was rejected because streets/letters attracted paths despite high ink percentages. `river-bank-inputs.ts` instead preserves inspected G1/G4 source-pixel banks and transforms them with shared auto fits. G1 now follows the printed upstream channel to its source frame; G4 extends upstream of the bridge to a clearly printed upper cross-section. Native overlays were inspected; G1’s white Battery headland remains outside the water mask (the printed word extends into water). G7 supplies L2’s own source-coloured river mask. Elgin and Boat Quay samples are water in published L1/L2. The original Read sample was misplaced by about 250 m; the corrected bridge reference is water in L2, while raw G4 water versus published L1 land at this near-bank point remains a registration/simplification diagnostic disagreement, not a forced GPS correction. Modern point samples are diagnostic only; source-map positional uncertainty and bridge symbols must not be forced to current coordinates. Final river review and geometry measurements are retained in `era-audit.json` and SECOND-PASS-COAST.md.

### Borders

G23’s actual native-pixel Dindings inland boundary and Pangkor/Pangkor Laut coastlines are traced, never a box or invented geographic polygon. FMS excludes Dindings through K6a; K6b restores it after 1935. The source-derived output before shared regional coast surgery is 428.849815 km²; Natural Earth mainland intersection is 406.686924 km². **Final shared clipping removes Pangkor/Pangkor Laut because those islands are missing from its regional land asset.** Their qualified traces remain durable; published Dindings is a regional mainland approximation, not a complete island-level footprint.

G23 traces correct the rendered >10 km differences at Perak/Reman, complete Kelantan frontier (including present-day Thai territory), Pahang–Terengganu and Johor north. Shared frontier paths are reused by adjoining holders. Internal FMS state lines dissolve into one holder and do not render. Source-age and kilometre-scale regional registration remain approximate.

Sarawak K5 now retains 1885 Trusan and 1890 Limbang, excluding the 1,403.500108 km² sourced Lawas piece until 1905 and assigning it to Brunei in 1896. G34’s public-domain Stanford 1903 original supplies that western Lawas line; its 1903 Company ownership is not backdated. K6 restores full Sarawak. Eleven border outputs have zero zero-area/self-crossing rings. Seven native-source border review plates are regenerated and inspected. Source URLs, hashes, controls, line vertices and source-year caveats are in SECOND-PASS-BORDERS.md and `border-audit.json`.

### Event positions and content scope

**92 / 92 previously unresolved reference positions resolved; 0 missing positional references remain.** The 11 previously sourced references remain, for 103 source-backed approximate references. Exact historical footprints claimed: **0**. All original approximate cautions are preserved as explicit placement/source notes. Each Wikidata position records the item ID, property, revision and raw receipt/hash; OneMap attribution remains where used. District/city references explicitly say which documented centre is used and do not pretend to locate a room, polling station or entire incident footprint.

Examples corrected during review: Sungai Siput for the Emergency trigger; Stadium Merdeka for the 1957/1963 proclamations; The Adelphi’s documented current lot for Tunku’s 1961 speech; Penyengat for Hussein’s Riau locality; former Raffles Institution’s documented town lot rather than modern Bishan. September 1964 now uses NHB’s documented Geylang Serai Market locality reference, Wikidata Q107803916, rather than mislabelling broader Geylang Q525295 as Serai’s centre; it explicitly does not locate the former Changi Market killing site. City Hall/Parliament notes distinguish proclamation/office/statutory references from invented oath/broadcast venues. Raffles’ landing reference distinguishes the modern commemorative point from the fleet’s first St John’s stop.

`anchor-second-pass.json` is the 92-event review ledger; `anchor-geylang-correction.json` records the final correction. Event changes are positions and anchor source notes/citations only, apart from removing an obsolete source-note phrase in the Malaysia Agreement summary. Chapter prose is untouched. All 19 inherited WW2 events and 3 movements remain byte-equivalent JSON objects. Numbered sources: 173 → 243.

### Exports and gates

Final artifacts: coast **193,916 bytes (189.37 KiB)**, below 204,800 bytes; six dated land features, one mask, one dashed current-coast feature. Shared DP is 25 m (a 15 m trial exceeded the budget); coast rings **393**, zero-area **0**, self-crossing **0**. Topology has **2,753 arcs**, **1,233** used by multiple features and **1,089** shared between eras: common shoreline is stored once. Inland water is a modern URA exclusion, not a newly claimed historical survey.

Control **526,264 bytes**, **23 frames / 163 features**, **1,960 rings**, zero-area **0**, self-crossing **0**. Shared simplify selected 1 km regional / fixed 5 m Singapore / 5 km elsewhere with quantization 10,000,000. Six exact hold pairs verified after metadata restoration. All 19 WW2 events and 3 routes compare unchanged.

| Gate | Result |
|---|---|
| Shared local-land, all compose frames, shared simplify | completed; budgets and rings above |
| `colour-holders.ts --write` | completed; 28 holder colours assigned, no neighbouring token collision |
| `sources-md.ts singapore-1819-1965` | completed; 243 numbered sources |
| `pnpm validate` | **27 topics, 0 errors, 0 warnings** |
| `pnpm check` | **497 files, 0 errors, 0 warnings**, four unrelated hints; zero errors in every remaining topic TS file |
| `pnpm vitest run tests/geo-rings.test.ts` | **7 tests passed**, including added Singapore slug |
| Native border ring audit | all 11 outputs: 0 zero-area / self-crossing |
| Independent 5 m fringe audit | **fails**, maximum **11.8168 m** outward published edge-sample distance; retained in `final-audit.json` and exit status 1 |
| Historical coast acceptance | **fails** for G9/G11/G16 residual/coverage and complete dated 1961 Jurong, as specified above |

The fringe audit uses independent odd-even land membership and indexed edge distances on decoded control vertices/midpoints. A geographic erase diagnostic was found to produce coincident-water-boundary artifacts, so its area is labelled diagnostic rather than treated as land overshoot. The measured 11.82 m edge result remains a real failed local threshold. Shared simplify includes 0.0001° intermediate output rounding as well as 5 m simplification; no local geometry repair conceals this, and the user’s scope excludes shared-pipeline changes. Source-map accuracy errors are separate and much larger. The shared current-coast deviation log includes a 1,875 m maximum across all original outline samples; omitted small components/inland rings must not be presented as an accepted shoreline error bound.

Regenerated reviews: all **23** keyframe side-by-side plates, **7** coast/source plates (including western L5), **7** native border trace plates, contact/comparison sheets, and the two extended river-bank overlays plus west-coast diagnostic in `docs/screenshots/singapore-1819-1965/`. The renderer is standalone, not an application build/shoot. Source plates and representative final frames were visually inspected; the images explicitly retain draft/failed-accuracy captions.

Logs: `work/local-land-final.log`, `compose-final.log`, `simplify-final.log`, `colour-final.log`, `validate-final.log`, `check-second-pass-final.log`, `ring-test-final.log`, `audit-final.log`, `check-plates-final.log`, `check-coasts-final.log`. `final-audit.json` and `era-audit.json` retain the final machine-readable measurements. Historical acceptance is not inferred from passing software checks.
