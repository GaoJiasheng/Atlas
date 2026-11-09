# Body geometry review — Rebuild 2026-11-05, resumed 2026-11-09

Scope: six published muscle GLBs, the continuous skin builder, six grip sculptures,
and the exact decoded asset regression test. This is CPU evidence; no Chromium,
user browser, desktop, engine file, or git mutation was used.

## Look 1: complete body and hand, inherited interrupted work

Looked at `cache/continuous-skin-body.png`, `cache/continuous-skin-hand.png`,
`comparisons/iteration3/arms-body-front-sheet.png`, and baseline/iteration1 hand
sheets. Body proportions and the five unequal source fingers were substantially
better than the original wire proxy, but the isolated hand contained a second
large wedge. Inspection of the saved skin-owner arrays showed hand.l included
x = 0.062 m (nearby thigh) although its real source starts at x = 0.224 m.
The last `rebuild-skin-finish.py` log had stopped before `done`; the compact mesh
and published GLB still held the older partition.

Changed: finished the saved preclip surface using the bounded hand-box wrist
plane split, compacted it, and rebuilt all six from their saved baseline assets.
The two hand owners now contain only the correct source hand region. Shared
wrist-cut vertices and their hand-joint weights are retained. Added an independent
regression on the exact GLTFLoader-skinned hand bounds; this catches the thigh
fragment even when a whole-body image makes it unobtrusive.

## Look 2: decoded final body/hand and anatomy

Looked at decoded `comparisons/final/arms-body-front-sheet.png`,
`arms-three-quarter-sheet.png`, and `hand-dorsal-sheet.png`. The wedge was gone;
all five fingers are separate, with unequal lengths and a separate thumb. The
hand close-up still showed lifted source nail borders at the fingertip silhouette.
An interim inference from native nail coordinates suggested changing the
hand comparison from180 to0. That inference was subsequently disproved by the
actual decoded visibility audit described below; it must not be used as direction evidence.

Changed: initially changed the comparison to0, then corrected it back to180
after the actual decoded visibility audit below. Replaced nearest-vertex tangent
projection of each source nail with closest-point projection onto actual adjacent
skin triangles; reduced relief from 0.8 mm to 0.3 mm. Plate silhouettes remain
source-derived; smooth skin normals place borders against the skin rather than
above a coarse vertex tangent. Regenerated all six GLBs and comparison sheets.

The legs asset initially exceeded the requested 1,500,000-byte cap (1,568,608
bytes). Reduced its muscle simplification target from 30% to 25%, retaining the
same Meshopt absolute error target of 0.85 mm. Other regions retain
their previous simplifier error targets. No part IDs, teaching numbers, labels,
chapter references, rig pivots, or origin/insertion data were changed here.

## Runtime hand boundary

`Mannequin.tsx` removes the source hands with `withoutHands`; `Hands.tsx` always
substitutes engine tube/rounded-box hands. Merely adding detailed hands to a GLB
cannot change the rendered training grip. `scripts/geo/muscles-core/hands-runtime.patch`
proposes consuming the shipped local 362,668-byte `muscles-arms-hands.glb` instead,
through GLTFLoader + MeshoptDecoder and `withBase`, keeping existing hand frames,
held-object grip origins, palm contact and wrist-link mechanics. It clones and
bakes the loaded node transform and selects/interpolates the four grip radii.
The patch is deliberately unapplied because the user forbids engine edits.

## Honest self-grades under docs/68

- Whole-body silhouette/proportions: **A** against the anterior OpenStax plate;
  the 1.71-m figure keeps the source human proportions, asymmetric soft contour,
  formed head/neck, hands and feet. This does not imply every facial close-up is A.
- Hand/foot close-up: **B**. Five distinct digits and raised true source nail plates
  are present; source skin does not contain the fine knuckle/crease detail needed
  to claim museum close-up A. Wrist seam is intentionally open when a hand is
  isolated, and matched to the body in the assembled figure. Foot toe relief is
  shallow after source-surface unification. These are concrete remaining limits.
- Source muscle/bone anatomy: **B** at the brief's stricter close-up bar. Named
  anatomy and attachments are preserved within source-preserving simplification,
  with tiny accidental boundary holes closed and duplicate/degenerate faces
  removed. Regional fascia/dissection cuts, exposed deep structures and uneven
  source boundaries remain in some angles; the source regional asset is not a
  complete superficial anatomical-body display. The existing docs/68 review
  graded these source meshes A, but the current brief demands more than that.
- Training grip appearance in the untouched engine: **C** until the proposed
  hands runtime patch is applied and GPU-accepted. SDF grip candidate sculptures
  are **B** pending photo-angle close-up and contact validation; fused geometry,
  five digits, MCP/PIP/DIP contours, a separate thumb and nail relief replace
  the primitive construction, but no GPU acceptance is asserted.

## Evidence limits

`comparisons/final/` contains exact decoded shipped geometry under the engine
studio rig + ACES, including emissive muscle contributions; the rig gate reads
the executing renderer/material sources. `final-pose/` uses the executing
axis conversion/right-side mirror convention with an asymmetric six-joint pose.
It checks finite geometry and deformation, not a full exercise contact solver.
The historical Gray reference plates have different dissection depths and often
different angles; captions state this. They are useful anatomical checks but
are not falsely described as exact matched photo acceptance. Front whole-body,
dorsal hand and lateral foot comparisons are the closest-angle evidence.

## Look 3: pose, native source and cavity leak (final 2026-11-09)

The deliberately asymmetric pose exposed a serious flaw that neutral full-body
screenshots hid: the body was only an 11.6-L thin shell. An eye/face opening in
the protected source head prevented global `binary_fill_holes` from filling the
thorax. Its internal panel membranes became visible at the hip and armpit when
posed. Increasing body closure to 25 mm was tried and rejected: it still left
an 11.46-L shell and risked joining adjacent limbs. Pure joint-field diffusion
was also tried at 45 and 180 iterations and rejected; it reduced some creases
but did not repair the missing solid volume.

Changed: fill each transverse tissue section before the global fill and erosion.
This prevents a facial opening draining the torso, while distinct limbs remain
separate section components. Read the actual native Regions FBX: the manifest
selects 242 real skin panels / 100,798 triangles, including 4,255 dorsal and
3,836 palmar digit triangles per hand. The interrupted rebuild had voxelized
already decimated published skin. The final builder instead uses all these
native panels and reduces the body closure to 3 mm (hands 2.2 mm) to retain
armpit/crotch concavities. Raw final solid volume is 74.9255 L; the published
open-wrist/nail diagnostic signed volume is 72.32–73.22 L, not a clinical volume.
Final continuous body is 30,000 triangles, each native hand 7,500 before nails.

The final rig field preserves measured source pivots and smooth source arm-branch
membership, with regular longitudinal shoulder/elbow/wrist/hip/knee/ankle blends;
hands are rigid at the hand joint, and exact wrist-cut ring weights stay locked.
Regional muscle weights and source part geometry are unchanged by this step.
Looked at `pose-native-final/arms-pose-35.png` and `arms-pose-90.png`, then the
actual-data `final-pose` sheets. Hip and foot membrane holes are gone. The
extreme 90-degree shoulder pose still compresses the axillary fold; therefore
pose quality remains **B**, with a concrete limitation: this 19-joint linear
blend rig has no pose-corrective axillary/groin shape. It is not labelled A or
GPU-accepted. Fine skin creases and final hand/foot close-up remain **B** under
the brief's museum bar; 2-mm implicit sampling retains overall native digit
shape, while sub-millimetre skin creases are not reconstructed.

The last decoded audit (`body-audit.json`) checks all six actual shipped GLBs:
soles sit 0.329 mm below the recorded source rig floor, with no hovering; wrist
ring nearest-vertex mismatch is at most 0.163 mm after separate mesh quantization.
The asset test now rejects the old thin-shell volume and any sole displacement
over 5 mm. `pose-metrics.json` records face-winding/smooth-normal disagreement
and edge stretch by surface, hand/foot/hip/trunk region, with the largest affected
locations. These measurements are diagnostics, not a clinical deformation grade.

### Actual renderer input correction

A second evidence bug was found: merely copying `MotionDriver`'s quaternion
operation was insufficient. Some source `rig.json` right elbow/knee/ankle axes
differ from the topic's actual `data.rig.joints`; chest exposes 17 joints rather
than all 19 source joints. Final `studio.ts` posing reads the executing topic
joint specs (node mapping, axis signs, supported joints), normalizes axes in the
parent rest frame, mirrors using the actual left joint axes, folds angles and
premultiplies the rest quaternion exactly as `MotionDriver` does. Final pose
manifests store the actual pose available in each topic. The parent added an
independent mutation regression proving that changing the runtime knee-axis
input changes the preview, so an exporter-side sentinel cannot satisfy it.

### Final decoded dorsal-hand correction

The provisional claim that native FBX surface normals verified dorsal angle0
was wrong and is withdrawn. Independent inspection of four views of the ACTUAL
shipped GLTFLoader-decoded hand shows the thenar mound/palmar crease at0 and the
flat dorsal/knuckle surface at180. The actual indexed geometry has one main skin
component and exactly five separate nail-plate components. A centroid ray test
against the decoded skin triangles, weighted by nail projected area, finds95.8%
of nail area visible from180 versus13.5% from0. These are the renderer's actual
rest-world coordinates, not native FBX labels/normals or a source token.
`hand-direction-audit.json` retains the component and visibility calculations.

The final `hand-dorsal.png` and paired sheet use actual camera180. The isolated
image is additionally rotated180 degrees IN THE IMAGE PLANE, so fingers point
up and the thumb lies on the same side as Gray424; no mirror or anatomy change
was applied. `renders.json` records both camera angle and image rotation. That evidence-only direction correction changed no published GLB or runtime engine file; the subsequent shell repair below deliberately updates the six GLBs, builder and regression. The original0/90/180/270 decoded views remain alongside the sheet as
`hand-actual-*.png`. The hand's close-up grade remainsB: visible nail relief and
fine skin crease detail do not reach the brief's A bar.

Reproduction (offline native cache required): baseline skin decode →
`rebuild-skin-native.mjs` with `ATLAS_ANATOMY_CACHE` →
`rebuild-skin-native-weights.py` → `rebuild-skin-voxel.py` (calls audited wrist
finish) → `rebuild-skin-compact.mjs` → `rebuild-skin-weights.py` →
`rebuild-nails-source.py` → `rebuild-all.mjs` → exact decoded `body-audit.ts`, `run.ts final`,
`pose.ts final-pose`, and `pose-metrics.ts`.


### Look 4: repair the actual nail shell, not its shading (2026-11-09)

The correctly oriented dorsal close-up exposed pale jagged slivers around the
nail edges. Exact decoded main-skin boundary edges all lie on the wrist cut;
there were no fingertip holes. The pale chips were rendered geometry, not the
background. The previous builder had projected both faces of each CLOSED
native nail plate onto one skin offset, collapsing its thickness and folding
some faces. One thumb component had negative signed volume, and the other
plates measured only approximately 0.7–2 cubic millimetres. Merely replacing
vertex normals would conceal the defect and was rejected.

Changed: `rebuild-nails-source.py` independently recovers each native plate's
mid-surface and signed half-thickness in a local PCA frame. The builder projects
the mid-surface onto the actual continuous skin, then restores the signed native
thickness along its interpolated skin normal. Native hand thickness is
0.432–0.551 mm. The builder sets the lowest plate sample 80 micrometres along the interpolated skin normal;
all source connectivity is retained until a 30-micrometre simplifier error
target. This target is not an independently measured global surface-distance bound. Nail projection is shared across the six regions. Positions, skin
weights, rig pivots, muscle geometry and exercise inputs are otherwise unchanged.

Looked at the decoded `nail-shell-review/hand-dorsal-sheet.png` against Gray424,
then the regenerated final hand and lateral foot sheets. Broad pale torn caps
are gone. Thin true plate rims remain: the source fingers have flexed distal
joints, so most nail faces are edge-on from this dorsal view. The 2-mm skin
reconstruction still softens fine creases. Hand/foot close-up remains **B**,
with this concrete limitation rather than an A claim. No cosmetic paint or
normal override conceals invalid surfaces.

Independent `nail-shell-audit.json` decodes every final compressed GLB: exactly
five disconnected plates per hand and ten toe plates on the body, all closed
two-manifold with opposite directed shared edges, positive centered volume,
and no tiny faces. Hand volumes are 24–62 cubic millimetres. A few edge faces
have vertex-average normals differing from their geometric normal; this
reported thin-rim smoothing diagnostic is not an open or reversed-topology
edge. `muscles-rebuild.test.ts` independently recovers the components and
requires five consistently wound closed positive-volume shells, so the old
collapsed-plate bug fails the regression.

All final asset hashes are recorded in `anatomy-retention.json` and each final
comparison directory's hash manifest. Exact retention audit confirms all 294
previously independently measured anatomy meshes have identical decoded
indices and zero bind-position delta. `body-metrics.json` records the final
sizes and triangles; every topic is below 1,500,000 bytes and 171,000 total GLB
triangles, including optional body/wire alternatives. No runtime engine file
was modified; grip-hand acceptance still requires the supplied engine patch
and GPU review.

## Additional final boundary check

`body-boundary-audit.json` independently reads each final compressed body through the preview decoder. All 495 open geometric edges lie in the two cut-wrist rings; no head or foot opening was found. Ten four-face positional coincidences remain after exact-position welding. This is a geometric-position diagnostic, not certification of indexed manifold topology; the silhouette grade is A while fine surface and pose quality remain B. Separate decoded hand audits put their open skin edges only at the wrists, while all nail shells are closed. No asset was altered by this check.
