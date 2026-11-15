"""Per-node provenance of NervousSystem100.fbx (docs/75 §5.2 gate G2, P-BN2). No Blender, no network.

The FBX carries no per-object attribution (no custom properties, one flat collection), so every
node is given a source family from evidence that can be re-run:

1. Name and hierarchy rules (Z-Anatomy `License.txt` lists the third-party models; the cortex
   parcels carry FreeSurfer Destrieux `aparc.a2009s` label strings such as `Lat_Fis-post`).
2. Geometry: after a similarity registration (rotation, translation, one scale) the source
   surface is compared with the original models, downloaded under docs/75 §5.1 into the
   gitignored cache: Brainder `pial_Destrieux_obj` (CC BY-SA 3.0) and BodyParts3D 4.0
   `partof_BP3D_4.0_obj_99` (CC BY 4.0). A family is confirmed only when the surface matches
   (sampled distances below) and a control comparison with a different structure does not.

Families and whether they may go into the CC BY-SA 4.0 GLB:
  bp3d-zanatomy  BodyParts3D-derived / Z-Anatomy (CC BY-SA 2.1 JP historical; CC BY-SA 4.0)  yes
  brainder       Anderson Winkler, brainder.org (CC BY-SA 3.0; adapted under 4.0)             yes
  dundee-cn      University of Dundee CAHID, Cranial Nerves and Foramina (CC BY 4.0)          yes
  dundee-ear     University of Dundee, Anatomy of the Inner Ear (CC BY-NC-SA 4.0)             NO
  uw-white       "White matter", University of Washington (licence not found)                 NO
  unknown        no confident attribution                                                     NO

Writes brain-nerves/provenance.json and provenance.md.
"""
import json
import re
import sys
import tarfile
import zipfile
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

HERE = Path(__file__).resolve().parent
CACHE = HERE.parent / 'cache'
ALLOWED = {'bp3d-zanatomy', 'brainder', 'dundee-cn'}
LICENCE = {
    'bp3d-zanatomy': 'CC BY-SA 4.0 (Z-Anatomy; BodyParts3D CC BY-SA 2.1 JP historical attribution)',
    'brainder': 'CC BY-SA 3.0 Unported (Anderson Winkler, brainder.org); adapted work released under CC BY-SA 4.0',
    'dundee-cn': 'CC BY 4.0 (University of Dundee CAHID, Cranial Nerves and Foramina)',
    'dundee-ear': 'CC BY-NC-SA 4.0 (University of Dundee, Anatomy of the Inner Ear): excluded',
    'uw-white': 'licence not found ("White matter", University of Washington): excluded',
    'unknown': 'no confident attribution: excluded',
}

# Thresholds for a geometric match after similarity registration (sampled, metres).
MATCH_MEAN = 0.0008
MATCH_P95 = 0.0025
# Cortex: decimated and slightly warped by Z-Anatomy, so a per-parcel p95 ceiling plus the mirrored control.
CORTEX_P95 = 0.006
CORTEX_TEST = ['G_front_sup', 'G_front_middle', 'G_precentral', 'G_postcentral', 'G_temporal_middle', 'G_pariet_inf-Angular',
               'G_pariet_inf-Supramar', 'S_temporal_sup', 'G_temporal_inf', 'S_central', 'G_precuneus', 'G_oc-temp_med-Lingual']

# FreeSurfer aparc.a2009s (Destrieux) label <-> Z-Anatomy parcel name. The Z-Anatomy names are
# the plain-English Destrieux names; three keep FreeSurfer's own strings (`Lat_Fis-*`,
# `Sulcus interm_prim-Jensen`), which no other atlas in the source uses.
DESTRIEUX = {
    'G_and_S_frontomargin': 'Orbital gyri (Frontomarginal gyrus and sulcus*)',
    'G_and_S_occipital_inf': 'Inferior occipital gyrus and sulcus*',
    'G_and_S_paracentral': 'Paracentral gyrus and sulcus*',
    'G_and_S_subcentral': 'Insula (Subcentral gyrus and ant. and post. sulci*)',
    'G_and_S_transv_frontopol': 'Transverse frontopolar gyrus and sulcus*',
    'G_and_S_cingul-Ant': 'Cingulate gyrus and sulcus (Middle anterior part)',
    'G_and_S_cingul-Mid-Ant': 'Cingulate gyrus and sulcus (Middle anterior part)',
    'G_and_S_cingul-Mid-Post': 'Cingulate gyrus and sulcus (Middle posterior part)',
    'G_cingul-Post-dorsal': 'Cingulate gyrus and sulcus (Posterior dorsal part)',
    'G_cingul-Post-ventral': 'Cingulate gyrus (Posteroventral part*)',
    'G_cuneus': 'Cuneus',
    'G_front_inf-Opercular': 'Opercular part of inferior frontal gyrus',
    'G_front_inf-Orbital': 'Orbital part of  inferior frontal gyrus',
    'G_front_inf-Triangul': 'Triangular part of inferior frontal gyrus',
    'G_front_middle': 'Middle frontal gyrus',
    'G_front_sup': 'Superior frontal gyrus',
    'G_insular_short': 'Insula (Subcentral gyrus and ant. and post. sulci*)',
    'G_occipital_middle': 'Lateral occipital gyrus (Middle occipital gyrus*)',
    'G_occipital_sup': 'Superior occipital gyri',
    'G_oc-temp_lat-fusifor': 'Lateral occipitotemporal gyrus',
    'G_oc-temp_med-Lingual': 'Lingual gyrus',
    'G_oc-temp_med-Parahip': 'Medial occipitotemporal gyrus (Parahippocampal*)',
    'G_orbital': 'Orbital gyri',
    'G_pariet_inf-Angular': 'Angular gyrus',
    'G_pariet_inf-Supramar': 'Supramarginal gyrus',
    'G_parietal_sup': 'Superior parietal lobule',
    'G_postcentral': 'Postcentral gyrus',
    'G_precentral': 'Precentral gyrus',
    'G_precuneus': 'Precuneus',
    'G_rectus': 'Straight gyrus (Gyrus rectus)',
    'G_temp_sup-G_T_transv': 'Transverse temporal gyri',
    'G_temp_sup-Lateral': 'Superior temporal gyrus (Lateral part)',
    'G_temp_sup-Plan_tempo': 'Temporal plane',
    'G_temporal_inf': 'Inferior temporal gyrus',
    'G_temporal_middle': 'Middle temporal gyrus',
    'Lat_Fis-ant-Horizont': 'Lat_Fis-ant-Horizont',
    'Lat_Fis-ant-Vertical': 'Lat_Fis-ant-Vertical',
    'Lat_Fis-post': 'Lat_Fis-post',
    'Pole_occipital': 'Occipital pole',
    'Pole_temporal': 'Temporal pole',
    'S_calcarine': 'Calcarine sulcus',
    'S_central': 'Central sulcus',
    'S_cingul-Marginalis': 'Cingulate sulcus (Marginal part*)',
    'S_circular_insula_ant': 'Circular sulcus of insula',
    'S_circular_insula_inf': 'Circular sulcus of insula',
    'S_circular_insula_sup': 'Circular sulcus of insula',
    'S_collat_transv_ant': 'Collateral sulcus',
    'S_collat_transv_post': ' Posterior transverse collateral sulcus',
    'S_front_inf': 'Inferior frontal sulcus',
    'S_front_middle': 'Middle frontal gyrus',
    'S_front_sup': 'Superior frontal sulcus',
    'S_interm_prim-Jensen': 'Sulcus interm_prim-Jensen',
    'S_intrapariet_and_P_trans': 'Intraparietal sulcus',
    'S_oc_middle_and_Lunatus': 'Lunate sulcus',
    'S_oc_sup_and_transversal': 'Transverse occipital sulcus',
    'S_occipital_ant': 'Anterior occipital sulcus*',
    'S_oc-temp_lat': 'Occipitotemporal sulcus (Lateral part*)',
    'S_oc-temp_med_and_Lingual': 'Collateral sulcus',
    'S_orbital_lateral': 'Orbital sulci (Lateral Orbital sulcus*)',
    'S_orbital_med-olfact': 'Olfactory sulcus',
    'S_orbital-H_Shaped': 'Orbital sulci (H-shaped orbital sulci*)',
    'S_parieto_occipital': 'Parieto-occipital sulcus',
    'S_pericallosal': None,
    'S_postcentral': 'Postcentral sulcus',
    'S_precentral-inf-part': 'Precentral sulcus (inferior part)*',
    'S_precentral-sup-part': 'Precentral sulcus (Superior part)*',
    'S_suborbital': 'Paracentral sulcus',
    'S_subparietal': 'Subparietal sulcus',
    'S_temporal_inf': 'Inferior temporal sulcus',
    'S_temporal_sup': 'Superior temporal sulcus',
    'S_temporal_transverse': 'Transverse temporal gyri',
}

# BodyParts3D 4.0 part-of concepts compared with the merged Z-Anatomy structures.
BP3D = {
    'cerebellum': ('FMA67944', r'^(?:Anterior quadrangular lobule|Biventral lobule|Central lobule|Culmen|Declive|Flocculus|Folium of vermis|'
                               r'Gracile lobule|Inferior semilunar lobule|Lingula of cerebellum|Nodule of vermis|Peduncle of flocculus|'
                               r'Posterior quadrangular lobule|Pyramis of vermis|Superior cerebellar peduncle|Superior semilunar lobule|'
                               r'Tonsil of cerebellum|Tuber of vermis|Uvula of vermis|Wing of central lobule)(?:\.[lr])?$'),
    'pons': ('FMA67943', r'^Pons\.[lr]$'),
    'medulla oblongata': ('FMA62004', r'^Medulla oblongata\.[lr]$'),
    'midbrain': ('FMA61993', r'^Midbrain\.[lr]$'),
    # The outer surface of the cord only (the tracts inside it are not used).
    'spinal cord': ('FMA7647', r'^White matter of spinal cord$'),
}


def load(npz):
    names = sorted(k[3:] for k in npz.files if k.startswith('v::'))
    return names, (lambda n: (npz['v::' + n], npz['f::' + n]))


def sample(points, faces, n=20000, seed=1):
    a, b, c = points[faces[:, 0]], points[faces[:, 1]], points[faces[:, 2]]
    w = np.linalg.norm(np.cross(b - a, c - a), axis=1)
    rng = np.random.default_rng(seed)
    pick = rng.choice(len(faces), n, p=w / w.sum())
    u, v = rng.random(n), rng.random(n)
    flip = u + v > 1
    u[flip], v[flip] = 1 - u[flip], 1 - v[flip]
    return a[pick] + (b[pick] - a[pick]) * u[:, None] + (c[pick] - a[pick]) * v[:, None]


def umeyama(src, dst):
    """Similarity transform (s, R, t) minimising |s R src + t - dst|."""
    ms, md = src.mean(0), dst.mean(0)
    xs, xd = src - ms, dst - md
    cov = xd.T @ xs / len(src)
    U, S, Vt = np.linalg.svd(cov)
    d = np.sign(np.linalg.det(U @ Vt))
    D = np.diag([1, 1, d])
    R = U @ D @ Vt
    s = np.trace(np.diag(S) @ D) / (xs ** 2).sum(1).mean()
    return s, R, md - s * R @ ms


def register(ref, target, init_axes, iterations=60):
    """ICP with one scale: move `ref` (reference-model samples) onto `target` (source samples)."""
    src = ref @ init_axes.T
    s0 = np.sqrt(((target - target.mean(0)) ** 2).sum(1).mean() / ((src - src.mean(0)) ** 2).sum(1).mean())
    src = (src - src.mean(0)) * s0 + target.mean(0)
    tree = cKDTree(target)
    total = (s0 * init_axes, target.mean(0) - s0 * (ref @ init_axes.T).mean(0))
    for _ in range(iterations):
        _, idx = tree.query(src)
        s, R, t = umeyama(src, target[idx])
        src = s * src @ R.T + t
        M, T = total
        total = (s * R @ M, s * R @ T + t)
    return src, total


def distances(a, b, partial=False):
    """Symmetric sampled distances; `partial`: one-sided, reference (a) to source (b) only."""
    da, _ = cKDTree(b).query(a)
    db, _ = cKDTree(a).query(b)
    d = da if partial else np.concatenate([da, db])
    return dict(meanM=float(d.mean()), p95M=float(np.percentile(d, 95)), maxM=float(d.max()))


AXES = [np.diag(v) for v in ([1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1])]
# BodyParts3D: mm, Z up; the sign of X / Y is searched (AXES) rather than assumed.
# FreeSurfer RAS: +x right, +y anterior, +z superior; the source is +X left, front -Y, Z up.
RAS = np.diag([-1., -1., 1.])


def best_fit(ref, target, axes_list, partial=False):
    best = None
    for A in axes_list:
        moved, total = register(ref, target, A)
        d = distances(moved, target, partial)
        if best is None or d['meanM'] < best[0]['meanM']:
            best = (d, total, moved)
    return best


def read_obj(text):
    v, f = [], []
    for line in text.splitlines():
        if line.startswith('v '):
            v.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('f '):
            idx = [int(x.split('/')[0]) for x in line.split()[1:]]
            for i in range(1, len(idx) - 1):
                f.append([idx[0], idx[i], idx[i + 1]])
    v = np.asarray(v)
    f = np.asarray(f, dtype=np.int64)
    f = np.where(f < 0, f + len(v), f - 1)
    return v, f


def bp3d_meshes(fma):
    rows = [l.split('\t') for l in (CACHE / 'bp3d/partof_element_parts.txt').read_text().splitlines()[1:]]
    files = {r[2].strip() for r in rows if r[0] == fma}
    out = []
    with zipfile.ZipFile(CACHE / 'bp3d/partof_BP3D_4.0_obj_99.zip') as z:
        for name in z.namelist():
            if Path(name).stem in files and name.endswith('.obj'):
                out.append(read_obj(z.read(name).decode('utf-8', 'replace')))
    if not out:
        raise RuntimeError(f'BodyParts3D {fma}: no element meshes in the cached archive')
    return out


def brainder_parcels():
    out = {}
    with tarfile.open(CACHE / 'brainder/pial_Destrieux_obj.tar.bz2') as t:
        for m in t.getmembers():
            name = Path(m.name).name
            hit = re.match(r'^([lr])h\.pial\.Destrieux\.(.+)\.obj$', name)
            if m.isfile() and hit:
                out[(hit[1], hit[2])] = read_obj(t.extractfile(m).read().decode('utf-8', 'replace'))
    if not out:
        raise RuntimeError('Brainder archive: no lh/rh.pial.*.obj parcels')
    return out


def merged(meshes):
    pts, fcs, off = [], [], 0
    for v, f in meshes:
        pts.append(v)
        fcs.append(f + off)
        off += len(v)
    return np.vstack(pts), np.vstack(fcs)


def rules(inv):
    """Family from name / hierarchy evidence; geometry confirms or rejects below."""
    parent = {e['name']: e.get('sourceParent') for e in inv}

    def ancestors(n):
        out = []
        while parent.get(n):
            n = parent[n]
            out.append(n)
        return out
    fam = {}
    cortex_groups = {'Frontal lobe.g', 'Parietal lobe.g', 'Temporal lobe.g', 'Occipital lobe.g', 'Insula.g',
                     'Interlobar sulci.g', 'Limbic lobe.g'}
    for e in inv:
        n, anc = e['name'], ancestors(e['name'])
        if e['type'] != 'MESH' or not e['triangles'] or 'attachment' in e or re.search(r'\.[jt]$', n):
            continue
        base = re.sub(r'\.[lr]$', '', n)
        why = []
        if base in ('Cochlea', 'Vestibule', 'Tympanic membrane', 'Auditory tube') or n == 'Cochlear nerve':
            f, why = 'dundee-ear', ['inner / middle ear set present on the right only (Dundee inner ear model, CC BY-NC-SA)']
        elif 'Sense organs.g' in anc:
            f, why = 'unknown', ['eye and lacrimal structures: not attributed (right side only; docs/75 does not use them)']
        elif any(a in ('White matter of telencephalon.l', 'White matter of telencephalon.r', 'White matter of diencephalon.g',
                       'White matter of spinal cord.g', 'Walls of lateral ventricle.g') for a in anc) \
                or base.startswith('White matter of telencephalon') or n == 'Septum pellucidum' \
                or (e.get('materials') and 'White matter' in e['materials']):
            f, why = 'uw-white', ['white-matter fibres and tracts (licence of the University of Washington "White matter" model not found)']
        elif any(a in cortex_groups for a in anc) and base not in ('Hippocampus',):
            f, why = 'brainder', ['Destrieux (FreeSurfer aparc.a2009s) parcel name; confirmed by geometry below']
        elif 'Cranial nerves.g' in anc:
            f, why = 'dundee-cn', ['cranial nerve (Dundee CAHID Cranial Nerves and Foramina, CC BY 4.0, adapted by Z-Anatomy); both licences are compatible']
        else:
            f, why = 'bp3d-zanatomy', ['default family of the file (Z-Anatomy License.txt): BodyParts3D-derived / Z-Anatomy']
        fam[n] = dict(family=f, evidence=why, triangles=e['triangles'], ancestors=anc[:4])
    return fam


def main():
    inv = [e for e in json.loads((CACHE / 'inventory.json').read_text())['objects'] if e['system'] == 'nervous']
    npz = np.load(CACHE / 'brain-nerves-sources.npz')
    names, geo = load(npz)
    fam = rules(inv)
    checks = []

    # 1. Cortex parcels vs Brainder pial Destrieux. Every source parcel has a mirror twin (same triangle
    #    count .l / .r), so the right hemisphere is the left one mirrored; the test is on the left one.
    #    Whole-surface distances do not discriminate (two folded surfaces are always close), so each large
    #    parcel is registered on its own against (a) the same Brainder lh parcel and (b) the same label of
    #    Brainder rh, mirrored, as a control (same person, same atlas, different folding).
    parcels = brainder_parcels()
    cortex = sorted(n for n, r in fam.items() if r['family'] == 'brainder')
    mirror = np.diag([-1., 1., 1.])
    wins = []
    for lab in CORTEX_TEST:
        zn = DESTRIEUX[lab] + '.l'
        t = sample(*geo(zn), 6000)
        same, _, _ = best_fit(sample(*parcels[('l', lab)], 6000), t, [RAS])
        ctrl, _, _ = best_fit(sample(*parcels[('r', lab)], 6000) @ mirror.T, t, [RAS])
        ok = same['meanM'] < ctrl['meanM'] and same['p95M'] < CORTEX_P95 and same['p95M'] < ctrl['p95M']
        wins.append(ok)
        checks.append(dict(check=f'cortex parcel {zn} vs Brainder lh {lab}', meanM=same['meanM'], p95M=same['p95M'],
                           control=f'vs Brainder rh {lab} mirrored: mean {ctrl["meanM"] * 1000:.2f} mm, p95 {ctrl["p95M"] * 1000:.2f} mm',
                           matched=ok))
    twins = all(geo(n)[1].shape == geo(n[:-1] + 'r')[1].shape for n in cortex if n.endswith('.l') and n[:-1] + 'r' in fam)
    cortex_ok = sum(wins) >= len(wins) - 1 and twins
    checks.append(dict(check='cortex: parcels closer to their own Brainder lh parcel than to the mirrored rh control',
                       agree=int(sum(wins)), of=len(wins), mirrorTwins=twins, matched=cortex_ok))
    for n in cortex:
        fam[n]['evidence'].append('left parcels match Brainder lh pial Destrieux parcels (per-parcel test, provenance.md); '
                                  'the right hemisphere is their mirror' if cortex_ok else 'geometry does not confirm Brainder')
        if not cortex_ok:
            fam[n]['family'] = 'unknown'

    # 1b. Cerebellum vs Brainder subcortical (FreeSurfer aseg, `subcortical_obj`; approved 2026-11-15).
    #     Placed with the left-cortex transform (same Brainder subject, no refit), and refitted with the
    #     mirrored right cerebellum as the control, as for the cortex.
    sub = {}
    with tarfile.open(CACHE / 'brainder/subcortical_obj.tar.bz2') as t:
        for m in t.getmembers():
            if m.isfile() and m.name.endswith('.obj'):
                sub[Path(m.name).stem] = read_obj(t.extractfile(m).read().decode('utf-8', 'replace'))
    lv, lf = merged([geo(n) for n in cortex if n.endswith('.l')])
    _, (M, T), _ = best_fit(sample(*merged([parcels[k] for k in parcels if k[0] == 'l']), 30000), sample(lv, lf, 30000), [RAS])
    cer = [n for n in names if re.match(BP3D['cerebellum'][1], n)]
    cs = sample(*merged([geo(n) for n in cer]), 30000)
    left = cs[cs[:, 0] > 0]
    placed = distances(sample(*sub['Left-Cerebellum-Cortex'], 20000) @ M.T + T, left)
    same, _, _ = best_fit(sample(*sub['Left-Cerebellum-Cortex'], 20000), left, [RAS])
    ctrl, _, _ = best_fit(sample(*sub['Right-Cerebellum-Cortex'], 20000) * np.array([-1., 1., 1.]), left, [RAS])
    ok = placed['meanM'] < MATCH_MEAN and same['p95M'] < CORTEX_P95 and same['meanM'] < .7 * ctrl['meanM']
    checks.append(dict(check='cerebellum (left half) vs Brainder Left-Cerebellum-Cortex', matched=ok,
                       placedMeanM=placed['meanM'], placedP95M=placed['p95M'], refitMeanM=same['meanM'], refitP95M=same['p95M'],
                       control=f'vs Brainder Right-Cerebellum-Cortex mirrored: mean {ctrl["meanM"] * 1000:.2f} mm, p95 {ctrl["p95M"] * 1000:.2f} mm'))
    for n in cer:
        if n in fam:
            fam[n]['evidence'].append(f'Brainder Left-Cerebellum-Cortex: placed mean {placed["meanM"] * 1000:.2f} mm; refit mean {same["meanM"] * 1000:.2f} mm '
                                      f'vs mirrored control {ctrl["meanM"] * 1000:.2f} mm: {"matches" if ok else "does not match"}')

    # 2. BodyParts3D 4.0: one similarity transform from the pons and medulla (same BodyParts3D body),
    #    then every other structure is compared under that transform without refitting.
    ref = merged([merged(bp3d_meshes(BP3D[k][0])) for k in ('pons', 'medulla oblongata')])
    src = merged([geo(n) for n in names if re.match(BP3D['pons'][1], n) or re.match(BP3D['medulla oblongata'][1], n)])
    d, (M, T), _ = best_fit(sample(ref[0] * .001, ref[1], 20000), sample(*src, 20000), AXES)
    checks.append(dict(check='BodyParts3D frame: pons + medulla oblongata (similarity fit)', scale=float(np.cbrt(np.linalg.det(M))), **d))
    for label, (fma, pattern, *_) in BP3D.items():
        zs = [n for n in names if re.match(pattern, n)]
        if not zs:
            raise RuntimeError(f'No source nodes for {label}')
        bv, bf = merged(bp3d_meshes(fma))
        a = sample(bv * .001, bf, 20000) @ M.T + T
        b = sample(*merged([geo(n) for n in zs]), 20000)
        if label == 'spinal cord':
            # BodyParts3D 4.0 has only a short upper segment of the cord: compare it one-sided.
            da, _ = cKDTree(b).query(a)
            res = dict(meanM=float(da.mean()), p95M=float(np.percentile(da, 95)), oneSided=True)
        else:
            res = distances(a, b)
        ok = res['meanM'] < MATCH_MEAN and res['p95M'] < MATCH_P95
        checks.append(dict(check=f'{label}: {len(zs)} source nodes vs BodyParts3D {fma} (no refit)', matched=ok, **res))
        for n in zs:
            if n not in fam:
                continue
            fam[n]['evidence'].append(f'BodyParts3D {fma} {label}: mean {res["meanM"] * 1000:.2f} mm, p95 {res["p95M"] * 1000:.2f} mm')
            if ok and fam[n]['family'] == 'bp3d-zanatomy':
                fam[n]['evidence'].append('confirmed BodyParts3D-derived')
            elif not ok:
                fam[n]['family'] = 'unknown'
                fam[n]['evidence'].append('geometry does not confirm BodyParts3D; no other attributable source')

    for n, r in fam.items():
        r['allowed'] = r['family'] in ALLOWED
        r['licence'] = LICENCE[r['family']]
    out = dict(source='NervousSystem100.fbx', sha256='3ea1aad64956cad27348a27b8fb50494b7cc307c6bc77bee0810ec2a67dff2b1',
               thresholds=dict(meanM=MATCH_MEAN, p95M=MATCH_P95), checks=checks, nodes=dict(sorted(fam.items())))
    (HERE / 'provenance.json').write_text(json.dumps(out, indent=1) + '\n')
    counts = {}
    for r in fam.values():
        counts[r['family']] = counts.get(r['family'], 0) + 1
    lines = ['# brain-nerves · per-node provenance (gate G2)', '',
             'Generated by `provenance.py` from `cache/NervousSystem100.fbx` (sha256 `3ea1aad6…f2b1`). Human review: see the end.', '',
             '## Geometry checks', '', '| check | result |', '|---|---|']
    for c in checks:
        lines.append(f"| {c['check']} | " + ', '.join(f'{k} {v:.5f}' if isinstance(v, float) else f'{k} {v}' for k, v in c.items() if k != 'check') + ' |')
    lines += ['', '## Families', '', '| family | nodes | may ship |', '|---|---:|---|']
    for k, v in sorted(counts.items()):
        lines.append(f'| {k} | {v} | {"yes" if k in ALLOWED else "no"} |')
    lines += ['', '## Nodes', '', '| node | family | triangles | evidence |', '|---|---|---:|---|']
    for n, r in sorted(fam.items()):
        lines.append(f"| {n} | {r['family']} | {r['triangles']:,} | {'; '.join(r['evidence'])} |")
    (HERE / 'provenance.md').write_text('\n'.join(lines) + '\n')
    for c in checks:
        print(json.dumps(c))
    print(counts)


if __name__ == '__main__':
    sys.exit(main())
