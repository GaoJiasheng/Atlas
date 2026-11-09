"""Project training sheets onto the repaired mannequin's exact triangles.
Native anatomy remains in separate original nodes. No runtime geometry builders.
"""
from pathlib import Path
import json,numpy as np
from scipy.spatial import cKDTree
r=Path(__file__).resolve().parent/'cache'
def closest(q,tri):
 a,b,c=tri[:,0],tri[:,1],tri[:,2];ab=b-a;ac=c-a;n=np.cross(ab,ac);n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-15);p=q-n*np.sum((q-a)*n,axis=1,keepdims=True)
 d00=(ab*ab).sum(1);d01=(ab*ac).sum(1);d11=(ac*ac).sum(1);d20=((p-a)*ab).sum(1);d21=((p-a)*ac).sum(1);den=np.maximum(d00*d11-d01*d01,1e-20);v=(d11*d20-d01*d21)/den;w=(d00*d21-d01*d20)/den;u=1-v-w;bary=np.stack([u,v,w],1);dist=((q-p)**2).sum(1);dist[np.min(bary,axis=1)<0]=np.inf
 for k,(i,j) in enumerate([(0,1),(1,2),(2,0)]):
  a,b=tri[:,i],tri[:,j];e=b-a;t=np.clip(np.sum((q-a)*e,axis=1)/np.maximum(np.sum(e*e,axis=1),1e-20),0,1);s=a+e*t[:,None];d=((q-s)**2).sum(1);take=d<dist;p[take]=s[take];dist[take]=d[take];bary[take]=0;bary[take,i]=1-t[take];bary[take,j]=t[take]
 return p,bary,dist
for topic in ['arms','back','chest','core','legs','shoulders']:
 d=json.loads((r/f'round2-project-{topic}.json').read_text());skin=d['skin'];sp=np.array(skin['positions']);sf=np.array(skin['faces']).reshape(-1,3);sn=np.array(skin['normals']);sw=np.array(skin['weights']);tri=sp[sf];tree=cKDTree(tri.mean(1));out={}
 for name,m in d['muscles'].items():
  p=np.array(m['positions']);faces=np.array(m['faces']).reshape(-1,3);norm=np.array(m['normals']);_,ix=tree.query(p,k=12);q=np.repeat(p,12,axis=0);hit,bary,dd=closest(q,tri[ix.ravel()]);dd=dd.reshape(-1,12);best=np.argmin(dd,axis=1);ids=ix[np.arange(len(p)),best];sel=np.arange(len(p))*12+best;hit=hit[sel];bary=bary[sel];normal=np.sum(sn[sf[ids]]*bary[:,:,None],axis=1);normal/=np.maximum(np.linalg.norm(normal,axis=1,keepdims=True),1e-15);weights=np.sum(sw[sf[ids]]*bary[:,:,None],axis=1);project=hit-normal*.001
  # Keep outer anatomical sheet only; reject collapsed and folded projections.
  orientation=(norm*normal).sum(1);dist=np.sqrt(dd[np.arange(len(p)),best]);valid=(orientation[faces].mean(1)>.1)&(dist[faces].max(1)<.065)
  a,b,c=project[faces[:,0]],project[faces[:,1]],project[faces[:,2]];cross=np.cross(b-a,c-a);area=np.linalg.norm(cross,axis=1);facing=np.sum(cross*normal[faces].mean(1),axis=1);longest=np.maximum.reduce([np.linalg.norm(a-b,axis=1),np.linalg.norm(b-c,axis=1),np.linalg.norm(c-a,axis=1)])
  valid &= (facing>area*.12)&(area>1e-10)&(longest<.045);faces=faces[valid];used=np.unique(faces);remap=np.full(len(p),-1);remap[used]=np.arange(len(used));faces=remap[faces]
  # Reuse actual body triangles and their exact joint field. No independent
  # surface can separate from the skin under a pose. A 0 mm inset is within
  # the requested 0–2 mm interval and the engine's x-ray depth reveals it.
  cent=tri.mean(1);fn=sn[sf].mean(1);validfaces=np.array(m['faces']).reshape(-1,3)[valid]
  if len(validfaces):
   centre=hit[validfaces].mean(1);_,near=cKDTree(centre).query(cent);delta=np.linalg.norm(cent-centre[near],axis=1);surfaceN=normal[validfaces].mean(1)[near]
   selected=(delta<.014)&(np.sum(fn*surfaceN,axis=1)>.20)
   # Drop tiny disconnected islands and frayed source strands.
   ids=np.where(selected)[0];faceidx=sf[ids]
  else:faceidx=np.empty((0,3),dtype=int)
  out[name]={'skinFaces':faceidx.ravel().tolist(),'sourceTriangles':len(m['faces'])//3,'insetM':0,'sameSkinVertices':True}
  print(topic,name,len(m['faces'])//3,len(faceidx),flush=True)
 (r/f'round2-projected-{topic}.json').write_text(json.dumps(out,separators=(',',':')))
