# Jurong source retrieval — 2026-11-09

ANU item 1885/146329, “Singapore … GSGS 4923 … 1958”, edition 1-GSGS, 1:63,360. The item-specific DSpace metadata explicitly gives `dc.rights: Copyright Expired`, `dc.date.issued: 1958`, and publisher D Survey War Office and Air Ministry. Evidence: `resume-source-anu.json`; original bundle and bitstream records alongside it. ANU’s institutional [map collection page](https://anulib.anu.edu.au/collections/map-collection) also describes its repository copies as out-of-copyright published maps.

- [Catalogue](https://openresearch-repository.anu.edu.au/items/23618e83-c884-4d56-a47e-b1e8909dc2a7)
- [Item metadata](https://openresearch-repository.anu.edu.au/server/api/core/items/23618e83-c884-4d56-a47e-b1e8909dc2a7)
- [Original JPG](https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/d16267c8-37de-41e6-8471-b7f708b600a6/content)
- JPG: 8350 × 6806 pixels, 11,068,520 bytes. Download via `resume-source-download.py` (range requests overcome stalled full transfer).

Temporal qualification: Goh Keng Swee’s Budget Statement, 9 March 1970, printed p.11 dates the first Jurong industrial-estate earth-moving to September 1961. [Primary statement](https://www.nas.gov.sg/archivesonline/data/pdfdoc/PressR19700309.pdf), local `raw/resume-source-press19700309.pdf`; visually checked `resume-source-press-title.png` and `resume-source-press-p11.png`. Its factual chronology supports using the 1958 preconstruction coast at the 1 January 1961 keyframe; this is a temporal inference, not a newly surveyed 1961 coastline. No NAS map scan contributes geometry.

NUS hosts a separately scanned/georeferenced copy of the 1958 edition but imposes commercial-reproduction restrictions. That copy and its geometry are not used. The ANU item supplies its own expired-copyright evidence; do not combine this trace with NC-SA content.

## Native-sheet evidence and completed retrieval

`raw/resume-source-anu1958.jpg` is complete and decoded. Its MD5, `753796180f2c7d659280ec601a5602bb`, exactly matches ANU’s bitstream checksum; `resume-source-anu1958-checksum.json` records verification.

Visually read marginalia: printed October 1958 by 570 Map Reproduction Troop RE Far East; imprint 25000/10/58. Johore Grid: Cassini projection, Everest spheroid; origin interpreted as 02°02′33.30″N / 103°33′45.93″E (minute glyphs partly faded; independently checked against the clearly printed G11 Johore Grid definition and the 1958 sheet’s own southwest graticule corner); false coordinates 450,000 yards east / 300,000 yards north. Native margin corner values: southwest 01°12′50″N / 103°37′47″E; southeast longitude 104°00′E. Inspect the original before treating a margin tick as a datum-corrected WGS84 control.

The water-feature legend labels the brown scalloped symbol **Coral**, brown dots **Mud**, and black dots **Sandbank**. Blue shore/channel outlines and the blue mangrove/tidal-swamp symbols must be distinguished from outer coral/tidal-fringe limits. The east-coast low-water mark is separately labelled on the sheet. Recommended consistent main-island coast convention: blue shoreline, retaining blue-hatched coastal swamp as land rather than tracing the outer coral reef symbol.

Offline source views: `resume-source-anu1958-overview.png`, `resume-source-anu1958-jurong.png`, `resume-source-anu1958-margin.png`, `resume-source-anu1958-legend.png`, `resume-source-anu1958-water-symbols.png`, `resume-source-anu1958-projection.png`. The Jurong crop is native rectangle [400,3400,3500,5100].


## Origin transcription correction — 2026-11-09

The initial memo’s `02°01′33.30″N /103°23′45.93″E` reading is withdrawn. The1958 red minute glyphs are partly faded, so they must not be described as unambiguously readable in isolation. The same Johore Grid is clearly defined on G11 as02°02′33.30″N /103°33′45.93″E. More decisively, the1958 sheet itself clearly prints its southwest corner as01°12′50″N /103°37′47″E: the16-point printed-grid model with the adopted02′/33′ origin reproduces that corner within36.02m, while the earlier01′/23′ interpretation misses it by18.64km. Changing latitude minutes alone misses it by1.82km; changing longitude minutes alone by18.55km. This is an internal comparison between independently printed source grid/corner values and uses no modern ground control or external translation. It resolves the grid definition; it does not certify WGS84 accuracy. Exact tests and native corner-pixel convention are retained in `resume-register-anu1958-origin-proof.json`; inspected previews are `work/resume-register-anu1958-corner-proof.png`, `work/resume-register-anu1958-origin-red-channel.png` and `work/resume-G11-origin-footer.png`.
