# 3D realism rebuild — 2026-11-02

Original anatomical teaching reconstructions; no specimen identities or bone
inventories are implied. All 33 selectable IDs, one context platform, labels,
chapter/beat references, evidence inventory (7/3/2), teaching text and numbers,
explode directions and simulation settings are preserved. No engine changes.

| Parts | Rebuild |
|---|---|
| `sk-skull`, `sk-jaw` | Deep, narrow, widening skull; curved nasal/cheek/temporal struts, fenestrated maxillae, open orbit/antorbital/temporal spaces, separate dentaries, mandibular openings and curved teeth. |
| `sk-neck`, `sk-trunk` | Separate articular centra, perforated neural arches and neural spines along a curved axis. Dorsal transverse processes. |
| `sk-ribs` | Twelve varied rib pairs rooted at the corresponding dorsal vertebrae; posterior ribs diminish; separate ventral gastralia. |
| `sk-pelvis` | Paired iliac blades with acetabula, pubes and pubic boot, ischia. |
| `sk-arm-l/r`, `sk-leg-l/r` | Separate shafts and articular ends; humerus/radius/ulna, femur/tibia/fibula, metapodials and phalanges. Two finger claws per hand; three support toes and a raised hallux per hindfoot. Fixes fleshy limbs under **Direct record**. |
| `sk-tail-base/tip` | Individual tapering caudal centra, neural spines and ventral chevrons, with visible joint gaps. |
| `prince/apollonia/twinky-study` | Generic diplodocid skeleton: small fenestrated skull, elongate cervicals with bifid processes, separate dorsals/sacrals/whip-tail caudals, attached ribs, scapulae/pelvis, jointed columnar limbs and digits. |
| `myna-body`, `myna-wing` | Continuous body/nape/cranium loft; separate bill/mandible, iris/pupil, short crest; overlapping primaries/secondaries/coverts on both sides, white wing bar, graduated white-tipped tail feathers. |
| `myna-leg` | Scaled tarsi, joints, curved claws, **three forward toes plus a backward hallux on each foot**. |
| `myna-feather` | Asymmetric vane, projecting calamus/rachis, swept surface barbs. |
| `bone-sample`, `buried-bone`, bone in `fossil-bed` | Asymmetric cortical fragment with curved tapered shaft, enlarged articular end and open broken end. |
| `leaf-slab` | Recessed leaf-shaped floor with midrib and branching secondary vein grooves, below the slab rim. |
| Remaining strata, pores/minerals, crystal, footprint, lid/platform | Existing geometry and teaching semantics retained; existing sweeps upgraded to 48 radial divisions. |

Reusable build-time kits: `scripts/geo/kits/dinosaur-skeleton.ts` and `bird.ts`.
All lathe/sweep surfaces start at 48 radial divisions. The bird exposes bill,
neck, leg, wing, tail and crest parameters for later heron/sunbird/hen work.
Repeated bones are merged by material within their selectable module. The
three museum nodes reuse one mesh. Their hundreds of kit primitives exceed
the schema's 33-per-part limit, so `bake-museum.ts` exports an original CC0
meshopt GLB (823,480 bytes), with 0.10% maximum simplifier error. No external
mesh or runtime network source is used; the offline decoder is already native
to Atlas. The existing model schema requires `/models/fossils-and-skeletons.glb`.
Licence/provenance and institutional references are in `data/SOURCES.md` and
`public/models/fossils-and-skeletons/LICENSE.md`.

| Complete tessellation | Before triangles | After triangles | Parts before → after |
|---|---:|---:|---:|
| Specimens | 3,268 | 8,226 | 4 → 4 |
| Burial | 8,274 | 14,322 | 6 → 6 |
| Age section | 4,548 | 8,420 | 4 → 4 |
| Theropod | 90,768 | 280,060 | 12 → 12 |
| Bird + feather | 89,624 | 128,916 | 4 → 4 |
| Three museum studies | 103,920 | 152,790 | 3 → 3 |
| Context platform | 588 | 588 | 1 → 1 |
| **All studies, including hidden** | **300,990** | **593,322** | **34 → 34** |

Counts from the actual engine tessellation and decoded GLB, via
`measure-model.ts`; no back-face culling. Static mesh pieces remain **41 → 41**
over the entire inventory. Largest individual study is 0.280M triangles
(only one study is on screen at a time), within the runbook's 0.3M target.

## Acceptance pass (Claude, 2026-11-02)

- Thin bones sweep at 24 radial divisions (widest radius < 0.045: ribs,
  gastralia) or 16 (< 0.03: teeth, claws, phalanges); thicker bones and all
  lathes keep 48. Theropod 440,252 → 280,060 triangles, museum 254,751 →
  152,790, GLB 1,047,560 → 823,480 bytes. No visible faceting at chapter cameras.
- The theropod and the three museum studies now stand on the platform
  (`lift` in `model-layout.json`) instead of floating 0.55 / 1.04 units above
  it; their preset and chapter cameras move by the same amount, so framing is
  unchanged.
- Myna thigh shortened and tucked into the belly, so it no longer reads as a
  dark stump in front of the leg.
- Browser renderer.info (headless Metal, loaded machine, 1520×1023 buffer):
  ch05 15 calls / 298,572 tris / 47 fps (was 440,844; now 280,652); ch06 12 / 129,508 / 50;
  ch07 6 / 171,868 / 59 (was 255,343; now ~153k). Main before: ch07 104,512 / 63 fps.

References inspected: AMNH's T. rex mount photograph; Hatcher's public-domain
1901 Diplodocus plate via Carnegie Birthplace Museum; Tschopp & Mateus (2017)
on diplodocid vertebrae; NParks myna identification; Abourachid et al. (2017)
on passerine foot orientation. No reference imagery is shipped. NParks and
Smithsonian image downloads returned 403; the AMNH/Hatcher images were viewed.

Two offline geometry rounds checked side/oblique silhouettes. The second
added maxillary bone mass, refined occipital/hip contacts, true bifid cervical
processes, and a narrower myna face. Viewed projections are under
`/private/tmp/fossils-model-qa/`: `r2-1-*`, `r2-2-*`, and final bird/skeleton
side/oblique/exploded views. AABB checks retain expected joint/cavity overlaps;
they are not triangle-intersection certification. Offline painter sorting can
misorder overlapping slab triangles; browser depth-buffer QA remains pending.

Verification: `pnpm check`, `pnpm validate`, `pnpm test` (239 files, 6,136 tests)
and `pnpm build` pass. New regressions check bone/digit topology, ribs attached
to distinct dorsal vertebrae, 48-segment surfaces, module limits and local GLB
decode/nodes/finite normals/size. `pnpm shoot fossils-and-skeletons --beats
--locale en --theme paper` cannot launch Chromium: macOS
`MachPortRendezvousServer` / `bootstrap_check_in: Permission denied (1100)`.
No browser screenshots were produced or viewed. GPU lighting, HUD clearance,
runtime cutaway/selection and paper/cinema browser acceptance remain for a
permitted headless environment. No browser/desktop control or git writes used.
- e2e `fossils-and-skeletons.spec.ts`: 9/9 with GPU. Under software GL on the
  loaded machine (load ~70), `direct … hides precisely five modules` misses its
  5 s poll: hiding modules stalls the page ~6 s here versus ~5.3 s on main (main
  passes just under the limit), so it is borderline on both; software-GL fps
  is the same as main (14 vs 13).
