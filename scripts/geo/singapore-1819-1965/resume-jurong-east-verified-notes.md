# Fix 2026-11-09 — Jurong native source tracing qualification

Source: G35, ANU Singapore October 1958 map, original `raw/resume-source-anu1958.jpg`. All coordinates below use the unresampled scan crop at original-image origin `[400,3400]`; add that origin before applying the registration model. Source/licence and registration evidence are maintained by the main topic task, separately from this tracing audit.

Certified outputs:

- `resume-jurong-east-verified-port.json`: mainland blue outer bank from `[1408,1042]` to `[1921,1087]`, 928 dense pixels / 220 vector vertices. Endpoint is Tg Balai's actual shore at jetty attachment. Thin offshore printed jetty is excluded. Brown scalloped coral and detached P. Damar Laut are excluded from mainland.
- `resume-jurong-east-verified-penjuru.json`: source blue outer bank from `[2112,1055]` to `[2411,1183]`, 428 dense pixels / 128 vector vertices. Native 10px-grid reading corrects prior offshore start and excludes place-name letters and grid-barrier artifacts. Source-bank continuation through the printed place label is recorded as an occlusion, not a new geographic claim.
- `resume-jurong-east-verified-full-water.json`: full qualified main-channel selection, 1 part, 1,147 vector vertices, 2 blue-bounded headwater land holes, 31,848 selected native pixels. Reproduced by `resume-jurong-east-verified-full.py`, after the trace and intermediate barrier-mask scripts. Corrects earlier 2 parts / 1,393 vertices / 7 holes / 27,409 pixels.

The previous lower barrier mask had mistaken brown coral and black lettering for bank barriers. Fresh native 5px and 10px source inspection established the actual lower left and right blue banks. The corrected lower river includes the coral areas as water and fills all three black `S. Jurong` letter holes. Only the source's real blue-enclosed headwater marsh/oxbow land holes remain. Source land components 14, 18, 23 and 25 are explicitly excluded before vectorisation; two form contour holes, and the remaining two join exterior land or lie outside the paired bank outline.

The western lower bank merges with the source's printed yellow road between approximately `[1923,1002]` and `[1918,1071]`. Its mapped seaward road-water interface and adjacent blue-bank ends establish the trace; the script records 83 native path pixels of overprint. This is an explicit source overprint, not an invented channel width. The mouth segment joining `[1921,1087]` and `[2112,1055]` is an offshore *water selection closure* only and must never be stroked as coastline.

The disconnected y390 strip `[2046,389]`–`[2143,392]` was a false cap on dry paper land. It has been removed because the source's real bank cross-section is only x2014–2031 there. It was not removed by an arbitrary minimum-area rule.

Offline inspection previews:

- `work/resume-jurong-east-verified-full-water.png`
- `work/resume-jurong-east-verified-lower-qualified.png`
- `work/resume-jurong-east-verified-port-only.png`
- `work/resume-jurong-east-verified-penjuru-source.png`
- Native evidence grids: `work/resume-jurong-east-verified-mouth-left5.png`, `...mouth-right10.png`, `...lower-fresh10.png`, `...head-components.png`.

Intermediate files `resume-jurong-east-verified.json` and `resume-jurong-east-verified-water.json` are **not publishable whole outlines**. They contain rejected hatch/coral/letter paths used only as controlled inputs for the qualified outputs; their metadata marks them INTERMEDIATE ONLY. Do not ingest them in geography output.

Not covered by these eastern outputs: independent Samulun and Damar Laut island outlines; main task owns these. Single-stroke upstream tributaries without two resolvable banks remain source strokes, without invented water width. No chapter, beat, historical text, teaching fact or shared engine file was changed by this subtask. Main task runs the application gates after integration.

## Samulun eastern cliff-bank independent check

`resume-jurong-east-verified-samulun-cliff.json` supplies a qualified **open** source-native eastshore replacement arc `[1418,1100]` to `[1420,1204]`, 120 dense source pixels. The printed map legend's black *Cliffs* symbol confirms the eastshore convention: a continuous seaward crest with short inland ticks. Its absence of a blue line is not evidence that the island ends at the inland buildings or the western pier. The new arc follows the cliff crest and transitions to visible blue southern shoreline at `[1444,1177]`. One faded six-pixel segment `[1431,1130]`–`[1432,1135]` stays within 3px of visible source ink; it is explicitly recorded. Exact source-pixel retraces into cliff ticks were erased, without smoothing the actual coast. This does not certify the root's rejected whole-island blue-path draft; the main task must join the independent northern/western/southern blue arc.

Native evidence and inspected overlay: `work/resume-jurong-east-verified-samulun-cliff5.png` and `work/resume-jurong-east-verified-samulun-cliff-overlay.png`. Source convention: lower-left *Cliffs* sample in `resume-source-anu1958-legend.png`.

## Jurong attached-letter correction and complete Pandan water

The printed `g` of *Jurong* was attached to the outer bank in the barrier-derived contour. Source-native 5px inspection established visible blue bank `[2069,830]`–`[2028,857]`; `resume-jurong-east-verified-full.py` now follows those source-blue ends, replacing both letter-bowl fingers. Final main-Jurong count is **1 part / 1,136 vertices / 2 true source head holes / 32,181 native water pixels**. Evidence: `work/resume-jurong-east-verified-glyph5.png` and inspected `...word-fixed.png`. This supersedes the earlier 1,147-vertex count.

`resume-jurong-east-verified-pandan-water.json` supplies **complete qualified Pandan two-bank water**, including the formerly missing narrow upper arm and the blue-bounded central dry island. Final count: **1 connected part / 485 vertices / 1 true island hole / 10,960 native water pixels**. Reproduce with `resume-jurong-east-verified-pandan.py`. It independently classifies native source blue, black and red-near-blue barriers for the five reviewed wide bright-water regions; narrow upper banks and labelled mouth are traced separately from fresh native 10px bank readings, refined at most 4px to visible blue ink, then routed within a 1px corridor. No root mask is used as input. Six faded/road-overprint spans are explicitly recorded (three narrow-arm road spans and three lower-mouth bank spans). The real northern tributary converges to a single source-blue stroke near `[2477,782]`; no unresolvable channel width is invented upstream. The labelled *Pandan* bank follows blue source ink and visible ends, without copying letter outlines.

The source print's red grid divides the wide channel into separate bright-water components. Crossings are repaired using the actual visible bank ends, including a fresh two-bank native-blue path across the x2315 grid at y855–885. The offshore mouth selector is `[2570,1024]`–`[2515,1052]`, not a bank. Existing offshore sea must remain outside this water-only closure. Replace earlier Pandan bank masks around the printed word rather than merely unioning false bays into this qualified water.

Inspected Pandan evidence/previews: `work/resume-jurong-east-verified-pandan-full.png`, `...pandan-upper.png`, `...pandan-word.png`; source native grids `...pandan-upper10.png`, `...pandan-road10.png`, `...pandan-gridjoin10.png`, `...pandan-mouth10.png`. The first coarse guide-only draft was rejected and is retained only in ignored `work/`; it was never certified or supplied for ingestion.


## Final inspection correction — 2026-11-09

The earlier “complete” main-Jurong wording was too strong. The 1,136-vertex input has three rings, one self-crossing/retraced ring. Export cleanup makes the delivered rings valid but collapses paired-bank source reaches into disconnected fragments. At crop-origin `[400,3400]`, five independently reread water witnesses include three failures: `[2013,260]`, `[2019,275]`, `[2081,275]` are land in L5 and every 1961–1965 control frame. Two other head witnesses remain water. See `polish-audit.json.sourceCompleteness` and the actual-delivery overlay `previews/G35-upper-channel-unqualified.png`. This is an unfinished trace, not merely an unresolved single-stroke width. A guide-based repair trial did not align with the native scan closely enough and was rejected; it did not change live geometry. Do not rerun the authoring helper and call its output certified.

The northern G15/G16 source intersection also fails a common-water splice search over a larger window extending south to 1.32°N. The old G15 coverage closure is not a source bank and must not be moved over unverified vegetation to make the route pass. `work/resume-rebuild-final.log` records the guarded failure before any live-asset write. The dated REBUILD record supersedes earlier completeness claims.
