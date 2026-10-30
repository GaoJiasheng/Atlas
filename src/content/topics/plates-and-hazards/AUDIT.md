# Plates and hazards — content evidence and verification record

Prepared 27 October 2026. Status remains **draft** for Gavin's Chinese review. The approved basis is `docs/49-plates-and-hazards-content-spec.md`, especially §§0.2–0.3, 6 and the implemented engine contract in §9. Research inputs in the main checkout were read-only. This record distinguishes specification verification from fresh construction-session source checks.

## Evidence actually used

The final specification records a 68-fact audit: **45 verified, 4 changed, 19 cut**. Those are the specification's review outcomes, not a claim that this content writer reopened 68 original publications. The writer read the specification, parent fact ledger and dossier, supplemental PH facts, inventory/coverage and licence records, then traced chapter claims to the final fact/source mapping.

The lead construction session freshly reopened **S21 (USGS eruption table), S22 (USGS/HVO Tambora account), S17 (NOAA/ITIC October 2024 poster) and S23 (BCA tremor guidance)** on 27 October 2026 and confirmed the sensitive facts. Other original-source access outcomes and dated checks are inherited from the approved specification. The final content read also moved the magnitude Term wrapper to its actual first occurrence in chapter 03’s sample paragraph, in both languages. Source notes say “approved specification reading record” rather than claiming a new open in this content-writing subtask. Frozen dataset collection remains 26 October 2026; reading dates are not relabelled publication dates.

| Chapter / location | Evidence and decision |
|---|---|
| 00, body and reference explanation | F01/F04/F26/F53/F54/PH04 → S7/S12/S35/S37/S604. Lithosphere includes crust and rigid uppermost mantle. Plate edges differ from coast; modern reference positions are not an 1815 reconstruction or activity map. |
| 01, body ¶2 and estimates More | F40 → S22 published 2011-09-29 and S21 accessed 2026-10-27. More-than 70,000 deaths in surrounding areas and 92,000, principally starvation, remain separate attributed historical estimates. No average or invented statistical interval. |
| 01, episode and caldera More | F39/PH04 → S19/S604; VEI 7 belongs to the 1812–1815 episode. Uncertain episode dates are not replaced by the NCEI disaster day. F23 uses final-spec S45, not the un-reobtained JNTO citation in the older parent ledger. |
| 02, body ¶3 and historical estimate More | F41 → S21 accessed 2026-10-27. About 36,000 deaths and detailed historical estimate 36,417, principally tsunami deaths; no assertion all died from lava. NCEI deaths/deathsTotal are never added. |
| 02/04/05, observations | PH03/PH05/PH06 → S603/S605/S606. Event-specific associated locations and original measurement types; no heights or arrival values, guessed coordinates, inundation polygon or time-of-arrival replay. Missing records do not prove no wave arrived. |
| 03, boundary motion | F10–F13/PH04 → S7/S37/S45/S604. PB segment classes drive the categories. Continental collision is distinct from subduction; broad orogens are model zones, not shared risk levels. |
| 03/04, earthquake points | F25–F27/F29/F34/F38/F59 → S6/S12/S44/S54. Epicentre, rupture, magnitude and local intensity stay distinct. Dot radius is display encoding. USGS Mw 9.1 and MSS 9.2 retain attribution. The tsunami flag does not drive historical association. |
| 04, body ¶3–4 | F35/F36 → S17 October 2024, 227,899 dead or missing and presumed dead in 15 countries. Cause of death cannot be fully separated between earthquake and tsunami. Four country values use that same column and source date and are expressly incomplete. |
| 04, alternative summaries More | F37 → S16/S609. SOS >230,000/14 countries is another source summary, read 2026-10-27; JetStream's 17 countries concerns affected scope. No averaged account. |
| 04/05, water behaviour | F30–F32/F61 → S12–S15/S57. Sudden water displacement, long waves, shoaling, first wave not necessarily largest, and withdrawal not guaranteed. No wave-speed formula or event-specific reconstructed height. |
| 05, collapse and episode dates | F42/PH03/PH04 → S12/S603/S604. Collapse 2018-12-22 is distinct from eruption episode starting 2018-06-18 and ending 2020-04-17. Reference volcano centre is not a measured collapse centre. |
| 06, felt event and models | PH01/PH02/F43 → S601/S602/S12/S37. 2022-02-25 Singapore felt reports differ from source parameters; EOS 6.2 versus reviewed USGS 6.1/mww/depth 4 km have explicit versions. Sunda and broad Eurasian descriptions use different model resolution. |
| 06, body ¶3–4 and official guidance More | F44/F45/F47/F60 → S23/S25/S12/S611. BCA is 建设局. Guidance read 2026-10-27 is attributed; no absolute safety promise, individual building grade or invented base isolation. Relative shelter does not mean zero effects. |
| 07, sample and definitions | PH04/F15–F18/F29 → S604/S11/S12/S45. 3,729 reviewed catalogue M≥6 records in the frozen 2000–2024 sample; heterogeneous magType, not a trend or forecast. GVP's 687/1,214/57% is v5.4.0 only, in More. No invented Ring of Fire polygon or map-derived membership statistic. |

The 19 cut facts in spec §0.3 stay cut: no Wegener/deep-time lesson, magnetic/GPS lesson, underground reservoir diagram, degassing/viscosity lesson, ash-size threshold, energy multiplier, wave-speed calculation, unverified engineering clauses, Pinatubo Singapore expansion, visitor information, educational-study sample numbers, bathymetry, ancient reconstruction or GEM active faults. No unverified MOE wording is copied into the lesson or presented as an exam requirement.

## Bilingual and structural checks

- 8 chapter files: background plus 7 chapters; exact spec chapter order, dates, camera parameters and layer expansion.
- 38 beats, distributed 4/5/5/5/5/4/5/5. Captions were copied from the approved §2.2 table; every beat explicitly states time, camera, layers and highlight. No borders layer is added.
- Every body has 4 paragraphs. Mechanical body-only counts: EN 229/228/241/220/227/241/244/252 words; ZH 369/351/361/360/352/356/367/372 Han characters, excluding digits, punctuation, tags, figures and More. Each locale has 2–4 More blocks per chapter.
- 15 glossary entries, exactly one Term wrapper per term in EN and one in ZH across the topic; all see relations resolve. Definitions follow spec §5; magnitude/intensity, tsunami/run-up and plate/boundary are cross-linked.
- 33 sources with complete bilingual citation text and notes. S06/S07 are normalized to S6/S7 to satisfy the existing source-id schema. Every prose quantity uses Num; dates and version strings are not quantities. Captions and event values use structured source mappings.
- Every chapter explicitly provides catalogueIndex for its scientific objects; chapter 06 includes all four PB boundary groups as well as its selected earthquake. Chapter 07 includes its linked 2004 observations, which join the four enabled PB groups on beat 4 while the volcano and earthquake groups are hidden. Other groups intersect the actual enabled layers and time; chapter/beat layers and time determine the visible subset. Specific volcano and 2022 event IDs retain the frozen identity. Event/site indices follow the existing TimeScene path.
- Fault figure in chapter 03 follows the epicentre/fault explanation. Shoaling figure in chapter 04 immediately follows water-displacement explanation. Both locales use the exact approved alt/caption text, stating schematic status and the 2004 reconstruction limit.

## Sensitive accounting and internal arithmetic

No disaster ranking, opposed casualty card, animated death count or inferred “other countries” impact is authored. Four-country arithmetic is an internal consistency check only; its subtotal and difference do not appear in the chapter prose, captions, impacts or reader source notes. Source S607 records the purpose of that internal check without publishing those calculated numbers.

## Sibling links and deviations

The first actual validation run found **12 missing-topic errors** for slug-only inside-the-earth TopicLinks at the six approved positions, one per locale. The sibling is not on main. Those anchors were removed, preserving plain references to the planned companion topic. No raw-href workaround or invented chapter target was added. The exact deferred positions are listed in REVIEW.md. This is the content deviation from the planned links; no backlinks were added elsewhere.

## Data, licences and image scope

PB2002 derivatives retain ODC-BY 1.0 attribution to Bird, Hugo Ahlenius/Nordpil and conversion contributors. GVP and NOAA clearance applies to selected employee-produced compiled facts, not photographs, reports or the whole NOAA/ITIC poster. Atlas narrative, translations and original organization are NC-SA. The chapter/source writing introduces no BY-SA/NC-SA mixture, restricted photograph or copied poster layout. Per-file provenance, geometry budgets, measured simplification errors, input hashes and notice changes are owned by the lead data pipeline and reported in data/SOURCES.md and the pipeline records.

No new illustration was generated. The approved three original images are the only image inputs. The lead session reports a near-lossless transparent RGBA export with exact neutral RGB. Retaining that edge/alpha quality produces heavier image files than the soft size target; final byte sizes and visual QA are reported by the lead session. This writing subtask did not itself inspect the exports or claim the image checks.

## Gates

Initial content validation: 58 topics, 12 missing-sibling errors and one warning for the in-progress data/provenance directory. The errors were corrected by the documented deferred-link treatment. A second content-worker run reported 58 topics, 0 errors and the same in-progress provenance-directory warning; the lead then moved that directory outside data. Final check/validate/test/build results, browser gates, performance and image QA are added by the lead session after integrating all topic work. The content worker did not run shoot/e2e or drive a browser, in accordance with BRIEF-CONTENT.md.

## Integrated construction results (lead session, 27 October 2026)

Phase 1 finished before topic construction: engine fixture plus E-PH1/E-PH2,
full 161-file /4,269-test suite, clean57-topic validation and117-page build.
The original baseline was158files /4,236tests. The final integration passes
**163files /4,286tests**, **58topics /0validation errors /0warnings**, and
**119built pages**. `pnpm check` reports0errors /0warnings; three pre-existing
unused-variable hints remain. An unused converter constant found in the first
integrated check was removed and the clean check repeated. The first engine
build/test overlap caused a5-second timeout in the existing ww2 control parse;
the41-test schema file passed alone, and both later full suites passed.
No existing topic data or smoke counts were changed to conceal regressions.

`git diff --check` passes. A non-browser Playwright discovery run with
`ATLAS_E2E_PORT=5424` registers363tests in41files, including17new tests across
this topic and the science fixture. Discovery is **not browser execution**.
The supplied engine/content briefs prohibit sandbox shoot/e2e; neither was
run, and no user browser, desktop or alternate browser automation was used.

Data checks are reproducible with
`pnpm tsx scripts/geo/plates-and-hazards/build-data.ts` against read-only frozen
inputs. Geometry is1,449,977B; catalogue text4,982,515B; the largest catalogue
1,743,895B; four PB files592,532B.26input hashes and21output hashes match.
PB maximum measured residuals including quantization are656.172m worldwide
and81.363m in the SEA focus. Raw/mappable NCEI counts are102/99,2177/2155,
410/410; all25coordinate exclusions are explicitly logged. No height or
arrival values are published. Sourcefacts and licence families remain separate.
The audit/crosswalk files live in **topic/provenance/**, outside the strict
runtime data/*.json loader, without a new runtime schema or request.

The comparable esbuild browser/ES2022/minify+gzip experiment in spec§9.1 gives
**+4,387B gzip** for E-PH1/E-PH2 together. A static import closure of the final
production HTML/island roots and TimeScene View/controller chunks totals
**468,033B gzip across10files**. This is an output-artifact estimate, not observed
browser traffic or a production baseline comparison. It exceeds the historical
300KB whole-page budget; the old391KB documentation figure is not used to claim
this work fixes that debt. Device60/30fps and browser-native JSON parse50ms
limits remain unmeasured. GPU sources/index caching and60between-boundary
updates are covered by unit mocks, not represented as real-GPU measurements.

The three approved originals were opened, then processed with existing
`illustrate.ts`; `build-illustrations.ts` applies neutral grayscale near-lossless
WebP. All four density files retain transparent pixels and have **zero coloured
non-transparent decoded pixels (R=G=B)**. Their hashes/pixel checks are in
[illustrations.json](provenance/illustrations.json). Final files were reopened;
all three drawings were also visually checked over paper and cinema backgrounds.
Only one cone/connected eruption column, one horizontal-offset fault and one
continuous shoaling water body are shown. Captions identify schematic status.
Image bytes are125454/422108/234700/138682; this exceeds the generic illustrate
soft targets90/260/120KB to preserve strict neutral RGB. No new image was generated.

### Browser handoff — unrun gates

Run after the build, with the supplied port:

```sh
pnpm shoot sample-science-layers --beats --keys --layout --locale en,zh --theme paper,cinema
pnpm shoot plates-and-hazards --beats --tasks --keys --layout --locale en,zh --theme paper,cinema
CI=1 ATLAS_E2E_PORT=5424 pnpm e2e
```

Also run before/after beat/key regressions for ww2, sample-dated-layers,
ancient-civilisations, singapore-land-use and singapore-after-1965. No screenshot,
marker/leader visibility,390×844drawer, source-popover focus, keyboard/touch,
console/network, late/error request, real-device performance or browser regression
result is claimed here. The automated checks and tests exist; execution and visual
acceptance remain with the main session. Gavin's Chinese sensitive-content review
and sibling-link restoration remain listed in REVIEW.md; status stays draft.
