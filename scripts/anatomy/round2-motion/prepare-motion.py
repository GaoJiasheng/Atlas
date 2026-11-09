"""Writes a reviewable, motion-only patch; does not edit shared fitness data."""
import copy,difflib,json
from pathlib import Path
rows=json.loads(Path('scripts/anatomy/round2-motion/solutions.json').read_text())
changes=[]
for row in rows:
    file='horizontal-push' if row['topic']=='chest' else 'arms'
    id='barbell-bench-press' if row['topic']=='chest' else 'close-grip-bench-press'
    p=Path(f'src/content/shared/fitness/exercises/{file}.json')
    before=p.read_text();data=json.loads(before);e=next(e for e in data['exercises'] if e['id']==id)
    original=copy.deepcopy(e['motion'])
    e['motion']['root']={'rotation':row['support']['rootRotation']}
    next(spec for spec in e['motion']['equipment'] if spec['kind']=='bench')['at']=row['support']['benchAt']
    if row['topic']=='arms':
        e['motion']['keys'].reverse()
    for phase,key in zip(['start','end'],e['motion']['keys']):
        key['phase']=phase
        for name,angles in row[phase]['angles'].items():
            key['joints'][name]={movement:round(value,3) for movement,value in angles.items()}
            # Keep authored values within schema [-180,180] without changing
            # the executing folded axis angle or interpolation path.
            if key['joints'][name].get('pronation',0)<-180:
                total=key['joints'][name]['pronation']
                key['joints'][name]['pronation']=-180
                key['joints'][name]['supination']=round(-180-total,3)
    e['motion']['equipment'][0]['width']=round(abs(row['end']['points']['palm']['x']-row['end']['points']['rightPalm']['x']),3)
    Path(f'scripts/anatomy/round2-motion/{id}-motion.json').write_text(json.dumps(e['motion'],indent=2)+'\n')
    Path(f'scripts/anatomy/round2-motion/{id}-before.json').write_text(json.dumps(original,indent=2)+'\n')
    after=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
    changes.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+str(p),tofile='b/'+str(p)))
Path('scripts/anatomy/round2-motion/bench-motions.patch').write_text(''.join(changes))
