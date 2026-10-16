# Warring States second-pass delivery review

English and Chinese editorial drafts are complete. The topic remains `draft`: content validation and type checking do not replace historian review or establish precise ancient boundaries.

## Requested checks

- `pnpm exec tsc --noEmit -p tsconfig.json`: clean after replacing untyped JSON use with narrowing, typed tuples and checked indexed access. Every topic TypeScript file has zero explicit `any` types, non-null assertions or suppression directives.
- `pnpm tsx scripts/geo/lib/colour-holders.ts --topic warring-states --write`: run on the regenerated map; 21 represented holders, 70 neighbouring pairs across all 11 keyframes, 8 tokens, zero conflicts. The check-image palette now exports that same assignment.
- Regional land already existed; no land regeneration was required.
- `pnpm validate`: 23 topics, 0 errors, 0 warnings. `pnpm exec tsc`: clean.
- No build, test, e2e or shoot was run. Edits are confined to the topic and its geography folder; no engine or package manifest changes.

## Content and source review

Original audit accounting: **53 units; 5 fully closed and 48 remaining**, including partially resolved questions. All 26 routes were reviewed; their retained station order, deleted unsupported stops, source passages and remaining uncertainty are in their dedicated S170–S195 bilingual notes. Exact roads, many crossings and some site identifications remain open. The runtime movement schema has no `note` field, so the notes are stored in these route-specific sources and the Movement routes table, with schematic movement labels.

Substantive corrections include removing unsupported early migration stations; removing Chaoge from the Jin approach and unsupported Wu campaign stops; replacing Pinglu with the source's Daliang direction; distinguishing the 229 BCE `shangdi` from Shangdang; and replacing Li Xin's contradictory eastward line with an explicitly disputed westward Father-city/Baofeng interpretation. Named city coordinates were checked separately from battlefield precision. Conflicting Chengpu/Maling P625 statements were not adopted blindly. The inventory preserves missing statements and redirects as evidence of limits, not successful identifications.

Official museum object pages replace the unverified Shang Yang measure / Du tally research target; the Zeng bell count is checked against the museum record. Zhang Guangzhi's checked discussion gives a named modern source for Changping numerical objections and the limits of the Yonglu sample. The original excavation report and original demographic models remain unconsulted. The unsupported narrow Dujiangyan construction range and unused Gu Donggao war-count research target were removed. Wey's 209 BCE chronology is reconciled with the transmitted regnal sequence; its precise final residence remains open. Chu's 224/223 BCE chronology and Li Xin's inferred date are qualified in both languages.

Details: [AUDIT.md](AUDIT.md), [HISTORICAL-REVIEW.md](HISTORICAL-REVIEW.md), [data/SOURCES.md](data/SOURCES.md), and the saved [coordinate inventory](../../../../scripts/geo/warring-states/verification-sites.json).

## Registration changes

No residuals were made smaller by inventing control points. G11's over-budget fit, G13's five controls, G17's eight controls and G16's absent fit remain documented; these sources are excluded from all frame dependencies. G15 is also excluded. G8 has RMS 7.869 km, maximum 18.958 km and leave-one-out maximum 21.033 km. Its 280 BCE outlines are carried forward in K9, selectively reassigned in K10 and unioned schematically in K11. The missing Zhou face is not invented. These are explicitly qualified teaching approximations, not independently recovered 260/230/221 BCE boundaries.

Final geometry: **128 features; 431 rings; zero zero-area rings; zero self-crossings**. Real-land clipping retained every incoming holder. Early G10 dating, missing minor-state geometry, borrowed Three Jin boundaries, coastline changes and clipping losses remain disclosed. Every published feature is approximate; Chinese labels mirror the English geographic caveats.

Details: [SOURCES-GEO.md](../../../../scripts/geo/warring-states/SOURCES-GEO.md) and [SECOND-PASS-GEO.md](../../../../scripts/geo/warring-states/SECOND-PASS-GEO.md).

## Chinese drafts and human review

All bilingual fields have Chinese drafts; no translation marker remains. Each chapter main body contains 350–500 Han characters, counted without frontmatter, markup, digits, punctuation or More blocks. Complete Num/Term opening-tag sequences match English, including source and term IDs. The existing 17 glossary terms are retained to preserve the first-draft links and chapter tag structure.

| Chapter | Main-body Han characters |
|---|---:|
| 00 | 358 |
| 01 | 350 |
| 02 | 361 |
| 03 | 360 |
| 04 | 369 |
| 05 | 354 |
| 06 | 364 |
| 07 | 369 |
| 08 | 363 |
| 09 | 364 |
| 10 | 359 |

Machine-readable measurements: [CHINESE-DRAFT-CHECKS.json](CHINESE-DRAFT-CHECKS.json).

A historian should check the Chinese Changping passage and Yonglu interpretation; all killing, human-sacrifice, occupation, mutilation and water-attack passages; the Chu campaign chronology and Father-city interpretation; Qin's killing of “诸生”; and the disputed sites/routes and late-frame carry-forward. Publication review of the sensitive Chinese passages has not been claimed. The detailed outstanding questions and exact original audit dispositions are in AUDIT.md.

Counts after this pass: 11 keyframes, 128 control features, 23 entities, 173 events, 26 routes, 116 source records, 11 chapters, 49 beats, 17 glossary terms, 8 presets and 60 river features.
