# D/C illustration redo (2026-11-09)

Assigned batch only: twelve chapter figures plus the energy-conversion cover.
The muscles covers, exercises, B-grade batch and already-approved replacements
were left alone. `b200-gpu-tray` is present but has no content reference, so the
brief's conditional assignment excludes it.

- `public/illustrations/redo-cd-manifest.jsonl`: one record per redrawn/re-encoded
  image, six checks each, source pointers, exact bytes, SHA-256, alpha bounds,
  projected key-feature extents, bilingual replacement text and theme policy.
- `public/illustrations/redo-cd-unused.json`: the six deletions and individual
  reasons. Reference search covered `src/`, including the MDX chapters.
- `redo-cd-ai-prompts.json`: exact original generation/edit prompts recovered
  from the interrupted run. The approved final energy cover is the sun-removal
  edit. Sources were processed through the existing `illustrate.ts` pipeline;
  no custom generation service or package change is involved.
- Traced source identities, licences and adaptation boundaries are in the
  warring-states and water `data/SOURCES.md` files. The barrage photograph is
  Stockvault 210732, CC0; nine bays follow PUB's primary description. The gate
  section and ancient artefact internal sections are constructed geometry.

Each named geometry script can be run with `pnpm tsx scripts/figures/<id>.ts`.
They use `graphite.ts` and run their assertions before writing a 1200×900 WebP.
`redo-cd-delivery.ts` also executes every geometry function without exporting.
The code checks are supplemented by human inspection of all 420px and 840px
paper/cinema images; count and semantic claims are not inferred from raster
hashes. Key-feature extents mean the longest projected dimension, not line
thickness; the rubber spout-to-cup path is checked as one connected teaching
feature. No figure in this batch encodes physical illumination by tonal polarity,
so no inversion opt-out is required for the final exports.

Preview directory: `/tmp/atlas-redo-cd/final` (override with `ATLAS_CD_PREVIEW`).
It contains individual 420px/840px/full composites, paired 840px theme plates,
420px contact sheets and side-by-side 420px/840px compression comparisons.
Reproduce with `pnpm tsx scripts/figures/redo-cd-review.ts`, then refresh the
export checks with `pnpm tsx scripts/figures/redo-cd-delivery.ts`. The compression
script preserves its originals in the preview directory and skips images that
already meet the byte budget. AI source PNGs from the interrupted run are kept
outside the deployed assets; both final cover densities are in `public/`.

In this checkout, Vitest fails while externalising Drei’s extensionless Html
import. Transforming `@react-three/drei` in the temporary config resolves it.
The temporary `/tmp/atlas-redo-cd/vitest.config.mts` preserves the complete test
set, uses two workers and 30-second test/hook limits for the heavy anatomy tests.
It changes no tests, application code, package or lockfile. Command:
`pnpm run test --config /tmp/atlas-redo-cd/vitest.config.mts`.

The complete configured test run finished with 6,521 passed, one skipped and one
failure: the old tsunami image hash frozen in
`src/content/topics/plates-and-hazards/provenance/illustrations.json`. That path
is outside this job's ownership. The concrete metadata refresh is prepared at
`/tmp/atlas-redo-cd/illustrations-audit.patch`; it has not been applied pending
an ownership exception. Cover-specific EN/ZH descriptive alt/caption text is
included in the JSONL; the home component's existing title-based alt convention
has not been changed outside the permitted paths.

## Acceptance (2026-11-09)

Shipped from this job: `singapore-1819-1965-rubber-and-tin`, `energy-conversion` cover, and as interim
diagrams pending a graphite style pass `coral-reef-zones` and `plates-and-hazards-tsunami-shoaling`;
re-encodes of `fossils-and-skeletons-fossilisation`, `space-race-lunokhod` and `flower-and-seed-bee-pollination`.

Sent back and reverted to the previous raster (the scripts stay as geometry/assertion starting points;
do not run `redo-cd-delivery.ts` for them until redone): `coral-reef-polyp`, `digestive-system-swallowing`,
`inside-the-earth-boundary-models`, `monsoon-and-weather-cloud-cutaway`, `warring-states-tiger-tally`,
`warring-states-crossbow-trigger`, `warring-states-zhou-war-chariot`, `warring-states-qin-measure-and-slips`,
`water-marina-barrage`. The flat-fill vector rendering does not match the graphite plates. The over-size
`inside-the-earth-*` and `monsoon-and-weather-cloud-cutaway` rasters use the i-b re-encode of the originals.
