"""Append the round-2 evidence using measured payload counts, never estimates."""
from pathlib import Path
import json,re,hashlib
root=Path('src/content/topics/saturn-v')
path=root/'REBUILD-3D.md'
old=path.read_text()
# Idempotent reruns preserve the complete round-1 audit.
old=old.split('\n## Rebuild 2026-11-05 — Apollo 11 round 2')[0]
audit=json.loads(Path('scripts/geo/saturn-v/mesh-audit.json').read_text())
previous=json.loads(Path('scripts/geo/saturn-v/round1-audit.json').read_text())
parts=json.loads((root/'data/parts.json').read_text())['parts']
v=json.loads(Path('scripts/geo/saturn-v/round2-verification.json').read_text())
changes={
'sic-fuel':('R3, R15–R16','Ellipsoidal domes with five genuine tunnel apertures and sealed tunnel walls, separate RP-1 feeds, welds and annular baffles. Five downcomers now use the 1+4 engine layout.'),
'sic-oxidiser':('R3, R15–R16','Domes, slosh baffles, four helium bottles and five LOX downcomers. Geometry and FLOW share authored centre-lines; actual compressed pipe interiors are ray-tested.'),
'f1-centre':('R4–R5, R14','Independent F-1 builder: sampled chamber/extension, 178/356 tube relief above the collector, hatbands, vertical common-shaft pump castings, gas generator, exchanger/bellows, manifold, paired feed ducts, valve covers, interface rail and gimbal bearing.'),
'f1-outer':('R4–R5, R14','Four rotated F-1s with two gimbal actuators each. Metric decimation error stays equal to the single-engine tolerance. Five compressed exit rims retain the 0.10 m clearance contract.'),
'sii-fuel':('R3, R24','Smooth upper LH2 pressure vessel, curved common bulkhead, one insulation boundary, circumferential seams, baffles and pressurization fitting.'),
'sii-oxidiser':('R3, R24','Smooth lower LOX vessel, upward common dome with a measured minimum 25 mm insulation gap after compression, annular baffles and sump.'),
'j2-centre':('R6–R7','Dedicated J-2 geometry: separate turbopumps, restrained inlet bellows, diagonal transfer duct, gas generator, exhaust/heat-exchanger route, collector and gimbal. Protected 32-segment start tank remains a true sphere after station calibration.'),
'j2-outer':('R6–R7','Four distinct J-2 copies at the retained mounting stations; two actuators per steerable engine. Each start sphere is appended after hardware decimation.'),
'sivb-fuel':('R3, R25','Smooth LH2 vessel with one curved common dome, one slosh baffle, nine mounted cold helium spheres, welds and fittings; stage/restart teaching values retained.'),
'sivb-oxidiser':('R3, R25','LOX lower dome, curved shared-dome interface, sump and independent delivery outlet; no intersecting duplicate bulkheads.'),
'sivb-engine':('R6–R7','One J-2 with the same engine-specific plumbing, spherical start tank and gimbal hardware, calibrated to about 3.38 m rather than the inherited 3 m bell envelope.'),
'iu-ring':('R3, R17','Internal cold plates, unequal avionics racks, connector faces, cable rails, ST-124 platform representation and pneumatic vessels replace the empty annulus.'),
'cm-shell':('R3, R8–R9','Columbia conic skin has five true apertures through inner/outer surfaces, recessed glass, reveals and frames. Rounded hatch seam, three hinges, handle and aft ports are relief. Actual shipped glazing recession is ray-tested.'),
'cm-couches':('R3, R10, R29','Three supine folding frames, raised leg pans, notched footpans, doubled head brackets, tensioned cloth, headrests and restraints. Four armrests belong to the outer couches; a common frame carries eight attenuator struts.'),
'sm-shell':('R3, R8–R9','Six radial webs with the 50/70/60-degree sector sequence, centre thrust shell, rims, EPS/ECS radiator channels, sector seams, four four-nozzle RCS quads, four supported parabolic dishes, VHF scimitars and omni heads.'),
'sm-tanks':('R3 PDF p93','Four equal 45-inch SPS vessels occupy II/III/V/VI. IV has three full-height upright fuel-cell cans on an attached deck, two larger capsule-ended H2 tanks and two O2 spheres. Two 40-inch helium spheres fit the resized centre tunnel. Retaining bands, mounts and connected feeds support every vessel.'),
'sm-engine':('R3, R8','Handbook-scale SPS: 98.4-inch exit, approximately 4.06 m length, correct throat-area ratio, open inner wall, conforming hatbands/seams, chamber/feed connections and gimbal hardware.'),
'les-tower':('R3, R8, R11, R19','Four connected longerons, three braced bays, attachment feet, four canted escape nozzles, jettison/pitch ports, two stowed canard panels and an actual boost protective cover. Cover leaves with the tower.'),
'lm-descent':('R3, R12, R20','LM-5 re-entrant cruciform layout, separate irregularly crinkled black/gold blanket fields, two full-height parallel beam pairs and flanges, four suspended propellant vessels in the square bays around the central engine, retaining bands/strut mounts/feed lines, four ascent mounts, MESA/EASEP closures and landing radar.'),
'lm-descent-engine':('R3, R12','Independent smooth hollow nozzle, lip, chamber and feed/flange hardware; still stays on the descent stage.'),
'lm-legs':('R3, R20–R21','Four connected primary telescopic struts, paired secondary/deployment braces, trunnions, foil sleeves, dished pads, exposed central joints and non-periodic foil creases. Exactly three bent contact probes; none on the ladder leg. Existing terminal-stow transforms retained.'),
'lm-ascent':('R3, R12, R18, R20','NASA pressure-cabin facet topology, hatch, asymmetric equipment bay and unequal tank covers replace the overly regular first reconstruction. Original docking tunnel, radar/S-band dishes, VHF/docking antennas, four hollow four-nozzle RCS assemblies and connected supports.'),
'lm-ascent-engine':('R3, R12','Separate hollow APS nozzle and chamber plus faceted engine cover. Cabin, engine, glass and port continue to rise together.'),
}
retained={
'sic-shell':('R1–R3','Retained round-1 corrugation, roll markings, raised USA letters, cable tunnel and curved fairings.'),
'sic-fins':('R1–R3','Retained four thick bevelled fins and correct fairing attachments.'),
'sii-shell':('R1–R3','Retained annular skirt, corrugated bands, roll sectors and disconnect relief.'),
'sivb-shell':('R1–R3','Retained upper cylinder, ribbed tapered interstage and roll sectors.'),
'sla-shell':('R3, R8','Retained four separate tapered skin quadrants, inner faces, seams and edge stiffeners.'),
'cm-heatshield':('R3, R8','Retained independent closed blunt shield and existing return/cutaway behaviour.'),
'cm-probe':('R3, R8','Retained full smooth turned contact head and three support arms; compression packing compensates the actual label transform.'),
'lm-windows':('R3, R20','Two actual triangular openings are cut into the rebuilt front facets; recessed glass, reveals and pressure seals remain separate geometry.'),
'lm-ladder':('R3, R20','Retained one bent-rail ladder, nine rungs and supported porch.'),
'lm-docking-port':('R3, R8','Retained independent annular drogue/port and unchanged rendezvous interface.'),
}
lines=[]
for p in parts:
 id=p['id'];refs,detail=(changes|retained)[id]
 before=previous['after'].get(id,previous['before'][id]);after=audit['after'].get(id,audit['before'][id])
 lines.append(f'| `{id}` | {before:,} | {after:,} | A | {refs} | {detail} |')
sha=hashlib.sha256(Path('public/models/saturn-v.glb').read_bytes()).hexdigest()
section=f'''
## Rebuild 2026-11-05 — Apollo 11 round 2

Audited **2026-11-09**. This section supersedes the round-1 grades and payload numbers above. Flight identity is **AS-506 / CSM-107 Columbia / LM-5 Eagle**. All 23 former B entries were rebuilt; the shape-review self-grades are now **33 A / 0 B / 0 C**, provisional for Claude's GPU acceptance. A means credible mechanical form, proportions, openings, counts and attachments in the checked close-up views under the technical-plate studio. It does not certify a manufacturing CAD model or physical flight/deployment solver.

The 33 selections, seven chapters, 35 beats, 13 named terminal configurations, teaching tables, existing exploded/cutaway behaviour and main-session one-tap index fix are retained. No shared engine, widget, framing, CSS, package/lock or queue file was edited. No browser, desktop, Chromium or git write was used.

### New primary references

The earlier R1–R13 catalogue remains above. The final hero source sets are F-1: R4/R5/R14; J-2: R6/R7 plus supplemental NASM DSH02/DSH03 photographs; CSM: R3/R8/R9; LES: R8/R11/R19; LM cabin: R3/R12/R18/R20; landing gear: R3/R20/R21; S-IC tanks: R3/R15/R16; S-II: R3/R24; S-IVB: R3/R25; IU: R3/R17; couches: R3/R10/R29. These provide 2–4 primary photographs/drawings per hero. The Apollo 11 press kit's **PDF p93 / printed p89** additionally controls the CM window layout and SM sector contents.

| Ref | Drawing / photograph and use | URL |
|---|---|---|
| R14 | NASA Saturn V News Reference R-1, complete F-1 contour and named hardware | https://images-assets.nasa.gov/image/9264931/9264931~medium.jpg |
| R15 | NASA S-IC cutaway, five suction lines, four helium cylinders and separated tanks | https://images-assets.nasa.gov/image/0100981/0100981~medium.jpg |
| R16 | NASA archive S-IC numbered section, Boeing drawing; dome/tunnel/baffle topology | https://images-assets.nasa.gov/image/0100982/0100982~medium.jpg |
| R17 | NASA IU internal equipment, MSFC 68-IND-1200-25A | https://images-assets.nasa.gov/image/0100984/0100984~medium.jpg |
| R18 | Eagle returning from the surface, AS11-44-6642; cabin facets and blankets | https://images-assets.nasa.gov/image/as11-44-6642/as11-44-6642~medium.jpg |
| R19 | Apollo 11 spacecraft on the pad; nominal stowed-canard/cover silhouette | https://images-assets.nasa.gov/image/6900547/6900547~small.jpg |
| R20 | Apollo 11 front hatch, window surround, porch and foil, AS11-40-5863 | https://images-assets.nasa.gov/image/as11-40-5863/as11-40-5863~medium.jpg |
| R21 | Apollo 11 footpad/primary strut close-up, AS11-40-5917 | https://images-assets.nasa.gov/image/as11-40-5917/as11-40-5917~medium.jpg |
| R26 | NASA power-generation note; 44-by-22.5-inch fuel-cell module dimensions | https://ntrs.nasa.gov/api/citations/19730011146/downloads/19730011146.pdf |
| R27 | NASA manufacturing experience; 45-inch SPS and 40-inch helium vessel dimensions | https://ntrs.nasa.gov/api/citations/19730023037/downloads/19730023037.pdf |
| R28 | Apollo Operations Handbook, April/July 1969, SPS dimensions/area ratio | https://www.nasa.gov/wp-content/uploads/static/history/afj/aoh/aoh-v1-2-04-sps.pdf |
| R29 | AFJ couch system study: Weber three-couch photograph plus labelled folding/support diagrams; supine profile, four outer-couch armrests and eight attenuator supports | https://apollojournals.org/afj/ap16fj/02system_couches.html ; https://apollojournals.org/afj/ap16fj/pics/crewcouch.jpg ; https://apollojournals.org/afj/ap16fj/pics/couches2.gif ; https://apollojournals.org/afj/ap16fj/pics/couches1.gif |
| R24 | NASA S-II cutaway; upper-stage common-dome and baffle evidence | https://images-assets.nasa.gov/image/9801810/9801810~small.jpg |
| R25 | NASA S-IVB cutaway; tank/helium layout; nine cold spheres confirmed by R3 printed p116 | https://images-assets.nasa.gov/image/0100983/0100983~medium.jpg |
| R22 | NASA F-1 assembly side photograph, no nozzle extension fitted; pump/collector profile check | https://images-assets.nasa.gov/image/6862832/6862832~medium.jpg |
| Supplemental | NASM J-2 side photograph, collection A19760773000; comparison only, institution image-use conditions, no CC0 asset claim | https://airandspace.si.edu/collection-objects/rocket-engine-liquid-fuel-j-2/nasm_A19760773000 |

Additional numerical cross-check (R23): Francis X. De Carlo / Rocketdyne, [Furnace Brazing the F-1 Thrust Chamber for Apollo](https://digitalprojects.uah.edu/files/original/20/10980/Furnbrazf1thrucham_082007094528.pdf), opening page, records 178 primary and 356 secondary tubes. This primary contractor report is a development reference; no public-domain claim or image redistribution is made.

NASA references are public-domain US government material except the separately credited archival Boeing drawing. They are development evidence. No reference photograph or downloaded texture is in the topic GLB. The pressure-cabin skin, rear bay and tank-cover meshes are adapted from NASA/Michael D. Carbajal’s public-domain model (R13), with provenance in data/SOURCES.md. The supplemental NASM photo is credited to the institution and used only for a development comparison, not a runtime asset. The unreachable LM-5 structures PDF and unavailable flight-manual URLs were not treated as inspected evidence. The NASA source is vendored for offline regeneration; only selected cabin/bay/tank-cover meshes are used, not its original descent stage, gear, RCS or antennas.

R29 is a later-flight AFJ explanation of the Block-II couch mechanism, used for shared hardware geometry, not as a claim of Apollo 11 flight photography. Its Weber manufacturer photograph is archival reference material, with no blanket public-domain claim. No R29 image is a runtime asset. The NASA couch-development technical note was searchable but its PDF download was blocked; it is not counted as visually inspected evidence.

F-1 assembly photos R4/R5/R22 lack the lower nozzle extension. Their front/profile studies explicitly compare the installed upper assembly only; R14 controls the full extension silhouette. This prevents a missing-extension photograph being presented as proof of a complete flight nozzle. Cameras were aligned by eye to the available projections; the R-16 rear view is no longer mislabeled as a side profile. The separate hatch, pad, rear-cabin, descent-cutaway, couch, IU and SM-sector sheets inspect characteristic features at larger scale.

### Looks, corrections and repeat inspection

| Look | Sheets looked at | Corrections made after looking |
|---|---|---|
| 0, inherited baseline | All six `accepted-offline-paper/*-four-views.png`, enlarged F-1/J-2/CSM/LM references | Replaced the shared F-1/J-2 silhouette and generic cabin. Built real CM window holes, SM radial structure/storage, BPC/canards, LM-5 facets/radar/RCS and tank internals. |
| 1 | `round2-look1-paper` F-1 front/pump, J-2 front, CSM front and LM front | Found rounded casting heads folding through each other, a floating J-2 gimbal, excessive decimation of repeated engines, and tube relief intruding into the mouth-clearance envelope. Corrected cap depth, added the bearing support, used metric error limits, inset the mouth, and gave the engine families separate flow hardware. |
| 2 | `round2-look2-paper` enlarged F-1 quarter/pump, J-2 front, CM hatch and LES full/detail | Rotated the F-1 pump/turbine stack onto the documented vertical axis, added its interface rail, valve covers and heat-exchanger bellows. Joined tower feet to the cover collar, smoothed CM normals analytically, corrected nominal engine lengths, and replaced separate intersecting cooling strips by continuous relief. |
| 3 | `round2-look3-paper` F-1 quarter, J-2 front/detail, and SM-sector top view | Confirmed genuine hollow quads and pane recesses against decoded geometry. Corrected the SM sector widths/orientation, added centre helium vessels, fixed descent-beam offset direction, and moved the footpad foil above its metal backing where it can actually be seen. |
| 4 | Enlarged `round2-final-paper/lm-pad-photo`, tank and cabin photographs | Replaced periodic radial footpad folds with seeded non-periodic crease segments. Replaced broad triangulated fuel-dome patches with smooth polar lofts clipped around all five tunnel holes. Corrected downcomers from a pentagon to the 1+4 engine layout and kept fuel/oxygen on separate routed lines. |
| 5 | Re-rendered final paper/cinema feature views, J-2 start-tank close-up and per-part contacts | Preserved the identifying spherical start tank after hardware decimation, including correction of its Y stretch. Position packing now preserves quantization and label transforms. Rechecked actual exit rims, tank interfaces, paths, labelled cameras and packed LM clearance with the final compressed payload. |
| 6 | Per-fragment J-2, tank section, SM cutaway and footpad sheets; LM full/detail against photographs | The native cabin front was still too regular. Restored NASA’s actual pressure-cabin facet topology, rear bay and unequal covers while retaining new Atlas attachment hardware and open nozzles. Increased the irregular footpad/strut crease relief after observing smooth compressed foil. A failed budget candidate was rejected before writing; reallocated small engine hardware tolerance to preserve these characteristic surfaces. |
| 7 | `round2-look7-paper` LM front, cabin/hatch, footpad and F-1 pump; final decoded-payload tests | Source cabin smooth normals still produced pinched highlights, so real facet boundaries now receive 12-degree crease normals. Rebuilt the F-1 upper pump interface with actual through-holes. Footpad foil now wraps over the rim with smaller distributed creases instead of a few large ridges. Moved LM RCS to four differently oriented diagonal mounts. The first corner placement failed SLA clearance by 34 mm; moved mounts to the NASA source stations (±1.60/±1.55 m) and kept the original fit assertion. |
| 8 | `round2-look8-paper` LM front/detail and wrapped-pad photograph; final CM close-up | Confirmed corrected facets and foil wrap. CM hatch top/bottom chords sank into the curved cone: projected a sampled rounded seal onto the actual cone and ray-tested its relief. The lunar rear photograph showed the inherited dark bay finish was wrong for Eagle; mapped that cover to silver and lowered the comparison camera. Added four pressure vessels suspended on the two beam pairs so a genuine descent cut exposes structure and contents. Their count/load path follows the press kit’s Descent Stage text. |
| 9 | `round2-look9-paper` rear LM, conforming CM hatch, actual descent cutaway and foil; new R24/R25 upper-stage drawings | The lower-stage baffle loop had used its common-dome station as its lower limit, producing no baffles. Corrected the actual generation range, verified lower-vessel rings by raycasting, and added the nine mounted S-IVB cold-helium vessels documented in Apollo 11’s press kit. S-IVB tanks now have their individual ring baffles, rather than the generic four-ring hydrogen pattern. Added independent S-II/S-IVB cutaway comparison views with upright NASA drawings. |
| 10 | All six final paper contacts, close engine profile/reference studies, perspective lunar rear photograph | Corrected the F-1/J-2 profile cameras to the photographed side. Replaced the factory-wide J-2 quarter reference by NASM DSH03, cropped/rotated upright and credited as Smithsonian. The lunar rear study now uses a perspective camera at a 2 m eye height, with perspective-correct interpolation and per-fragment view direction, to match the Hasselblad projection rather than showing an exaggerated underside. Final paper/cinema contacts and all enlarged characteristic details were inspected again. |
| 11 | Final paper/cinema contacts and enlarged four-dish antenna, cabin, engine and tank sheets | Antenna supports placed the feed horns inside the dishes. Corrected every parabolic feed to the actual `r²/(4d)` focal distance, rebuilt the support tripods, and added an actual-mesh ray test for all four CSM feeds. Final payload, all 39 render/reference pairs per theme, and all 69 Saturn regressions were checked together. |
| 12 | Final S-II/S-IVB cuts beside R24/R25 and SM sector study beside R3; dimensional cross-checks R26–R28 | The retained proxies still made LOX too tall and LH2 too narrow. Recalibrated pressure diameters, common-dome stations and S-IC tank-height ratio; pressure skins remain clear of the exterior skins. Removed a floating fitting inside each lower common dome, corrected its weld-ring station, and supported the S-IC helium bottles. Rebuilt full-size, equal SPS vessels, real spherical centre pressurants, different H2/O2 vessels and full-height upright fuel cells with a deck and non-overlapping mounts. Corrected SPS exit/length/throat ratio and its feed attachments. Actual-mesh ray tests now check these dimensions as well as appearance. |
| 13–14, resume | Fresh six-hero contacts, CM hatch, SM bay and enlarged pad beside AS11-40-5917 | The pad still read as soft painted material under the actual ACES rig. Changed the leg assembly to metallic foil roughness/metalness (0.31/0.84) and re-rendered the close-up; no token albedo or studio light was changed. Added a parity assertion against the actual Lighting.tsx rig consumed by the engine. |
| 15–17, resume | `round2-look15-paper`, `round2-look16-paper`, `round2-look17-paper` pad close-ups; final paper/cinema views | Found exposed patches where foil dipped through the backing at the pad rim. Lifted the shared foil envelope, increased non-periodic small creases and wrapped a continuous crinkled skirt over the edge. The new actual-payload test initially failed and drove an additional 10 mm source clearance correction. It now ray-checks all four pads at three radii and 24 angles. Looked again at the final close-up and removed the patches without painting over them. |
| 18–22, resume | Couch detail versus the Weber manufacturer photograph and labelled Block-II support drawing, then `round2-look21-paper`, `round2-look22-paper` and final paper/cinema couch sheets | Found rectangular cloth patches wrapping across themselves and shoulder straps reduced to degenerate columns. Made both surfaces explicitly open. The clearer reference then exposed the upright lounge-chair profile: rebuilt supine torso/raised leg pans, notched footpans, doubled head brackets, four outer-couch armrests and eight common-frame attenuators. The first corrected-frame camera was at the opposite end from the reference; reversed it to the photographed foot end, added turned cloth hems, actual lacing grommets, small tension wrinkles, dark side frames and curved footpan rims, and inspected the reclined profile and open frame again. Two over-budget candidates were rejected before writing; an 8 mm couch cap, 9.5 mm small engine-hardware cap and lossless omission of optional glTF JSON defaults kept the final asset below 1.5 MB. |

The preview decodes the delivered GLB and applies its actual matrices, normals, vertex albedo and `atlasSurface` material values, including the post-packing node scales. It reuses the fossils CPU studio: installed RoomEnvironment sampling, engine hemisphere/key/fill/rim rig, exposure 1.05/1.0, ACES and sRGB output. It reproduces the studio numerically. The last pass shades interpolated normals per fragment instead of using Gouraud radiance; GPU PMREM remains the acceptance authority. Hollow multipart nodes now explicitly carry `closed:false`, as consumed by GltfSource/PartNode, so cutaway preserves real interior surfaces instead of hatching every back face. Plane clipping is evaluated per fragment. The delivered extras are regression-tested. The topic still disables shadows. No flat-colour silhouette preview is used as material evidence.

### Per-part grades and round-1 → round-2 counts

Counts include all repeated copies. Source tags refer to the catalogue above. A grading here concerns the modelled manufactured forms; the inherited S90 terminal-stow envelope remains an explicit educational composition, with whole-part compression rather than newly simulated independent hinge motion. That mechanism statement is retained in EN/ZH instead of silently claiming a physical deployment calculation.

| Part | Round 1 triangles | Round 2 triangles | Grade | References | Change / retained detail |
|---|---:|---:|:---:|---|---|
'''+'\n'.join(lines)+f'''

### Payload, behaviour and facts

- Round 1 → round 2: **{previous['totalAfter']:,} → {audit['totalAfter']:,} triangles**, **{previous['callsAfterEstimate']} → {audit['callsAfterEstimate']} estimated material draw pieces**, **{previous['glbAfter']:,} → {audit['glbAfter']:,} bytes**. The full geometry count includes mutually hidden configurations and stays below 350,000; this is not a GPU FPS/multipass statistic.
- Final SHA-256: `{sha}`. Compression uses meshopt, 12-bit positions, 7-bit normals and 8-bit colours. Copied/adapted position packing from living-things verifies the replicated-bit grid before compaction, compensates node scales **and label points**, trims harmless JSON float spelling noise and omits optional zero/false accessor defaults losslessly. Small protected probe/start-tank curves bypass broad hardware simplification; engine hardware uses a metric 9.5 mm maximum simplification error, couches 8 mm, and characteristic LM/LES forms 5 mm. These are builder tolerances, not new learner-facing dimensions. Repeated detail is merged per selectable part; no per-fastener draw calls or runtime network.
- The retained three flows still have five paths each and the same launch/stage/RUN gates and visual speeds. Fuel and oxygen geometry now use the exact same authored centre-lines as FLOW. New ray tests inspect actual delivered pipes, not a separate token or metadata-only proxy.
- The geometry baker no longer owns prose. It preserves all 360 current bilingual values by stable IDs, asserts the before/after text digest, and writes `editorial-text-audit.json`. Future main-session readability wording survives regeneration. Only the already reviewed 14 shape-dependent detail pairs differ from this worktree’s HEAD; chapter/beat text is unchanged.
- Minimal EN/ZH part-description corrections describe real windows, Apollo 11 bay contents, engine fittings, couches and LES cover/canards. The two generic SM vessel placeholders become four SPS vessels plus actual support-system vessels, with the part ID/count unchanged. Stage domes/common bulkheads and fittings are described accurately. No chapter, beat, teaching experiment number or historical engine count changed.
- All thirteen terminal configurations remain. CSM pieces retain a common rigid transform; ascent pieces rise together; only one LM exists. Probe/port alignment, five F-1 clearances, folded-envelope fit and every labelled camera anchor are tested against decoded geometry. The main-session one-tap fix was left intact; earlier round-1 statements calling that patch unapplied are historical.

### Gates and work outside this topic's ownership

- `pnpm check`: passed, 0 errors / 0 warnings (5 existing hints).
- `pnpm validate`: passed, 94 topics / 0 errors / 0 warnings.
- Saturn V decoded-payload suite: final result recorded in `round2-verification.json`; includes aperture, nozzle, spherical start-tank, common-dome and actual FLOW-pipe checks.
- `pnpm test`: the default final run encountered the existing shared Drei import failure, the missing `dist/en/topics` JS-budget prerequisite after the blocked build, and one unrelated toad-dermis 5-second timeout. Re-ran the unchanged script with `pnpm run test --maxWorkers=2 --testTimeout=15000`: {v["gates"]["test"]["filesPassed"]}/{v["gates"]["test"]["filesPassed"]+v["gates"]["test"]["filesFailed"]} files passed, {v["gates"]["test"]["testsPassed"]} tests passed. The timeout cleared; both remaining failures are outside Saturn ownership. All {v["gates"]["saturnRegression"]["tests"]} Saturn regressions pass against the delivered bytes. No Vitest config was added or edited.
- `pnpm build`: failed in pre-existing shared engine code with `Cannot access 'CLIP_QUANTITIES' before initialization`. A schema/runtime-only Vite bundle reproduces it without any Saturn content. The same bundle loads successfully when the proposed patch is substituted in memory. This is proof of the isolated fix, **not** a claim that the unmodified full build is green.
- `build-magnet-cycle.patch` makes the circular facade's constant lookup lazy; `catalogue-html-import.patch` uses the actual `.js` entry (direct Node import verified). Both pass `git apply --check`. Neither is applied because shared engine files are forbidden. The main session must review/apply them and rerun the full build/suite. Browser/desktop gates remain with Claude as instructed.

Final comparison directories:

- `/Users/gavin/work/atlas-b2-r-saturn-v/scripts/geo/saturn-v/comparisons/round2-final-paper`
- `/Users/gavin/work/atlas-b2-r-saturn-v/scripts/geo/saturn-v/comparisons/round2-final-cinema`

Reproduce with `build-parts.ts`, `round2-evidence.ts`, `preview-studio.ts round2-final paper` / `cinema`, `contact-sheets.ts round2-final-paper` / `round2-final-cinema`, and `audit-model.ts`. Reference originals stay under the ignored `refs/` directory; references and measurements are indexed by `round2-references.json`, `mesh-audit.json`, `fit-audit.json` and `round2-verification.json`.
'''
notice='\nCurrent payload: see **Apollo 11 round 2** below. The earlier 10 A / 23 B audit is retained as history.\n'
if notice not in old:old=old.replace('# Saturn V — 3D rebuild evidence\n','# Saturn V — 3D rebuild evidence\n'+notice,1)
path.write_text(old+section)
print(audit['totalAfter'],audit['glbAfter'],sha)
