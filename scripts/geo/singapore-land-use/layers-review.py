"""Review each output at four dates. Today’s official land outline is a reference only."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.path import Path as MPath
from matplotlib.patches import PathPatch
from shapely.geometry import shape
BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
OUT=ROOT/'docs/screenshots/singapore-land-use'
OUT.mkdir(parents=True,exist_ok=True)
areas=json.loads((BASE/'raw/ura-mp2019-planning-area.geojson').read_text())['features']
def draw(ax,g,color,edge,alpha=1):
    if g.geom_type=='MultiPolygon':
        for p in g.geoms: draw(ax,p,color,edge,alpha)
    elif g.geom_type=='Polygon':
        vertices=[]; codes=[]
        for ring in [g.exterior,*g.interiors]:
            coords=list(ring.coords);vertices+=coords;codes += [MPath.MOVETO]+[MPath.LINETO]*(len(coords)-2)+[MPath.CLOSEPOLY]
        ax.add_patch(PathPatch(MPath(vertices,codes),facecolor=color,edgecolor=edge,lw=.45,alpha=alpha))
colors={'hdb-blocks':'#bd7c3c','estates':'#7e6baa','farm-parks':'#a5a354','reserves':'#63866d','reservoirs':'#609ca8'}
for name,color in colors.items():
    file=BASE/('work/layers-reservoirs.geojson' if name=='reservoirs' else f'work/layers-final-{name}.geojson')
    data=json.loads(file.read_text())['features']
    for year in [1965,1980,2000,2019]:
        fig,ax=plt.subplots(figsize=(12,8),dpi=150);fig.patch.set_facecolor('#efece4');ax.set_facecolor('#dce7e8')
        for f in areas: draw(ax,shape(f['geometry']),'#f8f5eb','#8f938a')
        current=[f for f in data if f['properties']['f']<=year and f['properties'].get('u',1e9)>year]
        if name=='hdb-blocks':
            coords=[f['geometry']['coordinates'] for f in current]
            ax.scatter([p[0] for p in coords],[p[1] for p in coords],s=2,c=color,alpha=.85,linewidths=0)
        for f in ([] if name=='hdb-blocks' else current):
            g=shape(f['geometry'])
            if g.geom_type=='Point': ax.scatter([g.x],[g.y],s=2,c=color,alpha=.85,linewidths=0)
            else: draw(ax,g,color,color,.7)
        ax.set_xlim(103.59,104.1);ax.set_ylim(1.2,1.48);ax.set_aspect('equal');ax.grid(alpha=.15)
        ax.set_xlabel('Longitude');ax.set_ylabel('Latitude')
        ax.set_title(f'{name} | {year} | {len(current):,} active source features',loc='left',fontsize=16,pad=15)
        ax.text(0,-.13,"Real published geometries; reference outline is URA 2019. Area layers show approximate present extents.\nHDB points are matched residential blocks in current HDB datasets; demolished blocks are absent.",transform=ax.transAxes,fontsize=9,color='#555')
        fig.subplots_adjust(bottom=.18,top=.9);fig.savefig(OUT/f'layers-{name}-{year}.png',facecolor=fig.get_facecolor());plt.close(fig)
print('Wrote 20 layer review PNGs')
