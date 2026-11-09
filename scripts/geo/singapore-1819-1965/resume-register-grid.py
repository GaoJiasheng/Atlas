"""Read only confidently visible printed grid lines; all are internal controls."""
import json,cv2,numpy as np
from PIL import Image,ImageDraw
from pathlib import Path
p=Path(__file__).resolve().parent
im=np.array(Image.open(p/'raw/G11.jpg')); gray=cv2.cvtColor(im,cv2.COLOR_RGB2GRAY)
out=Image.new('RGB',(1600,1600),'white');draw=ImageDraw.Draw(out)
points=[]
for j,yp in enumerate([1390,2930,4470,6010]):
 for i,xp in enumerate([852,2400,3950,5500]):
  e=460+i*10
  if j==3 and i==0: xp=1620;e=465 # E460/N200 falls inside a separately scaled inset; use main-map E465.
  # Long grid lines cross the full patch. Rank dark run along each axis.
  x0,y0=xp-65,yp-65; a=gray[y0:y0+130,x0:x0+130]
  mask=np.uint8(a<150)*255
  h=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((1,65),np.uint8))
  v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((65,1),np.uint8))
  xx=np.where(v.sum(0)>v.sum(0).max()*.70)[0];yy=np.where(h.sum(1)>h.sum(1).max()*.70)[0]
  x,y=float(xx.mean()+x0),float(yy.mean()+y0)
  crop=Image.fromarray(im[yp-180:yp+180,xp-180:xp+180]);cd=ImageDraw.Draw(crop);cx,cy=x-(xp-180),y-(yp-180);cd.ellipse((cx-8,cy-8,cx+8,cy+8),outline='#ed125d',width=2)
  out.paste(crop,(i*400,j*400+30));draw.text((i*400,j*400),f'E{e} N{230-j*10}; {x:.1f},{y:.1f}',fill='black')
  points.append({'name':f'Johore E{e}000 N{230-j*10}000 yd','svg':[x,y],'gridYards':[e*1000,230000-j*10000],'qualification':'Printed internal grid intersection; not independent WGS84 ground control.'})
(p/'resume-G11-grid.json').write_text(json.dumps({'grid':'Johore Cassini Soldner Everest; map printed origin 2°02′33.30″N 103°33′45.93″E, false E450000/N300000 yards','controlPoints':points},indent=2)+'\n')
out.save(p/'work/resume-G11-grid-readings.png')
