"""Source-pixel trace QA; no geographic geometry is inferred by this renderer."""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS=None
p=Path(__file__).resolve().parent
spec=json.loads((p/'border-traces.json').read_text())
for name,box,scale in [('dindings',(4500,9400,5400,10600),1),('pangkor',(4450,10000,4850,10500),2),('pangkor-laut',(4450,10000,4850,10500),2),('fms-northern-1898',(3900,5100,12300,10800),.23),('johor-north-1898',(7600,13000,14400,15800),.25),('kelantan-1898',(7100,4600,10400,9400),.3),('lawas-before-1905',(3300,3800,4300,5900),.65)]:
 trace=spec['traces'][name]
 im=Image.open(p/spec['maps'][trace['map']]['file']).convert('RGB').crop(box)
 im=im.resize((round(im.width*scale),round(im.height*scale)))
 d=ImageDraw.Draw(im)
 pts=[((x-box[0])*scale,(y-box[1])*scale) for x,y in trace['nativePixel']]
 d.line(pts,fill='#00baed',width=3)
 for i,(x,y) in enumerate(pts):
  d.ellipse((x-3,y-3,x+3,y+3),fill='#ff4a00')
  if i%4==0:d.text((x+5,y),str(i),fill='black',stroke_width=1,stroke_fill='white')
 dest=p/'work'/f'border-review-{name}.png';im.save(dest)
 print(dest)
