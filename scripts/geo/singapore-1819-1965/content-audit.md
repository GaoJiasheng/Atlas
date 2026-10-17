# Content draft audit — Singapore, 1819–1965

Final content handoff: 17 October 2026. Maps, georeferencing residuals, control-feature counts and global completion are the parent agent’s responsibility. This report does not claim the whole user brief is complete.

| Output | Count |
|---|---:|
| Chapters, including background | 12 |
| Entities | 31 |
| Events | 122 |
| Movements | 18 |
| Sources | 173 |
| Glossary terms | 16 |
| Presets | 6 |

The English main bodies contain245–270 words, each in four paragraphs with 3–4 More blocks. All 16 glossary terms appear in Term markup. Six figure references use the requested topic filenames; image generation was left to the main session. Chinese author fields and text blocks are marked【待译】; original copied WW2 source text remains unchanged as required.

Nineteen WW2 events and three movements are deep-equal copies. The 28 source texts and URLs needed by the copied events match their WW2 records. All Num references resolve, none cites the approved-spec placeholder, and the stance-word audit found no we/our/enemy or evaluative heroic/brutal/evil/glorious in English prose. Ch07 state.highlight is bukit-chandu and surrender-ford; its regional first beat still highlights the northern campaign.

The latest pnpm validate completed with 1 error and 0 warnings: public/geo/land-sg-history.json was not yet present. Chapters, source references, images and data schemas had no validation errors. No build, tests, e2e, shoot or commit was run. The final source deduplication was additionally checked for resolving Num IDs and exact copied records; the parent should run the final combined validate after map output.

## Evidence limits

Every new event has a read contextual source. Fourteen distinct date/meaning warnings have now been closed with explicitly read primary or institutional evidence; seven remain in the published details. The machine-readable records are content-date-gaps.json and content-date-closures-applied.json. The latter records read extent and scope limitations; a closed year does not imply that the original contemporary instrument was inspected. The 1931 event deliberately retains month precision: the population reference night was 1 April and enumeration was taken on 2 April as at midnight the previous night.

All 103 non-WW2 positions remain approximate as historical anchors. Eleven now use source-backed current reference points: nine Wikidata P625 statements (CC0), the first Tan Tock Seng Hospital vicinity at the SUSS/MSF heritage trail’s 195 Pearl’s Hill Terrace reference (SLA OneMap address response), and Hock Lee’s Dawson–Alexandra junction (official location text plus published SLA OneMap georeferenced tile). The 92 remaining draft anchors still need source-backed coordinates. No exact historical footprint was established. content-anchor-review.json identifies the actively checked entries, rejected candidates, source references and the unreviewed remainder; it does not claim all 103 were independently audited. No OSM geometry was introduced.

The incorrect Pearl’s Hill and Hock Lee draft positions have been replaced with these qualified references. MacDonald House and six standing monuments now use sourced building reference points. Penyengat uses an island point, not a royal-compound footprint; the Causeway uses a current structure point, not a claimed 1924 ceremony or rail alignment. July 1964’s Kallang Road/Kampong Soo Poo onset area is confirmed in the read NLB account, but no exact onset coordinate was obtained. Its old approximate point was retained with the outstanding location gap.

| Event | Unverified date or meaning |
|---|---|
| `site-longyamen` | 1349 is a report chronology, not an established foundation date for the disputed modern site. |
| `straits-settlements-1826` | Formation year is confirmed; exact administrative foundation day remains unverified. The 27November Charter is a distinct event. |
| `site-chinatown` | 1823 is a draft date for the plan marker, not a verified beginning of Chinese settlement. |
| `site-kampong-glam` | 1823 is a draft date for the plan marker, not a verified beginning of the settlement. |
| `site-serangoon-road` | 1823 is a draft orientation date; the street’s opening or settlement foundation was not independently verified. |
| `indian-immigration-ordinance` | Original ordinances and G.N. 577 of 28 December 1883 still need inspection; do not assign an exact commencement date from this secondary article. 1876 Protection Ordinance, Singapore operation from 1883 and replacement in 1884 are different milestones. |
| `bma-1945` | 12 September is the surrender/return chapter anchor. Proclamation signature on 15 August and Gazette reproduction on 1 November are confirmed; the precise assumption-of-control milestone for Singapore remains unverified. |

Other unresolved content evidence is retained in RESEARCH.md and research/coverage.json: competing 1819 population estimates and their scopes; first-convict April arrival day and abolition/last-departure distinction; Indian immigration ordinance; hospital foundation day (25 May versus25 July 1844); competing 1854 death estimates;1915 death/execution scopes;1956 interval and victim identities; original 1959 appointment/oath instrument and symbol instruments (the oath ceremony date and City Hall venue are now institutionally and archivally confirmed); exact Coldstore total scopes; referendum uncertain-ballot discrepancy; the UN survey/Philippine claim originals; precise Endau founding milestones; Allied-air-raid civilian casualties; later Culture-portfolio transfer; some original memoir and resistance-biography passages; historical street-name gaps. The 1957 census retains the distinct SIT and UN published returns rather than inventing a reconciliation. The contemporaneous 10 August 1965 newspaper now confirms the Cabinet announced on 9 August; the parliamentary 126–0–1 vote is primary-confirmed.

Dindings 1954 Gazette and the US Army 1944 Malaya handbook were read as indexed primary text; complete scan retrieval failed. The original Johor 1885 text was not independently transcribed, although the full Royal Council account was read. The Hong Kong 1841 day is from an indexed official yearbook. No extra licence is asserted for reproducing those pages: only sourced factual paraphrase is used. Source read notes distinguish full text, indexed extracts and inherited citations.

## Routes and identifiers

Fifteen active new sea corridors interpret Horsburgh’s public-domain sailing directions, with named straits/capes and offshore waypoints. All 16 candidate corridors pass the Natural Earth land audit (zero shoreline crossings and zero land samples); one candidate is withheld. The checker is content-check-routes.ts, its result content-route-check.json, and the per-route citations are in content-route-sources.md. These are schematic corridors, not exact historical vessel tracks or dated timetables. The 18 published movements include three exact WW2 campaign copies; none of the new routes has unsourced strength.

Withheld: steamer-amoy-1900 (later timetable not established by the earlier guide), and causeway-rail (needs a G11 georeferenced trace). The Suez line represents only the maritime segment south of Suez: no canal geometry or London–Port Said track was invented. Dates for recurring corridors are editorial display windows and documented as such.

The entity holder malayan-union-government resolves the shared namespace while preserving the exact required event id malayan-union. Sources are generated from the research catalog plus content-extra-sources.json; duplicate content-* catalog readings are excluded. content-build.ts stages the original draft. Do not rerun its publish option over the final data: it would drop later source additions and evidence corrections. content-close-evidence.ts records the incremental closure method, and the current content-date-closures-applied.json and content-anchor-review.json are the final evidence ledgers. The parent should rerun sources-md and colour-holders after these additions.
