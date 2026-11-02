# plates-and-hazards — fixes for Codex (browser acceptance, 2026-10-27)

The browser acceptance fixed the small problems in place (see docs/49 §9.4). These three items need a rework of the data or the loader, so they are left for Codex. None of them blocks Gavin's content read. Keep `status: draft`.

## F1 · Load catalogue text only when something needs it

**What happens now.** `controller.ts` `loadDatedLayers()` fetches a layer's catalogue together with its geometry the first time the layer is switched on. The background chapter switches on the four PB layers and the volcano layer, so the first screen downloads all five catalogues:

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

## F2 · Readable time rows in the earthquake catalogue

**What happens now.** The `ph-catalogue-quake-sample` rows `epoch` ("UTC epoch ms") and `updated` ("Updated ms") are numbers. The inspector formats them with thousands separators, for example `1,645,753,166,554`. Nobody can read that as a time. See `shots/plates-and-hazards/en-paper/catalogue-felt-in-singapore.png`, produced by `pnpm shoot plates-and-hazards --beats`.

**Expected.**
- Have `build-data.ts` emit these two rows as bilingual text values holding the exact ISO-8601 UTC timestamp with milliseconds, for example `2022-02-25T01:39:26.554Z`. Keep the exact original value, as docs/49 §3.3 step 5 requires; only the presentation changes.
- Label them "UTC origin time / UTC 发震时刻" and "Catalogue updated (UTC) / 目录更新时间（UTC）".
- Regenerate the provenance hashes and update `tests/plates-and-hazards.test.ts`.

## F3 · Eruption-episode rows read as raw database fields

**What happens now.** The three volcanoes with selected GVP episodes are Tambora `gvp-264040` (episode 16231), Krakatau `gvp-262000` (15589) and the 2018 episode 22275. Each carries about 18 rows per episode, labelled with the raw GVP field names: `16231 StartDateYearModifier`, `16231 ExplosivityIndexMax` and so on. Most of these rows read "Not recorded".

The inspector also formats every number with grouping, so the inspector shows the years as **1,812** and **1,815**, the eruption number as 16,231 and PB `SEQNUM` as 1,327. See `shots/plates-and-hazards/en-paper/catalogue-tambora-1815.png`, produced by `pnpm shoot plates-and-hazards --beats`. These are the cards readers reach from chapters 01, 02 and 05.

**Expected.**
- Reduce each episode to a few readable bilingual rows:
  - eruption record number;
  - VEI;
  - start and end dates, with their original uncertainty and modifier stated in words. For example, "1812 (± 182 days on the start day) – 15 July 1815 (?)".
- Keep the raw fields in `provenance/`, not in the reader card.
- Identifiers and years must never get thousands separators. Either emit them as text values, or give catalogue rows an explicit plain-number format in `catalogueSchema.ts` and `CatalogueInspector.tsx`, and use it for `sequence`, eruption numbers and years.
- Update the tests, then re-shoot 01, 02 and 05 in EN and ZH.
