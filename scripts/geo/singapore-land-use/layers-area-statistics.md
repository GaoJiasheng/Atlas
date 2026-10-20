# Calculated MP2019 areas and current HDB floor medians

Method: SVY21 EPSG:3414 area; source areas projected from real geometry. Category geometry dissolved after clipping to decoded L11 land. Shares exclude ROAD/WATERBODY and are permissible planned-use categories, not observed activity. Floor medians are calculated from all residential=Y current Property Information rows, not only geolocated matches.

| LU_DESC | Features | Projected source geometry km² | Official SHAPE.AREA km² | Category |
|---|---:|---:|---:|---|
| AGRICULTURE | 239 | 6.052121 | 6.052121 | agriculture |
| BEACH AREA | 35 | 0.747608 | 0.747607 | green |
| BUSINESS 1 | 1505 | 7.556252 | 7.556243 | industry |
| BUSINESS 1 - WHITE | 45 | 0.387219 | 0.387219 | industry |
| BUSINESS 2 | 5976 | 110.459197 | 110.458656 | industry |
| BUSINESS 2 - WHITE | 14 | 0.174977 | 0.174977 | industry |
| BUSINESS PARK | 200 | 3.052692 | 3.052617 | industry |
| BUSINESS PARK - WHITE | 12 | 0.221247 | 0.221246 | industry |
| CEMETERY | 17 | 3.596548 | 3.596517 | town-and-services |
| CIVIC & COMMUNITY INSTITUTION | 629 | 6.284764 | 6.284750 | town-and-services |
| COMMERCIAL | 5983 | 5.235338 | 5.235332 | town-and-services |
| COMMERCIAL & RESIDENTIAL | 905 | 5.089327 | 5.089335 | housing |
| COMMERCIAL / INSTITUTION | 533 | 0.136059 | 0.136059 | town-and-services |
| EDUCATIONAL INSTITUTION | 608 | 18.097837 | 18.097719 | town-and-services |
| HEALTH & MEDICAL CARE | 195 | 2.296509 | 2.296512 | town-and-services |
| HOTEL | 285 | 1.562796 | 1.562804 | town-and-services |
| LIGHT RAPID TRANSIT | 15 | 0.016549 | 0.016549 | transport |
| MASS RAPID TRANSIT | 49 | 0.340077 | 0.340076 | transport |
| OPEN SPACE | 762 | 102.266193 | 102.266174 | green |
| PARK | 1425 | 27.696052 | 27.695622 | green |
| PLACE OF WORSHIP | 645 | 1.644891 | 1.644883 | town-and-services |
| PORT / AIRPORT | 49 | 43.572386 | 43.572404 | transport |
| RESERVE SITE | 665 | 93.379705 | 93.379225 | town-and-services |
| RESIDENTIAL | 79122 | 129.165890 | 129.166162 | housing |
| RESIDENTIAL / INSTITUTION | 960 | 0.278322 | 0.278322 | housing |
| RESIDENTIAL WITH COMMERCIAL AT 1ST STOREY | 2821 | 2.190944 | 2.190950 | housing |
| ROAD | 6623 | 82.122012 | 82.122847 | excluded |
| SPECIAL USE | 61 | 46.968671 | 46.968747 | defence-special |
| SPORTS & RECREATION | 241 | 17.380284 | 17.380289 | town-and-services |
| TRANSPORT FACILITIES | 349 | 6.025207 | 6.025322 | transport |
| UTILITY | 1067 | 14.329031 | 14.329098 | town-and-services |
| WATERBODY | 1015 | 43.062781 | 43.062885 | excluded |
| WHITE | 163 | 3.459861 | 3.459867 | town-and-services |

COMMERCIAL / INSTITUTION is placed explicitly in town-and-services. No source feature has LU_DESC NATURE RESERVE. The countryside category is only in K1, so it has zero MP2019 mapped area.

| Planned-use category | Area clipped/dissolved to L11 km² | % mapped categories |
|---|---:|---:|
| housing | 136.709688 | 20.741 |
| town-and-services | 167.267331 | 25.378 |
| green | 130.431130 | 19.789 |
| industry | 121.788360 | 18.478 |
| transport | 49.906651 | 7.572 |
| defence-special | 46.963258 | 7.125 |
| agriculture | 6.046228 | 0.917 |

| Completion decade | Current residential property rows | Median maximum floor level |
|---|---:|---:|
| 1930s | 22 | 3.0 |
| 1940s | 30 | 4.0 |
| 1950s | 43 | 2 |
| 1960s | 285 | 10 |
| 1970s | 1270 | 13.0 |
| 1980s | 3341 | 12 |
| 1990s | 2686 | 14.0 |
| 2000s | 869 | 17 |
| 2010s | 1456 | 16.0 |
| 2020s | 815 | 16 |

Sources: URA Master Plan 2019 Land Use G2, URA Planning Area Boundary (No Sea) G3 via decoded L11 outline, HDB Property Information G4; data.gov.sg / Singapore Open Data Licence v1.0. All calculations by the Atlas build, 20 October 2026.
