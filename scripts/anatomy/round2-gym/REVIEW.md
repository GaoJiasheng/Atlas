# Rebuild 2026-11-05 — round two, inspected 2026-11-09

The executing Equipment component loads the actual compressed local meshes. The shared equipment library retains the original dimensional/contact factories and has **no build-time kit import**. The heavy kit is build-time only under this directory. Existing M8 bench/dumbbell/rack tests and the rack motion contract are unchanged and pass.

## New pulldown machine

A selectorized single-stack cable pulldown: sixteen separately bored weight plates, two guide rods, selector stem and projecting pin, grooved sheaves with guards/axles, top cantilever attached to the tower, connected cable route, bent bar with attachment eye, separate upholstered seat and two thigh rollers with mounting bracket. Floor height and the moving bar use the actual MotionDriver runtime placement. The cantilever/output wheel is fitted to the first-key palm anchor; the cable starts on the wheel tangent and ends on the bar eye. The output wheel is part of the frame, so it is not drawn again as an overlapping independent carriage. Seat thigh-pad fitting still reads the actual first-key knees.

References (development-only; no source photo is a runtime texture):

- [PulldownMachineExercise.JPG](https://commons.wikimedia.org/wiki/File:PulldownMachineExercise.JPG), CC BY-SA 3.0 / GFDL; two actual exercise frames and machine structure.
- [Lat Pull down Machine.jpg](https://commons.wikimedia.org/wiki/File:Lat_Pull_down_Machine.jpg), SAgbley, CC BY-SA 4.0; bent bar, rollers, seat and support relationship. Original photo EXIF must be honored when displaying.
- [Legend Fitness 905 manufacturer sheet](https://www.legendfitness.com/wp-content/uploads/905_LatPulldown.pdf), engineering corroboration only; not redistributed.

The first two Commons imageinfo metadata responses are saved beside the reference photographs. Existing two-to-four Commons references for barbell, dumbbell, bench, rack and tower remain in `scripts/geo/muscles-core/GYM-REBUILD.md` and `scripts/anatomy/rebuild-evidence/gym/reference-manifest.json`.

## Actual studio looks

`preview.ts` decodes the shipped compressed meshes and reuses the existing numerical GGX studio. `verifyRig()` checks the executing Lighting.tsx exposure/intensity bindings and R3F ACES/sRGB defaults; equipment uses the actual neutral token, roughness .68 and environment multiplier .5. CPU AA/shadow/microtexture differences remain; no GPU result or FPS is claimed.

1. Opened `look1/pulldown-three-quarter-comparison.png` and stack close-up. The first view exposed a 30 mm cantilever gap at the tower and a missing dynamic-cable segment in the assembled preview. Extended the boom into the rail mounting and added the exact runtime line segment/eye contact to the review assembly. Reoriented the tower so it stands in front of the seated user, matching the references, and added the thigh-pad mounting stem/arm and seat underplate contact.
2. Opened `look2/pulldown-three-quarter-comparison.png` and the updated front/profile/detail images. The boom is now continuous with its rail; the bar is connected by cable; both rollers sit on the captured bracket. Removed duplicate output sheave rendering in the runtime, and routed the free cable to the groove tangent/bar eye. Final four-angle construction sheets and a cinema finish are retained. The photos show a related machine, not a metrically identical commercial prototype: exact four-angle same-machine photo matching remains **B**, a concrete evidence limit. Form/attachments/counts are self-grade **A−**, pending separate GPU acceptance.

## Other runtime assets / grades

- Barbell **A− form**, retained two rimmed plates, two collar levers, sleeves, hubs and endcaps; 35,096 → 22,376 triangles by choosing the circular samples for visual size, not removing relief.
- Dumbbell **A− form**, retained contoured grip, inset heads/caps and machining relief; 22,784 → 14,240 triangles.
- Bench **A− form**, .3 m pad width, independent upholstered seat/back, connected prop/ladder/rails/shoes; 28,012 → 26,800 triangles per authored incline. Stored 0°, 30°, 45° and 84° assets cover all currently authored settings; no factory geometry is shipped in JS.
- Rack **A− form**, perforated uprights, supported lined J-cups, pin and feet; 21,780 → 19,268 triangles. Saved per-vertex height weights move hooks and stretch posts while leaving floor shoes fixed; decoded test confirms the liner top remains 14 mm under the shaft at three heights.
- Cable tower **A− form**, 64,252 → 58,444 fixed triangles; separate output carriage 5,240 → 4,088. The returned cable remains a modelled route, not a calibrated weight-stack physics simulation.
- Smooth linea alba **A− band**, 2,324 → 2,324 triangles, 10,608-byte meshopt GLB, replacing the inline runtime vertex array. Narrowed source sections to at most about 10 mm and flattened the relief; pubis-to-xiphoid extent retained. Material remains constructed in code; component remains lazy.

All equipment appearance uses a plain MeshStandardMaterial under the engine studio. It does not request the anatomy shader's `_emission`, atlasU, atlasSection or atlasFibre attributes, and does not bind UV textures to a mesh without UVs. The separate shared-body buffer-disposal cause and proposed fix are recorded in `round2-motion/body-attribute-lifetime.patch`.

## Counts and performance

The old kit GLB contained one review bench and 180k+ declared triangles, but runtime rebuilt those meshes in JS. The new common kit is **1,312,116 bytes** and stores four bench settings (only one displayed); pulldown is **515,228 bytes**, each below 1.5 MB. See `metrics.json` and `pulldown-metrics.json` for exact per-node counts/bounds. Pulldown frame/bar/seat/pads = **94,732 triangles, about four colour draws**, plus the thin animated cable; bench+bar+rack = **68,444 triangles, three colour draws**. Shadow and transparency passes are additional. These are architecture estimates, not measured GPU calls.

Generic-reference matching for retained gym heroes remains **B evidence** for the same concrete prototype/angle limitation documented in round one. No face, labels, teaching numbers or exercise ID changed.

Final carry-handle review: `support-final/chest-end-profile.png` exposed the old carry loop floating beyond the center rail. Added a crossmember at its mounting station and extended both tube ends to it. Exact final profile reopened; the handle is attached. Asset metrics above now include that repair. Small legacy prop builders and GLB decoding/fitting live behind `src/content/topics/muscles-core/runtime/GymAssets.tsx`; no scripts kit is imported by the engine.
