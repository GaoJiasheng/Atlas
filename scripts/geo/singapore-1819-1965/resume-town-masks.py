"""Native-raster bank tracing; writes only resume-town source and work files.

G4: clear paper channel connected within printed dark banks. Source lettering
is suppressed as tiny internal holes; marsh islands stay real holes. No map
geometry is inferred from modern geography or drawn as a geographic polygon.
"""
import json
import ast
import re
from pathlib import Path
import cv2
import numpy as np
from skimage.graph import route_through_array
D=Path(__file__).parent
im=cv2.imread(str(D/'raw/G4.jpg'))
gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
clear=(gray>180).astype('uint8')
clear=cv2.morphologyEx(clear,cv2.MORPH_OPEN,np.ones((2,2),'uint8'))
_,labels=cv2.connectedComponents(clear)
water=(labels==labels[440,315]).astype('uint8')
# Narrow channels carry broken/faded bank ink. Closely spaced source-pixel
# guides constrain a native-image bright-interior path to a 4px corridor.
# They are never geographic territory vertices; source banks set the width.
paths=[
 [[282,334],[294,330],[308,330],[320,332],[332,335],[345,337],[357,336],[369,338],[378,344],[376,355],[371,370],[366,385],[358,400],[351,414],[344,424],[338,426],[334,424],[335,414],[340,401],[349,389]],
]
for guides in paths:
 for start,end in zip(guides,guides[1:]):
  corridor=np.zeros_like(gray,dtype='uint8');cv2.line(corridor,tuple(start),tuple(end),1,9)
  ys,xs=np.where(corridor);x0,x1=xs.min(),xs.max()+1;y0,y1=ys.min(),ys.max()+1
  sub=gray[y0:y1,x0:x1].astype(float);cost=1+((255-sub)/18)**2
  cost[corridor[y0:y1,x0:x1]==0]=1e8
  points,_=route_through_array(cost,(start[1]-y0,start[0]-x0),(end[1]-y0,end[0]-x0),fully_connected=True)
  path=np.zeros_like(gray,dtype='uint8')
  for y,x in points:path[y+y0,x+x0]=1
  path=cv2.dilate(path,np.ones((3,3),'uint8'))
  water |= path
# Move from the bright paper interior to the centre of the 2–3px bank ink.
water=cv2.dilate(water,np.ones((3,3),'uint8'))
contours,hierarchy=cv2.findContours(water,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
outer=max(range(len(contours)),key=lambda n:cv2.contourArea(contours[n]))
rings=[]
for i,contour in enumerate(contours):
 if i!=outer and not (hierarchy[0,i,3]==outer and cv2.contourArea(contour)>=40):continue
 p=cv2.approxPolyDP(contour,.6,True)[:,0,:].tolist();p.append(p[0]);rings.append((i==outer,p))
rings.sort(key=lambda p:not p[0]);coordinates=[p for _,p in rings]
(D/'resume-town-G4-upper-native.json').write_text(json.dumps({'source':'G4','method':'Grayscale channel interior threshold 180, 2x2 opening, connected source seed [315,440], one-pixel expansion to bank-ink centre; contour simplification 0.6 native pixels; retain printed marsh islands >40 square pixels; narrow eastern marsh channel follows source-constrained bright-interior path (4px corridor). Lower overprinted reaches use reviewed direct source-pixel trace.','coordinates':coordinates},indent=2)+'\n')
overlay=im.copy();overlay[water>0]=(overlay[water>0]*.65+np.array([255,180,0])*.35).astype('uint8')
for ring in coordinates:cv2.polylines(overlay,[np.array(ring,dtype=np.int32)],True,(0,0,255),1)
cv2.imwrite(str(D/'work/resume-town-G4-upper-overlay.png'),cv2.resize(overlay[130:550,100:450],(1050,1260)))
cv2.imwrite(str(D/'work/resume-town-G4-upper-mask.png'),water*255)
print('G4 upper bank contours:',sum(len(p) for p in coordinates),'vertices;',len(coordinates)-1,'marsh-island holes; source area',int(water.sum()),'px²')

# Verify the actual union in source pixels independently of geographic fitting.
source=(D/'river-bank-inputs.ts').read_text()
lower=ast.literal_eval(re.search(r' G4:(\[.*?\]\]),',source,re.S).group(1))
selection=water.copy()
cv2.fillPoly(selection,[np.asarray(lower,dtype='int32')],1)
preview=im.copy()
preview[selection>0]=(preview[selection>0]*.65+np.array([255,180,0])*.35).astype('uint8')
combined_contours,_=cv2.findContours(selection,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
cv2.drawContours(preview,combined_contours,-1,(0,0,255),1)
cv2.imwrite(str(D/'work/resume-town-G4-combined-overlay.png'),cv2.resize(preview[130:745,100:450],(700,1230)))
print('Combined G4 raster:',len(combined_contours),'contours; source-pixel area:',int(selection.sum()))
