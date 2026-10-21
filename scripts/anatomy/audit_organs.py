"""Static audit of a multi-segment organ region (heart-lungs): the decoded published GLB
against its native source surfaces, and the hand-off files the content builds on.

Checks: node allowlist and names, budgets, copyright field, left/right sides, sampled
surface deviation and topology per node, `_U` range and agreement with each source
segment's centreline, centreline containment in the source tubes, bounding boxes, the
merged heart's open boundaries, the routes summary and the digestive model's SHA-256.
Writes cache/<topic>-static-audit.json and <topic>/report.md.
"""
import hashlib
import json
import struct
import bpy
import numpy as np
from mathutils import Vector
from common import CACHE, ROOT, save_json, topology, surface_deviation
from centrelines import graph_geometry, project, resample
from audit_static import containment

# docs/25 §9.1: the published digestive model; P1 must leave it byte for byte.
DIGESTIVE_SHA256 = '24ecf044c1c48ad4cfefbc6222d0f8c192469c18b873270372c80deb22263c95'


def glb_json(path):
    data = path.read_bytes()
    magic, _, _ = struct.unpack_from('<4sII', data, 0)
    if magic != b'glTF':
        raise RuntimeError(f'Not a GLB: {path}')
    length, kind = struct.unpack_from('<I4s', data, 12)
    if kind != b'JSON':
        raise RuntimeError('First GLB chunk is not JSON')
    return json.loads(data[20:20 + length])


def boundary_loops(points, faces):
    p, _, _, loops, _ = graph_geometry(points, faces)
    out = []
    for loop in loops:
        ring = p[loop]
        span = float(np.max(np.linalg.norm(ring[:, None] - ring[None], axis=2))) if len(ring) > 1 else 0.
        out.append(dict(vertices=len(loop), spanM=span, centre=[float(x) for x in ring.mean(0)]))
    return sorted(out, key=lambda l: -l['spanM'])


def segment_u_agreement(cloud, segments, names, before, faces):
    """Decoded `_U` against an independent projection on each vertex's own source segment.

    The simplifier moves kept vertices (by at most the node's error budget), so each
    decoded vertex is given to the source segment whose surface is nearest, when the
    next nearest segment is at least 0.3 mm further (junction rings where two segments
    overlap are left out). Its station is then recomputed on that segment's centreline.
    """
    from mathutils.bvhtree import BVHTree
    ranges = [(n, *segments[n]['sourceVertexRange']) for n in names]
    trees = []
    for _, a, b in ranges:
        own = [f for f in faces if a <= f[0] < b]
        trees.append(BVHTree.FromPolygons(before, own, all_triangles=True) if own else None)
    pts = np.asarray(cloud['points'])
    u = np.asarray(cloud['u'])
    expected = np.full(len(pts), np.nan)
    owner = np.full(len(pts), -1)
    for i, q in enumerate(pts):
        v = Vector((q[0], -q[2], q[1]))
        d = np.asarray([t.find_nearest(v)[3] if t else np.inf for t in trees], dtype=float)
        order = np.argsort(d)
        if len(d) == 1 or d[order[1]] - d[order[0]] > .0003:
            owner[i] = order[0]
    for k, (n, _, _) in enumerate(ranges):
        m = owner == k
        if m.any():
            lo, hi = segments[n]['surfaceURange']
            expected[m] = np.clip((project(pts[m], np.asarray(segments[n]['points'])) - lo) / max(hi - lo, 1e-9), 0, 1)
    matched = owner >= 0
    du = np.abs(u - expected)[matched]
    return dict(vertices=len(pts), matched=int(matched.sum()), outliers=int((du > .02).sum()), maxError=float(du.max()) if len(du) else 0.)


def segment_containment(before_points, before_faces, path):
    """containment() on the source triangles near one segment (fast; the cut edges get audit caps)."""
    p = np.asarray(before_points)
    f = np.asarray(before_faces)
    lo, hi = path.min(0) - .035, path.max(0) + .035  # wider than the aorta and pulmonary trunk
    keep = np.all((p[f] >= lo) & (p[f] <= hi), axis=(1, 2))
    used = np.unique(f[keep])
    remap = -np.ones(len(p), int)
    remap[used] = np.arange(len(used))
    return containment([Vector(v) for v in p[used]], [tuple(remap[x] for x in face) for face in f[keep]], path)


def audit(topic):
    manifest = json.loads((ROOT/topic/'manifest.json').read_text())
    summary = json.loads((CACHE/f'{topic}-optimize-stats.json').read_text())
    lines = json.loads((ROOT/topic/'centrelines.json').read_text())
    marks = json.loads((ROOT/topic/'landmarks.json').read_text())['landmarks']
    routes = json.loads((ROOT/topic/'routes.json').read_text())
    clouds = json.loads((CACHE/f'{topic}-decoded.json').read_text())
    final = ROOT.parents[1]/'public/models'/manifest['output']
    if hashlib.sha256(final.read_bytes()).hexdigest() != summary['sha256']:
        raise RuntimeError('Decoded audit is stale')
    bpy.ops.wm.open_mainfile(filepath=str(CACHE/f'{topic}-review.blend'))
    original = {o.name.removesuffix('-before'): o for o in bpy.data.objects if o.type == 'MESH' and o.name.endswith('-before')}
    flags, warnings, rows = [], [], []
    seg_rows = []
    for cloud in clouds:
        name = cloud['name']
        ob = original[name]
        ob.data.calc_loop_triangles()
        before = [v.co.copy() for v in ob.data.vertices]
        faces = [tuple(t.vertices) for t in ob.data.loop_triangles]
        points = [Vector((v[0], -v[2], v[1])) for v in cloud['points']]
        ff = [tuple(v) for v in cloud['faces']]
        mesh = bpy.data.meshes.new('decoded-audit')
        mesh.from_pydata(points, [], ff)
        mesh.update()
        topo = topology(mesh, True)
        bpy.data.meshes.remove(mesh)
        old = topology(ob.data, True)
        dev = surface_deviation(before, faces, points, ff)
        allowance = manifest['budgets'][cloud['role']]['maxDeviationM']
        pts = np.asarray(cloud['points'])
        row = dict(name=name, role=cloud['role'], beforeTriangles=len(faces), triangles=len(ff), sampledHausdorffM=dev, budgetM=allowance,
                   closedBefore=old['closed'], closedAfter=topo['closed'], boundaryEdges=topo['boundaryEdges'], sourceBoundaryEdges=old['boundaryEdges'],
                   nonmanifoldEdges=topo['nonmanifoldEdges'], bboxMin=pts.min(0).tolist(), bboxMax=pts.max(0).tolist(), sizeM=(pts.max(0) - pts.min(0)).tolist())
        if dev > allowance:
            flags.append(f'{name}: surface {dev:.6f} > {allowance}')
        if old['closed'] and topo['boundaryEdges']:
            flags.append(f'{name}: new boundary on closed source')
        if name.endswith('.l') and pts[:, 0].mean() <= 0 or name.endswith('.r') and pts[:, 0].mean() >= 0:
            flags.append(f'{name}: side mismatch')
        names = lines['nodes'].get(name)
        if cloud['role'] == 'tube':
            u = np.asarray(cloud['u'])
            if not len(u) or not np.all(np.isfinite(u)) or u.min() < 0 or u.max() > 1:
                flags.append(f'{name}: _U missing or outside [0, 1]')
            if names:
                agree = segment_u_agreement(cloud, lines['segments'], names, before, faces)
                row['uAgreement'] = agree
                if agree['outliers'] > .005 * agree['matched'] or agree['matched'] < .8 * agree['vertices']:
                    flags.append(f"{name}: _U matched {agree['matched']} of {agree['vertices']} vertices, {agree['outliers']} off their segment station")
        if names:
            native_before = np.asarray([tuple(v) for v in before])
            for seg in names:
                s = lines['segments'][seg]
                path = resample(np.asarray(s['points']), .004)
                native = np.stack((path[:, 0], -path[:, 2], path[:, 1]), axis=1)
                inside = segment_containment(native_before, faces, native)
                s['containmentAudit'] = {k: v for k, v in inside.items() if k not in ('outside',)}
                seg_rows.append(dict(segment=seg, node=name, method=s['method'], lengthM=s['lengthM'], schematic=s['schematic'],
                                     maxOutsideM=inside['maxOutsideDistanceM'], outside=inside['outsideCount'], tested=inside['testedPoints'],
                                     outsideAtU=[round(o['index'] / max(inside['testedPoints'] - 1, 1), 2) for o in inside['outside']]))
                if not s['schematic'] and inside['maxOutsideDistanceM'] > .0015:
                    warnings.append(f"{seg}: centreline leaves its source tube by {inside['maxOutsideDistanceM'] * 1000:.2f} mm (at station {', '.join(str(x) for x in seg_rows[-1]['outsideAtU'])})")
        if name == 'heart':
            row['openings'] = boundary_loops(cloud['points'], cloud['faces'])[:8]
            row['openingCount'] = len(boundary_loops(cloud['points'], cloud['faces']))
        rows.append(row)
        print('ORGAN AUDIT', name, json.dumps({k: v for k, v in row.items() if k not in ('openings',)}), flush=True)
    found = [c['name'] for c in clouds]
    if set(found) != set(manifest['expectedNodes']) or len(found) != len(set(found)):
        flags.append('Node allowlist mismatch')
    for key, limit in [('bytes', 4000000), ('triangles', 350000)]:
        if summary[key] > limit:
            flags.append(f'Soft budget exceeded: {key}')
    copyright = glb_json(final)['asset'].get('copyright', '')
    for needle in ('Z-Anatomy', 'CC BY-SA 4.0', manifest['changes'], manifest['output']):
        if needle not in copyright:
            flags.append(f'asset.copyright lacks: {needle}')
    s = routes['summary']
    traced_bad = sum(v['tracedNotEnclosed'] for v in s.values())
    schematic_bad = sum(v['schematicNotEnclosed'] for v in s.values())
    if traced_bad:
        flags.append(f'routes: {traced_bad} traced points outside their tubes')
    if schematic_bad:
        flags.append(f'routes: {schematic_bad} schematic points outside their organs')
    if routes['joins']['over']:
        flags.append(f"routes: {len(routes['joins']['over'])} blood-loop joins over {routes['joinToleranceM'] * 1000:.0f} mm")
    digestive = ROOT.parents[1]/'public/models/digestive-system.glb'
    digestive_sha = hashlib.sha256(digestive.read_bytes()).hexdigest()
    if digestive_sha != DIGESTIVE_SHA256:
        flags.append('digestive-system.glb changed')
    result = dict(sha256=summary['sha256'], bytes=summary['bytes'], triangles=summary['triangles'], nodes=found, flags=flags, warnings=warnings,
                  meshes=rows, segments=seg_rows, copyright=copyright, digestiveSha256=digestive_sha, skipped=['rig', 'weights', 'fibres', 'attachments'])
    save_json(CACHE/f'{topic}-static-audit.json', result)
    save_json(ROOT/topic/'centrelines.json', lines)
    write_report(topic, manifest, summary, result, lines, marks, routes)
    return result


def write_report(topic, manifest, summary, result, lines, marks, routes):
    mm = lambda v: f'{v * 1000:.1f}'
    rows = {r['name']: r for r in result['meshes']}
    heart = rows['heart']
    out = [f'# Heart and lungs region — mesh pipeline report', '',
           f"Published: `public/models/{manifest['output']}`. **{summary['bytes']:,} bytes / {summary['triangles']:,} triangles / {summary['nodeCount']} nodes / {summary['drawCalls']} draws.**", '',
           f"SHA-256: `{summary['sha256']}`", '',
           'Static native Blender meshes from the cached Z-Anatomy FBX files (no downloads), same source body, centre and transform as the digestive topic (`organs.json`: umbilicus at the origin, +Y up, +Z front, +X the body\'s left, metres). No armature, weights, fibres or attachment sites. meshopt + quantised; `asset.copyright` carries the attribution (below).', '',
           '## Audit', '',
           '**' + ('PASS' if not result['flags'] else 'FAIL') + '** — ' + ('; '.join(result['flags']) if result['flags'] else 'node allowlist, budgets (≤ 4 MB, ≤ 350 k triangles), copyright field, sides, sampled surface deviation, topology, `_U` range and agreement with the segment centrelines, routes containment and blood-loop joins, digestive model unchanged.'), '']
    if result['warnings']:
        out += ['Review notes: ' + '; '.join(result['warnings']), '']
    out += [f"`digestive-system.glb` SHA-256 after this pipeline: `{result['digestiveSha256']}` ({'unchanged' if result['digestiveSha256'] == DIGESTIVE_SHA256 else 'CHANGED'}; docs/25 §9.1 records `{DIGESTIVE_SHA256}`). `optimize_static.ts` writes each static model's attribution from its manifest's `changes` (and optional `attribution` lines); the digestive manifest carries the sentence its published model already had.", '',
            '## Nodes', '',
            '| Node | Role | Source tris | Published tris | Sample error mm | Limit mm | Closed src/pub | Open edges | Size x × y × z (cm) |', '|---|---|---:|---:|---:|---:|---|---:|---|']
    for r in result['meshes']:
        size = ' × '.join(f'{v * 100:.1f}' for v in r['sizeM'])
        out.append(f"| {r['name']} | {r['role']} | {r['beforeTriangles']:,} | {r['triangles']:,} | {r['sampledHausdorffM'] * 1000:.3f} | {r['budgetM'] * 1000:.1f} | {r['closedBefore']}/{r['closedAfter']} | {r['boundaryEdges']} | {size} |")
    out += ['', 'Bounding boxes (metres, topic frame) are in `cache/heart-lungs-static-audit.json` (`bboxMin` / `bboxMax`).', '',
            '## Heart shell', '',
            f"The heart node merges the four Z-Anatomy chamber surfaces (Left / Right atrium, Left / Right ventricle); the source has no whole-heart mesh (`Heart.g` is an empty group). Source: {heart['sourceBoundaryEdges']} open boundary edges; published: {heart['boundaryEdges']} open edges in {heart['openingCount']} openings. Largest openings (span, mm):", '',
            '| Span mm | Ring vertices | Centre (m) |', '|---:|---:|---|']
    for o in heart['openings']:
        out.append(f"| {mm(o['spanM'])} | {o['vertices']} | {', '.join(f'{c:.3f}' for c in o['centre'])} |")
    out += ['', 'Whether these read as holes at the cover distance is judged on the renders in [preview-review.md](preview-review.md).', '',
            '## Segment centrelines', '',
            'One centreline per source segment, extracted **before merging** (`static_region.segment_centrelines`), 3 mm spacing, running in the flow direction (airways from the larynx, arteries from the heart, veins to the heart). Tube nodes carry `_U` = station along each vertex\'s own segment (0 upstream), normalised per segment. Containment: the centreline against its source tube (audit-only caps on open rings, 1.5 mm tolerance).', '',
            '| Segment | Node | Method | Length cm | Max outside mm |', '|---|---|---|---:|---:|']
    for r in result['segments']:
        out.append(f"| {r['segment']} | {r['node']} | {r['method']} | {r['lengthM'] * 100:.1f} | {r['maxOutsideM'] * 1000:.2f} |")
    for r in result['meshes']:
        if 'uAgreement' in r:
            a = r['uAgreement']
            out.append('')
            out.append(f"`_U` {r['name']}: {a['matched']:,} of {a['vertices']:,} published vertices matched to one source segment; {a['outliers']} differ from an independent projection on that segment by more than 0.02 (max {a['maxError']:.4f}).")
    out += ['', '## Landmarks', '', 'Measured on the source objects before merging (`landmarks.json`); definitions in the manifest.', '', '| Landmark | Kind | Point (m) |', '|---|---|---|']
    for k, v in marks.items():
        out.append(f"| {k} | {v['kind']} | {', '.join(f'{c:.3f}' for c in v['point'])} |")
    moved = [m['shiftM'] for f in routes['flows'].values() for p in f['paths'] for m in p['recentred']]
    out += ['', '## Routes (`routes.json`, from `heart-lungs/routes.py`)', '',
            'Every flow of docs/40 §3.6 that runs in the body. Points every 8 mm. *Traced* legs follow source centrelines; *schematic* legs (inside the heart, lungs and liver, the nose and throat, the exchange arcs, bridges over source gaps) are flagged per path in `routes.json` (`schematic`). Containment: six rays perpendicular to the path from every point; traced points need five of six on their tube, schematic points four of six on their organ (they pass real openings). '
            + (f"{len(moved)} traced points at tight bends of 3–4 mm vessels were moved up to {max(moved) * 1000:.1f} mm to the centre of the published tube's section (`recentred` in each path)." if moved else 'No traced point needed re-centring.'), '',
            '| Flow | Paths | Length m | Traced pts outside / tested | Schematic pts outside / tested | Bridges |', '|---|---:|---:|---|---|---:|']
    for fid, v in routes['summary'].items():
        out.append(f"| {fid} | {v['paths']} | {v['lengthM']:.3f} | {v['tracedNotEnclosed']} / {v['tracedPoints']} | {v['schematicNotEnclosed']} / {v['schematicPoints']} | {v['bridges']} |")
    out += ['', f"Blood loop joins (each path's end to the nearest start of the next flow): max {routes['joins']['maxGapM'] * 1000:.2f} mm, {len(routes['joins']['over'])} over the {routes['joinToleranceM'] * 1000:.0f} mm tolerance.", '',
            '### Bridges (junction gaps over 5 mm, drawn straight and flagged schematic)', '', '| Flow / path | From | To | Gap mm |', '|---|---|---|---:|']
    seen = set()
    for fid, f in routes['flows'].items():
        for p in f['paths']:
            for b in p['bridges']:
                key = (b.get('fromSegment', ''), b['toSegment'])
                if key in seen:
                    continue
                seen.add(key)
                out.append(f"| {fid}/{p['id']} | {b.get('fromSegment', '(tree parent)')} | {b['toSegment']} | {mm(b['gapM'])} |")
    out += ['', 'Branch-offs from the aorta bridge the aorta\'s own radius (its centreline to the branch mouth). The posterior tibial veins and four segmental bronchi stop 3–6 cm short of the vessel or airway they join in the source; their bridges cross that gap.', '',
            '## Attribution', '', '```', result['copyright'], '```', '',
            '## Reproduce', '', '```sh', 'python3 scripts/anatomy/manifests.py --topic heart-lungs', 'python3 scripts/anatomy/run.py --topic heart-lungs', '```', '',
            'Inputs: `scripts/anatomy/cache/{VisceralSystem100,CardioVascular41,MuscularSystem100,SkeletalSystem100}.fbx`, `Regions of human body100.fbx`, `inventory.json` (local only; hashes in `cache/SHA256SUMS.txt`). Previews: [preview-review.md](preview-review.md).']
    (ROOT/topic/'report.md').write_text('\n'.join(out) + '\n')
