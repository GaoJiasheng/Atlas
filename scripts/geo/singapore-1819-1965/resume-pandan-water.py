"""Offshore source-water selection adjoining the certified full Pandan banks.
The mouth half-plane is a water selector; its edge is not a published bank.
"""
from pathlib import Path
import cv2, numpy as np, json
from scipy.ndimage import distance_transform_edt
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
x0,y0,x1,y1=2100,720,3100,1700
a=im[y0:y1,x0:x1]; b,g,r=a.astype(float).transpose(2,0,1)
blue=(b-r>5)&(g-r>0)&(r<195)
red=(r-g>15)&(r-b>20)
black=np.maximum.reduce([r,g,b])<150
# Near-bank overprints close actual interrupted bank ink. Brown coral is water.
ink=(blue|black|(red&(distance_transform_edt(~blue)<7))).astype('uint8')
ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
ink=cv2.dilate(ink,np.ones((3,3),np.uint8))
n,lab,stats,_=cv2.connectedComponentsWithStats(1-ink)
selected={115,143,151}
for x in range(2200,3100,40):
    k=int(lab[1650-y0,x-x0])
    if k>0:selected.add(k)
water=np.isin(lab,list(selected)).astype('uint8')
water=cv2.dilate(water,np.ones((3,3),np.uint8))
# Interpolate only short, printed grid occlusions between visible water runs.
def bridge(axis,lo,hi):
    v=water if axis==0 else water.T
    before=v[lo-1].astype(bool); after=v[hi+1].astype(bool)
    for k in range(lo,hi+1):
        v[k]|=(before&after).astype('uint8')
bridge(0,1071-y0,1077-y0)
for lo,hi in [(2316,2321),(2483,2489),(2652,2657)]:bridge(1,lo-x0,hi-x0)
# Only tiny letter/ink voids are filled; real dry islands remain holes.
nh,holes,hstats,_=cv2.connectedComponentsWithStats(1-water)
for k in range(1,nh):
    if hstats[k,4]<=100:water[holes==k]=1
full=np.zeros(im.shape[:2],np.uint8)
full[y0:y1,x0:x1]=water
full[:960]=0;full[1301:]=0;full[:,2801:]=0
# Keep only the offshore side of the independently reviewed Pandan mouth.
# The final paired-bank polygon defines every upstream bank, replacing this
# classifier's rejected letter-shaped fingers instead of unioning those bays.
yy,xx=np.indices(full.shape)
full[(-55*(yy-1024)-28*(xx-2570))>0]=0
contours,hierarchy=cv2.findContours(full,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
polygons=[]
for i,c in enumerate(contours):
    if hierarchy[0,i,3]!=-1 or cv2.contourArea(c)<20:continue
    rings=[]
    # This offshore window contains no source-blue-enclosed dry island. Its
    # interior ink holes are lettering / jetties, including the word Jetty.
    for j in [i]:
        p=cv2.approxPolyDP(contours[j],.5,True)[:,0,:].tolist();p.append(p[0]);rings.append(p)
    polygons.append(rings)
# Rasterising the mathematical mouth half-plane leaves a sub-pixel dry seam.
# Share the exact reviewed source-water cap with the paired-bank polygon.
# These two replacements are selection closures wholly within mapped water.
for p in polygons:
    r=p[0]
    if [2557,1031] in r and [2521,1049] in r:
        r[r.index([2557,1031])]=[2570,1024]
        r[r.index([2521,1049])]=[2515,1052]
report={'status':'source-water-reviewed','source':'G35 ANU1958','cropOffset':[400,3400],
 'method':'Native blue/black bank barrier with near-blue red overprints; source-reviewed components115/143/151 plus open sea; one-pixel expansion to bank-ink centre; native DP0.5px. Brown coral remains water. Offshore ink holes are lettering/jetties, not dry islands; removed. Exact common reviewed mouth cap prevents a raster seam.',
 'sourceWindow':[2100,960,2800,1300],
 'gridOcclusions':{'horizontal':[1071,1077],'vertical':[[2316,2321],[2483,2489],[2652,2657]]},
 'limits':'OFFSHORE SEA ONLY: clipped to the seaward half-plane of the source mouth[2570,1024] to[2515,1052]. The certified full Pandan polygon supplies both river banks; no rejected glyph-shaped upstream bays are ingested. Selection caps are not banks.',
 'polygons':polygons,'vertices':sum(len(r) for p in polygons for r in p)}
(D/'resume-pandan-water.json').write_text(json.dumps(report,indent=2)+'\n')
overlay=im.copy();overlay[full>0]=(overlay[full>0]*.55+np.array([255,40,220])*.45).astype('uint8')
cv2.imwrite(str(D/'work/resume-pandan-water-reviewed.png'),overlay[940:1320,2080:2820])
print(report['vertices'],'vertices;',len(polygons),'source water components')
