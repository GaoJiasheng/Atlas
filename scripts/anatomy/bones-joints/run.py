"""Explicit topic-local offline pipeline. No downloads or application commands."""
import argparse
import subprocess
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--source-cache',type=Path,default=HERE.parent/'cache')
args=parser.parse_args()
for name in ['SkeletalSystem100.fbx','inventory.json']:
    if not (args.source_cache/name).is_file():
        parser.error(f'missing cached source: {args.source_cache/name}')
for command in [
    ['node',str(HERE/'build.mjs'),'--source-cache',str(args.source_cache)],
    ['node',str(HERE/'verify.mjs')],
    ['python3',str(HERE/'audit.py')],
    ['python3',str(HERE/'contacts.py')],
    ['node',str(HERE/'content.mjs')],
    ['python3',str(HERE/'preview.py')],
]:
    subprocess.run(command,cwd=ROOT,check=True)
