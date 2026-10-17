"""Fetch CP-only OSM extracts and enumerate named junction candidates.

Predictions locate search windows only. A predicted pixel is never a control.
The durable third-control-readings.json contains only manually identified marks.
"""
import json, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

D=Path(__file__).resolve().parent
places=[
 ('bukit-timah-jurong',103.776,1.342,0.006),
 ('bukit-panjang',103.758,1.379,0.006),
 ('woodlands-mandai',103.758,1.413,0.006),
 ('nee-soon',103.825,1.398,0.009),
 ('thomson-braddell',103.835,1.343,0.006),
 ('serangoon-tampines',103.891,1.359,0.007),
 ('serangoon-yiochukang',103.876,1.354,0.006),
 ('pasir-panjang-clementi',103.768,1.294,0.006),
 ('holland-farrer',103.807,1.312,0.006),
 ('bukit-timah-adam',103.815,1.325,0.006),
 ('thomson-balestier',103.842,1.327,0.006),
 ('changi-joochiat',103.899,1.315,0.006),
 ('serangoon-lavender',103.862,1.315,0.006),
 ('limchukang-choachukang',103.699,1.379,0.008),
]
def fetch(p):
 name,x,y,r=p
 path=D/'raw'/f'third-osm-{name}.json'
 url=f'https://api.openstreetmap.org/api/0.6/map.json?bbox={x-r/2:.6f},{y-r/2:.6f},{x+r/2:.6f},{y+r/2:.6f}'
 if not path.exists():
  subprocess.run(['curl','-fsS','--max-time','90',url,'-o',str(path)],check=True)
 data=json.loads(path.read_text())
 nodes={e['id']:e for e in data['elements'] if e['type']=='node'}
 ways=[e for e in data['elements'] if e['type']=='way' and e.get('tags',{}).get('highway') and e.get('tags',{}).get('name')]
 junctions=[]
 for i,a in enumerate(ways):
  for b in ways[i+1:]:
   an,bn=a['tags']['name'],b['tags']['name']
   if an==bn: continue
   for n in set(a['nodes'])&set(b['nodes']):
    if n not in nodes:continue
    node=nodes[n]
    item={'name':' / '.join(sorted([an,bn])),'node':n,'lnglat':[node['lon'],node['lat']]}
    if item not in junctions:junctions.append(item)
 return {'name':name,'url':url,'file':str(path.relative_to(D)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'junctions':junctions}
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=4) as pool: receipts=list(pool.map(fetch,places))
 (D/'work/third-osm-junctions.json').write_text(json.dumps(receipts,indent=2)+'\n')
 print('\n'.join(f"{r['name']}: {len(r['junctions'])} candidates" for r in receipts))
