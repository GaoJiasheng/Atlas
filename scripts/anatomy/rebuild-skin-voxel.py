"""Unify Z-Anatomy's disconnected regional skin panels into one continuous surface.
Exact source silhouette is voxelized; no procedural body proportions are invented.
Original glue + derivative skin: CC BY-SA 4.0.
"""
import json,time,sys
from pathlib import Path
import numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree
from skimage.measure import marching_cubes
root=Path(__file__).resolve().parent
src=json.loads((root/'cache/rebuild-skin-source.json').read_text())
p=np.asarray(src['positions'],dtype=np.float64).reshape(-1,3);f=np.asarray(src['indices'],dtype=np.int32).reshape(-1,3)
w=np.asarray(src['weights'],dtype=np.float64);owners=np.asarray(src['owners'],dtype=np.int8)
step=float(sys.argv[1]) if len(sys.argv)>1 else .002
lo=np.floor((p.min(0)-.025)/step)*step;hi=p.max(0)+.025
shape=np.ceil((hi-lo)/step).astype(int)+1
print('grid',shape.tolist(),int(np.prod(shape)),flush=True)
surface=np.zeros(shape,dtype=bool)
for i,tri in enumerate(p[f]):
 longest=max(np.linalg.norm(tri[1]-tri[0]),np.linalg.norm(tri[2]-tri[0]),np.linalg.norm(tri[2]-tri[1]));n=max(1,int(np.ceil(longest/(step*.65))))
 a,b=np.meshgrid(np.arange(n+1)/n,np.arange(n+1)/n,indexing='ij');mask=a+b<=1;a=a[mask];b=b[mask]
 q=tri[0]+a[:,None]*(tri[1]-tri[0])+b[:,None]*(tri[2]-tri[0]);v=np.clip(np.rint((q-lo)/step).astype(np.int32),0,shape-1);surface[tuple(v.T)]=True
print('rasterized',surface.sum(),flush=True)
distance=ndimage.distance_transform_edt(~surface,sampling=step).astype(np.float32)
# Variable closing radius: bridge true body-panel canyons, preserve fingers/toe separations and facial relief.
y=lo[1]+np.arange(shape[1])*step
radius=np.interp(y,[0,.10,.20,1.33,1.45,2],[.0022,.0022,.003,.003,.003,.003]).astype(np.float32)[None,:,None]+np.zeros((shape[0],1,shape[2]),dtype=np.float32)
# The complete true source hands require only a 1.5-mm closure, never the body-scale radius.
for owner in [1,2]:
 hand=p[owners==owner];a=hand.min(0)-.012;b=hand.max(0)+.012
 sl=tuple(slice(max(0,int((a[k]-lo[k])/step)),min(shape[k],int((b[k]-lo[k])/step)+1)) for k in range(3));
 # A continuous 60-mm transition avoids an erosion step at the wrist.
 xx=np.maximum(np.maximum(a[0]-(lo[0]+np.arange(shape[0])*step),0),(lo[0]+np.arange(shape[0])*step)-b[0])
 yy=np.maximum(np.maximum(a[1]-y,0),y-b[1])
 zz=np.maximum(np.maximum(a[2]-(lo[2]+np.arange(shape[2])*step),0),(lo[2]+np.arange(shape[2])*step)-b[2])
 dbox=np.sqrt(xx[:,None,None]**2+yy[None,:,None]**2+zz[None,None,:]**2)
 radius=np.minimum(radius,.0022+np.minimum(dbox/.06,1)*.0008)
 del dbox
solid=distance<=radius
# Seal each anatomical transverse section independently: a protected face/eye
# opening must not drain the entire thorax. Disconnected limb gaps remain air.
for section in range(shape[1]):
 solid[:,section,:]=ndimage.binary_fill_holes(solid[:,section,:])
solid=ndimage.binary_fill_holes(solid)
del distance
print('closed and filled',int(solid.sum()),flush=True)
inside=ndimage.distance_transform_edt(solid,sampling=step).astype(np.float32)
solid=inside>=radius
print('eroded final solid litres',float(solid.sum())*step**3*1000,flush=True)
# Gaussian implicit surface smooths normals and grid variation without faceting.
del inside,radius,surface
field=ndimage.gaussian_filter(solid.astype(np.float32),sigma=.85)
print('marching',flush=True)
verts,faces,normals,_=marching_cubes(field,.5,spacing=(step,step,step),allow_degenerate=False,gradient_direction='descent');verts+=lo
# Outward normals from marching_cubes are kept; glTF triangle winding is independently checked below.
print('raw geometry',len(verts),len(faces),flush=True)
# Match winding to the implicit outward normals before recomputing normals.
if np.median(np.einsum('ij,ij->i',np.cross(verts[faces[:,1]]-verts[faces[:,0]],verts[faces[:,2]]-verts[faces[:,0]]),normals[faces].mean(1)))<0:faces=faces[:,[0,2,1]]
# Surface relaxation suppresses regional panel corrugation, with protected digit/face detail.
from scipy.sparse import coo_matrix,diags
edges=np.vstack([faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]]);edges=np.vstack([edges,edges[:,::-1]])
adj=coo_matrix((np.ones(len(edges),dtype=np.float32),(edges[:,0],edges[:,1])),shape=(len(verts),len(verts))).tocsr();adj.data[:]=1
adj=diags(1/np.asarray(adj.sum(axis=1)).ravel())@adj
relax=np.full(len(verts),.48)
relax[verts[:,1]>1.40]=.16
for owner in [1,2]:
 hand=p[owners==owner];near=cKDTree(hand).query(verts,k=1,workers=1)[0];relax[near<.025]=.10
relax[verts[:,1]<.11]=.15
for iteration in range(70):
 verts+=(adj@verts-verts)*relax[:,None]
 if iteration%20==0:print('surface relaxation',iteration,flush=True)
del adj,edges
# Recompute area-weighted smooth normals on the relaxed geometry, not the old voxel gradients.
normals=np.zeros_like(verts);fn=np.cross(verts[faces[:,1]]-verts[faces[:,0]],verts[faces[:,2]]-verts[faces[:,0]])
for col in range(3):np.add.at(normals,faces[:,col],fn)
normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-12)

# Transfer the source's joint field locally (nearest eight surface vertices, inverse-square interpolation).
d,ix=cKDTree(p).query(verts,k=8,workers=1)
coeff=1/np.maximum(d,.0001)**2;coeff/=coeff.sum(1,keepdims=True)
weights=np.sum(w[ix]*coeff[:,:,None],axis=1)
order=np.argsort(weights,axis=1)[:,-4:];kept=np.zeros_like(weights);np.put_along_axis(kept,order,np.take_along_axis(weights,order,axis=1),axis=1);kept/=kept.sum(1,keepdims=True)
np.savez_compressed(root/'cache/rebuild-skin-preclip.npz',verts=verts,faces=faces,normals=normals,kept=kept)

# Use the separately audited hand-box-constrained wrist split.
import subprocess
subprocess.run([sys.executable,str(root/'rebuild-skin-finish.py')],check=True)
