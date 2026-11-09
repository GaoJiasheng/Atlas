"""Feather x-ray mask boundaries on true skin vertices, 7mm geodesic band."""
import json,heapq
from pathlib import Path
import numpy as np
r=Path(__file__).resolve().parent/'cache'
for topic in['arms','back','chest','core','legs','shoulders']:
 d=json.loads((r/f'round2-project-{topic}.json').read_text());pos=np.array(d['skin']['positions']);file=r/f'round2-projected-{topic}.json';m=json.loads(file.read_text())
 for name,g in m.items():
  faces=np.array(g['skinFaces']).reshape(-1,3);edges={};adj={}
  for face in faces:
   for a,b in zip(face,np.roll(face,-1)):
    a,b=int(a),int(b);key=tuple(sorted([a,b]));edges[key]=edges.get(key,0)+1;length=float(np.linalg.norm(pos[a]-pos[b]));adj.setdefault(a,{})[b]=length;adj.setdefault(b,{})[a]=length
  dist={v:0. for edge,n in edges.items()if n==1 for v in edge};heap=[(0.,v)for v in dist];heapq.heapify(heap)
  while heap:
   x,a=heapq.heappop(heap)
   if x>dist.get(a,float('inf'))or x>.007:continue
   for b,length in adj[a].items():
    y=x+length
    if y<dist.get(b,float('inf')):dist[b]=y;heapq.heappush(heap,(y,b))
  alpha=np.zeros(len(pos),dtype=int)
  for v in adj:
   t=min(1,dist.get(v,.007)/.007);alpha[v]=round(255*t*t*(3-2*t))
  g['skinAlpha']=alpha.tolist()
 file.write_text(json.dumps(m,separators=(',',':')));print(topic)
