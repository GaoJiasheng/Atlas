"""Flow paths for the heart-and-lungs topic, chained from source centrelines inside the published meshes.

Run after `run.py --topic heart-lungs` has built and optimised the model (reads
cache/heart-lungs-decoded.json, heart-lungs/centrelines.json, landmarks.json and the
`routes` section of manifest.json). Writes heart-lungs/routes.json: every pipeline flow
of docs/40 §3.6 with its `path` / `paths`, length, legs, schematic legs, bridges and a
containment check. The topic's build-flows script copies the paths into parts.json;
speeds, colours and counts stay content decisions.

How a path is made (manifest `routes`):
- `chain` legs follow the source segments' own centrelines. Each segment is entered at
  its point nearest the path so far, so a branch leaves its parent where it really
  leaves it (the arch -> the brachiocephalic trunk) and a tributary joins its trunk
  part-way (the hepatic veins -> the inferior vena cava). A junction gap up to 5 mm is
  joined directly; a larger one is a straight *bridge* (schematic), listed in `bridges`.
- `tree` follows the bronchial tree from the trachea to each segmental bronchus.
- `via` and `arc` legs are *schematic*: smooth curves through measured landmarks where
  the source has no lumen to follow (inside the heart, lungs and liver, the nose and
  throat, and the short exchange arcs where the finest vessels would be).
- `concat` joins finished paths end to end (the digested-food route).
Every point is checked against the meshes it should lie in (`Router.check`): six rays
perpendicular to the path, five of which must hit a traced leg's tube and four a
schematic leg's organ. A traced point that misses the published (simplified) tube at a
tight bend is first moved to the centre of that tube's section, at most 3 mm
(`Router.recentre`, listed per path in `recentred`).
Coordinates: topic metres, +Y up, +Z front, +X the body's left (= GLB scene).
"""
import json
import re
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
CACHE = HERE.parent / 'cache'


# ---------------------------------------------------------------- pure geometry

def as_path(points):
    path = np.asarray(points, dtype=float).reshape(-1, 3)
    keep = np.r_[True, np.linalg.norm(np.diff(path, axis=0), axis=1) > 1e-9]
    return path[keep]


def length(path):
    path = np.asarray(path, dtype=float)
    return float(np.linalg.norm(np.diff(path, axis=0), axis=1).sum()) if len(path) > 1 else 0.


def resample(path, step):
    """Even spacing of at most `step`, keeping both end points."""
    path = as_path(path)
    if len(path) < 2:
        return path
    s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))]
    at = np.linspace(0, s[-1], max(2, int(np.ceil(s[-1] / step)) + 1))
    return np.stack([np.interp(at, s, path[:, k]) for k in range(3)], axis=1)


def nearest_pair(a, b):
    """Indices (i, j) of the closest points of two polylines and their distance."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    d = np.linalg.norm(a[:, None, :] - b[None, :, :], axis=2)
    i, j = np.unravel_index(int(np.argmin(d)), d.shape)
    return int(i), int(j), float(d[i, j])


def nearest_index(path, point):
    return int(np.argmin(np.linalg.norm(np.asarray(path, float) - np.asarray(point, float), axis=1)))


def chain(segments, tolerance, start=None, names=None):
    """Follow oriented segment centrelines in order.

    The first segment starts at its point nearest `start` when given, else at its own
    start. Each next segment is entered at the pair of points (previous segment, next
    segment) that are closest: the path is cut there and the next segment followed to
    its end. Returns pieces [(points, 'traced' | 'bridge')], the bridges (junction gaps
    above `tolerance`, drawn straight) and every junction's gap.
    """
    names = names or [str(i) for i in range(len(segments))]
    first = as_path(segments[0])
    entry = 0 if start is None else nearest_index(first, start)
    pieces = [[first[entry:] if len(first) - entry >= 2 else first[-2:], 'traced']]
    own = 0  # where the previous segment starts in the newest piece
    bridges, joins = [], []
    for name, prev, seg in zip(names[1:], names, segments[1:]):
        seg = as_path(seg)
        path = pieces[-1][0]
        i, j, gap = nearest_pair(path[own:], seg)
        i += own
        if len(seg) - j < 2:
            j = len(seg) - 2
        head, tail = path[:i + 1], seg[j:]
        joins.append(dict(fromSegment=prev, toSegment=name, gapM=gap, enteredAtU=float(length(seg[:j + 1]) / max(length(seg), 1e-9))))
        if gap > tolerance:
            bridges.append(dict(fromSegment=prev, toSegment=name, gapM=gap, at=[float(x) for x in (head[-1] + tail[0]) / 2]))
            pieces[-1][0] = head
            pieces.append([np.stack([head[-1], tail[0]]), 'bridge'])
            pieces.append([tail, 'traced'])
            own = 0
        else:
            pieces[-1][0] = np.vstack([head, tail])
            own = len(head)
    return [(as_path(p), k) for p, k in pieces if len(as_path(p)) >= 1], bridges, joins


def catmull_rom(anchors, step):
    """Centripetal Catmull-Rom curve through the anchors (duplicates closer than 1 mm dropped)."""
    pts = [np.asarray(anchors[0], float)]
    for a in anchors[1:]:
        a = np.asarray(a, float)
        if np.linalg.norm(a - pts[-1]) > .001:
            pts.append(a)
    pts = np.asarray(pts)
    if len(pts) == 1:
        return pts
    if len(pts) == 2:
        return resample(pts, step)
    ext = np.vstack([2 * pts[0] - pts[1], pts, 2 * pts[-1] - pts[-2]])
    out = [pts[0]]
    for k in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[k - 1], ext[k], ext[k + 1], ext[k + 2]
        t0 = 0.
        t1 = t0 + np.linalg.norm(p1 - p0) ** .5
        t2 = t1 + np.linalg.norm(p2 - p1) ** .5
        t3 = t2 + np.linalg.norm(p3 - p2) ** .5
        n = max(4, int(np.ceil(np.linalg.norm(p2 - p1) / (step / 4))))
        for t in np.linspace(t1, t2, n + 1)[1:]:
            a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
            a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
            a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
            b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
            b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
            out.append((t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2)
    return resample(out, step)


def arc(p, q, away, bulge, step):
    """Quadratic arc from p to q, bowed by `bulge` metres away from the point `away`."""
    p, q, away = (np.asarray(x, float) for x in (p, q, away))
    mid = (p + q) / 2
    chord = q - p
    n = mid - away
    if np.linalg.norm(chord) > 1e-9:
        c = chord / np.linalg.norm(chord)
        n = n - c * (n @ c)
    if np.linalg.norm(n) < 1e-9:
        n = np.array([0., -1., 0.])
    n /= np.linalg.norm(n)
    control = mid + n * bulge * 2  # a quadratic Bezier reaches half its control offset
    t = np.linspace(0, 1, 64)[:, None]
    curve = (1 - t) ** 2 * p + 2 * (1 - t) * t * control + t ** 2 * q
    return resample(curve, step)


def build_tree(root, segments, tolerance, parents=None):
    """Attach unoriented segments to the root polyline one at a time (nearest end first).

    `parents` names the parent of a segment whose source does not reach its parent (a
    gap the nearest-end rule would bridge to the wrong airway); it is attached to that
    parent at the nearest points. A segment attached at the very start of another (two
    siblings leaving the same point) is re-attached to that sibling's parent.
    Returns {name: dict(parent, entry, path, gap, bridged)}: `path` runs away from the
    root, `entry` is the index on the parent's path where it branches off.
    """
    parents = parents or {}
    tree = {'__root__': dict(parent=None, entry=None, path=as_path(root), gap=0., bridged=False)}
    todo = {k: as_path(v) for k, v in segments.items()}
    while todo:
        best = None
        for name, seg in todo.items():
            if name in parents and parents[name] not in tree:
                continue
            for flip in (False, True):
                end = seg[-1] if flip else seg[0]
                for pname in ([parents[name]] if name in parents else tree):
                    d = np.linalg.norm(tree[pname]['path'] - end, axis=1)
                    k = int(np.argmin(d))
                    if best is None or d[k] < best[0]:
                        best = (float(d[k]), name, flip, pname, k)
        if best is None:
            raise RuntimeError(f'Unreachable tree parents: {sorted(todo)}')
        gap, name, flip, pname, k = best
        while k == 0 and tree[pname]['parent'] is not None:
            pname, k = tree[pname]['parent'], tree[pname]['entry']
        seg = todo.pop(name)
        tree[name] = dict(parent=pname, entry=k, path=seg[::-1] if flip else seg, gap=gap, bridged=gap > tolerance)
    return tree


def tree_route(tree, leaf):
    """Root-to-leaf pieces [(points, 'traced' | 'bridge')] and the segment names along the way."""
    names = []
    node = leaf
    while node is not None:
        names.append(node)
        node = tree[node]['parent']
    names.reverse()
    pieces = [[tree[names[0]]['path'], 'traced']]
    own = 0  # where the parent starts in the newest piece
    for child in names[1:]:
        # Cut the parent where the child branches off; the parent beyond that is not on this route.
        last = pieces[-1][0]
        cut = own + nearest_index(last[own:], tree[child]['path'][0])
        head, tail = last[:cut + 1], tree[child]['path']
        if tree[child]['bridged']:
            pieces[-1][0] = head
            pieces += [[np.stack([head[-1], tail[0]]), 'bridge'], [tail, 'traced']]
            own = 0
        else:
            pieces[-1][0] = np.vstack([head, tail])
            own = len(head)
    return [(as_path(p), k) for p, k in pieces], [n for n in names if n != '__root__']


def tangents(path):
    path = np.asarray(path, float)
    t = np.gradient(path, axis=0) if len(path) > 1 else np.array([[0., 1., 0.]])
    norm = np.linalg.norm(t, axis=1, keepdims=True)
    t = np.where(norm > 1e-12, t / np.maximum(norm, 1e-12), [0., 1., 0.])
    return t


def ray_hit(origin, direction, tris, max_distance):
    """Whether a ray hits any triangle within `max_distance` (Moller-Trumbore)."""
    a, b, c = tris[:, 0], tris[:, 1], tris[:, 2]
    e1, e2 = b - a, c - a
    h = np.cross(direction, e2)
    det = np.einsum('ij,ij->i', e1, h)
    ok = np.abs(det) > 1e-14
    inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    s = origin - a
    u = np.einsum('ij,ij->i', s, h) * inv
    q = np.cross(s, e1)
    v = np.einsum('ij,j->i', q, direction) * inv  # einsum: Accelerate's matmul raises spurious FP warnings
    t = np.einsum('ij,ij->i', e2, q) * inv
    e = 1e-9  # a ray through an edge or vertex counts for the triangles that share it
    return bool((ok & (u >= -e) & (v >= -e) & (u + v <= 1 + e) & (t > 1e-7) & (t < max_distance)).any())


def resample_with_tangents(path, step, delta=.002):
    """`resample`, plus each point's direction measured on the original (finer) polyline
    over +-delta, which follows a vessel's bends better than the 8 mm points can."""
    path = as_path(path)
    pts = resample(path, step)
    if len(path) < 2:
        return pts, np.tile([0., 1., 0.], (len(pts), 1))
    s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))]
    at = np.linspace(0, s[-1], len(pts))
    lo, hi = np.clip(at - delta, 0, s[-1]), np.clip(at + delta, 0, s[-1])
    a = np.stack([np.interp(lo, s, path[:, k]) for k in range(3)], axis=1)
    b = np.stack([np.interp(hi, s, path[:, k]) for k in range(3)], axis=1)
    t = b - a
    return pts, t / np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-12)


def enclosure(points, tris, max_distance=.12, rays=6, directions=None):
    """For each point, how many of `rays` directions perpendicular to the path hit the mesh.

    `directions` are the path's tangents (default: estimated from the points)."""
    points = np.asarray(points, float)
    tris = np.asarray(tris, float)
    centres = tris.mean(1)
    radius = np.linalg.norm(tris - centres[:, None, :], axis=2).max(1)
    out = []
    for q, t in zip(points, tangents(points) if directions is None else np.asarray(directions, float)):
        e1 = np.cross(t, [0., 0., 1.]) if abs(t[2]) < .9 else np.cross(t, [1., 0., 0.])
        e1 /= np.linalg.norm(e1)
        e2 = np.cross(t, e1)
        near = np.linalg.norm(centres - q, axis=1) < max_distance + radius
        local = tris[near]
        hits = 0
        if len(local):
            for k in range(rays):
                ang = 2 * np.pi * k / rays
                hits += ray_hit(q, np.cos(ang) * e1 + np.sin(ang) * e2, local, max_distance)
        out.append(hits)
    return np.asarray(out, int)


def section_centre(q, t, tris, radius=.004):
    """Perimeter centroid of the mesh's cross-section through q (plane normal t), within `radius` of q."""
    tris = np.asarray(tris, float)
    centres = tris.mean(1)
    near = np.linalg.norm(centres - q, axis=1) < radius + np.linalg.norm(tris - centres[:, None, :], axis=2).max(1)
    tt = tris[near]
    if not len(tt):
        return None
    ds = np.einsum('ijk,k->ij', tt - q, np.asarray(t, float))
    mids, weights = [], []
    for tri, d in zip(tt, ds):
        cut = []
        for a, b in ((0, 1), (1, 2), (2, 0)):
            if d[a] * d[b] < 0:
                cut.append(tri[a] + d[a] / (d[a] - d[b]) * (tri[b] - tri[a]))
        if len(cut) == 2:
            m = (cut[0] + cut[1]) / 2
            if np.linalg.norm(m - q) < radius:
                mids.append(m)
                weights.append(np.linalg.norm(cut[1] - cut[0]))
    if len(mids) < 3:
        return None
    return np.average(np.asarray(mids), axis=0, weights=weights)


def segment_crossings(path, tris):
    """Indices of path steps that pass through a triangle of the mesh."""
    path = np.asarray(path, float)
    tris = np.asarray(tris, float)
    centres = tris.mean(1)
    radius = np.linalg.norm(tris - centres[:, None, :], axis=2).max(1)
    out = []
    for i, (a, b) in enumerate(zip(path, path[1:])):
        d = b - a
        L = np.linalg.norm(d)
        if L < 1e-9:
            continue
        near = np.linalg.norm(centres - (a + b) / 2, axis=1) < L / 2 + radius
        if near.any() and ray_hit(a, d / L, tris[near], L):
            out.append(i)
    return out


def spray(vertices, target, rmin, rmax, count):
    """`count` surface points between rmin and rmax from `target`, spread by farthest-point sampling."""
    v = np.asarray(vertices, float)
    d = np.linalg.norm(v - target, axis=1)
    pool = v[(d >= rmin) & (d <= rmax)]
    if len(pool) < count:
        raise RuntimeError('Too few surface points for the spray')
    picked = [pool[np.argmin(np.linalg.norm(pool - target, axis=1))]]
    while len(picked) < count:
        dist = np.min(np.linalg.norm(pool[:, None, :] - np.asarray(picked)[None], axis=2), axis=1)
        picked.append(pool[int(np.argmax(dist))])
    return np.asarray(picked)


def reverse_leg(record, last):
    """A leg record of a path run backwards (index `last` is the final point)."""
    a, b = record['range']
    out = {k: v for k, v in record.items() if k not in ('endWithin', 'startWithin')}
    out['range'] = [last - b, last - a]
    if record.get('endWithin'):
        out['startWithin'] = record['endWithin']
    if record.get('startWithin'):
        out['endWithin'] = record['startWithin']
    if record.get('anchors'):
        out['anchors'] = record['anchors'][::-1]
    return out


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


# ---------------------------------------------------------------- the topic's routes

class Router:
    def __init__(self, manifest, centrelines, landmarks, meshes):
        spec = manifest['routes']
        self.spec, self.step, self.tol = spec, spec['stepM'], spec['joinToleranceM']
        self.segments = {k: as_path(v['points']) for k, v in centrelines['segments'].items()}
        self.node_of = {k: v['node'] for k, v in centrelines['segments'].items()}
        # A source segment made of unconnected pieces: `<source>#2`, `#3`, ... (longest first after the main one).
        for k, v in centrelines['segments'].items():
            for n, piece in enumerate(v.get('otherPieces', []), start=2):
                self.segments[f'{k}#{n}'] = as_path(piece)
                self.node_of[f'{k}#{n}'] = v['node']
        self.lm = {k: np.asarray(v['point'], float) for k, v in landmarks['landmarks'].items()}
        self.meshes = meshes
        self.flows = {}
        self._derive_landmarks()

    def _derive_landmarks(self):
        """Exchange sites in each lobe: either side of the lobe centroid, across the line from the hilum."""
        for lobe in [k for k in self.lm if re.fullmatch(r'(superior|middle|inferior)-lobe-(right|left)', k)]:
            c = self.lm[lobe]
            h = self.lm['hilum.r' if lobe.endswith('right') else 'hilum.l']
            d = (c - h) / np.linalg.norm(c - h)
            u = np.cross(d, [0., 0., 1.])
            u /= np.linalg.norm(u)
            self.lm[f'{lobe}.artery-site'] = c + u * .012
            self.lm[f'{lobe}.vein-site'] = c - u * .012

    def segment(self, name):
        """A segment centreline; a trailing `~` runs it backwards (a branch piece traced
        from its own end ring towards the trunk it leaves)."""
        return self.segments[name[:-1]][::-1] if name.endswith('~') else self.segments[name]

    # anchors -------------------------------------------------------------
    def path_of(self, ref):
        flow, pid = ref.split('/', 1)
        return self.flows[flow]['paths'][pid]['points']

    def anchor(self, a):
        kind, _, rest = a.partition(':')
        if kind == 'lm':
            return self.lm[rest]
        if kind in ('start', 'end', 'mid'):
            path = self.path_of(rest) if '/' in rest and rest.split('/')[0] in self.flows else self.segments[rest]
            if kind == 'mid':
                return resample(path, length(path) / 2)[1]
            return path[0] if kind == 'start' else path[-1]
        if kind == 'near':
            ref, _, landmark = rest.partition('@')
            path = self.path_of(ref)
            return path[nearest_index(path, self.lm[landmark])]
        if kind == 'airend':
            side = 'right' if rest.endswith('right') else 'left'
            mid = self.anchor(f'mid:exchange-lungs/{rest}')
            ends = [p['points'][-1] for p in self.flows[f'air-{side}']['paths'].values()]
            return ends[int(np.argmin([np.linalg.norm(e - mid) for e in ends]))]
        raise KeyError(a)

    def via_points(self, anchors):
        """Resolve anchors. Two need their neighbours: `beside:<segment>` is that segment's
        midpoint moved 10 mm towards the next anchor; `posterior:<node>` is four midline
        points, evenly spaced in height between the anchors either side, 7 mm in front of
        that node's back wall (the airway behind the soft palate and tongue)."""
        resolved = [None if a.split(':', 1)[0] in ('beside', 'posterior') else self.anchor(a) for a in anchors]
        out = []
        for k, a in enumerate(anchors):
            kind, _, rest = a.partition(':')
            if kind == 'beside':
                seg = self.segments[rest]
                mid = resample(seg, length(seg) / 2)[1]
                t = (seg[-1] - seg[0]) / np.linalg.norm(seg[-1] - seg[0])
                target = resolved[k + 1] - mid
                n = target - t * np.dot(target, t)
                out.append(mid + n / np.linalg.norm(n) * .010)
            elif kind == 'posterior':
                v = np.asarray(self.meshes[rest]['points'])
                for y in np.linspace(resolved[k - 1][1], resolved[k + 1][1], 6)[1:-1]:
                    band = v[(np.abs(v[:, 0]) < .012) & (np.abs(v[:, 1] - y) < .004)]
                    out.append(np.array([0., y, band[:, 2].min() + .007]))
            else:
                out.append(resolved[k])
        return out

    # legs ----------------------------------------------------------------
    def legs(self, legs):
        """Build one path from its legs; returns points and per-leg records."""
        pieces = []  # (points, record)
        pending = None  # a via leg waiting for the next leg's start point
        prev_end = None
        for leg in legs:
            if 'via' in leg:
                pending = leg
                continue
            if 'chain' in leg or 'tree' in leg:
                if 'chain' in leg:
                    start = None
                    if pending is not None:
                        start = self.via_points(pending['via'])[-1]
                    elif prev_end is not None:
                        start = prev_end
                    traced, bridges, joins = chain([self.segment(n) for n in leg['chain']], self.tol, start=start, names=leg['chain'])
                    within, sources = sorted({self.node_of[n.rstrip('~')] for n in leg['chain']} | set(leg.get('alsoWithin', []))), leg['chain']
                    info = dict(bridges=bridges, joins=joins)
                else:
                    traced, sources = tree_route(self.tree, leg['tree'])
                    sources = [leg['root']] + sources
                    within = ['trachea', 'bronchi']
                    info = dict(bridges=[dict(toSegment=n, gapM=self.tree[n]['gap']) for n in sources[1:] if self.tree[n]['bridged']])
                out = []
                for k, (p, kind) in enumerate(traced):
                    if kind == 'traced':
                        out.append((p, dict(kind='tree' if 'tree' in leg else 'chain', sources=sources, schematic=False, within=within, **(info if k == 0 else {}))))
                    else:
                        # A straight bridge over a source gap: schematic, checked against the tube and the organ it crosses.
                        out.append((p, dict(kind='bridge', sources=sources, schematic=True, within=within + leg.get('bridgeWithin', []))))
            elif 'arc' in leg:
                p, q = (self.anchor(a) for a in leg['arc'])
                away = self.lm[leg.get('away', 'lm:heart').split(':', 1)[1]]
                out = [(arc(p, q, away, leg['bulge'], self.step),
                        dict(kind='arc', anchors=leg['arc'], schematic=True, within=leg['within'], tissue=leg.get('tissue', False)))]
            elif 'concat' in leg:
                parts = [self.path_of(r) for r in leg['concat']]
                ptans = [self.flows[r.split('/')[0]]['paths'][r.split('/')[1]]['tangents'] for r in leg['concat']]
                if leg.get('until'):
                    cut = nearest_index(parts[-1], self.anchor(leg['until'])) + 1
                    parts[-1], ptans[-1] = parts[-1][:cut], ptans[-1][:cut]
                out, otan, gaps, inner = [], [], [], []
                for ref, part, ptan in zip(leg['concat'], parts, ptans):
                    offset = len(out)
                    n = len(part)
                    if out:
                        gaps.append(dict(to=ref, gapM=float(np.linalg.norm(out[-1] - part[0]))))
                        if np.linalg.norm(out[-1] - part[0]) < 1e-6:
                            part, ptan, offset = part[1:], ptan[1:], offset - 1
                    otan.extend(ptan)
                    # Each piece keeps its own leg records (schematic or not) for the containment check.
                    flow, pid = ref.split('/')
                    for r in self.flows[flow]['paths'][pid]['legs']:
                        a, b = r['range']
                        if a <= n - 1 and r['kind'] != 'concat':
                            inner.append(dict(r, range=[a + offset, min(b, n - 1) + offset], fromPath=ref))
                    out.extend(part)
                out = [(np.asarray(out), dict(kind='concat', paths=leg['concat'], schematic=False, joinGaps=gaps, inner=inner, _tangents=np.asarray(otan)))]
            else:
                raise KeyError(leg)
            if pending is not None:
                anchors = ([prev_end] if prev_end is not None else []) + self.via_points(pending['via']) + [out[0][0][0]]
                pieces.append((catmull_rom(anchors, self.step), self._via_record(pending)))
                pending = None
            pieces += out
            prev_end = out[-1][0][-1]
        if pending is not None:
            anchors = ([prev_end] if prev_end is not None else []) + self.via_points(pending['via'])
            pieces.append((catmull_rom(anchors, self.step), self._via_record(pending)))
        return self._assemble(pieces)

    def _via_record(self, leg):
        return dict(kind='via', anchors=leg['via'], schematic=True, within=leg['within'], tissue=leg.get('tissue', False),
                    **({'endWithin': leg['endWithin']} if leg.get('endWithin') else {}))

    def _assemble(self, pieces):
        points, tans, records = [], [], []
        for pts, rec in pieces:
            if rec['kind'] == 'concat':
                seg, tan = np.asarray(pts), rec.pop('_tangents')
            else:
                seg, tan = resample_with_tangents(pts, self.step)
            start = len(points) - 1 if points else 0
            if points and np.linalg.norm(points[-1] - seg[0]) < 1e-6:
                seg, tan = seg[1:], tan[1:]
            elif points:
                start = len(points)
            points.extend(seg)
            tans.extend(tan)
            if rec['kind'] == 'concat':
                for r in rec.pop('inner'):
                    a, b = r['range']
                    records.append(dict(r, range=[a + start, b + start]))
                records.append(dict(rec, range=[start, len(points) - 1]))
            else:
                records.append(dict(rec, range=[start, len(points) - 1]))
        return np.asarray(points), np.asarray(tans), records

    # flows ---------------------------------------------------------------
    def build(self):
        for fid in self.spec['order']:
            flow = self.spec['flows'][fid]
            paths = {}
            if 'tree' in flow:
                spec = flow['tree']
                bronchi = {k: v for k, v in self.segments.items() if self.node_of[k] == 'bronchi'}
                self.tree = build_tree(self.segments[spec['root']], bronchi, self.tol, spec.get('parents'))
                # One path to the end of every named segmental bronchus (B-number), branching or not.
                for leaf in sorted(k for k in self.tree if re.search(spec['leafPattern'], k)):
                    if (self.tree[leaf]['path'][-1][0] < 0) != (spec['side'] == 'r'):
                        continue
                    pts, tans, recs = self.legs(flow['head'] + [dict(tree=leaf, root=spec['root'], bridgeWithin=spec['bridgeWithin'])])
                    paths[slug(leaf)] = dict(points=pts, tangents=tans, legs=recs, leaf=leaf)
            elif 'spray' in flow:
                s = flow['spray']
                target = self.anchor(s['to'])
                starts = spray(self.meshes[s['node']]['points'], target, *s['radiusM'], s['count'])
                for k, p in enumerate(starts):
                    pts, tans = resample_with_tangents(catmull_rom([p, target], self.step), self.step)
                    paths[f'{flow["group"]}-{k + 1}'] = dict(points=pts, tangents=tans, legs=[dict(kind='via', anchors=[f'surface:{s["node"]}', s['to']], schematic=True,
                                                                                              within=s['within'], tissue=True, range=[0, len(pts) - 1])])
            elif 'reverse' in flow:
                for pid, p in self.flows[flow['reverse']]['paths'].items():
                    n = len(p['points']) - 1
                    paths[pid] = dict(points=p['points'][::-1].copy(), tangents=-p['tangents'][::-1],
                                      legs=[reverse_leg(r, n) for r in p['legs']][::-1])
            else:
                for pid, legs in flow['paths'].items():
                    pts, tans, recs = self.legs(legs)
                    paths[pid] = dict(points=pts, tangents=tans, legs=recs)
            if 'reverse' not in flow:
                for p in paths.values():
                    self.recentre(p)
            self.flows[fid] = dict(group=flow['group'], paths=paths)
        return self.flows

    def recentre(self, path, max_shift=.003):
        """Move a traced point that is not enclosed in the published (simplified) tube to
        the centre of that tube's cross-section, when that is at most 3 mm away and is
        enclosed. Source centrelines cut the inside of tight bends in vessels only 3 mm
        wide; the shipped mesh is simplified by up to half a millimetre on top."""
        moved = []
        for r in path['legs']:
            if r['schematic'] or r['kind'] == 'concat':
                continue
            a, b = r['range']
            tris = self.tris(r['within'])
            hits = enclosure(path['points'][a:b + 1], tris, directions=path['tangents'][a:b + 1])
            for i in np.flatnonzero(hits < 5) + a:
                if i in (a, b):
                    continue  # junction points are shared with the neighbouring leg
                c = section_centre(path['points'][i], path['tangents'][i], tris)
                if c is not None and np.linalg.norm(c - path['points'][i]) <= max_shift and \
                        enclosure([c], tris, directions=[path['tangents'][i]])[0] >= 5:
                    moved.append(dict(index=int(i), shiftM=float(np.linalg.norm(c - path['points'][i]))))
                    path['points'][i] = c
        path['recentred'] = moved

    # checks --------------------------------------------------------------
    def tris(self, nodes):
        out = []
        for n in nodes:
            m = self.meshes[n]
            out.append(np.asarray(m['points'])[np.asarray(m['faces'])])
        return np.vstack(out)

    def check(self, path):
        """Containment of every leg in the meshes it belongs to.

        Every point is cast six rays perpendicular to the path. Traced legs (source
        centrelines) must be enclosed on five of six sides by the leg's meshes; a traced
        leg's end on an open source ring is tested 3 mm inside the tube, since rays in the
        ring's own plane graze it. Schematic legs pass through real openings (the choanae,
        the mouth side of the oropharynx, the valves, the hilum of an organ), so they must
        be enclosed on four of six sides: they may run beside an opening but not leave the
        organ. Steps that cross a mesh surface are listed for both (entering an organ at
        its hilum crosses it once by design).
        """
        pts = path['points']
        report = []
        for r in path['legs']:
            if r['kind'] == 'concat':
                continue
            a, b = r['range']
            seg = pts[a:b + 1].copy()
            tris = self.tris(r['within'])
            hits = enclosure(seg, tris, max_distance=.4 if r.get('tissue') else .12, directions=path['tangents'][a:b + 1])
            if not r['schematic'] and len(seg) > 1:
                # An end on an open ring is probed 3 mm into the tube, along the path's direction
                # there or towards the next point (at a junction the two can differ); any of the three counts.
                for end, nxt, sign in ((0, 1, 1), (-1, -2, -1)):
                    t = path['tangents'][a if end == 0 else b]
                    toward = (seg[nxt] - seg[end]) / max(np.linalg.norm(seg[nxt] - seg[end]), 1e-9)
                    hits[end] = max(int(hits[end]), int(enclosure([seg[end] + sign * t * .003], tris, directions=[t])[0]),
                                    int(enclosure([seg[end] + toward * .003], tris, directions=[toward])[0]))
            need = 4 if r['schematic'] else 5
            crossings = segment_crossings(seg, tris)
            row = dict(kind=r['kind'], schematic=r['schematic'], within=r['within'], points=len(seg), raysNeeded=need, enclosed=int((hits >= need).sum()),
                       notEnclosed=[int(i + a) for i in np.flatnonzero(hits < need)], wallCrossings=[int(i + a) for i in crossings])
            for key, i in (('endWithin', b), ('startWithin', a)):
                if r.get(key):
                    # Inside a closed organ whichever way the path arrives: three axis-aligned ray fans.
                    organ = self.tris(r[key])
                    row[key.replace('Within', 'Enclosed')] = bool(min(enclosure(pts[i:i + 1], organ, directions=[axis])[0] for axis in np.eye(3)) >= 5)
            report.append(row)
        return report

    def joins(self):
        cyc = self.spec['cycle']
        out = []
        for a, b in zip(cyc, cyc[1:] + cyc[:1]):
            ends = {k: p['points'][-1] for k, p in self.flows[a]['paths'].items()}
            starts = {k: p['points'][0] for k, p in self.flows[b]['paths'].items()}
            for k, e in ends.items():
                j, d = min(((j, float(np.linalg.norm(e - s))) for j, s in starts.items()), key=lambda x: x[1])
                out.append(dict(end=f'{a}/{k}', start=f'{b}/{j}', gapM=d))
            for j, s in starts.items():
                k, d = min(((k, float(np.linalg.norm(e - s))) for k, e in ends.items()), key=lambda x: x[1])
                out.append(dict(end=f'{a}/{k}', start=f'{b}/{j}', gapM=d))
        return out


def r4(path):
    return [[round(float(x), 4) for x in q] for q in path]


def main():
    manifest = json.loads((HERE / 'manifest.json').read_text())
    centrelines = json.loads((HERE / 'centrelines.json').read_text())
    landmarks = json.loads((HERE / 'landmarks.json').read_text())
    meshes = {e['name']: dict(points=np.asarray(e['points']), faces=np.asarray(e['faces']))
              for e in json.loads((CACHE / 'heart-lungs-decoded.json').read_text())}
    router = Router(manifest, centrelines, landmarks, meshes)
    flows = router.build()
    out = {}
    for fid, flow in flows.items():
        rows = []
        for pid, p in flow['paths'].items():
            checks = router.check(p)
            schematic = [dict(range=r['range'], kind=r['kind'], anchors=r.get('anchors', r.get('sources')), tissue=r.get('tissue', False))
                         for r in p['legs'] if r['schematic']]
            bridges = [b for r in p['legs'] if r['kind'] in ('chain', 'tree') for b in r.get('bridges', [])]
            traced = [c for c in checks if not c['schematic']]
            rows.append(dict(id=pid, **({'leaf': p['leaf']} if 'leaf' in p else {}), lengthM=round(length(p['points']), 4), points=len(p['points']),
                             tracedPoints=sum(c['points'] for c in traced), tracedNotEnclosed=sum(len(c['notEnclosed']) for c in traced),
                             schematicPoints=sum(c['points'] for c in checks if c['schematic']), schematicNotEnclosed=sum(len(c['notEnclosed']) for c in checks if c['schematic']),
                             schematicCrossings=sum(len(c['wallCrossings']) for c in checks if c['schematic']),
                             recentred=p.get('recentred', []), schematic=schematic, bridges=bridges, legs=[{k: v for k, v in r.items() if k not in ('joins',)} for r in p['legs']],
                             containment=checks, path=r4(p['points'])))
        out[fid] = dict(group=flow['group'], paths=rows)
    joins = router.joins()
    summary = {fid: dict(paths=len(f['paths']), lengthM=round(sum(p['lengthM'] for p in f['paths']), 3),
                         bridges=sum(len(p['bridges']) for p in f['paths']), schematicLegs=sum(len(p['schematic']) for p in f['paths']),
                         tracedPoints=sum(p['tracedPoints'] for p in f['paths']), tracedNotEnclosed=sum(p['tracedNotEnclosed'] for p in f['paths']),
                         schematicPoints=sum(p['schematicPoints'] for p in f['paths']), schematicNotEnclosed=sum(p['schematicNotEnclosed'] for p in f['paths']),
                         schematicCrossings=sum(p['schematicCrossings'] for p in f['paths']))
               for fid, f in out.items()}
    report = dict(note='Generated by heart-lungs/routes.py; topic metres; see the module docstring. A flow with one path uses `path` in parts.json, otherwise `paths`.',
                  stepM=router.step, joinToleranceM=router.tol,
                  joins=dict(maxGapM=max(j['gapM'] for j in joins), over=[j for j in joins if j['gapM'] > router.tol]),
                  summary=summary, flows=out)
    (HERE / 'routes.json').write_text(json.dumps(report, indent=1) + '\n')
    for fid, s in summary.items():
        print(f"ROUTE {fid}: {s['paths']} paths, {s['lengthM']:.3f} m, bridges {s['bridges']}, schematic legs {s['schematicLegs']}, "
              f"traced points not enclosed {s['tracedNotEnclosed']}/{s['tracedPoints']}, schematic points not enclosed {s['schematicNotEnclosed']}/{s['schematicPoints']}, schematic surface crossings {s['schematicCrossings']}", flush=True)
    print('JOINS max gap mm', round(report['joins']['maxGapM'] * 1000, 2), 'over tolerance', len(report['joins']['over']), flush=True)
    return report


if __name__ == '__main__':
    main()
