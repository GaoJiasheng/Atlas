import json,numpy as np
from pathlib import Path
root=Path(__file__).resolve().parent
src=json.loads((root/'cache/rebuild-skin-source.json').read_text())
p=np.asarray(src['positions']).reshape(-1,3);f=np.asarray(src['indices']).reshape(-1,3);owners=np.asarray(src['owners']);step=.002
d=np.load(root/'cache/rebuild-skin-preclip.npz');verts=d['verts'];faces=d['faces'];normals=d['normals'];kept=d['kept']
# Plane-clip the SAME continuous surface at the true source wrist pivot, with shared cut vertices.
rig=json.loads((root/'arms/rig.json').read_text());rc=rig.get('sourceCentre',rig.get('sourceChestCentre'));C=np.array([rc[0],rc[2],-rc[1]])
joints={j['name']:np.array(j['position'])+C for j in rig['joints']}
verts=verts.tolist();normals=normals.tolist();kept=kept.tolist();faces=faces.tolist();faceowner=[0]*len(faces)
for owner,side in [(1,'l'),(2,'r')]:
 wrist=joints['hand.'+side];normal=wrist-joints['elbow.'+side];normal/=np.linalg.norm(normal);plane=wrist+normal*.005
 cloud=np.asarray(verts);assert np.isfinite(cloud).all() and np.isfinite(normal).all();print('finite wrist clip',side,cloud.min(0).tolist(),cloud.max(0).tolist(),flush=True);distance=np.sum((cloud-plane)*normal,axis=1);hand=p[owners==owner];lower=hand.min(0)-.025;upper=hand.max(0)+.025;near=((cloud>=lower)&(cloud<=upper)).all(axis=1)
 newfaces=[];newowners=[];lookup={}
 def crossing(a,b):
  key=(min(a,b),max(a,b))
  if key in lookup:return lookup[key]
  t=distance[a]/(distance[a]-distance[b]);index=len(verts);lookup[key]=index
  verts.append((cloud[a]+t*(cloud[b]-cloud[a])).tolist());normals.append((np.asarray(normals[a])*(1-t)+np.asarray(normals[b])*t).tolist());kept.append((np.asarray(kept[a])*(1-t)+np.asarray(kept[b])*t).tolist());return index
 def clipped(face,distal):
  out=[]
  for a,b in zip(face,face[1:]+face[:1]):
   da,db=distance[a],distance[b];ina=(da>=0) if distal else (da<=0);inb=(db>=0) if distal else (db<=0)
   if ina:out.append(a)
   if ina!=inb:out.append(crossing(a,b))
  return[(out[0],out[i],out[i+1]) for i in range(1,len(out)-1)]
 arr=np.asarray(faces,dtype=np.int32);own=np.asarray(faceowner,dtype=np.int8);D=distance[arr];N=near[arr].all(axis=1)&(own==0);distal=N&(D>=0).all(axis=1);cross=N&(D.min(axis=1)<0)&(D.max(axis=1)>0);own[distal]=owner
 newfaces=arr[~cross].tolist();newowners=own[~cross].tolist()
 for face in arr[cross].tolist():
  for distal in [False,True]:
   for tri in clipped(face,distal):newfaces.append(list(tri));newowners.append(owner if distal else 0)
 print('exact plane split',side,int(cross.sum()),flush=True)
 faces=newfaces;faceowner=newowners
verts=np.asarray(verts);normals=np.asarray(normals);kept=np.asarray(kept);faces=np.asarray(faces,dtype=np.int32);faceowner=np.asarray(faceowner,dtype=np.int8)
for k,side in [(1,'l'),(2,'r')]:
 seam=np.intersect1d(np.unique(faces[faceowner==k]),np.unique(faces[faceowner==0]));j=src['jointNames'].index('joint.hand.'+side);kept[seam]=0;kept[seam,j]=1
# Align all triangle windings with the outward implicit-surface gradient.
a=verts[faces[:,0]];b=verts[faces[:,1]];c=verts[faces[:,2]]
# skimage normals face outward for descent; compare and reverse geometric normals if needed.
dots=np.einsum('ij,ij->i',np.cross(b-a,c-a),normals[faces].mean(1))
if np.median(dots)<0:faces=faces[:,[0,2,1]]
out=dict(positions=verts.tolist(),indices=faces.ravel().tolist(),normals=normals.tolist(),weights=kept.tolist(),faceOwners=faceowner.tolist(),jointNames=src['jointNames'],stepM=step,bodyClosingRadiusM=.003,handClosingRadiusM=.0022,headClosingRadiusM=.003,footClosingRadiusM=.0022,gaussianSigmaVoxels=.85,surfaceRelaxationIterations=70,sourceVertices=len(p),sourceTriangles=len(f),vertices=len(verts),triangles=len(faces),method='variable-radius source-surface voxel closing; axial tissue-section hole fill; filled outer volume; Gaussian implicit surface; marching cubes; local source skin-weight transfer; shared hand-boundary vertices')
(root/'cache/rebuild-skin-continuous.json').write_text(json.dumps(out,separators=(',',':')))
print('done',len(verts),len(faces),flush=True)
