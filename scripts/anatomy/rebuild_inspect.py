import bpy,json,sys
from pathlib import Path
root=Path(__file__).resolve().parent
p=root/'cache/core-review.blend';bpy.ops.wm.open_mainfile(filepath=str(p))
out=[]
for o in bpy.data.objects:
 if o.type=='MESH':
  o.data.calc_loop_triangles();out.append(dict(name=o.name,n=len(o.data.loop_triangles),role=o.get('role'),matrix=[list(r) for r in o.matrix_world],props=dict(o.items()),attrs=[x.name for x in o.data.attributes]))
(root/'cache/rebuild-native-inventory.json').write_text(json.dumps(out,indent=2))
print([(x['name'],x['n']) for x in out])
