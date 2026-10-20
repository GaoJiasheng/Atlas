"""Generate the current geographic audit and second-pass handoff from final assets."""
import json,re,gzip,hashlib
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import transform,unary_union
from pyproj import Transformer
P=Path(__file__).parent;TOP=Path('src/content/topics/singapore-land-use');W=P/'work'
read=lambda f:json.load(open(f))
stats=read(P/'coast-statistics.json');packing=read(P/'coast-packing.json');fit=read(W/'lines-fit.json')['bis1959'];proj=Transformer.from_crs(4326,3414,always_xy=True)
areas={}
for e in ['L4','L5','L6','L7','L8','L9','L10','L11']:
 fc=read(W/f'coast-{e}.geojson');areas[e]=transform(proj.transform,unary_union([shape(f['geometry']) for f in fc['features']])).area/1e6
(P/'published-coast-areas.json').write_text(json.dumps(areas,indent=2))
files=[TOP/'data/control.json',Path('public/geo/land-sg-modern.json')]+[Path('public/geo')/f'sg-{x}.json' for x in ['hdb-blocks','estates','farm-parks','reserves','reservoirs']]
budget='| File | Bytes | gzip -9 bytes | Budget |\n|---|---:|---:|---|\n'
for f in files:
 b=f.read_bytes();limit='1.2 MiB raw' if f.name=='control.json' else '250 KiB raw' if f.name=='land-sg-modern.json' else '300 KB gzip' if 'hdb' in f.name else '400 KB raw, all four area files combined'
 budget+=f'| `{f.name}` | {len(b):,} | {len(gzip.compress(b,mtime=0)):,} | {limit} |\n'
scene='| Era | Scene ID (STAC item) | Date | Scene / island QA cloud % | Bands and index | Otsu threshold |\n|---|---|---|---:|---|---:|\n'
accuracy='| Era | Acquisition / reference | Published land km² | Difference to L11 km² | Diagnostic p50 / p95 m | Samples |\n|---|---|---:|---:|---:|---:|\n'
for e in ['L4','L5']:
 accuracy+=f'| {e} | Inherited G11 approximate outline | {areas[e]:.3f} | {areas[e]-areas["L11"]:.3f} | Not requalified | — |\n'
for r in stats:
 scene+=f'| {r["era"]} | `{r["id"]}` | {r["date"]} | {r["scene_cloud_pct"]:.2f} / {r["island_cloud_shadow_pct"]:.2f} | {r["bands"]}; {r["index"]} | {r["threshold"]:.8f} |\n'
 e=r['era'];accuracy+=f'| {e} | {r["date"]} | {areas[e]:.3f} | {areas[e]-areas["L11"]:.3f} | {r["unchanged_p50_m"]:.2f} / {r["unchanged_p95_m"]:.2f} | {r["unchanged_samples"]} |\n'
accuracy+=f'| L11 | URA MP2019 outline, from 2019-11-18 | {areas["L11"]:.3f} | 0.000 | Reference only | — |\n'
# Geographical name correspondence is not a surveyed project-footprint join.
projects={
 'Tuas':('https://www.jtc.gov.sg/about-jtc/dream-factories','JTC Dream Factories; broad development history'),
 'Jurong Island':('https://www.jtc.gov.sg/about-jtc/dream-factories','JTC Dream Factories; seven-island reclamation/opening'),
 'Marina Bay':('https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/','URA Marina Bay, History and beginnings; 1971–1994 reclamation'),
 'Semakau':('https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill','NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015'),
}
def match(c):
 x,y=c
 if x<103.65 and y<1.33:return 'Tuas'
 if 103.65<x<103.725 and 1.23<y<1.29:return 'Jurong Island'
 if 103.84<x<103.89 and 1.25<y<1.30:return 'Marina Bay'
 if 103.75<x<103.79 and 1.18<y<1.22:return 'Semakau'
 return None
pieces='| Era | Kind / piece | Area km² | Centroid lng, lat | Named correspondence / unresolved |\n|---|---|---:|---|---|\n'
for r in stats:
 for p in r['pieces']:
  m=match(p['centroid']);label=f'Candidate {m} — [{projects[m][1]}]({projects[m][0]}); not a dated footprint match' if m else 'unmatched'
  p['project']=label;pieces+=f'| {r["era"]} | {p["kind"]} {p["piece"]} | {p["km2"]:.4f} | {p["centroid"][0]}, {p["centroid"][1]} | {label} |\n'
(P/'coast-statistics.json').write_text(json.dumps(stats,indent=2))
manifest=read(P/'sources.json')
source_table='| Source | Dataset | Licence |\n|---|---|---|\n'
for key,ds in manifest['datasets'].items():
 if key.startswith('coast-'):continue
 source_table+=f"| {ds['ref']} | [{ds['title']}]({ds['url']}) | {ds['license']} |\n"
text=f'''# Singapore land use — geographic audit, second pass

Built on 20 October 2026. **Draft; geographic accuracy is not accepted.** The required software gates are separate from the remaining K1 control-point and coastline accuracy requirements. Earlier access findings are retained in CODEX-REPORT.md and research/landsat-access.json.

## Source ledger and licences

{source_table}

Additional inherited sources:

- **G9:** USGS Landsat Collection 2 through the anonymous [Planetary Computer STAC API](https://planetarycomputer.microsoft.com/api/stac/v1). Exact scene IDs, bands, cloud measurements and thresholds appear below. Images courtesy of the U.S. Geological Survey, public domain.
- **G10:** canonical four-taps reservoir geometry, names and dates. Singapore water surfaces are URA SODL; name matching and the Linggiu outline use **© OpenStreetMap contributors**, [ODbL 1.0](https://www.openstreetmap.org/copyright). Database obligations remain in force.
- **G11:** decoded L4/L5 from `public/geo/land-sg-history.json`, unchanged upstream. Public-domain British maps, URA SODL and inherited OSM name selectors. The upstream audit calls these **rejected research drafts**. L4 uses a 1937 source; L5 includes earlier chart corrections and is not a certified 1961 survey. This topic preserves that limitation.
- **G13:** historical topic Admiralty charts G14–G17 copied read-only to ignored refs/. Chart 2014, published in 1966, was visually inspected: the separate Jurong islands broadly correspond to the early satellite pattern. Publication, survey and correction dates differ. No chart geometry was newly traced. TPC 1984 was not newly fetched; this independent check remains incomplete.

The [Singapore Open Data Licence 1.0](https://data.gov.sg/open-data-licence) permits reuse and adaptation with attribution and a current licence link. Catalogue wording: “Free forever for personal or commercial use, under the Open Data Licence.” Contains information from the URA, HDB, NParks and statistical datasets listed above, accessed on 20 October 2026 from data.gov.sg, made available under the Singapore Open Data Licence version 1.0. Per-file timestamps, SHA-256 hashes and source URLs are retained in fetch-receipts.json, dated-layers-report.md and rail-report.md.

No NAS, NUS/SLA, journal or SFA annex map artwork was traced or published. References in ignored refs/ are look-only. Text citations do not grant artwork reuse rights. Natural Earth background context is public domain and unchanged. The topic's content licence does not replace SODL or ODbL obligations.

## Landsat access and selection

The [USGS cloud public-domain FAQ](https://www.usgs.gov/faqs/are-landsat-data-cloud-still-considered-be-within-public-domain) states: “Permission is not required for use.” USGS requests acknowledgement. Its [redistribution FAQ](https://www.usgs.gov/faqs/are-there-any-restrictions-use-or-redistribution-landsat-data) confirms unrestricted use. [MPC SAS documentation](https://planetarycomputer.microsoft.com/docs/concepts/sas/) allows anonymous issuance. Collection token requests returned HTTP 200 and signed TIFF byte ranges returned 206. Native-resolution windows were read without an account, billing project or requester-pays access. Tokens and signed URLs were not retained.

Microsoft's [access-service terms](https://planetarycomputer.microsoft.com/terms) apply separately from data copyright. The retained indexed terms include “Previews are provided solely for evaluation and testing.” Tokens cannot be transferred. Direct HTML is a JavaScript shell; the complete terms are linked rather than reproduced. The user's second-pass instruction explicitly permits TM/ETM+ Level 2 products, superseding the earlier Level-1-only access stop.

{scene}

All returned corrected MSS and TM/ETM+ candidates in the recorded date windows were screened over Singapore; scene-wide cloud percentages alone did not determine selection. See scene-cloud.json. No 1981 L1TP scene was returned, so L7 uses 1979. A lower-cloud L1GS item was rejected because it lacks terrain precision correction. The lowest-QA 1992 and 2009 TM scenes were rejected after visual inspection showed severe haze and poor shore classification; 1991 and 2011 are disclosed substitutes. Tide levels could not be verified or matched. Acquisition UTC times remain in the STAC receipts.

## Reproducible water-detection method

`landsat-coast.ts` runs the topic-local Python raster method. MSS NDWI = (green B4 − NIR B7) / (green B4 + NIR B7), using MTL reflectance multipliers and offsets. The shared solar-elevation factor cancels. B7 covers 0.8–1.1 µm; see [USGS band designations](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites) and the [USGS Landsat handbook](https://pubs.usgs.gov/gip/70039196/report.pdf). TM/ETM+ MNDWI uses SR_B2 and SR_B5; reflectance = DN × 0.0000275 − 0.2.

Otsu thresholds are computed on valid, clear pixels within 2 km of the original G3 outer coast, excluding inland reservoir shores. The lower-index class is land. QA bits 1, 3 and 4 identify dilated cloud, cloud and shadow. Unknown/cloud pixels conservatively retain today's land status; this is **not an observation of historical land beneath cloud**. A 3 × 3 closing fills one-pixel gaps.

Vectorise at native 60 m MSS / 30 m TM resolution. Minus = today's land minus scene land buffered by two pixels. Drop pieces below 0.1 km²; keep coastal-connected pieces to avoid mistaking inland reservoir water for reclamation. Plus = scene land eroded by two pixels minus today's land buffered by two pixels. Restrict plus to G11 L5 land to exclude Malaysia, Indonesia and turbid-water false positives; drop pieces below 0.1 km². No qualifying plus pieces remain. This extra conservative attribution mask cannot recover lost islands absent from L5. No nuisance polygons were hand-deleted.

## Coast measurements and limits

Sample every 100 m along G3's largest exterior ring where it lies within one native pixel of G11 L5, at least 500 m from detected minus, and is QA-clear. Measure distance to the unbuffered scene boundary before display packing. The table reports extraction diagnostics, not the error of a surveyed or packed final coastline. G11 is only a provisional unchanged-coast selector; its rejected status means that selector is not certified. Earlier reservoir-shore samples were corrected. **The sensor-specific p95 targets, 120 m MSS and 60 m TM, remain unmet.**

{accuracy}

Published areas are SVY21 projected areas of final packed geometries, not national statistical land area. The specified G3 MP2019 outline is indicative planning geometry rather than an independently surveyed 2026 coast. The official values (581.5 km² in 1960, 617.8 in 1980, 682.7 in 2000 and 735.7 in 2024) use a different definition, including a 2002 method change. L4 → L5 is not an accepted measured growth series.

The unchanged shared `local-land.ts` applies the exact four-taps water/keepMatch configuration and writes eight dated eras, mask and today's reference coast. `build-coasts.ts` keeps each era in a separate cleaning layer, so overlapping eras cannot erase each other. It then folds the layers into one object and asserts that all eight eras survive. Final display DP is **{packing['dpM']} m**, with quantisation {packing['quant']} and a grid of approximately {packing['gridM'][0]:.2f} × {packing['gridM'][1]:.2f} m. Post-quantisation cleaning uses a 0.00001° snap. This display simplification is a disclosed budget tradeoff, not compliance with the tighter geographic accuracy targets. All final rings are checked; see coast-packing.json.

## Control maps

**K1:** G1's contiguous City and Naval Base stipple edges are traced through dense source-pixel anchors in lines.json. Straight connectors join image-observed anchors; the all-pixel mask is not claimed as a colour-detection accuracy test. Offshore closures only select a side and are clipped to G11 L4 mainland. Sentosa is not painted as City. Countryside is L4 minus City, Naval Base and three early named reservoirs. Unbounded forest/swamp symbols are not traced. Every K1 feature is approximate.

The retained source is a 1920 × 1205 Commons preview. Original-resolution requests failed with HTTP 403/429. Projection auto selected {fit['model']}. The 16 constructed graticule intersections have internal RMS {fit['rmsKm']*1000:.2f} m, max {fit['maxKm']*1000:.2f} m; leave-one-out RMS {fit['looRmsKm']*1000:.2f} m, max {fit['looMaxKm']*1000:.2f} m. **These are correlated constructions from border ticks, not 16 independent ground identifications. They do not satisfy the brief's control-point requirement or establish external 150/300 m accuracy.** See k1-review.md.

**K2/K3:** literal empty GeometryCollections at 1966-01-01 and 2019-01-01. The shared compose/simplify tools do not build empty recipes, so topic-local control.ts builds K1/K4 and inserts empty objects. It marks K1 approximate without changing geometry. No shared code was patched.

**K4:** all LU_DESC values are exported with areas in layers-area-statistics.md. COMMERCIAL / INSTITUTION is explicitly assigned to town-and-services; this edition has no NATURE RESERVE value. ROAD and WATERBODY are excluded. Seven modern planned-use categories are dissolved, clipped to L11, simplified at 10 m and quantised to 50000. Countryside occurs only in K1. The four frames contain 3 / 0 / 0 / 7 features. The slug is included in the ring regression test.

## Dated layers and railway

The full [dated-layer audit](dated-layers-report.md) records the per-town HDB join and all area-date sources. There are 10,644 matched blocks from 10,817 residential property rows (98.401%); 121 ambiguous and 52 unmatched rows are omitted. No OneMap. Multiple footprint pieces dissolve to one centroid; only numeric f/h remain. Eighteen canonical reservoir geometries, arcs, transform and dates match four-taps, with ISO dates converted to decimal calendar years. Estates, farm parcels and reserves carry per-feature approximate certainty and present-day extent semantics. Tuas/Woodlands exact opening dates and unsupported separate historical farm boundaries are omitted.

The [rail audit](rail-report.md) records 37 opening segments, 2,594 vertices, source feature IDs, station-derived connectors and date citations. Railway geometry is URA SODL and OSM-free. Every route persists, uses holder transport and has equal from/to. Some dates use primary operator, MOT or NAS sources rather than the preferred LTA/NLB; two retain month precision. The closed Ten Mile Junction spur is omitted. Partial Punggol West service in 2014 is not rendered as a whole loop.

## Budgets and review

{budget}

HDB's budget is gzip per §9. The four area files total 105,577 raw bytes. PNG source comparisons and dated-layer reviews are under ignored docs/screenshots/singapore-land-use/. Existing chapter illustration assets were reused. Visual comparison is evidence for review, not historical acceptance.

## Every retained difference piece at least 0.1 km²

Names below are candidate geographic correspondences inferred from centroid location and the cited project histories. They are not surveyed project-footprint/date matches. Unmatched pieces remain listed and visible. Changi, Tekong, port and offshore pieces still need dated engineering evidence.

{pieces}
'''
# Make long generated prose readable without changing named English words.
(P/'SOURCES-GEO.md').write_text(text.rstrip()+'\n')
counts={k:len(read(TOP/'data'/f'{k}.json')) for k in ['entities','events','movements']}
counts['sources']=len(read(TOP/'data/sources.json')['sources']);counts['glossary']=len(read(TOP/'data/glossary.json')['terms'])
report=f'''\n## Second pass — 20 October 2026

Anonymous MPC SAS access resolved the Landsat gate. The draft data and chapters are built. **Geographic acceptance is incomplete:** K1 lacks independent ground controls and the full-resolution source; coast p95 targets, tide matching and complete engineering-project matches remain unresolved. Passing software gates does not waive these requirements.

### Counts

- Eight coast eras, a mask and today's reference coast; four control frames with 3 / 0 / 0 / 7 features; eight fixed-colour entities.
- 10,644 HDB points from 10,817 residential rows: 98.401% matched, 121 ambiguous and 52 unmatched omitted. No OneMap. Per-town counts are in dated-layers-report.md. The 26 blocks dated 2026 remain outside the 1959–2025 playback.
- Dated areas: two industrial areas, one supported western farmland group, four reserves and 18 canonical reservoirs.
- {counts['movements']} rail segments, 2,594 vertices; {counts['events']} events; {counts['sources']} sources; {counts['glossary']} glossary terms; seven English chapter drafts, 33 beats and six presets. Chinese uses 【待译】 except required canonical copies.
- Existing cover and four chapter figures reused. Twenty layer plates, two control plates, eight coast plates and a rail overview are retained in the ignored screenshot directory.

### Sources, licences and method

URA/HDB/NParks/statistics use SODL 1.0. BIS 1959 is PD-UKGov; Landsat is USGS public domain. G11's inherited historical estimates retain their rejected-draft status. Reservoir name matching and Linggiu use © OpenStreetMap contributors, ODbL 1.0. Railway geometry is OSM-free. No NAS/SLA/NUS/journal/SFA map artwork was traced. Original research was recovered read-only from main and preserved with an evidence crosswalk. Exact receipts, hashes and chronology citations are in SOURCES-GEO.md, fetch-receipts.json and the layer/rail audits.

{scene}

MSS uses calibrated B4/B7 NDWI; TM/ETM+ uses SR_B2/SR_B5 MNDWI. Otsu thresholds use a 2 km outer-coast belt, followed by one-pixel closing, two-pixel uncertainty buffers and a 0.1 km² piece filter. Cloud pixels conservatively retain today's land status. Plus is constrained to G11 L5 to exclude foreign land; zero qualifying plus pieces remain. Low-QA but visibly hazy 1992/2009 scenes were rejected. Tide matching is unverified.

### Coast statistics and K1

{accuracy}

All p95 values exceed the brief's sensor-specific targets. The unchanged-coast selector itself uses rejected G11 L5 as a provisional check. National statistical areas and planning-outline areas are different measures. Every retained minus piece, candidate project correspondence and unmatched result is listed in SOURCES-GEO.md. The Admiralty chart check is qualitative; TPC 1984 was not newly fetched.

K1 uses a 1920 px Commons preview and 16 correlated graticule constructions. Internal RMS/max are {fit['rmsKm']*1000:.2f}/{fit['maxKm']*1000:.2f} m; leave-one-out RMS/max are {fit['looRmsKm']*1000:.2f}/{fit['looMaxKm']*1000:.2f} m. **These do not satisfy 16 independent geographic controls or certify external accuracy.** Source-pixel City/Naval Base traces are approximate. Intermediate whole-island land-use frames are empty.

### Budgets

{budget}

Coast display packing uses DP {packing['dpM']} m and quantisation {packing['quant']}, approximately {packing['gridM'][0]:.2f} × {packing['gridM'][1]:.2f} m cells. This is a disclosed size tradeoff and does not meet the tighter geographic accuracy specification. K4 uses 10 m DP and quantisation 50000; HDB uses 100000. Topic-local adapters handle packing and empty frames. Engine, shared pipeline, package files and other topics remain unchanged.

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
'''
f=P/'CODEX-REPORT.md';old=f.read_text();old=old.split('\n## Second pass —')[0];f.write_text(old+report)
