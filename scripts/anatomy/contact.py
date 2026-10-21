"""Make an offline review contact sheet from full-resolution rest or pose previews."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--topic',choices=['chest','back','shoulders','arms','legs','core','digestive','heart-lungs'],default='chest')
parser.add_argument('--pose',action='store_true')
args=parser.parse_args()
names=['pose','pose-front','pose-back','pose-left','pose-anatomy','wire-pose'] if args.pose else ['front','back','left','exploded-by-layer','skin','wire-rest']
if args.topic=='digestive':
    if args.pose: raise SystemExit('Static region has no pose')
    names=['front','left','exploded-by-role','tube-only','centrelines','skin-overlay']
if args.topic=='heart-lungs':
    if args.pose: raise SystemExit('Static region has no pose')
    names=['front','airway-only','vessels-only','heart-cover','heart-close','cover']
canvas=Image.new('RGB',(1500,1250),'#ede7d6');draw=ImageDraw.Draw(canvas)
for i,name in enumerate(names):
    path=ROOT/'cache'/f'{args.topic}-preview-{name}.png'
    with Image.open(path) as source:
        im=source.convert('RGB');im.thumbnail((500,590))
        canvas.paste(im,((i%3)*500+(500-im.width)//2,(i//3)*625+30))
    draw.text(((i%3)*500+15,(i//3)*625+10),name,fill='black')
path=ROOT/'cache'/(f'{args.topic}-preview-'+('pose-contact.png' if args.pose else 'contact.png'))
canvas.save(path);print(path)
