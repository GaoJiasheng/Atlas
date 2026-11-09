"""Authoring only: interpolate the independently read G15 tree-front guides.
PCHIP stays inside each coordinate interval; DP tolerance .25 native pixels.
"""
import json,cv2,numpy as np
from scipy.interpolate import PchipInterpolator
from pathlib import Path
p=Path(__file__).parent/'round2-g15-peninsula.json';j=json.loads(p.read_text())
def trace(points):
 a=np.array(points,float);t=np.r_[0,np.cumsum(np.linalg.norm(np.diff(a,axis=0),axis=1))]
 q=PchipInterpolator(t,a)(np.linspace(0,t[-1],int(t[-1]*2)))
 return cv2.approxPolyDP(q.astype('float32'),.25,False)[:,0,:].astype(float).tolist()
b=trace(j['outer'][1:-1]);j['boundary']=[j['outer'][0]]+b+[j['outer'][0]]
p.write_text(json.dumps(j,indent=2)+'\n')
