"""Publish reviewed offline region selections before any mesh work (no Blender needed)."""
import argparse
import copy
import hashlib
import json
import re
from pathlib import Path
from rig_rules import complete_manifest, FIBRE_OVERRIDES

ROOT = Path(__file__).resolve().parent
TOPICS = ('back', 'shoulders', 'arms', 'legs', 'core')
chest = json.loads((ROOT/'chest/manifest.json').read_text())
inventory = json.loads((ROOT/'cache/inventory.json').read_text())['objects']

def base(name):
    return re.sub(r'(?:\.[lr])?(?:\.\d+)?$', '', name)

# Reference surfaces remain unexported when outside a topic's bone list.
bones = {p['id']:copy.deepcopy(p) for p in chest['parts'] if p['role']=='bone'}
def bone(id, objects, sides='bilateral', budget=4000, patterns=None):
    bones[id] = dict(id=id, objects=objects, system='skeleton', role='bone', layer='skeleton',
                     sides=sides, triangleBudget=budget, moving=sides=='bilateral')
    if patterns: bones[id]['patterns']=patterns
bone('lumbar-spine', [], 'unsided', 6000, [r'Vertebra L[1-5]'])
bone('cervical-spine', ['Atlas (C1)', 'Axis (C2)'], 'unsided', 6000, [r'Vertebra C[3-7]'])
bone('pelvis', ['Hip bone', 'Sacrum', 'Coccyx'], 'unsided', 12000)
bone('femur', ['Femur'], budget=6000)
bone('patella', ['Patella'], budget=1500)
bone('lower-leg', ['Tibia', 'Fibula'], budget=6000)
bone('radius', ['Radius'], budget=2500)
bone('ulna', ['Ulna'], budget=2500)
bone('hand', ['Scaphoid bone','Lunate bone','Triquetrum bone','Pisiform bone','Trapezium bone','Trapezoid bone','Capitate bone','Hamate bone'], budget=6000,
     patterns=[r'(?:First|Second|Third|Fourth|Fifth) metacarpal bone', r'(?:Proximal|Middle|Distal) phalanx of (?:first|second|third|fourth|fifth) finger of hand'])
bone('foot', ['Calcaneus','Talus','Navicular bone','Cuboid bone','Medial cuneiform bone','Intermediate cuneiform bone','Lateral cuneiform bone','Sesamoid bones of foot'], budget=6000,
     patterns=[r'(?:First|Second|Third|Fourth|Fifth) metatarsal bone', r'(?:Proximal|Middle|Distal) phalanx of (?:first|second|third|fourth|fifth) finger of foot'])
bone('skull', ['Occipital bone'], 'unsided', 2000)
for p in bones.values():
    p.pop('minimumObjects', None)
# Use the same mandatory thorax cap as round 2.

cards = {}
for topic in TOPICS:
    for m in json.loads((ROOT/f'drafts/{topic}/muscles-{topic}.json').read_text())['muscles']:
        if not m['zAnatomy'].endswith('.g'): cards.setdefault(m['id'], m)
for m in json.loads((ROOT/'drafts/muscles-chest.json').read_text())['muscles']:
    if m.get('zAnatomy') and not m['zAnatomy'].endswith('.g'): cards.setdefault(m['id'], m)
# Parent cards are navigation only, except the specified merged neighbour displays.
head_names = {
    'triceps-brachii':['Long head of triceps brachii','Lateral head of triceps brachii','Medial head of triceps brachii'],
    'biceps-brachii':['Long head of biceps brachii','Short head of biceps brachii'],
}
region_ids = {
 'back': 'trapezius-descending trapezius-transverse trapezius-ascending latissimus-dorsi rhomboid-major rhomboid-minor levator-scapulae teres-major infraspinatus teres-minor serratus-posterior-inferior iliocostalis-lumborum iliocostalis-thoracis longissimus-thoracis spinalis-thoracis',
 'shoulders':'deltoid-anterior deltoid-lateral deltoid-posterior infraspinatus teres-minor teres-major supraspinatus subscapularis',
 'arms':'biceps-brachii-long biceps-brachii-short triceps-brachii-long triceps-brachii-lateral brachioradialis pronator-teres flexor-carpi-radialis palmaris-longus flexor-carpi-ulnaris extensor-carpi-radialis-longus extensor-digitorum extensor-carpi-ulnaris brachialis triceps-brachii-medial coracobrachialis anconeus extensor-carpi-radialis-brevis flexor-digitorum-superficialis',
 'legs':'gluteus-maximus tensor-fasciae-latae iliotibial-tract sartorius rectus-femoris vastus-lateralis vastus-medialis biceps-femoris-long semitendinosus gastrocnemius-medial gastrocnemius-lateral tibialis-anterior gluteus-medius adductor-longus gracilis pectineus semimembranosus biceps-femoris-short soleus gluteus-minimus vastus-intermedius adductor-brevis adductor-magnus',
 'core':'rectus-abdominis external-oblique internal-oblique erector-spinae-lumbar transversus-abdominis quadratus-lumborum multifidus-lumborum psoas-major iliacus',
}
neighbour_ids = {
 'back':'deltoid-posterior triceps-brachii gluteus-maximus external-oblique biceps-brachii brachialis brachioradialis deltoid-anterior serratus-anterior',
 'shoulders':'trapezius-descending pectoralis-major-clavicular serratus-anterior biceps-brachii-long latissimus-dorsi pectoralis-major-sternocostal rhomboid-major trapezius-transverse triceps-brachii',
 'arms':'deltoid-anterior deltoid-lateral deltoid-posterior pectoralis-major-clavicular pectoralis-major-sternocostal pectoralis-major-abdominal latissimus-dorsi',
 'legs':'psoas-major iliacus fibularis-longus',
 'core':'gluteus-maximus tensor-fasciae-latae latissimus-dorsi serratus-anterior',
}
export_bones = {
 'back':'thoracic-spine lumbar-spine sternum ribs scapula clavicle humerus pelvis',
 'shoulders':'clavicle scapula humerus forearm sternum ribs cervical-spine',
 'arms':'humerus radius ulna hand scapula',
 'legs':'pelvis femur patella lower-leg foot lumbar-spine',
 'core':'sternum ribs thoracic-spine lumbar-spine pelvis femur',
}
rig_joint_types = {
 'back': ('clavicle', 'scapula', 'shoulder', 'elbow', 'hand', 'hip'),
 'shoulders': ('clavicle', 'scapula', 'shoulder', 'elbow', 'hand'),
 'arms': ('clavicle', 'scapula', 'shoulder', 'elbow', 'forearm', 'hand'),
 'legs': ('hip', 'knee', 'ankle'),
 'core': ('hip', 'knee', 'ankle', 'clavicle', 'scapula', 'shoulder', 'elbow', 'hand'),
}
aliases = {'thorax':'ribs','sacrum':'pelvis','coccyx':'pelvis','forearm-bones':'forearm','hand-bones':'hand',
           'tibia':'lower-leg','fibula':'lower-leg','calcaneus':'foot','medial-cuneiform':'foot','metatarsal-1':'foot',
           'thoracolumbar-fascia':'lumbar-spine','diaphragm-central-tendon':'ribs'}

def exact_sources(p):
    return [e for e in inventory if e['system']==p['system'] and e['type']=='MESH' and 'attachment' not in e and
            (base(e['name']) in p['objects'] or any(re.fullmatch(x,base(e['name'])) for x in p.get('patterns',[])))]

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--topic',choices=('all','chest','digestive')+TOPICS,default='all')
args=parser.parse_args()
if args.topic=='digestive':
    import runpy
    runpy.run_path(str(ROOT/'digestive/manifest.py'),run_name='__main__')
    raise SystemExit(0)
if args.topic in ('all','chest'):
    chest['referenceParts'] = list(bones.values())
    chest['budgets']['total'].update(maxBytes=4000000,maxTriangles=350000)
    complete_manifest(chest)
    encoded=json.dumps(chest,indent=2)+'\n'
    (ROOT/'chest/manifest.json').write_text(encoded)
    (ROOT/'chest/MANIFEST-READY').write_text('sha256 '+hashlib.sha256(encoded.encode()).hexdigest()+'\n')
    print('MANIFEST-READY chest: full-body joints',flush=True)
for topic in TOPICS if args.topic=='all' else (() if args.topic=='chest' else (args.topic,)):
    parts = []
    local = {m['id']:m for m in json.loads((ROOT/f'drafts/{topic}/muscles-{topic}.json').read_text())['muscles']}
    for role, ids in [('region',region_ids[topic]),('neighbour',neighbour_ids[topic])]:
        for id in ids.split():
            m = local.get(id) or cards.get(id)
            if id in head_names:
                names = head_names[id]
                origin=['scapula','humerus'] if id=='triceps-brachii' else ['scapula']
                insertion=['ulna'] if id=='triceps-brachii' else ['radius']
                layer='superficial'
            else:
                names = next((p['objects'] for p in chest['parts'] if p['id']==id and p['system']=='muscles'), m['zAnatomy'].split(' + '))
                origin=m['origin']['bones']; insertion=m['insertion']['bones']; layer=m['layer']
            # Attachments keep out-of-region named surfaces in referenceParts; no false substitute bone.
            origin=[aliases.get(x,x) for x in origin]; insertion=[aliases.get(x,x) for x in insertion]
            budget = 4000 if role=='region' else 1500
            if id in ['external-oblique','latissimus-dorsi']: budget=8000 if role=='region' else (8000 if id=='external-oblique' else 2000)
            if id=='gluteus-maximus': budget=4000 if role=='region' else 2000
            p=dict(id=id,objects=names,system='muscles',role=role,layer=layer if role=='region' else 'neighbours',
                   sides='bilateral',triangleBudget=budget,origin=origin,insertion=insertion,
                   attachmentOwners=names + [n.replace(' head of ', ' ') for n in names],protectFolds=True)
            parents={'biceps-brachii':'Biceps brachii muscle','triceps-brachii':'Triceps brachii muscle','deltoid':'Deltoid muscle','pectoralis-major':'Pectoralis major muscle','gastrocnemius':'Gastrocnemius muscle'}
            p['attachmentOwners'] += [v for k,v in parents.items() if id.startswith(k)]
            if id=='external-oblique' and role=='neighbour': p['triangleCap']=8000
            if topic=='back' and id=='serratus-posterior-inferior': p['auditSafety']=.75
            if id=='iliotibial-tract': p['connectiveTissue']=True
            if id=='erector-spinae-lumbar': p['scope']='Full iliocostalis-lumborum and longissimus-thoracis sources; lumbar crop pending.'
            sources=exact_sources(p)
            for side in ['l','r']:
                found=[e for e in sources if e['side']==side]
                if len(found)!=len(names): raise RuntimeError((topic,id,side,names,[e['name'] for e in found]))
            p['sourceNames']=[e['name'] for e in sources]
            p['minimumObjects']=len(names)
            parts.append(p)
    parts += [copy.deepcopy(bones[id]) for id in export_bones[topic].split()]
    parts.append(copy.deepcopy(next(p for p in chest['parts'] if p['role']=='skin')))
    if topic=='legs':
        for p in parts:
            if p['id'] in ['pelvis','foot','lumbar-spine','skin-outline']:
                p['triangleBudget']={'pelvis':6000,'foot':3000,'lumbar-spine':4000,'skin-outline':15000}[p['id']]
                if p['id']=='skin-outline': p['auditSafety']=.85
    for p in parts:
        sources=exact_sources(p)
        if not sources: raise RuntimeError((topic,p['id']))
        p['sourceNames']=[e['name'] for e in sources]
    joints=['trunk']+[f'{j}.{s}' for s in ['l','r'] for j in rig_joint_types[topic]]
    nodes=sorted({p.get('exportGroup',p['id'] + ('.'+s if s else '')) for p in parts for s in (['l','r'] if p['sides']=='bilateral' else [None])})
    notes=['Selected from docs/16 §5.3, region reviews and exact cached FBX inventory; no mirrored geometry.',
           'Parent/group cards are not duplicated as meshes. Neighbours include adjacent exercise secondary/stabiliser muscles; distant whole-body stabilisers excluded.',
           'Reference surfaces outside the exported bone list are used only for attachment and joint evidence.',
           'Whole neighbour muscle extents retained at low budget; educational crops remain [待核].',
           'Intrinsic hand/foot muscles and deep forearm flexors excluded by v1 scope; hand/foot bones are merged per side.',
           'Optional thoracolumbar fascia, linea alba and diaphragm omitted. Linea-alba attachment evidence uses the unexported named source surface.',
           'No named region muscle is missing in Z-Anatomy; multifidus uses the actual paired lumbar meshes, not rotatores or invented geometry.']
    references = list(bones.values())+[dict(id='linea-alba',objects=['Linea alba'],system='muscles')]
    for ref in sorted({x for p in parts for k in ['origin','insertion'] for x in p.get(k,[])} - set(bones) - {'linea-alba'}):
        m=cards.get(ref)
        if m: references.append(dict(id=ref,objects=m['zAnatomy'].split(' + '),system='muscles'))
    manifest=dict(topic=topic,license=chest['license'],coordinates=chest['coordinates'],budgets=copy.deepcopy(chest['budgets']),
                  parts=parts,referenceParts=references,
                  jointNames=joints,expectedNodes=nodes+[topic+'-rig']+['joint.'+j for j in joints],notes=notes)
    manifest['handGripOffsetM'] = .08
    manifest['budgets']['total'].update(maxBytes=4000000,maxTriangles=350000)
    for part in parts:
        if part['id'] in FIBRE_OVERRIDES:
            part['fibre'] = copy.deepcopy(FIBRE_OVERRIDES[part['id']])
    complete_manifest(manifest)
    directory=ROOT/topic;directory.mkdir(exist_ok=True)
    encoded=json.dumps(manifest,indent=2)+'\n'
    (directory/'manifest.json').write_text(encoded)
    # Publish immediately after this topic's complete, validated manifest.
    (directory/'MANIFEST-READY').write_text('sha256 '+hashlib.sha256(encoded.encode()).hexdigest()+'\n')
    print(f'MANIFEST-READY {topic}: {len(parts)} parts, {len(nodes)} meshes',flush=True)
