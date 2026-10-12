"""Make an offline review contact sheet from all six full-resolution previews."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--topic',choices=['chest','back','shoulders','arms','legs','core'],default='chest')
args=parser.parse_args()
canvas=Image.new('RGB',(1500,1250),'#ede7d6');draw=ImageDraw.Draw(canvas)
for i,name in enumerate(['front','back','left','exploded-by-layer','skin','pose']):
    path=ROOT/'cache'/f'{args.topic}-preview-{name}.png'
    with Image.open(path) as source:
        im=source.convert('RGB');im.thumbnail((500,590))
        canvas.paste(im,((i%3)*500+(500-im.width)//2,(i//3)*625+30))
    draw.text(((i%3)*500+15,(i//3)*625+10),name,fill='black')
path=ROOT/'cache'/f'{args.topic}-preview-contact.png'
canvas.save(path);print(path)
