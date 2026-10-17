# Second pass: historical borders

The durable reconstruction is `border-traces.json`, `georef-Borneo1903.json` and `borders.ts`. Run `pnpm tsx scripts/geo/singapore-1819-1965/borders.ts`; its derived datasets are in ignored `work/border-*.geojson`. `border-integration.json` supplies exact manifest selectors. None of these helpers edits the shared pipeline, sources manifest, keyframe recipes or chapter prose.

## Sources and registration

G23 is the already downloaded 1898 Stanford map published for the Straits Branch of the Royal Asiatic Society, BnF GE C-2635, [Gallica record](https://gallica.bnf.fr/ark:/12148/btv1b53029747c). Its public-domain licence and source receipt were already in SOURCES-GEO.md. The 12 external named-town controls and shared `projection: auto` model are unchanged: Mercator + affine, fit RMS/max **1,801.42 / 2,813.53 m → unchanged**, LOO RMS/max **2,447.51 / 4,829.04 m → unchanged**. A regional map fit is not a surveyed boundary accuracy. Native pixels are converted to its existing quarter-raster control coordinates before fitting.

**New G34:** Edward Stanford for the British North Borneo Company, *A map of British North Borneo*, 1903, Library of Congress **g8033s.ct001930**, [Commons source and rights](https://commons.wikimedia.org/wiki/File:A_map_of_British_North_Borneo_(II).jpg). The original is 9,932 × 6,812 pixels, published in 1903; Commons identifies it as public domain (PD-old and PD-US). Direct original: `https://upload.wikimedia.org/wikipedia/commons/a/a2/A_map_of_British_North_Borneo_%28II%29.jpg`. SHA-256: `c9b9dc9a04b196d504b1c68220be4fc15452a26ce93c5558eb15e67b4bc9574d`.

G34 has **8 directly observed Greenwich graticule intersections**, `projection: auto`, selected **Mercator + affine**. Before: not measured. After: fit RMS/max **229.33 / 333.49 m**; LOO RMS/max **381.09 / 697.20 m**. This is internal map registration only. The controls are *not* surviving external landmarks; their pixel reading allowance is ±3 native pixels. Four other candidates were dropped because the inset or title covers the main-map grid, or because a grid crossing is not actually printed over sea. No unobserved intersection was retained. The source datum and original compilation accuracy remain unknown, so all historical border features remain approximate. `work/border-grid-crops.png` preserves the control-reading review.

`border-audit.json` records these fits, the original G23/G34 hashes, the two Natural Earth input hashes and the shared Natural Earth 10m land topology hash. No OSM geometry is used.

## What changed

**Dindings:** the printed dashed and crossed inland boundary is traced from Sungei Jarum Mas, east through the hill near Batu Ampang, then south past Gunong Tunggal to the coast near K. Telok Batu. The durable vertices are native G23 pixels. The other side is closed offshore and intersected with the shared Natural Earth 10m land, which supplies the mainland coastline. Pangkor and Pangkor Laut are absent from that shared Natural Earth land layer, so both named islands have their complete closed coastlines traced from G23 and unioned into the output. The closing segments never become a land border. The output is **428.849815 km²**. Its two edges are sourced map ink and dataset coast, not a box or a coordinate-invented polygon. FMS datasets explicitly subtract it for K5, K6 and K6a. K6b (1937) restores full Perak after the documented 1935 cession. **Published resolution limit:** the shared final simplify coast surgery re-intersects this region with Natural Earth land and therefore removes the source-traced Pangkor/Pangkor Laut islands. The durable pre-simplify trace and its 428.849815 km² area preserve the evidence; the mainland intersection alone measures 406.686924 km². The final artifact must not be described as a complete island-level Dindings footprint. Small Sembilan components below the shared Natural Earth resolution are not invented; a precise historical delta half-island boundary cannot be established at this resolution. The 428.8 km² geometric result is not asserted to equal an official historic area estimate.

**G23 frontiers:** source-pixel traces now cover the pronounced northern Perak/Reman difference, western Kelantan, the Pahang–Kelantan/Terengganu frontier and Johor's northern frontier. The complete Kelantan external frontier is traced as well, including its northern/western portion now within Thailand and its ridge against Terengganu. FMS, Kelantan, Terengganu, Johor and Siam outputs share the same traced edges where they meet. Internal lines among Perak, Selangor, Negeri Sembilan and Pahang do not render because those four states dissolve into the same FMS holder. Existing Natural Earth edges elsewhere retain their declared approximation. The 1898 source is explicitly a close-period comparison for the 1896 frame; the map's own undefined-border marks and registration limits remain visible in the qualification.

**Sarawak 1896:** G34 clearly prints a pink Lawas/Clarke Province territory east of the blue Trusan and Limbang territories. Its western boundary is traced from the coast near Sundar, east of the Trusan valley, to the southern border. Intersecting the wanted east side with modern Natural Earth Sarawak gives the excluded **1,403.500108 km²** Lawas piece. Modern Sarawak minus this piece is **121,975.593900 km²**. The method retains Trusan (acquired in 1885) and Limbang (annexed in 1890), and places the excluded piece in **Brunei in K5 (1896)**. The 1903 map's Company ownership is *not* backcast into 1896; only its pre-1905 Lawas geometry is used as the close-period boundary approximation. K6 is after the 1905 acquisition and restores full Sarawak. Modern Lawas district was rejected as a shortcut because it also includes Trusan and would remove territory Sarawak already held in 1896.

The existing [Sarawak Government Limbang account, printed p.17](https://www.sarawak.gov.my/ebook/Limbang/files/basic-html/page19.html), and [official Lawas history](https://limbang.sarawak.gov.my/web/subpage/webpage_view/314/lawasdo), support the separate acquisition chronology. Neither source is used to invent a boundary.

## Generated areas

These are overlay geometry measurements, not census or administrative area statistics.

| Output | km² |
|---|---:|
| Dindings | 428.849815 |
| FMS 1896 | 72,729.638763 |
| FMS after 1909, before 1935 | 71,461.432235 |
| Johor 1896 | 19,242.379079 |
| Kedah 1896 | 8,637.309014 |
| Kelantan 1896 | 14,331.444917 |
| Terengganu 1896 | 13,185.736688 |
| Reman correction piece | 1,015.866214 |
| Lawas excluded before 1905 | 1,403.500108 |
| Sarawak 1896 | 121,975.593900 |

## Review and checks

`python3 scripts/geo/singapore-1819-1965/border-review.py` generates seven source-native ink/vertex review images in `work/border-review-*.png`. Each was visually inspected. They show the G23 Dindings, Pangkor, Pangkor Laut, FMS north, Johor north, complete Kelantan frontiers, and G34 Lawas line. Blue is the actual sampled trace and orange the durable source-pixel vertices. These are source review images, not application screenshots.

`pnpm check` after the helper fixes: **497 files, 0 errors, 0 warnings, 4 hints** (including zero errors in borders.ts). No build, e2e, shoot or commit was run. All 11 border outputs also passed shared ringIssues: zero zero-area rings and zero self-crossing rings. Root integration and final all-topic gates are recorded by the main session.

## Rejected candidates and limits

The 1896 Roth ethnographic map does not supply the political line needed here. The 1898 low-resolution whole-Borneo map is too small and its Brunei detail too generalized. The 1899 North Borneo map's Sarawak/Brunei detail is unsuitable. The FO572/2 map as reproduced/redrawn in the 2018 Lawas article was inspected but is a modern schematic and is not copied into geometry. These research candidates remain ignored raw/work files. G34's clear, public-domain 1903 original supplies the actual Lawas trace.

This closes the prior complete absence of Dindings, the incorrect inclusion of Lawas in 1896 Sarawak, and the large rendered G23 frontier mismatches. It does not claim survey-level historical boundaries or remove existing `approximate` qualifications.
