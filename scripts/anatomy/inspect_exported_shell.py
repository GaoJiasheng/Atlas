"""Inspect and repair exact codec-roundtripped skin weight vectors."""
import json,sys
from pathlib import Path
from full_body import shell_aliases,match_shell_weights
from skin_weights import repair,inspect
path=Path(sys.argv[1]);meshes=json.loads(path.read_text());updates=[]
for mesh in meshes:
    if mesh['role']!='skin': continue
    aliases=shell_aliases(mesh['points'],mesh['faces'])
    mismatches=sum(any(abs(w.get(n,0)-mesh['weights'][aliases[i]].get(n,0))>1e-6 for n in mesh['joints']) for i,w in enumerate(mesh['weights']))
    check=inspect(mesh['points'],mesh['faces'],mesh['weights'],mesh['joints'],aliases)
    if not mismatches and not check['outlierCount']: continue
    match_shell_weights(mesh['weights'],aliases)
    weights,_,stats=repair(mesh['points'],mesh['faces'],mesh['weights'],mesh['joints'],shell_aliases=aliases)
    assert not inspect(mesh['points'],mesh['faces'],weights,mesh['joints'],aliases)['outlierCount']
    updates.append(dict(name=mesh['name'],weights=weights,sourceVertices=mesh['sourceVertices'],shellMismatchesFixed=mismatches,outliersFixed=stats['outliersFixed']))
path.write_text(json.dumps(updates))
print('CODEC SHELL: '+str(len(updates))+' meshes require repair',flush=True)
