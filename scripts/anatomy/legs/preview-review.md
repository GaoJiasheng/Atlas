# Legs round 6 pose inspection

Re-rendered with native Blender Workbench from the decoded final published GLB and inspected at full resolution.

[legs-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png)

The thin transverse upper-thigh streak visible in round 5 is gone. Hamstring origins, calf-origin scraps and the knee-end iliotibial scraps show no isolated long spikes in the refreshed hip/knee/ankle pose.

Published weight audit: **clean**, **0 remaining**, **31 fixed** unique welded vertices. Per-mesh counts are in `report.md` and `cache/legs-weights-audit.json`.

- Published GLB SHA-256: `243af0ad87d01a461557f8a7143ccd7912714d41803108da8ae8e86d72633deb`
- Pose PNG SHA-256: `24ba4f8e48949c864f7a3f050740169f808981bb60ccd73a541c14812c6f8022`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Iliotibial tract is noncontractile connective tissue (`connectiveTissue: true` in manifest), despite the shared geometric fibre attributes. Calf-belly candidates can be separated from calcaneus by the unexported Achilles tendon; review tendon endpoints rather than treating absence of 2 mm belly contact as missing anatomy.
