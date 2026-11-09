# Fix 2026-11-09 — registration research and G35 placement

All measurements below were generated from source rasters. Native source windows and final observation overlays were opened with the offline image viewer. No browser was opened; no engine/runtime file was changed. Grid fits and ground fits are explicitly separate. A small grid residual is not a WGS84 accuracy certificate.

## G11: the grid confirms scan geometry; geographic budget remains failed

`resume-register-grid.py` reads 16 distributed printed Johore grid intersections, retained in `resume-G11-grid.json`. The main map's E460000/N200000 crossing lies inside the separately scaled southern inset and was rejected by map identity, replaced by main-map E465000/N200000. Native pixel readings were visually reviewed on `work/resume-G11-grid-readings.png`.

The printed projection is Cassini Soldner / Everest; the printed origin is 2°02′33.30″N, 103°33′45.93″E, false origin 450000 yd E / 300000 yd N. `resume-register-fit.ts` fits local grid metres. Its no-datum-shift definition expresses the printed local coordinate system, not an assertion that its degrees equal WGS84.

| G11 model | Internal fit RMS/max m | Internal LOO RMS/max m | Existing18 external controls after translation: fit RMS/max m | External translation LOO RMS/max m |
|---|---:|---:|---:|---:|
| Grid affine |11.41 /19.98|14.22 /24.65|74.21 /133.61|78.58 /141.47|
| Grid poly2 |8.54 /14.74|14.09 /27.45|75.93 /138.96|80.39 /147.13|

Full per-point numbers: `resume-G11-grid-fit.json`. Neither reaches the required30/60 m external gate. No external point was removed by its residual.

## G16: 16 actual partial-axis observations, no invented grid intersections

The chart has readable border ticks but does not supply complete geographic coordinates for each border point. `resume-register-G16.py` therefore uses eight longitude-only ticks (103°40′,103°50′,104°10′,104°20′, top and bottom) and eight latitude-only ticks (1°30′,1°20′,1°10′,1°00′, left and right). Each constrains **only its printed axis**. Two separate three-parameter affine axis models fit Mercator metres. The border's unprinted latitude/longitude was never invented. These16 ticks are not16 surviving ground features.

|G16 axis|Internal fit RMS/max m|Internal LOO RMS/max m|
|---|---:|---:|
|Longitude|9.94 /16.43|15.99 /29.88|
|Latitude|18.18 /32.31|30.84 /61.61|

Applying only a two-parameter translation fitted to the original six named external observations gives fit45.62/60.73 m and LOO54.74/72.87 m. This improves on the old unconstrained six-point LOO152.53/289.29 m but **still fails30/60 m and the qualified-ground-point count**. Its datum, small-corrections1954 age, and cape generalisation are unresolved. Full data: `resume-G16-graticule.json`. Preview: `work/resume-G16-graticule-readings.png`.

## G35: new1958 source, useful coastal placement with failed absolute gate retained

Input is ANU's native8350×6806 GSGS4923 Singapore1958 scan `raw/resume-source-anu1958.jpg`. Licence, exact publication evidence and source checksum are documented by the separate source audit; source registration does not alter those claims. `resume-register-anu1958.py` reads16 printed Johore grid intersections. Bottom-row controls avoid the legend and textual margins. All16 readings were inspected in `work/resume-register-anu1958-grid-readings.png`.

|G35 model|Internal fit RMS/max m|Internal LOO RMS/max m|
|---|---:|---:|
|Grid affine|24.21 /41.07|30.15 /52.48|
|Grid poly2|9.75 /22.75|17.30 /40.92|

Full internal report: `resume-register-anu1958-internal-fit.json`. The poly2 model compensates scan curvature; it is selected on internal LOO, with the internal meaning preserved.

The native source was then independently inspected for22 external candidates (19 road crossings and3 rocky cape candidates). Inverse predictions were used only to centre search windows, never as control readings. `resume-register-anu1958-external.json` retains exact observed source pixels, window extents, source-reading uncertainty and per-point limitations. `work/resume-register-anu1958-external-readings.png` marks final observed pixels, while the earlier `*-targets.png` marks search predictions and must not be mistaken for observations. Native city magnifications are in `work/resume-register-anu1958-city-details.png`.

Three additional rural candidates were withheld before fitting: the old Braddell/Thomson and Farrer/Holland crossings are visibly displaced from today's axes; Nee Soon/Springleaf cannot be securely identified among unlabelled minor roads. The three capes are retained as diagnostics, with additional Changi ambiguity and no assumption that generalised cape symbols are fixed monuments. The independently identifiable19 named road crossings are the best current placement reference, but road widening and symbol generalisation prevent claiming exact surveyed-axis survival or a passed external gate.

|G35 external model|Count|Fit RMS/max m|LOO RMS/max m|
|---|---:|---:|---:|
|All candidates, unconstrained affine|22|46.22 /88.55|71.22 /239.11|
|19 road crossings, unconstrained affine|19|32.77 /76.92|42.94 /99.18|
|Grid poly2 +19-road translation|19|37.73 /77.70|39.82 /82.01|
|Grid poly2 +7 rural-road translation diagnostic|7|45.07 /71.10|52.58 /82.95|

**The best G35 external result fails the required30 m RMS /60 m maximum.** The grid-based model keeps scan scale/curvature constrained outside the town cluster. The19-road least-squares local projected offset is E−183.31115851351242m, N−28.458638043436956m. Jurong lies partly west of this road-control distribution; extrapolation error is not bounded by these town/rural residuals. Do not round this offset to a new claim of survey accuracy.

`resume-register-anu1958-model.ts` exports `buildNativeModel()` (unshifted local datum) and `buildModel()` (grid poly2 plus the19-road translation). `buildModel()` is the helper for placing source-traced geometry; its name explicitly preserves failed external acceptance. Its durable report is `resume-register-anu1958-fit-report.json`. The shift is an empirical registration adjustment, not an assertion that a1968 datum definition applied in1958. Its helper is a build script only; it adds no first-load JS.

Modern OSM coordinates remain coordinate-only control references, with no OSM line/polygon merged into traced coast geometry. The19-road sample was selected by source correspondence and no control was removed merely to meet residuals. Leave-one-out for the translation removes each external point from the offset fit while keeping the independently measured grid scan fit fixed; it therefore estimates external translation prediction error, not full historic source survey uncertainty.

## Datum source check

JUPEM's official2021 geodetic circular describes MRT48 and its replacement by the1968 readjustment: <https://www.jupem.gov.my/jupem18a/assets/uploads/files/pekeliling/d95f4-pkpup-2-2021.pdf>. JUPEM separately lists supported datum transformation products: <https://jupem.gov.my/ms/orang-awam?perkhidmatan=pemetaan>. These primary references support keeping historic grid, later datum adjustment and WGS84 ground accuracy separate; neither certifies this map's underlying survey datum or turns its internal grid residual into independent ground error.

## Reproducibility

The new Python observers use already available Pillow, NumPy and OpenCV. The TypeScript helpers load the shared build-only `scripts/geo/.tools/node_modules/proj4`; `ATLAS_PROJ4_MODULE` can override its location. Run the grid observer before its fit script, and the external observer before its fit script. No package or lock file was modified. The exported G35 helper was smoke-tested at native2378.5,4643.5: unshifted103.7271555152,1.2982867064; shifted103.7255081443,1.2980294247.

## G16 build helper

`resume-register-G16-model.ts` exports `buildG16Model()` for the constrained graticule plus six-ground translation and `buildG16NativeModel()` without that external translation. The helper evaluates the retained longitude and latitude axis coefficients at native source x,y, adds the empirical E−20.13630689214915m/N−16.626038941882143m spherical-Mercator translation, then inverts spherical Mercator. Its result at native7024,8277 (Sultan Shoal symbol) is103.6483259311,1.2391404196; the nonzero separation from the independent MPA tower coordinate is retained in the residual report. This helper needs no extra dependency. Its external54.74/72.87m LOO remains failed.

## G9: new square-grid diagnostic rejected for live use

After the G16/G35 work, sixteen distributed native G9 grid intersections were read with `resume-register-G9-grid.py` and actually inspected in `work/resume-register-G9-grid-readings.png`. One southeast search crossing was withheld because its grid is interrupted by the title cartouche and replaced with a clearly visible western intersection. Lower controls avoid the legend/cartouche. The printed note specifies squares with sides of two miles. Grid coordinates therefore use3218.688m per two statute miles and an **arbitrary common local origin**; the printed Fort Canning staff degrees are not asserted to be WGS84 and no unprinted historical projection is invented.

`resume-register-G9-fit.ts` fits source pixels to this local metre grid and compares those coordinates with unchanged18 external native readings in local ellipsoidal WGS84 metric LAEA. Its external variants fit either translation alone or a unit-scale rotation plus translation. The latter preserves the independently printed grid scale; no free scale change is introduced to lower residuals.

| G9 variant | Internal fit RMS/max m | Internal LOO RMS/max m | External18 LOO RMS/max m |
|---|---:|---:|---:|
|Grid affine +translation|14.77 /26.40|19.16 /33.88|143.26 /356.98|
|Grid affine +unit-scale rotation/translation|14.77 /26.40|19.16 /33.88|147.45 /352.30|
|Grid poly2 +translation|8.41 /13.08|15.71 /27.11|144.73 /359.13|
|Grid poly2 +unit-scale rotation/translation|8.41 /13.08|15.71 /27.11|147.57 /355.17|

The town-only12-road rigid-fit diagnostic gives44.41/70.66m LOO for grid poly2, but those town points are spatially concentrated and cannot establish whole-island accuracy. The whole-island fits are worse than the existing active fit. **Do not adopt this G9 diagnostic as a live replacement.** Full observations: `resume-register-G9-grid.json`; all per-point fits: `resume-register-G9-fit-report.json`. This investigation adds genuine source observations without pretending that internal grid precision resolves historical survey error or cape continuity.


## Additional independent identity check, retained without residual-based pruning

The official LTA Thomson/Balestier diversion plan explicitly depicts old, existing and new alignments: <https://onemotoring.lta.gov.sg/content/dam/onemotoring/Driving/Road_Closures/Temporary/Traffic-Diversion-along-Thomson-Rd/Thomson_Rd3A-3_Map.pdf>. It was downloaded for read-only inspection and rendered to `work/resume-register-thomson-lta.png` under the PDF skill. This establishes that today's junction is subject to alignment changes. It does **not** independently locate the1958 road axis, date a particular source1958-to-modern displacement, or explain the77m residual in full. No point is removed on this evidence alone.

NHB's account of Adam Road Food Centre describes highway construction announced in1973 linking Adam and Farrer Roads and the resulting food-centre move: <https://www.roots.gov.sg/stories-landing/stories/hawker-centres/adam-road-food-centre>. It establishes later reconstruction around that junction, but does not quantify horizontal relocation of the historic crossing. The current control is an average of two OSM divided-road nodes; correspondence to the1958 drawn median remains uncertain. It is retained as a diagnostic candidate. No primary evidence was found that independently establishes relocation of the exact Yio Chu Kang/Upper Serangoon intersection; nearby viaduct construction by itself is insufficient. The19-road fit remains unchanged and failed.

A G11 unit-scale rigid grid-to-ground variant was also evaluated in `resume-register-G11-rigid.ts` / `resume-register-G11-fit-report.json`, using ellipsoidal WGS84 LAEA for physical metre comparisons. Best affine-grid all18 translation LOO78.91/144.16m; adding unit-scale rotation gives81.35/156.26m. It does not improve the active77.78/146.13m unconstrained fit and is not recommended. Spherical LAEA coordinates were explicitly replaced with ellipsoidal ground metres for this direct physical-grid comparison; near the equator their northing metre scales differ enough to matter. This change does not affect the separate Cassini-based G11/G35 results or spherical-Mercator G16 model, where source and external positions are consistently expressed in the same projection.


##1958 origin glyph verification —2026-11-09

`resume-register-anu1958-origin-proof.ts` checks the partly faded red origin-minute glyphs against two independent pieces of source evidence: the clear G11 Johore Grid legend, and the1958 sheet’s own clear southwest corner latitude/longitude. The latter prints01°12′50″N /103°37′47″E. Using the same16-point native grid fit at pixel375,6360, the adopted02°02′33.30″N /103°33′45.93″E origin agrees within36.02m; the source memo’s earlier02°01′/103°23′ interpretation misses by18.64km. Each incorrect minute interpretation separately also fails (latitude1.82km; longitude18.55km). No modern ground point or empirical datum translation is used. The source memo was corrected to an explicitly qualified reading and the existing model constants remain unchanged. Durable results are in `resume-register-anu1958-origin-proof.json`; source/corner previews were actually opened and inspected.

## Full external affine after independent grid calibration —2026-11-09

The final diagnostic in `resume-register-grid-affine-external.ts` first holds the independently observed16-point source-grid **poly2 scan calibration fixed**, then fits a full six-parameter affine transform from local grid metres to ellipsoidal WGS84 LAEA ground metres. Every original observation remains in each declared set; no points are pruned. External leave-one-out removes only the tested ground point while retaining all16 independently observed grid controls. G35 reports both all22 original candidates and the previously declared19-road set, without changing the latter's membership.

| Map / external set | Fitted RMS/max m | External LOO RMS/max m | East/north axis scale change | Shear deviation from90° |
|---|---:|---:|---:|---:|
|G9 /all18|69.79 /153.24|107.88 /245.99|+0.5865% /+4.1252%|−1.3127°|
|G11 /all18|61.76 /124.42|77.61 /145.78|+0.9950% /+1.2722%|−0.7652°|
|G35 /all22|46.35 /89.05|71.80 /240.52|+0.1869% /−0.0937%|+0.1236°|
|G35 /previous19roads|33.70 /79.48|44.45 /107.41|−0.3087% /−0.4438%|−0.2866°|

**None passes its required external tolerance.** The G35 constrained grid+translation39.82/82.01m LOO remains better than its new full-affine result. The G11 change from the existing77.78/146.13m result is negligible and still failed. The fitted scales/shears above are empirical deformations, explicitly not a preserved physical map scale or a proven historic datum transform; the G9 north-axis4.13% correction is particularly substantial after a physically calibrated square grid. Exact matrices, translations, singular-value principal scales, rotations and individual fitted/LOO residuals are retained in `resume-register-grid-affine-external-report.json`. This diagnostic changes no live geometry and establishes no new point identities.
