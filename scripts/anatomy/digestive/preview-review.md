# Digestive region preview review — round 10

Agent visual inspection of native Blender Workbench renders of the **decoded
published GLB**, SHA-256 `7f91334e469754b5b92fc2f2fa3a003bd22c220dd73d5e03a5309309569106d7`.
This records observed geometry; anatomical approval and content flow review remain open.

[Contact sheet](../cache/digestive-preview-contact.png).

| View | Observation |
|---|---|
| [Front](../cache/digestive-preview-front.png) | Liver occupies anatomical right (image left); J-shaped stomach is anatomical left. Colon frames the coiled small intestine. Teeth, paired salivary glands and pharynx are visible above the oesophagus. Liver naturally obscures gallbladder and pancreas in this assembled view. |
| [Back](../cache/digestive-preview-back.png) | Pancreas and C-shaped duodenum become visible behind the stomach and liver. Colon/jejunum remain separate surfaces. The sigmoid-labelled source extends to the pelvic outlet, but is not renamed as rectum or anus. |
| [Left](../cache/digestive-preview-left.png) | Oesophagus follows the torso depth; intestine is anterior to the descending/pelvic colon. The visible stomach window is already in the source. No flattening or mirroring was introduced. |
| [Exploded by role](../cache/digestive-preview-exploded-by-role.png) | Tube column, solid organs and system context separate into three groups. Skull/jaw, thorax, spine, pelvis and limb bones are retained; major muscle context is bilateral. Lungs/heart remain inside their natural overlapping system group and can be toggled by their individual node names. |
| [Tube only](../cache/digestive-preview-tube-only.png) | All nine source tube meshes retain their silhouettes. Stomach's large display opening remains open. Source segment gaps are visible; no replacement meshes conceal them. |
| [Centreline front](../cache/digestive-preview-centrelines.png) | Ink curves follow the actual coil layout. Stomach path now runs cardia to pylorus rather than to its display window. Rust markers flag the 13 source-overlap crossings at tight jejunal bends. Each tube is a separate path; unsupported anatomical bridges are absent. |
| [Centreline left](../cache/digestive-preview-centrelines-left.png) | Paths retain depth through the gut rather than lying on a flat frontal diagram. Partial colon wall windows expose some path sections. Markers agree with the front overlay and the source overlap proof. |
| [Skin overlay](../cache/digestive-preview-skin-overlay.png) | Same-camera 16% skin/skeleton context locates organs in the reference body. Frame is focused on head-to-pelvis digestive anatomy; the upper skull and lower limbs are intentionally outside this crop. |
| [Opaque skin](../cache/digestive-preview-skin.png) | Full static body, including intact hands and feet, stays in source scale. Source regional panels and seams remain visible; this is context rather than a remeshed watertight mannequin. |
| [Wire](../cache/digestive-preview-wire-rest.png) | Actual decoded triangle edges only, all mesh faces hidden. Both hands, fingers and both feet remain recognizable at 3,310 triangles. Native source regional seams remain. |

No pose preview: this is a static, unskinned region. No procedural tooth, stomach-wall
or villus specimens are generated here.

Mesh gates pass. **Flow review remains required:** source jejunal self-overlaps,
missing separately labelled ileum/caecum/rectum/anal canal, and nonzero endpoint
gaps (notably the 70.14 mm duodenum–jejunum gap) prevent claiming a seamless,
physically enclosed mouth-to-anus path. See [report.md](report.md) and
[centrelines.json](centrelines.json) for machine-readable stations and gaps.
