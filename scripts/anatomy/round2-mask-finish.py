"""Resolve overlapping exact-skin highlights; remove isolated source-edge crumbs.
Topology stays on the body's original indexed surface. No independent shell.
"""
import os,json
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
r=Path(__file__).resolve().parent/'cache'
for topic in os.environ.get('MUSCLES_TOPICS','arms,back,chest,core,legs,shoulders').split(','):
 p=r/f'round2-projected-{topic}.json';backup=r/f'round2-projected-raw-{topic}.json'
 if not backup.exists():backup.write_bytes(p.read_bytes())
 masks=json.loads(backup.read_text());data=json.loads((r/f'round2-project-{topic}.json').read_text());pos=np.array(data['skin']['positions']);faces=np.array(data['skin']['faces']).reshape(-1,3);cent=pos[faces].mean(1)
 lookup={tuple(sorted(f)):i for i,f in enumerate(faces)};owner=np.full(len(faces),-1);best=np.full(len(faces),np.inf);names=list(masks)
 for k,name in enumerate(names):
  ix=np.array([lookup[tuple(sorted(f))] for f in np.array(masks[name]['skinFaces']).reshape(-1,3)],dtype=int)
  if not len(ix):continue
  dist=cKDTree(np.array(data['muscles'][name]['positions'])).query(cent[ix],workers=1)[0]
  take=dist<best[ix];owner[ix[take]]=k;best[ix[take]]=dist[take]
 # Face adjacency, preserving narrow true insertions but discarding tiny islands.
 edges={};adj=[[] for _ in faces]
 for i,face in enumerate(faces):
  for a,b in zip(face,np.roll(face,-1)):
   key=tuple(sorted([int(a),int(b)]))
   if key in edges:j=edges[key];adj[i].append(j);adj[j].append(i)
   else:edges[key]=i
 for k,name in enumerate(names):
  pending=set(np.where(owner==k)[0]);keep=[]
  while pending:
   seed=pending.pop();stack=[seed];comp=[seed]
   while stack:
    for j in adj[stack.pop()]:
     if j in pending:pending.remove(j);stack.append(j);comp.append(j)
   if len(comp)>=4:keep.extend(comp)
  # Empty or wholly occluded deep regions are explicitly marked hidden by
  # the asset finalizer; they must never fall back to a floating source sheet.
  masks[name]['skinFaces']=faces[keep].ravel().tolist()
  masks[name]['cleanup']='nearest native muscle owns each overlapping face; remove disconnected islands <4 triangles'
 p.write_text(json.dumps(masks,separators=(',',':')))
 print(topic,sum(len(x['skinFaces'])//3 for x in masks.values()))
