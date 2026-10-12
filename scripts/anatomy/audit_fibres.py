"""Native named-surface check of _U endpoints decoded from the published GLB."""
import json
import sys
from pathlib import Path
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import ROOT,CACHE,import_system,object_info,matches,world_vertices,topic_argument
from rig_rules import FIBRE_OVERRIDES

topic=topic_argument()
manifest=json.loads((ROOT/topic/'manifest.json').read_text())
rig=json.loads((ROOT/topic/'rig.json').read_text())
decoded=json.loads((CACHE/f'{topic}-weights-decoded.json').read_text())
centre=Vector(rig.get('sourceCentre',rig['sourceChestCentre']))
references=manifest['parts']+manifest.get('referenceParts',[])
trees={}
for system in ('skeleton','muscles'):
    needed=[p for p in references if p.get('system')==system and
            (p.get('role')=='bone' or p['id'] in {'linea-alba','iliotibial-tract','tensor-fasciae-latae','gluteus-maximus','external-oblique'})]
    for ob in import_system(system):
        if ob.type!='MESH': continue
        info=object_info(ob,system)
        if 'attachment' in info: continue
        parts=[p for p in needed if matches(p,info)]
        if not parts: continue
        ob.data.calc_loop_triangles()
        tree=BVHTree.FromPolygons(world_vertices(ob),[tuple(t.vertices) for t in ob.data.loop_triangles],all_triangles=True)
        for part in parts:
            side=info['side'] if part.get('sides','bilateral')=='bilateral' else None
            trees.setdefault((part['id'],side),[]).append(tree)

def source(p): return Vector((p[0],-p[2],p[1]))+centre
def value(p,axis): return abs(p.x) if axis=='absX' else p['xyz'.index(axis)]
output={}
for row in decoded['rows']:
    name=row['name'];side=name[-1] if name.endswith(('.l','.r')) else None
    part=next(p for p in manifest['parts'] if name in (p['id'],p['id']+'.l',p['id']+'.r'))
    endpoints=[[source(p) for p in cloud] for cloud in row['endpoints']]
    flags=[];status='named surfaces: ambiguous/shared' ;scores=None
    if not all(endpoints): flags.append('_U lacks origin/insertion endpoint')
    else:
        bone_trees=[[tree for bone in part[kind] for tree in trees.get((bone,side),trees.get((bone,None),[]))]
                    for kind in ('origin','insertion')]
        if all(bone_trees):
            scores=[[sum(min(t.find_nearest(p)[3] for t in targets) for p in cloud)/len(cloud)
                     for targets in bone_trees] for cloud in endpoints]
            correct=scores[0][0]+scores[1][1];reverse=scores[0][1]+scores[1][0]
            if correct>reverse+.010:
                flags.append(f'reversed _U: surface cost {correct*1000:.1f} > reversed {reverse*1000:.1f} mm')
                status='reversed'
            elif reverse>correct+.010: status='origin → insertion'
        override=part.get('fibre', FIBRE_OVERRIDES.get(part['id']) if topic!='chest' else None)
        if override:
            for i,kind in enumerate(('origin','insertion')):
                rule=override[kind];gap=0
                for component in row.get('components',[row]):
                    lo,hi=[source(p) for p in component['bounds']]
                    bounds=[value(p,rule['axis']) for p in (lo,hi)]
                    extreme=(min if rule['end']=='min' else max)(bounds)
                    cloud=[source(p) for p in component['endpoints'][i]]
                    if not cloud:
                        flags.append(f'{kind}: disconnected component lacks _U={i} endpoint')
                        continue
                    gap=max(gap,max(abs(value(p,rule['axis'])-extreme) for p in cloud))
                if gap>override.get('bandM',.003)+.001:
                    flags.append(f'{kind} _U={i} stray seeds away from reviewed {rule["axis"]} {rule["end"]} end: {gap*1000:.1f} mm')
            status='persistent bounds endpoints' if not flags else status
    output[name]=dict(fibreStatus=status,fibreFlags=flags,fibreSurfaceDistancesM=scores)
(CACHE/f'{topic}-fibre-audit.json').write_text(json.dumps(output,indent=2)+'\n')
