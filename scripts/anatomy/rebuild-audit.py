"""Independent decoded-bind-space sampled surface comparison, not a visual gate."""
import sys,json,numpy as np
from scipy.spatial import cKDTree
from pathlib import Path
r=Path(__file__).resolve().parent/'cache';t=sys.argv[1];d=json.loads((r/f'rebuild-{t}-audit-input.json').read_text());rng=np.random.default_rng(20261105)
def sample(x):
 p=np.asarray(x['points']);f=np.asarray(x['faces']).reshape(-1,3);tri=p[f];area=np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1);ix=rng.choice(len(tri),min(1600,len(tri)),p=area/area.sum());uv=rng.random((len(ix),2));uv[uv.sum(1)>1]=1-uv[uv.sum(1)>1];v=tri[ix,0]+uv[:,0,None]*(tri[ix,1]-tri[ix,0])+uv[:,1,None]*(tri[ix,2]-tri[ix,0]);return np.vstack([p[np.linspace(0,len(p)-1,min(1800,len(p))).astype(int)],v])
def pair_distance(P,T):
 a,b,c=T[:,0],T[:,1],T[:,2];ab=b-a;ac=c-a;ap=P-a;n=np.cross(ab,ac);n2=np.sum(n*n,axis=1);plane=P-n*np.sum(ap*n,axis=1)[:,None]/np.maximum(n2[:,None],1e-30);v0=ab;v1=ac;v2=plane-a;d00=np.sum(v0*v0,1);d01=np.sum(v0*v1,1);d11=np.sum(v1*v1,1);d20=np.sum(v2*v0,1);d21=np.sum(v2*v1,1);den=d00*d11-d01*d01;v=(d11*d20-d01*d21)/np.maximum(den,1e-30);w=(d00*d21-d01*d20)/np.maximum(den,1e-30);dist=np.where((v>=0)&(w>=0)&(v+w<=1),np.sum((P-plane)**2,1),np.inf)
 for A,B in[(a,b),(b,c),(c,a)]:
  ba=B-A;h=np.clip(np.sum((P-A)*ba,1)/np.maximum(np.sum(ba*ba,1),1e-30),0,1);edge=A+h[:,None]*ba;dist=np.minimum(dist,np.sum((P-edge)**2,1))
 return np.sqrt(dist)
def nearest(q,x):
 p=np.asarray(x['points']);f=np.asarray(x['faces']).reshape(-1,3);tri=p[f];centres=tri.mean(1);radii=np.linalg.norm(tri-centres[:,None,:],axis=2).max(1);rmax=radii.max();tree=cKDTree(centres);out=[]
 for chunk in np.array_split(q,max(1,int(np.ceil(len(q)/128)))):
  _,ix=tree.query(chunk,k=min(16,len(tri)));ix=np.asarray(ix).reshape(len(chunk),-1);P=np.repeat(chunk,ix.shape[1],axis=0);dist=pair_distance(P,tri[ix.ravel()]).reshape(len(chunk),-1).min(1)
  # Triangle bounding spheres supply a complete lower bound. Every omitted
  # triangle is provably farther away than the current best surface point.
  lists=tree.query_ball_point(chunk,rmax+dist);qi=np.repeat(np.arange(len(chunk)),[len(v)for v in lists]);ti=np.concatenate(lists).astype(int);possible=np.linalg.norm(chunk[qi]-centres[ti],axis=1)-radii[ti]<dist[qi]+1e-12;qi=qi[possible];ti=ti[possible]
  exact=pair_distance(chunk[qi],tri[ti]);np.minimum.at(dist,qi,exact);out.extend(dist)
 return np.asarray(out)
rows=[]
for name,a in d['source'].items():
 b=d['candidate'][name];forward=nearest(sample(a),b);reverse=nearest(sample(b),a);rows.append(dict(name=name,beforeTriangles=len(a['faces'])//3,afterTriangles=len(b['faces'])//3,sourceToCandidateMaxM=float(forward.max()),candidateToSourceMaxM=float(reverse.max()),sourceToCandidateP95M=float(np.quantile(forward,.95)),candidateToSourceP95M=float(np.quantile(reverse,.95)),samplesEach=3400))
(r/f'rebuild-{t}-surface-audit.json').write_text(json.dumps(dict(topic=t,method='Decoded GLB bind-space; up to 1800 evenly spaced vertices and 1600 deterministic area-weighted interior points each direction; exact closest point on source/candidate triangles, accelerated by a complete triangle bounding-sphere lower-bound search. Sampled error, not certified global Hausdorff.',meshes=rows),indent=2)+'\n')
print(t,'source meshes',len(rows),'sampled max mm',round(max(max(x['sourceToCandidateMaxM'],x['candidateToSourceMaxM']) for x in rows)*1000,3),flush=True)
