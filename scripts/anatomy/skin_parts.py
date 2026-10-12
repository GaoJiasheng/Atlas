"""Round 9 derived skin meshes, using native wrist landmarks and barycentric weights."""
import json
import math
import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
from common import topology, CACHE, save_json

SKIN_NODES = ['skin-outline', 'skin-hand.l', 'skin-hand.r', 'skin-wire']
WRIST_OFFSET = .005



def source_geometry(ob):
    ob.data.calc_loop_triangles()
    points = [v.co.copy() for v in ob.data.vertices]
    faces = [tuple(t.vertices) for t in ob.data.loop_triangles]
    groups = {g.index: g.name.removeprefix('joint.') for g in ob.vertex_groups}
    weights = [{groups[g.group]:g.weight for g in v.groups if g.weight>0} for v in ob.data.vertices]
    return points, faces, weights


def create(template, name, points, faces, weights):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces); mesh.update()
    group_names = [g.name for g in template.vertex_groups]
    ob = template.copy(); ob.data = mesh; ob.name = name
    bpy.context.collection.objects.link(ob)
    ob.vertex_groups.clear()
    groups = {n.removeprefix('joint.'):ob.vertex_groups.new(name=n) for n in group_names}
    for i, w in enumerate(weights):
        for n, value in w.items():
            if value: groups[n].add([i], value, 'REPLACE')
    for mat in template.data.materials: mesh.materials.append(mat)
    for polygon in mesh.polygons: polygon.use_smooth = True
    ob['closed'] = topology(mesh, weld_positions=True)['closed']; mesh['closed'] = ob['closed']
    ob['partId'] = name; ob['role'] = 'skin'; ob['layer'] = 'context'
    if name != 'skin-outline':
        if 'sourceNodes' in ob: del ob['sourceNodes']
        ob['sourceNode'] = 'skin-outline'
    return ob


def cut(points, faces, weights, plane, normal, distal):
    """Clip local forearm triangles, sharing interpolated intersections on both sides."""
    out, triangles, vectors, lookup = [], [], [], {}
    def append(p, w):
        key = tuple(round(c, 9) for c in p)
        if key not in lookup:
            lookup[key] = len(out); out.append(p); vectors.append(w)
        return lookup[key]
    for face in faces:
        cloud = [(points[i], weights[i]) for i in face]
        polygon = []
        for (a,wa),(b,wb) in zip(cloud, cloud[1:]+cloud[:1]):
            da,db = (a-plane).dot(normal),(b-plane).dot(normal)
            ina,inb = (da >= -1e-10, db >= -1e-10) if distal else (da <= 1e-10, db <= 1e-10)
            if ina: polygon.append((a,wa))
            if ina != inb:
                t = da/(da-db)
                w = {n:wa.get(n,0)*(1-t)+wb.get(n,0)*t for n in wa.keys()|wb.keys()}
                polygon.append((a.lerp(b,t),w))
        ids = [append(p,w) for p,w in polygon]
        triangles.extend((ids[0],ids[i],ids[i+1]) for i in range(1,len(ids)-1) if len({ids[0],ids[i],ids[i+1]})==3)
    return out,triangles,vectors


def split_geometry(points, faces, weights, joints):
    hands, evidence = {}, {}
    for side in ('l','r'):
        wrist = joints['hand.'+side]; normal = (wrist-joints['elbow.'+side]).normalized()
        plane = wrist+normal*WRIST_OFFSET
        dp,df,dw = cut(points,faces,weights,plane,normal,True)
        # Select connected distal hand surfaces, not an arbitrary radial crop:
        # thumbs can splay beyond the forearm capsule. Other distal body surfaces
        # (legs and opposite hand) remain part of the outline.
        adjacent=[set() for _ in dp]
        for f in df:
            for i in f: adjacent[i].update(f)
        seen=set(); chosen=set()
        for root in range(len(dp)):
            if root in seen: continue
            stack=[root]; seen.add(root); component=[]
            while stack:
                i=stack.pop(); component.append(i)
                for j in adjacent[i]-seen: seen.add(j); stack.append(j)
            centre=sum((dp[i] for i in component),Vector())/len(component)
            sign=1 if side=='l' else -1
            if (centre-(wrist+normal*.08)).length<.20 and centre.x*sign>wrist.x*sign-.06:
                chosen.update(component)
        hand_faces=[f for f in df if f[0] in chosen]
        used=sorted({i for f in hand_faces for i in f}); remap={i:k for k,i in enumerate(used)}
        hp=[dp[i] for i in used]; hf=[tuple(remap[i] for i in f) for f in hand_faces]
        if len(hf)<100: raise RuntimeError('Empty or incomplete hand '+side)
        hands['skin-hand.'+side] = (hp,hf,[{'hand.'+side:1.} for _ in hp])
        pp,pf,pw=cut(points,faces,weights,plane,normal,False)
        offset=len(pp); pp+=dp; pw+=dw
        pf += [tuple(i+offset for i in f) for f in df if f[0] not in chosen]
        # Compact/weld the unchanged and clipped body surfaces together.
        lookup={}; compact=[]; cw=[]; remap={}
        for f in pf:
            for i in f:
                key=tuple(round(c,9) for c in pp[i])
                if key not in lookup: lookup[key]=len(compact);compact.append(pp[i]);cw.append(pw[i])
                remap[i]=lookup[key]
        points,faces,weights=compact,[tuple(remap[i] for i in f) for f in pf],cw
        evidence[side] = dict(wrist=list(wrist),normal=list(normal),plane=list(plane),
                              distalOffsetM=WRIST_OFFSET,opening='open',triangles=len(hf))
    return (points,faces,weights),hands,evidence


def derive(ob, rig_data, topic):
    if bpy.data.objects.get('skin-wire'): raise RuntimeError('Skin parts already derived')
    points,faces,weights = source_geometry(ob)
    # Native Blender coordinates are Z-up, whereas rig.json is glTF Y-up.
    joints = {j['name']:Vector((j['position'][0],-j['position'][2],j['position'][1])) for j in rig_data['joints']}
    outline,hands,evidence = split_geometry(points,faces,weights,joints)
    wire = create(ob,'skin-wire',points,faces,weights)
    # Weld only coincident panel borders. Keep the separate opposing shells.
    bm=bmesh.new(); bm.from_mesh(wire.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6)
    bm.to_mesh(wire.data); bm.free()
    bpy.context.view_layer.objects.active=wire
    dissolve=wire.modifiers.new('Preserve planar panels','DECIMATE'); dissolve.decimate_type='DISSOLVE'
    dissolve.angle_limit=math.radians(3); dissolve.use_dissolve_boundaries=False
    bpy.ops.object.modifier_apply(modifier=dissolve.name)
    wire.data.calc_loop_triangles(); planar_count=len(wire.data.loop_triangles)
    # Quadric error metrics preserve flat planes and allow redundant source seams.
    import subprocess
    from common import ROOT
    job=CACHE/f'{topic}-wire-simplify.json'
    save_json(job,dict(points=[list(v.co) for v in wire.data.vertices],faces=[list(t.vertices) for t in wire.data.loop_triangles]))
    subprocess.run(['node',str(ROOT/'wire_simplify.mjs'),str(job)],check=True)
    reduced=json.loads(job.read_text()); indices=reduced['indices']
    wire_points=[v.co.copy() for v in wire.data.vertices]
    used=sorted(set(indices)); remap={old:new for new,old in enumerate(used)}
    mesh=bpy.data.meshes.new('skin-wire-simplified')
    mesh.from_pydata([wire_points[i] for i in used],[],[tuple(remap[i] for i in indices[k:k+3]) for k in range(0,len(indices),3)])
    mesh.update(); wire.data=mesh
    for mat in ob.data.materials: mesh.materials.append(mat)
    wire.data.calc_loop_triangles(); tris=len(wire.data.loop_triangles)
    if not 3000<=tris<=5000: raise RuntimeError(f'Wire target missed: {tris}')
    # Re-sample the existing field on source triangles, rather than reclassify joints.
    tree=BVHTree.FromPolygons(points,faces,all_triangles=True)
    new_weights=[]; errors=[]
    for vertex in wire.data.vertices:
        nearest,_,index,distance=tree.find_nearest(vertex.co); errors.append(distance)
        a,b,c=faces[index]
        bary=barycentric_transform(nearest,points[a],points[b],points[c],Vector((1,0,0)),Vector((0,1,0)),Vector((0,0,1)))
        bary=[max(0.,v) for v in bary]; mass=sum(bary); bary=[v/mass for v in bary]
        w={n:sum(weights[i].get(n,0)*t for i,t in zip((a,b,c),bary)) for n in set().union(*(weights[i] for i in (a,b,c)))}
        entries=sorted(w.items(),key=lambda item:-item[1])[:4]; total=sum(v for _,v in entries)
        new_weights.append({n:v/total for n,v in entries if v>1e-9})
    from full_body import shell_aliases,match_shell_weights
    from skin_weights import repair,quantized_bind_points
    wp=quantized_bind_points([list(v.co) for v in wire.data.vertices]); wf=[tuple(t.vertices) for t in wire.data.loop_triangles]
    aliases=shell_aliases(wp,wf); match_shell_weights(new_weights,aliases)
    new_weights,_,repair_stats=repair(wp,wf,new_weights,{n:list(p) for n,p in joints.items()},shell_aliases=aliases)
    wire.vertex_groups.clear()
    for n in joints: wire.vertex_groups.new(name='joint.'+n)
    for i,w in enumerate(new_weights):
        for n,v in w.items(): wire.vertex_groups['joint.'+n].add([i],v,'REPLACE')
    wire['closed']=topology(wire.data,weld_positions=True)['closed']; wire.data['closed']=wire['closed']
    wire['renderIntent']='wireframe'; wire['includesHands']=True
    name=ob.name; ob.name='skin-outline-whole-template'
    body=create(ob,name,*outline)
    body['includesHands']=False; body['wristOpening']='open'
    hand_objects=[create(ob,n,*g) for n,g in hands.items()]
    for hand in hand_objects: hand['wristOpening']='open'; hand['rigidJoint']=hand.name.removeprefix('skin-')
    bpy.data.objects.remove(ob,do_unlink=True)
    stats=dict(skinNodes=SKIN_NODES,wristCuts=evidence,wireTriangles=tris,planarTriangles=planar_count,
               wireSourceDistanceMaxM=max(errors),wireWeightInterpolation='nearest source triangle barycentric, top four normalized; shell/outlier repair',wireWeightRepair=repair_stats)
    save_json(CACHE/f'{topic}-skin-parts.json',stats)
    repair_path=CACHE/f'{topic}-weight-repair.json'
    repairs=json.loads(repair_path.read_text())
    repairs['skin-wire']=repair_stats
    for side in ('l','r'): repairs['skin-hand.'+side]={'outliersFixed':0,'outlierIterations':0}
    save_json(repair_path,repairs)
    return [body,*hand_objects,wire]
