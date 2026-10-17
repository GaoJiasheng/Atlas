"""Extract source-pixel guides, not geographic polygons, for the G7 printed shore.
Unknown ink pixels are assigned to their nearest unambiguous paper/water class.
The unchanged lines.ts then follows printed ink between the sampled guides.
The image frame closes only a water-removal selection, never a territory edge.
"""
import json
from pathlib import Path
import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt, binary_fill_holes
D=Path(__file__).parent
im=cv2.cvtColor(cv2.imread(str(D/'raw/G7.jpg')),cv2.COLOR_BGR2RGB)
r,g,b=im.astype(float).transpose(2,0,1)
water=(g-r>=1)&(g-b>8)&(g>130)
land=(r-g>5)&(r-b>15)&(r>150)
known=water|land
ix=distance_transform_edt(~known,return_distances=False,return_indices=True)
a=water[tuple(ix)].astype('uint8')
a=cv2.morphologyEx(a,cv2.MORPH_CLOSE,np.ones((5,5),'uint8'))
a[:110]=0;a[2180:]=0;a[:,:115]=0;a[:,2860:]=0
n,lab=cv2.connectedComponents(a)
assert lab[2000,2000]!=0, 'Sea seed must be a nonzero water component'
a=(lab==lab[2000,2000]).astype('uint8')
cont=max(cv2.findContours(a,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)[0],key=cv2.contourArea)[:,0,:]
# Select shore arc between published frame's west and east water limits.
i=int(np.argmin(np.linalg.norm(cont-[160,2170],axis=1)));j=int(np.argmin(np.linalg.norm(cont-[2859,1590],axis=1)))
if i>j:i,j=j,i
p=cont[i:j+1];q=np.concatenate((cont[j:],cont[:i+1]))
p=p if p[:,1].mean()<q[:,1].mean() else q
# Ensure west-to-east order.
if p[0,0]>p[-1,0]:p=p[::-1]
via=p[::30].tolist();via.append(p[-1].tolist())
(D/'work').mkdir(exist_ok=True)
json.dump({'source':'G7 original','pixelSize':list(im.shape[:2][::-1]),'method':'nearest classified paper/water; connected sea component; external coast arc, source frame closure excluded from shoreline','via':via,'closurePixels':[[2859,2179],[115,2179]]},open(D/'work/G7-town-shore-via.json','w'),indent=2)
preview=cv2.cvtColor(im,cv2.COLOR_RGB2BGR)
cv2.polylines(preview,[p],False,(0,0,255),4)
cv2.imwrite(str(D/'work/G7-town-shore-preview.png'),cv2.resize(preview,(1490,1156)))
cv2.imwrite(str(D/'work/G7-water-classification.png'),a*255)
print(len(p),'boundary pixels',len(via),'guides',p[0],p[-1])
