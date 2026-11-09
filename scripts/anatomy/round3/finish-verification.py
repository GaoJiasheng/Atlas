"""Verify the final authored-camera delta after the complete green suites.
Copies only owned files; leaves candidate PartNode patch in place in its snapshot.
"""
from pathlib import Path
import subprocess,shutil,json,time,hashlib
root=Path(__file__).resolve().parents[3]
for suffix in ['','-patch']:
 snap=Path('/private/tmp/atlas-muscles-round3'+suffix+'-gates');log=root/('scripts/anatomy/round3/gates-patched'if suffix else 'scripts/anatomy/round3/gates');results=json.loads((log/'results.json').read_text())
 for path in ['src/content/topics/muscles-back/chapters/05-training-the-back.mdx','src/engines/space-scene/stages/model3d/Equipment.tsx','scripts/anatomy/round2-overlay-finish.mjs']:
  shutil.copy2(root/path,snap/path)
 subprocess.run(['rsync','-a',str(root/'scripts/anatomy/round3')+'/',str(snap/'scripts/anatomy/round3')+'/','--exclude=comparisons','--exclude=before','--exclude=gates*'],check=True)
 for command in [['pnpm','exec','tsc','--noEmit'],['pnpm','test','tests/muscles-round3.test.ts'],['pnpm','build'],['pnpm','exec','vitest','run','tests/js-budget.test.ts']]:
  name='final-'+('-'.join(command[1:]).replace('/','_'));start=time.time()
  with (log/(name+'.log')).open('w')as out:p=subprocess.run(command,cwd=snap,stdout=out,stderr=subprocess.STDOUT)
  results.append({'command':' '.join(command),'exitCode':p.returncode,'seconds':round(time.time()-start,2),'log':str(log/(name+'.log'))});(log/'results.json').write_text(json.dumps(results,indent=2));print(suffix or 'live',results[-1],flush=True)
  if p.returncode:raise SystemExit(p.returncode)
