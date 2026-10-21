"""Shared Blender inventory and selection helpers."""
import json
import re
import random
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / 'cache'
FILES = {
    'muscles': 'MuscularSystem100.fbx',
    'skeleton': 'SkeletalSystem100.fbx',
    'regions': 'Regions of human body100.fbx',
    'joints': 'Joints100.fbx',
    'visceral': 'VisceralSystem100.fbx',
    'cardiovascular': 'CardioVascular41.fbx',
}


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n')


def clear_scene():
    # Hidden FBX helpers are not selected by select_all. Remove them explicitly.
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)


def import_system(system):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(CACHE / FILES[system]))
    return sorted(set(bpy.data.objects) - before, key=lambda ob: ob.name)


def world_vertices(ob):
    return [ob.matrix_world @ v.co for v in ob.data.vertices]


def centroid(points):
    return sum(points, Vector()) / max(1, len(points))


def topology(mesh, weld_positions=False):
    remap = {}
    if weld_positions:
        positions = {}
        for v in mesh.vertices:
            key = tuple(round(c, 7) for c in v.co)
            remap[v.index] = positions.setdefault(key, len(positions))
    counts = {}
    for face in mesh.polygons:
        for edge in face.edge_keys:
            key = tuple(sorted(remap.get(i, i) for i in edge))
            counts[key] = counts.get(key, 0) + 1
    boundary = sum(n == 1 for n in counts.values())
    nonmanifold = sum(n != 2 for n in counts.values())
    loose = sum(tuple(sorted(remap.get(i, i) for i in e.vertices)) not in counts for e in mesh.edges)
    return {'boundaryEdges': boundary, 'nonmanifoldEdges': nonmanifold,
            'looseEdges': loose, 'closed': bool(mesh.polygons) and nonmanifold == 0 and loose == 0}


def object_info(ob, system, midline=0):
    points = (world_vertices(ob) if ob.type == 'MESH' else []) or [ob.matrix_world.translation]
    centre = centroid(points)
    explicit = re.search(r'\.(?:[oe]\d*)?([lr])(?:\.\d+)?$', ob.name)
    # FBX bones/attachment meshes have lost their side suffix, but retain positions.
    side = explicit.group(1) if explicit else ('l' if centre.x - midline > .005 else 'r' if centre.x - midline < -.005 else None)
    marker = re.match(r'^(.*?)\.([oeji])(?:\d*[lr])?(?:\.\d+)?$', ob.name)
    box = [[min(p[i] for p in points), max(p[i] for p in points)] for i in range(3)]
    result = {'name': ob.name, 'type': ob.type, 'side': side,
              'sideSource': 'suffix' if explicit else 'centroid-x', 'system': system,
              'triangles': sum(len(f.vertices) - 2 for f in ob.data.polygons) if ob.type == 'MESH' else 0,
              'boundingBox': {'min': [b[0] for b in box], 'max': [b[1] for b in box]},
              'centroid': list(centre), 'sourceParent': ob.parent.name if ob.parent else None}
    result.update(topology(ob.data, weld_positions=True) if ob.type == 'MESH' else
                  {'boundaryEdges': 0, 'nonmanifoldEdges': 0, 'looseEdges': 0, 'closed': False})
    if marker:
        geometric_side = 'l' if centre.x-midline > .005 else 'r' if centre.x-midline < -.005 else None
        if explicit and geometric_side and geometric_side != side:
            result['labelSide'] = side
            result['side'] = geometric_side
            result['sideSource'] = 'attachment-centroid-x (label mismatch)'
        result['attachment'] = {'kind': {'o': 'origin', 'e': 'insertion', 'j': 'landmark', 'i': 'landmark'}[marker[2]],
                                'owner': marker[1], 'centroid': list(centre)}
    return result


def base_name(name):
    return re.sub(r'(?:\.[lr])?(?:\.\d+)?$', '', name)


def matches(part, entry, side=None):
    if entry['system'] != part['system'] or entry['type'] != 'MESH' or 'attachment' in entry:
        return False
    name = base_name(entry['name'])
    hit = name in part.get('objects', []) or any(re.fullmatch(p, name) for p in part.get('patterns', []))
    return hit and (side is None or entry['side'] == side)


def part_instances(manifest, entries):
    for part in manifest['parts']:
        for side in ['l', 'r'] if part['sides'] == 'bilateral' else [None]:
            selected = [e for e in entries if matches(part, e, side)]
            yield part, side, selected


def surface_deviation(points_a, faces_a, points_b, faces_b):
    from mathutils.bvhtree import BVHTree
    def samples(points, faces):
        used = sorted({i for face in faces for i in face})
        result = [points[i] for i in used[::max(1,len(used)//3000)]]
        rng = random.Random(7)
        weights = [(points[b]-points[a]).cross(points[c]-points[a]).length for a,b,c in faces]
        if sum(weights):
            for a,b,c in rng.choices(faces, weights=weights, k=6000):
                u,v = rng.random(),rng.random()
                if u+v > 1:
                    u,v = 1-u,1-v
                result.append(points[a]+(points[b]-points[a])*u+(points[c]-points[a])*v)
        return result
    tree_a = BVHTree.FromPolygons(points_a, faces_a, all_triangles=True)
    tree_b = BVHTree.FromPolygons(points_b, faces_b, all_triangles=True)
    return max(max(tree_b.find_nearest(p)[3] for p in samples(points_a, faces_a)),
               max(tree_a.find_nearest(p)[3] for p in samples(points_b, faces_b)))


def mobile_skin_region(name, topic="chest"):
    if topic != "chest" and re.search(r"thigh|knee|leg|ankle|foot|halluc|heel|malleol|metatars|sole|plantar|gluteal|hip region|femoral|popliteal", name.lower()):
        return topic in ("legs", "core")
    if topic in ("legs", "core"):
        return False
    return bool(re.search(r'arm|elbow|wrist|hand|bicipital|cubital|carpal|palmar|palm|radial foveola|deltoid region|scapular region|pectoral|mammary region|presternal region|infraclavicular fossa|deltopectoral triangle|lateral region of thorax|triangle of auscultation|supraclavicular fossa', name.lower()))


TOPICS = ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'digestive', 'heart-lungs')

def topic_argument():
    """Blender arguments follow --; ordinary Python scripts use argv directly."""
    import argparse
    import sys
    parser = argparse.ArgumentParser()
    parser.add_argument('--topic', choices=TOPICS, default='chest')
    arguments = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
    return parser.parse_known_args(arguments)[0].topic
