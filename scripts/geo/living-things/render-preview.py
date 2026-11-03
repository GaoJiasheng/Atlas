"""CPU FrontSide raster QA of decoded geometry. Optional --finishes samples the
exact runtime procedural maps exported by export-finish-maps.ts; --checker checks
chart distortion. Lighting is an offline approximation, not browser/GPU PBR.
"""
import os,json,math,argparse
import numpy as np
from PIL import Image,ImageDraw
from numba import njit

@njit(cache=True)
def sample(tex,u,v):
    h,w,_=tex.shape
    x=(u%1)*w-.5;y=((1-v)%1)*h-.5
    i=math.floor(x);j=math.floor(y);fx=x-i;fy=y-j
    return tex[j%h,i%w]*(1-fx)*(1-fy)+tex[j%h,(i+1)%w]*fx*(1-fy)+tex[(j+1)%h,i%w]*(1-fx)*fy+tex[(j+1)%h,(i+1)%w]*fx*fy

@njit(cache=True)
def drawtri(screen,zs,colors,normals,tri,uv,albedo,normalmap,roughmap,repeats,strength,rough,front,mode,W,H):
    canvas=np.ones((H,W,3),dtype=np.float64)
    canvas[:,:,0]=0.89;canvas[:,:,1]=0.87;canvas[:,:,2]=0.82
    depth=np.ones((H,W))*1e9
    light=np.array([-.45,.80,.6]);light=light/np.sqrt((light*light).sum())
    halfvec=light+front;halfvec=halfvec/np.linalg.norm(halfvec)
    for k in range(len(screen)):
        p=screen[k];z=zs[k];col=colors[k];nor=normals[k];coords=uv[k]
        x0=max(0,int(np.floor(p[:,0].min())));x1=min(W-1,int(np.ceil(p[:,0].max())))
        y0=max(0,int(np.floor(p[:,1].min())));y1=min(H-1,int(np.ceil(p[:,1].max())))
        den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
        if den > -1e-9:continue
        duv1=coords[1]-coords[0];duv2=coords[2]-coords[0];det=duv1[0]*duv2[1]-duv1[1]*duv2[0]
        tangent=np.zeros(3);bitangent=np.zeros(3)
        if abs(det)>1e-12:
            tangent=((tri[k,1]-tri[k,0])*duv2[1]-(tri[k,2]-tri[k,0])*duv1[1])/det
            bitangent=((tri[k,2]-tri[k,0])*duv1[0]-(tri[k,1]-tri[k,0])*duv2[0])/det
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                a=((p[1,1]-p[2,1])*(x-p[2,0])+(p[2,0]-p[1,0])*(y-p[2,1]))/den
                b=((p[2,1]-p[0,1])*(x-p[2,0])+(p[0,0]-p[2,0])*(y-p[2,1]))/den;c=1-a-b
                if a < -1e-6 or b < -1e-6 or c < -1e-6:continue
                zz=a*z[0]+b*z[1]+c*z[2]
                if zz>=depth[y,x]:continue
                depth[y,x]=zz
                n=a*nor[0]+b*nor[1]+c*nor[2];length=np.linalg.norm(n)
                if length>0:n=n/length
                cc=a*col[0]+b*col[1]+c*col[2]
                st=a*coords[0]+b*coords[1]+c*coords[2]
                localrough=rough
                if mode==1:
                    cc=cc*sample(albedo,st[0]*repeats[0],st[1]*repeats[0])
                    localrough*=sample(roughmap,st[0]*repeats[2],st[1]*repeats[2])[1]
                    if strength>0 and abs(det)>1e-12:
                        nm=sample(normalmap,st[0]*repeats[1],st[1]*repeats[1])*2-1
                        T=tangent-n*np.dot(n,tangent);tl=np.linalg.norm(T)
                        if tl>1e-12:
                            T/=tl;B=np.cross(n,T)
                            if np.dot(B,bitangent)<0:B=-B
                            n=T*nm[0]*strength+B*nm[1]*strength+n*nm[2];n/=max(1e-12,np.linalg.norm(n))
                if mode==2:
                    cell=(math.floor(st[0]*12)+math.floor(st[1]*12))%2
                    cc=np.array([.07,.24,.30]) if cell else np.array([.76,.57,.28])
                shade=.48+.52*max(0.,np.dot(n,light))
                cc=cc*shade
                if mode==1:
                    exponent=min(96.,max(2.,2/max(.001,localrough**4)-2))
                    cc+=.035*max(0.,np.dot(n,halfvec))**exponent
                canvas[y,x]=np.minimum(1,np.maximum(0,cc))**(1/2.2)
    return (canvas*255).astype(np.uint8)

parser=argparse.ArgumentParser();parser.add_argument('--finishes',action='store_true');parser.add_argument('--checker',action='store_true');parser.add_argument('--out',default='/tmp/atlas-living-polish');args=parser.parse_args()
path='/tmp/atlas-living-polish';os.makedirs(args.out,exist_ok=True)
data=json.load(open(path+'/geometry.json'))
manifest=json.load(open('/tmp/atlas-living-round3/maps/manifest.json')) if args.finishes else None
for name,obj in data.items():
    tri=np.array(obj['triangles']).reshape(-1,3,3);colors=np.array(obj['colours']).reshape(-1,3,3)
    nor=np.array(obj['normals']).reshape(-1,3,3)
    uv=np.array(obj.get('uvs',np.zeros((len(tri),6)))).reshape(-1,3,2)
    albedo=normalmap=roughmap=np.ones((1,1,3));repeats=np.ones(3);strength=0.;rough=.8
    if manifest and obj.get('family'):
        family=manifest['materialFamilies'].get(obj['family'],manifest['materialFamilies']['tissue']);finish=manifest['finishes'].get(family['finish'])
        strength=family['normalStrength'];rough=family['roughness']
        if not finish:strength=0.
        if finish:
            maps=[]
            for j,key in enumerate(['albedo','normal','roughness']):
                desc=finish[key]
                tex=np.ones((1,1,3))
                if desc:
                    tex=np.array(Image.open('/tmp/atlas-living-round3/maps/'+desc['file']).convert('RGB'),dtype=np.float64)/255
                    if key=='albedo':tex=np.where(tex<=.04045,tex/12.92,((tex+.055)/1.055)**2.4)
                    repeats[j]=desc['repeat'][0]
                maps.append(tex)
            albedo,normalmap,roughmap=maps
    frames=[];views=[(35,24),(130,24),(25,68)]
    if name in ['mushroom','mushroom-gills']:views=[(35,-18),(130,-10),(25,68)]
    if name=='birds-nest-fern':views=[(35,24),(130,-16),(25,68)]
    if name=='bat-head':views=[(0,12),(55,12),(110,12)]
    if name=='python-belly':views=[(35,-38),(130,-25),(25,-70)]
    for angle,(az,el) in enumerate(views):
        az,el=math.radians(az),math.radians(el)
        front=np.array([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)])
        right=np.cross(np.array([0,1,0]),front);right=right/np.linalg.norm(right);up=np.cross(front,right)
        x=tri@right;y=tri@up;z=-(tri@front)
        xmin,xmax=x.min(),x.max();ymin,ymax=y.min(),y.max();scale=540/max(xmax-xmin,ymax-ymin)
        xy=np.stack([(x-(xmin+xmax)/2)*scale+320,320-(y-(ymin+ymax)/2)*scale],axis=-1)
        arr=drawtri(xy,z,colors,nor,tri,uv,albedo,normalmap,roughmap,repeats,strength,rough,front,2 if args.checker else 1 if args.finishes else 0,640,640)
        im=Image.fromarray(arr);label=name+f' / {angle+1}'+(' / finish maps' if args.finishes else ' / UV checker' if args.checker else '')
        ImageDraw.Draw(im).text((14,14),label,fill='#302c24');im.save(args.out+f'/{name}-{angle+1}.png');frames.append(im)
    grid=Image.new('RGB',(1920,640));[grid.paste(im,(i*640,0)) for i,im in enumerate(frames)];grid.save(args.out+f'/{name}-angles.png')
    print(name,flush=True)
