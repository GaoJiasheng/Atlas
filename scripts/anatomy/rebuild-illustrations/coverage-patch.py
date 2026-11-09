"""Prepare, never apply, the out-of-scope shared coverage integration."""
import json,difflib
from pathlib import Path
root=Path(__file__).resolve().parents[3]
p=root/'src/lib/illustrations.json';before=p.read_text();old=json.loads(before)
new=json.loads((Path(__file__).resolve().parent/'coverage-masks.json').read_text())
expected={f'muscles-{t}' for t in ['arms','back','chest','core','legs','shoulders']}
assert set(new)==expected
for key in expected:
    assert len(new[key]['mask'])==16 and all(len(row)==16 for row in new[key]['mask'])
    old[key]=new[key]
after=json.dumps(old,ensure_ascii=False,indent=2)+'\n'
patch=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/src/lib/illustrations.json',tofile='b/src/lib/illustrations.json'))
(Path(__file__).resolve().parent/'shared-coverage.patch').write_text(patch)
