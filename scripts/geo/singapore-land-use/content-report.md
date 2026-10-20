# Content second pass — 20 October 2026

Owned files: `src/content/topics/singapore-land-use/**` except `topic.yaml`, `data/control.json`, `data/movements.json`; this report. No engine, shared pipeline, package or other-topic changes. No commit.

## Authored

- Seven chapters: background + six main chapters. Main EN body word counts excluding More/Figure blocks: 213, 219, 224, 217, 225, 216, 236. Four paragraphs each; three More blocks each; 33 beats total.
- Eight entities with the fixed §2.3 holder tokens; six geographic presets; fourteen glossary terms. `water-catchment.definition` equals four-taps `catchment.definition` exactly in both languages.
- Fifty-eight events: nineteen reservoir-related sites copied from four-taps (including Linggiu reservoir/dam, outside the local map), five airfield sites, surviving-kampong and reserve sites, unchanged political naval-base event, milestones and two fire disasters. Every event has coordinates; representative policy coordinates are identified as such.
- One hundred eleven numbered sources after rail S90–S99, actual-scene S11–S15, and historical-coast S19 integration. S10 is the Landsat/MPC methodology pointer. Map sources S2–S9; reservoir copies S20–S35; housing S50–S79; food S100–S120; transport S150–S158; land S200–S218. Registry preserves source texts copied from four-taps and the naval-base sources.
- SOURCES.md regenerated with `pnpm tsx scripts/sources-md.ts singapore-land-use`; human sections cover maps, layers, licences, routes and caveats.
- Existing housing-change, kampong-farm, hydroponic-farm and reclamation-section assets connected with Figure components inside More blocks. No images generated or changed.
- Chinese draft fields use 【待译】 + English, except exact copied bilingual content required by the brief. No grade labels in prose.

## Corrections and evidence

- HDB home-ownership beat/event: 12 February 1964 (CLC), replacing the brief’s 1 February.
- Land-acquisition beat/event: Parliament approval 26 October 1966; effect 17 June 1967, rather than showing an operative law in June 1966. Historical-value compensation and owners’ replacement-property difficulties are explicit.
- Queenstown early blocks: indexed NHB source confirms October 1960 completion, 1961 handover. Direct page bot gate remains a publication review item.
- Population in 1959 about 1.6 million, rather than applying the 1957 census to 1959.
- MRT passenger service and opening ceremony distinguished. MRT length excludes LRT; source URL independently checked against LTA/data.gov tables.
- COE event month verified in NHB’s indexed National Museum collection record (May 1990). ERP starts 1 April 1998; expressway start vs later city-zone adoption distinguished.
- Pig farming: announcement March 1984 and last phase-out 1989 per retained source, with government rationale and farmers’ criticism together.
- East Coast overall endpoint 1985 omitted: multiple phases ran for about thirty years. Jurong Island official opening distinguished from later reclamation completion scopes.
- Revised food goals explicitly capacity goals for selected fibre/protein categories; previous 30-by-30 described as former target. 2002 land-area measurement break explained.
- RESEARCH.md has a second-pass addendum with exact source locators, short quotations, access dates and access modes.

## Verification

`pnpm validate` after chapters, figures and source generation: 39 topics; one error, zero warnings. The sole error is the basemap TopoJSON object `land-sg-modern` while the parent’s coastal build is incomplete. No chapter, event, glossary, source, movement-reference or figure validation errors.

`water-catchment.definition` compared programmatically with four-taps: exact match. Copied reservoir ids, coordinates, dates, names and summaries retained; source IDs remapped to equivalent unchanged source texts. Main-body English lengths manually/programmatically checked against 180–260 requirement.

## Pending integration / limitations

Final coast dates integrated: more-land second beat 28 April 1991, third beat 11 October 2002; the latter describes the satellite snapshot and keeps the official-opening event at 14 October 2000. S11–S15 contain exact final STAC ids, dates, whole-scene clouds, bands and output pixels. S19 explicitly preserves the upstream L4/L5 rejected-draft status; no accuracy acceptance is implied. Computed Master Plan planned-use area/shares table, agricultural planned-use edition table, and HDB floor medians integrated from the layers agent’s SVY21 calculations (S219; source editions S16–S18). Rail S90–S99 source entries and all 37 dated route rows have been merged into SOURCES.md.

The original ledger was found and read from the read-only main worktree `/Users/gavin/work/atlas/art/codex-research/singapore-land-use/`. All 136 facts, source/evidence joins, dataset rights/status records and the research narrative have now been audited. Durable original-facts.json, original-datasets.json and original-land-use-research.md copies and an SHA-256/evidence crosswalk are retained in the topic research directory. Earlier missing-worktree cautions are superseded; unresolved underlying source gaps remain explicit.

Unverified facts retained in the research ledgers: July 2024 syllabus differences; original Loh book pages about arson rumours/official response; founding-day HDB office; exact current State-land share; Jurong West first-development date; some industrial-estate dates and separate opening dates of the six farm parks; historical Chinese park names; exact indoor-farm facility coordinates; affected farmers’ response to 2026 Lim Chu Kang proposals; causal damage claims about particular imported-sand suppliers. Unsupported exact facts are not asserted. The indoor-farming event is explicitly a representative western policy marker. Sembawang/Changi site dates identify the 1959 map, not invented opening dates. Labrador and Sungei Buloh site events use January 2002, newly verified in the full CSC article by NParks chief executive Ng Lang (S218).

No source grants a general licence to reproduce its maps or photographs. Text research sources are factual citations only; published map geometry is restricted to documented open/public-domain sources. Detailed licences and geographic errors remain parent-owned in SOURCES-GEO.md.

Additional resolved gap: the full April 2008 Civil Service College article by NParks chief executive Ng Lang confirms Labrador and Sungei Buloh gazetting in January 2002. Both site events now use that month; the exact day from the indexed NParks worksheet remains unclaimed.

Reader-facing research-process notes removed from More blocks. Uncertainties are explained as interpretation limits (unknown fire cause, approximate snapshots and surviving-block bias); audit-process gaps remain here/RESEARCH.md. The sand/imports facts now share the reclamation-method block, and the third more-land block gives the required median-floor table.

Final original-ledger audit: existing numerical claims and denominator distinctions agree with E041–E110; MOE S1 now uses the exact original January 2024 PDF URL. Added S220 / E066 for the revised goal’s 2035 date. Final S11/S12 MSS bands are B4/B7; S15 is LT05_L2SP_125059_20110214_02_T1, 14 February 2011, whole-scene cloud26%, SR_B2/SR_B5. The earlier 2009 Tier-2 haze candidate is rejected, not the published L10 source.

Post-audit validation: `pnpm validate` now passes across 39 topics with **0 errors, 0 warnings**, after the parent’s coast file landed. No stale 2009 scene id, B4/B6 band label or missing-original-ledger assertion remains in the current topic content/report.
