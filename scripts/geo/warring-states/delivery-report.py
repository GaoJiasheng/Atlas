"""Refresh the topic's review report from the delivered artifacts."""
from pathlib import Path
import json
p=Path('src/content/topics/warring-states');g=Path('scripts/geo/warring-states');d=p/'data'
def read(path):return json.loads(path.read_text())
c=read(d/'control.json');audit=read(g/'geometry-audit.json')
counts={k:len(read(d/(f+'.json'))['sources'] if k=='sources' else read(d/(f+'.json'))) for k,f in [('entities','entities'),('events','events'),('routes','movements'),('sources','sources')]}
frames={'K1':['G10'],'K2':['G10'],'K3':['G10'],'K4':['G3','G10'],'K5':['G3','G10'],'K6':['G3','G7'],'K7':['G7'],'K8':['G8'],'K9':['G11','G8'],'K10':['G11','G8'],'K11':['G11','G8']}
def fit(id):
 for kind in ['svg','raster']:
  f=g/'work'/f'{kind}-{id}-fit.json'
  if f.exists():return read(f)
 raise ValueError(id)
s=['# Warring States data delivery review','',
'Draft English content and map data are present. **Content validation passes; full geographic acceptance does not.** Chinese fields intentionally retain the requested 【待译】 English text.','',
f"Counts: {len(c['keyframes'])} keyframes; {audit['features']} control features; {counts['entities']} entities; {counts['events']} events (including 74 person placards and 36 battles); {counts['routes']} schematic routes; {counts['sources']} sources; 11 chapters; 49 beats; 17 glossary terms; 60 river features. All 18 Commons downloads have API attribution/licence metadata and verified SHA-256 hashes.",'',
f"Geometry: {audit['rings']} rings; {audit['zeroArea']} zero-area; {audit['selfCrossing']} self-crossing. control.json is {(d/'control.json').stat().st_size/1024:.1f} KiB against the manifest's 1.2 MB budget. Holder adjacency has no equal-colour neighbours.",'',
'## Per-keyframe registration RMS','',
'Values are kilometres. They measure alignment with the source, not historical boundary accuracy. Supplements retain their own fit; inferred frames do not gain independent accuracy.','',
'| Frame | Date | Source RMS km |','|---|---|---|']
for k in c['keyframes']:
 ids=frames[k['object']];values='; '.join(f"{id} {fit(id)['rmsKm']:.3f}" for id in ids)
 s.append(f"| {k['object']} | {abs(int(k['t']))} BCE | {values} |")
s+=['',
'Inference-based frames: **K1, K2, K3, K4 (G10 supplements), K5, K6, K9 (Lu/Wey supplements), K10, K11**. K7 and K8 directly trace their dated maps.','',
'## Outstanding geography limits','',
'- G9 is a point-distribution map, so G10 supplies early bounded regions. K1–K3 reuse undated period geometry: minor annexations without bounded source shapes are omitted, not invented. K1 Zheng is explicitly labelled as the later Xinzheng position.',
'- G11, the 260 BCE source, has RMS 26.102 km / maximum 66.657 km and exceeds the 25 km budget. K9–K11 retain this draft limitation. The G15 county map also exceeds budget (RMS 37.237 km / maximum 68.657 km); it supplies no territorial geometry. K10 uses the specified whole-state fallback.',
'- G13 has only 5 secure control points; G17 has 8. G16 has no defensible full fit. These are reference-only; the requirement for at least 12 reliable controls on every map remains unmet. G9 is slightly above its check-only 40 km maximum budget.',
'- Four originals remain rate-limited (G9/G11/G12/G18); official published renders are retained. Original and render hashes are recorded separately. No guessed detail replaces missing pixels.',
'- Routes connect source-supported named stations schematically. Exact ancient roads, passes and battlefield footprints are not established. All 26 individual station lists and limitations appear in data/SOURCES.md and AUDIT.md.',
'- Coastline clipping changes early Ju by about 22% and G8 Yan by about 25% (including outside-plate portions). Area-retention results and the coastline-step workaround are documented in the geography ledger.',
'- Intended chapter/control start is 770 BCE and the final chapter reaches 206 BCE. The spec-required 771 BCE King You event is preserved accurately; the current engine derives the overall time extent from all non-site events and therefore includes that precursor year.','',
'## Every remaining marked fact','',
'[AUDIT.md](AUDIT.md) contains all 50 marked source/event records and all 3 marked chapter passages, including full per-route station lists. The unresolved questions are:','',
'- Exact sites at Kuiqiu, Chengpu, Boju, Fujiao, Shimen, Guiling, Maling, Xiuyu, Danyang, Yuyu, Zui, Pingyang, Fei and Chengfu; Shimen’s annals opponent designation; Goujian’s stay in Wu; Li Xin’s campaign year.',
'- Complete Zeng tomb and Yonglu excavation publications, Yonglu issue/authors/osteology and skeleton count, named Changping demographic estimates and page references, Dujiangyan’s narrow 256–251 BCE dating.',
'- Wey’s final chronology and residence; Yue after 306 BCE; the Shang Yang measure and Du tiger tally museum object records; Gu Donggao war-count definitions, edition and pages.',
'- Remaining site/Wikidata matching, coordinate precision, and all 26 routes’ station-by-station textual reconciliation. Individual route notes also identify uncertain crossings/departures, Confucius visit order, Qin pass corridors and the final imperial tour’s 211/210 BCE chronology.','',
'## Validation and provenance','',
'Latest pnpm validate: **23 topics, 0 errors, 0 warnings**. No pending engine-schema blockers. No build, test, e2e or shoot was run. All edits for this task are restricted to the topic, its geography folder and its two public geography files; concurrent engine work is untouched.','',
'Per-frame sources, licences, models, control points, RMS/max/leave-one-out residuals, methods and inferences: [data/SOURCES.md](data/SOURCES.md) and scripts/geo/warring-states/SOURCES-GEO.md. Side-by-side images: scripts/geo/warring-states/check/geo-K1.png through geo-K11.png.','']
(p/'REVIEW.md').write_text('\n'.join(s));print('Wrote topic REVIEW.md')
