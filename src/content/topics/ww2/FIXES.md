# World War II map fixes

## Fix 2026-11-09

### 1. Inventory and licence decision

Replaced the BY-SA side of the former mix. Retained CShapes 2.0 under CC BY-NC-SA 4.0, dated OHM exports under CC0 (all exported elements checked for licence exceptions), Natural Earth under public domain, and compatible CC BY Greek municipal data. The active dataset manifest changes **21 → 28** entries; **8 → 0** active BY-SA entries (seven traced maps plus one cross-check-only map). The frozen inventory retains each retired URL, author, licence, frame dependency and derived filename. It also records the formerly incompatible packaged `dist/topics/ww2/data.json`.

- Inventory: [licence-inventory-before.json](../../../../scripts/geo/ww2/licence-inventory-before.json), pinned to `6668a386ab3b68e04dd7c2f61aa7cd0d311a1886`.
- Current per-file graph: [map-provenance.json](provenance/map-provenance.json), **65 artifacts** audited.
- Per-keyframe sources, licences, registration methods, residuals, dates and rebuild commands: [data/SOURCES.md](data/SOURCES.md) and [SOURCES-GEO.md](../../../../scripts/geo/ww2/SOURCES-GEO.md).

### 2. Replace and redraw the incompatible layers

**Seven BY-SA-derived control-map inputs → zero**: G3 → original USMA China raster G23; G5 → author-released PD monthly Europe maps and CMH Greece G33; G7 → PD March 1942 map G24; G15 → USMA July 1943 G25; G16 → USMA April/December 1944 G26/G27; G17 → USMA May 1945 G30; G18 → USMA western/Italian fronts and gains G28/G29/G31/G32. G6 was cross-check-only and is retired. New fronts follow registered source-colour pixels, not invented geographic polygons. Registration maxima stay within **30 km Europe / 60 km Asia**; full fit and leave-one-out results are in the source ledger.

**Three BY-SA-derived route paths → zero**: independently digitised `barbarossa-n`, `barbarossa-c`, `barbarossa-s` from PD USMA plates 19/20 (G36/G37). Registered route fit: RMS **9.9 km**, max **24.7 km**. Image-space waypoints and control points are stored in [route-registration.json](../../../../scripts/geo/ww2/route-registration.json). Endpoints remain factual town coordinates. These are approximate drive corridors, not individual unit road tracks. Route count **31 → 31**; every ID, date, strength, label, holder and linger value is unchanged. The other 28 route paths are unchanged. S92 bibliography alone is minimally updated in **EN + ZH**; lesson prose and numbered historical facts are unchanged.

### 3. Pipeline and coverage corrections

Re-ran the topic's shared OHM, SVG, raster, line-tracing, composition and simplification steps, with scoped finalisers documented in the rebuild commands. **12 → 12** dated keyframes; **10 → 0** incompatible keyframes; the shared topology and packaged runtime data now contain no BY-SA geometry.

Visual and coverage review also corrected defects in the partial rebuild:

- Select the Finland-connected monthly-map component before sea buffering; buffering first joined it to German-held territory. Removed the artificial latitude edge in Karelia.
- Fill missing K5/K7 interiors only from dated registered G12/G13 classes intersected with CShapes, minus existing coverage. No nearest-holder extrapolation or drawn patch polygons. Final 1-degree interior coverage audit, with four 0.2-degree probes: **zero new broad holes in all 12 frames**.
- Replace Courland's rectangular selector with the actual G27 pocket trace clipped to pre-war CShapes Latvia; remove Estonian islands from that pocket.
- Scope the Soviet front erasure to the central-European pocket, preserving Norway/Denmark and Crete occupation geometry.
- Restore the original bilingual Denmark occupation label after the K6 overlay; all original named bilingual map labels pass the retention audit.
- Include Sitia in eastern Crete using real G35 municipal geometry. Period US OSS report A-12634 (G38) independently locates Italian posts in Sitia, Ierapetra, Agios Nikolaos and Palaiokastro. Municipal units are explicitly an administrative approximation; the CMH map supplies the mainland partition, not a precise Crete boundary. No BY-SA outline was copied.

**39 place/holder checks**, **12 ring audits**, **13,351 rings**, **0 zero-area**, **0 self-crossing**. All **11 chapters**, all beats, **34 entities**, **78 events**, and all non-geometry movement fields remain unchanged. Sixteen narrative/config files are byte-identical to the baseline. Geometry feature counts may change when source fragments dissolve; K11's former Norway coast sliver is absorbed into the correctly occupied region, while the entity registry remains unchanged.

### 4. Counts and performance

| Measure | Before → after |
|---|---|
| Control bytes | 1,662,950 → 1,633,448 |
| Shared topology arcs | 8,967 → 8,437 |
| Maximum CPU fill triangles per keyframe | 90,232 → 91,132 |
| Client JavaScript files | 126 → 126, **all byte-identical** |
| First-load WW2 JS | unchanged, **480.17 KB gzip** |

Triangle estimates use the actual decoded keyframe polygons and earcut/Three ShapeUtils; they exclude basemap, strokes, MapLibre subdivision and UI, and are not GPU measurements. The control file remains below its existing 2.5 MB budget. No runtime code, new dependencies, shared basemap, engine, widget, framing or CSS changes were made.

| Frame | Geometry features before → after | CPU fill triangles before → after |
|---|---|---|
| K1 | 33 → 33 | 82,005 → 81,741 |
| K2 | 34 → 34 | 83,264 → 85,666 |
| K3 | 38 → 38 | 85,045 → 87,690 |
| K4 | 38 → 38 | 85,238 → 87,688 |
| K5 | 35 → 35 | 88,822 → 90,439 |
| K6 | 40 → 40 | 88,385 → 91,025 |
| K7 | 40 → 40 | 89,157 → 91,132 |
| K8 | 40 → 40 | 88,772 → 90,477 |
| K9 | 43 → 43 | 87,073 → 89,307 |
| K10 | 48 → 48 | 88,901 → 88,987 |
| K11 | 50 → 49 | 90,232 → 90,869 |
| K12 | 46 → 46 | 86,019 → 85,667 |

### 5. Verification and offline previews

- `pnpm check`: pass, 0 errors / 0 warnings (5 existing hints).
- `pnpm validate`: pass, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: pass, 191 pages. Built control and all 31 built route paths are verified against the exact current source data.
- `pnpm run test --config scripts/geo/ww2/verification.config.ts`: **275 files / 6,523 tests passed**. Full original suite, no skipped assertions. The topic-local config supplies an explicit `.js` resolver for the inherited extensionless Drei import, two workers and a 30-second test timeout. The explicit CPU performance assertions are unchanged. The final run was performed without concurrent build/render work.
- Source/shape audit, original bilingual label retention, frozen fact hashes, route non-geometry equality, runtime packaging and client bundle byte comparison all pass. Records: [verification.json](provenance/verification.json), [client-js-check.json](provenance/client-js-check.json), [polish-metrics.json](../../../../scripts/geo/ww2/polish-metrics.json).

Actually inspected the rasterised output for all 12 keyframes, the Greece, eastern-front, central-Europe and China close-ups, the PD front-trace overlays and both route-source overlays. Final copies are in:

`scripts/geo/ww2/work/previews/final-2026-11-09/`

Start with `all-keyframes.png`; individual `K1.png` … `K12.png`, seven detail plates and `routes-pd-19.png` / `routes-pd-20.png` are alongside it. These are actual geometry rasters in Mercator with equal scale on both axes and diagnostic holder colours. Rebuilds write the live images to the parent preview directory; the dated copies preserve this review set.

### Not done / boundaries

The default test command still encounters the inherited extensionless import in `CatalogueSky.tsx`. Its one-line correction is left for engine work because engine files are outside ownership. The scoped resolver above permits the complete suite to verify this work without an engine edit. Browser/e2e/shoot verification was not run because the task expressly prohibits Chromium, browser and desktop use. Existing date offsets, the earlier-frame China approximation and administrative Crete cuts remain disclosed in the source ledger; no claim of exact daily fronts is added. No Git writes or protected queue/package files were changed.

## Acceptance 2026-11-09 (Claude)

Licences re-traced from `sources.json`, `map-provenance.json` and the source pages (G23, G24, G21, geoBoundaries GRC ADM3): no derived file combines CC BY-SA with CC BY-NC-SA. Shot `--beats --gpu` and chapter states in paper and cinema on main and on this branch. Three map defects found and fixed in `sources.json`, then compose, coverage restore, simplify, audits and ledger re-run:

- K6: the G24 'axis' class also covers annexed Moselle, so the Vichy step painted a Vichy patch around Metz. Vichy now keeps only the parts containing Vichy and Corsica.
- K11: G31 white also lies outside the Allied front, so registration slivers along the Rhine, Saar, Luxembourg border and Elbe became German-held. The German step now keeps only the parts holding Bohemia-Moravia and Austria.
- K11: Fortress Holland had been dropped, and all of Norway, Finnmark included, was German-held. Holland is now the provinces of North Holland, South Holland and Utrecht (Natural Earth admin-1, an approximation; on G31 the white area is joined to the liberated south). Finnmark is left out.

