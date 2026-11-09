"""Development comparison sheets; references are never shipped as textures.
Reference angles are explicitly stated. Unmatched front/end views remain audit
views and are not mislabelled as a photo registration or GPU acceptance."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import sys, json
base=Path(__file__).parent
round=sys.argv[1] if len(sys.argv)>1 else '1'
out=Path('/tmp/atlas-heart-round4')/('round'+round)
refs=base/'refs'
proof_file=out/'evidence-reuse.json'
proof={p['id']:p for p in json.loads(proof_file.read_text())} if proof_file.exists() else {}
references={
 'fish': [('fish-profile','fish-profile','profile / profile'),('fish-three-quarter','fish-oblique','shallow three-quarter / shallow three-quarter'),('fish-front','Barsch3','near-front / near-front real perch'),('fish-close','Perca_fluviatilis_img_33558','profile head close / profile crop'),('fish-scales','fish-profile','scale relief macro / mid-flank profile crop')],
 'gills': [('gills-profile','gill-photo','lateral / lateral dissection'),('gills-three-quarter','gills-three-quarter-extra','oblique / opened gill curtains'),('gills-front','Gills_(esox)','end audit / ventral opening (pose difference)'),('gills-close','gill-structure','filament close / anatomical drawing')],
 'plant': [('plant-front','plant-oblique','front / near-front young Capsicum'),('plant-three-quarter','plant-oblique','three-quarter / oblique young Capsicum'),('plant-profile','AgroFidanishtja_Havolli_pepper_seedling','side / nursery seedling side crop'),('plant-close','plant-oblique','leaf detail / leaf crop')],
}
for hero,views in references.items():
 if len(sys.argv)>2 and hero!=sys.argv[2]: continue
 sheet=Image.new('RGB',(1280,len(views)*540),(233,228,216));d=ImageDraw.Draw(sheet)
 for i,(render,ref,angle) in enumerate(views):
  y=i*540
  d.text((12,y+12),f'{hero.upper()} / ROUND {round} — {angle}',fill='#2a2824')
  p=proof.get({'gills':'gills','plant':'plant-specimen'}.get(hero,''))
  evidence=f"ENGINE STUDIO + ACES / retained R{p['sourceRound']} CPU view; current surface SHA256 verified" if p else 'Shipping GLB + proposed fin-group patch / STUDIO + ACES / CPU'
  d.text((12,y+32),evidence,fill='#555047')
  d.text((652,y+32),f'Wikimedia Commons: {ref} (see REBUILD-3D.md for URL/credit)',fill='#555047')
  im=Image.open(out/(render+'.png'));sheet.paste(im,(0,y+55))
  reference=refs/(ref+'.jpg')
  if not reference.exists(): reference=refs/(ref+'.png')
  im=Image.open(reference).convert('RGB')
  if ref=='fish-oblique': im=ImageOps.mirror(im)
  if ref=='AgroFidanishtja_Havolli_pepper_seedling': im=im.crop((im.width*.645,im.height*.375,im.width*.995,im.height*.84))
  if render=='fish-close': im=im.crop((0,im.height*.22,im.width*.50,im.height*.72))
  if render=='fish-scales': im=im.crop((im.width*.35,im.height*.36,im.width*.67,im.height*.65))
  if render=='plant-close': im=im.crop((im.width*.1,im.height*.12,im.width*.92,im.height*.55))
  im.thumbnail((620,470));sheet.paste(im,(650+(620-im.width)//2,y+55+(470-im.height)//2))
 sheet.save(out/(hero+'-comparison.jpg'),quality=94)
