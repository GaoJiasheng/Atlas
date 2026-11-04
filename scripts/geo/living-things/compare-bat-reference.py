"""Development-only photo comparisons. References stay outside the deployed site.
Run after decoded CPU previews; see Fix 2026-11-04 in REBUILD-3D.md.
"""
import argparse
from PIL import Image,ImageDraw,ImageOps
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--root',default='/tmp/atlas-living-fix-2026-11-04');parser.add_argument('--refs',default='/tmp/living-refs');args=parser.parse_args()
out=Path(args.root);refs=Path(args.refs)
for iteration in ['iteration2','iteration3','iteration5','iteration6','final']:
 folder=out/iteration
 if not (folder/'bat-face-1.png').exists():continue
 canvas=Image.new('RGB',(1280,740),'#e3ded1');d=ImageDraw.Draw(canvas)
 ref=Image.open(refs/'bat.jpg').crop((80,0,870,623));ref=ImageOps.contain(ref,(600,630));canvas.paste(ref,(20+(600-ref.width)//2,70+(630-ref.height)//2))
 model=Image.open(folder/'bat-face-1.png');canvas.paste(model,(640,70));d.text((20,20),'Cynopterus brachyotis / AntanO / CC BY-SA 4.0 / frontal',fill='#2a2824');d.text((660,20),'Decoded sculpture / frontal, elevation 28 degrees / '+iteration,fill='#2a2824');canvas.save(folder/'bat-reference-front.png')
 ref=Image.open(refs/'bat-head.jpg').rotate(-15,expand=True).crop((120,80,1050,850));ref=ImageOps.contain(ref,(600,630));canvas=Image.new('RGB',(1280,740),'#e3ded1');canvas.paste(ref,(20+(600-ref.width)//2,70+(630-ref.height)//2));canvas.paste(Image.open(folder/'bat-face-2.png'),(640,70));d=ImageDraw.Draw(canvas);d.text((20,20),'AntanO / CC BY-SA 3.0 / three-quarter / roll aligned -15 degrees',fill='#2a2824');d.text((660,20),'Decoded sculpture / azimuth 40, elevation 25 / '+iteration,fill='#2a2824');canvas.save(folder/'bat-reference-three-quarter.png')
