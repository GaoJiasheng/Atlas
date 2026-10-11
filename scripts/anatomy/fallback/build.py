"""Assimp-source fallback export while the native Blender process is unavailable."""
import heapq
import json
import math
import struct
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'cache'
manifest=json.loads((ROOT/'chest/manifest.json').read_text())
rig=json.loads((ROOT/'chest/rig.json').read_text())
sites=json.loads((ROOT/'chest/attachments.json').read_text())['sites']
regions=json.loads((CACHE/'chest-attachment-regions.json').read_text())
jobs={j['name']:j for j in json.loads((CACHE/'chest-simplify-probe-input.json').read_text())}
results=json.loads((CACHE/'chest-simplify-probe-output.json').read_text())
centre=np.array(rig['sourceChestCentre'])
joint_names=[j['name'] for j in rig['joints']]
joint_positions=np.array([j['position'] for j in rig['joints']])
parts={p['id']:p for p in manifest['parts']}
records={}

def target(points):
 return (points-centre)[:,[0,2,1]]*np.array([1,1,-1])

def unit_rows(v):
 lengths=np.linalg.norm(v,axis=1)
 v[lengths>1e-12]/=lengths[lengths>1e-12,None]
 v[lengths<=1e-12]=[0,1,0]
 return v

def topology(p,f):
 ids={};remap=[ids.setdefault(tuple(np.round(v,7)),len(ids)) for v in p]
 edges={}
 for face in f:
  a,b,c=[remap[i] for i in face]
  for pair in [(a,b),(b,c),(c,a)]:
   key=tuple(sorted(pair));edges[key]=edges.get(key,0)+1
 return {'boundaryEdges':sum(n==1 for n in edges.values()),'nonmanifoldEdges':sum(n!=2 for n in edges.values()),'closed':all(n==2 for n in edges.values())}

def adjacency(f,n):
 graph=[set() for _ in range(n)]
 for a,b,c in f:
  graph[a].update([b,c]);graph[b].update([a,c]);graph[c].update([a,b])
 return graph

def distances(p,graph,seeds):
 d=np.full(len(p),np.inf);queue=[]
 for i in seeds:d[i]=0;heapq.heappush(queue,(0,i))
 while queue:
  distance,i=heapq.heappop(queue)
  if distance!=d[i]:continue
  for j in graph[i]:
   value=distance+np.linalg.norm(p[j]-p[i])
   if value<d[j]:d[j]=value;heapq.heappush(queue,(value,j))
 return d

def components(graph):
 unseen=set(range(len(graph)));result=[]
 while unseen:
  nodes=set();stack=[unseen.pop()]
  while stack:
   i=stack.pop();nodes.add(i)
   for j in graph[i]:
    if j in unseen:unseen.remove(j);stack.append(j)
  result.append(nodes)
 return result

def reference_points(ids,side):
 refs=[]
 for id in ids:
  name=id+('.'+side if side and id in ['clavicle','scapula','humerus','forearm','external-oblique'] else '')
  if name in jobs:refs.append(target(np.array(jobs[name]['positions']).reshape((-1,3))))
 return np.concatenate(refs) if refs else None

def endpoint_seeds(name,kind,p,part,side):
 cloud=regions.get(name+':'+kind)
 if cloud:return set(cKDTree(p).query(np.array(cloud))[1].tolist())
 candidates=[s for s in sites if s['muscle']==name and s['kind']==kind]
 if candidates:
  candidate_points=np.array([q for s in candidates for q in s['points']])
  return set(cKDTree(p).query(candidate_points)[1].tolist())
 refs=reference_points(part[kind],side)
 if refs is not None:
  d,_=cKDTree(refs).query(p)
  ids=np.where(d<=.002)[0]
  if not len(ids):ids=np.where(d<=d.min()+.001)[0]
  return set(ids.tolist())
 return {int(np.argmax(p[:,1]) if kind=='origin' else np.argmin(p[:,1]))}

def bone_joint(id,side):
 return {'clavicle':'scapula','scapula':'scapula','humerus':'shoulder','forearm':'elbow'}.get(id,'trunk')+('.'+side if side and id in ['clavicle','scapula','humerus','forearm'] else '')

def bake(name,p,f,part,side):
 graph=adjacency(f,len(p));groups=components(graph)
 origin=endpoint_seeds(name,'origin',p,part,side);insertion=endpoint_seeds(name,'insertion',p,part,side)
 if part['origin']==part['insertion']:
  origin=set();insertion=set()
  for group in groups:
   ids=np.array(sorted(group));height=p[ids,1];span=max(.0001,float(height.max()-height.min()))
   origin.update(ids[height>=height.max()-min(.002,span*.15)].tolist())
   insertion.update(ids[height<=height.min()+min(.002,span*.15)].tolist())
 insertion-=origin
 if not insertion:
  c=p[list(origin)].mean(0);insertion={int(np.argmax(np.linalg.norm(p-c,axis=1)))};origin-=insertion
 otree,itree=cKDTree(p[list(origin)]),cKDTree(p[list(insertion)])
 for group in groups:
  ids=np.array(sorted(group))
  if not group&origin:origin.add(int(ids[np.argmin(otree.query(p[ids])[0])]))
  if not group&insertion:
   ids=np.array(sorted(group-origin))
   if len(ids):insertion.add(int(ids[np.argmin(itree.query(p[ids])[0])]))
 do,di=distances(p,graph,origin),distances(p,graph,insertion)
 with np.errstate(all='ignore'):u=do/(do+di)
 u[~np.isfinite(u)]=.5;u[list(origin)]=0;u[list(insertion)]=1
 a,b,c=p[f[:,0]],p[f[:,1]],p[f[:,2]];e1,e2=b-a,c-a
 n=np.cross(e1,e2);area=np.linalg.norm(n,axis=1);den=(n*n).sum(1);den[den<1e-20]=1
 gradients=(np.cross(e2,n)*(u[f[:,1]]-u[f[:,0]])[:,None]+np.cross(n,e1)*(u[f[:,2]]-u[f[:,0]])[:,None])/den[:,None]
 fibre=np.zeros_like(p);normal=np.zeros_like(p)
 for corner in range(3):np.add.at(fibre,f[:,corner],gradients*area[:,None]);np.add.at(normal,f[:,corner],n)
 start,end=p[list(origin)].mean(0),p[list(insertion)].mean(0)
 fallback=end-start
 for i in np.where(np.linalg.norm(fibre,axis=1)<1e-10)[0]:
  value=sum((p[j]-p[i])*(u[j]-u[i]) for j in graph[i])
  fibre[i]=value if np.linalg.norm(value)>1e-10 else fallback
 fibre=unit_rows(fibre);normal=unit_rows(normal)
 axis=end-start;axis/=max(1e-12,np.linalg.norm(axis))
 radial=np.cross(axis,[0,1,0])
 if np.linalg.norm(radial)<.01:radial=np.cross(axis,[1,0,0])
 radial/=max(1e-12,np.linalg.norm(radial));radial_b=np.cross(axis,radial)
 delta=p-(start[None,:]*(1-u[:,None])+end[None,:]*u[:,None])
 uv=np.column_stack((u,np.arctan2(np.sum(delta*radial_b,axis=1),np.sum(delta*radial,axis=1))/(2*np.pi)+.5))
 ji=np.zeros((len(p),4),dtype=np.uint16);weights=np.zeros((len(p),4),dtype=np.float32)
 proximal,distal=bone_joint(part['origin'][0],side),bone_joint(part['insertion'][0],side)
 proximal_by_vertex=[proximal]*len(p)
 if len(part['origin'])>1:
  references=[]
  for bone in part['origin']:
   cloud=reference_points([bone],side)
   if cloud is not None:references.append((bone,cKDTree(cloud)))
  for group in groups:
   ids=np.array(sorted(group&origin))
   if len(ids) and references:
    bone=min(references,key=lambda item:item[1].query(p[ids])[0].mean())[0]
    for i in group:proximal_by_vertex[i]=bone_joint(bone,side)
 w=u*u*(3-2*u)
 for i,value in enumerate(u):
  proximal=proximal_by_vertex[i]
  if proximal==distal:ji[i,0]=joint_names.index(proximal);weights[i,0]=1
  elif proximal=='scapula.'+str(side) and distal=='elbow.'+str(side):
   a,b=(proximal,'shoulder.'+side) if value<.5 else ('shoulder.'+side,distal)
   t=value*2 if value<.5 else (value-.5)*2;t=t*t*(3-2*t)
   ji[i,:2]=[joint_names.index(a),joint_names.index(b)];weights[i,:2]=[1-t,t]
  else:
   ji[i,:2]=[joint_names.index(proximal),joint_names.index(distal)];weights[i,:2]=[1-w[i],w[i]]
 attrs={'POSITION':p,'NORMAL':normal,'_U':u[:,None],'_FIBRE':fibre,'TEXCOORD_0':uv,'JOINTS_0':ji,'WEIGHTS_0':weights}
 # Split only UV seam corners; geometric topology remains welded by position.
 indices=f.copy();duplicates=[]
 for face_index,face in enumerate(f):
  vv=uv[face,1]
  if vv.max()-vv.min()>.5:
   for corner,index in enumerate(face):
    if uv[index,1]<.5:
     indices[face_index,corner]=len(p)+len(duplicates);duplicates.append(index)
 if duplicates:
  for semantic,array in attrs.items():attrs[semantic]=np.concatenate((array,array[duplicates]))
  attrs['TEXCOORD_0'][len(p):,1]+=1
 return attrs,indices

for result in results:
 name=result['name'];id=name.removesuffix('.l').removesuffix('.r');part=parts[id]
 side=name[-1] if name.endswith(('.l','.r')) else None
 job=jobs[name];allp=target(np.array(job['positions']).reshape((-1,3)))
 indices=np.array(result['indices'],dtype=np.uint32);used,reverse=np.unique(indices,return_inverse=True)
 p=allp[used];f=reverse.reshape((-1,3))
 closed=topology(p,f)['closed']
 if part['role'] in ['region','neighbour']:attrs,f=bake(name,p,f,part,side)
 else:
  a,b,c=p[f[:,0]],p[f[:,1]],p[f[:,2]];normals=np.zeros_like(p);n=np.cross(b-a,c-a)
  for corner in range(3):np.add.at(normals,f[:,corner],n)
  attrs={'POSITION':p,'NORMAL':unit_rows(normals)}
  ji=np.zeros((len(p),4),dtype=np.uint16);weights=np.zeros((len(p),4),dtype=np.float32)
  if part['role']=='bone':ji[:,0]=joint_names.index(bone_joint(id,side));weights[:,0]=1
  else:
   ds=np.linalg.norm(p[:,None,:]-joint_positions[None,:,:],axis=2)
   skin_sides=[job['skinSides'][i] for i in used]
   ji=np.zeros((len(p),4),dtype=np.uint16);weights=np.zeros((len(p),4))
   for i,skin_side in enumerate(skin_sides):
    candidates=[0] if skin_side is None else [j for j,name in enumerate(joint_names) if name=='trunk' or name.endswith('.'+skin_side)]
    nearest=sorted(candidates,key=lambda j:ds[i,j])[:4]
    w=1/np.maximum(.025,ds[i,nearest])**4;w/=w.sum()
    ji[i,:len(nearest)]=nearest;weights[i,:len(nearest)]=w
   graph=adjacency(f,len(p));dense=np.zeros((len(p),len(joint_names)))
   np.add.at(dense,(np.arange(len(p))[:,None],ji),weights)
   for _ in range(3):
    smoothed=dense.copy()
    for i,neighbours in enumerate(graph):
     if neighbours:smoothed[i]=.5*dense[i]+.5*dense[list(neighbours)].mean(0)
    dense=smoothed
   ji=np.argsort(-dense,axis=1)[:,:4].astype(np.uint16);weights=np.take_along_axis(dense,ji,axis=1);weights/=weights.sum(1)[:,None]
  attrs['JOINTS_0']=ji;attrs['WEIGHTS_0']=weights
 records[name]={'part':part,'attrs':attrs,'faces':f,'closed':closed}
 print('BAKED',name,len(f),flush=True)
# Merge the static thorax into one material/mesh.
a,b=records.pop('sternum'),records.pop('ribs');offset=len(a['attrs']['POSITION'])
records['thorax']={'part':a['part'],'attrs':{k:np.concatenate((a['attrs'][k],b['attrs'][k])) for k in a['attrs']},
 'faces':np.concatenate((a['faces'],b['faces']+offset)),'closed':a['closed'] and b['closed']}

gltf={'asset':{'version':'2.0','generator':'Atlas source-only assimp fallback; native Blender export pending'},
 'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'chest-rig','children':[]}],
 'skins':[{'name':'chest-skin','joints':list(range(1,len(joint_names)+1)),'skeleton':1}],
 'meshes':[],'materials':[],'buffers':[],'bufferViews':[],'accessors':[]}
chunks=[];offset=0

def put(array,kind,component=5126,minmax=False):
 global offset
 dtype=np.float32 if component==5126 else np.uint16 if component==5123 else np.uint32
 array=np.asarray(array,dtype=dtype)
 data=array.tobytes();padding=(-offset)%4
 if padding:chunks.append(b'\0'*padding);offset+=padding
 view=len(gltf['bufferViews']);gltf['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(data)})
 chunks.append(data);offset+=len(data)
 a={'bufferView':view,'componentType':component,'count':len(array),'type':kind}
 if minmax:a.update(min=array.min(0).tolist(),max=array.max(0).tolist())
 index=len(gltf['accessors']);gltf['accessors'].append(a);return index

for index,j in enumerate(rig['joints'],start=1):
 parent=0 if j['parent'] is None else 1+joint_names.index(j['parent'])
 origin=np.zeros(3) if parent==0 else joint_positions[parent-1]
 gltf['nodes'].append({'name':j['node'],'translation':(np.array(j['position'])-origin).tolist(),'children':[]})
 gltf['nodes'][parent]['children'].append(index)
inverse=[]
for p in joint_positions:
 m=np.eye(4);m[:3,3]=-p;inverse.append(m.reshape(-1,order='F'))
gltf['skins'][0]['inverseBindMatrices']=put(inverse,'MAT4')
colors={'superficial':[.55,.32,.24,1],'intermediate':[.45,.32,.28,1],'deep':[.35,.28,.26,1],
 'neighbours':[.46,.44,.40,1],'skeleton':[.78,.73,.62,1],'context':[.64,.61,.55,.12]}
for layer,color in colors.items():gltf['materials'].append({'name':'anatomy-'+layer,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':0,'roughnessFactor':.8},'doubleSided':True,**({'alphaMode':'BLEND'} if layer=='context' else {})})
for name,record in records.items():
 attrs=record['attrs'];semantics={}
 for semantic,array in attrs.items():
  kind='SCALAR' if array.shape[1]==1 else 'VEC'+str(array.shape[1])
  semantics[semantic]=put(array,kind,5123 if semantic=='JOINTS_0' else 5126,semantic=='POSITION')
 idx=put(record['faces'].reshape((-1,1)),'SCALAR',5125)
 part=record['part'];extras={'closed':record['closed'],'role':part['role'],'layer':part['layer'],'partId':name.removesuffix('.l').removesuffix('.r'),'provenance':'assimp fallback'}
 mesh=len(gltf['meshes']);gltf['meshes'].append({'name':name,'extras':extras,'primitives':[{'attributes':semantics,'indices':idx,'mode':4,'material':list(colors).index(part['layer'])}]})
 node=len(gltf['nodes']);gltf['nodes'].append({'name':name,'mesh':mesh,'skin':0,'extras':extras});gltf['nodes'][0]['children'].append(node)
binary=b''.join(chunks);binary+=b'\0'*((-len(binary))%4)
gltf['buffers']=[{'byteLength':len(binary)}]
js=json.dumps(gltf,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
(CACHE/'chest.raw.glb').write_bytes(struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(binary))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(binary),0x004E4942)+binary)
print('RAW FALLBACK',CACHE/'chest.raw.glb',flush=True)
