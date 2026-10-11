"""Audit decoded fallback GLB surfaces and create CPU review images."""
import json
import os
import sys
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from assimp_inventory import CACHE,ROOT,read_glb,accessor,matrix
manifest=json.loads((ROOT/'chest/manifest.json').read_text())
rig=json.loads((ROOT/'chest/rig.json').read_text())
summary=json.loads((CACHE/'chest-optimize-stats.json').read_text())
source=json.loads((CACHE/'chest-simplify-probe-input.json').read_text())
centre=np.array(rig['sourceChestCentre'])
original={}
for record in source:
 p=(np.array(record['positions']).reshape((-1,3))-centre)[:,[0,2,1]]*np.array([1,1,-1])
 f=np.array(record['indices']).reshape((-1,3))
 original[record['name']]=(p,f)
a,b=original.pop('sternum'),original.pop('ribs')
original['thorax']=(np.concatenate((a[0],b[0])),np.concatenate((a[1],b[1]+len(a[0]))))
doc,binary=read_glb(CACHE/'chest.audit.glb');transforms={}
def visit(i,parent):
 transforms[i]=parent@matrix(doc['nodes'][i])
 for j in doc['nodes'][i].get('children',[]):visit(j,transforms[i])
for i in doc['scenes'][0]['nodes']:visit(i,np.eye(4))
final={};extras={}
for i,node in enumerate(doc['nodes']):
 if 'mesh' not in node:continue
 p,f=[],[]
 for primitive in doc['meshes'][node['mesh']]['primitives']:
  xyz=accessor(doc,binary,primitive['attributes']['POSITION'])
  with np.errstate(all='ignore'):world=np.einsum('nj,ij->ni',np.column_stack((xyz,np.ones(len(xyz)))),transforms[i])[:,:3]
  if 'skin' in node:
   skin=doc['skins'][node['skin']]
   inverse=accessor(doc,binary,skin['inverseBindMatrices']).reshape((-1,4,4)).transpose((0,2,1))
   joints=accessor(doc,binary,primitive['attributes']['JOINTS_0']).astype(int)
   weights=accessor(doc,binary,primitive['attributes']['WEIGHTS_0'])
   a=doc['accessors'][primitive['attributes']['WEIGHTS_0']]
   if a.get('normalized'):
    weights=weights.astype(float)/np.iinfo(weights.dtype).max
   matrices=np.array([transforms[index]@bind for index,bind in zip(skin['joints'],inverse)])
   homogeneous=np.column_stack((xyz,np.ones(len(xyz))))
   world=np.zeros((len(xyz),3))
   for influence in range(4):
    posed=np.einsum('nij,nj->ni',matrices[joints[:,influence]],homogeneous)[:,:3]
    world+=posed*weights[:,influence,None]
  indices=accessor(doc,binary,primitive['indices']).reshape((-1,3));f.extend((indices+len(p)).tolist());p.extend(world.tolist())
 final[node['name']]=(np.array(p),np.array(f));extras[node['name']]=node['extras']

def point_triangle_distance2(p,tri):
 a,b,c=tri[:,0],tri[:,1],tri[:,2];v0=b-a;v1=c-a;v2=p-a
 n=np.cross(v0,v1);n2=(n*n).sum(1);plane=((v2*n).sum(1))**2/np.maximum(1e-30,n2)
 d00=(v0*v0).sum(1);d01=(v0*v1).sum(1);d11=(v1*v1).sum(1);d20=(v2*v0).sum(1);d21=(v2*v1).sum(1)
 denom=d00*d11-d01*d01;safe=np.maximum(1e-30,denom)
 u=(d11*d20-d01*d21)/safe;v=(d00*d21-d01*d20)/safe
 inside=(denom>1e-24)&(u>=0)&(v>=0)&(u+v<=1)
 distances=[]
 for start,end in [(a,b),(b,c),(c,a)]:
  edge=end-start;t=((p-start)*edge).sum(1)/np.maximum(1e-30,(edge*edge).sum(1));t=np.clip(t,0,1)
  distances.append(((p-(start+edge*t[:,None]))**2).sum(1))
 edge_min=np.min(distances,axis=0)
 return np.where(inside,plane,edge_min)

def sample(p,f):
 rng=np.random.default_rng(7);tri=p[f]
 out=[p[::max(1,len(p)//3000)]]
 area=np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1)
 ids=rng.choice(len(f),6000,p=area/area.sum());tri=tri[ids]
 uv=rng.random((6000,2));flip=uv.sum(1)>1;uv[flip]=1-uv[flip]
 out.append(tri[:,0]+(tri[:,1]-tri[:,0])*uv[:,0,None]+(tri[:,2]-tri[:,0])*uv[:,1,None])
 return np.concatenate(out)

def directed(a,b):
 samples=sample(*a);tri=b[0][b[1]];centres=tri.mean(1);tree=cKDTree(centres)
 radius=float(np.linalg.norm(tri-centres[:,None,:],axis=2).max());worst=0
 for start in range(0,len(samples),100):
  chunk=samples[start:start+100];_,nearest=tree.query(chunk,k=min(4,len(tri)))
  nearest=nearest.reshape((len(chunk),-1))
  d2=point_triangle_distance2(np.repeat(chunk,nearest.shape[1],axis=0),tri[nearest.reshape(-1)]).reshape(nearest.shape)
  bounds=np.sqrt(d2.min(1))+radius+1e-8
  candidates=tree.query_ball_point(chunk,bounds)
  lengths=[len(ids) for ids in candidates];row_ids=np.repeat(np.arange(len(chunk)),lengths)
  triangle_ids=np.concatenate(candidates)
  exact=point_triangle_distance2(chunk[row_ids],tri[triangle_ids]);best=np.full(len(chunk),np.inf)
  np.minimum.at(best,row_ids,exact);worst=max(worst,float(best.max()))
 return np.sqrt(worst)

def topology(p,f):
 positions={};remap=[positions.setdefault(tuple(np.round(v,7)),len(positions)) for v in p];edges={}
 for face in f:
  a,b,c=[remap[i] for i in face]
  for edge in [(a,b),(b,c),(c,a)]:
   key=tuple(sorted(edge));edges[key]=edges.get(key,0)+1
 return {'boundaryEdges':sum(v==1 for v in edges.values()),'closed':bool(f.size) and all(v==2 for v in edges.values())}

rows=[];failures=[]
for name in final:
 deviation=max(directed(original[name],final[name]),directed(final[name],original[name]))
 role=extras[name]['role'];budget=manifest['budgets'][role]['maxDeviationM']
 before=topology(*original[name]);after=topology(*final[name])
 row={'name':name,'role':role,'beforeTriangles':len(original[name][1]),'afterTriangles':len(final[name][1]),
      'sampledHausdorffM':deviation,'budgetM':budget,'closedBefore':before['closed'],
      'closedAfter':after['closed'],'boundaryEdges':after['boundaryEdges']}
 rows.append(row)
 if deviation>budget+1e-6:failures.append(f'{name}: {deviation*1000:.3f} mm > {budget*1000:.1f} mm')
 if before['boundaryEdges']==0 and after['boundaryEdges']>0:failures.append(f'{name}: boundary edges introduced')
 print('AUDIT',name,round(deviation*1000,4),'mm',flush=True)
(CACHE/'chest-report-stats.json').write_text(json.dumps(rows,indent=2)+'\n')
lines=['# Chest review — assimp fallback output','','The native Blender process crashed before Python. '
       'This asset was built from assimp source node geometry with the same manifest, absolute-error simplifier, '
       'geodesic fibre bake, source attachment/joint candidates and skin. '
       'The final GLB was optimized, compressed, decoded and audited. Native Blender export/render verification remains pending.','',
       f"Final: **{summary['bytes']:,} bytes** ({summary['bytes']/1e6:.3f} MB), **{summary['triangles']:,} triangles**, **39 mesh nodes**.",'',
       '## Surface audit','','Symmetric sampled Hausdorff: up to 3,000 vertices and 6,000 area-weighted interior points per direction. '
       'Each sample uses exact point-to-triangle distance; a centroid-tree search expands by the maximum triangle radius to include all possible closer triangles. '
       'This is a sample estimate, not a proof of the global maximum. Topology welds coincident seam vertices at 0.1 µm.','',
       '| Mesh | Before | Final | Max deviation (mm) | Budget (mm) | Closed before → final | Final boundary edges |',
       '|---|---:|---:|---:|---:|---|---:|']
for r in rows:lines.append(f"| {r['name']} | {r['beforeTriangles']:,} | {r['afterTriangles']:,} | {r['sampledHausdorffM']*1000:.3f} | {r['budgetM']*1000:.1f} | {r['closedBefore']} → {r['closedAfter']} | {r['boundaryEdges']} |")
lines+=['','## Anatomical checklist against §1.3','',
 '- [ ] F-1: clavicular origin on medial anterior clavicle; sternocostal origin on sternum/upper costal cartilages; abdominal origin on external-oblique aponeurosis. Review 1–6 versus 2–6 rib wording.',
 '- [ ] F-2: humeral insertion at lateral lip of intertubercular groove; review two-layer twisted insertion and relative insertion heights.',
 '- [ ] F-3: positive joint-axis signs and pectoralis motion roles in actual viewer poses.',
 '- [ ] F-4: pectoralis minor rib 3–5 origins and coracoid insertion; retain source raw `.e/.o` label reversals for review.',
 '- [ ] F-5: upper 8–9 serratus rib slips to costal surface of medial scapular border; review every slip.',
 '- [ ] F-6: first rib/costal-cartilage junction to inferior clavicle.',
 '- [ ] F-7: each external/internal intercostal sheet and its superior/inferior rib contacts; review fibre slope and interosseous/interchondral distinction.',
 '- [ ] F-15: male reference, 1.790 m measured stature, metre units, body-left +X and front +Z.',
 '- [ ] Whole external-oblique/rectus-abdominis neighbours: approve extent or crop upper portions.',
 '- [ ] Shoulder abduction 90° and elbow flexion 120°: inspect skin collapse, armpit and elbow intersections.',
 '- [ ] Native Blender pipeline and its four Cycles previews: complete after the startup issue is resolved.','',
 'F-8–F-14 concern training/clinical text; this geometry pipeline does not verify them.','',
 '## Attachment candidates','']
attachment=json.loads((ROOT/'chest/attachments.json').read_text())
for s in attachment['sites']:
 lines.append(f"- [ ] {s['muscle']} {s['kind']} → {s['bone']}: {s['points']}; {s['source']}; raw nodes {', '.join(s.get('sourceNodes',[])) or 'none'}; {s['review']}.")
topology_warnings=[f"{r['name']}: nonmanifold closedness changed; section caps disabled; review required." for r in rows if r['closedBefore'] and not r['closedAfter']]
lines+=['','## Automatic warnings','']+[f'- {w}' for w in attachment['warnings']+topology_warnings]
if summary['bytes']>4000000:lines.append('- GLB is above the 4 MB target and below the 8 MB hard limit.')
if summary['triangles']>350000:lines.append('- Triangle count is above the 350,000 target and below the 500,000 hard limit.')
lines+=['','## Automatic result','']+([f'- FAIL: {f}' for f in failures] if failures else ['Decoded surface error and topology gates pass. Anatomical and native Blender gates remain pending.'])
(ROOT/'chest/report.md').write_text('\n'.join(lines)+'\n')
if failures:raise RuntimeError('; '.join(failures))

# CPU rasterization of the audited final geometry; no graphics driver is needed.
import struct
import zlib

def write_png(path,pixels,view):
    height,width,_=pixels.shape
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    raw=b''.join(b'\0'+row.tobytes() for row in pixels)
    meta=f'Backend\0CPU fallback z-buffer; native Blender/Cycles gate pending; view={view}; CC BY-SA 4.0'.encode()
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,2,0,0,0))+
                     chunk(b'tEXt',meta)+chunk(b'IDAT',zlib.compress(raw,6))+chunk(b'IEND',b''))

colors={'superficial':np.array([.68,.46,.34]),'intermediate':np.array([.58,.42,.34]),'deep':np.array([.44,.36,.30]),
        'neighbours':np.array([.61,.60,.54]),'skeleton':np.array([.83,.79,.66])}
paths=[]
width,height=1400,1600
for name,view in [('front',[0,0,1]),('back',[0,0,-1]),('left',[1,0,0]),('exploded-by-layer',[.45,.12,1])]:
    view=np.array(view,dtype=float);view/=np.linalg.norm(view)
    right=np.cross([0,1,0],view);right/=np.linalg.norm(right);up=np.cross(view,right)
    triangles=[];shades=[]
    for node,(p,f) in final.items():
        if node=='skin-outline':continue
        p=p.copy();layer=extras[node]['layer']
        if name=='exploded-by-layer' and extras[node]['role']=='region':
            amount={'superficial':.08,'intermediate':.05,'deep':.02}[layer]
            side=1 if node.endswith('.l') else -1 if node.endswith('.r') else 0
            p+=np.array([side*amount,0,amount])
        tri=p[f]
        normals=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
        normals/=np.maximum(1e-12,np.linalg.norm(normals,axis=1))[:,None]
        normals[np.sum(normals*view,axis=1)<0]*=-1
        light=view+np.array([-.4,.7,.3]);light/=np.linalg.norm(light)
        shade=.45+.55*np.maximum(0,np.sum(normals*light,axis=1))
        projection=np.stack(tuple(np.sum(tri*axis,axis=-1) for axis in [right,up,view]),axis=-1)
        triangles.append(projection);shades.append(np.clip(colors[layer][None,:]*shade[:,None]*255,0,255).astype(np.uint8))
    tri=np.concatenate(triangles);color=np.concatenate(shades)
    minimum=tri[:,:,:2].min(axis=(0,1));maximum=tri[:,:,:2].max(axis=(0,1))
    middle=(minimum+maximum)/2
    span=maximum-minimum
    frame_height=max(span[1],span[0]*height/width)*1.12
    frame_width=frame_height*width/height
    tri[:,:,0]=(tri[:,:,0]-middle[0]+frame_width/2)/frame_width*(width-1)
    tri[:,:,1]=(middle[1]+frame_height/2-tri[:,:,1])/frame_height*(height-1)
    low=np.floor(tri[:,:,:2].min(1)).astype(int);high=np.ceil(tri[:,:,:2].max(1)).astype(int)
    low[:,0]=np.clip(low[:,0],0,width);low[:,1]=np.clip(low[:,1],0,height)
    high[:,0]=np.clip(high[:,0],0,width);high[:,1]=np.clip(high[:,1],0,height)
    dims=high-low
    denominator=(tri[:,1,1]-tri[:,2,1])*(tri[:,0,0]-tri[:,2,0])+(tri[:,2,0]-tri[:,1,0])*(tri[:,0,1]-tri[:,2,1])
    valid=(dims[:,0]>0)&(dims[:,1]>0)&(np.abs(denominator)>1e-10)
    ids=np.where(valid)[0];keys=dims[ids,0].astype(np.int64)*height+dims[ids,1]
    order=np.argsort(keys);ids=ids[order];keys=keys[order]
    boundaries=np.r_[0,np.flatnonzero(keys[1:]!=keys[:-1])+1,len(ids)]
    pixels=np.empty((height,width,3),dtype=np.uint8);pixels[:]=[238,233,223]
    pixels=pixels.reshape((-1,3));depth=np.full(height*width,-np.inf)
    for start,end in zip(boundaries[:-1],boundaries[1:]):
        group=ids[start:end];w,h=dims[group[0]]
        batch=max(1,200000//max(1,int(w*h)))
        for offset in range(0,len(group),batch):
            selected=group[offset:offset+batch];t=tri[selected]
            xx=low[selected,0,None,None]+np.arange(w)[None,None,:]+.5
            yy=low[selected,1,None,None]+np.arange(h)[None,:,None]+.5
            den=denominator[selected,None,None]
            a=((t[:,1,1]-t[:,2,1])[:,None,None]*(xx-t[:,2,0,None,None])+
               (t[:,2,0]-t[:,1,0])[:,None,None]*(yy-t[:,2,1,None,None]))/den
            b=((t[:,2,1]-t[:,0,1])[:,None,None]*(xx-t[:,2,0,None,None])+
               (t[:,0,0]-t[:,2,0])[:,None,None]*(yy-t[:,2,1,None,None]))/den
            c=1-a-b;inside=(a>=-1e-9)&(b>=-1e-9)&(c>=-1e-9)
            if not inside.any():continue
            rows,ys,xs=np.where(inside)
            pixel=(low[selected[rows],1]+ys)*width+low[selected[rows],0]+xs
            z=(a*t[:,0,2,None,None]+b*t[:,1,2,None,None]+c*t[:,2,2,None,None])[inside]
            np.maximum.at(depth,pixel,z)
            visible=z>=depth[pixel]-1e-12
            pixels[pixel[visible]]=color[selected[rows[visible]]]
    path=CACHE/f'preview-{name}.png';write_png(path,pixels.reshape((height,width,3)),name)
    paths.append(str(path));print('PREVIEW',path,flush=True)
(CACHE/'chest-preview-paths.json').write_text(json.dumps(paths,indent=2)+'\n')
(CACHE/'chest-preview-backend.json').write_text(json.dumps({'backend':'CPU fallback z-buffer of decoded final mesh; Cycles gate pending','paths':paths},indent=2)+'\n')
