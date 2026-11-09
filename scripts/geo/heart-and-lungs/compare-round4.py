"""Source-labelled round-four comparisons, always outside the repository."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import sys, shutil, subprocess
round = sys.argv[1] if len(sys.argv)>1 else '420'
root=Path('/tmp/atlas-heart-round4')
source=root/('round'+round)
output=root/'comparisons'
output.mkdir(exist_ok=True)
refs=Path(__file__).parent/'refs'
subprocess.run([sys.executable,str(Path(__file__).parent/'compare-sheets.py'),round,'fish'],check=True)
shutil.copy2(source/'fish-comparison.jpg',output/'fish-four-angles-and-scales.jpg')
def fit(im,w,h):
 return ImageOps.contain(im.convert('RGB'),(w,h),Image.Resampling.LANCZOS)
def sheet(name,render,reference,caption,crop=None):
 page=Image.new('RGB',(1920,620),'#e9e4d8');d=ImageDraw.Draw(page)
 d.text((16,10),f'R{round} / {caption}',fill='#2a2824')
 d.text((16,30),'Decoded shipping asset | actual studio rig + ACES | offline CPU, not GPU acceptance',fill='#555047')
 d.text((976,30),'Real reference: Pmau / Wikimedia Commons / CC BY-SA 4.0 / img_33558',fill='#555047')
 a=fit(Image.open(source/(render+'.png')),940,560)
 b=Image.open(refs/reference)
 if crop:b=b.crop(crop)
 b=fit(b,940,560)
 page.paste(a,(10+(940-a.width)//2,55+(560-a.height)//2))
 page.paste(b,(970+(940-b.width)//2,55+(560-b.height)//2))
 page.save(output/name)
sheet('head-vs-requested-perch.png','fish-close','Perca_fluviatilis_img_33558.jpg','Head profile / rounded maxilla and jaws. Model mouth open; photo mouth closed.',(170,220,460,445))
sheet('beat6-3-vs-requested-perch.png','fish-beat3','Perca_fluviatilis_img_33558.jpg','Actual 16:9 chapter 6 beat 3 camera. Model operculum open; real operculum closed.',(170,140,790,470))
sheet('beat6-2-vs-requested-perch.png','fish-beat2','Perca_fluviatilis_img_33558.jpg','Actual 16:9 chapter 6 beat 2 camera. Reference tail lies outside photograph.')
# Preserve every requested view separately as render | genuine same-view photo.
for render,ref,label,mirror,crop in [
 ('fish-front','Barsch3.jpg','Near-front; mouth/eye sockets. Real mouth closed.',False,None),
 ('fish-three-quarter','fish-oblique.jpg','Shallow three-quarter; reference mirrored to face left.',True,None),
 ('fish-profile','fish-profile.jpg','Lateral profile; reference preserved/dead specimen.',False,None),
 ('fish-close','Perca_fluviatilis_img_33558.jpg','Characteristic head detail; model mouth open.',False,(160,205,475,455)),
 ('fish-scales','fish-profile.jpg','Ctenoid flank scale relief; real mid-flank crop.',False,(450,310,850,600)),
]:
 page=Image.new('RGB',(1280,540),'#e9e4d8');d=ImageDraw.Draw(page)
 d.text((12,8),f'R{round} / {label}',fill='#2a2824')
 d.text((12,28),'ENGINE STUDIO + ACES / current runtime mesh',fill='#555047')
 d.text((652,28),f'Wikimedia Commons / {ref} / sources in REBUILD-3D.md',fill='#555047')
 im=fit(Image.open(source/(render+'.png')),630,480);page.paste(im,((640-im.width)//2,55+(480-im.height)//2))
 im=Image.open(refs/ref)
 if mirror:im=ImageOps.mirror(im)
 if crop:im=im.crop(crop)
 im=fit(im,620,480);page.paste(im,(650+(620-im.width)//2,55+(480-im.height)//2))
 page.save(output/(render+'-comparison.png'))
print(output.resolve())
