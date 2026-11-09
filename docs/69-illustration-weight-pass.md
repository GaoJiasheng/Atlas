# 69 · Illustration weight pass — 2026-11-09

Re-encoded **27** of 64 oversized images in scope, saving **251,186 bytes**. Retained 37 originals because tested encodings could not meet the target without visible loss or exceeded the budget with exact alpha. Another 16 oversized muscles/exercise assets belong to the other branch and remain untouched.

Budgets use decimal KB: figures 120,000 B; exercises 110,000 B; @2x covers 260,000 B. This is stricter than the existing `illustrate.ts` KiB budgets. Totals below count WebP image bytes only, excluding provenance/report text.

| Image set | Files | Before (bytes) | After (bytes) | Saved (bytes) |
|---|---:|---:|---:|---:|
| All illustrations | 337 | 42,544,958 | 42,293,772 | 251,186 |
| In scope (excludes all muscles/exercises) | 265 | 35,126,322 | 34,875,136 | 251,186 |
| Re-encoded images | 27 | 4,565,008 | 4,313,822 | 251,186 |

## Quality and provenance

No drawing, crop, resizing, alpha quantization, caption or alt changes. All accepted outputs retain every decoded alpha sample exactly. Neutral graphite remains neutral; existing physical-tone exceptions remain unchanged. Lossless and target-size WebP candidates were tested; larger or visibly degraded candidates were discarded.

All 64 candidates were compared in CPU simulations of the actual paper multiply and cinema filter/blend rules at 420 px and 840 px. A 200×200 source patch with the largest visible change was also enlarged to 400×400 for 2× native review, in both themes. Native detail inspection rejected the turbine/pipe texture in the power-station candidate even though it passed the numeric screen. The other accepted candidates passed conservative SSIM screens (≥0.995 at 420 px and ≥0.99 at 840 px in each theme) and visual review. These scores support the comparison; they are not treated as proof of perceptual identity.

The [machine audit](69-illustration-weight-pass.json) includes before/after hashes, bytes, dimensions, decisions, candidate metrics and detail coordinates. Before images and PNG comparison sheets are retained for this session at `/tmp/atlas-weight-pass/before/` and `/tmp/atlas-weight-pass/final-qa/`. No browser or desktop was opened.

Live coral-reef and frog-and-chicken provenance records were refreshed. The plates-and-hazards fault-offset original and its hash record are unchanged: the target-size candidate loses fine cut-surface texture. All skipped assets and all images already under target retain their original hashes.

## Re-encoded files

Paths in the tables are relative to `public/illustrations/`.

| File | Before (B) | After (B) | Target (B) |
|---|---:|---:|---:|
| `coral-reef@2x.webp` | 261,592 | 247,932 | 260,000 |
| `figures/ancient-civilisations-roman-aqueduct.webp` | 120,552 | 112,388 | 120,000 |
| `figures/b200-airflow.webp` | 134,396 | 119,406 | 120,000 |
| `figures/b200-gpu-module.webp` | 121,184 | 110,872 | 120,000 |
| `figures/circuits-tester.webp` | 122,424 | 114,562 | 120,000 |
| `figures/decimals-coin-tray.webp` | 122,044 | 112,784 | 120,000 |
| `figures/decimals-four-cups.webp` | 122,228 | 113,428 | 120,000 |
| `figures/forces-bicycle-brake.webp` | 121,396 | 113,792 | 120,000 |
| `figures/how-planes-fly-turbofan-cutaway.webp` | 120,870 | 109,446 | 120,000 |
| `figures/light-and-shadows-sun-day.webp` | 120,766 | 113,794 | 120,000 |
| `figures/measuring-ball-and-stone.webp` | 121,040 | 114,670 | 120,000 |
| `figures/monsoon-and-weather-storm-life.webp` | 121,336 | 114,332 | 120,000 |
| `figures/plant-stem-dye.webp` | 120,596 | 112,224 | 120,000 |
| `figures/saturn-v-air-breathing-engine.webp` | 120,870 | 109,446 | 120,000 |
| `figures/singapore-after-1965-factory-work.webp` | 125,448 | 116,148 | 120,000 |
| `figures/southeast-asia-mangrove-roots.webp` | 121,868 | 111,238 | 120,000 |
| `figures/telling-time-bus-interchange.webp` | 122,308 | 115,952 | 120,000 |
| `figures/telling-time-day-arc.webp` | 122,426 | 113,678 | 120,000 |
| `figures/warring-states-rammed-earth-wall.webp` | 122,674 | 115,818 | 120,000 |
| `fossils-and-skeletons@2x.webp` | 261,956 | 249,606 | 260,000 |
| `frog-and-chicken@2x.webp` | 264,934 | 253,310 | 260,000 |
| `inside-the-earth@2x.webp` | 265,500 | 250,530 | 260,000 |
| `living-things@2x.webp` | 263,728 | 255,696 | 260,000 |
| `magnets@2x.webp` | 260,530 | 254,166 | 260,000 |
| `mosquito@2x.webp` | 261,478 | 251,542 | 260,000 |
| `plant@2x.webp` | 260,254 | 255,290 | 260,000 |
| `ww1@2x.webp` | 260,610 | 251,772 | 260,000 |

## Files left over target — retained for quality

Every file below is unchanged. “Size” means the exact-alpha candidate still exceeded the target; “Detail” means a smaller candidate visibly reduced graphite texture or introduced blocking/ringing at 2×.

| File | Before = after (B) | Target (B) | Reason |
|---|---:|---:|---|
| `figures/area-perimeter-garden-fence.webp` | 238,102 | 120,000 | Size |
| `figures/area-perimeter-hdb-floor-plan.webp` | 142,466 | 120,000 | Detail |
| `figures/digestive-system-tooth-section.webp` | 131,216 | 120,000 | Detail |
| `figures/digestive-system-villus.webp` | 173,648 | 120,000 | Detail |
| `figures/energy-conversion-power-station.webp` | 136,476 | 120,000 | Detail |
| `figures/energy-conversion-sun-sources.webp` | 167,042 | 120,000 | Detail |
| `figures/energy-conversion-tengeh.webp` | 157,784 | 120,000 | Detail |
| `figures/forces-playground-slide.webp` | 207,014 | 120,000 | Size |
| `figures/living-things-plant-fungus.webp` | 225,012 | 120,000 | Size |
| `figures/magnets-electric-bell.webp` | 129,144 | 120,000 | Detail |
| `figures/mangrove-food-web-breathing-roots.webp` | 185,910 | 120,000 | Detail |
| `figures/mangrove-food-web-predator-prey.webp` | 185,420 | 120,000 | Detail |
| `figures/materials-waterproof-test.webp` | 137,680 | 120,000 | Detail |
| `figures/measuring-sugarcane.webp` | 164,874 | 120,000 | Detail |
| `figures/mosquito-empty-saucer.webp` | 137,062 | 120,000 | Detail |
| `figures/multiplication-division-hdb-windows.webp` | 130,552 | 120,000 | Detail |
| `figures/plant-bee-on-flower.webp` | 169,926 | 120,000 | Detail |
| `figures/plant-seed-dispersal.webp` | 168,350 | 120,000 | Detail |
| `figures/plates-and-hazards-fault-offset.webp` | 234,700 | 120,000 | Detail |
| `figures/singapore-1819-1965-ballot-box.webp` | 134,364 | 120,000 | Detail |
| `figures/singapore-1819-1965-ocean-junk.webp` | 137,104 | 120,000 | Detail |
| `figures/singapore-1819-1965-shophouse-cutaway.webp` | 131,260 | 120,000 | Detail |
| `figures/singapore-1819-1965-temasek-finds.webp` | 159,492 | 120,000 | Detail |
| `figures/singapore-land-use-hydroponic-farm.webp` | 136,484 | 120,000 | Detail |
| `figures/singapore-land-use-kampong-farm.webp` | 204,308 | 120,000 | Detail |
| `figures/states-of-matter-sponge.webp` | 131,568 | 120,000 | Detail |
| `figures/sun-earth-moon-four-phases@2x.webp` | 286,868 | 120,000 | Detail |
| `figures/sun-earth-moon-parallel-axes@2x.webp` | 281,954 | 120,000 | Detail |
| `figures/telling-time-clock-gears.webp` | 135,964 | 120,000 | Detail |
| `figures/telling-time-clock-tower.webp` | 172,290 | 120,000 | Detail |
| `figures/warring-states-dujiangyan.webp` | 149,982 | 120,000 | Detail |
| `figures/warring-states-zeng-bells.webp` | 183,434 | 120,000 | Detail |
| `figures/warring-states-zhou-war-chariot.webp` | 177,350 | 120,000 | Detail |
| `figures/water-cycle.webp` | 223,680 | 120,000 | Size |
| `figures/water-newater-membranes.webp` | 137,772 | 120,000 | Detail |
| `mangrove-food-web@2x.webp` | 263,800 | 260,000 | Detail |
| `singapore-1819-1965@2x.webp` | 266,594 | 260,000 | Detail |

## Files left over target — skipped ownership

All muscles covers and all exercise images were skipped, including these oversized files.

| File | Before = after (B) | Target (B) |
|---|---:|---:|
| `exercises/back-extension.webp` | 110,646 | 110,000 |
| `exercises/barbell-back-squat.webp` | 124,384 | 110,000 |
| `exercises/cable-external-rotation.webp` | 112,152 | 110,000 |
| `exercises/cable-hip-abduction.webp` | 115,784 | 110,000 |
| `exercises/cable-hip-adduction.webp` | 112,466 | 110,000 |
| `exercises/cable-internal-rotation.webp` | 111,702 | 110,000 |
| `exercises/cable-pallof-press.webp` | 110,600 | 110,000 |
| `exercises/chest-supported-dumbbell-row.webp` | 116,982 | 110,000 |
| `exercises/close-grip-bench-press.webp` | 114,698 | 110,000 |
| `exercises/lat-pulldown.webp` | 112,412 | 110,000 |
| `exercises/machine-chest-press.webp` | 110,082 | 110,000 |
| `exercises/seated-leg-curl.webp` | 135,168 | 110,000 |
| `exercises/single-arm-dumbbell-row.webp` | 112,440 | 110,000 |
| `exercises/straight-arm-cable-pulldown.webp` | 112,330 | 110,000 |
| `muscles-chest@2x.webp` | 265,444 | 260,000 |
| `muscles-shoulders@2x.webp` | 264,402 | 260,000 |

## Gates

- `check`: passed: astro check (1499 files, 0 errors, 0 warnings, 24 hints) and tsc --noEmit
- `validate`: passed: 94 topics, 0 errors, 0 warnings
- `test`: NOT PASSED. A full default before-edit run reported 10 failed files / 16 timing failures, 6742 passed tests and 1 skipped. Post-edit default and reduced-worker runs also hit geometry/module-loading timeouts and the 100ms catalogue-search benchmark; stopped after observed failures. No test/config/assertion changes. Measured host: 18 logical cores, 1-minute load 688.7, 3.19 GiB free of 128 GiB. Logs: /tmp/atlas-weight-pass/test.log and test-standard-final.log.
- `build`: passed: 191 pages; all 64 audited dist illustration hashes match final public files (WebP assets are intentionally outside PWA precache).

The complete before-edit default test run already failed 16 timing cases. Post-edit default and reduced-worker attempts reproduced timing failures under severe host load; these attempts were stopped after failures and the test gate is not claimed passed. No test assertions, Vitest config, dependency files, captions, alt or application code were changed. The original node_modules symlink was restored after the temporary writable-cache workaround.
