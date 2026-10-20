# K1 registration review — second pass

20 October 2026. Read-only review of `lines.json`, `work/lines-fit.json`, the downloaded 1920 × 1205 BIS 1959 source image, docs/34 §3.2/§8.1, and the upstream history topic's README, SOURCES-GEO and third-pass CODEX-REPORT. No source pixels, controls, map geometry or published output were changed by this review.

**The requested ≥16 independently observed controls and external positional-accuracy acceptance remain unmet.** `lines.json` correctly discloses that its 16 points are constructed intersections obtained by linearly connecting opposite printed border ticks. The source image has border degree/minute ticks but no printed internal graticule lines or crossings at those 16 points. Therefore the sixteen generated interior intersections do not establish sixteen directly observed homologous features. They are correlated outputs of the same border interpolation.

The selected `laea(103.8,1.3)+poly2` fit reports RMS **20.17 m**, max **40.12 m**, LOO RMS **37.49 m**, LOO max **68.80 m**. These measure agreement with the constructed graticule model. They must be labelled internal construction residuals, not external historical-geography accuracy, and cannot establish the brief's RMS 150 m/max 300 m acceptance on their own. Leaving one generated point out does not make the remaining generated controls independent observations. Source projection and datum are not identified in this preview.

The printed Causeway and the mainland coast can be recognised in the source, but the map is visibly generalised. Village dots, airport circles and reservoir symbols are not precise survey monuments. In particular, a present-day settlement point is not automatically the same physical point as a 1959 black settlement dot. A reservoir's outline centre is not a marked dam endpoint. River mouths at Kranji, Seletar and Serangoon have changed or later become impounded; matching their present-day shapes would need a documented historical correspondence. These features are useful inspection candidates, not sixteen newly qualified controls.

## Upstream L4/L5 are comparison evidence, not an accuracy certificate

The upstream `scripts/geo/singapore-1819-1965/README.md` calls the asset an **unaccepted geographical research draft**. Its SOURCES-GEO and CODEX-REPORT third pass retain the following issues:

- L4/G11: 18 active controls, fitted RMS/max **61.91/124.73 m**, LOO RMS/max **77.78/146.13 m**; it fails that topic's RMS 30 m/max 60 m requirement. The original map is revised 1937, War Office 1941, AMS 1944, not an observed 1959 coastline.
- L5/G16: six active controls, fitted RMS/max **41.16/53.69 m**, LOO RMS/max **152.53/289.29 m**; it fails the required point count and has no complete independently dated 1961 Jurong trace. Its chart corrections stop in 1954. The era label 1961 is not source-date proof.
- The upstream third pass explicitly withheld ambiguous modern road-convergence candidates rather than counting them as qualified controls or moving original observations to improve the fit.

Using already transformed L4/L5 vertices as control coordinates would compound their registration/source-age/trace uncertainties. Selecting the vertices nearest the current K1 prediction would also be circular. They can be shown in a comparison plate with the limitations above, but their numerical precision cannot validate the schematic 1959 map.

## What this review establishes

The BIS map is a real, public-domain source and its stippled City/Naval Base areas are legitimate tracing material when labelled approximate. The current registration is reproducible and honestly describes how its border interpolation was constructed. This review found no evidential basis for adding sixteen genuine geographic pixel-to-coordinate correspondences without further independently sourced historical point identification. No points were invented, inferred from a fitted prediction, or promoted merely to meet the count. K1 can remain a visibly qualified draft, with the unresolved registration criterion listed in the final report; a green schema or ring gate does not close it.
