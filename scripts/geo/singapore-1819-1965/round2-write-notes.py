"""Write the current source ledger / dated completion notes from final receipts."""
from pathlib import Path
import json,re
D=Path(__file__).parent;R=D.parents[2];T=R/'src/content/topics/singapore-1819-1965'
read=lambda p:json.loads(p.read_text())
a=read(D/'polish-audit.json');reg=read(D/'round2-registration.json');m=read(D/'sources.json');guard=read(D/'round2-guard.json')
counts=read(D/'resume-final-water-audit.json');tri=read(D/'previews/triangle-counts.json')
notes={
'L0':('G9 island outline + G1 proposed town shore; backcast to 1819. Positions approximate: reference RMS about 109 m / 58 m; the proposed plan is not an as-built survey.','全岛据G9、城区据G1规划岸线回推至1819年。位置为近似值：控制点比对RMS约109米／58米；规划图不是竣工测量。'),
'L1':('G9 island + Coleman G4 1839 town shore used for 1823–1886. Positions approximate: reference RMS about 109 m / 60 m; date substitution retained.','全岛据G9、城区借用G4的1839年岸线表示1823–1886年。位置为近似值：比对RMS约109米／60米；保留年代借用说明。'),
'L2':('G9 island + G7 1893 town shore used from 1887. Positions approximate: reference RMS about 109 m / 33 m; date substitution retained.','全岛据G9、城区从1887年起借用G7的1893年岸线。位置为近似值：比对RMS约109米／33米；保留年代借用说明。'),
'L3':('G9 1912/1916 map, regularised TPS with 19 references. Positions approximate; LOO RMS 109.15 m, maximum 242.08 m at controls; unsampled shore errors unmeasured.','据G9的1912／1916年地图，以19个参考点作正则化薄板样条配准。位置为近似值；控制点留一法RMS109.15米、最大242.08米；未采样海岸的误差未测。'),
'L4':('G11 1944 AMS / 1941 War Office map revised 1937, regularised TPS with all 18 references. Positions approximate; LOO RMS 55.45 m, maximum 108.58 m; western extrapolation unmeasured. Coastal marsh channels remain generalized; these reference errors do not certify individual bank boundaries.','据G11的1944年美军地图（底图为1941年英国陆军部、修订至1937年），保留18个参考点作正则化薄板样条配准。位置为近似值；留一法RMS55.45米、最大108.58米；西端外推误差未测。沿岸沼泽水道仍作概化表达；参考点误差不证明每一段岸线的精度。'),
'L5':('G16 1936/1954 chart; G15 Tuas natural banks and observed Poyan mangrove tip; G35 October 1958 preconstruction Jurong/Pandan banks used for January 1961. Positions approximate: G16/G35 reference LOO RMS 54.74/39.82 m; G15 external RMS unmeasured. Later 1961–1965 reclamation stages are not separately mapped.','据G16的1936／1954年海图、G15的大士自然岸线和坡央红树林岬端，并用G35的1958年10月开发前岸线表示1961年1月的裕廊／班丹。位置为近似值：G16／G35参考点留一法RMS54.74／39.82米；G15外部RMS未测。1961–1965年后续各阶段填海范围未逐一重建。')}
section='''## Fix 2026-11-09 — round 2 (current)

This section supersedes the round-1 acceptance targets below. **Licences, clean source-derived geography and a fresh rebuild are hard guards. No strict per-map RMS threshold is imposed.** `round2-guard.json` records a passing fresh rebuild, delivered source-water/dry-island checks, the northern peninsula, absence of the false coverage seam and zero ring defects. All locations remain approximate; a control-point RMS is not a bound on unsampled shoreline accuracy.

本节取代下方第一轮的验收门槛。**许可、来自原始地图且完整清晰的地理形状、全新重建是硬性检查；不设逐图RMS限值。** 位置均为近似值；控制点RMS不是未采样海岸误差的上限。

### Rights and method

All ten active original raster maps and the unpublished G14 comparison are individually checked against retained original SHA-256 receipts and PD licence evidence (`polish-audit.json.sourceAudit`). The G35 ANU item-specific `dc.rights` is **Copyright Expired**, retained in `resume-source-anu.json`; its 8350×6806 original matches repository MD5 `753796180f2c7d659280ec601a5602bb`. A live catalogue retry returned HTTP403 on this pass; the verified repository metadata and original checksum remain available locally. No NAS-restricted scan or uncertain-rights G19/G20/G27 map enters any keyframe.

| Original / licence evidence | Active method and scope |
|---|---|
'''
for s in a['sourceAudit']:
 dataset=next(v for v in m['datasets'].values()if v.get('ref')==s['ref'])
 section+=f"| [{s['ref']}: {dataset['title']}]({s['page']}) — {s['license']} | "+('Unpublished comparison only.'if s['ref']=='G14'else {'G1':'Proposed town divisions / early waterfront, affine.','G4':'Coleman town coast, river and marsh island, affine.','G7':'1893 town coast, affine; explicit 1887 substitution.','G9':'Island outline; regularised TPS, 19 controls including named surviving cathedral footprint.','G11':'Island outline; regularised TPS, all 18 controls retained.','G15':'Tuas source-bank arc and newly reread Poyan mangrove tip; uninked internal clearings not classified as water; printed-graticule registration only.','G16':'Complete Poyan/Berih bank north of 1.34141°N and south/east outline; printed Mercator axes + ground translation.','G23':'Regional boundary traces; affine and explicit regional-scale approximation.','G34':'Lawas exclusion; printed-graticule registration only.','G35':'1958 Jurong/Pandan outer shore, paired river banks and islands; native Johore grid poly2 + road-reference translation.'}[s['ref']])+" |\n"
section+='''
G21/G22 and the land background use [Natural Earth public-domain data](https://www.naturalearthdata.com/about/terms-of-use/). G30/G32 retain the existing URA 2019 foundation/water exclusions under the [Singapore Open Data Licence](https://data.gov.sg/open-data-licence), with the attribution below; modern western impoundments are restored to the dated source land. [© OpenStreetMap contributors, ODbL](https://www.openstreetmap.org/copyright) supplies separately attributed registration point coordinates and existing name/overlap selectors, including the cathedral point; no OSM coast/road/building polygon is copied. No NC-SA geometry is mixed into the ODbL controls or geographic files. Original chapter text remains separate.

### Measured registration errors (metres)

Fitted RMS/max and leave-one-out RMS/max are reported separately. TPS smoothing was selected on these LOO comparisons; these are diagnostic control comparisons, not independent survey validation. No point was removed to reduce an error. The newly inspected G9 cathedral point is retained even though its larger 19-point set increases LOO RMS slightly; G11 improves. Existing uncertain road-axis/cape identities and western extrapolation remain limitations. Exact coordinates, all smoothing trials and per-point errors are in `round2-registration.json`; the earlier G16/G35 measurements remain in their retained reports.

| Map | Active controls / model | Fitted RMS / max | External LOO RMS / max |
|---|---|---:|---:|
| G1 | 12 / LAEA affine | 42.22 / 87.43 | 58.39 / 113.58 |
| G4 | 12 / Mercator affine | 44.39 / 75.78 | 60.16 / 103.47 |
| G7 | 12 / Mercator affine | 24.02 / 49.94 | 32.77 / 63.31 |
'''
for r in reg['reports']:
 section+=f"| {r['id']} | {len(r['controlPoints'])} / {r['model']} | {r['fit']['rmsM']:.2f} / {r['fit']['maxM']:.2f} | {r['loo']['rmsM']:.2f} / {r['loo']['maxM']:.2f} |\n"
section+='''| G16 | 16 partial-axis ticks + 6 ground references / constrained Mercator | 45.62 / 60.73 | 54.74 / 72.87 |
| G35 | 16 grid observations + 19 road candidates / poly2 + translation | 37.73 / 77.70 | 39.82 / 82.01 |
| G23 | 12 / Mercator affine, regional comparisons | 1801.42 / 2813.53 | 2447.51 / 4829.04 |
| G15 | 12 printed-grid observations only | external not measured | external not measured |
| G34 | 8 printed-graticule observations only | external not measured | external not measured |

G15 internal printed-grid LOO RMS/max is 4.40/7.54 m; G34 internal 381.09/697.20 m; unpublished G14 internal 3.00/5.50 m. These are scan/graticule diagnostics, not external accuracy. G2 has no active keyframe geometry; its unused diagnostic is not substituted for a measurement. 原图格网残差只说明扫描配准，不能当作外部测量精度；G15／G34的外部误差尚未测量。

### Every keyframe: source, temporal substitution and bilingual approximation note

Every row also uses PD Natural Earth regional grouping plus the verified SODL foundation as applicable. G23/G34 regional traces retain their regional-scale error / internal-only limits above; modern administrative outlines are proxies, not surveyed historical frontiers. Exact hold frames keep identical geometry. 各帧的区域行政范围采用公版Natural Earth分组及已核许可的SODL底图；G23／G34的区域误差和格网限制如上，现代行政线不是历史边界的实测复原。延用帧的几何保持完全相同。

| Keyframe / date | Coast | Method / approximation (EN / ZH) |
|---|---|---|
'''
for k in m['keyframes']:
 era=next(e for e in m['pipeline']['localLand']['eras']if(not e.get('from')or k['t']>=e['from'])and(not e.get('to')or k['t']<e['to']))['id']
 en,zh=notes[era]
 if k.get('hold'):en=f"Exact hold of {k['hold']}. "+en;zh=f"几何完全延用{k['hold']}。"+zh
 section+=f"| {k['id']} · {k['t']} | {era} | {en}<br/>{zh} |\n"
section+='''
### Source geometry repairs and limits

The Jurong paired-bank head is reread on the native G35 blue banks (`round2-jurong-head.json`); no wide nearest-ink snap can merge the two banks. The retained downstream water and real source island remain. G15's incomplete northern water mask is no longer selected over Poyan/Berih: the complete G16 bank is retained there, the source-observed G15 mangrove tip is added with 2002 common-land closure samples, and the Tuas G15 arc joins G16 at genuine bank intersections. A warped source-frame chord formerly left an inland hairline; its coverage closure now sits outside the selector and an independent guard requires zero boundary vertices on that false cap.

裕廊上游按G35原图的两侧蓝色岸线重读，不用大范围吸附把两岸合并；保留下游水面和真实小岛。坡央／贝里一带不再套用范围不完整的G15北部水面遮罩，改为保留G16完整岸线，另按G15原图补回红树林岬端（未把无水线标记的空白处当成水面）；遮罩闭合线的2002个采样点均在既有陆地内。大士G15岸段只在真实原图岸线交点拼接。配准投影造成的内陆细缝已消除，独立检查不允许该范围边缘残留。

No strict RMS target or exact 1961 survey is claimed. The October1958 preconstruction coast at January1961 remains a dated inference; later reclamation stages and indistinct single-stroke minor drains are not fabricated. Offline evidence is in `previews/{paper,cinema}-all-keyframes.png`, matching close-ups and original-map overlays. No runtime JavaScript, browser, shared engine, scene/framing or theme code is added. Full counts and gates follow in `REBUILD-3D.md`.

'''
p=T/'data/SOURCES.md';old=p.read_text();old=old.replace('The topic is published, but strict geographic acceptance has **not** passed. A valid JSON schema or zero ring defects is not evidence of historical accuracy. **Fix 2026-11-09** below records the current source redraw and measurements; earlier dated sections are research history.','The topic uses approximate historical reconstructions. The current **Fix 2026-11-09 — round 2** below records verified source rights, a passing fresh rebuild and geometry guards, and measured registration errors; older sections are research history. A software gate is not a certificate of survey accuracy.')
old=old.replace('## Fix 2026-11-09\n','## Fix 2026-11-09 — round 1 historical record\n',1)
marker='## Fix 2026-11-09 — round 2 (current)'
if marker in old:
 start=old.index(marker);end=old.index('## Fix 2026-11-09 — round 1 historical record',start);old=old[:start]+old[end:]
pos=old.index('## Fix 2026-11-09 — round 1 historical record');p.write_text(old[:pos]+section+old[pos:])
