"""Development-only photos remain in refs (ignored); sheets label imperfect angle matches."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import sys,json
root=Path('scripts/geo/magnets');prefix=sys.argv[1] if len(sys.argv)>1 else 'round1'
credits=json.loads((root/'evidence'/'reference-credits.json').read_text())
refs={
 'suspension-stand':{'front':'Retort stand with a clamp.jpg','three-quarter':'Retort stand.jpg','profile':'Retort stand with a clamp.jpg','detail':'Pince à 3 doigts.jpg'},
 'steel-can':{'front':'Empty tin can2009-01-19.jpg','three-quarter':'Empty tin can2009-01-19.jpg','profile':'Empty tin can2009-01-19.jpg','detail':'CanBottoms.JPG'},
 'em-cells':{'front':'AAbatteryholder.jpg','three-quarter':'AAbatteryholder.jpg','profile':'Battery AA horizontal.jpg','detail':'AA battery.png'}
}
for obj,angles in refs.items():
 for angle,ref in angles.items():
  path=root/'comparisons'/f'{prefix}-{obj}-{angle}.png'
  if not path.exists():continue
  left=Image.open(path).convert('RGB');im=Image.open(root/'refs'/ref).convert('RGB')
  if obj=='suspension-stand' and angle=='detail':im=im.crop((175,135,440,375))
  if obj=='steel-can' and angle=='detail':im=im.crop((0,0,im.width,im.height))
  im=ImageOps.contain(im,(600,570))
  out=Image.new('RGB',(1200,690),'#e9e4d8');out.paste(left,(0,50));out.paste(im,(600+(600-im.width)//2,70+(570-im.height)//2))
  d=ImageDraw.Draw(out);d.rectangle((0,0,1200,50),fill='#e9e4d8');d.text((15,12),f'{prefix}: {obj} / {angle} | Engine geometry + studio/ACES CPU render',fill='#2a2824');d.text((615,12),f'PHOTO: {ref}',fill='#2a2824');c=credits[ref];d.text((615,645),c['author']+' | '+c['license'],fill='#555047');d.text((615,660),'Photo resized/cropped; attribution + original URL: CREDITS.md',fill='#555047');d.text((615,675),'Nearest available specimen angle; not exact photogrammetry.',fill='#555047')
  out.save(root/'comparisons'/f'{prefix}-sheet-{obj}-{angle}.jpg',quality=92)
thumbs=[]
for p in (root/'comparisons').glob(f'{prefix}-sheet-*.jpg'):
 im=Image.open(p);im.thumbnail((600,345));thumbs.append(im)
o=Image.new('RGB',(1200,345*((len(thumbs)+1)//2)),'#e9e4d8')
for i,im in enumerate(thumbs):o.paste(im,((i%2)*600,(i//2)*345))
o.save(root/'comparisons'/f'{prefix}-all-sheets.jpg',quality=90)
