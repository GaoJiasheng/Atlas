"""Anonymous MPC acquisition + reproducible water-index shoreline extraction.
Run via pnpm tsx scripts/geo/singapore-land-use/landsat-coast.ts [fetch|extract].
Signed URLs never persisted. Raw STAC metadata, cropped raster windows and SHA256 retained.
"""
import os,json,time,hashlib,sys
from pathlib import Path
import requests,numpy as np,rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
P=Path(__file__).parent; RAW=P/'raw';WORK=P/'work';RAW.mkdir(exist_ok=True);WORK.mkdir(exist_ok=True)
os.environ.update(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.TIF',GDAL_HTTP_MAX_RETRY='3')
# L7 MSS L1TP chosen over lower-cloud 1979 L1GS (unrectified). Later products are L2 SR as user explicitly permits.
CHOICES={1973:'LM01_L1TP_134059_19731017',1981:'LM02_L1TP_134059_19791031',1990:'LT05_L2SP_125059_19910428',2000:'LE07_L2SP_125059_20021011',2010:'LT05_L2SP_125059_20110214'}
BOX=[103.50,1.10,104.18,1.52]
def token(coll):
 r=requests.get('https://planetarycomputer.microsoft.com/api/sas/v1/token/'+coll,params={'_':time.time()});r.raise_for_status();return r.json()['token']
def fetch():
 receipts=[]
 for year,prefix in CHOICES.items():
  meta=RAW/f'pc-{year}.json'
  if not meta.exists():
   start,end={1973:(1972,1975),1981:(1979,1983),1990:(1988,1992),2000:(1999,2002),2010:(2008,2012)}[year]
   r=requests.post('https://planetarycomputer.microsoft.com/api/stac/v1/search',json={'collections':['landsat-c2-l1' if year<1982 else 'landsat-c2-l2'],'bbox':[103.55,1.15,104.1,1.48],'datetime':f'{start}-01-01T00:00:00Z/{end}-12-31T23:59:59Z','limit':1000});r.raise_for_status();meta.write_text(r.text)
  fs=json.loads(meta.read_text())['features']; c=[f for f in fs if f['id'].startswith(prefix)]
  if not c:raise RuntimeError(f'Required locked scene absent: {prefix}; do not silently substitute another date')
  f=c[0];coll=f['collection'];t=token(coll);keys=['green','nir08','nir09','red','qa_pixel'] if year<1982 else ['green','swir16','nir08','red','qa_pixel']
  (RAW/f'scene-{year}.json').write_text(json.dumps(f,indent=2));print(year,f['id'],f['properties']['eo:cloud_cover'],flush=True)
  for key in keys:
   path=RAW/f"landsat-{year}-{key}.tif";asset=f['assets'][key]
   marker=RAW/f'selected-{year}-{key}.txt'
   if path.exists() and (not marker.exists() or marker.read_text()!=f['id']):path.unlink()
   if not path.exists():
    with rasterio.open(asset['href']+'?'+t) as src:
     b=transform_bounds('EPSG:4326',src.crs,*BOX);win=from_bounds(*b,transform=src.transform).round_offsets().round_lengths();data=src.read(1,window=win);prof=src.profile.copy();prof.update(width=data.shape[1],height=data.shape[0],transform=src.window_transform(win),driver='GTiff',compress='deflate')
     with rasterio.open(path,'w',**prof) as dst:dst.write(data,1)
   marker.write_text(f['id'])
   receipts.append({'scene':f['id'],'acquired':f['properties']['datetime'],'scene_cloud_percent':f['properties']['eo:cloud_cover'],'band':key,'source':asset['href'],'file':str(path.relative_to(P)),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'accessed':'2026-10-20','method':'anonymous SAS; cropped window at native resolution'})
   print(' ',key,path.stat().st_size,flush=True)
 (RAW/'landsat-fetch-log.json').write_text(json.dumps(receipts,indent=2))

def extract():
 from shapely.geometry import shape,mapping,Polygon,MultiPolygon,Point
 from shapely.ops import unary_union,transform
 from shapely import make_valid
 from pyproj import Transformer
 from rasterio.features import rasterize,shapes
 from skimage.filters import threshold_otsu
 from scipy.ndimage import binary_closing,binary_opening,binary_fill_holes
 import matplotlib
 matplotlib.use('Agg')
 import matplotlib.pyplot as plt
 today=unary_union([shape(f['geometry']) for f in json.load(open(WORK/'input-today.geojson'))['features']]);coast_reference=unary_union([shape(f['geometry']) for f in json.load(open(RAW/'ura-mp2019-planning-area.geojson'))['features']]);stats=[];shots=Path('docs/screenshots/singapore-land-use');shots.mkdir(parents=True,exist_ok=True)
 def fc(geom):return {'type':'FeatureCollection','features':[{'type':'Feature','properties':{},'geometry':mapping(geom)}]}
 def pieces(g):
  if g.is_empty:return []
  if g.geom_type=='Polygon':return [g]
  return [p for c in g.geoms for p in pieces(c)]
 def write_geo(path,g,back):path.write_text(json.dumps(fc(transform(back.transform,g))))
 def draw(ax,g,**kw):
  for p in pieces(g):
   x,y=p.exterior.xy;ax.plot(x,y,**kw)
 for i,year in enumerate(CHOICES):
  f=json.load(open(RAW/f'scene-{year}.json'));mss=year<1982
  with rasterio.open(RAW/f'landsat-{year}-green.tif') as src:
   a=src.read(1).astype('float32');prof=src.profile;trs=src.transform;crs=src.crs;res=src.res[0]
  with rasterio.open(RAW/f"landsat-{year}-{'nir09' if mss else 'swir16'}.tif") as src:b=src.read(1).astype('float32')
  with rasterio.open(RAW/f'landsat-{year}-qa_pixel.tif') as src:qa=src.read(1)
  valid=(a>0)&(b>0);cloud=(qa&(2|8|16))!=0
  if mss:
   mt=RAW/f'mss{year}-mtl.json'
   if not mt.exists():
    r=requests.get(f['assets']['mtl.json']['href']+'?'+token(f['collection']));r.raise_for_status();mt.write_text(r.text)
   scale=json.load(open(mt))['LANDSAT_METADATA_FILE']['LEVEL1_RADIOMETRIC_RESCALING']
   a=a*float(scale['REFLECTANCE_MULT_BAND_4'])+float(scale['REFLECTANCE_ADD_BAND_4']);b=b*float(scale['REFLECTANCE_MULT_BAND_7'])+float(scale['REFLECTANCE_ADD_BAND_7'])
  else:a=a*0.0000275-0.2;b=b*0.0000275-0.2
  idx=(a-b)/np.maximum(a+b,0.0001);idx=np.clip(idx,-1,1)
  to=Transformer.from_crs(4326,crs,always_xy=True);back=Transformer.from_crs(crs,4326,always_xy=True);land=transform(to.transform,today)
  inside=rasterize([(mapping(land),1)],out_shape=a.shape,transform=trs).astype(bool)
  reference=transform(to.transform,coast_reference)
  belt=unary_union([p.exterior for p in pieces(reference)]).buffer(2000);band=rasterize([(mapping(belt),1)],out_shape=a.shape,transform=trs).astype(bool)
  threshold=float(threshold_otsu(idx[band&valid&~cloud]));dry=idx<threshold
  # Clouds/shadows and invalid pixels are unknown: retain today's land there, never infer reclamation under cloud.
  dry=np.where(valid&~cloud,dry,inside)
  # 3x3 closing only (1 pixel); remove isolated fragments during 0.1 km² vector filter. No smoothing of 2-pixel uncertainty buffers.
  dry=binary_closing(dry,structure=np.ones((3,3)))
  geoms=[shape(g) for g,v in shapes(dry.astype('uint8'),mask=dry,transform=trs) if v==1]
  observed=make_valid(unary_union(geoms))
  outer=unary_union([p.exterior for p in pieces(land)])
  minus=unary_union([p for p in pieces(make_valid(land.difference(observed.buffer(2*res)))) if p.area>=100000 and p.distance(outer)<=res])
  l5=transform(to.transform,unary_union([shape(g['geometry']) for g in json.load(open(WORK/'input-L5.geojson'))['features']]))
  plus=unary_union([p for p in pieces(make_valid(observed.buffer(-2*res).difference(land.buffer(2*res)).intersection(l5))) if p.area>=100000])
  # Singapore attribution mask: plus clipped to published G11 L5 (1961) land. This excludes Malaysia/Indonesia and turbid-water false land; lost land absent from L5 is not inferred.
  if not minus.is_empty:write_geo(WORK/f'landsat-L{i+6}-minus.geojson',minus,back)
  if not plus.is_empty:write_geo(WORK/f'landsat-L{i+6}-plus.geojson',plus,back)
  era=land.difference(minus).union(plus)
  write_geo(WORK/f'landsat-L{i+6}-land.geojson',era,back)
  # Independent geometric check on preselected upstream L5 unchanged coast away from detected reclamation.
  l5=transform(to.transform,unary_union([shape(g['geometry']) for g in json.load(open(WORK/'input-L5.geojson'))['features']]))
  coords=[]
  for p in [max(pieces(reference),key=lambda p:p.area)]:
   ring=p.exterior
   for x in np.arange(0,ring.length,100):
    pt=ring.interpolate(x)
    if pt.distance(l5.boundary)<=res and pt.distance(minus)>500:
     rr,cc=rasterio.transform.rowcol(trs,pt.x,pt.y)
     if 0<=rr<cloud.shape[0] and 0<=cc<cloud.shape[1] and not cloud[rr,cc]:coords.append(pt.distance(observed.boundary))
  dev=np.percentile(coords,[50,95]).tolist() if coords else [None,None]
  ps=[]
  for kind,g in [('minus',minus),('plus',plus)]:
   for j,p in enumerate(sorted(pieces(g),key=lambda p:-p.area)):
    c=transform(back.transform,p.centroid);ps.append({'kind':kind,'piece':j+1,'km2':round(p.area/1e6,4),'centroid':[round(c.x,5),round(c.y,5)],'project':'unmatched — requires engineering-source review'})
  row={'era':f'L{i+6}','id':f['id'],'date':f['properties']['datetime'][:10],'bands':'B4/B7 TOA reflectance' if mss else 'SR_B2/SR_B5 surface reflectance','index':'NDWI' if mss else 'MNDWI','threshold':threshold,'pixel_m':res,'scene_cloud_pct':f['properties']['eo:cloud_cover'],'island_cloud_shadow_pct':float(np.mean(cloud[inside])*100),'unchanged_samples':len(coords),'unchanged_p50_m':dev[0],'unchanged_p95_m':dev[1],'minus_km2':minus.area/1e6,'plus_km2':plus.area/1e6,'land_km2':era.area/1e6,'pieces':ps}
  stats.append(row);print(json.dumps({k:v for k,v in row.items() if k!='pieces'}),flush=True)
  with rasterio.open(RAW/f'landsat-{year}-nir08.tif') as src:nir=src.read(1).astype(float)
  with rasterio.open(RAW/f'landsat-{year}-red.tif') as src:red=src.read(1).astype(float)
  def stretch(x):
   lo,hi=np.percentile(x[x>0],[2,98]);return np.clip((x-lo)/(hi-lo),0,1)
  rgb=np.stack([stretch(nir),stretch(red),stretch(a)],axis=-1);fig,axs=plt.subplots(1,2,figsize=(16,7),layout='constrained');extent=[trs.c,trs.c+a.shape[1]*res,trs.f-a.shape[0]*res,trs.f]
  axs[0].imshow(rgb,extent=extent);draw(axs[0],era,color='yellow',linewidth=.6);axs[0].set_title(f"{row['era']} {row['date']} Landsat false colour / extracted era")
  draw(axs[1],land,color='#888888',linewidth=.5);draw(axs[1],era,color='#9d493d',linewidth=.8);axs[1].set_title(f"Red: era; grey: URA today · {row['index']} Otsu={threshold:.4f}")
  for ax in axs:ax.set_aspect('equal');ax.set_xlim(extent[:2]);ax.set_ylim(extent[2:]);ax.ticklabel_format(style='plain',useOffset=False)
  fig.savefig(shots/f"coast-L{i+6}.png",dpi=130);plt.close(fig)
 (P/'coast-statistics.json').write_text(json.dumps(stats,indent=2))
if __name__=='__main__':
 if len(sys.argv)<2 or sys.argv[1]=='fetch':fetch()
 elif sys.argv[1]=='extract':extract()
