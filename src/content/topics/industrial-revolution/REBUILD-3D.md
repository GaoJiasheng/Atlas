# Industrial revolution — polish record

## Polish 2026-11-03

Executed 2026-11-05. TimeScene text polish; no model or geographical geometry changes.

- **Chinese tin-mine labour:** ch05 now has a short EN/ZH paragraph on Chinese migrants working in Malayan tin mines, recruitment through Singapore, passage debt, receiving depots and repayment through labour. The numerical claim is **at least six recruiting agencies before 1876**, explicitly an agency count, not a miner or mine count. Source S84: Amarjit Kaur, “Labour Brokers in Migration”, International Review of Social History 57(S20), 2012, pp225–252, section “Chinese mining labour and labour brokers” (read 2026-11-05). Exact URL in `data/sources.json`. Indian labour arrangements remain separately explained; no claim of mining in Singapore.
- **Age-appropriate prose:** simplified abstract passages in ch02–07 in both languages. Finance becomes money invested and profits; wages versus productivity becomes output growing faster than pay; resource constraints, institutional changes, migration restrictions and historians' differing explanations are stated concretely. Retained every original sourced quantity tag, date, link target, historian attribution, event id and beat reference. The corresponding topic test source-count expectation now includes S84.
- **Counts:** events **58 → 58**; beats **37 → 37**; sources **54 → 55**; 3D parts **0 → 0**; **3D triangles N/A → N/A** (TimeScene map, no 3D mesh). Control, coal and rail geography unchanged. Control hash in `src/content/topics/ancient-civilisations/scripts/previews/qa-report.json`.
- **Previews:** shared TimeScene offline QA report at `src/content/topics/ancient-civilisations/scripts/previews/qa-report.json`; no industrial visual geometry/camera changes needed a new model raster.
- **Not done:** no scope items deferred for this topic. No browser/desktop, Chromium, e2e or shoot used, per task instructions.

### Gates

- `pnpm check`: passed, 0 errors / 0 warnings / 5 existing hints; final rerun recorded in `/tmp/atlas-polish-check-final.log`.
- `pnpm validate`: passed, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: passed, 191 static pages.
- Full tests passed: **275 files / 6,523 tests**, exit 0, using `pnpm run test --config /private/tmp/atlas-polish-vitest.config.mjs`. The temporary config keeps the normal test include/environment, allows read access to this workspace's external dependency symlink, uses a 30-second test timeout and four workers. Plain runs encountered Vite's dependency-path restriction and pre-existing heavy-geometry timing limits; no project config, package or lockfile changed. Local dependency-cache isolation was temporary.
- Both unapplied patches: dry-run application passed; **19 tests** passed against temporary patched modules (five new regressions plus 14 existing tick/segment tests); a temporary source mirror passed TypeScript checking with both proposals together. The shared engine in the actual worktree was not modified.
- CPU map and text-box previews were rendered and visually inspected. Browser-based gates intentionally omitted under the task's explicit instruction.

## Fix 2026-11-09

- **Chinese tin-mine labour:** checked the new ch05 EN/ZH paragraph against Amarjit Kaur's open-access research article, section “Chinese mining labour and labour brokers” (S84). It describes Chinese migrants working in Malayan mines, Singapore receiving depots, passage debt and repayment through work. **At least six agencies before 1876** counts recruiting agencies in Chinese treaty ports, not workers or mines. The paragraph distinguishes mining in Malaya from Singapore's recruitment and smelting roles. Exact citation and reading notes are in `data/sources.json`; `data/SOURCES.md` is regenerated.
- **Reading level:** finished simplifying ch00 and ch02–07 in both languages, including the remaining abstract language about institutions, public infrastructure, mortality, resource constraints, chronology and consumption. Removed duplicate sentences in ch04/05. New labour wording explains advance-paid travel without adding an unexplained technical term. Historians' differing interpretations, existing sourced dates/quantities and distinctions between slavery, contracts and debt remain.
- **Counts:** sources **54 → 55**; events **58 → 58**; beats **37 → 37**. All **22** original quantity tags retained, with **2** new S84 tags (one per language). 3D parts **0 → 0**, triangles **N/A**. Map/control/coal/rail geometry unchanged; no runtime modules changed.
- **Visual evidence:** `scripts/previews/ch05-labour-en.png` and `ch05-labour-zh.png` are manuscript proofs generated from the actual paragraph, not browser screenshots. The common geometry/quantity audit is in `../ancient-civilisations/scripts/previews/qa-report.json`.
- **Scope note:** the resumed worktree already contained the one-line source-count update in `tests/industrial-revolution.test.ts` (54 → 55). This resumed pass has not edited that test. The inherited source-count expectation matches the additional S84 record.
- **Not done:** no content items deferred. Shared-engine fixes belong to the other topics' unapplied proposals.

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

- S84 checked against the Cambridge page. It says "at least six coolie agencies" were operating in the treaty ports before 1876, and describes the credit-ticket passage debt, the Singapore receiving depots and repayment by labour service. The ch05 paragraph now also says that a worker who had repaid the debt could choose a new employer, as the source states (EN + ZH).
- The CPU manuscript previews under `scripts/previews/` were removed (superseded by browser shots).
