"""Transfer only the original rig field/hand membership to exact native skin.
Native rest positions/faces are retained without decimation before voxelization.
"""
from pathlib import Path
import json,numpy as np
from scipy.spatial import cKDTree
r=Path(__file__).resolve().parent/'cache';baseline=r/'rebuild-skin-baseline-source.json'
if not baseline.exists():baseline.write_bytes((r/'rebuild-skin-source.json').read_bytes())
s=json.loads(baseline.read_text());d=json.loads((r/'rebuild-skin-native.json').read_text());p=np.asarray(s['positions']).reshape(-1,3);q=np.asarray(d['positions']).reshape(-1,3);w=np.asarray(s['weights']);o=np.asarray(s['owners']);dist,ix=cKDTree(p).query(q,k=8);coef=1/np.maximum(dist,.0001)**2;coef/=coef.sum(1,keepdims=True);weights=np.sum(w[ix]*coef[:,:,None],1)
owners=np.zeros(len(q),dtype=np.int8)
for owner in [1,2]:
 h=p[o==owner];mask=((q>=h.min(0)-.003)&(q<=h.max(0)+.003)).all(1);owners[mask]=owner
out=dict(positions=d['positions'],indices=d['indices'],weights=weights.tolist(),owners=owners.tolist(),jointNames=s['jointNames'],source='native Regions of human body100.fbx; all 242 manifest-selected surface panels before GLB decimation',sourceTriangles=len(d['indices'])//3,sources=d['sources'],license=d['license'])
(r/'rebuild-skin-source.json').write_text(json.dumps(out,separators=(',',':')));print('native skin source with original rig field',len(q),len(d['indices'])//3,flush=True)
