"""Independent decoded static geometry, surface, topology and centreline audit."""
import hashlib
from collections import deque
import json
import sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
from mathutils.kdtree import KDTree
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import CACHE,ROOT,save_json,topology,surface_deviation
from centrelines import graph_geometry,project,resample


def containment(points,faces,path):
    p,f,_,loops,_=graph_geometry(points,faces)
    pp=[Vector(v) for v in p];ff=[tuple(v) for v in f]
    # Virtual caps are audit-only. Never exported; source openings stay open.
    for loop in loops:
        cloud=p[loop];c=cloud.mean(0);_,_,axes=np.linalg.svd(cloud-c,full_matrices=False)
        delta=cloud-c;angles=np.arctan2(delta@axes[1],delta@axes[0]);order=np.asarray(loop)[angles.argsort()]
        ci=len(pp);pp.append(Vector(c))
        ff.extend((int(a),int(b),ci) for a,b in zip(order,np.roll(order,-1)))
    tree=BVHTree.FromPolygons(pp,ff,all_triangles=True)
    outside=[];clearances=[];window_samples=0;tri=np.asarray([[tuple(pp[i]) for i in face] for face in ff]);poly_fail=0
    for index,v in enumerate(path):
        v=np.asarray(v);distance=tree.find_nearest(Vector(v))[3];clearances.append(distance)
        if distance<.0003:continue
        tangent=path[min(index+1,len(path)-1)]-path[max(index-1,0)];tangent=tangent/np.linalg.norm(tangent)
        normal=np.cross(tangent,[0,0,1])
        if np.linalg.norm(normal)<.1:normal=np.cross(tangent,[1,0,0])
        normal/=np.linalg.norm(normal);binormal=np.cross(tangent,normal)
        # Section each triangle by the local normal plane. Point-in-each-loop
        # tests the outer envelope, so the hollow lumen is inside (ordinary
        # solid parity incorrectly calls a lumen outside its material wall).
        ds=(tri-v)@tangent
        mask=(ds.min(1)<-1e-9)&(ds.max(1)>1e-9);tt=tri[mask];dd=ds[mask]
        endpoints=[[] for _ in tt]
        for a,b in [(0,1),(1,2),(2,0)]:
            cross=(dd[:,a]*dd[:,b]<0)
            ix=np.flatnonzero(cross);t=dd[ix,a]/(dd[ix,a]-dd[ix,b])
            q=tt[ix,a]+t[:,None]*(tt[ix,b]-tt[ix,a])
            for i,point in zip(ix,q):endpoints[int(i)].append(point)
        adj={};positions={}
        for segment in endpoints:
            if len(segment)!=2:continue
            a,b=[tuple(np.round(q,6)) for q in segment]
            if a==b:continue
            adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
            positions[a]=np.asarray(a);positions[b]=np.asarray(b)
        seen=set();inside=False
        for start in adj:
            if start in seen:continue
            ordered=[];current=start;previous=None
            for _ in range(len(adj)+1):
                ordered.append(current);seen.add(current)
                options=[j for j in adj[current] if j!=previous]
                if not options:break
                nxt=next((j for j in options if j not in seen),options[0])
                previous,current=current,nxt
                if current==start:break
                if current in seen:break
            if current!=start or len(ordered)<3:continue
            cloud=np.asarray([positions[k]-v for k in ordered]);x=cloud@normal;y=cloud@binormal
            xx=np.roll(x,-1);yy=np.roll(y,-1)
            crossing=((y>0)!=(yy>0))&((x+(xx-x)*(-y)/(yy-y+1e-30))>0)
            if np.count_nonzero(crossing)%2:inside=True;break
            # These FBX tubes have intentional C-shaped wall windows near
            # their ends. A local outer convex envelope closes only that
            # exposed cross-section; it never modifies exported geometry.
            xy=sorted(set(zip(x.tolist(),y.tolist())))
            def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
            lower=[];upper=[]
            for q in xy:
                while len(lower)>=2 and cross(lower[-2],lower[-1],q)<=0:lower.pop()
                lower.append(q)
            for q in reversed(xy):
                while len(upper)>=2 and cross(upper[-2],upper[-1],q)<=0:upper.pop()
                upper.append(q)
            hull=lower[:-1]+upper[:-1]
            if len(hull)>=3 and all(cross(a,b,(0,0))>=-1e-10 for a,b in zip(hull,hull[1:]+hull[:1])):
                inside=True;window_samples+=1;break
        if not inside:outside.append(dict(index=index,distanceM=distance))
    crossings=[]
    raw_tree=BVHTree.FromPolygons([Vector(v) for v in points],faces,all_triangles=True)
    for i,(a,b) in enumerate(zip(path,path[1:])):
        delta=Vector(b-a);length=delta.length
        hit=raw_tree.ray_cast(Vector(a)+delta.normalized()*.00001,delta.normalized(),max(0,length-.00002))
        if hit[0] is not None:crossings.append(i)
    return dict(wallCrossingSegments=crossings,windowEnvelopeSamples=window_samples,testedPoints=len(path),outsideCount=len(outside),outside=outside,
                maxOutsideDistanceM=max([v['distanceM'] for v in outside],default=0),minWallDistanceM=min(clearances),virtualCapCount=len(loops),method='local section outer envelope; convex closure of partial source wall windows; no geometry repair')


def audit(topic='digestive',write_report=True):
    manifest=json.loads((ROOT/topic/'manifest.json').read_text());summary=json.loads((CACHE/f'{topic}-optimize-stats.json').read_text())
    paths=json.loads((ROOT/topic/'centrelines.json').read_text());clouds=json.loads((CACHE/f'{topic}-decoded.json').read_text())
    final_path=ROOT.parents[1]/'public/models'/manifest['output']
    if hashlib.sha256(final_path.read_bytes()).hexdigest()!=summary['sha256']:raise RuntimeError('Decoded audit is stale')
    bpy.ops.wm.open_mainfile(filepath=str(CACHE/f'{topic}-review.blend'))
    original={o.name.removesuffix('-before'):o for o in bpy.data.objects if o.type=='MESH' and o.name.endswith('-before')}
    rows=[];flags=[];warnings=[]
    for cloud in clouds:
        name=cloud['name'];ob=original[name];ob.data.calc_loop_triangles()
        before=[v.co.copy() for v in ob.data.vertices];faces=[tuple(t.vertices) for t in ob.data.loop_triangles]
        points=[Vector((v[0],-v[2],v[1])) for v in cloud['points']];ff=[tuple(v) for v in cloud['faces']]
        mesh=bpy.data.meshes.new('decoded-audit');mesh.from_pydata(points,[],ff);mesh.update()
        topo=topology(mesh,True);bpy.data.meshes.remove(mesh)
        old=topology(ob.data,True);dev=surface_deviation(before,faces,points,ff)
        allowance=manifest['budgets'][cloud['role']]['maxDeviationM']
        row=dict(name=name,role=cloud['role'],beforeTriangles=len(faces),triangles=len(ff),sampledHausdorffM=dev,budgetM=allowance,closedBefore=old['closed'],closedAfter=topo['closed'],boundaryEdges=topo['boundaryEdges'],nonmanifoldEdges=topo['nonmanifoldEdges'])
        if dev>allowance:flags.append(f'{name}: surface {dev:.6f} > {allowance}')
        if old['closed'] and topo['boundaryEdges']:flags.append(f'{name}: new boundary on closed source')
        if name in paths['tubes']:
            centre=paths['tubes'][name];path=np.asarray(centre['points']);u=np.asarray(cloud['u']);expected=project(cloud['points'],path)
            lo,hi=centre['surfaceURange'];expected=np.clip((expected-lo)/(hi-lo),0,1)
            # Independent float32 codec station projection; quantization may move
            # a vertex to an equidistant adjacent coil. Report any such ambiguity.
            du=np.abs(u-expected);row['uMaxProjectionError']=float(du.max())
            stations=np.r_[0,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))];stations/=stations[-1]
            stored=np.clip(u*(hi-lo)+lo,0,1);nearest=project(cloud['points'],path)
            at=lambda values:np.stack([np.interp(values,stations,path[:,a]) for a in range(3)],axis=1)
            points_array=np.asarray(cloud['points']);excess=np.linalg.norm(points_array-at(stored),axis=1)-np.linalg.norm(points_array-at(nearest),axis=1)
            row['uMaxSpatialProjectionExcessM']=float(excess.max())
            row['uAmbiguousCodecVertices']=int(((du>.01)&(excess<=.0001)).sum())
            row['uProjectionOutliers']=int(((du>.01)&(excess>.0001)).sum())
            if centre.get('uMethod')=='source-topology-station':
                pp,ff,adj,loops,inverse=graph_geometry(before,faces);h=np.full(len(pp),-1,dtype=int);q=deque(loops[0]);h[loops[0]]=0
                while q:
                    i=q.popleft()
                    for j in adj[i]:
                        if h[j]<0:h[j]=h[i]+1;q.append(j)
                cc=np.asarray([pp[h==i].mean(0) for i in range(h.max()+1)])
                station=np.r_[0,np.cumsum(np.linalg.norm(np.diff(cc,axis=0),axis=1))];station/=station[-1]
                start=np.asarray([path[0,0],-path[0,2],path[0,1]])
                if np.linalg.norm(cc[-1]-start)<np.linalg.norm(cc[0]-start):station=1-station
                vertex_u=station[h][inverse];tree=BVHTree.FromPolygons(before,faces,all_triangles=True);reference=[]
                for point in points:
                    nearest,_,fi,_=tree.find_nearest(point);aa,bb,ccc=faces[fi]
                    value=barycentric_transform(nearest,before[aa],before[bb],before[ccc],Vector((vertex_u[aa],0,0)),Vector((vertex_u[bb],0,0)),Vector((vertex_u[ccc],0,0))).x
                    reference.append(value)
                delta=np.abs(u-np.asarray(reference));row['uSourceTopologyMaxError']=float(delta.max())
                # At a source self-overlap, nearest-surface lookup can return
                # the other coil. Accept only when a source vertex carrying the
                # decoded station independently exists within 0.2 mm.
                kd=KDTree(len(before))
                for i,v in enumerate(before):kd.insert(v,i)
                kd.balance();ambiguous=[];bad=[]
                for i in np.flatnonzero(delta>.005):
                    candidates=kd.find_range(points[int(i)],.0002)
                    if any(abs(float(u[i])-float(vertex_u[j]))<.005 for _,j,_ in candidates):ambiguous.append(int(i))
                    else:bad.append(int(i))
                row['uSourceTopologyAmbiguousVertices']=len(ambiguous);row['uProjectionOutliers']=len(bad)
                row['uAuditMethod']='independent source-ring station; nearest source triangle barycentric interpolation'
            row['uRange']=[float(u.min()),float(u.max())]
            dense=resample(path,.002);native=np.stack((dense[:,0],-dense[:,2],dense[:,1]),axis=1)
            inside=containment(before,faces,native);row['centrelineContainment']=inside
            if not centre.get('schematic') and inside['maxOutsideDistanceM']>.0015:flags.append(f'{name}: centreline exits source by {inside["maxOutsideDistanceM"]*1000:.2f} mm')
            if inside['wallCrossingSegments'] and centre.get('sourceSectionCount'):
                # Independently prove whether the *unresampled exact source
                # ring centres* also cross a different part of the source wall.
                pp,ff,adj,loops,_=graph_geometry(before,faces);h=np.full(len(pp),-1,dtype=int);q=deque(loops[0]);h[loops[0]]=0
                while q:
                    i=q.popleft()
                    for j in adj[i]:
                        if h[j]<0:h[j]=h[i]+1;q.append(j)
                centers=np.asarray([pp[h==i].mean(0) for i in range(h.max()+1)])
                tree=BVHTree.FromPolygons([Vector(v) for v in pp],[tuple(v) for v in ff],all_triangles=True);proof=[]
                for i,(a,b) in enumerate(zip(centers,centers[1:])):
                    delta=Vector(b-a);hit=tree.ray_cast(Vector(a)+delta.normalized()*.000001,delta.normalized(),max(0,delta.length-.000002))
                    if hit[0] is not None:
                        face_h=h[ff[hit[2]]]
                        if min(abs(face_h-i))>2:proof.append(dict(sourceRing=i,intersectedSourceRings=[int(v) for v in face_h],point=[float(v) for v in hit[0]]))
                known=[]
                for i in inside['wallCrossingSegments']:
                    mid=(native[i]+native[i+1])/2
                    if any(np.linalg.norm(mid-np.asarray(e['point']))<.006 for e in proof):known.append(i)
                inside['sourceOverlapCrossingSegments']=known
                inside['unexplainedWallCrossingSegments']=[i for i in inside['wallCrossingSegments'] if i not in known]
                inside['sourceOverlapProof']=proof
                if known:
                    warnings.append(f'{name}: {len(known)} flow segments cross overlapping source walls; exact original section centres independently reproduce the defect')
                    centre['quality']='source-overlap-review'
                    centre['sourceOverlapCrossings']=[dict(auditSampleSegment=i,u=float(np.linalg.norm(np.diff(dense[:i+2],axis=0),axis=1).sum()/centre['lengthM']),arcLengthM=float(np.linalg.norm(np.diff(dense[:i+2],axis=0),axis=1).sum()),point=((dense[i]+dense[i+1])/2).tolist()) for i in known]
                if inside['unexplainedWallCrossingSegments']:flags.append(f'{name}: unexplained centreline wall crossings')
            elif inside['wallCrossingSegments']:flags.append(f'{name}: centreline intersects source wall in {len(inside["wallCrossingSegments"])} segments')
            if row['uProjectionOutliers']:flags.append(f'{name}: _U projection drift at {row["uProjectionOutliers"]} vertices')
            centre['containmentAudit']={k:v for k,v in inside.items() if k not in ('outside','sourceOverlapProof')}
        rows.append(row);print('STATIC AUDIT',name,json.dumps(row),flush=True)
    names=[c['name'] for c in clouds]
    if set(names)!=set(manifest['expectedNodes']) or len(names)!=len(set(names)):flags.append('Node allowlist mismatch')
    for key,limit in [('bytes',4000000),('triangles',350000)]:
        if summary[key]>limit:flags.append(f'Soft budget exceeded: {key}')
    result=dict(sha256=summary['sha256'],bytes=summary['bytes'],triangles=summary['triangles'],nodes=names,flags=flags,warnings=warnings,meshes=rows,
        skipped=['rig','weights','fibres','attachments'],sourceMissing=manifest['missingOrgans'])
    save_json(CACHE/f'{topic}-static-audit.json',result);save_json(ROOT/topic/'centrelines.json',paths)
    if write_report:
        lines=['# Digestive region — round 10','',f"Published: `public/models/{manifest['output']}`. **{summary['bytes']:,} bytes / {summary['triangles']:,} triangles / {summary['nodeCount']} nodes / {summary['drawCalls']} draws.**",'',f"SHA-256: `{summary['sha256']}`",'',
            'Static native Blender meshes, no armature, JOINTS, WEIGHTS, fibres or attachment sites. Every tube carries float32 `_U` (0 upstream, 1 downstream). Mesh/node extras retain role, layer, bodySystem, source labels and section-cap intent (`closed`); source topology is recorded separately.',
            '', '## Audit', '', '**'+('PASS mesh gates; FLOW REVIEW REQUIRED' if not flags and warnings else 'PASS' if not flags else 'FAIL')+'** — '+('; '.join(flags) if flags else 'node allowlist, finite attributes, source scale/floor/sides, codec roundtrip, soft/hard budgets, sampled surface deviation, topology and tube station projection.'),'',
            'Surface errors sample both directions with referenced vertices plus 6,000 area-weighted triangle points each direction. These are sampled estimates. No section filling or repairs to source openings. Closed sources may not acquire new boundary edges. Centreline containment uses 2 mm sampling, audit-only caps over open rings, and local convex section envelopes at intentional C-shaped wall windows; 1.5 mm exit tolerance. Separate ray-segment checks detect path intersections with actual source walls. Codec `_U` nearest-segment ties permit at most 0.1 mm extra spatial projection error. Jejunal `_U` is independently checked against source-ring stations by source-triangle interpolation; at overlapping coils, a matching original station vertex must exist within 0.2 mm. Nearest-centreline projection is intentionally not the jejunal station authority. This is a mesh check, not anatomical validation.','',
            'Flow review: '+(' **'+'; '.join(warnings)+'**' if warnings else 'no source wall crossings.'), '',
            '| Mesh | Role | Source tris | Decoded tris | Sample error mm | Limit mm | Closed before/after | Boundaries |','|---|---|---:|---:|---:|---:|---|---:|']
        for r in rows:lines.append(f"| {r['name']} | {r['role']} | {r['beforeTriangles']:,} | {r['triangles']:,} | {r['sampledHausdorffM']*1000:.3f} | {r['budgetM']*1000:.1f} | {r['closedBefore']}/{r['closedAfter']} | {r['boundaryEdges']} |")
        lines+=['','## Tube centrelines','','Coordinates match GLB world coordinates: metres, +Y up, +Z anterior, +X anatomical left. Topic origin is the midline umbilicus. `organs.json` records the exact source centre, floor and ground offset. Add `groundOffsetM` only when grounding both model and paths. `centrelines.json` is the flow hand-off; points are spaced at most 8 mm. Each polyline runs upstream to downstream. Appendix is a blind side branch, not part of the food route.','',
            '| Tube | Method | Points | Length m | Schematic | Max exit mm | _U audit outliers |','|---|---|---:|---:|---|---:|---:|']
        for r in rows:
            if r['name'] in paths['tubes']:
                c=paths['tubes'][r['name']];lines.append(f"| {r['name']} | {c['method']} | {c['sampleCount']} | {c['lengthM']:.4f} | {c['schematic']} | {c['containmentAudit']['maxOutsideDistanceM']*1000:.3f} | {r['uProjectionOutliers']} |")
        lines+=['','## Available-source endpoint gaps','','These are extraction endpoints, not a continuous food path. Paths are inset at partial wall lips. Content must review and bridge only anatomically supported gaps; missing segments remain explicit breaks.','', '| From | To | Gap mm | Missing between |','|---|---|---:|---|']
        for e in paths.get('connections',[]):lines.append(f"| {e['fromTube']} | {e['toTube']} | {e['gapM']*1000:.2f} | {', '.join(e['missingBetween']) or '—'} |")
        lines+=['','## Source gaps and grouping','','- No separately named **ileum, caecum, rectum, anal canal/anus** in either new FBX or existing anatomy inventory. Omitted; never substituted with urinary/reproductive structures or invented geometry. The sigmoid source reaches the pelvic outlet; its label is retained rather than relabelling an inferred rectum.',
            '- **Jejunum is a connected coiled tube**, with two 12-vertex end rings, not a lumped mass. Exact 12-vertex source section rings trace its actual connectivity (1,153 source sections). The source is only about 2 m along this derived path; do not use mesh length as physiological intestine length or call this a separately identified ileum.',
            '- Exact jejunal source ring centres independently cross neighbouring source walls at tight folds. `sourceOverlapCrossings` records the affected flow locations in topic coordinates. This is a source self-overlap defect, not a lumped mass or a schematic path. Do not claim an unobstructed lumen at those stations; clipping/flow presentation needs review.',
            '- Pharynx combines oropharynx and laryngopharynx; nasopharynx excluded from the food route. Salivary glands combine three real glands per side. Teeth are merged by jaw: **28 source teeth**, no third molars.',
            '- Lungs merge five visceral lung lobes. Heart merges four cardiovascular chamber surfaces; no single Heart source. Skeleton merges skull/jaw, thorax, spine/pelvis and limb bones into one context mesh; superficial muscles merge selected real bilateral meshes. Full source labels are in manifest and GLB extras.',
            '- Skin outline and 3–5k wire keep whole static hands; the muscle topics’ articulated wrist split is unnecessary here. Skin context permits 35 mm sampled deviation. Opaque outline is higher detail than wire.',
            '- Source oesophagus and colon have partial C-shaped wall windows near their ends. Section-envelope containment includes the exposed lumen; it does not claim these source windows are physically sealed. End paths are inset from oblique wall lips to avoid crossing tissue.',
            '- Missing segments leave gaps: content must not silently join a continuous mouth-to-anus path. Neighbour endpoints and gaps are reported in the centreline hand-off. Procedural close-ups and flow rendering remain content/engine work.',
            '', '## Provenance','','Local cached FBX only; no downloads. [New source inventory](inventory.md) lists every object, triangles and welded closedness, including helpers (not exported). Source file hashes match `cache/SHA256SUMS.txt`. Model copyright survives compression. Cached source attribution follows Z-Anatomy / BodyParts3D; organ-by-organ upstream licence verification remains a publication review item.',
            '', '## Nodes','', '```text',*names,'```','', '## Reproduce','','```sh','python3 scripts/anatomy/manifests.py --topic digestive','python3 scripts/anatomy/run.py --topic digestive','```','', 'Previews and visual inspection: [preview-review.md](preview-review.md).']
        (ROOT/topic/'report.md').write_text('\n'.join(lines)+'\n')
    return result

if __name__=='__main__':
    result=audit();raise SystemExit(bool(result['flags']))
