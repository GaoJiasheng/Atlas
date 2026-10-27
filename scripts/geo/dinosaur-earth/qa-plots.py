#!/usr/bin/env python3
"""Local-only paired QA plots. Run with a Python that already has Pillow."""
import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path(__file__).resolve().parent/'qa'
for f in sorted(root.glob('*.json')):
 d=json.loads(f.read_text());im=Image.new('RGB',(1460,410),'#f5f2e9');draw=ImageDraw.Draw(im)
 def pt(p,xoff):return (xoff+(p[0]+180)*2,40+(90-p[1])*2)
 for xo in [10,740]:draw.rectangle([xo,40,xo+720,400],fill='#dce8ec');draw.text((xo,10),f'{f.stem} Ma | '+('source z > 0 samples' if xo==10 else 'published land polygons'),fill='black')
 for x,y in d['samples']:
  px,py=pt((x,y),10);draw.rectangle([px-1,py-1,px+1,py+1],fill='#626b4e')
 for poly in d['polygons']:
  for i,ring in enumerate(poly):draw.polygon([pt(p,740) for p in ring],fill='#626b4e' if i==0 else '#dce8ec')
 draw.line([pt((179,-85.051129),740),pt((179,85.051129),740)],fill='#a6584c') if int(f.stem)>=150 else None
 im.save(f.with_suffix('.png'))
