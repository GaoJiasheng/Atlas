from pathlib import Path
import json,time,requests,rasterio,numpy as np
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds
from rasterio.features import rasterize
from shapely.geometry import shape,mapping
from shapely.ops import unary_union,transform
from pyproj import Transformer
import os
from concurrent.futures import ThreadPoolExecutor,as_completed
os.environ.update(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.TIF')
p=Path(__file__).parent;land=unary_union([shape(f['geometry']) for f in json.load(open(p/'work/input-today.geojson'))['features']]);reports={}
for y in [1973,1981,1990,2000,2010]:
 fs=json.load(open(p/f'raw/pc-{y}.json'))['features'];fs=[f for f in fs if f['id'].startswith({1973:'LM01_L1TP',1981:'LM02_L1TP',1990:'LT05',2000:'LE07',2010:'LT05'}[y])];fs=sorted(fs,key=lambda f:f['properties']['eo:cloud_cover']);t=requests.get('https://planetarycomputer.microsoft.com/api/sas/v1/token/'+fs[0]['collection'],params={'_':time.time()}).json()['token']; rows=[]
 def process(f):
  q=p/f"raw/cloud-{f['id']}.tif"
  if not q.exists():
   with rasterio.open(f['assets']['qa_pixel']['href']+'?'+t) as src:
    win=from_bounds(*transform_bounds('EPSG:4326',src.crs,103.5,1.10,104.18,1.52),transform=src.transform).round_offsets().round_lengths();a=src.read(1,window=win);prof=src.profile.copy();prof.update(width=a.shape[1],height=a.shape[0],transform=src.window_transform(win),compress='deflate')
    with rasterio.open(q,'w',**prof) as dst:dst.write(a,1)
  with rasterio.open(q) as src:
   a=src.read(1);tr=Transformer.from_crs(4326,src.crs,always_xy=True);g=transform(tr.transform,land);mask=rasterize([(mapping(g),1)],out_shape=a.shape,transform=src.transform).astype(bool);cloud=(a&(8|2|16))!=0;ratio=float(np.mean(cloud[mask]));row={'id':f['id'],'scene_cloud':f['properties']['eo:cloud_cover'],'island_cloud_shadow_pct':ratio*100};print(y,row,flush=True);return row
 with ThreadPoolExecutor(max_workers=5) as pool:
  for row in pool.map(process,fs):rows.append(row)
 reports[y]=sorted(rows,key=lambda r:r['island_cloud_shadow_pct']);(p/'scene-cloud.json').write_text(json.dumps(reports,indent=2))
