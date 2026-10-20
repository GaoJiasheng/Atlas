"""Additional source/packed-outline plates for the two inherited eras and modern reference."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
p=Path(__file__).parent;s=Path('docs/screenshots/singapore-land-use')
def draw(ax,fc):
 for f in fc['features']:
  g=f['geometry']
  for rings in [g['coordinates']] if g['type']=='Polygon' else g['coordinates']:
   x,y=zip(*rings[0]);ax.plot(x,y,color='#554d45',linewidth=.6)
 ax.set_xlim(103.55,104.12);ax.set_ylim(1.15,1.49);ax.set_aspect('equal')
for era,source in [('L4','G11'),('L5','G16'),('L11',None)]:
 fig,ax=plt.subplots(1,2,figsize=(16,8),layout='constrained')
 if source:
  img=Image.open(p/f'refs/history-{source}.jpg');img.draft('RGB',(2000,1800));img=img.convert('RGB');img.thumbnail((2000,1800));ax[0].imshow(img);ax[0].axis('off');ax[0].set_title(f'Inherited historical source {source} · PD-UKGov · not requalified')
 else:
  draw(ax[0],json.load(open(p/'raw/ura-mp2019-planning-area.geojson')));ax[0].set_title('URA MP2019 planning-area outline source · SODL')
 draw(ax[1],json.load(open(p/f'work/coast-{era}.geojson')));ax[1].set_title(f'Packed {era} · approximate; see geographic audit')
 fig.savefig(s/f'coast-{era}.png',dpi=130);plt.close(fig)
