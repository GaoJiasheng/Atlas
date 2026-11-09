"""Read G9 two-statute-mile square grid. Arbitrary local grid origin only."""
import json,cv2,numpy as np
from pathlib import Path
from PIL import Image,ImageDraw
p=Path(__file__).resolve().parent;Image.MAX_IMAGE_PIXELS=None;im=np.array(Image.open(p/'raw/G9.jpg'));gray=cv2.cvtColor(im,cv2.COLOR_RGB2GRAY);o=Image.new('RGB',(1600,1600),'white');d=ImageDraw.Draw(o);points=[]
for j,yp in enumerate([1680,3480,5280,7080]):
 for i in range(4):
  col=[1,5,9,13][i] if j<3 else [4,6,8,10][i];row=[1,4,7,10][j]
  if j==2 and i==3:col=11 # outer southeast border grid is interrupted by title cartouche
  xp=int(636+col*602.5)
  a=gray[yp-100:yp+100,xp-100:xp+100];mask=np.uint8(a<170)*255;h=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((1,100),np.uint8));v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((100,1),np.uint8));xx=np.where(v.sum(0)>v.sum(0).max()*.75)[0];yy=np.where(h.sum(1)>h.sum(1).max()*.75)[0]
  if not len(xx)or not len(yy):raise ValueError(f'grid not found col{col} row{row}')
  x,y=float(xx.mean()+xp-100),float(yy.mean()+yp-100);points.append({'name':f'Printed two-mile square intersection C{col} R{row}','svg':[x,y],'gridMetres':[col*3218.688,-row*3218.688],'qualification':'Internal printed two-statute-mile grid only; arbitrary local origin, no invented latitude/longitude or datum.'});a=Image.fromarray(im[yp-170:yp+170,xp-170:xp+170]);ad=ImageDraw.Draw(a);cx,cy=x-xp+170,y-yp+170;ad.ellipse((cx-8,cy-8,cx+8,cy+8),outline='#ef0074',width=2);o.paste(a,(i*400,j*400+30));d.text((i*400,j*400),f'col{col} row{row}: {x:.1f},{y:.1f}',fill='black')
(p/'resume-register-G9-grid.json').write_text(json.dumps({'method':'Printed squares are two statute miles per margin note. Indices have an arbitrary common origin; absolute position must come from independently observed ground controls.','controlPoints':points},indent=2)+'\n');o.save(p/'work/resume-register-G9-grid-readings.png')
