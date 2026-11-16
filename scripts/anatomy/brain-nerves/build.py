"""brain-nerves static build (docs/75 §5.3), no Blender: cached dumps -> node meshes -> simplify.ts -> raw GLB.

Inputs (all in the gitignored cache): brain-nerves-{sources,skeleton,muscles}.npz (dump_sources.py),
bp3d/partof_BP3D_4.0_obj_99.zip (cerebellum), brain-nerves-skin.json (heart-and-lungs.glb skin nodes, topic frame).
Outputs: cache/brain-nerves-raw.glb (then optimize.ts --topic brain-nerves), brain-nerves/landmarks.json,
brain-nerves/organs.json (frame), cache/brain-nerves-build-stats.json, cache/brain-nerves-topic.npz (meshes for routes / G3).

Frame: source metres, Z up, front -Y, left +X -> topic (x - cx, z - cz, -(y - cy)) with the digestive /
heart-lungs umbilicus centre (digestive/organs.json), so this GLB lines up with theirs.
"""
import json
import warnings
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

warnings.filterwarnings('ignore', category=RuntimeWarning)  # spurious BLAS matmul warnings (numpy 2 on macOS)
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CACHE = ROOT / 'cache'
sys.path.insert(0, str(HERE))
import provenance as P  # noqa: E402

MANIFEST = json.loads((HERE / 'manifest.json').read_text())
FRAME = json.loads((ROOT / 'digestive/organs.json').read_text())
CX, CY, CZ = FRAME['sourceCentre']
CORTEX = ('frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'insula', 'cerebrum-medial')


def topic(v):
    v = np.asarray(v, float)
    return np.stack([v[:, 0] - CX, v[:, 2] - CZ, -(v[:, 1] - CY)], 1)


def weld(v, f, tol=1e-7):
    key = np.round(v / tol).astype(np.int64)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    inv = inv.ravel()
    f = inv[f]
    f = f[(f[:, 0] != f[:, 1]) & (f[:, 1] != f[:, 2]) & (f[:, 0] != f[:, 2])]
    return v[first], f


def compact(v, f):
    used = np.unique(f)
    remap = np.full(len(v), -1)
    remap[used] = np.arange(len(used))
    return v[used], remap[f]


def normals(v, f):
    n = np.zeros_like(v)
    fn = np.cross(v[f[:, 1]] - v[f[:, 0]], v[f[:, 2]] - v[f[:, 0]])
    for k in range(3):
        np.add.at(n, f[:, k], fn)
    length = np.linalg.norm(n, axis=1, keepdims=True)
    return n / np.where(length > 0, length, 1)


def closed(f):
    e = np.sort(np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]]), 1)
    _, c = np.unique(e, axis=0, return_counts=True)
    return bool((c == 2).all())


def outward(v, f, centre=None):
    """Flip a mesh whose normals point inwards on average (about its own or a given centre)."""
    c = v.mean(0) if centre is None else centre
    n = normals(v, f)
    return f if (np.einsum('ij,ij->i', n, v - c)).mean() >= 0 else f[:, ::-1]


def load(npz):
    data = np.load(CACHE / npz)
    return lambda n: (data['v::' + n], data['f::' + n].astype(np.int64))


nerv, skel, musc = load('brain-nerves-sources.npz'), load('brain-nerves-skeleton.npz'), load('brain-nerves-muscles.npz')
GEO = {'nervous': nerv, 'skeleton': skel, 'muscles': musc}


def source(part):
    return P.merged([GEO[part['system']](n) for n in part['sourceNames']])


def bp3d_frame():
    ref = P.merged([P.merged(P.bp3d_meshes(f)) for f in ('FMA67943', 'FMA62004')])
    import re
    names = [n for n in np.load(CACHE / 'brain-nerves-sources.npz').files if n.startswith('v::')]
    src = P.merged([nerv(n[3:]) for n in names if re.match(r'^v::(Pons|Medulla oblongata)\.[lr]$', n)])
    d, (M, T), _ = P.best_fit(P.sample(ref[0] * .001, ref[1], 20000), P.sample(*src, 20000), P.AXES)
    return M, T, d


def bp3d_cerebellum(M, T):
    rows = [l.split('\t') for l in (CACHE / 'bp3d/partof_element_parts.txt').read_text().splitlines()[1:]]
    files = {r[2].strip() for r in rows if r[0] == 'FMA67944'}
    import zipfile
    out = []
    with zipfile.ZipFile(CACHE / 'bp3d/partof_BP3D_4.0_obj_99.zip') as z:
        for name in z.namelist():
            if Path(name).stem in files:
                v, f = P.read_obj(z.read(name).decode('utf-8', 'replace'))
                out.append(((v * .001) @ M.T + T, f))
    return P.merged(out)


# Cerebellar folia (docs/75 §15.8). The BodyParts3D cerebellum is one smooth block. Atlas draws its folds as an
# original, schematic pattern: grooves that run across the cerebellum (the folia are transverse) and, seen in a
# midline cut, cut in towards its white core like the fissures of the arbor vitae, i.e. evenly spaced in angle round
# a point in front of its centre (about where the fourth ventricle is); on the side they fan out from the brainstem.
# The pattern is generated here, not traced from any image or mesh; its spacing and depth are design values,
# coarser than real folia so they read at screen size.
FOLIA = dict(spacingM=.0032, atRadiusM=.035, depthM=.0009, fissureDepthM=.0017, fissureEvery=4, widthFrac=.16,
             ahead=.012, bowRad=.12, coreM=(.010, .017))


def subdivide(v, f):
    """Midpoint subdivision (one level), shared edges split once."""
    e = np.sort(np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]]), 1)
    uniq, inv = np.unique(e, axis=0, return_inverse=True)
    inv = inv.ravel()
    mid = len(v) + inv
    v2 = np.vstack([v, (v[uniq[:, 0]] + v[uniq[:, 1]]) / 2])
    n = len(f)
    ab, bc, ca = mid[:n], mid[n:2 * n], mid[2 * n:]
    f2 = np.vstack([np.stack([f[:, 0], ab, ca], 1), np.stack([ab, f[:, 1], bc], 1), np.stack([ca, bc, f[:, 2]], 1),
                    np.stack([ab, bc, ca], 1)])
    return v2, f2


def folia(v, f):
    """Cut the schematic folia into the cerebellum (source frame in, source frame out); also returns the dense
    displaced surface (topic frame) whose normals shade the simplified mesh."""
    t = topic(v)
    for _ in range(2):
        t, f = subdivide(t, f)
    n = normals(t, f)
    c = t.mean(0)
    c0 = np.array([0.0, c[1], c[2] + FOLIA['ahead']])
    r = np.hypot(t[:, 1] - c0[1], t[:, 2] - c0[2])
    angle = np.arctan2(t[:, 1] - c0[1], -(t[:, 2] - c0[2])) + FOLIA['bowRad'] * (t[:, 0] / np.abs(t[:, 0]).max()) ** 2
    # A whole number of grooves round the circle, so there is no seam where the angle wraps (in front, at the brainstem).
    k = angle / (2 * np.pi) * round(2 * np.pi * FOLIA['atRadiusM'] / FOLIA['spacingM'])
    frac = k - np.floor(k)
    groove = np.exp(-((frac - .5) / FOLIA['widthFrac']) ** 2)
    depth = np.where(np.floor(k).astype(int) % FOLIA['fissureEvery'] == 0, FOLIA['fissureDepthM'], FOLIA['depthM'])
    lo, hi = FOLIA['coreM']
    mask = np.clip((r - lo) / (hi - lo), 0, 1)
    mask = mask * mask * (3 - 2 * mask)
    # No folds on the face that meets the brainstem (the peduncles), near the midline.
    near_mid = 1 - np.clip((np.abs(t[:, 0]) - .018) / .012, 0, 1)
    facing = np.clip((n[:, 2] - .2) / .4, 0, 1)
    mask *= 1 - near_mid * facing
    t = t - n * (depth * groove * mask)[:, None]
    src = np.stack([t[:, 0] + CX, -t[:, 2] + CY, t[:, 1] + CZ], 1)
    return src, f, (t, normals(t, f))


# Cerebrum core (docs/75 §15.9). The cortex is an open shell (white matter, deep nuclei and the hippocampus are not
# taken), so a cut, a spread-out view or the hidden insula would show an empty inside. Atlas closes it with a plain,
# smooth, neutral stand-in per hemisphere: an icosphere about the hemisphere's centre whose radius in each direction
# is a low percentile of the cortex's distance there (about the depth of the grooves), smoothed and set CORE_INSET_M
# further in. It claims no anatomy (no nuclei, no ventricles); it only makes the inside read as solid.
CORE_INSET_M = .0015


def icosphere(level):
    t = (1 + 5 ** .5) / 2
    v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
         [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]]
    f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
         [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]]
    v, f = np.array(v, float), np.array(f)
    for _ in range(level):
        v, f = subdivide(v, f)
    return v / np.linalg.norm(v, axis=1, keepdims=True), f


def cerebrum_core(cortex):
    """A closed, smooth stand-in inside one hemisphere's cortex (topic frame in and out)."""
    c = cortex.mean(0)
    u, f = icosphere(4)
    d = cortex - c
    dist = np.linalg.norm(d, axis=1)
    dirs = d / dist[:, None]
    tree = cKDTree(dirs)
    r = np.full(len(u), np.nan)
    for i, js in enumerate(tree.query_ball_point(u, 2 * np.sin(np.radians(5) / 2))):
        if len(js) >= 3:
            r[i] = np.percentile(dist[js], 15)
    e = np.unique(np.sort(np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]]), 1), axis=0)
    nb = [[] for _ in range(len(u))]
    for a, b in e:
        nb[a].append(b)
        nb[b].append(a)
    # Directions with no cortex (the opening round the brainstem) take their neighbours' radius; then smooth.
    for _ in range(200):
        miss = np.isnan(r)
        if not miss.any():
            break
        r[miss] = [np.nanmean(r[nb[i]]) if not np.all(np.isnan(r[nb[i]])) else np.nan for i in np.where(miss)[0]]
    for _ in range(12):
        r = .5 * r + .5 * np.array([r[n].mean() for n in nb])
    return c + u * (r - CORE_INSET_M)[:, None], f


CLEAR_M = .0005      # wanted clearance between cortex and bone
SIGMA_M = .004       # falloff of the local displacement (Gaussian), so the pressed patch stays smooth
REACH_M = .012       # vertices farther than this from every pressed vertex do not move


def signed_to_skull(points, skull_v, skull_f):
    """Exact signed distance to the skull (penetration.ts; +1 m = no bone within 10 mm) and the closest bone points."""
    inp, outp = CACHE / 'brain-nerves-penetration-in.json', CACHE / 'brain-nerves-penetration-out.json'
    inp.write_text(json.dumps(dict(points=np.asarray(points).ravel().tolist(), skullPositions=skull_v.ravel().tolist(),
                                   skullIndices=np.asarray(skull_f).ravel().tolist())))
    subprocess.run(['pnpm', 'exec', 'node', '--import', 'tsx', str(HERE / 'penetration.ts'), str(inp), str(outp)],
                   cwd=str(ROOT.parents[1]), check=True)
    res = json.loads(outp.read_text())
    return np.array(res['signed']), np.array(res['closest']).reshape(-1, 3)


def conform_cerebrum(v, skull_v, skull_f, rounds=80):
    """Local adjustment: where a vertex is inside the bone (or nearer than CLEAR_M), move it out along the bone
    normal; spread each push to the neighbourhood with a Gaussian weight (a field of position, so the lobes'
    shared seam vertices move together) and repeat until nothing is left inside."""
    start = v.copy()
    centre = v.mean(0)
    before, q = signed_to_skull(v, skull_v, skull_f)
    s = before
    for round_ in range(rounds):
        need = s < CLEAR_M
        if not need.any():
            break
        p = v[need]
        # Out of the bone: towards the closest bone point when inside, away from it when merely too near.
        out_dir = (q[need] - p) * np.where(s[need] < 0, 1, -1)[:, None]
        if round_ >= 20:
            # Still inside after 20 rounds: a crease where two bones meet; move towards the middle of the cerebrum.
            inward = centre - p
            out_dir = np.where((s[need] < 0)[:, None], inward, out_dir)
        out_dir /= np.maximum(np.linalg.norm(out_dir, axis=1, keepdims=True), 1e-9)
        push = 1.3 * (CLEAR_M - s[need])[:, None] * out_dir
        # Later rounds narrow the falloff, so a vertex caught in a bony crease is not held back by its neighbours.
        sigma = SIGMA_M if round_ < 20 else max(.001, SIGMA_M * .85 ** (round_ - 20))
        tree = cKDTree(p)
        field = np.zeros_like(v)
        # Weighted average of the pushes around each vertex, faded by the strongest weight.
        rows = tree.query_ball_point(v, REACH_M)
        for k, js in enumerate(rows):
            if not js:
                continue
            w = np.exp(-(np.linalg.norm(p[js] - v[k], axis=1) / sigma) ** 2)
            field[k] = (w[:, None] * push[js]).sum(0) / w.sum() * w.max()
        v = v + field
        s, q = signed_to_skull(v, skull_v, skull_f)
    d = np.linalg.norm(v - start, axis=1)
    return v, dict(method='Z-Anatomy placement kept (scale 1); local Gaussian displacement field out of the skull '
                          f'(clearance {CLEAR_M * 1000:.1f} mm, sigma {SIGMA_M * 1000:.0f} mm), signed distance from penetration.ts',
                   scale=1.0, centre=v.mean(0).round(5).tolist(), insideBefore=int((before < 0).sum()),
                   insideOver1MmBefore=int((before < -.001).sum()), deepestBeforeMm=round(float(before.min()) * 1000, 2),
                   insideAfter=int((s < 0).sum()), clearanceMinMm=round(float(s.min()) * 1000, 2),
                   movedOver0_1Mm=int((d > 1e-4).sum()), maxMoveMm=round(float(d.max()) * 1000, 2), vertices=int(len(v)))


REG = {}


def main():
    nodes = {}  # name -> dict(v, f (source frame), role, part, extras)
    parts = {p['id']: p for p in MANIFEST['parts']}

    # Cortex: per hemisphere, one welded surface, faces labelled by lobe; split sulci by nearest gyral face.
    for side in 'lr':
        pieces, labels = [], []
        for lobe in CORTEX:
            v, f = source(parts[f'{lobe}.{side}'])
            pieces.append((v, f))
            labels += [lobe] * len(f)
        sv, sf = source(parts[f'cortex-split.{side}'])
        gv, gf = P.merged(pieces)
        gc = gv[gf].mean(1)
        lab = np.array(labels)
        split_lab = lab[cKDTree(gc).query(sv[sf].mean(1))[1]]
        v, f = P.merged([(gv, gf), (sv, sf)])
        lab = np.concatenate([lab, split_lab])
        key = np.round(v / 1e-7).astype(np.int64)
        _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
        v, f = v[first], inv.ravel()[f]
        good = (f[:, 0] != f[:, 1]) & (f[:, 1] != f[:, 2]) & (f[:, 0] != f[:, 2])
        f, lab = f[good], lab[good]
        if (normals(v, f) * (v - v.mean(0))).sum(1).mean() < 0:
            f = f[:, ::-1]
        for lobe in CORTEX:
            lv, lf = compact(v, f[lab == lobe])
            nodes[f'{lobe}.{side}'] = dict(v=lv, f=lf, part=parts[f'{lobe}.{side}'], hemi=side)

    # BodyParts3D cerebellum in the brainstem's BodyParts3D frame.
    M, T, fit = bp3d_frame()
    cv, cf = bp3d_cerebellum(M, T)
    cv, cf = weld(cv, cf)
    cv, cf, dense = folia(cv, outward(cv, cf))
    nodes['cerebellum'] = dict(v=cv, f=cf, part=parts['cerebellum'], dense=dense)

    # Right elbow landmark: humerus long axis by PCA; the distal 3 cm; epicondyles = x extremes.
    hv, hf = skel('Humerus.r')
    c = hv.mean(0)
    _, _, vt = np.linalg.svd(hv - c, full_matrices=False)
    up = vt[0] * np.sign(vt[0][2])
    s = (hv - c) @ up
    distal = hv[s < s.min() + .03]
    med, lat = distal[distal[:, 0].argmax()], distal[distal[:, 0].argmin()]  # right arm: medial = towards +X
    pivot = (med + lat) / 2
    for id, p in parts.items():
        if id in nodes or p['role'] == 'split' or p['system'] in ('bp3d', 'atlas-glb', 'atlas') or p['role'] == 'cortex':
            continue
        v, f = weld(*source(p))
        if p['role'] not in ('system',) and id not in ('skull', 'vertebral-column'):
            f = outward(v, f)
        nodes[id] = dict(v=v, f=f, part=p)
    # Split the right arm nerves at the elbow plane (normal = humerus axis, through the pivot).
    v, f = nodes['arm-nerves.r']['v'], nodes['arm-nerves.r']['f']
    below = ((v[f].mean(1) - pivot) @ up) < 0
    for name, sel in (('arm-nerves.r', ~below), ('arm-nerves-forearm.r', below)):
        lv, lf = compact(v, f[sel])
        nodes[name] = dict(v=lv, f=lf, part=dict(parts['arm-nerves.r'], id=name))

    # Biceps fibre field: origin (two heads) -> insertion, as a straight station.
    o = np.vstack([skel(n)[0] for n in parts['biceps-r']['fibre']['origin']]).mean(0)
    i = np.vstack([skel(n)[0] for n in parts['biceps-r']['fibre']['insertion']]).mean(0)
    axis = i - o
    bv = nodes['biceps-r']['v']
    nodes['biceps-r']['u'] = np.clip((bv - o) @ axis / (axis @ axis), 0, 1)
    a = axis / np.linalg.norm(axis)
    nodes['biceps-r']['fibre'] = np.array([a[0], a[2], -a[1]])  # the frame change without its offset

    # Simplify (simplify.ts, meshoptimizer; open borders locked, so lobe seams stay shared).
    jobs = []
    for name, n in nodes.items():
        p = n['part']
        budget = p['triangleBudget'] if name != 'arm-nerves-forearm.r' else 1500
        if name == 'arm-nerves.r':
            budget = 3500
        jobs.append(dict(name=name, positions=topic(n['v']).ravel().tolist(), indices=n['f'].ravel().tolist(),
                         target=int(budget), error=float(p['maxDeviationM']) * 6))
    (CACHE / 'brain-nerves-simplify-input.json').write_text(json.dumps(jobs))
    subprocess.run(['pnpm', 'exec', 'node', '--import', 'tsx', str(ROOT / 'simplify.ts'), str(CACHE / 'brain-nerves-simplify-input.json'),
                    str(CACHE / 'brain-nerves-simplify-output.json')], cwd=str(ROOT.parents[1]), check=True, stdout=subprocess.DEVNULL)
    results = {r['name']: r for r in json.loads((CACHE / 'brain-nerves-simplify-output.json').read_text())}

    out, stats, keep = [], [], {}
    hemis = {'l': [], 'r': []}
    for name, n in nodes.items():
        r = results[name]
        pv = np.array(r['positions']).reshape(-1, 3)
        pf = np.array(r['indices']).reshape(-1, 3)
        before_v, before_f = topic(n['v']), n['f']
        u = n.get('u')
        used = np.unique(pf)
        remap = np.full(len(pv), -1)
        remap[used] = np.arange(len(used))
        sv, sf = pv[used], remap[pf]
        su = u[used] if u is not None else None
        a = P.sample(before_v, before_f, 8000)
        b = P.sample(sv, sf, 8000)
        dev = max(cKDTree(b).query(a)[0].max(), cKDTree(a).query(b)[0].max())
        keep[name] = (sv, sf)
        rec = dict(name=name, v=sv, f=sf, u=su, part=n['part'], hemi=n.get('hemi'))
        if 'dense' in n:
            # Shade the simplified cerebellum with the dense folded surface's normals (nearest dense vertex).
            dv, dn = n['dense']
            rec['n'] = dn[cKDTree(dv).query(sv)[1]]
        if n.get('hemi'):
            hemis[n['hemi']].append(rec)
        out.append(rec)
        stats.append(dict(node=name, before=int(len(before_f)), after=int(len(sf)), sampledDeviationMm=round(float(dev) * 1000, 3)))
        print(f'SIMPLIFY {name}: {len(before_f):,} -> {len(sf):,} ({dev * 1000:.2f} mm)', flush=True)
    # G3 registration: the cerebrum (Brainder, another person's scan as placed by Z-Anatomy) against the
    # BodyParts3D skull. Z-Anatomy's placement is kept (no rescaling): the vault fits, only parts of the
    # underside overlap the cranial floor and two midline ridges. Those are pressed in by a smooth local
    # displacement field (conform_cerebrum) until every vertex clears the bone by CLEAR_M; measured with the
    # exact signed distance of penetration.ts (also the unit test on the published GLB).
    cereb = [r for r in out if r['part']['role'] == 'cortex']
    allv = np.vstack([r['v'] for r in cereb])
    moved, REG_ = conform_cerebrum(allv, *keep['skull'])
    off = 0
    for r in cereb:
        r['v'] = moved[off:off + len(r['v'])]
        off += len(r['v'])
        keep[r['name']] = (r['v'], r['f'])
    REG.update(REG_)
    print('G3 cerebrum', REG, flush=True)
    for side in 'lr':
        cv_, cf_ = cerebrum_core(np.vstack([r['v'] for r in cereb if r['hemi'] == side]))
        name = f'cerebrum-core.{side}'
        rec = dict(name=name, v=cv_, f=cf_, u=None, part=parts['cerebrum-core'], hemi=None)
        out.append(rec)
        keep[name] = (cv_, cf_)
        stats.append(dict(node=name, before=int(len(cf_)), after=int(len(cf_)), sampledDeviationMm=0))
    # Cortex normals from the whole hemisphere, so the lobe seams shade as one surface.
    for side, recs in hemis.items():
        allv = np.vstack([r['v'] for r in recs])
        key = np.round(allv / 1e-7).astype(np.int64)
        _, inv = np.unique(key, axis=0, return_inverse=True)
        inv = inv.ravel()
        off, faces = 0, []
        for r in recs:
            faces.append(inv[r['f'] + off])
            off += len(r['v'])
        uv_ = np.zeros((inv.max() + 1, 3))
        uv_[inv] = allv
        nn = normals(uv_, np.vstack(faces))
        off = 0
        for r in recs:
            r['n'] = nn[inv[off:off + len(r['v'])]]
            off += len(r['v'])

    skin = json.loads((CACHE / 'brain-nerves-skin.json').read_text())
    glb = []
    for r in out:
        n = r.get('n')
        if n is None:
            n = normals(r['v'], r['f'])
        p = r['part']
        role = 'muscle' if p['role'] == 'muscle' else 'skin' if p['role'] == 'skin' else 'organ' if p['role'] in ('cortex', 'organ') else p['role']
        extras = dict(role=role, partId=r['name'], closed=closed(r['f']), sourceNodes=json.dumps(p['sourceNames'][:40]),
                      families=json.dumps(p['families']))
        if p.get('lobe') in ('frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe'):
            # Leader-label point on the lobe's outer (lateral) surface: its bounding-box centre lies inside the brain.
            c = r['v'].mean(0)
            want = c + np.array([.1 if r['name'].endswith('.l') else -.1, 0, 0])
            extras['labelPoint'] = r['v'][np.linalg.norm(r['v'] - want, axis=1).argmin()].round(4).tolist()
        attrs = {}
        if r['u'] is not None:
            attrs['_U'] = dict(size=1, values=r['u'].tolist())
            fib = nodes['biceps-r']['fibre']
            attrs['_FIBRE'] = dict(size=3, values=np.tile(fib, (len(r['v']), 1)).ravel().tolist())
        glb.append(dict(name=r['name'], positions=r['v'].ravel().tolist(), normals=n.ravel().tolist(), indices=r['f'].ravel().tolist(),
                        extras=extras, attributes=attrs))
    for name in ('skin-outline', 'skin-wire'):
        v = np.array(skin[name]['positions']).reshape(-1, 3)
        f = np.array(skin[name]['indices']).reshape(-1, 3)
        glb.append(dict(name=name, positions=v.ravel().tolist(), normals=normals(v, f).ravel().tolist(), indices=f.ravel().tolist(),
                        extras=dict(role='skin', partId=name, closed=False, sourceNodes=json.dumps([f'heart-and-lungs.glb#{name}']),
                                    families=json.dumps(['bp3d-zanatomy']))))
        keep[name] = (v, f)
        stats.append(dict(node=name, before=int(len(f)), after=int(len(f)), sampledDeviationMm=0))
    (CACHE / 'brain-nerves-glb-input.json').write_text(json.dumps(glb))
    subprocess.run(['pnpm', 'exec', 'node', '--import', 'tsx', str(HERE / 'glb.ts'), 'write', str(CACHE / 'brain-nerves-glb-input.json'),
                    str(CACHE / 'brain-nerves-raw.glb')], cwd=str(ROOT.parents[1]), check=True)
    np.savez_compressed(CACHE / 'brain-nerves-topic.npz', **{f'v::{k}': v for k, (v, f) in keep.items()},
                        **{f'f::{k}': f for k, (v, f) in keep.items()})

    # Frame record for optimize_static (skin floor and stature, as heart-lungs).
    sv = np.array(skin['skin-outline']['positions']).reshape(-1, 3)
    organs = dict(units='m', coordinates=dict(up='+Y', front='+Z', left='+X'), sourceCentre=FRAME['sourceCentre'],
                  floorY=float(sv[:, 1].min()), statureM=float(sv[:, 1].max() - sv[:, 1].min()),
                  transform=FRAME['transform'], rig=False, cerebrumRegistration=REG,
                  bp3dCerebellum=dict(fma='FMA67944', fitScale=float(np.cbrt(np.linalg.det(M))), fitMeanMm=fit['meanM'] * 1000,
                                      fitP95Mm=fit['p95M'] * 1000, fittedOn='BodyParts3D 4.0 pons + medulla vs source pons + medulla'))
    (HERE / 'organs.json').write_text(json.dumps(organs, indent=2) + '\n')
    pt, ut = topic(np.array([pivot]))[0], topic(np.array([pivot + up]))[0] - topic(np.array([pivot]))[0]
    mt, lt = topic(np.array([med, lat]))
    flex = (lt - mt) / np.linalg.norm(lt - mt)
    # Orient the hinge axis so a positive angle (right-hand rule) moves the hand forward (+Z).
    hand = topic(skel('Third metacarpal bone.r')[0]).mean(0)
    test = np.cross(flex, hand - pt)
    if test[2] < 0:
        flex = -flex
    lm = dict(elbow=dict(pivot=pt.round(5).tolist(), flexionAxis=flex.round(5).tolist(), humerusUp=ut.round(5).tolist(),
                         method='midpoint of the most medial and most lateral points of the distal 30 mm of Humerus.r; axis between them'))
    (HERE / 'landmarks.json').write_text(json.dumps(lm, indent=2) + '\n')
    (CACHE / 'brain-nerves-build-stats.json').write_text(json.dumps(stats, indent=1) + '\n')
    print('TOTAL', sum(s['after'] for s in stats), 'triangles,', len(glb), 'nodes', flush=True)


if __name__ == '__main__':
    main()
