# Space race — polish record

## Polish 2026-11-03

Executed 2026-11-05. TimeScene timeline spacing.

- **Root cause:** ch05 covers eight days, but its equal-width chapter segment runs until ch06 starts on 17 April 1970. The first five beats are compressed to the existing engine's minimum 10px spacing; the first two genuinely share 16 July. Changing historical dates does not solve the physical spacing. The current beat schema has no display-position field.
- **Complete proposal:** `scripts/ch05-beat-spacing.patch` adds an optional `axisPosition` fraction to beat data, carries it through the view into the shared segment scale, and authors ch05's five fractions as **0 / 0.25 / 0.5 / 0.75 / 1**. These numbers are layout choices, not historical quantities. All original dates, beat ordering, event highlights, index references and captions stay exact. No other chapter's mapping changes. Duplicate-date anchored seeking is covered by the patch's regression test.
- **Counts:** ch05 beats **5 → 5**, topic beats **40 → 40**, events **45 → 45**, sources **47 → 47**. No live historical date or content changes. Preview's minimum gap **10px → 224.25px** in the 897px demonstration segment; a normal smaller segment uses the same fractions. Exact report in `src/content/topics/ancient-civilisations/scripts/previews/qa-report.json`.
- **Geometry/performance:** 3D parts **0 → 0**; **3D triangles N/A → N/A** (TimeScene). Control data byte-identical; no MapLibre runtime triangle figure claimed.
- **Visual verification:** CPU-rasterised and actually inspected `src/content/topics/space-race/scripts/previews/ch05-beat-dates-1080.png`, clearly labelled BEFORE / PATCH. It illustrates proposed, not live, output. Reproduce with `python3 src/content/topics/space-race/scripts/build-polish-patch.py`, then the ancient topic's offline preview script.
- **Not applied:** the runtime fix needs schema/view/scale edits outside the three topic directories, so the patch is delivered **unapplied**. Valid existing beat data alone cannot provide distinct display fractions. This remains pending application by the shared-engine owner; it is not reported as a live fix. No browser/desktop, Chromium, e2e or shoot used, per instructions.

### Gates

- `pnpm check`: passed, 0 errors / 0 warnings / 5 existing hints; final rerun recorded in `/tmp/atlas-polish-check-final.log`.
- `pnpm validate`: passed, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: passed, 191 static pages.
- Full tests passed: **275 files / 6,523 tests**, exit 0, using `pnpm run test --config /private/tmp/atlas-polish-vitest.config.mjs`. The temporary config keeps the normal test include/environment, allows read access to this workspace's external dependency symlink, uses a 30-second test timeout and four workers. Plain runs encountered Vite's dependency-path restriction and pre-existing heavy-geometry timing limits; no project config, package or lockfile changed. Local dependency-cache isolation was temporary.
- Both unapplied patches: dry-run application passed; **19 tests** passed against temporary patched modules (five new regressions plus 14 existing tick/segment tests); a temporary source mirror passed TypeScript checking with both proposals together. The shared engine in the actual worktree was not modified.
- CPU map and text-box previews were rendered and visually inspected. Browser-based gates intentionally omitted under the task's explicit instruction.

## Fix 2026-11-09

- **Ch05 first three beats:** rechecked the current strict beat schema, View segment construction and segment scale. No existing beat-data field can spread identical dates over a chapter segment. The segment ends at ch06's start in April 1970, compressing Apollo's July 1969 week; inventing replacement dates or deleting beats would misrepresent the story.
- **Proposal:** `scripts/ch05-beat-spacing.patch` adds optional `axisPosition` fractions and authors **0 / 0.25 / 0.5 / 0.75 / 1** on ch05's five beats. These are design positions. All dates (**16 / 16 / 20 / 21 / 24 July 1969**), ids, ordering, captions and highlights are retained. The patch includes its required schema/View/scale plumbing and a regression covering the actual **seven-chapter** axis, duplicate-date anchored seeking, all five date inversions and unchanged other segments.
- **Improved evidence:** replaced the inherited two-segment/897px demonstration with the full seven-chapter axis. At total axis widths **700 / 1080 / 1600px**, minimum ch05 tick gaps are **10 → 23.5 / 37.1 / 55.6px**, respectively. Source: direct calculation from the current/proposed `createSegmentScale`, not a historical quantity. Actually inspected `scripts/previews/ch05-beat-dates-700.png`, `-1080.png`, `-1600.png`; the dates and proposal status are printed on each raster.
- **Counts:** ch05 beats **5 → 5**; topic beats **40 → 40**; events **45 → 45**; sources **47 → 47**; all **54** original quantity tags retained. 3D parts **0 → 0**, triangles **N/A**. `control.json` and the live chapter data remain byte-identical. No shared runtime JS changed.
- **Not live:** the beat-data proposal requires shared schema/view/scale edits outside ownership. Patch delivered unapplied in the topic's `scripts/` directory for the main session; the live overlap therefore remains pending that application. No historical facts or EN/ZH text needed changing.

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

- Main session applied the engine patch. `scripts/build-polish-patch.py` and the CPU previews were removed (superseded).
- ch05 axis positions changed from 0/.25/.5/.75/1 to **0/.2/.4/.6/.8**: at 1.0 the fifth beat sat on the chapter-06 start tick. At 1920×1080 the five beats are now evenly spaced, and the last one keeps a clear gap before 06. At 1024×768 the beat ticks are folded on main and on the branch alike.
