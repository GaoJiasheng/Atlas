"""Build-time position-based paper compaction with structural/bending springs
and vertex/triangle self-contact. Deterministic; no runtime simulation.
Output is an open A4 sheet, not a displaced closed sphere.
"""
import numpy as np,json,sys,hashlib
from numba import njit
N,M=37,53
rng=np.random.default_rng(22045)
x=np.linspace(-.105,.105,N);y=np.linspace(-.1485,.1485,M)
p=np.array([[xx,yy,.00005*rng.normal()] for yy in y for xx in x],dtype=np.float64)
# Unequal rest triangulation avoids a regular visible fold lattice.
tri=[];edges={}
for j in range(M-1):
 for i in range(N-1):
  a=j*N+i;b=a+1;c=a+N;d=c+1
  tri.extend([[a,b,d],[a,d,c]] if rng.random()<.5 else [[a,b,c],[b,d,c]])
for t in tri:
 for a,b in zip(t,[t[1],t[2],t[0]]):edges[tuple(sorted((a,b)))]=1.
for j in range(M):
 for i in range(N):
  a=j*N+i
  for di,dj in [(2,0),(0,2),(2,2),(-2,2)]:
   if 0<=i+di<N and j+dj<M:edges[(a,(j+dj)*N+i+di)]=.006+float(rng.random())*.007
E=np.array(list(edges),np.int32);stiff=np.array(list(edges.values()));rest=np.linalg.norm(p[E[:,0]]-p[E[:,1]],axis=1);tri=np.array(tri,np.int32)
# Preformed broad bends break the exactly planar buckling degeneracy.
p[:,2]=.018*np.sin(p[:,0]*32+.3)*np.cos(p[:,1]*23)+.004*np.sin(p[:,1]*61+p[:,0]*44)
@njit(cache=True)
def relax(p,edges,rest,stiff,tri):
 vel=np.zeros_like(p)
 for frame in range(200):
  radius=.185-(.185-.0228)*min(1,frame/160.)**.73
  old=p.copy()
  for i in range(len(p)):
   for k in range(3):p[i,k]+=vel[i,k]*.5
  for iteration in range(12):
   # Alternating Gauss-Seidel sweeps retain sheet-edge lengths under pressure.
   for q in range(len(edges)):
    e=q if iteration%2==0 else len(edges)-1-q;a,b=edges[e];dx=p[b,0]-p[a,0];dy=p[b,1]-p[a,1];dz=p[b,2]-p[a,2];d=np.sqrt(dx*dx+dy*dy+dz*dz)
    if d>1e-12:
     f=(d-rest[e])/d*.5*stiff[e];p[a,0]+=dx*f;p[a,1]+=dy*f;p[a,2]+=dz*f;p[b,0]-=dx*f;p[b,1]-=dy*f;p[b,2]-=dz*f
   for i in range(len(p)):
    d=np.sqrt(np.sum(p[i]*p[i]))
    if d>radius:p[i]*=1-(1-radius/d)*.55
   # Continuous contact test against nearby triangles. Previous-side sign
   # prevents fast compression crossing a sheet between discrete frames.
   if iteration==10 and frame>15 and frame%3==0:
    thickness=.00020
    for t in range(len(tri)):
     ia,ib,ic=tri[t];a=p[ia];b=p[ib];c=p[ic];ab=b-a;ac=c-a;n=np.cross(ab,ac);nn=np.sqrt(np.sum(n*n))
     if nn<1e-12:continue
     n/=nn;d00=np.sum(ab*ab);d01=np.sum(ab*ac);d11=np.sum(ac*ac);den=d00*d11-d01*d01
     if den<1e-20:continue
     low=np.minimum(a,np.minimum(b,c))-.001;high=np.maximum(a,np.maximum(b,c))+.001
     for v in range(len(p)):
      if v==ia or v==ib or v==ic:continue
      if (p[v]<low).any() or (p[v]>high).any():continue
      diff=p[v]-a;dist=np.sum(diff*n)
      if abs(dist)>.0009:continue
      d20=np.sum(diff*ab);d21=np.sum(diff*ac);u=(d11*d20-d01*d21)/den;w=(d00*d21-d01*d20)/den
      if u<.015 or w<.015 or u+w>.985:continue
      prior=np.sum((old[v]-old[ia])*n);sign=1. if prior>=0 else -1.
      if dist*sign>=thickness:continue
      delta=(thickness-dist*sign)*.50*sign
      p[v]+=n*delta;p[ia]-=n*delta*(1-u-w)*.4;p[ib]-=n*delta*u*.4;p[ic]-=n*delta*w*.4
  centre=np.zeros(3)
  for i in range(len(p)):centre+=p[i]/len(p)
  p-=centre*.1
  vel=(p-old)*.35
  if frame%100==0:print('paper compaction',frame)
 return p
p=relax(p,E,rest,stiff,tri)
p-=p.mean(axis=0);p*=.0245/np.linalg.norm(p,axis=1).max()
json.dump(dict(positions=p.tolist(),triangles=tri.tolist(),method='A4 structural/bending springs + vertex/triangle contact; 200 steps, 12 constraint sweeps',seed=22045,sourceSHA256=hashlib.sha256(open(__file__,'rb').read()).hexdigest()),open(sys.argv[1],'w'))
