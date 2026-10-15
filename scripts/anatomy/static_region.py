"""Native Blender path for manifest regions without an armature."""
import json
import sys
import subprocess
import bmesh
import numpy as np
import bpy
from mathutils import Vector
from common import CACHE, ROOT, clear_scene, import_system, object_info, matches, centroid, save_json, topology, surface_deviation
from centrelines import extract, project


def build(api):
    manifest=api.MANIFEST;selected=api.SELECTED
    for system in sorted({p['system'] for p in manifest['parts']}):
        clear_scene()
        for ob in import_system(system):
            if ob.type!='MESH' or not ob.data.polygons:continue
            info=object_info(ob,system)
            if any(matches(p,info) for p in manifest['parts']):api.SOURCE[(system,ob.name)]=api.source_record(ob,system)
        print('STATIC SOURCE',system,flush=True)
    clear_scene()
    skin=[r for (system,_),r in api.SOURCE.items() if system=='regions']
    umbilicus=[r for r in skin if r['info']['name'].startswith('Umbilicus.')]
    centre=centroid([v for r in umbilicus for v in r['points']]);centre.x=0
    floor=min(v.z for r in skin for v in r['points']);top=max(v.z for r in skin for v in r['points'])
    if not 1.4<top-floor<2.2: raise RuntimeError('Source stature outside metre range')
    for r in api.SOURCE.values():
        for v in r['points']:v-=centre
    for part in manifest['parts']:
        for side in ['l','r'] if part['sides']=='bilateral' else [None]:
            records=[r for r in api.SOURCE.values() if matches(part,r['info'],side)]
            if len(records)<part['minimumObjects']: raise RuntimeError(f"Missing {part['id']}.{side}")
            points,faces=api.merge_records(records)
            name=part['id']+('.'+side if side else '')
            filled=[]
            if part.get('fillOpenings'):points,faces,filled=fill_openings(points,faces,part['fillOpenings'])
            selected[name]=dict(part=part,side=side,points=points,faces=faces,sourceNames=[r['info']['name'] for r in records],filledOpenings=filled)
    # Keep the wire target independent from opaque context, with the same source.
    wire=selected.pop('skin-wire',None)
    api.simplify_selection()
    finish(api,wire,centre,floor,top)


def _ordered_loops(faces):
    """Boundary loops as ordered vertex lists, walked along the faces' own edge direction."""
    count={}
    for f in faces:
        for a,b in ((f[0],f[1]),(f[1],f[2]),(f[2],f[0])):
            k=(min(a,b),max(a,b));count[k]=count.get(k,0)+1
    nxt={}
    for f in faces:
        for a,b in ((f[0],f[1]),(f[1],f[2]),(f[2],f[0])):
            if count[(min(a,b),max(a,b))]==1:nxt[a]=b
    loops=[];seen=set()
    for start in nxt:
        if start in seen:continue
        loop=[start];seen.add(start);cur=nxt[start]
        while cur!=start and cur not in seen and cur in nxt:
            loop.append(cur);seen.add(cur);cur=nxt[cur]
        loops.append(loop)
    return loops


def fill_openings(points,faces,specs):
    """Close named source openings (a display window cut in a wall) with a smooth patch.

    The opening nearest `near` (topic coordinates: metres, +Y up, +Z front,
    centred like the export) within `maxRadiusM` is filled with concentric rings
    whose interior vertices solve a bi-harmonic system against the opening and the
    wall's first ring of vertices outside it, so the patch continues the wall's
    curvature instead of spanning it flat. Coincident vertices are welded first.
    """
    pts=np.asarray([tuple(v) for v in points],dtype=float)
    _,first,inverse=np.unique(np.round(pts,7),axis=0,return_index=True,return_inverse=True)
    inverse=inverse.ravel();pts=pts[first]
    tris=[tuple(int(inverse[i]) for i in f) for f in faces]
    tris=[f for f in tris if len(set(f))==3]
    report=[]
    for spec in specs:
        x,y,z=spec['near'];near=np.array([x,-z,y])  # topic (x, up, front) -> source (x, -front, up)
        loops=_ordered_loops(tris)
        best=min(loops,key=lambda l:np.linalg.norm(pts[l].mean(0)-near))
        centre=pts[best].mean(0)
        if np.linalg.norm(centre-near)>spec['maxRadiusM']:raise RuntimeError(f"fillOpenings: no opening within {spec['maxRadiusM']} m of {spec['near']}")
        n=len(best);ring_r=float(np.linalg.norm(pts[best]-centre,axis=1).mean())
        edge=float(np.mean(np.linalg.norm(pts[best]-pts[np.roll(best,-1)],axis=1)))
        k=max(3,int(round(ring_r/max(edge,1e-4))))
        # Interior rings shrink in vertex count towards a centre vertex.
        counts=[n]+[max(6,int(round(n*(1-j/k)))) for j in range(1,k)]
        base=len(pts);new=[];rings=[list(best)]
        outline=pts[best];closed=np.vstack([outline,outline[:1]])
        seg=np.linalg.norm(np.diff(closed,axis=0),axis=1);station=np.r_[0,np.cumsum(seg)]/seg.sum()
        for j in range(1,k):
            t=(np.arange(counts[j])+.5)/counts[j]
            ring=np.stack([np.interp(t,station,closed[:,a]) for a in range(3)],axis=1)
            ring=ring+(centre-ring)*(j/k)
            ids=list(range(base+len(new),base+len(new)+len(ring)));new.extend(ring);rings.append(ids)
        centre_id=base+len(new);new.append(centre.copy())
        allp=np.vstack([pts,np.asarray(new)])
        patch=[]
        def strip(outer,inner):
            # Walk two rings by their angular parameter; the outer ring runs along the
            # boundary's own direction, so (b, a, c) faces the wall's outside.
            a_n,b_n=len(outer),len(inner);i=j=0
            while i<a_n or j<b_n:
                ta=(i+1)/a_n if i<a_n else 9;tb=(j+.5+1)/b_n if j<b_n else 9
                if ta<=tb:patch.append((outer[(i+1)%a_n],outer[i%a_n],inner[j%b_n]));i+=1
                else:patch.append((inner[(j+1)%b_n],outer[i%a_n],inner[j%b_n]));j+=1
        for j in range(len(rings)-1):strip(rings[j],rings[j+1])
        last=rings[-1]
        for i in range(len(last)):patch.append((last[(i+1)%len(last)],last[i],centre_id))
        # Bi-harmonic interior: minimise |L x|^2 over patch and opening vertices,
        # holding the opening and the wall ring just outside it fixed.
        nbr={}
        def link(a,b):nbr.setdefault(a,set()).add(b);nbr.setdefault(b,set()).add(a)
        for f in tris+patch:
            for a,b in ((f[0],f[1]),(f[1],f[2]),(f[2],f[0])):link(a,b)
        unknown=list(range(base,len(allp)));uidx={v:i for i,v in enumerate(unknown)}
        rows=list(best)+unknown
        A=np.zeros((len(rows),len(unknown)));B=np.zeros((len(rows),3))
        for r,v in enumerate(rows):
            w=1./len(nbr[v])
            terms=[(v,1.)]+[(u,-w) for u in nbr[v]]
            for u,c in terms:
                if u in uidx:A[r,uidx[u]]+=c
                else:B[r]-=c*allp[u]
        sol,*_=np.linalg.lstsq(A,B,rcond=None)
        allp[base:]=sol
        # Keep the patch facing outwards like the wall around it.
        normals=np.cross(allp[[f[1] for f in patch]]-allp[[f[0] for f in patch]],allp[[f[2] for f in patch]]-allp[[f[0] for f in patch]])
        wall=[f for f in tris if any(v in best for v in f)]
        wn=np.cross(allp[[f[1] for f in wall]]-allp[[f[0] for f in wall]],allp[[f[2] for f in wall]]-allp[[f[0] for f in wall]]).sum(0)
        if np.dot(normals.sum(0),wn)<0:patch=[(f[0],f[2],f[1]) for f in patch]
        pts=allp;tris=tris+patch
        report.append(dict(near=spec['near'],reason=spec.get('reason'),openingVertices=n,openingRadiusM=ring_r,rings=k,addedVertices=len(new),addedTriangles=len(patch)))
        print('FILL OPENING',json.dumps(report[-1]),flush=True)
    return [Vector(v) for v in pts],tris,report


def finish(api,wire,centre,floor,top):
    manifest=api.MANIFEST;selected=api.SELECTED
    if wire:
        original=api.make_mesh('skin-wire-before',wire['points'],wire['faces']);original.hide_render=True
        ob=api.make_mesh('skin-wire',wire['points'],wire['faces'])
        bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6);bm.to_mesh(ob.data);bm.free()
        bpy.context.view_layer.objects.active=ob
        dissolve=ob.modifiers.new('Planar panels','DECIMATE');dissolve.decimate_type='DISSOLVE';dissolve.angle_limit=np.deg2rad(3)
        bpy.ops.object.modifier_apply(modifier=dissolve.name)
        ob.data.calc_loop_triangles()
        job=CACHE/f'{api.TOPIC_NAME}-wire-simplify.json'
        save_json(job,dict(points=[list(v.co) for v in ob.data.vertices],faces=[list(t.vertices) for t in ob.data.loop_triangles]))
        subprocess.run(['node',str(ROOT/'wire_simplify.mjs'),str(job)],check=True)
        indices=json.loads(job.read_text())['indices'];points=[v.co.copy() for v in ob.data.vertices]
        used=sorted(set(indices));remap={old:new for new,old in enumerate(used)}
        mesh=bpy.data.meshes.new('skin-wire');mesh.from_pydata([points[i] for i in used],[],[tuple(remap[i] for i in indices[k:k+3]) for k in range(0,len(indices),3)]);mesh.update();ob.data=mesh
        wire.update(ob=ob,original=original,simplifierErrorM=None,sampleDeviationM=surface_deviation(wire['points'],wire['faces'],[v.co.copy() for v in ob.data.vertices],[tuple(f.vertices) for f in ob.data.polygons]))
        if not 3000<=len(ob.data.polygons)<=5000:raise RuntimeError('skin-wire triangle range')
        selected['skin-wire']=wire
    paths={};stats=[]
    for name,r in selected.items():
        p=r['part'];ob=r['ob']
        if p['role']=='tube':
            spec=p['centreline']
            def ref(id):return selected[id]['points'] if id in selected else None
            path,meta=extract(r['points'],r['faces'],ref(spec.get('from')),ref(spec.get('to')))
            if path is None: raise RuntimeError(f'{name} requires an explicit schematic: {meta}')
            path=np.asarray(path)
            source_u=meta.pop('_vertexU',None)
            u=(np.asarray(source_u)[r['sourceVertexIndices']] if source_u is not None
               else project([v.co[:] for v in ob.data.vertices],path))
            # Normalize surface range, preserving monotone station direction.
            lo,hi=float(u.min()),float(u.max());u=(u-lo)/(hi-lo)
            attr=ob.data.attributes.new('_U','FLOAT','POINT');attr.data.foreach_set('value',u.astype(np.float32))
            paths[name]=dict(id=name,**meta,**{'from':spec.get('from'),'to':spec.get('to')},points=[[float(v[0]),float(v[2]),float(-v[1])] for v in path],
                lengthM=float(np.linalg.norm(np.diff(path,axis=0),axis=1).sum()),sampleCount=len(path),maxStepM=float(np.linalg.norm(np.diff(path,axis=0),axis=1).max()),surfaceURange=[lo,hi])
            print('CENTRELINE',name,json.dumps({k:v for k,v in paths[name].items() if k!='points'}),flush=True)
        ob['role']=p['role'];ob['layer']=p['layer'];ob['bodySystem']=p['bodySystem'];ob['closed']=p['closed'];ob['sourceClosed']=p['sourceClosed'];ob['partId']=p['id'];ob['sourceNodes']=json.dumps(r['sourceNames'])
        if name=='skin-wire':ob['renderIntent']='wireframe';ob['sourceNode']='skin-outline';ob['includesHands']=True
        ob.data['closed']=ob['closed']
        mat=bpy.data.materials.new('anatomy-'+name);mat.diffuse_color={'tube':(.55,.32,.28,1),'organ':(.5,.32,.24,1),'system':(.65,.64,.55,1),'skin':(.64,.61,.55,.12)}[p['role']]
        mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=mat.diffuse_color;bsdf.inputs['Roughness'].default_value=.8
        if p['role']=='skin':bsdf.inputs['Alpha'].default_value=.12;mat.surface_render_method='DITHERED'
        ob.data.materials.clear();ob.data.materials.append(mat)
        ob.data.validate()
        for f in ob.data.polygons:f.use_smooth=True
        stats.append(dict(name=name,role=p['role'],sourceNames=r['sourceNames'],beforeTriangles=len(r['faces']),afterTriangles=len(ob.data.polygons),sampleDeviationM=r['sampleDeviationM'],maxDeviationM=manifest['budgets'][p['role']]['maxDeviationM'],closedBefore=topology(r['original'].data,True),closedAfter=topology(ob.data,True)))
    frame=dict(units='m',coordinates=dict(up='+Y',front='+Z',left='+X'),sourceCentre=list(centre),floorY=floor-centre.z,statureM=top-floor,sourceFloorM=floor,
        transform='(x,y,z) -> (x-centre.x, z-centre.z, -(y-centre.y)); apply -floorY only when grounding',groundOffsetM=centre.z-floor,
        rig=False,sourceMissing=manifest['missingOrgans'])
    save_json(api.TOPIC/'organs.json',frame)
    connections=[]
    available=[name for name in manifest['centrelineOrder'] if name in paths]
    for a,b in zip(available,available[1:]):
        start=paths[a]['points'][-1];end=paths[b]['points'][0];gap=float(np.linalg.norm(np.asarray(end)-start))
        missing=['ileum','caecum'] if a=='jejunum' and b=='ascending-colon' else []
        connections.append(dict(fromTube=a,toTube=b,fromPoint=start,toPoint=end,gapM=gap,missingBetween=missing,continuous=not missing and gap<=.008,requiresReview=bool(missing) or gap>.008))
    save_json(api.TOPIC/'centrelines.json',dict(units='m',up='+Y',front='+Z',left='+X',frame='topic-local; matches exported GLB world coordinates; add groundOffsetM to Y only when grounding',groundOffsetM=frame['groundOffsetM'],maxSampleSpacingM=.008,centrelineOrder=manifest['centrelineOrder'],connections=connections,foodRoute=[['pharynx','oesophagus','stomach','duodenum','jejunum'],dict(missing=['ileum','caecum']),['ascending-colon','transverse-colon','descending-colon','sigmoid-colon'],dict(missing=['rectum','anal-canal'])],missingOrgans=manifest['missingOrgans'],tubes=paths))
    save_json(CACHE/f'{api.TOPIC_NAME}-build-stats.json',stats)
    bpy.ops.object.select_all(action='DESELECT')
    for r in selected.values():r['ob'].select_set(True)
    bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/f'{api.TOPIC_NAME}-review.blend'))
    for r in selected.values():bpy.data.objects.remove(r['original'],do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=str(CACHE/f'{api.TOPIC_NAME}-raw.glb'),export_format='GLB',use_selection=True,export_yup=True,export_skins=False,export_attributes=True,export_extras=True,export_animations=False,export_apply=False,export_materials='EXPORT',export_texcoords=False,export_normals=True,export_cameras=False,export_lights=False)
