"""Source-surface contact candidates for the translated hand demonstrations.

Numerical candidates, with no claim of anatomical axis approval. CC BY-SA 4.0.
"""
import json
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree

HERE=Path(__file__).resolve().parent
manifest=json.loads((HERE/'manifest.json').read_text())
jobs={j['name']:j for j in json.loads((HERE.parent/'cache'/'bones-joints'/'surface-jobs.json').read_text())}
frame=np.array([0,manifest['sourceCentre'][2],-manifest['sourceCentre'][1]])
parts={p['id']:p for p in manifest['parts']}


def surface(id):
    part=parts[id]
    job=jobs[part['sources'][0]]
    p=np.asarray(job['positions']).reshape((-1,3))
    used=np.unique(np.asarray(job['sourceIndices']))
    return p[used]-frame+part['station']


rows=[]
for a,b in [('carpal-scaphoid','carpal-lunate'),('mcp-metacarpal','mcp-phalanx'),('thumb-trapezium','thumb-metacarpal')]:
    pa,pb=surface(a),surface(b)
    distance,nearest=cKDTree(pb).query(pa)
    chosen=np.flatnonzero(distance <= float(distance.min())+.0015)
    mid=(pa[chosen]+pb[nearest[chosen]])/2
    pivot=mid.mean(axis=0)
    rows.append({'parts':[a,b],'position':pivot.tolist(),'minimumSourceVertexGapM':float(distance.min()),'patchVertices':len(chosen),'method':'Midpoint mean of opposing source vertices within 1.5 mm of the nearest-vertex gap; vertex sampling, not continuous-surface or clinical-axis proof','review':'pending; candidate pivot only','demonstrationAxes':'Conservative original XYZ teaching rotations; not measured clinical ROM or validated axes'})
(HERE/'joint-detail.json').write_text(json.dumps({'license':'CC BY-SA 4.0','contacts':rows},indent=2)+'\n')
print(json.dumps(rows))
