"""CPU raster of decoded GLB. Exact engine studio direct-light rig, hemisphere,
exposure, ACES and finish pixels; numerical RoomEnvironment convolution replaces
GPU PMREM. No browser, desktop, alternate modelling geometry or painted glints.
"""
import json,math,argparse
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageOps
from numba import njit

@njit(cache=True)
def sample(tex,u,v):
 h,w,_=tex.shape;x=(u%1)*w-.5;y=((1-v)%1)*h-.5;i=math.floor(x);j=math.floor(y);a=x-i;b=y-j
 return tex[j%h,i%w]*(1-a)*(1-b)+tex[j%h,(i+1)%w]*a*(1-b)+tex[(j+1)%h,i%w]*(1-a)*b+tex[(j+1)%h,(i+1)%w]*a*b

@njit(cache=True)
def raster(xy,zs,tri,normals,colors,uv,finish,albedo,normalmap,roughmap,regionRoughness,W,H):
 depth=np.ones((H,W))*1e9;pos=np.zeros((H,W,3));nor=np.zeros_like(pos);col=np.zeros_like(pos);rough=np.ones((H,W));visible=np.zeros((H,W),np.uint8)
 for k in range(len(tri)):
  p=xy[k];z=zs[k];den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
  if den>=-1e-10:continue
  x0=max(0,int(np.floor(p[:,0].min())));x1=min(W-1,int(np.ceil(p[:,0].max())));y0=max(0,int(np.floor(p[:,1].min())));y1=min(H-1,int(np.ceil(p[:,1].max())))
  coords=uv[k];d1=coords[1]-coords[0];d2=coords[2]-coords[0];det=d1[0]*d2[1]-d1[1]*d2[0];tangent=np.zeros(3);bitangent=np.zeros(3)
  if abs(det)>1e-12:
   tangent=((tri[k,1]-tri[k,0])*d2[1]-(tri[k,2]-tri[k,0])*d1[1])/det
   bitangent=((tri[k,2]-tri[k,0])*d1[0]-(tri[k,1]-tri[k,0])*d2[0])/det
  for y in range(y0,y1+1):
   for x in range(x0,x1+1):
    a=((p[1,1]-p[2,1])*(x-p[2,0])+(p[2,0]-p[1,0])*(y-p[2,1]))/den;b=((p[2,1]-p[0,1])*(x-p[2,0])+(p[0,0]-p[2,0])*(y-p[2,1]))/den;c=1-a-b
    if min(a,b,c)<-1e-6:continue
    inv=a/z[0]+b/z[1]+c/z[2];zz=1/inv
    if zz>=depth[y,x]:continue
    a=a/z[0]*zz;b=b/z[1]*zz;c=c/z[2]*zz
    depth[y,x]=zz;visible[y,x]=1
    n=a*normals[k,0]+b*normals[k,1]+c*normals[k,2];n/=max(1e-15,np.linalg.norm(n));st=a*coords[0]+b*coords[1]+c*coords[2]
    cc=a*colors[k,0]+b*colors[k,1]+c*colors[k,2]
    # UV charts on bare surfaces are tiny; the coat retains the runtime pile.
    cc*=sample(albedo,st[0]*8,st[1]*8)
    r=.96*sample(roughmap,st[0]*3,st[1]*3)[1]
    if regionRoughness[0]>=0:r=regionRoughness[finish[k]]
    elif finish[k]:r=.075
    if not finish[k] and abs(det)>1e-12:
     nm=sample(normalmap,st[0]*8,st[1]*8)*2-1;T=tangent-n*np.dot(n,tangent);tl=np.linalg.norm(T)
     if tl>1e-12:
      T/=tl;B=np.cross(n,T)
      if np.dot(B,bitangent)<0:B=-B
      n=T*nm[0]*.75+B*nm[1]*.75+n*nm[2];n/=max(1e-15,np.linalg.norm(n))
    pos[y,x]=a*tri[k,0]+b*tri[k,1]+c*tri[k,2];nor[y,x]=n;col[y,x]=cc;rough[y,x]=r
 return pos,nor,col,rough,visible

def unit(v):return v/np.maximum(np.linalg.norm(v,axis=-1,keepdims=True),1e-10)
def srgb(v):return np.where(v<=.0031308,12.92*v,1.055*np.maximum(0,v)**(1/2.4)-.055)
def linear(v):return np.where(v<=.04045,v/12.92,((v+.055)/1.055)**2.4)
def environment(tex,dirs):
 dirs=unit(dirs);h,w,_=tex.shape;u=(np.arctan2(dirs[...,2],dirs[...,0])/(2*np.pi))%1;v=np.arccos(np.clip(dirs[...,1],-1,1))/np.pi
 x=u*w-.5;y=v*h-.5;i=np.floor(x).astype(int);j=np.floor(y).astype(int);a=(x-i)[...,None];b=(y-j)[...,None]
 return tex[j%h,i%w]*(1-a)*(1-b)+tex[j%h,(i+1)%w]*a*(1-b)+tex[(j+1)%h,i%w]*(1-a)*b+tex[(j+1)%h,(i+1)%w]*a*b

def shade(P,N,C,R,cam,rig,env):
 V=unit(cam-P);nv=np.maximum(1e-5,(N*V).sum(-1));rgb=np.zeros_like(C);PI=np.pi
 # MeshStandardMaterial GGX (dielectric F0=.04), 1/pi Lambert diffuse.
 for light in rig['lights']:
  L=np.array(light['dir']);H=unit(V+L);nl=np.maximum(0,(N*L).sum(-1));nh=np.maximum(0,(N*H).sum(-1));vh=np.maximum(0,(V*H).sum(-1));alpha=R**2;a2=alpha**2;den=(nh*nh*(a2-1)+1)**2;D=a2/(PI*np.maximum(den,1e-12));gv=nl*np.sqrt(a2+(1-a2)*nv*nv);gl=nv*np.sqrt(a2+(1-a2)*nl*nl);G=.5/np.maximum(gv+gl,1e-8);F=.04+.96*2**((-5.55473*vh-6.98316)*vh)
  rgb+=(C/PI+(F*G*D)[...,None])*nl[...,None]*np.array(light['color'])*light['intensity']
 t=N[...,1:2]*.5+.5;hemi=np.array(rig['hemi'][0])*t+np.array(rig['hemi'][1])*(1-t);rgb+=C/PI*hemi*rig['hemiIntensity']
 # RoomEnvironment quadrature: cosine-distributed diffuse hemisphere and
 # GGX importance-sampled specular. Same room/softboxes, numerical CPU filter.
 T=unit(np.cross(N,np.array([0.,1.,.0001])));B=np.cross(N,T);diff=np.zeros_like(C);spec=np.zeros_like(C);refl=unit(2*nv[...,None]*N-V)
 Tr=unit(np.cross(refl,np.array([0.,1.,.0001])));Br=np.cross(refl,Tr)
 for i in range(64):
  u=(i+.5)/64;v=((i*0.61803398875)%1);phi=2*PI*v;ct=math.sqrt(1-u);st=math.sqrt(u);D=T*(st*math.cos(phi))+B*(st*math.sin(phi))+N*ct;diff+=environment(env,D)/64
  # Filter the reflected vector with roughness-dependent GGX cone.
  ctg=np.sqrt((1-u)/(1+(R**4-1)*u));stg=np.sqrt(1-ctg*ctg);D=Tr*(stg*math.cos(phi))[...,None]+Br*(stg*math.sin(phi))[...,None]+refl*ctg[...,None];spec+=environment(env,D)/64
 fresnel=.04+.96*(1-nv)**5
 rgb+=rig['environment']*.35*(C*diff+spec*fresnel[...,None])
 # The exact Three.js ACES exposure and two colour matrices.
 v=rgb*(rig['exposure']/.6);A=np.array([[.59719,.35458,.04823],[.076,.90834,.01566],[.0284,.13383,.83777]]);O=np.array([[1.60475,-.53108,-.07367],[-.10208,1.10813,-.00605],[-.00327,-.07276,1.07602]])
 v=np.einsum("...j,ij->...i",v,A);v=(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);return np.clip(srgb(np.clip(np.einsum("...j,ij->...i",v,O),0,1)),0,1)

parser=argparse.ArgumentParser();parser.add_argument('root');parser.add_argument('--refs',default='/tmp/living-refs');parser.add_argument('--size',type=int,default=800);parser.add_argument('--proposed-finish',action='store_true');args=parser.parse_args();out=Path(args.root);data=json.load(open(out/'geometry.json'));tri=np.array(data['positions']).reshape(-1,3,3);norm=np.array(data['normals']).reshape(-1,3,3);color=np.array(data['colours']).reshape(-1,3,3);uv=np.array(data['uvs']).reshape(-1,3,2);finish=np.array(data['finish'],np.uint8) if data['finishActive'] or args.proposed_finish else np.zeros(len(tri),np.uint8);regionRoughness=np.array(data['regionRoughness'] if data['finishActive'] else [-1.,.075]);env=np.array(data['environment']['pixels']).reshape(data['environment']['height'],data['environment']['width'],3)
maproot=Path('/tmp/atlas-living-round3/maps');maps=[np.array(Image.open(maproot/('pile-'+s+'.png')).convert('RGB'))/255 for s in ['albedo','normal','roughness']];maps[0]=linear(maps[0]);W=H=args.size;target=np.array(data['camera']['target']);dist=data['camera']['distance'];focal=H/(2*math.tan(math.radians(data['camera']['fov']/2)));frames=[]
for name,az,el in [('front',0,28),('three-quarter',40,25),('profile',90,0),('rear',180,5)]:
 az=math.radians(az);el=math.radians(el);front=np.array([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)]);cam=target+dist*front;right=unit(np.cross(np.array([0,1,0]),front));up=np.cross(front,right);rel=tri-cam;z=-(rel@front);xy=np.stack([W/2+focal*(rel@right)/z,H/2-focal*(rel@up)/z],-1)
 P,N,C,R,visible=raster(xy,z,tri,norm,color,uv,finish,*maps,regionRoughness,W,H);mask=visible.astype(bool);img=np.ones((H,W,3))*np.array([233,228,216])/255;img[mask]=shade(P[mask],N[mask],C[mask],R[mask],cam,data['lighting'],env);im=Image.fromarray(np.uint8(np.clip(img,0,1)*255));d=ImageDraw.Draw(im);d.text((14,14),f'{"PROPOSED GLOSS" if args.proposed_finish else "LIVE MATERIAL"} / {name} / engine paper studio / FOV 5 / distance .35 m',fill='#302c24');im.save(out/f'bat-{name}.png');frames.append(im)
 refs=Path(args.refs)
 if name=='rear':continue
 if name=='front':ref=Image.open(refs/'bat.jpg').crop((40,0,925,620));label='AntanO / CC BY-SA 4.0 / frontal'
 elif name=='three-quarter':ref=Image.open(refs/'bat-head.jpg').rotate(-15,expand=True).crop((120,80,1050,850));label='AntanO / CC BY-SA 3.0 / three-quarter / roll aligned -15 deg'
 else:ref=Image.open(refs/'bat-nparks.jpg').crop((425,417,542,548)).transpose(Image.Transpose.FLIP_LEFT_RIGHT);label='Nick Baker / NParks / profile / development reference only, mirrored'
 canvas=Image.new('RGB',(W*2,H+60),'#e9e4d8');ref=ImageOps.contain(ref,(W-40,H-40));canvas.paste(ref,((W-ref.width)//2,60+(H-ref.height)//2));canvas.paste(im,(W,60));d=ImageDraw.Draw(canvas);d.text((14,14),label,fill='#302c24');d.text((W+14,14),f'{name} / {data["bytes"]:,} bytes / CPU numerical environment filter',fill='#302c24');canvas.save(out/f'comparison-{name}.png');print(name,flush=True)
grid=Image.new('RGB',(W*4,H));[grid.paste(im,(i*W,0)) for i,im in enumerate(frames)];grid.save(out/'bat-angles.png')
