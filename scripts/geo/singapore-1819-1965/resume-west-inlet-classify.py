from pathlib import Path
import cv2,numpy as np,json
from scipy.ndimage import distance_transform_edt
D=Path(__file__).parent;im=cv2.imread(str(D/'raw/resume-source-anu1958.jpg'))[3400:5100,400:3500]
x0,y0,x1,y1=80,30,780,660;a=im[y0:y1,x0:x1];b,g,r=a.astype(float).transpose(2,0,1)
blue=(b-r>5)&(g-r>0)&(r<195);red=(r-g>15)&(r-b>20);black=np.maximum.reduce([r,g,b])<150;dist=distance_transform_edt(~blue)
ink=(blue|black|(red&(dist<7))).astype('uint8');ink=cv2.morphologyEx(ink,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));ink=cv2.dilate(ink,np.ones((3,3),np.uint8));n,lab,stats,cents=cv2.connectedComponentsWithStats(1-ink)
means=np.stack([np.bincount(lab.ravel(),weights=a[:,:,i].ravel(),minlength=n)/np.maximum(1,stats[:,4])for i in range(3)],axis=1)
records=[];selected=[]
for k in range(1,n):
 x,y,w,h,size=stats[k];delta=means[k,2]-means[k,0]
 if size>20 and delta<17:
  selected.append(k);records.append({'id':k,'bbox':[int(x+x0),int(y+y0),int(w),int(h)],'size':int(size),'R-B':round(float(delta),2)})
water=np.isin(lab,selected).astype('uint8');water=cv2.dilate(water,np.ones((3,3),np.uint8));out=a.copy();out[water>0]=(out[water>0]*.55+np.array([255,20,200])*.45).astype('uint8')
for q in records:
 k=q['id'];x,y=cents[k];cv2.putText(out,str(k),(round(x)-6,round(y)),0,.3,(0,0,255),1)
cv2.imwrite(str(D/'work/resume-west-inlet-components.png'),cv2.resize(out,None,fx=2,fy=2));np.savez(D/'work/resume-west-inlet-components.npz',lab=lab,stats=stats,water=water);(D/'work/resume-west-inlet-components.json').write_text(json.dumps(records,indent=2)+'\n');print(records)
