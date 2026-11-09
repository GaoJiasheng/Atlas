"""Sequential full gates; no browser, desktop automation or git writes."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[3]
ASSET = ROOT / 'public/models/flower-and-seed.glb'
OUT = ROOT / 'scripts/geo/flower-and-seed/evidence/fur-verification.json'
initial = hashlib.sha256(ASSET.read_bytes()).hexdigest()
parser = argparse.ArgumentParser()
parser.add_argument('--resume', action='store_true')
args = parser.parse_args()
stages = []
attempts = []
if args.resume and OUT.exists():
    saved = json.loads(OUT.read_text())
    if saved['assetSha256'] != initial:
        raise RuntimeError('Cannot resume gates for a different asset')
    stages = [s for s in saved['stages'] if s['exitCode'] == 0]
    attempts = saved.get('attempts', []) + [s for s in saved['stages'] if s['exitCode'] != 0]
commands = [
    ('counts', ['pnpm', 'tsx', 'scripts/geo/flower-and-seed/tris.ts']),
    ('check', ['pnpm', 'check']),
    ('validate', ['pnpm', 'validate']),
    ('test', ['pnpm', 'run', 'test', '--maxWorkers=1', '--testTimeout=30000', '--pool=threads', '--reporter=dot']),
    ('build', ['pnpm', 'build']),
]
for name, command in commands:
    if any(stage['stage'] == name for stage in stages):
        continue
    log = Path('/tmp') / f'flower-fur-final-{name}.log'
    start = time.monotonic()
    print(f'{name}: running', flush=True)
    with log.open('w') as output:
        result = subprocess.run(command, cwd=ROOT, stdout=output, stderr=subprocess.STDOUT)
    if name == "counts":
        (OUT.parent / "fur-after-counts.txt").write_text(log.read_text())
    stages.append(dict(stage=name, command=command, exitCode=result.returncode,
                       seconds=round(time.monotonic()-start, 2), log=str(log)))
    OUT.write_text(json.dumps(dict(assetSha256=initial, stages=stages, attempts=attempts), indent=2)+'\n')
    print(f'{name}: exit {result.returncode}', flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
if hashlib.sha256(ASSET.read_bytes()).hexdigest() != initial:
    raise RuntimeError('Asset changed during gates')
print('All gates passed; asset hash unchanged.', flush=True)
