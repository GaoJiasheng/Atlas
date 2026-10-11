"""Offline orchestration; use --fallback only when Blender cannot start."""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / 'cache'
WORKSPACE = ROOT.parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--fallback', action='store_true', help='assimp + CPU Python path; native Blender gate remains pending')
args = parser.parse_args()


def run(command, check=True):
    print('RUN ' + ' '.join(command), flush=True)
    return subprocess.run(command, cwd=WORKSPACE, check=check)


def python(file):
    return [sys.executable, str(ROOT / file)]


def ts(file, *arguments):
    return ['pnpm', 'exec', 'node', '--import', 'tsx', str(ROOT / file), *map(str, arguments)]


def keep_original(job):
    positions, seen, remap = job['positions'], {}, []
    for i in range(0, len(positions), 3):
        key = tuple(positions[i:i+3])
        remap.append(seen.setdefault(key, i//3))
    return {'name': job['name'], 'indices': [remap[i] for i in job['indices']], 'error': 0}


for executable in ['pnpm', 'assimp' if args.fallback else 'blender']:
    if not shutil.which(executable):
        raise SystemExit(f'Missing requirement: {executable}')

if args.fallback:
    outputs = {'MuscularSystem100.fbx': 'muscles-raw.glb', 'SkeletalSystem100.fbx': 'skeleton-fallback.glb',
               'Regions of human body100.fbx': 'regions-fallback.glb', 'Joints100.fbx': 'joints-fallback.glb'}
    for source, output in outputs.items():
        run(['assimp', 'export', str(CACHE/source), str(CACHE/output), '-fglb2'])
    run(python('assimp_inventory.py'))
    run(python('fallback/selection.py'))
    run(python('fallback/candidates.py'))
    inputs = CACHE/'chest-simplify-probe-input.json'
    outputs_path = CACHE/'chest-simplify-probe-output.json'
    run(ts('simplify.ts', inputs, outputs_path))
    jobs = {j['name']: j for j in json.loads(inputs.read_text())}
    for attempt in range(6):
        run(python('fallback/build.py'))
        run(ts('optimize.ts'))
        stats_path = CACHE/'chest-report-stats.json'
        stats_path.unlink(missing_ok=True)
        review = run(python('fallback/review.py'), check=False)
        if review.returncode == 0:
            break
        if not stats_path.exists():
            raise SystemExit(f'Fallback review failed before recording surface data ({review.returncode})')
        stats = json.loads(stats_path.read_text())
        results = {r['name']: r for r in json.loads(outputs_path.read_text())}
        pending = []
        for row in stats:
            if row['sampledHausdorffM'] <= row['budgetM'] + 1e-6:
                continue
            source_names = ['sternum', 'ribs'] if row['name'] == 'thorax' else [row['name']]
            for name in source_names:
                job = jobs[name]
                retained = len(results[name]['indices']) / len(job['indices'])
                if attempt == 4 or retained >= .9:
                    results[name] = keep_original(job)
                else:
                    job['error'] *= min(.45, row['budgetM']*.65/row['sampledHausdorffM'])
                    pending.append(job)
        if not pending and all(r['sampledHausdorffM'] <= r['budgetM']+1e-6 for r in stats):
            raise SystemExit('Review failed on topology or rendering; see chest/report.md and the review log')
        if pending:
            retry_in, retry_out = CACHE/'chest-simplify-retry-input.json', CACHE/'chest-simplify-retry-output.json'
            retry_in.write_text(json.dumps(pending))
            run(ts('simplify.ts', retry_in, retry_out))
            results.update({r['name']: r for r in json.loads(retry_out.read_text())})
        outputs_path.write_text(json.dumps(list(results.values())))
    else:
        raise SystemExit('Surface gate did not pass after conservative retries')
    print('BACKEND: assimp import and CPU geometry/render fallback; native Blender/Cycles verification pending', flush=True)
else:
    for file in ['inventory.py', 'build.py']:
        run(['blender', '-b', '--python-exit-code', '1', '-P', str(ROOT/file)])
    run(ts('optimize.ts'))
    for file in ['chest/preview.py', 'report.py']:
        run(['blender', '-b', '--python-exit-code', '1', '-P', str(ROOT/file)])

summary = json.loads((CACHE/'chest-optimize-stats.json').read_text())
print(f"FINAL GLB: {summary['bytes']:,} bytes ({summary['bytes']/1e6:.3f} MB), {summary['triangles']:,} triangles")
print(f"NODE COUNT: {len(summary['nodes'])} meshes / {len(summary['nodes'])+12} total (11 joints + rig root)")
print('MESH NODES: ' + ', '.join(row['node'] for row in summary['nodes']))
for path in json.loads((CACHE/'chest-preview-paths.json').read_text()):
    print('PREVIEW: ' + path)

if not args.fallback:
    print('PREVIEW: ' + str(CACHE/'preview-pose.png'))
