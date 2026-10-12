"""Workbench review of the decoded final GLB, including an actual skin pose."""
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector, Quaternion
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import CACHE, ROOT, clear_scene, save_json, topic_argument

TOPIC_NAME = topic_argument()


def linear(hexcode):
    values = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values)


def geometry(ob):
    evaluated = ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    points = [evaluated.matrix_world @ v.co for v in mesh.vertices]
    evaluated.to_mesh_clear()
    return points


def setup():
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=str(CACHE/f'{TOPIC_NAME}-audit.glb'), disable_bone_shape=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1600
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.display.shading.light = 'STUDIO'
    scene.display.shading.studio_light = 'paint.sl'
    scene.display.shading.color_type = 'OBJECT'
    scene.display.shading.background_type = 'WORLD'
    scene.world.color = linear('EDE7D6')
    scene.display.shading.show_shadows = True
    scene.display.shading.show_cavity = True
    scene.display.shading.cavity_type = 'BOTH'
    scene.display.shading.curvature_ridge_factor = 1.1
    scene.display.shading.curvature_valley_factor = 1.0
    scene.display.shading.show_specular_highlight = False
    scene.display.render_aa = '16'
    meshes = [o for o in scene.objects if o.type == 'MESH']
    colours = {'region':'B57861','neighbour':'89978A','bone':'DDD4BC','skin':'C2B6A0'}
    for ob in meshes:
        ob.color = (*linear(colours[ob.get('role','bone')]),1)
    data = bpy.data.cameras.new('review-camera')
    camera = bpy.data.objects.new('review-camera',data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    data.type = 'ORTHO'
    return scene, meshes, camera


def frame(scene, camera, points, direction):
    lower = Vector([min(p[i] for p in points) for i in range(3)])
    upper = Vector([max(p[i] for p in points) for i in range(3)])
    focus = (lower+upper)*.5
    direction = Vector(direction).normalized()
    camera.rotation_euler = (-direction).to_track_quat('-Z','Y').to_euler()
    rotation = camera.rotation_euler.to_matrix()
    right, up = rotation @ Vector((1,0,0)), rotation @ Vector((0,1,0))
    horizontal = [(p-focus).dot(right) for p in points]
    vertical = [(p-focus).dot(up) for p in points]
    focus += right*((min(horizontal)+max(horizontal))*.5) + up*((min(vertical)+max(vertical))*.5)
    camera.location = focus + direction*3
    # Five percent empty margin on each side.
    camera.data.ortho_scale = max(max(vertical)-min(vertical),
        (max(horizontal)-min(horizontal))*scene.render.resolution_y/scene.render.resolution_x)/.9


def render(scene, meshes, name, overlay=True):
    path = CACHE/f'{TOPIC_NAME}-preview-{name}.png'
    skin = next(o for o in meshes if o.name == 'skin-outline')
    for ob in meshes:
        shell_only = name == 'skin' or (name.startswith('pose') and name != 'pose-anatomy')
        ob.hide_render = (shell_only and ob != skin) or (not shell_only and ob == skin)
    scene.render.film_transparent = False
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    if overlay and name not in ('skin','exploded-by-layer'):
        # Workbench has no independent per-object render opacity. Composite the
        # same-camera opaque shell at 30% opacity; all anatomy stays solid.
        base = bpy.data.images.load(str(path),check_existing=False)
        for ob in meshes:
            ob.hide_render = ob != skin
        scene.render.film_transparent = True
        bpy.ops.render.render()
        result = bpy.data.images['Render Result']
        shell_path = CACHE/f'{TOPIC_NAME}-preview-skin-overlay.png'
        result.save_render(str(shell_path),scene=scene)
        shell = bpy.data.images.load(str(shell_path),check_existing=False)
        import numpy as np
        a = np.empty(len(base.pixels),dtype=np.float32); base.pixels.foreach_get(a)
        b = np.empty(len(shell.pixels),dtype=np.float32); shell.pixels.foreach_get(b)
        a = a.reshape(-1,4); b = b.reshape(-1,4)
        alpha = b[:,3:4]*.3
        a[:,:3] = a[:,:3]*(1-alpha)+b[:,:3]*alpha
        base.pixels.foreach_set(a.ravel()); base.filepath_raw = str(path); base.save()
        bpy.data.images.remove(base); bpy.data.images.remove(shell)
    print(f'PREVIEW {path}',flush=True)
    return str(path)


def pose(scene, meshes, camera):
    from regional import pose as regional_pose
    return regional_pose(sys.modules[__name__], scene, meshes, camera)


def main():
    scene,meshes,camera = setup()
    transforms = {o.name:o.location.copy() for o in meshes}
    rest = {o.name:geometry(o) for o in meshes}
    torso_points = rest.get('thorax', rest.get('pelvis', [p for o in meshes if o.name != 'skin-outline' for p in rest[o.name]]))
    torso_centre = sum(torso_points,Vector())/len(torso_points)
    paths = []
    for name,direction in [('front',(0,-1,0)),('back',(0,1,0)),('left',(1,0,0)),
                           ('exploded-by-layer',(.45,1 if TOPIC_NAME == 'back' else -1,.12)),('skin',(0,-1,0))]:
        for ob in meshes:
            ob.location = transforms[ob.name]
            if name == 'exploded-by-layer' and ob.get('role') == 'region':
                amount = {'superficial':.12,'intermediate':.06}.get(ob.get('layer'),0)
                centre = sum(rest[ob.name],Vector())/len(rest[ob.name])
                outward = Vector((centre.x-torso_centre.x,centre.y-torso_centre.y,0)).normalized()
                ob.location += outward*amount
        bpy.context.view_layer.update()
        points = [p for ob in meshes if (ob.name == 'skin-outline' if name == 'skin' else ob.name != 'skin-outline') for p in geometry(ob)]
        frame(scene,camera,points,direction)
        paths.append(render(scene,meshes,name))
    for ob in meshes:
        ob.location = transforms[ob.name]
    bpy.context.view_layer.update()
    pose_path = pose(scene,meshes,camera)
    save_json(CACHE/f'{TOPIC_NAME}-preview-paths.json',paths)
    save_json(CACHE/f'{TOPIC_NAME}-preview-backend.json',{'backend':'Blender Workbench studio','skinOpacity':.3,'margin':.05,'paths':paths,'pose':pose_path})

if __name__ == '__main__':
    main()
