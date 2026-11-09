import json
from pathlib import Path
rows=json.loads(Path('scripts/anatomy/round3/bench-solutions.json').read_text())
for row in rows:
 file='horizontal-push' if row['topic']=='chest' else 'arms';id='barbell-bench-press' if file=='horizontal-push' else 'close-grip-bench-press';p=Path(f'src/content/shared/fitness/exercises/{file}.json');data=json.loads(p.read_text());e=next(e for e in data['exercises']if e['id']==id)
 for phase,key in zip(['start','end'],e['motion']['keys']):
  for name,angles in row[phase]['angles'].items():
   if not name.startswith(('shoulder.','elbow.','forearm.')):continue
   angles={m:round(v,3) for m,v in angles.items()}
   for m,v in list(angles.items()):
    if v<-180 and m=='pronation':angles[m]=-180;angles['supination']=round(-180-v,3)
   key['joints'][name]=angles
 e['motion']['equipment'][0]['width']=round(abs(row['end']['points']['palm']['x']-row['end']['points']['rightPalm']['x']),4)
 p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
