import os,json,math
import numpy as np
from PIL import Image,ImageDraw
from numba import njit

@njit(cache=True)
def drawtri(screen,zs,colors,normals,W,H):
    canvas=np.ones((H,W,3),dtype=np.float64)
    canvas[:,:,0]=0.89;canvas[:,:,1]=0.87;canvas[:,:,2]=0.82
    depth=np.ones((H,W))*1e9
    light=np.array([-.45,.80,.6]);light=light/np.sqrt((light*light).sum())
    for k in range(len(screen)):
        p=screen[k];z=zs[k];col=colors[k];nor=normals[k]
        x0=max(0,int(np.floor(p[:,0].min())));x1=min(W-1,int(np.ceil(p[:,0].max())))
        y0=max(0,int(np.floor(p[:,1].min())));y1=min(H-1,int(np.ceil(p[:,1].max())))
        den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
        if abs(den)<1e-9:continue
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                a=((p[1,1]-p[2,1])*(x-p[2,0])+(p[2,0]-p[1,0])*(y-p[2,1]))/den
                b=((p[2,1]-p[0,1])*(x-p[2,0])+(p[0,0]-p[2,0])*(y-p[2,1]))/den;c=1-a-b
                if a < -1e-6 or b < -1e-6 or c < -1e-6:continue
                zz=a*z[0]+b*z[1]+c*z[2]
                if zz>=depth[y,x]:continue
                depth[y,x]=zz
                n=a*nor[0]+b*nor[1]+c*nor[2];length=np.sqrt((n*n).sum())
                if length>0:n=n/length
                shade=.48+.52*max(0,(n*light).sum())
                cc=(a*col[0]+b*col[1]+c*col[2])*shade
                canvas[y,x]=np.minimum(1,np.maximum(0,cc))**(1/2.2)
    return (canvas*255).astype(np.uint8)

path='/tmp/atlas-living-botanical'
data=json.load(open(path+'/geometry.json'))
for name,obj in data.items():
    tri=np.array(obj['triangles']).reshape(-1,3,3);colors=np.array(obj['colours']).reshape(-1,3,3)
    nor=np.array(obj['normals']).reshape(-1,3,3) if 'normals' in obj else np.repeat(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])[:,None,:],3,axis=1)
    frames=[]
    for angle,(az,el) in enumerate(([(35,24),(130,24),(25,68)] if name!="mushroom" else [(35,-18),(130,-12),(25,68)])):
        az,el=math.radians(az),math.radians(el)
        front=np.array([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)])
        right=np.cross(np.array([0,1,0]),front);right=right/np.linalg.norm(right);up=np.cross(front,right)
        x=np.sum(tri*right,axis=2);y=np.sum(tri*up,axis=2);z=-np.sum(tri*front,axis=2)
        xmin,xmax=x.min(),x.max();ymin,ymax=y.min(),y.max();scale=540/max(xmax-xmin,ymax-ymin)
        xy=np.stack([(x-(xmin+xmax)/2)*scale+320,320-(y-(ymin+ymax)/2)*scale],axis=-1)
        visible=np.sum(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])*front,axis=1)>0
        arr=drawtri(xy[visible],z[visible],colors[visible],nor[visible],640,640);im=Image.fromarray(arr);ImageDraw.Draw(im).text((14,14),name+f' / {angle+1}',fill='#302c24');im.save(path+f'/{name}-{angle+1}.png');frames.append(im)
    grid=Image.new('RGB',(1920,640));[grid.paste(im,(i*640,0)) for i,im in enumerate(frames)];grid.save(path+f'/{name}-angles.png')
    print(name,flush=True)
