"""Rectus sheath wins over superficial oblique aponeurosis, on actual skin faces.
The native atlas includes that aponeurosis over rectus; Euclidean nearest wins
therefore cannot identify the underlying functional muscle without this rule.
"""
import json,heapq
import numpy as np
from pathlib import Path
r=Path('scripts/anatomy/cache');out=Path('scripts/anatomy/round3');stats=[]
for topic in ['core']:
 file=r/f'round2-projected-{topic}.json';m=json.loads(file.read_text());d=json.loads((r/f'round2-project-{topic}.json').read_text());p=np.array(d['skin']['positions']);f=np.array(d['skin']['faces']).reshape(-1,3);c=p[f].mean(1);n=np.array(d['skin']['normals'])[f].mean(1)
 if 'rectus-abdominis.l' not in m:continue
 # Curved semilunar boundary from actual native rectus, not a rectangular decal.
 ys=np.linspace(-.19,.215,42);profiles={}
 for side,sign in [('l',1),('r',-1)]:
  src=np.array(d['muscles'][f'rectus-abdominis.{side}']['positions']);width=[]
  for y in ys:
   band=src[np.abs(src[:,1]-y)<.012];width.append(float(np.percentile(np.abs(band[:,0]),98)) if len(band) else .018)
  profiles[side]=width
  b=np.interp(c[:,1],ys,width)
  selected=(c[:,1]>ys[0])&(c[:,1]<ys[-1])&(sign*c[:,0]>.0015)&(sign*c[:,0]<b)&(c[:,2]>.065)&(n[:,2]>.42)
  ids=np.where(selected)[0];region={tuple(sorted(face)) for face in f[ids]}
  old=len(m[f'rectus-abdominis.{side}']['skinFaces'])//3
  m[f'rectus-abdominis.{side}']['skinFaces']=f[ids].ravel().tolist()
  for name,g in m.items():
   if name==f'rectus-abdominis.{side}':continue
   ff=np.array(g['skinFaces']).reshape(-1,3);g['skinFaces']=[int(v) for face in ff if tuple(sorted(face)) not in region for v in face]
  stats.append(dict(topic=topic,side=side,before=old,after=len(ids),profileY=ys.tolist(),semilunarisX=width))
 # Fade the border on the same skin surface. Do not alpha-erase narrow complete regions.
 for name,g in m.items():
  faces=np.array(g['skinFaces']).reshape(-1,3);edges={};adj={}
  for face in faces:
   for a,b in zip(face,np.roll(face,-1)):
    a,b=int(a),int(b);key=tuple(sorted([a,b]));edges[key]=edges.get(key,0)+1;length=float(np.linalg.norm(p[a]-p[b]));adj.setdefault(a,{})[b]=length;adj.setdefault(b,{})[a]=length
  dist={v:0. for e,num in edges.items() if num==1 for v in e};q=[(0.,v)for v in dist];heapq.heapify(q)
  while q:
   x,a=heapq.heappop(q)
   if x>dist.get(a,1e9)or x>.007:continue
   for b,length in adj[a].items():
    y=x+length
    if y<dist.get(b,1e9):dist[b]=y;heapq.heappush(q,(y,b))
  alpha=np.zeros(len(p),dtype=int)
  for v in adj:
   t=min(1,dist.get(v,.007)/.007);alpha[v]=round(255*t*t*(3-2*t))
  g['skinAlpha']=alpha.tolist()
 file.write_text(json.dumps(m,separators=(',',':')))
(out/'rectus-ownership.json').write_text(json.dumps(stats,indent=2)+'\n');print([(s['topic'],s['side'],s['before'],s['after'])for s in stats])
