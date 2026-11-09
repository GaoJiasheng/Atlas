"""Source-ink-bounded Jurong main-channel water selections, native G35.
Grid and label overprints fragment clear water. IDs are reproducible outputs
of the specified source barrier classifier; every retained region was viewed.
"""
from pathlib import Path
import json,cv2,numpy as np
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
x0,y0,x1,y1=1850,90,2200,1100;a=im[y0:y1,x0:x1];b,g,r=a.astype(float).transpose(2,0,1)
ink=(((b-r>5)&(g-r>0)&(r<195))|((r-g>15)&(r-b>20))|(np.maximum.reduce([r,g,b])<150)).astype('uint8')
ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),'uint8'));ink=cv2.dilate(ink,np.ones((3,3),'uint8'))
_,lab,stats,_=cv2.connectedComponentsWithStats(1-ink)
water=np.isin(lab,[119,123,134,158,185]).astype('uint8')
# The river-arc component leaks to the eastern field above this water-only
# source window. Its source-qualified portion is below the narrow channel
# cross-section at y390; that cap is a selection boundary, never coastline.
water |= ((lab==60)&(np.indices(lab.shape)[0]>=390-y0)).astype('uint8')
water=cv2.dilate(water,np.ones((3,3),'uint8'))
# Reconstruct water behind the two explicitly printed red grid bands using
# the adjacent source-visible bank ends. No bank width is invented.
occlusions=[]
for top,bottom in [(561,569),(729,737)]:
 rows=[]
 for yy in [top-2-y0,bottom+2-y0]:
  runs=np.where(water[yy]>0)[0]
  if len(runs):rows.append((int(runs.min()),int(runs.max())))
 if len(rows)==2:
  for yy in range(top-y0,bottom-y0+1):
   t=(yy-(top-y0))/(bottom-top);left=round(rows[0][0]*(1-t)+rows[1][0]*t);right=round(rows[0][1]*(1-t)+rows[1][1]*t);water[yy,left:right+1]=1
  occlusions.append({'source':'printed red grid band','fromY':top,'toY':bottom,'visibleBankEndsPx':rows})
water=cv2.morphologyEx(water,cv2.MORPH_CLOSE,np.ones((3,3),'uint8'))
contours,h=cv2.findContours(water,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
parts=[]
for i,p in enumerate(contours):
 if h[0,i,3]!=-1 or cv2.contourArea(p)<30:continue
 rings=[]
 q=cv2.approxPolyDP(p,.5,True)[:,0,:]+[x0,y0];ring=q.tolist();ring.append(ring[0]);rings.append(ring)
 for j,hole in enumerate(contours):
  if h[0,j,3]==i and cv2.contourArea(hole)>100:
   q=cv2.approxPolyDP(hole,.5,True)[:,0,:]+[x0,y0];ring=q.tolist();ring.append(ring[0]);rings.append(ring)
 parts.append(rings)
report={'source':'G35 ANU1958','cropOffset':[400,3400],'method':'Native blue/red/black barrier flood; source-qualified main-channel components119/123/134/158/185 plus component60 below y390; source-ink centre expansion1px; native contourDP0.5px; tiny internal printed-letter islands <=100px² excluded.','selectionCaps':'Source windows y390 and y1100 are water-only selection boundaries, never coast. Use as subtractive water selections inside land; do not stroke caps as bank.','occlusions':occlusions,'coordinates':parts,'counts':{'parts':len(parts),'vertices':sum(len(r) for p in parts for r in p),'sourceWaterPixels':int(water.sum())}}
(D/'resume-jurong-east-verified-water.json').write_text(json.dumps(report,indent=2)+'\n')
out=a.copy();out[water>0]=(out[water>0]*.55+np.array([255,20,200])*.45).astype('uint8')
cv2.imwrite(str(D/'work/resume-jurong-east-verified-water-overlay.png'),cv2.resize(out,None,fx=1.5,fy=1.5))
print(report['counts'])
