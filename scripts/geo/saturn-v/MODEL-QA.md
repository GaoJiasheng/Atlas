# Saturn V geometry build record

Generator: `pnpm tsx scripts/geo/saturn-v/build-parts.ts`. Output: `src/content/topics/saturn-v/data/parts.json`. No engine or package changes. All coordinates are metres and belong to the S90 teaching design, constrained by S25/S26 NASA topology and nominal envelopes.

References inspected before geometry: `refs/stack.png`, `refs/stages.png`, `refs/lm.png`, `refs/lm-front.png`, `refs/csm.png` (NASA pages downloaded and recorded by the parent build). References are development-only and do not ship as textures.

## Geometry and topology

- 33 selectable part definitions, five physical groups plus one flow-only group. Every part has function-first bilingual summary, sourced bilingual detail, connections and exploded-view direction.
- Full launch stack: bottom engine lips y=0, escape-tower tip y=111. Lower body diameter 10.06 m, S-IVB body diameter 6.61 m; S-IVB interstage tapers between them. Fin envelope under 14 m.
- Main engines: F-1 centre 1 + outer radial repeat 4; S-II J-2 centre 1 + outer radial repeat 4; S-IVB one J-2. Bells have explicit inner/outer lathe profiles and open mouths. F-1 minimum mouth-to-mouth clearance 0.10 m at the 3.8 m illustrative mounting radius.
- S-IC fuel/oxygen domed heads do not overlap. S-II and S-IVB profiles each use one shared flat boundary owned by the fuel geometry, with oxygen stopping 0.04 m below it. There are no two intersecting vessel heads.
- Three CM couches. Five cabin window positions represent the general CSM arrangement; detailed hatch, thruster and support layouts remain simplified. The heat shield stays whole in cutaway. The CM nose cover belongs to the shell and is distinct from the probe.
- One LM only: octagonal descent body, central engine opening, angular ascent cabin, separate ascent/descent bells, four landing assemblies and pads, one front ladder, two triangular front windows, top docking ring. Deployed pad-centre radius 4.25 m plus 0.46 m pads gives 9.42 m total span, compared with the reference’s nominal 31 ft (about 9.45 m). Pad bottoms share y=85.6 before landed offset -85.6 makes them coplanar at y=0.
- The stowed gear is a **schematic compressed terminal envelope**, not independently solved hinge rotations: `lm-legs` scales X/Z by 0.5 about the rocket axis; the single ladder compresses Z by 0.3 about its front mounting line. All other LM geometry retains its scale. No intermediate hinge trajectory or flight dynamics is claimed. Shared-part poses cannot independently rotate the four radial instances without new engine work or extra part ids.

## Configuration contract

The sixth camera preset is `lander-view`, avoiding the globally unique physical group id `lander`; the six-camera limit is unchanged.

13 named absolute poses explicitly contain all 33 parts. All CSM parts share the same rigid matrix in every pose. CM probe contact point is `[0,104.8,0]`; LM port centre is `[0,92.5,0]` in the launch frame. A 180° X turn about `[0,99,0]` plus offset `[0,-0.7,0]` makes the two points coincide. Extracted and rendezvous matrices preserve the same interface. Ascent cabin/engine/windows/port move upward 8 m together; descent/legs/ladder stay behind. Probe is hidden homeward/return and escape tower from parking onward.

The existing choice widget supports at most 12 options. To retain all 13 configurations with no engine change, runtime `phase` uses the existing numeric step control 0–12 in this order: launch, first-off, parking, translunar, separated, turned, docked, extracted, lunar, ascent, rendezvous, homeward, return. `configuration-name` is a bilingual state output retaining the semantic names. The phase binding maps numeric values to the corresponding named absolute pose. The generator retains the reviewed original preparation table and adapts only this runtime representation.

Three existing multi-path flows each have five paths and are gated by RUN, first-stage selection and launch phase. They show fuel, oxygen and exhaust separately, using illustrative visual speeds rather than physical exhaust speed. Exploded mode’s existing FLOW suppression applies.

## Checks actually run

- Strict `partsFile.parse` before write and again after artifact readback: passed.
- Actual engine-generated mesh audit using `partPieces`: 41 merged material pieces, 157,908 triangles with all launch geometry present. These are offline geometry counts, **not browser draw-call or GPU measurements**.
- 175,140 rendered LM mesh vertices transformed into the launch pose and compared against the SLA inner taper: minimum radial clearance 0.2033 m, nearest part `lm-ascent`.
- Generator verifies exactly 33 parts, 13 poses, and positive ideal-table masses with initial mass greater than final mass. Parent-owned unit tests independently verify counts, interfaces, visibility, tables and camera projections.
- Inspected parent-generated offline triangle previews `offline-launch-hero.png` and `offline-lunar-lander-view.png`: full slender stack, recognisable two-level LM, four pads and one ladder. One window appears partly covered in the centroid-sorted SVG preview; independent actual mesh ray intersections from the lander camera hit the glass before the cabin on both sides (left 20.847 m vs cabin 20.914 m; right 19.913 m vs cabin 19.977 m), identifying that preview artifact without moving the glass. These are offline geometry inspections, not browser QA.
- Browser rendering, clipping appearance, material/shadow quality, runtime draw calls, label occlusion, keyboard/deep-link behavior and responsive layout are **unverified here**. The task BRIEF explicitly prohibits browser gates in this sandbox; parent/main session must run the requested shoot/e2e checks.
