"""CPU orthographic source/decimated diagnostic, never labelled Blender output."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
WORK=HERE.parent/'cache'/'bones-joints'


def render(jobs, manifest, view, simplified):
    w,h=640,1080
    image=Image.new('RGB',(w,h),(243,239,229))
    draw=ImageDraw.Draw(image)
    centre=np.array([0,manifest['sourceCentre'][2],-manifest['sourceCentre'][1]])
    entries={j['name']:j for j in jobs}
    geometry=[]
    rig=json.loads((HERE/'anatomy-rig.json').read_text())
    elbow=next(j for j in rig['joints'] if j['name']=='elbow.l')
    for part in manifest['parts'][:34]:
        for name in part['sources']:
            job=entries[name]
            p=np.array(job['positions']).reshape((-1,3))-centre
            if view=='pose' and part['joint'] in ['elbow.l','forearm.l','hand.l']:
                axis=np.asarray(elbow['axes']['flexion']);a=np.radians(85)
                cross=np.array([[0,-axis[2],axis[1]],[axis[2],0,-axis[0]],[-axis[1],axis[0],0]])
                rot=np.eye(3)*np.cos(a)+(1-np.cos(a))*np.outer(axis,axis)+np.sin(a)*cross
                p=np.einsum('ni,ji->nj',p-np.asarray(elbow['position']),rot)+elbow['position']
            f=np.array(job['indices'] if simplified else job['sourceIndices']).reshape((-1,3))
            tri=p[f]
            if view=='back':tri=tri*np.array([-1,1,-1])
            if view=='left':tri=tri[:,:,[2,1,0]]*np.array([1,1,-1])
            normal=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);normal/=np.maximum(np.linalg.norm(normal,axis=1),1e-20)[:,None]
            shade=.55+.4*np.abs((normal*np.array([.3,.4,.866])).sum(axis=1))
            colour=np.clip(np.array([195,179,149])[None,:]*shade[:,None],0,255).astype('uint8')
            geometry.extend(zip(tri.mean(axis=1)[:,2],tri,colour))
    scale=530
    for depth,tri,colour in sorted(geometry,key=lambda x:x[0]):
        polygon=[(int(w/2+p[0]*scale),int(310-p[1]*scale)) for p in tri]
        draw.polygon(polygon,fill=tuple(colour))
    draw.text((24,18),f'{view.upper()} | '+('SIMPLIFIED' if simplified else 'SOURCE'),fill=(60,56,48))
    draw.text((24,h-45),'CPU orthographic diagnostic. Native Blender review: pending.',fill=(60,56,48))
    return image


if __name__=='__main__':
    jobs=json.loads((WORK/'surface-jobs.json').read_text())
    manifest=json.loads((HERE/'manifest.json').read_text())
    for view in ['front','back','left','pose']:
        canvas=Image.new('RGB',(1280,1080),(243,239,229))
        canvas.paste(render(jobs,manifest,view,False),(0,0))
        canvas.paste(render(jobs,manifest,view,True),(640,0))
        path=WORK/f'preview-{view}.png';canvas.save(path);print(path,flush=True)
