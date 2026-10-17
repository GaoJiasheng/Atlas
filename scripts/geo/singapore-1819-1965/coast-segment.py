"""Source-pixel guide extraction only, not a published polygon. Shared lines.ts
snaps these dense via guides to the printed ink. Processing parameters and full
native-pixel guides are recorded in work/G#-coast-via.json. Requires existing
local Pillow/OpenCV/SciPy; no project dependencies are installed or modified.
"""
from pathlib import Path
import sys,json,cv2,numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt,binary_fill_holes
Image.MAX_IMAGE_PIXELS=None
root=Path(__file__).parent
name=sys.argv[1]
im=Image.open(root/'raw'/f'{name}.jpg')
width,height=im.size
if name=='G16':
    im.draft('RGB',(4000,2400));im.thumbnail((4000,2400));a=np.array(im);scale=width/a.shape[1]
    gray=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY);smooth=cv2.GaussianBlur(gray,(5,5),0)
    mask=(smooth<226).astype('uint8')*255
    mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
    seed=[9683,5845]
    method='grayscale Gaussian5 processingpixels, mean<226, close3pixels; connected Singapore/Johor source-land component; 32nativepx via guides; diagnostic only'
else:
    scale=3 if name=='G9' else 2
    im=im.resize((width//scale,height//scale));a=np.array(im).astype('int16');r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    if name=='G9':
        water=(r-g<8)&(g-b>4)&(g>100);land=(r-g>=10)&(r-b>15)&(r>105);kernel=3;seed=[6000,3300]
        method='land r-g>=10/r-b>15, water r-g<8/g-b>4, nearestclassfill; close3processingpx; connectedmainland; externalboundarysample32nativepx'
    else:
        lum=(r+g+b)/3;sat=np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b)
        water=(lum>222)&(sat<38);land=((g-r>13)&(g-b>6))|((b-r>14)&(b-g>5))|((r-g>25)&(r-b>25)&(g<200));kernel=5;seed=[3000,3000]
        method='water paleunsaturatedmean>222/sat<38; landgreen/blue/redknownclasses; nearestfill; close5processingpx; connectedmainland; boundarysample32nativepx'
    indices=distance_transform_edt(~(water|land),return_distances=False,return_indices=True)
    mask=(~water[indices[0],indices[1]]).astype('uint8')*255
    mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((kernel,kernel),np.uint8))
count,labels,stats,centres=cv2.connectedComponentsWithStats(mask,8)
label=labels[int(seed[1]/scale),int(seed[0]/scale)]
if label==0:raise RuntimeError('Seed is not source-classified land; inspect and choose a clear source-land pixel, never a freehand boundary.')
main=binary_fill_holes(labels==label).astype('uint8')*255
cv2.imwrite(str(root/'work'/f'{name}-land-classification.png'),main)
contours,_=cv2.findContours(main,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
contour=max(contours,key=cv2.contourArea)[:,0,:]*scale
points=[];dist=100;last=contour[0]
for point in contour:
    dist+=np.linalg.norm(point-last);last=point
    if dist>=32:points.append([round(float(point[0])),round(float(point[1]))]);dist=0
points.append(points[0])
(root/'work'/f'{name}-coast-via.json').write_text(json.dumps({'source':f'{name} original printed-map pixel classification; no hand-drawn geometry','method':method,'processingScale':scale,'via':points},indent=2))
print(name,'connected source-land area processingpixels',stats[label,cv2.CC_STAT_AREA],'via',len(points))
