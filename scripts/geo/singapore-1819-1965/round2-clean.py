"""Repair floating-point overlay remnants independently per feature.
Never dissolve different dates/holders or fill holes based on another layer.
"""
import json,sys
from shapely.geometry import shape,mapping,MultiPolygon
from shapely.validation import make_valid
from shapely import set_precision
layers=json.load(sys.stdin)
for fc in layers.values():
 for f in fc['features']:
  if f['geometry']['type']not in ('Polygon','MultiPolygon'):continue
  g=shape(f['geometry'])
  fixed=g if g.is_valid else make_valid(g)
  def parts(g):
   if g.geom_type=='Polygon':return [g]
   if hasattr(g,'geoms'):return [p for a in g.geoms for p in parts(a)]
   return []
  fixed=MultiPolygon(parts(fixed))
  # The only permitted repair is numeric overlay pinches, below source
  # resolution; a larger change requires source repair, never silent cleanup.
  if abs(fixed.area-g.area)*111195**2>2:raise RuntimeError('Overlay repair exceeds 2 square metres')
  # A shared 0.11 m geographic numeric grid is far below the source ink
  # width. GEOS snaps each feature independently and preserves water holes.
  f['geometry']=mapping(set_precision(fixed,0.000001))
json.dump(layers,sys.stdout,separators=(',',':'))
