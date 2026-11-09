"""Constrained border-graticule observations: each measures ONLY its printed axis."""
import json,cv2,numpy as np,math
from PIL import Image,ImageDraw
from pathlib import Path
p=Path(__file__).resolve().parent
Image.MAX_IMAGE_PIXELS=None
im=np.array(Image.open(p/'raw/G16.jpg'));gray=cv2.cvtColor(im,cv2.COLOR_RGB2GRAY)
points=[];out=Image.new('RGB',(1600,1600),'white');d=ImageDraw.Draw(out)
for j,side in enumerate(['top','bottom','left','right']):
 for k in range(4):
  if side in ['top','bottom']:
   xp=[7420,10920,17920,21420][k];yp=590 if side=='top' else 15800
   # Only longitude is observed; border latitude is intentionally unknown.
   a=gray[yp-35:yp+35,xp-60:xp+60];v=cv2.morphologyEx(np.uint8(a<180)*255,cv2.MORPH_OPEN,np.ones((25,1),np.uint8));score=v.sum(0);q=np.where(score>score.max()*.80)[0];x=float(q.mean()+xp-60);y=float(yp);axis='longitude';value=[103+40/60,103+50/60,104+10/60,104+20/60][k]
  else:
   xp=545 if side=='left' else 26980;yp=[2766,6297,9818,13340][k] if side=='left' else [2757,6280,9795,13319][k]
   a=gray[yp-90:yp+90,xp-90:xp+90];v=cv2.morphologyEx(np.uint8(a<180)*255,cv2.MORPH_OPEN,np.ones((1,30),np.uint8));score=v.sum(1);q=np.where(score>score.max()*.80)[0];x=float(xp);y=float(q.mean()+yp-90);axis='latitude';value=[1.5,1+20/60,1+10/60,1][k]
  points.append({'side':side,'svg':[x,y],'observedAxis':axis,'observedDegrees':value,'qualification':'Printed axis tick only. Other geographic coordinate is not known; this is not an independent ground control point.'})
  cx,cy=int(x),int(y);a=Image.fromarray(im[cy-180:cy+180,cx-180:cx+180]);ad=ImageDraw.Draw(a);ad.line((165,180,195,180),fill='#e81554',width=2);ad.line((180,165,180,195),fill='#e81554',width=2);out.paste(a,(k*400,j*400+30));d.text((k*400,j*400),f'{side} {axis} {value:.5f}; {x:.1f},{y:.1f}',fill='black')

def merc(v,axis): return math.radians(v)*6378137 if axis=='longitude' else math.log(math.tan(math.pi/4+math.radians(v)/2))*6378137
fits={}
for axis in ['longitude','latitude']:
 cps=[q for q in points if q['observedAxis']==axis];a=np.array([[1,c['svg'][0]/10000,c['svg'][1]/10000] for c in cps]);b=np.array([merc(c['observedDegrees'],axis) for c in cps]);coef=np.linalg.lstsq(a,b,rcond=None)[0];res=a@coef-b;loo=[]
 for k in range(len(cps)):
  co=np.linalg.lstsq(np.delete(a,k,0),np.delete(b,k),rcond=None)[0];loo.append(float(a[k]@co-b[k]))
 fits[axis]={'coefficients':coef.tolist(),'fitRmsM':float(np.sqrt(np.mean(res**2))),'fitMaxM':float(np.max(abs(res))),'looRmsM':float(np.sqrt(np.mean(np.array(loo)**2))),'looMaxM':max(map(abs,loo)),'residualsM':res.tolist(),'looResidualsM':loo}
anchors=json.loads((p/'georef-G16.json').read_text())['controlPoints'];checks=[]
for c in anchors:
 a=np.array([1,c['svg'][0]/10000,c['svg'][1]/10000]);dx=merc(c['lnglat'][0],'longitude')-a@np.array(fits['longitude']['coefficients']);dy=merc(c['lnglat'][1],'latitude')-a@np.array(fits['latitude']['coefficients']);checks.append(dict(c,dx=float(dx),dy=float(dy)))
tx=np.mean([q['dx'] for q in checks]);ty=np.mean([q['dy'] for q in checks]);n=len(checks)
for c in checks:c['errorM']=math.hypot(c['dx']-tx,c['dy']-ty);c['looErrorM']=c['errorM']*n/(n-1)
external={'count':n,'translationMetres':[tx,ty],'fitRmsM':float(np.sqrt(np.mean([q['errorM']**2 for q in checks]))),'fitMaxM':max(q['errorM'] for q in checks),'looRmsM':float(np.sqrt(np.mean([q['looErrorM']**2 for q in checks]))),'looMaxM':max(q['looErrorM'] for q in checks),'checks':checks}
(p/'resume-G16-graticule.json').write_text(json.dumps({'method':'16 border ticks, 8 constrain only longitude and 8 only latitude. Independent affine axis fits in Mercator metres. No invented intersection or unobserved degree coordinate. External translation anchored to the original six named controls; historical datum and cape generalisation remain unresolved.','axisObservations':points,'internalAxisFits':fits,'externalTranslationFit':external},indent=2)+'\n');out.save(p/'work/resume-G16-graticule-readings.png');print(json.dumps({'internal':fits,'external':external},indent=2))
