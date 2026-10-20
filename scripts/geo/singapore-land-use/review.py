"""Source-comparison plates of published controls; images are review-only."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import PatchCollection
from matplotlib.patches import Polygon
from PIL import Image
p=Path(__file__).parent;shots=Path('docs/screenshots/singapore-land-use');shots.mkdir(parents=True,exist_ok=True)
colors={'housing':'#cc6677','countryside':'#ddcc77','agriculture':'#999933','industry':'#332288','green':'#117733','transport':'#88ccee','defence-special':'#882255','town-and-services':'#44aa99'}
cats=json.load(open(p/'landuse-categories.json'));reverse={v:k for k,vs in cats.items() for v in vs}
def render(ax,fc,source=False):
 patches=[];clrs=[]
 for f in fc['features']:
  g=f['geometry'];holder=reverse.get(f['properties'].get('LU_DESC')) if source else f['properties'].get('holder')
  if not holder:continue
  for rings in [g['coordinates']] if g['type']=='Polygon' else g['coordinates']:
   patches.append(Polygon(rings[0]));clrs.append(colors[holder])
 pc=PatchCollection(patches,facecolors=clrs,edgecolors='none',alpha=.7);ax.add_collection(pc);ax.set_xlim(103.55,104.12);ax.set_ylim(1.17,1.49);ax.set_aspect('equal');ax.set_facecolor('#dce6e8')
for id in ['K1','K4']:
 fig,ax=plt.subplots(1,2,figsize=(16,8),layout='constrained');fc=json.load(open(p/f'work/published-{id}.geojson'))
 if id=='K1':
  ax[0].imshow(Image.open(p/'raw/bis1959.jpg').convert('RGB'));ax[0].axis('off');lines=json.load(open(p/'lines.json'))
  for l in lines['lines'].values():
   xy=l['parts'][0]['via'];ax[0].plot([q[0] for q in xy],[q[1] for q in xy],color='red',linewidth=.8)
  ax[0].set_title('BIS April1959 · PD-UKGov · source-pixel anchors')
 else:render(ax[0],json.load(open(p/'raw/ura-mp2019-landuse.geojson')),True);ax[0].set_title('URA MP2019 source parcels · planned use · SODL1.0')
 render(ax[1],fc);ax[1].set_title(f'Published {id} · '+('approximate traced land use' if id=='K1' else 'dissolved planned use, DP10m'))
 fig.savefig(shots/f'geo-{id}.png',dpi=130);plt.close(fig)
