#!/usr/bin/env python3
"""Rebuild local publication assets from fixed read-only snapshots; stdlib only.
No downloads and no raw fossil coordinates copied to audit outputs.
"""
import argparse,bisect,collections,csv,hashlib,io,json,math,pathlib,struct,zipfile,zlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
P=argparse.ArgumentParser();P.add_argument('--inputs',type=pathlib.Path,default=pathlib.Path('/Users/gavin/work/atlas/art/research/dinosaur-earth/data'));P.add_argument('--frames',nargs='*',type=int);args=P.parse_args();INPUT=args.inputs
OUT=ROOT/'public/geo';WORK=ROOT/'scripts/geo/dinosaur-earth';LIMIT=85.051129
bi=lambda en,zh:dict(en=en,zh=zh)
def emit(stem,obj):
 p=OUT/(stem+'.json');p.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n');return dict(file=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
def area(r):return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:]))/2

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
 # Delta-encoded integers on the published lattice; every vertex is already a lattice point.
 def encode(line):
  q=[(round((x+180)/GRID_X),round((y+LIMIT)/GRID_Y)) for x,y in line]
  return [list(q[0])]+[[b[0]-a[0],b[1]-a[1]] for a,b in zip(q,q[1:])]
 return dict(type='Topology',transform=dict(scale=[GRID_X,GRID_Y],translate=[-180,-LIMIT]),objects={stem:dict(type='GeometryCollection',geometries=objects)},arcs=[encode(a) for a in arcs])

def crossings(r):
 # Reject proper self-crossings and repeated non-closure vertices (pinches).
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

# Coastline tracing. PaleoDEM v2 is a 1-degree grid of elevations, so the coast is known only to lie
# between a land sample and its non-land neighbour. Trace it there, then round the grid-scale corners.
# check_samples proves afterwards that no sample changed side.
T_MIN,T_MAX=.25,.75 # crossing stays in the middle half of a land/non-land grid edge
SMOOTH_PASSES=2     # Chaikin corner cutting
DP_TOLERANCE=.05    # degrees; under one CSS pixel at the map's zoom ceiling of 3.6 (17 px per degree)
GRID_X=.02;GRID_Y=2*LIMIT/round(2*LIMIT/.02) # published lattice, 1/50 of the source spacing; both polar crops are lattice rows

def clean(run,closed):
 # Exact duplicates arise only where a zero-width border cell meets a corner.
 out=[]
 for p in run:
  if not out or out[-1]!=p:out.append(p)
 if closed and len(out)>1 and out[0]==out[-1]:out.pop()
 return out

def chaikin(run,closed):
 pts=run
 for _ in range(SMOOTH_PASSES):
  if len(pts)<3:break
  out=[] if closed else [pts[0]]
  pairs=list(zip(pts,pts[1:]+pts[:1])) if closed else list(zip(pts,pts[1:]))
  for i,(a,b) in enumerate(pairs):
   q=(.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]);r=(.25*a[0]+.75*b[0],.25*a[1]+.75*b[1])
   # Open runs keep their end vertices, which sit on the frame cut.
   if closed or i>0:out.append(q)
   if closed or i<len(pairs)-1:out.append(r)
  if not closed:out.append(pts[-1])
  pts=out
 return pts

def douglas(run):
 keep=[False]*len(run);keep[0]=keep[-1]=True;stack=[(0,len(run)-1)]
 while stack:
  i,j=stack.pop()
  if j<=i+1:continue
  a,b=run[i],run[j];dx=b[0]-a[0];dy=b[1]-a[1];n=math.hypot(dx,dy);best=-1;at=-1
  for k in range(i+1,j):
   p=run[k];d=abs((p[0]-a[0])*dy-(p[1]-a[1])*dx)/n if n else math.hypot(p[0]-a[0],p[1]-a[1])
   if d>best:best=d;at=k
  if best>DP_TOLERANCE:keep[at]=True;stack+=[(i,at),(at,j)]
 return [p for p,k in zip(run,keep) if k]

def simplify_closed(run):
 # Anchor a closed ring at two far-apart vertices, keeping at least a triangle.
 far=max(range(len(run)),key=lambda k:(run[k][0]-run[0][0])**2+(run[k][1]-run[0][1])**2)
 if far==0:return run
 a=douglas(run[:far+1]);b=douglas(run[far:]+run[:1])
 out=a[:-1]+b[:-1]
 return out if len(out)>=3 else run

def distance(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];n=dx*dx+dy*dy;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n)) if n else 0
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

def coastline(grid,xs,ys):
 x0,x1=xs[0],xs[-1];rows=[y for y in ys if abs(y)<=85]
 # The polar crop is a row of the row nearest it; the outer rows and columns are zero-width
 # non-land cells, so land reaching the frame closes exactly along the frame edge.
 lat=[-LIMIT,-LIMIT]+rows+[LIMIT,LIMIT];lon=[x0]+xs+[x1];nx=len(lon);ny=len(lat)
 src=[None,rows[0]]+rows+[rows[-1],None]
 def z(i,j):
  if i==0 or i==nx-1 or j==0 or j==ny-1:return None
  return grid[lon[i],src[j]]
 land=lambda v:v is not None and v>0
 def cross(i,j,i2,j2):
  a=z(i,j);b=z(i2,j2)
  if not land(a):i,j,i2,j2,a,b=i2,j2,i,j,b,a
  # a is land. A crossing into a frame cell lands on the frame edge at the land sample.
  if b is None:return (lon[i],lat[j])
  t=max(T_MIN,min(T_MAX,a/(a-min(b,-1.))))
  return (lon[i]+(lon[i2]-lon[i])*t,lat[j]+(lat[j2]-lat[j])*t)
 nxt={};pos={}
 for j in range(ny-1):
  for i in range(nx-1):
   c=[(i,j),(i+1,j),(i+1,j+1),(i,j+1)];v=[z(*q) for q in c];l=[land(q) for q in v]
   if not any(l) or all(l):continue
   # Edge k joins corners k and k+1, counter-clockwise. Land stays on the left of every segment.
   key=lambda k:tuple(sorted((c[k],c[(k+1)%4])))
   starts=[k for k in range(4) if l[k] and not l[(k+1)%4]];ends=[k for k in range(4) if not l[k] and l[(k+1)%4]]
   for k in starts+ends:
    if key(k) not in pos:pos[key(k)]=cross(*c[k],*c[(k+1)%4])
   if len(starts)==1:nxt[key(starts[0])]=key(ends[0]);continue
   # Saddle: the bilinear centre of the source elevations decides which diagonal connects.
   centre=sum(q for q in v)/4 if all(q is not None for q in v) else -1
   for s in starts:
    e=(s+1)%4 if centre>0 else (s-1)%4
    nxt[key(s)]=key(e)
 rings=[];todo=set(nxt);before=after=0;shift=0.
 onframe=lambda a,b:a[0]==b[0] and a[0] in (x0,x1) or a[1]==b[1] and abs(a[1])==LIMIT
 def finish(pts):
  return [(p[0] if p[0] in (x0,x1) else -180+round((p[0]+180)/GRID_X)*GRID_X,p[1] if abs(p[1])==LIMIT else -LIMIT+round((p[1]+LIMIT)/GRID_Y)*GRID_Y) for p in pts]
 while todo:
  start=min(todo);k=start;raw=[]
  while True:
   todo.discard(k);raw.append(pos[k]);k=nxt[k]
   if k==start:break
  raw=clean(raw,True);n=len(raw);before+=n
  flags=[onframe(raw[i],raw[(i+1)%n]) for i in range(n)]
  if not any(flags):
   smooth=chaikin(raw,True);out=finish(simplify_closed(smooth));shift=max(shift,max(min(distance(p,raw[i],raw[(i+1)%n]) for i in range(n)) for p in out))
  else:
   # Rotate to a frame edge; smooth each coast run with its end vertices pinned to the frame.
   s=next(i for i in range(n) if flags[i]);raw=raw[s+1:]+raw[:s+1];flags=flags[s+1:]+flags[:s+1];out=[];run=[raw[0]]
   for i in range(n):
    if flags[i]:
     smooth=douglas(chaikin(run,False)) if len(run)>2 else run
     if len(run)>2:shift=max(shift,max(min(distance(p,a,b) for a,b in zip(run,run[1:])) for p in smooth))
     out+=finish(smooth);run=[raw[(i+1)%n]]
    else:run.append(raw[(i+1)%n])
   out=finish(out)
  out=clean(out,True);assert len(out)>=3,'collapsed ring';after+=len(out);out.append(out[0])
  assert abs(area(out))>0 and not crossings(out),'bad ring';rings.append(out)
 assert not ring_contacts(rings),'rings touch or cross'
 return rings,dict(contourVertices=before,publishedVertices=after,maxSmoothingShiftDegrees=round(shift,4))

def ring_contacts(rings):
 # Proper crossings or shared vertices between different rings would be new topology errors.
 cells=collections.defaultdict(list);count=0
 for n,r in enumerate(rings):
  for a,b in zip(r,r[1:]):
   for gx in range(math.floor(min(a[0],b[0])),math.floor(max(a[0],b[0]))+1):
    for gy in range(math.floor(min(a[1],b[1])),math.floor(max(a[1],b[1]))+1):cells[gx,gy].append((n,a,b))
 o=lambda p,q,s:(q[0]-p[0])*(s[1]-p[1])-(q[1]-p[1])*(s[0]-p[0])
 for items in cells.values():
  for u,(n,a,b) in enumerate(items):
   for m,c,d in items[u+1:]:
    if m==n:continue
    if {a,b}&{c,d} or (o(a,b,c)*o(a,b,d)<0 and o(c,d,a)*o(c,d,b)<0):count+=1
 return count

def check_samples(grid,xs,ys,rings):
 # Every published sample keeps its source land/non-land side (even-odd rule over all rings).
 rows=[y for y in ys if abs(y)<=85]
 hits={y:[] for y in rows}
 for r in rings:
  for a,b in zip(r,r[1:]):
   lo,hi=min(a[1],b[1]),max(a[1],b[1])
   for y in rows[max(0,bisect.bisect_left(rows,lo)):bisect.bisect_right(rows,hi)]:
    if (a[1]>y)!=(b[1]>y):hits[y].append(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))
 for y in rows:
  h=sorted(hits[y])
  for x in xs:
   # Frame columns are tested a hair inside the frame.
   px=x+1e-6 if x==xs[0] else x-1e-6 if x==xs[-1] else x
   assert (bisect.bisect_right(h,px)%2==1)==(grid[x,y]>0),f'sample changed side at {x},{y}'

def frame(item):
 raw=(INPUT/item['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==item['sha256'];assert zlib.crc32(raw)==item['crc32']
 data=[tuple(map(float,r)) for r in csv.reader(io.StringIO(raw.decode(),newline=None)) if r and not r[0].startswith('#')];grid={(x,y):z for x,y,z in data};xs=sorted({x for x,y,z in data});ys=sorted({y for x,y,z in data})
 assert len(grid)==len(data)==len(xs)*len(ys);assert all(math.isfinite(a) for row in data for a in row);assert all(b-a==1 for a,b in zip(xs,xs[1:]));assert all(b-a==1 for a,b in zip(ys,ys[1:]))
 rings,stats=coastline(grid,xs,ys)
 polys=polygons(rings)
 check_samples(grid,xs,ys,rings)
 ma=item['ageMa'];stem=f'de-land-{ma}';props=dict(modelId='paleomap-v2',frameMa=ma)
 geoms=[('land','MultiPolygon',polys,props),('coast','MultiLineString',[],props)]
 if xs[-1]<180:geoms.append(('unavailable','MultiPolygon',[[[(179,-LIMIT),(180,-LIMIT),(180,LIMIT),(179,LIMIT),(179,-LIMIT)]]],props))
 topo=topology(stem,geoms);lines=next(g for g in topo['objects'][stem]['geometries'] if g['properties']['kind']=='coast')['arcs'];result=emit(stem,topo);result.update(ageMa=ma,input=item['file'],inputSha256=item['sha256'],crc32=item['crc32'],sampleBounds=[xs[0],ys[0],xs[-1],ys[-1]],rows=len(data),zeroRows=sum(z==0 for x,y,z in data),seamLandSignMismatches=sum((grid[xs[0],y]>0)!=(grid[xs[-1],y]>0) for y in ys) if xs[-1]==180 else None,polygons=len(polys),rings=len(rings),coastLines=len(lines),zeroArea=0,selfCrossing=0,**stats)
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
 pts=[dict(id='site-singapore-modern',kind='reference',role='singapore',coordinateSpace='modern',at=[103.816925,1.366587],title=bi('Singapore: modern reference','新加坡：现代参照'),summary=bi('Where Singapore is today, for comparison. It is not a fossil find or a museum.','新加坡今天的位置，用来对照；不是化石发现地，也不是博物馆。'),sources=['S64']),dict(id='site-chicxulub-modern',kind='reference',role='impact-site',coordinateSpace='modern',at=[-89.5,21.333333],eventAge=dict(ma=66),title=bi('Chicxulub: modern locator','希克苏鲁伯：现代定位'),summary=bi('Approximate modern location; this point is not the crater outline or an ancient coordinate.','今天的近似位置；该点不是陨石坑轮廓，也不是古坐标。'),sources=['S61','S11'])]
 cards=[]
 for id,role,country,precision,region,title,summary,detail,sources in [
 ('card-thailand-find','regional-find','TH','region-only',bi('Nakhon Ratchasima','呵叻府'),bi('Sirindhorna in Thailand','泰国的诗琳通龙 Sirindhorna'),bi('Early Cretaceous evidence from the Khok Kruat Formation.','Khok Kruat 组的早白垩世证据。'),bi('The original description assigns the locality to the Aptian. This regional card is separate from the main map sample age and is not a precise find locator.','原始描述将该地点归入阿普特期。本卡按地区显示，与主图样本年龄分列，不标精确发现位置。'),['S20']),
 ('card-laos-find','regional-find','LA','country-only',bi('Laos','寮国'),bi('Ichthyovenator in Laos','寮国的鱼猎龙 Ichthyovenator'),bi('Early Cretaceous evidence includes partially associated postcranial remains.','早白垩世证据包括部分相连的头后骨骼。'),bi('Country-level evidence card, not a complete skeleton or an exact locality. Its geological age is separate from the main reconstruction sample.','这是国家精度的证据卡，不代表完整骨架，也不标精确发现地点。其地层年龄与主图复原样本分列。'),['S21']),
 ('card-pahang-find','regional-find','MY','region-only',bi('Pahang','彭亨'),bi('Dinosaur teeth in Pahang','彭亨的恐龙牙齿'),bi('The researcher describes dinosaur teeth from Pahang.','研究者介绍了彭亨发现的恐龙牙齿。'),bi('The find location is withheld for protection. This card contains no point, centroid or invented radius; regional finds can be of different ages.','为保护发现地，原研究者将地点保密。本卡不设坐标、中心点或虚构半径；区域发现可能来自不同年代。'),['S22']),
 ('card-museum-origin','museum-origin','US','region-only',bi('Wyoming → Singapore','怀俄明州 → 新加坡'),bi('Fossils displayed in Singapore','在新加坡展出的化石'),bi('The museum describes diplodocid sauropods from Wyoming’s Jurassic Morrison Formation.','馆方介绍了来自怀俄明州侏罗纪莫里森组的梁龙科蜥脚类化石。'),bi('Dana Quarry, near Ten Sleep, Wyoming, is the reported origin. Singapore is the exhibition location; this card draws no transport route and makes no local-excavation claim.','馆方给出的来源是怀俄明州 Ten Sleep 附近的 Dana Quarry。新加坡是展出地点；本卡不画运输路线，也不将展出地当作本地出土证据。'),['S17','S57'])]:
  c=dict(id=id,kind='reference-card',role=role,coordinateSpace='modern',title=title,summary=summary,detail=detail,sources=sources,regionLabel=region,countryCode=country,precision=precision)
  if country in {'TH','LA','MY'}:c['linkedCountryFeatureId']=country
  cards.append(c)
 return [emit('de-reference-points',dict(version=1,coordinateSpace='modern',points=pts)),emit('de-reference-cards',dict(version=1,coordinateSpace='modern',cards=cards)),emit('de-modern-inset',dict(version=1,pointFiles=['de-modern-points','de-reference-points'],cardFiles=['de-reference-cards'],referenceFile='de-pbdb-references',suppression=dict(countryCode='MY',collections=3,occurrences=3)))]

items=json.loads((INPUT/'keyframes-csv.json').read_text());selected=[i for i in items if args.frames is None or i['ageMa'] in args.frames];frames=[frame(i) for i in selected]
if args.frames is not None:print(json.dumps(frames,indent=2));raise SystemExit
assets=modern();pointAsset,referenceAsset,derivation=pbdb();assets+=[pointAsset,referenceAsset]+editorial()
assets.append(emit('de-reconstruction',dict(version=1,modelId='paleomap-v2',modelLabel=bi('PALEOMAP PaleoDEM v2','PALEOMAP PaleoDEM v2'),coordinateSpace='reconstructed',geometryMeaning='exposed-land',method=bi('Strict-positive 1° model samples; coast traced between each land sample and its non-land neighbour and rounded, with every sample kept on its own side; separate dateline cut and polar crop. Zero is not land.','1°模型样本以严格正高程分类；海岸线在相邻的陆地样本与非陆地样本之间勾出并做圆滑，每个样本都留在原来的一侧；日界线与极区裁切单列。零值不归陆地。'),sources=['S29'],frames=[dict(id='frame-land-'+str(i['ageMa']),t=dict(ma=i['ageMa']),file='de-land-'+str(i['ageMa']),sampleBounds=[-180,-89,179,90] if i['ageMa']>=150 else [-180,-90,180,90],sources=['S29']) for i in items])))
report=dict(algorithm=f'z>0; contour between each land sample and its non-land neighbour, linear in elevation, crossing clamped to {T_MIN}-{T_MAX} of the grid edge; saddles by bilinear centre; {SMOOTH_PASSES} Chaikin passes; Douglas-Peucker {DP_TOLERANCE} deg; lattice {GRID_X} deg; every sample asserted on its source side; source edge excluded from coast',sampling=dict(spacingDegrees=1,positionAccuracy='unknown; not measured coastline error'),frames=frames,assets=assets,pbdb=derivation)
# The complete payload budget includes provenance-rich PBDB point JSON as well as geometry.
report['totalPublicBytes']=sum(x['bytes'] for x in frames+assets)
(WORK/'build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(totalPublicBytes=report['totalPublicBytes'],frameBytes=sum(x['bytes'] for x in frames),pointBytes=pointAsset['bytes'],modernGeometryBytes=sum(x['bytes'] for x in assets[:2])),indent=2))
