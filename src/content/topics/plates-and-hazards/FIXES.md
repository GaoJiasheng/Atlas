# plates-and-hazards — fixes for Codex (browser acceptance, 2026-10-27)

The browser acceptance fixed the small problems in place (see docs/49 §9.4). These three items need a rework of the data or the loader, so they are left for Codex. None of them blocked Gavin's content read. This follow-up preserves the topic's existing `status: published`, as requested.

## [x] F1 · Load catalogue text only when something needs it

**Before this fix.** `controller.ts` `loadDatedLayers()` fetches a layer's catalogue together with its geometry the first time the layer is switched on. The background chapter switches on the four PB layers and the volcano layer, so the first screen downloads all five catalogues:

| first screen (`?ch=background`) | raw | gzip -9 |
|---|---|---|
| geometry: 4 × `ph-plate-*` + `ph-volcano-catalogue` | 690 KB | 118 KB |
| catalogues: 4 × `ph-catalogue-plate-*` + `ph-catalogue-volcano-catalogue` | 2,080 KB | 121 KB |

The background chapter's index lists only the Tambora volcano entry. The 1.43 MB of PB catalogue text is not used until the reader clicks a line or opens chapter 01's index. You can check the request list with `pnpm shoot plates-and-hazards --perf`, or in a Playwright session at `/en/topics/plates-and-hazards/?ch=background`.

**Expected.**
- Fetch geometry when the layer is switched on, as now.
- Fetch a layer's catalogue on the first of these:
  - its layer appears in the current `catalogueIndex`;
  - a GPU hit on that layer;
  - a `pick` deep link that resolves to it.
- Keep `catalogueState().layers[id].status` honest. A layer whose geometry is ready but whose catalogue is still loading reads `loading` for selection purposes, and `pick` waits for it as it does today.
- Unit-test the ordering (geometry ready, catalogue pending, then a pick resolves) and the error path.
- Then re-run `pnpm shoot plates-and-hazards --beats --perf`.
- Record the new first-screen numbers in docs/49 §9.

## [x] F2 · Readable time rows in the earthquake catalogue

**Before this fix.** The `ph-catalogue-quake-sample` rows `epoch` ("UTC epoch ms") and `updated` ("Updated ms") are numbers. The inspector formats them with thousands separators, for example `1,645,753,166,554`. Nobody can read that as a time. See `shots/plates-and-hazards/en-paper/catalogue-felt-in-singapore.png`, produced by `pnpm shoot plates-and-hazards --beats`.

**Expected.**
- Have `build-data.ts` emit these two rows as bilingual text values holding the exact ISO-8601 UTC timestamp with milliseconds, for example `2022-02-25T01:39:26.554Z`. Keep the exact original value, as docs/49 §3.3 step 5 requires; only the presentation changes.
- Label them "UTC origin time / UTC 发震时刻" and "Catalogue updated (UTC) / 目录更新时间（UTC）".
- Regenerate the provenance hashes and update `tests/plates-and-hazards.test.ts`.

## [x] F3 · Eruption-episode rows read as raw database fields

**Before this fix.** The three volcanoes with selected GVP episodes are Tambora `gvp-264040` (episode 16231), Krakatau `gvp-262000` (15589) and the 2018 episode 22275. Each carries about 18 rows per episode, labelled with the raw GVP field names: `16231 StartDateYearModifier`, `16231 ExplosivityIndexMax` and so on. Most of these rows read "Not recorded".

The inspector also formats every number with grouping, so the inspector shows the years as **1,812** and **1,815**, the eruption number as 16,231 and PB `SEQNUM` as 1,327. See `shots/plates-and-hazards/en-paper/catalogue-tambora-1815.png`, produced by `pnpm shoot plates-and-hazards --beats`. These are the cards readers reach from chapters 01, 02 and 05.

**Expected.**
- Reduce each episode to a few readable bilingual rows:
  - eruption record number;
  - VEI;
  - start and end dates, with their original uncertainty and modifier stated in words. For example, "1812 (± 182 days on the start day) – 15 July 1815 (?)".
- Keep the raw fields in `provenance/`, not in the reader card.
- Identifiers and years must never get thousands separators. Either emit them as text values, or give catalogue rows an explicit plain-number format in `catalogueSchema.ts` and `CatalogueInspector.tsx`, and use it for `sequence`, eruption numbers and years.
- Update the tests, then re-shoot 01, 02 and 05 in EN and ZH.

## Completed changes (2026-11-02)

- **F1:** Split geometry preparation/drawing from a demand-driven catalogue loader. Current chapter/beat indices, GPU picks and geometry-resolved deep links request only their layer's text, once. Selection remains `loading` until geometry and text are ready; errors clear invalid picks without suppressing usable geometry/counts. Background index now lists only Tambora, matching this handoff's intended first screen; all four PB geometries remain enabled. Tests cover both load orders, pending deep links, unrelated unrequested text, empty geometry, text/geometry errors and disposal. Browser QA waiters now distinguish enabled geometry from indexed text; no wait on unused catalogues. First-screen artifact sizes are recorded in docs/49 §9.5.
- **F2:** Origin/update rows are bilingual exact ISO-8601 UTC timestamps with milliseconds and the requested labels. All source timestamps round-trip exactly. Depth moved into the bilingual summary to retain the per-file byte limit. Tests check timestamp form, labels, day filtering and exact 2004/2022 source values. Output hashes regenerated.
- **F3:** Each selected episode has four rows: confirmed eruption record number, VEI, start and end. Dates keep exact source days, ±182-day uncertainty and doubtful end-date modifiers in words. Complete raw selected records now live in `provenance/selected-eruptions.json`, included in regenerated provenance hashes. PB sequence and eruption identifiers are text, so years and identifiers have no grouping separators.
- **Readability:** Rewrote both locales across all eight chapters, 38 captions, nine event/place cards, 15 glossary definitions, figure captions/alt text and topic layer/PLATE notes. Kept factual values, source references, models, cameras, links and event identities. Audit note added.

Non-browser checks pass: `pnpm check` (0 errors / 0 warnings, four existing hints), `pnpm validate` (94 topics), `pnpm test` (234 files / 6,094 tests) and `pnpm build` (191 pages).

Browser follow-up only: `pnpm shoot plates-and-hazards --beats --perf` and EN/ZH shots of chapters 01/02/05 are intentionally **not run** under BRIEF-READ's no-browser instruction. No e2e, user-browser/desktop automation or git writes.

**Acceptance follow-up (2026-11-02).** Exact ISO milliseconds are not readable for P4–P6 readers. Quake rows now read "26 Dec 2004, 00:58 UTC" / "2004年12月26日 00:58（UTC）" and "Record last updated: 5 Jun 2026"; exact millisecond values moved to `provenance/quake-times.json`. Eruption rows carry their eruption years and plain-word uncertainty. See AUDIT.md.
