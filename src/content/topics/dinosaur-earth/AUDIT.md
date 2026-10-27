# Dinosaur Earth · factual and data audit

2026-10-27. Authoring contract: `docs/47-dinosaur-earth-content-spec.md`, including its engine record. This audit distinguishes the completed data work from application/browser acceptance. No runtime external data source is used. Sources are paraphrased, with no long quotation or republished third-party scientific figure.

## Fact disposition

The spec's47 adopted/rejected fact records remain **28 verified /3 changed /16 cut**. `verified` reflects the original-source/data review recorded in spec§0.3; this content task reread the dossier and fixed local data and does not claim a new independent download of every source. `changed` narrows the museum and PBDB claims; `cut` records omitted scope, not proof that the original statement was false.

Verified: F001,F002,F003,F004,F009,F014,F017,F019,F020,F021,F022,F023,F028,F031,F032,F033,F034,F039,F041,F050,F051,DE001,DE002,DE003,DE004,DE005,DE006,DE007. Changed: F026,F027,F036. Cut: F010,F011,F012,F016,F018,F024,F025,F029,F030,F037,F038,F040,F044,F045,F048,F052. No cut claim is reintroduced in the metadata, points, cards, glossary or source summaries.

Numerical source table, design choices DS01–DS03, complete PBDB query URLs and source alias mapping are in `data/SOURCES.md`. Runtime source IDs omit leading zeros and map the DE labels to S61/S62/S64/S65/S66. S67 explicitly marks original editorial/UI/illustration choices as design values. There are26runtime sources (25research/data sources plus one design source) and15glossary entries. These counts are implementation counts, not natural facts.

## Dataset evidence

`build.py` reads ten official already-opened PaleoDEM CSV members, verifies original SHA256/CRC, grid uniqueness, finiteness and1°spacing, and creates ten independently loadable named TopoJSON objects. Stable numeric ages are250,230,200,170,150,130,100,70,65,0Ma. Nearest-sample categorical cell union uses z>0, zero assigned non-land; source-domain and polar cuts do not become coast lines. Collinear polar fill edges spanning more than180°are subdivided without any geometric displacement so the loader can reject real transverse bridges. No frame is hand-drawn, modern-filled, warped or renamed66Ma.

K250/K0 were produced and their paired source/output plots inspected before expanding to all frames; all remaining eight pairs were then inspected with the local image viewer. The source interiors and published land agree at the stated categorical sampling scale. The independent existing topojson decoder and ringIssues checker report2317ancient/unavailable rings, zeroArea0,selfCrossing0. Modern NE geometry additionally has128land rings and264country rings, also0/0. Coast cut checks pass. Model seam inconsistencies remain recorded rather than silently repaired.

Two fixed PBDB snapshots are stably deduplicated by occurrence before Malaysian protection exclusion and collection grouping. Counts:2000global+167regional−61duplicates=2106unique;3MYoccurrences/3collections suppressed;2103public occurrences,1274collections,61countries. The815original bibliographic strings for public retained records are deployed once in `public/geo/de-pbdb-references.json`, available offline in each occurrence inspector, and independently recorded in `scripts/geo/dinosaur-earth/publication-references.json`. Each runtime occurrence retains the original PBDB reference number and age bounds; all2103references resolve. Chinese coordinate-basis explanations are translated while original publication titles remain unchanged. No original MYidentifier, coordinate or precise locality prose is copied to publication files. The region-only Pahang card contains no coordinate field.

Collection24178has3occurrences, each121.4–100.5Ma. The closed-interval browse rule operates on each occurrence rather than an envelope, and the±5Ma half-window is labelled design. Two reference points and four editorial cards do not count as fossil collections. Cards preserve their independent region/country precision and stratigraphic context.

All18public `de-*.json` assets total1,924,316bytes; adding the28,388-byte compact topic response gives1,952,704bytes, below2,000,000 including original bibliography and descriptive point metadata. Input/output hashes and exact individual byte counts are in `scripts/geo/dinosaur-earth/build-report.json`. Reproduce and verify with:

```sh
python3 scripts/geo/dinosaur-earth/build.py
pnpm tsx scripts/geo/dinosaur-earth/verify.ts
```

## Art and licence scope

The three approved source PNGs were individually inspected before running the project's existing illustration processor. The cover is a generic three-forward-toe footprint, not an identified specimen; strata are a conceptual five-main-layer block, not a measured K–Pg section; the asteroid is conceptual, with no asserted exact shape, flame or injury. Source raster metadata1024²and1536×1152are file dimensions, not scientific quantities. Standard trimming/grayscale/alpha preservation and WebP encoding are followed by byte-only encoding optimisation; compositions are unchanged. `process-art.ts` records the reproducible commands. No new image generation or third-party photograph is used. Final encoded files were visually inspected: cover800px65,226bytes; cover1600px255,548bytes; strata1200×900118,092bytes; asteroid1200×90094,556bytes.

Upstream PaleoDEM CC BY4.0 attribution and changes are retained; Atlas derived frame geometry is CC BY-NC-SA4.0 as specified. PBDB-derived facts remain CC0; NE geometry remains public domain. Original editorial cards/manifests/prose/art remain Atlas CC BY-NC-SA4.0. File families stay separate, with notices in LICENSE-CONTENT and THIRD-PARTY-NOTICES.md. No CC BY-SA/NC-SA mixing or agreement-restricted source is used.

## Application acceptance boundary

`pnpm tsx scripts/geo/dinosaur-earth/verify.ts` passes the actual deployed dataset checks. The root agent owns final check/validate/test/build results, scientific-state/caption unit tests and integration records. Browser shoot/e2e are explicitly skipped here per BRIEF-CONTENT sandbox instructions; true iPad/GPU performance and gzip/interactive measurements are pending, not passed. The sibling target topic's absence and the six prescribed target chapters are listed in REVIEW.md. `published` records the user's direct publication instruction; it is not a claim that these unexecuted gates passed.

Content integration check at the completed-chapter stage: `pnpm validate` read58topics and returned14errors/0warnings, all exclusively the absent `fossils-and-skeletons` TopicLink target (EN/ZH occurrences). No data, source-ID, glossary, coordinate-space, frame or metadata error was reported. This is a recorded failing gate, not a pass; root integration owns the prescribed sibling-link handling.


Final integration gates: `pnpm check` 0 errors/0 warnings (3 pre-existing hints); `pnpm test`164 files/4312 tests passed. `pnpm validate`58topics/14errors/0warnings, exclusively the prescribed absent-sibling links. `pnpm build` stops on those validation errors. Direct `pnpm exec astro build` generated119pages successfully; it does not waive link validation. Static compressed dependency auditing identifies the map-ready JS path at458,408gzip bytes, above400,000; exact bytes/method and the combined public-map/topic-payload budget are in bundle-report.json. Shoot/e2e/visual regressions and actual-device p95 remain unexecuted as required by the briefs.
