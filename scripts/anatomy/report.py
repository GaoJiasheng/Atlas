"""Compare original surfaces with the decoded final GLB and write a human gate."""
import json
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import CACHE, ROOT, clear_scene, save_json, topology, world_vertices, topic_argument

TOPIC_NAME = topic_argument()
TOPIC = ROOT/TOPIC_NAME
manifest = json.loads((TOPIC/'manifest.json').read_text())
stats = {r['name']:r for r in json.loads((CACHE/f'{TOPIC_NAME}-build-stats.json').read_text())}
summary = json.loads((CACHE/f'{TOPIC_NAME}-optimize-stats.json').read_text())
rig = json.loads((TOPIC/'rig.json').read_text())
sites = json.loads((TOPIC/'attachments.json').read_text())


def geometry(ob):
    evaluated = ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        return ([evaluated.matrix_world @ v.co for v in mesh.vertices],
                [tuple(t.vertices) for t in mesh.loop_triangles])
    finally:
        evaluated.to_mesh_clear()


def merge(a,b):
    points,faces=a
    points2,faces2=b
    return points+points2, faces+[tuple(i+len(points) for i in f) for f in faces2]


def samples(points,faces,seed=7):
    if not faces:
        return []
    randomizer=random.Random(seed)
    # Sample evenly spaced vertices and area-weighted points on triangle interiors.
    used=sorted({i for face in faces for i in face})
    result=[points[i] for i in used[::max(1,len(used)//3000)]]
    weights=[(points[b]-points[a]).cross(points[c]-points[a]).length for a,b,c in faces]
    if sum(weights)>0:
        for face in randomizer.choices(faces,weights=weights,k=6000):
            a,b,c=[points[i] for i in face]
            u,v=randomizer.random(),randomizer.random()
            if u+v>1:
                u,v=1-u,1-v
            result.append(a+(b-a)*u+(c-a)*v)
    return result


def directed(geometry_a,geometry_b):
    points,faces=geometry_b
    tree=BVHTree.FromPolygons(points,faces,all_triangles=True)
    return max(tree.find_nearest(p)[3] for p in samples(*geometry_a))


bpy.ops.wm.open_mainfile(filepath=str(CACHE/f'{TOPIC_NAME}-review.blend'))
original={ob.name.removesuffix('-before'):geometry(ob) for ob in bpy.data.objects
          if ob.type=='MESH' and ob.name.endswith('-before')}
if 'sternum' in original and 'ribs' in original:
    original['thorax']=merge(original.pop('sternum'),original.pop('ribs'))
# Each split surface is checked against the whole cached original skin. The
# union of all three split meshes separately verifies full source coverage.
from skin_manifest import SKIN_NODES
whole=original['skin-outline']
for name in SKIN_NODES: original[name]=whole
clear_scene()
bpy.ops.import_scene.gltf(filepath=str(CACHE/f'{TOPIC_NAME}-audit.glb'), disable_bone_shape=True)
rows=[]
failures=[]
skin_union=([],[])
for ob in sorted(bpy.context.scene.objects,key=lambda o:o.name):
    if ob.type!='MESH':
        continue
    name=ob.name
    if name not in original:
        raise RuntimeError(f'Unexpected final mesh {name}')
    final=geometry(ob)
    before=original[name]
    deviation=(directed(final,whole) if name in SKIN_NODES and name!='skin-wire'
               else max(directed(before,final),directed(final,before)))
    if name in SKIN_NODES and name!='skin-wire': skin_union=merge(skin_union,final)
    role=ob.get('role', 'bone' if name=='thorax' else stats.get(name,stats['skin-outline'])['role'])
    allowance=manifest['skinParts']['skin-wire']['maxSampledDeviationM'] if name=='skin-wire' else manifest['budgets'][role]['maxDeviationM']
    audit_mesh=bpy.data.meshes.new('rest-topology')
    audit_mesh.from_pydata(final[0],[],final[1])
    closed=topology(audit_mesh, weld_positions=True)
    bpy.data.meshes.remove(audit_mesh)
    before_stats=[stats['sternum'],stats['ribs']] if name=='thorax' else [stats.get(name,stats['skin-outline'])]
    before_closed=all(s['closedBefore']['closed'] for s in before_stats)
    row={'name':name,'role':role,'beforeTriangles':len(before[1]),'afterTriangles':len(final[1]),
         'sampledHausdorffM':deviation,'budgetM':allowance,'closedBefore':before_closed,
         'closedAfter':closed['closed'],'boundaryEdges':closed['boundaryEdges'],
         'nonmanifoldEdges':closed['nonmanifoldEdges']}
    rows.append(row)
    if deviation>allowance+1e-6:
        failures.append(f'{name}: sampled deviation {deviation*1000:.3f} mm > {allowance*1000:.3f} mm')
    if name not in SKIN_NODES and all(s['closedBefore']['boundaryEdges'] == 0 for s in before_stats) and closed['boundaryEdges'] > 0:
        failures.append(f'{name}: simplification/export introduced boundary edges')
    print(f'REPORT {name}: {deviation*1000:.3f} mm',flush=True)
if set(original)!=set(r['name'] for r in rows):
    raise RuntimeError('Final output lost a source mesh')
coverage=max(directed(whole,skin_union),directed(skin_union,whole))
if coverage>manifest['budgets']['skin']['maxDeviationM']+1e-6:
    failures.append(f'Split skin union deviation: {coverage*1000:.3f} mm')
print(f'SPLIT SKIN UNION: {coverage*1000:.3f} mm',flush=True)
save_json(CACHE/f'{TOPIC_NAME}-skin-coverage.json',dict(sampledUnionDeviationM=coverage,maxDeviationM=manifest['budgets']['skin']['maxDeviationM'],intentionalOpenWrists=True))
from regional import write_report
write_report(TOPIC_NAME, manifest, summary, rig, sites, rows, failures)
save_json(CACHE/f'{TOPIC_NAME}-report-stats.json',rows)
if failures:
    raise RuntimeError('; '.join(failures))
print(TOPIC/'report.md',flush=True)
