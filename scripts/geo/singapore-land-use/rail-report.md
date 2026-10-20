# Rail build — second pass

Accessed 20 October 2026. **37 published opening segments, 2,594 path vertices.** `movements.json` uses `persist: true`, `kind: land`, `holder: transport`, and matching `from`/`to`. English labels have Chinese `【待译】` drafts. The 1987 and Boon Lay chapter highlight IDs are retained.

## Geometry, licence and reproducibility

All route coordinates derive from URA Master Plan 2019 rail linework and station polygons; station-name annotation resolves old/missing names. No OSM, OneMap, commercial map, memory-drawn railway, planned 2026 opening or future JRL/CRL route is published. The MP 2019 file already includes the later TEL stages and NEL Punggol Coast alignment; those paths are activated only at independently verified passenger openings, rather than treating 2019 as their opening year.

| Input | Dataset / source | Features | SHA-256 |
|---|---|---:|---|
| `rail.geojson` | [URA / data.gov.sg](https://data.gov.sg/datasets/d_222bfc84eb86c7c11994d02f8939da8d/view) | 1366 | `a0fa38390d7a9d2ff9eaa1a88771c34352106142534b031bab256afc71dc5fc4` |
| `rail-stations.geojson` | [URA / data.gov.sg](https://data.gov.sg/datasets/d_8d886e3a83934d7447acdf5bc6959999/view) | 257 | `6153f2944065b3bcf81b45783b8a17bfbcc2f34db4f202d2b9c9c4c9172f20aa` |
| `rail-station-names.geojson` | [URA / data.gov.sg](https://data.gov.sg/datasets/d_bd17bca97549a4ab0fb7b6ad102d640c/view) | 217 | `e4e0d94f64dec533bcef67979c0614c4dcc00041d36a5351647dd860d9356e06` |

**Required attribution:** Contains information from Master Plan 2019 Rail Line layer, Master Plan 2019 Rail Station layer and Master Plan 2019 Rail Station Name layer accessed on 20 October 2026 from data.gov.sg which is made available under the terms of the [Singapore Open Data Licence version 1.0](https://data.gov.sg/open-data-licence).

`pnpm tsx scripts/geo/singapore-land-use/rail.ts` rebuilds from cached raw inputs, downloading missing files through the anonymous public data.gov.sg `poll-download` endpoint. The temporary signed download URL is never committed. Python dependencies are `shapely >= 2`, `scipy`, `networkx`; select the interpreter with `RAIL_PYTHON`. The existing ignored `work/layers-venv/bin/python` is used when available. Inputs and routes are reproducible; `work/rail-input-receipts.json` and `work/rail-metrics.json` retain receipts and per-route source OBJECTIDs.

Method: project to local metric coordinates (111,303 m/degree longitude, 110,574 m/degree latitude); retain source curvature with 2 m simplification; node source endpoints to projected nearby source linework within 65 m. Station interiors are missing from G6, so connect source endpoints/vertices within each official station outline buffered 70 m to that outline's centroid. Choose a continuous path through each ordered station list, resolving interchange polygons by total path length. These are explicitly station-derived connections, not independently surveyed tunnel coordinates. Maximum used seam connector is 64.49 m; maximum used station-to-rail spoke is 323.95 m at large station outlines. Final source-path simplification is 4 m, followed by densification to 150 m. Where a second published track is lateral (2.5–25 m), nearly parallel (absolute tangent dot product >0.97), and lateral offset/along-track ratio <0.3, use the two traces' midpoint. This centres 2,074 vertices; maximum shift 12.46 m. Round longitude/latitude to six decimals. A hairline route at island scale is indicative, not an engineering survey. Summed graph-path length 260.604 km is an internal geometry QA metric, not an official network-length statistic.

The `rail-overview.png` review plate under ignored `docs/screenshots/singapore-land-use/` was opened and visually reviewed for 1990,2003,2017 and 2025. Length QA caught and removed false graph detours at the NSL northward extension and at Mattar; final respective routes are 6.28 km and DTL 3 is 20.60 km. NEL HarbourFront–Punggol is 19.03 km and the Woodlands extension 15.84 km.

## Movement routes

Every row uses G6 geometry and the date evidence below. First-passenger days replace ceremonial dates when recoverable. `1996-02` and `2014-11` deliberately retain month precision; no candidate day from the old research register was automatically promoted.

| Movement ID | First passenger date / precision | Path km | Vertices | Date source and section |
|---|---|---:|---:|---|
| `nsl-toa-payoh-yio-chu-kang` | 1987-11-07 | 5.872 | 54 | [Ministry of Transport, Speech by Minister Khaw Boon Wan at Decommissioning of 66 First-Generation NSEWL Trains, paragraph 14](https://www.mot.gov.sg/news-resources/newsroom/speech-by-minister-khaw-boon-wan-at-decommissioning-of-66-first-generation-nsewl-trains/) |
| `nsl-toa-payoh-raffles-place` | 1987-12-12 | 7.648 | 78 | [National Heritage Board, The Mass Rapid Transit, All aboard!](https://www.roots.gov.sg/stories-landing/stories/the-mass-rapid-transit/story) |
| `ewl-raffles-place-outram-park` | 1987-12-12 | 2.011 | 22 | [National Heritage Board, The Mass Rapid Transit, All aboard!](https://www.roots.gov.sg/stories-landing/stories/the-mass-rapid-transit/story) |
| `ewl-outram-park-clementi` | 1988-03-13 | 9.511 | 91 | [NLB NewspaperSG, The Straits Times, 13 March 1988, p.2, “Rolling into the 90 s”](https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19880313-1) |
| `ewl-clementi-lakeside` | 1988-11-05 | 6.352 | 60 | [Ministry of Communications and Information / NAS, Speech at the opening of Section 4 of the MRT system at Jurong East Station, heading and first paragraph](https://www.nas.gov.sg/archivesonline/data/pdfdoc/ynh19881105s.pdf) |
| `nsl-yio-chu-kang-yishun` | 1988-12-20 | 6.276 | 59 | [NLB NewspaperSG, The Business Times, 24 November 1988, “Early opening for two stations”](https://eresources.nlb.gov.sg/newspapers/digitised/issue/biztimes19881124-1) |
| `ewl-city-hall-tanah-merah` | 1989-11-04 | 11.821 | 100 | [National Library Board, Eunos, paragraph before Author; reference 7](https://www.nlb.gov.sg/main/article-detail?cmsuuid=1d48db31-1bbc-42b0-91db-614c1e10515d) |
| `nsl-raffles-place-marina-bay` | 1989-11-04 | 0.917 | 9 | [MCI / NAS, Goh Chok Tong speech at commencement of passenger service, 4 November 1989, p.1](https://www.nas.gov.sg/archivesonline/data/pdfdoc/gct19891104s.pdf) |
| `ewl-tanah-merah-pasir-ris` | 1989-12-16 | 6.077 | 58 | [MCI / NAS, Goh Chok Tong speech, 4 November 1989, p.3; NLB BiblioAsia, “Bridging Past and Present in Pasir Ris”, note 37](https://www.nas.gov.sg/archivesonline/data/pdfdoc/gct19891104s.pdf) |
| `branch-jurong-east-choa-chu-kang` | 1990-03-10 | 6.492 | 61 | [NLB NewspaperSG, The Straits Times, 14 February 1990, p.3, “MRT to Bt Batok, Bt Gombak and Choa Chu Kang on Mar 10”](https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19900214-1) |
| `ewl-boon-lay-1990` | 1990-07-06 | 1.776 | 15 | [LTA, Circle Line Book, opening history: EWL reached Boon Lay on 6 July 1990](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/books/pdf/Circle_Line_Book.pdf) |
| `nsl-woodlands-extension` | 1996-02 | 15.837 | 140 | [NLB, “Woodlands MRT station”, Underground bus interchange; NLB NewspaperSG, 21 February 1996, “To the feast, by train” confirms passenger use that month](https://www.nlb.gov.sg/main/article-detail?cmsuuid=b986d0f4-b65f-4025-9854-0969c6b4e926) |
| `ewl-tanah-merah-expo` | 2001-01-10 | 1.896 | 20 | [SMRT Corporation, Annual Review 2001, printed p.27, Opening of Expo station](https://www.smrt.com.sg/getmedia/61dc9386-7f96-4d8d-9ae6-e373e5a02d0f/2001_AR.pdf?ext=.pdf) |
| `ewl-expo-changi-airport` | 2002-02-08 | 4.418 | 41 | [SMRT Corporation, Annual Report 2002, Our reach for greater convenience](https://www.smrt.com.sg/getmedia/d616a462-7d80-457d-a06b-b2513d6a27f7/2002_AR.pdf%3Fext%3D.pdf) |
| `nel-harbourfront-punggol` | 2003-06-20 | 19.029 | 172 | [SBS Transit, Annual Report 2003, Operations Review; Rail Business; Service Enhancements](https://www.sbstransit.com.sg/Uploads/Investor_Relations/Annual_Report/sbst_annualreport03.pdf) |
| `ewl-boon-lay-joo-koon` | 2009-02-28 | 3.445 | 35 | [SMRT Corporation, Annual Report 2009, MRT, Highlights in FY 2009](https://www.smrt.com.sg/getmedia/bff0d1e9-de22-474a-aaa5-0433ee08f1cb/2009_AR.pdf?ext=.pdf) |
| `ccl-bartley-marymount` | 2009-05-28 | 5.392 | 61 | [Land Transport Authority, Circle Line Book, Over to You](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/books/pdf/Circle_Line_Book.pdf) |
| `ccl-dhoby-ghaut-bartley` | 2010-04-17 | 10.433 | 97 | [Land Transport Authority, Circle Line Book, Over to You](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/books/pdf/Circle_Line_Book.pdf) |
| `ccl-marymount-harbourfront` | 2011-10-08 | 16.339 | 172 | [SMRT Corporation, Annual Report 2012, Operating and Financial Review, Circle Line](https://www.smrt.com.sg/getmedia/6d890d93-79eb-442b-b318-4dc0a1921a12/2012_AR.pdf?ext=.pdf) |
| `ccl-promenade-marina-bay` | 2012-01-14 | 2.095 | 19 | [SMRT Corporation, Annual Report 2012, Operating and Financial Review, Circle Line](https://www.smrt.com.sg/getmedia/6d890d93-79eb-442b-b318-4dc0a1921a12/2012_AR.pdf?ext=.pdf) |
| `dtl-bugis-chinatown` | 2013-12-22 | 4.171 | 41 | [Land Transport Authority, Downtown Line, Stages 1, 2 and 3: Opening date](https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network/downtown_line.html) |
| `nsl-marina-bay-marina-south-pier` | 2014-11 | 1.119 | 12 | [LTA Annual Report 2014/15, printedp.36 caption: opened inNovember 2014](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/report/pdf/LTA_AR_14-15_RGB.pdf) |
| `dtl-bukit-panjang-bugis` | 2015-12-27 | 14.920 | 141 | [Land Transport Authority, Downtown Line, Stages 1, 2 and 3: Opening date](https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network/downtown_line.html) |
| `ewl-joo-koon-tuas-link` | 2017-06-18 | 6.800 | 66 | [MOT, Ng Chee Meng speech, 16 June 2017, paragraph 3: passenger service 18 June](https://www.mot.gov.sg/news-resources/newsroom/speech-by-second-minister-ng-chee-meng-at-tuas-west-extension-opening-ceremony/) |
| `dtl-chinatown-expo` | 2017-10-21 | 20.602 | 212 | [Land Transport Authority, Downtown Line, Stages 1, 2 and 3: Opening date](https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network/downtown_line.html) |
| `tel-woodlands-north-woodlands-south` | 2020-01-31 | 2.853 | 31 | [Land Transport Authority, Thomson-East Coast Line, Location of stations, Stage 1](https://www.lta.gov.sg/content/ltagov/en/upcoming_projects/rail_expansion/thomson_east_coast_line.html/1000) |
| `tel-woodlands-south-caldecott` | 2021-08-28 | 13.409 | 132 | [LTA factsheet, 27 August 2021, paragraph 1: ceremonytoday and passenger servicetomorrow](https://www.lta.gov.sg/content/ltagov/en/newsroom/2021/8/news-releases/TEL2_to_welcome_commuters_from_28Aug21.html) |
| `tel-caldecott-gardens-by-the-bay` | 2022-11-13 | 13.095 | 141 | [Land Transport Authority, TEL 3 Hits the City: Get fed, get fit and overall, feel fab!, opening and closing paragraphs](https://www.lta.gov.sg/content/ltagov/en/who_we_are/statistics_and_publications/Connect/tel3hitsthecity.html) |
| `tel-gardens-by-the-bay-bayshore` | 2024-06-23 | 10.628 | 108 | [Land Transport Authority, Annual Report 2024/25, printed pp.14,16, Key Highlights](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/report/pdf/LTA%20AR2024_25%20PDFa%20%28web%29.pdf) |
| `nel-punggol-punggol-coast` | 2024-12-10 | 1.531 | 16 | [Land Transport Authority, Factsheet: Punggol Coast Station Welcomes Commuters from 10 December 2024, paragraph 1](https://www.lta.gov.sg/content/ltagov/en/newsroom/2024/12/news-releases/punggol_coast_station_welcomes_commuters.html) |
| `bplrt-initial` | 1999-11-06 | 2.810 | 33 | [National Library Board, First Light Rail Transit system, The pilot LRT system – Bukit Panjang](https://www.nlb.gov.sg/main/article-detail?cmsuuid=fe1e33e6-6770-4f4b-a800-51def14c2c04) |
| `bplrt-loop` | 1999-11-06 | 4.809 | 65 | [National Library Board, First Light Rail Transit system, The pilot LRT system – Bukit Panjang](https://www.nlb.gov.sg/main/article-detail?cmsuuid=fe1e33e6-6770-4f4b-a800-51def14c2c04) |
| `sklrt-east` | 2003-01-18 | 4.457 | 52 | [SBS Transit, Annual Report 2003, Operations Review; Rail Business; Service Enhancements](https://www.sbstransit.com.sg/Uploads/Investor_Relations/Annual_Report/sbst_annualreport03.pdf) |
| `sklrt-west` | 2005-01-29 | 6.229 | 66 | [SBS Transit, 10 January 2005, revenue-service release, Sengkang Operation Details; AnnualReport 2004 printedp.24](https://web.archive.org/web/20190830050757/https://www.sbstransit.com.sg/press/2005jan_10-3.aspx) |
| `pglrt-east` | 2005-01-29 | 5.181 | 62 | [SBS Transit, 10 January 2005, revenue-service release, Punggol Operation Details; AnnualReport 2004 printedp.24](https://web.archive.org/web/20190830050757/https://www.sbstransit.com.sg/press/2005jan_10-3.aspx) |
| `pglrt-west-initial` | 2014-06-29 | 1.781 | 23 | [SBS Transit, Punggol West LRT System to Commence Passenger Service and North East Line to Add More Train Trips, paragraphs 1,2,5–8](https://www.sbstransit.com.sg/news/punggol-west-lrt-system-to-commence-passenger-service-and-north-east-line-to-add-more-train-trips) |
| `pglrt-west-sam-kee` | 2016-02-29 | 2.572 | 29 | [SBS Transit, Sam Kee Station on Punggol LRT System to open for Passenger Services, paragraphs 1,4,7](https://www.sbstransit.com.sg/news/sam-kee-station-on-punggol-lrt-system-to-open-for-passenger-services) |

## Second-pass date resolutions

- **Clementi corrected to 13 March 1988.** NLB NewspaperSG, *The Straits Times*,13 March 1988,p.2, “Rolling into the 90s”, says “Today: Service now extends westwards to Clementi.” This supersedes the 12 March inauguration locator; that ceremony remains a separate milestone.
- **Marina Bay and Pasir Ris:** NAS `gct19891104s.pdf`,p.1, explicitly identifies commencement of passenger service and the Marina Bay–Tanah Merah stretch on 4 November 1989;p.3 announces the Pasir Ris extension for 16 December. NLB's Pasir Ris BiblioAsia article confirms December and identifies “3 Stations Open Today”,16 December 1989,p.30.
- **Boon Lay:** LTA *Circle Line Book* explicitly dates the EWL reaching Boon Lay to 6 July 1990, corroborating the NAS completion speech; use that LTA route-history evidence rather than the ceremonial heading alone.
- **Woodlands:** NLB's station article dates its ceremony to 10 February 1996; “To the feast, by train”, *The Straits Times*,21 February 1996, describes actual recent passenger use. Month precision is supported; a distinct first-passenger day remains unverified.
- **Marina South Pier:** LTA Annual Report 2014/15, printedp.36, explicitly dates its opening toNovember 2014. The candidate 23 November day has not been promoted from secondary locators.
- **Tuas:** MOT's16 June 2017 opening speech,paragraph 3, explicitly says passenger service starts 18 June, separating ceremony and service.
- **2005 loops:** archived SBS release was fetched anonymously in full and read, including both Operation Details sections; SBS Annual Report 2004 printedp.24 independently states that revenue service commenced 29 January 2005. Clockwise/anticlockwise loop operations pass closed station stops; station openings are not extra new track.

## Limitations and omissions

- Today’s indicative alignments stand for earlier passenger corridors; later realignments (including Bishan platform works) are not reconstructed from historical engineering plans.
- The closed Ten Mile Junction spur is omitted: its changing service/closure intervals are not verified here, and a permanently persisted 1999 route would mislead. BPLRT trunk and town loop are separate same-day geometries.
- The 2014 Punggol West movement covers Punggol–Soo Teck–Sumang–Nibong; the temporary Nibong return crossover is omitted because no separate, dated open geometry was verified. The northern Sam Kee–Teck Lee–Punggol Point–Samudera–Nibong section appears in 2016, when SBS explicitly documents continuous service past the unopened stops. No whole West Loop is painted in 2014.
- Dover, Canberra, Hume, Buangkok, Woodleigh and later LRT station stops do not add new route lengths and are not separate movements. They never postpone already operating through-track. Closed Mount Pleasant, Marina South and Bukit Brown stops likewise do not delay through rail.
- Several operator annual reports / releases and contemporary MOT/NAS records supplement the brief's preferred LTA/NLB date sources; this is a disclosed provenance exception, not a claim that every date came from LTA/NLB.
- The two exact service days above remain unverified. Candidate station-only dates in the earlier research register remain unverified but do not control these movement geometries.
- No licence gap for published rail coordinates: all three geometry inputs explicitly link SODL. Source articles/reports provide facts only; no map artwork from those publications is copied.
- Topic-wide validate/check/ring gates belong to the parent integration pass; local rebuild assertions require 37 nonempty LineStrings and fail on missing/disconnected station sequences. Final data has unique IDs, finite Singapore coordinates and equal `from`/`to`.

## Per-route source feature audit

G6 source `OBJECTID`s used along each route before midpoint centring and station closure; all centring references remain in the same G6 input. The builder also retains the ordered station names and connector metrics in ignored `work/rail-metrics.json`.

- `nsl-toa-payoh-yio-chu-kang`: 410, 413, 415, 416, 481, 484, 504, 509, 971
- `nsl-toa-payoh-raffles-place`: 23, 25, 27, 29, 482, 510, 511, 907, 908, 909, 910
- `ewl-raffles-place-outram-park`: 18, 912, 913
- `ewl-outram-park-clementi`: 93, 560, 564, 565, 566, 579, 664, 665, 667, 668, 709
- `ewl-clementi-lakeside`: 706, 713, 714, 715, 801
- `nsl-yio-chu-kang-yishun`: 13, 52, 414, 418
- `ewl-city-hall-tanah-merah`: 21, 92, 446, 447, 448, 450, 453, 454, 467, 469, 545, 548, 549, 551, 956, 961
- `nsl-raffles-place-marina-bay`: 914
- `ewl-tanah-merah-pasir-ris`: 428, 431, 433, 436, 442, 1354
- `branch-jurong-east-choa-chu-kang`: 687, 695, 696, 699, 701, 704, 716, 719
- `ewl-boon-lay-1990`: 676
- `nsl-woodlands-extension`: 4, 6, 8, 10, 11, 16, 43, 45, 291, 684, 1052, 1125, 1229
- `ewl-tanah-merah-expo`: 440, 441, 1222
- `ewl-expo-changi-airport`: 426, 432, 439
- `nel-harbourfront-punggol`: 31, 33, 35, 37, 331, 402, 486, 488, 550, 554, 670, 837, 840, 841, 865, 867, 930, 938, 947, 949, 952, 1240, 1242, 1243
- `ewl-boon-lay-joo-koon`: 675, 763, 803, 804, 805
- `ccl-bartley-marymount`: 333, 406, 423, 478, 505, 970
- `ccl-dhoby-ghaut-bartley`: 22, 53, 54, 56, 320, 458, 461, 462, 464, 541, 543, 544, 902, 903, 946
- `ccl-marymount-harbourfront`: 501, 506, 514, 517, 518, 519, 521, 522, 533, 568, 578, 580, 582, 583, 591, 593, 595, 599, 611, 614, 617, 633, 639, 644, 648, 869, 978, 1000, 1001, 1003, 1008, 1009, 1012, 1014, 1022, 1024, 1026, 1027, 1028, 1032, 1046, 1048, 1053, 1055, 1329
- `ccl-promenade-marina-bay`: 71, 75
- `dtl-bugis-chinatown`: 63, 67, 68, 75, 87
- `nsl-marina-bay-marina-south-pier`: 79, 114
- `dtl-bukit-panjang-bugis`: 95, 97, 99, 101, 103, 105, 276, 278, 280, 281, 296, 298, 300, 303, 304, 305, 308, 310, 1362, 1363, 1364, 1365
- `ewl-joo-koon-tuas-link`: 202, 204, 210, 211, 217, 218, 227, 232, 237, 242, 244, 250, 251, 253, 254, 262, 267, 270, 674
- `dtl-chinatown-expo`: 122, 123, 125, 127, 130, 132, 134, 137, 138, 140, 141, 143, 144, 145, 148, 152, 165, 167, 175, 179, 182, 187, 193, 199, 286, 963, 993, 1220, 1235, 1238, 1352
- `tel-woodlands-north-woodlands-south`: 737, 742, 895
- `tel-woodlands-south-caldecott`: 491, 499, 750, 751, 757, 824, 825, 827, 829, 830, 846, 847, 851, 852, 853, 855, 857, 900, 987, 988, 989, 999, 1059, 1060, 1338, 1343
- `tel-caldecott-gardens-by-the-bay`: 93, 767, 769, 771, 777, 781, 783, 784, 785, 786, 787, 812, 815, 817, 821, 889, 891
- `tel-gardens-by-the-bay-bayshore`: 792, 795, 1084, 1087, 1099, 1143, 1147, 1212, 1214, 1244, 1245
- `nel-punggol-punggol-coast`: 918, 1339
- `bplrt-initial`: 682, 683, 685, 688, 691, 697, 700, 731
- `bplrt-loop`: 721, 722, 723, 724, 727, 728, 733, 734, 765
- `sklrt-east`: 339, 344, 361, 363, 365, 934, 940
- `sklrt-west`: 335, 345, 350, 351, 353, 357, 359, 360, 362, 366, 935
- `pglrt-east`: 372, 376, 377, 386, 388, 391, 392, 920, 922
- `pglrt-west-initial`: 387, 395, 921
- `pglrt-west-sam-kee`: 383, 384, 397, 399, 922
