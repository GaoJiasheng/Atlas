"""Real-data dated layers. Requires shapely and pyproj; optional matplotlib for review PNGs."""
import csv, json, gzip, collections, math
from pathlib import Path
from shapely.geometry import shape, mapping, Point, Polygon, MultiPolygon
from shapely.ops import unary_union, transform
from shapely import make_valid
from pyproj import Transformer

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
RAW, WORK = BASE/'raw', BASE/'work'
PUBLIC = ROOT/'public/geo'
def load(name): return json.loads((RAW/name).read_text())
def save(name, data): (WORK/name).write_text(json.dumps(data, separators=(',', ':')))
project = Transformer.from_crs(4326, 3414, always_xy=True).transform
unproject = Transformer.from_crs(3414, 4326, always_xy=True).transform
def valid(g):
    g = make_valid(g)
    if g.geom_type == 'GeometryCollection': g = unary_union([p for p in g.geoms if p.geom_type in ('Polygon','MultiPolygon')])
    return g
areas = load('ura-mp2019-planning-area.geojson')['features']
area_shapes = [(a['properties']['PLN_AREA_N'], shape(a['geometry'])) for a in areas]
def area_of(p):
    return next((n for n,g in area_shapes if g.covers(p)), 'OUTSIDE')
# HDB building-contract towns are administrative datasets, not identical to URA planning areas.
# Kallang/Whampoa includes Novena; Central Area spans several small planning areas.
towns = {'ANG MO KIO':'AMK','BEDOK':'BD','BISHAN':'BH','BUKIT BATOK':'BB','BUKIT MERAH':'BM','BUKIT PANJANG':'BP','BUKIT TIMAH':'BT','CHOA CHU KANG':'CCK','CLEMENTI':'CL','GEYLANG':'GL','HOUGANG':'HG','JURONG EAST':'JE','JURONG WEST':'JW','KALLANG':'KWN','NOVENA':'KWN','MARINE PARADE':'MP','PASIR RIS':'PRC','PUNGGOL':'PG','QUEENSTOWN':'QT','SEMBAWANG':'SB','SENGKANG':'SK','SERANGOON':'SGN','TAMPINES':'TAP','TENGAH':'TG','TOA PAYOH':'TP','WOODLANDS':'WL','YISHUN':'YS', **{x:'CT' for x in ['OUTRAM','ROCHOR','DOWNTOWN CORE','SINGAPORE RIVER','RIVER VALLEY','MUSEUM','NEWTON','ORCHARD','TANGLIN','MARINA EAST','MARINA SOUTH','STRAITS VIEW']}}
rows = list(csv.DictReader((RAW/'hdb-properties.csv').open()))
def norm(s): return s.strip().upper()
residential = [r for r in rows if r['residential']=='Y']
by_town_block = collections.defaultdict(list)
by_address = collections.defaultdict(list)
for i,r in enumerate(rows):
    r['_index']=i
    by_town_block[(r['bldg_contract_town'], norm(r['blk_no']))].append(r)
    by_address[(norm(r['street']), norm(r['blk_no']))].append(r)
buildings=[]
for f in load('hdb-buildings.geojson')['features']:
    p=shape(f['geometry']).centroid
    buildings.append({'feature':f,'point':p,'area':area_of(p),'town':towns.get(area_of(p),'UNMAPPED')})
learn=collections.defaultdict(collections.Counter)
for b in buildings:
    fp=b['feature']['properties']
    candidates=by_town_block[(b['town'],norm(fp['BLK_NO']))]
    if len(candidates)==1:
        b['row']=candidates[0]; b['method']='town-block'
        learn[fp['ST_COD']][norm(candidates[0]['street'])]+=1
# A street code must have one learned name; conflicting codes are retained only for diagnostics.
street_map={code:next(iter(c)) for code,c in learn.items() if len(c)==1}
# For codes with no direct seed, intersect the town+block candidate street sets
# across all footprints carrying that code. Only singleton intersections are used.
# This recovers streets where every individual block number is repeated in town.
code_sets=collections.defaultdict(list)
for b in buildings:
    fp=b['feature']['properties']; candidates=by_town_block[(b['town'],norm(fp['BLK_NO']))]
    if candidates: code_sets[fp['ST_COD']].append({norm(r['street']) for r in candidates})
constraint_learned={}
for code,sets in code_sets.items():
    if code in street_map or code in learn: continue
    possible=set.intersection(*sets)
    if len(possible)==1:
        street_map[code]=next(iter(possible)); constraint_learned[code]=street_map[code]
for b in buildings:
    if 'row' in b: continue
    fp=b['feature']['properties']
    candidates=by_address[(street_map.get(fp['ST_COD'],'?'),norm(fp['BLK_NO']))]
    if len(candidates)==1: b['row']=candidates[0]; b['method']='learned-street-block'
    elif len(candidates)>1: b['ambiguous']=True
# One Property Information row is one block. Disconnected footprint pieces are dissolved before centroid.
grouped=collections.defaultdict(list)
for b in buildings:
    if 'row' in b: grouped[b['row']['_index']].append(b)
stats=collections.defaultdict(collections.Counter)
unmatched=[]; points=[]; matched_props=[]
for r in residential:
    bs=grouped.get(r['_index'],[]); town=r['bldg_contract_town']
    if not bs:
        possible=any(b['town']==town and norm(b['feature']['properties']['BLK_NO'])==norm(r['blk_no']) for b in buildings)
        stats[town]['ambiguous' if possible else 'unmatched']+=1; unmatched.append({k:v for k,v in r.items() if not k.startswith('_')}); continue
    # Several different ST_CODs with the same town+block can be an address collision. Reconfirm against learned street mapping.
    bs=[b for b in bs if b['feature']['properties']['ST_COD'] not in {k for k,c in learn.items() if len(c)>1} and street_map.get(b['feature']['properties']['ST_COD'],norm(r['street']))==norm(r['street'])]
    if not bs:
        stats[town]['ambiguous']+=1; unmatched.append({k:v for k,v in r.items() if not k.startswith('_')}); continue
    g=unary_union([shape(b['feature']['geometry']) for b in bs]); p=g.centroid
    f=int(r['year_completed']); h=int(r['max_floor_lvl'])
    points.append({'type':'Feature','properties':{'f':f,'h':h},'geometry':mapping(p)})
    stats[town]['matched']+=1
    stats[town]['by_street' if any(b['method']=='learned-street-block' for b in bs) else 'by_town']+=1
    matched_props.append({'town':town,'block':r['blk_no'],'street':r['street'],'f':f,'h':h,'footprints':len(bs),'point':[p.x,p.y]})
save('layers-hdb-matches.json',matched_props)
save('layers-hdb-unmatched.json',unmatched)
save('layers-hdb-street-map.json',{'mapping':street_map,'conflicts':{k:dict(v) for k,v in learn.items() if len(v)>1},'townCorrespondence':towns})
report={'hdb':{'residentialRows':len(residential),'matched':len(points),'rate':len(points)/len(residential),'footprintFeatures':len(buildings),'byTown':dict(stats),'unmatchedFile':'work/layers-hdb-unmatched.json','learnedStreetCodes':len(street_map),'constraintLearnedStreetCodes':len(constraint_learned),'conflictingStreetCodes':sum(len(c)>1 for c in learn.values())}}
save('layers-hdb-blocks.geojson',{'type':'FeatureCollection','features':sorted(points,key=lambda f:f['properties']['f'])})

land=load('ura-mp2019-landuse.geojson')['features']
business=[shape(f['geometry']) for f in land if f['properties']['LU_DESC'].startswith('BUSINESS')]
agriculture=[shape(f['geometry']) for f in land if f['properties']['LU_DESC']=='AGRICULTURE']
# Review 2026-10-20 (Opus): today's extent must not be drawn over the sea of an earlier year. Each area is
# cut into one piece per coast era of land-sg-modern (work/coast-<era>.geojson from build-coasts.ts), clipped
# to that era's land and dated [max(start, era from), era to). Areas whose start precedes no reclamation
# yield a single piece.
ERAS=[('L5',None,'1973-10-17'),('L6','1973-10-17','1979-10-31'),('L7','1979-10-31','1991-04-28'),('L8','1991-04-28','2002-10-11'),('L9','2002-10-11','2011-02-14'),('L10','2011-02-14','2019-11-18'),('L11','2019-11-18',None)]
def decimal_year(t):
    import datetime
    d=datetime.date.fromisoformat(t); y=datetime.date(d.year,1,1); n=datetime.date(d.year+1,1,1)
    return d.year+(d-y).days/(n-y).days
_era_land={}
def era_land(e):
    if e not in _era_land:
        _era_land[e]=valid(unary_union([valid(shape(f['geometry'])) for f in json.loads((WORK/f'coast-{e}.geojson').read_text())['features']]))
    return _era_land[e]
def by_coast_era(geom,year):
    out=[]
    for e,a,b in ERAS:
        fa=decimal_year(a) if a else None; fb=decimal_year(b) if b else None
        if fb is not None and fb<=year: continue
        piece=valid(geom.intersection(era_land(e)))
        if piece.is_empty or transform(project,piece).area<2000: continue
        f=max(year,fa) if fa is not None else year
        if out and out[-1][0].symmetric_difference(piece).area<1e-12:
            out[-1]=(out[-1][0],out[-1][1],fb); continue
        out.append((piece,f,fb))
    return out
def polygon_features(name, configurations, source):
    features=[]; details=[]
    for label, year, area_names in configurations:
        boundary=unary_union([g for n,g in area_shapes if n in area_names])
        # Equivalent to the shared overlap selector: >50% of the real URA parcel is within official areas.
        selected=[g for g in source if g.intersects(boundary) and g.intersection(boundary).area/g.area>=.5]
        if not selected:
            details.append({'name':label,'f':year,'parcels':0,'areaKm2':0}); continue
        merged=valid(unary_union(selected))
        for g,f,u in by_coast_era(merged,year):
            clean=transform(unproject,transform(project,g).simplify(5,preserve_topology=True))
            props={'f':f,'certainty':'approximate','name':label}
            if u is not None: props['u']=u
            features.append({'type':'Feature','properties':props,'geometry':mapping(clean)})
        details.append({'name':label,'f':year,'planningAreas':area_names,'parcels':len(selected),'areaKm2':transform(project,merged).area/1e6})
    save('layers-'+name+'.geojson',{'type':'FeatureCollection','features':features})
    report[name]=details
polygon_features('estates',[
    ('Jurong industrial area',1961,['JURONG EAST','JURONG WEST','BOON LAY','PIONEER']),
    ('Seletar Aerospace Park',2007,['SELETAR']),
],business)
polygon_features('farm-parks',[
    ('Agrotechnology-park farmland in Lim Chu Kang and the Western Water Catchment (Master Plan 2019)',1986,['LIM CHU KANG','WESTERN WATER CATCHMENT']),
    ('Sungei Tengah farmland',1986,['CHOA CHU KANG','TENGAH']),
    ('Nee Soon farmland',1986,['YISHUN','MANDAI']),
    ('Loyang farmland',1986,['PASIR RIS','CHANGI']),
],agriculture)
# Review 2026-10-20 (Opus): NParks' Bukit Timah history says Bukit Timah and the Municipal Water Catchment
# area became legally protected under the Nature Reserves Ordinance 1951; 1990 re-declared them under the
# National Parks Act. They are drawn from 1951 (continuous legal protection). Labrador, also listed in 1951,
# was later downgraded to a nature park, so it is drawn from its 2002 gazette, like Sungei Buloh.
reserve_dates={'CENTRAL CATCHMENT NATURE RESERVE':1951,'BUKIT TIMAH NATURE RESERVE':1951,'LABRADOR NATURE RESERVE':2002,'SUNGEI BULOH WETLAND RESERVE':2002}
features=[]
for f in load('parks.geojson')['features']:
    n=f['properties']['NAME']
    if n not in reserve_dates: continue
    for piece,fy,uy in by_coast_era(valid(shape(f['geometry'])),reserve_dates[n]):
        g=transform(unproject,transform(project,piece).simplify(5,preserve_topology=True))
        props={'f':fy,'certainty':'approximate','name':n}
        if uy is not None: props['u']=uy
        features.append({'type':'Feature','properties':props,'geometry':mapping(g)})
save('layers-reserves.geojson',{'type':'FeatureCollection','features':features})
report['reserves']=[f['properties'] for f in features]
# Earlier planning agriculture totals are calculations, never descriptions of actual farming.
report['plannedAgricultureKm2']={}
for edition,file in [('2003','mp2003.geojson'),('2008','mp2008.geojson'),('2014','mp2014.geojson'),('2019','ura-mp2019-landuse.geojson')]:
    if not (RAW/file).exists(): continue
    fs=load(file)['features']; selected=[f for f in fs if f['properties'].get('LU_DESC')=='AGRICULTURE']
    report['plannedAgricultureKm2'][edition]=sum(transform(project,shape(f['geometry'])).area for f in selected)/1e6
save('layers-statistics.json',report)
print(json.dumps(report,indent=2))
