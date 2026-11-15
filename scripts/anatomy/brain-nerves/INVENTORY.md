# brain-nerves · source inventory and gates G1–G2 (2026-11-15)

## Downloads (docs/75 §5.1, approved 2026-11-15; all in the gitignored `scripts/anatomy/cache/`)

| file | URL | bytes | sha256 | licence | use |
|---|---|---:|---|---|---|
| `NervousSystem100.fbx` | https://raw.githubusercontent.com/LluisV/Z-Anatomy/PC-Version/Resources/Models/FBX/NervousSystem100.fbx | 53,887,724 | `3ea1aad64956cad27348a27b8fb50494b7cc307c6bc77bee0810ec2a67dff2b1` | Z-Anatomy CC BY-SA 4.0 + third-party models (`License.txt`) | source |
| `bp3d/partof_BP3D_4.0_obj_99.zip` | https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_BP3D_4.0_obj_99.zip | 64,888,505 | `9fbc713fffeee924a5a657d9813d84d7eb957bded63adb854931dd5e3eb61c97` | BodyParts3D 4.0, CC BY 4.0 | provenance comparison only |
| `bp3d/partof_parts_list_e.txt`, `partof_element_parts.txt`, `isa_parts_list_e.txt` | same `LATEST/` directory | 59,351 / 651,179 / 128,086 | `92240805…eebd` / `3f5f6df1…88ea` / `ab7796de…0513` | as above | FMA → element file map |
| `brainder/subcortical_obj.tar.bz2` | https://s3.us-east-2.amazonaws.com/brainder/software/brain4blender/smallfiles/subcortical_obj.tar.bz2 | 3,382,528 | `a489f40e11b1acfa4be8668d6cf4274c43934f5b4080ad8c2b2d80baf2aab2b2` | Brainder (Anderson Winkler), CC BY-SA 3.0 | cerebellum comparison only (approved by Gavin 2026-11-15) |
| `brainder/pial_Destrieux_obj.tar.bz2` | https://s3.us-east-2.amazonaws.com/brainder/software/brain4blender/smallfiles/pial_Destrieux_obj.tar.bz2 | 8,952,441 | `b8297630462646ca1553b7870ff516363b06d29af3ce3fe4eb1381073d86f55b` | Brainder (Anderson Winkler), CC BY-SA 3.0 | provenance comparison only |

Access date for all: 2026-11-15. `cache/FETCHED.txt` and `cache/SHA256SUMS.txt` carry the same records.

## G1 inventory (`inventory.py --system nervous`, then `dump_sources.py`)

845 objects, 712 meshes (2,408,240 source triangles); one flat collection, no custom properties, so the FBX itself says nothing about who made each object. Same body frame as the cached skeleton (brain inside the skull bones; spinal cord ends at z 1.055 m, between the L1 and L2 bodies).

Against docs/75 §3.4:

- No `whole_brain` object. The cortex is 63 Destrieux parcels per side (open surface patches, 1–4 k triangles each), grouped under Frontal / Parietal / Temporal / Occipital / Limbic lobe, Insula and Interlobar sulci. Every `.r` parcel has the same triangle count as its `.l` twin: the right hemisphere is a mirror of the left.
- Corpus callosum, fornix, commissures and every tract sit under `White matter of telencephalon` / `White matter of spinal cord` (University of Washington "White matter" family): excluded.
- Cerebellum: 31 lobule objects (vermis lobules, hemispheric lobules, flocculus, peduncles), mirrored pairs.
- Brainstem: `Midbrain.l/.r`, `Pons.l/.r`, `Medulla oblongata.l/.r`; `Base of peduncle.l/.r` extra.
- Spinal cord outline: `White matter of spinal cord` (one closed-ish tube); horns and tracts as separate inner objects.
- Spinal roots: one `Anterior root`, one `Posterior root` and one `Spinal ganglion` object per side, each covering all levels (not one object per segment).
- Brachial plexus: no lateral or medial cord objects (posterior cord only); the main arm nerves and their branches exist on both sides.
- Inner ear (Cochlea, Vestibule, Tympanic membrane, Auditory tube, an unsuffixed `Cochlear nerve`) on the right only: Dundee inner-ear family, excluded.

## G2 provenance (`provenance.py` → `provenance.json`, `provenance.md`)

| structure | result | evidence |
|---|---|---|
| Cerebral cortex | **Brainder, confirmed** | 12 of 12 large left parcels match their own Brainder `lh.pial` Destrieux parcel (mean 0.97–1.78 mm, p95 2.7–5.3 mm after similarity registration) and match the mirrored `rh` parcel of the same label clearly worse (mean 2.2–4.8 mm, p95 7–21 mm); label strings are FreeSurfer `aparc.a2009s` (`Lat_Fis-post`, `S_interm_prim-Jensen`); right = mirror of left |
| Pons, medulla | **BodyParts3D, confirmed** | similarity fit to BP3D 4.0 FMA67943 + FMA62004: mean 0.32 mm, p95 0.64 mm (scale 0.971) |
| Midbrain (`Midbrain.l/.r`) | **BodyParts3D, confirmed** | same transform, no refit: mean 0.28 mm, p95 0.87 mm |
| **Cerebellum** | **not attributable** | same transform: mean 2.79 mm, p95 8.12 mm against BP3D FMA67944; extents differ (BP3D ±52 mm wide, source ±49 mm; source 7 mm deeper front-to-back). Not Brainder (Brainder's cortex download has no cerebellum), not a listed third-party model; no source states who made it |
| **Spinal cord outline** | **not attributable** | BP3D 4.0 has only a 35 mm stub at the cervicomedullary junction (one-sided mean 10.3 mm to the source cord); the outline sits in the "White matter" group |
| Cranial nerves | Dundee CN (CC BY 4.0) / Z-Anatomy | both licences compatible with the CC BY-SA 4.0 GLB; credited |
| Other nerves, ventricles, dura | BP3D / Z-Anatomy (file default) | not geometry-checked (no reference in the approved downloads) |

**Gate result (first pass): STOP**, reported to Gavin. **Gavin's decision (2026-11-15): option 4, then 2.** The Brainder subcortical cerebellum was downloaded and compared with the same rigour as the cortex: placed with the left-cortex transform it is 5.3 mm (mean) / 14.9 mm (p95) from the source cerebellum, and refitted it matches no better than the mirrored right cerebellum (2.22 vs 2.19 mm). Not Brainder. So the GLB uses the **BodyParts3D 4.0 cerebellum** (FMA67944, CC BY 4.0), placed with the pons + medulla BodyParts3D transform, and the **spinal cord is procedural** (a sweep along the spinal dura's centreline in parts.json, `cord.json`). The unattributed Z-Anatomy cerebellum and cord outline are not used anywhere (`tests/space-scene/brain-and-nerves-topic.test.ts`).

Re-run:

```sh
blender -b --python-exit-code 1 -P scripts/anatomy/inventory.py -- --system nervous
blender -b --python-exit-code 1 -P scripts/anatomy/brain-nerves/dump_sources.py
python3 scripts/anatomy/brain-nerves/provenance.py
python3 -m unittest discover -s scripts/anatomy/brain-nerves -p 'test_*.py'
python3 scripts/anatomy/brain-nerves/manifest.py
python3 scripts/anatomy/brain-nerves/build.py         # lobes, BP3D cerebellum, forearm split, biceps fibre, G3 cerebrum scale -> cache/brain-nerves-raw.glb
pnpm exec node --import tsx scripts/anatomy/optimize.ts --topic brain-nerves
python3 scripts/anatomy/brain-nerves/fit.py           # G3 table -> fit.json
python3 scripts/anatomy/brain-nerves/routes.py        # flow routes -> routes.json, cord.json
blender -b --python-exit-code 1 -P scripts/anatomy/brain-nerves/preview.py   # G4 previews
python3 scripts/geo/brain-and-nerves/content.py       # parts.json
```
