"""Offline native Blender pipeline; all inputs must already be in cache/."""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT/'cache'
WORKSPACE = ROOT.parents[1]
TOPICS = ('chest','back','shoulders','arms','legs','core')
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--topic', choices=TOPICS, default='chest')
parser.add_argument('--refresh-inventory', action='store_true', help='re-scan all four cached FBX systems')
args = parser.parse_args()
topic=args.topic
for executable in ['pnpm','blender']:
    if not shutil.which(executable): raise SystemExit(f'Missing requirement: {executable}')
for source in ['MuscularSystem100.fbx','SkeletalSystem100.fbx','Regions of human body100.fbx']:
    if not (CACHE/source).exists(): raise SystemExit(f'Missing offline input: {source}; downloads are disabled')
if not (ROOT/topic/'manifest.json').exists(): raise SystemExit(f'Write {topic}/manifest.json first')

def run(command):
    print('RUN '+' '.join(command),flush=True)
    subprocess.run(command,cwd=WORKSPACE,check=True)

def blender(file):
    run(['blender','-b','--python-exit-code','1','-P',str(ROOT/file),'--','--topic',topic])

chest=WORKSPACE/'public/models/muscles-chest.glb'
before=hashlib.sha256(chest.read_bytes()).hexdigest() if chest.exists() else None
if args.refresh_inventory or not (CACHE/'inventory.json').exists(): blender('inventory.py')
blender('build.py')
run(['pnpm','exec','node','--import','tsx',str(ROOT/'optimize.ts'),'--topic',topic])
blender('preview.py')
blender('report.py')
summary=json.loads((CACHE/f'{topic}-optimize-stats.json').read_text())
print(f"FINAL {topic}: {summary['bytes']:,} bytes, {summary['triangles']:,} triangles, {summary['nodeCount']} nodes, {summary['drawCalls']} draw calls",flush=True)
for path in json.loads((CACHE/f'{topic}-preview-backend.json').read_text())['paths']+[str(CACHE/f'{topic}-preview-pose.png')]: print('PREVIEW: '+path)
after=hashlib.sha256(chest.read_bytes()).hexdigest() if chest.exists() else None
if before and before!=after: raise RuntimeError(f'Chest byte regression: {before} != {after}')
if before:
    print('CHEST SHA256 before/after: '+before+' / '+after,flush=True)
    (CACHE/f'{topic}-chest-sha256.json').write_text(json.dumps(dict(before=before,after=after,identical=True),indent=2)+'\n')
