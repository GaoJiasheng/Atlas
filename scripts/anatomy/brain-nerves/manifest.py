"""Inventory- and provenance-validated selection for brain-and-nerves (docs/75 §3.4, §5). No Blender, no network.

Every source name is checked against cache/inventory.json. Every Nervous FBX source must have an
allowed family in provenance.json (gate G2): the generator refuses `unknown`, the Dundee inner ear
(CC BY-NC-SA) and the University of Washington white matter (licence not found), so none of them
can reach the CC BY-SA 4.0 GLB. `test_manifest.py` pins the refusal.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HERE = ROOT / 'brain-nerves'
ALLOWED = {'bp3d-zanatomy', 'brainder', 'dundee-cn'}

CHANGES = ('structures selected for the nervous system with skull, spine and right-arm context; cortex parcels '
           'joined into lobes (sulci split along the nearest gyrus); right forearm and hand split at the elbow; '
           'biceps fibre direction baked; underside of the cerebrum pressed locally clear of the skull (smooth displacement, '
           'at most 7 mm); BodyParts3D cerebellum placed by the brainstem fit, with a schematic pattern of folds cut in by Atlas; a plain closed core drawn by Atlas inside each half of the cerebrum; '
           'simplified; renamed.')
ATTRIBUTION = [
    'Cerebellum: BodyParts3D 4.0 (FMA67944), (c) The Database Center for Life Science, CC BY 4.0',
    '(https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html). Spinal cord: drawn by Atlas (not in this file).',
    'Cerebral cortex surfaces: Anderson Winkler, Brain for Blender (https://brainder.org), CC BY-SA 3.0,',
    'from FreeSurfer surfaces with the Destrieux parcellation, as adapted in Z-Anatomy; adapted here under CC BY-SA 4.0.',
    'Cranial nerves: Cranial Nerves and Foramina, University of Dundee CAHID, CC BY 4.0, as adapted in Z-Anatomy.',
]

LOBES = {'frontal-lobe': 'Frontal lobe.g', 'parietal-lobe': 'Parietal lobe.g', 'temporal-lobe': 'Temporal lobe.g',
         'occipital-lobe': 'Occipital lobe.g', 'insula': 'Insula.g', 'cerebrum-medial': 'Limbic lobe.g'}
# Boundary sulci: each face goes to the lobe of the nearest gyral face (lobes.py in build.py).
SPLIT = 'Interlobar sulci.g'
SPLIT_EXTRA = ['Cingulate sulcus (Marginal part*)']
NOT_CORTEX = ['Hippocampus']

CEREBELLUM = ['Anterior quadrangular lobule', 'Biventral lobule', 'Central lobule', 'Culmen', 'Declive', 'Flocculus',
              'Folium of vermis', 'Gracile lobule', 'Inferior semilunar lobule', 'Lingula of cerebellum', 'Nodule of vermis',
              'Peduncle of flocculus', 'Posterior quadrangular lobule', 'Pyramis of vermis', 'Superior cerebellar peduncle',
              'Superior semilunar lobule', 'Tonsil of cerebellum', 'Tuber of vermis', 'Uvula of vermis', 'Wing of central lobule']
ARM_NERVES = ['Roots of brachial plexus', 'Superior trunk of brachial plexus', 'Middle trunk of brachial plexus',
              'Inferior trunk of brachial plexus', 'Anterior division of superior trunk of brachial plexus',
              'Posterior division of superior trunk of brachial plexus', 'Anterior division of middle trunk of brachial plexus',
              'Posterior division of middle trunk of brachial plexus', 'Anterior division of inferior trunk of brachial plexus',
              'Posterior division of inferior trunk of brachial plexus', 'Posterior cord of brachial plexus', 'Musculocutaneous nerve',
              'Lateral antebrachial cutaneous nerve', 'Median nerve', 'Ulnar nerve', 'Radial nerve', 'Deep branch of radial nerve',
              'Superficial branch of radial nerve', 'Axillary nerve', 'Common palmar digital branches of median nerve',
              'Proper palmar digital branches of median nerve']
LEG_NERVES = ['Sciatic nerve', 'Tibial nerve', 'Common fibular nerve', 'Deep fibular nerve', 'Superficial fibular nerve',
              'Femoral nerve', 'Obturator nerve', 'Saphenous nerve']
CRANIAL = ['Olfactory nerve (I)', 'Oculomotor nerve (III)', 'Trochlear nerve (IV)', 'Trigeminal nerve (V)',
           'Ophthalmic nerve', 'Maxillary nerve', 'Abducens nerve (VI)', 'Facial nerve (VII)', 'Glossopharyngeal nerve (IX)',
           'Vagus nerve (X)', 'Accessory nerve (XI)', 'Hypoglossal nerve (XII)']
SKULL = ['Frontal bone', 'Parietal bone', 'Temporal bone', 'Occipital bone', 'Sphenoid bone', 'Ethmoid bone', 'Maxilla',
         'Mandible', 'Zygomatic bone', 'Nasal bone', 'Palatine bone', 'Vomer', 'Lacrimal bone']
SPINE = ['Atlas (C1)', 'Axis (C2)', 'Sacrum', 'Coccyx'] + [f'Vertebra {x}' for x in
         ['C3', 'C4', 'C5', 'C6', 'C7'] + [f'T{i}' for i in range(1, 13)] + [f'L{i}' for i in range(1, 6)]]
HAND = r'(?:.* (?:phalanx of .* finger of hand|metacarpal bone)|Scaphoid bone|Lunate bone|Triquetrum bone|Pisiform bone|' \
       r'Trapezium bone|Trapezoid bone|Capitate bone|Hamate bone)'
REST = ['Clavicle', 'Scapula', 'Hip bone', 'Femur', 'Patella', 'Tibia', 'Fibula', 'Talus', 'Calcaneus', 'Manubrium of sternum',
        'Body of sternum', 'Xiphoid process', 'Humerus', 'Radius', 'Ulna']
FOOT = r'(?:.* (?:phalanx of .* finger of foot|metatarsal bone)|Navicular bone|Cuboid bone|(?:Medial|Intermediate|Lateral) cuneiform bone)'


def base(n):
    return re.sub(r'(?:\.[lr])?(?:\.\d+)?$', '', n)


def generate(inventory=None, provenance=None, write=True):
    entries = inventory if inventory is not None else json.loads((ROOT / 'cache/inventory.json').read_text())['objects']
    prov = provenance if provenance is not None else json.loads((HERE / 'provenance.json').read_text())['nodes']
    meshes = [e for e in entries if e['type'] == 'MESH' and e['triangles'] > 12 and 'attachment' not in e]
    parent = {e['name']: e.get('sourceParent') for e in entries}

    def ancestors(n):
        out = []
        while parent.get(n):
            n = parent[n]
            out.append(n)
        return out

    parts = []

    def part(id, system, names=(), patterns=(), sides='unsided', side_filter=None, budget=3000, role='organ', dev=.0008,
             group=None, exact=False, extra=None):
        found = []
        for e in meshes:
            if e['system'] != system:
                continue
            n = e['name']
            hit = (n in names) if exact else (base(n) in names or any(re.fullmatch(p, base(n)) for p in patterns))
            if hit and (side_filter is None or e['side'] == side_filter):
                found.append(e)
        if group:
            found += [e for e in meshes if e['system'] == system and group in ancestors(e['name']) and e not in found
                      and base(e['name']) not in NOT_CORTEX and (side_filter is None or e['side'] == side_filter)]
        wanted = set(names) if not exact else set(names)
        missing = [o for o in wanted if not any((e['name'] if exact else base(e['name'])) == o for e in found)]
        if not found or missing:
            raise RuntimeError(f'Missing source for {id}: {missing or names}')
        if system == 'nervous':
            for e in found:
                r = prov.get(e['name'])
                if r is None or r['family'] not in ALLOWED:
                    raise RuntimeError(f'Provenance gate: {e["name"]} ({r["family"] if r else "no record"}) cannot go into the CC BY-SA GLB')
        p = dict(id=id, system=system, role=role, sides=sides, triangleBudget=budget, maxDeviationM=dev,
                 sourceNames=sorted(e['name'] for e in found),
                 families=sorted({prov[e['name']]['family'] for e in found}) if system == 'nervous' else ['bp3d-zanatomy'],
                 sourceTriangles=sum(e['triangles'] for e in found))
        if extra:
            p.update(extra)
        parts.append(p)
        return p

    for side in 'lr':
        for id, grp in LOBES.items():
            part(f'{id}.{side}', 'nervous', group=grp, side_filter=side, budget=dict(
                # The source cortex is already a light FreeSurfer surface (~55 k triangles per hemisphere):
                # kept whole, so the gyri stay as Brainder drew them.
                {'frontal-lobe': 21000, 'parietal-lobe': 12000, 'temporal-lobe': 12000, 'occipital-lobe': 10000,
                 'insula': 1200, 'cerebrum-medial': 3500})[id], dev=.0005, role='cortex', extra=dict(lobe=id))
        part(f'cortex-split.{side}', 'nervous', group=SPLIT, names=SPLIT_EXTRA, side_filter=side, budget=0, role='split')
    # The Z-Anatomy cerebellum and spinal-cord outline have no attributable source (provenance.md); Gavin
    # (2026-11-15): BodyParts3D 4.0 cerebellum (CC BY 4.0), placed with the BodyParts3D frame that the
    # brainstem fits; the spinal cord is procedural in parts.json (a sweep along the dural sac).
    elements = [l.split('\t') for l in (ROOT / 'cache/bp3d/partof_element_parts.txt').read_text().splitlines()[1:]]
    cer = sorted(r[2].strip() for r in elements if r[0] == 'FMA67944')
    if not cer:
        raise RuntimeError('BodyParts3D FMA67944 cerebellum elements missing from the cached parts list')
    parts.append(dict(id='cerebellum', system='bp3d', role='organ', sides='unsided', triangleBudget=28000, maxDeviationM=.0001,
                      sourceNames=cer, families=['bp3d-4.0'], fma='FMA67944',
                      placement='similarity transform fitted on BodyParts3D 4.0 pons + medulla (provenance.py)'))
    part('midbrain', 'nervous', ['Midbrain'], budget=2000)
    part('pons', 'nervous', ['Pons'], budget=2000)
    part('medulla', 'nervous', ['Medulla oblongata'], budget=2000)
    part('ventricles', 'nervous', ['Lateral ventricle', 'Third ventricle', 'Aqueduct of midbrain', 'Fourth ventricle'], budget=3000)
    part('cauda-equina', 'nervous', ['Cauda equina'], budget=2500)
    part('spinal-roots', 'nervous', ['Anterior root of spinal nerve', 'Posterior root of spinal nerve', 'Spinal ganglion'], budget=4000)
    for side in 'lr':
        part(f'arm-nerves.{side}', 'nervous', ARM_NERVES, side_filter=side, budget=5000, dev=.0006,
             extra=dict(splitForearm=side == 'r'))
        part(f'leg-nerves.{side}', 'nervous', LEG_NERVES, side_filter=side, budget=5000, dev=.0006)
        part(f'trunk-nerves.{side}', 'nervous', ['Intercostal nerves'], side_filter=side, budget=2500, dev=.0008)
    part('optic-pathway', 'nervous', ['Optic nerve (II)', 'Optic chiasm', 'Optic tract'], budget=2000)
    part('hearing-nerve', 'nervous', ['Vestibulocochlear nerve (VIII)'], budget=800)
    part('cranial-nerves', 'nervous', CRANIAL, budget=6000, dev=.0008)
    part('dura-folds', 'nervous', ['Falx cerebri', 'Tentorium cerebelli'], budget=2000)
    part('spinal-dura', 'nervous', ['Spinal dura'], budget=2500)
    part('skull', 'skeleton', SKULL, budget=30000, dev=.001)
    part('vertebral-column', 'skeleton', SPINE, budget=26000, dev=.001)
    part('biceps-r', 'muscles', ['Long head of biceps brachii.r', 'Short head of biceps brachii.r'], exact=True, budget=4000,
         role='muscle', dev=.0008, extra=dict(fibre=dict(origin=['Long head of biceps brachii.or'],
                                                       insertion=['Biceps brachii muscle.er'])))
    part('triceps-r', 'muscles', ['Long head of triceps brachii.r', 'Lateral head of triceps brachii.r', 'Medial head of triceps brachii.r'],
         exact=True, budget=3000, dev=.001)
    part('upper-arm-bone-r', 'skeleton', ['Humerus.r'], exact=True, budget=2000, dev=.001)
    part('forearm-hand-r', 'skeleton', ['Radius', 'Ulna'], patterns=[HAND], side_filter='r', budget=6000, dev=.001)
    rest = part('skeleton-rest', 'skeleton', REST, patterns=[r'.* rib', r'Costal cartilage.*', HAND, FOOT], budget=22000, dev=.003,
                role='system')
    # The right arm's bones are their own parts.
    rest['sourceNames'] = [n for n in rest['sourceNames'] if not (n.endswith('.r') and (base(n) in ('Humerus', 'Radius', 'Ulna') or re.fullmatch(HAND, base(n))))]
    # Cerebrum core: drawn by Atlas in build.py (cerebrum_core), a plain closed stand-in inside each hemisphere's shell.
    parts.append(dict(id='cerebrum-core', system='atlas', role='organ', sides='bilateral', triangleBudget=10240, maxDeviationM=0,
                      sourceNames=['atlas:cerebrum_core (build.py)'], families=['atlas']))
    # Body outline: the two skin nodes of public/models/heart-and-lungs.glb, same body and frame, unchanged.
    for id in ('skin-outline', 'skin-wire'):
        parts.append(dict(id=id, system='atlas-glb', role='skin', sides='unsided', triangleBudget=0, maxDeviationM=0,
                          sourceNames=[f'heart-and-lungs.glb#{id}'], families=['bp3d-zanatomy']))

    nodes = [p['id'] for p in parts if p['role'] != 'split']
    nodes = [n for n in nodes if n != 'cerebrum-core'] + ['cerebrum-core.l', 'cerebrum-core.r']
    if 'arm-nerves.r' in nodes:
        nodes.append('arm-nerves-forearm.r')
    manifest = dict(topic='brain-nerves', output='brain-and-nerves.glb', rig=False, license='CC BY-SA 4.0', changes=CHANGES,
                    attribution=ATTRIBUTION,
                    staticNote='Static meshes; no rig, weights or attachment sites; the right biceps carries a straight fibre direction.',
                    coordinates=dict(unit='m', up='+Y', front='+Z', left='+X',
                                     centre='umbilicus midline; same source centre and transform as digestive / heart-lungs (digestive/organs.json)'),
                    budgets=dict(total=dict(targetBytes=4000000, maxBytes=8000000, targetTriangles=350000, maxTriangles=500000)),
                    parts=parts, expectedNodes=sorted(nodes),
                    notes=['Nervous FBX sources pass the provenance gate (provenance.json): families bp3d-zanatomy, brainder, dundee-cn only.',
                           'Not taken: white-matter tracts and fibres, the corpus callosum (white-matter family), the inner ear, eye structures, '
                           'nuclei, the sympathetic trunk, digital and cutaneous nerve branches.',
                           'No rig or weights. The right forearm and hand turn about the elbow landmark in the engine (landmarks.json).'])
    if write:
        text = json.dumps(manifest, indent=2) + '\n'
        (HERE / 'manifest.json').write_text(text)
        (HERE / 'MANIFEST-READY').write_text('sha256 ' + hashlib.sha256(text.encode()).hexdigest() + '\n')
        print('MANIFEST-READY brain-nerves:', len(nodes), 'nodes;', sum(len(p['sourceNames']) for p in parts), 'source objects;',
              sum(p['triangleBudget'] for p in parts), 'triangle budget')
    return manifest


if __name__ == '__main__':
    generate()
