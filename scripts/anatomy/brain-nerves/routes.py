"""Signal routes for the brain-and-nerves flows (docs/75 §4.1), topic frame, no Blender.

Along nerves the route follows the source meshes: the nerve vertices are binned into 3 mm voxels, the voxel
centres joined to their near neighbours, and the shortest path between two anchors taken (Dijkstra), then
smoothed and resampled. Inside the brain, the spinal cord and between a nerve and the cord, the route is
schematic: a smooth curve through anatomical anchors (structure centroids, the cord centreline). Every
schematic leg is listed in routes.json. Writes brain-nerves/routes.json and brain-nerves/cord.json (the
procedural spinal cord's centreline and radii).
"""
import json
import re
import warnings
from pathlib import Path

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from scipy.spatial import cKDTree

warnings.filterwarnings('ignore', category=RuntimeWarning)
HERE = Path(__file__).resolve().parent
CACHE = HERE.parent / 'cache'
FRAME = json.loads((HERE.parent / 'digestive/organs.json').read_text())
CX, CY, CZ = FRAME['sourceCentre']
ORGANS = json.loads((HERE / 'organs.json').read_text())
REG = ORGANS['cerebrumRegistration']
NERV = np.load(CACHE / 'brain-nerves-sources.npz')
SKEL = np.load(CACHE / 'brain-nerves-skeleton.npz')
TOPIC = np.load(CACHE / 'brain-nerves-topic.npz')


def topic(v):
    v = np.asarray(v, float)
    return np.stack([v[:, 0] - CX, v[:, 2] - CZ, -(v[:, 1] - CY)], 1)


def cerebrum(p):
    """Source cortex point -> built (registered) cerebrum."""
    c = np.array(REG['centre'])
    return (np.asarray(p) - c) * REG['scale'] + c


def verts(*names, src=NERV):
    return np.vstack([topic(src['v::' + n]) for n in names])


def centroid(*names, src=NERV):
    return verts(*names, src=src).mean(0)


def resample(p, step):
    p = np.asarray(p, float)
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] == 0:
        return p[:1]
    n = max(2, int(np.ceil(s[-1] / step)) + 1)
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, p[:, k]) for k in range(3)], 1)


def smooth(p, k=2):
    q = p.copy()
    for _ in range(k):
        q[1:-1] = (q[:-2] + 2 * q[1:-1] + q[2:]) / 4
    return q


def spline(anchors, step=.004):
    """Catmull-Rom through the anchors (schematic)."""
    a = np.asarray(anchors, float)
    if len(a) == 2:
        return resample(a, step)
    pts = [a[0]]
    ext = np.vstack([2 * a[0] - a[1], a, 2 * a[-1] - a[-2]])
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1:i + 3]
        for t in np.linspace(0, 1, 12)[1:]:
            t2, t3 = t * t, t * t * t
            pts.append(.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return resample(np.array(pts), step)


def along(names, start, end, voxel=.003, step=.008):
    """Shortest path over the nerve meshes from the vertex nearest `start` to the one nearest `end`."""
    v = verts(*names)
    key = np.floor(v / voxel).astype(np.int64)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    inv = inv.ravel()
    c = np.zeros((inv.max() + 1, 3))
    np.add.at(c, inv, v)
    c /= np.bincount(inv)[:, None]
    tree = cKDTree(c)
    pairs = tree.query_pairs(voxel * 2.2, output_type='ndarray')
    w = np.linalg.norm(c[pairs[:, 0]] - c[pairs[:, 1]], axis=1)
    a_, b_ = list(pairs[:, 0]), list(pairs[:, 1])
    w = list(w)
    # Source nerves that do not touch (the plexus has no lateral / medial cord objects): bridge each pair of
    # pieces at their closest points, up to 60 mm, at triple cost so the path stays on nerve where it can.
    from scipy.sparse.csgraph import connected_components
    g0 = coo_matrix((np.ones(len(a_)), (a_, b_)), shape=(len(c), len(c)))
    n, comp = connected_components(g0, directed=False)
    for i in range(n):
        for j in range(i + 1, n):
            pi, pj = np.where(comp == i)[0], np.where(comp == j)[0]
            dd, k = cKDTree(c[pj]).query(c[pi])
            m = dd.argmin()
            if dd[m] < .06:
                a_.append(pi[m]); b_.append(pj[k[m]]); w.append(dd[m] * 3)
    a_, b_, w = np.array(a_), np.array(b_), np.array(w)
    g = coo_matrix((np.concatenate([w, w]), (np.concatenate([a_, b_]), np.concatenate([b_, a_]))), shape=(len(c), len(c))).tocsr()
    s, e = tree.query(start)[1], tree.query(end)[1]
    dist, pred = dijkstra(g, indices=s, return_predecessors=True)
    if not np.isfinite(dist[e]):
        raise RuntimeError(f'no path along {names}')
    path, i = [], e
    while i != s:
        path.append(c[i])
        i = pred[i]
    path.append(c[s])
    return resample(smooth(np.array(path[::-1]), 3), step)


def extreme(names, axis, sign, src=NERV):
    v = verts(*names, src=src)
    return v[(v[:, axis] * sign).argmax()]


def join(*legs):
    out, schematic, at = [], [], 0.
    for kind, pts in legs:
        pts = np.asarray(pts)
        if out:
            pts = pts[1:] if np.linalg.norm(pts[0] - out[-1]) < 1e-6 else pts
        seg = np.vstack([out[-1:], pts]) if out else pts
        length = float(np.linalg.norm(np.diff(seg, axis=0), axis=1).sum()) if len(seg) > 1 else 0.
        if kind == 'schematic':
            schematic.append([round(at, 4), round(at + length, 4)])
        at += length
        out.extend(pts)
    return dict(points=np.round(np.array(out), 4).tolist(), lengthM=round(at, 4), schematic=schematic)


def cord_line():
    """Centreline of the spinal dura (slice centroids), from the medulla down to the level of the L1 body."""
    v, f = TOPIC['v::spinal-dura'], TOPIC['f::spinal-dura']
    top = TOPIC['v::medulla'][:, 1].min() + .004
    l1 = topic(SKEL['v::Vertebra L1'])[:, 1].mean()
    ys = np.arange(top, l1, -.008)
    pts = []
    for y in ys:
        s = v[np.abs(v[:, 1] - y) < .004]
        if len(s) > 10:
            pts.append([0., y, (s[:, 2].min() + s[:, 2].max()) / 2])
    pts = smooth(np.array(pts), 3)
    pts[:, 0] = 0
    return pts, float(l1)


def main():
    cord, l1 = cord_line()
    cord_top = TOPIC['v::medulla'].mean(0)
    # Levels: the cord point beside the middle of vertebra C6 (arm), T6 (trunk) and its end (legs).
    level = lambda name: cord[np.abs(cord[:, 1] - topic(SKEL['v::' + name])[:, 1].mean()).argmin()]
    c6, t6, end = level('Vertebra C6'), level('Vertebra T6'), cord[-1]
    stem = [centroid('Midbrain.l', 'Midbrain.r'), centroid('Pons.l', 'Pons.r'), centroid('Medulla oblongata.l', 'Medulla oblongata.r')]

    def cortex_point(name, side, inward=.012):
        """Inside a gyrus, below its upper-lateral surface (registered cerebrum)."""
        v = cerebrum(verts(f'{name}.{side}'))
        p = v[np.argsort(v[:, 1])[-max(5, len(v) // 20):]].mean(0) if name in ('Precentral gyrus', 'Postcentral gyrus') else v.mean(0)
        mid = np.array([0., stem[0][1] + .03, stem[0][2]])
        return p + (mid - p) / np.linalg.norm(mid - p) * inward

    def down_from_brain(side_brain):
        pre = cortex_point('Precentral gyrus', side_brain)
        return [pre, (pre + stem[0]) / 2 + np.array([0, .01, 0]), stem[0], stem[1], stem[2]]

    def up_to_brain(side_brain):
        post = cortex_point('Postcentral gyrus', side_brain)
        return [stem[2], stem[1], stem[0], (post + stem[0]) / 2 + np.array([0, .01, 0]), post]

    def cord_between(a_y, b_y):
        sel = cord[(cord[:, 1] <= max(a_y, b_y) + 1e-9) & (cord[:, 1] >= min(a_y, b_y) - 1e-9)]
        return sel if a_y > b_y else sel[::-1]

    arm = {s: [n for n in ('Roots of brachial plexus', 'Superior trunk of brachial plexus', 'Middle trunk of brachial plexus',
                           'Inferior trunk of brachial plexus', 'Anterior division of superior trunk of brachial plexus',
                           'Anterior division of middle trunk of brachial plexus', 'Anterior division of inferior trunk of brachial plexus',
                           'Posterior division of superior trunk of brachial plexus', 'Posterior cord of brachial plexus',
                           'Median nerve', 'Common palmar digital branches of median nerve', 'Proper palmar digital branches of median nerve',
                           'Musculocutaneous nerve')]
           for s in 'lr'}
    names = lambda s, lst: [f'{n}.{s}' for n in lst if f'v::{n}.{s}' in NERV.files]
    flows = {}
    sign = {'l': 1, 'r': -1}

    def hand_path(s):
        """Index fingertip -> median nerve -> plexus -> root at the cord, along the nerve meshes."""
        digital = verts(f'Proper palmar digital branches of median nerve.{s}')
        tip = digital[digital[:, 1].argmin()]
        roots = verts(f'Roots of brachial plexus.{s}')
        root = roots[np.abs(roots[:, 0]).argmin()]
        return along(names(s, arm[s][:-1]), tip, root), tip, root

    def foot_path(s):
        legs = names(s, ['Sciatic nerve', 'Tibial nerve'])
        tib = verts(f'Tibial nerve.{s}')
        foot = tib[tib[:, 1].argmin()]
        sci = verts(f'Sciatic nerve.{s}')
        top = sci[sci[:, 1].argmax()]
        return along(legs, foot, top), foot, top

    cauda = verts('Cauda equina')
    up_paths, down_paths = {}, {}
    for s in 'lr':
        opp = 'r' if s == 'l' else 'l'
        hp, tip, root = hand_path(s)
        into = [root, np.array([root[0] * .4, (root[1] + c6[1]) / 2, c6[2]]), c6]
        up_paths[f'arm-{s}'] = join(('nerve', hp), ('schematic', spline(into, .006)), ('schematic', cord_between(c6[1], stem[2][1])),
                                    ('schematic', spline(up_to_brain(opp))))
        down_paths[f'arm-{s}'] = join(('schematic', spline(down_from_brain(opp))), ('schematic', np.vstack([stem[2], cord_between(stem[2][1], c6[1])])),
                                      ('schematic', spline(into[::-1], .006)), ('nerve', hp[::-1]))
        fp, foot, top = foot_path(s)
        cauda_s = cauda[np.sign(cauda[:, 0]) == sign[s]]
        mid = cauda_s[np.abs(cauda_s[:, 1] - (end[1] + top[1]) / 2).argmin()]
        leg_in = [top, mid, end]
        up_paths[f'leg-{s}'] = join(('nerve', fp), ('schematic', spline(leg_in, .008)), ('schematic', cord[::-1]),
                                    ('schematic', spline(up_to_brain(opp))))
        down_paths[f'leg-{s}'] = join(('schematic', spline(down_from_brain(opp))), ('schematic', cord), ('schematic', spline(leg_in[::-1], .008)),
                                      ('nerve', fp[::-1]))
    flows['overview-down'] = down_paths
    flows['overview-up'] = up_paths

    # The reflex arc (right hand on a hot mug).
    hp, tip, root = hand_path('r')
    gan = verts('Spinal ganglion.r')
    gan = gan[np.abs(gan[:, 1] - c6[1]).argmin()]
    back_horn = c6 + np.array([-.002, 0, -.002])
    front_horn = c6 + np.array([-.002, 0, .002])
    flows['reflex-touch'] = dict(touch=join(('nerve', resample(np.vstack([tip + np.array([0, .012, 0]), tip]), .002))))
    flows['reflex-sensory'] = dict(main=join(('nerve', hp), ('schematic', spline([root, gan, back_horn], .004))))
    flows['reflex-relay'] = dict(main=join(('schematic', spline([back_horn, c6 + np.array([-.001, 0, 0]), front_horn], .001))))
    mc = verts('Musculocutaneous nerve.r')
    biceps = TOPIC['v::biceps-r'].mean(0)
    mc_end = mc[np.linalg.norm(mc - biceps, axis=1).argmin()]  # where the nerve passes closest to the belly
    # The musculocutaneous nerve leaves the median nerve's upper end in this source (no lateral cord object).
    motor = along(names('r', ['Roots of brachial plexus', 'Superior trunk of brachial plexus', 'Anterior division of superior trunk of brachial plexus',
                              'Posterior cord of brachial plexus', 'Median nerve', 'Musculocutaneous nerve']), root, mc_end)
    flows['reflex-motor'] = dict(main=join(('schematic', spline([front_horn, np.array([root[0] * .5, root[1], root[2]]), root], .004)), ('nerve', motor),
                                           ('schematic', spline([mc_end, biceps], .004))))
    flows['reflex-to-brain'] = dict(main=join(('schematic', cord_between(c6[1], stem[2][1])),
                                              ('schematic', spline(up_to_brain('l')))))

    # Senses: eyes and ears into the brain.
    sight = {}
    for s in 'lr':
        eye = centroid(f'Sclera.{s}')
        opt = names(s, ['Optic nerve (II)', 'Optic chiasm', 'Optic tract'])
        on = verts(f'Optic nerve (II).{s}')
        front = on[on[:, 2].argmax()]
        tract = verts(f'Optic tract.{s}')
        back = tract[tract[:, 2].argmin()]
        calc = cerebrum(verts(f'Calcarine sulcus.{s}')).mean(0)
        sight[f'eye-{s}'] = join(('schematic', resample(np.vstack([eye, front]), .004)), ('nerve', along(opt, front, back, .002, .004)),
                                 ('schematic', spline([back, (back + calc) / 2 + np.array([0, .006, 0]), calc])))
    flows['sight-signal'] = sight
    hearing = {}
    for s in 'lr':
        viii = verts(f'Vestibulocochlear nerve (VIII).{s}')
        lateral = viii[(viii[:, 0] * sign[s]).argmax()]
        medial = viii[(viii[:, 0] * sign[s]).argmin()]
        ear = lateral + np.array([sign[s] * .008, 0, 0])
        hg = cerebrum(verts(f'Transverse temporal gyri.{s}')).mean(0)
        hearing[f'ear-{s}'] = join(('schematic', resample(np.vstack([ear, lateral]), .003)), ('nerve', resample(np.vstack([lateral, medial]), .003)),
                                   ('schematic', spline([medial, stem[1], (stem[1] + hg) / 2 + np.array([0, .012, 0]), hg])))
    flows['hearing-signal'] = hearing
    eye_r = centroid('Sclera.r')
    occ = cerebrum(verts('Calcarine sulcus.l')).mean(0)
    flows['reaction-route'] = dict(main=join(('schematic', spline([eye_r, sight['eye-r']['points'][len(sight['eye-r']['points']) // 2], occ])),
                                             ('schematic', spline([occ, cortex_point('Superior parietal lobule', 'l', .02), cortex_point('Precentral gyrus', 'l')])),
                                             ('schematic', spline(down_from_brain('l'))),
                                             ('schematic', np.vstack([stem[2], cord_between(stem[2][1], c6[1])])),
                                             ('schematic', spline([c6, np.array([root[0] * .4, (root[1] + c6[1]) / 2, c6[2]]), root], .006)),
                                             ('nerve', hp[::-1])))
    out = dict(frame='topic: metres, +Y up, +Z front, +X body left; umbilicus centre (digestive/organs.json)',
               method=__doc__.strip().splitlines()[1] + ' ' + ' '.join(__doc__.strip().splitlines()[2:4]),
               flows=flows, anchors=dict(fingertip=np.round(tip, 4).tolist(), c6=np.round(c6, 4).tolist(), cordEnd=np.round(end, 4).tolist(),
                                         biceps=np.round(biceps, 4).tolist(), eyeL=np.round(centroid('Sclera.l'), 4).tolist(),
                                         eyeR=np.round(eye_r, 4).tolist(),
                                         earL=np.round(hearing['ear-l']['points'][0], 4).tolist(), earR=np.round(hearing['ear-r']['points'][0], 4).tolist()))
    (HERE / 'routes.json').write_text(json.dumps(out) + '\n')
    # The procedural cord: its centreline and a radius that narrows to a point at the end (schematic).
    n = len(cord)
    radius = np.where(np.arange(n) < n - 4, .0045, np.linspace(.0045, .0012, 4)[np.clip(np.arange(n) - (n - 4), 0, 3)])
    (HERE / 'cord.json').write_text(json.dumps(dict(path=np.round(cord, 4).tolist(), radius=np.round(radius, 4).tolist(), endY=round(l1, 4),
                                                    method='slice centroids of the spinal dura every 8 mm, from 4 mm below the top of the medulla '
                                                           'to the middle of the L1 vertebral body; constant radius, tapering over the last 24 mm')) + '\n')
    for k, f in flows.items():
        for pid, p in f.items():
            print(k, pid, len(p['points']), p['lengthM'], 'schematic', p['schematic'])
    print('cord', n, 'points, end y', round(l1, 3))


if __name__ == '__main__':
    main()
