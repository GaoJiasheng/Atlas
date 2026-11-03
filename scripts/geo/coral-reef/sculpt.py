"""Original sculpted coral meshes; metres, Y up. No downloaded geometry.
Requires numpy/scikit-image for fused branch isosurfaces; writes portable GLB2.
"""
import json, math, struct
from pathlib import Path
import numpy as np
from skimage.measure import marching_cubes
TAU=math.tau

class Mesh:
    def __init__(self): self.v=[]; self.f=[]
    def add(self,v,f):
        n=len(self.v); self.v.extend(np.asarray(v).tolist()); self.f.extend((np.asarray(f)+n).tolist()); return self
    def grid(self, points, wrap=True, flip=False):
        p=np.asarray(points); rows,cols=p.shape[:2]; faces=[]
        for j in range(rows-1):
            for i in range(cols if wrap else cols-1):
                a=j*cols+i;b=j*cols+(i+1)%cols;c=b+cols;d=a+cols
                faces.extend([[a,c,b],[a,d,c]])
        return self.add(p.reshape(-1,3),np.asarray(faces)[:,::-1] if flip else faces)
    def move(self,offset,scale=1):
        self.v=(np.asarray(self.v)*scale+offset).tolist(); return self

def tube(path,radii,radial=16):
    p=np.asarray(path); r=np.broadcast_to(radii,(len(p),)); rows=[]
    for j,pt in enumerate(p):
        t=p[min(j+1,len(p)-1)]-p[max(0,j-1)]; t/=np.linalg.norm(t)
        u=np.cross(t,[0,0,1] if abs(t[2])<.9 else [1,0,0]);u/=np.linalg.norm(u);v=np.cross(t,u)
        rows.append([pt+r[j]*(math.cos(a)*u+math.sin(a)*v) for a in np.arange(radial)*TAU/radial])
    m=Mesh().grid(rows,flip=True)
    # End discs, independent normals avoid a dark pinched surface at ends.
    for end,rev in [(0,True),(-1,False)]:
        row=np.asarray(rows[end]);n=len(m.v);m.v.extend([p[end].tolist(),*row.tolist()])
        for i in range(radial): m.f.append([n,n+1+(i+1)%radial,n+1+i] if rev else [n,n+1+i,n+1+(i+1)%radial])
    return m

def dome(offset,scale=1,overlay=False):
    # Fibonacci-distributed calices follow the curved surface, including flanks.
    n=155; k=np.arange(n); y=(k+.5)/n; a=k*2.399963229728653
    seeds=np.stack([np.sqrt(1-y*y)*np.cos(a),y,np.sqrt(1-y*y)*np.sin(a)],axis=1)
    theta=np.linspace(.00001,math.pi/2,109);phi=np.arange(216)*TAU/216
    tt,pp=np.meshgrid(theta,phi,indexing='ij')
    dirs=np.stack([np.sin(tt)*np.cos(pp),np.cos(tt),np.sin(tt)*np.sin(pp)],axis=-1)
    flat=dirs.reshape(-1,3); idx=np.argmax(np.einsum('ij,kj->ik',flat,seeds),axis=1); near=seeds[idx]
    dist=np.arccos(np.clip(np.sum(flat*near,axis=1),-1,1)); w=dist/(.092*(1+.10*np.sin(idx*1.71)))
    tangent=np.cross(near,[0,1,0]); tangent/=np.maximum(np.linalg.norm(tangent,axis=1,keepdims=True),1e-8)
    bitangent=np.cross(near,tangent); delta=flat-near
    ang=np.arctan2(np.sum(delta*bitangent,axis=1),np.sum(delta*tangent,axis=1))
    # Depressed oral centres, raised irregular calice walls and short septal ribs.
    pits=-.010*np.exp(-(w/.45)**4)+.007*np.exp(-((w-.82)/.16)**2)
    ribs=.0032*(.5+.5*np.cos(18*ang))**5*np.exp(-((w-.53)/.26)**4)
    lump=1+.040*np.sin(3*pp+.4)*np.sin(tt)**2+.021*np.cos(5*pp+2*tt)+.025*np.sin(7*tt+pp)
    relief=(pits+ribs).reshape(tt.shape)
    r=.30*lump+relief
    pts=dirs*r[...,None];pts[:,:,1]*=.94
    if overlay: pts+=dirs*.0016
    m=Mesh().grid(pts,flip=True)
    # Resolved septal ridges in each calice supplement the smooth displaced
    # dome, so a close-up shows stars inside the depressions rather than dimples.
    for j,normal in enumerate(seeds):
        u=np.cross(normal,[0,1,0]);u/=max(np.linalg.norm(u),1e-9);v=np.cross(normal,u)
        theta0=math.acos(normal[1]);phi0=math.atan2(normal[2],normal[0])
        radius=.30*(1+.040*math.sin(3*phi0+.4)*math.sin(theta0)**2+.021*math.cos(5*phi0+2*theta0)+.025*math.sin(7*theta0+phi0))
        for k in range(18):
            angle=k*TAU/18;rad=u*math.cos(angle)+v*math.sin(angle);side=np.cross(normal,rad)
            r1=.008 if k%2==0 else .011;r2=.022*(1+.08*math.sin(j*1.71));verts=[]
            # Equatorial calices end at the colony base, rather than leaving
            # unsupported teeth extending below the hemisphere.
            outer=normal*math.sqrt(1-(r2/.30)**2)+rad*(r2/.30)
            if outer[1]<.012:continue
            for rr in [r1,(r1+r2)*.5,r2]:
                # Conform each tooth to the displaced curved body. A tangent
                # plane here leaves floating, spiky ridges on the dome flanks.
                direction=normal*math.sqrt(1-(rr/.30)**2)+rad*(rr/.30)
                th=math.acos(direction[1]);ph=math.atan2(direction[2],direction[0])
                base=.30*(1+.040*math.sin(3*ph+.4)*math.sin(th)**2+.021*math.cos(5*ph+2*th)+.025*math.sin(7*th+ph))
                q=math.acos(np.clip(np.dot(direction,normal),-1,1))/(.092*(1+.10*math.sin(j*1.71)))
                depth=-.010*math.exp(-(q/.45)**4)+.007*math.exp(-((q-.82)/.16)**2)
                rib=.0032*math.exp(-((q-.53)/.26)**4)
                for width,height in [(-.00065,0),(0,.0008),(.00065,0)]:
                    point=direction*(base+depth+rib+.0002+( .0016 if overlay else 0))+side*width+direction*height
                    point[1]*=.94;verts.append(point)
            m.add(verts,[[0,3,4],[0,4,1],[1,4,5],[1,5,2],[3,6,7],[3,7,4],[4,7,8],[4,8,5]])
    # Close underneath; all calices are true recessed geometry rather than dots.
    row=pts[-1];m.add(np.vstack([[0,-.012,0],row]),[[0,1+(i+1)%len(row),1+i] for i in range(len(row))])
    return m.move(offset,scale)

def corallite():
    rows=[]
    profile=[(0,.018),(.18,.018),(.25,.04),(.286,.115),(.304,.24),(.306,.304),(.298,.316),(.286,.304),(.28,.232),(.263,.112),(.22,.050),(0,.044)]
    for r,y in profile:
        rows.append([[(r*(1+.012*math.sin(5*a))+.0016*math.cos(48*a))*math.cos(a),y+.003*math.sin(3*a)*y/.4,(r*(1+.012*math.sin(5*a))+.0016*math.cos(48*a))*math.sin(a)] for a in np.arange(144)*TAU/144])
    m=Mesh().grid(rows)
    # 24 thin septa in two cycles; nonplanar, serrated upper edges, broad fused roots.
    for k in range(24):
        a=k*TAU/24; inner=.065 if k%2==0 else .135
        radii=np.linspace(inner,.289,27); verts=[]
        for sign in [-1,1]:
            for h in [0,1]:
                for i,r in enumerate(radii):
                    t=(r-inner)/(.289-inner)
                    # Ridges follow the bowl floor; only their outer ends rise
                    # a few mm above the theca. Thin walls close on both sides.
                    top=.085+.245*t**.58+.003*math.sin(i*2.5+k)*math.sin(math.pi*t)
                    bottom=.043+.006*(r/.22)**2 if r<.22 else .049+.205*((r-.22)/.069)**1.5
                    angle=a+sign*(.0012+.0018*t)/r
                    verts.append([r*math.cos(angle),bottom+(top-bottom)*h,r*math.sin(angle)])
        faces=[];N=len(radii)
        for i in range(N-1):
            for base in [0,2*N]:
                fs=[[base+i,base+i+1,base+N+i+1],[base+i,base+N+i+1,base+N+i]]
                faces.extend(fs if base==2*N else [f[::-1] for f in fs])
            faces.extend([[N+i,3*N+i+1,N+i+1],[N+i,3*N+i,3*N+i+1]])
            faces.extend([[i,i+1,2*N+i+1],[i,2*N+i+1,2*N+i]])
        faces.extend([[0,2*N,N],[N,2*N,3*N],[N-1,2*N-1,3*N-1],[2*N-1,4*N-1,3*N-1]])
        m.add(verts,faces)
    return m.move([5,0,0])

def tissue():
    # A low, scalloped oral disc seated inside the corallite, rather than a drum.
    profile=[(.17,.08),(.209,.10),(.225,.22),(.232,.35),(.248,.452),(.241,.482),(.19,.474),(.13,.481),(.074,.51),(.052,.525),(.042,.515),(.047,.49),(.082,.473),(.18,.445),(.208,.34),(.196,.20),(.17,.08)]
    rows=[]
    for r,y in profile:
        rows.append([[(r*(1+.025*math.cos(12*a)+.012*math.sin(5*a)))*math.cos(a), y+.006*math.cos(12*a)*max(0,(y-.3)/.2),r*(1+.025*math.cos(12*a)+.012*math.sin(5*a))*math.sin(a)*(1-.68*max(0,min(1,(.13-r)/.088)))] for a in np.arange(144)*TAU/144])
    return Mesh().grid(rows).move([5,0,0])

def mouth():
    rows=[]
    for s,y in [(1.1,.511),(1,.527),(.79,.533),(.65,.522),(.64,.493),(.4,.48)]:
        rows.append([[.053*s*math.cos(a),y+.002*math.sin(a*3),.016*s*math.sin(a)*(1+.12*math.cos(2*a))] for a in np.arange(64)*TAU/64])
    return Mesh().grid(rows).move([5,0,0])

def plate(offset,scale=1):
    # Two gently cupped, irregular foliose plates; ridges follow growth margins.
    m=Mesh()
    for tier in [0,1]:
        rows=[]
        for t in np.linspace(.02,1,35):
            row=[]
            for a in np.arange(144)*TAU/144:
                rr=t*(1+.07*math.sin(5*a+.8*tier)+.04*math.cos(9*a))
                y=.10+tier*.10+.035*t*t+.016*math.sin(3*a+2*t)*t+.0018*math.cos(t*TAU*16)
                row.append([.23*rr*math.cos(a)*(1-.18*tier),y,.18*rr*math.sin(a)*(1-.1*tier)])
            rows.append(row)
        # Top and underside joined around scalloped rim.
        m.grid(rows,flip=True); m.grid((np.asarray(rows)[::-1]-[0,.008,0]),flip=True)
        m.grid([rows[-1],(np.asarray(rows[-1])-[0,.008,0]).tolist()])
    stem=tube([[0,0,0],[.003,.07,0],[.02,.12,0]],[.045,.035,.025],24)
    m.add(stem.v,stem.f)
    return m.move(offset,scale)

def branching(offset,scale=1,seed=1):
    rng=np.random.default_rng(seed); segments=[]
    def limb(start,end,r0,r1):
        # Subdivide a curved centreline to avoid a straight pipe silhouette.
        mid=(np.array(start)+end)*.5+np.array([.007*math.sin(seed+len(segments)),.005,.006*math.cos(seed+len(segments))])
        segments.extend([(np.array(start),mid,r0,(r0+r1)*.52),(mid,np.array(end),(r0+r1)*.52,r1)])
    limb([0,0,0],[.012,.16,.006],.031,.024)
    ends=[]
    for k in range(6):
        a=k*2.399963+seed*.7; y=.068+.017*k
        start=[.008,y,.003]; end=[.095*math.cos(a),y+.09+rng.uniform(0,.055),.080*math.sin(a)]
        limb(start,end,.018,.009)
        tip=np.array(end)+[.008*math.cos(a+.4),.055+rng.uniform(0,.035),.008*math.sin(a+.4)]
        limb(end,tip,.010,.0045); ends.append(tip)
        if k%2==0:
            fork=np.array(end)*[.9,.85,.9]+[.032*math.cos(a+1),.056,.032*math.sin(a+1)]
            limb(np.array(end)*.72+np.array(start)*.28,fork,.012,.004);ends.append(fork)
    # A smooth minimum fuses every fork organically, including thick collars.
    step=.0038;lo=np.array([-.14,-.04,-.13]);hi=np.array([.14,.34,.13]);axes=[np.arange(lo[i],hi[i]+step,step) for i in range(3)]
    xyz=np.stack(np.meshgrid(*axes,indexing='ij'),axis=-1);field=np.full(xyz.shape[:-1],1.)
    for a,b,r0,r1 in segments:
        ab=b-a;t=np.clip(np.sum((xyz-a)*ab,axis=-1)/np.dot(ab,ab),0,1)
        d=np.linalg.norm(xyz-a-t[...,None]*ab,axis=-1)-(r0+(r1-r0)*t)
        h=np.maximum(.006-np.abs(field-d),0)/.006
        field=np.minimum(field,d)-h*h*.006*.25
    # Fine granular surface in the isosurface, kept subordinate to architecture.
    field+=.00065*np.sin(xyz[...,0]*180)*np.sin(xyz[...,1]*205)*np.cos(xyz[...,2]*190)
    v,f,_,_=marching_cubes(field,0,spacing=(step,step,step),allow_degenerate=False)
    m=Mesh().add(v+lo,f)
    # Radial corallites grow out of the branch surface at irregular positions.
    for j,(a,b,r0,r1) in enumerate(segments):
        axis=b-a; length=np.linalg.norm(axis); axis/=length
        u=np.cross(axis,[0,0,1]);u/=np.linalg.norm(u);v=np.cross(axis,u)
        for k in range(max(1,int(length/.012))):
            t=(k+.35)/max(1,int(length/.012));angle=(k+j*1.7)*2.399963
            normal=u*math.cos(angle)+v*math.sin(angle)
            center=a+t*(b-a)+normal*(r0*(1-t)+r1*t-.0012)
            w=normal*.94+axis*.34;w/=np.linalg.norm(w);uu=np.cross(w,axis);uu/=np.linalg.norm(uu);vv=np.cross(w,uu)
            rr=.0035*(1+.16*math.sin(k*2.3+j));rings=[]
            for r,h in [(rr,0),(rr*1.2,.002),(rr,.005),(rr*.58,.005),(rr*.50,.0007)]:
                rings.append([center+w*h+r*(math.cos(q)*uu+math.sin(q)*vv) for q in np.arange(12)*TAU/12])
            m.grid(rings,flip=True)
    # Terminal calices have small open rims instead of spherical branch tips.
    for tip in ends:
        p=[]
        for r,y in [(.0045,-.004),(.006,0),(.0055,.005),(.0036,.005),(.0034,-.002)]:
            p.append([[tip[0]+r*math.cos(a),tip[1]+y,tip[2]+r*math.sin(a)] for a in np.arange(16)*TAU/16])
        m.grid(p)
    return m.move(offset,scale)

def write_glb(meshes,path):
    binary=bytearray();views=[];access=[];nodes=[];out=[]
    def buf(arr,typ,component,target):
        while len(binary)%4:binary.append(0)
        start=len(binary);binary.extend(arr.tobytes());idx=len(views);views.append(dict(buffer=0,byteOffset=start,byteLength=arr.nbytes,target=target))
        acc=dict(bufferView=idx,componentType=component,count=len(arr),type=typ)
        if typ=='VEC3': acc.update(min=arr.min(axis=0).tolist(),max=arr.max(axis=0).tolist())
        access.append(acc);return len(access)-1
    for name,m in meshes.items():
        v=np.asarray(m.v,dtype=np.float32);f=np.asarray(m.f,dtype=np.uint32)
        n=np.zeros_like(v);fn=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
        for j in range(3):np.add.at(n,f[:,j],fn)
        n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)
        attrs=dict(POSITION=buf(v,'VEC3',5126,34962),NORMAL=buf(n,'VEC3',5126,34962))
        small=len(v)<65536
        indices=buf(f.reshape(-1).astype(np.uint16 if small else np.uint32),'SCALAR',5123 if small else 5125,34963)
        nodes.append(dict(name=name,mesh=len(out),extras={'closed':True}));out.append(dict(name=name,primitives=[dict(attributes=attrs,indices=indices,mode=4)]))
    gltf=dict(asset={'version':'2.0','generator':'Atlas original coral sculpt','copyright':'Atlas original procedural geometry, 2026. CC BY-NC-SA 4.0. No third-party mesh or texture.'},scene=0,scenes=[{'nodes':list(range(len(nodes)))}],nodes=nodes,meshes=out,buffers=[{'byteLength':len(binary)}],bufferViews=views,accessors=access)
    js=json.dumps(gltf,separators=(',',':')).encode();js+=b' '*((-len(js))%4);binary+=b'\0'*((-len(binary))%4)
    data=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
    print('GLB:',len(data),'bytes;',sum(len(m.f) for m in meshes.values()),'triangles',flush=True)
