"""Workbench views of the actual decoded static region, including flow hand-off."""
import json
import numpy as np
import bpy
from mathutils import Vector
from common import CACHE,ROOT,save_json


def run(api):
    scene,meshes,camera=api.setup()
    paths=json.loads((ROOT/api.TOPIC_NAME/'centrelines.json').read_text())['tubes']
    palette={'mouth':'B77F71','gullet-stomach':'C28B82','small-intestine':'CA9D83','large-intestine':'A99080','helpers':'9B8F62','body-systems':'8C9B90','context':'C2B6A0'}
    for ob in meshes:
        ob.color=(*api.linear(palette[ob.get('layer','context')]),1)
        if ob.name.startswith('teeth-'):ob.color=(*api.linear('DDD4BC'),1)
        if ob.name=='skeleton':ob.color=(*api.linear('D2C7AB'),1)
        if ob.name=='lungs':ob.color=(*api.linear('98A49F'),1)
        if ob.name=='heart':ob.color=(*api.linear('9A5C50'),1)
    organs=[o for o in meshes if o.get('role') in ('tube','organ')]
    tubes=[o for o in meshes if o.get('role')=='tube']
    bounds=[p for o in organs for p in api.geometry(o)]
    rest={o.name:o.location.copy() for o in meshes}
    written=[]
    def render(name,visible,direction,points=None):
        for o in meshes:o.hide_render=o not in visible
        api.frame(scene,camera,points or bounds,direction)
        path=CACHE/f'{api.TOPIC_NAME}-preview-{name}.png'
        scene.render.filepath=str(path);scene.render.film_transparent=False
        bpy.ops.render.render(write_still=True);written.append(str(path));return path
    for name,direction in [('front',(0,-1,0)),('back',(0,1,0)),('left',(1,0,0))]:
        render(name,organs,direction)
    # Spread by explicit roles, with systems offset out of the organ column.
    for o in meshes:
        if o.get('role')=='organ':o.location.x+=.19;o.location.y-=.04
        elif o.get('role')=='tube':o.location.x-=.10
        elif o.get('role')=='system':o.location.x+=.60
    shown=[o for o in meshes if o.get('role')!='skin']
    render('exploded-by-role',shown,(.25,-1,.10),[p for o in shown for p in api.geometry(o)])
    for o in meshes:o.location=rest[o.name]
    skin=[o for o in meshes if o.name=='skin-outline']
    render('skin',skin,(0,-1,0),[p for o in skin for p in api.geometry(o)])
    render('tube-only',tubes,(0,-1,0))
    # Same camera ghost body context: premultiplied alpha compositing, no geometry
    # changes. Main organs stay clear; skull/ribs/pelvis landmarks remain visible.
    base=render('skin-overlay',organs,(0,-1,0))
    def composite(base_path,overlay_path,opacity):
        a=bpy.data.images.load(str(base_path),check_existing=False);b=bpy.data.images.load(str(overlay_path),check_existing=False)
        x=np.asarray(a.pixels[:],dtype=np.float32).reshape(-1,4);y=np.asarray(b.pixels[:],dtype=np.float32).reshape(-1,4)
        alpha=y[:,3:4]*opacity;x[:,:3]=x[:,:3]*(1-alpha)+y[:,:3]*alpha
        a.pixels.foreach_set(x.ravel());a.filepath_raw=str(base_path);a.save();bpy.data.images.remove(a);bpy.data.images.remove(b)
    for o in meshes:o.hide_render=o.name not in ('skin-outline','skeleton')
    scene.render.film_transparent=True;scene.render.filepath=str(CACHE/'digestive-context-overlay.png');bpy.ops.render.render(write_still=True)
    composite(base,CACHE/'digestive-context-overlay.png',.16)
    # Tube ghost behind centreline curves; render curves alone before compositing
    # so the geometric centreline is inspectable through the opaque lumen mesh.
    curves=[]
    for name,c in paths.items():
        data=bpy.data.curves.new(name+'-centreline','CURVE');data.dimensions='3D';data.bevel_depth=.0012;data.bevel_resolution=1
        spline=data.splines.new('POLY');spline.points.add(len(c['points'])-1)
        for p,v in zip(spline.points,c['points']):p.co=(v[0],-v[2],v[1],1)
        ob=bpy.data.objects.new(name+'-centreline',data);scene.collection.objects.link(ob);ob.color=(*api.linear('284B47'),1);curves.append(ob)
        for crossing in c.get('sourceOverlapCrossings',[]):
            v=crossing['point'];bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.0025,location=(v[0],-v[2],v[1]))
            marker=bpy.context.object;marker.name='source-overlap-warning';marker.color=(*api.linear('A84A36'),1);curves.append(marker)
    for view,direction in [('centrelines',(0,-1,0)),('centrelines-left',(1,0,0))]:
        base=render(view,[],direction)
        for ob in curves:ob.hide_render=False
        scene.render.filepath=str(base);bpy.ops.render.render(write_still=True)
        for ob in curves:ob.hide_render=True
        for ob in meshes:ob.hide_render=ob not in tubes
        scene.render.film_transparent=True;scene.render.filepath=str(CACHE/'digestive-tube-overlay.png');bpy.ops.render.render(write_still=True)
        composite(base,CACHE/'digestive-tube-overlay.png',.22)
    for ob in curves:bpy.data.objects.remove(ob,do_unlink=True)
    # Actual decoded wire edges; all mesh faces hidden, shared preview helper.
    written.append(api.wireframe(scene,meshes,camera,'wire-rest'))
    save_json(CACHE/f'{api.TOPIC_NAME}-preview-backend.json',dict(backend='native Blender Workbench; decoded published geometry',paths=written,rig=False))
    print('STATIC PREVIEWS',json.dumps(written),flush=True)
