"""Native Blender path for manifest regions without an armature."""
import json
import sys
import subprocess
import bmesh
import numpy as np
import bpy
from mathutils import Vector
from common import CACHE, ROOT, clear_scene, import_system, object_info, matches, centroid, save_json, topology, surface_deviation
from centrelines import extract, project, dehook, geodesic_tube, resample, graph_geometry


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
            # Multi-segment tubes: each source segment's centreline before merging.
            segments=segment_centrelines(api,part,records) if part.get('segmentCentrelines') else None
            points,faces=api.merge_records(records)
            name=part['id']+('.'+side if side else '')
            filled=[]
            if part.get('fillOpenings'):points,faces,filled=fill_openings(points,faces,part['fillOpenings'])
            selected[name]=dict(part=part,side=side,points=points,faces=faces,sourceNames=[r['info']['name'] for r in records],filledOpenings=filled)
            if segments is not None:selected[name]['segments']=segments
    if manifest.get('landmarks'):api.LANDMARKS=landmarks(api,manifest['landmarks'])
    # Keep the wire target independent from opaque context, with the same source.
    wire=selected.pop('skin-wire',None)
    api.simplify_selection()
    finish(api,wire,centre,floor,top)


def _topic(v):
    """Source (x, -front, up) -> topic/GLB (x, up, front)."""
    return [float(v[0]),float(v[2]),float(-v[1])]


def _base(name):
    import re
    return re.sub(r'(?:\.[lr])?(?:\.\d+)?$','',name)


def _records(api,names):
    """Source records by exact name, or by base name when the wanted name has no side suffix."""
    out=[r for r in api.SOURCE.values() if r['info']['name'] in names or (_base(r['info']['name']) in names)]
    if not out:raise RuntimeError(f'No source records for {names}')
    return out


def _surface_centroid(records):
    """Area-weighted centroid of the source surfaces (independent of triangulation density)."""
    total=np.zeros(3);area=0.
    for r in records:
        p=np.asarray([tuple(v) for v in r['points']]);f=np.asarray(r['faces'])
        a,b,c=p[f[:,0]],p[f[:,1]],p[f[:,2]]
        w=np.linalg.norm(np.cross(b-a,c-a),axis=1)/2
        total+=((a+b+c)/3*w[:,None]).sum(0);area+=w.sum()
    return total/area


def _components(points,faces,minimum=60):
    """Connected pieces (welded positions) as (points, faces) pairs, largest first."""
    p=np.asarray(points,dtype=float)
    _,first,inverse=np.unique(np.round(p,7),axis=0,return_index=True,return_inverse=True)
    inverse=inverse.ravel();f=inverse[np.asarray(faces)];parent=np.arange(len(first))
    def root(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    for a,b,c in f:
        for x,y in ((a,b),(b,c)):
            rx,ry=root(x),root(y)
            if rx!=ry:parent[rx]=ry
    roots=np.asarray([root(i) for i in range(len(first))]);out=[]
    for r in np.unique(roots):
        keep=np.flatnonzero(roots==r)
        if len(keep)<minimum:continue
        remap=-np.ones(len(first),dtype=int);remap[keep]=np.arange(len(keep))
        ff=[tuple(remap[x] for x in face) for face in f if remap[face[0]]>=0]
        out.append(([tuple(v) for v in p[first][keep]],ff))
    return sorted(out,key=lambda c:-len(c[0]))


SEGMENT_STEP=.003  # fine enough to follow a 1.5 mm vessel round its bends; routes resample to 8 mm


def segment_centrelines(api,part,records):
    """Centreline of every source segment of a multi-segment tube, before merging.

    Each segment is oriented by the part's flow reference: `away` starts at the end
    nearer the reference (vessels leaving the heart, airways leaving the larynx),
    `toward` ends there (vessels returning to the heart). A ring-to-ring path that
    doubles back is replaced by a geodesic walk to the capped end; a segment made of
    unconnected pieces is traced piece by piece; one with no traceable piece falls back
    to its principal axis and is marked schematic.
    """
    spec=part['segmentCentrelines']
    heart=_surface_centroid(_records(api,spec['reference']))[None,:]
    out=[];offset=0
    for r in records:
        name=r['info']['name'];flow=spec.get('flowBySource',{}).get(name,spec['flow'])
        # Where distance to the heart cannot tell the ends apart (the descending aorta
        # starts and ends about equally far from it), the upstream neighbour does.
        upstream=spec.get('upstreamBySource',{}).get(name);downstream=spec.get('downstreamBySource',{}).get(name)
        neighbour=upstream or downstream
        ref=np.asarray([tuple(v) for q in _records(api,neighbour) for v in q['points']]) if neighbour else heart
        if neighbour:flow='away' if upstream else 'toward'
        pts=[tuple(v) for v in r['points']]
        kwargs={'upstream':ref,'step':SEGMENT_STEP} if flow=='away' else {'downstream':ref,'step':SEGMENT_STEP}
        path,meta=extract(pts,r['faces'],**kwargs)
        if path is not None and dehook(np.asarray(path))[1]>.01:
            # The ring-to-ring path doubled back (an open tributary mouth part-way along a
            # tube with a capped end): follow the tube from its end ring to the cap instead.
            path=geodesic_tube(pts,r['faces'],ref,SEGMENT_STEP)
            meta=dict(method='geodesic walk from the end ring to the capped end, local section centroids (ring-to-ring path doubled back)',
                      boundaryRings=meta.get('boundaryRings'),connectedFraction=1.,schematic=False)
        others=[]
        if path is None:
            # A segment made of several unconnected tube pieces (a trunk and its
            # branches modelled apart): trace each piece; the longest carries `_U`,
            # the others are kept for routes (`<source>#2`, `#3`, ... longest first).
            pieces=[]
            for cp,cf in _components(pts,r['faces']):
                pp,pm=extract(cp,cf,**kwargs)
                if pp is not None:pieces.append((float(np.linalg.norm(np.diff(pp,axis=0),axis=1).sum()),np.asarray(pp),pm))
            if pieces:
                pieces.sort(key=lambda x:-x[0])
                _,path,piece=pieces[0];others=[pp for _,pp,_ in pieces[1:]]
                meta=dict(piece,method='longest connected piece: '+piece['method'],pieces=len(pieces),wholeSegmentConnectedFraction=meta.get('connectedFraction'))
        if path is None:
            cloud=np.asarray(pts);c=cloud.mean(0);_,_,axes=np.linalg.svd(cloud-c,full_matrices=False)
            s=(cloud-c)@axes[0];a,b=c+axes[0]*np.percentile(s,2),c+axes[0]*np.percentile(s,98)
            path=resample(np.stack([a,b]),SEGMENT_STEP);meta=dict(meta,method='principal axis of the segment (fallback)',schematic=True)
        path=np.asarray(path);meta.pop('_vertexU',None)
        # Orientation by the flow reference, whichever extraction branch was taken.
        near=lambda q:float(np.min(np.linalg.norm(ref-q,axis=1)))
        orient=lambda q:q[::-1] if (near(q[0])>near(q[-1]))==(flow=='away') else q
        path=orient(path)
        if spec.get('schematic'):
            # Closed solids (the pharynx parts): sections of the wall, not a traced lumen.
            meta=dict(meta,schematic=True,method=meta['method']+' (closed solid: not a lumen)')
        out.append(dict(source=name,flow=flow,offset=offset,count=len(pts),path=path,meta=meta,others=[orient(q) for q in others]))
        print('SEGMENT CENTRELINE',part['id'],name,json.dumps({k:v for k,v in meta.items() if k in ('method','connectedFraction','schematic','boundaryRings')}),flush=True)
        offset+=len(pts)
    return out


def landmarks(api,specs):
    """Topic-coordinate landmarks measured on the source objects before merging (docs/40 §4.9 P2)."""
    segments={s['source']:s for r in api.SELECTED.values() for s in r.get('segments',[])}
    out={}
    def cloud(names):return np.asarray([tuple(v) for r in _records(api,names) for v in r['points']])
    for id,spec in specs.items():
        kind=spec['kind'];src=spec['sources']
        if kind=='centroid':p=_surface_centroid(_records(api,src))
        elif kind=='top':
            # Each dome: the highest band lateral to the midline (the central tendon sits lower, in between).
            c=cloud(src);c=c[(c[:,0]>.03) if spec['side']=='l' else (c[:,0]<-.03)];p=c[c[:,2]>c[:,2].max()-.005].mean(0)
        elif kind=='front':
            ps=[]
            for r in _records(api,src):
                c=np.asarray([tuple(v) for v in r['points']]);q=_surface_centroid([r]);q[0]=0;q[1]=c[:,1].min();ps.append(q)
            p=np.mean(ps,0)
        elif kind=='end':p=segments[src[0]]['path'][-1]
        elif kind=='opening':
            # A valve orifice: the open boundary ring of each chamber that faces the other one.
            ends=[]
            for a,b in ((src,spec['to']),(spec['to'],src)):
                ra=_records(api,a);pts=[tuple(v) for r in ra for v in r['points']];off=0;faces=[]
                for r in ra:faces+=[tuple(i+off for i in f) for f in r['faces']];off+=len(r['points'])
                p,_,_,loops,_=graph_geometry(pts,faces);other=cloud(b)
                ring=min((l for l in loops if len(l)>=6),key=lambda l:np.min(np.linalg.norm(other-p[l].mean(0),axis=1)))
                ends.append(p[ring].mean(0))
            p=np.mean(ends,0)
        elif kind=='between':
            a=_surface_centroid(_records(api,src));b=_surface_centroid(_records(api,spec['to']));p=a+(b-a)*spec['at']
        elif kind=='back':
            c=cloud(src);c=c[np.abs(c[:,0])<.012];p=c[c[:,1]>c[:,1].max()-.006].mean(0)
        elif kind in ('nostril','passage'):
            c=cloud(src);c=c[(c[:,0]>.002) if spec['side']=='l' else (c[:,0]<-.002)]
            if kind=='passage':p=c.mean(0)
            else:
                front=c[c[:,1]<c[:,1].min()+.004].mean(0)
                skin=np.asarray([tuple(v) for r in _records(api,[spec['skin']+'.'+spec['side']]) for v in r['points']])
                p=(front+skin[np.argmin(np.linalg.norm(skin-front,axis=1))])/2
        else:raise RuntimeError(f'Unknown landmark kind {kind}')
        out[id]=dict(kind=kind,sources=src,point=_topic(p))
    return out


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


def segment_stations(r,vertices):
    """Per-vertex `_U` of a multi-segment tube: station along the vertex's own source
    segment centreline (0 upstream), normalised over that segment's kept vertices."""
    used=np.asarray(r['sourceVertexIndices']);verts=np.asarray(vertices,dtype=float)
    starts=np.asarray([s['offset'] for s in r['segments']]);owner=np.searchsorted(starts,used,side='right')-1
    u=np.zeros(len(used))
    for i,s in enumerate(r['segments']):
        mask=owner==i
        if not mask.any():raise RuntimeError(f"Segment {s['source']} lost all vertices in simplification")
        raw=project(verts[mask],s['path']);lo,hi=float(raw.min()),float(raw.max())
        u[mask]=(raw-lo)/max(hi-lo,1e-9);s['uRange']=[lo,hi]
    return u


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
    paths={};stats=[];segments_out={}
    for name,r in selected.items():
        p=r['part'];ob=r['ob']
        if p['role']=='tube' and 'segments' in r:
            u=segment_stations(r,[v.co[:] for v in ob.data.vertices])
            attr=ob.data.attributes.new('_U','FLOAT','POINT');attr.data.foreach_set('value',u.astype(np.float32))
            for s in r['segments']:
                path=s['path'];steps=np.linalg.norm(np.diff(path,axis=0),axis=1)
                segments_out[s['source']]=dict(node=name,flow=s['flow'],sourceVertexRange=[s['offset'],s['offset']+s['count']],**{k:v for k,v in s['meta'].items() if k!='boundaryRingVertices'},
                    points=[[round(c,5) for c in _topic(v)] for v in path],lengthM=float(steps.sum()),sampleCount=len(path),maxStepM=float(steps.max()),surfaceURange=s['uRange'],
                    **({'otherPieces':[[[round(c,5) for c in _topic(v)] for v in q] for q in s['others']]} if s['others'] else {}))
        elif p['role']=='tube':
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
    if manifest.get('segmentCentrelines'):
        save_json(api.TOPIC/'centrelines.json',dict(units='m',up='+Y',front='+Z',left='+X',frame='topic-local; matches exported GLB world coordinates; add groundOffsetM to Y only when grounding',
            groundOffsetM=frame['groundOffsetM'],maxSampleSpacingM=SEGMENT_STEP,
            note='One centreline per source segment, extracted before merging; points run in the flow direction (airways from the larynx, arteries from the heart, veins to the heart). schematic=true: not a traced lumen (sections of a closed solid, or a principal-axis fallback). otherPieces: further unconnected tube pieces of the same source object, longest first (routes call them <source>#2, #3, ...); sourceVertexRange: the vertex range of the segment in the merged source mesh.',
            nodes={n:[s['source'] for s in r['segments']] for n,r in selected.items() if 'segments' in r},segments=segments_out))
        save_json(api.TOPIC/'landmarks.json',dict(units='m',frame='topic-local; matches exported GLB world coordinates',
            note='Measured on the source objects before merging (static_region.landmarks); see manifest.landmarks for each definition.',landmarks=api.LANDMARKS))
        export_glb(api,stats)
        return
    connections=[]
    available=[name for name in manifest['centrelineOrder'] if name in paths]
    for a,b in zip(available,available[1:]):
        start=paths[a]['points'][-1];end=paths[b]['points'][0];gap=float(np.linalg.norm(np.asarray(end)-start))
        missing=['ileum','caecum'] if a=='jejunum' and b=='ascending-colon' else []
        connections.append(dict(fromTube=a,toTube=b,fromPoint=start,toPoint=end,gapM=gap,missingBetween=missing,continuous=not missing and gap<=.008,requiresReview=bool(missing) or gap>.008))
    save_json(api.TOPIC/'centrelines.json',dict(units='m',up='+Y',front='+Z',left='+X',frame='topic-local; matches exported GLB world coordinates; add groundOffsetM to Y only when grounding',groundOffsetM=frame['groundOffsetM'],maxSampleSpacingM=.008,centrelineOrder=manifest['centrelineOrder'],connections=connections,foodRoute=[['pharynx','oesophagus','stomach','duodenum','jejunum'],dict(missing=['ileum','caecum']),['ascending-colon','transverse-colon','descending-colon','sigmoid-colon'],dict(missing=['rectum','anal-canal'])],missingOrgans=manifest['missingOrgans'],tubes=paths))
    export_glb(api,stats)


def export_glb(api,stats):
    selected=api.SELECTED
    save_json(CACHE/f'{api.TOPIC_NAME}-build-stats.json',stats)
    bpy.ops.object.select_all(action='DESELECT')
    for r in selected.values():r['ob'].select_set(True)
    bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/f'{api.TOPIC_NAME}-review.blend'))
    for r in selected.values():bpy.data.objects.remove(r['original'],do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=str(CACHE/f'{api.TOPIC_NAME}-raw.glb'),export_format='GLB',use_selection=True,export_yup=True,export_skins=False,export_attributes=True,export_extras=True,export_animations=False,export_apply=False,export_materials='EXPORT',export_texcoords=False,export_normals=True,export_cameras=False,export_lights=False)
