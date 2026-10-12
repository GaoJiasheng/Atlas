"""Select, simplify, bake, rig and export the cached regional sources."""
import heapq
import json
import math
import subprocess
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import (CACHE, ROOT, mobile_skin_region, base_name, centroid, clear_scene, import_system,
                    matches, object_info, save_json, surface_deviation, topology, world_vertices, topic_argument)

TOPIC_NAME = topic_argument()
TOPIC = ROOT / TOPIC_NAME
MANIFEST = json.loads((TOPIC / 'manifest.json').read_text())
if TOPIC_NAME != 'chest':
    # Attachment ownership is independent of the region's display bone set.
    # Close the rig/allowlist before source selection and never silently bind
    # an unexported limb attachment to the trunk.
    import hashlib
    from rig_rules import complete_manifest
    declared_joints = set(MANIFEST['jointNames'])
    complete_manifest(MANIFEST)
    if not declared_joints <= set(MANIFEST['jointNames']):
        raise RuntimeError('Manifest completion dropped declared rig joints')
    encoded = json.dumps(MANIFEST, indent=2)+'\n'
    (TOPIC/'manifest.json').write_text(encoded)
    (TOPIC/'MANIFEST-READY').write_text('sha256 '+hashlib.sha256(encoded.encode()).hexdigest()+'\n')
SOURCE = {}
SELECTED = {}
ATTACHMENTS = []
WARNINGS = []


def target(v):
    return Vector((v.x, v.z, -v.y))


def source_record(ob, system):
    ob.data.calc_loop_triangles()
    faces = [tuple(t.vertices) for t in ob.data.loop_triangles]
    if ob.matrix_world.to_3x3().determinant() < 0:
        faces = [tuple(reversed(face)) for face in faces]
    return {'info': object_info(ob, system), 'points': world_vertices(ob), 'faces': faces}


def make_mesh(name, points, faces):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    return ob


def bvh(points, faces):
    return BVHTree.FromPolygons(points, faces, all_triangles=True)


def kd(points):
    tree = KDTree(len(points))
    for i, p in enumerate(points):
        tree.insert(p, i)
    tree.balance()
    return tree


def merge_records(records):
    points, faces = [], []
    for record in records:
        offset = len(points)
        points.extend(record['points'])
        faces.extend(tuple(i + offset for i in f) for f in record['faces'])
    return points, faces


def load_sources():
    for system in ['skeleton', 'muscles', 'regions']:
        clear_scene()
        objects = import_system(system)
        for ob in objects:
            if ob.type != 'MESH':
                continue
            info = object_info(ob, system)
            needed = any(matches(p, info) for p in MANIFEST['parts'] + MANIFEST.get('referenceParts', []))
            # Pelvis is needed for neighbour attachments, but is not exported.
            needed |= system == 'skeleton' and base_name(ob.name) in ['Hip bone', 'Sacrum']
            needed |= system == 'skeleton' and 'attachment' in info and bool(ob.data.polygons)
            if needed:
                SOURCE[(system, ob.name)] = source_record(ob, system)
        print(f'SOURCE {system}: {sum(k[0] == system for k in SOURCE)} retained', flush=True)
    clear_scene()


def select_and_transform():
    if TOPIC_NAME != 'chest':
        from regional import select_and_transform as regional_select
        return regional_select(sys.modules[__name__])
    sternum = [r for r in SOURCE.values() if r['info']['system'] == 'skeleton' and
               base_name(r['info']['name']) == 'Manubrium of sternum']
    if not sternum:
        raise RuntimeError('Manubrium missing: cannot establish chest frame')
    p, _ = merge_records(sternum)
    # Infer the sternal angle at the inferior manubrium; keep the midline and depth.
    centre = centroid(p)
    centre.z = min(v.z for v in p)
    source_floor = min(v.z for r in SOURCE.values() if r['info']['system'] == 'regions' for v in r['points'])
    for record in SOURCE.values():
        for v in record['points']:
            v -= centre
        if record['info']['sideSource'] == 'centroid-x':
            x = centroid(record['points']).x
            record['info']['side'] = 'l' if x > .005 else 'r' if x < -.005 else None
    for part in MANIFEST['parts']:
        for side in ['l', 'r'] if part['sides'] == 'bilateral' else [None]:
            records = [r for r in SOURCE.values() if matches(part, r['info'], side)]
            if len(records) < part.get('minimumObjects', 1):
                raise RuntimeError(f"Missing source coverage: {part['id']}.{side}: {len(records)}")
            points, faces = merge_records(records)
            name = part['id'] + ('.' + side if side else '')
            SELECTED[name] = {'part': part, 'side': side, 'points': points, 'faces': faces,
                              'sourceNames': [r['info']['name'] for r in records]}
            if part['role'] == 'skin':
                SELECTED[name]['sourceSkinSides'] = [r['info']['side'] if mobile_skin_region(r['info']['name'], TOPIC_NAME) else None
                    for r in records for _ in r['points']]
    clavicle = centroid(SELECTED['clavicle.l']['points'])
    sternum_c = centroid(SELECTED['sternum']['points'])
    spine = centroid(SELECTED['thoracic-spine']['points'])
    left_ok = target(clavicle).x > target(sternum_c).x + .02
    front_ok = target(sternum_c).z > target(spine).z
    stature = max(v.z for r in SOURCE.values() if r['info']['system'] == 'regions' for v in r['points']) - (source_floor - centre.z)
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0
    check = {'unit':'m', 'up':'+Y', 'front':'+Z', 'left':'+X',
             'sourceChestCentre':list(centre), 'floorY':source_floor-centre.z,
             'floorPlusChestCentreY':source_floor, 'sternum': list(target(sternum_c)), 'leftClavicle': list(target(clavicle)),
             'thoracicSpine': list(target(spine)), 'leftPositiveX': left_ok,
             'sternumAnteriorPositiveZ': front_ok, 'statureM': stature}
    print('COORDINATE CHECK ' + json.dumps(check), flush=True)
    if not left_ok or not front_ok or not 1.4 < stature < 2.2:
        raise RuntimeError('Source orientation/scale check failed; do not mirror or rescale silently')
    return centre, source_floor, check


def simplify_selection():
    jobs = []
    for name, record in SELECTED.items():
        part = record['part']
        jobs.append({'name': name, 'positions': [c for p in record['points'] for c in p],
                     'indices': [i for f in record['faces'] for i in f],
                     'target': part['triangleBudget'],
                     'error': MANIFEST['budgets'][part['role']]['maxDeviationM']})
    results = {}
    pending = jobs
    attempts = 10 if TOPIC_NAME == 'chest' else 20
    for attempt in range(attempts):
        save_json(CACHE / f'{TOPIC_NAME}-simplify-input.json', pending)
        subprocess.run(['pnpm', 'exec', 'node', '--import', 'tsx', str(ROOT / 'simplify.ts'),
                        str(CACHE / f'{TOPIC_NAME}-simplify-input.json'), str(CACHE / f'{TOPIC_NAME}-simplify-output.json')],
                       cwd=str(ROOT.parents[1]), check=True)
        outputs = json.loads((CACHE / f'{TOPIC_NAME}-simplify-output.json').read_text())
        retry = []
        for job, result in zip(pending, outputs):
            record = SELECTED[job['name']]
            indices = result['indices']
            faces = [tuple(indices[i:i+3]) for i in range(0, len(indices), 3)]
            simplified_points = [Vector(result['positions'][i:i+3]) for i in range(0,len(result['positions']),3)]
            deviation = surface_deviation(record['points'], record['faces'], simplified_points, faces)
            budget = MANIFEST['budgets'][record['part']['role']]['maxDeviationM']
            result['sampleDeviationM'] = deviation
            safety = .93 if record['part'].get('triangleCap') or record['part'].get('exportTriangleCap') or record['part'].get('protectFolds') else .85
            safety = record['part'].get('auditSafety', safety)
            if deviation > budget*safety:
                if attempt < attempts-1:
                    next_job = dict(job)
                    if record['part'].get('triangleCap') or record['part'].get('exportTriangleCap') or record['part'].get('protectFolds'):
                        # Protect the few thin folds responsible for actual surface
                        # error, instead of freezing an entire context mesh.
                        tree = bvh(simplified_points, faces)
                        locks = set(job.get('locks', []))
                        used = {i for face in record['faces'] for i in face}
                        locks.update(i for i in used if tree.find_nearest(record['points'][i])[3] > budget*.65)
                        source_tree = bvh(record['points'], record['faces'])
                        for face in faces:
                            sample = centroid([simplified_points[i] for i in face])
                            nearest = source_tree.find_nearest(sample)
                            if nearest[3] > budget*.65:
                                locks.update(face)
                                locks.update(record['faces'][nearest[2]])
                        next_job['locks'] = sorted(locks)
                        if TOPIC_NAME != 'chest' and attempt >= 2:
                            # Locking fixes thin folds; a smaller global tolerance resolves
                            # residual error when those locks stop changing the result.
                            next_job['error'] *= min(.8, budget*.8/deviation)
                        print(f'PROTECT {job["name"]}: {len(locks)} thin-fold vertices', flush=True)
                    else:
                        next_job['error'] *= min(.6, budget*.75/deviation)
                    retry.append(next_job)
                    print(f"RETRY {job['name']}: sampled {deviation*1000:.3f} mm", flush=True)
                else:
                    result['indices'] = [i for face in record['faces'] for i in face]
                    result['positions'] = job['positions']
                    result['error'] = 0.
                    result['sampleDeviationM'] = 0.
                    results[job['name']] = result
            else:
                results[job['name']] = result
        if not retry:
            break
        pending = retry
    save_json(CACHE / f'{TOPIC_NAME}-simplify-output.json', list(results.values()))
    for name, record in SELECTED.items():
        result = results[name]
        original = make_mesh(name + '-before', record['points'], record['faces'])
        original.hide_render = True
        record['original'] = original
        indices = result['indices']
        used = sorted(set(indices))
        remap = {old: new for new, old in enumerate(used)}
        result_points = [Vector(result['positions'][i:i+3]) for i in range(0,len(result['positions']),3)]
        points = [result_points[i] for i in used]
        faces = [tuple(remap[i] for i in indices[start:start + 3]) for start in range(0, len(indices), 3)]
        record['ob'] = make_mesh(name, points, faces)
        if 'sourceSkinSides' in record:
            record['skinSides'] = [record['sourceSkinSides'][i] for i in used]
        record['simplifierErrorM'] = result['error']
        record['sampleDeviationM'] = result['sampleDeviationM']
        print(f'SIMPLIFY {name}: {len(record["faces"]):,} → {len(faces):,} ({result["error"] * 1000:.3f} mm)', flush=True)


def bone_records(ids, side):
    if TOPIC_NAME != 'chest':
        from regional import bone_records as regional_records
        return regional_records(sys.modules[__name__], ids, side)
    result = []
    for id in ids:
        if id == 'pelvis':
            result.extend(r for r in SOURCE.values() if base_name(r['info']['name']) in ['Hip bone', 'Sacrum'])
        else:
            key = id + ('.' + side if side and id in ['clavicle', 'scapula', 'humerus', 'forearm', 'external-oblique'] else '')
            if key in SELECTED:
                result.append(SELECTED[key])
    return result


def site_regions(record, kind, points):
    part, side = record['part'], record['side']
    names = part.get('attachmentOwners', part['objects'])
    all_areas = [r for r in SOURCE.values() if r['info'].get('attachment', {}).get('owner') in names and
                 r['info']['attachment']['kind'] in ['origin', 'insertion'] and
                 (side is None or r['info']['side'] == side)]
    trees = [(id, r, bvh(r['points'], r['faces'])) for id in part[kind]
             for r in bone_records([id], side)]
    other_kind = 'insertion' if kind == 'origin' else 'origin'
    other_trees = [bvh(r['points'], r['faces']) for r in bone_records(part[other_kind], side)]
    areas = []
    for area in all_areas:
        c = centroid(area['points'])
        distance = min((tree.find_nearest(c)[3] for _, _, tree in trees), default=math.inf)
        opposite = min((tree.find_nearest(c)[3] for tree in other_trees), default=math.inf)
        raw_kind = area['info']['attachment']['kind']
        # FBX .o/.e letters sometimes describe the opposite anatomical endpoint.
        classified = kind if distance + .002 < opposite else other_kind if opposite + .002 < distance else raw_kind
        if classified == kind:
            areas.append(area)
    candidates, region = [], set()
    point_tree = kd(points)
    for area in areas:
        c = centroid(area['points'])
        near = point_tree.find(c)[2]
        # Shared whole-muscle attachment meshes must touch this muscle component.
        if near > .025:
            continue
        closest = min(((tree.find_nearest(c)[3], id) for id, _, tree in trees), default=(None, part[kind][0]))
        seeds = {point_tree.find(v)[1] for v in area['points']}
        region.update(seeds)
        samples = [centroid(area['points'])]
        if len(area['points']) > 16:
            axis = max(range(3), key=lambda a: max(p[a] for p in area['points']) - min(p[a] for p in area['points']))
            ordered = sorted(area['points'], key=lambda p: p[axis])
            samples = [centroid(ordered[i * len(ordered)//3:(i+1) * len(ordered)//3]) for i in range(3)]
        candidates.append({'muscle': record['ob'].name, 'kind': kind, 'bone': closest[1],
                           'points': [list(target(p)) for p in samples], 'centroid': list(target(c)),
                           'source': '.o/.e mesh', 'sourceNodes': [area['info']['name']],
                           'rawMarkerKind': area['info']['attachment']['kind'],
                           'classification': 'named-surface distance',
                           'boneDistanceM': closest[0], 'muscleDistanceM': near,
                           'review': 'pending' if closest[0] is not None and closest[0] <= .005 else 'REQUIRED: attachment away from named surface'})
    if not region:
        for id, bone, tree in trees:
            indices = [i for i, v in enumerate(points) if tree.find_nearest(v)[3] <= .002]
            if indices:
                region.update(indices)
                c = centroid([points[i] for i in indices])
                candidates.append({'muscle': record['ob'].name, 'kind': kind, 'bone': id,
                                   'points': [list(target(c))], 'centroid': list(target(c)),
                                   'source': 'proximity', 'thresholdM': .002,
                                   'vertexCount': len(indices), 'review': 'pending'})
    if not region:
        # No false claim of 2 mm proximity: this fallback is explicitly flagged.
        if not trees:
            raise RuntimeError(f'No reference surface for {record["ob"].name} {kind}')
        distances = [min(tree.find_nearest(v)[3] for _, _, tree in trees) for v in points]
        cutoff = min(distances) + .001
        region = {i for i, d in enumerate(distances) if d <= cutoff}
        c = centroid([points[i] for i in region])
        id = min(trees, key=lambda item: item[2].find_nearest(c)[3])[0]
        candidates.append({'muscle': record['ob'].name, 'kind': kind, 'bone': id,
                           'points': [list(target(c))], 'centroid': list(target(c)),
                           'source': 'proximity', 'thresholdM': .002, 'withinThreshold': False,
                           'nearestDistanceM': min(distances), 'review': 'REQUIRED: no vertices within 2 mm'})
        WARNINGS.append(f'{record["ob"].name} {kind}: no 2 mm contact; nearest {min(distances)*1000:.2f} mm')
    ATTACHMENTS.extend(candidates)
    return region


def graph_distances(points, adjacency, seeds):
    distances = [math.inf] * len(points)
    queue = []
    for i in seeds:
        distances[i] = 0
        heapq.heappush(queue, (0, i))
    while queue:
        distance, i = heapq.heappop(queue)
        if distance != distances[i]:
            continue
        for j in adjacency[i]:
            d = distance + (points[j] - points[i]).length
            if d < distances[j]:
                distances[j] = d
                heapq.heappush(queue, (d, j))
    return distances


def bake_muscle(record):
    ob = record['ob']
    points = [v.co.copy() for v in ob.data.vertices]
    adjacency = [set() for _ in points]
    for edge in ob.data.edges:
        a, b = edge.vertices
        adjacency[a].add(b)
        adjacency[b].add(a)
    if record['part'].get('fibre'):
        # Coincident source seams are one surface for distance-field purposes.
        welded = {}
        for i,p in enumerate(points):
            key = tuple(round(c,7) for c in p)
            if key in welded:
                j = welded[key]; adjacency[i].add(j); adjacency[j].add(i)
            else:
                welded[key] = i
    origin = site_regions(record, 'origin', points)
    insertion = site_regions(record, 'insertion', points)
    # Reviewed boundary conditions override unreliable marker/proximity seeds.
    # Keep those candidates in attachments.json for their separate human gate.
    fibre = record['part'].get('fibre')
    if fibre:
        def seeds(kind):
            rule = fibre[kind]
            values = [abs(p.x) if rule['axis']=='absX' else p['xyz'.index(rule['axis'])] for p in points]
            extreme = (min if rule['end']=='min' else max)(values)
            return {i for i,v in enumerate(values) if abs(v-extreme)<=fibre.get('bandM',.003)}
        origin, insertion = seeds('origin'), seeds('insertion')
    if record['part'].get('flipU'):
        origin, insertion = insertion, origin
    overlap = origin & insertion
    if overlap:
        origin -= overlap
        if not origin:
            origin = {min(overlap, key=lambda i: points[i].z)}
        insertion -= origin
    if not insertion:
        # Serial rib sheets and ambiguous shared attachments need separate endpoints.
        c = centroid([points[i] for i in origin])
        insertion = {max(range(len(points)), key=lambda i: (points[i]-c).length)}
        WARNINGS.append(f'{ob.name}: overlapping sites; distal geodesic endpoint needs review')
    # Disconnected heads/rib sheets each need both boundary conditions.
    unseen = set(range(len(points)))
    origin_tree, insertion_tree = kd([points[i] for i in origin]), kd([points[i] for i in insertion])
    components = []
    while unseen:
        component, queue = set(), [unseen.pop()]
        while queue:
            i = queue.pop()
            component.add(i)
            for j in adjacency[i]:
                if j in unseen:
                    unseen.remove(j)
                    queue.append(j)
        components.append(component)
        if not component & origin:
            origin.add(min(component, key=lambda i: origin_tree.find(points[i])[2]))
        if not component & insertion:
            available = component - origin
            if available:
                insertion.add(min(available, key=lambda i: insertion_tree.find(points[i])[2]))
    if fibre:
        # Each disconnected slip uses its own reviewed extremes; nearest-point
        # repairs can otherwise place an endpoint in the middle of another slip.
        def component_seeds(kind):
            rule = fibre[kind]
            values = [abs(p.x) if rule['axis']=='absX' else p['xyz'.index(rule['axis'])] for p in points]
            result = set()
            for component in components:
                extreme = (min if rule['end']=='min' else max)(values[i] for i in component)
                span = max(values[i] for i in component)-min(values[i] for i in component)
                band = min(fibre.get('bandM',.003), span*.25)
                result.update(i for i in component if abs(values[i]-extreme)<=band)
            return result
        origin, insertion = component_seeds('origin'), component_seeds('insertion')
        if record['part'].get('flipU'):
            origin, insertion = insertion, origin
        for component in components:
            if component & origin & insertion:
                # Tiny transverse fragments have no extent along the reviewed
                # axis. Pick a separated pair at that same longitudinal station.
                origin -= component; insertion -= component
                a = min(component)
                b = max(component,key=lambda i:(points[i]-points[a]).length)
                origin.add(a); insertion.add(b)
    do = graph_distances(points, adjacency, origin)
    di = graph_distances(points, adjacency, insertion)
    u = [0. if i in origin else 1. if i in insertion else
         do[i]/(do[i]+di[i]) if math.isfinite(do[i]+di[i]) and do[i]+di[i] > 1e-12 else .5
         for i in range(len(points))]
    write_fibre(record, points, adjacency, origin, insertion, u)
    record['components'] = len(components)
    record['componentVertices'] = components
    record['originRegion'] = origin


def write_fibre(record, points, adjacency, origin, insertion, u):
    ob = record['ob']
    gradients = [Vector() for _ in points]
    for face in ob.data.polygons:
        a, b, c = face.vertices
        e1, e2 = points[b] - points[a], points[c] - points[a]
        n = e1.cross(e2)
        if n.length_squared < 1e-20:
            continue
        gradient = ((e2.cross(n)) * (u[b]-u[a]) + (n.cross(e1)) * (u[c]-u[a])) / n.length_squared
        for i in (a, b, c):
            gradients[i] += gradient * n.length
    # Local tangent fit handles vertices on constant-value attachment regions.
    for i, g in enumerate(gradients):
        if g.length < 1e-10:
            for j in adjacency[i]:
                g += (points[j]-points[i]) * (u[j]-u[i])
        if g.length < 1e-10:
            endpoint = min(insertion, key=lambda j: (points[j]-points[i]).length)
            g = points[endpoint] - points[i]
            if g.length < 1e-10:
                endpoint = min(origin, key=lambda j: (points[j]-points[i]).length)
                g = points[i]-points[endpoint]
        gradients[i] = g.normalized() if g.length > 1e-10 else Vector((0, 0, 1))
    attr_u = ob.data.attributes.get('_U') or ob.data.attributes.new('_U', 'FLOAT', 'POINT')
    attr_fibre = ob.data.attributes.get('_FIBRE') or ob.data.attributes.new('_FIBRE', 'FLOAT_VECTOR', 'POINT')
    attr_u.data.foreach_set('value', u)
    # Custom glTF vectors are not swizzled by Blender's exporter.
    attr_fibre.data.foreach_set('vector', [c for g in gradients for c in target(g)])
    uv = ob.data.uv_layers.get('Fibres') or ob.data.uv_layers.new(name='Fibres')
    start, end = centroid([points[i] for i in origin]), centroid([points[i] for i in insertion])
    axis = (end-start).normalized()
    radial_a = axis.cross(Vector((0,0,1)))
    if radial_a.length < .01:
        radial_a = axis.cross(Vector((1,0,0)))
    radial_a.normalize()
    radial_b = axis.cross(radial_a).normalized()
    for loop in ob.data.loops:
        i = loop.vertex_index
        delta = points[i] - (start.lerp(end, u[i]))
        uv.data[loop.index].uv = (u[i], math.atan2(delta.dot(radial_b), delta.dot(radial_a))/(2*math.pi)+.5)
    # Avoid a seam crossing a triangle by unwrapping its corner v coordinates.
    for face in ob.data.polygons:
        loops = [uv.data[i] for i in face.loop_indices]
        if max(l.uv.y for l in loops) - min(l.uv.y for l in loops) > .5:
            for l in loops:
                if l.uv.y < .5:
                    l.uv.y += 1
    record['u'] = u
    record['originCentroid'] = list(target(start))
    record['insertionCentroid'] = list(target(end))


def landmark(owner, side):
    areas = [r for r in SOURCE.values() if r['info'].get('attachment', {}).get('owner') == owner and
             r['info']['attachment']['kind'] == 'landmark' and r['info']['side'] == side]
    if not areas:
        return None
    # Tiny 12-triangle marker cubes take precedence over region-outline objects.
    area = min(areas, key=lambda r: (abs(len(r['faces'])-12), len(r['faces'])))
    return centroid(area['points'])


def sphere_fit(points):
    p = np.array([list(v) for v in points])
    a = np.column_stack((2*p, np.ones(len(p))))
    solution, _, _, _ = np.linalg.lstsq(a, np.sum(p*p, axis=1), rcond=None)
    return Vector(solution[:3])


def make_rig(centre, floor, check):
    if TOPIC_NAME != 'chest':
        from regional import make_rig as regional_rig
        return regional_rig(sys.modules[__name__], centre, floor, check)
    joints = [{'name':'trunk', 'position':Vector((0,0,0)), 'parent':None, 'source':'sternal angle frame'}]
    for side in ['l','r']:
        scapula = landmark('Glenoid process of scapula', side) or landmark('Glenoid fossa', side)
        if scapula is None:
            scapula = centroid(SELECTED['scapula.'+side]['points'])
            scapula_source = 'scapula centroid fallback'
        else:
            scapula_source = 'glenoid .j landmark'
        humerus = SELECTED['humerus.'+side]['points']
        head = landmark('Head of humerus', side)
        if head is not None:
            patch = [p for p in humerus if (p-head).length < .022]
        else:
            ymax = max(p.z for p in humerus)
            patch = [p for p in humerus if p.z > ymax - .025]
        shoulder = sphere_fit(patch) if len(patch) >= 8 else head or scapula
        epicondyles = [landmark(n, side) for n in ['Medial epicondyle of humerus','Lateral epicondyle of humerus']]
        if all(p is not None for p in epicondyles):
            elbow = (epicondyles[0]+epicondyles[1])/2
            elbow_source = 'midpoint of epicondyle .j landmarks'
        else:
            elbow = centroid([p for p in humerus if p.z < min(v.z for v in humerus)+.018])
            elbow_source = 'distal humerus fallback'
        forearm = SELECTED['forearm.'+side]['points']
        wrist = landmark('Ulnar styloid process', side)
        wrist = wrist if wrist is not None else centroid([p for p in forearm if p.z < min(v.z for v in forearm)+.015])
        # Shoulder girdle chain: the clavicle turns at the sternoclavicular joint (its medial end), the
        # scapula at the acromioclavicular joint (the clavicle's lateral end), so protraction and elevation
        # swing the collarbone about the sternum and carry the blade around the ribs.
        clavicle = SELECTED['clavicle.'+side]['points']
        inner = min(abs(p.x) for p in clavicle)
        outer = max(abs(p.x) for p in clavicle)
        sternoclavicular = centroid([p for p in clavicle if abs(p.x) < inner+.012])
        acromioclavicular = centroid([p for p in clavicle if abs(p.x) > outer-.012])
        joints += [{'name':'clavicle.'+side,'position':sternoclavicular,'parent':'trunk','source':'medial end of clavicle (sternoclavicular joint)'},
                   {'name':'scapula.'+side,'position':acromioclavicular,'parent':'clavicle.'+side,'source':'lateral end of clavicle (acromioclavicular joint); glenoid: '+scapula_source},
                   {'name':'shoulder.'+side,'position':shoulder,'parent':'scapula.'+side,'source':'humeral head sphere fit'},
                   {'name':'elbow.'+side,'position':elbow,'parent':'shoulder.'+side,'source':elbow_source},
                   {'name':'wrist.'+side,'position':wrist,'parent':'elbow.'+side,'source':'styloid landmark / distal forearm'}]
    armature = bpy.data.armatures.new('chest-rig')
    rig = bpy.data.objects.new('chest-rig', armature)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for joint in joints:
        bone = armature.edit_bones.new('joint.'+joint['name'])
        bone.head = joint['position']
        bone.tail = bone.head + Vector((0, 0, .035))
        if joint['parent']:
            bone.parent = armature.edit_bones['joint.'+joint['parent']]
        bone.use_connect = False
    bpy.ops.object.mode_set(mode='OBJECT')
    positions = {j['name']: target(j['position']) for j in joints}
    output = []
    for joint in joints:
        name, side = joint['name'], joint['name'].split('.')[-1]
        sign = 1 if side != 'r' else -1
        rotation = (positions.get('elbow.'+side, Vector((0,-1,0))) - positions[name]).normalized() if name.startswith('shoulder.') else Vector((0,1,0))
        flexion = Vector((-1,0,0))
        abduction = Vector((0,0,sign))
        if name.startswith('elbow.'):
            med, lat = epicondyle_axis(side)
            flexion = target(lat-med).normalized() if med is not None and lat is not None else flexion
            if flexion.x > 0:
                flexion.negate()
            rotation = (positions['wrist.'+side]-positions[name]).normalized()
        output.append({'name':name,'node':'joint.'+name,'position':list(positions[name]),'parent':joint['parent'],
                       'axes':{'flexion':list(flexion),'abduction':list(abduction),'rotation':list(rotation)},
                       'source':joint['source'],'review':'pending'})
    save_json(TOPIC/'rig.json', {'license':'CC BY-SA 4.0','units':'m','coordinates':MANIFEST['coordinates'],
                              'sourceChestCentre':list(centre),'floorY':floor-centre.z,
                              'coordinateCheck':check,'joints':output,
                              'motionAliases':{'hand.l':'wrist.l','hand.r':'wrist.r'},
                              'handGripOffsetM':.08})
    for joint in output:
        assert all(abs(Vector(axis).length-1) < 1e-5 for axis in joint['axes'].values())
        name = joint['name']
        mesh_name = ('humerus.'+name[-1] if name.startswith(('shoulder.','elbow.')) else
                     'scapula.'+name[-1] if name.startswith('scapula.') else
                     'clavicle.'+name[-1] if name.startswith('clavicle.') else
                     'forearm.'+name[-1] if name.startswith('wrist.') else 'sternum')
        points = [target(p) for p in SELECTED[mesh_name]['points']]
        lower = [min(p[i] for p in points) for i in range(3)]
        upper = [max(p[i] for p in points) for i in range(3)]
        assert all(lower[i]-.03 <= joint['position'][i] <= upper[i]+.03 for i in range(3)), name
        if name.startswith('shoulder.'):
            assert abs(joint['position'][1]-upper[1]) < .035, 'Shoulder below humeral head'
        if name.startswith('elbow.'):
            assert abs(joint['position'][1]-lower[1]) < .04, 'Elbow above distal humerus'
        print('RIG CHECK '+json.dumps({'joint':name,'position':joint['position'],'mesh':mesh_name,'bounds':[lower,upper]}),flush=True)
    shoulder_l = next(j for j in output if j['name'] == 'shoulder.l')
    assert Vector(shoulder_l['axes']['flexion']).cross(positions['elbow.l']-positions['shoulder.l']).z > 0
    return rig, joints


def epicondyle_axis(side):
    return landmark('Medial epicondyle of humerus',side), landmark('Lateral epicondyle of humerus',side)


def bone_joint(id, side):
    if TOPIC_NAME != 'chest':
        from regional import bone_joint as regional_joint
        return regional_joint(MANIFEST, id, side)
    return {'clavicle':'clavicle','scapula':'scapula','humerus':'shoulder','forearm':'elbow'}.get(id, 'trunk') + (
        '.'+side if side and id in ['clavicle','scapula','humerus','forearm'] else '')


def skin_selection(rig, joints):
    joint_positions = {j['name']: j['position'] for j in joints}
    weight_stats = {}
    for name, record in SELECTED.items():
        ob, part, side = record['ob'], record['part'], record['side']
        groups = {j['name']: ob.vertex_groups.new(name='joint.'+j['name']) for j in joints}
        if part['role'] in ['region','neighbour']:
            proximal = bone_joint(part['origin'][0], side)
            proximal_by_vertex = [proximal] * len(ob.data.vertices)
            if len(part['origin']) > 1:
                trees = [(id, bvh(r['points'], r['faces'])) for id in part['origin'] for r in bone_records([id], side)]
                for component in record['componentVertices']:
                    origin_points = [ob.data.vertices[i].co for i in component & record['originRegion']]
                    if origin_points and trees:
                        id = min(trees, key=lambda item: sum(item[1].find_nearest(p)[3] for p in origin_points))[0]
                        for i in component:
                            proximal_by_vertex[i] = bone_joint(id, side)
            distal = bone_joint(part['insertion'][0], side)
            for i, u in enumerate(record['u']):
                proximal = proximal_by_vertex[i]
                w = u*u*(3-2*u)
                if TOPIC_NAME != 'chest':
                    from regional import muscle_weights
                    weights = muscle_weights(MANIFEST, proximal, distal, u)
                    if any(j not in groups for j in weights):
                        raise RuntimeError(f'{name}: missing attachment joint {weights}')
                    for joint, weight in weights.items():
                        groups[joint].add([i],weight,'REPLACE')
                elif proximal == 'scapula.'+str(side) and distal == 'elbow.'+str(side):
                    middle = 'shoulder.'+side
                    blend = min(1., max(0., u*2 if u < .5 else (u-.5)*2))
                    blend = blend*blend*(3-2*blend)
                    a, b = (proximal, middle) if u < .5 else (middle, distal)
                    groups[a].add([i],1-blend,'REPLACE')
                    groups[b].add([i],blend,'REPLACE')
                elif proximal == distal:
                    groups[proximal].add([i],1,'REPLACE')
                else:
                    groups[proximal].add([i],1-w,'REPLACE')
                    groups[distal].add([i],w,'REPLACE')
        elif part['role'] == 'bone':
            groups[bone_joint(part['id'],side)].add(list(range(len(ob.data.vertices))),1,'REPLACE')
        else:
            weights = []
            for index, v in enumerate(ob.data.vertices):
                skin_side = record['skinSides'][index]
                candidates = ['trunk'] if skin_side is None else [j for j in joint_positions if j == 'trunk' or j.endswith('.'+skin_side)]
                nearest = sorted(candidates, key=lambda j:(v.co-joint_positions[j]).length)[:3]
                w = {j: 1/max(.025,(v.co-joint_positions[j]).length)**4 for j in nearest}
                total = sum(w.values())
                weights.append({j:value/total for j,value in w.items()})
            adjacency = [set() for _ in weights]
            for e in ob.data.edges:
                a,b=e.vertices
                adjacency[a].add(b)
                adjacency[b].add(a)
            for _ in range(3):
                smooth=[]
                for i,w in enumerate(weights):
                    merged={j:.5*value for j,value in w.items()}
                    for n in adjacency[i]:
                        for j,value in weights[n].items():
                            merged[j]=merged.get(j,0)+.5*value/max(1,len(adjacency[i]))
                    best=sorted(merged,key=merged.get,reverse=True)[:4]
                    total=sum(merged[j] for j in best)
                    smooth.append({j:merged[j]/total for j in best})
                weights=smooth
            for i,w in enumerate(weights):
                for j,value in w.items():
                    groups[j].add([i],value,'REPLACE')
        if TOPIC_NAME != 'chest':
            from skin_weights import repair, monotonic_proximal, neighbourhoods, inspect, quantized_bind_points
            points = [list(v.co) for v in ob.data.vertices]
            faces = [list(f.vertices) for f in ob.data.polygons]
            index_joint = {group.index: joint for joint, group in groups.items()}
            weights = [{index_joint[g.group]: g.weight for g in v.groups
                        if g.group in index_joint and g.weight > 0} for v in ob.data.vertices]
            # Quantization can join near-coincident body-region seams. Vote on
            # that same grid so a clean native skin stays clean after export.
            if part['role'] == 'skin':
                points = quantized_bind_points(points)
            original_u = record.get('u')
            weights, repaired_u, stats = repair(points, faces, weights, joint_positions, original_u)
            stats['monotonicVerticesFixed'] = 0
            if original_u is not None:
                _, rings, areas, _ = neighbourhoods(points, faces)
                stats['monotonicVerticesFixed'] = monotonic_proximal(weights, repaired_u, proximal_by_vertex, areas)
                if any(abs(a-b) > 1e-10 for a, b in zip(original_u, repaired_u)):
                    adjacency = [set() for _ in points]
                    for i, neighbours in rings:
                        adjacency[i].update(neighbours)
                    origin = {i for i, u in enumerate(repaired_u) if u <= 1e-8}
                    insertion = {i for i, u in enumerate(repaired_u) if u >= 1-1e-8}
                    if not origin or not insertion:
                        raise RuntimeError(f'{name}: repair removed all fibre endpoints')
                    write_fibre(record, [Vector(p) for p in points], adjacency, origin, insertion, list(repaired_u))
            remaining = inspect(points, faces, weights, joint_positions)
            if remaining['outlierCount']:
                raise RuntimeError(f'{name}: monotonic projection left weight outliers: {remaining}')
            for group in groups.values():
                group.remove(list(range(len(points))))
            for i, vector in enumerate(weights):
                for joint, weight in vector.items():
                    groups[joint].add([i], weight, 'REPLACE')
            record['weightRepair'] = stats
            weight_stats[name] = stats
            print(f'WEIGHT REPAIR {name}: {stats}', flush=True)
        ob.parent=rig
        modifier=ob.modifiers.new('Skin','ARMATURE')
        modifier.object=rig
        ob['role']=part['role']
        ob['layer']=part['layer']
        ob['closed']=topology(ob.data, weld_positions=True)['closed']
        ob.data['closed']=ob['closed']
        ob['partId']=part['id']
        ob['sourceNodes']=json.dumps(record['sourceNames'])
        for polygon in ob.data.polygons:
            polygon.use_smooth=True

    if TOPIC_NAME != 'chest':
        save_json(CACHE/f'{TOPIC_NAME}-weight-repair.json', weight_stats)


def material(role, layer):
    name='anatomy-'+layer
    mat=bpy.data.materials.get(name)
    if mat:
        return mat
    mat=bpy.data.materials.new(name)
    colors={'superficial':(.55,.32,.24,1),'intermediate':(.45,.32,.28,1),
            'deep':(.35,.28,.26,1),'neighbours':(.46,.44,.40,1),
            'skeleton':(.78,.73,.62,1),'context':(.64,.61,.55,.12)}
    mat.diffuse_color=colors[layer]
    mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=colors[layer]
    bsdf.inputs['Roughness'].default_value=.8
    if role=='skin':
        bsdf.inputs['Alpha'].default_value=.12
        mat.surface_render_method='DITHERED'
    return mat


def export(rig):
    before_stats=[]
    for name,record in SELECTED.items():
        record['ob'].data.materials.append(material(record['part']['role'],record['part']['layer']))
        before_stats.append({'name':name,'role':record['part']['role'],'beforeTriangles':len(record['faces']),
                             'afterTriangles':len(record['ob'].data.polygons),
                             'simplifierErrorM':record['simplifierErrorM'],
                             'sampleDeviationM':record['sampleDeviationM'],
                             'maxDeviationM':MANIFEST['budgets'][record['part']['role']]['maxDeviationM'],
                             'closedBefore':topology(record['original'].data, weld_positions=True),
                             'closedAfter':topology(record['ob'].data, weld_positions=True),
                             'originCentroid':record.get('originCentroid'),'insertionCentroid':record.get('insertionCentroid')})
    if 'ribs' in SELECTED and 'sternum' in SELECTED:
        # Static thorax sources share one material/draw; spine remains the second static mesh.
        ribs,sternum=SELECTED['ribs']['ob'],SELECTED['sternum']['ob']
        bpy.ops.object.select_all(action='DESELECT')
        ribs.select_set(True)
        sternum.select_set(True)
        bpy.context.view_layer.objects.active=sternum
        bpy.ops.object.join()
        sternum.name='thorax'
        sternum.data.name='thorax'
        sternum['partId']='thorax'
        sternum['closed']=topology(sternum.data, weld_positions=True)['closed']
        sternum.data['closed']=sternum['closed']
        sternum['sourceNodes']=json.dumps(SELECTED['sternum']['sourceNames']+SELECTED['ribs']['sourceNames'])
        # Blender join can retain duplicate slots even when they reference the same material.
        sternum.data.materials.clear()
        sternum.data.materials.append(material('bone','skeleton'))
        for f in sternum.data.polygons:
            f.material_index=0
    save_json(CACHE/f'{TOPIC_NAME}-build-stats.json',before_stats)
    save_json(TOPIC/'attachments.json',{'license':'CC BY-SA 4.0','status':'candidates — human review required',
                                      'units':'m','sites':ATTACHMENTS,'warnings':WARNINGS})
    bpy.ops.object.select_all(action='DESELECT')
    exported = {record['ob'] for name, record in SELECTED.items() if name != 'ribs'} | {rig}
    originals = {record['original'] for record in SELECTED.values()}
    for ob in list(bpy.data.objects):
        if ob not in exported | originals:
            print(f'REMOVE HELPER {ob.name}', flush=True)
            bpy.data.objects.remove(ob, do_unlink=True)
    for ob in exported:
        ob.hide_set(False)
        ob.hide_viewport = False
        ob.select_set(True)
    bpy.context.view_layer.objects.active=rig
    bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/f'{TOPIC_NAME}-review.blend'))
    # Originals live only in the review blend; the export scene contains no helpers.
    for ob in originals:
        bpy.data.objects.remove(ob, do_unlink=True)
    assert set(bpy.context.scene.objects) == exported
    bpy.ops.export_scene.gltf(filepath=str(CACHE/f'{TOPIC_NAME}-raw.glb'),export_format='GLB',
                              use_selection=True,export_yup=True,export_skins=True,
                              export_attributes=True,export_extras=True,export_animations=False,
                              export_apply=False,export_materials='EXPORT',export_texcoords=True,
                              export_normals=True,export_cameras=False,export_lights=False)
    print(f'EXPORTED {CACHE / f"{TOPIC_NAME}-raw.glb"}',flush=True)


load_sources()
centre,floor,check=select_and_transform()
simplify_selection()
for record in SELECTED.values():
    if record['part']['role'] in ['region','neighbour']:
        bake_muscle(record)
rig,joints=make_rig(centre,floor,check)
if 'jointNames' in MANIFEST and set(MANIFEST['jointNames']) != {j['name'] for j in joints}:
    raise RuntimeError('Native rig does not match the explicit manifest joint list')
skin_selection(rig,joints)
export(rig)
