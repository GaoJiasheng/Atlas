# CPU diagnostic review · 2026-10-27

Reviewed the regenerated `cache/bones-joints/preview-{front,back,left,pose}.png`
side-by-side source and simplified images with the image-view tool. These are
deterministic CPU orthographic triangle projections, **not native Blender renders
or browser screenshots**.

The inspected copies are kept locally (not in git) in `scripts/anatomy/cache/bones-joints/previews/source-vs-reduced-{front,back,left,pose}.png`
beside this record (CC BY-SA 4.0). The large intermediate triangle arrays remain
in the ignored cache; the archived diagnostics are available without rerunning it.

- **Front:** adult skull, chest, pelvis and limb lengths have matching source and
  reduced silhouettes. The sternum remains centrally visible; ribs curve around
  an open thoracic volume. Radius/ulna and tibia/fibula remain separate, kneecaps
  remain anterior, and hand/foot digit chains are recognizable. Both parietals and
  fourth-rib cartilage were restored after the first numerical audit failed.
- **Back:** both scapular plates, posterior rib sweeps, vertebral chain, sacrum and
  pelvic outlines remain in the same proportions. The reduced scapular surfaces
  show mild polygon shading but no missing shoulder blade or severed rib.
- **Left:** cranial outline, cervical/thoracic/lumbar curvature, anterior sternum,
  depth of the chest, pelvic tilt and foot profile agree with source. The two
  sides overlap in this orthographic diagnostic, so this view cannot independently
  prove side separation or every individual rib count.
- **Elbow pose:** the reference left forearm and hand rotate together about the
  inherited elbow candidate while the upper arm remains in place. Source and
  simplified chains retain the same silhouette. This diagnostic is a rigid bone
  pose; it does not inspect actual decoded muscle deformation or prove a medical
  motion range.

The inventory/selection audit verifies First through Twelfth rib on **each** side,
with ten costal-cartilage source pieces per side and no invented cartilage for the
two floating ribs. Front-view overlap prevents counting all posterior rib arcs
unambiguously from this projection; the exact source-name audit supplies the count.

No native-render, attachment-face, motion-axis, browser material, label, cutaway,
mobile or paper/cinema acceptance is claimed by this review. Those items remain
REVIEW and are carried into the topic's handoff.
