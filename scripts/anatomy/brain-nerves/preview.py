"""G4 previews (docs/75 §5.2): render the decoded published GLB (cache/brain-nerves-audit.glb) in Blender Workbench.

Writes cache/brain-nerves-preview-<view>.png: front, left, top, midline, brain-close, exploded-lobes.
"""
import sys
from pathlib import Path

import bpy
from mathutils import Vector

CACHE = Path(__file__).resolve().parents[1] / 'cache'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(CACHE / 'brain-nerves-audit.glb'))
COL = {'frontal': (.67, .43, .35), 'parietal': (.83, .71, .53), 'temporal': (.65, .75, .65), 'occipital': (.4, .39, .59),
       'insula': (.6, .5, .45), 'medial': (.7, .6, .55), 'cerebellum': (.39, .76, .75), 'midbrain': (.55, .51, .49),
       'pons': (.55, .51, .49), 'medulla': (.55, .51, .49), 'nerves': (.85, .78, .35), 'roots': (.85, .78, .35),
       'cauda': (.85, .78, .35), 'optic': (.85, .78, .35), 'hearing': (.85, .78, .35), 'cranial': (.85, .78, .35),
       'biceps': (.7, .4, .35), 'triceps': (.6, .35, .3), 'ventricles': (.4, .6, .8), 'dura': (.7, .7, .75)}
obs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in obs:
    mat = bpy.data.materials.new(o.name)
    c = next((v for k, v in COL.items() if k in o.name), (.85, .82, .75))
    mat.diffuse_color = (*c, 1)
    o.data.materials.clear()
    o.data.materials.append(mat)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.light = 'STUDIO'
scene.display.shading.show_cavity = True
scene.render.resolution_x, scene.render.resolution_y = 1400, 1000
scene.world = bpy.data.worlds.new('w')
scene.world.color = (.93, .91, .86)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam)
scene.camera = cam


def shot(name, eye, target, hide=(), lens=50, ortho=None):
    for o in obs:
        o.hide_render = any(h in o.name for h in hide)
    cam.location = Vector(eye)
    cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lens
    if ortho:
        cam.data.type, cam.data.ortho_scale = 'ORTHO', ortho
    else:
        cam.data.type = 'PERSP'
    scene.render.filepath = str(CACHE / f'brain-nerves-preview-{name}.png')
    bpy.ops.render.render(write_still=True)
    print('PREVIEW', scene.render.filepath, flush=True)


# glTF import: +Y up in glTF becomes +Z up in Blender, glTF +Z (front) becomes Blender -Y.
skin = ('skin',)
shot('front', (0, -3.6, -.15), (0, 0, -.15), hide=skin, ortho=2.5)
shot('left', (3.6, .13, -.15), (0, .13, -.15), hide=skin, ortho=2.5)
shot('brain-left', (.6, .13, .62), (0, .13, .61), hide=skin + ('skull', 'skeleton', 'vertebral', 'dura', 'cranial'), ortho=.26)
shot('brain-top', (0, .13, 1.4), (0, .13, .62), hide=skin + ('skull', 'dura'), ortho=.24)
shot('midline', (-.6, .13, .58), (0, .13, .58), hide=skin + ('.r', 'skull', 'dura-folds', 'skeleton', 'arm', 'trunk'), ortho=.3)
shot('skull-fit', (.6, .13, .6), (0, .13, .6), hide=skin + ('skeleton',), ortho=.3)
shot('reflex-arm', (-.9, -1.0, .45), (-.15, .12, .25), hide=skin + ('skull', 'skeleton-rest'), lens=40)
