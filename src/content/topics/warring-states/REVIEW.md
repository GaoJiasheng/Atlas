# Warring States data delivery review

Draft English content and map data are present. **Content validation passes; full geographic acceptance does not.** Chinese fields intentionally retain the requested 【待译】 English text.

Counts: 11 keyframes; 129 control features; 23 entities; 173 events (including 74 person placards and 36 battles); 26 schematic routes; 105 sources; 11 chapters; 49 beats; 17 glossary terms; 60 river features. All 18 Commons downloads have API attribution/licence metadata and verified SHA-256 hashes.

Geometry: 266 rings; 0 zero-area; 0 self-crossing. control.json is 280.7 KiB against the manifest's 1.2 MB budget. Holder adjacency has no equal-colour neighbours.

## Per-keyframe registration RMS

Values are kilometres. They measure alignment with the source, not historical boundary accuracy. Supplements retain their own fit; inferred frames do not gain independent accuracy.

| Frame | Date | Source RMS km |
|---|---|---|
| K1 | 770 BCE | G10 22.087 |
| K2 | 650 BCE | G10 22.087 |
| K3 | 600 BCE | G10 22.087 |
| K4 | 500 BCE | G3 15.342; G10 22.087 |
| K5 | 473 BCE | G3 15.342; G10 22.087 |
| K6 | 403 BCE | G3 15.342; G7 7.869 |
| K7 | 350 BCE | G7 7.869 |
| K8 | 280 BCE | G8 7.869 |
| K9 | 260 BCE | G11 26.102; G8 7.869 |
| K10 | 230 BCE | G11 26.102; G8 7.869 |
| K11 | 221 BCE | G11 26.102; G8 7.869 |

Inference-based frames: **K1, K2, K3, K4 (G10 supplements), K5, K6, K9 (Lu/Wey supplements), K10, K11**. K7 and K8 directly trace their dated maps.

## Outstanding geography limits

- G9 is a point-distribution map, so G10 supplies early bounded regions. K1–K3 reuse undated period geometry: minor annexations without bounded source shapes are omitted, not invented. K1 Zheng is explicitly labelled as the later Xinzheng position.
- G11, the 260 BCE source, has RMS 26.102 km / maximum 66.657 km and exceeds the 25 km budget. K9–K11 retain this draft limitation. The G15 county map also exceeds budget (RMS 37.237 km / maximum 68.657 km); it supplies no territorial geometry. K10 uses the specified whole-state fallback.
- G13 has only 5 secure control points; G17 has 8. G16 has no defensible full fit. These are reference-only; the requirement for at least 12 reliable controls on every map remains unmet. G9 is slightly above its check-only 40 km maximum budget.
- Four originals remain rate-limited (G9/G11/G12/G18); official published renders are retained. Original and render hashes are recorded separately. No guessed detail replaces missing pixels.
- Routes connect source-supported named stations schematically. Exact ancient roads, passes and battlefield footprints are not established. All 26 individual station lists and limitations appear in data/SOURCES.md and AUDIT.md.
- Coastline clipping changes early Ju by about 22% and G8 Yan by about 25% (including outside-plate portions). Area-retention results and the coastline-step workaround are documented in the geography ledger.
- Intended chapter/control start is 770 BCE and the final chapter reaches 206 BCE. The spec-required 771 BCE King You event is preserved accurately; the current engine derives the overall time extent from all non-site events and therefore includes that precursor year.

## Every remaining marked fact

[AUDIT.md](AUDIT.md) contains all 50 marked source/event records and all 3 marked chapter passages, including full per-route station lists. The unresolved questions are:

- Exact sites at Kuiqiu, Chengpu, Boju, Fujiao, Shimen, Guiling, Maling, Xiuyu, Danyang, Yuyu, Zui, Pingyang, Fei and Chengfu; Shimen’s annals opponent designation; Goujian’s stay in Wu; Li Xin’s campaign year.
- Complete Zeng tomb and Yonglu excavation publications, Yonglu issue/authors/osteology and skeleton count, named Changping demographic estimates and page references, Dujiangyan’s narrow 256–251 BCE dating.
- Wey’s final chronology and residence; Yue after 306 BCE; the Shang Yang measure and Du tiger tally museum object records; Gu Donggao war-count definitions, edition and pages.
- Remaining site/Wikidata matching, coordinate precision, and all 26 routes’ station-by-station textual reconciliation. Individual route notes also identify uncertain crossings/departures, Confucius visit order, Qin pass corridors and the final imperial tour’s 211/210 BCE chronology.

## Validation and provenance

Latest pnpm validate: **23 topics, 0 errors, 0 warnings**. No pending engine-schema blockers. No build, test, e2e or shoot was run. All edits for this task are restricted to the topic, its geography folder and its two public geography files; concurrent engine work is untouched.

Per-frame sources, licences, models, control points, RMS/max/leave-one-out residuals, methods and inferences: [data/SOURCES.md](data/SOURCES.md) and scripts/geo/warring-states/SOURCES-GEO.md. Side-by-side images: scripts/geo/warring-states/check/geo-K1.png through geo-K11.png.
