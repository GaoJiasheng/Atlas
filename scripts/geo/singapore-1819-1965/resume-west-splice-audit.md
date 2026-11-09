# Fix2026-11-09 — independent western-splice audit

Read-only geometry/source audit at the start of the final northern repair. This audit changes no runtime geometry, source-bank recipe, engine, package or shared file. The root session is separately repairing the restoration/splice; the observations below describe the pre-repair delivery snapshot.

## Two independent causes

**A. Modern URA water survives north of the historical restoration coverage.** The shared `local-land.ts` first subtracts URA2019 `WATERBODY` parcels. The keep-name list exempts MacRitchie, Lower/Upper Peirce, Upper Seletar, Bedok, Pulau Tekong and Jurong Lake; western Poyan/Murai/Tengeh/Kranji reservoirs are not exempted. The old topic restoration/finalizer replaces only103.60–103.79E,1.27–1.373N, leaving northern pieces of those current impoundments in historical L5.

These decoded delivery vertices match current URA2019 water boundaries within a metre, while lying hundreds of metres from either source-bank outline:

| Decoded L5 vertex | Nearest URA `WATERBODY` OBJECTID | Distance to current water edge | Distance to revised G16 source boundary |
|---|---:|---:|---:|
|103.67481317,1.37871449|9381|0.021m|411.51m|
|103.67831023,1.37880186|9342|0.914m|791.63m|
|103.68430879,1.38039982|9368|0.438m|1453.12m|
|103.66486772,1.38755258|9434|0.176m|291.01m|
|103.66484831,1.38383269|9434|0.607m|388.15m|

Distances use local metre conversion and closest segments; the modern parcel matches are more precise than the5m shared simplification tolerance. This is direct lineage evidence, not inference from a rectangular appearance. The delivery's remaining427m cap at latitude1.37299988, from103.66592494 to103.66208536E, is the historical restoration cutoff through this residual modern water.

**B. The G15 selection itself already creates an artificial north bank before modern-water subtraction.** `work/coast-g16-with-west.geojson` contains a1456m straight edge from[103.65799817,1.373] to[103.67107960,1.373] before shared `cutWater`. It comes from the old G15 `westBox` north boundary at1.373 against the differently shaped G16 coast. The common-dry-land route introduced for the G35 patch's separate native-y327 seam does not change this more northerly G15/G16 selector.

Expanding historical restoration to1.48N removes A but would preserve B. Both require repair. Modern-water restoration should use matching coverage in input generation and the finalizer, then inspect actual decoded coast/control geometries again.

## A real northern coast intersection exists

A search of actual revised G16 coast segments and G15 source-bank segments found one crossing in103.65–103.69E,1.373–1.378N. All segments touching the three known G15 image-frame closure vertices, and long>1km closure edges, were excluded.

- Geographic crossing: **103.6699900000E,1.376824100441372N**.
- G15 ring0 segment129: [103.66999,1.37676]→[103.66999,1.37693]. Native original: **5229.5091,6068.8226**.
- Revised G16 ring1 segment975: [103.6702560343865,1.3770834351103591]→[103.6698759987176,1.376712970127641]. Native original: **7482.8294,5367.0741**.
- G15's first real guide[5200,6000] maps to103.6695644139,1.3778123530. The candidate lies approximately69 native pixels below that guide, inside the genuine traced bank; it is not the frame's closing edge.

Both native crops were actually inspected. G15 shows the vegetated/mangrove shore beside Sungei Poyan, and G16 shows the west-facing mangrove bank beside Sungei Berih. The point is not a sounding, label, source-frame vertex or arbitrary connector. Qualification remains approximate: G15 has only internal graticule registration, and G16 retains its failed54.74/72.87m external LOO and1954 correction age.

Durable evidence: `resume-west-north-join.json`, `previews/G15-north-source-join.png`, `previews/G16-north-source-join.png`.

## East side passes; a straight west side does not

The crossing→[103.691,1.376824100441372] internal selector segment was sampled at1000 evenly spaced positions, excluding its initial boundary point. **All1000 are G16 land and outside G15 water.** The same count also passes for endpoints[103.691,1.378] and[103.691,1.38]. This supplies a common-dry-land inland connection without exposing a new bank.

However, a straight westward latitude segment must **not** be represented as verified common sea:

| West endpoint | Samples | Failures |
|---|---:|---:|
|103.65E|1000|40|
|103.61E|1000|13|
|103.603E|1000|12|
|103.59E, including unknown frame strip|1000|170|

For the103.65E test, all failures are G16 land while G15 says water. Their longitude intervals are103.66929035–103.66883058,103.66445277–103.66417291, and a sample near103.66361319. They belong to G16's **mainland** component1 (approximately553.78km²,7329 exterior vertices), not detached symbol fragments; deleting complete components is therefore inappropriate. The western strip below approximately103.60285478E is outside this G15 water selection's coverage and must remain explicitly unqualified; its disconnected selector-born component may be removed whole as before.

The minimal source-preserving repair anchors at the real crossing, uses the verified common-land connection inland, and derives a **common-sea route** around the G16 protrusions for the westward selection boundary, with dense vector checks against both masks. Reuse the existing sampled common-land routing strategy with an inverse wet predicate; do not merely move the horizontal cap from1.373 to1.376824. Every exposed output shore must still be one of the original source bank arcs. A full new source-qualified replacement is an alternative if the shared wet route cannot be established. No sea route is asserted by this audit.

## Metadata assessment

The source identities, individual PD status, G35 native checksum, October1958 date and explicitly stated January1961 temporal inference remain accurate. The G15 corrected-edition age caveat and G9/G11/G16/G35 failed external accuracy caveats also remain accurate. No NAS-restricted map dependency is introduced.

The pre-repair broad claims that no rectangle connector is exposed, that complete western inlet banks are preserved, and that all old western modern-water cuts are removed exceed the actual delivered geometry. The current wet/dry witness suite focuses on Pandan and local islands and does not detect the northern Poyan/Murai fragments. Once both defects are repaired, regenerate actual source overlays and paper/cinema plates, and refresh asset counts/hashes and verification records. The old dated tables in `data/SOURCES.md` are clearly labelled historical/superseded; they do not need rewriting as though they described the new delivery. Source-count or footprint metadata should be amended if the separate new G35 upper-inlet trace changes source coverage.

The actual published JSON provenance was also checked: coast L5 carries `src:[G16,G11,G30,G32,G15,G35]`; the K15a Singapore control feature carries `src:[G11,G15,G16,G30,G32,G35]` and `certainty:"approximate"`. These source/uncertainty metadata accurately include both old and new evidence. The defect is geometric selection/restoration, not a missing G35 attribution or a false precise-certainty flag.

## Native northern-bank extension and the limit of cap expansion

The actual existing G15 mask north-bank endpoint is[103.66985,1.377], native[5219.730517,6056.540034], before its long straight closing edge to[103.6028513969,1.3773222600]. The old first guide[5200,6000] is visibly **open water**, approximately70 native pixels west of the natural vegetation front at that row. It must not be used as a bank constraint.

`resume-G15-north-bank-trace.json` supplies43 independently observed native points continuing the actual eastern mangrove/tree-symbol front, from that exact old endpoint to native[5372,5881], geographic[103.6719941958,1.3795443806]. `resume-G15-north-bank-trace.ts` reproduces the geographic conversion using the existing G15 graticule fit; it does not mutate any live input. `previews/G15-north-bank-extension.png` was rendered and actually inspected at three screen pixels per native pixel. The bank convention is the outer vegetation-symbol front; no separate continuous high-water ink line exists in this crop. Native reading uncertainty is approximately2–4 pixels, in addition to the previously stated unqualified external datum.

**A cap expansion alone is not qualified.** Two unequivocal source-dry points, native[5000,6060] and[5050,6100], map to[103.6667314263,1.3769272498] and[103.6674450487,1.3763562980]. Both currently lie inside G15Water despite dense native vegetation fill. The northern vegetated peninsula was outside the previous G15 westBox's1.373N selection scope, so these omissions were previously latent. Extending G15 selection north past them would expose the incomplete source mask. A northern common-sea path around the peninsula tip would put the peninsula inside the selected lower region and erase genuine source land unless that land is preserved explicitly or its actual banks are traced. Do not infer that subtracting G16 land only while finding the selector makes the complete selected G15 land mask correct.

The wider native strip also shows that a horizontal closing edge at native y5880 is water east of approximately x3000, but crosses Johor mainland farther west, well before longitude103.61E. An entire western frame cannot be described as source-verified sea. Such non-Singapore coverage must be excluded explicitly, or the closure must follow the actual open strait. The supplied eastern extension is a genuine bank continuation, not a certification of either proposed water closure.
