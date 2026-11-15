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
    nodes['cerebellum'] = dict(v=cv, f=outward(cv, cf), part=parts['cerebellum'])

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
        if id in nodes or p['role'] == 'split' or p['system'] in ('bp3d', 'atlas-glb') or p['role'] == 'cortex':
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
        if n.get('hemi'):
            hemis[n['hemi']].append(rec)
        out.append(rec)
        stats.append(dict(node=name, before=int(len(before_f)), after=int(len(sf)), sampledDeviationMm=round(float(dev) * 1000, 3)))
        print(f'SIMPLIFY {name}: {len(before_f):,} -> {len(sf):,} ({dev * 1000:.2f} mm)', flush=True)
    # G3 registration: the cerebrum (Brainder, another person's scan as placed by Z-Anatomy) against the
    # BodyParts3D skull. One uniform scale about the cerebrum centroid, the largest of 1.000 … 0.970 that
    # leaves fewer than 0.5 % of its vertices 1–8 mm inside the bone (fit.py's signed nearest-normal test).
    from fit import penetration
    cereb = [r for r in out if r['part']['role'] == 'cortex']
    allv = np.vstack([r['v'] for r in cereb])
    centre = allv.mean(0)
    scale = 1.0
    for s_ in np.arange(1.0, .9699, -.005):
        if penetration((allv - centre) * s_ + centre, *keep['skull']) < .005 * len(allv):
            scale = float(round(s_, 3))
            break
    for r in cereb:
        r['v'] = (r['v'] - centre) * scale + centre
        keep[r['name']] = (r['v'], r['f'])
    REG.update(scale=scale, centre=centre.round(5).tolist(), before=int(penetration(allv, *keep['skull'])),
               after=int(penetration((allv - centre) * scale + centre, *keep['skull'])), vertices=int(len(allv)))
    print('G3 cerebrum scale', REG, flush=True)
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
