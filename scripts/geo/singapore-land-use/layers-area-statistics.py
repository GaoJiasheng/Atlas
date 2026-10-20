"""Calculated source geometry areas and floor medians; never observed land-use shares."""
import json,csv,collections,statistics
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import unary_union,transform
from shapely.prepared import prep
from shapely import make_valid
from pyproj import Transformer
BASE=Path(__file__).resolve().parent
proj=Transformer.from_crs(4326,3414,always_xy=True).transform
source=json.loads((BASE/'raw/ura-mp2019-landuse.geojson').read_text())['features']
categories=json.loads((BASE/'landuse-categories.json').read_text())
reverse={v:k for k,values in categories.items() for v in values}
today=unary_union([shape(f['geometry']) for f in json.loads((BASE/'work/input-today.geojson').read_text())['features']])
prepared=prep(today)
distinct=collections.defaultdict(lambda:{'features':0,'sourceAreaM2':0,'officialShapeAreaM2':0})
grouped=collections.defaultdict(list)
for f in source:
    desc=f['properties']['LU_DESC']; g=make_valid(shape(f['geometry']))
    d=distinct[desc];d['features']+=1;d['officialShapeAreaM2']+=f['properties']['SHAPE.AREA'];d['sourceAreaM2']+=transform(proj,g).area
    if desc not in reverse: continue
    if not prepared.intersects(g):continue
    clipped=g if prepared.covers(g) else g.intersection(today)
    if not clipped.is_empty: grouped[reverse[desc]].append(clipped)
cat={}
for name,geoms in grouped.items():
    g=make_valid(unary_union(geoms));cat[name]={'areaKm2':transform(proj,g).area/1e6,'sourceParcels':len(geoms)}
total=sum(d['areaKm2'] for d in cat.values())
for d in cat.values():d['percentOfMappedPlannedCategories']=100*d['areaKm2']/total
rows=[r for r in csv.DictReader((BASE/'raw/hdb-properties.csv').open()) if r['residential']=='Y']
floors=collections.defaultdict(list)
for r in rows:floors[(int(r['year_completed'])//10)*10].append(int(r['max_floor_lvl']))
medians={str(y):{'blocks':len(v),'medianMaxFloorLevel':statistics.median(v)} for y,v in sorted(floors.items())}
data={'method':'SVY21 EPSG:3414 area; source areas projected from real geometry. Category geometry dissolved after clipping to decoded L11 land. Shares exclude ROAD/WATERBODY and are permissible planned-use categories, not observed activity. Floor medians are calculated from all residential=Y current Property Information rows, not only geolocated matches.','distinct':dict(sorted(distinct.items())),'categories':cat,'mappedCategoryKm2':total,'floorMedians':medians}
(BASE/'work/layers-area-statistics.json').write_text(json.dumps(data,indent=2))
lines=['# Calculated MP2019 areas and current HDB floor medians','','Method: '+data['method'],'','| LU_DESC | Features | Projected source geometry km² | Official SHAPE.AREA km² | Category |','|---|---:|---:|---:|---|']
for n,d in sorted(distinct.items()):lines.append(f"| {n} | {d['features']} | {d['sourceAreaM2']/1e6:.6f} | {d['officialShapeAreaM2']/1e6:.6f} | {reverse.get(n,'excluded' if n in ['ROAD','WATERBODY'] else 'UNMAPPED')} |")
lines+=['','COMMERCIAL / INSTITUTION is placed explicitly in town-and-services. No source feature has LU_DESC NATURE RESERVE. The countryside category is only in K1, so it has zero MP2019 mapped area.','','| Planned-use category | Area clipped/dissolved to L11 km² | % mapped categories |','|---|---:|---:|']
for n,d in cat.items():lines.append(f"| {n} | {d['areaKm2']:.6f} | {d['percentOfMappedPlannedCategories']:.3f} |")
lines+=['','| Completion decade | Current residential property rows | Median maximum floor level |','|---|---:|---:|']
for n,d in medians.items():lines.append(f"| {n}s | {d['blocks']} | {d['medianMaxFloorLevel']} |")
lines+=['','Sources: URA Master Plan 2019 Land Use G2, URA Planning Area Boundary (No Sea) G3 via decoded L11 outline, HDB Property Information G4; data.gov.sg / Singapore Open Data Licence v1.0. All calculations by the Atlas build, 20 October 2026.','']
(BASE/'layers-area-statistics.md').write_text('\n'.join(lines))
print(json.dumps({'categories':cat,'floorMedians':medians},indent=2))
