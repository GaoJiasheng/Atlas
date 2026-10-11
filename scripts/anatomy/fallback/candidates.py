"""Source-only candidate evidence while Blender startup is blocked."""
import json
import re
import sys
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from assimp_inventory import CACHE,ROOT,read_glb,accessor,matrix,matches
from surface import Surface
manifest=json.loads((ROOT/'chest/manifest.json').read_text())
entries=json.loads((CACHE/'inventory.json').read_text())['objects']
jobs=json.loads((CACHE/'chest-simplify-probe-input.json').read_text())
points={r['name']:np.array(r['positions']).reshape((-1,3)) for r in jobs}
faces={r['name']:np.array(r['indices']).reshape((-1,3)) for r in jobs}
centre=points['sternum'].mean(0)
manubrium=next(e for e in entries if e['name']=='Manubrium of sternum' and e['system']=='skeleton')
centre=np.array(manubrium['centroid']);centre[2]=manubrium['boundingBox']['min'][2]
def target(p):
 return (np.asarray(p)-centre)[[0,2,1]]*np.array([1,1,-1])
def vector(p):return np.asarray(p)[[0,2,1]]*np.array([1,1,-1])
def unit(p):return np.asarray(p)/np.linalg.norm(p)
area_points={}
doc,binary=read_glb(CACHE/'skeleton-fallback.glb')
transforms={}
def visit(i,parent):
 transforms[i]=parent@matrix(doc['nodes'][i])
 for j in doc['nodes'][i].get('children',[]):visit(j,transforms[i])
for i in doc['scenes'][0]['nodes']:visit(i,np.eye(4))
for i,node in enumerate(doc['nodes']):
 name=node.get('name','')
 is_area=bool(re.search(r'\.[oe](?:\d*[lr])?$',name))
 is_pelvis=name in ['Hip bone.l','Hip bone.r','Sacrum']
 if 'mesh' not in node or not (is_area or is_pelvis):continue
 chunks=[];indices=[];offset=0
 for p in doc['meshes'][node['mesh']]['primitives']:
  xyz=accessor(doc,binary,p['attributes']['POSITION'])
  with np.errstate(all='ignore'):world=np.einsum('nj,ij->ni',np.column_stack((xyz,np.ones(len(xyz)))),transforms[i])[:,:3]
  chunks.append(world[:,[0,2,1]]*np.array([.01,-.01,.01]))
  indices.append(accessor(doc,binary,p['indices']).reshape((-1,3))+offset)
  offset+=len(xyz)
 cloud=np.concatenate(chunks)
 if is_area:area_points[name]=cloud
 else:points[name]=cloud;faces[name]=np.concatenate(indices)

surfaces={}
def surface(key):
 if key not in surfaces:surfaces[key]=Surface(points[key],faces[key])
 return surfaces[key]

def references(ids,side):
 result=[]
 for id in ids:
  if id=='pelvis':
   keys=['Hip bone.'+side,'Sacrum'] if side else ['Hip bone.l','Hip bone.r','Sacrum']
   result.extend((id,surface(key)) for key in keys)
   continue
  key=id+('.'+side if side and id in ['clavicle','scapula','humerus','forearm','external-oblique'] else '')
  if key in points:result.append((id,surface(key)))
 return result
sites=[];warnings=[];regions={}
for part in manifest['parts']:
 if part['role'] not in ['region','neighbour']:continue
 for side in ['l','r'] if part['sides']=='bilateral' else [None]:
  name=part['id']+('.'+side if side else '')
  muscle=cKDTree(points[name]);owners=part.get('attachmentOwners',part['objects'])
  areas=[e for e in entries if e.get('attachment',{}).get('owner') in owners and
         e['attachment']['kind'] in ['origin','insertion'] and (side is None or e['side']==side)]
  for kind in ['origin','insertion']:
   trees=references(part[kind],side)
   others=references(part['insertion' if kind=='origin' else 'origin'],side)
   found=[];region_points=[]
   for area in areas:
    c=np.array(area['centroid'])
    distance,bone=min(((tree.query(c)[0],id) for id,tree in trees),default=(float('inf'),part[kind][0]))
    opposite=min((tree.query(c)[0] for _,tree in others),default=float('inf'))
    semantic=kind if distance+.002<opposite else ('insertion' if kind=='origin' else 'origin') if opposite+.002<distance else area['attachment']['kind']
    if semantic!=kind or muscle.query(c)[0]>.025:continue
    cloud=area_points[area['name']]
    if len(cloud)>16:
     axis=int(np.argmax(cloud.max(0)-cloud.min(0)));ordered=cloud[np.argsort(cloud[:,axis])]
     samples=[chunk.mean(0) for chunk in np.array_split(ordered,3)]
    else:samples=[c]
    site={'muscle':name,'kind':kind,'bone':bone,'points':[target(p).tolist() for p in samples],
          'centroid':target(c).tolist(),'source':'.o/.e mesh','sourceNodes':[area['name']],
          'rawMarkerKind':area['attachment']['kind'],'classification':'source-only named-surface triangle distance',
          'boneSurfaceDistanceM':float(distance),'review':'pending — source-only fallback'}
    found.append(site)
    region_points.extend(target(p).tolist() for p in cloud)
   if not found:
    for bone,tree in trees:
     distances,_=tree.query(points[name]);contact=points[name][distances<=.002]
     if len(contact):
      c=contact.mean(0)
      found.append({'muscle':name,'kind':kind,'bone':bone,'points':[target(c).tolist()],
                    'centroid':target(c).tolist(),'source':'proximity','thresholdM':.002,
                    'vertexCount':len(contact),'review':'pending — vertex-to-bone-surface proximity'})
      region_points.extend(target(p).tolist() for p in contact)
   if not found and trees:
    choices=[(float(distances.min()),bone,distances) for bone,tree in trees for distances in [tree.query(points[name])[0]]]
    distance,bone,distances=min(choices,key=lambda item:item[0])
    cloud=points[name][distances<=distance+.001];c=cloud.mean(0)
    found.append({'muscle':name,'kind':kind,'bone':bone,'points':[target(c).tolist()],
                  'centroid':target(c).tolist(),'source':'proximity','thresholdM':.002,
                  'withinThreshold':False,'nearestDistanceM':distance,
                  'review':'REQUIRED: no vertices within 2 mm'})
    region_points.extend(target(p).tolist() for p in cloud)
    warnings.append(f'{name} {kind}: no 2 mm bone-surface contact; nearest {distance*1000:.2f} mm')
   if not found:raise RuntimeError(f'No attachment reference surface for {name} {kind}')
   sites.extend(found)
   regions[name+':'+kind]=region_points
(CACHE/'chest-attachment-regions.json').write_text(json.dumps(regions)+'\n')
(ROOT/'chest/attachments.json').write_text(json.dumps({'license':'CC BY-SA 4.0','units':'m',
 'status':'source-only candidates; Blender bake and anatomical review pending','sites':sites,'warnings':warnings},indent=2)+'\n')
def landmark(owner,side):
 areas=[e for e in entries if e['system']=='skeleton' and e.get('attachment',{}).get('owner')==owner and e['attachment']['kind']=='landmark' and e['side']==side and e['type']=='MESH']
 if not areas:return None
 a=min(areas,key=lambda e:(abs(e['triangles']-12),e['triangles']))
 return np.array(a['centroid'])
joints=[{'name':'trunk','position':centre,'parent':None,'source':'sternal-angle frame'}]
for side in ['l','r']:
 scapula=landmark('Glenoid process of scapula',side)
 head=landmark('Head of humerus',side)
 h=points['humerus.'+side]
 patch=h[np.linalg.norm(h-head,axis=1)<.022] if head is not None else h[h[:,2]>h[:,2].max()-.025]
 a=np.column_stack((2*patch,np.ones(len(patch))));solution=np.linalg.lstsq(a,(patch*patch).sum(1),rcond=None)[0]
 shoulder=solution[:3]
 med=landmark('Medial epicondyle of humerus',side);lat=landmark('Lateral epicondyle of humerus',side)
 elbow=(med+lat)/2
 wrist=landmark('Ulnar styloid process',side)
 for name,pos,parent,source in [('scapula',scapula,'trunk','glenoid marker'),('shoulder',shoulder,'scapula.'+side,'humeral head sphere fit'),('elbow',elbow,'shoulder.'+side,'midpoint of epicondyle markers'),('wrist',wrist,'elbow.'+side,'ulnar styloid marker')]:
  sign=1 if side=='l' else -1;flexion=np.array([-1,0,0]);rotation=unit(vector(elbow-shoulder)) if name=='shoulder' else unit(vector(wrist-elbow)) if name=='elbow' else np.array([0,1,0])
  if name=='elbow':
   flexion=unit(vector(lat-med))
   if flexion[0]>0:flexion=-flexion
  joints.append({'name':name+'.'+side,'position':pos,'parent':parent,'source':source,
                 'axes':{'flexion':flexion.tolist(),'abduction':[0,0,sign],'rotation':rotation.tolist()}})
for j in joints:
 j['node']='joint.'+j['name'];j['position']=target(j['position']).tolist();j['review']='pending — source-only fallback'
 j.setdefault('axes',{'flexion':[-1,0,0],'abduction':[0,0,1],'rotation':[0,1,0]})
stature=max(e['boundingBox']['max'][2] for e in entries if e['system']=='regions')-min(e['boundingBox']['min'][2] for e in entries if e['system']=='regions')
check={'sternum':target(points['sternum'].mean(0)).tolist(),'leftClavicle':target(points['clavicle.l'].mean(0)).tolist(),
       'thoracicSpine':target(points['thoracic-spine'].mean(0)).tolist(),'statureM':stature}
check['leftPositiveX']=check['leftClavicle'][0]>check['sternum'][0]+.02
check['sternumAnteriorPositiveZ']=check['sternum'][2]>check['thoracicSpine'][2]
assert check['leftPositiveX'] and check['sternumAnteriorPositiveZ'] and 1.4<stature<2.2
(ROOT/'chest/rig.json').write_text(json.dumps({'license':'CC BY-SA 4.0','units':'m','coordinates':manifest['coordinates'],
 'status':'source-only rig candidates; Blender skin/export pending','sourceChestCentre':centre.tolist(),
 'floorY':min(e['boundingBox']['min'][2] for e in entries if e['system']=='regions')-centre[2],
 'coordinateCheck':check,'joints':joints},indent=2)+'\n')
print('CANDIDATES',len(sites),'RIG',len(joints),'CHECK',json.dumps(check))
