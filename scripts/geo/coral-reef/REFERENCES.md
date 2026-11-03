# Coral-reef geometry reference record

Original procedural model; no external asset or photograph is embedded.

Read and visually inspected before modelling (2026-10-29):

- `art/planned/coral-reef/coral-reef-polyp.png` in the main checkout: original Atlas approved graphite study. One central mouth, twelve smooth unbranched tentacles, a soft oral disc and an external lower skeletal cup. Twelve is this schematic example, not a species claim.
- `art/planned/coral-reef/coral-reef-zones.png` in the main checkout: original Atlas approved graphite study. A continuous shallow flat, raised crest and descending slope, with low boulder, sheet and encrusting forms. This is a schematic habitat, not surveyed terrain.
- [NOAA Polyps up close](https://oceanservice.noaa.gov/education/tutorial_corals/media/supp_coral01a.html), S6: read the official anatomy text. Mouth is the single opening, tentacles surround it, the external calyx supports the polyp, and living coenosarc connects polyps. Figure credit NOAA; factual topology reference only, no image copied.
- [NOAA Flower Garden Banks Coral Basics](https://flowergarden.noaa.gov/education/coralbasics.html), S5: read the official anatomy text. Soft tubular body, tentacles in multiples of six, external calcium-carbonate skeleton, connecting tissue over shared skeleton. Fact reference only, no third-party photograph used.

All positions, dimensions, sample counts, specimen spacing and motion rates are original DESIGN values (S50). Cell dots are enlarged inside the tissue wall. Microanimal and larval silhouettes are deliberately generic; the fish is an unspecific parrotfish functional-group study. The three-metre stage and enlarged separate specimens cannot supply a biological scale or a reconstruction of a Singapore island.

`inspect-geometry.ts` projects the actual engine tessellation offline for two geometry review rounds. These are CPU geometry previews, not browser screenshots: GPU lighting, transparency, HUD, device performance and interaction gates remain pending in the main session.

Final spacing review: local study centres x=0 / 5 / 10 / 15. The earlier x=2.5 polyp entered the overview and its close-up included the reef edge; increasing the gaps removed all neighbour intrusion in six offline camera projections without hiding any target group. The 12-tentacle count, single mouth, contained partner markers and generic specimen identities were reviewed against the approved drawings. CPU previews are in ignored docs/screenshots/coral-reef/; the retained numerical record is authoring/geometry-review.json.

HUD framing lists every selectable part; the existing fitter excludes objects outside the authored view, keeping the active study inside the free band without forcing a remote platform into its frame. Its GPU/HUD result remains part of the main-session browser gate.

## Polish 2026-11-03

References read for this pass (geometry is independently generated, no image or external mesh shipped):

- [NOAA CDHC — Coral Skeleton](https://cdhc.noaa.gov/coral-biology/coral-skeleton/): calyx/theca, septa in cycles with unequal lengths and toothed edges; plocoid versus branching growth. The NOAA/Murphy McDonald corallite photograph was downloaded into ignored `refs/noaa-corallites.png` and visually inspected for raised walls, recessed centres and radial septa.
- [NOAA FGBNMS — Coral Basics](https://flowergarden.noaa.gov/education/coralbasics.html): translucent polyp tissue, a single central mouth, simple tentacles in multiples of six, connecting colony tissue and skeleton. The available upper portion of G.P. Schmahl's NOAA polyp photograph was inspected for slender tentacles with small swellings and individual variation. It is reference-only, not a texture.
- [NOAA-hosted coral monitoring booklet](https://repository.library.noaa.gov/view/noaa/10859/noaa_10859_DS1.pdf): square quadrats, commonly one-metre sides; dimensions vary by survey. The model is a nominal 1 m square PVC example with string subdivisions, not a surveyed instrument or a claim that all quadrats are 1 m.
- Approved Atlas polyp and reef-zone graphite drawings remain the educational topology reference. The polyp retains twelve simple tentacles, one mouth, and twenty-four schematic septa; these sample counts do not identify a species.

`sculpt.py` makes original smooth GLB meshes: a lumpy massive colony with recessed calices and fine septal relief, conforming tissue, a scalloped polyp wall/oral disc, a slit-mouth well, a thin fluted corallite with two septal cycles, foliose growth ridges, and fused branching fragments with axial/radial corallites. NumPy and scikit-image are build-time tools only. The output follows the engine's required flat model convention, `public/models/coral-reef.glb`; no engine path/schema changes or runtime requests were introduced.

## Polish 2026-11-03 — round 2

Re-read NOAA FGBNMS Coral Basics, NOAA Ocean Service Polyps up close, NOAA CDHC Coral Skeleton, and the existing NUS hard-coral gallery (S21). Re-inspected the local NOAA polyp photograph for rounded tips, surface swellings and translucent columns, and the NOAA corallite photograph for exposed radial septa and an irregular theca. These remain reference-only; no photograph, downloaded mesh or runtime network request was added.

The twelve tentacles and twenty-four septa are unchanged DESIGN sample counts. The new surface bumps represent enlarged nematocyst batteries without claiming an individual-cell count. The raised oral disc, oval throat, limestone relief/rubble/sand pockets, encrusting calices and overlapping foliose whorls are original procedural reconstructions, not species identifications or a surveyed reef profile. `light-marker` is an illustrative moving index pointer, not a field light sensor.

The oral disc is the attachment sheet of the opaque tentacle crown, while the separately selectable column stays translucent. Both share the original tissue-evidence visibility and the existing three-degree schematic crown sway; the mouth remains a separate selectable part. `author-views.ts` supplies per-beat cameras and local visibility. `inspect-geometry.ts` uses the actual shared HUD fitter with explicit CPU layout fixtures and checks all eight chapter bases and 39 beats in desktop, tablet and presentation layouts. `summarize-qa.ts` retains compact numerical evidence and contact sheets. None of these previews claims browser/GPU or DOM acceptance.
