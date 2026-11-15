"""Dump every Nervous FBX mesh (world positions, triangles) to cache/brain-nerves-sources.npz.

Blender only reads the cached FBX; provenance.py and the later steps read the npz without Blender.
Source frame: metres, Z up, front -Y, body left +X (anatomy runbook §6).
"""
import sys
from pathlib import Path

import bpy
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import CACHE, clear_scene, import_system

# Nervous: every mesh. Skeleton: every mesh (bones and attachment markers). Muscles: the right arm's
# biceps and triceps only (the reflex arm).
KEEP = {'nervous': lambda n: True, 'skeleton': lambda n: True,
        'muscles': lambda n: n.endswith('.r') and ('biceps brachii' in n or 'triceps brachii' in n)}


def dump(system, arrays):
    clear_scene()
    for ob in import_system(system):
        if ob.type != 'MESH' or not ob.data.polygons or not KEEP[system](ob.name):
            continue
        me = ob.data
        me.calc_loop_triangles()
        m = np.array(ob.matrix_world)
        co = np.empty(len(me.vertices) * 3)
        me.vertices.foreach_get('co', co)
        co = co.reshape(-1, 3) @ m[:3, :3].T + m[:3, 3]
        tri = np.empty(len(me.loop_triangles) * 3, dtype=np.int64)
        me.loop_triangles.foreach_get('vertices', tri)
        tri = tri.reshape(-1, 3)
        if np.linalg.det(m[:3, :3]) < 0:
            tri = tri[:, ::-1]
        arrays[f'v::{ob.name}'] = co.astype(np.float64)
        arrays[f'f::{ob.name}'] = tri.astype(np.int32)


for system, out in (('nervous', 'brain-nerves-sources.npz'), ('skeleton', 'brain-nerves-skeleton.npz'), ('muscles', 'brain-nerves-muscles.npz')):
    arrays = {}
    dump(system, arrays)
    np.savez_compressed(CACHE / out, **arrays)
    print('DUMPED', system, len(arrays) // 2, 'meshes', flush=True)
