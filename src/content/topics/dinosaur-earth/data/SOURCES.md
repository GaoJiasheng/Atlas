# Dinosaur Earth — data and numerical source ledger

Research/snapshots: **2026-10-26**. Editorial source access/reverification: **2026-10-27**. The fixed dataset snapshot date is not the site's current fetch date. The application makes no external data requests.

Full source→algorithm→asset audit, per-frame hashes and validation: [SOURCES-GEO](../../../../../scripts/geo/dinosaur-earth/SOURCES-GEO.md), [build report](../../../../../scripts/geo/dinosaur-earth/build-report.json), [retained-record PBDB bibliography](../../../../../scripts/geo/dinosaur-earth/publication-references.json).

## Runtime source aliases

The project source schema requires `S` followed by a positive integer. The content spec's DE source labels map to these runtime IDs; the identity and attribution are unchanged.

| Spec label | Runtime ID | Scope |
|---|---|---|
| S29; DE-S03 / DE-S07 | S29 | Scotese/Wright PaleoDEM v2; CSV source members / topology audit |
| DE-S01 | S61 | LPI modern Chicxulub location |
| DE-S02 | S62 | USGS Pangaea explanation |
| DE-S04 | S64 | Natural Earth modern countries/land and Singapore label anchor |
| DE-S05 | S65 | PBDB bounded global snapshot |
| DE-S06 | S66 | PBDB regional snapshot |

## Reconstructed land (S29)

Scotese & Wright, PALEOMAP PaleoDEMs v2, <https://zenodo.org/records/5460860>, CC BY 4.0. Ten actual numeric sample ages: **250, 230, 200, 170, 150, 130, 100, 70, 65, 0 Ma**. No 66 Ma sample exists. The netCDF archive has 109 members, which does not replace the publisher description's count of 117 models. The build uses only verified CSV bytes, not unparsed netCDF arrays.

The first five grids each have **64,800 rows**, dimensions 180×360, coordinate extents [-180,-89,179,90]. The remaining five each have **65,341 rows**, 181×361, extents [-180,-90,180,90]. Grid spacing is **1°**, not a measure of location accuracy. The elevation/bathymetry unit is metres. **z>0** is the chosen exposed-land threshold; exact zero is grouped with non-land and labelled uncertain at sea level. K70 has **3023** exact-zero samples. Source seam land-sign mismatches are preserved (K0 **6**, K100 **25**); the map is not a seamless globe.

Nearest-sample categorical cells have interior half-width **0.5°**; maximum planar cell-to-sample distance √0.5°. Land is clipped to **±85.051129°** for Mercator. Old-grid +179…+180° is an explicit unavailable strip. Coast lines exclude source-domain, crop and unavailable edges. These are cartographic choices (DS01), not ancient observations. Simplification removes only collinear vertices with **0°** added displacement. No measured ancient shoreline residual is claimed. Main-map maximum zoom **3.6** is a design choice.

The 66 Ma selected event displays the actual 70 Ma sample and **Δ4 Ma**. At 65 Ma the sample is 65 Ma. At selected 32.5 Ma the older provided sample is 65 Ma and **Δ32.5 Ma**, with the missing-intermediate-sample notice. Time selection is discrete hold-older, not a continuous drift simulation.

## Modern collection records (S65 / S66; CC0)

The two original CSV responses explicitly declare Creative Commons CC0, <https://creativecommons.org/publicdomain/zero/1.0/>. Retain PBDB contributor/database credit and the original publication references. The public retained-record bibliography is linked above and included offline in `public/geo/de-pbdb-references.json` (815original reference strings keyed by PBDB reference number); `de-modern-inset.json` binds this file with `referenceFile`. Per-occurrence records carry the matching original reference number, so inspector details can show the full citation without an external request. No database licence is inferred from an older API paper.

Exact global snapshot query:

```text
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&show=coords,loc,strat,ref&limit=2000&order=agespan
```

Exact regional snapshot query:

```text
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&cc=TH,LA,MY&show=coords,loc,strat,ref&limit=5000
```

The global snapshot returns **2000 of 21720** matching occurrences, sorted by age-span, with **1224 collections**. It is bounded and geographically unrepresentative. The regional query returns **167/167 occurrences**, **90 collections**: TH141, LA23, MY3. This is completeness for that exact query at retrieval, not all regional dinosaur evidence.

Union by occurrence ID gives **2106** unique records; duplicate count **61**. Suppress every MY fossil occurrence before aggregation: **3 occurrences / 3 collections** removed. Public result: **2103 occurrences / 1274 collections / 61 countries**. The count is a selected record, never a dinosaur census, species-richness measure or country ranking. Raw Malaysian IDs, coordinates, locality descriptions and reversible precise-location fields never enter publication assets. Pahang is a text-only region card with no point, radius or centroid.

A collection has one marker and can include multiple occurrences. Collection **24178** has **3 occurrences**, each with original bounds **121.4–100.5 Ma**. Other collections preserve every occurrence interval independently; gaps are not filled by taking an envelope. Ages use closed interval intersection with the chosen browsing window **±5 Ma** (DS02), which is a UI selection rather than measurement error or a claimed lifespan. At q66 the window is [61,71]; at q70 [65,75]. All-mesozoic mode shows selected finds of different ages, not simultaneous communities. Coordinates are modern publication positions, never palaeocoordinates or migration paths.

## Modern reference geometry and locators (S31 / S64 / S61)

Natural Earth data are public domain: <https://www.naturalearthdata.com/about/terms-of-use/>. 110m land source v4.1.0: <https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip>. 50m countries v5.1.1: <https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip>. Modern land includes 127 real features /128 rings; 15 relevant country features contain264 rings. Source rounding to6 decimal degrees is at most approximately0.079m diagonal at equator, separate from source map accuracy. These files are modern-inset-only.

Singapore **[103.816925,1.366587]** comes from source LABEL_X/LABEL_Y: a modern cartographic label anchor, not a find coordinate, city centroid or museum address. Chicxulub **[-89.5,21.333333]** comes from LPI's21°20′N/89°30′W (S61): approximate modern location, not an ancient point or crater outline. The crater's66Ma event age comes from S11/S01, not the locator page's obsolete age/diameter.

Cards deliberately use the source's stated precision: Thailand Nakhon Ratchasima region (S20; Early Cretaceous/Aptian Khok Kruat), Laos country (S21; Early Cretaceous, partial postcranial remains), Pahang region (S22; teeth and locality protection), Wyoming→Singapore region narrative (S17/S57; Jurassic Morrison, museum diplodocid sauropods). Their stratigraphic ages are independent of the displayed main-map sample. There is no transportation line, invented centroid or exact age assigned to these cards.

## Other scientific quantities and design counts

| Quantity | Source / scope |
|---|---|
| Mesozoic251.902–66.00Ma; Triassic/Jurassic201.4±0.2; Jurassic/Cretaceous143.1±0.6; oldest boundary251.902±0.024 | S01, ICS2026/06; values can be revised; not copied as every fossil's uncertainty |
| Established dinosaur records by about230Ma | S52 original transcript; no claim all earlier candidates are ruled out |
| About66Ma non-avian dinosaur extinction; some bird lineages survive | S11/S01; all dinosaurs did not disappear |
| About10km impactor; crater about180–200km | S13 original full text introduction; no averaging with conflicting old locator-page values |
| Three forward toe marks, five main schematic rock layers, one conceptual asteroid | DS03 illustration design only, not specimen classification, measured ages or impactor shape |
| 35 beats, background+7 chapters; camera/view bounds; ±5Ma window | Editorial/design values, not measured natural facts |

## Licence families

Every file stays in its own family under docs/next-batch §三: PaleoDEM-derived frame geometry **Atlas CC BY-NC-SA4.0** (upstream **CC BY4.0**, attribution retained); PBDB-derived records and offline bibliography **CC0**; Natural Earth geometry **public domain**; original editorial reference text/manifests **Atlas CC BY-NC-SA4.0**. No CC BY-SA or licence requiring an agreement is used. The whole site's content licence does not override upstream CC0/PD/CC BY assets. Original research data remain read-only, ignored and outside the deployment.

Final publication update:18public `de-*.json` files total1,924,316bytes, including the194,623-byte offline bibliography and918,555-byte collection file. Geometry is unchanged. With the separately measured roughly28KBtopic payload the combined data remains below decimal2MB; exact topic bytes are recorded by the root integration task. Original precision codes are retained and all six coordinate-basis labels have Chinese translations.
