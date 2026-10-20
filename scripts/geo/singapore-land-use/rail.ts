/**
 * Rebuild URA MP2019 MRT/LRT opening segments, without OneMap or OSM.
 * Python build dependencies: shapely >= 2, scipy, networkx.
 * Set RAIL_PYTHON to a Python executable with those packages installed.
 * Input provenance, dates, limitations: rail-report.md and research/rail.{md,json}.
 * Run from repo root: pnpm tsx scripts/geo/singapore-land-use/rail.ts
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const dir = 'scripts/geo/singapore-land-use';
mkdirSync(`${dir}/raw`, { recursive: true });
mkdirSync(`${dir}/work`, { recursive: true });
const inputs = [
  ['rail.geojson', 'd_222bfc84eb86c7c11994d02f8939da8d'],
  ['rail-stations.geojson', 'd_8d886e3a83934d7447acdf5bc6959999'],
  ['rail-station-names.geojson', 'd_bd17bca97549a4ab0fb7b6ad102d640c'],
];
for (const [file, dataset] of inputs) {
  if (existsSync(`${dir}/raw/${file}`)) continue;
  const endpoint = `https://api-open.data.gov.sg/v1/public/api/datasets/${dataset}/poll-download`;
  const result = spawnSync('curl', ['--fail', '--silent', '--show-error', endpoint], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Cannot obtain ${dataset}: ${result.stderr}`);
  const receipt = JSON.parse(result.stdout);
  if (receipt.code !== 0 || !receipt.data?.url) throw new Error(`Dataset unavailable: ${dataset}`);
  const download = spawnSync('curl', ['--fail', '--silent', '--show-error', receipt.data.url, '-o', `${dir}/raw/${file}`], { encoding: 'utf8' });
  if (download.status !== 0) throw new Error(`Download failed: ${file}: ${download.stderr}`);
}
writeFileSync(`${dir}/work/rail-input-receipts.json`, JSON.stringify(inputs.map(([file, dataset]) => ({
  file, dataset, sha256: createHash('sha256').update(readFileSync(`${dir}/raw/${file}`)).digest('hex'),
})), null, 2) + '\n');
const routes = {
  "nsl-toa-payoh-yio-chu-kang": "TOA PAYOH|BRADDELL|BISHAN|ANG MO KIO|YIO CHU KANG",
  "nsl-toa-payoh-raffles-place": "TOA PAYOH|NOVENA|NEWTON|ORCHARD|SOMERSET|DHOBY GHAUT|CITY HALL|RAFFLES PLACE",
  "ewl-raffles-place-outram-park": "RAFFLES PLACE|TANJONG PAGAR|OUTRAM PARK",
  "ewl-outram-park-clementi": "OUTRAM PARK|TIONG BAHRU|REDHILL|QUEENSTOWN|COMMONWEALTH|BUONA VISTA|DOVER|CLEMENTI",
  "ewl-clementi-lakeside": "CLEMENTI|JURONG EAST|CHINESE GARDEN|LAKESIDE",
  "nsl-yio-chu-kang-yishun": "YIO CHU KANG|KHATIB|YISHUN",
  "ewl-city-hall-tanah-merah": "CITY HALL|BUGIS|LAVENDER|KALLANG|ALJUNIED|PAYA LEBAR|EUNOS|KEMBANGAN|BEDOK|TANAH MERAH",
  "nsl-raffles-place-marina-bay": "RAFFLES PLACE|MARINA BAY",
  "ewl-tanah-merah-pasir-ris": "TANAH MERAH|SIMEI|TAMPINES|PASIR RIS",
  "branch-jurong-east-choa-chu-kang": "JURONG EAST|BUKIT BATOK|BUKIT GOMBAK|CHOA CHU KANG",
  "ewl-boon-lay-1990": "LAKESIDE|BOON LAY",
  "nsl-woodlands-extension": "CHOA CHU KANG|YEW TEE|KRANJI|MARSILING|WOODLANDS|ADMIRALTY|SEMBAWANG|CANBERRA|YISHUN",
  "ewl-tanah-merah-expo": "TANAH MERAH|EXPO",
  "ewl-expo-changi-airport": "EXPO|CHANGI AIRPORT",
  "nel-harbourfront-punggol": "HARBOURFRONT|OUTRAM PARK|CHINATOWN|CLARKE QUAY|DHOBY GHAUT|LITTLE INDIA|FARRER PARK|BOON KENG|POTONG PASIR|WOODLEIGH|SERANGOON|KOVAN|HOUGANG|BUANGKOK|SENGKANG|PUNGGOL",
  "ewl-boon-lay-joo-koon": "BOON LAY|PIONEER|JOO KOON",
  "ccl-bartley-marymount": "BARTLEY|SERANGOON|LORONG CHUAN|BISHAN|MARYMOUNT",
  "ccl-dhoby-ghaut-bartley": "DHOBY GHAUT|BRAS BASAH|ESPLANADE|PROMENADE|NICOLL HIGHWAY|STADIUM|MOUNTBATTEN|DAKOTA|PAYA LEBAR|MACPHERSON|TAI SENG|BARTLEY",
  "ccl-marymount-harbourfront": "MARYMOUNT|CALDECOTT|BUKIT BROWN|BOTANIC GARDENS|FARRER ROAD|HOLLAND VILLAGE|BUONA VISTA|ONE NORTH|KENT RIDGE|HAW PAR VILLA|PASIR PANJANG|LABRADOR PARK|TELOK BLANGAH|HARBOURFRONT",
  "ccl-promenade-marina-bay": "PROMENADE|BAYFRONT|MARINA BAY",
  "dtl-bugis-chinatown": "BUGIS|PROMENADE|BAYFRONT|DOWNTOWN|TELOK AYER|CHINATOWN",
  "nsl-marina-bay-marina-south-pier": "MARINA BAY|MARINA SOUTH PIER",
  "dtl-bukit-panjang-bugis": "BUKIT PANJANG|CASHEW|HILLVIEW|HUME|BEAUTY WORLD|KING ALBERT PARK|SIXTH AVENUE|TAN KAH KEE|BOTANIC GARDENS|STEVENS|NEWTON|LITTLE INDIA|ROCHOR|BUGIS",
  "ewl-joo-koon-tuas-link": "JOO KOON|GUL CIRCLE|TUAS CRESCENT|TUAS WEST ROAD|TUAS LINK",
  "dtl-chinatown-expo": "CHINATOWN|FORT CANNING|BENCOOLEN|JALAN BESAR|BENDEMEER|GEYLANG BAHRU|MATTAR|MACPHERSON|UBI|KAKI BUKIT|BEDOK NORTH|BEDOK RESERVOIR|TAMPINES WEST|TAMPINES|TAMPINES EAST|UPPER CHANGI|EXPO",
  "tel-woodlands-north-woodlands-south": "WOODLANDS NORTH|WOODLANDS|WOODLANDS SOUTH",
  "tel-woodlands-south-caldecott": "WOODLANDS SOUTH|SPRINGLEAF|LENTOR|MAYFLOWER|BRIGHT HILL|UPPER THOMSON|CALDECOTT",
  "tel-caldecott-gardens-by-the-bay": "CALDECOTT|MOUNT PLEASANT|STEVENS|NAPIER|ORCHARD|GREAT WORLD|HAVELOCK|OUTRAM PARK|MAXWELL|SHENTON WAY|MARINA BAY|MARINA SOUTH|GARDENS BY THE BAY",
  "tel-gardens-by-the-bay-bayshore": "GARDENS BY THE BAY|TANJONG RHU|KATONG PARK|TANJONG KATONG|MARINE PARADE|MARINE TERRACE|SIGLAP|BAYSHORE",
  "nel-punggol-punggol-coast": "PUNGGOL|PUNGGOL COAST",
  "bplrt-initial": "CHOA CHU KANG|SOUTH VIEW|KEAT HONG|TECK WHYE|PHOENIX|BUKIT PANJANG",
  "bplrt-loop": "BUKIT PANJANG|PETIR|PENDING|BANGKIT|FAJAR|SEGAR|JELEPANG|SENJA|BUKIT PANJANG",
  "sklrt-east": "SENGKANG CENTRAL|COMPASSVALE|RUMBIA|BAKAU|KANGKAR|RANGGUNG|SENGKANG CENTRAL",
  "sklrt-west": "SENGKANG CENTRAL|CHENG LIM|FARMWAY|KUPANG|THANGGAM|FERNVALE|LAYAR|TONGKANG|RENJONG|SENGKANG CENTRAL",
  "pglrt-east": "PUNGGOL CENTRAL|COVE|MERIDIAN|CORAL EDGE|RIVIERA|KADALOOR|OASIS|DAMAI|PUNGGOL CENTRAL",
  "pglrt-west-initial": "PUNGGOL CENTRAL|SOO TECK|SUMANG|NIBONG",
  "pglrt-west-sam-kee": "PUNGGOL CENTRAL|SUM KEE|TECK LEE|PUNGGOL POINT|SAMUDERA|NIBONG"
};
writeFileSync(`${dir}/work/rail-routes.json`, JSON.stringify(routes));
const python = String.raw`import json,math,networkx as nx,copy
from shapely.geometry import shape,Point,LineString
from shapely.ops import transform
from shapely.strtree import STRtree
from scipy.spatial import KDTree
from pathlib import Path
P=Path('scripts/geo/singapore-land-use')
project=lambda x,y,z=None:((x-103)*111303,(y-1)*110574)
unproject=lambda x,y:[round(x/111303+103,6),round(y/110574+1,6)]
fs=json.load(open(P/'raw/rail.geojson'))['features']
stations=json.load(open(P/'raw/rail-stations.geojson'))['features']
G=nx.Graph();ends=[];positions=[];idx={};types={};parts=[]
def node(p,t):
 k=tuple(round(c,4) for c in p)
 if k not in idx:idx[k]=len(positions);positions.append(p)
 n=idx[k];types.setdefault(n,set()).add(t);return n
# Source parts are noded at projected source endpoints, repairing linework seams.
sourceparts=[]
for f in fs:
 t=f['properties']['RAIL_TYPE']
 if t=='RAILWAY':continue
 ss=shape(f['geometry'])
 for l in [ss] if ss.geom_type=='LineString' else list(ss.geoms):
  sourceparts.append((transform(project,l).simplify(2),t,f['properties']['OBJECTID']))
spindex=STRtree([s[0] for s in sourceparts]);splits=[set([0,s[0].length]) for s in sourceparts];links=[]
for j,(l,t,oid) in enumerate(sourceparts):
 for end in [Point(l.coords[0]),Point(l.coords[-1])]:
  for k in spindex.query(end.buffer(65)):
   k=int(k);other,ot,_=sourceparts[k]
   if j==k or t!=ot or end.distance(other)>65:continue
   along=other.project(end);q=other.interpolate(along);splits[k].add(along)
   links.append((tuple(end.coords[0]),tuple(q.coords[0]),t))
for j,(l,t,oid) in enumerate(sourceparts):
 coords={l.project(Point(p)):p for p in l.coords}
 for d in splits[j]:coords[d]=tuple(l.interpolate(d).coords[0])
 ns=[node(p,t) for _,p in sorted(coords.items())];parts.append((l,t))
 for a,b in zip(ns,ns[1:]):
  if a!=b:G.add_edge(a,b,weight=math.dist(positions[a],positions[b]),source=oid)
for a,b,t in links:
 ai=node(a,t);bi=node(b,t)
 if ai!=bi:G.add_edge(ai,bi,weight=math.dist(a,b),source='snap')
tree=KDTree(positions)
# Names corrected using the MP2019 station-name annotation lines that intersect these polygons.
overrides={16:'DOWNTOWN',19:'CHINATOWN',28:'BENDEMEER',31:'NEWTON',121:'MAXWELL',139:'MARINA SOUTH',120:'ORCHARD BOULEVARD'}
polys={};snodes={};stationmetrics=[]
for f in stations:
 n=overrides.get(f['properties']['OBJECTID'],(f['properties']['NAME'] or '').strip().replace(' INTERCHANGE','').replace(' MRT','').replace(' STATION',''))
 if n=='RIVER VALLEY':n='FORT CANNING'
 if not n or n=='<Null>':continue
 t=f['properties']['RAIL_TYPE'];poly=transform(project,shape(f['geometry']));c=poly.centroid
 ns=[i for i in tree.query_ball_point([c.x,c.y],poly.length/2+70) if t in types[i] and poly.buffer(70).covers(Point(positions[i]))]
 if not ns:continue
 si=len(positions);positions.append((c.x,c.y));types[si]={t}
 for i in ns:G.add_edge(i,si,weight=math.dist(positions[i],positions[si]),source='station:'+n)
 snodes.setdefault((n,t),[]).append(si);polys[si]=poly
 stationmetrics.append({'name':n,'objectid':f['properties']['OBJECTID'],'attachments':len(ns),'max_spoke_m':round(max(math.dist(positions[i],positions[si]) for i in ns),2)})
routes=json.load(open(P/'work/rail-routes.json'))
routes['tel-caldecott-gardens-by-the-bay']=routes['tel-caldecott-gardens-by-the-bay'].replace('NAPIER|ORCHARD','NAPIER|ORCHARD BOULEVARD|ORCHARD')
register={r['id']:r for r in json.load(open(P/'research/rail.json'))}
register['bplrt-initial']['endpoints']=['Choa Chu Kang','Bukit Panjang']
register['bplrt-loop']=copy.deepcopy(register['bplrt-initial']);register['bplrt-loop']['id']='bplrt-loop';register['bplrt-loop']['endpoints']=['Bukit Panjang','Bukit Panjang loop']
# Primary-source precision only: month/year is permitted by the brief. No candidate-date promotion.
dates={'ewl-outram-park-clementi':'1988-03-13','nsl-yio-chu-kang-yishun':'1988-12-20','nsl-raffles-place-marina-bay':'1989-11-04','ewl-tanah-merah-pasir-ris':'1989-12-16','branch-jurong-east-choa-chu-kang':'1990-03-10','ewl-boon-lay-1990':'1990-07-06','nsl-woodlands-extension':'1996-02','nsl-marina-bay-marina-south-pier':'2014-11','ewl-joo-koon-tuas-link':'2017-06-18'}
movements=[];metrics=[]
for id,route in routes.items():
 row=register[id];t='LRT' if 'lrt' in id else 'MRT';names=route.split('|');candidates=[snodes.get((n,t),[]) for n in names]
 if any(not c for c in candidates):raise ValueError(('Missing station',id,[n for n,c in zip(names,candidates) if not c]))
 # Dynamic programming chooses one of the official interchange polygons without manual coordinates.
 state={n:(0,[]) for n in candidates[0]}
 for k,cs in enumerate(candidates[1:]):
  ns={}
  for a,(cost,paths) in state.items():
   dist,ps=nx.single_source_dijkstra(G,a)
   for b in cs:
    if b in dist:
     val=cost+dist[b]
     if b not in ns or val<ns[b][0]:ns[b]=(val,paths+[ps[b]])
  if not ns:raise ValueError(('Disconnected route',id,names[k:k+2]))
  state=ns
 else:
  cost,paths=min(state.values(),key=lambda v:v[0]);nodes=[]

  for path in paths:nodes.extend(path if not nodes else path[1:])
  raw=LineString([positions[n] for n in nodes]);simple=raw.simplify(4)
  # Preserve curvature and at most 150 m between vertices, including station-derived joins.
  coords=list(simple.coords);densified=[]
  for a,b in zip(coords,coords[1:]):
   count=max(1,math.ceil(math.dist(a,b)/150))
   densified.extend([(a[0]+(b[0]-a[0])*k/count,a[1]+(b[1]-a[1])*k/count) for k in range(count)])
  densified.append(coords[-1])
  # Collapse parallel published track traces to their midpoint when a nearby
  # source line is parallel and its nearest point lies laterally across the track.
  centred=[];shifts=[]
  for i,p in enumerate(densified):
   before=densified[max(0,i-1)];after=densified[min(len(densified)-1,i+1)]
   vx=after[0]-before[0];vy=after[1]-before[1];vl=math.hypot(vx,vy);pairs=[]
   if vl:
    for k in spindex.query(Point(p).buffer(25)):
     other,ot,_=sourceparts[int(k)]
     if ot!=t:continue
     along=other.project(Point(p));q=other.interpolate(along);dist=Point(p).distance(q)
     if not(2.5<=dist<=25):continue
     o1=other.interpolate(max(0,along-5));o2=other.interpolate(min(other.length,along+5))
     ox=o2.x-o1.x;oy=o2.y-o1.y;ol=math.hypot(ox,oy)
     if ol and abs((ox*vx+oy*vy)/(ol*vl))>.97 and abs(((q.x-p[0])*vx+(q.y-p[1])*vy)/(dist*vl))<.3:
      pairs.append((dist,q.x,q.y))
   if pairs:
    dist,x,y=min(pairs);centred.append(((p[0]+x)/2,(p[1]+y)/2));shifts.append(dist/2)
   else:centred.append(p)
  densified=centred
  date=dates.get(id,row['date']);assert date
  label=row['line']+': '+row['endpoints'][0]+'–'+row['endpoints'][1]
  movements.append({'id':id,'from':date,'to':date,'persist':True,'holder':'transport','kind':'land','label':{'en':label,'zh':'【待译】'+label},'path':{'type':'LineString','coordinates':[unproject(*p) for p in densified]}})
  bridges=[G.edges[a,b]['weight'] for a,b in zip(nodes,nodes[1:]) if G.edges[a,b]['source']=='snap']
  stationlinks=[G.edges[a,b]['weight'] for a,b in zip(nodes,nodes[1:]) if str(G.edges[a,b]['source']).startswith('station:')]
  sourceids=sorted({G.edges[a,b]['source'] for a,b in zip(nodes,nodes[1:]) if isinstance(G.edges[a,b]['source'],int)})
  metrics.append({'id':id,'date':date,'km':round(cost/1000,3),'vertices':len(densified),'centred_vertices':len(shifts),'centering_max_m':round(max(shifts,default=0),2),'source_objectids':sourceids,'snap_max_m':round(max(bridges,default=0),2),'station_spoke_max_m':round(max(stationlinks,default=0),2),'station_names':names})
  print(id,date,round(cost/1000,2),len(densified))
assert len(movements)==37, len(movements)
Path('src/content/topics/singapore-land-use/data/movements.json').write_text(json.dumps(movements,ensure_ascii=False,indent=2)+'\n')
(P/'work/rail-metrics.json').write_text(json.dumps({'routes':metrics,'stations':stationmetrics},indent=2)+'\n')
`;
const executable = process.env.RAIL_PYTHON ?? (existsSync(`${dir}/work/layers-venv/bin/python`) ? `${dir}/work/layers-venv/bin/python` : 'python3');
const result = spawnSync(executable, ['-c', python], { stdio: 'inherit' });
if (result.status !== 0) throw new Error(`Rail build failed (${result.status})`);
