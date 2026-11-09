"""Deep muscle x-ray footprints for labelled muscles previously erased by the
outer-surface projection filter. Actual native anatomical extent controls each
footprint; no primitive stand-ins or text/part changes.
"""
import json,re,heapq
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
import yaml
r=Path('scripts/anatomy/cache');stats=[]
for topic in ['core','chest','arms','legs','back','shoulders']:
 data=json.loads((r/f'round2-project-{topic}.json').read_text());p=np.array(data['skin']['positions']);f=np.array(data['skin']['faces']).reshape(-1,3);c=p[f].mean(1);n=np.array(data['skin']['normals'])[f].mean(1);file=r/f'round2-projected-{topic}.json';m=json.loads(file.read_text());parts=json.loads(Path(f'src/content/topics/muscles-{topic}/data/parts.json').read_text())['parts'];byid={p['id']:p for p in parts};required=set()
 for path in Path(f'src/content/topics/muscles-{topic}/chapters').glob('*.mdx'):
  fm=yaml.safe_load(path.read_text().split('---')[1]);
  for beat in fm.get('state',{}).get('beats',[]):
   if not beat.get('exercise'):continue
   for id in beat.get('labels',[]):
    part=byid.get(id,{})
    if part.get('muscle'):
     required.add(part['mesh'])
     if part.get('bilateral',{}).get('mesh'):required.add(part['bilateral']['mesh'])
 for name in sorted(required):
  g=m[name]
  if len(g['skinFaces'])>=12 and not name.startswith('gluteus-minimus'):continue
  src=np.array(data['muscles'][name]['positions']);lo=src.min(0);hi=src.max(0);side=1 if name.endswith('.l') else -1
  direction=np.array([side,0,0])if name.startswith('gluteus-minimus')else np.array([0,0,1])if name.startswith(('pectoralis-minor','subscapularis'))else np.array([0,0,-1])
  dist=cKDTree(src).query(c)[0];valid=(c[:,1]>lo[1]-.012)&(c[:,1]<hi[1]+.012)&(c[:,0]>lo[0]-.016)&(c[:,0]<hi[0]+.016)&(np.sum(n*direction,axis=1)>.2)
  if name.startswith('gluteus-minimus'):
   # Lateral iliac surface: never spread the deep hip footprint onto the pubis.
   valid=(c[:,1]>lo[1]-.008)&(c[:,1]<hi[1]+.008)&(c[:,2]>lo[2]-.018)&(c[:,2]<hi[2]+.012)&(n[:,0]*side>.65)&(c[:,0]*side>.13)
  ids=np.where(valid&(dist<.105))[0]
  if len(ids)<6:raise RuntimeError(f'No credible native footprint {topic}/{name}: {len(ids)}')
  # Footprint follows the deep muscle's extent, not the superficial nearest owner.
  g['skinFaces']=f[ids].ravel().tolist();g['deepProjection']=True;g['projectionDirection']=direction.tolist()
  alpha=np.zeros(len(p),dtype=int);verts=np.unique(f[ids]);alpha[verts]=210
  g['skinAlpha']=alpha.tolist();stats.append(dict(topic=topic,node=name,triangles=len(ids),direction=direction.tolist(),method='Native deep-muscle anatomical footprint projected to corresponding body surface; x-ray teaching region, not exposed skin anatomy.'))
 file.write_text(json.dumps(m,separators=(',',':')))
Path('scripts/anatomy/round3/deep-footprints.json').write_text(json.dumps(stats,indent=2)+'\n');print(stats)
