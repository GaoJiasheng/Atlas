# Ancient civilisations — polish record

## Polish 2026-11-03

Executed 2026-11-05. TimeScene map/text work; no 3D mesh, material, animation or mechanism changes.

### Items

- **Participation-card tick labels:** no topic-data option controls the card's tick generation or font metrics. `scripts/timescene-labels.patch` proposes `fitTickLabels`, fitting whole label boxes (including full-width Chinese glyphs) inside the axis bounds, with an 8-unit gap. Marks and dates are retained. The patch also omits the erroneous year-zero label on a mixed BCE/CE axis (the existing S104 explains the convention). At the reproduced 420px card, the English label-box overlap count is **1 → 0**. Patch includes focused regressions.
- **Land anchors:** the same patch replaces the largest-ring centroid with a cached interior pole, respecting holes and retaining the largest-on-screen selection. Existing control polygons are already coast-clipped. All **35** control features checked: off-territory anchors **6 → 0** in the proposed version. Concave and enclosed-water fixtures also pass. No geographical outlines altered.
- **07.3 camera:** `[106, 5], zoom 4` → `[106, 0], zoom 3.6`. The topic’s regional `maxBounds` adds a southern paper margin to -35° (the land sheet and its coastlines remain unchanged), so the engine’s camera clamp permits the authored view. A wider, south-shifted view retains the Java and Sukhothai context while keeping Trowulan above the caption. Offline Web Mercator checks include the actual regional max-bounds/aspect-ratio clamp, at 1920×1080, 1280×720 and 768×1024, EN/ZH, clear the conservative four-line caption footprint. Actual map coordinates were not moved.
- **Indianisation:** ch06 now cites Mabbett's published research extract, S443; removed the unsupported claim about the terminology used by historical people. Cultural transmission is presented as a question historians debate.
- **Mandala:** ch07 and the glossary now describe a model of changing, overlapping claims, sourced to the ISEAS chapter summary by Latif, S444. No literal concentric circles or universal assertion about every kingdom.
- **Slavery/bonded labour:** ch01 removes the broad workforce-share generalisation and links its existing research sources; ch02 links Janzen plus UCL, S129/S446; ch03 adds the CSMVS museum's Ashoka edict evidence, S447; ch07 adds the Lustigs' inscription evidence, S445. No inferred workforce totals or claim that all temple workers had one legal status. All additions are EN/ZH.
- **World Heritage years:** Sanchi 1989, Taxila 1980, Nalanda 2016, Qin mausoleum 1987 and Silk Roads 2014 checked directly against UNESCO's `Date of Inscription` field. Updated existing S216/S218/S217/S231/S235 notes, retaining years and ids.

### References

Exact URLs and reading dates are in `data/sources.json`. New references: Mabbett, Journal of Southeast Asian Studies (1977) published extract; Latif, ISEAS (2008) published chapter summary; Lustig & Lustig, Aséanie 31 (2013), p55; UCL Digital Egypt; CSMVS collection record. Existing qualified Sumer/Egypt evidence retained. UNESCO's five official property pages were read directly on 2026-11-05.

### Counts and visual evidence

- Events **77 → 77**; control keyframes **16 → 16**; control features **35 → 35**; all original beat references and quantity tags retained. Sources **179 → 184**.
- 3D parts **0 → 0**; **3D triangles N/A → N/A**. This topic uses MapLibre 2D geometry. Control data are byte-identical (hash in `src/content/topics/ancient-civilisations/scripts/previews/qa-report.json`); no runtime triangle figure is claimed.
- CPU PNGs, actually inspected: `src/content/topics/ancient-civilisations/scripts/previews/`. Includes before/after camera projections in both languages at three sizes, participation-card close-ups and territory-anchor views. These are geometry/projection previews, not browser screenshots. Reproduce with `python3 src/content/topics/ancient-civilisations/scripts/build-polish-patch.py`, `python3 src/content/topics/space-race/scripts/build-polish-patch.py`, then `pnpm tsx src/content/topics/ancient-civilisations/scripts/preview-polish.ts`.

### Not applied

**Shared engine changes remain unapplied**: `scripts/timescene-labels.patch` contains the complete proposal and tests because shared engine files are outside this task's ownership. Topic data cannot correct those calculations. Browser/desktop, Chromium, e2e and shoot were not run, as requested. Do not treat the offline images as browser acceptance.

### Gates

- `pnpm check`: passed, 0 errors / 0 warnings / 5 existing hints; final rerun recorded in `/tmp/atlas-polish-check-final.log`.
- `pnpm validate`: passed, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: passed, 191 static pages.
- Full tests passed: **275 files / 6,523 tests**, exit 0, using `pnpm run test --config /private/tmp/atlas-polish-vitest.config.mjs`. The temporary config keeps the normal test include/environment, allows read access to this workspace's external dependency symlink, uses a 30-second test timeout and four workers. Plain runs encountered Vite's dependency-path restriction and pre-existing heavy-geometry timing limits; no project config, package or lockfile changed. Local dependency-cache isolation was temporary.
- Both unapplied patches: dry-run application passed; **19 tests** passed against temporary patched modules (five new regressions plus 14 existing tick/segment tests); a temporary source mirror passed TypeScript checking with both proposals together. The shared engine in the actual worktree was not modified.
- CPU map and text-box previews were rendered and visually inspected. Browser-based gates intentionally omitted under the task's explicit instruction.

## Fix 2026-11-09

- **Participation labels:** rechecked the current BandCard and strict chapter/topic schemas: there is no data-level tick-spacing control. Delivered `scripts/timescene-labels.patch`, unapplied for the shared-engine owner, with label-box fitting for EN/ZH and an interior land pole for leader lines. Neither the territory outlines nor the event locations were moved. In the 420px English proof, label overlaps **1 → 0**; across **35** control features, off-territory anchors **6 → 0** in the proposal. All six offending features, including the Mediterranean-surrounding Roman extent, now have raster comparisons. Concave land and an enclosed-water hole are covered by regressions.
- **07.3 camera:** retained and verified the earlier data fix, centre **[106, 5] → [106, 0]**, zoom **4 → 3.6**, with a southern camera margin in `topic.yaml`. Trowulan clears the conservative caption footprint in EN/ZH at **1920×1080, 1280×720, 768×1024**; the smallest clearance is **46.2px** in the 1280px proof. Camera coordinates and zoom are display choices.
- **Claims:** reread the public Mabbett extract (S443), Latif/ISEAS chapter summary (S444), Lustig & Lustig p55 (S445), UCL's slavery discussion (S446), and CSMVS's Ashoka edict record (S447). EN/ZH qualify Indianisation, mandala and bondage; the unsupported Sumerian workforce-share generalisation remains removed. UNESCO's official listing-year fields confirm **Sanchi 1989, Taxila 1980, Nalanda 2016, Qin mausoleum 1987, Chang'an–Tianshan corridor 2014** (S216/S218/S217/S231/S235). The previously omitted Olympia listing year remains omitted. Updated reading notes and regenerated `data/SOURCES.md`; all URLs are in `data/sources.json`.
- **Counts:** sources **179 → 184**; beats **41 → 41**; events **77 → 77**; control keyframes **16 → 16**, features **35 → 35**. All **94** original quantity tags retained. 3D parts **0 → 0**, triangles **N/A**. `control.json` is byte-identical. No shared runtime JS was changed.
- **Deliverables:** moved all inherited polish generators, patches and previews under this topic's owned `scripts/` directory. Reproduce with the two topic-local Python generators followed by `pnpm tsx src/content/topics/ancient-civilisations/scripts/preview-polish.ts`. Evidence: `scripts/previews/qa-report.json`, `trowulan-*.png`, `participation-*.png`, `anchor-*.png`.
- **Not live:** participation tick fitting and land-anchor selection await the shared-engine owner's application of the patch. These are verified proposals, not claimed as deployed fixes.

- **Verification:** offline previews were regenerated and inspected on 2026-11-09. Browser, Chromium, shoot and e2e were not used under this brief. Source geometry and every original quantity tag, beat date and highlighted reference were checked against HEAD; all are retained. Gate results for this resumed pass are recorded below when complete; earlier 2026-11-05 results above are historical.

### Resumed-pass gates (2026-11-09)

- `pnpm check`: **pass**, 1,207 files, 0 errors / 0 warnings / 5 existing hints. Log: `/tmp/atlas-timescene-20261109-check-final.log`.
- `pnpm validate`: **pass**, 94 topics, 0 errors / 0 warnings. Log: `/tmp/atlas-timescene-20261109-validate-final.log`.
- Full suite: **275 files / 6,523 tests pass**, exit 0. Command: `pnpm run test --config /tmp/atlas-timescene-20261109-vitest.config.mjs --testTimeout=30000`. The temporary config preserves the project's test include and Node environment and only permits Vite to read this worktree's external dependency symlinks. The CLI timeout accommodates unrelated heavy toad/sauropod geometry tests; earlier runs hit the dependency-path restriction or 5-second timing limit. No tests were skipped or assertions relaxed; no project config, dependency or lockfile changed. Log: `/tmp/atlas-timescene-20261109-test-complete.log`.
- `pnpm build`: **pass**, 191 static pages; the emitted EN/ZH industrial pages contain the final labour wording. Log: `/tmp/atlas-timescene-20261109-build.log`.
- Map first-load JS: **480.17 → 480.17 KB gz** for each of the three topics, using `scripts/js-budget.ts` before/after the build. Final `--check` passes. No runtime imports added; preview tools are outside the client import graph.
- Both engine proposals: dry-run application passes; **19 regression tests pass** in a temporary copy. A source mirror containing both patches passes TypeScript checking. The real shared engine remains untouched. `git diff --check` passes.
- Offline CPU rasters inspected, including Roman sea/land anchors, EN/ZH captions and participation labels, all three Apollo axis widths, and both labour paragraphs. Browser/desktop/Chromium/e2e/shoot were not used, as instructed; GPU/browser acceptance remains with the main session.

## Acceptance 2026-11-09 (Claude, GPU browser)

- The main session applied both engine proposals. The patch generators, preview script and CPU previews under `scripts/` were removed: they described unapplied patches and are superseded by the engine code and its tests.
- **Leader anchors:** changed the rule to "outer-ring centroid when it lies on the polygon, else the pole of inaccessibility". The Codex version moved almost every anchor in every map topic onto the territory-name point, so leaders ended inside the area's own name. Across all inline control data, 39 of 1,513 anchors change (ww2 17, four-taps 14, ancient-civilisations 6, warring-states 2). All 39 moved from water or a concavity onto land, and every other anchor stays where it was.
- **07.3 camera:** Codex's z3.6 view with a 35°S paper margin fixed the Trowulan overlap. But it left about 45 % of the stage as blank paper, and the larger sheet re-framed six other beats (background, greece-and-rome 5, legacies, seas 5). Now the beat uses centre [106, 2] at z4.0 and the south margin is 22°S only. Java sits above the caption, and the other beats keep their framing.
- **Participation ticks:** checked in a GPU browser at 1920×1080 in EN/ZH and paper/cinema. On main, "3000 BCE2000 BCE 0" overlapped; now "3000 BCE … 1000" shows with no year 0.
- Wording: ch06 names Mabbett as a historian (EN + ZH). Removed a stray space before a ZH citation in ch02 and stray spaces in ZH source notes.
