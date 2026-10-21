"""Inventory-validated heart-and-lungs selection (docs/40 §3.4). Run without Blender; never downloads.

Every source name below was read from cache/inventory.json; the generator checks each
one again and stops on anything missing rather than inventing a substitute.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HERE = ROOT / 'heart-lungs'

CHANGES = ('structures selected for the respiratory and circulatory systems with digestive and skeletal context, '
           'simplified, renamed, centrelines and route landmarks baked.')

# Bronchi: the 28 named airway segments below the trachea (main, intermediate, lobar, segmental).
BRONCHI = r'(?i).*(?:main|lobar|intermediate|segmental) bronch.*'
GREAT = ['Ascending aorta', 'Aortic arch', 'Thoracic aorta', 'Abdominal aorta', 'Brachiocephalic trunk',
         'Superior vena cava', 'Inferior vena cava (thoracic part)', 'Inferior vena cava (abdominal part)',
         'Left brachiocephalic vein', 'Right brachiocephalic vein']
LUNG_VESSELS = ['Pulmonary trunk', 'Bifurcation of pulmonary trunk', 'Left pulmonary artery', 'Right pulmonary artery',
                'Left superior pulmonary vein', 'Left inferior pulmonary vein', 'Right superior pulmonary vein',
                'Right inferior pulmonary vein']
OUT = ['Right common carotid artery', 'Left common carotid artery', 'Internal carotid artery', 'External carotid artery',
       'Right subclavian artery', 'Left subclavian artery', 'Axillary artery', 'Brachial artery', 'Radial artery',
       'Ulnar artery', 'Coeliac trunk', 'Common hepatic artery', 'Proper hepatic artery', 'Splenic artery',
       'Superior mesenteric artery', 'Common iliac artery', 'External iliac artery', 'Internal iliac artery',
       'Femoral artery', 'Deep femoral artery', 'Popliteal artery', 'Anterior tibial artery', 'Posterior tibial artery',
       'Dorsalis pedis artery']
BACK = ['Internal jugular vein', 'External jugular vein', 'Right subclavian vein', 'Left subclavian vein',
        'Axillary vein', 'Brachial veins', 'Radial veins', 'Ulnar veins', 'Basilic vein', 'Cephalic vein',
        'Common iliac vein', 'External iliac vein', 'Internal iliac vein', 'Femoral vein', 'Deep femoral vein',
        'Popliteal vein', 'Anterior tibial veins', 'Posterior tibial veins', 'Great saphenous vein',
        'Small saphenous vein', 'Superior mesenteric vein', 'Splenic vein', 'Hepatic portal vein', 'Hepatic veins']
CHAMBERS = ['Left atrium', 'Right atrium', 'Left ventricle', 'Right ventricle']
LOBES = {'superior-lobe-right': 'Superior lobe of right lung', 'middle-lobe-right': 'Middle lobe of right lung',
         'inferior-lobe-right': 'Inferior lobe of right lung', 'superior-lobe-left': 'Superior lobe of left lung',
         'inferior-lobe-left': 'Inferior lobe of left lung'}
LEG_MUSCLES = ['Rectus femoris muscle', 'Vastus lateralis muscle', 'Vastus medialis muscle',
               'Medial head of gastrocnemius', 'Lateral head of gastrocnemius']
SKULL = ['Frontal bone', 'Parietal bone', 'Temporal bone', 'Occipital bone', 'Sphenoid bone', 'Ethmoid bone', 'Maxilla',
         'Mandible', 'Zygomatic bone', 'Nasal bone', 'Palatine bone', 'Vomer', 'Lacrimal bone']
# The digestive skeleton list without ribs, costal cartilages and sternum (those form `ribcage`).
SKELETON = SKULL + ['Atlas (C1)', 'Axis (C2)', 'Hip bone', 'Sacrum', 'Coccyx', 'Clavicle', 'Scapula', 'Humerus',
                    'Radius', 'Ulna', 'Femur', 'Patella', 'Tibia', 'Fibula', 'Talus', 'Calcaneus']


# Four segmental bronchi whose source mesh stops 3-4 cm short of the airway they branch
# from (measured: the nearest-end rule would hang them on the trachea). Their parent by
# anatomy (Gray 1918; OpenStax A&P 2e 22.2); the gap is bridged and listed in routes.json.
TREE_PARENTS = {'Apical segmental bronchus of right lung (BI)': 'Right superior lobar bronchus',
                'Apicoposterior segmental bronchus of left lung (BI+BII)': 'Left superior lobar bronchus',
                'Superior lingular segmental bronchus of left lung (BIV)': 'Left superior lobar bronchus',
                'Superior segmental bronchus of left lung (BVI)': 'Left inferior lobar bronchus'}


# The source bifurcation is two unconnected tube pieces (measured): the longer runs from
# the trunk back to the left pulmonary artery, the shorter (`#2`, traced from its own ring
# at the right artery, so run backwards `~`) leaves it part-way towards the right.
PULMONARY = {'Left pulmonary artery': ['Pulmonary trunk', 'Bifurcation of pulmonary trunk', 'Left pulmonary artery'],
             'Right pulmonary artery': ['Pulmonary trunk', 'Bifurcation of pulmonary trunk', 'Bifurcation of pulmonary trunk#2~', 'Right pulmonary artery']}


def routes():
    """Object order of every pipeline flow (docs/40 §3.6) and the seeds of its schematic legs.

    A path is a list of legs (routes.py). `chain` follows source centrelines in order,
    each segment entered at its point nearest the path so far. `via` is schematic: a
    smooth curve from the path so far through the anchors to the next leg. `arc` is a
    short schematic bow between two anchors. `tree` follows the bronchial tree from the
    trachea to each segmental bronchus. `concat` joins finished paths. Anchors:
    `lm:<landmark>`; `start:` / `end:` / `mid:` of a segment or of `<flow>/<path>`;
    `near:<flow>/<path>@<landmark>`; `beside:<segment>` (10 mm off its midpoint, towards
    the next anchor); `airend:<lobe>` (the air path ending nearest that lobe's exchange
    arc); `posterior:<node>` (four points in front of that node's back wall).
    `within` names the meshes a leg is checked against; `alsoWithin` adds meshes to a
    chain's own (the vessel roots sit in the heart mesh).
    """
    r = {}
    for s, word in (('r', 'right'), ('l', 'left')):
        # Nose and throat: the air runs along the back of the pharynx (`posterior:pharynx`
        # adds four points 7 mm in front of its back wall between the anchors either side).
        r[f'air-{word}'] = dict(group='air', tree=dict(side=s, root='Trachea', parents=TREE_PARENTS, bridgeWithin=['lung-right', 'lung-left'],
                                                       leafPattern=r'\(B[IVX]+(?:\+B[IVX]+)?\)$'),
            head=[dict(via=[f'lm:nostril.{s}', f'lm:nasal-passage.{s}', 'lm:choana', 'lm:nasopharynx', 'posterior:pharynx',
                            'lm:laryngeal-inlet', 'lm:larynx', 'start:Trachea'],
                       within=['nasal-cavity', 'pharynx', 'larynx', 'epiglottis', 'trachea'])])
    heart = ['heart', 'great-vessels', 'lung-vessels']
    r['heart-right'] = dict(group='blood-poor', paths={
        'from-svc': [dict(via=['end:Superior vena cava', 'lm:right-atrium', 'lm:tricuspid', 'lm:right-ventricle', 'start:Pulmonary trunk'], within=heart)],
        'from-ivc': [dict(via=['end:Inferior vena cava (thoracic part)', 'lm:right-atrium', 'lm:tricuspid', 'lm:right-ventricle', 'start:Pulmonary trunk'], within=heart)]})
    lobes = [('superior-lobe-right', 'Right pulmonary artery', 'Right superior lobar bronchus', 'Right superior pulmonary vein'),
             ('middle-lobe-right', 'Right pulmonary artery', 'Middle lobar bronchus.r', 'Right superior pulmonary vein'),
             ('inferior-lobe-right', 'Right pulmonary artery', 'Right inferior lobar bronchus', 'Right inferior pulmonary vein'),
             ('superior-lobe-left', 'Left pulmonary artery', 'Left superior lobar bronchus', 'Left superior pulmonary vein'),
             ('inferior-lobe-left', 'Left pulmonary artery', 'Left inferior lobar bronchus', 'Left inferior pulmonary vein')]
    lung = lambda lobe: 'lung-right' if lobe.endswith('right') else 'lung-left'
    r['to-lungs'] = dict(group='blood-poor', paths={lobe: [
        dict(chain=PULMONARY[artery], alsoWithin=['heart']),
        dict(via=[f'beside:{bronchus}', f'lm:{lobe}.artery-site'], within=[lung(lobe), 'lung-vessels', 'bronchi'])]  # in the hilum the bronchi bound it too
        for lobe, artery, bronchus, _ in lobes})
    r['exchange-lungs'] = dict(group='blood-poor', paths={lobe: [
        dict(arc=[f'end:to-lungs/{lobe}', f'lm:{lobe}.vein-site'], bulge=.012, away=f"lm:hilum.{'r' if lobe.endswith('right') else 'l'}", within=[lung(lobe)])] for lobe, *_ in lobes})
    r['from-lungs'] = dict(group='blood-rich', paths={lobe: [
        dict(via=[f'lm:{lobe}.vein-site'], within=[lung(lobe), 'lung-vessels']),
        dict(chain=[vein], alsoWithin=['heart']), dict(via=['lm:left-atrium'], within=['heart', 'lung-vessels'])] for lobe, _, _, vein in lobes})
    r['heart-left'] = dict(group='blood-rich', paths={'main': [
        dict(via=['lm:left-atrium', 'lm:mitral', 'lm:left-ventricle', 'start:Ascending aorta'], within=heart)]})
    # The aortic root sits in the heart mesh: the first chain points are checked against both.
    aorta = lambda *rest: [dict(chain=['Ascending aorta', 'Aortic arch', *rest], alsoWithin=['heart'])]
    r['to-body'] = dict(group='blood-rich', paths={
        'head-right': aorta('Brachiocephalic trunk', 'Right common carotid artery', 'Internal carotid artery.r'),
        'head-left': aorta('Left common carotid artery', 'Internal carotid artery.l'),
        'arm-right': aorta('Brachiocephalic trunk', 'Right subclavian artery', 'Axillary artery.r', 'Brachial artery.r', 'Radial artery.r'),
        'arm-left': aorta('Left subclavian artery', 'Axillary artery.l', 'Brachial artery.l', 'Radial artery.l'),
        'gut': aorta('Thoracic aorta', 'Abdominal aorta', 'Superior mesenteric artery'),
        'leg-right': aorta('Thoracic aorta', 'Abdominal aorta', 'Common iliac artery.r', 'External iliac artery.r', 'Femoral artery.r', 'Popliteal artery.r', 'Posterior tibial artery.r'),
        'leg-left': aorta('Thoracic aorta', 'Abdominal aorta', 'Common iliac artery.l', 'External iliac artery.l', 'Femoral artery.l', 'Popliteal artery.l', 'Posterior tibial artery.l')})
    ends = {'head-right': 'Internal jugular vein.r', 'head-left': 'Internal jugular vein.l', 'arm-right': 'Radial veins.r',
            'arm-left': 'Radial veins.l', 'gut': 'Superior mesenteric vein', 'leg-right': 'Posterior tibial veins.r',
            'leg-left': 'Posterior tibial veins.l'}
    # Legs through tissue the model does not draw (the finest vessels, muscle): the check
    # is that they stay inside the body outline (`tissue`), and where named, end inside an organ.
    body = ['skin-outline']
    # The wrist is thin: its arc bows 4 mm, the others 15 mm.
    r['exchange-body'] = dict(group='blood-rich', paths={k: [dict(arc=[f'end:to-body/{k}', f'start:{v}'], bulge=.004 if k.startswith('arm') else .015,
                                                                 within=body, tissue=True)] for k, v in ends.items()})
    r['from-body'] = dict(group='blood-poor', paths={
        'head-right': [dict(chain=['Internal jugular vein.r', 'Right brachiocephalic vein', 'Superior vena cava'])],
        'head-left': [dict(chain=['Internal jugular vein.l', 'Left brachiocephalic vein', 'Superior vena cava'])],
        'arm-right': [dict(chain=['Radial veins.r', 'Brachial veins.r', 'Axillary vein.r', 'Right subclavian vein', 'Right brachiocephalic vein', 'Superior vena cava'])],
        'arm-left': [dict(chain=['Radial veins.l', 'Brachial veins.l', 'Axillary vein.l', 'Left subclavian vein', 'Left brachiocephalic vein', 'Superior vena cava'])],
        'gut': [dict(chain=['Superior mesenteric vein', 'Hepatic portal vein']),
                dict(via=['lm:liver-hilum', 'lm:liver-core'], within=['liver', 'vessels-back']),
                dict(chain=['Hepatic veins', 'Inferior vena cava (thoracic part)'])],
        'leg-right': [dict(chain=['Posterior tibial veins.r', 'Popliteal vein.r', 'Femoral vein.r', 'External iliac vein.r', 'Common iliac vein.r', 'Inferior vena cava (abdominal part)', 'Inferior vena cava (thoracic part)'])],
        'leg-left': [dict(chain=['Posterior tibial veins.l', 'Popliteal vein.l', 'Femoral vein.l', 'External iliac vein.l', 'Common iliac vein.l', 'Inferior vena cava (abdominal part)', 'Inferior vena cava (thoracic part)'])]})
    # Gas exchange: air in each lobe <-> the middle of that lobe's exchange arc.
    r['oxygen-lungs'] = dict(group='gases', paths={lobe: [dict(via=[f'airend:{lobe}', f'mid:exchange-lungs/{lobe}'], within=[lung(lobe)])] for lobe, *_ in lobes})
    r['co2-lungs'] = dict(group='gases', paths={lobe: [dict(via=[f'mid:exchange-lungs/{lobe}', f'airend:{lobe}'], within=[lung(lobe)])] for lobe, *_ in lobes})
    muscle = {}
    for s, word in (('r', 'right'), ('l', 'left')):
        muscle[f'thigh-{word}'] = [dict(via=[f'near:to-body/leg-{word}@thigh.{s}', f'lm:thigh.{s}'], within=body, endWithin=[f'leg-muscles.{s}'], tissue=True)]
        muscle[f'calf-{word}'] = [dict(via=[f'near:to-body/leg-{word}@calf.{s}', f'lm:calf.{s}'], within=body, endWithin=[f'leg-muscles.{s}'], tissue=True)]
    r['oxygen-muscle'] = dict(group='gases', paths=muscle)
    r['co2-muscle'] = dict(group='gases', reverse='oxygen-muscle', paths={})
    r['food-in'] = dict(group='digested-food', spray=dict(node='small-intestine', count=4, to='start:Superior mesenteric vein', radiusM=[.03, .10]), paths={})
    r['food-route'] = dict(group='digested-food', paths={'main': [
        dict(concat=['from-body/gut', 'heart-right/from-ivc', 'to-lungs/inferior-lobe-right', 'exchange-lungs/inferior-lobe-right',
                     'from-lungs/inferior-lobe-right', 'heart-left/main', 'to-body/leg-left'], until='lm:thigh.l'),
        dict(via=['lm:thigh.l'], within=body, endWithin=['leg-muscles.l'], tissue=True)]})
    r['food-in']['spray']['within'] = body
    order = ['air-right', 'air-left', 'heart-right', 'to-lungs', 'exchange-lungs', 'from-lungs', 'heart-left', 'to-body',
             'from-body', 'exchange-body', 'oxygen-lungs', 'co2-lungs', 'oxygen-muscle', 'co2-muscle', 'food-in', 'food-route']
    # The blood loop: every path of one flow ends where a path of the next begins (docs/40 §3.6).
    cycle = ['heart-right', 'to-lungs', 'exchange-lungs', 'from-lungs', 'heart-left', 'to-body', 'exchange-body', 'from-body']
    return dict(order=order, cycle=cycle, stepM=.008, joinToleranceM=.005, flows=r)


def landmarks():
    """Landmarks measured on the source objects before merging (static_region.landmarks)."""
    lm = {'right-atrium': dict(kind='centroid', sources=['Right atrium']),
          'right-ventricle': dict(kind='centroid', sources=['Right ventricle']),
          'left-atrium': dict(kind='centroid', sources=['Left atrium']),
          'left-ventricle': dict(kind='centroid', sources=['Left ventricle']),
          'heart': dict(kind='centroid', sources=CHAMBERS),
          'tricuspid': dict(kind='opening', sources=['Right atrium'], to=['Right ventricle']),
          'mitral': dict(kind='opening', sources=['Left atrium'], to=['Left ventricle']),
          'diaphragm-dome.r': dict(kind='top', sources=['Diaphragm'], side='r'),
          'diaphragm-dome.l': dict(kind='top', sources=['Diaphragm'], side='l'),
          'thoracic-spine-front': dict(kind='front', sources=['Vertebra T5', 'Vertebra T6', 'Vertebra T7', 'Vertebra T8']),
          'hilum.r': dict(kind='end', sources=['Right main bronchus']),
          'hilum.l': dict(kind='end', sources=['Left main bronchus']),
          'larynx': dict(kind='centroid', sources=['Thyroid cartilage', 'Cricoid cartilage']),
          'nasopharynx': dict(kind='centroid', sources=['Nasopharynx']),
          'oropharynx': dict(kind='centroid', sources=['Oropharynx']),
          'laryngeal-inlet': dict(kind='between', sources=['Epiglottis'], to=['Cricoid cartilage', 'Thyroid cartilage'], at=.35),
          'liver-core': dict(kind='centroid', sources=['Liver']),
          'liver-hilum': dict(kind='end', sources=['Hepatic portal vein']),
          'choana': dict(kind='back', sources=['Mucosa of nasal cavity'])}
    for s in 'lr':
        lm[f'nostril.{s}'] = dict(kind='nostril', sources=['Mucosa of nasal cavity'], skin='Nasal region', side=s)
        lm[f'nasal-passage.{s}'] = dict(kind='passage', sources=['Mucosa of nasal cavity'], side=s)
        # Inside one muscle each (the centroid of several lies between them): the belly of rectus femoris, of the medial gastrocnemius.
        lm[f'thigh.{s}'] = dict(kind='centroid', sources=[f'Rectus femoris muscle.{s}'])
        lm[f'calf.{s}'] = dict(kind='centroid', sources=[f'Medial head of gastrocnemius.{s}'])
    for id, name in LOBES.items():
        lm[id] = dict(kind='centroid', sources=[name])
    return lm


def generate():
    entries = json.loads((ROOT/'cache/inventory.json').read_text())['objects']
    def base(n): return re.sub(r'(?:\.[lr])?(?:\.\d+)?$', '', n)
    parts = []

    def part(id, objects, system='visceral', role='organ', budget=3000, sides='unsided', patterns=(), body='respiratory', layer='airway', centreline=None):
        p = dict(id=id, objects=objects, system=system, bodySystem=body, role=role, layer=layer, sides=sides, triangleBudget=budget)
        if patterns: p['patterns'] = list(patterns)
        found = [e for e in entries if e['system'] == system and e['type'] == 'MESH' and e['triangles'] and not e.get('attachment')
                 and (base(e['name']) in objects or any(re.fullmatch(x, base(e['name'])) for x in patterns))]
        missing = [o for o in objects if not any(base(e['name']) == o for e in found)]
        if not found or missing: raise RuntimeError(f'Missing source for {id}: {missing or objects}')
        p['sourceNames'] = sorted(e['name'] for e in found)
        p['minimumObjects'] = len(found)//2 if sides == 'bilateral' else len(found)
        p['sourceClosed'] = all(e['closed'] for e in found)
        p['closed'] = p['sourceClosed'] and role not in ('tube', 'skin')
        if centreline: p['segmentCentrelines'] = centreline
        parts.append(p)
        return p

    # Reference for each tube's flow direction: airways start at the larynx; vessels leave or return to the heart.
    airway = dict(flow='away', reference=['Thyroid cartilage', 'Cricoid cartilage'])
    out = dict(flow='away', reference=CHAMBERS)
    back = dict(flow='toward', reference=CHAMBERS)
    part('nasal-cavity', ['Mucosa of nasal cavity'], budget=4000)
    part('pharynx', ['Nasopharynx', 'Oropharynx', 'Laryngopharynx'], role='tube', budget=3500,
         centreline=dict(flow='away', reference=['Mucosa of nasal cavity'], schematic=True))  # closed solids: the air route through them is drawn from landmarks
    part('epiglottis', ['Epiglottis'], budget=1000)
    part('larynx', ['Thyroid cartilage', 'Cricoid cartilage'], 'skeleton', budget=2500)
    part('trachea', ['Trachea'], role='tube', budget=3500, centreline=airway)
    bronchi = part('bronchi', [], role='tube', budget=12000, patterns=[BRONCHI], layer='air-tubes', centreline=airway)
    if len(bronchi['sourceNames']) != 28: raise RuntimeError(f"Expected 28 bronchi, found {len(bronchi['sourceNames'])}")
    part('lung-right', [LOBES[k] for k in ('superior-lobe-right', 'middle-lobe-right', 'inferior-lobe-right')], budget=10000, layer='lung-pair')
    part('lung-left', [LOBES[k] for k in ('superior-lobe-left', 'inferior-lobe-left')], budget=8000, layer='lung-pair')
    part('diaphragm', ['Diaphragm'], 'muscles', budget=5000, body='muscular', layer='breathing-movers')
    part('ribcage', ['Manubrium of sternum', 'Body of sternum', 'Xiphoid process'], 'skeleton', 'system', 14000,
         patterns=[r'.* rib', r'Costal cartilage.*'], body='skeletal', layer='breathing-movers')
    part('heart', CHAMBERS, 'cardiovascular', budget=10000, body='circulatory', layer='heart-group')
    part('great-vessels', GREAT, 'cardiovascular', 'tube', 5000, body='circulatory', layer='heart-group', centreline=dict(flow='by-name', reference=CHAMBERS, upstreamBySource={'Thoracic aorta': ['Aortic arch']}))
    part('lung-vessels', LUNG_VESSELS, 'cardiovascular', 'tube', 4000, body='circulatory', layer='heart-group', centreline=dict(flow='by-name', reference=CHAMBERS))
    part('vessels-out', OUT, 'cardiovascular', 'tube', 12000, body='circulatory', layer='body-vessels', centreline=dict(out, upstreamBySource={'Coeliac trunk': ['Abdominal aorta']}))
    part('vessels-back', BACK, 'cardiovascular', 'tube', 12000, body='circulatory', layer='body-vessels', centreline=dict(back, downstreamBySource={'Hepatic veins': ['Inferior vena cava (thoracic part)']}))
    # Low-poly digestive context (sources as in the digestive manifest).
    part('oesophagus', ['Oesophagus'], budget=2000, body='digestive', layer='digestion')
    stomach = part('stomach', ['Stomach'], budget=5000, body='digestive', layer='digestion')
    # Same source display window and patch as the digestive topic (docs/25 §9.1).
    stomach['fillOpenings'] = [dict(near=[0.06, 0.135, -0.034], maxRadiusM=0.04, reason='display window in the anterior wall of the source stomach')]
    part('small-intestine', ['Duodenum', 'Jejunum'], budget=10000, body='digestive', layer='digestion')
    part('large-intestine', ['Ascending colon', 'Transverse colon', 'Descending colon', 'Sigmoid colon', 'Vermiform appendix'], budget=8000, body='digestive', layer='digestion')
    part('liver', ['Liver'], budget=5000, body='digestive', layer='digestion')
    part('leg-muscles', LEG_MUSCLES, 'muscles', budget=6000, sides='bilateral', body='muscular', layer='leg-muscle-group')
    part('skeleton', SKELETON, 'skeleton', 'system', 40000, patterns=[r'Vertebra [CTL]\d+'], body='skeletal', layer='skeleton-context')
    skin = next(p for p in json.loads((ROOT/'core/manifest.json').read_text())['parts'] if p['role'] == 'skin')
    part('skin-outline', skin['objects'], 'regions', 'skin', 18000, body='integumentary', layer='context')
    part('skin-wire', skin['objects'], 'regions', 'skin', 4000, body='integumentary', layer='context')['triangleCap'] = 5000
    # Vessel direction for the two mixed groups (arteries leave the heart, veins return to it).
    for p in parts:
        if p.get('segmentCentrelines', {}).get('flow') == 'by-name':
            p['segmentCentrelines']['flowBySource'] = {n: ('toward' if re.search(r'vein|vena cava', n) else 'away') for n in p['sourceNames']}
    manifest = dict(topic='heart-lungs', output='heart-and-lungs.glb', rig=False, license='CC BY-SA 4.0', changes=CHANGES,
        coordinates=dict(unit='m', up='+Y', front='+Z', left='+X', centre='umbilicus midline; same source centre and transform as the digestive topic (organs.json)'),
        budgets={role: dict(maxDeviationM=dev, triangleTargetRange=rng) for role, dev, rng in
                 [('tube', .0015, [1000, 12000]), ('organ', .0015, [1000, 10000]), ('system', .004, [4000, 30000]), ('skin', .035, [3000, 18000])]},
        parts=parts, segmentCentrelines=True,
        expectedNodes=[p['id']+('.'+s if s else '') for p in parts for s in (['l', 'r'] if p['sides'] == 'bilateral' else [None])],
        skinNodes=['skin-outline', 'skin-wire'], missingOrgans=[], landmarks=landmarks(), routes=routes(),
        notes=['No rig, skin weights, fibres or attachment sites. Breathing and heartbeat are whole-node animations in the engine.',
               'Tube nodes merge several source segments. _U is the station along each source segment\'s own centreline (0 = upstream in the flow direction), normalised per segment.',
               'Each source segment\'s centreline is extracted before merging (heart-lungs/centrelines.json); landmarks are measured on the source objects before merging (heart-lungs/landmarks.json).',
               'The heart merges the four Z-Anatomy chamber surfaces (open); there is no single Heart mesh in the source (Heart.g is an empty group).',
               'Vessel meshes keep one neutral tissue colour; the meaning of red is carried by the flows (docs/40 D4).',
               'Not taken: digital vessels of hands and feet, coronary vessels, kidneys and renal vessels, brain, pleura, valves and papillary muscles, the vertebral artery (source has only .l).',
               'Routes inside the heart, lungs and liver and the exchange arcs at the ends are schematic (routes.json flags them).'])
    manifest['budgets']['total'] = dict(targetBytes=4000000, maxBytes=8000000, targetTriangles=350000, maxTriangles=500000)
    for p in parts:
        p['objects'] = sorted({base(n) for n in p['sourceNames']}); p.pop('patterns', None)
    # Every landmark and route source must exist among the selected sources.
    selected = {n for p in parts for n in p['sourceNames']}
    selected_base = {base(n) for n in selected}
    for id, spec in manifest['landmarks'].items():
        for n in spec['sources'] + spec.get('to', []):
            if n not in selected and n not in selected_base: raise RuntimeError(f'Landmark {id}: unknown source {n}')
    for fid, flow in manifest['routes']['flows'].items():
        for pid, legs in flow.get('paths', {}).items():
            for leg in legs:
                for n in leg.get('chain', []):
                    if re.sub(r'(?:#\d+)?~?$', '', n) not in selected: raise RuntimeError(f'Route {fid}/{pid}: unknown source {n}')
    text = json.dumps(manifest, indent=2)+'\n'
    (HERE/'manifest.json').write_text(text)
    (HERE/'MANIFEST-READY').write_text('sha256 '+hashlib.sha256(text.encode()).hexdigest()+'\n')
    print('MANIFEST-READY heart-lungs:', len(manifest['expectedNodes']), 'nodes;',
          sum(len(p['sourceNames']) for p in parts if p['id'] != 'skin-wire'), 'source objects;',
          sum(len(f.get('paths', {})) for f in manifest['routes']['flows'].values()), 'explicit route paths')
    return manifest


if __name__ == '__main__':
    generate()
