"""Recover each CLOSED native nail's mid-surface and signed shell thickness.
The original curved top and underside must not be collapsed onto one offset.
CC BY-SA4.0 source geometry; native Regions of human body100.fbx.
"""
from pathlib import Path
import json,numpy as np
r=Path(__file__).resolve().parent/'cache';s=json.loads((r/'rebuild-source.json').read_text());out={}
for name in ['Nail plate.l','Nail plate.r','Nail plate (foot).l','Nail plate (foot).r']:
    m=s['meshes'][name];p=np.asarray(m['positions']).reshape(-1,3);f=np.asarray(m['indices']).reshape(-1,3);parent=np.arange(len(p))
    def root(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    for tri in f:
        for k in tri[1:]:parent[root(int(k))]=root(int(tri[0]))
    labels=np.array([root(i) for i in range(len(p))]);mid=p.copy();signed=np.zeros(len(p));normals=np.zeros_like(p);lift=np.zeros(len(p));stats=[]
    for c in np.unique(labels):
        ids=np.flatnonzero(labels==c);faces=f[labels[f[:,0]]==c];centre=p[ids].mean(0);_,_,vh=np.linalg.svd(p[ids]-centre,full_matrices=False);n=vh[2];outward=np.array([0,1,0]) if 'foot' in name else np.array([0,0,-1]);n*=1 if np.dot(n,outward)>0 else -1
        u=vh[0];v=np.cross(n,u);v/=np.linalg.norm(v);uv=np.column_stack([np.sum(p*u,axis=1),np.sum(p*v,axis=1)]);depth=np.sum(p*n,axis=1);T=uv[faces];a,b,c2=T[:,0],T[:,1],T[:,2];den=(b[:,1]-c2[:,1])*(a[:,0]-c2[:,0])+(c2[:,0]-b[:,0])*(a[:,1]-c2[:,1]);good=np.abs(den)>1e-14;den=np.where(good,den,1)
        widths=[]
        for i in ids:
            q=uv[i];A=((b[:,1]-c2[:,1])*(q[0]-c2[:,0])+(c2[:,0]-b[:,0])*(q[1]-c2[:,1]))/den;B=((c2[:,1]-a[:,1])*(q[0]-c2[:,0])+(a[:,0]-c2[:,0])*(q[1]-c2[:,1]))/den;C=1-A-B;valid=good&(A>=-1e-6)&(B>=-1e-6)&(C>=-1e-6)
            hits=(A*depth[faces[:,0]]+B*depth[faces[:,1]]+C*depth[faces[:,2]])[valid]
            if len(hits):lo,hi=hits.min(),hits.max();signed[i]=depth[i]-(lo+hi)/2;widths.append(hi-lo)
            mid[i]=p[i]-n*signed[i];normals[i]=n
        half=float(np.max(np.abs(signed[ids])));lift[ids]=half+.00008
        edges={}
        for tri in faces:
            for a1,b1 in zip(tri,np.roll(tri,-1)):
                key=tuple(sorted((int(a1),int(b1))));edges[key]=edges.get(key,0)+1
        stats.append(dict(vertices=len(ids),faces=len(faces),nativeMaxShellThicknessM=max(widths),nativeMaxSignedHalfThicknessM=half,openEdges=sum(x==1 for x in edges.values()),normal=n.tolist()))
    out[name]=dict(midPositions=mid.tolist(),signedOffsets=signed.tolist(),normals=normals.tolist(),lifts=lift.tolist(),components=stats)
    print(name,stats,flush=True)
(r/'rebuild-nails-source.json').write_text(json.dumps(out,separators=(',',':')))
