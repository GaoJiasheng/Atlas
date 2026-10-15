"""Topology-aware surface-geodesic ring centroids, without spatial coil shortcuts.

Works in source metre coordinates. Open ends are detected after seam welding;
closed tubes use cap bands. No anatomy is inferred from object-name order alone.
"""
import heapq
from collections import deque
import numpy as np


def graph_geometry(points, faces):
    points=np.asarray(points,dtype=float)
    _,first,inverse=np.unique(np.round(points,7),axis=0,return_index=True,return_inverse=True)
    p=points[first]; f=inverse[np.asarray(faces,dtype=int)]
    adj=[{} for _ in p]; counts={}
    for face in f:
        for a,b in zip(face,np.roll(face,-1)):
            a,b=int(a),int(b)
            if a==b: continue
            key=tuple(sorted((a,b)));counts[key]=counts.get(key,0)+1
            d=float(np.linalg.norm(p[a]-p[b]));adj[a][b]=d;adj[b][a]=d
    boundary={}
    for (a,b),n in counts.items():
        if n==1: boundary.setdefault(a,set()).add(b);boundary.setdefault(b,set()).add(a)
    loops=[];seen=set()
    for a in boundary:
        if a in seen: continue
        todo=[a];seen.add(a);loop=[]
        while todo:
            i=todo.pop();loop.append(i)
            for j in boundary[i]-seen: seen.add(j);todo.append(j)
        loops.append(loop)
    return p,f,adj,sorted(loops,key=len,reverse=True),inverse


def distances(adj,seeds):
    d=np.full(len(adj),np.inf);queue=[]
    for i in seeds: d[i]=0;heapq.heappush(queue,(0.,int(i)))
    while queue:
        value,i=heapq.heappop(queue)
        if value>d[i]+1e-12: continue
        for j,w in adj[i].items():
            v=value+w
            if v<d[j]:d[j]=v;heapq.heappush(queue,(v,j))
    return d


def resample(path, step=.008):
    path=np.asarray(path);lengths=np.linalg.norm(np.diff(path,axis=0),axis=1)
    keep=np.r_[True,lengths>1e-8];path=path[keep]
    if len(path)<2: raise RuntimeError('Degenerate centreline')
    station=np.r_[0,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))]
    at=np.linspace(0,station[-1],max(2,int(np.ceil(station[-1]/step))+1))
    return np.stack([np.interp(at,station,path[:,a]) for a in range(3)],axis=1)


def extract(points,faces,upstream=None,downstream=None):
    p,f,adj,loops,inverse=graph_geometry(points,faces)
    # Most distant boundary rings, so a torn seam doesn't masquerade as a tube end.
    # A tube end is a ring of real width: a pinhole (the duodenal papilla's
    # 0.5 mm opening) is not one.
    rings=[loop for loop in loops if len(loop)>=5 and np.linalg.norm(p[loop]-p[loop].mean(0),axis=1).mean()>=.002]
    if len(rings)==1:
        # One open end, the other capped (the duodenum ends closed at the
        # jejunum): the far end is the vertex geodesically furthest from the ring.
        da=distances(adj,rings[0]);far=int(np.argmax(np.where(np.isfinite(da),da,-1)))
        near_far=[i for i in range(len(p)) if np.linalg.norm(p[i]-p[far])<.004]
        rings=[rings[0],near_far]
    if len(rings)>=2:
        def near(ring,cloud):
            cloud=np.asarray(cloud).reshape(-1,3)
            return float(np.min(np.linalg.norm(p[ring].mean(0)-cloud,axis=1)))
        if upstream is not None and downstream is not None:
            a,b=min(((a,b) for a in rings for b in rings if a is not b),key=lambda ab:near(ab[0],upstream)+near(ab[1],downstream))
        else:
            a,b=max(((a,b) for i,a in enumerate(rings) for b in rings[i+1:]),key=lambda ab:np.linalg.norm(p[ab[0]].mean(0)-p[ab[1]].mean(0)))
        method='surface-geodesic ring centroids (anatomical neighbour end rings)'
    else:
        # Capped/double-wall source tubes have no topological boundary. Slice
        # their principal axis and use length-weighted section centroids. The
        # coiled open jejunum never takes this branch.
        _,_,axes=np.linalg.svd(p-p.mean(0),full_matrices=False)
        axis=axes[0];station=(p-p.mean(0))@axis;tri=p[f];td=(tri-p.mean(0))@axis
        lo,hi=float(station.min()),float(station.max())
        path=[]
        for level in np.linspace(lo+.0005,hi-.0005,max(8,int((hi-lo)/.002))):
            ds=td-level;mask=(ds.min(1)<0)&(ds.max(1)>0);tt=tri[mask];dd=ds[mask]
            sections=[[] for _ in tt]
            for aa,bb in [(0,1),(1,2),(2,0)]:
                ix=np.flatnonzero(dd[:,aa]*dd[:,bb]<0);t=dd[ix,aa]/(dd[ix,aa]-dd[ix,bb])
                q=tt[ix,aa]+t[:,None]*(tt[ix,bb]-tt[ix,aa])
                for i,v in zip(ix,q):sections[int(i)].append(v)
            sections=np.asarray([s for s in sections if len(s)==2])
            if not len(sections):continue
            weights=np.linalg.norm(sections[:,1]-sections[:,0],axis=1)
            path.append(np.average(sections.mean(1),axis=0,weights=weights))
        path=np.asarray(path)
        trim=max(2,int(len(path)*.03))
        path=path[trim:-trim]
        if upstream is not None:
            cloud=np.asarray(upstream).reshape(-1,3)
            if np.linalg.norm(path[-1]-cloud,axis=1).min()<np.linalg.norm(path[0]-cloud,axis=1).min():path=path[::-1]
        for _ in range(2):path[1:-1]=(path[:-2]+2*path[1:-1]+path[2:])/4
        path=resample(path)
        return path,dict(method='principal-axis triangle-section perimeter centroids',boundaryRings=len(loops),connectedFraction=1.,schematic=False)
    ca=p[a].mean(0);cb=p[b].mean(0)
    if upstream is not None:
        up=np.asarray(upstream).reshape(-1,3)
        if np.linalg.norm(cb-up,axis=1).min()<np.linalg.norm(ca-up,axis=1).min():a,b=b,a;ca,cb=cb,ca
    elif downstream is not None:
        down=np.asarray(downstream).reshape(-1,3)
        if np.linalg.norm(ca-down,axis=1).min()<np.linalg.norm(cb-down,axis=1).min():a,b=b,a;ca,cb=cb,ca
    # The jejunal source is a regular 12-sided quad tube triangulated by FBX.
    # Integer graph rings recover its exact original sections, avoiding the
    # inner-bend bias of metric geodesics on a tightly curved surface.
    if len(a)==len(b)==12:
        hops=np.full(len(p),-1,dtype=int);queue=deque(a)
        for i in a:hops[i]=0
        while queue:
            i=queue.popleft()
            for j in adj[i]:
                if hops[j]<0:hops[j]=hops[i]+1;queue.append(j)
        sizes=np.bincount(hops[hops>=0])
        if np.all(sizes==12):
            path=np.asarray([p[hops==i].mean(0) for i in range(len(sizes))])
            station=np.r_[0,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))];station/=station[-1]
            vertex_u=station[hops][inverse]
            path=resample(path,.002)
            return path,dict(_vertexU=vertex_u,uMethod='source-topology-station',method='topological medial axis: exact 12-vertex source section rings',boundaryRings=len(loops),boundaryRingVertices=[len(v) for v in loops],sourceSectionCount=len(sizes),connectedFraction=1.,schematic=False)
    da=distances(adj,a);db=distances(adj,b);valid=np.isfinite(da)&np.isfinite(db)
    if valid.sum()<.98*len(p):
        return None,dict(method=method,boundaryRings=len(loops),connectedFraction=float(valid.mean()),reason='Disconnected mesh cannot supply a continuous tube')
    # Equal-distance rings retain topology even where adjacent coils almost touch.
    s=(da-db);s=(s-s[valid].min())/(s[valid].max()-s[valid].min())
    surface_length=float(np.median(da[b]));n=max(8,int(surface_length/.004))
    path=[ca]
    for i in range(1,n):
        mask=valid&(s>=(i-.5)/n)&(s<(i+.5)/n)
        if mask.sum()>=3: path.append(p[mask].mean(0))
    path.append(cb);path=np.asarray(path)
    for _ in range(3): path[1:-1]=(path[:-2]+2*path[1:-1]+path[2:])/4
    path=resample(path)
    return path,dict(method=method,boundaryRings=len(loops),boundaryRingVertices=[len(v) for v in loops],
        connectedFraction=float(valid.mean()),surfaceGeodesicLengthM=surface_length,schematic=False)


def project(points,path):
    """Nearest segment normalized arc length; no nearest-vertex staircase."""
    p=np.asarray(points);path=np.asarray(path);a=path[:-1];v=np.diff(path,axis=0)
    lengths=np.linalg.norm(v,axis=1);station=np.r_[0,np.cumsum(lengths)]
    answer=[]
    for start in range(0,len(p),512):
        delta=p[start:start+512,None,:]-a[None,:,:]
        t=np.clip(np.sum(delta*v,axis=2)/(lengths**2),0,1)
        errors=np.sum((delta-t[:,:,None]*v)**2,axis=2);j=errors.argmin(axis=1)
        answer.extend((station[j]+t[np.arange(len(j)),j]*lengths[j])/station[-1])
    return np.asarray(answer)
