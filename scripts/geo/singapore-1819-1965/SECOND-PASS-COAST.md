# Second-pass coast evidence and limits

Second-pass source review improves registration and removes known wrong/ambiguous point identities. **G9/G11/G16 historical coast acceptance remains incomplete.** A low fitted maximum is not source shoreline identification, and the required LOO/coverage/whole-island control distribution still fails.

All residuals below are metres; `projection: auto` selects minimum leave-one-out RMS from the unchanged shared fit library. Before is the first-pass handoff; after is `work/georef-G*-fit.json`, used by shared `lines.ts`.

| Map | CP before → after | Model before → after | Fit RMS/max before → after | LOO RMS/max before → after |
|---|---:|---|---:|---:|
| G9 |16 →18|Mercator+affine → equirectangular+affine|189.70/359.50 →69.79/153.31|232.84/440.71 →107.71/243.91|
| G11 |16 →18|Mercator+affine → equirectangular+affine|145.59/290.67 →61.91/124.73|177.64/353.96 →77.78/146.13|
| G16 |16 nominal →6 named|equirectangular+affine → Mercator+affine|139.15/386.61 →41.16/53.69|160.24/425.96 →152.53/289.29|

G1/G4/G7 models/control sets were unchanged: G1 12 LAEA+affine fit42.22/87.43, LOO58.39/113.58; G4 12 Mercator+affine44.39/75.78, LOO60.16/103.47; G7 12 Mercator+affine24.02/49.94, LOO32.77/63.31. Printed graticule diagnostic for G15 is **not external modern-coordinate accuracy**, and its small internal residual must not be compared with the above budgets.

G9/G11 add twelve surviving town road junctions independently reread in native rasters (`work/G9-town-grid.png`, `G11-town-grid.png`). Seven generic summit/place-name points were removed because a named modern peak does not establish which historical printed station/building was selected. Buloh/Gedong/Irau soft mangrove cape nodes were removed because no unchanged fixed shoreline position was demonstrated. G9 Rimau's old source pixel was in water south of the actual headland; it was corrected to the printed northwestern rocky tip. G11 Rimau/Berlayer tips were reread. The six remaining rocky cape checks plus twelve town junctions improve identity/fit but leave north/west extrapolation and urban spatial concentration. Retained cape/current street centreline generalisation does not become a surveyed 30m control merely by naming it.

G16 discards all nine anonymous MapWarper points, all generic hill-name controls and soft mangrove cape pairs. Three independently read original fixed lighthouse stars use official MPA named-light coordinates: Sultan Shoal `[7024,8277]` → `[103.648066667,1.239616667]`; Raffles `[8970,9940]` → `[103.740833333,1.1601]`; Horsburgh `[22923,6343]` → `[104.405616667,1.330233333]`. Three separately read rocky tips (Changi/Berlayer/Rimau) remain approximate controls. Full receipts, native crops and reasons for rejecting Fort Canning replica/replacement towers are in `georef-G16-lighthouse-candidates.json`. [MPA named positions](https://www.mpa.gov.sg/port-marine-ops/arrivals-and-departures/vessels-arriving-in-singapore). Six controls fail the ≥16 whole-map requirement; no count was manufactured using anonymous external points.

`georef-fixed-buildings-candidates.json` records the church review. G9's explicitly labelled St Andrew's cruciform and current original-building centroid have a stronger identity than a map place node, but current Roots directions/Wikidata point semantics differ. The G11 tower icon is generalised; other crowded/unlabelled temple/church symbols were withheld. These candidates do not enter the active final fit.

## Lower-river water

The `lines.ts` colour-following bank trial was rejected after native image inspection: even95–100% ink shares selected overprinted letters, bridges and streets. Those extra bank parts were removed from `lines.json`. `river-bank-inputs.ts` instead transforms individually inspected native-pixel lower-bank vertices using the unchanged shared auto model, producing `work/G1-river-water.geojson` and `G4-river-water.geojson`. These are map-derived source traces, with their source vertices retained in the typed helper; no geographic polygon was invented. The G1 Battery headland remains outside the water selection. The upper closure crosses printed river water and does not claim an independently reconstructed upstream reach. URA WATERBODY exclusions provide separately attributed upstream coverage. G1 is an1822 proposed-plan backcast, G4 a1839 source; their date/plan limitations persist. G7 retains its own1893 riverbank/coast water mask for L2.

## Western source

G15 (Admiralty2587) Commons/printed title specifies survey south of Tg Karang in1960–61, published29April1966, small corrections through1967–74. Commons gives `PD-UKGov`; original UKHO credit is retained. G14 (Admiralty2014) likewise has a1961 survey but later corrected industrial additions. `west-coast-inputs.ts` digitises the natural mainland shore on G15, and shared `lines.ts` follows its ink. `coast-inputs.ts` splices only western Tuas/Pasir Laba, west of103.691E, into the shared G16 outline. Its rectangular region is a data splice selector; the source coast supplies the shore and the shared local-land stage intersects URA land. Eastern1966 depot/shipyard/jetty outlines are excluded from that splice. G14 and easternJurong/Pandan are **not completed**; later corrected additions lack individually dated1961 qualification. G15 uses printed graticule internal registration, with chart datum/external accuracy and seam differences unmeasured. Thus this is an approximate western improvement, not complete accepted1961Jurong.

Final shared native-ink shares: G9 four parts94/95/94/95%; G11 87%; G16 78%; G15 75%; G1 town96/100%; G4 town100/97%; G7 town93%. G11/G16/G15 shoreline identification targets remain failed. Source overlays are `work/lines-show-coast-g15-west-water-0.png`, `work/G15-trace-overview.png`, and native bank review grids. Ink shares of discarded river trials are not acceptance evidence.

## Rebuild and checks

```
pnpm tsx scripts/geo/singapore-1819-1965/river-bank-inputs.ts
pnpm tsx scripts/geo/singapore-1819-1965/west-coast-inputs.ts
pnpm tsx scripts/geo/lib/lines.ts --topic singapore-1819-1965
pnpm tsx scripts/geo/singapore-1819-1965/coast-inputs.ts
pnpm tsx scripts/geo/lib/local-land.ts --topic singapore-1819-1965
```

`coast-inputs.ts` regenerates the old work/coast-g9/g11/g16-main input names from shared classes and writes `work/coast-g16-with-west.geojson`; it also selects dated town water masks. `river-bank-inputs.ts` outputs additional independent source-water masks. Run source-script generators before shared lines, then extract. No topic-local replacement for the shared local-land/simplify pipeline is added.

`pnpm check` after the new typed helpers: **0 errors,0 warnings** (497 files; four unrelated hints), log `work/second-pass-typecheck-coast.log`. Shared source line generation completed in `work/second-pass-lines.log`. Final per-era area/size/ring gates and source plate regeneration are performed by root after integrating these masks; they are not pre-certified here.

## Final river and western-area diagnostic follow-up

After the first final export, the bank traces were extended using native source ink, without moving the source bank to modern GPS samples. G1 now follows both printed river banks to the upstream source frame at y60. G4 continues past printed North Bridge Road, from the former y579 closure to the clearly printed narrow river cross-section at y430. Source proof plates are `work/G1-river-extended-review.png` and `work/G4-river-extended-review.png`; source vertices remain in `river-bank-inputs.ts`. Re-run that helper and the shared local-land export when these masks change; no shared `lines.ts` rerun is needed for independently digitised bank masks.

The white G1 Battery headland remains outside the new river-water selection. Native source headland interior points `[575,490]`, `[585,498]`, `[565,485]`, `[596,500]` are all outside the bank polygon by a direct winding test. Source points `[610,495]` and `[630,500]` are over the adjoining labelled sea and are inside water. The printed word Battery extends outside the white headland: crossing letters is not proof of removing dry land.

The initial read-only river diagnostic `[103.84688,1.29063]` was incorrectly called near Read Bridge; it is about250m northeast of the documented bridge. Corrected reference is `[103.845028,1.28917]`, explicitly printed at [Read Bridge Wikipedia coordinates](https://en.wikipedia.org/wiki/Read_Bridge), whose linked identity is Wikidata **Q7300371**. [URA's primary conservation record](https://www.ura.gov.sg/conservation/find-a-building/conservation-portal/rb-00001/) confirms the bridge identity and1889 replacement of Merchant Bridge, without supplying those coordinate numbers. The corrected point is a current bridge reference, not an independently surveyed historical river bank. L2 already classifies that corrected point as water. The extended raw G4 source-water polygon contains it; root's final published/quantised L1 sample can still be LAND near the registered bank. That raw-vs-published disagreement and the modern Elgin point's LAND result remain accuracy limitations. Neither was fixed by moving historical source vertices to the sample.

A west-side overlay in `work/west-coast-final-diagnostic.png` compares G11 red, G16 blue and G15 black. Direct point-in-polygon tests confirm the G15 water/land side is correct: `[103.62,1.34]` is water and `[103.67,1.34]` is land after the splice. There is no complementary-selection error turning western sea into land. G15's inner mangrove/high-water edge can lie roughly0.5–1km inland from the G11 outer coastal/tidal-fringe convention; G9/G11 also lack qualified west/north control coverage. The large L4/L5 western area reduction therefore measures source convention/registration/coverage disagreement, not documented1961 historical land loss. No artificial union was introduced to make era areas increase. The G15 coastline/registration acceptance remains open, and eastern Jurong is still not complete.
