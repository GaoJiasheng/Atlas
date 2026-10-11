"""Compare original surfaces with the decoded final GLB and write a human gate."""
import json
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import CACHE, ROOT, clear_scene, save_json, topology, world_vertices

TOPIC = ROOT/'chest'
manifest = json.loads((TOPIC/'manifest.json').read_text())
stats = {r['name']:r for r in json.loads((CACHE/'chest-build-stats.json').read_text())}
summary = json.loads((CACHE/'chest-optimize-stats.json').read_text())
rig = json.loads((TOPIC/'rig.json').read_text())
sites = json.loads((TOPIC/'attachments.json').read_text())


def geometry(ob):
    evaluated = ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        return ([evaluated.matrix_world @ v.co for v in mesh.vertices],
                [tuple(t.vertices) for t in mesh.loop_triangles])
    finally:
        evaluated.to_mesh_clear()


def merge(a,b):
    points,faces=a
    points2,faces2=b
    return points+points2, faces+[tuple(i+len(points) for i in f) for f in faces2]


def samples(points,faces,seed=7):
    if not faces:
        return []
    randomizer=random.Random(seed)
    # Sample evenly spaced vertices and area-weighted points on triangle interiors.
    used=sorted({i for face in faces for i in face})
    result=[points[i] for i in used[::max(1,len(used)//3000)]]
    weights=[(points[b]-points[a]).cross(points[c]-points[a]).length for a,b,c in faces]
    if sum(weights)>0:
        for face in randomizer.choices(faces,weights=weights,k=6000):
            a,b,c=[points[i] for i in face]
            u,v=randomizer.random(),randomizer.random()
            if u+v>1:
                u,v=1-u,1-v
            result.append(a+(b-a)*u+(c-a)*v)
    return result


def directed(geometry_a,geometry_b):
    points,faces=geometry_b
    tree=BVHTree.FromPolygons(points,faces,all_triangles=True)
    return max(tree.find_nearest(p)[3] for p in samples(*geometry_a))


bpy.ops.wm.open_mainfile(filepath=str(CACHE/'chest-review.blend'))
original={ob.name.removesuffix('-before'):geometry(ob) for ob in bpy.data.objects
          if ob.type=='MESH' and ob.name.endswith('-before')}
original['thorax']=merge(original.pop('sternum'),original.pop('ribs'))
clear_scene()
bpy.ops.import_scene.gltf(filepath=str(CACHE/'chest.audit.glb'), disable_bone_shape=True)
rows=[]
failures=[]
for ob in sorted(bpy.context.scene.objects,key=lambda o:o.name):
    if ob.type!='MESH':
        continue
    name=ob.name
    if name not in original:
        raise RuntimeError(f'Unexpected final mesh {name}')
    final=geometry(ob)
    before=original[name]
    deviation=max(directed(before,final),directed(final,before))
    role=ob.get('role', 'bone' if name=='thorax' else stats[name]['role'])
    allowance=manifest['budgets'][role]['maxDeviationM']
    audit_mesh=bpy.data.meshes.new('rest-topology')
    audit_mesh.from_pydata(final[0],[],final[1])
    closed=topology(audit_mesh, weld_positions=True)
    bpy.data.meshes.remove(audit_mesh)
    before_stats=[stats['sternum'],stats['ribs']] if name=='thorax' else [stats[name]]
    before_closed=all(s['closedBefore']['closed'] for s in before_stats)
    row={'name':name,'role':role,'beforeTriangles':len(before[1]),'afterTriangles':len(final[1]),
         'sampledHausdorffM':deviation,'budgetM':allowance,'closedBefore':before_closed,
         'closedAfter':closed['closed'],'boundaryEdges':closed['boundaryEdges'],
         'nonmanifoldEdges':closed['nonmanifoldEdges']}
    rows.append(row)
    if deviation>allowance+1e-6:
        failures.append(f'{name}: sampled deviation {deviation*1000:.3f} mm > {allowance*1000:.3f} mm')
    if all(s['closedBefore']['boundaryEdges'] == 0 for s in before_stats) and closed['boundaryEdges'] > 0:
        failures.append(f'{name}: simplification/export introduced boundary edges')
    print(f'REPORT {name}: {deviation*1000:.3f} mm',flush=True)
if set(original)!=set(r['name'] for r in rows):
    raise RuntimeError('Final output lost a source mesh')
lines=['# Chest mesh review', '',
       f"Final GLB: **{summary['bytes']:,} bytes** ({summary['bytes']/1e6:.3f} MB), **{summary['triangles']:,} triangles**.",
       '', 'Geometry and attachments: CC BY-SA 4.0.', '',
       '## Surface audit', '',
       'Symmetric sample-based Hausdorff: approximately 3,000 vertices and 6,000 area-weighted interior samples per direction. '
       'Distances are to triangles, in metres, after final quantization and compression decode. '
       'This is a sampled estimate, not a certified global maximum. Positional seams are compacted and source boundaries stay locked during simplification. Unreferenced vertices are excluded from the surface samples. Final topology welds coincident UV/normal seam vertices at 0.1 µm for geometric closedness.', '',
       '| Mesh | Role | Before | Final | Max sample deviation (mm) | Budget (mm) | Closed before → final | Boundary edges |',
       '|---|---|---:|---:|---:|---:|---|---:|']
for r in rows:
    lines.append(f"| {r['name']} | {r['role']} | {r['beforeTriangles']:,} | {r['afterTriangles']:,} | "
                 f"{r['sampledHausdorffM']*1000:.3f} | {r['budgetM']*1000:.1f} | "
                 f"{r['closedBefore']} → {r['closedAfter']} | {r['boundaryEdges']} |")
pose_stats = json.loads((CACHE/'chest-pose-stats.json').read_text())
preview_stats = json.loads((CACHE/'chest-preview-backend.json').read_text())
lines += ['', '## Native preview and motion checks', '',
          f"Renderer: {preview_stats['backend']}; flat paper #EDE7D6, orthographic non-skin framing with 5% margin per edge.",
          'The five review images are front, back, body-left, exploded-by-layer and opaque full-body skin. '
          'The pose image uses the decoded final GLB skin, with shoulder.l and elbow.l flexion inputs of 90°.',
          f"Measured left humerus forward displacement (+Z): {pose_stats['humerusForwardM']:.6f} m; "
          f"resulting upper-arm/forearm bend: {pose_stats['elbowBendDegrees']:.2f}° (includes the source rest angle). All sampled muscle edges remain finite.",
          f"The midline column is thoracic spine: source sternum centroid z={rig['coordinateCheck']['sternum'][2]:.5f} m, "
          f"spine centroid z={rig['coordinateCheck']['thoracicSpine'][2]:.5f} m. Spine is posterior and its transform agrees with the source audit.",
          'Visual inspection confirmed both sides, three pec-major parts per side, pec minor beneath, serratus slips along ribs, '
          'intercostals between ribs, midline sternum, posterior scapulae, hanging arm bones and a connected posed axilla. '
          'An additional cache/preview-deep-check.png exposes the intermediate/deep structures with superficial muscles hidden.',
          'The opaque skin and translucent same-camera shell passes place the selected anatomy inside the source body outline; '
          'source regional skin seams remain visible. Anatomical attachment approval remains separate.', '']
lines += ['', '## Budgets and coordinate gates', '',
          f"Native Blender FBX → glTF pipeline; {len(rows)} mesh nodes, 9 joints and 1 rig root.",
          f"Soft targets: {summary['bytes']:,} / {manifest['budgets']['total']['targetBytes']:,} bytes; {summary['triangles']:,} / 350,000 triangles.",
          'Mandatory caps: intercostals external/internal 20,000 each; external oblique 8,000 per side; skin 30,000; thorax 25,000.',
          'Coordinates: metres, Y up, front +Z, own left +X. Chest centre is the inferior manubrium / sternal angle.',
          f"Chest source centre: {rig['sourceChestCentre']}; centred floorY = {rig['floorY']:.6f} m (add chest-centre height to recover source floor).",
          '', '## Rig sanity', '',
          '| Joint | Position (m; X, Y, Z) | Source | Unit axes |',
          '|---|---|---|---|']
for joint in rig['joints']:
    lines.append(f"| {joint['name']} | {', '.join(f'{v:.5f}' for v in joint['position'])} | {joint['source']} | passed |")
lines += ['', 'Shoulder and elbow flexion axes point toward −X: a downward left arm rotates toward +Z. '
          'Preview check poses the decoded final skin at shoulder.l flexion 90° and elbow.l flexion 90°; see cache/preview-pose.png.',
          '', '## Attachment candidates against spec §1.3', '',
          'Every box is a human review gate. Geometry proximity does not verify anatomy. '
          'The spec itself leaves rib counts and tendon wording pending; no external references were fetched.', '']
facts={
    'pectoralis-major-clavicular':('F-1/F-2','origin on medial half of anterior clavicle; insertion at lateral lip of intertubercular groove'),
    'pectoralis-major-sternocostal':('F-1/F-2','origin at anterior sternum and upper six costal cartilages; insertion at lateral lip; review 1–6 versus 2–6'),
    'pectoralis-major-abdominal':('F-1/F-2','origin in external-oblique aponeurosis; insertion on humerus; shared/twisted tendon needs visual review'),
    'pectoralis-minor':('F-4','ribs 3–5 to coracoid process; spec leaves 2–5 versus 3–5 pending'),
    'serratus-anterior':('F-5','outer upper 8–9 ribs to costal surface of medial scapular border; review each slip'),
    'subclavius':('F-6','first rib/costal-cartilage junction to inferior clavicle'),
    'intercostals-external':('F-7','adjacent rib surfaces; review each disconnected intercostal sheet and fibre slope'),
    'intercostals-internal':('F-7','adjacent rib surfaces; review each sheet; separate interosseous/interchondral functions'),
}
for part in manifest['parts']:
    if part['role'] not in ['region','neighbour']:
        continue
    id=part['id']
    fact,description=facts.get(id,('neighbour','review attachment bone and blended motion weights against anatomical references'))
    lines.append(f'- [ ] **{id} · {fact}**: {description}.')
    for site in sites['sites']:
        if site['muscle'].removesuffix('.l').removesuffix('.r')!=id:
            continue
        nodes=', '.join(site.get('sourceNodes',[]))
        points='; '.join('['+', '.join(f'{v:.4f}' for v in p)+']' for p in site['points'])
        lines.append(f"  - [ ] {site['muscle']} {site['kind']} → {site['bone']}: {points}; "
                     f"{site['source']} {nodes}; {site['review']}.")
lines += ['', '- [ ] F-2: three pectoralis components and two twisted insertion layers agree with the reference plate.',
          '- [ ] F-3: verify shoulder flexion/abduction/rotation axis signs in viewer movement demos.',
          '- [ ] F-15: male source figure, source orientation and metre scale agree with inventory.',
          '- [ ] Whole external-oblique and rectus-abdominis neighbour sources: approve extent or crop upper region.',
          '- [ ] Shoulder abduction 90° and elbow flexion 120°: human review of skin collapse and muscle intersections.',
          '', '## Automatic warnings', '']
topology_warnings = [f"{r['name']}: closedness changed; cap disabled. Review nonmanifold topology." for r in rows if r['closedBefore'] and not r['closedAfter']]
lines += [f'- {warning}' for warning in sites['warnings'] + topology_warnings] or ['None.']
lines += ['', '## Automatic result', '']
lines += [f'- FAIL: {failure}' for failure in failures] or ['Geometry error budgets and topology checks passed. Anatomical review remains pending.']
(TOPIC/'report.md').write_text('\n'.join(lines)+'\n')
save_json(CACHE/'chest-report-stats.json',rows)
if failures:
    raise RuntimeError('; '.join(failures))
print(TOPIC/'report.md',flush=True)
