# Heart and lungs region — preview review

Agent inspection of native Blender Workbench renders of the **decoded published GLB**
(`cache/heart-lungs-audit.glb`, the same geometry as `public/models/heart-and-lungs.glb`).
This records observed geometry; anatomical approval and the content's visual rounds
(docs/40 §8.1 D2) remain open. Images are local (`scripts/anatomy/cache/`, not in git);
`python3 scripts/anatomy/run.py --topic heart-lungs` regenerates them, and
`contact.py --topic heart-lungs` the [contact sheet](../cache/heart-lungs-preview-contact.png).

| View | Observation |
|---|---|
| [Front](../cache/heart-lungs-preview-front.png) | Right lung (image left) shows three lobes with both fissures; left lung two lobes with the cardiac notch; the heart sits between them, apex to the body's left and down. Diaphragm dome under both lungs, the right dome higher (liver side). Larynx and ringed trachea above. Vessels reach both wrists and both ankles; the digestive context (stomach, coils, colon, liver) is below the diaphragm; leg muscles front of thigh and calf. No mirroring: the body's left is +X (image right). |
| [Back](../cache/heart-lungs-preview-back.png) | Descending aorta and oesophagus side by side between the lungs; the oblique fissure on the back of both lungs; the diaphragm's posterior slopes below them; the aorta dividing into the common iliacs behind the coils; both gastrocnemius heads on each calf. |
| [Skin overlay](../cache/heart-lungs-preview-skin-overlay.png) | With the 16 % skin, skeleton and ribcage ghost the organs sit where expected in the reference man: larynx at the neck, lungs filling the chest, vessels ending at the wrists and ankles (no hand or foot vessels, by design), leg muscles inside the thighs and calves. |
| [Left](../cache/heart-lungs-preview-left.png) | Depth order front to back: nose, then the pharynx behind it; lungs fill the chest depth; the windpipe is in front of the descending aorta; intestines in front of the abdominal vessels; vessels run behind the knee and down the calf. |
| [Exploded by role](../cache/heart-lungs-preview-exploded-by-role.png) | Lungs pulled apart (3 + 2 lobes), airway column with the full bronchial tree, heart with the great vessels and the whole body-vessel tree, digestive context to the side. Every node is a separate, intact surface. |
| [Airway only](../cache/heart-lungs-preview-airway-only.png), [left](../cache/heart-lungs-preview-airway-left.png) | Nasal cavity (open at the nostrils), nasopharynx, oropharynx, epiglottis, thyroid and cricoid cartilages, ringed trachea, then the bronchial tree: main, lobar and 20 segmental bronchi, finer branches modelled in the segmental meshes. The nasopharynx and oropharynx meshes are about 1 cm apart behind the soft palate (a source gap; the air route crosses it as a schematic leg). |
| [Vessels and blood routes](../cache/heart-lungs-preview-vessels-only.png) | Bright red (oxygen-rich) and dark red (oxygen-poor) route curves over the ghosted vessels: aorta to head, arms, gut and legs; veins back to the venae cavae; loops at the skull base, wrists, gut and ankles are the exchange arcs; the pulmonary arteries and veins reach every lobe, with a short arc in each. The routes follow the vessels; the schematic legs (in the heart, lungs and liver, the arcs) are the only parts not on a vessel centreline. |
| [Air routes](../cache/heart-lungs-preview-routes-air.png) | Air from each nostril through the throat, larynx and trachea, splitting at the carina into all 10 right and 9 left segmental bronchi; straight bridges over the four places where the source segmental bronchi stop 3–6 cm short of their lobar bronchus (right apical, left apicoposterior, the lingula pair, left superior segment), five paths in all. Oxygen and carbon-dioxide paths are the short dark-green strokes between an air end and the exchange arc in each lobe. |
| [Heart, cover camera](../cache/heart-lungs-preview-heart-cover.png), [front](../cache/heart-lungs-preview-heart-cover-front.png) | Heart alone, single-sided (back faces culled, as the engine draws it) against a bright background, from the proposed cover camera (chest close-up, 30° lens, about 1.1 m): **no background shows through the shell**. The only openings are the vessel ports at the top (superior and inferior vena cava stubs of the right atrium, the pulmonary-trunk ring of the right ventricle), which the great-vessel and lung-vessel nodes cover in the assembled model. The chamber borders read as fine seams, not gaps. |
| [Heart close-up](../cache/heart-lungs-preview-heart-close.png), [from behind](../cache/heart-lungs-preview-heart-close-back.png) | At the INSIDE preset's distance (about 0.5 m) the same holds front and back: closed chamber walls; the pulmonary-vein and vena-cava ports are the only openings. |
| [Cover framing](../cache/heart-lungs-preview-cover.png) | Assembled chest from the proposed cover camera: ribcage over the lungs, heart visible between the costal cartilages, larynx and windpipe above. The ribcage hides most of the heart, so the cover will want X-RAY or the ribcage ghosted (a content decision). |
| [Wire](../cache/heart-lungs-preview-wire-rest.png) | Actual decoded skin-wire edges (3,310 triangles), whole body with hands and feet. |

## Heart shell verdict

**Keep the merged Z-Anatomy chambers; the BodyParts3D 4.0 whole-heart fallback (D2) is
not needed.** The audit counts 804 open edges in 29 openings on the published heart
(882 in the source); the renders show these are the vessel ports, all covered by the
vessel nodes, and the coincident borders between the four chamber surfaces, which
render closed. See [report.md](report.md) (Heart shell) for the opening sizes.

No pose preview: this is a static, unskinned region.
