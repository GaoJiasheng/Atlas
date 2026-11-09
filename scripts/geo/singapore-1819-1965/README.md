# Singapore historical map pipeline

Current method: **Fix 2026-11-09, north-west residuals**, following round 2, in the topic's `data/SOURCES.md` and `REBUILD-3D.md`. Older `resume-*`, `SECOND-PASS-*` and `CODEX-REPORT.md` notes retain research history; their strict 30/60 m accuracy gates and incomplete-splice status are superseded. Historical positions remain approximate at the measured errors; software checks do not certify survey accuracy.

The **north-west residual pass** adds reviewed native-pixel bank curves from the same G9/G11/G16 originals. `residual-trace.ts` now runs between input selection and registration in the fresh rebuild. It removes graticule/symbol detours and retains source-supported paired tidal banks, with no raster blur or new source. Single-stroke drainage remains omitted. Registration, display notes, dates and labels are unchanged.

## Rebuild and guard

Cached originals are in ignored `raw/`, disposable intermediate geometry/logs in ignored `work/`. Source receipts retain hashes and item-specific rights. No restricted NAS map is used. Do not run pixel-authoring helpers over reviewed JSON during a routine rebuild.

The existing shared map tools are linked at `scripts/geo/.tools`. Native vector sampling uses Python NumPy/SciPy; numerical overlay repair uses Shapely. Keep these authoring dependencies outside the repository if installation is needed:

```sh
python3 -m pip install --target /tmp/atlas-maps-py shapely numpy scipy
PYTHONPATH=/tmp/atlas-maps-py pnpm tsx scripts/geo/singapore-1819-1965/round2-rebuild.ts
pnpm tsx scripts/geo/singapore-1819-1965/polish-audit.ts --accepted-live
pnpm tsx scripts/geo/singapore-1819-1965/round2-guard.ts
pnpm tsx scripts/geo/singapore-1819-1965/residual-guard.ts
```

Set `ATLAS_MAP_PYTHONPATH` to an existing Shapely installation if needed. This changes no package manifest. `round2-rebuild.ts` runs the shared raster-line extraction, input selection, regularised TPS registration, historical land restoration, source-bank splice, dated borders, dated local land, precision packing, all 23 control compositions, shared simplification, final source-water restoration, exact holds and holder colours. Every command/log and final asset hash is recorded in `round2-rebuild-audit.json`; the independent guard checks those hashes against delivery.

G9 retains 19 controls, including an independently identified surviving cathedral footprint, and G11 retains all 18 controls. `round2-registration.json` records fitted/leave-one-out errors and smoothing trials. G9's expanded set slightly increases RMS; it is retained honestly. G11 improves. No control is removed to optimise a numerical target. Existing G16/G35 registrations remain; printed-grid precision and external reference error are separate.

The upper Jurong source trace is `round2-jurong-head.json`, read on the native ANU 1958 GSGS sheet. `round2-jurong.py` is an authoring helper, not a routine rebuild step. It combines the measured paired head banks with the retained downstream water; the closed source island survives. The reviewed complete water input is `resume-jurong-east-verified-full-water.json`.

`round2-splice.ts` joins the usable G15 Tuas bank arc to the complementary G16 mainland arc at exact source-bank intersections south of Poyan/Berih. The incomplete northern G15 water mask is excluded. `round2-g15-peninsula.json` independently restores the observed G15 mangrove tip with 2002 dry-land closure samples; uninked interior clearings are not classified as water. Coverage closures do not become coast. G35's internal selector crosses common dry land and its coverage closures sit outside that selector, preventing a false inland seam under the curved warp.

`resume-final-water.ts` restores historical source land after modern URA water subtraction and retains the source islands. It never cleans or dissolves overlapping eras together. GEOS repairs only invalid floating-point pinches independently per feature (area change <=2 m²), then applies a shared 0.11 m numeric grid; sub-resolution zero-area rings are removed. The exporter selects a quantisation that passes all delivered ring checks. No simplification, invented river width or automatic gap filling occurs at this stage.

The guard checks all source raster hashes/licences, paired head-water and dry/island witnesses on coast and all five 1961–1965 frames, the northern source-dry peninsula, absence of the old native-y30 coverage seam, six exact holds and zero ring defects. There is no strict RMS acceptance threshold.

## Offline visual evidence

```sh
pnpm tsx scripts/geo/singapore-1819-1965/polish-preview.ts
pnpm tsx scripts/geo/singapore-1819-1965/resume-source-preview.ts
pnpm tsx scripts/geo/singapore-1819-1965/round2-keyframes.ts
```

`previews/{paper,cinema}-all-keyframes.png` contains all 23 actual delivered frames. Theme-matched island, river, settlement, Jurong, head and northern-splice close-ups use existing tokens. `G35-published-{coast,west,mouth,pandan,head}.png` and `G15-published-{inlet,north}.png` overlay delivery on original source rasters. G14 remains an explicitly unpublished comparison. The old `G35-upper-channel-unqualified.png` is historical failure evidence. These are CPU rasters, not browser screenshots.

`residual-preview.ts --before` and `residual-preview.ts` render the retained initial snapshot and final delivery respectively: `previews/residual-{before,after}-{paper,cinema}.png` plus original-map overlays `residual-{before,after}-{G9,G11,G16}[-close].png`. The `--before` command needs the ignored starting snapshot in `work/residual-before-*.json`. Source guide previews can be reproduced with `residual-native-preview.ts G9 G11 G16`. `residual-counts.json` records the exact residual-pass counts separately from historical round-two counts.

For the accepted live-topic residual pass, run `polish-audit.ts --accepted-live`, then `round2-guard.ts` and `residual-guard.ts`. The explicit mode checks every original content file against `residual-text-baseline.json`, captured before this pass and independently matched to the accepted HEAD. It also retains hashes of exact control keyframe metadata and feature properties. The earlier `polish-baseline.json` and bilingual correction receipt remain intact; the default historical audit still evaluates them. Later accepted historian edits predate this residual pass and must not be mistaken for changes made by it.

## Gates

Run `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build`; the topic guard is additional. The historical round-two logs record an ephemeral outside-repository Drei configuration. That workaround is not used for this residual pass: the repository's existing Vitest configuration and CLI worker options are used, with no new configuration file. Final commands, counts and logs are in `REBUILD-3D.md` and `work/residual-*.log` (older round-two evidence stays in `work/round2-*.log`).

Do not rerun `content-build.ts --publish`: it would overwrite subsequent historian corrections. All chapter facts, beats, dates and labels remain; the sole round-2 text change removes the obsolete strict-RMS threshold from S376's bilingual method note.
