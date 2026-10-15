"""Flow paths for the digestive topic, traced inside the published meshes.

Run after `run.py --topic digestive` (reads cache/digestive-decoded.json and
digestive/centrelines.json). Writes digestive/food-route.json and the `path` /
`paths` of the topic's flows in src/content/topics/digestive-system/data/parts.json;
every other flow field (speed, colours, counts) stays as the content sets it.

The food route runs continuously from the mouth to the anus. The meshes of
consecutive tube segments touch (gaps < 0.5 mm), so each segment's path runs
between its contact patches with the segment before and after it: slice
centroids of the surface-geodesic field between those patches (the jejunum
keeps the pipeline's exact source-ring stations). The mouth and throat leg
is schematic: over the tongue, down the middle of the throat meshes. Juice,
absorption and saliva branches are short schematic paths anchored to the meshes.
Coordinates: topic metres, +Y up, +Z front, +X the body's left (= GLB scene).
"""
import json
from pathlib import Path

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from scipy.spatial import cKDTree

HERE = Path(__file__).resolve().parent
CACHE = HERE.parent / 'cache'
PARTS = HERE.parents[2] / 'src/content/topics/digestive-system/data/parts.json'
STEP = 0.006


def weld(points, faces):
    p = np.asarray(points, float)
    _, first, inverse = np.unique(np.round(p, 7), axis=0, return_index=True, return_inverse=True)
    return p[first], inverse.ravel()[np.asarray(faces)]


MESH = {e['name']: weld(e['points'], e['faces']) for e in json.loads((CACHE / 'digestive-decoded.json').read_text())}
CENTRE = json.loads((HERE / 'centrelines.json').read_text())['tubes']


def graph(p, f):
    e = np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]])
    w = np.linalg.norm(p[e[:, 0]] - p[e[:, 1]], axis=1)
    return coo_matrix((np.r_[w, w], (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(len(p), len(p))).tocsr()


def contact(a, b, tol=0.004):
    """Vertices of mesh `a` within `tol` of mesh `b`."""
    d, _ = cKDTree(MESH[b][0]).query(MESH[a][0])
    ids = np.flatnonzero(d < tol)
    if len(ids) < 3:
        ids = np.argsort(d)[:12]
    return ids


def lowest(a, depth=0.004):
    p = MESH[a][0]
    return np.flatnonzero(p[:, 1] < p[:, 1].min() + depth)


def smooth(path, passes=3):
    path = np.asarray(path, float)
    for _ in range(passes):
        path[1:-1] = (path[:-2] + 2 * path[1:-1] + path[2:]) / 4
    return path


def resample(path, step=STEP):
    path = np.asarray(path, float)
    keep = np.r_[True, np.linalg.norm(np.diff(path, axis=0), axis=1) > 1e-7]
    path = path[keep]
    s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))]
    at = np.linspace(0, s[-1], max(2, int(np.ceil(s[-1] / step)) + 1))
    return np.stack([np.interp(at, s, path[:, k]) for k in range(3)], axis=1)


def between(name, start, end, slice_m=0.004):
    """Centre line of a tube mesh from one vertex patch to another."""
    p, f = MESH[name]
    g = graph(p, f)
    da = dijkstra(g, indices=list(start), min_only=True)
    db = dijkstra(g, indices=list(end), min_only=True)
    ok = np.isfinite(da) & np.isfinite(db)
    s = da - db
    s = (s - s[ok].min()) / (s[ok].max() - s[ok].min())
    n = max(8, int(np.median(da[end]) / slice_m))
    path = [p[start].mean(0)]
    for i in range(1, n):
        m = ok & (s >= (i - .5) / n) & (s < (i + .5) / n)
        if m.sum() >= 3:
            path.append(p[m].mean(0))
    path.append(p[end].mean(0))
    return resample(smooth(path))


def crossings(name, points):
    """Wall crossings of six axis rays from each point (Moller-Trumbore)."""
    p, f = MESH[name]
    a, b, c = p[f[:, 0]], p[f[:, 1]], p[f[:, 2]]
    e1, e2 = b - a, c - a
    out = []
    for q in points:
        row = []
        for d in np.vstack([np.eye(3), -np.eye(3)]):
            h = np.cross(d, e2)
            det = np.einsum('ij,ij->i', e1, h)
            ok = np.abs(det) > 1e-12
            inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
            s = q - a
            u = np.einsum('ij,ij->i', s, h) * inv
            qv = np.cross(s, e1)
            v = (qv @ d) * inv
            t = np.einsum('ij,ij->i', e2, qv) * inv
            row.append(int((ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-6)).sum()))
        out.append(row)
    return np.asarray(out)


def inside_report(name, path):
    """A path point is in the lumen when walls surround it: at least five of six axis
    rays cross the wall, and the crossings of most rays are even (double-walled
    source tubes: inner and outer surface) or odd (single-walled); `inWall` counts
    points whose rays disagree, i.e. likely inside the wall material."""
    hits = crossings(name, path)
    enclosed = (hits > 0).sum(1) >= 5
    parity = hits % 2
    mixed = np.array([len(set(r[h > 0])) > 1 for r, h in zip(parity, hits)])
    d, _ = cKDTree(MESH[name][0]).query(path)
    return dict(points=len(path), notEnclosed=int((~enclosed).sum()), mixedParity=int(mixed.sum()), minWallMm=round(float(d.min() * 1000), 2))


def join(*legs):
    out = [np.asarray(legs[0])]
    for leg in legs[1:]:
        leg = np.asarray(leg)
        if np.linalg.norm(out[-1][-1] - leg[0]) < 1e-6:
            leg = leg[1:]
        out.append(leg)
    return np.vstack(out)


def mouth_leg():
    """Schematic: between the front teeth, over the tongue, down the throat to the gullet."""
    t = MESH['tongue'][0]
    z0, z1 = t[:, 2].max(), t[:, 2].min()
    over = []
    for z in np.linspace(z0 + 0.012, z1 + 0.004, 9):
        band = t[np.abs(t[:, 2] - min(z, z0 - 0.002)) < 0.004]
        over.append([0.0, band[:, 1].max() + 0.004, z])
    ph = MESH['pharynx'][0]
    top = CENTRE['oesophagus']['points'][0]
    throat = []
    for y in np.linspace(over[-1][1] - 0.01, top[1] + 0.006, 7):
        band = ph[np.abs(ph[:, 1] - y) < 0.004]
        throat.append([0.0, y, float(band[:, 2].mean())])
    return resample(smooth(over + throat + [top], 2))


def build():
    route = {}
    route['mouth'] = mouth_leg()
    route['oesophagus'] = resample(CENTRE['oesophagus']['points'])
    route['stomach'] = resample(CENTRE['stomach']['points'])
    route['duodenum'] = resample(CENTRE['duodenum']['points'])
    route['jejunum'] = resample(CENTRE['jejunum']['points'])
    route['ascending-colon'] = between('ascending-colon', contact('ascending-colon', 'jejunum'), contact('ascending-colon', 'transverse-colon'))
    route['transverse-colon'] = between('transverse-colon', contact('transverse-colon', 'ascending-colon'), contact('transverse-colon', 'descending-colon'))
    route['descending-colon'] = between('descending-colon', contact('descending-colon', 'transverse-colon'), contact('descending-colon', 'sigmoid-colon'))
    route['rectum'] = between('sigmoid-colon', contact('sigmoid-colon', 'descending-colon'), lowest('sigmoid-colon'))
    checks = {k: inside_report('sigmoid-colon' if k == 'rectum' else k, v) for k, v in route.items() if k != 'mouth'}

    swallow = join(route['mouth'], route['oesophagus'])
    stomach = route['stomach']
    small = join(route['duodenum'], route['jejunum'])
    large = join(route['ascending-colon'], route['transverse-colon'], route['descending-colon'], route['rectum'])
    # Each leg starts where the one before it ends.
    stomach = join([swallow[-1]], stomach)
    small = join([stomach[-1]], small)
    large = join([small[-1]], large)

    # Churning: a loop inside the stomach body (fundus -> greater curve -> antrum -> lesser curve).
    sp = MESH['stomach'][0]
    c = stomach[len(stomach) // 2]
    axis = stomach[-1] - stomach[0]
    axis /= np.linalg.norm(axis)
    rel = sp - c
    _, _, vt = np.linalg.svd(rel - rel.mean(0), full_matrices=False)
    u, v = vt[0], vt[1]
    loop = []
    for a in np.linspace(0, 2 * np.pi, 33):
        d = np.cos(a) * u + np.sin(a) * v
        proj = rel @ d
        reach = np.percentile(proj, 97)
        loop.append(c + d * reach * 0.55)
    loop[-1] = loop[0]
    churn = np.asarray(loop)

    # Juices: bile from the liver through the gallbladder and duct; pancreatic
    # juice along the pancreas; both end at the same point of the duodenum's
    # second (descending) part, where the ducts open together.
    duo = route['duodenum']
    bd = MESH['bile-duct'][0]
    papilla_at = bd[np.argmin(bd[:, 1])]
    papilla = duo[np.argmin(np.linalg.norm(duo - papilla_at, axis=1))]
    gb = MESH['gallbladder'][0]
    liver = MESH['liver'][0]
    bile_top = bd[np.argmax(bd[:, 1])]
    hilum = liver[np.argmin(np.linalg.norm(liver - bile_top - [0, 0.02, 0], axis=1))]
    duct = [bd[np.abs(bd[:, 1] - y) < 0.003].mean(0) for y in np.linspace(bile_top[1] - 0.003, papilla_at[1] + 0.003, 8)]
    bile = resample(smooth([hilum, gb.mean(0), *duct, papilla], 2), 0.004)
    pan = MESH['pancreas'][0]
    tail = pan[np.argmax(pan[:, 0])]
    body = [pan[np.abs(pan[:, 0] - x) < 0.006].mean(0) for x in np.linspace(tail[0] - 0.01, papilla[0] + 0.02, 7)]
    pancreatic = resample(smooth([*body, papilla], 2), 0.004)

    # Absorption: short schematic branches leaving the wall of the coils (nutrients
    # into blood) and of the colon (water), outwards from the tube's own centre.
    def branches(path, every, length):
        out = []
        for i in range(every // 2, len(path) - 1, every):
            q = path[i]
            t = path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]
            t /= np.linalg.norm(t)
            radial = np.cross(t, [0, 0, 1.0])
            if np.linalg.norm(radial) < 0.2:
                radial = np.cross(t, [1.0, 0, 0])
            radial /= np.linalg.norm(radial)
            out.append(np.asarray([q, q + radial * length * 0.5 + [0, 0, length * 0.3], q + radial * length + [0, 0, length * 0.5]]))
        return out
    nutrients = branches(route["jejunum"], 22, 0.05)[:16]
    water = branches(join(route['ascending-colon'], route['transverse-colon'], route['descending-colon']), 12, 0.035)[:16]

    # Saliva: from each gland's inner face to the floor / sides of the mouth.
    saliva = []
    for side, sign in (('l', 1), ('r', -1)):
        g = MESH['salivary-glands.' + side][0]
        start = g[np.argmin(g[:, 0] * sign)]  # the gland's point nearest the midline
        mouth = route['mouth'][2] + [0.008 * sign, -0.004, 0]
        mid = (start + mouth) / 2 + [0, -0.006, 0.01]
        saliva.append(resample(smooth([start, mid, mouth], 1), 0.004))

    report = dict(
        note='Generated by food_route.py; topic metres; see module docstring.',
        lengthsM={k: round(float(np.linalg.norm(np.diff(v, axis=0), axis=1).sum()), 4) for k, v in route.items()},
        containment=checks,
        legs={k: [round(float(x), 4) for x in v[0]] + [round(float(x), 4) for x in v[-1]] for k, v in route.items()},
    )
    flows = {
        'swallow': swallow, 'stomach-pass': stomach, 'small-gut': small, 'large-gut': large, 'churn': churn,
        'bile': bile, 'pancreatic': pancreatic,
        'saliva': {'saliva-left': saliva[0], 'saliva-right': saliva[1]},
        'absorb-food': {f'nutrient-{i + 1}': b for i, b in enumerate(nutrients)},
        'absorb-water': {f'water-{i + 1}': b for i, b in enumerate(water)},
    }
    return flows, report


def r4(path):
    return [[round(float(x), 4) for x in q] for q in path]


def main():
    flows, report = build()
    (HERE / 'food-route.json').write_text(json.dumps(report, indent=2) + '\n')
    data = json.loads(PARTS.read_text())
    by_id = {f['id']: f for f in data['flows']}
    for fid, value in flows.items():
        f = by_id.get(fid)
        if f is None:
            continue
        f.pop('path', None)
        f.pop('paths', None)
        if isinstance(value, dict):
            f['paths'] = [dict(id=k, path=r4(v)) for k, v in value.items()]
        else:
            f['path'] = r4(value)
    PARTS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report['lengthsM']))
    print(json.dumps(report['containment']))


if __name__ == '__main__':
    main()
