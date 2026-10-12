"""Region-specific frames, landmark rigs, widened skin blends and review text.

Every topic uses these landmark joint paths, including unexported bones.
All reference surfaces are real cached structures, never mirrored or exported as helpers.
"""
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector, Quaternion
from common import ROOT, CACHE, matches, base_name, centroid, save_json


def bone_records(build, ids, side):
    records=[]
    for id in ids:
        part=next((p for p in build.MANIFEST['parts']+build.MANIFEST.get('referenceParts',[]) if p['id']==id),None)
        if not part: continue
        key=id+('.'+side if side and part.get('sides','bilateral')=='bilateral' else '')
        if key in build.SELECTED:
            records.append(build.SELECTED[key])
        else:
            records.extend(r for r in build.SOURCE.values() if matches(part,r['info'],side if part.get('sides','bilateral')=='bilateral' else None))
    return records


def select_and_transform(build):
    source=build.SOURCE
    frame_ids={'back':['thoracic-spine','lumbar-spine'],'shoulders':['clavicle'],'arms':['humerus'],'legs':['pelvis'],'core':['lumbar-spine']}
    reference=bone_records(build,frame_ids[build.TOPIC_NAME],None)
    centre=centroid([v for r in reference for v in r['points']]);centre.x=0
    floor=min(v.z for r in source.values() if r['info']['system']=='regions' for v in r['points'])
    for r in source.values():
        for v in r['points']: v-=centre
        if r['info']['sideSource']=='centroid-x':
            x=centroid(r['points']).x;r['info']['side']='l' if x>.005 else 'r' if x<-.005 else None
    for p in build.MANIFEST['parts']:
        for side in ['l','r'] if p['sides']=='bilateral' else [None]:
            records=[r for r in source.values() if matches(p,r['info'],side)]
            if len(records)<p.get('minimumObjects',1): raise RuntimeError(f'Missing {p["id"]}.{side}')
            points,faces=build.merge_records(records)
            name=p['id']+('.'+side if side else '')
            build.SELECTED[name]=dict(part=p,side=side,points=points,faces=faces,sourceNames=[r['info']['name'] for r in records])
    clavicle=centroid([p for r in bone_records(build,['clavicle'],'l') for p in r['points']])
    sternum=centroid([p for r in bone_records(build,['sternum'],None) for p in r['points']])
    spine=centroid([p for r in bone_records(build,['thoracic-spine'],None) for p in r['points']])
    stature=max(v.z for r in source.values() if r['info']['system']=='regions' for v in r['points'])-(floor-centre.z)
    check=dict(unit='m',up='+Y',front='+Z',left='+X',sourceCentre=list(centre),sourceChestCentre=list(centre),floorY=floor-centre.z,
               sternum=list(build.target(sternum)),leftClavicle=list(build.target(clavicle)),thoracicSpine=list(build.target(spine)),
               leftPositiveX=clavicle.x>0,sternumAnteriorPositiveZ=sternum.y<spine.y,statureM=stature)
    if not check['leftPositiveX'] or not check['sternumAnteriorPositiveZ'] or not 1.4<stature<2.2: raise RuntimeError('Regional frame failed')
    bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
    print('COORDINATE CHECK '+json.dumps(check),flush=True)
    return centre,floor,check


def make_rig(build, centre, floor, check):
    joints=[dict(name='trunk',position=Vector(),parent=None,source='region frame')]
    requested=set(build.MANIFEST['jointNames'])
    fits={}
    def points(id,side): return [v for r in bone_records(build,[id],side) for v in r['points']]
    def landmark(owner,side):
        p=build.landmark(owner,side)
        if p is None: raise RuntimeError(f'Missing joint landmark: {owner}.{side}')
        return p
    def add(name,side,p,parent,source,**extra):
        key=name+'.'+side
        if key in requested: joints.append(dict(name=key,position=p,parent=parent,source=source,**extra))
    for side in ['l','r']:
        if any(kind+'.'+side in requested for kind in ('clavicle','scapula','shoulder','elbow','forearm','hand')):
            clavicle=points('clavicle',side)
            inner=min(abs(p.x) for p in clavicle);outer=max(abs(p.x) for p in clavicle)
            sc=centroid([p for p in clavicle if abs(p.x)<inner+.012])
            ac=centroid([p for p in clavicle if abs(p.x)>outer-.012])
            glenoid=landmark('Glenoid fossa',side)
            head=landmark('Head of humerus',side)
            patch=[p for p in points('humerus',side) if (p-head).length<.022]
            shoulder=build.sphere_fit(patch)
            elbow=(landmark('Medial epicondyle of humerus',side)+landmark('Lateral epicondyle of humerus',side))/2
            wrist=(landmark('Radial styloid process',side)+landmark('Ulnar styloid process',side))/2
            add('clavicle',side,sc,'trunk','medial clavicle / sternoclavicular joint')
            add('scapula',side,ac,'clavicle.'+side,'lateral clavicle / acromioclavicular joint; glenoid landmark retained',glenoid=list(build.target(glenoid)))
            add('shoulder',side,shoulder,'scapula.'+side,'humeral head sphere fit; .i/.j landmark patch')
            add('elbow',side,elbow,'shoulder.'+side,'midpoint of humeral epicondyle .i/.j cubes')
            add('forearm',side,elbow,'elbow.'+side,'elbow centre to ulnar styloid rotation axis; ulna stays on elbow',axisEnd=landmark('Ulnar styloid process',side))
            grip_offset=build.MANIFEST['handGripOffsetM'] if 'hand.'+side in requested else None
            add('hand',side,wrist,('forearm.' if 'forearm.'+side in requested else 'elbow.')+side,'midpoint of radial/ulnar styloid cubes',offset=grip_offset,gripOffsetM=grip_offset)
        if 'hip.'+side in requested:
            head=landmark('Head of femur',side)
            acetabulum=landmark('Acetabulum',side)
            patch=[p for p in points('femur',side) if (p-head).length<.032]
            fitted=build.sphere_fit(patch)
            distance=(fitted-acetabulum).length
            if distance>.035: raise RuntimeError(f'Femoral head fit away from acetabulum: {side} {distance}')
            fits[side]=dict(femoralHeadFit=list(build.target(fitted)),acetabulum=list(build.target(acetabulum)),distanceM=distance,patchVertices=len(patch))
            add('hip',side,acetabulum,'trunk','acetabulum .i/.j cube cross-checked against femoral head sphere fit')
            knee=(landmark('Medial epicondyle of femur',side)+landmark('Lateral epicondyle of femur',side))/2
            ankle=(landmark('Medial malleolus',side)+landmark('Lateral malleolus',side))/2
            add('knee',side,knee,'hip.'+side,'midpoint of femoral epicondyle .i/.j cubes')
            add('ankle',side,ankle,'knee.'+side,'midpoint of medial/lateral malleolar landmarks')
    assert {j['name'] for j in joints}==requested
    name=build.TOPIC_NAME+'-rig'
    armature=bpy.data.armatures.new(name);rig=bpy.data.objects.new(name,armature);bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
    for j in joints:
        bone=armature.edit_bones.new('joint.'+j['name']);bone.head=j['position'];bone.tail=bone.head+Vector((0,0,.035))
        if j['parent']: bone.parent=armature.edit_bones['joint.'+j['parent']]
        bone.use_connect=False
    bpy.ops.object.mode_set(mode='OBJECT')
    positions={j['name']:build.target(j['position']) for j in joints}
    output=[]
    for j in joints:
        n=j['name'];kind=n.split('.')[0];side=n[-1];sign=-1 if side=='r' else 1
        flex=Vector((1 if kind=='knee' else -1,0,0));rotation=Vector((0,1,0))
        if kind in ['shoulder','elbow','forearm','hip','knee']:
            distal={'shoulder':'elbow','elbow':'hand','forearm':'hand','hip':'knee','knee':'ankle'}[kind]+'.'+side
            if distal in positions: rotation=(positions[distal]-positions[n]).normalized()
        if kind=='forearm': rotation=build.target(j['axisEnd']-j['position']).normalized()
        axes=dict(flexion=list(flex),extension=list(-flex),abduction=[0,0,sign],adduction=[0,0,-sign],rotation=list(rotation),
                  **{'internal-rotation':list(rotation),'external-rotation':list(-rotation),'horizontal-abduction':[0,1,0],
                     'horizontal-adduction':[0,-1,0],'elevation':[0,0,sign],'depression':[0,0,-sign],
                     'protraction':[0,-sign,0],'retraction':[0,sign,0],'upward-rotation':[0,0,sign],'downward-rotation':[0,0,-sign],
                     'lateral-flexion':[0,0,1],'pronation':list(rotation),'supination':list(-rotation),
                     'dorsiflexion':list(flex),'plantarflexion':list(-flex),'inversion':[0,0,sign],'eversion':[0,0,-sign]})
        out=dict(name=n,node='joint.'+n,position=list(positions[n]),parent=j['parent'],axes=axes,source=j['source'],review='pending')
        for key in ['offset','gripOffsetM','glenoid']:
            if key in j: out[key]=j[key]
        if side == 'r':
            left = next(v for v in output if v['name'] == kind+'.l')
            out['axes'] = {action:[-axis[0],axis[1],axis[2]] for action,axis in left['axes'].items()}
        output.append(out)
        assert all(abs(Vector(a).length-1)<1e-5 for a in axes.values()),n
        if kind!='trunk':
            id={'clavicle':'clavicle','scapula':'clavicle','shoulder':'humerus','elbow':'humerus','hand':'forearm','forearm':'forearm','hip':'femur','knee':'femur','ankle':'lower-leg'}[kind]
            cloud=points(id,side);lower=[min(v[a] for v in cloud) for a in range(3)];upper=[max(v[a] for v in cloud) for a in range(3)]
            assert all(lower[a]-.035<=j['position'][a]<=upper[a]+.035 for a in range(3)),(n,lower,upper,j['position'])
        print('RIG CHECK '+json.dumps(out),flush=True)
    from full_body import axis_checks
    axis_rows = axis_checks(output)
    print(f'AXIS MIRROR {build.TOPIC_NAME}: joint | action | dot(R, mirrorX(L))', flush=True)
    for row in axis_rows:
        print(f"{row['joint']} | {row['action']} | {row['dot']:.9f}",flush=True)
    # Drafts currently encode pronation on elbow; alias it to the actual forearm joint.
    aliases={f'elbow.{s}.pronation':f'forearm.{s}.pronation' for s in ['l','r']} if build.TOPIC_NAME=='arms' else {}
    aliases.update({f'elbow.{s}.supination':f'forearm.{s}.supination' for s in ['l','r']} if build.TOPIC_NAME=='arms' else {})
    draft_path=ROOT/f'drafts/{build.TOPIC_NAME}/exercises-{build.TOPIC_NAME}.json'
    if build.TOPIC_NAME=='chest': draft_path=ROOT/'drafts/exercises-chest.json'
    draft=json.loads(draft_path.read_text())['exercises']
    used={n for e in draft for f in e.get('motion',{}).get('keys',[]) for n in f.get('joints',{})}
    save_json(build.TOPIC/'rig.json',dict(license='CC BY-SA 4.0',units='m',coordinates=build.MANIFEST['coordinates'],
              sourceCentre=list(centre),sourceChestCentre=list(centre),floorY=floor-centre.z,coordinateCheck=check,joints=output,
              axisMirrorChecks=axis_rows,hipFitEvidence=fits,motionAliases=aliases,excludedDraftMotionKeys=sorted(used-requested)))
    return rig,joints


def bone_joint(manifest,id,side):
    from rig_rules import attachment_joint
    name=attachment_joint(id,side,'forearm.'+str(side) in manifest['jointNames'])
    if name not in manifest['jointNames']:
        raise RuntimeError(f'Attachment {id}.{side} requires missing joint {name}')
    return name


def muscle_weights(manifest,proximal,distal,u):
    if proximal==distal: return {proximal:1}
    from rig_rules import joint_path, parents
    chain=joint_path(proximal,distal,parents(manifest['jointNames']))
    if any(j not in manifest['jointNames'] for j in chain):
        raise RuntimeError(f'Incomplete muscle chain: {chain}')
    x=u*(len(chain)-1);i=min(len(chain)-2,int(x));w=x-i;w=w*w*(3-2*w)
    return {chain[i]:1-w,chain[i+1]:w}


def pose(preview,scene,meshes,camera):
    data=json.loads((ROOT/preview.TOPIC_NAME/'rig.json').read_text())
    rig=next(o for o in scene.objects if o.type=='ARMATURE')
    rest={o.name:preview.geometry(o) for o in meshes}
    from full_body import POSE, movement_axis
    angles = POSE.copy()
    for key,degrees in angles.items():
        name,action=key.rsplit('.',1);joint=next(j for j in data['joints'] if j['name']==name);bone=rig.pose.bones[joint['node']]
        axis=Vector(movement_axis(data['joints'],name,action));source_axis=Vector((axis.x,-axis.z,axis.y))
        axis=bone.bone.matrix_local.to_3x3().inverted() @ (rig.matrix_world.to_3x3().inverted() @ source_axis)
        bone.rotation_mode='QUATERNION';bone.rotation_quaternion=Quaternion(axis.normalized(),math.radians(degrees))
    bpy.context.view_layer.update();final={o.name:preview.geometry(o) for o in meshes}
    checks=[]
    for ob in meshes:
        assert all(math.isfinite(c) for v in final[ob.name] for c in v),ob.name
        if ob.get('role') in ['region','neighbour','skin']:
            ratios=[(final[ob.name][a]-final[ob.name][b]).length/max(1e-8,(rest[ob.name][a]-rest[ob.name][b]).length) for a,b in (e.vertices for e in ob.data.edges)]
            checks.append(dict(mesh=ob.name,maxEdgeStretch=max(ratios,default=1),
                               centroidDisplacementM=(centroid(final[ob.name])-centroid(rest[ob.name])).length))
    moving='humerus.l' if 'humerus.l' in final else 'femur.l'
    before=centroid(rest[moving]);after=centroid(final[moving]);displacement=(after-before).length
    assert displacement>.03,(moving,displacement)
    if moving=='humerus.l' or moving=='femur.l': assert after.y<before.y-.02,'Flexion must move anteriorly'
    preview.frame(scene,camera,final['skin-outline'],(1,-2,.25))
    path=preview.render(scene,meshes,'pose',overlay=False)
    pose_paths=[path]
    for view,direction in [('front',(0,-1,0)),('back',(0,1,0)),('left',(1,0,0))]:
        preview.frame(scene,camera,final['skin-outline'],direction)
        pose_paths.append(preview.render(scene,meshes,'pose-'+view,overlay=False))
    preview.frame(scene,camera,[p for o in meshes if o.name!='skin-outline' for p in final[o.name]],(1,-2,.25))
    pose_paths.append(preview.render(scene,meshes,'pose-anatomy',overlay=False))
    output=dict(backend='Blender Workbench / decoded final skin',angles=angles,rightAngleConvention='positive inputs; right axes signed by the engine mirrorSignedAxes rule',edgeChecks=checks,path=path,paths=pose_paths,movingMesh=moving,displacementM=displacement)
    if preview.TOPIC_NAME=='arms':
        # Ulna does not rotate with radius around the pronation joint.
        output['pronationAxis']=next(j for j in data['joints'] if j['name']=='forearm.l')['axes']['pronation']
        output['ulnaJoint']='joint.elbow.l';output['radiusJoint']='joint.forearm.l'
    save_json(CACHE/f'{preview.TOPIC_NAME}-pose-stats.json',output)
    return path


def write_report(topic,manifest,summary,rig,sites,rows,failures):
    previews=json.loads((CACHE/f'{topic}-preview-backend.json').read_text());pose=json.loads((CACHE/f'{topic}-pose-stats.json').read_text())
    lines=[f'# {topic.title()} mesh review','',f"Final GLB: **{summary['bytes']:,} bytes**, **{summary['triangles']:,} triangles**, **{summary['nodeCount']} total nodes** ({len(rows)} meshes, {len(rig['joints'])} joints, rig root).",
           f"Draw-call estimate: **{summary['drawCalls']}** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.",'',
           'Native Blender, cached FBX only. Geometry and derived rig/attachment data: CC BY-SA 4.0.','',
           '## Source coverage and scope','']+[f'- {n}' for n in manifest['notes']]
    lines+=['', 'Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.',
            '', '## Final decoded surface audit','',
            'Symmetric sampled Hausdorff: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.', '',
            '| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |',
            '|---|---|---:|---:|---:|---:|---|---:|']
    for r in rows:
        lines.append(f"| {r['name']} | {r['role']} | {r['beforeTriangles']:,} | {r['afterTriangles']:,} | {r['sampledHausdorffM']*1000:.3f} | {r['budgetM']*1000:.1f} | {r['closedBefore']} → {r['closedAfter']} | {r['boundaryEdges']} |")
    lines+=['', '## Workbench previews','', 'Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.','']
    lines += [f'- `{p}`' for p in previews['paths']+pose['paths']]
    lines += ['', f"Right angle convention: {pose['rightAngleConvention']}. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.", f"Pose inputs: {pose['angles']}; {pose['movingMesh']} centroid displacement {pose['displacementM']:.6f} m. All evaluated coordinates and muscle-edge stretches are finite.",
              'Visual inspection results are recorded in `preview-review.md` after viewing every PNG.','', '## Frame and rig','',
              f"Metres; Y up; front +Z; own left +X. Source region centre {rig['sourceCentre']}; floorY {rig['floorY']:.6f} m. Add −floorY for grounded full-body display.",
              'Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.', '',
              '| Joint | Position X/Y/Z m | Parent | Evidence |','|---|---|---|---|']
    for j in rig['joints']: lines.append(f"| {j['name']} | {', '.join(f'{v:.5f}' for v in j['position'])} | {j['parent']} | {j['source']} |")
    lines+=['', '## Bilateral axis checks', '', '| Joint | Action | dot(right, X-mirror(left)) |', '|---|---|---:|']
    lines += [f"| {r['joint']} | {r['action']} | {r['dot']:.9f} |" for r in rig['axisMirrorChecks']]
    lines+=['',f"Full-body draft motion keys outside this regional rig: {', '.join(rig['excludedDraftMotionKeys']) or 'none'}. All topics provide the complete 19-joint body rig.",
            f"Motion aliases: {rig['motionAliases']}. Arms keep ulna on elbow and radius/hand on forearm, with pronation along the forearm rather than the elbow flexion axis.",
            '', '## [待核] attachment candidates','',
            'All candidates remain unapproved. `.o/.e` markers are classified by named-surface distance, with raw labels retained. Proximity fallback is explicit; no anatomical wording is approved by geometry alone.','']
    for site in sites['sites']:
        lines.append(f"- [待核] {site['muscle']} {site['kind']} → {site['bone']}: {site['source']}; {site['review']}; nodes {', '.join(site.get('sourceNodes',[])) or 'none'}.")
    lines+=['', '## Automatic warnings','']+[f'- {w}' for w in sites['warnings']]
    lines += [f"- {r['name']}: closedness changed, section filling disabled; nonmanifold source/simplification needs review." for r in rows if r['closedBefore'] and not r['closedAfter']]
    lines+=['', '## Automatic result','']+([f'- FAIL: {f}' for f in failures] if failures else ['All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.'])
    (ROOT/topic/'report.md').write_text('\n'.join(lines)+'\n')
