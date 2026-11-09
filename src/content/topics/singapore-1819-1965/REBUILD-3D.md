# Singapore, 1819–1965 — map rebuild record

## Polish 2026-11-03

Executed and reviewed **2026-11-05**. This is a TimeScene vector-map task; no 3D model or engine code was changed. **The requested live-map polish is not complete.** No failed registration or undated coastline was promoted to accepted geometry.

1. **Permission-free sources — audited.** The ten active/candidate raster inputs resolve to public-domain Commons originals, including the BnF War Office map, US Army Map Service map, UKHO charts and Stanford's 1903 Borneo map. Original SHA-256 receipts were rechecked. No NAS-restricted scan is a trace dependency. The new audit rejects a restricted NAS map dependency and non-PD raster input. Natural Earth remains PD; URA remains separately attributed SODL. OSM supplies point controls/name selectors only; no new OSM geometry or NC-SA/ODbL combination was introduced. See `data/SOURCES.md` for individual rights bases and links. Historical NAS text citations are not map-image dependencies.
2. **Three island registrations — recomputed, still failed.** The unchanged shared evaluator selects by leave-one-out RMS. G9: 18 active controls, **107.71 / 243.91 m** LOO RMS/max; G11: 18, **77.78 / 146.13 m**; G16: 6, **152.53 / 289.29 m**. Expanded candidate sets of 22/21/9 controls worsen LOO RMS to 124.98/95.38/351.81 m and retain correspondence uncertainty. They were rejected, rather than deleting inconvenient controls or reporting training residuals as validation. Active counts and residuals are unchanged before/after. The complete point-level report is `scripts/geo/singapore-1819-1965/polish-audit.json`; `polish-audit.ts --require-accuracy` deliberately exits 1.
3. **Eastern Jurong — new, unpublished source work.** G14 is UKHO Admiralty Chart 2014, surveyed aboard *Dampier* in **1961**, published **29 April 1966**, with additions/corrections through 1966 and a subsequent small-correction annotation. Its original UK-government map is public domain. Sixteen independently inspected native graticule intersections give LAEA + second-order polynomial **1.78 / 3.14 m fitted RMS/max; 3.00 / 5.50 m LOO RMS/max**. These are **internal scan-registration** measurements; external WGS84 accuracy is **not measured**. A 47-guide, 454-vertex native-pixel tracing trial follows the eastern Sungei Bajau bank and seaward mangrove fringe towards Tanjong Penjuru. Jetties, soundings, leading lines and dredged-channel lines are excluded. This does not establish the exact 1961 high-water coastline: the corrected edition does not date individual coastal changes, and a vegetation edge is not automatically a high-water line. It remains explicitly unpublished. The 1958 War Office GSGS 4923 item at ANU says Copyright Expired, but its image download could not be retrieved; its metadata alone was not used to manufacture geometry.
4. **Both themes — offline inspection completed; live polish not delivered.** The CPU renderer decodes the actual published TopoJSON and reads the existing paper/cinema tokens. It renders island overviews, river/Jurong close-ups, and Jackson settlement divisions, plus original-map control overlays and the Jurong trial. No Chromium/browser/desktop was opened. The existing coast discrepancies remain visible; changing a theme would not fix their source registration. No theme or live geometry change is claimed.

### Counts before → after

Chapters **12 → 12**, keyframes **23 → 23**, coast eras **6 → 6**; chapter text, beats, dates, facts and labels unchanged. Control asset **524,573 → 524,573 bytes**, **2,367 → 2,367 arcs**. Coast asset **193,916 → 193,916 bytes**, **2,753 → 2,753 arcs**.

CPU planar fill triangulation of one decoded local coast era (not MapLibre runtime tiling or GPU statistics):

| Era | Before triangles | After triangles |
|---|---:|---:|
| L0 | 4,420 | 4,420 |
| L1 | 4,420 | 4,420 |
| L2 | 4,493 | 4,493 |
| L3 | 4,415 | 4,415 |
| L4 | 4,561 | 4,561 |
| L5 | 4,976 | 4,976 |

### Reproduce and inspect

```sh
pnpm tsx scripts/geo/singapore-1819-1965/polish-audit.ts
pnpm tsx scripts/geo/singapore-1819-1965/polish-audit.ts --require-accuracy
python3 scripts/geo/singapore-1819-1965/polish-source-edge.py
pnpm tsx scripts/geo/singapore-1819-1965/polish-preview.ts
```

The second command is expected to fail until geographic acceptance is actually achieved. Cached original rasters are required; their downloads remain documented in the existing fetch scripts and receipts.

Previews are retained in `scripts/geo/singapore-1819-1965/previews/`: `paper-{island,jurong,river,settlements}.png`, matching `cinema-*` plates, `G9-controls.png`, `G11-controls.png`, `G16-controls.png`, `G14-grid-controls.png`, and `G14-candidate-trace.png`. SVG map plates and `triangle-counts.json` are included. These are offline evidence plates, not application screenshots.

### Verification — 5 November 2026

| Check | Result |
|---|---|
| `pnpm check` | PASS: 1,210 files, 0 errors, 0 warnings, 5 existing hints; final `tsc --noEmit` also passes |
| `pnpm validate` | PASS: 94 topics, 0 errors, 0 warnings |
| `pnpm test` | FAIL: 272 suites passed, 3 failed; 6,492 tests passed, 2 failed, 1 skipped. Solar-system suite cannot load the Drei `web/Html.js` subpath through the shared dependency layout; two unrelated geometry tests exceeded 5 seconds. Sauropod tests pass in isolation (8/8); toad-skin timeout and the solar import failure persist in their isolated runs. No unrelated topic or engine was edited to conceal these failures. |
| `pnpm build` | PASS: 191 pages; static build/PWA generation completed |
| `vitest run tests/geo-rings.test.ts --maxWorkers=1` | PASS: 9 tests, including this topic's zero-area/self-crossing ring checks |
| `polish-audit.ts` | PASS for ten original-source hash/PD-dependency checks and byte equality of 21 runtime files against the retained baseline |
| `polish-audit.ts --require-accuracy` | FAIL as intended: G9/G11/G16 external acceptance and G14 external/date qualification remain unresolved |

Logs are in the topic's ignored `work/polish-*.log`. The initial shared `node_modules` symlink caused read-only Vite cache errors; dependency links were isolated so this worktree's caches stay local. No package manifest or lockfile was changed. No git writes, shared-engine edits, queue edits or external publication were performed.

## Fix 2026-11-09

Resumed the retained partial work, inspected its diff, originals and actual delivered vectors. **The requested polish is not complete or ready for geographic acceptance.** Permission-free source work and some source detail are in the live draft, but the three registrations still fail, the upper Jurong trace is incomplete, and the fresh G15 splice rebuild fails. Failed repair trials did not alter the delivered geometry.

1. **Permission-free dependencies — verified.** Eleven active/candidate originals pass source-hash and individual PD-rights checks (previously ten). No NAS-restricted map scan is a trace dependency. New G35 is [ANU's War Office / Air Ministry GSGS 4923 Singapore, edition 1-GSGS, October 1958](https://openresearch-repository.anu.edu.au/items/23618e83-c884-4d56-a47e-b1e8909dc2a7), with item-specific **Copyright Expired** metadata. The complete 8,350 × 6,806 JPG matches ANU's MD5 and retained SHA-256; the separately restricted NUS georeferenced copy is not used. Natural Earth remains PD; URA remains separately attributed SODL; OSM supplies point controls/name selectors only. No OSM line/polygon or NC-SA geometry is published. Sources, rights bases, methods and per-map errors are in [data/SOURCES.md](data/SOURCES.md#fix-2026-11-09), with original receipts under the topic geo directory.

2. **Registration — improved G16, requested tolerances not achieved.** G9/G11 each gain sixteen internal printed-grid observations, while their active external sets remain 18/18. G16 gains sixteen genuine partial-axis Mercator observations and retains six ground comparisons; its grid-constrained translation replaces the unstable direct ground fit. G35 uses sixteen Johore-grid observations plus nineteen independently read road-crossing candidates. Translation, rigid and full-affine alternatives were tested without residual-based deletion. Seven further native road observations expand diagnostic G9/G11 sets to 26/24, but uncertain correspondence and worse LOO errors prevent adoption (`resume-extra-controls-report.json`).

   | Map | External LOO RMS / maximum before (m) | After (m) | Required RMS / maximum (m) |
   |---|---:|---:|---:|
   | G9 | 107.71 / 243.91 | **107.71 / 243.91** | 40 / 80 — FAIL |
   | G11 | 77.78 / 146.13 | **77.78 / 146.13** | 30 / 60 — FAIL |
   | G16 | 152.53 / 289.29 | **54.74 / 72.87** | 30 / 60 — FAIL |
   | G35 | No adopted source | **39.82 / 82.01** | 30 / 60 — FAIL |

   Internal printed-grid LOO RMS/max: G9 15.71/27.11 m, G11 14.22/24.65 m, G35 17.30/40.92 m. These are scan-calibration measurements, not ground accuracy. G16 lacks sixteen qualified surviving-ground controls; G35's western extrapolation remains unbounded. G4's unchanged town LOO RMS of 60.16 m also marginally exceeds its 60 m budget. All maps' fitted/LOO values and unmeasured external cases are explicitly listed in SOURCES.

3. **Jurong and river source detail — partial, with newly exposed failures.** G35 supplies 1,218 native outer-shore vertices, a retained 1,136-vertex Jurong water input with two holes, 485 Pandan water vertices with one hole, and P. Samulun / P. Damar Laut / P. Merawang outlines of 102/93/35 vertices. These are new G35 traces (before: zero). Blue banks and genuine black cliff crests are distinguished from coral, lettering, piers and inland cliff ticks. G4 gains 402 native upstream/marsh vertices beyond its retained 57 lower-river guides, including a real marsh island. G1's 85-vertex planned Swamp basin and G7's source-bank extent were checked and retained. Source-scale detail is retained at 5 m for town/Jurong arcs and 25 m elsewhere.

   **Upper Jurong is unfinished.** The native main-water input has one crossing/retraced ring. Export cleanup produces valid delivered rings, but paired-bank source reaches collapse into disconnected fragments. Five reread upper-water witnesses include three failures at crop-native `[2013,260]`, `[2019,275]`, `[2081,275]` in L5 and all five 1961–1965 control frames. The earlier “complete reviewed river” wording was incorrect. A guide-based repair trial did not align closely enough and was rejected. `polish-audit.json.sourceCompleteness` and `previews/G35-upper-channel-unqualified.png` retain the failure; passing lower-water/island checks do not qualify this head.

   **The northern G15/G16 splice cannot yet be rebuilt.** `resume-coast-inputs.ts` finds the natural-bank intersection but fails the segment-checked common-water route, including a widened search south to 1.32°N. The old G15 water coverage closure disconnects the intersection from verified western sea. Moving a coverage closure over unverified vegetation would invent coast. The failure occurs before live-asset writes; the retained output is the earlier partial build. The README now labels the development sequence as failing rather than reproducible. `work/resume-rebuild-final.log` records the failure. No NAS permission is the blocker.

   The [9 March 1970 Budget Statement, printed p.11](https://www.nas.gov.sg/archivesonline/data/pdfdoc/PressR19700309.pdf) places first Jurong industrial earth-moving in September 1961. October 1958's preconstruction shore at **1 January 1961** is therefore an explicit temporal inference, not a 1961 survey. Later reclamation stages remain unmapped. The 1961-survey/1966-corrected G14 trial remains unpublished because its individual corrections cannot be backdated.

4. **Both themes — inspected offline, visual acceptance still failed.** Actual decoded published geometry was rasterised using existing paper/cinema tokens and opened at island, river, settlement and Jurong scales, with native source overlays. Earlier partial fixes remove offshore chart glyphs, the Pandan mouth seam and a false western coverage rectangle; source islands survive the final export. Exported rings and six exact holds pass. The finalizer preserves overlapping eras, disables automatic gap filling and limits numerical cleanup to 0.11 m snapping / remnants below 1 m². The upper-river failures remain visible in both themes; visual polish is not declared complete. No browser, Chromium, desktop, shared engine, framing or theme token was changed or driven.

### Counts before → after

Chapters **12 → 12**, control keyframes **23 → 23**, coast eras **6 → 6**. Teaching facts, beat references, dates and labels remain. Four map-method paragraphs (two EN + two ZH) were minimally corrected and S376/S377 appended. `resume-text-changes.json` and the audit reverse those exact edits and compare the retained baseline hashes.

| Asset / diagnostic | Before | Retained draft |
|---|---:|---:|
| Coast JSON bytes | 193,916 | 243,491 |
| Coast arcs | 2,753 | 2,517 |
| Control JSON bytes | 524,573 | 567,154 |
| Control arcs | 2,367 | 2,473 |
| Coast vertices | — | 17,618 |
| Coast rings / zero-area / self-crossing | — | 512 / 0 / 0 |
| Control rings / zero-area / self-crossing | — | 2,141 / 0 / 0 |
| First-load JavaScript, gzip | 480.17 KiB | 480.17 KiB; unchanged |

The coast is **237.78 KiB**, above the 200 KiB soft target, to retain native source detail. Control remains below 1 MiB. No runtime JavaScript or raster map was added. CPU earcut counts for one decoded coast era (not runtime tiling/GPU counts):

| Era | Before triangles | After triangles |
|---|---:|---:|
| L0 | 4,420 | 4,823 |
| L1 | 4,420 | 4,994 |
| L2 | 4,493 | 5,075 |
| L3 | 4,415 | 4,844 |
| L4 | 4,561 | 4,576 |
| L5 | 4,976 | 8,236 |

### Verification and previews

The full source rebuild is currently **not reproducible** at the G15 guard described above. Default `polish-audit.ts` verifies receipts, content preservation and mechanical geometry; its JSON separately records failed source completeness. `--require-accuracy` exits 1 for the remaining geographic failures. No authoring helper should overwrite reviewed trace JSON during routine checks. Build tools use the retained read-only `scripts/geo/.tools` symlink; no package manifest/lockfile or git metadata was changed.

Previews actually opened: `scripts/geo/singapore-1819-1965/previews/paper-{island,jurong,river,settlements}.png`, matching `cinema-*`, and `G35-published-{coast,west,mouth,pandan}.png`. `G35-upper-channel-unqualified.png` exposes the failed head; `G15-published-inlet.png` compares the retained far-west trace with its own source. Original control plates include G16's revised method/error and separate tick marks. G14 remains explicitly unpublished. These are offline evidence plates, not application screenshots.

Final logs: `scripts/geo/singapore-1819-1965/work/resume-*-final.log`. The full test command uses the topic's linked-dependency config, allowing the existing external pnpm store and inlining Drei; it selects every unchanged test. Plain earlier `pnpm test` encountered the shared-store Drei loader failure and unrelated 5 s timeouts. No test assertion, topic or engine was changed to conceal a failure.

| Check, 9 November 2026 | Result |
|---|---|
| `pnpm check` | PASS: 1,232 files, 0 errors, 0 warnings, 6 hints; TypeScript exits 0 |
| `pnpm validate` | PASS: 94 topics, 0 errors, 0 warnings |
| `pnpm test -- --config scripts/geo/singapore-1819-1965/resume-vitest.config.ts --maxWorkers=2 --testTimeout=30000` | PASS: all 275 suites, 6,523 tests, no failures or skips |
| `pnpm build` | PASS: 191 pages, static build and PWA generation complete |
| `pnpm vitest run tests/geo-rings.test.ts --maxWorkers=1` | PASS: 9 tests |
| `polish-audit.ts` | PASS: 11 original hashes/PD dependencies, exact content exceptions, lower-water/island witnesses, no coverage rectangle, zero exported ring defects; **source completeness remains failed** |
| `finalise-control.ts` | PASS: six exact hold pairs; approximate metadata retained |
| `scripts/js-budget.ts --check singapore-1819-1965` | PASS: 480.17 KiB gzip, unchanged; budget 481 KiB |
| `polish-audit.ts --require-accuracy` | **FAIL**: G9/G11/G16/G35 external tolerances and source completeness |
| Fresh `resume-coast-inputs.ts` source rebuild | **FAIL** before live writes: northern G15 water-only splice has no qualified route |

`resume-verification.json` retains final counts, hashes and gate statuses. The task remains incomplete: qualified external controls, the paired upper Jurong banks, the G15 coverage splice and exact later reclamation stages still require source work. Software gates do not certify those geographic conditions.

## Fix 2026-11-09 — round 2

This is the current completion record and supersedes the earlier strict-RMS / incomplete-source status above. The acceptance policy follows Gavin's reset: verified rights, convincing source-derived geography and a fresh rebuild are hard requirements; map positions are approximate at the measured reference errors.

### Items completed

1. **Compliance.** Rechecked the retained originals and licence evidence for all ten active raster maps plus the unpublished G14 comparison. G35 is ANU's item-specific Copyright Expired original, with repository MD5 and SHA-256 verified. No NAS-restricted scan, uncertain-rights G19/G20/G27 trace, or NC-SA/ODbL geometry mixture enters delivery. Natural Earth PD, the existing attributed URA SODL foundation and separately attributed OSM registration coordinates remain distinct. `data/SOURCES.md` now has a current rights/method matrix and an EN/ZH approximation note for **every one of the 23 keyframes**. The sole round-2 teaching-source text correction removes the obsolete strict RMS threshold from S376's EN/ZH note; chapter prose, facts, dates, beats, labels and IDs remain unchanged.

2. **Upper Jurong fragmentation.** Independently reread paired blue banks on the native October1958 GSGS source. Replaced the wide nearest-ink snapping that merged opposite banks with source-measured, separately followed bank curves; retained downstream water and the genuine head island. The complete water input changes **1,136 → 847 vertices, 2 → 1 holes, one connected part retained**; the old native crossing ring changes **1 → 0**. All five original wet witnesses now pass in L5 and all five 1961–1965 frames (**18 failing checks → 0**, across the 30 wet checks); additional dry/island witnesses also pass. The delivered channel remains connected, rather than becoming cleaned-up fragments. `round2-jurong-head.json`, `resume-jurong-east-verified-full-water.json` and `polish-audit.json` retain the measurements and checks.

3. **Northern G15 splice and coastline seams.** The old G15 water coverage omitted a source-vegetated peninsula; extending its cap or routing around it could not repair the underlying classification. The usable **Tuas** G15 bank now joins G16 at genuine coast-segment intersections, while the complete G16 Poyan/Berih bank is retained farther north. The G15-observed mangrove tip is redrawn from the native outer tree front; **2,002 common-land closure samples pass**. An internal blank/clearing without a qualified water line is not turned into a fabricated water polygon. One whole detached G16 chart-glyph fragment in source-verified sea is removed. Both previously identified source-dry peninsula witnesses are land in delivery. A second false inland hairline came from different chords of a curved source-frame projection; its coverage closure now lies outside the selector. The independent guard finds **zero vertices on the false cap**. The fresh source rebuild changes **FAIL → PASS** without skipping the geographic checks.

4. **Cheap registration improvements.** Re-inspected the independently named surviving St Andrew's Cathedral footprint on G9; retained its source pixel and separately attributed OSM coordinate as a 19th approximate reference, with the 3-pixel/generalisation caveat. Regularised thin-plate warps are evaluated by leave-one-out RMS, retaining all qualified observations. **G11: 77.78 → 55.45 m LOO RMS**, 18 controls unchanged. **G9: 107.71 → 109.15 m**, 18 → 19 controls: the slightly larger error is reported honestly rather than deleting the added point. The 19-point TPS is marginally better than that same expanded set's affine fit (110.01 m). G16 remains **54.74 m**, G35 **39.82 m**. Their maxima and all other active-map measurements are in the source ledger. Printed-grid precision is kept separate from external reference error; no strict per-map tolerance is imposed or implied.

5. **Source-scale export and visual QA.** The finalizer no longer cleans overlapping dated coast features together, which could fill another era's channels. GEOS repairs only tiny invalid floating-point pinches independently per feature (area difference ≤2 m²), applies the declared 0.11 m numeric grid, and removes sub-resolution zero-area rings. No river widening, automatic gap fill or engine change is used. All 23 actual control frames were rasterised and opened in both themes; the head, northern bank, river, settlements and Jurong mouth were checked in close-up, including original G35/G15/G16 overlays and an additional G11 source comparison. Rasterisation uses actual delivery vectors and existing tokens. No browser, desktop, Chromium or GPU session was launched.

### Counts before → after

Chapters **12 → 12**, control keyframes **23 → 23**, coast eras **6 → 6**, exact hold pairs **6 → 6**. Baseline is the committed round-1 asset snapshot retained in ignored `work/round2-before/`; durable measurements are in `round2-counts.json`.

| Delivery measure | Before | After |
|---|---:|---:|
| Coast JSON bytes | 243,491 | 272,857 |
| Control JSON bytes | 567,154 | 635,244 |
| Coast arcs | 2,517 | 1,825 |
| Control arcs | 2,473 | 1,948 |
| Coast vertices | 17,618 | 21,829 |
| Coast rings / zero-area / self-crossing | 512 / 0 / 0 | 481 / 0 / 0 |
| Control rings / zero-area / self-crossing | 2141 / 0 / 0 | 2700 / 0 / 0 |
| First-load JavaScript, gzip | 480.17 KiB | **480.17 KiB, unchanged** |

The coast remains above the old 200 KiB soft data target to retain source detail; control is below 1 MiB. No runtime JS or raster map is added. CPU earcut fill counts below are per decoded coast era, **not** runtime tiled/GPU counts:

| Era | Before triangles | After triangles |
|---|---:|---:|
| L0 | 4,823 | 6,148 |
| L1 | 4,994 | 6,322 |
| L2 | 5,075 | 6,389 |
| L3 | 4,844 | 6,157 |
| L4 | 4,576 | 4,601 |
| L5 | 8,236 | 7,299 |

### Gates and reproduction

| Final gate | Result |
|---|---|
| `pnpm check` | PASS: 0 errors, 0 warnings, 6 existing hints |
| `pnpm validate` | PASS: 94 topics, 0 errors/warnings |
| `pnpm test -- --config /tmp/atlas-sg-maps-vitest.mjs --maxWorkers=2 --testTimeout=30000` | PASS: all 275 suites / 6,523 tests, no filters or skips |
| `pnpm build` | PASS: 191 static pages and PWA generation |
| `round2-rebuild.ts` | PASS: full source-line → final delivery rebuild, 13 recorded stages |
| `polish-audit.ts` + `round2-guard.ts` | PASS: source rights/hashes, delivered wet/dry/island checks, northern peninsula, zero false cap / ring defects |
| `scripts/js-budget.ts --check singapore-1819-1965` | PASS: 480.17 KiB gzip / 481 KiB budget, no growth |

The unchanged default test configuration encounters an external linked-pnpm-store Drei loader failure in the solar-system suite. The full test command above uses an **ephemeral config outside the repository** to allow the existing dependency path and inline Drei; it changes no test, suite selection, manifest or repository config. No Vitest config was added to this repo. Logs are `scripts/geo/singapore-1819-1965/work/round2-{check,validate,test-final,build,js-budget,rebuild}.log`. Source rebuild stage logs and asset hashes are retained in `round2-rebuild-audit.json`; `round2-guard.json` checks those hashes against delivery. Reproduction commands and the outside-repo Shapely dependency are in the topic geo README.

### Previews actually inspected

Directory: `scripts/geo/singapore-1819-1965/previews/`.

- `paper-all-keyframes.png`, `cinema-all-keyframes.png`: every actual delivered keyframe.
- `paper-{island,jurong,jurong-head,north-splice,river,settlements}.png`, matching `cinema-*`: source-scale geometry in both existing themes.
- `G35-published-{coast,west,mouth,pandan,head}.png`: delivery over the original ANU1958 source.
- `G15-published-{inlet,north}.png`, `G16-published-north.png`: explicit mixed-source coast comparisons; captions identify which source supplies which bank.
- `G11-published-jurong.png`: retained 1941/1944 source generalisation after the new warp.

### Limits / not done

All requested source-completeness and fresh-rebuild fixes are completed. Map positions remain approximate: control LOO errors do not bound unsampled coastline or western extrapolation, G15/G34 external RMS remains unmeasured, and marsh/minor-drain boundaries remain source-generalised. Exact 1961–1965 reclamation stages are **not** reconstructed because the available corrected charts do not date individual footprints; the 1958 natural coast at January1961 remains an explicitly documented temporal inference. No exact historical survey or per-map RMS pass is claimed. Teaching facts and neutral chapter prose stay intact. GPU/browser acceptance remains for the user's following session, as requested.

## Fix 2026-11-09 — north-west live-topic residuals

### Source tracing and completed items

1. **Stepped mangrove/coast edges.** Re-inspected the existing checksummed G9, G11 and G16 originals at native resolution. Replaced graticule excursions and stepped source-bank sections with measured vectors, using shape-preserving interpolation sampled at no more than two original pixels. Raster ink is not blurred, dilated or converted into an invented geographic polygon. G9's Kranji police-station bank, Buluh shoulder, Gedong wedge and Murai mouth/head now follow the printed bank centres; Sarimbun lettering, the Perampun grid stub, lower Kranji, the Gedong join and Pergam's trig-symbol detour are corrected too. G11's readable physical outer shore, the Buloh–Kranji shoulder and pre-causeway east bank receive separate source measurements. G16 follows its continuous outer mangrove-tree front. Soundings, grid lines, contour strokes and individual tree-symbol interiors are excluded from bank readings. Nine whole isolated G16 ink components (76 native vertices), in water outside the qualified banks without a printed closed dry-island shore, are removed by exact existing-component identity; these include three Berih caption strokes. No clipping boundary is drawn.

2. **1937–1960 creeks.** G11's readable paired Kranji–Tengah–Peng Siang banks and Sungei Buloh are traced into the actual era and dated control geometry. Pulau Buloh is traced as a separate source-visible island, correcting its former mainland connection. G16's independently visible paired Kranji banks replace its later-era simplified estuary too; the adjoining Berih mouth is traced around its two readable paired heads, removing caption/number loops. G11 geometry is not transplanted to G16. Narrow tips stop at the last independently readable paired bank centres. Blue mangrove hatch remains land.

3. **Reproduction and independent checks.** Added the native-bank stage between source-line selection and registration in the full rebuild. Four released native measurement files and their SHA-256 hashes are included in the rebuild receipt. Every replacement is checked for source-ring crossings before reprojection; independent source water/dry-land witnesses are checked again on decoded delivered coast and control layers. Exact keyframe metadata, feature properties and all unchanged topic-file hashes are checked, including both display languages. The historical audit predates accepted historian edits and consequently rejects the already-live prose against its old baseline. Its default check and receipt remain intact; the explicit `--accepted-live` mode instead verifies all 22 original content files against the start-of-pass hashes, independently matched to the accepted HEAD. No display edit is allowed by this mode. No engine, display-text, manifest, lockfile, Vitest configuration or review-queue change is made.

Only existing public-domain sources are used: **G9 PD-France / PD-US-expired; G11 PD-USGov-Military; G16 PD-UKGov**. Item-specific rights and original checksums remain in `data/SOURCES.md` and the source ledger. G11 remains the existing 1937 revision / 1941 War Office / 1944 AMS temporal substitution for 1937–1960. Registration controls and external leave-one-out RMS remain **G9 109.15 m, G11 55.45 m, G16 54.74 m**; finer source vectors do not improve those ground errors or bound unsampled banks.

Native replacement counts below are per sequential arc operation and include each open arc's endpoints; a later operation can replace an earlier sampled join. They are not net delivered TopoJSON counts. `residual-trace-audit.json` records each endpoint-join distance, replacement length and source method.

| Source | Replaced native arc vertices | New sampled arc vertices | Separate island vertices |
|---|---:|---:|---:|
| G9 — nine arcs | 479 | 2,220 | 0 |
| G11 — eight arcs | 712 | 11,295 | 340 |
| G16 — four arcs | 1,070 | 5,365 | 0 |

### Limits / deliberately retained approximations

Sarimbun/Perampat on G11 do not expose independently readable paired banks distinct from marsh hatch, roads and single drainage strokes. The uncertain Murai mouth/north-head interval and Berih bank obscured by the large red “20” keep their prior outlines. Ink-obscured continuations, the unresolved narrow lower-west Kranji head curl and single-stroke inland drainage are not widened or guessed. G9 Perampun stops at the printed paired-to-single transition; its beige upstream area remains dry. Existing bilingual approximation notes, dates, labels, teaching numbers, chapters and beats remain unchanged. No new survey accuracy or year-by-year creek change is claimed. Offline CPU rasterisation is used; the user's browser, desktop and Chromium are never launched.

### Delivered counts before → after

Baseline is the accepted live asset at the start of this pass, retained in ignored `work/residual-before-*.json`. Exact measurements are in `residual-counts.json`. Chapters **12 → 12**, keyframes **23 → 23**, coast eras **6 → 6**, exact hold pairs **6 → 6**. All 22 original content-file hashes and exact control keyframe/feature-property hashes match the accepted live baseline.

| Delivery measure | Before | After |
|---|---:|---:|
| Coast JSON bytes | 272,857 | 426,315 |
| Control JSON bytes | 635,244 | 788,447 |
| Coast arcs | 1,825 | 1,797 |
| Control arcs | 1,948 | 1,933 |
| Coast vertices | 21,829 | 38,526 |
| Control vertices | 39,907 | 56,583 |
| Coast rings / zero-area / self-crossing | 481 / 0 / 0 | 458 / 0 / 0 |
| Control rings / zero-area / self-crossing | 2,700 / 0 / 0 | 2,587 / 0 / 0 |

The coast data exceeds the old 200 KiB soft target to retain native-source detail; control remains below 1 MiB. No raster is shipped and no runtime module is added. Fill counts below are CPU earcut counts per decoded coast era, **not** tiled/GPU runtime counts:

| Era | Before triangles | After triangles |
|---|---:|---:|
| L0 | 6,148 | 7,899 |
| L1 | 6,322 | 8,073 |
| L2 | 6,389 | 8,140 |
| L3 | 6,157 | 7,909 |
| L4 | 4,601 | 15,442 |
| L5 | 7,299 | 11,457 |

### Offline previews actually inspected

All paths below are under `scripts/geo/singapore-1819-1965/previews/`; images remain ignored evidence, not committed assets.

- `residual-after-{G9,G11,G16}.png`: actual decoded delivered coast over the unblurred original maps, including the extended Berih window.
- `residual-after-{G9,G11,G16}-close.png`: native-scale delivered Kranji banks, shoulders, branches and source island.
- `residual-after-paper.png`, `residual-after-cinema.png`: actual delivered NW silhouette in both existing theme palettes. Corresponding `residual-before-*` rasters retain the accepted live comparison.
- `paper-all-keyframes.png`, `cinema-all-keyframes.png`: all 23 actual dated control frames over their matching era coast, opened in both themes.

The fresh 14-stage rebuild passes. The original `round2-guard.ts` passes source rights/hashes, the Jurong paired banks and dry/island witnesses, the northern dry peninsula, absence of the false inland cap and zero ring defects. `residual-guard.ts` additionally passes **614 independent source wet/dry checks across all 29 coast/control layers**, current asset/input hashes, exact metadata and unchanged display content. Asset and measurement-file receipts are in `round2-rebuild-audit.json`, `round2-guard.json`, `residual-guard.json` and `residual-trace-audit.json`.

First-load JavaScript is **439.9912109375 KiB gzip → 439.9912109375 KiB**, exactly unchanged in both EN and ZH and below the 442 KiB budget. The baseline and final measurements are `work/residual-js-before.json` and `work/residual-js-after.json`; the budget assertion passes. The final built `dist/geo/land-sg-history.json` matches the published coast byte-for-byte, and the built topic payload's control object equals the final source control object. No stale pre-polish geometry is delivered by the final build.

### Final gates

| Gate | Result |
|---|---|
| `pnpm check` | PASS: 1,515 files; 0 errors, 0 warnings, 24 existing hints |
| `pnpm validate` | PASS: 94 topics; 0 errors/warnings |
| `pnpm test -- --maxWorkers=1 --pool=threads --retry=1 --testTimeout=30000 --reporter=dot` | PASS: all 306 files and all 6,759 tests; no skips; exit 0 |
| `pnpm build` | PASS: 191 pages and PWA generation |
| `round2-rebuild.ts` | PASS: all 14 stages, including native banks, from the retained original rasters |
| `polish-audit.ts --accepted-live` + `round2-guard.ts` + `residual-guard.ts` | PASS: original source/geometry guards, 614 residual witnesses, unchanged display content and current asset/input hashes |
| `measureBudgets` / `assertBudgets`, both locales | PASS: exactly unchanged 439.9912109375 KiB gzip |
| Final scope / whitespace / payload checks | PASS: owned topic/scripts and the named coast asset only; no evidence images or Vitest configuration tracked; `git diff --check` clean; built coast/control match source |

The final test run uses the existing repository configuration and includes every suite/assertion. An earlier two-worker run encountered unrelated catalogue timing, toad timeout and worker-RPC failures under heavy host load; the final single-worker thread run above passes the complete suite against the completed build. No test or runtime code was changed to obtain that result. Final logs are `work/residual-{check-final-all,validate-release,test-release,build-release,rebuild-release,polish-release,round2-guard-release,guard-release,js-release}.log`.
