# Southeast Asia — content fact audit

Audit date: 27 October 2026. Scope of this draft: the bilingual chapter text, More blocks, figures as described in text, captions and chapter targets. The parent build owns geometry provenance, final engine tests and overall gate results. This ledger records completed content checks without implying that unrun application or browser gates passed.

Evidence base: the prepared `facts.json` (F01–F40), `facts-extra.json` (FX01–FX15), `source-register.md`, original source/derived map files, `beats-plan.json`, and finalized docs/54. The research folder is `/Users/gavin/work/atlas/art/research/southeast-asia/`; it is read-only and outside the shipped topic. No new factual assertion is inferred merely from an illustration.

## Register mapping and evidence levels

Parent source S01→runtime S1, …, S25→S25. New source SX01→S101, …, SX14→S114, per the prepared `source-id-map.json`. F40 is a local metadata check and is not assigned a false external S-number. Sources about curriculum are planning evidence; they are not offered as scientific evidence for climate, biology or geography.

| Fact ids | Runtime sources | Allowed claim / evidence limit |
|---|---|---|
| F01–F02 | S1 | Social Studies scope, official indexed excerpts only; direct PDF gated. Science page-level confirmation was unavailable. No claim that this topic replaces the whole syllabus. |
| F03–F05 | S3 | UN M49 region, full eleven-country list, Lao PDR landlocked. Statistical grouping kept distinct from organisation membership. |
| F06–F07 | S6 | ASEAN foundation 1967-08-08 and five founding states; official indexed text. |
| F08–F11 | S4 | Brunei 1984-01-07; Viet Nam 1995-07-28; Lao PDR/Myanmar 1997-07-23; Cambodia 1999-04-30. Official indexed account; direct page 403 retained in sources. |
| F12 | S5 | Timor-Leste admission 2025-10-26. Secretariat's indexed admission announcement; earlier observer/in-principle steps not used as formal admission. |
| F13–F17 | S7 | Singapore rainfall/seasons/surface-wind account. F17 station annual-rain total deliberately unused; no regional extrapolation. |
| F18–F20 | S8 | Mekong source region, sea/delta and cross-country path; approximate MRC length. Source region is a textual fact, not a located spring on our map. |
| F21–F22, F25 | S9 | UNESCO Ifugao setting, retained pond fields and attributed heritage-age description. No copied UNESCO image or text. |
| F23–F24 | S10 | FAO's living landscape and water collection/irrigation account, indexed primary description; no measured channel or flow model. |
| F26 | S11 | UCLA report on studied wet-rice terraces, not a date for every terrace. Explicitly contrasted with F25 without averaging. |
| F27–F28 | S12 | Named ASEAN Heritage Parks and regional conservation knowledge-sharing. |
| F29 | S13 | EDB's semiconductor design/manufacturing-related facilities and skills; indexed primary account, no investment/job percentages. |
| F30 | S14 | ASEAN sustainable-tourism roadmap; no local tourism impact estimate. |
| F31–F34 | S15–S16 | Pedagogical research only. No local pupil prevalence or effect-size claim. F32/F34 study ages are not repeated in child text. |
| F35–F37 | S17–S19 | Natural Earth public domain/generalisation and map limits; no legal, navigational or catchment-model claims. |
| F38–F39 | S20–S21 | NOAA policy and existing monthly climate contract. F39's original preparation caveat was superseded by the user's confirmed main implementation and docs/50 E-MW1–3; content still reuses that implementation and arrays. |
| Primary product records | S203–S204 | NOAA NCEP pressure-level and GPCP native-product documentation for the reused runtime files. These are the quantitative citations for 850 hPa and 2.5-degree spacing; the planning spec S21 is not the sole numeric source. |
| F40 | local topic.yaml | `water` and `inside-the-earth` published in this tree; monsoon topic absent. Deployment status not inferred. |
| FX01, FX08 | S101 | Acquired country geometry snapshot; Malaysia on peninsula and Borneo. |
| FX02 | S102 | Five source river features/four systems; Lancang and Mekong grouped without drawing connectors. |
| FX03–FX05 | S103–S105 | NParks stilt-root form; Bukit Timah rainforest; Sungei Buloh wetlands/mangroves/migratory birds. Root illustration does not prove a species identity. |
| FX06 | S106 | NHB indexed raised floor/high sloping roof example only; original page gated. Generic art not assigned that building's identity. |
| FX07 | S107 | UNESCO indexed Malaysian songket hand-weaving account only; page gated. No exclusive cultural ownership or universal home-production claim. |
| FX09–FX10 | S108–S109 | Named seas and peak locations from acquired NE data; no sea jurisdiction, peak-height authority or highest ranking. |
| FX11–FX12 | S111 | Native-array January/July sample checks; same coordinates use distinct wind-node/rain-cell indices. Content does not print unreconciled raw component values. |
| FX13–FX14 | S112–S113 | Chinese wording attestation only. Old Charter member list not used as current membership; newspaper attests wording, not maritime claims. |
| FX15 | S114 | NAS indexed founding aims. Meeting representation is kept separate from dated membership. |

## Fact-to-chapter ledger

Paragraph numbering counts only the four main paragraphs before Figure/More blocks, separately in each locale. Each row applies to all factual sentences in that paragraph; imperatives such as “compare”, questions and descriptions of this interface are editorial/design instructions, not external observations. Bilingual sentence identifiers with exact text appear below for traceability. “D” means the approved interface or schematic design in docs/54, not a source claiming a real-world measurement.

| Chapter / paragraph | Facts assigned to the factual sentences (EN and ZH) | Scope retained |
|---|---|---|
| BG ¶1 | F03–F04, FX01 | M49 grouping/count/list and source-map relative positions; region definition contextualised. |
| BG ¶2 | FX01, F35; D | Dataset provenance, present snapshot; marker/area distinction is interface design. |
| BG ¶3 | F39, F06–F12, FX01; D | Separate geometry epoch, climate reference period and admission dates. |
| BG ¶4 | D; F21–F24, FX04–FX05 | Country-scale case reference, no inferred site boundaries. |
| 01 ¶1 | F05, FX01, FX13 | Lao PDR's lack of coast; naming reflects local/editorial convention. |
| 01 ¶2 | FX08, FX01; D | Malaysian land on peninsula/Borneo, landform words not exclusive nationality bins. |
| 01 ¶3 | FX09, FX14; D | Acquired sea-name positions; strait definition is geographic reading aid, no shipping track. |
| 01 ¶4 | F03–F04, FX01, FX09; D | Eleven-country index; country geometry and marine label purposes differ. |
| 02 ¶1 | F18–F19, FX02 | MRC source region, delta and through/along countries; no located spring. |
| 02 ¶2 | FX02, F37; D | Source reach structure and limits, no invented connecting line or flow simulation. |
| 02 ¶3 | FX02, F19, F37 | Four system identities, border relation; no generic channel-survey claim. |
| 02 ¶4 | FX10, F36, F33; D | Peak-point locations, no topographic surface/height or formation inference. |
| 03 ¶1 | F39, FX11–FX12; D | 1991–2020 monthly means, January/July comparison with fixed legend. |
| 03 ¶2 | F39, FX11–FX12; D | GPCP units, NCEP 850 hPa reanalysis, separate native grids and sample supports. |
| 03 ¶3 | F13–F15; term source S25 | MSS seasons/rain and monsoon definition; no constant-rain claim. |
| 03 ¶4 | F16, F39; D | Singapore surface directions distinct from regional pressure-level vectors; means not daily forecast. |
| 04 ¶1 | FX04–FX05; D | NParks named habitats/birds, no regional vegetation coverage inference. |
| 04 ¶2 | FX03, FX05; D | Stilt-root form and limited interpretation of art; no species diagnosis. |
| 04 ¶3 | D | Country highlight and changing description; this is interface behaviour. |
| 04 ¶4 | F27–F28; D | Both named reserves Heritage Parks and regional knowledge-sharing; teaching interpretation made explicit. |
| 05 ¶1 | F21, FX01; D | Northern Luzon/Ifugao setting; country reference and schematic separate. |
| 05 ¶2 | F22; D | Nearly level retained fields, stone/earth walls and contours; art is not survey. |
| 05 ¶3 | F23–F24; D | Forested-upland collection and wider system; art gives no measured water parameters. |
| 05 ¶4 | F23, F25–F26 | Community/work context; appearance insufficient to establish age. |
| 06 ¶1 | F02, F23–F24; D | Activity framework and refusal to use it as national labels. |
| 06 ¶2 | FX07, F23; D | Malaysian songket example only; home-production/exclusivity deliberately not asserted. |
| 06 ¶3 | F29; D | Semiconductor example bounded to EDB description; no site inventory. |
| 06 ¶4 | F21, F30, FX06; D | Heritage/tourism discussion and generic house limited to form. |
| 07 ¶1 | F06–F07, FX15 | Exact foundation date, named founding states, five count and documented aims. |
| 07 ¶2 | F08–F11 | All intermediate dates, including Viet Nam 1995; same-day accession stays atomic. |
| 07 ¶3 | F12, F06–F11, FX01; D | Explicit 2025-10-26/S5 admission, 2026-10-27 eleven count, fixed modern geometry. |
| 07 ¶4 | F28, FX15; D | Cooperation exemplified by NParks work; membership not a claim of cultural/environmental uniformity. |

## More blocks, quantities and figures

| Chapter | More / figure | Evidence and deliberate limits |
|---|---|---|
| BG | Map source; region/organisation | F35–F37, FX01; F03/F06 and F40 local published-water link. No survey/legal precision claim. |
| 01 | Small-shape entry; sea names | D/FX01; F36/FX09/FX14. Click target is not area and marine label is not jurisdiction. |
| 02 | River length; mountain form | F20/F37 gives approximate 4900 km; F33/FX10 and F40 geology link. No new length measured from line; no volcano identification. |
| 03 | Native grid; arrows/names | F39, FX11–FX12, F16, docs/50. Native spacing 2.5°, distinct origin/support; unavailable is not zero. Arrow is mean-vector destination, wind name is origin. |
| 04 | Plant/map distinction; conservation | FX03–FX05, F27–F28; D. No dimensions/species diagnosis or unsupported regional cover areas. |
| 05 | Dating comparison; section/water | F25–F26: UNESCO 2000 years vs UCLA studied terraces about 400; F21–F24/D schematic; F40 water link. Counts of drawing levels not treated as observed field counts. |
| 06 | Craft; house; tourism | FX07 indexed hand-weaving only; FX06 indexed house features plus generic art; F30 roadmap and F21 landscape. No worker census, exact house or tourist count. |
| 07 | Shared date; prior steps | F09–F10/F06–F07 derived 7→9 on 1997-07-23; F12 observer/in-principle distinction and admission date. No eight-member date, no meeting-attendance count. |
| 04 | `figures/southeast-asia-mangrove-roots` | FX03 supports root growth form. Graphite figure is original art, no diagnosis from leaf clusters and no park boundary. Anchor `sea-mangrove-figure`. |
| 05 | `figures/southeast-asia-rice-terraces` | F22–F24 support general retained-field/water mechanism. Level number/shape/proportions are design, not survey. Anchor `sea-terrace-figure`. |
| 06 | `southeast-asia` cover reused in house More | FX06 supports comparing raised floor/sloping roof. No named building, community/date, measured river site or inferred boat livelihood. |

All body quantities use `<Num>`: regional country count S3; foundation count S6; current ASEAN count S5; pre/post 1997 counts S4/S6; approximate Mekong length S8; pressure S203 and native spacing S203/S204; attributed terrace ages S9 and S11. Dates, reference periods, ordinals and chapter numbers are intentionally outside `<Num>` per the writing rules. Frontmatter captions cannot contain MDX components; their membership quantities remain source-traced to the fact-register records below.

No direct quotations are used. No UNESCO images or long source prose are copied. Existing generic-house art is clearly labelled generic. The weak roundtable image is absent from all chapter files. No measured surface, site boundary, root dimension, terrace water flux, economic statistic or unprovided cultural detail has been added.

## Static checks performed by the content subtask

- Parsed all eight JSON-as-YAML frontmatters; background order/kind and seven chapter orders match the spec.
- Checked 33 beats, complete `geoContext`, camera/layers/highlight/selection/caption; chapter baseline equals its first beat for all target fields; no historical `time`/`t` or separate `month` field.
- Checked every chapter index, highlight, selection and Term/Num source reference against the parent topic data; complete eleven-country indexes in BG, 01 and 07. A climate sample id is a sampling action, not a station.
- Checked EN 200–300 body words and ZH 350–500 Han characters, four paragraphs and two/three More blocks per locale; every quantity in prose uses Num and all text is bilingual.
- Kept all source limitations; did not assert gates that belong to the parent build. Browser work is prohibited in this content sandbox under BRIEF-CONTENT, so shoot/e2e remain for the main session.

The exact static check output and any subsequent correction are appended by the build session. No browser screenshots, draw-call measurements or full application gate results are represented by this content audit alone.

## Caption-by-caption fact record

Captions are the approved prepared text. Every one describes its visible map/context; membership dates label membership on fixed present-day country shapes. No date is supplied to a geography beat as historical `t`.

| Chapter / beat | Context | F/FX record |
|---|---|---|
| background / 1 | present | FX01 |
| background / 2 | present | FX01 |
| background / 3 | present | F03, F04, F05, FX01 |
| background / 4 | present | F39, FX01 |
| countries-and-seas / 1 | present | F05, FX01 |
| countries-and-seas / 2 | present | FX08 |
| countries-and-seas / 3 | present | FX09 |
| countries-and-seas / 4 | present | FX09, FX14 |
| mountains-and-rivers / 1 | present | F18, FX02 |
| mountains-and-rivers / 2 | present | FX02 |
| mountains-and-rivers / 3 | present | FX02 |
| mountains-and-rivers / 4 | present | FX10 |
| seasons-and-rain / 1 | climatology 1 | F39 |
| seasons-and-rain / 2 | climatology 1 | FX11 |
| seasons-and-rain / 3 | climatology 7 | FX12 |
| seasons-and-rain / 4 | present | F16, F39 |
| forests-and-parks / 1 | present | FX04, FX05 |
| forests-and-parks / 2 | present | FX04 |
| forests-and-parks / 3 | present | FX05 |
| forests-and-parks / 4 | present | FX03 |
| terraces-and-rice / 1 | present | F21, FX01 |
| terraces-and-rice / 2 | present | F21, F22 |
| terraces-and-rice / 3 | present | F22, F23, F24 |
| terraces-and-rice / 4 | present | F25, F26 |
| work-and-connections / 1 | present | F23, F24 |
| work-and-connections / 2 | present | FX07 |
| work-and-connections / 3 | present | F29 |
| work-and-connections / 4 | present | F02, F30 |
| asean / 1 | membership 1967-08-08 | F06, F07 |
| asean / 2 | membership 1984-01-07 | F08 |
| asean / 3 | membership 1997-07-23 | F09, F10 |
| asean / 4 | membership 1999-04-30 | F06, F07, F08, F09, F10, F11 |
| asean / 5 | membership 2025-10-26 | F12 |

`background` beat 4 also uses the populated-place record S110. Counts in ASEAN captions derive from the admission table (F06–F12); source geometry remains FX01 at every date. Climate node/cell selection is an action on the real shared arrays (FX11/FX12), not a station point.

## Recorded content-only verification output

On 2026-10-27, the content checker parsed 8 frontmatters and 33 complete beats. Every chapter baseline equalled its first beat; every index/highlight/selection resolved against `geography.json`; all 12 glossary terms were used and every quantitative source id resolved against `sources.json`.

| Chapter | EN body words | ZH body Han characters | More blocks per locale |
|---|---:|---:|---:|
| BG | 243 | 361 | 2 |
| 01 | 238 | 358 | 2 |
| 02 | 249 | 364 | 2 |
| 03 | 248 | 360 | 2 |
| 04 | 243 | 386 | 2 |
| 05 | 242 | 359 | 2 |
| 06 | 252 | 398 | 3 |
| 07 | 232 | 357 | 2 |

This was a local content contract check, not `pnpm check/validate/test/build/shoot/e2e`. Main-session full gates are reported separately.

## Sentence ledger

Sentence ids identify the independent EN/ZH drafts. Evidence is the bundle for that paragraph, specified in the ledger above; D-only sentences describe an approved diagram or interaction. Text here is the authored text with components removed, not a quotation from sources.

### 00 background

- `00-EN-P1-S1` [F03, F04, FX01] Southeast Asia is a region: a way of grouping places to study them together.
- `00-EN-P1-S2` [F03, F04, FX01] The United Nations statistical grouping includes 11 countries, from Myanmar in the west to the Philippines farther east and Timor-Leste in the south.
- `00-EN-P1-S3` [F03, F04, FX01] The country index gives the complete list.
- `00-EN-P1-S4` [F03, F04, FX01] Begin with the world view, then move closer to see how mainland land, islands and surrounding seas fit together.
- `00-EN-P2-S1` [FX01, F35, D] The country shapes come from Natural Earth, a published map dataset.
- `00-EN-P2-S2` [FX01, F35, D] They are a present-day cartographic snapshot, rather than a reconstruction of an earlier century.
- `00-EN-P2-S3` [FX01, F35, D] A large country occupies more of the map than a small country.
- `00-EN-P2-S4` [FX01, F35, D] Singapore's marker makes a small place easier to find without making its land larger.
- `00-EN-P2-S5` [FX01, F35, D] A country outline and a city point answer different questions: one shows an area, while the other helps locate a named place.
- `00-EN-P3-S1` [F39, F06–F12, FX01, D] Watch what changes when the reading context changes.
- `00-EN-P3-S2` [F39, F06–F12, FX01, D] The ordinary geography view keeps the country shapes in place.
- `00-EN-P3-S3` [F39, F06–F12, FX01, D] The climate view shows monthly averages for 1991–2020.
- `00-EN-P3-S4` [F39, F06–F12, FX01, D] The ASEAN view changes membership shading according to admission dates, using the same present-day shapes throughout.
- `00-EN-P3-S5` [F39, F06–F12, FX01, D] A membership date therefore does not date the coastline beside it.
- `00-EN-P4-S1` [F21–F24, FX04–FX05, D] Some chapters move from the regional map to a local example.
- `00-EN-P4-S2` [F21–F24, FX04–FX05, D] Selecting a park or terrace case highlights its country as a location reference.
- `00-EN-P4-S3` [F21–F24, FX04–FX05, D] It does not draw that site's boundary or promise directions to it.
- `00-EN-P4-S4` [F21–F24, FX04–FX05, D] Read the map, the case description and any separate drawing together: each supplies information at a different scale.
- `00-ZH-P1-S1` [F03, F04, FX01] 东南亚是一个区域，把地方放在一起，方便比较和研究。
- `00-ZH-P1-S2` [F03, F04, FX01] 联合国的统计分组列有 11 个国家，完整名单在本章索引中。
- `00-ZH-P1-S3` [F03, F04, FX01] 先从世界地图找亚洲，再移近东南亚，观察大陆、岛屿和海洋怎样排列。
- `00-ZH-P1-S4` [F03, F04, FX01] 国名名单帮助认地方，陆地轮廓则帮助理解它们的相对位置，两者要一起读。
- `00-ZH-P2-S1` [FX01, F35, D] 这张图的国形取自 Natural Earth 制图资料，采用今天的地图快照。
- `00-ZH-P2-S2` [FX01, F35, D] 新加坡在区域图上很小，所以另有可点的标记；标记让人容易找到它，并没有放大国土。
- `00-ZH-P2-S3` [FX01, F35, D] 国家的轮廓表示一片面积，城市点表示具名地点，不能把两种符号当成同一回事。
- `00-ZH-P3-S1` [F39, F06–F12, FX01, D] 阅读时还要留意资料的时间。
- `00-ZH-P3-S2` [F39, F06–F12, FX01, D] 普通地理图展示固定国形；气候图采用 1991–2020 年的月平均；亚细安（也称东盟）图按入会日期改变颜色，仍沿用同一组今天的国形。
- `00-ZH-P3-S3` [F39, F06–F12, FX01, D] 因此，入会日不是旁边海岸线的年代，气候月份也不是某一天的天气。
- `00-ZH-P4-S1` [F21–F24, FX04–FX05, D] 后面会从区域图转向公园、梯田等案例。
- `00-ZH-P4-S2` [F21–F24, FX04–FX05, D] 选择案例时，地图只用所在国家帮助定位，不显示实地边界，也不能据此寻找入口或田块。
- `00-ZH-P4-S3` [F21–F24, FX04–FX05, D] 把位置图、文字和另附的示意图合起来读，并分别辨认它们的尺度。

### 01 countries-and-seas

- `01-EN-P1-S1` [F05, FX01, FX13] A border around a country does not tell us whether it has a coast.
- `01-EN-P1-S2` [F05, FX01, FX13] Select Lao PDR, called 寮国 in this topic's Chinese text.
- `01-EN-P1-S3` [F05, FX01, FX13] It is landlocked, meaning that it has no coastline.
- `01-EN-P1-S4` [F05, FX01, FX13] Compare its outline with the neighbouring country shapes.
- `01-EN-P1-S5` [F05, FX01, FX13] You can find a place's position without assuming that every country in Southeast Asia has a beach or a sea port.
- `01-EN-P2-S1` [FX08, FX01, D] Look next at Malaysia.
- `01-EN-P2-S2` [FX08, FX01, D] Its land appears on the peninsula and on part of Borneo, with sea between them.
- `01-EN-P2-S3` [FX08, FX01, D] The outline belongs to the same country in both places.
- `01-EN-P2-S4` [FX08, FX01, D] Mainland and island are useful words for describing land, but they cannot always divide countries into separate boxes.
- `01-EN-P2-S5` [FX08, FX01, D] An archipelago is a group of islands, not a list of states belonging to an organisation.
- `01-EN-P3-S1` [FX09, FX14, D] The Strait of Malacca lies between land areas.
- `01-EN-P3-S2` [FX09, FX14, D] A strait is a narrow sea passage.
- `01-EN-P3-S3` [FX09, FX14, D] Its name label helps you read that passage on the map; the label is not the route taken by a particular ship.
- `01-EN-P3-S4` [FX09, FX14, D] Compare it with the broader positions marked South China Sea, Java Sea and Andaman Sea.
- `01-EN-P3-S5` [FX09, FX14, D] Read the sea names alongside the land around them.
- `01-EN-P4-S1` [F03, F04, FX01, FX09, D] The country index contains the region's 11 countries, including Singapore and Timor-Leste.
- `01-EN-P4-S2` [F03, F04, FX01, FX09, D] Use it when a shape is too small to tap easily.
- `01-EN-P4-S3` [F03, F04, FX01, FX09, D] Selecting a country identifies its complete mapped geometry, including separate islands.
- `01-EN-P4-S4` [F03, F04, FX01, FX09, D] Sea labels serve a different purpose: they name water areas and make no claim about ownership of them.
- `01-ZH-P1-S1` [F05, FX01, FX13] 国家有边界，不等于一定有海岸。
- `01-ZH-P1-S2` [F05, FX01, FX13] 先选寮国，也就是老挝人民民主共和国。
- `01-ZH-P1-S3` [F05, FX01, FX13] 它是内陆的，意思是没有海岸。
- `01-ZH-P1-S4` [F05, FX01, FX13] 沿着它的轮廓看看邻国，就能比较哪些地方相接、海在什么方向，不必先假定东南亚每个国家都有海滩或海港。
- `01-ZH-P2-S1` [FX08, FX01, D] 再看马来西亚：它的国土分布在半岛和婆罗洲的一部分，中间隔着海。
- `01-ZH-P2-S2` [FX08, FX01, D] 分开的陆地仍属于同一个国家。
- `01-ZH-P2-S3` [FX08, FX01, D] 大陆和岛屿是描述地形的词，不能把所有国家硬分为互不相交的两类。
- `01-ZH-P2-S4` [FX08, FX01, D] 群岛指一组岛屿，也不是某个组织的成员名单。
- `01-ZH-P3-S1` [FX09, FX14, D] 马六甲海峡位于陆地之间。
- `01-ZH-P3-S2` [FX09, FX14, D] 海峡是较窄的海上通道，图上的名称帮助辨认位置，并不是某艘船走过的路线。
- `01-ZH-P3-S3` [FX09, FX14, D] 把它与南中国海、爪哇海和安达曼海的标签比较，再观察周围陆地，海陆关系会更清楚。
- `01-ZH-P4-S1` [F03, F04, FX01, FX09, D] 区域的 11 国都列在索引中，包括新加坡和东帝汶。
- `01-ZH-P4-S2` [F03, F04, FX01, FX09, D] 小国形不易点到时，可以从名单选取；选中的是该国整套地图几何，包括分开的岛屿。
- `01-ZH-P4-S3` [F03, F04, FX01, FX09, D] 海名则只帮助识别水域，不能当成海上所有权的说明。
- `01-ZH-P4-S4` [F03, F04, FX01, FX09, D] 读图时要分清国名、陆地与水域名称，才不会把不同符号的意思混在一起。

### 02 mountains-and-rivers

- `02-EN-P1-S1` [F18, F19, FX02] The Mekong River Commission describes a river beginning on the Tibetan Plateau and reaching the sea through its delta.
- `02-EN-P1-S2` [F18, F19, FX02] Between those places, the Mekong passes through or along China, Myanmar, Lao PDR, Thailand, Cambodia and Viet Nam.
- `02-EN-P1-S3` [F18, F19, FX02] Read that description beside the map.
- `02-EN-P1-S4` [F18, F19, FX02] A river system brings connected reaches into the same explanation, even when country boundaries divide the land around them.
- `02-EN-P2-S1` [FX02, F37, D] The mapped upper and lower reaches come from Natural Earth's drainage data.
- `02-EN-P2-S2` [FX02, F37, D] Its Lancang and Mekong features are selected together here.
- `02-EN-P2-S3` [FX02, F37, D] Their lines help locate the system, but the northern endpoint on this map is not a marked spring.
- `02-EN-P2-S4` [FX02, F37, D] Gaps in the acquired lines have been left as gaps.
- `02-EN-P2-S5` [FX02, F37, D] There is no moving water model to show which way a parcel of water travels.
- `02-EN-P3-S1` [FX02, F19, F37] Compare the Ayeyarwady, Chao Phraya and Red River with the Mekong.
- `02-EN-P3-S2` [FX02, F19, F37] Each is a separately named system in the source.
- `02-EN-P3-S3` [FX02, F19, F37] Follow the displayed line with your eyes and notice the country outlines nearby.
- `02-EN-P3-S4` [FX02, F19, F37] A river may cross a border or run along one; its name should not make you assume it stays inside a single country.
- `02-EN-P3-S5` [FX02, F19, F37] A map line is a reading aid, rather than a complete channel survey.
- `02-EN-P4-S1` [FX10, F36, F33, D] Mountain points introduce another kind of symbol.
- `02-EN-P4-S2` [FX10, F36, F33, D] Select Kinabalu on Borneo, then use the index to find the other named peaks.
- `02-EN-P4-S3` [FX10, F36, F33, D] A point locates a mountain without showing the shape or height of all the land around it.
- `02-EN-P4-S4` [FX10, F36, F33, D] To explain how a mountain formed, we would need geological evidence as well as its position.
- `02-ZH-P1-S1` [F18, F19, FX02] 湄公河委员会说明，湄公河发源于青藏高原，经三角洲流向海洋，途中穿过或沿着中国、缅甸、寮国、泰国、柬埔寨和越南。
- `02-ZH-P1-S2` [F18, F19, FX02] 读这段说明时，要与地图互相核对。
- `02-ZH-P1-S3` [F18, F19, FX02] 水系把相连河段放在一起理解，周围陆地的国界却可能把它们分开。
- `02-ZH-P2-S1` [FX02, F37, D] 图中的上、下游河线取自 Natural Earth。
- `02-ZH-P2-S2` [FX02, F37, D] 澜沧江与湄公河是来源里分开的要素，在这里作为同一水系选取。
- `02-ZH-P2-S3` [FX02, F37, D] 它们能帮助找位置，但图线北端并没有标明真实泉源，取得的河线若有缺口也照样保留。
- `02-ZH-P2-S4` [FX02, F37, D] 地图没有模拟水团运动，不能把线的端点顺序当作流向证据。
- `02-ZH-P3-S1` [FX02, F19, F37] 再比较伊洛瓦底江、湄南河和红河。
- `02-ZH-P3-S2` [FX02, F19, F37] 这些都是来源中另有名称的水系。
- `02-ZH-P3-S3` [FX02, F19, F37] 沿图线观察邻近国形，能看出河流位置与国家位置是不同层面的事情。
- `02-ZH-P3-S4` [FX02, F19, F37] 湄公河有些河段穿过国境，有些沿着国境；一个河名并不表示整条河都在同一国。
- `02-ZH-P4-S1` [FX10, F36, F33, D] 山峰用另一种符号表示。
- `02-ZH-P4-S2` [FX10, F36, F33, D] 先选婆罗洲的京那巴鲁，再从索引找其他具名山峰。
- `02-ZH-P4-S3` [FX10, F36, F33, D] 峰点告诉人一座山大致在哪里，却没有展示周围土地的完整高低起伏，也不能单凭位置判断山怎样形成。
- `02-ZH-P4-S4` [FX10, F36, F33, D] 若要解释成因，还需要地质证据。

### 03 seasons-and-rain

- `03-EN-P1-S1` [F39, FX11, FX12, D] Start with January and look across the region.
- `03-EN-P1-S2` [F39, FX11, FX12, D] The colours show a monthly climate mean, calculated for the same calendar month over 1991–2020.
- `03-EN-P1-S3` [F39, FX11, FX12, D] They do not show a storm travelling across the map today.
- `03-EN-P1-S4` [F39, FX11, FX12, D] Different places can have different rainfall in the same month.
- `03-EN-P1-S5` [F39, FX11, FX12, D] Change to July and compare them using the unchanged rain legend, so that the colours keep the same meaning.
- `03-EN-P2-S1` [F39, FX11, FX12, D] The rain product is GPCP precipitation, displayed in millimetres per day.
- `03-EN-P2-S2` [F39, FX11, FX12, D] The wind product uses NCEP reanalysis at a pressure level of 850 hPa.
- `03-EN-P2-S3` [F39, FX11, FX12, D] These are different kinds of information.
- `03-EN-P2-S4` [F39, FX11, FX12, D] Rain is shown in cells, while wind is sampled at nodes on its own grid.
- `03-EN-P2-S5` [F39, FX11, FX12, D] Inspect the shared example near the equator: the location connects the readings, but it does not make the wind node and rain cell the same object.
- `03-EN-P3-S1` [F13–F15, S25] A monsoon is a large-scale circulation that changes with the seasons.
- `03-EN-P3-S2` [F13–F15, S25] Singapore's Meteorological Service describes a Northeast Monsoon from December to early March and a Southwest Monsoon from June to September.
- `03-EN-P3-S3` [F13–F15, S25] Singapore has rain throughout the year, and the later Northeast Monsoon is relatively dry.
- `03-EN-P3-S4` [F13–F15, S25] The word monsoon therefore does not mean constant heavy rain.
- `03-EN-P4-S1` [F16, F39, D] Return to the Singapore location view.
- `03-EN-P4-S2` [F16, F39, D] Its typical Southwest Monsoon surface winds come from the southeast to south, according to the Meteorological Service.
- `03-EN-P4-S3` [F16, F39, D] The regional pressure-level arrows are a different field from those surface descriptions.
- `03-EN-P4-S4` [F16, F39, D] Keep the source, level, period and location in view before making a comparison; a regional average cannot forecast the weather at your school tomorrow.
- `03-ZH-P1-S1` [F39, FX11, FX12, D] 先选一月，看看整个区域的颜色。
- `03-ZH-P1-S2` [F39, FX11, FX12, D] 图上是月气候平均：把 1991–2020 年中同一个月份的资料合起来统计，不是今天正在移动的暴雨。
- `03-ZH-P1-S3` [F39, FX11, FX12, D] 各地同在一月，降水仍可不同。
- `03-ZH-P1-S4` [F39, FX11, FX12, D] 切到七月时，用不变的图例比较，才能保证同一种颜色仍代表同一种读数。
- `03-ZH-P2-S1` [F39, FX11, FX12, D] 雨采用 GPCP 降水资料，单位是毫米每天；风采用 NCEP 再分析的 850 hPa 气压层资料。
- `03-ZH-P2-S2` [F39, FX11, FX12, D] 雨按格子显示，风则在自己的格点上取值。
- `03-ZH-P2-S3` [F39, FX11, FX12, D] 查看赤道附近的共同示例时，坐标把读数联系起来，却没有把风节点和雨格变成同一个对象。
- `03-ZH-P3-S1` [F13–F15, S25] 季风是随季节改变的大范围环流。
- `03-ZH-P3-S2` [F13–F15, S25] 新加坡气象署把东北季风期列为十二月至三月初，西南季风期为六月至九月。
- `03-ZH-P3-S3` [F13–F15, S25] 新加坡全年有雨，东北季风后期却较干，所以“季风”不能简单理解为不停下大雨。
- `03-ZH-P4-S1` [F16, F39, D] 回到新加坡的位置图，再分清地面和高空。
- `03-ZH-P4-S2` [F16, F39, D] 气象署说，本地西南季风期常见的地面风来自东南至南方；区域气压层的箭头是另一种资料。
- `03-ZH-P4-S3` [F16, F39, D] 比较前先读来源、层次、时期和地点，不能把区域多年平均当成学校明天的天气预报；如果要知道某一天是否下雨，还需要另外的天气资料。

### 04 forests-and-parks

- `04-EN-P1-S1` [FX04, FX05, D] A green patch on a regional map does not tell the whole story of its plants.
- `04-EN-P1-S2` [FX04, FX05, D] Begin with Singapore as a country-scale location reference, then compare the named cases in the reading panel.
- `04-EN-P1-S3` [FX04, FX05, D] NParks describes primary rainforest at Bukit Timah Nature Reserve.
- `04-EN-P1-S4` [FX04, FX05, D] At Sungei Buloh Wetland Reserve, it describes wetlands and mangroves, including habitat important for migratory birds.
- `04-EN-P1-S5` [FX04, FX05, D] These are particular places, rather than a vegetation map of all Southeast Asia.
- `04-EN-P2-S1` [FX03, FX05, D] A mangrove forest is a coastal plant community.
- `04-EN-P2-S2` [FX03, FX05, D] The drawing focuses on an arching stilt-root growth form.
- `04-EN-P2-S3` [FX03, FX05, D] NParks records such roots for Rhizophora apiculata.
- `04-EN-P2-S4` [FX03, FX05, D] Follow the visible roots from the trunk towards the ground, then look at the leaves above.
- `04-EN-P2-S5` [FX03, FX05, D] The drawing helps us notice a plant's structure; it does not identify every tree in a wetland or imply that every mangrove has this root form.
- `04-EN-P3-S1` [D] Select Bukit Timah and then Sungei Buloh.
- `04-EN-P3-S2` [D] The case descriptions change, while Singapore remains the location reference.
- `04-EN-P3-S3` [D] The map does not place a park point or draw a park boundary.
- `04-EN-P3-S4` [D] To compare these habitats, use the named descriptions and the figure instead of treating the country's entire land area as rainforest or mangrove.
- `04-EN-P4-S1` [F27, F28, D] Both reserves are ASEAN Heritage Parks.
- `04-EN-P4-S2` [F27, F28, D] NParks also describes regional work involving biodiversity knowledge-sharing and protected areas.
- `04-EN-P4-S3` [F27, F28, D] Conservation can therefore connect a local habitat with neighbours elsewhere.
- `04-EN-P4-S4` [F27, F28, D] Looking carefully at plants, their surroundings and the limits of the map is a starting point for understanding what that cooperation, or working together, is about.
- `04-ZH-P1-S1` [FX04, FX05, D] 区域图上的绿色，不能把植物的情况说完整。
- `04-ZH-P1-S2` [FX04, FX05, D] 先以新加坡作国家尺度的位置参考，再比较阅读面板中的具名案例。
- `04-ZH-P1-S3` [FX04, FX05, D] 国家公园局介绍，武吉知马自然保护区保留了原始雨林；双溪布洛湿地保留区则有湿地和红树林，也是候鸟的重要栖息地。
- `04-ZH-P1-S4` [FX04, FX05, D] 这些是具体地方，不能据此画出整个东南亚的植被分布。
- `04-ZH-P2-S1` [FX03, FX05, D] 红树林是一类海岸植物群落。
- `04-ZH-P2-S2` [FX03, FX05, D] 图中重点是弯拱的支柱根形态，国家公园局在 Rhizophora apiculata 的介绍中有相应记录。
- `04-ZH-P2-S3` [FX03, FX05, D] 沿着树干往下看根，再往上看叶，能帮助观察植物结构；这幅图却不能鉴定湿地里的每一棵树，也不表示所有红树都长同一种根。
- `04-ZH-P3-S1` [D] 依次选武吉知马和双溪布洛，案例文字改变，新加坡仍只作位置参考。
- `04-ZH-P3-S2` [D] 地图没有新增公园点，也没有描画公园边界。
- `04-ZH-P3-S3` [D] 比较栖息地要读名称与说明，不能把整片新加坡国土都看成雨林或红树林。
- `04-ZH-P4-S1` [F27, F28, D] 这些保护区同属亚细安遗产公园。
- `04-ZH-P4-S2` [F27, F28, D] 国家公园局也介绍区域间的生物多样性知识分享和保护区合作。
- `04-ZH-P4-S3` [F27, F28, D] 本地植物与远方邻国因此有了联系；先仔细观察植物、周围环境和地图的限度，才能进一步理解合作的内容，也就是在共同事务上携手行动。

### 05 terraces-and-rice

- `05-EN-P1-S1` [F21, FX01, D] Locate the Philippines, then move towards northern Luzon.
- `05-EN-P1-S2` [F21, FX01, D] UNESCO's listed Rice Terraces of the Philippine Cordilleras include Ifugao terrace clusters there.
- `05-EN-P1-S3` [F21, FX01, D] The country outline gives a regional reference, not the outline of a rice field.
- `05-EN-P1-S4` [F21, FX01, D] Turn to the separate section drawing to examine how a slope can hold a cultivated surface.
- `05-EN-P1-S5` [F21, FX01, D] Its stepped arrangement is a teaching diagram, rather than a survey of an Ifugao site.
- `05-EN-P2-S1` [F22, D] A rice terrace is a field retained along a slope.
- `05-EN-P2-S2` [F22, D] UNESCO describes nearly level pond fields following hillside contours, with retaining walls of stone or earth.
- `05-EN-P2-S3` [F22, D] In the drawing, compare the relatively flat field surfaces with the ground falling away beside them.
- `05-EN-P2-S4` [F22, D] The walls and retained surfaces are parts of the agricultural construction, rather than natural steps that simply happen to contain rice.
- `05-EN-P3-S1` [F23, F24, D] Irrigation supplies water to cultivated fields.
- `05-EN-P3-S2` [F23, F24, D] FAO describes water collected from forested uplands and conveyed to Ifugao fields.
- `05-EN-P3-S3` [F23, F24, D] Its account connects forests, farms, terraces, settlements and water infrastructure.
- `05-EN-P3-S4` [F23, F24, D] Look at the drawing’s higher and lower fields together, while remembering that their connections are schematic.
- `05-EN-P3-S5` [F23, F24, D] They do not give measured channels, water depths or flow rates for a real hillside.
- `05-EN-P4-S1` [F23, F25, F26] The terraces are a living system of work and knowledge, not an empty pattern on a mountain.
- `05-EN-P4-S2` [F23, F25, F26] FAO's account places communities within that system.
- `05-EN-P4-S3` [F23, F25, F26] Reading only the field shape would leave out the people and management that make it agricultural land.
- `05-EN-P4-S4` [F23, F25, F26] The landscape's age is a separate question that needs evidence beyond its appearance.
- `05-ZH-P1-S1` [F21, FX01, D] 先在地图上找到菲律宾，再移到吕宋北部。
- `05-ZH-P1-S2` [F21, FX01, D] 联合国教科文组织列入世界遗产的菲律宾科迪勒拉山水稻梯田，包括这一带的伊富高梯田群。
- `05-ZH-P1-S3` [F21, FX01, D] 国形只提供区域参考，没有描出某块稻田。
- `05-ZH-P1-S4` [F21, FX01, D] 要理解斜坡怎样留住田面，可以另看剖面图，但图中的台阶是教学示意，并非实地测绘。
- `05-ZH-P2-S1` [F22, D] 水稻梯田是在坡地修成、受到挡护的田面。
- `05-ZH-P2-S2` [F22, D] 教科文组织介绍，接近水平的蓄水田沿山坡等高线分布，用石或土筑墙挡护。
- `05-ZH-P2-S3` [F22, D] 比较图上平坦的田面与旁边下落的坡地，就能看出田面和墙是农业建设的一部分，并不是天然台阶恰好长着稻。
- `05-ZH-P3-S1` [F23, F24, D] 灌溉把水送到耕作田地。
- `05-ZH-P3-S2` [F23, F24, D] 粮农组织说明，伊富高的用水从有森林的高地收集，再引向农田；森林、农地、梯田、聚落和水利设施彼此联系。
- `05-ZH-P3-S3` [F23, F24, D] 图中高处与低处要一起读，但连接方式经过简化，没有提供真实水道、蓄水深度或流量。
- `05-ZH-P4-S1` [F23, F25, F26] 梯田也是社区持续劳动和运用知识的地方。
- `05-ZH-P4-S2` [F23, F25, F26] 只看山坡上的形状，会漏掉农业系统里的人和管理。
- `05-ZH-P4-S3` [F23, F25, F26] 地景的年代又是另一道问题，必须比较文字、考古等证据，不能凭外观判断。

### 06 work-and-connections

- `06-EN-P1-S1` [F02, F23, F24, D] The terrace case shows agricultural work as a relationship between land, water and knowledge.
- `06-EN-P1-S2` [F02, F23, F24, D] Farming is one way people make a living in Southeast Asia.
- `06-EN-P1-S3` [F02, F23, F24, D] Craft production, technology-based industry and tourism provide other ways to investigate work.
- `06-EN-P1-S4` [F02, F23, F24, D] These headings help compare activities; they do not divide the region into farming countries, craft countries and factory countries.
- `06-EN-P1-S5` [F02, F23, F24, D] A country can contain many activities and many different lives.
- `06-EN-P2-S1` [FX07, F23, D] For a craft example, select Malaysia and read about songket.
- `06-EN-P2-S2` [FX07, F23, D] UNESCO describes it as a Malaysian hand-weaving tradition.
- `06-EN-P2-S3` [FX07, F23, D] Handwork involves knowledge passed between people, as the terrace case does in a different setting.
- `06-EN-P2-S4` [FX07, F23, D] This particular heritage example does not establish that every weaver works at home.
- `06-EN-P2-S5` [FX07, F23, D] Nor does recognising a tradition in Malaysia establish that culture stops at a country boundary.
- `06-EN-P3-S1` [F29, D] Singapore's semiconductor activities offer a technology example.
- `06-EN-P3-S2` [F29, D] The Economic Development Board describes integrated-circuit design alongside manufacturing-related infrastructure and skills.
- `06-EN-P3-S3` [F29, D] Compare that description with the terrace and weaving cases.
- `06-EN-P3-S4` [F29, D] Each calls attention to different materials, skills and work settings.
- `06-EN-P3-S5` [F29, D] The country reference only locates the example; it is not a map of farms, weaving workshops or semiconductor factories.
- `06-EN-P4-S1` [F21, F30, FX06, D] Tourism brings another set of connections.
- `06-EN-P4-S2` [F21, F30, FX06, D] The terrace landscape is a heritage example, while ASEAN has a roadmap for sustainable tourism.
- `06-EN-P4-S3` [F21, F30, FX06, D] Thinking about visitors also raises questions about the environment and communities of a place.
- `06-EN-P4-S4` [F21, F30, FX06, D] Housing deserves the same care: the raised-house drawing is a general form study, with no named building, community or date.
- `06-EN-P4-S5` [F21, F30, FX06, D] Neither an occupation nor a house picture can represent everyone in a country.
- `06-ZH-P1-S1` [F02, F23, F24, D] 梯田让我们看到，农业劳动把土地、水和知识联系起来。
- `06-ZH-P1-S2` [F02, F23, F24, D] 在东南亚研究工作，还可以看手工艺、科技产业与旅游。
- `06-ZH-P1-S3` [F02, F23, F24, D] 这些分类方便比较活动，不是给国家贴标签。
- `06-ZH-P1-S4` [F02, F23, F24, D] 一个国家可以有不同职业和生活，不能把人简单分成“种田国家的人”或“工厂国家的人”。
- `06-ZH-P2-S1` [FX07, F23, D] 选马来西亚，可以读到 songket 织造的例子。
- `06-ZH-P2-S2` [FX07, F23, D] 教科文组织把它介绍为马来西亚的一项手工织造传统。
- `06-ZH-P2-S3` [FX07, F23, D] 织工也运用传承的知识，但环境和材料与梯田不同。
- `06-ZH-P2-S4` [FX07, F23, D] 这项遗产记录并没有说明所有织工都在家中生产，也不能用一个国家的记录断定文化只存在于国界之内。
- `06-ZH-P3-S1` [F29, D] 新加坡的半导体活动提供科技产业案例。
- `06-ZH-P3-S2` [F29, D] 经济发展局介绍其中的集成电路设计，以及与制造有关的设施和技能。
- `06-ZH-P3-S3` [F29, D] 把它与梯田、织造比较，可以留意不同的材料、知识和工作环境。
- `06-ZH-P3-S4` [F29, D] 图上的国家只帮助定位，没有把农场、织坊或工厂的分布画出来。
- `06-ZH-P4-S1` [F21, F30, FX06, D] 旅游又把来访者与地方联系起来。
- `06-ZH-P4-S2` [F21, F30, FX06, D] 梯田是文化地景案例，亚细安也有可持续旅游路线图，提醒人讨论环境与社区。
- `06-ZH-P4-S3` [F21, F30, FX06, D] 住宅同样需要谨慎理解：高脚屋图只是一般形式研究，没有具体建筑、族群或年代。
- `06-ZH-P4-S4` [F21, F30, FX06, D] 职业和房屋图片都不能代替整个国家里各种人的生活。

### 07 asean

- `07-EN-P1-S1` [F06, F07, FX15] The countries on a regional map did not all join ASEAN at once.
- `07-EN-P1-S2` [F06, F07, FX15] The organisation was founded in Bangkok on 8 August 1967 by Indonesia, Malaysia, the Philippines, Singapore and Thailand: 5 founding members.
- `07-EN-P1-S3` [F06, F07, FX15] The founding declaration addressed economic and social cooperation as well as regional peace and stability.
- `07-EN-P1-S4` [F06, F07, FX15] Joining an organisation is a dated event, different from a country's shape on a map.
- `07-EN-P2-S1` [F08–F11] Brunei Darussalam joined on 7 January 1984.
- `07-EN-P2-S2` [F08–F11] Viet Nam followed on 28 July 1995.
- `07-EN-P2-S3` [F08–F11] Lao PDR and Myanmar joined on 23 July 1997, and Cambodia on 30 April 1999.
- `07-EN-P2-S4` [F08–F11] Read these dates alongside the membership control.
- `07-EN-P2-S5` [F08–F11] The change from Viet Nam's admission to the next admission adds both Lao PDR and Myanmar together, because their dates are the same.
- `07-EN-P3-S1` [F12, F06–F11, FX01, D] On 26 October 2025, Timor-Leste became ASEAN's eleventh member, according to the ASEAN Secretariat's admission announcement.
- `07-EN-P3-S2` [F12, F06–F11, FX01, D] The organisation therefore has 11 members at this topic's 27 October 2026 reference date.
- `07-EN-P3-S3` [F12, F06–F11, FX01, D] Selecting an earlier membership date changes which countries are highlighted.
- `07-EN-P3-S4` [F12, F06–F11, FX01, D] All the country outlines remain today's shapes, including countries that had not yet joined at that date.
- `07-EN-P4-S1` [F28, FX15, D] Cooperation means working together on shared matters.
- `07-EN-P4-S2` [F28, FX15, D] The conservation examples make this concrete: NParks describes regional biodiversity knowledge-sharing and protected-area work.
- `07-EN-P4-S3` [F28, FX15, D] ASEAN membership does not make its countries' habitats, occupations or cultures identical.
- `07-EN-P4-S4` [F28, FX15, D] After following the dates, return to the earlier examples and consider what neighbours can study and care for together.
- `07-ZH-P1-S1` [F06, F07, FX15] 区域地图上的国家，并非一起加入亚细安。
- `07-ZH-P1-S2` [F06, F07, FX15] 组织于 1967 年 8 月 8 日在曼谷成立，创始成员有印度尼西亚、马来西亚、菲律宾、新加坡和泰国，共 5 国。
- `07-ZH-P1-S3` [F06, F07, FX15] 成立宣言提出经济与社会合作，以及区域和平与稳定。
- `07-ZH-P1-S4` [F06, F07, FX15] 加入组织有特定日期，与国形怎样画是不同的事情。
- `07-ZH-P2-S1` [F08–F11] 文莱于 1984 年 1 月 7 日加入，越南于 1995 年 7 月 28 日加入。
- `07-ZH-P2-S2` [F08–F11] 寮国和缅甸在 1997 年 7 月 23 日同日入会，柬埔寨则在 1999 年 4 月 30 日加入。
- `07-ZH-P2-S3` [F08–F11] 可把这些日期与成员控件对照，留意寮国和缅甸同时改变状态，不能在同一天中间虚构一个先后阶段。
- `07-ZH-P3-S1` [F12, F06–F11, FX01, D] 亚细安秘书处的入会公告说明，东帝汶于 2025 年 10 月 26 日成为第十一个成员。
- `07-ZH-P3-S2` [F12, F06–F11, FX01, D] 因此，截至本题参考日 2026 年 10 月 27 日，成员共有 11 国。
- `07-ZH-P3-S3` [F12, F06–F11, FX01, D] 选择较早日期只会改变成员颜色，所有国形仍采用今天的地图，当时尚未入会的国家也继续显示。
- `07-ZH-P4-S1` [F28, FX15, D] 合作就是在共同事务上携手行动。
- `07-ZH-P4-S2` [F28, FX15, D] 前面的保育案例使它更具体：国家公园局介绍区域间分享生物多样性知识和开展保护区工作。
- `07-ZH-P4-S3` [F28, FX15, D] 成员身份没有让各国的环境、工作或文化变成一样；邻国可以在差异中一起研究和照顾共同关心的事。

## 最终施工验证补记

2026-10-27：pnpm check退出0（789文件、0错误0警告、4提示），validate为60主题0错误0警告，完整单元168文件4,369项通过，production build为123页通过。静态EN/ZH首页各35已发布卡，本题运行数据1,112,854字节。新增引擎22项与内容21项包含真实原格网精度、13个成员日期检查、固定国形hash/一次source安装、成对高亮与上下文/URL清理；详见两个time-scene测试文件。浏览器shoot/e2e依brief禁令未运行，不能据此声称视觉/手机/离线浏览器门槛通过。给Gavin清单在REVIEW。

事实限定不变：2025-10-26东帝汶正式加入S5；11成员截至2026-10-27；今界始终固定。图片级数是设计，四级不代表真实Ifugao田区测量；新图替代圆桌。最终图均在原体积预算内，alpha边缘和处理后目检通过。全部地图输入属于公有领域派生，未复制UNESCO/NHB/FAO的第三方图片或文字段落。
