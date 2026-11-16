#!/usr/bin/env python3
"""continental-drift: build public/geo/cd-* from the fixed read-only downloads (docs/72 §3).

Run with the build venv (pygplates 1.0.0, numpy; Pillow and scipy for the two present-day grids):
  art/research/continental-drift/.venv/bin/python -I scripts/geo/continental-drift/build.py \
      --inputs art/research/continental-drift/data
Nothing is downloaded. Raw inputs stay outside git; only derived files are written.
"""
import argparse, collections, csv, hashlib, heapq, html, io, json, math, pathlib, re, sys

import numpy as np
import pygplates

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = ROOT / 'scripts/geo/continental-drift'
OUT = ROOT / 'public/geo'
FIXTURES = ROOT / 'tests/fixtures/continental-drift'
P = argparse.ArgumentParser()
P.add_argument('--inputs', type=pathlib.Path, required=True)
P.add_argument('--start', type=float, default=400.0)
ARGS = P.parse_args()
DATA = ARGS.inputs.resolve()
MODEL = DATA / 'dl1-merdith/x'
ROT_FILE = MODEL / 'Rotations/1000_0_rotfile_Merdith_etal.rot'
START = ARGS.start
REPORT: dict = {'model': 'Merdith et al. 2021 v1.2.4', 'rangeMa': [START, 0]}
R_EARTH = 6371.0


def emit(stem, obj):
    path = OUT / f'{stem}.json'
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + '\n')
    raw = path.read_bytes()
    import gzip
    return {'file': path.name, 'bytes': len(raw), 'gzipBytes': len(gzip.compress(raw, 9)), 'sha256': hashlib.sha256(raw).hexdigest()}


# ---------------------------------------------------------------- rotations
def parse_rot(text):
    """Every non-999 line as (moving, age, lat, lon, angle, fixed), values kept exactly as written."""
    rows = []
    for line in text.splitlines():
        body = line.split('!', 1)[0].split()
        if len(body) < 6:
            continue
        moving = int(body[0])
        if moving == 999:
            continue
        rows.append((moving, float(body[1]), float(body[2]), float(body[3]), float(body[4]), int(body[5])))
    return rows


def sequences_of(rows):
    """Consecutive lines with the same (moving, fixed) form one sequence (GPlates' grouping)."""
    out = []
    for r in rows:
        if out and out[-1]['moving'] == r[0] and out[-1]['fixed'] == r[5]:
            out[-1]['poles'].append([r[1], r[2], r[3], r[4]])
        else:
            out.append({'moving': r[0], 'fixed': r[5], 'poles': [[r[1], r[2], r[3], r[4]]]})
    return out


ROWS = parse_rot(ROT_FILE.read_text())
ALL_SEQ = sequences_of(ROWS)
ROTATION = pygplates.RotationModel(str(ROT_FILE))


def trim(seq, lo, hi):
    """Keep poles covering [lo, hi] plus one outside pole at each end."""
    poles = seq['poles']
    if poles[-1][0] < lo or poles[0][0] > hi:
        return None
    i0 = max(0, max([i for i, p in enumerate(poles) if p[0] <= lo], default=0))
    i1 = min(len(poles) - 1, min([i for i, p in enumerate(poles) if p[0] >= hi], default=len(poles) - 1))
    return {'moving': seq['moving'], 'fixed': seq['fixed'], 'poles': poles[i0:i1 + 1]}


def ancestry(plates):
    """Every plate reachable through a fixed-plate link while t is in [0, START]."""
    need = set(plates)
    stack = list(plates)
    while stack:
        p = stack.pop()
        for s in ALL_SEQ:
            if s['moving'] == p and s['poles'][0][0] <= START and s['poles'][-1][0] >= 0:
                if s['fixed'] not in need:
                    need.add(s['fixed'])
                    stack.append(s['fixed'])
    return need


def rotations_json(plates):
    need = ancestry(plates)
    seqs = [t for s in ALL_SEQ if s['moving'] in need for t in [trim(s, 0, START)] if t]
    depth = 0
    for p in need:
        for t in np.arange(0, START + 0.001, 5.0):
            d, cur, seen = 0, p, set()
            while cur != 0 and cur not in seen:
                seen.add(cur)
                link = next((s for s in seqs if s['moving'] == cur and s['poles'][0][0] <= t <= s['poles'][-1][0]), None)
                if not link:
                    break
                cur, d = link['fixed'], d + 1
            depth = max(depth, d)
    REPORT['rotations'] = {'plates': len(need), 'sequences': len(seqs), 'poles': sum(len(s['poles']) for s in seqs), 'maxChainDepth': depth}
    return {'version': 1, 'modelId': 'merdith2021', 'anchorPlateId': 0, 'sequences': seqs}


def rot_text(rot):
    lines = []
    for s in rot['sequences']:
        for age, lat, lon, ang in s['poles']:
            lines.append(f"{s['moving']} {age!r} {lat!r} {lon!r} {ang!r} {s['fixed']} !")
    return '\n'.join(lines) + '\n'


# ---------------------------------------------------------------- geometry helpers
def unit(lat, lon):
    la, lo = math.radians(lat), math.radians(lon)
    return np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])


def ring_vectors(ring):
    return np.array([unit(la, lo) for la, lo in ring])


def spherical_area_km2(ring):
    """Ring area on the sphere (vertices [lat, lon], open), by summing triangles from vertex 0."""
    v = ring_vectors(ring)
    total = 0.0
    a = v[0]
    for i in range(1, len(v) - 1):
        b, c = v[i], v[i + 1]
        num = np.dot(a, np.cross(b, c))
        den = 1 + np.dot(a, b) + np.dot(b, c) + np.dot(c, a)
        total += 2 * math.atan2(num, den)
    return abs(total) * R_EARTH ** 2


def local_xy(ring):
    """Azimuthal equidistant projection about the ring's mean direction (no seam inside one ring)."""
    v = ring_vectors(ring)
    c = v.mean(axis=0)
    c /= np.linalg.norm(c)
    e = np.cross([0, 0, 1], c)
    if np.linalg.norm(e) < 1e-9:
        e = np.array([1.0, 0, 0])
    e /= np.linalg.norm(e)
    n = np.cross(c, e)
    out = []
    for p in v:
        ang = math.acos(max(-1, min(1, float(np.dot(p, c)))))
        x, y = float(np.dot(p, e)), float(np.dot(p, n))
        r = math.hypot(x, y)
        out.append((x / r * ang, y / r * ang) if r > 1e-15 else (0.0, 0.0))
    return out


def orient(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def self_crosses(pts):
    """Same rule as scripts/geo/lib/rings.ts selfCrosses, on an open ring."""
    ring = pts + [pts[0]]
    n = len(ring) - 1
    if n < 4:
        return False
    order = sorted(range(n), key=lambda i: min(ring[i][0], ring[i + 1][0]))
    active = []
    for i in order:
        a, b = ring[i], ring[i + 1]
        lo = min(a[0], b[0])
        active = [j for j in active if max(ring[j][0], ring[j + 1][0]) >= lo]
        for j in active:
            if abs(i - j) == 1 or (i == 0 and j == n - 1) or (j == 0 and i == n - 1):
                continue
            c, d = ring[j], ring[j + 1]
            o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
            if ((o1 > 0 > o2) or (o1 < 0 < o2)) and ((o3 > 0 > o4) or (o3 < 0 < o4)):
                return True
        active.append(i)
    return False


def vw_areas(ring):
    """Visvalingam–Whyatt effective areas (local projection, monotone). Ring is open."""
    xy = local_xy(ring)
    n = len(xy)
    if n <= 3:
        return [math.inf] * n
    prev = [(i - 1) % n for i in range(n)]
    nxt = [(i + 1) % n for i in range(n)]
    tri = lambda i: abs(orient(xy[prev[i]], xy[i], xy[nxt[i]])) / 2
    area = [tri(i) for i in range(n)]
    heap = [(area[i], i) for i in range(n)]
    heapq.heapify(heap)
    alive = [True] * n
    eff = [math.inf] * n
    left = n
    last = 0.0
    while heap and left > 3:
        a, i = heapq.heappop(heap)
        if not alive[i] or a != area[i]:
            continue
        last = max(last, a)
        eff[i] = last
        alive[i] = False
        left -= 1
        p, q = prev[i], nxt[i]
        nxt[p], prev[q] = q, p
        for k in (p, q):
            area[k] = tri(k)
            heapq.heappush(heap, (area[k], k))
    return eff


def simplify_rings(rings, budget, drop_km2=0.0):
    """Global VW threshold so the kept vertex total fits `budget`; rings that would cross themselves keep more."""
    info = []
    for r in rings:
        a = spherical_area_km2(r['ring'])
        if a < drop_km2:
            continue
        info.append((r, vw_areas(r['ring'])))
    lo, hi = 0.0, 1e-2
    def count(th):
        return sum(sum(1 for e in eff if e >= th) for _, eff in info)
    while count(hi) > budget:
        hi *= 4
    for _ in range(40):
        mid = (lo + hi) / 2
        if count(mid) > budget:
            lo = mid
        else:
            hi = mid
    th = hi
    out, fixed = [], 0
    for r, eff in info:
        t = th
        while True:
            kept = [p for p, e in zip(r['ring'], eff) if e >= t]
            if len(kept) >= 3 and not self_crosses(local_xy(kept)):
                break
            if t == 0:
                break
            t = t / 4 if t > 1e-14 else 0
            fixed += 1
        out.append({**r, 'ring': kept})
    return out, fixed, sum(len(r['ring']) for r in out), len(rings) - len(info)


# ---------------------------------------------------------------- TopoJSON (one arc per ring, quantized)
QUANT = 5e4


def topology(objects):
    """objects: name -> list of {'rings': [[lat, lon]...]..., 'props': {...}}. Coordinates stored as present-day lon/lat."""
    sx, sy = 360 / (QUANT - 1), 180 / (QUANT - 1)
    arcs, out = [], {}
    for name, feats in objects.items():
        geoms = []
        for f in feats:
            polys = []
            for poly in f['polygons']:
                idx = []
                for ring in poly:
                    q = [(round((lo + 180) / sx), round((la + 90) / sy)) for la, lo in ring]
                    q.append(q[0])
                    dedup = [q[0]] + [b for a, b in zip(q, q[1:]) if a != b]
                    if dedup[-1] != dedup[0]:
                        dedup.append(dedup[0])
                    if len(dedup) < 4:
                        continue
                    delta = [list(dedup[0])] + [[b[0] - a[0], b[1] - a[1]] for a, b in zip(dedup, dedup[1:])]
                    idx.append(len(arcs))
                    arcs.append(delta)
                if idx:
                    polys.append([[i] for i in idx])
            if not polys:
                continue
            geoms.append({'type': 'MultiPolygon', 'arcs': polys, 'properties': f['props']})
        out[name] = {'type': 'GeometryCollection', 'geometries': geoms}
    return {'type': 'Topology', 'transform': {'scale': [sx, sy], 'translate': [-180, -90]}, 'objects': out, 'arcs': arcs}


# ---------------------------------------------------------------- plate geometry layers
def load_polygons(path, kind):
    feats = []
    for f in pygplates.FeatureCollection(str(path)):
        b, e = f.get_valid_time()
        b = 1000.0 if b == float('inf') or b > 1000 else float(b)
        e = 0.0 if e == float('-inf') or e < 0 else float(e)
        if b < 0 or e > START:
            continue
        pid = f.get_reconstruction_plate_id()
        for g in f.get_geometries():
            if not isinstance(g, pygplates.PolygonOnSphere):
                continue
            outer = [list(p.to_lat_lon()) for p in g.get_exterior_ring_points()]
            holes = [[list(p.to_lat_lon()) for p in g.get_interior_ring_points(i)] for i in range(g.get_number_of_interior_rings())]
            feats.append({'kind': kind, 'plateId': pid, 'from': b, 'to': e, 'outer': outer, 'holes': holes})
    return feats


def lod_layer(feats, budget, drop_km2):
    rings = []
    for fi, f in enumerate(feats):
        rings.append({'f': fi, 'hole': False, 'ring': f['outer']})
        for h in f['holes']:
            rings.append({'f': fi, 'hole': True, 'ring': h})
    simple, fixed, verts, dropped = simplify_rings(rings, budget, drop_km2)
    byf = collections.defaultdict(list)
    for r in simple:
        byf[r['f']].append(r)
    # Polygons that share plate and valid time travel as one feature (fewer, larger MultiPolygons).
    merged = {}
    for fi, rs in byf.items():
        outer = [r['ring'] for r in rs if not r['hole']]
        if not outer:
            continue
        holes = [r['ring'] for r in rs if r['hole']]
        f = feats[fi]
        key = (f['plateId'], f['from'], f['to'])
        merged.setdefault(key, []).append([outer[0], *holes])
    out = [{'polygons': polys, 'props': {'plateId': k[0], 'from': k[1], 'to': k[2]}} for k, polys in merged.items()]
    return out, {'vertices': verts, 'budget': budget, 'ringsKeptMoreForCrossing': fixed, 'ringsDroppedBelowKm2': dropped, 'dropKm2': drop_km2}


COAST = load_polygons(MODEL / 'Coastlines/shapes_coastlines_Merdith_et_al_v2.gpmlz', 'land')
SHELF = load_polygons(MODEL / 'Continents/shapes_continents.gpml', 'shelf')

# 3.3-2 coverage: present-day coastline area per continent group still valid, every 1 Myr.
GROUPS = {'north-america': (100, 199), 'south-america': (200, 299), 'europe': (300, 399), 'asia': (400, 699), 'africa': (700, 799), 'australia-antarctica': (800, 899)}
def group_of(pid):
    lead = int(str(pid)[:3]) if pid >= 100 else pid
    for g, (a, b) in GROUPS.items():
        if a <= lead <= b:
            return g
    return None
areas = [(group_of(f['plateId']), f['from'], f['to'], spherical_area_km2(f['outer'])) for f in COAST]
total = collections.Counter()
for g, b, e, a in areas:
    if g and e <= 0:
        total[g] += a
coverage = {}
weak = []
for t in range(int(START), -1, -1):
    row = collections.Counter()
    for g, b, e, a in areas:
        if g and e <= t <= b and e <= 0:
            row[g] += a
    coverage[t] = {g: round(row[g] / total[g], 4) for g in GROUPS}
    if min(coverage[t].values()) < 0.5:
        weak.append(t)
REPORT['coverage'] = {'atStart': coverage[int(START)], 'at320': coverage.get(320), 'at250': coverage.get(250), 'yearsBelowHalf': weak[:20], 'note': 'share of today\'s coastline area (per plate-ID group) that the model keeps at each age'}

land_full, s1 = lod_layer(COAST, 36000, 0)
land_scrub, s2 = lod_layer(COAST, 6000, 300)  # 2026-11-16 scrub pass (rescrub.ts derives the same budget from the fine level)
shelf_full, s3 = lod_layer(SHELF, 22000, 0)
shelf_scrub, s4 = lod_layer(SHELF, 4000, 300)
REPORT['lod'] = {'land-full': s1, 'land-scrub': s2, 'shelf-full': s3, 'shelf-scrub': s4}


# ---------------------------------------------------------------- points
PARTITION = pygplates.PlatePartitioner(pygplates.FeatureCollection(str(MODEL / 'StaticPolygons/shapes_static_polygons_Merdith_etal.gpml')), ROTATION)
UNASSIGNED = []


def assign(pid, lon, lat):
    hit = PARTITION.partition_point(pygplates.PointOnSphere(lat, lon))
    if not hit:
        UNASSIGNED.append(pid)
        return None
    f = hit.get_feature()
    b, e = f.get_valid_time()
    return {'plateId': f.get_reconstruction_plate_id(), 'from': 1000.0 if b == float('inf') or b > 1000 else float(b), 'to': 0.0 if e == float('-inf') or e < 0 else float(e), 'polygon': f.get_name()}


SITES = json.loads((HERE / 'sites.json').read_text())
points = []
for s in SITES['points']:
    a = assign(s['id'], *s['at'])
    if not a:
        continue
    points.append({**{k: s[k] for k in ('id', 'kind', 'at')}, 'plateId': a['plateId'], 'from': a['from'], 'to': a['to']})
labels = []
for s in SITES['labels']:
    a = assign(s['id'], *s['at'])
    if not a:
        continue
    labels.append({'id': s['id'], 'at': s['at'], 'plateId': a['plateId'], 'from': a['from'], 'to': a['to'], 'window': s['window'], 'name': s['name']})

# PBDB snapshot: one point per collection, accepted genus among the four.
TAXA = {'Mesosaurus': 'taxon-mesosaurus', 'Glossopteris': 'taxon-glossopteris', 'Lystrosaurus': 'taxon-lystrosaurus', 'Cynognathus': 'taxon-cynognathus'}
raw = (DATA / 'dl3-pbdb/occs.csv').read_text(encoding='utf-8')
head, _, body = raw.partition('"Records:"\n')
reader = csv.DictReader(io.StringIO(body))
colls = {}
countries = collections.defaultdict(collections.Counter)
refs = {}
for row in reader:
    genus = (row['accepted_name'] or '').split(' ')[0]
    if genus not in TAXA or not row['lng'] or not row['lat']:
        continue
    cid = row['collection_no']
    c = colls.setdefault(cid, {'id': f'pbdb-col-{cid}', 'kind': 'fossil', 'at': [round(float(row['lng']), 4), round(float(row['lat']), 4)], 'cc': row['cc'], 'name': row.get('collection_name') or '', 'groups': set(), 'occ': []})
    c['groups'].add(TAXA[genus])
    c['occ'].append({'n': row['occurrence_no'], 'name': row['identified_name'], 'older': float(row['max_ma']), 'younger': float(row['min_ma']), 'ref': row['reference_no']})
    refs[row['reference_no']] = row.get('primary_reference') or row.get('reference') or ''
    countries[TAXA[genus]][row['cc']] += 1
groups = collections.defaultdict(list)
fossils = []
for cid, c in sorted(colls.items(), key=lambda kv: int(kv[0])):
    a = assign(c['id'], *c['at'])
    if not a:
        continue
    for g in sorted(c['groups']):
        groups[g].append(c['id'])
    fossils.append({'id': c['id'], 'kind': 'fossil', 'at': c['at'], 'plateId': a['plateId'], 'from': a['from'], 'to': a['to'], 'cc': c['cc'], 'groups': sorted(c['groups']), 'occ': c['occ']})
REPORT['pbdb'] = {'header': [l for l in head.splitlines()[:16]], 'collections': len(colls), 'assigned': len(fossils), 'countriesByTaxon': {k: dict(v.most_common()) for k, v in countries.items()}}
REPORT['points'] = {'sites': len(points), 'labels': len(labels), 'unassigned': UNASSIGNED,
                    'singapore': next(({'plateId': p['plateId'], 'from': p['from'], 'to': p['to']} for p in points if p['id'] == 'site-singapore'), None)}

used = {f['props']['plateId'] for layer in (land_full, land_scrub, shelf_full, shelf_scrub) for f in layer} | {p['plateId'] for p in points + labels + fossils}
ROT = rotations_json(sorted(used))


def representative(ids):
    """The member nearest the group's mean present-day direction carries the leader line."""
    pts = {f['id']: f['at'] for f in fossils}
    vs = np.array([unit(pts[i][1], pts[i][0]) for i in ids])
    m = vs.mean(axis=0)
    return ids[int(np.argmax(vs @ m))]


group_list = [{'id': g, 'members': ids, 'representative': representative(ids)} for g, ids in sorted(groups.items())]


# ---------------------------------------------------------------- present-only rasters → polygons
def trace(mask, lon0, lat0, dlon, dlat):
    """Boundary rings of True cells (row 0 = southernmost). Corners as (lat, lon); holes kept as separate rings."""
    h, w = mask.shape
    edges = {}
    def add(a, b):
        edges.setdefault(a, []).append(b)
    for y, x in zip(*np.nonzero(mask)):
        if y == 0 or not mask[y - 1, x]: add((x + 1, y), (x, y))
        if y == h - 1 or not mask[y + 1, x]: add((x, y + 1), (x + 1, y + 1))
        if x == 0 or not mask[y, x - 1]: add((x, y), (x, y + 1))
        if x == w - 1 or not mask[y, x + 1]: add((x + 1, y + 1), (x + 1, y))
    rings = []
    while edges:
        start = next(iter(edges))
        ring, cur = [start], start
        while True:
            nxts = edges[cur]
            nx = nxts.pop()
            if not nxts:
                del edges[cur]
            if nx == start:
                break
            ring.append(nx)
            cur = nx
        rings.append([(lon0 + x * dlon, lat0 + y * dlat) for x, y in ring])
    return rings


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0]), np.array(pts[-1])
    d = b - a
    n = np.hypot(*d)
    arr = np.array(pts)
    dist = np.abs(d[0] * (arr[:, 1] - a[1]) - d[1] * (arr[:, 0] - a[0])) / n if n else np.hypot(*(arr - a).T)
    i = int(np.argmax(dist))
    if dist[i] > tol:
        return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)
    return [pts[0], pts[-1]]


def ring_area(r):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(r, r[1:] + r[:1])) / 2


def polygons_from(mask, lon0, lat0, dlon, dlat, tol, min_cells):
    out = []
    for r in trace(mask, lon0, lat0, dlon, dlat):
        if abs(ring_area(r)) < min_cells * dlon * dlat:
            continue
        k = len(r) // 2
        s = dp(r[:k + 1], tol)[:-1] + dp(r[k:] + [r[0]], tol)[:-1]
        if len(s) < 3 or abs(ring_area(s)) == 0 or self_crosses(s):
            s = r
        s = [(round(x, 3 if dlon < 0.1 else 2), round(y, 3 if dlon < 0.1 else 2)) for x, y in s]
        out.append(s)
    return out


def assemble(rings):
    """Outer rings (counter-clockwise in lon/lat) with their holes as GeoJSON polygon coordinates."""
    def inside(p, r):
        x, y = p
        v = False
        for a, b in zip(r, r[1:] + r[:1]):
            if (a[1] > y) != (b[1] > y) and x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]:
                v = not v
        return v
    # trace() walks outer boundaries clockwise (interior on the right) and holes counter-clockwise.
    outers = [r[::-1] for r in rings if ring_area(r) < 0]
    holes = [r[::-1] for r in rings if ring_area(r) > 0]
    polys = [[o] for o in outers]
    for h in holes:
        probe = ((h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2)
        cands = [i for i, o in enumerate(outers) if inside(probe, o)]
        if cands:
            polys[min(cands, key=lambda i: abs(ring_area(outers[i])))].append(h)
    return [[[list(p) for p in r + r[:1]] for r in poly] for poly in polys]


from scipy.io import netcdf_file
age = netcdf_file(str(DATA / 'dl4-agegrid/age.2020.1.GTS2012.6m.grd'), 'r', mmap=False).variables['z'][:].astype(np.float32)
# 0.1° gridline-registered (1801 × 3601, row 0 = 90°S). Block to 1° cells by the median of valid nodes.
ag = age[:1800, :3600].reshape(180, 10, 360, 10).transpose(0, 2, 1, 3).reshape(180, 360, 100)
with np.errstate(all='ignore'):
    cell = np.nanmedian(ag, axis=2)
seafloor = []
BANDS = list(range(0, 190, 10))
for i, lo in enumerate(BANDS):
    mask = np.nan_to_num(cell, nan=-1) >= lo
    polys = assemble(polygons_from(mask, -180, -90, 1.0, 1.0, 0.45, 2))
    seafloor.append({'type': 'Feature', 'properties': {'band': i, 'olderThanMa': lo}, 'geometry': {'type': 'MultiPolygon', 'coordinates': polys}})
def youngest(lat, lon_lo, lon_hi):
    """The youngest age-grid node along a parallel: where the ridge axis crosses it (present-only anchors)."""
    row = int(round((lat + 90) * 10))
    a, b = int(round((lon_lo + 180) * 10)), int(round((lon_hi + 180) * 10))
    seg = np.nan_to_num(age[row, a:b + 1], nan=1e9)
    return [round(lon_lo + int(np.argmin(seg)) / 10, 1), lat]


present = [
    {'id': 'ridge-mid-atlantic', 'kind': 'ridge', 'at': youngest(30, -50, -30)},
    {'id': 'site-reykjanes', 'kind': 'ridge', 'at': youngest(60, -36, -25)},
]
REPORT['seafloor'] = {'ridgeAnchors': present, 'cellDeg': 1.0, 'bands': BANDS, 'maxAgeMa': float(np.nanmax(age)), 'note': 'nested "older than" areas, drawn young to old'}

from PIL import Image
mag = np.array(Image.open(str(DATA / 'dl5-emag2/N30W060.earth_mag_02m_p.jp2'))).astype(np.float64)
# GMT remote tile N30W060: lat 30..90, lon -60..0, pixel registered, 2′; row 0 = north. z = (u − 32768) × 0.2 + 800 nT; u = 0 is no data.
valid = mag > 0
nT = (mag - 32768) * 0.2 + 800
W, S, E, N = -36, 56, -20, 66
x0, x1 = int((W + 60) * 30), int((E + 60) * 30)
y0, y1 = int((90 - N) * 30), int((90 - S) * 30)
from scipy.ndimage import uniform_filter
# A 5 × 5 cell (10 arc-minutes, about 18 km north–south) running mean before the sign split, so the map shows lineations, not cell noise (design, S30).
sub = uniform_filter(np.where(valid, nT, 0.0), size=5, mode='nearest')[y0:y1, x0:x1][::-1]
ok = valid[y0:y1, x0:x1][::-1]
stripes = []
for sign, m in (('positive', ok & (sub > 0)), ('negative', ok & (sub <= 0))):
    polys = assemble(polygons_from(m, W, S, 1 / 30, 1 / 30, 0.02, 3))
    stripes.append({'type': 'Feature', 'properties': {'sign': sign}, 'geometry': {'type': 'MultiPolygon', 'coordinates': polys}})
REPORT['stripes'] = {'bounds': [W, S, E, N], 'cells': int(ok.sum()), 'positiveShare': round(float((sub[ok] > 0).mean()), 3), 'meanNT': round(float(sub[ok].mean()), 1), 'scale': 'z = (u − 32768) × 0.2 + 800 (GMT server table scale 0.2, offset 800)', 'smoothing': '5 × 5 cell running mean (10 arc-minutes)', 'orientationCheck': 'north-up rows: 61% of nodes younger than 0.78 Ma (Brunhes) positive vs 45% if flipped'}

# ---------------------------------------------------------------- GPS (JPL table2 snapshot)
text = (DATA / 'dl6-jpl/table2.html').read_text(errors='replace')
plain = html.unescape(re.sub(r'<[^>]+>', '', text))
gps = []
for st in SITES['gps']:
    m = re.search(rf'^\s*{st["station"]}\s+POS\s+(\S+)\s+(\S+)\s+(\S+).*?\n\s*{st["station"]}\s+VEL\s+(\S+)\s+(\S+)\s+(\S+)', plain, re.M | re.S)
    if not m:
        raise SystemExit(f'station {st["station"]} not in table2 snapshot')
    lat, lon = float(m.group(1)), float(m.group(2))
    vn, ve = float(m.group(4)), float(m.group(5))
    gps.append({'id': st['id'], 'station': st['station'], 'at': [round(lon if lon <= 180 else lon - 360, 4), round(lat, 4)], 'vNorthMm': vn, 'vEastMm': ve, 'frame': 'IGS14', 'epoch': '2026-01-01'})
REPORT['gps'] = {'header': [l.strip() for l in plain.splitlines() if l.strip()][:8], 'stations': gps}

# ---------------------------------------------------------------- write
OUT.mkdir(parents=True, exist_ok=True)
files = {}
files['cd-rotations'] = emit('cd-rotations', ROT)
files['cd-land'] = emit('cd-land', topology({'scrub': land_scrub, 'full': land_full}))
files['cd-shelf'] = emit('cd-shelf', topology({'scrub': shelf_scrub, 'full': shelf_full}))
files['cd-points'] = emit('cd-points', {'version': 1, 'points': points, 'labels': labels})
files['cd-fossils'] = emit('cd-fossils', {'version': 1, 'points': fossils, 'groups': group_list, 'references': {k: v for k, v in sorted(refs.items(), key=lambda kv: int(kv[0]))}})
files['cd-seafloor'] = emit('cd-seafloor', {'type': 'FeatureCollection', 'features': seafloor})
files['cd-stripes'] = emit('cd-stripes', {'type': 'FeatureCollection', 'features': stripes})
files['cd-gps'] = emit('cd-gps', {'version': 1, 'stations': gps, 'present': present})
files['cd-manifest'] = emit('cd-manifest', {
    'version': 1, 'modelId': 'merdith2021',
    'modelLabel': {'en': 'Merdith et al. 2021 plate model · v1.2.4', 'zh': 'Merdith 等 2021 年板块模型 · v1.2.4'},
    'plateLabel': 'MERDITH 2021',
    'coordinateSpace': 'rotated-present-day', 'rangeMa': [START, 0], 'rotations': 'cd-rotations',
    'layers': [
        {'id': 'cd-land', 'file': 'cd-land', 'kind': 'fill', 'motion': 'plate', 'lod': {'scrub': 'scrub', 'full': 'full'}},
        {'id': 'cd-shelf', 'file': 'cd-shelf', 'kind': 'fill', 'motion': 'plate', 'lod': {'scrub': 'scrub', 'full': 'full'}},
        {'id': 'cd-names', 'file': 'cd-points', 'kind': 'label', 'motion': 'plate', 'select': 'label'},
        {'id': 'cd-glacial', 'file': 'cd-points', 'kind': 'point', 'motion': 'plate', 'select': 'glacial'},
        {'id': 'cd-fossils', 'file': 'cd-fossils', 'kind': 'point', 'motion': 'plate', 'select': 'fossil'},
        {'id': 'cd-belts', 'file': 'cd-points', 'kind': 'point', 'motion': 'plate', 'select': 'belt'},
        {'id': 'cd-singapore', 'file': 'cd-points', 'kind': 'point', 'motion': 'plate', 'select': 'site'},
        {'id': 'cd-seafloor', 'file': 'cd-seafloor', 'kind': 'fill', 'motion': 'present-only'},
        {'id': 'cd-stripes', 'file': 'cd-stripes', 'kind': 'fill', 'motion': 'present-only'},
        {'id': 'cd-gps', 'file': 'cd-gps', 'kind': 'point', 'motion': 'present-only', 'select': 'station'},
    ],
    'objects': {'points': 'cd-points', 'fossils': 'cd-fossils', 'gps': 'cd-gps'},
    'method': {
        'en': "Continents are today's coastlines (Merdith et al. 2021, CC BY 4.0) rotated with the same model's rotation file. Each frame is the model's position for the selected age, computed in the browser by interpolating between the model's total rotation poles the way GPlates does (checked against pyGPlates to within 0.001°). Between poles, positions come from this interpolation, not from separate observations. Plates are rigid; east–west positions are a model convention.",
        'zh': '大陆轮廓是今天的海岸线（Merdith 等 2021，CC BY 4.0），按同一模型的旋转文件转动。每一帧都是模型在所选年代给出的位置：浏览器按 GPlates 的方法在模型的总重建极之间插值计算（与 pyGPlates 核对，误差不超过 0.001°）。两个极之间的位置来自插值，不是独立观测。板块按刚体处理；东西方向的位置是模型约定。',
    },
    'sources': ['S2', 'S3'],
})
REPORT['files'] = files
REPORT['totalBytes'] = sum(f['bytes'] for f in files.values())
REPORT['firstScreenGzipBytes'] = sum(files[k]['gzipBytes'] for k in ('cd-rotations', 'cd-land', 'cd-points'))

# 3.3-5 lossless extraction, and the golden fixture for tests/time-scene/plate-rotation.test.ts
rot_back = HERE / '.work/cd-rotations.rot'
rot_back.parent.mkdir(exist_ok=True)
rot_back.write_text(rot_text(ROT))
BACK = pygplates.RotationModel(str(rot_back))
rng = np.random.default_rng(72)
plates = sorted(used)
ages = [0, 0.05, 1, 7.3, 49.95, 50, 123.4, 199.9, 200, 250.25, 300, 333.3, 399.9, 400]
switch = sorted({s['poles'][0][0] for s in ROT['sequences'] if 0 < s['poles'][0][0] < START} | {s['poles'][-1][0] for s in ROT['sequences'] if 0 < s['poles'][-1][0] < START})
switch_ages = sorted({round(a + d, 4) for a in switch for d in (-0.05, 0, 0.05) if 0 <= a + d <= START})
cases = []
for i in range(200):
    pid = plates[i % len(plates)]
    lat = float(np.degrees(np.arcsin(rng.uniform(-1, 1))))
    lon = float(rng.uniform(-180, 180))
    cases.append({'plateId': pid, 'at': [round(lon, 6), round(lat, 6)]})
for p in points:
    cases.append({'plateId': p['plateId'], 'at': p['at'], 'id': p['id']})
golden, worst = [], 0.0
for c in cases:
    pt = pygplates.PointOnSphere(c['at'][1], c['at'][0])
    for t in ages + (switch_ages if c.get('id') is None and cases.index(c) < 40 else []):
        a = ROTATION.get_rotation(t, c['plateId']) * pt
        b = BACK.get_rotation(t, c['plateId']) * pt
        worst = max(worst, math.degrees(pygplates.GeometryOnSphere.distance(a, b)))
        la, lo = a.to_lat_lon()
        golden.append([c['plateId'], c['at'][0], c['at'][1], t, round(lo, 9), round(la, 9)])
REPORT['lossless'] = {'maxDifferenceDeg': worst, 'cases': len(golden), 'switchAges': len(switch_ages)}
FIXTURES.mkdir(parents=True, exist_ok=True)
(FIXTURES / 'golden.json').write_text(json.dumps({'version': 1, 'source': 'pygplates 1.0.0 RotationModel on Merdith et al. 2021 v1.2.4 1000_0_rotfile_Merdith_etal.rot', 'rows': '[plateId, lon, lat, ageMa, rotatedLon, rotatedLat]', 'cases': golden}, separators=(',', ':')) + '\n')

# Singapore trail sanity: path every 10 Myr from START (for the report only).
sg = next(p for p in points if p['id'] == 'site-singapore')
REPORT['singaporeTrail'] = [[t, *[round(v, 2) for v in (ROTATION.get_rotation(t, sg['plateId']) * pygplates.PointOnSphere(sg['at'][1], sg['at'][0])).to_lat_lon()]] for t in range(int(min(START, sg['from'])), -1, -50)]
(HERE / 'build-report.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=1) + '\n')
print(json.dumps({k: REPORT[k] for k in ('rotations', 'lod', 'lossless', 'totalBytes', 'firstScreenGzipBytes')}, indent=1))
print('unassigned', UNASSIGNED)
print('weak coverage years', weak[:10])
