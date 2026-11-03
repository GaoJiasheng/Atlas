"""Smooth shaded, depth-buffered CPU raster of preview.ts actual mesh exports.
Uses perspective-correct interpolation, opaque depth and sorted transparent faces.
Offline inspection only: runtime lighting, HUD collisions and shaders need browser acceptance.
python3 scripts/geo/cells/render-preview.py path/*.json [--cinema] [--labels]
"""
import base64
import json
import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
os.environ.setdefault('NUMBA_CACHE_DIR','/private/tmp/atlas-cells-numba-cache')
try:
    from numba import njit
except ImportError:
    # Portable fallback is slower but produces the identical inspection image.
    def njit(**kwargs):
        return lambda fn: fn

theme = 'cinema' if '--cinema' in sys.argv else 'paper'
key=np.array([-.3,.75,.6]);key/=np.linalg.norm(key)
fill=np.array([.7,.3,-.3]);fill/=np.linalg.norm(fill)
def rgb(hex_color):
    return np.array([int(hex_color[i:i+2],16) for i in (1,3,5)],dtype=float)

@njit(cache=True)
def raster(triangles, lights, opacities, image, depth):
    height,width=depth.shape
    for k in range(len(triangles)):
        q=triangles[k];light=lights[k];opacity=opacities[k]
        x0=max(0,int(np.floor(min(q[0,0],q[1,0],q[2,0]))))
        x1=min(width-1,int(np.ceil(max(q[0,0],q[1,0],q[2,0]))))
        y0=max(0,int(np.floor(min(q[0,1],q[1,1],q[2,1]))))
        y1=min(height-1,int(np.ceil(max(q[0,1],q[1,1],q[2,1]))))
        a,b,c=q[0],q[1],q[2]
        den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den)<1e-10:continue
        for yi in range(y0,y1+1):
            y=yi+.5
            for xi in range(x0,x1+1):
                x=xi+.5
                u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den
                v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den
                w=1-u-v
                if u<0 or v<0 or w<0:continue
                reciprocal=u/a[2]+v/b[2]+w/c[2]
                if reciprocal<=0:continue
                z=1/reciprocal
                if z>=depth[yi,xi]+1e-8:continue
                for channel in range(3):
                    color=(u/a[2]*light[0,channel]+v/b[2]*light[1,channel]+w/c[2]*light[2,channel])*z
                    image[yi,xi,channel]=min(255.,max(0.,image[yi,xi,channel]*(1-opacity)+color*opacity))
                if opacity>=.999:depth[yi,xi]=z
    return image

for filename in [a for a in sys.argv[1:] if not a.startswith('--')]:
    data=json.loads(Path(filename).read_text())
    if 'meshes' not in data:continue
    width,height=data['width'],data['height']
    image=np.full((height,width,3),rgb('#1f2124' if theme=='cinema' else '#e9e4d8'))
    depth=np.full((height,width),np.inf)
    opaque=[];transparent=[]
    for mesh in data['meshes']:
        p=np.frombuffer(base64.b64decode(mesh['position']),dtype=np.float32).reshape(-1,3)
        n=np.frombuffer(base64.b64decode(mesh['normal']),dtype=np.float32).reshape(-1,3)
        idx=np.frombuffer(base64.b64decode(mesh['index']),dtype=np.uint32).reshape(-1,3)
        material=mesh[theme];color=rgb(material['color']);opacity=material['opacity']
        # Smooth light at vertices; metallic highlights remain restrained.
        diffuse=.48+.40*np.maximum(0,np.sum(n*key,axis=1))+.17*np.maximum(0,np.sum(n*fill,axis=1))
        light=color[None,:]*diffuse[:,None]
        triangles=p[idx]
        a,b,c=triangles[:,0,:],triangles[:,1,:],triangles[:,2,:]
        area=(b[:,1]-c[:,1])*(a[:,0]-c[:,0])+(c[:,0]-b[:,0])*(a[:,1]-c[:,1])
        valid=(triangles[:,:,2].min(axis=1)>.0001)&(triangles[:,:,0].max(axis=1)>=0)&(triangles[:,:,1].max(axis=1)>=0)&(triangles[:,:,0].min(axis=1)<width)&(triangles[:,:,1].min(axis=1)<height)&(np.abs(area)>.1)
        if not material['doubleSided']:valid&=area<0
        for tri in idx[valid]:
            q=p[tri]
            if np.any(q[:,2]<=.0001):continue
            if q[:,0].max()<0 or q[:,1].max()<0 or q[:,0].min()>=width or q[:,1].min()>=height:continue
            item=(q,light[tri],opacity)
            (transparent if opacity<.999 else opaque).append(item)
    transparent.sort(key=lambda item:-float(item[0][:,2].mean()))
    items=opaque+transparent
    if items:
        image=raster(np.stack([v[0] for v in items]),np.stack([v[1] for v in items]),np.array([v[2] for v in items]),image,depth)
    result=Image.fromarray(image.astype(np.uint8))
    if '--labels' in sys.argv:
        draw=ImageDraw.Draw(result);ink='#e7e5df' if theme=='cinema' else '#2a2824'
        for i,label in enumerate(data.get('labels',[])):
            x,y=label['x'],label['y'];left=x<width/2
            tx=16 if left else width-235;ty=80+i*32
            draw.line([(x,y),(tx+210 if left else tx,ty+7)],fill=ink,width=1)
            draw.ellipse((x-3,y-3,x+3,y+3),fill='#cc6328')
            draw.text((tx,ty),label['text'],fill=ink)
        draw.text((16,height-24),f"{data['name']} · CPU geometry inspection · {data['triangles']:,} triangles",fill=ink)
    suffix=('-cinema' if theme=='cinema' else '')+('-labels' if '--labels' in sys.argv else '')+'.png'
    dest=Path(filename).with_suffix('');dest=Path(str(dest)+suffix)
    result.save(dest)
    print(dest,flush=True)
