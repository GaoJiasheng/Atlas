"""Sample measured source-bank vectors; no raster filtering or bank widening."""
import json,sys
import numpy as np
from scipy.interpolate import PchipInterpolator
spec=json.load(sys.stdin)
for arc in spec['arcs']+spec.get('islands',[]):
 p=np.array(arc['points'],dtype=float)
 if np.any(np.linalg.norm(np.diff(p,axis=0),axis=1)==0):raise ValueError('Duplicate guide')
 t=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))]
 curve=PchipInterpolator(t,p,axis=0)
 samples=np.unique(np.r_[t,np.linspace(0,t[-1],int(np.ceil(t[-1]/2))+1)])
 arc['coordinates']=np.round(curve(samples),3).tolist()
json.dump(spec,sys.stdout)
