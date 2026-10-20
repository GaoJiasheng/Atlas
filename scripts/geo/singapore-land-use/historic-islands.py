"""Detached islands for the first coast era (review 2026-10-20, Opus).

The inherited G11 L5 outline (docs/28: Admiralty charts surveyed 1954-1961) covers the main island,
Blakang Mati (Sentosa) and a few islets but not the detached islands: Pulau Ubin, Pulau Tekong and the
southern and Jurong islands are absent, so a 1959 map would show them as sea that was "reclaimed" later.
The BIS 1959 map (G1) draws them as land. They are therefore taken from the first Landsat era (L6,
17 October 1973, same fixed water-index method): every L6 land piece that does not touch L5, at least
0.02 km² (the shared minIslandKm2). Known error: changes to these islands between 1959 and 1973 (refinery
works on Pulau Ayer Chawan and Pulau Bukom) appear early. Run: work/venv/bin/python -I historic-islands.py
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from shapely import make_valid
from pyproj import Geod
P = Path(__file__).parent / 'work'
geod = Geod(ellps='WGS84')
def load(name):
    return unary_union([make_valid(shape(f['geometry'])) for f in json.load(open(P / name))['features']])
l5 = load('input-L5.geojson')
l6 = load('landsat-L6-land.geojson')
pieces = list(l6.geoms) if l6.geom_type == 'MultiPolygon' else [l6]
near = l5.buffer(0.001)
keep = [p for p in pieces if not p.intersects(near) and abs(geod.geometry_area_perimeter(p)[0]) >= 20000]
out = {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'src': 'G9 L6 1973-10-17'}, 'geometry': mapping(p)} for p in keep]}
(P / 'islands-L6-detached.geojson').write_text(json.dumps(out))
print(len(keep), 'islands,', round(sum(abs(geod.geometry_area_perimeter(p)[0]) for p in keep) / 1e6, 3), 'km²')
