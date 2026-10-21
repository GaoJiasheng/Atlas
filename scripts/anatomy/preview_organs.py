"""Workbench views of the decoded heart-and-lungs region, with the routes and a heart
shell check from the proposed cover camera.

The shell check renders the heart alone with back faces culled, as the engine draws a
single-sided mesh: wherever the four merged chamber surfaces leave an opening, the
bright background shows through.
"""
import json
import math
import numpy as np
import bpy
from mathutils import Vector
from common import CACHE, ROOT, save_json

# Proposed cameras (topic frame: metres, +Y up, +Z front), the engine's 30 degree lens.
COVER = dict(position=[0.36, 0.42, 0.92], target=[0.01, 0.29, -0.1], fov=30)      # chest: lungs, heart, windpipe
HEART = dict(position=[0.17, 0.33, 0.36], target=[0.019, 0.272, -0.09], fov=30)   # the INSIDE preset's distance
PALETTE = {'airway': 'A9B9BF', 'lung-pair': 'C9A9A2', 'heart-group': '9A5C50', 'body-vessels': 'A0786E', 'air-tubes': '8FA3AA',
           'breathing-movers': 'B9A98C', 'digestion': 'CBB394', 'leg-muscle-group': 'B57861', 'skeleton-context': 'DDD4BC', 'context': 'C2B6A0'}
FLOW = {'blood-rich': 'C8102E', 'blood-poor': '6E1423', 'air': '4E7F91', 'gases': '2F6B4F', 'digested-food': 'B07A1E'}


def blender(v):
    return Vector((v[0], -v[2], v[1]))


def perspective(scene, camera, cam):
    camera.data.type = 'PERSP'
    camera.data.sensor_fit = 'VERTICAL'
    camera.data.angle_y = math.radians(cam['fov'])  # vertical, as three.js
    camera.location = blender(cam['position'])
    camera.rotation_euler = (blender(cam['target']) - camera.location).to_track_quat('-Z', 'Y').to_euler()


def curves(scene, paths, colour, radius):
    out = []
    for name, pts in paths:
        data = bpy.data.curves.new(name, 'CURVE')
        data.dimensions = '3D'
        data.bevel_depth = radius
        data.bevel_resolution = 1
        spline = data.splines.new('POLY')
        spline.points.add(len(pts) - 1)
        for p, v in zip(spline.points, pts):
            p.co = (*blender(v), 1)
        ob = bpy.data.objects.new(name, data)
        scene.collection.objects.link(ob)
        ob.color = (*colour, 1)
        out.append(ob)
    return out


def run(api):
    scene, meshes, camera = api.setup()
    by = {o.name: o for o in meshes}
    for ob in meshes:
        ob.color = (*api.linear(PALETTE.get(ob.get('layer', 'context'), 'C2B6A0')), 1)
    routes = json.loads((ROOT/api.TOPIC_NAME/'routes.json').read_text())['flows']
    organs = [o for o in meshes if o.get('role') in ('tube', 'organ')]
    airway = [by[n] for n in ('nasal-cavity', 'pharynx', 'epiglottis', 'larynx', 'trachea', 'bronchi')]
    vessels = [by[n] for n in ('heart', 'great-vessels', 'lung-vessels', 'vessels-out', 'vessels-back')]
    written = []

    def render(name, visible, direction=None, points=None, cam=None, culling=False, world=None):
        for o in scene.objects:
            if o.type == 'MESH':
                o.hide_render = o not in visible
        if cam:
            perspective(scene, camera, cam)
        else:
            camera.data.type = 'ORTHO'
            api.frame(scene, camera, points or [p for o in visible for p in api.geometry(o)], direction)
        scene.display.shading.show_backface_culling = culling
        scene.world.color = api.linear(world or 'EDE7D6')
        path = CACHE/f'{api.TOPIC_NAME}-preview-{name}.png'
        scene.render.filepath = str(path)
        scene.render.film_transparent = False
        bpy.ops.render.render(write_still=True)
        written.append(str(path))
        print('PREVIEW', path, flush=True)
        return path

    def composite(base, overlay, opacity):
        a = bpy.data.images.load(str(base), check_existing=False)
        b = bpy.data.images.load(str(overlay), check_existing=False)
        x = np.asarray(a.pixels[:], dtype=np.float32).reshape(-1, 4)
        y = np.asarray(b.pixels[:], dtype=np.float32).reshape(-1, 4)
        alpha = y[:, 3:4] * opacity
        x[:, :3] = x[:, :3] * (1 - alpha) + y[:, :3] * alpha
        a.pixels.foreach_set(x.ravel())
        a.filepath_raw = str(base)
        a.save()
        bpy.data.images.remove(a)
        bpy.data.images.remove(b)

    def ghost(base, names, opacity=.16):
        for o in scene.objects:
            if o.type == 'MESH':
                o.hide_render = o.name not in names
        scene.render.film_transparent = True
        overlay = CACHE/f'{api.TOPIC_NAME}-context-overlay.png'
        scene.render.filepath = str(overlay)
        bpy.ops.render.render(write_still=True)
        composite(base, overlay, opacity)

    for name, direction in [('front', (0, -1, 0)), ('back', (0, 1, 0)), ('left', (1, 0, 0))]:
        render(name, organs, direction)
    rest = {o.name: o.location.copy() for o in meshes}
    for o in meshes:
        layer = o.get('layer')
        if layer in ('airway', 'air-tubes'):
            o.location.x -= .30
        elif layer == 'lung-pair':
            o.location.x += .5 if o.name.endswith('left') else -.5
        elif layer in ('heart-group', 'body-vessels'):
            o.location.y -= .15
        elif layer == 'digestion':
            o.location.x += .30
    shown = [o for o in meshes if o.get('role') in ('tube', 'organ')]
    bpy.context.view_layer.update()
    render('exploded-by-role', shown, (.15, -1, .1))
    for o in meshes:
        o.location = rest[o.name]
    bpy.context.view_layer.update()
    base = render('skin-overlay', organs, (0, -1, 0))
    ghost(base, ('skin-outline', 'skeleton', 'ribcage'))
    chest = [p for o in airway + [by['lung-right'], by['lung-left']] for p in api.geometry(o)]
    render('airway-only', airway, (0, -1, 0))
    render('airway-left', airway, (1, 0, 0))
    # Vessels with the blood routes on top (rich = bright red, poor = dark red).
    blood = []
    for fid, flow in routes.items():
        if flow['group'] in ('blood-rich', 'blood-poor'):
            blood += curves(scene, [(f"{fid}-{p['id']}", p['path']) for p in flow['paths']], api.linear(FLOW[flow['group']]), .0016)
    for ob in blood:
        ob.hide_render = True
    base = render('vessels-only', vessels, (0, -1, 0))
    for ob in blood:
        ob.hide_render = False
    for o in meshes:
        o.hide_render = True
    scene.render.filepath = str(base)
    bpy.ops.render.render(write_still=True)
    for o in meshes:
        o.hide_render = o not in vessels
    for ob in blood:
        ob.hide_render = True
    scene.render.film_transparent = True
    overlay = CACHE/f'{api.TOPIC_NAME}-vessel-overlay.png'
    scene.render.filepath = str(overlay)
    bpy.ops.render.render(write_still=True)
    composite(base, overlay, .35)
    # Air and gases on the airway and lungs.
    air = []
    for fid, flow in routes.items():
        if flow['group'] in ('air', 'gases'):
            air += curves(scene, [(f"{fid}-{p['id']}", p['path']) for p in flow['paths']], api.linear(FLOW[flow['group']]), .0012)
    lungs = airway + [by['lung-right'], by['lung-left']]
    base = render('routes-air', [], (0, -1, 0), points=chest)
    for ob in air:
        ob.hide_render = True
    for o in meshes:
        o.hide_render = o not in lungs
    scene.render.film_transparent = True
    overlay = CACHE/f'{api.TOPIC_NAME}-air-overlay.png'
    scene.render.filepath = str(overlay)
    bpy.ops.render.render(write_still=True)
    composite(base, overlay, .3)
    for ob in blood + air:
        bpy.data.objects.remove(ob, do_unlink=True)
    # Heart shell: alone, single-sided, against a bright background, from the cover camera and close up.
    render('heart-cover', [by['heart']], cam=COVER, culling=True, world='5FD3C8')
    render('heart-cover-front', [by['heart']], cam=dict(COVER, position=[0.01, 0.30, 0.95]), culling=True, world='5FD3C8')
    render('heart-close', [by['heart']], cam=HEART, culling=True, world='5FD3C8')
    render('heart-close-back', [by['heart']], cam=dict(HEART, position=[-0.12, 0.33, -0.55]), culling=True, world='5FD3C8')
    render('cover', [o for o in organs if o.get('layer') != 'digestion'] + [by['ribcage']], cam=COVER)
    camera.data.type = 'ORTHO'
    scene.display.shading.show_backface_culling = False
    scene.world.color = api.linear('EDE7D6')
    written.append(api.wireframe(scene, meshes, camera, 'wire-rest'))
    save_json(CACHE/f'{api.TOPIC_NAME}-preview-backend.json', dict(backend='native Blender Workbench; decoded published geometry', paths=written, rig=False,
                                                                 cameras=dict(cover=COVER, heartClose=HEART)))
    print('ORGAN PREVIEWS', json.dumps(written), flush=True)
