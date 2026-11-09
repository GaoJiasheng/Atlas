# Rebuild 2026-11-05 — bench support / trajectory review, 2026-11-09

These are **candidate patch** studies. `bench-motions.patch` changes the shared exercise JSON and must be reviewed/applied by the main session; shared fitness files were not edited in this worktree. `verify.ts --actual` reads the executing shared data and fails on the unchanged old trajectory; default mode explicitly records CANDIDATE PATCH ONLY. The overlay/lifetime integration patches are separate.

## What changed

The previous solver assumed a −90° root while the support solver needed −93.3018°. Re-solved both native asymmetric arms in the actual scene frame after applying that support turn, with explicit right-hand angles. Both motions now use the solved hip/knee/ankle support values and bench offsets; start arms have the source rig's minimum approximately 1.65° elbow departure from straight, the bar is over the shoulder sagittal plane, and both bottom forearms are vertical. The standard grip is approximately 0.700 m and the close grip approximately 0.605 m. The two anatomical contact sites are 160.6 and 190.8 mm caudal to the shoulder midline, both on the lower sternum of this source body. No label, teaching number, exercise ID or text changed.

The gate applies each key's/motion's actual root and tests both arms, constant grip, all 101 interpolated stroke samples against the shoulder/neck plane, native posed-skin underside shaft contact, head/upper-back/butt support and both heel/ball floor contacts. The recorded results/hashes are in `candidate-metrics.json`. The very small upper-back pad penetration/gap is within the upholstered support thickness; after final 32k body decimation, head contact is within 0.07 mm, butt within 1.4 mm and the upper back overlaps the upholstered pad by at most 4.8 mm in this offline fixture. These are geometric relationship checks, not GPU acceptance.

## References

- https://commons.wikimedia.org/wiki/File:Bench_press_1.svg
- https://commons.wikimedia.org/wiki/File:Bench_press_2.svg
- https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_1.svg
- https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_2.svg

Everkinetic / Wikimedia Commons, CC BY-SA 3.0. Source drawings are development references only; no runtime image network requests.

## Two actual looks

1. Opened `comparison-sheets/support-look1/chest-start-comparison.png`, `chest-end-comparison.png`, `arms-end-comparison.png`, `arms-end-profile.png`, and `chest-sternum-contact.png`. Bar/start and bottom relationships were correct and both feet and the head/butt stayed supported. The CPU fixture omitted Hands.tsx's actual wrist cap/link, making a false wrist gap; the near plate also blocked the characteristic contact detail. Corrected the fixture to render those exact runtime cap/link geometries and transforms; changed the detail camera to look down the sternum with the plates out of the crop.
2. Opened `comparison-sheets/support-look2/chest-sternum-contact.png`, `arms-start-comparison.png`, and `chest-end-profile.png`. The corrected fixture shows continuous wrist connections; the shaft now visibly meets the sternum, with no plate over the chin and no head/neck crossing. Close-up body silhouette still shows some polygon stepping at this extreme scale; reported to the main session instead of concealing it. The comparison drawings are the same general oblique angle; profile is a construction check because an exact orthogonal reference was unavailable.

Trajectory/support candidate self-grade: **A−**; reference-angle evidence **B** for the exact orthogonal/detail photo limitation. Runtime remains pending patch application and GPU acceptance. The inherited bench carry loop looked detached in the profile study; the final gym rebuild adds its crossmember and extends the tube ends to it, confirmed in support-final/chest-end-profile.png. It is separate from the removed groin pad.
