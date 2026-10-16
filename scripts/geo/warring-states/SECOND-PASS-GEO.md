# Second geography pass — 2026-10-16

## TypeScript and reproducibility

All initial strict TypeScript diagnostics in this topic's scripts are repaired. External JSON is narrowed from `unknown`; fixed coordinate/box arrays have tuple types; indexed results, pixel classes, metadata dimensions and fit candidates are checked before use. `strict-input.ts` centralises the small runtime guards. The root agent separately repaired the five registration/raster/river scripts delegated to it. A TypeScript AST scan of **every** `scripts/geo/warring-states/*.ts` found **zero `AnyKeyword` nodes and zero non-null assertion expressions**. No suppression directives were added.

`pnpm exec tsc --noEmit -p tsconfig.json` passes. The regional land file already existed, so `region-land.ts` was not run. No build, test, e2e or shoot command was run.

The keyframe generator now only generates geography recipes; it no longer writes entities. `holder-colors.ts` now exports the authoritative entity palette and checks adjacency using the same `holderAdjacency` / `colourConflicts` code as the required shared CLI; it never rewrites entity colours. Run the shared `colour-holders.ts --topic warring-states --write` before this export. `write-provenance.py --geo-only` refreshes only `SOURCES-GEO.md`, leaving the separately edited textual source ledger alone.

## Registration decisions: sources excluded, fits not claimed to improve

No synthetic controls were added and no residuals were reduced by deleting inconvenient evidence. The original images, controls and diagnostic reports remain available. Direct reinspection of G13's full original, G17 and G16's first full frame confirmed the identification limits below.

| Source | Actual diagnostic evidence | Decision |
|---|---|---|
| G11 | 18 controls; RMS 26.102 km; max 66.657 km; leave-one-out max 86.927 km, above the 25 km budget | Removed from **all K9–K11 geometry**, feature `src` and frame comparisons. G11 and its translated G12 base are registration-only. |
| G13 | Five labelled city dots; schematic rivers/coast do not provide twelve independent secure controls; leave-one-out max 95.731 km | Diagnostic only; absent from every frame selector, feature `src` and frame comparison. |
| G16 | Seven unlabelled symbols near state labels, with no independently identified city names; no defensible full fit | Reference only; absent from every frame dependency. No RMS claimed. |
| G17 | Seven identifiable city symbols plus Wuguan; schematic river bends cannot be promoted to independent controls; max 26.249 km, leave-one-out max 37.671 km | Removed as K10 provenance / K11 comparison source; absent from every frame dependency. |

G15 was already unsuitable for tracing (over budget); it is now also excluded from the later frame provenance and comparisons. G9 remains only an early point-identity cross-check; early outlines are G10, never G9 polygons.

The four requested weak registrations therefore remain unresolved **as registrations**, but none supplies released frame geometry or a frame-comparison dependency. This is the permitted source-dropping fallback, not a claim that all eighteen maps now meet registration acceptance.

## Replacement geography and limitations

G8 remains usable: 12 controls, RMS 7.869 km, maximum 18.958 km, leave-one-out maximum 21.033 km. Its published **280 BCE** outlines supply the fallback:

- K9 / 260 BCE carries those outlines forward unchanged. It does **not** reconstruct intervening acquisitions or losses. Zhou lacks a bounded G8 face and is omitted rather than drawn around its capital.
- K10 / 230 BCE reassigns only the whole Han component to Qin and the whole Lu component to Chu. It does not trace Qin's commandery gains or pretend that the other 280 BCE outlines are precise 230 BCE boundaries.
- K11 / 221 BCE is a schematic union of those represented source extents, not a full Qin imperial boundary. No Lingnan, steppe or additional unbounded Yue territory is drawn. Wey's dependent ruling house surviving to 209 BCE is distinguished from this coarse imperial fill; the fill does not date its abolition.

Every released feature retains `certainty: approximate`. Chinese labels now mirror all English parenthetical geographic caveats, including later Xinzheng, Chuqiu, former Wu territory, residual inferred Jin, the 280 BCE carry-forward and the schematic Qin union.

`build-keyframes.ts` reproduces these decisions, `sources.json` records them, and the contradictory G11-use passages in `SOURCES-GEO.md` and its generator were replaced. Root/historical-data own the corresponding `data/SOURCES.md` revision.

## Executed geographic checks

Regenerated recipes, composed the eleven frames, ran the shared simplifier into the topic's `work/control-nocoast.json`, clipped to existing real NE regional land, finalised certainty metadata and regenerated area/deviation audits. The final geometry audit records **128 features, 431 rings, zero zero-area rings, zero self-crossings**. Shoreline clipping retained every incoming holder in every frame.

The root agent reran the exact required shared colour command on the regenerated geometry: **21 represented holders, 70 neighbouring pairs, 8 colour tokens, zero conflicts**. The exported image-check palette and `color-audit.json` now reflect that assignment, not the earlier custom algorithm.

Clipping/source-alignment limitations remain explicit: early Ju loses about 22% of pre-clip source area; G8-derived Yan loses about 25%, including geometry outside the regional plate. K9/K10 repeat that same G8 limitation. The schematic K11 union loses about 3.66% under shoreline/region clipping. These are not interpreted as historical annexations. The raw source-to-final deviation diagnostic reaches about 62 km in K10 because the former Qin–Han internal seam is dissolved on whole-state reassignment; area retention confirms this does not represent a missing Qin component.

## Human geography review still needed

The 280 BCE carry-forward in K9/K10 and schematic K11 union need a historian/cartographer's acceptance as teaching approximations. A more accurate dated map needs a different published, licensed source with a defensible registration; the discarded schematic maps do not establish its missing boundaries. The vanished Zhou face, dependent Wey and changing Qin commanderies must not be inferred from the coarse fill. Existing unresolved G10 dating / missing minor-state faces and the borrowed 350 BCE Three Jin division also remain.
