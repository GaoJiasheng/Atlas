# Life-cycle engine completion report

Completed 2026-10-19 in `/Users/gavin/work/atlas/.claude/worktrees/agent-a4a9dbb800e0128ee`, branch `worktree-agent-a4a9dbb800e0128ee`. Continued WIP commit `e6fe03a`. E-M1, E-M2 and the engine acceptance list in docs/33 §4.6 are complete. The mosquito content acceptance list in §8.2 remains separate.

## What exists

- A registered, pure, deterministic `life-cycle` simulation: temperature-dependent stage durations, optional measured-total scaling, current stage, days remaining, group durations, optional sizes, emptying/scrubbing outcomes and multi-path flow speed.
- A token-styled life-cycle HUD ring in paper and cinema: clockwise from 12 o’clock, current-stage highlight, duration labels, water band, group bracket, stage selection, bilingual accessible summary, comparison switch and topic/chapter link. Nodes support keyboard selection and at least 44 px targets. Below 1024 px the ring folds into the reader/try-it area, including chapters without an experiment.
- `sample-life-cycle`, intentionally **draft** with bilingual sample captions and body text as requested. It uses procedural blocks rather than mosquito anatomy: an open glass dish, thin water surface, five wall eggs, four distinct larval blocks, pupa, emerging-adult station, outside adult, marker and three escaped adults. It has 12 selectable parts plus one context part, one three-path flow, six marker poses and a drained pose.
- Five fixture chapters / 11 beats: background, day stepping, temperature experiment with prediction/table/line chart, tipping/scrubbing experiment, and comparison. Existing controls, bindings, records, URL state and shortcuts remain shared with the other simulations.
- Stronger validation for finite measurements, canonical temperature keys, complete stage rows, terminal/adult order, valid parts, correct control kinds, contiguous groups, complete flow paths, output quantities/state labels and comparison destinations.
- Author documentation in docs/06 and the completed engine build record in docs/33 §9.

The fixture geometry was corrected after visual inspection: the dish is open, larvae fit between floor and water, drained scenes hide the water and marker, escaped adults stay in the tipping chapter, and fixture tints use tokens.

## Data contract for the content author

Start from the complete parsed template in `tests/space-scene/fixtures/aedes-cycle.ts` (`aedesSim`) and the authoring section **SpaceScene · 试一试 · 生活史（life-cycle）** in `docs/06-dev-guide.md`. The template contains the spec’s S16 duration data; `AEDES_TEST_SIZES` is a separate, explicitly invented unit-test export and must not be copied as biological measurements.

The root `sim` uses the existing `controls`, `outputs` and `bind` arrays with `kind: "life-cycle"`, plus this `lifeCycle` object:

| Field | Shape and rules |
|---|---|
| `temp`, `day` | IDs of step controls. Every temperature value needs exactly one duration row. Day values are nonnegative. |
| `start` | ID of the first timed stage; day zero starts here. Earlier stages can be shown on the ring but take no days. |
| `stages` | Ordered objects `{ id, label: { en, zh }, in?, part?, note? }`. Places are `wall`, `water`, `air`, `land`. A referenced part must exist and cannot be context. The final stage is terminal and takes no days. If an ID is `adult`, it must be last. |
| `groups` | Map from group ID to a contiguous ordered array of timed stage IDs, or `{ stages: [...], label: { en, zh } }` to name its ring bracket. |
| `days` | Map from canonical temperature strings (e.g. `"28"`, not `"28.0"`) to positive finite durations for exactly the timed stages, plus optional positive finite `total`. |
| `size` | Optional map `{ quantity: { unit, values: { stageId: number } } }`. Supply sourced values only. A missing value for the current stage produces `NaN`, rendered as an em dash. |
| `emptying` | Optional `{ every: stepControlId, wipe?: toggleControlId }`; every step value must be positive. |
| `rate` | Optional `{ flow: flowId, paths: [pathId, ...], reference: temperatureValue }`. Paths must exactly cover the referenced multi-path flow without duplicates. |
| `card.compare` | Optional `{ control: toggleControlId, label: { en, zh }, stages: [{ id, label: { en, zh } }], link?: { topic, chapter } }`. The link is checked against topic/chapter frontmatter. |

With a measured `total`, stage durations are scaled by `total / sum(stage durations)`. The difference from the unscaled sum must be at most 5%; the final boundary is pinned to `total`. Without it, the sum is the total. Stage intervals are left-closed/right-open; a day at or beyond the total is terminal. This is a mean-duration teaching model, not a population or survival model.

Output IDs may name a quantity directly or use `from`:

| Quantity | Kind / value |
|---|---|
| `stage` | State: current stage ID. Provide bilingual labels for every reachable state. |
| `to-adult` | Number: scaled total. |
| `days-left` | Number: `max(0, total - day)`. |
| `days:<stage-or-group>` | Number: scaled duration or group sum. |
| `on:<stage>` | Number: 1 for the current stage, otherwise 0. |
| `size:<quantity>` | Number: current stage’s sourced size, or missing value. |
| `control:<id>` | Number: step value or toggle as 1/0; choice controls are unsupported here. |
| `emptying:adults` | State: `some` only when `every > current-temperature total`, otherwise `none`. |
| `emptying:eggs` | State: `none` when wipe is on, otherwise `yes`. |
| `rate` | Vector: each `<flow>:<path>` receives `reference-temperature total / current total`. |

Typical bindings are `stage` → marker `pose` map, emptying states → egg/adult `visible` conditions, and `rate` → the flow’s `intensity: { full: 1 }` in speed mode. All displayed labels/states use `{ en, zh }`; visual colors use existing tokens. Chapter `sim.set` and `try.vary` / `keep` / `observe` / `predict` / `record.chart` use the established authoring contract. A URL such as `?ch=one-day&sim=temp.32~day.4` restores the same store used by buttons and keys.

## Files

Paths below include the inherited WIP and its completion.

| Area | Files |
|---|---|
| Model and schema | `src/engines/space-scene/lib/sim/lifecycle.ts`, `lib/sim/index.ts`, `sim-schema.ts`, `schema.ts` |
| Ring and integration | `src/engines/space-scene/lib/sim/cycle.ts`, `hud/CycleCard.tsx`, `View.tsx`, `explorer/TryIt.tsx`, `space-scene.css` |
| Interface strings | `src/i18n/ui.en.json`, `src/i18n/ui.zh.json` |
| Draft fixture | `src/content/topics/sample-life-cycle/topic.yaml`, `data/parts.json`, all five `chapters/*.mdx` |
| Validation and screenshot QA | `scripts/validate-content.ts`, `scripts/shoot.ts` |
| Unit/integration tests | `tests/space-scene/lifecycle.test.ts`, `cycle-card.test.ts`, `fixtures/aedes-cycle.ts`, `tests/validate-content.test.ts` |
| Browser tests | `tests-e2e/sample-life-cycle.spec.ts`, `tests-e2e/hud.spec.ts` |
| Documentation | `docs/06-dev-guide.md`, `docs/33-mosquito-content-spec.md`, this report |

No changes to `package.json`, dependencies or any other topic’s content. No merge or push.

## Tests and gate results

All final runs below passed in this worktree.

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed first; lockfile unchanged. |
| `pnpm check` | 548 files; 0 errors, 0 warnings, 3 pre-existing unused-variable hints. |
| `pnpm validate` | 34 topics; 0 errors, 0 warnings. |
| `VITEST_MAX_FORKS=4 VITEST_MIN_FORKS=1 pnpm test` | 101 files, **2,673 tests passed**. Only worker concurrency was capped; assertions and timeouts were unchanged. |
| `pnpm build` | Passed; 71 static pages. Existing Vite chunk-size notices remain. |
| `pnpm shoot sample-life-cycle --beats --keys --layout` | Passed; **11/11** beat deep links, zero key failures, layout issues or beat failures; clean console. |
| `CI=1 pnpm e2e` | **142/142 passed**, exit 0, 20.7 minutes. Includes all 10 life-cycle browser tests. |

The lifecycle test file has 42 tests, covering every temperature × day 0–8 reading, stage boundaries at every temperature, total scaling/sums, all emptying intervals × scrubbing, temperature-specific thresholds, rates, quantities, immutability, URL round-trip and invalid schema cases. The ring file has nine tests for deterministic geometry, ordering, labels, water coverage, comparison and bilingual summaries. The 18-test content-validator suite includes valid comparison links and missing topic/chapter failures. Browser coverage includes marker pose/highlight, keyboard day stepping, temperature/flow updates, adult/egg visibility, node selection/targets, comparison links, Chinese, narrow reader behavior and cinema keyboard use at 1280 px.

Regression commands were `pnpm shoot <topic> --beats --keys`, run sequentially:

| Topic | Matching beat deep links | Keys / console |
|---|---:|---|
| `sample-space` | 15/15 | Pass / clean |
| `sample-forces` | 16/16 | Pass / clean |
| `sample-energy` | 14/14 | Pass / clean |
| `grasshopper` | 32/32 | Pass / clean |
| `circuits` | 31/31 | Pass / clean |
| `energy-conversion` | 37/37 | Pass / clean |

All **145** regression beat links matched. The fixture adds 11, for 156 total. No beat assertions were skipped.

### Visual review and evidence

Opened every final fixture beat PNG in `shots/sample-life-cycle/en-paper/` individually: background 1–2, one-day 1–2, warm-water 1–2, tip-out 1–3 and two-cycles 1–2. Checked count, stage visibility, label collisions, specimen size, water/floor clearance and comparison legibility. The final count is four larval blocks, five eggs until scrubbing, and three escaped adults only in the appropriate tipping beat.

The layout shoot passed all eight sizes: 3840×2160, 2560×1440, 1920×1080, 1600×900, 1280×720, 1024×768, 900×1200 and 390×844. Also opened representative 1280/1024/390 layout PNGs. Supplementary ring/comparison/drained screenshots were generated in EN/ZH × paper/cinema; paper samples and comparison images in the other three combinations were inspected. The final browser run covers Chinese and cinema as well. A delegated visual audit inspected 24 regenerated regression PNGs across the six topics.

Local logs are `/tmp/atlas-engine-{check,validate,test,build,shoot}.log`, `/tmp/atlas-engine-e2e-final.log`, and `/tmp/atlas-engine-regression-<topic>.log`. Screenshots and temporary logs are local QA artifacts, not committed source.

### QA failures resolved during completion

The original screenshot runner retained an active WebGL stage in another tab while opening deep links. Always-on flows could continue rendering even with run paused. It now fully navigates the same tab for each beat/layout link, creating a fresh document/store and releasing the previous context. Readiness has a 60-second bound; all existing scene, layout and keyboard assertions remain. Early interrupted runs are superseded by the successful final runs above.

The first complete CI run had 141 passes and one existing HUD keyboard-test failure. An isolated rerun reproduced it: software WebGL delayed CSS fade progression after the store had already hidden the HUD. The test now awaits the actual topbar animation’s completion before its unchanged hidden assertion; the overall timeout was not increased. Its focused rerun and the final full CI run passed. There was no product HUD change.

Default unit-test concurrency once pushed an existing WWII anchor test beyond its unchanged five-second timeout under host load. The final full unit suite passed with at most four fork workers, using the command above.

## Deviations and limits

- `rate.paths` is explicit, in addition to `flow` and `reference`, so the pure model can emit every path without depending on the whole parts file. Validation requires complete coverage.
- Groups may include a bilingual label; stage `part` is optional and `land` is an additional supported place. This keeps the model reusable beyond mosquitoes.
- The comparison ring is stacked below the main ring. Two rings side by side in the 260–280 px HUD would require unreadably small text. Stage and duration labels alternate around the outside; the water band and group bracket sit inside.
- The accessible card uses `role="group"` rather than `role="img"` so its button children remain accessible. SVG hit boxes use 54 viewBox units to render at least 44 CSS px at the narrow desktop size. Ring type retains a 10 px minimum there.
- Emptying uses the currently selected temperature, rather than hardcoding 28 °C. Step/toggle controls expose numeric values; choice controls do not.
- The 28 °C L4/pupa boundary rounds to **5.373 days** (actual about 5.37257); the spec’s 5.372 was truncated. Integer-day stage results are unchanged.
- Narrow chapters without a try-it experiment get a standalone fold so the ring/comparison remains reachable. Screenshot navigation and HUD-test synchronization were necessary QA harness corrections.
- Commits were made on this work branch per the user’s instruction, overriding the spec’s agent-only “do not commit” note. Every completion commit ends with the requested Codex co-author trailer.

A local warmed benchmark averaged approximately **0.00369 ms per solve** over 100,000 evaluations after 10,000 warmups, below the 0.1 ms model target. Representative fixture rendering was about 15 calls / 29,104 triangles (drained: 13 / 25,456). Headless software WebGL does not establish real-device FPS.

The shoot reports **464.9 KB gzip of loaded JS in 11 files**, above docs/02’s 300 KB target. The existing shared-engine `sample-space` measured 484.8 KB / 12 files. The shared bundle budget remains a limitation; this scoped engine completion did not refactor dependencies or bundling. The regression audit also noted an existing `sample-forces` falling beat 2 landing sheet partly behind its presentation caption; other-topic content was left unchanged as instructed.

No requested engine item remains unfinished. Sourced size measurements were deliberately not invented for the fixture; only unit tests use fake sizes. Population simulation, dragging markers/specimens, continuous growth and temperature-dependent wriggling remain excluded v2 work under spec §4.7. Mosquito anatomy, research, finalized prose and illustrations remain the content author’s separate work.

## Completion commits

- `8b01641` — complete validation, fixture geometry, responsive ring and coverage.
- `2d70518` — release prior WebGL scenes between screenshot link checks.
- `1a7612e` — synchronize the existing HUD visibility test with fade completion.
- The documentation/report commit contains this report and the final acceptance record.
