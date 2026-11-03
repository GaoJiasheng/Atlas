"""Original smooth femoral cortex. Implicit union, coronal section and nutrient
foramen, triangulated with marching cubes. No downloaded anatomy or textures.
python3 scripts/geo/bones-and-joints/cortex-mesh.py [out.json]
"""
import json,sys,os
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.sparse import coo_matrix
from skimage.measure import marching_cubes
from pathlib import Path
step=float(os.environ.get('BONE_GRID_STEP','.0009'))
lo=np.array([-.096,-.269,-.046]); hi=np.array([.069,.261,.049])
axes=[np.arange(a,b+step,step) for a,b in zip(lo,hi)]
x,y,z=np.meshgrid(*axes,indexing='ij',sparse=True)
def smin(a,b,k=.005):
 h=np.maximum(k-np.abs(a-b),0)/k
 return np.minimum(a,b)-h*h*k*.25
def ell(c,r):
 # Inigo Quilez's ellipsoid distance estimate, stable at the centre.
 q=[(v-p)/s for v,p,s in zip([x,y,z],c,r)]
 k0=np.sqrt(sum(a*a for a in q)); k1=np.sqrt(sum((a/s)**2 for a,s in zip(q,r)))
 return k0*(k0-1)/np.maximum(k1,1e-10)
# A bowed diaphysis, elliptical and gently twisted in cross section.
ys=np.array([-.202,-.15,-.07,.02,.10,.16,.181])
xs=np.array([.002,-.003,-.010,-.012,-.005,.009,.012])
zs=np.array([0,-.002,-.006,-.009,-.005,0,0])
rs=np.array([.032,.024,.021,.020,.022,.029,.029])
yc=np.clip(y,ys[0],ys[-1]);cx=CubicSpline(ys,xs)(yc);cz=CubicSpline(ys,zs)(yc);r=CubicSpline(ys,rs)(yc)
shaft=(np.sqrt(((x-cx)/r)**2+((z-cz)/(r*.84))**2+((y-yc)/r)**2)-1)*r
outer=shaft
# Femoral neck, head, greater/lesser trochanters and paired condyles.
for c,r in [([-.005,.174,0],[.026,.026,.020]),([-.027,.196,-.002],[.023,.022,.019]),
 ([-.054,.218,-.003],[.032,.031,.028]),([.030,.187,-.004],[.027,.032,.023]),
 ([-.013,.135,-.013],[.014,.018,.013]),
 ([-.023,-.226,-.002],[.031,.031,.027]),([.024,-.225,-.002],[.029,.030,.027])]:
 outer=smin(outer,ell(c,r))
# Thick midshaft, progressively thinner metaphyseal/epiphyseal cortex.
thickness=.0027+.0037*np.exp(-((y+.010)/.133)**6)
field=np.maximum(outer,-outer-thickness)
# A true longitudinal cut: keep posterior cortex and cut lips on z=.004.
field=np.maximum(field,z-(cz+.001))
# Oblique nutrient foramen at the right cut lip. Limit it to the right wall.
hole=np.maximum(np.sqrt(((y+.042)-.25*(x-.009))**2+(z+.0085)**2)-.0042,.001-x)
field=np.maximum(field,-hole)
def mesh(field,output):
 p,f,_,_=marching_cubes(field,0,spacing=(step,step,step),gradient_direction='ascent',allow_degenerate=False)
 used,inv=np.unique(f,return_inverse=True);p=p[used];f=inv.reshape(-1,3)
 p+=lo
 # Taubin smoothing removes voxel stair-steps without shrinking the silhouette.
 # The feature size remains far below the cortex/foramen dimensions.
 edges=np.vstack([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]);edges=np.vstack([edges,edges[:,::-1]])
 a=coo_matrix((np.ones(len(edges)),(edges[:,0],edges[:,1])),shape=(len(p),len(p))).tocsr()
 a.data[:]=1;degree=np.asarray(a.sum(axis=1)).ravel()[:,None]
 for _ in range(5):
  p+=.45*(a@p/degree-p)
  p-=.47*(a@p/degree-p)
 # Outward normals follow the field gradient. Keep sharp cut-face normals
 # separate after simplification in the TS exporter.
 Path(output).parent.mkdir(parents=True,exist_ok=True)
 Path(output).write_text(json.dumps({'position':p.ravel().tolist(),'index':f.ravel().tolist()}))
 print(Path(output).name,'marching-cubes triangles',len(f),flush=True)
if __name__=='__main__':
 mesh(field,sys.argv[1] if len(sys.argv)>1 else '/tmp/bones-polish/cortex-raw.json')
