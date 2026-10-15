"""Inventory-validated digestive selection. Run without Blender; never downloads."""
import hashlib
import json
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def generate():
    entries = json.loads((ROOT/'cache/inventory.json').read_text())['objects']
    def base(n): return re.sub(r'(?:\.[lr])?(?:\.\d+)?$', '', n)
    parts=[]
    def part(id, objects, system='visceral', role='organ', budget=3000, sides='unsided', patterns=(), body='digestive', layer='mouth'):
        p=dict(id=id,objects=objects,system=system,bodySystem=body,role=role,layer=layer,sides=sides,triangleBudget=budget)
        if patterns: p['patterns']=list(patterns)
        found=[e for e in entries if e['system']==system and e['type']=='MESH' and e['triangles'] and not e.get('attachment') and (base(e['name']) in objects or any(re.fullmatch(r,base(e['name'])) for r in patterns))]
        if not found: raise RuntimeError(f'Missing source: {id}')
        p['sourceNames']=[e['name'] for e in found]
        p['minimumObjects']=len(found)//2 if sides=='bilateral' else len(found)
        p['sourceClosed']=all(e['closed'] for e in found)
        # Intent controls section caps; never confuse with source watertightness.
        p['closed']=p['sourceClosed'] and role not in ('tube','skin')
        parts.append(p)
        return p
    for side in ['upper','lower']:
        part('teeth-'+side,[], 'skeleton',budget=4500,patterns=[side.title()+r' (?:canine|first molar tooth|first premolar|lateral incisor|medial incisor|second molar tooth|second premolar)'])
    part('tongue',['Tongue'],budget=1000)
    part('salivary-glands',['Parotid gland','Submandibular gland','Sublingual gland'],budget=2500,sides='bilateral')
    part('pharynx',['Oropharynx','Laryngopharynx'],budget=3500)
    tubes=[('oesophagus','Oesophagus',4000,'gullet-stomach'),('stomach','Stomach',10000,'gullet-stomach'),
           ('duodenum','Duodenum',3000,'small-intestine'),('jejunum','Jejunum',26000,'small-intestine'),
           ('appendix','Vermiform appendix',1000,'large-intestine'),('ascending-colon','Ascending colon',6000,'large-intestine'),
           ('transverse-colon','Transverse colon',7000,'large-intestine'),('descending-colon','Descending colon',9000,'large-intestine'),
           ('sigmoid-colon','Sigmoid colon',4000,'large-intestine')]
    order=['pharynx','oesophagus','stomach','duodenum','jejunum','ascending-colon','transverse-colon','descending-colon','sigmoid-colon']
    for id,source,budget,layer in tubes:
        p=part(id,[source],role='tube',budget=budget,layer=layer)
        if id=='appendix': p['centreline']={'from':'ascending-colon','to':None,'branch':True}
        else:
            i=order.index(id)
            p['centreline']={'from':order[i-1],'to':order[i+1] if i+1<len(order) else None}
    # The source stomach has a round display window cut through its front wall
    # (Z-Anatomy shows the lining through it). A pupil reads it as a hole, so the
    # build closes that one opening with a smooth patch that continues the wall
    # (static_region.fill_openings); the cardia and pylorus rings stay open.
    next(p for p in parts if p['id']=='stomach')['fillOpenings']=[dict(near=[0.06,0.135,-0.034],maxRadiusM=0.04,reason='display window in the anterior wall of the source stomach')]
    for id,source,b in [('liver','Liver',10000),('gallbladder','Gallbladder',2000),('pancreas','Pancreas',5000),('bile-duct','Bile duct',2000)]:
        part(id,[source],budget=b,layer='helpers')
    # One low-poly mesh per system. Skull/jaw, ribs, spine, pelvis and long bones
    # are retained inside the named skeleton node, not extra duplicate meshes.
    skull=['Frontal bone','Parietal bone','Temporal bone','Occipital bone','Sphenoid bone','Ethmoid bone','Maxilla','Mandible','Zygomatic bone','Nasal bone','Palatine bone','Vomer','Lacrimal bone']
    bones=skull+['Manubrium of sternum','Body of sternum','Xiphoid process','Atlas (C1)','Axis (C2)','Hip bone','Sacrum','Coccyx','Clavicle','Scapula','Humerus','Radius','Ulna','Femur','Patella','Tibia','Fibula','Talus','Calcaneus']
    part('skeleton',bones,'skeleton','system',40000,patterns=[r'Vertebra [CTL]\d+',r'.* rib',r'Costal cartilage.*'],body='skeletal',layer='body-systems')
    muscles=['Clavicular head of pectoralis major muscle','Sternocostal head of pectoralis major muscle','(Abdominal part of pectoralis major muscle)', 'Rectus abdominis muscle','External abdominal oblique muscle','Anterior part of deltoid muscle','Acromial part of deltoid muscle','Posterior part of deltoid muscle','Clavicular part of deltoid muscle','Scapular spinal part of deltoid muscle','Biceps brachii muscle','Long head of biceps brachii','Short head of biceps brachii','Long head of triceps brachii','Lateral head of triceps brachii','Rectus femoris muscle','Vastus lateralis muscle','Vastus medialis muscle','Sartorius muscle','Tibialis anterior muscle','Medial head of gastrocnemius','Lateral head of gastrocnemius','Gluteus maximus muscle','Latissimus dorsi muscle','Descending part of trapezius muscle','Transverse part of trapezius muscle','Ascending part of trapezius muscle']
    part('muscles-superficial',muscles,'muscles','system',35000,body='muscular',layer='body-systems')['protectFolds']=True
    part('diaphragm',['Diaphragm'],'muscles','system',4000,body='muscular',layer='body-systems')
    part('lungs',[],role='system',budget=14000,patterns=[r'(?:Superior|Middle|Inferior) lobe of (?:left|right) lung'],body='respiratory',layer='body-systems')
    part('trachea',['Trachea'],role='system',budget=3500,body='respiratory',layer='body-systems')
    part('heart',['Left atrium','Right atrium','Left ventricle','Right ventricle'],'cardiovascular','system',9000,body='circulatory',layer='body-systems')
    part('great-vessels',['Ascending aorta','Aortic arch','Thoracic aorta','Abdominal aorta','Superior vena cava','Inferior vena cava (abdominal part)','Inferior vena cava (thoracic part)','Pulmonary trunk','Bifurcation of pulmonary trunk','Left pulmonary artery','Right pulmonary artery'],'cardiovascular','system',4000,body='circulatory',layer='body-systems')
    skin=next(p for p in json.loads((ROOT/'core/manifest.json').read_text())['parts'] if p['role']=='skin')
    part('skin-outline',skin['objects'],'regions','skin',18000,body='integumentary',layer='context')
    part('skin-wire',skin['objects'],'regions','skin',4000,body='integumentary',layer='context')['triangleCap']=5000
    missing=[dict(id=id,status='missing',reason='No named mesh or parent exists in the cached source inventory; no substitute invented.') for id in ['ileum','caecum','rectum','anal-canal']]
    manifest=dict(topic='digestive',output='digestive-system.glb',rig=False,license='CC BY-SA 4.0',
        coordinates=dict(unit='m',up='+Y',front='+Z',left='+X',centre='umbilicus midline; source floor and transform in organs.json'),
        budgets={role:dict(maxDeviationM=dev,triangleTargetRange=rng) for role,dev,rng in [('tube',.0015,[3000,26000]),('organ',.0015,[2000,15000]),('system',.004,[4000,40000]),('skin',.035,[3000,18000])]},parts=parts,
        expectedNodes=[p['id']+('.'+s if s else '') for p in parts for s in (['l','r'] if p['sides']=='bilateral' else [None])],
        skinNodes=['skin-outline','skin-wire'],centrelineOrder=['pharynx','oesophagus','stomach','duodenum','jejunum','ileum','caecum','ascending-colon','transverse-colon','descending-colon','sigmoid-colon','rectum','anal-canal'],missingOrgans=missing,
        notes=['No rig, skin weights, fibres or attachment sites. Tube _U is normalized centreline station, 0 upstream.',
               'Separate real left/right salivary glands. Source has 28 teeth; third molars absent.',
               'Ileum, caecum, rectum and anal canal are not separately labelled. No synthetic replacements.',
               'Lungs and trachea come from VisceralSystem100.fbx; CardioVascular41.fbx has no lungs or single Heart mesh.',
               'Skin retains full hands as static context. No articulated hand cuts are needed.',
               'Procedural tooth, stomach wall and villi close-ups are outside this pipeline.',
               'The stomach source display window is closed by a smooth wall patch (fillOpenings); no other opening is filled.'])
    manifest['budgets']['total']=dict(targetBytes=4000000,maxBytes=8000000,targetTriangles=350000,maxTriangles=500000)
    for p in parts:
        # Do not silently retain stale/nonexistent candidate labels.
        p['objects']=sorted({base(n) for n in p['sourceNames']});p.pop('patterns',None)
    text=json.dumps(manifest,indent=2)+'\n'
    (ROOT/'digestive/manifest.json').write_text(text)
    (ROOT/'digestive/MANIFEST-READY').write_text('sha256 '+hashlib.sha256(text.encode()).hexdigest()+'\n')
    files=[]
    for system,filename in [('visceral','VisceralSystem100.fbx'),('cardiovascular','CardioVascular41.fbx')]:
        local=ROOT/'cache'/filename;objects=[e for e in entries if e['system']==system]
        files.append(dict(system=system,file=filename,bytes=local.stat().st_size,sha256=hashlib.sha256(local.read_bytes()).hexdigest(),objects=len(objects),meshes=sum(e['type']=='MESH' for e in objects),triangles=sum(e['triangles'] for e in objects),closedMeshes=sum(e['closed'] for e in objects)))
    (ROOT/'digestive/source-files.json').write_text(json.dumps(files,indent=2)+'\n')
    rows=['# New cached FBX inventory','', 'Scanned natively with Blender 5.1.2, all cached objects including unexported helpers. Closedness welds coincident positions at 0.1 micrometre precision. No downloads. Source hashes and counts: [source-files.json](source-files.json).','', '| System | Object | Type | Triangles | Closed | Boundary edges | Nonmanifold edges |','|---|---|---|---:|---|---:|---:|']
    for e in entries:
        if e['system'] in ('visceral','cardiovascular'):
            rows.append(f"| {e['system']} | {e['name']} | {e['type']} | {e['triangles']} | {e['closed']} | {e['boundaryEdges']} | {e['nonmanifoldEdges']} |")
    (ROOT/'digestive/inventory.md').write_text('\n'.join(rows)+'\n')
    print('MANIFEST-READY digestive:',len(manifest['expectedNodes']),'nodes; missing:',','.join(e['id'] for e in missing))
    return manifest
if __name__=='__main__': generate()
