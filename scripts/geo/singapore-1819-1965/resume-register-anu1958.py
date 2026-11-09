"""Native gridded GSGS4923 scan observations; no ground accuracy claim."""
from PIL import Image,ImageDraw
from pathlib import Path
import numpy as np,cv2,json
p=Path(__file__).resolve().parent;im=np.array(Image.open(p/'raw/resume-source-anu1958.jpg'));o=Image.new('RGB',(1600,1600),'white');d=ImageDraw.Draw(o);cps=[]
for j,yp in enumerate([1244,2954,4642,6333]):
 for i in range(4):
  e=[460,470,480,490][i] if j<3 else [470,475,480,485][i];xp=int(686+(e-460)*168.8)
  a=im[yp-75:yp+75,xp-75:xp+75].astype(float);mask=np.uint8((a[:,:,0]-a[:,:,1]>14)&(a[:,:,0]-a[:,:,2]>14))*255
  h=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((1,55),np.uint8));v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((55,1),np.uint8));xx=np.where(v.sum(0)>v.sum(0).max()*.75)[0];yy=np.where(h.sum(1)>h.sum(1).max()*.75)[0]
  if not len(xx) or not len(yy): raise ValueError(f'grid not found E{e} N{230-j*10}')
  x,y=float(xx.mean()+xp-75),float(yy.mean()+yp-75);cps.append({'name':f'Johore E{e}000 N{230-j*10}000 yd','svg':[x,y],'gridYards':[e*1000,230000-j*10000],'qualification':'Printed grid control only; not independent ground feature.'})
  a=Image.fromarray(im[yp-170:yp+170,xp-170:xp+170]);ad=ImageDraw.Draw(a);cx,cy=x-xp+170,y-yp+170;ad.ellipse((cx-9,cy-9,cx+9,cy+9),outline='#5a11ef',width=2);o.paste(a,(i*400,j*400+30));d.text((i*400,j*400),f'E{e} N{230-j*10}; {x:.1f},{y:.1f}',fill='black')
(p/'resume-register-anu1958-grid.json').write_text(json.dumps({'source':'GSGS4923 Singapore1958, ANU; native8350x6806 raster.','controlPoints':cps},indent=2)+'\n');o.save(p/'work/resume-register-anu1958-grid-readings.png')
