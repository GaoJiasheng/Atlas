#!/usr/bin/env python3
"""Rebuild local publication assets from fixed read-only snapshots; stdlib only.
No downloads and no raw fossil coordinates copied to audit outputs.
"""
import argparse,collections,csv,hashlib,io,json,math,pathlib,struct,zipfile,zlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
P=argparse.ArgumentParser();P.add_argument('--inputs',type=pathlib.Path,default=pathlib.Path('/Users/gavin/work/atlas/art/research/dinosaur-earth/data'));P.add_argument('--frames',nargs='*',type=int);args=P.parse_args();INPUT=args.inputs
OUT=ROOT/'public/geo';WORK=ROOT/'scripts/geo/dinosaur-earth';LIMIT=85.051129
bi=lambda en,zh:dict(en=en,zh=zh)
def emit(stem,obj):
 p=OUT/(stem+'.json');p.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n');return dict(file=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
def area(r):return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:]))/2
def turn(a,b,c):return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])
def compact(r,closed=True):
 if closed:r=r[:-1]
 keep=[p for i,p in enumerate(r) if i==0 and not closed or i==len(r)-1 and not closed or turn(r[i-1],p,r[(i+1)%len(r)])!=0]
 return keep+[keep[0]] if closed else keep

def inside(p,r):
 x,y=p;v=False
 for a,b in zip(r,r[1:]):
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:v=not v
 return v

def polygons(rings):
 outers=[r for r in rings if area(r)>0];holes=[r for r in rings if area(r)<0];out=[[r] for r in outers]
 for r in holes:
  # CW hole has its interior on the right; a tiny right-side midpoint avoids touching vertices.
  a,b=r[:2];dx=b[0]-a[0];dy=b[1]-a[1];n=math.hypot(dx,dy);p=((a[0]+b[0])/2+dy/n*1e-7,(a[1]+b[1])/2-dx/n*1e-7)
  matches=[i for i,o in enumerate(outers) if inside(p,o)]
  assert matches,'hole without parent';idx=min(matches,key=lambda i:abs(area(outers[i])));out[idx].append(r)
 return out

def topology(stem,geoms):
 # Reuse each genuine coastline arc in both polygon rings and the coast layer.
 # Cut/polar/unavailable edges only occur in polygon arcs, never in coast refs.
 arcs=[];objects=[];coastrefs=[]
 def arc(line):
  bounded=[line[0]]
  for a,b in zip(line,line[1:]):
   if abs(a[0]-b[0])>180:bounded.append(((a[0]+b[0])/2,(a[1]+b[1])/2))
   bounded.append(b)
  arcs.append(bounded);return len(arcs)-1
 ma=geoms[0][3]['frameMa'];east=179 if ma>=150 else 180
 def border(a,b):return a[0]==b[0] and a[0] in (-180,east) or a[1]==b[1] and abs(a[1])==LIMIT
 for kind,typ,coords,props in geoms:
  if kind=='coast':
   objects.append(dict(type='MultiLineString',arcs=coastrefs,properties=dict(kind=kind,**props)));continue
  aa=[]
  for poly in coords:
   rr=[]
   for ring in poly:
    if kind!='land':rr.append([arc(ring)]);continue
    flags=[border(a,b) for a,b in zip(ring,ring[1:])]
    # Start where cut/coast classification changes, avoiding two artificial end runs.
    transitions=[i for i in range(len(flags)) if flags[i]!=flags[i-1]]
    k=transitions[0] if transitions else 0
    seq=ring[k:-1]+ring[:k]+[ring[k]];flags=flags[k:]+flags[:k]
    refs=[];run=[seq[0]];old=flags[0]
    for i,flag in enumerate(flags):
     if flag!=old:
      idx=arc(run);refs.append(idx)
      if not old:coastrefs.append([idx])
      run=[seq[i]];old=flag
     run.append(seq[i+1])
    idx=arc(run);refs.append(idx)
    if not old:coastrefs.append([idx])
    rr.append(refs)
   aa.append(rr)
  objects.append(dict(type=typ,arcs=aa,properties=dict(kind=kind,**props)))
 return dict(type='Topology',objects={stem:dict(type='GeometryCollection',geometries=objects)},arcs=arcs)

def crossings(r):
 # Exact orthogonal raster boundaries cannot properly cross without sharing a vertex.
 # Also reject repeated non-closure vertices (pinches) rather than hiding them.
 assert len(set(map(tuple,r[:-1])))==len(r)-1,'repeated ring vertex'
 seg=sorted(zip(r,r[1:]),key=lambda s:min(s[0][0],s[1][0]));active=[]
 for a,b in seg:
  active=[s for s in active if max(s[0][0],s[1][0])>=min(a[0],b[0])]
  for c,d in active:
   if set((a,b))&set((c,d)):continue
   o=lambda p,q,s:(q[0]-p[0])*(s[1]-p[1])-(q[1]-p[1])*(s[0]-p[0])
   if o(a,b,c)*o(a,b,d)<0 and o(c,d,a)*o(c,d,b)<0:return True
  active.append((a,b))
 return False

def frame(item):
 raw=(INPUT/item['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==item['sha256'];assert zlib.crc32(raw)==item['crc32']
 data=[tuple(map(float,r)) for r in csv.reader(io.StringIO(raw.decode(),newline=None)) if r and not r[0].startswith('#')];grid={(x,y):z for x,y,z in data};xs=sorted({x for x,y,z in data});ys=sorted({y for x,y,z in data})
 assert len(grid)==len(data)==len(xs)*len(ys);assert all(math.isfinite(a) for row in data for a in row);assert all(b-a==1 for a,b in zip(xs,xs[1:]));assert all(b-a==1 for a,b in zip(ys,ys[1:]))
 edges=set();coast=set()
 def add(a,b,is_coast):
  assert a!=b
  if (b,a) in edges:edges.remove((b,a))
  else:edges.add((a,b))
  if is_coast:coast.add((a,b))
 for (x,y),z in grid.items():
  if z<=0 or y+.5<=-LIMIT or y-.5>=LIMIT:continue
  w=max(xs[0],x-.5);e=min(xs[-1],x+.5);s=max(-LIMIT,y-.5);n=min(LIMIT,y+.5)
  if w==e or s==n:continue
  corners=[(w,s),(e,s),(e,n),(w,n)]
  for i,(dx,dy) in enumerate([(0,-1),(1,0),(0,1),(-1,0)]):
   a,b=corners[i],corners[(i+1)%4];neighbor=grid.get((x+dx,y+dy));isc=neighbor is not None and neighbor<=0
   # Source border, latitude crop and unsampled strip edges never become coast.
   if i==0 and s==-LIMIT or i==2 and n==LIMIT:isc=False
   add(a,b,isc)
 outgoing=collections.defaultdict(list)
 for a,b in edges:outgoing[a].append(b)
 rings=[];remaining=set(edges)
 while remaining:
  start=min(remaining);a,b=start;ring=[a];remaining.remove(start)
  while b!=ring[0]:
   ring.append(b);choices=[c for c in outgoing[b] if (b,c) in remaining];assert choices,'open boundary'
   # Keep land on the left, separating diagonal contacts rather than welding them.
   def rank(c):return math.atan2(turn(a,b,c),(b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))
   c=max(choices,key=rank);remaining.remove((b,c));a,b=b,c
  ring.append(b)
  # A pinched loop can contain simple subcycles at repeated vertices.
  queue=[ring]
  while queue:
   r=queue.pop();seen={};split=False
   for j,p in enumerate(r[:-1]):
    if p in seen:
     k=seen[p];queue.extend([r[k:j+1],r[:k]+r[j:]]);split=True;break
    seen[p]=j
   if not split:r=compact(r);assert abs(area(r))>0 and not crossings(r);rings.append(r)
 polys=polygons(rings)
 # Join coast edges only at ordinary degree-2 vertices; preserve branch contacts.
 adjacency=collections.defaultdict(list)
 for a,b in coast:adjacency[a].append(b);adjacency[b].append(a)
 todo={tuple(sorted((a,b))) for a,b in coast};lines=[]
 while todo:
  edge=min(todo);a,b=edge
  if len(adjacency[a])==2 and len(adjacency[b])!=2:a,b=b,a
  line=[a,b];todo.remove(tuple(sorted((a,b))))
  while len(adjacency[b])==2:
   c=next(c for c in adjacency[b] if c!=a);edge=tuple(sorted((b,c)))
   if edge not in todo:break
   todo.remove(edge);line.append(c);a,b=b,c
  lines.append(compact(line,False))
 for line in lines:
  for a,b in zip(line,line[1:]):assert not(a[0]==b[0] and a[0] in (xs[0],xs[-1])) and not(a[1]==b[1] and abs(a[1])==LIMIT)
 ma=item['ageMa'];stem=f'de-land-{ma}';props=dict(modelId='paleomap-v2',frameMa=ma)
 geoms=[('land','MultiPolygon',polys,props),('coast','MultiLineString',lines,props)]
 if xs[-1]<180:geoms.append(('unavailable','MultiPolygon',[[[(179,-LIMIT),(180,-LIMIT),(180,LIMIT),(179,LIMIT),(179,-LIMIT)]]],props))
 result=emit(stem,topology(stem,geoms));result.update(ageMa=ma,input=item['file'],inputSha256=item['sha256'],crc32=item['crc32'],sampleBounds=[xs[0],ys[0],xs[-1],ys[-1]],rows=len(data),zeroRows=sum(z==0 for x,y,z in data),seamLandSignMismatches=sum((grid[xs[0],y]>0)!=(grid[xs[-1],y]>0) for y in ys) if xs[-1]==180 else None,polygons=len(polys),rings=len(rings),coastLines=len(lines),zeroArea=0,selfCrossing=0)
 # QA image data is source categorical samples plus actual final polygons, never public.
 (WORK/'qa').mkdir(exist_ok=True);(WORK/'qa'/f'{ma}.json').write_text(json.dumps(dict(samples=[[x,y] for x,y,z in data if z>0],polygons=polys)))
 return result

def shp(path):
 z=zipfile.ZipFile(path);b=z.read(next(n for n in z.namelist() if n.endswith('.shp')));dbf=z.read(next(n for n in z.namelist() if n.endswith('.dbf')));count=struct.unpack('<I',dbf[4:8])[0];hl,rl=struct.unpack('<HH',dbf[8:12]);fields=[];p=32
 while dbf[p]!=13:f=dbf[p:p+32];fields.append((f[:11].split(b'\0')[0].decode(),f[16]));p+=32
 p=100;out=[]
 for i in range(count):
  row=dbf[hl+i*rl:hl+(i+1)*rl];d={};q=1
  for name,length in fields:d[name]=row[q:q+length].decode(errors='replace').strip(' \0');q+=length
  words=struct.unpack('>i',b[p+4:p+8])[0];a=b[p+8:p+8+words*2];p+=8+words*2;assert struct.unpack('<i',a[:4])[0]==5;nr,np=struct.unpack('<ii',a[36:44]);idx=list(struct.unpack('<'+str(nr)+'i',a[44:44+nr*4]))+[np];pts=list(zip(*[iter(struct.unpack('<'+str(np*2)+'d',a[44+nr*4:]))]*2));rings=[]
  for j in range(nr):
   # Round only, below 0.1m at equator. Shapefile exterior is clockwise; convert to RFC7946.
   r=[(round(max(-180,min(180,x)),6),round(y,6)) for x,y in pts[idx[j]:idx[j+1]]];r=r[::-1];rings.append(r)
  out.append((d,rings))
 return out

def modern():
 features=[]
 for i,(d,rings) in enumerate(shp(INPUT/'ne_110m_land.zip')):features.append(dict(type='Feature',id=f'land-{i}',properties={},geometry=dict(type='MultiPolygon',coordinates=polygons(rings))))
 land=emit('de-modern-land',dict(type='FeatureCollection',features=features))
 # Countries needed by the two regional views and source-linked evidence cards.
 wanted={'TH','LA','MY','SG','MX','VN','KH','MM','ID','BN','PH','TL','BZ','GT','CU'};features=[]
 for d,rings in shp(INPUT/'ne_50m_admin_0_countries.zip'):
  code=d.get('ISO_A2_EH') or d.get('ISO_A2')
  if code not in wanted:continue
  features.append(dict(type='Feature',id=code,properties=dict(name=d['ADMIN'],countryCode=code),geometry=dict(type='MultiPolygon',coordinates=polygons(rings))))
 countries=emit('de-modern-countries',dict(type='FeatureCollection',features=features));return [land,countries]

def pbdb():
 union={};origin=collections.defaultdict(set);counts={};hashes={}
 for name,src in [('pbdb-global-bounded-2000.csv','S65'),('pbdb-th-la-my.csv','S66')]:
  raw=(INPUT/name).read_bytes();hashes[name]=hashlib.sha256(raw).hexdigest();s=raw.decode();assert 'Creative Commons CC0' in s[:1000];rows=list(csv.DictReader(io.StringIO(s[s.index('"occurrence_no"'):])));counts[src]=len(rows)
  for r in rows:
   oid=r['occurrence_no'];origin[oid].add(src)
   if oid in union:assert union[oid]==r,'conflicting occurrence'
   else:union[oid]=r
 suppressed=[r for r in union.values() if r['cc']=='MY'];groups=collections.defaultdict(list)
 for r in union.values():
  if r['cc']=='MY':continue
  assert r['lng'] and r['lat'],'missing coordinate';assert float(r['max_ma'])>=float(r['min_ma'])>=0;assert -180<=float(r['lng'])<=180 and -90<=float(r['lat'])<=90
  groups[r['collection_no']].append(r)
 points=[]
 references={}
 for r in union.values():
  if r['cc']=='MY':continue
  ref=r['reference_no'];text=r['primary_reference']
  assert ref and text,'missing publication reference'
  if ref in references:assert references[ref]==text,'conflicting publication reference'
  references[ref]=text
 (WORK/'publication-references.json').write_text(json.dumps(dict(sorted(references.items(),key=lambda x:int(x[0]))),ensure_ascii=False,indent=2)+'\n')
 for cid,rows in sorted(groups.items(),key=lambda t:int(t[0])):
  r=rows[0];assert len({(r['lng'],r['lat'],r['cc']) for r in rows})==1,'collection coordinate conflict'
  src=sorted(set(s for r in rows for s in origin[r['occurrence_no']]))
  ages=[]
  for r in sorted(rows,key=lambda r:int(r['occurrence_no'])):
   # References remain verbatim scholarly attribution. Do not expose precise prose-locality fields.
   basis=f"Published age bounds; PBDB ref {r['reference_no']}."
   ages.append(dict(pbdbOccurrenceId=r['occurrence_no'],olderMa=float(r['max_ma']),youngerMa=float(r['min_ma']),basis=bi(basis,f"文献年龄界限；PBDB文献{r['reference_no']}。"),sources=sorted(origin[r['occurrence_no']])))
  precision=r['latlng_precision'] or 'not specified';basis=r['latlng_basis'] or 'not specified'
  basis_zh={'based on nearby landmark':'据附近地标','estimated from map':'据地图估计','stated in text':'原文载明','not specified':'未注明','based on political unit':'据行政区','unpublished field data':'未发表野外资料'}
  assert basis in basis_zh,'untranslated coordinate basis'
  points.append(dict(id='pbdb-col-'+cid,kind='fossil-collection',coordinateSpace='modern',at=[float(r['lng']),float(r['lat'])],title=bi('Collection '+cid,'采集记录组 '+cid),summary=bi('Modern find location.','现代发现位置。'),sources=src,pbdbCollectionId=cid,countryCode=r['cc'],precision=bi(f'Code {precision}; {basis}.',f'精度码{precision}；{basis_zh[basis]}。'),occurrenceAges=ages))
 assert (len(union),len(suppressed),len({r['collection_no'] for r in suppressed}),len(points),sum(len(p['occurrenceAges']) for p in points))==(2106,3,3,1274,2103)
 referenceAsset=emit('de-pbdb-references',dict(version=1,references=dict(sorted(references.items(),key=lambda x:int(x[0])))))
 return emit('de-modern-points',dict(version=1,coordinateSpace='modern',points=points)),referenceAsset,dict(inputSha256=hashes,inputOccurrences=counts,unionOccurrences=len(union),suppressedCollections=3,suppressedOccurrences=3,publishedOccurrences=2103,publishedCollections=1274,publishedCountries=len({p['countryCode'] for p in points}),excludedMissingCoordinates=0,duplicateOccurrences=sum(counts.values())-len(union),collection24178=next(p for p in points if p['pbdbCollectionId']=='24178'))

def editorial():
 pts=[dict(id='site-singapore-modern',kind='reference',role='singapore',coordinateSpace='modern',at=[103.816925,1.366587],title=bi('Singapore: modern reference','新加坡：现代参照'),summary=bi('Natural Earth label anchor, not a fossil find or museum address.','Natural Earth 的制图标注点，不是化石发现地或博物馆地址。'),sources=['S64']),dict(id='site-chicxulub-modern',kind='reference',role='impact-site',coordinateSpace='modern',at=[-89.5,21.333333],eventAge=dict(ma=66),title=bi('Chicxulub: modern locator','希克苏鲁伯：现代定位'),summary=bi('Approximate modern location; this point is not the crater outline or an ancient coordinate.','今天的近似位置；该点不是陨石坑轮廓，也不是古坐标。'),sources=['S61','S11'])]
 cards=[]
 for id,role,country,precision,region,title,summary,detail,sources in [
 ('card-thailand-find','regional-find','TH','region-only',bi('Nakhon Ratchasima','呵叻府'),bi('Sirindhorna in Thailand','泰国的诗琳通龙 Sirindhorna'),bi('Early Cretaceous evidence from the Khok Kruat Formation.','Khok Kruat 组的早白垩世证据。'),bi('The original description assigns the locality to the Aptian. This regional card is separate from the main map sample age and is not a precise find locator.','原始描述将该地点归入阿普特期。本卡按地区显示，与主图样本年龄分列，不标精确发现位置。'),['S20']),
 ('card-laos-find','regional-find','LA','country-only',bi('Laos','老挝'),bi('Ichthyovenator in Laos','老挝的鱼猎龙 Ichthyovenator'),bi('Early Cretaceous evidence includes partially associated postcranial remains.','早白垩世证据包括部分相连的头后骨骼。'),bi('Country-level evidence card, not a complete skeleton or an exact locality. Its geological age is separate from the main reconstruction sample.','这是国家精度的证据卡，不代表完整骨架，也不标精确发现地点。其地层年龄与主图复原样本分列。'),['S21']),
 ('card-pahang-find','regional-find','MY','region-only',bi('Pahang','彭亨'),bi('Dinosaur teeth in Pahang','彭亨的恐龙牙齿'),bi('The researcher describes dinosaur teeth from Pahang.','研究者介绍了彭亨发现的恐龙牙齿。'),bi('The find location is withheld for protection. This card contains no point, centroid or invented radius; regional finds can be of different ages.','为保护发现地，原研究者将地点保密。本卡不设坐标、中心点或虚构半径；区域发现可能来自不同年代。'),['S22']),
 ('card-museum-origin','museum-origin','US','region-only',bi('Wyoming → Singapore','怀俄明州 → 新加坡'),bi('Fossils displayed in Singapore','在新加坡展出的化石'),bi('The museum describes diplodocid sauropods from Wyoming’s Jurassic Morrison Formation.','馆方介绍了来自怀俄明州侏罗纪莫里森组的梁龙科蜥脚类化石。'),bi('Dana Quarry, near Ten Sleep, Wyoming, is the reported origin. Singapore is the exhibition location; this card draws no transport route and makes no local-excavation claim.','馆方给出的来源是怀俄明州 Ten Sleep 附近的 Dana Quarry。新加坡是展出地点；本卡不画运输路线，也不将展出地当作本地出土证据。'),['S17','S57'])]:
  c=dict(id=id,kind='reference-card',role=role,coordinateSpace='modern',title=title,summary=summary,detail=detail,sources=sources,regionLabel=region,countryCode=country,precision=precision)
  if country in {'TH','LA','MY'}:c['linkedCountryFeatureId']=country
  cards.append(c)
 return [emit('de-reference-points',dict(version=1,coordinateSpace='modern',points=pts)),emit('de-reference-cards',dict(version=1,coordinateSpace='modern',cards=cards)),emit('de-modern-inset',dict(version=1,pointFiles=['de-modern-points','de-reference-points'],cardFiles=['de-reference-cards'],referenceFile='de-pbdb-references',suppression=dict(countryCode='MY',collections=3,occurrences=3)))]

items=json.loads((INPUT/'keyframes-csv.json').read_text());selected=[i for i in items if args.frames is None or i['ageMa'] in args.frames];frames=[frame(i) for i in selected]
if args.frames is not None:print(json.dumps(frames,indent=2));raise SystemExit
assets=modern();pointAsset,referenceAsset,derivation=pbdb();assets+=[pointAsset,referenceAsset]+editorial()
assets.append(emit('de-reconstruction',dict(version=1,modelId='paleomap-v2',modelLabel=bi('PALEOMAP PaleoDEM v2','PALEOMAP PaleoDEM v2'),coordinateSpace='reconstructed',geometryMeaning='exposed-land',method=bi('Strict-positive 1° model samples; nearest-sample cells, separate dateline cut and polar crop. Zero is not land.','1°模型样本以严格正高程分类；采用最近样本格元，日界线与极区裁切单列。零值不归陆地。'),sources=['S29'],frames=[dict(id='frame-land-'+str(i['ageMa']),t=dict(ma=i['ageMa']),file='de-land-'+str(i['ageMa']),sampleBounds=[-180,-89,179,90] if i['ageMa']>=150 else [-180,-90,180,90],sources=['S29']) for i in items])))
report=dict(algorithm='nearest-sample categorical cells; z>0; no nonzero simplification tolerance; exact collinear reduction; source edge excluded from coast',sampling=dict(spacingDegrees=1,interiorMaximumDistanceToSampleDegrees=math.sqrt(.5),positionAccuracy='unknown; not measured coastline error'),frames=frames,assets=assets,pbdb=derivation)
# The complete payload budget includes provenance-rich PBDB point JSON as well as geometry.
report['totalPublicBytes']=sum(x['bytes'] for x in frames+assets)
(WORK/'build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(totalPublicBytes=report['totalPublicBytes'],frameBytes=sum(x['bytes'] for x in frames),pointBytes=pointAsset['bytes'],modernGeometryBytes=sum(x['bytes'] for x in assets[:2])),indent=2))
