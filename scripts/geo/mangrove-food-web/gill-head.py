"""Original partial mudskipper head: fused cranial/ocular volumes and a
cheek window into a hollow bucco-opercular chamber. No downloaded mesh.
Read-only reference scope is recorded in the topic SOURCES.md.
Outputs float32 positions/normals and uint32 indices to the build process.
"""
import sys, struct
import numpy as np
from skimage.measure import marching_cubes
step=.0014
lo=np.array([-.103,-.067,-.067])
axes=[np.arange(a,b+step,step) for a,b in zip(lo,[.131,.085,.067])]
x,y,z=np.meshgrid(*axes,indexing='ij')
def ell(center,radii):
    return (np.sqrt(sum(((p-c)/r)**2 for p,c,r in zip([x,y,z],center,radii)))-1)*min(radii)
def union(a,b,k=.009):
    h=np.clip(.5+.5*(b-a)/k,0,1)
    return b+(a-b)*h-k*h*(1-h)
# Bulged respiratory cheek, flattened cranial roof, broad anterior muzzle.
f=union(ell([-.031,-.002,0],[.067,.051,.050]),ell([.043,.017,0],[.060,.032,.037]))
f=union(f,ell([.094,-.003,0],[.030,.017,.028]),.008)
for side in [-1,1]:
    f=union(f,ell([.052,.049,side*.022],[.018,.018,.015]),.006)
# Cavity remains inside the back cheek; the anterior roof and muzzle stay
# intact. An oblique cheek excision opens the chamber, with a real thick rim.
cavity=ell([-.034,-.003,0],[.059,.042,.040])
f=-union(-f,cavity,.0015)
window=np.maximum((.010+.05*(x+.03))-z,x-.024)
f=-union(-f,window,.0012)
# A shallow gape divides the fleshy upper/lower muzzle at its anterior edge.
gape=np.maximum.reduce([np.abs(y+.004)-.0013,.085-x,np.abs(z)-.027])
f=np.maximum(f,-gape)
v,faces,n,_=marching_cubes(f.astype('f4'),0,spacing=[step]*3,gradient_direction='ascent')
v+=lo
# Gradient normals are smoother than triangle normals on the implicit cheek.
n=-n
v=v.astype('<f4');n=n.astype('<f4');faces=faces[:,[0,2,1]].astype('<u4')
sys.stdout.buffer.write(struct.pack('<II',len(v),len(faces)*3))
sys.stdout.buffer.write(v.tobytes());sys.stdout.buffer.write(n.tobytes());sys.stdout.buffer.write(faces.tobytes())
