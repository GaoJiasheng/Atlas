import sys
import json
import numpy as np
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from assimp_inventory import ROOT,CACHE,FILES,read_glb,accessor,matrix,matches
manifest=json.loads((ROOT/'chest/manifest.json').read_text())
entries=json.loads((CACHE/'inventory.json').read_text())['objects']
records={}
for system,file in FILES.items():
 if system=='joints':continue
 doc,binary=read_glb(CACHE/file)
 transforms={}
 def visit(i,parent):
  transforms[i]=parent@matrix(doc['nodes'][i])
  for j in doc['nodes'][i].get('children',[]):visit(j,transforms[i])
 for i in doc['scenes'][0]['nodes']:visit(i,np.eye(4))
 for i,node in enumerate(doc['nodes']):
  if 'mesh' not in node:continue
  entry=next(e for e in entries if e['system']==system and e['name']==node['name'])
  if not any(matches(p,entry,None) for p in manifest['parts']):continue
  points,indices=[],[]
  for prim in doc['meshes'][node['mesh']]['primitives']:
   xyz=accessor(doc,binary,prim['attributes']['POSITION'])
   world=np.einsum('nj,ij->ni',np.column_stack((xyz,np.ones(len(xyz)))),transforms[i])[:,:3]
   world=world[:,[0,2,1]]*np.array([.01,-.01,.01])
   ids=accessor(doc,binary,prim['indices']).reshape((-1,3))
   if np.linalg.det(transforms[i][:3,:3])<0:ids=ids[:,::-1]
   ids=ids.reshape(-1)
   indices.extend((ids+len(points)).tolist());points.extend(world.tolist())
  records[(system,node['name'])]=(points,indices)
jobs=[]
for part in manifest['parts']:
 for side in ['l','r'] if part['sides']=='bilateral' else [None]:
  chosen=[e for e in entries if matches(part,e,side)]
  points,ids=[],[];skin_sides=[]
  for e in chosen:
   p,idx=records[(e['system'],e['name'])]
   ids.extend(i+len(points) for i in idx);points.extend(p)
   if part['role']=='skin':
    import re
    movable=bool(re.search(r'arm|elbow|wrist|hand|bicipital|cubital|carpal|palmar|palm|radial foveola|deltoid region|scapular region|pectoral|mammary region|presternal region|infraclavicular fossa|deltopectoral triangle|lateral region of thorax|triangle of auscultation|supraclavicular fossa',e['name'].lower()))
    skin_sides.extend([e['side'] if movable else None]*len(p))
  jobs.append({'name':part['id']+('.'+side if side else ''),'positions':[v for p in points for v in p],
               'indices':ids,'target':part['triangleBudget'],'error':manifest['budgets'][part['role']]['maxDeviationM'],
               **({'skinSides':skin_sides} if part['role']=='skin' else {})})
(CACHE/'chest-simplify-probe-input.json').write_text(json.dumps(jobs))
print('INPUT',sum(len(j['indices'])//3 for j in jobs),'triangles')
