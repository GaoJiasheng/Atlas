"""Generate the handoff from actual files, including every unresolved ledger row."""
from pathlib import Path
import json,re
D=Path(__file__).parent
load=lambda p:json.loads(Path(p).read_text())
a=load(D/'final-audit.json'); coast=load(D/'work/coast-report.json'); research=load(D/'research/evidence.json'); dates=load(D/'content-date-gaps.json'); anchors=load(D/'content-anchor-review.json'); gaps=load(D/'content-gaps.json'); tables=load(D/'research/tables.json')
esc=lambda s:str(s).replace('|','\\|').replace('\n',' ')
md='''# Singapore, 1819–1965 — Codex handoff

Research, English chapter drafts, data and provisional geographic assets are written. **Geographic acceptance is incomplete.** The topic remains `status: draft`; valid schemas and ring checks do not make the historical maps ready for release.

## Counts and verification

| Artifact | Count |
|---|---:|
'''
labels={'eras':'Dated coast eras','keyframes':'Control keyframes','controlFeatures':'Control features across all frames','entities':'Entities','events':'Events','routes':'Routes','sources':'Numbered sources','glossaryTerms':'Glossary terms'}
for k,v in a['counts'].items():md+=f'| {labels[k]} | {v} |\n'
md+='''| Chapters, including background | 12 |
| Presets | 6 |
| Basemap features | 7: one mask and six dated land features |
| Downloaded/hashed requested records | 29: 26 Commons originals plus G21, G22 and G30 |

All 83 pending specification markers are mapped to research checks. The census tables cover 1824, 1871, 1931 and 1957, retaining both 1957 published returns. There are ten casualty rows, nine June 1959 Cabinet members, ten August 1965 Cabinet members, and eleven street-name rows. The source catalog records exactly what was read; indexed passages, inherited citations and unread originals are distinguished. Tables are in RESEARCH.md and research/tables.json.

The 12 English bodies contain 245–270 words, four paragraphs and 3–4 More blocks each. All 16 glossary terms are used. Chinese draft fields are prefixed 【待译】, with original inherited WW2 source text preserved. Six requested figure references resolve to assets supplied by the main session.

Nineteen events and three movements remain exact WW2 copies. All six hold pairs are exact geometry/label copies: **K4←K3, K7←K6b, K10←K9, K14←K13, K16←K15a, K18←K17**. K3/K4 use a generic settlement label to satisfy the exact-hold instruction; the Company/Crown distinction is explained in prose.

'''
md+=f"Control: **{a['bytes']['control']:,} bytes**, {a['rings']['rings']:,} rings, zero-area **0**, self-crossing **0**; below 1 MB. Eight sub-resolution rings under 1e-10 square degrees (about 1.24 m² here) were removed after numerical clipping/quantization; no geographic boundary was drawn to repair them. Gap filling is disabled, and Singapore is re-clipped after cleanup. The largest measured final quantization fringe is **{max(x['maxOutwardM'] for x in a['singaporeClipping']):.4f} m** beyond the dated coast; its aggregate area is reported per frame in final-audit.json rather than called zero.\n\n"
md+=f"Coast: **{a['bytes']['coast']:,} bytes**, {coast['rings']['rings']} rings, zero-area **0**, self-crossing **0**. **The 200 KiB / 204,800-byte coast budget fails.** The optional current-coast line is omitted. Lower-precision candidates were rejected: one introduced crossings; repairing it moved narrow shoreline fingers by up to 42.53 m. The retained asset preserves the measured geometry.\n\n"
md+='''`colour-holders.ts --write` completed with no unresolved colour conflicts. K2 and K19 were composed and compared first; all 23 standalone keyframe source comparisons, six coast comparisons and a contact sheet were generated and inspected. These are review images, not acceptance or application screenshots.

## Map residuals

All numbers below are metres. LOO means leave-one-out; raster fit residuals are not shoreline-identification accuracy.

| Map | CP | Model | Fit RMS / max | LOO RMS / max | Status |
|---|---:|---|---:|---:|---|
'''
limitations={'G1':'Town numeric budget met; proposed junction continuity remains unverified.','G2':'Only four whole-island diagnostic CPs; rejected and unused.','G4':'LOO RMS slightly exceeds the 60 m town budget.','G7':'Town numeric maximum met; source-date and extent gaps remain.','G9':'Whole-island budget failed.','G11':'30/60 m budget failed.','G16':'30/60 m budget failed; 16 nominal CPs include nine unnamed external controls.','G23':'Regional named-town comparison only, not surveyed-junction accuracy.'}
for id in limitations:
 cp=load(D/f'georef-{id}.json');f=load(D/f'work/georef-{id}-fit.json');num=lambda k:f'{f[k]*1000:.2f}' if isinstance(f.get(k),(int,float)) else 'not measurable'
 md+=f"| {id} | {len(cp['controlPoints'])} | {f['model']} | {num('rmsKm')} / {num('maxKm')} | {num('looRmsKm')} / {num('looMaxKm')} | {limitations[id]} |\n"
md+='''
RMS/max **not measured** for G3, G5, G6, G8, G10, G12, G13, G14, G15, G17, G18, G19, G20, G24, G25, G26, G27 and G29. They are downloaded sources/comparisons, not completed reconstruction inputs. Raster residual is not applicable to vector G21/G22/G30. G23 uses twelve independently read town-symbol anchors; its earlier printed-graticule diagnostic is not external accuracy.

Recorded ink shares: G1 town waterfront 96%/100%; G4 100%/97%; G7 93%; G9 four parts 94%/95%/94%/95%; G11 87%; G16 78%. Jackson division segments range from 90% to 100%. A river-bank trial with high ink agreement was rejected because visual inspection showed adjacent street ink; the rejected diagnostic never entered the final coast.

## Era geometry and unfinished geography

| Era | Area km² | Difference from URA baseline km² |
|---|---:|---:|
'''
for e in coast['eras']:md+=f"| {e['id']} | {e['areaKm2']:.6f} | {e['differenceToTodayKm2']:.6f} |\n"
md+=f"\nThe URA geometric baseline is {coast['baselineAreaKm2']:.6f} km², not an official contemporary land-area statistic. Differences include omitted islands, source age, water and registration gaps: **they are not reclamation measurements**. The non-monotonic L1/L2 and L4/L5 areas are unresolved source/fit differences, not evidence of historical land loss.\n\n"
md+='''All six eras are explicitly marked approximate/rejected for historical accuracy. Outstanding map work:

- G5 is the eastern strait sheet and does not cover main Singapore. G6 is a small proposed office layout, not the described whole-town plan. G1 is monochrome and proposed, with no colour legend; interpreted printed divisions are recorded in jackson-legend.json.
- L0 uses an 1822 proposed waterfront as a backcast to 1819; L1 uses 1839, L2 uses 1893 for an 1887 epoch. G9 later-map substitution outside early town coverage is explicit.
- G9/G11/G16 fail residual targets; some candidate cape/street identities and nine G16 external CP identities remain unqualified. G11/G16 ink shares also fail the shoreline target. G14/G15 Jurong and western 1961 reconstruction is not completed; G16 corrections stop in 1954.
- Detached historical islands and historical land now gone are omitted. No modern detached-island fallback remains in historical features. G1/G4 river banks, parts of the west docks and later estuaries remain untraced.
- Dindings has no qualified boundary trace: it is excluded from the draft recipe and the affected FMS feature expressly labels the unresolved modern extent. No box or invented polygon substitutes for it.
- G23 comparison exposes substantial historic state-border differences, but the requested >10 km correction traces are unfinished. Modern 1896 Sarawak still includes Lawas and is labelled approximate; Limbang belongs in 1896 after its 1890 annexation, while Lawas needs exclusion until 1905. G23 contains no Borneo evidence.
- The 92 unresolved new event anchors below still need source-backed positions. Eleven other anchors are sourced current reference points, not exact historical footprints; all 103 new historical anchors remain approximate.

Topic-local coasts.ts implements `pipeline.localLand.eras`; simplify.ts implements `coast.excludeBox` and separate regional/local tolerances without shared edits. Data uses the requested dated `kind: land`, `from`/`to`, `basemap.local` and `TopicLink ch` names. The current engine still needs dated-land display filtering and chapter-aware TopicLink support; the current component ignores `ch`. Optional `kind: coast-today` is not present. These do not currently produce validation errors.

## Unconfirmed licences

- **G19:** Shell Road Map of Malaya 1951 / Survey Department No. 88-1951; uploader's Malaysian copyright-duration claim and PD-old-70 tag do not establish original Singapore rights. Cross-check only.
- **G20:** modern repaired/assembled scan with both self CC BY-SA 4.0 and PD-UKGov; original agency/edition unidentified. Cross-check only.
- **G27:** Time / Robert M. Chapin, 12 April 1963; PD-US-not renewed tag not independently established by a renewal search. Cross-check only.

G16's printed 1954 small-corrections year is visually confirmed. No uncertain-rights source supplies published geometry. Optional G28/CShapes and G31/CORONA were not used; CORONA Singapore coverage and its original terms were not independently checked. No NAS original image reproduction rights are asserted. SODL attribution for URA/OneMap and CC0/public-domain attribution for Wikidata/Natural Earth are retained in sources and map provenance. OSM coordinates are registration controls only, with no OSM geometry introduced into published files.

## Remaining fact qualifications

The following research entries retain an unresolved detail, disagreement, unread original or interpretive limit. Each may also contain confirmed information; the stated limitation is what remains open. Full exact URLs/pages, read extents and short quotations are in RESEARCH.md and research/evidence.json.

| Fact / check | Remaining finding and scope |
|---|---|
'''
pattern=re.compile(r'differ|require separate attribution|unverifi|unread|not (?:independently |directly )?(?:read|verified|checked|obtained|confirmed|established|reconciled|inspected|retrieved)|unsupported|unresolved|disput|competing|remain(?:s)? (?:open|unverified|unchecked|unsupported|unread)|needs? (?:direct|original|correction|its instrument)',re.I)
qualified=[f for f in research['facts']if any(t in f.get('status','')for t in ['part','conflict','unver','remaining','interpretive'])or pattern.search(f['fact'])]
for f in qualified:
 sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z])',f['fact'])
 condensed=[v for v in sentences if pattern.search(v) or re.search(r'disagree|differen|not proven|interpret|review gap',v,re.I)]
 finding=' '.join(condensed) if condensed else f['fact']
 md+=f"| {f['id']} ({f['status']}) | {esc(finding)} |\n"
md+='''
Seven published date/meaning warnings remain explicitly in event details:

| Event | Unverified detail |
|---|---|
'''
for id,text in dates.items():md+=f'| {id} | {esc(text)} |\n'
verified={r['id']for r in anchors['verifiedUpdates']}
unresolved=[e['id']for e in gaps['events']if e['id']not in verified]
md+='\nUnresolved source-backed coordinate audit (92 draft anchors):\n\n'+', '.join('`'+id+'`'for id in unresolved)+'.\n\n'
md+='''The eleven audited references still do not establish original historical footprints. The first TTSH vicinity and Hock Lee junction are corrected with institutional text plus OneMap evidence. July 1964's Kallang/Kampong Soo Poo onset area is supported in text; its exact marker remains unverified. “Lim & Lau” remains unidentified beyond the Albert Lau lead; the optional clarification question had no reply when this report was written.

The fifteen new active sea corridors are schematic interpretations of Horsburgh, not individual tracks or schedules. The route audit found zero land crossings/samples in sixteen candidates. `steamer-amoy-1900` and `causeway-rail` are withheld pending timetable/map evidence. The Suez route is only the maritime segment south of Suez; no canal geometry was invented. New routes have no unsourced strength.

## Validation, scope and next handoff

`pnpm validate`: **25 topics, 0 errors, 0 warnings**. Log: work/validate-final.log. No engine-field errors are currently reported; engine behavior described above remains pending. No build, project tests, e2e, shoot or commit was run. Figures were not generated by this task.

Only the authorized topic, topic-local geo scripts, public/geo/land-sg-history.json and topic screenshot folder were written. Raw/work entries and research cache ignores are in the topic-local .gitignore. Other topics, WW2, shared geo code, components, package.json and engines were not edited.

Rebuild commands and the first-pair ordering are in README.md. Do not rerun content-build.ts's publish option over the final incremental source/date/coordinate corrections. Review RESEARCH.md, data/SOURCES.md, SOURCES-GEO.md, content-audit.md and final-audit.json together. Schema success does not clear the unfinished geographic acceptance gates.
'''
(D/'CODEX-REPORT.md').write_text(md)
print('CODEX-REPORT.md written;',len(qualified),'qualified research entries;',len(unresolved),'unresolved anchors')
