"""Offline CPU z-buffer with interpolated vertex normals. No WebGL/browser.
python3 render-preview.py preview/*.json. Requires numpy, Pillow, numba.
"""
import base64,json,sys
from pathlib import Path
import numpy as np
from numba import njit
from PIL import Image,ImageDraw
@njit(cache=True)
def raster(p,n,index,color,canvas,depth):
 h,w=depth.shape
 key=np.array([-.3,.75,.6]);key/=np.sqrt((key*key).sum())
 fill=np.array([.7,.3,-.3]);fill/=np.sqrt((fill*fill).sum())
 for tri in index:
  a,b,c=p[tri[0]],p[tri[1]],p[tri[2]]
  den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if den>=-.0001 or min(a[2],b[2],c[2])<=.001:continue
  x0=max(0,int(np.floor(min(a[0],b[0],c[0]))));x1=min(w-1,int(np.ceil(max(a[0],b[0],c[0]))))
  y0=max(0,int(np.floor(min(a[1],b[1],c[1]))));y1=min(h-1,int(np.ceil(max(a[1],b[1],c[1]))))
  for iy in range(y0,y1+1):
   for ix in range(x0,x1+1):
    x=ix+.5;y=iy+.5
    u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den
    v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den
    ww=1-u-v
    if min(u,v,ww)<0:continue
    z=1/(u/a[2]+v/b[2]+ww/c[2])
    if z>=depth[iy,ix]:continue
    nn=u*n[tri[0]]+v*n[tri[1]]+ww*n[tri[2]]
    nn/=max(1e-9,np.sqrt((nn*nn).sum()))
    light=.36+.52*max(0,(nn*key).sum())+.20*max(0,(nn*fill).sum())
    for k in range(3):canvas[iy,ix,k]=min(255,color[k]*light)
    depth[iy,ix]=z
for path in sys.argv[1:]:
 data=json.loads(Path(path).read_text());w,h=data['width'],data['height']
 canvas=np.full((h,w,3),[233.,228.,216.]);depth=np.full((h,w),np.inf)
 for m in data['meshes']:
  decode=lambda key,t:np.frombuffer(base64.b64decode(m[key]),dtype=t).reshape(-1,3)
  p=decode('position',np.float32);n=decode('normal',np.float32);idx=decode('index',np.uint32)
  color=np.array([int(m['color'][i:i+2],16) for i in [1,3,5]],dtype=np.float64)
  raster(p,n,idx,color,canvas,depth)
 im=Image.fromarray(canvas.astype(np.uint8));draw=ImageDraw.Draw(im)
 draw.text((24,20),f'{Path(path).stem.upper()} | CPU depth buffer | geometry and authored material tints',fill=(55,51,45))
 out=str(Path(path).with_suffix('.png'));im.save(out);print(out,flush=True)
