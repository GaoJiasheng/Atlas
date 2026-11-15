"""G3 (docs/75 §5.2): brain to skull fit, measured on the built meshes (cache/brain-nerves-topic.npz).

For every brain vertex: the nearest point on the skull (dense surface samples with face normals). The bone
normal at that point says which side the vertex is on: positive = in the cranial cavity, negative = inside
the bone (interpenetration). Writes brain-nerves/fit.json.
"""
import json
import warnings
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

warnings.filterwarnings('ignore', category=RuntimeWarning)
HERE = Path(__file__).resolve().parent
d = np.load(HERE.parent / 'cache/brain-nerves-topic.npz') if __name__ == '__main__' else None


def surface(name, n=400000, seed=3):
    v, f = d['v::' + name], d['f::' + name]
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    fn = np.cross(b - a, c - a)
    w = np.linalg.norm(fn, axis=1)
    rng = np.random.default_rng(seed)
    pick = rng.choice(len(f), n, p=w / w.sum())
    u, t = rng.random(n), rng.random(n)
    flip = u + t > 1
    u[flip], t[flip] = 1 - u[flip], 1 - t[flip]
    p = a[pick] + (b[pick] - a[pick]) * u[:, None] + (c[pick] - a[pick]) * t[:, None]
    return p, fn[pick] / w[pick, None]


def penetration(v, bone_v, bone_f, n=300000):
    """Vertices 1–8 mm inside the bone (deeper hits are nearest-point artefacts across thin bone)."""
    a, b, c = bone_v[bone_f[:, 0]], bone_v[bone_f[:, 1]], bone_v[bone_f[:, 2]]
    fn = np.cross(b - a, c - a)
    w = np.linalg.norm(fn, axis=1)
    rng = np.random.default_rng(3)
    pick = rng.choice(len(bone_f), n, p=w / w.sum())
    u, t = rng.random(n), rng.random(n)
    flip = u + t > 1
    u[flip], t[flip] = 1 - u[flip], 1 - t[flip]
    sp = a[pick] + (b[pick] - a[pick]) * u[:, None] + (c[pick] - a[pick]) * t[:, None]
    sn = fn[pick] / w[pick, None]
    dist, idx = cKDTree(sp).query(v)
    side = np.einsum('ij,ij->i', v - sp[idx], sn[idx])
    s = np.where(side >= 0, dist, -dist)
    return int(((s < -.001) & (s > -.008)).sum())


def measure(brain, bone):
    sp, sn = surface(bone)
    tree = cKDTree(sp)
    out = {}
    for name in brain:
        v = d['v::' + name]
        dist, idx = tree.query(v)
        side = np.einsum('ij,ij->i', v - sp[idx], sn[idx])
        signed = np.where(side >= 0, dist, -dist)
        out[name] = dict(minMm=round(float(signed.min()) * 1000, 2), p5Mm=round(float(np.percentile(signed, 5)) * 1000, 2),
                         medianMm=round(float(np.median(signed)) * 1000, 2),
                         insideBoneOver1Mm=int((signed < -.001).sum()), vertices=int(len(v)))
    return out


if __name__ == '__main__':
    brain = [k[3:] for k in d.files if k.startswith('v::') and any(s in k for s in
             ('lobe', 'insula', 'cerebrum-medial', 'cerebellum', 'midbrain', 'pons', 'medulla'))]
    res = dict(method=__doc__.strip().splitlines()[2], skull=measure(brain, 'skull'))
    (HERE / 'fit.json').write_text(json.dumps(res, indent=1) + '\n')
    for k, v in res['skull'].items():
        print(k.ljust(20), v)
