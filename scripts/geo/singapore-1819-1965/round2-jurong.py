"""Source-native paired-bank redraw. No bank widening, morphology or gap fill.
The head replaces the failed retraced head only; lower reviewed reaches stay.
"""
from pathlib import Path
import json
import cv2
import numpy as np
from shapely.geometry import Polygon, box, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid
D=Path(__file__).parent
spec=json.loads((D/'round2-jurong-head.json').read_text())
# Guides are measurements of the blue bank centre, not freehand geography.
# Smooth only below half a native pixel, preserving the printed curves.
from scipy.interpolate import PchipInterpolator
def bank_line(points):
    p=np.asarray(points,float)
    t=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))]
    q=PchipInterpolator(t,p)(np.linspace(0,t[-1],int(t[-1]*2)))
    q[0]=p[0];q[-1]=p[-1]
    return cv2.approxPolyDP(q.astype('float32'),.25,False)[:,0,:].astype(float).tolist()
bank=bank_line(spec['bank']);head=Polygon(bank,[spec['islands'][0]])
if not head.is_valid:
    from shapely.validation import explain_validity
    print(explain_validity(head))
    im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
    cv2.polylines(im,[np.rint(bank).astype(np.int32)],True,(160,0,210),1,cv2.LINE_AA)
    cv2.imwrite(str(D/'work/round2-head-trace.png'),cv2.resize(im[90:450,1850:2200],None,fx=4,fy=4))
    raise RuntimeError('Measured head bank crosses itself')
# Preserve the previous measured lower water exactly; its invalid head is
# removed, not repaired by allowing make_valid to choose missing channels.
old=json.loads((D/'resume-jurong-east-verified-full-water.json').read_text())
if not (D/'work/round2-water-before.json').exists():(D/'work/round2-water-before.json').write_text(json.dumps(old))
old=json.loads((D/'work/round2-water-before.json').read_text())
lower=unary_union([make_valid(Polygon(p[0],p[1:])).intersection(box(0,412,3100,1700))for p in old['coordinates']])
water=unary_union([head,lower])
if not water.is_valid:raise RuntimeError('Paired banks invalid after downstream overlap')
parts=[water]if water.geom_type=='Polygon'else list(water.geoms)
coords=[mapping(p)['coordinates']for p in parts if p.area>1]
old.update(reviewStatus='paired-banks-source-reviewed',remaining='Absolute registration and single-stroke tributaries remain approximate; no strict RMS threshold asserted.',method=spec['method'],coordinates=coords,counts={'parts':len(coords),'vertices':sum(len(r)for p in coords for r in p),'holes':sum(len(p)-1 for p in coords)},headBankSource='round2-jurong-head.json')
(D/'resume-jurong-east-verified-full-water.json').write_text(json.dumps(old,indent=2)+'\n')
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
for p in coords:
 for r in p:cv2.polylines(im,[np.rint(r).astype(np.int32)],True,(160,0,210),1,cv2.LINE_AA)
cv2.imwrite(str(D/'work/round2-head-trace.png'),cv2.resize(im[90:450,1850:2200],None,fx=4,fy=4))
print(old['counts'])
