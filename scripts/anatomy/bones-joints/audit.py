"""Independent deterministic bidirectional sampled surface audit (metres).

Uses source and simplified triangle meshes, not the simplifier's error estimate.
Nearest triangle distance is calculated exactly within a conservative set of
nearest-centroid candidates. This sampled ceiling is not a Hausdorff proof.
Original glue: CC BY-SA 4.0.
"""
import json
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree

HERE = Path(__file__).resolve().parent
WORK = HERE.parent / 'cache' / 'bones-joints'


def distance(points, triangles):
    """Point-to-triangle, including edge/vertex Voronoi regions."""
    tree = cKDTree(triangles.mean(axis=1))
    _, ids = tree.query(points, k=min(64, len(triangles)))
    if ids.ndim == 1:
        ids = ids[:, None]
    t = triangles[ids]
    a, b, c = t[:, :, 0], t[:, :, 1], t[:, :, 2]
    p = points[:, None, :]
    ab, ac, ap = b-a, c-a, p-a
    normal = np.cross(ab, ac)
    denom = np.einsum('...i,...i->...', normal, normal)
    dot = np.einsum('...i,...i->...', ap, normal)
    projected = p - (dot / np.maximum(denom, 1e-30))[..., None] * normal
    area1 = np.einsum('...i,...i->...', np.cross(b-projected, c-projected), normal)
    area2 = np.einsum('...i,...i->...', np.cross(c-projected, a-projected), normal)
    area3 = np.einsum('...i,...i->...', np.cross(a-projected, b-projected), normal)
    inside = (area1 >= -1e-20) & (area2 >= -1e-20) & (area3 >= -1e-20) & (denom > 1e-30)
    answer = np.where(inside, dot*dot/np.maximum(denom, 1e-30), np.inf)
    for start, end in [(a,b),(b,c),(c,a)]:
        edge = end-start
        u = np.clip(np.einsum('...i,...i->...', p-start, edge) / np.maximum(np.einsum('...i,...i->...', edge, edge), 1e-30), 0, 1)
        delta = p - start - u[..., None]*edge
        answer = np.minimum(answer, np.einsum('...i,...i->...', delta, delta))
    return np.sqrt(answer.min(axis=1))


def samples(positions, faces):
    used = np.unique(faces)
    # Vertices plus face centres; preserve thin surface extrema and folds.
    vertices = positions[used[::max(1, len(used)//500)]]
    centres = positions[faces[::max(1, len(faces)//500)]].mean(axis=1)
    return np.concatenate([vertices, centres])


if __name__ == '__main__':
    jobs = json.loads((WORK/'surface-jobs.json').read_text())
    rows = []
    for job in jobs:
        p = np.asarray(job['positions']).reshape((-1,3))
        original = np.asarray(job['sourceIndices']).reshape((-1,3))
        simplified = np.asarray(job['indices']).reshape((-1,3))
        if np.array_equal(original, simplified):
            error = 0.0
        else:
            error = max(float(distance(samples(p, original), p[simplified]).max()), float(distance(samples(p, simplified), p[original]).max()))
        rows.append({'source':job['name'], 'sampledSurfaceErrorM':error})
        if error > .001:
            print('FAIL', job['name'], error, flush=True)
    result = {'method':'Bidirectional deterministic vertex/face-centre samples; exact distance to 64 nearest-centroid candidate triangles; conservative sampled ceiling, not Hausdorff guarantee', 'toleranceM':.001, 'maxSampledErrorM':max(r['sampledSurfaceErrorM'] for r in rows), 'failed':[r for r in rows if r['sampledSurfaceErrorM']>.001], 'sources':rows}
    (HERE/'surface-audit.json').write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='sources'}))
    raise SystemExit(bool(result['failed']))
