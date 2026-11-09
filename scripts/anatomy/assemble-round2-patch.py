"""Single application entry point for the explicitly out-of-scope fixes.
This writes diffs only. Shared engine/content/manifest files stay untouched.
"""
from pathlib import Path
import difflib,json,subprocess
root=Path(__file__).resolve().parents[2]
subprocess.run(['python3',str(root/'scripts/anatomy/round2-integration.py')],check=True,cwd=root)
mask_path='src/lib/illustrations.json'
old=(root/mask_path).read_text(); data=json.loads(old)
for key,value in json.loads((root/'scripts/anatomy/rebuild-illustrations/coverage-masks.json').read_text()).items():data[key]=value
mask=''.join(difflib.unified_diff(old.splitlines(True),(json.dumps(data,ensure_ascii=False,indent=2)+'\n').splitlines(True),fromfile='a/'+mask_path,tofile='b/'+mask_path))
(root/'scripts/anatomy/rebuild-illustrations/shared-coverage.patch').write_text(mask)
patch=(root/'scripts/anatomy/round2-exercise-projections.patch').read_text()+(root/'scripts/anatomy/round2-motion/bench-motions.patch').read_text()+mask
(root/'scripts/anatomy/round2-acceptance.patch').write_text(patch)
print('Combined patch:',len(patch),'bytes; live shared files untouched')
