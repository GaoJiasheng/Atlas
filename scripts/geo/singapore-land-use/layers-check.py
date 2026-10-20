"""Check decoded final layer geometry and chronology (after dated-layers.ts)."""
import json,math
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import unary_union
from shapely.prepared import prep
from shapely.validation import explain_validity
BASE=Path(__file__).resolve().parent
WORK=BASE/'work'
report={}
for name in ['hdb-blocks','estates','farm-parks','reserves','reservoirs']:
    path=WORK/('layers-reservoirs.geojson' if name=='reservoirs' else f'layers-final-{name}.geojson')
    fs=json.loads(path.read_text())['features']
    bad=[{'index':i,'reason':explain_validity(shape(f['geometry']))} for i,f in enumerate(fs) if not shape(f['geometry']).is_valid]
    empty=sum(shape(f['geometry']).is_empty for f in fs)
    dates=sum(not math.isfinite(f['properties']['f']) or f['properties'].get('u',1e9)<=f['properties']['f'] for f in fs)
    report[name]={'features':len(fs),'invalid':bad,'empty':empty,'badDates':dates,'active':{str(y):sum(f['properties']['f']<=y<f['properties'].get('u',1e9) for f in fs) for y in [1965,1980,2000,2019,2025]}}
    assert not bad and not empty and not dates,(name,report[name])
today=prep(unary_union([shape(f['geometry']) for f in json.loads((WORK/'input-today.geojson').read_text())['features']]))
points=json.loads((WORK/'layers-final-hdb-blocks.geojson').read_text())['features']
outside=sum(not today.covers(shape(f['geometry'])) for f in points)
report['hdb-blocks']['outsideTodayLand']=outside
assert outside==0,outside
(WORK/'layers-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
