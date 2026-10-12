"""Derive round 9 from the cached native review scene without re-baking muscles."""
import json
import sys
from pathlib import Path
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import ROOT,CACHE,topic_argument
from skin_parts import derive

topic=topic_argument()
# A separate whole-body native baseline makes this derivation repeatable.
baseline=CACHE/f'{topic}-round8-native.blend'
if not baseline.exists():
    import shutil
    shutil.copy2(CACHE/f'{topic}-review.blend',baseline)
bpy.ops.wm.open_mainfile(filepath=str(baseline))
derive(bpy.data.objects['skin-outline'],json.loads((ROOT/topic/'rig.json').read_text()),topic)
bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/f'{topic}-review.blend'))
for ob in list(bpy.data.objects):
    if ob.type not in ('MESH','ARMATURE') or (ob.type=='MESH' and ob.name.endswith('-before')):
        bpy.data.objects.remove(ob,do_unlink=True)
bpy.ops.object.select_all(action='DESELECT')
for ob in bpy.context.scene.objects:
    ob.hide_set(False); ob.hide_viewport=False; ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(CACHE/f'{topic}-raw.glb'),export_format='GLB',
 use_selection=True,export_yup=True,export_skins=True,export_attributes=True,export_extras=True,
 export_animations=False,export_apply=False,export_materials='EXPORT',export_texcoords=True,
 export_normals=True,export_cameras=False,export_lights=False)
